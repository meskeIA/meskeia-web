import type { HistoriaData } from './types';

export const arquitecturaEspanola: HistoriaData = {
  slug: 'arquitectura-espanola',
  titulo: 'Historia de la Arquitectura Española: Del Románico al Guggenheim',
  subtitulo: 'Del Románico al Guggenheim — 1.000 años de arquitectura en 10 períodos interactivos: Mudéjar, Herrerismo, Gaudí, Franquismo e Íconos Globales',
  descripcionSEO: 'Cronología interactiva de la historia de la arquitectura española: del Románico (s.XI) a la arquitectura sostenible del s.XXI. Románico, Gótico, Mudéjar, Herrerismo, Barroco, Neoclásico, Modernismo catalán, Franquismo y el Guggenheim en 10 hitos y 6 eras.',
  keywords: [
    'historia arquitectura española cronología',
    'románico camino santiago catedral',
    'arte mudéjar patrimonio humanidad',
    'el escorial herrerismo juan de herrera',
    'gaudí sagrada familia modernismo catalán',
    'barroco churrigueresco plaza mayor salamanca',
    'guggenheim bilbao efecto guggenheim',
    'arquitectura franquista valle de los caídos',
    'neoclásico palacio real madrid museo prado',
    'arquitectura sostenible rehabilitación energética',
  ],
  anioInicio: 1000,
  anioFin: 9999,

  hitos: [
    {
      id: 'romanico',
      nombre: 'Románico: Las Piedras del Camino',
      anioInicio: 1000,
      anioFin: 1150,
      color: '#8B4513',
      categoria: 'medieval',
      descripcion: 'El arte románico llega a la Península Ibérica a través del Camino de Santiago y la influencia francesa. La Catedral de Santiago de Compostela (iniciada en 1075 por el obispo Diego Peláez) se convierte en el gran santuario de peregrinación cristiano. Las iglesias se caracterizan por muros gruesos, arcos de medio punto, torres cuadradas y una escultura narrativa en portadas y capiteles. Los monasterios benedictinos y cluniacenses difunden el estilo a lo largo del Camino.',
      obraIconica: 'Catedral de Santiago de Compostela (iniciada 1075) — Pórtico de la Gloria del Maestro Mateo (1188), cumbre de la escultura románica española',
      paises: ['España'],
    },
    {
      id: 'gotico-mudejar',
      nombre: 'Gótico y Mudéjar: Fusión de Culturas',
      anioInicio: 1150,
      anioFin: 1450,
      color: '#4B0082',
      categoria: 'medieval',
      descripcion: 'El gótico llega de Francia con el arco ojival, la bóveda de crucería y el arbotante, que permiten muros más delgados y vitrales espectaculares. La Catedral de Burgos (iniciada 1221) y la de León (s.XIII) son cumbres del gótico español. La gran originalidad peninsular es el Arte Mudéjar: artesanos musulmanes que trabajan para reyes cristianos, fusionando geometría islámica, ladrillo y yeserías con estructuras góticas. El resultado es único en el mundo.',
      obraIconica: 'Catedral de Burgos (1221) / Giralda de Sevilla / Reales Alcázares — la Catedral de León tiene más de 1.800 m² de vidrieras medievales',
      paises: ['España'],
    },
    {
      id: 'isabelino-plateresco',
      nombre: 'Isabelino y Plateresco: La Exuberancia Regia',
      anioInicio: 1450,
      anioFin: 1560,
      color: '#DAA520',
      categoria: 'imperial',
      descripcion: 'Los Reyes Católicos impulsan el Gótico Isabelino o Plateresco temprano. Se caracteriza por decoración superficial minuciosa —como trabajo de platero— sobre estructuras góticas. La fachada de la Universidad de Salamanca (h.1529) es el paradigma del Plateresco. La Catedral Nueva de Salamanca (iniciada 1513) y la Capilla Real de Granada definen la imagen de poder de la monarquía española. El término "plateresco" viene de "platero": la decoración era tan fina que parecía obra de orfebre.',
      obraIconica: 'Fachada Universidad de Salamanca (h.1529) / Catedral Nueva de Salamanca (1513) — en la fachada se esconde una rana en un cráneo, tradición de buena suerte',
      paises: ['España'],
    },
    {
      id: 'herrerismo',
      nombre: 'El Escorial y el Herrerismo: La Austeridad Imperial',
      anioInicio: 1560,
      anioFin: 1600,
      color: '#696969',
      categoria: 'imperial',
      descripcion: 'Felipe II encarga a Juan de Herrera el Monasterio de El Escorial (1563–1584), símbolo de la Contrarreforma y del poder imperial español. En radical contraste con el Plateresco, el Herrerismo es austero, geométrico y monumental: sin ornamentación, con piedra gris, torres cuadradas y horizontales prolongadas. Es el clasicismo español hecho poder. El estilo se extiende a catedrales, palacios y edificios civiles en toda España y sus colonias.',
      obraIconica: 'Monasterio de El Escorial (1563–1584, Juan de Herrera) — 16 patios, 88 fuentes, 300 celdas, más de 1.200 puertas y ventanas; tardó 21 años',
      paises: ['España'],
    },
    {
      id: 'barroco-churrigueresco',
      nombre: 'Churrigueresco y Barroco: La Ornamentación Desbordante',
      anioInicio: 1600,
      anioFin: 1700,
      color: '#DC143C',
      categoria: 'imperial',
      descripcion: 'La reacción al frío herrerismo trae el Barroco español, que en su versión más extrema se llama Churrigueresco (por la familia Churriguera). José de Churriguera diseña el retablo mayor de San Esteban de Salamanca (1692) y planifica la Plaza Mayor de Salamanca (completada 1755). Las fachadas se convierten en tapices de piedra labrada. Las plazas mayores castellanas definen un modelo de espacio cívico y comercial que se replica en toda Hispanoamérica.',
      obraIconica: 'Plaza Mayor de Salamanca (1729) — 88 arcos; Fachada del Obradoiro, Catedral de Santiago (1738, Fernando de Casas): el culmen del Barroco español',
      paises: ['España'],
    },
    {
      id: 'neoclasico-ilustrado',
      nombre: 'Ilustración y Neoclásico: La Razón Borbónica',
      anioInicio: 1700,
      anioFin: 1874,
      color: '#4169E1',
      categoria: 'ilustrado',
      descripcion: 'Los Borbones traen el gusto francés e italiano. El Palacio Real de Madrid (1738–1764, Giovanni Battista Sacchetti) tiene 3.418 habitaciones y es el mayor palacio europeo por superficie. Ventura Rodríguez y Juan de Villanueva son los arquitectos de la Ilustración española. El Museo del Prado (1785, Villanueva) y la Puerta de Alcalá (1778, Sabatini) definen el Paseo del Prado. En el s.XIX llega el eclecticismo: el hierro de las estaciones ferroviarias y el Palacio de Cristal del Retiro (1887).',
      obraIconica: 'Palacio Real de Madrid (1738–1764) / Museo del Prado (1785, Villanueva) — Palacio de Cristal del Retiro (1887), precursor de la arquitectura moderna',
      paises: ['España', 'Francia', 'Italia'],
    },
    {
      id: 'modernismo-catalan',
      nombre: 'Modernismo Catalán: Gaudí y la Arquitectura Orgánica',
      anioInicio: 1874,
      anioFin: 1936,
      color: '#228B22',
      categoria: 'modernismo',
      descripcion: 'El Modernisme catalán es la respuesta española al Art Nouveau europeo, pero mucho más radical y personal. Antoni Gaudí es el gran genio: la Sagrada Família (iniciada 1882), el Palau Güell (1888), la Casa Batlló (1904–1906), la Casa Milà "La Pedrera" (1906–1910) y el Park Güell (1900–1914). Lluís Domènech i Montaner crea el Palau de la Música Catalana (1908). Gaudí calculó las formas colgando cadenas al revés: la forma que toma una cadena invertida es el arco perfecto estructuralmente.',
      obraIconica: 'Sagrada Família (1882, Gaudí) / Palau de la Música Catalana (1908, Domènech) — más de 10 millones de visitantes al año; obras de Gaudí declaradas Patrimonio UNESCO',
      paises: ['España'],
    },
    {
      id: 'franquismo-desarrollismo',
      nombre: 'Franquismo y Desarrollismo: La Arquitectura del Régimen',
      anioInicio: 1936,
      anioFin: 1975,
      color: '#A0522D',
      categoria: 'franquismo',
      descripcion: 'El régimen franquista impone un "Estilo Nacional" síntesis de herrerismo y neoclásico imperial. El Valle de los Caídos (1940–1958) es la obra más emblemática: basílica excavada en roca con una cruz de 150 metros, la mayor del mundo. Desde 1959, el Plan de Estabilización abre España al turismo: la costa mediterránea se llena de hoteles racionalistas. La Torre de Madrid (1957, 142 metros) fue durante años el edificio de hormigón más alto del mundo.',
      obraIconica: 'Valle de los Caídos (1940–1958) / Torre de Madrid (1957) — el turismo pasó de 4 millones en 1959 a 34 millones en 1975',
      paises: ['España'],
    },
    {
      id: 'democracia-iconos',
      nombre: 'La Democracia y el Renacimiento Arquitectónico',
      anioInicio: 1975,
      anioFin: 2010,
      color: '#1E90FF',
      categoria: 'democratico',
      descripcion: 'La Transición libera la creatividad. Rafael Moneo construye el Museo Nacional de Arte Romano de Mérida (1986). Barcelona se transforma para los JJOO de 1992: Villa Olímpica, Port Olímpic, el "modelo Barcelona" de Oriol Bohigas se convierte en referencia mundial. El Guggenheim de Bilbao (1997, Frank Gehry) cambia el paradigma: el "Efecto Guggenheim" convierte a Bilbao en destino turístico global. Santiago Calatrava construye la Ciudad de las Artes y las Ciencias de Valencia (1998).',
      obraIconica: 'Guggenheim Bilbao (1997, Frank Gehry) — 89 millones de dólares de coste, 500 millones en ingresos turísticos el primer año; Rafael Moneo, único español con el Premio Pritzker',
      paises: ['España', 'EE.UU.'],
    },
    {
      id: 'sostenible-rehabilitacion',
      nombre: 'Post-Crisis y Arquitectura Sostenible: La Vuelta a lo Esencial',
      anioInicio: 2010,
      anioFin: 9999,
      color: '#48A9A6',
      categoria: 'sostenible',
      descripcion: 'El colapso del boom inmobiliario (2008-2013) paraliza la construcción. Miles de edificios sin terminar, "ciudades fantasma" (Seseña). La arquitectura se reorienta: rehabilitación urbana frente a obra nueva, eficiencia energética (BREEAM, LEED), BIM, arquitectura paramétrica accesible. Los fondos europeos Next Generation UE destinan 6.800 millones a la rehabilitación del parque residencial. España construyó entre 1997 y 2007 más viviendas que Alemania, Francia, Italia y Reino Unido juntos.',
      obraIconica: 'Regeneración Poblenou, Barcelona / Complejo Holcim Madrid (2011, Selgas Cano) — la rehabilitación supera ya el 40% del PIB de la construcción',
      paises: ['España'],
    },
  ],

  eras: [
    {
      nombre: 'Arquitectura Medieval',
      desde: 1000,
      hasta: 1450,
      icono: '⛪',
      hitosDestacados: [
        'Románico: Las Piedras del Camino',
        'Gótico y Mudéjar: Fusión de Culturas',
      ],
      eventos: [
        '1075 — Catedral de Santiago de Compostela: comienza la gran obra del Románico español',
        '1188 — Pórtico de la Gloria (Maestro Mateo): cumbre de la escultura románica',
        '1221 — Catedral de Burgos iniciada — cumbre del gótico clásico español',
        's.XII — La Giralda almohade de Sevilla, luego reconvertida en campanario cristiano',
        's.XIII — Reales Alcázares de Sevilla: el Mudéjar nace de la convivencia entre culturas',
      ],
    },
    {
      nombre: 'Los Siglos de Oro',
      desde: 1450,
      hasta: 1700,
      icono: '👑',
      hitosDestacados: [
        'Isabelino y Plateresco: La Exuberancia Regia',
        'El Escorial y el Herrerismo: La Austeridad Imperial',
        'Churrigueresco y Barroco: La Ornamentación Desbordante',
      ],
      eventos: [
        '1513 — Catedral Nueva de Salamanca iniciada: el gótico tardío español en su máximo esplendor',
        '1529 — Fachada de la Universidad de Salamanca: el Plateresco como identidad nacional',
        '1563 — El Escorial comienza: Felipe II y Juan de Herrera definen el clasicismo imperial',
        '1584 — Finalización de El Escorial tras 21 años de obra',
        '1692 — Retablo de San Esteban, Salamanca: el Churrigueresco desborda la ornamentación',
      ],
    },
    {
      nombre: 'Ilustración y Romanticismo',
      desde: 1700,
      hasta: 1874,
      icono: '🏛️',
      hitosDestacados: [
        'Ilustración y Neoclásico: La Razón Borbónica',
      ],
      eventos: [
        '1700 — Felipe V, primer Borbón: llega el gusto francés e italiano',
        '1738 — Palacio Real de Madrid: el mayor palacio europeo por superficie',
        '1778 — Puerta de Alcalá (Sabatini): el Paseo del Prado como eje cultural de Madrid',
        '1785 — Museo del Prado (Villanueva): diseñado como museo de ciencias, reconvertido en pinacoteca en 1819',
        '1887 — Palacio de Cristal del Retiro: el hierro y el cristal como nuevos materiales',
      ],
    },
    {
      nombre: 'Modernismo y Vanguardias',
      desde: 1874,
      hasta: 1936,
      icono: '🎨',
      hitosDestacados: [
        'Modernismo Catalán: Gaudí y la Arquitectura Orgánica',
      ],
      eventos: [
        '1882 — Gaudí se hace cargo de la Sagrada Família: nace el Modernismo catalán radical',
        '1888 — Exposición Universal de Barcelona: el Modernisme se presenta al mundo',
        '1900 — Park Güell: la naturaleza integrada en la arquitectura urbana',
        '1908 — Palau de la Música Catalana (Domènech i Montaner): Patrimonio UNESCO',
        '1926 — Muerte de Gaudí: solo el 25% de la Sagrada Família está construido',
      ],
    },
    {
      nombre: 'Franquismo y Desarrollismo',
      desde: 1936,
      hasta: 1975,
      icono: '🔨',
      hitosDestacados: [
        'Franquismo y Desarrollismo: La Arquitectura del Régimen',
      ],
      eventos: [
        '1940 — Valle de los Caídos comienza: la arquitectura monumental del franquismo',
        '1953 — Edificio España, Madrid: los primeros rascacielos franquistas',
        '1957 — Torre de Madrid: durante años el edificio de hormigón más alto del mundo',
        '1959 — Plan de Estabilización: España se abre al turismo, boom en el litoral',
        '1969 — El turismo supera los 21 millones de visitantes: el desarrollismo en pleno auge',
      ],
    },
    {
      nombre: 'Democracia e Íconos Globales',
      desde: 1975,
      hasta: 9999,
      icono: '🌍',
      hitosDestacados: [
        'La Democracia y el Renacimiento Arquitectónico',
        'Post-Crisis y Arquitectura Sostenible: La Vuelta a lo Esencial',
      ],
      eventos: [
        '1986 — Museo Nacional de Arte Romano de Mérida (Moneo): la democracia madura arquitectónicamente',
        '1992 — Barcelona Olímpica y Expo Sevilla: España se proyecta al mundo a través de la arquitectura',
        '1997 — Guggenheim Bilbao (Frank Gehry): el "Efecto Guggenheim" cambia el paradigma arquitectónico',
        '2010 — Crisis inmobiliaria: el modelo del boom se agota, comienza la era de la rehabilitación',
        '2021 — Fondos Next Generation UE: 6.800 millones para rehabilitación energética de viviendas',
      ],
    },
  ],

  categorias: {
    medieval: 'Arquitectura Medieval',
    imperial: 'Siglos de Oro',
    ilustrado: 'Ilustración y Eclecticismo',
    modernismo: 'Modernismo Catalán',
    franquismo: 'Franquismo y Desarrollismo',
    democratico: 'Democracia e Íconos',
    sostenible: 'Sostenible',
  },

  colores: {
    medieval: '#8B4513',
    imperial: '#DAA520',
    ilustrado: '#4169E1',
    modernismo: '#228B22',
    franquismo: '#A0522D',
    democratico: '#1E90FF',
    sostenible: '#48A9A6',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'La arquitectura española es un espejo de su historia: cada estilo nació de un contexto político, religioso y económico concreto. Del Románico del Camino de Santiago al Mudéjar de la convivencia de culturas, del Herrerismo imperial de Felipe II al Modernisme radical de Gaudí, la arquitectura española ha definido identidades, expresado poder y generado patrimonio único en el mundo. Hoy, con más de 50 bienes UNESCO y 10 millones de visitas anuales solo a la Sagrada Família, es uno de los mayores activos culturales del país.',

    tablaComparativa: [
      { hito: 'Románico: Las Piedras del Camino', periodo: 's.XI–s.XII', categoria: 'Románico', personaje: 'Maestro Mateo', aportacion: 'Arco de medio punto, bóveda de cañón, escultura narrativa en portadas' },
      { hito: 'Gótico y Mudéjar: Fusión de Culturas', periodo: 's.XII–s.XV', categoria: 'Gótico/Mudéjar', personaje: 'Anónimo mudéjar', aportacion: 'Arco ojival, Arte Mudéjar: fusión única de culturas cristiana e islámica' },
      { hito: 'El Escorial y el Herrerismo: La Austeridad Imperial', periodo: 's.XVI', categoria: 'Herrerismo', personaje: 'Juan de Herrera', aportacion: 'Clasicismo austero, monumentalidad sin ornamentación, símbolo imperial' },
      { hito: 'Modernismo Catalán: Gaudí y la Arquitectura Orgánica', periodo: '1874–1936', categoria: 'Modernismo Catalán', personaje: 'Antoni Gaudí', aportacion: 'Formas orgánicas, trencadís, estructura catenaria, integración naturaleza-arquitectura' },
      { hito: 'La Democracia y el Renacimiento Arquitectónico', periodo: '1975–2010', categoria: 'Democracia', personaje: 'Rafael Moneo / Frank Gehry', aportacion: 'Modelo Barcelona, Efecto Guggenheim, recuperación espacio público' },
      { hito: 'Post-Crisis y Arquitectura Sostenible: La Vuelta a lo Esencial', periodo: '2010–hoy', categoria: 'Sostenible', personaje: 'Selgas Cano', aportacion: 'BIM, certificación energética, rehabilitación urbana, Passive House' },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiante de Historia del Arte',
        perfil: 'Preparando exámenes de Bachillerato o universidad',
        texto: 'Repasa los estilos arquitectónicos españoles con sus fechas, características y obras emblemáticas en la cronología visual. Entiende por qué el Mudéjar es único en el mundo, qué diferencia el Herrerismo del Plateresco o cómo el Modernismo catalán anticipó técnicas que solo se implementaron con ordenadores décadas después.',
      },
      {
        icono: '🗺️',
        titulo: 'Turista cultural planificando viaje',
        perfil: 'Prepara una ruta por monumentos españoles',
        texto: 'Usa la cronología para organizar el patrimonio que vas a visitar: el Románico del Camino de Santiago, el Mudéjar aragonés, el Plateresco de Salamanca, la Barcelona modernista, el Guggenheim de Bilbao. Cada estilo tiene su ruta geográfica natural. El contexto histórico transforma la experiencia de visita.',
      },
      {
        icono: '🏛️',
        titulo: 'Aficionado a la arquitectura',
        perfil: 'Quiere entender por qué los edificios son como son',
        texto: 'Comprende cómo la política y la economía generan estilos arquitectónicos: El Escorial como símbolo de la Contrarreforma, el Guggenheim como estrategia de regeneración urbana, la arquitectura franquista como propaganda del régimen. Los edificios son documentos históricos en piedra y acero.',
      },
      {
        icono: '🔍',
        titulo: 'Curioso sobre el patrimonio español',
        perfil: 'Ha visitado el Prado o la Sagrada Família y quiere saber más',
        texto: 'Entiende qué tienen en común el Pórtico de la Gloria, la Plaza Mayor de Salamanca y el Guggenheim Bilbao: todos son momentos en que España exportó un modelo arquitectónico al mundo. La historia de la arquitectura española es la historia de un país que construyó su identidad en piedra, ladrillo y titanio.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué el Arte Mudéjar es único en el mundo?',
        respuesta: 'El Mudéjar nació de una circunstancia histórica irrepetible: la convivencia durante siglos de tres culturas —cristiana, islámica y judía— en la Península Ibérica. Los artesanos musulmanes que se quedaron bajo dominio cristiano (llamados mudéjares) siguieron construyendo con sus técnicas: ladrillo, cerámica vidriada, yeserías, artesonados de madera geométrica. El resultado fue una arquitectura sin paralelos en Europa: torres como la Giralda o el campanario de Santa María de Calatayud.',
        tip: 'El Mudéjar fue declarado Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO en 2001. Aragón concentra el mayor número de edificios mudéjares del mundo.',
      },
      {
        pregunta: '¿Por qué la Sagrada Família lleva más de 140 años en construcción?',
        respuesta: 'Gaudí murió en 1926 sin haber terminado el templo, dejando solo un 25% construido. La guerra civil española (1936-1939) destruyó los planos originales —recuperados parcialmente de fragmentos—. La construcción se financió exclusivamente con donaciones y entradas de turistas, sin dinero público. Las técnicas de Gaudí —estructuras que se calculan colgando cadenas al revés— eran tan avanzadas que tardaron décadas en poder reproducirse.',
        tip: 'Si hubieran construido la Sagrada Família al mismo ritmo desde 1882 hasta hoy, habría tardado solo unos 30 años. La ralentización se debe a la financiación por donaciones y las interrupciones históricas.',
      },
      {
        pregunta: '¿Qué fue el "Efecto Guggenheim" y por qué no siempre funciona?',
        respuesta: 'El Guggenheim de Bilbao (1997, Frank Gehry) demostró que un edificio espectacular puede transformar una ciudad industrial declinante en destino cultural global: Bilbao multiplicó por 5 su turismo en el primer año. El "efecto" se intentó replicar en Valencia (Ciudad de las Artes y las Ciencias), Zaragoza (Expo 2008), etc. No siempre funciona: requiere un contexto urbano regenerado, conectividad y programación cultural sostenida.',
        tip: 'El Guggenheim Bilbao recuperó su coste de construcción (89 millones de dólares) en menos de 3 años solo en ingresos fiscales adicionales. Hoy genera 400-500 millones de euros al año para la economía vasca.',
      },
      {
        pregunta: '¿Por qué el boom inmobiliario español fue tan destructivo arquitectónicamente?',
        respuesta: 'Entre 1997 y 2007 España construyó más viviendas que Alemania, Francia, Italia y Reino Unido juntos. La presión especulativa significaba construir rápido y barato: fachadas de colores chillones, materiales de baja calidad, ausencia de espacio público, urbanizaciones sin servicios. El resultado fue un "horror arquitectónico" masivo que ahora envejece muy mal, junto a deuda pública y privada insostenible.',
        tip: 'El arquitecto Rafael Moneo definió el boom como "la mayor destrucción del paisaje español desde la desamortización del siglo XIX". Municipios como Seseña (Toledo) planificaron para 40.000 habitantes y nunca superaron los 8.000.',
      },
      {
        pregunta: '¿Cuáles son los principales retos de la arquitectura española actual?',
        respuesta: 'El sector enfrenta tres grandes desafíos: la rehabilitación energética del parque edificado (15 millones de viviendas ineficientes), la crisis de accesibilidad a la vivienda en las grandes ciudades (el precio del alquiler ha subido un 70% en 10 años en Madrid y Barcelona) y la regulación del turismo masivo que está degradando los centros históricos. Los fondos europeos Next Generation UE destinan 6.800 millones a la rehabilitación.',
        tip: 'La rehabilitación energética de viviendas en España tiene un potencial de ahorro energético de entre el 50% y el 80% en edificios anteriores a 1980. Es la mayor oportunidad de reducción de emisiones del sector construcción.',
      },
    ],

    pasos: [
      {
        titulo: 'Aprende a reconocer los elementos arquitectónicos básicos',
        cuerpo: 'Cada estilo tiene un vocabulario visual: el arco de medio punto es románico, el ojival es gótico, el arco mixtilíneo es Mudéjar, la columna salomónica es barroca. Reconocer estos elementos hace la visita mucho más rica. No necesitas ser arquitecto: basta con saber que el arco ojival (apuntado) surgió para construir más alto sin presión horizontal.',
      },
      {
        titulo: 'Planifica por rutas temáticas y estilos, no solo por ciudades',
        cuerpo: 'El Camino de Santiago estructura el románico del norte. La "ruta del Renacimiento" une Salamanca, Ávila y Segovia. El triángulo modernista catalán (Gaudí, Domènech, Puig i Cadafalch) se puede hacer en 3-4 días en Barcelona. La ruta del Barroco castellano conecta Salamanca con Madrid. Visitar por estilos es más enriquecedor que la ruta capital por capital.',
      },
      {
        titulo: 'Reserva con antelación los monumentos más demandados',
        cuerpo: 'La Sagrada Família vende 4,5 millones de entradas al año: sin reserva previa, en temporada alta, puede no haber entradas en el día. La Alhambra de Granada tiene acceso limitado a 8.400 personas diarias. El Palacio Real de Madrid es gratuito para ciudadanos de la UE los lunes. Comprar online con 2-3 semanas de antelación para los grandes monumentos.',
      },
      {
        titulo: 'Conecta la arquitectura con el contexto político que la generó',
        cuerpo: 'El Escorial es la Contrarreforma en piedra. El Palacio Real borbónico es la imitación del poder francés. El Valle de los Caídos es la propaganda franquista. El Guggenheim es la estrategia de regeneración del nacionalismo vasco. Los edificios son manifestos políticos construidos en tres dimensiones. Entender quién los encargó y para qué multiplica su significado.',
      },
      {
        titulo: 'Combina patrimonio histórico y arquitectura contemporánea',
        cuerpo: 'Las ciudades españolas ofrecen contrastes fascinantes: la Catedral Vieja y Nueva de Salamanca, el Casco Antiguo de Bilbao y el Guggenheim, el Prado de Villanueva y su ampliación de Moneo (2007). Madrid Río (2011, Burgos y Garrido) es uno de los mejores ejemplos de espacio público recuperado en Europa. La arquitectura española del presente dialoga siempre con su historia.',
      },
    ],

    tips: [
      {
        icono: '🗺️',
        texto: 'La arquitectura española es profundamente regional: Cataluña tiene el Modernisme, Andalucía el Mudéjar, Castilla el Plateresco y el Herrerismo, el País Vasco el Guggenheim. Esta diversidad regional es una fortaleza única: no existe otro país europeo con tanta variedad de estilos arquitectónicos en un territorio tan compacto.',
      },
      {
        icono: '⚡',
        texto: 'El Mudéjar es posiblemente la mayor aportación original de España a la historia de la arquitectura mundial. No existe en ningún otro lugar porque requirió una combinación irrepetible: siglos de convivencia entre tres culturas bajo cambio de poder político. Cuando hoy ves una celosía geométrica en cualquier edificio del mundo, estás viendo la influencia —directa o indirecta— del arte islámico que los mudéjares integraron en la arquitectura cristiana.',
      },
      {
        icono: '🔬',
        texto: 'Gaudí anticipó en 100 años técnicas que solo se implementaron con ordenadores: la optimización estructural por forma, la integración de la geometría natural en la arquitectura, el uso del trencadís como revestimiento flexible. Los ingenieros del MIT estudiaron sus cálculos estructurales y los encontraron más precisos que los de muchos edificios modernos.',
      },
      {
        icono: '📅',
        texto: 'Los estilos arquitectónicos siempre se solapan: cuando Gaudí construía la Casa Batlló en Barcelona (1904), en Madrid se seguían haciendo edificios eclécticos decimonónicos. La historia que recordamos son los picos de genialidad; la mayoría del tejido urbano construido en cada época es mucho más convencional y humilde.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir Plateresco con Barroco',
        cuerpo: 'Ambos estilos son ornamentados, pero son distintos en estructura y cronología. El Plateresco (s.XV-XVI) decora superficies góticas con motivos renacentistas muy finos, como trabajo de orfebre. El Barroco (s.XVII) añade movimiento dramático, columnas salomónicas y retablos monumentales que buscan impacto emocional. El Plateresco es delicado; el Barroco, teatral.',
      },
      {
        titulo: 'Creer que Gaudí trabajaba solo',
        cuerpo: 'El Modernisme catalán fue un movimiento colectivo: Lluís Domènech i Montaner (Palau de la Música), Josep Puig i Cadafalch y muchos otros arquitectos contribuyeron decisivamente. Gaudí fue el más genial e innovador, pero el Modernisme de Barcelona fue posible gracias a una burguesía industrial catalana que financió decenas de proyectos simultáneamente.',
      },
      {
        titulo: 'Pensar que el franquismo solo produjo arquitectura mediocre',
        cuerpo: 'El Estilo Nacional franquista tardío fue banal, pero en paralelo los arquitectos del Grupo R en Cataluña y los "Poblados Dirigidos" de Madrid (Oíza, Corrales, Molezún) produjeron arquitectura racional de calidad internacional. Los regímenes autoritarios a menudo generan tanto arquitectura propagandística de lujo como vivienda social innovadora, con técnicos que trabajan en los márgenes del sistema.',
      },
      {
        titulo: 'Reducir el "Efecto Guggenheim" a un edificio espectacular',
        cuerpo: 'El éxito del Guggenheim Bilbao fue el resultado de una estrategia urbana integral: regeneración del waterfront, nuevo metro (Norman Foster), aeropuerto ampliado (Santiago Calatrava), hoteles, museos complementarios y programación cultural sostenida durante años. El edificio de Gehry fue el catalizador, no la causa única. Muchas ciudades que copiaron solo el edificio espectacular fracasaron.',
      },
    ],
  },
};
