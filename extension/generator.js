(function (root) {
  "use strict";
  // Country sheets (data/*.js), loaded before this file.
  const countries = root.AliasfillCountries;
  const fields = Object.freeze({
    title: "Title",
    firstName: "First name",
    lastName: "Last name",
    username: "Username",
    company: "Company",
    address: "Address",
    address2: "Address line 2",
    city: "City",
    postalCode: "Postal code",
    region: "Region / State",
    country: "Country",
    email: "E-mail",
    phone: "Phone",
    birthDate: "Birth date",
    password: "Password",
  });
  // Fields added by version 4 of the settings: added to a selection saved before them.
  const fieldsAddedInV4 = ["title", "username", "company", "address2", "region"];
  const upgradeSelection = (selected, version = 0) => (version < 4 ? [...new Set([...selected, ...fieldsAddedInV4])] : selected);
  const localFields = ["country", "address", "city", "postalCode", "region", "phone"];
  const isCountryLocked = (locks) => localFields.some((key) => locks.includes(key));
  // Words usable in an e-mail or a username: no accents, spaces or punctuation.
  const ascii = (text) =>
    text
      .replace(/ı/g, "i")
      .replace(/ß/g, "ss")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  // English titles and words for the sex, also recognised in a title or gender select.
  const englishTitles = { female: ["Mrs", "Ms", "Miss", "Madam", "Female", "Woman", "F"], male: ["Mr", "Sir", "Male", "Man", "M"] };
  const titlesOf = (sheet, place) => (sheet.titles.female ? sheet.titles : sheet.titles[place?.language] || Object.values(sheet.titles)[0]);
  function genderOf(firstName) {
    for (const code of countries.codes()) {
      const { names } = countries.get(code);
      if (names.female.includes(firstName)) return "female";
      if (names.male.includes(firstName)) return "male";
    }
    return null;
  }
  function integer(max) {
    const range = 0x100000000;
    const limit = range - (range % max);
    const buffer = new Uint32Array(1);
    do {
      root.crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);
    return buffer[0] % max;
  }
  const pick = (items) => items[integer(items.length)];
  // Randomness handed to the country sheets.
  const rand = Object.freeze({
    integer,
    pick,
    digits: (n) => Array.from({ length: n }, () => integer(10)).join(""),
    letters: (n, alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") => Array.from({ length: n }, () => pick(alphabet)).join(""),
  });
  function validBirthDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + "T00:00:00Z");
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function generateBirthDate() {
    const now = new Date();
    const first = Date.UTC(now.getUTCFullYear() - 75, now.getUTCMonth(), now.getUTCDate());
    const last = Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate());
    return new Date(first + integer(Math.floor((last - first) / 86400000) + 1) * 86400000).toISOString().slice(0, 10);
  }
  function generatePassword() {
    const groups = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%*_-+"];
    const all = groups.join("");
    const chars = groups.map(pick);
    while (chars.length < 20) chars.push(pick(all));
    for (let i = chars.length - 1; i > 0; i--) {
      const j = integer(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
  }
  // Variants of `password` for a field that refuses it (maxlength, minlength, pattern), most similar first:
  // the same characters cut to length (keeping one of each kind), then letters and digits only.
  // Derived from the password only, so the same identity always gets the same variant.
  const PASSWORD_GROUPS = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
  function passwordVariants(password, { minLength = -1, maxLength = -1 } = {}) {
    const alnum = password.replace(/[^A-Za-z0-9]/g, (_, i) => String((i % 8) + 2));
    const out = [];
    for (const base of [password, alnum]) {
      let v = base;
      if (minLength > v.length) while (v.length < minLength) v += base;
      if (maxLength > 0 && v.length > maxLength) {
        v = v.slice(0, maxLength);
        // Put back a character of each kind the cut removed, over the last character whose kind is repeated.
        for (const group of PASSWORD_GROUPS) {
          if (group.test(v) || !group.test(base)) continue;
          const count = (g) => [...v].filter((ch) => g.test(ch)).length;
          const i = [...v].findLastIndex((ch) => PASSWORD_GROUPS.every((g) => !g.test(ch) || count(g) > 1));
          if (i < 0) break;
          v = v.slice(0, i) + [...base].find((ch) => group.test(ch)) + v.slice(i + 1);
        }
      } else if (minLength > base.length) v = v.slice(0, minLength);
      if (!out.includes(v)) out.push(v);
    }
    return out;
  }
  const banks = Object.freeze({
    bnp: "BNP Paribas",
    agricole: "Crédit Agricole",
    sg: "SG — Société Générale",
    mutuel: "Crédit Mutuel",
    postale: "La Banque Postale",
    populaire: "Banque Populaire",
    epargne: "Caisse d’Épargne",
  });
  // Small, explicitly sourced catalogue, checked 2026-10-20. Third-party attribution, not bank certification.
  const bankBins = Object.freeze(
    [
      { bankCode: "bnp", networkCode: "visa", bin: "406714", issuer: "BNP PARIBAS", source: "https://bincheck.org/france" },
      { bankCode: "agricole", networkCode: "visa", bin: "453304", issuer: "CREDIT AGRICOLE, S.A.", source: "https://bincheck.org/france" },
      { bankCode: "sg", networkCode: "visa", bin: "448539", issuer: "SOCIETE GENERALE, S.A.", source: "https://bincheck.org/france" },
      {
        bankCode: "mutuel",
        networkCode: "visa",
        bin: "497762",
        issuer: "CAISSE CENTRALE DE CREDIT MUTUEL",
        source: "https://bincheck.org/497762",
      },
      {
        bankCode: "mutuel",
        networkCode: "mastercard",
        bin: "513633",
        issuer: "BANQUE FEDERATIVE DU CREDIT MUTUEL (BFCM)",
        source: "https://bincheck.org/513633",
      },
      { bankCode: "postale", networkCode: "visa", bin: "415059", issuer: "LA BANQUE POSTALE", source: "https://bincheck.org/france" },
      {
        bankCode: "populaire",
        networkCode: "visa",
        bin: "448415",
        issuer: "NATEXIS BANQUES POPULAIRES",
        source: "https://bincheck.org/france",
      },
      {
        bankCode: "epargne",
        networkCode: "visa",
        bin: "455666",
        issuer: "CAISSE NATIONALE DES CAISSES D'EPARGNE (CNCE)",
        source: "https://bincheck.org/france?page=2",
      },
    ].map(Object.freeze),
  );
  function luhnValid(value) {
    return (
      typeof value === "string" &&
      /^\d{16}$/.test(value) &&
      [...value].reverse().reduce((sum, digit, index) => {
        let n = Number(digit);
        if (index % 2) {
          n *= 2;
          if (n > 9) n -= 9;
        }
        return sum + n;
      }, 0) %
        10 ===
        0
    );
  }
  function syntheticNumber(bin) {
    const prefix = bin + Array.from({ length: 9 }, () => integer(10)).join("");
    for (let check = 0; check < 10; check++) if (luhnValid(prefix + check)) return prefix + check;
    throw new Error("Invalid checksum");
  }
  // Published sandbox cards, not issuer BINs: https://docs.stripe.com/testing#cards
  const cardNetworks = Object.freeze({
    visa: { label: "Cartes Bancaires / Visa", number: "4000002500001001" },
    mastercard: { label: "Cartes Bancaires / Mastercard", number: "5555552500001001" },
  });
  function generateCard(bankMode = "random", networkMode = "random", holder = null, mode = "stripe") {
    const entries = bankBins.filter(
      (entry) => (bankMode === "random" || entry.bankCode === bankMode) && (networkMode === "random" || entry.networkCode === networkMode),
    );
    if (mode === "bank-bin" && !entries.length) return null;
    const entry = mode === "bank-bin" ? pick(entries) : null;
    const bankCode = entry?.bankCode || (Object.hasOwn(banks, bankMode) ? bankMode : pick(Object.keys(banks)));
    const networkCode = entry?.networkCode || (Object.hasOwn(cardNetworks, networkMode) ? networkMode : pick(Object.keys(cardNetworks)));
    const network = cardNetworks[networkCode];
    const expiryMonth = String(integer(12) + 1).padStart(2, "0");
    const expiryYear = String(new Date().getUTCFullYear() + 2 + integer(3));
    return {
      mode: entry ? "bank-bin" : "stripe",
      testOnly: true,
      sandbox: entry ? "None" : "Stripe",
      bankSimulated: true,
      bankCode,
      bank: banks[bankCode],
      countryCode: "FR",
      networkCode,
      network: entry ? (networkCode === "visa" ? "Visa" : "Mastercard") : network.label,
      number: entry ? syntheticNumber(entry.bin) : network.number,
      ...(entry ? { bin: entry.bin, binIssuer: entry.issuer, binSource: entry.source, binChecked: "2026-10-20" } : {}),
      holder: holder || generate().fullName,
      expiryMonth,
      expiryYear,
      expiry: `${expiryMonth}/${expiryYear.slice(-2)}`,
      cvc: String(integer(900) + 100),
    };
  }
  function isTestCard(card) {
    const entry = bankBins.find(
      (item) => item.bankCode === card?.bankCode && item.networkCode === card?.networkCode && item.bin === card?.bin,
    );
    const validNumber =
      card?.mode === "bank-bin"
        ? !!entry &&
          card.sandbox === "None" &&
          card.number?.startsWith(entry.bin) &&
          luhnValid(card.number) &&
          card.binIssuer === entry.issuer &&
          card.binSource === entry.source &&
          card.network === (entry.networkCode === "visa" ? "Visa" : "Mastercard")
        : (!card?.mode || card.mode === "stripe") &&
          card?.sandbox === "Stripe" &&
          card.number === cardNetworks[card.networkCode]?.number &&
          card.network === cardNetworks[card.networkCode]?.label;
    return (
      !!card &&
      card.testOnly === true &&
      card.bankSimulated === true &&
      validNumber &&
      Object.hasOwn(banks, card.bankCode) &&
      Object.hasOwn(cardNetworks, card.networkCode) &&
      card.bank === banks[card.bankCode] &&
      card.countryCode === "FR" &&
      typeof card.holder === "string" &&
      !!card.holder.trim() &&
      typeof card.expiryYear === "string" &&
      /^(0[1-9]|1[0-2])$/.test(card.expiryMonth) &&
      /^\d{4}$/.test(card.expiryYear) &&
      card.expiry === `${card.expiryMonth}/${card.expiryYear.slice(-2)}` &&
      /^\d{3}$/.test(card.cvc)
    );
  }
  function generate(countryMode = "random", previous = null, lockedFields = []) {
    const locks = new Set(lockedFields.filter((key) => Object.hasOwn(fields, key)));
    const token = Array.from(root.crypto.getRandomValues(new Uint8Array(5)), (n) => n.toString(16).padStart(2, "0")).join("");
    const codes = countries.codes();
    const keepCountry = previous && isCountryLocked([...locks]) && codes.includes(previous.countryCode);
    const countryCode = keepCountry ? previous.countryCode : codes.includes(countryMode) ? countryMode : pick(codes);
    const sheet = countries.get(countryCode);
    // The title follows the first name: a kept first name or title keeps its gender.
    const keptGender = previous && (locks.has("firstName") || locks.has("title")) ? previous.gender || genderOf(previous.firstName) : null;
    const gender = keptGender || pick(["female", "male"]);
    const firstName = pick(sheet.names[gender]),
      lastName = pick(sheet.names.last);
    const place = pick(sheet.places);
    // Multilingual countries keep street names and titles by language, each place naming its own.
    const streets = Array.isArray(sheet.streets) ? sheet.streets : sheet.streets[place.language];
    const titles = titlesOf(sheet, place);
    // A country without a range reserved for fiction gets a random number in its format (phoneReserved false).
    const phone = sheet.phone ? sheet.phone.generate(rand, place) : { national: "", phone: "" };
    const profile = {
      country: sheet.country,
      countryEnglish: sheet.countryEnglish,
      countryAliases: [...sheet.countryAliases],
      phoneCountryCode: sheet.phoneCountryCode,
      countryCode,
      gender,
      title: titles[gender][0],
      titleAliases: [...titles[gender], ...englishTitles[gender]],
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      company: `${pick(sheet.names.last)} ${pick(sheet.companySuffixes)}`,
      address: sheet.address(integer(150) + 1, pick(streets)),
      address2: pick(sheet.address2)
        .replace("#", () => String(integer(40) + 1))
        .replace("@", () => pick("ABCDEF")),
      city: place.city,
      region: place.region,
      regionCode: place.regionCode || "",
      postalCode: sheet.postalCode(place, rand),
      email: `${ascii(firstName)}.${ascii(lastName)}.${token}@example.com`,
      phone: phone.phone,
      phoneNational: phone.national,
      phoneReserved: !!sheet.phone?.reserved,
      birthDate: generateBirthDate(),
      password: generatePassword(),
    };
    if (previous) {
      for (const key of locks) if (typeof previous[key] === "string") profile[key] = previous[key];
      if (locks.has("title") && Array.isArray(previous.titleAliases)) profile.titleAliases = previous.titleAliases;
      // A kept town keeps its region.
      if (locks.has("city") && !locks.has("region") && typeof previous.region === "string") profile.region = previous.region;
      if ((locks.has("city") || locks.has("region")) && typeof previous.regionCode === "string") profile.regionCode = previous.regionCode;
      if (locks.has("phone")) {
        profile.phoneNational = previous.phoneNational;
        profile.phoneCountryCode = previous.phoneCountryCode;
        profile.phoneReserved = previous.phoneReserved !== false;
      }
    }
    profile.fullName = `${profile.firstName} ${profile.lastName}`;
    // The username follows the final name (kept values included).
    if (!locks.has("username") || typeof previous?.username !== "string") {
      const first = ascii(profile.firstName),
        last = ascii(profile.lastName);
      profile.username =
        pick([`${first}.${last}`, `${first}${last}`, `${first[0]}${last}`, `${first}_${last}`]).slice(0, 18) + String(integer(90) + 10);
    }
    profile.createdAt = Date.now(); // for automatic expiry (background.js)
    return profile;
  }
  // An identity saved by an older version, with the fields it lacks (title, region…) added.
  function complete(profile) {
    if (!profile || !countries.get(profile.countryCode)) return profile;
    const missing = ["gender", "title", "titleAliases", "username", "company", "address2", "region", "regionCode"].filter(
      (key) => profile[key] === undefined,
    );
    if (!missing.length) return profile;
    const fresh = generate(profile.countryCode, profile, ["firstName", "lastName", "city", "postalCode", "address"]);
    return { ...profile, ...Object.fromEntries(missing.map((key) => [key, fresh[key]])) };
  }
  root.ThrowawayGenerator = {
    generate,
    complete,
    upgradeSelection,
    generatePassword,
    passwordVariants,
    generateBirthDate,
    validBirthDate,
    fields,
    isCountryLocked,
    generateCard,
    isTestCard,
    banks,
    cardNetworks,
    bankBins,
    luhnValid,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.ThrowawayGenerator;
})(globalThis);
