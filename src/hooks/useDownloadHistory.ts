import { useState, useEffect } from 'react';
import { HistoryItem } from '../types';

const STORAGE_KEY = 'gendownload_history_v1';

export function useDownloadHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to persist history:', e);
    }
  }, [history]);

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // Remove any exact duplicate original + downloadUrl
      const filtered = prev.filter(
        (x) => !(x.originalUrl === item.originalUrl && x.formatLabel === item.formatLabel)
      );
      return [newItem, ...filtered].slice(0, 50); // Keep last 50 items
    });
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return {
    history,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
  };
}
