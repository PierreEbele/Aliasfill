import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

// The per-site identity history (extension/history.js) against an in-memory storage.local.
const sandbox: Record<string, any> = { structuredClone };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../extension/history.js"), "utf8"), sandbox);
const H = sandbox.AliasfillHistory;
function storage(initial: Record<string, any> = {}) {
  const data: Record<string, any> = structuredClone(initial);
  return {
    data,
    get: async (keys: string | string[]) =>
      Object.fromEntries(
        [keys]
          .flat()
          .filter((k) => k in data)
          .map((k) => [k, structuredClone(data[k])]),
      ),
    set: async (o: Record<string, any>) => void Object.assign(data, structuredClone(o)),
    remove: async (keys: string[]) => keys.forEach((k) => delete data[k]),
  };
}
const identity = (name: string, email: string) => ({
  fullName: name,
  email,
  password: "Pa55word!",
  username: name.toLowerCase().replace(" ", "."),
});
const DAY = 86400_000;

describe("identity history", () => {
  it("keeps one entry per site and address, newest first", async () => {
    const s = storage();
    await H.record(s, "a.example", identity("Léa Martin", "lea@x.test"), 1000);
    await H.record(s, "b.example", identity("Hugo Petit", "hugo@x.test"), 2000);
    await H.record(s, "a.example", identity("Léa Martin", "lea@x.test"), 3000); // filled again: refreshed
    await H.record(s, "a.example", identity("Zoé Durand", "zoe@x.test"), 4000); // another identity on the same site
    const entries = await H.list(s);
    expect(entries.map((e: any) => [e.host, e.profile.email, e.usedAt])).toEqual([
      ["a.example", "zoe@x.test", 4000],
      ["a.example", "lea@x.test", 3000],
      ["b.example", "hugo@x.test", 2000],
    ]);
    expect(entries[1].profile.password).toBe("Pa55word!");
  });

  it("deletes one entry or all of them by hand", async () => {
    const s = storage();
    const a = await H.record(s, "a.example", identity("Léa Martin", "lea@x.test"));
    await H.record(s, "b.example", identity("Hugo Petit", "hugo@x.test"));
    await H.remove(s, a.id);
    expect((await H.list(s)).map((e: any) => e.host)).toEqual(["b.example"]);
    await H.clear(s);
    expect(await H.list(s)).toEqual([]);
  });

  it("forgets entries after the retention delay, never with 0, and keeps nothing when off", async () => {
    const now = 100 * DAY;
    const s = storage({ historyDays: 30 });
    await H.record(s, "old.example", identity("A B", "a@x.test"), now - 31 * DAY);
    await H.record(s, "new.example", identity("C D", "c@x.test"), now - 29 * DAY);
    await H.purge(s, now);
    expect((await H.list(s)).map((e: any) => e.host)).toEqual(["new.example"]);
    s.data.historyDays = 0; // until deleted by hand
    await H.purge(s, now + 1000 * DAY);
    expect(await H.list(s)).toHaveLength(1);
    s.data.historyDays = -1; // off: cleared, and nothing new is kept
    await H.purge(s, now);
    expect(await H.list(s)).toEqual([]);
    expect(await H.record(s, "c.example", identity("E F", "e@x.test"))).toBeNull();
    expect(await H.list(s)).toEqual([]);
  });

  it("defaults to 90 days", async () => {
    const s = storage();
    await H.record(s, "a.example", identity("A B", "a@x.test"), 0);
    await H.purge(s, 89 * DAY);
    expect(await H.list(s)).toHaveLength(1);
    await H.purge(s, 91 * DAY);
    expect(await H.list(s)).toHaveLength(0);
  });

  it("searches the site, name, address and username, ignoring case and accents", async () => {
    const s = storage();
    await H.record(s, "shop.example", identity("Léa Martin", "lea.martin@x.test"));
    await H.record(s, "forum.example", identity("Hugo Petit", "hugo@x.test"));
    const all = await H.list(s);
    const hosts = (q: string) => H.search(all, q).map((e: any) => e.host);
    expect(hosts("LEA")).toEqual(["shop.example"]);
    expect(hosts("forum petit")).toEqual(["forum.example"]);
    expect(hosts("hugo.petit")).toEqual(["forum.example"]);
    expect(hosts("example")).toHaveLength(2);
    expect(hosts("nobody")).toEqual([]);
    expect(hosts("")).toHaveLength(2);
  });

  it("caps the history at 500 entries", async () => {
    const s = storage();
    for (let i = 0; i < 510; i++) await H.record(s, `s${i}.example`, identity("A B", `a${i}@x.test`), i);
    const entries = await H.list(s);
    expect(entries).toHaveLength(500);
    expect(entries[0].host).toBe("s509.example");
  });
});
