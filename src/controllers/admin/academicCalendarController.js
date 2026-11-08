import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitize, sanitizeText } from '../../utils/sanitize.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 15);
    const total = dbCount('academic_calendars');
    const events = dbFindMany('academic_calendars', {
      orderBy: { startDate: 'asc' },
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/academic-calendar/index', {
      pageTitle: 'Kalender Akademik',
      events,
      pagination
    });
  } catch (error) {
    console.error('Academic calendar error:', error);
    req.flash('error', 'Gagal memuat kalender akademik.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/academic-calendar/create', {
    pageTitle: 'Tambah Agenda Akademik',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { title, startDate, endDate, description, type, color, isPublished } = req.body;

    if (!title || !startDate) {
      req.flash('error', 'Judul agenda dan tanggal mulai wajib diisi.');
      return res.redirect('/admin/academic-calendar/create');
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true || isPublished === undefined;

    dbCreate('academic_calendars', {
      data: {
        title: sanitizeText(title),
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        description: sanitize(description),
        type: type || 'event',
        color: color || '#1a3a6b',
        isPublished: published
      }
    });

    await logActivity({
      req,
      action: 'CREATE_CALENDAR_EVENT',
      module: 'ACADEMIC_CALENDAR',
      description: `Menambahkan agenda akademik "${title}"`
    });

    req.flash('success', 'Agenda akademik berhasil ditambahkan.');
    res.redirect('/admin/academic-calendar');
  } catch (error) {
    console.error('Calendar store error:', error);
    req.flash('error', 'Gagal menyimpan agenda.');
    res.redirect('/admin/academic-calendar/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('academic_calendars', { where: { id } });

    if (!item) {
      req.flash('error', 'Agenda tidak ditemukan.');
      return res.redirect('/admin/academic-calendar');
    }

    res.render('admin/academic-calendar/edit', {
      pageTitle: `Edit: ${item.title}`,
      item
    });
  } catch (error) {
    console.error('Calendar edit error:', error);
    req.flash('error', 'Gagal memuat agenda.');
    res.redirect('/admin/academic-calendar');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, startDate, endDate, description, type, color, isPublished } = req.body;

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true;

    dbUpdate('academic_calendars', {
      where: { id },
      data: {
        title: sanitizeText(title),
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        description: sanitize(description),
        type: type || 'event',
        color: color || '#1a3a6b',
        isPublished: published
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_CALENDAR_EVENT',
      module: 'ACADEMIC_CALENDAR',
      description: `Memperbarui agenda kalender ID ${id}`
    });

    req.flash('success', 'Agenda kalender berhasil diperbarui.');
    res.redirect('/admin/academic-calendar');
  } catch (error) {
    console.error('Calendar update error:', error);
    req.flash('error', 'Gagal memperbarui agenda.');
    res.redirect(`/admin/academic-calendar/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('academic_calendars', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_CALENDAR_EVENT',
      module: 'ACADEMIC_CALENDAR',
      description: `Menghapus agenda akademik ID ${id}`
    });

    req.flash('success', 'Agenda berhasil dihapus.');
    res.redirect('/admin/academic-calendar');
  } catch (error) {
    console.error('Calendar destroy error:', error);
    req.flash('error', 'Gagal menghapus agenda.');
    res.redirect('/admin/academic-calendar');
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
