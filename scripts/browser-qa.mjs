import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { startStaticServer } from "./static-server.mjs";
import { setTimeout as delay } from "node:timers/promises";

const edge =
  process.env.BROWSER_PATH ||
  (process.platform === "win32"
    ? resolve(
        process.env["PROGRAMFILES(X86)"] || process.env.PROGRAMFILES,
        "Microsoft",
        "Edge",
        "Application",
        "msedge.exe",
      )
    : "google-chrome");
const folder = await mkdtemp(resolve(tmpdir(), "portfolio-qa-"));
const { server, origin, basePath } = await startStaticServer();
const siteRoot = origin + basePath;
const browserProfile = resolve(folder, "browser-profile");
const browser = spawn(
  edge,
  [
    "--headless",
    "--disable-gpu",
    "--disable-background-networking",
    "--no-first-run",
    "--remote-debugging-port=0",
    "--user-data-dir=" + browserProfile,
    "about:blank",
  ],
  { stdio: "ignore" },
);
let socket;
let closeBrowser;
const errors = [];
const checks = [];
try {
  let tabs;
  for (let i = 0; i < 80; i++) {
    try {
      const port = (await readFile(resolve(browserProfile, "DevToolsActivePort"), "utf8")).split(
        "\n",
      )[0];
      tabs = await (await fetch("http://127.0.0.1:" + port + "/json")).json();
      if (tabs.some((t) => t.type === "page")) break;
    } catch {}
    await delay(250);
  }
  assert.ok(
    tabs?.some((t) => t.type === "page"),
    "Chromium/Edge must be available; set BROWSER_PATH if needed",
  );
  socket = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((ok, fail) => {
    socket.addEventListener("open", ok, { once: true });
    socket.addEventListener("error", fail, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown")
      errors.push(
        message.params.exceptionDetails.exception?.description ||
          message.params.exceptionDetails.text,
      );
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error")
      errors.push(JSON.stringify(message.params.args));
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error")
      errors.push(message.params.entry.text);
    if (message.id) {
      const p = pending.get(message.id);
      if (p) {
        pending.delete(message.id);
        message.error ? p.reject(message.error) : p.resolve(message.result);
      }
    }
  });
  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  closeBrowser = () => call("Browser.close");
  async function evaluate(expression) {
    const r = await call("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
  async function until(expression) {
    for (let i = 0; i < 80; i++) {
      if (await evaluate(expression)) return;
      await delay(100);
    }
    console.log(
      await evaluate(
        "JSON.stringify({lang:document.documentElement.lang,title:document.title,url:location.href,heading:document.querySelector('h1')?.textContent})",
      ),
    );
    throw new Error("Timed out: " + expression);
  }
  async function screenshot(name) {
    await delay(700);
    await writeFile(
      resolve(folder, name + ".png"),
      Buffer.from((await call("Page.captureScreenshot", { format: "png" })).data, "base64"),
    );
  }
  async function viewport(width, height = 1000) {
    await call("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
  }
  async function screenshotSection(selector, name) {
    const clip = await evaluate(`(() => {
      const rect = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
      return { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height, scale: 1 };
    })()`);
    await writeFile(
      resolve(folder, name + ".png"),
      Buffer.from(
        (await call("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: true }))
          .data,
        "base64",
      ),
    );
  }
  await call("Page.enable");
  await call("Page.bringToFront");
  await call("Emulation.setFocusEmulationEnabled", { enabled: true });
  await call("Runtime.enable");
  await call("Log.enable");
  await viewport(1440, 1100);
  await call("Page.navigate", { url: siteRoot });
  await until("document.querySelectorAll('.project-card').length===5");
  await delay(500);
  assert.equal(await evaluate("document.documentElement.lang"), "fr");
  await screenshot("desktop-fr");
  checks.push("French default and complete five-project page");

  // Change language with the keyboard, as a user would.
  await evaluate("document.querySelector('.language-switch button[lang=en]').focus()");
  await call("Input.dispatchKeyEvent", {
    type: "keyDown",
    text: "\r",
    unmodifiedText: "\r",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await call("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
  });
  await until(
    "document.documentElement.lang==='en'&&document.querySelector('h1').textContent.includes('Developer')",
  );
  await until("document.activeElement?.matches('.language-switch button[lang=en]')");
  assert.equal(
    await evaluate(
      "document.querySelector('.language-switch button[lang=en]').getAttribute('aria-pressed')",
    ),
    "true",
  );
  assert.equal(await evaluate("getComputedStyle(document.activeElement).outlineStyle"), "solid");
  await until(
    "document.title.includes('Developer')&&document.querySelector('meta[property=\"og:locale\"]').content==='en_GB'",
  );
  await evaluate("document.activeElement.blur()");
  await screenshot("desktop-en");
  assert.equal(
    await evaluate(
      "/Développeur|Télécharger|Compétences|Mon rôle|Schéma de principe/.test(document.body.innerText)",
    ),
    false,
  );
  checks.push("Keyboard-accessible language selector, translated document and live SEO");

  // The preference survives both explicit and bare-URL reloads.
  await call("Page.reload");
  await delay(500);
  await until("document.querySelector('h1')?.textContent.includes('Developer')");
  await call("Page.navigate", { url: siteRoot });
  await delay(500);
  await until("document.querySelector('h1')?.textContent.includes('Developer')");
  assert.equal(await evaluate("location.pathname.endsWith('/en/')"), true);
  checks.push("Language retained after reload and return to bare URL");

  // Open every project and verify its substantive content.
  await evaluate("document.querySelectorAll('.project-details').forEach(d=>{d.open=true;})");
  assert.equal(
    await evaluate(
      "[...document.querySelectorAll('.project-details')].every(d=>d.open&&d.innerText.includes('Results & validation'))",
    ),
    true,
  );
  assert.equal(
    await evaluate(
      "document.querySelector('#projet-peopleflow').innerText.includes('not yet ready')",
    ),
    true,
  );
  await evaluate("document.querySelector('#projets').scrollIntoView()");
  await screenshot("projects-en");
  checks.push("All five project sheets, security and local-only PeopleFlow qualification");

  // Trigger an actual browser download and check the returned bytes.
  // A fresh directory prevents a previous download from making this test pass.
  const downloadPath = resolve(folder, "downloads");
  await mkdir(downloadPath, { recursive: true });
  await call("Browser.setDownloadBehavior", { behavior: "allow", downloadPath });
  await evaluate("document.querySelector('a[download]').click()");
  let downloaded;
  for (let i = 0; i < 80; i++) {
    try {
      downloaded = await readFile(resolve(downloadPath, "CV_Mouad_Charef.pdf"));
      break;
    } catch {}
    await delay(100);
  }
  assert.ok(downloaded, "CV must be downloaded by the browser");
  assert.deepEqual(downloaded, await readFile("public/CV_Mouad_Charef.pdf"));
  checks.push("Actual CV download, original PDF bytes and professional filename");

  // Check a minimal accessibility tree and the internal anchors.
  const tree = await call("Accessibility.getFullAXTree");
  assert.equal(
    tree.nodes.filter((n) => !n.ignored && n.role?.value === "button" && !n.name?.value).length,
    0,
  );
  assert.equal(
    await evaluate(
      "[...document.querySelectorAll('a[href^=\"#\"]')].every(a=>document.getElementById(a.hash.slice(1)))",
    ),
    true,
  );
  await call("Browser.grantPermissions", {
    origin: origin,
    permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
  });
  await evaluate("document.querySelector('.copy-button').click()");
  await until("document.querySelector('[role=status]').textContent.includes('copied')");
  checks.push("Named buttons, anchor targets, translated clipboard feedback");

  for (const lang of ["en", "fr"]) {
    if (lang === "fr") {
      await evaluate("document.querySelector('.language-switch button[lang=fr]').click()");
      await until(
        "document.documentElement.lang==='fr'&&document.querySelector('h1').textContent.includes('Développeur')",
      );
      await until("document.activeElement?.matches('.language-switch button[lang=fr]')");
    }
    assert.equal(await evaluate("document.querySelectorAll('.education-item').length"), 3);
    assert.equal(await evaluate("document.querySelectorAll('.education-badge').length"), 2);
    assert.equal(
      await evaluate(
        "[...document.querySelectorAll('.education-level')].map(n=>n.textContent).join(',')",
      ),
      "Bac+2,Bac+3,Bac+5",
    );
    assert.equal(
      await evaluate(
        "[...document.querySelectorAll('.education-domains')].map(n=>n.children.length).join(',')",
      ),
      "4,7,6",
    );
    await viewport(1440, 1100);
    await evaluate(
      "document.querySelectorAll('.education-details').forEach(d=>d.open=false);document.querySelector('.education-details summary').focus()",
    );
    await call("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Enter",
      code: "Enter",
      text: "\r",
      unmodifiedText: "\r",
      windowsVirtualKeyCode: 13,
    });
    await call("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
    });
    await until("document.querySelector('.education-details').open");
    await call("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Enter",
      code: "Enter",
      text: "\r",
      unmodifiedText: "\r",
      windowsVirtualKeyCode: 13,
    });
    await call("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
    });
    await until("!document.querySelector('.education-details').open");
    assert.equal(
      await evaluate(
        "document.querySelector('.education-details summary').textContent.includes(" +
          JSON.stringify(lang === "fr" ? "Domaines étudiés" : "Areas of study") +
          ")",
      ),
      true,
    );
    await evaluate(
      "document.querySelectorAll('.education-details').forEach(d=>d.open=true);document.activeElement.blur();document.querySelector('#formation').scrollIntoView()",
    );
    await delay(300);
    await screenshotSection("#formation", "education-" + lang);
    for (const width of [360, 390, 768, 1024, 1440]) {
      await viewport(width, width < 768 ? 844 : 1000);
      await delay(100);
      assert.equal(
        await evaluate("document.documentElement.scrollWidth<=innerWidth"),
        true,
        lang + " overflow at " + width,
      );
    }
    await viewport(390, 844);
    await evaluate("scrollTo(0,0)");
    await screenshot("mobile-" + lang);
    await screenshotSection("#formation", "education-mobile-" + lang);
    await evaluate("document.querySelector('#menu-toggle').click()");
    assert.equal(
      await evaluate("document.querySelector('#menu-toggle').getAttribute('aria-expanded')"),
      "true",
    );
    await call("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
    await until("document.querySelector('#menu-toggle').getAttribute('aria-expanded')==='false'");
    assert.equal(await evaluate("document.activeElement.id"), "menu-toggle");
    await evaluate(
      "document.querySelector('#menu-toggle').click();document.querySelector('#navigation a').click()",
    );
    assert.equal(
      await evaluate("document.querySelector('#menu-toggle').getAttribute('aria-expanded')"),
      "false",
    );
  }
  checks.push(
    "FR/EN responsive at 360, 390, 768, 1024 and 1440px; mobile navigation and Escape focus",
  );
  checks.push(
    "FR/EN education timeline: three diplomas, two work-study badges, study areas and keyboard expand/collapse",
  );

  await call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  assert.equal(
    await evaluate("getComputedStyle(document.querySelector('.system-layer')).transform"),
    "none",
  );
  assert.equal(
    await evaluate("getComputedStyle(document.querySelector('.hero-enter')).animationName"),
    "none",
  );
  assert.equal(
    await evaluate("getComputedStyle(document.querySelector('.education-domains')).animationName"),
    "none",
  );
  await viewport(1440, 1100);
  await evaluate(
    "document.querySelectorAll('.project-details').forEach(d=>d.open=false);document.querySelector('#projets').scrollIntoView()",
  );
  await screenshot("projects-fr");
  await evaluate(
    "document.querySelector('#projet-peopleflow .project-details').open=true;document.querySelector('#projet-peopleflow').scrollIntoView()",
  );
  await screenshot("peopleflow-fr");
  await screenshotSection("#projet-peopleflow", "peopleflow-section-fr");
  await evaluate("document.querySelector('#competences').scrollIntoView()");
  await screenshot("skills-ai-fr");
  await screenshotSection("#competences", "skills-section-fr");
  checks.push("Reduced motion and perspective fallback");

  await call("Page.navigate", { url: siteRoot + "?lang=en" });
  await until("document.querySelector('h1')?.textContent.includes('Developer')");
  await until("location.pathname.endsWith('/en/') && !location.search.includes('lang=')");
  checks.push("Legacy language URLs redirect to the static English page before hydration");

  // Performance observations are local measurements, not a Lighthouse score.
  const performance = await evaluate(
    "({paints:performance.getEntriesByType('paint').map(p=>({name:p.name,startTime:p.startTime})),resources:performance.getEntriesByType('resource').map(r=>({name:r.name,transferSize:r.transferSize,decodedBodySize:r.decodedBodySize}))})",
  );
  assert.deepEqual(errors, [], "No console errors or uncaught JavaScript exceptions");
  const result = { passed: true, checks, errors, performance };
  await writeFile(resolve(folder, "browser-results.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ passed: true, checks, errors, artifacts: folder, basePath }));
  await call("Browser.close");
} finally {
  if (socket?.readyState === WebSocket.OPEN && closeBrowser) {
    await Promise.race([closeBrowser().catch(() => {}), delay(1000)]);
  }
  socket?.close();
  browser.kill();
  await new Promise((ok) => server.close(ok));
}
