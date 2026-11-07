// Austria. Real towns with their postcode and state, common street names and a random house number: the address
// is credible but never tied to the generated name.
AliasfillCountries.register({
  code: "AT",
  country: "Österreich",
  countryEnglish: "Austria",
  countryAliases: ["AT", "AUT", "Austria", "Österreich", "Autriche", "Oostenrijk"],
  phoneCountryCode: "+43",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Anna", "Emma", "Marie", "Lena", "Laura", "Hannah", "Sophia", "Lea", "Valentina", "Johanna", "Sarah", "Elena"],
    male: ["Paul", "Jakob", "David", "Maximilian", "Felix", "Elias", "Tobias", "Lukas", "Leon", "Jonas", "Simon", "Florian"],
    last: [
      "Gruber",
      "Huber",
      "Bauer",
      "Wagner",
      "Müller",
      "Pichler",
      "Steiner",
      "Moser",
      "Mayer",
      "Hofer",
      "Leitner",
      "Berger",
      "Fuchs",
      "Eder",
      "Fischer",
      "Schmid",
      "Winkler",
      "Weber",
      "Schwarz",
      "Maier",
    ],
  },
  // Titles, first one shown; all of them are recognised in a form's title select.
  titles: { female: ["Frau"], male: ["Herr"] },
  companySuffixes: ["GmbH", "OG", "KG", "e.U."],
  // Second address line: # is a number, @ a letter.
  address2: ["Top #", "Tür #", "Stiege @"],
  streets: [
    "Hauptstraße",
    "Bahnhofstraße",
    "Kirchengasse",
    "Schulgasse",
    "Lindengasse",
    "Mühlweg",
    "Feldgasse",
    "Gartengasse",
    "Hauptplatz",
    "Wiener Straße",
    "Bergstraße",
    "Dorfstraße",
  ],
  places: [
    { city: "Wien", region: "Wien", postal: ["1010", "1030", "1070", "1090"] },
    { city: "Graz", region: "Steiermark", postal: ["8010", "8020"] },
    { city: "Linz", region: "Oberösterreich", postal: ["4020"] },
    { city: "Salzburg", region: "Salzburg", postal: ["5020"] },
    { city: "Innsbruck", region: "Tirol", postal: ["6020"] },
    { city: "Klagenfurt am Wörthersee", region: "Kärnten", postal: ["9020"] },
    { city: "Villach", region: "Kärnten", postal: ["9500"] },
    { city: "Bregenz", region: "Vorarlberg", postal: ["6900"] },
    { city: "St. Pölten", region: "Niederösterreich", postal: ["3100"] },
    { city: "Eisenstadt", region: "Burgenland", postal: ["7000"] },
  ],
  postalPattern: /^\d{4}$/,
  postalCode: (place, rand) => rand.pick(place.postal),
  address: (number, street) => `${street} ${number}`,
  phone: {
    // No range reserved for fiction found at the RTR (checked 2026-11-07): random number in the Austrian mobile
    // format, 06xx xxxxxxx. It is not reserved, so it may belong to a real subscriber.
    source: null,
    reserved: false,
    generate(rand) {
      const national = "06" + rand.pick(["50", "60", "64", "76", "99"]) + rand.digits(7);
      return { national, phone: `+43 ${national.slice(1, 4)} ${national.slice(4)}` };
    },
  },
});
