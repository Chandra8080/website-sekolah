import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { createSlug } from '../../utils/slugify.js';
import { sanitize, sanitizeText } from '../../utils/sanitize.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 10);
    const search = req.query.search ? req.query.search.trim() : '';
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : null;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } }
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const total = dbCount('news', { where });
    const rawNews = dbFindMany('news', {
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    const categories = dbFindMany('news_categories', { orderBy: { name: 'asc' } });
    const newsList = rawNews.map(item => ({
      ...item,
      category: categories.find(c => c.id === item.categoryId) || null
    }));

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/news/index', {
      pageTitle: 'Kelola Berita & Artikel',
      newsList,
      categories,
      pagination,
      search,
      categoryId
    });
  } catch (error) {
    console.error('News index error:', error);
    req.flash('error', 'Gagal memuat daftar berita.');
    res.redirect('/admin');
  }
};

export const create = async (req, res) => {
  try {
    const categories = dbFindMany('news_categories', { orderBy: { name: 'asc' } });
    res.render('admin/news/create', {
      pageTitle: 'Tambah Berita Baru',
      categories,
      item: {}
    });
  } catch (error) {
    console.error('News create error:', error);
    req.flash('error', 'Gagal memuat formulir.');
    res.redirect('/admin/news');
  }
};

export const store = async (req, res) => {
  try {
    const { title, categoryId, excerpt, content, isPublished, metaTitle, metaDesc } = req.body;

    if (!title || !content) {
      req.flash('error', 'Judul dan konten berita wajib diisi.');
      return res.redirect('/admin/news/create');
    }

    let slug = createSlug(title);
    const existing = dbFindUnique('news', { where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/news/${req.file.filename}`;
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true;

    const newItem = dbCreate('news', {
      data: {
        title: sanitizeText(title),
        slug,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        excerpt: sanitizeText(excerpt) || sanitizeText(content).slice(0, 160),
        content: sanitize(content),
        imageUrl,
        isPublished: published,
        publishedAt: published ? new Date().toISOString() : null,
        author: req.session.user?.name || 'Administrator',
        metaTitle: sanitizeText(metaTitle) || title,
        metaDesc: sanitizeText(metaDesc) || sanitizeText(excerpt)
      }
    });

    await logActivity({
      req,
      action: 'CREATE_NEWS',
      module: 'NEWS',
      description: `Menambahkan berita "${newItem.title}"`
    });

    req.flash('success', 'Berita berhasil diterbitkan.');
    res.redirect('/admin/news');
  } catch (error) {
    console.error('News store error:', error);
    req.flash('error', 'Terjadi kesalahan saat menyimpan berita.');
    res.redirect('/admin/news/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('news', { where: { id } });
    const categories = dbFindMany('news_categories', { orderBy: { name: 'asc' } });

    if (!item) {
      req.flash('error', 'Berita tidak ditemukan.');
      return res.redirect('/admin/news');
    }

    res.render('admin/news/edit', {
      pageTitle: `Edit: ${item.title}`,
      item,
      categories
    });
  } catch (error) {
    console.error('News edit error:', error);
    req.flash('error', 'Gagal memuat berita.');
    res.redirect('/admin/news');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, categoryId, excerpt, content, isPublished, metaTitle, metaDesc } = req.body;

    const currentItem = dbFindUnique('news', { where: { id } });
    if (!currentItem) {
      req.flash('error', 'Berita tidak ditemukan.');
      return res.redirect('/admin/news');
    }

    let imageUrl = currentItem.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/news/${req.file.filename}`;
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true;
    let publishedAt = currentItem.publishedAt;
    if (published && !publishedAt) {
      publishedAt = new Date().toISOString();
    }

    dbUpdate('news', {
      where: { id },
      data: {
        title: sanitizeText(title),
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        excerpt: sanitizeText(excerpt) || sanitizeText(content).slice(0, 160),
        content: sanitize(content),
        imageUrl,
        isPublished: published,
        publishedAt,
        metaTitle: sanitizeText(metaTitle) || title,
        metaDesc: sanitizeText(metaDesc) || sanitizeText(excerpt)
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_NEWS',
      module: 'NEWS',
      description: `Memperbarui berita ID ${id} (${title})`
    });

    req.flash('success', 'Berita berhasil diperbarui.');
    res.redirect('/admin/news');
  } catch (error) {
    console.error('News update error:', error);
    req.flash('error', 'Gagal memperbarui berita.');
    res.redirect(`/admin/news/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('news', { where: { id } });

    if (item) {
      dbDelete('news', { where: { id } });
      await logActivity({
        req,
        action: 'DELETE_NEWS',
        module: 'NEWS',
        description: `Menghapus berita "${item.title}"`
      });
      req.flash('success', 'Berita berhasil dihapus.');
    } else {
      req.flash('error', 'Berita tidak ditemukan.');
    }

    res.redirect('/admin/news');
  } catch (error) {
    console.error('News delete error:', error);
    req.flash('error', 'Gagal menghapus berita.');
    res.redirect('/admin/news');
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
