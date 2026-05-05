import type { HistoriaData } from './types';

export const historiaEtica: HistoriaData = {
  slug: 'historia-etica',
  titulo: 'Historia de la Ética: De Sócrates a la Inteligencia Artificial',
  subtitulo: 'Dos mil quinientos años de reflexión sobre el bien, la justicia y cómo debemos vivir',
  descripcionSEO: 'Cronología interactiva de la historia de la ética occidental: de Sócrates (470 a.C.) a la ética de la inteligencia artificial (2020). Aristóteles, Kant, utilitarismo, Nietzsche, bioética y los grandes debates morales del siglo XXI en 10 hitos y 6 eras.',
  keywords: [
    'historia ética filosofía moral cronología',
    'sócrates aristóteles virtud eudemonía ética clásica',
    'kant imperativo categórico deontología ética moderna',
    'utilitarismo bentham mill mayor bien mayor número',
    'nietzsche transvaloración valores moral genealogía',
    'bioética rawls justicia ética contemporánea inteligencia artificial',
  ],
  anioInicio: -470,
  anioFin: 2020,

  hitos: [
    {
      id: 'socrates-origen',
      nombre: 'Sócrates y el Origen de la Ética',
      anioInicio: -470,
      anioFin: -399,
      color: '#1E90FF',
      categoria: 'clasica',
      descripcion: 'Sócrates (470-399 a.C.) funda la ética occidental con una pregunta radical: ¿cómo debemos vivir? El método socrático —diálogo, interrogación, mayéutica— convierte la búsqueda moral en actividad racional. Su condena y muerte por "corromper a la juventud" y "impiedad" lo convierte en el primer mártir del pensamiento libre. Para Sócrates, nadie hace el mal voluntariamente: el mal es ignorancia. Su discípulo Platón difunde su pensamiento a través de los diálogos.',
      obraIconica: 'Apología de Sócrates de Platón (~390 a.C.): el fundador del pensamiento moral occidental',
      paises: ['Grecia', 'Atenas'],
    },
    {
      id: 'aristoteles-virtud',
      nombre: 'Ética de la Virtud: Aristóteles',
      anioInicio: -384,
      anioFin: -322,
      color: '#1E90FF',
      categoria: 'clasica',
      descripcion: 'Aristóteles (384-322 a.C.) sistematiza la ética en la Ética Nicomáquea: la felicidad (eudemonía) como fin último de la vida humana, alcanzada a través de la virtud. Las virtudes son hábitos adquiridos por la práctica: valentía, justicia, templanza. La virtud como término medio entre dos extremos (doctrina del justo medio). La ética aristotélica sigue siendo hoy la referencia de la ética de la virtud y la filosofía del florecimiento humano.',
      obraIconica: 'Ética Nicomáquea de Aristóteles (~330 a.C.): la felicidad como fin último de la acción humana',
      paises: ['Grecia', 'Macedonia', 'Atenas'],
    },
    {
      id: 'estoicismo-epicureismo',
      nombre: 'Escuelas Helenísticas: Estoicismo y Epicureísmo',
      anioInicio: -341,
      anioFin: 180,
      color: '#1E90FF',
      categoria: 'clasica',
      descripcion: 'Epicuro (341-270 a.C.): la felicidad como placer tranquilo (ataraxia), ausencia de dolor y miedo. El placer no es el exceso sino la paz del ánimo. Los estoicos (Zenón, Epicteto, Marco Aurelio) proponen vivir conforme a la razón y la naturaleza: lo único verdaderamente bueno es la virtud; lo exterior (riqueza, fama, salud) es indiferente. La ley natural universal estoica —que todos los seres humanos son iguales por su razón— influye en el derecho romano y en el pensamiento cristiano posterior.',
      obraIconica: 'Cartas a Meneceo de Epicuro (306 a.C.) y las Meditaciones de Marco Aurelio (175 d.C.)',
      paises: ['Grecia', 'Roma', 'Imperio Romano', 'Mediterráneo'],
    },
    {
      id: 'etica-cristiana',
      nombre: 'Ética Cristiana y Medieval',
      anioInicio: 35,
      anioFin: 1274,
      color: '#8B0000',
      categoria: 'medieval',
      descripcion: 'Pablo de Tarso desarrolla la ética cristiana primitiva: amor al prójimo, perdón, salvación. San Agustín (354-430) integra el platonismo con el cristianismo: el bien supremo es Dios, el mal es ausencia de bien. Tomás de Aquino (1225-1274) sintetiza Aristóteles y el cristianismo en la Suma Teológica: ley natural, teología moral, virtudes cardinales y teologales. La ética medieval es teocéntrica: el bien moral se define en relación con Dios y la salvación del alma.',
      obraIconica: 'Suma Teológica de Tomás de Aquino (1265-1274): síntesis de razón y fe en la ética medieval',
      paises: ['Imperio Romano', 'Europa Medieval', 'Iglesia Católica'],
    },
    {
      id: 'etica-moderna-spinoza',
      nombre: 'Ética Moderna: Spinoza y Hume',
      anioInicio: 1632,
      anioFin: 1780,
      color: '#2E8B57',
      categoria: 'moderna',
      descripcion: 'Spinoza (Ética, 1677) construye la ética mediante demostración geométrica: Dios y Naturaleza son lo mismo; el bien moral es lo que aumenta nuestra potencia de actuar. Hume (Tratado de la Naturaleza Humana, 1739) funda el emotivismo: la moral no se deriva de la razón sino de las emociones y la simpatía. La famosa guillotina de Hume: no se puede derivar un "debe" de un "es". La moral como hecho humano, no divino ni racional, marca el giro moderno de la ética.',
      obraIconica: 'Ética de Spinoza (1677) y Tratado de la Naturaleza Humana de Hume (1739-1740)',
      paises: ['Holanda', 'Escocia', 'Europa Occidental'],
    },
    {
      id: 'kant-imperativo',
      nombre: 'Kant y el Imperativo Categórico',
      anioInicio: 1785,
      anioFin: 1788,
      color: '#2E8B57',
      categoria: 'moderna',
      descripcion: 'Kant (Fundamentación de la Metafísica de las Costumbres, 1785; Crítica de la Razón Práctica, 1788) funda la ética deontológica: actúa solo según aquella máxima que puedas querer que sea ley universal. El imperativo categórico (no hipotético): trata a las personas siempre como fines en sí mismas, nunca solo como medios. La autonomía moral: la ley moral la impone la propia razón, no Dios ni la utilidad. La ética kantiana sigue siendo el referente del respeto a los derechos humanos.',
      obraIconica: 'Fundamentación de la Metafísica de las Costumbres de Kant (1785): el imperativo categórico',
      paises: ['Prusia', 'Alemania', 'Europa'],
    },
    {
      id: 'utilitarismo',
      nombre: 'Utilitarismo: Bentham y Mill',
      anioInicio: 1789,
      anioFin: 1863,
      color: '#2E8B57',
      categoria: 'moderna',
      descripcion: 'Bentham (Introducción a los Principios de la Moral y la Legislación, 1789) formula el principio de utilidad: la acción correcta es la que produce la mayor felicidad para el mayor número. El cálculo hedónico intenta cuantificar el placer y el dolor. Mill (El Utilitarismo, 1863) refina la teoría: los placeres superiores (intelectuales) valen más que los inferiores. El utilitarismo es la base de las políticas públicas modernas basadas en el análisis coste-beneficio y el bienestar social.',
      obraIconica: 'El Utilitarismo de J.S. Mill (1863): el mayor bien para el mayor número',
      paises: ['Reino Unido', 'Inglaterra', 'Europa Occidental'],
    },
    {
      id: 'nietzsche-transvaloracion',
      nombre: 'Nietzsche y la Transvaloración',
      anioInicio: 1882,
      anioFin: 1900,
      color: '#DC143C',
      categoria: 'contemporanea',
      descripcion: 'Nietzsche (La Gaya Ciencia, 1882; Más allá del Bien y del Mal, 1886; La Genealogía de la Moral, 1887) proclama la "muerte de Dios" y la necesidad de transvalorar todos los valores: la moral tradicional (cristiana, utilitaria) es una moral de esclavos que niega la vida. El superhombre crea sus propios valores desde la voluntad de poder. Nietzsche no es nihilista sino crítico del nihilismo. Su influencia en el siglo XX es inmensa, aunque también fue malinterpretado por el nazismo.',
      obraIconica: 'Más allá del Bien y del Mal (1886) y La Genealogía de la Moral (1887) de Nietzsche',
      paises: ['Alemania', 'Prusia', 'Europa'],
    },
    {
      id: 'bioetica-rawls',
      nombre: 'Bioética y Teoría de la Justicia',
      anioInicio: 1964,
      anioFin: 2001,
      color: '#DC143C',
      categoria: 'contemporanea',
      descripcion: 'La Declaración de Helsinki (1964) codifica la ética médica moderna: consentimiento informado, no maleficencia, beneficencia. Rawls (Teoría de la Justicia, 1971) renueva la ética política liberal: detrás del "velo de ignorancia", elegiríamos una sociedad justa con el principio de diferencia. La bioética (Beauchamp y Childress, Principios de Bioética, 1979) sistematiza los cuatro principios: autonomía, beneficencia, no maleficencia, justicia. Peter Singer aplica el utilitarismo a los animales y los fetos, generando debates que definen la ética aplicada contemporánea.',
      obraIconica: 'Teoría de la Justicia de Rawls (1971) y Principios de Bioética de Beauchamp y Childress (1979)',
      paises: ['Estados Unidos', 'Occidente', 'Global'],
    },
    {
      id: 'etica-ia-medioambiente',
      nombre: 'Ética Medioambiental y de la IA',
      anioInicio: 1970,
      anioFin: 2020,
      color: '#DC143C',
      categoria: 'contemporanea',
      descripcion: 'La ética medioambiental (Aldo Leopold, Peter Singer, Hans Jonas) amplía el círculo moral: animales, ecosistemas y generaciones futuras tienen consideración moral. El principio de responsabilidad de Hans Jonas (1979): actúa de modo que los efectos de tu acción sean compatibles con la permanencia de la vida humana. La ética de la inteligencia artificial emerge como el gran reto del siglo XXI: los Principios de Asilomar (2017), el debate sobre IA alineada con valores humanos, el sesgo algorítmico y la responsabilidad de las máquinas.',
      obraIconica: 'Liberación Animal de Peter Singer (1975) y los Principios de Asilomar sobre IA (2017)',
      paises: ['Global', 'Estados Unidos', 'Europa', 'Internet'],
    },
  ],

  eras: [
    {
      nombre: 'Grecia Clásica',
      desde: -470,
      hasta: -323,
      icono: '🏛️',
      hitosDestacados: ['Sócrates y el Origen de la Ética', 'Ética de la Virtud: Aristóteles'],
      eventos: [
        'Sócrates desarrolla el método dialógico como herramienta de investigación moral (470-399 a.C.)',
        'Platón funda la Academia y escribe los diálogos socráticos, base de la filosofía moral occidental (387 a.C.)',
        'Aristóteles escribe la Ética Nicomáquea y define la eudemonía como fin último (330 a.C.)',
        'El pensamiento ético griego sienta las bases de la virtud, la justicia y el bien común como categorías filosóficas',
      ],
    },
    {
      nombre: 'Mundo Helenístico y Romano',
      desde: -323,
      hasta: 476,
      icono: '🌊',
      hitosDestacados: ['Escuelas Helenísticas: Estoicismo y Epicureísmo'],
      eventos: [
        'Epicuro funda su escuela en Atenas: la ataraxia y la amistad como claves de la vida buena (306 a.C.)',
        'Zenón de Citio funda el estoicismo: vivir conforme a la razón y la naturaleza universal (300 a.C.)',
        'Cicerón adapta la filosofía moral griega al contexto romano: De Officiis sobre los deberes (44 a.C.)',
        'Marco Aurelio escribe las Meditaciones: estoicismo en el poder como práctica ética diaria (175 d.C.)',
      ],
    },
    {
      nombre: 'Edad Media Cristiana',
      desde: 476,
      hasta: 1500,
      icono: '⛪',
      hitosDestacados: ['Ética Cristiana y Medieval'],
      eventos: [
        'San Agustín escribe Las Confesiones y La Ciudad de Dios: ética cristiana como búsqueda de Dios (400-426 d.C.)',
        'Anselmo de Canterbury desarrolla la teología racional: fe que busca comprender el bien (1093 d.C.)',
        'Pedro Abelardo introduce la intención moral en la ética: el pecado como actitud interior (1140 d.C.)',
        'Tomás de Aquino sintetiza Aristóteles y el cristianismo en la Suma Teológica (1265-1274 d.C.)',
      ],
    },
    {
      nombre: 'Modernidad Filosófica',
      desde: 1500,
      hasta: 1789,
      icono: '📚',
      hitosDestacados: ['Ética Moderna: Spinoza y Hume', 'Kant y el Imperativo Categórico'],
      eventos: [
        'Maquiavelo separa la ética política de la moral religiosa en El Príncipe (1513)',
        'Hobbes funda el contractualismo: la moral como acuerdo social para salir del estado de naturaleza (1651)',
        'Spinoza construye su Ética mediante demostración geométrica: Dios, Naturaleza y potencia de actuar (1677)',
        'Hume formula la guillotina de Hume: no se puede derivar un "debe" de un "es" (1739)',
        'Kant publica la Fundamentación de la Metafísica de las Costumbres: el imperativo categórico (1785)',
      ],
    },
    {
      nombre: 'Siglo XIX: Revolución Moral',
      desde: 1789,
      hasta: 1920,
      icono: '⚙️',
      hitosDestacados: ['Utilitarismo: Bentham y Mill', 'Nietzsche y la Transvaloración'],
      eventos: [
        'Bentham formula el principio de utilidad y propone el cálculo hedónico de placer y dolor (1789)',
        'Hegel desarrolla la ética del Espíritu: la moralidad como momento del despliegue histórico (1820)',
        'Mill refina el utilitarismo introduciendo la jerarquía de placeres cualitativos (1863)',
        'Nietzsche proclama la muerte de Dios y llama a la transvaloración de todos los valores (1882-1887)',
        'Durkheim funda la sociología moral: los hechos morales como fenómenos sociales objetivos (1893)',
      ],
    },
    {
      nombre: 'Ética Contemporánea',
      desde: 1920,
      hasta: 2020,
      icono: '🤖',
      hitosDestacados: ['Bioética y Teoría de la Justicia', 'Ética Medioambiental y de la IA'],
      eventos: [
        'Wittgenstein y el Círculo de Viena debaten si los enunciados morales tienen sentido cognitivo (1920-1940)',
        'Declaración Universal de Derechos Humanos: la ética universal como proyecto político global (1948)',
        'Rawls publica Teoría de la Justicia: el velo de ignorancia y el principio de diferencia (1971)',
        'Beauchamp y Childress sistematizan la bioética en cuatro principios fundamentales (1979)',
        'Principios de Asilomar sobre IA: la ética de los sistemas autónomos como reto del siglo XXI (2017)',
      ],
    },
  ],

  categorias: {
    clasica: 'Ética Clásica',
    medieval: 'Ética Medieval',
    moderna: 'Ética Moderna',
    contemporanea: 'Ética Contemporánea',
  },

  colores: {
    clasica: '#1E90FF',
    medieval: '#8B0000',
    moderna: '#2E8B57',
    contemporanea: '#DC143C',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'La historia de la ética es el relato de cómo la humanidad ha intentado responder a la pregunta más fundamental: ¿cómo debemos vivir? Durante 2.500 años, desde Sócrates hasta los debates sobre inteligencia artificial, filósofos de todas las culturas han propuesto sistemas morales para orientar la acción humana. Lejos de ser un debate abstracto, la ética ha moldeado los códigos jurídicos, las constituciones, los derechos humanos y los principios que rigen hoy la medicina, la política y la tecnología. Comprender esta historia es entender por qué pensamos el bien y el mal como lo hacemos.',

    tablaComparativa: [
      { hito: 'Ética de la Virtud: Aristóteles', periodo: '384-322 a.C.', categoria: 'Ética Clásica', personaje: 'Aristóteles', aportacion: 'La eudemonía (felicidad) como fin último; las virtudes como hábitos del carácter adquiridos por la práctica' },
      { hito: 'Ética Cristiana y Medieval', periodo: '35-1274 d.C.', categoria: 'Ética Medieval', personaje: 'Tomás de Aquino', aportacion: 'Síntesis de razón y fe: ley natural, virtudes cardinales y teologales, el bien como participación en Dios' },
      { hito: 'Kant y el Imperativo Categórico', periodo: '1785-1788', categoria: 'Ética Moderna', personaje: 'Immanuel Kant', aportacion: 'Ética deontológica: actúa según máximas universalizables; trata a las personas siempre como fines, nunca solo como medios' },
      { hito: 'Utilitarismo: Bentham y Mill', periodo: '1789-1863', categoria: 'Ética Moderna', personaje: 'Bentham / J.S. Mill', aportacion: 'El principio de utilidad: la acción correcta maximiza la felicidad del mayor número posible de personas' },
      { hito: 'Nietzsche y la Transvaloración', periodo: '1882-1900', categoria: 'Ética Contemporánea', personaje: 'Friedrich Nietzsche', aportacion: 'Crítica de la moral de esclavos; transvaloración de los valores; la voluntad de poder como fundamento creativo' },
      { hito: 'Bioética y Teoría de la Justicia', periodo: '1964-2001', categoria: 'Ética Contemporánea', personaje: 'Rawls / Beauchamp', aportacion: 'Justicia como equidad (Rawls); cuatro principios de bioética: autonomía, beneficencia, no maleficencia, justicia' },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiante de Filosofía',
        perfil: 'Bachillerato, Grado en Filosofía, Historia de las Ideas',
        texto: 'Esta cronología es una guía esencial para situar a cada autor en su contexto histórico y entender por qué surgió cada sistema ético. Ver la secuencia Sócrates → Aristóteles → Kant → Nietzsche → Rawls ayuda a comprender cómo cada filósofo respondía a los problemas dejados por sus predecesores y a las tensiones de su época.',
      },
      {
        icono: '🏥',
        titulo: 'Médico o Profesional de la Salud',
        perfil: 'Medicina, Enfermería, Psicología, Trabajo Social',
        texto: 'Los cuatro principios de la bioética (autonomía, beneficencia, no maleficencia, justicia) que orientan la práctica clínica diaria tienen raíces filosóficas milenarias. Esta cronología muestra cómo se desarrollaron esos principios desde la ética clásica hasta la Declaración de Helsinki (1964) y los comités de ética actuales.',
      },
      {
        icono: '🤖',
        titulo: 'Diseñador o Desarrollador de IA',
        perfil: 'Ingeniería de software, Ciencia de datos, Diseño de sistemas',
        texto: 'La ética de la inteligencia artificial no surgió de la nada: hunde sus raíces en 2.500 años de debate moral. El imperativo categórico de Kant, el utilitarismo de Mill y el principio de responsabilidad de Jonas son las referencias filosóficas reales de los Principios de Asilomar y las guías de IA ética de la UE y la ONU.',
      },
      {
        icono: '🗳️',
        titulo: 'Ciudadano Comprometido',
        perfil: 'Persona interesada en política, justicia y derechos',
        texto: 'Cuando debates sobre derechos humanos, justicia social, aborto, eutanasia o cambio climático, estás usando categorías filosóficas construidas a lo largo de siglos. Esta cronología te ayuda a ver de dónde vienen tus intuiciones morales y con qué tradición filosófica se alinea tu forma de pensar el bien y la justicia.',
      },
    ],

    faq: [
      {
        pregunta: '¿Qué diferencia hay entre ética y moral?',
        respuesta: 'Aunque en el habla cotidiana se usan como sinónimos, filosóficamente la moral es el conjunto de normas y costumbres que una comunidad acepta como válidas, mientras que la ética es la reflexión filosófica sobre esas normas: qué las justifica, si son universales o relativas, y cómo resolver los conflictos entre ellas. La moral es el objeto de estudio; la ética es la disciplina que lo estudia.',
        tip: 'La palabra "ética" viene del griego ethos (carácter habitual); "moral" viene del latín mores (costumbres). Cicerón tradujo el término griego al latín, y desde entonces conviven casi como sinónimos.',
      },
      {
        pregunta: '¿Qué es el imperativo categórico de Kant?',
        respuesta: 'Es la regla moral fundamental de Kant: actúa solo según aquella máxima que puedas querer que se convierta en ley universal. Tiene dos formulaciones principales: (1) universalidad: no hagas nada que no pudieras querer que todos hicieran; (2) humanidad: trata a las personas siempre como fines en sí mismas, nunca solo como medios. A diferencia de los imperativos hipotéticos ("haz X si quieres Y"), el categórico obliga incondicionalmente.',
        tip: 'Kant lo llamó "categórico" porque manda sin condiciones, al contrario de los mandatos hipotéticos ("si quieres X, haz Y"). La ética kantiana es la base filosófica de los derechos humanos modernos.',
      },
      {
        pregunta: '¿Por qué importa la ética de la inteligencia artificial?',
        respuesta: 'Los sistemas de IA toman decisiones que afectan a millones de personas: desde algoritmos de crédito hasta diagnósticos médicos o sistemas de vigilancia. Preguntas como "¿a quién beneficia?", "¿es justo?", "¿respeta la autonomía?" son exactamente las mismas que los filósofos morales han debatido durante siglos. La ética de la IA no inventa nuevas preguntas: aplica las herramientas filosóficas clásicas a tecnologías nuevas.',
        tip: 'Los Principios de Asilomar (2017) sobre IA fueron firmados por miles de investigadores. Su lenguaje —beneficencia, no maleficencia, autonomía, justicia— es directamente deontológico y utilitarista.',
      },
      {
        pregunta: '¿Tenía razón Nietzsche cuando proclamó la "muerte de Dios"?',
        respuesta: 'La "muerte de Dios" de Nietzsche no es una afirmación teológica sino cultural: Nietzsche observa que en la Europa del siglo XIX, Dios ha dejado de ser el fundamento compartido de la moral. Si Dios muere como garantía moral, ¿de dónde vienen los valores? Nietzsche no celebra esto: lo considera una crisis que la humanidad debe afrontar creando nuevos valores. Su diagnóstico sobre el nihilismo moderno sigue siendo una de las análisis más lúcidos del siglo XX.',
        tip: 'Nietzsche no fue el precursor del nazismo que sus contemporáneos intentaron hacer creer. Su hermana Elisabeth Förster-Nietzsche editó y distorsionó sus obras póstumas para aproximarlas al pangermanismo. Nietzsche era explícitamente antinacionalista y antisemitismo.',
      },
      {
        pregunta: '¿Qué es el relativismo moral y tiene razón?',
        respuesta: 'El relativismo moral sostiene que no existen verdades morales universales: lo que es bueno o malo depende de la cultura, la época o el individuo. Tiene apoyo empírico (las culturas difieren en sus normas) pero enfrenta el problema de la autocrítica: si todo es relativo, ¿podemos condenar la esclavitud o el genocidio? La mayoría de los filósofos actuales distinguen entre relativismo descriptivo (las culturas difieren) y normativo (no hay verdades morales), rechazando el segundo mientras aceptan el primero.',
        tip: 'El dilema del relativismo moral: si afirmo que "todo es relativo", ¿esa afirmación es también relativa? Los relativistas radicales caen en una contradicción performativa que hace su posición filosóficamente insostenible.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por los colores: cuatro grandes tradiciones',
        cuerpo: 'Antes de leer nada, observa los cuatro colores en la Línea del Tiempo: azul (ética clásica griega), granate (ética medieval cristiana), verde (ética moderna ilustrada) y rojo (ética contemporánea). Cada color representa una manera radicalmente distinta de fundamentar la moral. El reto de cada época fue responder a las preguntas dejadas abiertas por la anterior.',
      },
      {
        titulo: 'Compara los tres grandes sistemas modernos',
        cuerpo: 'Haz clic en "Ética Moderna: Spinoza y Hume", "Kant y el Imperativo Categórico" y "Utilitarismo: Bentham y Mill" en secuencia. Los tres nacen en el mismo siglo (XVIII-XIX) pero responden la pregunta moral de forma opuesta: la emoción como base moral (Hume), el deber racional universal (Kant) y las consecuencias para la mayoría (Mill). Tres caminos que la filosofía moral actual sigue recorriendo.',
      },
      {
        titulo: 'Usa la Comparativa para ver las aportaciones en paralelo',
        cuerpo: 'En el tab Comparativa, filtra por "Ética Moderna" para ver Kant, Bentham y Mill juntos. Luego filtra por "Ética Contemporánea" para ver cómo Nietzsche y Rawls reaccionan ante los problemas del siglo XX. El contraste entre la ética del deber kantiana y el utilitarismo es el debate central de la ética aplicada actual.',
      },
      {
        titulo: 'Explora el Contexto Histórico para ver las eras completas',
        cuerpo: 'Las 6 eras muestran que la ética no avanza en el vacío: la ética estoica nace en un período de cosmopolitismo helenístico; la bioética surge después de los experimentos nazis de la Segunda Guerra Mundial; la ética de la IA, en plena revolución digital. Cada sistema moral responde a una crisis social o intelectual concreta.',
      },
      {
        titulo: 'Conecta la historia de la ética con debates actuales',
        cuerpo: 'Cuando leas una noticia sobre IA, cambio climático, derechos de los animales o justicia social, intenta identificar qué tradición ética está en juego: ¿se argumenta con consecuencias (utilitarismo)? ¿con derechos y deberes (kantismo)? ¿con virtudes y carácter (aristotelismo)? La ética no es historia antigua: es el mapa de los debates que se libran hoy mismo.',
      },
    ],

    tips: [
      {
        icono: '💡',
        texto: 'Sócrates no dejó nada escrito. Todo lo que sabemos de él viene de los diálogos de Platón y de las Memorables de Jenofonte. Esto hace imposible distinguir las ideas originales de Sócrates de las de Platón, el llamado "problema socrático", que los filólogos debaten desde hace dos siglos.',
      },
      {
        icono: '⚖️',
        texto: 'Kant nunca salió de Königsberg (hoy Kaliningrado, Rusia). Su radio de viaje fue de unos 16 km. Sin embargo, escribió la ética que fundamenta los derechos humanos universales, la teoría política cosmopolita y la dignidad como valor absoluto de toda persona. La filosofía más universal de la modernidad nació en una de las ciudades más remotas de Europa.',
      },
      {
        icono: '🐾',
        texto: 'Jeremy Bentham, fundador del utilitarismo, pidió en su testamento que su cuerpo fuera disecado, embalsamado y expuesto en el University College de Londres en una caja de madera. El "Auto-icono" de Bentham sigue expuesto allí hoy, 200 años después, con una cabeza de cera que reemplaza al cráneo original —guardado separadamente tras varias gamberradas estudiantiles.',
      },
      {
        icono: '🌍',
        texto: 'Los cuatro principios de la bioética (autonomía, beneficencia, no maleficencia, justicia) que usan hoy los comités de ética médica de todo el mundo fueron formulados por dos filósofos estadounidenses, Tom Beauchamp y James Childress, en 1979, en respuesta a los escándalos del experimento Tuskegee (donde médicos dejaron a hombres negros sin tratar la sífilis para estudiar su evolución).',
      },
    ],

    errores: [
      {
        titulo: 'Creer que el utilitarismo justifica cualquier cosa si beneficia a la mayoría',
        cuerpo: 'El utilitarismo no dice que "el fin justifica los medios" sin restricciones. John Stuart Mill ya introdujo el concepto de derechos como restricciones a la maximización de utilidad. Los utilitaristas modernos (utilidad de reglas, utilitarismo de preferencias) incorporan protecciones para las minorías precisamente para evitar que la mayoría aplaste a los individuos. El utilitarismo es mucho más sofisticado que la caricatura popular.',
      },
      {
        titulo: 'Pensar que Nietzsche era nihilista o precursor del fascismo',
        cuerpo: 'Nietzsche fue el crítico más feroz del nihilismo, no su defensor. Su proyecto era superar el nihilismo con la creación de nuevos valores vitales. En cuanto al nazismo: Nietzsche detestaba el antisemitismo y el nacionalismo alemán de su época, y lo escribió explícitamente en sus obras. Fue su hermana Elisabeth quien, tras su muerte, falsificó y distorsionó sus textos para aproximarlos a la ideología pangermanista.',
      },
      {
        titulo: 'Confundir relativismo cultural con relativismo moral',
        cuerpo: 'Que las culturas tengan diferentes normas morales (relativismo descriptivo) no implica que no existan verdades morales universales (relativismo normativo). Un médico puede entender que diferentes culturas tienen distintos rituales funerarios sin concluir que la tortura de inocentes es aceptable en algunas culturas. La antropología cultural no implica relativismo moral filosófico.',
      },
      {
        titulo: 'Creer que la ética medieval es solo fe ciega sin razón',
        cuerpo: 'La escolástica medieval, especialmente Tomás de Aquino, es una de las tradiciones filosóficas más rigurosas de Occidente. Aquino integró la lógica aristotélica, el análisis de la intención moral, la distinción entre ley natural y ley positiva, y la teoría de la guerra justa con una sofisticación argumentativa que sigue siendo objeto de estudio académico serio. La teología medieval no era irracionalismo: era filosofía con presupuestos teológicos.',
      },
    ],
  },
};
