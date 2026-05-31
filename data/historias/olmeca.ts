import type { HistoriaData } from './types';

export const olmeca: HistoriaData = {
  slug: 'olmeca',
  titulo: 'Historia de los Olmecas: La Civilización Madre de Mesoamérica',
  subtitulo:
    'La primera gran civilización de México: cabezas colosales, el primer calendario mesoamericano y un legado cultural que moldeó a mayas y aztecas durante mil años',
  descripcionSEO:
    'Cronología interactiva de la civilización olmeca: desde las primeras aldeas en la Costa del Golfo (-1600) hasta el declive de Tres Zapotes (-400). San Lorenzo, La Venta, las cabezas colosales, el hombre-jaguar, el proto-escritura y el proto-calendario mesoamericano en 10 hitos y 6 eras.',
  keywords: [
    'historia olmecas cronología',
    'civilización madre mesoamérica olmeca',
    'cabezas colosales olmecas basalto',
    'san lorenzo la venta tres zapotes',
    'hombre jaguar religión olmeca',
    'cascajal block escritura olmeca',
    'calendario mesoamericano olmecas mayas',
    'legado olmeca aztecas zapotecas',
  ],
  anioInicio: -1600,
  anioFin: -400,

  hitos: [
    {
      id: 'primeras-aldeas-golfo',
      nombre: 'Las Primeras Aldeas en la Costa del Golfo',
      anioInicio: -1600,
      anioFin: -1200,
      color: '#8B4513',
      categoria: 'surgimiento',
      descripcion:
        'Las primeras comunidades olmecas emergen en las tierras bajas del Golfo de México (actuales estados de Veracruz y Tabasco, México) hacia el 1600 a.C. La región era extraordinariamente fértil: suelos aluviales renovados por las inundaciones estacionales de los ríos Coatzacoalcos, Tonalá y Papaloapan permitían cosechas abundantes sin técnicas agrícolas complejas. Los asentamientos iniciales eran aldeas de agricultores de maíz con un surplus alimentario que permitió especialización artesanal. La evidencia arqueológica más temprana de cerámica en Mesoamérica aparece en San Lorenzo (Veracruz) hacia el 1500 a.C. Los olmecas iniciales heredaron una tradición cultural preexistente en la región —los llamados "proto-olmecas" o "pre-olmecas"— pero la intensificaron con nueva organización social, especialización artesanal y, pronto, arquitectura monumental. Las condiciones geográficas (llanuras fértiles, ríos navegables, acceso al mar) y el surplus agrícola son los fundamentos materiales sobre los que se construyó la primera gran civilización mesoamericana.',
      obraIconica: 'Cerámica de San Lorenzo (1500-1200 a.C.) — los primeros vestigios cerámicos de la civilización olmeca',
      paises: ['México (Veracruz, Tabasco)'],
    },
    {
      id: 'san-lorenzo-apogeo',
      nombre: 'San Lorenzo: El Primer Gran Centro Olmeca',
      anioInicio: -1200,
      anioFin: -900,
      color: '#DC143C',
      categoria: 'arquitectura',
      descripcion:
        'San Lorenzo (Veracruz) fue el primer gran centro olmeca, alcanzando su apogeo entre el 1200 y el 900 a.C. La ciudad se construyó sobre una meseta artificial con una serie de plataformas y montículos que alteraron radicalmente el paisaje natural: los olmecas movieron millones de toneladas de tierra para crear su sede del poder. Las cabezas colosales más antiguas conocidas (Cabezas 1-9 de San Lorenzo) datan de este período: enormes retratos en basalto de gobernantes, con altura de 1,5 a 1,8 metros y peso de 5 a 25 toneladas. El basalto se extraía en las montañas de Tuxtla, a 80-100 km de distancia, y se transportaba en balsas por los ríos: una hazaña logística que demuestra una organización política centralizada sofisticada. San Lorenzo también tenía un sistema de drenaje de piedra —el más antiguo de Mesoamérica— con canales de losas de basalto bajo la plataforma principal. Hacia el 900 a.C., San Lorenzo fue destruida o abandonada violentamente: muchas de sus esculturas fueron mutiladas, enterradas o arrojadas a las lagunas, posiblemente en un ritual de "matar" las figuras del poder derrotado.',
      obraIconica:
        'Cabeza Colosal Nº 1 de San Lorenzo — el gobernante olmeca en basalto, 2,9 m de altura y 25 toneladas',
      paises: ['México (Veracruz)'],
    },
    {
      id: 'la-venta-capital',
      nombre: 'La Venta: La Gran Capital Olmeca',
      anioInicio: -900,
      anioFin: -400,
      color: '#DAA520',
      categoria: 'arquitectura',
      descripcion:
        'Tras la caída de San Lorenzo, La Venta (Tabasco) se convirtió en el nuevo y definitivo corazón del mundo olmeca entre el 900 y el 400 a.C. La Venta está situada en un islote pantanoso rodeado de ciénagas, lo que la hacía estratégicamente defendible. Su elemento más destacado es la Gran Pirámide: un montículo de tierra de 32 metros de altura y base circular de 130 metros de diámetro, la mayor construcción de Mesoamérica en su época. El complejo ceremonial de La Venta estaba organizado en un eje norte-sur de precisión notable (desviado 8 grados al oeste, posiblemente alineado con una constelación). Cuatro cabezas colosales (las más grandes y elaboradas del arte olmeca), tres grandes altares, estelas y decenas de esculturas de jade y basalto se distribuían por el complejo. Los "depósitos de mosaico de serpentina" —enormes máscaras enterradas bajo el suelo, elaboradas con miles de piezas de piedra verde, nunca destinadas a ser vistas— son uno de los mayores enigmas arqueológicos de Mesoamérica: representaban ofrendas a las fuerzas del inframundo.',
      obraIconica:
        'Gran Pirámide de La Venta (Tabasco) — el mayor montículo de tierra de Mesoamérica en el 900-400 a.C.',
      paises: ['México (Tabasco)'],
    },
    {
      id: 'cabezas-colosales',
      nombre: 'Las Cabezas Colosales: Retratos del Poder Olmeca',
      anioInicio: -1200,
      anioFin: -400,
      color: '#2E8B57',
      categoria: 'arte',
      descripcion:
        'Las 17 cabezas colosales olmecas (9 en San Lorenzo, 4 en La Venta, 2 en Tres Zapotes, 2 en La Cobata) son el símbolo más reconocible de la civilización olmeca y una de las obras escultóricas más asombrosas del mundo antiguo. Talladas en basalto volcánico de origen único (el cerro Cintepec en los Tuxtla), pesan entre 5 y 50 toneladas y miden entre 1,5 y 3,4 metros de altura. Los rasgos faciales son individualizados e inequívocamente de retratos reales: pómulos anchos, nariz chata, labios gruesos y ceño fruncido, con cascos esféricos que los arqueólogos interpretan como equipamiento para el juego de pelota ritual. No son imágenes genéricas sino representaciones específicas de gobernantes reales, lo que las convierte en el primer retrato personalizado de la historia de Mesoamérica. Su transporte desde el cerro Cintepec hasta San Lorenzo o La Venta (60-100 km por ríos y tierra) sin rueda ni animales de tiro requirió centenares de trabajadores durante semanas o meses, evidenciando una capacidad de movilización de recursos propia de una sociedad altamente organizada con liderazgo centralizado.',
      obraIconica:
        'Cabeza Colosal Nº 1 de La Venta (Parque-Museo La Venta, Villahermosa) — 2,4 m de altura, 40 toneladas',
      paises: ['México (Veracruz, Tabasco)'],
    },
    {
      id: 'hombre-jaguar-religion',
      nombre: 'El Hombre-Jaguar: La Religión Olmeca',
      anioInicio: -1200,
      anioFin: -400,
      color: '#9932CC',
      categoria: 'religion',
      descripcion:
        'El motivo más característico y enigmático del arte olmeca es el "hombre-jaguar": una figura que combina rasgos humanos y felinos, con boca hendida (típica fisura frontal de la boca jaguar), encías visibles, a menudo con elementos de jaguar como orejas o piel manchada. Los arqueólogos debaten si representa: un ser sobrenatural (el dios de la lluvia o del maíz); el fruto de la unión mítica entre un hombre y una jaguar; o un símbolo de la transformación chamánica (el shamán que se convierte en jaguar en los estados de trance). El jaguar era el animal más poderoso de las selvas tropicales mesoamericanas: temible cazador, dominador de la noche y del agua, símbolo del inframundo. La iconografía olmeca no se limita al hombre-jaguar: también incluye la serpiente-pájaro (precursora del Quetzalcóatl mesoamericano), el dios del maíz naciente y figuras de acróbatas y enanos con posible significado ritual. Las figuras de jade (la piedra verde más preciosa de Mesoamérica, asociada al agua, la fertilidad y el poder) son los objetos rituales más elaborados y representan la acumulación de prestigio y poder de los gobernantes olmecas.',
      obraIconica:
        'Bebé de Jade olmeca (Las Limas, Veracruz) — el niño-jaguar en cerámica, símbolo del dios del maíz olmeca',
      paises: ['México (Veracruz, Tabasco)'],
    },
    {
      id: 'proto-escritura-calendario',
      nombre: 'La Proto-Escritura y el Proto-Calendario Olmeca',
      anioInicio: -900,
      anioFin: -400,
      color: '#1E90FF',
      categoria: 'conocimiento',
      descripcion:
        'La civilización olmeca dio los primeros pasos hacia la escritura y el calendario en Mesoamérica. El Monumento 13 de La Venta (c. 700 a.C.) contiene una de las inscripciones más antiguas de Mesoamérica: una figura humana con símbolos asociados interpretados como posible escritura o protocscritura. La Estela de San Andrés (c. 650 a.C., descubierta en 2002) contiene lo que algunos investigadores consideran escritura olmeca funcional: un par de glifos que podrían representar el nombre de un lugar o un gobernante. El Cascajal Block (2006): una losa de serpentina con 62 glifos olmecas en hileras horizontales, datada hacia el 900 a.C., es el candidato más fuerte a escritura olmeca real; si se confirma el desciframento, haría a los olmecas los inventores de la escritura en América. El calendario de 365 días (haab) y el calendario ritual de 260 días (tzolkín) —que tanto sofisticaron los mayas— probablemente tuvieron sus raíces en las observaciones astronómicas y agrícolas olmecas. La Estela C de Tres Zapotes contiene una fecha en sistema de Cuenta Larga equivalente al 32 a.C., lo que muestra que el sistema calendárico mesoamericano ya estaba desarrollado antes de los mayas clásicos.',
      obraIconica:
        'Cascajal Block (Veracruz) — losa con 62 glifos olmecas, posible escritura más antigua de América (900 a.C.)',
      paises: ['México (Veracruz, Tabasco)'],
    },
    {
      id: 'redes-comercio-olmeca',
      nombre: 'Las Rutas de Comercio Olmeca',
      anioInicio: -1200,
      anioFin: -600,
      color: '#DAA520',
      categoria: 'influencia',
      descripcion:
        'Los olmecas construyeron la primera red de intercambio a larga distancia de Mesoamérica, distribuyendo bienes de prestigio en un radio de más de 1.000 km desde la Costa del Golfo. La obsidiana (para herramientas de corte) llegaba de los yacimientos del altiplano central y de Guatemala. El jade y la serpentina provenían de los ríos de Guatemala y Oaxaca. Las plumas de quetzal, del sur de Chiapas y Guatemala. La ilmenita y el magnetita (minerales de brillo metálico usados como espejos y en rituales) venían de Oaxaca. A cambio, los olmecas exportaban cerámica de calidad, objetos de jade trabajado y, sobre todo, el prestigio de sus iconografías religiosas. El estilo olmeca —el hombre-jaguar, la boca hendida, las figuras de jade pulido— fue adoptado y adaptado por las élites de toda Mesoamérica como símbolo de poder y sofisticación. En el Valle de Oaxaca, la cultura zapoteca incipiente absorbió elementos olmecas. En el altiplano central, Chalcatzingo muestra influencia olmeca directa en su arte rupestre. Los olmecas no crearon colonias ni conquistaron: difundieron su sistema simbólico de poder a través del comercio y del intercambio de élites.',
      obraIconica:
        'Chalcatzingo (Morelos) — relieves rupestres con iconografía olmeca a 900 km de la Costa del Golfo',
      paises: ['México (Veracruz, Tabasco, Oaxaca, Morelos, Guerrero)', 'Guatemala'],
    },
    {
      id: 'tres-zapotes-tardio',
      nombre: 'Tres Zapotes y la Fase Olmeca Tardía',
      anioInicio: -900,
      anioFin: -400,
      color: '#708090',
      categoria: 'declive',
      descripcion:
        'Tres Zapotes (Veracruz) fue el tercer gran centro olmeca, floreciendo principalmente en la fase tardía (900-400 a.C.) cuando La Venta era la capital. También contiene dos cabezas colosales. La Estela C de Tres Zapotes, descubierta en 1939 por Matthew Stirling, tiene inscrita una fecha en la Cuenta Larga equivalente al 32 a.C. —siendo la fecha más temprana en este sistema encontrada fuera de la zona maya—, lo que prueba que los sistemas calendáricos mesoamericanos son más antiguos que los mayas clásicos. Tres Zapotes representa una transición cultural: la iconografía olmeca clásica se mezcla con elementos de las culturas del período Epiclásico que la sucedieron en la región. Hacia el 400 a.C., el sistema olmeca como entidad cultural coherente había cesado, pero sus innovaciones —el juego de pelota, el calendario, la iconografía del hombre-jaguar, la arquitectura de plataformas, el culto al jade— sobrevivieron en todas las culturas posteriores de Mesoamérica. Tres Zapotes continuó habitada hasta la época del período clásico, convirtiéndose en un puente entre el mundo olmeca y las culturas totonaca y clásica veracruzana.',
      obraIconica:
        'Estela C de Tres Zapotes — la fecha más antigua en Cuenta Larga fuera de la zona maya (equivalente 32 a.C.)',
      paises: ['México (Veracruz)'],
    },
    {
      id: 'arte-jade-escultura',
      nombre: 'El Arte Olmeca: Jade, Basalto y Cerámica',
      anioInicio: -1200,
      anioFin: -400,
      color: '#2E8B57',
      categoria: 'arte',
      descripcion:
        'El arte olmeca es uno de los más reconocibles y poderosos del mundo antiguo. Más allá de las cabezas colosales, la producción artística olmeca incluye: altares o "tronos" monumentales en basalto (como el Gran Altar de La Venta), figuras de jade pulido de tamaño miniatura y mediano, máscaras ceremoniales, hachas de piedra votivas con iconografía del hombre-jaguar, y cerámica negra pulida de alta calidad. Las hachas de jade olmecas —trapezoidales, con incisiones del motivo del hombre-jaguar— son objetos de poder y prestigio que viajaban por toda Mesoamérica como señales de alianza entre élites. El jade olmeca se distingue por la calidad de su pulido y la precisión de sus inscripciones, realizadas con instrumentos de obsidiana y arena abrasiva en un proceso que requería centenares de horas. Las figuras de barro de San Lorenzo y Tlatilco, con representaciones de enanos, acróbatas, chamanes y mujeres, muestran una humanización del arte que coexiste con los grandes monumentos religiosos. El concepto de "arte olmeca" fue identificado por los arqueólogos en los años 1920-1930, cuando piezas de jade con el inconfundible estilo empezaron a aparecer en el mercado de antigüedades sin procedencia conocida.',
      obraIconica:
        'El Luchador — escultura de basalto de 66 cm, la representación realista más extraordinaria del arte olmeca',
      paises: ['México (Veracruz, Tabasco)'],
    },
    {
      id: 'legado-madre',
      nombre: 'El Legado Olmeca: La Civilización Madre',
      anioInicio: -600,
      anioFin: -400,
      color: '#8B4513',
      categoria: 'influencia',
      descripcion:
        'El término "civilización madre" (mother culture) fue acuñado por el arqueólogo Alfonso Caso en referencia a los olmecas, sugiriendo que todas las grandes civilizaciones mesoamericanas posteriores derivaron de los olmecas. La tesis es debatida: algunos arqueólogos prefieren el concepto de "civilización hermana" para reconocer la coevolución paralela de varias culturas mesoamericanas. Pero el impacto olmeca es innegable. El juego de pelota ritual (con cancha formal, equipamiento y reglas) fue inventado u organizado sistemáticamente por los olmecas y se difundió por toda Mesoamérica hasta los aztecas. El calendario mesoamericano de 260 y 365 días tiene sus raíces más antiguas en la Costa del Golfo. La iconografía del hombre-jaguar evolucionó en el dios de la lluvia Tláloc azteca y los dioses de la lluvia de Oaxaca. La Cuenta Larga maya tiene antecedentes olmecas. La arquitectura de plataformas ceremoniales, el sacrificio ritual, el juego de pelota y el culto al maíz como base religiosa son legados olmecas que las civilizaciones posteriores desarrollaron, transformaron y magnificaron. Los olmecas pusieron los cimientos del edificio mesoamericano durante el siguiente milenio.',
      obraIconica:
        'Monumento 23 de La Venta — la serpiente-pájaro olmeca, antecedente del Quetzalcóatl mesoamericano',
      paises: ['México', 'Guatemala', 'Honduras', 'El Salvador'],
    },
  ],

  eras: [
    {
      nombre: 'Los Antecedentes: Aldeas Agrícolas del Golfo',
      desde: -1600,
      hasta: -1200,
      icono: '🌽',
      hitosDestacados: ['Las Primeras Aldeas en la Costa del Golfo'],
      eventos: [
        'Primeras comunidades agrícolas en la Costa del Golfo (1600 a.C.)',
        'Suelos aluviales renovados por ríos: las bases del surplus agrícola olmeca',
        'Primeras cerámicas de San Lorenzo (c. 1500 a.C.): las más antiguas de Mesoamérica',
        'Diferenciación social inicial: élites emergentes y especialización artesanal',
        'Intercambio local de obsidiana, jade en bruto y pigmentos',
        'Primeras plataformas ceremoniales en barro como centros de ritual comunitario',
      ],
    },
    {
      nombre: 'San Lorenzo: El Primer Centro del Poder',
      desde: -1200,
      hasta: -900,
      icono: '🗿',
      hitosDestacados: [
        'San Lorenzo: El Primer Gran Centro Olmeca',
        'Las Cabezas Colosales: Retratos del Poder Olmeca',
      ],
      eventos: [
        'Construcción de la meseta artificial de San Lorenzo mediante rellenos de tierra',
        'Las primeras 9 cabezas colosales: retratos en basalto de gobernantes olmecas',
        'Sistema de drenaje en basalto: la ingeniería hidráulica más antigua de Mesoamérica',
        'Transporte del basalto desde el cerro Cintepec: 100 km por ríos sin rueda ni animales',
        'Primeras figuras de jade con iconografía del hombre-jaguar',
        'Destrucción violenta de San Lorenzo (c. 900 a.C.): esculturas mutiladas y enterradas',
      ],
    },
    {
      nombre: 'La Venta: La Ciudad Sagrada',
      desde: -900,
      hasta: -700,
      icono: '🏛️',
      hitosDestacados: [
        'La Venta: La Gran Capital Olmeca',
        'El Hombre-Jaguar: La Religión Olmeca',
      ],
      eventos: [
        'La Venta reemplaza a San Lorenzo como capital del mundo olmeca (c. 900 a.C.)',
        'Construcción de la Gran Pirámide de 32 metros: la mayor de Mesoamérica en su época',
        'Los cuatro "depósitos de mosaico de serpentina": máscaras enterradas sin ser vistas',
        'Las 4 cabezas colosales de La Venta: las más elaboradas del arte olmeca',
        'El eje ceremonial norte-sur: precisión astronómica de 8 grados al oeste magnético',
        'Primeros objetos de jade con iconografía del hombre-jaguar exportados a toda Mesoamérica',
      ],
    },
    {
      nombre: 'La Escritura y el Calendario: Primeras Inscripciones',
      desde: -700,
      hasta: -600,
      icono: '📜',
      hitosDestacados: [
        'La Proto-Escritura y el Proto-Calendario Olmeca',
        'Las Rutas de Comercio Olmeca',
      ],
      eventos: [
        'El Cascajal Block (c. 900 a.C. pero descubierto 2006): 62 glifos olmecas, posible escritura más antigua de América',
        'El Monumento 13 de La Venta: posible proto-escritura en figura olmeca (c. 700 a.C.)',
        'La Estela de San Andrés: glifos interpretados como escritura funcional (c. 650 a.C.)',
        'Los calendarios de 260 y 365 días ya en uso en el área olmeca',
        'Las rutas de obsidiana, jade y plumas conectan la Costa del Golfo con el altiplano y Guatemala',
        'Chalcatzingo (Morelos): arte rupestre con iconografía olmeca a 900 km del centro cultural',
      ],
    },
    {
      nombre: 'El Apogeo Tardío y el Inicio del Declive',
      desde: -600,
      hasta: -500,
      icono: '⭐',
      hitosDestacados: [
        'Tres Zapotes y la Fase Olmeca Tardía',
        'El Arte Olmeca: Jade, Basalto y Cerámica',
      ],
      eventos: [
        'La Venta en su máxima extensión y esplendor artístico (600-400 a.C.)',
        'Tres Zapotes como tercer polo cultural olmeca: cabezas colosales y fechas calendáricas',
        'El arte olmeca en su máxima distribución geográfica: de Guerrero a Guatemala',
        'Las figuras de jade olmecas viajan como objetos de prestigio a las élites de toda Mesoamérica',
        'Inicio del declive de la élite sacerdotal-política de La Venta',
        'Las culturas vecinas (zapoteca, proto-maya) absorben y transforman los elementos olmecas',
      ],
    },
    {
      nombre: 'El Legado: Fin del Mundo Olmeca, Origen de Todo lo Demás',
      desde: -500,
      hasta: -400,
      icono: '🌅',
      hitosDestacados: ['El Legado Olmeca: La Civilización Madre'],
      eventos: [
        'La Venta abandonada o destruida (c. 400 a.C.): fin de la fase olmeca clásica',
        'La iconografía del hombre-jaguar sobrevive en el dios de la lluvia de todas las culturas mesoamericanas posteriores',
        'El juego de pelota ritual se difunde a toda Mesoamérica: desde el norte de México hasta El Salvador',
        'El calendario mesoamericano de 260 días: en uso en todos los grupos culturales de Mesoamérica hasta el siglo XVI',
        'Los zapotecas en Oaxaca y los proto-mayas en Guatemala desarrollan sus propias escrituras a partir del modelo olmeca',
        'Los olmecas no desaparecen: se transforman en culturas regionales epi-olmecas que preservan el legado',
      ],
    },
  ],

  categorias: {
    surgimiento: 'Surgimiento Olmeca',
    arquitectura: 'Centros Ceremoniales',
    arte: 'Arte y Escultura',
    religion: 'Religión y Cosmovisión',
    conocimiento: 'Escritura y Calendario',
    influencia: 'Influencia e Intercambio',
    declive: 'Fase Tardía y Declive',
  },

  colores: {
    surgimiento: '#8B4513',
    arquitectura: '#DAA520',
    arte: '#2E8B57',
    religion: '#9932CC',
    conocimiento: '#1E90FF',
    influencia: '#DC143C',
    declive: '#708090',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'Los olmecas son la "civilización madre" de Mesoamérica: la primera gran civilización de México, activa entre el 1600 y el 400 a.C. en las tierras bajas del Golfo de México. Sus cabezas colosales en basalto —de hasta 50 toneladas— son sus monumentos más reconocibles, pero su legado es mucho más profundo: crearon el primer calendario mesoamericano, posiblemente la primera escritura de América (el Cascajal Block, 900 a.C.), el juego de pelota ritual y la figura del hombre-jaguar que evolucionó en los dioses de la lluvia de mayas, aztecas y zapotecas. Sin los olmecas, no existirían las pirámides de Teotihuacán, el calendario maya ni el Quetzalcóatl azteca. Sus tres grandes centros —San Lorenzo (1200-900 a.C.), La Venta (900-400 a.C.) y Tres Zapotes— muestran una civilización capaz de mover decenas de toneladas de basalto sin rueda, organizar redes comerciales de 1.000 km y construir la pirámide más grande de su época. Un milenio de civilización que puso los cimientos de todo lo que vino después.',

    tablaComparativa: [
      {
        hito: 'San Lorenzo: El Primer Gran Centro Olmeca',
        periodo: '1200-900 a.C.',
        categoria: 'Centros Ceremoniales',
        personaje: 'Gobernantes anónimos de San Lorenzo',
        aportacion:
          'Primera meseta artificial, cabezas colosales, drenaje de piedra: la primera metrópoli de Mesoamérica',
      },
      {
        hito: 'La Venta: La Gran Capital Olmeca',
        periodo: '900-400 a.C.',
        categoria: 'Centros Ceremoniales',
        personaje: 'Gobernantes de La Venta (anónimos)',
        aportacion:
          'Gran Pirámide de 32 m; depósitos de serpentina; el complejo ceremonial más sofisticado de Mesoamérica en su época',
      },
      {
        hito: 'Las Cabezas Colosales: Retratos del Poder Olmeca',
        periodo: '1200-400 a.C.',
        categoria: 'Arte y Escultura',
        personaje: '17 gobernantes retratados (anónimos)',
        aportacion:
          'Los primeros retratos personalizados de Mesoamérica: 5-50 toneladas de basalto transportadas 100 km sin rueda',
      },
      {
        hito: 'El Hombre-Jaguar: La Religión Olmeca',
        periodo: '1200-400 a.C.',
        categoria: 'Religión y Cosmovisión',
        personaje: 'Sacerdotes-gobernantes olmecas',
        aportacion:
          'La figura humano-felina que evolucionó en el Tláloc azteca, el Chaac maya y todos los dioses de la lluvia mesoamericanos',
      },
      {
        hito: 'La Proto-Escritura y el Proto-Calendario Olmeca',
        periodo: '900-400 a.C.',
        categoria: 'Escritura y Calendario',
        personaje: 'Escribas olmecas (Cascajal Block)',
        aportacion:
          'Posible escritura más antigua de América (900 a.C.); los calendarios de 260 y 365 días tienen raíces olmecas',
      },
      {
        hito: 'El Legado Olmeca: La Civilización Madre',
        periodo: '600-400 a.C.',
        categoria: 'Influencia e Intercambio',
        personaje: 'Toda la Mesoamérica posterior',
        aportacion:
          'El juego de pelota, el calendario, el hombre-jaguar, la arquitectura de plataformas: herencias olmecas en todas las culturas siguientes',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiante de Historia',
        perfil: 'Estudia civilizaciones precolombinas o las raíces de la cultura mesoamericana',
        texto:
          'Este visualizador ofrece una cronología completa de los olmecas, desde las primeras aldeas del Golfo hasta el legado que recibieron mayas y aztecas. Ideal para contextualizar el origen de las grandes civilizaciones mesoamericanas y entender qué innovaciones surgieron primero en la Costa del Golfo.',
      },
      {
        icono: '🏺',
        titulo: 'Aficionado a la arqueología',
        perfil: 'Le fascinan las excavaciones, los artefactos y los misterios arqueológicos como el Cascajal Block',
        texto:
          'Los olmecas son uno de los grandes enigmas arqueológicos: sus gobernantes son anónimos, su escritura sin descifrar del todo, sus rituales de "matar" esculturas sin paralelo. Este visualizador sitúa cada descubrimiento arqueológico —cabezas colosales, depósitos de serpentina, el Cascajal Block— en su contexto histórico y cultural.',
      },
      {
        icono: '🦁',
        titulo: 'Curioso por el arte monumental',
        perfil: 'Le interesan las esculturas colosales y cómo se construyeron sin tecnología moderna',
        texto:
          'Las 17 cabezas colosales olmecas (entre 5 y 50 toneladas) se transportaron desde el cerro Cintepec hasta los centros urbanos sin rueda, sin animales de carga y cruzando ríos. Este visualizador explica el contexto logístico, político y simbólico de esta hazaña de ingeniería del mundo antiguo.',
      },
      {
        icono: '📚',
        titulo: 'Interesado en los orígenes de la escritura',
        perfil: 'Quiere entender si los olmecas inventaron la escritura en América',
        texto:
          'El Cascajal Block (c. 900 a.C.) con sus 62 glifos en hileras horizontales es el candidato más fuerte a escritura más antigua de América. Este visualizador sitúa el debate en su contexto cronológico: qué se sabe, qué se discute y cómo se relaciona con el posterior desarrollo de la escritura maya.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué se llaman olmecas?',
        respuesta:
          'El nombre "olmeca" proviene del náhuatl y significa "gente del país del hule (caucho)". Lo usaron los aztecas siglos después para referirse a los pueblos que vivían en esa región del Golfo de México. Los propios constructores de San Lorenzo y La Venta nunca se llamaron a sí mismos "olmecas": no conocemos su autodenominación original. Es un término arqueológico convencional, no el nombre que ellos mismos usaban.',
        tip: 'Los aztecas habitaron la región del Golfo mucho después que la civilización olmeca clásica: el nombre es un préstamo retrospectivo.',
      },
      {
        pregunta: '¿Qué son las cabezas colosales olmecas y por qué son tan especiales?',
        respuesta:
          'Son 17 esculturas monumentales en basalto que representan a gobernantes reales de la civilización olmeca, con rasgos faciales individualizados (no son figuras genéricas). Miden entre 1,5 y 3,4 metros de altura y pesan entre 5 y 50 toneladas. Lo extraordinario es su transporte: el basalto se extraía en el cerro Cintepec (60-100 km de distancia) y se transportaba en balsas por los ríos sin rueda ni animales de carga, lo que demuestra una organización política y logística de alto nivel.',
        tip: 'Los cascos de las cabezas colosales se interpretan como equipamiento para el juego de pelota ritual, lo que las conectaría con ese culto central de la religión olmeca.',
      },
      {
        pregunta: '¿Inventaron los olmecas la escritura en América?',
        respuesta:
          'El Cascajal Block, una losa de serpentina con 62 glifos en hileras horizontales datada hacia el 900 a.C. (descubierta en 2006), es el candidato más fuerte a escritura más antigua de América. Si el desciframento se confirma plenamente, los olmecas serían los inventores de la escritura en el continente americano. Sin embargo, el debate académico continúa: algunos investigadores consideran que podría ser un sistema proto-escritural o de contabilidad, no escritura plena en el sentido estricto.',
        tip: 'La Estela de San Andrés (c. 650 a.C.) contiene glifos que algunos investigadores interpretan como escritura funcional olmeca, con posibles nombres de lugares o gobernantes.',
      },
      {
        pregunta: '¿Por qué desaparecieron los olmecas?',
        respuesta:
          'Los olmecas no "desaparecieron": la cultura olmeca clásica cesó como entidad cultural coherente hacia el 400 a.C. (cuando La Venta fue abandonada o destruida), pero sus innovaciones sobrevivieron en todas las culturas mesoamericanas posteriores. Las causas del fin de la fase clásica olmeca incluyen posibles cambios climáticos, alteraciones en los sistemas fluviales que sustentaban la agricultura, conflictos internos y la coevolución de culturas vecinas que ya habían absorbido y superado el modelo olmeca.',
        tip: 'Tres Zapotes continuó habitada después del 400 a.C., convirtiéndose en un puente entre el mundo olmeca y las culturas totonaca y clásica veracruzana posteriores.',
      },
      {
        pregunta: '¿Qué relación tienen los olmecas con los mayas y los aztecas?',
        respuesta:
          'Los olmecas son considerados la "civilización madre" o "civilización hermana" de todas las grandes culturas mesoamericanas. Sus innovaciones llegaron directamente a mayas y aztecas: el juego de pelota ritual con cancha formalizada, los calendarios de 260 y 365 días (que los mayas sofisticaron en la Cuenta Larga), la figura del hombre-jaguar que evolucionó en el Tláloc azteca y el Chaac maya, y la arquitectura de plataformas ceremoniales. Sin los olmecas, el edificio cultural mesoamericano habría sido radicalmente distinto.',
        tip: 'La Cuenta Larga maya —el sistema calendárico que generó la popular "profecía maya de 2012"— tiene sus antecedentes más tempranos en inscripciones de la zona olmeca, como la Estela C de Tres Zapotes.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por la Línea del Tiempo para captar el arco completo',
        cuerpo:
          'Los olmecas activos durante 1.200 años (1600-400 a.C.) presentan una complejidad creciente: las primeras aldeas del siglo XVI a.C. poco tienen que ver con la sofisticación de La Venta en el siglo V a.C. Haz clic en el primer período (aldeas del Golfo) y en el último (legado olmeca) para sentir la diferencia.',
      },
      {
        titulo: 'Compara San Lorenzo con La Venta en la pestaña Período en Detalle',
        cuerpo:
          'San Lorenzo (1200-900 a.C.) y La Venta (900-400 a.C.) son los dos grandes centros olmecas sucesivos. Compara sus fechas, sus logros y sus finales: uno fue destruido violentamente, el otro abandonado gradualmente. El contraste ilustra cómo el poder olmeca se trasladó y evolucionó durante tres siglos.',
      },
      {
        titulo: 'Usa la Comparativa para entender el legado transversal',
        cuerpo:
          'En la tabla Comparativa, observa cuántos hitos cubren el período completo (1200-400 a.C.): las cabezas colosales, el hombre-jaguar, el arte. Esto refleja que estas innovaciones no fueron de un período concreto, sino constantes que atravesaron toda la civilización olmeca.',
      },
      {
        titulo: 'En Contexto Histórico, sigue la cadena de influencias',
        cuerpo:
          'Las 6 eras muestran cómo la influencia olmeca se expandió desde las aldeas locales hasta cubrir toda Mesoamérica. La era "El Legado" es la más importante: explica qué elementos olmecas sobrevivieron exactamente en mayas, zapotecas y aztecas, y por qué los arqueólogos debaten entre "civilización madre" y "civilización hermana".',
      },
      {
        titulo: 'Busca "hombre-jaguar" en la Comparativa para seguir el hilo religioso',
        cuerpo:
          'El motivo del hombre-jaguar es el hilo conductor de la religión olmeca y su legado. En la tabla Comparativa, filtra por "Religión y Cosmovisión" para ver cómo esta iconografía atraviesa toda la civilización olmeca y se convierte en la base de los sistemas religiosos mesoamericanos posteriores.',
      },
    ],

    tips: [
      {
        icono: '🗿',
        texto:
          'Las cabezas colosales olmecas son retratos individuales de gobernantes reales, no figuras míticas genéricas. Los arqueólogos lo saben porque los rasgos faciales son distintos en cada cabeza: algunos tienen nariz más ancha, otros labios más gruesos, otros pómulos más marcados. Son los primeros "retratos" de la historia de Mesoamérica.',
      },
      {
        icono: '🎯',
        texto:
          'El juego de pelota mesoamericano —con cancha en forma de I, pelota de caucho sólida de 3-4 kg y reglas formales— fue codificado por los olmecas y se difundió a toda Mesoamérica durante 3.000 años. Lo jugaron mayas, aztecas, toltecas y docenas de culturas intermedias. Era un ritual religioso, no un deporte competitivo en el sentido moderno.',
      },
      {
        icono: '💚',
        texto:
          'Los "depósitos de mosaico de serpentina" de La Venta son uno de los misterios más fascinantes del mundo antiguo: enormes máscaras del hombre-jaguar elaboradas con miles de piezas de piedra verde, enterradas bajo el suelo a varios metros de profundidad, nunca destinadas a ser vistas por ojos humanos. Eran ofrendas al inframundo. Solo se descubrieron porque los arqueólogos excavaron sin saber qué había allí.',
      },
      {
        icono: '🌍',
        texto:
          'El término "civilización madre" fue propuesto por el arqueólogo mexicano Alfonso Caso en los años 1940. Desde los años 1990, algunos arqueólogos prefieren "civilización hermana" para evitar una visión lineal de la historia: varias culturas mesoamericanas (olmecas, zapotecas, mayas del Preclásico) se desarrollaron en paralelo con intercambios mutuos, no en una línea directa madre-hija.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir "olmeca" con el nombre que ellos mismos usaban',
        cuerpo:
          '"Olmeca" es un término náhuatl que usaron los aztecas siglos después para referirse a los pueblos de esa región del Golfo. Los constructores de San Lorenzo y La Venta nunca se llamaron "olmecas". No conocemos su autodenominación. Es un término arqueológico convencional del siglo XX, como llamar "vikingos" a los nórdicos medievales, que tampoco usaban ese término para sí mismos.',
      },
      {
        titulo: 'Creer que las cabezas colosales representan figuras de dioses o extraterrestres',
        cuerpo:
          'Las cabezas colosales olmecas son retratos de gobernantes humanos reales, no imágenes de dioses ni —como circula en algunos medios populares— de "visitantes extraterrestres". Los rasgos individualizados, los cascos de jugador de pelota y el contexto arqueológico lo confirman. Los olmecas tenían capacidad técnica, logística y artística suficiente para crear estas obras sin ninguna intervención externa.',
      },
      {
        titulo: 'Pensar que los olmecas "desaparecieron" misteriosamente',
        cuerpo:
          'La cultura olmeca clásica cesó como entidad coherente hacia el 400 a.C., pero no "desapareció". Sus innovaciones —calendario, juego de pelota, iconografía del hombre-jaguar, arquitectura de plataformas— sobrevivieron en todas las culturas mesoamericanas posteriores. Los descendientes biológicos y culturales de los olmecas continuaron habitando la región del Golfo como culturas epi-olmecas, totonacas y otras.',
      },
      {
        titulo: 'Asumir que "civilización madre" significa que los olmecas inventaron todo',
        cuerpo:
          'El debate académico actual matiza la tesis de "civilización madre": varias culturas mesoamericanas (olmecas en el Golfo, zapotecas en Oaxaca, culturas del altiplano central) se desarrollaron de forma paralela con intercambios mutuos. Algunos elementos "olmecas" podrían haber surgido simultáneamente en otras regiones. La influencia olmeca es real e innegable, pero la relación no es simple causa-efecto lineal.',
      },
    ],
  },
};
