import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', async (_req, res) => {
    try {
      const upstreamRes = await fetch('https://gendownload.com/api/health', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const upstreamData = await upstreamRes.json();
      return res.json({
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        upstream: upstreamData,
      });
    } catch (err: any) {
      return res.json({
        status: 'partial',
        timestamp: new Date().toISOString(),
        upstream: { ok: false, error: err.message },
      });
    }
  });

  // Extract endpoint proxy
  app.post('/api/extract', async (req, res) => {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Parameter "url" is required.' });
    }

    try {
      const upstream = await fetch('https://gendownload.com/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({ url }),
      });

      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    } catch (err: any) {
      return res.status(502).json({
        error: err.message || 'Failed to communicate with extraction engine.',
      });
    }
  });

  // Channel & Playlist endpoint proxy
  app.post('/api/channel', async (req, res) => {
    const { url, limit = 50, filter = 'all' } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Parameter "url" is required.' });
    }

    try {
      const upstream = await fetch('https://gendownload.com/api/channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({ url, limit: Number(limit) || 50, filter }),
      });

      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    } catch (err: any) {
      return res.status(502).json({
        error: err.message || 'Failed to fetch channel / playlist contents.',
      });
    }
  });

  // Zip (batch download) endpoint proxy
  app.post('/api/zip', async (req, res) => {
    const { urls, quality = 'best' } = req.body || {};
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Array of "urls" is required.' });
    }

    try {
      const upstream = await fetch('https://gendownload.com/api/zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({ urls, quality }),
      });

      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    } catch (err: any) {
      return res.status(502).json({
        error: err.message || 'Failed to generate zip package.',
      });
    }
  });

  // Direct In-Page Download Stream Proxy (Hides upstream domain, triggers native browser save directly on same page)
  app.get('/api/download-file', async (req, res) => {
    const targetUrl = req.query.url as string;
    const rawFilename = (req.query.filename as string) || 'video.mp4';
    const filename = rawFilename.replace(/[/\\?%*:|"<>]/g, '_');

    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    try {
      const parsed = new URL(targetUrl);
      if (!parsed.protocol.startsWith('http')) {
        return res.status(400).send('Invalid protocol');
      }

      const upstreamRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...(req.headers.range ? { Range: req.headers.range } : {}),
        },
      });

      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).send('Stream error');
      }

      const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
      const contentLength = upstreamRes.headers.get('content-length');

      res.status(upstreamRes.status);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      if (upstreamRes.body) {
        // @ts-ignore
        const nodeStream = upstreamRes.body;
        // @ts-ignore
        for await (const chunk of nodeStream) {
          res.write(chunk);
        }
        res.end();
      } else {
        res.end();
      }
    } catch (err: any) {
      res.status(500).send('Error downloading file: ' + err.message);
    }
  });

  // Proxy media preview
  app.get('/api/proxy-preview', async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    try {
      const parsed = new URL(targetUrl);
      if (!parsed.protocol.startsWith('http')) {
        return res.status(400).send('Invalid protocol');
      }

      const mediaRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...(req.headers.range ? { Range: req.headers.range } : {}),
        },
      });

      res.status(mediaRes.status);
      mediaRes.headers.forEach((value, key) => {
        if (!['content-security-policy', 'x-frame-options'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      if (mediaRes.body) {
        // @ts-ignore
        const nodeStream = mediaRes.body;
        // @ts-ignore
        for await (const chunk of nodeStream) {
          res.write(chunk);
        }
        res.end();
      } else {
        res.end();
      }
    } catch (err: any) {
      res.status(500).send('Error streaming media: ' + err.message);
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ready at http://localhost:${PORT}`);
  });
}

startServer();
