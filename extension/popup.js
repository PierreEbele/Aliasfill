"use strict";
const $ = (id) => document.getElementById(id);
const fieldLabels = ThrowawayGenerator.fields;
const fieldKeys = Object.keys(fieldLabels);
let profile = null;
let revision = 0;
let countryTouched = false;
let settingsTouched = false;
let busy = false;
let selectedFields = new Set(fieldKeys);
let lockedFields = new Set();
let testCard = null;
let cardSettingsTouched = false;
function cardStatus(message, error = false) {
  $("card-status").textContent = message;
  $("card-status").dataset.tone = error ? "error" : "normal";
}
function showPanel(name) {
  for (const key of ["profile", "card", "history"]) {
    $(key + "-panel").hidden = key !== name;
    $("tab-" + key).setAttribute("aria-pressed", String(key === name));
  }
  $("profile-actions").hidden = name !== "profile";
  document.querySelector("main").scrollTop = 0;
}
$("tab-profile").addEventListener("click", () => showPanel("profile"));
$("tab-card").addEventListener("click", () => showPanel("card"));
$("tab-history").addEventListener("click", () => {
  showPanel("history");
  void renderHistory();
});
// One option per country sheet (data/*.js), named and sorted in the browser's language.
const regionNames = (() => {
  try {
    return new Intl.DisplayNames([browser.i18n.getUILanguage()], { type: "region" });
  } catch {
    return null;
  }
})();
for (const [code, name] of AliasfillCountries.codes()
  .map((code) => [code, regionNames?.of(code) || AliasfillCountries.get(code).countryEnglish])
  .sort((a, b) => a[1].localeCompare(b[1])))
  $("country-mode").add(new Option(name, code));
for (const [key, name] of Object.entries(ThrowawayGenerator.banks)) $("card-bank").add(new Option(t("$1 (simulated)", name), key));
function syncCardSettings() {
  const bankMode = $("card-mode").value === "bank-bin";
  $("card-network").querySelector('[value="visa"]').textContent = bankMode ? "Visa" : "CB / Visa";
  $("card-network").querySelector('[value="mastercard"]').textContent = bankMode ? "Mastercard" : "CB / Mastercard";
  for (const option of $("card-network").options)
    option.disabled =
      bankMode &&
      option.value !== "random" &&
      !ThrowawayGenerator.bankBins.some(
        (entry) => ($("card-bank").value === "random" || entry.bankCode === $("card-bank").value) && entry.networkCode === option.value,
      );
  if ($("card-network").selectedOptions[0]?.disabled) $("card-network").value = "random";
}
for (const id of ["card-mode", "card-bank", "card-network"])
  $(id).addEventListener("change", async () => {
    cardSettingsTouched = true;
    syncCardSettings();
    cardStatus(t("Applies to the next test card."));
    try {
      await browser.storage.local.set({
        cardMode: $("card-mode").value,
        cardBankMode: $("card-bank").value,
        cardNetworkMode: $("card-network").value,
      });
    } catch {
      cardStatus(t("Applied, but saving it locally failed."), true);
    }
  });
function renderCard() {
  const bankMode = testCard.mode === "bank-bin";
  $("card-mode-heading").textContent = bankMode ? t("FRANCE · SYNTHETIC NUMBER") : t("FRANCE · STRIPE SANDBOX");
  $("card-explanation").textContent = bankMode
    ? t(
        "BIN attributed to the bank by BinCheck.org; the other digits are generated with a Luhn check digit. No card is issued and no account is created. Mock-up number, not certified by the bank and not provided by Stripe for its sandbox.",
      )
    : t(
        "Official Stripe test numbers, fixed per network. The bank is a simulated label: these cards are not issued by the banks shown and cannot make any real payment.",
      );
  $("card-bin-info").hidden = !bankMode;
  $("card-bin-info").replaceChildren();
  if (bankMode) {
    const source = document.createElement("a");
    source.href = testCard.binSource;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = t("BinCheck source");
    $("card-bin-info").append(
      t("BIN $1 · $2. Checked on $3.", testCard.bin, testCard.binIssuer, testCard.binChecked || "2026-10-20") + " ",
      source,
    );
  }
  $("card-bank-name").textContent = t("$1 · simulated", testCard.bank);
  $("card-network-name").textContent = testCard.network + " · France";
  $("card-number").textContent = testCard.number.match(/.{4}/g).join(" ");
  $("card-holder").textContent = testCard.holder;
  $("card-expiry").textContent = testCard.expiry;
  $("card-cvc").textContent = testCard.cvc;
  syncControls();
}
$("generate-card").addEventListener("click", async () => {
  if (busy) return;
  const generated = ThrowawayGenerator.generateCard($("card-bank").value, $("card-network").value, profile?.fullName, $("card-mode").value);
  if (!generated) {
    cardStatus(t("No known BIN for this bank/network combination. Pick another network."), true);
    return;
  }
  testCard = generated;
  renderCard();
  cardStatus(
    testCard.mode === "bank-bin"
      ? t("Synthetic number ready, with the listed bank BIN. For form mock-ups only.")
      : t("Test card ready. The official number is fixed per network."),
  );
  try {
    await browser.storage.local.set({ testCard });
  } catch {
    cardStatus(t("Card ready, but saving it locally failed."), true);
  }
});
for (const id of ["copy-card", "copy-card-number"])
  $(id).addEventListener("click", async () => {
    if (!testCard) return;
    const text =
      id === "copy-card-number"
        ? testCard.number
        : [
            testCard.mode === "bank-bin" ? t("SYNTHETIC CARD — MOCK-UP, NOT A STRIPE SANDBOX CARD") : t("TEST CARD — STRIPE SANDBOX"),
            t("Simulated bank: $1 (not actually issued)", testCard.bank),
            ...(testCard.mode === "bank-bin"
              ? [t("Listed BIN: $1", testCard.bin), t("Issuer per BinCheck: $1", testCard.binIssuer), t("Source: $1", testCard.binSource)]
              : []),
            t("Network: $1", testCard.network),
            t("Country: France"),
            t("Number: $1", testCard.number),
            t("Fake holder: $1", testCard.holder),
            t("Expiry: $1", testCard.expiry),
            t("Test CVC: $1", testCard.cvc),
          ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      cardStatus(id === "copy-card-number" ? t("Test number copied.") : t("Test card copied."));
    } catch {
      cardStatus(t("Copy unavailable. You can copy the displayed values by hand."), true);
    }
  });
function status(message, error = false) {
  $("status").textContent = message;
  $("status").dataset.tone = error ? "error" : "normal";
}
function syncControls() {
  for (const id of ["generate-card", "card-mode", "card-bank", "card-network", "card-overwrite", "undo-card"]) $(id).disabled = busy;
  for (const id of ["fill-card", "copy-card", "copy-card-number"]) $(id).disabled = busy || !testCard;
  $("fill").disabled = busy || selectedFields.size === 0;
  $("generate").disabled = busy;
  $("copy").disabled = busy || !profile;
  $("reveal-password").disabled = busy || !profile;
  $("undo").disabled = busy;
  $("overwrite").disabled = busy;
  const countryLocked = !!profile && ThrowawayGenerator.isCountryLocked([...lockedFields]);
  $("country-mode").disabled = busy || countryLocked;
  $("country-hint").hidden = !countryLocked;
  $("country-hint").textContent = countryLocked ? t("Country kept: $1 (location details locked).", profile.country) : "";
  $("options-count").textContent = t("$1/$2 fields · $3 locked", selectedFields.size, fieldKeys.length, lockedFields.size);
  for (const key of fieldKeys) {
    const include = $("include-" + key),
      lock = $("lock-" + key);
    include.checked = selectedFields.has(key);
    include.disabled = busy;
    lock.disabled = busy || !profile;
    lock.setAttribute("aria-pressed", String(lockedFields.has(key)));
    lock.setAttribute("aria-label", lockedFields.has(key) ? t("Unlock: $1", t(fieldLabels[key])) : t("Lock: $1", t(fieldLabels[key])));
    lock.textContent = lockedFields.has(key) ? t("Locked") : t("Free");
    lock.title = lockedFields.has(key) ? t("Value kept when generating") : t("Keep this value when generating");
  }
}
async function saveSettings() {
  try {
    await browser.storage.local.set({ selectedFields: [...selectedFields], lockedFields: [...lockedFields], settingsVersion: 4 });
  } catch {
    status(t("Settings applied, but saving them locally failed."), true);
  }
}
for (const [key, label] of Object.entries(fieldLabels)) {
  const row = document.createElement("div");
  row.className = "option-row";
  const name = document.createElement("label");
  name.htmlFor = "include-" + key;
  name.textContent = t(label);
  const include = document.createElement("input");
  include.type = "checkbox";
  include.id = "include-" + key;
  include.setAttribute("aria-label", t("Fill: $1", t(label)));
  include.addEventListener("change", () => {
    settingsTouched = true;
    if (include.checked) selectedFields.add(key);
    else selectedFields.delete(key);
    syncControls();
    status(selectedFields.size ? t("$1 field(s) selected for filling.", selectedFields.size) : t("Tick at least one field to fill."));
    void saveSettings();
  });
  const lock = document.createElement("button");
  lock.type = "button";
  lock.id = "lock-" + key;
  lock.className = "lock-button";
  lock.addEventListener("click", () => {
    if (!profile) return;
    settingsTouched = true;
    if (lockedFields.has(key)) lockedFields.delete(key);
    else lockedFields.add(key);
    syncControls();
    status(lockedFields.has(key) ? t("Locked: “$1”.", t(label)) : t("Unlocked: “$1”.", t(label)));
    void saveSettings();
  });
  row.append(name, include, lock);
  $("field-options").append(row);
}
function render() {
  for (const [id, key] of Object.entries({
    "full-name": "fullName",
    "first-name": "firstName",
    "last-name": "lastName",
    civility: "title",
    username: "username",
    company: "company",
    address: "address",
    address2: "address2",
    region: "region",
    city: "city",
    "postal-code": "postalCode",
    country: "country",
    email: "email",
    phone: "phone",
  }))
    $(id).textContent = profile[key] || "—";
  $("avatar").textContent = profile.firstName[0] + profile.lastName[0];
  $("edition").textContent = t("Identity #$1 · $2", revision, profile.country);
  $("phone").title =
    profile.phoneReserved === false
      ? t("Random number in this country's format: no range is reserved for fiction here, so it may belong to someone.")
      : "";
  $("password").value = profile.password;
  $("birth-date").textContent = profile.birthDate.split("-").reverse().join("/");
  $("password").type = "password";
  $("reveal-password").textContent = t("Show");
  $("reveal-password").setAttribute("aria-pressed", "false");
  syncControls();
}
$("reveal-password").addEventListener("click", () => {
  const show = $("password").type === "password";
  $("password").type = show ? "text" : "password";
  $("reveal-password").textContent = show ? t("Hide") : t("Show");
  $("reveal-password").setAttribute("aria-pressed", String(show));
});
$("country-mode").addEventListener("change", async () => {
  countryTouched = true;
  const countryMode = $("country-mode").value;
  status(t("Country set for the next profile. Click New identity."));
  try {
    await browser.storage.local.set({ countryMode });
  } catch {
    status(t("Applied, but saving it locally failed."), true);
  }
});
$("generate").addEventListener("click", async () => {
  if (profile && lockedFields.size === fieldKeys.length) {
    status(t("Every field is locked. Set at least one value to Free to regenerate it."));
    return;
  }
  // The disposable address follows the e-mail: kept only if the e-mail is locked.
  const keptAlias = lockedFields.has("email") ? profile?.throwaway : undefined;
  profile = ThrowawayGenerator.generate($("country-mode").value, profile, [...lockedFields]);
  revision++;
  if (keptAlias) profile.throwaway = keptAlias;
  tmCode = null;
  void tmRender();
  render();
  status(lockedFields.size ? t("Profile regenerated. Locked values were kept.") : t("New profile ready. The page was not changed."));
  try {
    await browser.storage.local.set({ profile, revision });
  } catch {
    status(t("Profile ready, but saving it locally failed."), true);
  }
});
$("copy").addEventListener("click", async () => {
  if (!profile) return;
  const text = Object.entries(fieldLabels)
    .map(([key, label]) => `${t(label)}: ${key === "birthDate" ? profile[key].split("-").reverse().join("/") : (profile[key] ?? "")}`)
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    status(t("Profile copied to the clipboard."));
  } catch {
    status(t("Copy unavailable. You can select the displayed values and copy them by hand."), true);
  }
});
async function activeTabId() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("NO_TAB");
  return tab.id;
}
$("fill").addEventListener("click", async () => {
  if (!selectedFields.size || busy) return;
  busy = true;
  syncControls();
  status(t("Looking for form fields…"));
  try {
    if (!(await ensureIdentity())) return;
    const { bitwardenMode } = await browser.storage.local.get("bitwardenMode");
    if (!bitwardenMode && !(await ensureAlias())) return;
    const tabId = await activeTabId();
    await browser.scripting.executeScript({
      target: { tabId },
      files: ["data/index.js", ...AliasfillCountries.files, "generator.js", "filler.js"],
    });
    const results = await browser.scripting.executeScript({
      target: { tabId },
      func: (data, options) => globalThis.ThrowawayFill.fill(data, options),
      args: [
        profile,
        {
          overwrite: $("overwrite").checked,
          fields: [...selectedFields].filter((k) => !bitwardenMode || (k !== "email" && k !== "password")),
        },
      ],
    });
    const report = results[0]?.result;
    if (!report) throw new Error("NO_RESULT");
    // The site refused the password and a variant it accepts was typed instead: the identity keeps that one.
    if (report.password) {
      profile = { ...profile, password: report.password };
      render();
      await browser.storage.local.set({ profile });
    }
    // Bitwarden mode: the page waits for the e-mail filled by Bitwarden, then the code.
    if (bitwardenMode) await browser.tabs.sendMessage(tabId, { type: "watch-email" }).catch(() => {});
    if (report.filled && profile.throwaway) void handOffCode(tabId);
    const pageUrl = await activeTabUrl();
    if (report.filled && /^https?:/.test(pageUrl))
      await AliasfillHistory.record(browser.storage.local, new URL(pageUrl).hostname, profile).catch(() => {});
    const passwordNote =
      (report.passwordIssue === "preserved"
        ? " " + t("Passwords kept together to avoid a mismatched confirmation.")
        : report.passwordIssue === "constraints"
          ? " " + t("Password does not meet the site’s rules: neither field was changed.")
          : report.passwordIssue === "registration"
            ? " " + t("Password skipped: not recognised as a sign-up.")
            : report.password
              ? " " + t("Password shortened or simplified to meet the site’s rules (saved in the identity).")
              : "") +
      (report.birthIssue === "preserved"
        ? " " + t("Existing birth date kept as a whole.")
        : report.birthIssue === "constraints"
          ? " " + t("Birth date does not meet the site’s rules: its fields were kept.")
          : "");
    if (report.filled) {
      status(
        t("$1 field(s) filled.", report.filled) +
          (report.preserved ? " " + t("$1 already filled, kept.", report.preserved) : "") +
          (report.rejected ? " " + t("$1 value(s) rejected.", report.rejected) : "") +
          passwordNote +
          " " +
          t("Nothing was submitted."),
      );
    } else if (report.passwordIssue || report.birthIssue)
      status(
        passwordNote.trim(),
        report.passwordIssue === "constraints" || report.birthIssue === "constraints" || report.passwordIssue === "registration",
      );
    else if (report.preserved) status(t("The detected fields are already filled. Tick Overwrite existing to change them."));
    else if (report.unchanged) status(t("The selected fields already hold the profile values."));
    else if (report.rejected) status(t("Fields found, but their rules rejected the values. No field changed."), true);
    else if (report.blockedAuthentication)
      status(t("This looks like a sign-in or account verification form. Aliasfill skips those forms and their passwords."), true);
    else if (report.selectionMismatch)
      status(t("Some fields were recognised but are unticked in Fields to fill. Tick the ones to fill."), true);
    else status(t("No field matches your selection. Some embedded forms and custom components cannot be reached."), true);
  } catch {
    status(
      t(
        "Cannot access this page. Open a regular web page and try again. Firefox protects its internal pages, its add-on store and some PDFs.",
      ),
      true,
    );
  } finally {
    busy = false;
    syncControls();
  }
});
$("fill-card").addEventListener("click", async () => {
  if (!testCard || busy) return;
  busy = true;
  syncControls();
  cardStatus(t("Looking for card fields…"));
  try {
    const tabId = await activeTabId();
    await browser.scripting.executeScript({ target: { tabId }, files: ["filler.js"] });
    const results = await browser.scripting.executeScript({
      target: { tabId },
      func: (card, options) => globalThis.ThrowawayFill.fillCard(card, options),
      args: [testCard, { overwrite: $("card-overwrite").checked }],
    });
    const report = results[0]?.result;
    if (!report) throw new Error("NO_RESULT");
    if (report.invalidCard) cardStatus(t("Invalid or expired test card. Generate a new one."), true);
    else if (report.readOnlyGroup) cardStatus(t("A card field is read-only and holds another value. No field changed."), true);
    else if (report.preservedGroup) cardStatus(t("Existing values kept as a whole. Tick Overwrite existing to insert the test card."));
    else if (report.incompatible) cardStatus(t("A field’s rules reject this test card. No field changed."), true);
    else if (report.filled)
      cardStatus(
        t("$1 card field(s) filled.", report.filled) +
          (report.missing?.length ? " " + t("Not found: $1.", report.missing.map((m) => cardFieldNames[m] || m).join(", ")) : "") +
          (report.rejected ? " " + t("$1 value(s) rejected by the site.", report.rejected) : "") +
          " " +
          t("Nothing was clicked or submitted."),
      );
    else if (report.unchanged) cardStatus(t("The detected fields already hold this test card."));
    else cardStatus(t("No card form recognised. Iframes from another domain and some custom fields cannot be reached."), true);
  } catch {
    cardStatus(t("Cannot access this page. Open your test form and try again."), true);
  } finally {
    busy = false;
    syncControls();
  }
});
// Card fields fillCard() reports as not found.
const cardFieldNames = { number: t("number"), expiry: t("expiry"), CVC: t("CVC"), holder: t("holder") };
async function undoFill(cardMode = false) {
  if (busy) return;
  const notify = cardMode ? cardStatus : status;
  busy = true;
  syncControls();
  notify(t("Undoing the last fill…"));
  try {
    const tabId = await activeTabId();
    const results = await browser.scripting.executeScript({
      target: { tabId },
      func: () => globalThis.ThrowawayFill?.undo?.() || { available: false, restored: 0, skipped: 0, failed: 0 },
    });
    const report = results[0]?.result;
    if (!report?.available) notify(t("Nothing to undo on this page."));
    else
      notify(
        t("$1 field(s) restored.", report.restored) +
          (report.skipped ? " " + t("$1 field(s) edited since or unreachable, kept.", report.skipped) : "") +
          (report.failed ? " " + t("$1 restore(s) rejected by the site.", report.failed) : ""),
        !!report.failed,
      );
  } catch {
    notify(t("Cannot undo on this page. The fill must belong to the active tab."), true);
  } finally {
    busy = false;
    syncControls();
  }
}
$("undo").addEventListener("click", () => undoFill(false));
$("undo-card").addEventListener("click", () => undoFill(true));
// ---------------------------------------------------------------------------
// History: the identity used on each site, kept in this browser only (history.js).
// ---------------------------------------------------------------------------
function historyStatus(message, error = false) {
  $("history-status").textContent = message;
  $("history-status").dataset.tone = error ? "error" : "normal";
}
async function renderHistory() {
  const storage = browser.storage.local;
  try {
    await AliasfillHistory.purge(storage);
    const all = await AliasfillHistory.list(storage);
    const { historyDays = AliasfillHistory.DEFAULT_DAYS } = await storage.get("historyDays");
    $("history-retention").textContent =
      historyDays < 0 ? t("History off (Settings).") : historyDays > 0 ? t("Kept $1 days.", historyDays) : t("Kept until deleted.");
    const entries = AliasfillHistory.search(all, $("history-search").value);
    $("history-empty").hidden = entries.length > 0;
    $("history-empty").textContent = all.length
      ? t("No identity matches this search.")
      : t("No identity filled yet. Each fill is kept here, in this browser only.");
    $("history-clear").disabled = !all.length;
    $("history-list").replaceChildren(...entries.map(historyItem));
  } catch {
    historyStatus(t("Local storage unavailable."), true);
  }
}
function historyItem(entry) {
  const p = entry.profile;
  const item = document.createElement("li");
  const head = document.createElement("div");
  head.className = "history-head";
  const host = document.createElement("strong");
  host.textContent = entry.host;
  const date = document.createElement("span");
  date.className = "meta";
  date.textContent = new Date(entry.usedAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  head.append(host, date);
  const who = document.createElement("div");
  who.textContent = [p.fullName, p.email].filter(Boolean).join(" · ");
  const row = document.createElement("div");
  row.className = "row";
  const button = (label, onClick) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "link";
    b.textContent = label;
    b.setAttribute("aria-label", `${label}: ${entry.host}`);
    b.addEventListener("click", onClick);
    return b;
  };
  row.append(
    button(t("Copy"), async () => {
      const text = [
        t("Site: $1", entry.host),
        t("Name: $1", p.fullName),
        t("E-mail: $1", p.email),
        ...(p.username ? [t("Username: $1", p.username)] : []),
        t("Password: $1", p.password),
      ].join("\n");
      try {
        await navigator.clipboard.writeText(text);
        historyStatus(t("Identity used on $1 copied.", entry.host));
      } catch {
        historyStatus(t("Copy unavailable."), true);
      }
    }),
    button(t("Reuse"), async () => {
      // Back as the current identity; the next fill on this site keeps it instead of generating a new one.
      profile = { ...ThrowawayGenerator.complete(p), reusedFor: entry.host, createdAt: Date.now() };
      revision++;
      tmCode = null;
      render();
      void tmRender();
      showPanel("profile");
      status(t("Identity used on $1 is back. Fill the form to use it again.", entry.host));
      try {
        await browser.storage.local.set({ profile, revision });
      } catch {
        status(t("Identity restored, but saving it locally failed."), true);
      }
    }),
    button(t("Delete"), async () => {
      await AliasfillHistory.remove(browser.storage.local, entry.id);
      historyStatus(t("Entry for $1 deleted.", entry.host));
      await renderHistory();
    }),
  );
  item.append(head, who, row);
  return item;
}
$("history-search").addEventListener("input", () => void renderHistory());
// Two clicks: popups cannot show confirm() in Firefox.
let clearArmed = null;
$("history-clear").addEventListener("click", async () => {
  if (!clearArmed) {
    $("history-clear").textContent = t("Click again to delete all");
    historyStatus(t("The whole history will be deleted. This cannot be undone."));
    clearArmed = setTimeout(() => {
      clearArmed = null;
      $("history-clear").textContent = t("Clear history");
      historyStatus("");
    }, 4000);
    return;
  }
  clearTimeout(clearArmed);
  clearArmed = null;
  $("history-clear").textContent = t("Clear history");
  await AliasfillHistory.clear(browser.storage.local);
  historyStatus(t("History cleared."));
  await renderHistory();
});
// ---------------------------------------------------------------------------
// Throwaway Mail: a real disposable address per site + retrieval of the received code.
// ---------------------------------------------------------------------------
let tmCode = null;
let tmWaiting = false;
function tmStatus(message, error = false) {
  $("tm-status").textContent = message;
  $("tm-status").dataset.tone = error ? "error" : "normal";
}
// Active alias provider ({ provider, cfg }) or null; `codes` = it can fetch verification codes (Throwaway Mail).
let active = null;
const canFetchCodes = () => !!active?.provider.codes;
async function tmRender() {
  active = await AliasProviders.active().catch(() => null);
  const on = !!active;
  const name = active?.provider.name || "";
  $("tm-badge").replaceChildren(document.createElement("i"), on ? ` ${active.provider.short}` : ` ${t("LOCAL")}`);
  $("tm-badge").classList.toggle("on", on);
  $("tm-badge").title = on
    ? (active.provider.id === "none" ? t("Addresses from your own domain or mailbox (no network)") : t("Addresses from $1", name)) +
      (canFetchCodes() ? t(", codes fetched automatically") : "")
    : t("@example.com addresses, nothing leaves the browser");
  const alias = profile?.throwaway;
  $("tm-email-note").hidden = !on;
  $("tm-email-note").textContent = alias ? t("DISPOSABLE") : t("DISPOSABLE ON FILL");
  $("tm-panel").hidden = !(canFetchCodes() && alias?.id);
  // The site the address was made for: its code is pasted automatically only there.
  if (alias) $("tm-address").textContent = alias.host ? `${alias.email} · ${alias.host}` : alias.email;
  $("tm-code").textContent = tmCode?.code || "—";
  $("tm-copy").disabled = $("tm-paste").disabled = !tmCode?.code;
  $("tm-wait").disabled = tmWaiting || !alias;
  $("tm-wait").textContent = tmWaiting ? t("Waiting…") : tmCode ? t("Next code") : t("Wait for code");
  const link = tmCode && !tmCode.code ? String(tmCode.links?.[0]?.url || tmCode.links?.[0] || "") : "";
  const webLink = /^https?:\/\//i.test(link);
  $("tm-link").hidden = !webLink;
  $("tm-link").replaceChildren();
  if (webLink) {
    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = t("Open the confirmation link");
    $("tm-link").append(a);
  }
}
async function activeTabUrl() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab?.url || "";
}
// Is the open tab the site the address was made for?
async function onAliasSite(alias) {
  const url = await activeTabUrl().catch(() => "");
  return /^https?:/.test(url) && !!alias?.host && new URL(url).hostname === alias.host;
}
// Before filling: create (or reuse) the disposable address for the open site.
// Returns false if the fill must be aborted.
async function ensureAlias() {
  if (!selectedFields.has("email") || !(await AliasProviders.active())) return true;
  const url = await activeTabUrl();
  if (!/^https?:/.test(url)) {
    status(t("Open a website’s form and try again."), true);
    return false;
  }
  const host = new URL(url).hostname;
  if (profile.throwaway?.host === host) return true;
  status(t("Creating a disposable address for $1…", host));
  try {
    const alias = await AliasProviders.createAlias(url, profile.fullName);
    profile = { ...profile, email: alias.email, throwaway: alias };
    tmCode = null;
    render();
    void tmRender();
    await browser.storage.local.set({ profile });
    return true;
  } catch (e) {
    status(
      e.status === 401 || e.status === 403
        ? `${AliasProviders.errorMessage(active?.provider, e)} ${t("Check the settings.")}`
        : t("Could not create a disposable address: $1. Nothing was filled.", e.message),
      true,
    );
    return false;
  }
}
// New identity for every new site ("alwaysNew" setting, on by default).
async function ensureIdentity() {
  const { alwaysNew } = await browser.storage.local.get("alwaysNew");
  const url = await activeTabUrl();
  const host = /^https?:/.test(url) ? new URL(url).hostname : "";
  // Same site: its disposable address, or an identity reused from the history for it.
  const sameSite = profile?.throwaway?.host === host || (!!host && profile?.reusedFor === host);
  if (profile && (alwaysNew === false || sameSite)) return true;
  if (profile && lockedFields.size === fieldKeys.length) return true;
  const keptAlias = lockedFields.has("email") ? profile?.throwaway : undefined;
  profile = ThrowawayGenerator.generate($("country-mode").value, profile, [...lockedFields]);
  revision++;
  if (keptAlias) profile.throwaway = keptAlias;
  tmCode = null;
  render();
  void tmRender();
  await browser.storage.local.set({ profile, revision });
  return true;
}
// After a fill: the content script waits for the code and pastes it by itself,
// even if the popup closes or the site moves to another page.
async function handOffCode(tabId) {
  const { autoCode } = await browser.storage.local.get("autoCode");
  if (autoCode === false || !profile?.throwaway?.id || !canFetchCodes()) return;
  await browser.runtime.sendMessage({ type: "pending-set", host: profile.throwaway.host, alias: profile.throwaway }).catch(() => {});
  await browser.tabs.sendMessage(tabId, { type: "watch-code" }).catch(() => {});
  tmStatus(t("The code will be pasted into the page as soon as it arrives."));
}
async function tmPoll(wait) {
  const alias = profile?.throwaway;
  if (!alias?.id || !canFetchCodes()) return;
  const since = tmCode?.message_id || alias.createdAt;
  tmWaiting = wait > 0;
  void tmRender();
  if (wait) tmStatus(t("Waiting for an e-mail (up to 2 min). Keep this window open."));
  try {
    let found = null;
    for (let i = 0; i < (wait ? 2 : 1) && !found; i++) found = await active.provider.waitForCode(active.cfg, alias, since, wait);
    if (found) {
      tmCode = found;
      // Pasted by itself only into the address's own site; elsewhere, Copy or Paste is left to the user.
      const elsewhere = found.code && wait && !(await onAliasSite(alias));
      if (found.code && wait && !elsewhere) setTimeout(() => $("tm-paste").click(), 0);
      tmStatus(
        found.code
          ? t("From $1", found.from || "?") +
              (found.subject ? ` · “${found.subject}”` : "") +
              "." +
              (elsewhere ? " " + t("This code is for $1: not pasted into this page. Use Copy or Paste.", alias.host) : "")
          : t("E-mail received without a code: confirmation link available."),
      );
    } else if (wait) tmStatus(t("Nothing yet. Try again after asking the site to send the code."));
  } catch (e) {
    tmStatus(t("$1 unreachable: $2", active?.provider.name || t("Server"), e.message), true);
  } finally {
    tmWaiting = false;
    void tmRender();
  }
}
$("tm-wait").addEventListener("click", () => tmPoll(55));
$("tm-copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(tmCode.code);
    tmStatus(t("Code copied."));
  } catch {
    tmStatus(t("Copy unavailable."), true);
  }
});
$("tm-paste").addEventListener("click", async () => {
  try {
    const tabId = await activeTabId();
    await browser.scripting.executeScript({ target: { tabId }, files: ["otp.js"] });
    const [res] = await browser.scripting.executeScript({ target: { tabId }, func: fillCodeInPage, args: [tmCode.code] });
    tmStatus(
      res?.result ? t("Code pasted ($1 field(s)). Nothing submitted.", res.result) : t("No code field found: use Copy."),
      !res?.result,
    );
  } catch {
    tmStatus(t("Cannot access this page. Use Copy."), true);
  }
});
// Runs in the page: one-time-code field, focused field or one-digit boxes.
// Runs in the page (after otp.js): same detection as the content script.
function fillCodeInPage(code) {
  const set = (el, v) => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const inputs = [...document.querySelectorAll("input")].filter((el) => el.offsetParent !== null);
  const target = globalThis.ThrowawayOtp.codeTarget(inputs, code.length, document.activeElement);
  if (!globalThis.ThrowawayOtp.fill(target, code, set)) return 0;
  (target.el || target.boxes[Math.min(code.length, target.boxes.length) - 1]).focus();
  return target.boxes ? Math.min(code.length, target.boxes.length) : 1;
}
$("tm-settings").addEventListener("click", (event) => {
  event.preventDefault();
  void browser.runtime.openOptionsPage();
  window.close();
});

$("version").textContent = `Aliasfill ${browser.runtime.getManifest().version}`;
AliasfillI18n.localize();
syncControls();
(async () => {
  try {
    await browser.runtime.sendMessage({ type: "purge" }).catch(() => {});
    const saved = await browser.storage.local.get([
      "profile",
      "revision",
      "countryMode",
      "selectedFields",
      "lockedFields",
      "settingsVersion",
      "testCard",
      "cardMode",
      "cardBankMode",
      "cardNetworkMode",
    ]);
    if (!cardSettingsTouched) {
      if (saved.cardBankMode === "random" || Object.hasOwn(ThrowawayGenerator.banks, saved.cardBankMode))
        $("card-bank").value = saved.cardBankMode;
      if (saved.cardNetworkMode === "random" || Object.hasOwn(ThrowawayGenerator.cardNetworks, saved.cardNetworkMode))
        $("card-network").value = saved.cardNetworkMode;
      if (["stripe", "bank-bin"].includes(saved.cardMode)) $("card-mode").value = saved.cardMode;
      syncCardSettings();
    }
    if (!testCard && ThrowawayGenerator.isTestCard(saved.testCard)) {
      testCard = saved.testCard;
      renderCard();
      cardStatus(t("Last test card restored."));
    }
    if (!countryTouched && ["random", ...AliasfillCountries.codes()].includes(saved.countryMode))
      $("country-mode").value = saved.countryMode;
    if (!settingsTouched) {
      if (Array.isArray(saved.selectedFields)) selectedFields = new Set(saved.selectedFields.filter((key) => fieldKeys.includes(key)));
      // Fields added since the selection was saved are offered first, so the older checks below still apply.
      selectedFields = new Set(ThrowawayGenerator.upgradeSelection([...selectedFields], saved.settingsVersion));
      if (
        (!saved.settingsVersion || saved.settingsVersion < 2) &&
        fieldKeys.filter((key) => key !== "password" && key !== "birthDate").every((key) => selectedFields.has(key))
      )
        selectedFields.add("password");
      if (
        (!saved.settingsVersion || saved.settingsVersion < 3) &&
        fieldKeys.filter((key) => key !== "birthDate").every((key) => selectedFields.has(key))
      )
        selectedFields.add("birthDate");
      if (Array.isArray(saved.lockedFields)) lockedFields = new Set(saved.lockedFields.filter((key) => fieldKeys.includes(key)));
    }
    if (
      !profile &&
      saved.profile &&
      Array.isArray(saved.profile.countryAliases) &&
      [
        "firstName",
        "lastName",
        "fullName",
        "email",
        "phone",
        "address",
        "city",
        "postalCode",
        "country",
        "countryEnglish",
        "countryCode",
        "phoneNational",
        "phoneCountryCode",
      ].every((key) => typeof saved.profile[key] === "string")
    ) {
      profile = saved.profile;
      let upgradedProfile = false;
      if (!ThrowawayGenerator.validBirthDate(profile.birthDate)) {
        profile = { ...profile, birthDate: ThrowawayGenerator.generateBirthDate() };
        upgradedProfile = true;
      }
      if (typeof profile.password !== "string" || !profile.password) {
        profile = { ...profile, password: ThrowawayGenerator.generatePassword() };
        upgradedProfile = true;
      }
      const completed = ThrowawayGenerator.complete(profile);
      if (completed !== profile) {
        profile = completed;
        upgradedProfile = true;
      }
      revision = saved.revision || 1;
      render();
      status(t("Last profile restored. Ready to fill a form."));
      if (upgradedProfile) await browser.storage.local.set({ profile });
    }
    if (saved.settingsVersion !== 4) await saveSettings();
    syncControls();
    await tmRender();
    if (profile?.throwaway?.id && canFetchCodes()) void tmPoll(0);
  } catch {
    status(t("Local storage unavailable. You can still generate a profile."), true);
  }
})();

// Firefox (MV3) does not grant "all sites" at install time: ask for it (needs a click).
const ALL_SITES = { origins: ["http://*/*", "https://*/*"] };
async function checkSitePermission() {
  const banner = document.getElementById("perm-banner");
  banner.hidden = await browser.permissions.contains(ALL_SITES);
  document.getElementById("perm-grant").onclick = async () => {
    if (await browser.permissions.request(ALL_SITES)) banner.hidden = true;
  };
}
void checkSitePermission();
