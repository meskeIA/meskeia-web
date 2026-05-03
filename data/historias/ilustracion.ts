import type { HistoriaData } from './types';

export const ilustracion: HistoriaData = {
  slug: 'ilustracion',
  titulo: 'La Ilustración: De Newton a la Revolución Francesa',
  subtitulo:
    'El siglo de la razón: cómo Voltaire, Rousseau, Montesquieu, Hume y Kant transformaron el pensamiento político, científico y social de Occidente',
  descripcionSEO:
    'Cronología interactiva de la Ilustración (1687–1789): Newton, Locke, Voltaire, Montesquieu, Rousseau, la Encyclopédie, el despotismo ilustrado, la independencia americana y Kant. Explora el siglo que cambió la política, la ciencia y la filosofía occidentales.',
  keywords: [
    'Ilustración',
    'siglo XVIII',
    'filosofía moderna',
    'Newton',
    'Locke',
    'Voltaire',
    'Rousseau',
    'Montesquieu',
    'Kant',
    'Encyclopédie',
    'despotismo ilustrado',
    'Revolución Francesa',
    'independencia americana',
    'empirismo',
    'razón',
    'Enlightenment',
  ],
  anioInicio: 1687,
  anioFin: 1789,

  hitos: [
    {
      id: 'newton-locke-bases',
      nombre: 'Newton y Locke: Los Cimientos de la Razón',
      anioInicio: 1687,
      anioFin: 1700,
      color: '#1E90FF',
      categoria: 'bases',
      descripcion:
        'Isaac Newton publica los "Principia Mathematica" (1687): la razón matemática puede describir el universo entero. John Locke propone en el "Ensayo sobre el entendimiento humano" (1689) y los "Dos tratados sobre el gobierno civil" que el conocimiento procede de la experiencia y que el gobierno requiere el consentimiento de los gobernados. Estos dos autores sientan los pilares filosóficos sobre los que se construirá toda la Ilustración europea.',
      obraIconica: 'Principia Mathematica (Newton, 1687)',
      paises: ['Inglaterra'],
    },
    {
      id: 'salones-cafes-republica-letras',
      nombre: 'Los Salones y Cafés: La República de las Letras',
      anioInicio: 1700,
      anioFin: 1750,
      color: '#DAA520',
      categoria: 'salones',
      descripcion:
        'Los cafés de Londres, París y Viena se convierten en espacios de debate público abierto. Los salones de las grandes damas —Madame de Tencin, Madame Geoffrin, Madame du Deffand— reúnen a filósofos, escritores y científicos en torno a la conversación intelectual. La correspondencia transnacional teje una red de ideas que atraviesa fronteras. La Ilustración es, antes que un movimiento de ideas, una red social de personas que se leen, se citan y se debaten.',
      obraIconica: 'Salón de Madame Geoffrin (París, c. 1755)',
      paises: ['Francia', 'Inglaterra', 'Austria'],
    },
    {
      id: 'montesquieu-separacion-poderes',
      nombre: 'Montesquieu: La Separación de Poderes',
      anioInicio: 1721,
      anioFin: 1748,
      color: '#8B4513',
      categoria: 'filosofos',
      descripcion:
        'Montesquieu publica las "Cartas persas" (1721), una sátira de la sociedad europea vista desde fuera, y el monumental "El Espíritu de las Leyes" (1748), donde defiende la separación de los poderes legislativo, ejecutivo y judicial como garantía de la libertad política. Su análisis comparado de los sistemas de gobierno influirá directamente en los fundadores de la Constitución americana (1787) y en los revolucionarios franceses.',
      obraIconica: 'El Espíritu de las Leyes (1748)',
      paises: ['Francia'],
    },
    {
      id: 'voltaire-guerra-fanatismo',
      nombre: 'Voltaire: La Guerra al Fanatismo',
      anioInicio: 1718,
      anioFin: 1778,
      color: '#8B4513',
      categoria: 'filosofos',
      descripcion:
        'Voltaire es el gran combatiente de la Ilustración. Las "Cartas filosóficas" (1734) elogian la tolerancia inglesa frente al absolutismo francés. El "Cándido" (1759) desmonta el optimismo de Leibniz con humor feroz. La campaña por el caso Calas (1762) convierte la defensa de un protestante injustamente ejecutado en un combate público por la justicia. "Écrasez l\'infâme" —aplasta lo infame— es su lema: la Ilustración como lucha política y moral contra el fanatismo religioso.',
      obraIconica: 'Cándido, o el optimismo (1759)',
      paises: ['Francia', 'Suiza'],
    },
    {
      id: 'enciclopedia-diderot',
      nombre: 'La Encyclopédie: Todo el Conocimiento Humano',
      anioInicio: 1751,
      anioFin: 1772,
      color: '#DAA520',
      categoria: 'salones',
      descripcion:
        'Diderot y D\'Alembert dirigen durante veinte años un proyecto sin precedentes: 28 volúmenes con 140 colaboradores que incluyen a Rousseau, Voltaire y Montesquieu. La Encyclopédie sufre persecuciones y censuras reales, pero su objetivo es claro: democratizar el saber como acto político. Es el primer gran proyecto editorial colectivo de la historia moderna, y la cristalización material de la Ilustración como movimiento.',
      obraIconica: 'Encyclopédie ou Dictionnaire raisonné (1751–1772)',
      paises: ['Francia'],
    },
    {
      id: 'rousseau-contrato-social',
      nombre: 'Rousseau: El Contrato Social y la Voluntad General',
      anioInicio: 1755,
      anioFin: 1778,
      color: '#8B4513',
      categoria: 'filosofos',
      descripcion:
        'Jean-Jacques Rousseau es el más radical y contradictorio de los ilustrados. El "Discurso sobre la desigualdad" (1755) denuncia que la civilización ha corrompido al ser humano. "El Contrato Social" (1762) proclama que la soberanía reside en el pueblo y que la voluntad general es la fuente de toda legitimidad. "Emilio" (1762) propone una educación natural. Rousseau es el inspirador directo de la Revolución Francesa, pero también del Romanticismo que vendrá después.',
      obraIconica: 'El Contrato Social (1762)',
      paises: ['Francia', 'Suiza'],
    },
    {
      id: 'despotismo-ilustrado',
      nombre: 'El Despotismo Ilustrado',
      anioInicio: 1740,
      anioFin: 1790,
      color: '#4B0082',
      categoria: 'despotismo',
      descripcion:
        'Los monarcas más poderosos de Europa adoptan el lenguaje de la Ilustración sin renunciar al poder absoluto. Federico el Grande de Prusia introduce la tolerancia religiosa y abolie la tortura. Catalina la Grande de Rusia acomete reformas legislativas, colecciona arte europeo y mantiene correspondencia con Voltaire. María Teresa y José II de Austria impulsan reformas agrarias y la libertad religiosa. Su lema: "Todo para el pueblo, nada por el pueblo".',
      obraIconica: 'Institución del Nakaz de Catalina la Grande (1767)',
      paises: ['Prusia', 'Rusia', 'Austria'],
    },
    {
      id: 'ilustracion-escocesa-hume-smith',
      nombre: 'La Ilustración Escocesa: Hume, Smith y la Economía',
      anioInicio: 1739,
      anioFin: 1790,
      color: '#228B22',
      categoria: 'atlantica',
      descripcion:
        'En Escocia florece una versión práctica y empírica de la Ilustración. David Hume lleva el empirismo hasta sus últimas consecuencias y pone en cuestión la religión natural y la causalidad. Adam Smith publica "La Riqueza de las Naciones" (1776) y funda la economía política moderna: el libre mercado, la división del trabajo y el capitalismo como sistema teorizado. James Watt aplica la Ilustración a la ingeniería con la máquina de vapor.',
      obraIconica: 'La Riqueza de las Naciones (Adam Smith, 1776)',
      paises: ['Escocia', 'Gran Bretaña'],
    },
    {
      id: 'independencia-americana',
      nombre: 'La Independencia Americana: La Ilustración en Acción',
      anioInicio: 1776,
      anioFin: 1789,
      color: '#228B22',
      categoria: 'atlantica',
      descripcion:
        'La Declaración de Independencia de 1776 cita a Locke casi textualmente: derechos inalienables, gobierno por consentimiento. Thomas Jefferson y Benjamin Franklin son ilustrados en política activa. La Constitución de Filadelfia (1787) aplica la separación de poderes de Montesquieu. Es el primer experimento a gran escala de una democracia liberal moderna, y demuestra que las ideas de la Ilustración pueden convertirse en instituciones reales.',
      obraIconica: 'Declaración de Independencia de los Estados Unidos (1776)',
      paises: ['Estados Unidos', 'Francia'],
    },
    {
      id: 'kant-legado-ilustracion',
      nombre: 'Kant: El Resumen y el Legado de la Ilustración',
      anioInicio: 1781,
      anioFin: 1795,
      color: '#DC143C',
      categoria: 'legado',
      descripcion:
        'Immanuel Kant sintetiza y cierra la Ilustración filosófica. La "Crítica de la Razón Pura" (1781) investiga los límites del conocimiento humano. En "¿Qué es la Ilustración?" (1784) acuña el lema definitivo: "Sapere aude" —atrévete a saber—, la madurez intelectual como emancipación. "La Paz Perpetua" (1795) esboza el proyecto de una federación de repúblicas libres. Kant abre las puertas al Romanticismo y al pensamiento político moderno.',
      obraIconica: 'Crítica de la Razón Pura (1781)',
      paises: ['Prusia'],
    },
  ],

  eras: [
    {
      nombre: 'Los Fundamentos: Newton, Locke y el Primer Iluminismo',
      desde: 1687,
      hasta: 1720,
      icono: '🍎',
      hitosDestacados: [
        'Newton y Locke: Los Cimientos de la Razón',
        'Los Salones y Cafés: La República de las Letras',
      ],
      eventos: [
        'Newton publica los Principia Mathematica (1687), unificando mecánica celeste y terrestre',
        'Locke publica el Ensayo sobre el entendimiento humano (1689)',
        'Locke publica los Dos tratados sobre el gobierno civil (1689)',
        'Fundación del Café de la Regencia en París, centro del debate filosófico (1686)',
        'Leibniz funda la Academia de Ciencias de Berlín (1700)',
        'Muerte de Locke (1704) y de Newton (1727): el testigo pasa a la siguiente generación',
      ],
    },
    {
      nombre: 'El Movimiento Ilustrado: Salones y Debate Público',
      desde: 1720,
      hasta: 1750,
      icono: '☕',
      hitosDestacados: [
        'Los Salones y Cafés: La República de las Letras',
        'Montesquieu: La Separación de Poderes',
        'Voltaire: La Guerra al Fanatismo',
      ],
      eventos: [
        'Montesquieu publica las Cartas persas (1721), primer best-seller filosófico del siglo',
        'Voltaire se exilia en Inglaterra (1726–1729) y descubre la tolerancia inglesa',
        'Voltaire publica las Cartas filosóficas (1734), escándalo en Francia',
        'Madame du Deffand abre su salón en París (1730s)',
        'Hume publica el Tratado de la naturaleza humana (1739)',
        'Montesquieu publica El Espíritu de las Leyes (1748), obra cumbre del pensamiento político ilustrado',
      ],
    },
    {
      nombre: 'Los Grandes Filósofos: Voltaire, Montesquieu, Rousseau',
      desde: 1748,
      hasta: 1772,
      icono: '📖',
      hitosDestacados: [
        'Voltaire: La Guerra al Fanatismo',
        'La Encyclopédie: Todo el Conocimiento Humano',
        'Rousseau: El Contrato Social y la Voluntad General',
      ],
      eventos: [
        'Primer volumen de la Encyclopédie publicado (1751)',
        'Rousseau publica el Discurso sobre las ciencias y las artes (1750)',
        'Rousseau publica el Discurso sobre la desigualdad (1755)',
        'Voltaire publica el Cándido (1759)',
        'Rousseau publica El Contrato Social y el Emilio (1762)',
        'Voltaire dirige la campaña por el caso Calas (1762–1763)',
        'Publicación del último volumen de la Encyclopédie (1772)',
      ],
    },
    {
      nombre: 'El Despotismo Ilustrado',
      desde: 1740,
      hasta: 1790,
      icono: '👑',
      hitosDestacados: [
        'El Despotismo Ilustrado',
      ],
      eventos: [
        'Federico el Grande sube al trono de Prusia (1740) y aplica reformas ilustradas',
        'María Teresa inicia reformas administrativas y educativas en Austria (1740)',
        'Catalina la Grande asciende al trono ruso (1762) y convoca la Gran Comisión legislativa',
        'Catalina publica el Nakaz, inspirado en Montesquieu (1767)',
        'José II de Austria promulga el Edicto de Tolerancia (1781)',
        'José II abolie la servidumbre en Austria (1781)',
        'Federico el Grande muere (1786), fin de la era dorada del despotismo ilustrado prusiano',
      ],
    },
    {
      nombre: 'La Ilustración Atlántica: Escocia y América',
      desde: 1750,
      hasta: 1789,
      icono: '🌊',
      hitosDestacados: [
        'La Ilustración Escocesa: Hume, Smith y la Economía',
        'La Independencia Americana: La Ilustración en Acción',
      ],
      eventos: [
        'Hume publica Historia natural de la religión (1757)',
        'Adam Smith publica La Teoría de los Sentimientos Morales (1759)',
        'James Watt perfecciona la máquina de vapor (1769)',
        'Adam Smith publica La Riqueza de las Naciones (1776)',
        'Declaración de Independencia de los Estados Unidos (1776)',
        'Constitución de Filadelfia, inspirada en Montesquieu (1787)',
        'Los Federalist Papers de Madison, Hamilton y Jay (1787–1788)',
      ],
    },
    {
      nombre: 'Kant y el Legado Ilustrado',
      desde: 1780,
      hasta: 1789,
      icono: '🔆',
      hitosDestacados: [
        'Kant: El Resumen y el Legado de la Ilustración',
        'La Independencia Americana: La Ilustración en Acción',
      ],
      eventos: [
        'Kant publica la Crítica de la Razón Pura (1781)',
        'Kant publica ¿Qué es la Ilustración? con el lema "Sapere aude" (1784)',
        'Kant publica la Crítica de la Razón Práctica (1788)',
        'Revolución Francesa: los ideales ilustrados llegan al poder (1789)',
        'Declaración de los Derechos del Hombre y del Ciudadano (1789)',
        'Kant publicará La Paz Perpetua (1795), proyectando la Ilustración al futuro',
      ],
    },
  ],

  categorias: {
    bases: 'Fundamentos científicos y filosóficos',
    salones: 'Sociabilidad ilustrada y difusión del saber',
    filosofos: 'Los grandes filósofos del siglo',
    despotismo: 'El despotismo ilustrado',
    atlantica: 'La Ilustración escocesa y americana',
    legado: 'Kant y el legado de la Ilustración',
  },

  colores: {
    bases: '#1E90FF',
    salones: '#DAA520',
    filosofos: '#8B4513',
    despotismo: '#4B0082',
    atlantica: '#228B22',
    legado: '#DC143C',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'La Ilustración (c. 1687–1789) fue el movimiento intelectual que colocó la razón humana en el centro de la vida pública. Nació en Inglaterra con Newton y Locke, floreció en Francia con Voltaire, Montesquieu y Rousseau, se extendió a Escocia con Hume y Smith, inspiró la independencia de los Estados Unidos y culminó en Alemania con la filosofía crítica de Kant. Su herencia directa es la Revolución Francesa y el constitucionalismo moderno.',

    tablaComparativa: [
      {
        hito: 'Newton y Locke: Los Cimientos de la Razón',
        periodo: '1687–1700',
        categoria: 'Fundamentos',
        personaje: 'Isaac Newton / John Locke',
        aportacion:
          'La razón matemática describe el universo; el gobierno requiere consentimiento de los gobernados',
      },
      {
        hito: 'Montesquieu: La Separación de Poderes',
        periodo: '1721–1748',
        categoria: 'Filosofía política',
        personaje: 'Charles-Louis de Secondat, barón de Montesquieu',
        aportacion:
          'División de poderes (legislativo, ejecutivo, judicial) como garantía de la libertad',
      },
      {
        hito: 'Voltaire: La Guerra al Fanatismo',
        periodo: '1718–1778',
        categoria: 'Filosofía moral',
        personaje: 'François-Marie Arouet (Voltaire)',
        aportacion:
          'Tolerancia religiosa, crítica del fanatismo, la Ilustración como combate político',
      },
      {
        hito: 'La Encyclopédie: Todo el Conocimiento Humano',
        periodo: '1751–1772',
        categoria: 'Difusión del saber',
        personaje: 'Denis Diderot / Jean le Rond d\'Alembert',
        aportacion:
          'Democratización del conocimiento: 28 volúmenes, 140 autores, primer proyecto editorial colectivo',
      },
      {
        hito: 'Rousseau: El Contrato Social y la Voluntad General',
        periodo: '1755–1778',
        categoria: 'Filosofía política',
        personaje: 'Jean-Jacques Rousseau',
        aportacion:
          'Soberanía popular, voluntad general, educación natural — inspiración directa de la Revolución Francesa',
      },
      {
        hito: 'Kant: El Resumen y el Legado de la Ilustración',
        periodo: '1781–1795',
        categoria: 'Filosofía crítica',
        personaje: 'Immanuel Kant',
        aportacion:
          '"Sapere aude": la madurez intelectual como emancipación; síntesis filosófica de un siglo',
      },
    ],

    escenarios: [
      {
        icono: '📚',
        titulo: 'El estudiante de filosofía',
        perfil: 'Universitario que estudia Historia de la Filosofía Moderna',
        texto:
          'Esta cronología te da el mapa completo del período: con quién discutía Rousseau, por qué Kant decía que Hume lo despertó de su "sueño dogmático", y cómo las ideas de Locke llegaron a la Constitución americana. Empieza por la era de los fundamentos, sigue los hitos filosóficos en orden, y usa la tabla comparativa para preparar tu examen.',
      },
      {
        icono: '🏛️',
        titulo: 'El aficionado a la historia política',
        perfil: 'Ciudadano curioso que quiere entender el origen del liberalismo',
        texto:
          'Si te preguntas de dónde vienen la democracia representativa, la separación de poderes o los derechos humanos, la respuesta está aquí. Montesquieu inspiró la Constitución americana; Rousseau, la Revolución Francesa; Locke, la Declaración de Independencia. Los cimientos del mundo político moderno tienen nombres y fechas concretas.',
      },
      {
        icono: '🧑‍🏫',
        titulo: 'El docente de Bachillerato',
        perfil: 'Profesor de Historia o Filosofía que prepara una unidad didáctica',
        texto:
          'La cronología interactiva te permite presentar los hitos en orden, comparar autores en la tabla y mostrar el mapa de eras para contextualizar cada texto. Los escenarios de la sección educativa pueden usarse como punto de partida para debates en clase sobre soberanía popular, tolerancia religiosa o separación de poderes.',
      },
      {
        icono: '🌍',
        titulo: 'El viajero cultural',
        perfil: 'Turista que visita París, Versalles, Edimburgo o Königsberg',
        texto:
          'Saber que el Café de la Régence vio jugar al ajedrez a Diderot y a Rousseau, que en el Palais Royal se vendía la Encyclopédie prohibida, o que la casa de Kant en Königsberg fue el epicentro de la filosofía crítica europea cambia completamente la experiencia de visitar estos lugares. La Ilustración tiene geografía.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué se llama "Ilustración"?',
        respuesta:
          'El término viene de la metáfora de la luz: la razón humana ilumina la oscuridad de la ignorancia, el fanatismo y la superstición. En alemán se llama "Aufklärung" (esclarecimiento), en francés "Lumières" (las luces), en inglés "Enlightenment" (el alumbrado). La idea central es que el ser humano puede usar su propia razón para entender el mundo y mejorar la sociedad, sin necesidad de autoridades eclesiásticas ni tradiciones heredadas.',
        tip: 'El lema de Kant lo resume todo: "Sapere aude" — atrévete a saber.',
      },
      {
        pregunta: '¿Cuál es la diferencia entre Locke y Rousseau sobre el contrato social?',
        respuesta:
          'Ambos parten de la idea de un contrato entre los ciudadanos y el Estado, pero con conclusiones muy distintas. Locke dice que los hombres tienen derechos naturales preexistentes (vida, libertad, propiedad) y que el gobierno existe para protegerlos: si los viola, el pueblo puede rebelarse. Rousseau va más lejos: la soberanía reside en el pueblo entero (la "voluntad general"), no en los individuos por separado, y nadie puede alienar esa soberanía.',
        tip: 'Locke inspira el liberalismo; Rousseau inspira tanto la democracia directa como, en sus interpretaciones extremas, el autoritarismo populista.',
      },
      {
        pregunta: '¿Por qué la Encyclopédie fue perseguida?',
        respuesta:
          'Porque democratizar el conocimiento era un acto político amenazante. La Encyclopédie no solo compilaba información técnica: sus artículos cuestionaban la autoridad de la Iglesia, el absolutismo real y los privilegios del clero. La Iglesia católica la incluyó en el Índice de libros prohibidos (1759). El Consejo Real suspendió su publicación dos veces. Aun así, los editores encontraron la forma de seguir publicándola en secreto.',
        tip: 'El artículo "Autoridad política" de Diderot afirma que solo el consentimiento del pueblo puede fundamentar el poder: una bomba filosófica en pleno absolutismo.',
      },
      {
        pregunta: '¿Qué es el despotismo ilustrado y por qué no era realmente "ilustrado"?',
        respuesta:
          'El despotismo ilustrado fue la adopción del vocabulario ilustrado (razón, reforma, bienestar del pueblo) por monarcas absolutistas como Federico de Prusia, Catalina de Rusia o José II de Austria. Introdujeron reformas reales —tolerancia religiosa, codificación del derecho, abolición de la tortura—, pero nunca aceptaron la consecuencia lógica de la Ilustración: que el poder debe surgir del pueblo. "Todo para el pueblo, nada por el pueblo" sintetiza la contradicción.',
      },
      {
        pregunta: '¿Qué relación hay entre la Ilustración y la Revolución Francesa?',
        respuesta:
          'La Revolución Francesa (1789) es la consecuencia política más directa de la Ilustración, pero también su más ambigua herencia. Los revolucionarios se inspiraron en Rousseau (soberanía popular, voluntad general), en Montesquieu (separación de poderes) y en Voltaire (anticlericalismo). Pero el Terror jacobino de 1793–1794 mostró que la voluntad general podía usarse para justificar el autoritarismo, algo que los ilustrados más liberales —como Condorcet, guillotinado en 1794— no habrían aprobado.',
        tip: 'La Declaración de los Derechos del Hombre y del Ciudadano (1789) es el documento donde la Ilustración se convierte en derecho positivo.',
      },
    ],

    pasos: [
      {
        titulo: '1. Empieza por los fundamentos: Newton y Locke',
        cuerpo:
          'Antes de adentrarte en los filósofos franceses, entiende los cimientos. Newton demuestra que el universo sigue leyes racionales y matemáticas: si el cosmos tiene orden racional, la sociedad también puede tenerlo. Locke añade que el conocimiento viene de la experiencia, no de dogmas revelados, y que el gobierno legítimo requiere el consentimiento de los ciudadanos. Sin estos dos pilares, no hay Ilustración posible.',
      },
      {
        titulo: '2. Sigue el hilo de los grandes filósofos franceses',
        cuerpo:
          'Lee a Montesquieu, Voltaire y Rousseau en ese orden. Montesquieu es el más sistemático —su separación de poderes es la base de todas las constituciones modernas. Voltaire es el más combativo —su lucha contra el fanatismo definió la Ilustración como proyecto moral. Rousseau es el más radical —su concepto de soberanía popular fue la chispa de la Revolución Francesa. Los tres se conocían, se admiraban y se contradecían.',
      },
      {
        titulo: '3. Comprende la Encyclopédie como acto político',
        cuerpo:
          'No era solo una compilación de conocimientos: era la demostración de que el saber pertenece a todos, no a la Iglesia ni al Estado. Sus 28 volúmenes tardaron 21 años en completarse, sufrieron censuras y prohibiciones, y aun así se distribuyeron por toda Europa. La Encyclopédie convirtió a los ilustrados en red: Voltaire, Rousseau, Montesquieu, D\'Holbach, Turgot... todos contribuyeron.',
      },
      {
        titulo: '4. Observa la Ilustración en acción: América y los déspotas ilustrados',
        cuerpo:
          'Las ideas filosóficas no son solo teoría: se convierten en instituciones. La Declaración de Independencia americana (1776) y la Constitución de Filadelfia (1787) son la Ilustración aplicada a la política real. Al mismo tiempo, el despotismo ilustrado muestra los límites del movimiento: incluso los monarcas más reformistas —Federico el Grande, Catalina la Grande— se niegan a ceder el poder. La Ilustración choca con la realidad del poder.',
      },
      {
        titulo: '5. Cierra el ciclo con Kant y abre la puerta al mundo moderno',
        cuerpo:
          'Kant no es el más famoso de los ilustrados, pero sí el más profundo. Su pregunta "¿qué puedo conocer?" (Crítica de la Razón Pura) fija los límites de la razón humana. Su respuesta a "¿qué es la Ilustración?" (Sapere aude) la define para siempre. Y su proyecto de paz perpetua abre el camino hacia el derecho internacional moderno. Kant no cierra la Ilustración: la eleva a un nivel filosófico desde el que todo lo anterior cobra su sentido definitivo.',
      },
    ],

    tips: [
      {
        icono: '🗓️',
        texto:
          'Fíjate en las fechas solapadas: el despotismo ilustrado (1740–1790) coincide exactamente con el florecimiento de Voltaire, Rousseau y la Encyclopédie. Los reyes reformistas y los filósofos radicales vivieron al mismo tiempo y se influyeron mutuamente.',
      },
      {
        icono: '🌐',
        texto:
          'La Ilustración es el primer movimiento intelectual verdaderamente transnacional de la historia moderna. Una idea de Locke en Londres inspiraba a Montesquieu en París, que influía en Jefferson en Virginia, que era leído por Catalina en San Petersburgo. La República de las Letras no tenía fronteras.',
      },
      {
        icono: '⚖️',
        texto:
          'Rousseau es el gran disidente interno de la Ilustración. Sus críticas a la desigualdad y a la "civilización corruptora" fueron escritas en la misma época que los elogios ilustrados al progreso. Entender la tensión entre Voltaire y Rousseau es entender la tensión interna del siglo XVIII.',
      },
      {
        icono: '📜',
        texto:
          'Muchos textos clave de la Ilustración están disponibles en español en dominio público: el Contrato Social, el Espíritu de las Leyes, el Cándido, la Crítica de la Razón Pura en edición abreviada. Leer aunque sea un capítulo de cada uno transforma la comprensión del período.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir la Ilustración con el ateísmo generalizado',
        cuerpo:
          'La mayoría de los ilustrados no eran ateos, sino deístas: creían en un Dios creador que no interviene en los asuntos humanos. Voltaire, Rousseau y Kant eran deístas convencidos. El ateísmo militante era una posición minoritaria (D\'Holbach, Helvétius). La crítica ilustrada no iba contra la creencia religiosa personal, sino contra la intolerancia y el poder institucional de las Iglesias.',
      },
      {
        titulo: 'Creer que la Ilustración defendía la democracia tal como la entendemos hoy',
        cuerpo:
          'Muchos ilustrados desconfiaban del pueblo llano. Voltaire era abiertamente elitista. Montesquieu prefería el gobierno moderado de las élites ilustradas. Solo Rousseau fue el teórico de la soberanía popular radical. La Ilustración creó las herramientas conceptuales de la democracia moderna, pero la mayoría de sus representantes habrían preferido repúblicas representativas gobernadas por propietarios educados.',
      },
      {
        titulo: 'Pensar que la Ilustración liberó a las mujeres',
        cuerpo:
          'La Ilustración proclamó la igualdad de todos los seres humanos, pero excluyó sistemáticamente a las mujeres del espacio público. Rousseau las confinaba explícitamente al hogar. Las grandes damas de los salones —Madame de Tencin, Madame Geoffrin— fueron cruciales para el movimiento, pero como organizadoras, no como filósofas reconocidas. Olympe de Gouges publicó la Declaración de los Derechos de la Mujer en 1791 y fue guillotinada en 1793.',
      },
      {
        titulo: 'Reducir la Revolución Francesa a la consecuencia lógica de la Ilustración',
        cuerpo:
          'La Revolución Francesa fue mucho más compleja que la simple aplicación de las ideas ilustradas. Las causas económicas (bancarrota del Estado, crisis de subsistencia), sociales (contradicciones del Antiguo Régimen) y políticas (debilidad de Luis XVI) fueron tan importantes como las filosóficas. Y el Terror jacobino de 1793–1794 fue una distorsión de los principios ilustrados que sus propios inspiradores —Condorcet, asesinado; los girondinos, guillotinados— habrían rechazado.',
      },
    ],
  },
};
