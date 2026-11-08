import { dbFindMany, dbCreate, dbUpdate, dbDelete } from '../../config/database.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const socialMedia = dbFindMany('social_media', {
      orderBy: { sortOrder: 'asc' }
    });

    res.render('admin/social-media/index', {
      pageTitle: 'Kelola Media Sosial',
      socialMedia
    });
  } catch (error) {
    console.error('Social media index error:', error);
    req.flash('error', 'Gagal memuat media sosial.');
    res.redirect('/admin');
  }
};

export const store = async (req, res) => {
  try {
    const { platform, url, icon, sortOrder, isActive } = req.body;

    if (!platform || !url) {
      req.flash('error', 'Platform dan tautan URL wajib diisi.');
      return res.redirect('/admin/social-media');
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    dbCreate('social_media', {
      data: {
        platform: sanitizeText(platform),
        url: sanitizeText(url),
        icon: sanitizeText(icon) || 'globe',
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'CREATE_SOCIAL_MEDIA',
      module: 'SOCIAL_MEDIA',
      description: `Menambahkan media sosial "${platform}"`
    });

    req.flash('success', 'Media sosial berhasil ditambahkan.');
    res.redirect('/admin/social-media');
  } catch (error) {
    console.error('Social media store error:', error);
    req.flash('error', 'Gagal menyimpan media sosial.');
    res.redirect('/admin/social-media');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { platform, url, icon, sortOrder, isActive } = req.body;

    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    dbUpdate('social_media', {
      where: { id },
      data: {
        platform: sanitizeText(platform),
        url: sanitizeText(url),
        icon: sanitizeText(icon) || 'globe',
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_SOCIAL_MEDIA',
      module: 'SOCIAL_MEDIA',
      description: `Memperbarui media sosial ID ${id}`
    });

    req.flash('success', 'Media sosial berhasil diperbarui.');
    res.redirect('/admin/social-media');
  } catch (error) {
    console.error('Social media update error:', error);
    req.flash('error', 'Gagal memperbarui media sosial.');
    res.redirect('/admin/social-media');
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('social_media', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_SOCIAL_MEDIA',
      module: 'SOCIAL_MEDIA',
      description: `Menghapus media sosial ID ${id}`
    });

    req.flash('success', 'Media sosial berhasil dihapus.');
    res.redirect('/admin/social-media');
  } catch (error) {
    console.error('Social media destroy error:', error);
    req.flash('error', 'Gagal menghapus media sosial.');
    res.redirect('/admin/social-media');
  }
};

export default {
  index,
  store,
  update,
  destroy
};
