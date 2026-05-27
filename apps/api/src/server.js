const http = require('node:http');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'api' }));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
