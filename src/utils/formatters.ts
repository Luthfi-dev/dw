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
 * Trigger file download directly on the same page without navigating or opening new tabs.
 * Uses local backend stream proxy to mask upstream source url.
 */
export function downloadFileDirectly(
  sourceUrl: string,
  filename: string,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    // Construct internal stream URL
    const proxyUrl = `/api/download-file?url=${encodeURIComponent(sourceUrl)}&filename=${encodeURIComponent(filename)}`;

    // Create an invisible iframe to initiate file download on the same page
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

    // Trigger visual callback
    if (onProgress) {
      onProgress(100);
    }

    setTimeout(() => {
      resolve(true);
    }, 1200);
  });
}
