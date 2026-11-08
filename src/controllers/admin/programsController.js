import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitize, sanitizeText } from '../../utils/sanitize.js';
import { createSlug } from '../../utils/slugify.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 10);
    const total = dbCount('programs');
    const programs = dbFindMany('programs', {
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/programs/index', {
      pageTitle: 'Kelola Program Pendidikan',
      programs,
      pagination
    });
  } catch (error) {
    console.error('Programs index error:', error);
    req.flash('error', 'Gagal memuat program pendidikan.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/programs/create', {
    pageTitle: 'Tambah Program Baru',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { name, duration, description, sortOrder, isActive } = req.body;

    if (!name) {
      req.flash('error', 'Nama program pendidikan wajib diisi.');
      return res.redirect('/admin/programs/create');
    }

    let slug = createSlug(name);
    const existing = dbFindUnique('programs', { where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    dbCreate('programs', {
      data: {
        name: sanitizeText(name),
        slug,
        duration: sanitizeText(duration) || '3 Tahun',
        description: sanitize(description),
        imageUrl,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'CREATE_PROGRAM',
      module: 'PROGRAMS',
      description: `Menambahkan program pendidikan "${name}"`
    });

    req.flash('success', 'Program pendidikan berhasil ditambahkan.');
    res.redirect('/admin/programs');
  } catch (error) {
    console.error('Program store error:', error);
    req.flash('error', 'Gagal menyimpan program.');
    res.redirect('/admin/programs/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('programs', { where: { id } });

    if (!item) {
      req.flash('error', 'Program tidak ditemukan.');
      return res.redirect('/admin/programs');
    }

    res.render('admin/programs/edit', {
      pageTitle: `Edit: ${item.name}`,
      item
    });
  } catch (error) {
    console.error('Program edit error:', error);
    req.flash('error', 'Gagal memuat program.');
    res.redirect('/admin/programs');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, duration, description, sortOrder, isActive } = req.body;

    const current = dbFindUnique('programs', { where: { id } });
    if (!current) {
      req.flash('error', 'Program tidak ditemukan.');
      return res.redirect('/admin/programs');
    }

    let imageUrl = current.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    dbUpdate('programs', {
      where: { id },
      data: {
        name: sanitizeText(name),
        duration: sanitizeText(duration) || '3 Tahun',
        description: sanitize(description),
        imageUrl,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_PROGRAM',
      module: 'PROGRAMS',
      description: `Memperbarui program ID ${id}`
    });

    req.flash('success', 'Program pendidikan berhasil diperbarui.');
    res.redirect('/admin/programs');
  } catch (error) {
    console.error('Program update error:', error);
    req.flash('error', 'Gagal memperbarui program.');
    res.redirect(`/admin/programs/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('programs', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_PROGRAM',
      module: 'PROGRAMS',
      description: `Menghapus program ID ${id}`
    });

    req.flash('success', 'Program pendidikan berhasil dihapus.');
    res.redirect('/admin/programs');
  } catch (error) {
    console.error('Program destroy error:', error);
    req.flash('error', 'Gagal menghapus program.');
    res.redirect('/admin/programs');
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
