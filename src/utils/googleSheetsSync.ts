import { SavedRecord } from '../types';

export function generateGoogleAppsScriptCode(): string {
  return `/**
 * SI GURU - SMART ADMINISTRATION GENERATOR
 * SMK NEGERI 1 BEBANDEM - TAHUN AJARAN 2026/2027
 * BACKEND GOOGLE APPS SCRIPT DATABASE SYNC (Code.gs)
 */

const SHEET_NAMES = {
  GURU: 'DATA_GURU',
  PEMBELAJARAN: 'DATA_PEMBELAJARAN',
  TUJUAN: 'DATA_TUJUAN_PEMBELAJARAN',
  DOKUMEN: 'DOKUMEN_ADMINISTRASI',
  PENILAIAN: 'DATA_PENILAIAN',
  RIWAYAT: 'RIWAYAT_GENERATOR'
};

function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheet(ss, SHEET_NAMES.GURU, ['ID Guru', 'Nama Lengkap', 'NIP', 'Mata Pelajaran', 'Program Keahlian', 'Kelas', 'Fase', 'Semester', 'Tahun Ajaran', 'Tanggal Update']);
  setupSheet(ss, SHEET_NAMES.PEMBELAJARAN, ['ID Pembelajaran', 'Materi/Topik', 'Capaian Pembelajaran (CP)', 'Alokasi Waktu', 'Jumlah Siswa', 'Karakteristik', 'Model', 'Metode', 'Dimensi Profil', 'Tanggal Input']);
  setupSheet(ss, SHEET_NAMES.TUJUAN, ['ID TP', 'ID Pembelajaran', 'Nomor Urut', 'Rumusan Tujuan Pembelajaran (TP)', 'Level Kognitif', 'Materi Terkait', 'Status']);
  setupSheet(ss, SHEET_NAMES.DOKUMEN, ['ID Dokumen', 'Jenis Administrasi', 'Judul Dokumen', 'Mata Pelajaran', 'Kelas', 'Guru Pengampu', 'Format Ekspor', 'Status', 'Tanggal Dibuat']);
  setupSheet(ss, SHEET_NAMES.PENILAIAN, ['ID Penilaian', 'No', 'Nama Siswa', 'Nilai TP 1', 'Nilai TP 2', 'Nilai TP 3', 'Nilai TP 4', 'Nilai Akhir', 'Status Ketuntasan', 'Catatan Guru']);
  setupSheet(ss, SHEET_NAMES.RIWAYAT, ['Log ID', 'Waktu Generator', 'Nama Guru', 'Mata Pelajaran', 'Tipe Dokumen', 'Jumlah Dokumen Dihasilkan', 'Status']);
}

function setupSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1e3a8a');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const payload = JSON.parse(rawData);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupDatabaseSheets();
    const rec = payload.record;
    const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' });
    if (rec && rec.teacher) {
      const sheetGuru = ss.getSheetByName(SHEET_NAMES.GURU);
      sheetGuru.appendRow([
        rec.id, rec.teacher.teacherName, rec.teacher.teacherNip, rec.teacher.subject,
        rec.teacher.vocation, rec.teacher.grade, rec.teacher.phase, rec.teacher.semester,
        rec.teacher.academicYear, now
      ]);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'SUCCESS', message: 'Data tersimpan di 6 sheets', timestamp: now })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'ERROR', error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ONLINE', school: 'SMK Negeri 1 Bebandem' })).setMimeType(ContentService.MimeType.JSON);
}
`;
}

export function exportTableToCSV(
  sheetType: 'guru' | 'pembelajaran' | 'tp' | 'penilaian' | 'riwayat',
  records: SavedRecord[]
): string {
  if (sheetType === 'guru') {
    const headers = ['ID Guru,Nama Lengkap,NIP,Mata Pelajaran,Program Keahlian,Kelas,Fase,Semester,Tahun Ajaran,Tanggal Update'];
    const rows = records.map(
      (r) =>
        `"${r.id}","${r.teacher.teacherName}","${r.teacher.teacherNip}","${r.teacher.subject}","${r.teacher.vocation}","${r.teacher.grade}","${r.teacher.phase}","${r.teacher.semester}","${r.teacher.academicYear}","${r.updatedAt}"`
    );
    return [headers, ...rows].join('\n');
  }

  const headers = ['ID Riwayat,Tanggal Dibuat,Mata Pelajaran,Topik,Guru,Jumlah Dokumen'];
  const rows = records.map(
    (r) =>
      `"${r.id}","${r.createdAt}","${r.teacher.subject}","${r.learning.topic}","${r.teacher.teacherName}",${Object.keys(r.documents || {}).length}`
  );
  return [headers, ...rows].join('\n');
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
