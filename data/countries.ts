// Base de datos de países del mundo
// Datos actualizados 2024 - 195 países reconocidos por la ONU
// Códigos ISO 3166-1 alpha-2 para banderas (flag-icons)

export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2 (para flag-icons)
  capital: string;
  continent: string;
  population: number; // en millones
  area: number; // en km²
  currency: string;
  currencySymbol: string;
  language: string;
  phoneCode: string;
  timezone: string; // Huso horario principal (UTC±X)
  tld: string; // Dominio de internet de nivel superior
}

export const countries: Country[] = [
  // EUROPA (44 países)
  { name: "Alemania", code: "de", capital: "Berlín", continent: "Europa", population: 83.2, area: 357386, currency: "Euro", currencySymbol: "€", language: "Alemán", phoneCode: "+49", timezone: "UTC+1", tld: ".de" },
  { name: "Albania", code: "al", capital: "Tirana", continent: "Europa", population: 2.8, area: 28748, currency: "Lek", currencySymbol: "L", language: "Albanés", phoneCode: "+355", timezone: "UTC+1", tld: ".al" },
  { name: "Andorra", code: "ad", capital: "Andorra la Vella", continent: "Europa", population: 0.08, area: 468, currency: "Euro", currencySymbol: "€", language: "Catalán", phoneCode: "+376", timezone: "UTC+1", tld: ".ad" },
  { name: "Austria", code: "at", capital: "Viena", continent: "Europa", population: 9.0, area: 83879, currency: "Euro", currencySymbol: "€", language: "Alemán", phoneCode: "+43", timezone: "UTC+1", tld: ".at" },
  { name: "Bélgica", code: "be", capital: "Bruselas", continent: "Europa", population: 11.5, area: 30528, currency: "Euro", currencySymbol: "€", language: "Neerlandés/Francés", phoneCode: "+32", timezone: "UTC+1", tld: ".be" },
  { name: "Bielorrusia", code: "by", capital: "Minsk", continent: "Europa", population: 9.4, area: 207600, currency: "Rublo bielorruso", currencySymbol: "Br", language: "Bielorruso/Ruso", phoneCode: "+375", timezone: "UTC+3", tld: ".by" },
  { name: "Bosnia y Herzegovina", code: "ba", capital: "Sarajevo", continent: "Europa", population: 3.3, area: 51197, currency: "Marco convertible", currencySymbol: "KM", language: "Bosnio/Croata/Serbio", phoneCode: "+387", timezone: "UTC+1", tld: ".ba" },
  { name: "Bulgaria", code: "bg", capital: "Sofía", continent: "Europa", population: 6.9, area: 110879, currency: "Lev", currencySymbol: "лв", language: "Búlgaro", phoneCode: "+359", timezone: "UTC+2", tld: ".bg" },
  { name: "Chipre", code: "cy", capital: "Nicosia", continent: "Europa", population: 1.2, area: 9251, currency: "Euro", currencySymbol: "€", language: "Griego/Turco", phoneCode: "+357", timezone: "UTC+2", tld: ".cy" },
  { name: "Croacia", code: "hr", capital: "Zagreb", continent: "Europa", population: 4.0, area: 56594, currency: "Euro", currencySymbol: "€", language: "Croata", phoneCode: "+385", timezone: "UTC+1", tld: ".hr" },
  { name: "Dinamarca", code: "dk", capital: "Copenhague", continent: "Europa", population: 5.8, area: 43094, currency: "Corona danesa", currencySymbol: "kr", language: "Danés", phoneCode: "+45", timezone: "UTC+1", tld: ".dk" },
  { name: "Eslovaquia", code: "sk", capital: "Bratislava", continent: "Europa", population: 5.4, area: 49035, currency: "Euro", currencySymbol: "€", language: "Eslovaco", phoneCode: "+421", timezone: "UTC+1", tld: ".sk" },
  { name: "Eslovenia", code: "si", capital: "Liubliana", continent: "Europa", population: 2.1, area: 20273, currency: "Euro", currencySymbol: "€", language: "Esloveno", phoneCode: "+386", timezone: "UTC+1", tld: ".si" },
  { name: "España", code: "es", capital: "Madrid", continent: "Europa", population: 47.4, area: 505990, currency: "Euro", currencySymbol: "€", language: "Español", phoneCode: "+34", timezone: "UTC+1", tld: ".es" },
  { name: "Estonia", code: "ee", capital: "Tallin", continent: "Europa", population: 1.3, area: 45228, currency: "Euro", currencySymbol: "€", language: "Estonio", phoneCode: "+372", timezone: "UTC+2", tld: ".ee" },
  { name: "Finlandia", code: "fi", capital: "Helsinki", continent: "Europa", population: 5.5, area: 338424, currency: "Euro", currencySymbol: "€", language: "Finés/Sueco", phoneCode: "+358", timezone: "UTC+2", tld: ".fi" },
  { name: "Francia", code: "fr", capital: "París", continent: "Europa", population: 67.4, area: 643801, currency: "Euro", currencySymbol: "€", language: "Francés", phoneCode: "+33", timezone: "UTC+1", tld: ".fr" },
  { name: "Grecia", code: "gr", capital: "Atenas", continent: "Europa", population: 10.4, area: 131957, currency: "Euro", currencySymbol: "€", language: "Griego", phoneCode: "+30", timezone: "UTC+2", tld: ".gr" },
  { name: "Hungría", code: "hu", capital: "Budapest", continent: "Europa", population: 9.7, area: 93028, currency: "Forinto", currencySymbol: "Ft", language: "Húngaro", phoneCode: "+36", timezone: "UTC+1", tld: ".hu" },
  { name: "Irlanda", code: "ie", capital: "Dublín", continent: "Europa", population: 5.0, area: 70273, currency: "Euro", currencySymbol: "€", language: "Inglés/Irlandés", phoneCode: "+353", timezone: "UTC+0", tld: ".ie" },
  { name: "Islandia", code: "is", capital: "Reikiavik", continent: "Europa", population: 0.37, area: 103000, currency: "Corona islandesa", currencySymbol: "kr", language: "Islandés", phoneCode: "+354", timezone: "UTC+0", tld: ".is" },
  { name: "Italia", code: "it", capital: "Roma", continent: "Europa", population: 59.1, area: 301340, currency: "Euro", currencySymbol: "€", language: "Italiano", phoneCode: "+39", timezone: "UTC+1", tld: ".it" },
  { name: "Letonia", code: "lv", capital: "Riga", continent: "Europa", population: 1.9, area: 64589, currency: "Euro", currencySymbol: "€", language: "Letón", phoneCode: "+371", timezone: "UTC+2", tld: ".lv" },
  { name: "Liechtenstein", code: "li", capital: "Vaduz", continent: "Europa", population: 0.04, area: 160, currency: "Franco suizo", currencySymbol: "CHF", language: "Alemán", phoneCode: "+423", timezone: "UTC+1", tld: ".li" },
  { name: "Lituania", code: "lt", capital: "Vilna", continent: "Europa", population: 2.8, area: 65300, currency: "Euro", currencySymbol: "€", language: "Lituano", phoneCode: "+370", timezone: "UTC+2", tld: ".lt" },
  { name: "Luxemburgo", code: "lu", capital: "Luxemburgo", continent: "Europa", population: 0.64, area: 2586, currency: "Euro", currencySymbol: "€", language: "Luxemburgués/Francés/Alemán", phoneCode: "+352", timezone: "UTC+1", tld: ".lu" },
  { name: "Macedonia del Norte", code: "mk", capital: "Skopie", continent: "Europa", population: 2.1, area: 25713, currency: "Denar", currencySymbol: "ден", language: "Macedonio", phoneCode: "+389", timezone: "UTC+1", tld: ".mk" },
  { name: "Malta", code: "mt", capital: "La Valeta", continent: "Europa", population: 0.52, area: 316, currency: "Euro", currencySymbol: "€", language: "Maltés/Inglés", phoneCode: "+356", timezone: "UTC+1", tld: ".mt" },
  { name: "Moldavia", code: "md", capital: "Chisináu", continent: "Europa", population: 2.6, area: 33851, currency: "Leu moldavo", currencySymbol: "L", language: "Rumano", phoneCode: "+373", timezone: "UTC+2", tld: ".md" },
  { name: "Mónaco", code: "mc", capital: "Mónaco", continent: "Europa", population: 0.04, area: 2, currency: "Euro", currencySymbol: "€", language: "Francés", phoneCode: "+377", timezone: "UTC+1", tld: ".mc" },
  { name: "Montenegro", code: "me", capital: "Podgorica", continent: "Europa", population: 0.62, area: 13812, currency: "Euro", currencySymbol: "€", language: "Montenegrino", phoneCode: "+382", timezone: "UTC+1", tld: ".me" },
  { name: "Noruega", code: "no", capital: "Oslo", continent: "Europa", population: 5.4, area: 323802, currency: "Corona noruega", currencySymbol: "kr", language: "Noruego", phoneCode: "+47", timezone: "UTC+1", tld: ".no" },
  { name: "Países Bajos", code: "nl", capital: "Ámsterdam", continent: "Europa", population: 17.4, area: 41543, currency: "Euro", currencySymbol: "€", language: "Neerlandés", phoneCode: "+31", timezone: "UTC+1", tld: ".nl" },
  { name: "Polonia", code: "pl", capital: "Varsovia", continent: "Europa", population: 38.0, area: 312696, currency: "Esloti", currencySymbol: "zł", language: "Polaco", phoneCode: "+48", timezone: "UTC+1", tld: ".pl" },
  { name: "Portugal", code: "pt", capital: "Lisboa", continent: "Europa", population: 10.3, area: 92212, currency: "Euro", currencySymbol: "€", language: "Portugués", phoneCode: "+351", timezone: "UTC+0", tld: ".pt" },
  { name: "Reino Unido", code: "gb", capital: "Londres", continent: "Europa", population: 67.0, area: 242495, currency: "Libra esterlina", currencySymbol: "£", language: "Inglés", phoneCode: "+44", timezone: "UTC+0", tld: ".uk" },
  { name: "República Checa", code: "cz", capital: "Praga", continent: "Europa", population: 10.7, area: 78865, currency: "Corona checa", currencySymbol: "Kč", language: "Checo", phoneCode: "+420", timezone: "UTC+1", tld: ".cz" },
  { name: "Rumanía", code: "ro", capital: "Bucarest", continent: "Europa", population: 19.2, area: 238391, currency: "Leu rumano", currencySymbol: "lei", language: "Rumano", phoneCode: "+40", timezone: "UTC+2", tld: ".ro" },
  { name: "Rusia", code: "ru", capital: "Moscú", continent: "Europa", population: 144.1, area: 17098242, currency: "Rublo ruso", currencySymbol: "₽", language: "Ruso", phoneCode: "+7", timezone: "UTC+3", tld: ".ru" },
  { name: "San Marino", code: "sm", capital: "San Marino", continent: "Europa", population: 0.03, area: 61, currency: "Euro", currencySymbol: "€", language: "Italiano", phoneCode: "+378", timezone: "UTC+1", tld: ".sm" },
  { name: "Serbia", code: "rs", capital: "Belgrado", continent: "Europa", population: 6.9, area: 88361, currency: "Dinar serbio", currencySymbol: "дин", language: "Serbio", phoneCode: "+381", timezone: "UTC+1", tld: ".rs" },
  { name: "Suecia", code: "se", capital: "Estocolmo", continent: "Europa", population: 10.4, area: 450295, currency: "Corona sueca", currencySymbol: "kr", language: "Sueco", phoneCode: "+46", timezone: "UTC+1", tld: ".se" },
  { name: "Suiza", code: "ch", capital: "Berna", continent: "Europa", population: 8.6, area: 41284, currency: "Franco suizo", currencySymbol: "CHF", language: "Alemán/Francés/Italiano/Romanche", phoneCode: "+41", timezone: "UTC+1", tld: ".ch" },
  { name: "Ucrania", code: "ua", capital: "Kiev", continent: "Europa", population: 43.5, area: 603550, currency: "Grivna", currencySymbol: "₴", language: "Ucraniano", phoneCode: "+380", timezone: "UTC+2", tld: ".ua" },
  { name: "Vaticano", code: "va", capital: "Ciudad del Vaticano", continent: "Europa", population: 0.0008, area: 0.44, currency: "Euro", currencySymbol: "€", language: "Latín/Italiano", phoneCode: "+379", timezone: "UTC+1", tld: ".va" },

  // ASIA (49 países)
  { name: "Afganistán", code: "af", capital: "Kabul", continent: "Asia", population: 40.1, area: 652230, currency: "Afgani", currencySymbol: "؋", language: "Pastún/Dari", phoneCode: "+93", timezone: "UTC+4:30", tld: ".af" },
  { name: "Arabia Saudita", code: "sa", capital: "Riad", continent: "Asia", population: 35.0, area: 2149690, currency: "Rial saudí", currencySymbol: "﷼", language: "Árabe", phoneCode: "+966", timezone: "UTC+3", tld: ".sa" },
  { name: "Armenia", code: "am", capital: "Ereván", continent: "Asia", population: 3.0, area: 29743, currency: "Dram", currencySymbol: "֏", language: "Armenio", phoneCode: "+374", timezone: "UTC+4", tld: ".am" },
  { name: "Azerbaiyán", code: "az", capital: "Bakú", continent: "Asia", population: 10.1, area: 86600, currency: "Manat", currencySymbol: "₼", language: "Azerí", phoneCode: "+994", timezone: "UTC+4", tld: ".az" },
  { name: "Bangladés", code: "bd", capital: "Daca", continent: "Asia", population: 169.4, area: 147570, currency: "Taka", currencySymbol: "৳", language: "Bengalí", phoneCode: "+880", timezone: "UTC+6", tld: ".bd" },
  { name: "Baréin", code: "bh", capital: "Manama", continent: "Asia", population: 1.5, area: 765, currency: "Dinar bareiní", currencySymbol: "BD", language: "Árabe", phoneCode: "+973", timezone: "UTC+3", tld: ".bh" },
  { name: "Brunéi", code: "bn", capital: "Bandar Seri Begawan", continent: "Asia", population: 0.44, area: 5765, currency: "Dólar de Brunéi", currencySymbol: "B$", language: "Malayo", phoneCode: "+673", timezone: "UTC+8", tld: ".bn" },
  { name: "Bután", code: "bt", capital: "Timbu", continent: "Asia", population: 0.78, area: 38394, currency: "Ngultrum", currencySymbol: "Nu", language: "Dzongkha", phoneCode: "+975", timezone: "UTC+6", tld: ".bt" },
  { name: "Camboya", code: "kh", capital: "Nom Pen", continent: "Asia", population: 16.7, area: 181035, currency: "Riel", currencySymbol: "៛", language: "Jemer", phoneCode: "+855", timezone: "UTC+7", tld: ".kh" },
  { name: "Catar", code: "qa", capital: "Doha", continent: "Asia", population: 2.9, area: 11586, currency: "Rial catarí", currencySymbol: "QR", language: "Árabe", phoneCode: "+974", timezone: "UTC+3", tld: ".qa" },
  { name: "China", code: "cn", capital: "Pekín", continent: "Asia", population: 1412.0, area: 9596960, currency: "Yuan", currencySymbol: "¥", language: "Chino mandarín", phoneCode: "+86", timezone: "UTC+8", tld: ".cn" },
  { name: "Corea del Norte", code: "kp", capital: "Pionyang", continent: "Asia", population: 25.9, area: 120538, currency: "Won norcoreano", currencySymbol: "₩", language: "Coreano", phoneCode: "+850", timezone: "UTC+9", tld: ".kp" },
  { name: "Corea del Sur", code: "kr", capital: "Seúl", continent: "Asia", population: 51.7, area: 100210, currency: "Won surcoreano", currencySymbol: "₩", language: "Coreano", phoneCode: "+82", timezone: "UTC+9", tld: ".kr" },
  { name: "Emiratos Árabes Unidos", code: "ae", capital: "Abu Dabi", continent: "Asia", population: 9.9, area: 83600, currency: "Dírham", currencySymbol: "د.إ", language: "Árabe", phoneCode: "+971", timezone: "UTC+4", tld: ".ae" },
  { name: "Filipinas", code: "ph", capital: "Manila", continent: "Asia", population: 111.0, area: 300000, currency: "Peso filipino", currencySymbol: "₱", language: "Filipino/Inglés", phoneCode: "+63", timezone: "UTC+8", tld: ".ph" },
  { name: "Georgia", code: "ge", capital: "Tiflis", continent: "Asia", population: 3.7, area: 69700, currency: "Lari", currencySymbol: "₾", language: "Georgiano", phoneCode: "+995", timezone: "UTC+4", tld: ".ge" },
  { name: "India", code: "in", capital: "Nueva Delhi", continent: "Asia", population: 1417.2, area: 3287263, currency: "Rupia india", currencySymbol: "₹", language: "Hindi/Inglés", phoneCode: "+91", timezone: "UTC+5:30", tld: ".in" },
  { name: "Indonesia", code: "id", capital: "Yakarta", continent: "Asia", population: 273.8, area: 1904569, currency: "Rupia indonesia", currencySymbol: "Rp", language: "Indonesio", phoneCode: "+62", timezone: "UTC+7", tld: ".id" },
  { name: "Irak", code: "iq", capital: "Bagdad", continent: "Asia", population: 41.2, area: 438317, currency: "Dinar iraquí", currencySymbol: "ع.د", language: "Árabe/Kurdo", phoneCode: "+964", timezone: "UTC+3", tld: ".iq" },
  { name: "Irán", code: "ir", capital: "Teherán", continent: "Asia", population: 86.8, area: 1648195, currency: "Rial iraní", currencySymbol: "﷼", language: "Persa", phoneCode: "+98", timezone: "UTC+3:30", tld: ".ir" },
  { name: "Israel", code: "il", capital: "Jerusalén", continent: "Asia", population: 9.4, area: 20770, currency: "Nuevo séquel", currencySymbol: "₪", language: "Hebreo/Árabe", phoneCode: "+972", timezone: "UTC+2", tld: ".il" },
  { name: "Japón", code: "jp", capital: "Tokio", continent: "Asia", population: 125.7, area: 377975, currency: "Yen", currencySymbol: "¥", language: "Japonés", phoneCode: "+81", timezone: "UTC+9", tld: ".jp" },
  { name: "Jordania", code: "jo", capital: "Ammán", continent: "Asia", population: 10.3, area: 89342, currency: "Dinar jordano", currencySymbol: "JD", language: "Árabe", phoneCode: "+962", timezone: "UTC+3", tld: ".jo" },
  { name: "Kazajistán", code: "kz", capital: "Astaná", continent: "Asia", population: 19.0, area: 2724900, currency: "Tenge", currencySymbol: "₸", language: "Kazajo/Ruso", phoneCode: "+7", timezone: "UTC+5", tld: ".kz" },
  { name: "Kirguistán", code: "kg", capital: "Biskek", continent: "Asia", population: 6.7, area: 199951, currency: "Som", currencySymbol: "с", language: "Kirguís/Ruso", phoneCode: "+996", timezone: "UTC+6", tld: ".kg" },
  { name: "Kuwait", code: "kw", capital: "Kuwait", continent: "Asia", population: 4.3, area: 17818, currency: "Dinar kuwaití", currencySymbol: "KD", language: "Árabe", phoneCode: "+965", timezone: "UTC+3", tld: ".kw" },
  { name: "Laos", code: "la", capital: "Vientián", continent: "Asia", population: 7.4, area: 236800, currency: "Kip", currencySymbol: "₭", language: "Lao", phoneCode: "+856", timezone: "UTC+7", tld: ".la" },
  { name: "Líbano", code: "lb", capital: "Beirut", continent: "Asia", population: 5.5, area: 10452, currency: "Libra libanesa", currencySymbol: "ل.ل", language: "Árabe", phoneCode: "+961", timezone: "UTC+2", tld: ".lb" },
  { name: "Malasia", code: "my", capital: "Kuala Lumpur", continent: "Asia", population: 32.7, area: 330803, currency: "Ringgit", currencySymbol: "RM", language: "Malayo", phoneCode: "+60", timezone: "UTC+8", tld: ".my" },
  { name: "Maldivas", code: "mv", capital: "Malé", continent: "Asia", population: 0.52, area: 300, currency: "Rufiyaa", currencySymbol: "Rf", language: "Maldivo", phoneCode: "+960", timezone: "UTC+5", tld: ".mv" },
  { name: "Mongolia", code: "mn", capital: "Ulán Bator", continent: "Asia", population: 3.3, area: 1564116, currency: "Tugrik", currencySymbol: "₮", language: "Mongol", phoneCode: "+976", timezone: "UTC+8", tld: ".mn" },
  { name: "Myanmar", code: "mm", capital: "Naipyidó", continent: "Asia", population: 54.8, area: 676578, currency: "Kyat", currencySymbol: "K", language: "Birmano", phoneCode: "+95", timezone: "UTC+6:30", tld: ".mm" },
  { name: "Nepal", code: "np", capital: "Katmandú", continent: "Asia", population: 30.0, area: 147181, currency: "Rupia nepalí", currencySymbol: "₨", language: "Nepalí", phoneCode: "+977", timezone: "UTC+5:45", tld: ".np" },
  { name: "Omán", code: "om", capital: "Mascate", continent: "Asia", population: 4.5, area: 309500, currency: "Rial omaní", currencySymbol: "ر.ع", language: "Árabe", phoneCode: "+968", timezone: "UTC+4", tld: ".om" },
  { name: "Pakistán", code: "pk", capital: "Islamabad", continent: "Asia", population: 231.4, area: 881913, currency: "Rupia pakistaní", currencySymbol: "₨", language: "Urdu/Inglés", phoneCode: "+92", timezone: "UTC+5", tld: ".pk" },
  { name: "Palestina", code: "ps", capital: "Ramala", continent: "Asia", population: 5.2, area: 6020, currency: "Nuevo séquel", currencySymbol: "₪", language: "Árabe", phoneCode: "+970", timezone: "UTC+2", tld: ".ps" },
  { name: "Singapur", code: "sg", capital: "Singapur", continent: "Asia", population: 5.5, area: 728, currency: "Dólar de Singapur", currencySymbol: "S$", language: "Inglés/Mandarín/Malayo/Tamil", phoneCode: "+65", timezone: "UTC+8", tld: ".sg" },
  { name: "Siria", code: "sy", capital: "Damasco", continent: "Asia", population: 21.3, area: 185180, currency: "Libra siria", currencySymbol: "LS", language: "Árabe", phoneCode: "+963", timezone: "UTC+3", tld: ".sy" },
  { name: "Sri Lanka", code: "lk", capital: "Sri Jayawardenepura Kotte", continent: "Asia", population: 22.0, area: 65610, currency: "Rupia de Sri Lanka", currencySymbol: "Rs", language: "Cingalés/Tamil", phoneCode: "+94", timezone: "UTC+5:30", tld: ".lk" },
  { name: "Tailandia", code: "th", capital: "Bangkok", continent: "Asia", population: 71.6, area: 513120, currency: "Baht", currencySymbol: "฿", language: "Tailandés", phoneCode: "+66", timezone: "UTC+7", tld: ".th" },
  { name: "Taiwán", code: "tw", capital: "Taipéi", continent: "Asia", population: 23.6, area: 36193, currency: "Nuevo dólar taiwanés", currencySymbol: "NT$", language: "Chino mandarín", phoneCode: "+886", timezone: "UTC+8", tld: ".tw" },
  { name: "Tayikistán", code: "tj", capital: "Dusambé", continent: "Asia", population: 9.7, area: 143100, currency: "Somoni", currencySymbol: "SM", language: "Tayiko", phoneCode: "+992", timezone: "UTC+5", tld: ".tj" },
  { name: "Timor Oriental", code: "tl", capital: "Dili", continent: "Asia", population: 1.3, area: 14874, currency: "Dólar estadounidense", currencySymbol: "$", language: "Tetun/Portugués", phoneCode: "+670", timezone: "UTC+9", tld: ".tl" },
  { name: "Turkmenistán", code: "tm", capital: "Asjabad", continent: "Asia", population: 6.1, area: 488100, currency: "Manat turcomano", currencySymbol: "m", language: "Turcomano", phoneCode: "+993", timezone: "UTC+5", tld: ".tm" },
  { name: "Turquía", code: "tr", capital: "Ankara", continent: "Asia", population: 84.8, area: 783562, currency: "Lira turca", currencySymbol: "₺", language: "Turco", phoneCode: "+90", timezone: "UTC+3", tld: ".tr" },
  { name: "Uzbekistán", code: "uz", capital: "Taskent", continent: "Asia", population: 34.6, area: 447400, currency: "Som uzbeko", currencySymbol: "сўм", language: "Uzbeko", phoneCode: "+998", timezone: "UTC+5", tld: ".uz" },
  { name: "Vietnam", code: "vn", capital: "Hanói", continent: "Asia", population: 98.2, area: 331212, currency: "Dong", currencySymbol: "₫", language: "Vietnamita", phoneCode: "+84", timezone: "UTC+7", tld: ".vn" },
  { name: "Yemen", code: "ye", capital: "Saná", continent: "Asia", population: 32.3, area: 527968, currency: "Rial yemení", currencySymbol: "﷼", language: "Árabe", phoneCode: "+967", timezone: "UTC+3", tld: ".ye" },

  // ÁFRICA (54 países)
  { name: "Angola", code: "ao", capital: "Luanda", continent: "África", population: 34.5, area: 1246700, currency: "Kwanza", currencySymbol: "Kz", language: "Portugués", phoneCode: "+244", timezone: "UTC+1", tld: ".ao" },
  { name: "Argelia", code: "dz", capital: "Argel", continent: "África", population: 45.4, area: 2381741, currency: "Dinar argelino", currencySymbol: "دج", language: "Árabe", phoneCode: "+213", timezone: "UTC+1", tld: ".dz" },
  { name: "Benín", code: "bj", capital: "Porto Novo", continent: "África", population: 12.5, area: 114763, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés", phoneCode: "+229", timezone: "UTC+1", tld: ".bj" },
  { name: "Botsuana", code: "bw", capital: "Gaborone", continent: "África", population: 2.4, area: 581730, currency: "Pula", currencySymbol: "P", language: "Inglés/Setsuana", phoneCode: "+267", timezone: "UTC+2", tld: ".bw" },
  { name: "Burkina Faso", code: "bf", capital: "Uagadugú", continent: "África", population: 22.1, area: 274200, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés", phoneCode: "+226", timezone: "UTC+0", tld: ".bf" },
  { name: "Burundi", code: "bi", capital: "Gitega", continent: "África", population: 12.5, area: 27834, currency: "Franco de Burundi", currencySymbol: "FBu", language: "Kirundi/Francés", phoneCode: "+257", timezone: "UTC+2", tld: ".bi" },
  { name: "Cabo Verde", code: "cv", capital: "Praia", continent: "África", population: 0.56, area: 4033, currency: "Escudo caboverdiano", currencySymbol: "CVE", language: "Portugués", phoneCode: "+238", timezone: "UTC-1", tld: ".cv" },
  { name: "Camerún", code: "cm", capital: "Yaundé", continent: "África", population: 27.2, area: 475442, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés/Inglés", phoneCode: "+237", timezone: "UTC+1", tld: ".cm" },
  { name: "Chad", code: "td", capital: "Yamena", continent: "África", population: 17.2, area: 1284000, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés/Árabe", phoneCode: "+235", timezone: "UTC+1", tld: ".td" },
  { name: "Comoras", code: "km", capital: "Moroni", continent: "África", population: 0.9, area: 2235, currency: "Franco comorense", currencySymbol: "CF", language: "Comorense/Francés/Árabe", phoneCode: "+269", timezone: "UTC+3", tld: ".km" },
  { name: "Costa de Marfil", code: "ci", capital: "Yamusukro", continent: "África", population: 27.5, area: 322463, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés", phoneCode: "+225", timezone: "UTC+0", tld: ".ci" },
  { name: "Egipto", code: "eg", capital: "El Cairo", continent: "África", population: 104.3, area: 1001449, currency: "Libra egipcia", currencySymbol: "E£", language: "Árabe", phoneCode: "+20", timezone: "UTC+2", tld: ".eg" },
  { name: "Eritrea", code: "er", capital: "Asmara", continent: "África", population: 3.6, area: 117600, currency: "Nakfa", currencySymbol: "Nfk", language: "Tigriña/Árabe", phoneCode: "+291", timezone: "UTC+3", tld: ".er" },
  { name: "Esuatini", code: "sz", capital: "Mbabane", continent: "África", population: 1.2, area: 17364, currency: "Lilangeni", currencySymbol: "L", language: "Suazi/Inglés", phoneCode: "+268", timezone: "UTC+2", tld: ".sz" },
  { name: "Etiopía", code: "et", capital: "Adís Abeba", continent: "África", population: 120.3, area: 1104300, currency: "Birr", currencySymbol: "Br", language: "Amárico", phoneCode: "+251", timezone: "UTC+3", tld: ".et" },
  { name: "Gabón", code: "ga", capital: "Libreville", continent: "África", population: 2.3, area: 267668, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés", phoneCode: "+241", timezone: "UTC+1", tld: ".ga" },
  { name: "Gambia", code: "gm", capital: "Banjul", continent: "África", population: 2.5, area: 11295, currency: "Dalasi", currencySymbol: "D", language: "Inglés", phoneCode: "+220", timezone: "UTC+0", tld: ".gm" },
  { name: "Ghana", code: "gh", capital: "Acra", continent: "África", population: 32.8, area: 238533, currency: "Cedi", currencySymbol: "₵", language: "Inglés", phoneCode: "+233", timezone: "UTC+0", tld: ".gh" },
  { name: "Guinea", code: "gn", capital: "Conakri", continent: "África", population: 13.5, area: 245857, currency: "Franco guineano", currencySymbol: "FG", language: "Francés", phoneCode: "+224", timezone: "UTC+0", tld: ".gn" },
  { name: "Guinea-Bisáu", code: "gw", capital: "Bisáu", continent: "África", population: 2.0, area: 36125, currency: "Franco CFA", currencySymbol: "CFA", language: "Portugués", phoneCode: "+245", timezone: "UTC+0", tld: ".gw" },
  { name: "Guinea Ecuatorial", code: "gq", capital: "Malabo", continent: "África", population: 1.5, area: 28051, currency: "Franco CFA", currencySymbol: "CFA", language: "Español/Francés/Portugués", phoneCode: "+240", timezone: "UTC+1", tld: ".gq" },
  { name: "Kenia", code: "ke", capital: "Nairobi", continent: "África", population: 54.0, area: 580367, currency: "Chelín keniano", currencySymbol: "KSh", language: "Suajili/Inglés", phoneCode: "+254", timezone: "UTC+3", tld: ".ke" },
  { name: "Lesoto", code: "ls", capital: "Maseru", continent: "África", population: 2.2, area: 30355, currency: "Loti", currencySymbol: "L", language: "Sesoto/Inglés", phoneCode: "+266", timezone: "UTC+2", tld: ".ls" },
  { name: "Liberia", code: "lr", capital: "Monrovia", continent: "África", population: 5.2, area: 111369, currency: "Dólar liberiano", currencySymbol: "L$", language: "Inglés", phoneCode: "+231", timezone: "UTC+0", tld: ".lr" },
  { name: "Libia", code: "ly", capital: "Trípoli", continent: "África", population: 7.0, area: 1759540, currency: "Dinar libio", currencySymbol: "LD", language: "Árabe", phoneCode: "+218", timezone: "UTC+2", tld: ".ly" },
  { name: "Madagascar", code: "mg", capital: "Antananarivo", continent: "África", population: 28.9, area: 587041, currency: "Ariary", currencySymbol: "Ar", language: "Malgache/Francés", phoneCode: "+261", timezone: "UTC+3", tld: ".mg" },
  { name: "Malaui", code: "mw", capital: "Lilongüe", continent: "África", population: 19.6, area: 118484, currency: "Kwacha malauí", currencySymbol: "MK", language: "Inglés/Chichewa", phoneCode: "+265", timezone: "UTC+2", tld: ".mw" },
  { name: "Malí", code: "ml", capital: "Bamako", continent: "África", population: 21.4, area: 1240192, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés", phoneCode: "+223", timezone: "UTC+0", tld: ".ml" },
  { name: "Marruecos", code: "ma", capital: "Rabat", continent: "África", population: 37.5, area: 446550, currency: "Dírham marroquí", currencySymbol: "DH", language: "Árabe/Bereber", phoneCode: "+212", timezone: "UTC+1", tld: ".ma" },
  { name: "Mauricio", code: "mu", capital: "Port Louis", continent: "África", population: 1.3, area: 2040, currency: "Rupia mauriciana", currencySymbol: "Rs", language: "Inglés", phoneCode: "+230", timezone: "UTC+4", tld: ".mu" },
  { name: "Mauritania", code: "mr", capital: "Nuakchot", continent: "África", population: 4.8, area: 1030700, currency: "Uguiya", currencySymbol: "UM", language: "Árabe", phoneCode: "+222", timezone: "UTC+0", tld: ".mr" },
  { name: "Mozambique", code: "mz", capital: "Maputo", continent: "África", population: 32.1, area: 801590, currency: "Metical", currencySymbol: "MT", language: "Portugués", phoneCode: "+258", timezone: "UTC+2", tld: ".mz" },
  { name: "Namibia", code: "na", capital: "Windhoek", continent: "África", population: 2.6, area: 824292, currency: "Dólar namibio", currencySymbol: "N$", language: "Inglés", phoneCode: "+264", timezone: "UTC+2", tld: ".na" },
  { name: "Níger", code: "ne", capital: "Niamey", continent: "África", population: 25.3, area: 1267000, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés", phoneCode: "+227", timezone: "UTC+1", tld: ".ne" },
  { name: "Nigeria", code: "ng", capital: "Abuya", continent: "África", population: 218.5, area: 923768, currency: "Naira", currencySymbol: "₦", language: "Inglés", phoneCode: "+234", timezone: "UTC+1", tld: ".ng" },
  { name: "República Centroafricana", code: "cf", capital: "Bangui", continent: "África", population: 5.0, area: 622984, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés/Sango", phoneCode: "+236", timezone: "UTC+1", tld: ".cf" },
  { name: "República del Congo", code: "cg", capital: "Brazzaville", continent: "África", population: 5.8, area: 342000, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés", phoneCode: "+242", timezone: "UTC+1", tld: ".cg" },
  { name: "República Democrática del Congo", code: "cd", capital: "Kinsasa", continent: "África", population: 95.9, area: 2344858, currency: "Franco congoleño", currencySymbol: "FC", language: "Francés", phoneCode: "+243", timezone: "UTC+1", tld: ".cd" },
  { name: "Ruanda", code: "rw", capital: "Kigali", continent: "África", population: 13.5, area: 26338, currency: "Franco ruandés", currencySymbol: "FRw", language: "Kinyarwanda/Francés/Inglés", phoneCode: "+250", timezone: "UTC+2", tld: ".rw" },
  { name: "Santo Tomé y Príncipe", code: "st", capital: "Santo Tomé", continent: "África", population: 0.22, area: 964, currency: "Dobra", currencySymbol: "Db", language: "Portugués", phoneCode: "+239", timezone: "UTC+0", tld: ".st" },
  { name: "Senegal", code: "sn", capital: "Dakar", continent: "África", population: 17.2, area: 196722, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés", phoneCode: "+221", timezone: "UTC+0", tld: ".sn" },
  { name: "Seychelles", code: "sc", capital: "Victoria", continent: "África", population: 0.1, area: 455, currency: "Rupia de Seychelles", currencySymbol: "Rs", language: "Inglés/Francés/Criollo", phoneCode: "+248", timezone: "UTC+4", tld: ".sc" },
  { name: "Sierra Leona", code: "sl", capital: "Freetown", continent: "África", population: 8.4, area: 71740, currency: "Leone", currencySymbol: "Le", language: "Inglés", phoneCode: "+232", timezone: "UTC+0", tld: ".sl" },
  { name: "Somalia", code: "so", capital: "Mogadiscio", continent: "África", population: 17.1, area: 637657, currency: "Chelín somalí", currencySymbol: "Sh", language: "Somalí/Árabe", phoneCode: "+252", timezone: "UTC+3", tld: ".so" },
  { name: "Sudáfrica", code: "za", capital: "Pretoria", continent: "África", population: 60.0, area: 1221037, currency: "Rand", currencySymbol: "R", language: "Zulú/Xhosa/Afrikáans/Inglés", phoneCode: "+27", timezone: "UTC+2", tld: ".za" },
  { name: "Sudán", code: "sd", capital: "Jartum", continent: "África", population: 45.7, area: 1861484, currency: "Libra sudanesa", currencySymbol: "LS", language: "Árabe/Inglés", phoneCode: "+249", timezone: "UTC+2", tld: ".sd" },
  { name: "Sudán del Sur", code: "ss", capital: "Yuba", continent: "África", population: 11.4, area: 644329, currency: "Libra sursudanesa", currencySymbol: "SSP", language: "Inglés", phoneCode: "+211", timezone: "UTC+2", tld: ".ss" },
  { name: "Tanzania", code: "tz", capital: "Dodoma", continent: "África", population: 63.6, area: 947303, currency: "Chelín tanzano", currencySymbol: "TSh", language: "Suajili/Inglés", phoneCode: "+255", timezone: "UTC+3", tld: ".tz" },
  { name: "Togo", code: "tg", capital: "Lomé", continent: "África", population: 8.5, area: 56785, currency: "Franco CFA", currencySymbol: "CFA", language: "Francés", phoneCode: "+228", timezone: "UTC+0", tld: ".tg" },
  { name: "Túnez", code: "tn", capital: "Túnez", continent: "África", population: 12.0, area: 163610, currency: "Dinar tunecino", currencySymbol: "DT", language: "Árabe", phoneCode: "+216", timezone: "UTC+1", tld: ".tn" },
  { name: "Uganda", code: "ug", capital: "Kampala", continent: "África", population: 47.1, area: 241038, currency: "Chelín ugandés", currencySymbol: "USh", language: "Inglés/Suajili", phoneCode: "+256", timezone: "UTC+3", tld: ".ug" },
  { name: "Yibuti", code: "dj", capital: "Yibuti", continent: "África", population: 1.0, area: 23200, currency: "Franco yibutiano", currencySymbol: "Fdj", language: "Francés/Árabe", phoneCode: "+253", timezone: "UTC+3", tld: ".dj" },
  { name: "Zambia", code: "zm", capital: "Lusaka", continent: "África", population: 19.5, area: 752618, currency: "Kwacha zambiano", currencySymbol: "ZK", language: "Inglés", phoneCode: "+260", timezone: "UTC+2", tld: ".zm" },
  { name: "Zimbabue", code: "zw", capital: "Harare", continent: "África", population: 15.9, area: 390757, currency: "Dólar zimbabuense", currencySymbol: "Z$", language: "Inglés/Shona/Ndebele", phoneCode: "+263", timezone: "UTC+2", tld: ".zw" },

  // AMÉRICA DEL NORTE (3 países)
  { name: "Canadá", code: "ca", capital: "Ottawa", continent: "América del Norte", population: 38.2, area: 9984670, currency: "Dólar canadiense", currencySymbol: "C$", language: "Inglés/Francés", phoneCode: "+1", timezone: "UTC-5", tld: ".ca" },
  { name: "Estados Unidos", code: "us", capital: "Washington D.C.", continent: "América del Norte", population: 331.9, area: 9833517, currency: "Dólar estadounidense", currencySymbol: "$", language: "Inglés", phoneCode: "+1", timezone: "UTC-5", tld: ".us" },
  { name: "México", code: "mx", capital: "Ciudad de México", continent: "América del Norte", population: 128.9, area: 1964375, currency: "Peso mexicano", currencySymbol: "$", language: "Español", phoneCode: "+52", timezone: "UTC-6", tld: ".mx" },

  // AMÉRICA CENTRAL Y CARIBE (20 países)
  { name: "Antigua y Barbuda", code: "ag", capital: "Saint John", continent: "América Central", population: 0.1, area: 442, currency: "Dólar del Caribe Oriental", currencySymbol: "EC$", language: "Inglés", phoneCode: "+1268", timezone: "UTC-4", tld: ".ag" },
  { name: "Bahamas", code: "bs", capital: "Nasáu", continent: "América Central", population: 0.4, area: 13943, currency: "Dólar bahameño", currencySymbol: "B$", language: "Inglés", phoneCode: "+1242", timezone: "UTC-5", tld: ".bs" },
  { name: "Barbados", code: "bb", capital: "Bridgetown", continent: "América Central", population: 0.29, area: 430, currency: "Dólar de Barbados", currencySymbol: "Bds$", language: "Inglés", phoneCode: "+1246", timezone: "UTC-4", tld: ".bb" },
  { name: "Belice", code: "bz", capital: "Belmopán", continent: "América Central", population: 0.4, area: 22966, currency: "Dólar beliceño", currencySymbol: "BZ$", language: "Inglés", phoneCode: "+501", timezone: "UTC-6", tld: ".bz" },
  { name: "Costa Rica", code: "cr", capital: "San José", continent: "América Central", population: 5.2, area: 51100, currency: "Colón costarricense", currencySymbol: "₡", language: "Español", phoneCode: "+506", timezone: "UTC-6", tld: ".cr" },
  { name: "Cuba", code: "cu", capital: "La Habana", continent: "América Central", population: 11.3, area: 109884, currency: "Peso cubano", currencySymbol: "$", language: "Español", phoneCode: "+53", timezone: "UTC-5", tld: ".cu" },
  { name: "Dominica", code: "dm", capital: "Roseau", continent: "América Central", population: 0.07, area: 751, currency: "Dólar del Caribe Oriental", currencySymbol: "EC$", language: "Inglés", phoneCode: "+1767", timezone: "UTC-4", tld: ".dm" },
  { name: "El Salvador", code: "sv", capital: "San Salvador", continent: "América Central", population: 6.5, area: 21041, currency: "Dólar estadounidense", currencySymbol: "$", language: "Español", phoneCode: "+503", timezone: "UTC-6", tld: ".sv" },
  { name: "Granada", code: "gd", capital: "Saint George", continent: "América Central", population: 0.11, area: 344, currency: "Dólar del Caribe Oriental", currencySymbol: "EC$", language: "Inglés", phoneCode: "+1473", timezone: "UTC-4", tld: ".gd" },
  { name: "Guatemala", code: "gt", capital: "Ciudad de Guatemala", continent: "América Central", population: 17.1, area: 108889, currency: "Quetzal", currencySymbol: "Q", language: "Español", phoneCode: "+502", timezone: "UTC-6", tld: ".gt" },
  { name: "Haití", code: "ht", capital: "Puerto Príncipe", continent: "América Central", population: 11.6, area: 27750, currency: "Gourde", currencySymbol: "G", language: "Francés/Criollo haitiano", phoneCode: "+509", timezone: "UTC-5", tld: ".ht" },
  { name: "Honduras", code: "hn", capital: "Tegucigalpa", continent: "América Central", population: 10.3, area: 112492, currency: "Lempira", currencySymbol: "L", language: "Español", phoneCode: "+504", timezone: "UTC-6", tld: ".hn" },
  { name: "Jamaica", code: "jm", capital: "Kingston", continent: "América Central", population: 3.0, area: 10991, currency: "Dólar jamaicano", currencySymbol: "J$", language: "Inglés", phoneCode: "+1876", timezone: "UTC-5", tld: ".jm" },
  { name: "Nicaragua", code: "ni", capital: "Managua", continent: "América Central", population: 6.9, area: 130373, currency: "Córdoba", currencySymbol: "C$", language: "Español", phoneCode: "+505", timezone: "UTC-6", tld: ".ni" },
  { name: "Panamá", code: "pa", capital: "Ciudad de Panamá", continent: "América Central", population: 4.4, area: 75417, currency: "Balboa/Dólar estadounidense", currencySymbol: "B/.", language: "Español", phoneCode: "+507", timezone: "UTC-5", tld: ".pa" },
  { name: "República Dominicana", code: "do", capital: "Santo Domingo", continent: "América Central", population: 11.1, area: 48671, currency: "Peso dominicano", currencySymbol: "RD$", language: "Español", phoneCode: "+1809", timezone: "UTC-4", tld: ".do" },
  { name: "San Cristóbal y Nieves", code: "kn", capital: "Basseterre", continent: "América Central", population: 0.05, area: 261, currency: "Dólar del Caribe Oriental", currencySymbol: "EC$", language: "Inglés", phoneCode: "+1869", timezone: "UTC-4", tld: ".kn" },
  { name: "San Vicente y las Granadinas", code: "vc", capital: "Kingstown", continent: "América Central", population: 0.11, area: 389, currency: "Dólar del Caribe Oriental", currencySymbol: "EC$", language: "Inglés", phoneCode: "+1784", timezone: "UTC-4", tld: ".vc" },
  { name: "Santa Lucía", code: "lc", capital: "Castries", continent: "América Central", population: 0.18, area: 616, currency: "Dólar del Caribe Oriental", currencySymbol: "EC$", language: "Inglés", phoneCode: "+1758", timezone: "UTC-4", tld: ".lc" },
  { name: "Trinidad y Tobago", code: "tt", capital: "Puerto España", continent: "América Central", population: 1.4, area: 5130, currency: "Dólar de Trinidad y Tobago", currencySymbol: "TT$", language: "Inglés", phoneCode: "+1868", timezone: "UTC-4", tld: ".tt" },

  // AMÉRICA DEL SUR (12 países)
  { name: "Argentina", code: "ar", capital: "Buenos Aires", continent: "América del Sur", population: 45.8, area: 2780400, currency: "Peso argentino", currencySymbol: "$", language: "Español", phoneCode: "+54", timezone: "UTC-3", tld: ".ar" },
  { name: "Bolivia", code: "bo", capital: "Sucre", continent: "América del Sur", population: 12.1, area: 1098581, currency: "Boliviano", currencySymbol: "Bs", language: "Español/Quechua/Aimara", phoneCode: "+591", timezone: "UTC-4", tld: ".bo" },
  { name: "Brasil", code: "br", capital: "Brasilia", continent: "América del Sur", population: 214.3, area: 8515767, currency: "Real brasileño", currencySymbol: "R$", language: "Portugués", phoneCode: "+55", timezone: "UTC-3", tld: ".br" },
  { name: "Chile", code: "cl", capital: "Santiago", continent: "América del Sur", population: 19.5, area: 756102, currency: "Peso chileno", currencySymbol: "$", language: "Español", phoneCode: "+56", timezone: "UTC-4", tld: ".cl" },
  { name: "Colombia", code: "co", capital: "Bogotá", continent: "América del Sur", population: 51.9, area: 1141748, currency: "Peso colombiano", currencySymbol: "$", language: "Español", phoneCode: "+57", timezone: "UTC-5", tld: ".co" },
  { name: "Ecuador", code: "ec", capital: "Quito", continent: "América del Sur", population: 18.0, area: 276841, currency: "Dólar estadounidense", currencySymbol: "$", language: "Español", phoneCode: "+593", timezone: "UTC-5", tld: ".ec" },
  { name: "Guyana", code: "gy", capital: "Georgetown", continent: "América del Sur", population: 0.8, area: 214969, currency: "Dólar guyanés", currencySymbol: "G$", language: "Inglés", phoneCode: "+592", timezone: "UTC-4", tld: ".gy" },
  { name: "Paraguay", code: "py", capital: "Asunción", continent: "América del Sur", population: 7.4, area: 406752, currency: "Guaraní", currencySymbol: "₲", language: "Español/Guaraní", phoneCode: "+595", timezone: "UTC-4", tld: ".py" },
  { name: "Perú", code: "pe", capital: "Lima", continent: "América del Sur", population: 33.7, area: 1285216, currency: "Sol", currencySymbol: "S/", language: "Español", phoneCode: "+51", timezone: "UTC-5", tld: ".pe" },
  { name: "Surinam", code: "sr", capital: "Paramaribo", continent: "América del Sur", population: 0.6, area: 163820, currency: "Dólar surinamés", currencySymbol: "SRD", language: "Neerlandés", phoneCode: "+597", timezone: "UTC-3", tld: ".sr" },
  { name: "Uruguay", code: "uy", capital: "Montevideo", continent: "América del Sur", population: 3.5, area: 176215, currency: "Peso uruguayo", currencySymbol: "$", language: "Español", phoneCode: "+598", timezone: "UTC-3", tld: ".uy" },
  { name: "Venezuela", code: "ve", capital: "Caracas", continent: "América del Sur", population: 28.4, area: 916445, currency: "Bolívar", currencySymbol: "Bs", language: "Español", phoneCode: "+58", timezone: "UTC-4", tld: ".ve" },

  // OCEANÍA (14 países)
  { name: "Australia", code: "au", capital: "Canberra", continent: "Oceanía", population: 25.7, area: 7692024, currency: "Dólar australiano", currencySymbol: "A$", language: "Inglés", phoneCode: "+61", timezone: "UTC+10", tld: ".au" },
  { name: "Fiyi", code: "fj", capital: "Suva", continent: "Oceanía", population: 0.9, area: 18274, currency: "Dólar fiyiano", currencySymbol: "FJ$", language: "Inglés/Fiyiano/Hindi", phoneCode: "+679", timezone: "UTC+12", tld: ".fj" },
  { name: "Islas Marshall", code: "mh", capital: "Majuro", continent: "Oceanía", population: 0.06, area: 181, currency: "Dólar estadounidense", currencySymbol: "$", language: "Marshalés/Inglés", phoneCode: "+692", timezone: "UTC+12", tld: ".mh" },
  { name: "Islas Salomón", code: "sb", capital: "Honiara", continent: "Oceanía", population: 0.7, area: 28896, currency: "Dólar de las Islas Salomón", currencySymbol: "SI$", language: "Inglés", phoneCode: "+677", timezone: "UTC+11", tld: ".sb" },
  { name: "Kiribati", code: "ki", capital: "Tarawa", continent: "Oceanía", population: 0.12, area: 811, currency: "Dólar australiano", currencySymbol: "A$", language: "Gilbertés/Inglés", phoneCode: "+686", timezone: "UTC+12", tld: ".ki" },
  { name: "Micronesia", code: "fm", capital: "Palikir", continent: "Oceanía", population: 0.11, area: 702, currency: "Dólar estadounidense", currencySymbol: "$", language: "Inglés", phoneCode: "+691", timezone: "UTC+11", tld: ".fm" },
  { name: "Nauru", code: "nr", capital: "Yaren", continent: "Oceanía", population: 0.01, area: 21, currency: "Dólar australiano", currencySymbol: "A$", language: "Nauruano/Inglés", phoneCode: "+674", timezone: "UTC+12", tld: ".nr" },
  { name: "Nueva Zelanda", code: "nz", capital: "Wellington", continent: "Oceanía", population: 5.1, area: 270467, currency: "Dólar neozelandés", currencySymbol: "NZ$", language: "Inglés/Maorí", phoneCode: "+64", timezone: "UTC+12", tld: ".nz" },
  { name: "Palaos", code: "pw", capital: "Ngerulmud", continent: "Oceanía", population: 0.02, area: 459, currency: "Dólar estadounidense", currencySymbol: "$", language: "Palauano/Inglés", phoneCode: "+680", timezone: "UTC+9", tld: ".pw" },
  { name: "Papúa Nueva Guinea", code: "pg", capital: "Port Moresby", continent: "Oceanía", population: 9.1, area: 462840, currency: "Kina", currencySymbol: "K", language: "Inglés/Tok Pisin/Hiri Motu", phoneCode: "+675", timezone: "UTC+10", tld: ".pg" },
  { name: "Samoa", code: "ws", capital: "Apia", continent: "Oceanía", population: 0.2, area: 2842, currency: "Tala", currencySymbol: "WS$", language: "Samoano/Inglés", phoneCode: "+685", timezone: "UTC+13", tld: ".ws" },
  { name: "Tonga", code: "to", capital: "Nukualofa", continent: "Oceanía", population: 0.1, area: 747, currency: "Paanga", currencySymbol: "T$", language: "Tongano/Inglés", phoneCode: "+676", timezone: "UTC+13", tld: ".to" },
  { name: "Tuvalu", code: "tv", capital: "Funafuti", continent: "Oceanía", population: 0.01, area: 26, currency: "Dólar australiano", currencySymbol: "A$", language: "Tuvaluano/Inglés", phoneCode: "+688", timezone: "UTC+12", tld: ".tv" },
  { name: "Vanuatu", code: "vu", capital: "Port Vila", continent: "Oceanía", population: 0.31, area: 12189, currency: "Vatu", currencySymbol: "VT", language: "Bislama/Inglés/Francés", phoneCode: "+678", timezone: "UTC+11", tld: ".vu" },
];

// Función para obtener todos los continentes únicos
export const getContinents = (): string[] => {
  const continents = [...new Set(countries.map(c => c.continent))];
  return continents.sort();
};

// Función para buscar países
export const searchCountries = (query: string, continent?: string): Country[] => {
  let results = countries;

  if (continent && continent !== 'Todos') {
    results = results.filter(c => c.continent === continent);
  }

  if (query.trim()) {
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    results = results.filter(c => {
      const normalizedName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normalizedCapital = c.capital.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedName.includes(normalizedQuery) || normalizedCapital.includes(normalizedQuery);
    });
  }

  return results.sort((a, b) => a.name.localeCompare(b.name, 'es'));
};

// Función para formatear población
export const formatPopulation = (pop: number): string => {
  if (pop >= 1000) {
    return `${(pop / 1000).toFixed(1).replace('.', ',')} mil millones`;
  } else if (pop >= 1) {
    return `${pop.toFixed(1).replace('.', ',')} millones`;
  } else {
    return `${Math.round(pop * 1000000).toLocaleString('es-ES')} habitantes`;
  }
};

// Función para formatear superficie
export const formatArea = (area: number): string => {
  return `${area.toLocaleString('es-ES')} km²`;
};
