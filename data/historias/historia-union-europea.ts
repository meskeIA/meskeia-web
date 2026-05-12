import type { HistoriaData } from './types';

export const historiaUnionEuropea: HistoriaData = {
  slug: 'historia-union-europea',
  titulo: 'La Unión Europea: De las Cenizas de la Guerra a la Mayor Integración Política de la Historia',
  subtitulo: 'Cómo seis países devastados por dos guerras construyeron la paz, la prosperidad y el euro en 70 años',
  descripcionSEO: 'Cronología interactiva de la Unión Europea: de la CECA (1951) y el Tratado de Roma al euro, el Brexit y el Next Generation EU. 10 hitos y 6 eras que explican cómo Europa construyó el experimento de integración supranacional más ambicioso de la historia.',
  keywords: [
    'historia union europea cronología',
    'tratado roma maastricht lisboa cee ue',
    'euro moneda unica banco central europeo bce',
    'brexit reino unido salida union europea',
    'ceca schuman adenauer padres fundadores europa',
    'ampliacion este europa 2004 mercado unico schengen',
  ],
  anioInicio: 1951,
  anioFin: 9999,

  hitos: [
    {
      id: 'ceca',
      nombre: 'CECA y los Padres Fundadores',
      anioInicio: 1951,
      anioFin: 1957,
      color: '#003399',
      categoria: 'fundacion',
      descripcion: 'Tratado de París (1951): Francia, Alemania, Italia, Bélgica, Holanda y Luxemburgo crean la CECA (Carbón y Acero). Monnet, Schuman y Adenauer apuestan por la integración económica como vacuna contra la guerra. El acero compartido hace imposible otra guerra.',
      obraIconica: 'Declaración Schuman — 9 de mayo de 1950. Fecha fundacional de Europa (Día de Europa)',
      paises: ['Francia', 'Alemania', 'Italia', 'Bélgica', 'Países Bajos', 'Luxemburgo'],
    },
    {
      id: 'roma',
      nombre: 'Tratado de Roma y el Mercado Común',
      anioInicio: 1957,
      anioFin: 1973,
      color: '#0055A4',
      categoria: 'ampliacion',
      descripcion: 'Tratado de Roma (1957) crea la CEE (Comunidad Económica Europea) y EURATOM. Libre circulación de bienes y personas. PAC (Política Agrícola Común) protege a los agricultores europeos. Primera ampliación: UK, Irlanda y Dinamarca (1973).',
      obraIconica: 'Firma del Tratado de Roma — 25 de marzo de 1957, Capitolio Romano',
      paises: ['Francia', 'Alemania', 'Italia', 'Bélgica', 'Países Bajos', 'Luxemburgo'],
    },
    {
      id: 'ampliacion-sur',
      nombre: 'Ampliación hacia el Sur Democrático',
      anioInicio: 1973,
      anioFin: 1986,
      color: '#0077B6',
      categoria: 'ampliacion',
      descripcion: 'Grecia (1981), España y Portugal (1986) se incorporan tras superar sus dictaduras. La integración europea como premio a la democratización. Fondo de Cohesión para reducir desigualdades. El motor de la transición española.',
      obraIconica: 'Adhesión de España — 1 enero 1986. Madrid celebra la entrada en la CEE',
      paises: ['Grecia', 'España', 'Portugal', 'Reino Unido'],
    },
    {
      id: 'acta-unica',
      nombre: 'Acta Única Europea y el Gran Mercado',
      anioInicio: 1986,
      anioFin: 1993,
      color: '#0099CC',
      categoria: 'mercado',
      descripcion: 'Acta Única Europea (1986): elimina 300 barreras técnicas al comercio. Creación del gran mercado único (270 millones de consumidores). Fondos Estructurales para convergencia económica. Voto por mayoría cualificada acelera decisiones.',
      obraIconica: 'El Gran Mercado Único — 1 enero 1993. Sin fronteras para bienes, servicios, capital y personas',
      paises: ['Todos los estados miembros'],
    },
    {
      id: 'maastricht',
      nombre: 'Tratado de Maastricht y la Unión Europea',
      anioInicio: 1992,
      anioFin: 1999,
      color: '#0066CC',
      categoria: 'integracion',
      descripcion: 'Tratado de Maastricht (1992): nace la Unión Europea, ciudadanía europea, política exterior común, criterios de convergencia para el euro. Caída del Muro de Berlín integra a la ex-RDA. Ampliación a Austria, Finlandia y Suecia (1995).',
      obraIconica: 'Tratado de Maastricht — 7 febrero 1992. Nace oficialmente la Unión Europea',
      paises: ['Todos los estados miembros', 'Austria', 'Finlandia', 'Suecia'],
    },
    {
      id: 'euro',
      nombre: 'El Euro y la Unión Monetaria',
      anioInicio: 1999,
      anioFin: 2004,
      color: '#0044AA',
      categoria: 'mercado',
      descripcion: 'El euro nace como moneda contable (1999) y circulante (2002) en 12 países. BCE (Banco Central Europeo) en Frankfurt gestiona la política monetaria. Mayor ampliación: 10 países del Este entran en 2004. Europa llega a 25 miembros.',
      obraIconica: 'El Euro en los bolsillos — 1 enero 2002. 300 millones de ciudadanos adoptan el euro',
      paises: ['Alemania', 'Francia', 'España', 'Italia', 'Portugal', 'Grecia'],
    },
    {
      id: 'constitucion-lisboa',
      nombre: 'Crisis Constitucional y Tratado de Lisboa',
      anioInicio: 2004,
      anioFin: 2009,
      color: '#003388',
      categoria: 'integracion',
      descripcion: 'Constitución Europea rechazada en referéndums francés y holandés (2005). Tratado de Lisboa (2007) salva la reforma institucional: Presidente del Consejo, Alto Representante de Exteriores, más poder al Parlamento Europeo.',
      obraIconica: 'Firma del Tratado de Lisboa — 13 diciembre 2007. Europa reinicia su reforma institucional',
      paises: ['Francia', 'Países Bajos', 'Irlanda', 'Todos los estados miembros'],
    },
    {
      id: 'crisis-euro',
      nombre: 'Crisis del Euro y la Gran Recesión',
      anioInicio: 2010,
      anioFin: 2015,
      color: '#CC2200',
      categoria: 'crisis',
      descripcion: 'La crisis financiera de 2008 se convierte en crisis de deuda soberana. Grecia, Portugal, Irlanda, España y Chipre necesitan rescates. BCE de Draghi (\'whatever it takes\') salva el euro. Mecanismo Europeo de Estabilidad. Memorandos de austeridad.',
      obraIconica: 'Whatever it takes — Mario Draghi, 26 julio 2012. Las palabras que salvaron el euro',
      paises: ['Grecia', 'Portugal', 'Irlanda', 'España', 'Chipre'],
    },
    {
      id: 'brexit',
      nombre: 'El referéndum del Brexit y sus consecuencias',
      anioInicio: 2016,
      anioFin: 2021,
      color: '#FF6600',
      categoria: 'crisis',
      descripcion: 'El referéndum del Brexit (2016): Reino Unido vota Leave (52%). Cuatro años de negociaciones traumáticas. UK sale definitivamente el 31 enero 2020. Primer Estado en abandonar la UE en 70 años. La victoria respondió a demandas de soberanía e inmigración que movilizaron al electorado, además de mensajes controvertidos de la campaña Leave.',
      obraIconica: 'Referéndum Brexit — 23 junio 2016. La primera salida de la historia europea',
      paises: ['Reino Unido'],
    },
    {
      id: 'recovery-siglo-xxi',
      nombre: 'Pandemia, Recovery Fund y Europa del Siglo XXI',
      anioInicio: 2021,
      anioFin: 9999,
      color: '#00AA66',
      categoria: 'fundacion',
      descripcion: 'COVID-19 impulsa respuesta europea histórica: Next Generation EU (750.000 M€) es la primera deuda común europea. Guerra de Ucrania acelera autonomía estratégica. Ampliación hacia Ucrania, Moldavia y Balcanes.',
      obraIconica: 'Next Generation EU — julio 2020. El primer eurobono: deuda común europea por primera vez',
      paises: ['Todos los estados miembros', 'Ucrania'],
    },
  ],

  eras: [
    {
      nombre: 'Fundación y Primeras Comunidades',
      desde: 1951,
      hasta: 1973,
      icono: '🏛️',
      hitosDestacados: ['CECA y los Padres Fundadores', 'Tratado de Roma y el Mercado Común'],
      eventos: [
        'Declaración Schuman (9 de mayo de 1950)',
        'Tratado de París: nace la CECA (1951)',
        'Tratado de Roma: nace la CEE (1957)',
      ],
    },
    {
      nombre: 'Ampliaciones y Estabilización',
      desde: 1973,
      hasta: 1992,
      icono: '🌍',
      hitosDestacados: ['Ampliación hacia el Sur Democrático', 'Acta Única Europea y el Gran Mercado'],
      eventos: [
        'Primera ampliación: UK, Irlanda, Dinamarca (1973)',
        'Grecia entra en la CEE (1981)',
        'España y Portugal: la ampliación del sur (1986)',
      ],
    },
    {
      nombre: 'La Gran Integración',
      desde: 1992,
      hasta: 2004,
      icono: '⭐',
      hitosDestacados: ['Tratado de Maastricht y la Unión Europea', 'El Euro y la Unión Monetaria'],
      eventos: [
        'Tratado de Maastricht: nace la UE (1992)',
        'Austria, Finlandia y Suecia se incorporan (1995)',
        'El euro entra en circulación en 12 países (2002)',
      ],
    },
    {
      nombre: 'Reforma y Ampliación al Este',
      desde: 2004,
      hasta: 2010,
      icono: '🔄',
      hitosDestacados: ['Crisis Constitucional y Tratado de Lisboa'],
      eventos: [
        'Mayor ampliación: 10 países del Este se incorporan (2004)',
        'Constitución Europea rechazada en Francia y Holanda (2005)',
        'Tratado de Lisboa firmado (2007)',
      ],
    },
    {
      nombre: 'Crisis y Resistencia',
      desde: 2010,
      hasta: 2021,
      icono: '⚡',
      hitosDestacados: ['Crisis del Euro y la Gran Recesión', 'El referéndum del Brexit y sus consecuencias'],
      eventos: [
        'Crisis de deuda griega: primer rescate (2010)',
        'Draghi: \'whatever it takes\' (2012)',
        'Referéndum Brexit: UK vota Leave (2016)',
      ],
    },
    {
      nombre: 'Europa del Siglo XXI',
      desde: 2021,
      hasta: 9999,
      icono: '🚀',
      hitosDestacados: ['Pandemia, Recovery Fund y Europa del Siglo XXI'],
      eventos: [
        'Next Generation EU: primer bono común europeo (2020)',
        'Guerra de Ucrania: prueba de la unidad europea (2022)',
        'Negociaciones de adhesión con Ucrania y Moldavia (2024)',
      ],
    },
  ],

  categorias: {
    fundacion: 'Fundación e Identidad',
    ampliacion: 'Ampliaciones',
    mercado: 'Mercado y Moneda',
    integracion: 'Integración Política',
    crisis: 'Crisis y Resiliencia',
  },

  colores: {
    fundacion: '#003399',
    ampliacion: '#0077B6',
    mercado: '#0099CC',
    integracion: '#0044AA',
    crisis: '#CC2200',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'La Unión Europea es el experimento de integración supranacional más ambicioso de la historia. En menos de 70 años, países que se habían destruido mutuamente en dos guerras mundiales construyeron un espacio de paz, libre circulación y moneda común. Entender su historia es entender el proyecto político más original del siglo XX.',

    tablaComparativa: [
      {
        hito: 'Fundación y Primeras Comunidades',
        periodo: '1951-1973',
        categoria: 'Fundación e Identidad',
        personaje: 'Schuman, Monnet, Adenauer',
        aportacion: 'CECA, CEE y EURATOM: las tres comunidades fundacionales que integraron carbón, economía y energía nuclear',
      },
      {
        hito: 'Ampliaciones y Estabilización',
        periodo: '1973-1992',
        categoria: 'Ampliaciones',
        personaje: 'Felipe González, Konstantinos Karamanlis',
        aportacion: 'De 6 a 12 miembros: incorporación de las democracias del sur y del norte. PAC y Fondos Estructurales consolidan la convergencia',
      },
      {
        hito: 'La Gran Integración',
        periodo: '1992-2004',
        categoria: 'Integración Política',
        personaje: 'Helmut Kohl, François Mitterrand, Jacques Delors',
        aportacion: 'Nacimiento de la UE, ciudadanía europea y el euro. Schengen elimina las fronteras internas para los ciudadanos',
      },
      {
        hito: 'Reforma y Ampliación al Este',
        periodo: '2004-2010',
        categoria: 'Ampliaciones',
        personaje: 'Valéry Giscard d\'Estaing, José Manuel Barroso',
        aportacion: 'Mayor ampliación de la historia: 10 países del Este. Fracaso constitucional y reforma vía Tratado de Lisboa',
      },
      {
        hito: 'Crisis y Resistencia',
        periodo: '2010-2021',
        categoria: 'Crisis y Resiliencia',
        personaje: 'Mario Draghi, Angela Merkel, David Cameron',
        aportacion: 'El BCE salva el euro con \'whatever it takes\'. El Brexit rompe por primera vez la cohesión de la UE',
      },
      {
        hito: 'Europa del Siglo XXI',
        periodo: '2021-presente',
        categoria: 'Fundación e Identidad',
        personaje: 'Ursula von der Leyen, Charles Michel',
        aportacion: 'Next Generation EU: primera deuda común. Respuesta unitaria a la guerra de Ucrania. Expansión hacia el Este',
      },
    ],

    escenarios: [
      {
        icono: '💶',
        titulo: '¿Por qué el euro fue controvertido?',
        perfil: 'Estudiantes de economía y política europea',
        texto: 'El euro unificó la política monetaria (BCE fija los tipos de interés) pero mantuvo políticas fiscales nacionales. Esto crea tensiones estructurales: un país en recesión no puede devaluar su moneda ni bajar tipos de interés de forma independiente. La crisis griega de 2010 expuso esa contradicción al máximo. Los defensores argumentan que el euro forzó la disciplina fiscal y creó un mercado interior más eficiente.',
      },
      {
        icono: '🇬🇧',
        titulo: 'El Brexit: ¿qué falló?',
        perfil: 'Análisis de por qué UK abandonó la UE',
        texto: 'El Brexit combinó soberanismo (recuperar el control de leyes y fronteras), descontento con la inmigración intraeuropea, crisis de representación política (la UE se percibió como lejana y tecnocrática) y una campaña marcada por mensajes controvertidos y por demandas de soberanía que movilizaron al electorado. La paradoja: UK nunca estuvo en el euro ni en Schengen, pero muchos ciudadanos votaron contra unas restricciones que no existían. El coste económico fue significativo, especialmente para el sector servicios.',
      },
      {
        icono: '🌍',
        titulo: '¿Puede la UE tener política exterior común?',
        perfil: 'El desafío de 27 votos en el Consejo',
        texto: 'La política exterior de la UE requiere unanimidad en el Consejo, lo que da a cualquier estado miembro derecho de veto. Esto crea incoherencias: Hungría bloqueó sanciones a Rusia durante meses en 2022. Sin embargo, la respuesta a la invasión de Ucrania demostró una unidad histórica sin precedentes. El debate sobre si pasar a votación por mayoría cualificada en política exterior es uno de los grandes pendientes institucionales.',
      },
      {
        icono: '🔄',
        titulo: 'La ampliación al Este: pros y contras',
        perfil: 'Evaluación a 20 años de la mayor ampliación',
        texto: 'La incorporación de 10 países en 2004 fue el mayor salto de la UE: 75 millones de personas, muchas con salarios muy inferiores a la media occidental. Los beneficios: mercados, democracia consolidada y estabilidad geopolítica en la frontera con Rusia. Los costes: movimientos migratorios masivos que generaron tensión política en UK y Europa occidental, y dificultades para mantener la cohesión con 27 miembros con intereses muy distintos.',
      },
    ],

    faq: [
      {
        pregunta: '¿Cuántos países forman la Unión Europea?',
        respuesta: 'Actualmente 27 estados miembros tras la salida del Reino Unido en 2020. La UE empezó con 6 países en 1957 y ha crecido en siete rondas de ampliación: 9 (1973), 10 (1981), 12 (1986), 15 (1995), 25 (2004), 27 (2007) y de vuelta a 27 tras el Brexit (2020). Varios países candidatos esperan adhesión: Ucrania, Moldavia y los países de los Balcanes occidentales.',
        tip: 'No confundir la UE con Europa: Noruega, Suiza e Islandia no son miembros de la UE pero sí del Espacio Económico Europeo o del mercado único.',
      },
      {
        pregunta: '¿Cómo funciona el Parlamento Europeo?',
        respuesta: 'El Parlamento Europeo es la única institución de la UE elegida directamente por los ciudadanos. Sus 705 eurodiputados (desde 2024 son 720) se reparten proporcionalmente por país. Comparte el poder legislativo con el Consejo de la UE (los ministros nacionales). La Comisión Europea propone leyes, pero Parlamento y Consejo deben aprobarlas. El Parlamento también aprueba el presupuesto europeo y puede destituir a la Comisión.',
        tip: 'Las elecciones europeas se celebran cada 5 años. La participación ha sido históricamente baja (en torno al 40-50%), aunque en 2019 y 2024 subió significativamente.',
      },
      {
        pregunta: '¿Qué es el espacio Schengen?',
        respuesta: 'El espacio Schengen elimina los controles fronterizos entre sus 29 países miembros (2024), permitiendo viajar sin pasaporte. Nació en 1985 por un acuerdo firmado en Schengen (Luxemburgo) y es independiente de la UE: Suiza y Noruega están en Schengen sin ser miembros de la UE, mientras que Bulgaria y Rumanía son miembros de la UE pero solo entraron en Schengen en 2024.',
        tip: 'Durante el COVID-19 y la crisis migratoria de 2015-2016, varios países reintrodujeron temporalmente controles fronterizos dentro de Schengen, lo que está permitido en situaciones excepcionales.',
      },
      {
        pregunta: '¿Puede un país salir de la Unión Europea?',
        respuesta: 'Sí. El artículo 50 del Tratado de Lisboa, introducido precisamente en 2007, establece el procedimiento de salida. El Reino Unido fue el primer (y hasta ahora único) país en activarlo, en marzo de 2017 tras el referéndum de 2016. El proceso duró casi cuatro años y concluyó el 31 de enero de 2020, seguido de un período de transición hasta diciembre de ese año.',
        tip: 'Curiosamente, el artículo 50 fue redactado por el profesor escocés Alan Dashwood con la idea teórica de que nunca se usaría. La historia siempre supera la teoría.',
      },
      {
        pregunta: '¿Qué es la zona euro y por qué no todos los países la usan?',
        respuesta: 'La zona euro es el conjunto de 20 países de la UE que usan el euro como moneda oficial (2023). Para adoptarlo, un país debe cumplir los criterios de Maastricht: inflación controlada, déficit público por debajo del 3% del PIB, deuda pública inferior al 60% del PIB y tipo de cambio estable durante dos años. Dinamarca tiene una cláusula de exclusión permanente negociada en 1992. Suecia no cumple formalmente por decisión política. Hungría y Polonia tienen plazos indefinidos.',
        tip: 'Los países candidatos a la UE que negocian la adhesión se comprometen a adoptar el euro eventualmente, aunque sin plazos fijos.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por los Padres Fundadores y su contexto',
        cuerpo: 'La CECA (1951) nació solo seis años después del fin de la Segunda Guerra Mundial. Haz clic en el primer hito y piensa: ¿por qué Francia y Alemania, que se habían destruido mutuamente tres veces en 70 años, decidieron compartir su industria siderúrgica? La respuesta a esa pregunta explica toda la lógica de la construcción europea.',
      },
      {
        titulo: 'Sigue el hilo de los tratados fundacionales',
        cuerpo: 'París (1951) → Roma (1957) → Acta Única (1986) → Maastricht (1992) → Ámsterdam (1997) → Niza (2001) → Lisboa (2007). Cada tratado amplió competencias, añadió miembros o reformó instituciones. La Línea del Tiempo muestra cuándo se dieron los saltos más grandes y por qué se produjeron.',
      },
      {
        titulo: 'Comprende las instituciones clave',
        cuerpo: 'La UE tiene un triángulo institucional: la Comisión Europea propone leyes (poder ejecutivo + iniciativa legislativa), el Consejo de la UE (ministros nacionales) y el Parlamento Europeo las aprueban o rechazan. El Consejo Europeo (jefes de Estado) fija la dirección política. El BCE gestiona el euro. El Tribunal de Justicia interpreta el derecho europeo.',
      },
      {
        titulo: 'Analiza el presupuesto europeo',
        cuerpo: 'El presupuesto de la UE equivale a aproximadamente el 1% del PIB conjunto de los estados miembros (unos 170.000 millones € anuales en 2021-2027). El 37% va a agricultura (PAC), el 34% a cohesión y fondos estructurales. Compare esto con los presupuestos nacionales, que representan el 40-50% del PIB: la UE es grande en regulación pero pequeña en gasto directo.',
      },
      {
        titulo: 'Reflexiona sobre los desafíos del siglo XXI',
        cuerpo: 'La UE enfrenta retos simultáneos: autonomía estratégica (defensa, tecnología, energía), ampliación hacia el Este en un contexto de guerra, cambio climático (Green Deal), inteligencia artificial, migración y presión del populismo euroescéptico. La última era del visualizador muestra cómo estas tensiones se han agudizado desde 2016.',
      },
    ],

    tips: [
      {
        icono: '📅',
        texto: 'El 9 de mayo es el Día de Europa, en conmemoración de la Declaración Schuman de 1950. No confundir con el Tratado de París (1951) que creó formalmente la CECA: la declaración fue el discurso fundacional, el tratado fue el instrumento jurídico que le dio vida.',
      },
      {
        icono: '🗺️',
        texto: 'El euro es usado por más de 340 millones de personas en 20 países. Es la segunda moneda de reserva mundial tras el dólar. Sin embargo, solo el 67% de los ciudadanos de la UE lo usan en su día a día: países como Polonia, Chequia, Hungría y Suecia mantienen sus monedas nacionales.',
      },
      {
        icono: '📚',
        texto: 'La UE ha sido el único proyecto político en la historia capaz de hacer que antiguos enemigos compartan moneda, parlamento y fronteras abiertas en menos de una generación. Francia y Alemania tuvieron tres guerras entre 1870 y 1945; desde 1945 no ha habido un solo conflicto entre estados miembros.',
      },
      {
        icono: '⚖️',
        texto: 'El derecho de la UE tiene primacía sobre el derecho nacional de los estados miembros: si una ley española contradice un reglamento europeo, prevalece el europeo. Este principio, establecido por el Tribunal de Justicia en 1964 (caso Costa/ENEL), es la piedra angular de la integración jurídica europea.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir la UE con un superestado europeo',
        cuerpo: 'La UE no es un estado federal. Los estados miembros mantienen ejércitos propios, sistemas fiscales independientes, servicios sanitarios nacionales y política exterior propia (con derecho de veto en el Consejo). La UE legisla en áreas específicas donde los estados le han cedido competencias: comercio, competencia, medioambiente, libre circulación. En todo lo demás, prevalece la soberanía nacional.',
      },
      {
        titulo: 'Creer que Bruselas toma todas las decisiones',
        cuerpo: 'La Comisión Europea, con sede en Bruselas, propone legislación pero no puede aprobarla sola. Toda norma europea necesita la aprobación del Consejo (ministros de los 27) y, en la mayoría de casos, también del Parlamento Europeo. Los estados miembros mantienen el control a través del Consejo y pueden bloquear cualquier propuesta que no les convenga.',
      },
      {
        titulo: 'Pensar que el BCE imprime dinero libremente para los estados',
        cuerpo: 'El BCE tiene un mandato principal: la estabilidad de precios (inflación cercana al 2%). Tiene prohibido financiar directamente a los estados miembros (el llamado bail-out). Los programas de compra de deuda (QE) son instrumentos de política monetaria para transmitir los tipos de interés, no financiación directa de déficits. Esta restricción fue uno de los puntos más duros de la crisis de la eurozona.',
      },
      {
        titulo: 'Asumir que todos los países de la UE usan el euro',
        cuerpo: 'Solo 20 de los 27 miembros de la UE forman la zona euro. Dinamarca, Suecia, Hungría, Polonia, Chequia, Rumanía y Bulgaria mantienen sus monedas nacionales. El Reino Unido nunca adoptó el euro durante sus 47 años de pertenencia a la CEE/UE. Además, 4 países fuera de la UE (Kosovo, Montenegro, Andorra y Mónaco) usan el euro de facto o por acuerdo.',
      },
    ],
  },
};
