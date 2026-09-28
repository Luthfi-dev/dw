import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  Link as LinkIcon,
  Play,
  QrCode,
  Sparkles,
  Clock,
  Eye,
  Heart,
  User,
  AlertCircle,
  Film,
  Music,
  ClipboardPaste,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Zap,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Smartphone,
  Layers,
} from 'lucide-react';
import { MediaFormat, VideoExtractResult } from '../types';
import { extractVideo } from '../services/apiService';
import { normalizeUrl, detectPlatform } from '../utils/urlHelper';
import {
  formatFileSize,
  formatDuration,
  formatCount,
  downloadFileDirectly,
  sanitizeFilename,
} from '../utils/formatters';
import { MediaPreviewModal } from './MediaPreviewModal';
import { QrCodeModal } from './QrCodeModal';
import { DownloadStatusModal } from './DownloadStatusModal';

interface SingleDownloaderProps {
  onAddHistory: (item: {
    title: string;
    source: string;
    thumbnail?: string;
    originalUrl: string;
    downloadUrl: string;
    formatLabel: string;
    ext: string;
  }) => void;
  onSwitchToChannel?: (url: string) => void;
  language: 'id' | 'en';
}

const SAMPLE_URLS = [
  {
    name: 'YouTube 4K',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    badge: 'YouTube',
    dotColor: 'bg-red-500',
  },
  {
    name: 'TikTok No Watermark',
    url: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
    badge: 'TikTok',
    dotColor: 'bg-pink-500',
  },
  {
    name: 'Instagram Reel',
    url: 'https://www.instagram.com/reel/C-eX07_S1eC/',
    badge: 'Instagram',
    dotColor: 'bg-purple-500',
  },
  {
    name: 'Twitter / X Video',
    url: 'https://x.com/NASA/status/1781014166827081774',
    badge: 'Twitter',
    dotColor: 'bg-slate-400',
  },
];

const FAQS = [
  {
    q: 'Bagaimana cara download video dari YouTube, TikTok, atau Instagram?',
    a: 'Cukup salin tautan (URL) video yang ingin Anda unduh dari aplikasi atau browser, tempelkan ke kotak input OmniSave Pro di atas, lalu klik "Proses Video". Pilih resolusi yang diinginkan dan klik "Unduh".',
  },
  {
    q: 'Apakah video TikTok & Douyin yang diunduh bebas watermark?',
    a: 'Ya, sistem kami secara otomatis memproses dan menghapus watermark bawaan video TikTok dan Douyin agar Anda mendapatkan file video original yang bersih dan jernih.',
  },
  {
    q: 'Apakah saya bisa mengunduh hanya suara/lagu (MP3) saja?',
    a: 'Tentu saja! OmniSave Pro menyediakan opsi filter "Audio MP3" terpisah untuk setiap video musik atau podcast sehingga Anda dapat mengunduh format audio murni berkualitas tinggi.',
  },
  {
    q: 'Apakah layanan OmniSave Pro berbayar atau memerlukan akun?',
    a: 'OmniSave Pro 100% gratis, tanpa biaya langganan, tanpa batasan jumlah file, dan dapat langsung digunakan tanpa perlu login atau registrasi akun.',
  },
  {
    q: 'Mengapa unduhan tidak langsung muncul di galeri ponsel saya?',
    a: 'Di beberapa perangkat smartphone (iOS/Android), unduhan akan tersimpan di folder "Downloads" atau "Files". Anda dapat memindahkan video ke galeri atau menggunakan fitur Scan QR Code untuk mengunduh langsung.',
  },
];

export const SingleDownloader: React.FC<SingleDownloaderProps> = ({
  onAddHistory,
  onSwitchToChannel,
  language,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VideoExtractResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'audio' | 'hd'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Modals state
  const [previewFormat, setPreviewFormat] = useState<MediaFormat | null>(null);
  const [qrFormat, setQrFormat] = useState<MediaFormat | null>(null);
  const [statusModalFormat, setStatusModalFormat] = useState<MediaFormat | null>(null);

  const t = {
    id: {
      headline: 'Unduh Video & Audio Universal',
      headlineSub: 'Resolusi 4K & Bebas Watermark',
      desc: 'Solusi tercepat dan terbersih untuk mengunduh video dan audio dari YouTube, TikTok, Instagram, Facebook, X, Bilibili, Douyin, dan 1.600+ platform web.',
      placeholder: 'Tempel link video di sini (YouTube, TikTok, IG, FB, dll)...',
      extractBtn: 'Proses Video',
      extracting: 'Memproses Data...',
      pasteBtn: 'Tempel',
      clearBtn: 'Hapus',
      samplesTitle: 'Coba Contoh Link:',
      filterAll: 'Semua Format',
      filterVideo: 'Video MP4',
      filterAudio: 'Audio MP3',
      filterHD: 'Kualitas 1080p / 4K',
      formatsFound: 'Pilihan Format Siap Unduh',
      downloadNow: 'Unduh',
      preview: 'Pratinjau',
      qrCode: 'QR HP',
      noFormats: 'Tidak ada format yang sesuai dengan filter.',
      channelDetected: 'Tautan ini adalah Channel atau Playlist. Ingin mengunduh seluruh video secara batch?',
      switchToChannelBtn: 'Buka Batch Downloader',
      samePageNotice: 'Unduhan diproses langsung di browser Anda secara instan tanpa redirect.',
      faqTitle: 'Pertanyaan yang Sering Diajukan (FAQ)',
      faqSubtitle: 'Panduan lengkap seputar cara kerja pengunduhan video dan audio di OmniSave Pro.',
    },
    en: {
      headline: 'Universal Video & Audio Downloader',
      headlineSub: '4K Ultra & No Watermark',
      desc: 'The fastest and cleanest way to download media from YouTube, TikTok, Instagram, Facebook, X, Bilibili, Douyin, and 1,600+ web platforms.',
      placeholder: 'Paste video link here (YouTube, TikTok, IG, FB, etc)...',
      extractBtn: 'Process Video',
      extracting: 'Processing...',
      pasteBtn: 'Paste',
      clearBtn: 'Clear',
      samplesTitle: 'Quick Samples:',
      filterAll: 'All Formats',
      filterVideo: 'Video MP4',
      filterAudio: 'Audio MP3',
      filterHD: '1080p / 4K HD',
      formatsFound: 'Available Download Formats',
      downloadNow: 'Download',
      preview: 'Preview',
      qrCode: 'Mobile QR',
      noFormats: 'No formats match the selected filter.',
      channelDetected: 'This link is a Channel or Playlist. Would you like to batch download?',
      switchToChannelBtn: 'Open Batch Downloader',
      samePageNotice: 'Downloads run directly in your browser without any page redirects.',
      faqTitle: 'Frequently Asked Questions (FAQ)',
      faqSubtitle: 'Everything you need to know about downloading videos and audios on OmniSave Pro.',
    },
  }[language];

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text.trim());
      }
    } catch {}
  };

  const handleExtract = async (urlToFetch?: string) => {
    const target = normalizeUrl(urlToFetch || inputUrl);
    if (!target) {
      setError('Silakan masukkan URL video yang valid.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await extractVideo(target);

      if (data.isChannel && onSwitchToChannel) {
        setResult(data);
        return;
      }

      if (!data.formats || data.formats.length === 0) {
        throw new Error(data.error || 'Tidak dapat menemukan format unduhan untuk video ini.');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Extract error:', err);
      setError(
        err.message ||
          'Gagal mengekstrak video. Pastikan tautan dapat diakses secara publik dan bukan akun private.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateDownload = (format: MediaFormat) => {
    const safeTitle = sanitizeFilename(result?.title || 'video', format.ext);

    // Save to local history
    if (result) {
      onAddHistory({
        title: result.title || 'Video Media',
        source: result.source || detectPlatform(inputUrl).name,
        thumbnail: result.thumbnail,
        originalUrl: inputUrl,
        downloadUrl: format.url,
        formatLabel: format.label,
        ext: format.ext,
      });
    }

    // Trigger in-page stream download directly on same page
    downloadFileDirectly(format.url, safeTitle);

    // Open Download Status Pop-up Modal as requested by user
    setStatusModalFormat(format);

    // Fire confetti celebration
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.8 },
      colors: ['#3b82f6', '#10b981', '#6366f1', '#ec4899', '#f59e0b'],
    });
  };

  // Filter formats
  const filteredFormats = (result?.formats || []).filter((fmt) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'video') return fmt.type !== 'audio';
    if (activeFilter === 'audio') return fmt.type === 'audio' || ['mp3', 'm4a', 'aac', 'opus'].includes(fmt.ext.toLowerCase());
    if (activeFilter === 'hd') {
      if (fmt.type === 'audio') return false;
      const height = parseInt(fmt.label, 10) || 0;
      return height >= 1080 || fmt.label.toLowerCase().includes('1080') || fmt.label.toLowerCase().includes('2160') || fmt.label.toLowerCase().includes('4k');
    }
    return true;
  });

  const detectedInfo = detectPlatform(inputUrl);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-4 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Pengunduh Video & Audio Kualitas Asli</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
          {t.headline}{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            {t.headlineSub}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {t.desc}
        </p>
      </div>

      {/* Main Input Component (Native Responsive Look) */}
      <div className="relative bg-slate-900/90 border border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/60 backdrop-blur-2xl mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExtract();
          }}
          className="space-y-4"
        >
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <LinkIcon className="w-5 h-5" />
              </div>
              
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder={t.placeholder}
                disabled={isLoading}
                className="w-full pl-11 pr-24 py-4 rounded-2xl bg-slate-950/90 border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 text-sm sm:text-base font-medium transition-all shadow-inner"
              />

              {/* Inside Input Action Buttons */}
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
                {inputUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputUrl('');
                      setResult(null);
                      setError(null);
                    }}
                    title={t.clearBtn}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  title={t.pasteBtn}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">{t.pasteBtn}</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="py-4 px-8 rounded-2xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{t.extracting}</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{t.extractBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Platform Detection Pill & Notice */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              {inputUrl.trim() && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${detectedInfo.badgeBg}`}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: detectedInfo.accentColor }}></span>
                  Platform: {detectedInfo.name}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {t.samePageNotice}
            </span>
          </div>
        </form>

        {/* Quick Sample Links */}
        <div className="mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {t.samplesTitle}
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_URLS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputUrl(sample.url);
                    handleExtract(sample.url);
                  }}
                  className="text-xs px-3 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/[0.08] text-slate-300 font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <span className={`w-2 h-2 rounded-full ${sample.dotColor}`}></span>
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 sm:p-5 text-rose-300 text-sm flex items-start gap-3 mb-8 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-200 mb-1">Gagal Mengambil Video</h4>
            <p className="text-xs sm:text-sm text-rose-300/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Channel Prompt if recognized */}
      {result?.isChannel && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-3xl p-5 mb-8 text-slate-200 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">
                  {t.channelDetected}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Beralih ke tab batch untuk mengunduh seluruh playlist atau video profil kreator sekaligus.
                </p>
              </div>
            </div>
            <button
              onClick={() => onSwitchToChannel && onSwitchToChannel(inputUrl)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              {t.switchToChannelBtn}
            </button>
          </div>
        </div>
      )}

      {/* Result Card & Formats */}
      {result && result.formats && result.formats.length > 0 && (
        <div className="space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Video Metadata Card */}
          <div className="bg-slate-900/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start gap-6">
            
            {/* Thumbnail */}
            <div className="relative w-full md:w-80 aspect-video md:h-48 rounded-2xl overflow-hidden bg-slate-950 border border-white/[0.08] shrink-0 group shadow-lg">
              {result.thumbnail ? (
                <img
                  src={result.thumbnail}
                  alt={result.title || 'Video thumbnail'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Film className="w-12 h-12" />
                </div>
              )}

              {/* Source Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-md">
                  {result.source || detectedInfo.name}
                </span>
              </div>

              {/* Duration Badge */}
              {result.duration && result.duration > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold flex items-center gap-1 border border-white/20 shadow-md">
                  <Clock className="w-3 h-3" />
                  {formatDuration(result.duration)}
                </div>
              )}

              {/* Instant Preview Overlay Button on Thumbnail */}
              {result.formats[0] && (
                <button
                  onClick={() => setPreviewFormat(result.formats![0])}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/50 transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </button>
              )}
            </div>

            {/* Video Details */}
            <div className="flex-1 min-w-0 space-y-3">
              <h2 className="text-base sm:text-xl font-extrabold text-white leading-snug line-clamp-2">
                {result.title || 'Media Video'}
              </h2>

              {result.author && (
                <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
                  <User className="w-3.5 h-3.5" />
                  <span>@{result.author}</span>
                </div>
              )}

              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-300">
                {result.views != null && (
                  <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/[0.06]">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold">{formatCount(result.views)} penonton</span>
                  </div>
                )}
                {result.likes != null && (
                  <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/[0.06]">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-semibold">{formatCount(result.likes)} suka</span>
                  </div>
                )}
                {result.duration != null && result.duration > 0 && (
                  <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/[0.06]">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold">Durasi {formatDuration(result.duration)}</span>
                  </div>
                )}
              </div>

              {/* Quick Preview Action */}
              <div className="pt-2">
                {result.formats[0] && (
                  <button
                    onClick={() => setPreviewFormat(result.formats![0])}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                    {t.preview}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Formats Section */}
          <div className="bg-slate-900/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-blue-400" />
                  {t.formatsFound}
                  <span className="text-xs font-bold text-slate-400 px-2 py-0.5 bg-slate-950 rounded-md border border-white/[0.06]">
                    {filteredFormats.length}
                  </span>
                </h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950/90 border border-white/[0.08] p-1.5 rounded-2xl overflow-x-auto">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.filterAll}
                </button>
                <button
                  onClick={() => setActiveFilter('video')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === 'video'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.filterVideo}
                </button>
                <button
                  onClick={() => setActiveFilter('audio')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === 'audio'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.filterAudio}
                </button>
                <button
                  onClick={() => setActiveFilter('hd')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === 'hd'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.filterHD}
                </button>
              </div>
            </div>

            {/* Formats Grid with Non-Overlapping Action Buttons */}
            {filteredFormats.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs sm:text-sm">
                {t.noFormats}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredFormats.map((fmt, idx) => {
                  const isAudio = fmt.type === 'audio' || ['mp3', 'm4a', 'aac', 'opus'].includes(fmt.ext.toLowerCase());
                  const is4K = fmt.label.toLowerCase().includes('2160') || fmt.label.toLowerCase().includes('4k');
                  const is1080 = fmt.label.toLowerCase().includes('1080');

                  return (
                    <div
                      key={idx}
                      className="bg-slate-950/70 hover:bg-slate-950 border border-white/[0.06] hover:border-white/[0.15] rounded-2xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-md"
                    >
                      {/* Format Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                            isAudio
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : is4K
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : is1080
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-slate-800 text-slate-300 border border-white/[0.08]'
                          }`}
                        >
                          {isAudio ? <Music className="w-5 h-5" /> : <Film className="w-5 h-5" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-sm text-white">
                              {fmt.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-slate-800 text-slate-300 uppercase border border-white/[0.06]">
                              .{fmt.ext}
                            </span>
                            {is4K && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                4K ULTRA
                              </span>
                            )}
                            {is1080 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                FHD 1080p
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatFileSize(fmt.filesize)}
                          </p>
                        </div>
                      </div>

                      {/* Clean & Spacious Non-Overlapping Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                        {/* Play Preview Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewFormat(fmt)}
                          title={t.preview}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-white/[0.08] hover:border-blue-500/40 text-slate-300 hover:text-blue-400 hover:bg-slate-800 transition-all flex items-center justify-center shrink-0"
                        >
                          <Play className="w-4 h-4" />
                        </button>

                        {/* Mobile QR Code Button */}
                        <button
                          type="button"
                          onClick={() => setQrFormat(fmt)}
                          title={t.qrCode}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-white/[0.08] hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-all flex items-center justify-center shrink-0"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Direct Download Button */}
                        <button
                          type="button"
                          onClick={() => handleInitiateDownload(fmt)}
                          className="py-2.5 px-4 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t.downloadNow}</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SEO Rich FAQ Accordion Section */}
      <div className="mt-14 bg-slate-900/80 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pusat Bantuan & FAQ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t.faqTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.faqSubtitle}
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((faq, fIdx) => {
            const isOpen = openFaqIndex === fIdx;
            return (
              <div
                key={fIdx}
                className="border border-white/[0.06] rounded-2xl bg-slate-950/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-blue-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <MediaPreviewModal
        isOpen={!!previewFormat}
        onClose={() => setPreviewFormat(null)}
        format={previewFormat}
        videoTitle={result?.title}
        thumbnail={result?.thumbnail}
        language={language}
        onDownload={() => {
          if (previewFormat && result) {
            handleInitiateDownload(previewFormat);
          }
        }}
      />

      <QrCodeModal
        isOpen={!!qrFormat}
        onClose={() => setQrFormat(null)}
        format={qrFormat}
        videoTitle={result?.title}
        language={language}
      />

      {/* Download Status Notification Modal */}
      <DownloadStatusModal
        isOpen={!!statusModalFormat}
        onClose={() => setStatusModalFormat(null)}
        format={statusModalFormat}
        videoTitle={result?.title}
        source={result?.source || detectedInfo.name}
        language={language}
      />

    </div>
  );
};
