import { TeacherIdentity, LearningIdentity, LearningMethods, AdditionalSettings } from '../types';

export interface DocGenInput {
  teacher: TeacherIdentity;
  learning: LearningIdentity;
  methods: LearningMethods;
  settings: AdditionalSettings;
}

export function generateSingleDoc(
  docType: string,
  inputOrTeacher: DocGenInput | TeacherIdentity,
  maybeLearning?: LearningIdentity,
  maybeMethods?: LearningMethods,
  maybeSettings?: AdditionalSettings
): string {
  let teacher: TeacherIdentity;
  let learning: LearningIdentity;
  let methods: LearningMethods;
  let settings: AdditionalSettings;

  if (inputOrTeacher && 'teacher' in inputOrTeacher) {
    teacher = (inputOrTeacher as DocGenInput).teacher;
    learning = (inputOrTeacher as DocGenInput).learning;
    methods = (inputOrTeacher as DocGenInput).methods;
    settings = (inputOrTeacher as DocGenInput).settings;
  } else {
    teacher = inputOrTeacher as TeacherIdentity;
    learning = maybeLearning!;
    methods = maybeMethods!;
    settings = maybeSettings!;
  }

  teacher = teacher || ({} as any);
  learning = learning || ({} as any);
  methods = methods || ({} as any);
  settings = settings || ({} as any);

  const teacherName = teacher.teacherName || 'Guru Pengampu';
  const nip = teacher.teacherNip || '-';
  const subject = teacher.subject || 'Mata Pelajaran Kejuruan';
  const vocation = teacher.vocation || 'Teknik & Vokasi';
  const grade = teacher.grade || 'X (Sepuluh)';
  const phase = teacher.phase || 'E';
  const semester = teacher.semester || 'Ganjil';
  const topic = learning.topic || 'Kompetensi Kejuruan';
  const cp = learning.cp || 'Peserta didik mampu memahami dan menerapkan prosedur kejuruan berstandar industri.';
  const tp = learning.tp || '1. Memahami prinsip kerja.\n2. Menerapkan keselamatan kerja.\n3. Melakukan pengujian hasil kerja.';
  const dimensions = methods.dimensions?.length ? methods.dimensions.join(', ') : 'Penalaran Kritis, Kolaborasi, Kemandirian, Kreativitas';
  const methodList = methods.methods?.length ? methods.methods.join(', ') : 'Diskusi, Demonstrasi, Praktik Langsung';
  const model = methods.model || 'Problem Based Learning (PBL)';

  const headersInfo = `
    <div class="meta-box mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <table class="w-full text-sm">
        <tr><td class="font-semibold w-40">Satuan Pendidikan</td><td>: SMK Negeri 1 Bebandem</td></tr>
        <tr><td class="font-semibold">Mata Pelajaran</td><td>: ${subject}</td></tr>
        <tr><td class="font-semibold">Program Keahlian</td><td>: ${vocation}</td></tr>
        <tr><td class="font-semibold">Kelas / Fase / Semester</td><td>: ${grade} / Fase ${phase} / ${semester}</td></tr>
        <tr><td class="font-semibold">Alokasi Waktu</td><td>: ${learning.duration || '4 JP x 45 Menit'}</td></tr>
        <tr><td class="font-semibold">Tahun Ajaran</td><td>: ${teacher.academicYear || '2026/2027'}</td></tr>
        <tr><td class="font-semibold">Guru Pengampu</td><td>: ${teacherName} (NIP. ${nip})</td></tr>
      </table>
    </div>
  `;

  switch (docType) {
    case 'modul_ajar':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">I. INFORMASI UMUM</h2>
        <p><strong>A. Identitas Modul:</strong> Disusun oleh ${teacherName} untuk kelas ${grade} SMK Negeri 1 Bebandem.</p>
        <p><strong>B. Kompetensi Awal:</strong> Peserta didik memiliki pengetahuan dasar peralatan dan kepatuhan K3LH di bengkel/lab.</p>
        <p><strong>C. Dimensi Profil Lulusan:</strong> ${dimensions}.</p>
        <p><strong>D. Sarana & Prasarana:</strong> Workstation/Lab Kejuruan SMK Negeri 1 Bebandem, Modul Digital, LCD Proyektor, Instrumen Praktik.</p>
        <p><strong>E. Target & Karakteristik Peserta Didik:</strong> ${learning.studentCount || 36} peserta didik dengan gaya belajar dominan kinestetik dan visual praktis.</p>
        <p><strong>F. Model & Metode:</strong> ${model} dipadukan dengan metode ${methodList}.</p>

        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 my-6">II. KOMPONEN INTI</h2>
        <p><strong>A. Capaian Pembelajaran (CP):</strong></p>
        <blockquote class="bg-gray-50 border-l-4 border-blue-600 p-3 my-2 text-gray-700 italic">${cp}</blockquote>
        <p><strong>B. Tujuan Pembelajaran (TP):</strong></p>
        <div class="bg-emerald-50 border-l-4 border-emerald-600 p-3 my-2 text-gray-800 whitespace-pre-line">${tp}</div>
        
        <p><strong>C. Pemahaman Bermakna:</strong></p>
        <p>Materi <em>${topic}</em> membekali siswa dengan etos kerja profesional berstandar industri (DUDIKA), ketelitian, dan nilai gotong-royong khas Bali (Menyama Braya).</p>

        <p><strong>D. Pertanyaan Pemantik:</strong></p>
        <ul class="list-disc pl-6 mb-4">
          <li>Mengapa penguasaan standar ${topic} menjadi penentu mutu di industri saat ini?</li>
          <li>Bagaimana prosedur K3LH menghindarkan potensi kecelakaan saat pengerjaan teknis?</li>
        </ul>

        <h3 class="text-lg font-bold text-blue-800 mb-3">E. Langkah Pembelajaran (Pendekatan Deep Learning)</h3>
        <table class="min-w-full border-collapse border border-gray-300 text-sm my-4">
          <thead class="bg-blue-900 text-white">
            <tr><th class="border border-gray-300 p-2 w-32">Tahap</th><th class="border border-gray-300 p-2">Aktivitas Pembelajaran</th><th class="border border-gray-300 p-2 w-24">Waktu</th></tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 p-3 font-semibold bg-gray-50">1. Pendahuluan</td>
              <td class="border border-gray-300 p-3">Salam panganjali "Om Swastyastu", doa, presensi, apersepsi keterkaitan materi dengan dunia kerja, penyampaian tujuan dan asesmen awal.</td>
              <td class="border border-gray-300 p-3 text-center">15 Menit</td>
            </tr>
            <tr>
              <td class="border border-gray-300 p-3 font-semibold bg-yellow-50">2. Kegiatan Inti<br><span class="text-xs font-normal text-gray-600">(Memahami, Mengaplikasi, Merefleksi)</span></td>
              <td class="border border-gray-300 p-3">
                <p><strong>Memahami:</strong> Siswa mengamati demonstrasi dan studi kasus industri terkait ${topic}.</p>
                <p><strong>Mengaplikasi:</strong> Praktik kelompok di workstation dengan job sheet LKPD, penerapan K3LH, dan bimbingan guru.</p>
                <p><strong>Merefleksi:</strong> Presentasi hasil kerja tim, evaluasi deviasi ukuran/kualitas, dan tanya jawab solutif.</p>
              </td>
              <td class="border border-gray-300 p-3 text-center">150 Menit</td>
            </tr>
            <tr>
              <td class="border border-gray-300 p-3 font-semibold bg-gray-50">3. Penutup</td>
              <td class="border border-gray-300 p-3">Menyimpulkan pembelajaran, pengisian lembar refleksi (exit ticket), apresiasi kerja tim, dan doa penutup.</td>
              <td class="border border-gray-300 p-3 text-center">15 Menit</td>
            </tr>
          </tbody>
        </table>
      `;

    case 'bahan_ajar':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">BAHAN AJAR & MATERI PEMBELAJARAN</h2>
        <h3 class="text-lg font-bold text-gray-800">Topik Pembelajaran: ${topic}</h3>
        <p class="text-sm text-gray-600 mb-4">Materi Kejuruan Vokasi SMK Negeri 1 Bebandem &bull; Fase ${phase}</p>
        <div class="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <h4 class="font-bold text-blue-900">PETA KONSEP MATERI</h4>
          <p class="text-sm">1. Prinsip Dasar & Regulasi &rarr; 2. Prosedur Keselamatan Kerja &rarr; 3. Eksekusi Teknis &rarr; 4. Kendali Mutu (Quality Control).</p>
        </div>
        <h3 class="font-bold text-blue-800 mt-4 mb-2">1. Uraian Teori Esensial</h3>
        <p class="text-justify mb-3">Penguasaan materi ${topic} menjadi fondasi penting bagi siswa program keahlian ${vocation}. Standar industri menuntut pemahaman teoritis yang kuat serta keterampilan psikomotorik yang presisi.</p>
        <h3 class="font-bold text-blue-800 mt-4 mb-2">2. Contoh Penerapan di Dunia Industri (DUDIKA)</h3>
        <p class="text-justify mb-3">Di perusahaan rekanan SMK Negeri 1 Bebandem, kompetensi ini digunakan pada lini produksi riil. Setiap deviasi harus segera ditangani dengan prosedur perbaikan yang tepat.</p>
        <div class="bg-amber-50 border border-amber-300 p-3 rounded my-3 text-sm">
          <strong>Kearifan Lokal Bali (Tri Hita Karana):</strong> Menjaga keharmonisan sesama rekan kerja (Pawongan) dan kebersihan area kerja (Palemahan).
        </div>
      `;

    case 'lkpd':
      return `
        ${headersInfo}
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-blue-900">LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
          <p class="font-semibold text-gray-700">Job Sheet Praktik: ${topic}</p>
        </div>
        <div class="border border-gray-400 p-3 mb-4 bg-gray-50 rounded text-sm">
          <p><strong>Kelompok / Kelas:</strong> ______________________ / ${grade}</p>
          <p><strong>Anggota:</strong> 1. ______________ 2. ______________ 3. ______________ 4. ______________</p>
        </div>
        <h3 class="font-bold text-blue-900 mb-1">A. Petunjuk Pengerjaan</h3>
        <ol class="list-decimal pl-6 text-sm mb-4 space-y-1">
          <li>Gunakan APD lengkap sebelum memasuki area kerja.</li>
          <li>Baca SOP pengoperasian alat secara cermat.</li>
          <li>Lakukan pengamatan dan catat hasil pengukuran pada tabel di bawah.</li>
        </ol>
        <table class="w-full border-collapse border border-gray-400 text-sm mb-4">
          <thead class="bg-gray-100">
            <tr><th class="border border-gray-400 p-2">No</th><th class="border border-gray-400 p-2">Parameter Uji</th><th class="border border-gray-400 p-2">Standar Rujukan</th><th class="border border-gray-400 p-2">Hasil Pengukuran</th><th class="border border-gray-400 p-2">Status</th></tr>
          </thead>
          <tbody>
            <tr><td class="border border-gray-400 p-2 text-center">1</td><td class="border border-gray-400 p-2">Kondisi Awal Alat & K3LH</td><td class="border border-gray-400 p-2">Bersih & Laik Pakai</td><td class="border border-gray-400 p-2"></td><td class="border border-gray-400 p-2"></td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">2</td><td class="border border-gray-400 p-2">Eksekusi Prosedur Kerja</td><td class="border border-gray-400 p-2">Toleransi &plusmn;5%</td><td class="border border-gray-400 p-2"></td><td class="border border-gray-400 p-2"></td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">3</td><td class="border border-gray-400 p-2">Kualitas Produk / Output Akhir</td><td class="border border-gray-400 p-2">Sesuai Job Sheet</td><td class="border border-gray-400 p-2"></td><td class="border border-gray-400 p-2"></td></tr>
          </tbody>
        </table>
        <h3 class="font-bold text-blue-900 mb-1">B. Pertanyaan Analisis & Kesimpulan</h3>
        <div class="border border-gray-400 h-20 rounded p-2 mb-2 text-xs text-gray-400 bg-white">[Ruang Jawaban Analisis Siswa]</div>
      `;

    case 'media_pembelajaran':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">RANCANGAN MEDIA PEMBELAJARAN</h2>
        <p><strong>Judul Media:</strong> Slide Interaktif & Storyboard Digital: ${topic}</p>
        <p><strong>Bentuk Media:</strong> Slide Deck Interaktif / Video Praktik Kerja / Infografis</p>
        <div class="space-y-3 mt-4">
          <div class="border border-blue-200 p-3 rounded bg-blue-50">
            <h4 class="font-bold text-blue-900 text-sm">Slide 1: Pengenalan & Motivasi Vokasi</h4>
            <p class="text-xs text-gray-700">Visual: Logo SMK Negeri 1 Bebandem, foto bengkel industri modern. Narasi: Relevansi karir lulusan.</p>
          </div>
          <div class="border border-blue-200 p-3 rounded bg-white">
            <h4 class="font-bold text-blue-900 text-sm">Slide 2: Anatomi Komponen & Prosedur</h4>
            <p class="text-xs text-gray-700">Visual: Diagram alur teknis dan titik-titik kritis operasional.</p>
          </div>
          <div class="border border-blue-200 p-3 rounded bg-white">
            <h4 class="font-bold text-blue-900 text-sm">Slide 3: Video Langkah Praktik Step-by-Step</h4>
            <p class="text-xs text-gray-700">Visual: Panduan demonstrasi langsung dari workstation instruktur.</p>
          </div>
        </div>
      `;

    case 'kisi_kisi':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">KISI-KISI PENULISAN SOAL ASESMEN (10 BUTIR SOAL)</h2>
        <table class="min-w-full border-collapse border border-gray-400 text-sm my-4">
          <thead class="bg-blue-900 text-white">
            <tr>
              <th class="border border-gray-400 p-2 w-10 text-center">No</th>
              <th class="border border-gray-400 p-2">Tujuan Pembelajaran (TP)</th>
              <th class="border border-gray-400 p-2">Materi Esensial</th>
              <th class="border border-gray-400 p-2">Indikator Soal</th>
              <th class="border border-gray-400 p-2 w-16 text-center">Level</th>
              <th class="border border-gray-400 p-2 w-20 text-center">Bentuk</th>
              <th class="border border-gray-400 p-2 w-16 text-center">Bobot</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="border border-gray-400 p-2 text-center">1</td><td class="border border-gray-400 p-2">Memahami konsep dan regulasi K3LH</td><td class="border border-gray-400 p-2">K3LH Bengkel</td><td class="border border-gray-400 p-2">Menentukan APD wajib sebelum pengoperasian</td><td class="border border-gray-400 p-2 text-center font-bold text-blue-800">C2</td><td class="border border-gray-400 p-2 text-center">PG (A-E)</td><td class="border border-gray-400 p-2 text-center">8</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">2</td><td class="border border-gray-400 p-2">Mengidentifikasi komponen utama</td><td class="border border-gray-400 p-2">${topic}</td><td class="border border-gray-400 p-2">Menjelaskan fungsi bagian mekanis/elektris</td><td class="border border-gray-400 p-2 text-center font-bold text-blue-800">C2</td><td class="border border-gray-400 p-2 text-center">PG (A-E)</td><td class="border border-gray-400 p-2 text-center">8</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">3</td><td class="border border-gray-400 p-2">Menerapkan urutan kerja sesuai SOP</td><td class="border border-gray-400 p-2">Prosedur Kerja</td><td class="border border-gray-400 p-2">Mengurutkan tahapan kerja sistematis</td><td class="border border-gray-400 p-2 text-center font-bold text-blue-800">C3</td><td class="border border-gray-400 p-2 text-center">PG (A-E)</td><td class="border border-gray-400 p-2 text-center">10</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">4</td><td class="border border-gray-400 p-2">Menggunakan instrumen pengukuran</td><td class="border border-gray-400 p-2">Alat Ukur / Kalibrasi</td><td class="border border-gray-400 p-2">Membaca nilai toleransi hasil pengukuran</td><td class="border border-gray-400 p-2 text-center font-bold text-blue-800">C3</td><td class="border border-gray-400 p-2 text-center">PG (A-E)</td><td class="border border-gray-400 p-2 text-center">10</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">5</td><td class="border border-gray-400 p-2">Mendiagnosis kendala teknis awal</td><td class="border border-gray-400 p-2">Troubleshooting</td><td class="border border-gray-400 p-2">Menentukan indikasi abnormalitas alat</td><td class="border border-gray-400 p-2 text-center font-bold text-purple-800">C4</td><td class="border border-gray-400 p-2 text-center">PG (A-E)</td><td class="border border-gray-400 p-2 text-center">10</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">6</td><td class="border border-gray-400 p-2">Menganalisis parameter efisiensi</td><td class="border border-gray-400 p-2">Optimalisasi Sistem</td><td class="border border-gray-400 p-2">Menghitung efisiensi dan perbandingan data</td><td class="border border-gray-400 p-2 text-center font-bold text-purple-800">C4</td><td class="border border-gray-400 p-2 text-center">PG (A-E)</td><td class="border border-gray-400 p-2 text-center">10</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">7</td><td class="border border-gray-400 p-2">Mengevaluasi kesesuaian SOP</td><td class="border border-gray-400 p-2">Quality Assurance</td><td class="border border-gray-400 p-2">Menilai kepatuhan prosedur terhadap standar mutu</td><td class="border border-gray-400 p-2 text-center font-bold text-purple-800">C5</td><td class="border border-gray-400 p-2 text-center">PG (A-E)</td><td class="border border-gray-400 p-2 text-center">10</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">8</td><td class="border border-gray-400 p-2">Menerapkan etika profesi & kearifan lokal</td><td class="border border-gray-400 p-2">Karakter & Tri Hita Karana</td><td class="border border-gray-400 p-2">Menganalisis sikap kerja gotong-royong di bengkel</td><td class="border border-gray-400 p-2 text-center font-bold text-blue-800">C3</td><td class="border border-gray-400 p-2 text-center">PG (A-E)</td><td class="border border-gray-400 p-2 text-center">8</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">9</td><td class="border border-gray-400 p-2">Menyelesaikan kasus kegagalan sistem</td><td class="border border-gray-400 p-2">Analisis Kasus Vokasi</td><td class="border border-gray-400 p-2">Menentukan solusi komprehensif atas kasus kerusakan</td><td class="border border-gray-400 p-2 text-center font-bold text-red-800">C5 (HOTS)</td><td class="border border-gray-400 p-2 text-center">PG Kompleks</td><td class="border border-gray-400 p-2 text-center">12</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">10</td><td class="border border-gray-400 p-2">Merumuskan rencana kerja preventif</td><td class="border border-gray-400 p-2">Maintenance & Kreasi</td><td class="border border-gray-400 p-2">Menyusun jadwal perawatan berkala mandiri</td><td class="border border-gray-400 p-2 text-center font-bold text-red-800">C6 (HOTS)</td><td class="border border-gray-400 p-2 text-center">Uraian Kasus</td><td class="border border-gray-400 p-2 text-center">14</td></tr>
          </tbody>
        </table>
      `;

    case 'naskah_soal':
      return `
        ${headersInfo}
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold uppercase text-blue-900 tracking-wide">NASKAH SOAL EVALUASI PEMBELAJARAN (10 BUTIR SOAL)</h2>
          <p class="text-xs text-gray-600 italic">Petunjuk: Kerjakan soal-soal di bawah ini dengan teliti pada lembar jawaban yang tersedia.</p>
        </div>

        <div class="space-y-5 text-sm">
          <div>
            <p class="font-semibold text-gray-900">1. Tindakan awal yang paling wajib dilakukan oleh seorang teknisi di bengkel SMK Negeri 1 Bebandem sebelum menghidupkan catu daya peralatan pada pengerjaan ${topic} adalah...</p>
            <div class="pl-4 text-xs space-y-1 mt-1 text-gray-800">
              <div>A. Menyetel putaran alat pada frekuensi tertinggi untuk uji ketahanan.</div>
              <div>B. Melakukan inspeksi visual kelayakan kabel, pelindung fisik, dan mengenakan APD lengkap sesuai SOP.</div>
              <div>C. Mengisi bahan pelumas hingga melebihi batas indikator tangki.</div>
              <div>D. Meminta rekan kerja mengoperasikan alat tanpa membaca buku petunjuk manual.</div>
              <div>E. Mengabaikan penataan kabel grounding jika area kerja dalam ruangan tertutup.</div>
            </div>
          </div>

          <div>
            <p class="font-semibold text-gray-900">2. Pada pengoperasian sistem ${topic}, komponen sensor atau indikator input berfungsi secara spesifik untuk...</p>
            <div class="pl-4 text-xs space-y-1 mt-1 text-gray-800">
              <div>A. Mengubah energi listrik secara langsung menjadi energi kinetik tanpa perantara.</div>
              <div>B. Menghapus data log riwayat kerja operator secara otomatis setiap pergantian jam kerja.</div>
              <div>C. Mendeteksi perubahan variabel fisik dan mengonversinya menjadi sinyal terukur bagi kontroler.</div>
              <div>D. Mengunci katup pengaman saat tekanan sistem mencapai batas normal minimum.</div>
              <div>E. Mempercepat laju pemanasan elemen agar mencapai titik lebur material.</div>
            </div>
          </div>

          <div>
            <p class="font-semibold text-gray-900">3. Apabila terjadi pembacaan nilai yang menyimpang sebesar 15% dari batas toleransi standar saat pengujian, langkah kerja teknis yang paling benar adalah...</p>
            <div class="pl-4 text-xs space-y-1 mt-1 text-gray-800">
              <div>A. Mengubah data catatan praktikum agar sesuai dengan nilai teoritis buku ajar.</div>
              <div>B. Menghentikan proses sementara, memeriksa kalibrasi alat ukur, dan meneliti titik sambungan sistem.</div>
              <div>C. Meneruskan proses pengerjaan karena deviasi 15% dianggap wajar di dunia industri.</div>
              <div>D. Mengganti seluruh rangkaian mesin tanpa melakukan pengujian awal terlebih dahulu.</div>
              <div>E. Mematikan sistem dan meninggalkan area praktikum tanpa melapor kepada guru pengampu.</div>
            </div>
          </div>

          <div>
            <p class="font-semibold text-gray-900">4. Faktor utama yang menyebabkan timbulnya panas berlebih (overheating) pada unit penggerak saat pengujian beban kerja berkelanjutan adalah...</p>
            <div class="pl-4 text-xs space-y-1 mt-1 text-gray-800">
              <div>A. Ventilasi sirkulasi udara bersih yang bekerja terlalu optimal.</div>
              <div>B. Tingkat friksi berlebih akibat pelumasan tidak adekuat atau ketidaksejajaran (misalignment) poros.</div>
              <div>C. Penggunaan kabel tembaga dengan resistansi mendekati nol.</div>
              <div>D. Pengaturan tegangan input yang stabil tepat pada batas nominal standar.</div>
              <div>E. Kondisi lingkungan kerja yang sejuk dengan kelembapan udara terkontrol.</div>
            </div>
          </div>

          <div>
            <p class="font-semibold text-gray-900">5. Prinsip keselamatan kerja K3LH dalam pencegahan risiko bahaya ergonomi saat melakukan perakitan unit di bengkel adalah...</p>
            <div class="pl-4 text-xs space-y-1 mt-1 text-gray-800">
              <div>A. Mengangkat beban berat secara mendadak dengan tumpuan penuh pada tulang punggung.</div>
              <div>B. Membungkukkan badan selama berjam-jam tanpa mengubah posisi duduk atau berdiri.</div>
              <div>C. Menyesuaikan ketinggian meja kerja dengan postur tubuh dan menggunakan tumpuan kaki yang kokoh.</div>
              <div>D. Menaruh perkakas tajam secara berserakan di sekitar lantai workstation.</div>
              <div>E. Mengabaikan penerangan lampu kerja demi menghemat energi bengkel.</div>
            </div>
          </div>

          <div>
            <p class="font-semibold text-gray-900">6. Nilai kearifan lokal Bali <em>"Menyama Braya"</em> yang paling tepat diwujudkan saat melaksanakan pekerjaan kelompok di bengkel adalah...</p>
            <div class="pl-4 text-xs space-y-1 mt-1 text-gray-800">
              <div>A. Membiarkan rekan satu kelompok yang kesulitan bekerja sendirian agar mandiri.</div>
              <div>B. Saling menghargai, membantu rekan yang mengalami kesulitan teknis, dan menjaga kekompakan tim kerja.</div>
              <div>C. Mengambil alih semua tugas kelompok tanpa membagikan ilmu kepada anggota lain.</div>
              <div>D. Menyalahkan rekan sekelompok ketika produk praktik mengalami kendala mutu.</div>
              <div>E. Bersaing tidak sehat dengan kelompok lain dalam pemakaian fasilitas laboratorium.</div>
            </div>
          </div>

          <div>
            <p class="font-semibold text-gray-900">7. Dalam konsep 5R/5S di lingkungan bengkel SMK Negeri 1 Bebandem, tahapan "Resik" (Seiso) menginstruksikan siswa untuk...</p>
            <div class="pl-4 text-xs space-y-1 mt-1 text-gray-800">
              <div>A. Membuang semua barang yang ada di dalam bengkel tanpa memilah nilai gunanya.</div>
              <div>B. Membersihkan lantai, mesin, dan area kerja dari debu, oli, serta gram logam setiap selesai praktik.</div>
              <div>C. Menata barang hanya ketika ada kunjungan asesor atau tamu dari luar sekolah.</div>
              <div>D. Menyimpan peralatan di tempat tersembunyi agar tidak dipakai oleh kelas lain.</div>
              <div>E. Mengecat ulang dinding bengkel setiap pergantian materi pembelajaran.</div>
            </div>
          </div>

          <div>
            <p class="font-semibold text-gray-900">8. Tujuan utama dilakukannya pengujian fungsi (commissioning test) sebelum produk diserahkan kepada konsumen atau mitra DUDIKA adalah...</p>
            <div class="pl-4 text-xs space-y-1 mt-1 text-gray-800">
              <div>A. Memastikan unit beroperasi secara aman, andal, dan memenuhi spesifikasi kontrak kerja.</div>
              <div>B. Mencari-cari alasan untuk menaikkan harga jual produk secara sepihak.</div>
              <div>C. Memperlambat waktu penyerahan agar bengkel tampak selalu sibuk berproduksi.</div>
              <div>D. Mengurangi jatah garansi perbaikan pasca penjualan unit.</div>
              <div>E. Menguji ketahanan produk hingga rusak total guna menghabiskan sisa material.</div>
            </div>
          </div>

          <div>
            <p class="font-semibold text-gray-900">9. (SOAL PILIHAN GANDA KOMPLEKS - KASUS TEKNIS HOTS)<br>
            Sebuah bengkel mitra industri di Bebandem melaporkan bahwa unit hasil rakitan mengalami getaran abnormal disertai penurunan efisiensi output sebesar 20%. Teknisi menyimpulkan beberapa kemungkinan hipotesis:<br>
            (1) Bantalan poros aus / kekurangan pelumasan.<br>
            (2) Pemasangan baut pengikat pondasi mesin kendur.<br>
            (3) Beban kerja yang diberikan berada jauh di bawah kapasitas minimum.<br>
            (4) Terjadi ketidakseimbangan dinamis (dynamic unbalance) pada elemen berputar.<br>
            Kombinasi hipotesis teknis yang paling tepat dan logis untuk diinvestigasi terlebih dahulu adalah...</p>
            <div class="pl-4 text-xs space-y-1 mt-1 text-gray-800">
              <div>A. (1), (2), dan (3)</div>
              <div>B. (1), (2), dan (4)</div>
              <div>C. (2), (3), dan (4)</div>
              <div>D. (1) dan (3) saja</div>
              <div>E. (3) dan (4) saja</div>
            </div>
          </div>

          <div>
            <p class="font-semibold text-gray-900">10. (SOAL STUDI KASUS URAIAN - HOTS VOKASI)<br>
            Sebagai calon teknisi lulusan SMK Negeri 1 Bebandem yang berdaya saing tinggi, Anda diminta menyusun Standard Operating Procedure (SOP) darurat penanganan kegagalan sistem operasional pada materi <strong>${topic}</strong>. Uraikan secara terstruktur:<br>
            a. 3 (tiga) langkah tanggap darurat saat terjadi kegagalan sistem tiba-tiba.<br>
            b. Alur pelacakan akar penyebab masalah (root-cause analysis) dengan diagram Ishikawa / Fishbone sederhana.<br>
            c. Tindakan pencegahan preventif (preventive maintenance) agar insiden serupa tidak terulang kembali!</p>
            <div class="border border-gray-400 rounded h-28 p-2 text-xs text-gray-400 bg-white italic mt-1">
              [Ruang Lembar Jawaban Uraian Peserta Didik]
            </div>
          </div>
        </div>

        <!-- ================= LEMBAR TERPISAH KUNCI JAWABAN ================= -->
        <div class="page-break" style="page-break-before: always; border-top: 3px double #000; margin-top: 50px; padding-top: 30px;">
          <div class="text-center mb-6">
            <span class="bg-red-100 text-red-900 text-xs font-bold px-3 py-1 rounded-full border border-red-300">
              DOKUMEN RAHASIA PENDIDIK
            </span>
            <h2 class="text-xl font-bold uppercase text-red-950 mt-2">
              KUNCI JAWABAN DAN PEDOMAN PEMBAHASAN LENGKAP
            </h2>
            <p class="text-xs font-bold text-gray-700 tracking-wider">
              (LEMBAR TERPISAH - KHUSUS GURU PENGAMPU / ASESOR SMK NEGERI 1 BEBANDEM)
            </p>
          </div>

          <table class="w-full border-collapse border border-gray-400 text-sm mb-6">
            <thead class="bg-red-900 text-white">
              <tr>
                <th class="border border-gray-400 p-2 w-12 text-center">No</th>
                <th class="border border-gray-400 p-2 w-20 text-center">Kunci</th>
                <th class="border border-gray-400 p-2 w-20 text-center">Level</th>
                <th class="border border-gray-400 p-2 text-left">Pembahasan Rinci & Rujukan Standar Vokasi</th>
                <th class="border border-gray-400 p-2 w-16 text-center">Bobot</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">1</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">B</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C2</td>
                <td class="border border-gray-400 p-2 text-xs">Sesuai SOP K3LH kejuruan, inspeksi visual fisik kabel dan kelengkapan APD merupakan kewajiban mutlak sebelum mengalirkan energi untuk menghindari sengatan listrik atau kecelakaan kerja mekanis.</td>
                <td class="border border-gray-400 p-2 text-center">8</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">2</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">C</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C2</td>
                <td class="border border-gray-400 p-2 text-xs">Sensor berfungsi sebagai transduser yang mendeteksi besaran fisis (suhu, tekanan, posisi) dan mengubahnya menjadi sinyal listrik yang dapat diolah oleh unit kontrol.</td>
                <td class="border border-gray-400 p-2 text-center">8</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">3</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">B</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C3</td>
                <td class="border border-gray-400 p-2 text-xs">Integritas teknisi vokasi menuntut penelusuran penyebab deviasi secara bertahap, dimulai dari verifikasi kalibrasi instrumen ukur sebelum melakukan intervensi fisik pada unit.</td>
                <td class="border border-gray-400 p-2 text-center">10</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">4</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">B</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C3</td>
                <td class="border border-gray-400 p-2 text-xs">Gesekan berlebih akibat kekurangan fluida pelumas atau poros yang tidak konsentris adalah penyebab primer konversi energi menjadi panas berlebih pada komponen mekanis.</td>
                <td class="border border-gray-400 p-2 text-center">10</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">5</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">C</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C4</td>
                <td class="border border-gray-400 p-2 text-xs">Ergonomi kerja menekankan keselarasan antara tinggi sarana kerja dan antropometri tubuh operator untuk menghindari gangguan muskuloskeletal (MSDs).</td>
                <td class="border border-gray-400 p-2 text-center">10</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">6</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">B</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C3</td>
                <td class="border border-gray-400 p-2 text-xs">Nilai Menyama Braya dalam tradisi Bali mengajarkan rasa persaudaraan, empati, dan gotong-royong dalam menyelesaikan beban tugas bersama di lingkungan bengkel.</td>
                <td class="border border-gray-400 p-2 text-center">8</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">7</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">B</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C4</td>
                <td class="border border-gray-400 p-2 text-xs">Pilar 'Resik' (Seiso) berarti membersihkan tempat kerja dan peralatan secara berkesinambungan sehingga tidak ada sisa limbah produksi yang berpotensi menimbulkan bahaya.</td>
                <td class="border border-gray-400 p-2 text-center">10</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">8</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">A</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C5</td>
                <td class="border border-gray-400 p-2 text-xs">Commissioning test menjamin bahwa fungsi operasional produk telah memenuhi semua toleransi keselamatan dan parameter teknis yang disepakati dengan konsumen.</td>
                <td class="border border-gray-400 p-2 text-center">10</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">9</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">B</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C5 (HOTS)</td>
                <td class="border border-gray-400 p-2 text-xs">Getaran abnormal selalu berkorelasi langsung dengan ketidakseimbangan massa putar (4), keausan bantalan poros (1), dan kekenduran pengikat struktur (2). Penurunan beban (3) tidak menimbulkan getaran berlebih.</td>
                <td class="border border-gray-400 p-2 text-center">12</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center font-bold">10</td>
                <td class="border border-gray-400 p-2 text-center font-bold text-red-700">Rubrik Uraian</td>
                <td class="border border-gray-400 p-2 text-center text-xs">C6 (HOTS)</td>
                <td class="border border-gray-400 p-2 text-xs">
                  <strong>Kriteria Penilaian Uraian:</strong><br>
                  a. Menjelaskan 3 langkah darurat (Emergency Stop, isolasi daya, lapor instruktur): Skor maks 5.<br>
                  b. Merumuskan alur pelacakan masalah berbasis Man, Machine, Method, Material: Skor maks 5.<br>
                  c. Menyusun rencana pemeliharaan berkala log book harian/mingguan: Skor maks 4.
                </td>
                <td class="border border-gray-400 p-2 text-center">14</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-100 font-bold">
              <tr>
                <td colspan="4" class="border border-gray-400 p-2 text-right">TOTAL SKOR MAKSIMAL:</td>
                <td class="border border-gray-400 p-2 text-center text-red-900">100</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;

    case 'rubrik_penilaian':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">RUBRIK PENILAIAN KOMPREHENSIF</h2>
        <table class="w-full border-collapse border border-gray-400 text-sm mb-4">
          <thead class="bg-blue-900 text-white">
            <tr>
              <th class="border border-gray-400 p-2 w-36">Aspek Dinilai</th>
              <th class="border border-gray-400 p-2">Sangat Mahir (4)</th>
              <th class="border border-gray-400 p-2">Mahir (3)</th>
              <th class="border border-gray-400 p-2">Cukup (2)</th>
              <th class="border border-gray-400 p-2">Perlu Bimbingan (1)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-400 p-2 font-semibold">Kepatuhan K3LH</td>
              <td class="border border-gray-400 p-2 text-xs">Mengenakan APD lengkap mandiri, area kerja sangat resik.</td>
              <td class="border border-gray-400 p-2 text-xs">Mengenakan APD lengkap, area kerja rapi.</td>
              <td class="border border-gray-400 p-2 text-xs">APD kurang lengkap (satu komponen terlewat).</td>
              <td class="border border-gray-400 p-2 text-xs">Mengabaikan APD dan standar keselamatan kerja.</td>
            </tr>
            <tr>
              <td class="border border-gray-400 p-2 font-semibold">Keterampilan Praktik</td>
              <td class="border border-gray-400 p-2 text-xs">Pengoperasian alat sangat presisi, efisien, sesuai SOP industri.</td>
              <td class="border border-gray-400 p-2 text-xs">Langkah kerja tepat, waktu pengerjaan sesuai alokasi.</td>
              <td class="border border-gray-400 p-2 text-xs">Masih ragu-ragu dan membutuhkan bantuan sesekali.</td>
              <td class="border border-gray-400 p-2 text-xs">Salah prosedur yang berpotensi merusak alat.</td>
            </tr>
            <tr>
              <td class="border border-gray-400 p-2 font-semibold">Akurasi & Kualitas</td>
              <td class="border border-gray-400 p-2 text-xs">Hasil memenuhi toleransi ketat industri 100%.</td>
              <td class="border border-gray-400 p-2 text-xs">Hasil baik, memenuhi batas toleransi standar.</td>
              <td class="border border-gray-400 p-2 text-xs">Mendekati ambang batas maksimum toleransi.</td>
              <td class="border border-gray-400 p-2 text-xs">Hasil kerja di luar batas toleransi (gagal fungsi).</td>
            </tr>
          </tbody>
        </table>
        <p class="text-xs text-gray-700">Kriteria Ketercapaian Tujuan Pembelajaran (KKTP): <strong>75</strong>. Nilai &lt; 75 wajib mengikuti bimbingan remedial.</p>
      `;

    case 'asesmen_diagnostik':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">INSTRUMEN ASESMEN DIAGNOSTIK AWAL</h2>
        <h3 class="font-bold text-blue-900 text-sm mb-2">A. Diagnostik Non-Kognitif (Gaya Belajar & Kesiapan Emosional)</h3>
        <div class="border border-gray-300 p-3 bg-gray-50 rounded text-xs space-y-2 mb-4">
          <p>1. Bagaimana kesiapan Anda memulai praktik materi ${topic} hari ini? (Sangat Siap / Biasa Saja / Ragu)</p>
          <p>2. Metode belajar mana yang paling membantu Anda? (A. Melihat Video B. Membaca Modul C. Praktik Langsung)</p>
        </div>
        <h3 class="font-bold text-blue-900 text-sm mb-2">B. Diagnostik Kognitif (Prasyarat Materi)</h3>
        <table class="w-full border-collapse border border-gray-300 text-sm">
          <thead class="bg-blue-900 text-white">
            <tr><th class="border border-gray-300 p-2 w-10 text-center">No</th><th class="border border-gray-300 p-2">Pertanyaan Kunci Prasyarat</th><th class="border border-gray-300 p-2">Kunci / Kriteria</th><th class="border border-gray-300 p-2 w-32">Tindak Lanjut</th></tr>
          </thead>
          <tbody>
            <tr><td class="border border-gray-300 p-2 text-center">1</td><td class="border border-gray-300 p-2 text-xs">Sebutkan 3 komponen APD wajib di lab!</td><td class="border border-gray-300 p-2 text-xs">Wearpack, Safety Shoes, Kacamata/Masker</td><td class="border border-gray-300 p-2 text-xs">Review kilat 5 menit</td></tr>
            <tr><td class="border border-gray-300 p-2 text-center">2</td><td class="border border-gray-300 p-2 text-xs">Bagaimana cara membaca skala alat ukur dasar?</td><td class="border border-gray-300 p-2 text-xs">Skala utama + skala nonius/digital</td><td class="border border-gray-300 p-2 text-xs">Tutor sebaya</td></tr>
          </tbody>
        </table>
      `;

    case 'asesmen_formatif':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">INSTRUMEN ASESMEN FORMATIF (MONITORING PROSES)</h2>
        <h3 class="font-bold text-blue-900 text-sm mb-2">Lembar Observasi Proses Praktik & Karakter Siswa</h3>
        <table class="w-full border-collapse border border-gray-300 text-sm mb-4">
          <thead class="bg-blue-900 text-white">
            <tr><th class="border border-gray-300 p-2 w-10 text-center">No</th><th class="border border-gray-300 p-2">Nama Siswa</th><th class="border border-gray-300 p-2 text-center">Kritis</th><th class="border border-gray-300 p-2 text-center">Kolaborasi</th><th class="border border-gray-300 p-2 text-center">Kemandirian</th><th class="border border-gray-300 p-2">Catatan Guru</th></tr>
          </thead>
          <tbody>
            <tr><td class="border border-gray-300 p-2 text-center">1</td><td class="border border-gray-300 p-2">I Gede Agus Santika</td><td class="border border-gray-300 p-2 text-center text-xs">Sangat Baik</td><td class="border border-gray-300 p-2 text-center text-xs">Aktif</td><td class="border border-gray-300 p-2 text-center text-xs">Mandiri</td><td class="border border-gray-300 p-2 text-xs">Mampu memandu rekan kelompok</td></tr>
            <tr><td class="border border-gray-300 p-2 text-center">2</td><td class="border border-gray-300 p-2">Ni Kadek Dwi Aryanti</td><td class="border border-gray-300 p-2 text-center text-xs">Baik</td><td class="border border-gray-300 p-2 text-center text-xs">Baik</td><td class="border border-gray-300 p-2 text-center text-xs">Cukup</td><td class="border border-gray-300 p-2 text-xs">Perlu dorongan keaktifan berpendapat</td></tr>
          </tbody>
        </table>
      `;

    case 'asesmen_sumatif':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">INSTRUMEN ASESMEN SUMATIF LINGKUP MATERI</h2>
        <p class="text-sm mb-3">Mengukur pencapaian akhir unit materi: <strong>${topic}</strong>.</p>
        <table class="w-full border-collapse border border-gray-400 text-sm mb-4">
          <thead class="bg-blue-900 text-white">
            <tr><th class="border border-gray-400 p-2 w-10 text-center">No</th><th class="border border-gray-400 p-2">Nama Peserta Didik</th><th class="border border-gray-400 p-2 text-center">Teori (40%)</th><th class="border border-gray-400 p-2 text-center">Praktik (60%)</th><th class="border border-gray-400 p-2 text-center">Nilai Akhir</th><th class="border border-gray-400 p-2 text-center">Status (KKTP 75)</th></tr>
          </thead>
          <tbody>
            <tr><td class="border border-gray-400 p-2 text-center">1</td><td class="border border-gray-400 p-2">I Gede Agus Santika</td><td class="border border-gray-400 p-2 text-center">88</td><td class="border border-gray-400 p-2 text-center">92</td><td class="border border-gray-400 p-2 text-center font-bold">90.4</td><td class="border border-gray-400 p-2 text-center font-semibold text-emerald-700">TUNTAS</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">2</td><td class="border border-gray-400 p-2">I Komang Raditya</td><td class="border border-gray-400 p-2 text-center">68</td><td class="border border-gray-400 p-2 text-center">70</td><td class="border border-gray-400 p-2 text-center font-bold">69.2</td><td class="border border-gray-400 p-2 text-center font-semibold text-red-600">REMEDIAL</td></tr>
          </tbody>
        </table>
      `;

    case 'analisis_penilaian':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">ANALISIS HASIL PENILAIAN & KETERCAPAIAN TP</h2>
        <div class="grid grid-cols-3 gap-3 mb-4 text-center">
          <div class="bg-blue-50 border border-blue-200 p-3 rounded"><div class="text-xl font-bold text-blue-900">80.0%</div><div class="text-xs text-gray-600">Ketuntasan Klasikal</div></div>
          <div class="bg-emerald-50 border border-emerald-200 p-3 rounded"><div class="text-xl font-bold text-emerald-800">81.4</div><div class="text-xs text-gray-600">Rata-Rata Kelas</div></div>
          <div class="bg-amber-50 border border-amber-200 p-3 rounded"><div class="text-xl font-bold text-amber-800">2 Siswa</div><div class="text-xs text-gray-600">Perlu Remedial</div></div>
        </div>
        <h3 class="font-bold text-blue-900 text-sm mb-2">Rekomendasi Tindak Lanjut Guru</h3>
        <ul class="list-disc pl-6 text-xs space-y-1 text-gray-800">
          <li>Melaksanakan pendampingan remedial individual pada aspek troubleshooting.</li>
          <li>Mengoptimalkan peran tutor sebaya dalam praktikum lab berikutnya.</li>
        </ul>
      `;

    case 'program_remedial':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">PROGRAM REMEDIAL DAN PENGAYAAN</h2>
        <h3 class="font-bold text-red-800 border-b border-red-200 pb-1 mb-2 text-sm">A. PROGRAM REMEDIAL (SISWA BELUM TUNTAS)</h3>
        <table class="w-full border-collapse border border-gray-400 text-sm mb-4">
          <thead class="bg-red-800 text-white">
            <tr><th class="border border-gray-400 p-2 w-10 text-center">No</th><th class="border border-gray-400 p-2">Nama Siswa</th><th class="border border-gray-400 p-2">TP Belum Tercapai</th><th class="border border-gray-400 p-2">Bentuk Bimbingan</th><th class="border border-gray-400 p-2 w-20 text-center">Nilai Awal</th><th class="border border-gray-400 p-2 w-20 text-center">Target</th></tr>
          </thead>
          <tbody>
            <tr><td class="border border-gray-400 p-2 text-center">1</td><td class="border border-gray-400 p-2">I Komang Raditya</td><td class="border border-gray-400 p-2 text-xs">Menganalisis anomali pada ${topic}</td><td class="border border-gray-400 p-2 text-xs">Bimbingan individu lab & tutor sebaya</td><td class="border border-gray-400 p-2 text-center text-red-600 font-bold">69.2</td><td class="border border-gray-400 p-2 text-center font-bold text-emerald-700">75 (Tuntas)</td></tr>
          </tbody>
        </table>
        <h3 class="font-bold text-emerald-800 border-b border-emerald-200 pb-1 mb-2 text-sm">B. PROGRAM PENGAYAAN (SISWA TUNTAS)</h3>
        <div class="bg-emerald-50 border border-emerald-300 p-3 rounded text-xs space-y-1">
          <p><strong>Sasaran:</strong> Siswa dengan nilai &ge; 75 (I Gede Agus Santika dkk).</p>
          <p><strong>Aktivitas:</strong> Proyek mandiri tingkat lanjut TEFA SMK Negeri 1 Bebandem & tutor sebaya.</p>
        </div>
      `;

    default:
      return `${headersInfo}<h2 class="text-xl font-bold text-blue-900 mb-2">${topic}</h2><p>Dokumen administrasi pembelajaran SMK Negeri 1 Bebandem.</p>`;
  }
}

export function generateAllDocs(
  inputOrTeacher: DocGenInput | TeacherIdentity,
  maybeLearning?: LearningIdentity,
  maybeMethods?: LearningMethods,
  maybeSettings?: AdditionalSettings
): Record<string, string> {
  const docTypes = [
    'modul_ajar',
    'bahan_ajar',
    'lkpd',
    'media_pembelajaran',
    'kisi_kisi',
    'naskah_soal',
    'rubrik_penilaian',
    'asesmen_diagnostik',
    'asesmen_formatif',
    'asesmen_sumatif',
    'analisis_penilaian',
    'program_remedial',
  ];

  const results: Record<string, string> = {};
  for (const t of docTypes) {
    results[t] = generateSingleDoc(t, inputOrTeacher, maybeLearning, maybeMethods, maybeSettings);
  }
  return results;
}
