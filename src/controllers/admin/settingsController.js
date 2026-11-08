import { dbFindMany, dbUpsert } from '../../config/database.js';
import { logActivity } from '../../utils/logger.js';

export const getIndex = async (req, res) => {
  try {
    const settings = dbFindMany('school_settings', {
      orderBy: [{ group: 'asc' }, { id: 'asc' }]
    });

    // Group settings
    const groupedSettings = {};
    settings.forEach((s) => {
      const g = s.group || 'general';
      if (!groupedSettings[g]) groupedSettings[g] = [];
      groupedSettings[g].push(s);
    });

    res.render('admin/settings/index', {
      pageTitle: 'Pengaturan Sekolah',
      groupedSettings,
      activeTab: req.query.tab || 'general'
    });
  } catch (error) {
    console.error('Settings index error:', error);
    req.flash('error', 'Gagal memuat pengaturan.');
    res.redirect('/admin');
  }
};

export const postUpdate = async (req, res) => {
  try {
    const data = req.body;
    const tab = req.query.tab || 'general';

    // Handle file upload for school_logo or favicon if present
    if (req.files) {
      if (req.files.school_logo && req.files.school_logo[0]) {
        data.school_logo = `/uploads/${req.files.school_logo[0].filename}`;
      }
      if (req.files.school_favicon && req.files.school_favicon[0]) {
        data.school_favicon = `/uploads/${req.files.school_favicon[0].filename}`;
      }
    }

    const updates = Object.keys(data).filter((k) => k !== '_csrf' && k !== '_method');

    for (const key of updates) {
      const val = typeof data[key] === 'string' ? data[key].trim() : String(data[key]);
      dbUpsert('school_settings', {
        where: { key },
        update: { value: val },
        create: {
          key,
          value: val,
          group: tab,
          label: key.replace(/_/g, ' ').toUpperCase()
        }
      });
    }

    await logActivity({
      req,
      action: 'UPDATE_SETTINGS',
      module: 'SETTINGS',
      description: `Memperbarui pengaturan grup ${tab}`
    });

    req.flash('success', 'Pengaturan berhasil disimpan.');
    res.redirect(`/admin/settings?tab=${tab}`);
  } catch (error) {
    console.error('Settings update error:', error);
    req.flash('error', 'Terjadi kesalahan saat menyimpan pengaturan.');
    res.redirect('/admin/settings');
  }
};

export const getColors = async (req, res) => {
  try {
    const colorSettings = dbFindMany('school_settings', {
      where: {
        key: {
          in: ['primary_color', 'secondary_color', 'accent_color', 'color_primary_dark', 'color_secondary_dark']
        }
      }
    });

    const colors = {
      primary_color: '#1a3a6b',
      secondary_color: '#c8a84b',
      accent_color: '#e8f0fe',
      color_primary_dark: '#0f2447',
      color_secondary_dark: '#a68a35'
    };

    colorSettings.forEach((item) => {
      colors[item.key] = item.value;
    });

    res.render('admin/settings/colors', {
      pageTitle: 'Tema & Palet Warna',
      colors
    });
  } catch (error) {
    console.error('Colors get error:', error);
    req.flash('error', 'Gagal memuat pengaturan warna.');
    res.redirect('/admin/settings');
  }
};

export const postColors = async (req, res) => {
  try {
    const { primary_color, secondary_color, accent_color, color_primary_dark, color_secondary_dark } = req.body;
    const colorMap = {
      primary_color,
      secondary_color,
      accent_color,
      color_primary_dark,
      color_secondary_dark
    };

    for (const [key, value] of Object.entries(colorMap)) {
      if (value) {
        dbUpsert('school_settings', {
          where: { key },
          update: { value },
          create: {
            key,
            value,
            group: 'appearance',
            type: 'color',
            label: key.replace(/_/g, ' ')
          }
        });
      }
    }

    await logActivity({
      req,
      action: 'UPDATE_COLORS',
      module: 'SETTINGS',
      description: 'Memperbarui palet warna tema website'
    });

    req.flash('success', 'Skema warna berhasil diperbarui.');
    res.redirect('/admin/settings/colors');
  } catch (error) {
    console.error('Color update error:', error);
    req.flash('error', 'Gagal menyimpan perubahan warna.');
    res.redirect('/admin/settings/colors');
  }
};

export default {
  getIndex,
  postUpdate,
  getColors,
  postColors
};
