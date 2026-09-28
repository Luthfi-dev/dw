import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Copy, Check, QrCode as QrIcon, ShieldCheck, Download, Lock } from 'lucide-react';
import { MediaFormat } from '../types';
import { formatFileSize, downloadFileDirectly, sanitizeFilename } from '../utils/formatters';
import { encodeQrToken } from '../utils/tokenCipher';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: MediaFormat | null;
  videoTitle?: string;
  language: 'id' | 'en';
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  format,
  videoTitle,
  language,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [encryptedMobileUrl, setEncryptedMobileUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && format?.url) {
      // Build encrypted token that points to our OWN app domain
      const token = encodeQrToken({
        u: format.url,
        t: videoTitle || 'Video Media',
        l: format.label || 'HD',
        e: format.ext || 'mp4',
        s: format.filesize,
        ts: Date.now(),
      });

      const currentOrigin = window.location.origin;
      const mobileScanUrl = `${currentOrigin}/?d=${token}`;
      setEncryptedMobileUrl(mobileScanUrl);

      // Generate high-resolution QR code pointing to our web app
      QRCode.toDataURL(mobileScanUrl, {
        width: 360,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed generating QR code:', err));
    }
  }, [isOpen, format, videoTitle]);

  if (!isOpen || !format) return null;

  const t = {
    id: {
      title: 'Scan QR untuk Download di HP',
      subtitle: 'Arahkan kamera smartphone Anda ke QR Code di bawah untuk membuka halaman download di HP Anda.',
      copyLink: 'Salin Tautan Khusus HP',
      copied: 'Tautan Khusus Tersalin!',
      directNotice: 'Tautan terenkripsi aman dan langsung mengarah ke server OmniSave Pro tanpa redirect pihak ketiga.',
    },
    en: {
      title: 'Scan QR to Download on Mobile',
      subtitle: 'Point your smartphone camera at the QR Code below to open the download page on your phone.',
      copyLink: 'Copy Mobile Link',
      copied: 'Link Copied!',
      directNotice: 'Encrypted safe link that directs only to OmniSave Pro without third-party exposure.',
    },
  }[language];

  const handleCopy = () => {
    if (encryptedMobileUrl) {
      navigator.clipboard.writeText(encryptedMobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                {t.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                Akses instan di iOS & Android
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

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <p className="text-xs text-slate-300 mb-4 max-w-xs leading-relaxed">
            {t.subtitle}
          </p>

          {/* QR Code Container */}
          <div className="p-3.5 bg-white rounded-3xl shadow-2xl border-4 border-slate-800 mb-4 flex items-center justify-center relative group">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Download QR Code" className="w-52 h-52 object-contain rounded-xl" />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                <QrIcon className="w-12 h-12 animate-spin text-blue-500" />
              </div>
            )}
          </div>

          {/* File summary */}
          <div className="w-full bg-slate-950/80 border border-white/[0.08] rounded-2xl p-3.5 mb-4 text-left">
            <div className="flex items-center justify-between text-xs text-white font-bold mb-1">
              <span className="truncate pr-2">{videoTitle || 'Berkas Media'}</span>
              <span className="shrink-0 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black">
                {format.label} ({format.ext.toUpperCase()})
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Ukuran: <strong className="text-slate-200">{formatFileSize(format.filesize)}</strong>
            </p>
          </div>

          {/* Copy Encrypted Web Link */}
          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] flex items-center justify-center gap-2 transition-all mb-3.5 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-blue-400" />
                <span>{t.copyLink}</span>
              </>
            )}
          </button>

          {/* Security & Instruction Badge */}
          <div className="w-full text-left bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-3.5 text-[11px] text-slate-300 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privasi Terjaga & Bebas Redirect</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {t.directNotice}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
