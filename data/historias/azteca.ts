import type { HistoriaData } from './types';

export const azteca: HistoriaData = {
  slug: 'azteca',
  titulo: 'Historia de los Aztecas: De Aztlán a la Caída de Tenochtitlan',
  subtitulo:
    'Del pueblo errante que encontró una señal en el lago hasta la mayor ciudad del hemisferio occidental: tres siglos de ascenso mexica',
  descripcionSEO:
    'Cronología interactiva del Imperio Azteca (Mexica): desde la migración desde Aztlán (1200) hasta la caída de Tenochtitlan (1521). Fundación de la ciudad, la Triple Alianza, el apogeo bajo Moctezuma II, la cultura y el Templo Mayor en 10 hitos y 6 eras.',
  keywords: [
    'historia azteca mexica cronología',
    'Tenochtitlan fundación Triple Alianza',
    'Moctezuma II Imperio Azteca apogeo',
    'caída Tenochtitlan conquista española Cortés',
    'Templo Mayor Huitzilopochtli Tláloc',
    'chinampas lago Texcoco México prehispánico',
    'Tlacaelel Itzcoatl expansión mexica',
    'Cuauhtémoc Noche Triste conquista 1521',
  ],
  anioInicio: 1200,
  anioFin: 1521,

  hitos: [
    {
      id: 'migracion-aztlan',
      nombre: 'La Migración desde Aztlán',
      anioInicio: 1200,
      anioFin: 1325,
      color: '#8B4513',
      categoria: 'migracion',
      descripcion:
        'Los mexicas (aztecas) se autodenominaban el pueblo del sol y afirmaban venir de Aztlán, una isla mítica del norte. Su dios tutelar, Huitzilopochtli, les había encomendado una misión: caminar hacia el sur hasta encontrar una señal —un águila devorando una serpiente sobre un nopal— como lugar para construir su ciudad definitiva. Durante más de un siglo (aproximadamente 1200-1325), los mexicas peregrinaron por el altiplano mexicano como grupo nómada relativamente modesto, sin territorio propio, a menudo sirviendo como mercenarios o vasallos de potencias más establecidas como Azcapotzalco. Su fama de guerreros feroces y sacrificadores rituales les ganaba acomodo temporal pero también expulsiones. Pasaron por Tula (ciudad tolteca abandonada, que saquearon para sus mitos de legitimidad), por Coatepec, por Chapultepec. En cada parada dejaban evidencia arqueológica de una cultura ya formada. El largo peregrinaje no fue solo geográfico: fue el proceso de formación de una identidad cohesionada, de forja de la conciencia colectiva mexica como pueblo con un destino especial. Los Anales de Tlatelolco y el Códice Boturini narran este peregrinaje fundacional con detalle.',
      obraIconica:
        'Códice Boturini (Tira de la Peregrinación) — el relato pictográfico del viaje desde Aztlán (siglo XVI)',
      paises: ['México (norte y centro)'],
    },
    {
      id: 'fundacion-tenochtitlan',
      nombre: 'Fundación de Tenochtitlan',
      anioInicio: 1325,
      anioFin: 1375,
      color: '#DAA520',
      categoria: 'fundacion',
      descripcion:
        'En 1325 (o 1345 según otras fuentes), los mexicas encontraron la señal divina en una pequeña isla del lago Texcoco, en el Valle de México: un águila parada sobre un nopal devorando una serpiente. Allí fundaron Tenochtitlan ("lugar del nopal en la roca"), que se convertiría en la mayor ciudad del hemisferio occidental en menos de dos siglos. La elección de una isla pantanosa fue, en apariencia, una imposición (los mejores tierras ya tenían dueño), pero resultó ser una ventaja estratégica extraordinaria. Los mexicas desarrollaron las chinampas: islotes artificiales construidos mediante capas de vegetación acuática, sedimento lacustre y tierra, rodeados por canales. Este sistema de "jardines flotantes" producía hasta 7 cosechas anuales de maíz y verduras, convirtiendo el lago en el sistema agrícola más productivo de Mesoamérica. La ciudad creció sobre un sistema de cuadrículas cruzadas por canales, con calzadas principales (norte, sur y oeste) que la conectaban con tierra firme. Comenzaron como vasallos del reino de Azcapotzalco, pagando tributo y proporcionando guerreros, mientras construían las bases de su futura autonomía.',
      obraIconica:
        'Escudo nacional de México — el águila sobre el nopal con la serpiente, símbolo de la fundación de Tenochtitlan',
      paises: ['México (Valle de México)'],
    },
    {
      id: 'triple-alianza',
      nombre: 'La Triple Alianza y el Nacimiento del Imperio',
      anioInicio: 1428,
      anioFin: 1440,
      color: '#DC143C',
      categoria: 'expansion',
      descripcion:
        'El evento que transformó a los mexicas de vasallos a potencia fue la formación de la Triple Alianza en 1428. El rey mexica Itzcoatl, junto con el inteligente consejero Tlacaelel (quien reformó la cosmología y la historia mexica) y el reino aliado de Texcoco (bajo el poeta-rey Nezahualcoyotl) y Tlacopan, derrotaron al hasta entonces dominante señorío de Azcapotzalco. La victoria fue total: Azcapotzalco fue destruida y sus líderes sacrificados. Tlacaelel convenció a Itzcoatl de quemar los libros históricos anteriores y reescribir la historia mexica como el relato de un pueblo elegido por los dioses para mantener al sol en movimiento mediante el sacrificio de sangre humana. Esta reescritura mitológica-política fue uno de los grandes ejercicios de propaganda ideológica del mundo antiguo. La Triple Alianza dividió el control del sistema tributario entre las tres ciudades (Tenochtitlan recibía el 40%, Texcoco el 40%, Tlacopan el 20%) y estableció el modelo de expansión imperial: ciudades conquistadas mantenían sus gobernantes y culturas pero pagaban tributo regular. Itzcoatl y Tlacaelel pusieron en marcha una maquinaria imperial sin precedentes en Mesoamérica.',
      obraIconica:
        'Lápida de Itzcoatl — representación del cuarto tlatoani mexica, artífice de la Triple Alianza (museo MNA)',
      paises: ['México (Valle de México, Morelos, sur del altiplano)'],
    },
    {
      id: 'expansion-moctezuma-i',
      nombre: 'La Gran Expansión: Moctezuma I y Tlacaelel',
      anioInicio: 1440,
      anioFin: 1469,
      color: '#DC143C',
      categoria: 'expansion',
      descripcion:
        'Bajo Moctezuma I Ilhuicamina (1440-1469) y el continuado asesoramiento de Tlacaelel, el Imperio Mexica se expandió de forma espectacular. Las campañas militares llegaron a la Costa del Golfo (Veracruz, Oaxaca), al sur hasta los pueblos mixtecos y zapotecos, y al este hasta la zona de los totonacas. El tributo que llegaba a Tenochtitlan en estos años transformó la ciudad: se levantó el primer Templo Mayor monumental, se construyeron nuevos palacios y mercados, y la población creció exponencialmente. Moctezuma I también institucionalizó las "Guerras Floridas" (xochiyaoyotl): conflictos rituales con estados vecinos (especialmente los tlaxcaltecas) diseñados no para conquistar sino para capturar prisioneros destinados al sacrificio. Esta institución tuvo consecuencias geopolíticas inesperadas: los tlaxcaltecas, nunca sometidos, acumularon un resentimiento que décadas después los llevaría a aliarse con Hernán Cortés contra el Imperio Mexica. La figura de Tlacaelel —consejero durante cuatro reinados, nunca tlatoani— es uno de los grandes arquitectos ideológicos de la historia de Mesoamérica.',
      obraIconica:
        'Templo Mayor de Tenochtitlan (primera reconstrucción monumental, c. 1440) — corazón ritual del Imperio',
      paises: ['México (altiplano, Costa del Golfo, Oaxaca, Puebla)'],
    },
    {
      id: 'tenochtitlan-ciudad',
      nombre: 'Tenochtitlan: La Ciudad Más Grande del Hemisferio',
      anioInicio: 1400,
      anioFin: 1521,
      color: '#1E90FF',
      categoria: 'ciudad',
      descripcion:
        'En su apogeo (c. 1500-1519), Tenochtitlan era la mayor ciudad del hemisferio occidental, con 200.000-300.000 habitantes —más que Sevilla, Lisboa, Roma o París en la misma época. La ciudad ocupaba aproximadamente 13 km² en la isla y las zonas ganadas al lago, conectada con tierra firme por tres grandes calzadas (norte hacia Tepeyac, sur hacia Iztapalapa, oeste hacia Tlacopan) que podían romperse en caso de ataque. Un acueducto de dos caños traía agua potable desde los manantiales de Chapultepec. La distribución urbana era ordenada: el centro ceremonial (el Templo Mayor y los edificios que lo rodeaban, equivalente a una catedral, un ayuntamiento y un estadio combinados) estaba circundado por los barrios (calpulli) de artesanos, comerciantes y guerreros. El gran mercado de Tlatelolco, ciudad gemela al norte, impresionó profundamente a los conquistadores españoles: Bernal Díaz del Castillo escribió que nunca había visto nada igual en España ni en el resto del mundo conocido, con decenas de miles de personas comerciando productos de todo Mesoamérica. Los jardines botánicos y el zoológico de Moctezuma eran únicos en el mundo para su época.',
      obraIconica:
        'Maqueta de Tenochtitlan en el Museo Nacional de Antropología — la reconstrucción más detallada de la capital mexica',
      paises: ['México (Valle de México)'],
    },
    {
      id: 'apogeo-moctezuma-ii',
      nombre: 'El Apogeo bajo Moctezuma II',
      anioInicio: 1502,
      anioFin: 1519,
      color: '#FFD700',
      categoria: 'apogeo',
      descripcion:
        'Moctezuma II Xocoyotzin (reinó 1502-1520) gobernó el Imperio en su momento de máxima extensión y poder. El tributo llegaba de más de 400 ciudades y pueblos: mantas de algodón, cacao, turquesa, plumas de quetzal y de otros pájaros, jade, oro, esclavos, maíz, frijol, chile y docenas de otros productos. La Matrícula de Tributos (compilada entonces) es uno de los documentos históricos más ricos de Mesoamérica. Moctezuma II reformó la corte imperial haciéndola más jerárquica y separada del pueblo llano: solo los nobles más elevados podían verle el rostro directamente; todos debían descalzarse al acercarse a él. Construyó el palacio más grande de Tenochtitlan (donde hoy está el Palacio Nacional de México). La Piedra del Sol, esculpida hacia 1502, es la obra escultórica más compleja del arte mexica: no es un calendario sino una representación cosmológica del Sol y los ciclos cósmicos. El dominio de Moctezuma se extendía desde el Golfo de México hasta el Océano Pacífico, desde el norte de México hasta el actual Guatemala. Solo Tlaxcala, los tarascos del oeste y algunos pueblos del norte permanecían fuera del sistema imperial.',
      obraIconica:
        'La Piedra del Sol (Calendario Azteca) — escultura cosmológica del Sol mexica, hallada en el Zócalo en 1790',
      paises: ['México', 'Guatemala', 'El Salvador', 'Honduras'],
    },
    {
      id: 'sociedad-cultura-azteca',
      nombre: 'Sociedad, Educación y Vida Cotidiana Mexica',
      anioInicio: 1400,
      anioFin: 1521,
      color: '#2E8B57',
      categoria: 'cultura',
      descripcion:
        'La sociedad mexica era jerárquica pero ofrecía movilidad social mediante el mérito militar. La nobleza (pipiltin) era hereditaria, pero un guerrero de nacimiento humilde que capturara 4 o más prisioneros en combate podía acceder a privilegios nobiliarios. La educación era obligatoria y universal para todos los niños mexicas —uno de los pocos casos de educación universal en el mundo precolombino. Los hijos de nobles asistían al calmecac (escuela sacerdotal-guerrera de élite donde se aprendía escritura, astronomía, historia y estrategia militar); los hijos del pueblo al telpochcalli (escuela de barrio enfocada en la guerra y el trabajo). Las mujeres nobles también recibían educación formal. La artesanía mexica era notable: la plumería (arte de crear objetos con plumas de pájaros tropicales) era exclusivamente mexica y producía piezas de una delicadeza excepcional. La orfebrería en oro y plata, la escultura monumental en basalto y andesita, y los textiles de algodón teñidos con cacao, grana cochinilla e índigo testimonian una producción artística de alta calidad.',
      obraIconica:
        'Penacho de Moctezuma II (Viena) — el tocado de plumas de quetzal y oro, símbolo de la plumería mexica',
      paises: ['México (Valle de México)'],
    },
    {
      id: 'religion-templo-mayor',
      nombre: 'Religión, Sacrificio y el Templo Mayor',
      anioInicio: 1325,
      anioFin: 1521,
      color: '#8B4513',
      categoria: 'religion',
      descripcion:
        'La religión mexica era politeísta y estaba íntimamente ligada a la concepción cósmica del tiempo. Los dioses principales (Huitzilopochtli, dios solar y de la guerra; Tláloc, dios de la lluvia; Quetzalcóatl, dios del viento y la sabiduría; Tezcatlipoca, el espejo humeante) requerían alimentación continua: la sangre humana. Según la cosmología mexica, el sol actual (el Quinto Sol) se movía gracias a los sacrificios de sangre; si cesaban, el sol se detendría y el mundo terminaría. El Templo Mayor de Tenochtitlan era una pirámide dual dedicada a Huitzilopochtli (lado sur, pintado de rojo) y Tláloc (lado norte, pintado de azul), símbolo de guerra y lluvia, las dos fuerzas que sustentaban el Imperio. Fue reconstruido y ampliado siete veces sobre sí mismo. Las excavaciones iniciadas en 1978 bajo el Zócalo de Ciudad de México han revelado ocho etapas de construcción y miles de ofrendas. Los sacrificios humanos, documentados y magnificados por las fuentes españolas, eran parte de un sistema ritual complejo donde también se sacrificaban animales, quemaban copal y se celebraban fiestas agrícolas de gran vitalidad.',
      obraIconica:
        'Coyolxauhqui — enorme disco de piedra hallado en el Templo Mayor en 1978, representando a la diosa luna',
      paises: ['México (Valle de México)'],
    },
    {
      id: 'llegada-cortes',
      nombre: 'La Llegada de Cortés y la Alianza Tlaxcalteca',
      anioInicio: 1519,
      anioFin: 1520,
      color: '#708090',
      categoria: 'conquista',
      descripcion:
        'En abril de 1519, Hernán Cortés desembarcó en la costa del Golfo de México con 508 soldados, 16 caballos, algunos cañones y la intención declarada de conquistar el interior para la Corona española. El encuentro inicial con pueblos totonacas reveló el resentimiento acumulado contra el sistema tributario mexica. Al llegar a Tlaxcala, los tlaxcaltecas (que habían mantenido su independencia gracias a las Guerras Floridas pero a costa de un bloqueo comercial crónico que los privaba de algodón, cacao y sal) combatieron brevemente a los españoles y luego se aliaron con ellos: su odio al Imperio Mexica era mayor que su recelo ante los recién llegados. Esta alianza fue el factor decisivo de la conquista. Cortés llegó a Tenochtitlan en noviembre de 1519 y fue recibido por Moctezuma II con el protocolo de un visitante distinguido (posiblemente por la famosa "identificación con Quetzalcóatl", aunque esta narrativa es debatida por historiadores modernos). Los españoles tomaron a Moctezuma como rehén dentro de la ciudad. La situación era explosiva: 508 europeos más algunos miles de aliados indígenas en el corazón de una capital de 200.000 personas.',
      obraIconica:
        'Lienzo de Tlaxcala — documento pictográfico que narra la alianza entre tlaxcaltecas y Cortés (siglo XVI)',
      paises: ['México (costa del Golfo, Tlaxcala, Tenochtitlan)'],
    },
    {
      id: 'caida-tenochtitlan',
      nombre: 'La Noche Triste y la Caída de Tenochtitlan',
      anioInicio: 1520,
      anioFin: 1521,
      color: '#4B0082',
      categoria: 'conquista',
      descripcion:
        'En junio de 1520, la matanza del Templo Mayor —perpetrada por el lugarteniente de Cortés, Pedro de Alvarado, durante una ceremonia religiosa— desencadenó la rebelión general de Tenochtitlan. Los mexicas expulsaron a los españoles en la "Noche Triste" (30 de junio de 1520): Cortés perdió unos 600 soldados españoles y miles de aliados tlaxcaltecas en la huida por la calzada inundada. Pero las epidemias de viruela, sarampión y tifus habían llegado con los españoles y arrasaban la población mexica, que no tenía inmunidad. Moctezuma II murió en cautiverio (por manos españolas o de la propia multitud mexica, sigue siendo debatido). Su sucesor Cuitláhuac murió de viruela a los pocos meses de asumir el poder. Cuauhtémoc, el último tlatoani, organizó la defensa de Tenochtitlan durante el cerco de 75 días (mayo-agosto de 1521). La ciudad fue destruida sistemáticamente durante el asedio: Cortés volaba edificio a edificio con sus aliados tlaxcaltecas. El 13 de agosto de 1521, Cuauhtémoc fue capturado en una canoa intentando escapar. Tenochtitlan cayó en manos de los conquistadores. Sobre sus ruinas se construyó la futura Ciudad de México.',
      obraIconica:
        'Monumento a Cuauhtémoc en Paseo de la Reforma, Ciudad de México — el último tlatoani mexica',
      paises: ['México (Valle de México)'],
    },
  ],

  eras: [
    {
      nombre: 'La Peregrinación: El Pueblo Errante',
      desde: 1200,
      hasta: 1325,
      icono: '🦅',
      hitosDestacados: ['La Migración desde Aztlán'],
      eventos: [
        'La profecía de Huitzilopochtli y la misión del pueblo mexica',
        'La peregrinación como forja de identidad colectiva',
        'Parada en Tula: apropiación del legado tolteca',
        'Chapultepec: expulsión y captura temporal del grupo mexica',
        'Los mexicas como mercenarios del señorío de Culhuacán',
        'Llegada al lago Texcoco y la búsqueda de la señal divina',
      ],
    },
    {
      nombre: 'La Fundación y los Primeros Pasos',
      desde: 1325,
      hasta: 1428,
      icono: '🌊',
      hitosDestacados: ['Fundación de Tenochtitlan'],
      eventos: [
        'La señal del águila y el nopal: fundación de Tenochtitlan (1325)',
        'Las primeras chinampas y el dominio del entorno lacustre',
        'Construcción del primer templo a Huitzilopochtli (el futuro Templo Mayor)',
        'Los mexicas como vasallos de Azcapotzalco: tributo y servicio militar',
        'División de la ciudad: Tenochtitlan y Tlatelolco como ciudades gemelas',
        'Alianzas matrimoniales con los linajes de Tlacopan y Texcoco',
      ],
    },
    {
      nombre: 'El Nacimiento del Imperio',
      desde: 1428,
      hasta: 1469,
      icono: '⚔️',
      hitosDestacados: [
        'La Triple Alianza y el Nacimiento del Imperio',
        'La Gran Expansión: Moctezuma I y Tlacaelel',
      ],
      eventos: [
        'Formación de la Triple Alianza: Tenochtitlan, Texcoco, Tlacopan (1428)',
        'Destrucción de Azcapotzalco: fin de la hegemonía tepaneca',
        'Tlacaelel reescribe la historia mexica: el pueblo elegido del sol',
        'Primera ampliación monumental del Templo Mayor',
        'Expansión hacia la Costa del Golfo, Oaxaca y Puebla',
        'Institución de las Guerras Floridas con Tlaxcala',
      ],
    },
    {
      nombre: 'El Apogeo del Imperio',
      desde: 1469,
      hasta: 1502,
      icono: '🌞',
      hitosDestacados: ['Tenochtitlan: La Ciudad Más Grande del Hemisferio'],
      eventos: [
        'Axayácatl amplía el Imperio pero es derrotado por los tarascos en el oeste (1479)',
        'Tenochtitlan supera los 200.000 habitantes: mayor ciudad del hemisferio',
        'El gran mercado de Tlatelolco impresionará a los propios conquistadores',
        'Construcción del acueducto de Chapultepec: agua potable para la capital',
        'Las chinampas alimentan a la ciudad con hasta 7 cosechas anuales',
        'Tizoc y Ahuízotl: nuevas campañas de expansión al sur (Guerrero, Oaxaca, Veracruz)',
      ],
    },
    {
      nombre: 'El Apogeo de Moctezuma II y el Presagio',
      desde: 1502,
      hasta: 1519,
      icono: '🏆',
      hitosDestacados: [
        'El Apogeo bajo Moctezuma II',
        'Sociedad, Educación y Vida Cotidiana Mexica',
        'Religión, Sacrificio y el Templo Mayor',
      ],
      eventos: [
        'Moctezuma II: reforma cortesana y máxima centralización del poder',
        'La Piedra del Sol (c. 1502): obra escultórica cumbre del arte mexica',
        'Tributo de más de 400 ciudades: la Matrícula de Tributos',
        'Ocho "presagios" de la tradición oral mexica sobre el fin del mundo',
        'La educación universal: calmecac y telpochcalli para todos los niños mexicas',
        'El penacho de plumas: la plumería mexica como arte único en el mundo',
      ],
    },
    {
      nombre: 'La Conquista y el Fin de Tenochtitlan',
      desde: 1519,
      hasta: 1521,
      icono: '🌅',
      hitosDestacados: [
        'La Llegada de Cortés y la Alianza Tlaxcalteca',
        'La Noche Triste y la Caída de Tenochtitlan',
      ],
      eventos: [
        'Cortés desembarca en Veracruz con 508 hombres (abril 1519)',
        'Alianza con los tlaxcaltecas: el factor decisivo de la conquista',
        'Moctezuma II recibe a Cortés en Tenochtitlan (noviembre 1519)',
        'La matanza del Templo Mayor desencadena la rebelión mexica (junio 1520)',
        'La Noche Triste: derrota española y huida por la calzada (30 junio 1520)',
        'La viruela arrasa Tenochtitlan: Moctezuma y Cuitláhuac mueren',
        'El cerco y destrucción de Tenochtitlan (mayo-agosto 1521)',
        'Cuauhtémoc capturado: el Imperio Mexica termina el 13 de agosto de 1521',
      ],
    },
  ],

  categorias: {
    migracion: 'La Peregrinación',
    fundacion: 'Fundación',
    expansion: 'Expansión Imperial',
    ciudad: 'La Gran Ciudad',
    apogeo: 'Apogeo del Imperio',
    cultura: 'Sociedad y Cultura',
    religion: 'Religión y Ritual',
    conquista: 'La Conquista',
  },

  colores: {
    migracion: '#8B4513',
    fundacion: '#DAA520',
    expansion: '#DC143C',
    ciudad: '#1E90FF',
    apogeo: '#FFD700',
    cultura: '#2E8B57',
    religion: '#8B4513',
    conquista: '#4B0082',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'El ascenso mexica es uno de los más vertiginosos de la historia: de tribu nómada sin territorio a mayor ciudad del hemisferio occidental en apenas 200 años (1325-1521). Los aztecas —nombre académico derivado de Aztlán— se autodenominaban mexicas y construyeron Tenochtitlan sobre un lago pantanoso del Valle de México, transformándolo en un prodigio de ingeniería hidráulica mediante las chinampas. La Triple Alianza (1428) con Texcoco y Tlacopan fue el motor del Imperio: un sistema tributario que recaudaba de más de 400 pueblos. La Piedra del Sol (c. 1502), el Templo Mayor reconstruido siete veces, y el penacho de Moctezuma II son los símbolos de una cultura de extraordinaria riqueza artística. La caída en 1521 no fue "500 españoles contra un imperio": fue la convergencia de epidemias devastadoras (viruela, sin inmunidad previa), la alianza de decenas de miles de guerreros indígenas resentidos con el sistema mexica (principalmente tlaxcaltecas), y una crisis política interna en la cúpula imperial.',

    tablaComparativa: [
      {
        hito: 'La Migración desde Aztlán',
        periodo: '1200-1325',
        categoria: 'La Peregrinación',
        personaje: 'Tenoch (líder fundador legendario)',
        aportacion:
          'Forja de la identidad mexica: de grupo errante a pueblo elegido del sol',
      },
      {
        hito: 'Fundación de Tenochtitlan',
        periodo: '1325-1428',
        categoria: 'Fundación',
        personaje: 'Huitzilíhuitl / Chimalpopoca',
        aportacion:
          'Las chinampas: sistema agrícola más productivo de Mesoamérica; ciudad-isla estratégicamente inexpugnable',
      },
      {
        hito: 'La Triple Alianza y el Nacimiento del Imperio',
        periodo: '1428-1440',
        categoria: 'Expansión Imperial',
        personaje: 'Itzcoatl / Tlacaelel',
        aportacion:
          'Derrota de Azcapotzalco; reescritura de la historia mexica; arquitectura ideológica del Imperio',
      },
      {
        hito: 'El Apogeo bajo Moctezuma II',
        periodo: '1502-1519',
        categoria: 'Apogeo del Imperio',
        personaje: 'Moctezuma II Xocoyotzin',
        aportacion:
          'Máxima extensión imperial: 400+ ciudades tributarias; la Piedra del Sol; Tenochtitlan, mayor ciudad del hemisferio',
      },
      {
        hito: 'Religión, Sacrificio y el Templo Mayor',
        periodo: '1325-1521',
        categoria: 'Religión y Ritual',
        personaje: 'Sacerdotes mexicas',
        aportacion:
          'Templo Mayor: 7 reconstrucciones sobre sí mismo; sacrificio como mantenimiento del cosmos; Coyolxauhqui',
      },
      {
        hito: 'La Noche Triste y la Caída de Tenochtitlan',
        periodo: '1520-1521',
        categoria: 'La Conquista',
        personaje: 'Cuauhtémoc (último tlatoani)',
        aportacion:
          'Resistencia heroica durante 75 días de cerco; fin del Imperio Mexica el 13 de agosto de 1521',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiante de Historia',
        perfil: 'Secundaria, bachillerato o universidad, estudia civilizaciones precolombinas o la conquista de México',
        texto:
          'Visión cronológica completa de los 3 siglos del Imperio Mexica, esencial para contextualizar la conquista española, el papel de los aliados indígenas y las causas reales de la caída de Tenochtitlan. Útil para situar Mesoamérica en el contexto mundial del siglo XVI.',
      },
      {
        icono: '🏙️',
        titulo: 'Visitante de Ciudad de México',
        perfil: 'Planea visitar el Zócalo, el Templo Mayor, el Museo Nacional de Antropología',
        texto:
          'El Zócalo de Ciudad de México está construido literalmente sobre los cimientos de Tenochtitlan. Esta cronología te ayuda a entender lo que estás pisando: los restos del Templo Mayor excavado desde 1978, la Piedra del Sol en el MNA y la maqueta de la ciudad en su apogeo.',
      },
      {
        icono: '📖',
        titulo: 'Lector de historia militar',
        perfil: 'Le fascina la estrategia de la conquista y el papel de los aliados indígenas',
        texto:
          'La conquista de México es uno de los episodios estratégicamente más complejos de la historia: 508 españoles coordinando a decenas de miles de aliados tlaxcaltecas y totonacas contra una ciudad-isla con 200.000 habitantes. Las decisiones de Cortés, la Noche Triste y el cerco de 75 días son estudios de caso militares de primer orden.',
      },
      {
        icono: '🎨',
        titulo: 'Aficionado al arte precolombino',
        perfil: 'Le interesa la escultura, la plumería y la cerámica mexica',
        texto:
          'La Coyolxauhqui, la Piedra del Sol, el penacho de Moctezuma II y las miles de ofrendas del Templo Mayor son ejemplos de una tradición artística sin parangón en Mesoamérica. Esta cronología sitúa cada obra en su contexto político y ritual, revelando por qué se hicieron y para quién.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué se llaman aztecas si ellos se llamaban mexicas?',
        respuesta:
          'Azteca es un nombre académico derivado de Aztlán (su lugar de origen mítico) que fue popularizado por el historiador ilustrado Francisco Clavijero en el siglo XVIII. El propio pueblo se denominaba a sí mismo mexicas (de ahí "México"). Hoy los historiadores prefieren el término mexica para mayor precisión, aunque azteca sigue siendo el nombre más extendido en la cultura popular y en los libros de texto de muchos países.',
        tip: 'La misma ciudad que fundaron —Tenochtitlan— da nombre al actual México a través de la forma mexica → México.',
      },
      {
        pregunta: '¿Qué eran las chinampas y cómo funcionaban?',
        respuesta:
          'Las chinampas eran islotes artificiales construidos en el lago Texcoco mediante capas de vegetación acuática, sedimento lacustre y tierra compactada, rodeados de canales. Fijados al fondo con raíces de árboles (ahuehuetes), podían producir hasta 7 cosechas anuales de maíz, calabaza, tomate y otras verduras. Era el sistema agrícola más productivo de Mesoamérica y permitió alimentar a la mayor ciudad del hemisferio. Hoy sobreviven en Xochimilco (Ciudad de México), declarado Patrimonio de la Humanidad por la UNESCO.',
        tip: 'Las "trajineras" de colores que se alquilan hoy en Xochimilco navegan exactamente por los mismos canales que rodeaban las chinampas mexicas hace 600 años.',
      },
      {
        pregunta: '¿Cómo pudieron 500 españoles conquistar un Imperio de millones de personas?',
        respuesta:
          'No fue así. La conquista la protagonizaron principalmente ejércitos indígenas: se estima que los aliados tlaxcaltecas, totonacas y otros pueblos aportaron entre 80.000 y 200.000 guerreros al cerco de Tenochtitlan. Los factores decisivos fueron la epidemia de viruela (que llegó antes que Cortés y mató a cientos de miles de mexicas sin inmunidad), las divisiones políticas internas del Imperio, y el resentimiento acumulado de los pueblos tributarios. Los 508 españoles iniciales fueron el catalizador, no el agente principal.',
        tip: 'El historiador Matthew Restall popularizó la deconstrucción del "mito de los conquistadores" en su libro "Seven Myths of the Spanish Conquest" (2003).',
      },
      {
        pregunta: '¿Qué es la Piedra del Sol y por qué no es un calendario?',
        respuesta:
          'La Piedra del Sol (esculpida hacia 1502, hallada en el Zócalo en 1790) es una representación cosmológica del Quinto Sol mexica y los cuatro soles anteriores que perecieron según su mitología. No es un instrumento de medición del tiempo: no tiene mecanismo, pesos ni sistema de lectura secuencial. La confusión con "calendario" comenzó en el siglo XIX cuando los primeros arqueólogos interpretaron sus símbolos calendáricos (los 20 días del tonalpohualli) como si fuera un reloj o almanaque, nombre que quedó en el imaginario popular.',
        tip: 'El disco mide 3,6 metros de diámetro y pesa 24 toneladas. Se puede ver en el Museo Nacional de Antropología de Ciudad de México.',
      },
      {
        pregunta: '¿Cuál fue el papel de Tlacaelel en el Imperio Azteca?',
        respuesta:
          'Tlacaelel (c. 1398-1480) fue el consejero supremo (cihuacoatl) durante cuatro reinados consecutivos —Itzcoatl, Moctezuma I, Axayácatl y Tizoc— sin ser nunca tlatoani. Rechazó el trono en dos ocasiones. Fue el arquitecto ideológico del Imperio: convenció a Itzcoatl de quemar los libros históricos anteriores y reescribir la historia mexica como un pueblo elegido por los dioses para mantener al sol en movimiento mediante el sacrificio. Esta narrativa justificó las Guerras Floridas, el sistema tributario y la supremacía mexica sobre todos los pueblos de Mesoamérica.',
        tip: 'Algunos historiadores comparan a Tlacaelel con Richelieu o Bismarck: el poder detrás del trono que moldeó un Imperio durante décadas sin ocupar el cargo supremo.',
      },
    ],

    pasos: [
      {
        titulo: 'Observa la duración de cada era en la Línea del Tiempo',
        cuerpo:
          'El marrón representa la larga peregrinación (125 años); el dorado, la fundación paciente bajo vasallaje; el rojo intenso, el explosivo nacimiento del Imperio; el amarillo dorado, el apogeo; y el índigo, la caída súbita. Nota cómo el Imperio tardó más en construirse que en derrumbarse.',
      },
      {
        titulo: 'Compara la fundación con el apogeo',
        cuerpo:
          'Haz clic en "Fundación de Tenochtitlan" y luego en "El Apogeo bajo Moctezuma II". En menos de 200 años, los mexicas pasaron de vasallos que pagaban tributo a señores de la mayor ciudad del hemisferio. Ese contraste es el núcleo de la historia mexica.',
      },
      {
        titulo: 'Sigue el papel de Tlacaelel a través de los hitos',
        cuerpo:
          'Tlacaelel aparece en "La Triple Alianza" y en "La Gran Expansión". Este consejero sin corona moldeó la ideología del Imperio durante cuatro reinados. Identifica en la línea de tiempo cuánto duró su influencia y qué eventos marcaron su gestión.',
      },
      {
        titulo: 'Usa la Comparativa para entender la conquista',
        cuerpo:
          'En la tabla Comparativa, filtra por "La Conquista" para ver los dos hitos finales juntos. La llegada de Cortés y la Noche Triste son inseparables: sin la alianza tlaxcalteca, la conquista es inexplicable. El hilo entre ambos hitos es la clave para desmitificar la narrativa tradicional.',
      },
      {
        titulo: 'Termina con el Contexto Histórico para el cuadro completo',
        cuerpo:
          'Las 6 eras muestran la aceleración histórica mexica: la era de peregrinación dura 125 años, la era del Imperio tres generaciones, y la conquista solo 2 años. La era final es la más densa: epidemias, alianzas cambiantes, batallas decisivas y el fin de una civilización en 24 meses.',
      },
    ],

    tips: [
      {
        icono: '🌽',
        texto:
          'Las chinampas de Xochimilco (Ciudad de México) son Patrimonio de la Humanidad UNESCO y el único vestigio vivo del sistema agrícola que alimentó a Tenochtitlan. Las "trajineras" de colores que se alquilan hoy navegan exactamente por los mismos canales mexicas de hace 600 años.',
      },
      {
        icono: '🪶',
        texto:
          'El penacho de Moctezuma II, conservado en el Museo de Etnología de Viena, tiene 450 plumas de quetzal y mide casi 1,2 metros de altura. Las negociaciones entre México y Austria para su repatriación llevan décadas sin resolverse: Austria argumenta que su estado de conservación hace imposible el traslado.',
      },
      {
        icono: '🦠',
        texto:
          'La epidemia de viruela que llegó con los españoles en 1520 mató a Cuitláhuac (sucesor de Moctezuma) en solo 80 días de reinado. Los historiadores estiman que las epidemias del siglo XVI redujeron la población indígena de México en un 50-90% en menos de un siglo: el mayor colapso demográfico documentado en la historia.',
      },
      {
        icono: '🏛️',
        texto:
          'El Templo Mayor fue descubierto accidentalmente en 1978 cuando trabajadores de la Compañía de Luz excavaban una zanja bajo el Zócalo de Ciudad de México. Desde entonces se han recuperado más de 7.000 objetos rituales en 200 ofrendas. Las excavaciones continúan hoy bajo los edificios coloniales del centro histórico.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que Cortés conquistó el Imperio solo con 500 españoles',
        cuerpo:
          'La conquista de Tenochtitlan fue una guerra civil mesoamericana en la que los españoles fueron el catalizador, no el agente principal. Los aliados tlaxcaltecas, totonacas y otros pueblos aportaron entre 80.000 y 200.000 guerreros al cerco final. Sin ellos, 508 europeos habrían sido aniquilados en días. El resentimiento acumulado contra el sistema tributario mexica fue el verdadero motor de la conquista.',
      },
      {
        titulo: 'Confundir la Piedra del Sol con un calendario',
        cuerpo:
          'El nombre popular "Calendario Azteca" es incorrecto. La Piedra del Sol es una representación cosmológica del Quinto Sol y los cuatro soles anteriores, no un instrumento para medir el tiempo. Sí incluye símbolos del calendario ritual (los 20 días del tonalpohualli), pero no fue diseñada para leer fechas ni predecir eventos. El nombre equívoco se popularizó en el siglo XIX y persiste en el lenguaje cotidiano.',
      },
      {
        titulo: 'Pensar que los aztecas eran el único pueblo de Mesoamérica',
        cuerpo:
          'En 1519 el Valle de México estaba habitado por docenas de grupos étnicos: tlaxcaltecas, texcocanos, tlatelolcas, totonacas, tarascos, zapotecos, mixtecos y muchos más. Los mexicas eran el poder hegemónico, pero muchos de estos pueblos mantenían identidades, lenguas y culturas propias y aprovecharon la llegada de Cortés para liberarse del tributo mexica. La diversidad cultural de Mesoamérica era tan grande como la de Europa.',
      },
      {
        titulo: 'Romantizar o demonizar el sacrificio humano fuera de su contexto',
        cuerpo:
          'El sacrificio humano mexica era una práctica ritual enmarcada en una cosmología coherente: el sol requería sangre para moverse, y los guerreros capturados eran ofrendas, no víctimas aleatorias. Las fuentes españolas magnificaron las cifras con propósitos propagandísticos para justificar la conquista. Ni reducirlo a "barbarismo" ni romantizarlo: era una institución religiosa y política compleja, estudiada hoy con rigor arqueológico a partir de las excavaciones del Templo Mayor.',
      },
    ],
  },
};
