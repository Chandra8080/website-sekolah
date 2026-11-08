import express from 'express';
import upload from '../config/multer.js';
import homeController from '../controllers/public/homeController.js';
import profileController from '../controllers/public/profileController.js';
import newsController from '../controllers/public/newsController.js';
import announcementController from '../controllers/public/announcementController.js';
import teacherController from '../controllers/public/teacherController.js';
import galleryController from '../controllers/public/galleryController.js';
import ppdbController from '../controllers/public/ppdbController.js';
import contactController from '../controllers/public/contactController.js';
import eventController from '../controllers/public/eventController.js';
import achievementController from '../controllers/public/achievementController.js';
import facilityController from '../controllers/public/facilityController.js';
import extracurricularController from '../controllers/public/extracurricularController.js';
import programController from '../controllers/public/programController.js';
import sitemapController from '../controllers/public/sitemapController.js';

const router = express.Router();

// Home
router.get('/', homeController.getIndex);

// School Profile (Standard & Indonesian Aliases)
router.get('/profile/about', profileController.getAbout);
router.get('/tentang-kami', profileController.getAbout);

router.get('/profile/history', profileController.getHistory);
router.get('/sejarah', profileController.getHistory);

router.get('/profile/visi-misi', profileController.getVisiMisi);
router.get('/visi-misi', profileController.getVisiMisi);

router.get('/profile/structure', profileController.getStructure);
router.get('/struktur-organisasi', profileController.getStructure);

router.get('/profile/headmaster', profileController.getHeadmaster);
router.get('/sambutan-kepala-sekolah', profileController.getHeadmaster);

// Teachers & Staff
router.get('/teachers', teacherController.getIndex);
router.get('/guru', teacherController.getIndex);

// News & Articles
router.get('/news', newsController.getIndex);
router.get('/news/:slug', newsController.getDetail);
router.get('/berita', newsController.getIndex);
router.get('/berita/:slug', newsController.getDetail);

// Announcements
router.get('/announcements', announcementController.getIndex);
router.get('/announcements/:id', announcementController.getDetail);
router.get('/pengumuman', announcementController.getIndex);
router.get('/pengumuman/:id', announcementController.getDetail);

// Events / Agenda
router.get('/events', eventController.getIndex);
router.get('/events/:slug', eventController.getDetail);
router.get('/agenda', eventController.getIndex);
router.get('/agenda/:slug', eventController.getDetail);

// Achievements
router.get('/achievements', achievementController.getIndex);
router.get('/prestasi', achievementController.getIndex);

// Gallery
router.get('/gallery', galleryController.getIndex);
router.get('/galeri', galleryController.getIndex);

// Academic
router.get('/academic', programController.getIndex);
router.get('/academic/programs', programController.getPrograms);
router.get('/program', programController.getPrograms);

router.get('/academic/curriculum', programController.getCurriculum);
router.get('/kurikulum', programController.getCurriculum);

router.get('/academic/extracurriculars', extracurricularController.getIndex);
router.get('/ekstrakurikuler', extracurricularController.getIndex);

// Facilities
router.get('/facilities', facilityController.getIndex);
router.get('/fasilitas', facilityController.getIndex);

// PPDB (Penerimaan Peserta Didik Baru)
router.get('/ppdb', ppdbController.getIndex);
router.post('/ppdb/register', upload.single('document'), ppdbController.postRegister);
router.get('/ppdb/status', ppdbController.getCheckStatus);
router.post('/ppdb/status', ppdbController.postCheckStatus);

// Contact
router.get('/contact', contactController.getIndex);
router.post('/contact', contactController.postSend);
router.get('/kontak', contactController.getIndex);
router.post('/kontak', contactController.postSend);

// Dynamic Sitemap
router.get('/sitemap.xml', sitemapController.getSitemap);

export default router;
