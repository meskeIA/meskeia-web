import type { HistoriaData } from './types';

export const historiaPrehistoria: HistoriaData = {
  slug: 'prehistoria',
  titulo: 'Prehistoria: De los Primeros Homínidos a las Primeras Ciudades',
  subtitulo: 'Tres millones de años de evolución humana, migraciones, arte y revolución neolítica',
  descripcionSEO: 'Cronología interactiva de la Prehistoria: de los primeros australopitecos (3 millones a.C.) a la invención de la escritura y las primeras ciudades (3000 a.C.). Evolución humana, arte rupestre, revolución neolítica y calcolítico en 10 hitos y 6 eras.',
  keywords: [
    'prehistoria cronología interactiva',
    'australopitecus homo habilis homo erectus evolución humana',
    'revolución neolítica agricultura sedentarismo creciente fértil',
    'arte rupestre altamira lascaux pinturas paleolítico',
    'megalitismo stonehenge dólmenes menhires',
    'calcolítico escritura cuneiforme primeras ciudades mesopotamia',
  ],
  anioInicio: -3000000,
  anioFin: -3000,

  hitos: [
    {
      id: 'australopitecos',
      nombre: 'Australopitecos y Primeros Homínidos',
      anioInicio: -3000000,
      anioFin: -2000000,
      color: '#8B4513',
      categoria: 'evolucion',
      descripcion: 'Aparición de los primeros homínidos bípedos en África oriental. Lucy (Australopithecus afarensis) camina erguida pero aún tiene cerebro pequeño. Fabrican herramientas de piedra rudimentarias en Olduvai.',
      obraIconica: 'Lucy (AL 288-1) — Australopithecus afarensis, Etiopía, 3,2 Ma',
      paises: ['Kenya', 'Tanzania', 'Etiopía', 'Sudáfrica'],
    },
    {
      id: 'homo-habilis',
      nombre: 'Homo habilis y las Primeras Herramientas',
      anioInicio: -2000000,
      anioFin: -1500000,
      color: '#A0522D',
      categoria: 'herramientas',
      descripcion: 'Homo habilis (\'hombre hábil\') produce las primeras herramientas líticas de la cultura Olduvayense. Cerebro significativamente mayor. Primeros indicios de comportamiento social organizado y caza.',
      obraIconica: 'Herramientas olduvayenses — Gorge of Olduvai, Tanzania, ~2 Ma',
      paises: ['Kenya', 'Tanzania', 'Etiopía'],
    },
    {
      id: 'homo-erectus',
      nombre: 'Homo erectus y la Conquista del Fuego',
      anioInicio: -1500000,
      anioFin: -300000,
      color: '#CD853F',
      categoria: 'migracion',
      descripcion: 'Homo erectus domina el fuego, fabrica herramientas achelenses y migra fuera de África por primera vez. Coloniza Asia y Europa. Sitios clave: Zhoukoudian (China), Atapuerca (España).',
      obraIconica: 'Hacha de mano achelense — múltiples sitios, ~1,5 Ma',
      paises: ['África', 'China', 'España', 'Java'],
    },
    {
      id: 'neandertales',
      nombre: 'Neandertales y el Hombre de Denisova',
      anioInicio: -300000,
      anioFin: -40000,
      color: '#6B8E23',
      categoria: 'evolucion',
      descripcion: 'Los neandertales dominan Europa y Oriente Medio. Entierran a sus muertos, crean pigmentos, tienen lenguaje. Los Denisovanos colonizan Asia. ADN antiguo revela mestizaje con Homo sapiens moderno.',
      obraIconica: 'Sepultura de Shanidar IV — flores en la tumba, Iraq, ~60.000 a.C.',
      paises: ['Europa', 'Oriente Medio', 'Asia Central'],
    },
    {
      id: 'homo-sapiens',
      nombre: 'Homo sapiens sale de África',
      anioInicio: -200000,
      anioFin: -70000,
      color: '#2E8B57',
      categoria: 'migracion',
      descripcion: 'Homo sapiens aparece en África oriental (~200.000 a.C.) y comienza las grandes migraciones Out of Africa (~70.000 a.C.). Expansión por Oriente Medio, Asia, Australia. Extinción progresiva de los neandertales.',
      obraIconica: 'Pinturas de Blombos Cave — pigmento ocre, Sudáfrica, ~100.000 a.C.',
      paises: ['África', 'Oriente Medio', 'Australia'],
    },
    {
      id: 'paleolitico-superior',
      nombre: 'Paleolítico Superior y el Arte Rupestre',
      anioInicio: -40000,
      anioFin: -12000,
      color: '#4169E1',
      categoria: 'arte',
      descripcion: 'Explosión creativa humana: pinturas rupestres de Altamira y Lascaux, esculturas de Venus, instrumentos musicales. Cazadores-recolectores sofisticados colonizan América cruzando Beringia (~15.000 a.C.).',
      obraIconica: 'Cueva de Altamira — bisontes policromos, España, ~36.000 a.C.',
      paises: ['España', 'Francia', 'América', 'Siberia'],
    },
    {
      id: 'mesolitico',
      nombre: 'Mesolítico y el Fin del Pleistoceno',
      anioInicio: -12000,
      anioFin: -9000,
      color: '#20B2AA',
      categoria: 'herramientas',
      descripcion: 'Fin de la última glaciación. Cambio climático radical transforma ecosistemas. Aparecen los microlitos (herramientas pequeñas), primeros perros domesticados, pesca intensiva. Transición hacia asentamientos.',
      obraIconica: 'Yacimiento de Göbekli Tepe — templo megalítico, Turquía, ~10.000 a.C.',
      paises: ['Europa', 'Oriente Próximo', 'Asia'],
    },
    {
      id: 'revolucion-neolitica',
      nombre: 'Revolución Neolítica: Agricultura y Ganadería',
      anioInicio: -9000,
      anioFin: -6000,
      color: '#FF8C00',
      categoria: 'agricultura',
      descripcion: 'La mayor transformación de la prehistoria: domesticación del trigo, cebada, vacas, ovejas en el Creciente Fértil. Primeros poblados permanentes. Sedentarismo, especialización laboral, cerámica, primeras aldeas.',
      obraIconica: 'Çatalhöyük — ciudad neolítica de 10.000 habitantes, Turquía, ~7.500 a.C.',
      paises: ['Siria', 'Turquía', 'Irak', 'Palestina'],
    },
    {
      id: 'megalitismo',
      nombre: 'Megalitismo y Monumentos Prehistóricos',
      anioInicio: -5000,
      anioFin: -3500,
      color: '#9932CC',
      categoria: 'arte',
      descripcion: 'Construcción de dólmenes, menhires y círculos de piedra. Stonehenge (Inglaterra), Carnac (Francia), Newgrange (Irlanda). Evidencia de organización social compleja, astronomía prehistórica y rituales funerarios.',
      obraIconica: 'Stonehenge — círculo megalítico, Wiltshire, Inglaterra, ~3.100 a.C.',
      paises: ['Reino Unido', 'Francia', 'Irlanda', 'Malta'],
    },
    {
      id: 'calcolitico',
      nombre: 'Calcolítico y el Amanecer de la Civilización',
      anioInicio: -4500,
      anioFin: -3000,
      color: '#B8860B',
      categoria: 'agricultura',
      descripcion: 'Metalurgia del cobre, arado, rueda, primeras ciudades en Mesopotamia y Egipto. Uruk alcanza 50.000 habitantes. Escritura proto-cuneiforme en Sumeria (~3.200 a.C.). Fin de la prehistoria.',
      obraIconica: 'La Rueda de Mesopotamia — Ur, Iraq, ~3.500 a.C. La invención que lo cambió todo',
      paises: ['Irak', 'Siria', 'Egipto', 'Irán'],
    },
  ],

  eras: [
    {
      nombre: 'Paleolítico Inferior',
      desde: -3000000,
      hasta: -300000,
      icono: '🦴',
      hitosDestacados: [
        'Australopitecos y Primeros Homínidos',
        'Homo habilis y las Primeras Herramientas',
        'Homo erectus y la Conquista del Fuego',
      ],
      eventos: [
        'Primeras herramientas de piedra tallada (Olduvayense) (~2,6 Ma)',
        'Homo erectus abandona África por primera vez (~1,8 Ma)',
        'Control sistemático del fuego (~1 Ma)',
      ],
    },
    {
      nombre: 'Paleolítico Medio',
      desde: -300000,
      hasta: -40000,
      icono: '🗿',
      hitosDestacados: [
        'Neandertales y el Hombre de Denisova',
        'Homo sapiens sale de África',
      ],
      eventos: [
        'Aparición de Homo sapiens en África oriental (~200.000 a.C.)',
        'Primeros comportamientos simbólicos: ocre, conchas perforadas (~130.000 a.C.)',
        'Gran migración Out of Africa (~70.000 a.C.)',
      ],
    },
    {
      nombre: 'Paleolítico Superior',
      desde: -40000,
      hasta: -12000,
      icono: '🎨',
      hitosDestacados: [
        'Paleolítico Superior y el Arte Rupestre',
      ],
      eventos: [
        'Pinturas rupestres de Chauvet, las más antiguas conocidas (Francia, ~36.000 a.C.)',
        'Figurillas de Venus: símbolo femenino universal (~30.000 a.C.)',
        'Primer poblamiento de América cruzando Beringia (~15.000 a.C.)',
      ],
    },
    {
      nombre: 'Mesolítico',
      desde: -12000,
      hasta: -9000,
      icono: '🏕️',
      hitosDestacados: [
        'Mesolítico y el Fin del Pleistoceno',
      ],
      eventos: [
        'Fin de la última glaciación (Younger Dryas) (~11.700 a.C.)',
        'Göbekli Tepe: primer templo monumental del mundo (~10.000 a.C.)',
        'Domesticación del perro (~9.500 a.C.)',
      ],
    },
    {
      nombre: 'Neolítico',
      desde: -9000,
      hasta: -4500,
      icono: '🌾',
      hitosDestacados: [
        'Revolución Neolítica: Agricultura y Ganadería',
        'Megalitismo y Monumentos Prehistóricos',
      ],
      eventos: [
        'Domesticación del trigo y cebada en el Creciente Fértil (~8.500 a.C.)',
        'Çatalhöyük: primera gran ciudad neolítica (~7.500 a.C.)',
        'Inicio de la construcción de monumentos megalíticos en Europa (~5.000 a.C.)',
      ],
    },
    {
      nombre: 'Calcolítico y Transición',
      desde: -4500,
      hasta: -3000,
      icono: '⚙️',
      hitosDestacados: [
        'Calcolítico y el Amanecer de la Civilización',
      ],
      eventos: [
        'Metalurgia del cobre en Europa y Oriente Próximo (~4.200 a.C.)',
        'Invención de la rueda en Mesopotamia (~3.500 a.C.)',
        'Escritura proto-cuneiforme en Uruk, Sumeria (~3.200 a.C.)',
      ],
    },
  ],

  categorias: {
    evolucion: 'Evolución Humana',
    herramientas: 'Tecnología y Herramientas',
    migracion: 'Migraciones',
    arte: 'Arte y Cultura',
    agricultura: 'Agricultura y Sedentarismo',
  },

  colores: {
    evolucion: '#8B4513',
    herramientas: '#A0522D',
    migracion: '#2E8B57',
    arte: '#4169E1',
    agricultura: '#FF8C00',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'La prehistoria abarca el 99,9% de la existencia humana. Durante tres millones de años, nuestros antepasados pasaron de ser una especie más del ecosistema africano a transformar radicalmente el planeta. Comprender este período es comprender los fundamentos biológicos, sociales y culturales de lo que somos hoy.',

    tablaComparativa: [
      {
        hito: 'Paleolítico Inferior',
        periodo: '3.000.000 – 300.000 a.C.',
        categoria: 'Evolución Humana',
        personaje: 'Australopithecus / Homo erectus',
        aportacion: 'Bipedismo, primeras herramientas líticas (Olduvayense) y dominio del fuego',
      },
      {
        hito: 'Paleolítico Medio',
        periodo: '300.000 – 40.000 a.C.',
        categoria: 'Migraciones',
        personaje: 'Homo sapiens / Neandertales',
        aportacion: 'Comportamiento simbólico, sepulturas rituales y gran migración Out of Africa',
      },
      {
        hito: 'Paleolítico Superior',
        periodo: '40.000 – 12.000 a.C.',
        categoria: 'Arte y Cultura',
        personaje: 'Homo sapiens (Cro-Magnon)',
        aportacion: 'Arte rupestre, figurillas, instrumentos musicales y colonización de América',
      },
      {
        hito: 'Mesolítico',
        periodo: '12.000 – 9.000 a.C.',
        categoria: 'Tecnología y Herramientas',
        personaje: 'Cazadores-recolectores mesolíticos',
        aportacion: 'Microlitos, domesticación del perro y primeros templos monumentales',
      },
      {
        hito: 'Neolítico',
        periodo: '9.000 – 4.500 a.C.',
        categoria: 'Agricultura y Sedentarismo',
        personaje: 'Agricultores del Creciente Fértil',
        aportacion: 'Agricultura, ganadería, cerámica, megalitos y primeras ciudades neolíticas',
      },
      {
        hito: 'Calcolítico',
        periodo: '4.500 – 3.000 a.C.',
        categoria: 'Agricultura y Sedentarismo',
        personaje: 'Sumerios / Pueblos del Cobre',
        aportacion: 'Metalurgia del cobre, rueda, escritura proto-cuneiforme y ciudades-estado',
      },
    ],

    escenarios: [
      {
        icono: '🔍',
        titulo: '¿Cómo aprendemos sobre la prehistoria?',
        perfil: 'Curioso sobre metodología científica',
        texto: 'Sin escritura, todo conocimiento prehistórico proviene de vestigios materiales: huesos, herramientas, carbón vegetal, ADN antiguo y estratigrafía. La datación por carbono-14 (hasta 50.000 años), la termoluminiscencia y el análisis genómico han revolucionado nuestra comprensión en las últimas décadas.',
      },
      {
        icono: '🌾',
        titulo: 'La Revolución Neolítica: ¿fue realmente un avance?',
        perfil: 'Estudiante de historia o ciencias sociales',
        texto: 'La agricultura permitió poblaciones más densas y especialización laboral, pero también trajo dietas menos variadas, enfermedades infecciosas por convivencia con animales, jerarquías sociales y trabajo más duro. Arqueológicamente, los esqueletos neolíticos muestran peor salud individual que los cazadores-recolectores anteriores. La pregunta sigue abierta.',
      },
      {
        icono: '🎨',
        titulo: 'Arte rupestre: lenguaje antes que la escritura',
        perfil: 'Apasionado de arte o antropología',
        texto: 'Las pinturas de Chauvet (36.000 a.C.) o Altamira muestran dominio técnico asombroso: perspectiva, movimiento, uso de relieves naturales de la pared. No son garabatos primitivos: son obras de artistas especializados. Representan el primer lenguaje visual simbólico de la humanidad, milenios antes de cualquier escritura.',
      },
      {
        icono: '🌍',
        titulo: 'Somos inmigrantes: las grandes migraciones prehistóricas',
        perfil: 'Interesado en genética y origen humano',
        texto: 'El análisis de ADN antiguo ha revelado que todos los humanos modernos fuera de África descienden de una única migración (~70.000 a.C.). Pero Europa actual es resultado de al menos tres oleadas: cazadores-recolectores paleolíticos, agricultores neolíticos y pastores de las estepas pónticas (Yamnaya, ~3.000 a.C.). Cada europeo lleva los tres en su genoma.',
      },
    ],

    faq: [
      {
        pregunta: '¿Cuándo termina la prehistoria y empieza la historia?',
        respuesta: 'Convencionalmente, la prehistoria termina con la invención de la escritura (~3.200 a.C. en Sumeria). Sin embargo, el límite varía por región: en Mesoamérica la escritura llegó hacia el 900 a.C., y en muchas culturas orales no existió nunca. La distinción es metodológica, no biológica: la historia solo puede estudiarse donde hay textos escritos.',
        tip: 'Algunos historiadores prefieren el término "protohistoria" para los pueblos sin escritura propia pero mencionados en textos de otros.',
      },
      {
        pregunta: '¿Cómo sabemos lo que comían los humanos prehistóricos?',
        respuesta: 'A través de análisis de isótopos estables en huesos (revelan proporciones de proteína animal vs. vegetal), restos de semillas y huesos de animales en yacimientos, estudios de desgaste dental, coprolitos (heces fosilizadas) y análisis de residuos en vasijas cerámicas neolíticas. La imagen actual es más rica y variada de lo que se pensaba hace décadas.',
        tip: 'El análisis de sarro dental prehistórico ha revelado consumo de plantas medicinales, almidones cocidos y hasta miel hace 250.000 años.',
      },
      {
        pregunta: '¿Por qué desaparecieron los neandertales?',
        respuesta: 'Probablemente por una combinación de factores: competencia con Homo sapiens (más eficientes como cazadores), presión demográfica, cambios climáticos y posible absorción genética por mestizaje. El ADN neandertal sigue presente en todos los humanos no africanos (1-4% del genoma). Técnicamente, los neandertales no desaparecieron del todo: se fusionaron con nosotros.',
        tip: 'Los europeos modernos tenemos más ADN neandertal que los africanos subsaharianos, que descendían de poblaciones que nunca contactaron con neandertales.',
      },
      {
        pregunta: '¿Fue el neolítico una mejora en la calidad de vida?',
        respuesta: 'A nivel individual, probablemente no al principio. Los esqueletos neolíticos muestran más caries, menor estatura, más enfermedades infecciosas y mayor carga de trabajo físico que los cazadores-recolectores. A nivel colectivo, la agricultura permitió alimentar poblaciones más densas, generar excedentes, especialización laboral y eventualmente la civilización. Es una paradoja documentada por Jared Diamond en "Armas, Gérmenes y Acero".',
      },
      {
        pregunta: '¿Qué tan inteligentes eran los homínidos primitivos?',
        respuesta: 'Mucho más de lo que se asumía hace un siglo. Homo erectus fabricó herramientas simétricas (hachas achelenses) durante 1,5 millones de años, navegó hasta islas (Flores, Indonesia), dominó el fuego y cuidó a enfermos. Los neandertales enterraban a sus muertos con flores, usaban pigmentos corporales, fabricaban instrumentos musicales y mostraban comportamiento simbólico. La "primitividad" es un prejuicio culturalmente sesgado.',
        tip: 'La flauta de hueso de Divje Babe (Eslovenia), de ~60.000 años, sugiere que los neandertales hacían música.',
      },
    ],

    pasos: [
      {
        titulo: 'Comienza con la escala de tiempo',
        cuerpo: 'La prehistoria abarca 3 millones de años. Observa los bloques de color en la Línea del Tiempo y fíjate cuánto espacio ocupa el Paleolítico Inferior comparado con el Neolítico. Esta proporción visual es la realidad: el 99% del tiempo humano transcurrió antes de la agricultura.',
      },
      {
        titulo: 'Explora las fuentes arqueológicas',
        cuerpo: 'Para cada período, busca los museos nacionales de referencia: Museo Nacional de Ciencias Naturales (Madrid), Museo de l\'Homme (París), Smithsonian (Washington). Visitar una reproducción de Altamira o un molde de Lucy transforma la comprensión abstracta en experiencia concreta.',
      },
      {
        titulo: 'Aprende sobre datación por carbono-14',
        cuerpo: 'El carbono-14 es fiable hasta ~50.000 años. Para períodos más antiguos se usa la termoluminiscencia, el potasio-argón o las series de uranio. Comprender los márgenes de error de cada técnica ayuda a interpretar correctamente las fechas que aparecen en los yacimientos.',
      },
      {
        titulo: 'Descubre el ADN antiguo como revolución científica',
        cuerpo: 'Desde 2010, el equipo de Svante Pääbo (Nobel 2022) ha secuenciado el genoma de neandertales, denisovanos y miles de individuos prehistóricos. Esto ha reescrito completamente la historia de las migraciones y mezclas entre especies humanas. Busca sus publicaciones en Nature o su libro "Neanderthal Man".',
      },
      {
        titulo: 'Practica la arqueología experimental',
        cuerpo: 'Existen talleres de arqueología experimental donde se aprende a tallar sílex, encender fuego con pirita, fabricar cerámica a mano o tejer fibras vegetales. Esta experiencia directa revela la sofisticación técnica de los prehistoric humans y destruye la idea de "primitivismo". En España: Parque Arqueológico de Atapuerca.',
      },
    ],

    tips: [
      {
        icono: '📅',
        texto: 'Los años negativos se cuentan hacia atrás: -3.000.000 es anterior a -40.000. En la escala temporal, cuanto más a la izquierda, más antiguo. La barra más larga (Paleolítico Inferior) representa 2,7 millones de años; toda la civilización escrita cabe en el último 0,1% de esa escala.',
      },
      {
        icono: '🧬',
        texto: 'El 99,9% del tiempo que Homo sapiens lleva en la Tierra lo pasó como cazador-recolector. La agricultura tiene solo 10.000 años, la escritura 5.000, la industria 250. Nuestro cuerpo y cerebro están biológicamente adaptados a la vida paleolítica, no a la moderna: eso explica muchos problemas de salud contemporáneos.',
      },
      {
        icono: '🗺️',
        texto: 'La especie humana colonizó todos los continentes habitables antes de inventar la escritura: África, Asia, Europa, Australia (~50.000 a.C.) y América (~15.000 a.C.). Esta expansión global sin tecnología moderna es uno de los logros más extraordinarios de la historia natural.',
      },
      {
        icono: '🏛️',
        texto: 'Göbekli Tepe (Turquía, ~10.000 a.C.) es un templo monumental con pilares tallados de 5-6 metros, construido por cazadores-recolectores del Mesolítico, 6.000 años antes de Stonehenge. Demuestra que la religión organizada y las grandes obras colectivas precedieron a la agricultura, invirtiendo la teoría clásica.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que la prehistoria fue una época "primitiva"',
        cuerpo: 'Los humanos del Paleolítico tenían cerebros idénticos a los nuestros, lenguaje complejo, vida social sofisticada, arte, música y rituales. "Primitivo" implica inferioridad; lo correcto es "tecnológicamente diferente". Un cazador-recolector paleolítico era cognitivamente igual a un humano moderno, solo con un entorno cultural distinto.',
      },
      {
        titulo: 'Pensar que el fuego fue la primera herramienta',
        cuerpo: 'Las primeras herramientas líticas (Olduvayenses) datan de ~2,6 millones de años. El dominio sistemático del fuego se estima entre 1 y 1,5 millones de años. Las herramientas preceden al fuego en más de un millón de años. Además, el fuego no es propiamente una "herramienta" sino una técnica de uso de energía.',
      },
      {
        titulo: 'Creer que los neandertales eran brutos e incultos',
        cuerpo: 'Los neandertales enterraban a sus muertos (a veces con flores y objetos personales), usaban pigmentos corporales para decorarse, fabricaban joyería con plumas y garras de águila, cuidaban a enfermos e incapacitados que no podían valerse solos, y posiblemente tenían lenguaje articulado. La imagen del "cavernícola brutal" es una caricatura del siglo XIX sin base científica.',
      },
      {
        titulo: 'Asumir que la transición a la agricultura fue rápida e inevitable',
        cuerpo: 'La "revolución neolítica" duró miles de años y ocurrió de forma independiente en al menos 7-8 regiones del mundo (Creciente Fértil, China, Mesoamérica, Andes, Nueva Guinea, África subsahariana...). Muchos grupos la rechazaron voluntariamente durante milenios. La agricultura no se adoptó porque era "mejor" sino porque permitía sostener más población, aunque a costa de peor salud individual.',
      },
    ],
  },
};
