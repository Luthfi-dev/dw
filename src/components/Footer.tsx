import React from 'react';
import { DownloadCloud } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: 'single' | 'channel' | 'sites' | 'history') => void;
  language: 'id' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-slate-950/80 backdrop-blur-xl text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-600/30">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight">
                OmniSave<span className="text-blue-500">Pro</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Pengunduh Media Universal • Tanpa Watermark • Kualitas Asli 4K
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-400">
            <button
              onClick={() => onSelectTab('single')}
              className="hover:text-blue-400 transition-colors"
            >
              Download Video
            </button>
            <button
              onClick={() => onSelectTab('channel')}
              className="hover:text-blue-400 transition-colors"
            >
              Batch & Playlist
            </button>
            <button
              onClick={() => onSelectTab('sites')}
              className="hover:text-blue-400 transition-colors"
            >
              Platform Didukung
            </button>
            <button
              onClick={() => onSelectTab('history')}
              className="hover:text-blue-400 transition-colors"
            >
              Riwayat
            </button>
          </div>

          {/* Privacy & Copyright */}
          <div className="text-[11px] text-slate-500 text-center md:text-right">
            <p>© {new Date().getFullYear()} OmniSave Pro.</p>
            <p>Unduhan langsung di latar belakang browser Anda tanpa redirect.</p>
          </div>

        </div>
      </div>
    </footer>
  );
};
