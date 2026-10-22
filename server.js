// Hostinger Production Entrypoint Server
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Hostinger Server Error:', err);
      res.statusCode = 500;
      res.end('Daxili Server Xətası');
    }
  }).listen(port, () => {
    console.log(`> Saytadi.com Hostinger üzərində hazırdır: http://${hostname}:${port}`);
  });
});
