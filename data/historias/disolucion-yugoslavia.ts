import type { HistoriaData } from './types';

export const disolucionYugoslavia: HistoriaData = {
  slug: 'disolucion-yugoslavia',
  titulo: 'La Disolución de Yugoslavia: Las Guerras de los Balcanes (1991-2008)',
  subtitulo: 'Una cronología factual del conflicto más sangriento en Europa desde 1945: la ruptura de una federación, las guerras que la acompañaron y la justicia internacional que las juzgó',
  descripcionSEO: 'Cronología interactiva y neutral de la disolución de Yugoslavia (1991-2008): de la crisis tras la muerte de Tito y el auge de los nacionalismos a las guerras de Eslovenia, Croacia y Bosnia, el asedio de Sarajevo, la limpieza étnica, el genocidio de Srebrenica (reconocido por el TPIY y la CIJ), los Acuerdos de Dayton, la Guerra de Kosovo y la intervención de la OTAN, y el fin de la federación. Hechos datados y cifras atribuidas, en 10 hitos y 6 eras.',
  keywords: [
    'disolución yugoslavia guerras balcanes cronología',
    'guerra de bosnia croacia eslovenia independencias 1991',
    'asedio de sarajevo limpieza étnica srebrenica genocidio',
    'acuerdos de dayton 1995 tpiy tribunal la haya',
    'guerra de kosovo otan intervención 1999 milosevic',
    'yugoslavia tito nacionalismos federación balcanes siglo xx',
  ],
  anioInicio: 1980,
  anioFin: 2008,

  hitos: [
    {
      id: 'crisis-federacion',
      nombre: 'La Yugoslavia de Tito y el auge de los nacionalismos',
      anioInicio: 1980,
      anioFin: 1990,
      color: '#6D7B8D',
      categoria: 'contexto',
      descripcion: 'La República Federal Socialista de Yugoslavia reunía seis repúblicas (Eslovenia, Croacia, Bosnia-Herzegovina, Serbia, Montenegro y Macedonia) y una notable diversidad nacional y religiosa. Tras la muerte de Josip Broz Tito en 1980, la federación entró en una crisis económica y política prolongada. La debilidad del poder central, la caída del comunismo en Europa (1989) y el auge de discursos nacionalistas en varias repúblicas —con figuras como Slobodan Milošević en Serbia— tensaron el sistema. Las primeras elecciones multipartidistas de 1990 dieron la victoria a partidos nacionalistas en casi todas las repúblicas y aceleraron el enfrentamiento sobre el futuro del país.',
      obraIconica: 'La muerte de Tito (1980) y la crisis de la federación yugoslava',
      paises: ['Yugoslavia'],
    },
    {
      id: 'independencias-1991',
      nombre: 'Las independencias y la Guerra de los Diez Días',
      anioInicio: 1991,
      anioFin: 1991,
      color: '#A0522D',
      categoria: 'ruptura',
      descripcion: 'En junio de 1991, Eslovenia y Croacia declararon su independencia. En Eslovenia, la intervención del Ejército Popular Yugoslavo (JNA) se saldó en la breve Guerra de los Diez Días, con pocas víctimas y la retirada federal. En Croacia, en cambio, la presencia de una importante minoría serbia opuesta a la secesión desencadenó un conflicto mucho más grave. El reconocimiento internacional de las nuevas repúblicas (con Alemania a la cabeza a comienzos de 1992) consolidó la ruptura de la federación, cuya legalidad y oportunidad fueron objeto de debate.',
      obraIconica: 'Declaraciones de independencia de Eslovenia y Croacia (junio de 1991)',
      paises: ['Eslovenia', 'Croacia', 'Yugoslavia'],
    },
    {
      id: 'guerra-croacia',
      nombre: 'La Guerra de Croacia',
      anioInicio: 1991,
      anioFin: 1995,
      color: '#8B0000',
      categoria: 'guerra',
      descripcion: 'La guerra en Croacia enfrentó a las fuerzas croatas con las serbias de la autoproclamada República Serbia de Krajina, apoyadas inicialmente por el JNA. En 1991 destacaron el asedio y la caída de Vukovar y el bombardeo de la ciudad histórica de Dubrovnik. El frente quedó estabilizado durante años bajo supervisión de la ONU. En 1995, las ofensivas croatas —en especial la Operación Tormenta— recuperaron la mayor parte del territorio y provocaron el éxodo de gran parte de la población serbia de la zona. El TPIY juzgó crímenes cometidos por ambas partes a lo largo del conflicto.',
      obraIconica: 'La caída de Vukovar (1991) y la Operación Tormenta (1995)',
      paises: ['Croacia'],
    },
    {
      id: 'guerra-bosnia',
      nombre: 'La Guerra de Bosnia',
      anioInicio: 1992,
      anioFin: 1995,
      color: '#8B0000',
      categoria: 'guerra',
      descripcion: 'Tras un referéndum de independencia en 1992, Bosnia-Herzegovina —el territorio étnicamente más mixto, con bosniacos (musulmanes bosnios), serbios y croatas— se hundió en la guerra más devastadora del conflicto. Fue una contienda a tres bandas, con alianzas cambiantes: la mayor parte del tiempo enfrentó a las fuerzas serbobosnias (apoyadas desde Belgrado) contra el gobierno bosnio, con un periodo añadido de guerra entre bosniacos y croatas (1993). Los tres bandos cometieron crímenes de guerra, aunque el TPIY estableció que la limpieza étnica fue de mayor escala en el bando serbobosnio. Se estima en torno a 100.000 muertos en Bosnia según el Centro de Investigación y Documentación de Sarajevo.',
      obraIconica: 'El estallido de la Guerra de Bosnia (1992), la más devastadora del conflicto',
      paises: ['Bosnia-Herzegovina'],
    },
    {
      id: 'asedio-sarajevo',
      nombre: 'El asedio de Sarajevo',
      anioInicio: 1992,
      anioFin: 1996,
      color: '#8B0000',
      categoria: 'guerra',
      descripcion: 'La capital bosnia, Sarajevo, sufrió el asedio más largo de una ciudad en la guerra moderna: casi cuatro años (1992-1996). Las fuerzas serbobosnias rodearon la ciudad desde las colinas y la sometieron a bombardeos de artillería y fuego de francotiradores contra la población civil. Episodios como las matanzas del mercado de Markale tuvieron gran repercusión internacional. Se calcula que el asedio causó en torno a 11.000 muertos, entre ellos más de un millar de niños, según las estimaciones recogidas por el TPIY. El asedio se convirtió en símbolo del sufrimiento civil de toda la guerra.',
      obraIconica: 'El asedio de Sarajevo (1992-1996), el más largo de la guerra moderna',
      paises: ['Bosnia-Herzegovina'],
    },
    {
      id: 'limpieza-etnica',
      nombre: 'La limpieza étnica y los campos',
      anioInicio: 1992,
      anioFin: 1995,
      color: '#3A3A3A',
      categoria: 'atrocidades',
      descripcion: 'La expresión "limpieza étnica" —expulsión forzosa de una población para homogeneizar un territorio— se popularizó a raíz de esta guerra. Millones de personas fueron desplazadas de sus hogares. En 1992 la prensa internacional documentó la existencia de campos de detención en el norte de Bosnia (Omarska, Keraterm, Trnopolje), con reclusos en condiciones extremas. El TPIY juzgó y condenó estos hechos como crímenes de lesa humanidad. Aunque los desplazamientos y abusos afectaron a las tres comunidades, los tribunales internacionales establecieron que la campaña fue más sistemática y de mayor alcance por parte de las fuerzas serbobosnias.',
      obraIconica: 'Los campos de detención de 1992 y la "limpieza étnica" en Bosnia',
      paises: ['Bosnia-Herzegovina', 'Croacia'],
    },
    {
      id: 'srebrenica',
      nombre: 'El genocidio de Srebrenica',
      anioInicio: 1995,
      anioFin: 1995,
      color: '#3A3A3A',
      categoria: 'atrocidades',
      descripcion: 'En julio de 1995, fuerzas serbobosnias al mando de Ratko Mladić tomaron Srebrenica, un enclave bosniaco que la ONU había declarado "zona segura" y que estaba bajo protección de un contingente neerlandés. En los días siguientes asesinaron a alrededor de 8.000 hombres y niños bosniacos y expulsaron al resto de la población. Es la mayor matanza en Europa desde la Segunda Guerra Mundial. Tanto el Tribunal Penal Internacional para la ex-Yugoslavia (TPIY) como la Corte Internacional de Justicia (CIJ, 2007) la calificaron jurídicamente de genocidio. Sus responsables, entre ellos Mladić y Radovan Karadžić, fueron posteriormente condenados.',
      obraIconica: 'El genocidio de Srebrenica (julio de 1995), reconocido por el TPIY y la CIJ',
      paises: ['Bosnia-Herzegovina'],
    },
    {
      id: 'dayton',
      nombre: 'La intervención internacional y los Acuerdos de Dayton',
      anioInicio: 1993,
      anioFin: 1995,
      color: '#4682B4',
      categoria: 'internacional',
      descripcion: 'La comunidad internacional intervino de forma titubeante: un embargo de armas, cascos azules de la ONU (UNPROFOR) con un mandato limitado, y "zonas seguras" que no siempre se protegieron. Tras Srebrenica y una nueva matanza en Sarajevo, la OTAN lanzó en agosto-septiembre de 1995 una campaña de bombardeos (Operación Fuerza Deliberada) contra posiciones serbobosnias. La presión militar y diplomática condujo a los Acuerdos de Dayton (noviembre-diciembre de 1995), que pusieron fin a la Guerra de Bosnia y organizaron el país en dos entidades. La paz detuvo los combates pero dejó un Estado complejo y dividido.',
      obraIconica: 'Los Acuerdos de Dayton (1995) ponen fin a la Guerra de Bosnia',
      paises: ['Bosnia-Herzegovina', 'Estados Unidos'],
    },
    {
      id: 'guerra-kosovo',
      nombre: 'La Guerra de Kosovo y la intervención de la OTAN',
      anioInicio: 1998,
      anioFin: 1999,
      color: '#6B5B95',
      categoria: 'kosovo',
      descripcion: 'En la provincia serbia de Kosovo, de mayoría albanesa, la tensión derivó en guerra abierta entre las fuerzas serbias y la guerrilla independentista (UÇK) en 1998-1999, con episodios graves de violencia y desplazamiento de población civil. Ante el fracaso de las negociaciones, la OTAN bombardeó Serbia durante 78 días en 1999 sin una autorización explícita del Consejo de Seguridad de la ONU, lo que abrió un intenso debate jurídico: para la OTAN fue una intervención humanitaria; para sus críticos (con Rusia y China a la cabeza), una acción contraria al derecho internacional. Serbia retiró sus fuerzas y Kosovo quedó bajo administración de la ONU.',
      obraIconica: 'La campaña de bombardeos de la OTAN sobre Serbia (1999)',
      paises: ['Serbia', 'Kosovo'],
    },
    {
      id: 'fin-yugoslavia-justicia',
      nombre: 'El fin de Yugoslavia y la justicia internacional',
      anioInicio: 1999,
      anioFin: 2008,
      color: '#2E7D64',
      categoria: 'desenlace',
      descripcion: 'La caída de Milošević en 2000 abrió una nueva etapa. Yugoslavia se reconvirtió en la unión de Serbia y Montenegro (2003), que se disolvió cuando Montenegro se independizó en 2006; Kosovo declaró unilateralmente su independencia en 2008, reconocida por unos países y no por otros. En paralelo, el TPIY de La Haya juzgó durante dos décadas a responsables de los tres bandos: hubo condenas por genocidio, crímenes de guerra y de lesa humanidad. Milošević murió en 2006 durante su juicio, sin sentencia. La región inició una lenta reconstrucción y un proceso de reconciliación aún abierto.',
      obraIconica: 'Los juicios del TPIY y la independencia de Montenegro (2006) y Kosovo (2008)',
      paises: ['Serbia', 'Montenegro', 'Kosovo', 'Bosnia-Herzegovina'],
    },
  ],

  eras: [
    {
      nombre: 'La crisis de la federación',
      desde: 1980,
      hasta: 1991,
      icono: '🏛️',
      hitosDestacados: ['La Yugoslavia de Tito y el auge de los nacionalismos'],
      eventos: [
        'Muerte de Tito (1980) y crisis económica y política de la federación',
        'Auge de los discursos nacionalistas en varias repúblicas',
        'Caída del comunismo en Europa del Este (1989)',
        'Primeras elecciones multipartidistas: victoria de partidos nacionalistas (1990)',
      ],
    },
    {
      nombre: 'El estallido',
      desde: 1991,
      hasta: 1992,
      icono: '💥',
      hitosDestacados: [
        'Las independencias y la Guerra de los Diez Días',
        'La Guerra de Croacia',
      ],
      eventos: [
        'Eslovenia y Croacia declaran la independencia (junio de 1991)',
        'Breve Guerra de los Diez Días en Eslovenia',
        'Asedio y caída de Vukovar; bombardeo de Dubrovnik',
        'Reconocimiento internacional de las nuevas repúblicas (1991-1992)',
      ],
    },
    {
      nombre: 'La Guerra de Bosnia',
      desde: 1992,
      hasta: 1994,
      icono: '⚔️',
      hitosDestacados: [
        'La Guerra de Bosnia',
        'El asedio de Sarajevo',
        'La limpieza étnica y los campos',
      ],
      eventos: [
        'Referéndum de independencia y estallido de la guerra en Bosnia (1992)',
        'Comienzo del asedio de Sarajevo',
        'Documentación internacional de los campos de detención (1992)',
        'Guerra añadida entre bosniacos y croatas (1993)',
        'Millones de personas desplazadas por la limpieza étnica',
      ],
    },
    {
      nombre: 'Srebrenica y Dayton',
      desde: 1994,
      hasta: 1996,
      icono: '🕯️',
      hitosDestacados: [
        'El genocidio de Srebrenica',
        'La intervención internacional y los Acuerdos de Dayton',
      ],
      eventos: [
        'Genocidio de Srebrenica: unas 8.000 víctimas (julio de 1995)',
        'Campaña de bombardeos de la OTAN contra posiciones serbobosnias (1995)',
        'Acuerdos de Dayton: fin de la Guerra de Bosnia (1995)',
        'Bosnia queda organizada en dos entidades',
      ],
    },
    {
      nombre: 'La Guerra de Kosovo',
      desde: 1996,
      hasta: 2000,
      icono: '🔥',
      hitosDestacados: ['La Guerra de Kosovo y la intervención de la OTAN'],
      eventos: [
        'Escalada del conflicto entre fuerzas serbias y la guerrilla UÇK (1998)',
        'Fracaso de las negociaciones de Rambouillet',
        'Bombardeos de la OTAN sobre Serbia durante 78 días (1999)',
        'Retirada serbia y administración de Kosovo por la ONU',
      ],
    },
    {
      nombre: 'El fin de Yugoslavia y la justicia',
      desde: 2000,
      hasta: 2008,
      icono: '⚖️',
      hitosDestacados: ['El fin de Yugoslavia y la justicia internacional'],
      eventos: [
        'Caída de Slobodan Milošević (2000)',
        'Serbia y Montenegro sustituye a Yugoslavia (2003)',
        'Independencia de Montenegro (2006); Milošević muere durante su juicio',
        'Declaración de independencia de Kosovo (2008)',
        'Condenas del TPIY a responsables de los tres bandos',
      ],
    },
  ],

  categorias: {
    contexto: 'Crisis de la federación',
    ruptura: 'Ruptura e independencias',
    guerra: 'Frentes y batallas',
    atrocidades: 'Crímenes contra civiles',
    internacional: 'Intervención internacional',
    kosovo: 'Guerra de Kosovo',
    desenlace: 'Fin y justicia',
  },

  colores: {
    contexto: '#6D7B8D',
    ruptura: '#A0522D',
    guerra: '#8B0000',
    atrocidades: '#3A3A3A',
    internacional: '#4682B4',
    kosovo: '#6B5B95',
    desenlace: '#2E7D64',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'La disolución de Yugoslavia provocó los conflictos más sangrientos que ha vivido Europa desde la Segunda Guerra Mundial. Entre 1991 y 2001, una federación de seis repúblicas se rompió en una sucesión de guerras —Eslovenia, Croacia, Bosnia y Kosovo— que causaron alrededor de 130.000-140.000 muertos y millones de desplazados, según las estimaciones más aceptadas. Esta cronología adopta un enfoque estrictamente factual: data los hechos, describe el desarrollo de cada guerra y nombra los crímenes cometidos apoyándose, cuando existen, en las sentencias de los tribunales internacionales (TPIY y CIJ), que son la referencia jurídica más sólida. No reparte culpas colectivas entre pueblos: la responsabilidad de los crímenes es individual y así la establecieron los tribunales. Donde hay debate abierto —como la legalidad de la intervención de la OTAN en 1999— se señala como tal.',

    tablaComparativa: [
      { hito: 'La Yugoslavia de Tito y los nacionalismos', periodo: '1980-1990', categoria: 'Crisis de la federación', personaje: 'Tito / Milošević', aportacion: 'Crisis de la federación tras 1980 y auge de los nacionalismos' },
      { hito: 'Las independencias', periodo: '1991', categoria: 'Ruptura e independencias', personaje: 'Tuđman / Kučan', aportacion: 'Eslovenia y Croacia rompen con la federación' },
      { hito: 'La Guerra de Bosnia', periodo: '1992-1995', categoria: 'Frentes y batallas', personaje: 'Izetbegović / Karadžić', aportacion: 'La guerra más devastadora; contienda a tres bandas' },
      { hito: 'El asedio de Sarajevo', periodo: '1992-1996', categoria: 'Frentes y batallas', personaje: 'Población civil de Sarajevo', aportacion: 'El asedio más largo de una ciudad en la guerra moderna' },
      { hito: 'El genocidio de Srebrenica', periodo: '1995', categoria: 'Crímenes contra civiles', personaje: 'Mladić (condenado)', aportacion: 'Mayor matanza en Europa desde 1945; genocidio según el TPIY y la CIJ' },
      { hito: 'La Guerra de Kosovo y la OTAN', periodo: '1998-1999', categoria: 'Guerra de Kosovo', personaje: 'UÇK / OTAN', aportacion: 'Intervención de la OTAN sin aval de la ONU; debate jurídico abierto' },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiantes de Historia',
        perfil: 'Secundaria, preparatoria y universidad',
        texto: 'Una secuencia clara para entender por qué se rompió Yugoslavia y cómo se encadenaron las distintas guerras. Útil para distinguir el papel de las causas políticas y económicas frente al mito de los "odios ancestrales".',
      },
      {
        icono: '⚖️',
        titulo: 'Derecho y relaciones internacionales',
        perfil: 'Justicia internacional e intervención humanitaria',
        texto: 'El conflicto dio lugar al primer gran tribunal penal internacional desde Núremberg (el TPIY), a la jurisprudencia sobre genocidio y limpieza étnica, y al debate sobre la legitimidad de la intervención de la OTAN en 1999. Un caso de estudio central del derecho internacional contemporáneo.',
      },
      {
        icono: '🕊️',
        titulo: 'Memoria y reconciliación',
        perfil: 'Comprender un conflicto reciente y aún vivo',
        texto: 'Es una guerra reciente, con víctimas y protagonistas vivos y narrativas nacionales todavía enfrentadas. Conocer los hechos con apoyo en las sentencias judiciales ayuda a una memoria basada en pruebas, no en relatos de bando.',
      },
      {
        icono: '🌍',
        titulo: 'Actualidad de los Balcanes',
        perfil: 'Entender la región hoy',
        texto: 'Las fronteras, tensiones y disputas actuales de los Balcanes occidentales —incluido el estatus de Kosovo— proceden directamente de estos años. Esta cronología ofrece el contexto imprescindible para seguir la actualidad de la región.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué se rompió Yugoslavia?',
        respuesta: 'No fue por "odios ancestrales" entre pueblos, una explicación que la mayoría de los historiadores rechazan. Pesaron más la crisis económica de los años ochenta, el vacío de poder tras la muerte de Tito (1980), el hundimiento del comunismo y, sobre todo, la movilización nacionalista impulsada por élites políticas de varias repúblicas. Fueron esos factores políticos, y no una enemistad eterna, los que convirtieron la diversidad yugoslava en guerra.',
        tip: 'Durante décadas, serbios, croatas y bosniacos convivieron y se casaban entre sí, sobre todo en las ciudades de Bosnia.',
      },
      {
        pregunta: '¿Fue Srebrenica realmente un genocidio?',
        respuesta: 'Sí, y no es una opinión sino una calificación jurídica firme. Tanto el Tribunal Penal Internacional para la ex-Yugoslavia (TPIY) como la Corte Internacional de Justicia (CIJ, en su sentencia de 2007) determinaron que la matanza de unos 8.000 hombres y niños bosniacos en julio de 1995 constituyó genocidio. Varios responsables, como Ratko Mladić y Radovan Karadžić, fueron condenados por ello.',
        tip: 'Srebrenica había sido declarada "zona segura" por la ONU y estaba bajo protección de cascos azules neerlandeses.',
      },
      {
        pregunta: '¿Todos los bandos cometieron crímenes?',
        respuesta: 'Sí. El TPIY juzgó y condenó a responsables de las tres comunidades (serbia, croata y bosniaca) por crímenes de guerra y de lesa humanidad. Reconocer esto no equivale a decir que todos los bandos cometieron el mismo número o el mismo tipo de crímenes: los tribunales establecieron que la limpieza étnica fue más sistemática y de mayor escala por parte de las fuerzas serbobosnias, y que Srebrenica fue genocidio. Responsabilidad compartida no significa responsabilidad igual.',
        tip: 'La responsabilidad penal es individual: se juzga a personas concretas, no a pueblos enteros.',
      },
      {
        pregunta: '¿Fue legal la intervención de la OTAN en 1999?',
        respuesta: 'Es objeto de un debate no resuelto. La OTAN bombardeó Serbia durante 78 días en 1999 sin una autorización expresa del Consejo de Seguridad de la ONU (que Rusia y China habrían vetado). Sus defensores la justificaron como una intervención humanitaria para frenar la limpieza étnica en Kosovo; sus críticos la consideraron una violación del derecho internacional. Una comisión independiente la resumió como "ilegal pero legítima". El debate sigue vivo entre juristas.',
        tip: 'Este caso influyó en el desarrollo posterior del principio de "responsabilidad de proteger" (R2P) en la ONU.',
      },
      {
        pregunta: '¿Qué diferencia hay entre "bosnio" y "bosniaco"?',
        respuesta: '"Bosnio" designa a cualquier habitante o ciudadano de Bosnia-Herzegovina, sea de la comunidad que sea. "Bosniaco" (o "musulmán bosnio") designa específicamente al grupo nacional de tradición musulmana, uno de los tres principales del país junto a los serbobosnios (ortodoxos) y los croatobosnios (católicos). Usar los términos con precisión evita confusiones frecuentes al hablar de la guerra.',
        tip: 'Las tres comunidades hablan lenguas casi idénticas; la diferencia principal es de identidad nacional y religiosa, no lingüística.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por entender qué era Yugoslavia',
        cuerpo: 'Haz clic en "La Yugoslavia de Tito y el auge de los nacionalismos". Sin comprender que era una federación de seis repúblicas diversas que entró en crisis tras 1980, las guerras posteriores resultan incomprensibles.',
      },
      {
        titulo: 'Distingue las distintas guerras',
        cuerpo: 'No fue una sola guerra, sino varias encadenadas: Eslovenia (breve), Croacia, Bosnia (la más grave) y Kosovo. La categoría "Frentes y batallas" y el hito de Kosovo te ayudan a separarlas en el tiempo y el espacio.',
      },
      {
        titulo: 'Lee los crímenes con apoyo en la justicia',
        cuerpo: 'La categoría "Crímenes contra civiles" (limpieza étnica, Srebrenica) se apoya en las sentencias del TPIY y la CIJ. Es la forma más sólida de hablar de responsabilidades sin caer en relatos de bando.',
      },
      {
        titulo: 'Observa el papel de la comunidad internacional',
        cuerpo: 'El hito de Dayton y el de Kosovo muestran una intervención internacional tardía y discutida: desde la pasividad inicial de la ONU hasta los bombardeos de la OTAN. Comprender esto es clave para los debates actuales sobre intervención humanitaria.',
      },
      {
        titulo: 'Cierra con el desenlace y la justicia',
        cuerpo: 'La era "El fin de Yugoslavia y la justicia" enlaza el final de los combates con la disolución definitiva de la federación y las décadas de juicios. La guerra terminó, pero la reconciliación sigue siendo un proceso abierto.',
      },
    ],

    tips: [
      {
        icono: '⚖️',
        texto: 'Cuando hables de crímenes de esta guerra, apóyate en las sentencias del TPIY y la CIJ. Son la referencia más sólida y neutral disponible, por encima de los relatos de cada comunidad.',
      },
      {
        icono: '🧩',
        texto: 'No fue "una guerra", sino un ciclo de guerras distintas (Eslovenia, Croacia, Bosnia, Kosovo) con actores y fechas propios. Confundirlas es el error más común al hablar del tema.',
      },
      {
        icono: '👥',
        texto: 'La responsabilidad de los crímenes es individual, no colectiva. Los tribunales condenaron a personas concretas de los tres bandos, no a "los serbios", "los croatas" o "los bosniacos" como pueblos.',
      },
      {
        icono: '🔢',
        texto: 'Las cifras de víctimas se politizaron durante y después de la guerra. Las estimaciones más fiables (como las del Centro de Investigación y Documentación de Sarajevo para Bosnia) dan horquillas y se basan en el recuento nominal de víctimas.',
      },
    ],

    errores: [
      {
        titulo: 'Explicarlo todo por "odios ancestrales"',
        cuerpo: 'Es el tópico más extendido y el que más rechazan los historiadores. Las distintas comunidades convivieron durante décadas, especialmente en las ciudades. Fueron la crisis económica y la movilización nacionalista de las élites políticas, no una enemistad eterna, las que desencadenaron las guerras.',
      },
      {
        titulo: 'Caer en el "falso equilibrio"',
        cuerpo: 'Que los tres bandos cometieran crímenes no significa que lo hicieran en la misma medida. Los tribunales internacionales establecieron diferencias de escala y calificaron Srebrenica como genocidio. Igualar mecánicamente a todas las partes deforma lo que la justicia ha probado.',
      },
      {
        titulo: 'Culpar a pueblos enteros',
        cuerpo: 'Hablar de "los serbios", "los croatas" o "los bosniacos" como culpables colectivos es tan injusto como inexacto. La responsabilidad penal es individual: la determinaron los tribunales caso por caso, y muchas personas de todas las comunidades se opusieron a la violencia o la sufrieron.',
      },
      {
        titulo: 'Confundir "bosnio" con "bosniaco"',
        cuerpo: '"Bosnio" es cualquier habitante de Bosnia; "bosniaco" es el grupo nacional de tradición musulmana. Usarlos como sinónimos lleva a errores al describir un conflicto en el que la identidad de cada comunidad fue central.',
      },
    ],
  },
};
