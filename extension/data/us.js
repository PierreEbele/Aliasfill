// United States. Real cities with their ZIP codes, state and area code, common street names and a random
// house number: the address is credible but never tied to the generated name.
AliasfillCountries.register({
  code: "US",
  country: "United States",
  countryEnglish: "United States",
  countryAliases: [
    "US",
    "USA",
    "United States",
    "United States of America",
    "États-Unis",
    "Etats Unis",
    "Vereinigte Staaten",
    "Estados Unidos",
    "Stati Uniti",
  ],
  phoneCountryCode: "+1",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Emma", "Olivia", "Ava", "Sophia", "Mia", "Harper", "Evelyn", "Abigail", "Maya", "Madison", "Chloe", "Grace"],
    male: ["Liam", "Noah", "James", "Elijah", "Benjamin", "Lucas", "Mason", "Ethan", "Mateo", "Daniel", "Jayden", "Owen"],
    last: [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Hernandez",
      "Lopez",
      "Wilson",
      "Anderson",
      "Thomas",
      "Taylor",
      "Moore",
      "Jackson",
      "Lee",
      "Nguyen",
    ],
  },
  // Titles, first one shown; all of them are recognised in a form's title select.
  titles: { female: ["Ms.", "Mrs."], male: ["Mr."] },
  companySuffixes: ["LLC", "Inc.", "& Co.", "Group"],
  // Second address line: # is a number, @ a letter.
  address2: ["Apt #", "Suite #", "Unit #"],
  streets: [
    "Maple Avenue",
    "Oak Street",
    "Pine Street",
    "Cedar Lane",
    "Elm Street",
    "Washington Avenue",
    "Lakeview Drive",
    "Hillcrest Road",
    "Sunset Boulevard",
    "Willow Court",
    "Park Place",
    "Ridge Road",
  ],
  places: [
    { city: "Cleveland", region: "Ohio", regionCode: "OH", postal: ["44102", "44113", "44114"], areaCode: "216" },
    { city: "Portland", region: "Oregon", regionCode: "OR", postal: ["97201", "97205", "97209"], areaCode: "503" },
    { city: "Austin", region: "Texas", regionCode: "TX", postal: ["78701", "78702", "78704"], areaCode: "512" },
    { city: "Portland", region: "Maine", regionCode: "ME", postal: ["04101", "04102", "04103"], areaCode: "207" },
    { city: "Phoenix", region: "Arizona", regionCode: "AZ", postal: ["85003", "85004", "85006"], areaCode: "602" },
    { city: "Atlanta", region: "Georgia", regionCode: "GA", postal: ["30303", "30305", "30308"], areaCode: "404" },
    { city: "Minneapolis", region: "Minnesota", regionCode: "MN", postal: ["55401", "55403", "55408"], areaCode: "612" },
    { city: "Denver", region: "Colorado", regionCode: "CO", postal: ["80202", "80203", "80205"], areaCode: "303" },
    { city: "Raleigh", region: "North Carolina", regionCode: "NC", postal: ["27601", "27603", "27605"], areaCode: "919" },
    { city: "Chicago", region: "Illinois", regionCode: "IL", postal: ["60601", "60614", "60657"], areaCode: "312" },
  ],
  postalPattern: /^\d{5}$/,
  postalCode: (place, rand) => rand.pick(place.postal),
  address: (number, street) => `${number} ${street}`,
  phone: {
    // NANPA: 555-0100 to 555-0199 stay reserved for fictitious use, in every area code.
    source: "https://nanpa.com/numbering/555-line-numbers",
    generate(rand, place) {
      const line = "01" + rand.digits(2);
      return { national: `${place.areaCode}555${line}`, phone: `+1 ${place.areaCode} 555 ${line}` };
    },
  },
});
