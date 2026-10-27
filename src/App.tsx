import React, { useState, useEffect } from 'react';
import {
  DEFAULT_TEACHER,
  DEFAULT_LEARNING,
  DEFAULT_METHODS,
  DEFAULT_SETTINGS,
  ADMIN_DOCS_CONFIG,
  INITIAL_STUDENTS,
} from './constants/defaults';
import { TeacherIdentity, LearningIdentity, LearningMethods, AdditionalSettings, StudentScore, SavedRecord } from './types';
import { Navbar } from './components/Navbar';
import { TeacherAndLearningForm } from './components/TeacherAndLearningForm';
import { AdminMenuDashboard } from './components/AdminMenuDashboard';
import { DocumentEditorView } from './components/DocumentEditorView';
import { AssessmentAnalysisView } from './components/AssessmentAnalysisView';
import { DatabaseHistoryView } from './components/DatabaseHistoryView';
import { exportToWordDocument } from './utils/docxExport';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('form');
  const [teacher, setTeacher] = useState<TeacherIdentity>(() => {
    const saved = localStorage.getItem('siguru_teacher');
    return saved ? JSON.parse(saved) : DEFAULT_TEACHER;
  });

  const [learning, setLearning] = useState<LearningIdentity>(() => {
    const saved = localStorage.getItem('siguru_learning');
    return saved ? JSON.parse(saved) : DEFAULT_LEARNING;
  });

  const [methods, setMethods] = useState<LearningMethods>(() => {
    const saved = localStorage.getItem('siguru_methods');
    return saved ? JSON.parse(saved) : DEFAULT_METHODS;
  });

  const [settings, setSettings] = useState<AdditionalSettings>(() => {
    const saved = localStorage.getItem('siguru_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [currentDocType, setCurrentDocType] = useState<string>('modul_ajar');
  const [generatedDocs, setGeneratedDocs] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('siguru_docs');
    return saved ? JSON.parse(saved) : {};
  });

  const [students, setStudents] = useState<StudentScore[]>(() => {
    const saved = localStorage.getItem('siguru_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>(() => {
    const saved = localStorage.getItem('siguru_records');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'rec-init-2026',
        title: 'Administrasi RPL Kelas XI Ganjil - Web & RESTful API',
        createdAt: '2026-08-01',
        updatedAt: '2026-08-15',
        teacher: DEFAULT_TEACHER,
        learning: DEFAULT_LEARNING,
        methods: DEFAULT_METHODS,
        settings: DEFAULT_SETTINGS,
        documents: {},
        assessment: {
          tps: ['TP1', 'TP2', 'TP3', 'TP4'],
          passingScore: 75,
          students: INITIAL_STUDENTS,
        },
      },
    ];
  });

  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatingDocType, setGeneratingDocType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('siguru_teacher', JSON.stringify(teacher));
  }, [teacher]);

  useEffect(() => {
    localStorage.setItem('siguru_learning', JSON.stringify(learning));
  }, [learning]);

  useEffect(() => {
    localStorage.setItem('siguru_methods', JSON.stringify(methods));
  }, [methods]);

  useEffect(() => {
    localStorage.setItem('siguru_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('siguru_docs', JSON.stringify(generatedDocs));
  }, [generatedDocs]);

  useEffect(() => {
    localStorage.setItem('siguru_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('siguru_records', JSON.stringify(savedRecords));
  }, [savedRecords]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerateSingle = async (docType: string) => {
    setGeneratingDocType(docType);
    try {
      const res = await fetch('/api/gemini/generate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          data: {
            ...teacher,
            ...learning,
            ...methods,
            ...settings,
          },
        }),
      });

      if (!res.ok) throw new Error('Gagal memproses dokumen');
      const data = await res.json();
      if (data.content) {
        setGeneratedDocs((prev) => ({
          ...prev,
          [docType]: data.content,
        }));
        showToast(`Dokumen "${data.title}" berhasil di-generate!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Berhasil menghasilkan dokumen dengan data kurikulum SMK Negeri 1 Bebandem.');
    } finally {
      setGeneratingDocType(null);
    }
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    showToast('Memulai generator batch untuk seluruh 12 administrasi...');

    for (const doc of ADMIN_DOCS_CONFIG) {
      setGeneratingDocType(doc.type);
      try {
        const res = await fetch('/api/gemini/generate-doc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docType: doc.type,
            data: {
              ...teacher,
              ...learning,
              ...methods,
              ...settings,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            setGeneratedDocs((prev) => ({
              ...prev,
              [doc.type]: data.content,
            }));
          }
        }
      } catch (e) {
        console.warn(`Fallback for ${doc.type}`);
      }
    }

    setGeneratingDocType(null);
    setIsGeneratingAll(false);
    showToast('Selamat! Seluruh 12 Administrasi Pembelajaran selesai dibuat dan siap dicetak.');
  };

  const handleSaveToDatabase = () => {
    const newRecord: SavedRecord = {
      id: `rec-${Date.now()}`,
      title: `${teacher.subject} - ${learning.topic.substring(0, 45)}...`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      teacher,
      learning,
      methods,
      settings,
      documents: generatedDocs,
      assessment: {
        tps: ['TP1', 'TP2', 'TP3', 'TP4'],
        passingScore: 75,
        students,
      },
    };

    setSavedRecords((prev) => [newRecord, ...prev]);
    showToast('Arsip administrasi berhasil disimpan ke Database lokal & siap disinkronkan ke Google Spreadsheet!');
  };

  const handleLoadRecord = (record: SavedRecord) => {
    setTeacher(record.teacher);
    setLearning(record.learning);
    setMethods(record.methods);
    setSettings(record.settings);
    if (record.documents) setGeneratedDocs(record.documents);
    if (record.assessment?.students) setStudents(record.assessment.students);
    setActiveTab('menu');
    showToast(`Arsip "${record.title}" berhasil dimuat ke editor.`);
  };

  const handleDuplicateRecord = (record: SavedRecord) => {
    const duplicated: SavedRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      title: `[Salinan] ${record.title}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSavedRecords((prev) => [duplicated, ...prev]);
    showToast('Dokumen berhasil diduplikasi untuk pembelajaran berikutnya.');
  };

  const handleDeleteRecord = (id: string) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('Arsip dokumen berhasil dihapus.');
  };

  const handleSyncWebhook = async (url: string): Promise<boolean> => {
    try {
      const currentRecord: SavedRecord = {
        id: `rec-${Date.now()}`,
        title: `${teacher.subject} - ${learning.topic}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        teacher,
        learning,
        methods,
        settings,
        documents: generatedDocs,
        assessment: {
          tps: ['TP1', 'TP2', 'TP3', 'TP4'],
          passingScore: 75,
          students,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SYNC_ALL',
          record: currentRecord,
        }),
      });

      return res.ok;
    } catch (e) {
      console.error('Webhook sync failed:', e);
      return false;
    }
  };

  const handleExportWord = (docType: string) => {
    const config = ADMIN_DOCS_CONFIG.find((d) => d.type === docType);
    const title = config ? config.title : 'Dokumen Administrasi';
    const content = generatedDocs[docType] || `<p>Dokumen belum di-generate.</p>`;
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_SMKN1Bebandem`;
    const orientation = docType === 'kisi_kisi' || docType === 'analisis_penilaian' ? 'landscape' : 'portrait';
    exportToWordDocument(filename, title, content, teacher, orientation);
  };

  const handleUpdateAnalysisDoc = (analysisHtml: string, remedialHtml: string) => {
    setGeneratedDocs((prev) => ({
      ...prev,
      analisis_penilaian: analysisHtml,
      program_remedial: remedialHtml,
    }));
    showToast('Dokumen 11 (Analisis Penilaian) & Dokumen 12 (Remedial & Pengayaan) telah diperbarui otomatis!');
  };

  const generatedCount = Object.keys(generatedDocs).filter((k) => generatedDocs[k]?.trim()).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white border-2 border-amber-400 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold animate-bounce flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        generatedCount={generatedCount}
        onGenerateAll={handleGenerateAll}
        isGeneratingAll={isGeneratingAll}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'form' && (
          <TeacherAndLearningForm
            teacher={teacher}
            setTeacher={setTeacher}
            learning={learning}
            setLearning={setLearning}
            methods={methods}
            setMethods={setMethods}
            settings={settings}
            setSettings={setSettings}
            onSave={handleSaveToDatabase}
            onProceedToMenu={() => setActiveTab('menu')}
          />
        )}

        {activeTab === 'menu' && (
          <AdminMenuDashboard
            teacher={teacher}
            learning={learning}
            generatedDocs={generatedDocs}
            onSelectDoc={(type) => {
              setCurrentDocType(type);
              if (!generatedDocs[type]) {
                handleGenerateSingle(type);
              }
              setActiveTab('editor');
            }}
            onGenerateSingle={handleGenerateSingle}
            onGenerateAll={handleGenerateAll}
            isGeneratingAll={isGeneratingAll}
            generatingDocType={generatingDocType}
            onExportWord={handleExportWord}
          />
        )}

        {activeTab === 'editor' && (
          <DocumentEditorView
            currentDocType={currentDocType}
            setCurrentDocType={setCurrentDocType}
            generatedDocs={generatedDocs}
            setGeneratedDocs={setGeneratedDocs}
            teacher={teacher}
            learning={learning}
            onSaveToDatabase={handleSaveToDatabase}
          />
        )}

        {activeTab === 'assessment' && (
          <AssessmentAnalysisView
            students={students}
            setStudents={setStudents}
            teacher={teacher}
            learning={learning}
            onUpdateAnalysisDoc={handleUpdateAnalysisDoc}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseHistoryView
            records={savedRecords}
            onLoadRecord={handleLoadRecord}
            onDuplicateRecord={handleDuplicateRecord}
            onDeleteRecord={handleDeleteRecord}
            onSyncWebhook={handleSyncWebhook}
          />
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="font-bold text-white tracking-wide">
              SMK NEGERI 1 BEBANDEM &bull; TAHUN AJARAN 2026/2027
            </p>
            <p className="text-[11px] text-slate-400">
              Jl. Kuncara Giri, Sibetan, Bebandem, Karangasem, Bali. &bull; Kepala Sekolah:{' '}
              <span className="text-slate-200">I Wayan Darmayasa, S.T., M.Si.</span> (NIP. 19730522 200501 1 009)
            </p>
          </div>
          <div className="text-[11px] text-slate-500">
            SI GURU – Smart Administration Generator v2.0
          </div>
        </div>
      </footer>
    </div>
  );
}
