import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/db.json');

// Initialize DB from file or empty
function loadDB() {
  if (!fs.existsSync(DB_PATH)) return null;
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB from file:', err.message);
    return null;
  }
}

function saveDB(data) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB to file:', err.message);
  }
}

function getDB() {
  let db = loadDB();
  if (!db) {
    db = initializeDB();
    saveDB(db);
  }
  return db;
}

function nextId(collection) {
  const db = getDB();
  const items = db[collection] || [];
  if (items.length === 0) return 1;
  const max = items.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0);
  return max + 1;
}

// Comparison helper for strings/dates/numbers
function compareValues(a, b) {
  if (a instanceof Date || b instanceof Date) {
    const at = a ? new Date(a).getTime() : 0;
    const bt = b ? new Date(b).getTime() : 0;
    return at < bt ? -1 : at > bt ? 1 : 0;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    const at = Date.parse(a);
    const bt = Date.parse(b);
    if (!isNaN(at) && !isNaN(bt) && (a.includes('-') || a.includes('T')) && (b.includes('-') || b.includes('T'))) {
      return at < bt ? -1 : at > bt ? 1 : 0;
    }
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

// Helper: match where clause (supports nested OR, AND, NOT, string/int equality, contains, gte, lte, etc.)
export function matchesWhere(item, where) {
  if (!where || Object.keys(where).length === 0) return true;
  for (const [key, val] of Object.entries(where)) {
    if (key === 'OR') {
      if (!Array.isArray(val) || !val.some(cond => matchesWhere(item, cond))) return false;
      continue;
    }
    if (key === 'AND') {
      if (!Array.isArray(val) || !val.every(cond => matchesWhere(item, cond))) return false;
      continue;
    }
    if (key === 'NOT') {
      if (matchesWhere(item, val)) return false;
      continue;
    }

    if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      // Handle operators: contains, startsWith, gt, gte, lt, lte, in, notIn, not, equals
      if ('contains' in val) {
        const v = String(item[key] ?? '').toLowerCase();
        if (!v.includes(String(val.contains).toLowerCase())) return false;
      }
      if ('startsWith' in val) {
        const v = String(item[key] ?? '').toLowerCase();
        if (!v.startsWith(String(val.startsWith).toLowerCase())) return false;
      }
      if ('in' in val) {
        if (!Array.isArray(val.in) || !val.in.includes(item[key])) return false;
      }
      if ('notIn' in val) {
        if (Array.isArray(val.notIn) && val.notIn.includes(item[key])) return false;
      }
      if ('gt' in val) {
        if (!(compareValues(item[key], val.gt) > 0)) return false;
      }
      if ('gte' in val) {
        if (!(compareValues(item[key], val.gte) >= 0)) return false;
      }
      if ('lt' in val) {
        if (!(compareValues(item[key], val.lt) < 0)) return false;
      }
      if ('lte' in val) {
        if (!(compareValues(item[key], val.lte) <= 0)) return false;
      }
      if ('not' in val) {
        if (val.not === null) {
          if (item[key] === null || item[key] === undefined) return false;
        } else if (item[key] === val.not) {
          return false;
        }
      }
      if ('equals' in val) {
        if (item[key] !== val.equals) return false;
      }
    } else {
      // Direct equality
      if (val === null) {
        if (item[key] !== null && item[key] !== undefined) return false;
      } else if (item[key] !== val) {
        // Fallback for number and string ID comparisons (e.g. 1 === "1")
        if (typeof item[key] === 'number' && typeof val === 'string' && !isNaN(Number(val)) && item[key] === Number(val)) {
          // match
        } else if (typeof item[key] === 'string' && typeof val === 'number' && !isNaN(Number(item[key])) && Number(item[key]) === val) {
          // match
        } else {
          return false;
        }
      }
    }
  }
  return true;
}

// Define known relations
function getRelation(key, parentCollection) {
  if (key === 'category') {
    if (parentCollection === 'galleries' || parentCollection === 'gallery') {
      return { collection: 'gallery_categories', foreignKey: 'categoryId', selfKey: true };
    }
    return { collection: 'news_categories', foreignKey: 'categoryId', selfKey: true };
  }
  const map = {
    role: { collection: 'roles', foreignKey: 'roleId', selfKey: true },
    children: { collection: 'menus', foreignKey: 'parentId', selfKey: false },
    parent: { collection: 'menus', foreignKey: 'parentId', selfKey: true },
    galleries: { collection: 'galleries', foreignKey: 'categoryId', selfKey: false },
    news: { collection: 'news', foreignKey: 'categoryId', selfKey: false },
    permissions: { collection: 'role_permissions', foreignKey: 'roleId', selfKey: false },
    activityLogs: { collection: 'activity_logs', foreignKey: 'userId', selfKey: false },
    user: { collection: 'users', foreignKey: 'userId', selfKey: true },
    users: { collection: 'users', foreignKey: 'roleId', selfKey: false }
  };
  return map[key] || null;
}

// Resolve include relations
function resolveIncludes(item, include, db, parentCollection = '') {
  const result = { ...item };
  for (const [key, val] of Object.entries(include)) {
    if (!val) continue;
    const rel = getRelation(key, parentCollection);
    if (!rel) continue;
    const { collection: relCol, foreignKey, selfKey } = rel;
    if (selfKey) {
      const fkVal = item[foreignKey];
      if (fkVal == null) {
        result[key] = null;
        continue;
      }
      result[key] = (db[relCol] || []).find(r => r.id === fkVal) || null;
    } else {
      const opts = typeof val === 'object' ? val : {};
      let related = (db[relCol] || []).filter(r => r[foreignKey] === item.id);
      if (opts.where) related = related.filter(r => matchesWhere(r, opts.where));
      if (opts.orderBy) {
        let orderEntries = [];
        if (Array.isArray(opts.orderBy)) {
          orderEntries = opts.orderBy.flatMap(o => Object.entries(o));
        } else if (typeof opts.orderBy === 'object') {
          orderEntries = Object.entries(opts.orderBy);
        }
        if (orderEntries.length > 0) {
          related.sort((a, b) => {
            for (const [sortKey, sortDir] of orderEntries) {
              const av = a[sortKey], bv = b[sortKey];
              if (av === bv) continue;
              if (av == null) return 1;
              if (bv == null) return -1;
              const cmp = compareValues(av, bv);
              return (sortDir === 'desc' || sortDir === 'DESC') ? -cmp : cmp;
            }
            return 0;
          });
        }
      }
      result[key] = related;
    }
  }
  return result;
}

// === Query helpers (Prisma-like API) ===

export function dbFindMany(collection, { where = {}, orderBy = {}, take, skip = 0, include, select } = {}) {
  const db = getDB();
  let items = [...(db[collection] || [])];

  // Filter
  items = items.filter(item => matchesWhere(item, where));

  // Sort
  if (orderBy) {
    let orderEntries = [];
    if (Array.isArray(orderBy)) {
      orderEntries = orderBy.flatMap(o => Object.entries(o));
    } else if (typeof orderBy === 'object') {
      orderEntries = Object.entries(orderBy);
    }
    if (orderEntries.length > 0) {
      items.sort((a, b) => {
        for (const [key, dir] of orderEntries) {
          const av = a[key], bv = b[key];
          if (av === bv) continue;
          if (av == null) return 1;
          if (bv == null) return -1;
          const cmp = compareValues(av, bv);
          return (dir === 'desc' || dir === 'DESC') ? -cmp : cmp;
        }
        return 0;
      });
    }
  }

  // Pagination
  if (skip) items = items.slice(skip);
  if (take !== undefined && take !== null) items = items.slice(0, take);

  // Include relations
  if (include) {
    items = items.map(item => resolveIncludes(item, include, db, collection));
  }

  // Select specific fields if requested
  if (select && typeof select === 'object') {
    items = items.map(item => {
      const selected = {};
      for (const [k, v] of Object.entries(select)) {
        if (v) selected[k] = item[k];
      }
      return selected;
    });
  }

  return items;
}

export function dbFindFirst(collection, { where = {}, orderBy = {}, include, select } = {}) {
  const results = dbFindMany(collection, { where, orderBy, take: 1, include, select });
  return results[0] || null;
}

export function dbFindUnique(collection, { where = {}, include } = {}) {
  const db = getDB();
  const items = db[collection] || [];
  const found = items.find(item => matchesWhere(item, where)) || null;
  if (!found) return null;
  if (include) return resolveIncludes(found, include, db, collection);
  return { ...found };
}

export function dbCreate(collection, { data = {} } = {}) {
  const db = getDB();
  if (!db[collection]) db[collection] = [];
  const now = new Date().toISOString();
  const newItem = {
    id: data.id !== undefined ? data.id : nextId(collection),
    ...data,
    createdAt: data.createdAt ? (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt) : now,
    updatedAt: data.updatedAt ? (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt) : now
  };
  db[collection].push(newItem);
  saveDB(db);
  return { ...newItem };
}

export function dbUpdate(collection, { where = {}, data = {} } = {}) {
  const db = getDB();
  const items = db[collection] || [];
  let updated = null;
  const now = new Date().toISOString();
  db[collection] = items.map(item => {
    if (!updated && matchesWhere(item, where)) {
      updated = {
        ...item,
        ...data,
        updatedAt: data.updatedAt ? (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt) : now
      };
      return updated;
    }
    return item;
  });
  saveDB(db);
  return updated ? { ...updated } : null;
}

export function dbDelete(collection, { where = {} } = {}) {
  const db = getDB();
  const items = db[collection] || [];
  let deleted = null;
  db[collection] = items.filter(item => {
    if (!deleted && matchesWhere(item, where)) {
      deleted = item;
      return false;
    }
    return true;
  });
  saveDB(db);
  return deleted ? { ...deleted } : null;
}

export function dbCount(collection, { where = {} } = {}) {
  const db = getDB();
  const items = db[collection] || [];
  if (!where || Object.keys(where).length === 0) return items.length;
  return items.filter(item => matchesWhere(item, where)).length;
}

export function dbUpsert(collection, { where = {}, create = {}, update = {} } = {}) {
  const existing = dbFindUnique(collection, { where });
  if (existing) {
    return dbUpdate(collection, { where, data: update });
  }
  return dbCreate(collection, { data: create });
}

export function dbDeleteMany(collection, { where = {} } = {}) {
  const db = getDB();
  const items = db[collection] || [];
  let count = 0;
  db[collection] = items.filter(item => {
    if (matchesWhere(item, where)) {
      count++;
      return false;
    }
    return true;
  });
  saveDB(db);
  return { count };
}

export function dbUpdateMany(collection, { where = {}, data = {} } = {}) {
  const db = getDB();
  const items = db[collection] || [];
  let count = 0;
  const now = new Date().toISOString();
  db[collection] = items.map(item => {
    if (matchesWhere(item, where)) {
      count++;
      return {
        ...item,
        ...data,
        updatedAt: data.updatedAt ? (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt) : now
      };
    }
    return item;
  });
  saveDB(db);
  return { count };
}

// Model mapping for Prisma-like proxy access
const collectionAliases = {
  user: 'users',
  users: 'users',
  role: 'roles',
  roles: 'roles',
  permission: 'permissions',
  permissions: 'permissions',
  rolePermission: 'role_permissions',
  rolePermissions: 'role_permissions',
  role_permissions: 'role_permissions',
  schoolSetting: 'school_settings',
  schoolSettings: 'school_settings',
  school_settings: 'school_settings',
  menu: 'menus',
  menus: 'menus',
  homepageSection: 'homepage_sections',
  homepageSections: 'homepage_sections',
  homepage_sections: 'homepage_sections',
  teacher: 'teachers',
  teachers: 'teachers',
  staff: 'staff',
  organizationalStructure: 'organizational_structures',
  organizationalStructures: 'organizational_structures',
  organizational_structures: 'organizational_structures',
  program: 'programs',
  programs: 'programs',
  curriculum: 'curriculum',
  academicCalendar: 'academic_calendars',
  academicCalendars: 'academic_calendars',
  academic_calendars: 'academic_calendars',
  extracurricular: 'extracurriculars',
  extracurriculars: 'extracurriculars',
  facility: 'facilities',
  facilities: 'facilities',
  newsCategory: 'news_categories',
  newsCategories: 'news_categories',
  news_categories: 'news_categories',
  news: 'news',
  announcement: 'announcements',
  announcements: 'announcements',
  event: 'events',
  events: 'events',
  achievement: 'achievements',
  achievements: 'achievements',
  galleryCategory: 'gallery_categories',
  galleryCategories: 'gallery_categories',
  gallery_categories: 'gallery_categories',
  gallery: 'galleries',
  galleries: 'galleries',
  media: 'media',
  ppdbSetting: 'ppdb_settings',
  ppdbSettings: 'ppdb_settings',
  ppdb_settings: 'ppdb_settings',
  ppdbRequirement: 'ppdb_requirements',
  ppdbRequirements: 'ppdb_requirements',
  ppdb_requirements: 'ppdb_requirements',
  ppdbApplicant: 'ppdb_applicants',
  ppdbApplicants: 'ppdb_applicants',
  ppdb_applicants: 'ppdb_applicants',
  contactMessage: 'contact_messages',
  contactMessages: 'contact_messages',
  contact_messages: 'contact_messages',
  socialMedia: 'social_media',
  social_media: 'social_media',
  activityLog: 'activity_logs',
  activityLogs: 'activity_logs',
  activity_logs: 'activity_logs',
};

function createCollectionAccessor(col) {
  return {
    findMany: (opts) => dbFindMany(col, opts),
    findFirst: (opts) => dbFindFirst(col, opts),
    findUnique: (opts) => dbFindUnique(col, opts),
    create: (opts) => dbCreate(col, opts),
    update: (opts) => dbUpdate(col, opts),
    delete: (opts) => dbDelete(col, opts),
    count: (opts) => dbCount(col, opts),
    upsert: (opts) => dbUpsert(col, opts),
    deleteMany: (opts) => dbDeleteMany(col, opts),
    updateMany: (opts) => dbUpdateMany(col, opts)
  };
}

const baseDB = {
  findMany: dbFindMany,
  findFirst: dbFindFirst,
  findUnique: dbFindUnique,
  create: dbCreate,
  update: dbUpdate,
  delete: dbDelete,
  count: dbCount,
  upsert: dbUpsert,
  deleteMany: dbDeleteMany,
  updateMany: dbUpdateMany,
  getDB,
  saveDB,
  $transaction: async (actions) => {
    if (Array.isArray(actions)) return Promise.all(actions);
    if (typeof actions === 'function') return actions(dbProxy);
    return null;
  }
};

const dbProxy = new Proxy(baseDB, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (typeof prop === 'string') {
      const col = collectionAliases[prop] || prop;
      return createCollectionAccessor(col);
    }
    return undefined;
  }
});

// Initialize with seed data structure
function initializeDB() {
  return {
    users: [],
    roles: [],
    permissions: [],
    role_permissions: [],
    school_settings: [],
    menus: [],
    homepage_sections: [],
    teachers: [],
    staff: [],
    organizational_structures: [],
    programs: [],
    curriculum: [],
    academic_calendars: [],
    extracurriculars: [],
    facilities: [],
    news_categories: [],
    news: [],
    announcements: [],
    events: [],
    achievements: [],
    gallery_categories: [],
    galleries: [],
    media: [],
    ppdb_settings: [],
    ppdb_requirements: [],
    ppdb_applicants: [],
    contact_messages: [],
    social_media: [],
    activity_logs: []
  };
}

export default dbProxy;
