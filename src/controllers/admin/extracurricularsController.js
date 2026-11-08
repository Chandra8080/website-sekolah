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
        { category: { contains: search } },
        { teacher: { contains: search } }
      ];
    }

    const total = dbCount('extracurriculars', { where });
    const extracurriculars = dbFindMany('extracurriculars', {
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/extracurriculars/index', {
      pageTitle: 'Kelola Ekstrakurikuler',
      extracurriculars,
      pagination,
      search
    });
  } catch (error) {
    console.error('Extracurriculars index error:', error);
    req.flash('error', 'Gagal memuat ekstrakurikuler.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/extracurriculars/create', {
    pageTitle: 'Tambah Ekstrakurikuler Baru',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { name, category, description, schedule, teacher, sortOrder, isActive } = req.body;

    if (!name) {
      req.flash('error', 'Nama ekstrakurikuler wajib diisi.');
      return res.redirect('/admin/extracurriculars/create');
    }

    let slug = createSlug(name);
    const existing = dbFindUnique('extracurriculars', { where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    dbCreate('extracurriculars', {
      data: {
        name: sanitizeText(name),
        slug,
        category: sanitizeText(category) || 'Bakat & Minat',
        description: sanitize(description),
        schedule: sanitizeText(schedule) || null,
        teacher: sanitizeText(teacher) || null,
        imageUrl,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'CREATE_EXTRACURRICULAR',
      module: 'EXTRACURRICULARS',
      description: `Menambahkan ekstrakurikuler "${name}"`
    });

    req.flash('success', 'Ekstrakurikuler berhasil ditambahkan.');
    res.redirect('/admin/extracurriculars');
  } catch (error) {
    console.error('Extracurricular store error:', error);
    req.flash('error', 'Gagal menyimpan ekstrakurikuler.');
    res.redirect('/admin/extracurriculars/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('extracurriculars', { where: { id } });

    if (!item) {
      req.flash('error', 'Ekstrakurikuler tidak ditemukan.');
      return res.redirect('/admin/extracurriculars');
    }

    res.render('admin/extracurriculars/edit', {
      pageTitle: `Edit: ${item.name}`,
      item
    });
  } catch (error) {
    console.error('Extracurricular edit error:', error);
    req.flash('error', 'Gagal memuat data ekstrakurikuler.');
    res.redirect('/admin/extracurriculars');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, category, description, schedule, teacher, sortOrder, isActive } = req.body;

    const current = dbFindUnique('extracurriculars', { where: { id } });
    if (!current) {
      req.flash('error', 'Ekstrakurikuler tidak ditemukan.');
      return res.redirect('/admin/extracurriculars');
    }

    let imageUrl = current.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    dbUpdate('extracurriculars', {
      where: { id },
      data: {
        name: sanitizeText(name),
        category: sanitizeText(category) || 'Bakat & Minat',
        description: sanitize(description),
        schedule: sanitizeText(schedule) || null,
        teacher: sanitizeText(teacher) || null,
        imageUrl,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_EXTRACURRICULAR',
      module: 'EXTRACURRICULARS',
      description: `Memperbarui ekstrakurikuler ID ${id}`
    });

    req.flash('success', 'Ekstrakurikuler berhasil diperbarui.');
    res.redirect('/admin/extracurriculars');
  } catch (error) {
    console.error('Extracurricular update error:', error);
    req.flash('error', 'Gagal memperbarui ekstrakurikuler.');
    res.redirect(`/admin/extracurriculars/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('extracurriculars', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_EXTRACURRICULAR',
      module: 'EXTRACURRICULARS',
      description: `Menghapus ekstrakurikuler ID ${id}`
    });

    req.flash('success', 'Ekstrakurikuler berhasil dihapus.');
    res.redirect('/admin/extracurriculars');
  } catch (error) {
    console.error('Extracurricular destroy error:', error);
    req.flash('error', 'Gagal menghapus ekstrakurikuler.');
    res.redirect('/admin/extracurriculars');
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
