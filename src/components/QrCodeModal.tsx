import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import { MediaFormat } from '../types';
import { formatFileSize } from '../utils/formatters';

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && format?.url) {
      QRCode.toDataURL(format.url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed generating QR code:', err));
    }
  }, [isOpen, format]);

  if (!isOpen || !format) return null;

  const t = {
    id: {
      title: 'Scan QR untuk Download di HP',
      subtitle: 'Buka kamera HP atau aplikasi scanner Anda untuk mengunduh langsung ke galeri.',
      copyLink: 'Salin Tautan Download',
      copied: 'Tautan Tersalin!',
      instructions: '1. Arahkan kamera smartphone ke kode QR di atas.\n2. Klik pop-up tautan unduhan yang muncul.\n3. File akan langsung tersimpan di folder download / galeri Anda.',
    },
    en: {
      title: 'Scan QR to Download on Mobile',
      subtitle: 'Open your smartphone camera or scanner app to download directly to your gallery.',
      copyLink: 'Copy Download Link',
      copied: 'Link Copied!',
      instructions: '1. Point your smartphone camera at the QR code above.\n2. Tap the download notification link that appears.\n3. The media will be downloaded directly to your phone storage.',
    },
  }[language];

  const handleCopy = () => {
    if (format?.url) {
      navigator.clipboard.writeText(format.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {t.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <p className="text-xs text-slate-400 mb-4">
            {t.subtitle}
          </p>

          <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-slate-700/50 mb-4 flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Download QR Code" className="w-52 h-52 object-contain" />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                <QrIcon className="w-12 h-12 animate-spin text-blue-500" />
              </div>
            )}
          </div>

          <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-4 text-left">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
              <span className="truncate pr-2">{videoTitle || 'Media File'}</span>
              <span className="shrink-0 text-blue-400 font-bold">{format.label} ({format.ext.toUpperCase()})</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Ukuran: {formatFileSize(format.filesize)}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center justify-center gap-2 transition-all mb-4"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>{t.copyLink}</span>
              </>
            )}
          </button>

          <div className="w-full text-left bg-blue-950/20 border border-blue-900/30 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-blue-400 flex items-center gap-1 mb-1">
              <Smartphone className="w-3 h-3" />
              Cara Penggunaan:
            </div>
            <p>1. Buka aplikasi kamera atau QR Scanner di HP Anda.</p>
            <p>2. Arahkan ke layar untuk memindai QR code di atas.</p>
            <p>3. Sentuh tautan unduh untuk menyimpan file ke smartphone.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
