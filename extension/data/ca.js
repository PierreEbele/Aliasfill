// Canada. Real towns with their postcode and region, common street names and a random house number:
// the address is credible but never tied to the generated name.
AliasfillCountries.register({
  code: "CA",
  country: "Canada",
  countryEnglish: "Canada",
  countryAliases: ["CA", "CAN", "Canada", "Kanada", "Canadá"],
  phoneCountryCode: "+1",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Olivia", "Emma", "Charlotte", "Amelia", "Sophia", "Chloé", "Léa", "Florence", "Maya", "Ava", "Alice", "Zoé"],
    male: ["Noah", "Liam", "William", "Thomas", "Benjamin", "Lucas", "Jacob", "Logan", "Félix", "Nathan", "Ethan", "Owen"],
    last: [
      "Smith",
      "Tremblay",
      "Brown",
      "Roy",
      "Wilson",
      "Gagnon",
      "Martin",
      "Côté",
      "Taylor",
      "Bouchard",
      "Campbell",
      "Gauthier",
      "Lee",
      "Morin",
      "Anderson",
      "Lavoie",
      "Thompson",
      "Pelletier",
      "Singh",
      "Wong",
    ],
  },
  // Street names by language; each place says which list it uses.
  streets: {
    en: ["Main Street", "King Street", "Queen Street", "Maple Avenue", "Church Street", "Victoria Street", "Park Avenue", "Elm Street"],
    fr: [
      "rue Principale",
      "rue Saint-Jean",
      "rue de l’Église",
      "boulevard Saint-Laurent",
      "rue Notre-Dame",
      "avenue du Parc",
      "rue des Érables",
      "chemin du Roy",
    ],
  },
  places: [
    { city: "Toronto", region: "Ontario", regionCode: "ON", postal: ["M5V", "M4C", "M6G"], areaCode: "416", language: "en" },
    { city: "Ottawa", region: "Ontario", regionCode: "ON", postal: ["K1P", "K1N", "K2P"], areaCode: "613", language: "en" },
    { city: "Montréal", region: "Québec", regionCode: "QC", postal: ["H2X", "H2T", "H3H"], areaCode: "514", language: "fr" },
    { city: "Québec", region: "Québec", regionCode: "QC", postal: ["G1R", "G1K", "G1S"], areaCode: "418", language: "fr" },
    { city: "Vancouver", region: "British Columbia", regionCode: "BC", postal: ["V6B", "V5K", "V6K"], areaCode: "604", language: "en" },
    { city: "Victoria", region: "British Columbia", regionCode: "BC", postal: ["V8W", "V8V", "V9A"], areaCode: "250", language: "en" },
    { city: "Calgary", region: "Alberta", regionCode: "AB", postal: ["T2P", "T2R", "T3A"], areaCode: "403", language: "en" },
    { city: "Edmonton", region: "Alberta", regionCode: "AB", postal: ["T5J", "T5K", "T6E"], areaCode: "780", language: "en" },
    { city: "Winnipeg", region: "Manitoba", regionCode: "MB", postal: ["R3C", "R3B", "R2M"], areaCode: "204", language: "en" },
    { city: "Halifax", region: "Nova Scotia", regionCode: "NS", postal: ["B3H", "B3J", "B3K"], areaCode: "902", language: "en" },
  ],
  postalPattern: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
  postalCode: (place, rand) => `${rand.pick(place.postal)} ${rand.digits(1)}${rand.letters(1, "ABCEGHJKLMNPRSTVWXYZ")}${rand.digits(1)}`,
  address: (number, street) => `${number} ${street}`,
  phone: {
    // NANPA (which covers Canada): 555-0100 to 555-0199 stay reserved for fictitious use, in every area code.
    source: "https://nanpa.com/numbering/555-line-numbers",
    generate(rand, place) {
      const line = "01" + rand.digits(2);
      return { national: `${place.areaCode}555${line}`, phone: `+1 ${place.areaCode} 555 ${line}` };
    },
  },
});
