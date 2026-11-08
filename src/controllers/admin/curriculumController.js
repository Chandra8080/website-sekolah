import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitize, sanitizeText } from '../../utils/sanitize.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 10);
    const total = dbCount('curriculum');
    const curriculumList = dbFindMany('curriculum', {
      orderBy: { year: 'desc' },
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/curriculum/index', {
      pageTitle: 'Kelola Kurikulum Sekolah',
      curriculumList,
      pagination
    });
  } catch (error) {
    console.error('Curriculum index error:', error);
    req.flash('error', 'Gagal memuat kurikulum.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/curriculum/create', {
    pageTitle: 'Tambah Data Kurikulum',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { name, year, description, isActive } = req.body;

    if (!name || !year) {
      req.flash('error', 'Nama kurikulum dan tahun wajib diisi.');
      return res.redirect('/admin/curriculum/create');
    }

    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    dbCreate('curriculum', {
      data: {
        name: sanitizeText(name),
        year: sanitizeText(year),
        description: sanitize(description),
        fileUrl,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'CREATE_CURRICULUM',
      module: 'CURRICULUM',
      description: `Menambahkan kurikulum "${name}"`
    });

    req.flash('success', 'Kurikulum berhasil ditambahkan.');
    res.redirect('/admin/curriculum');
  } catch (error) {
    console.error('Curriculum store error:', error);
    req.flash('error', 'Gagal menyimpan kurikulum.');
    res.redirect('/admin/curriculum/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('curriculum', { where: { id } });

    if (!item) {
      req.flash('error', 'Kurikulum tidak ditemukan.');
      return res.redirect('/admin/curriculum');
    }

    res.render('admin/curriculum/edit', {
      pageTitle: `Edit: ${item.name}`,
      item
    });
  } catch (error) {
    console.error('Curriculum edit error:', error);
    req.flash('error', 'Gagal memuat kurikulum.');
    res.redirect('/admin/curriculum');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, year, description, isActive } = req.body;

    const current = dbFindUnique('curriculum', { where: { id } });
    if (!current) {
      req.flash('error', 'Kurikulum tidak ditemukan.');
      return res.redirect('/admin/curriculum');
    }

    let fileUrl = current.fileUrl;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    dbUpdate('curriculum', {
      where: { id },
      data: {
        name: sanitizeText(name),
        year: sanitizeText(year),
        description: sanitize(description),
        fileUrl,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_CURRICULUM',
      module: 'CURRICULUM',
      description: `Memperbarui kurikulum ID ${id}`
    });

    req.flash('success', 'Kurikulum berhasil diperbarui.');
    res.redirect('/admin/curriculum');
  } catch (error) {
    console.error('Curriculum update error:', error);
    req.flash('error', 'Gagal memperbarui kurikulum.');
    res.redirect(`/admin/curriculum/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('curriculum', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_CURRICULUM',
      module: 'CURRICULUM',
      description: `Menghapus kurikulum ID ${id}`
    });

    req.flash('success', 'Kurikulum berhasil dihapus.');
    res.redirect('/admin/curriculum');
  } catch (error) {
    console.error('Curriculum destroy error:', error);
    req.flash('error', 'Gagal menghapus kurikulum.');
    res.redirect('/admin/curriculum');
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
