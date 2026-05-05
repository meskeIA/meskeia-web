import type { HistoriaData } from './types';

export const historiaFranciaContemporanea: HistoriaData = {
  slug: 'historia-francia-contemporanea',
  titulo: 'Francia Contemporánea: De la Tercera República a Macron',
  subtitulo: 'De la derrota ante Prusia y el Affaire Dreyfus hasta De Gaulle, Mayo del 68 y la Francia del siglo XXI',
  descripcionSEO: 'Cronología interactiva de la Francia contemporánea: desde la Tercera República (1870) y el Affaire Dreyfus hasta De Gaulle, Mayo del 68, Mitterrand y Macron. 10 hitos y 6 eras que explican el laboratorio político de la modernidad occidental.',
  keywords: [
    'historia francia contemporánea cronología',
    'tercera república affaire dreyfus zola jaccuse',
    'vichy resistencia de gaulle ocupación nazi',
    'mayo 68 france revolución cultural',
    'mitterrand socialismo cohabitación quinta república',
    'macron le pen gilets jaunes democracia liberal',
  ],
  anioInicio: 1870,
  anioFin: 9999,

  hitos: [
    {
      id: 'tercera-republica',
      nombre: 'La Tercera República y el Affaire Dreyfus',
      anioInicio: 1870,
      anioFin: 1914,
      color: '#003399',
      categoria: 'republica',
      descripcion:
        "Francia nace de la derrota ante Prusia y la sangrienta Comuna de París (1871). La Tercera República: laicismo, educación pública gratuita (Jules Ferry), colonialismo en África y Asia. El Affaire Dreyfus (1894-1906) divide a Francia entre dreyfusards y antisemitas; Zola escribe 'J'Accuse'. La Belle Époque.",
      obraIconica:
        "J'Accuse de Zola — 13 enero 1898. La carta que salvó a Dreyfus y dividió a Francia en dos",
      paises: ['Francia', 'Alemania', 'Túnez', 'Indochina'],
    },
    {
      id: 'gran-guerra-francia',
      nombre: 'Francia en la Gran Guerra: Verdún',
      anioInicio: 1914,
      anioFin: 1918,
      color: '#C62828',
      categoria: 'guerra',
      descripcion:
        "Francia pierde 1,4 millones de soldados en cuatro años. Verdún (1916): 700.000 bajas en 10 meses, símbolo del absurdo de la guerra total. Mutinies de 1917: soldados franceses se niegan a atacar. Clemenceau 'el Tigre' lleva a Francia a la victoria. El Tratado de Versalles exige reparaciones alemanas.",
      obraIconica:
        "Batalla de Verdún — febrero-diciembre 1916. El símbolo del sacrificio francés: 'Ils ne passeront pas'",
      paises: ['Francia', 'Alemania', 'Gran Bretaña'],
    },
    {
      id: 'entreguerras',
      nombre: 'El Período de Entreguerras y el Frente Popular',
      anioInicio: 1918,
      anioFin: 1940,
      color: '#F57F17',
      categoria: 'politica',
      descripcion:
        "Los 'Années folles' (locos 20): París capital cultural del mundo. Crisis de 1929 golpea con retraso. El Frente Popular de Léon Blum (1936): primeras vacaciones pagadas, 40 horas semanales. La amenaza nazi y la política de apaciguamiento de Daladier en Múnich (1938). Francia no está preparada para la guerra.",
      obraIconica:
        'El Frente Popular, junio 1936 — Blum en el poder: las primeras vacaciones pagadas de la historia francesa',
      paises: ['Francia', 'Alemania', 'España'],
    },
    {
      id: 'vichy-resistencia',
      nombre: 'Vichy, la Ocupación y la Resistencia',
      anioInicio: 1940,
      anioFin: 1944,
      color: '#880E4F',
      categoria: 'guerra',
      descripcion:
        "Francia cae en 6 semanas (junio 1940). El régimen de Vichy de Pétain colabora con los nazis: deportación de 75.000 judíos franceses. De Gaulle desde Londres llama a la Resistencia (18 junio 1940). Los maquis, Jean Moulin, la FFI. Liberación de París (25 agosto 1944). El trauma de la colaboración.",
      obraIconica:
        "Llamada del 18 de junio de 1940 — De Gaulle en la BBC: 'Francia ha perdido una batalla, no la guerra'",
      paises: ['Francia', 'Alemania', 'Gran Bretaña'],
    },
    {
      id: 'cuarta-republica',
      nombre: 'La Cuarta República y la Descolonización',
      anioInicio: 1944,
      anioFin: 1958,
      color: '#0277BD',
      categoria: 'republica',
      descripcion:
        "La Cuarta República es ingobernable: 25 gobiernos en 12 años. Reconstrucción con el Plan Marshall. La guerra de Indochina termina en derrota en Dien Bien Phu (1954). La guerra de Argelia (1954-1962) provoca la crisis que llama de vuelta a De Gaulle. Suez (1956): Francia humillada por EE.UU.",
      obraIconica:
        'Dien Bien Phu — 7 mayo 1954. La derrota que demuestra que el colonialismo francés no puede sobrevivir',
      paises: ['Francia', 'Vietnam', 'Argelia'],
    },
    {
      id: 'de-gaulle',
      nombre: 'De Gaulle y la Quinta República',
      anioInicio: 1958,
      anioFin: 1969,
      color: '#1565C0',
      categoria: 'politica',
      descripcion:
        "De Gaulle redacta la Constitución de la Quinta República (1958): presidencialismo fuerte. Independencia de Argelia (1962) tras trauma de 1 millón de 'pieds-noirs'. La grandeur: Francia con bomba atómica, veto a Gran Bretaña en la CEE, reconocimiento de China. El discurso 'Vive le Québec libre' (1967).",
      obraIconica:
        'Constitución de la Quinta República — 4 octubre 1958. De Gaulle diseña el sistema político que rige Francia hasta hoy',
      paises: ['Francia', 'Argelia', 'EE.UU.'],
    },
    {
      id: 'mayo-68',
      nombre: 'Mayo del 68 y los Trente Glorieuses',
      anioInicio: 1968,
      anioFin: 1981,
      color: '#7B1FA2',
      categoria: 'cultura',
      descripcion:
        "Mayo del 68: estudiantes y obreros paralizan Francia. De Gaulle escapa a Alemania, regresa, disuelve la Asamblea y gana las elecciones. Renuncia en 1969. Los Trente Glorieuses (1945-1975): 30 años de crecimiento sin precedentes. La crisis del petróleo (1973) cierra esa era dorada.",
      obraIconica:
        "Mayo del 68 — 'Sous les pavés, la plage'. La revolución cultural que no derribó el gobierno pero cambió la sociedad",
      paises: ['Francia'],
    },
    {
      id: 'mitterrand',
      nombre: 'La Era Mitterrand: la Izquierda en el Poder',
      anioInicio: 1981,
      anioFin: 1995,
      color: '#E53935',
      categoria: 'politica',
      descripcion:
        "François Mitterrand: primer presidente socialista de la Quinta República. Nacionalizaciones, semana de 35 horas, abolición de la pena de muerte. La cohabitación (1986): Mitterrand con Chirac de primer ministro. La caída del Muro (1989) y la reunificación alemana alarman a Francia. El Túnel del Canal de la Mancha (1994).",
      obraIconica:
        "Victoria de Mitterrand, 10 mayo 1981 — La gauche al poder: 'La force tranquille' que cambia Francia",
      paises: ['Francia', 'Alemania'],
    },
    {
      id: 'chirac-sarkozy',
      nombre: 'Chirac, el 11-S y la Francia de los 2000',
      anioInicio: 1995,
      anioFin: 2012,
      color: '#0288D1',
      categoria: 'politica',
      descripcion:
        "Chirac se opone a la guerra de Irak (2003): 'Villepin en la ONU' hace de Francia la voz disidente. Francia rechaza la Constitución Europea en referéndum (2005). Revueltas en las banlieues (2005). Sarkozy: ruptura con el gaullismo, hiperactividad presidencial, crisis de 2008 gestiona con el G20.",
      obraIconica:
        "Dominique de Villepin en la ONU — 14 febrero 2003. Francia dice 'no' a la guerra de Irak: aplausos en el Consejo de Seguridad",
      paises: ['Francia', 'Irak', 'EE.UU.'],
    },
    {
      id: 'macron-siglo-xxi',
      nombre: 'Hollande, Macron y la Crisis de la Democracia Liberal',
      anioInicio: 2012,
      anioFin: 9999,
      color: '#37474F',
      categoria: 'siglo_xxi',
      descripcion:
        "Hollande: mandato marcado por los atentados de Charlie Hebdo (2015) y el Bataclan (noviembre 2015). Macron (2017): el más joven presidente de la Quinta República, derrota al Frente Nacional de Le Pen. Los Gilets Jaunes (2018). Reforma de las pensiones (2023). Francia ante la polarización política y el ascenso de la extrema derecha.",
      obraIconica:
        "Atentados del 13 noviembre 2015 — Bataclan, terrasse. '130 morts'. La noche que cambió la Francia moderna",
      paises: ['Francia'],
    },
  ],

  eras: [
    {
      nombre: 'La Tercera República',
      desde: 1870,
      hasta: 1918,
      icono: '🏛️',
      hitosDestacados: [
        'La Tercera República y el Affaire Dreyfus',
        'Francia en la Gran Guerra: Verdún',
      ],
      eventos: [
        '1871: La Comuna de París — 20.000 muertos en una semana',
        '1894: Affaire Dreyfus divide a Francia',
        '1905: Ley de separación Iglesia-Estado',
      ],
    },
    {
      nombre: 'Entreguerras y Ocupación',
      desde: 1918,
      hasta: 1944,
      icono: '⚡',
      hitosDestacados: [
        'El Período de Entreguerras y el Frente Popular',
        'Vichy, la Ocupación y la Resistencia',
      ],
      eventos: [
        '1919: Tratado de Versalles — Clemenceau exige reparaciones',
        '1936: Frente Popular — Blum, primer ministro socialista',
        '1940: Derrota en 6 semanas — Armisticio con Alemania',
      ],
    },
    {
      nombre: 'Reconstrucción y Descolonización',
      desde: 1944,
      hasta: 1958,
      icono: '🕊️',
      hitosDestacados: ['La Cuarta República y la Descolonización'],
      eventos: [
        '1944: Liberación de París (25 agosto)',
        '1954: Dien Bien Phu — Francia pierde Indochina',
        '1954: Inicio de la guerra de Argelia',
      ],
    },
    {
      nombre: 'La Quinta República: De Gaulle y los 70',
      desde: 1958,
      hasta: 1981,
      icono: '⭐',
      hitosDestacados: [
        'De Gaulle y la Quinta República',
        'Mayo del 68 y los Trente Glorieuses',
      ],
      eventos: [
        '1962: Independencia de Argelia',
        '1968: Mayo del 68 — la revolución que no fue',
        '1974: Giscard d\'Estaing — el fin de la era gaullista',
      ],
    },
    {
      nombre: 'La Alternancia: Mitterrand y Chirac',
      desde: 1981,
      hasta: 2007,
      icono: '🔄',
      hitosDestacados: [
        'La Era Mitterrand: la Izquierda en el Poder',
        'Chirac, el 11-S y la Francia de los 2000',
      ],
      eventos: [
        '1981: Mitterrand gana — primera alternancia real',
        '1986: Primera cohabitación Mitterrand-Chirac',
        '2003: Francia se opone a la guerra de Irak en la ONU',
      ],
    },
    {
      nombre: 'Francia en el Siglo XXI',
      desde: 2007,
      hasta: 9999,
      icono: '🇫🇷',
      hitosDestacados: ['Hollande, Macron y la Crisis de la Democracia Liberal'],
      eventos: [
        '2015: Atentados de Charlie Hebdo y el Bataclan',
        '2017: Macron derrota a Le Pen — En Marche!',
        '2024: Juegos Olímpicos de París',
      ],
    },
  ],

  categorias: {
    republica: 'República e Instituciones',
    guerra: 'Guerras y Ocupación',
    politica: 'Política e Instituciones',
    cultura: 'Cultura y Sociedad',
    siglo_xxi: 'Francia en el Siglo XXI',
  },

  colores: {
    republica: '#003399',
    guerra: '#C62828',
    politica: '#0277BD',
    cultura: '#7B1FA2',
    siglo_xxi: '#37474F',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'Francia, desde 1870, ha sido el laboratorio político de la modernidad occidental: inventó el laicismo, el Estado del bienestar, el presidencialismo fuerte y Mayo del 68. También vivió la colaboración de Vichy, la descolonización traumática y hoy enfrenta la mayor crisis de su modelo republicano desde la posguerra. Entender la Francia contemporánea es entender cómo se construye y se erosiona una democracia liberal.',

    tablaComparativa: [
      {
        hito: 'La Tercera República y el Affaire Dreyfus',
        periodo: '1870-1914',
        categoria: 'República e Instituciones',
        personaje: 'Jules Ferry / Émile Zola',
        aportacion: 'Laicismo, educación pública gratuita, derechos civiles',
      },
      {
        hito: 'Entreguerras y Frente Popular',
        periodo: '1918-1940',
        categoria: 'Política e Instituciones',
        personaje: 'Léon Blum / Édouard Daladier',
        aportacion: 'Vacaciones pagadas, semana laboral limitada, apaciguamiento fallido',
      },
      {
        hito: 'Vichy, la Ocupación y la Resistencia',
        periodo: '1940-1944',
        categoria: 'Guerras y Ocupación',
        personaje: 'Maréchal Pétain / Charles de Gaulle',
        aportacion: 'Trauma de la colaboración y mito fundacional de la Resistencia',
      },
      {
        hito: 'La Cuarta República y la Descolonización',
        periodo: '1944-1958',
        categoria: 'República e Instituciones',
        personaje: 'René Coty / Pierre Mendès France',
        aportacion: 'Plan Marshall, descolonización de Indochina y Argelia',
      },
      {
        hito: 'De Gaulle y Mayo del 68',
        periodo: '1958-1981',
        categoria: 'Política e Instituciones',
        personaje: 'Charles de Gaulle / Georges Pompidou',
        aportacion: 'Quinta República, la grandeur, revolución cultural del 68',
      },
      {
        hito: 'Mitterrand, Chirac y la Francia actual',
        periodo: '1981-presente',
        categoria: 'Francia en el Siglo XXI',
        personaje: 'François Mitterrand / Emmanuel Macron',
        aportacion: 'Alternancia izquierda-derecha, construcción europea, crisis democrática liberal',
      },
    ],

    escenarios: [
      {
        icono: '⚔️',
        titulo: '¿Por qué cayó tan rápido Francia en 1940?',
        perfil: 'Curiosidad histórica y militar',
        texto:
          'La derrota en 6 semanas (mayo-junio 1940) no fue una sorpresa para militares atentos: el plan Maginot fijaba a los franceses en una guerra estática que Alemania evitó con el Blitzkrieg a través de las Ardenas. La moral estaba rota tras Verdún, el mando era rígido y la política interior había paralizado la preparación. El colapso fue rápido porque el ejército francés de 1940 todavía pensaba en la guerra de trincheras de 1918.',
      },
      {
        icono: '📰',
        titulo: 'El Affaire Dreyfus: el primer escándalo de derechos humanos moderno',
        perfil: 'Historia de la justicia y los medios',
        texto:
          "Alfred Dreyfus, capitán judío del ejército francés, fue condenado por espionaje en 1894 basándose en pruebas fabricadas. El caso dividió a Francia entre el Ejército, la Iglesia y la derecha antisemita (antidreyfusards) contra los intelectuales, republicanos laicos y socialistas (dreyfusards). La carta de Zola 'J'Accuse' en L'Aurore (1898) fue el primer gran acto de opinión pública que cambió un veredicto judicial. Dreyfus fue rehabilitado en 1906.",
      },
      {
        icono: '🎭',
        titulo: 'Mayo del 68: ¿revolución cultural o ruido político?',
        perfil: 'Sociología y cultura contemporánea',
        texto:
          "Mayo del 68 no derribó al gobierno (De Gaulle ganó las elecciones de junio con mayoría histórica), pero transformó la sociedad francesa más profundamente que ninguna ley: liberalización sexual, fin del autoritarismo familiar y académico, feminismo de segunda ola, ecologismo como movimiento político. 'Sous les pavés, la plage' no cambió el poder político pero cambió cómo los franceses vivían, amaban y pensaban. Los efectos sociales duraron décadas.",
      },
      {
        icono: '🗳️',
        titulo: 'Macron y Le Pen: ¿está Francia ante una nueva crisis republicana?',
        perfil: 'Política actual y democracia liberal',
        texto:
          'Desde 2017, el sistema político francés se reorganiza en torno a dos polos: el liberalismo centrista de Macron y el nacionalismo populista de Le Pen. Los Gilets Jaunes (2018), la reforma de las pensiones (2023) y las elecciones legislativas fragmentadas apuntan a un régimen en crisis de legitimidad. Francia experimenta lo que politólogos llaman "démocratie illibérale en espera": instituciones sólidas, presidencialismo fuerte, pero desconexión creciente entre élites y ciudadanos.',
      },
    ],

    faq: [
      {
        pregunta: '¿Cuántas repúblicas ha tenido Francia?',
        respuesta:
          'Francia ha tenido cinco repúblicas: la Primera (1792-1804, Revolución), la Segunda (1848-1851, II República), la Tercera (1870-1940, la más larga: 70 años), la Cuarta (1944-1958, inestable: 25 gobiernos) y la Quinta (1958-hoy, con presidencialismo fuerte creado por De Gaulle). Entre ellas, dos imperios napoleónicos y la Restauración monárquica.',
        tip: 'La Quinta República diseñada por De Gaulle en 1958 es la más presidencialista de la historia francesa: el presidente tiene poderes que en otros países corresponden al Parlamento.',
      },
      {
        pregunta: '¿Qué fue la cohabitación?',
        respuesta:
          'La cohabitación es una situación constitucional única de la Quinta República donde el presidente de la República y el primer ministro pertenecen a partidos opuestos. Ocurrió tres veces: Mitterrand con Chirac (1986-88), Mitterrand con Balladur (1993-95) y Chirac con Jospin (1997-2002). La reforma de 2000 que igualó el mandato presidencial y legislativo en 5 años redujo drásticamente esa posibilidad.',
        tip: 'Durante la cohabitación, el presidente mantiene el control de la política exterior y defensa, pero el primer ministro gobierna la política interior.',
      },
      {
        pregunta: '¿Qué es el laicismo francés?',
        respuesta:
          "La laïcité francesa (1905) va más allá de la separación Iglesia-Estado: prohíbe cualquier expresión religiosa en el espacio público institucional. Los funcionarios y alumnos de escuelas públicas no pueden mostrar símbolos religiosos. Es una concepción más estricta que la de otros países occidentales: no es hostilidad a la religión, sino su confinamiento a la esfera privada. Ha generado debate con el velo islámico desde los años 90.",
        tip: 'La ley de 1905 fue votada para secularizar la educación frente a la Iglesia Católica, no para regular el islam, que entonces era minoritario en Francia.',
      },
      {
        pregunta: '¿Por qué De Gaulle es tan importante?',
        respuesta:
          'De Gaulle es el arquitecto de la Francia moderna en tres sentidos: salvó el honor de Francia durante la ocupación desde Londres (1940-44), diseñó la Quinta República que sigue vigente (1958), y definió la "politique de grandeur" (independencia de EE.UU., bomba atómica propia, veto a Gran Bretaña en la CEE). Su figura polariza aún hoy: para unos es el salvador; para otros, un autoritario que casi aplastó Mayo del 68.',
        tip: 'De Gaulle fue el único líder europeo que se opuso formalmente a la hegemonía norteamericana durante la Guerra Fría: retiró a Francia del mando militar de la OTAN en 1966.',
      },
      {
        pregunta: '¿Cuándo ganó la izquierda por primera vez la presidencia?',
        respuesta:
          'François Mitterrand ganó la presidencia el 10 de mayo de 1981, convirtiéndose en el primer presidente socialista de la Quinta República. Fue la primera alternancia política real desde 1958: 23 años de derecha gaullista y centroderecha. El 10 de mayo es recordado en Francia como una fecha histórica comparable a otras grandes jornadas republicanas. Mitterrand gobernó 14 años (1981-1995), el mandato presidencial más largo de la Quinta República.',
        tip: 'La imagen de los socialistas celebrando en la place de la Bastille el 10 de mayo de 1981 es una de las más icónicas de la historia política francesa reciente.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por la Tercera República: el nacimiento del Estado laico moderno',
        cuerpo:
          'La Tercera República (1870-1940) es la más larga de la historia francesa y la que construyó las instituciones que aún definen a Francia: escuelas públicas gratuitas, laicismo, colonialismo. Haz clic en el primer hito para entender qué Francia existía antes de las guerras del siglo XX.',
      },
      {
        titulo: 'El trauma fundacional: Vichy y la Resistencia',
        cuerpo:
          'El período 1940-1944 es el más oscuro y más debatido de la historia francesa. Francia estuvo dividida entre quienes colaboraron con los nazis (incluyendo el Estado de Vichy) y quienes resistieron. De Gaulle construyó el mito de que todos resistieron; la verdad histórica es más incómoda. Este hito es esencial para entender la psicología política francesa actual.',
      },
      {
        titulo: 'La descolonización: el trauma olvidado',
        cuerpo:
          'La guerra de Argelia (1954-1962) fue tan traumática como la ocupación nazi pero tardó décadas en reconocerse en la historia oficial. 1,5 millones de "pieds-noirs" (colonos franceses) tuvieron que abandonar Argelia. La harka (argelinos que lucharon con Francia) fue abandonada. Este trauma explica tensiones sociales que persisten hasta hoy en las banlieues francesas.',
      },
      {
        titulo: 'De Gaulle y Mayo del 68: el presidencialismo ante la revuelta',
        cuerpo:
          'Dos aspectos opuestos de la misma era: De Gaulle construyó el Estado fuerte y presidencialista; Mayo del 68 mostró sus límites. Lo paradójico: la revuelta del 68 no derribó a De Gaulle (ganó las elecciones siguientes) pero transformó la sociedad más profundamente que ninguna revolución anterior. Francia aprendió que el cambio cultural puede superar al cambio político.',
      },
      {
        titulo: 'Francia hoy: entre la grandeur y la crisis de representación',
        cuerpo:
          "La Francia actual hereda todo esto: el presidencialismo fuerte de De Gaulle, el Estado del bienestar de Blum y Mitterrand, el laicismo de Jules Ferry y la herida colonial no resuelta. Macron representa la síntesis liberal de este legado; Le Pen encarna el rechazo a esa síntesis. La pregunta es si la Quinta República diseñada en 1958 puede gestionar la polarización del siglo XXI.",
      },
    ],

    tips: [
      {
        icono: '🗺️',
        texto:
          'Para entender la política francesa, el eje izquierda-derecha clásico importa menos que la distinción republicanos-laicos (dreyfusards, socialistas, liberales) vs. nationalistes-autoritarios (Pétain, Le Pen). Esa fractura existe desde 1894 y estructura la política hasta hoy.',
      },
      {
        icono: '📚',
        texto:
          "El concepto de 'exception française' es clave: los franceses creen genuinamente que su modelo político, cultural y social es único y superior. Explica por qué Francia rechazó la Constitución Europea (2005), se retiró de la OTAN (1966) y resiste tantas reformas que otros países aceptan sin debate.",
      },
      {
        icono: '🏛️',
        texto:
          'Francia ha tenido 5 repúblicas, 2 imperios y varias restauraciones monárquicas en 230 años. Cada crisis constitucional (1848, 1870, 1940, 1958) ha redesignado las instituciones desde cero. La Quinta República de 1958 es la más estable, pero eso no significa que sea eterna.',
      },
      {
        icono: '🔍',
        texto:
          'Los "Trente Glorieuses" (1945-1975): treinta años de crecimiento económico sin precedentes que construyeron el Estado del bienestar francés, los grandes conjuntos de vivienda social (HLM) y la clase media. La crisis del petróleo de 1973 cerró esa era dorada y marcó el inicio de las tensiones sociales que persisten hoy en las banlieues.',
      },
    ],

    errores: [
      {
        titulo: 'Que todos los franceses resistieron durante la ocupación',
        cuerpo:
          'El mito de la "France résistante" fue construido por De Gaulle para restaurar la dignidad nacional, pero la realidad era más compleja. El régimen de Vichy tenía apoyo popular inicial, más de 75.000 judíos fueron deportados con colaboración activa de la policía francesa, y la Resistencia activa no superó el 2-3% de la población. La historiografía honesta sobre Vichy tardó décadas en abrirse paso en Francia.',
      },
      {
        titulo: 'Que el laicismo francés es hostilidad a la religión',
        cuerpo:
          "La laïcité no prohíbe creer ni practicar una religión: prohíbe que las instituciones públicas la expresen. Un maestro no puede llevar crucifijo en clase, pero puede rezar en casa. Un alumno puede rezar en el recreo pero no en el aula. Es una distinción entre esfera pública (neutral) y esfera privada (libre). El conflicto con el velo islámico surge de dónde trazar esa frontera, no de antiislamismo como tal.",
      },
      {
        titulo: 'Que De Gaulle siempre fue democrático',
        cuerpo:
          "De Gaulle usó referéndums como plebiscitos personales y amenazó con dimitir si perdía (y lo hizo en 1969). Suspendió las garantías constitucionales durante la guerra de Argelia. Su relación con el Parlamento fue de desdén permanente. Era un demócrata en el sentido de que respetaba el sufragio universal, pero su concepto de la autoridad del Estado era pre-democrático: el jefe manda y el pueblo apoya o lo depone.",
      },
      {
        titulo: 'Que Macron es de izquierdas',
        cuerpo:
          'Macron fue ministro de Economía con el socialista Hollande, pero su proyecto político es liberal-centrista, no socialdemócrata. Ha reformado el mercado laboral debilitando la negociación colectiva, recortado impuestos a empresas y elevado la edad de jubilación. Se define como "ni de droite ni de gauche" (ni de derecha ni de izquierda), lo cual en el contexto francés significa haber superado esa distinción hacia el liberalismo económico europeo.',
      },
    ],
  },
};
