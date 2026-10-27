import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { generateSingleDoc, generateAllDocs } from './src/utils/documentGenerator';

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

// Helper to call Gemini with a strict timeout (e.g., 3.5 seconds)
async function callGeminiSafe(prompt: string, timeoutMs = 3500): Promise<string | null> {
  if (!ai) return null;
  try {
    const generatePromise = ai.models
      .generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      })
      .then((res) => (res.text ? res.text.trim() : null))
      .catch((err) => {
        console.warn('Gemini call error:', err.message);
        return null;
      });

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn('Gemini call reached timeout of', timeoutMs, 'ms, falling back to local generator');
        resolve(null);
      }, timeoutMs)
    );

    return await Promise.race([generatePromise, timeoutPromise]);
  } catch (err: any) {
    console.warn('Safe Gemini runner caught error:', err.message);
    return null;
  }
}

// 1. API: Generate Tujuan Pembelajaran (TP)
app.post('/api/gemini/generate-tp', async (req, res) => {
  const { cp, subject, grade, phase, vocation, characteristics } = req.body;

  if (!cp || !cp.trim()) {
    return res.status(400).json({ error: 'Capaian Pembelajaran (CP) wajib diisi' });
  }

  const prompt = `
Anda adalah Ahli Kurikulum Pendidikan Vokasi (SMK) Indonesia di SMK Negeri 1 Bebandem, Karangasem, Bali.
Mata Pelajaran: ${subject || 'Kejuruan'}
Program Keahlian: ${vocation || 'SMK'}
Kelas / Fase: ${grade || 'X'} (Fase ${phase || 'E'})
Karakteristik: ${characteristics || 'Praktis, minat vokasi'}
Capaian Pembelajaran (CP):
"""${cp}"""

TUGAS:
Rumuskan 3 hingga 5 Tujuan Pembelajaran (TP) terukur (KKO Bloom C1-C6) yang spesifik dan sistematis.
Keluarkan HANYA daftar nomor TP tanpa teks pembuka.
`;

  const aiText = await callGeminiSafe(prompt, 3000);
  if (aiText) {
    return res.json({ tp: aiText });
  }

  // Resilient fallback
  const fallback = [
    `1. Mengidentifikasi konsep esensial, regulasi, dan prosedur keselamatan kerja (K3LH) pada ${subject || 'bidang kejuruan'} sesuai standar industri.`,
    `2. Menerapkan langkah-langkah kerja teknis dan pengoperasian peralatan secara presisi berdasarkan standar operasional prosedur (SOP).`,
    `3. Mendiagnosis kendala atau deviasi hasil pengujian serta merumuskan tindakan perbaikan (troubleshooting) secara bernalar kritis.`,
    `4. Mengevaluasi hasil karya/praktik secara mandiri dan berkolaborasi dalam kerja tim dengan menjunjung nilai kearifan lokal Bali.`,
  ].join('\n');

  return res.json({ tp: fallback });
});

// 2. API: Generate Single Dokumen
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
    naskah_soal: 'NASKAH SOAL DAN KUNCI JAWABAN',
    rubrik_penilaian: 'RUBRIK PENILAIAN KOMPREHENSIF',
    asesmen_diagnostik: 'INSTRUMEN ASESMEN DIAGNOSTIK AWAL',
    asesmen_formatif: 'INSTRUMEN ASESMEN FORMATIF',
    asesmen_sumatif: 'INSTRUMEN ASESMEN SUMATIF LINGKUP MATERI',
    analisis_penilaian: 'ANALISIS HASIL PENILAIAN DAN KETERCAPAIAN TP',
    program_remedial: 'PROGRAM REMEDIAL DAN PENGAYAAN',
  };

  const title = docTitles[docType] || 'DOKUMEN ADMINISTRASI';

  const prompt = `
Sebagai Instruktur SMK Negeri 1 Bebandem, buatkan dokumen "${title}" untuk:
Mapel: ${data.subject}, Topik: ${data.topic}, Kelas: ${data.grade}, Fase: ${data.phase}, Guru: ${data.teacherName}.
Sajikan dalam HTML bersih (menggunakan h2, h3, p, table class Tailwind). Jangan sertakan html/body wrapper.
`;

  const aiText = await callGeminiSafe(prompt, 3500);
  if (aiText) {
    return res.json({ content: aiText, title });
  }

  // Resilient instant generator
  const content = generateSingleDoc(docType, {
    teacher: {
      teacherName: data.teacherName,
      teacherNip: data.teacherNip,
      subject: data.subject,
      vocation: data.vocation,
      grade: data.grade,
      phase: data.phase,
      semester: data.semester,
      academicYear: data.academicYear,
    },
    learning: {
      topic: data.topic,
      cp: data.cp,
      tp: data.tp,
      duration: data.duration,
      studentCount: data.studentCount,
      studentCharacteristics: data.studentCharacteristics,
    },
    methods: {
      methods: data.methods || [],
      model: data.model || 'Problem Based Learning (PBL)',
      dimensions: data.dimensions || [],
    },
    settings: {
      deepLearning: !!data.deepLearning,
      differentiation: !!data.differentiation,
      digitalTech: !!data.digitalTech,
      literacy: !!data.literacy,
      numeracy: !!data.numeracy,
      baliWisdom: !!data.baliWisdom,
      characterEducation: !!data.characterEducation,
      vocationalPractice: !!data.vocationalPractice,
    },
  });

  return res.json({ content, title });
});

// 3. API: Generate ALL 12 Documents in a single batch request!
app.post('/api/gemini/generate-all', async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'data wajib disertakan' });
  }

  const generated = generateAllDocs({
    teacher: {
      teacherName: data.teacherName,
      teacherNip: data.teacherNip,
      subject: data.subject,
      vocation: data.vocation,
      grade: data.grade,
      phase: data.phase,
      semester: data.semester,
      academicYear: data.academicYear,
    },
    learning: {
      topic: data.topic,
      cp: data.cp,
      tp: data.tp,
      duration: data.duration,
      studentCount: data.studentCount,
      studentCharacteristics: data.studentCharacteristics,
    },
    methods: {
      methods: data.methods || [],
      model: data.model || 'Problem Based Learning (PBL)',
      dimensions: data.dimensions || [],
    },
    settings: {
      deepLearning: !!data.deepLearning,
      differentiation: !!data.differentiation,
      digitalTech: !!data.digitalTech,
      literacy: !!data.literacy,
      numeracy: !!data.numeracy,
      baliWisdom: !!data.baliWisdom,
      characterEducation: !!data.characterEducation,
      vocationalPractice: !!data.vocationalPractice,
    },
  });

  return res.json({ documents: generated });
});

// 4. API: Refine / Edit Document with AI
app.post('/api/gemini/refine-doc', async (req, res) => {
  const { currentContent, actionType, instruction, data } = req.body;

  if (!currentContent) {
    return res.status(400).json({ error: 'currentContent wajib disertakan' });
  }

  const prompt = `
Modifikasi dokumen administrasi SMK Negeri 1 Bebandem berikut:
"""${currentContent}"""
Aksi: ${actionType}
Instruksi: ${instruction}
Kembalikan HANYA HTML bersih hasil pembaruan.
`;

  const aiText = await callGeminiSafe(prompt, 3500);
  if (aiText) {
    return res.json({ content: aiText });
  }

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
        <p class="text-sm text-gray-800">Menanamkan nilai <em>Menyama Braya</em> dalam kerja tim kejuruan dan pemeliharaan keharmonisan fasilitas bengkel.</p>
      </div>
    `;
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
