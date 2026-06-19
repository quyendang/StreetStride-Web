const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');

const root = path.join(__dirname, 'website');
const port = Number(process.env.PORT || 3000);

const routes = new Map([
  ['/', 'index.html'],
  ['/support', 'support.html'],
  ['/privacy', 'privacy.html'],
  ['/help', 'help.html'],
  ['/contact', 'contact.html'],
  ['/terms', 'terms.html'],
  ['/robots.txt', 'robots.txt'],
  ['/sitemap.xml', 'sitemap.xml']
]);

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8']
]);

function resolveRequestPath(requestPath) {
  if (routes.has(requestPath)) {
    return path.join(root, routes.get(requestPath));
  }

  if (requestPath.startsWith('/assets/')) {
    const normalized = path.normalize(requestPath).replace(/^\/+/, '');
    const filePath = path.join(root, normalized);
    if (filePath.startsWith(root)) {
      return filePath;
    }
  }

  return null;
}

function sendFile(res, filePath, statusCode = 200) {
  fs.readFile(filePath, (error, body) => {
    if (error) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(statusCode, {
      'content-type': mimeTypes.get(ext) || 'application/octet-stream',
      'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff'
    });
    res.end(body);
  });
}

function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/$/, '') || '/';

  if (pathname === '/healthz') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  const filePath = resolveRequestPath(pathname);
  if (!filePath) {
    sendFile(res, path.join(root, '404.html'), 404);
    return;
  }

  sendFile(res, filePath);
}

function runCheck() {
  const required = ['index.html', 'support.html', 'privacy.html', 'help.html', 'contact.html', 'terms.html'];
  const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
  if (missing.length > 0) {
    console.error(`Missing website files: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('Website static file check passed.');
}

if (process.argv.includes('--check')) {
  runCheck();
} else {
  http.createServer(handler).listen(port, () => {
    console.log(`StreetStride website listening on port ${port}`);
  });
}
