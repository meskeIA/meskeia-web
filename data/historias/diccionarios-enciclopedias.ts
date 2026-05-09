import type { HistoriaData } from './types';

export const diccionariosEnciclopedias: HistoriaData = {
  slug: 'diccionarios-enciclopedias',
  titulo: 'Historia de los Diccionarios y Enciclopedias: Del Tablet Sumerio a Wikipedia',
  subtitulo: `4.000 años organizando el conocimiento humano: de las tablillas cuneiformes sumerias a la inteligencia artificial`,
  descripcionSEO: `Cronología interactiva de la historia de los diccionarios y enciclopedias: desde las primeras listas de palabras sumerias (~2000 a.C.) hasta Wikipedia y la IA generativa. La Encyclopédie de Diderot, el Oxford English Dictionary, Britannica, Wikipedia y el futuro del conocimiento en 10 hitos y 6 eras.`,
  keywords: [
    'historia diccionarios enciclopedias cronología',
    'encyclopédie diderot ilustración conocimiento',
    'oxford english dictionary OED lexicografía',
    'wikipedia enciclopedia libre jimmy wales',
    'real academia española RAE diccionario',
    'enciclopedia britannica historia universal',
  ],
  anioInicio: -2000,
  anioFin: 9999,

  hitos: [
    {
      id: 'listas-palabras-sumerias',
      nombre: 'Primeras Listas de Palabras Sumerias',
      anioInicio: -2000,
      anioFin: -300,
      color: '#7C3AED',
      categoria: 'origen',
      descripcion: `Las primeras listas de palabras de la historia son tablillas cuneiformes sumerias (~2000 a.C.) halladas en Ebla (Siria) y Nippur (Irak). No eran diccionarios en el sentido moderno sino listas temáticamente organizadas para la enseñanza de la escritura: listados de nombres de animales, plantas, minerales, dioses y funcionarios. La más famosa, el "Listado de palabras de Ebla" (bilingüe sumerio-eblaíta), contiene ~1.000 entradas y es el primer diccionario bilingüe conocido (~2300 a.C.). La biblioteca de Nínive de Asurbanipal (~650 a.C.) contenía decenas de miles de tablillas cuneiformes organizadas temáticamente, la primera biblioteca sistemática de la historia. En China, el Erya (~300 a.C.) es el diccionario chino más antiguo conocido: organiza ~2.094 palabras en 19 capítulos temáticos. Estos primeros repertorios léxicos revelan que la necesidad de clasificar y transmitir el vocabulario surge de forma simultánea e independiente en las grandes civilizaciones de la escritura, demostrando que el deseo de organizar el conocimiento es consustancial a la invención del lenguaje escrito mismo.`,
      obraIconica: `Listado de palabras de Ebla: primer diccionario bilingüe conocido (~2300 a.C.)`,
      paises: ['Mesopotamia', 'China', 'Siria'],
    },
    {
      id: 'enciclopedismo-griego-romano',
      nombre: `Enciclopedismo Griego y Romano`,
      anioInicio: -300,
      anioFin: 600,
      color: '#1E3A8A',
      categoria: 'enciclopedia',
      descripcion: `La tradición enciclopédica griega busca sistematizar todo el conocimiento. Aristóteles (~350 a.C.) no escribió una enciclopedia, pero su corpus abarca lógica, biología, física, ética, política, retórica y poética: el primer intento de sistematización universal del conocimiento. Varrón de Reate (116-27 a.C.) escribió las Disciplinae en 9 libros (las futuras artes liberales). Plinio el Viejo compiló en su Historia Naturalis (~77 d.C.) 37 volúmenes sobre astronomía, geografía, botánica, zoología, mineralogía y arte, considerada la primera enciclopedia del mundo romano, con ~20.000 hechos recopilados de ~2.000 fuentes. Isidoro de Sevilla escribió las Etymologiae en 20 libros (~630 d.C.): la enciclopedia medieval más influyente, que organiza todo el conocimiento cristiano y clásico y fue copiada en miles de manuscritos durante la Alta Edad Media. Esta era establece el patrón de la enciclopedia como proyecto de abarcamiento total del saber, un ideal que persiste hasta hoy.`,
      obraIconica: `Historia Naturalis de Plinio el Viejo (~77 d.C.): primera enciclopedia romana`,
      paises: ['Grecia', 'Roma', 'España'],
    },
    {
      id: 'enciclopedia-islamica-medieval',
      nombre: `Enciclopedia Islámica Medieval`,
      anioInicio: 800,
      anioFin: 1400,
      color: '#1E3A8A',
      categoria: 'enciclopedia',
      descripcion: `El mundo islámico medieval fue el gran transmisor del conocimiento clásico y el creador de nuevas formas de sistematización. La Casa de la Sabiduría (Bayt al-Hikma, Bagdad, fundada ~830 por Al-Mamún) fue el primer centro sistemático de traducción y síntesis del conocimiento griego al árabe. Ibn Sina (Avicena, 980-1037) escribió el Kitab al-Shifa (Libro de la curación) en 18 volúmenes: enciclopedia filosófica y científica que integra lógica, física, matemáticas, astronomía y psicología. Al-Biruni (~1000 d.C.) catalogó los conocimientos sobre India, cálculo, astronomía y farmacología. La enciclopedia islámica fue el puente que transmitió el conocimiento griego clásico (Aristóteles, Euclides, Galeno) a la Europa medieval a través de la Escuela de Traductores de Toledo (s. XII). Sin este período de preservación y ampliación del conocimiento en el mundo islámico, gran parte del saber clásico griego se habría perdido para siempre en Occidente.`,
      obraIconica: `Kitab al-Shifa de Ibn Sina (Avicena): enciclopedia filosófica y científica (1027)`,
      paises: ['Califato Abasí', 'Persia', 'Al-Ándalus'],
    },
    {
      id: 'diccionarios-academias-lenguas',
      nombre: `Diccionarios y Academias de Lenguas`,
      anioInicio: 1600,
      anioFin: 1800,
      color: '#D97706',
      categoria: 'diccionario',
      descripcion: `El siglo XVII marca el nacimiento de los diccionarios modernos y las academias de lengua. El Vocabolario degli Accademici della Crusca (Florencia, 1612) es el primer gran diccionario normativo de una lengua moderna: fija el toscano literario (Dante, Petrarca) como estándar del italiano. La Real Academia Española se funda en 1713 y publica el Diccionario de Autoridades (1726-1739, 6 vols.), cuya edición abreviada (el DRAE, hoy DLE) llega a su 24ª edición en 2023. Samuel Johnson publicó en Londres A Dictionary of the English Language (1755): primer diccionario exhaustivo del inglés con 42.773 palabras definidas con citas literarias de autoridad, elaborado en 9 años por Johnson y 6 asistentes. El Dictionnaire de l'Académie française (1694) fijó el francés clásico. Esta era establece el modelo del diccionario como proyecto nacional y normativo, vinculado a la construcción de la identidad lingüística de los estados modernos.`,
      obraIconica: `A Dictionary of the English Language de Samuel Johnson (Londres, 1755)`,
      paises: ['Gran Bretaña', 'España', 'Francia', 'Italia'],
    },
    {
      id: 'encyclopedie-ilustracion',
      nombre: `La Encyclopédie y la Ilustración`,
      anioInicio: 1751,
      anioFin: 1800,
      color: '#059669',
      categoria: 'ilustracion',
      descripcion: `La Encyclopédie ou Dictionnaire raisonné des sciences, des arts et des métiers (1751-1772), dirigida por Denis Diderot y Jean le Rond d'Alembert, es el proyecto intelectual más ambicioso de la Ilustración y uno de los libros más influyentes de la historia. Sus 28 volúmenes (17 de texto + 11 de láminas) contienen ~71.818 artículos escritos por 140 colaboradores, incluyendo Voltaire, Rousseau, Montesquieu y Turgot. La Encyclopédie fue un acto político además de intelectual: su filosofía era empirista, racionalista y crítica de la Iglesia y el absolutismo; fue condenada y censurada dos veces por el gobierno francés y la Santa Sede, pero siguió circulando. Vendió ~4.000 suscripciones (a unos 980 livres cada una), convirtiéndose en un éxito comercial que financió el proyecto. Su modelo de árbol del conocimiento (árbol de Bacon, adaptado por d'Alembert) estructuraba todo el saber humano en Memoria, Razón e Imaginación. La Encyclopédie demostró que el conocimiento organizado podía ser un instrumento de cambio político y social.`,
      obraIconica: `Encyclopédie de Diderot y d'Alembert: 28 volúmenes, 71.818 artículos (1751-1772)`,
      paises: ['Francia', 'Europa'],
    },
    {
      id: 'enciclopedia-sovietica-censura',
      nombre: `La Gran Enciclopedia Soviética y la Censura`,
      anioInicio: 1926,
      anioFin: 1980,
      color: '#DC2626',
      categoria: 'censura',
      descripcion: `La Gran Enciclopedia Soviética (Bolshaya Sovetskaya Entsiklopediya, 3 ediciones: 1926-1947, 1949-1958, 1969-1978) es el ejemplo más documentado de enciclopedia instrumentalizada políticamente: artículos sobre figuras "caídas en desgracia" eran eliminados y los suscriptores recibían nuevas páginas con instrucciones de sustituirlas. El caso más documentado es el de Lavrenti Beria tras su ejecución en 1953: los suscriptores recibieron un sobre con páginas adicionales sobre el estrecho de Bering para sustituir físicamente el artículo sobre Beria. La Encyclopædia Britannica (fundada en Edimburgo en 1768) alcanzó su cénit en la edición de 1911 (11ª ed., 29 vols., ~44 millones de palabras), con artículos de Einstein y Bertrand Russell. La Enciclopedia Espasa-Calpe (1908-1930, 70 vols.) es la enciclopedia en español más extensa jamás publicada. Microsoft Encarta (1993-2009) fue la primera enciclopedia digital de consumo masivo en CD-ROM antes de ser superada por internet.`,
      obraIconica: `Gran Enciclopedia Soviética: el caso Beria y las páginas de sustitución (1953)`,
      paises: ['Unión Soviética', 'Gran Bretaña', 'España', 'Estados Unidos'],
    },
    {
      id: 'oxford-merriam-grandes-diccionarios',
      nombre: `Oxford, Merriam-Webster y los Grandes Diccionarios`,
      anioInicio: 1857,
      anioFin: 1950,
      color: '#D97706',
      categoria: 'diccionario',
      descripcion: `El Oxford English Dictionary (OED) es el mayor proyecto lexicográfico de la historia. Iniciado en 1857 por la Philological Society de Londres, no se completó hasta 1928: 71 años después. El primer fascículo publicado (1884) llegaba solo hasta la palabra "ant". El OED en su primera edición contenía 414.825 palabras con ~2 millones de citas de textos de los últimos 800 años. Su principal redactor durante décadas fue James Murray, autodidacta escocés que organizó miles de lectores voluntarios para documentar cada palabra del inglés con ejemplos textuales. Noah Webster publicó en EEUU An American Dictionary of the English Language (1828), estableciendo la ortografía norteamericana (colour→color, centre→center) y la tradición Merriam-Webster. En España, el Diccionario de la Real Academia Española (DRAE) fusiona las 21 academias de la lengua española en una obra común desde 1951. El OED demostró que un diccionario podía ser al mismo tiempo un monumento cultural y un archivo histórico de la lengua.`,
      obraIconica: `Oxford English Dictionary: completado en 1928 tras 71 años de trabajo colectivo`,
      paises: ['Gran Bretaña', 'Estados Unidos', 'España'],
    },
    {
      id: 'wikipedia-enciclopedia-libre',
      nombre: 'Wikipedia: La Enciclopedia Libre',
      anioInicio: 2001,
      anioFin: 2010,
      color: '#0EA5E9',
      categoria: 'digital',
      descripcion: `El 15 de enero de 2001, Jimmy Wales y Larry Sanger lanzaron Wikipedia en inglés con el principio radical de que cualquier persona podía escribir y editar cualquier artículo. En 2003 se lanzó la versión española (la segunda en tamaño). En 2024, Wikipedia tiene más de 60 millones de artículos en 332 idiomas, con ~280.000 editores activos mensuales. El modelo wiki demostró que la inteligencia colectiva, con sistemas de revisión por pares descentralizada y políticas de neutralidad (NPOV: Neutral Point of View), podía producir contenido comparable en precisión a enciclopedias profesionales. Un estudio de Nature (2005) comparó 42 artículos científicos de Wikipedia y Britannica y encontró solo una ligera ventaja para Britannica. Nupedia (el proyecto previo de Wales, con revisión experta) solo produjo 24 artículos en 3 años; Wikipedia tenía 20.000 en su primer año. La Fundación Wikimedia (sin ánimo de lucro) rechazó ofertas de adquisición de Google y otros, preservando el modelo de conocimiento libre y abierto.`,
      obraIconica: `Wikipedia: 60 millones de artículos en 332 idiomas, gestionados por voluntarios`,
      paises: ['Internacional', 'Estados Unidos', 'España'],
    },
    {
      id: 'diccionarios-digitales-corpus',
      nombre: `Diccionarios Digitales y Corpus Lingüísticos`,
      anioInicio: 1990,
      anioFin: 2020,
      color: '#0EA5E9',
      categoria: 'digital',
      descripcion: `La revolución digital transformó la lexicografía desde los años 90. Los corpus lingüísticos computerizados (British National Corpus, 1994; Corpus del Español de Mark Davies; Google Books Ngram Viewer, 2010) permitieron por primera vez analizar el uso real de millones de palabras en millones de textos. El OED Online (2000) introdujo actualizaciones trimestrales imposibles en papel y añadió palabras en tiempo real (selfie, COVID-19, etc.). Google Translate (2006) y DeepL (2017) democratizaron la traducción automática usando redes neuronales entrenadas en corpus bilingües masivos. La Real Academia Española publica el DLE en línea con consultas gratuitas ilimitadas y 93.111 entradas en su 24ª edición (2014, actualización 2022). Los diccionarios colaborativos como Urban Dictionary (~1999) y Wiktionary (~2002) documentan el habla informal y los neologismos en tiempo real, extendiendo la lexicografía más allá del ámbito académico.`,
      obraIconica: `OED Online (2000): actualizaciones trimestrales y primera documentación de cada palabra`,
      paises: ['Gran Bretaña', 'España', 'Estados Unidos', 'Alemania'],
    },
    {
      id: 'ia-lenguaje-futuro-lexicografia',
      nombre: `IA Generativa y el Futuro de la Lexicografía`,
      anioInicio: 2020,
      anioFin: 9999,
      color: '#0EA5E9',
      categoria: 'digital',
      descripcion: `Los grandes modelos de lenguaje (LLMs) como GPT-4, Claude y Gemini han absorbido implícitamente el contenido de miles de diccionarios y enciclopedias, pero su relación con el conocimiento léxico plantea nuevas preguntas: no tienen entradas discretas, no citan fuentes, y pueden "alucinar" definiciones plausibles pero falsas. Perplexity, ChatGPT con búsqueda web y Google Search Generative Experience compiten ya con Wikipedia como primera fuente de consulta. La Fundación Wikimedia ha comenzado a explorar cómo integrar IA para apoyar a los editores humanos sin sustituirlos. El debate sobre el futuro del conocimiento verificado, estructurado y citable frente al conocimiento generado por IA es el capítulo más reciente de la historia de 4.000 años de enciclopedismo humano. La tensión entre democratización del conocimiento (Wikipedia, IA) y verificabilidad experta (Britannica, OED) define el horizonte del siglo XXI y plantea preguntas fundamentales sobre la naturaleza misma del saber colectivo.`,
      obraIconica: `ChatGPT (2022): IA generativa que sintetiza pero no cita ni garantiza veracidad`,
      paises: ['Internacional', 'Estados Unidos', 'Europa'],
    },
  ],

  eras: [
    {
      nombre: `Primeras Listas y Enciclopedismo Clásico`,
      desde: -2000,
      hasta: 600,
      icono: '📜',
      hitosDestacados: [
        'Primeras Listas de Palabras Sumerias',
        `Enciclopedismo Griego y Romano`,
      ],
      eventos: [
        'Listas de palabras sumerias en tablillas cuneiformes (~2000 a.C.)',
        'Listado bilingüe sumerio-eblaíta de Ebla: primer diccionario bilingüe (~2300 a.C.)',
        `Erya: primer diccionario chino conocido, ~2.094 palabras (~300 a.C.)`,
        `Historia Naturalis de Plinio el Viejo: ~20.000 hechos de 2.000 fuentes (~77 d.C.)`,
        `Etymologiae de Isidoro de Sevilla: enciclopedia medieval más influyente (~630 d.C.)`,
      ],
    },
    {
      nombre: `El Saber Medieval: Islam y Cristiandad`,
      desde: 600,
      hasta: 1450,
      icono: '🕌',
      hitosDestacados: [
        `Enciclopedia Islámica Medieval`,
      ],
      eventos: [
        `Casa de la Sabiduría (Bayt al-Hikma) en Bagdad: centro de traducción (~830 d.C.)`,
        `Kitab al-Shifa de Ibn Sina (Avicena): 18 volúmenes de filosofía y ciencia (1027)`,
        `Escuela de Traductores de Toledo: puente entre el saber islámico y la Europa medieval (s. XII)`,
        `Al-Biruni cataloga los conocimientos sobre India, astronomía y farmacología (~1000)`,
        `Grandes enciclopedias escolásticas europeas: Vincent de Beauvais, Speculum Maius (s. XIII)`,
      ],
    },
    {
      nombre: `Imprenta, Academias y Diccionarios Nacionales`,
      desde: 1450,
      hasta: 1751,
      icono: '📖',
      hitosDestacados: [
        `Diccionarios y Academias de Lenguas`,
      ],
      eventos: [
        `Imprenta de Gutenberg (1455): la difusión del conocimiento a escala nunca vista`,
        `Vocabolario della Crusca: primer diccionario normativo moderno (Florencia, 1612)`,
        `Dictionnaire de l'Académie française: fija el francés clásico (1694)`,
        `Real Academia Española fundada: comienza el Diccionario de Autoridades (1713-1739)`,
        `A Dictionary of the English Language de Johnson: 42.773 palabras con citas (1755)`,
      ],
    },
    {
      nombre: `La Encyclopédie y la Era de los Grandes Proyectos`,
      desde: 1751,
      hasta: 1900,
      icono: '💡',
      hitosDestacados: [
        `La Encyclopédie y la Ilustración`,
        `Oxford, Merriam-Webster y los Grandes Diccionarios`,
      ],
      eventos: [
        `Encyclopédie de Diderot y d'Alembert: 28 vols., 71.818 artículos (1751-1772)`,
        `Condenada y censurada dos veces por el gobierno francés y la Santa Sede`,
        `Encyclopædia Britannica: primera edición en Edimburgo (1768)`,
        `An American Dictionary de Noah Webster: fija la ortografía americana (1828)`,
        `Philological Society de Londres: inicio del proyecto OED (1857)`,
      ],
    },
    {
      nombre: `Enciclopedias del Siglo XX: Britannica a Encarta`,
      desde: 1900,
      hasta: 2001,
      icono: '📚',
      hitosDestacados: [
        `La Gran Enciclopedia Soviética y la Censura`,
        `Oxford, Merriam-Webster y los Grandes Diccionarios`,
      ],
      eventos: [
        `Enciclopedia Espasa-Calpe: 70 vols., la mayor en español jamás publicada (1908-1930)`,
        `Encyclopædia Britannica 11ª ed.: cumbre de la enciclopedia impresa (1911)`,
        `Oxford English Dictionary completado tras 71 años de trabajo (1928)`,
        `Gran Enciclopedia Soviética: 3 ediciones, caso Beria y páginas de sustitución (1949-1978)`,
        `Microsoft Encarta: primera enciclopedia digital en CD-ROM (1993-2009)`,
      ],
    },
    {
      nombre: `Wikipedia, IA y el Conocimiento Abierto`,
      desde: 2001,
      hasta: 9999,
      icono: '🌐',
      hitosDestacados: [
        'Wikipedia: La Enciclopedia Libre',
        `Diccionarios Digitales y Corpus Lingüísticos`,
        `IA Generativa y el Futuro de la Lexicografía`,
      ],
      eventos: [
        `Wikipedia lanzada: 20.000 artículos en el primer año (enero 2001)`,
        `OED Online: actualizaciones trimestrales, imposibles en papel (2000)`,
        `Google Books Ngram Viewer: análisis de millones de palabras en millones de textos (2010)`,
        `DeepL y la traducción automática neural democratizan el multilingüismo (2017)`,
        `ChatGPT y los LLMs: IA que sintetiza el conocimiento sin citar fuentes (2022)`,
      ],
    },
  ],

  categorias: {
    origen: `Orígenes y Antigüedad`,
    enciclopedia: `Enciclopedismo`,
    diccionario: `Lexicografía`,
    ilustracion: `Ilustración y Academias`,
    digital: `Era Digital`,
    censura: `Censura y Poder`,
  },

  colores: {
    origen: '#7C3AED',
    enciclopedia: '#1E3A8A',
    diccionario: '#D97706',
    ilustracion: '#059669',
    digital: '#0EA5E9',
    censura: '#DC2626',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: `De las primeras listas de palabras en tablillas de arcilla sumerias (~2000 a.C.) a la Wikipedia con 60 millones de artículos en 332 idiomas: la historia de los diccionarios y enciclopedias es la historia del deseo humano de organizar, preservar y democratizar el conocimiento. Cada época generó sus propias formas de sistematizar el saber, desde la oralidad y la escritura cuneiforme hasta la IA generativa, pasando por la imprenta, las academias nacionales y la edición colaborativa en internet.`,

    tablaComparativa: [
      {
        hito: `Etymologiae — Isidoro de Sevilla`,
        periodo: `~630 d.C.`,
        categoria: `enciclopedia`,
        personaje: `Isidoro de Sevilla`,
        aportacion: `20 libros que sintetizan todo el conocimiento cristiano y clásico; copiados en miles de manuscritos medievales; primera gran enciclopedia cristiana de Occidente`,
      },
      {
        hito: `Encyclopédie — Diderot y d'Alembert`,
        periodo: `1751-1772`,
        categoria: `ilustracion`,
        personaje: `Denis Diderot, Jean le Rond d'Alembert`,
        aportacion: `28 volúmenes, 71.818 artículos, 140 colaboradores; árbol del conocimiento en Memoria, Razón e Imaginación; acto político e intelectual de la Ilustración`,
      },
      {
        hito: `Oxford English Dictionary`,
        periodo: `1884-1928`,
        categoria: `diccionario`,
        personaje: `James Murray y miles de voluntarios`,
        aportacion: `414.825 palabras con ~2 millones de citas textuales; primera documentación de cada palabra en inglés; 71 años de trabajo colectivo`,
      },
      {
        hito: `Britannica 11ª Edición`,
        periodo: `1911`,
        categoria: `enciclopedia`,
        personaje: `Hugh Chisholm (editor jefe)`,
        aportacion: `29 volúmenes, ~44 millones de palabras; artículos de Einstein y Bertrand Russell; cumbre de la enciclopedia impresa generalista`,
      },
      {
        hito: `Wikipedia`,
        periodo: `2001-presente`,
        categoria: `digital`,
        personaje: `Jimmy Wales, Larry Sanger`,
        aportacion: `60 millones de artículos en 332 idiomas; modelo colaborativo NPOV; gratuita, universal y actualizable en tiempo real`,
      },
      {
        hito: `ChatGPT y LLMs`,
        periodo: `2022-presente`,
        categoria: `digital`,
        personaje: `OpenAI, Anthropic, Google`,
        aportacion: `IA generativa que sintetiza conocimiento de miles de fuentes sin citar ni garantizar veracidad; acceso conversacional al saber acumulado`,
      },
    ],

    escenarios: [
      {
        icono: `📚`,
        titulo: `Cómo se hacía un diccionario antes de los ordenadores: el caso del OED`,
        perfil: `Lingüistas, historiadores y cualquier persona curiosa sobre la lexicografía`,
        texto: `En 1857, la Philological Society de Londres decidió hacer el diccionario más completo del inglés. Su método: miles de lectores voluntarios leyeron libros durante décadas marcando cada palabra en contexto y enviando fichas por correo. James Murray recibió millones de fichas en su scriptorium (un cobertizo en Oxford). El proyecto tardó 71 años. El resultado: 414.825 palabras con 1.827.306 citas textuales, desde el inglés del año 1000 hasta 1928. Hoy el OED tiene ~600.000 palabras y se actualiza online cada trimestre.`,
      },
      {
        icono: `🚫`,
        titulo: `Por qué la Encyclopédie fue censurada y siguió circulando`,
        perfil: `Interesados en historia de las ideas y libertad de expresión`,
        texto: `En 1752, el Consejo Real de Francia prohibió los dos primeros volúmenes de la Encyclopédie por "subvertir la autoridad real". En 1759, el Papa Clemente XIII la añadió al Index. ¿Cómo siguió publicándose? El rey Luis XV necesitaba los impuestos; el censor real Malesherbes era un admirador secreto; Diderot ocultó los manuscritos en casa del propio Malesherbes. Los 4.000 suscriptores ya habían pagado por adelantado, creando un incentivo económico irresistible. La Encyclopédie demostró que el conocimiento distribuido es muy difícil de suprimir.`,
      },
      {
        icono: `🌐`,
        titulo: `Cómo funciona Wikipedia: políticas NPOV y verificabilidad`,
        perfil: `Usuarios de internet, estudiantes y cualquiera que consulte Wikipedia`,
        texto: `Wikipedia tiene tres pilares: Neutralidad (NPOV), Verificabilidad (citar fuentes publicables) y No investigación original. Los artículos controvertidos tienen "páginas de discusión". Los de alta visibilidad están "protegidos": solo editores verificados pueden modificarlos. Hay ~280.000 editores activos mensuales y ~1.000 administradores. Un estudio de Nature (2005) encontró precisión comparable a Britannica en 42 artículos científicos analizados.`,
      },
      {
        icono: `🤖`,
        titulo: `IA vs. enciclopedia: qué ganas y qué pierdes con cada modelo`,
        perfil: `Cualquier persona que use IA para buscar información`,
        texto: `Una enciclopedia ofrece: atribución (sabes quién escribió qué), verificabilidad (cada afirmación cita una fuente) y responsabilidad editorial. Una IA generativa ofrece: síntesis fluida y acceso conversacional. Lo que la IA NO ofrece: citas verificables, garantía de veracidad ni responsabilidad cuando se equivoca. El riesgo de las "alucinaciones" (información falsa presentada con confianza) es el mayor desafío del conocimiento en la era de la IA generativa.`,
      },
    ],

    faq: [
      {
        pregunta: `¿Cuántas palabras tiene el idioma español según el DLE?`,
        respuesta: `El Diccionario de la Lengua Española (DLE) de la Real Academia Española tiene 93.111 entradas en su 24ª edición (2014, actualización 2022). Pero eso no significa que el español tenga solo 93.111 palabras: el DLE recoge el vocabulario "común y estándar", excluyendo miles de tecnicismos, regionalismos, neologismos aún no aceptados y palabras coloquiales o vulgares. El vocabulario activo total del español supera el millón de palabras si se incluyen todos los registros. La pregunta correcta no es "cuántas palabras tiene el español" sino "qué criterios usa la RAE para incluir una palabra".`,
      },
      {
        pregunta: `¿Wikipedia es fiable? ¿Cómo se controla la calidad?`,
        respuesta: `Wikipedia tiene una fiabilidad variable según el artículo. Los artículos científicos bien establecidos (física, química, matemáticas) suelen ser muy precisos. Los artículos sobre personas vivas, política o eventos recientes pueden tener sesgos o errores. El control de calidad se basa en: políticas de verificabilidad (toda afirmación debe citar una fuente publicada), el sistema de revisión por pares de los editores voluntarios, y los bots que detectan vandalismo automáticamente. Un estudio de Nature (2005) encontró una precisión comparable a Britannica en artículos científicos. La regla práctica: Wikipedia es excelente para una primera orientación; para trabajo académico, verifica siempre las fuentes que cita.`,
      },
      {
        pregunta: `¿Quién decide qué palabras entran en el diccionario de la RAE?`,
        respuesta: `La Real Academia Española (46 académicos de número) y las 22 academias asociadas de América y Filipinas (Asociación de Academias de la Lengua Española, ASALE). El proceso: la palabra debe aparecer con frecuencia en textos escritos de distintos géneros y regiones hispanohablantes durante un período sostenido. El departamento de lexicografía de la RAE monitoriza los corpus lingüísticos (CORDE, CORPES XXI). Un académico propone la incorporación con documentación textual. La comisión de lexicografía debate la definición, etimología y marcas gramaticales. Finalmente se vota en pleno. Palabras recientes incorporadas: "postureo", "selfi", "tuit", "tuitear", "emoji".`,
      },
      {
        pregunta: `¿Qué es un corpus lingüístico y para qué sirve?`,
        respuesta: `Un corpus lingüístico es una colección masiva de textos reales (libros, periódicos, conversaciones, páginas web) usada para estudiar cómo se usa realmente una lengua. El Corpus de Referencia del Español Actual (CREA, RAE) contiene 160 millones de palabras de textos de 1975-2004. El CORPES XXI añade textos desde 2001. El Corpus del Español de Mark Davies tiene más de 2.000 millones de palabras. Los corpus permiten: saber cuándo se empezó a usar una palabra, en qué contextos aparece, con qué frecuencia, y si su uso está cambiando. Son la base de los diccionarios modernos, la traducción automática (Google Translate, DeepL) y los modelos de lenguaje de IA.`,
      },
      {
        pregunta: `¿Qué le pasará a las enciclopedias con la IA generativa?`,
        respuesta: `Es el debate más vivo de la lexicografía y el conocimiento digital actual. Los optimistas ven la IA como una herramienta para ayudar a los editores de Wikipedia (generando borradores, detectando errores, traduciendo artículos). Los pesimistas temen que los LLMs sustituyan la consulta enciclopédica sin ofrecer sus garantías de verificabilidad. La Fundación Wikimedia ya experimenta con IA para apoyar editores. Lo más probable: coexistencia. La enciclopedia verificada, citable y con atribución seguirá siendo necesaria para el trabajo académico, el periodismo y la investigación. La IA ofrecerá síntesis rápidas para consultas cotidianas. El riesgo real es que la gente deje de distinguir entre "saber verificado" y "texto generado plausible".`,
      },
    ],

    pasos: [
      {
        titulo: `La palabra circula en textos escritos`,
        cuerpo: `Una palabra nueva (neologismo, extranjerismo, tecnicismo popularizado) aparece en textos escritos de distintos géneros: prensa, literatura, redes sociales, divulgación científica. La RAE monitoriza los corpus lingüísticos (CORDE, CORPES XXI) para detectar palabras con frecuencia creciente en distintas variedades del español.`,
      },
      {
        titulo: `El corpus académico detecta frecuencia y distribución`,
        cuerpo: `El departamento de lexicografía de la RAE analiza cuántas veces aparece la palabra, en qué contextos, en qué géneros textuales y en cuántos países hispanohablantes. Para ser candidata, una palabra debe mostrar estabilidad de uso durante varios años y extensión geográfica.`,
      },
      {
        titulo: `Un académico propone la incorporación con documentación`,
        cuerpo: `Un miembro de la RAE o de una academia asociada propone formalmente la palabra, aportando ejemplos textuales documentados, etimología propuesta, categoría gramatical y definición preliminar. La propuesta incluye también un análisis de si la palabra ya tiene equivalente en español estándar.`,
      },
      {
        titulo: `Debate en comisión de lexicografía`,
        cuerpo: `La comisión debate la definición exacta, la etimología, las marcas gramaticales (sustantivo, verbo, adjetivo; género; plural) y las marcas de uso (coloquial, vulgar, técnico, regional). También se discute la ortografía: para extranjerismos, si se adapta a la fonología española (tuit, selfi) o se acepta la grafía original.`,
      },
      {
        titulo: `Votación en pleno y publicación en el DLE online`,
        cuerpo: `La propuesta se somete a votación en el pleno de la RAE (46 académicos de número) y requiere mayoría. Si se aprueba, la nueva entrada se publica en la siguiente actualización anual del DLE online (dle.rae.es). La versión digital permite incorporar novedades de forma continua; cada año se añaden y modifican decenas de entradas.`,
      },
    ],

    tips: [
      {
        icono: `📖`,
        texto: `Recursos gratuitos de referencia lingüística en español: DLE (dle.rae.es, 93.111 entradas), CORDE y CORPES XXI (millones de textos reales), Diccionario panhispánico de dudas (dpd.rae.es) y Fundéu (fundeu.es) para neologismos y uso correcto. Todos gratuitos y accesibles online.`,
      },
      {
        icono: `🎓`,
        texto: `Wikipedia no es una fuente primaria para trabajos académicos: úsala para orientarte y localizar fuentes. Luego cita esas fuentes primarias. Si necesitas la versión exacta consultada, usa el "enlace permanente" del menú lateral del artículo, que congela la versión en esa fecha.`,
      },
      {
        icono: `🔍`,
        texto: `Un diccionario prescriptivo (como el DLE de la RAE) establece cómo "debe" usarse el idioma. Uno descriptivo (como el OED) registra cómo se usa realmente, sin juzgar. Urban Dictionary es puramente descriptivo. La mayoría de los diccionarios modernos combinan ambas perspectivas con marcas de registro.`,
      },
      {
        icono: `🌍`,
        texto: `El OED Online (oed.com, accesible gratis en muchas bibliotecas públicas) documenta la primera aparición textual conocida de cada palabra en inglés: "selfie" fue documentada por primera vez en un foro australiano en 2002. Incluye etimología completa y evolución semántica a lo largo de los siglos.`,
      },
    ],

    errores: [
      {
        titulo: `"La RAE decide cómo hablamos los hispanohablantes"`,
        cuerpo: `La RAE no impone el uso: registra y describe el español tal como se habla, con preferencia por usos extendidos y estables. El español evoluciona independientemente de la RAE: palabras como "tío", "guay" o "flipar" estaban en uso popular décadas antes de entrar en el diccionario. La RAE también se equivoca: eliminó la acentuación diferencial de "solo/sólo" en 2010 generando controversia. El español de 500 millones de hablantes no puede ser regulado por 46 académicos en Madrid.`,
      },
      {
        titulo: `"Wikipedia no se puede citar porque cualquiera puede editarla"`,
        cuerpo: `Este argumento está desactualizado. Wikipedia tiene políticas de verificabilidad y neutralidad más estrictas que muchos medios: toda afirmación debe citar una fuente publicable, los artículos de alta visibilidad están protegidos, y los bots detectan vandalismo en segundos. El problema real no es "que cualquiera puede editarla" sino que la calidad es desigual: excelente en ciencias, historia y geografía; más variable en política y eventos recientes.`,
      },
      {
        titulo: `"Las enciclopedias antiguas eran objetivas"`,
        cuerpo: `Toda enciclopedia refleja los valores, prejuicios y conocimientos de su época. La Britannica de 1911 tenía artículos con racismo científico. La Gran Enciclopedia Soviética reescribía artículos según las directrices del Partido Comunista. Incluso Wikipedia tiene sesgos documentados: sus editores son mayoritariamente hombres occidentales con educación universitaria. Toda fuente de conocimiento tiene perspectiva; reconocerla es el primer paso del pensamiento crítico.`,
      },
      {
        titulo: `"Los diccionarios contienen todas las palabras de un idioma"`,
        cuerpo: `Ningún diccionario puede capturar el vocabulario total de una lengua viva. El DLE con sus 93.111 entradas selecciona el "español estándar común", excluyendo intencionalmente tecnicismos, regionalismos, argot y neologismos aún no aceptados. El vocabulario total del español supera el millón de palabras si se incluyen todos los registros. El diccionario es siempre una selección deliberada, no un inventario completo.`,
      },
    ],
  },
};
