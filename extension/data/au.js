// Australia. Real towns with their postcode and state, common street names and a random house number: the address
// is credible but never tied to the generated name.
AliasfillCountries.register({
  code: "AU",
  country: "Australia",
  countryEnglish: "Australia",
  countryAliases: ["AU", "AUS", "Australia", "Australie", "Australien", "Australië"],
  phoneCountryCode: "+61",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Charlotte", "Olivia", "Amelia", "Isla", "Mia", "Ava", "Grace", "Willow", "Harper", "Chloe", "Ruby", "Zoe"],
    male: ["Oliver", "Noah", "Jack", "Henry", "Leo", "William", "Thomas", "Charlie", "Lucas", "Hudson", "Isaac", "Lachlan"],
    last: [
      "Smith",
      "Jones",
      "Williams",
      "Brown",
      "Wilson",
      "Taylor",
      "Johnson",
      "White",
      "Martin",
      "Anderson",
      "Thompson",
      "Nguyen",
      "Thomas",
      "Walker",
      "Harris",
      "Lee",
      "Ryan",
      "Robinson",
      "Kelly",
      "King",
    ],
  },
  // Titles, first one shown; all of them are recognised in a form's title select.
  titles: { female: ["Ms", "Mrs"], male: ["Mr"] },
  companySuffixes: ["Pty Ltd", "& Co", "Group"],
  // Second address line: # is a number, @ a letter.
  address2: ["Unit #", "Apartment #", "Level #"],
  streets: [
    "George Street",
    "King Street",
    "High Street",
    "Victoria Street",
    "Church Street",
    "Station Street",
    "Railway Parade",
    "Beach Road",
    "Park Road",
    "Queen Street",
    "Bay Street",
    "Ocean View Drive",
  ],
  places: [
    { city: "Sydney", region: "New South Wales", regionCode: "NSW", postal: "2000", areaCode: "2" },
    { city: "Newcastle", region: "New South Wales", regionCode: "NSW", postal: "2300", areaCode: "2" },
    { city: "Canberra", region: "Australian Capital Territory", regionCode: "ACT", postal: "2601", areaCode: "2" },
    { city: "Melbourne", region: "Victoria", regionCode: "VIC", postal: "3000", areaCode: "3" },
    { city: "Geelong", region: "Victoria", regionCode: "VIC", postal: "3220", areaCode: "3" },
    { city: "Hobart", region: "Tasmania", regionCode: "TAS", postal: "7000", areaCode: "3" },
    { city: "Brisbane", region: "Queensland", regionCode: "QLD", postal: "4000", areaCode: "7" },
    { city: "Cairns", region: "Queensland", regionCode: "QLD", postal: "4870", areaCode: "7" },
    { city: "Adelaide", region: "South Australia", regionCode: "SA", postal: "5000", areaCode: "8" },
    { city: "Perth", region: "Western Australia", regionCode: "WA", postal: "6000", areaCode: "8" },
    { city: "Darwin", region: "Northern Territory", regionCode: "NT", postal: "0800", areaCode: "8" },
  ],
  postalPattern: /^\d{4}$/,
  postalCode: (place) => place.postal,
  address: (number, street) => `${number} ${street}`,
  phone: {
    // ACMA, numbers for TV shows, films and creative works: (0X) 5550 xxxx in each geographic area.
    source: "https://www.acma.gov.au/phone-numbers-use-tv-shows-films-and-creative-works",
    reserved: true,
    generate(rand, place) {
      const national = `0${place.areaCode}5550${rand.digits(4)}`;
      return { national, phone: `+61 ${place.areaCode} 5550 ${national.slice(6)}` };
    },
  },
});
