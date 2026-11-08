import { dbFindMany } from '../../config/database.js';

export const getIndex = async (req, res) => {
  try {
    const extracurriculars = dbFindMany('extracurriculars', {
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });

    res.render('public/pages/academic/extracurriculars', {
      pageTitle: 'Ekstrakurikuler & Pengembangan Diri',
      extracurriculars
    });
  } catch (error) {
    console.error('Extracurricular public error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat kegiatan ekstrakurikuler.'
    });
  }
};

export default {
  getIndex
};
