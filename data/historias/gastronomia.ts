import type { HistoriaData } from './types';

export const gastronomia: HistoriaData = {
  slug: 'gastronomia',
  titulo: 'Historia de la Gastronomía: Del Fuego Neolítico a la IA Culinaria',
  subtitulo: 'Del dominio del fuego en el neolítico a las proteínas del laboratorio — 10 períodos gastronómicos con técnicas, figuras clave y contexto histórico',
  descripcionSEO: 'Cronología interactiva de la historia de la gastronomía: del fuego neolítico (10000 a.C.) a la inteligencia artificial culinaria. Cocina antigua, medieval, intercambio colombino, alta cocina francesa, cocina molecular, gastronomía sostenible y futuro alimentario en 10 hitos y 6 eras.',
  keywords: [
    'historia de la gastronomía cronología',
    'gastronomía neolítica primitiva fuego cocción',
    'cocina griega romana apicio garum',
    'intercambio colombino tomate patata chocolate',
    'alta cocina francesa carême escoffier michelin',
    'cocina industrial pasteurización enlatado fast food',
    'nouvelle cuisine bocuse cocina molecular ferran adrià',
    'gastronomía sostenible slow food noma kilómetro cero',
  ],
  anioInicio: -10000,
  anioFin: 9999,

  hitos: [
    {
      id: 'fuego-primeras-civilizaciones',
      nombre: 'Cocina del Fuego y Primeras Civilizaciones',
      anioInicio: -10000,
      anioFin: -500,
      color: '#8D6E63',
      categoria: 'primitiva',
      descripcion: 'El dominio del fuego transforma la dieta humana. La revolución neolítica introduce cereales, legumbres y ganadería: nace el pan, la cerveza y el queso. Egipto produce vino en masa; Mesopotamia cuenta con los primeros recetarios escritos (tablillas de Yale, c. 1700 a.C.). Los banquetes son rituales de poder en todas las culturas del Mediterráneo antiguo.',
      obraIconica: 'Tablillas cuneiformes de Yale (c. 1700 a.C.) — el recetario escrito más antiguo del mundo, con 25 recetas babilónicas de guisos y estofados',
      paises: ['Mesopotamia', 'Egipto', 'Creciente Fértil'],
    },
    {
      id: 'cocina-griega-romana',
      nombre: 'Cocina Griega y Romana',
      anioInicio: -500,
      anioFin: 400,
      color: '#FF8F00',
      categoria: 'antigua',
      descripcion: 'Grecia eleva la cocina a arte filosófico. Roma crea el primer recetario occidental (Apicio), el garum de pescado fermentado y los banquetes como espectáculo político. Las especias orientales llegan vía rutas comerciales. El simposio griego convierte la comida en debate intelectual.',
      obraIconica: 'De re coquinaria — Apicio (s. I d.C.) — primer recetario latino con 500 recetas, codifica la alta cocina romana y el uso del garum',
      paises: ['Roma', 'Grecia', 'Mediterráneo'],
    },
    {
      id: 'gastronomia-medieval-islamica',
      nombre: 'Gastronomía Medieval e Islámica',
      anioInicio: 400,
      anioFin: 1492,
      color: '#FFCA28',
      categoria: 'medieval',
      descripcion: 'Al-Ándalus transmite a Europa el azúcar, el arroz, los cítricos y técnicas de destilación. Los monasterios conservan recetas y producen vinos. Las especias orientales valen su peso en oro. Ibn Razin al-Tujibi escribe el primer recetario andalusí del siglo XIII.',
      obraIconica: 'Manuscrito anónimo andalusí (s. XIII) y tratados islámicos de cocina — transmiten el azúcar, los cítricos y las especias que transformarán la cocina europea',
      paises: ['Al-Ándalus', 'Imperio Islámico', 'Europa Medieval'],
    },
    {
      id: 'encuentro-con-america',
      nombre: 'El Encuentro con América',
      anioInicio: 1492,
      anioFin: 1600,
      color: '#FFA726',
      categoria: 'descubrimiento',
      descripcion: 'El descubrimiento de América introduce en Europa la patata, el tomate, el maíz, el chocolate, el pimiento y el pavo. Europa aporta el trigo, la vid y el ganado a América. Sin estos ingredientes no existirían la pizza italiana, el gazpacho español ni las patatas fritas belgas. La dieta global cambia para siempre.',
      obraIconica: 'Intercambio Colombino (1492–1600) — la mayor revolución alimentaria de la historia: el tomate llega al Mediterráneo, la patata al norte de Europa, el chocolate a las cortes reales',
      paises: ['España', 'América', 'Europa'],
    },
    {
      id: 'alta-cocina-francesa',
      nombre: 'Alta Cocina Francesa y la Corte',
      anioInicio: 1600,
      anioFin: 1890,
      color: '#66BB6A',
      categoria: 'alta',
      descripcion: 'La cocina de Versalles establece el lujo como norma. Carême codifica las salsas madre y la haute cuisine. Brillat-Savarin publica la gastronomía como disciplina intelectual (1825). Escoffier moderniza la cocina francesa, organiza la brigada de cocina y nace la guía Michelin (1900 en el siglo siguiente).',
      obraIconica: 'L\'Art de la cuisine française — Marie-Antoine Carême (1833–35) — codificación definitiva de la haute cuisine: salsas madre, terminología y la cocina como arte mayor',
      paises: ['Francia', 'Europa'],
    },
    {
      id: 'revolucion-industrial-belle-epoque',
      nombre: 'Revolución Industrial y Belle Époque',
      anioInicio: 1890,
      anioFin: 1930,
      color: '#AB47BC',
      categoria: 'industrial',
      descripcion: 'Appert inventa el enlatado; Pasteur descubre la pasteurización estudiando el vino. El ferrocarril distribuye alimentos frescos. Escoffier organiza la brigada de cocina moderna. Nace la guía Michelin (1900). El restaurante sustituye al banquete privado y los grandes hoteles establecen la cocina de referencia.',
      obraIconica: 'Guía Michelin (1900) y Le Guide Culinaire de Escoffier (1903) — nacen los dos pilares de la restauración moderna: la evaluación independiente y la codificación profesional',
      paises: ['Francia', 'Europa', 'EE.UU.'],
    },
    {
      id: 'siglo-xx-fast-food',
      nombre: 'Cocina del Siglo XX y el Fast Food',
      anioInicio: 1930,
      anioFin: 1970,
      color: '#29B6F6',
      categoria: 'industrial',
      descripcion: 'McDonald\'s inventa el sistema de cocina industrial (1948). Los congelados de Clarence Birdseye llegan a todos los hogares. Julia Child populariza la cocina francesa en TV. El microondas entra en los hogares. La alimentación se industrializa masivamente y la comida rápida se convierte en fenómeno global.',
      obraIconica: 'Sistema Speedee de McDonald\'s (1948) — el hermano Ray Kroc y la estandarización industrial de la cocina: mismo sabor en cualquier punto del planeta, nace el fast food moderno',
      paises: ['EE.UU.', 'Mundo'],
    },
    {
      id: 'vanguardia-cocina-molecular',
      nombre: 'Vanguardia y Cocina Molecular',
      anioInicio: 1970,
      anioFin: 2010,
      color: '#EF5350',
      categoria: 'vanguardia',
      descripcion: 'Paul Bocuse proclama la nouvelle cuisine: salsas ligeras, productos frescos y presentaciones artísticas. Ferran Adrià en El Bulli revoluciona la gastronomía mundial con la esferificación, las espumas y la deconstrucción. Heston Blumenthal aplica la ciencia al sabor. El chef se convierte en artista conceptual.',
      obraIconica: 'El Bulli de Ferran Adrià (1994–2011) — cinco veces mejor restaurante del mundo; la esferificación, la deconstrucción y más de 50 técnicas nuevas transforman la cocina en laboratorio de ideas',
      paises: ['Francia', 'España', 'Reino Unido'],
    },
    {
      id: 'gastronomia-sostenible-digital',
      nombre: 'Gastronomía Sostenible y Digital',
      anioInicio: 2010,
      anioFin: 2022,
      color: '#7CB342',
      categoria: 'sostenible',
      descripcion: 'Carlo Petrini funda Slow Food. René Redzepi en Noma reinventa la cocina nórdica con ingredientes locales. El kilómetro 0 y la agricultura ecológica se consolidan. Instagram convierte la comida en contenido visual. Los food bloggers influyen más que los críticos gastronómicos. El delivery y las dark kitchens transforman la restauración.',
      obraIconica: 'Noma de René Redzepi (2010–actualidad) — cuatro veces mejor restaurante del mundo; la cocina nórdica de kilómetro cero redefine qué significa la alta gastronomía en el siglo XXI',
      paises: ['Dinamarca', 'Italia', 'Mundial'],
    },
    {
      id: 'gastronomia-del-futuro',
      nombre: 'Gastronomía del Futuro',
      anioInicio: 2022,
      anioFin: 9999,
      color: '#78909C',
      categoria: 'vanguardia',
      descripcion: 'La carne cultivada en laboratorio y las proteínas de insectos buscan sustituir la ganadería. La impresión 3D de alimentos permite formas imposibles. La IA diseña recetas y optimiza cadenas alimentarias. Singapur aprueba la primera venta comercial de carne cultivada (2020). El debate es alimentario, ético y medioambiental a la vez.',
      obraIconica: 'Primera hamburguesa de carne cultivada degustada públicamente (Londres, 2013) — coste de 250.000 € bajó a menos de 10 € en diez años; Singapore aprueba su venta en 2020',
      paises: ['EE.UU.', 'Singapur', 'Global'],
    },
  ],

  eras: [
    {
      nombre: 'Cocina Primitiva y Antigua',
      desde: -10000,
      hasta: 400,
      icono: '🔥',
      hitosDestacados: [
        'Cocina del Fuego y Primeras Civilizaciones',
        'Cocina Griega y Romana',
      ],
      eventos: [
        '-10000 — Revolución neolítica: la agricultura transforma la dieta humana para siempre',
        '-3000 — Egipto produce cerveza y vino en masa como alimentos rituales y cotidianos',
        '-1700 — Tablillas cuneiformes de Yale: el recetario escrito más antiguo del mundo (Mesopotamia)',
        '-600 — Grecia eleva el simposio a rito filosófico: el vino, el pan y la conversación',
        '1 — El garum romano se produce industrialmente en cetariae costeras de todo el Mediterráneo',
      ],
    },
    {
      nombre: 'Cocina Medieval e Islámica',
      desde: 400,
      hasta: 1492,
      icono: '🏰',
      hitosDestacados: [
        'Gastronomía Medieval e Islámica',
      ],
      eventos: [
        '711 — Al-Ándalus introduce en Europa el azúcar, el arroz y los cítricos',
        '1000 — Las especias orientales (pimienta, canela, nuez moscada) valen su peso en oro',
        '1180 — Los monasterios cistercienses perfeccionan la viticultura en Borgoña',
        '1260 — Ibn Razin al-Tujibi escribe Fudalat al-Jiwan, primer gran recetario andalusí',
        '1400 — Los banquetes medievales europeos: estatus social visible en número de platos y especias',
      ],
    },
    {
      nombre: 'Descubrimiento y Alta Cocina',
      desde: 1492,
      hasta: 1890,
      icono: '👨‍🍳',
      hitosDestacados: [
        'El Encuentro con América',
        'Alta Cocina Francesa y la Corte',
      ],
      eventos: [
        '1492 — Colón llega a América: comienza el intercambio colombino que cambia la dieta global',
        '1651 — François Menon publica Le Cuisinier François: nace la cocina francesa moderna',
        '1825 — Brillat-Savarin publica Fisiología del gusto: la gastronomía como disciplina intelectual',
        '1833 — Carême codifica las salsas madre en L\'Art de la cuisine française',
        '1810 — Nicolas Appert inventa el enlatado de alimentos para los ejércitos de Napoleón',
      ],
    },
    {
      nombre: 'Industrialización Gastronómica',
      desde: 1890,
      hasta: 1970,
      icono: '🏭',
      hitosDestacados: [
        'Revolución Industrial y Belle Époque',
        'Cocina del Siglo XX y el Fast Food',
      ],
      eventos: [
        '1900 — Primer anuario Michelin: nace la guía gastronómica de referencia mundial',
        '1903 — Le Guide Culinaire de Escoffier: la brigada de cocina moderna queda codificada',
        '1930 — Los congelados de Clarence Birdseye llegan a los supermercados americanos',
        '1948 — McDonald\'s abre su segundo local con el sistema Speedee: nace el fast food moderno',
        '1965 — Julia Child lleva la cocina francesa a los hogares americanos con The French Chef',
      ],
    },
    {
      nombre: 'Vanguardia y Nueva Cocina',
      desde: 1970,
      hasta: 2010,
      icono: '⚗️',
      hitosDestacados: [
        'Vanguardia y Cocina Molecular',
      ],
      eventos: [
        '1973 — Gault-Millau proclaman la nouvelle cuisine: ligereza, frescura y presentación artística',
        '1989 — Paul Bocuse y los grandes chefs fundan los Bocuse d\'Or, los Oscar de la cocina',
        '1994 — Ferran Adrià sirve la primera esferificación en El Bulli: revolución molecular',
        '2002 — Heston Blumenthal publica su cocina científica; la gastronomía molecular se globaliza',
        '2007 — El Bulli recibe 2 millones de solicitudes de reserva para 8.000 plazas disponibles',
      ],
    },
    {
      nombre: 'Gastronomía Sostenible y del Futuro',
      desde: 2010,
      hasta: 9999,
      icono: '🌱',
      hitosDestacados: [
        'Gastronomía Sostenible y Digital',
        'Gastronomía del Futuro',
      ],
      eventos: [
        '2010 — Noma de René Redzepi es elegido mejor restaurante del mundo por primera vez',
        '2013 — Primera hamburguesa de carne cultivada degustada públicamente en Londres',
        '2016 — Instagram supera los 500 millones de usuarios; la fotografía de comida se democratiza',
        '2020 — Singapur aprueba la primera venta comercial de carne cultivada en laboratorio',
        '2024 — Sora de OpenAI y la IA generativa comienzan a diseñar recetas y menús personalizados',
      ],
    },
  ],

  categorias: {
    primitiva: 'Primitiva',
    antigua: 'Antigua',
    medieval: 'Medieval',
    descubrimiento: 'Descubrimiento',
    alta: 'Alta Cocina',
    industrial: 'Industrial',
    vanguardia: 'Vanguardia',
    sostenible: 'Sostenible',
  },

  colores: {
    primitiva: '#8D6E63',
    antigua: '#FF8F00',
    medieval: '#FFCA28',
    descubrimiento: '#FFA726',
    alta: '#66BB6A',
    industrial: '#AB47BC',
    vanguardia: '#EF5350',
    sostenible: '#7CB342',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'La gastronomía es la historia de la humanidad contada a través de lo que comemos. En doce mil años pasó de la supervivencia alrededor del fuego a la alta cocina como arte conceptual, de la fermentación neolítica a la carne cultivada en laboratorio. Cada período culinario refleja su época: la cocina romana hablaba de poder imperial, la nouvelle cuisine de libertad posmoderna, el kilómetro cero de angustia ecológica.',

    tablaComparativa: [
      { hito: 'Cocina del Fuego y Primeras Civilizaciones', periodo: '10000–500 a.C.', categoria: 'Primitiva', personaje: 'Comunidades neolíticas anónimas', aportacion: 'Pan, cerveza, queso y primeros recetarios escritos' },
      { hito: 'Cocina Griega y Romana', periodo: '500 a.C.–400 d.C.', categoria: 'Antigua', personaje: 'Apicio', aportacion: 'Primer recetario occidental y el garum como potenciador del sabor' },
      { hito: 'Alta Cocina Francesa y la Corte', periodo: '1600–1890', categoria: 'Alta Cocina', personaje: 'Marie-Antoine Carême', aportacion: 'Codificación de la haute cuisine y las salsas madre' },
      { hito: 'Revolución Industrial y Belle Époque', periodo: '1890–1930', categoria: 'Industrial', personaje: 'Auguste Escoffier', aportacion: 'Brigada de cocina moderna y guía Michelin como referencia' },
      { hito: 'Vanguardia y Cocina Molecular', periodo: '1970–2010', categoria: 'Vanguardia', personaje: 'Ferran Adrià', aportacion: 'El Bulli y la esferificación como revolución culinaria global' },
      { hito: 'Gastronomía Sostenible y Digital', periodo: '2010–2022', categoria: 'Sostenible', personaje: 'René Redzepi', aportacion: 'Noma y el kilómetro cero como nuevo paradigma de alta cocina' },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiante de historia o humanidades',
        perfil: 'Preparando un trabajo sobre cultura material',
        texto: 'La gastronomía como fuente histórica: qué comía cada sociedad revela su economía, rutas comerciales, jerarquías sociales y relaciones con el territorio. Del garum romano a las especias medievales, cada alimento es un documento histórico que complementa los textos escritos.',
      },
      {
        icono: '👨‍🍳',
        titulo: 'Profesional de la restauración',
        perfil: 'Cocinero, sumiller o gestor de restaurante',
        texto: 'Entender las raíces históricas de las técnicas que usas cada día: por qué las salsas madre francesas son el fundamento de la cocina occidental, qué debe Escoffier a Carême o cómo la nouvelle cuisine cambió para siempre la relación entre chef y comensal.',
      },
      {
        icono: '🌍',
        titulo: 'Curioso de la gastronomía y los viajes',
        perfil: 'Viajero que conecta destinos con su cocina',
        texto: 'Cada destino gastronómico tiene una historia que lo explica: por qué la cocina japonesa valora tanto la pureza del producto, qué tiene que ver Al-Ándalus con la cocina española actual, o cómo el intercambio colombino hizo posible la pizza napolitana.',
      },
      {
        icono: '🔬',
        titulo: 'Interesado en gastronomía y ciencia',
        perfil: 'Atento a las tendencias alimentarias del futuro',
        texto: 'La cocina molecular, la carne cultivada y la IA culinaria son la última entrega de una historia que siempre unió ciencia y cocina: Pasteur descubrió la pasteurización estudiando el vino; Adrià aplicó química de polímeros a la esferificación. El futuro alimentario tiene profundas raíces históricas.',
      },
    ],

    faq: [
      {
        pregunta: '¿Cuál es el recetario más antiguo del mundo?',
        respuesta: 'Las tablillas cuneiformes de Yale (aproximadamente 1700 a.C.) son los recetarios escritos más antiguos conocidos. Pertenecen a la civilización babilónica y describen 25 recetas de guisos y estofados con instrucciones detalladas. Son anteriores en más de 1.500 años al recetario romano de Apicio. Han sido traducidas recientemente revelando platos de alta complejidad culinaria con técnicas que anticipan la cocina medieval.',
        tip: 'Los recetarios se conservaron en tablillas de arcilla por casualidad: el material más duradero de Mesopotamia sobrevivió mientras los papiros egipcios con contenido gastronómico se perdieron casi todos.',
      },
      {
        pregunta: '¿Qué alimentos llegaron de América a Europa tras 1492?',
        respuesta: 'El intercambio colombino fue la mayor revolución alimentaria de la historia. De América llegaron: patata (transformó la nutrición del norte de Europa), tomate (hoy símbolo de la cocina mediterránea), maíz, chocolate, pimiento, pavo, vainilla, cacahuete, calabaza y judías. Sin estos ingredientes no existiría la pizza italiana, el gazpacho español, las patatas bravas ni el mole mexicano tal como los conocemos.',
        tip: 'De Europa llegaron a América: trigo, cebada, arroz, caña de azúcar, olivo, vid, vaca, cerdo, pollo y caballo. El intercambio fue bidireccional y transformó la alimentación en ambos lados del Atlántico.',
      },
      {
        pregunta: '¿Qué es la gastronomía molecular y quién la inventó?',
        respuesta: 'La gastronomía molecular es la aplicación de principios científicos a la cocina. El físico Nicholas Kurti y el químico Hervé This acuñaron el término en 1988. Ferran Adrià la llevó al restaurante con técnicas como la esferificación (crear esferas con líquidos encapsulados usando alginato de sodio y cloruro de calcio), las espumas con lecitina de soja y la gelificación con agar-agar. El Bulli fue elegido mejor restaurante del mundo cinco veces entre 2002 y 2009.',
        tip: 'La esferificación de Adrià usa los mismos principios químicos que la industria farmacéutica para encapsular medicamentos. La cocina y la ciencia llevan siglos compartiendo técnicas sin saberlo.',
      },
      {
        pregunta: '¿Por qué es tan importante Al-Ándalus para la cocina europea?',
        respuesta: 'Entre los siglos VIII y XV, Al-Ándalus fue el principal canal de transmisión de conocimiento gastronómico entre el mundo islámico y Europa. Introdujo el azúcar de caña (antes de América, el dulzor venía de la miel), el arroz, los cítricos, la berenjena, la espinaca, el azafrán y técnicas de destilación. Sin Al-Ándalus, no existiría el arroz con leche español, el paella valenciana en su forma actual ni muchos dulces de la repostería conventional europea.',
        tip: 'El vocabulario gastronómico español tiene muchas palabras de origen árabe: arroz (ar-ruzz), azúcar (as-sukkar), aceite (az-zayt), azafrán (az-za\'faran), albóndiga (al-bunduqa).',
      },
      {
        pregunta: '¿Es la carne cultivada en laboratorio viable a gran escala?',
        respuesta: 'La primera hamburguesa de carne cultivada costó 250.000 € en 2013. En 2023, el coste había bajado a menos de 10 € por hamburguesa. Singapur fue el primer país en aprobar su venta comercial (2020). Los desafíos siguen siendo el coste de producción a escala, la textura de cortes complejos y la aceptación del consumidor. La carne cultivada reduce hasta un 92% las emisiones de CO₂ respecto a la ganadería convencional de vacuno.',
        tip: 'La carne cultivada no es ciencia ficción: las células musculares bovinas se multiplican en biorreactores sin sacrificar animales. Es la misma carne, producida de forma diferente.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por el ingrediente, no por la técnica',
        cuerpo: 'Cada alimento tiene su propia historia migratoria. Traza el recorrido del tomate desde los Andes peruanos hasta la pizza napolitana, o del chocolate desde los mayas hasta los bombones belgas, o de la pasta desde China hasta Italia. Los ingredientes son el hilo conductor más accesible de la historia gastronómica.',
      },
      {
        titulo: 'Conecta la gastronomía con la historia política y económica',
        cuerpo: 'Los grandes banquetes son actos de poder. Luis XIV usó la mesa de Versalles como teatro político; Napoleón financió el desarrollo del enlatado para alimentar a sus ejércitos; las rutas de las especias medievales determinaron qué potencias marítimas dominarían el mundo. La cocina nunca es solo comida.',
      },
      {
        titulo: 'Aprende a leer un menú histórico como documento',
        cuerpo: 'Un menú del siglo XIX revela qué productos de temporada había disponibles, qué rutas comerciales de especias estaban activas, la jerarquía social (quién come qué), y las técnicas culinarias dominantes. Cada plato es un documento histórico que la arqueología y la historia de la alimentación saben leer.',
      },
      {
        titulo: 'Identifica las revoluciones tecnológicas en la alimentación',
        cuerpo: 'El fuego, la fermentación, el enlatado, la pasteurización, la refrigeración, los congelados, el microondas y ahora la carne cultivada: cada tecnología transformó qué comemos, cuándo lo comemos y quién lo prepara. La historia de la gastronomía es inseparable de la historia de la tecnología alimentaria.',
      },
      {
        titulo: 'Sigue los debates contemporáneos con raíces históricas',
        cuerpo: 'La gastronomía del futuro se está escribiendo ahora: sostenibilidad, proteínas alternativas, microbioma intestinal, gastronomía de precisión con IA. Estos debates conectan directamente con las grandes transformaciones históricas: la fermentación artesanal "de moda" es la técnica más antigua de la humanidad.',
      },
    ],

    tips: [
      {
        icono: '🌍',
        texto: 'La globalización gastronómica comenzó con las rutas de las especias: la pimienta, la canela y la nuez moscada fueron tan valiosas en la Edad Media como el petróleo hoy. Las guerras por el control del comercio de especias determinaron el mapa colonial del mundo moderno.',
      },
      {
        icono: '🔬',
        texto: 'La ciencia y la cocina siempre han estado unidas: Pasteur descubrió la pasteurización estudiando el vino y la cerveza, no los microbios en abstracto. Adrià usó química de polímeros para la esferificación. La comprensión científica de los alimentos nació del interés gastronómico, no al revés.',
      },
      {
        icono: '📺',
        texto: 'La televisión democratizó la alta cocina: Julia Child acercó la cocina francesa a los hogares americanos en los años 60, igual que hoy los chefs de YouTube hacen accesibles técnicas profesionales a cualquiera. Cada medio de comunicación ha tenido su propia revolución gastronómica.',
      },
      {
        icono: '♻️',
        texto: 'Las tendencias gastronómicas son cíclicas: la fermentación artesanal que hoy se presenta como novedad es la técnica más antigua de la humanidad. La cocina de kilómetro 0 recupera lo que era la norma antes de la industrialización. Lo "moderno" en gastronomía frecuentemente es lo más antiguo redescubierto.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que la cocina francesa siempre fue la referencia gastronómica occidental',
        cuerpo: 'La hegemonía culinaria francesa es relativamente reciente (siglos XVII-XX). Antes, la cocina árabe (Al-Ándalus), la italiana (Catalina de Médici llevó cocineros italianos a la corte francesa) y la española (con los productos americanos) fueron referencias igual de influyentes. La "supremacía francesa" es un proyecto cultural deliberado, no una verdad natural.',
      },
      {
        titulo: 'Pensar que fast food y gastronomía de calidad son incompatibles',
        cuerpo: 'Los mejores chefs del mundo se han inspirado en la comida popular y de calle: Ferran Adrià admiraba las tapas de bares andaluces; Redzepi reinventó el smorrebrod danés; David Chang hizo alta cocina del ramen. La división entre alta y baja cocina es ideológica, no gastronómica.',
      },
      {
        titulo: 'Confundir autenticidad gastronómica con antigüedad del plato',
        cuerpo: 'Muchos "platos tradicionales" son relativamente modernos: el gazpacho con tomate data del siglo XIX (el tomate llegó en 1492 pero tardó siglos en aceptarse); la paella valenciana se popularizó en el siglo XX; el sushi moderno nació en Tokyo en los años 20. La "tradición" culinaria es siempre más reciente de lo que parece.',
      },
      {
        titulo: 'Subestimar la importancia de las técnicas de conservación en la historia',
        cuerpo: 'El enlatado, la pasteurización, la refrigeración y los congelados no fueron solo avances técnicos: transformaron la demografía, el comercio global, la urbanización y las guerras. Napoleón financió el enlatado porque sus ejércitos morían de hambre más que de balas. La conservación de alimentos es una historia de poder.',
      },
    ],
  },
};
