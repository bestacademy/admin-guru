import React, { useState } from 'react';
import { SavedRecord } from '../types';
import { generateGoogleAppsScriptCode, exportTableToCSV, downloadCSV } from '../utils/googleSheetsSync';
import {
  Database,
  Search,
  Filter,
  Copy,
  Check,
  Download,
  Trash2,
  Copy as DuplicateIcon,
  ExternalLink,
  Table,
  RefreshCw,
  Send,
  CloudCheck,
} from 'lucide-react';

interface HistoryProps {
  records: SavedRecord[];
  onLoadRecord: (record: SavedRecord) => void;
  onDuplicateRecord: (record: SavedRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSyncWebhook: (url: string) => Promise<boolean>;
}

export const DatabaseHistoryView: React.FC<HistoryProps> = ({
  records,
  onLoadRecord,
  onDuplicateRecord,
  onDeleteRecord,
  onSyncWebhook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');

  const [copiedCode, setCopiedCode] = useState(false);
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Copy Code.gs
  const handleCopyCode = () => {
    const code = generateGoogleAppsScriptCode();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Sync to user's Google Spreadsheet Web App
  const handleTriggerSync = async () => {
    if (!appsScriptUrl.trim()) {
      alert('Silakan masukkan URL Aplikasi Web Google Apps Script terlebih dahulu.');
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const ok = await onSyncWebhook(appsScriptUrl);
      if (ok) {
        setSyncStatus('Berhasil disinkronkan ke 6 Sheet Google Spreadsheet!');
      } else {
        setSyncStatus('Gagal menyambung. Pastikan Web App disetel akses "Anyone/Siapa saja".');
      }
    } catch (e: any) {
      setSyncStatus('Error: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchSearch =
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.teacher.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.learning.topic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSubject = filterSubject === 'ALL' || rec.teacher.subject === filterSubject;
    const matchGrade = filterGrade === 'ALL' || rec.teacher.grade === filterGrade;
    const matchSemester = filterSemester === 'ALL' || rec.teacher.semester === filterSemester;

    return matchSearch && matchSubject && matchGrade && matchSemester;
  });

  const uniqueSubjects = Array.from(new Set(records.map((r) => r.teacher.subject)));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-cyan-500/20 text-cyan-300 font-bold text-xs uppercase px-2.5 py-1 rounded-full tracking-wider border border-cyan-400/30">
              DATABASE SINKRONISASI 6 SHEET
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 text-white">
              Database Administrasi & Google Spreadsheet Sync
            </h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl">
              SMK Negeri 1 Bebandem &bull; Terhubung dengan Google Spreadsheet (DATA_GURU, DATA_PEMBELAJARAN, DATA_TUJUAN_PEMBELAJARAN, DOKUMEN_ADMINISTRASI, DATA_PENILAIAN, RIWAYAT_GENERATOR).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const csv = exportTableToCSV('guru', records);
                downloadCSV('DATA_GURU_SMKN1Bebandem.csv', csv);
              }}
              className="bg-blue-800 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-blue-600/50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Ekspor CSV Semua Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Spreadsheet Setup & Sync Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Database className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Integrasi Google Spreadsheet Otomatis (6 Sheet Resmi)
            </h2>
            <p className="text-xs text-slate-500">
              Salin skrip Apps Script Code.gs dan hubungkan spreadsheet Anda dalam 1 menit
            </p>
          </div>
        </div>

        {/* 6 Sheets Pill Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: '1. DATA_GURU', desc: 'Identitas Guru Pengampu' },
            { name: '2. DATA_PEMBELAJARAN', desc: 'Topik, Model, & CP' },
            { name: '3. DATA_TUJUAN', desc: 'Daftar Rincian TP' },
            { name: '4. DOKUMEN_ADMIN', desc: '12 Berkas Terverifikasi' },
            { name: '5. DATA_PENILAIAN', desc: 'Tabel Rekap Nilai Asli' },
            { name: '6. RIWAYAT_GEN', desc: 'Log Pembuatan Berkas' },
          ].map((sheet) => (
            <div key={sheet.name} className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-center">
              <div className="text-xs font-bold text-blue-900">{sheet.name}</div>
              <div className="text-[10px] text-blue-700 mt-0.5">{sheet.desc}</div>
            </div>
          ))}
        </div>

        {/* Apps Script Box */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Skrip Backend Google Apps Script (Code.gs)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-400/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Membentuk 6 sheet otomatis dengan header resmi warna biru navy dan menangani sinkronisasi data online.
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Kode Code.gs'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <input
              type="url"
              value={appsScriptUrl}
              onChange={(e) => setAppsScriptUrl(e.target.value)}
              placeholder="Tempel URL Aplikasi Web Google Apps Script di sini (https://script.google.com/macros/s/.../exec)..."
              className="flex-1 bg-slate-800 text-white placeholder-slate-500 text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap w-full sm:w-auto justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>

          {syncStatus && (
            <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* SAVED RECORDS SEARCH & FILTER BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama guru, mata pelajaran, atau topik pembelajaran..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="ALL">Semua Mata Pelajaran</option>
              {uniqueSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="ALL">Semua Kelas</option>
              <option value="X (Sepuluh)">Kelas X</option>
              <option value="XI (Sebelas)">Kelas XI</option>
              <option value="XII (Dua Belas)">Kelas XII</option>
            </select>

            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="ALL">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>
        </div>

        {/* SAVED RECORDS LIST */}
        <div className="space-y-3 pt-2">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Tidak ada data administrasi tersimpan yang cocok dengan filter.
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const docCount = Object.keys(rec.documents || {}).length;
              return (
                <div
                  key={rec.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all bg-white hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {rec.teacher.grade} &bull; {rec.teacher.semester}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Update: {new Date(rec.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{rec.title}</h3>
                    <p className="text-xs text-slate-600">
                      Guru: <span className="font-semibold text-slate-800">{rec.teacher.teacherName}</span> &bull; Topik:{' '}
                      <span className="text-blue-700">{rec.learning.topic}</span>
                    </p>
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                      <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{docCount} Administrasi Lengkap Tersimpan</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => onLoadRecord(rec)}
                      className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka & Edit</span>
                    </button>
                    <button
                      onClick={() => onDuplicateRecord(rec)}
                      className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
                      title="Duplikasi Dokumen ini untuk Pembelajaran Baru"
                    >
                      <DuplicateIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus arsip administrasi "${rec.title}"?`)) {
                          onDeleteRecord(rec.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-all cursor-pointer"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
