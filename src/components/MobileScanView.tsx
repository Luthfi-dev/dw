import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Film,
  Music,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Check,
  Play,
} from 'lucide-react';
import { QrPayload } from '../utils/tokenCipher';
import { formatFileSize, downloadFileDirectly, sanitizeFilename } from '../utils/formatters';

interface MobileScanViewProps {
  payload: QrPayload;
  onResetToMain: () => void;
  language: 'id' | 'en';
}

export const MobileScanView: React.FC<MobileScanViewProps> = ({
  payload,
  onResetToMain,
  language,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const isAudio = payload.e === 'mp3' || payload.e === 'm4a' || payload.e === 'aac';

  const t = {
    id: {
      tag: 'Tautan QR Ponsel Terverifikasi',
      headline: 'Unduh Media ke Smartphone Anda',
      desc: 'Berkas siap diunduh langsung ke memori internal / galeri smartphone Anda secara aman dan tanpa redirect.',
      downloadBtn: 'Download Sekarang ke HP',
      downloading: 'Mengunduh Media...',
      downloaded: 'Unduhan Berhasil Dikirim!',
      tipTitle: 'Cek Menu Download Browser HP Anda',
      tipDesc: 'Setelah klik tombol di atas, periksa notifikasi bar atas atau menu unduhan browser Anda.',
      openFullApp: 'Buka Menu Downloader Utama',
    },
    en: {
      tag: 'Verified Mobile QR Link',
      headline: 'Download Media to Your Smartphone',
      desc: 'File is ready to be saved directly to your phone storage without redirection.',
      downloadBtn: 'Download to Phone Now',
      downloading: 'Downloading...',
      downloaded: 'Download Triggered!',
      tipTitle: 'Check Your Mobile Browser Downloads',
      tipDesc: 'After tapping the button above, check your notification bar or downloads menu.',
      openFullApp: 'Open Full Downloader App',
    },
  }[language];

  const handleDownload = async () => {
    setIsDownloading(true);
    const safeTitle = sanitizeFilename(payload.t || 'video', payload.e || 'mp4');

    await downloadFileDirectly(payload.u, safeTitle);

    setDownloaded(true);
    setIsDownloading(false);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 sm:py-16">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t.tag}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {t.headline}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {t.desc}
        </p>
      </div>

      {/* Main Download Card */}
      <div className="bg-slate-900/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl mb-6 space-y-5">
        
        {/* File Details */}
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isAudio
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}
          >
            {isAudio ? <Music className="w-7 h-7" /> : <Film className="w-7 h-7" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {payload.l}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-slate-800 text-slate-300 uppercase">
                .{payload.e}
              </span>
            </div>
            <h2 className="text-sm font-extrabold text-white leading-snug line-clamp-3">
              {payload.t}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ukuran berkas: <strong className="text-slate-200">{formatFileSize(payload.s)}</strong>
            </p>
          </div>
        </div>

        {/* Big Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl ${
            downloaded
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white shadow-blue-600/30'
          }`}
        >
          {isDownloading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{t.downloading}</span>
            </>
          ) : downloaded ? (
            <>
              <Check className="w-5 h-5" />
              <span>{t.downloaded}</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>{t.downloadBtn}</span>
            </>
          )}
        </button>

        {/* Browser Notice Box */}
        <div className="bg-slate-950/80 border border-white/[0.06] rounded-2xl p-4 text-xs space-y-1 text-slate-300">
          <div className="font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t.tipTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t.tipDesc}
          </p>
        </div>

      </div>

      {/* Back to Full Web App Button */}
      <div className="text-center">
        <button
          onClick={onResetToMain}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-900 border border-white/[0.08] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.openFullApp}</span>
        </button>
      </div>

    </div>
  );
};
