import type { HistoriaData } from './types';

export const espanaContemporanea: HistoriaData = {
  slug: 'espana-contemporanea',
  titulo: 'España Contemporánea: De las Guerras Napoleónicas a la Democracia',
  subtitulo:
    'Dos siglos de liberalismo y carlismo, República y Guerra Civil, franquismo y la Transición democrática española, estudiada como modelo comparado',
  descripcionSEO:
    'Cronología interactiva de la España contemporánea: de la Guerra de Independencia y la Constitución de Cádiz (1808-1812) a la democracia actual. Segunda República, Guerra Civil, franquismo, Transición y España en Europa en 10 hitos y 6 eras.',
  keywords: [
    'historia España contemporánea cronología',
    'constitución Cádiz 1812 guerra independencia napoleón',
    'segunda república española guerra civil franquismo',
    'transición democrática española constitución 1978',
    'carlismo liberalismo restauración borbónica caciquismo',
    'desastre 98 cuba generación del 98 regeneracionismo',
  ],
  anioInicio: 1808,
  anioFin: 9999,

  hitos: [
    {
      id: 'guerra-independencia',
      nombre: 'La Guerra de Independencia y las Cortes de Cádiz',
      anioInicio: 1808,
      anioFin: 1814,
      color: '#1565C0',
      categoria: 'fundacion',
      descripcion:
        'El Dos de Mayo de 1808 desencadena la guerra popular más brutal de la era napoleónica. Las guerrillas españolas inventan el término "guerrilla". Las Cortes de Cádiz (1812) aprueban la primera constitución liberal española: soberanía nacional, separación de poderes, libertad de prensa. El pintor Goya documenta los horrores.',
      obraIconica:
        'Los Fusilamientos del 3 de Mayo — Goya, 1814. La imagen más poderosa contra la guerra. El símbolo de la resistencia española',
      paises: ['España', 'Francia', 'Gran Bretaña'],
    },
    {
      id: 'absolutismo-liberalismo',
      nombre: 'Fernando VII: Absolutismo contra Liberalismo',
      anioInicio: 1814,
      anioFin: 1833,
      color: '#7B1FA2',
      categoria: 'conflicto',
      descripcion:
        'Fernando VII regresa y suprime la Constitución del 12 ("la Pepa"). El Trienio Liberal (1820-1823): militares liberales restauran la Constitución; la Santa Alianza envía 100.000 hijos de San Luis a aplastarlos. Pérdida de América (1810-1825): solo Cuba y Puerto Rico quedan. Muere sin heredero varón: comienza la guerra carlista.',
      obraIconica:
        'El Pronunciamiento de Riego — enero 1820. El militar liberal que restaura la Constitución de Cádiz. El inicio de una larga tradición',
      paises: ['España', 'México', 'Argentina', 'Colombia', 'Perú'],
    },
    {
      id: 'guerras-carlistas',
      nombre: 'Las Guerras Carlistas y el Liberalismo Doctrinario',
      anioInicio: 1833,
      anioFin: 1874,
      color: '#C62828',
      categoria: 'conflicto',
      descripcion:
        'Tres guerras civiles por la sucesión entre carlistas (absolutismo, fueros, don Carlos) e isabelinos (liberalismo). La Constitución de 1845 consolida el liberalismo moderado. La Revolución Gloriosa (1868) destrona a Isabel II. La Primera República (1873-74): caos, cantones y pronunciamientos. España no encuentra su estabilidad.',
      obraIconica:
        'La Gloriosa — septiembre 1868. España destrona a Isabel II: la primera revolución liberal triunfante de su historia',
      paises: ['España', 'País Vasco', 'Navarra', 'Cataluña'],
    },
    {
      id: 'restauracion',
      nombre: 'La Restauración Borbónica y el Caciquismo',
      anioInicio: 1874,
      anioFin: 1898,
      color: '#0277BD',
      categoria: 'politica',
      descripcion:
        'Cánovas del Castillo diseña el sistema de la Restauración: dos partidos (Liberal y Conservador) se turnan en el poder mediante elecciones amañadas (el "encasillado"). El caciquismo domina la vida política rural. La Constitución de 1876 garantiza estabilidad pero no democracia. El sistema funciona... hasta el 98.',
      obraIconica:
        'Antonio Cánovas del Castillo — el arquitecto de la Restauración. El sistema político que gobernó España 50 años',
      paises: ['España'],
    },
    {
      id: 'desastre-98',
      nombre: 'El Desastre del 98 y el Regeneracionismo',
      anioInicio: 1898,
      anioFin: 1923,
      color: '#FF8C00',
      categoria: 'crisis',
      descripcion:
        'España pierde Cuba, Puerto Rico y Filipinas ante EE.UU. en diez semanas. El trauma del 98 genera la Generación del 98 (Unamuno, Machado, Valle-Inclán) y el regeneracionismo (Joaquín Costa: "escuela y despensa"). La crisis de Marruecos, la Semana Trágica de Barcelona (1909) y el pistolerismo de los años 20 desestabilizan el régimen.',
      obraIconica:
        'Desastre del 98 — El Desastre. España pierde su último Imperio: 400 años de presencia colonial terminan en 10 semanas',
      paises: ['España', 'Cuba', 'EE.UU.', 'Filipinas'],
    },
    {
      id: 'segundo-republica',
      nombre: 'La Segunda República Española',
      anioInicio: 1931,
      anioFin: 1936,
      color: '#2E7D32',
      categoria: 'republica',
      descripcion:
        'Alfonso XIII marcha al exilio (14 abril 1931) sin abdicar. La República trae reformas radicales: separación Iglesia-Estado, autonomías (Estatuto catalán 1932), reforma agraria, educación laica. Pero la polarización es extrema: CEDA y Frente Popular en los extremos. Las elecciones de febrero 1936 dan el poder al Frente Popular. Cinco meses después, el golpe.',
      obraIconica:
        'La proclamación de la Segunda República, 14 de abril de 1931',
      paises: ['España'],
    },
    {
      id: 'guerra-civil',
      nombre: 'La Guerra Civil Española',
      anioInicio: 1936,
      anioFin: 1939,
      color: '#B71C1C',
      categoria: 'guerra',
      descripcion:
        'El golpe de julio 1936 fracasa en las ciudades y triunfa en el campo: arranca una guerra civil de tres años. Las Brigadas Internacionales, la URSS y México apoyan a la República; Hitler y Mussolini apoyan a Franco. Guernica bombardeada (1937). El millón de muertos, el exilio de 500.000. Franco entra en Madrid el 1 de abril de 1939.',
      obraIconica:
        'Guernica — Picasso, 1937. El bombardeo de la ciudad vasca por la Legión Cóndor nazi. El cuadro más político de la historia del arte',
      paises: ['España', 'Alemania', 'Italia', 'URSS', 'México'],
    },
    {
      id: 'franquismo',
      nombre: 'El Franquismo: Cuarenta Años de Dictadura',
      anioInicio: 1939,
      anioFin: 1975,
      color: '#37474F',
      categoria: 'dictadura',
      descripcion:
        'Franco gobierna España durante 40 años con el apoyo inicial del Eje y la Iglesia. La posguerra es una miseria: hambre, represión, aislamiento. Los Planes de Desarrollo de los 60 modernizan la economía. El turismo masivo abre España al mundo. ETA nace en 1959. El último Carrero Blanco asesinado (1973). Franco muere el 20 de noviembre de 1975.',
      obraIconica:
        'Valle de los Caídos — Franco construye su mausoleo con trabajo de presos políticos. El símbolo de la dictadura que más controversia genera',
      paises: ['España'],
    },
    {
      id: 'transicion',
      nombre: 'La Transición Democrática',
      anioInicio: 1975,
      anioFin: 1982,
      color: '#558B2F',
      categoria: 'democracia',
      descripcion:
        'Juan Carlos I, coronado rey, elige a Adolfo Suárez para pilotar la Transición. La Ley para la Reforma Política (1976). Legalización del PCE (abril 1977). Elecciones del 15 de junio de 1977. La Constitución de 1978 (aprobada con el 88% de apoyo). Los Pactos de la Moncloa. El 23-F (1981): Tejero fracasa. La Transición, modelo mundial de cambio democrático.',
      obraIconica:
        'La Constitución española de 1978',
      paises: ['España'],
    },
    {
      id: 'espana-democratica',
      nombre: 'La España Democrática y Europea',
      anioInicio: 1982,
      anioFin: 9999,
      color: '#0D47A1',
      categoria: 'democracia',
      descripcion:
        'Felipe González (PSOE) gana con mayoría absoluta (1982). España entra en la OTAN y en la CEE (1986). Los Juegos Olímpicos de Barcelona y la Expo de Sevilla (1992). Aznar y el boom económico. Zapatero y el matrimonio gay. El 11-M (2004). La crisis de 2008 golpea durísimo. Rajoy, Sánchez. El procés catalán. La irrupción de Podemos y Ciudadanos. La España del siglo XXI en construcción permanente.',
      obraIconica:
        'Apertura de los Juegos Olímpicos de Barcelona — 25 julio 1992. España presenta al mundo una democracia madura y un país moderno',
      paises: ['España', 'Europa'],
    },
  ],

  eras: [
    {
      nombre: 'Independencia y Liberalismo',
      desde: 1808,
      hasta: 1874,
      icono: '📜',
      hitosDestacados: [
        'La Guerra de Independencia y las Cortes de Cádiz',
        'Fernando VII: Absolutismo contra Liberalismo',
        'Las Guerras Carlistas y el Liberalismo Doctrinario',
      ],
      eventos: [
        '1812: Constitución de Cádiz — "la Pepa"',
        '1820: Pronunciamiento de Riego — Trienio Liberal',
        '1868: La Gloriosa — España destrona a Isabel II',
      ],
    },
    {
      nombre: 'La Restauración Borbónica',
      desde: 1874,
      hasta: 1923,
      icono: '⚖️',
      hitosDestacados: [
        'La Restauración Borbónica y el Caciquismo',
        'El Desastre del 98 y el Regeneracionismo',
      ],
      eventos: [
        '1876: Constitución de la Restauración',
        '1898: Desastre del 98 — fin del Imperio colonial',
        '1909: Semana Trágica de Barcelona',
      ],
    },
    {
      nombre: 'Crisis y Segunda República',
      desde: 1923,
      hasta: 1939,
      icono: '🏛️',
      hitosDestacados: ['La Segunda República Española', 'La Guerra Civil Española'],
      eventos: [
        '1923: Golpe de Primo de Rivera con apoyo de Alfonso XIII',
        '1931: Proclamación de la Segunda República (14 abril)',
        '1936: Inicio de la Guerra Civil (18 julio)',
      ],
    },
    {
      nombre: 'El Franquismo',
      desde: 1939,
      hasta: 1975,
      icono: '⚠️',
      hitosDestacados: ['El Franquismo: Cuarenta Años de Dictadura'],
      eventos: [
        '1939: Franco entra en Madrid — fin de la Guerra Civil',
        '1959: Planes de Estabilización — inicio del desarrollo económico',
        '1975: Muerte de Franco (20 noviembre)',
      ],
    },
    {
      nombre: 'La Transición Democrática',
      desde: 1975,
      hasta: 1982,
      icono: '🤝',
      hitosDestacados: ['La Transición Democrática'],
      eventos: [
        '1977: Primeras elecciones democráticas (15 junio)',
        '1978: Constitución española aprobada (con 88% de apoyo)',
        '1981: 23-F — intento de golpe de estado fracasado',
      ],
    },
    {
      nombre: 'La España Democrática y Europea',
      desde: 1982,
      hasta: 9999,
      icono: '🇪🇸',
      hitosDestacados: ['La España Democrática y Europea'],
      eventos: [
        '1986: España entra en la CEE y en la OTAN',
        '1992: Barcelona 92 y Expo de Sevilla — España en el mundo',
        '2004: Atentados del 11-M en Madrid',
      ],
    },
  ],

  categorias: {
    fundacion: 'Independencia y Constitución',
    conflicto: 'Conflictos y Guerras Civiles',
    politica: 'Política e Instituciones',
    crisis: 'Crisis y Regeneración',
    republica: 'Segunda República',
    guerra: 'Guerra Civil',
    dictadura: 'Franquismo',
    democracia: 'Democracia y Europa',
  },

  colores: {
    fundacion: '#1565C0',
    conflicto: '#C62828',
    politica: '#0277BD',
    crisis: '#FF8C00',
    republica: '#2E7D32',
    guerra: '#B71C1C',
    dictadura: '#37474F',
    democracia: '#1B5E20',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'La España contemporánea es una historia de extremos y reconciliaciones: la primera constitución liberal de Europa (1812), tres guerras civiles, la Segunda República más avanzada de su tiempo, la dictadura más larga de Europa occidental, y la Transición democrática española, estudiada como modelo comparado. En dos siglos, España recorrió el camino que otros países tardaron cuatro en completar.',

    tablaComparativa: [
      {
        hito: 'Independencia y Liberalismo (1808-1874)',
        periodo: '1808-1874',
        categoria: 'Independencia y Constitución / Conflictos',
        personaje: 'Wellington / Riego / Cánovas',
        aportacion: 'Constitución de Cádiz, guerras carlistas, primera constitución liberal europea',
      },
      {
        hito: 'La Restauración Borbónica (1874-1923)',
        periodo: '1874-1923',
        categoria: 'Política e Instituciones / Crisis',
        personaje: 'Cánovas del Castillo / Sagasta',
        aportacion: 'Sistema de turno pacífico, caciquismo, pérdida del Imperio colonial en el 98',
      },
      {
        hito: 'Dictadura de Primo de Rivera (1923-1931)',
        periodo: '1923-1931',
        categoria: 'Política e Instituciones',
        personaje: 'Miguel Primo de Rivera / Alfonso XIII',
        aportacion: 'Modernización económica autoritaria, colapso de la Restauración',
      },
      {
        hito: 'La Segunda República (1931-1936)',
        periodo: '1931-1936',
        categoria: 'Segunda República',
        personaje: 'Azaña / Lerroux / Largo Caballero',
        aportacion: 'Reformas laicas y agrarias, autonomías, constitución progresista de 1931',
      },
      {
        hito: 'La Guerra Civil (1936-1939)',
        periodo: '1936-1939',
        categoria: 'Guerra Civil',
        personaje: 'Franco / Azaña / Negrín',
        aportacion: 'Un millón de muertos, exilio masivo, laboratorio de la Segunda Guerra Mundial',
      },
      {
        hito: 'La Transición y Democracia (1975-hoy)',
        periodo: '1975-presente',
        categoria: 'Democracia y Europa',
        personaje: 'Juan Carlos I / Suárez / González',
        aportacion: 'Constitución de 1978, ingreso en la CEE, modelo internacional de cambio democrático',
      },
    ],

    escenarios: [
      {
        icono: '🏛️',
        titulo: '¿Por qué fracasó la Segunda República?',
        perfil: 'Historiadores, estudiantes de Bachillerato y universidad',
        texto:
          'La Segunda República (1931-1936) fue el proyecto modernizador más ambicioso de la historia española: separación Iglesia-Estado, reforma agraria, autonomías, educación laica. Pero la polarización extrema entre una derecha que rechazaba la democracia y una izquierda que amenazaba la revolución dejó sin espacio al centro reformista. El golpe de julio de 1936 no fue inevitable, pero tampoco improvisado: llevaba años preparándose.',
      },
      {
        icono: '🤝',
        titulo: 'La Transición: ¿modelo o renuncia?',
        perfil: 'Ciudadanos interesados en historia política reciente',
        texto:
          'La Transición española (1975-1982) fue admirada mundialmente como modelo de cambio democrático pacífico. Pero en España el debate persiste: ¿fue una reconciliación necesaria o una renuncia a la justicia? La Ley de Amnistía de 1977 impidió juzgar los crímenes del franquismo. La memoria histórica sigue siendo una herida abierta décadas después. No hay respuesta única: depende de qué valoras más, la paz o la justicia.',
      },
      {
        icono: '⚖️',
        titulo: 'El franquismo y la memoria histórica',
        perfil: 'Ciudadanos, víctimas del franquismo, juristas',
        texto:
          'España fue la tercera potencia de desaparecidos del siglo XX tras Cambodia y la URSS. Las fosas comunes del franquismo siguen siendo objeto de litigio legal y político décadas después. La Ley de Memoria Democrática (2022) intentó avanzar, pero el debate sobre qué hacer con el pasado franquista —condenar, compensar, exhumar, enjuiciar— sigue abierto y polarizado en la sociedad española.',
      },
      {
        icono: '🗺️',
        titulo: '¿Está España ante una nueva crisis territorial?',
        perfil: 'Ciudadanos interesados en política actual',
        texto:
          'El procés catalán (2017) puso a prueba la Constitución de 1978 y el modelo autonómico español. El problema territorial —Cataluña, País Vasco, pero también la financiación de las comunidades— no es nuevo: lleva dos siglos recurriendo cíclicamente. Desde las guerras carlistas (que defendían los fueros) al actual debate sobre el federalismo, España sigue buscando la fórmula que concilie unidad y diversidad.',
      },
    ],

    faq: [
      {
        pregunta: '¿Qué fue la Constitución de Cádiz de 1812?',
        respuesta:
          'La Constitución de Cádiz, apodada "la Pepa" (se aprobó el día de San José), fue la primera constitución liberal española y una de las más avanzadas de su época. Proclamó la soberanía nacional, la separación de poderes, la libertad de prensa y la igualdad ante la ley. Fue aprobada por las Cortes reunidas en Cádiz mientras el resto de España estaba ocupada por las tropas napoleónicas. Su influencia fue enorme en toda Iberoamérica y Europa meridional.',
        tip: 'La Constitución de 1812 fue tan avanzada que fue abolida tres veces en solo 20 años por los monarcas que volvían al absolutismo.',
      },
      {
        pregunta: '¿Cuántas repúblicas ha tenido España?',
        respuesta:
          'España ha tenido dos repúblicas. La Primera República (1873-1874) duró apenas once meses y tuvo cuatro presidentes; fue un período de caos, cantones federales y pronunciamientos que terminó con el golpe del general Pavía. La Segunda República (1931-1939) fue mucho más estable en sus primeros años, aprobó una constitución progresista y emprendió reformas profundas, antes de ser derrocada por el golpe militar de julio de 1936.',
        tip: 'La Primera República tuvo cuatro presidentes en menos de un año: Pi i Margall, Figueras, Salmerón y Castelar.',
      },
      {
        pregunta: '¿Cuándo entró España en la Unión Europea?',
        respuesta:
          'España ingresó en la Comunidad Económica Europea (CEE, el antecedente de la UE) el 1 de enero de 1986, junto con Portugal. La adhesión fue el resultado de las negociaciones iniciadas tras la Transición democrática: Europa exigía una democracia consolidada, y la Constitución de 1978 abrió la puerta. El ingreso en la CEE transformó profundamente la economía española con los fondos estructurales europeos.',
        tip: 'España recibió más de 200.000 millones de euros en fondos europeos entre 1986 y 2013, transformando su infraestructura.',
      },
      {
        pregunta: '¿Qué fue el 23-F?',
        respuesta:
          'El 23 de febrero de 1981, el teniente coronel Antonio Tejero irrumpió con guardias civiles armados en el Congreso de los Diputados durante la investidura de Leopoldo Calvo-Sotejo. Simultáneamente, el general Milans del Bosch sacó los tanques a las calles de Valencia. El golpe fracasó cuando el rey Juan Carlos I apareció en televisión de madrugada en uniforme militar para rechazarlo explícitamente. Fue la mayor amenaza a la democracia española desde el franquismo.',
        tip: 'El discurso televisivo del rey a las 1:14 de la madrugada del 24 de febrero de 1981 fue visto por toda España y es considerado decisivo para salvar la democracia.',
      },
      {
        pregunta: '¿Cuántos años duró el franquismo?',
        respuesta:
          'El régimen de Francisco Franco duró 36 años: desde el 1 de abril de 1939 (fin oficial de la Guerra Civil) hasta el 20 de noviembre de 1975 (muerte de Franco). Es la dictadura más larga de Europa occidental en el siglo XX. Franco no fue juzgado por ningún tribunal internacional, a diferencia de los líderes nazis o fascistas italianos, principalmente por su neutralidad en la Segunda Guerra Mundial y el posterior alineamiento anticomunista con EE.UU.',
        tip: 'Franco nombró sucesor a Juan Carlos I en 1969 "a título de rey", saltándose la línea dinástica habitual que habría llevado a don Juan de Borbón.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por la Constitución de Cádiz (1812)',
        cuerpo:
          'Haz clic en el primer hito "La Guerra de Independencia y las Cortes de Cádiz". La Constitución de 1812 es el punto de partida de toda la historia liberal española. Comprenderla explica por qué las guerras carlistas, la Restauración y la Segunda República fueron lo que fueron: todas eran respuestas a esa primera gran promesa liberal.',
      },
      {
        titulo: 'Observa el patrón de pronunciamientos militares',
        cuerpo:
          'A lo largo de los siglos XIX y XX, el ejército español intervino en política mediante pronunciamientos con una frecuencia inusual en Europa: Riego (1820), Martínez Campos (1875), Primo de Rivera (1923), Franco (1936). Identifica cada uno en la línea del tiempo y reflexiona por qué el modelo político español necesitaba siempre del respaldo o la amenaza militar.',
      },
      {
        titulo: 'Compara la Segunda República con la Restauración',
        cuerpo:
          'Haz clic en "La Restauración Borbónica" y luego en "La Segunda República". La Restauración era estable pero corrupta; la República era progresista pero inestable. La clave está en la polarización: la República intentó reformas demasiado rápidas para una sociedad que no estaba preparada para asumirlas pacíficamente.',
      },
      {
        titulo: 'Sigue el hilo del franquismo a la democracia',
        cuerpo:
          'Compara los hitos "El Franquismo" y "La Transición Democrática". Lo extraordinario de la Transición española no fue solo que funcionara: fue que lo hizo en un plazo de apenas siete años (1975-1982), pasando de una dictadura de 40 años a una democracia homologable a cualquier europea, sin revolución ni guerra civil.',
      },
      {
        titulo: 'Termina con la España actual',
        cuerpo:
          'El último hito "La España Democrática y Europea" llega hasta el presente. Reflexiona: de la Constitución de Cádiz (1812) a la Constitución de 1978 median 166 años y más de 10 constituciones diferentes. La de 1978 lleva casi 50 años vigente: ya es la más longeva de la historia española. ¿Cuánto más aguantará sin una reforma?',
      },
    ],

    tips: [
      {
        icono: '📅',
        texto:
          'El siglo XIX español tuvo más de 50 golpes de Estado, pronunciamientos o intentonas militares. Ningún otro país europeo tuvo tantos en ese período. Comprender por qué el ejército español se convirtió en árbitro político es clave para entender el franquismo.',
      },
      {
        icono: '🗺️',
        texto:
          'España perdió su Imperio americano entre 1810 y 1825, mucho antes que otros imperios europeos. Esta pérdida prematura dejó a España sin los recursos coloniales que financiaron el desarrollo industrial de Gran Bretaña o Francia, lo que explica en parte su retraso económico decimonónico.',
      },
      {
        icono: '📚',
        texto:
          'La Guerra Civil española (1936-1939) fue el primer gran conflicto donde se utilizaron bombardeos sistemáticos sobre población civil (Guernica, Madrid, Barcelona). Hitler y Mussolini usaron España como campo de pruebas de las tácticas que después aplicarían en la Segunda Guerra Mundial.',
      },
      {
        icono: '🏛️',
        texto:
          'La Transición española fue estudiada como modelo en Sudáfrica, Chile, Portugal, Polonia y decenas de países en proceso de democratización. La fórmula de "reforma desde dentro" —cambiar el sistema usando las propias leyes del régimen— fue considerada un ingenio político sin precedentes.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que la Transición fue una ruptura total con el franquismo',
        cuerpo:
          'La Transición fue una "reforma pactada", no una ruptura. Muchos altos cargos franquistas —incluido el propio Adolfo Suárez— continuaron en sus puestos o pasaron a la política democrática. La Ley de Amnistía de 1977 impidió juzgar los crímenes del régimen. La continuidad institucional fue el precio de la paz, pero dejó heridas que siguen abiertas décadas después.',
      },
      {
        titulo: 'Pensar que la Guerra Civil fue solo un conflicto ideológico',
        cuerpo:
          'La Guerra Civil fue también una guerra de clases, una guerra de nacionalidades (el País Vasco y Cataluña apoyaron mayoritariamente a la República), una guerra religiosa (la Iglesia apoyó a Franco), y un conflicto internacional de facto donde Alemania, Italia, URSS y México intervienen directamente. Reducirla a "fascismo contra comunismo" simplifica una realidad mucho más compleja.',
      },
      {
        titulo: 'Asumir que el caciquismo desapareció con la democracia',
        cuerpo:
          'El caciquismo —el control del voto rural mediante redes clientelares locales— fue una constante de la Restauración pero no desapareció completamente con la democracia. Algunas formas de clientelismo político y de control local del poder persisten en la España democrática bajo otras formas. La democracia cambió las reglas, pero no eliminó todas las prácticas.',
      },
      {
        titulo: 'Creer que el PSOE siempre fue un partido moderado',
        cuerpo:
          'El PSOE de los años 30 era un partido marxista radical con sectores que rechazaban la democracia burguesa y apelaban a la revolución. Largo Caballero era conocido como "el Lenin español". La moderación del PSOE es posterior: llegó con la Transición y con Felipe González, que en 1979 eliminó el marxismo de los estatutos del partido. El PSOE de 1936 y el de 1982 son casi dos partidos diferentes.',
      },
    ],
  },
};
