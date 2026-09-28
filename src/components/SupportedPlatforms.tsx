import React, { useState } from 'react';
import {
  Globe2,
  Search,
  CheckCircle2,
  Smartphone,
  Monitor,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface SupportedPlatformsProps {
  language: 'id' | 'en';
}

interface PlatformEntry {
  name: string;
  category: string;
  badge: string;
  color: string;
  features: string[];
  tutorial: {
    mobile: string;
    desktop: string;
  };
}

const PLATFORMS: PlatformEntry[] = [
  {
    name: 'YouTube',
    category: 'Video & Audio',
    badge: '4K • 1080p • MP3',
    color: 'from-red-600 to-rose-600',
    features: ['Video hingga 4K UHD 60fps', 'Audio MP3 / M4A', 'Shorts & Playlist support'],
    tutorial: {
      mobile: 'Buka video di aplikasi YouTube > Klik Bagikan (Share) > Salin Tautan (Copy Link).',
      desktop: 'Salin URL langsung dari bilah alamat browser atau tombol Bagikan di bawah video.',
    },
  },
  {
    name: 'TikTok',
    category: 'Short Videos',
    badge: 'No Watermark • HD',
    color: 'from-pink-600 to-purple-600',
    features: ['Download video tanpa watermark', 'Audio sound asli MP3', 'Profil kreator batch'],
    tutorial: {
      mobile: 'Buka video TikTok > Klik ikon Bagikan (panah/WhatsApp) > Salin Tautan.',
      desktop: 'Salin URL dari address bar atau klik tombol Salin Tautan di video.',
    },
  },
  {
    name: 'Instagram',
    category: 'Social Media',
    badge: 'Reels • Posts • Stories',
    color: 'from-purple-600 to-pink-500',
    features: ['Instagram Reels HD', 'Postingan Carousel / Single Video', 'Audio MP3'],
    tutorial: {
      mobile: 'Buka Reel / Postingan di Instagram > Klik ikon pesawat kertas / Bagikan > Salin Tautan.',
      desktop: 'Klik tombol titik tiga (...) pada postingan > Salin Tautan.',
    },
  },
  {
    name: 'Twitter / X',
    category: 'Microblogging',
    badge: 'HD Video • GIF',
    color: 'from-slate-700 to-slate-900',
    features: ['Semua pilihan resolusi tweet', 'Konversi video GIF ke MP4', 'Kecepatan kilat'],
    tutorial: {
      mobile: 'Buka Tweet di aplikasi X > Klik tombol Bagikan > Salin Tautan.',
      desktop: 'Klik ikon Share pada tweet > Salin Tautan ke Tweet.',
    },
  },
  {
    name: 'Facebook',
    category: 'Social Media',
    badge: 'Reels • Watch • HD',
    color: 'from-blue-600 to-indigo-600',
    features: ['Facebook Reels & Facebook Watch', 'Kualitas HD & SD', 'Audio MP3'],
    tutorial: {
      mobile: 'Buka video di FB > Tekan Bagikan > Opsi Lainnya > Salin Tautan.',
      desktop: 'Klik titik tiga pada video > Salin Tautan.',
    },
  },
  {
    name: 'Douyin (抖音)',
    category: 'Short Videos',
    badge: 'No Watermark HD',
    color: 'from-pink-600 to-rose-700',
    features: ['Video Douyin tanpa tanda air', 'Audio MP3', 'Mendukung format link share teks'],
    tutorial: {
      mobile: 'Buka aplikasi Douyin > Tekan Bagikan > Salin Tautan (复制链接).',
      desktop: 'Salin URL langsung dari bilah browser.',
    },
  },
  {
    name: 'Bilibili',
    category: 'Anime & Gaming',
    badge: '1080p FHD • Audio',
    color: 'from-sky-500 to-blue-600',
    features: ['Video Bilibili / B23 HD', 'Pemisahan Audio & Video murni', 'Bangumi & User Videos'],
    tutorial: {
      mobile: 'Buka Bilibili app > Klik Share > Salin Tautan.',
      desktop: 'Salin URL dari browser address bar.',
    },
  },
  {
    name: 'Threads',
    category: 'Social Media',
    badge: 'HD Video',
    color: 'from-emerald-600 to-teal-600',
    features: ['Download video dari postingan Threads Meta', 'Ekstraksi cepat'],
    tutorial: {
      mobile: 'Buka postingan Threads > Klik ikon Bagikan > Salin Tautan.',
      desktop: 'Klik menu titik tiga > Salin Tautan.',
    },
  },
  {
    name: 'Reddit',
    category: 'Community',
    badge: 'Video with Audio',
    color: 'from-orange-600 to-red-600',
    features: ['Otomatis menggabungkan video dan audio Reddit v.redd.it', 'Resolusi HD'],
    tutorial: {
      mobile: 'Tekan Bagikan pada postingan Reddit > Salin Tautan.',
      desktop: 'Klik Share > Copy Link di postingan Reddit.',
    },
  },
  {
    name: 'Pinterest',
    category: 'Creative Ideas',
    badge: 'Pin Video HD',
    color: 'from-rose-600 to-red-700',
    features: ['Download ide video pin', 'Format MP4 jernih'],
    tutorial: {
      mobile: 'Buka Pin > Klik titik tiga atau tombol Bagikan > Salin Tautan.',
      desktop: 'Salin URL pin dari browser.',
    },
  },
  {
    name: 'SoundCloud',
    category: 'Music & Audio',
    badge: 'HQ MP3 Audio',
    color: 'from-amber-600 to-orange-600',
    features: ['Download lagu & track audio SoundCloud kualitas tinggi', 'Lengkap dengan metadata'],
    tutorial: {
      mobile: 'Buka lagu di SoundCloud > Tekan Share > Copy Link.',
      desktop: 'Salin URL lagu dari address bar browser.',
    },
  },
  {
    name: 'Vimeo',
    category: 'Creative Video',
    badge: 'Original 4K • 1080p',
    color: 'from-cyan-600 to-blue-600',
    features: ['Download video sinematik Vimeo', 'Berbagai bitrate tinggi'],
    tutorial: {
      mobile: 'Klik Bagikan pada video Vimeo > Salin Tautan.',
      desktop: 'Salin URL video langsung dari browser.',
    },
  },
];

export const SupportedPlatforms: React.FC<SupportedPlatformsProps> = () => {
  const [search, setSearch] = useState('');
  const [activeGuideIndex, setActiveGuideIndex] = useState<number | null>(0);

  const filtered = PLATFORMS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.features.some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-4">
          <Globe2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Mendukung 1.600+ Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          Platform yang Didukung
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          OmniSave Pro dirancang dengan mesin ekstraksi universal yang mampu mengenali dan mengunduh konten dari ribuan website video dan audio terpopuler di dunia.
        </p>

        {/* Search Input */}
        <div className="mt-8 max-w-md mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari platform (YouTube, TikTok, Instagram, Bilibili...)"
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs sm:text-sm shadow-xl font-medium"
          />
        </div>
      </div>

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 border border-white/[0.08] rounded-3xl p-5 shadow-xl hover:border-white/[0.15] transition-all flex flex-col justify-between backdrop-blur-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white font-extrabold text-sm shadow-md`}
                  >
                    {item.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{item.name}</h3>
                    <p className="text-[11px] text-slate-500">{item.category}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/[0.08]">
                  {item.badge}
                </span>
              </div>

              <ul className="space-y-1.5 my-3">
                {item.features.map((feat, fIdx) => (
                  <li key={fIdx} className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to copy guide toggle */}
            <div className="pt-3 border-t border-white/[0.06]">
              <button
                onClick={() =>
                  setActiveGuideIndex(activeGuideIndex === idx ? null : idx)
                }
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-between w-full transition-colors"
              >
                <span>Cara Ambil Link {item.name}</span>
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {activeGuideIndex === idx && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-white/[0.08] text-[11px] space-y-2 text-slate-300 animate-in fade-in">
                  <div className="flex items-start gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">HP:</strong> {item.tutorial.mobile}
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">PC:</strong> {item.tutorial.desktop}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 1600+ Sites Banner */}
      <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-blue-800/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
        <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg sm:text-xl font-extrabold text-white mb-2">
          Dan 1.600+ Portal Web Lainnya
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Termasuk Twitch, Dailymotion, Kuaishou, Bandcamp, Likee, Mixcloud, Streamable, Imgur, Weibo, VK, Ted Talks, dan ribuan portal web video lainnya.
        </p>
      </div>

    </div>
  );
};
