import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import rateLimit from 'express-rate-limit';

import sessionOptions from './config/session.js';
import loadSettings from './middleware/settings.js';
import { loadUser } from './middleware/auth.js';
import { csrfMiddleware } from './middleware/csrf.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://unpkg.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://via.placeholder.com", "https://*.google.com", "https://*.googleapis.com"],
        frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com", "https://www.youtube.com"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// Compression & Logging
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request Parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(methodOverride('_method'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session & Flash
app.use(session(sessionOptions));
app.use(flash());

// Global Rate Limiter for general public routes (prevent DDoS)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Terlalu banyak permintaan dari IP Anda, silakan coba lagi beberapa saat kemudian.'
});
app.use(publicLimiter);

// Global Middleware & Locals
app.use(loadSettings);
app.use(loadUser);
app.use(csrfMiddleware);

// Helper functions and flash messages in locals
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  res.locals.warning = req.flash('warning');

  // Utility helpers available to all EJS templates
  res.locals.formatDate = (date, format = 'id-ID') => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      return d.toLocaleDateString(format, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  res.locals.formatTime = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  res.locals.truncate = (text, maxLength = 120) => {
    if (!text) return '';
    const plain = text.replace(/<[^>]*>?/gm, '').trim();
    if (plain.length <= maxLength) return plain;
    return plain.slice(0, maxLength).trim() + '...';
  };

  res.locals.currentUrl = req.originalUrl;
  res.locals.env = process.env.NODE_ENV || 'development';

  next();
});

// Routes
app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render('public/errors/404', {
    pageTitle: 'Halaman Tidak Ditemukan - 404',
    url: req.originalUrl
  });
});

// 500 Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  const isDev = process.env.NODE_ENV === 'development';

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    req.flash('error', 'Ukuran berkas melebihi batas maksimal yang diizinkan (10MB).');
    return res.redirect('back');
  }

  res.status(500).render('public/errors/500', {
    pageTitle: 'Terjadi Kesalahan - 500',
    error: isDev ? err : null,
    message: isDev ? err.message : 'Terjadi gangguan internal pada peladen. Mohon coba beberapa saat lagi.'
  });
});

export default app;
