import type { HistoriaData } from './types';

export const siliconValley: HistoriaData = {
  slug: 'silicon-valley',
  titulo: 'Historia de Silicon Valley: Del Garaje de HP a la IA Generativa',
  subtitulo:
    'De los semiconductores de los años 40 a la inteligencia artificial del siglo XXI: 85 años de innovación tecnológica en 48 kilómetros cuadrados',
  descripcionSEO:
    'Cronología interactiva de Silicon Valley: desde Hewlett-Packard en 1939 hasta la IA generativa. HP, Fairchild, Intel, Apple, Google, iPhone, ChatGPT y la regulación tecnológica global en 10 hitos y 6 eras. El ecosistema que cambió el mundo.',
  keywords: [
    'historia silicon valley cronología',
    'HP fairchild intel apple google historia tecnología',
    'burbuja dot-com nasdaq 2000 internet',
    'iphone apple móvil revolución',
    'venture capital startups unicornios',
    'ia generativa chatgpt openai regulación big tech',
    'stanford universidad industria tecnológica',
  ],
  anioInicio: 1937,
  anioFin: 9999,

  hitos: [
    {
      id: 'garaje-hp-semiconductores',
      nombre: 'El Garaje de HP y los Primeros Semiconductores',
      anioInicio: 1937,
      anioFin: 1957,
      color: '#374151',
      categoria: 'semiconductores',
      descripcion:
        'La historia de Silicon Valley comienza en un garaje de 12 metros cuadrados en 367 Addison Avenue, Palo Alto, donde William Hewlett y David Packard fundaron Hewlett-Packard en 1939 con un capital inicial de 538 dólares. Su primer producto, el oscilador de audio HP 200A, fue vendido a Walt Disney Studios para la película Fantasía: ocho unidades a 71,50 dólares cada una. Este garaje, declarado hoy Monumento Histórico de California, se convirtió en el símbolo fundacional de un ecosistema que definiría el siglo XX y XXI. El catalizador académico llegó de la mano de Frederick Terman, decano de ingeniería de Stanford, quien en 1951 creó el Stanford Industrial Park (hoy Stanford Research Park), arrendando terrenos de la universidad a empresas tecnológicas emergentes. Este modelo de colaboración universidad-industria —pionero en el mundo— atrajo a Varian Associates, Lockheed y a la propia HP, estableciendo el patrón que haría famoso al Valle. El salto tecnológico definitivo ocurrió en Bell Laboratories (Nueva Jersey) cuando William Shockley, John Bardeen y Walter Brattain inventaron el transistor de contacto puntual en diciembre de 1947. Shockley, nacido en Palo Alto, regresó a California natal en 1956 para fundar Shockley Semiconductor Laboratory en Mountain View —la primera empresa dedicada exclusivamente a semiconductores en lo que se llamaría Silicon Valley— atrayendo a los mejores ingenieros del país con la promesa de trabajar en la tecnología más avanzada del planeta. El período estuvo marcado también por contratos militares: Lockheed Missiles abrió su planta en Sunnyvale en 1956, aportando ingenieros especializados y financiación federal que nutrió el ecosistema tecnológico. El Valle nació en el cruce entre academia, industria y defensa nacional.',
      obraIconica: 'Garaje de HP en 367 Addison Avenue, Palo Alto (1939) — Monumento Histórico de California',
      paises: ['Estados Unidos', 'California'],
    },
    {
      id: 'fairchild-intel-traicioneros',
      nombre: 'Los Ocho Traidores: Fairchild e Intel',
      anioInicio: 1957,
      anioFin: 1976,
      color: '#374151',
      categoria: 'semiconductores',
      descripcion:
        'En septiembre de 1957, ocho ingenieros de Shockley Semiconductor —Robert Noyce, Gordon Moore, Julius Blank, Victor Grinich, Jean Hoerni, Eugene Kleiner, Jay Last y Sheldon Roberts— abandonaron colectivamente a su empleador para fundar Fairchild Semiconductor. Shockley los llamó "los ocho traidores" (traitorous eight). El financiamiento llegó de Sherman Fairchild a través del corredor Arthur Rock, que ejecutó la primera operación de lo que hoy llamamos venture capital (capital riesgo). Este episodio estableció dos normas culturales que diferenciarían Silicon Valley de los clusters tecnológicos tradicionales: la movilidad laboral como virtud (no como traición) y la financiación de startups por inversores privados a cambio de participación accionarial. En Fairchild, Jean Hoerni desarrolló el proceso planar (1959) y Robert Noyce inventó el circuito integrado monolítico —simultáneamente a Jack Kilby en Texas Instruments, en uno de los parallelismos más documentados de la historia tecnológica—. El circuito integrado comprimió transistores, resistencias y condensadores en una única lámina de silicio, reduciendo el coste del cómputo de manera exponencial. En 1965, Gordon Moore publicó su famosa observación: el número de transistores por pulgada cuadrada se duplicaría cada dos años (Ley de Moore), predicción que resultó extraordinariamente precisa durante cinco décadas. En 1968, Noyce y Moore fundaron Intel (Integrated Electronics) con 2,5 millones de dólares aportados por Arthur Rock. En 1971, Intel presentó el 4004, el primer microprocesador comercial del mundo: 2.300 transistores en un chip de 3x4 mm con la misma capacidad de cómputo que el ENIAC de 1945 (que ocupaba una planta entera). El precio de lanzamiento fue de 200 dólares; hoy un chip equivalente costaría menos de un centavo. Fairchild, entretanto, generó más de 130 spin-offs —empresas fundadas por exempleados— creando el efecto de ramificación que multiplicaría el ecosistema del Valle sin planificación central.',
      obraIconica: 'Intel 4004: primer microprocesador comercial del mundo, 2.300 transistores (noviembre 1971)',
      paises: ['Estados Unidos', 'California'],
    },
    {
      id: 'apple-xerox-parc',
      nombre: 'Apple, Xerox PARC y la Era del PC',
      anioInicio: 1976,
      anioFin: 1994,
      color: '#059669',
      categoria: 'startup',
      descripcion:
        'El 1 de abril de 1976, Steve Jobs, Steve Wozniak y Ronald Wayne firmaron el contrato de asociación de Apple Computer en el garaje familiar de Los Altos. Wayne vendió su parte (10%) por 800 dólares doce días después. El Apple II (1977) a 1.298 dólares se convirtió en el primer ordenador personal de éxito masivo, con ventas de 35.000 unidades en el primer año y más de dos millones en total. La empresa salió a bolsa en diciembre de 1980 con una valoración de 1.790 millones de dólares, la OPV de mayor volumen desde Ford en 1956. El episodio de Xerox PARC es uno de los más citados de la historia tecnológica. En diciembre de 1979, Steve Jobs visitó el Xerox Palo Alto Research Center (PARC), donde los ingenieros habían desarrollado la interfaz gráfica de usuario (GUI), el ratón, las redes Ethernet y la impresión láser —tecnologías que Xerox no sabía cómo comercializar—. Jobs regresó convencido de que el futuro de la informática era gráfico e intuitivo. El resultado fue el Apple Lisa (1983, 9.995 dólares, fracaso comercial) y el Macintosh (enero 1984, 2.495 dólares), presentado con el anuncio televisivo "1984" dirigido por Ridley Scott durante la Super Bowl XVIII —el primer gran evento de marketing tecnológico moderno—. El Macintosh democratizó la GUI y el ratón, estableciendo el paradigma de la computación personal que perdura hasta hoy. Simultáneamente, el Valle acogía la fundación de Oracle por Larry Ellison (1977), Sun Microsystems por Vinod Khosla, Scott McNealy y Andy Bechtolsheim (1982) y Cisco Systems por Leonard Bosack y Sandy Lerner (1984), que construirían la infraestructura de servidores, bases de datos y redes sobre la que correría internet. Bill Gates firmó el acuerdo con IBM para proveer MS-DOS (1981), sentando las bases del duopolio Wintel que dominaría los PC durante veinte años. La industria del videojuego emergía en paralelo: Atari (1972, Pong) y la posterior fundación de Electronic Arts (1982) establecieron el entretenimiento digital como industria.',
      obraIconica: 'Lanzamiento del Apple Macintosh con el anuncio "1984" de Ridley Scott (Super Bowl, enero 1984)',
      paises: ['Estados Unidos', 'California'],
    },
    {
      id: 'dot-com-boom',
      nombre: 'El Boom Dot-com: Internet se Comercializa',
      anioInicio: 1994,
      anioFin: 2000,
      color: '#D97706',
      categoria: 'internet',
      descripcion:
        'El 9 de agosto de 1995, Netscape Communications salió a bolsa. La empresa, fundada apenas dieciséis meses antes por Marc Andreessen y Jim Clark, no tenía beneficios y tenía ingresos mínimos. Las acciones abrieron a 28 dólares, llegaron a 75 durante la sesión y cerraron a 58,25. La valoración final superó los 2.900 millones de dólares. Esta OPV inauguró la era dot-com y estableció el modelo "crecimiento sobre beneficios" que definiría una generación de inversiones tecnológicas. El contexto era la masificación de internet: el navegador Mosaic (1993, del propio Andreessen en la Universidad de Illinois) había convertido la World Wide Web en accesible para el público general. Tim Berners-Lee había creado la web en el CERN (1991), pero fue la comercialización del acceso a internet por parte de AOL, CompuServe y NetZero lo que llevó la red a los hogares norteamericanos. En ese contexto de euforia emergieron las empresas que definirían el siglo XXI: Amazon fundada por Jeff Bezos en Seattle (julio 1994) como librería online con 10.000 títulos; Yahoo! por Jerry Yang y David Filo en Stanford (enero 1995); eBay por Pierre Omidyar en San José (septiembre 1995); y Google por Larry Page y Sergey Brin, también en Stanford (septiembre 1998). El NASDAQ Composite pasó de 1.000 puntos en 1995 a 5.048 el 10 de marzo de 2000, multiplicándose por cinco. Las valoraciones se calculaban en métricas novedosas: "precio por usuario", "velocidad de crecimiento de visitantes únicos", "mindshare". Webvan recaudó 375 millones de dólares en su OPV (1999) para construir la infraestructura de supermercado online más avanzada del mundo. Flooz.com, Boo.com y Kozmo.com recaudaron cientos de millones con modelos de negocio cuya viabilidad nadie cuestionó mientras el índice subía. La capitalización combinada de las dot-coms llegó a superar el PIB de varios países europeos. El escepticismo era minoritario y socialmente costoso: los analistas que advertían de las valoraciones eran acusados de "no entender la nueva economía".',
      obraIconica: 'OPV de Netscape (agosto 1995): la primera gran salida a bolsa de una empresa de internet sin beneficios',
      paises: ['Estados Unidos', 'California', 'Global'],
    },
    {
      id: 'burbuja-dot-com-estallido',
      nombre: 'El Estallido: Caída y Supervivientes',
      anioInicio: 2000,
      anioFin: 2004,
      color: '#D97706',
      categoria: 'internet',
      descripcion:
        'El 10 de marzo de 2000 el NASDAQ marcó su máximo histórico de 5.048,62 puntos. En los dieciocho meses siguientes perdió el 78% de su valor, alcanzando los 1.114 puntos en octubre de 2002, la mayor destrucción de riqueza en mercados bursátiles desde el crack de 1929. Los casos más documentados ilustran la escala del fenómeno: Webvan había invertido 2.000 millones de dólares en almacenes automatizados de última generación cuando declaró la quiebra en julio de 2001; Pets.com salió a bolsa en febrero de 2000 a 300 millones de valoración y fue liquidada nueve meses después con 250 millones consumidos; Kozmo.com recaudó 280 millones para entregar objetos en una hora y cerró sin haber cobrado nunca por el servicio de entrega. El índice no recuperaría los 5.000 puntos hasta 2015, quince años después del máximo. Sin embargo, la crisis tuvo un efecto darwiniano selectivo. Las empresas que sobrevivieron lo hicieron porque tenían ventajas competitivas reales: Amazon emergió dominando la logística y la escala; eBay controlaba los efectos de red de los mercados entre personas; Google tenía el mejor algoritmo de búsqueda y un modelo de negocio basado en publicidad medible por clic —AdWords, lanzado en 2000— que resultó extraordinariamente rentable. La crisis dejó también infraestructura barata: miles de kilómetros de fibra óptica instalados a precios de burbuja que las empresas supervivientes compraron a céntimos por dólar, reduciendo sus costes operativos. Google recaudó 1.670 millones de dólares en su OPV de agosto de 2004 —la más esperada desde la de Netscape nueve años antes— validando que el ciclo de inversión había reiniciado, esta vez con negocios que generaban ingresos reales. La lección institucional: las burbujas destruyen empresas individuales pero aceleran la infraestructura tecnológica de la que se benefician las generaciones siguientes.',
      obraIconica: 'Quiebra de Webvan (julio 2001): 2.000 millones invertidos, símbolo de la sobreinversión dot-com',
      paises: ['Estados Unidos', 'California', 'Global'],
    },
    {
      id: 'google-amazon-web',
      nombre: 'Google, Amazon Web y la Web 2.0',
      anioInicio: 2001,
      anioFin: 2007,
      color: '#7C3AED',
      categoria: 'plataformas',
      descripcion:
        'El período 2001-2007 consolidó el modelo de negocio que haría de Silicon Valley la región más rentable del planeta: la plataforma de intermediación financiada por publicidad contextual o comisiones de transacción. Google perfeccionó AdWords, su sistema de publicidad por clic inaugurado en 2000. El modelo era radicalmente diferente a la publicidad tradicional: los anunciantes pagaban solo cuando un usuario hacía clic, con precios determinados por subasta en tiempo real. Los ingresos de Google pasaron de 86 millones en 2001 a 10.600 millones en 2006, con márgenes operativos superiores al 30%. La búsqueda se convirtió en el negocio más rentable per empleado de la historia empresarial. Jeff Bezos lanzó Amazon Web Services (AWS) en marzo de 2006 con una proposición aparentemente paradójica: alquilar el excedente de capacidad de cómputo de Amazon a otras empresas. S3 (almacenamiento) y EC2 (computación) permitían a cualquier startup lanzar infraestructura escalable sin invertir en servidores. La decisión transformó Amazon de minorista en proveedor de infraestructura; AWS opera hoy el 31% de la infraestructura cloud global y genera la mayor parte del beneficio operativo de Amazon. Tim O\'Reilly acuñó el término "Web 2.0" en 2004 para describir el internet participativo: Wikipedia (2001), Flickr (2004), Delicious, YouTube (2005), los blogs y las primeras redes sociales —MySpace (2003), Facebook (2004, limitada a universidades), LinkedIn (2003)—. El usuario dejaba de ser consumidor pasivo para convertirse en creador de contenido, con implicaciones que tardarían una década en comprenderse plenamente. Steve Jobs, que había regresado a Apple en 1997 y saneado la empresa con una inyección de 150 millones de Microsoft, lanzó el iPod en octubre de 2001 y iTunes Music Store en abril de 2003. Apple vendió 100 millones de iPods antes de 2007. El modelo de iTunes —comprar canciones individuales a 0,99 dólares en lugar de álbumes completos— desarmó la industria discográfica y estableció el precedente de la distribución digital de contenidos que transformaría la música, el cine, los libros y los videojuegos en la siguiente década.',
      obraIconica: 'Lanzamiento de Amazon Web Services (AWS) en 2006: la nube que sustenta la economía digital global',
      paises: ['Estados Unidos', 'California', 'Global'],
    },
    {
      id: 'iphone-movil',
      nombre: 'El iPhone y la Revolución Móvil',
      anioInicio: 2007,
      anioFin: 2012,
      color: '#1E3A8A',
      categoria: 'movil',
      descripcion:
        'El 9 de enero de 2007, Steve Jobs subió al escenario del Moscone Center de San Francisco con vaqueros y jersey negro y pronunció una de las frases más citadas de la historia empresarial: "Hoy Apple va a reinventar el teléfono". El iPhone original combinaba tres dispositivos —"un iPod de pantalla panorámica, un teléfono móvil revolucionario y un comunicador de internet"— en un único dispositivo con pantalla táctil capacitiva sin teclado físico. Las acciones de Apple subieron un 8% ese día; las de Nokia, entonces líder mundial en móviles, bajaron un 6%. Nokia, que controlaba el 40% del mercado de teléfonos móviles en 2007, no recuperaría su posición nunca. El App Store, lanzado en julio de 2008, creó el primer marketplace de software para dispositivos de consumo masivo. Cualquier desarrollador podía publicar una aplicación para 150 millones de iPhones y llegar al mercado global sin distribuidores, mayoristas ni lineales de tienda. En el primer año se descargaron 500 millones de aplicaciones. Google respondió con Android (presentado en noviembre 2007, primer dispositivo octubre 2008, HTC Dream), que optó por el modelo opuesto: sistema operativo abierto y gratuito para fabricantes. El duopolio iOS-Android que controla hoy el 99% del mercado de smartphones quedó establecido en 2008-2009. El ecosistema móvil generó el siguiente ciclo de startups de alto impacto: Airbnb (agosto 2008, San Francisco), WhatsApp (2009, San José), Uber (2009, San Francisco), Instagram (octubre 2010, San Francisco), Pinterest (2010). Todas ellas aprovechaban el smartphone ubicuo, el GPS, la cámara y la conectividad permanente para crear servicios imposibles sin ese substrato tecnológico. Apple lanzó el iPad en abril de 2010, creando la categoría de tablets. En mayo de 2010, Apple superó a Microsoft en capitalización bursátil por primera vez —176.000 millones frente a 173.000 millones—, señalando el relevo generacional en el liderazgo tecnológico.',
      obraIconica: 'Presentación del iPhone original por Steve Jobs en el Moscone Center (9 de enero 2007)',
      paises: ['Estados Unidos', 'California', 'Global'],
    },
    {
      id: 'big-five-dominio',
      nombre: 'Las Big Five y el Dominio de las Plataformas',
      anioInicio: 2012,
      anioFin: 2019,
      color: '#7C3AED',
      categoria: 'plataformas',
      descripcion:
        'El período 2012-2019 consolidó el dominio económico de las cinco empresas tecnológicas más grandes del mundo —Alphabet (Google), Amazon, Apple, Facebook y Microsoft, conocidas como GAFAM o "Big Five"—. En 2019 su capitalización bursátil combinada superaba los 5 billones de dólares, equivalente al PIB de Japón. El modelo económico subyacente era el de plataforma: crear un mercado bilateral o multilateral donde el operador facilita transacciones cobrando comisión o monetizando datos mediante publicidad. Las plataformas tienen propiedades económicas que las diferencian de los negocios industriales tradicionales: efectos de red (más usuarios hacen el servicio más valioso para cada usuario), costes marginales cercanos a cero y barreras de entrada basadas en datos acumulados. Facebook adquirió Instagram (abril 2012, 1.000 millones de dólares, 13 empleados) y WhatsApp (febrero 2014, 19.000 millones de dólares, 55 empleados) en las adquisiciones más rentables de la historia tecnológica. Alphabet compró YouTube (2006, 1.650 millones), DeepMind (2014, 500 millones) y Nest (2014, 3.200 millones). Microsoft adquirió LinkedIn (junio 2016, 26.200 millones), GitHub (octubre 2018, 7.500 millones) y Nuance (2021, 19.700 millones). La concentración atrajo el escrutinio regulatorio: la Comisión Europea multó a Google con 2.420 millones de euros en junio de 2017 por abuso de posición dominante en comparadores de precios, seguida de dos multas adicionales por un total superior a 8.000 millones. El Congreso de Estados Unidos abrió investigaciones bipartidistas sobre las prácticas de adquisición de competidores y el control de los marketplaces. Los debates sobre privacidad de datos, influencia en elecciones y responsabilidad editorial comenzaron a dominar la agenda política y mediática. La complejidad algorítmica de los sistemas de recomendación y publicidad de estas plataformas excedía la capacidad regulatoria de los marcos legales existentes, diseñados para industrias manufactureras o de telecomunicaciones.',
      obraIconica: 'Capitalización combinada GAFAM supera los 5 billones de dólares (2019): el mayor concentración de valor de la historia empresarial',
      paises: ['Estados Unidos', 'California', 'Global'],
    },
    {
      id: 'ia-generativa-chatgpt',
      nombre: 'La Irrupción de la IA Generativa',
      anioInicio: 2020,
      anioFin: 2023,
      color: '#059669',
      categoria: 'startup',
      descripcion:
        'OpenAI fue fundada en diciembre de 2015 como laboratorio de investigación sin ánimo de lucro con el objetivo declarado de "garantizar que la inteligencia artificial general beneficie a toda la humanidad". Sus cofundadores incluían a Elon Musk, Sam Altman, Greg Brockman e Ilya Sutskever, con una dotación inicial de 1.000 millones de dólares. La organización publicó GPT-2 (2019) con divulgación restringida por considerarse "demasiado peligroso", y GPT-3 en mayo de 2020: 175.000 millones de parámetros, capaz de generar texto indistinguible del humano en tareas específicas. El lanzamiento de ChatGPT el 30 de noviembre de 2022 marcó un punto de inflexión en la adopción de IA por el público general. La interfaz conversacional eliminó la barrera técnica de los sistemas anteriores. En los primeros dos meses, ChatGPT alcanzó 100 millones de usuarios activos mensuales, la adopción de usuario más rápida hasta esa fecha en la historia de los servicios de internet (Spotify tardó 4,5 años, Instagram 2,5 años). Microsoft, que había invertido 1.000 millones en OpenAI en 2019, anunció en enero de 2023 una inversión adicional de 10.000 millones de dólares e integró los modelos de OpenAI en Bing, Office y Azure. Google respondió con Bard, rebautizado como Gemini en 2024. El debate sobre seguridad de la IA fragmentó el propio Silicon Valley: Anthropic, fundada por Dario Amodei y Daniela Amodei junto a otros exempleados de OpenAI en 2021, adoptó una posición centrada en la seguridad ("AI Safety"); otros sectores defendían la aceleración tecnológica. La demanda de chips especializados para entrenamiento e inferencia de modelos de lenguaje catapultó a Nvidia: la empresa, fundada en Santa Clara en 1993, superó el billón de dólares de capitalización bursátil en junio de 2023 por las ventas de sus GPUs A100 y H100, convirtiéndose en la empresa más valiosa del sector semiconductores y, brevemente, del mundo.',
      obraIconica: 'ChatGPT alcanza 100 millones de usuarios en 2 meses (diciembre 2022): la adopción más rápida de un servicio de internet',
      paises: ['Estados Unidos', 'California', 'Global'],
    },
    {
      id: 'regulacion-big-tech',
      nombre: 'Antimonopolio, DMA y el Futuro Incierto',
      anioInicio: 2020,
      anioFin: 9999,
      color: '#DC2626',
      categoria: 'regulacion',
      descripcion:
        'El período 2020-actualidad está marcado por el mayor esfuerzo regulatorio sobre empresas tecnológicas desde la demanda antimonopolio contra AT&T (1974) o Microsoft (1998). En octubre de 2020, el Subcomité Antimonopolio de la Cámara de Representantes de EEUU publicó un informe de 449 páginas sobre las prácticas de Amazon, Apple, Facebook y Google, concluyendo que las cuatro empresas ejercían poder de monopolio en sus mercados respectivos. El Departamento de Justicia de EEUU demandó a Google en octubre de 2020 por monopolio ilegal en búsqueda y publicidad de búsqueda. En agosto de 2024, el juez Amit Mehta emitió un fallo histórico: Google mantuvo ilegalmente su monopolio en el mercado de búsqueda general, pagando a Apple aproximadamente 18.000 millones de dólares anuales para ser el buscador predeterminado en Safari. Las consecuencias —que podían incluir la desinversión de Chrome o Android— estaban pendientes de resolución al momento de escribir este artículo. En la Unión Europea, el Digital Markets Act (DMA), en vigor desde mayo de 2023, designó a Alphabet, Apple, Meta, Microsoft, Amazon y ByteDance como "guardianes de acceso" (gatekeepers), imponiendo obligaciones específicas: interoperabilidad de mensajería, acceso de competidores a plataformas, prohibición del auto-favorecimiento en resultados de búsqueda. La primera oleada de multas bajo el DMA se produjo en 2024. El debate más reciente gira en torno a la concentración en el ecosistema de IA: los modelos fundacionales más capaces están controlados por un puñado de empresas (OpenAI, Google DeepMind, Anthropic, Meta AI), que a su vez dependen de chips producidos casi exclusivamente por Nvidia y de infraestructura cloud provista por Amazon (AWS), Microsoft (Azure) y Google Cloud. La pregunta sin respuesta es si el patrón de concentración-regulación que ha caracterizado cada ciclo tecnológico anterior —IBM, AT&T, Microsoft, ahora GAFAM— se repetirá con la IA, o si la velocidad y escala del fenómeno requieren marcos regulatorios cualitativamente distintos.',
      obraIconica: 'Fallo judicial DOJ vs. Google (agosto 2024): monopolio ilegal en búsqueda confirmado por primera vez',
      paises: ['Estados Unidos', 'Unión Europea', 'Global'],
    },
  ],

  eras: [
    {
      nombre: 'Raíces Militares y Académicas',
      desde: 1937,
      hasta: 1957,
      icono: '🔬',
      hitosDestacados: ['El Garaje de HP y los Primeros Semiconductores'],
      eventos: [
        'William Hewlett y David Packard fundan HP en un garaje de Palo Alto (1939) con 538 dólares',
        'Walt Disney compra los primeros osciladores HP para la película Fantasía (1939)',
        'Invención del transistor en Bell Labs por Shockley, Bardeen y Brattain (1947)',
        'Frederick Terman crea el Stanford Industrial Park (1951), modelo universidad-industria',
        'Shockley Semiconductor Laboratory se instala en Mountain View (1956)',
        'Lockheed Missiles abre planta en Sunnyvale (1956), aportando contratos militares',
      ],
    },
    {
      nombre: 'Revolución de los Semiconductores',
      desde: 1957,
      hasta: 1976,
      icono: '⚡',
      hitosDestacados: ['Los Ocho Traidores: Fairchild e Intel'],
      eventos: [
        'Los "ocho traidores" fundan Fairchild Semiconductor (1957): primer venture capital moderno',
        'Robert Noyce inventa el circuito integrado monolítico en Fairchild (1959)',
        'Gordon Moore publica la Ley de Moore: transistores se duplican cada dos años (1965)',
        'Robert Noyce y Gordon Moore fundan Intel con 2,5 millones de dólares (1968)',
        'Intel presenta el microprocesador 4004: 2.300 transistores en un chip (1971)',
        'Fairchild genera más de 130 spin-offs, multiplicando el ecosistema tecnológico',
      ],
    },
    {
      nombre: 'La Era del PC',
      desde: 1976,
      hasta: 1994,
      icono: '💻',
      hitosDestacados: ['Apple, Xerox PARC y la Era del PC'],
      eventos: [
        'Steve Jobs y Steve Wozniak fundan Apple Computer en un garaje de Los Altos (1976)',
        'Apple II (1977): primer PC de éxito masivo, 35.000 unidades en el primer año',
        'Bill Gates firma acuerdo con IBM para MS-DOS, sentando el duopolio Wintel (1981)',
        'Larry Ellison funda Oracle en Redwood Shores (1977): bases de datos relacionales',
        'Visita de Jobs a Xerox PARC inspira la interfaz gráfica del Macintosh (1979)',
        'Lanzamiento del Macintosh con el anuncio "1984" de Ridley Scott (enero 1984)',
        'Fundación de Sun Microsystems (1982) y Cisco Systems (1984)',
        'Apple supera los 1.000 millones de dólares en ventas anuales (1983)',
      ],
    },
    {
      nombre: 'Dot-com: Auge y Caída',
      desde: 1994,
      hasta: 2004,
      icono: '🌐',
      hitosDestacados: [
        'El Boom Dot-com: Internet se Comercializa',
        'El Estallido: Caída y Supervivientes',
      ],
      eventos: [
        'Marc Andreessen y Jim Clark fundan Netscape (1994); su OPV sin beneficios inaugura la era dot-com (1995)',
        'Amazon fundada por Jeff Bezos como librería online (Seattle, julio 1994)',
        'Yahoo!, Google y eBay fundados entre 1995 y 1998 en el entorno de Stanford',
        'NASDAQ pasa de 1.000 a 5.048 puntos entre 1995 y marzo 2000',
        'Webvan, Pets.com y Kozmo.com recaudan cientos de millones con modelos no viables',
        'El NASDAQ pierde el 78% de su valor entre marzo 2000 y octubre 2002',
        'Google lanza AdWords (2000): publicidad por clic, el modelo más rentable del internet',
        'OPV de Google: 1.670 millones de dólares (agosto 2004), validando la recuperación',
      ],
    },
    {
      nombre: 'Plataformas y Móvil',
      desde: 2004,
      hasta: 2018,
      icono: '📱',
      hitosDestacados: [
        'Google, Amazon Web y la Web 2.0',
        'El iPhone y la Revolución Móvil',
        'Las Big Five y el Dominio de las Plataformas',
      ],
      eventos: [
        'Amazon Web Services (AWS) lanzado como alquiler de infraestructura cloud (2006)',
        'Web 2.0: Wikipedia, YouTube, Facebook y la participación del usuario como creador de contenido',
        'Steve Jobs presenta el iPhone y "reinventa el teléfono" (9 enero 2007)',
        'App Store inaugura el marketplace de software para dispositivos de consumo masivo (2008)',
        'Airbnb, Uber, Instagram y WhatsApp nacen aprovechando el smartphone ubicuo (2008-2010)',
        'Apple supera a Microsoft en capitalización bursátil por primera vez (mayo 2010)',
        'Facebook adquiere Instagram (1.000 M$, 2012) y WhatsApp (19.000 M$, 2014)',
        'GAFAM acumula capitalización combinada superior a 5 billones de dólares (2019)',
      ],
    },
    {
      nombre: 'IA y Regulación',
      desde: 2018,
      hasta: 9999,
      icono: '🤖',
      hitosDestacados: [
        'La Irrupción de la IA Generativa',
        'Antimonopolio, DMA y el Futuro Incierto',
      ],
      eventos: [
        'OpenAI publica GPT-3: 175.000 millones de parámetros, texto indistinguible del humano (2020)',
        'ChatGPT alcanza 100 millones de usuarios en 2 meses (diciembre 2022-febrero 2023)',
        'Microsoft invierte 13.000 millones en OpenAI e integra IA en Bing y Office (2023)',
        'Nvidia supera el billón de capitalización por demanda de chips GPU para IA (junio 2023)',
        'Informe antimonopolio del Congreso EEUU sobre GAFAM: poder de monopolio confirmado (2020)',
        'Digital Markets Act de la UE designa 6 guardianes de acceso tecnológico (2023)',
        'Fallo DOJ vs. Google: monopolio ilegal en búsqueda confirmado por juez federal (agosto 2024)',
        'Debate sobre concentración en IA: OpenAI, Anthropic, Google DeepMind y dependencia de Nvidia',
      ],
    },
  ],

  categorias: {
    semiconductores: 'Semiconductores y hardware',
    startup: 'Startups y emprendimiento',
    internet: 'Era internet y dot-com',
    movil: 'Revolución móvil',
    plataformas: 'Grandes plataformas',
    regulacion: 'Regulación y gobernanza',
  },
  colores: {
    semiconductores: '#374151',
    startup: '#059669',
    internet: '#D97706',
    movil: '#1E3A8A',
    plataformas: '#7C3AED',
    regulacion: '#DC2626',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'Un tramo de 48 kilómetros a lo largo de la bahía sur de San Francisco —entre las ciudades de San José y Palo Alto— concentra más empresas tecnológicas valoradas en más de mil millones de dólares per cápita que cualquier otra región del planeta. El nombre "Silicon Valley" fue popularizado por el periodista Don Hoefler en 1971 en referencia al silicio de los semiconductores. Pero la geografía es solo el escenario: lo que distingue al Valle de los demás clusters tecnológicos del mundo es una combinación singular de factores que tardaron décadas en consolidarse. En primer lugar, la proximidad entre universidad e industria: Stanford y Berkeley formaron a los ingenieros que fundaron las empresas, prestaron sus instalaciones como incubadoras y permitieron a sus profesores y estudiantes licenciar tecnología y fundar spin-offs. En segundo lugar, el capital riesgo (venture capital): el modelo de financiar startups a cambio de participación accionarial, inventado aquí por Arthur Rock en 1957, permite que ideas sin activos físicos ni historial de ingresos accedan a capital que no exigiría el sistema bancario tradicional. En tercer lugar, la cultura de movilidad laboral: mientras en otros ecosistemas los contratos de no competencia limitaban la capacidad de los empleados para fundar competidores, California prohíbe estas cláusulas desde 1872, facilitando el efecto de ramificación (spin-off) que multiplicó Fairchild en 130 empresas y Xerox PARC en decenas de startups. En cuarto lugar, la acumulación de capital humano especializado: cada ciclo tecnológico (semiconductores, PC, internet, móvil, IA) atrajo a los mejores ingenieros del mundo, que al terminar sus ciclos laborales en las grandes empresas reinvertían su experiencia, su capital y sus redes en la siguiente generación de startups. El resultado es un ecosistema de retroalimentación positiva que se acelera a sí mismo con cada ciclo de innovación.',

    tablaComparativa: [
      {
        hito: 'Hewlett-Packard',
        periodo: '1939',
        categoria: 'Semiconductores y hardware',
        personaje: 'William Hewlett y David Packard',
        aportacion: 'Primer gran empresa tecnológica del Valle; osciladores de audio, impresoras, ordenadores. Mito fundacional del "garaje de Silicon Valley". Modelo de cultura corporativa (The HP Way) influyente durante décadas.',
      },
      {
        hito: 'Intel',
        periodo: '1968',
        categoria: 'Semiconductores y hardware',
        personaje: 'Robert Noyce y Gordon Moore',
        aportacion: 'Inventores del microprocesador comercial (4004, 1971). La Ley de Moore predijo la evolución de la industria durante 50 años. Dominaron el mercado de microprocesadores para PC durante 30 años con el duopolio Intel-Microsoft.',
      },
      {
        hito: 'Apple',
        periodo: '1976',
        categoria: 'Startups y emprendimiento',
        personaje: 'Steve Jobs y Steve Wozniak',
        aportacion: 'Democratización del ordenador personal (Apple II), popularización de la interfaz gráfica (Macintosh), reinvención del teléfono móvil (iPhone) y creación de la categoría de tablets (iPad). Empresa más valiosa del mundo múltiples veces.',
      },
      {
        hito: 'Google',
        periodo: '1998',
        categoria: 'Grandes plataformas',
        personaje: 'Larry Page y Sergey Brin',
        aportacion: 'Algoritmo PageRank redefinió la búsqueda web. AdWords creó el modelo de publicidad por clic más rentable de la historia. Android controla el 73% del mercado de smartphones globales. Capitalización superior a 2 billones de dólares (2024).',
      },
      {
        hito: 'Amazon',
        periodo: '1994',
        categoria: 'Grandes plataformas',
        personaje: 'Jeff Bezos',
        aportacion: 'Liderazgo en comercio electrónico global (38% del mercado EEUU). AWS creó la industria del cloud computing y opera el 31% de la infraestructura cloud mundial. La estrategia de reinversión total de beneficios durante 20 años generó una de las ventajas competitivas más duraderas de la historia empresarial.',
      },
      {
        hito: 'Meta',
        periodo: '2004',
        categoria: 'Grandes plataformas',
        personaje: 'Mark Zuckerberg',
        aportacion: 'Facebook, Instagram y WhatsApp reúnen más de 3.200 millones de usuarios activos mensuales. El modelo de negocio basado en publicidad dirigida por datos de comportamiento generó debates sobre privacidad y democracia. Adquisición de Instagram (2012) y WhatsApp (2014) consideradas las más rentables de la historia tecnológica.',
      },
    ],

    escenarios: [
      {
        icono: '💰',
        titulo: 'Cómo funciona el venture capital',
        perfil: 'Para quien quiera entender la financiación de startups',
        texto:
          'El venture capital (VC) es un tipo de financiación de capital privado dirigido a empresas en etapas tempranas con alto potencial de crecimiento. El mecanismo funciona así: un fondo de VC capta dinero de inversores institucionales (fondos de pensiones, universidades, family offices) y lo invierte en carteras de startups a cambio de participación accionarial, típicamente entre el 10% y el 30% por ronda. La lógica de cartera asume que la mayoría de las inversiones fracasarán o darán retornos modestos, pero una o dos "home runs" generarán retornos de 50x o 100x que compensan todas las pérdidas. Sequoia Capital invirtió 60.000 dólares en Google en 1999; cuando Google salió a bolsa en 2004 esa participación valía aproximadamente 4.500 millones. Una startup típica pasa por varias rondas: Semilla (seed, 500.000-2M$), Serie A (2-15M$), Serie B (15-50M$) y sucesivas hasta una salida mediante OPV en bolsa o adquisición por una empresa mayor. Cada ronda diluye a los fundadores, que conservan menos porcentaje pero de una empresa de mayor valor total. El VC es el sistema que permite que una idea con un producto mínimo viable y sin ingresos acceda a capital suficiente para crecer hasta demostrar su modelo de negocio. Sin él, empresas como Google, Facebook o Airbnb no habrían existido en su forma actual.',
      },
      {
        icono: '🔄',
        titulo: 'La cultura del fracaso como aprendizaje',
        perfil: 'Para entender la filosofía emprendedora del Valle',
        texto:
          'Una de las diferencias más estudiadas entre Silicon Valley y otros ecosistemas tecnológicos es la actitud hacia el fracaso empresarial. En muchas culturas empresariales, fundar una empresa que fracasa es una mancha curricular permanente. En Silicon Valley, es un requisito casi implícito para ser tomado en serio como fundador experimentado. La razón es estructural: los inversores de VC saben que la mayoría de sus inversiones fracasarán, por lo que valoran a fundadores que han "sobrevivido" a un fracaso porque tienen experiencia directa con los errores más costosos. Reid Hoffman, cofundador de LinkedIn, tiene una frase frecuentemente citada: "si no te avergüenzas de tu primera versión del producto, la has lanzado demasiado tarde". El concepto de "producto mínimo viable" (MVP), popularizado por Eric Ries en "The Lean Startup" (2011), institucionaliza esta filosofía: lanzar rápido, recoger datos reales de usuarios, iterar y pivotar si es necesario, en lugar de construir durante años en secreto el producto perfecto. Los fracasos documentados más instructivos de Silicon Valley —Webvan, Google Glass, Microsoft Zune, Apple Newton— son estudiados en cursos de MBA precisamente porque sus lecciones son más valiosas que los éxitos: enseñan qué hipótesis sobre el mercado resultaron incorrectas y por qué.',
      },
      {
        icono: '🎓',
        titulo: 'La relación universidad-industria',
        perfil: 'Para entender el modelo que otros países intentan replicar',
        texto:
          'El Stanford Research Park, creado por Frederick Terman en 1951, fue el primer intento institucional de aproximar la universidad a la industria tecnológica en un modelo que hoy se llama "transferencia de tecnología". El modelo funciona en varias capas: los estudiantes de posgrado pueden continuar trabajando en sus proyectos de tesis mientras se convierten en empresas; los profesores pueden licenciar su investigación a empresas o fundar spin-offs; la universidad invierte en startups de sus estudiantes a través de fondos propios; y las empresas tecnológicas contratan directamente en el campus, retroalimentando el flujo de talento y financiación. Stanford ha generado empresas cuyos ingresos combinados superan el PIB de varios países: Google, Yahoo!, Sun Microsystems, Cisco, LinkedIn, Instagram, Snapchat, entre otras. La universidad recibe participación accionarial en las startups de sus estudiantes, generando ingresos que financian más investigación. El modelo fue replicado con distinto éxito en el MIT (Cambridge), la Universidad de Cambridge (Reino Unido), el Technion (Israel) y el KTH (Suecia). La lección aprendida es que la proximidad física importa: los efectos de red entre investigadores, inversores y emprendedores se debilitan con la distancia.',
      },
      {
        icono: '🏙️',
        titulo: 'Concentración geográfica y desigualdad',
        perfil: 'Para entender los efectos secundarios del éxito tecnológico',
        texto:
          'Silicon Valley concentra riqueza a una escala sin precedentes históricos en una región metropolitana. En 2023, el condado de Santa Clara tenía el mayor número de personas con patrimonio neto superior a 100 millones de dólares por metro cuadrado del mundo. El precio medio de una vivienda en San José superaba los 1.400.000 dólares; el alquiler medio de un apartamento de una habitación en San Francisco era de aproximadamente 3.200 dólares mensuales. El coeficiente de Gini del área metropolitana de San José era superior al de países como Chile o México. La concentración de ingenieros con salarios de 200.000-400.000 dólares anuales en una región con oferta de vivienda limitada (restricciones de zonificación, terreno montañoso) generó una crisis de asequibilidad que desplazó a los trabajadores de ingresos medios y bajos —maestros, enfermeros, trabajadores de la construcción— a distancias de más de 100 kilómetros. El fenómeno de los "autobuses de Google" —grandes autocares que recogen a empleados tecnológicos en San Francisco para llevarlos a los campus corporativos en Silicon Valley— se convirtió en símbolo de la tensión entre la industria tecnológica y los residentes históricos de la ciudad. El debate sobre si las ciudades que albergan grandes clusters tecnológicos se benefician neta o negativamente de ellos sigue abierto: los ingresos fiscales aumentan, pero la gentrificación desplaza a las comunidades más vulnerables.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué Silicon Valley y no otra región?',
        respuesta:
          'No fue planificado: fue el resultado de la acumulación de ventajas que se reforzaron mutuamente durante décadas. La combinación de Stanford y Berkeley (capital humano), contratos militares de la Segunda Guerra Mundial y la Guerra Fría (financiación inicial), el modelo de venture capital inventado aquí (acceso a capital), la prohibición de cláusulas de no competencia en California (movilidad laboral) y el clima favorable para la calidad de vida (factor de atracción de talento global) creó un ecosistema que, una vez iniciado, se autoperpetúa. Cada ciclo tecnológico —semiconductores, PC, internet, móvil, IA— generó una nueva generación de emprendedores que reinvirtieron capital, experiencia y redes en el siguiente ciclo. La masa crítica hace que las nuevas startups prefieran ubicarse aquí porque aquí están los inversores, el talento y los primeros clientes.',
        tip: 'Las ciudades que intentan replicar el modelo (Tel Aviv, Berlín, Singapur, Barcelona) tienen éxito parcial pero ninguna ha igualado la escala: la ventaja acumulada de 80 años es difícil de comprimir.',
      },
      {
        pregunta: '¿Qué es el venture capital y cómo funciona?',
        respuesta:
          'El venture capital (VC) es financiación de capital privado para empresas en etapas tempranas con alto potencial de crecimiento. Un fondo de VC capta dinero de inversores institucionales y lo invierte en carteras de startups a cambio de participación accionarial (típicamente 10-30% por ronda). La lógica de cartera asume que pocas inversiones generarán retornos de 50-100x que compensen las pérdidas del resto. Las rondas típicas son: semilla (seed, 500.000-2M$), Serie A (2-15M$), Serie B (15-50M$). Cada ronda diluye a los fundadores pero aumenta el valor total. La salida se produce mediante OPV (salida a bolsa) o adquisición por una empresa mayor.',
        tip: 'El primer venture capital moderno fue la financiación de los "ocho traidores" para fundar Fairchild Semiconductor en 1957 por Arthur Rock. El modelo tardó décadas en formalizarse pero ya era VC en esencia.',
      },
      {
        pregunta: '¿Qué significa "unicornio" en el contexto de startups?',
        respuesta:
          'El término "unicornio" fue acuñado por la inversora Aileen Lee en 2013 para describir startups privadas (no cotizadas en bolsa) con una valoración superior a 1.000 millones de dólares. Cuando Lee publicó su análisis, existían 39 unicornios en el mundo; la rareza del fenómeno justificaba la metáfora de un animal mítico. En 2023, CB Insights contabilizaba más de 1.200 unicornios globales, lo que ha llevado a crear términos adicionales: "decacornio" (más de 10.000 millones) para empresas como SpaceX, Stripe o Databricks, y "hectocornio" (más de 100.000 millones) para las de mayor escala. La proliferación del término refleja tanto la abundancia de capital disponible para startups como el debate sobre si las valoraciones privadas reflejan valor real o expectativas no verificadas.',
      },
      {
        pregunta: '¿Cuánto cuesta vivir en Silicon Valley hoy?',
        respuesta:
          'En 2023-2024, el costo de vida en el área metropolitana de San José / San Francisco era uno de los más altos del mundo. El precio medio de una vivienda unifamiliar en el condado de Santa Clara superaba los 1.400.000 dólares. El alquiler medio de un apartamento de una habitación en San Francisco era de aproximadamente 3.200 dólares mensuales; en San José, alrededor de 2.600 dólares. Un salario de ingeniero de software en una empresa tecnológica grande (Google, Apple, Meta) oscilaba entre 200.000 y 400.000 dólares anuales en compensación total (salario + bonos + stock options), lo que hacía viable el coste de vida para ese perfil. Para trabajadores con salarios medios (maestros, enfermeros, trabajadores municipales), el área era prácticamente inaccesible sin trayectos de más de 90 minutos desde zonas más asequibles.',
        tip: 'El índice de miseria de vivienda (proporción de ingresos dedicada al alquiler) en San Francisco supera el 40% para familias de ingresos medios, el doble del umbral considerado "razonable" por economistas.',
      },
      {
        pregunta: '¿Puede replicarse el modelo de Silicon Valley en otros lugares?',
        respuesta:
          'Decenas de regiones han intentado crear su propio "Silicon Valley": Silicon Alley (Nueva York), Silicon Roundabout (Londres), Silicon Wadi (Israel), Silicon Sentier (París), Silicon Allee (Berlín). Algunos han logrado ecosistemas de innovación significativos —Tel Aviv es el que más se acerca en densidad de startups per cápita—, pero ninguno ha igualado la escala y la densidad de capital, talento y know-how del original. Los estudios académicos señalan que los factores más difíciles de replicar no son los más visibles (campus universitarios, fondos públicos de VC) sino los menos cuantificables: la cultura de tolerancia al fracaso, la fluidez de las redes informales de inversores y emprendedores, y la masa crítica que hace que el mejor talento global prefiera instalarse allí por encima de cualquier otra localización. La ventaja acumulada de 80 años es estructuralmente difícil de comprimir en el tiempo.',
      },
    ],

    pasos: [
      {
        titulo: 'Idea y cofundadores: el equipo lo es todo',
        cuerpo:
          'En Silicon Valley se dice que los inversores de VC invierten primero en el equipo, después en el mercado y por último en el producto. El primer paso de toda startup es reunir un equipo de cofundadores complementario: habitualmente un perfil técnico (CEO o CTO que puede construir el producto) y un perfil de negocio o distribución (que sabe vender y crear relaciones). La idea inicial importa menos de lo que se cree: la mayoría de las empresas exitosas de Silicon Valley pivotaron significativamente respecto a su idea original. YouTube empezó como sitio de citas con vídeo; Instagram como app de check-ins; Slack como herramienta interna de un videojuego fallido. Lo que no cambia es la calidad del equipo y su capacidad para aprender rápido.',
      },
      {
        titulo: 'Bootstrapping y seed funding: validar antes de escalar',
        cuerpo:
          'La fase inicial consiste en construir un producto mínimo viable (MVP) con recursos propios (bootstrapping) o con una ronda semilla (seed) de 250.000 a 2 millones de dólares de ángeles inversores o fondos seed especializados como Y Combinator (el acelerador más influyente del Valle, fundado en 2005). Y Combinator invierte 500.000 dólares a cambio del 7% de la empresa y ofrece mentoría intensiva de tres meses culminando en un "Demo Day" donde las startups presentan ante cientos de inversores. El objetivo de esta fase no es generar ingresos sino validar la hipótesis central del negocio: ¿hay usuarios que pagan (o usan) el producto de forma recurrente? La métrica clave no es el número de usuarios totales sino la retención: ¿siguen usando el producto al cabo de una semana, un mes, tres meses?',
      },
      {
        titulo: 'Series A/B/C: crecer con capital institucional',
        cuerpo:
          'Una vez validado el modelo de negocio con tracción demostrable, la startup accede a rondas de financiación más grandes de fondos de VC institucionales: Serie A (típicamente 5-15 millones), Serie B (20-50 millones) y sucesivas. Cada ronda diluye a los fundadores y primeros inversores, pero aumenta el valor total de la empresa. Los fondos de VC más reconocidos del Valle —Sequoia Capital, Andreessen Horowitz (a16z), Kleiner Perkins, Benchmark— no solo aportan capital sino acceso a redes de clientes, potenciales empleados y futuras rondas. La valoración en cada ronda se negocia entre el emprendedor y el inversor basándose en métricas de crecimiento, tamaño de mercado y múltiplos de empresas comparables cotizadas. En períodos de tipos de interés bajos (2010-2021), las valoraciones alcanzaron múltiplos de 20-100x de ingresos.',
      },
      {
        titulo: 'OPV o adquisición: la salida del inversor',
        cuerpo:
          'El ciclo de VC culmina con una "salida" (exit) que permite a los inversores y fundadores liquidar parte o toda su participación. Las dos modalidades principales son la OPV (oferta pública de venta, salida a bolsa) y la adquisición estratégica por una empresa mayor. La OPV transforma la startup en empresa cotizada, con las obligaciones de transparencia y gobierno corporativo que ello implica. La adquisición es más rápida y predecible: el adquirente paga una prima sobre la valoración actual a cambio del control total. Las adquisiciones más rentables de la historia —Instagram por 1.000M$ (2012) o WhatsApp por 19.000M$ (2014), ambas por Facebook— validaron la estrategia de vender antes de la OPV si la oferta es suficientemente generosa. Los fundadores que rechazan adquisiciones y optan por la OPV asumen el riesgo de mercados bursátiles adversos pero retienen el control a largo plazo.',
      },
      {
        titulo: 'Salida y reinversión: el ciclo que alimenta el ecosistema',
        cuerpo:
          'Lo que diferencia Silicon Valley de otros ecosistemas es lo que ocurre después de la salida. Los fundadores y primeros empleados que se enriquecen con una OPV o adquisición exitosa reinvierten capital, tiempo y redes en la siguiente generación de startups: como inversores ángel, como asesores o como cofundadores de nuevas empresas. Elon Musk usó los 180 millones que obtuvo de vender PayPal a eBay en 2002 para cofundar SpaceX y Tesla simultáneamente. Reid Hoffman cofundó LinkedIn y luego se convirtió en socio de Greylock Partners. Peter Thiel cofundó PayPal, luego Palantir, luego Founders Fund. Esta retroalimentación entre éxito, reinversión y nueva creación empresarial es el mecanismo de reproducción del ecosistema: cada ciclo genera los inversores, mentores y cofundadores del ciclo siguiente.',
      },
    ],

    tips: [
      {
        icono: '🎯',
        texto:
          'El producto mínimo viable (MVP) no es una versión barata del producto final: es el experimento más pequeño que permite validar la hipótesis central del negocio. Dropbox lanzó como MVP un vídeo de demostración de 3 minutos antes de escribir una sola línea de código; las 75.000 inscripciones en la lista de espera validaron la demanda antes de construir el producto.',
      },
      {
        icono: '🤝',
        texto:
          'En Silicon Valley, el networking no es un actividad de ocio sino una práctica profesional sistemática. La inversión de tiempo en construir relaciones con inversores, potenciales cofundadores y mentores antes de necesitarlos es considerada parte del trabajo de cualquier emprendedor. Los introvertores con ventaja tecnológica pueden compensar con plataformas de contacto (LinkedIn, AngelList) y aceleradoras que proporcionan el acceso estructurado a redes.',
      },
      {
        icono: '📊',
        texto:
          'Las stock options y el equity son la moneda de compensación de Silicon Valley. Un ingeniero que acepta 30.000 dólares menos de salario base a cambio de opciones sobre el 0,5% de una startup valorada en 10 millones ha hecho potencialmente la mejor decisión financiera de su vida si la empresa crece a 500 millones. El precio de ejercicio (strike price), el calendario de adquisición (vesting, típicamente 4 años con cliff de 1 año) y la preferencia de liquidación de los inversores son los conceptos clave para entender si un paquete de opciones tiene valor real.',
      },
      {
        icono: '📝',
        texto:
          'Un term sheet de inversión contiene cláusulas que pueden determinar si los fundadores conservarán o no el control de su empresa en un escenario de éxito moderado. Las más importantes son: la preferencia de liquidación (si los inversores cobran antes que los fundadores en una venta), las provisiones antidilución (que protegen a los inversores de futuras rondas a menor valoración), el drag-along (que puede obligar a los fundadores a vender si la mayoría de inversores quiere hacerlo) y el pro-rata right (que permite a los inversores mantener su porcentaje en rondas futuras). Revisar un term sheet con un abogado especializado en VC antes de firmarlo es estándar en el Valle.',
      },
    ],

    errores: [
      {
        titulo: '"Silicon Valley es solo tecnología de software e internet"',
        cuerpo:
          'El Valle incluye también biotecnología y ciencias de la vida (Genentech, fundada en South San Francisco en 1976, fue la primera empresa de biotech moderna), cleantech y energías renovables (SunPower, SolarEdge), semiconductores (Intel, AMD, Nvidia, Applied Materials), hardware (Apple, Cisco) y vehículos eléctricos y espacio (Tesla en Palo Alto hasta 2021, SpaceX en Hawthorne). La etiqueta "Silicon Valley" funciona también como metonimia de "ecosistema de startups de alto crecimiento financiadas por VC", que incluye todas estas categorías. Los "spillovers" tecnológicos entre sectores —por ejemplo, las técnicas de compresión de datos desarrolladas para vídeo que luego se aplican en medicina de imagen— son tan importantes como los sectores individuales.',
      },
      {
        titulo: '"Cualquier startup puede convertirse en unicornio si trabaja suficiente"',
        cuerpo:
          'Los datos son contundentes en sentido contrario. De cada 1.000 startups financiadas con VC, aproximadamente 600-700 fracasan completamente, 200-300 devuelven el capital invertido con retornos modestos y 1-3 generan los retornos excepcionales que hacen rentable el fondo. La tasa de éxito a escala de unicornio (más de 1.000 millones de valoración) es inferior al 0,1% de las empresas que reciben financiación VC. El éxito extraordinario requiere la combinación de equipo excepcional, mercado con viento de cola, timing correcto y, en una medida no despreciable, suerte. Los fundadores de las startups más exitosas suelen reconocer con candor la importancia del timing y la fortuna en su trayectoria.',
      },
      {
        titulo: '"Los fundadores exitosos son siempre jóvenes de 20 años que abandonaron la universidad"',
        cuerpo:
          'La narrativa del fundador joven (Jobs, Gates, Zuckerberg) oscurece los datos estadísticos reales. Un estudio del MIT Sloan Management Review y el National Bureau of Economic Research (2018) analizó más de 2,7 millones de fundadores de nuevas empresas en EEUU y encontró que la edad media del fundador de una startup de alto crecimiento era de 45 años. Los fundadores mayores tienen sistemáticamente mayores tasas de éxito: tienen más experiencia de dominio, más redes de contactos, más capital propio para invertir y mejor comprensión de las dinámicas de mercado. Los casos mediáticos de fundadores jóvenes son estadísticamente excepcionales, no representativos.',
      },
      {
        titulo: '"El capital riesgo financia ideas innovadoras sin importar la tracción"',
        cuerpo:
          'En la práctica, los fondos de VC institucionales (Series A en adelante) financian equipos con tracción demostrada, no ideas abstractas. "Tracción" significa métricas reales verificables: usuarios activos mensuales, ingresos recurrentes, tasa de crecimiento semana-sobre-semana, retención. El acceso a financiación semilla para ideas sin producto puede existir a través de aceleradoras como Y Combinator, pero incluso ellas prefieren equipos con un prototipo funcional o primeros usuarios. La excepción histórica fue la burbuja dot-com (1995-2000), donde el ambiente de exuberancia irracional redujo temporalmente el umbral de evidencia requerida. Ese período fue precisamente el que terminó en colapso, reforzando la importancia de los fundamentos de negocio.',
      },
    ],
  },
};
