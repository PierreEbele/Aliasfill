// Portugal. Real addresses (geoapi.pt, CTT postcodes, fetched 2026-11-07): full postcode, its street and house
// numbers from the postcode's range. The generated name is drawn on its own, so no address is tied to the people who
// live there.
AliasfillCountries.register({
  code: "PT",
  country: "Portugal",
  countryEnglish: "Portugal",
  countryAliases: ["PT", "PRT", "Portugal", "Portogallo", "Portugalia", "Portugál"],
  phoneCountryCode: "+351",
  // Common given names and surnames, not tied to anyone in particular.
  names: {
    female: ["Maria", "Leonor", "Matilde", "Beatriz", "Carolina", "Ana", "Mariana", "Inês", "Sofia", "Francisca", "Alice", "Margarida"],
    male: ["Francisco", "Santiago", "Afonso", "Tomás", "João", "Duarte", "Martim", "Rodrigo", "Lourenço", "Gabriel", "Miguel", "Pedro"],
    last: [
      "Silva",
      "Santos",
      "Ferreira",
      "Pereira",
      "Oliveira",
      "Costa",
      "Rodrigues",
      "Martins",
      "Jesus",
      "Sousa",
      "Fernandes",
      "Gonçalves",
      "Gomes",
      "Lopes",
      "Marques",
      "Alves",
      "Almeida",
      "Ribeiro",
      "Pinto",
      "Carvalho",
    ],
  },
  // Titles, first one shown; all of them are recognised in a form's title select.
  titles: { female: ["Sra.", "Senhora"], male: ["Sr.", "Senhor"] },
  companySuffixes: ["Lda.", "S.A.", "& Filhos"],
  // Second address line: # is a number, @ a letter.
  address2: ["#.º Esq.", "#.º Dto.", "R/C @"],
  streets: ["Rua Direita", "Rua da Liberdade", "Avenida da República", "Rua do Comércio", "Largo da Igreja", "Rua Nova"],
  places: [
    {
      city: "Lisboa",
      region: "Lisboa",
      postal: "1100",
      addresses: [
        { postal: "1100-223", street: "Rua Espírito Santo", numbers: [1, 3, 11, 17, 21, 27, 33, 37] },
        { postal: "1100-273", street: "Rua Guilherme Braga", numbers: [1, 5, 7, 9, 15, 19, 23, 29] },
        { postal: "1100-422", street: "Rua da Prata", numbers: [200, 210, 214, 218, 220, 226, 228, 234] },
        { postal: "1100-508", street: "Rua de Santo Estêvão", numbers: [20, 22, 24, 26, 28, 32, 36, 38] },
        { postal: "1100-133", street: "Rua dos Cavaleiros", numbers: [8, 20, 24, 48, 54, 58, 64, 86] },
        { postal: "1100-085", street: "Rua do Benformoso", numbers: [193, 197, 199, 205, 211, 219, 223, 229] },
      ],
    },
    {
      city: "Porto",
      region: "Porto",
      postal: "4000",
      addresses: [
        { postal: "4000-345", street: "Rua de Moreira", numbers: [32, 44, 146, 148, 150, 192, 236, 260] },
        { postal: "4000-463", street: "Rua de Santo Ildefonso", numbers: [22, 64, 74, 78, 88, 90, 94, 98] },
        { postal: "4000-067", street: "Avenida dos Aliados", numbers: [147, 195, 219, 235, 293, 303, 325, 327] },
        { postal: "4000-307", street: "Rua João Pedro Ribeiro", numbers: [647, 669, 687, 707, 709, 711, 715, 739] },
        { postal: "4000-487", street: "Rua de Santos Pousada", numbers: [545, 571, 583, 603, 607, 617, 619, 627] },
        { postal: "4000-214", street: "Rua Fernandes Tomás", numbers: [45, 49, 81, 83, 87, 107, 125, 149] },
      ],
    },
    {
      city: "Braga",
      region: "Braga",
      postal: "4700",
      addresses: [
        { postal: "4700-206", street: "Rua de Caires", numbers: [29, 63, 159, 179, 247, 257, 279, 295] },
        { postal: "4700-207", street: "Rua de Caires", numbers: [34, 86, 98, 114, 168, 210, 278, 296] },
        { postal: "4700-921", street: "Rua do Raio", numbers: [377, 379, 381, 383, 385, 387] },
        { postal: "4700-280", street: "Rua do Monte de Barral", numbers: [33, 49, 63, 85, 89, 127, 129, 149] },
      ],
    },
    {
      city: "Coimbra",
      region: "Coimbra",
      postal: "3000",
      addresses: [
        { postal: "3000-086", street: "Rua Brigadeiro Correia Cardoso", numbers: [67, 69, 73, 75, 79, 81, 91, 93] },
        { postal: "3000-003", street: "Rua Adelino Veiga", numbers: [11, 23, 29, 35, 39, 41, 47, 49] },
        { postal: "3000-072", street: "Rua Bernardo de Albuquerque", numbers: [5, 11, 55, 63, 65, 97, 99, 121] },
        { postal: "3000-002", street: "Rua Adelino Veiga", numbers: [4, 14, 18, 20, 38, 54, 60, 72] },
        { postal: "3000-389", street: "Rua da Sofia", numbers: [2, 14, 30, 72, 82, 92, 122, 136] },
        { postal: "3000-311", street: "Rua das Padeiras", numbers: [3, 5, 9, 15, 35, 53, 61, 63] },
      ],
    },
    {
      city: "Faro",
      region: "Faro",
      postal: "8000",
      addresses: [
        { postal: "8000-290", street: "Rua do Alportel", numbers: [159, 163, 167, 171, 175, 179, 185, 211] },
        { postal: "8000-346", street: "Rua Frederico Lécor", numbers: [20, 26, 28, 32, 38, 40, 42, 50] },
        { postal: "8000-282", street: "Rua de Santo António", numbers: [1, 13, 15, 17, 27, 53, 57, 63] },
        { postal: "8000-417", street: "Rua Rebelo da Silva", numbers: [3, 9, 15, 17, 39, 43, 57, 59] },
        { postal: "8000-222", street: "Rua Ataíde de Oliveira", numbers: [17, 25, 27, 33, 43, 51, 55, 61] },
        { postal: "8000-284", street: "Rua de Santo António", numbers: [75, 79, 91, 95, 97, 101, 125, 135] },
      ],
    },
    {
      city: "Aveiro",
      region: "Aveiro",
      postal: "3800",
      addresses: [
        { postal: "3800-228", street: "Avenida Europa", numbers: [455, 459, 461, 463, 465, 467, 469, 473] },
        { postal: "3800-165", street: "Avenida do Doutor Lourenço Peixinho", numbers: [57, 63, 79, 81, 83, 89, 95, 97] },
        { postal: "3800-104", street: "Rua Antónia Rodrigues", numbers: [85, 99, 101, 105, 107, 113, 121, 123] },
        { postal: "3800-160", street: "Avenida do Doutor Lourenço Peixinho", numbers: [126, 128, 134, 136, 142, 144, 154, 156] },
        { postal: "3800-214", street: "Rua de Manuel Luiz Nogueira", numbers: [8, 14, 18, 40, 64, 92, 96, 104] },
        { postal: "3800-128", street: "Rua do Carmo", numbers: [1, 19, 23, 31, 33, 35, 37, 43] },
      ],
    },
    {
      city: "Évora",
      region: "Évora",
      postal: "7000",
      addresses: [
        { postal: "7000-574", street: "Rua Avis", numbers: [123, 125, 129, 133, 141, 143, 147, 151] },
        { postal: "7000-591", street: "Rua Avis", numbers: [3, 43, 53, 71, 81, 85, 91, 101] },
        { postal: "7000-591", street: "Rua Avis", numbers: [24, 42, 44, 88, 96, 114, 118, 120] },
      ],
    },
    {
      city: "Funchal",
      region: "Madeira",
      postal: "9000",
      addresses: [
        { postal: "9000-122", street: "Levada dos Piornais", numbers: [63, 67, 69, 73, 75, 87, 89, 91] },
        { postal: "9000-236", street: "Estrada Monumental", numbers: [321, 323, 335, 343, 345, 371, 407, 427] },
        { postal: "9000-130", street: "Caminho Nazaré", numbers: [2, 4, 6, 8, 10, 12] },
        { postal: "9000-177", street: "Rua Maravilhas", numbers: [8, 56, 60, 64, 66, 102, 116, 122] },
        { postal: "9000-290", street: "Caminho Cova do Til", numbers: [60, 64, 68, 70, 74, 76, 78, 84] },
        { postal: "9000-122", street: "Levada dos Piornais", numbers: [4, 26, 38, 44, 48, 56, 68, 102] },
      ],
    },
    {
      city: "Setúbal",
      region: "Setúbal",
      postal: "2900",
      addresses: [
        { postal: "2900-179", street: "Rua Vasco da Gama", numbers: [30, 34, 42, 44, 52, 58, 66, 72] },
        { postal: "2900-536", street: "Estrada Palmela", numbers: [105, 119, 123, 125, 173, 175, 189, 193] },
        { postal: "2900-316", street: "Avenida dos Ciprestes", numbers: [86, 100, 114, 124, 128, 132, 134, 136] },
        { postal: "2900-166", street: "Rua Tenente Jean Raymond", numbers: [1, 3, 5, 7, 9, 11, 13, 15] },
        { postal: "2900-092", street: "Rua Frei António das Chagas", numbers: [17, 19, 21, 29, 39, 41, 45, 53] },
        { postal: "2900-309", street: "Avenida 5 de Outubro", numbers: [104, 106, 110, 128, 132, 136, 140, 142] },
      ],
    },
    {
      city: "Viseu",
      region: "Viseu",
      postal: "3500",
      addresses: [
        { postal: "3500-135", street: "Rua Formosa", numbers: [1, 5, 15, 25, 47, 49, 83, 89] },
        { postal: "3500-178", street: "Avenida Madre Rita Amada de Jesus", numbers: [179, 205, 219, 225, 237, 241, 247, 275] },
        { postal: "3500-134", street: "Rua Formosa", numbers: [2, 42, 50, 58, 62, 72, 90, 96] },
        { postal: "3500-111", street: "Rua Doutor Luís Ferreira", numbers: [13, 35, 47, 69, 75, 79, 85, 91] },
        { postal: "3500-206", street: "Rua Capitão Silva Pereira", numbers: [62, 66, 70, 80, 88, 92, 98, 100] },
        { postal: "3500-205", street: "Rua Capitão Silva Pereira", numbers: [2, 4, 6, 8, 10, 12, 18, 20] },
      ],
    },
  ],
  postalPattern: /^\d{4}-\d{3}$/,
  postalCode: (place, rand) => `${place.postal}-${rand.digits(3)}`,
  address: (number, street) => `${street}, ${number}`,
  phone: {
    // No range reserved for fiction found at ANACOM (checked 2026-11-07): random number in the Portuguese mobile
    // format, 9x xxx xxxx. It is not reserved, so it may belong to a real subscriber.
    source: null,
    reserved: false,
    generate(rand) {
      const national = "9" + rand.pick(["1", "2", "3", "6"]) + rand.digits(7);
      return { national, phone: `+351 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}` };
    },
  },
});
