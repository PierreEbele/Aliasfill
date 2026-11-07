// United Kingdom. Real towns with real full postcodes (postcodes.io, ONS Postcode Directory, fetched 2026-11-07) and
// their county, common street names and a random house number: the address is credible but never tied to the
// generated name.
AliasfillCountries.register({
  code: "GB",
  country: "United Kingdom",
  countryEnglish: "United Kingdom",
  countryAliases: [
    "GB",
    "GBR",
    "UK",
    "United Kingdom",
    "Great Britain",
    "Royaume-Uni",
    "Vereinigtes Königreich",
    "Reino Unido",
    "Regno Unito",
  ],
  phoneCountryCode: "+44",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Olivia", "Amelia", "Isla", "Ava", "Freya", "Lily", "Grace", "Poppy", "Priya", "Aisha", "Emily", "Sophie"],
    male: ["Oliver", "George", "Harry", "Noah", "Jack", "Leo", "Arthur", "Oscar", "Alfie", "Freddie", "Thomas", "Mohammed"],
    last: [
      "Smith",
      "Jones",
      "Taylor",
      "Brown",
      "Williams",
      "Wilson",
      "Johnson",
      "Davies",
      "Patel",
      "Wright",
      "Robinson",
      "Thompson",
      "Evans",
      "Walker",
      "White",
      "Roberts",
      "Green",
      "Hall",
      "Wood",
      "Khan",
    ],
  },
  // Titles, first one shown; all of them are recognised in a form's title select.
  titles: { female: ["Ms", "Mrs", "Miss"], male: ["Mr"] },
  companySuffixes: ["Ltd", "& Co", "Consulting Ltd", "Group"],
  // Second address line: # is a number, @ a letter.
  address2: ["Flat #", "Apartment #", "Unit #"],
  streets: [
    "High Street",
    "Station Road",
    "Church Lane",
    "Victoria Road",
    "Mill Lane",
    "Park Avenue",
    "The Crescent",
    "Queen's Road",
    "Manor Close",
    "Orchard Way",
    "Green Lane",
    "Kingsway",
  ],
  places: [
    { city: "York", region: "North Yorkshire", postal: ["YO1 6BZ", "YO1 6HB", "YO1 6JH", "YO1 7LP", "YO1 8AZ", "YO1 9WZ"] },
    { city: "Norwich", region: "Norfolk", postal: ["NR1 2JX", "NR1 2UF", "NR1 3AD", "NR1 4AU", "NR1 4DD", "NR1 4JR"] },
    { city: "Exeter", region: "Devon", postal: ["EX1 2TT", "EX1 3DN", "EX1 3FN", "EX1 3NA", "EX1 3NR", "EX1 9SJ"] },
    { city: "Carlisle", region: "Cumbria", postal: ["CA1 2JN", "CA1 3AT", "CA1 3AZ", "CA1 3BU", "CA1 3EB", "CA1 3HD"] },
    { city: "Preston", region: "Lancashire", postal: ["PR1 1QJ", "PR1 4PQ", "PR1 5LX", "PR1 5NZ", "PR1 5YS", "PR1 7PX"] },
    { city: "Maidstone", region: "Kent", postal: ["ME14 1GY", "ME14 3HS", "ME14 3JN", "ME14 4DP", "ME14 4QD", "ME14 5RH"] },
    { city: "Swindon", region: "Wiltshire", postal: ["SN1 2EU", "SN1 3DF", "SN1 3FJ", "SN1 3LH", "SN1 3RT", "SN1 7BX"] },
    { city: "Hexham", region: "Northumberland", postal: ["NE46 1BS", "NE46 1DE", "NE46 1UG", "NE46 2HA", "NE46 3JB", "NE46 4HJ"] },
    { city: "Perth", region: "Perth and Kinross", postal: ["PH1 1EX", "PH1 1QT", "PH1 1SG", "PH1 3UX", "PH1 3ZZ", "PH1 5NA"] },
    { city: "Bangor", region: "Gwynedd", postal: ["LL57 1HE", "LL57 2AL", "LL57 2DW", "LL57 2LH", "LL57 2PH", "LL57 4SA"] },
  ],
  postalPattern: /^[A-Z]{1,2}\d{1,2} \d[ABD-HJLNP-UW-Z]{2}$/,
  postalCode: (place, rand) => rand.pick(place.postal),
  address: (number, street) => `${number} ${street}`,
  phone: {
    reserved: true,
    // Ofcom, numbers reserved for drama purposes: 07700 900000 to 07700 900999.
    source: "https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama",
    generate(rand) {
      const national = "07700900" + rand.digits(3);
      return { national, phone: `+44 ${national.slice(1, 5)} ${national.slice(5)}` };
    },
  },
});
