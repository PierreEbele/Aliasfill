// Italy. Real towns with their postcode and region, common street names and a random house number:
// the address is credible but never tied to the generated name.
// regionCode is the province's two-letter code, as Italian forms ask for the province.
AliasfillCountries.register({
  code: "IT",
  country: "Italia",
  countryEnglish: "Italy",
  countryAliases: ["IT", "ITA", "Italy", "Italia", "Italie", "Italien", "Italië"],
  phoneCountryCode: "+39",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Sofia", "Aurora", "Giulia", "Ginevra", "Alice", "Beatrice", "Emma", "Giorgia", "Chiara", "Martina", "Francesca", "Sara"],
    male: [
      "Leonardo",
      "Francesco",
      "Tommaso",
      "Edoardo",
      "Alessandro",
      "Lorenzo",
      "Mattia",
      "Gabriele",
      "Riccardo",
      "Andrea",
      "Marco",
      "Luca",
    ],
    last: [
      "Rossi",
      "Russo",
      "Ferrari",
      "Esposito",
      "Bianchi",
      "Romano",
      "Colombo",
      "Ricci",
      "Marino",
      "Greco",
      "Bruno",
      "Gallo",
      "Conti",
      "De Luca",
      "Mancini",
      "Costa",
      "Giordano",
      "Rizzo",
      "Lombardi",
      "Moretti",
    ],
  },
  // Titles, first one shown; all of them are recognised in a form's title select.
  titles: { female: ["Sig.ra"], male: ["Sig."] },
  companySuffixes: ["S.r.l.", "S.p.A.", "& C."],
  // Second address line: # is a number, @ a letter.
  address2: ["Scala @", "Interno #", "Piano #"],
  streets: [
    "Via Roma",
    "Via Garibaldi",
    "Via Mazzini",
    "Corso Italia",
    "Via Dante Alighieri",
    "Via Giuseppe Verdi",
    "Piazza della Repubblica",
    "Via Cavour",
    "Via Guglielmo Marconi",
    "Via XX Settembre",
    "Viale Europa",
    "Via San Francesco",
  ],
  places: [
    { city: "Bergamo", region: "Lombardia", regionCode: "BG", postal: "24121" },
    { city: "Verona", region: "Veneto", regionCode: "VR", postal: "37121" },
    { city: "Bologna", region: "Emilia-Romagna", regionCode: "BO", postal: "40121" },
    { city: "Firenze", region: "Toscana", regionCode: "FI", postal: "50122" },
    { city: "Perugia", region: "Umbria", regionCode: "PG", postal: "06121" },
    { city: "Bari", region: "Puglia", regionCode: "BA", postal: "70121" },
    { city: "Torino", region: "Piemonte", regionCode: "TO", postal: "10121" },
    { city: "Trento", region: "Trentino-Alto Adige", regionCode: "TN", postal: "38122" },
    { city: "Ancona", region: "Marche", regionCode: "AN", postal: "60121" },
    { city: "Palermo", region: "Sicilia", regionCode: "PA", postal: "90133" },
  ],
  postalPattern: /^\d{5}$/,
  postalCode: (place) => place.postal,
  address: (number, street) => `${street} ${number}`,
  phone: {
    // No range reserved for fiction found at AGCOM (Piano nazionale di numerazione) (checked 2026-11-07): random number in the
    // Italian mobile format, 3xx xxx xxxx. It is not reserved, so it may belong to a real subscriber.
    source: null,
    reserved: false,
    generate(rand) {
      const national =
        "3" + rand.pick(["20", "28", "29", "33", "35", "38", "40", "47", "48", "49", "66", "80", "88", "92"]) + rand.digits(7);
      return { national, phone: `+39 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}` };
    },
  },
});
