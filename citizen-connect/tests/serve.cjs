// Only serves the exported app on this computer for browser tests.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist");
const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".json": "application/json",
};
http
  .createServer((req, res) => {
    let filename;
    try {
      filename = path.resolve(
        root,
        "." + decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname),
      );
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    if (filename !== root && !filename.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!fs.existsSync(filename) || fs.statSync(filename).isDirectory())
      filename = path.join(root, "index.html");
    res.writeHead(200, {
      "Content-Type":
        types[path.extname(filename)] || "application/octet-stream",
    });
    fs.createReadStream(filename).pipe(res);
  })
  .listen(4173, "127.0.0.1");
