import { dbFindMany, dbFindUnique, dbCount } from '../../config/database.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';

export const getIndex = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 10);
    const category = req.query.category || '';

    const where = { isPublished: true };
    if (category) where.category = category;

    const total = dbCount('announcements', { where });
    const announcements = dbFindMany('announcements', {
      where,
      orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('public/pages/announcements/index', {
      pageTitle: 'Pengumuman Resmi',
      announcements,
      pagination,
      category
    });
  } catch (error) {
    console.error('Public announcement index error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat pengumuman.'
    });
  }
};

export const getDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const announcement = dbFindUnique('announcements', {
      where: { id }
    });

    if (!announcement || !announcement.isPublished) {
      return res.status(404).render('public/errors/404', {
        pageTitle: 'Pengumuman Tidak Ditemukan',
        url: req.originalUrl
      });
    }

    const allAnnouncements = dbFindMany('announcements', {
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' }
    });
    const recentAnnouncements = allAnnouncements.filter(a => a.id !== id).slice(0, 4);

    res.render('public/pages/announcements/detail', {
      pageTitle: announcement.title,
      announcement,
      recentAnnouncements
    });
  } catch (error) {
    console.error('Public announcement detail error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat pengumuman.'
    });
  }
};

export default {
  getIndex,
  getDetail
};
