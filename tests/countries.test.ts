import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

// The country sheets (extension/data/*.js), the generator and the filler's select matching, run as in the browser.
const ext = (f: string) => fs.readFileSync(path.join(__dirname, "../extension", f), "utf8");
const sandbox: Record<string, any> = { crypto };
vm.createContext(sandbox);
vm.runInContext(ext("data/index.js"), sandbox);
for (const f of sandbox.AliasfillCountries.files) vm.runInContext(ext(f), sandbox);
vm.runInContext(ext("generator.js"), sandbox);
vm.runInContext(ext("filler.js"), sandbox);
const G = sandbox.ThrowawayGenerator;
const C = sandbox.AliasfillCountries;
const F = sandbox.ThrowawayFill;

// Expected formats, written independently of the sheets. phone: the national number inside the range reserved
// for fiction, or null for a country where no such range was found.
const expected: Record<string, { postal: RegExp; phone: RegExp | null; select: string[] }> = {
  FR: { postal: /^\d{5}$/, phone: /^063998\d{4}$/, select: ["France", "FR", "FRA", "Frankreich"] },
  GB: { postal: /^[A-Z]{1,2}\d{1,2} \d[A-Z]{2}$/, phone: /^07700900\d{3}$/, select: ["United Kingdom", "UK", "GB", "Royaume-Uni"] },
  US: { postal: /^\d{5}$/, phone: /^\d{3}55501\d{2}$/, select: ["United States", "USA", "US", "États-Unis"] },
  CA: { postal: /^[A-Z]\d[A-Z] \d[A-Z]\d$/, phone: /^\d{3}55501\d{2}$/, select: ["Canada", "CA", "CAN"] },
  DE: { postal: /^\d{5}$/, phone: /^0(17139200|17604069)\d{2}$/, select: ["Germany", "Deutschland", "Allemagne", "DE"] },
  ES: { postal: /^\d{5}$/, phone: null, select: ["Spain", "España", "Espagne", "ES"] },
  IT: { postal: /^\d{5}$/, phone: null, select: ["Italy", "Italia", "Italie", "IT"] },
  BE: { postal: /^\d{4}$/, phone: null, select: ["Belgium", "Belgique", "België", "BE"] },
  CH: { postal: /^\d{4}$/, phone: null, select: ["Switzerland", "Schweiz", "Suisse", "CH"] },
  NL: { postal: /^\d{4} [A-Z]{2}$/, phone: null, select: ["Netherlands", "Nederland", "Pays-Bas", "NL"] },
};
const select = (...labels: [string, string][]) => ({
  options: [["", "Choose…"], ...labels].map(([value, textContent]) => ({ value, textContent, disabled: false, parentElement: {} })),
});

describe("country sheets", () => {
  it("are all registered and loaded wherever the generator is", () => {
    const onDisk = fs
      .readdirSync(path.join(__dirname, "../extension/data"))
      .filter((f) => f !== "index.js")
      .map((f) => `data/${f}`);
    expect([...C.files].sort()).toEqual(onDisk.sort());
    expect(C.codes().sort()).toEqual(Object.keys(expected).sort());
    const manifest = JSON.parse(ext("manifest.json")).background.scripts as string[];
    const worker = ext("service-worker.js");
    const popup = ext("popup.html");
    for (const f of ["data/index.js", ...C.files]) {
      expect(manifest.indexOf(f)).toBeGreaterThan(-1);
      expect(manifest.indexOf(f)).toBeLessThan(manifest.indexOf("generator.js"));
      expect(worker.indexOf(`"${f}"`)).toBeGreaterThan(-1);
      expect(worker.indexOf(`"${f}"`)).toBeLessThan(worker.indexOf('"generator.js"'));
      expect(popup.indexOf(`src="${f}"`)).toBeGreaterThan(-1);
      expect(popup.indexOf(`src="${f}"`)).toBeLessThan(popup.indexOf('src="generator.js"'));
    }
    for (const f of ["background.js", "popup.js"])
      expect(ext(f)).toContain('files: ["data/index.js", ...AliasfillCountries.files, "generator.js", "filler.js"]');
  });

  for (const [code, want] of Object.entries(expected))
    it(`${code}: valid postcode, fictional phone, recognised country select, title matching the first name`, () => {
      const sheet = C.get(code);
      for (let i = 0; i < 150; i++) {
        const p = G.generate(code);
        expect(p.countryCode).toBe(code);
        expect(p.postalCode).toMatch(want.postal);
        expect(p.postalCode).toMatch(sheet.postalPattern);
        if (want.phone) {
          expect(p.phoneNational).toMatch(want.phone);
          expect(p.phone.replace(/\D/g, "")).toBe(p.phoneCountryCode.slice(1) + p.phoneNational.replace(/^0/, ""));
        } else expect([p.phone, p.phoneNational]).toEqual(["", ""]);
        expect(sheet.places.some((place: any) => place.city === p.city && place.region === p.region)).toBe(true);
        expect(p.address).toMatch(/\d/);
        expect(p.address2).not.toMatch(/[#@]/);
        expect(p.company).toBeTruthy();
        expect(p.email).toMatch(/^[a-z]+\.[a-z]+\.[0-9a-f]{10}@example\.com$/);
        expect(p.username).toMatch(/^[a-z0-9._]{3,20}$/);
        // Civility: the first name belongs to the gender, the title is one of that gender's.
        expect(sheet.names[p.gender]).toContain(p.firstName);
        const titles = sheet.titles.female ? sheet.titles : Object.values(sheet.titles).find((t: any) => t[p.gender].includes(p.title));
        expect(titles?.[p.gender]).toContain(p.title);
        expect(p.titleAliases).toContain(p.title);
      }
      expect(sheet.names.female.filter((name: string) => sheet.names.male.includes(name))).toEqual([]);
      const p = G.generate(code);
      for (const label of want.select) expect(F.selectValue(select(["xx", "Elsewhere"], ["pick", label]), "country", p)).toBe("pick");
      expect(F.selectValue(select(["xx", "Elsewhere"]), "country", p)).toBeNull();
      expect(F.selectValue(select(["r", p.region]), "region", p)).toBe("r");
      if (p.regionCode) expect(F.selectValue(select([p.regionCode, "?"]), "region", p)).toBe(p.regionCode);
    });

  it("picks the civility select option of the identity's gender", () => {
    for (let i = 0; i < 40; i++) {
      const p = G.generate("FR");
      const civility = select(["mme", "Madame"], ["m", "Monsieur"]);
      expect(F.selectValue(civility, "title", p)).toBe(p.gender === "female" ? "mme" : "m");
      const english = select(["1", "Mr"], ["2", "Mrs"], ["3", "Ms"]);
      expect(F.selectValue(english, "title", p)).toBe(p.gender === "female" ? "2" : "1");
    }
  });

  it("keeps the title and first name coherent when one of them is locked", () => {
    for (let i = 0; i < 40; i++) {
      const first = G.generate("DE");
      const byName = G.generate("DE", first, ["firstName"]);
      expect(byName.firstName).toBe(first.firstName);
      expect(byName.title).toBe(first.title);
      const byTitle = G.generate("DE", first, ["title"]);
      expect(byTitle.title).toBe(first.title);
      expect(C.get("DE").names[first.gender]).toContain(byTitle.firstName);
      expect(byTitle.username.startsWith(byTitle.firstName.toLowerCase()[0])).toBe(true); // derived from the new name
    }
  });

  it("completes an identity saved by an older version without changing what it had", () => {
    const p = G.generate("GB");
    const old = { ...p };
    for (const key of ["gender", "title", "titleAliases", "username", "company", "address2", "region", "regionCode"]) delete old[key];
    const done = G.complete(old);
    for (const key of ["firstName", "lastName", "email", "password", "address", "city", "postalCode"]) expect(done[key]).toBe(p[key]);
    expect(done.gender).toBe(p.gender);
    expect(done.username).toBeTruthy();
    expect(G.complete(p)).toBe(p);
  });

  it("offers the new fields to a selection saved by an older version", () => {
    expect(G.upgradeSelection(["email"], 3)).toEqual(["email", "title", "username", "company", "address2", "region"]);
    expect(G.upgradeSelection(["email"], 4)).toEqual(["email"]);
  });
});
