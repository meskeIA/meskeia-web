import type { HistoriaData } from './types';

export const historiaItalia: HistoriaData = {
  slug: 'historia-italia',
  titulo: 'Historia de Italia: Del Risorgimento al Motor de la Cultura Europea',
  subtitulo:
    'De la unificación de Cavour y Garibaldi al fascismo de Mussolini, el milagro económico y la Italia contemporánea',
  descripcionSEO:
    'Cronología interactiva de Italia moderna: del Risorgimento (1861) a la Italia del siglo XXI. Garibaldi, Mussolini, el milagro económico, Tangentopoli y Berlusconi en 10 hitos y 6 eras.',
  keywords: [
    'historia italia cronología',
    'risorgimento garibaldi cavour unificación italia',
    'mussolini fascismo segunda guerra mundial',
    'milagro económico italiano fiat vespa',
    'tangentopoli mani pulite primera república',
    'berlusconi italia contemporánea giorgia meloni',
  ],
  anioInicio: 1861,
  anioFin: 9999,

  hitos: [
    {
      id: 'risorgimento',
      nombre: 'El Risorgimento y la Unificación de Italia',
      anioInicio: 1861,
      anioFin: 1871,
      color: '#1565C0',
      categoria: 'fundacion',
      descripcion:
        'Cavour, Garibaldi y Mazzini culminan el proceso de unificación. Víctor Manuel II primer rey de Italia. Los Mil de Garibaldi conquistan el Sur. Roma, capital en 1871. Nace el Estado italiano moderno sobre un mosaico de reinos, ducados y estados papales.',
      obraIconica:
        "'La Camicia Rossa' — Garibaldi con los Mil voluntarios en Marsala, 11 mayo 1860. El gesto fundacional",
      paises: ['Italia', 'Piamonte-Cerdeña', 'Austria'],
    },
    {
      id: 'italia-liberal',
      nombre: 'La Italia Liberal y la Cuestión del Sur',
      anioInicio: 1871,
      anioFin: 1900,
      color: '#0277BD',
      categoria: 'fundacion',
      descripcion:
        'Primera democracia italiana frágil: el trasformismo, el caciquismo, la Questione Meridionale. Las revueltas del campo siciliano (Fasci Siciliani 1893). Primera aventura colonial en Etiopía: humillante derrota en Adua (1896). La emigración masiva al continente americano.',
      obraIconica:
        'Derrota de Adua — 1 marzo 1896. Italia pierde ante Etiopía: primera nación africana que vence a una potencia europea',
      paises: ['Italia', 'Etiopía'],
    },
    {
      id: 'era-giolitti',
      nombre: 'La Era Giolitti y el Boom Industrial',
      anioInicio: 1900,
      anioFin: 1915,
      color: '#0288D1',
      categoria: 'politica',
      descripcion:
        'Giovanni Giolitti domina la política italiana durante 15 años. Sufragio universal masculino (1912). Boom industrial del Norte: Fiat (1899), SNIA, acero. Conquista de Libia (1911). La emigración alcanza su pico: 600.000 italianos al año abandonan el país.',
      obraIconica:
        'Fiat, Turín 1899 — El automóvil italiano nace. El norte industrial que divide Italia en dos',
      paises: ['Italia', 'Libia'],
    },
    {
      id: 'gran-guerra',
      nombre: 'Italia en la Gran Guerra y la Victoria Mutilada',
      anioInicio: 1915,
      anioFin: 1919,
      color: '#C62828',
      categoria: 'guerra',
      descripcion:
        "Italia entra en guerra en 1915 con la promesa de Trento, Trieste e Istria. Desastre de Caporetto (1917): 300.000 prisioneros. Vittorio Veneto (1918): victoria final. La Conferencia de París defrauda las esperanzas: la 'victoria mutilada' de Sonnino abre el camino al fascismo.",
      obraIconica:
        'Batalla de Caporetto — octubre 1917. La mayor derrota del ejército italiano. El trauma que engendró el fascismo',
      paises: ['Italia', 'Austria-Hungría', 'Francia', 'Gran Bretaña'],
    },
    {
      id: 'fascismo',
      nombre: 'El Fascismo: Mussolini en el Poder',
      anioInicio: 1922,
      anioFin: 1940,
      color: '#880E4F',
      categoria: 'guerra',
      descripcion:
        'Marcha sobre Roma (1922): Mussolini toma el poder. Dictadura consolidada en 1925. Pactos de Letrán (1929): el Vaticano reconoce el Estado italiano. Conquista de Etiopía (1935). Leyes Raciales (1938). El Eje Roma-Berlín arrastra a Italia hacia la guerra.',
      obraIconica:
        'Marcha sobre Roma — 28 octubre 1922. Mussolini llega al poder sin disparar un tiro. El modelo que inspiró a Hitler',
      paises: ['Italia', 'Etiopía', 'Alemania'],
    },
    {
      id: 'segunda-guerra',
      nombre: 'Italia en la Segunda Guerra Mundial',
      anioInicio: 1940,
      anioFin: 1945,
      color: '#B71C1C',
      categoria: 'guerra',
      descripcion:
        'Italia entra en guerra en 1940 con un ejército mal preparado. Desastres en África y Grecia. Desembarco aliado en Sicilia (1943): Mussolini derrocado. Italia firma el armisticio. Los nazis ocupan el Norte. La Resistencia partisana. Fusilamiento de Mussolini (28 abril 1945).',
      obraIconica:
        'Fusilamiento de Mussolini en Giulino di Mezzegra — 28 abril 1945. El Duce colgado boca abajo en Milán',
      paises: ['Italia', 'Alemania', 'EE.UU.', 'Gran Bretaña'],
    },
    {
      id: 'republica-constitucion',
      nombre: 'La República, la Constitución y la Guerra Fría',
      anioInicio: 1946,
      anioFin: 1960,
      color: '#2E7D32',
      categoria: 'republica',
      descripcion:
        'Referéndum de 1946: la República derrota a la Monarquía por estrecho margen. Constitución de 1948. La DC (Democracia Cristiana) domina bajo la tutela de EE.UU. y el Vaticano. El PCI, el mayor partido comunista de Europa occidental, en la oposición permanente. Plan Marshall reconstruye el país.',
      obraIconica:
        'Referéndum Monarquía-República — 2 junio 1946. Italia elige la república por 54% de votos. Día de la República',
      paises: ['Italia', 'EE.UU.', 'Vaticano'],
    },
    {
      id: 'milagro-economico',
      nombre: 'El Miracolo Economico Italiano',
      anioInicio: 1958,
      anioFin: 1970,
      color: '#1B5E20',
      categoria: 'economia',
      descripcion:
        'Italia pasa de la pobreza agraria a la octava economía mundial en una década. Fiat 500 y Vespa como símbolos. La RAI, la moda, el diseño industrial. Emigración interna del Sur al triángulo industrial. Autostrada del Sole. Italia cofundadora de la CEE.',
      obraIconica:
        'Fiat 500 — 1957. El coche que motorizó Italia y simboliza el milagro económico: democracia sobre ruedas',
      paises: ['Italia'],
    },
    {
      id: 'anos-plomo',
      nombre: 'Los Años de Plomo y Tangentopoli',
      anioInicio: 1969,
      anioFin: 1994,
      color: '#E65100',
      categoria: 'crisis',
      descripcion:
        "La 'estrategia de tensión': bombas neofascistas y terrorismo de las Brigadas Rojas. Aldo Moro secuestrado y asesinado (1978). Crisis económica de los 70. Tangentopoli (1992): la operación 'Mani Pulite' destruye la primera república, encarcelando a miles de políticos corruptos.",
      obraIconica:
        "Secuestro y muerte de Aldo Moro — 9 mayo 1978. El fin de la 'democrazia bloccata'. Italia no pudo proteger a su mejor político",
      paises: ['Italia'],
    },
    {
      id: 'italia-contemporanea',
      nombre: 'Berlusconi, Crisis y la Italia del Siglo XXI',
      anioInicio: 1994,
      anioFin: 9999,
      color: '#37474F',
      categoria: 'politica',
      descripcion:
        'Berlusconi y el berlusconismo dominan 20 años de política. Crisis de la deuda soberana (2011): Draghi salva a Italia. Renzi intenta reformas. Giorgia Meloni (2022): primera mujer primera ministra de Italia. Italia debate entre europeísmo y soberanismo en una economía dual Norte-Sur aún no resuelta.',
      obraIconica:
        'Mario Draghi, Premier (2021-2022) — El gobernador del BCE que salvó el euro como premier salva también a Italia de la quiebra',
      paises: ['Italia', 'Europa'],
    },
  ],

  eras: [
    {
      nombre: 'El Risorgimento y la Italia Liberal',
      desde: 1861,
      hasta: 1915,
      icono: '🤝',
      hitosDestacados: [
        'El Risorgimento y la Unificación de Italia',
        'La Italia Liberal y la Cuestión del Sur',
        'La Era Giolitti y el Boom Industrial',
      ],
      eventos: [
        '1861: Proclamación del Reino de Italia (17 marzo)',
        '1871: Roma, capital de Italia',
        '1896: Derrota de Adua — Etiopía humilla a Italia',
      ],
    },
    {
      nombre: 'Gran Guerra y Fascismo',
      desde: 1915,
      hasta: 1945,
      icono: '⚔️',
      hitosDestacados: [
        'Italia en la Gran Guerra y la Victoria Mutilada',
        'El Fascismo: Mussolini en el Poder',
        'Italia en la Segunda Guerra Mundial',
      ],
      eventos: [
        '1915: Italia entra en la Primera Guerra Mundial',
        '1922: Marcha sobre Roma — Mussolini toma el poder',
        '1943: Armisticio — Italia cambia de bando',
      ],
    },
    {
      nombre: 'La República y el Milagro',
      desde: 1945,
      hasta: 1969,
      icono: '⭐',
      hitosDestacados: [
        'La República, la Constitución y la Guerra Fría',
        'El Miracolo Economico Italiano',
      ],
      eventos: [
        '1946: Referéndum Monarquía-República (2 junio)',
        '1948: Constitución italiana en vigor',
        '1957: Tratado de Roma — Italia cofundadora de la CEE',
      ],
    },
    {
      nombre: 'Los Años de Plomo',
      desde: 1969,
      hasta: 1994,
      icono: '💥',
      hitosDestacados: ['Los Años de Plomo y Tangentopoli'],
      eventos: [
        '1969: Bomba de la Piazza Fontana — inicio de la estrategia de tensión',
        '1978: Asesinato de Aldo Moro por las Brigadas Rojas',
        "1992: Tangentopoli — 'Mani Pulite' acaba con la Primera República",
      ],
    },
    {
      nombre: 'La Segunda República y Berlusconi',
      desde: 1994,
      hasta: 2011,
      icono: '📺',
      hitosDestacados: ['Berlusconi, Crisis y la Italia del Siglo XXI'],
      eventos: [
        '1994: Berlusconi funda Forza Italia y gana las elecciones',
        '2002: Italia adopta el euro',
        '2006: Italia gana el Mundial de Fútbol en Berlín',
      ],
    },
    {
      nombre: 'Italia en el Siglo XXI',
      desde: 2011,
      hasta: 9999,
      icono: '🚀',
      hitosDestacados: ['Berlusconi, Crisis y la Italia del Siglo XXI'],
      eventos: [
        '2011: Crisis de la deuda soberana — Draghi salva a Italia',
        '2021: Draghi, premier técnico',
        '2022: Giorgia Meloni, primera premier mujer de Italia',
      ],
    },
  ],

  categorias: {
    fundacion: 'Fundación y Liberal',
    politica: 'Política e Instituciones',
    guerra: 'Guerras y Fascismo',
    republica: 'República y Democracia',
    economia: 'Economía y Sociedad',
    crisis: 'Crisis y Transformación',
  },

  colores: {
    fundacion: '#1565C0',
    politica: '#0277BD',
    guerra: '#C62828',
    republica: '#2E7D32',
    economia: '#1B5E20',
    crisis: '#E65100',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'Italia tardó en nacer como nación — y cuando lo hizo, en 1861, heredó siglos de fragmentación, rivalidades regionales y diferencias abismales entre el Norte industrial y el Sur agrario. En menos de cien años vivió la unificación, el fascismo, la Segunda Guerra Mundial, el milagro económico y Tangentopoli. Italia es el país donde los extremos coexisten: la mayor concentración de patrimonio artístico del mundo y una de las clases políticas más cuestionadas de Europa.',

    tablaComparativa: [
      {
        hito: 'El Risorgimento y la Italia Liberal',
        periodo: '1861-1915',
        categoria: 'Fundación y Liberal',
        personaje: 'Cavour / Garibaldi / Giolitti',
        aportacion:
          'Creación del Estado italiano moderno, primer boom industrial del Norte',
      },
      {
        hito: 'Gran Guerra y Victoria Mutilada',
        periodo: '1915-1919',
        categoria: 'Guerras y Fascismo',
        personaje: 'Orlando / Sonnino',
        aportacion:
          "Derrota de Caporetto, victoria de Vittorio Veneto, trauma de la 'victoria mutilada'",
      },
      {
        hito: 'El Fascismo: Mussolini en el Poder',
        periodo: '1922-1940',
        categoria: 'Guerras y Fascismo',
        personaje: 'Benito Mussolini',
        aportacion:
          'Dictadura, Pactos de Letrán, conquista de Etiopía, alianza con Hitler',
      },
      {
        hito: 'La República y la Constitución',
        periodo: '1946-1960',
        categoria: 'República y Democracia',
        personaje: 'De Gasperi / Togliatti',
        aportacion:
          'República parlamentaria, Constitución 1948, cofundadora de la CEE',
      },
      {
        hito: 'El Miracolo Economico',
        periodo: '1958-1970',
        categoria: 'Economía y Sociedad',
        personaje: 'Enrico Mattei / Adriano Olivetti',
        aportacion:
          'De la pobreza agraria a la octava economía mundial: Fiat 500, Vespa, diseño industrial',
      },
      {
        hito: 'Los Años de Plomo y Tangentopoli',
        periodo: '1969-1994',
        categoria: 'Crisis y Transformación',
        personaje: 'Aldo Moro / Di Pietro',
        aportacion:
          'Terrorismo de Brigadas Rojas, Tangentopoli destruye la Primera República',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: '¿Cómo fue posible el fascismo en Italia?',
        perfil: 'Historia política europea',
        texto:
          "El fascismo italiano nació de la conjunción de tres factores: el trauma de la 'victoria mutilada' tras la Primera Guerra Mundial, la crisis económica y el miedo al comunismo de la burguesía y los propietarios agrarios. Mussolini ofreció orden, grandeza nacional y protección frente al caos. Las instituciones liberales italianas, frágiles y desprestigiadas, no resistieron. La Marcha sobre Roma (1922) demostró que el Estado liberal podía rendirse sin disparar un tiro: una lección que Hitler estudió con atención.",
      },
      {
        icono: '🏭',
        titulo: 'El milagro económico: de la pobreza al diseño mundial en 10 años',
        perfil: 'Economía e historia contemporánea',
        texto:
          'Entre 1958 y 1968, Italia creció a un promedio del 6% anual. El PIB per cápita se multiplicó por tres. El Norte —el triángulo Milán-Turín-Génova— se convirtió en un polo industrial europeo de primera magnitud. El Sur siguió siendo agrario: la emigración interna trasladó millones de italianos del Mezzogiorno a las fábricas del Norte. Fiat, Olivetti, Piaggio, Ferragamo, Versace: Italia inventó la idea de que el diseño y la producción industrial podían coexistir. El milagro fue real, pero dejó sin resolver la fractura Norte-Sur.',
      },
      {
        icono: '⚖️',
        titulo: '¿Qué fue Tangentopoli y cambió algo?',
        perfil: 'Política e instituciones italianas',
        texto:
          "Tangentopoli ('ciudad del soborno') fue la operación judicial 'Mani Pulite' (Manos Limpias) iniciada en Milán en 1992. El juez Di Pietro descubrió un sistema generalizado de sobornos que financiaba a todos los partidos del arco constitucional. En dos años, miles de políticos y empresarios fueron imputados. La Democracia Cristiana y el Partido Socialista —que habían gobernado durante 50 años— desaparecieron. ¿Cambió algo? El sistema clientelar sobrevivió bajo nuevas formas, y Berlusconi llenó el vacío político con sus propios métodos.",
      },
      {
        icono: '🗺️',
        titulo: 'La cuestión del Sur: ¿solucionada o permanente?',
        perfil: 'Economía regional y política italiana',
        texto:
          'La Questione Meridionale —la brecha entre el Norte industrial y el Sur agrario— es tan antigua como Italia. En 1861, el Sur era más rico que el Norte en términos de PIB per cápita. La política económica del Reino de Italia favoreció sistemáticamente al Norte: los impuestos del Sur financiaron el desarrollo piamontés. Hoy, 160 años después, el PIB per cápita de Lombardía duplica al de Calabria. La mafias (Cosa Nostra, Camorra, Ndrangheta) controlan sectores enteros de la economía meridional. La cuestión no está resuelta.',
      },
    ],

    faq: [
      {
        pregunta: '¿Cuándo se unificó Italia?',
        respuesta:
          'El Reino de Italia se proclamó el 17 de marzo de 1861, aunque el proceso fue gradual: Venecia se incorporó en 1866 y Roma —arrebatada al Papa— en 1871, año en que la ciudad se convirtió en capital. El proceso de unificación (Risorgimento) duró desde 1848 hasta 1871.',
        tip: "Antes de 1861, el territorio italiano estaba dividido entre el Reino de Piamonte-Cerdeña, el Reino de las Dos Sicilias, los Estados Pontificios, el Ducado de Parma, el de Módena y la Lombardía austriaca.",
      },
      {
        pregunta: "¿Qué fue la 'victoria mutilada'?',",
        respuesta:
          "Al terminar la Primera Guerra Mundial, Italia esperaba recibir territorios prometidos en el Tratado de Londres (1915): Dalmacia, Fiume, colonias africanas. En la Conferencia de París (1919), los aliados no cumplieron. El poeta y político Gabriele D'Annunzio acuñó la expresión 'vittoria mutilata'. El desencanto con la democracia liberal fue el caldo de cultivo del fascismo.",
        tip: "Mussolini aprovechó la indignación de los veteranos y de la clase media arruinada por la inflación para construir sus escuadras fascistas (Camicie Nere).",
      },
      {
        pregunta: '¿Qué fue la Resistencia italiana?',
        respuesta:
          'Tras el armisticio de septiembre de 1943 y la ocupación nazi del Norte de Italia, grupos de partisanos (comunistas, socialistas, liberales, católicos) organizaron la resistencia armada contra los nazis y los fascistas de la República Social Italiana de Mussolini. La Resistencia liberó varias ciudades del Norte antes de la llegada aliada y fue el mito fundacional de la República italiana.',
        tip: 'El 25 de abril —Día de la Liberación, fiesta nacional italiana— conmemora la insurrección partisana de 1945 que liberó Milán y Turín.',
      },
      {
        pregunta: "¿Qué significa 'trasformismo'?",
        respuesta:
          "El trasformismo es la práctica política italiana (inaugurada por Depretis en 1876) de absorber a los diputados de la oposición mediante concesiones, nombramientos y favores, creando mayorías artificiales sin línea ideológica clara. Giolitti lo perfeccionó. El trasformismo explica por qué Italia tuvo gobiernos frágiles pero estables: todo el mundo acababa colaborando con el gobierno. Es la raíz histórica del clientelismo italiano.",
        tip: 'La palabra fue inventada por el propio Agostino Depretis en un discurso de 1882. Sigue usándose hoy para describir comportamientos oportunistas en política.',
      },
      {
        pregunta: '¿Cuántos gobiernos ha tenido Italia?',
        respuesta:
          'Desde la proclamación de la República en 1946 hasta 2024, Italia ha tenido más de 70 gobiernos, con una media de duración inferior a 14 meses. Es una de las tasas de rotación gubernamental más altas de Europa occidental. Sin embargo, la administración del Estado, la economía y la sociedad han funcionado con notable continuidad pese a la inestabilidad política aparente.',
        tip: 'La inestabilidad parlamentaria convivió con la estabilidad macroeconómica durante el milagro económico: los técnicos de la Banca d\'Italia y del Tesoro mantuvieron la coherencia de política económica independientemente de los gobiernos.',
      },
    ],

    pasos: [
      {
        titulo: 'El Risorgimento: tres hombres, una nación imposible',
        cuerpo:
          'Cavour fue el diplomático que consiguió el apoyo de Napoleón III y aisló a Austria. Mazzini fue el ideólogo republicano que sembró la conciencia nacional. Garibaldi fue el soldado que conquistó el Sur con mil voluntarios. Los tres se necesitaban y se detestaban. Sin esa trinidad improbable, Italia no habría existido en 1861.',
      },
      {
        titulo: 'La era fascista: del carisma al desastre',
        cuerpo:
          'Mussolini llegó al poder legalmente, consolidó la dictadura en tres años y durante una década gozó de apoyo popular genuino. La alianza con Hitler fue su error fatal: Italia entró en una guerra para la que no estaba preparada, sufrió derrotas humillantes y terminó con el Duce colgado boca abajo en Milán. El fascismo italiano es el caso de estudio de cómo una democracia débil puede colapsar.',
      },
      {
        titulo: 'La República: estabilidad en el caos',
        cuerpo:
          'La Primera República italiana (1946-1994) fue paradójicamente estable pese a sus más de 50 gobiernos en 50 años. La Democracia Cristiana siempre gobernaba, el PCI siempre estaba en la oposición. El sistema era clientelar pero funcional. El Plan Marshall y la CEE permitieron el milagro económico. Tangentopoli destruyó el sistema en dos años.',
      },
      {
        titulo: 'El milagro económico: la invención de la Italia moderna',
        cuerpo:
          'En los años 50-60, Italia pasó de ser un país de emigrantes pobres a ser un referente mundial en diseño, moda y automóvil. La Fiat 500 (1957), la Vespa, la Olivetti, Armani, Ferragamo: Italia inventó la idea de que la belleza y la industria podían ser la misma cosa. El milagro fue real, pero benefició sobre todo al triángulo industrial del Norte.',
      },
      {
        titulo: 'Italia actual: la eterna contradicción',
        cuerpo:
          "Italia tiene el tercer mayor patrimonio artístico del mundo, la tercera economía de la eurozona y una deuda pública equivalente al 140% del PIB. Tiene empresas familiares de 200 años y una burocracia que paraliza proyectos durante décadas. Tiene el mejor diseño industrial y una mano negra que controla sectores enteros del Sur. Italia no es un problema a resolver: es una contradicción a gestionar, y los italianos llevan 160 años aprendiendo a hacerlo.",
      },
    ],

    tips: [
      {
        icono: '🗳️',
        texto:
          'Para entender la política italiana, recuerda que desde 1945 hasta 1994 la Democracia Cristiana siempre fue el partido más votado. El sistema de la Primera República no era bipartidista: era un partido central inamovible (DC) con satélites cambiantes. Cuando cayó por Tangentopoli, el vacío fue gigantesco.',
      },
      {
        icono: '🍕',
        texto:
          "No confundas el 'Norte' y el 'Sur' italianos con geografía: son dos modelos económicos en el mismo país. El Norte (Lombardía, Piamonte, Véneto) tiene PIB per cápita equivalente a Alemania. El Sur (Calabria, Sicilia, Campania) tiene PIB per cápita equivalente a países de Europa del Este. La frontera es invisible pero real.",
      },
      {
        icono: '📜',
        texto:
          'La Constitución italiana de 1948 es una de las más progresistas de su época: fue escrita por una asamblea constituyente que incluía comunistas, socialistas, democristianos y liberales. El artículo 1 dice: \'Italia es una República democrática, fundada en el trabajo\'. Es deliberadamente antifascista: una respuesta directa a Mussolini.',
      },
      {
        icono: '🎬',
        texto:
          'Para entender la Italia del siglo XX, el cine neorrealista (Roma ciudad abierta, Ladrones de bicicletas, La dolce vita) es tan útil como los libros de historia. Rossellini, De Sica, Visconti y Fellini documentaron la Italia de la posguerra, el milagro económico y sus contradicciones con una honestidad que los políticos nunca tuvieron.',
      },
    ],

    errores: [
      {
        titulo: 'Que Mussolini siempre fue un dictador brutal',
        cuerpo:
          'Mussolini consolidó la dictadura gradualmente entre 1922 y 1925, y durante su primera década gozó de apoyo popular genuino, admiración internacional (Churchill le elogió públicamente en 1927) y aprobación del Vaticano. El terror sistemático fue real, pero la imagen del dictador demente fue posterior. Entender su ascenso requiere entender que muchos italianos lo querían.',
      },
      {
        titulo: 'Que el milagro económico benefició a todo el país',
        cuerpo:
          'El milagro económico de los años 50-60 fue en gran medida un milagro del Norte. El Sur siguió siendo subdesarrollado: la emigración interna trasladó millones de meridionales a las fábricas del Norte, no los industrializó en su tierra. La Cassa per il Mezzogiorno (fondo de desarrollo para el Sur, 1950-1984) invirtió billones de liras con resultados limitados. La brecha Norte-Sur se mantuvo.',
      },
      {
        titulo: 'Que Tangentopoli limpió la política italiana',
        cuerpo:
          "Tangentopoli destruyó los partidos de la Primera República, pero no eliminó la corrupción sistémica. Berlusconi llenó el vacío con sus propios métodos. Las redes clientelares se reorganizaron bajo nuevas formas. La Ndrangheta, la Camorra y Cosa Nostra siguieron operando. La operación 'Mani Pulite' fue necesaria pero no suficiente para cambiar la cultura política.",
      },
      {
        titulo: 'Que Italia siempre ha sido caótica',
        cuerpo:
          'La imagen de caos político italiano oculta una notable estabilidad estructural. La administración del Estado, el Banco de Italia, el sistema judicial y las grandes empresas han funcionado con continuidad durante décadas de rotación gubernamental. Italia ha mantenido superávit primario presupuestario durante 30 años, algo que pocos países pueden decir. El caos es real, pero coexiste con instituciones más sólidas de lo que parecen.',
      },
    ],
  },
};
