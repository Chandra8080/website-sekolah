import { dbFindMany, dbFindUnique, dbCreate, dbUpdate, dbDelete, dbCount } from '../../config/database.js';
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
        { position: { contains: search } },
        { department: { contains: search } }
      ];
    }

    const total = dbCount('staff', { where });
    const staffList = dbFindMany('staff', {
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit
    });

    const pagination = buildPaginationMeta(total, page, limit, req.originalUrl);

    res.render('admin/staff/index', {
      pageTitle: 'Kelola Tenaga Kependidikan (Staf TU)',
      staffList,
      pagination,
      search
    });
  } catch (error) {
    console.error('Staff index error:', error);
    req.flash('error', 'Gagal memuat staf.');
    res.redirect('/admin');
  }
};

export const create = (req, res) => {
  res.render('admin/staff/create', {
    pageTitle: 'Tambah Tenaga Kependidikan',
    item: {}
  });
};

export const store = async (req, res) => {
  try {
    const { name, nip, position, department, bio, sortOrder, isActive } = req.body;

    if (!name) {
      req.flash('error', 'Nama lengkap staf wajib diisi.');
      return res.redirect('/admin/staff/create');
    }

    let photo = null;
    if (req.file) {
      photo = `/uploads/teachers/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true || isActive === undefined;

    const newStaff = dbCreate('staff', {
      data: {
        name: sanitizeText(name),
        nip: sanitizeText(nip) || null,
        position: sanitizeText(position) || 'Staf Tata Usaha',
        department: sanitizeText(department) || 'Tata Usaha',
        photo,
        bio: bio ? sanitize(bio) : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'CREATE_STAFF',
      module: 'STAFF',
      description: `Menambahkan staf "${newStaff.name}"`
    });

    req.flash('success', 'Data staf berhasil ditambahkan.');
    res.redirect('/admin/staff');
  } catch (error) {
    console.error('Staff store error:', error);
    req.flash('error', 'Gagal menambahkan staf.');
    res.redirect('/admin/staff/create');
  }
};

export const edit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = dbFindUnique('staff', { where: { id } });

    if (!item) {
      req.flash('error', 'Data staf tidak ditemukan.');
      return res.redirect('/admin/staff');
    }

    res.render('admin/staff/edit', {
      pageTitle: `Edit Staf: ${item.name}`,
      item
    });
  } catch (error) {
    console.error('Staff edit error:', error);
    req.flash('error', 'Gagal memuat data staf.');
    res.redirect('/admin/staff');
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, nip, position, department, bio, sortOrder, isActive } = req.body;

    const current = dbFindUnique('staff', { where: { id } });
    if (!current) {
      req.flash('error', 'Data staf tidak ditemukan.');
      return res.redirect('/admin/staff');
    }

    let photo = current.photo;
    if (req.file) {
      photo = `/uploads/teachers/${req.file.filename}`;
    }

    const active = isActive === 'true' || isActive === 'on' || isActive === true;

    dbUpdate('staff', {
      where: { id },
      data: {
        name: sanitizeText(name),
        nip: sanitizeText(nip) || null,
        position: sanitizeText(position) || 'Staf Tata Usaha',
        department: sanitizeText(department) || 'Tata Usaha',
        photo,
        bio: bio ? sanitize(bio) : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: active
      }
    });

    await logActivity({
      req,
      action: 'UPDATE_STAFF',
      module: 'STAFF',
      description: `Memperbarui staf ID ${id} (${name})`
    });

    req.flash('success', 'Data staf berhasil diperbarui.');
    res.redirect('/admin/staff');
  } catch (error) {
    console.error('Staff update error:', error);
    req.flash('error', 'Gagal memperbarui staf.');
    res.redirect(`/admin/staff/${req.params.id}/edit`);
  }
};

export const destroy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const staff = dbFindUnique('staff', { where: { id } });

    if (staff) {
      dbDelete('staff', { where: { id } });
      await logActivity({
        req,
        action: 'DELETE_STAFF',
        module: 'STAFF',
        description: `Menghapus staf "${staff.name}"`
      });
      req.flash('success', 'Data staf berhasil dihapus.');
    } else {
      req.flash('error', 'Data tidak ditemukan.');
    }

    res.redirect('/admin/staff');
  } catch (error) {
    console.error('Staff delete error:', error);
    req.flash('error', 'Gagal menghapus data staf.');
    res.redirect('/admin/staff');
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
