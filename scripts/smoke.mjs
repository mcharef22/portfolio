import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { startStaticServer } from "./static-server.mjs";
const { server, origin, basePath } = await startStaticServer();
const base = origin + basePath.replace(/\/$/, "");
try {
  await test("Static artifact includes third-party licenses and no server runtime", async () => {
    const notices = await readFile("dist/THIRD_PARTY_NOTICES.txt", "utf8");
    assert.match(notices, /react 19\./);
    assert.match(notices, /Permission is hereby granted/);
    assert.equal(await readFile("dist/.nojekyll", "utf8"), "");
    assert.equal((await fetch(base + "/server/index.mjs")).status, 404);
  });
  for (const lang of ["fr", "en"]) {
    const response = await fetch(base + (lang === "en" ? "/en/" : "/"));
    const html = await response.text();
    await test(lang + ": prerendered content and SEO", () => {
      assert.equal(response.status, 200);
      assert.match(html, new RegExp('<html[^>]+lang="' + lang + '"'));
      assert.match(html, /name="description"/);
      assert.match(html, /property="og:title"/);
      assert.match(html, new RegExp(lang === "fr" ? "fr_FR" : "en_GB"));
      assert.ok(html.includes(lang === "fr" ? "Développeur" : "Developer"));
      assert.ok(html.includes("Paris, France"));
      assert.ok(html.includes("Mindful House"));
      assert.ok(html.includes(lang === "fr" ? "Sept. 2022 — Oct. 2025" : "Sept. 2022 — Oct. 2025"));
      assert.doesNotMatch(
        html,
        /__l5e|@Lovable|lovable-error-reporting|Déc. 2025|CinemaNext Africa|Demander mon CV/,
      );
      if (lang === "en")
        assert.doesNotMatch(
          html,
          /Développeur|Télécharger|En cours|Compétences|Mon rôle|Schéma de principe|Réessayer/,
        );
    });
    await test(lang + ": five project sheets and honest local validation", () => {
      assert.equal([...html.matchAll(/id="projet-/g)].length, 5);
      for (const id of ["peopleflow", "roadmaker", "roadplayer", "spring", "llm"])
        assert.ok(html.includes('id="projet-' + id + '"'));
      for (const term of ["346", "138", "253", "MinIO", "Qwen3", "RAG", "Spring PetClinic"])
        assert.ok(html.includes(term), term);
      assert.ok(html.includes(lang === "fr" ? "pas encore prêt" : "not yet ready"));
      assert.ok(html.includes(lang === "fr" ? "En cours" : "In progress"));
      assert.equal([...html.matchAll(/class="project-details"/g)].length, 5);
    });
    await test(lang + ": internal navigation, language controls and CV links", () => {
      const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
      for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), match[1]);
      assert.equal([...html.matchAll(/download="CV_Mouad_Charef.pdf"/g)].length, 2);
      assert.ok(html.includes('href="' + basePath + 'CV_Mouad_Charef.pdf"'));
      assert.ok(html.includes("aria-pressed="));
      assert.ok(html.includes(lang === "fr" ? "Télécharger mon CV" : "Download my CV"));
      assert.ok(html.includes("hrefLang") || html.includes("hreflang"));
    });
    await test(lang + ": bilingual static 404 with the correct HTTP status", async () => {
      const missing = await fetch(base + "/unknown-page?lang=" + lang);
      assert.equal(missing.status, 404);
      const body = await missing.text();
      assert.ok(body.includes(lang === "fr" ? "Page introuvable" : "Page not found"));
      assert.match(body, /<html[^>]+lang="fr"/);
    });
  }
  await test("Default and invalid languages fall back to French", async () => {
    for (const path of ["/", "/?lang=de"])
      assert.match(await (await fetch(base + path)).text(), /<html[^>]+lang="fr"/);
  });
  await test("CV download serves the actual PDF without redirection", async () => {
    const response = await fetch(base + "/CV_Mouad_Charef.pdf", { redirect: "manual" });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /application\/pdf/);
    const downloaded = Buffer.from(await response.arrayBuffer());
    assert.equal(downloaded.subarray(0, 5).toString(), "%PDF-");
    const expected = await readFile("public/CV_Mouad_Charef.pdf");
    assert.equal(
      createHash("sha256").update(downloaded).digest("hex"),
      createHash("sha256").update(expected).digest("hex"),
    );
  });
  await test("Styles and favicon are local and reduced motion is supported", async () => {
    const html = await (await fetch(base)).text();
    const css = [...html.matchAll(/href="([^"]+\.css)"/g)].map((match) => match[1]);
    assert.ok(css.length);
    for (const url of css) {
      const asset = await fetch(new URL(url, base));
      assert.equal(asset.status, 200);
      assert.match(await asset.text(), /prefers-reduced-motion/);
    }
    assert.equal((await fetch(base + "/favicon.svg")).status, 200);
  });
} finally {
  await new Promise((ok) => server.close(ok));
}
