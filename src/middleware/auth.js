import { dbFindUnique } from '../config/database.js';

export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Silakan masuk terlebih dahulu untuk mengakses panel admin.');
  return res.redirect('/admin/login');
};

export const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin');
  }
  return next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session?.user) {
      req.flash('error', 'Silakan masuk terlebih dahulu.');
      return res.redirect('/admin/login');
    }

    const userRole = req.session.user.roleSlug;
    if (roles.includes(userRole) || userRole === 'super_admin') {
      return next();
    }

    req.flash('error', 'Anda tidak memiliki hak akses untuk tindakan ini.');
    return res.redirect('/admin');
  };
};

export const loadUser = async (req, res, next) => {
  if (req.session?.user) {
    try {
      const user = dbFindUnique('users', {
        where: { id: req.session.user.id },
        include: { role: true }
      });
      if (user && user.isActive) {
        req.user = user;
        res.locals.currentUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          roleId: user.roleId,
          roleName: user.role?.name,
          roleSlug: user.role?.slug
        };
      } else {
        delete req.session.user;
        res.locals.currentUser = null;
      }
    } catch (err) {
      console.error('Error in loadUser middleware:', err);
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
};

export default {
  isAuthenticated,
  isGuest,
  requireRole,
  loadUser
};
