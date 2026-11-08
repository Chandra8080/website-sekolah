import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitize, sanitizeText } from '../../utils/sanitize.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 12);
    const category = req.query.category || '';
    const level = req.query.level || '';
    const search = req.query.search ? req.query.search.trim() : '';

    const where = {};
    if (category) where.category = category;
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const total = dbCount('achievements', { where });
    const achievements = dbFindMany('achievements', {
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/achievements/index', {
      pageTitle: 'Kelola Prestasi Siswa & Guru',
      achievements,
      pagination,
      category,
      level,
      search
    });
  } catch (error) {
    console.error('Achievements index error:', error);
    req.flash('error', 'Gagal memuat prestasi.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/achievements/create', {
    pageTitle: 'Tambah Prestasi Baru',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { title, description, category, level, year, date, sortOrder, isPublished } = req.body;

    if (!title) {
      req.flash('error', 'Judul prestasi wajib diisi.');
      return res.redirect('/admin/achievements/create');
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/achievements/${req.file.filename}`;
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true || isPublished === undefined;

    dbCreate('achievements', {
      data: {
        title: sanitizeText(title),
        description: sanitize(description),
        category: category || 'akademik',
        level: level || 'nasional',
        year: year ? String(year).trim() : new Date().getFullYear().toString(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        sortOrder: parseInt(sortOrder, 10) || 0,
        isPublished: published,
        imageUrl
      }
    });

    await logActivity({
      req,
      action: 'CREATE_ACHIEVEMENT',
      module: 'ACHIEVEMENTS',
      description: `Menambahkan prestasi "${title}"`
    });

    req.flash('success', 'Data prestasi berhasil ditambahkan.');
    res.redirect('/admin/achievements');
  } catch (error) {
    console.error('Achievement store error:', error);
    req.flash('error', 'Gagal menyimpan prestasi.');
    res.redirect('/admin/achievements/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('achievements', { where: { id } });

    if (!item) {
      req.flash('error', 'Data prestasi tidak ditemukan.');
      return res.redirect('/admin/achievements');
    }

    res.render('admin/achievements/edit', {
      pageTitle: `Edit: ${item.title}`,
      item
    });
  } catch (error) {
    console.error('Achievement edit error:', error);
    req.flash('error', 'Gagal memuat prestasi.');
    res.redirect('/admin/achievements');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, category, level, year, date, sortOrder, isPublished } = req.body;

    const current = dbFindUnique('achievements', { where: { id } });
    if (!current) {
      req.flash('error', 'Prestasi tidak ditemukan.');
      return res.redirect('/admin/achievements');
    }

    let imageUrl = current.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/achievements/${req.file.filename}`;
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true;

    dbUpdate('achievements', {
      where: { id },
      data: {
        title: sanitizeText(title),
        description: sanitize(description),
        category: category || 'akademik',
        level: level || 'nasional',
        year: year ? String(year).trim() : null,
        date: date ? new Date(date).toISOString() : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isPublished: published,
        imageUrl
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_ACHIEVEMENT',
      module: 'ACHIEVEMENTS',
      description: `Memperbarui prestasi ID ${id}`
    });

    req.flash('success', 'Data prestasi berhasil diperbarui.');
    res.redirect('/admin/achievements');
  } catch (error) {
    console.error('Achievement update error:', error);
    req.flash('error', 'Gagal memperbarui prestasi.');
    res.redirect(`/admin/achievements/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('achievements', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_ACHIEVEMENT',
      module: 'ACHIEVEMENTS',
      description: `Menghapus prestasi ID ${id}`
    });

    req.flash('success', 'Prestasi berhasil dihapus.');
    res.redirect('/admin/achievements');
  } catch (error) {
    console.error('Achievement destroy error:', error);
    req.flash('error', 'Gagal menghapus prestasi.');
    res.redirect('/admin/achievements');
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
