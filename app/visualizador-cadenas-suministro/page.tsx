'use client';
// @disclaimer: exempt

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './CadenasSuministro.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

/** Una partida de la lista de materiales estimada por TechInsights (ver COSTE_MATERIALES_TOTAL). */
interface PartidaCoste {
  /** Nombre de la partida en la tabla de la fuente, traducido. */
  partida: string;
  /** Estimación de la fuente para esa partida, en dólares. */
  dolares: number;
  /** Aclaración cuando la partida no coincide exactamente con el componente del diagrama. */
  nota?: string;
}

interface ComponenteSmartphone {
  id: string;
  nombre: string;
  /** Rótulo corto del diagrama: cabe en la tarjeta a tamaño legible en móvil. */
  rotulo: string;
  /** Origen abreviado para el diagrama; el completo es `pais`. */
  origen: string;
  icono: string;
  pais: string;
  empresa: string;
  coste: PartidaCoste;
  curioso: string;
}

interface DisrupcionHistorica {
  anio: string;
  titulo: string;
  resumen: string;
  duracion: string;
  coste: string;
  industrias: string;
  leccion: string;
}

interface EstrategiaReloc {
  icono: string;
  nombre: string;
  definicion: string;
  ejemplo: string;
}

interface FilaComparativaReloc {
  aspecto: string;
  reshoring: string;
  nearshoring: string;
  friendshoring: string;
}

// ─────────────────────────────────────────────
// Datos: Componentes del smartphone
// ─────────────────────────────────────────────

/*
 * Reparto del coste: UNA sola fuente, con modelo y año, en vez de ocho horquillas sin fuente
 * que sumaban el 100 % en su punto medio (hallazgo 1534 del Inspector, 24/09/2026: la batería
 * salía como «~10–15 %» y en los desmontajes ronda el 2 %).
 *
 * Fuente: TechInsights, «Apple iPhone Xs Max Teardown» (256 GB, modelo A1921), publicado el
 * 17/09/2018 y revisado el 27/09/2018 de 443 a 453 $ por el sistema 3D Touch de la pantalla.
 * https://www.techinsights.com/blog/apple-iphone-xs-max-teardown — tabla «Estimated Costs»:
 *   Applications Processor/Modems 72,00 · Battery 9,00 · Connectivity & Sensors 18,00 ·
 *   Cameras 44,00 · Display 90,50 · Memory 64,50 · Mixed Signal/RF 23,00 ·
 *   Power Management/Audio 14,50 · Other Electronics 35,00 · Mechanicals/Housings 58,00 ·
 *   Test/Assembly/Supporting Materials 24,50 · Total 453,00 $.
 * Las ocho partidas del diagrama suman 385,50 $ (85,1 %); el resto son conectividad y sensores,
 * gestión de energía y audio y «otra electrónica». En pantalla no se nombra el modelo (la app
 * describe perfiles técnicos, no productos): «smartphone de gama alta de 256 GB, 2018».
 */
const COSTE_MATERIALES_TOTAL = 453;

const COMPONENTES: ComponenteSmartphone[] = [
  {
    id: 'pantalla',
    nombre: 'Pantalla OLED',
    rotulo: 'Pantalla OLED',
    origen: 'Corea del Sur',
    icono: '📱',
    pais: 'Corea del Sur / China',
    empresa: 'Samsung Display, BOE Technology (China), LG Display',
    coste: { partida: 'Pantalla', dolares: 90.5 },
    // Hallazgo 1533: decía «más de 800 millones de subpíxeles». Aritmética de resolución con una
    // pantalla QHD+ de gama alta (3120 × 1440, «Which Phone Has The Best Display?», samsung.com/uk):
    // 3120 × 1440 = 4.492.800 píxeles × 3 subpíxeles = 13.478.400 ≈ 13,5 millones.
    curioso:
      'Una pantalla de móvil de gama alta con resolución QHD+ (3120 × 1440 píxeles) tiene 4.492.800 píxeles: con tres subpíxeles por píxel (rojo, verde y azul), unos 13,5 millones. Samsung fabrica pantallas para Apple aunque sean competidores directos en smartphones.',
  },
  {
    id: 'procesador',
    nombre: 'Procesador (SoC)',
    rotulo: 'Procesador',
    origen: 'EEUU → Taiwán',
    icono: '⚙️',
    pais: 'Diseñado en EEUU/UK — Fabricado en Taiwán/Corea',
    empresa: 'Apple / Qualcomm (diseño) → TSMC / Samsung Foundry (fabricación)',
    coste: {
      partida: 'Procesador de aplicaciones y módems',
      dolares: 72,
      nota: 'La fuente cuenta en la misma partida el procesador y los módems.',
    },
    curioso:
      'TSMC fabrica chips para Apple, AMD, NVIDIA, Qualcomm y decenas de empresas más — aunque no diseña ninguno. Según la Semiconductor Industry Association y el Boston Consulting Group (abril de 2021), el 92 % de la capacidad mundial para fabricar los chips más avanzados (por debajo de 10 nanómetros) estaba en Taiwán, y el 8 % restante en Corea del Sur.',
  },
  {
    id: 'bateria',
    nombre: 'Batería de litio',
    rotulo: 'Batería',
    origen: 'Chile → China',
    icono: '🔋',
    pais: 'Litio de Chile/Australia — Celdas en China',
    empresa: 'CATL, BYD, LG Energy Solution, Samsung SDI',
    coste: { partida: 'Batería', dolares: 9 },
    // Hallazgo 1532: decía que el Triángulo del Litio «representa el 60 % de las reservas
    // mundiales». USGS, Mineral Commodity Summaries 2026 (litio, febrero de 2026),
    // https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-lithium.pdf — reservas: Chile 9.200.000 t,
    // Argentina 4.400.000 t, mundo 37.000.000 t → 13,6 / 37 = 36,8 % ≈ 37 %. Bolivia no figura en
    // la tabla de reservas; en «World Resources» (medidos e indicados, ~150 Mt): Argentina 28,
    // Bolivia 23, Chile 13 → 64 / 150 = 42,7 % ≈ 43 %.
    curioso:
      'Chile y Argentina, dos de los tres países del llamado Triángulo del Litio, reúnen el 37 % de las reservas mundiales: 9,2 y 4,4 de 37 millones de toneladas de litio contenido (USGS, Mineral Commodity Summaries 2026). Bolivia, el tercero, no tiene reservas declaradas, pero sí 23 millones de toneladas de recursos; contando los recursos, los tres países suman 64 de unos 150 millones de toneladas, en torno al 43 %. Sin embargo, las celdas se fabrican lejos de allí: China produjo el 80 % de las celdas de batería del mundo en 2024 (IEA, Global EV Outlook 2025).',
  },
  {
    id: 'camaras',
    nombre: 'Módulo de cámaras',
    rotulo: 'Cámaras',
    origen: 'Japón / China',
    icono: '📷',
    // Hallazgo 1728: decía «Japón / China / Suecia». Largan Precision tiene sede en Taichung
    // (Taiwán, largan.com.tw) y ningún fabricante nombrado es sueco.
    pais: 'Japón / Taiwán / China',
    empresa: 'Sony Semiconductor (sensores), Largan Precision (lentes), Sunny Optical',
    coste: { partida: 'Cámaras', dolares: 44 },
    // Hallazgo 1725: «~45 %» era la cuota de ingresos de 2021 (Strategy Analytics) en presente.
    // TechInsights, «Smartphone Image Sensor Market Share Q4 2024»: «Sony Semiconductor ranked top
    // with over 55% share».
    curioso:
      'El sensor de imagen Sony IMX es tan dominante que incluso los iPhone y Galaxy usan sensores Sony. En el 4.º trimestre de 2024, Sony Semiconductor encabezaba el mercado mundial de sensores de imagen para smartphones con más del 55 % (TechInsights).',
  },
  {
    id: 'memoria',
    nombre: 'Memoria flash (NAND)',
    rotulo: 'Memoria flash',
    origen: 'Japón / Corea',
    icono: '💾',
    pais: 'Japón / Corea del Sur / China',
    empresa: 'Kioxia (Japón), SK Hynix (Corea), Samsung, Micron (EEUU)',
    coste: {
      partida: 'Memoria',
      dolares: 64.5,
      nota: 'La fuente da una sola partida de memoria, sin separar la flash del resto.',
    },
    // Hallazgo 1726: «hasta 232 capas» era el récord de Micron (volumen desde el 26/07/2022).
    // SK hynix: 321 capas en producción en masa desde el 21/11/2024 y UFS 4.1 móvil sobre 321
    // capas anunciado el 21/05/2025 (news.skhynix.com).
    curioso:
      'La memoria flash de un smartphone apila sus células en capas verticales (3D NAND). En 2022 el récord eran 232 capas (Micron); SK hynix fabrica en serie chips de 321 capas desde noviembre de 2024 y en mayo de 2025 presentó sobre ellos su memoria para móviles UFS 4.1. En febrero de 2022, una contaminación de materiales de fabricación paró parte de la producción de las plantas que Kioxia y Western Digital comparten en Yokkaichi y Kitakami (Japón): se echaron a perder al menos 6,5 exabytes de memoria flash (Western Digital, 2022). Entre las dos empresas fabricaban cerca de un tercio de la NAND mundial (32,5 % en el 3.er trimestre de 2021, según TrendForce).',
  },
  {
    id: 'antenas',
    nombre: 'Antenas 5G',
    rotulo: 'Antenas 5G',
    // Hallazgo 1728: el país no incluía Japón con Murata (Nagaokakyo, Kioto) en la ficha. Los
    // componentes vienen de Qualcomm (EEUU) y Murata (Japón); Ericsson y Nokia aportan la
    // tecnología base (patentes y estándares), no piezas del teléfono.
    origen: 'EEUU / Japón',
    icono: '📡',
    pais: 'EEUU / Japón (componentes) — Finlandia / Suecia (tecnología base)',
    empresa: 'Qualcomm (módems), Ericsson, Nokia (tecnología base), Murata (componentes RF)',
    // TechInsights identifica el módem del modelo desmontado como un 4G LTE (XMM7560): no hay
    // partida 5G, y la de radiofrecuencia es la más cercana a las antenas.
    coste: {
      partida: 'Señal mixta y radiofrecuencia',
      dolares: 23,
      nota: 'El móvil desmontado es 4G: la partida recoge la radiofrecuencia en general, no solo las antenas, y el módem va con el procesador.',
    },
    curioso:
      'Un smartphone 5G puede contener hasta 15 antenas distintas (Wi-Fi, Bluetooth, GPS, 5G mmWave, NFC). El diseño de antenas en metales tan finos requiere simulaciones de campo electromagnético durante meses.',
  },
  {
    id: 'chasis',
    nombre: 'Chasis de aluminio',
    rotulo: 'Chasis',
    origen: 'China',
    icono: '🏗️',
    pais: 'China (fabricación) — Bauxita de Guinea/Australia',
    empresa: 'Foxconn, Pegatron, BYD Electronics (mecanizado CNC)',
    coste: { partida: 'Piezas mecánicas y carcasas', dolares: 58 },
    curioso:
      'El chasis de un iPhone requiere más de 100 operaciones de fresado CNC. El aluminio 7075 aeroespacial empleado es tan duro que las máquinas CNC desgastan sus brocas cada pocos centenares de piezas.',
  },
  {
    id: 'ensamblaje',
    nombre: 'Ensamblaje final',
    rotulo: 'Ensamblaje',
    origen: 'China / India',
    icono: '🔧',
    pais: 'China / India / Vietnam',
    empresa: 'Foxconn (Hon Hai), Pegatron, Wingtech — plantas en Zhengzhou, Chennai, Hanói',
    coste: { partida: 'Pruebas, ensamblaje y materiales auxiliares', dolares: 24.5 },
    curioso:
      'En los picos de producción, la fábrica de Foxconn en Zhengzhou («iPhone City») llegaba a reunir a unas 350.000 personas y podía fabricar 500.000 iPhones al día (The New York Times, diciembre de 2016). A pesar de la complejidad del producto, en la estimación de TechInsights (2018) las pruebas, el ensamblaje y los materiales auxiliares suman solo el 5,4 % del coste de materiales.',
  },
];

/** Peso de una partida en la lista de materiales, en %. */
const pesoCoste = (c: PartidaCoste): number => (c.dolares / COSTE_MATERIALES_TOTAL) * 100;

// ─────────────────────────────────────────────
// Geometría del diagrama
// ─────────────────────────────────────────────

/*
 * Hallazgo 1531: con un viewBox de 540 unidades y rótulos de 7,5–8,5, a 375 px de ancho los
 * nombres se pintaban a 4,6 px (y a 6,8 px en escritorio), y tres se cortaban con «…». Ahora el
 * diagrama es de dos columnas en un viewBox de 320 unidades, casi 1:1 con el ancho de un móvil
 * (≈ 309 px a 375 px de pantalla), y los rótulos son de 14 y 13 unidades: ≥ 12,5 px en móvil y
 * ≈ 17 px en escritorio. Los rótulos son cortos (`rotulo`, `origen`) para caber sin recortes.
 */
const VB_ANCHO = 320;
const VB_ALTO = 410;
const TARJETA_ANCHO = 146;
const TARJETA_ALTO = 64;
const COLUMNAS_X = [6, 168];
const FILA_Y0 = 122;
const FILA_PASO = 72;
const EJE_X = VB_ANCHO / 2;
const HUB = { x: 112, y: 38, ancho: 96, alto: 70 };

const posicion = (i: number): { x: number; y: number } => ({
  x: COLUMNAS_X[i % 2],
  y: FILA_Y0 + Math.floor(i / 2) * FILA_PASO,
});

// ─────────────────────────────────────────────
// Datos: Disrupciones históricas
// ─────────────────────────────────────────────

const DISRUPCIONES: DisrupcionHistorica[] = [
  {
    anio: '2020–2022',
    titulo: 'Crisis global de semiconductores',
    resumen: 'La pandemia disparó la demanda de electrónicos mientras cerraban las fábricas. La industria automovilística, que había cancelado pedidos de chips en 2020, no pudo recuperar su lugar en la cola de producción.',
    duracion: '~2,5 años',
    coste: '210.000 millones de $ de ingresos perdidos por la industria del automóvil solo en 2021 (AlixPartners, septiembre de 2021)',
    industrias: 'Automoción, electrónica de consumo, electrodomésticos, defensa',
    // Hallazgo 1536: decía «subsidios billonarios», calco de «billion» (en español un billón son
    // 10^12). Cifras de la fuente oficial: «The CHIPS and Science Act provides $52.7 billion for
    // American semiconductor research, development, manufacturing, and workforce development»
    // (Casa Blanca, hoja informativa del 09/08/2022); la Ley Europea de Chips «will mobilise more
    // than €43 billion euros of public and private investments» (Comisión Europea, IP/22/729,
    // 08/02/2022) y entró en vigor el 21/09/2023 (IP/23/4518).
    leccion:
      'La filosofía just-in-time sin inventario mínimo de componentes estratégicos puede paralizar industrias enteras. Para relocalizar fabricación, Estados Unidos aprobó en 2022 la CHIPS and Science Act, con 52.700 millones de $ para investigación, fabricación y formación en semiconductores (Casa Blanca, agosto de 2022), y la Unión Europea, la Ley Europea de Chips (European Chips Act), en vigor desde el 21/09/2023, con la que la Comisión Europea prevé movilizar más de 43.000 millones de € de inversión pública y privada.',
  },
  {
    anio: 'Marzo 2021',
    titulo: 'Bloqueo del Canal de Suez (Ever Given)',
    resumen: 'El portacontenedores Ever Given (400 m de eslora) encalló y cortó durante 6 días el Canal de Suez, por el que pasa en torno al 12\u00A0% del comercio mundial (Ministerio de Asuntos Exteriores y Comercio de Nueva Zelanda, abril de 2021).',
    duracion: '6 días',
    coste: '9.600 millones de $ en mercancías retenidas cada día (Lloyd’s List, marzo de 2021)',
    industrias: 'Petróleo, electrónica, textil, alimentación, automóvil',
    leccion:
      'Una única vía marítima concentra un porcentaje enorme del comercio global. El incidente aceleró el debate sobre la resiliencia de las rutas de transporte y la diversificación de proveedores logísticos.',
  },
  {
    anio: '2.º trimestre de 2020',
    titulo: 'COVID-19: cierre de fábricas en Asia',
    resumen: 'Los cierres de Wuhan y la región del Delta del Río Perla interrumpieron la producción de electrónica, textil y componentes para todo el mundo en el segundo trimestre de 2020.',
    duracion: '~3–4 meses (cierre masivo)',
    coste: '−14,3\u00A0% en el volumen del comercio mundial de mercancías respecto al trimestre anterior, la mayor caída registrada (OMC, octubre de 2020)',
    industrias: 'Toda la manufactura: textil, electrónica, farmacéutica, alimentación',
    leccion:
      'La hiperdependencia de una única región para manufactura expone a la economía global a riesgos sistémicos. La pandemia fue el detonante que puso la resiliencia de cadenas de suministro en la agenda política de todos los gobiernos.',
  },
  {
    anio: 'Octubre 2011',
    titulo: 'Inundaciones en Tailandia',
    resumen: 'Las peores inundaciones en décadas anegaron la región de Ayutthaya, donde se concentraba gran parte de la producción mundial de discos duros (HDD).',
    duracion: '~4 meses',
    coste: '46.500 millones de $ en daños y pérdidas, el 12,6\u00A0% del PIB tailandés (Banco Mundial, 2012)',
    industrias: 'Almacenamiento de datos, electrónica personal, servidores',
    leccion:
      'Tailandia montaba en torno al 40\u00A0% de los discos duros del mundo (IHS iSuppli, 2011). La concentración geográfica extrema de un componente convierte un desastre natural local en una crisis tecnológica global: el precio de los discos duros se disparó y un año después aún no había vuelto al nivel previo a la inundación (IEEE Spectrum, 2012).',
  },
  {
    anio: 'Marzo 2011',
    titulo: 'Terremoto y tsunami de Japón (Tōhoku)',
    resumen: 'El terremoto de magnitud 9,0 y el tsunami subsiguiente destruyeron instalaciones industriales clave en el norte de Japón, interrumpiendo el suministro de más de 500 componentes para la industria automovilística global.',
    duracion: '~6 meses para recuperación parcial',
    coste: '16,9 billones de yenes en daños directos, unos 210.000 millones de $ al cambio de entonces (Oficina del Gabinete de Japón, junio de 2011)',
    industrias: 'Automoción, electrónica, semiconductores especializados (Renesas)',
    leccion:
      'Japón era proveedor único (single-source) de ciertos pigmentos, resinas y chips de microcontrolador para toda la industria auto global. El concepto de "single-source risk" pasó a ser central en la gestión de cadenas de suministro.',
  },
];

// ─────────────────────────────────────────────
// Datos: Estrategias de relocalización
// ─────────────────────────────────────────────

const ESTRATEGIAS: EstrategiaReloc[] = [
  {
    icono: '🏠',
    nombre: 'Reshoring',
    definicion:
      'Repatriación de la producción al país de origen. La empresa trae de vuelta fábricas que había deslocalizado décadas atrás, motivada por costes logísticos, riesgo geopolítico o incentivos gubernamentales.',
    ejemplo:
      'Intel anunció en enero de 2022 dos fábricas de chips en Ohio (EEUU) con una inversión inicial de más de 20.000 millones de $ (Intel, 2022); la obra se ha retrasado varias veces. Apple trasladó líneas de ensamblaje de Mac Pro a Texas.',
  },
  {
    icono: '🌍',
    nombre: 'Nearshoring',
    definicion:
      'Producción en países geográficamente cercanos, no necesariamente aliados. Reduce tiempos y costes logísticos respecto a Asia, manteniendo costes laborales bajos.',
    ejemplo:
      'Empresas estadounidenses trasladan producción de China a México (nearshoring en el marco del T-MEC). Europeas trasladan a Marruecos, Turquía o Polonia.',
  },
  {
    icono: '🤝',
    nombre: 'Friendshoring',
    definicion:
      'Producción en países con alineación geopolítica y valores democráticos compartidos. Reduce riesgo de sanciones, confiscaciones o interrupciones por tensiones diplomáticas.',
    ejemplo:
      'TSMC construye plantas en Arizona (EEUU) y Japón (con subsidios gubernamentales). Samsung anuncia gigafábrica en Taylor (Texas). La UE prioriza proveedores de países aliados en semiconductores.',
  },
];

const COMPARATIVA_RELOC: FilaComparativaReloc[] = [
  {
    aspecto: 'Coste laboral',
    reshoring: 'Alto (igual al país de origen)',
    nearshoring: 'Medio-bajo',
    friendshoring: 'Variable (puede ser alto en EEUU)',
  },
  {
    aspecto: 'Riesgo geopolítico',
    reshoring: 'Muy bajo',
    nearshoring: 'Bajo-medio',
    friendshoring: 'Bajo (aliados)',
  },
  {
    aspecto: 'Tiempo de tránsito',
    reshoring: 'Mínimo (local)',
    nearshoring: 'Días (no semanas)',
    friendshoring: 'Variable',
  },
  {
    aspecto: 'Eficiencia de costes',
    reshoring: 'Baja vs. Asia',
    nearshoring: 'Media',
    friendshoring: 'Media-baja',
  },
  {
    aspecto: 'Facilidad de implementación',
    reshoring: 'Difícil (reconstruir ecosistema)',
    nearshoring: 'Media',
    friendshoring: 'Media (requiere inversión)',
  },
  {
    aspecto: 'Principales impulsores',
    reshoring: 'CHIPS Act, subsidios industriales, seguridad nacional',
    nearshoring: 'Costes logísticos, agilidad, T-MEC/UE',
    friendshoring: 'Geopolítica, sanciones, fiabilidad del proveedor',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCadenasSuministro() {
  const [componenteActivo, setComponenteActivo] = useState<string | null>(null);
  const [disrupcionActiva, setDisrupcionActiva] = useState<number | null>(null);
  const [nivelDisrupcion, setNivelDisrupcion] = useState<number>(0);

  const componente = COMPONENTES.find((c) => c.id === componenteActivo) ?? null;

  const getJitEstado = (): string => {
    if (nivelDisrupcion < 20) return 'Sistema funcionando con normalidad';
    if (nivelDisrupcion < 50) return 'Tensión inicial — leve escasez de piezas';
    if (nivelDisrupcion < 75) return 'Crisis moderada — paradas de producción';
    return 'Colapso total — líneas paradas semanas';
  };

  const getJicEstado = (): string => {
    if (nivelDisrupcion < 20) return 'Stock de seguridad intacto — sin impacto';
    if (nivelDisrupcion < 50) return 'Buffer absorbe la tensión — producción normal';
    if (nivelDisrupcion < 75) return 'Stocks al 40\u00A0% — producción sostenida aún';
    return 'Reservas agotadas — impacto significativo';
  };

  const isJitCrisis = nivelDisrupcion >= 50;
  const isJicCrisis = nivelDisrupcion >= 75;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcono} aria-hidden="true">🌐</span>
        <h1>Cadenas de Suministro Globales</h1>
        <p>
          Cómo se fabrican y distribuyen los productos en la economía moderna — el viaje
          de un smartphone, disrupciones históricas y las nuevas estrategias de relocalización.
        </p>
      </header>

      <LegalNotice />

      {/* ─── El viaje de un smartphone ─────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>El viaje de un smartphone</h2>
        <p className={styles.subtituloSeccion}>
          Pulsa cada componente para descubrir su país de origen, empresa fabricante y dato curioso
        </p>

        <div className={styles.smartphoneGrid}>
          {/* SVG con los componentes clicables */}
          <div className={styles.svgContainer}>
            <svg
              viewBox={`0 0 ${VB_ANCHO} ${VB_ALTO}`}
              className={styles.svgDiagrama}
              aria-label="Diagrama interactivo de componentes de un smartphone con 8 componentes clicables"
              role="group"
            >
              <defs>
                <linearGradient id="gradFondo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={styles.fondoInicio} />
                  <stop offset="100%" className={styles.fondoFin} />
                </linearGradient>
                <linearGradient id="gradComp" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={styles.compInicio} />
                  <stop offset="100%" className={styles.compFin} />
                </linearGradient>
                <linearGradient id="gradCompActivo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={styles.compActivoInicio} />
                  <stop offset="100%" className={styles.compActivoFin} />
                </linearGradient>
              </defs>

              {/* Fondo */}
              <rect x="0" y="0" width={VB_ANCHO} height={VB_ALTO} rx="14" fill="url(#gradFondo)" />

              {/* Título del diagrama */}
              <text x={EJE_X} y="24" textAnchor="middle" fontSize="13" fontWeight="700" className={styles.svgTitulo}>
                Componentes globales de un smartphone
              </text>

              {/* Conexiones: un eje vertical desde el smartphone y un tramo hasta cada tarjeta */}
              <line
                className={styles.svgLinea}
                x1={EJE_X}
                y1={HUB.y + HUB.alto}
                x2={EJE_X}
                y2={posicion(COMPONENTES.length - 1).y + TARJETA_ALTO / 2}
              />
              {COMPONENTES.map((comp, i) => {
                const { x, y } = posicion(i);
                const borde = i % 2 === 0 ? x + TARJETA_ANCHO : x;
                return (
                  <line
                    key={`linea-${comp.id}`}
                    className={styles.svgLinea}
                    x1={borde}
                    y1={y + TARJETA_ALTO / 2}
                    x2={EJE_X}
                    y2={y + TARJETA_ALTO / 2}
                  />
                );
              })}

              {/* Smartphone central */}
              <rect
                className={styles.svgHub}
                x={HUB.x}
                y={HUB.y}
                width={HUB.ancho}
                height={HUB.alto}
                rx="12"
              />
              <text x={EJE_X} y={HUB.y + 26} textAnchor="middle" fontSize="20" aria-hidden="true">📱</text>
              <text x={EJE_X} y={HUB.y + 46} textAnchor="middle" fontSize="13" fontWeight="700" className={styles.svgTextoCentro}>
                ~40 países
              </text>
              <text x={EJE_X} y={HUB.y + 62} textAnchor="middle" fontSize="13" className={styles.svgTextoCentro}>
                involucrados
              </text>

              {/* Botones de componentes */}
              {COMPONENTES.map((comp, i) => {
                const { x, y } = posicion(i);
                const centro = x + TARJETA_ANCHO / 2;
                const isActivo = componenteActivo === comp.id;
                const alternar = () => setComponenteActivo(isActivo ? null : comp.id);
                return (
                  // Un <g> del SVG no es un <button>: el foco (tabIndex) y Enter/Espacio se dan
                  // a mano para que el teclado llegue a la ficha de cada componente.
                  <g
                    key={comp.id}
                    onClick={alternar}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        alternar();
                      }
                    }}
                    tabIndex={0}
                    className={styles.componenteBoton}
                    role="button"
                    aria-label={`Ver detalles de ${comp.nombre}`}
                    aria-pressed={isActivo}
                  >
                    <rect
                      className={styles.componenteRect}
                      x={x}
                      y={y}
                      width={TARJETA_ANCHO}
                      height={TARJETA_ALTO}
                      rx="8"
                      fill={isActivo ? 'url(#gradCompActivo)' : 'url(#gradComp)'}
                    />
                    <text x={centro} y={y + 23} textAnchor="middle" fontSize="18" fill="white">
                      {comp.icono}
                    </text>
                    <text x={centro} y={y + 42} textAnchor="middle" fontSize="14" fontWeight="700" fill="white">
                      {comp.rotulo}
                    </text>
                    <text x={centro} y={y + 57} textAnchor="middle" fontSize="13" fill="white">
                      {comp.origen}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Panel de detalle del componente */}
          <div className={styles.panelDetalle}>
            {componente ? (
              <>
                <div className={styles.componenteHeader}>
                  <span className={styles.componenteIcono} aria-hidden="true">{componente.icono}</span>
                  <h3 className={styles.componenteNombre}>{componente.nombre}</h3>
                </div>
                <p className={styles.componentePais}>
                  <strong>País de origen:</strong> {componente.pais}
                </p>
                <div className={styles.componenteEmpresa}>
                  <strong>Fabricantes principales:</strong> {componente.empresa}
                </div>
                <div className={styles.componenteCoste}>
                  <span className={styles.costeLabel}>Peso en el coste de materiales:</span>
                  <span className={styles.costeBadge}>
                    {formatNumber(pesoCoste(componente.coste), 1)}&nbsp;%
                  </span>
                </div>
                <p className={styles.costeFuente}>
                  Partida «{componente.coste.partida}»: {formatNumber(componente.coste.dolares, 2)}&nbsp;$
                  de {formatNumber(COSTE_MATERIALES_TOTAL, 2)}&nbsp;$ en la estimación de TechInsights
                  para un smartphone de gama alta de 256&nbsp;GB (septiembre de 2018). Es el coste de
                  las piezas, no el precio de venta.
                  {componente.coste.nota && <> {componente.coste.nota}</>}
                </p>
                <div className={styles.componenteCurioso}>
                  <strong>Dato curioso:</strong> {componente.curioso}
                </div>
              </>
            ) : (
              <div className={styles.panelVacio}>
                <span className={styles.panelVacioIcono} aria-hidden="true">👆</span>
                <p>Pulsa cualquier componente del diagrama para ver su país de origen, empresa fabricante y datos curiosos</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.contadorPaises}>
          Un smartphone moderno pasa por <strong>~40 países</strong> antes de llegar a tus manos —
          desde la minería de materias primas hasta el ensamblaje final y la distribución.
        </div>
      </section>

      {/* ─── JIT vs JIC ──────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Just-in-time vs. Just-in-case</h2>
        <p className={styles.subtituloSeccion}>
          Mueve el slider para simular una disrupción y ver cómo reacciona cada modelo de inventario
        </p>

        <div className={styles.jitWrapper}>
          <div className={styles.sliderContainer}>
            <div className={styles.sliderLabel}>
              <span>Nivel de disrupción en la cadena de suministro</span>
              <span className={styles.sliderValor}>{nivelDisrupcion}&nbsp;%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={nivelDisrupcion}
              onChange={(e) => setNivelDisrupcion(Number(e.target.value))}
              className={styles.sliderInput}
              aria-label="Nivel de disrupción de la cadena de suministro"
            />
          </div>

          <div className={styles.comparativaJit}>
            {/* JIT */}
            <div className={styles.jitCard}>
              <div className={styles.jitCardHeader}>
                <span className={styles.jitIcono} aria-hidden="true">⚡</span>
                <div>
                  <h3 className={styles.jitNombre}>Just-in-Time (JIT)</h3>
                  <p className={styles.jitSubnombre}>Sistema de Producción Toyota, década de 1950</p>
                </div>
              </div>
              <div className={`${styles.jitEstado} ${isJitCrisis ? styles.jitEstadoCrisis : styles.jitEstadoOk}`}>
                {getJitEstado()}
              </div>
              <p className={styles.jitPropiedad}>
                <strong>Inventario:</strong> Mínimo o nulo — los componentes llegan exactamente cuando se necesitan
              </p>
              <p className={styles.jitPropiedad}>
                <strong>Eficiencia:</strong> Máxima — capital no inmovilizado en stock
              </p>
              <p className={styles.jitPropiedad}>
                <strong>Resiliencia:</strong> Baja — cualquier interrupción para la producción en horas
              </p>
              <p className={styles.jitPropiedad}>
                <strong>Coste:</strong> Bajo en condiciones normales
              </p>
            </div>

            {/* JIC */}
            <div className={styles.jitCard}>
              <div className={styles.jitCardHeader}>
                <span className={styles.jitIcono} aria-hidden="true">🛡️</span>
                <div>
                  <h3 className={styles.jitNombre}>Just-in-Case (JIC)</h3>
                  <p className={styles.jitSubnombre}>Modelo tradicional con buffers</p>
                </div>
              </div>
              <div className={`${styles.jitEstado} ${isJicCrisis ? styles.jitEstadoCrisis : styles.jitEstadoOk}`}>
                {getJicEstado()}
              </div>
              <p className={styles.jitPropiedad}>
                <strong>Inventario:</strong> Alto — stocks de seguridad para semanas o meses
              </p>
              <p className={styles.jitPropiedad}>
                <strong>Eficiencia:</strong> Menor — capital inmovilizado en almacenes
              </p>
              <p className={styles.jitPropiedad}>
                <strong>Resiliencia:</strong> Alta — los buffers absorben las disrupciones
              </p>
              <p className={styles.jitPropiedad}>
                <strong>Coste:</strong> Mayor (almacenamiento, capital inmovilizado)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Timeline de disrupciones ──────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Grandes disrupciones históricas</h2>
        <p className={styles.subtituloSeccion}>
          Pulsa cada evento para ver el impacto económico, industrias afectadas y lección aprendida
        </p>

        <div className={styles.timeline} role="list">
          {DISRUPCIONES.map((d, i) => {
            const isActiva = disrupcionActiva === i;
            const idDetalle = `disrupcion-detalle-${i}`;
            return (
              <div key={i} className={styles.timelineItem} role="listitem">
                <div className={styles.timelinePunto} aria-hidden="true" />
                <div className={`${styles.timelineCard} ${isActiva ? styles.timelineCardActiva : ''}`}>
                  <p className={styles.timelineAnio}>{d.anio}</p>
                  {/* El botón (aria-expanded) vive en el título; su ::after se estira sobre
                      toda la tarjeta para que el clic en cualquier punto siga desplegándola. */}
                  <h3 className={styles.timelineTitulo}>
                    <button
                      type="button"
                      className={styles.timelineBoton}
                      aria-expanded={isActiva}
                      aria-controls={isActiva ? idDetalle : undefined}
                      onClick={() => setDisrupcionActiva(isActiva ? null : i)}
                    >
                      {d.titulo}
                    </button>
                  </h3>
                  <p className={styles.timelineResumen}>{d.resumen}</p>

                  {isActiva && (
                    <div className={styles.timelineDetalle} id={idDetalle}>
                      <div className={styles.timelineStats}>
                        <div className={styles.timelineStat}>
                          <span className={styles.timelineStatNum}>{d.duracion}</span>
                          <span className={styles.timelineStatLabel}>Duración</span>
                        </div>
                        <div className={styles.timelineStat}>
                          <span className={styles.timelineStatNum} style={{ fontSize: '0.8rem' }}>{d.coste}</span>
                          <span className={styles.timelineStatLabel}>Impacto económico</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        <strong>Industrias afectadas:</strong> {d.industrias}
                      </p>
                      <div className={styles.timelineLeccion}>
                        <strong>Lección aprendida:</strong> {d.leccion}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Reshoring, nearshoring, friendshoring ────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Reshoring, nearshoring y friendshoring</h2>
        <p className={styles.subtituloSeccion}>
          Las tres estrategias que están redibujando el mapa de la manufactura global tras la pandemia
        </p>

        <div className={styles.reshoringGrid}>
          {ESTRATEGIAS.map((e, i) => (
            <div key={i} className={styles.reshoringCard}>
              <span className={styles.reshoringIcono} aria-hidden="true">{e.icono}</span>
              <h3 className={styles.reshoringNombre}>{e.nombre}</h3>
              <p className={styles.reshoringDef}>{e.definicion}</p>
              <div className={styles.reshoringEjemplo}>
                <strong>Ejemplos reales:</strong> {e.ejemplo}
              </div>
            </div>
          ))}
        </div>

        {/* Tabla comparativa */}
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>Reshoring</th>
                <th>Nearshoring</th>
                <th>Friendshoring</th>
              </tr>
            </thead>
            <tbody>
              {COMPARATIVA_RELOC.map((fila, i) => (
                <tr key={i}>
                  <td className={styles.celdaAspecto}>{fila.aspecto}</td>
                  <td>{fila.reshoring}</td>
                  <td>{fila.nearshoring}</td>
                  <td>{fila.friendshoring}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.tendencia}>
          <strong>Tendencia desde 2020:</strong> En la encuesta de McKinsey a 113 responsables de
          cadenas de suministro (primavera de 2022), el 81&nbsp;% decía haber recurrido a un
          segundo proveedor en el último año y el 44&nbsp;% estar regionalizando su red de
          suministro. El McKinsey Global Institute estimó en 2020 que entre el 16&nbsp;% y el
          26&nbsp;% de las exportaciones mundiales de bienes podrían cambiar de país en cinco
          años: una estimación de lo que está en juego, no una previsión de que vaya a ocurrir.
        </div>
      </section>

      {/* ─── Sección educativa v2.0 ──────────────────── */}
      <EducationalSection
        title="Cadenas de Suministro Globales: Cómo Llega Todo hasta Ti"
        subtitle="Just-in-time, disrupciones y relocalización — la logística que mueve la economía"
      >
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h4>¿Qué es una cadena de suministro (SCM)?</h4>
            <p>
              La gestión de la cadena de suministro (Supply Chain Management) coordina el flujo de
              materias primas, componentes, productos semielaborados y terminados desde el origen
              hasta el consumidor final. Incluye proveedores, fabricantes, distribuidores, minoristas
              y el transporte que los conecta.
            </p>
            <p>
              Una cadena de suministro moderna no es lineal sino una red compleja de nodos
              interdependientes. Apple, por ejemplo, declara que su cadena de suministro reúne
              miles de instalaciones de proveedores en más de 60&nbsp;países (apple.com/supply-chain).
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>La revolución del contenedor (Malcom McLean, 1956)</h4>
            <p>
              En 1956, el camionero Malcom McLean tuvo la idea de colocar camiones enteros sobre
              barcos. El contenedor estandarizado de acero (TEU: Twenty-foot Equivalent Unit) redujo
              el coste de carga de 5,83 $ por tonelada (carga suelta, 1956) a unos 0,16 $ por tonelada
              en el primer viaje del Ideal-X — una reducción del 97&nbsp;% (cifras recogidas por Marc
              Levinson en «The Box», 2006).
            </p>
            <p>
              Esta innovación hizo económicamente viable la fabricación en Asia para vender en Europa
              y América, y es el fundamento material de la globalización tal como la conocemos. Sin
              el contenedor, las cadenas de suministro globales actuales serían imposibles.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>La trampa de la eficiencia extrema</h4>
            <p>
              Durante décadas, el mantra fue "lean and mean": eliminar todo desperdicio, reducir
              inventarios al mínimo y concentrar producción donde sea más eficiente (generalmente
              China). El resultado fue cadenas de suministro hiperoptimizadas pero extraordinariamente
              frágiles.
            </p>
            <p>
              La crisis del COVID-19 expuso esta fragilidad: cuando las fábricas cerraron, los buffers
              de inventario se agotaron en días, y el tiempo de reacción para diversificar proveedores
              era de meses o años. La eficiencia extrema y la resiliencia son, en gran medida,
              objetivos en tensión.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>El efecto látigo (Bullwhip Effect)</h4>
            <p>
              Una pequeña variación en la demanda del consumidor final puede amplificarse
              progresivamente hacia atrás en la cadena, provocando grandes oscilaciones en los
              pedidos a proveedores. Si los supermercados incrementan sus pedidos un 5&nbsp;% ante
              señales de escasez, el mayorista hace pedidos de un 10&nbsp;% más, el fabricante de un 20&nbsp;%
              más, y el proveedor de materias primas puede ver pedidos con un 40&nbsp;% de incremento.
            </p>
            {/* Hallazgo 1535: decía «El término fue acuñado por Jay Forrester (MIT, 1961)». Forrester
                describió la amplificación (Harvard Business Review, julio-agosto de 1958), pero el
                nombre, según Lee, Padmanabhan y Whang (MIT Sloan Management Review, 15/04/1997),
                es de P&G: «P&G called this phenomenon the "bullwhip" effect». */}
            <p>
              Jay Forrester (MIT) ya describió esta amplificación en 1958, en la Harvard Business
              Review. El nombre vino después: según Hau Lee, V. Padmanabhan y Seungjin Whang (MIT
              Sloan Management Review, 1997), que lo popularizaron, fueron los responsables de
              logística de Procter &amp; Gamble quienes, al estudiar los pedidos de uno de sus
              pañales más vendidos, llamaron a este fenómeno «efecto látigo» (bullwhip). La
              solución es la visibilidad en tiempo real de la demanda en todos los eslabones y la
              reducción de lead times, algo que la digitalización e IoT están facilitando.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Digitalización y trazabilidad: blockchain e IoT</h4>
            <p>
              Las tecnologías emergentes están transformando la visibilidad de las cadenas de
              suministro. Los sensores IoT (temperatura, humedad, localización GPS) permiten
              monitorizar cada palé en tiempo real. El blockchain ofrece un registro inmutable y
              compartido de cada transacción, transferencia y transformación de un producto.
            </p>
            <p>
              En una prueba de 2016-2017 con IBM, Walmart rastreó un envase de mangos cortados
              desde la tienda hasta la granja en 2,2 segundos, frente a casi 7 días por el método
              tradicional (Frank Yiannas, Walmart, 2018). Tras el brote de E. coli de 2018 ligado a
              la lechuga romana, Walmart exigió a sus proveedores de hoja verde sumarse a esa red,
              IBM Food Trust (carta a proveedores del 24/09/2018). No todo cuajó: Maersk e IBM
              cerraron en 2023 TradeLens, su plataforma para el transporte marítimo, por falta de
              adopción del sector. En la UE, el Reglamento (UE) 2023/1542 exige desde el 18/02/2027
              un pasaporte digital para las baterías de vehículos eléctricos, de movilidad ligera e
              industriales de más de 2 kWh, con datos de origen de sus materias primas.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>El futuro: cadenas más cortas y resilientes</h4>
            <p>
              La tendencia post-pandemia apunta hacia cadenas de suministro regionales, con más
              inventarios estratégicos de componentes críticos y mayor diversificación de proveedores.
              Los términos "China+1" y "China+2" describen estrategias de empresas que mantienen
              China como base pero añaden un segundo país (Vietnam, India, México) como alternativa.
            </p>
            <p>
              La automatización y la robótica están reduciendo la ventaja de coste laboral de los
              países emergentes, haciendo que la manufactura cercana al consumidor sea más viable.
              La fabricación aditiva (impresión 3D) puede descentralizar parte de la producción
              hacia el punto de uso, eliminando eslabones enteros de la cadena.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          Las cifras de disrupciones y costes son estimaciones de consultoras e institutos sectoriales
          con distintas metodologías. Los datos de localización de fabricación cambian constantemente —
          los porcentajes mostrados corresponden a períodos específicos citados.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-cadenas-suministro')} />
      <ShareCard appName="visualizador-cadenas-suministro" />
      <Footer appName="visualizador-cadenas-suministro" />
    </div>
  );
}
