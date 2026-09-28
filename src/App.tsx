/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SingleDownloader } from './components/SingleDownloader';
import { ChannelDownloader } from './components/ChannelDownloader';
import { SupportedPlatforms } from './components/SupportedPlatforms';
import { HistoryModal } from './components/HistoryModal';
import { Footer } from './components/Footer';
import { useDownloadHistory } from './hooks/useDownloadHistory';
import { checkApiHealth } from './services/apiService';
import { ApiHealthStatus } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'channel' | 'sites' | 'history'>('single');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [channelPreloadUrl, setChannelPreloadUrl] = useState<string>('');
  const [healthStatus, setHealthStatus] = useState<ApiHealthStatus | null>(null);

  const { history, addHistoryItem, removeHistoryItem, clearHistory } = useDownloadHistory();

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await checkApiHealth();
      setHealthStatus(status);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitchToChannel = (url: string) => {
    setChannelPreloadUrl(url);
    setActiveTab('channel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthStatus={healthStatus}
        historyCount={history.length}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'single' && (
          <SingleDownloader
            onAddHistory={addHistoryItem}
            onSwitchToChannel={handleSwitchToChannel}
            language={language}
          />
        )}

        {activeTab === 'channel' && (
          <ChannelDownloader
            initialUrl={channelPreloadUrl}
            onAddHistory={addHistoryItem}
            language={language}
          />
        )}

        {activeTab === 'sites' && <SupportedPlatforms language={language} />}

        {activeTab === 'history' && (
          <HistoryModal
            history={history}
            onClearHistory={clearHistory}
            onRemoveItem={removeHistoryItem}
            language={language}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onSelectTab={setActiveTab} language={language} />
    </div>
  );
}
