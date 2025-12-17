// Base de datos de constelaciones - meskeIA
// ~32 constelaciones más conocidas (zodiacales + famosas)

export interface Constellation {
  id: string;
  nombre: string;
  nombreLatin: string;
  abreviatura: string;
  tipo: ConstellationType;
  hemisferio: Hemisphere;
  estrellasPrincipales: Star[];
  mejorMes: string;
  areaGrados: number; // grados cuadrados
  mitologia: string;
  curiosidad: string;
}

export interface Star {
  nombre: string;
  magnitud: number; // menor = más brillante
  tipo?: string;
}

export type ConstellationType = 'Zodiacal' | 'Boreal' | 'Austral';

export type Hemisphere = 'Norte' | 'Sur' | 'Ambos';

export const TIPOS: ConstellationType[] = ['Zodiacal', 'Boreal', 'Austral'];

export const HEMISFERIOS: Hemisphere[] = ['Norte', 'Sur', 'Ambos'];

// Emojis por tipo
export const TIPO_EMOJI: Record<ConstellationType, string> = {
  'Zodiacal': '♈',
  'Boreal': '🌟',
  'Austral': '✨',
};

// Emojis por hemisferio
export const HEMISFERIO_EMOJI: Record<Hemisphere, string> = {
  'Norte': '🌍',
  'Sur': '🌏',
  'Ambos': '🌐',
};

export const CONSTELLATIONS: Constellation[] = [
  // ═══════════════════════════════════════════════════════════════
  // CONSTELACIONES ZODIACALES (12)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'aries',
    nombre: 'Aries',
    nombreLatin: 'Aries',
    abreviatura: 'Ari',
    tipo: 'Zodiacal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Hamal', magnitud: 2.0, tipo: 'Gigante naranja' },
      { nombre: 'Sheratan', magnitud: 2.6, tipo: 'Blanca' },
      { nombre: 'Mesarthim', magnitud: 3.9, tipo: 'Binaria' },
    ],
    mejorMes: 'Diciembre',
    areaGrados: 441,
    mitologia: 'Representa el carnero cuyo vellocino de oro buscaron Jasón y los Argonautas. Zeus lo colocó en el cielo tras su sacrificio.',
    curiosidad: 'Hace 2.000 años contenía el punto vernal (equinoccio de primavera), por eso el zodiaco empieza aquí aunque hoy ese punto está en Piscis.',
  },
  {
    id: 'tauro',
    nombre: 'Tauro',
    nombreLatin: 'Taurus',
    abreviatura: 'Tau',
    tipo: 'Zodiacal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Aldebarán', magnitud: 0.85, tipo: 'Gigante roja' },
      { nombre: 'Elnath', magnitud: 1.65, tipo: 'Gigante azul' },
      { nombre: 'Alcyone (Pléyades)', magnitud: 2.87, tipo: 'Gigante azul' },
    ],
    mejorMes: 'Enero',
    areaGrados: 797,
    mitologia: 'Zeus se transformó en un hermoso toro blanco para raptar a Europa, princesa fenicia. También se asocia con el Minotauro de Creta.',
    curiosidad: 'Contiene dos cúmulos estelares visibles a simple vista: las Pléyades (las "Siete Hermanas") y las Híades.',
  },
  {
    id: 'geminis',
    nombre: 'Géminis',
    nombreLatin: 'Gemini',
    abreviatura: 'Gem',
    tipo: 'Zodiacal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Pólux', magnitud: 1.14, tipo: 'Gigante naranja' },
      { nombre: 'Cástor', magnitud: 1.58, tipo: 'Sistema séxtuple' },
      { nombre: 'Alhena', magnitud: 1.93, tipo: 'Subgigante blanca' },
    ],
    mejorMes: 'Febrero',
    areaGrados: 514,
    mitologia: 'Representa a los gemelos Cástor y Pólux, hijos de Leda. Pólux era inmortal (hijo de Zeus) y pidió compartir su inmortalidad con su hermano mortal.',
    curiosidad: 'Es el radiante de las Gemínidas, una de las lluvias de meteoros más intensas del año (mediados de diciembre).',
  },
  {
    id: 'cancer',
    nombre: 'Cáncer',
    nombreLatin: 'Cancer',
    abreviatura: 'Cnc',
    tipo: 'Zodiacal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Tarf', magnitud: 3.5, tipo: 'Gigante naranja' },
      { nombre: 'Asellus Australis', magnitud: 3.9, tipo: 'Gigante naranja' },
      { nombre: 'Acubens', magnitud: 4.2, tipo: 'Blanca' },
    ],
    mejorMes: 'Marzo',
    areaGrados: 506,
    mitologia: 'Hera envió un cangrejo gigante para distraer a Hércules durante su lucha con la Hidra. Aunque fracasó, Hera lo recompensó colocándolo en el cielo.',
    curiosidad: 'Es la constelación zodiacal más tenue, pero contiene el cúmulo del Pesebre (M44), visible a simple vista como una nube difusa.',
  },
  {
    id: 'leo',
    nombre: 'Leo',
    nombreLatin: 'Leo',
    abreviatura: 'Leo',
    tipo: 'Zodiacal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Régulo', magnitud: 1.35, tipo: 'Sistema cuádruple' },
      { nombre: 'Denébola', magnitud: 2.14, tipo: 'Blanca' },
      { nombre: 'Algieba', magnitud: 2.28, tipo: 'Gigante doble' },
    ],
    mejorMes: 'Abril',
    areaGrados: 947,
    mitologia: 'Representa al León de Nemea, una bestia invulnerable que Hércules mató con sus propias manos como el primero de sus doce trabajos.',
    curiosidad: 'Régulo significa "pequeño rey" en latín. Es una de las cuatro estrellas reales de la antigüedad persa.',
  },
  {
    id: 'virgo',
    nombre: 'Virgo',
    nombreLatin: 'Virgo',
    abreviatura: 'Vir',
    tipo: 'Zodiacal',
    hemisferio: 'Ambos',
    estrellasPrincipales: [
      { nombre: 'Espiga (Spica)', magnitud: 0.97, tipo: 'Binaria azul' },
      { nombre: 'Porrima', magnitud: 2.74, tipo: 'Binaria' },
      { nombre: 'Vindemiatrix', magnitud: 2.83, tipo: 'Gigante amarilla' },
    ],
    mejorMes: 'Mayo',
    areaGrados: 1294,
    mitologia: 'Asociada con Deméter (diosa de la cosecha), Perséfone, o Astrea (diosa de la justicia). Suele representarse sosteniendo una espiga de trigo.',
    curiosidad: 'Es la segunda constelación más grande del cielo. Contiene el Cúmulo de Virgo, con más de 2.000 galaxias.',
  },
  {
    id: 'libra',
    nombre: 'Libra',
    nombreLatin: 'Libra',
    abreviatura: 'Lib',
    tipo: 'Zodiacal',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Zubeneschamali', magnitud: 2.6, tipo: 'Blanco-azulada' },
      { nombre: 'Zubenelgenubi', magnitud: 2.7, tipo: 'Binaria' },
      { nombre: 'Brachium', magnitud: 3.3, tipo: 'Gigante roja' },
    ],
    mejorMes: 'Junio',
    areaGrados: 538,
    mitologia: 'Representa la balanza de Astrea, diosa de la justicia. Los romanos la separaron de Escorpio, donde sus estrellas formaban las pinzas.',
    curiosidad: 'Es la única constelación zodiacal que representa un objeto inanimado. Sus estrellas principales tienen nombres árabes que significan "pinza norte" y "pinza sur".',
  },
  {
    id: 'escorpio',
    nombre: 'Escorpio',
    nombreLatin: 'Scorpius',
    abreviatura: 'Sco',
    tipo: 'Zodiacal',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Antares', magnitud: 0.96, tipo: 'Supergigante roja' },
      { nombre: 'Shaula', magnitud: 1.63, tipo: 'Triple' },
      { nombre: 'Sargas', magnitud: 1.87, tipo: 'Gigante blanca' },
    ],
    mejorMes: 'Julio',
    areaGrados: 497,
    mitologia: 'Es el escorpión que mató a Orión por orden de Artemisa (o Gaia). Por eso Orión y Escorpio nunca se ven juntos en el cielo.',
    curiosidad: 'Antares significa "rival de Marte" por su color rojizo similar al planeta. Es una de las estrellas más grandes conocidas.',
  },
  {
    id: 'sagitario',
    nombre: 'Sagitario',
    nombreLatin: 'Sagittarius',
    abreviatura: 'Sgr',
    tipo: 'Zodiacal',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Kaus Australis', magnitud: 1.85, tipo: 'Gigante azul' },
      { nombre: 'Nunki', magnitud: 2.02, tipo: 'Blanco-azulada' },
      { nombre: 'Ascella', magnitud: 2.59, tipo: 'Gigante' },
    ],
    mejorMes: 'Agosto',
    areaGrados: 867,
    mitologia: 'Representa al centauro Quirón, sabio maestro de héroes como Aquiles y Jasón. Apunta su flecha hacia el corazón de Escorpio (Antares).',
    curiosidad: 'Mirando hacia Sagitario vemos el centro de nuestra galaxia. Contiene más objetos Messier que cualquier otra constelación.',
  },
  {
    id: 'capricornio',
    nombre: 'Capricornio',
    nombreLatin: 'Capricornus',
    abreviatura: 'Cap',
    tipo: 'Zodiacal',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Deneb Algedi', magnitud: 2.9, tipo: 'Binaria eclipsante' },
      { nombre: 'Dabih', magnitud: 3.1, tipo: 'Sistema múltiple' },
      { nombre: 'Nashira', magnitud: 3.7, tipo: 'Gigante blanca' },
    ],
    mejorMes: 'Septiembre',
    areaGrados: 414,
    mitologia: 'Representa a la cabra Amaltea que amamantó a Zeus, o al dios Pan que se transformó en pez-cabra para escapar del monstruo Tifón.',
    curiosidad: 'El Trópico de Capricornio recibe su nombre porque hace 2.000 años el Sol estaba en esta constelación durante el solsticio de invierno.',
  },
  {
    id: 'acuario',
    nombre: 'Acuario',
    nombreLatin: 'Aquarius',
    abreviatura: 'Aqr',
    tipo: 'Zodiacal',
    hemisferio: 'Ambos',
    estrellasPrincipales: [
      { nombre: 'Sadalsuud', magnitud: 2.9, tipo: 'Supergigante amarilla' },
      { nombre: 'Sadalmelik', magnitud: 2.95, tipo: 'Supergigante amarilla' },
      { nombre: 'Skat', magnitud: 3.3, tipo: 'Blanca' },
    ],
    mejorMes: 'Octubre',
    areaGrados: 980,
    mitologia: 'Representa a Ganímedes, el copero de los dioses, que Zeus raptó por su belleza para servir néctar en el Olimpo.',
    curiosidad: 'Contiene la Nebulosa de la Hélice, una de las nebulosas planetarias más cercanas a la Tierra y conocida como "El Ojo de Dios".',
  },
  {
    id: 'piscis',
    nombre: 'Piscis',
    nombreLatin: 'Pisces',
    abreviatura: 'Psc',
    tipo: 'Zodiacal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Eta Piscium', magnitud: 3.6, tipo: 'Gigante amarilla' },
      { nombre: 'Gamma Piscium', magnitud: 3.7, tipo: 'Gigante amarilla' },
      { nombre: 'Omega Piscium', magnitud: 4.0, tipo: 'Subgigante' },
    ],
    mejorMes: 'Noviembre',
    areaGrados: 889,
    mitologia: 'Representa a Afrodita y Eros transformados en peces para escapar del monstruo Tifón. Se ataron con una cuerda para no separarse.',
    curiosidad: 'Actualmente contiene el punto vernal (equinoccio de primavera), el punto donde el Sol cruza el ecuador celeste.',
  },

  // ═══════════════════════════════════════════════════════════════
  // CONSTELACIONES BOREALES FAMOSAS (12)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'osa-mayor',
    nombre: 'Osa Mayor',
    nombreLatin: 'Ursa Major',
    abreviatura: 'UMa',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Alioth', magnitud: 1.77, tipo: 'Blanca peculiar' },
      { nombre: 'Dubhe', magnitud: 1.79, tipo: 'Gigante naranja' },
      { nombre: 'Alkaid', magnitud: 1.86, tipo: 'Azul' },
      { nombre: 'Mizar', magnitud: 2.27, tipo: 'Sistema séxtuple' },
    ],
    mejorMes: 'Abril',
    areaGrados: 1280,
    mitologia: 'Zeus transformó a la ninfa Calisto en osa para protegerla de Hera. Su hijo Arcas casi la mata cazando, así que Zeus lo convirtió en la Osa Menor.',
    curiosidad: 'El asterismo del "Carro" o "Big Dipper" es solo parte de esta constelación. Dubhe y Merak apuntan a la Estrella Polar.',
  },
  {
    id: 'osa-menor',
    nombre: 'Osa Menor',
    nombreLatin: 'Ursa Minor',
    abreviatura: 'UMi',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Polaris', magnitud: 1.98, tipo: 'Supergigante amarilla' },
      { nombre: 'Kochab', magnitud: 2.08, tipo: 'Gigante naranja' },
      { nombre: 'Pherkad', magnitud: 3.05, tipo: 'Gigante blanca' },
    ],
    mejorMes: 'Junio',
    areaGrados: 256,
    mitologia: 'Representa a Arcas, hijo de Calisto, transformado en oso por Zeus. También se asocia con una de las ninfas que cuidaron a Zeus bebé.',
    curiosidad: 'Polaris está a menos de 1° del polo norte celeste, por lo que parece inmóvil mientras todas las demás estrellas giran a su alrededor.',
  },
  {
    id: 'orion',
    nombre: 'Orión',
    nombreLatin: 'Orion',
    abreviatura: 'Ori',
    tipo: 'Boreal',
    hemisferio: 'Ambos',
    estrellasPrincipales: [
      { nombre: 'Rigel', magnitud: 0.13, tipo: 'Supergigante azul' },
      { nombre: 'Betelgeuse', magnitud: 0.50, tipo: 'Supergigante roja' },
      { nombre: 'Bellatrix', magnitud: 1.64, tipo: 'Gigante azul' },
      { nombre: 'Alnilam', magnitud: 1.69, tipo: 'Supergigante azul' },
    ],
    mejorMes: 'Enero',
    areaGrados: 594,
    mitologia: 'Orión fue un cazador gigante que presumía de poder matar a cualquier animal. Artemisa (o Gaia) envió un escorpión que lo mató.',
    curiosidad: 'Las tres estrellas del cinturón (Alnitak, Alnilam, Mintaka) apuntan a Sirio. Betelgeuse podría explotar como supernova "pronto" (en términos astronómicos).',
  },
  {
    id: 'casiopea',
    nombre: 'Casiopea',
    nombreLatin: 'Cassiopeia',
    abreviatura: 'Cas',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Schedar', magnitud: 2.23, tipo: 'Gigante naranja' },
      { nombre: 'Caph', magnitud: 2.27, tipo: 'Subgigante blanca' },
      { nombre: 'Gamma Cassiopeiae', magnitud: 2.47, tipo: 'Variable azul' },
    ],
    mejorMes: 'Noviembre',
    areaGrados: 598,
    mitologia: 'Casiopea era una reina que presumió de ser más bella que las nereidas. Poseidón la castigó atándola a una silla que gira eternamente en el cielo.',
    curiosidad: 'Su forma de W (o M según la época del año) la hace muy fácil de identificar. Es circumpolar desde latitudes medias del norte.',
  },
  {
    id: 'cefeo',
    nombre: 'Cefeo',
    nombreLatin: 'Cepheus',
    abreviatura: 'Cep',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Alderamin', magnitud: 2.51, tipo: 'Blanca' },
      { nombre: 'Alfirk', magnitud: 3.23, tipo: 'Gigante azul' },
      { nombre: 'Delta Cephei', magnitud: 3.5-4.4, tipo: 'Variable cefeida' },
    ],
    mejorMes: 'Octubre',
    areaGrados: 588,
    mitologia: 'Rey de Etiopía, esposo de Casiopea y padre de Andrómeda. Toda la familia fue colocada en el cielo.',
    curiosidad: 'Delta Cephei es el prototipo de las "cefeidas", estrellas variables cruciales para medir distancias cósmicas.',
  },
  {
    id: 'andromeda',
    nombre: 'Andrómeda',
    nombreLatin: 'Andromeda',
    abreviatura: 'And',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Alpheratz', magnitud: 2.06, tipo: 'Binaria azul' },
      { nombre: 'Mirach', magnitud: 2.05, tipo: 'Gigante roja' },
      { nombre: 'Almach', magnitud: 2.26, tipo: 'Sistema cuádruple' },
    ],
    mejorMes: 'Noviembre',
    areaGrados: 722,
    mitologia: 'Princesa encadenada a una roca como sacrificio a un monstruo marino, por culpa de la vanidad de su madre Casiopea. Fue rescatada por Perseo.',
    curiosidad: 'Contiene la Galaxia de Andrómeda (M31), el objeto más lejano visible a simple vista (2,5 millones de años luz).',
  },
  {
    id: 'perseo',
    nombre: 'Perseo',
    nombreLatin: 'Perseus',
    abreviatura: 'Per',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Mirfak', magnitud: 1.79, tipo: 'Supergigante amarilla' },
      { nombre: 'Algol', magnitud: 2.1-3.4, tipo: 'Binaria eclipsante' },
      { nombre: 'Atik', magnitud: 2.85, tipo: 'Supergigante azul' },
    ],
    mejorMes: 'Diciembre',
    areaGrados: 615,
    mitologia: 'El héroe que decapitó a Medusa y rescató a Andrómeda del monstruo marino. Se le representa sosteniendo la cabeza de la gorgona.',
    curiosidad: 'Algol ("la estrella del demonio") fue la primera binaria eclipsante descubierta. Su brillo varía cada 2,87 días.',
  },
  {
    id: 'pegaso',
    nombre: 'Pegaso',
    nombreLatin: 'Pegasus',
    abreviatura: 'Peg',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Enif', magnitud: 2.39, tipo: 'Supergigante naranja' },
      { nombre: 'Scheat', magnitud: 2.42, tipo: 'Gigante roja' },
      { nombre: 'Markab', magnitud: 2.49, tipo: 'Blanco-azulada' },
    ],
    mejorMes: 'Octubre',
    areaGrados: 1121,
    mitologia: 'El caballo alado que nació de la sangre de Medusa cuando Perseo la decapitó. Belerofonte lo montó para derrotar a la Quimera.',
    curiosidad: 'El Gran Cuadrado de Pegaso (con Alpheratz de Andrómeda) es un asterismo usado para encontrar otras constelaciones otoñales.',
  },
  {
    id: 'cisne',
    nombre: 'Cisne',
    nombreLatin: 'Cygnus',
    abreviatura: 'Cyg',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Deneb', magnitud: 1.25, tipo: 'Supergigante blanca' },
      { nombre: 'Sadr', magnitud: 2.20, tipo: 'Supergigante amarilla' },
      { nombre: 'Albireo', magnitud: 3.18, tipo: 'Doble (naranja+azul)' },
    ],
    mejorMes: 'Septiembre',
    areaGrados: 804,
    mitologia: 'Zeus se transformó en cisne para seducir a Leda, reina de Esparta. También representa a Orfeo, transformado en cisne tras su muerte.',
    curiosidad: 'Deneb forma el "Triángulo de Verano" con Vega (Lira) y Altair (Águila). Albireo es una de las estrellas dobles más bellas del cielo.',
  },
  {
    id: 'lira',
    nombre: 'Lira',
    nombreLatin: 'Lyra',
    abreviatura: 'Lyr',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Vega', magnitud: 0.03, tipo: 'Blanca' },
      { nombre: 'Sheliak', magnitud: 3.45, tipo: 'Binaria eclipsante' },
      { nombre: 'Sulafat', magnitud: 3.24, tipo: 'Gigante azul' },
    ],
    mejorMes: 'Agosto',
    areaGrados: 286,
    mitologia: 'La lira de Orfeo, el músico cuya música encantaba a todos los seres. Zeus la colocó en el cielo tras la muerte de Orfeo.',
    curiosidad: 'Vega fue la estrella polar hace 12.000 años y lo volverá a ser en 14.000 años. Fue la primera estrella fotografiada (1850).',
  },
  {
    id: 'aguila',
    nombre: 'Águila',
    nombreLatin: 'Aquila',
    abreviatura: 'Aql',
    tipo: 'Boreal',
    hemisferio: 'Ambos',
    estrellasPrincipales: [
      { nombre: 'Altair', magnitud: 0.77, tipo: 'Blanca' },
      { nombre: 'Tarazed', magnitud: 2.72, tipo: 'Gigante naranja' },
      { nombre: 'Alshain', magnitud: 3.71, tipo: 'Subgigante amarilla' },
    ],
    mejorMes: 'Agosto',
    areaGrados: 652,
    mitologia: 'El águila que llevó a Ganímedes al Olimpo, o el águila que Zeus enviaba para castigar a Prometeo devorando su hígado cada día.',
    curiosidad: 'Altair rota tan rápido (cada 9 horas) que está achatada en los polos. Forma el Triángulo de Verano con Vega y Deneb.',
  },
  {
    id: 'dragon',
    nombre: 'Dragón',
    nombreLatin: 'Draco',
    abreviatura: 'Dra',
    tipo: 'Boreal',
    hemisferio: 'Norte',
    estrellasPrincipales: [
      { nombre: 'Eltanin', magnitud: 2.23, tipo: 'Gigante naranja' },
      { nombre: 'Rastaban', magnitud: 2.73, tipo: 'Gigante amarilla' },
      { nombre: 'Thuban', magnitud: 3.67, tipo: 'Blanca' },
    ],
    mejorMes: 'Julio',
    areaGrados: 1083,
    mitologia: 'Representa a Ladón, el dragón que custodiaba las manzanas de oro del jardín de las Hespérides, matado por Hércules.',
    curiosidad: 'Thuban fue la estrella polar cuando se construyeron las pirámides de Egipto (hace ~4.500 años).',
  },

  // ═══════════════════════════════════════════════════════════════
  // CONSTELACIONES AUSTRALES FAMOSAS (8)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cruz-del-sur',
    nombre: 'Cruz del Sur',
    nombreLatin: 'Crux',
    abreviatura: 'Cru',
    tipo: 'Austral',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Ácrux', magnitud: 0.76, tipo: 'Sistema triple azul' },
      { nombre: 'Mimosa', magnitud: 1.25, tipo: 'Gigante azul' },
      { nombre: 'Gacrux', magnitud: 1.63, tipo: 'Gigante roja' },
    ],
    mejorMes: 'Mayo',
    areaGrados: 68,
    mitologia: 'No tiene mitología clásica griega (no era visible desde Grecia). Para los navegantes europeos simbolizaba la fe cristiana.',
    curiosidad: 'Es la constelación más pequeña del cielo, pero muy brillante. Aparece en las banderas de Australia, Nueva Zelanda, Brasil y otros países.',
  },
  {
    id: 'centauro',
    nombre: 'Centauro',
    nombreLatin: 'Centaurus',
    abreviatura: 'Cen',
    tipo: 'Austral',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Alfa Centauri', magnitud: -0.27, tipo: 'Sistema triple' },
      { nombre: 'Hadar', magnitud: 0.61, tipo: 'Sistema triple azul' },
      { nombre: 'Menkent', magnitud: 2.06, tipo: 'Gigante naranja' },
    ],
    mejorMes: 'Mayo',
    areaGrados: 1060,
    mitologia: 'Representa al sabio centauro Quirón, maestro de héroes. Era inmortal pero renunció a su inmortalidad para liberar a Prometeo.',
    curiosidad: 'Alfa Centauri es el sistema estelar más cercano al Sol (4,37 años luz). Próxima Centauri, parte del sistema, es la estrella más cercana.',
  },
  {
    id: 'carina',
    nombre: 'Carina',
    nombreLatin: 'Carina',
    abreviatura: 'Car',
    tipo: 'Austral',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Canopus', magnitud: -0.74, tipo: 'Supergigante blanca' },
      { nombre: 'Miaplacidus', magnitud: 1.68, tipo: 'Gigante blanca' },
      { nombre: 'Avior', magnitud: 1.86, tipo: 'Gigante naranja' },
    ],
    mejorMes: 'Marzo',
    areaGrados: 494,
    mitologia: 'Representa la quilla del navío Argo, en el que Jasón y los Argonautas buscaron el vellocino de oro.',
    curiosidad: 'Canopus es la segunda estrella más brillante del cielo nocturno después de Sirio. Se usaba para navegación espacial.',
  },
  {
    id: 'can-mayor',
    nombre: 'Can Mayor',
    nombreLatin: 'Canis Major',
    abreviatura: 'CMa',
    tipo: 'Austral',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Sirio', magnitud: -1.46, tipo: 'Binaria blanca' },
      { nombre: 'Adhara', magnitud: 1.50, tipo: 'Gigante azul' },
      { nombre: 'Wezen', magnitud: 1.84, tipo: 'Supergigante amarilla' },
    ],
    mejorMes: 'Febrero',
    areaGrados: 380,
    mitologia: 'Uno de los perros de caza de Orión. También se asocia con Lélaps, el perro que nunca fallaba una presa.',
    curiosidad: 'Sirio es la estrella más brillante del cielo nocturno y una de las más cercanas (8,6 años luz). Los egipcios basaban su calendario en ella.',
  },
  {
    id: 'vela',
    nombre: 'Vela',
    nombreLatin: 'Vela',
    abreviatura: 'Vel',
    tipo: 'Austral',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Gamma Velorum', magnitud: 1.78, tipo: 'Sistema múltiple' },
      { nombre: 'Delta Velorum', magnitud: 1.96, tipo: 'Triple' },
      { nombre: 'Lambda Velorum', magnitud: 2.21, tipo: 'Supergigante naranja' },
    ],
    mejorMes: 'Marzo',
    areaGrados: 500,
    mitologia: 'Las velas del navío Argo de Jasón y los Argonautas.',
    curiosidad: 'Contiene el remanente de supernova de Vela, resultado de una explosión hace unos 11.000 años, visible a simple vista como el segundo objeto más brillante en rayos X.',
  },
  {
    id: 'pez-volador',
    nombre: 'Pez Volador',
    nombreLatin: 'Volans',
    abreviatura: 'Vol',
    tipo: 'Austral',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Beta Volantis', magnitud: 3.77, tipo: 'Gigante naranja' },
      { nombre: 'Gamma Volantis', magnitud: 3.78, tipo: 'Gigante naranja' },
      { nombre: 'Zeta Volantis', magnitud: 3.93, tipo: 'Gigante naranja' },
    ],
    mejorMes: 'Marzo',
    areaGrados: 141,
    mitologia: 'No tiene mitología clásica. Fue creada en el siglo XVI por navegantes holandeses que observaron peces voladores en los mares del sur.',
    curiosidad: 'Es una de las 12 constelaciones creadas por Petrus Plancius basándose en observaciones de navegantes holandeses.',
  },
  {
    id: 'tucana',
    nombre: 'Tucán',
    nombreLatin: 'Tucana',
    abreviatura: 'Tuc',
    tipo: 'Austral',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Alpha Tucanae', magnitud: 2.86, tipo: 'Gigante naranja' },
      { nombre: 'Gamma Tucanae', magnitud: 3.99, tipo: 'Blanca' },
      { nombre: 'Zeta Tucanae', magnitud: 4.23, tipo: 'Amarilla' },
    ],
    mejorMes: 'Noviembre',
    areaGrados: 295,
    mitologia: 'Sin mitología clásica. Nombrada por navegantes europeos que vieron tucanes en Sudamérica.',
    curiosidad: 'Contiene la Pequeña Nube de Magallanes y el cúmulo globular 47 Tucanae, uno de los más brillantes del cielo.',
  },
  {
    id: 'pavo',
    nombre: 'Pavo',
    nombreLatin: 'Pavo',
    abreviatura: 'Pav',
    tipo: 'Austral',
    hemisferio: 'Sur',
    estrellasPrincipales: [
      { nombre: 'Peacock', magnitud: 1.94, tipo: 'Subgigante azul' },
      { nombre: 'Beta Pavonis', magnitud: 3.42, tipo: 'Blanca' },
      { nombre: 'Delta Pavonis', magnitud: 3.56, tipo: 'Subgigante amarilla' },
    ],
    mejorMes: 'Agosto',
    areaGrados: 378,
    mitologia: 'Representa al pavo real de Hera. Los "ojos" de su cola son los cien ojos de Argos, el gigante que vigilaba a Ío.',
    curiosidad: 'Delta Pavonis es una de las estrellas más similares al Sol y candidata para búsqueda de planetas habitables.',
  },
];

// Función auxiliar para obtener constelaciones por tipo
export function getConstellationsByType(tipo: ConstellationType): Constellation[] {
  return CONSTELLATIONS.filter(c => c.tipo === tipo);
}

// Función auxiliar para obtener constelaciones por hemisferio
export function getConstellationsByHemisphere(hemisferio: Hemisphere): Constellation[] {
  return CONSTELLATIONS.filter(c => c.hemisferio === hemisferio || c.hemisferio === 'Ambos');
}

// Función auxiliar para buscar constelaciones
export function searchConstellations(query: string): Constellation[] {
  const q = query.toLowerCase();
  return CONSTELLATIONS.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    c.nombreLatin.toLowerCase().includes(q) ||
    c.abreviatura.toLowerCase().includes(q) ||
    c.estrellasPrincipales.some(e => e.nombre.toLowerCase().includes(q)) ||
    c.mitologia.toLowerCase().includes(q)
  );
}

// Obtener constelaciones por mejor mes de observación
export function getConstellationsByMonth(mes: string): Constellation[] {
  return CONSTELLATIONS.filter(c => c.mejorMes.toLowerCase() === mes.toLowerCase());
}
