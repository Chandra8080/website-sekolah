import { dbFindMany, dbFindFirst, dbFindUnique, dbCount } from '../../config/database.js';

export const getIndex = async (req, res) => {
  try {
    const sections = dbFindMany('homepage_sections', {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    const headmaster = dbFindFirst('teachers', {
      where: { isHeadmaster: true, isActive: true }
    });

    const newsCategories = dbFindMany('news_categories');
    const rawNews = dbFindMany('news', {
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 3
    });
    const latestNews = rawNews.map(item => ({
      ...item,
      category: newsCategories.find(c => c.id === item.categoryId) || null
    }));

    const announcements = dbFindMany('announcements', {
      where: { isPublished: true },
      orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
      take: 4
    });

    const upcomingEvents = dbFindMany('events', {
      where: { isPublished: true },
      orderBy: { startDate: 'asc' },
      take: 3
    });

    const achievements = dbFindMany('achievements', {
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { date: 'desc' }],
      take: 4
    });

    const galleryCategories = dbFindMany('gallery_categories');
    const rawGalleries = dbFindMany('galleries', {
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 8
    });
    const galleryItems = rawGalleries.map(item => ({
      ...item,
      category: galleryCategories.find(c => c.id === item.categoryId) || null
    }));

    const programs = dbFindMany('programs', {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 4
    });

    const facilities = dbFindMany('facilities', {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 6
    });

    const teachersCount = dbCount('teachers', { where: { isActive: true } });
    const studentsCount = dbCount('ppdb_applicants', { where: { status: 'accepted' } });
    const achievementsCount = dbCount('achievements', { where: { isPublished: true } });
    const alumniCount = dbFindUnique('school_settings', { where: { key: 'stat_alumni' } });

    // Build map for sections
    const sectionMap = {};
    sections.forEach((s) => {
      sectionMap[s.key] = s;
    });

    const stats = {
      teachers: teachersCount > 0 ? teachersCount : 45,
      students: studentsCount > 0 ? studentsCount + 750 : 850,
      achievements: achievementsCount > 0 ? achievementsCount : 120,
      alumni: alumniCount ? parseInt(alumniCount.value, 10) : 3400
    };

    res.render('public/pages/index', {
      pageTitle: 'Beranda',
      sectionMap,
      headmaster,
      latestNews,
      announcements,
      upcomingEvents,
      achievements,
      galleryItems,
      programs,
      facilities,
      stats
    });
  } catch (error) {
    console.error('Home controller error:', error);
    res.render('public/pages/index', {
      pageTitle: 'Beranda',
      sectionMap: {},
      headmaster: null,
      latestNews: [],
      announcements: [],
      upcomingEvents: [],
      achievements: [],
      galleryItems: [],
      programs: [],
      facilities: [],
      stats: { teachers: 45, students: 850, achievements: 120, alumni: 3400 }
    });
  }
};

export default {
  getIndex
};
