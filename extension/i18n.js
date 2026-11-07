// Translations. The English text is the key: t("Profile copied.") or t("$1 field(s) filled.", n). Message names in
// _locales/<lang>/messages.json are a hash of that text (browsers allow [A-Za-z0-9_@] only); scripts/i18n.mjs
// collects the texts into _locales/en and tests/i18n.test.ts checks that every language has them all.
// In pages, data-i18n translates an element's text and data-i18n-attr="title,placeholder" those attributes.
(function (root) {
  "use strict";
  function id(text) {
    let h = 0x811c9dc5;
    for (const ch of text) {
      h ^= ch.codePointAt(0);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return "m" + h.toString(36);
  }
  function t(text, ...subs) {
    let out = "";
    try {
      out = root.browser?.i18n?.getMessage(id(text), subs.map(String)) || "";
    } catch {
      /* no i18n API (tests): English */
    }
    return out || text.replace(/\$(\d)/g, (_, n) => String(subs[n - 1] ?? ""));
  }
  function localize(doc = root.document) {
    for (const el of doc.querySelectorAll("[data-i18n]")) el.textContent = t(el.textContent.trim().replace(/\s+/g, " "));
    for (const el of doc.querySelectorAll("[data-i18n-attr]"))
      for (const name of el.dataset.i18nAttr.split(","))
        if (el.hasAttribute(name)) el.setAttribute(name, t(el.getAttribute(name).trim().replace(/\s+/g, " ")));
    doc.documentElement.lang = root.browser?.i18n?.getUILanguage?.().split("-")[0] || "en";
  }
  root.t = t;
  root.AliasfillI18n = { t, id, localize };
})(globalThis);
