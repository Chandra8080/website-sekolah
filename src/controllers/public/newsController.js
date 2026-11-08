import { dbFindMany, dbFindUnique, dbUpdate, dbCount } from '../../config/database.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';

export const getIndex = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 9);
    const search = req.query.search ? req.query.search.trim() : '';
    const categorySlug = req.query.category ? req.query.category.trim() : '';

    const where = { isPublished: true };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } }
      ];
    }

    let activeCategory = null;
    if (categorySlug) {
      activeCategory = dbFindUnique('news_categories', { where: { slug: categorySlug } });
      if (activeCategory) {
        where.categoryId = activeCategory.id;
      }
    }

    const total = dbCount('news', { where });

    const rawCategories = dbFindMany('news_categories', { orderBy: { name: 'asc' } });
    const allNews = dbFindMany('news');
    const categories = rawCategories.map(cat => ({
      ...cat,
      _count: {
        news: allNews.filter(n => n.categoryId === cat.id && n.isPublished).length
      }
    }));

    const rawNewsList = dbFindMany('news', {
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit
    });
    const newsList = rawNewsList.map(n => ({
      ...n,
      category: categories.find(c => c.id === n.categoryId) || null
    }));

    const recentNewsRaw = dbFindMany('news', {
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 5
    });
    const recentNews = recentNewsRaw.map(n => ({
      ...n,
      category: categories.find(c => c.id === n.categoryId) || null
    }));

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('public/pages/news/index', {
      pageTitle: activeCategory ? `Kategori: ${activeCategory.name}` : 'Berita & Artikel Sekolah',
      newsList,
      categories,
      recentNews,
      pagination,
      search,
      activeCategory
    });
  } catch (error) {
    console.error('Public news index error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat berita.'
    });
  }
};

export const getDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    const rawArticle = dbFindUnique('news', {
      where: { slug }
    });

    if (!rawArticle || !rawArticle.isPublished) {
      return res.status(404).render('public/errors/404', {
        pageTitle: 'Berita Tidak Ditemukan',
        url: req.originalUrl
      });
    }

    const categories = dbFindMany('news_categories');
    const article = {
      ...rawArticle,
      category: categories.find(c => c.id === rawArticle.categoryId) || null
    };

    // Increment view count
    dbUpdate('news', {
      where: { id: article.id },
      data: { viewCount: (article.viewCount || 0) + 1 }
    });

    // Related articles
    const allPublished = dbFindMany('news', {
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' }
    });
    const relatedNews = allPublished
      .filter(n => n.id !== article.id && (!article.categoryId || n.categoryId === article.categoryId))
      .slice(0, 3)
      .map(n => ({
        ...n,
        category: categories.find(c => c.id === n.categoryId) || null
      }));

    res.render('public/pages/news/detail', {
      pageTitle: article.metaTitle || article.title,
      article,
      relatedNews
    });
  } catch (error) {
    console.error('Public news detail error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat artikel.'
    });
  }
};

export default {
  getIndex,
  getDetail
};
