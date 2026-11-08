import { dbFindMany } from '../../config/database.js';

export const getIndex = async (req, res) => {
  try {
    const programs = dbFindMany('programs', {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    const curriculums = dbFindMany('curriculum', {
      where: { isActive: true },
      orderBy: { year: 'desc' }
    });
    const calendarEvents = dbFindMany('academic_calendars', {
      where: { isPublished: true },
      orderBy: { startDate: 'asc' },
      take: 6
    });

    res.render('public/pages/academic/index', {
      pageTitle: 'Informasi Akademik & Kurikulum',
      programs,
      curriculums,
      calendarEvents
    });
  } catch (error) {
    console.error('Academic index error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat portal akademik.'
    });
  }
};

export const getPrograms = async (req, res) => {
  try {
    const programs = dbFindMany('programs', {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.render('public/pages/academic/programs', {
      pageTitle: 'Program Peminatan & Keahlian',
      programs
    });
  } catch (error) {
    console.error('Programs list error:', error);
    res.redirect('/academic');
  }
};

export const getCurriculum = async (req, res) => {
  try {
    const curriculums = dbFindMany('curriculum', {
      where: { isActive: true },
      orderBy: { year: 'desc' }
    });

    res.render('public/pages/academic/curriculum', {
      pageTitle: 'Struktur Kurikulum',
      curriculums
    });
  } catch (error) {
    console.error('Curriculum page error:', error);
    res.redirect('/academic');
  }
};

export default {
  getIndex,
  getPrograms,
  getCurriculum
};
