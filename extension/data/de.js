// Germany. Real towns with their postcode and region, common street names and a random house number:
// the address is credible but never tied to the generated name.
AliasfillCountries.register({
  code: "DE",
  country: "Deutschland",
  countryEnglish: "Germany",
  countryAliases: ["DE", "DEU", "Germany", "Deutschland", "Allemagne", "Alemania", "Germania", "Duitsland"],
  phoneCountryCode: "+49",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Emma", "Mia", "Hannah", "Sofia", "Lea", "Lena", "Anna", "Laura", "Julia", "Marie", "Lina", "Clara"],
    male: ["Noah", "Ben", "Paul", "Leon", "Finn", "Elias", "Jonas", "Felix", "Lukas", "Maximilian", "Tim", "Jan"],
    last: [
      "Müller",
      "Schmidt",
      "Schneider",
      "Fischer",
      "Weber",
      "Meyer",
      "Wagner",
      "Becker",
      "Schulz",
      "Hoffmann",
      "Koch",
      "Richter",
      "Bauer",
      "Klein",
      "Wolf",
      "Schröder",
      "Neumann",
      "Schwarz",
      "Zimmermann",
      "Yılmaz",
    ],
  },
  // Titles, first one shown; all of them are recognised in a form's title select.
  titles: { female: ["Frau"], male: ["Herr"] },
  companySuffixes: ["GmbH", "KG", "& Partner", "UG"],
  // Second address line: # is a number, @ a letter.
  address2: ["Wohnung #", "Hinterhaus", "#. OG"],
  streets: [
    "Hauptstraße",
    "Schulstraße",
    "Gartenstraße",
    "Bahnhofstraße",
    "Dorfstraße",
    "Bergstraße",
    "Birkenweg",
    "Lindenstraße",
    "Kirchstraße",
    "Waldstraße",
    "Ringstraße",
    "Am Markt",
  ],
  places: [
    { city: "Freiburg im Breisgau", region: "Baden-Württemberg", regionCode: "BW", postal: ["79098", "79102", "79104"] },
    { city: "Regensburg", region: "Bayern", regionCode: "BY", postal: ["93047", "93049", "93053"] },
    { city: "Potsdam", region: "Brandenburg", regionCode: "BB", postal: ["14467", "14469", "14471"] },
    { city: "Kassel", region: "Hessen", regionCode: "HE", postal: ["34117", "34119", "34121"] },
    { city: "Lübeck", region: "Schleswig-Holstein", regionCode: "SH", postal: ["23552", "23554", "23558"] },
    { city: "Münster", region: "Nordrhein-Westfalen", regionCode: "NW", postal: ["48143", "48145", "48147"] },
    { city: "Leipzig", region: "Sachsen", regionCode: "SN", postal: ["04109", "04103", "04107"] },
    { city: "Mainz", region: "Rheinland-Pfalz", regionCode: "RP", postal: ["55116", "55118", "55122"] },
    { city: "Rostock", region: "Mecklenburg-Vorpommern", regionCode: "MV", postal: ["18055", "18057", "18059"] },
    { city: "Hannover", region: "Niedersachsen", regionCode: "NI", postal: ["30159", "30161", "30163"] },
  ],
  postalPattern: /^\d{5}$/,
  postalCode: (place, rand) => rand.pick(place.postal),
  address: (number, street) => `${street} ${number}`,
  phone: {
    reserved: true,
    // Bundesnetzagentur "Drama Numbers" (Rufnummern für Medienproduktionen), mobile blocks made available by the
    // network operators: 0171 39200 00 to 99 and 0176 040690 00 to 99.
    source: "https://www.bundesnetzagentur.de/DE/Fachthemen/Telekommunikation/Nummerierung/DramaNumbers/artikel.html",
    generate(rand) {
      const national = rand.pick(["017139200", "017604069"]) + rand.digits(2);
      return { national, phone: `+49 ${national.slice(1, 4)} ${national.slice(4)}` };
    },
  },
});
