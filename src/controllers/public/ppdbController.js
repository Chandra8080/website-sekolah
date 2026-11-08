import { dbFindMany, dbFindUnique, dbFindFirst, dbCreate } from '../../config/database.js';
import { sanitizeText } from '../../utils/sanitize.js';
import { generateRegistrationNo } from '../../utils/slugify.js';

export const getIndex = async (req, res) => {
  try {
    const settingsList = dbFindMany('ppdb_settings');
    const requirements = dbFindMany('ppdb_requirements', {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    const programs = dbFindMany('programs', {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    const settingsMap = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.render('public/pages/ppdb/index', {
      pageTitle: 'Penerimaan Peserta Didik Baru (PPDB Online)',
      ppdbSettings: settingsMap,
      requirements,
      programs,
      applicantResult: req.session?.applicantResult || null
    });

    // Clear one-time applicant result from session after rendering
    if (req.session?.applicantResult) {
      delete req.session.applicantResult;
    }
  } catch (error) {
    console.error('PPDB public index error:', error);
    res.status(500).render('public/errors/500', {
      pageTitle: 'Terjadi Kesalahan',
      message: 'Gagal memuat portal PPDB.'
    });
  }
};

export const postRegister = async (req, res) => {
  try {
    const {
      fullName,
      birthPlace,
      birthDate,
      gender,
      address,
      originSchool,
      parentName,
      parentPhone,
      parentEmail,
      programChoice
    } = req.body;

    if (!fullName || !gender || !parentName || !parentPhone) {
      req.flash('error', 'Harap isi semua kolom wajib pada formulir pendaftaran.');
      return res.redirect('/ppdb#formulir');
    }

    const regNo = generateRegistrationNo('REG');

    let documentUrl = null;
    if (req.file) {
      documentUrl = `/uploads/ppdb/${req.file.filename}`;
    }

    const applicant = dbCreate('ppdb_applicants', {
      data: {
        registrationNo: regNo,
        fullName: sanitizeText(fullName),
        birthPlace: sanitizeText(birthPlace) || null,
        birthDate: birthDate ? new Date(birthDate).toISOString() : null,
        gender: sanitizeText(gender),
        address: sanitizeText(address) || null,
        originSchool: sanitizeText(originSchool) || null,
        parentName: sanitizeText(parentName),
        parentPhone: sanitizeText(parentPhone),
        parentEmail: sanitizeText(parentEmail) || null,
        programChoice: sanitizeText(programChoice) || null,
        documentUrl,
        status: 'pending'
      }
    });

    req.session.applicantResult = {
      registrationNo: applicant.registrationNo,
      fullName: applicant.fullName,
      parentPhone: applicant.parentPhone
    };

    req.flash('success', `Pendaftaran Anda berhasil dikirim! Simpan Nomor Pendaftaran: ${applicant.registrationNo}`);
    res.redirect('/ppdb/status?reg=' + encodeURIComponent(applicant.registrationNo));
  } catch (error) {
    console.error('PPDB registration error:', error);
    req.flash('error', 'Terjadi kesalahan sistem saat memproses formulir pendaftaran.');
    res.redirect('/ppdb#formulir');
  }
};

export const getCheckStatus = async (req, res) => {
  try {
    const regParam = req.query.reg || '';
    let applicant = null;

    if (regParam) {
      applicant = dbFindUnique('ppdb_applicants', {
        where: { registrationNo: regParam }
      });
    }

    res.render('public/pages/ppdb/status', {
      pageTitle: 'Cek Status Pendaftaran PPDB',
      applicant,
      regParam
    });
  } catch (error) {
    console.error('PPDB check status error:', error);
    res.redirect('/ppdb');
  }
};

export const postCheckStatus = async (req, res) => {
  try {
    const { registrationNo, parentPhone } = req.body;

    if (!registrationNo) {
      req.flash('error', 'Nomor pendaftaran wajib diisi.');
      return res.redirect('/ppdb/status');
    }

    const applicant = dbFindFirst('ppdb_applicants', {
      where: {
        registrationNo: registrationNo.trim(),
        ...(parentPhone ? { parentPhone: { contains: parentPhone.trim() } } : {})
      }
    });

    if (!applicant) {
      req.flash('error', 'Data pendaftaran dengan nomor atau nomor telepon tersebut tidak ditemukan.');
      return res.redirect('/ppdb/status');
    }

    res.render('public/pages/ppdb/status', {
      pageTitle: 'Hasil Status Pendaftaran',
      applicant,
      regParam: applicant.registrationNo
    });
  } catch (error) {
    console.error('PPDB post check status error:', error);
    req.flash('error', 'Gagal memeriksa status.');
    res.redirect('/ppdb/status');
  }
};

export default {
  getIndex,
  postRegister,
  getCheckStatus,
  postCheckStatus
};
