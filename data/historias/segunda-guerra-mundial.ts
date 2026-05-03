import type { HistoriaData } from './types';

export const segundaGuerraMundial: HistoriaData = {
  slug: 'segunda-guerra-mundial',
  titulo: 'La Segunda Guerra Mundial: De la Invasión de Polonia a Hiroshima',
  subtitulo: 'El conflicto más devastador de la historia: 6 años, 70-85 millones de muertos y el nacimiento del orden mundial contemporáneo',
  descripcionSEO: 'Cronología interactiva de la Segunda Guerra Mundial (1939-1945): Blitzkrieg, Holocausto, D-Day, Hiroshima y las consecuencias geopolíticas que definieron el mundo moderno.',
  keywords: [
    'Segunda Guerra Mundial', 'WWII', 'Hitler', 'Holocausto', 'D-Day', 'Hiroshima',
    'Stalingrado', 'Normandía', 'Pearl Harbor', 'Churchill', 'Stalin', 'Roosevelt',
    'Blitzkrieg', 'Operación Barbarroja', 'nazismo', '1939', '1945', 'historia contemporánea',
  ],
  anioInicio: 1939,
  anioFin: 1945,

  hitos: [
    {
      id: 'camino-guerra',
      nombre: 'El Camino a la Guerra',
      anioInicio: 1933,
      anioFin: 1939,
      color: '#4B0082',
      categoria: 'causas',
      descripcion: 'El ascenso de Adolf Hitler al poder en 1933 marcó el inicio de una escalada hacia el conflicto. El rearme alemán en violación del Tratado de Versalles, el Anschluss de Austria (1938), la cesión de los Sudetes en la Conferencia de Múnich (septiembre 1938), el pacto Ribbentrop-Mólotov (agosto 1939) y la invasión de Polonia el 1 de septiembre de 1939 desencadenaron la declaración de guerra por parte de Francia y Gran Bretaña. Europa se sumergía en su segundo conflicto catastrófico en menos de 25 años.',
      obraIconica: 'Invasión de Polonia — 1 de septiembre de 1939',
      paises: ['Alemania', 'Polonia', 'Francia', 'Reino Unido', 'URSS'],
    },
    {
      id: 'caida-francia',
      nombre: 'La Caída de Francia',
      anioInicio: 1939,
      anioFin: 1940,
      color: '#DC143C',
      categoria: 'blitzkrieg',
      descripcion: 'Tras la "Drôle de guerre" (guerra de broma), Alemania invadió Dinamarca y Noruega en abril de 1940. En mayo, el Blitzkrieg arrasó los Países Bajos, Bélgica y rodeó al ejército aliado en Dunkerque, donde una flotilla improvisada evacuó a 340.000 soldados hacia Inglaterra. El 22 de junio de 1940, Francia firmó el armisticio. Europa occidental quedó bajo control nazi, y sólo el Canal de la Mancha separaba a Hitler de una Gran Bretaña defiant dirigida por Churchill.',
      obraIconica: 'Evacuación de Dunkerque — mayo-junio 1940',
      paises: ['Alemania', 'Francia', 'Reino Unido', 'Países Bajos', 'Bélgica'],
    },
    {
      id: 'batalla-inglaterra',
      nombre: 'La Batalla de Inglaterra',
      anioInicio: 1940,
      anioFin: 1940,
      color: '#228B22',
      categoria: 'resistencia',
      descripcion: 'Entre julio y octubre de 1940, la Luftwaffe intentó destruir la RAF para preparar la invasión de Gran Bretaña (Operación León Marino). Los pilotos británicos —y voluntarios de toda Europa ocupada— resistieron en duelos aéreos sobre los cielos ingleses. Churchill inmortalizó su sacrificio: "Nunca en el campo del conflicto humano tantos debieron tanto a tan pocos." Incapaz de establecer superioridad aérea, Hitler abandonó la invasión y viró su estrategia hacia el este. Fue el primer freno significativo al avance nazi.',
      obraIconica: 'Churchill: "Nunca tantos debieron tanto a tan pocos" — agosto 1940',
      paises: ['Reino Unido', 'Alemania'],
    },
    {
      id: 'barbarroja',
      nombre: 'Operación Barbarroja: La Invasión de la URSS',
      anioInicio: 1941,
      anioFin: 1941,
      color: '#DC143C',
      categoria: 'blitzkrieg',
      descripcion: 'El 22 de junio de 1941, Alemania lanzó la mayor operación militar de la historia: 3 millones de soldados del Eje invadieron la URSS en un frente de 2.900 km. El avance inicial fue devastador, pero tres factores detuvieron el Blitz en el Este: la resistencia soviética, el invierno ruso y la sobreextensión logística alemana. Leningrado quedó sitiada durante 900 días. A las puertas de Moscú, el Ejército Rojo detuvo el avance alemán en diciembre de 1941. La decisión de invadir la URSS resultaría fatal para el Tercer Reich.',
      obraIconica: 'Sitio de Leningrado — 900 días (septiembre 1941 – enero 1944)',
      paises: ['Alemania', 'URSS', 'Italia', 'Rumanía', 'Hungría', 'Finlandia'],
    },
    {
      id: 'holocausto',
      nombre: 'El Holocausto: La Solución Final',
      anioInicio: 1941,
      anioFin: 1945,
      color: '#1A1A1A',
      categoria: 'holocausto',
      descripcion: 'La Conferencia de Wannsee (enero de 1942) sistematizó el exterminio industrial de los judíos europeos. Los campos de exterminio —Auschwitz-Birkenau, Treblinka, Sobibor, Belzec, Chelmno y Majdanek— asesinaron a seis millones de judíos, junto a 5 millones más de víctimas: gitanos, personas con discapacidad, prisioneros soviéticos, homosexuales y opositores políticos. El Holocausto constituye el mayor crimen organizado de la historia moderna, y su memoria permanece como advertencia permanente contra el totalitarismo y el odio racial.',
      obraIconica: 'Conferencia de Wannsee — 20 de enero de 1942',
      paises: ['Alemania', 'Polonia', 'Francia', 'Países Bajos', 'Hungría', 'Grecia'],
    },
    {
      id: 'guerra-pacifico',
      nombre: 'La Guerra en el Pacífico',
      anioInicio: 1941,
      anioFin: 1942,
      color: '#1E90FF',
      categoria: 'pacifico',
      descripcion: 'El 7 de diciembre de 1941, Japón atacó por sorpresa la base naval estadounidense de Pearl Harbor (Hawái), matando a 2.403 personas. Al día siguiente, Estados Unidos declaró la guerra a Japón, y Alemania e Italia declararon la guerra a EEUU. La expansión japonesa en Asia-Pacífico fue fulminante: Filipinas, Malasia, Singapur, Indonesia y Birmania cayeron en meses. Sin embargo, la batalla de Midway (junio 1942) marcó el punto de inflexión: EEUU destruyó cuatro portaaviones japoneses, invirtiendo la correlación de fuerzas en el Pacífico.',
      obraIconica: 'Ataque a Pearl Harbor — 7 de diciembre de 1941',
      paises: ['Japón', 'Estados Unidos', 'Reino Unido', 'Australia', 'China'],
    },
    {
      id: 'stalingrado-el-alamein',
      nombre: 'El Giro de la Guerra: Stalingrado y El Alamein',
      anioInicio: 1942,
      anioFin: 1943,
      color: '#228B22',
      categoria: 'resistencia',
      descripcion: 'La batalla de Stalingrado (agosto 1942 – febrero 1943) fue la más sangrienta de la guerra: aproximadamente 2 millones de bajas entre ambos bandos. El cerco soviético atrapó al VI Ejército alemán del mariscal Paulus, que capituló el 2 de febrero de 1943. Simultáneamente, en el norte de África, la batalla de El Alamein (noviembre 1942) quebró la ofensiva del Afrika Korps de Rommel, abriendo el camino a la invasión aliada de Italia. Ambas victorias marcaron el punto de inflexión definitivo: la Wehrmacht nunca recuperó la iniciativa estratégica.',
      obraIconica: 'Rendición del VI Ejército alemán en Stalingrado — 2 de febrero de 1943',
      paises: ['URSS', 'Alemania', 'Reino Unido', 'Estados Unidos', 'Italia'],
    },
    {
      id: 'normandia-liberacion',
      nombre: 'El Desembarco de Normandía y la Liberación',
      anioInicio: 1944,
      anioFin: 1945,
      color: '#228B22',
      categoria: 'resistencia',
      descripcion: 'El 6 de junio de 1944 (D-Day), 156.000 soldados aliados desembarcaron en las playas de Normandía bajo fuego enemigo, en la mayor operación anfibia de la historia. La liberación de París siguió en agosto de 1944. La Batalla de las Ardenas (diciembre 1944) fue el último contraataque alemán, repelido con éxito. En marzo de 1945, los aliados cruzaron el Rin. El Ejército Rojo llegó a Berlín en abril: Hitler se suicidó el 30 de abril de 1945. Alemania firmó la rendición incondicional el 8 de mayo de 1945 (Día de la Victoria en Europa).',
      obraIconica: 'D-Day: Desembarco en Normandía — 6 de junio de 1944',
      paises: ['Estados Unidos', 'Reino Unido', 'Canadá', 'Francia Libre', 'Alemania', 'URSS'],
    },
    {
      id: 'bomba-atomica',
      nombre: 'La Bomba Atómica y el Final en el Pacífico',
      anioInicio: 1945,
      anioFin: 1945,
      color: '#1E90FF',
      categoria: 'pacifico',
      descripcion: 'El 6 de agosto de 1945, el bombardero B-29 Enola Gay lanzó "Little Boy" sobre Hiroshima: aproximadamente 140.000 personas murieron entre la explosión y sus efectos. El 9 de agosto, "Fat Man" cayó sobre Nagasaki, causando unas 80.000 muertes. El 15 de agosto, el emperador Hirohito anunció la rendición japonesa. La firma oficial tuvo lugar el 2 de septiembre de 1945 a bordo del USS Missouri. El uso de armas nucleares en combate —único hasta la fecha— transformó para siempre la estrategia militar y la política internacional.',
      obraIconica: 'Bomba atómica sobre Hiroshima — 6 de agosto de 1945',
      paises: ['Estados Unidos', 'Japón'],
    },
    {
      id: 'nuevo-orden-mundial',
      nombre: 'Las Consecuencias: El Nuevo Orden Mundial',
      anioInicio: 1945,
      anioFin: 1945,
      color: '#DAA520',
      categoria: 'posguerra',
      descripcion: 'La Conferencia de Yalta (febrero 1945) dividió el mundo en esferas de influencia. Los Juicios de Núremberg (1945-1946) establecieron el precedente del derecho penal internacional y los crímenes contra la humanidad. La ONU fue fundada en octubre de 1945 como arquitectura de paz colectiva. El Plan Marshall reconstruyó Europa occidental. La descolonización de Asia y África se aceleró. El mundo quedó dividido en dos bloques bajo la Guerra Fría. Con 70-85 millones de muertos, la Segunda Guerra Mundial redefinió las instituciones, las fronteras y los valores del mundo contemporáneo.',
      obraIconica: 'Fundación de la ONU — 24 de octubre de 1945',
      paises: ['Estados Unidos', 'URSS', 'Reino Unido', 'Francia', 'China'],
    },
  ],

  eras: [
    {
      nombre: 'El Camino a la Guerra y la Dominación Nazi',
      desde: 1933,
      hasta: 1941,
      icono: '💀',
      hitosDestacados: [
        'El Camino a la Guerra',
        'La Caída de Francia',
        'La Batalla de Inglaterra',
      ],
      eventos: [
        'Hitler canciller (1933) y führer (1934)',
        'Leyes de Núremberg — discriminación racial oficial (1935)',
        'Anschluss de Austria y Conferencia de Múnich (1938)',
        'Pacto Ribbentrop-Mólotov entre Alemania y la URSS (agosto 1939)',
        'Invasión de Polonia y declaración de guerra franco-británica (septiembre 1939)',
        'Blitzkrieg en Bélgica, Países Bajos y Francia (mayo-junio 1940)',
        'Evacuación de Dunkerque — 340.000 soldados rescatados',
        'Armisticio franco-alemán — Gobierno de Vichy en el sur de Francia',
        'La RAF resiste la Luftwaffe en la Batalla de Inglaterra',
        'Hitler abandona la invasión de Gran Bretaña',
      ],
    },
    {
      nombre: 'La Guerra Global: Dos Frentes',
      desde: 1941,
      hasta: 1942,
      icono: '🌍',
      hitosDestacados: [
        'Operación Barbarroja: La Invasión de la URSS',
        'El Holocausto: La Solución Final',
        'La Guerra en el Pacífico',
      ],
      eventos: [
        'Operación Barbarroja — 22 de junio de 1941: 3 millones de soldados del Eje invaden la URSS',
        'Inicio del sitio de Leningrado — 900 días de resistencia',
        'Conferencia de Wannsee — sistematización del exterminio (enero 1942)',
        'Ataque japonés a Pearl Harbor — 7 de diciembre de 1941',
        'EEUU entra en la guerra; Alemania e Italia declaran guerra a EEUU',
        'Expansión japonesa en Asia-Pacífico: Filipinas, Malasia, Singapur, Indonesia',
        'El Ejército Rojo detiene el avance alemán ante Moscú (diciembre 1941)',
        'Los campos de exterminio entran en plena operación',
      ],
    },
    {
      nombre: 'El Giro de la Marea',
      desde: 1942,
      hasta: 1943,
      icono: '🔄',
      hitosDestacados: [
        'El Giro de la Guerra: Stalingrado y El Alamein',
        'La Guerra en el Pacífico',
      ],
      eventos: [
        'Batalla de Midway — EEUU destruye 4 portaaviones japoneses (junio 1942)',
        'Inicio de la batalla de Stalingrado — agosto 1942',
        'Segunda batalla de El Alamein — Rommel derrotado en África (noviembre 1942)',
        'Cerco soviético del VI Ejército alemán en Stalingrado (noviembre 1942)',
        'Rendición del VI Ejército de Paulus — 91.000 prisioneros (2 febrero 1943)',
        'Capitulación del Afrika Korps en Túnez (mayo 1943)',
        'Batalla de Kursk — mayor batalla de tanques de la historia (julio 1943)',
        'Invasión aliada de Sicilia e Italia — Mussolini cae del poder',
      ],
    },
    {
      nombre: 'La Liberación de Europa',
      desde: 1943,
      hasta: 1945,
      icono: '🏳️',
      hitosDestacados: [
        'El Desembarco de Normandía y la Liberación',
        'El Holocausto: La Solución Final',
      ],
      eventos: [
        'D-Day — Desembarco de Normandía (6 junio 1944): 156.000 soldados aliados',
        'Liberación de Roma (junio 1944) y París (agosto 1944)',
        'Conferencia de Yalta — reparto de esferas de influencia (febrero 1945)',
        'Ofensiva final soviética en el Este — avance hacia Berlín',
        'Batalla de las Ardenas — último contraataque alemán repelido',
        'Liberación de los campos de concentración — testimonios del Holocausto',
        'Cruce del Rin por las fuerzas aliadas occidentales (marzo 1945)',
        'Hitler se suicida en el búnker de Berlín (30 abril 1945)',
        'Rendición incondicional de Alemania — Día VE (8 mayo 1945)',
      ],
    },
    {
      nombre: 'El Final en el Pacífico',
      desde: 1944,
      hasta: 1945,
      icono: '☢️',
      hitosDestacados: [
        'La Bomba Atómica y el Final en el Pacífico',
      ],
      eventos: [
        'Proyecto Manhattan — desarrollo secreto de la bomba atómica en EEUU',
        'Batalla de Leyte Gulf — mayor batalla naval de la historia (octubre 1944)',
        'Invasión de Iwo Jima y Okinawa — combates encarnizados (1945)',
        'Prueba Trinity — primera detonación nuclear exitosa (julio 1945)',
        'Bomba "Little Boy" sobre Hiroshima — ~140.000 muertos (6 agosto 1945)',
        'Bomba "Fat Man" sobre Nagasaki — ~80.000 muertos (9 agosto 1945)',
        'La URSS declara la guerra a Japón e invade Manchuria',
        'Anuncio de rendición del emperador Hirohito (15 agosto 1945)',
        'Firma oficial de rendición japonesa en el USS Missouri (2 septiembre 1945)',
      ],
    },
    {
      nombre: 'Las Consecuencias y el Nuevo Orden',
      desde: 1945,
      hasta: 1945,
      icono: '🕊️',
      hitosDestacados: [
        'Las Consecuencias: El Nuevo Orden Mundial',
      ],
      eventos: [
        'Carta de San Francisco — fundación de la ONU (junio 1945)',
        'Juicios de Núremberg — crímenes de guerra y contra la humanidad',
        'División de Alemania en zonas de ocupación aliadas',
        'Plan Marshall anunciado — reconstrucción de Europa occidental (1947)',
        'Inicio de la Guerra Fría — telón de acero (Churchill, 1946)',
        'Descolonización acelerada en Asia y África',
        'Israel declarado estado independiente (1948)',
        'OTAN fundada (1949) — bloque occidental de defensa colectiva',
        '70-85 millones de muertos — el conflicto más mortífero de la historia',
      ],
    },
  ],

  categorias: {
    causas: 'Causas y antecedentes',
    blitzkrieg: 'Blitzkrieg y conquistas',
    holocausto: 'Holocausto',
    pacifico: 'Teatro del Pacífico',
    resistencia: 'Resistencia y victorias aliadas',
    posguerra: 'Posguerra y nuevo orden',
  },

  colores: {
    causas: '#4B0082',
    blitzkrieg: '#DC143C',
    holocausto: '#1A1A1A',
    pacifico: '#1E90FF',
    resistencia: '#228B22',
    posguerra: '#DAA520',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: `La Segunda Guerra Mundial (1939-1945) fue el conflicto armado más devastador de la historia de la humanidad, con entre 70 y 85 millones de muertos —el 3% de la población mundial de entonces. Desencadenada por la política expansionista de la Alemania nazi y la pasividad de las democracias occidentales ante las violaciones del Tratado de Versalles, la guerra transformó radicalmente el mapa político, las instituciones internacionales y los valores fundamentales de la civilización contemporánea.

El conflicto se desarrolló en múltiples teatros de operaciones simultáneos: Europa occidental y oriental, el norte de África, el Mediterráneo y el Pacífico. Combinó la guerra de movimiento (Blitzkrieg), el asedio urbano (Leningrado, Stalingrado), la guerra aérea estratégica (Batalla de Inglaterra, bombardeos sobre Alemania) y la guerra naval (batalla del Atlántico). Su dimensión tecnológica fue sin precedentes: radares, cohetes V2, cifrado ENIGMA y, finalmente, las bombas atómicas.

El Holocausto —el exterminio sistemático de seis millones de judíos y cinco millones de otras víctimas— representa una dimensión única del conflicto: la aplicación de la burocracia industrial moderna a la eliminación deliberada de grupos humanos. Wannsee, Auschwitz-Birkenau, Treblinka: estos nombres permanecen como advertencia permanente.

Las consecuencias de la guerra definieron el mundo actual: la ONU, la Declaración Universal de los Derechos Humanos, el derecho internacional penal, la OTAN, la integración europea, la descolonización, la Guerra Fría y la era nuclear. Comprender la Segunda Guerra Mundial es comprender los fundamentos —frágiles y conquistados a terrible precio— del orden internacional contemporáneo.`,

    tablaComparativa: [
      {
        hito: 'El Camino a la Guerra',
        periodo: '1933–1939',
        categoria: 'Causas y antecedentes',
        personaje: 'Adolf Hitler',
        aportacion: 'Ascenso al poder, rearme, expansionismo diplomático y la invasión de Polonia que desencadenó la guerra',
      },
      {
        hito: 'La Caída de Francia',
        periodo: '1939–1940',
        categoria: 'Blitzkrieg y conquistas',
        personaje: 'Heinz Guderian',
        aportacion: 'Doctrina del Blitzkrieg con divisiones Panzer que rodearon al ejército aliado y forzaron la evacuación de Dunkerque',
      },
      {
        hito: 'La Batalla de Inglaterra',
        periodo: 'Julio–octubre 1940',
        categoria: 'Resistencia y victorias aliadas',
        personaje: 'Winston Churchill',
        aportacion: 'Liderazgo que mantuvo la moral británica; la RAF detuvo a la Luftwaffe y frustró la invasión nazi de Gran Bretaña',
      },
      {
        hito: 'El Holocausto: La Solución Final',
        periodo: '1941–1945',
        categoria: 'Holocausto',
        personaje: 'Adolf Eichmann',
        aportacion: 'Organización logística del exterminio sistemático que condujo al asesinato de seis millones de judíos europeos',
      },
      {
        hito: 'El Giro de la Guerra: Stalingrado',
        periodo: 'Agosto 1942 – febrero 1943',
        categoria: 'Resistencia y victorias aliadas',
        personaje: 'Georgi Zhúkov',
        aportacion: 'Diseñó la Operación Urano que cercó al VI Ejército alemán, marcando el punto de inflexión definitivo en el frente oriental',
      },
      {
        hito: 'El Desembarco de Normandía',
        periodo: 'Junio 1944 – mayo 1945',
        categoria: 'Resistencia y victorias aliadas',
        personaje: 'Dwight D. Eisenhower',
        aportacion: 'Comandó el D-Day, la mayor operación anfibia de la historia, que abrió el segundo frente en Europa occidental',
      },
    ],

    escenarios: [
      {
        icono: '📚',
        titulo: 'El estudiante de historia',
        perfil: 'Para bachillerato y universidad',
        texto: 'Usas este visualizador para preparar un examen o trabajo sobre la Segunda Guerra Mundial. Explora los 10 hitos en orden cronológico, presta atención a las fechas clave (1939, 1941, 1942-43, 1944, 1945) y a cómo se interconectan los teatros europeo y del Pacífico. La tabla comparativa te ayudará a relacionar cada fase con sus protagonistas y consecuencias. Los tabs de "Período en Detalle" y "Comparativa" son especialmente útiles para repasar.',
      },
      {
        icono: '🎮',
        titulo: 'El aficionado a los juegos históricos',
        perfil: 'Jugador de wargames o estrategia',
        texto: 'Si juegas a Hearts of Iron, Company of Heroes, Battlefield V u otros títulos ambientados en la WWII, este visualizador te proporciona el contexto histórico real de las operaciones y frentes que aparecen en los juegos. Descubre la escala real de batallas como Stalingrado o Kursk, las decisiones estratégicas detrás del D-Day, y por qué el frente oriental fue tan decisivo para el resultado de la guerra.',
      },
      {
        icono: '🎬',
        titulo: 'El espectador de cine y series',
        perfil: 'Amante del cine bélico e histórico',
        texto: 'Tras ver películas como "Salvad al soldado Ryan", "El pianista", "La lista de Schindler", "Dunkerque" o series como "Band of Brothers" o "The Pacific", este visualizador te ayuda a situar cada historia en su contexto cronológico preciso. Comprenderás mejor las decisiones de los personajes, la escala de las operaciones y las consecuencias históricas de los hechos que aparecen en pantalla.',
      },
      {
        icono: '🌍',
        titulo: 'El curioso sobre el mundo actual',
        perfil: 'Para entender la política internacional',
        texto: 'La ONU, la OTAN, la UE, el derecho internacional, el Estado de Israel, la división de Alemania, la Guerra Fría, el arma nuclear como disuasor: todo esto nació de la Segunda Guerra Mundial. Si quieres entender por qué el mundo está organizado como está —sus instituciones, sus alianzas, sus fronteras—, este visualizador del hito "Las Consecuencias" y la era "Las Consecuencias y el Nuevo Orden" son el punto de partida esencial.',
      },
    ],

    faq: [
      {
        pregunta: '¿Cuántas personas murieron en la Segunda Guerra Mundial?',
        respuesta: 'Las estimaciones oscilan entre 70 y 85 millones de muertos, lo que representa aproximadamente el 3% de la población mundial de 1940. La URSS sufrió las mayores pérdidas: entre 26 y 27 millones de muertos (militares y civiles). China perdió entre 15 y 20 millones. Polonia perdió el 16-17% de su población. El Holocausto supuso el asesinato de seis millones de judíos europeos —dos tercios del total en Europa— más cinco millones de otras víctimas.',
        tip: 'Para comparar: la Primera Guerra Mundial causó entre 17 y 20 millones de muertos. La Segunda fue entre cuatro y cinco veces más mortífera.',
      },
      {
        pregunta: '¿Por qué Alemania perdió la guerra?',
        respuesta: 'Varios factores sellaron la derrota alemana: (1) la decisión de invadir la URSS abriendo un segundo frente mientras Gran Bretaña resistía en el oeste; (2) la entrada de EEUU tras Pearl Harbor, que volcó la superioridad industrial aliada; (3) la resistencia soviética en Stalingrado y Kursk, que destruyó las mejores divisiones alemanas; (4) la superioridad logística aliada una vez establecido el segundo frente en Normandía; y (5) el agotamiento de recursos humanos y materiales ante una coalición vastamente superior en potencial industrial.',
        tip: 'Hitler tomó decisiones operativas que contrarían a sus propios generales, como negarse a permitir retiradas tácticas en el frente oriental.',
      },
      {
        pregunta: '¿Fue necesario lanzar las bombas atómicas sobre Japón?',
        respuesta: 'Esta es una de las preguntas históricas más debatidas. Los argumentos a favor sostienen que una invasión terrestre de Japón habría costado entre 250.000 y 1 millón de bajas aliadas y millones de japoneses. Los argumentos en contra señalan que Japón ya negociaba la rendición, que la URSS estaba a punto de entrar en la guerra del Pacífico, y que el bombardeo masivo convencional ya había devastado las ciudades japonesas. Los historiadores siguen divididos; la decisión fue tomada por el presidente Truman con información imperfecta y bajo enorme presión.',
        tip: 'Los ataques nucleares sobre Hiroshima y Nagasaki siguen siendo los únicos usos de armas nucleares en combate en la historia.',
      },
      {
        pregunta: '¿Qué fue el Holocausto exactamente?',
        respuesta: 'El Holocausto (en hebreo, Shoá — "catástrofe") fue el genocidio sistemático y burocráticamente organizado de seis millones de judíos europeos —dos tercios del total— por el régimen nazi entre 1941 y 1945. Se complementó con el asesinato de aproximadamente cinco millones de personas de otros grupos: gitanos (romaníes), personas con discapacidad, prisioneros soviéticos, homosexuales y opositores políticos. La Conferencia de Wannsee (enero 1942) sistematizó la "Solución Final". Los principales campos de exterminio estaban en Polonia ocupada: Auschwitz-Birkenau, Treblinka, Sobibor, Belzec, Chelmno y Majdanek.',
        tip: 'El término "Holocausto" se diferencia de "genocidio" en que fue un exterminio planificado y ejecutado industrialmente por un Estado moderno.',
      },
      {
        pregunta: '¿Cómo cambió el mundo la Segunda Guerra Mundial?',
        respuesta: 'Las consecuencias fueron transformadoras y duraderas: (1) el orden bipolar de la Guerra Fría, con EEUU y la URSS como superpotencias; (2) la creación de la ONU, el FMI y el Banco Mundial como arquitectura de gobernanza global; (3) el establecimiento del derecho internacional penal en Núremberg; (4) la fundación del Estado de Israel (1948); (5) la integración europea como proyecto de paz; (6) la aceleración de la descolonización; (7) la era nuclear y la doctrina de la disuasión; (8) el Estado del Bienestar en Europa occidental; y (9) la Declaración Universal de los Derechos Humanos (1948).',
        tip: 'Prácticamente todas las instituciones internacionales actuales —ONU, OTAN, UE, Banco Mundial— nacieron como respuesta directa a la Segunda Guerra Mundial.',
      },
    ],

    pasos: [
      {
        titulo: 'Comprende el contexto previo: la paz armada (1919-1939)',
        cuerpo: 'El Tratado de Versalles (1919) impuso condiciones humillantes a Alemania: pérdida de territorios, reducción del ejército a 100.000 soldados y reparaciones imposibles. La Gran Depresión (1929) destruyó la economía alemana. En ese contexto de resentimiento y desesperación económica, el programa de Hitler —recuperar el honor nacional, rearmar Alemania, revertir Versalles— encontró apoyo masivo. Las democracias occidentales, agotadas por la Gran Guerra, practicaron el "apaciguamiento" (Múnich, 1938) cediendo ante cada nueva exigencia nazi.',
      },
      {
        titulo: 'Sitúa los dos teatros principales de operaciones',
        cuerpo: 'La guerra se libró fundamentalmente en dos teatros: (1) el frente europeo/africano, donde el Eje (Alemania, Italia) combatió contra los Aliados occidentales (Francia, Reino Unido, EEUU desde 1942) y la URSS (desde junio 1941); y (2) el teatro del Pacífico/Asia Oriental, donde Japón combatió contra EEUU, Reino Unido, China y Australia. Ambos teatros estaban conectados por las alianzas (Eje: Berlín-Roma-Tokio; Aliados: Gran Alianza desde 1941), pero se desarrollaron con relativa independencia operativa hasta la derrota de Alemania en mayo 1945.',
      },
      {
        titulo: 'Identifica los tres puntos de inflexión decisivos',
        cuerpo: 'Tres eventos cambiaron el curso de la guerra: (1) la Batalla de Inglaterra (1940), que frustró la invasión nazi de Gran Bretaña y mantuvo vivo un frente occidental; (2) la derrota alemana en Stalingrado (febrero 1943), que destruyó la mejor fuerza de ataque del Ejército alemán y marcó el inicio del retroceso hacia Berlín; y (3) la batalla de Midway (junio 1942), que destruyó el poder naval japonés y transfirió la iniciativa estratégica en el Pacífico a EEUU. Tras estos tres eventos, la victoria aliada era cuestión de tiempo y recursos.',
      },
      {
        titulo: 'Distingue guerra convencional y crimen contra la humanidad',
        cuerpo: 'La Segunda Guerra Mundial combinó un conflicto bélico convencional entre Estados con el Holocausto, que no era una consecuencia colateral de la guerra sino una política deliberada del régimen nazi ejecutada en paralelo. Los campos de exterminio funcionaron con plena eficiencia incluso cuando Alemania perdía la guerra. Comprender esta dualidad es esencial: no fue sólo "un país que perdió una guerra", sino un régimen que organizó industrialmente el asesinato masivo de poblaciones civiles. Núremberg estableció que estos crímenes son imprescriptibles e individuales.',
      },
      {
        titulo: 'Analiza el legado: de las ruinas al orden mundial actual',
        cuerpo: 'Las instituciones que gobiernan el mundo actual son, en gran medida, respuestas directas a las lecciones de la Segunda Guerra Mundial: la ONU para evitar guerras futuras; la OTAN para la defensa colectiva del occidente democrático; el FMI y el Banco Mundial para estabilizar la economía mundial; la integración europea para hacer la guerra entre sus miembros "no sólo impensable, sino materialmente imposible" (Schuman, 1950); y la Declaración Universal de los Derechos Humanos como barrera contra la barbarie. Comprender esta arquitectura requiere entender qué fracasó en el período de entreguerras.',
      },
    ],

    tips: [
      {
        icono: '🗺️',
        texto: 'Usa mapas históricos en paralelo: la geografía es fundamental para entender por qué la URSS pudo absorber el golpe inicial de Barbarroja (profundidad estratégica) y por qué el Atlántico fue tan vital para el abastecimiento aliado.',
      },
      {
        icono: '📅',
        texto: 'Memoriza cinco fechas clave: 1 septiembre 1939 (invasión de Polonia), 22 junio 1941 (Barbarroja), 7 diciembre 1941 (Pearl Harbor), 6 junio 1944 (D-Day) y 8 mayo 1945 (VE Day). Todas las demás fechas se sitúan en relación con estas.',
      },
      {
        icono: '⚖️',
        texto: 'Distingue causas (crisis de entreguerras, auge del fascismo, apaciguamiento) de detonantes (invasión de Polonia). La guerra no fue "inevitable": decisiones políticas concretas pudieron haberla evitado.',
      },
      {
        icono: '🎭',
        texto: 'Lee o escucha testimonios directos: "El diario de Ana Frank", los testimonios de Núremberg, las memorias de Churchill o las cartas desde el frente ruso humanizan unas cifras que, de otro modo, resultan incomprensibles.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir causas con responsabilidades',
        cuerpo: 'La Segunda Guerra Mundial tuvo múltiples causas estructurales (Versalles, Gran Depresión, debilidad de la Liga de Naciones), pero las decisiones específicas de Hitler y el régimen nazi son la causa directa e inmediata. El "apaciguamiento" occidental facilitó la escalada, pero no justifica ni diluye la responsabilidad primaria alemana. El Juicio de Núremberg estableció que los crímenes contra la humanidad son responsabilidad individual, no sólo "estatal".',
      },
      {
        titulo: 'Subestimar el papel de la URSS en la victoria aliada',
        cuerpo: 'El frente oriental absorbió entre el 75% y el 80% del esfuerzo militar alemán. La URSS perdió 26-27 millones de personas. Sin la resistencia soviética —en Moscú, Leningrado, Stalingrado, Kursk— Alemania habría podido concentrar todos sus recursos en el oeste. El D-Day fue decisivo, pero fue la conjunción del frente oriental y occidental lo que derrotó al Tercer Reich. Reducir la victoria aliada exclusivamente al desembarco de Normandía es históricamente inexacto.',
      },
      {
        titulo: 'Separar el Holocausto de la guerra como si fueran eventos distintos',
        cuerpo: 'El Holocausto no fue un "efecto secundario" de la guerra: era parte central de la ideología y los objetivos del régimen nazi, que se ejecutó en paralelo a las operaciones militares. De hecho, cuando la guerra estaba claramente perdida, los trenes hacia los campos de exterminio siguieron funcionando con prioridad sobre el abastecimiento militar. Entender el Holocausto como inherente al proyecto nazi —no como una anomalía— es esencial para comprender qué fue el nazismo.',
      },
      {
        titulo: 'Asumir que la victoria aliada era inevitable desde el principio',
        cuerpo: 'En 1940-1941, la victoria alemana parecía posible. Si Gran Bretaña hubiera negociado la paz, si la URSS hubiera colapsado ante Barbarroja, si el Pacífico no hubiera unido a EEUU con las democracias, el resultado podría haber sido muy diferente. La historia no tiene desenlace predeterminado. Comprender las contingencias —los momentos en que el resultado era incierto— es fundamental para entender por qué ciertas decisiones y ciertos liderazgos (Churchill, Stalin, Roosevelt) fueron históricamente cruciales.',
      },
    ],
  },
};
