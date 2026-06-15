'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './GuiaTejidosFibras.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================================
// TIPOS Y DATOS
// ============================================================

type OrigenFibra =
  | 'Natural-Vegetal'
  | 'Natural-Animal'
  | 'Natural-Mineral'
  | 'Sintética'
  | 'Semisintética'
  | 'Técnica';

type CuidadoLavado =
  | 'Mano'
  | 'Máquina-30'
  | 'Máquina-40'
  | 'Máquina-60'
  | 'Lavado-en-seco'
  | 'Sin-lavar';

type PropiedadDestacada =
  | 'Transpirable'
  | 'Impermeable'
  | 'Aislante'
  | 'Resistente'
  | 'Elástico'
  | 'Hipoalergénico'
  | 'Ignífugo'
  | 'Antibacteriano';

interface TejidoFibra {
  id: string;
  nombre: string;
  nombreTecnico: string;
  origen: OrigenFibra;
  descripcion: string;
  propiedades: PropiedadDestacada[];
  cuidadoPrincipal: CuidadoLavado;
  temperatura: number | null;
  usosPrincipales: string[];
  curiosidad: string;
  sostenibilidad: 'Alta' | 'Media' | 'Baja';
}

const ORIGENES: OrigenFibra[] = [
  'Natural-Vegetal',
  'Natural-Animal',
  'Natural-Mineral',
  'Sintética',
  'Semisintética',
  'Técnica',
];

const ORIGEN_COLORES: Record<OrigenFibra, string> = {
  'Natural-Vegetal': '#4CAF50',
  'Natural-Animal': '#FF9800',
  'Natural-Mineral': '#9E9E9E',
  'Sintética': '#2196F3',
  'Semisintética': '#9C27B0',
  'Técnica': '#F44336',
};

const TEJIDOS: TejidoFibra[] = [
  // ── NATURALES VEGETALES ──────────────────────────────────
  {
    id: 'algodon',
    nombre: 'Algodón',
    nombreTecnico: 'Gossypium hirsutum',
    origen: 'Natural-Vegetal',
    descripcion: 'La fibra natural más utilizada en el mundo. Suave, absorbente y cómoda contra la piel. Se cultiva en regiones cálidas y se usa desde hace más de 7.000 años.',
    propiedades: ['Transpirable', 'Hipoalergénico'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Ropa cotidiana', 'Sábanas y ropa de cama', 'Toallas y textil hogar'],
    curiosidad: 'Un solo kilogramo de algodón requiere hasta 10.000 litros de agua para su producción, convirtiéndolo en uno de los cultivos más intensivos en agua.',
    sostenibilidad: 'Media',
  },
  {
    id: 'lino',
    nombre: 'Lino',
    nombreTecnico: 'Linum usitatissimum',
    origen: 'Natural-Vegetal',
    descripcion: 'Fibra vegetal procedente del tallo de la planta del lino. Fresca en verano, antibacteriana por naturaleza y muy resistente. Se vuelve más suave con cada lavado.',
    propiedades: ['Transpirable', 'Antibacteriano', 'Resistente'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Ropa de verano', 'Mantelería y servilletas', 'Ropa de cama'],
    curiosidad: 'El lino es una de las fibras textiles más antiguas de la humanidad: se han encontrado tejidos de lino en tumbas egipcias de más de 4.000 años de antigüedad.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'canamo',
    nombre: 'Cáñamo',
    nombreTecnico: 'Cannabis sativa',
    origen: 'Natural-Vegetal',
    descripcion: 'Fibra natural obtenida del tallo de la planta de cáñamo. Extremadamente resistente, transpirable y ecológico: crece sin pesticidas y mejora el suelo.',
    propiedades: ['Resistente', 'Transpirable', 'Antibacteriano'],
    cuidadoPrincipal: 'Máquina-30',
    temperatura: 30,
    usosPrincipales: ['Cuerdas y cordajes', 'Bolsas y accesorios', 'Ropa sostenible'],
    curiosidad: 'El cáñamo produce el doble de fibra por hectárea que el algodón y puede crecer en casi cualquier clima sin necesidad de pesticidas ni fertilizantes artificiales.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'yute',
    nombre: 'Yute',
    nombreTecnico: 'Corchorus capsularis',
    origen: 'Natural-Vegetal',
    descripcion: 'Fibra vegetal áspera y biodegradable obtenida del tallo de la planta de yute. Una de las fibras naturales más baratas y ecológicas disponibles.',
    propiedades: ['Resistente'],
    cuidadoPrincipal: 'Mano',
    temperatura: 30,
    usosPrincipales: ['Sacos y envases', 'Alfombras y esteras', 'Jardinería y horticultura'],
    curiosidad: 'El yute se llama "la fibra dorada" en India y Bangladesh, donde se cultiva el 85% de la producción mundial. Se degrada completamente en el suelo en pocas semanas.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'bambu',
    nombre: 'Bambú',
    nombreTecnico: 'Phyllostachys edulis',
    origen: 'Natural-Vegetal',
    descripcion: 'Fibra obtenida de la pulpa del bambú mediante proceso mecánico o químico. Naturalmente suave, antibacteriana y con rápido crecimiento sin necesidad de replantación.',
    propiedades: ['Transpirable', 'Antibacteriano', 'Hipoalergénico'],
    cuidadoPrincipal: 'Máquina-30',
    temperatura: 30,
    usosPrincipales: ['Ropa interior y básicos', 'Toallas y textil baño', 'Ropa deportiva'],
    curiosidad: 'El bambú es la planta de crecimiento más rápido del mundo: algunas especies crecen hasta 91 cm en un solo día, lo que lo hace extraordinariamente renovable.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'ramio',
    nombre: 'Ramio',
    nombreTecnico: 'Boehmeria nivea',
    origen: 'Natural-Vegetal',
    descripcion: 'Fibra natural muy brillante y resistente obtenida de una planta herbácea asiática. Similar al lino pero con mayor brillo y capacidad de absorción.',
    propiedades: ['Transpirable', 'Resistente', 'Antibacteriano'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Textiles para el hogar', 'Ropa étnica tradicional', 'Mezclas con otras fibras'],
    curiosidad: 'El ramio es una de las fibras vegetales más resistentes del mundo: su resistencia a la tracción supera incluso a la del acero del mismo grosor.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'sisal',
    nombre: 'Sisal',
    nombreTecnico: 'Agave sisalana',
    origen: 'Natural-Vegetal',
    descripcion: 'Fibra dura obtenida de las hojas del agave sisal. Muy robusta, biodegradable y resistente a la humedad. Se utiliza principalmente en aplicaciones industriales.',
    propiedades: ['Resistente'],
    cuidadoPrincipal: 'Sin-lavar',
    temperatura: null,
    usosPrincipales: ['Cuerdas y redes', 'Alfombras y felpudos', 'Materiales compuestos'],
    curiosidad: 'El sisal fue fundamental durante las guerras mundiales para fabricar cuerdas navales. Hoy se investiga su uso como refuerzo en materiales compuestos para la industria del automóvil.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'kapok',
    nombre: 'Kapok',
    nombreTecnico: 'Ceiba pentandra',
    origen: 'Natural-Vegetal',
    descripcion: 'Fibra suave y ligera obtenida de las cápsulas de la ceiba. No puede hilarse por sí sola debido a su suavidad extrema, pero es ideal como relleno natural.',
    propiedades: ['Hipoalergénico', 'Aislante'],
    cuidadoPrincipal: 'Sin-lavar',
    temperatura: null,
    usosPrincipales: ['Relleno de almohadas y cojines', 'Chalecos salvavidas históricos', 'Aislamiento acústico'],
    curiosidad: 'Las fibras de kapok son huecas, lo que las hace extraordinariamente ligeras y flotantes. Fueron el material estándar de los chalecos salvavidas antes de la aparición de los sintéticos.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'algodon-organico',
    nombre: 'Algodón orgánico',
    nombreTecnico: 'Gossypium hirsutum (orgánico)',
    origen: 'Natural-Vegetal',
    descripcion: 'Algodón cultivado sin pesticidas ni fertilizantes sintéticos, certificado por organizaciones como GOTS o OCS. Mismas propiedades que el algodón convencional con menor impacto ambiental.',
    propiedades: ['Transpirable', 'Hipoalergénico'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Ropa para bebés y piel sensible', 'Textil hogar premium', 'Moda sostenible'],
    curiosidad: 'El algodón orgánico certificado usa hasta un 91% menos de agua y un 62% menos de energía en su producción comparado con el algodón convencional.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'pita',
    nombre: 'Pita',
    nombreTecnico: 'Agave americana',
    origen: 'Natural-Vegetal',
    descripcion: 'Fibra resistente extraída de las hojas del agave americano. Naturalmente resistente a la sal marina y a la humedad, con propiedades impermeabilizantes únicas.',
    propiedades: ['Resistente', 'Impermeable'],
    cuidadoPrincipal: 'Sin-lavar',
    temperatura: null,
    usosPrincipales: ['Cuerdas marinas y pesqueras', 'Cestos y artesanías', 'Cordeles tradicionales'],
    curiosidad: 'La planta del agave tarda entre 8 y 30 años en alcanzar la madurez necesaria para extraer la fibra. Tras la floración, la planta muere, pero produce miles de hijuelos.',
    sostenibilidad: 'Alta',
  },

  // ── NATURALES ANIMALES ───────────────────────────────────
  {
    id: 'lana-merino',
    nombre: 'Lana merino',
    nombreTecnico: 'Ovis aries (merino)',
    origen: 'Natural-Animal',
    descripcion: 'Lana ultrafina obtenida de la oveja merina. Sorprendentemente suave y no pica a pesar de ser lana. Regula la temperatura corporal y controla los olores de forma natural.',
    propiedades: ['Aislante', 'Transpirable', 'Antibacteriano'],
    cuidadoPrincipal: 'Mano',
    temperatura: 30,
    usosPrincipales: ['Ropa deportiva técnica', 'Calcetines de trekking', 'Jerséis y básicos'],
    curiosidad: 'La lana merino puede absorber hasta el 35% de su peso en humedad sin sentirse mojada al tacto. Además, es naturalmente resistente a los olores gracias a su estructura proteínica.',
    sostenibilidad: 'Media',
  },
  {
    id: 'lana-virgen',
    nombre: 'Lana virgen',
    nombreTecnico: 'Ovis aries',
    origen: 'Natural-Animal',
    descripcion: 'Lana obtenida directamente del esquilado de las ovejas, sin haber sido previamente procesada ni reciclada. Excelente aislante natural que regula la temperatura.',
    propiedades: ['Aislante', 'Elástico'],
    cuidadoPrincipal: 'Mano',
    temperatura: 30,
    usosPrincipales: ['Abrigos y chaquetas', 'Alfombras y mantas', 'Tejidos de punto'],
    curiosidad: 'La lana es una fibra autoapagante: si se acerca al fuego, se carboniza y apaga en lugar de arder y propagar la llama como hacen las fibras sintéticas.',
    sostenibilidad: 'Media',
  },
  {
    id: 'seda',
    nombre: 'Seda',
    nombreTecnico: 'Bombyx mori',
    origen: 'Natural-Animal',
    descripcion: 'Fibra natural producida por el gusano de seda al crear su capullo. Brillante, suave y naturalmente hipoalergénica. Un único capullo puede proporcionar hasta 1.500 m de hilo continuo.',
    propiedades: ['Transpirable', 'Hipoalergénico'],
    cuidadoPrincipal: 'Lavado-en-seco',
    temperatura: null,
    usosPrincipales: ['Blusas y vestidos de lujo', 'Corbatas y pañuelos', 'Ropa interior premium'],
    curiosidad: 'El hilo de seda es más resistente que el acero a igual diámetro. Un capullo de gusano de seda contiene entre 300 y 1.500 m de hilo continuo y finísimo.',
    sostenibilidad: 'Media',
  },
  {
    id: 'cachemira',
    nombre: 'Cachemira',
    nombreTecnico: 'Capra hircus',
    origen: 'Natural-Animal',
    descripcion: 'Fibra ultrafina obtenida mediante peinado de la cabra de Cachemira. Extraordinariamente suave, aislante y ligera. Una de las fibras más cotizadas y caras del mercado.',
    propiedades: ['Aislante', 'Hipoalergénico'],
    cuidadoPrincipal: 'Lavado-en-seco',
    temperatura: null,
    usosPrincipales: ['Jerséis y cárdigans de lujo', 'Pashminas y bufandas', 'Abrigos premium'],
    curiosidad: 'Cada cabra de Cachemira produce solo entre 150 y 200 gramos de fibra al año. Un jersey de cachemira puro requiere la producción de 2 a 3 cabras durante un año entero.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'angora',
    nombre: 'Angora',
    nombreTecnico: 'Angora rabbit',
    origen: 'Natural-Animal',
    descripcion: 'Fibra finísima obtenida del pelo del conejo de angora. Extremadamente suave y ligera, con un efecto "halo" característico. Ocho veces más cálida que la lana de oveja.',
    propiedades: ['Aislante', 'Hipoalergénico'],
    cuidadoPrincipal: 'Lavado-en-seco',
    temperatura: null,
    usosPrincipales: ['Jerséis y accesorios de lujo', 'Prendas muy cálidas', 'Mezclas con otras fibras'],
    curiosidad: 'La angora es una de las fibras naturales más cálidas disponibles. Sin embargo, tiene poca resistencia y se suele mezclar con lana o nailon para mejorar su durabilidad.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'alpaca',
    nombre: 'Alpaca',
    nombreTecnico: 'Vicugna pacos',
    origen: 'Natural-Animal',
    descripcion: 'Fibra natural obtenida de la alpaca andina. Naturalmente hipoalergénica por carecer de lanolina, suave al tacto y excelente aislante. Viene en 22 colores naturales.',
    propiedades: ['Aislante', 'Hipoalergénico', 'Transpirable'],
    cuidadoPrincipal: 'Mano',
    temperatura: 30,
    usosPrincipales: ['Ropa de lujo y premium', 'Abrigos y chaquetas', 'Mantas y accesorios'],
    curiosidad: 'La alpaca es nativa de los Andes sudamericanos y ha sido domesticada durante más de 6.000 años. Su fibra no contiene lanolina, lo que la hace apta para personas alérgicas a la lana.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'mohair',
    nombre: 'Mohair',
    nombreTecnico: 'Angora goat',
    origen: 'Natural-Animal',
    descripcion: 'Fibra sedosa y brillante obtenida de la cabra de angora. Notable por su lustre natural, esponjosidad y durabilidad. Acepta tintes de forma excepcional.',
    propiedades: ['Aislante', 'Resistente'],
    cuidadoPrincipal: 'Lavado-en-seco',
    temperatura: null,
    usosPrincipales: ['Jerséis de punto esponjoso', 'Tejidos decorativos y tapicería', 'Mezclas con seda o lana'],
    curiosidad: 'El mohair es una de las fibras más brillantes del mundo animal. Una sola cabra de angora puede producir hasta 5 kg de fibra al año, significativamente más que la mayoría de fibras de lujo.',
    sostenibilidad: 'Media',
  },
  {
    id: 'vicuna',
    nombre: 'Vicuña',
    nombreTecnico: 'Vicugna vicugna',
    origen: 'Natural-Animal',
    descripcion: 'La fibra animal más fina del mundo, procedente del camélido silvestre andino. Extremadamente cálida a pesar de su finura casi imperceptible. Regulada por convenios internacionales.',
    propiedades: ['Aislante', 'Hipoalergénico'],
    cuidadoPrincipal: 'Lavado-en-seco',
    temperatura: null,
    usosPrincipales: ['Tejidos de altísimo lujo', 'Abrigos y capas exclusivas', 'Coleccionismo textil'],
    curiosidad: 'La vicuña solo puede ser esquilada cada 2-3 años y produce apenas 250 g de fibra por animal. Un abrigo de vicuña puede superar los 30.000 € por el coste de la materia prima.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'cuero',
    nombre: 'Cuero',
    nombreTecnico: 'Bos taurus (piel curtida)',
    origen: 'Natural-Animal',
    descripcion: 'Material obtenido mediante el curtido de pieles animales, principalmente bovina. Resistente, duradero e impermeable. Su aspecto mejora con el tiempo y el uso.',
    propiedades: ['Resistente', 'Impermeable'],
    cuidadoPrincipal: 'Sin-lavar',
    temperatura: null,
    usosPrincipales: ['Calzado y botas', 'Bolsos y marroquinería', 'Chaquetas y accesorios'],
    curiosidad: 'El proceso de curtido más antiguo conocido se realizaba con extractos de taninos vegetales. El cuero correctamente cuidado puede durar décadas e incluso siglos, como demuestran los hallazgos arqueológicos.',
    sostenibilidad: 'Baja',
  },

  // ── SINTÉTICAS ───────────────────────────────────────────
  {
    id: 'poliester',
    nombre: 'Poliéster',
    nombreTecnico: 'Tereftalato de polietileno (PET)',
    origen: 'Sintética',
    descripcion: 'La fibra sintética más producida y utilizada del mundo. Resistente al arrugado, de secado rápido y económico. Derivado del petróleo, aunque existen versiones recicladas.',
    propiedades: ['Resistente'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Ropa casual y deportiva', 'Rellenos y fiberfill', 'Tapicería y textil hogar'],
    curiosidad: 'El poliéster reciclado (rPET) se fabrica a partir de botellas de plástico. Una camiseta de rPET requiere aproximadamente 5 botellas de plástico recicladas de 500 ml.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'nailon',
    nombre: 'Nailon / Poliamida',
    nombreTecnico: 'PA6 / PA66',
    origen: 'Sintética',
    descripcion: 'Primera fibra sintética creada en laboratorio, en 1938. Elástico, muy resistente a la abrasión y de secado ultrarrápido. Ampliamente usado en ropa técnica y medias.',
    propiedades: ['Elástico', 'Resistente'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Medias y lencería', 'Ropa deportiva y outdoor', 'Paracaídas y equipamiento técnico'],
    curiosidad: 'El nailon fue presentado al mundo en 1939 como "fibra sintética más resistente que el acero". En sus primeros días de venta, se vendieron 64 millones de pares de medias de nailon en un solo año.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'acrilico',
    nombre: 'Acrílico',
    nombreTecnico: 'Poliacrilonitrilo (PAN)',
    origen: 'Sintética',
    descripcion: 'Fibra sintética que imita la apariencia y el tacto de la lana a menor coste. Ligera, de secado rápido y resistente a las polillas. No encoge con el lavado como la lana.',
    propiedades: ['Aislante'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Jerséis y prendas de punto económicas', 'Alfombras y moquetas', 'Ropa de exterior y uniformes'],
    curiosidad: 'El acrílico es la fibra sintética más susceptible de acumular electricidad estática. También es uno de los mayores contribuyentes a la contaminación por microfibras en océanos.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'elastano',
    nombre: 'Elastano / Spandex',
    nombreTecnico: 'Poliuretano segmentado (Lycra)',
    origen: 'Sintética',
    descripcion: 'Fibra sintética con capacidad de estirarse hasta 6 veces su longitud original y recuperar su forma. Siempre se usa mezclada con otras fibras para aportar elasticidad.',
    propiedades: ['Elástico'],
    cuidadoPrincipal: 'Máquina-30',
    temperatura: 30,
    usosPrincipales: ['Ropa deportiva y fitness', 'Bikinis y bañadores', 'Calcetines y ropa interior'],
    curiosidad: 'El elastano nunca se usa solo: siempre en mezcla con otras fibras. Basta con un 2-5% de elastano en una tela para proporcionar una elasticidad significativa al tejido resultante.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'polipropileno',
    nombre: 'Polipropileno',
    nombreTecnico: 'Polipropileno (PP)',
    origen: 'Sintética',
    descripcion: 'Fibra sintética extremadamente ligera que no absorbe agua. Transporta la humedad hacia el exterior manteniéndose seco. Muy usado en capas base de ropa técnica de invierno.',
    propiedades: ['Impermeable', 'Transpirable'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Ropa interior técnica de montaña', 'Geotextiles y agricultura', 'Bolsas reutilizables'],
    curiosidad: 'El polipropileno es la única fibra textil con densidad menor que el agua: flota. Esta propiedad única lo hace ideal para aplicaciones donde el peso y la flotabilidad son críticos.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'polietileno',
    nombre: 'Polietileno',
    nombreTecnico: 'Polietileno (PE)',
    origen: 'Sintética',
    descripcion: 'Fibra sintética química y biológicamente inerte. Muy resistente a los productos químicos y la intemperie. Se usa principalmente en aplicaciones industriales y técnicas.',
    propiedades: ['Resistente', 'Impermeable'],
    cuidadoPrincipal: 'Sin-lavar',
    temperatura: null,
    usosPrincipales: ['Cuerdas y cables industriales', 'Envases y embalajes textiles', 'Fibras para filtración'],
    curiosidad: 'El polietileno de alta densidad (HDPE) tiene una relación resistencia/peso mayor que el acero. En forma de hilo se usa en equipos de protección individual de alta prestación.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'kevlar',
    nombre: 'Kevlar',
    nombreTecnico: 'Poli-parafenilenotereftalamida',
    origen: 'Sintética',
    descripcion: 'Fibra aramídica de altas prestaciones desarrollada por DuPont. Cinco veces más resistente que el acero a igual peso, ignífugo y con excelente resistencia a la abrasión.',
    propiedades: ['Resistente', 'Ignífugo'],
    cuidadoPrincipal: 'Sin-lavar',
    temperatura: null,
    usosPrincipales: ['Chalecos antibalas y blindajes', 'Cascos y protecciones', 'Guantes de protección industrial'],
    curiosidad: 'El Kevlar fue descubierto accidentalmente en 1965 por la química Stephanie Kwolek mientras buscaba fibras ligeras para neumáticos de coche. Su descubrimiento le valió el Premio Perkin en 1997.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'nomex',
    nombre: 'Nomex',
    nombreTecnico: 'Poli-m-fenilenoisoftalamida (PMIA)',
    origen: 'Sintética',
    descripcion: 'Fibra aramídica ignífuga certificada desarrollada por DuPont. No funde ni gotea cuando se expone al fuego, simplemente se carboniza. Usada en equipos de protección para trabajo con fuego.',
    propiedades: ['Ignífugo', 'Resistente'],
    cuidadoPrincipal: 'Máquina-60',
    temperatura: 60,
    usosPrincipales: ['Uniformes de bomberos', 'Mono de pilotos de carreras', 'Equipamiento aeronáutico'],
    curiosidad: 'Los trajes de los pilotos de Fórmula 1 están fabricados con múltiples capas de Nomex. Un traje completo puede soportar temperaturas de 800 °C durante varios segundos sin transmitir calor letal.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'uhmwpe',
    nombre: 'UHMWPE (Dyneema)',
    nombreTecnico: 'Polietileno de ultra-alto peso molecular',
    origen: 'Sintética',
    descripcion: 'Fibra sintética considerada la más resistente del mundo por unidad de peso: 15 veces más resistente que el acero. Extremadamente ligera y flotante. Marca comercial más conocida: Dyneema.',
    propiedades: ['Resistente', 'Impermeable'],
    cuidadoPrincipal: 'Sin-lavar',
    temperatura: null,
    usosPrincipales: ['Cuerdas náuticas de alta prestación', 'Chalecos antibalas ligeros', 'Velas de regata y ropa de alta montaña'],
    curiosidad: 'Una cuerda de Dyneema del diámetro de un lápiz puede aguantar una carga de 23 toneladas. Es tan ligera que flota en el agua, a diferencia de casi cualquier otra cuerda de alta resistencia.',
    sostenibilidad: 'Baja',
  },

  // ── SEMISINTÉTICAS ───────────────────────────────────────
  {
    id: 'rayon-viscosa',
    nombre: 'Rayón / Viscosa',
    nombreTecnico: 'Celulosa regenerada',
    origen: 'Semisintética',
    descripcion: 'Primera fibra artificial de la historia (1891). Obtenida regenerando celulosa de madera mediante proceso químico. Suave, fluida y absorbente; imita la seda a menor coste.',
    propiedades: ['Transpirable'],
    cuidadoPrincipal: 'Mano',
    temperatura: 30,
    usosPrincipales: ['Blusas y vestidos veraniegos', 'Forros de ropa', 'Prendas fluidas y ligeras'],
    curiosidad: 'La viscosa fue llamada originalmente "seda artificial" y fue el primer intento de reproducir la seda en laboratorio. Su proceso de fabricación usa productos químicos como la sosa cáustica y el sulfuro de carbono.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'modal',
    nombre: 'Modal',
    nombreTecnico: 'Celulosa de haya (Fagus sylvatica)',
    origen: 'Semisintética',
    descripcion: 'Fibra semisintética obtenida de la celulosa de la madera de haya. Más suave y resistente que la viscosa convencional, y mantiene su suavidad después de múltiples lavados.',
    propiedades: ['Transpirable', 'Hipoalergénico'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Ropa interior y camisetas', 'Pijamas y ropa de dormir', 'Ropa deportiva suave'],
    curiosidad: 'El modal producido por Lenzing (Austria) usa madera de hayas de bosques europeos certificados. Su proceso requiere significativamente menos agua que el algodón convencional.',
    sostenibilidad: 'Media',
  },
  {
    id: 'lyocell-tencel',
    nombre: 'Lyocell / Tencel',
    nombreTecnico: 'Celulosa de eucalipto (Eucalyptus globulus)',
    origen: 'Semisintética',
    descripcion: 'Fibra semisintética ecológica producida en circuito cerrado de solvente (recuperado en más del 99%). Suave, transpirable y biodegradable. Tencel es la marca comercial más reconocida.',
    propiedades: ['Transpirable', 'Hipoalergénico', 'Antibacteriano'],
    cuidadoPrincipal: 'Máquina-30',
    temperatura: 30,
    usosPrincipales: ['Ropa casual y básicos', 'Sábanas y ropa de cama', 'Ropa infantil y piel sensible'],
    curiosidad: 'El proceso de fabricación del Lyocell recupera y reutiliza más del 99% del solvente orgánico empleado. Los bosques de eucalipto de los que procede crecen en tierras no aptas para agricultura.',
    sostenibilidad: 'Alta',
  },
  {
    id: 'acetato',
    nombre: 'Acetato',
    nombreTecnico: 'Acetato de celulosa',
    origen: 'Semisintética',
    descripcion: 'Fibra semisintética derivada de la celulosa tratada con ácido acético. Brillante y con caída similar a la seda. Absorbe poca humedad y seca rápidamente.',
    propiedades: ['Transpirable'],
    cuidadoPrincipal: 'Lavado-en-seco',
    temperatura: null,
    usosPrincipales: ['Forros de prendas de moda', 'Pañuelos y bufandas elegantes', 'Filtros de cigarrillos (industrial)'],
    curiosidad: 'El acetato fue uno de los primeros materiales plásticos usados en gafas graduadas, antes de la aparición del acetato de celulosa moldeado que sigue usándose hoy en monturas de lujo.',
    sostenibilidad: 'Media',
  },

  // ── TÉCNICAS ─────────────────────────────────────────────
  {
    id: 'gore-tex',
    nombre: 'Gore-Tex',
    nombreTecnico: 'Politetrafluoroetileno expandido (ePTFE)',
    origen: 'Técnica',
    descripcion: 'Membrana técnica de alta prestación que consigue ser simultáneamente impermeable y transpirable. La membrana tiene 9 mil millones de poros por cm², demasiado pequeños para el agua pero no para el vapor.',
    propiedades: ['Impermeable', 'Transpirable', 'Resistente'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Ropa de montaña y senderismo', 'Calzado técnico impermeable', 'Equipamiento militar y de rescate'],
    curiosidad: 'Gore-Tex fue descubierto accidentalmente en 1969 por Bob Gore, hijo del fundador de W. L. Gore. Al estirar rápidamente el PTFE calentado descubrió que se expandía formando una membrana microporosa.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'coolmax',
    nombre: 'Coolmax',
    nombreTecnico: 'Poliéster modificado (fibra canale)',
    origen: 'Técnica',
    descripcion: 'Fibra técnica de poliéster con sección transversal en forma de canal que gestiona activamente la humedad. Diseñada para transportar el sudor lejos del cuerpo y favorecer la evaporación.',
    propiedades: ['Transpirable', 'Resistente'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Ropa deportiva de alto rendimiento', 'Calcetines técnicos', 'Ropa interior para actividad física'],
    curiosidad: 'La sección transversal en forma de cuatro canales del Coolmax aumenta la superficie de la fibra en un 20% respecto a una fibra redonda convencional, lo que acelera significativamente la evaporación del sudor.',
    sostenibilidad: 'Baja',
  },
  {
    id: 'thinsulate',
    nombre: 'Thinsulate',
    nombreTecnico: 'Microfibra de poliéster (3M)',
    origen: 'Técnica',
    descripcion: 'Aislante sintético de microfibras de 3M que proporciona el calor de la pluma a menor grosor y sin perder prestaciones cuando se moja. Ampliamente usado en guantes, calzado y abrigos de invierno.',
    propiedades: ['Aislante'],
    cuidadoPrincipal: 'Máquina-40',
    temperatura: 40,
    usosPrincipales: ['Guantes y manoplas de invierno', 'Abrigos y parkas', 'Calzado y botas de invierno'],
    curiosidad: 'Las microfibras del Thinsulate tienen un diámetro de 2 micrones, diez veces más finas que el poliéster estándar. Este tamaño atrapa más aire estático por gramo que cualquier relleno convencional.',
    sostenibilidad: 'Baja',
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const ORIGEN_ESTILOS: Record<OrigenFibra, string> = {
  'Natural-Vegetal': styles.origenVegetal,
  'Natural-Animal': styles.origenAnimal,
  'Natural-Mineral': styles.origenMineral,
  'Sintética': styles.origenSintetica,
  'Semisintética': styles.origenSemisintetica,
  'Técnica': styles.origenTecnica,
};

const SOSTENIBILIDAD_ESTILOS: Record<'Alta' | 'Media' | 'Baja', string> = {
  Alta: styles.sosAlta,
  Media: styles.sosMedia,
  Baja: styles.sosBaja,
};

const LAVADO_ETIQUETAS: Record<CuidadoLavado, string> = {
  'Mano': 'A mano',
  'Máquina-30': 'Máquina 30°',
  'Máquina-40': 'Máquina 40°',
  'Máquina-60': 'Máquina 60°',
  'Lavado-en-seco': 'Solo en seco',
  'Sin-lavar': 'No lavar',
};

const LAVADO_ICONOS: Record<CuidadoLavado, string> = {
  'Mano': '🤲',
  'Máquina-30': '🌀',
  'Máquina-40': '🌀',
  'Máquina-60': '🌀',
  'Lavado-en-seco': '🧴',
  'Sin-lavar': '🚫',
};

function PropiedadChip({ propiedad }: { propiedad: PropiedadDestacada }) {
  const iconos: Record<PropiedadDestacada, string> = {
    Transpirable: '💨',
    Impermeable: '💧',
    Aislante: '🌡️',
    Resistente: '💪',
    Elástico: '🔄',
    Hipoalergénico: '🌸',
    Ignífugo: '🔥',
    Antibacteriano: '🦠',
  };
  return (
    <span className={styles.propiedadChip}>
      <span aria-hidden="true">{iconos[propiedad]}</span> {propiedad}
    </span>
  );
}

export default function GuiaTejidosFibrasPage() {
  const [busqueda, setBusqueda] = useState('');
  const [origenActivo, setOrigenActivo] = useState<OrigenFibra | 'Todos'>('Todos');
  const [sostenibilidadActiva, setSostenibilidadActiva] = useState<'Alta' | 'Media' | 'Baja' | 'Todas'>('Todas');

  const tejidosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return TEJIDOS.filter((t) => {
      const coincideOrigen = origenActivo === 'Todos' || t.origen === origenActivo;
      const coincideSostenibilidad = sostenibilidadActiva === 'Todas' || t.sostenibilidad === sostenibilidadActiva;
      const coincideBusqueda =
        !q ||
        t.nombre.toLowerCase().includes(q) ||
        t.nombreTecnico.toLowerCase().includes(q) ||
        t.usosPrincipales.some((u) => u.toLowerCase().includes(q)) ||
        t.propiedades.some((p) => p.toLowerCase().includes(q));
      return coincideOrigen && coincideSostenibilidad && coincideBusqueda;
    });
  }, [busqueda, origenActivo, sostenibilidadActiva]);

  const origenesCuentas = useMemo(() => {
    const todos = { nombre: 'Todos' as const, count: TEJIDOS.length };
    const porOrigen = ORIGENES.map((o) => ({
      nombre: o,
      count: TEJIDOS.filter((t) => t.origen === o).length,
    }));
    return [todos, ...porOrigen];
  }, []);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🧵</span> Guía de Tejidos y Fibras</h1>
          <p className={styles.subtitle}>
            Directorio de {TEJIDOS.length} materiales textiles: naturales, sintéticos y técnicos.
            Propiedades, cuidados y sostenibilidad.
          </p>
          <div className={styles.heroStats}>
            <span className={styles.stat}><strong>{TEJIDOS.length}</strong> tejidos y fibras</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><strong>{ORIGENES.length}</strong> tipos de origen</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><strong>Cuidados + sostenibilidad</strong> incluidos</span>
          </div>
        </header>

        <LegalNotice />

        {/* Buscador */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Busca por nombre, propiedad o uso…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar tejido o fibra"
            />
            {busqueda && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtros por origen */}
        <div className={styles.filtrosWrapper} role="group" aria-label="Filtrar por tipo de origen">
          {origenesCuentas.map(({ nombre, count }) => (
            <button
              key={nombre}
              type="button"
              className={`${styles.filtroBtn} ${origenActivo === nombre ? styles.filtroActivo : ''}`}
              onClick={() => setOrigenActivo(nombre)}
              aria-pressed={origenActivo === nombre}
              style={
                nombre !== 'Todos' && origenActivo !== nombre
                  ? { borderColor: ORIGEN_COLORES[nombre as OrigenFibra] + '40' }
                  : nombre !== 'Todos' && origenActivo === nombre
                  ? { backgroundColor: ORIGEN_COLORES[nombre as OrigenFibra], borderColor: ORIGEN_COLORES[nombre as OrigenFibra] }
                  : undefined
              }
            >
              {nombre}
              {nombre !== 'Todos' && <span className={styles.filtroCount}>{count}</span>}
            </button>
          ))}
        </div>

        {/* Filtros por sostenibilidad */}
        <div className={styles.sostenibilidadFiltros} role="group" aria-label="Filtrar por sostenibilidad">
          <span className={styles.filtroLabel}>Sostenibilidad:</span>
          {(['Todas', 'Alta', 'Media', 'Baja'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.sosFiltroBtn} ${sostenibilidadActiva === s ? styles.sosFiltroActivo : ''} ${s !== 'Todas' ? styles[`sos${s}Btn`] : ''}`}
              onClick={() => setSostenibilidadActiva(s)}
              aria-pressed={sostenibilidadActiva === s}
            >
              {s === 'Alta' ? '🌱 Alta' : s === 'Media' ? '🟡 Media' : s === 'Baja' ? '🔴 Baja' : 'Todas'}
            </button>
          ))}
        </div>

        {/* Contador resultados */}
        <div className={styles.resultadosHeader} role="status" aria-live="polite">
          {tejidosFiltrados.length === 0 ? (
            <p className={styles.sinResultados}>No hay resultados para «{busqueda}»</p>
          ) : (
            <p className={styles.contadorResultados}>
              {tejidosFiltrados.length === TEJIDOS.length
                ? `Mostrando los ${TEJIDOS.length} tejidos y fibras`
                : `${tejidosFiltrados.length} tejido${tejidosFiltrados.length !== 1 ? 's' : ''} encontrado${tejidosFiltrados.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* Grid de tarjetas */}
        <div className={styles.tejidosGrid}>
          {tejidosFiltrados.map((t) => (
            <article key={t.id} className={styles.tejidoCard}>
              <div
                className={styles.cardHeader}
                style={{ borderTopColor: ORIGEN_COLORES[t.origen] }}
              >
                <div className={styles.cardHeaderTop}>
                  <h3 className={styles.nombre}>{t.nombre}</h3>
                  <span className={`${styles.sosBadge} ${SOSTENIBILIDAD_ESTILOS[t.sostenibilidad]}`}>
                    {t.sostenibilidad === 'Alta' ? '🌱' : t.sostenibilidad === 'Media' ? '🟡' : '🔴'} {t.sostenibilidad}
                  </span>
                </div>
                <span className={`${styles.origenBadge} ${ORIGEN_ESTILOS[t.origen]}`}>
                  {t.origen}
                </span>
              </div>

              <p className={styles.nombreTecnico}>{t.nombreTecnico}</p>

              <p className={styles.descripcion}>{t.descripcion}</p>

              <div className={styles.propiedadesRow}>
                {t.propiedades.map((p) => (
                  <PropiedadChip key={p} propiedad={p} />
                ))}
              </div>

              <div className={styles.cuidadoRow}>
                <span className={styles.cuidadoIcon} aria-hidden="true">
                  {LAVADO_ICONOS[t.cuidadoPrincipal]}
                </span>
                <span className={styles.cuidadoTexto}>
                  {LAVADO_ETIQUETAS[t.cuidadoPrincipal]}
                  {t.temperatura !== null && (
                    <span className={styles.temperatura}> — máx. {t.temperatura}°C</span>
                  )}
                </span>
              </div>

              <div className={styles.usosSection}>
                <span className={styles.usosLabel}>Usos principales:</span>
                <ul className={styles.usosList}>
                  {t.usosPrincipales.map((u) => (
                    <li key={u} className={styles.usoItem}>{u}</li>
                  ))}
                </ul>
              </div>

              <p className={styles.curiosidad}>
                <span className={styles.curiosidadIcon} aria-hidden="true">💡</span>
                {t.curiosidad}
              </p>
            </article>
          ))}
        </div>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="📚 Todo sobre tejidos y fibras"
          subtitle="Propiedades, sostenibilidad y cómo elegir el material adecuado"
        >
          {/* 1. Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">📊</span> Comparativa de fibras representativas</h2>
            <p>
              Comparación de seis fibras clave para entender las diferencias fundamentales entre los distintos tipos de materiales textiles:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Fibra</th>
                    <th>Tipo</th>
                    <th>Transpirabilidad</th>
                    <th>Durabilidad</th>
                    <th>Sostenibilidad</th>
                    <th>Precio relativo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Algodón orgánico</strong></td>
                    <td>Natural-Vegetal</td>
                    <td>Alta</td>
                    <td>Media</td>
                    <td>🌱 Alta</td>
                    <td>Medio</td>
                  </tr>
                  <tr>
                    <td><strong>Lana merino</strong></td>
                    <td>Natural-Animal</td>
                    <td>Alta</td>
                    <td>Media-Alta</td>
                    <td>🟡 Media</td>
                    <td>Alto</td>
                  </tr>
                  <tr>
                    <td><strong>Lyocell / Tencel</strong></td>
                    <td>Semisintética</td>
                    <td>Alta</td>
                    <td>Media</td>
                    <td>🌱 Alta</td>
                    <td>Medio-alto</td>
                  </tr>
                  <tr>
                    <td><strong>Poliéster</strong></td>
                    <td>Sintética</td>
                    <td>Baja</td>
                    <td>Alta</td>
                    <td>🔴 Baja</td>
                    <td>Bajo</td>
                  </tr>
                  <tr>
                    <td><strong>Cachemira</strong></td>
                    <td>Natural-Animal</td>
                    <td>Alta</td>
                    <td>Media (delicada)</td>
                    <td>🔴 Baja</td>
                    <td>Muy alto</td>
                  </tr>
                  <tr>
                    <td><strong>Gore-Tex</strong></td>
                    <td>Técnica</td>
                    <td>Alta + impermeable</td>
                    <td>Muy alta</td>
                    <td>🔴 Baja</td>
                    <td>Muy alto</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">👥</span> ¿Qué fibra necesitas según tu perfil?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🏃</span>
                  <h3>Deportista activo</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Lana merino (base) + Coolmax (interior) + Gore-Tex (exterior)</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué:</strong> La merino gestiona el olor, Coolmax seca rápido y Gore-Tex protege de la lluvia manteniendo la transpiración.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">✈️</span>
                  <h3>Viajero frecuente</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Lana merino + Lyocell → antiolor, lavable a mano, poca maleta</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué:</strong> La merino puede usarse varios días sin oler y el Lyocell/Tencel se lava y seca rápido en hotel sin dejar arrugas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🌸</span>
                  <h3>Persona con piel sensible</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Algodón orgánico + Bambú + Alpaca → sin lanolina, sin químicos</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué:</strong> El algodón orgánico evita pesticidas, el bambú es antibacteriano y la alpaca carece de lanolina, el alérgeno más común de la lana.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">👗</span>
                  <h3>Profesional de la moda sostenible</h3>
                </div>
                <div className={styles.escenarioExample}>
                  <code>Lyocell + Lino + Cáñamo + Algodón orgánico → certificados y trazables</code>
                </div>
                <p className={styles.escenarioTip}>
                  <strong>Por qué:</strong> Todas son fibras con alta sostenibilidad ambiental, certificables bajo estándares como GOTS, OEKO-TEX o FSC para cadena de valor trazable.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">❓</span> Preguntas frecuentes sobre tejidos y fibras</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué fibra es mejor para el verano?</h4>
                <p>
                  Para el calor, las mejores opciones son el lino, el algodón (especialmente orgánico), el bambú y el lyocell. Son transpirables, absorben la humedad y permiten que el cuerpo respire. El lino es especialmente fresco porque su estructura capilar favorece la circulación del aire. Evita las fibras sintéticas como el poliéster, que retienen el calor y el sudor.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Truco:</strong> El lino se vuelve más suave con cada lavado, así que no deseches las prendas nuevas si las notas algo rígidas al principio.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cómo lavar correctamente la lana para que no encoja?</h4>
                <p>
                  La lana encoge por el calor y la agitación mecánica combinados, que hacen que las escamas de la fibra se enganchen entre sí. Para evitarlo: usa agua fría o tibia (máximo 30°C), programa de lana o delicados (muy poca agitación), detergente específico para lana (pH neutro) y nunca la retuerces para escurrirla. Sécala extendida en horizontal para mantener la forma.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Regla:</strong> La lana merino es más resistente al lavado que la lana virgen convencional y suele poder lavarse en máquina con programa delicado a 30°C.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué diferencia hay entre viscosa, modal y lyocell?</h4>
                <p>
                  Las tres son fibras semisintéticas de celulosa vegetal, pero con diferente proceso de fabricación y sostenibilidad. La viscosa (rayon) usa un proceso químico agresivo con sosa cáustica. El modal mejora la viscosa usando madera de haya y procesos más eficientes. El lyocell (Tencel) es el más sostenible: circuito cerrado con recuperación del 99% del solvente y madera certificada FSC.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Jerarquía ecológica:</strong> Lyocell &gt; Modal &gt; Viscosa. Si buscas la opción más responsable dentro de las semisintéticas, elige siempre Lyocell/Tencel certificado.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿El poliéster reciclado es realmente sostenible?</h4>
                <p>
                  El rPET (poliéster reciclado de botellas) tiene un impacto menor que el poliéster virgen: usa hasta un 59% menos de energía y reduce las emisiones de CO₂. Sin embargo, sigue siendo plástico: libera microfibras de plástico en cada lavado que acaban en los océanos. Para mitigarlo existen bolsas de lavado especiales (como Guppyfriend) que atrapan las microfibras antes de que lleguen al desagüe.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Dato:</strong> Una lavadora libera hasta 700.000 microfibras plásticas por ciclo de lavado con ropa sintética. El 35% de las microplásticas en océanos procede del lavado de ropa.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué es la lana merino y por qué no pica?</h4>
                <p>
                  La lana merino es la obtenida de la oveja merina, que produce una fibra mucho más fina (15-24 micrones de diámetro) que la lana convencional (mayor de 30 micrones). Las fibras gruesas se doblan al rozar la piel y producen la sensación de picor; las finas se doblan sin molestar. Por eso la merino se puede usar directamente sobre la piel sin la incomodidad de la lana normal.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Regla práctica:</strong> Fibras de menos de 19 micrones se consideran ultrafinas y son prácticamente imperceptibles al tacto. Busca esta especificación en la etiqueta de prendas premium.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cómo saber si una prenda de cachemira es auténtica?</h4>
                <p>
                  La cachemira real se distingue por su peso (muy ligera), suavidad extrema sin pilling inmediato y precio (un jersey de cachemira puro de calidad cuesta mínimo 150-200 €). Desconfía de "cachemira" por 30 €: suele ser acrílico o mezcla con mínimo porcentaje real. Lee la etiqueta de composición (debe decir 100% cachemira o especificar el porcentaje exacto). El pilling rápido es señal de cachemira de baja calidad (fibras cortas) o falsificación.
                </p>
                <p className={styles.faqTip}>
                  💡 <strong>Truco:</strong> La cachemira de calidad debe hacer pilling mínimo en los primeros usos (normal por las fibras cortas superficiales), pero debe desaparecer tras los primeros lavados. Si el pilling es continuo e intenso, la calidad es baja.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">📋</span> Cómo elegir el tejido ideal para cada prenda</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Define el uso principal de la prenda</h4>
                  <p>¿Ropa deportiva (transpirabilidad y gestión de humedad), ropa de abrigo (aislamiento térmico), ropa de verano (frescor), trabajo técnico (protección) o moda (estética y durabilidad)? El uso determina qué propiedades son imprescindibles y cuáles secundarias.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Considera el contacto con la piel</h4>
                  <p>Las prendas en contacto directo con la piel (camisetas, calcetines, ropa interior) requieren fibras suaves e hipoalergénicas: merino, algodón orgánico, bambú, lyocell, alpaca. Las prendas exteriores admiten fibras más rígidas o técnicas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Valora el cuidado que puedes dedicar</h4>
                  <p>Algunas fibras son exigentes: la seda y la cachemira requieren lavado en seco o a mano con delicadeza. Si buscas practicidad máxima, el algodón, el poliéster o el lyocell admiten lavadora. Piensa en el tiempo real que dedicarás al mantenimiento antes de comprar.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Ten en cuenta la sostenibilidad según tu prioridad</h4>
                  <p>Si la sostenibilidad importa, prioriza fibras con alta puntuación: lino, cáñamo, lyocell certificado, algodón orgánico, alpaca. Evita las fibras sintéticas derivadas del petróleo cuando haya alternativas adecuadas para ese uso.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Considera las mezclas de fibras</h4>
                  <p>Las mezclas combinan lo mejor de varias fibras: algodón + elastano (comodidad + elasticidad), lana + poliamida (calor + resistencia), seda + cachemira (suavidad excepcional). Lee siempre la composición completa de la etiqueta, no solo la fibra mayoritaria.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Mejores prácticas */}
          <section className={styles.guideSection}>
            <h2><span aria-hidden="true">✅</span> Consejos para el cuidado y conservación de tejidos</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
                <h4>Lee siempre la etiqueta de cuidado</h4>
                <p>Los pictogramas internacionales de la etiqueta (tina de agua, triángulo, círculo, cuadrado) son el manual definitivo de la prenda. Una sola colada demasiado caliente puede arruinar una prenda de lana o seda irreversiblemente.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💨</span>
                <h4>Seca al aire, no en secadora</h4>
                <p>La mayoría de fibras naturales (lana, seda, lino, cachemira) no toleran la secadora o pierden calidad con el tiempo. El calor intenso daña las fibras. El secado al aire prolonga la vida útil de las prendas significativamente.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🪲</span>
                <h4>Protege las fibras animales de las polillas</h4>
                <p>Lana, cachemira, angora y mohair son vulnerables a las larvas de polilla que se alimentan de las proteínas de la fibra. Guarda estas prendas limpias en bolsas herméticas o con repelentes naturales (lavanda, cedro) en temporada de guardado.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧴</span>
                <h4>Usa detergente adecuado para cada fibra</h4>
                <p>La lana y la seda necesitan detergentes de pH neutro o específicos: los detergentes alcalinos dañan sus proteínas. Para las fibras vegetales (algodón, lino) los detergentes normales son válidos. Las fibras técnicas (Gore-Tex) tienen detergentes específicos que preservan sus membranas.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                <h4>Renueva el tratamiento DWR del Gore-Tex</h4>
                <p>Las prendas Gore-Tex y otras membranas impermeables llevan un tratamiento DWR (Durable Water Repellent) que se degrada con el uso y los lavados. Se reactiva planchando suavemente o usando calor de secadora, y puede regenerarse con sprays específicos cuando el agua ya no perla correctamente.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning box */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <h3>Errores típicos al lavar o cuidar tejidos</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>❌ Lavar la lana o cachemira en programa normal de algodón:</strong> El calor y la agitación mecánica activan el proceso de apelmazamiento irreversible de la lana. Solo programa de lana (fría, sin agitación) o a mano. Una sola lavada equivocada puede reducir a la mitad el tamaño de la prenda.
                </li>
                <li>
                  <strong>❌ Secar la seda en secadora o al sol directo:</strong> El calor intenso degrada las proteínas de la seda y el sol directo la decolora y fragiliza rápidamente. La seda debe secarse a la sombra, extendida sin apretar, lejos de fuentes de calor.
                </li>
                <li>
                  <strong>❌ Mezclar ropa de colores con blanca en agua caliente:</strong> Muchos tintes naturales (especialmente de fibras naturales como lino o algodón sin fijador) se sueltan con el calor. Lava siempre las prendas nuevas de colores vivos por separado las primeras veces.
                </li>
                <li>
                  <strong>❌ Guardar prendas de fibras animales sin lavar:</strong> Las manchas de sudor y alimentos atraen a las larvas de polilla. Las prendas de lana, cachemira o angora deben guardarse siempre limpias para el largo almacenaje de temporada.
                </li>
                <li>
                  <strong>❌ Usar suavizante con ropa deportiva técnica o de lana merino:</strong> El suavizante obstruye las microfibras de los tejidos técnicos impidiendo la gestión de humedad. En la merino, recubre las fibras reduciendo su capacidad antibacteriana natural. Evita el suavizante con estas prendas siempre.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-tejidos-fibras')} />
        <ShareCard appName="guia-tejidos-fibras" />
        <Footer appName="guia-tejidos-fibras" />
    </div>
  );
}
