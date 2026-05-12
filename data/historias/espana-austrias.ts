import type { HistoriaData } from './types';

export const espanaAustrias: HistoriaData = {
  slug: 'espana-austrias',
  titulo: 'La España de los Austrias: Del Imperio Universal al Ocaso',
  subtitulo:
    'Dos siglos de hegemonía mundial, el Siglo de Oro, la Inquisición y la lenta decadencia del mayor imperio de la historia',
  descripcionSEO:
    'Cronología interactiva de la España de los Austrias (1516-1700): Carlos I y V, Felipe II, la Armada Invencible, el Siglo de Oro de Cervantes y Velázquez, la Inquisición, la Guerra de los Treinta Años, la pérdida de Portugal y el fin de Carlos II El Hechizado en 10 hitos y 6 eras.',
  keywords: [
    'españa austrias cronología siglo xvi xvii',
    'carlos i v sacro imperio español hegemonía',
    'felipe ii escorial lepanto armada invencible',
    'siglo de oro cervantes quijote velázquez',
    'inquisición española contrarreforma expulsión moriscos',
    'decadencia austria carlos ii hechizado sucesión borbón',
  ],
  anioInicio: 1516,
  anioFin: 1700,

  hitos: [
    {
      id: 'carlos-i-v',
      nombre: 'Carlos I: El Monarca Universal',
      anioInicio: 1516,
      anioFin: 1556,
      color: '#8B0000',
      categoria: 'imperio',
      descripcion:
        'Carlos I de España, V de Alemania, hereda el mayor conjunto de territorios desde el Imperio Romano: España, Alemania, Países Bajos, Italia, las Indias americanas. Aplasta la revuelta de las Comunidades de Castilla (1521). El saco de Roma (1527). Guerras con Francia y el Turco. Abdica agotado en 1556.',
      obraIconica:
        'Retrato ecuestre de Carlos V — Tiziano, 1548. El monarca universal en la Batalla de Mühlberg',
      paises: ['España', 'Sacro Imperio', 'Italia', 'Países Bajos', 'México', 'Perú'],
    },
    {
      id: 'felipe-ii-apogeo',
      nombre: 'Felipe II: El Apogeo del Imperio',
      anioInicio: 1556,
      anioFin: 1588,
      color: '#A00000',
      categoria: 'imperio',
      descripcion:
        'Felipe II gobierna el mayor Imperio de la época desde El Escorial. Victoria de Lepanto (1571): derrota a los otomanos. Incorporación de Portugal (1580): controla todo el Atlántico. El rey más poderoso del mundo reina sobre 40 millones de súbditos. Felipe II: \'el rey Prudente\' que nunca sonría en sus retratos.',
      obraIconica:
        'El Escorial — 1584. El monasterio-palacio-mausoleo que simboliza el poder y la austeridad del Imperio español',
      paises: ['España', 'Portugal', 'Italia', 'Países Bajos', 'Filipinas', 'América'],
    },
    {
      id: 'armada-invencible',
      nombre: 'La Armada Invencible y el Inicio del Declive',
      anioInicio: 1588,
      anioFin: 1598,
      color: '#CC3300',
      categoria: 'declive',
      descripcion:
        'La Gran Armada (1588) fracasa ante la flota inglesa de Drake y las tormentas del Atlántico: 67 barcos perdidos. La leyenda de la \'invencibilidad\' española se rompe. Inglaterra emerge como potencia naval. Los Países Bajos en rebeldía permanente. Felipe II muere en 1598 dejando un Imperio ya en crisis financiera.',
      obraIconica:
        'Derrota de la Armada Invencible — agosto 1588. El momento en que la hegemonía española comienza a declinar',
      paises: ['España', 'Inglaterra', 'Países Bajos'],
    },
    {
      id: 'siglo-oro',
      nombre: 'El Siglo de Oro: La Cumbre Cultural de España',
      anioInicio: 1550,
      anioFin: 1660,
      color: '#FF8C00',
      categoria: 'cultura',
      descripcion:
        'El período de mayor esplendor cultural de España: Cervantes (\'El Quijote\', 1605), Lope de Vega, Quevedo, Calderón de la Barca en literatura. Velázquez, El Greco, Zurbarán, Murillo en pintura. Vitoria y Suárez en filosofía. La paradoja: el Siglo de Oro florece mientras el Imperio declina.',
      obraIconica:
        'Don Quijote de la Mancha — Cervantes, 1605. La primera novela moderna. El símbolo más universal de España',
      paises: ['España'],
    },
    {
      id: 'inquisicion-contrarreforma',
      nombre: 'La Inquisición y la Contrarreforma',
      anioInicio: 1478,
      anioFin: 1609,
      color: '#4527A0',
      categoria: 'religion',
      descripcion:
        'La Inquisición española, fundada en 1478, alcanza su apogeo bajo los Austrias. Expulsión de judíos (1492) y moriscos (1609). España lidera la Contrarreforma: Concilio de Trento, Compañía de Jesús (jesuitas), Teresa de Ávila y Juan de la Cruz en la mística española. La pureza de sangre como obsesión social.',
      obraIconica:
        'Auto de Fe en la Plaza Mayor — pintado por Francisco Rizi, 1683. El teatro del poder religioso en España',
      paises: ['España', 'Europa'],
    },
    {
      id: 'felipe-iii-validos',
      nombre: 'Felipe III y el Sistema de Validos',
      anioInicio: 1598,
      anioFin: 1621,
      color: '#5D4037',
      categoria: 'declive',
      descripcion:
        'Felipe III delega el poder en el Duque de Lerma, inaugurando el sistema de validos. Expulsión de los moriscos (1609): 300.000 personas expulsadas, ruina de la agricultura valenciana. Tregua de los Doce Años con los Países Bajos. La corrupción del valido es ya un síntoma de la degeneración institucional.',
      obraIconica:
        'Expulsión de los Moriscos — 1609. 300.000 personas expulsadas del país. El mayor exilio de la historia española hasta el siglo XX',
      paises: ['España', 'Países Bajos'],
    },
    {
      id: 'felipe-iv-olivares',
      nombre: 'Felipe IV y el Conde-Duque de Olivares',
      anioInicio: 1621,
      anioFin: 1643,
      color: '#C62828',
      categoria: 'declive',
      descripcion:
        'El Conde-Duque de Olivares intenta reformar el Imperio con la \'Unión de Armas\'. Las rebeliones simultáneas de Cataluña (\'Corpus de Sangre\', 1640) y Portugal (independencia 1640) demuestran el fracaso de la centralización. Guerra con Francia en el marco de la Guerra de los Treinta Años.',
      obraIconica:
        'Las Meninas — Velázquez, 1656. La obra maestra del Siglo de Oro pintada en el corazón de una corte en decadencia',
      paises: ['España', 'Cataluña', 'Portugal', 'Francia'],
    },
    {
      id: 'guerra-treinta-anos',
      nombre: 'La Guerra de los Treinta Años y Westfalia',
      anioInicio: 1618,
      anioFin: 1648,
      color: '#37474F',
      categoria: 'guerra',
      descripcion:
        'España interviene masivamente en la guerra de religión europea que destruye Alemania. El \'Camino Español\' lleva tercios de Italia a Flandes. La Paz de Westfalia (1648) supone el reconocimiento de la independencia de los Países Bajos y el fin de la hegemonía española en Europa.',
      obraIconica:
        'La Rendición de Breda — Velázquez, 1635. Los Tercios Españoles en su último momento de gloria antes de Westfalia',
      paises: ['España', 'Francia', 'Suecia', 'Países Bajos', 'Sacro Imperio'],
    },
    {
      id: 'independencia-portugal',
      nombre: 'La Pérdida de Portugal y las Rebeliones',
      anioInicio: 1640,
      anioFin: 1668,
      color: '#D32F2F',
      categoria: 'declive',
      descripcion:
        'Portugal se independiza en 1640 aprovechando la distracción española en Cataluña. Tras 28 años de guerra, España reconoce la independencia portuguesa en 1668. Cataluña, aplastada en 1652, vuelve a la Corona pero conserva sus fueros. El Imperio pierde cohesión irreversiblemente.',
      obraIconica:
        'Restauração portuguesa — 1 diciembre 1640. El Día de Portugal: fin de los 60 años de Unión Ibérica',
      paises: ['España', 'Portugal', 'Cataluña'],
    },
    {
      id: 'carlos-ii',
      nombre: 'Carlos II El Hechizado y el Fin de los Austrias',
      anioInicio: 1665,
      anioFin: 1700,
      color: '#263238',
      categoria: 'declive',
      descripcion:
        'Carlos II, último Austria español, nace con graves problemas de salud por la endogamia dinástica. Gobierna incapaz de producir herederos durante 35 años. Nobleza depredadora, finanzas en bancarrota, ejército en ruinas. El problema de la sucesión obsesiona a Europa. Muere en 1700 nombrando heredero al nieto de Luis XIV.',
      obraIconica:
        'Retrato de Carlos II — Juan Carreño de Miranda, ~1685. La cara de la decadencia austríaca: el cuerpo y el Imperio agotados',
      paises: ['España', 'Francia', 'Austria'],
    },
  ],

  eras: [
    {
      nombre: 'Carlos I y el Imperio Universal',
      desde: 1516,
      hasta: 1556,
      icono: '👑',
      hitosDestacados: ['Carlos I: El Monarca Universal'],
      eventos: [
        '1516: Carlos I hereda la Corona de España — el mayor Imperio desde Roma',
        '1519: Carlos es elegido Emperador del Sacro Imperio Romano Germánico',
        '1521: Conquista de México por Hernán Cortés — el Imperio se expande al Nuevo Mundo',
        '1521: Aplastamiento de las Comunidades de Castilla — fin de la autonomía castellana',
        '1527: Saco de Roma por las tropas imperiales — el Papa cae bajo el poder de Carlos',
        '1556: Abdicación de Carlos I — divide el Imperio entre su hijo Felipe y su hermano Fernando',
      ],
    },
    {
      nombre: 'Felipe II: El Apogeo',
      desde: 1556,
      hasta: 1598,
      icono: '⚜️',
      hitosDestacados: [
        'Felipe II: El Apogeo del Imperio',
        'La Armada Invencible y el Inicio del Declive',
      ],
      eventos: [
        '1561: Felipe II traslada la capital de Toledo a Madrid',
        '1571: Batalla de Lepanto — España detiene la expansión otomana en el Mediterráneo',
        '1580: Incorporación de Portugal — Felipe II controla todo el Atlántico',
        '1584: Finalización de El Escorial — símbolo del poder y austeridad austríaca',
        '1588: Derrota de la Armada Invencible — fin del dominio naval español',
        '1598: Muerte de Felipe II — hereda un Imperio ya en crisis financiera',
      ],
    },
    {
      nombre: 'Los Validos: Felipe III',
      desde: 1598,
      hasta: 1621,
      icono: '📜',
      hitosDestacados: ['Felipe III y el Sistema de Validos'],
      eventos: [
        '1598: Felipe III delega el gobierno en el Duque de Lerma',
        '1605: Cervantes publica El Quijote — primera novela moderna de la historia',
        '1609: Expulsión de los Moriscos — 300.000 personas exiliadas, ruina agrícola',
        '1609: Tregua de los Doce Años con los Países Bajos — pausa en la guerra de Flandes',
        '1614: El Greco pinta El entierro del señor de Orgaz — cima del manierismo español',
        '1621: Muerte de Felipe III — el duque de Lerma caído en desgracia por corrupción',
      ],
    },
    {
      nombre: 'Crisis Total: Felipe IV',
      desde: 1621,
      hasta: 1648,
      icono: '⚔️',
      hitosDestacados: [
        'Felipe IV y el Conde-Duque de Olivares',
        'La Guerra de los Treinta Años y Westfalia',
      ],
      eventos: [
        '1621: Felipe IV nombra al Conde-Duque de Olivares valido — el último gran intento reformador',
        '1625: Los Tercios Españoles toman Breda — último gran triunfo militar español (pintado por Velázquez)',
        '1635: Velázquez pinta La Rendición de Breda — el Siglo de Oro en pleno declive político',
        '1640: \'Corpus de Sangre\' en Cataluña y restauración portuguesa — rebeliones simultáneas',
        '1643: Derrota de Rocroi frente a Francia — fin de la hegemonía militar de los Tercios',
        '1648: Paz de Westfalia — España reconoce la independencia de los Países Bajos',
      ],
    },
    {
      nombre: 'El Declive: Westfalia y Posguerra',
      desde: 1648,
      hasta: 1665,
      icono: '🕊️',
      hitosDestacados: ['La Pérdida de Portugal y las Rebeliones'],
      eventos: [
        '1648: España reconoce la independencia de los Países Bajos tras 80 años de guerra',
        '1652: Cataluña vuelve a la Corona española — aplastada la rebelión, conserva sus fueros',
        '1656: Velázquez pinta Las Meninas — obra cumbre del arte universal',
        '1659: Paz de los Pirineos con Francia — España cede territorios y reconoce la hegemonía francesa',
        '1665: Muerte de Felipe IV — hereda un Imperio exhausto su hijo Carlos II con 4 años',
        '1668: Tratado de Lisboa — España reconoce definitivamente la independencia de Portugal',
      ],
    },
    {
      nombre: 'La Agonía: Carlos II',
      desde: 1665,
      hasta: 1700,
      icono: '💀',
      hitosDestacados: ['Carlos II El Hechizado y el Fin de los Austrias'],
      eventos: [
        '1665: Carlos II hereda el trono con 4 años — su madre Mariana de Austria actúa como regente',
        '1668: España reconoce la independencia de Portugal — el mayor fracaso diplomático austríaco',
        '1680: Gran Auto de Fe en la Plaza Mayor de Madrid — la Inquisición en su crepúsculo',
        '1685: Juan Carreño de Miranda pinta el retrato más conocido de Carlos II — símbolo de la decadencia',
        '1700: Muerte sin herederos de Carlos II — nombra sucesor a Felipe de Anjou, nieto de Luis XIV',
        '1700: Fin de la dinastía Habsburgo en España — comienza la Guerra de Sucesión española',
      ],
    },
  ],

  categorias: {
    imperio: 'Imperio y Hegemonía',
    cultura: 'Siglo de Oro Cultural',
    religion: 'Religión y Contrarreforma',
    declive: 'Decadencia y Crisis',
    guerra: 'Guerras Europeas',
  },

  colores: {
    imperio: '#8B0000',
    cultura: '#FF8C00',
    religion: '#4527A0',
    declive: '#C62828',
    guerra: '#37474F',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'Durante casi dos siglos, España fue la potencia dominante del mundo: el mayor Imperio de la historia hasta ese momento, el centro de la cultura occidental con Cervantes y Velázquez, y el proveedor de la plata americana que financió la economía europea. La paradoja del Siglo de Oro es que la mayor creación cultural española coincide exactamente con el período de mayor declive político y militar.',

    tablaComparativa: [
      {
        hito: 'Carlos I: El Monarca Universal',
        periodo: '1516-1556',
        categoria: 'Imperio y Hegemonía',
        personaje: 'Carlos I / V',
        aportacion: 'Máxima extensión territorial: primer Imperio en el que no se ponía el sol',
      },
      {
        hito: 'Felipe II: El Apogeo del Imperio',
        periodo: '1556-1598',
        categoria: 'Imperio y Hegemonía',
        personaje: 'Felipe II',
        aportacion: 'Lepanto, incorporación de Portugal, El Escorial: cima del poderío español',
      },
      {
        hito: 'Felipe III y el Sistema de Validos',
        periodo: '1598-1621',
        categoria: 'Decadencia y Crisis',
        personaje: 'Felipe III / Duque de Lerma',
        aportacion: 'Delegación del poder, expulsión de moriscos, inicio de la corrupción sistémica',
      },
      {
        hito: 'Felipe IV y el Conde-Duque de Olivares',
        periodo: '1621-1665',
        categoria: 'Decadencia y Crisis',
        personaje: 'Felipe IV / Olivares',
        aportacion: 'Rebeliones de Cataluña y Portugal, derrota de Rocroi, Westfalia',
      },
      {
        hito: 'El Siglo de Oro: La Cumbre Cultural de España',
        periodo: '1550-1660',
        categoria: 'Siglo de Oro Cultural',
        personaje: 'Cervantes / Velázquez / Lope de Vega',
        aportacion: 'El Quijote, Las Meninas, el teatro del Siglo de Oro: la gran paradoja cultural',
      },
      {
        hito: 'Carlos II El Hechizado y el Fin de los Austrias',
        periodo: '1665-1700',
        categoria: 'Decadencia y Crisis',
        personaje: 'Carlos II',
        aportacion: 'Fin de la dinastía Habsburgo, apertura a los Borbones, agonía del Imperio',
      },
    ],

    escenarios: [
      {
        icono: '🌍',
        titulo: '¿Por qué declinó el Imperio Español?',
        perfil: 'Estudiantes de historia, curiosos sobre geopolítica',
        texto:
          'El declive español fue multicausal: guerras permanentes que agotaron la hacienda real, la endogamia dinástica que debilitó la monarquía, la expulsión de judíos y moriscos (las clases productivas), la inflación de plata americana, la corrupción del sistema de validos y la emergencia de nuevas potencias como Francia, Inglaterra y los Países Bajos. No fue una catástrofe repentina sino un proceso de más de un siglo.',
      },
      {
        icono: '🎨',
        titulo: 'El Siglo de Oro: ¿por qué fue tan brillante si el Imperio se hundía?',
        perfil: 'Amantes de la literatura y el arte',
        texto:
          'La paradoja del Siglo de Oro es que la mayor creación artística española surge precisamente cuando el Imperio declina. El mecenazgo real (Felipe IV era un apasionado del arte), la riqueza acumulada, la confluencia de talentos en Madrid y la tensión entre la grandeza pasada y la decadencia presente crearon el caldo de cultivo perfecto. Cervantes escribió El Quijote desde la cárcel; Velázquez pintó Las Meninas en una corte en ruinas.',
      },
      {
        icono: '⚖️',
        titulo: 'La expulsión de moriscos y judíos: ¿suicidio económico?',
        perfil: 'Interesados en historia económica y social',
        texto:
          'La expulsión de los judíos en 1492 (200.000 personas) y de los moriscos en 1609 (300.000) eliminó a las clases artesanal, comerciante y agrícola más productivas de España. Valencia perdió un tercio de su población. Aragón vio arruinarse su agricultura de regadío. Los historiadores debaten si fue la causa del declive económico o solo un factor más, pero el impacto fue devastador y sus consecuencias duraron generaciones.',
      },
      {
        icono: '👑',
        titulo: 'Carlos V vs Felipe II: dos estilos de Imperio',
        perfil: 'Comparativa de liderazgo histórico',
        texto:
          'Carlos V fue un emperador itinerante: gobernó viajando por sus dominios, hablaba varios idiomas y se consideraba a sí mismo un rey universal cristiano. Felipe II nunca salió de España tras 1559 y gobernó desde el escritorio de El Escorial, procesando miles de documentos al día. Dos estilos opuestos: uno de presencia personal y otro de administración burocrática. Ambos tuvieron éxitos y fracasos que reflejan las posibilidades y los límites de cada modelo.',
      },
    ],

    faq: [
      {
        pregunta: '¿Cuándo empieza y termina el Siglo de Oro?',
        respuesta:
          'No hay fechas exactas. Convencionalmente se sitúa entre 1492 (Descubrimiento de América, unificación lingüística con la gramática de Nebrija) o 1516 (llegada de Carlos I) y 1681 (muerte de Calderón de la Barca). El período de máximo esplendor es 1580-1660: el Quijote (1605), Lope de Vega, Quevedo, Velázquez, Zurbarán, Murillo y Calderón coinciden en este lapso.',
        tip: 'La paradoja: el Siglo de Oro cultural coincide exactamente con el período de mayor declive político del Imperio.',
      },
      {
        pregunta: '¿Qué fue la Inquisición española?',
        respuesta:
          'Un tribunal eclesiástico fundado en 1478 por los Reyes Católicos, dependiente de la Corona (no del Papa), para perseguir la herejía y garantizar la pureza religiosa. Fue especialmente activa contra los conversos (judíos y musulmanes convertidos al cristianismo) sospechosos de practicar su fe en secreto. La "leyenda negra" ha exagerado sus víctimas: los historiadores actuales estiman entre 3.000 y 5.000 ejecuciones en 350 años de actividad, no los millones que la propaganda protestante proclamó.',
        tip: 'La Inquisición española fue menos sangrienta que los tribunales civiles de la época, pero su control social y cultural fue devastador para el pensamiento crítico.',
      },
      {
        pregunta: '¿Por qué fracasó la Armada Invencible?',
        respuesta:
          'Por una combinación de factores: el mal tiempo y las tormentas en el Atlántico Norte causaron más bajas que el combate; los cañones ingleses de mayor alcance impedían el abordaje que los españoles dominaban; el plan de coordinación con el ejército de Flandes nunca funcionó; y las naves españolas eran más pesadas y menos maniobrables en aguas del Canal. El nombre "Invencible" fue una ironía posterior: en España se llamó "La Grande y Felicísima Armada".',
        tip: 'Felipe II, al conocer el desastre, dijo: "La envié contra los ingleses, no contra las tormentas". Una frase de una serenidad notable ante el mayor fracaso militar de su reinado.',
      },
      {
        pregunta: '¿Cuántos territorios controlaba Felipe II?',
        respuesta:
          'Felipe II gobernaba la Península Ibérica completa (desde 1580), los Países Bajos españoles, Milán, Nápoles, Sicilia, Cerdeña, las Filipinas (que llevan su nombre), y el enorme Imperio americano desde México hasta Argentina, más las factorías portuguesas en África, India, Brasil y Asia. Se estimaba que gobernaba sobre 40 millones de súbditos, más del 20% de la población mundial de la época.',
        tip: 'La frase "El Imperio en el que nunca se pone el sol" se atribuye originalmente al poeta Fray Antonio de Guevara y fue popularizada para describir el Imperio de Carlos I, aunque es Felipe II quien lo llevó a su máxima extensión.',
      },
      {
        pregunta: '¿Por qué murió sin herederos Carlos II?',
        respuesta:
          'Por la endogamia extrema de la dinastía Habsburgo. Carlos II era hijo del tío con la sobrina: Felipe IV se casó con su sobrina Mariana de Austria. En las generaciones anteriores, los Habsburgo habían practicado matrimonios entre primos y tíos durante 200 años. Carlos nació con múltiples problemas físicos (mandíbula Habsburgo extrema que le impedía masticar bien, epilepsia, impotencia probable) y su coeficiente de endogamia fue 0,254, mayor que el de un hijo de hermanos. La biología cobró la factura de dos siglos de matrimonios dinásticos.',
        tip: 'Un estudio genético de 2009 demostró que el coeficiente de endogamia de Carlos II era comparable al de descendientes de hermanos. La Familia Real española es hoy el polo opuesto: Felipe VI es el primer rey que no lleva sangre Habsburgo en varios siglos.',
      },
    ],

    pasos: [
      {
        titulo: 'Los Austrias: la familia que gobernó medio mundo',
        cuerpo:
          'La dinastía Habsburgo llegó a España con Carlos I en 1516. Comprendidos como dinastía, los Austrias españoles son cuatro reyes: Carlos I, Felipe II, Felipe III, Felipe IV y Carlos II. Cada uno recibió un Imperio más debilitado que el anterior y lo dejó en peor estado. Identificar este patrón generacional es la clave para entender la historia de la España del siglo XVI y XVII.',
      },
      {
        titulo: 'La conquista de América y la plata americana',
        cuerpo:
          'Entre 1519 (México) y 1572 (sistema de galeones estabilizado), España construyó el primer Imperio transoceánico de la historia. La plata de Potosí (actual Bolivia) financió las guerras europeas pero también generó inflación devastadora y desincentivó la industria española. El historiador Earl Hamilton calculó que entre 1500 y 1650 llegaron a España 181 toneladas de oro y 16.000 de plata. Una riqueza que paradójicamente aceleró el declive.',
      },
      {
        titulo: 'El Siglo de Oro: arte y literatura en tiempos de decadencia',
        cuerpo:
          'Cervantes escribió El Quijote (1605-1615) en medio de la crisis. Velázquez pintó Las Meninas (1656) cuando España ya había perdido los Países Bajos. Lope de Vega, Quevedo y Calderón florecieron mientras el Imperio se desmoronaba. Explorar esta paradoja —la mayor creación cultural española en el momento de mayor decadencia política— es el punto de partida para entender la España moderna.',
      },
      {
        titulo: 'La Inquisición y la Contrarreforma: el precio de la pureza',
        cuerpo:
          'España fue el bastión de la Contrarreforma católica en Europa. Mientras Alemania se dividía entre protestantes y católicos, España eliminó el debate: la Inquisición garantizó la homogeneidad religiosa. El precio fue alto: los intelectuales españoles vivieron bajo sospecha permanente, los judíos y moriscos fueron expulsados, y el pensamiento crítico quedó limitado. La "pureza de sangre" se convirtió en una obsesión que paralizó la movilidad social.',
      },
      {
        titulo: 'La decadencia: de Westfalia (1648) a Carlos II (1700)',
        cuerpo:
          'La segunda mitad del siglo XVII fue el largo epílogo del Imperio. La Paz de Westfalia (1648) reconoció la derrota española en Europa. La independencia portuguesa (1668) cerró la Unión Ibérica. La Paz de los Pirineos (1659) consagró la hegemonía francesa. Carlos II gobernó durante 35 años un Imperio en descomposición, sin poder producir herederos. Su testamento nombrando sucesor al nieto de Luis XIV abrió la Guerra de Sucesión española y transformó para siempre el mapa de Europa.',
      },
    ],

    tips: [
      {
        icono: '🗺️',
        texto:
          'En el momento de máximo esplendor (Felipe II, 1580), España controlaba más del 10% de la superficie terrestre. Hoy controla menos del 1%. Esta comparación ayuda a visualizar la magnitud del Imperio y la profundidad de la caída.',
      },
      {
        icono: '📚',
        texto:
          'El Quijote (1605) fue la primera novela moderna. Fue traducida a más idiomas que cualquier otro libro excepto la Biblia. Cervantes la escribió parcialmente en la cárcel, arruinado económicamente. Su éxito comercial en vida fue modesto: murió pobre en 1616, el mismo año que Shakespeare.',
      },
      {
        icono: '💰',
        texto:
          'España recibió enormes cantidades de plata americana y aun así sufrió bancarrotas repetidas (1557, 1560, 1575, 1596, 1607, 1627, 1647). La razón: las guerras permanentes costaban más que todo lo que llegaba de América. Es el primer ejemplo documentado de una "maldición de los recursos naturales".',
      },
      {
        icono: '🎭',
        texto:
          'El teatro del Siglo de Oro (los "corrales de comedias") fue el equivalente del cine actual: entretenimiento masivo para todas las clases sociales. Lope de Vega escribió más de 1.500 obras de teatro (se conservan 400). El público de Madrid consumía teatro con la misma voracidad con que hoy consume series de streaming.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que el Imperio era solo militar',
        cuerpo:
          'El Imperio español fue también el primer sistema administrativo transoceánico de la historia, el mayor proyecto de evangelización jamás emprendido, y el contexto del mayor florecimiento cultural de la literatura y el arte europeo. Los Tercios fueron solo una parte, y no la más duradera, del legado español.',
      },
      {
        titulo: 'Creer que la Inquisición mató a millones',
        cuerpo:
          'La "leyenda negra" fue amplificada por la propaganda anglosajona y protestante, pero las críticas incluían también fuentes internas —Las Casas en el ámbito colonial, humanistas españoles en el metropolitano— y no pueden reducirse solo a propaganda exterior. Los historiadores actuales, con acceso a los archivos de la Inquisición, estiman entre 3.000 y 5.000 ejecuciones en 350 años de actividad. Fue cruel e instrumento de control social devastador para el pensamiento libre, aunque los tribunales civiles europeos de la época ejecutaban a muchas más personas.',
      },
      {
        titulo: 'Creer que el Siglo de Oro fue solo literatura',
        cuerpo:
          'El Siglo de Oro fue también el período de mayor esplendor de la pintura española: Velázquez, El Greco, Zurbarán, Murillo y Ribera son figuras de primer nivel europeo. Y en filosofía: Francisco de Vitoria y Francisco Suárez fundaron el derecho internacional moderno. La Escuela de Salamanca desarrolló conceptos económicos que anticiparon a Adam Smith en dos siglos.',
      },
      {
        titulo: 'Creer que Carlos II era un idiota',
        cuerpo:
          'Carlos II era víctima de la endogamia extrema de la dinastía Habsburgo, no de su inteligencia. Gobernó durante 35 años en condiciones de salud muy difíciles. Sus problemas físicos (malformaciones óseas, posible impotencia, epilepsia) no eran signo de incapacidad mental sino consecuencias documentadas de la consanguinidad. Fue el precio biológico que pagó por dos siglos de matrimonios dinásticos entre primos y tíos.',
      },
    ],
  },
};
