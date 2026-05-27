const http = require('node:http');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const page = readFileSync(join(__dirname, 'admin-rail-poc.html'), 'utf8');

const server = http.createServer((req, res) => {
  if (req.url === '/admin/rail-poc') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(page);
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`web listening on http://localhost:${port}`);
});
