'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaEnergia.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Categoria = 'biomasa' | 'renovable_antigua' | 'carbon' | 'petroleo' | 'nuclear' | 'gas' | 'renovable_nueva' | 'transicion' | 'futuro';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoEnergia {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  fuente: string;
  inventores: string[];
  hitos: string[];
  obra: string;
  pregunta: string;
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
}

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

// ─────────────────────────────────────────────
// Helper para años negativos (a.C.)
// ─────────────────────────────────────────────

function formatAnio(anio: number): string {
  return anio < 0 ? `${Math.abs(anio)} a.C.` : String(anio);
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const AÑO_MIN = -15000;
const AÑO_MAX = 2025;

const PERIODOS: PeriodoEnergia[] = [
  {
    id: 'prehistoria',
    nombre: 'Energía Prehistórica',
    anioInicio: -15000,
    anioFin: -3000,
    categoria: 'biomasa',
    fuente: 'Fuego y biomasa',
    inventores: ['Homo sapiens (fuego controlado)', 'Primeras culturas agrarias'],
    hitos: [
      'Dominio del fuego (~1M años)',
      'Leña como combustible universal',
      'Tracción animal (bueyes)',
      'Velas de sebo',
      'Rueda de agua primitiva',
    ],
    obra: 'El fuego doméstico neolítico (hogar como centro social)',
    pregunta: '¿Cómo el dominio del fuego transformó la civilización humana?',
    contexto: 'El fuego fue la primera tecnología energética de la humanidad. Permitió cocinar, calentarse, fabricar cerámica y trabajar metales. Las civilizaciones antiguas dependían enteramente de biomasa: madera, paja y tracción animal.',
    color: '#8B4513',
  },
  {
    id: 'antiguedad',
    nombre: 'Energías de la Antigüedad',
    anioInicio: -3000,
    anioFin: 500,
    categoria: 'renovable_antigua',
    fuente: 'Viento, agua y tracción animal',
    inventores: ['Griegos (molino de viento)', 'Romanos (acueductos)', 'Egipcios (vela naval)'],
    hitos: [
      'Vela de barco (Egipto -3000)',
      'Noria hidráulica romana',
      'Molino de viento persa (-500)',
      'Acueductos (fuerza hidráulica)',
      'Tracción con caballos y bueyes',
    ],
    obra: 'El acueducto romano de Segovia — ingeniería hidráulica sin bombas',
    pregunta: '¿Cómo aprovecharon las civilizaciones antiguas la naturaleza como fuente de energía?',
    contexto: 'Las civilizaciones antiguas dominaron la energía renovable siglos antes del término. Los egipcios navegaban a vela por el Nilo. Los romanos construyeron acueductos para mover agua y mover maquinaria. Los griegos y persas desarrollaron molinos de viento para moler grano.',
    color: '#2E8B57',
  },
  {
    id: 'medieval',
    nombre: 'Era Medieval y Molinos',
    anioInicio: 500,
    anioFin: 1700,
    categoria: 'renovable_antigua',
    fuente: 'Molinos de viento y agua',
    inventores: ['Molineros medievales europeos', 'Ingenieros hidráulicos'],
    hitos: [
      'Molinos de viento en Europa (1100)',
      'Rueda hidráulica vertical',
      'Forjas con martillos hidráulicos',
      'Minas de carbón rudimentarias (siglo XIII)',
      'Energía para textiles y herrería',
    ],
    obra: 'Los molinos de viento de La Mancha — símbolo de la era preindustrial',
    pregunta: '¿Qué papel jugó la energía hidráulica en el desarrollo económico medieval?',
    contexto: 'La Edad Media europea transformó la energía hidráulica en motor económico. Los molinos procesaban grano, aserraderos y forjas. En 1086, el Domesday Book registraba 5.600 molinos de agua en Inglaterra. El carbón comenzó a usarse en hogueras pero aún no era energía industrial.',
    color: '#8FBC8F',
  },
  {
    id: 'carbon',
    nombre: 'Revolución del Carbón',
    anioInicio: 1700,
    anioFin: 1870,
    categoria: 'carbon',
    fuente: 'Carbón mineral',
    inventores: ['James Watt', 'Thomas Newcomen', 'George Stephenson'],
    hitos: [
      'Máquina de vapor de Newcomen (1712)',
      'Máquina de vapor mejorada de Watt (1769)',
      'Primera locomotora de Stephenson (1814)',
      'Bombas de agua para minas',
      'Industrialización de textiles y fundición',
    ],
    obra: 'La máquina de vapor de James Watt (1769) — inicio de la Primera Revolución Industrial',
    pregunta: '¿Cómo el carbón transformó la economía mundial y creó el mundo industrial?',
    contexto: 'El carbón desbloqueó energía almacenada durante millones de años. La máquina de vapor permitió mecanizar fábricas, tender ferrocarriles y bombear minas más profundas. Londres se convirtió en la ciudad más industrializada del mundo. Las emisiones de CO₂ comenzaron su ascenso histórico en 1760.',
    color: '#2F2F2F',
  },
  {
    id: 'petroleo_nacimiento',
    nombre: 'Nacimiento del Petróleo',
    anioInicio: 1859,
    anioFin: 1920,
    categoria: 'petroleo',
    fuente: 'Petróleo crudo',
    inventores: ['Edwin Drake', 'John D. Rockefeller', 'Carl Benz', 'Henry Ford'],
    hitos: [
      'Primer pozo de petróleo (Drake, 1859)',
      'Keroseno para iluminación',
      'Motor de combustión interna (1876)',
      'Primer automóvil de gasolina (Benz, 1885)',
      'Ford Model T (1908)',
    ],
    obra: 'El pozo de Edwin Drake en Titusville, Pennsylvania (1859) — inicio de la era del petróleo',
    pregunta: '¿Cómo el petróleo y el automóvil redefinieron la movilidad y el poder global?',
    contexto: 'El primer pozo comercial de Drake abrió la era del petróleo en 1859. Rockefeller monopolizó la industria con Standard Oil. El automóvil de Benz y el Model T de Ford transformaron la movilidad. La iluminación de keroseno reemplazó las velas. El petróleo se convirtió en geopolítica.',
    color: '#1C1C1C',
  },
  {
    id: 'electrificacion',
    nombre: 'Era de la Electricidad',
    anioInicio: 1870,
    anioFin: 1940,
    categoria: 'renovable_antigua',
    fuente: 'Electricidad (carbón + agua)',
    inventores: ['Thomas Edison', 'Nikola Tesla', 'George Westinghouse'],
    hitos: [
      'Primera central eléctrica (Edison, 1882)',
      'Corriente alterna de Tesla (1888)',
      'Primera presa hidroeléctrica (Niagara, 1895)',
      'Red eléctrica urbana',
      'Bombilla y motor eléctrico',
    ],
    obra: 'La central de Pearl Street de Edison (1882) — primera red eléctrica comercial',
    pregunta: '¿Cómo la electricidad cambió la vida cotidiana e industrial del siglo XX?',
    contexto: 'Edison inauguró la primera central eléctrica en Nueva York en 1882. La guerra entre corriente continua (Edison) y alterna (Tesla/Westinghouse) la ganó Tesla: la corriente alterna viaja distancias largas. La presa de Niagara en 1895 demostró que el agua podía generar electricidad a escala industrial.',
    color: '#FFD700',
  },
  {
    id: 'petroleo_siglo20',
    nombre: 'Hegemonía del Petróleo',
    anioInicio: 1920,
    anioFin: 1970,
    categoria: 'petroleo',
    fuente: 'Petróleo y derivados',
    inventores: ['Ingenieros de Standard Oil', 'ARAMCO', 'Ingenieros soviéticos'],
    hitos: [
      'Descubrimiento yacimientos de Oriente Medio',
      'Aviación comercial (queroseno)',
      'Plásticos derivados del petróleo',
      'Crisis del Canal de Suez (1956)',
      'Fundación de la OPEP (1960)',
    ],
    obra: 'El yacimiento de Ghawar (Arabia Saudí, 1948) — el mayor campo petrolífero de la historia',
    pregunta: '¿Cómo el petróleo de Oriente Medio reconfiguró la geopolítica del siglo XX?',
    contexto: 'El descubrimiento de vastos yacimientos en Arabia Saudí, Irak e Irán trasladó el poder energético global. La OPEP fundada en 1960 agrupó a los productores. El petróleo alimentó la aviación comercial, el plástico, la petroquímica. El mundo occidental construyó su civilización sobre el barril de petróleo.',
    color: '#8B0000',
  },
  {
    id: 'nuclear',
    nombre: 'Era Nuclear',
    anioInicio: 1945,
    anioFin: 1990,
    categoria: 'nuclear',
    fuente: 'Fisión nuclear',
    inventores: ['Enrico Fermi', 'Robert Oppenheimer', 'Hyman Rickover'],
    hitos: [
      'Primer reactor nuclear (Fermi, 1942)',
      'Bomba atómica (1945)',
      'Primera planta nuclear civil (1954, URSS)',
      'Accidente Three Mile Island (1979)',
      'Chernóbil (1986)',
      '450 reactores en 30 países (1990)',
    ],
    obra: 'El reactor Chicago Pile-1 de Fermi (1942) — primera reacción nuclear controlada',
    pregunta: '¿Por qué la promesa de energía nuclear "demasiado barata para medirse" no se cumplió?',
    contexto: 'Fermi logró la primera fisión nuclear controlada en 1942. La URSS abrió la primera planta civil en 1954. Francia derivó el 75% de su electricidad a la nuclear. Pero Chernóbil (1986) y Three Mile Island (1979) paralizaron la expansión. El coste real superó las promesas. Los residuos nucleares siguen sin solución.',
    color: '#00FF7F',
  },
  {
    id: 'gas_natural',
    nombre: 'Era del Gas Natural',
    anioInicio: 1960,
    anioFin: 2010,
    categoria: 'gas',
    fuente: 'Gas natural',
    inventores: ['Ingenieros de Gazprom', 'Shell', 'ExxonMobil'],
    hitos: [
      'Red de gasoductos transeuropeos',
      'Metaneros GNL (1959)',
      'Gas de fracturación hidráulica (fracking, 1998)',
      'Gas como alternativa "limpia" al carbón',
      'Crisis del gas en Europa (2022)',
    ],
    obra: 'El gasoducto Nord Stream (2011) — 1.224 km bajo el Báltico',
    pregunta: '¿Es el gas natural un puente hacia las renovables o una trampa de dependencia fósil?',
    contexto: 'El gas natural emergió como combustible "más limpio" que el carbón. Los gasoductos rusos alimentaron Europa durante décadas. El fracking en EE.UU. (desde 1998) generó la revolución del shale gas. La invasión de Ucrania en 2022 expuso la peligrosa dependencia energética europea del gas ruso.',
    color: '#87CEEB',
  },
  {
    id: 'renovables_primera',
    nombre: 'Primeras Renovables Modernas',
    anioInicio: 1970,
    anioFin: 2010,
    categoria: 'renovable_nueva',
    fuente: 'Solar y eólica incipientes',
    inventores: ['Bell Labs (solar)', 'Vestas (eólica)', 'Ingenieros daneses'],
    hitos: [
      'Crisis del petróleo de 1973 (impulso renovable)',
      'Paneles solares para satélites',
      'Primer parque eólico (1980, New Hampshire)',
      'Parques solares en el desierto',
      'Protocolo de Kioto (1997)',
    ],
    obra: 'El primer parque eólico comercial de Crotched Mountain (1980) — 20 turbinas, New Hampshire',
    pregunta: '¿Por qué las crisis del petróleo no aceleraron suficientemente la transición renovable?',
    contexto: 'La crisis del petróleo de 1973 (embargo árabe) disparó el interés por las renovables. La NASA usaba paneles solares en satélites desde 1958. Dinamarca instaló los primeros parques eólicos modernos. Pero el petróleo barato de los 80 frenó la inversión. El Protocolo de Kioto (1997) fue el primer intento global de coordinación.',
    color: '#32CD32',
  },
  {
    id: 'renovables_masivas',
    nombre: 'Revolución Renovable',
    anioInicio: 2010,
    anioFin: 2020,
    categoria: 'renovable_nueva',
    fuente: 'Solar fotovoltaica y eólica marina',
    inventores: ['Elon Musk (Tesla Solar)', 'BYD', 'Siemens Gamesa', 'Vestas'],
    hitos: [
      'Coste solar cae 90% (2010-2020)',
      'Parques eólicos marinos offshore',
      'Récord renovable en Alemania (2020)',
      'Baterías de litio para almacenamiento',
      'China lidera instalación fotovoltaica',
    ],
    obra: 'La caída de costes del panel solar: de 76$/W en 1977 a 0,38$/W en 2020',
    pregunta: '¿Estamos ante la mayor revolución energética desde la máquina de vapor?',
    contexto: 'Entre 2010 y 2020 el coste de la energía solar cayó un 90%. China instaló más paneles solares que el resto del mundo. La eólica marina offshore superó 1.000 MW por parque. Las baterías de litio comenzaron a hacer viable el almacenamiento a red. Por primera vez, las renovables compitieron en precio con los fósiles.',
    color: '#00CED1',
  },
  {
    id: 'transicion',
    nombre: 'Transición Energética',
    anioInicio: 2020,
    anioFin: 2025,
    categoria: 'transicion',
    fuente: 'Mix renovable + almacenamiento',
    inventores: ['IPCC', 'Agencia Internacional de Energía', 'Tesla', 'Northvolt'],
    hitos: [
      'Acuerdo de París (2015) — 1,5°C',
      'Ley de Reducción de Inflación EE.UU. (IRA 2022)',
      'REPowerEU (2022)',
      'Hidrógeno verde emergente',
      'Vehículo eléctrico mainstream',
    ],
    obra: 'El Acuerdo de París (2015) — 196 países comprometidos con la descarbonización',
    pregunta: '¿Puede el mundo descarbonizarse antes de 2050 sin colapso económico?',
    contexto: 'La transición energética se aceleró tras el Acuerdo de París. La IRA de EE.UU. invirtió 369.000 M$ en energías limpias. REPowerEU buscó eliminar la dependencia del gas ruso. El hidrógeno verde emergió como vector energético para industria pesada. Los VE superaron el 15% de ventas en Europa en 2023.',
    color: '#2E86AB',
  },
  {
    id: 'hidrogeno',
    nombre: 'Era del Hidrógeno Verde',
    anioInicio: 2023,
    anioFin: 2035,
    categoria: 'futuro',
    fuente: 'Hidrógeno verde y almacenamiento',
    inventores: ['NEL Hydrogen', 'Air Liquide', 'HydrogenPro'],
    hitos: [
      'Electrolizadores a escala industrial',
      'Hidrógeno para acería y cemento',
      'Primera flota de trenes de hidrógeno',
      'Proyectos H2 en Marruecos y Chile',
      'Coste objetivo: <1€/kg',
    ],
    obra: 'El primer avión comercial de hidrógeno de ZeroAvia (prueba 2023)',
    pregunta: '¿Será el hidrógeno verde el combustible del siglo XXI o una promesa tecnológica fallida?',
    contexto: 'El hidrógeno verde se produce con electrólisis usando electricidad renovable. En 2023 comenzaron los primeros proyectos industriales a escala. La UE planea importar 10 Mt de H₂ verde anuales en 2030. Su principal ventaja: almacenar energía renovable excedente. Su principal reto: el coste de producción y las pérdidas de conversión.',
    color: '#00BFFF',
  },
  {
    id: 'fusion',
    nombre: 'Fusión Nuclear y IA Energética',
    anioInicio: 2022,
    anioFin: 2050,
    categoria: 'futuro',
    fuente: 'Fusión nuclear e IA',
    inventores: ['NIF (EEUU)', 'ITER (UE)', 'Commonwealth Fusion Systems', 'Google DeepMind'],
    hitos: [
      'NIF logra ignición (diciembre 2022)',
      'ITER en construcción (Cadarache)',
      'IA optimiza redes eléctricas',
      'Computación cuántica para materiales',
      'Reactores de fusión comerciales (estimado 2040s)',
    ],
    obra: 'El experimento NIF del Lawrence Livermore National Laboratory (diciembre 2022) — primera fusión con ganancia neta de energía',
    pregunta: '¿Cambiará la fusión nuclear la historia energética como lo hizo la fisión, pero sin sus riesgos?',
    contexto: 'En diciembre de 2022, el NIF de EE.UU. logró por primera vez más energía de la fusión que la invertida en el láser: ignición nuclear. ITER en Francia ensamblará el mayor tokamak en 2025. Commonwealth Fusion planea un reactor comercial para los años 2030. La IA gestiona ya redes eléctricas complejas con renovables intermitentes.',
    color: '#FF6347',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -3000, evento: 'Egipcios navegan a vela por el Nilo — primeros barcos propulsados por viento' },
  { anio: 1712, evento: 'Newcomen presenta la primera máquina de vapor práctica — inicio de la era del carbón' },
  { anio: 1769, evento: 'Watt patenta la máquina de vapor mejorada — nace la Primera Revolución Industrial' },
  { anio: 1859, evento: 'Drake perfora el primer pozo petrolífero moderno en Titusville, Pensilvania' },
  { anio: 1882, evento: 'Edison abre la central de Pearl Street — primera red eléctrica comercial del mundo' },
  { anio: 1945, evento: 'Trinity: primera prueba atómica. Fermi ya había logrado la fisión controlada en 1942' },
  { anio: 1973, evento: 'Crisis del petróleo: la OPEP cuadruplica el precio — impulso para las renovables' },
  { anio: 1986, evento: 'Chernóbil: el mayor accidente nuclear frena la expansión de la energía atómica en Europa' },
  { anio: 2022, evento: 'El NIF logra ignición en fusión nuclear: primera vez que produce más energía de la invertida' },
];

const ERAS: Era[] = [
  { nombre: 'Biomasa y Tracción Animal', desde: -15000, hasta: 1700, icono: '🔥' },
  { nombre: 'Carbón y Vapor', desde: 1700, hasta: 1870, icono: '🏭' },
  { nombre: 'Petróleo y Electricidad', desde: 1870, hasta: 1945, icono: '⚡' },
  { nombre: 'Nuclear y Hegemonía Fósil', desde: 1945, hasta: 1990, icono: '☢️' },
  { nombre: 'Crisis y Primeras Renovables', desde: 1990, hasta: 2015, icono: '🌬️' },
  { nombre: 'Transición y Energía Limpia', desde: 2015, hasta: 9999, icono: '🌱' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  biomasa: 'Biomasa',
  renovable_antigua: 'Renovable Antigua',
  carbon: 'Carbón',
  petroleo: 'Petróleo',
  nuclear: 'Nuclear',
  gas: 'Gas Natural',
  renovable_nueva: 'Renovable Nueva',
  transicion: 'Transición',
  futuro: 'Futuro',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  biomasa: '#8B4513',
  renovable_antigua: '#2E8B57',
  carbon: '#555',
  petroleo: '#8B0000',
  nuclear: '#228B22',
  gas: '#4682B4',
  renovable_nueva: '#32CD32',
  transicion: '#2E86AB',
  futuro: '#FF6347',
};

// ─────────────────────────────────────────────
// Constantes SVG
// ─────────────────────────────────────────────

const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

// ─────────────────────────────────────────────
// Subcomponente: Panel de detalle
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoEnergia }) {
  const anioFinTexto = periodo.anioFin >= 2035 ? 'futuro' : formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.preguntaBox}>
        <span className={styles.preguntaLabel}>Pregunta central</span>
        <p className={styles.preguntaTexto}>{periodo.pregunta}</p>
      </div>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Fuente de energía</h4>
          <div className={styles.fuenteDestacada} style={{ borderColor: `${periodo.color}55`, background: `${periodo.color}11` }}>
            <span style={{ color: periodo.color, fontWeight: 700 }}>{periodo.fuente}</span>
          </div>
          <h4 className={styles.detalleSubtitulo} style={{ marginTop: '0.75rem' }}>Inventores / Protagonistas</h4>
          <ul className={styles.artistasList}>
            {periodo.inventores.map((inv) => (
              <li key={inv}>{inv}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
          <ul className={styles.caracteristicasList}>
            {periodo.hitos.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra / Hito icónico</span>
        <p>{periodo.obra}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{periodo.contexto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoEnergia | null>(null);

  const filas: PeriodoEnergia[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      const anioFinUltimo = ultimoEnFila ? (ultimoEnFila.anioFin >= 2035 ? AÑO_MAX : ultimoEnFila.anioFin) : 0;
      if (!ultimoEnFila || anioAX(anioFinUltimo) + 4 <= anioAX(per.anioInicio)) {
        filas[f].push(per);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(per);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  const marcadores: number[] = [-10000, -5000, 0, 1000, 1500, 1700, 1800, 1900, 1950, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 15.000 a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la energía"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcador del año 0 */}
          <line x1={anioAX(0)} y1={FILA_OFFSET_Y} x2={anioAX(0)} y2={svgAlto - 16} stroke="#888" strokeWidth={1} strokeDasharray="4,3" />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#888" textAnchor="middle">año 0</text>

          {/* Marcadores */}
          {marcadores.map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{formatAnio(m)}</text>
            </g>
          ))}

          {/* Rectángulos de períodos */}
          {filas.map((fila, fi) =>
            fila.map((per) => {
              const anioFin = per.anioFin >= 2035 ? AÑO_MAX : per.anioFin;
              const x = anioAX(per.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 8);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === per.id;

              return (
                <g key={per.id} onClick={() => setSeleccionado(esSeleccionado ? null : per)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={per.color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 50 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={9}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {per.nombre.length > 18 ? per.nombre.substring(0, 16) + '…' : per.nombre}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Leyenda */}
      <div className={styles.leyendaCategorias}>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <span key={cat} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: COLORES_CATEGORIA[cat] }} aria-hidden="true" />
            {ETIQUETAS_CATEGORIA[cat]}
          </span>
        ))}
      </div>

      {seleccionado && (
        <PanelDetalle periodo={seleccionado} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Período en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const periodo = PERIODOS[indice];
  const anioFinTexto = periodo.anioFin >= 2035 ? 'futuro' : formatAnio(periodo.anioFin);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Período en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {PERIODOS.map((per, i) => (
          <button
            key={per.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: per.color, borderColor: per.color } : {}}
          >
            {per.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: periodo.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: periodo.color }}>
          <h3>{periodo.nombre}</h3>
          <p>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">?</span>
            <p>{periodo.pregunta}</p>
          </div>

          <div className={styles.fuenteDestacadaGrande} style={{ borderColor: `${periodo.color}55`, background: `${periodo.color}11` }}>
            <span className={styles.fuenteLabel}>Fuente de Energía</span>
            <p style={{ color: periodo.color, fontWeight: 700, margin: 0 }}>{periodo.fuente}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Inventores / Protagonistas</h4>
              <ul className={styles.artistasList}>
                {periodo.inventores.map((inv) => <li key={inv}>{inv}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
              <ul className={styles.caracteristicasList}>
                {periodo.hitos.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra / Hito icónico</span>
            <p>{periodo.obra}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
            <p>{periodo.contexto}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Período anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {PERIODOS.length}</span>
        <button
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(PERIODOS.length - 1, i + 1))}
          disabled={indice === PERIODOS.length - 1}
          aria-label="Período siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Comparativa
// ─────────────────────────────────────────────

function TabComparativa() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const periodosFiltrados = useMemo(() => {
    return PERIODOS.filter((per) => {
      const coincideCategoria = categoriaFiltro === 'todos' || per.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        per.nombre.toLowerCase().includes(termino) ||
        per.fuente.toLowerCase().includes(termino) ||
        per.inventores.some((inv) => inv.toLowerCase().includes(termino));
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoriaFiltro, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          className={`${styles.filtroCatBtn} ${categoriaFiltro === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setCategoriaFiltro('todos')}
        >
          Todas
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <button
            key={cat}
            className={`${styles.filtroCatBtn} ${categoriaFiltro === cat ? styles.filtroCatBtnActivo : ''}`}
            onClick={() => setCategoriaFiltro(cat)}
            style={categoriaFiltro === cat ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat] } : {}}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período, fuente o protagonista..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período energético"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Fuente de Energía</th>
              <th>Protagonista clave</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => {
              const anioFinTexto = per.anioFin >= 2035 ? 'futuro' : formatAnio(per.anioFin);
              return (
                <tr
                  key={per.id}
                  style={i % 2 === 0 ? { background: `${per.color}18` } : {}}
                >
                  <td><strong style={{ color: per.color }}>{per.nombre}</strong></td>
                  <td>{formatAnio(per.anioInicio)}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                      {ETIQUETAS_CATEGORIA[per.categoria]}
                    </span>
                  </td>
                  <td className={styles.preguntaCell}>{per.fuente}</td>
                  <td>{per.inventores[0]}</td>
                </tr>
              );
            })}
            {periodosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.sinResultados}>Sin resultados para la búsqueda actual.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Contexto Histórico — vista por eras
// ─────────────────────────────────────────────

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos energéticos y eventos clave organizados por eras históricas.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anioInicio < era.hasta && (p.anioFin >= 2035 || p.anioFin > era.desde)
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && (era.hasta === 9999 ? true : ev.anio < era.hasta)
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>
                    {formatAnio(era.desde)} – {era.hasta === 9999 ? 'hoy' : formatAnio(era.hasta)}
                  </span>
                </div>
              </div>

              {periodosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {periodosEra.map((p) => (
                    <span
                      key={p.id}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${p.color}1A`, color: p.color, borderColor: `${p.color}55` }}
                    >
                      {p.nombre}
                    </span>
                  ))}
                </div>
              )}

              {eventosEra.length > 0 && (
                <ul className={styles.eraEventos}>
                  {eventosEra.map((ev) => (
                    <li key={ev.anio} className={styles.eraEvento}>
                      <span className={styles.eraEventoAnio}>{formatAnio(ev.anio)}</span>
                      <span className={styles.eraEventoTexto}>{ev.evento}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHistoriaEnergia() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Período en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia de la Energía</h1>
        <p className={styles.heroSubtitle}>
          Del fuego prehistórico a la fusión nuclear — 14 períodos de historia energética con protagonistas, fuentes y contexto geopolítico
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabActiva === tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.tabContent} role="tabpanel">
          {tabActiva === 'timeline' && <TabTimeline />}
          {tabActiva === 'detalle' && <TabDetalle />}
          {tabActiva === 'comparativa' && <TabComparativa />}
          {tabActiva === 'contexto' && <TabContexto />}
        </div>
      </main>

      <EducationalSection
        title="Guía completa sobre la historia de la energía"
        subtitle="Cómo las fuentes de energía han transformado la civilización humana a lo largo de 17.000 años"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 5 fuentes de energía clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Fuente</th>
                <th>Período clave</th>
                <th>Ventaja</th>
                <th>Limitación</th>
                <th>% generación mundial hoy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Biomasa</strong></td>
                <td>Prehistoria–actualidad</td>
                <td>Universal y renovable</td>
                <td>Emisiones y deforestación</td>
                <td>~9% (cocción y calor)</td>
              </tr>
              <tr>
                <td><strong>Carbón</strong></td>
                <td>1700–actualidad</td>
                <td>Alta densidad energética</td>
                <td>Mayor emisor de CO₂</td>
                <td>~26% electricidad global</td>
              </tr>
              <tr>
                <td><strong>Petróleo</strong></td>
                <td>1860–actualidad</td>
                <td>Densidad y transportabilidad</td>
                <td>Finito y geopolíticamente volátil</td>
                <td>~31% energía primaria global</td>
              </tr>
              <tr>
                <td><strong>Nuclear (fisión)</strong></td>
                <td>1954–actualidad</td>
                <td>Sin emisiones CO₂ en operación</td>
                <td>Residuos radiactivos de larga vida</td>
                <td>~10% electricidad global</td>
              </tr>
              <tr>
                <td><strong>Renovables (solar+eólica)</strong></td>
                <td>1970–actualidad</td>
                <td>Cero emisiones, coste decreciente</td>
                <td>Intermitencia, necesita almacenamiento</td>
                <td>~12% electricidad global (creciendo)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios */}
        <h3>Grandes debates de la historia energética</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌡️</span>
            <div>
              <strong>Zero emisiones 2050</strong>
              <p>El Acuerdo de París fija la meta de neutralidad climática en 2050. Para lograrlo habría que triplicar la capacidad renovable cada década, electrificar el transporte y la calefacción, y descarbonizar la industria pesada con hidrógeno verde.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">⛽</span>
            <div>
              <strong>Crisis energética 2022</strong>
              <p>La invasión de Ucrania cortó el gas ruso que alimentaba Europa. El resultado fue la mayor inversión en renovables de la historia europea y la reactivación de centrales nucleares cerradas. Las crisis aceleran la transición.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">⚛️</span>
            <div>
              <strong>Fusión comercial</strong>
              <p>Si la fusión nuclear alcanza escala comercial en los años 2030-2040, cambiaría radicalmente el mix energético: combustible prácticamente ilimitado (hidrógeno del agua), sin residuos de larga vida y sin riesgo de explosión nuclear.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
            <div>
              <strong>Descentralización energética</strong>
              <p>Los paneles solares y baterías en hogares y empresas crean productores-consumidores (prosumers). La red eléctrica centralizada del siglo XX podría evolucionar hacia redes distribuidas donde millones de nodos gestionan oferta y demanda en tiempo real.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre historia de la energía</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuándo se descubrió el petróleo y cómo cambió el mundo?</strong>
            <p>El primer pozo petrolífero moderno fue perforado por Edwin Drake en Titusville (Pensilvania) en 1859. En 50 años, el petróleo pasó de iluminar farolas con keroseno a mover automóviles, aviones y buques de guerra. Rockefeller monopolizó la industria con Standard Oil, creando el primer gran conglomerado empresarial. El petróleo definió las guerras del siglo XX: la Segunda Guerra Mundial fue en parte una lucha por el control de los recursos petrolíferos.</p>
            <span className={styles.faqTip}>La palabra "petróleo" viene del latín petra (roca) + oleum (aceite): aceite de roca.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué no usamos más energía nuclear si no emite CO₂?</strong>
            <p>La energía nuclear tiene tres obstáculos principales: coste (una central tarda 15 años en construirse y cuesta más de 10.000 millones de euros), seguridad percibida (Chernóbil 1986 y Fukushima 2011 generaron desconfianza pública duradera) y residuos (el combustible gastado mantiene su radiactividad miles de años sin solución de almacenamiento definitiva). Mientras tanto, el solar y el eólico han bajado un 90% en precio en una sola década, haciendo la competencia económica imposible para nuevas nucleares en muchos mercados.</p>
            <span className={styles.faqTip}>Francia obtiene el 70% de su electricidad de centrales nucleares — la mayor proporción del mundo. Otros países (Alemania, España) las están cerrando.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la fusión nuclear y por qué es tan prometedora?</strong>
            <p>La fusión nuclear une átomos ligeros de hidrógeno para liberar energía, igual que el Sol. Sus ventajas frente a la fisión: combustible prácticamente ilimitado (el hidrógeno es el elemento más abundante), sin residuos de larga vida radiactiva y sin riesgo de accidente en cadena. El problema: mantener el plasma a 100 millones de grados ha tardado 70 años en resolverse. En diciembre de 2022, el NIF de EE.UU. logró por primera vez ganancia neta de energía — más energía producida que invertida en el láser.</p>
            <span className={styles.faqTip}>El chiste del sector: "La fusión es la energía del futuro, y siempre lo será." El NIF en 2022 cambió parcialmente esa percepción.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la transición energética y qué implica para el ciudadano común?</strong>
            <p>La transición energética es el proceso de sustituir los combustibles fósiles (carbón, petróleo, gas) por fuentes limpias (solar, eólica, nuclear, hidrógeno verde). Para el ciudadano implica: coches eléctricos que ya compiten en precio con los de gasolina, calefacción con bombas de calor, facturas de luz más vinculadas al precio de mercado de las renovables, y posibilidad de instalar paneles solares para autoconsumo.</p>
            <span className={styles.faqTip}>En 2023, España generó más del 50% de su electricidad con fuentes renovables — un hito histórico.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Es el hidrógeno verde la solución definitiva al cambio climático?</strong>
            <p>El hidrógeno verde es crucial pero no suficiente solo. Se produce con electrólisis del agua usando electricidad renovable y solo libera agua al quemarse. Es ideal para descarbonizar sectores difíciles de electrificar: acería, cemento, fertilizantes, aviación y barcos de larga distancia. Sin embargo, su eficiencia es baja (conviertes electricidad → hidrógeno → electricidad con pérdidas del 60-70%). Es más eficiente usar electricidad renovable directamente donde sea posible, y reservar el hidrógeno para donde no hay alternativa.</p>
            <span className={styles.faqTip}>El 99% del hidrógeno actual es "gris": producido con gas natural, con emisiones de CO₂. El hidrógeno verde representa menos del 1% de la producción mundial.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo analizar la transición energética en 5 pasos</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Distingue electricidad de energía total</strong>
              <p>La electricidad es solo el 20% de la energía que consume la humanidad. El 80% restante es calor industrial, transporte y procesos que aún queman combustibles fósiles directamente. Cuando leas "50% de electricidad renovable en España", recuerda que eso es solo una quinta parte del problema energético total.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Comprende la intermitencia renovable</strong>
              <p>El sol no brilla de noche y el viento no sopla siempre. Las renovables necesitan almacenamiento (baterías, bombeo hidráulico, hidrógeno) o respaldo (gas, nuclear, interconexiones). El reto no es solo producir energía limpia sino equilibrar oferta y demanda en tiempo real, segundo a segundo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Sigue el precio, no la tecnología</strong>
              <p>La revolución renovable no fue impulsada principalmente por conciencia ecológica sino por economía. El solar fotovoltaico bajó un 90% en precio en una década porque la curva de aprendizaje (ley de Swanson) hace que el coste caiga un 20% cada vez que se duplica la capacidad instalada. El precio manda en energía.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Aprende de las crisis energéticas pasadas</strong>
              <p>Cada crisis (1973, 1979, 2008, 2022) produjo los mismos efectos: inversión en eficiencia, diversificación de fuentes y aceleración de alternativas. La crisis del gas ruso de 2022 disparó la instalación de renovables en Europa más que ningún plan climático previo. Las crisis son aceleradores de la transición.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Piensa en sistemas complejos, no en fuentes aisladas</strong>
              <p>Una red eléctrica necesita equilibrio permanente entre producción y consumo. No basta con añadir renovables: hay que rediseñar mercados eléctricos, infraestructuras de red, sistemas de almacenamiento y patrones de consumo. La transición energética es un problema de sistemas complejos donde todo está interconectado.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Conceptos clave para entender la geopolítica energética</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🛢️</span>
            <p>El precio del petróleo en dólares por barril es el termómetro de la economía global. Cuando supera los 80-100$, las renovables y la eficiencia se vuelven más competitivas; cuando cae a 30-40$, frena la inversión en alternativas. El ciclo se repite desde los años 70.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>Las tierras raras (litio, cobalto, neodimio) para baterías y aerogeneradores son los "nuevos metales del petróleo". La dependencia de China, RDC y Chile en su extracción crea nuevas vulnerabilidades geopolíticas parecidas a las del petróleo del Golfo Pérsico.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <p>La densidad energética explica por qué los fósiles dominaron: 1 litro de gasolina tiene ~9 kWh de energía, mientras que las mejores baterías actuales almacenan ~0,3 kWh/kg. Mejorar baterías es el mayor reto tecnológico del siglo XXI para la movilidad y el almacenamiento.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <p>El "pico del petróleo" (peak oil) se predijo en los años 70 para el año 2000. No ocurrió entonces por el fracking y la extracción en aguas profundas. Hoy el debate es cuándo ocurrirá el "pico de demanda" de petróleo (cuando la electrificación del transporte lo haga decaer).</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Los datos de mix energético mundial son de 2023 (IEA). Las proyecciones de fusión y costes son estimaciones de organismos especializados sujetas a revisión.</strong>
          <ul>
            <li>Los porcentajes de generación por fuente varían significativamente entre países y evolucionan con rapidez: las cifras de este visualizador reflejan medias globales, no cifras de países específicos.</li>
            <li>Las fechas de hitos tecnológicos (fusión comercial, objetivos de hidrógeno verde, etc.) son metas o estimaciones de expertos, no certezas. La historia energética está llena de predicciones que se adelantaron o retrasaron décadas.</li>
            <li>El coste social y económico de la transición energética (empleos en sectores fósiles, acceso a energía en países en desarrollo, impacto en comunidades mineras) es un debate activo con posiciones legítimas contrapuestas que va más allá de la tecnología.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-energia')} />
      <ShareCard appName="visualizador-historia-energia" />
      <Footer appName="visualizador-historia-energia" />
    </div>
  );
}
