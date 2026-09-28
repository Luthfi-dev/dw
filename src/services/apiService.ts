import { ApiHealthStatus, ChannelResult, VideoExtractResult } from '../types';

const UPSTREAM_API_URL = 'https://gendownload.com';

/**
 * Intelligent fetcher that calls local Express backend proxy with direct upstream fallback.
 */
async function fetchWithFallback<T>(endpoint: string, options: RequestInit): Promise<T> {
  let primaryError: Error | null = null;
  
  // Attempt 1: Local Express backend proxy
  try {
    const res = await fetch(endpoint, options);
    if (res.ok) {
      return await res.json();
    }
    const errBody = await res.json().catch(() => null);
    if (errBody && errBody.error) {
      throw new Error(errBody.error);
    }
    throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
  } catch (err: any) {
    primaryError = err;
    console.warn(`Local proxy to ${endpoint} failed (${err.message}), attempting upstream fallback...`);
  }

  // Attempt 2: Direct upstream fallback
  try {
    const upstreamRes = await fetch(`${UPSTREAM_API_URL}${endpoint}`, options);
    const data = await upstreamRes.json();
    if (!upstreamRes.ok || data.error) {
      throw new Error(data.error || `Upstream returned status ${upstreamRes.status}`);
    }
    return data;
  } catch (upstreamErr: any) {
    throw new Error(upstreamErr.message || primaryError?.message || 'Gagal terhubung ke server download.');
  }
}

/**
 * Extract single video/post metadata and download formats
 */
export async function extractVideo(url: string): Promise<VideoExtractResult> {
  const result = await fetchWithFallback<VideoExtractResult>('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  return {
    ...result,
    rawUrl: url,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Extract entire channel or playlist
 */
export async function extractChannel(
  url: string,
  limit = 50,
  filter = 'all'
): Promise<ChannelResult> {
  return await fetchWithFallback<ChannelResult>('/api/channel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, limit, filter }),
  });
}

/**
 * Bundle multiple videos into a streaming ZIP file
 */
export async function generateZip(
  urls: string[],
  quality = 'best'
): Promise<{ token?: string; url?: string; error?: string }> {
  return await fetchWithFallback<{ token?: string; url?: string; error?: string }>('/api/zip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls, quality }),
  });
}

/**
 * Check API status and queue load
 */
export async function checkApiHealth(): Promise<ApiHealthStatus> {
  const start = performance.now();
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    const duration = Math.round(performance.now() - start);

    if (data.status === 'online' || (data.upstream && (data.upstream.ok || data.upstream.queue))) {
      return {
        ok: true,
        status: 'online',
        queue: data.upstream?.queue,
        responseTimeMs: duration,
        lastChecked: Date.now(),
      };
    }

    return {
      ok: true,
      status: 'online',
      responseTimeMs: duration,
      lastChecked: Date.now(),
    };
  } catch {
    try {
      const direct = await fetch('https://gendownload.com/api/health');
      const directData = await direct.json();
      return {
        ok: true,
        status: 'online',
        queue: directData.queue,
        responseTimeMs: Math.round(performance.now() - start),
        lastChecked: Date.now(),
      };
    } catch {
      return {
        ok: false,
        status: 'offline',
        responseTimeMs: Math.round(performance.now() - start),
        lastChecked: Date.now(),
      };
    }
  }
}
