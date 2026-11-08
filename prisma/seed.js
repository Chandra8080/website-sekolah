import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Roles
  const rolesData = [
    { name: 'Super Administrator', slug: 'super_admin', description: 'Akses penuh ke seluruh modul sistem' },
    { name: 'Administrator', slug: 'administrator', description: 'Akses tata kelola konten dan data akademik' },
    { name: 'Editor Konten', slug: 'editor', description: 'Mengelola berita, artikel, dan dokumentasi galeri' },
    { name: 'Operator PPDB', slug: 'ppdb_operator', description: 'Memverifikasi berkas dan calon peserta didik baru' }
  ];

  const roleMap = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { slug: r.slug },
      update: { name: r.name, description: r.description },
      create: r
    });
    roleMap[r.slug] = role.id;
  }
  console.log('✅ Roles seeded.');

  // 2. Default Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sekolah.sch.id';
  const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      isActive: true,
      roleId: roleMap['super_admin']
    },
    create: {
      name: 'Super Administrator',
      username: 'admin',
      email: adminEmail,
      password: hashedPassword,
      roleId: roleMap['super_admin'],
      isActive: true
    }
  });
  console.log(`✅ Default admin created: ${adminUser.email} / ${rawPassword}`);

  // 3. School Settings
  const settingsData = [
    { key: 'school_name', value: 'SMA Negeri Nusantara', group: 'general', label: 'Nama Sekolah' },
    { key: 'school_tagline', value: 'Mencetak Generasi Unggul, Berkarakter & Berprestasi Global', group: 'general', label: 'Semboyan Sekolah' },
    { key: 'school_description', value: 'Institusi pendidikan terakreditasi A yang berkomitmen menghadirkan ekosistem pembelajaran holistik, mengasah nalar kritis, dan menjunjung budi pekerti luhur.', group: 'general', label: 'Deskripsi Singkat' },
    { key: 'school_address', value: 'Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12150', group: 'contact', label: 'Alamat Sekolah' },
    { key: 'school_phone', value: '(021) 7890-1234', group: 'contact', label: 'Nomor Telepon' },
    { key: 'school_email', value: 'info@sekolah.sch.id', group: 'contact', label: 'Alamat Email' },
    { key: 'school_whatsapp', value: '081234567890', group: 'contact', label: 'WhatsApp Resmi' },
    { key: 'school_hours', value: 'Senin - Jumat: 07:00 - 16:00 WIB', group: 'contact', label: 'Jam Layanan' },
    { key: 'school_maps_embed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.295484865187!2d106.801!3d-6.224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTMnMjYuNCJTIDEwNsKwNDgnMDMuNiJF!5e0!3m2!1sid!2sid!4v1600000000000!5m2!1sid!2sid', group: 'contact', label: 'Peta Lokasi Google' },
    { key: 'primary_color', value: '#1a3a6b', group: 'appearance', label: 'Warna Primer' },
    { key: 'secondary_color', value: '#c8a84b', group: 'appearance', label: 'Warna Sekunder' },
    { key: 'accent_color', value: '#e8f0fe', group: 'appearance', label: 'Warna Aksen' },
    { key: 'ppdb_year', value: '2025/2026', group: 'ppdb', label: 'Tahun PPDB' },
    { key: 'ppdb_open', value: 'true', group: 'ppdb', label: 'Status PPDB Terbuka' },
    { key: 'stat_alumni', value: '3450', group: 'statistics', label: 'Jumlah Alumni' }
  ];

  for (const s of settingsData) {
    await prisma.schoolSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s
    });
  }
  console.log('✅ School Settings seeded.');

  // 4. PPDB Settings & Requirements
  const ppdbSettingsData = [
    { key: 'ppdb_status', value: 'open', label: 'Status Pendaftaran' },
    { key: 'ppdb_year', value: '2025/2026', label: 'Tahun Ajaran' },
    { key: 'ppdb_quota', value: '320 Siswa (10 Rombongan Belajar)', label: 'Daya Tampung' },
    { key: 'ppdb_start_date', value: '01 Mei 2025', label: 'Tanggal Buka' },
    { key: 'ppdb_end_date', value: '30 Juni 2025', label: 'Tanggal Tutup' },
    { key: 'ppdb_announcement_date', value: '05 Juli 2025', label: 'Pengumuman Hasil' }
  ];

  for (const ps of ppdbSettingsData) {
    await prisma.ppdbSetting.upsert({
      where: { key: ps.key },
      update: { value: ps.value },
      create: ps
    });
  }

  const requirementsData = [
    { title: 'Ijazah / Surat Keterangan Lulus (SKL)', description: 'Salinan resmi dari SMP/MTs sederajat yang telah dilegalisir basah', isRequired: true, sortOrder: 1 },
    { title: 'Kartu Keluarga (KK) & Akta Kelahiran', description: 'Salinan kartu keluarga domisili dan akta lahir asli calon siswa', isRequired: true, sortOrder: 2 },
    { title: 'Pas Foto Berwarna Terbaru', description: 'Ukuran 3x4 formal latar belakang merah/biru sebanyak 3 lembar', isRequired: true, sortOrder: 3 },
    { title: 'Buku Rapor SMP (Semester 1 s.d. 5)', description: 'Fotokopi nilai rapor yang telah disahkan kepala sekolah asal', isRequired: true, sortOrder: 4 },
    { title: 'Sertifikat / Piagam Kejuaraan', description: 'Bagi pendaftar jalur prestasi akademik atau non-akademik minimal tingkat kabupaten/kota', isRequired: false, sortOrder: 5 }
  ];

  await prisma.ppdbRequirement.deleteMany();
  for (const req of requirementsData) {
    await prisma.ppdbRequirement.create({ data: req });
  }
  console.log('✅ PPDB Requirements seeded.');

  // 5. Navigation Menus
  await prisma.menu.deleteMany();
  const rootMenus = [
    { title: 'Beranda', url: '/', sortOrder: 1 },
    { title: 'Profil', url: '/profile/about', sortOrder: 2 },
    { title: 'Akademik', url: '/academic', sortOrder: 3 },
    { title: 'Guru & Staf', url: '/teachers', sortOrder: 4 },
    { title: 'Berita', url: '/news', sortOrder: 5 },
    { title: 'Agenda', url: '/events', sortOrder: 6 },
    { title: 'Prestasi', url: '/achievements', sortOrder: 7 },
    { title: 'Galeri', url: '/gallery', sortOrder: 8 },
    { title: 'Kontak', url: '/contact', sortOrder: 9 }
  ];

  for (const m of rootMenus) {
    await prisma.menu.create({ data: m });
  }
  console.log('✅ Menus seeded.');

  // 6. Homepage Sections
  const hpSections = [
    {
      key: 'hero',
      title: 'Mewujudkan Generasi Pemimpin Berintegritas & Berprestasi Global',
      subtitle: 'Mengembangkan potensi intelektual, spiritual, dan kepemimpinan adaptif melalui ekosistem pendidikan berstandar tinggi.',
      sortOrder: 1
    },
    {
      key: 'intro',
      title: 'Dedikasi Terbaik untuk Masa Depan Bangsa',
      subtitle: 'Lebih dari tiga dekade mengabdi menghadirkan keunggulan sains dan kearifan budi pekerti.',
      content: 'SMA Negeri Nusantara didirikan sebagai pusat keunggulan pendidikan yang berorientasi pada pencapaian akademik mutakhir, integritas karakter, dan penguasaan teknologi global. Kami menyediakan sarana laboratorium terakreditasi, kurikulum adaptif, serta tenaga pengajar berdedikasi tinggi.',
      imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop',
      sortOrder: 2
    },
    {
      key: 'history',
      title: 'Sejarah Perjalanan Sekolah',
      subtitle: 'Tonggak penting perjalanan panjang mencerdaskan tunas bangsa.',
      content: '<p>Bermula pada tahun 1988, sekolah ini dirintis oleh para tokoh pendidik terkemuka dengan tujuan menyediakan fasilitas belajar representatif bagi generasi muda berpotensi. Dari awal berdiri dengan 3 ruang kelas, kini institusi telah bertransformasi menjadi smart campus modern dengan ribuan alumni yang berkiprah di universitas top dunia dan institusi strategis.</p>',
      sortOrder: 3
    },
    {
      key: 'visi_misi',
      title: 'Visi, Misi & Falsafah Sekolah',
      subtitle: 'Arah kompas yang membimbing setiap langkah kebijakan pendidikan.',
      content: '<p>Kami mengedepankan kolaborasi, kejujuran ilmiah, dan empati kemanusiaan dalam setiap proses belajar mengajar.</p>',
      sortOrder: 4
    }
  ];

  for (const sec of hpSections) {
    await prisma.homepageSection.upsert({
      where: { key: sec.key },
      update: sec,
      create: sec
    });
  }
  console.log('✅ Homepage Sections seeded.');

  // 7. News Categories & News Articles
  const newsCats = [
    { name: 'Kabar Akademik', slug: 'kabar-akademik', description: 'Informasi kurikulum, ujian, dan riset ilmiah' },
    { name: 'Kegiatan Siswa', slug: 'kegiatan-siswa', description: 'Aktivitas OSIS, pramuka, dan ekskul' },
    { name: 'Prestasi & Juara', slug: 'prestasi-dan-juara', description: 'Pencapaian medali lomba sains dan seni' },
    { name: 'Artikel Edukasi', slug: 'artikel-edukasi', description: 'Wawasan belajar dan tips literasi digital' }
  ];

  const catMap = {};
  for (const nc of newsCats) {
    const c = await prisma.newsCategory.upsert({
      where: { slug: nc.slug },
      update: nc,
      create: nc
    });
    catMap[nc.slug] = c.id;
  }

  const sampleNews = [
    {
      title: 'Siswa SMA Negeri Nusantara Raih Medali Emas Olimpiade Sains Nasional 2025',
      slug: 'siswa-raih-medali-emas-osn-2025',
      categoryId: catMap['prestasi-dan-juara'],
      excerpt: 'Delegasi bidang fisika dan kimia berhasil mengharumkan nama sekolah dalam ajang bergengsi tingkat nasional di Bandung.',
      content: '<p>Prestasi membanggakan kembali ditorehkan oleh siswa-siswi SMA Negeri Nusantara pada ajang Olimpiade Sains Nasional (OSN) 2025 yang digelar di Bandung. Melalui persiapan intensif selama 6 bulan di bawah bimbingan tim dosen dan guru ahli, dua medali emas berhasil diraih.</p><p>Kepala sekolah menyampaikan apresiasi setinggi-tingginya atas daya juang para peraih medali serta dedikasi para guru pembina yang tiada kenal lelah.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
      isPublished: true,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      viewCount: 342,
      author: 'Tim Redaksi'
    },
    {
      title: 'Peluncuran Laboratorium Smart AI & Robotika untuk Mendukung Kurikulum Digital',
      slug: 'peluncuran-lab-ai-robotika-2025',
      categoryId: catMap['kabar-akademik'],
      excerpt: 'Fasilitas mutakhir berstandar industri siap digunakan para siswa untuk mengembangkan kecerdasan buatan dan coding terapan.',
      content: '<p>Sebagai langkah strategis menyongsong era industri 4.0, sekolah meresmikan laboratorium kecerdasan buatan (Artificial Intelligence) dan komputasi awan. Lab ini dilengkapi perangkat workstation berspesifikasi tinggi, robot kit edukatif, serta koneksi fiber optik dedicated.</p><p>Diharapkan siswa mampu menciptakan karya teknologi aplikatif yang berdampak positif bagi masyarakat luas.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
      isPublished: true,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      viewCount: 489,
      author: 'Humas Sekolah'
    },
    {
      title: 'Peringatan Bulan Bahasa: Gelar Wicara Sastra dan Festival Teater Pelajar',
      slug: 'peringatan-bulan-bahasa-festival-teater',
      categoryId: catMap['kegiatan-siswa'],
      excerpt: 'Meriahnya festival seni sastra dengan pementasan monolog, cipta puisi, dan debat bahasa Inggris antar kelas.',
      content: '<p>Suasana semarak menyelimuti aula utama dalam rangka menyambut Bulan Bahasa tahun ini. Seluruh kontingen kelas menampilkan kreativitas terbaik melalui drama musikal, baca puisi berantai, dan pameran resensi buku karya siswa.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
      isPublished: true,
      publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      viewCount: 275,
      author: 'OSIS Nusantara'
    },
    {
      title: 'Tips Membangun Manajemen Waktu Efektif Bagi Pelajar SMA Menjelang Ujian',
      slug: 'tips-manajemen-waktu-efektif-ujian',
      categoryId: catMap['artikel-edukasi'],
      excerpt: 'Strategi belajar dengan metode Pomodoro dan penyusunan skala prioritas tugas agar tetap prima tanpa stres berlebih.',
      content: '<p>Menghadapi asesmen semester seringkali menimbulkan kecemasan bagi sebagian siswa. Bimbingan Konseling sekolah membagikan panduan praktis untuk menjaga ritme belajar harian yang seimbang dengan istirahat cukup dan olahraga ringan.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
      isPublished: true,
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      viewCount: 512,
      author: 'Drs. Hendro (Guru BK)'
    },
    {
      title: 'Kunjungan Studi Ekskursi ke Gedung Riset Sains Nasional dan BRIN',
      slug: 'studi-ekskursi-brin-2025',
      categoryId: catMap['kegiatan-siswa'],
      excerpt: 'Siswa kelas XI peminatan sains berinteraksi langsung dengan peneliti senior dan mengamati teknologi nano.',
      content: '<p>Pembelajaran di luar kelas kembali diadakan untuk memberikan pengalaman empiris kepada siswa peminatan MIPA. Sebanyak 120 siswa mengunjungi fasilitas laboratorium riset nasional guna melihat proses riset bioteknologi terkini.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop',
      isPublished: true,
      publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      viewCount: 198,
      author: 'Tim Kurikulum'
    }
  ];

  for (const n of sampleNews) {
    await prisma.news.upsert({
      where: { slug: n.slug },
      update: n,
      create: n
    });
  }
  console.log('✅ News articles seeded.');

  // 8. Sample Announcements
  const announcementsData = [
    {
      title: 'Pemberitahuan Pelaksanaan Asesmen Sumatif Akhir Semester Genap',
      content: '<p>Diberitahukan kepada seluruh siswa kelas X, XI, dan XII bahwa Asesmen Sumatif Akhir Semester akan diselenggarakan secara serentak menggunakan sistem Computer Based Test (CBT) mulai tanggal 2 s.d. 13 Juni 2025. Harap mempersiapkan perangkat dan kartu peserta ujian.</p>',
      category: 'akademik',
      priority: 'urgent',
      isPublished: true,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Sosialisasi Alur Penerimaan Peserta Didik Baru (PPDB) Jalur Afirmasi & Zonasi',
      content: '<p>Bagi orang tua calon siswa baru, sekolah menyelenggarakan sesi zoom konsultasi alur pemberkasan berkas PPDB daring setiap hari kerja pukul 09.00 - 11.00 WIB. Tautan zoom dapat diakses melalui portal PPDB.</p>',
      category: 'umum',
      priority: 'high',
      isPublished: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Pendaftaran Ekstrakurikuler Paskibraka & Patroli Keamanan Sekolah',
      content: '<p>Pendaftaran anggota baru angkatan 2025 dibuka untuk seluruh siswa kelas X. Formulir fisik dapat diambil di ruang pembina kesiswaan selambatnya akhir pekan ini.</p>',
      category: 'kesiswaan',
      priority: 'normal',
      isPublished: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Jadwal Libur Awal Ramadhan dan Pembelajaran Jarak Jauh',
      content: '<p>Sesuai kalender dinas pendidikan, kegiatan belajar tatap muka ditiadakan pada hari pertama Ramadhan dan digantikan penugasan mandiri literasi keagamaan.</p>',
      category: 'umum',
      priority: 'normal',
      isPublished: true,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Pengambilan Ijazah dan Cap Tiga Jari Kelulusan Angkatan Sebelumnya',
      content: '<p>Alumni yang belum mengambil ijazah dimohon segera hadir di loket tata usaha dengan membawa kartu tanda peserta ujian asli pada jam kerja.</p>',
      category: 'kepegawaian',
      priority: 'normal',
      isPublished: true,
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const a of announcementsData) {
    await prisma.announcement.create({ data: a });
  }
  console.log('✅ Announcements seeded.');

  // 9. Sample Events
  const eventsData = [
    {
      title: 'Upacara Peringatan Hari Pendidikan Nasional & Expo Budaya',
      slug: 'peringatan-hardiknas-expo-budaya-2025',
      description: 'Upacara bendera khidmat yang dilanjutkan dengan pawai pakaian adat nusantara serta bazar kuliner tradisional oleh perwakilan setiap kelas.',
      location: 'Lapangan Utama & Aula Terbuka',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startTime: '07:00',
      endTime: '14:00',
      status: 'upcoming',
      isPublished: true,
      imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop'
    },
    {
      title: 'Seminar Parenting: Mendampingi Anak Memilih Jurusan Perguruan Tinggi',
      slug: 'seminar-parenting-pilih-jurusan-ptn',
      description: 'Menghadirkan pakar psikologi pendidikan dan konsultan karir untuk memberikan wawasan kepada orang tua siswa kelas XI dan XII dalam pemetaan minat bakat perkuliahan.',
      location: 'Auditorium Lantai 3',
      startDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '12:30',
      status: 'upcoming',
      isPublished: true,
      imageUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=800&auto=format&fit=crop'
    },
    {
      title: 'Pameran Karya Inovasi Sains & Karya Seni Rupa Siswa',
      slug: 'pameran-karya-inovasi-sains-seni',
      description: 'Eksibisi tahunan hasil penelitian laboratorium siswa dan pameran lukisan, instalasi visual, serta prototype robotika.',
      location: 'Gedung Serbaguna',
      startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
      startTime: '08:00',
      endTime: '16:00',
      status: 'upcoming',
      isPublished: true,
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop'
    }
  ];

  for (const ev of eventsData) {
    await prisma.event.upsert({
      where: { slug: ev.slug },
      update: ev,
      create: ev
    });
  }
  console.log('✅ Events seeded.');

  // 10. Sample Achievements
  const achievementsData = [
    {
      title: 'Juara 1 Olimpiade Sains Nasional (OSN) Bidang Fisika',
      description: 'Diraih oleh Ananda Rizky Pratama (Kelas XI MIPA 1) pada kompetisi sains bergengsi tingkat nasional di Bandung.',
      category: 'akademik',
      level: 'nasional',
      year: '2025',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=500&auto=format&fit=crop',
      isPublished: true,
      sortOrder: 1
    },
    {
      title: 'Medali Emas Kejuaraan Robotika Pelajar Internasional (IYRC)',
      description: 'Tim Robotika Nusantara berhasil memenangkan kategori Autonomous Creative Robot mengalahkan delegasi 14 negara.',
      category: 'akademik',
      level: 'internasional',
      year: '2024',
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=500&auto=format&fit=crop',
      isPublished: true,
      sortOrder: 2
    },
    {
      title: 'Juara Umum Festival Lomba Seni Siswa Nasional (FLS2N)',
      description: 'Memperoleh medali emas pada tangkai lomba cipta lagu, gitar solo, dan monolog teater tingkat provinsi DKI Jakarta.',
      category: 'non-akademik',
      level: 'provinsi',
      year: '2024',
      date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=500&auto=format&fit=crop',
      isPublished: true,
      sortOrder: 3
    },
    {
      title: 'Medali Emas Kejuaraan Karate Terbuka Pelajar Piala Menpora',
      description: 'Pencapaian luar biasa atlet karate binaan ekstrakurikuler bela diri sekolah pada kelas Kumite 60kg.',
      category: 'non-akademik',
      level: 'nasional',
      year: '2025',
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=500&auto=format&fit=crop',
      isPublished: true,
      sortOrder: 4
    }
  ];

  await prisma.achievement.deleteMany();
  for (const ach of achievementsData) {
    await prisma.achievement.create({ data: ach });
  }
  console.log('✅ Achievements seeded.');

  // 11. Sample Teachers & Headmaster
  const teachersData = [
    {
      name: 'Dr. H. Bambang Sudrajat, M.Pd.',
      nip: '19680512 199303 1 004',
      position: 'Kepala Sekolah',
      subject: 'Manajemen Pendidikan & Fisika',
      education: 'S3 Manajemen Pendidikan (Universitas Negeri Jakarta)',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=500&auto=format&fit=crop',
      bio: 'Memiliki pengalaman lebih dari 25 tahun dalam bidang kepemimpinan pendidikan sekolah menengah dan aktif sebagai narasumber kurikulum nasional.',
      email: 'kepsek@sekolah.sch.id',
      isHeadmaster: true,
      greetingText: '<p>Assalamu\'alaikum Warahmatullahi Wabarakatuh,</p><p>Selamat datang di situs resmi SMA Negeri Nusantara. Kami berdedikasi membangun iklim belajar yang inklusif, adaptif, serta mendorong tumbuhnya karakter tangguh dan cinta tanah air pada setiap sanubari peserta didik.</p><p>Mari melangkah bersama menyongsong masa depan gemilang dengan iman, ilmu, dan amal kebajikan.</p>',
      sortOrder: 1
    },
    {
      name: 'Siti Aminah, S.Pd., M.Si.',
      nip: '19750918 199903 2 002',
      position: 'Wakil Kepala Sekolah Bidang Kurikulum',
      subject: 'Matematika Peminatan',
      education: 'S2 Matematika Murni (Institut Teknologi Bandung)',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop',
      bio: 'Pembina olimpiade matematika sekolah dengan berbagai raihan prestasi di kancah nasional.',
      email: 'siti.aminah@sekolah.sch.id',
      isHeadmaster: false,
      sortOrder: 2
    },
    {
      name: 'Rahmat Hidayat, S.Pd.',
      nip: '19820315 200604 1 009',
      position: 'Wakil Kepala Sekolah Bidang Kesiswaan',
      subject: 'Pendidikan Jasmani & Olahraga',
      education: 'S1 Pendidikan Olahraga (Universitas Pendidikan Indonesia)',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop',
      bio: 'Pelatih tim basket dan pembina OSIS yang berfokus menanamkan kedisiplinan dan sportivitas.',
      email: 'rahmat@sekolah.sch.id',
      isHeadmaster: false,
      sortOrder: 3
    },
    {
      name: 'Dewi Lestari, S.S., M.Hum.',
      nip: '19881120 201101 2 018',
      position: 'Guru Pengajar',
      subject: 'Bahasa & Sastra Inggris',
      education: 'S2 Linguistik Terapan (Universitas Indonesia)',
      photo: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=500&auto=format&fit=crop',
      bio: 'Koordinator pertukaran pelajar internasional dan pembina English Debating Society.',
      email: 'dewi.lestari@sekolah.sch.id',
      isHeadmaster: false,
      sortOrder: 4
    },
    {
      name: 'Ir. Ahmad Zulkarnain, M.Kom.',
      nip: '19850704 200902 1 005',
      position: 'Guru Pengajar & Kepala Lab Komputer',
      subject: 'Informatika & Coding',
      education: 'S2 Ilmu Komputer (Institut Pertanian Bogor)',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop',
      bio: 'Praktisi software engineer dan pembimbing club robotika serta kecerdasan buatan.',
      email: 'ahmad.z@sekolah.sch.id',
      isHeadmaster: false,
      sortOrder: 5
    }
  ];

  await prisma.teacher.deleteMany();
  for (const t of teachersData) {
    await prisma.teacher.create({ data: t });
  }
  console.log('✅ Teachers seeded.');

  // 12. Sample Staff
  const staffData = [
    {
      name: 'H. Suherman, S.AP.',
      nip: '19700812 199403 1 003',
      position: 'Kepala Tata Usaha',
      department: 'Tata Usaha & Kepegawaian',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
      bio: 'Bertanggung jawab atas administrasi kepegawaian dan kearsipan institusi.',
      sortOrder: 1
    },
    {
      name: 'Nurhasanah, A.Md.',
      nip: '19900415 201503 2 001',
      position: 'Staf Administrasi Kesiswaan & PPDB',
      department: 'Administrasi Siswa',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
      bio: 'Melayani pendataan buku induk siswa, mutasi, dan verifikasi berkas PPDB daring.',
      sortOrder: 2
    }
  ];

  await prisma.staff.deleteMany();
  for (const st of staffData) {
    await prisma.staff.create({ data: st });
  }
  console.log('✅ Staff seeded.');

  // 13. Sample Programs
  const programsData = [
    {
      name: 'Matematika & Ilmu Pengetahuan Alam (MIPA)',
      slug: 'mipa',
      duration: '3 Tahun',
      description: 'Menekankan penguasaan konsep sains eksakta, metodologi riset, kalkulus, fisika analitis, serta bioteknologi berbasis praktikum laboratorium modern.',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
      sortOrder: 1
    },
    {
      name: 'Ilmu Pengetahuan Sosial (IPS)',
      slug: 'ips',
      duration: '3 Tahun',
      description: 'Fokus pada analisis fenomena sosial kemasyarakatan, ekonomi global, hukum tata negara, serta sosiologi kritis guna melahirkan calon pemimpin bangsa.',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
      sortOrder: 2
    },
    {
      name: 'Bahasa & Budaya Internasional',
      slug: 'bahasa-budaya',
      duration: '3 Tahun',
      description: 'Pendalaman kecakapan komunikasi bahasa Inggris, bahasa Jepang/Mandarin, kajian sastra komparatif, dan hubungan diplomatik antar budaya.',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
      sortOrder: 3
    }
  ];

  for (const prog of programsData) {
    await prisma.program.upsert({
      where: { slug: prog.slug },
      update: prog,
      create: prog
    });
  }
  console.log('✅ Programs seeded.');

  // 14. Sample Facilities
  const facilitiesData = [
    {
      name: 'Laboratorium Komputer & Kecerdasan Buatan (AI)',
      slug: 'lab-komputer-ai',
      category: 'Fasilitas Pembelajaran',
      description: 'Dilengkapi 40 unit PC spesifikasi tinggi, jaringan gigabit, proyektor interaktif, dan software pengembangan data science.',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop',
      sortOrder: 1
    },
    {
      name: 'Perpustakaan Digital & Ruang Baca Mandiri',
      slug: 'perpustakaan-digital',
      category: 'Fasilitas Pembelajaran',
      description: 'Koleksi lebih dari 15.000 judul buku referensi fisik dan ribuan e-book internasional dengan akses e-journal terlanggan.',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600&auto=format&fit=crop',
      sortOrder: 2
    },
    {
      name: 'Laboratorium Sains Terpadu (Fisika, Kimia, Biologi)',
      slug: 'lab-sains-terpadu',
      category: 'Fasilitas Praktikum',
      description: 'Standar keamanan ISO dengan instrumen mikroskop digital, lemari asam, spektrofotometer, dan preparat biologi lengkap.',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop',
      sortOrder: 3
    },
    {
      name: 'Gelanggang Olahraga & Lapangan Futsal Outdoor',
      slug: 'lapangan-olahraga-outdoor',
      category: 'Fasilitas Olahraga',
      description: 'Lapangan multifungsi berstandar untuk bola basket, bola voli, bulutangkis, dan futsal dengan pencahayaan malam hari.',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop',
      sortOrder: 4
    }
  ];

  for (const fac of facilitiesData) {
    await prisma.facility.upsert({
      where: { slug: fac.slug },
      update: fac,
      create: fac
    });
  }
  console.log('✅ Facilities seeded.');

  // 15. Sample Extracurriculars
  const ekskulData = [
    {
      name: 'Klub Robotika & Kecerdasan Buatan',
      slug: 'robotika-ai',
      category: 'Sains & Teknologi',
      teacher: 'Ir. Ahmad Zulkarnain, M.Kom.',
      schedule: 'Rabu & Sabtu, 15:30 WIB',
      description: 'Mempelajari perakitan mikrocontroller Arduino, Raspberry Pi, elektronika dasar, dan algoritma kecerdasan buatan.',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop',
      sortOrder: 1
    },
    {
      name: 'Pasukan Pengibar Bendera Pusaka (Paskibra)',
      slug: 'paskibra',
      category: 'Kepemimpinan & Karakter',
      teacher: 'Rahmat Hidayat, S.Pd.',
      schedule: 'Selasa & Jumat, 15:45 WIB',
      description: 'Penempaan kedisiplinan, peraturan baris-berbaris (PBB) militer, ketahanan fisik, serta kepemimpinan lapangan.',
      imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=600&auto=format&fit=crop',
      sortOrder: 2
    },
    {
      name: 'Karya Ilmiah Remaja (KIR) Nusantara',
      slug: 'kir-nusantara',
      category: 'Sains & Riset',
      teacher: 'Siti Aminah, M.Si.',
      schedule: 'Kamis, 15:30 WIB',
      description: 'Pelatihan metodologi penelitian ilmiah, penulisan esai kompetisi, dan eksperimen sains aplikatif.',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
      sortOrder: 3
    },
    {
      name: 'Paduan Suara & Orkestra Harmoni',
      slug: 'paduan-suara-harmoni',
      category: 'Seni & Budaya',
      teacher: 'Dewi Lestari, M.Hum.',
      schedule: 'Senin & Kamis, 15:30 WIB',
      description: 'Pengolahan vokal paduan suara, pembacaan partitur nada, dan pementasan konser musik tahunan.',
      imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop',
      sortOrder: 4
    }
  ];

  for (const e of ekskulData) {
    await prisma.extracurricular.upsert({
      where: { slug: e.slug },
      update: e,
      create: e
    });
  }
  console.log('✅ Extracurriculars seeded.');

  // 16. Gallery Categories & Gallery Items
  const galCats = [
    { name: 'Upacara & Peringatan', slug: 'upacara', description: 'Dokumentasi upacara resmi sekolah' },
    { name: 'Kompetisi & Lomba', slug: 'kompetisi', description: 'Kiprah siswa di arena kejuaraan' },
    { name: 'Kegiatan Pembelajaran', slug: 'pembelajaran', description: 'Praktikum dan kelas interaktif' },
    { name: 'Pentas Seni & Budaya', slug: 'pentas-seni', description: 'Kreasi panggung karya siswa' }
  ];

  const galCatMap = {};
  for (const gc of galCats) {
    const item = await prisma.galleryCategory.upsert({
      where: { slug: gc.slug },
      update: gc,
      create: gc
    });
    galCatMap[gc.slug] = item.id;
  }

  const galleryItems = [
    { title: 'Praktikum Analisis Kimia Organik di Laboratorium', imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop', categoryId: galCatMap['pembelajaran'] },
    { title: 'Pementasan Drama Kolosal Peringatan Sumpah Pemuda', imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop', categoryId: galCatMap['pentas-seni'] },
    { title: 'Penyematan Medali Juara Olimpiade Sains Nasional', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop', categoryId: galCatMap['kompetisi'] },
    { title: 'Upacara Hari Pahlawan Khidmat Bersama Dewan Guru', imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800&auto=format&fit=crop', categoryId: galCatMap['upacara'] },
    { title: 'Pameran Karya Robot Otonom Rancangan Siswa', imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop', categoryId: galCatMap['kompetisi'] },
    { title: 'Diskusi Kelompok Literasi di Perpustakaan Digital', imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop', categoryId: galCatMap['pembelajaran'] }
  ];

  await prisma.gallery.deleteMany();
  for (const g of galleryItems) {
    await prisma.gallery.create({
      data: {
        ...g,
        thumbnailUrl: g.imageUrl,
        isPublished: true
      }
    });
  }
  console.log('✅ Gallery items seeded.');

  // 17. Social Media Links
  const socials = [
    { platform: 'Instagram', url: 'https://instagram.com', icon: 'instagram', sortOrder: 1 },
    { platform: 'YouTube', url: 'https://youtube.com', icon: 'youtube', sortOrder: 2 },
    { platform: 'Facebook', url: 'https://facebook.com', icon: 'facebook', sortOrder: 3 },
    { platform: 'Twitter / X', url: 'https://twitter.com', icon: 'twitter', sortOrder: 4 }
  ];

  await prisma.socialMedia.deleteMany();
  for (const s of socials) {
    await prisma.socialMedia.create({ data: s });
  }
  console.log('✅ Social Media seeded.');

  // 18. Sample Curriculum & Academic Calendar
  await prisma.curriculum.deleteMany();
  await prisma.curriculum.create({
    data: {
      name: 'Kurikulum Merdeka Belajar (Fase E & F)',
      year: '2024/2025',
      description: '<p>Mengedepankan pembelajaran berbasis proyek (P5) yang mengembangkan profil pelajar Pancasila dengan penguatan riset dan literasi numerasi terapan.</p>',
      isActive: true
    }
  });

  await prisma.academicCalendar.deleteMany();
  await prisma.academicCalendar.createMany({
    data: [
      {
        title: 'Asesmen Sumatif Akhir Semester Genap',
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        description: 'Ujian semester berbasis komputer serentak kelas X dan XI',
        type: 'ujian',
        color: '#1a3a6b',
        isPublished: true
      },
      {
        title: 'Pembagian Buku Laporan Hasil Belajar (Rapor)',
        startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        description: 'Pengambilan rapor oleh orang tua / wali murid',
        type: 'administrasi',
        color: '#10b981',
        isPublished: true
      },
      {
        title: 'Libur Akhir Tahun Ajaran',
        startDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
        description: 'Masa libur semester genap siswa',
        type: 'libur',
        color: '#f59e0b',
        isPublished: true
      }
    ]
  });
  console.log('✅ Academic Calendar seeded.');

  console.log('🎉 Seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
