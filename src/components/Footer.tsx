import React from 'react';
import { DownloadCloud, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: 'single' | 'channel' | 'sites' | 'history') => void;
  language: 'id' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-slate-950/80 backdrop-blur-xl text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Attribution */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-600/30">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  OmniSave<span className="text-blue-500">Pro</span>
                </span>
                <span className="text-[11px] text-slate-500">by</span>
                <a
                  href="https://maudigi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  maudigi.com
                </a>
              </div>
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

          {/* Privacy, Copyright & Maudigi.com Credit */}
          <div className="text-[11px] text-slate-500 text-center md:text-right space-y-0.5">
            <p>© {new Date().getFullYear()} OmniSave Pro. All rights reserved.</p>
            <p className="flex items-center justify-center md:justify-end gap-1">
              <span>Developed & Powered by</span>
              <a
                href="https://maudigi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-300 hover:text-blue-400 transition-colors"
              >
                maudigi.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
