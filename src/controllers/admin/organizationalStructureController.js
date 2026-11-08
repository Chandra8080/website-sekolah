import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete } from '../../config/database.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const structures = dbFindMany('organizational_structures', {
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }]
    });

    res.render('admin/org-structure/index', {
      pageTitle: 'Struktur Organisasi',
      structures
    });
  } catch (error) {
    console.error('Org structure error:', error);
    req.flash('error', 'Gagal memuat struktur organisasi.');
    res.redirect('/admin');
  }
};

export const create = async (req, res) => {
  try {
    const parentList = dbFindMany('organizational_structures', {
      orderBy: [{ level: 'asc' }, { name: 'asc' }]
    });

    res.render('admin/org-structure/create', {
      pageTitle: 'Tambah Pejabat Struktur Organisasi',
      parentList,
      item: {}
    });
  } catch (error) {
    console.error('Org structure create error:', error);
    req.flash('error', 'Gagal memuat formulir.');
    res.redirect('/admin/org-structure');
  }
};

export const store = async (req, res) => {
  try {
    const { name, position, parentId, level, sortOrder, isActive } = req.body;

    if (!name || !position) {
      req.flash('error', 'Nama dan jabatan wajib diisi.');
      return res.redirect('/admin/org-structure/create');
    }

    let photo = null;
    if (req.file) {
      photo = `/uploads/teachers/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    dbCreate('organizational_structures', {
      data: {
        name: sanitizeText(name),
        position: sanitizeText(position),
        parentId: parentId ? parseInt(parentId, 10) : null,
        level: parseInt(level, 10) || 0,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active,
        photo
      }
    });

    await logActivity({
      req,
      action: 'CREATE_ORG_STRUCTURE',
      module: 'ORG_STRUCTURE',
      description: `Menambahkan struktur organisasi "${name}" (${position})`
    });

    req.flash('success', 'Struktur organisasi berhasil ditambahkan.');
    res.redirect('/admin/org-structure');
  } catch (error) {
    console.error('Org structure store error:', error);
    req.flash('error', 'Gagal menyimpan struktur organisasi.');
    res.redirect('/admin/org-structure/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('organizational_structures', { where: { id } });
    const allParents = dbFindMany('organizational_structures', {
      orderBy: [{ level: 'asc' }, { name: 'asc' }]
    });
    const parentList = allParents.filter(p => p.id !== id);

    if (!item) {
      req.flash('error', 'Data tidak ditemukan.');
      return res.redirect('/admin/org-structure');
    }

    res.render('admin/org-structure/edit', {
      pageTitle: `Edit: ${item.name}`,
      item,
      parentList
    });
  } catch (error) {
    console.error('Org structure edit error:', error);
    req.flash('error', 'Gagal memuat data.');
    res.redirect('/admin/org-structure');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, position, parentId, level, sortOrder, isActive } = req.body;

    const current = dbFindUnique('organizational_structures', { where: { id } });
    if (!current) {
      req.flash('error', 'Data tidak ditemukan.');
      return res.redirect('/admin/org-structure');
    }

    let photo = current.photo;
    if (req.file) {
      photo = `/uploads/teachers/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    dbUpdate('organizational_structures', {
      where: { id },
      data: {
        name: sanitizeText(name),
        position: sanitizeText(position),
        parentId: parentId ? parseInt(parentId, 10) : null,
        level: parseInt(level, 10) || 0,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active,
        photo
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_ORG_STRUCTURE',
      module: 'ORG_STRUCTURE',
      description: `Memperbarui struktur organisasi ID ${id}`
    });

    req.flash('success', 'Struktur organisasi berhasil diperbarui.');
    res.redirect('/admin/org-structure');
  } catch (error) {
    console.error('Org structure update error:', error);
    req.flash('error', 'Gagal memperbarui data.');
    res.redirect(`/admin/org-structure/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('organizational_structures', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_ORG_STRUCTURE',
      module: 'ORG_STRUCTURE',
      description: `Menghapus struktur organisasi ID ${id}`
    });

    req.flash('success', 'Data berhasil dihapus.');
    res.redirect('/admin/org-structure');
  } catch (error) {
    console.error('Org structure destroy error:', error);
    req.flash('error', 'Gagal menghapus data.');
    res.redirect('/admin/org-structure');
  }
};

export default {
  index,
  create,
  store,
  edit,
  update,
  destroy
};
