import express from 'express';
import rateLimit from 'express-rate-limit';
import upload from '../../config/multer.js';
import { isAuthenticated, isGuest, requireRole } from '../../middleware/auth.js';

// Controllers
import authController from '../../controllers/admin/authController.js';
import dashboardController from '../../controllers/admin/dashboardController.js';
import settingsController from '../../controllers/admin/settingsController.js';
import newsController from '../../controllers/admin/newsController.js';
import teachersController from '../../controllers/admin/teachersController.js';
import staffController from '../../controllers/admin/staffController.js';
import galleryController from '../../controllers/admin/galleryController.js';
import ppdbController from '../../controllers/admin/ppdbController.js';
import contactController from '../../controllers/admin/contactController.js';
import usersController from '../../controllers/admin/usersController.js';
import mediaController from '../../controllers/admin/mediaController.js';
import announcementsController from '../../controllers/admin/announcementsController.js';
import eventsController from '../../controllers/admin/eventsController.js';
import achievementsController from '../../controllers/admin/achievementsController.js';
import facilitiesController from '../../controllers/admin/facilitiesController.js';
import extracurricularsController from '../../controllers/admin/extracurricularsController.js';
import programsController from '../../controllers/admin/programsController.js';
import curriculumController from '../../controllers/admin/curriculumController.js';
import academicCalendarController from '../../controllers/admin/academicCalendarController.js';
import organizationalStructureController from '../../controllers/admin/organizationalStructureController.js';
import homepageSectionsController from '../../controllers/admin/homepageSectionsController.js';
import menusController from '../../controllers/admin/menusController.js';
import socialMediaController from '../../controllers/admin/socialMediaController.js';

const router = express.Router();

// Brute force protection on login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Terlalu banyak percobaan masuk dari IP ini, coba kembali setelah 15 menit.'
});

// Authentication Routes
router.get('/login', isGuest, authController.getLogin);
router.post('/login', isGuest, loginLimiter, authController.postLogin);
router.post('/logout', isAuthenticated, authController.postLogout);
router.get('/logout', isAuthenticated, authController.postLogout);

// All routes below require active session authentication
router.use(isAuthenticated);

// Dashboard
router.get('/', dashboardController.getIndex);

// Settings
router.get('/settings', requireRole('super_admin', 'administrator'), settingsController.getIndex);
router.post(
  '/settings',
  requireRole('super_admin', 'administrator'),
  upload.fields([
    { name: 'school_logo', maxCount: 1 },
    { name: 'school_favicon', maxCount: 1 }
  ]),
  settingsController.postUpdate
);
router.get('/settings/colors', requireRole('super_admin', 'administrator'), settingsController.getColors);
router.post('/settings/colors', requireRole('super_admin', 'administrator'), settingsController.postColors);

// News & Articles
router.get('/news', newsController.index);
router.get('/news/create', newsController.create);
router.post('/news', upload.single('image'), newsController.store);
router.get('/news/:id/edit', newsController.edit);
router.put('/news/:id', upload.single('image'), newsController.update);
router.post('/news/:id/update', upload.single('image'), newsController.update);
router.delete('/news/:id', newsController.destroy);
router.post('/news/:id/delete', newsController.destroy);

// Teachers
router.get('/teachers', teachersController.index);
router.get('/teachers/create', teachersController.create);
router.post('/teachers', upload.single('photo'), teachersController.store);
router.get('/teachers/:id/edit', teachersController.edit);
router.put('/teachers/:id', upload.single('photo'), teachersController.update);
router.post('/teachers/:id/update', upload.single('photo'), teachersController.update);
router.delete('/teachers/:id', teachersController.destroy);
router.post('/teachers/:id/delete', teachersController.destroy);

// Staff (Tenaga Kependidikan)
router.get('/staff', staffController.index);
router.get('/staff/create', staffController.create);
router.post('/staff', upload.single('photo'), staffController.store);
router.get('/staff/:id/edit', staffController.edit);
router.put('/staff/:id', upload.single('photo'), staffController.update);
router.post('/staff/:id/update', upload.single('photo'), staffController.update);
router.delete('/staff/:id', staffController.destroy);
router.post('/staff/:id/delete', staffController.destroy);

// Gallery
router.get('/gallery', galleryController.index);
router.get('/gallery/create', galleryController.create);
router.get('/gallery/categories', galleryController.categories);
router.get('/gallery/categories/manage', galleryController.categories);
router.post('/gallery/categories', galleryController.storeCategory);
router.post('/gallery/categories/:id/delete', galleryController.destroyCategory);
router.post('/gallery', upload.array('photos', 15), galleryController.store);
router.get('/gallery/:id/edit', galleryController.edit);
router.put('/gallery/:id', upload.single('photo'), galleryController.update);
router.post('/gallery/:id/update', upload.single('photo'), galleryController.update);
router.delete('/gallery/:id', galleryController.destroy);
router.post('/gallery/:id/delete', galleryController.destroy);

// PPDB (Penerimaan Peserta Didik Baru)
router.get('/ppdb', ppdbController.getApplicants);
router.get('/ppdb/settings', ppdbController.getSettings);
router.post('/ppdb/settings', ppdbController.postSettings);
router.post('/ppdb/requirements', ppdbController.storeRequirement);
router.post('/ppdb/requirements/:id/delete', ppdbController.destroyRequirement);
router.get('/ppdb/:id', ppdbController.getApplicant);
router.post('/ppdb/:id/status', ppdbController.postUpdateStatus);
router.delete('/ppdb/:id', ppdbController.destroyApplicant);
router.post('/ppdb/:id/delete', ppdbController.destroyApplicant);

// Contact Messages
router.get('/contact', contactController.index);
router.get('/contact/:id', contactController.show);
router.post('/contact/:id/reply', contactController.postReply);
router.delete('/contact/:id', contactController.destroy);
router.post('/contact/:id/delete', contactController.destroy);

// Users Management (Super Admin only)
router.get('/users', requireRole('super_admin'), usersController.index);
router.get('/users/create', requireRole('super_admin'), usersController.create);
router.post('/users', requireRole('super_admin'), upload.single('avatar'), usersController.store);
router.get('/users/:id/edit', requireRole('super_admin'), usersController.edit);
router.put('/users/:id', requireRole('super_admin'), upload.single('avatar'), usersController.update);
router.post('/users/:id/update', requireRole('super_admin'), upload.single('avatar'), usersController.update);
router.delete('/users/:id', requireRole('super_admin'), usersController.destroy);
router.post('/users/:id/delete', requireRole('super_admin'), usersController.destroy);

// Media Manager
router.get('/media', mediaController.index);
router.post('/media/upload', upload.array('files', 15), mediaController.uploadMedia);
router.delete('/media/:id', mediaController.destroy);
router.post('/media/:id/delete', mediaController.destroy);

// Announcements
router.get('/announcements', announcementsController.index);
router.get('/announcements/create', announcementsController.create);
router.post('/announcements', upload.single('attachment'), announcementsController.store);
router.get('/announcements/:id/edit', announcementsController.edit);
router.put('/announcements/:id', upload.single('attachment'), announcementsController.update);
router.post('/announcements/:id/update', upload.single('attachment'), announcementsController.update);
router.delete('/announcements/:id', announcementsController.destroy);
router.post('/announcements/:id/delete', announcementsController.destroy);

// Events / Agenda
router.get('/events', eventsController.index);
router.get('/events/create', eventsController.create);
router.post('/events', upload.single('image'), eventsController.store);
router.get('/events/:id/edit', eventsController.edit);
router.put('/events/:id', upload.single('image'), eventsController.update);
router.post('/events/:id/update', upload.single('image'), eventsController.update);
router.delete('/events/:id', eventsController.destroy);
router.post('/events/:id/delete', eventsController.destroy);

// Achievements
router.get('/achievements', achievementsController.index);
router.get('/achievements/create', achievementsController.create);
router.post('/achievements', upload.single('image'), achievementsController.store);
router.get('/achievements/:id/edit', achievementsController.edit);
router.put('/achievements/:id', upload.single('image'), achievementsController.update);
router.post('/achievements/:id/update', upload.single('image'), achievementsController.update);
router.delete('/achievements/:id', achievementsController.destroy);
router.post('/achievements/:id/delete', achievementsController.destroy);

// Facilities
router.get('/facilities', facilitiesController.index);
router.get('/facilities/create', facilitiesController.create);
router.post('/facilities', upload.single('image'), facilitiesController.store);
router.get('/facilities/:id/edit', facilitiesController.edit);
router.put('/facilities/:id', upload.single('image'), facilitiesController.update);
router.post('/facilities/:id/update', upload.single('image'), facilitiesController.update);
router.delete('/facilities/:id', facilitiesController.destroy);
router.post('/facilities/:id/delete', facilitiesController.destroy);

// Extracurriculars
router.get('/extracurriculars', extracurricularsController.index);
router.get('/extracurriculars/create', extracurricularsController.create);
router.post('/extracurriculars', upload.single('image'), extracurricularsController.store);
router.get('/extracurriculars/:id/edit', extracurricularsController.edit);
router.put('/extracurriculars/:id', upload.single('image'), extracurricularsController.update);
router.post('/extracurriculars/:id/update', upload.single('image'), extracurricularsController.update);
router.delete('/extracurriculars/:id', extracurricularsController.destroy);
router.post('/extracurriculars/:id/delete', extracurricularsController.destroy);

// Programs
router.get('/programs', programsController.index);
router.get('/programs/create', programsController.create);
router.post('/programs', upload.single('image'), programsController.store);
router.get('/programs/:id/edit', programsController.edit);
router.put('/programs/:id', upload.single('image'), programsController.update);
router.post('/programs/:id/update', upload.single('image'), programsController.update);
router.delete('/programs/:id', programsController.destroy);
router.post('/programs/:id/delete', programsController.destroy);

// Curriculum
router.get('/curriculum', curriculumController.index);
router.get('/curriculum/create', curriculumController.create);
router.post('/curriculum', upload.single('file'), curriculumController.store);
router.get('/curriculum/:id/edit', curriculumController.edit);
router.put('/curriculum/:id', upload.single('file'), curriculumController.update);
router.post('/curriculum/:id/update', upload.single('file'), curriculumController.update);
router.delete('/curriculum/:id', curriculumController.destroy);
router.post('/curriculum/:id/delete', curriculumController.destroy);

// Academic Calendar
router.get('/academic-calendar', academicCalendarController.index);
router.get('/academic-calendar/create', academicCalendarController.create);
router.post('/academic-calendar', academicCalendarController.store);
router.get('/academic-calendar/:id/edit', academicCalendarController.edit);
router.put('/academic-calendar/:id', academicCalendarController.update);
router.post('/academic-calendar/:id/update', academicCalendarController.update);
router.delete('/academic-calendar/:id', academicCalendarController.destroy);
router.post('/academic-calendar/:id/delete', academicCalendarController.destroy);

// Organizational Structure
router.get('/org-structure', organizationalStructureController.index);
router.get('/org-structure/create', organizationalStructureController.create);
router.post('/org-structure', upload.single('photo'), organizationalStructureController.store);
router.get('/org-structure/:id/edit', organizationalStructureController.edit);
router.put('/org-structure/:id', upload.single('photo'), organizationalStructureController.update);
router.post('/org-structure/:id/update', upload.single('photo'), organizationalStructureController.update);
router.delete('/org-structure/:id', organizationalStructureController.destroy);
router.post('/org-structure/:id/delete', organizationalStructureController.destroy);

// Homepage Sections Content
router.get('/homepage-sections', homepageSectionsController.index);
router.get('/homepage-sections/:id/edit', homepageSectionsController.edit);
router.put('/homepage-sections/:id', upload.single('image'), homepageSectionsController.update);
router.post('/homepage-sections/:id/update', upload.single('image'), homepageSectionsController.update);

// Menus
router.get('/menus', menusController.index);
router.get('/menus/create', menusController.create);
router.post('/menus', menusController.store);
router.get('/menus/:id/edit', menusController.edit);
router.put('/menus/:id', menusController.update);
router.post('/menus/:id/update', menusController.update);
router.delete('/menus/:id', menusController.destroy);
router.post('/menus/:id/delete', menusController.destroy);

// Social Media Links
router.get('/social-media', socialMediaController.index);
router.post('/social-media', socialMediaController.store);
router.post('/social-media/:id/update', socialMediaController.update);
router.post('/social-media/:id/delete', socialMediaController.destroy);

export default router;
