export interface MediaFormat {
  label: string;
  type: 'video' | 'audio' | string;
  ext: string;
  filesize: number | null;
  url: string;
  fps?: number;
  width?: number;
  height?: number;
}

export interface VideoExtractResult {
  title?: string;
  thumbnail?: string;
  duration?: number;
  source?: string;
  author?: string;
  views?: number;
  likes?: number;
  isChannel?: boolean;
  formats?: MediaFormat[];
  error?: string;
  rawUrl?: string;
  extractedAt?: string;
}

export interface ChannelItem {
  url: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
}

export interface ChannelResult {
  source?: string;
  count?: number;
  items?: ChannelItem[];
  error?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  source: string;
  thumbnail?: string;
  originalUrl: string;
  downloadUrl: string;
  formatLabel: string;
  ext: string;
  timestamp: number;
}

export interface ApiHealthStatus {
  ok: boolean;
  status: 'online' | 'degraded' | 'offline';
  queue?: {
    running?: number;
    waiting?: number;
  };
  responseTimeMs?: number;
  lastChecked?: number;
}

export type SupportedPlatformId =
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'douyin'
  | 'bilibili'
  | 'threads'
  | 'reddit'
  | 'pinterest'
  | 'vimeo'
  | 'soundcloud'
  | 'generic';
