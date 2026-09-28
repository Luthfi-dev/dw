import React from 'react';
import { X, Download, Music, Film, CheckCircle2 } from 'lucide-react';
import { MediaFormat } from '../types';
import { formatFileSize, downloadFileDirectly, sanitizeFilename } from '../utils/formatters';

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: MediaFormat | null;
  videoTitle?: string;
  thumbnail?: string;
  onDownload: () => void;
  language: 'id' | 'en';
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  isOpen,
  onClose,
  format,
  videoTitle,
  thumbnail,
  onDownload,
  language,
}) => {
  if (!isOpen || !format) return null;

  const isAudio = format.type === 'audio' || ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'opus'].includes(format.ext.toLowerCase());

  const t = {
    id: {
      previewTitle: 'Pratinjau Media',
      downloadNow: 'Unduh Langsung',
      samePageTip: 'Unduhan diproses langsung di latar belakang halaman ini tanpa membuka tab baru.',
      audioNotice: 'Sedang memutar audio stream kualitas tinggi',
    },
    en: {
      previewTitle: 'Media Preview',
      downloadNow: 'Download Directly',
      samePageTip: 'Downloads run silently in the background on this same page.',
      audioNotice: 'Playing high quality audio stream',
    },
  }[language];

  const handleModalDownload = () => {
    onDownload();
    const safeTitle = sanitizeFilename(videoTitle || 'media', format.ext);
    downloadFileDirectly(format.url, safeTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-950/60">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              {isAudio ? <Music className="w-5 h-5" /> : <Film className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-white truncate">
                {videoTitle || t.previewTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {format.label} • {format.ext.toUpperCase()} • {formatFileSize(format.filesize)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Player Area */}
        <div className="p-4 sm:p-6 bg-black flex flex-col items-center justify-center min-h-[260px] max-h-[460px] overflow-hidden">
          {isAudio ? (
            <div className="w-full flex flex-col items-center py-6 px-4">
              {thumbnail && (
                <div className="w-32 h-32 rounded-2xl overflow-hidden mb-6 shadow-2xl border border-white/[0.1] relative">
                  <img src={thumbnail} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Music className="w-10 h-10 text-white/90 animate-pulse" />
                  </div>
                </div>
              )}
              <audio
                controls
                autoPlay
                className="w-full max-w-md accent-blue-500"
                src={format.url}
              >
                Browser Anda tidak mendukung elemen audio.
              </audio>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-blue-400" />
                {t.audioNotice}
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <video
                controls
                autoPlay
                playsInline
                poster={thumbnail}
                className="w-full max-h-[380px] rounded-xl object-contain bg-slate-950"
                src={format.url}
              >
                Browser Anda tidak mendukung elemen video.
              </video>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-slate-400">{t.samePageTip}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleModalDownload}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              {t.downloadNow}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
