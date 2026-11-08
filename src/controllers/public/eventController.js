import { dbFindMany, dbFindUnique, dbCount } from '../../config/database.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';

export const getIndex = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 9);
    const tab = req.query.tab || 'upcoming';
    const now = new Date();

    const where = {
      isPublished: true,
      ...(tab === 'upcoming' ? { startDate: { gte: now } } : { startDate: { lt: now } })
    };

    const total = dbCount('events', { where });
    const events = dbFindMany('events', {
      where,
      orderBy: { startDate: tab === 'upcoming' ? 'asc' : 'desc' },
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('public/pages/events/index', {
      pageTitle: 'Agenda & Kegiatan Sekolah',
      events,
      pagination,
      tab
    });
  } catch (error) {
    console.error('Events public error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat agenda kegiatan.'
    });
  }
};

export const getDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    const event = dbFindUnique('events', {
      where: { slug }
    });

    if (!event || !event.isPublished) {
      return res.status(404).render('public/errors/404', {
        pageTitle: 'Agenda Tidak Ditemukan',
        url: req.originalUrl
      });
    }

    const allEvents = dbFindMany('events', {
      where: { isPublished: true },
      orderBy: { startDate: 'asc' }
    });
    const otherEvents = allEvents.filter(e => e.id !== event.id).slice(0, 3);

    res.render('public/pages/events/detail', {
      pageTitle: event.title,
      event,
      otherEvents
    });
  } catch (error) {
    console.error('Event detail error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat detail agenda.'
    });
  }
};

export default {
  getIndex,
  getDetail
};
