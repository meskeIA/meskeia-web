'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './GuiaMaderas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// --- Tipos ---

type TipoMadera = 'Frondosa' | 'Conífera' | 'Tropical' | 'Exótica' | 'Reconst.';
type UsoMadera =
  | 'Muebles'
  | 'Construcción'
  | 'Suelos'
  | 'Exterior'
  | 'Tornería'
  | 'Instrumentos'
  | 'Náutica'
  | 'Decoración';
type DificultadTrabajo = 'Fácil' | 'Media' | 'Difícil';

interface Madera {
  id: string;
  nombre: string;
  nombreCientifico: string;
  tipo: TipoMadera;
  origen: string;
  dureza: number;
  densidad: number;
  color: string;
  colorHex: string;
  usos: UsoMadera[];
  dificultad: DificultadTrabajo;
  sostenibilidad: 'Alta' | 'Media' | 'Baja';
  descripcion: string;
  curiosidad: string;
}

// --- Datos ---

const MADERAS: Madera[] = [
  // Frondosas europeas/americanas
  {
    id: 'roble',
    nombre: 'Roble',
    nombreCientifico: 'Quercus robur',
    tipo: 'Frondosa',
    origen: 'Europa y América del Norte',
    dureza: 1360,
    densidad: 720,
    color: 'Marrón dorado',
    colorHex: '#8B6914',
    usos: ['Muebles', 'Suelos', 'Construcción'],
    dificultad: 'Difícil',
    sostenibilidad: 'Alta',
    descripcion:
      'Una de las maderas más apreciadas de Europa. Su veta pronunciada y su dureza la hacen ideal para muebles de calidad, parquet y tonelería.',
    curiosidad:
      'Los toneles de roble usados para envejecer vinos y whiskies aportan taninos y aromas únicos a la bebida.',
  },
  {
    id: 'nogal-europeo',
    nombre: 'Nogal europeo',
    nombreCientifico: 'Juglans regia',
    tipo: 'Frondosa',
    origen: 'Europa y Asia central',
    dureza: 1010,
    densidad: 650,
    color: 'Marrón oscuro',
    colorHex: '#5C4033',
    usos: ['Muebles', 'Tornería', 'Decoración'],
    dificultad: 'Difícil',
    sostenibilidad: 'Media',
    descripcion:
      'Madera noble de gran belleza, con vetas onduladas muy características. Se usa en muebles de lujo, culatas de armas y chapas decorativas.',
    curiosidad:
      'La cáscara del nogal contiene juglona, un compuesto que tiñe la madera con un proceso natural milenario.',
  },
  {
    id: 'cerezo-europeo',
    nombre: 'Cerezo europeo',
    nombreCientifico: 'Prunus avium',
    tipo: 'Frondosa',
    origen: 'Europa',
    dureza: 995,
    densidad: 630,
    color: 'Rojizo cálido',
    colorHex: '#A0522D',
    usos: ['Muebles', 'Tornería', 'Decoración'],
    dificultad: 'Media',
    sostenibilidad: 'Media',
    descripcion:
      'Madera de color rojizo que oscurece con la luz. Su textura fina y uniforme la hace muy agradable al tacto y fácil de trabajar.',
    curiosidad:
      'El cerezo europeo gana belleza con los años: con la exposición a la luz solar su color se intensifica considerablemente.',
  },
  {
    id: 'haya',
    nombre: 'Haya',
    nombreCientifico: 'Fagus sylvatica',
    tipo: 'Frondosa',
    origen: 'Europa central',
    dureza: 1300,
    densidad: 720,
    color: 'Beige rosado',
    colorHex: '#D2B48C',
    usos: ['Muebles', 'Instrumentos', 'Suelos'],
    dificultad: 'Media',
    sostenibilidad: 'Alta',
    descripcion:
      'Madera de grano fino y color uniforme, muy utilizada en la industria del mueble. Excelente para tornería y piezas curvas.',
    curiosidad:
      'La haya es la madera preferida para mangos de herramientas y también para fabricar los típicos bloques de madera Montessori.',
  },
  {
    id: 'fresno',
    nombre: 'Fresno',
    nombreCientifico: 'Fraxinus excelsior',
    tipo: 'Frondosa',
    origen: 'Europa',
    dureza: 1320,
    densidad: 700,
    color: 'Beige claro',
    colorHex: '#F5DEB3',
    usos: ['Muebles', 'Instrumentos', 'Suelos'],
    dificultad: 'Media',
    sostenibilidad: 'Media',
    descripcion:
      'Madera resistente y elástica, muy apreciada para mangos de herramientas, bates y artículos deportivos. Su veta abierta le da un aspecto muy atractivo.',
    curiosidad:
      'El fresno es la madera tradicional de los mangos de hacha y pala por su capacidad de absorber impactos sin romperse.',
  },
  {
    id: 'arce',
    nombre: 'Arce',
    nombreCientifico: 'Acer saccharum',
    tipo: 'Frondosa',
    origen: 'América del Norte',
    dureza: 1450,
    densidad: 705,
    color: 'Crema dorado',
    colorHex: '#FAEBD7',
    usos: ['Suelos', 'Instrumentos', 'Muebles'],
    dificultad: 'Media',
    sostenibilidad: 'Alta',
    descripcion:
      'El arce duro es la madera estándar para los suelos de pistas de baloncesto y bolos. Su textura cerrada le da un acabado extraordinariamente liso.',
    curiosidad:
      'Los famosos violines Stradivarius utilizaban arce en el fondo y los laterales. De este árbol también se extrae el jarabe de arce.',
  },
  {
    id: 'olmo',
    nombre: 'Olmo',
    nombreCientifico: 'Ulmus minor',
    tipo: 'Frondosa',
    origen: 'Europa y Asia',
    dureza: 830,
    densidad: 560,
    color: 'Marrón medio',
    colorHex: '#8B6914',
    usos: ['Muebles', 'Tornería', 'Decoración'],
    dificultad: 'Difícil',
    sostenibilidad: 'Baja',
    descripcion:
      'Madera de veta entrelazada muy bella, difícil de trabajar pero con resultados espectaculares. Casi desapareció en Europa por la grafiosis.',
    curiosidad:
      'La madera de olmo no se pudre en contacto permanente con el agua, por lo que se usó históricamente para ruedas de molino y canalizaciones.',
  },
  {
    id: 'castano',
    nombre: 'Castaño',
    nombreCientifico: 'Castanea sativa',
    tipo: 'Frondosa',
    origen: 'Europa meridional',
    dureza: 540,
    densidad: 560,
    color: 'Marrón cálido',
    colorHex: '#A0522D',
    usos: ['Muebles', 'Construcción', 'Exterior'],
    dificultad: 'Fácil',
    sostenibilidad: 'Alta',
    descripcion:
      'Madera con alta resistencia a la intemperie y a los hongos por su contenido en taninos. Muy usada en estructuras exteriores y vallas.',
    curiosidad:
      'El castaño es tan rico en taninos como el roble, lo que lo hace naturalmente resistente a insectos y hongos sin tratamientos químicos.',
  },
  {
    id: 'alamo',
    nombre: 'Álamo',
    nombreCientifico: 'Populus alba',
    tipo: 'Frondosa',
    origen: 'Europa y América',
    dureza: 540,
    densidad: 450,
    color: 'Blanco cremoso',
    colorHex: '#FFFACD',
    usos: ['Muebles', 'Construcción', 'Decoración'],
    dificultad: 'Fácil',
    sostenibilidad: 'Alta',
    descripcion:
      'Madera blanda y ligera, base del contrachapado industrial. También se usa para embalajes, cerillas y pasta de papel.',
    curiosidad:
      'El álamo es uno de los árboles de crecimiento más rápido en Europa, capaz de alcanzar 20 metros en solo 15 años.',
  },
  {
    id: 'abedul',
    nombre: 'Abedul',
    nombreCientifico: 'Betula pendula',
    tipo: 'Frondosa',
    origen: 'Europa y Asia septentrional',
    dureza: 1260,
    densidad: 650,
    color: 'Amarillo pálido',
    colorHex: '#FAFAD2',
    usos: ['Muebles', 'Tornería', 'Decoración'],
    dificultad: 'Media',
    sostenibilidad: 'Alta',
    descripcion:
      'Madera clara y de grano fino, muy apreciada en los países nórdicos para muebles minimalistas. Base del famoso contrachapado báltico.',
    curiosidad:
      'IKEA construyó su reputación en parte sobre el abedul y el contrachapado de abedul finlandés, símbolo del diseño escandinavo.',
  },
  {
    id: 'nogal-americano',
    nombre: 'Nogal americano',
    nombreCientifico: 'Juglans nigra',
    tipo: 'Frondosa',
    origen: 'América del Norte',
    dureza: 1010,
    densidad: 610,
    color: 'Marrón chocolate',
    colorHex: '#3E1C00',
    usos: ['Muebles', 'Suelos', 'Decoración'],
    dificultad: 'Difícil',
    sostenibilidad: 'Media',
    descripcion:
      'Madera de color muy oscuro y grano recto, considerada símbolo de estatus en Estados Unidos. Muy usada en muebles de lujo y chapas.',
    curiosidad:
      'El nogal negro americano es una de las maderas más caras de América del Norte: un árbol adulto puede valer más de 10.000 dólares.',
  },
  {
    id: 'cerezo-americano',
    nombre: 'Cerezo americano',
    nombreCientifico: 'Prunus serotina',
    tipo: 'Frondosa',
    origen: 'América del Norte',
    dureza: 950,
    densidad: 580,
    color: 'Rojo suave',
    colorHex: '#C1440E',
    usos: ['Muebles', 'Suelos', 'Decoración'],
    dificultad: 'Media',
    sostenibilidad: 'Alta',
    descripcion:
      'Madera rojiza de gran atractivo que se oscurece con el tiempo. Muy valorada en ebanistería fina y muebles de estilo clásico americano.',
    curiosidad:
      'El cerezo americano era la madera favorita de los carpinteros coloniales en EE.UU. por su facilidad de trabajo y belleza natural.',
  },
  // Coníferas
  {
    id: 'pino-silvestre',
    nombre: 'Pino silvestre',
    nombreCientifico: 'Pinus sylvestris',
    tipo: 'Conífera',
    origen: 'Europa y Asia',
    dureza: 870,
    densidad: 520,
    color: 'Amarillo miel',
    colorHex: '#DAA520',
    usos: ['Construcción', 'Muebles', 'Suelos'],
    dificultad: 'Fácil',
    sostenibilidad: 'Alta',
    descripcion:
      'La conífera más común en España. Madera resinosa de uso universal en construcción, carpintería y fabricación de muebles económicos.',
    curiosidad:
      'La resina del pino silvestre fue durante siglos la fuente de trementina y colofonia, esenciales en barnices y producción de instrumentos de cuerda.',
  },
  {
    id: 'pino-radiata',
    nombre: 'Pino radiata',
    nombreCientifico: 'Pinus radiata',
    tipo: 'Conífera',
    origen: 'California (cultivado mundialmente)',
    dureza: 710,
    densidad: 490,
    color: 'Amarillo pálido',
    colorHex: '#F5DEB3',
    usos: ['Construcción', 'Muebles', 'Suelos'],
    dificultad: 'Fácil',
    sostenibilidad: 'Alta',
    descripcion:
      'La madera de reforestación más plantada del mundo. Crece muy rápido y es base de la industria de la madera en España y Latinoamérica.',
    curiosidad:
      'Nueva Zelanda y Chile son los mayores productores mundiales de pino radiata, a pesar de que la especie es originaria del sur de California.',
  },
  {
    id: 'abeto-rojo',
    nombre: 'Abeto rojo',
    nombreCientifico: 'Picea abies',
    tipo: 'Conífera',
    origen: 'Europa central y septentrional',
    dureza: 510,
    densidad: 450,
    color: 'Blanco crema',
    colorHex: '#FAFAD2',
    usos: ['Construcción', 'Instrumentos', 'Muebles'],
    dificultad: 'Fácil',
    sostenibilidad: 'Alta',
    descripcion:
      'Madera ligera, resistente y con excelentes propiedades acústicas. La preferida para tapas de guitarras y violines de alta gama.',
    curiosidad:
      'Antonio Stradivari usaba abeto rojo de los Alpes para las tapas de sus legendarios violines. La madera de árboles en zonas frías tiene fibras más densas.',
  },
  {
    id: 'cedro-rojo',
    nombre: 'Cedro rojo',
    nombreCientifico: 'Thuja plicata',
    tipo: 'Conífera',
    origen: 'Costa Pacífica de América del Norte',
    dureza: 350,
    densidad: 370,
    color: 'Rojizo oscuro',
    colorHex: '#8B0000',
    usos: ['Exterior', 'Construcción', 'Decoración'],
    dificultad: 'Fácil',
    sostenibilidad: 'Media',
    descripcion:
      'Madera muy ligera y extremadamente resistente a la intemperie sin tratamientos. La opción clásica para revestimientos de fachada y decks.',
    curiosidad:
      'Los pueblos nativos de la Costa Noroeste americana talaban cedros gigantes para hacer canoas que podían transportar hasta 30 personas.',
  },
  {
    id: 'alerce',
    nombre: 'Alerce',
    nombreCientifico: 'Larix decidua',
    tipo: 'Conífera',
    origen: 'Alpes europeos',
    dureza: 1040,
    densidad: 590,
    color: 'Naranja dorado',
    colorHex: '#CD853F',
    usos: ['Construcción', 'Exterior', 'Suelos'],
    dificultad: 'Media',
    sostenibilidad: 'Alta',
    descripcion:
      'La conífera más dura de Europa. Su alta densidad de resina la hace naturalmente resistente a hongos e insectos, ideal para estructuras exteriores.',
    curiosidad:
      'Venecia está literalmente construida sobre millones de pilotes de alerce sumergidos en el fango de la laguna, que se ha ido petrificando con el tiempo.',
  },
  {
    id: 'douglas',
    nombre: 'Douglas',
    nombreCientifico: 'Pseudotsuga menziesii',
    tipo: 'Conífera',
    origen: 'América del Norte',
    dureza: 710,
    densidad: 530,
    color: 'Amarillo rosado',
    colorHex: '#DEB887',
    usos: ['Construcción', 'Muebles', 'Exterior'],
    dificultad: 'Fácil',
    sostenibilidad: 'Alta',
    descripcion:
      'Una de las maderas de construcción más valoradas del mundo por su excelente relación resistencia-peso. Muy usada en estructuras, vigas y terrazas.',
    curiosidad:
      'El árbol más alto del mundo registrado es un ejemplar de Pseudotsuga en la costa de California que superó los 100 metros de altura.',
  },
  // Tropicales
  {
    id: 'teca',
    nombre: 'Teca',
    nombreCientifico: 'Tectona grandis',
    tipo: 'Tropical',
    origen: 'Asia tropical (cultivada globalmente)',
    dureza: 1155,
    densidad: 630,
    color: 'Marrón dorado',
    colorHex: '#8B6914',
    usos: ['Náutica', 'Exterior', 'Muebles'],
    dificultad: 'Media',
    sostenibilidad: 'Media',
    descripcion:
      'La reina de las maderas para exterior y uso náutico. Sus aceites naturales le confieren una resistencia excepcional a la intemperie y al agua.',
    curiosidad:
      'La teca es tan resistente que barcos del siglo XIX con cubierta de teca original todavía conservan la madera en perfecto estado.',
  },
  {
    id: 'caoba',
    nombre: 'Caoba',
    nombreCientifico: 'Swietenia macrophylla',
    tipo: 'Tropical',
    origen: 'América Central y del Sur',
    dureza: 800,
    densidad: 540,
    color: 'Rojo caoba',
    colorHex: '#C04000',
    usos: ['Muebles', 'Decoración', 'Instrumentos'],
    dificultad: 'Media',
    sostenibilidad: 'Baja',
    descripcion:
      'Madera icónica en ebanistería de lujo por su color rojizo profundo y su estabilidad dimensional. Muy demandada en los siglos XVIII y XIX.',
    curiosidad:
      'La caoba fue tan explotada que está en el Apéndice II de CITES, lo que significa que su comercio internacional está estrictamente regulado.',
  },
  {
    id: 'ebano',
    nombre: 'Ébano',
    nombreCientifico: 'Diospyros crassiflora',
    tipo: 'Tropical',
    origen: 'África central',
    dureza: 3220,
    densidad: 1050,
    color: 'Negro azabache',
    colorHex: '#1C1C1C',
    usos: ['Instrumentos', 'Tornería', 'Decoración'],
    dificultad: 'Difícil',
    sostenibilidad: 'Baja',
    descripcion:
      'Una de las maderas más densas y duras del mundo. Su color negro uniforme la convierte en la opción por excelencia para teclados de piano y diapasones.',
    curiosidad:
      'El ébano es tan denso que se hunde en el agua. Crece muy lentamente: puede tardar 60 años en alcanzar un diámetro explotable de 20 cm.',
  },
  {
    id: 'palisandro',
    nombre: 'Palisandro',
    nombreCientifico: 'Dalbergia latifolia',
    tipo: 'Tropical',
    origen: 'India y Brasil',
    dureza: 2440,
    densidad: 850,
    color: 'Marrón violáceo',
    colorHex: '#8B008B',
    usos: ['Instrumentos', 'Muebles', 'Tornería'],
    dificultad: 'Difícil',
    sostenibilidad: 'Baja',
    descripcion:
      'Madera de vetas oscuras sobre fondo rojizo-violáceo, muy apreciada para guitarras, muebles de lujo y objetos de ebanistería fina.',
    curiosidad:
      'El palisandro de Brasil (Dalbergia nigra) está en el Apéndice I de CITES, el nivel de protección máximo, y su corte está completamente prohibido.',
  },
  {
    id: 'iroko',
    nombre: 'Iroko',
    nombreCientifico: 'Milicia excelsa',
    tipo: 'Tropical',
    origen: 'África occidental',
    dureza: 1260,
    densidad: 660,
    color: 'Amarillo marrón',
    colorHex: '#D2691E',
    usos: ['Exterior', 'Muebles', 'Suelos'],
    dificultad: 'Media',
    sostenibilidad: 'Media',
    descripcion:
      'Considerada la teca africana por su resistencia a la intemperie. Alternativa más sostenible a la teca asiática para decks y mobiliario exterior.',
    curiosidad:
      'En algunos países del África occidental el iroko es considerado un árbol sagrado donde viven espíritus, y su tala está acompañada de rituales.',
  },
  {
    id: 'sapele',
    nombre: 'Sapele',
    nombreCientifico: 'Entandrophragma cylindricum',
    tipo: 'Tropical',
    origen: 'África tropical',
    dureza: 1410,
    densidad: 680,
    color: 'Rojo marrón',
    colorHex: '#8B2500',
    usos: ['Muebles', 'Decoración', 'Instrumentos'],
    dificultad: 'Media',
    sostenibilidad: 'Media',
    descripcion:
      'Madera de veta entrelazada que crea un efecto óptico "jaspeado" muy decorativo cuando se corta en chapa. Parecida a la caoba pero más asequible.',
    curiosidad:
      'El sapele tiene una propiedad óptica única: sus fibras entrelazadas crean un efecto 3D de rayas que se mueve con la luz, muy apreciado en chapas.',
  },
  {
    id: 'wengue',
    nombre: 'Wengué',
    nombreCientifico: 'Millettia laurentii',
    tipo: 'Tropical',
    origen: 'África central',
    dureza: 1630,
    densidad: 880,
    color: 'Marrón muy oscuro',
    colorHex: '#4A2800',
    usos: ['Muebles', 'Suelos', 'Decoración'],
    dificultad: 'Difícil',
    sostenibilidad: 'Baja',
    descripcion:
      'Madera de espectacular contraste entre vetas oscuras y claras, muy usada en diseño de interiores contemporáneo. Propensa a producir astillas.',
    curiosidad:
      'El wengué fue la madera de moda en el diseño de interiores de los años 2000, pero su sobreexplotación lo ha llevado a la lista de especies vulnerables.',
  },
  {
    id: 'bambu',
    nombre: 'Bambú (laminado)',
    nombreCientifico: 'Phyllostachys edulis',
    tipo: 'Tropical',
    origen: 'Asia oriental',
    dureza: 1380,
    densidad: 620,
    color: 'Amarillo claro',
    colorHex: '#EEE8AA',
    usos: ['Suelos', 'Muebles', 'Decoración'],
    dificultad: 'Fácil',
    sostenibilidad: 'Alta',
    descripcion:
      'Técnicamente una gramínea, no una madera. En formato laminado alcanza durezas superiores al roble con un crecimiento de solo 5 años.',
    curiosidad:
      'El bambú es la planta de crecimiento más rápido del mundo: algunas especies pueden crecer 1 metro en un solo día en condiciones óptimas.',
  },
  {
    id: 'jatoba',
    nombre: 'Jatoba',
    nombreCientifico: 'Hymenaea courbaril',
    tipo: 'Tropical',
    origen: 'América Central y del Sur',
    dureza: 2350,
    densidad: 900,
    color: 'Rojo anaranjado',
    colorHex: '#CD5C5C',
    usos: ['Suelos', 'Muebles', 'Exterior'],
    dificultad: 'Difícil',
    sostenibilidad: 'Media',
    descripcion:
      'También llamada "cerezo brasileño", aunque no guarda relación. Una de las maderas más duras disponibles para suelos, con excelente resistencia al desgaste.',
    curiosidad:
      'La resina fósil del jatoba (copal americano) forma parte del ámbar sudamericano, en el que se han encontrado insectos de millones de años de antigüedad.',
  },
  {
    id: 'merbau',
    nombre: 'Merbau',
    nombreCientifico: 'Intsia bijuga',
    tipo: 'Tropical',
    origen: 'Asia-Pacífico',
    dureza: 1925,
    densidad: 810,
    color: 'Marrón rojizo',
    colorHex: '#8B4513',
    usos: ['Suelos', 'Exterior', 'Muebles'],
    dificultad: 'Media',
    sostenibilidad: 'Baja',
    descripcion:
      'Madera muy popular en Europa para suelos y decks exteriores por su dureza y resistencia natural. Lamentablemente en riesgo por la sobreexplotación.',
    curiosidad:
      'El merbau contiene taninos amarillos que en contacto con el agua producen manchas en suelos y terrazas adyacentes las primeras semanas.',
  },
  {
    id: 'padauk',
    nombre: 'Padauk',
    nombreCientifico: 'Pterocarpus soyauxii',
    tipo: 'Tropical',
    origen: 'África central y occidental',
    dureza: 1725,
    densidad: 800,
    color: 'Naranja vivo',
    colorHex: '#FF6600',
    usos: ['Tornería', 'Decoración', 'Instrumentos'],
    dificultad: 'Media',
    sostenibilidad: 'Media',
    descripcion:
      'Destaca por su color naranja intenso, uno de los más llamativos del reino vegetal. Se usa para piezas decorativas, incrustaciones y artesanía.',
    curiosidad:
      'El padauk recién cortado es de un naranja brillante casi fosforescente, pero con el tiempo la exposición a la luz lo oxida hasta un marrón rojizo.',
  },
  // Exóticas y especiales
  {
    id: 'lignum-vitae',
    nombre: 'Lignum Vitae',
    nombreCientifico: 'Guaiacum officinale',
    tipo: 'Exótica',
    origen: 'Caribe y América Central',
    dureza: 4500,
    densidad: 1280,
    color: 'Verde marrón',
    colorHex: '#6B8E23',
    usos: ['Náutica', 'Tornería', 'Construcción'],
    dificultad: 'Difícil',
    sostenibilidad: 'Baja',
    descripcion:
      'La madera más dura y densa del mundo. Sus aceites naturales le confieren propiedades autolubricantes únicas, usada en ejes de hélices de submarinos.',
    curiosidad:
      'La Marina Real Británica usó ejes de lignum vitae en los cascos de barcos durante siglos porque se auto-lubrican con agua salada sin mantenimiento.',
  },
  {
    id: 'purpleheart',
    nombre: 'Purpleheart',
    nombreCientifico: 'Peltogyne spp.',
    tipo: 'Exótica',
    origen: 'América Central y del Sur',
    dureza: 2520,
    densidad: 860,
    color: 'Morado intenso',
    colorHex: '#800080',
    usos: ['Decoración', 'Tornería', 'Muebles'],
    dificultad: 'Difícil',
    sostenibilidad: 'Media',
    descripcion:
      'Una de las pocas maderas genuinamente púrpuras de la naturaleza. Su color vibrante la hace muy apreciada en artesanía, incrustaciones y piezas únicas.',
    curiosidad:
      'El purpleheart cuando recién cortado es gris-marrón y solo desarrolla su color morado intenso al oxidarse con el aire durante unas horas.',
  },
  {
    id: 'azobe',
    nombre: 'Azobe',
    nombreCientifico: 'Lophira alata',
    tipo: 'Exótica',
    origen: 'África occidental',
    dureza: 3000,
    densidad: 1060,
    color: 'Rojizo marrón',
    colorHex: '#A52A2A',
    usos: ['Construcción', 'Exterior', 'Náutica'],
    dificultad: 'Difícil',
    sostenibilidad: 'Baja',
    descripcion:
      'Madera de densidad y dureza extremas, casi impenetrable. Usada en cimientos de muelles, pilotes y construcción portuaria de alta exigencia.',
    curiosidad:
      'El azobe es tan duro que los clavos se doblan al intentar clavarlo directamente. Es imprescindible pretaladrar, y los fresas se gastan muy rápido.',
  },
  // Reconstituidas
  {
    id: 'contrachapado',
    nombre: 'Contrachapado',
    nombreCientifico: 'Múltiples especies',
    tipo: 'Reconst.',
    origen: 'Fabricación industrial global',
    dureza: 750,
    densidad: 650,
    color: 'Beige',
    colorHex: '#F5F5DC',
    usos: ['Construcción', 'Muebles', 'Decoración'],
    dificultad: 'Fácil',
    sostenibilidad: 'Media',
    descripcion:
      'Tableros de capas cruzadas de madera que ofrecen estabilidad dimensional superior a la madera maciza. Base de la construcción y el mueble moderno.',
    curiosidad:
      'El contrachapado marino de aviación, usado en los míticos De Havilland Mosquito de la WWII, soportaba temperaturas extremas mejor que el metal.',
  },
  {
    id: 'mdf',
    nombre: 'DM (MDF)',
    nombreCientifico: 'Fibra de madera',
    tipo: 'Reconst.',
    origen: 'Fabricación industrial global',
    dureza: 700,
    densidad: 750,
    color: 'Gris beige',
    colorHex: '#D3D3D3',
    usos: ['Muebles', 'Decoración', 'Construcción'],
    dificultad: 'Fácil',
    sostenibilidad: 'Media',
    descripcion:
      'Tablero de fibra de densidad media, con superficie perfectamente uniforme. Ideal para lacado y chapeado, base de la mayoría del mueble de cocina moderno.',
    curiosidad:
      'El MDF genera polvo muy fino al cortarse, más perjudicial para la salud que la madera maciza. Es imprescindible usar máscara FFP2 al trabajarlo.',
  },
  {
    id: 'osb',
    nombre: 'OSB',
    nombreCientifico: 'Partículas orientadas',
    tipo: 'Reconst.',
    origen: 'Fabricación industrial global',
    dureza: 600,
    densidad: 640,
    color: 'Marrón paja',
    colorHex: '#D2B48C',
    usos: ['Construcción', 'Suelos', 'Decoración'],
    dificultad: 'Fácil',
    sostenibilidad: 'Media',
    descripcion:
      'Tablero de partículas de madera orientadas en capas cruzadas. Más barato que el contrachapado con buena resistencia estructural para construcción en seco.',
    curiosidad:
      'El OSB se ha convertido en material de diseño: muchos locales de moda lo usan visto sin cubrir por su aspecto industrial y su bajo coste.',
  },
];

// --- Constantes UI ---

const TIPO_COLORES: Record<TipoMadera, string> = {
  Frondosa: '#6D4C41',
  Conífera: '#388E3C',
  Tropical: '#E65100',
  Exótica: '#6A1B9A',
  'Reconst.': '#546E7A',
};

const DIFICULTAD_COLORES: Record<DificultadTrabajo, string> = {
  Fácil: '#2E7D32',
  Media: '#E65100',
  Difícil: '#B71C1C',
};

const SOSTENIBILIDAD_COLORES: Record<'Alta' | 'Media' | 'Baja', string> = {
  Alta: '#2E7D32',
  Media: '#F57F17',
  Baja: '#B71C1C',
};

const TIPOS: TipoMadera[] = ['Frondosa', 'Conífera', 'Tropical', 'Exótica', 'Reconst.'];
const DIFICULTADES: DificultadTrabajo[] = ['Fácil', 'Media', 'Difícil'];
const SOSTENIBILIDADES = ['Alta', 'Media', 'Baja'] as const;

const JANKA_MAX = 5000;

// --- Componente Principal ---

export default function GuiaMaderasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoMadera | ''>('');
  const [filtroDificultad, setFiltroDificultad] = useState<DificultadTrabajo | ''>('');
  const [filtroSostenibilidad, setFiltroSostenibilidad] = useState<'Alta' | 'Media' | 'Baja' | ''>('');
  const [madElegida, setMadElegida] = useState<Madera | null>(null);

  const maderasFiltradas = useMemo(() => {
    return MADERAS.filter((m) => {
      const coincideBusqueda =
        busqueda === '' ||
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.nombreCientifico.toLowerCase().includes(busqueda.toLowerCase());
      const coincideTipo = filtroTipo === '' || m.tipo === filtroTipo;
      const coincideDificultad = filtroDificultad === '' || m.dificultad === filtroDificultad;
      const coincideSostenibilidad = filtroSostenibilidad === '' || m.sostenibilidad === filtroSostenibilidad;
      return coincideBusqueda && coincideTipo && coincideDificultad && coincideSostenibilidad;
    });
  }, [busqueda, filtroTipo, filtroDificultad, filtroSostenibilidad]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTipo('');
    setFiltroDificultad('');
    setFiltroSostenibilidad('');
  };

  const hayFiltrosActivos = busqueda !== '' || filtroTipo !== '' || filtroDificultad !== '' || filtroSostenibilidad !== '';

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🪵</span> Guía de Maderas</h1>
          <p className={styles.subtitle}>
            Directorio de 35 tipos de madera con dureza Janka, densidad, origen, usos y facilidad de trabajo.
            Para carpintería, construcción y decoración.
          </p>
        </header>

        <LegalNotice />

        {/* Filtros y buscador */}
        <div className={styles.filtrosPanel}>
          <div className={styles.buscadorWrap}>
            <input
              type="search"
              className={styles.buscador}
              placeholder="Buscar por nombre o nombre científico..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar madera"
            />
          </div>

          <div className={styles.filtrosGrupo}>
            <span className={styles.filtrosLabel}>Tipo:</span>
            <button
              type="button"
              className={`${styles.chipFiltro} ${filtroTipo === '' ? styles.chipActivo : ''}`}
              aria-pressed={filtroTipo === ''}
              onClick={() => setFiltroTipo('')}
            >
              Todos
            </button>
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.chipFiltro} ${filtroTipo === t ? styles.chipActivo : ''}`}
                aria-pressed={filtroTipo === t}
                onClick={() => setFiltroTipo(filtroTipo === t ? '' : t)}
                style={filtroTipo === t ? { backgroundColor: TIPO_COLORES[t] } : undefined}
              >
                {t}
              </button>
            ))}
          </div>

          <div className={styles.filtrosGrupo}>
            <span className={styles.filtrosLabel}>Dificultad:</span>
            <button
              type="button"
              className={`${styles.chipFiltro} ${filtroDificultad === '' ? styles.chipActivo : ''}`}
              aria-pressed={filtroDificultad === ''}
              onClick={() => setFiltroDificultad('')}
            >
              Todas
            </button>
            {DIFICULTADES.map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.chipFiltro} ${filtroDificultad === d ? styles.chipActivo : ''}`}
                aria-pressed={filtroDificultad === d}
                onClick={() => setFiltroDificultad(filtroDificultad === d ? '' : d)}
                style={filtroDificultad === d ? { backgroundColor: DIFICULTAD_COLORES[d] } : undefined}
              >
                {d}
              </button>
            ))}
          </div>

          <div className={styles.filtrosGrupo}>
            <span className={styles.filtrosLabel}>Sostenibilidad:</span>
            <button
              type="button"
              className={`${styles.chipFiltro} ${filtroSostenibilidad === '' ? styles.chipActivo : ''}`}
              aria-pressed={filtroSostenibilidad === ''}
              onClick={() => setFiltroSostenibilidad('')}
            >
              Todas
            </button>
            {SOSTENIBILIDADES.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.chipFiltro} ${filtroSostenibilidad === s ? styles.chipActivo : ''}`}
                aria-pressed={filtroSostenibilidad === s}
                onClick={() => setFiltroSostenibilidad(filtroSostenibilidad === s ? '' : s)}
                style={filtroSostenibilidad === s ? { backgroundColor: SOSTENIBILIDAD_COLORES[s] } : undefined}
              >
                {s}
              </button>
            ))}
          </div>

          <div className={styles.filtrosAcciones}>
            <span className={styles.contador} aria-live="polite">
              <strong>{maderasFiltradas.length}</strong> maderas
            </span>
            {hayFiltrosActivos && (
              <button type="button" className={styles.btnLimpiar} onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className={styles.grid} role="list">
          {maderasFiltradas.length === 0 && (
            <p className={styles.sinResultados}>
              No se encontraron maderas con los filtros actuales.
            </p>
          )}
          {maderasFiltradas.map((m) => (
            <article
              key={m.id}
              className={`${styles.tarjeta} ${madElegida?.id === m.id ? styles.tarjetaActiva : ''}`}
              role="listitem"
              onClick={() => setMadElegida(madElegida?.id === m.id ? null : m)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setMadElegida(madElegida?.id === m.id ? null : m);
                }
              }}
              aria-expanded={madElegida?.id === m.id}
              aria-label={`${m.nombre} — ${m.tipo}`}
            >
              {/* Cabecera con chip de color */}
              <div
                className={styles.tarjetaHeader}
                style={{ backgroundColor: m.colorHex }}
              >
                <div className={styles.tarjetaHeaderContent}>
                  <div>
                    <h2 className={styles.madNombre}>{m.nombre}</h2>
                    <p className={styles.madCientifico}><em>{m.nombreCientifico}</em></p>
                  </div>
                  <span
                    className={styles.badgeTipo}
                    style={{ backgroundColor: TIPO_COLORES[m.tipo] }}
                  >
                    {m.tipo}
                  </span>
                </div>
              </div>

              {/* Cuerpo */}
              <div className={styles.tarjetaBody}>
                {/* Dureza Janka */}
                <div className={styles.metrica}>
                  <div className={styles.metricaHeader}>
                    <span className={styles.metricaLabel}>Dureza Janka</span>
                    <span className={styles.metricaValor}>{m.dureza.toLocaleString('es-ES')} lbf</span>
                  </div>
                  <div className={styles.barraFondo} role="progressbar" aria-valuenow={m.dureza} aria-valuemin={0} aria-valuemax={JANKA_MAX}>
                    <div
                      className={styles.barraRelleno}
                      style={{
                        width: `${Math.min((m.dureza / JANKA_MAX) * 100, 100)}%`,
                        backgroundColor: m.colorHex,
                      }}
                    />
                  </div>
                </div>

                {/* Densidad */}
                <div className={styles.metricaFila}>
                  <span className={styles.metricaLabel}>Densidad</span>
                  <span className={styles.metricaValor}>{m.densidad} kg/m³</span>
                </div>

                {/* Origen */}
                <div className={styles.metricaFila}>
                  <span className={styles.metricaLabel}>Origen</span>
                  <span className={styles.metricaValorPeq}>{m.origen}</span>
                </div>

                {/* Badges dificultad y sostenibilidad */}
                <div className={styles.badgesRow}>
                  <span
                    className={styles.badge}
                    style={{ backgroundColor: DIFICULTAD_COLORES[m.dificultad] }}
                  >
                    {m.dificultad}
                  </span>
                  <span
                    className={styles.badge}
                    style={{ backgroundColor: SOSTENIBILIDAD_COLORES[m.sostenibilidad] }}
                  >
                    <span aria-hidden="true">🌱</span> {m.sostenibilidad}
                  </span>
                </div>

                {/* Usos */}
                <div className={styles.usosRow}>
                  {m.usos.map((u) => (
                    <span key={u} className={styles.chipUso}>{u}</span>
                  ))}
                </div>

                {/* Panel expandible */}
                {madElegida?.id === m.id && (
                  <div className={styles.panelExpandido} aria-live="polite">
                    <p className={styles.descripcion}>{m.descripcion}</p>
                    <div className={styles.curiosidadBox}>
                      <span className={styles.curiosidadIcono} aria-hidden="true">💡</span>
                      <p className={styles.curiosidadTexto}>{m.curiosidad}</p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className={styles.btnExpandir}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMadElegida(madElegida?.id === m.id ? null : m);
                  }}
                  aria-label={madElegida?.id === m.id ? `Ocultar detalles de ${m.nombre}` : `Ver detalles de ${m.nombre}`}
                >
                  {madElegida?.id === m.id ? '▲ Ocultar' : '▼ Ver más'}
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Sección educativa */}
        <EducationalSection
          title="📚 Guía completa para elegir madera"
          subtitle="Todo lo que necesitas saber antes de comprar o trabajar madera"
          icon="🪵"
        >
          {/* 1. Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>Comparativa de maderas representativas</h2>
            <p>6 maderas clave para entender las diferencias entre categorías:</p>
            <div className={styles.tablaWrap}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Madera</th>
                    <th>Janka (lbf)</th>
                    <th>Densidad (kg/m³)</th>
                    <th>Sostenibilidad</th>
                    <th>Precio relativo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Roble</td>
                    <td>1.360</td>
                    <td>720</td>
                    <td>Alta</td>
                    <td>Medio-alto</td>
                  </tr>
                  <tr>
                    <td>Pino silvestre</td>
                    <td>870</td>
                    <td>520</td>
                    <td>Alta</td>
                    <td>Bajo</td>
                  </tr>
                  <tr>
                    <td>Teca</td>
                    <td>1.155</td>
                    <td>630</td>
                    <td>Media</td>
                    <td>Alto</td>
                  </tr>
                  <tr>
                    <td>Ébano</td>
                    <td>3.220</td>
                    <td>1.050</td>
                    <td>Baja</td>
                    <td>Muy alto</td>
                  </tr>
                  <tr>
                    <td>Bambú laminado</td>
                    <td>1.380</td>
                    <td>620</td>
                    <td>Alta</td>
                    <td>Medio</td>
                  </tr>
                  <tr>
                    <td>MDF</td>
                    <td>700</td>
                    <td>750</td>
                    <td>Media</td>
                    <td>Muy bajo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.guideSection}>
            <h2>Madera según tu perfil</h2>
            <div className={styles.casosGrid}>
              <div className={styles.casoCard}>
                <h3><span aria-hidden="true">🔨</span> Bricolaje doméstico</h3>
                <p>
                  <strong>Recomendación:</strong> pino, DM, contrachapado.
                  Son fáciles de trabajar, económicos y hay tutoriales para cualquier proyecto.
                  Para exteriores, usa cedro rojo o castaño tratado.
                </p>
              </div>
              <div className={styles.casoCard}>
                <h3><span aria-hidden="true">🪑</span> Carpintero profesional</h3>
                <p>
                  <strong>Recomendación:</strong> roble, haya, arce y fresno para muebles funcionales;
                  nogal y cerezo para piezas de calidad; teca para exterior.
                  Calidad y durabilidad justifican el coste.
                </p>
              </div>
              <div className={styles.casoCard}>
                <h3><span aria-hidden="true">🎨</span> Diseñador de interiores</h3>
                <p>
                  <strong>Recomendación:</strong> sapele, wengué o nogal americano para efectos visuales espectaculares.
                  El bambú laminado es una opción sostenible y moderna para suelos y revestimientos.
                </p>
              </div>
              <div className={styles.casoCard}>
                <h3><span aria-hidden="true">🏗️</span> Construcción</h3>
                <p>
                  <strong>Recomendación:</strong> pino, douglas y alerce para estructuras;
                  OSB para tabiques y forjados; castaño o iroko para elementos exteriores.
                  Prioriza la certificación FSC o PEFC.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqLista}>
              <div className={styles.faqItem}>
                <h3>¿Roble o haya para el parquet?</h3>
                <p>El roble (1.360 lbf) es ligeramente más duro y tiene mayor tradición en España.
                La haya (1.300 lbf) es más uniforme en color y algo más económica.
                Para zonas de alto tráfico, el arce (1.450 lbf) es superior a ambos.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Qué madera aguanta mejor en el exterior?</h3>
                <p>La teca y el cedro rojo son las opciones premium. Para mayor relación calidad-precio,
                el castaño, alerce e iroko ofrecen excelente resistencia natural a la intemperie
                sin necesitar tratamientos agresivos.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Cómo se mide la dureza Janka?</h3>
                <p>La prueba Janka consiste en hundir una esfera de acero de 11,28 mm de diámetro
                hasta la mitad en la madera. La fuerza necesaria en libras-fuerza (lbf) es el valor Janka.
                A mayor número, más dura y resistente al desgaste.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Madera maciza o tablero derivado para muebles?</h3>
                <p>La madera maciza tiene más valor, dura décadas y puede restaurarse.
                El MDF y contrachapado son más estables dimensionalmente y más baratos,
                ideales para grandes superficies planas (fondos, laterales, baldas).</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Cómo sé si una madera es sostenible?</h3>
                <p>Busca los sellos FSC (Forest Stewardship Council) o PEFC.
                En general, las maderas locales europeas (roble, pino, haya) tienen mejor
                huella de carbono. Evita maderas tropicales sin certificación.</p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿El bambú es realmente madera?</h3>
                <p>No, técnicamente el bambú es una gramínea (hierba gigante).
                Pero en formato laminado se comporta como una madera dura de gran calidad,
                con la ventaja de ser un recurso que crece en 5 años frente a décadas de un árbol.</p>
              </div>
            </div>
          </section>

          {/* 4. Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>Cómo elegir la madera para tu proyecto (5 pasos)</h2>
            <ol className={styles.pasosList}>
              <li>
                <strong>Define el uso final.</strong> ¿Exterior o interior? ¿Zona de alto tráfico? ¿Contacto con agua?
                El entorno condiciona todo lo demás. Para exteriores necesitas maderas con aceites naturales o que soporten tratamientos.
              </li>
              <li>
                <strong>Establece el presupuesto.</strong> Las maderas tropicales y exóticas pueden costar 5-10 veces más que las europeas.
                Evalúa si el bambú o el roble certificado cubren tus necesidades antes de optar por teca o nogal.
              </li>
              <li>
                <strong>Valora tu nivel de experiencia.</strong> Si eres principiante, elige maderas de dificultad Fácil (pino, cedro, MDF).
                Las maderas duras como roble o wengué requieren herramientas específicas y mayor habilidad técnica.
              </li>
              <li>
                <strong>Verifica la sostenibilidad.</strong> Prioriza maderas con sello FSC/PEFC.
                Para maderas tropicales, comprueba que provengan de plantaciones certificadas, no de bosques primarios.
              </li>
              <li>
                <strong>Compra en un proveedor de confianza.</strong> El aspecto puede engañar: pide certificados de especie,
                humedad (idealmente 8-12% para uso interior) y procedencia. Una madera mal secada se deformará con el tiempo.
              </li>
            </ol>
          </section>

          {/* 5. Mejores prácticas */}
          <section className={styles.guideSection}>
            <h2>Consejos para conservar y trabajar la madera</h2>
            <ul className={styles.tipsList}>
              <li>
                <strong>Controla la humedad.</strong> Almacena la madera en un lugar ventilado con 40-60% de humedad relativa.
                Los cambios bruscos de temperatura y humedad causan fisuras y deformaciones.
              </li>
              <li>
                <strong>Usa el acabado adecuado.</strong> Para exterior, aceites o lasures penetrantes son superiores a las pinturas,
                que sellan pero se agrietan. Para interior, los aceites daneses o de tungsteno realzan la veta y son fáciles de renovar.
              </li>
              <li>
                <strong>Deja aclimatar la madera.</strong> Antes de instalar un suelo o montar un mueble,
                deja la madera sin embalar en la estancia durante 48-72 horas para que alcance la humedad ambiental del local.
              </li>
              <li>
                <strong>Afila tus herramientas.</strong> Una herramienta afilada produce menos esfuerzo,
                mejor acabado y más seguridad. Para maderas duras, cambia las cuchillas del cepillo más a menudo.
              </li>
              <li>
                <strong>Trabaja en el sentido de la veta.</strong> Cepillar o lijar contra la veta levanta fibras y deja marcas.
                Empieza con grano grueso (80) y termina con fino (220) siempre siguiendo la dirección de la fibra.
              </li>
            </ul>
          </section>

          {/* 6. Warning Box - errores frecuentes */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <h3><span aria-hidden="true">⚠️</span> Errores frecuentes al comprar o trabajar madera</h3>
              <ul>
                <li>
                  <strong>Comprar madera verde o húmeda.</strong> La madera con más del 20% de humedad se deformará al secarse.
                  Siempre pide el certificado de humedad o usa un medidor antes de comprar.
                </li>
                <li>
                  <strong>Confundir especies similares.</strong> El iroko puede confundirse visualmente con la teca,
                  pero no tiene los mismos aceites naturales. Exige la ficha técnica al proveedor.
                </li>
                <li>
                  <strong>No pretaladar antes de clavar.</strong> En maderas duras (roble, azobe, ébano), clavar directamente
                  parte la madera o dobla los clavos. Siempre pretaladra con una broca un poco más fina que el clavo.
                </li>
                <li>
                  <strong>Usar el mismo tratamiento para interior y exterior.</strong> Los barnices de interior no están
                  formulados para soportar UV ni humedad extrema. En exterior, usa productos específicos aunque cuesten más.
                </li>
                <li>
                  <strong>Ignorar la expansión y contracción.</strong> La madera maciza se mueve con la humedad.
                  En suelos y revestimientos, deja siempre la junta de dilatación recomendada por el fabricante (típicamente 10-15 mm).
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-maderas')} />
        <ShareCard appName="guia-maderas" />
        <Footer appName="guia-maderas" />
    </div>
  );
}
