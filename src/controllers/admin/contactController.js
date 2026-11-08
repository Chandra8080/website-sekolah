import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 15);
    const search = req.query.search ? req.query.search.trim() : '';

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } }
      ];
    }

    const total = dbCount('contact_messages', { where });
    const messages = dbFindMany('contact_messages', {
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/contact/index', {
      pageTitle: 'Pesan Kontak Masuk',
      messages,
      pagination,
      search
    });
  } catch (error) {
    console.error('Contact messages error:', error);
    req.flash('error', 'Gagal memuat pesan kontak.');
    res.redirect('/admin');
  }
};

export const show = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    let message = dbFindUnique('contact_messages', { where: { id } });

    if (!message) {
      req.flash('error', 'Pesan tidak ditemukan.');
      return res.redirect('/admin/contact');
    }

    // Mark as read if not already
    if (!message.isRead) {
      message = dbUpdate('contact_messages', {
        where: { id },
        data: { isRead: true }
      });
    }

    res.render('admin/contact/detail', {
      pageTitle: `Pesan dari: ${message.name}`,
      message
    });
  } catch (error) {
    console.error('Contact show error:', error);
    req.flash('error', 'Gagal membuka pesan.');
    res.redirect('/admin/contact');
  }
};

export const postReply = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { replyNote } = req.body;

    dbUpdate('contact_messages', {
      where: { id },
      data: {
        replyNote: sanitizeText(replyNote) || null
      }
    });

    await logActivity({
      req,
      action: 'REPLY_CONTACT',
      module: 'CONTACT',
      description: `Menambahkan catatan balasan pesan ID ${id}`
    });

    req.flash('success', 'Catatan tindak lanjut pesan disimpan.');
    res.redirect(`/admin/contact/${id}`);
  } catch (error) {
    console.error('Contact reply error:', error);
    req.flash('error', 'Gagal menyimpan catatan balasan.');
    res.redirect('/admin/contact');
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('contact_messages', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_CONTACT',
      module: 'CONTACT',
      description: `Menghapus pesan kontak ID ${id}`
    });

    req.flash('success', 'Pesan kontak berhasil dihapus.');
    res.redirect('/admin/contact');
  } catch (error) {
    console.error('Contact delete error:', error);
    req.flash('error', 'Gagal menghapus pesan.');
    res.redirect('/admin/contact');
  }
};

export default {
  index,
  show,
  postReply,
  destroy
};
