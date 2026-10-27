import React from 'react';
import { ADMIN_DOCS_CONFIG } from '../constants/defaults';
import { TeacherIdentity, LearningIdentity } from '../types';
import {
  Sparkles,
  BookOpen,
  FileText,
  ClipboardList,
  Presentation,
  Grid,
  CheckSquare,
  Award,
  Compass,
  Activity,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock,
  Printer,
  Download,
} from 'lucide-react';

interface DashboardProps {
  teacher: TeacherIdentity;
  learning: LearningIdentity;
  generatedDocs: Record<string, string>;
  onSelectDoc: (docType: string) => void;
  onGenerateSingle: (docType: string) => void;
  onGenerateAll: () => void;
  isGeneratingAll: boolean;
  generatingDocType: string | null;
  onExportWord: (docType: string) => void;
}

const iconMap: Record<string, any> = {
  BookOpen,
  FileText,
  ClipboardList,
  Presentation,
  Grid,
  CheckSquare,
  Award,
  Compass,
  Activity,
  CheckCircle2,
  BarChart3,
  RefreshCw,
};

export const AdminMenuDashboard: React.FC<DashboardProps> = ({
  teacher,
  learning,
  generatedDocs,
  onSelectDoc,
  onGenerateSingle,
  onGenerateAll,
  isGeneratingAll,
  generatingDocType,
  onExportWord,
}) => {
  const completedCount = Object.keys(generatedDocs).filter((key) => generatedDocs[key]?.trim()).length;
  const progressPercent = Math.round((completedCount / 12) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Banner with Teacher profile summary & Batch generation status */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-700/60 px-3 py-1 rounded-full text-xs font-semibold text-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>SMK NEGERI 1 BEBANDEM &bull; TA 2026/2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard 12 Administrasi Pembelajaran
            </h1>
            <p className="text-sm text-blue-200/90 max-w-3xl">
              Guru: <span className="text-white font-semibold">{teacher.teacherName}</span> &bull; Mapel:{' '}
              <span className="text-amber-300 font-semibold">{teacher.subject}</span> &bull; Topik:{' '}
              <span className="text-blue-100 font-medium">"{learning.topic}"</span>
            </p>
          </div>

          {/* Action: Generate Semua */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onGenerateAll}
              disabled={isGeneratingAll}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <Sparkles className={`w-5 h-5 ${isGeneratingAll ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAll ? 'Sedang Memproses 12 Dokumen...' : 'GENERATE SEMUA (12 DOKUMEN)'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-5 border-t border-blue-900/60">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-2">
            <div className="flex items-center gap-2 font-medium">
              <span>Kelengkapan Administrasi:</span>
              <span className="bg-blue-800/80 text-white font-bold px-2 py-0.5 rounded">
                {completedCount} dari 12 Dokumen Siap
              </span>
            </div>
            <span className="font-bold text-amber-400">{progressPercent}% Selesai</span>
          </div>
          <div className="w-full bg-slate-800/90 rounded-full h-3 overflow-hidden border border-blue-800/30">
            <div
              className="bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 12 Administration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ADMIN_DOCS_CONFIG.map((doc, idx) => {
          const IconComponent = iconMap[doc.icon] || FileText;
          const isDone = !!generatedDocs[doc.type]?.trim();
          const isCurrentGenerating = generatingDocType === doc.type;

          return (
            <div
              key={doc.type}
              className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md ${
                isDone
                  ? 'border-emerald-200 hover:border-emerald-400 ring-1 ring-emerald-100'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header card with colorful badge */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color} text-white flex items-center justify-center shadow-md shrink-0`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {doc.badge}
                    </span>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Tersedia & Siap</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Belum Dibuat</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title and subtitle */}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-700">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{doc.subtitle}</p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onGenerateSingle(doc.type)}
                  disabled={isCurrentGenerating || isGeneratingAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Generate ulang menggunakan AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isCurrentGenerating ? 'animate-spin text-amber-600' : ''}`} />
                  <span>{isCurrentGenerating ? 'Membuat...' : isDone ? 'Regenerate AI' : 'Generate AI'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {isDone && (
                    <button
                      type="button"
                      onClick={() => onExportWord(doc.type)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Download Dokumen Word (.doc/.docx)"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectDoc(doc.type)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      isDone
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{isDone ? 'Buka & Edit' : 'Buka Draft'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
