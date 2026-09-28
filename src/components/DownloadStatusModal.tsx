import React, { useEffect, useState } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
  Info,
  Film,
  Music,
  ExternalLink,
  ArrowDownCircle,
} from 'lucide-react';
import { MediaFormat } from '../types';
import { formatFileSize, downloadFileDirectly, sanitizeFilename } from '../utils/formatters';

interface DownloadStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: MediaFormat | null;
  videoTitle?: string;
  source?: string;
  language: 'id' | 'en';
}

export const DownloadStatusModal: React.FC<DownloadStatusModalProps> = ({
  isOpen,
  onClose,
  format,
  videoTitle,
  source,
  language,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setSecondsElapsed(0);
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !format) return null;

  const isAudio = format.type === 'audio' || ['mp3', 'm4a', 'aac', 'opus'].includes(format.ext.toLowerCase());

  const t = {
    id: {
      title: 'Memulai Pengunduhan',
      subtitle: 'Permintaan berkas telah dikirim ke browser Anda',
      checkingStatus: 'Browser Anda sedang mengunduh media...',
      browserTipTitle: 'Cek Menu Unduhan Browser Anda',
      browserTipText: 'File akan otomatis masuk ke daftar download browser (ikon panah unduh di sudut kanan atas atau bawah layar).',
      shortcutTip: 'Pintasan melihat riwayat unduhan browser: Tekan Ctrl + J (Windows) atau Cmd + Option + L (Mac).',
      retryBtn: 'Unduh Ulang (Jika Belum Muncul)',
      doneBtn: 'Selesai & Tutup',
      fileDetails: 'Rincian Berkas',
      retrying: 'Mengirim Ulang...',
    },
    en: {
      title: 'Initiating Download',
      subtitle: 'File stream requested to your browser',
      checkingStatus: 'Your browser is processing the download...',
      browserTipTitle: 'Check Your Browser Downloads Bar',
      browserTipText: 'The file will appear in your browser download manager (arrow icon at top-right or bottom bar).',
      shortcutTip: 'Quick shortcut: Press Ctrl + J (Windows) or Cmd + Option + L (Mac) to view browser downloads.',
      retryBtn: 'Download Again (If Not Started)',
      doneBtn: 'Done & Close',
      fileDetails: 'File Details',
      retrying: 'Retrying...',
    },
  }[language];

  const handleRetry = async () => {
    setIsRetrying(true);
    const safeTitle = sanitizeFilename(videoTitle || 'media', format.ext);
    await downloadFileDirectly(format.url, safeTitle);
    setTimeout(() => {
      setIsRetrying(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {t.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Animated Status Area */}
          <div className="flex flex-col items-center justify-center text-center py-4 px-3 bg-slate-950/80 border border-white/[0.06] rounded-2xl relative overflow-hidden">
            <div className="relative mb-3 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center animate-pulse">
                <ArrowDownCircle className="w-8 h-8 text-blue-400 animate-bounce" />
              </div>
            </div>

            <h4 className="text-sm font-bold text-white mb-1">
              {t.checkingStatus}
            </h4>
            <p className="text-xs text-slate-400">
              Waktu proses: <span className="font-mono text-blue-400 font-bold">{secondsElapsed} detik</span>
            </p>
          </div>

          {/* File Information Card */}
          <div className="bg-slate-950/60 border border-white/[0.08] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400">{t.fileDetails}:</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {format.label} ({format.ext.toUpperCase()})
              </span>
            </div>
            <p className="text-xs font-bold text-white line-clamp-2">
              {videoTitle || 'Berkas Media'}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>Ukuran: <strong className="text-slate-200">{formatFileSize(format.filesize)}</strong></span>
              {source && <span>Platform: <strong className="text-slate-200 uppercase">{source}</strong></span>}
            </div>
          </div>

          {/* Browser Download Instruction & Hint */}
          <div className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
            <div className="flex items-center gap-2 font-bold text-blue-400">
              <Info className="w-4 h-4 shrink-0" />
              <span>{t.browserTipTitle}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {t.browserTipText}
            </p>
            <div className="pt-1.5 border-t border-blue-500/20 text-[10px] text-blue-300/80 font-mono">
              💡 {t.shortcutTip}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? t.retrying : t.retryBtn}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.doneBtn}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
