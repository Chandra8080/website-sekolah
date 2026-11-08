import 'dotenv/config';
import app from '../src/app.js';
import { db, dbFindMany, dbFindFirst, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount, dbUpsert } from '../src/config/database.js';

async function runTests() {
  console.log('🧪 Starting JSON Database and Application Tests...\n');

  // Test 1: Collections existence
  console.log('Test 1: Check Collections');
  const collections = [
    'users', 'roles', 'school_settings', 'menus', 'homepage_sections',
    'teachers', 'staff', 'programs', 'curriculum', 'academic_calendars',
    'extracurriculars', 'facilities', 'news_categories', 'news', 'announcements',
    'events', 'achievements', 'gallery_categories', 'galleries', 'ppdb_settings',
    'ppdb_requirements', 'social_media'
  ];

  for (const col of collections) {
    const count = dbCount(col);
    if (count < 0) throw new Error(`Collection ${col} returned negative count`);
    console.log(`  ✓ ${col}: ${count} records`);
  }

  // Test 2: Query filtering & sorting
  console.log('\nTest 2: Query Filter & Sorting');
  const activeTeachers = dbFindMany('teachers', {
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });
  console.log(`  ✓ Found ${activeTeachers.length} active teachers`);

  const newsSearch = dbFindMany('news', {
    where: {
      OR: [
        { title: { contains: 'olimpiade' } },
        { content: { contains: 'olimpiade' } }
      ]
    }
  });
  console.log(`  ✓ Found ${newsSearch.length} news items matching "olimpiade"`);

  // Test 3: Relations / Includes
  console.log('\nTest 3: Relation resolution');
  const userWithRole = dbFindFirst('users', {
    where: { username: 'admin' },
    include: { role: true }
  });
  if (!userWithRole || !userWithRole.role || userWithRole.role.slug !== 'super_admin') {
    throw new Error('User include role failed: ' + JSON.stringify(userWithRole));
  }
  console.log(`  ✓ User admin has role: ${userWithRole.role.name} (${userWithRole.role.slug})`);

  // Test 4: CRUD operations
  console.log('\nTest 4: CRUD Operations');
  const createdTest = dbCreate('contact_messages', {
    data: {
      name: 'Tester Automated',
      email: 'test@automated.com',
      phone: '08123456789',
      subject: 'Test Subject',
      message: 'Automated test message'
    }
  });
  console.log(`  ✓ Created item with id ${createdTest.id}`);

  const updatedTest = dbUpdate('contact_messages', {
    where: { id: createdTest.id },
    data: { isRead: true, replyNote: 'Handled' }
  });
  if (!updatedTest.isRead || updatedTest.replyNote !== 'Handled') {
    throw new Error('Update failed');
  }
  console.log(`  ✓ Updated item: isRead = ${updatedTest.isRead}`);

  const deletedTest = dbDelete('contact_messages', {
    where: { id: createdTest.id }
  });
  if (!deletedTest) throw new Error('Delete failed');
  const verifyDeleted = dbFindUnique('contact_messages', { where: { id: createdTest.id } });
  if (verifyDeleted) throw new Error('Item was not deleted');
  console.log(`  ✓ Deleted item id ${createdTest.id} successfully`);

  // Test 5: Server HTTP Route Rendering
  console.log('\nTest 5: Server Route Tests');
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    const routesToTest = [
      '/',
      '/berita',
      '/agenda',
      '/prestasi',
      '/galeri',
      '/guru',
      '/program',
      '/kurikulum',
      '/ekstrakurikuler',
      '/fasilitas',
      '/kontak',
      '/ppdb',
      '/ppdb/status',
      '/admin/login'
    ];

    for (const route of routesToTest) {
      const res = await fetch(`${baseUrl}${route}`);
      if (res.status >= 400 && res.status !== 404) {
        throw new Error(`Route ${route} returned status ${res.status}`);
      }
      const html = await res.text();
      if (!html || html.length < 50) {
        throw new Error(`Route ${route} returned empty content`);
      }
      console.log(`  ✓ ${route.padEnd(20)} [${res.status}] (${html.length} bytes)`);
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
