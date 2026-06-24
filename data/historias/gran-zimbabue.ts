import type { HistoriaData } from './types';

export const granZimbabue: HistoriaData = {
  slug: 'gran-zimbabue',
  titulo: 'Gran Zimbabue y la Costa Swahili: el África Austral y Oriental Precolonial',
  subtitulo: 'Oro, piedra y monzones: las redes comerciales del océano Índico que conectaron el interior africano con Asia (s. VIII–XIX)',
  descripcionSEO: 'Cronología interactiva del África austral y oriental precolonial: del nacimiento de la costa swahili (s. VIII) a Mapungubwe, Gran Zimbabue, el Reino de Mutapa, la llegada portuguesa (1498) y el imperio omaní de Zanzíbar. Oro, marfil, piedra y comercio del Índico en 10 hitos y 6 eras.',
  keywords: [
    'gran zimbabue costa swahili historia áfrica',
    'comercio océano índico oro marfil monzones',
    'kilwa zanzíbar mombasa mapungubwe reino mutapa',
    'arquitectura piedra shona granito gran recinto',
    'vasco da gama portugueses áfrica oriental 1498',
    'imperio omán zanzíbar trata esclavista índico clavo',
  ],
  anioInicio: 700,
  anioFin: 1900,

  hitos: [
    {
      id: 'nacimiento-costa-swahili',
      nombre: 'Nacimiento de la Costa Swahili',
      anioInicio: 700,
      anioFin: 1000,
      color: '#1E6091',
      categoria: 'costa-swahili',
      descripcion: 'A lo largo del litoral del África oriental —del actual Somalia a Mozambique— surgieron asentamientos mercantiles fundados por pueblos bantúes que comerciaban a través del océano Índico. El contacto regular con mercaderes árabes y persas, impulsado por el régimen de monzones, dio lugar a una cultura urbana propia: el mundo swahili. La lengua swahili nació como un idioma bantú con un importante préstamo léxico árabe, y el islam se difundió entre las élites mercantiles. No fue una colonización extranjera, sino una fusión cultural protagonizada por poblaciones africanas costeras.',
      obraIconica: 'Primeras mezquitas de piedra de coral y nacimiento de la lengua swahili',
      paises: ['Costa de África oriental', 'Kenia', 'Tanzania', 'Somalia', 'Mozambique'],
    },
    {
      id: 'auge-ciudades-mercantiles',
      nombre: 'Auge de las Ciudades-Estado Mercantiles',
      anioInicio: 1000,
      anioFin: 1200,
      color: '#1E6091',
      categoria: 'comercio',
      descripcion: 'Mogadiscio, Mombasa, Zanzíbar, Kilwa, Pate y Sofala se consolidaron como ciudades-estado independientes que canalizaban el comercio del Índico. Exportaban oro, marfil, hierro, pieles y personas esclavizadas hacia Arabia, Persia, la India y, a través de intermediarios, China; importaban porcelana china, cuentas de vidrio, telas de algodón indias y cerámica vidriada. El comercio dependía del ritmo de los monzones: los vientos del noreste traían a los mercaderes entre noviembre y marzo, y los del suroeste los devolvían entre abril y septiembre. Cada ciudad era gobernada por un sultán y vivía en competencia y comercio con las demás.',
      obraIconica: 'Red comercial monzónica del Índico: porcelana china en mercados africanos',
      paises: ['Kilwa', 'Mombasa', 'Zanzíbar', 'Mogadiscio', 'Sofala'],
    },
    {
      id: 'mapungubwe',
      nombre: 'Reino de Mapungubwe',
      anioInicio: 1075,
      anioFin: 1220,
      color: '#B8860B',
      categoria: 'reino',
      descripcion: 'En la confluencia de los ríos Limpopo y Shashe surgió el primer gran estado del interior austral. Mapungubwe desarrolló una sociedad jerarquizada en la que la élite vivía separada físicamente, en lo alto de una colina, mientras la población común habitaba la llanura: una de las primeras expresiones de estratificación social y poder centralizado al sur del Zambeze. Su riqueza provenía del oro y el marfil, que llegaban por rutas comerciales hasta la costa swahili. El famoso "rinoceronte de oro" hallado en una tumba real es testimonio de su sofisticación metalúrgica. Mapungubwe declinó hacia 1220, posiblemente por cambios climáticos, y su modelo de poder pasó al norte.',
      obraIconica: 'El rinoceronte de oro de Mapungubwe y la colina sagrada de la realeza',
      paises: ['Sudáfrica', 'Botsuana', 'Zimbabue', 'cuenca del Limpopo'],
    },
    {
      id: 'gran-zimbabue',
      nombre: 'Reino de Gran Zimbabue',
      anioInicio: 1220,
      anioFin: 1350,
      color: '#708090',
      categoria: 'arquitectura',
      descripcion: 'Heredero del poder de Mapungubwe, el Reino de Zimbabue construyó la mayor estructura de piedra del África subsahariana. La capital, Gran Zimbabue, fue levantada por pueblos shona sin mortero, encajando bloques de granito con extraordinaria precisión. El Gran Recinto, con su muro perimetral de unos 250 metros y once metros de altura, y la Acrópolis sobre la colina, albergaron a una élite gobernante y a una población que pudo alcanzar entre 10.000 y 18.000 personas. La ciudad controlaba el comercio del oro extraído de la meseta y lo enviaba a Sofala y Kilwa. La palabra "zimbabwe" significa "casas de piedra" en lengua shona.',
      obraIconica: 'El Gran Recinto y la Torre Cónica: arquitectura en piedra seca de granito',
      paises: ['Zimbabue', 'meseta de Zimbabue', 'cuenca del Zambeze'],
    },
    {
      id: 'apogeo-declive-zimbabue',
      nombre: 'Apogeo y Declive de Gran Zimbabue',
      anioInicio: 1350,
      anioFin: 1450,
      color: '#708090',
      categoria: 'declive',
      descripcion: 'En su apogeo, Gran Zimbabue fue el centro político y comercial de un reino que dominaba la red aurífera del África austral. La cerámica china y persa, las cuentas de vidrio y los objetos importados hallados en el yacimiento confirman su conexión con el Índico. Hacia mediados del siglo XV la ciudad fue abandonada de forma gradual. Las causas más aceptadas son el agotamiento de los recursos locales —tierras de pasto, agua, leña— ante una población concentrada, y el desplazamiento de las rutas comerciales del oro hacia el norte, hacia el valle del Zambeze. El abandono no fue un colapso violento, sino una reubicación del poder.',
      obraIconica: 'Abandono progresivo de la capital y desplazamiento del comercio al Zambeze',
      paises: ['Zimbabue', 'meseta central', 'valle del Zambeze'],
    },
    {
      id: 'reino-mutapa',
      nombre: 'Reino de Mutapa',
      anioInicio: 1430,
      anioFin: 1629,
      color: '#DAA520',
      categoria: 'reino',
      descripcion: 'Tras el declive de Gran Zimbabue, el poder aurífero pasó al Reino de Mutapa (o Monomotapa), fundado en el valle del Zambeze por gobernantes shona. Su soberano, el Mwene Mutapa, controlaba el comercio del oro y el marfil que descendía hacia la costa. Los mercaderes swahili instalaron mercados (feiras) en el interior. A partir de 1500, los portugueses llegaron al reino buscando las legendarias minas de oro y, con el tiempo, lo convirtieron en un estado dependiente mediante alianzas, misioneros y presión militar. El nombre "Monomotapa" llenó los mapas europeos de leyendas sobre un imperio del oro en el corazón de África.',
      obraIconica: 'El Mwene Mutapa y las feiras comerciales del valle del Zambeze',
      paises: ['Zimbabue', 'Mozambique', 'valle del Zambeze'],
    },
    {
      id: 'kilwa-cenit',
      nombre: 'Kilwa en su Cénit',
      anioInicio: 1300,
      anioFin: 1500,
      color: '#1E6091',
      categoria: 'comercio',
      descripcion: 'Kilwa Kisiwani, una isla frente a la actual Tanzania, se convirtió en la ciudad más rica y poderosa de la costa swahili al monopolizar la exportación del oro de Sofala. Acuñó su propia moneda y levantó edificios monumentales en piedra de coral: la Gran Mezquita, con sus cúpulas y bóvedas, y el Husuni Kubwa, un vasto palacio-almacén con más de cien estancias y una piscina. En 1331 el viajero marroquí Ibn Battuta la visitó y la describió como una de las ciudades más hermosas y bien construidas que había conocido. Kilwa simboliza la cumbre del urbanismo y la prosperidad swahili antes de la irrupción europea.',
      obraIconica: 'El palacio de Husuni Kubwa y la Gran Mezquita; Ibn Battuta visita Kilwa (1331)',
      paises: ['Kilwa', 'Tanzania', 'Sofala', 'costa swahili'],
    },
    {
      id: 'llegada-portuguesa',
      nombre: 'Llegada Portuguesa al Índico',
      anioInicio: 1498,
      anioFin: 1600,
      color: '#8B0000',
      categoria: 'contacto-europeo',
      descripcion: 'En 1498 Vasco da Gama dobló el cabo de Buena Esperanza y arribó a la costa swahili camino de la India, abriendo la ruta marítima europea hacia Asia. Portugal buscaba controlar el comercio de especias y oro del Índico y no dudó en usar la fuerza: bombardeó, saqueó y ocupó ciudades swahili como Kilwa, Mombasa y Sofala. La construcción del Fuerte Jesús en Mombasa (1593) consolidó su dominio militar. La irrupción portuguesa rompió el sistema comercial swahili centrado en el monzón, desvió rutas y empobreció ciudades antes florecientes, aunque nunca logró un control total del comercio interior.',
      obraIconica: 'Vasco da Gama llega a la costa swahili (1498) y el Fuerte Jesús de Mombasa (1593)',
      paises: ['Portugal', 'Mombasa', 'Kilwa', 'Sofala', 'costa swahili'],
    },
    {
      id: 'oman-zanzibar',
      nombre: 'Imperio de Omán y Zanzíbar',
      anioInicio: 1698,
      anioFin: 1856,
      color: '#4682B4',
      categoria: 'comercio',
      descripcion: 'En 1698 el sultanato de Omán expulsó a los portugueses de Mombasa y, durante el siglo XVIII, recuperó el control árabe del comercio en la costa oriental africana. En el siglo XIX, el sultán Said bin Sultan trasladó su capital a Zanzíbar (1840), que se convirtió en el centro de un próspero imperio comercial basado en el clavo de olor —cultivado en plantaciones—, el marfil y la trata de personas esclavizadas. Las caravanas penetraban hasta los Grandes Lagos. La trata esclavista del Índico, que afectó a cientos de miles de personas, fue un componente central y devastador de esta economía, hasta que la presión británica forzó su abolición progresiva a partir de 1873.',
      obraIconica: 'Said bin Sultan traslada la capital omaní a Zanzíbar (1840): clavo, marfil y trata',
      paises: ['Omán', 'Zanzíbar', 'Mombasa', 'Grandes Lagos', 'costa swahili'],
    },
    {
      id: 'legado',
      nombre: 'Legado y Reivindicación',
      anioInicio: 1871,
      anioFin: 1900,
      color: '#2E8B57',
      categoria: 'legado',
      descripcion: 'A finales del siglo XIX, exploradores y arqueólogos europeos "redescubrieron" las ruinas de Gran Zimbabue. Durante décadas, teorías coloniales racistas negaron que poblaciones africanas hubieran podido levantarlas, atribuyéndolas falsamente a fenicios, árabes o a la bíblica reina de Saba. La investigación arqueológica rigurosa —ya desde David Randall-MacIver (1905) y Gertrude Caton-Thompson (1929)— demostró sin lugar a dudas que fueron obra de pueblos shona bantúes. Tras la independencia en 1980, el país adoptó el nombre de Zimbabue en honor a las ruinas, y el ave tallada de jaboncillo hallada allí preside su bandera. El swahili es hoy lengua franca de buena parte de África oriental.',
      obraIconica: 'El "ave de Zimbabue" como símbolo nacional; refutación de las teorías coloniales',
      paises: ['Zimbabue', 'África oriental', 'África austral'],
    },
  ],

  eras: [
    {
      nombre: 'Génesis Swahili',
      desde: 700,
      hasta: 1000,
      icono: '🌊',
      hitosDestacados: ['Nacimiento de la Costa Swahili'],
      eventos: [
        'Asentamientos bantúes mercantiles surgen en el litoral del Índico (s. VIII)',
        'Contacto regular con mercaderes árabes y persas a través del monzón',
        'Nace la lengua swahili: base bantú con préstamo léxico árabe',
        'El islam se difunde entre las élites comerciales costeras',
      ],
    },
    {
      nombre: 'Auge del Comercio del Índico',
      desde: 1000,
      hasta: 1220,
      icono: '⛵',
      hitosDestacados: ['Auge de las Ciudades-Estado Mercantiles', 'Reino de Mapungubwe'],
      eventos: [
        'Mogadiscio, Mombasa, Zanzíbar y Kilwa se consolidan como ciudades-estado',
        'Exportación de oro y marfil, importación de porcelana china y telas indias',
        'Mapungubwe: primer gran estado del interior austral (1075)',
        'El "rinoceronte de oro" y la primera estratificación social al sur del Zambeze',
      ],
    },
    {
      nombre: 'Esplendor de la Piedra',
      desde: 1220,
      hasta: 1450,
      icono: '🪨',
      hitosDestacados: ['Reino de Gran Zimbabue', 'Apogeo y Declive de Gran Zimbabue'],
      eventos: [
        'Pueblos shona levantan Gran Zimbabue en piedra seca de granito (s. XIII)',
        'El Gran Recinto y la Acrópolis controlan el comercio del oro',
        'Población de la capital entre 10.000 y 18.000 habitantes',
        'Abandono gradual de la ciudad por agotamiento de recursos (s. XV)',
      ],
    },
    {
      nombre: 'Oro del Zambeze y Cénit Swahili',
      desde: 1300,
      hasta: 1498,
      icono: '🏆',
      hitosDestacados: ['Reino de Mutapa', 'Kilwa en su Cénit'],
      eventos: [
        'Kilwa monopoliza el oro de Sofala y acuña su propia moneda',
        'Ibn Battuta describe Kilwa como una de las ciudades más hermosas (1331)',
        'El palacio de Husuni Kubwa, cumbre del urbanismo swahili',
        'El Reino de Mutapa hereda el poder aurífero en el valle del Zambeze (s. XV)',
      ],
    },
    {
      nombre: 'Irrupción Portuguesa',
      desde: 1498,
      hasta: 1698,
      icono: '⚓',
      hitosDestacados: ['Llegada Portuguesa al Índico'],
      eventos: [
        'Vasco da Gama alcanza la costa swahili camino de la India (1498)',
        'Portugal bombardea y saquea Kilwa, Mombasa y Sofala',
        'Construcción del Fuerte Jesús en Mombasa (1593)',
        'El sistema comercial swahili del monzón se desarticula',
      ],
    },
    {
      nombre: 'Zanzíbar, Trata y Legado',
      desde: 1698,
      hasta: 1900,
      icono: '🌿',
      hitosDestacados: ['Imperio de Omán y Zanzíbar', 'Legado y Reivindicación'],
      eventos: [
        'Omán expulsa a los portugueses de Mombasa (1698)',
        'Said bin Sultan traslada la capital omaní a Zanzíbar (1840)',
        'Economía del clavo, el marfil y la trata esclavista del Índico',
        'La arqueología refuta las teorías coloniales sobre Gran Zimbabue (1905-1929)',
      ],
    },
  ],

  categorias: {
    'costa-swahili': 'Costa Swahili',
    comercio: 'Comercio del Índico',
    reino: 'Reinos del Interior',
    arquitectura: 'Arquitectura en Piedra',
    declive: 'Declive',
    'contacto-europeo': 'Contacto Europeo',
    legado: 'Legado',
  },

  colores: {
    'costa-swahili': '#1E6091',
    comercio: '#4682B4',
    reino: '#DAA520',
    arquitectura: '#708090',
    declive: '#B8860B',
    'contacto-europeo': '#8B0000',
    legado: '#2E8B57',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'Mucho antes de la colonización europea, el África austral y oriental albergó civilizaciones sofisticadas conectadas con medio mundo. Por el océano Índico, al ritmo de los monzones, fluían el oro de la meseta de Zimbabue, el marfil del interior, la porcelana china y las telas de la India. En la costa nacieron las ciudades-estado swahili —Kilwa, Zanzíbar, Mombasa— y en el interior se levantaron reinos como Mapungubwe, Gran Zimbabue y Mutapa, capaces de construir en piedra sin mortero la mayor estructura del África subsahariana. Esta cronología recorre mil doscientos años de redes comerciales, reinos del oro y herencia cultural, desmontando de paso uno de los mitos coloniales más persistentes: el que negaba que africanos hubieran construido Gran Zimbabue.',

    tablaComparativa: [
      { hito: 'Nacimiento de la Costa Swahili', periodo: 's. VIII-X', categoria: 'Costa Swahili', personaje: 'Pueblos bantúes costeros', aportacion: 'Cultura urbana mercantil y nacimiento de la lengua swahili' },
      { hito: 'Reino de Mapungubwe', periodo: '1075-1220', categoria: 'Reinos del Interior', personaje: 'Élite del Limpopo', aportacion: 'Primer estado jerarquizado del interior austral; oro y marfil' },
      { hito: 'Reino de Gran Zimbabue', periodo: '1220-1450', categoria: 'Arquitectura en Piedra', personaje: 'Pueblos shona', aportacion: 'Mayor estructura de piedra del África subsahariana; control del oro' },
      { hito: 'Kilwa en su Cénit', periodo: '1300-1500', categoria: 'Comercio del Índico', personaje: 'Sultanes de Kilwa / Ibn Battuta', aportacion: 'Monopolio del oro de Sofala, moneda propia, Husuni Kubwa' },
      { hito: 'Reino de Mutapa', periodo: '1430-1629', categoria: 'Reinos del Interior', personaje: 'El Mwene Mutapa', aportacion: 'Sucesor aurífero; las feiras del Zambeze y contacto portugués' },
      { hito: 'Imperio de Omán y Zanzíbar', periodo: '1698-1856', categoria: 'Comercio del Índico', personaje: 'Said bin Sultan', aportacion: 'Reconfiguración del comercio: clavo, marfil y trata esclavista' },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiantes de Historia de África',
        perfil: 'Secundaria, preparatoria y universidad',
        texto: 'Una panorámica del África precolonial que contradice la idea errónea de un continente "sin historia". Ideal para situar reinos, ciudades y redes comerciales que rara vez aparecen en los temarios escolares centrados en Europa.',
      },
      {
        icono: '⛵',
        titulo: 'Interesados en el comercio global',
        perfil: 'Historia económica y redes mundiales',
        texto: 'El océano Índico fue una autopista comercial siglos antes que el Atlántico. Esta cronología muestra cómo el oro africano, las especias asiáticas y la porcelana china se intercambiaban en un sistema integrado que dependía del régimen de monzones.',
      },
      {
        icono: '🏛️',
        titulo: 'Amantes de la arqueología y el patrimonio',
        perfil: 'Arquitectura y yacimientos',
        texto: 'De los muros de granito sin mortero de Gran Zimbabue a las mezquitas de coral de Kilwa, esta es una historia contada en piedra. Útil para entender técnicas constructivas africanas y la importancia de proteger su patrimonio.',
      },
      {
        icono: '🗺️',
        titulo: 'Curiosos de la historiografía',
        perfil: 'Mitos, sesgos y reconstrucción del pasado',
        texto: 'El caso de Gran Zimbabue es un ejemplo de manual sobre cómo el racismo colonial distorsionó la interpretación del pasado, y cómo la arqueología rigurosa lo corrigió. Una lección sobre quién cuenta la historia y con qué intereses.',
      },
    ],

    faq: [
      {
        pregunta: '¿Quién construyó Gran Zimbabue?',
        respuesta: 'Lo construyeron pueblos shona bantúes, ancestros de la población actual de Zimbabue, entre los siglos XIII y XV. Durante mucho tiempo, teorías coloniales racistas lo atribuyeron a fenicios, árabes o a la reina de Saba, negando la capacidad constructiva africana. La arqueología, desde Randall-MacIver (1905) y Caton-Thompson (1929), demostró de forma concluyente su origen africano local.',
        tip: 'La palabra "zimbabwe" significa "casas de piedra" en lengua shona, y dio nombre al país tras su independencia en 1980.',
      },
      {
        pregunta: '¿Qué era la costa swahili y de dónde viene su nombre?',
        respuesta: 'Era una cadena de ciudades-estado mercantiles del litoral oriental de África, fundadas por pueblos bantúes que comerciaban por el océano Índico. La cultura swahili surgió de la fusión de la base africana con influencias árabes y persas. La palabra "swahili" deriva del árabe "sawahil", que significa "costas". No fue una colonia extranjera, sino una civilización africana abierta al exterior.',
        tip: 'El swahili es hoy lengua oficial o franca en varios países de África oriental y una de las más habladas del continente.',
      },
      {
        pregunta: '¿Cómo funcionaba el comercio del océano Índico?',
        respuesta: 'Dependía de los monzones, vientos estacionales que se invierten dos veces al año. Los del noreste traían a los mercaderes desde Arabia, Persia e India entre noviembre y marzo; los del suroeste los devolvían entre abril y septiembre. Esto obligaba a los comerciantes a residir meses en los puertos africanos, intensificando los intercambios culturales. Se cambiaba oro, marfil y personas esclavizadas por porcelana, telas y cuentas de vidrio.',
        tip: 'La porcelana china hallada en yacimientos africanos prueba el alcance de estas rutas, que llegaban indirectamente hasta el lejano Oriente.',
      },
      {
        pregunta: '¿Qué relación hay entre Mapungubwe, Gran Zimbabue y Mutapa?',
        respuesta: 'Forman una secuencia de poder en el interior austral. Mapungubwe (1075-1220) fue el primer gran estado jerarquizado, basado en el oro. Cuando declinó, el poder pasó a Gran Zimbabue (1220-1450), que alcanzó su apogeo y luego fue abandonado. El Reino de Mutapa (s. XV-XVII) heredó después el control del comercio aurífero, ya en el valle del Zambeze, donde lo encontraron los portugueses.',
        tip: 'El traslado del poder de un centro a otro suele relacionarse con el agotamiento de recursos y el desplazamiento de las rutas del oro.',
      },
      {
        pregunta: '¿Qué cambió con la llegada de los portugueses en 1498?',
        respuesta: 'Vasco da Gama abrió la ruta marítima europea hacia Asia y Portugal intentó controlar por la fuerza el comercio del Índico. Bombardeó y saqueó ciudades swahili como Kilwa y Mombasa y construyó fortalezas como el Fuerte Jesús (1593). Esto desarticuló el sistema comercial swahili y empobreció a muchas ciudades, aunque Portugal nunca logró dominar plenamente el comercio del interior africano.',
        tip: 'En 1698 el sultanato de Omán expulsó a los portugueses de Mombasa y devolvió el control de la costa al mundo árabe-swahili.',
      },
    ],

    pasos: [
      {
        titulo: 'Distingue la costa del interior por los colores',
        cuerpo: 'Los azules representan la costa swahili y el comercio marítimo del Índico; los tonos dorados y ocres, los reinos del interior y su oro; el gris, la arquitectura de piedra de Gran Zimbabue. Antes de leer, identifica visualmente cómo se alternan el litoral y la meseta a lo largo de la línea.',
      },
      {
        titulo: 'Sigue la ruta del oro de dentro hacia fuera',
        cuerpo: 'Haz clic en "Reino de Gran Zimbabue" y luego en "Kilwa en su Cénit". El oro se extraía en la meseta del interior, bajaba a la costa por Sofala y se exportaba desde Kilwa al resto del Índico. Esa cadena conecta dos mundos —el interior y el mar— que solo cobran sentido juntos.',
      },
      {
        titulo: 'Observa el relevo de los reinos del interior',
        cuerpo: 'Compara Mapungubwe, Gran Zimbabue y Mutapa en la línea del tiempo. No son tres historias aisladas, sino un mismo poder aurífero que se desplaza geográficamente cuando se agotan los recursos o cambian las rutas. Identifica ese patrón de continuidad.',
      },
      {
        titulo: 'Usa la Comparativa para separar costa e interior',
        cuerpo: 'En la tabla Comparativa, filtra por "Comercio del Índico" para ver el mundo costero y luego por "Reinos del Interior" para ver la meseta. El contraste entre ambos grupos revela la doble naturaleza —marítima y continental— de esta historia.',
      },
      {
        titulo: 'Cierra con el Contexto Histórico y la reivindicación',
        cuerpo: 'Las 6 eras muestran el arco completo, desde la génesis swahili hasta el legado. Presta atención a la última era: la refutación arqueológica de las teorías coloniales sobre Gran Zimbabue es uno de los episodios historiográficos más importantes para entender el África precolonial.',
      },
    ],

    tips: [
      {
        icono: '🪨',
        texto: 'Los muros de Gran Zimbabue se levantaron sin mortero: bloques de granito tallados y encajados con tal precisión que llevan en pie más de seis siglos. El muro del Gran Recinto mide unos 250 metros de longitud y hasta 11 de altura.',
      },
      {
        icono: '🌬️',
        texto: 'El comercio del Índico no se entiende sin los monzones. Estos vientos estacionales, que se invierten dos veces al año, marcaban el calendario de la navegación y obligaban a los mercaderes a pasar meses en los puertos africanos, mezclando lenguas y culturas.',
      },
      {
        icono: '🏛️',
        texto: 'En 1331 el viajero Ibn Battuta describió Kilwa como una de las ciudades más bellas y mejor construidas que había visto, con palacios de varias plantas en piedra de coral. Era una de las urbes más prósperas del África de su tiempo.',
      },
      {
        icono: '🦅',
        texto: 'El "ave de Zimbabue", una figura tallada en jaboncillo hallada en las ruinas, es hoy el emblema nacional y aparece en la bandera del país. El Estado moderno tomó su nombre del yacimiento como acto de reivindicación de su pasado africano.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que el África precolonial no tuvo grandes estados',
        cuerpo: 'Es un mito persistente. El África austral y oriental albergó reinos centralizados, ciudades comerciales con moneda propia y arquitectura monumental siglos antes de la llegada europea. Mapungubwe, Gran Zimbabue, Mutapa y las ciudades swahili son prueba de sociedades complejas, jerarquizadas y conectadas con el comercio mundial.',
      },
      {
        titulo: 'Atribuir Gran Zimbabue a constructores no africanos',
        cuerpo: 'Durante la época colonial se negó sistemáticamente que africanos hubieran podido construir Gran Zimbabue, atribuyéndolo a fenicios, árabes o a la reina de Saba. Era una distorsión con motivación racista y política. La arqueología demostró sin ambigüedad que fue obra de pueblos shona bantúes, ancestros de la población local.',
      },
      {
        titulo: 'Ver la costa swahili como una colonia árabe',
        cuerpo: 'La cultura swahili no fue impuesta desde fuera: nació de poblaciones bantúes africanas que adoptaron e integraron elementos árabes y persas a través del comercio y el islam. Su lengua es bantú con préstamos árabes, y sus ciudades fueron gobernadas por dinastías locales, no por potencias extranjeras.',
      },
      {
        titulo: 'Romantizar o ignorar la trata esclavista del Índico',
        cuerpo: 'La trata de personas esclavizadas fue un componente real y devastador del comercio del Índico, tanto en su fase swahili como, sobre todo, durante el imperio de Zanzíbar en el siglo XIX, cuando afectó a cientos de miles de personas. No debe omitirse al hablar de la prosperidad comercial ni presentarse como un intercambio neutral más.',
      },
    ],
  },
};
