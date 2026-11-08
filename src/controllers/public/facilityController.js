import { dbFindMany } from '../../config/database.js';

export const getIndex = async (req, res) => {
  try {
    const category = req.query.category || '';

    const where = { isActive: true };
    if (category) where.category = category;

    const facilities = dbFindMany('facilities', {
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });

    // Unique categories
    const allActive = dbFindMany('facilities', { where: { isActive: true } });
    const categories = [...new Set(allActive.map(c => c.category).filter(Boolean))];

    res.render('public/pages/facilities/index', {
      pageTitle: 'Sarana & Prasarana Sekolah',
      facilities,
      categories,
      selectedCategory: category
    });
  } catch (error) {
    console.error('Facility public error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat sarana dan prasarana.'
    });
  }
};

export default {
  getIndex
};
