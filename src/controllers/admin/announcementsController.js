import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitize, sanitizeText } from '../../utils/sanitize.js';
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
        { content: { contains: search } }
      ];
    }

    const total = dbCount('announcements', { where });
    const announcements = dbFindMany('announcements', {
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/announcements/index', {
      pageTitle: 'Kelola Pengumuman',
      announcements,
      pagination,
      search
    });
  } catch (error) {
    console.error('Announcements index error:', error);
    req.flash('error', 'Gagal memuat pengumuman.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/announcements/create', {
    pageTitle: 'Buat Pengumuman Baru',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { title, content, category, priority, isPublished, expiredAt } = req.body;

    if (!title || !content) {
      req.flash('error', 'Judul dan isi pengumuman wajib diisi.');
      return res.redirect('/admin/announcements/create');
    }

    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true;

    dbCreate('announcements', {
      data: {
        title: sanitizeText(title),
        content: sanitize(content),
        category: category || 'umum',
        priority: priority || 'normal',
        attachmentUrl,
        isPublished: published,
        publishedAt: published ? new Date().toISOString() : null,
        expiredAt: expiredAt ? new Date(expiredAt).toISOString() : null
      }
    });

    await logActivity({
      req,
      action: 'CREATE_ANNOUNCEMENT',
      module: 'ANNOUNCEMENTS',
      description: `Membuat pengumuman "${title}"`
    });

    req.flash('success', 'Pengumuman berhasil diterbitkan.');
    res.redirect('/admin/announcements');
  } catch (error) {
    console.error('Announcement store error:', error);
    req.flash('error', 'Gagal menyimpan pengumuman.');
    res.redirect('/admin/announcements/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('announcements', { where: { id } });

    if (!item) {
      req.flash('error', 'Pengumuman tidak ditemukan.');
      return res.redirect('/admin/announcements');
    }

    res.render('admin/announcements/edit', {
      pageTitle: `Edit: ${item.title}`,
      item
    });
  } catch (error) {
    console.error('Announcement edit error:', error);
    req.flash('error', 'Gagal memuat pengumuman.');
    res.redirect('/admin/announcements');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, content, category, priority, isPublished, expiredAt } = req.body;

    const current = dbFindUnique('announcements', { where: { id } });
    if (!current) {
      req.flash('error', 'Pengumuman tidak ditemukan.');
      return res.redirect('/admin/announcements');
    }

    let attachmentUrl = current.attachmentUrl;
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true;

    dbUpdate('announcements', {
      where: { id },
      data: {
        title: sanitizeText(title),
        content: sanitize(content),
        category: category || 'umum',
        priority: priority || 'normal',
        attachmentUrl,
        isPublished: published,
        expiredAt: expiredAt ? new Date(expiredAt).toISOString() : null
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_ANNOUNCEMENT',
      module: 'ANNOUNCEMENTS',
      description: `Memperbarui pengumuman ID ${id}`
    });

    req.flash('success', 'Pengumuman berhasil diperbarui.');
    res.redirect('/admin/announcements');
  } catch (error) {
    console.error('Announcement update error:', error);
    req.flash('error', 'Gagal memperbarui pengumuman.');
    res.redirect(`/admin/announcements/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('announcements', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_ANNOUNCEMENT',
      module: 'ANNOUNCEMENTS',
      description: `Menghapus pengumuman ID ${id}`
    });

    req.flash('success', 'Pengumuman berhasil dihapus.');
    res.redirect('/admin/announcements');
  } catch (error) {
    console.error('Announcement delete error:', error);
    req.flash('error', 'Gagal menghapus pengumuman.');
    res.redirect('/admin/announcements');
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
