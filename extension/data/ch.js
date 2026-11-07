// Switzerland. Real towns with their postcode and region, common street names and a random house number:
// the address is credible but never tied to the generated name.
AliasfillCountries.register({
  code: "CH",
  country: "Schweiz",
  countryEnglish: "Switzerland",
  countryAliases: ["CH", "CHE", "Switzerland", "Schweiz", "Suisse", "Svizzera", "Suiza", "Zwitserland"],
  phoneCountryCode: "+41",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Mia", "Emma", "Lina", "Mila", "Elena", "Sofia", "Lea", "Laura", "Chloé", "Léa", "Giulia", "Anna"],
    male: ["Noah", "Liam", "Luca", "Matteo", "Gabriel", "Leon", "Elias", "David", "Nathan", "Samuel", "Louis", "Jonas"],
    last: [
      "Müller",
      "Meier",
      "Schmid",
      "Keller",
      "Weber",
      "Huber",
      "Schneider",
      "Meyer",
      "Steiner",
      "Fischer",
      "Gerber",
      "Brunner",
      "Baumann",
      "Frei",
      "Zimmermann",
      "Moser",
      "Rochat",
      "Favre",
      "Bernasconi",
      "Rossi",
    ],
  },
  // Titles by language, first one shown; all of them are recognised in a form's title select.
  titles: {
    de: { female: ["Frau"], male: ["Herr"] },
    fr: { female: ["Mme", "Madame"], male: ["M.", "Monsieur"] },
    it: { female: ["Sig.ra", "Signora"], male: ["Sig.", "Signore"] },
  },
  companySuffixes: ["AG", "GmbH", "Sàrl", "SA"],
  // Second address line: # is a number, @ a letter.
  address2: ["Wohnung #", "Appartement #", "Postfach #"],
  // Street names by language; each place says which list it uses.
  streets: {
    de: ["Bahnhofstrasse", "Hauptstrasse", "Dorfstrasse", "Kirchweg", "Schulstrasse", "Gartenstrasse", "Seestrasse", "Industriestrasse"],
    fr: [
      "Rue de la Gare",
      "Avenue de la Gare",
      "Chemin des Vignes",
      "Rue du Lac",
      "Route de Berne",
      "Rue du Marché",
      "Chemin du Bois",
      "Grand-Rue",
    ],
    it: [
      "Via Cantonale",
      "Via Stazione",
      "Via San Gottardo",
      "Via Nassa",
      "Via Lugano",
      "Via ai Monti",
      "Piazza Indipendenza",
      "Via Cattedrale",
    ],
  },
  places: [
    { city: "Lausanne", region: "Vaud", regionCode: "VD", postal: "1003", language: "fr" },
    { city: "Genève", region: "Genève", regionCode: "GE", postal: "1201", language: "fr" },
    { city: "Fribourg", region: "Fribourg", regionCode: "FR", postal: "1700", language: "fr" },
    { city: "Bern", region: "Bern", regionCode: "BE", postal: "3011", language: "de" },
    { city: "Luzern", region: "Luzern", regionCode: "LU", postal: "6003", language: "de" },
    { city: "St. Gallen", region: "St. Gallen", regionCode: "SG", postal: "9000", language: "de" },
    { city: "Winterthur", region: "Zürich", regionCode: "ZH", postal: "8400", language: "de" },
    { city: "Basel", region: "Basel-Stadt", regionCode: "BS", postal: "4051", language: "de" },
    { city: "Chur", region: "Graubünden", regionCode: "GR", postal: "7000", language: "de" },
    { city: "Lugano", region: "Ticino", regionCode: "TI", postal: "6900", language: "it" },
  ],
  postalPattern: /^\d{4}$/,
  postalCode: (place) => place.postal,
  address: (number, street) => `${street} ${number}`,
  // No range reserved for fiction found at OFCOM/BAKOM (Swiss numbering plan) (checked 2026-11-07): the phone stays empty rather than
  // risk a real subscriber's number.
  phone: null,
});
