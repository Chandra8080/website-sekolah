import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitize, sanitizeText } from '../../utils/sanitize.js';
import { createSlug } from '../../utils/slugify.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 12);
    const search = req.query.search ? req.query.search.trim() : '';

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } }
      ];
    }

    const total = dbCount('facilities', { where });
    const facilities = dbFindMany('facilities', {
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/facilities/index', {
      pageTitle: 'Kelola Sarana & Fasilitas',
      facilities,
      pagination,
      search
    });
  } catch (error) {
    console.error('Facilities index error:', error);
    req.flash('error', 'Gagal memuat fasilitas.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/facilities/create', {
    pageTitle: 'Tambah Fasilitas Baru',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { name, description, category, sortOrder, isActive } = req.body;

    if (!name) {
      req.flash('error', 'Nama fasilitas wajib diisi.');
      return res.redirect('/admin/facilities/create');
    }

    let slug = createSlug(name);
    const existing = dbFindUnique('facilities', { where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/facilities/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    dbCreate('facilities', {
      data: {
        name: sanitizeText(name),
        slug,
        description: sanitize(description),
        category: sanitizeText(category) || 'Fasilitas Pembelajaran',
        imageUrl,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'CREATE_FACILITY',
      module: 'FACILITIES',
      description: `Menambahkan fasilitas "${name}"`
    });

    req.flash('success', 'Fasilitas berhasil ditambahkan.');
    res.redirect('/admin/facilities');
  } catch (error) {
    console.error('Facility store error:', error);
    req.flash('error', 'Gagal menyimpan fasilitas.');
    res.redirect('/admin/facilities/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('facilities', { where: { id } });

    if (!item) {
      req.flash('error', 'Fasilitas tidak ditemukan.');
      return res.redirect('/admin/facilities');
    }

    res.render('admin/facilities/edit', {
      pageTitle: `Edit: ${item.name}`,
      item
    });
  } catch (error) {
    console.error('Facility edit error:', error);
    req.flash('error', 'Gagal memuat fasilitas.');
    res.redirect('/admin/facilities');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, category, sortOrder, isActive } = req.body;

    const current = dbFindUnique('facilities', { where: { id } });
    if (!current) {
      req.flash('error', 'Fasilitas tidak ditemukan.');
      return res.redirect('/admin/facilities');
    }

    let imageUrl = current.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/facilities/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    dbUpdate('facilities', {
      where: { id },
      data: {
        name: sanitizeText(name),
        description: sanitize(description),
        category: sanitizeText(category) || 'Fasilitas Pembelajaran',
        imageUrl,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_FACILITY',
      module: 'FACILITIES',
      description: `Memperbarui fasilitas ID ${id}`
    });

    req.flash('success', 'Fasilitas berhasil diperbarui.');
    res.redirect('/admin/facilities');
  } catch (error) {
    console.error('Facility update error:', error);
    req.flash('error', 'Gagal memperbarui fasilitas.');
    res.redirect(`/admin/facilities/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('facilities', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_FACILITY',
      module: 'FACILITIES',
      description: `Menghapus fasilitas ID ${id}`
    });

    req.flash('success', 'Fasilitas berhasil dihapus.');
    res.redirect('/admin/facilities');
  } catch (error) {
    console.error('Facility destroy error:', error);
    req.flash('error', 'Gagal menghapus fasilitas.');
    res.redirect('/admin/facilities');
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
