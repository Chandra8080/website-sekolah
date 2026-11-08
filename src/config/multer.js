import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_PATH || 'src/public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organize by subdirectory if specified or default
    let subFolder = 'general';
    if (req.baseUrl.includes('news') || req.path.includes('news')) subFolder = 'news';
    else if (req.baseUrl.includes('teacher') || req.path.includes('teacher')) subFolder = 'teachers';
    else if (req.baseUrl.includes('gallery') || req.path.includes('gallery')) subFolder = 'gallery';
    else if (req.baseUrl.includes('ppdb') || req.path.includes('ppdb')) subFolder = 'ppdb';
    else if (req.baseUrl.includes('facilities') || req.path.includes('facilities')) subFolder = 'facilities';
    else if (req.baseUrl.includes('achievements') || req.path.includes('achievements')) subFolder = 'achievements';
    else if (req.baseUrl.includes('events') || req.path.includes('events')) subFolder = 'events';

    const targetDir = path.join(uploadDir, subFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Allowed MIME types
const allowedMimes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe berkas tidak didukung: ${file.mimetype}. Harap unggah gambar atau dokumen yang valid.`), false);
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default

export const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});

export default upload;
