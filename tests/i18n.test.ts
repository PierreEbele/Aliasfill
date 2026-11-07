import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error: plain ES module without types
import { englishMessages } from "../scripts/i18n.mjs";

// The extension's translations (extension/_locales): English collected from the code, the others complete.
const locales = path.join(__dirname, "../extension/_locales");
const read = (lang: string): Record<string, { message: string }> =>
  JSON.parse(fs.readFileSync(path.join(locales, lang, "messages.json"), "utf8"));
const placeholders = (text: string) => (text.match(/\$\d/g) || []).sort();

describe("translations", () => {
  it("English matches the texts in the code (node scripts/i18n.mjs)", () => {
    expect(read("en")).toEqual(englishMessages());
  });

  for (const lang of fs.readdirSync(locales).filter((l) => l !== "en"))
    it(`${lang} translates every message, with the same placeholders`, () => {
      const en = read("en"),
        other = read(lang);
      expect(Object.keys(other).sort()).toEqual(Object.keys(en).sort());
      for (const [key, { message }] of Object.entries(en)) {
        expect(other[key].message.trim(), `${lang}: ${message}`).not.toBe("");
        expect(placeholders(other[key].message), `${lang}: ${message}`).toEqual(placeholders(message));
      }
    });
});
