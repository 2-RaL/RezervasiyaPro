// Hostinger Production Entrypoint Server
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

// When running behind Hostinger proxy / CloudLinux / Passenger, don't restrict hostname
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Hostinger Server Error:', err);
      res.statusCode = 500;
      res.end('Daxili Server Xətası');
    }
  });

  server.listen(port, (err) => {
    if (err) {
      console.error('Server listen error:', err);
      process.exit(1);
    }
    console.log(`> RezervasiyaPro Hostinger üzərində hazırdır: port ${port}`);
  });
}).catch((err) => {
  console.error('Next.js prepare error:', err);
  process.exit(1);
});
