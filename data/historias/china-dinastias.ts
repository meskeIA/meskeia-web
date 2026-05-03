import type { HistoriaData } from './types';

export const chinaDinastias: HistoriaData = {
  slug: 'china-dinastias',
  titulo: 'Las Grandes Dinastías Chinas: De Qin a la República',
  subtitulo: 'Más de 2.000 años de civilización ininterrumpida: escritura, seda, pólvora, papel y el mayor Imperio de la historia',
  descripcionSEO: 'Cronología interactiva de las grandes dinastías chinas desde la primera unificación de Qin Shi Huang en 221 a.C. hasta la caída de los Qing en 1912. Descubre cómo China inventó el papel, la imprenta, la pólvora y la brújula, y cómo el mayor Imperio de Asia cayó ante el poder occidental.',
  keywords: [
    'dinastías chinas',
    'historia de China',
    'Qin Shi Huang',
    'Gran Muralla China',
    'Ruta de la Seda',
    'Han Tang Song Ming Qing',
    'Imperio chino',
    'Kublai Kan',
    'Zheng He',
    'guerras del Opio',
    'cronología China',
    'visualizador histórico',
  ],
  anioInicio: -221,
  anioFin: 1912,

  hitos: [
    {
      id: 'dinastia-qin',
      nombre: 'Qin: La Primera Unificación',
      anioInicio: -221,
      anioFin: -206,
      color: '#8B4513',
      categoria: 'unificacion',
      descripcion:
        'Qin Shi Huang se convierte en el primer emperador de China tras conquistar los seis reinos rivales. Unifica escritura, moneda, pesos y medidas en todo el territorio. Ordena construir la primera versión de la Gran Muralla para frenar a los xiongnu del norte y erige el impresionante ejército de terracota para custodiar su tumba. Su régimen es centralizado y brutal: quema libros y entierra vivos a académicos confucianistas. Muere en 210 a.C. y la dinastía colapsa apenas cuatro años después, pero el modelo imperial que creó dura dos milenios.',
      obraIconica: 'Ejército de terracota de Xi\'an (c. 210 a.C.)',
      paises: ['China'],
    },
    {
      id: 'dinastia-han',
      nombre: 'Han: El Imperio Clásico',
      anioInicio: -206,
      anioFin: 220,
      color: '#DAA520',
      categoria: 'clasico',
      descripcion:
        'Liu Bang, antiguo campesino convertido en caudillo, funda la dinastía Han después de derrotar a sus rivales. Los Han adoptan el confucianismo como ideología de Estado e instituyen el examen imperial para seleccionar funcionarios por méritos. Se abre la Ruta de la Seda hacia Asia Central, Persia y el Mediterráneo. Se inventa el papel (Cai Lun, 105 d.C.) y se registran los primeros mapas del mundo conocido. La expansión lleva las fronteras chinas a Corea, Vietnam y Asia Central. Los Han definen lo que significa ser chino: la etnia mayoritaria aún se llama "pueblo Han".',
      obraIconica: 'Mortaja de jade de la princesa Dou Wan (113 a.C.)',
      paises: ['China'],
    },
    {
      id: 'tres-reinos-jin',
      nombre: 'Los Tres Reinos y la Reunificación Jin',
      anioInicio: 220,
      anioFin: 589,
      color: '#708090',
      categoria: 'fragmentacion',
      descripcion:
        'Al colapsar la dinastía Han, China se divide en tres reinos rivales: Wei (norte), Shu (suroeste) y Wu (sureste). Las guerras entre estos estados inspiran el "Romance de los Tres Reinos", la novela histórica más leída de Asia. La dinastía Jin logra una reunificación breve, pero las invasiones de pueblos del norte (xiongnu, xianbei, jie) provocan el éxodo de millones de chinos hacia el sur. Surgen hasta 16 reinos en el norte mientras el sur conserva la cultura china. El budismo se expande con fuerza en este período de incertidumbre.',
      obraIconica: '"Romance de los Tres Reinos" (novela histórica, c. 1330)',
      paises: ['China'],
    },
    {
      id: 'sui-tang',
      nombre: 'Sui y Tang: El Segundo Esplendor',
      anioInicio: 589,
      anioFin: 907,
      color: '#DAA520',
      categoria: 'clasico',
      descripcion:
        'La dinastía Sui reúne China tras siglos de división y construye el Gran Canal, uniendo el río Amarillo con el Yangtsé (1.800 km). La Tang lleva a China a su cúspide cultural: Changan (hoy Xi\'an) es la ciudad más grande del mundo, con mercaderes árabes, persas, japoneses y sogdianos conviviendo en sus calles. Los poetas Li Bai y Du Fu elevan la literatura china a su cumbre. Se perfecciona la impresión xilográfica y el examen imperial se consolida. El budismo Zen florece. El comercio con el mundo islámico y la India transforma la cultura china. Un período dorado que marca el ideal de grandeza imperial.',
      obraIconica: 'Poemas completos de Li Bai y Du Fu (s. VIII)',
      paises: ['China', 'Japón', 'Corea', 'Vietnam'],
    },
    {
      id: 'dinastia-song',
      nombre: 'Song: Tecnología y Comercio',
      anioInicio: 960,
      anioFin: 1279,
      color: '#1E90FF',
      categoria: 'innovacion',
      descripcion:
        'La Song es la dinastía más innovadora de la historia medieval. Bi Sheng inventa la imprenta con tipos móviles hacia 1040, cuatro siglos antes de Gutenberg. Se generaliza el papel moneda (el primer billete del mundo), la brújula magnética y la pólvora en artillería. La porcelana china —que da nombre a la "china"— alcanza su máxima perfección. El comercio marítimo conecta China con el Sureste Asiático, la India y el Golfo Pérsico. La economía Song supera a la de toda Europa junta. Sin embargo, sus ejércitos son débiles: el norte es conquistado por los jurchenes y finalmente los mongoles destruyen todo el Imperio.',
      obraIconica: '"A lo largo del río durante la fiesta de Qingming" (Zhang Zeduan, c. 1120)',
      paises: ['China'],
    },
    {
      id: 'dinastia-yuan',
      nombre: 'Yuan: Los Mongoles Gobiernan China',
      anioInicio: 1271,
      anioFin: 1368,
      color: '#708090',
      categoria: 'fragmentacion',
      descripcion:
        'Kublai Kan, nieto de Gengis Kan, completa la conquista de China y funda la dinastía Yuan con capital en Khanbalik (Pekín actual). China queda integrada en el mayor Imperio terrestre de la historia. Marco Polo visita la corte de Kublai hacia 1275 y describe un mundo de riqueza inimaginable para los europeos. Los mongoles intentan sin éxito conquistar Japón (1274 y 1281) —los tifones "viento divino" o kamikaze destruyen sus flotas— y también fracasan en Vietnam e Indonesia. La dinastía Yuan conecta el comercio euroasiático, pero la población china sufre bajo la administración extranjera. La rebelión popular expulsa a los mongoles en 1368.',
      obraIconica: 'Relato de los Viajes de Marco Polo (c. 1300)',
      paises: ['China', 'Mongolia'],
    },
    {
      id: 'dinastia-ming',
      nombre: 'Ming: La Gran Muralla y las Exploraciones',
      anioInicio: 1368,
      anioFin: 1644,
      color: '#228B22',
      categoria: 'expansion',
      descripcion:
        'Zhu Yuanzhang, monje budista y líder rebelde, funda los Ming y expulsa a los mongoles. Se construye la Gran Muralla en su forma actual (ladrillo y piedra, 6.700 km). El almirante Zheng He lidera siete expediciones marítimas gigantescas (1405–1433) llegando hasta Arabia, Somalia y Mozambique con flotas de hasta 300 barcos y 28.000 hombres —décadas antes de las carabelas portuguesas—. Pekín se convierte en capital y se edifica la Ciudad Prohibida. Sin embargo, el aislacionismo gana terreno: las grandes expediciones se cancelan, el comercio exterior se restringe. Los jesuitas (Matteo Ricci) llegan a finales del s. XVI y se produce el primer contacto intelectual con Europa.',
      obraIconica: 'Ciudad Prohibida de Pekín (1406–1420)',
      paises: ['China', 'Vietnam', 'Myanmar'],
    },
    {
      id: 'dinastia-qing-apogeo',
      nombre: 'Qing: El Imperio Manchú',
      anioInicio: 1644,
      anioFin: 1796,
      color: '#228B22',
      categoria: 'expansion',
      descripcion:
        'Los manchúes del noreste conquistan China y fundan la última dinastía imperial, los Qing. Obligan a todos los hombres chinos a llevar la coleta como símbolo de sumisión. Bajo los emperadores Kangxi (1661–1722) y Qianlong (1735–1796), el Imperio alcanza su máxima extensión: incorpora Tíbet, Mongolia exterior, Xinjiang y Taiwán. La población china pasa de 150 a más de 350 millones. El comercio con Europa florece: la porcelana, el té y la seda chinos inundan los mercados occidentales. El arte, la literatura y la filosofía brillan. En 1793, el emperador Qianlong rechaza con desdén la embajada comercial británica de Macartney: China no necesita nada de Occidente. Un orgullo que pronto se pagará caro.',
      obraIconica: 'Palacio de Verano de Pekín (s. XVIII)',
      paises: ['China', 'Mongolia', 'Tíbet', 'Xinjiang'],
    },
    {
      id: 'guerras-opio',
      nombre: 'La Crisis Qing: Guerras del Opio y Rebeliones',
      anioInicio: 1839,
      anioFin: 1900,
      color: '#4B0082',
      categoria: 'declive',
      descripcion:
        'Gran Bretaña, para equilibrar su déficit comercial con China, introduce ilegalmente opio procedente de India. Cuando el comisario Lin Zexu confisca y destruye 1.200 toneladas de opio en Cantón (1839), estalla la primera Guerra del Opio. La derrota china es humillante: el Tratado de Nankín (1842) cede Hong Kong a Gran Bretaña y abre cinco puertos. La segunda Guerra del Opio (1856–1860) trae más concesiones forzosas. La Rebelión Taiping (1850–1864), liderada por un predicador que se cree hermano de Jesucristo, causa entre 20 y 30 millones de muertos —la guerra más mortífera del siglo XIX—. Francia, Japón y Rusia arrancan nuevos territorios. China inicia su "siglo de la humillación".',
      obraIconica: 'Tratado de Nankín (1842) — primer tratado desigual con Occidente',
      paises: ['China', 'Reino Unido', 'Francia', 'Japón', 'Rusia'],
    },
    {
      id: 'fin-del-imperio',
      nombre: 'El Fin del Imperio: Caída de los Qing',
      anioInicio: 1900,
      anioFin: 1912,
      color: '#4B0082',
      categoria: 'declive',
      descripcion:
        'La Rebelión de los Bóxers (1900), una revuelta xenófoba apoyada en secreto por la emperatriz viuda Cixi, culmina con la ocupación de Pekín por las Ocho Naciones aliadas (Alemania, Reino Unido, Francia, EEUU, Japón, Rusia, Italia, Austria-Hungría). Las reformas constitucionales de 1905–1908 llegan tarde. Sun Yat-sen organiza la oposición revolucionaria desde el exilio. La Revolución de Xinhai estalla el 10 de octubre de 1911. El 12 de febrero de 1912, el último emperador Puyi, de seis años, abdica formalmente. Acaban 2.133 años de China imperial. Nace la República de China.',
      obraIconica: 'Acta de Abdicación del Emperador Xuantong (12 de febrero de 1912)',
      paises: ['China'],
    },
  ],

  eras: [
    {
      nombre: 'Los Fundamentos: Qin y Han',
      desde: -221,
      hasta: 220,
      icono: '🏯',
      hitosDestacados: [
        'Qin: La Primera Unificación',
        'Han: El Imperio Clásico',
      ],
      eventos: [
        'Qin Shi Huang primer emperador de China (221 a.C.)',
        'Construcción de la primera Gran Muralla contra los xiongnu',
        'Ejército de terracota: 8.000 figuras para custodiar la tumba imperial',
        'Unificación de escritura, moneda y sistema de pesos y medidas',
        'Apertura de la Ruta de la Seda bajo el emperador Wu (121 a.C.)',
        'Confucianismo declarado ideología oficial del Estado Han',
        'Invención del papel por Cai Lun (105 d.C.)',
        'La etnia mayoritaria china toma el nombre de "pueblo Han"',
      ],
    },
    {
      nombre: 'Fragmentación y Renacimiento: de los Tres Reinos al Tang',
      desde: 220,
      hasta: 907,
      icono: '🎋',
      hitosDestacados: [
        'Los Tres Reinos y la Reunificación Jin',
        'Sui y Tang: El Segundo Esplendor',
      ],
      eventos: [
        'División de China en Wei, Shu y Wu (220 d.C.)',
        'Invasiones de pueblos nómadas del norte: xiongnu, xianbei, jie',
        'Gran migración de la población china hacia el sur del Yangtsé',
        'Expansión del budismo como consuelo espiritual en tiempos de guerra',
        'Dinastía Sui construye el Gran Canal (590–610): 1.800 km de vía fluvial',
        'Changan (Tang) se convierte en la mayor ciudad del mundo con 1 millón de habitantes',
        'Florecimiento de la poesía Tang: Li Bai y Du Fu (s. VIII)',
        'Perfeccionamiento de la imprenta xilográfica (bloque de madera)',
      ],
    },
    {
      nombre: 'Innovación Song y Dominio Mongol',
      desde: 907,
      hasta: 1368,
      icono: '📜',
      hitosDestacados: [
        'Song: Tecnología y Comercio',
        'Yuan: Los Mongoles Gobiernan China',
      ],
      eventos: [
        'Imprenta con tipos móviles de Bi Sheng (c. 1040): 400 años antes de Gutenberg',
        'Primer papel moneda del mundo: "jiaozi" (billete Song, s. X)',
        'Brújula magnética aplicada a la navegación (s. XI)',
        'Pólvora en artillería: cañones y cohetes Song contra los mongoles',
        'Porcelana Song: la más refinada de la historia china',
        'Gengis Kan inicia la conquista de Asia (1206) y sus nietos llegan a China',
        'Kublai Kan funda la dinastía Yuan y establece Pekín como capital',
        'Marco Polo en la corte de Kublai Kan (c. 1275–1292)',
        'Fracaso de las invasiones mongolas de Japón (kamikaze, 1274 y 1281)',
      ],
    },
    {
      nombre: 'El Imperio Ming: Grandeza y Repliegue',
      desde: 1368,
      hasta: 1644,
      icono: '🐉',
      hitosDestacados: [
        'Ming: La Gran Muralla y las Exploraciones',
      ],
      eventos: [
        'Fundación Ming: Zhu Yuanzhang expulsa a los mongoles (1368)',
        'Construcción de la Gran Muralla en ladrillo: la versión que vemos hoy',
        'Ciudad Prohibida de Pekín: 9.999 habitaciones, construida 1406–1420',
        'Zheng He: 7 expediciones con flotas de hasta 317 barcos (1405–1433)',
        'Las flotas Ming alcanzan Arabia, Costa de Corea, Mozambique y el Golfo Pérsico',
        'Cancelación oficial de las expediciones: el aislacionismo vence al expansionismo',
        'Llegada del jesuita Matteo Ricci a Pekín (1601): primer diálogo intelectual Europa-China',
        'Introducción de cultivos americanos (maíz, boniato, cacahuete): boom demográfico',
        'Colapso Ming: rebeliones campesinas y entrada de los manchúes (1644)',
      ],
    },
    {
      nombre: 'El Imperio Qing: Apogeo y Crisis',
      desde: 1644,
      hasta: 1839,
      icono: '👑',
      hitosDestacados: [
        'Qing: El Imperio Manchú',
      ],
      eventos: [
        'Manchúes conquistan China: todos los hombres deben llevar coleta',
        'Kangxi (1661–1722): el reinado más largo de la historia china, 61 años',
        'Expansión máxima: Tíbet (1720), Mongolia exterior, Xinjiang (1759), Taiwán',
        'Qianlong (1735–1796): poeta prolífico, 43.000 poemas atribuidos',
        'Pekín duplica su población: llega a un millón de habitantes',
        'Embajada Macartney (1793): el Rey Jorge III pide comercio, Qianlong lo rechaza',
        'El té chino conquista Europa: Gran Bretaña compra el 90% de su té a China',
        'Introducción ilegal del opio británico procedente de India (c. 1800)',
        'Comisario Lin Zexu destruye 1.200 toneladas de opio en Cantón (1839)',
      ],
    },
    {
      nombre: 'El Siglo de la Humillación y el Fin del Imperio',
      desde: 1839,
      hasta: 1912,
      icono: '🌅',
      hitosDestacados: [
        'La Crisis Qing: Guerras del Opio y Rebeliones',
        'El Fin del Imperio: Caída de los Qing',
      ],
      eventos: [
        'Primera Guerra del Opio (1839–1842): derrota humillante de China',
        'Tratado de Nankín (1842): cesión de Hong Kong a Gran Bretaña',
        'Rebelión Taiping (1850–1864): 20–30 millones de muertos',
        'Segunda Guerra del Opio (1856–1860): más puertos forzosos, legaciones en Pekín',
        'Guerra Sino-Japonesa (1894–1895): China pierde Corea y Taiwán ante Japón',
        'Rebelión de los Bóxers (1900) y ocupación de Pekín por 8 naciones',
        'Abolición del examen imperial milenario (1905)',
        'Revolución de Xinhai: proclamación de la República (10 octubre 1911)',
        'Abdicación de Puyi, último emperador Qing (12 febrero 1912)',
        'Fin de 2.133 años de China imperial',
      ],
    },
  ],

  categorias: {
    unificacion: 'Unificación',
    clasico: 'Período Clásico',
    fragmentacion: 'Fragmentación',
    innovacion: 'Innovación y Comercio',
    expansion: 'Expansión Imperial',
    declive: 'Declive y Crisis',
  },

  colores: {
    unificacion: '#8B4513',
    clasico: '#DAA520',
    fragmentacion: '#708090',
    innovacion: '#1E90FF',
    expansion: '#228B22',
    declive: '#4B0082',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'China es la única civilización antigua que ha mantenido una continuidad cultural, lingüística e institucional ininterrumpida desde el siglo III a.C. hasta hoy. A diferencia de Mesopotamia, Egipto o Roma, el Estado chino no desapareció: se renovó dinásticamente durante más de dos mil años. En ese tiempo, China inventó o perfeccionó el papel, la imprenta, la pólvora, la brújula, el papel moneda y la porcelana —todos elementos que transformaron el mundo—. Este visualizador recorre las diez grandes fases de esa historia, desde la primera unificación imperial de Qin Shi Huang en 221 a.C. hasta la caída del último emperador en 1912.',

    tablaComparativa: [
      {
        hito: 'Qin: La Primera Unificación',
        periodo: '221–206 a.C.',
        categoria: 'Unificación',
        personaje: 'Qin Shi Huang',
        aportacion: 'Unificación de escritura, moneda, pesos y medidas; Gran Muralla (primera versión); modelo imperial centralizado',
      },
      {
        hito: 'Han: El Imperio Clásico',
        periodo: '206 a.C.–220 d.C.',
        categoria: 'Período Clásico',
        personaje: 'Liu Bang / Cai Lun',
        aportacion: 'Ruta de la Seda, confucianismo de Estado, invención del papel, examen imperial meritocrático',
      },
      {
        hito: 'Sui y Tang: El Segundo Esplendor',
        periodo: '589–907',
        categoria: 'Período Clásico',
        personaje: 'Emperador Taizong / Li Bai',
        aportacion: 'Gran Canal, Changan como capital mundial del cosmopolitismo, cumbre de la poesía china, imprenta xilográfica',
      },
      {
        hito: 'Song: Tecnología y Comercio',
        periodo: '960–1279',
        categoria: 'Innovación y Comercio',
        personaje: 'Bi Sheng',
        aportacion: 'Tipos móviles, papel moneda, brújula náutica, pólvora artillera, porcelana fina, economía más avanzada del mundo',
      },
      {
        hito: 'Ming: La Gran Muralla y las Exploraciones',
        periodo: '1368–1644',
        categoria: 'Expansión Imperial',
        personaje: 'Zheng He',
        aportacion: 'Gran Muralla actual, Ciudad Prohibida, exploraciones marítimas a África décadas antes de Europa, aislacionismo posterior',
      },
      {
        hito: 'La Crisis Qing: Guerras del Opio y Rebeliones',
        periodo: '1839–1900',
        categoria: 'Declive y Crisis',
        personaje: 'Lin Zexu / Hong Xiuquan',
        aportacion: 'Primer contacto violento con el imperialismo occidental, tratados desiguales, Rebelión Taiping (la guerra más mortífera del s. XIX)',
      },
    ],

    escenarios: [
      {
        icono: '🏯',
        titulo: 'El estudiante de historia',
        perfil: 'Preparando un examen de Historia del Mundo',
        texto: 'Este visualizador te permite ver de un vistazo cómo se organizan 2.133 años de historia china en fases coherentes. La Tab 1 muestra la línea del tiempo completa; la Tab 2 te permite profundizar en cada dinastía con su contexto; la Tab 3 compara inventos, personajes y aportaciones clave; y la Tab 4 agrupa las eras por su lógica histórica. Perfecto para estructurar apuntes o preparar exposiciones.',
      },
      {
        icono: '📚',
        titulo: 'El lector de novela histórica',
        perfil: 'Acaba de leer "Romance de los Tres Reinos" o "El sueño del pabellón rojo"',
        texto: 'Las grandes novelas chinas cobran vida cuando sabes en qué era histórica se sitúan. Este visualizador te ubica cronológicamente cada período: los Tres Reinos (s. III), el esplendor Tang, el comercio Song o la decadencia Qing. Entenderás por qué los personajes piensan, luchan y gobiernan como lo hacen según los valores de su época.',
      },
      {
        icono: '🌏',
        titulo: 'El viajero a China',
        perfil: 'Planifica visitar Xi\'an, Pekín, Hangzhou o Nankín',
        texto: 'Cada monumento chino tiene una historia dinástica detrás: el ejército de terracota es Qin, la Ciudad Prohibida es Ming, el Palacio de Verano es Qing y el Gran Canal es Sui. Con este visualizador comprenderás qué estás viendo y por qué fue construido, enriqueciendo enormemente tu experiencia de viaje.',
      },
      {
        icono: '💼',
        titulo: 'El profesional con interés en Asia',
        perfil: 'Trabaja con China o sigue la geopolítica asiática',
        texto: 'Entender la historia dinástica explica mucho del presente: el orgullo nacional chino, la sensibilidad ante la soberanía territorial (Tíbet, Taiwán, Hong Kong), el concepto de "siglo de la humillación" (1839–1949) y la narrativa del "rejuvenecimiento nacional". La historia importa en la política china contemporánea como en ningún otro país del mundo.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué China es la única civilización antigua que sobrevivió hasta hoy?',
        respuesta: 'A diferencia de Mesopotamia, Egipto o Roma, el Estado chino no fue borrado por ningún conquistador externo de forma definitiva. Incluso cuando fue gobernado por extranjeros (mongoles en los Yuan, manchúes en los Qing), los invasores adoptaron la cultura, la burocracia y la escritura chinas. La continuidad de la lengua escrita —el chino clásico servía de lengua administrativa común aunque las variantes orales fueran distintas— y del sistema de exámenes imperiales permitió mantener una élite letrada con identidad cultural cohesionada durante más de dos milenios.',
        tip: 'La escritura china tiene 3.500 años de historia continua: más que cualquier otra escritura en uso hoy.',
      },
      {
        pregunta: '¿Qué inventó realmente China que cambiara el mundo?',
        respuesta: 'Los cuatro grandes inventos reconocidos son el papel (105 d.C.), la imprenta con tipos móviles (c. 1040), la pólvora (s. IX) y la brújula magnética (s. XI). Pero hay más: el papel moneda (s. X, siglos antes de Europa), la fundición de hierro (s. V a.C.), el arado de hierro, la carretilla, el arnés de caballos que no estrangula, la porcelana, el canal con esclusas, la sismografía y mucho más. En el año 1000, China poseía la economía más productiva del planeta.',
        tip: 'La imprenta de Gutenberg (1450) llegó 400 años después que la de Bi Sheng. La diferencia fue que Europa la aplicó masivamente a libros vernáculos, mientras China la usó principalmente para textos budistas y estatales.',
      },
      {
        pregunta: '¿Por qué China no conquistó el mundo si era tan avanzada?',
        respuesta: 'Esta pregunta, a veces llamada "la paradoja de Needham", tiene varias respuestas parciales. La élite confuciana despreciaba el comercio y la técnica en favor de la literatura y la administración. El Estado chino no necesitaba explorar para sobrevivir: era autosuficiente. Las flotas de Zheng He fueron cancela- das por razones políticas internas, no por falta de capacidad. Y el sistema de exámenes concentraba el talento en la burocracia, no en el comercio o la tecnología. Europa, fragmentada en estados rivales que competían entre sí, tuvo más incentivos para innovar y explorar.',
        tip: 'Los barcos de Zheng He medían hasta 130 metros de eslora —cinco veces las carabelas de Colón—. Los chinos llegaron a África décadas antes de los portugueses.',
      },
      {
        pregunta: '¿Qué fue el "siglo de la humillación" y por qué sigue importando hoy?',
        respuesta: 'El término chino "bainian guochi" (百年国耻) se refiere al período 1839–1949 en que potencias extranjeras humillaron a China mediante guerras, tratados desiguales, concesiones territoriales y ocupaciones. Comenzó con la primera Guerra del Opio y terminó con la fundación de la República Popular en 1949. El Partido Comunista utiliza este trauma histórico para legitimar su autoridad como "restaurador del orgullo nacional". Entender este período es imprescindible para comprender la política exterior china contemporánea sobre Hong Kong, Taiwán, el Mar del Sur de China o las relaciones con Japón.',
        tip: 'Xi Jinping habla frecuentemente del "gran rejuvenecimiento de la nación china" como superación definitiva del siglo de la humillación.',
      },
      {
        pregunta: '¿Por qué la última dinastía era "extranjera"?',
        respuesta: 'Los manchúes, pueblo del noreste (la actual Manchuria), conquistaron China en 1644 aprovechando el colapso de los Ming. Fundaron la dinastía Qing y gobernaron durante 268 años. Para mantenerse en el poder, adoptaron la cultura, el idioma y la burocracia chinas, pero mantuvieron su identidad manchú: el idioma manchú era co-oficial, los manchúes ocupaban puestos militares clave y todos los hombres chinos debían llevar la coleta manchú como símbolo de sumisión. Paradójicamente, los Qing ampliaron China a su máxima extensión histórica, integrando Tíbet, Xinjiang y Mongolia.',
        tip: 'El idioma manchú está prácticamente extinto hoy: apenas unas pocas personas mayores en aldeas del noreste lo hablan.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por la Tab 1 — Línea del Tiempo',
        cuerpo: 'Haz clic en cada uno de los 10 períodos para ver un resumen. El código de colores indica la categoría histórica: marrón para unificación, dorado para períodos clásicos, gris para fragmentación, azul para innovación, verde para expansión e índigo para declive. Este mapa visual te dará la estructura mental completa antes de profundizar.',
      },
      {
        titulo: 'Comprende la continuidad y los saltos',
        cuerpo: 'Fíjate en cómo cada dinastía responde a la anterior: los Han construyen sobre los Qin, los Tang sobre los Sui, los Ming sobre los Yuan. El colapso de una dinastía no borra la anterior: la nueva siempre hereda administración, escritura y cultura. Los verdaderos "reinicios" son contados: la llegada mongola (Yuan) y la Crisis del Opio son los más radicales.',
      },
      {
        titulo: 'Usa la Tab 3 para comparar inventos y personajes',
        cuerpo: 'La tabla comparativa ordena las seis eras más representativas según sus aportaciones clave. Puedes filtrar por categoría (Clásico, Innovación, Declive…) para ver patrones: los períodos de fragmentación también producen filosofía y arte; los de expansión a veces van seguidos de aislacionismo.',
      },
      {
        titulo: 'Reflexiona sobre los ciclos dinásticos',
        cuerpo: 'Los historiadores chinos identificaron hace siglos el "ciclo dinástico": un nuevo fundador legitima su poder, la dinastía crece y prospera, la corrupción y el agotamiento la debilitan, las rebeliones campesinas o las invasiones exteriores la destruyen, y el ciclo se repite. Puedes ver este patrón en Qin, Han, Tang, Song, Ming y Qing. ¿Es un ciclo inevitable o una profecía autocumplida?',
      },
      {
        titulo: 'Conecta la historia con el presente',
        cuerpo: 'La Tab 4 agrupa las eras en su contexto más amplio. El último bloque, "El Siglo de la Humillación", conecta directamente con la China contemporánea: la narrativa del "rejuvenecimiento nacional", la sensibilidad sobre Hong Kong y Taiwán, y la relación tensa con Japón son incomprensibles sin conocer los tratados desiguales de 1842–1900. La historia china no es pasado: es el presente.',
      },
    ],

    tips: [
      {
        icono: '🗺️',
        texto: 'Para memorizar el orden de las principales dinastías, usa el mnemónico chino clásico: "Qin Han Wei Jin Sur-Norte Sui Tang Song Yuan Ming Qing". Cada carácter representa una dinastía.',
      },
      {
        icono: '📖',
        texto: 'Si quieres profundizar en la época Tang, lee "El libro de los Tang" de Jonathan Clements. Para los Qing, "El último gran Imperio de China" de Jonathan Spence es referencia imprescindible.',
      },
      {
        icono: '🎬',
        texto: 'El cine chino ofrece ventanas magníficas a cada era: "Hero" (Qin, Zhang Yimou), "La maldición de la flor dorada" (Tang, Zhang Yimou) y "El último emperador" (final Qing, Bernardo Bertolucci, 9 Oscars).',
      },
      {
        icono: '🔗',
        texto: 'La Ruta de la Seda conectó China con Roma en los años Han. "Las rutas de la seda" de Peter Frankopan narra cómo ese comercio moldeó toda la historia mundial, no solo la china.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que China ha sido siempre un país unificado',
        cuerpo: 'La fragmentación fue la norma durante siglos: los Tres Reinos (220–280), los Dieciséis Reinos (304–439), las Cinco Dinastías y los Diez Reinos (907–960) y la coexistencia Jin-Song (1115–1234) son todos períodos de China dividida. La unificación era el ideal confuciano, pero la realidad histórica era mucho más caótica. La China unificada que conocemos hoy es en buena medida una construcción del siglo XX.',
      },
      {
        titulo: 'Pensar que la Gran Muralla que vemos es la original de Qin Shi Huang',
        cuerpo: 'La muralla que los turistas visitan hoy —construida en piedra y ladrillo, con torres regulares— es obra principalmente de la dinastía Ming (s. XIV–XVII). La muralla Qin era mucho más rudimentaria: tierra apisonada y madera. Entre ambas, la muralla fue ampliada, reconstruida, abandonada y reconstruida de nuevo en diferentes puntos durante 1.500 años.',
      },
      {
        titulo: 'Asumir que China "se quedó atrás" por ser conservadora',
        cuerpo: 'En el año 1000, China era la economía más avanzada del mundo, con tecnologías que Europa no tendría durante siglos. El "retraso" respecto a Occidente es un fenómeno de los siglos XVII–XIX, no una constante histórica. Y tiene causas complejas: la estructura de incentivos confuciana, la autosuficiencia del Estado, la falta de competencia interestatal. No es "conservadurismo" innato, sino un resultado de estructuras institucionales específicas.',
      },
      {
        titulo: 'Confundir el fin de los Qing con el fin de China como potencia',
        cuerpo: 'La caída de los Qing en 1912 fue el fin del sistema imperial, no de China. Lo que siguió —República, guerra civil, República Popular— fue en muchos sentidos una recomposición de la identidad nacional china tras el trauma del siglo de la humillación. La continuidad cultural, la lengua y la memoria histórica persistieron. La China de hoy es heredera directa de todas estas dinastías, y lo sabe: el Partido Comunista cita a Confucio, celebra a Zheng He y restaura templos imperiales.',
      },
    ],
  },
};
