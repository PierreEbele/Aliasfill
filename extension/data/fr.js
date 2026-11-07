// France. Real towns with their postcode and region, common street names and a random house number:
// the address is credible but never tied to the generated name.
AliasfillCountries.register({
  code: "FR",
  country: "France",
  countryEnglish: "France",
  countryAliases: ["FR", "FRA", "France", "République française", "French Republic", "Frankreich", "Francia", "Frankrijk"],
  phoneCountryCode: "+33",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Camille", "Léa", "Manon", "Chloé", "Inès", "Jade", "Louise", "Zoé", "Amina", "Juliette", "Emma", "Sarah"],
    male: ["Lucas", "Hugo", "Théo", "Nathan", "Louis", "Gabriel", "Arthur", "Jules", "Yanis", "Sofiane", "Clément", "Antoine"],
    last: [
      "Martin",
      "Bernard",
      "Dubois",
      "Thomas",
      "Robert",
      "Richard",
      "Petit",
      "Durand",
      "Leroy",
      "Moreau",
      "Simon",
      "Laurent",
      "Lefebvre",
      "Michel",
      "Garcia",
      "Fournier",
      "Girard",
      "Bonnet",
      "Mercier",
      "Benali",
    ],
  },
  streets: [
    "rue des Tilleuls",
    "rue de la Fontaine",
    "avenue des Acacias",
    "rue du Moulin",
    "chemin des Vignes",
    "rue Victor-Hugo",
    "allée des Peupliers",
    "rue de l’Église",
    "boulevard Pasteur",
    "impasse des Lilas",
    "rue des Écoles",
    "place du Marché",
  ],
  places: [
    { city: "Amiens", region: "Hauts-de-France", regionCode: "HDF", postal: "80000" },
    { city: "Albi", region: "Occitanie", regionCode: "OCC", postal: "81000" },
    { city: "Niort", region: "Nouvelle-Aquitaine", regionCode: "NAQ", postal: "79000" },
    { city: "Auxerre", region: "Bourgogne-Franche-Comté", regionCode: "BFC", postal: "89000" },
    { city: "Quimper", region: "Bretagne", regionCode: "BRE", postal: "29000" },
    { city: "Orléans", region: "Centre-Val de Loire", regionCode: "CVL", postal: "45000" },
    { city: "Grenoble", region: "Auvergne-Rhône-Alpes", regionCode: "ARA", postal: "38000" },
    { city: "Versailles", region: "Île-de-France", regionCode: "IDF", postal: "78000" },
    { city: "Toulon", region: "Provence-Alpes-Côte d’Azur", regionCode: "PAC", postal: "83000" },
    { city: "Metz", region: "Grand Est", regionCode: "GES", postal: "57000" },
  ],
  postalPattern: /^\d{5}$/,
  postalCode: (place) => place.postal,
  address: (number, street) => `${number} ${street}`,
  phone: {
    // Audiovisual block reserved by ARCEP, decision 2025-2215, §2.5.12: 06 39 98 00 00 to 06 39 98 99 99.
    source: "ARCEP decision 2025-2215, §2.5.12",
    generate(rand) {
      const national = "063998" + rand.digits(4);
      return { national, phone: `+33 6 ${national.slice(2).match(/\d{2}/g).join(" ")}` };
    },
  },
});
