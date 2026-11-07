// Belgium. Real towns with their postcode and region, common street names and a random house number:
// the address is credible but never tied to the generated name.
// The region is the province, which address-level1 means in Belgium.
AliasfillCountries.register({
  code: "BE",
  country: "Belgique",
  countryEnglish: "Belgium",
  countryAliases: ["BE", "BEL", "Belgium", "Belgique", "België", "Belgien", "Bélgica", "Belgio"],
  phoneCountryCode: "+32",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Olivia", "Emma", "Louise", "Mila", "Alice", "Juliette", "Elena", "Marie", "Lina", "Camille", "Noor", "Lotte"],
    male: ["Noah", "Arthur", "Louis", "Liam", "Adam", "Jules", "Victor", "Lucas", "Gabriel", "Mathis", "Lars", "Wout"],
    last: [
      "Peeters",
      "Janssens",
      "Maes",
      "Jacobs",
      "Mertens",
      "Willems",
      "Claes",
      "Goossens",
      "Wouters",
      "De Smet",
      "Dubois",
      "Lambert",
      "Dupont",
      "Martin",
      "Simon",
      "Leclercq",
      "Laurent",
      "Lejeune",
      "Renard",
      "Hermans",
    ],
  },
  // Titles by language, first one shown; all of them are recognised in a form's title select.
  titles: { fr: { female: ["Mme", "Madame"], male: ["M.", "Monsieur"] }, nl: { female: ["Mevr.", "Mevrouw"], male: ["Dhr.", "De heer"] } },
  companySuffixes: ["SRL", "SA", "BV", "NV"],
  // Second address line: # is a number, @ a letter.
  address2: ["Boîte #", "Bus #"],
  // Street names by language; each place says which list it uses.
  streets: {
    fr: [
      "Rue de la Station",
      "Rue de l’Église",
      "Rue du Moulin",
      "Avenue des Tilleuls",
      "Rue Haute",
      "Chaussée de Bruxelles",
      "Place Saint-Lambert",
      "Rue des Écoles",
    ],
    nl: ["Kerkstraat", "Stationsstraat", "Molenstraat", "Schoolstraat", "Dorpsstraat", "Nieuwstraat", "Kapelstraat", "Grote Markt"],
  },
  places: [
    { city: "Namur", region: "Namur", regionCode: "WNA", postal: "5000", language: "fr" },
    { city: "Liège", region: "Liège", regionCode: "WLG", postal: "4000", language: "fr" },
    { city: "Mons", region: "Hainaut", regionCode: "WHT", postal: "7000", language: "fr" },
    { city: "Arlon", region: "Luxembourg", regionCode: "WLX", postal: "6700", language: "fr" },
    { city: "Bruxelles", region: "Région de Bruxelles-Capitale", regionCode: "BRU", postal: "1000", language: "fr" },
    { city: "Gent", region: "Oost-Vlaanderen", regionCode: "VOV", postal: "9000", language: "nl" },
    { city: "Brugge", region: "West-Vlaanderen", regionCode: "VWV", postal: "8000", language: "nl" },
    { city: "Leuven", region: "Vlaams-Brabant", regionCode: "VBR", postal: "3000", language: "nl" },
    { city: "Antwerpen", region: "Antwerpen", regionCode: "VAN", postal: "2000", language: "nl" },
    { city: "Hasselt", region: "Limburg", regionCode: "VLI", postal: "3500", language: "nl" },
  ],
  postalPattern: /^\d{4}$/,
  postalCode: (place) => place.postal,
  address: (number, street) => `${street} ${number}`,
  // No range reserved for fiction found at the BIPT (Belgian numbering plan) (checked 2026-11-07): the phone stays empty rather than
  // risk a real subscriber's number.
  phone: null,
});
