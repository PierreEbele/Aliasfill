import { chromium, expect, test, type BrowserContext, type Page, type Worker } from "@playwright/test";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fakeThrowaway } from "../fake-throwaway.js";
// @ts-expect-error: plain ES module without types
import { chromeManifest } from "../../scripts/chrome-manifest.mjs";

// The Chrome build of the extension, loaded unpacked in Chromium, against local pages and an in-memory Throwaway
// Mail API (tests/fake-throwaway.ts) that receives the site's verification mail when the form is sent.
const ROOT = path.join(import.meta.dirname, "../..");
const SIGNUP = `<!doctype html><meta charset="utf-8"><title>Sign up</title>
<form id="signup"><h1>Create account</h1>
<fieldset><legend>Title</legend><label><input type="radio" name="title" value="mrs"> Mrs</label><label><input type="radio" name="title" value="mr"> Mr</label></fieldset>
<label>First name <input name="fname" autocomplete="given-name"></label>
<label>Last name <input name="lname" autocomplete="family-name"></label>
<label>Company <input name="org" autocomplete="organization"></label>
<label>Street <input name="a1" autocomplete="address-line1"></label>
<label>Apartment, suite <input name="a2" autocomplete="address-line2"></label>
<label>Postcode <input name="zip" autocomplete="postal-code"></label>
<label>City <input name="city" autocomplete="address-level2"></label>
<label>County <input name="county" autocomplete="address-level1"></label>
<label>Country <select name="country" autocomplete="country"><option value="">Select…</option><option value="FR">France</option><option value="UK">United Kingdom</option></select></label>
<label>Phone <input name="tel" type="tel" autocomplete="tel"></label>
<label>Email <input type="email" name="email" autocomplete="email"></label>
<label>Password <input type="password" name="pw" autocomplete="new-password"></label>
<label>Confirm password <input type="password" name="pw2" autocomplete="new-password"></label>
<button type="submit">Sign up</button></form>
<script>document.getElementById("signup").onsubmit = (e) => { e.preventDefault(); fetch("/send-code?email=" + encodeURIComponent(e.target.email.value)); location.href = "/verify"; };</script>`;
const VERIFY = `<!doctype html><meta charset="utf-8"><title>Verify</title><h1>Check your inbox</h1>
<form><label for="otp">Verification code</label><input id="otp" name="otp" autocomplete="one-time-code" inputmode="numeric" maxlength="6"><button type="button">Verify</button></form>`;

let server: http.Server, base: string, ctx: BrowserContext, sw: Worker, extDir: string, profileDir: string;
const tm = fakeThrowaway({ domain: "relay.example.net", key: "tm_e2e_key" });

test.beforeAll(async () => {
  server = http.createServer(async (req, res) => {
    const url = new URL(req.url!, base);
    if (url.pathname.startsWith("/v1/")) {
      const body = await new Promise<string>((r) => {
        let b = "";
        req.on("data", (c) => (b += c));
        req.on("end", () => r(b));
      });
      const out = await tm.handle(url.href, {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: body || undefined,
      });
      res.writeHead(out.status, { "content-type": "application/json" });
      return res.end(out.status === 204 ? "" : await out.text());
    }
    if (url.pathname === "/send-code") {
      setTimeout(() => tm.deliver(url.searchParams.get("email")!, { from: "hello@shop.example", text: "Your code is 482913" }), 300);
      res.writeHead(204);
      return res.end();
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(url.pathname === "/verify" ? VERIFY : SIGNUP);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://localhost:${(server.address() as { port: number }).port}`;

  // The unpacked Chrome build, as scripts/pack-extension.sh makes it.
  extDir = fs.mkdtempSync(path.join(os.tmpdir(), "aliasfill-ext-"));
  fs.cpSync(path.join(ROOT, "extension"), extDir, { recursive: true });
  const manifest = chromeManifest(JSON.parse(fs.readFileSync(path.join(ROOT, "extension/manifest.json"), "utf8")));
  fs.writeFileSync(path.join(extDir, "manifest.json"), JSON.stringify(manifest));
  profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "aliasfill-profile-"));
  ctx = await chromium.launchPersistentContext(profileDir, {
    channel: "chromium",
    headless: true,
    locale: "en-US",
    args: [`--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`],
  });
  sw = ctx.serviceWorkers()[0] ?? (await ctx.waitForEvent("serviceworker"));
  await sw.evaluate(() => chrome.storage.local.set({ countryMode: "GB" }));
});

test.afterAll(async () => {
  await ctx?.close();
  server?.close();
  for (const dir of [extDir, profileDir]) if (dir) fs.rmSync(dir, { recursive: true, force: true });
});

// The background's own fill path (the sign-up card and the popup use the same filler).
async function fill(page: Page) {
  const url = page.url();
  return sw.evaluate(async (u) => {
    const [tab] = await chrome.tabs.query({ url: u });
    // @ts-expect-error: global of the service worker (background.js)
    return fillNewIdentity(tab.id, tab.url);
  }, url);
}
const stored = (key: string): Promise<Record<string, any>> => sw.evaluate((k) => chrome.storage.local.get(k), key);
const values = (page: Page) =>
  page.$$eval("input,select", (els) =>
    Object.fromEntries(
      (els as HTMLInputElement[]).map((e) => [
        e.type === "radio" ? `${e.name}:${e.value}` : e.name,
        e.type === "radio" ? e.checked : e.value,
      ]),
    ),
  );

test("fills a sign-up form: title radio, address, region, country select, phone and password", async () => {
  const page = await ctx.newPage();
  await page.goto(`${base}/signup`);
  const result = await fill(page);
  expect(result.report.rejected).toBe(0);
  const v = await values(page);
  const { profile } = await stored("profile");
  expect(profile.countryCode).toBe("GB");
  expect(v[profile.gender === "female" ? "title:mrs" : "title:mr"]).toBe(true);
  expect(v.fname).toBe(profile.firstName);
  expect(v.lname).toBe(profile.lastName);
  expect(v.org).toBe(profile.company);
  expect(v.a1).toBe(profile.address);
  expect(v.a2).toBe(profile.address2);
  expect(v.zip).toMatch(/^[A-Z]{1,2}\d{1,2} \d[A-Z]{2}$/);
  expect(v.city).toBe(profile.city);
  expect(v.county).toBe(profile.region);
  expect(v.country).toBe("UK");
  expect(v.tel).toMatch(/^\+44 7700 900\d{3}$/);
  expect(v.email).toBe(profile.email);
  expect(v.pw).toBe(profile.password);
  expect(v.pw2).toBe(profile.password);
  // The site is in the history.
  const { identityHistory } = await stored("identityHistory");
  expect(identityHistory[0]).toMatchObject({ host: "localhost", profile: { email: profile.email } });
  await page.close();
});

test("Undo restores the page as it was, title radio included", async () => {
  const page = await ctx.newPage();
  await page.goto(`${base}/signup`);
  await page.check('input[value="mrs"]');
  await page.fill('input[name="city"]', "Typed by hand");
  await sw.evaluate(() => chrome.storage.local.set({ profile: null }));
  await fill(page);
  const undo = await sw.evaluate(async (u) => {
    const [tab] = await chrome.tabs.query({ url: u });
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => (globalThis as any).ThrowawayFill.undo(),
    });
    return res.result;
  }, page.url());
  expect(undo.available).toBe(true);
  expect(undo.failed).toBe(0);
  const v = await values(page);
  expect(v["title:mrs"]).toBe(true);
  expect(v["title:mr"]).toBe(false);
  expect(v.city).toBe("Typed by hand");
  expect(v.fname).toBe("");
  expect(v.email).toBe("");
  await page.close();
});

test("with Throwaway Mail, creates the site's address and pastes the code on the next page", async () => {
  await sw.evaluate(
    (server) => chrome.storage.local.set({ aliasProvider: "throwaway", tmServer: server, tmApiKey: "tm_e2e_key", profile: null }),
    base,
  );
  const page = await ctx.newPage();
  await page.goto(`${base}/signup`);
  const result = await fill(page);
  expect(result.email).toMatch(/@relay\.example\.net$/);
  expect(tm.addresses.at(-1)?.email).toBe(result.email);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/verify");
  await expect(page.locator("#otp")).toHaveValue("482913", { timeout: 30_000 });
  await page.close();
});

test("the popup lists the history and offers every country sheet", async () => {
  const id = new URL(sw.url()).host;
  const popup = await ctx.newPage();
  await popup.goto(`chrome-extension://${id}/popup.html`);
  const countries = await popup.locator("#country-mode option").evaluateAll((o) => (o as HTMLOptionElement[]).map((x) => x.value));
  expect(countries).toEqual(expect.arrayContaining(["random", "FR", "GB", "US", "DE", "AU", "PT"]));
  await popup.click("#tab-history");
  await expect(popup.locator("#history-list li").first()).toContainText("localhost");
  await expect(popup.locator("#profile-actions")).toBeHidden();
  await popup.close();
});
