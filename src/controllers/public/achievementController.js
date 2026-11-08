import { dbFindMany, dbCount } from '../../config/database.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';

export const getIndex = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 12);
    const category = req.query.category || '';
    const level = req.query.level || '';
    const search = req.query.search ? req.query.search.trim() : '';

    const where = { isPublished: true };
    if (category) where.category = category;
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const total = dbCount('achievements', { where });
    const achievements = dbFindMany('achievements', {
      where,
      orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }],
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('public/pages/achievements/index', {
      pageTitle: 'Prestasi & Penghargaan',
      achievements,
      pagination,
      category,
      level,
      search
    });
  } catch (error) {
    console.error('Achievement public error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat prestasi sekolah.'
    });
  }
};

export default {
  getIndex
};
