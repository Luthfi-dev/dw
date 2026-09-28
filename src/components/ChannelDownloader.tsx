import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Layers,
  Archive,
  Download,
  Link as LinkIcon,
  RefreshCw,
  AlertCircle,
  Film,
  CheckCircle2,
  CheckSquare,
  Square,
  Check,
} from 'lucide-react';
import { ChannelItem, ChannelResult } from '../types';
import { extractChannel, generateZip, extractVideo } from '../services/apiService';
import { normalizeUrl } from '../utils/urlHelper';
import { downloadFileDirectly, sanitizeFilename } from '../utils/formatters';

interface ChannelDownloaderProps {
  initialUrl?: string;
  onAddHistory: (item: {
    title: string;
    source: string;
    thumbnail?: string;
    originalUrl: string;
    downloadUrl: string;
    formatLabel: string;
    ext: string;
  }) => void;
  language: 'id' | 'en';
}

export const ChannelDownloader: React.FC<ChannelDownloaderProps> = ({
  initialUrl = '',
  onAddHistory,
  language,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [limit, setLimit] = useState(30);
  const [quality, setQuality] = useState('best');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [downloadingItemIndex, setDownloadingItemIndex] = useState<number | null>(null);
  const [result, setResult] = useState<ChannelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  const t = {
    id: {
      headline: 'Batch & Playlist Downloader',
      desc: 'Ekstrak dan simpan video dari YouTube channel, playlist, atau akun kreator TikTok dalam jumlah banyak sekaligus tanpa membuka tab baru.',
      urlPlaceholder: 'Masukkan link channel atau playlist (YouTube, TikTok, dll)...',
      limitLabel: 'Jumlah Video:',
      qualityLabel: 'Kualitas Batch ZIP:',
      filterLabel: 'Tipe Konten:',
      extractBtn: 'Ekstrak Daftar Video',
      extracting: 'Menganalisis Channel...',
      downloadAllZip: 'Download Semua (.ZIP Langsung)',
      downloadSelectedZip: 'Download Pilihan (.ZIP)',
      downloadingZip: 'Membuat Berkas ZIP...',
      selectAll: 'Pilih Semua',
      deselectAll: 'Batal Pilih',
      downloadSingle: 'Unduh',
      qualityBest: 'Kualitas Terbaik',
      quality1080: '1080p FHD',
      quality720: '720p HD',
      quality480: '480p SD',
      qualityAudio: 'Audio MP3',
      filterAll: 'Semua Video',
      filterShorts: 'Shorts / Reels',
      filterLong: 'Video Panjang',
      zipInfo: 'Semua video akan dibundel dan diunduh langsung ke folder download perangkat Anda secara streaming.',
    },
    en: {
      headline: 'Batch & Playlist Downloader',
      desc: 'Extract and save videos from YouTube channels, playlists, or TikTok accounts in bulk directly on the same page.',
      urlPlaceholder: 'Enter channel or playlist URL (YouTube, TikTok, etc)...',
      limitLabel: 'Video Count:',
      qualityLabel: 'ZIP Quality:',
      filterLabel: 'Content Type:',
      extractBtn: 'Extract Video List',
      extracting: 'Analyzing Channel...',
      downloadAllZip: 'Download All (.ZIP Direct)',
      downloadSelectedZip: 'Download Selected (.ZIP)',
      downloadingZip: 'Bundling ZIP...',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      downloadSingle: 'Download',
      qualityBest: 'Best Quality',
      quality1080: '1080p FHD',
      quality720: '720p HD',
      quality480: '480p SD',
      qualityAudio: 'Audio MP3',
      filterAll: 'All Videos',
      filterShorts: 'Shorts / Reels',
      filterLong: 'Long Videos',
      zipInfo: 'Videos are bundled into a single ZIP archive and downloaded directly to your device without redirection.',
    },
  }[language];

  const handleExtractChannel = async () => {
    const clean = normalizeUrl(url);
    if (!clean) {
      setError('Silakan masukkan link channel atau playlist yang valid.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedUrls(new Set());

    try {
      const data = await extractChannel(clean, limit, filter);
      if (!data.items || data.items.length === 0) {
        throw new Error(data.error || 'Tidak ada video yang ditemukan pada channel/playlist ini.');
      }
      setResult(data);
      const allUrls = new Set(data.items.map((i) => i.url));
      setSelectedUrls(allUrls);
    } catch (err: any) {
      console.error('Channel extract error:', err);
      setError(
        err.message ||
          'Gagal mengekstrak channel. Pastikan URL benar dan profil dapat diakses publik.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (!result?.items) return;
    if (selectedUrls.size === result.items.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(result.items.map((i) => i.url)));
    }
  };

  const toggleItem = (itemUrl: string) => {
    const next = new Set(selectedUrls);
    if (next.has(itemUrl)) {
      next.delete(itemUrl);
    } else {
      next.add(itemUrl);
    }
    setSelectedUrls(next);
  };

  const handleDownloadZip = async (urlsToZip: string[]) => {
    if (urlsToZip.length === 0) return;

    setIsZipping(true);
    try {
      const zipRes = await generateZip(urlsToZip, quality);
      if (zipRes.url) {
        const safeZipName = `batch_${result?.source || 'videos'}_${quality}.zip`;
        await downloadFileDirectly(zipRes.url, safeZipName);
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.7 },
        });
      } else {
        throw new Error(zipRes.error || 'Server tidak mengembalikan URL arsip.');
      }
    } catch (err: any) {
      console.error('Zip generation error:', err);
      alert(`Gagal membuat ZIP: ${err.message}`);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingleItem = async (item: ChannelItem, idx: number) => {
    setDownloadingItemIndex(idx);
    try {
      const extracted = await extractVideo(item.url);
      if (extracted.formats && extracted.formats.length > 0) {
        let chosen = extracted.formats[0];
        if (quality === 'audio') {
          const audioFmt = extracted.formats.find((f) => f.type === 'audio');
          if (audioFmt) chosen = audioFmt;
        } else if (quality !== 'best') {
          const targetH = parseInt(quality, 10);
          const matched = extracted.formats.find((f) => f.label.includes(String(targetH)));
          if (matched) chosen = matched;
        }

        const safeFilename = sanitizeFilename(item.title || extracted.title || 'video', chosen.ext);

        onAddHistory({
          title: item.title || extracted.title || 'Channel Item',
          source: result?.source || 'channel',
          thumbnail: item.thumbnail,
          originalUrl: item.url,
          downloadUrl: chosen.url,
          formatLabel: chosen.label,
          ext: chosen.ext,
        });

        await downloadFileDirectly(chosen.url, safeFilename);
      } else {
        throw new Error('Format video tidak ditemukan.');
      }
    } catch (err: any) {
      alert(`Gagal mengunduh item: ${err.message}`);
    } finally {
      setDownloadingItemIndex(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Batch & Channel Downloader</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          {t.headline}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {t.desc}
        </p>
      </div>

      {/* Form Settings */}
      <div className="bg-slate-900/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl mb-8">
        <div className="space-y-4">
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <LinkIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.urlPlaceholder}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-950/90 border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 text-sm sm:text-base font-medium transition-all"
            />
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                {t.limitLabel}
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full py-3 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value={10}>10 Video</option>
                <option value={30}>30 Video (Standar)</option>
                <option value={50}>50 Video</option>
                <option value={100}>100 Video</option>
                <option value={200}>200 Video (Maksimal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                {t.qualityLabel}
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="best">{t.qualityBest}</option>
                <option value="1080">{t.quality1080}</option>
                <option value="720">{t.quality720}</option>
                <option value="480">{t.quality480}</option>
                <option value="audio">{t.qualityAudio}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                {t.filterLabel}
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl bg-slate-950 border border-white/[0.08] text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{t.filterAll}</option>
                <option value="shorts">{t.filterShorts}</option>
                <option value="videos">{t.filterLong}</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExtractChannel}
              disabled={isLoading || !url.trim()}
              className="w-full py-4 rounded-2xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.98] text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{t.extracting}</span>
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5" />
                  <span>{t.extractBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 sm:p-5 text-rose-300 text-sm flex items-start gap-3 mb-8">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-200 mb-1">Gagal Mengakses Channel</h4>
            <p className="text-xs sm:text-sm text-rose-300/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Result Section */}
      {result && result.items && result.items.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* Action Toolbar */}
          <div className="bg-slate-900/90 border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                {selectedUrls.size === result.items.length ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    <span>{t.deselectAll}</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-500" />
                    <span>{t.selectAll}</span>
                  </>
                )}
              </button>
              <span className="text-xs font-bold text-white">
                {selectedUrls.size} dari {result.items.length} item dipilih
              </span>
            </div>

            {/* In-page Direct ZIP Button */}
            <button
              onClick={() => handleDownloadZip(Array.from(selectedUrls))}
              disabled={isZipping || selectedUrls.size === 0}
              className="py-3 px-6 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isZipping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.downloadingZip}</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  <span>
                    {selectedUrls.size === result.items.length
                      ? t.downloadAllZip
                      : `${t.downloadSelectedZip} (${selectedUrls.size})`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {result.items.map((item, idx) => {
              const isSelected = selectedUrls.has(item.url);

              return (
                <div
                  key={idx}
                  className={`bg-slate-900/80 hover:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.url)}
                      className="text-slate-400 hover:text-white transition-colors shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600" />
                      )}
                    </button>

                    <div className="w-20 sm:w-24 aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/[0.06] shrink-0 relative">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title || 'Item thumb'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Film className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                        {item.title || item.url}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                    <button
                      onClick={() => handleDownloadSingleItem(item, idx)}
                      disabled={downloadingItemIndex === idx}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5 transition-all"
                    >
                      {downloadingItemIndex === idx ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunduh...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{t.downloadSingle}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footnote */}
          <div className="bg-slate-900 border border-white/[0.08] rounded-2xl p-4 flex items-center gap-2.5 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.zipInfo}</span>
          </div>

        </div>
      )}

    </div>
  );
};
