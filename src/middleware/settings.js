import { dbFindMany } from '../config/database.js';

const defaultSettings = {
  school_name: 'SMA Negeri Nusantara',
  school_tagline: 'Mencetak Generasi Unggul, Berkarakter & Berprestasi Global',
  school_description: 'Institusi pendidikan terkemuka.',
  school_address: 'Jl. Pendidikan No. 45, Jakarta Selatan',
  school_phone: '(021) 7890-1234',
  school_email: 'info@sekolah.sch.id',
  school_whatsapp: '6281234567890',
  school_hours: 'Senin - Jumat: 07:00 - 16:00 WIB',
  school_maps_embed: '',
  school_logo: '/images/logo.svg',
  school_favicon: '/images/logo.svg',
  primary_color: '#1a3a6b',
  secondary_color: '#c8a84b',
  accent_color: '#e8f0fe',
  ppdb_open: 'true',
  ppdb_year: '2025/2026',
  meta_title: 'SMA Negeri Nusantara',
  meta_description: 'Situs resmi SMA Negeri Nusantara.'
};

export const loadSettings = async (req, res, next) => {
  try {
    const settingsRows = dbFindMany('school_settings');
    const settings = { ...defaultSettings };
    settingsRows.forEach(item => { settings[item.key] = item.value; });
    res.locals.settings = settings;

    const socialMedia = dbFindMany('social_media', { where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    res.locals.socialMedia = socialMedia;

    const menus = dbFindMany('menus', {
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' }
    }).map(menu => ({
      ...menu,
      children: dbFindMany('menus', {
        where: { isActive: true, parentId: menu.id },
        orderBy: { sortOrder: 'asc' }
      })
    }));
    res.locals.navMenus = menus;
    res.locals.currentPath = req.path;
  } catch (error) {
    res.locals.settings = defaultSettings;
    res.locals.socialMedia = [];
    res.locals.navMenus = [];
    res.locals.currentPath = req.path;
  }
  next();
};

export default loadSettings;
