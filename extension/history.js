// Identities used per site, to find them again from the popup: name, address, password and date of each fill.
// Kept in storage.local only (key identityHistory), never sent anywhere; deleted after `historyDays`
// (settings: 90 by default, 0 = until deleted by hand, -1 = no history at all).
(function (root) {
  "use strict";
  const KEY = "identityHistory";
  const MAX_ENTRIES = 500;
  const DEFAULT_DAYS = 90;
  const days = async (storage) => {
    const { historyDays = DEFAULT_DAYS } = await storage.get("historyDays");
    return Number(historyDays);
  };
  async function list(storage) {
    const { [KEY]: entries } = await storage.get(KEY);
    return Array.isArray(entries) ? entries : [];
  }
  // One entry per site and e-mail address: filling the same site again with the same identity refreshes it.
  async function record(storage, host, profile, now = Date.now()) {
    if (!host || !profile || (await days(storage)) < 0) return null;
    const entry = {
      id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      host,
      usedAt: now,
      profile: structuredClone(profile),
    };
    const others = (await list(storage)).filter((e) => !(e.host === host && e.profile?.email === profile.email));
    await storage.set({ [KEY]: [entry, ...others].slice(0, MAX_ENTRIES) });
    return entry;
  }
  async function remove(storage, id) {
    await storage.set({ [KEY]: (await list(storage)).filter((e) => e.id !== id) });
  }
  async function clear(storage) {
    await storage.remove([KEY]);
  }
  // Drops entries older than the retention delay (all of them when the history is off).
  async function purge(storage, now = Date.now()) {
    const keep = await days(storage);
    if (keep === 0) return;
    const entries = await list(storage);
    if (!entries.length) return;
    if (keep < 0) return clear(storage);
    const live = entries.filter((e) => e.usedAt > now - keep * 86400_000);
    if (live.length !== entries.length) await storage.set({ [KEY]: live });
  }
  const fold = (text) =>
    String(text || "")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  // Entries whose site, name, address, username or company contain every word of the query.
  function search(entries, query) {
    const words = fold(query).split(/\s+/).filter(Boolean);
    return entries.filter((e) => {
      const p = e.profile || {};
      const text = fold([e.host, p.fullName, p.email, p.username, p.company].join(" "));
      return words.every((word) => text.includes(word));
    });
  }
  root.AliasfillHistory = { list, record, remove, clear, purge, search, DEFAULT_DAYS };
})(globalThis);
