import 'dotenv/config';
import app from '../src/app.js';

async function testAdmin() {
  console.log('🧪 Starting Admin Authentication & Dashboard Tests...\n');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Get Login Page & CSRF token
    const loginPageRes = await fetch(`${baseUrl}/admin/login`);
    const loginHtml = await loginPageRes.text();
    const cookie = loginPageRes.headers.get('set-cookie');

    // Extract CSRF token
    const csrfMatch = loginHtml.match(/name="_csrf"\s+value="([^"]+)"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    console.log(`  ✓ GET /admin/login status ${loginPageRes.status}`);
    console.log(`  ✓ Extracted CSRF token: ${csrfToken ? 'Yes' : 'No'}`);

    // 2. Submit Login Form
    const bodyParams = new URLSearchParams();
    bodyParams.append('_csrf', csrfToken);
    bodyParams.append('username', 'admin');
    bodyParams.append('password', 'Admin@12345');

    const loginRes = await fetch(`${baseUrl}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie || ''
      },
      body: bodyParams.toString(),
      redirect: 'manual'
    });

    console.log(`  ✓ POST /admin/login status ${loginRes.status} (Redirect: ${loginRes.headers.get('location')})`);
    const sessionCookie = loginRes.headers.get('set-cookie') || cookie;

    // 3. Test Protected Admin Routes with Session
    const adminRoutes = [
      '/admin',
      '/admin/academic-calendar',
      '/admin/achievements',
      '/admin/announcements',
      '/admin/contact',
      '/admin/curriculum',
      '/admin/events',
      '/admin/extracurriculars',
      '/admin/facilities',
      '/admin/gallery',
      '/admin/gallery/categories',
      '/admin/homepage-sections',
      '/admin/media',
      '/admin/menus',
      '/admin/news',
      '/admin/org-structure',
      '/admin/ppdb',
      '/admin/ppdb/settings',
      '/admin/programs',
      '/admin/settings',
      '/admin/settings/colors',
      '/admin/social-media',
      '/admin/staff',
      '/admin/teachers',
      '/admin/users'
    ];

    for (const route of adminRoutes) {
      const res = await fetch(`${baseUrl}${route}`, {
        headers: {
          'Cookie': sessionCookie
        }
      });
      if (res.status !== 200) {
        throw new Error(`Admin route ${route} failed with status ${res.status}`);
      }
      const text = await res.text();
      console.log(`  ✓ Protected route: ${route.padEnd(30)} [${res.status}] (${text.length} bytes)`);
    }

    console.log('\n🎉 ALL 25 ADMIN ROUTES TESTED & WORKING PERFECTLY!');
  } finally {
    server.close();
  }
}

testAdmin().catch(err => {
  console.error('\n❌ Admin test failed:', err);
  process.exit(1);
});
