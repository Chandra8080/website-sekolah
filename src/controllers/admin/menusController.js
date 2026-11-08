import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbDeleteMany } from '../../config/database.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const menus = dbFindMany('menus', {
      where: { parentId: null },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.render('admin/menus/index', {
      pageTitle: 'Kelola Menu Navigasi',
      menus
    });
  } catch (error) {
    console.error('Menus index error:', error);
    req.flash('error', 'Gagal memuat menu navigasi.');
    res.redirect('/admin');
  }
};

export const create = async (req, res) => {
  try {
    const parentMenus = dbFindMany('menus', {
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' }
    });

    res.render('admin/menus/create', {
      pageTitle: 'Tambah Menu Navigasi',
      parentMenus,
      item: {}
    });
  } catch (error) {
    console.error('Menus create error:', error);
    req.flash('error', 'Gagal memuat formulir.');
    res.redirect('/admin/menus');
  }
};

export const store = async (req, res) => {
  try {
    const { title, url, icon, parentId, sortOrder, target, isActive } = req.body;

    if (!title || !url) {
      req.flash('error', 'Judul menu dan URL tujuan wajib diisi.');
      return res.redirect('/admin/menus/create');
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    dbCreate('menus', {
      data: {
        title: sanitizeText(title),
        url: sanitizeText(url),
        icon: sanitizeText(icon) || null,
        parentId: parentId ? parseInt(parentId, 10) : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        target: target || '_self',
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'CREATE_MENU',
      module: 'MENUS',
      description: `Menambahkan item menu "${title}"`
    });

    req.flash('success', 'Menu navigasi berhasil ditambahkan.');
    res.redirect('/admin/menus');
  } catch (error) {
    console.error('Menu store error:', error);
    req.flash('error', 'Gagal menyimpan menu.');
    res.redirect('/admin/menus/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('menus', { where: { id } });
    const allParents = dbFindMany('menus', {
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' }
    });
    const parentMenus = allParents.filter(p => p.id !== id);

    if (!item) {
      req.flash('error', 'Menu tidak ditemukan.');
      return res.redirect('/admin/menus');
    }

    res.render('admin/menus/edit', {
      pageTitle: `Edit: ${item.title}`,
      item,
      parentMenus
    });
  } catch (error) {
    console.error('Menu edit error:', error);
    req.flash('error', 'Gagal memuat data menu.');
    res.redirect('/admin/menus');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, url, icon, parentId, sortOrder, target, isActive } = req.body;

    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    dbUpdate('menus', {
      where: { id },
      data: {
        title: sanitizeText(title),
        url: sanitizeText(url),
        icon: sanitizeText(icon) || null,
        parentId: parentId ? parseInt(parentId, 10) : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        target: target || '_self',
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_MENU',
      module: 'MENUS',
      description: `Memperbarui menu ID ${id}`
    });

    req.flash('success', 'Menu navigasi berhasil diperbarui.');
    res.redirect('/admin/menus');
  } catch (error) {
    console.error('Menu update error:', error);
    req.flash('error', 'Gagal memperbarui menu.');
    res.redirect(`/admin/menus/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    // Delete children first
    dbDeleteMany('menus', { where: { parentId: id } });
    dbDelete('menus', { where: { id } });

    await logActivity({
      req,
      action: 'DELETE_MENU',
      module: 'MENUS',
      description: `Menghapus menu ID ${id}`
    });

    req.flash('success', 'Menu berhasil dihapus.');
    res.redirect('/admin/menus');
  } catch (error) {
    console.error('Menu destroy error:', error);
    req.flash('error', 'Gagal menghapus menu.');
    res.redirect('/admin/menus');
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
