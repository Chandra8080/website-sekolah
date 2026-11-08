import { dbFindMany, dbFindUnique, dbUpdate } from '../../config/database.js';
import { sanitize, sanitizeText } from '../../utils/sanitize.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const sections = dbFindMany('homepage_sections', {
      orderBy: { sortOrder: 'asc' }
    });

    res.render('admin/homepage-sections/index', {
      pageTitle: 'Kelola Konten Beranda',
      sections
    });
  } catch (error) {
    console.error('Homepage sections index error:', error);
    req.flash('error', 'Gagal memuat bagian beranda.');
    res.redirect('/admin');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const section = dbFindUnique('homepage_sections', { where: { id } });

    if (!section) {
      req.flash('error', 'Bagian beranda tidak ditemukan.');
      return res.redirect('/admin/homepage-sections');
    }

    res.render('admin/homepage-sections/edit', {
      pageTitle: `Edit Bagian: ${section.title || section.key}`,
      section
    });
  } catch (error) {
    console.error('Homepage section edit error:', error);
    req.flash('error', 'Gagal memuat bagian.');
    res.redirect('/admin/homepage-sections');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, subtitle, content, sortOrder, isActive, settings } = req.body;

    const current = dbFindUnique('homepage_sections', { where: { id } });
    if (!current) {
      req.flash('error', 'Bagian tidak ditemukan.');
      return res.redirect('/admin/homepage-sections');
    }

    let imageUrl = current.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    dbUpdate('homepage_sections', {
      where: { id },
      data: {
        title: sanitizeText(title),
        subtitle: sanitizeText(subtitle),
        content: content ? sanitize(content) : null,
        imageUrl,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active,
        settings: settings ? sanitizeText(settings) : null
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_HOMEPAGE_SECTION',
      module: 'HOMEPAGE',
      description: `Memperbarui bagian beranda "${current.key}"`
    });

    req.flash('success', 'Bagian beranda berhasil diperbarui.');
    res.redirect('/admin/homepage-sections');
  } catch (error) {
    console.error('Homepage section update error:', error);
    req.flash('error', 'Gagal memperbarui bagian beranda.');
    res.redirect(`/admin/homepage-sections/${req.params.id}/edit`);
  }
};

export default {
  index,
  edit,
  update
};
