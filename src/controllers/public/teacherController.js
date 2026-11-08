import { dbFindMany } from '../../config/database.js';

export const getIndex = async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const search = req.query.search ? req.query.search.trim() : '';

    const where = { isActive: true, isPublished: true };
    if (category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { subject: { contains: search } },
        { position: { contains: search } }
      ];
    }

    const teachers = dbFindMany('teachers', {
      where,
      orderBy: [{ isHeadmaster: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }]
    });

    const staffList = (category === 'all' || category === 'staff')
      ? dbFindMany('staff', {
          where: { isActive: true, isPublished: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
        })
      : [];

    res.render('public/pages/teachers/index', {
      pageTitle: 'Guru & Tenaga Kependidikan',
      teachers,
      staffList,
      category,
      search
    });
  } catch (error) {
    console.error('Teacher public error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat profil tenaga pendidik.'
    });
  }
};

export default {
  getIndex
};
