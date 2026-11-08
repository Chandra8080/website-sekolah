import { dbFindMany, dbFindUnique, dbFindFirst } from '../../config/database.js';

export const getAbout = async (req, res) => {
  try {
    const section = dbFindUnique('homepage_sections', { where: { key: 'about' } });
    const facilities = dbFindMany('facilities', { where: { isActive: true }, take: 4 });

    res.render('public/pages/profile/about', {
      pageTitle: 'Tentang Sekolah',
      section,
      facilities
    });
  } catch (error) {
    console.error('About error:', error);
    res.render('public/pages/profile/about', { pageTitle: 'Tentang Sekolah', section: null, facilities: [] });
  }
};

export const getHistory = async (req, res) => {
  try {
    const section = dbFindUnique('homepage_sections', { where: { key: 'history' } });
    res.render('public/pages/profile/history', {
      pageTitle: 'Sejarah Singkat',
      section
    });
  } catch (error) {
    console.error('History error:', error);
    res.render('public/pages/profile/history', { pageTitle: 'Sejarah Singkat', section: null });
  }
};

export const getVisiMisi = async (req, res) => {
  try {
    const section = dbFindUnique('homepage_sections', { where: { key: 'visi_misi' } });
    res.render('public/pages/profile/visi-misi', {
      pageTitle: 'Visi & Misi',
      section
    });
  } catch (error) {
    console.error('VisiMisi error:', error);
    res.render('public/pages/profile/visi-misi', { pageTitle: 'Visi & Misi', section: null });
  }
};

export const getStructure = async (req, res) => {
  try {
    const structures = dbFindMany('organizational_structures', {
      where: { isActive: true },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }]
    });

    res.render('public/pages/profile/structure', {
      pageTitle: 'Struktur Organisasi',
      structures
    });
  } catch (error) {
    console.error('Structure error:', error);
    res.render('public/pages/profile/structure', { pageTitle: 'Struktur Organisasi', structures: [] });
  }
};

export const getHeadmaster = async (req, res) => {
  try {
    const headmaster = dbFindFirst('teachers', {
      where: { isHeadmaster: true, isActive: true }
    });

    res.render('public/pages/profile/headmaster', {
      pageTitle: 'Sambutan Kepala Sekolah',
      headmaster
    });
  } catch (error) {
    console.error('Headmaster error:', error);
    res.render('public/pages/profile/headmaster', { pageTitle: 'Sambutan Kepala Sekolah', headmaster: null });
  }
};

export default {
  getAbout,
  getHistory,
  getVisiMisi,
  getStructure,
  getHeadmaster
};
