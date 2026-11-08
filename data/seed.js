import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'db.json');

const now = new Date().toISOString();

async function seed() {
  console.log('🌱 Seeding database...');
  
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  
  const db = {
    roles: [
      { id: 1, name: 'Super Admin', slug: 'super_admin', description: 'Akses penuh ke seluruh sistem', createdAt: now, updatedAt: now },
      { id: 2, name: 'Administrator', slug: 'administrator', description: 'Pengelolaan website dan konten', createdAt: now, updatedAt: now },
      { id: 3, name: 'Editor', slug: 'editor', description: 'Mengelola konten yang diizinkan', createdAt: now, updatedAt: now },
      { id: 4, name: 'Operator PPDB', slug: 'ppdb_operator', description: 'Mengelola data pendaftaran PPDB', createdAt: now, updatedAt: now }
    ],
    permissions: [],
    role_permissions: [],
    users: [
      {
        id: 1,
        name: 'Super Administrator',
        email: 'admin@sekolah.sch.id',
        username: 'admin',
        password: passwordHash,
        roleId: 1,
        avatar: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now
      }
    ],
    school_settings: [
      { id: 1, key: 'school_name', value: 'SMA Negeri Nusantara', type: 'text', group: 'identity', label: 'Nama Sekolah', createdAt: now, updatedAt: now },
      { id: 2, key: 'school_npsn', value: '20100001', type: 'text', group: 'identity', label: 'NPSN', createdAt: now, updatedAt: now },
      { id: 3, key: 'school_tagline', value: 'Mencetak Generasi Unggul, Berkarakter & Berprestasi Global', type: 'text', group: 'identity', label: 'Tagline', createdAt: now, updatedAt: now },
      { id: 4, key: 'school_description', value: 'Institusi pendidikan terkemuka yang berdedikasi menghasilkan generasi penerus yang cerdas, berintegritas, dan siap bersaing di kancah global.', type: 'textarea', group: 'identity', label: 'Deskripsi Sekolah', createdAt: now, updatedAt: now },
      { id: 5, key: 'school_address', value: 'Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12150', type: 'text', group: 'contact', label: 'Alamat', createdAt: now, updatedAt: now },
      { id: 6, key: 'school_phone', value: '(021) 7890-1234', type: 'text', group: 'contact', label: 'Nomor Telepon', createdAt: now, updatedAt: now },
      { id: 7, key: 'school_email', value: 'info@sekolah.sch.id', type: 'email', group: 'contact', label: 'Email', createdAt: now, updatedAt: now },
      { id: 8, key: 'school_whatsapp', value: '6281234567890', type: 'text', group: 'contact', label: 'WhatsApp', createdAt: now, updatedAt: now },
      { id: 9, key: 'school_hours', value: 'Senin - Jumat: 07:00 - 16:00 WIB', type: 'text', group: 'contact', label: 'Jam Operasional', createdAt: now, updatedAt: now },
      { id: 10, key: 'school_maps_embed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322887!2d106.8195613!3d-6.2087634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917d759%3A0x6b45e67356080477!2sGelora%20Bung%20Karno!5e0!3m2!1sid!2sid!4v1711000000000!5m2!1sid!2sid', type: 'text', group: 'contact', label: 'Google Maps Embed URL', createdAt: now, updatedAt: now },
      { id: 11, key: 'school_logo', value: '/images/logo.svg', type: 'text', group: 'branding', label: 'URL Logo', createdAt: now, updatedAt: now },
      { id: 12, key: 'school_favicon', value: '/images/logo.svg', type: 'text', group: 'branding', label: 'URL Favicon', createdAt: now, updatedAt: now },
      { id: 13, key: 'primary_color', value: '#1a3a6b', type: 'color', group: 'branding', label: 'Warna Utama', createdAt: now, updatedAt: now },
      { id: 14, key: 'secondary_color', value: '#c8a84b', type: 'color', group: 'branding', label: 'Warna Sekunder', createdAt: now, updatedAt: now },
      { id: 15, key: 'accent_color', value: '#e8f0fe', type: 'color', group: 'branding', label: 'Warna Aksen', createdAt: now, updatedAt: now },
      { id: 16, key: 'ppdb_open', value: 'true', type: 'boolean', group: 'ppdb', label: 'Status PPDB', createdAt: now, updatedAt: now },
      { id: 17, key: 'ppdb_year', value: '2025/2026', type: 'text', group: 'ppdb', label: 'Tahun PPDB', createdAt: now, updatedAt: now },
      { id: 18, key: 'stat_students', value: '1245', type: 'number', group: 'statistics', label: 'Jumlah Siswa', createdAt: now, updatedAt: now },
      { id: 19, key: 'stat_teachers', value: '78', type: 'number', group: 'statistics', label: 'Jumlah Guru', createdAt: now, updatedAt: now },
      { id: 20, key: 'stat_classes', value: '36', type: 'number', group: 'statistics', label: 'Jumlah Rombel', createdAt: now, updatedAt: now },
      { id: 21, key: 'stat_founded', value: '1985', type: 'number', group: 'statistics', label: 'Tahun Berdiri', createdAt: now, updatedAt: now },
      { id: 22, key: 'stat_alumni', value: '15000', type: 'number', group: 'statistics', label: 'Jumlah Alumni', createdAt: now, updatedAt: now },
      { id: 23, key: 'meta_title', value: 'SMA Negeri Nusantara - Sekolah Unggulan Berkarakter', type: 'text', group: 'seo', label: 'Meta Title', createdAt: now, updatedAt: now },
      { id: 24, key: 'meta_description', value: 'Situs resmi SMA Negeri Nusantara — sistem informasi sekolah, PPDB online, berita, dan portal akademik.', type: 'textarea', group: 'seo', label: 'Meta Description', createdAt: now, updatedAt: now },
      { id: 25, key: 'footer_text', value: 'SMA Negeri Nusantara berkomitmen menghadirkan pendidikan berkualitas tinggi untuk generasi penerus bangsa.', type: 'textarea', group: 'footer', label: 'Teks Footer', createdAt: now, updatedAt: now },
      { id: 26, key: 'copyright_text', value: '© 2025 SMA Negeri Nusantara. Hak Cipta Dilindungi.', type: 'text', group: 'footer', label: 'Teks Copyright', createdAt: now, updatedAt: now },
      { id: 27, key: 'school_vision', value: 'Menjadi sekolah unggulan yang menghasilkan lulusan berakhlak mulia, berprestasi tinggi, berjiwa inovatif, dan mampu bersaing di tingkat nasional maupun internasional.', type: 'textarea', group: 'profile', label: 'Visi Sekolah', createdAt: now, updatedAt: now },
      { id: 28, key: 'school_mission', value: '1. Menyelenggarakan pembelajaran yang berkualitas, inovatif, dan berkarakter.\n2. Mengembangkan potensi siswa secara akademik dan non-akademik.\n3. Membentuk generasi yang berakhlak mulia dan bertakwa kepada Tuhan YME.\n4. Menjalin kerjasama yang erat dengan orang tua, masyarakat, dan dunia industri.\n5. Mewujudkan lingkungan belajar yang aman, nyaman, dan kondusif.', type: 'textarea', group: 'profile', label: 'Misi Sekolah', createdAt: now, updatedAt: now },
      { id: 29, key: 'school_history', value: 'SMA Negeri Nusantara didirikan pada tahun 1985 atas prakarsa Pemerintah Daerah untuk memenuhi kebutuhan pendidikan menengah atas yang berkualitas di wilayah ini. Sejak awal berdirinya, sekolah ini telah berkomitmen untuk memberikan pendidikan terbaik dengan mengedepankan nilai-nilai kejujuran, kedisiplinan, dan kreativitas.', type: 'textarea', group: 'profile', label: 'Sejarah Sekolah', createdAt: now, updatedAt: now },
      { id: 30, key: 'school_instagram', value: 'https://instagram.com/sman_nusantara', type: 'url', group: 'social', label: 'Instagram', createdAt: now, updatedAt: now },
      { id: 31, key: 'school_facebook', value: 'https://facebook.com/sman.nusantara', type: 'url', group: 'social', label: 'Facebook', createdAt: now, updatedAt: now },
      { id: 32, key: 'school_youtube', value: 'https://youtube.com/@sman_nusantara', type: 'url', group: 'social', label: 'YouTube', createdAt: now, updatedAt: now },
    ],
    menus: [
      { id: 1, title: 'Beranda', url: '/', icon: null, parentId: null, sortOrder: 1, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 2, title: 'Profil Sekolah', url: '#', icon: null, parentId: null, sortOrder: 2, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 3, title: 'Tentang Sekolah', url: '/tentang-kami', icon: null, parentId: 2, sortOrder: 1, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 4, title: 'Sejarah Sekolah', url: '/sejarah', icon: null, parentId: 2, sortOrder: 2, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 5, title: 'Visi & Misi', url: '/visi-misi', icon: null, parentId: 2, sortOrder: 3, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 6, title: 'Struktur Organisasi', url: '/struktur-organisasi', icon: null, parentId: 2, sortOrder: 4, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 7, title: 'Sambutan Kepala Sekolah', url: '/sambutan-kepala-sekolah', icon: null, parentId: 2, sortOrder: 5, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 8, title: 'Akademik', url: '#', icon: null, parentId: null, sortOrder: 3, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 9, title: 'Program Pendidikan', url: '/program', icon: null, parentId: 8, sortOrder: 1, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 10, title: 'Kurikulum', url: '/kurikulum', icon: null, parentId: 8, sortOrder: 2, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 11, title: 'Ekstrakurikuler', url: '/ekstrakurikuler', icon: null, parentId: 8, sortOrder: 3, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 12, title: 'Guru & Tendik', url: '/guru', icon: null, parentId: null, sortOrder: 4, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 13, title: 'Prestasi', url: '/prestasi', icon: null, parentId: null, sortOrder: 5, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 14, title: 'Berita', url: '/berita', icon: null, parentId: null, sortOrder: 6, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 15, title: 'Galeri', url: '/galeri', icon: null, parentId: null, sortOrder: 7, isActive: true, target: '_self', createdAt: now, updatedAt: now },
      { id: 16, title: 'Kontak', url: '/kontak', icon: null, parentId: null, sortOrder: 8, isActive: true, target: '_self', createdAt: now, updatedAt: now },
    ],
    homepage_sections: [
      { id: 1, key: 'hero', title: 'Hero Banner', subtitle: 'Mencetak Generasi Unggul', content: 'Institusi pendidikan terkemuka yang berdedikasi menghasilkan generasi penerus yang cerdas, berintegritas, dan siap bersaing di kancah global.', imageUrl: null, sortOrder: 1, isActive: true, settings: null, createdAt: now, updatedAt: now },
      { id: 2, key: 'intro', title: 'Tentang Sekolah Kami', subtitle: 'Berdiri sejak 1985', content: 'SMA Negeri Nusantara telah melahirkan ribuan alumni berprestasi yang kini berkiprah di berbagai bidang. Kami berkomitmen pada pendidikan holistik yang membentuk karakter dan kompetensi.', imageUrl: null, sortOrder: 2, isActive: true, settings: null, createdAt: now, updatedAt: now },
      { id: 3, key: 'stats', title: 'Angka Bicara', subtitle: null, content: null, imageUrl: null, sortOrder: 3, isActive: true, settings: null, createdAt: now, updatedAt: now },
      { id: 4, key: 'headmaster', title: 'Sambutan Kepala Sekolah', subtitle: null, content: null, imageUrl: null, sortOrder: 4, isActive: true, settings: null, createdAt: now, updatedAt: now },
      { id: 5, key: 'programs', title: 'Program Pendidikan', subtitle: 'Pilihan jurusan unggulan', content: null, imageUrl: null, sortOrder: 5, isActive: true, settings: null, createdAt: now, updatedAt: now },
      { id: 6, key: 'news', title: 'Berita Terbaru', subtitle: 'Informasi & Kegiatan', content: null, imageUrl: null, sortOrder: 6, isActive: true, settings: null, createdAt: now, updatedAt: now },
      { id: 7, key: 'announcements', title: 'Pengumuman', subtitle: null, content: null, imageUrl: null, sortOrder: 7, isActive: true, settings: null, createdAt: now, updatedAt: now },
      { id: 8, key: 'achievements', title: 'Prestasi Sekolah', subtitle: 'Membanggakan Negeri', content: null, imageUrl: null, sortOrder: 8, isActive: true, settings: null, createdAt: now, updatedAt: now },
      { id: 9, key: 'gallery', title: 'Galeri Foto', subtitle: 'Momen & Kegiatan', content: null, imageUrl: null, sortOrder: 9, isActive: true, settings: null, createdAt: now, updatedAt: now },
      { id: 10, key: 'ppdb_cta', title: 'Penerimaan Peserta Didik Baru', subtitle: 'Tahun Ajaran 2025/2026', content: 'Bergabunglah bersama ribuan siswa berprestasi. Daftar sekarang dan wujudkan impian masa depan Anda.', imageUrl: null, sortOrder: 10, isActive: true, settings: null, createdAt: now, updatedAt: now },
    ],
    teachers: [
      { id: 1, name: 'Dr. H. Ahmad Fauzi, M.Pd.', nip: '196801011990021001', position: 'Kepala Sekolah', subject: null, education: 'S3 Manajemen Pendidikan', photo: null, bio: 'Dengan pengalaman lebih dari 30 tahun di dunia pendidikan, beliau membawa visi besar untuk menjadikan SMA Negeri Nusantara sebagai sekolah rujukan nasional.', email: 'kepala@sekolah.sch.id', category: 'kepala_sekolah', isActive: true, sortOrder: 1, isPublished: true, isHeadmaster: true, greetingText: 'Assalamu\'alaikum Warahmatullahi Wabarakatuh.\n\nSalam sejahtera untuk seluruh warga sekolah, orang tua, dan masyarakat yang kami hormati.\n\nSebagai kepala SMA Negeri Nusantara, saya menyambut dengan hangat kunjungan Anda ke situs resmi sekolah kami. Website ini hadir sebagai jembatan informasi antara sekolah dengan seluruh pemangku kepentingan.\n\nSMA Negeri Nusantara berkomitmen untuk terus meningkatkan kualitas pendidikan yang berorientasi pada pengembangan karakter, kompetensi akademik, dan kesiapan menghadapi tantangan global. Kami percaya bahwa setiap siswa memiliki potensi yang luar biasa yang harus dipupuk dengan pendidikan yang tepat dan lingkungan yang kondusif.\n\nMari bersama-sama kita wujudkan generasi muda Indonesia yang cerdas, berkarakter, dan berdaya saing tinggi.\n\nWassalamu\'alaikum Warahmatullahi Wabarakatuh.', createdAt: now, updatedAt: now },
      { id: 2, name: 'Dra. Siti Rahayu, M.Si.', nip: '197203152000032002', position: 'Wakil Kepala Sekolah Kurikulum', subject: 'Matematika', education: 'S2 Matematika', photo: null, bio: null, email: null, category: 'guru', isActive: true, sortOrder: 2, isPublished: true, isHeadmaster: false, greetingText: null, createdAt: now, updatedAt: now },
      { id: 3, name: 'Budi Santoso, S.Pd., M.Pd.', nip: '197808202005011003', position: 'Guru', subject: 'Bahasa Indonesia', education: 'S2 Pendidikan Bahasa', photo: null, bio: null, email: null, category: 'guru', isActive: true, sortOrder: 3, isPublished: true, isHeadmaster: false, greetingText: null, createdAt: now, updatedAt: now },
      { id: 4, name: 'Rina Kartika, S.Pd.', nip: '198512102010012004', position: 'Guru', subject: 'Biologi', education: 'S1 Pendidikan Biologi', photo: null, bio: null, email: null, category: 'guru', isActive: true, sortOrder: 4, isPublished: true, isHeadmaster: false, greetingText: null, createdAt: now, updatedAt: now },
      { id: 5, name: 'Hendra Wijaya, S.T., M.T.', nip: '198009302008011005', position: 'Guru', subject: 'Fisika', education: 'S2 Teknik Fisika', photo: null, bio: null, email: null, category: 'guru', isActive: true, sortOrder: 5, isPublished: true, isHeadmaster: false, greetingText: null, createdAt: now, updatedAt: now },
    ],
    staff: [
      { id: 1, name: 'Sutrisno, A.Md.', nip: '198205102005011001', position: 'Kepala Tata Usaha', department: 'Tata Usaha', photo: null, bio: null, isActive: true, sortOrder: 1, isPublished: true, createdAt: now, updatedAt: now },
      { id: 2, name: 'Dewi Puspita, S.E.', nip: '199001152015012002', position: 'Staf Administrasi', department: 'Tata Usaha', photo: null, bio: null, isActive: true, sortOrder: 2, isPublished: true, createdAt: now, updatedAt: now },
    ],
    organizational_structures: [],
    programs: [
      { id: 1, name: 'Ilmu Pengetahuan Alam (IPA)', slug: 'ipa', description: 'Program IPA dirancang untuk siswa yang memiliki minat dan bakat di bidang sains, teknologi, dan matematika. Kurikulum mencakup Fisika, Kimia, Biologi, dan Matematika tingkat lanjut.', imageUrl: null, duration: '3 Tahun', isActive: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: 2, name: 'Ilmu Pengetahuan Sosial (IPS)', slug: 'ips', description: 'Program IPS mempersiapkan siswa untuk memahami dinamika sosial, ekonomi, dan budaya. Cocok bagi yang berminat di bidang ekonomi, geografi, sosiologi, dan sejarah.', imageUrl: null, duration: '3 Tahun', isActive: true, sortOrder: 2, createdAt: now, updatedAt: now },
      { id: 3, name: 'Bahasa & Sastra', slug: 'bahasa', description: 'Program Bahasa & Sastra mengembangkan kemampuan linguistik dan apresiasi sastra. Mencakup Bahasa Indonesia, Bahasa Inggris, Bahasa Asing pilihan, dan Sastra.', imageUrl: null, duration: '3 Tahun', isActive: true, sortOrder: 3, createdAt: now, updatedAt: now },
    ],
    curriculum: [
      { id: 1, name: 'Kurikulum Merdeka 2024/2025', year: '2024/2025', description: 'Implementasi Kurikulum Merdeka yang berfokus pada pengembangan kompetensi dan karakter siswa dengan pendekatan pembelajaran yang berpusat pada peserta didik.', fileUrl: null, isActive: true, createdAt: now, updatedAt: now },
    ],
    academic_calendars: [
      { id: 1, title: 'Awal Semester Genap', startDate: '2025-01-13T00:00:00.000Z', endDate: null, description: 'Dimulainya kegiatan pembelajaran semester genap tahun ajaran 2024/2025.', type: 'semester', color: '#1a3a6b', isPublished: true, createdAt: now, updatedAt: now },
      { id: 2, title: 'Ujian Tengah Semester Genap', startDate: '2025-03-10T00:00:00.000Z', endDate: '2025-03-14T00:00:00.000Z', description: 'Pelaksanaan Ujian Tengah Semester (UTS) untuk seluruh kelas.', type: 'exam', color: '#c8a84b', isPublished: true, createdAt: now, updatedAt: now },
    ],
    extracurriculars: [
      { id: 1, name: 'Paskibraka', slug: 'paskibraka', category: 'Organisasi', description: 'Kegiatan pembinaan siswa untuk menjadi pasukan pengibar bendera yang terampil dan berkarakter.', imageUrl: null, schedule: 'Jumat, 15:00 - 17:00', teacher: 'Hendra Wijaya, S.T.', isActive: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: 2, name: 'Basket', slug: 'basket', category: 'Olahraga', description: 'Tim basket sekolah yang aktif berkompetisi di tingkat kota dan provinsi.', imageUrl: null, schedule: 'Rabu & Sabtu, 15:00 - 17:00', teacher: 'Budi Santoso, S.Pd.', isActive: true, sortOrder: 2, createdAt: now, updatedAt: now },
      { id: 3, name: 'Palang Merah Remaja (PMR)', slug: 'pmr', category: 'Sosial', description: 'Kegiatan kepalangmerahan yang melatih siswa dalam pertolongan pertama dan kepedulian sosial.', imageUrl: null, schedule: 'Kamis, 14:00 - 16:00', teacher: 'Rina Kartika, S.Pd.', isActive: true, sortOrder: 3, createdAt: now, updatedAt: now },
      { id: 4, name: 'English Debate Club', slug: 'english-debate', category: 'Akademik', description: 'Klub debat Bahasa Inggris untuk mengasah kemampuan berpikir kritis dan komunikasi.', imageUrl: null, schedule: 'Selasa, 14:00 - 16:00', teacher: 'Dra. Siti Rahayu, M.Si.', isActive: true, sortOrder: 4, createdAt: now, updatedAt: now },
    ],
    facilities: [
      { id: 1, name: 'Laboratorium IPA', slug: 'lab-ipa', description: 'Laboratorium modern dengan peralatan lengkap untuk praktikum Fisika, Kimia, dan Biologi. Dilengkapi dengan sistem ventilasi dan keamanan terkini.', imageUrl: null, category: 'Laboratorium', isActive: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: 2, name: 'Perpustakaan Digital', slug: 'perpustakaan', description: 'Perpustakaan dengan koleksi lebih dari 20.000 buku dan akses ke ribuan e-book dan jurnal ilmiah nasional maupun internasional.', imageUrl: null, category: 'Pembelajaran', isActive: true, sortOrder: 2, createdAt: now, updatedAt: now },
      { id: 3, name: 'Aula Serba Guna', slug: 'aula', description: 'Aula berkapasitas 500 orang yang dilengkapi dengan sistem audio visual modern untuk berbagai kegiatan sekolah.', imageUrl: null, category: 'Umum', isActive: true, sortOrder: 3, createdAt: now, updatedAt: now },
      { id: 4, name: 'Laboratorium Komputer', slug: 'lab-komputer', description: 'Laboratorium komputer dengan 60 unit PC terbaru dan koneksi internet berkecepatan tinggi.', imageUrl: null, category: 'Laboratorium', isActive: true, sortOrder: 4, createdAt: now, updatedAt: now },
      { id: 5, name: 'Lapangan Olahraga', slug: 'lapangan', description: 'Lapangan multifungsi yang dapat digunakan untuk sepak bola, basket, voli, dan atletik.', imageUrl: null, category: 'Olahraga', isActive: true, sortOrder: 5, createdAt: now, updatedAt: now },
      { id: 6, name: 'Masjid Sekolah', slug: 'masjid', description: 'Masjid yang representatif untuk kegiatan ibadah dan pembinaan karakter spiritual siswa.', imageUrl: null, category: 'Ibadah', isActive: true, sortOrder: 6, createdAt: now, updatedAt: now },
    ],
    news_categories: [
      { id: 1, name: 'Kegiatan Sekolah', slug: 'kegiatan-sekolah', description: null, color: '#1a3a6b', isActive: true, createdAt: now, updatedAt: now },
      { id: 2, name: 'Prestasi', slug: 'prestasi', description: null, color: '#c8a84b', isActive: true, createdAt: now, updatedAt: now },
      { id: 3, name: 'Pengumuman', slug: 'pengumuman-sekolah', description: null, color: '#2f855a', isActive: true, createdAt: now, updatedAt: now },
      { id: 4, name: 'Akademik', slug: 'akademik', description: null, color: '#2b6cb0', isActive: true, createdAt: now, updatedAt: now },
    ],
    news: [
      {
        id: 1,
        title: 'SMA Negeri Nusantara Raih Juara 1 Olimpiade Sains Nasional 2024',
        slug: 'sman-nusantara-raih-juara-osn-2024',
        excerpt: 'Tim olimpiade SMA Negeri Nusantara berhasil meraih Juara 1 dalam Olimpiade Sains Nasional bidang Fisika yang diselenggarakan di Jakarta.',
        content: '<p>Tim olimpiade SMA Negeri Nusantara berhasil meraih Juara 1 dalam Olimpiade Sains Nasional (OSN) bidang Fisika yang diselenggarakan di Jakarta pada tanggal 15-20 Juli 2024.</p><p>Prestasi gemilang ini diraih oleh Ahmad Rizki, siswa kelas XII IPA 1, yang berhasil mengungguli lebih dari 500 peserta dari seluruh Indonesia.</p><p>Kepala Sekolah, Dr. H. Ahmad Fauzi, M.Pd., menyampaikan rasa bangga dan terima kasih kepada seluruh civitas akademika yang telah berjuang keras.</p>',
        imageUrl: null,
        categoryId: 2,
        author: 'Tim Redaksi',
        isPublished: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: 245,
        metaTitle: null,
        metaDesc: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        title: 'Peringatan Hari Pendidikan Nasional 2024 di SMA Negeri Nusantara',
        slug: 'peringatan-hardiknas-2024',
        excerpt: 'SMA Negeri Nusantara menggelar upacara bendera dan berbagai kegiatan dalam rangka memperingati Hari Pendidikan Nasional 2 Mei 2024.',
        content: '<p>SMA Negeri Nusantara menggelar upacara bendera dan berbagai kegiatan dalam rangka memperingati Hari Pendidikan Nasional (Hardiknas) yang jatuh pada 2 Mei 2024.</p><p>Kegiatan diawali dengan upacara bendera yang hikmat, diikuti oleh seminar bertema "Pendidikan Berkualitas untuk Semua" dan pertunjukan seni siswa.</p>',
        imageUrl: null,
        categoryId: 1,
        author: 'Tim Redaksi',
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: 178,
        metaTitle: null,
        metaDesc: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        title: 'Kurikulum Merdeka: Transformasi Pembelajaran di SMA Negeri Nusantara',
        slug: 'kurikulum-merdeka-transformasi-pembelajaran',
        excerpt: 'SMA Negeri Nusantara resmi mengimplementasikan Kurikulum Merdeka secara penuh mulai tahun ajaran 2024/2025.',
        content: '<p>SMA Negeri Nusantara resmi mengimplementasikan Kurikulum Merdeka secara penuh mulai tahun ajaran 2024/2025. Transformasi ini merupakan langkah besar dalam mewujudkan pembelajaran yang lebih fleksibel dan berpusat pada siswa.</p><p>Dengan Kurikulum Merdeka, siswa kini memiliki lebih banyak pilihan dalam menentukan mata pelajaran yang sesuai dengan minat dan bakat mereka.</p>',
        imageUrl: null,
        categoryId: 4,
        author: 'Tim Redaksi',
        isPublished: true,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        viewCount: 312,
        metaTitle: null,
        metaDesc: null,
        createdAt: now,
        updatedAt: now
      },
    ],
    announcements: [
      { id: 1, title: 'Pengumuman PPDB Tahun Ajaran 2025/2026', content: '<p>Penerimaan Peserta Didik Baru (PPDB) SMA Negeri Nusantara Tahun Ajaran 2025/2026 resmi dibuka. Pendaftaran dilakukan secara online melalui website resmi sekolah.</p><p><strong>Jadwal Pendaftaran:</strong></p><ul><li>Gelombang I: 1 - 30 Juni 2025</li><li>Gelombang II: 1 - 15 Juli 2025</li></ul><p>Kuota: 10 Rombongan Belajar (360 siswa). Hubungi panitia untuk informasi lebih lanjut.</p>', category: 'ppdb', priority: 'high', attachmentUrl: null, isPublished: true, publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), expiredAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), createdAt: now, updatedAt: now },
      { id: 2, title: 'Jadwal Ujian Akhir Semester Genap 2024/2025', content: '<p>Ujian Akhir Semester (UAS) Genap Tahun Ajaran 2024/2025 akan dilaksanakan pada:</p><ul><li>Tanggal: 2 - 13 Juni 2025</li><li>Waktu: 07:30 - 12:00 WIB</li></ul><p>Siswa diharapkan mempersiapkan diri dengan baik. Jadwal detail per mata pelajaran akan dibagikan oleh wali kelas masing-masing.</p>', category: 'akademik', priority: 'normal', attachmentUrl: null, isPublished: true, publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), expiredAt: null, createdAt: now, updatedAt: now },
    ],
    events: [
      { id: 1, title: 'Seminar Nasional Pendidikan Karakter', slug: 'seminar-nasional-pendidikan-karakter', description: '<p>Seminar nasional bertema "Membangun Karakter Generasi Z di Era Digital" akan menghadirkan pembicara dari Kemendikbud, akademisi, dan praktisi pendidikan terkemuka.</p>', imageUrl: null, location: 'Aula SMA Negeri Nusantara', startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, startTime: '08:00', endTime: '16:00', status: 'upcoming', isPublished: true, createdAt: now, updatedAt: now },
      { id: 2, title: 'Pameran Karya Siswa Akhir Tahun', slug: 'pameran-karya-siswa', description: '<p>Pameran tahunan yang menampilkan karya terbaik siswa di bidang seni, teknologi, dan sains. Terbuka untuk umum.</p>', imageUrl: null, location: 'Lapangan Utama SMA Negeri Nusantara', startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(), startTime: '09:00', endTime: '17:00', status: 'upcoming', isPublished: true, createdAt: now, updatedAt: now },
    ],
    achievements: [
      { id: 1, title: 'Juara 1 Olimpiade Sains Nasional (OSN) Bidang Fisika', description: 'Ahmad Rizki, kelas XII IPA 1, berhasil meraih medali emas dalam Olimpiade Sains Nasional bidang Fisika tingkat nasional.', imageUrl: null, category: 'akademik', level: 'nasional', year: '2024', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), isPublished: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: 2, title: 'Juara 1 Lomba Debat Bahasa Inggris Tingkat Provinsi', description: 'Tim debat SMA Negeri Nusantara berhasil meraih Juara 1 dalam kompetisi debat Bahasa Inggris tingkat provinsi.', imageUrl: null, category: 'non_akademik', level: 'provinsi', year: '2024', date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), isPublished: true, sortOrder: 2, createdAt: now, updatedAt: now },
      { id: 3, title: 'Sekolah Adiwiyata Nasional 2023', description: 'SMA Negeri Nusantara meraih penghargaan Sekolah Adiwiyata Nasional atas komitmen terhadap lingkungan hidup.', imageUrl: null, category: 'institusi', level: 'nasional', year: '2023', date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), isPublished: true, sortOrder: 3, createdAt: now, updatedAt: now },
    ],
    gallery_categories: [
      { id: 1, name: 'Kegiatan Sekolah', slug: 'kegiatan-sekolah', description: null, isActive: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: 2, name: 'Prestasi', slug: 'prestasi', description: null, isActive: true, sortOrder: 2, createdAt: now, updatedAt: now },
      { id: 3, name: 'Fasilitas', slug: 'fasilitas', description: null, isActive: true, sortOrder: 3, createdAt: now, updatedAt: now },
    ],
    galleries: [],
    media: [],
    ppdb_settings: [
      { id: 1, key: 'ppdb_is_open', value: 'true', label: 'Status Pendaftaran', createdAt: now, updatedAt: now },
      { id: 2, key: 'ppdb_year', value: '2025/2026', label: 'Tahun Ajaran', createdAt: now, updatedAt: now },
      { id: 3, key: 'ppdb_quota', value: '360', label: 'Kuota Total', createdAt: now, updatedAt: now },
      { id: 4, key: 'ppdb_start_date', value: '2025-06-01', label: 'Tanggal Mulai', createdAt: now, updatedAt: now },
      { id: 5, key: 'ppdb_end_date', value: '2025-07-15', label: 'Tanggal Selesai', createdAt: now, updatedAt: now },
      { id: 6, key: 'ppdb_announcement_date', value: '2025-07-20', label: 'Tanggal Pengumuman', createdAt: now, updatedAt: now },
      { id: 7, key: 'ppdb_info', value: '<p>Selamat datang di portal PPDB SMA Negeri Nusantara. Kami membuka kesempatan bagi putra-putri terbaik untuk bergabung dan meraih prestasi bersama kami.</p>', label: 'Informasi PPDB', createdAt: now, updatedAt: now },
    ],
    ppdb_requirements: [
      { id: 1, title: 'Fotokopi Ijazah/SKHUN SMP/sederajat yang telah dilegalisir (3 lembar)', description: null, isRequired: true, sortOrder: 1, isActive: true, createdAt: now, updatedAt: now },
      { id: 2, title: 'Fotokopi Rapor SMP kelas 7, 8, dan 9 (semua semester) yang telah dilegalisir', description: null, isRequired: true, sortOrder: 2, isActive: true, createdAt: now, updatedAt: now },
      { id: 3, title: 'Pas foto berwarna ukuran 3×4 sebanyak 4 lembar (latar belakang merah)', description: null, isRequired: true, sortOrder: 3, isActive: true, createdAt: now, updatedAt: now },
      { id: 4, title: 'Fotokopi Kartu Keluarga (KK) yang masih berlaku', description: null, isRequired: true, sortOrder: 4, isActive: true, createdAt: now, updatedAt: now },
      { id: 5, title: 'Fotokopi Akta Kelahiran', description: null, isRequired: true, sortOrder: 5, isActive: true, createdAt: now, updatedAt: now },
      { id: 6, title: 'Sertifikat prestasi (jika ada, sebagai nilai tambah)', description: null, isRequired: false, sortOrder: 6, isActive: true, createdAt: now, updatedAt: now },
    ],
    ppdb_applicants: [],
    contact_messages: [],
    social_media: [
      { id: 1, platform: 'Instagram', url: 'https://instagram.com/sman_nusantara', icon: 'instagram', isActive: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: 2, platform: 'Facebook', url: 'https://facebook.com/sman.nusantara', icon: 'facebook', isActive: true, sortOrder: 2, createdAt: now, updatedAt: now },
      { id: 3, platform: 'YouTube', url: 'https://youtube.com/@sman_nusantara', icon: 'youtube', isActive: true, sortOrder: 3, createdAt: now, updatedAt: now },
    ],
    activity_logs: []
  };

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin credentials:');
  console.log('   Email   : admin@sekolah.sch.id');
  console.log('   Username: admin');
  console.log('   Password: Admin@12345');
}

seed().catch(console.error);
