import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { fakeThrowaway } from "./fake-throwaway.js";

// Runs the extension's Throwaway Mail API client (extension/throwaway.js) against a fake server.
function loadClient(t: ReturnType<typeof fakeThrowaway>, store: Record<string, unknown>) {
  const sandbox: Record<string, unknown> = {
    URL,
    URLSearchParams,
    browser: {
      storage: { local: { get: async (keys: string[]) => Object.fromEntries(keys.filter((k) => k in store).map((k) => [k, store[k]])) } },
    },
    fetch: (url: string, init: RequestInit) => {
      expect(new URL(url).origin).toBe("https://mail.example.test");
      return t.handle(url, init);
    },
  };
  const src = fs.readFileSync(path.join(__dirname, "../extension/throwaway.js"), "utf8");
  vm.runInNewContext(`${src}\nglobalThis.Throwaway = Throwaway;`, sandbox);
  return sandbox.Throwaway as any;
}

describe("Throwaway Mail client", () => {
  it("creates a per-site address with an API key and retrieves the code", async () => {
    const t = fakeThrowaway();
    const tm = loadClient(t, { tmServer: "https://mail.example.test", tmApiKey: t.key });
    expect(await tm.enabled()).toBe(true);

    const alias = await tm.createAddress("https://shop.example.org/register?x=1", "Ada Lovelace");
    expect(alias.email).toMatch(/@mail\.example\.test$/);
    expect(alias.host).toBe("shop.example.org");
    const stored = t.addresses.find((a) => a.id === alias.id)!;
    expect(stored.site_name).toBe("shop.example.org");
    expect(stored.label).toBe("Throwaway Mail · Ada Lovelace");

    expect(await tm.waitForCode(alias.id, alias.createdAt, 0)).toBeNull();
    t.deliver(alias.email, { subject: "Votre code", text: "Votre code de vérification est 482913." });
    const found = await tm.waitForCode(alias.id, alias.createdAt, 0);
    expect(found.code).toBe("482913");
    // Asking again after that message waits for the next one.
    expect(await tm.waitForCode(alias.id, found.message_id, 0)).toBeNull();
  });

  it("reports an invalid key and refuses plain-http servers", async () => {
    const t = fakeThrowaway();
    const tm = loadClient(t, { tmServer: "https://mail.example.test", tmApiKey: "tm_bad" });
    await expect(tm.createAddress("https://a.example/", "x")).rejects.toMatchObject({ status: 401 });
    expect(() => tm.normalizeServer("http://mail.example.test")).toThrow(/HTTPS/);
    expect(tm.normalizeServer("https://mail.example.test/app/")).toBe("https://mail.example.test");
  });
});
