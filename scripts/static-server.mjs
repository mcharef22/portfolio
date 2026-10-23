import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
export async function startStaticServer({ port = 0, host = "127.0.0.1" } = {}) {
  const root = resolve("dist");
  const index = await readFile(resolve(root, "index.html"), "utf8");
  const basePath = index.match(/(?:href|src)="([^"]*\/)assets\//)?.[1] ?? "/";
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".txt": "text/plain; charset=utf-8",
  };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const pathname = decodeURIComponent(url.pathname);
      if (basePath !== "/" && pathname === basePath.slice(0, -1)) {
        response.writeHead(301, { location: basePath + url.search });
        response.end();
        return;
      }
      const allowed = pathname.startsWith(basePath);
      const path = resolve(root, allowed ? pathname.slice(basePath.length) : "__missing__");
      if (path !== root && !path.startsWith(root + sep)) {
        response.writeHead(403);
        response.end();
        return;
      }
      let file = path;
      let exists = allowed;
      let info;
      try {
        info = await stat(file);
      } catch {
        exists = false;
      }
      if (exists && info?.isDirectory()) {
        if (!pathname.endsWith("/")) {
          response.writeHead(301, { location: pathname + "/" + url.search });
          response.end();
          return;
        }
        file = resolve(file, "index.html");
      }
      let body;
      try {
        if (!exists) throw new Error("Not found");
        body = await readFile(file);
      } catch {
        file = resolve(root, "404.html");
        body = await readFile(file);
        exists = false;
      }
      response.writeHead(exists ? 200 : 404, {
        "content-type": mime[extname(file)] ?? "application/octet-stream",
        "x-content-type-options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      response.writeHead(400);
      response.end("Bad request");
    }
  });
  await new Promise((ok, fail) => {
    server.once("error", fail);
    server.listen(port, host, ok);
  });
  const address = server.address();
  return { server, origin: "http://" + host + ":" + address.port, basePath };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { origin, basePath } = await startStaticServer({ port: Number(process.env.PORT ?? 4173) });
  console.log("Static preview: " + origin + basePath);
}
