import { dbCreate } from '../../config/database.js';
import { sanitizeText } from '../../utils/sanitize.js';

export const getIndex = (req, res) => {
  res.render('public/pages/contact/index', {
    pageTitle: 'Hubungi Kami'
  });
};

export const postSend = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      req.flash('error', 'Nama, alamat email, dan isi pesan wajib diisi.');
      return res.redirect('/contact');
    }

    dbCreate('contact_messages', {
      data: {
        name: sanitizeText(name),
        email: sanitizeText(email).toLowerCase(),
        phone: sanitizeText(phone) || null,
        subject: sanitizeText(subject) || 'Pesan Melalui Website',
        message: sanitizeText(message)
      }
    });

    req.flash('success', 'Terima kasih, pesan Anda telah berhasil dikirimkan ke pihak sekolah.');
    res.redirect('/contact');
  } catch (error) {
    console.error('Contact send error:', error);
    req.flash('error', 'Gagal mengirimkan pesan. Silakan coba kembali.');
    res.redirect('/contact');
  }
};

export default {
  getIndex,
  postSend
};
