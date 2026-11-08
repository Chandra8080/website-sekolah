import fs from 'fs';
import path from 'path';
import { dbFindMany, dbFindUnique, dbCreate, dbDelete, dbCount } from '../../config/database.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 18);
    const category = req.query.category || '';
    const search = req.query.search ? req.query.search.trim() : '';

    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { fileName: { contains: search } },
        { originalName: { contains: search } }
      ];
    }

    const total = dbCount('media', { where });
    const mediaList = dbFindMany('media', {
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/media/index', {
      pageTitle: 'Media Manager',
      mediaList,
      pagination,
      category,
      search
    });
  } catch (error) {
    console.error('Media index error:', error);
    req.flash('error', 'Gagal memuat pustaka media.');
    res.redirect('/admin');
  }
};

export const uploadMedia = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      req.flash('error', 'Silakan pilih berkas untuk diunggah.');
      return res.redirect('/admin/media');
    }

    for (const f of files) {
      const isImg = f.mimetype.startsWith('image/');
      const fileUrl = `/uploads/${path.basename(f.destination)}/${f.filename}`;

      dbCreate('media', {
        data: {
          fileName: f.filename,
          originalName: f.originalname,
          mimeType: f.mimetype,
          size: f.size,
          path: f.path,
          url: fileUrl,
          category: isImg ? 'image' : 'document',
          uploadedBy: req.session.user?.id || null
        }
      });
    }

    await logActivity({
      req,
      action: 'UPLOAD_MEDIA',
      module: 'MEDIA',
      description: `Mengunggah ${files.length} berkas ke media manager`
    });

    req.flash('success', `${files.length} berkas berhasil diunggah.`);
    res.redirect('/admin/media');
  } catch (error) {
    console.error('Media upload error:', error);
    req.flash('error', 'Gagal mengunggah berkas.');
    res.redirect('/admin/media');
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const media = dbFindUnique('media', { where: { id } });

    if (media) {
      // Remove file from disk safely
      if (fs.existsSync(media.path)) {
        try {
          fs.unlinkSync(media.path);
        } catch (e) {
          console.warn('Could not unlink physical file:', e.message);
        }
      }

      dbDelete('media', { where: { id } });

      await logActivity({
        req,
        action: 'DELETE_MEDIA',
        module: 'MEDIA',
        description: `Menghapus berkas "${media.originalName}"`
      });

      req.flash('success', 'Berkas berhasil dihapus.');
    }

    res.redirect('/admin/media');
  } catch (error) {
    console.error('Media destroy error:', error);
    req.flash('error', 'Gagal menghapus berkas.');
    res.redirect('/admin/media');
  }
};

export default {
  index,
  uploadMedia,
  destroy
};
