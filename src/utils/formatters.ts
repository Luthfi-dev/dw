/**
 * OmniSave Pro - Smart Direct Downloader & Formatters
 */

/**
 * Format bytes to readable size like 15.4 MB, 1.2 GB
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes <= 0) {
    return 'Ukuran bervariasi';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return '--:--';
  }
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format view and like counts (e.g. 1.8M, 15.2M, 450K)
 */
export function formatCount(count: number | null | undefined): string {
  if (count === null || count === undefined || isNaN(count)) {
    return '-';
  }
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} Milyar`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')} Juta`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')} Rb`;
  }
  return count.toLocaleString('id-ID');
}

/**
 * Clean a string to be a safe filesystem filename.
 */
export function sanitizeFilename(name: string, ext = 'mp4'): string {
  const clean = (name || 'video')
    .replace(/[\\/:*?"<>|#%&{}\\$!'@+`=]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 70)
    .replace(/_+$/, '');
  return `${clean}.${ext.replace(/^\./, '')}`;
}

/**
 * Smart Zero-Load Direct Downloader:
 * 1. Fetches directly from CDN in client browser (0% hosting server bandwidth).
 * 2. Creates a local Blob URL so the browser download manager attributes 100% to YOUR domain (blob:https://domainanda.com).
 * 3. Gracefully falls back to stream proxy if direct browser fetch is blocked.
 */
export async function downloadFileDirectly(
  sourceUrl: string,
  filename: string,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  // Strategy 1: Client-Side Direct CDN Stream to Local Blob (0% Server Load + 100% Domain Anda)
  try {
    const response = await fetch(sourceUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (response.ok) {
      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

      if (response.body && totalBytes > 0 && typeof ReadableStream !== 'undefined') {
        const reader = response.body.getReader();
        let receivedBytes = 0;
        const chunks: BlobPart[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedBytes += value.length;
            if (onProgress && totalBytes > 0) {
              const percent = Math.min(Math.round((receivedBytes / totalBytes) * 100), 99);
              onProgress(percent);
            }
          }
        }

        const blob = new Blob(chunks, {
          type: response.headers.get('content-type') || 'application/octet-stream',
        });
        const localBlobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = localBlobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(localBlobUrl);
        }, 10000);

        if (onProgress) onProgress(100);
        return true;
      } else {
        const blob = await response.blob();
        const localBlobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = localBlobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(localBlobUrl);
        }, 10000);

        if (onProgress) onProgress(100);
        return true;
      }
    }
  } catch (clientErr) {
    // Client-side fetch failed (e.g., CORS restriction or massive file), fallback to backend stream
    console.debug('Direct client fetch fallback to stream proxy:', clientErr);
  }

  // Strategy 2: Backend Stream Proxy Fallback
  return new Promise((resolve) => {
    const proxyUrl = `/api/download-file?url=${encodeURIComponent(sourceUrl)}&filename=${encodeURIComponent(filename)}`;

    let iframe = document.getElementById('__direct_downloader_frame') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = '__direct_downloader_frame';
      iframe.style.display = 'none';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    iframe.src = proxyUrl;

    if (onProgress) {
      onProgress(100);
    }

    setTimeout(() => {
      resolve(true);
    }, 1200);
  });
}
