import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount, dbUpsert } from '../../config/database.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const getApplicants = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 15);
    const search = req.query.search ? req.query.search.trim() : '';
    const status = req.query.status ? req.query.status.trim() : '';

    const where = {};
    if (search) {
      where.OR = [
        { registrationNo: { contains: search } },
        { fullName: { contains: search } },
        { parentPhone: { contains: search } },
        { originSchool: { contains: search } }
      ];
    }
    if (status) {
      where.status = status;
    }

    const total = dbCount('ppdb_applicants', { where });
    const applicants = dbFindMany('ppdb_applicants', {
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/ppdb/index', {
      pageTitle: 'Pendaftar PPDB Online',
      applicants,
      pagination,
      search,
      status
    });
  } catch (error) {
    console.error('PPDB applicants error:', error);
    req.flash('error', 'Gagal memuat data pendaftar.');
    res.redirect('/admin');
  }
};

export const getApplicant = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const applicant = dbFindUnique('ppdb_applicants', { where: { id } });

    if (!applicant) {
      req.flash('error', 'Data pendaftar tidak ditemukan.');
      return res.redirect('/admin/ppdb');
    }

    res.render('admin/ppdb/detail', {
      pageTitle: `Detail Pendaftar: ${applicant.registrationNo}`,
      applicant
    });
  } catch (error) {
    console.error('PPDB detail error:', error);
    req.flash('error', 'Gagal memuat detail pendaftar.');
    res.redirect('/admin/ppdb');
  }
};

export const postUpdateStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, notes } = req.body;

    const applicant = dbFindUnique('ppdb_applicants', { where: { id } });
    if (!applicant) {
      req.flash('error', 'Pendaftar tidak ditemukan.');
      return res.redirect('/admin/ppdb');
    }

    dbUpdate('ppdb_applicants', {
      where: { id },
      data: {
        status,
        notes: sanitizeText(notes) || null
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_PPDB_STATUS',
      module: 'PPDB',
      description: `Mengubah status pendaftar ${applicant.registrationNo} menjadi ${status}`
    });

    req.flash('success', `Status pendaftar berhasil diubah menjadi "${status.toUpperCase()}".`);
    res.redirect(`/admin/ppdb/${id}`);
  } catch (error) {
    console.error('PPDB update status error:', error);
    req.flash('error', 'Gagal memperbarui status pendaftar.');
    res.redirect('/admin/ppdb');
  }
};

export const destroyApplicant = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const applicant = dbFindUnique('ppdb_applicants', { where: { id } });

    if (applicant) {
      dbDelete('ppdb_applicants', { where: { id } });
      await logActivity({
        req,
        action: 'DELETE_PPDB_APPLICANT',
        module: 'PPDB',
        description: `Menghapus pendaftar ${applicant.registrationNo} (${applicant.fullName})`
      });
      req.flash('success', 'Data pendaftar berhasil dihapus.');
    }

    res.redirect('/admin/ppdb');
  } catch (error) {
    console.error('PPDB destroy error:', error);
    req.flash('error', 'Gagal menghapus data.');
    res.redirect('/admin/ppdb');
  }
};

export const getSettings = async (req, res) => {
  try {
    const settingsList = dbFindMany('ppdb_settings');
    const requirements = dbFindMany('ppdb_requirements', { orderBy: { sortOrder: 'asc' } });

    const settingsMap = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.render('admin/ppdb/settings', {
      pageTitle: 'Pengaturan PPDB',
      settings: settingsMap,
      requirements
    });
  } catch (error) {
    console.error('PPDB getSettings error:', error);
    req.flash('error', 'Gagal memuat pengaturan PPDB.');
    res.redirect('/admin/ppdb');
  }
};

export const postSettings = async (req, res) => {
  try {
    const data = req.body;
    const allowedKeys = ['ppdb_status', 'ppdb_year', 'ppdb_quota', 'ppdb_start_date', 'ppdb_end_date', 'ppdb_announcement_date', 'ppdb_info'];

    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        dbUpsert('ppdb_settings', {
          where: { key },
          update: { value: String(data[key]).trim() },
          create: { key, value: String(data[key]).trim(), label: key.replace(/_/g, ' ') }
        });
      }
    }

    await logActivity({
      req,
      action: 'UPDATE_PPDB_SETTINGS',
      module: 'PPDB',
      description: 'Memperbarui konfigurasi jadwal dan kuota PPDB'
    });

    req.flash('success', 'Pengaturan PPDB berhasil disimpan.');
    res.redirect('/admin/ppdb/settings');
  } catch (error) {
    console.error('PPDB postSettings error:', error);
    req.flash('error', 'Gagal menyimpan pengaturan.');
    res.redirect('/admin/ppdb/settings');
  }
};

export const storeRequirement = async (req, res) => {
  try {
    const { title, description, isRequired, sortOrder } = req.body;
    if (!title) {
      req.flash('error', 'Judul syarat pendaftaran wajib diisi.');
      return res.redirect('/admin/ppdb/settings');
    }

    dbCreate('ppdb_requirements', {
      data: {
        title: sanitizeText(title),
        description: sanitizeText(description) || null,
        isRequired: isRequired === 'true' || isRequired === 'on' || isRequired === true,
        sortOrder: parseInt(sortOrder, 10) || 0
      }
    });

    req.flash('success', 'Persyaratan PPDB berhasil ditambahkan.');
    res.redirect('/admin/ppdb/settings');
  } catch (error) {
    console.error('PPDB store req error:', error);
    req.flash('error', 'Gagal menambahkan persyaratan.');
    res.redirect('/admin/ppdb/settings');
  }
};

export const destroyRequirement = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('ppdb_requirements', { where: { id } });
    req.flash('success', 'Persyaratan berhasil dihapus.');
    res.redirect('/admin/ppdb/settings');
  } catch (error) {
    console.error('PPDB destroy req error:', error);
    req.flash('error', 'Gagal menghapus persyaratan.');
    res.redirect('/admin/ppdb/settings');
  }
};

export default {
  getApplicants,
  getApplicant,
  postUpdateStatus,
  destroyApplicant,
  getSettings,
  postSettings,
  storeRequirement,
  destroyRequirement
};
