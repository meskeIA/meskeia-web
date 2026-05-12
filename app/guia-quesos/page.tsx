'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GuiaQuesos.module.css';

type TipoLeche = 'Vaca' | 'Oveja' | 'Cabra' | 'Mezcla' | 'Búfala';
type TipoQueso = 'Fresco' | 'Tierno' | 'Semicurado' | 'Curado' | 'Añejo' | 'Azul' | 'Pasta blanda';
type Continente = 'España' | 'Francia' | 'Italia' | 'Reino Unido' | 'Resto de Europa' | 'América' | 'Otros';

interface Queso {
  nombre: string;
  pais: string;
  region: string;
  continente: Continente;
  leche: TipoLeche;
  tipo: TipoQueso;
  maduracion: string;
  textura: string;
  corteza: string;
  notasDeSabor: string[];
  maridaje: string[];
  denominacionOrigen: string;
  descripcion: string;
  curiosidad: string;
}

const TIPOS: TipoQueso[] = ['Fresco', 'Tierno', 'Semicurado', 'Curado', 'Añejo', 'Azul', 'Pasta blanda'];
const LECHES: TipoLeche[] = ['Vaca', 'Oveja', 'Cabra', 'Mezcla', 'Búfala'];
const CONTINENTES: Continente[] = ['España', 'Francia', 'Italia', 'Reino Unido', 'Resto de Europa', 'América', 'Otros'];

const LECHE_EMOJI: Record<TipoLeche, string> = {
  Vaca: '🐄', Oveja: '🐑', Cabra: '🐐', Mezcla: '🔀', Búfala: '🐃',
};

const TIPO_CLASS: Record<TipoQueso, string> = {
  'Fresco': styles.tipoFresco,
  'Tierno': styles.tipoTierno,
  'Semicurado': styles.tipoSemicurado,
  'Curado': styles.tipoCurado,
  'Añejo': styles.tipoAnejo,
  'Azul': styles.tipoAzul,
  'Pasta blanda': styles.tipoPastaBlanda,
};

const QUESOS: Queso[] = [
  // ── ESPAÑA ─────────────────────────────────────────────────────────────────
  {
    nombre: 'Manchego', pais: 'España', region: 'Castilla-La Mancha', continente: 'España',
    leche: 'Oveja', tipo: 'Curado', maduracion: '3–24 meses', textura: 'Semidura, compacta con ojos pequeños',
    corteza: 'Natural con grabado en espiga (pleita)', notasDeSabor: ['Mantequilla', 'Frutos secos', 'Hierba seca', 'Lanolina'],
    maridaje: ['Tempranillo', 'Manzanilla', 'Membrillo', 'Jamón ibérico'],
    denominacionOrigen: 'DOP Manchego',
    descripcion: 'El queso español más reconocido en el mundo, elaborado exclusivamente con leche de oveja manchega en La Mancha. Su corteza grabada con el patrón de espiga es inconfundible y está protegida legalmente. Cuanto más curado, más intenso y cristalino en la pasta.',
    curiosidad: 'El patrón de espiga de la corteza del Manchego proviene del molde tradicional trenzado con pleita de esparto, hoy reproducido en plástico. La normativa DOP exige que la forma esté presente incluso en las versiones más modernas.',
  },
  {
    nombre: 'Cabrales', pais: 'España', region: 'Asturias (Picos de Europa)', continente: 'España',
    leche: 'Mezcla', tipo: 'Azul', maduracion: '2–5 meses en cuevas', textura: 'Blanda, untuosa, con venas azul-verdosas',
    corteza: 'Natural rugosa, gris-verdosa (no comestible)', notasDeSabor: ['Potente', 'Picante', 'Terroso', 'Hongos', 'Mentolado'],
    maridaje: ['Sidra asturiana', 'Oporto', 'Miel', 'Nueces', 'Pan de centeno'],
    denominacionOrigen: 'DOP Cabrales',
    descripcion: 'Uno de los quesos azules más intensos del mundo, madurado en cuevas naturales de los Picos de Europa donde la humedad y temperatura son perfectas para el desarrollo del Penicillium. La mezcla de leches (vaca, oveja y cabra) en distintas proporciones según la temporada crea un queso de complejidad excepcional.',
    curiosidad: 'Hasta 1981, el Cabrales se envolvía en hojas de arce o castaño frescas, que le aportaban su característica humedad y parte del sabor. La DOP lo sustituyó por papel de aluminio, pero algunos productores artesanales mantienen la tradición de la hoja para ediciones especiales.',
  },
  {
    nombre: 'Idiazábal', pais: 'España', region: 'País Vasco y Navarra', continente: 'España',
    leche: 'Oveja', tipo: 'Curado', maduracion: '2–12 meses', textura: 'Semidura a dura',
    corteza: 'Natural o ahumada (con madera de cerezo)', notasDeSabor: ['Ahumado suave', 'Mantequilla', 'Frutos secos', 'Hierba'],
    maridaje: ['Txakoli', 'Rioja Alavesa', 'Manzanas', 'Sidra vasca'],
    denominacionOrigen: 'DOP Idiazábal',
    descripcion: 'Queso tradicional de los pastores vascos y navarros elaborado con leche de oveja Lacha y Carranzana. Puede elaborarse sin ahumar o ahumado con maderas locales. El ahumado aporta una capa dorada y notas de madera que lo hacen inconfundible. Forma parte de la identidad gastronómica del País Vasco.',
    curiosidad: 'El Idiazábal toma su nombre del municipio guipuzcoano donde se celebraba la feria más importante de quesos del País Vasco desde el siglo XIX. Los pastores trashumantes de los Pirineos lo elaboraban en las txabolas de verano y lo bajaban ya curado al mercado en otoño.',
  },
  {
    nombre: 'Mahón-Menorca', pais: 'España', region: 'Menorca (Islas Baleares)', continente: 'España',
    leche: 'Vaca', tipo: 'Curado', maduracion: '2–10 meses', textura: 'Semidura, con pequeños ojos irregulares',
    corteza: 'Natural untada en aceite y pimentón (naranja-rojiza)', notasDeSabor: ['Láctico', 'Mantequilla tostada', 'Avellana', 'Toque picante (curado)'],
    maridaje: ['Vino blanco menorquín', 'Cava', 'Aceitunas', 'Embutido ibérico'],
    denominacionOrigen: 'DOP Mahón-Menorca',
    descripcion: 'El único queso de vaca con DOP de España. El pastoreo extensivo en Menorca, con pastos enriquecidos por la tramontana y la sal marina, da a la leche un sabor único. La corteza naranja-rojiza se debe al frotado tradicional con aceite, mantequilla y pimentón.',
    curiosidad: 'El Mahón era el queso favorito de los marineros ingleses que controlaron Menorca en el siglo XVIII, y fue el principal vehículo de exportación del queso español al Reino Unido durante décadas. El puerto de Mahón da nombre tanto al queso como a la mayonesa, también disputada como invención menorquina.',
  },
  {
    nombre: 'Tetilla', pais: 'España', region: 'Galicia', continente: 'España',
    leche: 'Vaca', tipo: 'Tierno', maduracion: '1–2 meses', textura: 'Blanda, elástica, con pequeños ojos',
    corteza: 'Fina, natural, color amarillo pálido', notasDeSabor: ['Láctico fresco', 'Mantequilla suave', 'Vainilla ligera', 'Levemente ácido'],
    maridaje: ['Albariño', 'Ribeiro', 'Miel de eucalipto', 'Pan de maíz gallego'],
    denominacionOrigen: 'DOP Tetilla',
    descripcion: 'El queso más representativo de Galicia, famoso por su forma cónica característica que le da el nombre. Elaborado con leche de vaca de razas gallegas (Rubia Gallega, Parda Alpina, Frisona), tiene un sabor suave y láctico que refleja los verdes prados atlánticos de la región.',
    curiosidad: 'El nombre "Tetilla" hace referencia directa a su inconfundible forma cónica. Es uno de los quesos más vendidos de España y el que más leche gallega consume al año, siendo el motor económico de miles de pequeñas ganaderías familiares de la Galicia interior.',
  },
  {
    nombre: 'Torta del Casar', pais: 'España', region: 'Extremadura (Cáceres)', continente: 'España',
    leche: 'Oveja', tipo: 'Pasta blanda', maduracion: '2–3 meses', textura: 'Cremosa a líquida en el interior, se come con cuchara',
    corteza: 'Fina, amarillenta, rígida (se corta como tapa)', notasDeSabor: ['Amargo intenso', 'Animal', 'Hierba silvestre', 'Lanolina', 'Cremoso'],
    maridaje: ['Ribera del Guadiana', 'Miel de romero', 'Pan de hogaza', 'Oporto blanco'],
    denominacionOrigen: 'DOP Torta del Casar',
    descripcion: 'Uno de los quesos más singulares de España, cuajado con cuajo vegetal de flor de cardo (Cynara cardunculus) en lugar de cuajo animal. Este proceso produce una textura interior cremosa o incluso líquida que se extrae cortando la tapa superior. El amargor es su seña de identidad más polarizadora.',
    curiosidad: 'La Torta del Casar se cuaja con la flor del cardo, un cuajo vegetal que los pastores extremeños usaban cuando no disponían de cuajo animal. Esta técnica ancestral es también la responsable de su textura única y de su amargor característico, que los expertos consideran su mayor virtud.',
  },
  {
    nombre: 'Roncal', pais: 'España', region: 'Valle del Roncal (Navarra)', continente: 'España',
    leche: 'Oveja', tipo: 'Curado', maduracion: 'Mínimo 4 meses', textura: 'Dura, granulosa en curado',
    corteza: 'Gruesa, dura, color gris-pardo', notasDeSabor: ['Picante', 'Frutos secos', 'Mantequilla cocida', 'Oveja'],
    maridaje: ['Navarra rosado', 'Garnacha', 'Nueces', 'Pera conferencia'],
    denominacionOrigen: 'DOP Roncal',
    descripcion: 'El primer queso español con DOP reconocida por la UE (1981). Elaborado en los siete pueblos del Valle del Roncal con leche de oveja Lacha y Rasa aragonesa, tiene un carácter más seco e intenso que el Manchego, con una mineralidad propia de los pastos pirenaicos.',
    curiosidad: 'El Roncal fue el primer queso español en obtener una Denominación de Origen reconocida por la Unión Europea, en 1981, antes incluso que el propio Manchego. Las siete localidades del valle llevan siglos disputando entre sí el honor de producir el mejor lote de la temporada.',
  },
  {
    nombre: 'Garrotxa', pais: 'España', region: 'Cataluña (Girona)', continente: 'España',
    leche: 'Cabra', tipo: 'Semicurado', maduracion: '1–2 meses', textura: 'Semidura, suave, sin granulado',
    corteza: 'Natural, cubierta de moho gris azulado (Penicillium glaucum)', notasDeSabor: ['Láctico fresco', 'Nuez', 'Hierba', 'Levemente terroso'],
    maridaje: ['Cava Brut', 'Vino blanco de Alella', 'Pera', 'Membrillo'],
    denominacionOrigen: 'Sin DOP (artesanal protegido)',
    descripcion: 'Recuperado en los años 80 por un colectivo de artesanos catalanes cuando estaba casi extinguido, el Garrotxa es hoy un icono del movimiento de quesos artesanales de calidad en España. Su corteza gris con moho es característica y su interior blanco contrasta visualmente de forma elegante.',
    curiosidad: 'En 1980 el Garrotxa estaba prácticamente extinguido — solo quedaba el recuerdo de una tradición perdida. Un grupo de jóvenes queseros catalanes lo rescataron investigando recetas antiguas y buscando las pocas cabras de raza autóctona que quedaban. Hoy es uno de los quesos catalanes más reconocidos internacionalmente.',
  },
  {
    nombre: 'Afuega\'l Pitu', pais: 'España', region: 'Asturias (Nalón)', continente: 'España',
    leche: 'Vaca', tipo: 'Fresco', maduracion: '2–6 semanas', textura: 'Blanda, cremosa (fresco) o firme (curado)',
    corteza: 'Sin corteza (fresco) o mínima natural', notasDeSabor: ['Ácido suave', 'Láctico', 'Pimentón (en variante rojo)', 'Fresco'],
    maridaje: ['Sidra asturiana', 'Albariño', 'Miel de brezo'],
    denominacionOrigen: 'DOP Afuega\'l Pitu',
    descripcion: 'Uno de los quesos más antiguos de Asturias, cuyo nombre en asturiano significa "ahoga al pollo", en referencia a su textura pastosa que se adhería al paladar. Existe en versión blanca y en versión roja (roxu), aromatizada con pimentón picante. Es queso de consumo local y difícil de encontrar fuera de Asturias.',
    curiosidad: 'El Afuega\'l Pitu tiene una forma cónica que se moldea a mano, siendo uno de los pocos quesos en el mundo que toma forma exclusivamente por la presión manual del quesero. La versión roja con pimentón fue originalmente una forma de conservación: el pimentón actúa como agente antimicrobiano natural.',
  },
  {
    nombre: 'Murcia al Vino', pais: 'España', region: 'Murcia', continente: 'España',
    leche: 'Cabra', tipo: 'Semicurado', maduracion: '2–3 meses', textura: 'Semidura, lisa',
    corteza: 'Teñida de rojo violáceo por inmersión en vino tinto', notasDeSabor: ['Láctico', 'Frutal suave', 'Toque vínico', 'Almendra'],
    maridaje: ['Monastrell murciano', 'Rosado', 'Uvas frescas', 'Higos'],
    denominacionOrigen: 'DOP Murcia al Vino',
    descripcion: 'Queso de cabra murciana cuya corteza adquiere su característica coloración rojo-violácea al sumergirse en vino tinto Jumilla o Yecla durante el proceso de maduración. La corteza sabe a vino, el interior es fresco y láctico. Una combinación visual y gustativa muy llamativa.',
    curiosidad: 'La práctica de lavar la corteza de quesos con vino, cerveza o aguardiente es una técnica ancestral de conservación: el alcohol inhibe el crecimiento de bacterias y mohos no deseados. En Murcia esta técnica se convirtió en seña de identidad gastronómica y hoy el vino que se usa debe ser murciano obligatoriamente.',
  },
  {
    nombre: 'Zamorano', pais: 'España', region: 'Zamora y Valladolid', continente: 'España',
    leche: 'Oveja', tipo: 'Curado', maduracion: 'Mínimo 100 días', textura: 'Dura, compacta, granulosa',
    corteza: 'Natural dura, oscura, con patrón de espiga', notasDeSabor: ['Mantequilla tostada', 'Oveja intensa', 'Frutos secos', 'Especias suaves'],
    maridaje: ['Ribera del Duero', 'Toro', 'Chorizo ibérico', 'Aceite de oliva'],
    denominacionOrigen: 'DOP Zamorano',
    descripcion: 'Primo hermano del Manchego pero elaborado con leches de ovejas Churra y Castellana, razas de la meseta norte adaptadas al frío. Tiene un perfil más intenso y animal que el Manchego, con ese carácter seco y concentrado que da la meseta castellana. Muy apreciado por los aficionados a los quesos potentes.',
    curiosidad: 'Las razas de oveja Churra y Castellana fueron durante siglos el motor económico de Castilla a través de la Mesta, la organización ganadera medieval más poderosa de Europa. El Zamorano es el heredero gastronómico directo de ese legado trashumante que movía millones de cabezas de ovino por toda la península.',
  },
  {
    nombre: 'Queso de La Serena', pais: 'España', region: 'Extremadura (Badajoz)', continente: 'España',
    leche: 'Oveja', tipo: 'Pasta blanda', maduracion: '35 días mínimo', textura: 'Muy cremosa, casi líquida en el interior',
    corteza: 'Amarillenta, relativamente firme', notasDeSabor: ['Amargo', 'Láctico concentrado', 'Hierba de dehesa', 'Animal'],
    maridaje: ['Ribera del Guadiana', 'Miel de encina', 'Pan de hogaza', 'Higos secos'],
    denominacionOrigen: 'DOP La Serena',
    descripcion: 'Primo directo de la Torta del Casar, también cuajado con flor de cardo. Elaborado con leche de oveja Merina en la comarca de La Serena. Cuando está muy maduro se convierte en una especie de crema untable de sabor poderoso. Es uno de los quesos más exclusivos y caros de España por su bajísima producción.',
    curiosidad: 'La oveja Merina, raza de la que procede la lana más fina del mundo, fue durante siglos controlada con celo por la Corona española, que prohibía su exportación bajo pena de muerte. Hoy su leche da origen a uno de los quesos más exclusivos de la Península, la Torta de La Serena.',
  },
  {
    nombre: 'Quesucos de Liébana', pais: 'España', region: 'Cantabria (Picos de Europa)', continente: 'España',
    leche: 'Mezcla', tipo: 'Tierno', maduracion: '2–4 semanas', textura: 'Blanda a semiblanda',
    corteza: 'Natural fina o ahumada', notasDeSabor: ['Láctico suave', 'Ahumado (variante)', 'Mantequilla', 'Hierba fresca'],
    maridaje: ['Orujo de Liébana', 'Sidra', 'Nueces', 'Miel de brezo'],
    denominacionOrigen: 'DOP Quesucos de Liébana',
    descripcion: 'Pequeños quesos del Valle de Liébana, al pie de los Picos de Europa, elaborados con leches mixtas de las cabañas ganaderas de la comarca. Son quesos de montaña, modestos en tamaño pero con carácter propio. La versión ahumada con maderas locales es la más buscada por los visitantes.',
    curiosidad: 'El Valle de Liébana, aislado por los Picos de Europa, desarrolló una tradición quesera propia y diferente al resto de Cantabria. Su aislamiento geográfico fue paradójicamente lo que preservó sus razas autóctonas y sus técnicas artesanales durante siglos, sin la influencia homogeneizadora del mercado regional.',
  },
  {
    nombre: 'Arzúa-Ulloa', pais: 'España', region: 'Galicia (A Coruña / Lugo)', continente: 'España',
    leche: 'Vaca', tipo: 'Tierno', maduracion: '6 semanas mínimo', textura: 'Blanda, elástica',
    corteza: 'Fina, suave, color amarillo-naranja', notasDeSabor: ['Láctico fresco', 'Mantequilla', 'Hierba atlántica', 'Nata'],
    maridaje: ['Albariño', 'Godello', 'Pan de centeno', 'Compota de manzana'],
    denominacionOrigen: 'DOP Arzúa-Ulloa',
    descripcion: 'El queso más popular de Galicia en consumo interno. Su zona de producción coincide con el Camino Francés de Santiago, por lo que los peregrinos medievales ya lo consumían. Tiene un sabor más suave y mantecoso que la Tetilla, con un interior que casi se deshace en la boca cuando está bien hecho.',
    curiosidad: 'El municipio de Arzúa es la última parada importante del Camino Francés antes de llegar a Santiago, y durante siglos fue un mercado quesero donde los peregrinos hacían provisiones para la recta final. El queso Arzúa-Ulloa es hoy el producto gastronómico más asociado al Camino de Santiago.',
  },
  {
    nombre: 'Queso Ibores', pais: 'España', region: 'Extremadura (Cáceres)', continente: 'España',
    leche: 'Cabra', tipo: 'Curado', maduracion: '60 días mínimo', textura: 'Semidura a dura',
    corteza: 'Frotada con pimentón o aceite y pimentón (naranja-rojiza)', notasDeSabor: ['Cabra intensa', 'Picante suave', 'Pimentón', 'Frutos secos'],
    maridaje: ['Ribera del Guadiana', 'Cava rosado', 'Pimientos asados', 'Miel de tomillo'],
    denominacionOrigen: 'DOP Ibores',
    descripcion: 'Queso de cabra extremeño elaborado en el área del río Ibor y sus afluentes. Las cabras ramonean en dehesas de encinas y alcornoques, lo que da a la leche notas herbáceas y terrosas únicas. La corteza roja de pimentón es tan característica que lo hace reconocible a primera vista.',
    curiosidad: 'El Ibores se frota con pimentón de la Vera durante el proceso de maduración, incorporando indirectamente uno de los otros grandes productos de Extremadura. Esta práctica de usar especias locales como conservante de corteza es un ejemplo perfecto de cómo los productos gastronómicos de una región se retroalimentan entre sí.',
  },

  // ── FRANCIA ────────────────────────────────────────────────────────────────
  {
    nombre: 'Brie de Meaux', pais: 'Francia', region: 'Île-de-France', continente: 'Francia',
    leche: 'Vaca', tipo: 'Pasta blanda', maduracion: '4–8 semanas', textura: 'Cremosa bajo la corteza, fluida en el centro',
    corteza: 'Fina, enmohecida (Penicillium camemberti), color blanco', notasDeSabor: ['Champiñón', 'Mantequilla', 'Avellana', 'Terroso suave'],
    maridaje: ['Champagne Blanc de Blancs', 'Pinot Noir de Borgoña', 'Nueces', 'Fruta de temporada'],
    denominacionOrigen: 'AOP Brie de Meaux',
    descripcion: 'Llamado "el rey de los quesos" por Talleyrand en el Congreso de Viena (1815), el Brie de Meaux es el patrón del estilo de pasta blanda con corteza enmohecida. A diferencia del Brie industrial, el auténtico AOP es de leche cruda, con una textura que debe fluir sin llegar a líquida cuando está en su punto.',
    curiosidad: 'En el Congreso de Viena de 1815, donde las potencias europeas redibujaron el mapa tras Napoleón, se celebró una cata de quesos entre los representantes de 30 países. El Brie de Meaux fue declarado por aclamación "el rey de los quesos". Es posiblemente la única decisión unánime de todo aquel Congreso.',
  },
  {
    nombre: 'Camembert de Normandie', pais: 'Francia', region: 'Normandía', continente: 'Francia',
    leche: 'Vaca', tipo: 'Pasta blanda', maduracion: '3 semanas mínimo', textura: 'Cremosa, más firme que el Brie',
    corteza: 'Blanca enmohecida, más gruesa que el Brie', notasDeSabor: ['Mantequilla', 'Champiñón', 'Nata', 'Toque terroso', 'Animal suave'],
    maridaje: ['Calvados normando', 'Cidre artisanal', 'Sidra de manzana', 'Pan de baguette'],
    denominacionOrigen: 'AOP Camembert de Normandie',
    descripcion: 'El queso francés más imitado en el mundo, pero solo el Camembert de Normandie AOP puede denominarse auténtico. Se elabora en moldes redondos de 10 cm y se presenta en la icónica caja de madera. La leyenda atribuye su creación a Marie Harel, campesina normanda, en 1791.',
    curiosidad: 'La caja de madera redonda que hoy se asocia al Camembert fue inventada en 1890 por el ingeniero Ridel para proteger el queso durante el transporte al mercado parisino. Antes se envolvía en paja. El tren París-Normandía fue clave: conectó el queso rural con la gran ciudad consumidora en pocas horas.',
  },
  {
    nombre: 'Roquefort', pais: 'Francia', region: 'Aveyron (Rouerge)', continente: 'Francia',
    leche: 'Oveja', tipo: 'Azul', maduracion: '90 días mínimo (en cuevas de Combalou)', textura: 'Untuosa, húmeda, con venas azul-verdes',
    corteza: 'Prácticamente sin corteza, papel de aluminio protector', notasDeSabor: ['Picante intenso', 'Salado', 'Fruta madura', 'Mantequilla', 'Mineral'],
    maridaje: ['Sauternes', 'Banyuls', 'Nueces', 'Peras', 'Miel de lavanda'],
    denominacionOrigen: 'AOP Roquefort',
    descripcion: 'El más antiguo de los quesos azules con protección de origen, madurado exclusivamente en las cuevas naturales de Combalou, en el Macizo Central. El Penicillium roqueforti que desarrolla las venas azules solo existe de forma natural en estas cuevas, con sus corrientes de aire (fleurines) únicas en el mundo.',
    curiosidad: 'El Roquefort tiene la primera denominación de origen de la historia del queso, reconocida por el Parlamento de Toulouse en 1411. El rey Carlos VI de Francia otorgó a los habitantes de Roquefort-sur-Soulzon el monopolio exclusivo del affinage del queso, un privilegio que mantienen 600 años después.',
  },
  {
    nombre: 'Comté', pais: 'Francia', region: 'Franche-Comté (Jura)', continente: 'Francia',
    leche: 'Vaca', tipo: 'Curado', maduracion: '4–36+ meses', textura: 'Dura, con cristales de tirosina en los añejos',
    corteza: 'Natural rugosa, color marrón-grisáceo', notasDeSabor: ['Avellana', 'Caramelo', 'Especias (clavo, nuez moscada)', 'Frutal con la edad'],
    maridaje: ['Vin Jaune del Jura', 'Chardonnay', 'Jamón de montaña', 'Mostaza de Dijon'],
    denominacionOrigen: 'AOP Comté',
    descripcion: 'El queso AOP más producido de Francia, elaborado en ruedas de 40 kg con la leche de vacas Montbéliarde y Simmental que pastan en las praderas del Jura. Su complejidad aumenta notablemente con la edad: un Comté de 36 meses es prácticamente diferente al de 4 meses.',
    curiosidad: 'Para producir una rueda de Comté de 40 kg se necesitan 400 litros de leche, el equivalente a la producción de 30-40 vacas en un solo día. Las fruitières (cooperativas queseras del Jura) agrupan la leche de varios ganaderos y llevan funcionando con este modelo cooperativo desde el siglo XIII.',
  },
  {
    nombre: 'Reblochon', pais: 'Francia', region: 'Haute-Savoie (Alpes)', continente: 'Francia',
    leche: 'Vaca', tipo: 'Pasta blanda', maduracion: '6–8 semanas', textura: 'Semiblanda, cremosa, funde bien',
    corteza: 'Lavada (con suero), color naranja-amarillento', notasDeSabor: ['Nata fresca', 'Avellana', 'Mantequilla', 'Hierba alpina'],
    maridaje: ['Savoyardo blanco (Roussette)', 'Cerveza de trigo alpina', 'Papas (Tartiflette)', 'Embutido savoyardo'],
    denominacionOrigen: 'AOP Reblochon',
    descripcion: 'El queso de la Tartiflette, el gratin savoyard por excelencia. Nació del "reblochi", la práctica de los pastores medievales de ordeñar por segunda vez las vacas cuando el inspector del señor feudal ya se había ido, obteniendo leche más grasa. Esta leche más rica dio origen al queso.',
    curiosidad: 'El nombre "Reblochon" viene del patois savoyard "re-blocher", que significa "volver a ordeñar". Los pastores pagaban al señor feudal en función del rendimiento de ordeño inspeccionado, así que cuando el recaudador se iba, volvían a ordeñar para obtener leche más grasa. Con esa leche más rica nació el Reblochon.',
  },
  {
    nombre: 'Époisses', pais: 'Francia', region: 'Bourgogne (Côte-d\'Or)', continente: 'Francia',
    leche: 'Vaca', tipo: 'Pasta blanda', maduracion: '6–8 semanas', textura: 'Muy cremosa, casi líquida en el interior',
    corteza: 'Lavada con Marc de Bourgogne, color naranja intenso', notasDeSabor: ['Intenso', 'Animal', 'Marc (orujo)', 'Picante', 'Muy aromático'],
    maridaje: ['Sauternes', 'Gewurztraminer tardío', 'Chablis', 'Jamón cocido'],
    denominacionOrigen: 'AOP Époisses',
    descripcion: 'Uno de los quesos de olor más intenso del mundo, al punto de estar prohibido en el transporte público francés. La corteza se lava periódicamente con Marc de Bourgogne (aguardiente de orujo) durante la maduración, lo que desarrolla bacterias Brevibacterium que dan su color naranja y su aroma penetrante.',
    curiosidad: 'Napoleón Bonaparte era un apasionado del Époisses y lo hacía traer regularmente a sus campañas militares. El queso fue casi extinguido tras la Primera Guerra Mundial y fue recuperado artesanalmente en 1956 por Robert y Simone Berthaut. Su prohibición en el transporte público parisino es leyenda urbana no confirmada oficialmente.',
  },
  {
    nombre: 'Crottin de Chavignol', pais: 'Francia', region: 'Valle del Loira (Cher)', continente: 'Francia',
    leche: 'Cabra', tipo: 'Tierno', maduracion: '2–8 semanas', textura: 'Del suave y húmedo (joven) al duro y terroso (curado)',
    corteza: 'Fina blanca (joven) o azulada y rugosa (curado)', notasDeSabor: ['Cabra fresca', 'Ácido suave', 'Herbáceo', 'Nuez (curado)', 'Mineral'],
    maridaje: ['Sancerre blanco', 'Pouilly-Fumé', 'Ensalada verde', 'Nueces tostadas'],
    denominacionOrigen: 'AOP Crottin de Chavignol',
    descripcion: 'El queso de cabra más famoso de Francia, que transforma completamente su personalidad con la maduración: de fresco y suave a seco, potente y con corteza azulada. La maridaje perfecta con el Sancerre (mismo terroir del Loire) es uno de los grandes matrimonios de la gastronomía francesa.',
    curiosidad: 'El Sancerre y el Crottin de Chavignol se producen en el mismo valle y con los mismos suelos calcáreos: los aficionados dicen que la cabra come la misma hierba que las raíces de la vid Sauvignon Blanc absorben. Esto crearía una afinidad química que explicaría su maridaje casi perfecto. La ciencia aún lo investiga.',
  },
  {
    nombre: 'Beaufort', pais: 'Francia', region: 'Savoie (Alpes)', continente: 'Francia',
    leche: 'Vaca', tipo: 'Curado', maduracion: '5–12+ meses', textura: 'Dura, compacta, sin agujeros (talon concave)',
    corteza: 'Natural marrón-anaranjada, frotada con salmuera', notasDeSabor: ['Mantequilla alpina', 'Avellana', 'Floral', 'Frutal', 'Mineral suave'],
    maridaje: ['Chignin-Bergeron', 'Mondeuse de Savoie', 'Fondue savoyarda', 'Trufa negra'],
    denominacionOrigen: 'AOP Beaufort',
    descripcion: 'El "príncipe de los Gruyères" alpinos, elaborado en las altas praderas de Savoie con leche de verano de vacas Abondance y Tarine. Su forma inconfundible con el borde cóncavo permite reconocerlo de inmediato. Solo se produce en almayas de verano, lo que limita su producción y eleva su calidad.',
    curiosidad: 'El Beaufort d\'Alpage (de alta montaña) solo se produce cuando las vacas pastan por encima de los 1.500 metros en verano. Las flores alpinas que comen los animales se transfieren directamente a la leche y al queso: los catadores expertos pueden identificar el prado de origen por los aromas florales del queso.',
  },
  {
    nombre: 'Cantal', pais: 'Francia', region: 'Auvergne (Cantal)', continente: 'Francia',
    leche: 'Vaca', tipo: 'Curado', maduracion: '1–6+ meses', textura: 'Variable: blanda (joven) a muy dura (viejo)',
    corteza: 'Natural gris-marrón, con grietas en los añejos', notasDeSabor: ['Láctico', 'Mantequilla', 'Hierba de pasto', 'Especias suaves', 'Tostado (curado)'],
    maridaje: ['Saint-Pourçain', 'Côtes d\'Auvergne', 'Patatas auvergne', 'Embutido del Macizo Central'],
    denominacionOrigen: 'AOP Cantal',
    descripcion: 'Uno de los quesos más antiguos de Francia, con textos que lo documentan en época romana. Se presenta en tres estadios de maduración: Cantal Jeune (menos de 30 días), Cantal Entre-Deux (2-6 meses) y Cantal Vieux (más de 6 meses), cada uno con un perfil radicalmente diferente.',
    curiosidad: 'El geógrafo romano Plinio el Viejo mencionó en su Historia Natural (siglo I d.C.) un queso de la región de los galos del Macizo Central que podría corresponder al Cantal. Si es así, sería el queso europeo con el registro histórico escrito más antiguo, con más de 2.000 años de continuidad productiva.',
  },

  // ── ITALIA ─────────────────────────────────────────────────────────────────
  {
    nombre: 'Parmigiano Reggiano', pais: 'Italia', region: 'Emilia-Romaña (Parma, Reggio Emilia)', continente: 'Italia',
    leche: 'Vaca', tipo: 'Añejo', maduracion: '12–36+ meses', textura: 'Muy dura, granulosa, con cristales de tirosina',
    corteza: 'Dura, amarilla-dorada, grabada con nombre DOP', notasDeSabor: ['Umami intenso', 'Mantequilla cocida', 'Frutos secos', 'Pineapple (36 meses)', 'Sal cristalina'],
    maridaje: ['Lambrusco', 'Barolo', 'Prosciutto di Parma', 'Aceto Balsamico Tradizionale'],
    denominacionOrigen: 'DOP Parmigiano Reggiano',
    descripcion: 'Considerado el rey de los quesos italianos, el Parmigiano se elabora con leche cruda parcialmente desnatada, sin aditivos ni conservantes. Cada rueda pesa entre 38 y 40 kg y requiere 550 litros de leche. Los cristales blancos del interior son tirosina, un aminoácido que aparece con la maduración larga.',
    curiosidad: 'Las ruedas de Parmigiano Reggiano se usan como garantía bancaria en los bancos de Emilia-Romaña. El banco Credito Emiliano (Credem) acepta ruedas de Parmigiano como colateral para préstamos a los productores, almacenando más de 300.000 ruedas en sus cámaras frigoríficas especiales. Es el único queso hipotecable del mundo.',
  },
  {
    nombre: 'Grana Padano', pais: 'Italia', region: 'Valle del Po', continente: 'Italia',
    leche: 'Vaca', tipo: 'Añejo', maduracion: '9–24 meses', textura: 'Muy dura, granulosa',
    corteza: 'Dura, amarilla, con marca DOP en rombos', notasDeSabor: ['Mantequilla', 'Frutos secos', 'Sal moderada', 'Dulzor láctico'],
    maridaje: ['Franciacorta', 'Prosecco', 'Risotto', 'Pasta al burro'],
    denominacionOrigen: 'DOP Grana Padano',
    descripcion: 'El queso más producido y consumido de Italia, con más de 5 millones de ruedas al año. Más suave y menos intenso que el Parmigiano, acepta leche de vacas alimentadas también con ensilado (mientras el Parmigiano no). Su perfil más accesible lo convierte en el queso rallado por excelencia de la cocina italiana cotidiana.',
    curiosidad: 'El Grana Padano fue creado en el siglo XII por los monjes del monasterio de Chiaravalle, cerca de Milán. Como necesitaban conservar el exceso de leche que los campesinos pagaban como diezmo, desarrollaron este queso de larga conservación. La tradición monástica italiana de conservar alimentos fue clave en el desarrollo de muchos grandes quesos europeos.',
  },
  {
    nombre: 'Pecorino Romano', pais: 'Italia', region: 'Lazio, Cerdeña y Toscana', continente: 'Italia',
    leche: 'Oveja', tipo: 'Curado', maduracion: '5–12+ meses', textura: 'Muy dura, quebradiza',
    corteza: 'Dura, oscura, con marcas DOP', notasDeSabor: ['Salado intenso', 'Oveja fuerte', 'Picante', 'Herbáceo', 'Seco'],
    maridaje: ['Morellino di Scansano', 'Vermentino de Cerdeña', 'Pasta all\'Amatriciana', 'Cacio e Pepe'],
    denominacionOrigen: 'DOP Pecorino Romano',
    descripcion: 'Uno de los quesos más antiguos del mundo, documentado desde la época romana como alimento de los legionarios (cada soldado recibía una ración diaria). Hoy el 90% se produce en Cerdeña pese a llamarse Romano. Es la base insustituible de la Cacio e Pepe, la Carbonara y la Amatriciana auténticas.',
    curiosidad: 'El Pecorino Romano fue ración de combate del ejército romano: cada legionario recibía 27 gramos diarios por ley. Su alta concentración en sal, proteínas y grasa lo hacía perfecto para largos desplazamientos sin refrigeración. Los romanos lo distribuían también a la plebe en las annona (reparto público de alimentos).',
  },
  {
    nombre: 'Gorgonzola', pais: 'Italia', region: 'Lombardía y Piamonte', continente: 'Italia',
    leche: 'Vaca', tipo: 'Azul', maduracion: '2–12 meses', textura: 'Del cremoso (Dolce) al firme y quebradizo (Piccante)',
    corteza: 'Sin corteza comestible, envuelto en papel de aluminio', notasDeSabor: ['Picante (Piccante)', 'Cremoso dulce (Dolce)', 'Salado', 'Hongos', 'Terroso'],
    maridaje: ['Barolo', 'Amarone', 'Oporto', 'Nueces', 'Peras Williams', 'Miel de acacia'],
    denominacionOrigen: 'DOP Gorgonzola',
    descripcion: 'El gran queso azul italiano, disponible en dos versiones radicalmente distintas: Gorgonzola Dolce (cremoso, suave, 2-3 meses) y Gorgonzola Piccante (firme, picante, 6-12 meses). El Piccante es uno de los quesos azules más potentes del mundo, comparable al Roquefort. El Dolce, uno de los más accesibles.',
    curiosidad: 'Según la leyenda, el Gorgonzola nació por accidente en el año 879 cerca del pueblo del mismo nombre (hoy en la provincia de Milán). Un quesero olvidó una tanda de queso y el Penicillium se desarrolló espontáneamente en la pasta. Lo que parecía una pérdida se convirtió en el inicio de una tradición de 1.100 años.',
  },
  {
    nombre: 'Mozzarella di Bufala', pais: 'Italia', region: 'Campania (Caserta, Salerno)', continente: 'Italia',
    leche: 'Búfala', tipo: 'Fresco', maduracion: 'Consumo en 24–48 h', textura: 'Blanda, fibrosa, con suero interior',
    corteza: 'Sin corteza, lisa y brillante', notasDeSabor: ['Láctico fresco', 'Suero de leche', 'Nata suave', 'Ligeramente ácido'],
    maridaje: ['Insalata Caprese', 'Tomate San Marzano', 'Aceite de oliva extra virgen', 'Albahaca fresca'],
    denominacionOrigen: 'DOP Mozzarella di Bufala Campana',
    descripcion: 'La pasta filata por excelencia, elaborada con leche de búfala de agua (Bubalus bubalis) cuya leche tiene el doble de grasa y proteínas que la leche de vaca. El proceso de "filatura" (estirado en agua caliente) le da su textura fibrosa y su suero interior. Debe consumirse casi inmediatamente para disfrutarla en su máximo.',
    curiosidad: 'Los búfalos de agua llegaron a Campania probablemente traídos por los lombardos en el siglo VI, aunque existen teorías que apuntan a los árabes o incluso a los romanos. El animal, originario del sur de Asia, se adaptó perfectamente a los pantanos del Casertano, donde sigue pastando hoy junto a las modernas queserías DOP.',
  },
  {
    nombre: 'Burrata', pais: 'Italia', region: 'Puglia (Andria)', continente: 'Italia',
    leche: 'Vaca', tipo: 'Fresco', maduracion: 'Consumo en 24 h', textura: 'Exterior firme (mozzarella), interior cremoso líquido',
    corteza: 'Sin corteza, envuelta en hojas de asfódelo', notasDeSabor: ['Nata fresca', 'Mantequilla', 'Leche fresca', 'Delicado', 'Ligeramente dulce'],
    maridaje: ['Tomates cherry', 'Aceite de oliva de Puglia', 'Prosciutto crudo', 'Pimienta negra', 'Flor de sal'],
    denominacionOrigen: 'IGP Burrata di Andria',
    descripcion: 'Creada en los años 30 del siglo XX en Andria, Puglia, la Burrata es una bolsa de mozzarella rellena de stracciatella (crema de nata y mozzarella desmenuzada). Al cortarla, el interior cremoso fluye como una salsa. Es uno de los productos lácteos italianos de mayor crecimiento internacional en la última década.',
    curiosidad: 'La Burrata fue creada en 1956 por Lorenzo Bianchino, quesero de la masería Piana Padula en Andria, como forma de aprovechar los restos de mozzarella y la nata sobrante de la producción. Lo que empezó como un queso de aprovechamiento se convirtió en 60 años en uno de los productos más fotografiados en Instagram del mundo gastronómico.',
  },
  {
    nombre: 'Taleggio', pais: 'Italia', region: 'Lombardía (Val Taleggio)', continente: 'Italia',
    leche: 'Vaca', tipo: 'Pasta blanda', maduracion: '6–7 semanas', textura: 'Muy blanda, untuosa',
    corteza: 'Lavada con salmuera, color naranja-rosado, aromática', notasDeSabor: ['Mantequilla', 'Frutal suave', 'Trufado', 'Terroso', 'Animal suave'],
    maridaje: ['Franciacorta', 'Barbera d\'Asti', 'Risotto', 'Polenta taragna'],
    denominacionOrigen: 'DOP Taleggio',
    descripcion: 'Uno de los quesos de corteza lavada más suaves en comparación con su aroma: la corteza huele fuerte pero el interior es sorprendentemente delicado y dulce. Se elabora en forma de cuadrado de 20x20 cm, tradición que se remonta a la Edad Media cuando los pastores lo transportaban en alforjas de esa medida.',
    curiosidad: 'El Taleggio es uno de los quesos con mayor documentación histórica medieval: un escritor lombardo lo mencionó ya en 1200 y en el siglo XIV aparece en registros de pagos de impuestos de la ciudad de Milán. La Val Taleggio, su valle de origen, fue durante siglos un paso estratégico entre los Alpes y la llanura padana.',
  },
  {
    nombre: 'Pecorino Sardo', pais: 'Italia', region: 'Cerdeña', continente: 'Italia',
    leche: 'Oveja', tipo: 'Semicurado', maduracion: '20–60 días (dulce) o más de 2 meses (maturo)', textura: 'Semiblanda (dulce) a semidura (maturo)',
    corteza: 'Clara y suave (dulce) o más oscura y dura (maturo)', notasDeSabor: ['Láctico suave', 'Hierba', 'Floral (dulce)', 'Picante suave (maturo)', 'Avellana'],
    maridaje: ['Vermentino di Gallura', 'Cannonau de Cerdeña', 'Pane carasau', 'Miel de eucalipto'],
    denominacionOrigen: 'DOP Pecorino Sardo',
    descripcion: 'La oveja sarda (Sarda) es la raza más productora de leche del Mediterráneo y la base de toda la economía lechera de Cerdeña. El Pecorino Sardo es el más suave de los Pecorinos italianos, especialmente en su versión dulce, y refleja los pastos floridos y aromáticos de la isla.',
    curiosidad: 'Cerdeña produce más queso de oveja por habitante que cualquier otra región del mundo. Las ovejas sardas superan en número a las personas en la isla: aproximadamente 3,5 millones de ovejas frente a 1,6 millones de habitantes. El sector ovino es el pilar histórico de la economía rural sarda.',
  },
  {
    nombre: 'Asiago', pais: 'Italia', region: 'Veneto y Trentino (Altopiano di Asiago)', continente: 'Italia',
    leche: 'Vaca', tipo: 'Tierno', maduracion: '20 días (Pressato) a 15+ meses (d\'Allevo)', textura: 'Del blando y elástico al duro y granuloso',
    corteza: 'Fina amarilla (Pressato) o gruesa y dorada (d\'Allevo)', notasDeSabor: ['Láctico fresco (joven)', 'Avellana', 'Tostado (curado)', 'Mantequilla'],
    maridaje: ['Pinot Grigio', 'Soave', 'Prosecco', 'Pasta con pesto', 'Risotto'],
    denominacionOrigen: 'DOP Asiago',
    descripcion: 'Queso del altiplano de los Alpes venecianos, elaborado con dos procesos muy distintos: el Asiago Pressato (joven) y el Asiago d\'Allevo (curado). La diferencia de maduración crea dos quesos con sabores radicalmente distintos aunque compartan nombre y origen.',
    curiosidad: 'El Asiago original era de leche de oveja: la zona fue ocupada por la etnia Cimbra, de origen germánico, que pastoreaba ovejas en el altiplano. Cuando en el siglo XIV se extendió la ganadería bovina, los productores locales adaptaron su técnica quesera a la leche de vaca, creando el Asiago actual.',
  },
  {
    nombre: 'Scamorza', pais: 'Italia', region: 'Campania y Sur de Italia', continente: 'Italia',
    leche: 'Vaca', tipo: 'Tierno', maduracion: '2–4 semanas', textura: 'Semiblanda, fibrosa, pasta hilada, funde perfectamente',
    corteza: 'Fina amarilla, forma de pera con nudo en la parte superior', notasDeSabor: ['Láctico suave', 'Mantequilla', 'Ahumado (affumicata)', 'Ligeramente salado'],
    maridaje: ['Montepulciano d\'Abruzzo', 'Pizza', 'Berenjena a la parmigiana', 'Ensalada caprese'],
    denominacionOrigen: 'Sin DOP (producto tradicional)',
    descripcion: 'La Scamorza es la hermana curada de la Mozzarella: misma técnica de pasta hilada (filatura), pero con unos días más de maduración que le dan más firmeza y un sabor más pronunciado. Funde perfectamente y la versión affumicata (ahumada) es especialmente apreciada para pizzas y gratins.',
    curiosidad: 'La forma de pera con el nudo superior de la Scamorza es funcional, no decorativa: el queso se ata y cuelga en pares del mismo cordel durante la maduración. Esta técnica de colgado, llamada "appeso", permite que el queso pierda humedad uniformemente y desarrolle su textura característica sin deformarse.',
  },

  // ── REINO UNIDO ────────────────────────────────────────────────────────────
  {
    nombre: 'Cheddar', pais: 'Reino Unido', region: 'Somerset (Wells, Cheddar)', continente: 'Reino Unido',
    leche: 'Vaca', tipo: 'Curado', maduracion: '3 meses–2 años', textura: 'Firme, quebradiza en los más curados',
    corteza: 'Natural o con vendas de tela (Clothbound)', notasDeSabor: ['Láctico', 'Tostado', 'Picante suave', 'Mantequilla', 'Terroso (curado)'],
    maridaje: ['Ale inglesa', 'Pickle', 'Manzana Granny Smith', 'Chutney de cebolla'],
    denominacionOrigen: 'DOP West Country Farmhouse Cheddar',
    descripcion: 'El queso más copiado del mundo, pero solo el Farmhouse Cheddar de Somerset puede llevar la DOP. El proceso de "cheddaring" (apilado y volteo repetido de la cuajada) es exclusivo de este queso y le da su textura inconfundible. Los mejores ejemplares, madurados más de 18 meses, son comparables en complejidad al mejor Parmigiano.',
    curiosidad: 'El 51% de todo el queso consumido en el mundo es de estilo Cheddar o derivado de él. Sin embargo, el auténtico Cheddar de Somerset con DOP representa menos del 1% de esa producción. El proceso de "cheddaring" fue descrito por primera vez en 1660 por el científico John Ray y hoy se realiza de forma mecánica en las grandes fábricas.',
  },
  {
    nombre: 'Stilton', pais: 'Reino Unido', region: 'Leicestershire, Nottinghamshire, Derbyshire', continente: 'Reino Unido',
    leche: 'Vaca', tipo: 'Azul', maduracion: '9–12 semanas mínimo', textura: 'Semiblanda, untuosa, con venas azul-verdes',
    corteza: 'Natural rugosa, marrón-grisácea', notasDeSabor: ['Salado', 'Picante', 'Terroso', 'Avellana', 'Frutal complejo'],
    maridaje: ['Oporto Vintage', 'Madeira', 'Apio', 'Peras', 'Nueces', 'Miel de brezo'],
    denominacionOrigen: 'DOP Stilton',
    descripcion: 'El rey de los quesos británicos y uno de los tres grandes azules del mundo junto al Roquefort y el Gorgonzola. Solo seis queserías en tres condados del Midlands inglés pueden producirlo. Las agujas que perforan el queso para crear las venas azules son el instrumento más característico de la producción de Stilton.',
    curiosidad: 'El Stilton nunca se produjo en el pueblo de Stilton (Cambridgeshire): allí solo se vendía en la posada Bell Inn, que lo distribuía a los viajeros de la ruta Londres-Norte. El dueño de la posada, Cooper Thornhill, lo compraba en Leicestershire y lo popularizó entre los viajeros del siglo XVIII. Hoy ese pueblo está fuera de la zona DOP.',
  },
  {
    nombre: 'Red Leicester', pais: 'Reino Unido', region: 'Leicestershire', continente: 'Reino Unido',
    leche: 'Vaca', tipo: 'Curado', maduracion: '3–12 meses', textura: 'Semidura, suave, más húmeda que el Cheddar',
    corteza: 'Natural o con vendas, color marrón-naranja', notasDeSabor: ['Nuez', 'Caramelo', 'Mantequilla', 'Avellana', 'Suave y dulce'],
    maridaje: ['Bitter inglesa', 'Tinto suave', 'Chutney de manzana', 'Pickles ingleses'],
    denominacionOrigen: 'Sin DOP',
    descripcion: 'Su color naranja intenso se debe al annatto, un colorante vegetal natural de origen americano que los queseros ingleses adoptaron en el siglo XVII. Más suave y húmedo que el Cheddar, con un perfil dulce y de frutos secos, fue durante siglos el queso preferido de los obreros de las Midlands por su sabor accesible y su precio.',
    curiosidad: 'El color naranja del Red Leicester y del Cheddar (en versión "coloreado") no es natural: se debe al annatto, pigmento extraído del árbol achiote originario de América. Los queseros ingleses del siglo XVII lo adoptaron porque los quesos de verano, con más betacaroteno en la leche, tenían mejor aspecto. El annatto permitía mantener ese color todo el año.',
  },
  {
    nombre: 'Wensleydale', pais: 'Reino Unido', region: 'Yorkshire (Dale del Ure)', continente: 'Reino Unido',
    leche: 'Vaca', tipo: 'Tierno', maduracion: '3–4 semanas mínimo', textura: 'Suave, húmeda, ligeramente desmenuzable',
    corteza: 'Natural suave o encerrada', notasDeSabor: ['Láctico fresco', 'Miel suave', 'Hierba', 'Ligeramente ácido', 'Limpio'],
    maridaje: ['Arándanos (combinación clásica)', 'Frutas del bosque', 'Ale de Yorkshire', 'Apple pie'],
    denominacionOrigen: 'IGP Yorkshire Wensleydale',
    descripcion: 'Queso de los Dales del norte de Yorkshire con una textura única: húmeda, suave y ligeramente desmenuzable. Los monjes cistercienses del monasterio de Fors lo enseñaron a los agricultores locales en el siglo XII. La combinación de Wensleydale con arándanos es un maridaje tan clásico en Yorkshire como el Manchego con membrillo en España.',
    curiosidad: 'El Wensleydale casi desapareció en 1992 cuando la quesería Dales Creamery cerró. Un grupo de productores locales la rescató y se hizo mundialmente famosa gracias a la serie de animación "Wallace y Gromit": el inventor Wallace declaró que el Wensleydale era su queso favorito, y las ventas se multiplicaron por cinco.',
  },
  {
    nombre: 'Lancashire', pais: 'Reino Unido', region: 'Lancashire', continente: 'Reino Unido',
    leche: 'Vaca', tipo: 'Semicurado', maduracion: '4–24 meses', textura: 'Mantecosa, suave, se desmorona fácilmente',
    corteza: 'Natural suave o con vendas', notasDeSabor: ['Mantequilla', 'Nata', 'Suave acidez', 'Herbáceo', 'Limpio'],
    maridaje: ['Bitter de Lancashire', 'Pan de miga', 'Cebolla encurtida', 'Lancashire Hotpot'],
    denominacionOrigen: 'Sin DOP',
    descripcion: 'El queso más popular del noroeste de Inglaterra, famoso por su textura mantecosa y desmenuzable única. Existen tres variantes: Creamy (más joven y suave), Tasty (más curado) y Crumbly (el más seco y desmenuzable). Es el queso tradicional del "cheese on toast" y del legendario Lancashire Hotpot.',
    curiosidad: 'El Lancashire Crumbly fue el queso favorito de los telares: los obreros de la industria textil de Manchester y Leeds en el siglo XIX lo comían en el descanso porque se podía partir fácilmente con los dedos sin necesidad de cuchillo, muy práctico cuando las manos estaban ocupadas con la maquinaria. Su textura desmenuzable fue seleccionada específicamente para ese uso.',
  },

  // ── RESTO DE EUROPA ────────────────────────────────────────────────────────
  {
    nombre: 'Gouda', pais: 'Países Bajos', region: 'Países Bajos del Sur (Holanda Meridional)', continente: 'Resto de Europa',
    leche: 'Vaca', tipo: 'Curado', maduracion: '4 semanas–2+ años', textura: 'Del semiblanda (joven) a muy dura con cristales (añejo)',
    corteza: 'Encerada (amarilla, roja o negra según maduración)', notasDeSabor: ['Mantequilla', 'Caramelo', 'Toffee (añejo)', 'Frutos secos', 'Cristalino (muy curado)'],
    maridaje: ['Bock holandés', 'Riesling', 'Mostaza', 'Jengibre confitado'],
    denominacionOrigen: 'IGP Noord-Hollandse Gouda',
    descripcion: 'El queso más exportado del mundo en términos de volumen. El Gouda joven (Jong) es suave y mantecoso; el Gouda Oud (más de 18 meses) desarrolla cristales de tirosina y un sabor caramelizado intenso comparable al Parmigiano. La bola encerada de colores es su presentación más reconocible mundialmente.',
    curiosidad: 'Gouda es el nombre de la ciudad donde se celebraba el mercado quesero, no del lugar de producción. Los agricultores llegaban de toda Holanda Meridional a vender sus quesos en la kaasmarkt de Gouda, que desde 1668 es uno de los mercados tradicionales más antiguos de Europa y hoy es una atracción turística.',
  },
  {
    nombre: 'Gruyère', pais: 'Suiza', region: 'Friburgo, Vaud, Neuchâtel, Berna, Jura', continente: 'Resto de Europa',
    leche: 'Vaca', tipo: 'Curado', maduracion: '5–14+ meses', textura: 'Dura, compacta, sin agujeros (o muy pocos)',
    corteza: 'Natural granulosa, marrón-arenosa', notasDeSabor: ['Avellana', 'Mantequilla cocida', 'Floral', 'Frutal', 'Ligeramente picante (curado)'],
    maridaje: ['Chasselas suizo', 'Fondue clásica', 'Gratín de patatas', 'Vino blanco del Jura'],
    denominacionOrigen: 'AOP Gruyère',
    descripcion: 'El queso suizo AOP más importante y base de la fondue clásica suizo-francesa. Contrariamente a la creencia popular, el Gruyère auténtico tiene pocos o ningún agujero: los agujeros grandes son del Emmental. Su sabor complejo e intenso lo distingue del Emmental más suave. Solo se produce con leche cruda de vacas sin ensilado.',
    curiosidad: 'La eterna disputa entre Suiza y Francia sobre el Gruyère duró décadas: el Fribourgeois reclama que el queso es originalmente suizo mientras que el Gruyère francés (sin la AOP suiza) se produce también en la región francesa de Franche-Comté. En 2001 la UE reconoció la AOP suiza, poniendo fin jurídicamente al conflicto, aunque la disputa cultural continúa.',
  },
  {
    nombre: 'Emmental', pais: 'Suiza', region: 'Valle del Emme (Berna)', continente: 'Resto de Europa',
    leche: 'Vaca', tipo: 'Curado', maduracion: '4+ meses', textura: 'Semidura, elástica, con grandes agujeros',
    corteza: 'Natural dura, dorada-amarilla', notasDeSabor: ['Dulce', 'Mantequilla', 'Avellana suave', 'Afrutado', 'Muy suave'],
    maridaje: ['Lager suiza', 'Fondue con Gruyère', 'Jamón de York', 'Pan de centeno'],
    denominacionOrigen: 'AOP Emmental Switzerland (para el suizo)',
    descripcion: 'El queso de los grandes agujeros que reconocen incluso los niños, elaborado en ruedas de hasta 130 kg. Los agujeros (ojos) se forman por las bacterias Propionibacterium que producen CO₂ durante la maduración. El más producido de los quesos suizos, con decenas de imitaciones mundiales que no tienen AOP.',
    curiosidad: 'Los agujeros del Emmental —durante décadas un misterio de la quesería— fueron explicados científicamente en 2015 por investigadores suizos del ALP Forum. La causa son partículas de heno microscópicas que caen en la leche durante el ordeño tradicional y sirven de "semilla" para las bacterias que producen los agujeros. Más automatización = menos agujeros.',
  },
  {
    nombre: 'Halloumi', pais: 'Chipre', region: 'Chipre (toda la isla)', continente: 'Resto de Europa',
    leche: 'Mezcla', tipo: 'Semicurado', maduracion: 'Fresco (inmediato) o curado (1-3 meses en salmuera)', textura: 'Firme, elástica, chirrante, aguanta el calor sin fundirse',
    corteza: 'Sin corteza (envasado en suero)', notasDeSabor: ['Salado', 'Láctico', 'Menta (con hierbabuena)', 'Tostado a la plancha'],
    maridaje: ['Sandía', 'Menta fresca', 'Tomate cherry', 'Vino blanco chipriota', 'Limón'],
    denominacionOrigen: 'DOP Halloumi / Χαλλούμι',
    descripcion: 'El queso que no se funde: gracias a su alto punto de fusión (resultado de la cocción de la cuajada), el Halloumi se puede freír o asar a la plancha sin perder su forma. Es el queso mediterráneo que más ha crecido en popularidad en Europa en la última década, especialmente en dietas vegetarianas.',
    curiosidad: 'El Halloumi fue durante décadas el queso de más rápido crecimiento en el Reino Unido, donde pasó de producto desconocido en los años 80 a estrella de los barbecues de verano. Las exportaciones chipriotas de Halloumi superan en valor al turismo en algunos años. La batalla legal con la UE por la DOP duró más de 20 años y se resolvió en 2021.',
  },
  {
    nombre: 'Feta', pais: 'Grecia', region: 'Macedonia, Tracia, Epiro, Tesalia, Peloponeso, Lesbos', continente: 'Resto de Europa',
    leche: 'Oveja', tipo: 'Fresco', maduracion: '2+ meses en salmuera', textura: 'Blanda, desmenuzable, húmeda',
    corteza: 'Sin corteza (en salmuera o embalada en bloque)', notasDeSabor: ['Salado', 'Ácido fresco', 'Láctico', 'Picante suave', 'Mineral'],
    maridaje: ['Vino retsina', 'Ensalada griega', 'Aceitunas Kalamata', 'Tomate maduro', 'Orégano'],
    denominacionOrigen: 'AOP Feta',
    descripcion: 'El queso más emblemático de Grecia, protegido por una DOP que fue la más disputada de la historia europea. La Feta genuina es exclusivamente griega y de leche de oveja (con hasta 30% de cabra). La "feta" producida en Dinamarca, Alemania o cualquier otro país no puede llamarse Feta en la UE desde 2002.',
    curiosidad: 'La batalla jurídica por la DOP de la Feta fue la más larga de la historia de la UE: Dinamarca y Alemania, que producían "Feta" en grandes cantidades, batallaron en los tribunales europeos durante más de 10 años. Grecia ganó definitivamente en 2002 tras demostrar que el queso era una denominación geográfica protegida desde tiempos de Homero.',
  },
  {
    nombre: 'Havarti', pais: 'Dinamarca', region: 'Dinamarca (toda la país)', continente: 'Resto de Europa',
    leche: 'Vaca', tipo: 'Tierno', maduracion: '3 semanas–1 año', textura: 'Suave, elástica, con pequeños ojos irregulares',
    corteza: 'Sin corteza en el fresco, con corteza encerada en el curado', notasDeSabor: ['Mantequilla', 'Crema suave', 'Ligeramente ácido', 'Suave y accesible'],
    maridaje: ['Lager danesa', 'Rye bread (rugbrød)', 'Salmón ahumado', 'Eneldo'],
    denominacionOrigen: 'Sin DOP específica',
    descripcion: 'El queso más popular de Dinamarca, creado en el siglo XIX por Hanne Nielsen tras un viaje de aprendizaje por Europa. Su textura suave y sabor mantecoso lo han convertido en uno de los quesos más exportados del norte de Europa. La versión curada tiene más complejidad pero el joven sigue siendo el favorito para bocadillos.',
    curiosidad: 'El nombre Havarti proviene de la granja Havarthigaard en las afueras de Copenhague, donde Hanne Nielsen desarrolló el queso en la década de 1850 tras haber viajado por toda Europa aprendiendo técnicas queseras. Fue posiblemente la primera productora de queso de Europa en hacer un "viaje de estudios" internacional para mejorar sus métodos.',
  },
  {
    nombre: 'Jarlsberg', pais: 'Noruega', region: 'Vestfold', continente: 'Resto de Europa',
    leche: 'Vaca', tipo: 'Curado', maduracion: '3–15 meses', textura: 'Semidura, elástica, con grandes agujeros',
    corteza: 'Encerada amarilla', notasDeSabor: ['Dulce suave', 'Nuez', 'Mantequilla', 'Avellana', 'Ligeramente afrutado'],
    maridaje: ['Cerveza noruega', 'Aquavit', 'Salmón noruego', 'Panes escandinavos'],
    denominacionOrigen: 'Marca comercial (Tine)',
    descripcion: 'El queso noruego más famoso en el mundo, creado en los años 50 con técnicas helvéticas adaptadas a la leche noruega. Sus grandes agujeros y sabor dulce lo hacen muy accesible. Es una de las pocas marcas comerciales queseras con éxito internacional genuino y consistente durante más de 70 años.',
    curiosidad: 'El Jarlsberg fue desarrollado en 1956 por investigadores de la Universidad Agrícola de Noruega en un experimento para crear un queso noruego con la calidad exportable del Emmental suizo. La receta es propiedad de la cooperativa noruega Tine, que ha protegido celosamente sus cultivos bacterianos originales desde entonces.',
  },

  // ── AMÉRICA Y OTROS ────────────────────────────────────────────────────────
  {
    nombre: 'Queso Oaxaca', pais: 'México', region: 'Oaxaca', continente: 'América',
    leche: 'Vaca', tipo: 'Tierno', maduracion: 'Consumo fresco (1-3 días)', textura: 'Fibrosa, elástica, pasta hilada, funde perfectamente',
    corteza: 'Sin corteza, presentado en bola o rollo', notasDeSabor: ['Láctico fresco', 'Mantequilla suave', 'Ligeramente salado', 'Neutro'],
    maridaje: ['Tlayudas oaxaqueñas', 'Quesillo derretido', 'Mole negro', 'Chile pasilla'],
    denominacionOrigen: 'Sin DOP (producto regional)',
    descripcion: 'El "quesillo" oaxaqueño es la versión mexicana de la pasta hilada italiana (mozzarella). Se elabora con leche cruda de vaca y se forma en largas tiras que se enrollan en bola. Es el ingrediente imprescindible de las tlayudas, los tetelas y los memelas de la gastronomía oaxaqueña, y funde de forma espectacular.',
    curiosidad: 'Se cuenta que el Queso Oaxaca fue creado por accidente en el siglo XIX cuando una joven quesera de Reyes Etla dejó caer cuajada caliente en agua y descubrió que se volvía elástica y filable. Surgió en el siglo XIX como adaptación zapoteca de las técnicas de pasta hilada que llegaron con monjes agustinos. La innovación quesera de las comunidades de Reyes Etla (Oaxaca) sobre esa base europea es lo que dio al quesillo su forma y técnica actuales, ya plenamente mexicanas.',
  },
  {
    nombre: 'Cotija', pais: 'México', region: 'Michoacán (Sierra de Cotija)', continente: 'América',
    leche: 'Vaca', tipo: 'Añejo', maduracion: '3 meses–1 año', textura: 'Dura, muy seca, granulosa, se desmenuza',
    corteza: 'Dura, seca', notasDeSabor: ['Salado intenso', 'Seco', 'Umami', 'Láctico concentrado'],
    maridaje: ['Elote (maíz) con chile y limón', 'Tacos', 'Enchiladas', 'Mezcal añejo'],
    denominacionOrigen: 'Sin DOP (reconocimiento regional)',
    descripcion: 'Queso seco, salado e intenso de la sierra michoacana, usado rallado o desmenuzado como condimento sobre elotes, frijoles, tacos y enchiladas. Su función gastronómica (aportador de sal, umami y textura) es comparable a la del Parmigiano italiano, aunque su origen, leche y técnica son independientes.',
    curiosidad: 'El Cotija es uno de los pocos quesos americanos con verdadera tradición de maduración larga, heredada directamente de los técnicos queseros españoles del periodo colonial. En Cotija de la Paz (Michoacán), el queso se sigue produciendo con métodos que cambiaron poco desde el siglo XVII, usando las mismas cuevas naturales para la maduración.',
  },
  {
    nombre: 'Paneer', pais: 'India', region: 'Toda la India (origen en el Norte)', continente: 'Otros',
    leche: 'Vaca', tipo: 'Fresco', maduracion: 'Consumo inmediato', textura: 'Firme, no se funde, puede cortarse en dados',
    corteza: 'Sin corteza', notasDeSabor: ['Láctico neutro', 'Suave', 'Muy ligero', 'Absorbe especias'],
    maridaje: ['Palak Paneer', 'Curry de verduras', 'Tandoori', 'Garam masala'],
    denominacionOrigen: 'Sin DOP',
    descripcion: 'El queso indio más extendido fuera de Asia del Sur, cuajado con ácido cítrico o zumo de limón en lugar de cuajo animal. Comparte tradición con otros quesos del subcontinente: chhena, channa, kalari, bandel. No se funde al calentarse, lo que lo hace perfecto para frituras, salteados y curries. Es la principal fuente de proteínas lácteas en la cocina vegetariana india del norte y uno de los alimentos más versátiles de la gastronomía del subcontinente.',
    curiosidad: 'El paneer es el queso que demuestra que se puede hacer queso sin cuajo animal: el ácido (limón, vinagre o suero acidificado) corta la proteína de la misma manera. Esta técnica, independiente de la tradición europea, se desarrolló en la India hace siglos en contextos culturales donde el uso de cuajo animal era problemático por razones religiosas.',
  },
  {
    nombre: 'Queijo da Serra da Estrela', pais: 'Portugal', region: 'Serra da Estrela (Beira Alta)', continente: 'Otros',
    leche: 'Oveja', tipo: 'Pasta blanda', maduracion: '30–45 días mínimo', textura: 'Cremosa a líquida en el interior',
    corteza: 'Fina, amarillenta, se corta como tapa', notasDeSabor: ['Amargo floral', 'Graso y untuoso', 'Hierba de montaña', 'Lanolina', 'Cardamomo (del cuajo vegetal)'],
    maridaje: ['Vinho Verde', 'Porto Branco', 'Pão de centeio', 'Miel de Serra da Estrela'],
    denominacionOrigen: 'DOP Queijo Serra da Estrela',
    descripcion: 'Primo gemelo de la Torta del Casar española: cuajado con flor de cardo, textura cremosa o líquida, sabor amargo y carácter único. Es el queso más valorado y caro de Portugal, elaborado con leche de ovejas Bordaleira que pastan en la sierra más alta de Portugal continental. Su producción es limitadísima y muy estacional.',
    curiosidad: 'El Queijo da Serra solo se produce entre noviembre y marzo, cuando las ovejas Bordaleira pastan en la Serra da Estrela. Este condicionamiento estacional no es una elección: la hierba de invierno de la sierra, con su composición mineral específica y sus aceites esenciales de tomillo y lavanda silvestre, es lo que da al queso su carácter único. Sin esa hierba, no hay queso.',
  },
  {
    nombre: 'Queijo de Azeitão', pais: 'Portugal', region: 'Península de Setúbal', continente: 'Otros',
    leche: 'Oveja', tipo: 'Pasta blanda', maduracion: '20+ días', textura: 'Muy cremosa, casi líquida',
    corteza: 'Fina y suave, amarillenta', notasDeSabor: ['Amargo suave', 'Láctico', 'Floral', 'Graso', 'Cardamomo'],
    maridaje: ['Moscatel de Setúbal', 'Vinho Tinto do Alentejo', 'Pan alentejano', 'Miel'],
    denominacionOrigen: 'DOP Queijo de Azeitão',
    descripcion: 'Queso de pasta blanda de la Península de Setúbal, elaborado también con cuajo de flor de cardo. Más pequeño y de sabor más suave que el Serra da Estrela, con notas florales más pronunciadas por los pastos mediterráneos de la zona. Su nombre proviene del municipio de Azeitão, famoso también por la Moscatel y las Salazones.',
    curiosidad: 'El municipio de Azeitão, además del queso, es la cuna de la Moscatel de Setúbal, uno de los vinos generosos más apreciados de Portugal. La combinación de Queijo de Azeitão con Moscatel es uno de esos matrimonios gastronómicos en los que terroir, tradición y química se alinean de forma casi perfecta: la acidez del queso equilibra el dulzor del vino.',
  },
  {
    nombre: 'Queso Blanco', pais: 'Venezuela / Colombia', region: 'América Latina (tropical)', continente: 'América',
    leche: 'Vaca', tipo: 'Fresco', maduracion: 'Consumo inmediato', textura: 'Firme, no se funde, suave',
    corteza: 'Sin corteza', notasDeSabor: ['Láctico neutro', 'Ligeramente salado', 'Suave y limpio'],
    maridaje: ['Arepas', 'Cachapas venezolanas', 'Pandebono colombiano', 'Aguacate'],
    denominacionOrigen: 'Sin DOP (producto genérico regional)',
    descripcion: 'El queso fresco más extendido de América Latina tropical, con cientos de variantes locales bajo el mismo nombre genérico. Su textura firme y no fundente lo hace ideal para freír, asar o desmenuzar sobre platos. Es el queso de la cotidianidad latinoamericana, tan presente en los desayunos como el pan.',
    curiosidad: 'El Queso Blanco latinoamericano es un excelente ejemplo de cómo una técnica europea (la quesería fresca española y portuguesa) se adaptó al trópico sin cadena de frío: los quesos frescos de alta humedad y consumo inmediato son perfectos para climas calientes donde el transporte y conservación de quesos curados era imposible hasta la llegada de la refrigeración.',
  },
];

export default function GuiaQuesos() {
  const [busqueda, setBusqueda] = useState('');
  const [continente, setContinente] = useState<Continente | 'Todos'>('Todos');
  const [leche, setLeche] = useState<TipoLeche | 'Todas'>('Todas');
  const [tipo, setTipo] = useState<TipoQueso | 'Todos'>('Todos');

  const quesosFiltered = useMemo(() => {
    const t = busqueda.toLowerCase().trim();
    return QUESOS.filter((q) => {
      if (continente !== 'Todos' && q.continente !== continente) return false;
      if (leche !== 'Todas' && q.leche !== leche) return false;
      if (tipo !== 'Todos' && q.tipo !== tipo) return false;
      if (!t) return true;
      return (
        q.nombre.toLowerCase().includes(t) ||
        q.pais.toLowerCase().includes(t) ||
        q.region.toLowerCase().includes(t) ||
        q.notasDeSabor.some((n) => n.toLowerCase().includes(t)) ||
        q.descripcion.toLowerCase().includes(t)
      );
    });
  }, [busqueda, continente, leche, tipo]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Guía de Quesos</h1>
        <p>55 quesos: amplia selección europea y referencias del mundo. Leche, maduración, notas de sabor y maridaje</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── CONTROLES ── */}
        <div className={styles.controles}>
          <input
            type="search"
            placeholder="Buscar por nombre, país, región o nota de sabor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.buscador}
            aria-label="Buscar queso"
          />
          <div className={styles.filtrosRow}>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>País / Región:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por país">
                <button className={`${styles.filtroBtn} ${continente === 'Todos' ? styles.filtroActivo : ''}`} onClick={() => setContinente('Todos')}>Todos</button>
                {CONTINENTES.map((c) => (
                  <button key={c} className={`${styles.filtroBtn} ${continente === c ? styles.filtroActivo : ''}`} onClick={() => setContinente(c)}>{c}</button>
                ))}
              </div>
            </div>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Tipo de leche:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por leche">
                <button className={`${styles.filtroBtn} ${leche === 'Todas' ? styles.filtroActivo : ''}`} onClick={() => setLeche('Todas')}>Todas</button>
                {LECHES.map((l) => (
                  <button key={l} className={`${styles.filtroBtn} ${leche === l ? styles.filtroActivo : ''}`} onClick={() => setLeche(l)}>{LECHE_EMOJI[l]} {l}</button>
                ))}
              </div>
            </div>
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Tipo de queso:</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por tipo">
                <button className={`${styles.filtroBtn} ${tipo === 'Todos' ? styles.filtroActivo : ''}`} onClick={() => setTipo('Todos')}>Todos</button>
                {TIPOS.map((tp) => (
                  <button key={tp} className={`${styles.filtroBtn} ${tipo === tp ? styles.filtroActivo : ''}`} onClick={() => setTipo(tp)}>{tp}</button>
                ))}
              </div>
            </div>
          </div>
          <p className={styles.contador} aria-live="polite">
            {quesosFiltered.length} {quesosFiltered.length === 1 ? 'queso' : 'quesos'}
          </p>
        </div>

        {/* ── GRID ── */}
        <div className={styles.grid}>
          {quesosFiltered.map((q) => (
            <article key={q.nombre} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.tipoBadge} ${TIPO_CLASS[q.tipo]}`}>{q.tipo}</span>
                <span className={styles.lecheBadge}>{LECHE_EMOJI[q.leche]} {q.leche}</span>
              </div>

              <div className={styles.cardTitulo}>
                <h2 className={styles.nombre}>{q.nombre}</h2>
                <span className={styles.paisRegion}>{q.pais} · {q.region}</span>
              </div>

              <span className={styles.maduracionPill}>⏱️ {q.maduracion}</span>

              <p className={styles.descripcion}>{q.descripcion}</p>

              <div className={styles.notasSection}>
                <span className={styles.sectionLabel}>Notas de sabor</span>
                <div className={styles.notasTags}>
                  {q.notasDeSabor.map((n) => <span key={n} className={styles.notaTag}>{n}</span>)}
                </div>
              </div>

              <div className={styles.maridajeSection}>
                <span className={styles.sectionLabel}>Maridaje</span>
                <div className={styles.maridajeTags}>
                  {q.maridaje.map((m) => <span key={m} className={styles.maridajeTag}>{m}</span>)}
                </div>
              </div>

              <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                  <span className={styles.sectionLabel}>Corteza</span>
                  <span className={styles.cortexaRow}>{q.corteza}</span>
                </div>
              </div>

              <div>
                {q.denominacionOrigen !== 'Sin denominación' && q.denominacionOrigen !== 'Sin DOP' && !q.denominacionOrigen.startsWith('Sin ') ? (
                  <span className={styles.doPill}>🏷️ {q.denominacionOrigen}</span>
                ) : (
                  <span className={styles.sinDo}>{q.denominacionOrigen}</span>
                )}
              </div>

              <div className={styles.curiosidadBox}>
                <span className={styles.curiosidadIcon} aria-hidden="true">🧀</span>
                <p className={styles.curiosidadText}>{q.curiosidad}</p>
              </div>
            </article>
          ))}
          {quesosFiltered.length === 0 && (
            <p className={styles.sinResultados}>No se encontraron quesos con esos criterios.</p>
          )}
        </div>
      </main>

      <EducationalSection
        title="El mundo del queso: historia, ciencia y maridaje"
        subtitle="Del pastoreo neolítico a las DOP europeas: 10.000 años de queso"
      >
        <p>
          El queso es uno de los alimentos más antiguos de la humanidad, descubierto probablemente por accidente
          cuando los primeros pastores neolíticos almacenaron leche en estómagos de rumiantes y observaron que
          la leche cuajaba. Hoy existen más de 1.800 variedades registradas en el mundo, desde el queso fresco
          más sencillo hasta los grandes añejos que se miden en años de maduración.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption>Comparativa por tipo de queso</caption>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Maduración</th>
                <th>Temperatura servicio</th>
                <th>Uso ideal</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Fresco</td><td>0–2 semanas</td><td>8–10°C</td><td>Ensaladas, postres, crudo</td></tr>
              <tr><td>Tierno</td><td>2–6 semanas</td><td>10–14°C</td><td>Bocadillos, tabla, cocinar</td></tr>
              <tr><td>Semicurado</td><td>1–6 meses</td><td>14–16°C</td><td>Tabla, aperitivos, fundir</td></tr>
              <tr><td>Curado</td><td>6–18 meses</td><td>16–18°C</td><td>Tabla, maridaje, rallado</td></tr>
              <tr><td>Añejo</td><td>18+ meses</td><td>18–20°C</td><td>Solo o con fruta/miel, rallado</td></tr>
              <tr><td>Azul</td><td>2–12 meses</td><td>14–18°C</td><td>Tabla, salsas, maridaje con dulce</td></tr>
              <tr><td>Pasta blanda</td><td>2–8 semanas</td><td>16–18°C</td><td>Untar, tabla, con pan crujiente</td></tr>
            </tbody>
          </table>
        </div>

        <h3>¿Para qué ocasión?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>🍷 Tabla de quesos con vino</h4>
            <p>Combina 3–5 quesos de distinta intensidad: un fresco (Tetilla, Burrata), un semicurado (Mahón, Gouda), un curado (Manchego, Comté) y un azul (Cabrales, Gorgonzola). Añade membrillo, nueces y uva.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🍕 Cocinar con queso</h4>
            <p>Para fundir: Gruyère, Taleggio, Raclette, Scamorza. Para gratinar: Parmigiano, Grana. Para pizza: Mozzarella di Bufala. Para pasta: Pecorino Romano o Parmigiano rallado.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🎉 Aperitivo informal</h4>
            <p>Quesos de fácil acceso: Tetilla, Brie, Wensleydale, Havarti. Acompañamientos: membrillo, miel, frutos secos, embutido. Vino espumoso o cerveza artesana.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🏆 Degustación de experto</h4>
            <p>Torta del Casar con cuajo vegetal, Cabrales de cueva, Roquefort AOP, Comté 36 meses, Époisses lavado. Solo o con Sauternes, Oporto o un licor de fruta.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre queso con leche cruda y pasteurizada?</strong>
            <p>La pasteurización elimina patógenos pero también bacterias beneficiosas que desarrollan complejidad aromática. Los quesos con leche cruda suelen tener más carácter, matices y terroir, pero requieren mayor control sanitario. La mayoría de grandes quesos con DOP europeos exigen leche cruda.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Se puede comer la corteza?</strong>
            <p>Depende del tipo. Las cortezas enmohecidas del Brie y Camembert son comestibles y sabrosas. Las cortezas lavadas (Taleggio, Époisses) también, aunque más intensas. Las cortezas duras del Parmigiano o Manchego no se comen directamente, aunque se añaden a caldos y sopas para dar sabor.</p>
            <span className={styles.faqTip}>🧀 Las cortezas del Parmigiano hervidas en risotto o minestrone son un truco de la cocina italiana clásica.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo se conserva correctamente el queso?</strong>
            <p>En papel de quesero o de cera (no en plástico film), en el cajón de verduras del frigorífico (temperatura 4–8°C). Los quesos frescos aguantan 3–5 días; los curados, varias semanas. Antes de servir, sacar de la nevera 30–60 minutos para que los aromas se liberen.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la DOP y por qué importa?</strong>
            <p>La Denominación de Origen Protegida garantiza que el queso se produce en una zona geográfica específica con métodos definidos. Comprar queso con DOP es la única forma de asegurar autenticidad. El Manchego, Parmigiano o Feta DOP son productos radicalmente diferentes a sus imitaciones industriales.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo marido un queso azul con vino?</strong>
            <p>La clave es el contraste dulce-salado: los azules piden vinos dulces (Sauternes con Roquefort, Oporto con Stilton, Lambrusco con Gorgonzola). También funcionan los vinos tánicos potentes que compiten en intensidad. Los vinos ligeros o blancos secos quedan aplastados por el azul.</p>
            <span className={styles.faqTip}>💡 Miel sobre Cabrales es el maridaje por excelencia del norte de España. Prueba también con nueces.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué unos quesos huelen más que otros?</strong>
            <p>El olor intenso proviene principalmente de las bacterias que actúan en la corteza durante la maduración. Los quesos de corteza lavada (Époisses, Taleggio, Munster) son los más aromáticos porque el lavado periódico estimula bacterias Brevibacterium que producen compuestos sulfurosos. Paradójicamente, el interior suele ser más suave que el aroma.</p>
          </li>
        </ul>

        <h3>Guía de maridaje paso a paso</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Ordena por intensidad</strong>
              <p>Siempre de menos a más intenso: empieza por los frescos y tiernos, termina por los curados y azules. El paladar se satura y un queso intenso al principio enmascara los sabores suaves posteriores.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Temperatura de servicio</strong>
              <p>Saca el queso del frigorífico entre 30 y 60 minutos antes de servir. El queso frío pierde hasta el 70% de sus aromas. Esta es la regla más violada y que más impacto tiene en la experiencia.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Elige los acompañamientos</strong>
              <p>El membrillo y la miel funcionan con casi todo. La fruta fresca (uva, pera, higo) limpia el paladar entre quesos. Los frutos secos (nueces, almendras) complementan los curados. Evita pan muy sazonado que compita con el queso.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Principio de terroir</strong>
              <p>Los quesos maridan bien con vinos y productos de su misma región: Manchego con Tempranillo manchego, Roquefort con Sauternes, Crottin de Chavignol con Sancerre, Asiago con Soave. El terroir compartido crea afinidades casi automáticas.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Contraste vs. complemento</strong>
              <p>Dos estrategias: buscar sabores similares (queso cremoso + vino untuoso) o contrastes que se equilibran (queso salado-picante + vino dulce). Ambas funcionan. La más segura para principiantes: dulce con azul, espumoso con cremoso.</p>
            </div>
          </li>
        </ol>

        <h3>Consejos de conservación y servicio</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📦</span>
            <h4>Nunca en plástico</h4>
            <p>El film plástico asfixia el queso y acelera la formación de mohos no deseados. Usa papel de quesero, papel vegetal o papel de cera. Permite respirar al queso sin secarlo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
            <h4>Temperatura antes de servir</h4>
            <p>30–60 minutos fuera del frigorífico antes de servir. Los aromas se liberan con el calor. Un queso frío es como un vino sin abrir: técnicamente correcto pero sin expresión.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔪</span>
            <h4>Un cuchillo por queso</h4>
            <p>Para no mezclar sabores en una tabla, usa cuchillos diferentes (o limpia el mismo entre queso y queso). Un azul potente en el cuchillo arruina el siguiente queso suave.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧀</span>
            <h4>El orden importa</h4>
            <p>En una cata: suave → intenso, fresco → curado, sin moho → azul. Nunca al revés. Una vez que el paladar ha recibido un azul fuerte, le cuesta percibir los matices de un fresco.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🍞</span>
            <h4>El pan: neutro</h4>
            <p>Para una cata seria, el pan debe ser neutro (baguette, pan blanco sin sal). Las tostadas con ajo, el pan de aceitunas o el pan de especias pueden enmascarar los matices del queso.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes con el queso</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Guardar en film plástico:</strong> asfixia el queso, provoca condensación y acelera el deterioro. Siempre papel de quesero o cera.</li>
            <li><strong>Servir frío directamente del frigorífico:</strong> el queso frío pierde hasta el 70% de sus aromas. Los 30 minutos de atemperar cambian completamente la experiencia.</li>
            <li><strong>Confundir "Parmesan" industrial con Parmigiano Reggiano:</strong> son productos radicalmente distintos. El industrial puede ser mezcla de quesos, celulosa y sal. Leer la etiqueta.</li>
            <li><strong>Cortar el Stilton o Cabrales mal:</strong> los quesos azules deben cortarse preservando las venas. Cortar en cuñas desde el exterior hacia el centro, nunca en rodajas horizontales.</li>
            <li><strong>Mezclar todos los quesos en el mismo envase:</strong> los azules contaminan con Penicillium a los quesos cercanos. Guardar siempre por separado.</li>
            <li><strong>Comprar "Feta" o "Manchego" sin verificar la DOP:</strong> estos nombres están legalmente reservados en la UE a productos de zonas y métodos específicos. Las imitaciones pueden ser buenos quesos, pero comprarlos con DOP es lo único que garantiza que se trata del producto original protegido.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-quesos')} />
      <ShareCard appName="guia-quesos" />
      <Footer appName="guia-quesos" />
    </div>
  );
}
