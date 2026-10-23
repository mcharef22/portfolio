import { cp, mkdir, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
const root = process.cwd();
const source = resolve(root, ".output/public");
const output = resolve(root, "dist");
if (output !== resolve(root, "dist")) throw new Error("Unexpected output directory");
for (const page of ["index.html", "en/index.html"]) {
  const html = await readFile(resolve(source, page), "utf8");
  if (!html.includes("PeopleFlow")) throw new Error("Missing prerendered portfolio: " + page);
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
const html = await readFile(resolve(output, "index.html"), "utf8");
const base = html.match(/(?:href|src)="([^"]*\/)assets\//)?.[1] ?? "/";
await writeFile(resolve(output, ".nojekyll"), "");
// Keep the original third-party license texts alongside the minified browser bundles.
const lock = JSON.parse(await readFile(resolve(root, "package-lock.json"), "utf8"));
const notices = [];
for (const [directory, metadata] of Object.entries(lock.packages)) {
  if (!directory.startsWith("node_modules/") || metadata.dev) continue;
  const packageRoot = resolve(root, directory);
  if (!packageRoot.startsWith(resolve(root, "node_modules") + sep))
    throw new Error("Unexpected package path");
  let pkg;
  try {
    pkg = JSON.parse(await readFile(resolve(packageRoot, "package.json"), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" && metadata.optional) continue;
    throw error;
  }
  const names = (await readdir(packageRoot)).filter((name) =>
    /^(?:licen[sc]e|copying|notice)(?:[.-]|$)/i.test(name),
  );
  const texts = [];
  for (const name of names) {
    try {
      texts.push(await readFile(resolve(packageRoot, name), "utf8"));
    } catch {
      /* Some packages use a license directory. */
    }
  }
  notices.push(
    [
      pkg.name + " " + pkg.version,
      "License: " + (metadata.license ?? pkg.license ?? "See upstream package"),
      ...texts,
    ].join("\n\n"),
  );
}
await writeFile(
  resolve(output, "THIRD_PARTY_NOTICES.txt"),
  notices.join("\n\n" + "=".repeat(72) + "\n\n"),
);
await writeFile(
  resolve(output, "404.html"),
  `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>404 — Mouad Charef</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#151918;color:#f1f0e9;font:16px/1.6 system-ui}main{max-width:38rem;padding:2rem}a{color:#efb48f;display:inline-block;margin:1rem 1rem 0 0}a:focus-visible{outline:2px solid #efb48f;outline-offset:6px}</style></head><body><main><h1>Page introuvable.</h1><p>Cette adresse ne correspond à aucune page du portfolio.</p><div lang="en"><h2>Page not found.</h2><p>This address does not match any page in the portfolio.</p></div><a href="${base}">Accueil · Français</a><a href="${base}en/" lang="en">Home · English</a></main></body></html>`,
);
console.log("Static GitHub Pages artifact ready: dist/ (base " + base + ")");
