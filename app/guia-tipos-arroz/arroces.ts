/**
 * Catálogo de variedades de arroz de la guía.
 *
 * Vive aparte de `page.tsx` por una razón concreta: la CIFRA de variedades se anunciaba a mano en
 * el <h1>, en el subtítulo del bloque educativo y en la metadata, y las tres se quedaron en «30»
 * mientras el array contenía tres fichas repetidas (Inspector, 20/09/2026). Desde aquí, el número
 * lo da `TOTAL_VARIEDADES` y no puede volver a divergir.
 *
 * Las listas de opciones de los filtros también se derivan del array: una opción que no puede
 * devolver nada es un callejón sin salida —el desplegable ofrecía «Europa» y ninguna ficha llevaba
 * esa región—, exactamente el fallo que en los portales verticales se corrigió el 28/07/2026
 * derivando las parrillas del catálogo en vez de escribirlas a mano.
 */

// ============= Tipos =============

export type TipoGrano = 'Largo' | 'Medio' | 'Corto' | 'Glutinoso' | 'Salvaje';
export type NivelAlmidon = 'Bajo' | 'Medio' | 'Alto' | 'Muy alto';
export type RegionArroz = 'Asia' | 'Mediterráneo' | 'América' | 'África' | 'Europa';
export type UsoCulinario =
  | 'Risotto'
  | 'Paella'
  | 'Sushi'
  | 'Pilaf'
  | 'Curry'
  | 'Postre'
  | 'Acompañamiento'
  | 'Sopa';

/**
 * El método al que corresponde la proporción de agua de cada ficha. Sin declararlo, la cifra no
 * significa nada: 1:2,5-3 en una paella (recipiente ancho, mucha evaporación) y 1:2 en una olla
 * tapada no se contradicen, son dos formas distintas de cocer.
 */
export type MetodoCoccion =
  | 'Absorción en olla tapada'
  | 'Absorción en olla tapada, con reposo'
  | 'Paella: evaporación en recipiente ancho'
  | 'Risotto: caldo caliente añadido en cazos'
  | 'Al vapor, con remojo previo'
  | 'Hervido en abundante agua y escurrido';

export interface TipoArroz {
  nombre: string;
  nombreOriginal: string;
  tipoGrano: TipoGrano;
  almidon: NivelAlmidon;
  region: RegionArroz;
  origen: string;
  tiempoCoccion: string;
  proporcionAgua: string;
  metodoCoccion: MetodoCoccion;
  usosIdeales: UsoCulinario[];
  platosTipicos: string[];
  caracteristicas: string[];
  descripcion: string;
  curiosidad: string;
}

// ============= Datos =============

export const arroces: TipoArroz[] = [
  // ASIA — GRANO LARGO Y CORTO
  {
    nombre: 'Basmati',
    nombreOriginal: 'Basmati',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'Asia',
    origen: 'India/Pakistán (Himalaya)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:1.5',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Pilaf', 'Curry', 'Acompañamiento'],
    platosTipicos: ['Biryani', 'Pulao indio', 'Curry de pollo'],
    caracteristicas: ['Aromático', 'Granos sueltos', 'Se alarga al cocer'],
    descripcion:
      'Uno de los arroces aromáticos más conocidos del subcontinente indio. Granos largos, finos y muy aromáticos que se alargan hasta el doble al cocer. Cultivado tradicionalmente en las estribaciones del Himalaya.',
    curiosidad:
      "El nombre significa 'la fragancia' en sánscrito. India concentra en torno al 70 % del comercio mundial de basmati; de arroz en general produce alrededor de la cuarta parte",
  },
  {
    nombre: 'Jazmín / Tailandés',
    nombreOriginal: 'Hom Mali / Khao Hom Mali',
    tipoGrano: 'Largo',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'Tailandia',
    tiempoCoccion: '12-15 min',
    proporcionAgua: '1:1.5',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Curry', 'Acompañamiento', 'Pilaf'],
    platosTipicos: ['Pad thai', 'Curry tailandés', 'Khao mun gai'],
    caracteristicas: ['Aroma a jazmín', 'Ligeramente pegajoso', 'Suave al paladar'],
    descripcion:
      'Arroz aromático tailandés con notas naturales a flor de jazmín y palomitas de maíz. Más pegajoso que el basmati pero menos que el de sushi.',
    curiosidad:
      'Tailandia exporta alrededor de 7-8 millones de toneladas al año; India la superó como mayor exportador mundial de arroz a partir de 2012',
  },
  {
    nombre: 'Arroz de sushi japonés',
    nombreOriginal: 'Sushi-meshi / Koshihikari',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Asia',
    origen: 'Japón (Niigata y otras zonas)',
    tiempoCoccion: '20-25 min (con reposo)',
    proporcionAgua: '1:1.2',
    metodoCoccion: 'Absorción en olla tapada, con reposo',
    usosIdeales: ['Sushi', 'Acompañamiento'],
    platosTipicos: ['Sushi nigiri', 'Maki rolls', 'Onigiri y donburi'],
    caracteristicas: ['Pegajoso', 'Brillante', 'Se aliña con vinagre'],
    descripcion:
      'Arroz japonés de grano corto, pegajoso y brillante. Su humedad y su almidón permiten formar bolas que mantienen la forma. La variedad Koshihikari, cultivada en Niigata desde 1956, es la referencia de este tipo de arroz y la más extendida del país.',
    curiosidad:
      'El Koshihikari ocupa alrededor de un tercio de la superficie arrocera de Japón, y el de algunas zonas de Niigata se vende muy por encima del precio del arroz corriente',
  },
  {
    nombre: 'Arroz glutinoso',
    nombreOriginal: 'Sticky rice / Khao niao',
    tipoGrano: 'Glutinoso',
    almidon: 'Muy alto',
    region: 'Asia',
    origen: 'Sudeste asiático',
    tiempoCoccion: '30-40 min al vapor',
    proporcionAgua: 'Sin agua de cocción (remojo previo de 4-8 h)',
    metodoCoccion: 'Al vapor, con remojo previo',
    usosIdeales: ['Postre', 'Acompañamiento'],
    platosTipicos: ['Mango sticky rice', 'Khao niao mamuang', 'Onde-onde'],
    caracteristicas: ['Muy pegajoso', 'Casi traslúcido', 'Cocción al vapor'],
    descripcion:
      "Arroz glutinoso del sudeste asiático que se remoja varias horas y se cocina al vapor en cestos de bambú. Sin gluten real (a pesar del nombre): se llama 'glutinoso' por su pegajosidad extrema.",
    curiosidad:
      'En Laos se come a diario con las manos formando bolitas — es alimento básico nacional',
  },
  {
    nombre: 'Arroz negro / Forbidden rice',
    nombreOriginal: 'Riso Venere / Hēi mǐ',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'China',
    tiempoCoccion: '30-35 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Riso Venere', 'Ensalada de arroz negro', 'Postres asiáticos'],
    caracteristicas: ['Color negro intenso', 'Rico en antocianinas', 'Sabor a frutos secos'],
    descripcion:
      "Variedad de arroz integral negro originaria de China, llamado hēi mǐ (黑米). En el comercio occidental se vende como 'forbidden rice' aludiendo a una tradición según la cual estaba reservado para el emperador — una leyenda popularizada por los importadores estadounidenses en los años 90. Su color viene de las antocianinas, los mismos pigmentos que dan color a moras y frutos rojos.",
    curiosidad:
      'En la China imperial se castigaba con la muerte a los plebeyos que lo cultivaban sin permiso',
  },
  {
    nombre: 'Arroz rojo de Camarga',
    nombreOriginal: 'Riz rouge de Camargue (IGP)',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'Mediterráneo',
    origen: 'Camarga (Francia)',
    tiempoCoccion: '30-40 min',
    proporcionAgua: '1:2.5',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: [
      'Salade de riz rouge',
      'Acompañamiento de pescados',
      'Pilaf provenzal',
    ],
    caracteristicas: ['Color rojo natural', 'Cáscara conservada', 'Tierra salobre'],
    descripcion:
      'Arroz integral rojo cultivado en los humedales salobres de la Camarga, en el delta del Ródano. Conserva el salvado —de ahí el color— y por eso pide más agua y más tiempo que un arroz blanco. Tiene IGP francesa desde 2000.',
    curiosidad:
      'La Camarga es prácticamente la única zona arrocera de Francia: el cultivo se extendió tras la Segunda Guerra Mundial, entre otras razones porque el riego del arrozal ayudaba a desalar las tierras del delta',
  },
  {
    nombre: 'Arroz integral / Brown rice',
    nombreOriginal: 'Brown rice',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'Asia',
    origen: 'Mundial',
    tiempoCoccion: '35-45 min',
    proporcionAgua: '1:2.5',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Bol de cereales y verduras', 'Arroz integral con verduras', 'Khichdi'],
    caracteristicas: [
      'Cáscara intacta',
      'Más fibra y nutrientes',
      'Sabor a frutos secos',
    ],
    descripcion:
      'Arroz al que solo se le ha quitado la cáscara externa, conservando el salvado y el germen. Más nutritivo que el blanco pero requiere más cocción.',
    curiosidad:
      'Al conservar salvado y germen aporta más fibra, vitaminas del grupo B y minerales que el blanco refinado; cuánto más depende de la variedad y del grado de pulido',
  },
  {
    nombre: 'Arroz salvaje / Wild rice',
    nombreOriginal: 'Wild rice / Manoomin',
    tipoGrano: 'Salvaje',
    almidon: 'Bajo',
    region: 'América',
    origen: 'Norteamérica (Grandes Lagos)',
    tiempoCoccion: '45-60 min',
    proporcionAgua: '1:3',
    metodoCoccion: 'Hervido en abundante agua y escurrido',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: [
      'Sopa de arroz salvaje',
      'Pavo relleno',
      'Mezclas con arroz blanco',
    ],
    caracteristicas: [
      'No es arroz real',
      'Granos largos y oscuros',
      'Sabor terroso y a frutos secos',
    ],
    descripcion:
      'Técnicamente no es arroz: es semilla de una hierba acuática nativa de Norteamérica. Las tribus Ojibwe lo recolectan tradicionalmente en canoa.',
    curiosidad:
      "Para los Ojibwe es alimento sagrado: el 'manoomin' o 'comida buena' del Creador",
  },

  // MEDITERRÁNEO
  {
    nombre: 'Arroz Bomba',
    nombreOriginal: 'Arroz Bomba',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Valencia/Calasparra (España)',
    tiempoCoccion: '16-18 min',
    proporcionAgua: '1:2.5-3',
    metodoCoccion: 'Paella: evaporación en recipiente ancho',
    usosIdeales: ['Paella', 'Acompañamiento'],
    platosTipicos: ['Paella valenciana', 'Arroz a banda', 'Arroz negro'],
    caracteristicas: [
      'Absorbe 3x su volumen',
      'No se pasa fácilmente',
      'Ideal para paella',
    ],
    descripcion:
      'El arroz preferido para la paella. Variedad de grano corto y duro que absorbe el triple de líquido sin pasarse. Tiene D.O. Valencia y D.O. Calasparra.',
    curiosidad:
      'Su rendimiento por hectárea es bajo comparado con el de otras variedades, y eso explica buena parte de su precio',
  },
  {
    nombre: 'Arroz Senia',
    nombreOriginal: 'Arroz Senia',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Albufera de Valencia',
    tiempoCoccion: '14-16 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Paella: evaporación en recipiente ancho',
    usosIdeales: ['Paella', 'Acompañamiento'],
    platosTipicos: ['Paella tradicional', 'Arroz al horno', 'Arroz caldoso'],
    caracteristicas: [
      'Más blando que Bomba',
      'Absorbe sabor',
      'Más económico que Bomba',
    ],
    descripcion:
      'Arroz valenciano de grano corto, alternativa más económica al Bomba. Se pasa más fácilmente pero absorbe muy bien los sabores del caldo y el sofrito.',
    curiosidad:
      'Es el arroz de la paella cotidiana en las casas valencianas, mientras el Bomba se reserva más para ocasiones',
  },
  {
    nombre: 'Arroz Bahía',
    nombreOriginal: 'Bahía',
    tipoGrano: 'Corto',
    almidon: 'Medio',
    region: 'Mediterráneo',
    origen: 'Sevilla/Valencia',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Paella: evaporación en recipiente ancho',
    usosIdeales: ['Paella', 'Acompañamiento'],
    platosTipicos: [
      'Paella mixta',
      'Arroz con costra',
      'Arroz caldoso de marisco',
    ],
    caracteristicas: ['Equilibrado', 'Versátil', 'Buena absorción'],
    descripcion:
      'Variedad española muy versátil, intermedia entre Bomba y Senia en absorción. Muy usada en restaurantes por su buen comportamiento general.',
    curiosidad:
      "Es el 'todo terreno' de los arroces de paella: admite paella seca, arroz al horno y arroz caldoso sin cambiar de variedad",
  },
  {
    nombre: 'Arborio',
    nombreOriginal: 'Arborio',
    tipoGrano: 'Corto',
    almidon: 'Muy alto',
    region: 'Mediterráneo',
    origen: 'Piamonte (Italia)',
    tiempoCoccion: '18-20 min',
    proporcionAgua: '1:3 aprox., en cazos',
    metodoCoccion: 'Risotto: caldo caliente añadido en cazos',
    usosIdeales: ['Risotto', 'Postre'],
    platosTipicos: [
      'Risotto alla milanese',
      'Risotto ai funghi porcini',
      'Riso al latte',
    ],
    caracteristicas: [
      'Liberación gradual de almidón',
      'Cremosidad sin nata',
      'Mantecato final',
    ],
    descripcion:
      'Arroz italiano del Po, esencial para hacer risotto. Su altísimo almidón se libera gradualmente al remover, creando la cremosidad característica sin necesidad de nata.',
    curiosidad:
      'Lleva el nombre de la ciudad de Arborio en el Piamonte, donde se cultiva desde el siglo XV',
  },
  {
    nombre: 'Carnaroli',
    nombreOriginal: 'Carnaroli',
    tipoGrano: 'Corto',
    almidon: 'Muy alto',
    region: 'Mediterráneo',
    origen: 'Vercelli (Italia)',
    tiempoCoccion: '16-18 min',
    proporcionAgua: '1:3 aprox., en cazos',
    metodoCoccion: 'Risotto: caldo caliente añadido en cazos',
    usosIdeales: ['Risotto'],
    platosTipicos: [
      'Risotto al nero di seppia',
      'Risotto alla parmigiana',
      'Risotto al limone',
    ],
    caracteristicas: [
      'Muy almidonoso',
      'Mantiene la firmeza al dente',
      'Más caro que Arborio',
    ],
    descripcion:
      'Arroz muy usado en las cocinas italianas para el risotto. Aún más almidonoso que el Arborio pero mantiene mejor la textura al dente. Cultivado sobre todo en el norte de Italia.',
    curiosidad:
      'Muchas cocinas italianas lo prefieren al Arborio porque aguanta mejor el punto al dente hasta el final del mantecado',
  },
  {
    nombre: 'Vialone Nano',
    nombreOriginal: 'Vialone Nano',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Verona (Italia)',
    tiempoCoccion: '15-17 min',
    proporcionAgua: '1:3 aprox., en cazos',
    metodoCoccion: 'Risotto: caldo caliente añadido en cazos',
    usosIdeales: ['Risotto'],
    platosTipicos: [
      "Risotto all'isolana",
      'Risi e bisi (con guisantes)',
      'Risotto al radicchio',
    ],
    caracteristicas: [
      'Grano más pequeño',
      'Absorbe mucho líquido',
      'Tradicional véneto',
    ],
    descripcion:
      "Arroz tradicional véneto con IGP de Verona. Grano más pequeño y absorbente que Arborio o Carnaroli, ideal para risottos 'all'onda' (cremoso-líquido).",
    curiosidad:
      "El plato 'risi e bisi' veneciano es plato oficial del dux desde el siglo XV — se servía cada 25 de abril",
  },

  // AMÉRICA
  {
    nombre: 'Arroz blanco largo',
    nombreOriginal: 'Long-grain white rice',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'América',
    origen: 'EE.UU./Mundial',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Arroz blanco', 'Arroz con frijoles', 'Arroz con pollo'],
    caracteristicas: ['Granos sueltos', 'Suave', 'Versátil'],
    descripcion:
      'Arroz blanco de grano largo, uno de los más vendidos en supermercados de todo el mundo. Granos sueltos y suaves, usado como acompañamiento en muchísimas cocinas.',
    curiosidad:
      'EE.UU. produce unos 7-8 millones de toneladas al año, lejos de los grandes productores asiáticos: el delta del Mississippi y California son sus zonas principales',
  },
  {
    nombre: 'Arroz Carolina',
    nombreOriginal: 'Carolina rice',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'América',
    origen: 'Carolina del Sur (EE.UU.)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Acompañamiento', 'Sopa', 'Pilaf'],
    platosTipicos: ["Hoppin' John", 'Charleston red rice', 'Lowcountry boil'],
    caracteristicas: ['Sabor a fruto seco', 'Aromático', 'Histórico'],
    descripcion:
      "Variedad histórica de Carolina del Sur, casi extinta y revivida en los años 80. Base de la cocina 'Lowcountry' de Charleston. Aromático y nutritivo.",
    curiosidad:
      'El cultivo del Carolina Gold se desarrolló gracias al conocimiento técnico de personas esclavizadas procedentes de la Costa del Arroz africana (Senegambia, Sierra Leona, Liberia), que ya cultivaban Oryza glaberrima en sus regiones de origen. Su trabajo forzado fue el motor del sistema rizícola sureño y uno de los ejemplos más documentados de transferencia técnica desde África al continente americano',
  },
  {
    nombre: 'Arroz Calrose',
    nombreOriginal: 'Calrose (arroz de sushi de California)',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'América',
    origen: 'California (EE.UU.)',
    tiempoCoccion: '18-20 min',
    proporcionAgua: '1:1.2 para sushi · 1:1.5 como guarnición',
    metodoCoccion: 'Absorción en olla tapada, con reposo',
    usosIdeales: ['Sushi', 'Acompañamiento'],
    platosTipicos: ['Sushi y rolls de California', 'Spam musubi', 'Bibimbap'],
    caracteristicas: ['Grano medio japónica', 'Pegajoso al enfriarse', 'Versátil pan-asiático'],
    descripcion:
      'Arroz californiano desarrollado en 1948 a partir de variedades japonesas. Es el arroz con el que se hace habitualmente el sushi en Estados Unidos, y resulta más asequible que el arroz de sushi importado de Japón.',
    curiosidad:
      'La mayor parte del arroz que se vende en California para sushi es Calrose, no una variedad traída de Japón',
  },
  {
    nombre: 'Arroz Jasmin tailandés americano',
    nombreOriginal: 'American jasmine',
    tipoGrano: 'Largo',
    almidon: 'Medio',
    region: 'América',
    origen: 'Texas/Luisiana (EE.UU.)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:1.5',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Curry', 'Acompañamiento'],
    platosTipicos: [
      'Curry tailandés americano',
      'Pollo cajún con arroz',
      'Jambalaya',
    ],
    caracteristicas: ['Aromático', 'Adaptado', 'Suave'],
    descripcion:
      'Variantes de arroz jazmín cultivadas en EE.UU., adaptadas al clima del sur estadounidense. Sustituye al jazmín tailandés con un perfil similar pero menos intenso.',
    curiosidad:
      'Texas y Luisiana concentran la mayor parte del arroz jazmín cultivado en EE.UU., en llanuras costeras con riego abundante',
  },

  // ÁFRICA, EUROPA Y NORTEAMÉRICA
  {
    nombre: 'Arroz africano / African rice',
    nombreOriginal: 'Oryza glaberrima',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'África',
    origen: 'África Occidental',
    tiempoCoccion: '20-25 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Pilaf', 'Sopa'],
    platosTipicos: ['Jollof rice', 'Thieboudienne', 'Mafe'],
    caracteristicas: [
      'Especie distinta del Oryza sativa',
      'Resistente a sequía',
      'Sabor único',
    ],
    descripcion:
      'Arroz africano (Oryza glaberrima), especie distinta del arroz asiático. Cultivado en África Occidental durante 3.500 años antes de la llegada del arroz asiático.',
    curiosidad:
      'Se domesticó independientemente del arroz asiático hace 3.500 años en el delta del Níger',
  },
  {
    // El nombre anterior, «Arroz Bahia / Mahatma», mezclaba una variedad española de grano corto
    // con una marca registrada de Texas. La marca se conserva entre paréntesis para que quien la
    // busque siga encontrando la ficha, pero ya no da nombre a la variedad.
    nombre: 'Arroz largo de Texas',
    nombreOriginal: 'U.S. long grain (marca Mahatma)',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'América',
    origen: 'Texas (EE.UU.)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Pollo con arroz', 'Gumbo', 'Jambalaya'],
    caracteristicas: ['Granos muy largos', 'Sueltos al cocer', 'Base de la cocina cajún'],
    descripcion:
      'Arroz de grano extralargo cultivado en la costa del Golfo de Estados Unidos. Granos sueltos y limpios, muy usado como acompañamiento en la cocina del sur estadounidense.',
    curiosidad:
      'Mahatma, el nombre con el que se vende buena parte de este arroz, es una marca registrada desde 1932, no una variedad: no debe confundirse con el Bahía, que es una variedad española de grano corto',
  },
  {
    nombre: 'Arroz Roma',
    nombreOriginal: 'Roma',
    tipoGrano: 'Corto',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Lombardía (Italia)',
    tiempoCoccion: '15-17 min',
    proporcionAgua: '1:3 aprox., en cazos',
    metodoCoccion: 'Risotto: caldo caliente añadido en cazos',
    usosIdeales: ['Risotto', 'Postre'],
    platosTipicos: ['Risotto allo zafferano', 'Riso al latte', 'Supplì romani'],
    caracteristicas: [
      'Equilibrado',
      'Más asequible que Carnaroli',
      'Suave al paladar',
    ],
    descripcion:
      'Variedad italiana de grano grueso, intermedia entre el Arborio y el Carnaroli. Usada en cocinas italianas para risottos cotidianos y para el arroz con leche.',
    curiosidad:
      "Se llama 'Roma' por la capital pero se cultiva en el norte, y es una variedad distinta del Arborio con el que a veces se confunde",
  },
  {
    nombre: 'Arroz Padano',
    nombreOriginal: 'Padano',
    tipoGrano: 'Medio',
    almidon: 'Alto',
    region: 'Mediterráneo',
    origen: 'Llanura del Po (Italia)',
    tiempoCoccion: '16-18 min',
    proporcionAgua: '1:3 aprox., en cazos',
    metodoCoccion: 'Risotto: caldo caliente añadido en cazos',
    usosIdeales: ['Risotto', 'Sopa'],
    platosTipicos: [
      'Risotto alla milanese',
      'Riso e fagioli',
      'Minestrone con riso',
    ],
    caracteristicas: ['Equilibrado', 'Italiano clásico', 'Buena resistencia'],
    descripcion:
      'Arroz italiano de la llanura del Po, gran productor histórico de arroz desde el siglo XV. Variedad sólida y equilibrada, usada en risottos clásicos del norte.',
    curiosidad:
      'La llanura del Po es la mayor zona arrocera de Europa: 220.000 hectáreas, 50% del arroz europeo',
  },

  // ASIA — VARIEDADES COTIDIANAS
  {
    nombre: 'Arroz indio Sona Masoori',
    nombreOriginal: 'Sona Masoori',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'India (Andhra Pradesh)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Pilaf', 'Acompañamiento', 'Curry'],
    platosTipicos: ['Idli sambar', 'Curry del sur de India', 'Bisi bele bath'],
    caracteristicas: ['Económico', 'Granos medios', 'Cotidiano en el sur de India'],
    descripcion:
      'Arroz cotidiano del sur de la India, especialmente Andhra Pradesh y Karnataka. Más económico que el basmati, granos medios y suaves para platos diarios.',
    curiosidad:
      'Es uno de los arroces más consumidos en el sur de la India, muy por delante del basmati en la comida diaria',
  },
  {
    nombre: 'Arroz pegajoso negro / Black sticky rice',
    nombreOriginal: 'Khao niao dam',
    tipoGrano: 'Glutinoso',
    almidon: 'Muy alto',
    region: 'Asia',
    origen: 'Sudeste asiático',
    tiempoCoccion: '30-40 min al vapor',
    proporcionAgua: 'Sin agua de cocción (remojo previo de 4-8 h)',
    metodoCoccion: 'Al vapor, con remojo previo',
    usosIdeales: ['Postre'],
    platosTipicos: [
      'Arroz negro con leche de coco',
      'Khao niao dam',
      'Bubur ketan hitam',
    ],
    caracteristicas: [
      'Color púrpura intenso',
      'Sabor a frutos secos',
      'Postre típico',
    ],
    descripcion:
      'Versión negra del arroz glutinoso, casi púrpura cuando se cocina. Muy usado en postres del sudeste asiático con leche de coco y azúcar de palma.',
    curiosidad:
      'En Indonesia se sirve en celebraciones familiares como símbolo de prosperidad por su intenso color violeta',
  },
  {
    nombre: 'Arroz Patna',
    nombreOriginal: 'Patna rice',
    tipoGrano: 'Largo',
    almidon: 'Bajo',
    region: 'Asia',
    origen: 'Bihar (India)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:1.5',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Acompañamiento', 'Pilaf', 'Curry'],
    platosTipicos: [
      'Curry indio',
      'Curry de estilo británico',
      'Pulao',
    ],
    caracteristicas: ['Granos largos', 'Sueltos', 'Aromático suave'],
    descripcion:
      'Arroz de grano largo originario de Patna (Bihar), tradicionalmente exportado a Reino Unido. Estándar en los restaurantes indios británicos durante décadas.',
    curiosidad:
      'En Reino Unido era el arroz más vendido para acompañar curry hasta que el basmati lo desplazó en los 90',
  },
  {
    nombre: 'Arroz Surati / Kolam',
    nombreOriginal: 'Kolam',
    tipoGrano: 'Medio',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'Maharashtra (India)',
    tiempoCoccion: '16-18 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Acompañamiento', 'Pilaf'],
    platosTipicos: ['Thali de Maharashtra', 'Khichdi', 'Pulao'],
    caracteristicas: ['Económico', 'Granos medios', 'Cotidiano'],
    descripcion:
      'Arroz cotidiano del oeste de India, popular en Maharashtra y Gujarat. Más económico que el basmati y ampliamente usado en comidas familiares diarias.',
    curiosidad:
      'En las thalis (platos completos) de Maharashtra es el arroz por defecto, no el basmati',
  },
  {
    nombre: 'Arroz Ponni',
    nombreOriginal: 'Ponni / பொன்னி',
    tipoGrano: 'Corto',
    almidon: 'Medio',
    region: 'Asia',
    origen: 'Tamil Nadu (India)',
    tiempoCoccion: '15-18 min',
    proporcionAgua: '1:2',
    metodoCoccion: 'Absorción en olla tapada',
    usosIdeales: ['Acompañamiento', 'Curry'],
    platosTipicos: ['Sambar rice', 'Curd rice', 'Idli'],
    caracteristicas: [
      'Cultivado en el delta del Cauvery',
      'Robusto',
      'Resistente',
    ],
    descripcion:
      "Arroz tamil cultivado en el fértil delta del río Cauvery. Su nombre ('Ponni') es uno de los nombres del río Cauvery en tamil antiguo. Variedad híbrida moderna.",
    curiosidad:
      'Fue desarrollado en 1986 por el Tamil Nadu Rice Research Institute para resistir plagas regionales',
  },
];

/** La cifra que anuncian el <h1>, el bloque educativo y la metadata. Sale del array, siempre. */
export const TOTAL_VARIEDADES = arroces.length;

// ============= Opciones de los filtros, derivadas del catálogo =============

// El orden es el que tiene sentido leer (del grano más largo al más corto, del almidón más bajo
// al más alto); de esa lista solo se ofrece lo que alguna ficha declara de verdad.
const ORDEN_GRANO: TipoGrano[] = ['Largo', 'Medio', 'Corto', 'Glutinoso', 'Salvaje'];
const ORDEN_ALMIDON: NivelAlmidon[] = ['Bajo', 'Medio', 'Alto', 'Muy alto'];
const ORDEN_REGION: RegionArroz[] = ['Asia', 'Mediterráneo', 'América', 'África', 'Europa'];
const ORDEN_USO: UsoCulinario[] = [
  'Risotto',
  'Paella',
  'Sushi',
  'Pilaf',
  'Curry',
  'Postre',
  'Acompañamiento',
  'Sopa',
];

const granosPresentes = new Set<TipoGrano>(arroces.map((a) => a.tipoGrano));
const almidonesPresentes = new Set<NivelAlmidon>(arroces.map((a) => a.almidon));
const regionesPresentes = new Set<RegionArroz>(arroces.map((a) => a.region));
const usosPresentes = new Set<UsoCulinario>(arroces.flatMap((a) => a.usosIdeales));

export const TIPOS_GRANO: TipoGrano[] = ORDEN_GRANO.filter((g) => granosPresentes.has(g));
export const NIVELES_ALMIDON: NivelAlmidon[] = ORDEN_ALMIDON.filter((n) =>
  almidonesPresentes.has(n),
);
export const REGIONES: RegionArroz[] = ORDEN_REGION.filter((r) => regionesPresentes.has(r));
export const USOS: UsoCulinario[] = ORDEN_USO.filter((u) => usosPresentes.has(u));

// ============= Búsqueda =============

/**
 * Minúsculas y sin diacríticos, para comparar los dos lados de la búsqueda.
 * Sin esto, «jazmin» devolvía cero y la app respondía «No se encontraron arroces» sobre una ficha
 * que sí existe — y la propia metadata de la app usa la forma sin tilde en sus keywords, así que
 * el tráfico que llegaba por esa consulta reproducía el fallo al teclearla dentro.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
