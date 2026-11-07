// Registry of country sheets: each data/<code>.js file registers one country, generator.js reads them from here.
// A new country = a new sheet, listed in `files` below and loaded with the others in manifest.json (background.scripts),
// service-worker.js and popup.html (tests/countries.test.ts checks that every list agrees).
(function (root) {
  "use strict";
  const sheets = {};
  root.AliasfillCountries = {
    files: ["data/fr.js", "data/gb.js", "data/us.js"],
    register(sheet) {
      sheets[sheet.code] = Object.freeze(sheet);
    },
    get: (code) => (Object.hasOwn(sheets, code) ? sheets[code] : null),
    codes: () => Object.keys(sheets),
  };
})(globalThis);
