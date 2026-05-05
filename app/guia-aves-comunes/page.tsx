'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaAvesComunes.module.css';
import { jsonLd } from './metadata';

type OrdenAve =
  | 'Paseriformes'
  | 'Falconiformes'
  | 'Strigiformes'
  | 'Anseriformes'
  | 'Ciconiiformes'
  | 'Columbiformes'
  | 'Piciformes'
  | 'Galliformes'
  | 'Coraciiformes'
  | 'Apodiformes'
  | 'Charadriiformes'
  | 'Gruiformes';

type HabitatAve = 'Urbano' | 'Bosque' | 'Campo' | 'Humedal' | 'Costa' | 'Montaña' | 'Jardín';

type EstadoConservacion = 'LC' | 'NT' | 'VU' | 'EN' | 'CR';

type Presencia = 'Residente' | 'Estival' | 'Invernante' | 'Migratoria' | 'Ocasional';

interface Ave {
  id: string;
  nombre: string;
  nombreCientifico: string;
  nombreIngles: string;
  orden: OrdenAve;
  habitat: HabitatAve[];
  alimentacion: string;
  tamano: string;
  envergadura: string;
  presencia: Presencia;
  estadoConservacion: EstadoConservacion;
  descripcion: string;
  cantoDescripcion: string;
  curiosidad: string;
  colorPrimario: string;
}

const AVES: Ave[] = [
  // ── PASERIFORMES ────────────────────────────────────────────────────────────
  {
    id: 'gorrion-comun',
    nombre: 'Gorrión común',
    nombreCientifico: 'Passer domesticus',
    nombreIngles: 'House Sparrow',
    orden: 'Paseriformes',
    habitat: ['Urbano', 'Jardín'],
    alimentacion: 'Granívoro oportunista; semillas, restos urbanos e insectos en temporada de cría',
    tamano: '14–16 cm',
    envergadura: '22–25 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El ave más urbana de España, compañera inseparable del ser humano desde hace milenios. El macho luce gorra gris, mejilla blanca y babero negro; la hembra es parda y más discreta.',
    cantoDescripcion: 'Canto repetitivo y ruidoso de "chip-chip-chirp", sin melodía elaborada. Muy vocal en los nidos coloniales bajo tejados.',
    curiosidad: 'El gorrión común ha seguido al ser humano por todo el planeta: no existe en la naturaleza fuera del entorno humano. Su población ha caído un 70% en Europa occidental en 30 años, probablemente por la pérdida de insectos y grietas en los edificios modernos.',
    colorPrimario: '#8B7355',
  },
  {
    id: 'mirlo-comun',
    nombre: 'Mirlo común',
    nombreCientifico: 'Turdus merula',
    nombreIngles: 'Common Blackbird',
    orden: 'Paseriformes',
    habitat: ['Bosque', 'Jardín'],
    alimentacion: 'Omnívoro; lombrices, caracoles, frutos silvestres y bayas',
    tamano: '24–27 cm',
    envergadura: '34–38 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El macho es negro azabache con pico naranja brillante, inconfundible. La hembra es parda con pecho moteado. Uno de los cantores más melodiosos de Europa, especialmente activo al amanecer y al atardecer.',
    cantoDescripcion: 'Canto fluido, melodioso y variado con frases largas que improvisa. Uno de los cantos más ricos y musicales de las aves europeas, especialmente al amanecer.',
    curiosidad: 'El mirlo es uno de los pocos pájaros que aprende el canto de su entorno: los mirlos urbanos incorporan melodías de teléfonos, canciones y otros sonidos humanos a su repertorio vocal.',
    colorPrimario: '#1C1C1C',
  },
  {
    id: 'petirrojo',
    nombre: 'Petirrojo',
    nombreCientifico: 'Erithacus rubecula',
    nombreIngles: 'European Robin',
    orden: 'Paseriformes',
    habitat: ['Bosque', 'Jardín'],
    alimentacion: 'Insectívoro; gusanos, arañas, pequeños insectos del suelo',
    tamano: '14 cm',
    envergadura: '20–22 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Reconocible al instante por su pecho naranja rojizo sobre vientre blanco. Muy confiado con los humanos, sigue a menudo a los jardineros que remueven la tierra. Territorial y agresivo con otros petirrojos.',
    cantoDescripcion: 'Canto melancólico y cristalino, especialmente audible en otoño e invierno cuando otros pájaros guardan silencio. Canta incluso de noche cerca de las farolas.',
    curiosidad: 'El petirrojo canta en invierno para defender su territorio de manera tan agresiva que puede llegar a atacar su propio reflejo en un espejo. Es el ave nacional del Reino Unido y un símbolo navideño europeo por su actividad invernal.',
    colorPrimario: '#FF6347',
  },
  {
    id: 'golondrina-comun',
    nombre: 'Golondrina común',
    nombreCientifico: 'Hirundo rustica',
    nombreIngles: 'Barn Swallow',
    orden: 'Paseriformes',
    habitat: ['Campo', 'Urbano'],
    alimentacion: 'Insectívoro aéreo; captura insectos al vuelo con el pico abierto',
    tamano: '17–21 cm',
    envergadura: '32–34 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'Ave migratoria que anuncia el verano. Dorso azul-negro metálico, frente y garganta rojizas, vientre blanco crema y larga cola ahorquillada. Vuela velozmente rasando el agua y el suelo.',
    cantoDescripcion: 'Trino alegre y rápido, un gorjeo continuo de "twit-twit-swee". Suena muy social; canta posada en cables eléctricos o en vuelo.',
    curiosidad: 'Las golondrinas migran desde España hasta el sur de África (más de 10.000 km) y regresan cada primavera al mismo nido. Los estudios de anillamiento han documentado golondrinas fieles al mismo nido durante más de 10 años consecutivos.',
    colorPrimario: '#00008B',
  },
  {
    id: 'carbonero-comun',
    nombre: 'Carbonero común',
    nombreCientifico: 'Parus major',
    nombreIngles: 'Great Tit',
    orden: 'Paseriformes',
    habitat: ['Bosque', 'Jardín'],
    alimentacion: 'Omnívoro; insectos, larvas, semillas y frutos secos según temporada',
    tamano: '14 cm',
    envergadura: '22–25 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El mayor de los herrerillos europeos. Cabeza negra con mejillas blancas, dorso amarillo-verdoso, pecho amarillo brillante cruzado por una banda negra (más ancha en el macho).',
    cantoDescripcion: 'Canto muy variado y mimético con más de 40 tipos de llamadas distintas. El más conocido es un "ti-cher, ti-cher, ti-cher" repetitivo que suena a sierra de madera.',
    curiosidad: 'El carbonero común es uno de los pájaros más estudiados del mundo: más de 50 años de seguimiento en el Bosque de Wytham (Oxford) han aportado datos fundamentales sobre evolución, cognición y comportamiento social de las aves.',
    colorPrimario: '#FFD700',
  },
  {
    id: 'herrerillo-comun',
    nombre: 'Herrerillo común',
    nombreCientifico: 'Cyanistes caeruleus',
    nombreIngles: 'Blue Tit',
    orden: 'Paseriformes',
    habitat: ['Bosque', 'Jardín'],
    alimentacion: 'Insectívoro; larvas de oruga en primavera, semillas y bayas en invierno',
    tamano: '12 cm',
    envergadura: '17–20 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Pequeño y vistoso: azul cobalto en alas y cola, amarillo brillante en el vientre, frente blanca y gorrito azul. Muy ágil, capaz de comer colgado boca abajo de las ramas más finas.',
    cantoDescripcion: 'Canto agudo y tintineante, "tsi-tsi-tsi-huhuhu" de tono alto. Muy vocal en primavera durante el cortejo.',
    curiosidad: 'En los años 1950 los herrerillos de Gran Bretaña aprendieron colectivamente a abrir las tapas de aluminio de las botellas de leche para beber la nata. Este comportamiento se extendió de zona en zona como un fenómeno de "cultura animal", uno de los primeros documentados científicamente.',
    colorPrimario: '#4169E1',
  },
  {
    id: 'pinzon-vulgar',
    nombre: 'Pinzón vulgar',
    nombreCientifico: 'Fringilla coelebs',
    nombreIngles: 'Common Chaffinch',
    orden: 'Paseriformes',
    habitat: ['Bosque', 'Jardín'],
    alimentacion: 'Granívoro; semillas en el suelo e insectos en temporada de cría',
    tamano: '14–16 cm',
    envergadura: '24–28 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El pinzón es uno de los pájaros más abundantes de Europa. El macho tiene una coloración llamativa: frente negra, mejillas y pecho rosados, dorso marrón y alas con doble barra blanca bien visible en vuelo.',
    cantoDescripcion: 'Canto en cascada descendente con un final florido "chip-chip-chip-chwee-chwee-tshissyo". Cada macho tiene su dialecto local aprendido de los vecinos.',
    curiosidad: 'Darwin usó a los pinzones de las Galápagos para ilustrar la selección natural, pero fue el estudio del pinzón vulgar europeo por William Thorpe en los años 1950 el que estableció los fundamentos científicos del aprendizaje vocal en aves.',
    colorPrimario: '#CD853F',
  },
  {
    id: 'verderon-comun',
    nombre: 'Verderón común',
    nombreCientifico: 'Chloris chloris',
    nombreIngles: 'Greenfinch',
    orden: 'Paseriformes',
    habitat: ['Campo', 'Jardín'],
    alimentacion: 'Granívoro especializado en semillas grandes; bayas y frutos en otoño',
    tamano: '15 cm',
    envergadura: '24–27 cm',
    presencia: 'Residente',
    estadoConservacion: 'VU',
    descripcion: 'Robusto y de pico potente. El macho es verde amarillento con manchas amarillas en las alas y la cola. La hembra es más parda y estriada. Frecuente en comederos de jardín donde prefiere girasol y pipas.',
    cantoDescripcion: 'Canto nasal con un largo "zweee" característico, mezclado con trinos rápidos. El reclamo es un "chi-chi-chi-chi" rápido y metálico.',
    curiosidad: 'El verderón ha pasado de "Preocupación menor" a "Vulnerable" en la lista roja europea por el tricomonosis, una enfermedad parasitaria que se transmite en comederos de aves contaminados. Limpiar los comederos regularmente salva vidas de verderones.',
    colorPrimario: '#9ACD32',
  },
  {
    id: 'jilguero',
    nombre: 'Jilguero',
    nombreCientifico: 'Carduelis carduelis',
    nombreIngles: 'Goldfinch',
    orden: 'Paseriformes',
    habitat: ['Campo', 'Jardín'],
    alimentacion: 'Granívoro especializado en semillas de cardo, diente de león y plantas compuestas',
    tamano: '12–13 cm',
    envergadura: '21–25 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Una de las aves más elegantes de España: cara roja, frente y nuca negras, mejillas blancas y una vistosa banda amarilla en las alas negras. Vuela en bandos que emiten su reclamo tintineante característico.',
    cantoDescripcion: 'Canto líquido, tintineante y melodioso: "twit-wit-wit-witt" con variaciones rápidas. Muy apreciado como pájaro de jaula en la tradición española y mediterránea.',
    curiosidad: 'El jilguero fue tan capturado para la caza y la jaula en Europa que llegó a desaparecer de muchas ciudades. La prohibición de su captura ha permitido una recuperación notable. Hoy es el pájaro cantor más vendido legalmente como ave de compañía en España.',
    colorPrimario: '#FFD700',
  },
  {
    id: 'urraca',
    nombre: 'Urraca',
    nombreCientifico: 'Pica pica',
    nombreIngles: 'Magpie',
    orden: 'Paseriformes',
    habitat: ['Urbano', 'Campo'],
    alimentacion: 'Omnívora oportunista; huevos, pollos, insectos, carroña, frutos y basura',
    tamano: '44–46 cm',
    envergadura: '52–60 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Ave llamativa de blanco y negro con larga cola metálica verde-azulada iridiscente. Muy inteligente y adaptable, ha colonizado con éxito el entorno urbano en toda España.',
    cantoDescripcion: 'Canto ruidoso y áspero: "tchak-tchak-tchak" como un traqueteo rápido, sin melodía. Muy vocal cuando detecta depredadores.',
    curiosidad: 'La urraca es una de las pocas aves que supera el test del espejo: reconoce su propio reflejo, lo que indica autoconciencia. Solo los grandes simios, delfines y elefantes comparten esta capacidad además de ella.',
    colorPrimario: '#1C1C1C',
  },
  {
    id: 'zorzal-comun',
    nombre: 'Zorzal común',
    nombreCientifico: 'Turdus philomelos',
    nombreIngles: 'Song Thrush',
    orden: 'Paseriformes',
    habitat: ['Bosque', 'Jardín'],
    alimentacion: 'Omnívoro; caracoles, lombrices, frutos silvestres y bayas',
    tamano: '23 cm',
    envergadura: '33–36 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Pájaro de dorso marrón cálido y pecho crema moteado con manchas oscuras en forma de gota. Experto en abrir caracoles golpeándolos contra una piedra usada repetidamente como "yunque".',
    cantoDescripcion: 'Canto melodioso y potente con frases repetidas dos o tres veces antes de pasar a la siguiente. Uno de los mejores cantores de los jardines europeos.',
    curiosidad: 'El zorzal es famoso por su técnica de abrir caracoles: encuentra una piedra "yunque" y regresa a ella repetidamente para romper las conchas. Los ornitólogos pueden encontrar estas piedras rodeadas de cientos de conchas trituradas.',
    colorPrimario: '#8B6914',
  },
  {
    id: 'ruisenor-comun',
    nombre: 'Ruiseñor común',
    nombreCientifico: 'Luscinia megarhynchos',
    nombreIngles: 'Nightingale',
    orden: 'Paseriformes',
    habitat: ['Bosque'],
    alimentacion: 'Insectívoro; insectos, larvas, gusanos y pequeños frutos',
    tamano: '16 cm',
    envergadura: '23–26 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'Ave discreta de plumaje marrón cálido con cola rojiza. Pese a su aspecto anodino, su canto es el más famoso y complejo de todas las aves europeas, símbolo de la poesía y la noche.',
    cantoDescripcion: 'El canto más rico y variado de Europa: frases largas con crecendos, gorgeos, silbidos y notas puras. Canta especialmente de noche y al amanecer, audible a centenares de metros.',
    curiosidad: 'El ruiseñor macho aprende hasta 200 tipos de frases distintas y las combina de forma única. Los machos con repertorios más ricos consiguen reproducirse antes y tienen mayor éxito reproductivo, lo que demuestra que la complejidad del canto es un indicador de calidad genética.',
    colorPrimario: '#D2691E',
  },
  {
    id: 'curruca-capirotada',
    nombre: 'Curruca capirotada',
    nombreCientifico: 'Sylvia atricapilla',
    nombreIngles: 'Blackcap',
    orden: 'Paseriformes',
    habitat: ['Bosque', 'Jardín'],
    alimentacion: 'Omnívora; insectos en verano, frutos y bayas en invierno',
    tamano: '14 cm',
    envergadura: '20–23 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El macho tiene una inconfundible gorra negra (de ahí su nombre); la hembra lleva la misma gorra en castaño rojizo. Excelente cantor, a menudo llamado "ruiseñor del norte".',
    cantoDescripcion: 'Canto fluido y melodioso con notas claras y enérgicas que termina en un florido crescendo. Muy musical; a menudo comparado con el ruiseñor por su riqueza melódica.',
    curiosidad: 'Algunas currucas capirotadas centroeuropeas han "inventado" una nueva ruta migratoria en pocas décadas: en lugar de ir a África, pasan el invierno en el Reino Unido. Este cambio evolutivo rápido es uno de los ejemplos más citados de microevolución en tiempo real.',
    colorPrimario: '#696969',
  },
  {
    id: 'escribano-triguero',
    nombre: 'Escribano triguero',
    nombreCientifico: 'Emberiza calandra',
    nombreIngles: 'Corn Bunting',
    orden: 'Paseriformes',
    habitat: ['Campo'],
    alimentacion: 'Granívoro; semillas de gramíneas silvestres e insectos en temporada de cría',
    tamano: '18 cm',
    envergadura: '26–32 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El mayor de los escribanos europeos, pardo y rayado sin colores llamativos. Pico grueso adaptado a las semillas. Frecuente en cereales y eriales abiertos. Canta desde posaderos elevados como cables eléctricos.',
    cantoDescripcion: 'Canto seco y estridente como el traqueteo de un manojo de llaves: "jick-jick-jick-errrr". Muy característico del paisaje de cereal castellano.',
    curiosidad: 'El escribano triguero es una de las pocas aves europeas con poliginia habitual: un macho puede tener hasta 18 hembras simultáneas en su territorio. Las hembras crían solas; el macho solo canta y defiende el territorio.',
    colorPrimario: '#D2B48C',
  },

  // ── RAPACES DIURNAS ──────────────────────────────────────────────────────────
  {
    id: 'cernical-vulgar',
    nombre: 'Cernícalo vulgar',
    nombreCientifico: 'Falco tinnunculus',
    nombreIngles: 'Common Kestrel',
    orden: 'Falconiformes',
    habitat: ['Campo', 'Urbano'],
    alimentacion: 'Topillos, ratones de campo, insectos grandes y lagartijas',
    tamano: '32–35 cm',
    envergadura: '68–78 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Rapaz mediana con espalda marrón-rojiza moteada. El macho tiene cabeza y cola grises. Famosa por el "cernido": permanece estacionaria en el aire batiendo las alas rápidamente mientras escudriña el suelo.',
    cantoDescripcion: 'Reclamo repetitivo y agudo "ki-ki-ki-ki" que da nombre al ave en muchos idiomas. Especialmente vocal en el cortejo y cerca del nido.',
    curiosidad: 'El cernícalo puede ver la luz ultravioleta, invisible para los humanos. Usa esta capacidad para seguir los rastros de orina de los topillos, que brillan en UV, y localizar sus colonias con gran eficiencia.',
    colorPrimario: '#A0522D',
  },
  {
    id: 'milano-negro',
    nombre: 'Milano negro',
    nombreCientifico: 'Milvus migrans',
    nombreIngles: 'Black Kite',
    orden: 'Falconiformes',
    habitat: ['Campo', 'Humedal'],
    alimentacion: 'Carroñero y oportunista; peces, roedores muertos, basura y presas pequeñas',
    tamano: '55–65 cm',
    envergadura: '140–165 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'Rapaz grande de marrón oscuro uniforme con cola ligeramente ahorquillada (menos marcada que el milano real). Especie sociable que puede verse en bandos sobre basureros y vertederos.',
    cantoDescripcion: 'Reclamo trémolo y aflautado "piiiii-rrrr" muy característico en vuelo. Suena quejumbroso y se emite frecuentemente.',
    curiosidad: 'El milano negro es el ave rapaz más numerosa del mundo, con millones de individuos que se concentran en enormes dormideros comunales en África e India. En España se considera indicador de la calidad medioambiental de las riberas fluviales.',
    colorPrimario: '#4A3728',
  },
  {
    id: 'ratonero-comun',
    nombre: 'Ratonero común',
    nombreCientifico: 'Buteo buteo',
    nombreIngles: 'Common Buzzard',
    orden: 'Falconiformes',
    habitat: ['Bosque', 'Campo'],
    alimentacion: 'Roedores, topos, conejos jóvenes y carroña; lombrices en invierno',
    tamano: '51–57 cm',
    envergadura: '113–128 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Rapaz robusta con plumaje muy variable (marrón oscuro a casi blanco). Cola corta y redondeada, alas anchas. Frecuente posada en postes eléctricos y en lo alto de árboles junto a carreteras.',
    cantoDescripcion: 'Maullido penetrante y lastimero "piiiaw" emitido en vuelo o desde un posadero. El sonido se usa a menudo en películas para sustituir el grito del águila real (menos vocal).',
    curiosidad: 'El ratonero pasó de ser perseguido activamente como "plaga" en España hasta los años 1980 a estar totalmente protegido. Su recuperación ha sido tan exitosa que hoy es la rapaz más común de Europa, con más de 2 millones de parejas reproductoras.',
    colorPrimario: '#8B6914',
  },
  {
    id: 'gavilan-comun',
    nombre: 'Gavilán común',
    nombreCientifico: 'Accipiter nisus',
    nombreIngles: 'Eurasian Sparrowhawk',
    orden: 'Falconiformes',
    habitat: ['Bosque'],
    alimentacion: 'Aves pequeñas y medianas capturadas en vuelo rasante con efecto sorpresa',
    tamano: '28–38 cm',
    envergadura: '58–80 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Rapaz pequeña y ágil adaptada a cazar entre los árboles. El macho (mucho más pequeño que la hembra) tiene dorso gris azulado y pecho barreado naranja. Alas cortas y cola larga para maniobrar.',
    cantoDescripcion: 'Canto agudo y repetitivo "kek-kek-kek" cerca del nido. Habitualmente silencioso fuera de la época reproductora.',
    curiosidad: 'El gavilán hembra es un 25% más grande que el macho, uno de los dimorfismos sexuales más extremos de las aves europeas. Esta diferencia permite a la pareja cazar presas de diferente tamaño en el mismo territorio sin competir entre sí.',
    colorPrimario: '#708090',
  },
  {
    id: 'aguilucho-lagunero',
    nombre: 'Aguilucho lagunero',
    nombreCientifico: 'Circus aeruginosus',
    nombreIngles: 'Marsh Harrier',
    orden: 'Falconiformes',
    habitat: ['Humedal'],
    alimentacion: 'Aves acuáticas, anfibios, mamíferos pequeños y huevos de aves palustres',
    tamano: '48–56 cm',
    envergadura: '110–130 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'El aguilucho más grande de España. El macho tiene cuerpo marrón, cabeza y hombros amarillo crema, y alas tricolores (gris, marrón y negro). La hembra es marrón oscura con crema solo en cabeza y hombros.',
    cantoDescripcion: 'Canto agudo y penetrante emitido durante los vuelos de cortejo en primavera. Normalmente silencioso fuera de la época reproductora.',
    curiosidad: 'El aguilucho lagunero estuvo en grave peligro en España por el drenaje de humedales en el siglo XX. La recuperación del Parque Nacional de Doñana y otras marismas ha permitido que sus poblaciones se recuperen notablemente desde los años 1980.',
    colorPrimario: '#DEB887',
  },
  {
    id: 'halcon-peregrino',
    nombre: 'Halcón peregrino',
    nombreCientifico: 'Falco peregrinus',
    nombreIngles: 'Peregrine Falcon',
    orden: 'Falconiformes',
    habitat: ['Montaña', 'Costa'],
    alimentacion: 'Aves de tamaño mediano capturadas en picado veloz',
    tamano: '36–48 cm',
    envergadura: '89–113 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'La rapaz más rápida del mundo. Dorso gris pizarra, vientre barreado crema y negro, y un característico "bigote" negro en la cara. Se ha adaptado a nidificar en edificios urbanos, donde caza palomas.',
    cantoDescripcion: 'Reclamo áspero y estridente "kek-kek-kek-kek" muy audible cerca del nido. Más vocal en la época reproductora.',
    curiosidad: 'El halcón peregrino alcanza más de 380 km/h en picado, convirtiéndolo en el animal más rápido de la Tierra. En España casi desapareció en los años 1970 por el DDT y la persecución humana; hoy hay más de 2.000 parejas gracias a programas de protección.',
    colorPrimario: '#778899',
  },

  // ── STRIGIFORMES ─────────────────────────────────────────────────────────────
  {
    id: 'lechuza-comun',
    nombre: 'Lechuza común',
    nombreCientifico: 'Tyto alba',
    nombreIngles: 'Barn Owl',
    orden: 'Strigiformes',
    habitat: ['Campo'],
    alimentacion: 'Topillos, ratones y ratas; captura hasta 4–5 roedores por noche',
    tamano: '33–35 cm',
    envergadura: '80–95 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Ave nocturna de aspecto fantasmal: cara blanca en forma de corazón, dorso dorado moteado y partes inferiores blancas. Vuelo silencioso gracias a sus plumas especiales. Se refugia en graneros, iglesias y ruinas.',
    cantoDescripcion: 'No canta: emite un alarido largo y escalofriante "shiiiirrrr" que inspiró múltiples leyendas de aparecidos. También emite chillidos agudos y chasquidos con el pico.',
    curiosidad: 'La lechuza común puede localizar una presa en oscuridad total usando solo el oído. Sus oídos asimétricos (a diferente altura en el cráneo) triangular el sonido en tres dimensiones con una precisión de una décima de grado.',
    colorPrimario: '#FFD700',
  },
  {
    id: 'buho-real',
    nombre: 'Búho real',
    nombreCientifico: 'Bubo bubo',
    nombreIngles: 'Eagle Owl',
    orden: 'Strigiformes',
    habitat: ['Montaña', 'Bosque'],
    alimentacion: 'Mamíferos de hasta 3 kg (liebres, conejos), aves grandes e incluso otras rapaces',
    tamano: '60–75 cm',
    envergadura: '160–188 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'La mayor lechuza del mundo. Naranja-marrón moteado con grandes ojos naranja y prominentes mechones de plumas en la cabeza (orejas falsas). Depredador nocturno sin rivales naturales en su ecosistema.',
    cantoDescripcion: 'Canto profundo y resonante "bu-hoooo" que puede oírse a 4 km de distancia en noches tranquilas. El macho llama al atardecer para anunciar su territorio.',
    curiosidad: 'El búho real puede girar la cabeza 270 grados gracias a sus 14 vértebras cervicales (el doble que los mamíferos). Sus ojos no pueden moverse en el cuenco ocular como los humanos, por lo que compensa con esa rotación extrema del cuello.',
    colorPrimario: '#D2691E',
  },
  {
    id: 'mochuelo-europeo',
    nombre: 'Mochuelo europeo',
    nombreCientifico: 'Athene noctua',
    nombreIngles: 'Little Owl',
    orden: 'Strigiformes',
    habitat: ['Campo'],
    alimentacion: 'Insectos, lombrices, ratones y lagartijas; activo también de día',
    tamano: '21–23 cm',
    envergadura: '54–58 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'La más pequeña de las lechuzas europeas comunes. Marrón moteada en blanco, con cara redonda y expresión ceñuda. Activa crepuscular pero también diurna. Se le ve posado en postes y tejados rurales.',
    cantoDescripcion: 'Reclamo suave y melancólico "cu-iiick" ascendente, emitido repetidamente al anochecer. También emite ladridos cortos "kiew-kiew".',
    curiosidad: 'El mochuelo europeo era el símbolo de Atenea, diosa griega de la sabiduría, y aparece en las monedas de la antigua Atenas. Su nombre científico (Athene noctua) lo perpetúa. Era un símbolo tan importante que los griegos lo criaban en grandes colonias en la Acrópolis.',
    colorPrimario: '#8B7355',
  },

  // ── ANSERIFORMES ─────────────────────────────────────────────────────────────
  {
    id: 'anade-real',
    nombre: 'Ánade real',
    nombreCientifico: 'Anas platyrhynchos',
    nombreIngles: 'Mallard',
    orden: 'Anseriformes',
    habitat: ['Humedal', 'Urbano'],
    alimentacion: 'Omnívoro acuático; plantas acuáticas, insectos, gusanos, pequeños peces y pan (aunque el pan es malo para su salud)',
    tamano: '55–65 cm',
    envergadura: '81–98 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El pato más conocido y abundante del mundo. El macho tiene cabeza verde iridiscente, collar blanco, pecho marrón y cuerpo gris. La hembra es marrón rayada. Presente en cualquier masa de agua, incluidos estanques urbanos.',
    cantoDescripcion: 'El famoso "cuac-cuac" solo lo emite la hembra. El macho emite un sonido nasal suave "raeb". Este quac es el único eco del mundo natural que sí rebota.',
    curiosidad: 'El ánade real es el ancestro de casi todas las razas domésticas de pato. El pato de Pequín (famoso por el pato laqueado), el pato corredor indio y docenas de razas domésticas descienden todos de esta especie.',
    colorPrimario: '#228B22',
  },
  {
    id: 'pato-colorado',
    nombre: 'Pato colorado',
    nombreCientifico: 'Netta rufina',
    nombreIngles: 'Red-crested Pochard',
    orden: 'Anseriformes',
    habitat: ['Humedal'],
    alimentacion: 'Plantas acuáticas sumergidas; bucea para alcanzarlas',
    tamano: '53–57 cm',
    envergadura: '84–88 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El macho es espectacular: cabeza naranja-rojo encendido sobre pico también rojo, cuerpo negro y blanco. La hembra es parda con mejillas y nuca blanquecinas. Frecuente en lagunas con vegetación.',
    cantoDescripcion: 'El macho emite un reclamo nasal "arr-r" grave. La hembra produce un "karrr" más áspero en situaciones de alarma.',
    curiosidad: 'El pato colorado es uno de los pocos patos buceadores que también pasta en tierra como los patos de superficie. En el delta del Ebro y en la Laguna de Gallocanta (Zaragoza) se concentran miles de individuos invernantes procedentes de Europa central.',
    colorPrimario: '#FF4500',
  },
  {
    id: 'cerceta-comun',
    nombre: 'Cerceta común',
    nombreCientifico: 'Anas crecca',
    nombreIngles: 'Eurasian Teal',
    orden: 'Anseriformes',
    habitat: ['Humedal'],
    alimentacion: 'Semillas de plantas acuáticas e invertebrados bentónicos filtrados en el barro',
    tamano: '34–38 cm',
    envergadura: '53–59 cm',
    presencia: 'Invernante',
    estadoConservacion: 'LC',
    descripcion: 'El pato más pequeño de Europa. El macho invernante tiene la cabeza castaño con una llamativa mancha verde en ojo rodeada de una línea amarilla. Vuelan en bandos compactos muy ágiles y rápidos.',
    cantoDescripcion: 'El macho emite un reclamo tintineante "crit-crit" muy característico. La hembra produce un suave "quac" corto. El sonido del bando en vuelo es uno de los más reconocibles de los humedales invernales.',
    curiosidad: 'La cerceta es una de las aves más rápidas en vuelo horizontal entre los patos: puede alcanzar 80 km/h en bandos que viran y giran sincronizados como un banco de peces. Este comportamiento los protege de las rapaces que no pueden apuntar a un individuo concreto.',
    colorPrimario: '#008000',
  },

  // ── CICONIIFORMES + ARDEIDAS ──────────────────────────────────────────────────
  {
    id: 'ciguena-blanca',
    nombre: 'Cigüeña blanca',
    nombreCientifico: 'Ciconia ciconia',
    nombreIngles: 'White Stork',
    orden: 'Ciconiiformes',
    habitat: ['Campo'],
    alimentacion: 'Anfibios, roedores, insectos grandes, lombrices y pequeñas serpientes',
    tamano: '95–110 cm',
    envergadura: '195–215 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'Ave inconfundible: blanca con plumas de vuelo negras, pico y patas rojos. Nidifica en campanarios, chimeneas y plataformas artificiales. Los nidos se usan año tras año y pueden superar los 300 kg.',
    cantoDescripcion: 'No posee voz: se comunica chasqueando el pico ("castañeteo") de forma rítmica, especialmente en el nido durante el cortejo y como saludo a la pareja.',
    curiosidad: 'La cigüeña blanca migra desde España hasta el África subsahariana (más de 8.000 km) pero nunca cruza el mar abierto: rodea el Mediterráneo por el Estrecho de Gibraltar o el Bósforo, donde el sol crea corrientes térmicas que le permiten planear sin gastar energía.',
    colorPrimario: '#F5F5F5',
  },
  {
    id: 'garza-real',
    nombre: 'Garza real',
    nombreCientifico: 'Ardea cinerea',
    nombreIngles: 'Grey Heron',
    orden: 'Ciconiiformes',
    habitat: ['Humedal', 'Campo'],
    alimentacion: 'Peces, anfibios, roedores, cangrejos y ocasionalmente aves pequeñas',
    tamano: '84–102 cm',
    envergadura: '155–175 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'La mayor garza de Europa. Gris azulada con frente y vientre blancos, banda negra en la cabeza y largo pico amarillo. Vuela con el cuello replegado en S, lo que la distingue de la cigüeña en vuelo.',
    cantoDescripcion: 'Graznido áspero y gutural "kraank" emitido en vuelo o cuando se alza al ser molestada. Un sonido prehistórico que recuerda a los dinosaurios emplumados que evolutivamente son.',
    curiosidad: 'La garza real puede permanecer inmóvil junto al agua durante horas esperando que un pez pase al alcance de su pico. Esta estrategia de caza de arpón puede ser tan exitosa que la garza captura un pez cada pocos minutos cuando la pesca está buena.',
    colorPrimario: '#778899',
  },
  {
    id: 'espatula-comun',
    nombre: 'Espátula común',
    nombreCientifico: 'Platalea leucorodia',
    nombreIngles: 'Eurasian Spoonbill',
    orden: 'Ciconiiformes',
    habitat: ['Humedal'],
    alimentacion: 'Peces pequeños, crustáceos e invertebrados acuáticos filtrados con su pico',
    tamano: '80–93 cm',
    envergadura: '115–135 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'Ave blanca inconfundible por su largo pico negro con punta amarilla aplanada en forma de espátula. Barre el agua de lado a lado mientras camina para filtrar presas. En plumaje nupcial luce un moño amarillo.',
    cantoDescripcion: 'Prácticamente muda; emite graznidos suaves y roncos junto al nido. En colonias emite chasqueos con el pico similar a la cigüeña.',
    curiosidad: 'La espátula fue exterminada en España a principios del siglo XX y su recuperación comenzó en Doñana en los años 1940. Hoy la población española supera los 3.000 ejemplares. El pico en espátula le permite detectar presas por el tacto mientras mueve la cabeza sumergida, de forma parecida a un detector de metales.',
    colorPrimario: '#FFFACD',
  },

  // ── COLUMBIFORMES ────────────────────────────────────────────────────────────
  {
    id: 'paloma-torcaz',
    nombre: 'Paloma torcaz',
    nombreCientifico: 'Columba palumbus',
    nombreIngles: 'Common Wood Pigeon',
    orden: 'Columbiformes',
    habitat: ['Bosque', 'Campo'],
    alimentacion: 'Granívora; semillas, bellotas, hojas tiernas, frutos y cereales',
    tamano: '40–42 cm',
    envergadura: '68–77 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'La mayor paloma europea. Gris-azulada con una llamativa mancha blanca en el cuello y otra en el ala (visible en vuelo). Pecho rosado. Ha colonizado parques y jardines urbanos en toda España.',
    cantoDescripcion: 'Canto suave y repetitivo "cu-cu-ru-cu, cu-cu-ru-cu" de cinco notas, inconfundible. Muy constante en primavera y verano al amanecer.',
    curiosidad: 'La torcaz protagoniza una de las migraciones de aves más espectaculares de Europa en otoño: millones de individuos procedentes del norte cruzan los Pirineos por el puerto de Lindus (País Vasco) en bandos de miles que oscurecen el cielo.',
    colorPrimario: '#708090',
  },
  {
    id: 'tortola-comun',
    nombre: 'Tórtola común',
    nombreCientifico: 'Streptopelia turtur',
    nombreIngles: 'European Turtle Dove',
    orden: 'Columbiformes',
    habitat: ['Campo', 'Bosque'],
    alimentacion: 'Granívora; semillas silvestres de plantas herbáceas',
    tamano: '26–28 cm',
    envergadura: '47–53 cm',
    presencia: 'Estival',
    estadoConservacion: 'VU',
    descripcion: 'La más pequeña de las palomas europeas. Dorso rojizo-marrón moteado, cuello con parche a rayas negras y blancas, vientre rosado. Llega a España en mayo desde el África subsahariana.',
    cantoDescripcion: 'Arrullo suave y purronante "turr-turr-turr" que da su nombre (tórtola) al ave. Sonido melancólico y evocador del verano rural en el Mediterráneo.',
    curiosidad: 'La tórtola común ha perdido el 80% de su población en Europa en 30 años, convirtiéndola en una de las aves más amenazadas del continente. Las causas son la pérdida de semillas silvestres, la caza en la ruta migratoria y la degradación de sus zonas de invernada en el Sahel.',
    colorPrimario: '#CD853F',
  },

  // ── PICIFORMES ───────────────────────────────────────────────────────────────
  {
    id: 'pito-real',
    nombre: 'Pito real',
    nombreCientifico: 'Picus viridis',
    nombreIngles: 'European Green Woodpecker',
    orden: 'Piciformes',
    habitat: ['Bosque', 'Campo'],
    alimentacion: 'Hormigas y sus larvas; usa su larga lengua pegajosa para extraerlas de los hormigueros',
    tamano: '30–36 cm',
    envergadura: '45–51 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El mayor pájaro carpintero de España. Verde brillante en el dorso, vientre amarillo-verdoso, píleum rojo y una llamativa mancha roja en la rabadilla visible en vuelo. Pasa mucho tiempo en el suelo comiendo hormigas.',
    cantoDescripcion: 'Canto inconfundible: una risa potente y descendente "kle-kle-kle-kle-kle" que suena exactamente como una carcajada humana. Se le conoce popularmente como "el pájaro que se ríe".',
    curiosidad: 'La lengua del pito real mide hasta 10 cm y es tan larga que, cuando no la usa, se enrolla alrededor del cráneo. Está recubierta de una sustancia pegajosa y termina en una punta con pequeños ganchos para atrapar hormigas.',
    colorPrimario: '#228B22',
  },
  {
    id: 'pico-picapinos',
    nombre: 'Pico picapinos',
    nombreCientifico: 'Dendrocopos major',
    nombreIngles: 'Great Spotted Woodpecker',
    orden: 'Piciformes',
    habitat: ['Bosque'],
    alimentacion: 'Insectos bajo la corteza, larvas de xilófagos, semillas y frutos secos',
    tamano: '23–26 cm',
    envergadura: '38–44 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'El carpintero más común de Europa. Blanco y negro con manchas blancas en el ala y rojo en la nuca (macho) o píleum (juvenil). Vientre blanco con subcaudales rojas. Vuelo ondulado característico.',
    cantoDescripcion: 'Canto: un "kik" agudo. Comunicación territorial mediante el tamborileo en madera seca o metálica: un redoble de 15–16 golpes en un segundo.',
    curiosidad: 'El pico picapinos puede golpear la madera a 20 golpes por segundo. Para absorber el impacto, su cerebro está rodeado de hueso esponjoso y tiene músculos hioides que actúan como amortiguador. Cada golpe es el equivalente a que un humano chocara la cabeza contra una pared a 25 km/h.',
    colorPrimario: '#DC143C',
  },

  // ── CORACIIFORMES Y OTROS ──────────────────────────────────────────────────────
  {
    id: 'martin-pescador',
    nombre: 'Martín pescador',
    nombreCientifico: 'Alcedo atthis',
    nombreIngles: 'Common Kingfisher',
    orden: 'Coraciiformes',
    habitat: ['Humedal', 'Bosque'],
    alimentacion: 'Peces pequeños de 2–8 cm, capturados en picados desde posadero fijo',
    tamano: '17–19 cm',
    envergadura: '24–26 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Una de las aves más coloridas de Europa: dorso azul-turquesa metálico iridiscente y pecho naranja-canela. Pequeño y robusto con un enorme pico en proporción a su cuerpo. Frecuenta ríos y arroyos de aguas limpias.',
    cantoDescripcion: 'Reclamo agudo y piante "chii-chii" emitido en vuelo a baja altura sobre el agua. Se le escucha antes de verle. Un silbido agudo y veloz.',
    curiosidad: 'El martín pescador se lanza en picado vertical al agua a más de 40 km/h con los ojos cerrados en el último momento (tiene un tercer párpado transparente que les protege). Calcula instintivamente la refracción del agua para impactar exactamente donde está el pez.',
    colorPrimario: '#00CED1',
  },
  {
    id: 'abubilla',
    nombre: 'Abubilla',
    nombreCientifico: 'Upupa epops',
    nombreIngles: 'Hoopoe',
    orden: 'Coraciiformes',
    habitat: ['Campo', 'Jardín'],
    alimentacion: 'Insectos y larvas del suelo; gusanos, escarabajos y arañas',
    tamano: '26–28 cm',
    envergadura: '42–46 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'Ave inconfundible con su vistosa cresta de plumas naranja-salmón con puntas negras que despliega como un abanico. Cuerpo naranja-salmón, alas y cola negras con barras blancas. Pico largo y curvado.',
    cantoDescripcion: 'Canto onomatopéyico "up-up-up" suave y resonante que da nombre al ave (upupa, hoopoe). Puede escucharse desde larga distancia en primavera. Canta posada o en vuelo.',
    curiosidad: 'La abubilla aparece en el Corán (Sura 27) como mensajera entre el rey Salomón y la reina de Saba. Es el ave nacional de Israel. Su nombre científico (Upupa epops) es uno de los más onomatopéyicos de la zoología: "upupa" imita su canto en latín y "epops" en griego antiguo.',
    colorPrimario: '#FF8C00',
  },
  {
    id: 'abejaruco-europeo',
    nombre: 'Abejaruco europeo',
    nombreCientifico: 'Merops apiaster',
    nombreIngles: 'European Bee-eater',
    orden: 'Coraciiformes',
    habitat: ['Campo'],
    alimentacion: 'Abejas, avispas, abejorros y otros insectos voladores capturados al vuelo',
    tamano: '27–29 cm',
    envergadura: '44–49 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'Una de las aves más coloridas de Europa: verde en cabeza y dorso, azul en alas y cola, amarillo en garganta y hombros, castaño en espalda y frente. Larga cola con dos plumas centrales alargadas.',
    cantoDescripcion: 'Reclamo líquido y rodante "prruuip" o "pruik" emitido frecuentemente en bandos en vuelo. Inconfundible; anuncia su presencia antes de verse.',
    curiosidad: 'Para eliminar el veneno de las abejas y avispas antes de comerlas, el abejaruco las golpea repetidamente contra una rama y las frota para extraer el aguijón. Una pareja puede capturar más de 200 abejas al día durante la cría.',
    colorPrimario: '#32CD32',
  },
  {
    id: 'carraca-europea',
    nombre: 'Carraca europea',
    nombreCientifico: 'Coracias garrulus',
    nombreIngles: 'European Roller',
    orden: 'Coraciiformes',
    habitat: ['Campo', 'Bosque'],
    alimentacion: 'Insectos grandes, lagartijas, ratones jóvenes y ranas',
    tamano: '30–32 cm',
    envergadura: '52–58 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'El ave más azul de Europa: azul-celeste intenso con pecho turquesa y dorso marrón-castaño. En vuelo muestra un patrón de alas espectacular. Nidifica en huecos de árboles viejos y postes de madera.',
    cantoDescripcion: 'Canto áspero y graznante "rack-rack-rack" sin melodía. Más frecuente durante los vuelos de cortejo cuando realiza acrobacias y caídas en picado.',
    curiosidad: 'La carraca debe su nombre a sus volteretas acrobáticas en el cortejo: los machos se lanzan en picado y giran sobre sí mismos ("rollers" en inglés). En España está en declive por la pérdida de árboles viejos con huecos naturales donde anidar.',
    colorPrimario: '#1E90FF',
  },

  // ── APODIFORMES, CHARADRIIFORMES Y GRUIFORMES ──────────────────────────────────
  {
    id: 'vencejo-comun',
    nombre: 'Vencejo común',
    nombreCientifico: 'Apus apus',
    nombreIngles: 'Common Swift',
    orden: 'Apodiformes',
    habitat: ['Urbano'],
    alimentacion: 'Insectívoro aéreo exclusivo; captura todo su alimento en vuelo sin posarse nunca en el suelo',
    tamano: '16–17 cm',
    envergadura: '38–40 cm',
    presencia: 'Estival',
    estadoConservacion: 'LC',
    descripcion: 'El maestro del aire: negro-marrón con garganta blanquecina, alas falciformes muy largas y cola ahorquillada. Es capaz de vivir en vuelo permanente durante meses. Nidifica en grietas de edificios históricos.',
    cantoDescripcion: 'Reclamo agudo y estridente "sriiii" emitido en grupos que vuelan en círculos a gran velocidad al atardecer, llamado "fiesta de los vencejos". El sonido del verano urbano en España.',
    curiosidad: 'El vencejo común puede vivir en vuelo permanente sin posarse hasta 10 meses consecutivos: come, duerme y copula en el aire. Es el ave que más tiempo pasa volando de todas. Sus patas son tan cortas que si cae al suelo plano no puede despegar.',
    colorPrimario: '#2F4F4F',
  },
  {
    id: 'gaviota-patiamarilla',
    nombre: 'Gaviota patiamarilla',
    nombreCientifico: 'Larus michahellis',
    nombreIngles: 'Yellow-legged Gull',
    orden: 'Charadriiformes',
    habitat: ['Costa', 'Urbano'],
    alimentacion: 'Omnívora oportunista; peces, mariscos, carroña, basura y alimentos humanos',
    tamano: '52–58 cm',
    envergadura: '120–140 cm',
    presencia: 'Residente',
    estadoConservacion: 'LC',
    descripcion: 'Gaviota grande con manto gris, partes inferiores blancas, pico amarillo con mancha roja y características patas amarillas que la diferencian de la gaviota argéntea. Ha colonizado ciudades costeras con éxito creciente.',
    cantoDescripcion: 'Graznidos potentes y repetitivos "kiaw-kiaw-kiaow" muy audibles en colonias. También emite llamadas más largas y melodiosas. El sonido de los puertos y costas mediterráneas.',
    curiosidad: 'La gaviota patiamarilla ha expandido su área de distribución hasta el interior de España nidificando en vertederos y tejados urbanos. En ciudades como Bilbao, Barcelona y Madrid hay colonias establecidas. Su capacidad para aprovechar recursos humanos es excepcional.',
    colorPrimario: '#FFD700',
  },
  {
    id: 'grulla-comun',
    nombre: 'Grulla común',
    nombreCientifico: 'Grus grus',
    nombreIngles: 'Common Crane',
    orden: 'Gruiformes',
    habitat: ['Humedal', 'Campo'],
    alimentacion: 'Granos, tubérculos, raíces, insectos y pequeños vertebrados',
    tamano: '96–119 cm',
    envergadura: '180–222 cm',
    presencia: 'Invernante',
    estadoConservacion: 'LC',
    descripcion: 'Ave de aspecto prehistórico: gris ceniza con frente roja y mancha blanca en la mejilla. Vuela con el cuello extendido (a diferencia de la garza). Invernante en España en bandos que pueden superar los 100.000 individuos.',
    cantoDescripcion: 'Trompeteo potente y sonoro "krruu-krruu" audible a kilómetros de distancia. El sonido de las grullas en migración sobre Extremadura es uno de los espectáculos sonoros más memorables de la naturaleza española.',
    curiosidad: 'La grulla común realiza una de las migraciones más espectaculares que se pueden ver en España: cada otoño, entre 100.000 y 200.000 grullas procedentes de Escandinavia y Rusia invernan en Extremadura y Castilla. Las concentraciones en la Laguna de Gallocanta (Aragón) son únicas en Europa.',
    colorPrimario: '#A9A9A9',
  },
];

const HABITATS: HabitatAve[] = ['Urbano', 'Bosque', 'Campo', 'Humedal', 'Costa', 'Montaña', 'Jardín'];
const PRESENCIAS: Presencia[] = ['Residente', 'Estival', 'Invernante', 'Migratoria', 'Ocasional'];
const ORDENES: OrdenAve[] = [
  'Paseriformes', 'Falconiformes', 'Strigiformes', 'Anseriformes',
  'Ciconiiformes', 'Columbiformes', 'Piciformes', 'Coraciiformes',
  'Apodiformes', 'Charadriiformes', 'Gruiformes',
];

const ESTADO_LABEL: Record<EstadoConservacion, string> = {
  LC: 'Preocupación menor',
  NT: 'Casi amenazada',
  VU: 'Vulnerable',
  EN: 'En peligro',
  CR: 'En peligro crítico',
};

const HABITAT_ICONO: Record<HabitatAve, string> = {
  Urbano: '🏙️',
  Bosque: '🌲',
  Campo: '🌾',
  Humedal: '💧',
  Costa: '🌊',
  Montaña: '⛰️',
  Jardín: '🌿',
};

function getBadgePresenciaClass(p: Presencia, s: Record<string, string>): string {
  const map: Record<Presencia, string> = {
    Residente: s.badgeResidente,
    Estival: s.badgeEstival,
    Invernante: s.badgeInvernante,
    Migratoria: s.badgeMigratoria,
    Ocasional: s.badgeOcasional,
  };
  return map[p] ?? s.badgeResidente;
}

function getBadgeEstadoClass(e: EstadoConservacion, s: Record<string, string>): string {
  const map: Record<EstadoConservacion, string> = {
    LC: s.estadoLC,
    NT: s.estadoNT,
    VU: s.estadoVU,
    EN: s.estadoEN,
    CR: s.estadoCR,
  };
  return map[e] ?? s.estadoLC;
}

export default function GuiaAvesComunesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [habitatSelec, setHabitatSelec] = useState<HabitatAve | 'Todos'>('Todos');
  const [presenciaSelec, setPresenciaSelec] = useState<Presencia | 'Todos'>('Todos');
  const [ordenSelec, setOrdenSelec] = useState<OrdenAve | 'Todos'>('Todos');

  const avesFiltradas = useMemo(() => {
    const t = busqueda.toLowerCase().trim();
    return AVES.filter((a) => {
      const matchHabitat = habitatSelec === 'Todos' || a.habitat.includes(habitatSelec);
      const matchPresencia = presenciaSelec === 'Todos' || a.presencia === presenciaSelec;
      const matchOrden = ordenSelec === 'Todos' || a.orden === ordenSelec;
      const matchBusqueda =
        !t ||
        a.nombre.toLowerCase().includes(t) ||
        a.nombreCientifico.toLowerCase().includes(t) ||
        a.nombreIngles.toLowerCase().includes(t) ||
        a.descripcion.toLowerCase().includes(t);
      return matchHabitat && matchPresencia && matchOrden && matchBusqueda;
    });
  }, [busqueda, habitatSelec, presenciaSelec, ordenSelec]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>🐦 Guía de Aves Comunes</h1>
          <p className={styles.heroSubtitle}>
            40 aves de España y Europa: hábitat, alimentación, canto y cuándo verlas
          </p>
        </header>

        <LegalNotice />

        <main className={styles.main}>
          {/* ── FILTROS Y BÚSQUEDA ──────────────────────────────────── */}
          <div className={styles.controles}>
            <input
              type="search"
              placeholder="Buscar por nombre común, científico o inglés..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.buscador}
              aria-label="Buscar ave"
            />

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Hábitat</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por hábitat">
                <button
                  className={`${styles.filtroBtn} ${habitatSelec === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setHabitatSelec('Todos')}
                >
                  Todos
                </button>
                {HABITATS.map((h) => (
                  <button
                    key={h}
                    className={`${styles.filtroBtn} ${habitatSelec === h ? styles.filtroActivo : ''}`}
                    onClick={() => setHabitatSelec(h)}
                  >
                    {HABITAT_ICONO[h]} {h}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Presencia</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por presencia estacional">
                <button
                  className={`${styles.filtroBtn} ${presenciaSelec === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setPresenciaSelec('Todos')}
                >
                  Todas
                </button>
                {PRESENCIAS.map((p) => (
                  <button
                    key={p}
                    className={`${styles.filtroBtn} ${presenciaSelec === p ? styles.filtroActivo : ''}`}
                    onClick={() => setPresenciaSelec(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Orden taxonómico</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por orden taxonómico">
                <button
                  className={`${styles.filtroBtn} ${ordenSelec === 'Todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setOrdenSelec('Todos')}
                >
                  Todos
                </button>
                {ORDENES.map((o) => (
                  <button
                    key={o}
                    className={`${styles.filtroBtn} ${ordenSelec === o ? styles.filtroActivo : ''}`}
                    onClick={() => setOrdenSelec(o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <p className={styles.contador} aria-live="polite">
              {avesFiltradas.length}{' '}
              {avesFiltradas.length === 1 ? 'ave encontrada' : 'aves encontradas'}
            </p>
          </div>

          {/* ── GRID DE AVES ─────────────────────────────────────────── */}
          <div className={styles.grid}>
            {avesFiltradas.map((ave) => (
              <article key={ave.id} className={styles.card}>
                {/* Color decorativo del ave */}
                <div className={styles.cardColorBar} style={{ backgroundColor: ave.colorPrimario }} />

                <div className={styles.cardHeader}>
                  <div
                    className={styles.aveCircle}
                    style={{ backgroundColor: ave.colorPrimario }}
                    aria-hidden="true"
                  >
                    🐦
                  </div>
                  <div className={styles.cardTitulo}>
                    <h2 className={styles.nombre}>{ave.nombre}</h2>
                    <em className={styles.nombreCientifico}>{ave.nombreCientifico}</em>
                    <span className={styles.nombreIngles}>{ave.nombreIngles}</span>
                  </div>
                </div>

                <div className={styles.badges}>
                  <span
                    className={`${styles.badge} ${getBadgePresenciaClass(ave.presencia, styles)}`}
                  >
                    {ave.presencia}
                  </span>
                  <span
                    className={`${styles.badge} ${getBadgeEstadoClass(ave.estadoConservacion, styles)}`}
                    title={ESTADO_LABEL[ave.estadoConservacion]}
                  >
                    {ave.estadoConservacion}
                  </span>
                  <span className={styles.ordenBadge}>{ave.orden}</span>
                </div>

                <div className={styles.habitatChips}>
                  {ave.habitat.map((h) => (
                    <span key={h} className={styles.habitatChip}>
                      {HABITAT_ICONO[h]} {h}
                    </span>
                  ))}
                </div>

                <div className={styles.medidas}>
                  <span>📏 {ave.tamano}</span>
                  <span>🦅 Env. {ave.envergadura}</span>
                </div>

                <p className={styles.descripcion}>{ave.descripcion}</p>

                <div className={styles.infoSection}>
                  <span className={styles.infoLabel}>Alimentación</span>
                  <p className={styles.infoTexto}>{ave.alimentacion}</p>
                </div>

                <div className={styles.infoSection}>
                  <span className={styles.infoLabel}>🎵 Canto</span>
                  <p className={styles.infoTexto}>{ave.cantoDescripcion}</p>
                </div>

                <div className={styles.curiosidadBox}>
                  <span className={styles.curiosidadIcon} aria-hidden="true">💡</span>
                  <p className={styles.curiosidadTexto}>{ave.curiosidad}</p>
                </div>
              </article>
            ))}

            {avesFiltradas.length === 0 && (
              <p className={styles.sinResultados} role="alert">
                No se encontraron aves con esos criterios. Prueba a cambiar los filtros.
              </p>
            )}
          </div>
        </main>

        {/* ── SECCIÓN EDUCATIVA ─────────────────────────────────────── */}
        <EducationalSection
          title="Birdwatching: el arte de observar aves"
          subtitle="Guía completa para iniciarse en la observación de aves en España"
        >
          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>Comparativa de aves representativas</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <caption>6 aves representativas por tamaño, hábitat y conservación</caption>
                <thead>
                  <tr>
                    <th>Ave</th>
                    <th>Tamaño</th>
                    <th>Hábitat principal</th>
                    <th>Presencia</th>
                    <th>Estado IUCN</th>
                    <th>Dificultad de ver</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Petirrojo</strong></td>
                    <td>14 cm</td>
                    <td>Jardín, bosque</td>
                    <td>Residente</td>
                    <td>LC</td>
                    <td>Muy fácil</td>
                  </tr>
                  <tr>
                    <td><strong>Cernícalo vulgar</strong></td>
                    <td>32–35 cm</td>
                    <td>Campo, carreteras</td>
                    <td>Residente</td>
                    <td>LC</td>
                    <td>Fácil</td>
                  </tr>
                  <tr>
                    <td><strong>Martín pescador</strong></td>
                    <td>17–19 cm</td>
                    <td>Ríos, arroyos</td>
                    <td>Residente</td>
                    <td>LC</td>
                    <td>Moderada</td>
                  </tr>
                  <tr>
                    <td><strong>Búho real</strong></td>
                    <td>60–75 cm</td>
                    <td>Montaña, roquedos</td>
                    <td>Residente</td>
                    <td>LC</td>
                    <td>Difícil (nocturno)</td>
                  </tr>
                  <tr>
                    <td><strong>Grulla común</strong></td>
                    <td>96–119 cm</td>
                    <td>Humedales, cultivos</td>
                    <td>Invernante</td>
                    <td>LC</td>
                    <td>Fácil (otoño-invierno)</td>
                  </tr>
                  <tr>
                    <td><strong>Tórtola común</strong></td>
                    <td>26–28 cm</td>
                    <td>Campo, bosque</td>
                    <td>Estival</td>
                    <td>VU</td>
                    <td>Moderada (en declive)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>Perfiles de observadores</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <strong>🌳 Observador principiante</strong>
                <p>
                  Empieza por las aves de jardín y parque: gorrión, petirrojo, mirlo, carbonero y
                  herrerillo. Son fáciles de ver y muy tolerantes con los humanos. Un comedero con
                  semillas en tu balcón puede convertirse en tu primer punto de observación.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <strong>📷 Fotógrafo de naturaleza</strong>
                <p>
                  Las rapaces en vuelo (ratonero, cernícalo, halcón peregrino) y las aves coloridas
                  (martín pescador, abejaruco, abubilla, carraca) son los objetivos más buscados.
                  Las horas doradas al amanecer y al atardecer ofrecen la mejor luz y mayor actividad.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <strong>🧒 Niño en el parque</strong>
                <p>
                  El ánade real en el estanque, las urracas en el cesped y las palomas torcaces
                  en los árboles son perfectas para iniciarse. Llevar pan no es ideal (perjudica
                  a las aves); mejor llevar semillas específicas para aves de parque.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <strong>🏡 Persona con jardín</strong>
                <p>
                  Un comedero con girasol atrae jilgueros, verderones y pinzones. Una caja nido
                  puede alojar carboneros o herrerillos. Un bebedero con agua limpia atrae prácticamente
                  a cualquier especie del vecindario, especialmente en verano.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>Preguntas frecuentes</h2>
            <ul className={styles.faqList}>
              <li className={styles.faqItem}>
                <strong>¿Cómo identificar un ave sin verla?</strong>
                <p>
                  El canto es la clave. Aplicaciones como Merlin Bird ID (Cornell Lab) y Xeno-canto
                  permiten identificar aves por su canto grabado con el móvil. Con práctica,
                  el oído es más eficiente que los prismáticos en muchos hábitats.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Qué aves son indicadoras de salud ambiental?</strong>
                <p>
                  El martín pescador indica ríos limpios con peces. La tórtola común indica
                  paisajes agrícolas tradicionales con semillas silvestres. La golondrina indica
                  abundancia de insectos. El descenso de estas especies es una señal de alarma
                  sobre el estado del ecosistema.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Cuándo migran las aves en España?</strong>
                <p>
                  Las aves estivales (golondrinas, vencejos, abejarucos) llegan en abril-mayo
                  y parten en agosto-septiembre. Las invernantes (grullas, cercetas) llegan en
                  octubre-noviembre y se marchan en febrero-marzo. Las migraciones de primavera
                  son más silenciosas; las de otoño, más espectaculares en número.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Qué prismáticos necesito para empezar?</strong>
                <p>
                  Para principiantes, unos prismáticos 8x42 son el estándar ideal: suficiente
                  aumento para aves medianas y gran campo visual. Marcas de entrada como Nikon
                  Prostaff o Celestron Trailseeker ofrecen buena relación calidad-precio.
                  Evita aumentos superiores a 10x sin trípode.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Qué hacer si encuentro un ave herida?</strong>
                <p>
                  No la manipules sin guantes. Llama al teléfono de tu comunidad autónoma para
                  fauna silvestre o contacta con el centro de recuperación más cercano. Muchos
                  pájaros jóvenes que parecen abandonados en el suelo están aprendiendo a volar
                  y sus padres les vigilan de cerca.
                </p>
              </li>
              <li className={styles.faqItem}>
                <strong>¿Puedo instalar una caja nido en mi jardín?</strong>
                <p>
                  Sí, y es una de las mejores contribuciones para la conservación. Las cajas nido
                  con agujero de 28–32 mm atraen a herrerillos y carboneros. Las más grandes
                  (45 mm) pueden alojar estorninos. Colócala a 2–4 metros de altura, orientada
                  al norte o este para evitar el sol directo.
                </p>
              </li>
            </ul>
          </section>

          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>Cómo iniciarse en el birdwatching</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <strong>Empieza en casa y en el barrio</strong>
                  <p>
                    Antes de ir al campo, aprende a identificar las 5–10 aves más comunes de tu
                    entorno inmediato. El gorrión, el mirlo, el petirrojo, la paloma torcaz y
                    la urraca son un buen punto de partida. Observar con detalle lo cotidiano
                    entrena el ojo y el oído.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <strong>Hazte con unos prismáticos básicos</strong>
                  <p>
                    No es imprescindible gastar mucho: unos prismáticos 8x42 de 50–100€ te
                    permitirán ver detalles que a simple vista son imposibles. Aprende a localizar
                    el ave primero con los ojos y luego llevar los prismáticos: al revés es
                    frustrante y el ave habrá volado.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <strong>Instala Merlin Bird ID en tu móvil</strong>
                  <p>
                    Esta aplicación gratuita del Cornell Lab puede identificar aves por su canto
                    en tiempo real. También tiene una guía visual con filtros por tamaño, color y
                    comportamiento. Es la herramienta más poderosa que existe para principiantes,
                    completamente gratuita y sin publicidad.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <strong>Visita hábitats variados en buena temporada</strong>
                  <p>
                    Cada hábitat tiene sus especialidades: los humedales en otoño-invierno para
                    patos y garzas; los pinares en primavera para picos y currucas; los acantilados
                    costeros en verano para gaviotas y alcas. La biodiversidad máxima se da en
                    ecotonos (bordes entre hábitats diferentes).
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div className={styles.stepContent}>
                  <strong>Apunta y registra tus observaciones</strong>
                  <p>
                    Lleva un cuaderno de campo o usa eBird (plataforma de Cornell Lab) para
                    registrar tus avistamientos. Cada observación contribuye a la ciencia ciudadana
                    global. Indica fecha, hora, lugar, número de individuos y comportamiento.
                    Con el tiempo, tu lista de aves vistas se convierte en un patrimonio personal.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className={styles.eduSection}>
            <h2 className={styles.eduTitle}>Mejores prácticas del birdwatcher</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌅</span>
                <p>
                  <strong>La hora dorada.</strong> Las aves son más activas al amanecer (primera
                  hora de luz) y al atardecer. En verano, salir a las 6 AM puede multiplicar
                  por 3 el número de aves observadas respecto a las 10 AM.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🤫</span>
                <p>
                  <strong>Silencio y paciencia.</strong> El birdwatcher que se mueve lentamente
                  y se detiene frecuentemente ve el doble que el que camina a paso normal.
                  Hablar en voz baja o no hablar duplica los avistamientos.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">👕</span>
                <p>
                  <strong>Ropa adecuada.</strong> Los colores apagados (verde, marrón, gris)
                  no asustan a las aves. Evita ropa brillante o de colores primarios. Un sombrero
                  mejora la visibilidad al reducir el deslumbramiento del cielo.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌿</span>
                <p>
                  <strong>Respeta los nidos.</strong> Nunca te acerques a un nido activo:
                  el estrés puede hacer que los padres abandonen los huevos o los pollos.
                  La fotografía de nidos con pollos requiere distancia y teleobjetivo.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔊</span>
                <p>
                  <strong>No abuses del reclamo.</strong> Reproducir cantos grabados para
                  atraer aves estresa al individuo, que cree tener un intruso en su territorio.
                  Úsalo con moderación y nunca en época reproductora.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes del principiante en observación de aves</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Intentar identificar el ave antes de observarla bien:</strong> el
                  buen hábito es observar primero (tamaño, silueta, comportamiento, hábitat),
                  luego consultar la guía. Al revés, uno busca confirmar lo que cree y pierde
                  detalles clave que podrían revelar que es otra especie.
                </li>
                <li>
                  <strong>Confiar solo en el color del plumaje:</strong> el mismo plumaje puede
                  parecer diferente según la luz (contraluz, amanecer, mediodía). El tamaño,
                  la silueta, el comportamiento y el hábitat son con frecuencia más diagnósticos
                  que el color exacto.
                </li>
                <li>
                  <strong>Dar pan a los patos y gaviotas:</strong> el pan es como la comida
                  basura para las aves acuáticas: llena sin nutrir y causa deficiencias que
                  producen malformaciones en las alas (ángulo del ala). Mejor ofrecer semillas
                  específicas o lechuga troceada.
                </li>
                <li>
                  <strong>Acercarse demasiado a las rapaces anidando:</strong> el halcón
                  peregrino, el águila real y otras rapaces son especialmente sensibles a las
                  molestias en el nido. Mantén al menos 200 metros de distancia y usa telescopio
                  o teleobjetivo. La foto perfecta no vale la pérdida de una puesta.
                </li>
                <li>
                  <strong>No limpiar los comederos de jardín:</strong> los comederos sucios
                  pueden transmitir trichomonosis (especialmente grave para el verderón),
                  salmonelosis y otras enfermedades. Limpiar con agua caliente y jabón cada
                  dos semanas y dejar secar antes de rellenar.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-aves-comunes')} />
        <ShareCard appName="guia-aves-comunes" />
        <Footer appName="guia-aves-comunes" />
      </div>
    </>
  );
}
