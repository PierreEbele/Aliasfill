// Collects the extension's English texts into extension/_locales/en/messages.json: every t("…") and N_("…") literal in
// the scripts, and the data-i18n texts and data-i18n-attr attributes of the pages. Other languages translate the same
// message names (tests/i18n.test.ts lists what they miss).
// Usage: node scripts/i18n.mjs          writes _locales/en/messages.json
//        node scripts/i18n.mjs --check  fails if it is out of date
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const EXT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../extension");
const sandbox = {};
vm.runInNewContext(fs.readFileSync(path.join(EXT, "i18n.js"), "utf8"), sandbox);
const { id } = sandbox.AliasfillI18n;

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "_locales" || e.name === "store" || e.name === "icons" ? [] : files(p);
    return /\.(js|html)$/.test(e.name) ? [p] : [];
  });
}
const clean = (s) => s.trim().replace(/\s+/g, " ");
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

export function texts() {
  const found = new Set();
  for (const file of files(EXT)) {
    const src = fs.readFileSync(file, "utf8");
    if (file.endsWith(".js")) for (const m of src.matchAll(/\b(?:t|N_)\(\s*"((?:[^"\\]|\\.)*)"/g)) found.add(JSON.parse(`"${m[1]}"`));
    else {
      for (const m of src.matchAll(/<(\w+)[^>]*\sdata-i18n(?=[\s>])[^>]*>([^<]*)</g)) found.add(clean(decode(m[2])));
      for (const m of src.matchAll(/<\w+[^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/g))
        for (const name of m[1].split(",")) {
          const value = new RegExp(`\\s${name}="([^"]*)"`).exec(m[0]);
          if (value) found.add(clean(decode(value[1])));
        }
    }
  }
  found.delete("");
  return [...found].sort();
}

export function englishMessages() {
  const messages = {
    extDescription: {
      message: "Fake identities for sign-up forms, with disposable addresses from your own domain or alias service.",
    },
  };
  for (const text of texts()) messages[id(text)] = { message: text.replace(/\$(?!\d)/g, "$$$$") };
  return messages;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = path.join(EXT, "_locales/en/messages.json");
  const json = JSON.stringify(englishMessages(), null, 2) + "\n";
  if (process.argv.includes("--check")) {
    if (!fs.existsSync(out) || fs.readFileSync(out, "utf8") !== json) {
      console.error("extension/_locales/en/messages.json is out of date: run node scripts/i18n.mjs");
      process.exit(1);
    }
  } else {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, json);
    console.log(`${Object.keys(englishMessages()).length} messages`);
  }
}
