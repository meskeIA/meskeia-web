import type { HistoriaData } from './types';

export const historiaAustriaHungria: HistoriaData = {
  slug: 'historia-austria-hungria',
  titulo: 'El Imperio Austro-Húngaro: La Última Gran Monarquía Multinacional',
  subtitulo: 'De Napoleón y el Congreso de Viena al asesinato de Sarajevo y el derrumbe de 1918',
  descripcionSEO: 'Cronología interactiva del Imperio Austro-Húngaro: del fin del Sacro Imperio Romano (1806) y el Congreso de Viena (1815) al Compromiso de 1867, la Viena de Freud y Klimt, el asesinato de Sarajevo (1914) y el derrumbe de 1918. 10 hitos y 6 eras de la última gran monarquía multinacional de Europa.',
  keywords: [
    'imperio austro-húngaro cronología',
    'francisco josé habsburgo austria hungría',
    'congreso de viena metternich restauración',
    'compromiso 1867 ausgleich monarquía dual',
    'viena belle époque freud klimt modernidad',
    'sarajevo asesinato francisco fernando primera guerra mundial',
    'estados sucesores austria hungría 1918',
  ],
  anioInicio: 1804,
  anioFin: 9999,

  hitos: [
    {
      id: 'napoleon-habsburgos',
      nombre: 'Napoleón y el Fin del Sacro Imperio Romano',
      anioInicio: 1804,
      anioFin: 1815,
      color: '#1565C0',
      categoria: 'politica',
      descripcion: 'Francisco II disuelve el Sacro Imperio Romano Germánico (1806) ante el avance de Napoleón y se proclama Emperador de Austria. La derrota de Austerlitz (1805) humilla a los Habsburgo. El matrimonio de Napoleón con María Luisa de Austria (1810) marca la humillación máxima. El Congreso de Viena (1815) restaura el orden conservador europeo con Austria a la cabeza.',
      obraIconica: 'Batalla de Austerlitz — 2 diciembre 1805. Napoleón derrota al ejército austro-ruso: la mayor victoria napoleónica',
      paises: ['Austria', 'Francia', 'Prusia', 'Rusia'],
    },
    {
      id: 'metternich-restauracion',
      nombre: 'Metternich y el Orden Conservador Europeo',
      anioInicio: 1815,
      anioFin: 1848,
      color: '#0277BD',
      categoria: 'politica',
      descripcion: 'El canciller Klemens von Metternich convierte a Austria en el gendarme de Europa: el Sistema Metternich suprime el liberalismo y el nacionalismo en todo el continente. La Santa Alianza. Austria domina los estados italianos y alemanes. Treinta años de paz europea a cambio de represión política.',
      obraIconica: 'Klemens von Metternich — el arquitecto del orden conservador europeo (1815-1848)',
      paises: ['Austria', 'Prusia', 'Rusia', 'Italia', 'Alemania'],
    },
    {
      id: 'primavera-pueblos',
      nombre: 'La Primavera de los Pueblos: El Imperio Tiembla',
      anioInicio: 1848,
      anioFin: 1849,
      color: '#C62828',
      categoria: 'guerra',
      descripcion: 'Las revoluciones de 1848 sacuden el Imperio simultáneamente: Viena, Budapest, Praga, Milán se levantan. Francisco José, de 18 años, sube al trono y aplasta todas las rebeliones con ayuda rusa en Hungría. El liberalismo es derrotado, pero los nacionalismos han mostrado su fuerza. El Imperio sobrevive, pero ya no puede ignorar las tensiones internas.',
      obraIconica: 'Revolución de Viena — marzo 1848. Metternich huye disfrazado. El orden europeo se derrumba por un mes',
      paises: ['Austria', 'Hungría', 'Italia', 'Bohemia'],
    },
    {
      id: 'francisco-jose-absolutismo',
      nombre: 'Francisco José: El Reinado Más Largo de Europa',
      anioInicio: 1849,
      anioFin: 1867,
      color: '#37474F',
      categoria: 'politica',
      descripcion: 'Francisco José gobierna con mano dura tras 1848: absolutismo neobarroco, burocracia centralizada, concordato con la Iglesia. Las derrotas militares fuerzan los cambios: Solferino (1859) pierde el norte de Italia, Sadowa (1866) expulsa a Austria del espacio alemán. Prusia eclipsa a Austria. El Imperio debe adaptarse o morir.',
      obraIconica: 'Batalla de Sadowa — 3 julio 1866. Prusia derrota a Austria: fin de la hegemonía habsburguesa en Alemania',
      paises: ['Austria', 'Prusia', 'Italia', 'Francia'],
    },
    {
      id: 'compromiso-1867',
      nombre: 'El Compromiso Austro-Húngaro: Nace la Dualidad',
      anioInicio: 1867,
      anioFin: 1880,
      color: '#7B1FA2',
      categoria: 'politica',
      descripcion: 'El Ausgleich (Compromiso) de 1867 crea la Monarquía Dual: Austria-Hungría, dos estados con un solo monarca. Francisco José es Emperador de Austria y Rey de Hungría. El magiar Ferenc Deák negocia la autonomía húngara. Nace uno de los estados más complejos de la historia: 11 naciones, 50 millones de personas, 11 lenguas.',
      obraIconica: 'El Compromiso Austro-Húngaro — 8 junio 1867. Francisco José coronado Rey de Hungría en Budapest. Nace el Imperio Dual',
      paises: ['Austria', 'Hungría', 'Bohemia', 'Croacia', 'Eslovenia'],
    },
    {
      id: 'viena-belle-epoque',
      nombre: 'Viena: Capital de la Modernidad',
      anioInicio: 1880,
      anioFin: 1914,
      color: '#FF8C00',
      categoria: 'cultura',
      descripcion: 'Viena fin de siglo es la capital cultural del mundo: Sigmund Freud revoluciona la psicología, Gustav Klimt y la Secesión renuevan el arte, Gustav Mahler y Arnold Schoenberg transforman la música, Ludwig Wittgenstein la filosofía, Arthur Schnitzler la literatura. El Ringstrasse, la Ópera, el Burgtheater. La modernidad nace en Viena.',
      obraIconica: 'El Beso — Gustav Klimt, 1907-1908. El símbolo del esplendor cultural vienés. Arte, erotismo y oro en el ocaso del Imperio',
      paises: ['Austria', 'Hungría'],
    },
    {
      id: 'balcanes-nacionalismos',
      nombre: 'Los Balcanes y la Bomba de Relojería Nacional',
      anioInicio: 1878,
      anioFin: 1914,
      color: '#880E4F',
      categoria: 'nacionalismos',
      descripcion: 'Austria ocupa Bosnia-Herzegovina (1878) y la anexiona (1908): crisis internacional. El paneslavismo serbio amenaza la cohesión del Imperio. Los checos, eslovacos, croatas, eslovenos, rumanos y polacos exigen autonomía. El asesinato del archiduque Francisco Fernando en Sarajevo (28 junio 1914) es el detonador.',
      obraIconica: 'Asesinato de Francisco Fernando — 28 junio 1914. Gavrilo Princip dispara en Sarajevo. El comienzo del fin del mundo viejo',
      paises: ['Austria', 'Hungría', 'Serbia', 'Bosnia', 'Rusia'],
    },
    {
      id: 'gran-guerra-austria',
      nombre: 'Austria-Hungría en la Gran Guerra',
      anioInicio: 1914,
      anioFin: 1916,
      color: '#B71C1C',
      categoria: 'guerra',
      descripcion: 'Austria-Hungría declara la guerra a Serbia el 28 julio 1914 e inicia la Primera Guerra Mundial. Lucha en tres frentes: Serbia, Rusia y Italia. El ejército multinacional sufre enormes pérdidas. Francisco José muere en noviembre de 1916 tras 68 años de reinado: el símbolo viviente del Imperio desaparece.',
      obraIconica: 'Muerte de Francisco José — 21 noviembre 1916. 68 años en el trono. Con él muere la ilusión de que el Imperio podía sobrevivir',
      paises: ['Austria', 'Hungría', 'Serbia', 'Rusia', 'Italia', 'Alemania'],
    },
    {
      id: 'derrumbe-1918',
      nombre: 'El Derrumbe del Imperio',
      anioInicio: 1916,
      anioFin: 1918,
      color: '#5D4037',
      categoria: 'guerra',
      descripcion: 'El joven Emperador Carlos I intenta reformas desesperadas, pero es demasiado tarde. Los aliados apoyan las aspiraciones de independencia de los pueblos del Imperio. En octubre-noviembre de 1918, el Imperio se desintegra en días: Polonia, Checoslovaquia, Yugoslavia, Austria y Hungría se proclaman estados independientes. El 11 noviembre el Imperio deja de existir.',
      obraIconica: 'Proclamación de la República de Austria — 12 noviembre 1918. El día después del armisticio: el Imperio se disuelve en 24 horas',
      paises: ['Austria', 'Hungría', 'Polonia', 'Checoslovaquia', 'Yugoslavia'],
    },
    {
      id: 'legado-habsburgo',
      nombre: 'Los Estados Sucesores y el Legado Habsburgo',
      anioInicio: 1918,
      anioFin: 9999,
      color: '#2E7D32',
      categoria: 'legado',
      descripcion: 'El Imperio se fragmenta en Austria, Hungría, Checoslovaquia, Yugoslavia, Polonia y partes de Rumanía e Italia. El "sueño de Versalles": estados nacionales que no resuelven los problemas del Imperio. La región vive el entreguerras, la Segunda Guerra Mundial, el comunismo y finalmente la integración europea. La UE es en muchos aspectos la reinvención del proyecto multiétnico habsburguesa.',
      obraIconica: 'Tratado de Saint-Germain — 10 septiembre 1919. El Imperio Austro-Húngaro queda dividido en 7 estados sucesores',
      paises: ['Austria', 'Hungría', 'Checoslovaquia', 'Yugoslavia', 'Polonia', 'Rumanía'],
    },
  ],

  eras: [
    {
      nombre: 'Del Sacro Imperio al Imperio Austríaco',
      desde: 1804,
      hasta: 1848,
      icono: '👑',
      hitosDestacados: [
        'Napoleón y el Fin del Sacro Imperio Romano',
        'Metternich y el Orden Conservador Europeo',
      ],
      eventos: [
        '1806: Disolución del Sacro Imperio Romano Germánico',
        '1815: Congreso de Viena — Metternich diseña la Europa conservadora',
        '1835: Muerte de Francisco I — sube Fernando I',
      ],
    },
    {
      nombre: 'Revoluciones y Consolidación',
      desde: 1848,
      hasta: 1867,
      icono: '⚡',
      hitosDestacados: [
        'La Primavera de los Pueblos: El Imperio Tiembla',
        'Francisco José: El Reinado Más Largo de Europa',
      ],
      eventos: [
        '1848: Revolución de Viena — Metternich huye disfrazado',
        '1859: Derrota de Solferino — Austria pierde el norte de Italia',
        '1866: Sadowa — Prusia derrota a Austria y domina Alemania',
      ],
    },
    {
      nombre: 'La Monarquía Dual: Austria-Hungría',
      desde: 1867,
      hasta: 1900,
      icono: '⚖️',
      hitosDestacados: [
        'El Compromiso Austro-Húngaro: Nace la Dualidad',
      ],
      eventos: [
        '1867: Ausgleich — nace la Monarquía Dual',
        '1878: Austria ocupa Bosnia-Herzegovina',
        '1889: Trágico suicidio del Príncipe heredero Rodolfo en Mayerling',
      ],
    },
    {
      nombre: 'La Belle Époque Vienesa',
      desde: 1900,
      hasta: 1914,
      icono: '🎨',
      hitosDestacados: [
        'Viena: Capital de la Modernidad',
        'Los Balcanes y la Bomba de Relojería Nacional',
      ],
      eventos: [
        '1905: Freud publica Tres ensayos sobre teoría sexual',
        '1908: Austria anexiona Bosnia — crisis internacional',
        '1914: Asesinato de Francisco Fernando en Sarajevo (28 junio)',
      ],
    },
    {
      nombre: 'La Gran Guerra y el Derrumbe',
      desde: 1914,
      hasta: 1918,
      icono: '💥',
      hitosDestacados: [
        'Austria-Hungría en la Gran Guerra',
        'El Derrumbe del Imperio',
      ],
      eventos: [
        '1914: Austria declara la guerra a Serbia (28 julio)',
        '1916: Muerte de Francisco José tras 68 años de reinado',
        '1918: El Imperio se disuelve en días — noviembre 1918',
      ],
    },
    {
      nombre: 'Los Estados Sucesores y el Legado',
      desde: 1918,
      hasta: 9999,
      icono: '🗺️',
      hitosDestacados: [
        'Los Estados Sucesores y el Legado Habsburgo',
      ],
      eventos: [
        '1919: Tratado de Saint-Germain — 7 estados sucesores',
        '1938: Anschluss — Hitler incorpora Austria al Tercer Reich',
        '1993: Divorcio de terciopelo — Checoslovaquia se divide pacíficamente',
      ],
    },
  ],

  categorias: {
    politica: 'Política e Instituciones',
    guerra: 'Guerras y Conflictos',
    cultura: 'Cultura y Modernidad',
    nacionalismos: 'Nacionalismos y Tensiones',
    legado: 'Legado y Sucesión',
  },

  colores: {
    politica: '#1565C0',
    guerra: '#C62828',
    cultura: '#FF8C00',
    nacionalismos: '#7B1FA2',
    legado: '#2E7D32',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'El Imperio Austro-Húngaro fue el experimento político más ambicioso antes de la Unión Europea: gobernar en paz a 11 naciones, 50 millones de personas y 11 lenguas bajo una sola corona. Viena fue la capital de la modernidad — donde nacieron el psicoanálisis, la música dodecafónica y el expresionismo — y al mismo tiempo la capital de un Imperio condenado por los nacionalismos que no supo integrar. Su derrumbe en 1918 creó los problemas que todavía hoy sacuden Europa Central.',

    tablaComparativa: [
      {
        hito: 'Del Sacro Imperio al Imperio Austríaco',
        periodo: '1804-1848',
        categoria: 'Política e Instituciones',
        personaje: 'Francisco II / Metternich',
        aportacion: 'Nuevo Imperio de Austria, Sistema Metternich, hegemonía conservadora en Europa',
      },
      {
        hito: 'Revoluciones y Consolidación',
        periodo: '1848-1867',
        categoria: 'Guerras y Conflictos',
        personaje: 'Francisco José I',
        aportacion: 'Supresión de las revoluciones, derrotas militares que fuerzan la reforma interna',
      },
      {
        hito: 'La Monarquía Dual: Austria-Hungría',
        periodo: '1867-1900',
        categoria: 'Política e Instituciones',
        personaje: 'Francisco José / Ferenc Deák',
        aportacion: 'Ausgleich: doble corona, doble parlamento, doble ministerio bajo un monarca',
      },
      {
        hito: 'La Belle Époque Vienesa',
        periodo: '1900-1914',
        categoria: 'Cultura y Modernidad',
        personaje: 'Freud / Klimt / Mahler',
        aportacion: 'Psicoanálisis, Secesión vienesa, música dodecafónica, filosofía analítica',
      },
      {
        hito: 'La Gran Guerra y el Derrumbe',
        periodo: '1914-1918',
        categoria: 'Guerras y Conflictos',
        personaje: 'Francisco José / Carlos I',
        aportacion: 'Detonador de la Primera Guerra Mundial, desintegración del Imperio en días',
      },
      {
        hito: 'Los Estados Sucesores y el Legado',
        periodo: '1918-presente',
        categoria: 'Legado y Sucesión',
        personaje: 'Carlos I / Tratado Saint-Germain',
        aportacion: '7 estados sucesores, legado jurídico-cultural habsburguesa, precursor de la integración europea',
      },
    ],

    escenarios: [
      {
        icono: '🏛️',
        titulo: '¿Por qué fue Viena la capital cultural del mundo en 1900?',
        perfil: 'Curiosidad histórica y cultural',
        texto: 'La Viena de 1900 era una contradicción fecunda: una capital imperial en declive político que vivía una explosión cultural sin precedentes. La tensión entre el orden habsburguesa y la modernidad acelerada produjo a Freud (psicoanálisis), Klimt (Secesión), Mahler (sinfonía moderna), Schoenberg (dodecafonismo), Wittgenstein (filosofía analítica) y Schnitzler (literatura psicológica). La crisis del Imperio fue el caldo de cultivo de la modernidad occidental.',
      },
      {
        icono: '🤔',
        titulo: '¿Podría haberse salvado el Imperio?',
        perfil: 'Historia contrafactual',
        texto: 'Historiadores como Alan Sked argumentan que el Imperio tenía futuro: era la única estructura capaz de gestionar la diversidad étnica de Europa Central. El Ausgleich de 1867 solo satisfizo a los magiares; si se hubiera extendido a checos, croatas y polacos (el "Trialismo"), el Imperio podría haber sobrevivido. El archiduque Francisco Fernando era favorable a estas reformas — su asesinato eliminó la posibilidad de una federación plurinacional.',
      },
      {
        icono: '💣',
        titulo: 'El asesinato de Sarajevo: ¿inevitable o accidente histórico?',
        perfil: 'Causas de la Primera Guerra Mundial',
        texto: 'El 28 de junio de 1914, Gavrilo Princip mató a Francisco Fernando en Sarajevo — pero el coche del archiduque solo pasó por delante de Princip porque el conductor se equivocó de ruta. ¿Fue un accidente? Las tensiones eran reales, pero la guerra no era inevitable. La decisión de Viena de emitir un ultimátum a Serbia fue una elección política deliberada. La historiografía moderna (Christopher Clark, "Los sonámbulos") reparte la responsabilidad entre todas las grandes potencias.',
      },
      {
        icono: '🇪🇺',
        titulo: 'La UE como reinvención del proyecto habsburguesa',
        perfil: 'Historia e integración europea',
        texto: 'El Imperio Austro-Húngaro gobernó durante décadas a checos, polacos, húngaros, croatas, eslovenos, rumanos y austriacos bajo un sistema de leyes comunes, moneda común y libre circulación. La Unión Europea hace exactamente lo mismo — con democracia en lugar de monarquía. No es casualidad que los estados del antiguo Imperio (Austria, Hungría, República Checa, Eslovaquia, Eslovenia, Croacia) sean todos miembros fundadores o tempranos de la UE.',
      },
    ],

    faq: [
      {
        pregunta: '¿Qué diferencia había entre Austria y Hungría en el Imperio Dual?',
        respuesta: 'Tras el Ausgleich de 1867, Austria y Hungría eran dos estados casi independientes con sus propios parlamentos, gobiernos, ejércitos (Honvéd húngaro) y sistemas legales, unidos solo en tres ministerios comunes: Exteriores, Guerra y Finanzas (para pagar la guerra). Francisco José era Emperador en Viena y Rey en Budapest. Los húngaros eran la nación privilegiada del Imperio — no así checos, eslovacos o croatas.',
        tip: 'El Ausgleich se renovaba cada diez años con negociaciones tensas sobre el reparto de gastos comunes.',
      },
      {
        pregunta: '¿Qué lengua hablaban en Austria-Hungría?',
        respuesta: 'El Imperio tenía 11 lenguas reconocidas: alemán, húngaro, checo, polaco, ucraniano (ruteno), esloveno, serbocroata, rumano, eslovaco, italiano y yiddish. El alemán era la lengua de la burocracia imperial y el ejército. El húngaro dominaba en Transleitania (la mitad húngara). Un oficial del ejército imperial debía hablar al menos cuatro idiomas para dar órdenes a sus soldados.',
        tip: 'El escritor Stefan Zweig describió la Viena imperial como "el mundo de ayer" — una ciudad donde convivían todas las lenguas y culturas de Europa.',
      },
      {
        pregunta: '¿Por qué Freud era austriaco pero escribía en alemán?',
        respuesta: 'Freud nació en Freiberg, Moravia (hoy República Checa), en una familia judía de lengua alemana. Se trasladó a Viena con 4 años y pasó toda su vida allí. El alemán era la lengua de la cultura y la ciencia en el Imperio. La identidad de Freud era vienesa y austriaca — aunque él se consideraba principalmente judío. Fue deportado a Londres en 1938 cuando los nazis ocuparon Austria.',
        tip: 'Muchos de los fundadores de la modernidad cultural vienesa — Freud, Mahler, Schnitzler, Wittgenstein — eran judíos asimilados.',
      },
      {
        pregunta: '¿Quién fue Francisco José?',
        respuesta: 'Francisco José I (1830-1916) gobernó durante 68 años, el reinado más largo de cualquier monarca europeo moderno. Subió al trono con 18 años durante la revolución de 1848 y murió mientras su Imperio desangraba en la Gran Guerra. Su vida estuvo marcada por la tragedia personal: su esposa Sissi fue asesinada, su hijo Rodolfo se suicidó, su sobrino Francisco Fernando (heredero) fue asesinado en Sarajevo.',
        tip: 'Francisco José firmaba documentos de estado desde las 5 de la mañana hasta las 11 de la noche — era la encarnación de la burocracia habsburguesa.',
      },
      {
        pregunta: '¿Qué países nacieron del Imperio Austro-Húngaro?',
        respuesta: 'Del Imperio surgieron directamente: Austria, Hungría, Checoslovaquia (hoy Chequia y Eslovaquia) y el Reino de los Serbios, Croatas y Eslovenos (hoy Yugoslavia, luego Serbia, Croacia, Eslovenia, Bosnia-Herzegovina, Montenegro y Macedonia del Norte). Además, Transilvania pasó a Rumanía, Galitzia a Polonia y Trieste con el litoral adriático a Italia. En total, el Imperio se fragmentó en más de 10 estados.',
        tip: 'Muchas de las fronteras actuales de Europa Central fueron trazadas entre 1918 y 1920 en los tratados de Saint-Germain, Trianon y Neuilly.',
      },
    ],

    pasos: [
      {
        titulo: 'Los Habsburgo: la dinastía más longeva de Europa',
        cuerpo: 'Los Habsburgo gobernaron Austria durante más de 600 años (1273-1918). Su política exterior se basó en el matrimonio más que en la guerra ("Bella gerant alii, tu felix Austria nube" — "Que otros hagan la guerra; tú, feliz Austria, cásate"). El Imperio Austro-Húngaro fue su última encarnación: la síntesis de siglos de acumulación territorial mediante alianzas dinásticas.',
      },
      {
        titulo: 'El Congreso de Viena: Europa se rediseña',
        cuerpo: 'Tras la derrota de Napoleón, las grandes potencias se reunieron en Viena (1814-1815) para rediseñar el mapa de Europa. Metternich fue el gran organizador: creó el "Concierto Europeo", un sistema de equilibrio entre potencias que mantuvo la paz durante 40 años. Austria recuperó sus territorios y consolidó su hegemonía sobre los estados alemanes e italianos.',
      },
      {
        titulo: 'El Ausgleich de 1867: la solución al problema húngaro',
        cuerpo: 'Tras las derrotas de Solferino (1859) y Sadowa (1866), Francisco José necesitaba estabilidad interna. Los húngaros, liderados por Ferenc Deák, ofrecieron lealtad a cambio de autonomía. El Compromiso creó la Monarquía Dual: dos estados con un solo monarca, tres ministerios comunes y una cuota compartida de gastos. Fue una solución brillante para un problema irresoluble — pero dejó fuera a otras 9 naciones.',
      },
      {
        titulo: 'La Belle Époque vienesa: modernidad en el ocaso',
        cuerpo: 'La Viena de 1880-1914 vivió una paradoja: era la capital de un Imperio en declive que producía la cultura más innovadora del mundo. El Ringstrasse era el escaparate arquitectónico del poder imperial; la Secesión (Klimt, Schiele) rompía con ese academicismo; el Café Central era el laboratorio de ideas donde se reunían Freud, Trotsky, Wittgenstein y Herzl. Una ciudad que pensaba en el futuro mientras el presente se desmoronaba.',
      },
      {
        titulo: 'El derrumbe de 1918: el fin del mundo de ayer',
        cuerpo: 'En octubre-noviembre de 1918, el Imperio Austro-Húngaro tardó menos de un mes en desintegrarse. El 28 de octubre se proclamó Checoslovaquia, el 29 el Estado de los Eslovenos, Croatas y Serbios, el 31 la República Húngara, el 12 de noviembre la República de Austria. Carlos I abdicó sin renunciar formalmente. El escritor Stefan Zweig llamó a esto "el mundo de ayer": una civilización que desapareció de la noche a la mañana.',
      },
    ],

    tips: [
      {
        icono: '🗓️',
        texto: 'El año 9999 en la línea del tiempo representa "presente": el legado del Imperio Austro-Húngaro sigue vivo en la arquitectura de Viena, Budapest y Praga, en la cocina centroeuropea (el schnitzel, el strudel, el goulash), en los sistemas legales y en la propia estructura de la Unión Europea.',
      },
      {
        icono: '🏙️',
        texto: 'Viena, Budapest, Praga, Cracovia, Ljubljana, Sarajevo y Trieste eran todas capitales o grandes ciudades del mismo Imperio. Hoy pertenecen a 7 países diferentes. Visitar estas ciudades es hacer un viaje por los fragmentos de lo que fue una sola entidad política.',
      },
      {
        icono: '📖',
        texto: 'Para entender el Imperio en su esplendor y decadencia, leer "El mundo de ayer" de Stefan Zweig (memorias), "La marcha Radetzky" de Joseph Roth (novela) o ver la serie "Sissi" con más rigor histórico que las películas clásicas. Los tres retratan el mismo mundo desde ángulos complementarios.',
      },
      {
        icono: '⚖️',
        texto: 'El Imperio tenía una constitución, un tribunal supremo, una burocracia profesional y un sistema legal sofisticado. No era un régimen arbitrario: era una monarquía constitucional con elecciones parlamentarias (aunque el sufragio universal masculino solo llegó en 1907). Su problema no era la falta de instituciones sino la imposibilidad de satisfacer simultáneamente las demandas nacionales de sus 11 pueblos.',
      },
    ],

    errores: [
      {
        titulo: 'Que Austria-Hungría era solo austriaca',
        cuerpo: 'El Imperio incluía el territorio de los actuales Austria, Hungría, República Checa, Eslovaquia, Eslovenia, Croacia, Bosnia-Herzegovina, y partes de Polonia, Rumanía, Italia, Ucrania y Serbia. Los alemanes austríacos eran solo una de las 11 naciones del Imperio, y no siempre la más numerosa. Los húngaros, checos y polacos eran igualmente "austro-húngaros".',
      },
      {
        titulo: 'Que Francisco José era un tirano',
        cuerpo: 'Francisco José fue un monarca constitucional que gobernó dentro de los límites legales del Imperio. Había elecciones parlamentarias, libertad de prensa (con límites), un poder judicial independiente y un sistema de derechos civiles. Sus decisiones autoritarias (supresión de 1848, concordato con la Iglesia) eran comparables a las de cualquier monarca europeo de su época.',
      },
      {
        titulo: 'Que el Imperio era arcaico porque Freud, Klimt y Mahler eran austriacos',
        cuerpo: 'La Viena imperial fue el epicentro de la modernidad cultural mundial. El psicoanálisis (Freud), la Secesión vienesa (Klimt, Schiele, Kokoschka), la música dodecafónica (Schoenberg, Berg, Webern), la filosofía analítica (Wittgenstein), la arquitectura funcional (Loos), el sionismo (Herzl) y el socialismo austro-marxista nacieron todos en la Viena imperial. Ninguna capital europea produjo más innovación cultural en ese período.',
      },
      {
        titulo: 'Que el derrumbe del Imperio fue inevitable',
        cuerpo: 'La historiografía reciente (Alan Sked, Pieter Judson) argumenta que el Imperio era más robusto de lo que parece. Los pueblos del Imperio estaban mayoritariamente satisfechos con la vida cotidiana habsburguesa. El derrumbe fue acelerado por la guerra y las decisiones de las grandes potencias (sobre todo Gran Bretaña y Francia) de apoyar los estados nacionales como principio organizador. Sin la Primera Guerra Mundial, el Imperio podría haber perdurado décadas más.',
      },
    ],
  },
};
