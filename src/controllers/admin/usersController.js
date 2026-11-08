import bcrypt from 'bcryptjs';
import { dbFindMany, dbFindUnique, dbFindFirst, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 10);
    const search = req.query.search ? req.query.search.trim() : '';

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } }
      ];
    }

    const total = dbCount('users', { where });
    const rawUsers = dbFindMany('users', {
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    const roles = dbFindMany('roles');
    const users = rawUsers.map(u => ({
      ...u,
      role: roles.find(r => r.id === u.roleId) || null
    }));

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/users/index', {
      pageTitle: 'Kelola Pengguna Sistem',
      users,
      pagination,
      search
    });
  } catch (error) {
    console.error('Users index error:', error);
    req.flash('error', 'Gagal memuat daftar pengguna.');
    res.redirect('/admin');
  }
};

export const create = async (req, res) => {
  try {
    const roles = dbFindMany('roles', { orderBy: { id: 'asc' } });
    res.render('admin/users/create', {
      pageTitle: 'Tambah Pengguna Baru',
      roles,
      item: {}
    });
  } catch (error) {
    console.error('Users create error:', error);
    req.flash('error', 'Gagal memuat formulir.');
    res.redirect('/admin/users');
  }
};

export const store = async (req, res) => {
  try {
    const { name, email, username, password, roleId, isActive } = req.body;

    if (!name || !email || !username || !password || !roleId) {
      req.flash('error', 'Semua kolom wajib diisi.');
      return res.redirect('/admin/users/create');
    }

    const existing = dbFindFirst('users', {
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existing) {
      req.flash('error', 'Email atau username sudah terdaftar.');
      return res.redirect('/admin/users/create');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    let avatar = null;
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    const newUser = dbCreate('users', {
      data: {
        name: sanitizeText(name),
        email: sanitizeText(email).toLowerCase(),
        username: sanitizeText(username).toLowerCase(),
        password: hashedPassword,
        roleId: parseInt(roleId, 10),
        isActive: active,
        avatar
      }
    });

    await logActivity({
      req,
      action: 'CREATE_USER',
      module: 'USERS',
      description: `Membuat pengguna baru "${newUser.username}"`
    });

    req.flash('success', 'Pengguna berhasil dibuat.');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('User store error:', error);
    req.flash('error', 'Gagal menyimpan pengguna.');
    res.redirect('/admin/users/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('users', { where: { id } });
    const roles = dbFindMany('roles', { orderBy: { id: 'asc' } });

    if (!item) {
      req.flash('error', 'Pengguna tidak ditemukan.');
      return res.redirect('/admin/users');
    }

    res.render('admin/users/edit', {
      pageTitle: `Edit Pengguna: ${item.name}`,
      item,
      roles
    });
  } catch (error) {
    console.error('User edit error:', error);
    req.flash('error', 'Gagal memuat pengguna.');
    res.redirect('/admin/users');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, username, password, roleId, isActive } = req.body;

    const user = dbFindUnique('users', { where: { id } });
    if (!user) {
      req.flash('error', 'Pengguna tidak ditemukan.');
      return res.redirect('/admin/users');
    }

    const updateData = {
      name: sanitizeText(name),
      email: sanitizeText(email).toLowerCase(),
      username: sanitizeText(username).toLowerCase(),
      roleId: parseInt(roleId, 10),
      isActive: isActive === 'true' || isActive === 'on' || isActive === true
    };

    if (password && password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    dbUpdate('users', {
      where: { id },
      data: updateData
    });

    await logActivity({
      req,
      action: 'UPDATE_USER',
      module: 'USERS',
      description: `Memperbarui pengguna "${user.username}"`
    });

    req.flash('success', 'Data pengguna berhasil diperbarui.');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('User update error:', error);
    req.flash('error', 'Gagal memperbarui pengguna.');
    res.redirect(`/admin/users/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (req.session.user && req.session.user.id === id) {
      req.flash('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
      return res.redirect('/admin/users');
    }

    const user = dbFindUnique('users', { where: { id } });
    if (user) {
      dbDelete('users', { where: { id } });
      await logActivity({
        req,
        action: 'DELETE_USER',
        module: 'USERS',
        description: `Menghapus akun pengguna "${user.username}"`
      });
      req.flash('success', 'Pengguna berhasil dihapus.');
    }

    res.redirect('/admin/users');
  } catch (error) {
    console.error('User delete error:', error);
    req.flash('error', 'Gagal menghapus pengguna.');
    res.redirect('/admin/users');
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
