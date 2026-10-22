// Hostinger Production & Dev Entrypoint Server
const fs = require('fs');
const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Check if production build exists in .next
const hasBuild = fs.existsSync(path.join(__dirname, '.next', 'BUILD_ID'));
const dev = process.env.NODE_ENV === 'development' || !hasBuild;
const port = parseInt(process.env.PORT, 10) || 3000;

console.log(`> RezervasiyaPro server rejim: ${dev ? 'DEVELOPMENT / AUTO-BUILD' : 'PRODUCTION'}`);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Server Request Error:', err);
      res.statusCode = 500;
      res.end('Daxili Server Xətası');
    }
  });

  server.listen(port, (err) => {
    if (err) {
      console.error('Server listen error:', err);
      process.exit(1);
    }
    console.log(`> RezervasiyaPro aktivdir: http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Next.js startup error:', err);
  process.exit(1);
});
