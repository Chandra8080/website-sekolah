import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitize, sanitizeText } from '../../utils/sanitize.js';
import { createSlug } from '../../utils/slugify.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 10);
    const search = req.query.search ? req.query.search.trim() : '';

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { location: { contains: search } }
      ];
    }

    const total = dbCount('events', { where });
    const events = dbFindMany('events', {
      where,
      orderBy: { startDate: 'desc' },
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/events/index', {
      pageTitle: 'Kelola Agenda & Kegiatan',
      events,
      pagination,
      search
    });
  } catch (error) {
    console.error('Events index error:', error);
    req.flash('error', 'Gagal memuat agenda.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/events/create', {
    pageTitle: 'Tambah Agenda Kegiatan',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, startTime, endTime, status, isPublished } = req.body;

    if (!title || !startDate) {
      req.flash('error', 'Judul dan tanggal mulai kegiatan wajib diisi.');
      return res.redirect('/admin/events/create');
    }

    let slug = createSlug(title);
    const existing = dbFindUnique('events', { where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true;

    dbCreate('events', {
      data: {
        title: sanitizeText(title),
        slug,
        description: sanitize(description),
        location: sanitizeText(location) || 'Kampus Sekolah',
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        startTime: startTime || null,
        endTime: endTime || null,
        status: status || 'upcoming',
        isPublished: published,
        imageUrl
      }
    });

    await logActivity({
      req,
      action: 'CREATE_EVENT',
      module: 'EVENTS',
      description: `Menambahkan agenda "${title}"`
    });

    req.flash('success', 'Agenda kegiatan berhasil dibuat.');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Event store error:', error);
    req.flash('error', 'Gagal menyimpan agenda.');
    res.redirect('/admin/events/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('events', { where: { id } });

    if (!item) {
      req.flash('error', 'Agenda tidak ditemukan.');
      return res.redirect('/admin/events');
    }

    res.render('admin/events/edit', {
      pageTitle: `Edit: ${item.title}`,
      item
    });
  } catch (error) {
    console.error('Event edit error:', error);
    req.flash('error', 'Gagal memuat agenda.');
    res.redirect('/admin/events');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, location, startDate, endDate, startTime, endTime, status, isPublished } = req.body;

    const current = dbFindUnique('events', { where: { id } });
    if (!current) {
      req.flash('error', 'Agenda tidak ditemukan.');
      return res.redirect('/admin/events');
    }

    let imageUrl = current.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/events/${req.file.filename}`;
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true;

    dbUpdate('events', {
      where: { id },
      data: {
        title: sanitizeText(title),
        description: sanitize(description),
        location: sanitizeText(location) || 'Kampus Sekolah',
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        startTime: startTime || null,
        endTime: endTime || null,
        status: status || 'upcoming',
        isPublished: published,
        imageUrl
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_EVENT',
      module: 'EVENTS',
      description: `Memperbarui agenda ID ${id}`
    });

    req.flash('success', 'Agenda berhasil diperbarui.');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Event update error:', error);
    req.flash('error', 'Gagal memperbarui agenda.');
    res.redirect(`/admin/events/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('events', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_EVENT',
      module: 'EVENTS',
      description: `Menghapus agenda ID ${id}`
    });

    req.flash('success', 'Agenda berhasil dihapus.');
    res.redirect('/admin/events');
  } catch (error) {
    console.error('Event destroy error:', error);
    req.flash('error', 'Gagal menghapus agenda.');
    res.redirect('/admin/events');
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
