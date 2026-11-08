import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { createSlug } from '../../utils/slugify.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 12);
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : null;

    const where = {};
    if (categoryId) where.categoryId = categoryId;

    const total = dbCount('galleries', { where });
    const rawGalleries = dbFindMany('galleries', {
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    });
    const categories = dbFindMany('gallery_categories', { orderBy: { name: 'asc' } });
    const galleries = rawGalleries.map(g => ({
      ...g,
      category: categories.find(c => c.id === g.categoryId) || null
    }));

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/gallery/index', {
      pageTitle: 'Kelola Galeri Foto',
      galleries,
      categories,
      pagination,
      categoryId
    });
  } catch (error) {
    console.error('Gallery index error:', error);
    req.flash('error', 'Gagal memuat galeri.');
    res.redirect('/admin');
  }
};

export const create = async (req, res) => {
  try {
    const categories = dbFindMany('gallery_categories', { orderBy: { name: 'asc' } });
    res.render('admin/gallery/create', {
      pageTitle: 'Tambah Foto Galeri',
      categories,
      item: {}
    });
  } catch (error) {
    console.error('Gallery create error:', error);
    req.flash('error', 'Gagal memuat formulir.');
    res.redirect('/admin/gallery');
  }
};

export const store = async (req, res) => {
  try {
    const { title, description, categoryId, sortOrder, isPublished } = req.body;

    if (!req.file && (!req.files || req.files.length === 0)) {
      req.flash('error', 'Harap pilih minimal satu berkas foto untuk diunggah.');
      return res.redirect('/admin/gallery/create');
    }

    const catId = categoryId ? parseInt(categoryId, 10) : null;
    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true || isPublished === undefined;

    // Handle single or multiple uploads
    const files = req.files || (req.file ? [req.file] : []);

    for (const f of files) {
      const fileUrl = `/uploads/gallery/${f.filename}`;
      dbCreate('galleries', {
        data: {
          title: sanitizeText(title) || f.originalname,
          description: sanitizeText(description) || null,
          imageUrl: fileUrl,
          thumbnailUrl: fileUrl,
          categoryId: catId,
          sortOrder: parseInt(sortOrder, 10) || 0,
          isPublished: published
        }
      });
    }

    await logActivity({
      req,
      action: 'UPLOAD_GALLERY',
      module: 'GALLERY',
      description: `Mengunggah ${files.length} foto ke galeri`
    });

    req.flash('success', `${files.length} foto berhasil ditambahkan ke galeri.`);
    res.redirect('/admin/gallery');
  } catch (error) {
    console.error('Gallery store error:', error);
    req.flash('error', 'Gagal menyimpan foto ke galeri.');
    res.redirect('/admin/gallery/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('galleries', { where: { id } });
    const categories = dbFindMany('gallery_categories', { orderBy: { name: 'asc' } });

    if (!item) {
      req.flash('error', 'Item galeri tidak ditemukan.');
      return res.redirect('/admin/gallery');
    }

    res.render('admin/gallery/edit', {
      pageTitle: `Edit Foto: ${item.title}`,
      item,
      categories
    });
  } catch (error) {
    console.error('Gallery edit error:', error);
    req.flash('error', 'Gagal memuat item galeri.');
    res.redirect('/admin/gallery');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, categoryId, sortOrder, isPublished } = req.body;

    const current = dbFindUnique('galleries', { where: { id } });
    if (!current) {
      req.flash('error', 'Foto tidak ditemukan.');
      return res.redirect('/admin/gallery');
    }

    let imageUrl = current.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/gallery/${req.file.filename}`;
    }

    const published = isPublished === 'true' || isPublished === 'on' || isPublished === true;

    dbUpdate('galleries', {
      where: { id },
      data: {
        title: sanitizeText(title),
        description: sanitizeText(description) || null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isPublished: published,
        imageUrl,
        thumbnailUrl: imageUrl
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_GALLERY',
      module: 'GALLERY',
      description: `Memperbarui foto ID ${id}`
    });

    req.flash('success', 'Informasi foto berhasil diperbarui.');
    res.redirect('/admin/gallery');
  } catch (error) {
    console.error('Gallery update error:', error);
    req.flash('error', 'Gagal memperbarui foto.');
    res.redirect(`/admin/gallery/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('galleries', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_GALLERY',
      module: 'GALLERY',
      description: `Menghapus foto galeri ID ${id}`
    });

    req.flash('success', 'Foto berhasil dihapus.');
    res.redirect('/admin/gallery');
  } catch (error) {
    console.error('Gallery destroy error:', error);
    req.flash('error', 'Gagal menghapus foto.');
    res.redirect('/admin/gallery');
  }
};

export const categories = async (req, res) => {
  try {
    const rawCategories = dbFindMany('gallery_categories', { orderBy: { name: 'asc' } });
    const allGalleries = dbFindMany('galleries');
    const list = rawCategories.map(cat => ({
      ...cat,
      _count: {
        galleries: allGalleries.filter(g => g.categoryId === cat.id).length
      }
    }));

    res.render('admin/gallery/categories', {
      pageTitle: 'Kategori Galeri',
      categories: list
    });
  } catch (error) {
    console.error('Gallery categories error:', error);
    req.flash('error', 'Gagal memuat kategori galeri.');
    res.redirect('/admin/gallery');
  }
};

export const storeCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      req.flash('error', 'Nama kategori wajib diisi.');
      return res.redirect('/admin/gallery/categories');
    }

    const slug = createSlug(name);
    dbCreate('gallery_categories', {
      data: {
        name: sanitizeText(name),
        slug,
        description: sanitizeText(description) || null
      }
    });

    req.flash('success', 'Kategori galeri berhasil ditambahkan.');
    res.redirect('/admin/gallery/categories');
  } catch (error) {
    console.error('Store gallery cat error:', error);
    req.flash('error', 'Gagal menambahkan kategori galeri.');
    res.redirect('/admin/gallery/categories');
  }
};

export const destroyCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    dbDelete('gallery_categories', { where: { id } });
    req.flash('success', 'Kategori galeri berhasil dihapus.');
    res.redirect('/admin/gallery/categories');
  } catch (error) {
    console.error('Destroy gallery cat error:', error);
    req.flash('error', 'Gagal menghapus kategori.');
    res.redirect('/admin/gallery/categories');
  }
};

export default {
  index,
  create,
  store,
  edit,
  update,
  destroy,
  categories,
  storeCategory,
  destroyCategory
};
