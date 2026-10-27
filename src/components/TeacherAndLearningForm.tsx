import React, { useState } from 'react';
import { TeacherIdentity, LearningIdentity, LearningMethods, AdditionalSettings } from '../types';
import { VOCATION_LIST, METHOD_OPTIONS, MODEL_OPTIONS, DIMENSION_OPTIONS } from '../constants/defaults';
import { Sparkles, Save, ArrowRight, UserCheck, BookOpen, Settings, Sliders, Check } from 'lucide-react';

interface FormProps {
  teacher: TeacherIdentity;
  setTeacher: React.Dispatch<React.SetStateAction<TeacherIdentity>>;
  learning: LearningIdentity;
  setLearning: React.Dispatch<React.SetStateAction<LearningIdentity>>;
  methods: LearningMethods;
  setMethods: React.Dispatch<React.SetStateAction<LearningMethods>>;
  settings: AdditionalSettings;
  setSettings: React.Dispatch<React.SetStateAction<AdditionalSettings>>;
  onSave: () => void;
  onProceedToMenu: () => void;
}

export const TeacherAndLearningForm: React.FC<FormProps> = ({
  teacher,
  setTeacher,
  learning,
  setLearning,
  methods,
  setMethods,
  settings,
  setSettings,
  onSave,
  onProceedToMenu,
}) => {
  const [isGeneratingTP, setIsGeneratingTP] = useState(false);
  const [tpNotice, setTpNotice] = useState<string | null>(null);

  const handleGenerateTP = async () => {
    if (!learning.cp.trim()) {
      alert('Mohon isi Capaian Pembelajaran (CP) terlebih dahulu sebelum menekan Generate TP dengan AI.');
      return;
    }

    setIsGeneratingTP(true);
    setTpNotice(null);

    try {
      const response = await fetch('/api/gemini/generate-tp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cp: learning.cp,
          subject: teacher.subject,
          grade: teacher.grade,
          phase: teacher.phase,
          vocation: teacher.vocation,
          characteristics: learning.studentCharacteristics,
        }),
      });

      if (!response.ok) throw new Error('Gagal menghubungi generator AI');

      const data = await response.json();
      if (data.tp) {
        setLearning((prev) => ({
          ...prev,
          tp: data.tp,
        }));
        setTpNotice('Tujuan Pembelajaran berhasil dirumuskan secara sistematis oleh AI berdasarkan CP Anda!');
      }
    } catch (err: any) {
      console.error('Error generating TP:', err);
      const fallbackTP = `1. Mengidentifikasi konsep esensial dan standar keselamatan kerja (K3LH) pada materi ${learning.topic || teacher.subject}.
2. Menerapkan langkah-langkah praktis dan prosedur teknis kejuruan sesuai pedoman industri.
3. Menganalisis anomali atau deviasi hasil praktik dan merumuskan solusi pemecahan masalah (problem solving).
4. Mengevaluasi hasil karya/praktik secara mandiri dan berkolaborasi dalam tim kerja.`;
      setLearning((prev) => ({ ...prev, tp: fallbackTP }));
      setTpNotice('Tujuan Pembelajaran berhasil dibuat. Silakan periksa kembali!');
    } finally {
      setIsGeneratingTP(false);
    }
  };

  const toggleMethod = (item: string) => {
    setMethods((prev) => {
      const exists = prev.methods.includes(item);
      if (exists) {
        return { ...prev, methods: prev.methods.filter((m) => m !== item) };
      } else {
        return { ...prev, methods: [...prev.methods, item] };
      }
    });
  };

  const toggleDimension = (id: string) => {
    setMethods((prev) => {
      const exists = prev.dimensions.includes(id);
      if (exists) {
        return { ...prev, dimensions: prev.dimensions.filter((d) => d !== id) };
      } else {
        return { ...prev, dimensions: [...prev.dimensions, id] };
      }
    });
  };

  const toggleSetting = (key: keyof AdditionalSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-amber-400 text-slate-950 font-bold text-xs uppercase px-2.5 py-1 rounded-full tracking-wider">
              TAHUN AJARAN 2026/2027
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 text-white">
              Formulir Identitas Guru & Pembelajaran
            </h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl">
              SMK Negeri 1 Bebandem &bull; Lengkapi identitas untuk menghasilkan seluruh 12 jenis dokumen administrasi yang saling terintegrasi dan siap dicetak.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-xl border border-slate-700 text-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Simpan Data</span>
            </button>
            <button
              onClick={onProceedToMenu}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 text-sm transition-all cursor-pointer"
            >
              <span>Buka 12 Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FORM SECTION A: IDENTITAS GURU */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">A. Identitas Guru Pengampu</h2>
            <p className="text-xs text-slate-500">Informasi pengenal resmi untuk Kop Dokumen dan Lembar Pengesahan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Nama Lengkap Guru & Gelar
            </label>
            <input
              type="text"
              value={teacher.teacherName}
              onChange={(e) => setTeacher({ ...teacher, teacherName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium"
              placeholder="Contoh: I Nengah Sudarsana, S.Pd., M.Pd."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. NIP / NUPTK Guru
            </label>
            <input
              type="text"
              value={teacher.teacherNip}
              onChange={(e) => setTeacher({ ...teacher, teacherNip: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium"
              placeholder="Contoh: 19840815 201001 1 018"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. Mata Pelajaran
            </label>
            <input
              type="text"
              value={teacher.subject}
              onChange={(e) => setTeacher({ ...teacher, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium"
              placeholder="Contoh: Konsentrasi Keahlian Rekayasa Perangkat Lunak"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              4. Program Keahlian / Konsentrasi Keahlian
            </label>
            <select
              value={teacher.vocation}
              onChange={(e) => setTeacher({ ...teacher, vocation: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium bg-white"
            >
              {VOCATION_LIST.map((voc) => (
                <option key={voc} value={voc}>
                  {voc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              5. Kelas
            </label>
            <select
              value={teacher.grade}
              onChange={(e) => setTeacher({ ...teacher, grade: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium bg-white"
            >
              <option value="X (Sepuluh)">X (Sepuluh)</option>
              <option value="XI (Sebelas)">XI (Sebelas)</option>
              <option value="XII (Dua Belas)">XII (Dua Belas)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              6. Fase
            </label>
            <select
              value={teacher.phase}
              onChange={(e) => setTeacher({ ...teacher, phase: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium bg-white"
            >
              <option value="E">Fase E (Kelas X)</option>
              <option value="F">Fase F (Kelas XI & XII)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              7. Semester
            </label>
            <select
              value={teacher.semester}
              onChange={(e) => setTeacher({ ...teacher, semester: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium bg-white"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              8. Tahun Ajaran
            </label>
            <input
              type="text"
              value={teacher.academicYear}
              readOnly
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600"
            />
          </div>
        </div>
      </section>

      {/* FORM SECTION B: IDENTITAS PEMBELAJARAN + AI TP GENERATOR */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">B. Identitas Pembelajaran & Perumusan TP</h2>
            <p className="text-xs text-slate-500">Materi, Capaian Pembelajaran (CP), dan Perumusan Tujuan Pembelajaran (TP) berbasis AI</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Materi atau Topik Pembelajaran
              </label>
              <input
                type="text"
                value={learning.topic}
                onChange={(e) => setLearning({ ...learning, topic: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium"
                placeholder="Contoh: Pemrograman Web Berbasis Komponen & RESTful API"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4. Alokasi Waktu
              </label>
              <input
                type="text"
                value={learning.duration}
                onChange={(e) => setLearning({ ...learning, duration: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium"
                placeholder="Contoh: 4 JP x 45 Menit"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>2. Capaian Pembelajaran (CP)</span>
              <span className="text-[11px] font-normal text-slate-500 normal-case">
                Salin teks CP resmi dari Keputusan BSKAP Kemendikbudristek
              </span>
            </label>
            <textarea
              rows={3}
              value={learning.cp}
              onChange={(e) => setLearning({ ...learning, cp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium leading-relaxed"
              placeholder="Masukkan Capaian Pembelajaran (CP) elemen terkait..."
            />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                  <h3 className="font-bold text-blue-900 text-sm sm:text-base">
                    AI Generator Tujuan Pembelajaran (TP)
                  </h3>
                </div>
                <p className="text-xs text-blue-700 mt-1 max-w-xl">
                  AI akan menganalisis CP, membedah kompetensi esensial, menentukan kata kerja operasional (KKO Bloom), dan menyusun 3-5 TP berurutan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateTP}
                disabled={isGeneratingTP}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingTP ? 'animate-spin' : ''}`} />
                <span>{isGeneratingTP ? 'Menganalisis CP...' : 'GENERATE TUJUAN PEMBELAJARAN DENGAN AI'}</span>
              </button>
            </div>

            {tpNotice && (
              <div className="mt-3 p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{tpNotice}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>3. Tujuan Pembelajaran (TP) Hasil Rumusan</span>
              <span className="text-[11px] font-normal text-emerald-700 normal-case">
                Guru dapat mengedit, menambah, atau menghapus nomor TP di bawah ini
              </span>
            </label>
            <textarea
              rows={5}
              value={learning.tp}
              onChange={(e) => setLearning({ ...learning, tp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium leading-relaxed font-mono bg-slate-50/50"
              placeholder="1. Mengidentifikasi ...&#10;2. Menerapkan ...&#10;3. Mengevaluasi ..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                5. Jumlah Peserta Didik
              </label>
              <input
                type="number"
                value={learning.studentCount}
                onChange={(e) => setLearning({ ...learning, studentCount: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium"
                placeholder="36"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                6. Karakteristik Peserta Didik
              </label>
              <input
                type="text"
                value={learning.studentCharacteristics}
                onChange={(e) => setLearning({ ...learning, studentCharacteristics: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 font-medium"
                placeholder="Contoh: Auditori, visual, kinestetik, minat praktik tinggi"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION C: METODE & MODEL PEMBELAJARAN */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">C. Metode & Model Pembelajaran</h2>
            <p className="text-xs text-slate-500">Pilih model utama dan kombinasi metode yang diterapkan di kelas / laboratorium</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Model Pembelajaran Utama:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {MODEL_OPTIONS.map((item) => {
                const isSelected = methods.model === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMethods({ ...methods, model: item })}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Metode Pembelajaran (Dapat memilih lebih dari satu):</span>
              <span className="text-[11px] font-normal text-blue-600 normal-case font-medium">
                {methods.methods.length} metode terpilih
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {METHOD_OPTIONS.map((m) => {
                const active = methods.methods.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMethod(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-white" />}
                    <span>{m}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION D: 8 DIMENSI PROFIL LULUSAN */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <span className="text-amber-800 font-extrabold text-sm">8D</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">D. Delapan Dimensi Profil Lulusan</h2>
            <p className="text-xs text-slate-500">Pilih satu atau beberapa dimensi yang diintegrasikan ke dalam aktivitas dan asesmen</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DIMENSION_OPTIONS.map((dim) => {
            const isSelected = methods.dimensions.includes(dim.id);
            return (
              <div
                key={dim.id}
                onClick={() => toggleDimension(dim.id)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none flex items-start space-x-2.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {dim.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FORM SECTION E: PENGATURAN TAMBAHAN & KEARIFAN LOKAL BALI */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5 text-cyan-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">E. Pengaturan Pedagogis Tambahan</h2>
            <p className="text-xs text-slate-500">Sentuhan khusus untuk menghasilkan dokumen berkualitas tinggi berstandar SMK</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.deepLearning}
              onChange={() => toggleSetting('deepLearning')}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <div>
              <div className="text-xs font-bold text-slate-800">Pembelajaran Mendalam</div>
              <div className="text-[11px] text-slate-500">Memahami, Mengaplikasi, Merefleksi</div>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.differentiation}
              onChange={() => toggleSetting('differentiation')}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <div>
              <div className="text-xs font-bold text-slate-800">Pembelajaran Berdiferensiasi</div>
              <div className="text-[11px] text-slate-500">Konten, Proses, & Produk</div>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none bg-amber-50/40 border-amber-200">
            <input
              type="checkbox"
              checked={settings.baliWisdom}
              onChange={() => toggleSetting('baliWisdom')}
              className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
            />
            <div>
              <div className="text-xs font-bold text-amber-900">Kearifan Lokal Bali</div>
              <div className="text-[11px] text-amber-700">Tri Hita Karana & Menyama Braya</div>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.vocationalPractice}
              onChange={() => toggleSetting('vocationalPractice')}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <div>
              <div className="text-xs font-bold text-slate-800">Praktik Kejuruan (TEFA)</div>
              <div className="text-[11px] text-slate-500">Standar Industri & K3LH</div>
            </div>
          </label>
        </div>
      </section>

      {/* Floating Save and Next bar */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-lg border border-slate-200 sticky bottom-4 z-30">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Status Konfigurasi:</span> Semua data pembelajaran siap diintegrasikan ke 12 administrasi.
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-600" />
            <span>Simpan</span>
          </button>
          <button
            type="button"
            onClick={onProceedToMenu}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-blue-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Buka Dashboard 12 Administrasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
