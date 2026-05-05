import type { HistoriaData } from './types';

export const espanaBorbones: HistoriaData = {
  slug: 'espana-borbones',
  titulo: 'La España de los Borbones: De Utrecht a Bayona',
  subtitulo:
    'Un siglo de reformas ilustradas, centralismo, Carlos III el rey alcalde y el colapso napoleónico que abre la España contemporánea',
  descripcionSEO:
    'Cronología interactiva de la España borbónica: de la Guerra de Sucesión y el Tratado de Utrecht (1700) a las Abdicaciones de Bayona (1808). Felipe V, Fernando VI, Carlos III, Ilustración, Decretos de Nueva Planta, Trafalgar y el colapso napoleónico en 10 hitos y 6 eras.',
  keywords: [
    'españa borbones siglo XVIII cronología',
    'guerra sucesión española utrecht felipe v',
    'decretos nueva planta cataluña centralismo',
    'carlos III ilustración reformas despotismo ilustrado',
    'jovellanos ilustración española reformas',
    'trafalgar 1805 nelson armada española',
    'abdicaciones bayona napoleón jose i españa',
    'catastro ensenada fernando VI',
  ],
  anioInicio: 1700,
  anioFin: 1808,

  hitos: [
    {
      id: 'guerra-sucesion',
      nombre: 'La Guerra de Sucesión: España Elige Dinastía',
      anioInicio: 1700,
      anioFin: 1714,
      color: '#8B0000',
      categoria: 'guerra',
      descripcion:
        'Felipe V (nieto de Luis XIV) vs el Archiduque Carlos de Austria. Guerra civil y europea simultánea: los aliados (Inglaterra, Portugal, Aragón) apoyan a Carlos; Castilla apoya a Felipe. Tratado de Utrecht (1713): Felipe V rey, pero España pierde Gibraltar, Menorca, Cerdeña, Nápoles y los Países Bajos. Una España más pequeña pero más cohesionada.',
      obraIconica:
        'Tratado de Utrecht — 11 abril 1713. España pierde Gibraltar para siempre. La herida que no cierra',
      paises: ['España', 'Francia', 'Austria', 'Gran Bretaña', 'Países Bajos'],
    },
    {
      id: 'nueva-planta',
      nombre: 'Los Decretos de Nueva Planta: España Centralizada',
      anioInicio: 1707,
      anioFin: 1720,
      color: '#B22222',
      categoria: 'reformas',
      descripcion:
        'Felipe V aplica los Decretos de Nueva Planta a Aragón, Valencia (1707), Cataluña (1716) y Mallorca (1715): se suprimen los fueros y las instituciones propias. España se centraliza siguiendo el modelo francés absolutista. La lengua castellana se impone en la administración. Los vencidos pagan el precio de haber apoyado al Archiduque.',
      obraIconica:
        'Decreto de Nueva Planta de Cataluña — 16 enero 1716. El documento que suprimió las instituciones catalanas durante 250 años',
      paises: ['España', 'Cataluña', 'Aragón', 'Valencia'],
    },
    {
      id: 'felipe-v-primero',
      nombre: 'Felipe V: El Primer Borbón Español',
      anioInicio: 1714,
      anioFin: 1746,
      color: '#C62828',
      categoria: 'politica',
      descripcion:
        'Felipe V introduce la corte versallesca en España. Su segunda esposa, Isabel de Farnesio, obsesionada con recuperar los territorios italianos. Guerras innecesarias en Italia. El Palacio Real de Madrid (empezado 1735) reemplaza el alcázar destruido por el fuego. La administración francesa moderniza el Estado.',
      obraIconica:
        'Palacio Real de Madrid — comenzado 1735. El mayor palacio de Europa occidental, símbolo de la nueva dinastía Borbón',
      paises: ['España', 'Italia', 'Francia'],
    },
    {
      id: 'fernando-vi',
      nombre: 'Fernando VI: La Paz Necesaria',
      anioInicio: 1746,
      anioFin: 1759,
      color: '#0277BD',
      categoria: 'reformas',
      descripcion:
        'Fernando VI rompe con la política aventurera de su padre: neutralidad estricta durante la Guerra de los Siete Años. El marqués de la Ensenada moderniza la hacienda y el ejército. El Catastro de Ensenada (1749): primer censo moderno de España. La paz exterior permite el crecimiento interior.',
      obraIconica:
        'El Catastro de Ensenada — 1752. 40.000 interrogatorios en toda España: el mayor proyecto estadístico del siglo XVIII',
      paises: ['España'],
    },
    {
      id: 'carlos-iii-reformas',
      nombre: 'Carlos III: El Mejor Alcalde de Madrid',
      anioInicio: 1759,
      anioFin: 1779,
      color: '#003399',
      categoria: 'ilustracion',
      descripcion:
        'El monarca más reformador de la historia española. Expulsión de los jesuitas (1767). Reforma agraria, libertad de comercio interior. Madrid se transforma: el Paseo del Prado, la Puerta de Alcalá, el Jardín Botánico, la Real Academia de Bellas Artes. El Motín de Esquilache (1766) revela los límites de la reforma desde arriba.',
      obraIconica:
        'El Paseo del Prado — Carlos III rediseña Madrid al estilo de las capitales ilustradas europeas',
      paises: ['España'],
    },
    {
      id: 'ilustracion-espanola',
      nombre: 'La Ilustración Española: Jovellanos y los Reformadores',
      anioInicio: 1770,
      anioFin: 1800,
      color: '#0288D1',
      categoria: 'ilustracion',
      descripcion:
        'Jovellanos, Campomanes, Olavide, Aranda: los ilustrados españoles intentan modernizar el país. El Informe de Ley Agraria (1787) propone la reforma del campo. Las Sociedades Económicas de Amigos del País difunden las ideas ilustradas. La censura inquisitorial frena los cambios más radicales.',
      obraIconica:
        'Retrato de Jovellanos — Goya, 1798. El hombre más brillante de la Ilustración española, preso por la Inquisición',
      paises: ['España'],
    },
    {
      id: 'reformas-coloniales',
      nombre: 'Las Reformas Borbónicas en América',
      anioInicio: 1765,
      anioFin: 1808,
      color: '#2E7D32',
      categoria: 'america',
      descripcion:
        'Las reformas borbónicas reorganizan el Imperio americano: Intendencias sustituyen a corregidores, Libre Comercio (1778), nuevos virreinatos (Río de la Plata, 1776). Los criollos se sienten discriminados frente a los peninsulares. Las reformas, paradójicamente, aceleran las independencias al crear una élite local frustrada.',
      obraIconica:
        'Reglamento de Libre Comercio — 1778. La reforma que dinamiza el comercio colonial pero siembra las semillas de la independencia',
      paises: ['España', 'Argentina', 'México', 'Perú', 'Colombia'],
    },
    {
      id: 'carlos-iv-godoy',
      nombre: 'Carlos IV y el Favorito Godoy',
      anioInicio: 1788,
      anioFin: 1805,
      color: '#E65100',
      categoria: 'politica',
      descripcion:
        'Carlos IV, monarca incompetente, entrega el poder a Manuel Godoy, presunto amante de la reina. La Revolución Francesa alarma a la Corte: guillotinan al primo Luis XVI. España primero guerrea contra Francia (1793), luego se alía con Napoleón (1796). Goya retrata la decadencia cortesana.',
      obraIconica:
        'La Familia de Carlos IV — Goya, 1800. El retrato más despiadado de la historia: la corte en descomposición',
      paises: ['España', 'Francia'],
    },
    {
      id: 'trafalgar',
      nombre: 'Trafalgar: El Fin del Imperio Naval',
      anioInicio: 1805,
      anioFin: 1806,
      color: '#FF8C00',
      categoria: 'guerra',
      descripcion:
        'La flota hispano-francesa al mando de Villeneuve es destruida por Nelson en el cabo Trafalgar (21 octubre 1805). España pierde 14 barcos de línea y 8.000 hombres. Nelson muere en la batalla. Fin definitivo del poder naval español. Sin flota no hay Imperio colonial: las independencias americanas se acercan.',
      obraIconica:
        'Batalla de Trafalgar — 21 octubre 1805. Nelson muere vencedor. España pierde su última armada',
      paises: ['España', 'Gran Bretaña', 'Francia'],
    },
    {
      id: 'bayona',
      nombre: 'Las Abdicaciones de Bayona: El Fin de una Era',
      anioInicio: 1808,
      anioFin: 1808,
      color: '#880E4F',
      categoria: 'politica',
      descripcion:
        'Napoleón atrae a la familia real a Bayona (Francia) y fuerza a Carlos IV y Fernando VII a abdicar. José Bonaparte (Pepe Botella) es coronado rey de España. El Dos de Mayo de 1808 en Madrid desencadena la guerra de independencia. El Antiguo Régimen español se derrumba: empieza la España contemporánea.',
      obraIconica:
        'El Dos de Mayo — Goya, 1814. La resistencia del pueblo de Madrid contra los mamelucos de Napoleón. El grito de guerra',
      paises: ['España', 'Francia'],
    },
  ],

  eras: [
    {
      nombre: 'La Guerra de Sucesión y la Nueva Dinastía',
      desde: 1700,
      hasta: 1746,
      icono: '⚔️',
      hitosDestacados: [
        'La Guerra de Sucesión: España Elige Dinastía',
        'Los Decretos de Nueva Planta: España Centralizada',
        'Felipe V: El Primer Borbón Español',
      ],
      eventos: [
        '1700: Muere Carlos II — Felipe de Anjou hereda el trono',
        '1713: Tratado de Utrecht — España pierde Gibraltar',
        '1716: Decretos de Nueva Planta en Cataluña',
      ],
    },
    {
      nombre: 'Fernando VI y la Paz',
      desde: 1746,
      hasta: 1759,
      icono: '🕊️',
      hitosDestacados: ['Fernando VI: La Paz Necesaria'],
      eventos: [
        '1749: Catastro de Ensenada — primer censo moderno',
        '1752: España neutral en la Guerra de los Siete Años',
        '1759: Muere Fernando VI sin herederos — sube Carlos III',
      ],
    },
    {
      nombre: 'Carlos III: El Despotismo Ilustrado',
      desde: 1759,
      hasta: 1779,
      icono: '🏛️',
      hitosDestacados: ['Carlos III: El Mejor Alcalde de Madrid'],
      eventos: [
        '1766: Motín de Esquilache — el pueblo protesta contra las reformas',
        '1767: Expulsión de los Jesuitas de España y América',
        '1778: Reglamento de Libre Comercio — apertura del Imperio',
      ],
    },
    {
      nombre: 'La Ilustración en Plenitud',
      desde: 1779,
      hasta: 1793,
      icono: '📚',
      hitosDestacados: [
        'La Ilustración Española: Jovellanos y los Reformadores',
        'Las Reformas Borbónicas en América',
      ],
      eventos: [
        '1780: Carlos III moderniza el Paseo del Prado de Madrid',
        '1788: Muere Carlos III — el mejor Borbón español',
        '1789: La Revolución Francesa alarma a la Corte española',
      ],
    },
    {
      nombre: 'La Crisis Borbónica',
      desde: 1793,
      hasta: 1806,
      icono: '⚡',
      hitosDestacados: [
        'Carlos IV y el Favorito Godoy',
        'Trafalgar: El Fin del Imperio Naval',
      ],
      eventos: [
        '1793: España declara la guerra a la Francia revolucionaria',
        '1796: Paz de Basilea — España se alía con Napoleón',
        '1805: Trafalgar — destrucción de la armada española',
      ],
    },
    {
      nombre: 'El Colapso: De Trafalgar a Bayona',
      desde: 1806,
      hasta: 1808,
      icono: '💥',
      hitosDestacados: ['Las Abdicaciones de Bayona: El Fin de una Era'],
      eventos: [
        '1807: Tratado de Fontainebleau — tropas francesas entran en España',
        '1808: Motín de Aranjuez — cae Godoy',
        '1808: Abdicaciones de Bayona — José Bonaparte rey de España',
      ],
    },
  ],

  categorias: {
    guerra: 'Guerras y Conflictos',
    reformas: 'Reformas y Centralismo',
    politica: 'Política e Instituciones',
    ilustracion: 'Ilustración y Reformas',
    america: 'Imperio Americano',
  },

  colores: {
    guerra: '#8B0000',
    reformas: '#0277BD',
    politica: '#C62828',
    ilustracion: '#003399',
    america: '#2E7D32',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'El siglo XVIII español es el siglo de la contradicción: la nueva dinastía Borbón trae las ideas ilustradas de Francia y moderniza España, pero el Antiguo Régimen sigue en pie. Carlos III es el mejor gobernante que ha tenido España, pero sus reformas no llegan a transformar la sociedad. El siglo termina con un Napoleón que no encuentra resistencia institucional: la España borbónica del XVIII se derrumba ante el primer empujón.',

    tablaComparativa: [
      {
        hito: 'La Guerra de Sucesión y la Nueva Dinastía',
        periodo: '1700–1746',
        categoria: 'Guerras y Reformas',
        personaje: 'Felipe V / Isabel de Farnesio',
        aportacion: 'Nueva dinastía, pérdida de Gibraltar, centralización del Estado',
      },
      {
        hito: 'Fernando VI y la Paz',
        periodo: '1746–1759',
        categoria: 'Reformas y Centralismo',
        personaje: 'Fernando VI / Marqués de la Ensenada',
        aportacion: 'Catastro de Ensenada, neutralidad exterior, modernización de la hacienda',
      },
      {
        hito: 'Carlos III: El Despotismo Ilustrado',
        periodo: '1759–1779',
        categoria: 'Ilustración y Reformas',
        personaje: 'Carlos III / Esquilache / Aranda',
        aportacion: 'Expulsión jesuitas, reforma urbana de Madrid, libre comercio interior',
      },
      {
        hito: 'La Ilustración en Plenitud',
        periodo: '1779–1793',
        categoria: 'Ilustración y Reformas',
        personaje: 'Jovellanos / Campomanes / Olavide',
        aportacion: 'Informe de Ley Agraria, Sociedades Económicas, reformas coloniales en América',
      },
      {
        hito: 'La Crisis Borbónica',
        periodo: '1793–1806',
        categoria: 'Política e Instituciones',
        personaje: 'Carlos IV / Godoy / Nelson',
        aportacion: 'Alianza con Napoleón, destrucción de la armada en Trafalgar, fin del poder naval',
      },
      {
        hito: 'El Colapso: De Trafalgar a Bayona',
        periodo: '1806–1808',
        categoria: 'Guerras y Conflictos',
        personaje: 'Fernando VII / Napoleón / Godoy',
        aportacion: 'Motín de Aranjuez, abdicaciones de Bayona, inicio de la guerra de independencia',
      },
    ],

    escenarios: [
      {
        icono: '👑',
        titulo: '¿Por qué Carlos III es tan bien valorado?',
        perfil: 'Estudiantes de Historia Moderna',
        texto:
          'Carlos III fue el monarca más reformador de la historia española. Durante su reinado se modernizó Madrid, se expulsó a los jesuitas (cuyo poder frenaba las reformas), se liberalizó el comercio interior y se impulsó la Ilustración. A diferencia de sus predecesores, priorizó el interés del Estado sobre las aventuras militares. Su legado —el Paseo del Prado, la Puerta de Alcalá, el Jardín Botánico— es visible aún hoy en Madrid.',
      },
      {
        icono: '🌎',
        titulo: 'Las reformas borbónicas en América: ¿aceleraron la independencia?',
        perfil: 'Historia de Hispanoamérica',
        texto:
          'Las reformas borbónicas en América buscaban mayor control fiscal y comercial desde la metrópolis. El efecto paradójico fue crear una élite criolla ilustrada, educada en las ideas de la Ilustración, que se sentía discriminada frente a los peninsulares. Las Intendencias sustituyeron a funcionarios locales por peninsulares. Cuando Napoleón desestabilizó España en 1808, esa élite criolla tenía la capacidad organizativa y el motivo para independizarse.',
      },
      {
        icono: '⛵',
        titulo: 'Trafalgar: ¿tuvo España alguna opción?',
        perfil: 'Historia Militar y Naval',
        texto:
          'La alianza con Napoleón (1796) fue un error estratégico que España pagó caro. En Trafalgar (1805), la flota combinada hispano-francesa debía escoltar la invasión de Inglaterra. El almirante Nelson, con una táctica rompedora —atacar en columnas perpendiculares a la línea enemiga— destruyó la flota antes de morir en combate. España perdió 14 navíos y 8.000 hombres. Sin flota no hay Imperio: las independencias americanas se volvieron inevitables.',
      },
      {
        icono: '🏳️',
        titulo: '¿Pudo España evitar la invasión napoleónica?',
        perfil: 'Historia Diplomática',
        texto:
          'España, aliada de Napoleón desde 1796, le había cedido el paso de tropas con el Tratado de Fontainebleau (1807). Cuando Napoleón decidió controlar la Península directamente, el gobierno de Godoy era demasiado débil para resistir. El Motín de Aranjuez (1808) derribó a Godoy, pero Fernando VII resultó ser aún más manipulable que su padre. Napoleón llevó a la familia real a Bayona con promesas que nunca pensaba cumplir.',
      },
    ],

    faq: [
      {
        pregunta: '¿Qué perdió España en el Tratado de Utrecht?',
        respuesta:
          'España cedió a Gran Bretaña Gibraltar y Menorca (y el Asiento de negros, el monopolio del comercio de esclavos con América). A Austria cedió los Países Bajos españoles, el Milanesado, Nápoles y Cerdeña. Felipe V conservó el trono, pero España quedó excluida de sus posesiones en Europa occidental y central. Gibraltar sigue siendo territorio británico hoy.',
        tip: 'El Tratado de Utrecht (1713) es el origen del conflicto por la soberanía de Gibraltar que dura hasta el siglo XXI.',
      },
      {
        pregunta: '¿Qué fue el Motín de Esquilache?',
        respuesta:
          'En 1766, el pueblo de Madrid se levantó contra el ministro Esquilache (italiano, favorito de Carlos III) por varios decretos: la prohibición de los sombreros de ala ancha y las capas largas (que ocultaban armas y dificultaban identificar a delincuentes). La revuelta, apoyada por los jesuitas y la nobleza, forzó el destierro de Esquilache. Carlos III aprendió la lección: hay límites a la reforma desde arriba.',
        tip: 'Los jesuitas fueron expulsados de España al año siguiente (1767). Carlos III los consideró los instigadores del motín.',
      },
      {
        pregunta: '¿Quién fue Godoy?',
        respuesta:
          'Manuel Godoy era un guardia de corps de origen noble pero sin relevancia política. Fue ascendido meteóricamente por Carlos IV (y presuntamente favorecido por la reina María Luisa). Llegó a ser Primer Ministro (1792-1797 y 1801-1808). Negoció la alianza con Napoleón que llevó al desastre de Trafalgar. Fue derrocado en el Motín de Aranjuez (1808) y exilado. Goya lo retrató en La Familia de Carlos IV entre los príncipes reales.',
        tip: 'El Motín de Aranjuez fue organizado por los seguidores de Fernando VII, que odiaba a Godoy y quería destronar a su propio padre.',
      },
      {
        pregunta: '¿Por qué se llaman Decretos de Nueva Planta?',
        respuesta:
          '"Nueva Planta" significa literalmente nueva base o nueva estructura. Felipe V, tras vencer a los territorios de la Corona de Aragón en la Guerra de Sucesión, reorganizó su gobierno desde cero ("nueva planta"), aboliendo los fueros, las instituciones propias y las leyes particulares de Aragón, Valencia, Cataluña y Mallorca. Era la imposición del modelo centralista castellano-francés a los perdedores.',
        tip: 'Castilla no recibió Decretos de Nueva Planta porque apoyó a Felipe V. Sus instituciones se convirtieron en el modelo para toda España.',
      },
      {
        pregunta: '¿Cuándo se pintó La Familia de Carlos IV de Goya?',
        respuesta:
          'Francisco de Goya pintó La Familia de Carlos IV en 1800, durante el reinado del propio Carlos IV. Es un retrato de grupo de 14 personajes que incluye al rey, la reina María Luisa, el futuro Fernando VII y al propio Goya (que se autorretrató en la sombra, como hizo Velázquez en Las Meninas). La pintura es célebre por su descarnado realismo: muchos críticos ven en los retratos una crítica velada a la decadencia de la familia real.',
        tip: 'Goya era sordo desde 1792. Su aislamiento le permitió una libertad artística que sus contemporáneos en la corte no se habrían atrevido a ejercer.',
      },
    ],

    pasos: [
      {
        titulo: 'La Guerra de Sucesión y Utrecht: el punto de partida',
        cuerpo:
          'El siglo XVIII español empieza con una guerra dinástica que divide Europa. El Tratado de Utrecht (1713) inaugura un nuevo orden: España pierde sus posesiones europeas pero consolida un territorio peninsular más cohesionado bajo una nueva dinastía francesa. Los Decretos de Nueva Planta son la consecuencia directa: España se centraliza al precio de suprimir los fueros de los territorios derrotados.',
      },
      {
        titulo: 'Los Borbones reformadores: de Felipe V a Carlos III',
        cuerpo:
          'Felipe V introduce el modelo versallesco de administración. Fernando VI apuesta por la paz y la modernización interior. Carlos III lleva el despotismo ilustrado a su máxima expresión: expulsión de jesuitas, reforma urbana de Madrid, libre comercio interior. El Motín de Esquilache (1766) revela que las reformas desde arriba tienen límites cuando choca con los usos y costumbres del pueblo.',
      },
      {
        titulo: 'La Ilustración española: luces y sombras',
        cuerpo:
          'Jovellanos, Campomanes y las Sociedades Económicas de Amigos del País intentan aplicar las ideas ilustradas a la reforma agraria, la educación y la economía. Pero la Inquisición sigue activa, la nobleza resiste las reformas que afectan sus privilegios y la Iglesia frena los cambios más radicales. La Ilustración española brilla con luz propia pero no consigue transformar las estructuras sociales.',
      },
      {
        titulo: 'La crisis final: Carlos IV, Godoy y Trafalgar',
        cuerpo:
          'Carlos IV delega el poder en Godoy y arrastra a España a la órbita napoleónica. La alianza con Francia lleva a Trafalgar (1805): la destrucción de la armada española cierra definitivamente el ciclo del Imperio naval. Sin flota no hay control del Atlántico ni de las colonias americanas. El desastre militar anticipa el desastre político.',
      },
      {
        titulo: 'Bayona y el fin del Antiguo Régimen borbónico',
        cuerpo:
          'El Motín de Aranjuez (1808) derriba a Godoy pero no salva a la monarquía. Napoleón atrae a la familia real a Bayona con promesas falsas y fuerza la abdicación de Carlos IV y Fernando VII. El Dos de Mayo de 1808 en Madrid desencadena la guerra de independencia y abre la España contemporánea: el Antiguo Régimen borbónico no sobrevive al choque con el poder napoleónico.',
      },
    ],

    tips: [
      {
        icono: '🗺️',
        texto:
          'El Tratado de Utrecht (1713) es la clave para entender la España borbónica: define un país más pequeño que el de los Austrias pero más centralizado. Gibraltar, cedido entonces, sigue siendo un contencioso diplomático 300 años después. Las fronteras negociadas en Utrecht configuraron el mapa de Europa occidental durante un siglo.',
      },
      {
        icono: '🎨',
        texto:
          'Goya es el testigo visual de todo el período. Retrató a Carlos III con dignidad, a Carlos IV con despiadado realismo y pintó el Dos de Mayo como gesta popular. Sus Pinturas negras, realizadas en su vejez, son el contrapunto oscuro de un siglo que empezó con las luces de la Ilustración y terminó con la guerra.',
      },
      {
        icono: '📊',
        texto:
          'El Catastro de Ensenada (1749-1756) es el mayor proyecto estadístico de la España del siglo XVIII: 40.000 cuestionarios de 40 preguntas en todos los municipios de la Corona de Castilla. Su objetivo era reformar el sistema fiscal, pero nunca se aplicó por resistencia de los poderosos. Es la fuente histórica más completa para conocer la España del siglo XVIII.',
      },
      {
        icono: '🌎',
        texto:
          'Las reformas borbónicas en América (Intendencias, Libre Comercio, nuevos virreinatos) buscaban modernizar el Imperio pero crearon el efecto contrario: una élite criolla ilustrada y frustrada que encontró en 1808 la oportunidad para la independencia. Sin las reformas borbónicas del XVIII, las independencias americanas del XIX habrían sido más difíciles.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que la Ilustración llegó tarde a España',
        cuerpo:
          'España tuvo una Ilustración propia y vigorosa: Jovellanos, Campomanes, Feijóo, Aranda. El retraso no era intelectual sino estructural: la Inquisición, la nobleza y la Iglesia bloqueaban las reformas más radicales. Pero figuras como Jovellanos o Cabarrús estaban perfectamente al tanto de las ideas europeas de su tiempo. La Ilustración española no fue inferior, fue más frenada.',
      },
      {
        titulo: 'Pensar que todos los Borbones fueron iguales',
        cuerpo:
          'El contraste entre los Borbones del XVIII es enorme. Fernando VI fue prudente y eficaz. Carlos III es considerado el mejor gobernante de la historia española moderna. Carlos IV fue incompetente y delegó el poder en Godoy. Aplicar el mismo rasero a todos los Borbones es un error histórico: la calidad del monarca determinó en buena medida el éxito o fracaso de las reformas.',
      },
      {
        titulo: 'Creer que Godoy era solo un favorito sin capacidad',
        cuerpo:
          'Godoy era sin duda el favorito de los reyes, pero también fue un político con sus propias ideas reformistas: impulsó la desamortización de Godoy (1798), adelantándose a la del siglo XIX, y intentó modernizar el ejército. Sus errores estratégicos —la alianza con Napoleón, la cesión del paso de tropas en 1807— fueron desastrosos, pero reducirlo a un simple favorito incompetente simplifica una figura compleja.',
      },
      {
        titulo: 'Pensar que Trafalgar fue solo una batalla naval sin consecuencias',
        cuerpo:
          'Trafalgar (1805) fue el fin del poder naval español y, por tanto, del control efectivo del Imperio americano. Sin armada no hay capacidad de enviar tropas, recursos ni autoridad a las colonias. Las guerras de independencia americanas (1810-1826) son, en parte, una consecuencia directa de Trafalgar: España no tenía flota para sostener el Imperio cuando las colonias decidieron independizarse.',
      },
    ],
  },
};
