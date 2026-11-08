import crypto from 'crypto';

export const csrfMiddleware = (req, res, next) => {
  // Ensure session has a csrf secret/token
  if (!req.session) {
    return next();
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;

  // Safe HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Allow bypass on specific API webhooks if any
  const token =
    (req.body && req.body._csrf) ||
    req.headers['csrf-token'] ||
    req.headers['x-csrf-token'] ||
    req.headers['x-xsrf-token'];

  // If token is missing or mismatched
  if (!token || token !== req.session.csrfToken) {
    // In development or if form is multipart and body not parsed yet,
    // let's check query or flash an error gracefully
    if (req.is('multipart/form-data')) {
      // In multipart forms, multer parses the body AFTER csrf middleware.
      // We can also accept token via query param ?_csrf=... or validate after multer
      const queryToken = req.query._csrf;
      if (queryToken && queryToken === req.session.csrfToken) {
        return next();
      }
    }

    if (process.env.NODE_ENV === 'development' && !token) {
      // Allow lenient in development if not supplied, but log warning
      console.warn(`[CSRF Warning] Missing CSRF token on ${req.method} ${req.originalUrl}`);
      return next();
    }

    req.flash('error', 'Sesi formulir kedaluwarsa atau tidak valid. Silakan coba kembali.');
    return res.redirect('back');
  }

  next();
};

export default csrfMiddleware;
