import type { HistoriaData } from './types';

export const historiaAlemania: HistoriaData = {
  slug: 'historia-alemania',
  titulo: 'Historia de Alemania: Del Imperio al Motor de Europa',
  subtitulo: 'De la unificación bismarckiana al Tercer Reich, la guerra fría y el milagro de la reunificación',
  descripcionSEO: 'Cronología interactiva de la Historia de Alemania: del Segundo Reich de Bismarck (1871) a la Alemania actual. Imperio, República de Weimar, Nazismo, División, Muro de Berlín, Reunificación y liderazgo europeo en 10 hitos y 6 eras.',
  keywords: [
    'historia alemania cronología bismarck kaiser guillermo',
    'república weimar hiperinflación nazismo hitler shoah',
    'segunda guerra mundial tercer reich holocausto',
    'muro berlín rda rfa guerra fría división',
    'reunificación alemana kohl wirtschaftswunder merkel',
    'alemania europa motor económico siglo xxi',
  ],
  anioInicio: 1871,
  anioFin: 9999,

  hitos: [
    {
      id: 'segundo-reich',
      nombre: 'El Segundo Reich de Bismarck',
      anioInicio: 1871,
      anioFin: 1890,
      color: '#1565C0',
      categoria: 'imperial',
      descripcion: 'Bismarck unifica Alemania bajo Prusia tras la Guerra Franco-Prusiana. Proclamación del Imperio en Versalles (18 enero 1871). Guillermo I como Kaiser. Kulturkampf contra la Iglesia. Sistema de alianzas europeo de Bismarck. Primera potencia continental.',
      obraIconica: 'Proclamación del Imperio Alemán — Salón de los Espejos, Versalles, 18 enero 1871',
      paises: ['Alemania', 'Prussia', 'Francia'],
    },
    {
      id: 'wilhelminismo',
      nombre: 'La Era Guillermina y el Camino a la Guerra',
      anioInicio: 1890,
      anioFin: 1914,
      color: '#0277BD',
      categoria: 'imperial',
      descripcion: 'Guillermo II destituye a Bismarck y adopta el Weltpolitik (política mundial). Flota naval que desafía a Gran Bretaña. Triple Alianza con Austria y Austria-Hungría. La "paz armada": carrera de armamentos, crisis de Marruecos, Bosnia. Europa camina hacia la guerra.',
      obraIconica: 'La "raya" de Bismarck — caricatura de Punch (1890): el piloto abandona el barco',
      paises: ['Alemania', 'Austria-Hungría'],
    },
    {
      id: 'primera-guerra-mundial',
      nombre: 'Alemania en la Primera Guerra Mundial (1914-1918)',
      anioInicio: 1914,
      anioFin: 1918,
      color: '#B71C1C',
      categoria: 'guerra',
      descripcion: 'Alemania lucha en dos frentes: Francia al oeste (guerra de trincheras) y Rusia al este. Plan Schlieffen fracasa. La "guerra de desgaste" destruye una generación. Armisticio del 11 noviembre 1918 con el ejército alemán aún en suelo francés ("puñalada por la espalda").',
      obraIconica: 'Batalla de Verdún — febrero-diciembre 1916. 700.000 bajas. El símbolo del absurdo de la guerra total',
      paises: ['Alemania', 'Francia', 'Rusia', 'Gran Bretaña'],
    },
    {
      id: 'republica-weimar',
      nombre: 'La República de Weimar: Democracia Frágil',
      anioInicio: 1918,
      anioFin: 1933,
      color: '#F57F17',
      categoria: 'republica',
      descripcion: 'Primera democracia alemana: Constitución de Weimar (1919). Tratado de Versalles impone reparaciones de guerra. Hiperinflación (1923): un pan cuesta 200.000 millones de marcos. Crisis de 1929 destruye la economía. Hitler accede al poder legalmente (1933).',
      obraIconica: 'La hiperinflación de 1923 — billetes de marcos quemados como combustible. El trauma económico alemán',
      paises: ['Alemania'],
    },
    {
      id: 'tercer-reich',
      nombre: 'El Tercer Reich y el Nazismo',
      anioInicio: 1933,
      anioFin: 1945,
      color: '#880E4F',
      categoria: 'guerra',
      descripcion: 'Hitler canciller (1933), abolición de la democracia (1934). Rearme, Anschluss de Austria, Sudetenlandia. Shoah: asesinato sistemático de 6 millones de judíos. Segunda Guerra Mundial. La derrota total de 1945 deja Alemania en ruinas, ocupada y dividida.',
      obraIconica: 'La Conferencia de Wannsee — 20 enero 1942. Donde se planificó la Solución Final del genocidio judío',
      paises: ['Alemania', 'Austria', 'Polonia', 'Europa'],
    },
    {
      id: 'ocupacion-division',
      nombre: 'Ocupación, División y Guerra Fría',
      anioInicio: 1945,
      anioFin: 1961,
      color: '#37474F',
      categoria: 'division',
      descripcion: 'Alemania dividida en cuatro zonas de ocupación. RFA (Alemania Occidental) con Adenauer y economía social de mercado. RDA (Alemania Oriental) soviética. Plan Marshall reconstruye el Oeste. Moneda única (Deutschmark) 1948. Berlín bloqueado (1948-49). Bloque del Este consolidado.',
      obraIconica: 'Puente Aéreo de Berlín — 1948-1949. 277.500 vuelos en 11 meses para abastecer Berlín Occidental',
      paises: ['Alemania', 'EE.UU.', 'URSS', 'Gran Bretaña', 'Francia'],
    },
    {
      id: 'milagro-economico',
      nombre: 'El Milagro Económico Alemán (Wirtschaftswunder)',
      anioInicio: 1950,
      anioFin: 1970,
      color: '#1B5E20',
      categoria: 'economia',
      descripcion: 'La RFA pasa de ruinas a segunda economía mundial en 20 años. Volkswagen, Mercedes, Siemens. Gastarbeiter (trabajadores invitados) turcos y españoles. La socialdemocracia de Brandt. Ostpolitik: primera distensión con el Este. Alemania asume su responsabilidad histórica.',
      obraIconica: 'Volkswagen Escarabajo — el coche del pueblo que simboliza la reconstrucción alemana de posguerra',
      paises: ['Alemania Occidental', 'Turquía', 'España'],
    },
    {
      id: 'muro-berlin',
      nombre: 'El Muro de Berlín: Símbolo de la División',
      anioInicio: 1961,
      anioFin: 1989,
      color: '#4527A0',
      categoria: 'division',
      descripcion: 'RDA construye el Muro (13 agosto 1961) para frenar la huida masiva al Oeste. 155 km de hormigón, 45.000 soldados, 140 muertos intentando cruzarlo. Kennedy: "Ich bin ein Berliner" (1963). Movimientos de derechos civiles en la RDA. El muro cae el 9 noviembre 1989.',
      obraIconica: 'Caída del Muro de Berlín — 9 noviembre 1989. La imagen más icónica del fin de la Guerra Fría',
      paises: ['Alemania Oriental', 'Alemania Occidental', 'URSS'],
    },
    {
      id: 'reunificacion',
      nombre: 'Reunificación: Una Alemania',
      anioInicio: 1989,
      anioFin: 1995,
      color: '#558B2F',
      categoria: 'republica',
      descripcion: 'Caída del Muro → elecciones libres en la RDA → Unificación formal (3 octubre 1990). Kohl negocia la retirada soviética. Coste masivo: 1,6 billones de € en 10 años. La moneda única destruye la industria del Este. Integración social aún incompleta décadas después.',
      obraIconica: 'Unificación alemana — 3 octubre 1990. Día de la Unidad Alemana: una nación que tardó 45 años en reunirse',
      paises: ['Alemania', 'URSS', 'EE.UU.', 'Francia', 'Gran Bretaña'],
    },
    {
      id: 'alemania-siglo-xxi',
      nombre: 'Alemania: Motor de Europa en el Siglo XXI',
      anioInicio: 1995,
      anioFin: 9999,
      color: '#0D47A1',
      categoria: 'economia',
      descripcion: 'Alemania primera economía de la UE. Merkel: la canciller que gobernó 16 años (2005-2021). Agenda 2010 (Schroeder). Energiewende: transición energética. Crisis del euro: Alemania como prestamista de último recurso. Crisis refugiados 2015. Scholz, la transición post-Merkel.',
      obraIconica: 'Angela Merkel (2005-2021) — la líder más influyente de Europa durante 16 años consecutivos',
      paises: ['Alemania', 'Europa'],
    },
  ],

  eras: [
    {
      nombre: 'El Imperio Alemán (Kaiserreich)',
      desde: 1871,
      hasta: 1918,
      icono: '👑',
      hitosDestacados: [
        'El Segundo Reich de Bismarck',
        'La Era Guillermina y el Camino a la Guerra',
        'Alemania en la Primera Guerra Mundial (1914-1918)',
      ],
      eventos: [
        'Proclamación del Imperio en Versalles (18 enero 1871)',
        'Bismarck es destituido por Guillermo II (1890)',
        'Asesinato de Francisco Fernando: inicio de la Primera Guerra Mundial (1914)',
      ],
    },
    {
      nombre: 'La República de Weimar',
      desde: 1918,
      hasta: 1933,
      icono: '📜',
      hitosDestacados: [
        'La República de Weimar: Democracia Frágil',
      ],
      eventos: [
        'Revolución de noviembre: abdicación del Kaiser (1918)',
        'Hiperinflación: el marco se devalúa 1 billón de veces (1923)',
        'Gran Depresión destruye la economía alemana (1929)',
      ],
    },
    {
      nombre: 'El Tercer Reich',
      desde: 1933,
      hasta: 1945,
      icono: '⚠️',
      hitosDestacados: [
        'El Tercer Reich y el Nazismo',
      ],
      eventos: [
        'Hitler canciller de Alemania (1933)',
        'Invasión de Polonia: inicio de la Segunda Guerra Mundial (1939)',
        'Derrota total: Alemania capitula el 8 mayo (1945)',
      ],
    },
    {
      nombre: 'División y Guerra Fría',
      desde: 1945,
      hasta: 1970,
      icono: '🧱',
      hitosDestacados: [
        'Ocupación, División y Guerra Fría',
        'El Milagro Económico Alemán (Wirtschaftswunder)',
      ],
      eventos: [
        'RFA y RDA: dos estados alemanes (1949)',
        'RFA ingresa en la OTAN; RDA en el Pacto de Varsovia (1955)',
        'Kennedy en Berlín: "Ich bin ein Berliner" (1963)',
      ],
    },
    {
      nombre: 'El Muro y la Distensión',
      desde: 1970,
      hasta: 1989,
      icono: '🕊️',
      hitosDestacados: [
        'El Muro de Berlín: Símbolo de la División',
      ],
      eventos: [
        'Ostpolitik: Brandt normaliza relaciones con el Este (1972)',
        'Acuerdos de Helsinki: reconocimiento de fronteras (1975)',
        'Reagan en Berlín: "Tear down this wall" (1987)',
      ],
    },
    {
      nombre: 'Reunificación y Liderazgo Europeo',
      desde: 1989,
      hasta: 9999,
      icono: '🇩🇪',
      hitosDestacados: [
        'Reunificación: Una Alemania',
        'Alemania: Motor de Europa en el Siglo XXI',
      ],
      eventos: [
        '3 octubre: Reunificación formal de Alemania (1990)',
        'Angela Merkel: primera canciller mujer de Alemania (2005)',
        'Alemania lidera el fondo Next Generation EU (2020)',
      ],
    },
  ],

  categorias: {
    imperial: 'Imperio y Nación',
    guerra: 'Guerras y Conflictos',
    republica: 'República y Democracia',
    division: 'División y Guerra Fría',
    economia: 'Economía y Sociedad',
  },

  colores: {
    imperial: '#1565C0',
    guerra: '#B71C1C',
    republica: '#F57F17',
    division: '#37474F',
    economia: '#1B5E20',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'En 150 años, Alemania pasó de ser un mosaico de principados a unificarse, convertirse en la potencia más temida de Europa, desencadenar dos guerras mundiales, perpetrar uno de los mayores genocidios de la historia, ser dividida por el mundo y reunificarse para convertirse en el motor económico y político de la Unión Europea. Ningún otro país concentra tantos extremos en tan poco tiempo.',

    tablaComparativa: [
      {
        hito: 'El Imperio Alemán (Kaiserreich)',
        periodo: '1871-1918',
        categoria: 'Imperio y Nación',
        personaje: 'Bismarck / Guillermo II',
        aportacion: 'Unificación nacional, primera potencia continental, sistema de alianzas europeo',
      },
      {
        hito: 'La República de Weimar',
        periodo: '1918-1933',
        categoria: 'República y Democracia',
        personaje: 'Friedrich Ebert / Hindenburg',
        aportacion: 'Primera democracia alemana, acosada por hiperinflación, Versalles y la Gran Depresión',
      },
      {
        hito: 'El Tercer Reich',
        periodo: '1933-1945',
        categoria: 'Guerras y Conflictos',
        personaje: 'Adolf Hitler / Goebbels',
        aportacion: 'Totalitarismo, Shoah, Segunda Guerra Mundial, destrucción total de Alemania',
      },
      {
        hito: 'División y Guerra Fría',
        periodo: '1945-1970',
        categoria: 'División y Guerra Fría',
        personaje: 'Adenauer / Ulbricht',
        aportacion: 'Dos estados alemanes: la RFA (Alemania Occidental) y la RDA (Alemania Oriental). El Wirtschaftswunder',
      },
      {
        hito: 'El Muro y la Distensión',
        periodo: '1961-1989',
        categoria: 'División y Guerra Fría',
        personaje: 'Willy Brandt / Honecker',
        aportacion: 'Símbolo de la Guerra Fría. Ostpolitik. El muro como muro de la vergüenza',
      },
      {
        hito: 'Reunificación y Europa',
        periodo: '1990-presente',
        categoria: 'Economía y Sociedad',
        personaje: 'Kohl / Merkel / Scholz',
        aportacion: 'Una Alemania unida y líder de la UE. Motor económico y político de Europa',
      },
    ],

    escenarios: [
      {
        icono: '⚠️',
        titulo: '¿Por qué triunfó Hitler? ¿Podría repetirse?',
        perfil: 'Estudiantes de historia y política',
        texto: 'Hitler llegó al poder democráticamente en 1933, aprovechando el colapso económico, el trauma de Versalles y la fragmentación política de Weimar. La lección histórica es clara: la democracia puede destruirse desde dentro. El estudio de los mecanismos que permitieron el ascenso nazi —propaganda, emergencia económica, chivo expiatorio— sigue siendo la mejor vacuna contra el autoritarismo.',
      },
      {
        icono: '🏭',
        titulo: 'El milagro económico: cómo Alemania resurgió de las ruinas',
        perfil: 'Economistas y estudiantes de economía',
        texto: 'En 1945, Alemania era un montón de escombros con 7 millones de muertos. En 1970, era la segunda economía occidental. El Wirtschaftswunder fue posible por el Plan Marshall, la reforma monetaria de 1948, el modelo de economía social de mercado de Ludwig Erhard, la cultura del trabajo y los trabajadores invitados (Gastarbeiter). Un caso único en la historia económica del siglo XX.',
      },
      {
        icono: '🤝',
        titulo: 'Reunificación: ¿fue un éxito?',
        perfil: 'Analistas políticos y sociales',
        texto: 'La reunificación de 1990 fue un éxito político e institucional, pero dejó heridas sociales y económicas profundas. La industria del Este se derrumbó, el desempleo se disparó y surgió una "Mauer im Kopf" (muro en la cabeza): décadas después, las diferencias salariales, de renta y de actitud política entre Este y Oeste siguen siendo significativas. Un caso de estudio sobre los límites de la unificación forzada.',
      },
      {
        icono: '🌍',
        titulo: 'La responsabilidad histórica alemana: modelo para el mundo',
        perfil: 'Ciudadanos interesados en ética y memoria histórica',
        texto: 'Alemania es el único país que ha construido un sistema nacional de memoria y responsabilidad sobre sus crímenes históricos: monumentos, museos, educación obligatoria, indemnizaciones, leyes contra el negacionismo. La Erinnerungskultur (cultura del recuerdo) alemana se estudia en todo el mundo como modelo de cómo una nación puede asumir su pasado más oscuro sin negarlo.',
      },
    ],

    faq: [
      {
        pregunta: '¿Qué fue la República de Weimar?',
        respuesta: 'La República de Weimar (1918-1933) fue la primera democracia alemana, nacida tras la derrota en la Primera Guerra Mundial y la abdicación del Kaiser. Su nombre viene de la ciudad de Weimar, donde se redactó la constitución en 1919. Fue una democracia avanzada para su época, con voto femenino y derechos sociales, pero vivió perpetuamente acosada por las reparaciones del Tratado de Versalles, la hiperinflación de 1923, la Gran Depresión de 1929 y la polarización política extrema que la llevó a su colapso.',
        tip: 'La Constitución de Weimar inspiró directamente a la Ley Fundamental alemana de 1949, que incorporó las lecciones de sus fracasos.',
      },
      {
        pregunta: '¿Cómo se llamaba Alemania antes de ser Alemania?',
        respuesta: 'Antes de la unificación de 1871, el territorio alemán estaba fragmentado en decenas de principados, ducados y reinos independientes agrupados vagamente bajo el Sacro Imperio Romano Germánico (800-1806) y luego bajo la Confederación Germánica (1815-1866). La unificación bajo Prusia y el liderazgo de Bismarck en 1871 creó el primer Estado alemán unificado: el Deutsches Reich (Imperio Alemán).',
        tip: 'El nombre "Alemania" en otros idiomas varía mucho: Germany (inglés), Allemagne (francés), Germania (italiano), Deutschland (alemán). Cada uno refleja una tribu germánica diferente.',
      },
      {
        pregunta: '¿Cuándo se construyó el Muro de Berlín?',
        respuesta: 'El Muro de Berlín se construyó de forma repentina durante la noche del 12 al 13 de agosto de 1961, por orden del gobierno de la RDA (Alemania Oriental). La razón fue frenar la huida masiva de ciudadanos al Oeste: en los años previos, habían escapado más de 3 millones de personas. El Muro tenía 155 km de longitud, y al menos 140 personas murieron intentando cruzarlo. Cayó el 9 de noviembre de 1989.',
        tip: 'La RDA lo llamaba oficialmente "Muro de Protección Antifascista". El mundo lo conoció como "Muro de la Vergüenza".',
      },
      {
        pregunta: '¿Qué es el Wirtschaftswunder?',
        respuesta: 'El Wirtschaftswunder (literalmente "milagro económico") describe el extraordinario crecimiento económico de la República Federal Alemana (Alemania Occidental) entre 1950 y 1970. Partiendo de un país destruido, la RFA alcanzó el pleno empleo, triplicó su PIB y se convirtió en la segunda economía de Occidente. Sus pilares fueron el Plan Marshall, la reforma monetaria de 1948, el modelo de "economía social de mercado" de Ludwig Erhard, y la industria manufacturera de exportación (automóviles, maquinaria, química).',
      },
      {
        pregunta: '¿Cómo fue posible el Holocausto?',
        respuesta: 'El Holocausto fue el resultado de la convergencia de varios factores: la ideología antisemita radical del nazismo presentada como solución a los problemas de Alemania, un aparato burocrático-industrial eficiente puesto al servicio del genocidio, la obediencia de funcionarios y soldados ordinarios ("banalidad del mal", en palabras de Hannah Arendt), la complicidad o pasividad de la población civil y de otros gobiernos, y la total impunidad durante la guerra. La historiografía moderna subraya que no fue obra de un único líder demoníaco, sino de un sistema.',
        tip: 'El término "Shoah" (catástrofe, en hebreo) es preferido por muchas comunidades judías al término "Holocausto" (sacrificio por fuego), que tiene connotaciones religiosas inadecuadas.',
      },
    ],

    pasos: [
      {
        titulo: 'Comienza por el Kaiser y Bismarck (1871-1890)',
        cuerpo: 'El punto de partida es entender por qué Alemania se unificó tan tarde (1871, cuando Francia llevaba siglos unificada) y cómo Bismarck lo logró a través de tres guerras estratégicas. El "canciller de hierro" construyó el Estado alemán y el sistema de alianzas europeo que trató de mantener la paz. Guillermo II lo destruyó al destituirlo en 1890.',
      },
      {
        titulo: 'Entiende la Primera Guerra Mundial como herida fundacional',
        cuerpo: 'Alemania no perdió la Primera Guerra en el campo de batalla: el Armisticio se firmó con el ejército en suelo enemigo. El mito de la "puñalada por la espalda" —que la culpa fue de los políticos civiles— envenenó la República de Weimar desde su nacimiento. El humillante Tratado de Versalles (reparaciones, pérdida de territorios, "culpabilidad de guerra") fue el combustible que alimentó al nazismo.',
      },
      {
        titulo: 'Estudia la República de Weimar como democracia acosada',
        cuerpo: 'Weimar fue una democracia pionera destruida por sus enemigos internos y externos. La hiperinflación de 1923 (cuando un dólar llegó a valer 4,2 billones de marcos), la Gran Depresión de 1929 y la polarización entre comunistas y nazis dejaron sin espacio al centro democrático. Hitler no tomó el poder por la fuerza: fue nombrado canciller legalmente el 30 enero 1933.',
      },
      {
        titulo: 'El Nazismo y la Shoah: entender lo incomprensible',
        cuerpo: 'El Tercer Reich duró solo 12 años (1933-1945) pero dejó 60 millones de muertos y el mayor genocidio planificado de la historia moderna. Estudia las etapas: la consolidación del poder (1933-36), la expansión territorial (1936-39), la guerra total (1939-45) y la "Solución Final" planificada en Wannsee (1942). La pregunta histórica clave: ¿cuánto sabía la población alemana?',
      },
      {
        titulo: 'Guerra Fría y reunificación: el final del siglo XX alemán',
        cuerpo: 'Las dos Alemanias (RFA y RDA) fueron el laboratorio donde se enfrentaron el capitalismo y el socialismo durante 40 años. La caída del Muro el 9 noviembre 1989 fue uno de los momentos más emotivos del siglo XX. La reunificación (3 octubre 1990) fue un éxito político pero un proceso social y económico de décadas. La "Mauer im Kopf" (muro mental entre Este y Oeste) sigue existiendo hoy.',
      },
    ],

    tips: [
      {
        icono: '📅',
        texto: 'Alemania es un país joven: tiene solo 150 años como Estado unificado. España, Francia o Gran Bretaña llevan siglos de unidad nacional. Esta juventud estatal explica en parte la turbulencia de su historia: buscando su identidad nacional en tiempo récord, Alemania pasó del Imperio al nazismo y de la división a la reunificación en menos de un siglo.',
      },
      {
        icono: '🗺️',
        texto: 'La posición geográfica de Alemania es clave: en el corazón de Europa, sin barreras naturales significativas, rodeada de grandes potencias. Eso la obligó históricamente a buscar alianzas o a construir ejércitos potentes. La frase de Bismarck captura el dilema: "Los alemanes temen a Dios y a nada más en el mundo, pero es precisamente el temor a Dios el que nos lleva a amar y cultivar la paz".',
      },
      {
        icono: '🏭',
        texto: 'El modelo económico alemán (Soziale Marktwirtschaft, economía social de mercado) es una tercera vía entre el capitalismo puro y el socialismo: mercado libre con un Estado del bienestar robusto, cogobierno de trabajadores en las empresas (Mitbestimmung) y bancos regionales que financian a largo plazo. Este modelo explica tanto el Wirtschaftswunder como la resiliencia económica alemana actual.',
      },
      {
        icono: '🧠',
        texto: 'Alemania es el único país del mundo con una cultura institucionalizada de memoria y responsabilidad histórica (Erinnerungskultur). Los alemanes aprenden sobre el nazismo y el Holocausto desde primaria. Hay 18.000 memoriales y lugares de recuerdo en todo el país. Negar el Holocausto es delito penal. Este modelo de "trabajar el pasado" (Vergangenheitsbewältigung) se estudia en todo el mundo.',
      },
    ],

    errores: [
      {
        titulo: 'Que todos los alemanes apoyaron a Hitler',
        cuerpo: 'El NSDAP nunca obtuvo más del 37% en elecciones libres (julio 1932). Hitler llegó al poder por una coalición política que creyó poder controlarlo, no por el voto mayoritario. Una vez en el poder, la represión, la propaganda y el terror explican la aparente unanimidad. Millones de alemanes fueron perseguidos, encarcelados o asesinados por el régimen. La complicidad fue gradual, diferenciada y en muchos casos forzada.',
      },
      {
        titulo: 'Que la RDA era igual de represiva que la URSS estalinista',
        cuerpo: 'La RDA tenía uno de los servicios secretos más eficientes del mundo (la Stasi, con 91.000 agentes y 200.000 informantes), pero su nivel de represión nunca alcanzó el del estalinismo soviético. La RDA no tuvo gulags masivos ni purgas de millones. Era un Estado autoritario que controlaba exhaustivamente a su población mediante vigilancia y delación, no principalmente mediante terror masivo físico. La diferencia importa para entender por qué muchos ciudadanos de la RDA no la percibían como una dictadura "clásica".',
      },
      {
        titulo: 'Que la reunificación fue fácil o inmediata',
        cuerpo: 'La unificación política fue rápida (1990), pero la integración económica y social lleva décadas y aún está incompleta. El coste de la reunificación superó 1,6 billones de euros en transferencias del Oeste al Este. La industria de la RDA se derrumbó casi completamente, generando un desempleo masivo. Treinta años después, el PIB per cápita del Este sigue siendo un 20% inferior al del Oeste, y las diferencias de mentalidad ("Mauer im Kopf") son reconocidas por los propios alemanes.',
      },
      {
        titulo: 'Que Alemania siempre fue un solo país',
        cuerpo: 'Alemania se unificó en 1871, mucho después que otros grandes países europeos. Durante siglos, el territorio alemán fue un mosaico de principados, ducados y reinos independientes. Incluso después de 1871, Alemania ha estado dividida más tiempo que unida como Estado moderno: del Imperio de 1871 al Estado nazi de 1945 (74 años), y de la reunificación de 1990 al presente (35 años), frente a los 45 años de división (1945-1990).',
      },
    ],
  },
};
