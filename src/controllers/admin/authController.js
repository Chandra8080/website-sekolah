import bcrypt from 'bcryptjs';
import { dbFindFirst, dbUpdate } from '../../config/database.js';
import { logActivity } from '../../utils/logger.js';

export const getLogin = (req, res) => {
  res.render('admin/auth/login', {
    pageTitle: 'Masuk Panel Admin',
    layout: false
  });
};

export const postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      req.flash('error', 'Nama pengguna dan kata sandi wajib diisi.');
      return res.redirect('/admin/login');
    }

    // Find user by username or email
    const user = dbFindFirst('users', {
      where: {
        OR: [{ username }, { email: username }]
      },
      include: {
        role: true
      }
    });

    if (!user) {
      req.flash('error', 'Kombinasi kredensial tidak ditemukan.');
      return res.redirect('/admin/login');
    }

    if (!user.isActive) {
      req.flash('error', 'Akun Anda dinonaktifkan. Silakan hubungi Super Admin.');
      return res.redirect('/admin/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Kombinasi kredensial tidak valid.');
      return res.redirect('/admin/login');
    }

    // Set session
    req.session.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name || 'Administrator',
      roleSlug: user.role?.slug || 'administrator',
      avatar: user.avatar
    };

    // Update lastLoginAt
    dbUpdate('users', {
      where: { id: user.id },
      data: { lastLoginAt: new Date().toISOString() }
    });

    await logActivity({
      req,
      action: 'LOGIN',
      module: 'AUTH',
      description: `Pengguna ${user.name} (${user.username}) berhasil masuk ke sistem.`
    });

    req.flash('success', `Selamat datang kembali, ${user.name}!`);
    return res.redirect('/admin');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Terjadi kesalahan sistem saat memproses login.');
    return res.redirect('/admin/login');
  }
};

export const postLogout = async (req, res) => {
  try {
    if (req.session?.user) {
      await logActivity({
        req,
        action: 'LOGOUT',
        module: 'AUTH',
        description: `Pengguna ${req.session.user.name} keluar dari sistem.`
      });
    }

    req.session.destroy((err) => {
      if (err) console.error('Logout session destroy error:', err);
      res.redirect('/admin/login');
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.redirect('/admin/login');
  }
};

export default {
  getLogin,
  postLogin,
  postLogout
};
