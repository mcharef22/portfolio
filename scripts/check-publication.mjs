import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";

const files = [
  ...new Set(
    execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean),
  ),
];
const rules = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ["cloud key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{30,}\b/],
  ["embedded URL credentials", /https?:\/\/[^/\s:@]+:[^/\s@]+@/],
  ["absolute workstation path", /\b[A-Za-z]:[\\/](?:Users|Windows|Program Files)[\\/]/],
];
const failures = [];
for (const file of files) {
  let info;
  try {
    info = await stat(file);
  } catch {
    continue;
  }
  if (!info.isFile()) continue;
  if (/(?:^|\/)\.env(?:\.|$)/.test(file) && !file.endsWith(".env.example"))
    failures.push({ file, rule: "environment file" });
  if (/^(?:\.qa\.local|\.codex|\.aws|node_modules|dist|\.output)\//.test(file))
    failures.push({ file, rule: "local or generated file" });
  if (/\.(?:pdf|png|jpe?g|ico|woff2?)$/i.test(file)) continue;
  const text = await readFile(file, "utf8");
  for (const [name, pattern] of rules) if (pattern.test(text)) failures.push({ file, rule: name });
}
if (failures.length) {
  console.error(
    "Publication checks failed (values intentionally omitted):",
    JSON.stringify(failures),
  );
  process.exitCode = 1;
} else
  console.log(
    "Publication checks passed: " +
      files.length +
      " candidate paths checked; public CV and professional contact details retained.",
  );
