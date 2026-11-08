import { dbFindMany, dbCount } from '../../config/database.js';

export const getIndex = async (req, res) => {
  try {
    const newsCount = dbCount('news');
    const teachersCount = dbCount('teachers');
    const applicantsCount = dbCount('ppdb_applicants');
    const achievementsCount = dbCount('achievements');
    const eventsCount = dbCount('events');
    const unreadMessagesCount = dbCount('contact_messages', { where: { isRead: false } });

    const recentApplicants = dbFindMany('ppdb_applicants', {
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const recentMessages = dbFindMany('contact_messages', {
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const recentActivities = dbFindMany('activity_logs', {
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });

    const recentNews = dbFindMany('news', {
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    });

    // Applicants status grouping for analytics
    const allApplicants = dbFindMany('ppdb_applicants');
    const statusMap = { pending: 0, verified: 0, accepted: 0, rejected: 0 };
    allApplicants.forEach((a) => {
      if (statusMap[a.status] !== undefined) {
        statusMap[a.status]++;
      } else if (a.status) {
        statusMap[a.status] = 1;
      }
    });

    res.render('admin/dashboard/index', {
      pageTitle: 'Ringkasan Dashboard',
      stats: {
        newsCount,
        teachersCount,
        applicantsCount,
        achievementsCount,
        eventsCount,
        unreadMessagesCount
      },
      statusMap,
      recentApplicants,
      recentMessages,
      recentActivities,
      recentNews
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    req.flash('error', 'Gagal memuat data dashboard.');
    res.render('admin/dashboard/index', {
      pageTitle: 'Dashboard',
      stats: {
        newsCount: 0,
        teachersCount: 0,
        applicantsCount: 0,
        achievementsCount: 0,
        eventsCount: 0,
        unreadMessagesCount: 0
      },
      statusMap: { pending: 0, verified: 0, accepted: 0, rejected: 0 },
      recentApplicants: [],
      recentMessages: [],
      recentActivities: [],
      recentNews: []
    });
  }
};

export default {
  getIndex
};
