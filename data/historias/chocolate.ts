import type { HistoriaData } from './types';

export const chocolate: HistoriaData = {
  slug: 'chocolate',
  titulo: 'Historia del Chocolate: Del Cacao Sagrado de los Mayas a la Industria Global',
  subtitulo: `De la bebida amarga de los dioses olmecas (1500 a.C.) a los 130.000 millones de euros del mercado mundial: 3.500 años de historia del alimento más deseado del planeta`,
  descripcionSEO:
    'Cronología interactiva del chocolate: de los olmecas y mayas (1500 a.C.) a la industrialización victoriana (Cadbury, Nestlé, Lindt), el comercio justo y los retos del cambio climático. 10 hitos, 6 eras, historia completa del cacao y el chocolate.',
  keywords: [
    'historia del chocolate cronología',
    'olmecas mayas aztecas cacao xocolatl origen',
    'hernán cortés chocolate europa conquista',
    'cadbury nestlé lindt van houten industrialización chocolate',
    'chocolate con leche daniel peter henri nestlé 1875',
    'comercio justo cacao fairtrade bean to bar',
    'trabajo infantil cacao costa de marfil ghana',
    'cambio climático cacao theobroma cacao futuro',
  ],
  anioInicio: -1500,
  anioFin: 9999,

  hitos: [
    {
      id: 'olmecas-cacao-origen',
      nombre: 'Olmecas y el cacao primigenio',
      anioInicio: -1500,
      anioFin: -400,
      color: '#7C3AED',
      categoria: 'mesoamerica',
      descripcion:
        `Los olmecas, cultura madre de Mesoamérica (costa del Golfo de México), son el primer pueblo documentado que cultivó y utilizó el cacao. La evidencia arqueológica más antigua procede de vasijas de cerámica halladas en El Manatí (Veracruz, México) con residuos de teobromina —el alcaloide característico del cacao—, datadas en ~1500 a.C. (análisis publicados en PNAS por John Henderson y Rosemary Joyce). La palabra "cacao" deriva probablemente del proto-mixe-zoqueano hablado por los olmecas: *kakawa*. El cacao olmeca no era el chocolate sólido dulce moderno: se consumía como una bebida líquida amarga y fermentada, mezclada con maíz, chile y achiote, servida fría y espumosa. Tenía un papel ceremonial —aparece en enterramientos de élite— y era uno de los primeros bienes de lujo en redes comerciales mesoamericanas. Theobroma cacao (nombre propuesto por Linneo en 1753) significa en latín "alimento de los dioses".`,
      obraIconica:
        'Vasijas con residuos de teobromina de El Manatí, Veracruz (~1500 a.C.) — evidencia arqueológica publicada en PNAS',
      paises: ['México (costa del Golfo)'],
    },
    {
      id: 'mayas-alimento-dioses',
      nombre: 'Los mayas y el kakaw sagrado',
      anioInicio: -400,
      anioFin: 900,
      color: '#7C3AED',
      categoria: 'mesoamerica',
      descripcion:
        `Los mayas desarrollaron la cultura del cacao hasta una sofisticación sin parangón hasta la Europa del siglo XIX. El Códice de Madrid muestra a dioses derramando cacao sobre la humanidad; el Popol Vuh menciona el cacao entre los alimentos que los dioses utilizaron para crear a los primeros seres humanos. La bebida maya, *kakaw*, era fría, espumosa y amarga, condimentada con vainilla, miel silvestre, chile y flores; la espuma se obtenía vertiendo el líquido de una vasija a otra desde gran altura (murales de Chichén Itzá). Los granos de cacao funcionaban también como moneda: según el Libro de Tasaciones colonial (1548), un tomate valía un grano, un aguacate tres y un esclavo cien. Las vasijas mayas más elaboradas con inscripciones jeroglíficas del cacao se destinaban exclusivamente a los gobernantes. Los cacao-pods tallados en piedra adornan las estelas de Quiriguá y Palenque.`,
      obraIconica:
        'Códice de Madrid (s. XI-XII) y vasija funeraria con inscripción jeroglífica *kakaw* (700 d.C.)',
      paises: ['Guatemala', 'México (Yucatán)', 'Belice', 'Honduras'],
    },
    {
      id: 'aztecas-xocolatl-conquista',
      nombre: 'Aztecas: xocolatl y la conquista española',
      anioInicio: 900,
      anioFin: 1528,
      color: '#7C3AED',
      categoria: 'mesoamerica',
      descripcion:
        `Los aztecas adoptaron el cacao de las culturas conquistadas y lo convirtieron en símbolo de poder y distinción social. Según las Cartas de Relación de Hernán Cortés y la crónica de Bernal Díaz del Castillo, el emperador Moctezuma II consumía xocolatl fría en copas de oro, reservada para guerreros, nobles, sacerdotes y mercaderes de élite (*pochtecas*). El franciscano Bernardino de Sahagún describió en el siglo XVI la preparación: granos tostados, molidos en metate, mezclados con agua, miel, vainilla y flores. Los granos de cacao pagaban tributos —los documentos del Tributo de Moctezuma registran decenas de miles de cargas anuales—. En 1519, Cortés recibe xocolatl en Tenochtitlán; en 1528 lleva cacao y los utensilios para prepararlo a la corte española del rey Carlos I. Esta travesía del Atlántico es el punto de partida del chocolate europeo.`,
      obraIconica:
        `*Historia General de las Cosas de Nueva España* de Bernardino de Sahagún (s. XVI) y Cartas de Relación de Hernán Cortés (1519-1520)`,
      paises: ['México (Tenochtitlán)', 'España'],
    },
    {
      id: 'europa-chocolate-azucar',
      nombre: 'El chocolate conquista Europa',
      anioInicio: 1528,
      anioFin: 1700,
      color: '#D97706',
      categoria: 'europa',
      descripcion:
        `El chocolate llega a España en 1528, pero la corte mantiene el secreto durante décadas. La mezcla con azúcar de caña (y luego canela y vainilla) transforma la bebida amarga mesoamericana en algo apetecible para el paladar europeo. Los monasterios españoles, que recibían cacao en tributo, son los primeros "fabricantes" europeos. Italia lo conoce en 1606 a través del mercader florentino Francesco d'Antonio Carletti. A Francia llega en 1615 con la boda de Ana de Austria con Luis XIII. En 1657, el primer Chocolate House de Londres abre sus puertas —pronto habrá más de 2.000, funcionando como clubes sociales masculinos donde se debaten política y negocios—. Los médicos del s. XVII debaten si el chocolate es nutritivo o pernicioso. El jesuita Antonio Colmenero de Ledesma publica en 1631 el primer tratado europeo sobre el chocolate medicinal.`,
      obraIconica:
        `*Curioso tratado de la naturaleza y calidad del chocolate* de Antonio Colmenero de Ledesma (Madrid, 1631)`,
      paises: ['España', 'Francia', 'Italia', 'Inglaterra', 'Países Bajos'],
    },
    {
      id: 'plantaciones-coloniales',
      nombre: 'Plantaciones coloniales y expansión del cacao',
      anioInicio: 1700,
      anioFin: 1820,
      color: '#DC2626',
      categoria: 'colonia',
      descripcion:
        `A medida que el chocolate se democratiza en Europa, la producción de cacao requiere una escala que la economía de plantación colonial está dispuesta a proveer. El Caribe (Trinidad, Martinica, Cuba), América del Sur (Venezuela, Ecuador, Brasil) y posteriormente África Occidental se convierten en productores masivos. El cacao venezolano (criollo y trinitario) abastece gran parte de Europa en el siglo XVIII. Las plantaciones utilizan también trabajo esclavizado en sus etapas de consolidación colonial. São Tomé (isla portuguesa en el Golfo de Guinea) es la primera colonia africana de cacao —patrón que se repetiría en el siglo XX—. El precio del cacao baja gradualmente conforme aumenta la oferta colonial, aunque sigue siendo un lujo para la clase media europea.`,
      obraIconica:
        'Registros de la Compañía Guipuzcoana de Caracas (1728-1785) — monopolio español del cacao venezolano',
      paises: ['Venezuela', 'Trinidad', 'Ecuador', 'Brasil', 'Cuba', 'São Tomé'],
    },
    {
      id: 'industrializacion-chocolate-solido',
      nombre: 'La Revolución Industrial del chocolate sólido',
      anioInicio: 1820,
      anioFin: 1945,
      color: '#374151',
      categoria: 'industria',
      descripcion:
        `Cuatro innovaciones técnicas transforman el chocolate de bebida a sólido masivo en menos de cincuenta años. 1) El químico holandés Coenraad Johannes van Houten patenta en 1828 la prensa hidráulica de cacao y el proceso de "dutching" (alcalinización) que suaviza el sabor. 2) Joseph Fry & Sons (Bristol) presenta en 1847 el primer chocolate sólido comestible mezclando cacao en polvo, azúcar y manteca de cacao fundida. 3) En 1875, el suizo Daniel Peter desarrolla el chocolate con leche añadiendo leche condensada de Henri Nestlé —tras ocho años de experimentos—; ambos fundan la empresa que hoy es Nestlé S.A. 4) Rodolphe Lindt inventa en 1879 el proceso de "conchado" (agitación prolongada), que produce la textura suave característica. John Cadbury funda Cadbury (Birmingham, 1824); Milton Hershey construye su fábrica en Pensilvania (1900); Toblerone aparece en Berna (1908). Las raciones militares de la I y II Guerra Mundial incluyen chocolate Hershey.`,
      obraIconica:
        'Patente de la prensa de cacao de Van Houten (1828) y fábrica de Hershey, Pensilvania (1900)',
      paises: ['Países Bajos', 'Reino Unido', 'Suiza', 'Estados Unidos', 'Alemania'],
    },
    {
      id: 'africa-cacao-dominio',
      nombre: 'África Occidental: el nuevo epicentro del cacao',
      anioInicio: 1880,
      anioFin: 2000,
      color: '#374151',
      categoria: 'industria',
      descripcion:
        `A finales del siglo XIX, África Occidental desplaza a América Latina como principal productor mundial de cacao. Ghana (entonces Gold Coast) introduce el cultivo en 1879; Costa de Marfil lo escala masivamente desde 1900. Hoy ambos países producen juntos más del 60% del cacao mundial (datos ICCO, International Cocoa Organization). Esta concentración geográfica tiene consecuencias: en 2001, el informe Knight/Harkin documenta el trabajo infantil en plantaciones de cacao del África Occidental, estimando ~284.000 menores en condiciones de trabajo peligroso en Costa de Marfil y Ghana. La Organización Internacional del Trabajo (OIT/ILO) cifra actualmente en ~1,56 millones el número de niños en el sector cacaotero de ambos países (informe ILO 2020). El protocolo Harkin-Engel (2001), firmado por las principales empresas chocolateras, comprometía la eliminación del trabajo infantil para 2005 —plazo pospuesto varias veces hasta 2025—.`,
      obraIconica:
        'Informe ILO 2020 sobre trabajo infantil en el sector del cacao (Ghana y Costa de Marfil)',
      paises: ['Costa de Marfil', 'Ghana', 'Nigeria', 'Camerún'],
    },
    {
      id: 'fair-trade-bean-to-bar',
      nombre: 'Comercio justo y el movimiento Bean-to-Bar',
      anioInicio: 1988,
      anioFin: 2015,
      color: '#059669',
      categoria: 'sostenibilidad',
      descripcion:
        `La respuesta al dominio de las multinacionales y las condiciones laborales precarias llega en dos olas. La primera es el comercio justo: el sello Max Havelaar (Países Bajos, 1988) es el primero del mundo para cacao; hoy Fairtrade International certifica a más de 200.000 agricultores cacaoteros. La segunda es el movimiento "Bean to Bar" (del grano a la tableta): pequeñas chocolaterías artesanales que controlan todo el proceso, pagan precio premium a los productores y valorizan el "terroir" del cacao como se hace con el vino. Ecuador (cacao Nacional fino de aroma), Madagascar (Sambirano) y Trinidad (Trinitario original) redescubren sus variedades históricas. El Salón del Chocolate de París (fundado 1994) y la World Cocoa Foundation articulan la industria artesanal. Las certificaciones Rainforest Alliance y UTZ (fusionadas en 2018) complementan el ecosistema de certificación sostenible.`,
      obraIconica:
        'Primer sello Max Havelaar para cacao (Países Bajos, 1988) y certificación Fairtrade International',
      paises: ['Ecuador', 'Madagascar', 'Trinidad', 'Países Bajos', 'Estados Unidos'],
    },
    {
      id: 'cambio-climatico-amenaza-cacao',
      nombre: 'Cambio climático: la mayor amenaza al cacao',
      anioInicio: 2015,
      anioFin: 9999,
      color: '#059669',
      categoria: 'sostenibilidad',
      descripcion:
        `El Theobroma cacao solo crece en la franja de 20° al norte y sur del ecuador, a menos de 300 metros de altitud, con temperaturas de 18-32°C y humedad relativa del 70-80%. Según un estudio del International Center for Tropical Agriculture (CIAT) de 2011 y análisis posteriores de la NOAA y la Universidad de Reading, el aumento de temperatura en Costa de Marfil y Ghana podría reducir en un 50% las zonas de cultivo aptas para 2050 sin medidas de adaptación. Mars Incorporated y el Instituto Novozymes están desarrollando mediante edición genética (CRISPR) variedades de cacao resistentes a la sequía. Barry Callebaut trabaja en proteínas de cacao sintetizadas en laboratorio. El mercado mundial del chocolate supera los 130.000 millones de euros anuales; Suiza, Alemania, Bélgica y los países nórdicos lideran el consumo per cápita.`,
      obraIconica:
        'Estudio CIAT/NOAA sobre impacto del cambio climático en zonas cacaoteras (2011-2018)',
      paises: ['Costa de Marfil', 'Ghana', 'Ecuador', 'Brasil', 'Indonesia'],
    },
    {
      id: 'chocolate-presente-mercado-global',
      nombre: 'El chocolate en el siglo XXI: mercado global y tensiones estructurales',
      anioInicio: 2015,
      anioFin: 9999,
      color: '#059669',
      categoria: 'sostenibilidad',
      descripcion:
        `El chocolate del siglo XXI es una industria de escala global con tensiones estructurales no resueltas. La cadena de valor es extremadamente desigual: los 5 millones de agricultores de cacao del mundo (minifundistas en su mayoría) reciben menos del 6% del valor final de la tableta; el grueso lo retienen los procesadores industriales (Barry Callebaut, Cargill, Olam) y las marcas (Nestlé, Mars, Ferrero, Mondelēz). Los "Big Five" del chocolate industrial —Nestlé, Mars, Ferrero, Mondelēz y Hershey— controlan más del 50% del mercado mundial. El cacao fino de origen (Ecuador, Perú, Venezuela, Madagascar, Sao Tomé, Trinidad) representa apenas el 5% de la producción mundial pero captura el 30% del valor en el segmento artesanal. La investigación en alternativas (chocolate sin cacao por fermentación microbiana, producción de manteca en biorreactores) está en fase de laboratorio. La historia del chocolate, de la bebida ritual olmeca a la tableta ubicua del siglo XXI, recorre 3.500 años de comercio, colonización, industrialización y la búsqueda de modelos más equitativos y sostenibles.`,
      obraIconica:
        'Informe de la World Cocoa Foundation (2023) sobre distribución del valor en la cadena del cacao',
      paises: ['Costa de Marfil', 'Ghana', 'Ecuador', 'Suiza', 'Bélgica', 'Estados Unidos'],
    },
  ],

  eras: [
    {
      nombre: 'Mesoamérica y los Dioses del Cacao',
      desde: -1500,
      hasta: 1521,
      icono: '🌿',
      hitosDestacados: [
        'Olmecas y el cacao primigenio',
        'Los mayas y el kakaw sagrado',
      ],
      eventos: [
        '~1500 a.C.: vasijas con residuos de teobromina en El Manatí (Veracruz)',
        '~400 a.C.: consolidación de la cultura cacaotera maya clásica',
        '~900-1200 d.C.: expansión azteca y adopción del xocolatl como bebida de élite',
        '1519: Hernán Cortés llega a Tenochtitlán y conoce el xocolatl de Moctezuma II',
        '1521: caída de Tenochtitlán; inicio de la exportación del cacao a Europa',
      ],
    },
    {
      nombre: 'La Conquista y Europa',
      desde: 1521,
      hasta: 1700,
      icono: '⚓',
      hitosDestacados: [
        'Aztecas: xocolatl y la conquista española',
        'El chocolate conquista Europa',
      ],
      eventos: [
        '1528: Hernán Cortés lleva cacao y utensilios a la corte de Carlos I de España',
        '1606: el mercader florentino Francesco d\'Antonio Carletti introduce el chocolate en Italia',
        '1615: Ana de Austria lleva el chocolate a la corte francesa al casarse con Luis XIII',
        '1631: primer tratado europeo del chocolate, de Antonio Colmenero de Ledesma (Madrid)',
        '1657: primer Chocolate House de Londres; en pocas décadas superan los 2.000',
      ],
    },
    {
      nombre: 'Plantaciones Coloniales',
      desde: 1700,
      hasta: 1820,
      icono: '🚢',
      hitosDestacados: [
        'Plantaciones coloniales y expansión del cacao',
        'El chocolate conquista Europa',
      ],
      eventos: [
        '1728: fundación de la Compañía Guipuzcoana de Caracas, monopolio del cacao venezolano',
        'S. XVIII: el cacao venezolano (criollo y trinitario) abastece gran parte de Europa',
        'S. XVIII: São Tomé se convierte en la primera colonia africana productora de cacao',
        '1778: primeras plantaciones de cacao en Trinidad bajo administración española',
        '~1820: inicio de la transferencia de cultivos de cacao a las colonias del África Occidental',
      ],
    },
    {
      nombre: 'La Revolución Industrial del Chocolate',
      desde: 1820,
      hasta: 1945,
      icono: '⚙️',
      hitosDestacados: [
        'La Revolución Industrial del chocolate sólido',
        'África Occidental: el nuevo epicentro del cacao',
      ],
      eventos: [
        '1824: John Cadbury funda Cadbury en Birmingham',
        '1828: Van Houten patenta la prensa hidráulica de cacao y el proceso de dutching',
        '1847: Joseph Fry & Sons (Bristol) crea el primer chocolate sólido comestible',
        '1875: Daniel Peter y Henri Nestlé desarrollan el chocolate con leche (Vevey, Suiza)',
        '1879: Rodolphe Lindt inventa el proceso de conchado; mismo año, Ghana inicia cultivo del cacao',
        '1900: Milton Hershey construye su fábrica en Pensilvania; 1908: aparece el Toblerone en Berna',
      ],
    },
    {
      nombre: 'El Dominio Africano y el Modelo Industrial',
      desde: 1945,
      hasta: 2000,
      icono: '🌍',
      hitosDestacados: [
        'África Occidental: el nuevo epicentro del cacao',
        'Comercio justo y el movimiento Bean-to-Bar',
      ],
      eventos: [
        '1945-1960: Costa de Marfil e independencia africana; expansión masiva del cultivo de cacao',
        '1973: fundación de la International Cocoa Organization (ICCO) para regular el mercado',
        '1988: primer sello Max Havelaar para cacao (Países Bajos) — inicio del comercio justo',
        '1994: apertura del Salón del Chocolate de París; consolidación del segmento artesanal',
        '2001: informe Knight/Harkin documenta trabajo infantil en cacao del África Occidental',
      ],
    },
    {
      nombre: 'Sostenibilidad y Futuro',
      desde: 2000,
      hasta: 9999,
      icono: '🌱',
      hitosDestacados: [
        'Cambio climático: la mayor amenaza al cacao',
        'El chocolate en el siglo XXI: mercado global y tensiones estructurales',
      ],
      eventos: [
        '2001: Protocolo Harkin-Engel comprometía fin del trabajo infantil en cacao para 2005',
        '2011: estudio CIAT/NOAA advierte de reducción del 50% en zonas cacaoteras aptas para 2050',
        '2018: fusión de certificaciones Rainforest Alliance y UTZ',
        '2020: informe ILO cifra en ~1,56 millones los niños en el sector cacaotero de Ghana y Costa de Marfil',
        '2023: mercado mundial del chocolate supera los 130.000 millones de euros anuales',
        'En curso: investigación en variedades CRISPR resistentes a la sequía y cacao sin Theobroma',
      ],
    },
  ],

  categorias: {
    mesoamerica: 'Mesoamérica Precolombina',
    europa: 'Adopción Europea',
    colonia: 'Economía Colonial',
    industria: 'Industrialización',
    sostenibilidad: 'Sostenibilidad y Futuro',
    crisis: 'Controversias y Crisis',
  },

  colores: {
    mesoamerica: '#7C3AED',
    europa: '#D97706',
    colonia: '#DC2626',
    industria: '#374151',
    sostenibilidad: '#059669',
    crisis: '#B45309',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'El Theobroma cacao ha recorrido 3.500 años desde su cultivo sagrado en Mesoamérica hasta convertirse en una industria global de 130.000 millones de euros. Su historia es también la historia del comercio colonial, la esclavitud, la industrialización y los debates contemporáneos sobre sostenibilidad y equidad.',

    tablaComparativa: [
      {
        hito: 'Bebida olmeca/maya',
        periodo: '1500 a.C. – 1500 d.C.',
        categoria: 'Ritual y ceremonial',
        personaje: 'Sacerdotes y élites mesoamericanas',
        aportacion: 'Primera preparación documentada del cacao: bebida amarga, fría y espumosa con maíz, chile y achiote',
      },
      {
        hito: 'Chocolate europeo del s. XVII',
        periodo: '1528 – 1700',
        categoria: 'Bebida de lujo',
        personaje: 'Ana de Austria, Carlos I de España, clientes de los Chocolate Houses',
        aportacion: 'Mezcla con azúcar y especias europeas; bebida caliente para aristocracia y burguesía urbana',
      },
      {
        hito: 'Prensa de cacao de Van Houten',
        periodo: '1828',
        categoria: 'Innovación técnica',
        personaje: 'Coenraad Johannes van Houten',
        aportacion: 'Separación de manteca de cacao y polvo; proceso de dutching que suaviza el sabor y abarata la producción',
      },
      {
        hito: 'Primer chocolate sólido de Fry',
        periodo: '1847',
        categoria: 'Industrialización',
        personaje: 'Joseph Fry & Sons (Bristol)',
        aportacion: 'Primera tableta sólida comestible mezclando cacao en polvo, azúcar y manteca de cacao fundida',
      },
      {
        hito: 'Chocolate con leche de Nestlé/Peter',
        periodo: '1875',
        categoria: 'Masificación',
        personaje: 'Daniel Peter y Henri Nestlé',
        aportacion: 'Incorporación de leche condensada al chocolate sólido; fórmula que define el chocolate de consumo masivo actual',
      },
      {
        hito: 'Tableta masiva de hoy',
        periodo: '2000 – presente',
        categoria: 'Mercado global',
        personaje: 'Nestlé, Mars, Ferrero, Mondelēz, Hershey',
        aportacion: 'Mercado de 130.000 M€; 5 corporaciones controlan el 50% del mercado; debate sobre equidad y sostenibilidad',
      },
    ],

    escenarios: [
      {
        icono: '🍵',
        titulo: 'El chocolate como alimento y medicina en la historia',
        perfil: 'Exploradores de historia cultural',
        texto:
          'Desde los médicos españoles del s. XVII que debatían si el chocolate era nutritivo o pernicioso, hasta los estudios modernos sobre los flavonoides del cacao, el chocolate ha oscilado entre alimento, droga, lujo y medicina. El jesuita Colmenero de Ledesma (1631) lo recomendaba para "confortar el estómago y el cerebro"; la industria victoriana lo vendió como reconstituyente. La ciencia actual confirma que el chocolate negro de alto porcentaje contiene antioxidantes (flavanoles) con efectos cardiovasculares leves —aunque los productos industriales, con poca masa de cacao y mucho azúcar, no preservan esos beneficios.',
      },
      {
        icono: '⛵',
        titulo: 'El cacao como motor económico colonial',
        perfil: 'Estudiantes de historia económica',
        texto:
          'La historia del cacao es inseparable del sistema colonial: monopolios comerciales como la Compañía Guipuzcoana de Caracas (1728), plantaciones con trabajo esclavizado en el Caribe y África, y la extracción de valor de las economías productoras hacia las metrópolis manufactureras. Venezuela y Ecuador fueron las "reservas de cacao" de Europa durante el s. XVIII; el África Occidental ocupó ese papel en el s. XX. Hoy, el mecanismo se repite de otra manera: los países productores exportan materia prima sin valor añadido, y las empresas procesadoras del Norte Global retienen el margen.',
      },
      {
        icono: '🏭',
        titulo: 'Industria del chocolate: de artesanía a corporación global',
        perfil: 'Economistas y analistas de consumo',
        texto:
          'En menos de un siglo (1828-1900), el chocolate pasó de preparación artesanal a producto industrial de consumo masivo. Las cuatro innovaciones clave —prensa de Van Houten, tableta de Fry, leche de Nestlé/Peter, conchado de Lindt— crearon la fórmula que aún domina el mercado. Hoy, cinco corporaciones (Nestlé, Mars, Ferrero, Mondelēz, Hershey) controlan el 50% del mercado mundial. La producción está dominada por Barry Callebaut (fabricante de chocolate industrial para terceras marcas), Cargill y Olam en el procesamiento del cacao. La concentración en cada eslabón de la cadena define las dinámicas de precio y poder del sector.',
      },
      {
        icono: '🔍',
        titulo: 'El consumidor y la trazabilidad: ¿qué hay detrás de una tableta?',
        perfil: 'Consumidores conscientes',
        texto:
          'Una tableta de chocolate de supermercado recorre una cadena con al menos seis eslabones entre el agricultor y el comprador final. El agricultor retiene menos del 6% del precio de venta. Las certificaciones Fairtrade, Rainforest Alliance o UTZ ofrecen garantías parciales: precios mínimos (Fairtrade), prácticas ambientales (Rainforest Alliance) y trazabilidad (Bean-to-Bar). El movimiento Bean-to-Bar ha creado un nuevo segmento premium con tabletas de 5-20€ donde la trazabilidad es completa y el margen del productor es significativamente mayor. Leer las etiquetas —porcentaje de cacao, procedencia, certificaciones— permite al consumidor orientar sus decisiones.',
      },
    ],

    faq: [
      {
        pregunta: '¿En qué se diferencia el chocolate puro del chocolate con leche?',
        respuesta:
          'El chocolate negro o puro contiene masa de cacao, manteca de cacao y azúcar (y a veces lecitina). El porcentaje indicado en la etiqueta (70%, 85%...) refleja la proporción de ingredientes derivados del cacao. El chocolate con leche añade sólidos lácteos (leche en polvo o condensada), lo que diluye el sabor del cacao y aumenta el contenido en azúcares. El chocolate blanco no contiene sólidos de cacao —solo manteca de cacao, azúcar y leche—, por lo que técnicamente no es chocolate según las normativas europeas más estrictas.',
        tip: 'El conchado (proceso de Lindt desde 1879) determina la suavidad: más horas de conchado = textura más sedosa y sabor más redondo.',
      },
      {
        pregunta: '¿Por qué el cacao se cultiva solo en zonas tropicales?',
        respuesta:
          'Theobroma cacao requiere condiciones muy específicas: franja de 20° norte/sur del ecuador, altitud inferior a 300 m, temperatura entre 18-32°C, humedad relativa del 70-80% y suelos ricos en materia orgánica con buen drenaje. Esta dependencia ecológica lo hace especialmente vulnerable al cambio climático. Los estudios del CIAT y la NOAA proyectan que el aumento de temperatura podría reducir en un 50% las zonas aptas en los principales países productores (Costa de Marfil, Ghana) para 2050.',
        tip: 'Las variedades criollo (sabor fino pero frágil), forastero (robusto y productivo) y trinitario (híbrido) tienen diferentes tolerancias a las condiciones climáticas.',
      },
      {
        pregunta: '¿Qué es el "porcentaje de cacao" en una tableta?',
        respuesta:
          'El porcentaje de cacao indica la proporción total de ingredientes derivados del cacao (masa de cacao + manteca de cacao) respecto al peso total de la tableta. Un 70% de cacao significa que el 70% del peso proviene de componentes del cacao y el 30% restante es principalmente azúcar. Un porcentaje mayor no garantiza automáticamente mayor calidad: el origen del cacao, el proceso de fermentación y secado, y el conchado influyen tanto o más en el sabor final que el porcentaje.',
        tip: 'Un chocolate Bean-to-Bar de 60% con cacao fino de origen puede tener más complejidad aromática que un chocolate industrial de 90%.',
      },
      {
        pregunta: '¿Qué es el Bean-to-Bar y cómo se diferencia del chocolate industrial?',
        respuesta:
          'Bean-to-Bar (del grano a la tableta) describe a las chocolaterías artesanales que controlan todo el proceso: seleccionan los granos en origen, los tuestan, los muelen y producen las tabletas en sus propias instalaciones. Esto permite trazabilidad completa y relaciones directas con los productores de cacao. El chocolate industrial, en cambio, trabaja con masa de cacao y manteca ya procesadas por grandes intermediarios (Barry Callebaut, Cargill), sin necesidad de gestionar el grano en origen. El Bean-to-Bar suele valorizar el "terroir" del cacao (Madagascar, Ecuador, Venezuela...) de manera análoga a como la viticultura valora el origen del vino.',
      },
      {
        pregunta: '¿Hay trabajo infantil en la industria del cacao?',
        respuesta:
          'La Organización Internacional del Trabajo (OIT/ILO) cifra en aproximadamente 1,56 millones el número de niños trabajando en el sector del cacao en Ghana y Costa de Marfil (informe ILO, 2020), los dos mayores productores mundiales. El Protocolo Harkin-Engel (2001), firmado por las principales empresas chocolateras, comprometía la eliminación del trabajo infantil para 2005; el plazo se ha pospuesto varias veces. Las certificaciones Fairtrade y Rainforest Alliance incluyen requisitos contra el trabajo infantil, pero la cobertura es parcial. El problema está relacionado con los bajos precios del cacao en los mercados internacionales, que limitan los ingresos de los agricultores.',
        tip: 'Según el informe ILO 2020, el porcentaje de niños en trabajo peligroso en las zonas cacaoteras de Ghana y Costa de Marfil aumentó entre 2009 y 2019, a pesar de los compromisos voluntarios de la industria.',
      },
    ],

    pasos: [
      {
        titulo: 'Cultivo y cosecha de los cacao-pods',
        cuerpo:
          'El árbol de cacao (Theobroma cacao) tarda 3-5 años desde la siembra hasta la primera cosecha. Las mazorcas o cacao-pods crecen directamente sobre el tronco y las ramas gruesas. Cada árbol produce entre 20 y 30 pods por año; cada pod contiene entre 20 y 50 granos cubiertos de pulpa blanca mucilaginosa. La cosecha se realiza manualmente con machetes o ganchos largos, dos veces al año (cosecha principal y "mitad"). Las variedades principales son criollo (sabor fino, frágil, <5% producción), forastero (robusto, +85% producción) y trinitario (híbrido de ambos).',
      },
      {
        titulo: 'Fermentación y secado de los granos',
        cuerpo:
          'La fermentación es el proceso más determinante para el sabor final del chocolate. Los granos, extraídos de las mazorcas con la pulpa adherida, se apilan en cajones o se cubren con hojas de plátano durante 5-7 días. La levaduras y bacterias descomponen la pulpa y generan calor (40-50°C), que mata el embrión del grano y desencadena reacciones bioquímicas que desarrollan los precursores del aroma. A continuación, los granos se extienden al sol o en secadores durante 1-2 semanas hasta alcanzar menos del 7% de humedad. Una fermentación deficiente es la causa más común de sabores astringentes o amargos no deseados.',
      },
      {
        titulo: 'Tostado y descascarillado',
        cuerpo:
          'El tostado (cocoa roasting) se realiza entre 120-150°C durante 10-35 minutos en hornos de tambor rotatorio. El calor provoca las reacciones de Maillard y la caramelización que desarrollan los aromas característicos del chocolate. La temperatura y duración del tostado son variables críticas que diferencian los perfiles aromáticos de cada chocolatero. Tras el tostado, los granos se descascarillan (craking y winnowing) para separar la cáscara del "nib" o grano limpio, que es la materia prima del chocolate. En el Bean-to-Bar artesanal, el tostado personalizado por origen es una seña de identidad.',
      },
      {
        titulo: 'Molienda y separación (manteca de cacao / polvo)',
        cuerpo:
          'Los nibs tostados se muelen en molinos de piedra o refinadoras de acero hasta obtener la "masa de cacao" o licor de cacao: una pasta líquida a temperatura ambiente que contiene en torno al 55% de manteca de cacao y el 45% de sólidos de cacao. Mediante la prensa hidráulica (patentada por Van Houten en 1828), se puede separar la manteca de cacao (grasa) del torta de cacao, que molida da el cacao en polvo. Para el chocolate Bean-to-Bar, la masa se refina sin prensado, manteniendo la manteca y añadiendo azúcar (y leche si es con leche).',
      },
      {
        titulo: 'Conchado, atemperado y moldeo',
        cuerpo:
          'El conchado (inventado por Lindt en 1879) consiste en agitar la masa de chocolate fundido durante horas o días en la concha, eliminando la humedad residual y los ácidos volátiles, y recubriendo uniformemente las partículas de azúcar con manteca de cacao. Un conchado largo (72-96h) produce chocolates más suaves y complejos. El atemperado es el proceso de calentamiento y enfriamiento controlado (31-32°C para chocolate negro) que garantiza la cristalización estable de la manteca de cacao (forma cristalina V/β), dando al chocolate su brillo, textura sólida y el característico "chasquido" al romperlo. Finalmente, el chocolate se moldea y envuelve.',
      },
    ],

    tips: [
      {
        icono: '🏷️',
        texto:
          'Para leer una etiqueta de chocolate: el primer ingrediente debe ser masa de cacao o cacao en pasta (no azúcar). Revisa el porcentaje de cacao, el origen (país o finca), si hay manteca de cacao añadida (lícita y habitual) o grasas vegetales alternativas (indicador de calidad menor en Europa), y si tiene lecitina de soja (emulsionante común) o lecitina de girasol (alternativa para personas con alergia a la soja). Las certificaciones aparecen como logotipos: Fairtrade (balance negro), Rainforest Alliance (rana verde), UTZ (hoja) o Bean-to-Bar (indicado en texto libre).',
      },
      {
        icono: '🍫',
        texto:
          'Diferencias entre chocolate negro, con leche y blanco: el negro contiene masa de cacao + manteca + azúcar (mínimo 35% de cacao en la normativa europea, aunque los artesanos suelen superar el 60%). El con leche añade sólidos lácteos (mínimo 25% cacao en la UE). El blanco contiene solo manteca de cacao (sin sólidos de cacao), azúcar y leche — no hay flavonoides del cacao. El chocolate "ruby" (rosa) es una variedad natural del grano de cacao ruby de Barry Callebaut (2017), con sabor afrutado y color sin colorantes artificiales.',
      },
      {
        icono: '✨',
        texto:
          'Cómo reconocer chocolate de calidad: el brillo uniforme indica un atemperado correcto. El "snap" o chasquido limpio al romper la tableta confirma la cristalización estable de la manteca (forma cristalina V). En boca, debe fundirse gradualmente a 34-37°C (temperatura corporal), sin sensación de cera ni grasa excesiva. Los chocolates mal atemperados o que han sufrido variaciones de temperatura presentan "fat bloom" (velo blanco grisáceo). Un chocolate de calidad tiene capas aromáticas: notas frutales, florales, tostadas o terrosas según el origen del cacao.',
      },
      {
        icono: '🌿',
        texto:
          'Qué significan las certificaciones: Fairtrade garantiza un precio mínimo al productor y una prima para proyectos comunitarios; es el sello más enfocado en equidad económica. Rainforest Alliance (fusión con UTZ en 2018) certifica prácticas ambientales y sociales, con enfoque en biodiversidad y condiciones laborales. Bean-to-Bar no es una certificación oficial sino un descriptor de proceso: indica que el chocolatero controla toda la cadena desde el grano. La trazabilidad directa al productor (Direct Trade) es el estándar más exigente y transparente, aunque no tiene sello regulado.',
      },
    ],

    errores: [
      {
        titulo: 'El chocolate blanco es chocolate',
        cuerpo:
          'El chocolate blanco no contiene sólidos de cacao (masa de cacao): solo manteca de cacao, azúcar y productos lácteos. Desde el punto de vista de los flavonoides y antioxidantes asociados al cacao, es prácticamente nulo. La normativa europea (Directiva 2000/36/CE) establece que el chocolate blanco debe contener un mínimo del 20% de manteca de cacao, pero no exige sólidos de cacao. Algunos puristas y normativas lo excluyen de la categoría "chocolate" por esta razón.',
      },
      {
        titulo: 'Más % de cacao = mejor calidad',
        cuerpo:
          'El porcentaje de cacao indica la cantidad de ingredientes derivados del cacao, pero no su calidad. Un chocolate de 90% con cacao forastero de baja fermentación puede ser de menor calidad organoléptica que uno de 65% con cacao fino criollo de origen bien fermentado. El origen geográfico (terroir), la variedad del cacao, la calidad de la fermentación y el secado, y el proceso de tostado y conchado del chocolatero determinan el sabor tanto o más que el porcentaje.',
      },
      {
        titulo: 'El chocolate es adictivo',
        cuerpo:
          'El cacao contiene teobromina (estimulante suave), cafeína en pequeñas cantidades, y trazas de feniletilamina (PEA) y anandamida. Sin embargo, ninguno de estos compuestos provoca dependencia física clínica en las concentraciones presentes en el chocolate. Los estudios publicados en revistas como Appetite y Food Quality and Preference concluyen que el "ansia por el chocolate" (craving) tiene una base psicológica y sociocultural mayor que farmacológica. La American Psychiatric Association no reconoce el "trastorno por adicción al chocolate" en el DSM-5.',
      },
      {
        titulo: 'El cacao nació en África',
        cuerpo:
          'El Theobroma cacao es originario de América: los estudios genéticos (Motamayor et al., 2008, publicados en PLOS ONE) sitúan el origen de la especie en la cuenca del Amazonas y el norte de América del Sur. Los olmecas y mayas lo cultivaron en Mesoamérica a partir de ~1500 a.C. El cacao llegó a África Occidental a través de la colonización europea: Ghana inició su cultivo en 1879 y Costa de Marfil lo escaló a partir de 1900. Hoy ambos países producen juntos el 60% del cacao mundial, pero son productores recientes (menos de 150 años) de una planta de origen americano.',
      },
    ],
  },
};
