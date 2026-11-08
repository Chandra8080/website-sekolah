import { dbFindMany } from '../../config/database.js';

export const getSitemap = async (req, res) => {
  try {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    const news = dbFindMany('news', {
      where: { isPublished: true },
      select: { slug: true, updatedAt: true }
    });
    const events = dbFindMany('events', {
      where: { isPublished: true },
      select: { slug: true, updatedAt: true }
    });

    const staticRoutes = [
      '',
      '/profile/about',
      '/profile/history',
      '/profile/visi-misi',
      '/profile/structure',
      '/profile/headmaster',
      '/teachers',
      '/academic',
      '/academic/programs',
      '/academic/curriculum',
      '/academic/extracurriculars',
      '/facilities',
      '/news',
      '/announcements',
      '/events',
      '/achievements',
      '/gallery',
      '/ppdb',
      '/ppdb/status',
      '/contact'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static routes
    staticRoutes.forEach((route) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    });

    // News articles
    news.forEach((item) => {
      const dateStr = item.updatedAt ? new Date(item.updatedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/news/${item.slug}</loc>\n`;
      xml += `    <lastmod>${dateStr}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // Events
    events.forEach((item) => {
      const dateStr = item.updatedAt ? new Date(item.updatedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/events/${item.slug}</loc>\n`;
      xml += `    <lastmod>${dateStr}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).end();
  }
};

export default {
  getSitemap
};
