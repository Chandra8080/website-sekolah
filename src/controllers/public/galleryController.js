import { dbFindMany, dbFindUnique, dbCount } from '../../config/database.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';

export const getIndex = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 16);
    const categorySlug = req.query.category || '';

    const where = { isPublished: true };
    let activeCategory = null;

    if (categorySlug) {
      activeCategory = dbFindUnique('gallery_categories', { where: { slug: categorySlug } });
      if (activeCategory) {
        where.categoryId = activeCategory.id;
      }
    }

    const total = dbCount('galleries', { where });
    const rawCategories = dbFindMany('gallery_categories', { orderBy: { name: 'asc' } });
    const allGalleries = dbFindMany('galleries');
    const categories = rawCategories.map(cat => ({
      ...cat,
      _count: {
        galleries: allGalleries.filter(g => g.categoryId === cat.id && g.isPublished).length
      }
    }));

    const rawPhotos = dbFindMany('galleries', {
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    });
    const photos = rawPhotos.map(p => ({
      ...p,
      category: categories.find(c => c.id === p.categoryId) || null
    }));

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('public/pages/gallery/index', {
      pageTitle: 'Galeri Foto & Dokumentasi',
      photos,
      categories,
      pagination,
      activeCategory
    });
  } catch (error) {
    console.error('Gallery public error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat galeri foto.'
    });
  }
};

export default {
  getIndex
};
