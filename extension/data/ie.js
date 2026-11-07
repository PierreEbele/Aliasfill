// Ireland. Real towns with their county and Eircode routing key, common street names and a random house number.
// The second half of the Eircode is random (format only): it may not match a real address.
AliasfillCountries.register({
  code: "IE",
  country: "Ireland",
  countryEnglish: "Ireland",
  countryAliases: ["IE", "IRL", "Ireland", "Republic of Ireland", "Éire", "Irlande", "Irland", "Irlanda", "Ierland"],
  phoneCountryCode: "+353",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Grace", "Emily", "Fiadh", "Sophie", "Ava", "Lucy", "Aoife", "Ciara", "Saoirse", "Niamh", "Sarah", "Chloe"],
    male: ["Jack", "Noah", "James", "Conor", "Darragh", "Rían", "Oisín", "Cian", "Seán", "Liam", "Fionn", "Patrick"],
    last: [
      "Murphy",
      "Kelly",
      "O'Sullivan",
      "Walsh",
      "Smith",
      "O'Brien",
      "Byrne",
      "Ryan",
      "O'Connor",
      "O'Neill",
      "Reilly",
      "Doyle",
      "McCarthy",
      "Gallagher",
      "Doherty",
      "Kennedy",
      "Lynch",
      "Murray",
      "Quinn",
      "Moore",
    ],
  },
  // Titles, first one shown; all of them are recognised in a form's title select.
  titles: { female: ["Ms", "Mrs"], male: ["Mr"] },
  companySuffixes: ["Ltd", "DAC", "& Sons", "Teoranta"],
  // Second address line: # is a number, @ a letter.
  address2: ["Apartment #", "Unit #"],
  streets: [
    "Main Street",
    "Church Road",
    "Bridge Street",
    "Castle Street",
    "Green Road",
    "Mill Lane",
    "Patrick Street",
    "Strand Road",
    "College Road",
    "Abbey Street",
  ],
  places: [
    { city: "Dublin", region: "Dublin", postal: "D02" },
    { city: "Cork", region: "Cork", postal: "T12" },
    { city: "Galway", region: "Galway", postal: "H91" },
    { city: "Limerick", region: "Limerick", postal: "V94" },
    { city: "Waterford", region: "Waterford", postal: "X91" },
    { city: "Kilkenny", region: "Kilkenny", postal: "R95" },
    { city: "Sligo", region: "Sligo", postal: "F91" },
    { city: "Athlone", region: "Westmeath", postal: "N37" },
    { city: "Drogheda", region: "Louth", postal: "A92" },
    { city: "Tralee", region: "Kerry", postal: "V92" },
  ],
  postalPattern: /^[A-Z]\d{2} [0-9ACDEFHKNPRTVWXY]{4}$/,
  postalCode: (place, rand) => `${place.postal} ${rand.letters(4, "0123456789ACDEFHKNPRTVWXY")}`,
  address: (number, street) => `${number} ${street}`,
  phone: {
    // ComReg, Numbering Conditions of Use (June 2023): 089 011 0000 to 089 011 0999 reserved for drama use.
    source: "https://www.comreg.ie/industry/licensing/numbering",
    reserved: true,
    generate(rand) {
      const national = "0890110" + rand.digits(3);
      return { national, phone: `+353 89 011 0${national.slice(7)}` };
    },
  },
});
