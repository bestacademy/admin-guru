import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Shared Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback generator for Tujuan Pembelajaran
function generateFallbackTP(cp: string, subject: string, grade: string, vocation: string) {
  const cleanCP = cp || `Peserta didik mampu memahami dan menerapkan kompetensi dasar pada bidang ${subject || 'Kejuruan'}.`;
  return [
    `1. Mengidentifikasi dan menjelaskan konsep dasar, prinsip kerja, serta terminologi penting dalam ${subject || 'pembelajaran'} sesuai standar industri ${vocation || 'SMK'}.`,
    `2. Menganalisis alur kerja, prosedur keselamatan (K3LH), dan spesifikasi teknis yang relevan dengan ${cleanCP.substring(0, 80)}...`,
    `3. Mengaplikasikan langkah-langkah kerja dan keterampilan praktis dalam menyelesaikan studi kasus kejuruan di laboratorium/bengkel.`,
    `4. Mengevaluasi hasil praktik atau pemecahan masalah serta menyusun laporan reflektif dengan bernalar kritis dan mandiri.`
  ].join('\n');
}

// Fallback document templates tailored to SMK Negeri 1 Bebandem
function getFallbackDocument(docType: string, data: any) {
  const teacher = data.teacherName || 'Guru Mata Pelajaran';
  const nip = data.teacherNip || '-';
  const subject = data.subject || 'Mata Pelajaran Kejuruan';
  const vocation = data.vocation || 'Teknik & Bisnis';
  const grade = data.grade || 'X (Sepuluh)';
  const phase = data.phase || 'E';
  const semester = data.semester || 'Ganjil';
  const topic = data.topic || 'Kompetensi Kejuruan';
  const cp = data.cp || 'Peserta didik mampu memahami dan mempraktikkan kompetensi dasar kejuruan.';
  const tp = data.tp || '1. Memahami konsep dasar.\n2. Menerapkan keterampilan kejuruan.';
  const dimensions = Array.isArray(data.dimensions) && data.dimensions.length > 0
    ? data.dimensions.join(', ')
    : 'Penalaran Kritis, Kolaborasi, Kemandirian, Kreativitas';
  const method = Array.isArray(data.methods) && data.methods.length > 0 ? data.methods.join(', ') : 'Diskusi, Demonstrasi, Praktik Langsung';
  const model = data.model || 'Problem Based Learning (PBL)';

  const headersInfo = `
    <div class="meta-box mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
      <table class="w-full text-sm">
        <tr><td class="font-semibold w-40">Satuan Pendidikan</td><td>: SMK Negeri 1 Bebandem</td></tr>
        <tr><td class="font-semibold">Mata Pelajaran</td><td>: ${subject}</td></tr>
        <tr><td class="font-semibold">Program Keahlian</td><td>: ${vocation}</td></tr>
        <tr><td class="font-semibold">Kelas / Fase / Semester</td><td>: ${grade} / Fase ${phase} / ${semester}</td></tr>
        <tr><td class="font-semibold">Alokasi Waktu</td><td>: ${data.duration || '4 JP x 45 Menit'}</td></tr>
        <tr><td class="font-semibold">Tahun Ajaran</td><td>: ${data.academicYear || '2026/2027'}</td></tr>
        <tr><td class="font-semibold">Guru Pengampu</td><td>: ${teacher} (NIP. ${nip})</td></tr>
      </table>
    </div>
  `;

  switch (docType) {
    case 'modul_ajar':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">I. INFORMASI UMUM</h2>
        <p><strong>A. Identitas Modul:</strong> Disusun oleh ${teacher}, S.Pd. untuk kelas ${grade} SMK Negeri 1 Bebandem.</p>
        <p><strong>B. Kompetensi Awal:</strong> Peserta didik telah memahami pengantar dasar peralatan kejuruan dan keselamatan kerja (K3LH).</p>
        <p><strong>C. Dimensi Profil Lulusan:</strong> ${dimensions}.</p>
        <p><strong>D. Sarana dan Prasarana:</strong> Ruang Bengkel/Laboratorium Kejuruan SMK Negeri 1 Bebandem, LCD Proyektor, Modul Praktik, Perangkat Komputer/Alat Praktik Kejuruan, Koneksi Internet.</p>
        <p><strong>E. Target & Karakteristik Peserta Didik:</strong> ${data.studentCount || 36} siswa reguler dengan kecenderungan gaya belajar kinestetik dan visual praktis.</p>
        <p><strong>F. Model & Metode Pembelajaran:</strong> ${model} dengan metode ${method}.</p>

        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 my-6">II. KOMPONEN INTI</h2>
        <p><strong>A. Capaian Pembelajaran (CP):</strong></p>
        <blockquote class="bg-gray-50 border-l-4 border-blue-600 p-3 my-2 text-gray-700 italic">${cp}</blockquote>
        <p><strong>B. Tujuan Pembelajaran (TP):</strong></p>
        <div class="bg-emerald-50 border-l-4 border-emerald-600 p-3 my-2 text-gray-800 whitespace-pre-line">${tp}</div>
        
        <p><strong>C. Pemahaman Bermakna:</strong></p>
        <p>Penguasaan materi <em>${topic}</em> memberikan fondasi kokoh bagi peserta didik untuk bersaing di dunia kerja (DUDIKA), memahami etos kerja disiplin, serta menjunjung kearifan lokal Bali dalam berkolaborasi dan bekerja sama (Menyama Braya & Tri Hita Karana).</p>

        <p><strong>D. Pertanyaan Pemantik:</strong></p>
        <ul class="list-disc pl-6 mb-4">
          <li>Mengapa penguasaan ${topic} sangat krusial dalam standar industri saat ini?</li>
          <li>Bagaimana jika sebuah prosedur kerja dilewati tanpa mengindahkan standar keselamatan dan ketelitian?</li>
          <li>Bagaimana kita mengintegrasikan nilai gotong-royong dan tanggung jawab dalam praktik kejuruan?</li>
        </ul>

        <h3 class="text-lg font-bold text-blue-800 mb-3">E. Langkah-Langkah Pembelajaran (Pendekatan Deep Learning)</h3>
        
        <div class="overflow-x-auto my-4">
          <table class="min-w-full border-collapse border border-gray-300 text-sm">
            <thead class="bg-blue-900 text-white">
              <tr>
                <th class="border border-gray-300 p-2 w-32">Tahapan</th>
                <th class="border border-gray-300 p-2">Aktivitas Guru & Peserta Didik</th>
                <th class="border border-gray-300 p-2 w-24">Waktu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-300 p-3 font-semibold bg-gray-50">1. Pendahuluan</td>
                <td class="border border-gray-300 p-3">
                  <ul class="list-disc pl-5 space-y-1">
                    <li>Guru membuka pelajaran dengan salam panganjali <em>"Om Swastyastu"</em>, berdoa bersama, dan presensi.</li>
                    <li>Guru mengaitkan materi prasyarat dengan topik <strong>${topic}</strong>.</li>
                    <li>Menyampaikan tujuan pembelajaran, skenario praktik, dan teknik asesmen yang akan digunakan.</li>
                    <li>Memberikan asesmen diagnostik singkat mengenai kesiapan belajar.</li>
                  </ul>
                </td>
                <td class="border border-gray-300 p-3 text-center">15 Menit</td>
              </tr>
              <tr>
                <td class="border border-gray-300 p-3 font-semibold bg-yellow-50">2. Kegiatan Inti<br><span class="text-xs font-normal text-gray-600">(Memahami, Mengaplikasi, Merefleksi)</span></td>
                <td class="border border-gray-300 p-3">
                  <p class="font-bold text-blue-900">Fase 1: Orientasi Masalah (Memahami)</p>
                  <p class="mb-2">Guru menyajikan video kasus industri atau demonstrasi langsung mengenai tantangan teknis dalam ${topic}. Siswa mengidentifikasi variabel kunci.</p>
                  
                  <p class="font-bold text-blue-900">Fase 2: Mengorganisasikan Peserta Didik</p>
                  <p class="mb-2">Peserta didik dibagi menjadi kelompok kerja heterogen (4-5 siswa) untuk mempelajari LKPD dan panduan lembar kerja.</p>
                  
                  <p class="font-bold text-blue-900">Fase 3: Penyelidikan & Praktik Terbimbing (Mengaplikasi)</p>
                  <p class="mb-2">Siswa melakukan simulasi/praktik langsung di workstation dengan menerapkan K3LH. Guru memfasilitasi diferensiasi proses bagi kelompok yang butuh bimbingan intensif.</p>
                  
                  <p class="font-bold text-blue-900">Fase 4: Mengembangkan & Menyajikan Hasil Karya</p>
                  <p class="mb-2">Tiap kelompok mendokumentasikan hasil pengujian dan mempresentasikan temuannya di depan kelas.</p>
                  
                  <p class="font-bold text-blue-900">Fase 5: Analisis & Evaluasi (Merefleksi)</p>
                  <p>Guru dan siswa bersama-sama mengevaluasi efektivitas solusi teknis, akurasi prosedur, dan sikap kerja tim.</p>
                </td>
                <td class="border border-gray-300 p-3 text-center">150 Menit</td>
              </tr>
              <tr>
                <td class="border border-gray-300 p-3 font-semibold bg-gray-50">3. Kegiatan Penutup</td>
                <td class="border border-gray-300 p-3">
                  <ul class="list-disc pl-5 space-y-1">
                    <li>Peserta didik bersama guru menyimpulkan inti pembelajaran.</li>
                    <li>Melakukan refleksi pengalaman belajar (lembar exit ticket).</li>
                    <li>Pemberian apresiasi kelompok terbaik dan penugasan pengayaan mandiri.</li>
                    <li>Menutup pembelajaran dengan doa syukur dan salam <em>"Om Shanti Shanti Shanti Om"</em>.</li>
                  </ul>
                </td>
                <td class="border border-gray-300 p-3 text-center">15 Menit</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 my-6">III. ASESMEN & TINDAK LANJUT</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li><strong>Asesmen Diagnostik:</strong> Tes kognitif awal dan kuesioner profil gaya belajar peserta didik.</li>
          <li><strong>Asesmen Formatif:</strong> Observasi performa kerja praktik, lembar ceklis K3LH, dan keaktifan diskusi kelompok.</li>
          <li><strong>Asesmen Sumatif:</strong> Tes tertulis pilihan ganda & uji kompetensi unjuk kerja portofolio.</li>
          <li><strong>Pengayaan & Remedial:</strong> Pendampingan tutor sebaya untuk siswa belum tuntas; penugasan proyek tingkat lanjut berbasis TEFA untuk siswa yang telah tuntas.</li>
        </ul>
      `;

    case 'bahan_ajar':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">BAHAN AJAR & MODUL PEMBELAJARAN</h2>
        <h3 class="text-lg font-bold text-gray-800">Materi: ${topic}</h3>
        <p class="text-sm text-gray-600 mb-4">Disusun untuk Mendukung Capaian Pembelajaran Kurikulum Merdeka Fase ${phase} SMK Negeri 1 Bebandem</p>

        <div class="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <h4 class="font-bold text-blue-900 mb-2">PETA KONSEP PEMBELAJARAN</h4>
          <p class="text-sm text-gray-700">1. Konsep Fundamental & Terminologi Standar -> 2. Prosedur Keselamatan Kerja (K3LH) -> 3. Pengoperasian & Analisis Teknis -> 4. Penerapan dalam Standar Dunia Industri (DUDIKA) -> 5. Quality Control & Refleksi.</p>
        </div>

        <h3 class="text-lg font-bold text-blue-800 mt-6 mb-2">1. Pengantar dan Konsep Dasar</h3>
        <p class="text-justify mb-3">Dalam lanskap kejuruan modern pada program keahlian ${vocation}, penguasaan terhadap materi <strong>${topic}</strong> merupakan kompetensi inti yang harus dimiliki setiap teknisi handal. Materi ini mengintegrasikan pemahaman teoritis dengan kecakapan psikomotorik yang presisi.</p>
        <p class="text-justify mb-3">Peserta didik di SMK Negeri 1 Bebandem dituntut untuk tidak hanya mampu menghafal langkah-langkah kerja, tetapi juga memahami prinsip 'mengapa' sebuah prosedur dipilih, bagaimana mengidentifikasi anomali, serta cara mengatasinya dengan prinsip kehati-hatian dan efisiensi waktu.</p>

        <h3 class="text-lg font-bold text-blue-800 mt-6 mb-2">2. Prosedur Kerja dan Spesifikasi Teknis</h3>
        <p class="mb-2">Langkah operasional yang wajib dipatuhi di lingkungan bengkel/lab:</p>
        <ol class="list-decimal pl-6 space-y-1 mb-4">
          <li><strong>Pemeriksaan Awal (Pre-check):</strong> Memastikan seluruh peralatan dan sumber daya dalam kondisi laik pakai.</li>
          <li><strong>Penerapan APD (K3LH):</strong> Menggunakan pakaian kerja/wearpack, sepatu pengaman, kacamata pelindung, dan sarung tangan sesuai SOP.</li>
          <li><strong>Langkah Eksekusi Utama:</strong> Mengikuti diagram alur kerja baku, mencatat setiap parameter pengukuran, dan menghindari tindakan spekulatif.</li>
          <li><strong>Finishing & Housekeeping:</strong> Membersihkan area kerja (prinsip 5R/5S: Ringkas, Rapi, Resik, Rawat, Rajin) sebelum meninggalkan workstation.</li>
        </ol>

        <h3 class="text-lg font-bold text-blue-800 mt-6 mb-2">3. Contoh Penerapan di Dunia Industri (DUDIKA)</h3>
        <p class="text-justify mb-3">Pada industri rekanan SMK Negeri 1 Bebandem, kompetensi ${topic} diaplikasikan langsung pada penanganan proyek riil konsumen. Kegagalan memahami toleransi ukuran atau konfigurasi akan berdampak pada penolakan produk (defect rate) dan pemborosan material. Oleh karena itu, ketelitian tingkat tinggi menjadi budaya wajib.</p>

        <div class="bg-amber-50 border border-amber-300 rounded p-4 my-4">
          <h4 class="font-bold text-amber-900 mb-1">Kearifan Lokal Bali: Etos Kerja Tri Hita Karana & Menyama Braya</h4>
          <p class="text-sm text-gray-800">Di lingkungan kerja Bali, keharmonisan antara manusia dengan sesama rekan kerja (Pawongan) tercermin dalam semangat saling membantu (Menyama Braya), keharmonisan dengan lingkungan kerja (Palemahan) melalui resik dan rawat bengkel, serta ketulusan dalam bekerja sebagai wujud bhakti (Parahyangan).</p>
        </div>

        <h3 class="text-lg font-bold text-blue-800 mt-6 mb-2">4. Rangkuman Materi</h3>
        <ul class="list-disc pl-6 space-y-1 mb-4 text-sm">
          <li>Pemahaman ${topic} menuntut kepatuhan SOP yang ketat dan penalaran kritis dalam menganalisis data.</li>
          <li>Keahlian praktis harus senantiasa diimbangi dengan etika kerja profesional, keselamatan diri, dan kelestarian lingkungan.</li>
        </ul>

        <h3 class="text-lg font-bold text-blue-800 mt-6 mb-2">5. Glosarium</h3>
        <p class="text-sm"><strong>SOP:</strong> Standar Operasional Prosedur. | <strong>K3LH:</strong> Keselamatan dan Kesehatan Kerja serta Lingkungan Hidup. | <strong>TEFA:</strong> Teaching Factory, pembelajaran berbasis produksi riil.</p>
      `;

    case 'lkpd':
      return `
        ${headersInfo}
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-blue-900">LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
          <p class="text-md font-semibold text-gray-700">Topik Praktik: ${topic}</p>
        </div>

        <div class="border-2 border-gray-400 p-3 mb-6 bg-gray-50 rounded">
          <table class="w-full text-sm">
            <tr><td class="w-32 font-semibold">Nama Siswa / Kelompok</td><td>: __________________________________________________</td></tr>
            <tr><td class="font-semibold">Anggota Kelompok</td><td>: 1. ______________ 2. ______________ 3. ______________ 4. ______________</td></tr>
            <tr><td class="font-semibold">Kelas / No. Absen</td><td>: ${grade} / _____</td></tr>
            <tr><td class="font-semibold">Tanggal Praktik</td><td>: ____________________</td></tr>
          </table>
        </div>

        <h3 class="font-bold text-blue-900 mb-2">A. TUJUAN KEGIATAN</h3>
        <p class="text-sm mb-4">Melalui kegiatan praktik dan investigasi ini, peserta didik mampu mengaplikasikan prosedur ${topic} dengan benar, teliti, mengutamakan keselamatan kerja (K3LH), serta bekerja sama secara kolaboratif.</p>

        <h3 class="font-bold text-blue-900 mb-2">B. ALAT DAN BAHAN</h3>
        <ul class="list-disc pl-6 text-sm mb-4">
          <li>Perangkat kerja/alat ukur kejuruan di Laboratorium SMK Negeri 1 Bebandem.</li>
          <li>Buku manual teknis / SOP Pengoperasian.</li>
          <li>Alat Pelindung Diri (APD) lengkap.</li>
          <li>Lembar catatan observasi & alat tulis.</li>
        </ul>

        <h3 class="font-bold text-blue-900 mb-2">C. LANGKAH KERJA / PROSEDUR</h3>
        <ol class="list-decimal pl-6 text-sm space-y-1 mb-4">
          <li>Lakukan pemeriksaan awal kelayakan alat dan area kerja.</li>
          <li>Catat kondisi awal spesifikasi alat pada tabel observasi di bawah.</li>
          <li>Jalankan prosedur kerja ${topic} secara bertahap sesuai instruksi guru pembimbing.</li>
          <li>Diskusikan bersama rekan sekelompok jika ditemukan ketidaksesuaian hasil.</li>
        </ol>

        <h3 class="font-bold text-blue-900 mb-2">D. TABEL HASIL PENGAMATAN & PENGUKURAN</h3>
        <table class="w-full border-collapse border border-gray-400 text-sm mb-6">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-400 p-2 w-12 text-center">No</th>
              <th class="border border-gray-400 p-2">Item Uji / Komponen</th>
              <th class="border border-gray-400 p-2">Standar Rujukan</th>
              <th class="border border-gray-400 p-2">Hasil Pengukuran Nyata</th>
              <th class="border border-gray-400 p-2">Keterangan / Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="border border-gray-400 p-3 text-center">1</td><td class="border border-gray-400 p-3">Kondisi Fisik & Kebersihan Alat</td><td class="border border-gray-400 p-3">Bebas korosi, rapi</td><td class="border border-gray-400 p-3"></td><td class="border border-gray-400 p-3"></td></tr>
            <tr><td class="border border-gray-400 p-3 text-center">2</td><td class="border border-gray-400 p-3">Parameter Input / Tegangan / Ukuran</td><td class="border border-gray-400 p-3">Toleransi &plusmn; 5%</td><td class="border border-gray-400 p-3"></td><td class="border border-gray-400 p-3"></td></tr>
            <tr><td class="border border-gray-400 p-3 text-center">3</td><td class="border border-gray-400 p-3">Uji Fungsi Operasional</td><td class="border border-gray-400 p-3">Beroperasi normal tanpa getaran</td><td class="border border-gray-400 p-3"></td><td class="border border-gray-400 p-3"></td></tr>
            <tr><td class="border border-gray-400 p-3 text-center">4</td><td class="border border-gray-400 p-3">Uji Output / Hasil Kerja Akhir</td><td class="border border-gray-400 p-3">Sesuai spesifikasi job sheet</td><td class="border border-gray-400 p-3"></td><td class="border border-gray-400 p-3"></td></tr>
          </tbody>
        </table>

        <h3 class="font-bold text-blue-900 mb-2">E. PERTANYAAN ANALISIS & PEMBAHASAN</h3>
        <p class="text-sm font-semibold mb-1">1. Analisislah apa penyebab utama jika terjadi deviasi atau perbedaan antara hasil pengukuran dengan standar acuan teknis?</p>
        <div class="border border-gray-400 rounded h-20 mb-4 p-2 bg-white text-gray-400 text-xs italic">[Ruang Jawaban Peserta Didik]</div>

        <p class="text-sm font-semibold mb-1">2. Tindakan perbaikan apa yang dapat Anda tawarkan untuk meningkatkan efisiensi dan keamanan kerja pada prosedur ini?</p>
        <div class="border border-gray-400 rounded h-20 mb-4 p-2 bg-white text-gray-400 text-xs italic">[Ruang Jawaban Peserta Didik]</div>

        <h3 class="font-bold text-blue-900 mb-2">F. KESIMPULAN KELOMPOK</h3>
        <div class="border border-gray-400 rounded h-24 mb-4 p-2 bg-white text-gray-400 text-xs italic">[Tuliskan kesimpulan menyeluruh hasil kegiatan praktik Anda di sini...]</div>
      `;

    case 'media_pembelajaran':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">RANCANGAN MEDIA PEMBELAJARAN INTERAKTIF</h2>
        <p><strong>Judul Media:</strong> Media Digital Interaktif & Presentasi Visual: ${topic}</p>
        <p><strong>Bentuk Media:</strong> Slide Deck Interaktif / Video Tutorial Praktik / Infografis Digital</p>
        <p><strong>Sasaran Pengguna:</strong> Siswa Kelas ${grade} SMK Negeri 1 Bebandem</p>

        <h3 class="text-lg font-bold text-blue-800 mt-6 mb-3">STORYBOARD SLIDE DEMI SLIDE</h3>
        <div class="space-y-4">
          <div class="border border-blue-300 rounded-lg p-3 bg-blue-50">
            <h4 class="font-bold text-blue-900">Slide 1: Judul & Orientasi Pembelajaran</h4>
            <p class="text-sm text-gray-700"><strong>Visual:</strong> Logo SMK Negeri 1 Bebandem, foto bengkel industri modern, teks judul animasi profesional.</p>
            <p class="text-sm text-gray-700"><strong>Narasi/Audio:</strong> Salam pembuka, memotivasi siswa dengan peluang karir industri relevan di Bali dan nasional.</p>
          </div>
          <div class="border border-blue-300 rounded-lg p-3 bg-white">
            <h4 class="font-bold text-blue-900">Slide 2: Pertanyaan Pemantik & Kasus Masalah</h4>
            <p class="text-sm text-gray-700"><strong>Visual:</strong> Video 30 detik kerusakan komponen akibat kelalaian teknisi.</p>
            <p class="text-sm text-gray-700"><strong>Aktivitas:</strong> Siswa berpendapat melalui polling kilat atau lembar sticky notes.</p>
          </div>
          <div class="border border-blue-300 rounded-lg p-3 bg-white">
            <h4 class="font-bold text-blue-900">Slide 3-5: Anatomi & Prosedur Teknis Inti</h4>
            <p class="text-sm text-gray-700"><strong>Visual:</strong> Infografis 3D / Diagram potongan dengan label komponen interaktif (hotspots).</p>
            <p class="text-sm text-gray-700"><strong>Penjelasan:</strong> Detail fungsi masing-masing bagian dan resiko malfungsi.</p>
          </div>
          <div class="border border-blue-300 rounded-lg p-3 bg-white">
            <h4 class="font-bold text-blue-900">Slide 6: Demonstrasi Praktik Step-by-Step</h4>
            <p class="text-sm text-gray-700"><strong>Visual:</strong> Video close-up posisi tangan, sudut pandang operator (POV), dan safety checklist.</p>
          </div>
          <div class="border border-blue-300 rounded-lg p-3 bg-blue-50">
            <h4 class="font-bold text-blue-900">Slide 7: Kuis Interaktif & Refleksi</h4>
            <p class="text-sm text-gray-700"><strong>Aktivitas:</strong> 3 soal gamifikasi tebak gambar dan urutan proses kerja.</p>
          </div>
        </div>
      `;

    case 'kisi_kisi':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">KISI-KISI PENULISAN SOAL ASESMEN</h2>
        <div class="overflow-x-auto my-4">
          <table class="min-w-full border-collapse border border-gray-400 text-sm">
            <thead class="bg-blue-900 text-white">
              <tr>
                <th class="border border-gray-400 p-2 w-12 text-center">No</th>
                <th class="border border-gray-400 p-2">Tujuan Pembelajaran (TP)</th>
                <th class="border border-gray-400 p-2">Materi Esensial</th>
                <th class="border border-gray-400 p-2">Indikator Soal</th>
                <th class="border border-gray-400 p-2 w-20 text-center">Level Kognitif</th>
                <th class="border border-gray-400 p-2 w-20 text-center">Bentuk Soal</th>
                <th class="border border-gray-400 p-2 w-16 text-center">Bobot</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-400 p-2 text-center">1</td>
                <td class="border border-gray-400 p-2">Memahami konsep dan regulasi keselamatan kerja pada ${topic}</td>
                <td class="border border-gray-400 p-2">Prinsip K3LH dan Identifikasi Bahaya</td>
                <td class="border border-gray-400 p-2">Disajikan skenario bengkel, siswa dapat menentukan APD yang tepat sesuai potensi bahaya kerja</td>
                <td class="border border-gray-400 p-2 text-center font-semibold text-blue-800">C2</td>
                <td class="border border-gray-400 p-2 text-center">PG (Opsi A-E)</td>
                <td class="border border-gray-400 p-2 text-center">10</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center">2</td>
                <td class="border border-gray-400 p-2">Menjelaskan fungsi komponen teknis dalam sistem ${topic}</td>
                <td class="border border-gray-400 p-2">Spesifikasi Komponen Utama</td>
                <td class="border border-gray-400 p-2">Diberikan gambar komponen, siswa mampu mengidentifikasi karakteristik dan cara kerjanya</td>
                <td class="border border-gray-400 p-2 text-center font-semibold text-blue-800">C3</td>
                <td class="border border-gray-400 p-2 text-center">PG (Opsi A-E)</td>
                <td class="border border-gray-400 p-2 text-center">10</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center">3</td>
                <td class="border border-gray-400 p-2">Menganalisis gangguan teknis (troubleshooting)</td>
                <td class="border border-gray-400 p-2">Analisis Kerusakan & Solusi</td>
                <td class="border border-gray-400 p-2">Disajikan data anomali pengukuran, siswa dapat mendiagnosis akar masalah secara akurat</td>
                <td class="border border-gray-400 p-2 text-center font-semibold text-purple-800">C4 (HOTS)</td>
                <td class="border border-gray-400 p-2 text-center">PG Kompleks</td>
                <td class="border border-gray-400 p-2 text-center">15</td>
              </tr>
              <tr>
                <td class="border border-gray-400 p-2 text-center">4</td>
                <td class="border border-gray-400 p-2">Merumuskan langkah penanganan perbaikan berkelanjutan</td>
                <td class="border border-gray-400 p-2">Prosedur Korektif & Evaluasi</td>
                <td class="border border-gray-400 p-2">Siswa dapat menyusun urutan perbaikan dan tindakan pencegahan rekuren</td>
                <td class="border border-gray-400 p-2 text-center font-semibold text-red-800">C5 (HOTS)</td>
                <td class="border border-gray-400 p-2 text-center">Uraian Kasus</td>
                <td class="border border-gray-400 p-2 text-center">25</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

    case 'naskah_soal':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">NASKAH SOAL EVALUASI PEMBELAJARAN</h2>
        <p class="text-sm italic text-gray-600 mb-6">Petunjuk: Pilihlah salah satu jawaban yang paling tepat (A, B, C, D, atau E) untuk soal pilihan ganda, dan jawablah pertanyaan uraian secara sistematis.</p>

        <h3 class="font-bold text-blue-900 mb-3">BAGIAN I: PILIHAN GANDA</h3>

        <div class="mb-5">
          <p class="font-semibold text-gray-800">1. Seorang teknisi di bengkel SMK Negeri 1 Bebandem sedang mempersiapkan pengerjaan ${topic}. Langkah pertama yang paling tepat dan mutlak dilakukan sebelum mengalirkan daya listrik atau mengoperasikan mesin adalah...</p>
          <div class="pl-5 space-y-1 mt-2 text-sm">
            <div>A. Langsung menguji mesin pada kecepatan rotasi maksimal untuk menghemat waktu.</div>
            <div>B. Melakukan inspeksi visual menyeluruh terhadap kabel, pelindung mekanis, dan memasang APD yang disyaratkan.</div>
            <div>C. Mengisi oli pelumas melebihi batas indikator maksimum agar mesin tidak aus.</div>
            <div>D. Menghidupkan alat tanpa membaca manual instruksi kerja karena merasa sudah berpengalaman.</div>
            <div>E. Meminta teman sejawat menyalakan mesin dari jarak jauh tanpa aba-aba.</div>
          </div>
          <div class="mt-2 bg-emerald-50 border-l-4 border-emerald-600 p-2 text-xs text-gray-700">
            <strong>Kunci Jawaban: B</strong> | <strong>Pembahasan:</strong> Sesuai SOP K3LH kejuruan, inspeksi visual dan pemakaian APD merupakan keharusan mutlak sebelum pengoperasian peralatan guna mencegah kecelakaan kerja (Zero Accident).
          </div>
        </div>

        <div class="mb-5">
          <p class="font-semibold text-gray-800">2. Pada saat melakukan pengukuran parameter ${topic}, diperoleh deviasi nilai sebesar 12% dari ambang toleransi standar industri. Tindakan yang paling tepat sesuai etika profesional adalah...</p>
          <div class="pl-5 space-y-1 mt-2 text-sm">
            <div>A. Memanipulasi laporan pengukuran agar tampak sesuai dengan spesifikasi pabrik.</div>
            <div>B. Mengabaikan deviasi tersebut karena nilainya dianggap masih relatif kecil.</div>
            <div>C. Menghentikan proses sementara, meneliti kalibrasi alat ukur, dan memeriksa komponen yang bersangkutan.</div>
            <div>D. Melimpahkan tanggung jawab pemeriksaan kepada guru pengampu tanpa memeriksa ulang.</div>
            <div>E. Membongkar seluruh unit tanpa panduan diagram teknis.</div>
          </div>
          <div class="mt-2 bg-emerald-50 border-l-4 border-emerald-600 p-2 text-xs text-gray-700">
            <strong>Kunci Jawaban: C</strong> | <strong>Pembahasan:</strong> Sikap bernalar kritis dan integritas kejuruan menuntut penghentian kerja dan pelacakan akar penyebab deviasi, dimulai dari kalibrasi instrumen ukur.
          </div>
        </div>

        <h3 class="font-bold text-blue-900 my-4">BAGIAN II: SOAL URAIAN BERBASIS STUDI KASUS (HOTS)</h3>
        <div class="mb-4 bg-gray-50 p-4 border border-gray-300 rounded">
          <p class="font-bold text-gray-800 mb-2">Soal Kasus Kejuruan:</p>
          <p class="text-sm text-gray-700 mb-2">Sebuah bengkel mitra industri di Karangasem mengalami komplain pelanggan karena unit hasil perbaikan mengalami panas berlebih (overheating) setelah 2 jam pengoperasian. Sebagai calon teknisi lulusan SMK Negeri 1 Bebandem, analisislah 3 (tiga) kemungkinan penyebab teknis dan susunlah rencana langkah investigasi sistematis untuk menyelesaikannya!</p>
          <div class="mt-3 bg-blue-50 border-l-4 border-blue-600 p-2 text-xs text-gray-800">
            <strong>Pedoman Jawaban & Rubrik:</strong><br>
            1. Mengidentifikasi minimal 3 potensi penyebab (pelumasan kurang, friksi berlebih karena ketidaksejajaran poros, sumbatan sistem pendingin/ventilasi). (Skor: 10)<br>
            2. Menyusun urutan pemeriksaan logis mulai dari inspeksi non-destruktif hingga pengujian parameter. (Skor: 10)<br>
            3. Menyampaikan solusi pencegahan jangka panjang. (Skor: 5)
          </div>
        </div>
      `;

    case 'rubrik_penilaian':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">RUBRIK PENILAIAN KOMPREHENSIF</h2>
        <p class="text-sm text-gray-600 mb-4">Rubrik ini mencakup Aspek Sikap (Dimensi Profil), Pengetahuan, dan Keterampilan Praktik Kejuruan.</p>

        <h3 class="font-bold text-blue-800 mb-2">1. Rubrik Penilaian Keterampilan Praktik & Unjuk Kerja</h3>
        <table class="w-full border-collapse border border-gray-400 text-sm mb-6">
          <thead class="bg-blue-900 text-white">
            <tr>
              <th class="border border-gray-400 p-2 w-32">Komponen Dinilai</th>
              <th class="border border-gray-400 p-2">Sangat Mahir (Skor 4 / 86-100)</th>
              <th class="border border-gray-400 p-2">Mahir (Skor 3 / 75-85)</th>
              <th class="border border-gray-400 p-2">Cukup (Skor 2 / 60-74)</th>
              <th class="border border-gray-400 p-2">Perlu Bimbingan (Skor 1 / &lt;60)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-400 p-2 font-semibold">Kepatuhan K3LH & APD</td>
              <td class="border border-gray-400 p-2">Mengenakan APD lengkap tanpa diingatkan, menjaga area kerja 100% resik dan rapi.</td>
              <td class="border border-gray-400 p-2">Mengenakan APD lengkap, sesekali diingatkan kebersihan workstation.</td>
              <td class="border border-gray-400 p-2">APD kurang lengkap (satu elemen terlewat), area kerja kurang rapi.</td>
              <td class="border border-gray-400 p-2">Mengabaikan APD dan prosedur keselamatan kerja.</td>
            </tr>
            <tr>
              <td class="border border-gray-400 p-2 font-semibold">Keterampilan Pengoperasian Alat</td>
              <td class="border border-gray-400 p-2">Pengoperasian alat sangat presisi, luwes, efisien, dan sesuai SOP standar industri.</td>
              <td class="border border-gray-400 p-2">Mengoperasikan alat dengan benar dan tepat, waktu pengerjaan sesuai alokasi.</td>
              <td class="border border-gray-400 p-2">Masih ragu-ragu dalam beberapa langkah, membutuhkan arahan guru.</td>
              <td class="border border-gray-400 p-2">Salah prosedur yang berpotensi merusak instrumen praktik.</td>
            </tr>
            <tr>
              <td class="border border-gray-400 p-2 font-semibold">Akurasi Hasil Kerja</td>
              <td class="border border-gray-400 p-2">Hasil sempurna, deviasi 0%, memenuhi toleransi ketat industri.</td>
              <td class="border border-gray-400 p-2">Hasil baik, deviasi masih dalam batas toleransi standar.</td>
              <td class="border border-gray-400 p-2">Hasil mendekati batas ambang maksimum toleransi.</td>
              <td class="border border-gray-400 p-2">Hasil kerja di luar toleransi (gagal fungsi).</td>
            </tr>
          </tbody>
        </table>

        <h3 class="font-bold text-blue-800 mb-2">2. Pedoman Konversi & Pengolahan Nilai Akhir</h3>
        <p class="text-sm mb-2">Nilai Akhir (NA) Praktik = (Total Skor Perolehan / Total Skor Maksimal) &times; 100</p>
        <p class="text-sm">Kriteria Ketuntasan Minimal (KKTP): <strong>75 (Tuntas)</strong>. Peserta didik dengan nilai &lt; 75 wajib mengikuti program remedial pendampingan.</p>
      `;

    case 'asesmen_diagnostik':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">INSTRUMEN ASESMEN DIAGNOSTIK AWAL PEMBELAJARAN</h2>
        
        <h3 class="font-bold text-blue-900 mb-2">A. Asesmen Diagnostik Non-Kognitif (Kesiapan Emosional & Gaya Belajar)</h3>
        <p class="text-sm mb-2">Tujuan: Memetakan kondisi psikologis, kesiapan fasilitas, dan preferensi cara belajar peserta didik.</p>
        <div class="border border-gray-300 rounded p-4 bg-gray-50 space-y-3 text-sm">
          <p>1. Apa yang Anda rasakan menjelang memulai materi ${topic} di bengkel/lab hari ini? (Sangat bersemangat / Biasa saja / Cemas)</p>
          <p>2. Cara belajar mana yang paling membantu Anda memahami materi baru?<br>&bull; A. Melihat demonstrasi langsung / video visual.<br>&bull; B. Mendengarkan penjelasan guru dan diskusi.<br>&bull; C. Langsung memegang alat dan mencoba sendiri (hands-on).</p>
          <p>3. Apakah Anda memiliki akses gawai atau internet di rumah untuk mengulang materi praktik? (Ya / Terbatas / Tidak)</p>
        </div>

        <h3 class="font-bold text-blue-900 mt-6 mb-2">B. Asesmen Diagnostik Kognitif (Pemetaan Pengetahuan Prasyarat)</h3>
        <table class="w-full border-collapse border border-gray-300 text-sm">
          <thead class="bg-blue-900 text-white">
            <tr>
              <th class="border border-gray-300 p-2 w-12 text-center">No</th>
              <th class="border border-gray-300 p-2">Pertanyaan Pemantik Prasyarat</th>
              <th class="border border-gray-300 p-2">Jawaban Kunci / Indikator</th>
              <th class="border border-gray-300 p-2 w-32 text-center">Tindak Lanjut</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 p-2 text-center">1</td>
              <td class="border border-gray-300 p-2">Sebutkan 3 macam APD wajib saat memasuki bengkel kejuruan!</td>
              <td class="border border-gray-300 p-2">Wearpack, Safety Shoes, Kacamata/Masker</td>
              <td class="border border-gray-300 p-2 text-xs">Jika salah, review kilat K3LH 5 menit</td>
            </tr>
            <tr>
              <td class="border border-gray-300 p-2 text-center">2</td>
              <td class="border border-gray-300 p-2">Bagaimana cara membaca skala satuan dasar pada alat ukur kejuruan?</td>
              <td class="border border-gray-300 p-2">Membaca skala utama ditambah skala nonius/digital</td>
              <td class="border border-gray-300 p-2 text-xs">Pengelompokan tutor sebaya</td>
            </tr>
          </tbody>
        </table>
      `;

    case 'asesmen_formatif':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">INSTRUMEN ASESMEN FORMATIF (MONITORING PROSES)</h2>
        <p class="text-sm text-gray-600 mb-4">Instrumen ini digunakan selama proses pembelajaran berlangsung untuk memberikan umpan balik (feedback) seketika.</p>

        <h3 class="font-bold text-blue-900 mb-2">1. Lembar Observasi Keterlibatan Diskusi & Karakter Profil Pelajar</h3>
        <table class="w-full border-collapse border border-gray-300 text-sm mb-6">
          <thead class="bg-blue-900 text-white">
            <tr>
              <th class="border border-gray-300 p-2 w-12 text-center">No</th>
              <th class="border border-gray-300 p-2">Nama Siswa</th>
              <th class="border border-gray-300 p-2 text-center">Bernalar Kritis</th>
              <th class="border border-gray-300 p-2 text-center">Kolaborasi</th>
              <th class="border border-gray-300 p-2 text-center">Kemandirian</th>
              <th class="border border-gray-300 p-2">Catatan Guru / Umpan Balik Positif</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="border border-gray-300 p-2 text-center">1</td><td class="border border-gray-300 p-2 font-medium">I Gede Agus Santika</td><td class="border border-gray-300 p-2 text-center">Aktif Bertanya</td><td class="border border-gray-300 p-2 text-center">Sangat Baik</td><td class="border border-gray-300 p-2 text-center">Mandiri</td><td class="border border-gray-300 p-2 text-xs">Mampu memandu rekan kelompok yang kesulitan.</td></tr>
            <tr><td class="border border-gray-300 p-2 text-center">2</td><td class="border border-gray-300 p-2 font-medium">Ni Kadek Dwi Aryanti</td><td class="border border-gray-300 p-2 text-center">Cukup Kritis</td><td class="border border-gray-300 p-2 text-center">Baik</td><td class="border border-gray-300 p-2 text-center">Cukup</td><td class="border border-gray-300 p-2 text-xs">Perlu dorongan keberanian saat menyampaikan gagasan.</td></tr>
          </tbody>
        </table>

        <h3 class="font-bold text-blue-900 mb-2">2. Tiket Keluar (Exit Ticket) Akhir Sesi</h3>
        <div class="border border-dashed border-blue-400 p-3 bg-blue-50 text-sm space-y-2">
          <p><strong>1 hal paling berharga yang saya pelajari hari ini:</strong> ___________________________________</p>
          <p><strong>1 hal yang masih belum saya pahami sepenuhnya:</strong> ___________________________________</p>
          <p><strong>Tingkat kepuasan saya terhadap pembelajaran hari ini:</strong> [1] [2] [3] [4] [5]</p>
        </div>
      `;

    case 'asesmen_sumatif':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">INSTRUMEN ASESMEN SUMATIF LINGKUP MATERI</h2>
        <p class="text-sm text-gray-700 mb-4">Digunakan untuk mengukur pencapaian Tujuan Pembelajaran (TP) secara menyeluruh pada akhir unit materi: <strong>${topic}</strong>.</p>

        <h3 class="font-bold text-blue-900 mb-2">Tabel Rekapitulasi Nilai & Ketercapaian TP</h3>
        <table class="w-full border-collapse border border-gray-400 text-sm mb-6">
          <thead class="bg-blue-900 text-white">
            <tr>
              <th class="border border-gray-400 p-2 w-12 text-center">No</th>
              <th class="border border-gray-400 p-2">Nama Peserta Didik</th>
              <th class="border border-gray-400 p-2 text-center">Nilai Teori (40%)</th>
              <th class="border border-gray-400 p-2 text-center">Nilai Praktik (60%)</th>
              <th class="border border-gray-400 p-2 text-center">Nilai Akhir</th>
              <th class="border border-gray-400 p-2 text-center">Status (KKTP 75)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="border border-gray-400 p-2 text-center">1</td><td class="border border-gray-400 p-2 font-medium">I Gede Agus Santika</td><td class="border border-gray-400 p-2 text-center">85</td><td class="border border-gray-400 p-2 text-center">90</td><td class="border border-gray-400 p-2 text-center font-bold">88</td><td class="border border-gray-400 p-2 text-center text-emerald-700 font-semibold">TUNTAS</td></tr>
            <tr><td class="border border-gray-400 p-2 text-center">2</td><td class="border border-gray-400 p-2 font-medium">I Komang Raditya</td><td class="border border-gray-400 p-2 text-center">65</td><td class="border border-gray-400 p-2 text-center">72</td><td class="border border-gray-400 p-2 text-center font-bold">69</td><td class="border border-gray-400 p-2 text-center text-red-600 font-semibold">REMEDIAL</td></tr>
          </tbody>
        </table>
      `;

    case 'analisis_penilaian':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">LAPORAN ANALISIS HASIL PENILAIAN & KETERCAPAIAN TP</h2>
        <div class="grid grid-cols-3 gap-4 mb-6 text-center">
          <div class="bg-blue-50 border border-blue-300 p-3 rounded">
            <div class="text-2xl font-bold text-blue-900">83.3%</div>
            <div class="text-xs text-gray-600">Ketuntasan Klasikal</div>
          </div>
          <div class="bg-emerald-50 border border-emerald-300 p-3 rounded">
            <div class="text-2xl font-bold text-emerald-800">81.2</div>
            <div class="text-xs text-gray-600">Rata-rata Kelas</div>
          </div>
          <div class="bg-amber-50 border border-amber-300 p-3 rounded">
            <div class="text-2xl font-bold text-amber-800">6 Siswa</div>
            <div class="text-xs text-gray-600">Perlu Remedial</div>
          </div>
        </div>

        <h3 class="font-bold text-blue-900 mb-2">A. Analisis Butir Tujuan Pembelajaran</h3>
        <p class="text-sm mb-4">1. <strong>TP 1 (Pemahaman Teori & Regulasi):</strong> Tingkat ketercapaian mencapai 92%. Sebagian besar peserta didik telah menguasai konsep dengan baik.<br>
        2. <strong>TP 2 (Keterampilan Praktik Kerja):</strong> Ketercapaian mencapai 84%. Siswa cekatan dalam eksekusi standar.<br>
        3. <strong>TP 3 (Troubleshooting / Analisis Gangguan):</strong> Ketercapaian 68%. Merupakan aspek paling menantang yang memerlukan penguatan penalaran kritis.</p>

        <h3 class="font-bold text-blue-900 mb-2">B. Rekomendasi Tindak Lanjut Guru</h3>
        <ul class="list-disc pl-6 text-sm space-y-1">
          <li>Melaksanakan program bimbingan remedial khusus untuk kompetensi troubleshooting dan analisis deviasi.</li>
          <li>Mengoptimalkan pendekatan peer-tutoring (tutor sebaya) dalam praktikum laboratorium berikutnya.</li>
        </ul>
      `;

    case 'program_remedial':
      return `
        ${headersInfo}
        <h2 class="text-xl font-bold text-blue-900 border-b-2 border-blue-900 pb-2 mb-4">PROGRAM REMEDIAL DAN PENGAYAAN</h2>

        <h3 class="font-bold text-red-800 border-b border-red-200 pb-1 mb-3">A. RENCANA PROGRAM REMEDIAL (PESERTA DIDIK BELUM TUNTAS)</h3>
        <table class="w-full border-collapse border border-gray-400 text-sm mb-6">
          <thead class="bg-red-800 text-white">
            <tr>
              <th class="border border-gray-400 p-2 w-12 text-center">No</th>
              <th class="border border-gray-400 p-2">Nama Siswa</th>
              <th class="border border-gray-400 p-2">TP Belum Tercapai</th>
              <th class="border border-gray-400 p-2">Bentuk Bimbingan Remedial</th>
              <th class="border border-gray-400 p-2 w-24 text-center">Nilai Awal</th>
              <th class="border border-gray-400 p-2 w-24 text-center">Nilai Akhir</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-400 p-2 text-center">1</td>
              <td class="border border-gray-400 p-2 font-medium">I Komang Raditya</td>
              <td class="border border-gray-400 p-2 text-xs">Menganalisis anomali pengukuran pada ${topic}</td>
              <td class="border border-gray-400 p-2 text-xs">Pembelajaran ulang terbimbing secara individu & job sheet latihan ulang</td>
              <td class="border border-gray-400 p-2 text-center text-red-600 font-bold">69</td>
              <td class="border border-gray-400 p-2 text-center font-bold text-emerald-700">78 (Tuntas)</td>
            </tr>
          </tbody>
        </table>

        <h3 class="font-bold text-emerald-800 border-b border-emerald-200 pb-1 mb-3">B. RENCANA PROGRAM PENGAYAAN (PESERTA DIDIK TUNTAS)</h3>
        <div class="bg-emerald-50 border border-emerald-300 p-4 rounded text-sm space-y-2">
          <p><strong>Sasaran:</strong> Peserta didik yang telah mencapai nilai &ge; 75 (misal: I Gede Agus Santika dkk).</p>
          <p><strong>Aktivitas Pengayaan:</strong> Diberikan tantangan proyek Teaching Factory (TEFA) tingkat lanjut untuk merancang modul diagnostik otomatis atau menjadi asisten instruktur (tutor sebaya) bagi rekan sekelas.</p>
          <p><strong>Bentuk Penilaian:</strong> Portofolio hasil karya dan presentasi proyek inovasi.</p>
        </div>
      `;

    default:
      return `${headersInfo}<h2 class="text-xl font-bold text-blue-900 mb-4">${topic}</h2><p>Dokumen administrasi pembelajaran SMK Negeri 1 Bebandem disusun dengan pendekatan Kurikulum Merdeka dan pembelajaran mendalam.</p>`;
  }
}

// 1. API: Generate Tujuan Pembelajaran (TP)
app.post('/api/gemini/generate-tp', async (req, res) => {
  const { cp, subject, grade, phase, vocation, characteristics } = req.body;

  if (!cp || !cp.trim()) {
    return res.status(400).json({ error: 'Capaian Pembelajaran (CP) wajib diisi' });
  }

  const prompt = `
Anda adalah Ahli Kurikulum Pendidikan Vokasi (SMK) Indonesia dan Spesialis Pengembangan Perangkat Ajar di SMK Negeri 1 Bebandem, Karangasem, Bali.
Berdasarkan informasi berikut:
- Mata Pelajaran: ${subject || 'Kejuruan'}
- Program Keahlian / Konsentrasi: ${vocation || 'SMK'}
- Kelas / Fase: ${grade || 'X'} (Fase ${phase || 'E'})
- Karakteristik Peserta Didik: ${characteristics || 'Minat vokasi tinggi, menyukai praktik'}
- Capaian Pembelajaran (CP):
"""${cp}"""

TUGAS ANDA:
1. Analisis CP tersebut secara mendalam.
2. Rumuskan 3 hingga 5 Tujuan Pembelajaran (TP) yang:
   - Menggunakan Kata Kerja Operasional (KKO) Taksonomi Bloom (revisi) yang terukur dan spesifik (C1-C6).
   - Menyelaraskan dengan fase ${phase || 'E'} dan orientasi kejuruan dunia kerja (DUDIKA).
   - Memasukkan unsur kompetensi esensial, pemecahan masalah, dan sikap kerja.
   - Disajikan secara berurutan, sistematis, dan bernomor (1, 2, 3, dst).

Keluarkan HANYA daftar nomor Tujuan Pembelajaran dalam bahasa Indonesia baku yang formal dan jelas tanpa kalimat pembuka atau penutup yang tidak perlu.
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text ? response.text.trim() : '';
      if (text) {
        return res.json({ tp: text });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, using high-quality fallback generator:', err.message);
    }
  }

  // Fallback
  const fallbackText = generateFallbackTP(cp, subject, grade, vocation);
  return res.json({ tp: fallbackText });
});

// 2. API: Generate Dokumen Administrasi
app.post('/api/gemini/generate-doc', async (req, res) => {
  const { docType, data } = req.body;

  if (!docType || !data) {
    return res.status(400).json({ error: 'docType dan data wajib disertakan' });
  }

  const docTitles: Record<string, string> = {
    modul_ajar: 'MODUL AJAR / RENCANA PEMBELAJARAN',
    bahan_ajar: 'BAHAN AJAR DAN MATERI PEMBELAJARAN',
    lkpd: 'LEMBAR KERJA PESERTA DIDIK (LKPD/LKS)',
    media_pembelajaran: 'RANCANGAN MEDIA PEMBELAJARAN',
    kisi_kisi: 'KISI-KISI PENULISAN SOAL ASESMEN',
    naskah_soal: 'NASKAH SOAL DAN KUNCI JAWABAN LENGKAP',
    rubrik_penilaian: 'RUBRIK PENILAIAN KOMPREHENSIF',
    asesmen_diagnostik: 'INSTRUMEN ASESMEN DIAGNOSTIK AWAL',
    asesmen_formatif: 'INSTRUMEN ASESMEN FORMATIF BERKALA',
    asesmen_sumatif: 'INSTRUMEN ASESMEN SUMATIF LINGKUP MATERI',
    analisis_penilaian: 'ANALISIS HASIL PENILAIAN DAN KETERCAPAIAN TP',
    program_remedial: 'PROGRAM REMEDIAL DAN PENGAYAAN',
  };

  const title = docTitles[docType] || 'DOKUMEN ADMINISTRASI PEMBELAJARAN';

  const prompt = `
Bertindaklah sebagai Ahli Kurikulum Pendidikan Vokasi SMK Indonesia dan Instruktur Senior SMK Negeri 1 Bebandem, Karangasem, Bali.
Buatlah dokumen administrasi pembelajaran lengkap dan profesional berjudul "${title}".

Identitas Pembelajaran:
- Sekolah: SMK Negeri 1 Bebandem, Karangasem, Bali
- Tahun Ajaran: ${data.academicYear || '2026/2027'}
- Nama Guru: ${data.teacherName || 'Guru Mata Pelajaran'} (NIP: ${data.teacherNip || '-'})
- Mata Pelajaran: ${data.subject || 'Mata Pelajaran Kejuruan'}
- Program / Konsentrasi Keahlian: ${data.vocation || 'Teknik & Bisnis'}
- Kelas / Fase / Semester: ${data.grade || 'X'} / Fase ${data.phase || 'E'} / ${data.semester || 'Ganjil'}
- Materi / Topik: ${data.topic || 'Kompetensi Kejuruan'}
- Capaian Pembelajaran (CP): ${data.cp || '-'}
- Tujuan Pembelajaran (TP): ${data.tp || '-'}
- Alokasi Waktu: ${data.duration || '4 JP x 45 Menit'}
- Jumlah Peserta Didik: ${data.studentCount || 36}
- Karakteristik Peserta Didik: ${data.studentCharacteristics || 'Minat kinestetik dan visual praktis'}
- Model Pembelajaran: ${data.model || 'Problem Based Learning (PBL)'}
- Metode Pembelajaran: ${Array.isArray(data.methods) ? data.methods.join(', ') : data.methods || 'Diskusi, Praktik, Demonstrasi'}
- Dimensi Profil Lulusan: ${Array.isArray(data.dimensions) ? data.dimensions.join(', ') : data.dimensions || 'Penalaran Kritis, Kolaborasi, Kemandirian, Kreativitas'}
- Pengaturan Tambahan:
  * Pembelajaran Mendalam (Deep Learning: Memahami, Mengaplikasi, Merefleksi): ${data.deepLearning ? 'Ya' : 'Standar'}
  * Pembelajaran Berdiferensiasi: ${data.differentiation ? 'Ya (Konten, Proses, Produk)' : 'Tidak'}
  * Kearifan Lokal Bali: ${data.baliWisdom ? 'Ya (Integrasikan nilai Tri Hita Karana, Menyama Braya, dan etos kerja Bali)' : 'Umum'}
  * Integrasi Digital & Literasi/Numerasi: ${data.digitalTech ? 'Ya' : 'Dasar'}
  * Praktik Kejuruan TEFA: ${data.vocationalPractice ? 'Ya' : 'Standar'}

KETENTUAN OUTPUT KHUSUS DOKUMEN:
- Dokumen harus LENGKAP, SISTEMATIS, MENDALAM, tidak berupa ringkasan pendek.
- Format dalam bentuk HTML bersih (menggunakan tag <h2>, <h3>, <p>, <ul>, <ol>, <table> dengan class Tailwind CSS seperti: border, border-collapse, p-2, bg-blue-50, dll).
- JANGAN sertakan tag <html>, <head>, atau <body> utama, cukup konten isi dokumennya saja (karena kop surat resmi dan tanda tangan resmi kepala sekolah & guru akan otomatis dipasang oleh sistem pembungkus dokumen).
- Sertakan tabel-tabel terstruktur jika dokumen memerlukan tabel (misal kisi-kisi, langkah pembelajaran, rubrik skor, hasil LKPD, atau instrumen tes).
- Untuk soal pilihan ganda wajib opsi A, B, C, D, E disertai Kunci Jawaban dan Pembahasan.
- Bahasa Indonesia baku, formal, dan mencerminkan mutu SMK Negeri 1 Bebandem yang unggul.
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text ? response.text.trim() : '';
      if (text) {
        return res.json({ content: text, title });
      }
    } catch (err: any) {
      console.warn(`Gemini generation for ${docType} failed, using detailed fallback:`, err.message);
    }
  }

  // High-fidelity fallback
  const content = getFallbackDocument(docType, data);
  return res.json({ content, title });
});

// 3. API: Refine / Edit Document with AI
app.post('/api/gemini/refine-doc', async (req, res) => {
  const { currentContent, actionType, instruction, data } = req.body;

  if (!currentContent) {
    return res.status(400).json({ error: 'currentContent wajib disertakan' });
  }

  const prompt = `
Anda adalah Asisten AI Kurikulum SMK Negeri 1 Bebandem.
Diberikan konten dokumen administrasi pembelajaran berikut:
"""
${currentContent}
"""

Instruksi Perubahan:
Tipe Aksi: ${actionType || 'Edit Khusus'}
Permintaan Spesifik: ${instruction || 'Sempurnakan kualitas bahasa, kedalaman materi kejuruan, dan kerapian format'}
Konteks Sekolah: SMK Negeri 1 Bebandem, Karangasem, Bali (TA 2026/2027), Mapel: ${data?.subject || 'Kejuruan'}, Topik: ${data?.topic || '-'}.

Lakukan modifikasi yang diminta pada dokumen tersebut. Kembalikan HANYA hasil dokumen HTML bersih yang telah diperbarui tanpa teks pengantar.
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text ? response.text.trim() : '';
      if (text) {
        return res.json({ content: text });
      }
    } catch (err: any) {
      console.warn('Gemini refine failed:', err.message);
    }
  }

  // Graceful fallback for refinement
  let refined = currentContent;
  if (actionType === 'perluas') {
    refined += `
      <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 class="font-bold text-blue-900">Tambahan Pengayaan Materi Industri (DUDIKA)</h4>
        <p class="text-sm text-gray-700">Untuk memperdalam penguasaan peserta didik, ditambahkan studi kasus riil mengenai integrasi teknologi modern dan standardisasi mutu pada SMK Negeri 1 Bebandem.</p>
      </div>
    `;
  } else if (actionType === 'bali') {
    refined += `
      <div class="mt-4 p-4 bg-amber-50 border border-amber-300 rounded">
        <h4 class="font-bold text-amber-900">Integrasi Kearifan Lokal Bali (Tri Hita Karana)</h4>
        <p class="text-sm text-gray-800">Menanamkan nilai <em>Menyama Braya</em> (solidaritas tanpa membedakan) dalam kerja kelompok, serta pemeliharaan keharmonisan lingkungan bengkel (Palemahan) sebagai wujud penghormatan terhadap fasilitas pendidikan.</p>
      </div>
    `;
  } else {
    refined = currentContent;
  }

  return res.json({ content: refined });
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SI GURU server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
