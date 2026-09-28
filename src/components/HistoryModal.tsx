import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Copy,
  Check,
  Film,
  Calendar,
  Search,
} from 'lucide-react';
import { HistoryItem } from '../types';
import { downloadFileDirectly, sanitizeFilename } from '../utils/formatters';

interface HistoryModalProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  language: 'id' | 'en';
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  onClearHistory,
  onRemoveItem,
  language,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = {
    id: {
      title: 'Riwayat Unduhan Tersimpan',
      subtitle: 'Daftar video yang telah Anda unduh sebelumnya (tersimpan di browser lokal Anda).',
      empty: 'Belum ada riwayat unduhan.',
      clearAll: 'Hapus Riwayat',
      downloadAgain: 'Unduh Lagi',
      copyLink: 'Salin Link',
      copied: 'Tersalin',
    },
    en: {
      title: 'Saved Download History',
      subtitle: 'List of media files you downloaded previously (stored in local browser).',
      empty: 'No download history yet.',
      clearAll: 'Clear History',
      downloadAgain: 'Download Again',
      copyLink: 'Copy Link',
      copied: 'Copied',
    },
  }[language];

  const filtered = history.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.source.toLowerCase().includes(search.toLowerCase()) ||
      item.formatLabel.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRedownload = (item: HistoryItem) => {
    const safeName = sanitizeFilename(item.title, item.ext);
    downloadFileDirectly(item.downloadUrl, safeName);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Penyimpanan Lokal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {t.subtitle}
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Hapus semua riwayat unduhan?')) {
                onClearHistory();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.clearAll}
          </button>
        )}
      </div>

      {/* Search Input */}
      {history.length > 0 && (
        <div className="mb-6 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau platform..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs shadow-sm font-medium"
          />
        </div>
      )}

      {/* Items List */}
      {history.length === 0 ? (
        <div className="bg-slate-900/80 border border-white/[0.08] rounded-3xl p-12 text-center text-slate-500">
          <History className="w-12 h-12 mx-auto mb-3 text-slate-700" />
          <p className="text-sm font-bold text-slate-400">{t.empty}</p>
          <p className="text-xs text-slate-600 mt-1">
            Media yang Anda unduh akan otomatis tersimpan di sini agar mudah diakses kembali.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          Tidak ada hasil riwayat yang cocok.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-16 h-12 rounded-xl bg-slate-950 border border-white/[0.06] overflow-hidden shrink-0 relative">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-800 text-slate-300 uppercase">
                      {item.source}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {item.formatLabel} ({item.ext.toUpperCase()})
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-snug truncate">
                    {item.title}
                  </h4>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                <button
                  onClick={() => handleCopy(item.downloadUrl, item.id)}
                  title={t.copyLink}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => handleRedownload(item)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadAgain}</span>
                </button>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  title="Hapus"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
