import React from 'react';
import { DownloadCloud, Sparkles, History, Globe2, Layers } from 'lucide-react';
import { ApiHealthStatus } from '../types';

interface HeaderProps {
  activeTab: 'single' | 'channel' | 'sites' | 'history';
  setActiveTab: (tab: 'single' | 'channel' | 'sites' | 'history') => void;
  healthStatus: ApiHealthStatus | null;
  historyCount: number;
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  language,
  setLanguage,
}) => {
  const t = {
    id: {
      single: 'Download Video',
      channel: 'Batch & Playlist',
      sites: 'Platform Didukung',
      history: 'Riwayat',
      tagline: 'Universal Media Downloader',
      statusReady: 'Sistem Siap',
    },
    en: {
      single: 'Video Downloader',
      channel: 'Batch & Playlist',
      sites: 'Supported Platforms',
      history: 'History',
      tagline: 'Universal Media Downloader',
      statusReady: 'Ready',
    },
  }[language];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('single')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <DownloadCloud className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  OmniSave<span className="text-blue-500">Pro</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {t.statusReady}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop Native Style) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-white/[0.08] p-1.5 rounded-2xl shadow-inner shadow-black/40">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'single'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.single}
            </button>

            <button
              onClick={() => setActiveTab('channel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'channel'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t.channel}
            </button>

            <button
              onClick={() => setActiveTab('sites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'sites'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              {t.sites}
            </button>
          </nav>

          {/* Right Tools: History + Language */}
          <div className="flex items-center gap-2.5">
            {/* History Button */}
            <button
              onClick={() => setActiveTab('history')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25'
                  : 'bg-slate-900/90 text-slate-300 border-white/[0.08] hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">{t.history}</span>
              {historyCount > 0 && (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-900/90 border border-white/[0.08] rounded-xl p-1">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all ${
                  language === 'id'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between gap-1 py-2 border-t border-white/[0.06] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.single}
          </button>
          <button
            onClick={() => setActiveTab('channel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'channel'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {t.channel}
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'sites'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            {t.sites}
          </button>
        </div>

      </div>
    </header>
  );
};
