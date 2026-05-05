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
import styles from './GuiaVarietalesVino.module.css';
import { jsonLd } from './metadata';

// ── Tipos ───────────────────────────────────────────────────────────────────

type TipoUva = 'Tinto' | 'Blanco' | 'Rosado' | 'Espumoso';
type Cuerpo = 'Ligero' | 'Medio' | 'Medio-complejo' | 'Complejo';
type Taninos = 'Sin taninos' | 'Bajos' | 'Medios' | 'Altos' | 'Muy altos';
type Acidez = 'Baja' | 'Media' | 'Alta' | 'Muy alta';

interface Varietal {
  nombre: string;
  nombreOriginal: string;
  tipo: TipoUva;
  origen: string;
  zonasPrincipales: string[];
  notasDeSabor: string[];
  cuerpo: Cuerpo;
  taninos: Taninos;
  acidez: Acidez;
  temperaturaServicio: string;
  maridaje: string[];
  dosDestacadas: string[];
  descripcion: string;
  curiosidad: string;
}

// ── Escalas numéricas ────────────────────────────────────────────────────────

const CUERPO_NIVEL: Record<Cuerpo, number> = {
  Ligero: 1,
  Medio: 2,
  'Medio-complejo': 3,
  Complejo: 4,
};

const TANINOS_NIVEL: Record<Taninos, number> = {
  'Sin taninos': 0,
  Bajos: 1,
  Medios: 2,
  Altos: 3,
  'Muy altos': 4,
};

const ACIDEZ_NIVEL: Record<Acidez, number> = {
  Baja: 1,
  Media: 2,
  Alta: 3,
  'Muy alta': 4,
};

const TIPOS: Array<TipoUva | 'Todos'> = ['Todos', 'Tinto', 'Blanco', 'Espumoso'];

// ── Datos: 40 varietales ─────────────────────────────────────────────────────

const VARIETALES: Varietal[] = [
  // ── TINTOS (20) ──
  {
    nombre: 'Tempranillo', nombreOriginal: 'Tempranillo', tipo: 'Tinto', origen: 'España (Rioja/Duero)',
    zonasPrincipales: ['Rioja', 'Ribera del Duero', 'Toro', 'Valdepeñas', 'Portugal (Aragonez)'],
    notasDeSabor: ['Cereza', 'Ciruela', 'Cuero', 'Vainilla', 'Tabaco', 'Tierra roja'],
    cuerpo: 'Medio-complejo', taninos: 'Medios', acidez: 'Media',
    temperaturaServicio: '16–18 °C',
    maridaje: ['Cordero asado', 'Cecina', 'Jamón ibérico', 'Queso manchego', 'Ternera en salsa'],
    dosDestacadas: ['D.O.Ca Rioja', 'D.O. Ribera del Duero', 'D.O. Toro'],
    descripcion: 'La variedad española por excelencia. El tempranillo es la base de los grandes vinos de Rioja y Ribera del Duero. Su nombre viene de "temprano" por su maduración precoz. Es una uva versátil que expresa muy bien el roble: en Rioja con notas de vainilla y cuero, en Ribera con más fruta y mineralidad.',
    curiosidad: 'El tempranillo es la tercera uva más plantada del mundo, pero durante siglos fue casi desconocida fuera de España. Su internacionalización se aceleró cuando la D.O.Ca Rioja empezó a exportar masivamente en los años 1980. En Portugal se llama Aragonez en el Alentejo y Tinta Roriz en el Douro.',
  },
  {
    nombre: 'Cabernet Sauvignon', nombreOriginal: 'Cabernet Sauvignon', tipo: 'Tinto', origen: 'Francia (Burdeos)',
    zonasPrincipales: ['Burdeos (Médoc)', 'Napa Valley', 'Coonawarra (Australia)', 'Maipo (Chile)', 'Toscana'],
    notasDeSabor: ['Grosella negra', 'Cedro', 'Menta', 'Grafito', 'Tabaco', 'Violeta'],
    cuerpo: 'Complejo', taninos: 'Muy altos', acidez: 'Media',
    temperaturaServicio: '17–19 °C',
    maridaje: ['Chuletón', 'Cordero rack', 'Caza mayor', 'Quesos curados', 'Foie gras'],
    dosDestacadas: ['A.O.C. Pauillac', 'A.O.C. Saint-Estèphe', 'Napa Valley AVA'],
    descripcion: 'El rey de las uvas tintas a nivel mundial. El Cabernet Sauvignon domina los grandes vinos de Burdeos y Napa. Sus taninos potentes y su acidez equilibrada le dan una capacidad de envejecimiento excepcional: las mejores botellas mejoran durante décadas. Es el componente principal de Château Pétrus, Opus One y los Grandes Crus de Médoc.',
    curiosidad: 'El Cabernet Sauvignon es fruto de un cruce accidental entre Cabernet Franc y Sauvignon Blanc en el siglo XVII en Burdeos. Este origen fue un misterio durante siglos hasta que el análisis de ADN en 1997 en la UC Davis lo reveló definitivamente. La "paternidad" de los dos progenitores explica su estructura tánica (Cab Franc) y sus notas herbáceas (Sauvignon Blanc).',
  },
  {
    nombre: 'Pinot Noir', nombreOriginal: 'Pinot Noir', tipo: 'Tinto', origen: 'Francia (Borgoña)',
    zonasPrincipales: ['Borgoña (Côte de Nuits)', 'Champagne', 'Oregón (Willamette)', 'Nueva Zelanda (Marlborough)', 'Alemania (Baden)'],
    notasDeSabor: ['Cereza', 'Frambuesa', 'Tierra húmeda', 'Hongos', 'Rosa', 'Canela'],
    cuerpo: 'Ligero', taninos: 'Bajos', acidez: 'Alta',
    temperaturaServicio: '14–16 °C',
    maridaje: ['Salmón', 'Pato a la naranja', 'Trufa', 'Queso Brie', 'Cordero lechal'],
    dosDestacadas: ['A.O.C. Gevrey-Chambertin', 'A.O.C. Vosne-Romanée', 'Willamette Valley AVA'],
    descripcion: 'La uva más difícil del mundo. El Pinot Noir es capaz de producir los vinos más elegantes y complejos de la humanidad (Romanée-Conti) pero también los más decepcionantes. Su piel fina la hace vulnerable a enfermedades y climas. En Borgoña, los mejores premiers y grands crus alcanzan precios de miles de euros por botella.',
    curiosidad: 'La Romanée-Conti, producida con Pinot Noir de la Côte de Nuits, es el vino más caro del mundo vendido en subasta: una botella de 1945 se vendió en 2018 por 558.000 dólares. La parcela que la produce (1,8 hectáreas) está valorada en más de 100 millones de euros. El Grand Cru de Borgoña más caro por metro cuadrado del mundo.',
  },
  {
    nombre: 'Syrah / Shiraz', nombreOriginal: 'Syrah (EU) / Shiraz (AU)', tipo: 'Tinto', origen: 'Francia (Ródano)',
    zonasPrincipales: ['Valle del Ródano Norte', 'Barossa Valley (Australia)', 'Maipo (Chile)', 'Mendoza (Argentina)', 'Sudáfrica'],
    notasDeSabor: ['Mora', 'Pimienta negra', 'Olive tapenade', 'Violeta', 'Ahumado', 'Cacao'],
    cuerpo: 'Complejo', taninos: 'Altos', acidez: 'Media',
    temperaturaServicio: '16–18 °C',
    maridaje: ['Cordero al romero', 'Venado', 'Chorizo', 'Queso manchego añejo', 'Paté de caza'],
    dosDestacadas: ['A.O.C. Hermitage', 'A.O.C. Crozes-Hermitage', 'Barossa Valley GI'],
    descripcion: 'Una uva de dos mundos: en el Ródano norte produce vinos elegantes y especiados (Syrah); en Australia los hace potentes, frutales y opulentos (Shiraz). En ambos casos, su nota característica de pimienta negra (debida al rotundone) la hace inconfundible. Grange Hermitage de Penfolds es considerado el gran vino australiano.',
    curiosidad: 'Durante siglos se creyó que el Syrah tenía origen persa (de la ciudad de Shiraz, Irán) o siciliano. El análisis genético reveló en 1999 que es originario de la región del Ródano, fruto de un cruce entre Dureza y Mondeuse Blanche. La leyenda oriental era completamente falsa pero tan buena que contribuyó al marketing del Shiraz australiano.',
  },
  {
    nombre: 'Merlot', nombreOriginal: 'Merlot', tipo: 'Tinto', origen: 'Francia (Burdeos)',
    zonasPrincipales: ['Pomerol', 'Saint-Émilion', 'Toscana (Supertoscanos)', 'Washington State', 'Chile'],
    notasDeSabor: ['Ciruela madura', 'Chocolate', 'Fruta del bosque', 'Trufa', 'Vainilla'],
    cuerpo: 'Medio-complejo', taninos: 'Medios', acidez: 'Media',
    temperaturaServicio: '15–17 °C',
    maridaje: ['Ternera asada', 'Risotto de setas', 'Pasta con ragú', 'Pollo al horno', 'Queso brie'],
    dosDestacadas: ['A.O.C. Pomerol', 'A.O.C. Saint-Émilion', 'D.O. Toscana (IGT)'],
    descripcion: 'El Merlot es la uva más plantada de Burdeos y la más accesible de las grandes variedades tintas. Sus taninos suaves y su fruta generosa lo hacen ideal para iniciarse en el vino tinto. Château Pétrus, el vino más caro del mundo producido casi en su totalidad con Merlot, demostró que esta uva puede alcanzar las más altas cotas de calidad.',
    curiosidad: 'La película "Sideways" (2004) popularizó el odio al Merlot en EEUU: el protagonista declaró que "no beberá Merlot ni aunque esté agonizando". Las ventas de Merlot cayeron un 2% en EEUU el año siguiente. Al mismo tiempo, las ventas de Pinot Noir subieron un 16%. Fue el mayor impacto de una película en el mercado del vino en la historia.',
  },
  {
    nombre: 'Garnacha', nombreOriginal: 'Grenache (FR) / Garnacha (ES)', tipo: 'Tinto', origen: 'España (Aragón)',
    zonasPrincipales: ['Priorat', 'Campo de Borja', 'Châteauneuf-du-Pape', 'Sardinia (Cannonau)', 'Rioja'],
    notasDeSabor: ['Frambuesa', 'Especias', 'Pimienta blanca', 'Regaliz', 'Flor de lavanda'],
    cuerpo: 'Medio-complejo', taninos: 'Bajos', acidez: 'Baja',
    temperaturaServicio: '15–17 °C',
    maridaje: ['Cochinillo', 'Costillas BBQ', 'Queso manchego', 'Tapenade', 'Cordero especiado'],
    dosDestacadas: ['D.O.Q. Priorat', 'A.O.C. Châteauneuf-du-Pape', 'D.O. Campo de Borja'],
    descripcion: 'La Garnacha es la uva española más extendida internacionalmente. En Priorat, sobre suelos de llicorella (pizarra), produce vinos de concentración excepcional. En Châteauneuf-du-Pape es el corazón de los legendarios blends del Ródano sur. En Cerdeña (Cannonau) tiene miles de años de historia y se asocia con la longevidad de los sardos.',
    curiosidad: 'Cerdeña tiene el mayor número de centenarios per cápita del mundo, y la Garnacha (Cannonau) que producen y consumen en cantidades moderadas es uno de los factores estudiados. El Cannonau sardo tiene el doble de resveratrol que el Pinot Noir de Borgoña. Los investigadores del Blue Zone de Dan Buettner lo señalan como parte del "triángulo de la longevidad" sardo.',
  },
  {
    nombre: 'Nebbiolo', nombreOriginal: 'Nebbiolo', tipo: 'Tinto', origen: 'Italia (Piamonte)',
    zonasPrincipales: ['Barolo', 'Barbaresco', 'Valtellina', 'Langhe', 'Valle d\'Aosta'],
    notasDeSabor: ['Rosa seca', 'Alquitrán', 'Violeta', 'Cereza ácida', 'Tabaco', 'Trufa'],
    cuerpo: 'Complejo', taninos: 'Muy altos', acidez: 'Muy alta',
    temperaturaServicio: '17–19 °C',
    maridaje: ['Trufa blanca de Alba', 'Brasato al Barolo', 'Queso Castelmagno', 'Caza', 'Risotto al Barolo'],
    dosDestacadas: ['DOCG Barolo', 'DOCG Barbaresco', 'DOC Valtellina Superiore'],
    descripcion: 'El Nebbiolo es la uva más noble de Italia y una de las más difíciles del mundo. Produce Barolo y Barbaresco, los "grandes rojos italianos". Su altísima acidez y taninos legendarios requieren envejecimiento de décadas para suavizarse. Los mejores Barolo no muestran su mejor cara hasta pasados 15-20 años.',
    curiosidad: 'El Barolo era el vino favorito de Cavour (el unificador de Italia) y de la Casa Real de Saboya. Se sirvió en la celebración de la proclamación del Reino de Italia en 1861. Por eso se conoce como "el vino de los reyes y el rey de los vinos". El nombre Nebbiolo viene de "nebbia" (niebla): la uva madura en octubre, cuando las colinas del Piamonte están envueltas en niebla.',
  },
  {
    nombre: 'Sangiovese', nombreOriginal: 'Sangiovese', tipo: 'Tinto', origen: 'Italia (Toscana)',
    zonasPrincipales: ['Chianti Classico', 'Brunello di Montalcino', 'Morellino di Scansano', 'Montepulciano', 'Romagna'],
    notasDeSabor: ['Cereza', 'Tierra', 'Hierbas secas', 'Ciruela', 'Cuero', 'Tomillo'],
    cuerpo: 'Medio-complejo', taninos: 'Altos', acidez: 'Alta',
    temperaturaServicio: '16–18 °C',
    maridaje: ['Pizza napolitana', 'Bistecca alla Fiorentina', 'Pasta al ragú', 'Pecorino Toscano', 'Caza'],
    dosDestacadas: ['DOCG Chianti Classico', 'DOCG Brunello di Montalcino', 'DOCG Vino Nobile di Montepulciano'],
    descripcion: 'El Sangiovese es la uva más plantada de Italia y la columna vertebral del Chianti y el Brunello. En Montalcino, la clona Brunello produce el vino italiano de envejecimiento más largo: los mejores se abren después de 25-30 años. Su acidez elevada lo convierte en el compañero perfecto de la cocina italiana basada en tomate.',
    curiosidad: 'El Supertoscano nació en 1971 cuando el marqués Antinori creó el Sassicaia, un blend de Cabernet y Sangiovese que violaba las normas del DOC Chianti. Tuvo que venderse como "Vino da Tavola" (vino de mesa, la categoría más baja). Fue tan brillante que la normativa italiana creó el IGT en 1992 para acomodar estos vinos innovadores. Hoy el Sassicaia tiene su propia DOC.',
  },
  {
    nombre: 'Malbec', nombreOriginal: 'Malbec', tipo: 'Tinto', origen: 'Francia (Cahors) → Argentina',
    zonasPrincipales: ['Mendoza (Luján de Cuyo)', 'Cahors (Francia)', 'Valle de Uco', 'Patagonia', 'Cafayate (Salta)'],
    notasDeSabor: ['Ciruela negra', 'Mora', 'Violeta', 'Chocolate negro', 'Vainilla', 'Humo'],
    cuerpo: 'Complejo', taninos: 'Medios', acidez: 'Media',
    temperaturaServicio: '16–18 °C',
    maridaje: ['Asado argentino', 'Costillar de vacuno', 'Empanadas', 'Queso provolone', 'Chimichurri'],
    dosDestacadas: ['D.O. Mendoza', 'D.O. Luján de Cuyo', 'A.O.C. Cahors'],
    descripcion: 'El Malbec es la historia de una redención: una uva menor en Francia que encontró su tierra prometida en los Andes argentinos. A 900-1.500 msnm en Mendoza, la radiación UV intensa, las noches frías y los suelos aluviales producen Malbecs de color negro intenso, fruta opulenta y taninos sedosos.',
    curiosidad: 'El Malbec era prácticamente desconocido en Argentina hasta 1853, cuando el agrónomo francés Michel Pouget lo introdujo en Mendoza por encargo del gobierno. Durante un siglo fue uva de corte, sin protagonismo. La internacionalización del Malbec argentino fue impulsada por el sommelier Robert Parker en los años 1990, cuando puntuó varios ejemplares por encima de 90 puntos.',
  },
  {
    nombre: 'Monastrell', nombreOriginal: 'Monastrell (ES) / Mourvèdre (FR)', tipo: 'Tinto', origen: 'España (Levante)',
    zonasPrincipales: ['Jumilla', 'Yecla', 'Alicante', 'Bandol (Provenza)', 'Valle de Barossa'],
    notasDeSabor: ['Mora salvaje', 'Carne curada', 'Pimienta', 'Cacao', 'Lavanda', 'Mineral'],
    cuerpo: 'Complejo', taninos: 'Muy altos', acidez: 'Baja',
    temperaturaServicio: '16–18 °C',
    maridaje: ['Chuletas de cerdo', 'Estofado de caza', 'Queso Murcia al vino', 'Embutidos ibéricos', 'Cordero especiado'],
    dosDestacadas: ['D.O. Jumilla', 'D.O. Yecla', 'A.O.C. Bandol'],
    descripcion: 'La Monastrell/Mourvèdre es la uva española más resistente al calor, perfecta para el clima extremo del Sureste ibérico. En Jumilla y Yecla produce vinos de alta graduación, color casi opaco y fruta salvaje intensa. En Bandol (Provenza) es la base de los rosados más famosos del mundo.',
    curiosidad: 'En el siglo XVIII, los vinos de Jumilla y Yecla se exportaban masivamente a Francia para "corregir" los vinos débiles de Burdeos añadiéndoles cuerpo y color. Esta práctica, técnicamente ilegal pero ampliamente extendida, dio lugar a los llamados "vinos médecin" (vinos médico). El escándalo del vino adulterado francés de 1907 acabó con este comercio.',
  },
  {
    nombre: 'Mencía', nombreOriginal: 'Mencía', tipo: 'Tinto', origen: 'España (Galicia/León)',
    zonasPrincipales: ['Bierzo', 'Ribeira Sacra', 'Valdeorras', 'Monterrei'],
    notasDeSabor: ['Arándano', 'Violeta', 'Grafito', 'Hierba fresca', 'Cereza negra', 'Mineral pizarroso'],
    cuerpo: 'Medio', taninos: 'Medios', acidez: 'Alta',
    temperaturaServicio: '14–16 °C',
    maridaje: ['Pulpo a feira', 'Pimientos de Padrón', 'Lacón', 'Zorza', 'Queso tetilla'],
    dosDestacadas: ['D.O. Bierzo', 'D.O. Ribeira Sacra', 'D.O. Valdeorras'],
    descripcion: 'La Mencía es la revelación de la viticultura española contemporánea. Sobre suelos de pizarra en el Bierzo y las terrazas empinadas de la Ribeira Sacra, produce vinos frescos, minerales y muy elegantes que recuerdan al Pinot Noir de Borgoña. El sumiller Álvaro Palacios fue clave en su internacionalización.',
    curiosidad: 'Las viñas de la Ribeira Sacra crecen en terrazas sobre el río Sil con pendientes de hasta 60 grados, consideradas entre las más extremas de Europa. La vendimia es completamente manual y muchos racimos deben bajarse en cestas por tirolinas sobre el río. El coste de producción es el más alto de España.',
  },
  {
    nombre: 'Touriga Nacional', nombreOriginal: 'Touriga Nacional', tipo: 'Tinto', origen: 'Portugal (Duero)',
    zonasPrincipales: ['Douro', 'Dão', 'Porto (vinos de Oporto)'],
    notasDeSabor: ['Mora silvestre', 'Violeta intensa', 'Flor de azahar', 'Grafito', 'Chocolate'],
    cuerpo: 'Complejo', taninos: 'Muy altos', acidez: 'Media',
    temperaturaServicio: '17–19 °C',
    maridaje: ['Bacalhau à Brás', 'Queso Serra da Estrela', 'Caza', 'Ternera estofada', 'Cordero al forno'],
    dosDestacadas: ['DOC Douro', 'DOC Dão', 'Porto Vintage'],
    descripcion: 'La Touriga Nacional es la uva más noble de Portugal y el componente principal de los mejores Vinos de Oporto Vintage. Produce vinos de extraordinaria intensidad aromática, dominada por la violeta y los frutos negros. Sus pieles gruesas y sus racimos pequeños dan bajas producciones pero concentración excepcional.',
    curiosidad: 'La Touriga Nacional estuvo al borde de la extinción en los años 1960: quedaban menos de 1.000 hectáreas plantadas en todo Portugal. Las plagas y la presión por variedades más productivas la arrinconaron. Fue salvada por investigadores del INIAV portugués que la recuperaron y relanzaron. Hoy es la embajadora del vino portugués en el mundo.',
  },
  {
    nombre: 'Cabernet Franc', nombreOriginal: 'Cabernet Franc', tipo: 'Tinto', origen: 'Francia (Burdeos/Loire)',
    zonasPrincipales: ['Saint-Émilion', 'Chinon (Loire)', 'Saumur-Champigny', 'Pomerol', 'Italia (Friuli)'],
    notasDeSabor: ['Pimiento rojo', 'Grosellas', 'Violeta', 'Grafito', 'Frambuesa', 'Hierbas finas'],
    cuerpo: 'Medio', taninos: 'Medios', acidez: 'Alta',
    temperaturaServicio: '15–17 °C',
    maridaje: ['Ternera a la brasa', 'Queso de cabra Sancerre', 'Salmón ahumado', 'Cordero con hierbas'],
    dosDestacadas: ['A.O.C. Chinon', 'A.O.C. Saint-Émilion (blend)', 'A.O.C. Saumur-Champigny'],
    descripcion: 'El Cabernet Franc es el progenitor del Cabernet Sauvignon y la variedad de respaldo del Merlot en los grandes blends de Burdeos. Solo en el Valle del Loire —especialmente en Chinon— alcanza el protagonismo que merece. Produce vinos más ligeros, frescos y elegantes que el Cabernet Sauvignon, con una nota herbal característica.',
    curiosidad: 'Château Cheval Blanc, uno de los dos únicos Premier Grand Cru Classé A de Saint-Émilion, tiene la plantación de Cabernet Franc más grande del mundo en un gran vino de Burdeos: el 57% de su viñedo es Cab Franc. Su cosecha de 1947 es considerada el mejor vino de la historia del siglo XX por muchos críticos.',
  },
  {
    nombre: 'Nero d\'Avola', nombreOriginal: 'Nero d\'Avola', tipo: 'Tinto', origen: 'Italia (Sicilia)',
    zonasPrincipales: ['Sicilia (Ragusa, Siracusa)', 'D.O.C. Eloro', 'D.O.C. Cerasuolo di Vittoria'],
    notasDeSabor: ['Cereza negra', 'Ciruela', 'Chocolate amargo', 'Regaliz', 'Especias mediterráneas'],
    cuerpo: 'Complejo', taninos: 'Altos', acidez: 'Media',
    temperaturaServicio: '16–18 °C',
    maridaje: ['Arancini', 'Pasta alla Norma', 'Pecorino siciliano', 'Atún a la brasa', 'Carne alla griglia'],
    dosDestacadas: ['DOC Eloro', 'DOCG Cerasuolo di Vittoria', 'IGT Sicilia'],
    descripcion: 'El "Cabernet Sauvignon de Sicilia". El Nero d\'Avola es la uva tinta más noble de la isla, capaz de producir vinos de alta concentración y envejecimiento. Durante décadas se usó para fortalecer y dar color a vinos del norte de Italia. Desde los años 1990, las bodegas sicilianas lo reivindican como estrella propia.',
    curiosidad: 'La ciudad de Avola (Sicilia) da nombre al Nero d\'Avola. Pero Avola es también mundialmente famosa por otro producto: las almendras de Avola, las más caras y finas del mundo, usadas en los mejores mazapanes y nougats italianos. El mismo territorio árido y soleado del sur de Sicilia produce dos joyas gastronómicas absolutamente distintas.',
  },
  {
    nombre: 'Zinfandel', nombreOriginal: 'Zinfandel (US) / Primitivo (IT)', tipo: 'Tinto', origen: 'Croacia → EEUU/Italia',
    zonasPrincipales: ['Sonoma (Dry Creek)', 'Paso Robles', 'Puglia (Primitivo)', 'Lodi (California)'],
    notasDeSabor: ['Mora', 'Chocolate', 'Pimienta', 'Regaliz', 'Canela', 'Mermelada de frutos rojos'],
    cuerpo: 'Complejo', taninos: 'Medios', acidez: 'Media',
    temperaturaServicio: '15–17 °C',
    maridaje: ['BBQ ribs', 'Pizza con pepperoni', 'Queso Cheddar añejo', 'Hamburguesa', 'Salami picante'],
    dosDestacadas: ['Dry Creek Valley AVA', 'DOC Primitivo di Manduria', 'Paso Robles AVA'],
    descripcion: 'El Zinfandel es la uva americana por excelencia, aunque su origen real es croata (Crljenak Kaštelanski). Produce vinos potentes, con alta graduación alcohólica (14-17%), rica fruta roja y negra, y especias. En California, las viñas centenarias de Sonoma producen Zinfandel de una complejidad excepcional.',
    curiosidad: 'El origen del Zinfandel fue un misterio durante dos siglos. En 1994, la científica Carole Meredith de UC Davis inició la investigación genética que finalmente en 2001 identificó como su cepa original al Crljenak Kaštelanski croata, prácticamente extinto con solo 9 cepas supervivientes en la isla de Hvar. Una de las uvas más americanas del mundo tenía pasaporte croata.',
  },
  {
    nombre: 'Tannat', nombreOriginal: 'Tannat', tipo: 'Tinto', origen: 'Francia (Madiran) → Uruguay',
    zonasPrincipales: ['Madiran (Gascuña)', 'Uruguay (Canelones, Colonia)', 'Argentina (Mendoza)'],
    notasDeSabor: ['Arándano', 'Aceituna negra', 'Cuero', 'Cedro', 'Chocolate negro', 'Especias'],
    cuerpo: 'Complejo', taninos: 'Muy altos', acidez: 'Alta',
    temperaturaServicio: '17–18 °C',
    maridaje: ['Foie gras', 'Cassoulet', 'Carne de caza', 'Queso Roquefort', 'Asado uruguayo'],
    dosDestacadas: ['A.O.C. Madiran', 'D.O. Uruguay'],
    descripcion: 'El Tannat es la uva con más taninos de todas las variedades conocidas, lo que le da una astringencia brutal en su juventud. En Madiran se usan técnicas de micro-oxigenación para suavizarlos. En Uruguay —donde llegó con inmigrantes vascos en el siglo XIX— se ha convertido en la uva nacional y produce vinos más redondos por el clima oceánico.',
    curiosidad: 'Estudios cardiológicos de la Universidad de Montevideo demostraron que el Tannat uruguayo contiene el doble de procianidinas (antioxidantes) que cualquier otro vino del mundo. La "paradoja francesa" (baja tasa cardíaca en Gascuña pese a la dieta rica en grasas) se atribuye parcialmente al consumo de Tannat de Madiran.',
  },
  {
    nombre: 'Carménère', nombreOriginal: 'Carménère', tipo: 'Tinto', origen: 'Francia (Burdeos) → Chile',
    zonasPrincipales: ['Valle del Maipo', 'Valle de Colchagua', 'Valle del Rapel'],
    notasDeSabor: ['Pimiento rojo', 'Ciruela', 'Cuero', 'Especias', 'Grafito', 'Cacao'],
    cuerpo: 'Medio-complejo', taninos: 'Medios', acidez: 'Media',
    temperaturaServicio: '15–17 °C',
    maridaje: ['Asado chileno', 'Pastel de choclo', 'Queso de Chanco', 'Empanadas', 'Chancho en piedra'],
    dosDestacadas: ['D.O. Valle de Maipo', 'D.O. Valle de Colchagua'],
    descripcion: 'El Carménère fue declarado extinto en Francia tras la filoxera de finales del XIX. Sobrevivió en Chile confundido con el Merlot durante un siglo hasta que en 1994 el ampelógrafo Jean-Michel Boursiquot lo identificó definitivamente en los viñedos chilenos. Hoy es la cepa bandera de Chile.',
    curiosidad: 'Durante 150 años, los viticultores chilenos pensaron que cultivaban Merlot. En 1994, un experto de Burdeos observó que las hojas maduraban mucho más tarde que el Merlot normal. El análisis reveló que era Carménère, una variedad que se creía extinta desde la filoxera de 1870. Chile había estado criando una variedad "fantasma" sin saberlo.',
  },
  {
    nombre: 'Pinotage', nombreOriginal: 'Pinotage', tipo: 'Tinto', origen: 'Sudáfrica',
    zonasPrincipales: ['Stellenbosch', 'Paarl', 'Franschhoek', 'Swartland'],
    notasDeSabor: ['Mora', 'Ciruela', 'Chocolate', 'Café', 'Especias ahumadas'],
    cuerpo: 'Complejo', taninos: 'Altos', acidez: 'Media',
    temperaturaServicio: '16–17 °C',
    maridaje: ['Braai sudafricano', 'Carne de avestruz', 'Sosaties (brochetas)', 'Queso Boland'],
    dosDestacadas: ['WO Stellenbosch', 'WO Paarl', 'WO Swartland'],
    descripcion: 'El Pinotage es la única uva creada en el siglo XX que ha alcanzado importancia internacional. Cruce entre Pinot Noir y Cinsault, fue desarrollada en 1925 por el profesor Abraham Perold en Stellenbosch. Produce vinos únicos y polarizantes: intensamente frutales con notas ahumadas en los buenos.',
    curiosidad: 'El Pinotage fue creado en el jardín trasero del profesor Perold en 1925. Cuando este fue trasladado a otro puesto, las cuatro plantas de Pinotage fueron abandonadas y casi destruidas por los jardineros. Las salvó el estudiante Charlie Niehaus, que las trasplantó. De esas cuatro plantas proviene todo el Pinotage del mundo.',
  },
  {
    nombre: 'Corvina', nombreOriginal: 'Corvina Veronese', tipo: 'Tinto', origen: 'Italia (Véneto)',
    zonasPrincipales: ['Amarone della Valpolicella', 'Valpolicella', 'Bardolino', 'Ripasso'],
    notasDeSabor: ['Cereza amarga', 'Almendra', 'Canela', 'Chocolate negro', 'Laurel', 'Tierra'],
    cuerpo: 'Complejo', taninos: 'Altos', acidez: 'Alta',
    temperaturaServicio: '17–19 °C',
    maridaje: ['Risotto all\'Amarone', 'Brasato', 'Queso Asiago stagionato', 'Trufa', 'Caza'],
    dosDestacadas: ['DOCG Amarone della Valpolicella', 'DOC Valpolicella Ripasso'],
    descripcion: 'La Corvina es la base del Amarone, uno de los grandes vinos del mundo. Para producir Amarone, las uvas se desecan en "fruttai" (secaderos) durante 3-4 meses (appassimento), concentrando azúcares y sabores. El resultado es un vino de 15-17% de alcohol, extraordinariamente complejo y longevo.',
    curiosidad: 'El Amarone nació por accidente: según la leyenda, en 1936 un bodeguero de Valpolicella olvidó un barril de Recioto (vino dulce de uvas pasas). Cuando lo abrió meses después, el azúcar había fermentado completamente, produciendo un vino seco, potente y complejo. Lo llamó "Amaro" (amargo) y luego Amarone (el gran amargo). Hoy es uno de los vinos italianos más caros.',
  },
  {
    nombre: 'Grenache Noir', nombreOriginal: 'Grenache Noir / Garnacha Negra', tipo: 'Tinto', origen: 'España → Francia',
    zonasPrincipales: ['Roussillon (Maury)', 'Banyuls', 'Costières de Nîmes', 'Languedoc'],
    notasDeSabor: ['Frambuesa madura', 'Confitura de cerezas', 'Regaliz', 'Café', 'Azúcar quemado'],
    cuerpo: 'Complejo', taninos: 'Bajos', acidez: 'Baja',
    temperaturaServicio: '16–17 °C',
    maridaje: ['Foie gras caliente', 'Chocolate negro >70%', 'Queso Roquefort', 'Postres de frutos rojos'],
    dosDestacadas: ['A.O.C. Maury', 'A.O.C. Banyuls', 'A.O.C. Costières de Nîmes'],
    descripcion: 'En el Roussillon, la Garnacha Negra produce los Vins Doux Naturels (VDN) de Maury y Banyuls: vinos generosos con mutaje (adición de alcohol para detener la fermentación) que producen vinos dulces extraordinarios para el maridaje con chocolate y foie gras.',
    curiosidad: 'El Banyuls, elaborado con Grenache Noir en la Côte Vermeille (la única appellation francesa que llega al mar), es el maridaje clásico con el chocolate en la alta cocina francesa. El chocolate Valrhona —el más usado por los chefs con estrella Michelin— tiene su sede muy cerca de los viñedos de Grenache del Ródano norte.',
  },
  // ── BLANCOS (16) ──
  {
    nombre: 'Chardonnay', nombreOriginal: 'Chardonnay', tipo: 'Blanco', origen: 'Francia (Borgoña)',
    zonasPrincipales: ['Chablis', 'Côte de Beaune', 'Champagne', 'Napa Valley', 'Adelaide Hills'],
    notasDeSabor: ['Manzana', 'Mantequilla', 'Avellana', 'Vainilla', 'Limón', 'Piña (climas cálidos)'],
    cuerpo: 'Complejo', taninos: 'Sin taninos', acidez: 'Media',
    temperaturaServicio: '10–12 °C',
    maridaje: ['Bogavante', 'Vieiras', 'Pollo a la crema', 'Queso Brie', 'Foie gras frío'],
    dosDestacadas: ['A.O.C. Chablis', 'A.O.C. Meursault', 'A.O.C. Puligny-Montrachet'],
    descripcion: 'El Chardonnay es la uva blanca más plantada del mundo y la más versátil: desde los Chablis ácidos y minerales sin madera hasta los Meursault cremosos y mantecosos con fermentación en barrica. Sin madera expresa el terroir; con madera la barrica domina. Montrachet y Meursault son sus expresiones más sublimes.',
    curiosidad: 'El Chardonnay fue víctima de su propio éxito en los años 1990: los vinos sobremaduros, cargados de roble y exceso de mantequilla, generaron el fenómeno ABCs (Anything But Chardonnay). En respuesta, los productores del mundo reajustaron el uso de barrica y produjeron vinos más frescos. Esta reacción cambió el estilo de Chardonnay a nivel mundial.',
  },
  {
    nombre: 'Sauvignon Blanc', nombreOriginal: 'Sauvignon Blanc', tipo: 'Blanco', origen: 'Francia (Loire/Burdeos)',
    zonasPrincipales: ['Marlborough (Nueva Zelanda)', 'Sancerre y Pouilly-Fumé', 'Rueda', 'Pessac-Léognan', 'Friuli'],
    notasDeSabor: ['Pomelo', 'Pimiento verde', 'Hierba recién cortada', 'Maracuyá', 'Grosellas blancas'],
    cuerpo: 'Ligero', taninos: 'Sin taninos', acidez: 'Muy alta',
    temperaturaServicio: '8–10 °C',
    maridaje: ['Queso de cabra', 'Espárragos', 'Ensalada de atún', 'Sashimi', 'Ceviche'],
    dosDestacadas: ['A.O.C. Sancerre', 'D.O. Rueda', 'Marlborough GI (NZ)'],
    descripcion: 'El Sauvignon Blanc es la uva blanca más aromática del mundo. Su varietal pungente —hierba, pimiento, pomelo, maracuyá— es inconfundible. En Sancerre y Pouilly-Fumé produce vinos elegantes y minerales. En Marlborough (NZ) los vinos son tropicales y explosivos. Rueda (España) produce Sauvignon Blanc de alta calidad a precio accesible.',
    curiosidad: 'El aroma a "pis de gato" (literalmente) es una característica reconocida del Sauvignon Blanc joven, causada por el compuesto 4-mercapto-4-metilpentanona (4MMP). Este compuesto, presente en concentraciones de partes por billón, es percibido por el olfato humano incluso a concentraciones mínimas. Los catadores profesionales lo describen eufemísticamente como "grosellas negras".',
  },
  {
    nombre: 'Riesling', nombreOriginal: 'Riesling', tipo: 'Blanco', origen: 'Alemania (Mosela/Rin)',
    zonasPrincipales: ['Mosela', 'Rin (Rheingau)', 'Alsacia', 'Clare Valley (Australia)', 'Finger Lakes (EEUU)'],
    notasDeSabor: ['Melocotón', 'Albaricoque', 'Lima', 'Pizarra', 'Gasolina (Riesling maduro)', 'Jengibre'],
    cuerpo: 'Ligero', taninos: 'Sin taninos', acidez: 'Muy alta',
    temperaturaServicio: '8–10 °C',
    maridaje: ['Foie gras', 'Queso Münster', 'Cocina china y tailandesa', 'Salmón ahumado', 'Cerdo con especias'],
    dosDestacadas: ['Mosel QbA/Prädikat', 'Rheingau GG', 'A.O.C. Alsace Grand Cru'],
    descripcion: 'Los críticos consideran al Riesling la uva más noble del mundo. Su gama —desde Spätlese semidulce hasta Trockenbeerenauslese de vendimia tardía— es incomparable en amplitud. Su acidez preservadora le da una longevidad extraordinaria: los mejores Riesling del Mosela pueden vivir 50-100 años.',
    curiosidad: 'La nota de "gasolina" o "petróleo" en los Riesling maduros (más de 8-10 años) es considerada positiva y signo de calidad. Es producida por el TDN (trimetildihidronaftaleno), un compuesto que se forma durante el envejecimiento. Los mejores Riesling del Mosela desarrollan esta nota de forma pronunciada después de 15-20 años de botella.',
  },
  {
    nombre: 'Albariño', nombreOriginal: 'Albariño (ES) / Alvarinho (PT)', tipo: 'Blanco', origen: 'España (Galicia)',
    zonasPrincipales: ['Rías Baixas', 'Vinho Verde (Portugal)', 'Oregon', 'California'],
    notasDeSabor: ['Melocotón blanco', 'Pomelo', 'Flor de azahar', 'Sal marina', 'Almendra', 'Hierba'],
    cuerpo: 'Medio', taninos: 'Sin taninos', acidez: 'Alta',
    temperaturaServicio: '8–10 °C',
    maridaje: ['Mariscos', 'Pulpo a feira', 'Merluza', 'Percebes', 'Sushi'],
    dosDestacadas: ['D.O. Rías Baixas', 'VQPRD Vinho Verde'],
    descripcion: 'El Albariño es el vino blanco español más reconocido internacionalmente. Las Rías Baixas (Galicia) —con su clima atlántico lluvioso, la brisa del mar y los suelos graníticos— producen Albariños frescos, aromáticos y con la salinidad perfecta para maridar con el marisco gallego.',
    curiosidad: 'El nombre Albariño podría derivar de "Alba Rino" (uva del Rin blanca) según algunas teorías, pues se cree que monjes benedictinos del Cluny la introdujeron en Galicia desde el Rin en el siglo XII. El análisis genético no ha confirmado definitivamente esta hipótesis, pero el Albariño tiene efectivamente ciertos parentescos con variedades alemanas.',
  },
  {
    nombre: 'Verdejo', nombreOriginal: 'Verdejo', tipo: 'Blanco', origen: 'España (Castilla y León)',
    zonasPrincipales: ['Rueda', 'Segovia', 'Salamanca'],
    notasDeSabor: ['Hinojo', 'Hierba fresca', 'Lima', 'Pera', 'Nuez fresca', 'Floral'],
    cuerpo: 'Medio', taninos: 'Sin taninos', acidez: 'Alta',
    temperaturaServicio: '8–10 °C',
    maridaje: ['Jamón serrano', 'Queso fresco', 'Ensalada de salmón', 'Gazpacho', 'Tapas'],
    dosDestacadas: ['D.O. Rueda'],
    descripcion: 'El Verdejo es la uva autóctona de Rueda (Valladolid), una de las denominaciones blancas más exitosas de España. Se distingue por su nota herbal característica y su frescura. Fue casi reemplazado por el Palomino en el siglo XX, pero fue recuperado por el impulso de Marqués de Riscal en los años 1970.',
    curiosidad: 'El Verdejo llegó a la meseta castellana traído por los mozárabes en el siglo XI, según los registros históricos. El cambio llegó en 1972 cuando el marqués de Riscal contrató al enólogo Émile Peynaud, que transformó el estilo hacia vinos frescos y afrutados que triunfaron en el mercado. Hoy Rueda es la D.O. blanca de mayor crecimiento de España.',
  },
  {
    nombre: 'Chenin Blanc', nombreOriginal: 'Chenin Blanc / Steen (ZA)', tipo: 'Blanco', origen: 'Francia (Loire)',
    zonasPrincipales: ['Vouvray', 'Savennières', 'Saumur', 'Sudáfrica (Stellenbosch)', 'Swartland'],
    notasDeSabor: ['Manzana golden', 'Miel', 'Membrillo', 'Cera de abeja', 'Flores blancas', 'Pizarra'],
    cuerpo: 'Medio', taninos: 'Sin taninos', acidez: 'Muy alta',
    temperaturaServicio: '8–11 °C',
    maridaje: ['Rillettes de Tours', 'Queso Sainte-Maure', 'Foie gras', 'Curry suave', 'Sopa de calabaza'],
    dosDestacadas: ['A.O.C. Vouvray', 'A.O.C. Savennières', 'WO Stellenbosch'],
    descripcion: 'La versatilidad del Chenin Blanc es única: produce vinos secos, semisecos, dulces de vendimia tardía y espumosos. En Sudáfrica —donde se llama Steen— es la uva más plantada y produce vinos de valor extraordinario. Su alta acidez le da una longevidad comparable al Riesling.',
    curiosidad: 'Sudáfrica tiene las viñas de Chenin Blanc más antiguas del mundo: cepas de 50-80 años en el Swartland producen vinos que compiten con los mejores Vouvray. Esta herencia histórica se debe a que Sudáfrica no sufrió la filoxera de la misma forma que Europa. El Swartland Revolution —movimiento de jóvenes productores sudafricanos— puso estas viejas cepas en el mapa mundial.',
  },
  {
    nombre: 'Viognier', nombreOriginal: 'Viognier', tipo: 'Blanco', origen: 'Francia (Ródano Norte)',
    zonasPrincipales: ['Condrieu', 'Château Grillet', 'Languedoc', 'California', 'Virginia'],
    notasDeSabor: ['Albaricoque', 'Durazno', 'Jazmín', 'Violeta', 'Jengibre', 'Especias exóticas'],
    cuerpo: 'Complejo', taninos: 'Sin taninos', acidez: 'Baja',
    temperaturaServicio: '10–12 °C',
    maridaje: ['Foie gras', 'Bogavante a la vainilla', 'Pollo al curry suave', 'Queso Époisses', 'Mejillones con azafrán'],
    dosDestacadas: ['A.O.C. Condrieu', 'A.O.C. Château Grillet'],
    descripcion: 'El Viognier es la uva más aromática del Ródano Norte. Condrieu, su appellation de origen, produce uno de los blancos más seductores y caros del mundo: voluptuoso, perfumado y bajo en acidez. Casi desapareció en los años 1960 con solo 14 hectáreas. Su renacimiento fue impulsado por la moda de los blancos del Ródano en los años 1980.',
    curiosidad: 'En Côte-Rôtie (A.O.C. de Syrah tinto del Ródano norte), el reglamento permite añadir hasta un 20% de Viognier —una uva blanca— a los vinos tintos de Syrah. Esta práctica mejora el aroma y el color (el Viognier contiene violglucoside, un precursor del color en el vino). Los productores que usan Viognier en sus Syrahs tienen vinos con mayor concentración de antocianinas.',
  },
  {
    nombre: 'Gewürztraminer', nombreOriginal: 'Gewürztraminer', tipo: 'Blanco', origen: 'Alemania/Italia (Tramin) → Alsacia',
    zonasPrincipales: ['Alsacia (Grand Cru)', 'Alto Adige (Italia)', 'Alemania (Baden)', 'Nueva Zelanda'],
    notasDeSabor: ['Lychee', 'Rosa intensa', 'Especias (gewürz = especia)', 'Jengibre', 'Canela', 'Pétalo de rosa'],
    cuerpo: 'Complejo', taninos: 'Sin taninos', acidez: 'Baja',
    temperaturaServicio: '8–10 °C',
    maridaje: ['Foie gras de Alsacia', 'Choucroute garnie', 'Queso Münster', 'Cocina china', 'Tajine marroquí'],
    dosDestacadas: ['A.O.C. Alsace Grand Cru', 'DOC Alto Adige Gewürztraminer'],
    descripcion: 'El Gewürztraminer es el vino más perfumado del mundo. Su aroma a lychee, rosa y especias es tan intenso que resulta divisivo: se ama u odia sin términos medios. En Alsacia produce los Vendanges Tardives y Sélection de Grains Nobles más exóticos de todos. Es el maridaje perfecto para la cocina asiática especiada.',
    curiosidad: 'El nombre Gewürztraminer significa "Traminer especiado" en alemán. Esta ciudad italiana (Termeno, Tirol del Sur) es el origen histórico de la variedad, donde se cultiva desde el siglo XIII. La mutación que produjo el Gewürztraminer (más aromático y de piel rosa) del Traminer original sigue siendo objeto de investigación genética.',
  },
  {
    nombre: 'Godello', nombreOriginal: 'Godello', tipo: 'Blanco', origen: 'España (Galicia/León)',
    zonasPrincipales: ['Valdeorras', 'Monterrei', 'Bierzo', 'Ribeira Sacra'],
    notasDeSabor: ['Melocotón blanco', 'Anís', 'Flor de manzano', 'Pizarra', 'Cítricos', 'Almendra'],
    cuerpo: 'Medio-complejo', taninos: 'Sin taninos', acidez: 'Alta',
    temperaturaServicio: '9–11 °C',
    maridaje: ['Merluza en salsa verde', 'Vieiras', 'Pulpo', 'Queso de tetilla', 'Empanada gallega'],
    dosDestacadas: ['D.O. Valdeorras', 'D.O. Monterrei', 'D.O. Bierzo'],
    descripcion: 'El Godello es la revelación blanca española de las últimas décadas. Casi extinto en los años 1970, fue rescatado por Horacio Fernández Biain en Valdeorras, quien plantó las primeras cepas comerciales en 1974. Hoy produce blancos de gran complejidad y longevidad, capaces de envejecer con elegancia 5-10 años.',
    curiosidad: 'El Godello fue declarado "variedad en peligro de extinción" en los años 1970. Quedaban menos de 10 hectáreas plantadas en toda Galicia. La recuperación fue tan exitosa que hoy hay más de 1.500 hectáreas y sus vinos superan los 30€ en el mercado. Es el caso más exitoso de recuperación de una variedad vinícola española.',
  },
  {
    nombre: 'Grüner Veltliner', nombreOriginal: 'Grüner Veltliner', tipo: 'Blanco', origen: 'Austria',
    zonasPrincipales: ['Wachau', 'Kamptal', 'Kremstal', 'Wagram'],
    notasDeSabor: ['Pimiento blanco', 'Cítricos', 'Hierbas', 'Pimienta blanca', 'Manzana verde', 'Mineral'],
    cuerpo: 'Medio', taninos: 'Sin taninos', acidez: 'Alta',
    temperaturaServicio: '8–10 °C',
    maridaje: ['Wiener Schnitzel', 'Espárragos blancos', 'Queso Gruyère', 'Sushi', 'Ensaladas'],
    dosDestacadas: ['DAC Wachau (Smaragd)', 'DAC Kamptal', 'DAC Kremstal'],
    descripcion: 'El Grüner Veltliner es el vino nacional de Austria y uno de los blancos más subestimados del mundo. Su pimienta blanca característica y su versatilidad con la comida lo hacen excepcional. En la Wachau, los Smaragd (la clasificación más alta) son vinos de gran complejidad y longevidad.',
    curiosidad: 'En 2001, una cata a ciegas organizada en Viena enfrentó los mejores Grüner Veltliner de la Wachau contra Chardonnays Grand Cru de Borgoña y Rieslings Spätlese del Mosela. Los jueces —todos expertos de primera fila— puntuaron los Grüner Veltliner por encima de los vinos franceses y alemanes, generando un debate europeo sobre la calidad de los vinos austriacos.',
  },
  {
    nombre: 'Assyrtiko', nombreOriginal: 'Assyrtiko', tipo: 'Blanco', origen: 'Grecia (Santorini)',
    zonasPrincipales: ['Santorini (AOP)', 'Macedonia (Grecia)', 'Australia (Barossa)', 'California'],
    notasDeSabor: ['Lima', 'Sal marina', 'Mineral volcánico', 'Pomelo', 'Jazmín', 'Piña'],
    cuerpo: 'Medio', taninos: 'Sin taninos', acidez: 'Muy alta',
    temperaturaServicio: '8–10 °C',
    maridaje: ['Pulpo griego a la brasa', 'Feta', 'Mariscos', 'Calamares fritos', 'Tartar de atún'],
    dosDestacadas: ['PDO Santorini'],
    descripcion: 'El Assyrtiko de Santorini es el vino más mineral del Mediterráneo. Las vides crecen en cestas enrolladas (kouloura) sobre la tierra volcánica de la caldera de Santorini, sin riego, con raíces de hasta 60 años que llegan 30 metros de profundidad para buscar agua. La sal marina del mar Egeo y el suelo volcánico le dan una mineralidad única en el mundo.',
    curiosidad: 'Las viñas de Santorini son las más antiguas de Europa con producción continuada: algunas cepas tienen más de 300 años. Sobrevivieron a la filoxera porque el insecto no puede vivir en el suelo volcánico de pumita (piedra volcánica porosa). Las cepas se cultivan "en canasto" para protegerse del violento viento del Egeo. Son patrimonio vivo de la viticultura mundial.',
  },
  {
    nombre: 'Macabeo / Viura', nombreOriginal: 'Macabeo (ES) / Viura (Rioja) / Macabeu (CAT)', tipo: 'Blanco', origen: 'España (Aragón)',
    zonasPrincipales: ['Rioja Blanco', 'Cava (base espumoso)', 'Penedès', 'Languedoc (Maccabeu)'],
    notasDeSabor: ['Manzana', 'Pera', 'Flores blancas', 'Almendra', 'Hierba fresca'],
    cuerpo: 'Ligero', taninos: 'Sin taninos', acidez: 'Media',
    temperaturaServicio: '8–10 °C',
    maridaje: ['Tapas', 'Mariscos sencillos', 'Queso fresco', 'Gazpacho', 'Ensaladas'],
    dosDestacadas: ['D.O.Ca Rioja Blanco', 'D.O. Cava (base)'],
    descripcion: 'El Macabeo es la uva blanca más versátil de España: base del Cava (espumoso), del Rioja Blanco envejecido y de los blancos del Languedoc francés. Sola produce vinos frescos y ligeros; con crianza en barrica en Rioja puede desarrollar complejidad oxidativa notable. Es la uva más plantada de Rioja.',
    curiosidad: 'El Cava —el espumoso español por excelencia— se elabora con tres uvas autóctonas: Macabeo (base), Xarel·lo (cuerpo) y Parellada (frescor). Este trinomio fue establecido en los años 1870 por Josep Raventós, fundador de Codorníu, que copió el método champenoise francés con variedades locales. El Cava tiene hoy más de 37.000 hectáreas plantadas.',
  },
  // ── ESPUMOSOS (4) ──
  {
    nombre: 'Xarel·lo', nombreOriginal: 'Xarel·lo', tipo: 'Espumoso', origen: 'España (Cataluña)',
    zonasPrincipales: ['Penedès (Cava)', 'Alella', 'Tarragona'],
    notasDeSabor: ['Manzana reineta', 'Hierba fresca', 'Almendra', 'Cítrico', 'Mineral'],
    cuerpo: 'Medio', taninos: 'Sin taninos', acidez: 'Alta',
    temperaturaServicio: '7–9 °C',
    maridaje: ['Jamón ibérico', 'Croquetas', 'Tapas variadas', 'Queso manchego joven', 'Pa amb tomàquet'],
    dosDestacadas: ['D.O. Cava', 'D.O. Penedès'],
    descripcion: 'El Xarel·lo es la uva de personalidad más fuerte de las tres que componen el Cava. Su aroma herbáceo y su acidez vibrante son el "carácter" del Cava. Solo (vino tranquilo) produce blancos de gran personalidad, muy de moda en la restauración natural catalana. Los productores de Cava Natural lo reivindican como la variedad más identitaria del Penedès.',
    curiosidad: 'En catalán, el apóstrofo intermedio (·l) en Xarel·lo indica la l·l geminada, un sonido fonético único del catalán sin equivalente en otras lenguas. Es la única uva vinícola del mundo cuyo nombre incluye un grafema lingüístico que la mayoría de teclados no pueden escribir correctamente. Muchos productores escriben "Xarello" para evitar el problema tipográfico.',
  },
  {
    nombre: 'Glera (Prosecco)', nombreOriginal: 'Glera', tipo: 'Espumoso', origen: 'Italia (Véneto)',
    zonasPrincipales: ['Conegliano-Valdobbiadene DOCG', 'Asolo Prosecco DOCG', 'DOC Prosecco'],
    notasDeSabor: ['Manzana verde', 'Pera', 'Flores blancas', 'Durazno', 'Almendra'],
    cuerpo: 'Ligero', taninos: 'Sin taninos', acidez: 'Media',
    temperaturaServicio: '6–8 °C',
    maridaje: ['Aperitivo', 'Prosciutto', 'Jamón cocido', 'Fresas', 'Risotto ligero'],
    dosDestacadas: ['DOCG Prosecco di Conegliano Valdobbiadene', 'DOCG Asolo Prosecco'],
    descripcion: 'La Glera es la base del Prosecco, el espumoso más vendido del mundo desde 2009 (superó al Champagne en volumen). Se elabora por el método Charmat (segunda fermentación en depósito inoxidable), que produce burbujas más grandes y vinos más frescos y frutales que el método tradicional del Champagne. Es el alma del Aperol Spritz.',
    curiosidad: 'El Prosecco se convirtió en el espumoso más vendido del mundo en 2009, superando al Champagne por primera vez en la historia. Su precio accesible y su apertura al cocktail (Aperol Spritz, Hugo) lo masificaron. En respuesta, los productores italianos crearon en 2009 la DOCG de Conegliano-Valdobbiadene para proteger el Prosecco de calidad ante la expansión de la zona DOC.',
  },
  {
    nombre: 'Pinot Meunier', nombreOriginal: 'Pinot Meunier / Schwarzriesling (DE)', tipo: 'Espumoso', origen: 'Francia (Champagne)',
    zonasPrincipales: ['Champagne (Vallée de la Marne)', 'Württemberg (Alemania)', 'Alsacia'],
    notasDeSabor: ['Frutos rojos', 'Manzana', 'Speculoos', 'Especias suaves', 'Brioche'],
    cuerpo: 'Ligero', taninos: 'Sin taninos', acidez: 'Alta',
    temperaturaServicio: '7–9 °C',
    maridaje: ['Champiñones salteados', 'Queso Époisses joven', 'Tartaletas de salmón', 'Ostras', 'Aperitivo'],
    dosDestacadas: ['A.O.C. Champagne', 'QbA Württemberg (vino tranquilo)'],
    descripcion: 'El Pinot Meunier es la "uva secreta" del Champagne: la tercera variedad junto al Chardonnay y el Pinot Noir, aporta fruta inmediata y suavidad a los blends. Krug, el más complejo y caro de los Champagnes, usa Pinot Meunier como componente esencial de su Gran Cuvée.',
    curiosidad: 'El nombre Meunier significa "molinero" en francés, por el aspecto de las hojas cubiertas de un polvillo blanco que parece harina de molino. Es la única variedad de Champagne que puede cultivarse en zonas bajas con riesgo de heladas: brota más tarde y madura antes que el Pinot Noir y el Chardonnay, esquivando las heladas de primavera de la Vallée de la Marne.',
  },
  {
    nombre: 'Pedro Ximénez', nombreOriginal: 'Pedro Ximénez (PX)', tipo: 'Espumoso', origen: 'España (Andalucía)',
    zonasPrincipales: ['Montilla-Moriles', 'Jerez', 'Málaga'],
    notasDeSabor: ['Pasa de Corinto', 'Higo', 'Café', 'Chocolate negro', 'Regaliz', 'Caramelo'],
    cuerpo: 'Complejo', taninos: 'Sin taninos', acidez: 'Baja',
    temperaturaServicio: '12–14 °C',
    maridaje: ['Helado de vainilla', 'Queso Roquefort', 'Foie gras', 'Tarta de chocolate', 'Torrijas'],
    dosDestacadas: ['D.O. Montilla-Moriles', 'D.O. Jerez-Xérès-Sherry'],
    descripcion: 'El Pedro Ximénez produce uno de los vinos más extraordinarios del mundo: el PX de Jerez y Montilla-Moriles, un vino dulce de vendimia tardía, pasas al sol, con densidad de sirope y concentración de sabores incomparable. Es el vino de postre más increíble de España.',
    curiosidad: 'Las uvas PX para el vino dulce se deshidratan al sol durante 2 semanas antes de la vendimia en la "soleo" (exposición solar). El resultado es que los granos pierden el 70% de su peso en agua y concentran todos los azúcares. Necesitan 9 kg de uva fresca para producir 1 litro de PX. Los mejores PX de Toro Albalá tienen más de 50 años en barrica.',
  },
];

// ── Componente indicador de puntos ───────────────────────────────────────────

function DotIndicador({ nivel, max = 4 }: { nivel: number; max?: number }) {
  return (
    <div className={styles.dots}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={i < nivel ? styles.dotFilled : styles.dotEmpty}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ── Componente de barra de progreso para Cuerpo ──────────────────────────────

function BarraCuerpo({ nivel }: { nivel: number }) {
  const porcentaje = (nivel / 4) * 100;
  return (
    <div className={styles.barraWrapper} role="progressbar" aria-valuenow={nivel} aria-valuemin={0} aria-valuemax={4}>
      <div className={styles.barraFill} style={{ width: `${porcentaje}%` }} />
    </div>
  );
}

// ── Badge de tipo ────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: TipoUva }) {
  const claseMap: Record<TipoUva, string> = {
    Tinto: styles.badgeTinto,
    Blanco: styles.badgeBlanco,
    Rosado: styles.badgeRosado,
    Espumoso: styles.badgeEspumoso,
  };
  const iconoMap: Record<TipoUva, string> = {
    Tinto: '🍷',
    Blanco: '🥂',
    Rosado: '🌸',
    Espumoso: '🍾',
  };
  return (
    <span className={`${styles.tipoBadge} ${claseMap[tipo]}`}>
      {iconoMap[tipo]} {tipo}
    </span>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function GuiaVarietalesVinoPage() {
  const [tipo, setTipo] = useState<TipoUva | 'Todos'>('Todos');
  const [busqueda, setBusqueda] = useState('');

  const varietalesFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase().trim();
    return VARIETALES.filter((v) => {
      const coincideTipo = tipo === 'Todos' || v.tipo === tipo;
      if (!coincideTipo) return false;
      if (!termino) return true;
      return (
        v.nombre.toLowerCase().includes(termino) ||
        v.origen.toLowerCase().includes(termino) ||
        v.notasDeSabor.some((n) => n.toLowerCase().includes(termino)) ||
        v.zonasPrincipales.some((z) => z.toLowerCase().includes(termino)) ||
        v.maridaje.some((m) => m.toLowerCase().includes(termino))
      );
    });
  }, [tipo, busqueda]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1>🍷 Guía de Varietales de Vino</h1>
          <p>40 uvas del mundo: notas de sabor, cuerpo, taninos, temperatura de servicio y maridaje</p>
        </header>

        <LegalNotice />

        <main className={styles.main}>
          {/* ── Controles ── */}
          <div className={styles.controles}>
            <input
              type="search"
              className={styles.buscador}
              placeholder="Buscar por varietal, origen, nota de sabor o maridaje…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar varietales de vino"
            />
            <div className={styles.filtroGrupo}>
              <span className={styles.filtroLabel}>Tipo de uva</span>
              <div className={styles.filtros} role="group" aria-label="Filtrar por tipo">
                {TIPOS.map((t) => (
                  <button
                    key={t}
                    className={`${styles.filtroBtn} ${tipo === t ? styles.filtroActivo : ''}`}
                    onClick={() => setTipo(t)}
                    aria-pressed={tipo === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <p className={styles.contador} aria-live="polite">
              {varietalesFiltrados.length} {varietalesFiltrados.length === 1 ? 'varietal' : 'varietales'}
            </p>
          </div>

          {/* ── Grid de tarjetas ── */}
          <div className={styles.grid}>
            {varietalesFiltrados.map((v) => (
              <article key={v.nombre} className={styles.card}>
                <div className={styles.cardHeader}>
                  <TipoBadge tipo={v.tipo} />
                </div>

                <h2 className={styles.nombre}>{v.nombre}</h2>
                {v.nombreOriginal !== v.nombre && (
                  <p className={styles.nombreOriginal}>{v.nombreOriginal}</p>
                )}

                <span className={styles.origenPill}>📍 {v.origen}</span>

                <p className={styles.descripcion}>{v.descripcion}</p>

                {/* Notas de sabor */}
                <div className={styles.notasSection}>
                  <span className={styles.sectionLabel}>Notas de sabor</span>
                  <div className={styles.notasTags}>
                    {v.notasDeSabor.map((n) => (
                      <span key={n} className={styles.notaTag}>{n}</span>
                    ))}
                  </div>
                </div>

                {/* Indicadores visuales */}
                <div className={styles.indicadoresGrid}>
                  <div className={styles.indicador}>
                    <span className={styles.indicadorLabel}>Cuerpo</span>
                    <BarraCuerpo nivel={CUERPO_NIVEL[v.cuerpo]} />
                    <span className={styles.indicadorValor}>{v.cuerpo}</span>
                  </div>
                  <div className={styles.indicador}>
                    <span className={styles.indicadorLabel}>Taninos</span>
                    {v.taninos === 'Sin taninos' ? (
                      <span className={styles.indicadorValor}>—</span>
                    ) : (
                      <DotIndicador nivel={TANINOS_NIVEL[v.taninos]} />
                    )}
                    <span className={styles.indicadorValor}>{v.taninos}</span>
                  </div>
                  <div className={styles.indicador}>
                    <span className={styles.indicadorLabel}>Acidez</span>
                    <DotIndicador nivel={ACIDEZ_NIVEL[v.acidez]} />
                    <span className={styles.indicadorValor}>{v.acidez}</span>
                  </div>
                </div>

                {/* Temperatura de servicio */}
                <div className={styles.tempPill}>
                  <span aria-hidden="true">🌡️</span>
                  {v.temperaturaServicio}
                </div>

                {/* Maridaje */}
                <div className={styles.notasSection}>
                  <span className={styles.sectionLabel}>Maridaje</span>
                  <div className={styles.maridajeTags}>
                    {v.maridaje.map((m) => (
                      <span key={m} className={styles.maridajeTag}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* DOs destacadas */}
                <div className={styles.dosSection}>
                  <span className={styles.sectionLabel}>Denominaciones destacadas</span>
                  <div className={styles.dosTags}>
                    {v.dosDestacadas.map((d) => (
                      <span key={d} className={styles.dosTag}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Curiosidad */}
                <div className={styles.curiosidadBox}>
                  <span className={styles.curiosidadIcon} aria-hidden="true">🍾</span>
                  <p className={styles.curiosidadText}>{v.curiosidad}</p>
                </div>
              </article>
            ))}

            {varietalesFiltrados.length === 0 && (
              <p className={styles.sinResultados}>
                No se encontraron varietales con esos criterios. Prueba a cambiar el filtro o la búsqueda.
              </p>
            )}
          </div>
        </main>

        {/* ── Sección Educativa v2.0 ── */}
        <EducationalSection
          title="Guía completa de varietales de vino: de la cepa a la copa"
          subtitle="Cómo elegir un vino según la uva, el origen y el maridaje perfecto"
        >
          <p>
            El vino es el resultado de la transformación de una uva concreta en un entorno
            geográfico específico. Antes de que la bodega, el enólogo o la barrica entren en
            juego, la variedad de uva (el varietal) determina el 50-70% del perfil final de
            un vino. Entender qué ofrece cada varietal —sus taninos, su acidez, su cuerpo y
            sus aromas naturales— transforma la experiencia de comprar, catar y disfrutar el vino.
          </p>
          <p>
            El mundo cuenta con más de 10.000 variedades de uva identificadas, pero apenas
            150-200 tienen relevancia comercial internacional. Las 40 variedades de esta guía
            representan el 80% del vino que se produce y consume en el mundo, desde el
            Tempranillo de Rioja hasta el Assyrtiko volcánico de Santorini.
          </p>

          {/* Tabla comparativa */}
          <h3>Tabla comparativa: tipos de vino por perfil</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <caption>Comparativa de tipos por perfil enológico</caption>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Taninos</th>
                  <th>Acidez típica</th>
                  <th>Temperatura</th>
                  <th>Maridaje ideal</th>
                  <th>Ejemplo emblemático</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tinto ligero</td>
                  <td>Bajos</td>
                  <td>Alta</td>
                  <td>14–16 °C</td>
                  <td>Salmón, pato, quesos suaves</td>
                  <td>Pinot Noir de Borgoña</td>
                </tr>
                <tr>
                  <td>Tinto medio</td>
                  <td>Medios</td>
                  <td>Media</td>
                  <td>15–17 °C</td>
                  <td>Carnes a la brasa, pasta, quesos curados</td>
                  <td>Tempranillo Rioja Crianza</td>
                </tr>
                <tr>
                  <td>Tinto robusto</td>
                  <td>Altos-Muy altos</td>
                  <td>Media-Alta</td>
                  <td>17–19 °C</td>
                  <td>Carne roja, caza, quesos añejos</td>
                  <td>Barolo, Cabernet Sauvignon Napa</td>
                </tr>
                <tr>
                  <td>Blanco ligero</td>
                  <td>Sin taninos</td>
                  <td>Muy alta</td>
                  <td>8–10 °C</td>
                  <td>Mariscos, sushi, ceviche</td>
                  <td>Albariño Rías Baixas</td>
                </tr>
                <tr>
                  <td>Blanco con cuerpo</td>
                  <td>Sin taninos</td>
                  <td>Media-Baja</td>
                  <td>10–12 °C</td>
                  <td>Bogavante, pollo, foie gras</td>
                  <td>Chardonnay Meursault</td>
                </tr>
                <tr>
                  <td>Espumoso</td>
                  <td>Sin taninos</td>
                  <td>Alta</td>
                  <td>6–9 °C</td>
                  <td>Aperitivo, jamón, tapas, postres</td>
                  <td>Cava Brut Nature, Champagne</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Escenarios */}
          <h3>¿Qué vino para cada ocasión?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>🕯️ Cena romántica</h4>
              <p>
                Pinot Noir de Borgoña o Mencía de Ribeira Sacra. Elegantes, complejos y ligeros:
                no abruman, seducen. Si prefieres blanco, un Viognier de Condrieu o un Godello
                con crianza. Temperatura en punto: ni frío ni caliente.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🥩 Maridaje con carne roja</h4>
              <p>
                Cabernet Sauvignon de Napa o Barolo para carnes de vacuno de alta calidad.
                Malbec argentino de alta altitud para el asado. Syrah del Ródano para cordero
                o venado. Los taninos potentes cortan la grasa de la carne.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🥂 Aperitivo o celebración</h4>
              <p>
                Cava Brut Nature (Xarel·lo + Macabeo + Parellada) para eventos en España.
                Prosecco Extra Brut para ocasiones más informales. Champagne Blanc de Blancs
                (100% Chardonnay) para celebraciones de alta gama.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🏺 Coleccionista o regalo especial</h4>
              <p>
                Nebbiolo (Barolo o Barbaresco) para colección a largo plazo (15-30 años).
                Riesling Auslese del Mosela para 20-50 años. Pinot Noir de grands crus de
                Borgoña. Touriga Nacional Vintage (Oporto) para regalar con historia.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <h3>Preguntas frecuentes sobre varietales de vino</h3>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <h4>¿Qué diferencia real hay entre un vino joven, crianza y reserva?</h4>
              <p>
                En España, los términos tienen regulación precisa. Joven: sin crianza en barrica
                o mínima. Crianza: mínimo 6 meses en barrica + 18 en botella (tinto). Reserva:
                mínimo 12 meses en barrica + 24 en botella. Gran Reserva: mínimo 18 meses en
                barrica + 42 en botella. La crianza no garantiza calidad: depende de la calidad
                de la uva y la habilidad del enólogo.
              </p>
              <span className={styles.faqTip}>
                💡 Un joven de varietal expresivo puede superar a una crianza de uva mediocre.
              </span>
            </li>
            <li className={styles.faqItem}>
              <h4>¿Por qué los vinos blancos no tienen taninos?</h4>
              <p>
                Los taninos son compuestos polifenólicos que se extraen de la piel, semillas y
                raspones de la uva durante la maceración con el mosto. En los vinos blancos, el
                mosto se separa de las pieles antes o muy poco después del prensado, sin tiempo
                para extraer taninos. Los vinos de maceración carbónica (orange wines) son la
                excepción: los blancos maceran con pieles y sí tienen taninos.
              </p>
            </li>
            <li className={styles.faqItem}>
              <h4>¿Qué significa "terroir" y por qué importa?</h4>
              <p>
                Terroir es el concepto francés que engloba todo el entorno de la viña: suelo,
                clima, altitud, orientación, microorganismos, y la mano humana. Dos Pinot Noir
                de viñas a 100 metros de distancia en Borgoña pueden tener sabores radicalmente
                distintos por diferencias mínimas en el suelo. El terroir explica por qué la
                misma variedad sabe diferente en California, Nueva Zelanda o Borgoña.
              </p>
            </li>
            <li className={styles.faqItem}>
              <h4>¿Qué temperatura de servicio importa realmente?</h4>
              <p>
                Importa mucho: a temperatura incorrecta, el vino pierde la mitad de su expresión.
                Los tintos demasiado calientes (más de 20 °C) pierden frescura y se vuelven
                alcohólicos. Los blancos demasiado fríos (menos de 7 °C) pierden aromas. La
                "temperatura ambiente" de los siglos XVII-XVIII era de 16-18 °C, muy distinta
                a los 22-24 °C de una casa moderna.
              </p>
              <span className={styles.faqTip}>
                💡 Regla práctica: 30 minutos en el frigorífico para un tinto servido a temperatura de sala.
              </span>
            </li>
            <li className={styles.faqItem}>
              <h4>¿Los vinos caros son siempre mejores?</h4>
              <p>
                No. El precio refleja escasez, denominación, reputación del productor y demanda
                del mercado, no solo calidad objetiva. Existen vinos de 10-20€ que superan en
                una cata a ciegas a vinos de 100€. Los grandes valores por precio/calidad suelen
                encontrarse en denominaciones menos conocidas: Mencía del Bierzo, Godello de
                Valdeorras, Grüner Veltliner del Kamptal, Assyrtiko de Santorini.
              </p>
            </li>
            <li className={styles.faqItem}>
              <h4>¿Qué es la filoxera y por qué cambió el mundo del vino?</h4>
              <p>
                La filoxera (Daktulosphaira vitifoliae) es un insecto pulgón americano que invadió
                Europa en los años 1860-1880 y destruyó el 80% de los viñedos del continente.
                La solución fue injertar las variedades europeas sobre raíces americanas resistentes
                al insecto. Esto cambió para siempre la viticultura: casi todos los vinos europeos
                actuales crecen sobre portainjertos americanos. Algunos lugares (Santorini, partes
                de Chile y Australia) escaparon por su suelo arenoso o aislamiento geográfico.
              </p>
            </li>
          </ul>

          {/* Pasos para elegir vino */}
          <h3>5 pasos para elegir un vino con criterio</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Define el contexto: ¿para qué es el vino?</h4>
                <p>
                  Aperitivo, maridaje con plato concreto, regalo, colección o consumo casual. Cada
                  contexto tiene un vino óptimo diferente. Un gran Barolo es un desperdicio como
                  aperitivo; un joven afrutado puede ser perfecto.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Elige el tipo base: tinto, blanco o espumoso</h4>
                <p>
                  Los tintos para carnes, quesos curados y platos contundentes. Los blancos para
                  pescado, mariscos, quesos frescos y cocina ligera. Los espumosos para aperitivos,
                  tapas y cualquier celebración. El maridaje regional (vino y comida del mismo lugar)
                  raramente falla.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Selecciona la varietal según el perfil deseado</h4>
                <p>
                  ¿Quieres algo elegante y ligero? Pinot Noir o Mencía. ¿Potente y envejecible?
                  Nebbiolo o Cabernet Sauvignon. ¿Fresco y mineral? Albariño o Assyrtiko.
                  ¿Aromático y exótico? Gewürztraminer o Viognier. Usa los indicadores de esta
                  guía como referencia.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Mira el origen y la denominación</h4>
                <p>
                  El mismo varietal puede ser muy distinto según el origen. Un Chardonnay de Chablis
                  (frío, mineral, sin madera) es opuesto a uno de Napa Valley (tropical, con barrica).
                  Un Garnacha de Priorat (concentrado, mineral) es distinto al de Châteauneuf-du-Pape
                  (especiado, más suave). La denominación informa sobre el estilo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h4>Consulta la añada y el envejecimiento</h4>
                <p>
                  Para consumo inmediato: vinos jóvenes o con poca crianza. Para abrir en 5-10 años:
                  Reserva o Gran Reserva de buena añada. Para colección: varietales de alta acidez
                  (Nebbiolo, Riesling, Tannat, Corvina) que envejecen décadas. La añada importa más
                  en climas variables (Borgoña, Mosela) que en climas cálidos y estables.
                </p>
              </div>
            </li>
          </ol>

          {/* Tips */}
          <h3>5 consejos de servicio del vino</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <h4>Temperatura exacta</h4>
              <p>
                Usa la temperatura de servicio como guía real: 30 min en el frigorífico
                enfría un tinto de sala a 16-17 °C. Saca los blancos 5-10 min antes de
                servir para ganar expresión aromática.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🫗</span>
              <h4>Decantación inteligente</h4>
              <p>
                Los tintos jóvenes y muy tánicos (Barolo, Tannat, Cabernet) mejoran mucho
                con 1-2 horas de decantación. Los vinos maduros delicados (Pinot Noir añejo,
                Rioja Gran Reserva) solo necesitan 15-30 min: el oxígeno en exceso los destruye.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍽️</span>
              <h4>Maridaje regional primero</h4>
              <p>
                El principio más fiable: empareja vino y comida de la misma región. Albariño
                con marisco gallego, Chianti con pasta al ragú, Riesling alsaciano con foie gras,
                Malbec con asado argentino. La tradición local afinó estas combinaciones durante siglos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔮</span>
              <h4>Acidez para cortar grasa</h4>
              <p>
                La acidez del vino "limpia" la boca después de un bocado graso. Por eso el
                Albariño va bien con frituras de pescado, el Riesling con el foie gras y el
                Chianti con la pasta carbonara. Un vino bajo en acidez con platos muy grasos
                resulta pesado y empalagoso.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
              <h4>Aprende a leer la etiqueta</h4>
              <p>
                En España: la variedad suele aparecer si ocupa más del 85% del vino. En
                Francia: la denominación define el varietal (Chablis = Chardonnay, Hermitage
                = Syrah). En el Nuevo Mundo: la variedad es siempre lo más destacado. Busca
                añada, productor y D.O. como mínimo.
              </p>
            </div>
          </div>

          {/* Warning box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h4>Errores frecuentes al pedir o comprar vino</h4>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Pedir "vino de la casa" sin preguntar el varietal:</strong> el vino de la casa
                puede ser cualquier cosa, desde un Tempranillo decente hasta una mezcla anónima. Pregunta
                siempre qué uva es y de dónde viene; un buen restaurante lo sabrá responder.
              </li>
              <li>
                <strong>Servir el tinto demasiado caliente:</strong> a 22 °C el alcohol del vino
                se vuelve dominante y pierde la frescura frutal. En verano, un tinto de temperatura
                ambiente en España puede estar a 25-28 °C. Enfríalo siempre un poco antes de servir.
              </li>
              <li>
                <strong>Confundir crianza con calidad:</strong> el tiempo en barrica no mejora
                automáticamente un vino mediocre. Un joven de buena varietal y buen productor
                puede superar a una crianza de uva inferior. El tiempo en madera es una herramienta,
                no un certificado de calidad.
              </li>
              <li>
                <strong>Comprar por la marca de la copa en el corcho:</strong> el corcho no garantiza
                nada sobre el vino. Los tapones de rosca (screw cap) son igualmente válidos o mejores
                para vinos jóvenes y frescos, sin riesgo de TCA (corcho contaminado, olor a humedad).
              </li>
              <li>
                <strong>Guardar el vino de pie:</strong> las botellas con corcho deben guardarse
                horizontalmente para mantener el corcho húmedo y evitar la entrada de oxígeno.
                Las botellas con screw cap pueden guardarse verticalmente sin problema.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-varietales-vino')} />

        <ShareCard appName="guia-varietales-vino" />

        <Footer appName="guia-varietales-vino" />
      </div>
    </>
  );
}
