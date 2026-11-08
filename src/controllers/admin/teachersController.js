import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount, dbUpdateMany } from '../../config/database.js';
import { sanitizeText, sanitize } from '../../utils/sanitize.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logActivity } from '../../utils/logger.js';

export const index = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, 12);
    const search = req.query.search ? req.query.search.trim() : '';

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { subject: { contains: search } },
        { nip: { contains: search } }
      ];
    }

    const total = dbCount('teachers', { where });
    const teachers = dbFindMany('teachers', {
      where,
      orderBy: [{ isHeadmaster: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/teachers/index', {
      pageTitle: 'Kelola Tenaga Pendidik (Guru)',
      teachers,
      pagination,
      search
    });
  } catch (error) {
    console.error('Teachers index error:', error);
    req.flash('error', 'Gagal memuat daftar guru.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/teachers/create', {
    pageTitle: 'Tambah Data Guru',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { name, nip, position, subject, education, bio, email, category, isHeadmaster, greetingText, sortOrder, isActive } = req.body;

    if (!name) {
      req.flash('error', 'Nama lengkap guru wajib diisi.');
      return res.redirect('/admin/teachers/create');
    }

    let photo = null;
    if (req.file) {
      photo = `/uploads/teachers/${req.file.filename}`;
    }

    const headmaster = isHeadmaster === 'true' || isHeadmaster === 'on' || isHeadmaster === true;
    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    // If marked headmaster, unmark previous headmasters
    if (headmaster) {
      dbUpdateMany('teachers', {
        where: { isHeadmaster: true },
        data: { isHeadmaster: false }
      });
    }

    const newTeacher = dbCreate('teachers', {
      data: {
        name: sanitizeText(name),
        nip: sanitizeText(nip) || null,
        position: sanitizeText(position) || 'Guru Mata Pelajaran',
        subject: sanitizeText(subject) || null,
        education: sanitizeText(education) || null,
        bio: bio ? sanitize(bio) : null,
        email: sanitizeText(email) || null,
        category: category || 'guru',
        photo,
        isHeadmaster: headmaster,
        greetingText: greetingText ? sanitize(greetingText) : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active,
        isPublished: true
      }
    });

    await logActivity({
      req,
      action: 'CREATE_TEACHER',
      module: 'TEACHERS',
      description: `Menambahkan guru "${newTeacher.name}"`
    });

    req.flash('success', 'Data guru berhasil ditambahkan.');
    res.redirect('/admin/teachers');
  } catch (error) {
    console.error('Teacher store error:', error);
    req.flash('error', 'Gagal menambahkan data guru.');
    res.redirect('/admin/teachers/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('teachers', { where: { id } });

    if (!item) {
      req.flash('error', 'Data guru tidak ditemukan.');
      return res.redirect('/admin/teachers');
    }

    res.render('admin/teachers/edit', {
      pageTitle: `Edit Guru: ${item.name}`,
      item
    });
  } catch (error) {
    console.error('Teacher edit error:', error);
    req.flash('error', 'Gagal memuat data guru.');
    res.redirect('/admin/teachers');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, nip, position, subject, education, bio, email, category, isHeadmaster, greetingText, sortOrder, isActive } = req.body;

    const current = dbFindUnique('teachers', { where: { id } });
    if (!current) {
      req.flash('error', 'Data guru tidak ditemukan.');
      return res.redirect('/admin/teachers');
    }

    let photo = current.photo;
    if (req.file) {
      photo = `/uploads/teachers/${req.file.filename}`;
    }

    const headmaster = isHeadmaster === 'true' || isHeadmaster === 'on' || isHeadmaster === true;
    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    if (headmaster && !current.isHeadmaster) {
      dbUpdateMany('teachers', {
        where: { isHeadmaster: true },
        data: { isHeadmaster: false }
      });
    }

    dbUpdate('teachers', {
      where: { id },
      data: {
        name: sanitizeText(name),
        nip: sanitizeText(nip) || null,
        position: sanitizeText(position) || 'Guru Mata Pelajaran',
        subject: sanitizeText(subject) || null,
        education: sanitizeText(education) || null,
        bio: bio ? sanitize(bio) : null,
        email: sanitizeText(email) || null,
        category: category || 'guru',
        photo,
        isHeadmaster: headmaster,
        greetingText: greetingText ? sanitize(greetingText) : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_TEACHER',
      module: 'TEACHERS',
      description: `Memperbarui data guru ID ${id} (${name})`
    });

    req.flash('success', 'Data guru berhasil diperbarui.');
    res.redirect('/admin/teachers');
  } catch (error) {
    console.error('Teacher update error:', error);
    req.flash('error', 'Gagal memperbarui data guru.');
    res.redirect(`/admin/teachers/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const teacher = dbFindUnique('teachers', { where: { id } });

    if (teacher) {
      dbDelete('teachers', { where: { id } });
      await logActivity({
        req,
        action: 'DELETE_TEACHER',
        module: 'TEACHERS',
        description: `Menghapus guru "${teacher.name}"`
      });
      req.flash('success', 'Data guru berhasil dihapus.');
    } else {
      req.flash('error', 'Data tidak ditemukan.');
    }

    res.redirect('/admin/teachers');
  } catch (error) {
    console.error('Teacher delete error:', error);
    req.flash('error', 'Gagal menghapus data guru.');
    res.redirect('/admin/teachers');
  }
};

export default {
  index,
  create,
  store,
  edit,
  update,
  destroy
};
