'use client';
// @disclaimer: exempt
import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from './VisualizadorGeopoliticaRecursos.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/** Espacio duro entre la cifra y el «%» (Ortografía de la RAE, 2010). */
const NB = ' ';

/** «31,7 %» con el número de decimales que da la fuente. */
function pct(valor: number, decimales: number): string {
  return `${formatNumber(valor, decimales)}${NB}%`;
}

// --- Tipos ---
type RecursoId = 'petroleo' | 'gas' | 'litio' | 'tierras-raras' | 'cobre';

/**
 * Una sola escala para la «criticidad» en toda la app, y con fuente: la lista de materias primas
 * ESTRATÉGICAS de la Ley de Materias Primas Críticas de la UE (Reglamento (UE) 2024/1252, anexo I).
 * Antes el panel decía «Criticidad UE: Crítico» y la tabla «Riesgo: Medio» para el mismo litio,
 * dos juicios propios sin fuente que se contradecían (hallazgo 1933).
 */
type EstatusCrma = 'estrategica' | 'no-figura';

interface Productor {
  pais: string;
  /** Cuota de la producción mundial, en %, calculada con las cifras de la fuente. */
  porcentaje: number;
}

interface Recurso {
  id: RecursoId;
  icono: string;
  nombre: string;
  productores: Productor[];
  /** Decimales con que se presenta la cuota (los que permite la fuente). */
  decimales: number;
  fuenteProduccion: string;
  reservas: string[];
  fuenteReservas: string;
  usos: string[];
  crma: EstatusCrma;
  crmaDetalle: string;
}

interface FilaDependencia {
  recurso: string;
  icono: string;
  importacion: string;
  proveedor: string;
  crma: EstatusCrma;
}

interface Conflicto {
  id: number;
  icono: string;
  titulo: string;
  fecha: string;
  descripcion: string;
}

interface Proyeccion {
  mineral: string;
  multiplicador: number;
  /** Cómo lo formula la AIE, para que el lector vea que no es una cifra redondeada por nosotros. */
  formulacion: string;
}

// --- Datos ---
// Cada cifra lleva su fuente y su año en pantalla. Las cuotas se calculan aquí a partir de las
// cantidades de la fuente, que se dejan en el comentario para poder repetir la cuenta.
const RECURSOS: Recurso[] = [
  {
    id: 'petroleo',
    icono: '🛢️',
    nombre: 'Petróleo',
    // EIA, «What countries are the top producers and consumers of oil?» (datos de 2023): EE. UU.
    // 21,91 Mb/d (22 %), Arabia Saudí 11,13 (11 %), Rusia 10,75 (11 %), Canadá 5,76 (6 %),
    // China 5,26 (5 %). La EIA da las cuotas redondeadas a la unidad (hallazgo 1920).
    productores: [
      { pais: 'EE. UU.', porcentaje: 22 },
      { pais: 'Arabia Saudí', porcentaje: 11 },
      { pais: 'Rusia', porcentaje: 11 },
      { pais: 'Canadá', porcentaje: 6 },
      { pais: 'China', porcentaje: 5 },
    ],
    decimales: 0,
    fuenteProduccion:
      'EIA (EE. UU.), datos de 2023. Incluye crudo, otros líquidos del petróleo y biocombustibles.',
    // OPEP, Annual Statistical Bulletin 2025, tabla 3.1 (fin de 2024, millones de barriles):
    // Venezuela 303.221, Arabia Saudí 267.200, Irán 208.600 de 1.566.869.
    reservas: [`Venezuela: ${pct(19.4, 1)}`, `Arabia Saudí: ${pct(17.1, 1)}`, `Irán: ${pct(13.3, 1)}`],
    fuenteReservas:
      'Reservas probadas de crudo a fin de 2024: OPEP, Annual Statistical Bulletin 2025. La OPEP excluye las arenas bituminosas; con ellas, Canadá figura entre las tres primeras (BP, Statistical Review 2021, fin de 2020).',
    usos: ['Transporte y aviación', 'Industria petroquímica', 'Plásticos y fertilizantes'],
    crma: 'no-figura',
    crmaDetalle: 'no figura (es un combustible, fuera del ámbito de la ley)',
  },
  {
    id: 'gas',
    icono: '⚡',
    nombre: 'Gas Natural',
    // OPEP, ASB 2025, tabla 9.2 (producción comercializada de 2024, millones de m³): EE. UU.
    // 1.072.884, Rusia 644.213, Irán 277.611, China 242.702, Canadá 211.790 de 4.288.564.
    productores: [
      { pais: 'EE. UU.', porcentaje: 25.0 },
      { pais: 'Rusia', porcentaje: 15.0 },
      { pais: 'Irán', porcentaje: 6.5 },
      { pais: 'China', porcentaje: 5.7 },
      { pais: 'Canadá', porcentaje: 4.9 },
    ],
    decimales: 1,
    fuenteProduccion: 'Producción comercializada de 2024: OPEP, Annual Statistical Bulletin 2025.',
    // OPEP, ASB 2025, tabla 9.1 (fin de 2024, miles de millones de m³): Rusia 46.832,
    // Irán 33.988, Catar 23.831 de 208.892.
    reservas: [`Rusia: ${pct(22.4, 1)}`, `Irán: ${pct(16.3, 1)}`, `Catar: ${pct(11.4, 1)}`],
    fuenteReservas: 'Reservas probadas a fin de 2024: OPEP, Annual Statistical Bulletin 2025.',
    usos: ['Calefacción doméstica', 'Generación eléctrica', 'Industria química'],
    crma: 'no-figura',
    crmaDetalle: 'no figura (es un combustible, fuera del ámbito de la ley)',
  },
  {
    id: 'litio',
    icono: '🔋',
    nombre: 'Litio',
    // USGS, Mineral Commodity Summaries 2026, LITHIUM (t de litio contenido, 2025 estimado):
    // Australia 92.000, China 62.000, Chile 56.000, Zimbabue 28.000, Argentina 23.000 de
    // 290.000 (el total excluye a EE. UU., dato confidencial «W»). Hallazgo 1918.
    productores: [
      { pais: 'Australia', porcentaje: 31.7 },
      { pais: 'China', porcentaje: 21.4 },
      { pais: 'Chile', porcentaje: 19.3 },
      { pais: 'Zimbabue', porcentaje: 9.7 },
      { pais: 'Argentina', porcentaje: 7.9 },
    ],
    decimales: 1,
    fuenteProduccion:
      'Producción minera de 2025 (estimada): USGS, Mineral Commodity Summaries 2026. El total mundial excluye a EE. UU., cuyo dato es confidencial.',
    // Hallazgo 1917: aquí estaban los RECURSOS del MCS 2023 (Bolivia 21, Argentina 20, Chile 11
    // Mt) presentados como reservas. USGS MCS 2026, RESERVAS: Chile 9,2 Mt, Australia 8,4 Mt,
    // China 4,6 Mt de 37 Mt. Bolivia no figura en la tabla de reservas.
    reservas: [
      `Chile: ${pct(24.9, 1)} (9,2 millones de t)`,
      `Australia: ${pct(22.7, 1)} (8,4 millones de t)`,
      `China: ${pct(12.4, 1)} (4,6 millones de t)`,
    ],
    fuenteReservas:
      'Reservas (lo extraíble hoy con rentabilidad) de 37 millones de t: USGS, MCS 2026. Los recursos, más amplios (unos 150 millones de t), los encabezan Argentina (28), Bolivia (23) y Chile (13).',
    usos: ['Baterías para vehículos eléctricos', 'Electrónica de consumo', 'Almacenamiento de energía renovable'],
    crma: 'estrategica',
    crmaDetalle: 'materia prima estratégica (litio para baterías)',
  },
  {
    id: 'tierras-raras',
    icono: '🧲',
    nombre: 'Tierras Raras',
    // USGS MCS 2026, RARE EARTHS (t de óxidos, 2025 estimado): China 270.000, EE. UU. 51.000,
    // Australia 29.000, Birmania 22.000, Tailandia 4.800 de 390.000. Rusia, 2.600 (0,7 %),
    // queda fuera de los cinco primeros (hallazgo 1919).
    productores: [
      { pais: 'China', porcentaje: 69.2 },
      { pais: 'EE. UU.', porcentaje: 13.1 },
      { pais: 'Australia', porcentaje: 7.4 },
      { pais: 'Birmania', porcentaje: 5.6 },
      { pais: 'Tailandia', porcentaje: 1.2 },
    ],
    decimales: 1,
    fuenteProduccion: 'Producción minera de 2025 (estimada), en óxidos: USGS, Mineral Commodity Summaries 2026.',
    // USGS MCS 2026: China 44 Mt, Brasil 11 Mt, Australia 6,3 Mt… mundo «más de 75 Mt». Con un
    // total abierto no se puede dar una cuota exacta, así que se dan las toneladas.
    reservas: ['China: 44 millones de t', 'Brasil: 11 millones de t', 'Australia: 6,3 millones de t'],
    fuenteReservas: 'Reservas, en óxidos, de más de 75 millones de t en el mundo: USGS, MCS 2026.',
    usos: ['Imanes permanentes (motores eléctricos, turbinas eólicas)', 'Pantallas y catalizadores', 'Defensa y electrónica'],
    crma: 'estrategica',
    crmaDetalle: 'materia prima estratégica (tierras raras para imanes)',
  },
  {
    id: 'cobre',
    icono: '🔌',
    nombre: 'Cobre',
    // USGS MCS 2026, COPPER (miles de t, producción minera de 2025 estimada): Chile 5.300,
    // RD del Congo 3.200, Perú 2.700, China 1.800, Rusia 1.300 de 23.000 (hallazgo 1928).
    productores: [
      { pais: 'Chile', porcentaje: 23.0 },
      { pais: 'RD del Congo', porcentaje: 13.9 },
      { pais: 'Perú', porcentaje: 11.7 },
      { pais: 'China', porcentaje: 7.8 },
      { pais: 'Rusia', porcentaje: 5.7 },
    ],
    decimales: 1,
    fuenteProduccion: 'Producción minera de 2025 (estimada): USGS, Mineral Commodity Summaries 2026.',
    // USGS MCS 2026: reservas Chile 180, Australia 100, Perú 85 de 980 millones de t.
    reservas: [`Chile: ${pct(18.4, 1)}`, `Australia: ${pct(10.2, 1)}`, `Perú: ${pct(8.7, 1)}`],
    fuenteReservas: 'Reservas de 980 millones de t: USGS, MCS 2026.',
    usos: ['Cableado eléctrico y construcción', 'Motores y baterías de vehículos eléctricos', 'Electrónica y telecomunicaciones'],
    crma: 'estrategica',
    crmaDetalle: 'materia prima estratégica',
  },
];

// Importación: petróleo y gas, Eurostat («Energy statistics - an overview», 2023: gas 90,0 %,
// petróleo 94,9 %). Litio, tierras raras y cobre: Comisión Europea, «Study on the Critical Raw
// Materials for the EU 2023», dependencia de importaciones media de 2016-2020 (litio, fase de
// refinado 100 %; tierras raras ligeras y pesadas 100 %; cobre, fase de extracción 48 %).
// Proveedores: Eurostat 2024 (petróleo por valor; gas por gasoducto y GNL por volumen) y el
// mismo estudio de la Comisión (litio: Chile 79 %; cobre: Polonia 19 %, Chile 14 %, Perú 10 %).
const DEPENDENCIA_UE: FilaDependencia[] = [
  { recurso: 'Gas Natural', icono: '⚡', importacion: pct(90, 1), proveedor: `Noruega (${pct(45.6, 1)} del gas por gasoducto) · EE.${NB}UU. (${pct(45.3, 1)} del GNL)`, crma: 'no-figura' },
  { recurso: 'Petróleo', icono: '🛢️', importacion: pct(94.9, 1), proveedor: `EE.${NB}UU. (${pct(16.1, 1)}) · Noruega (${pct(13.5, 1)}) · Kazajistán (${pct(11.5, 1)})`, crma: 'no-figura' },
  { recurso: 'Tierras Raras', icono: '🧲', importacion: pct(100, 0), proveedor: 'China', crma: 'estrategica' },
  { recurso: 'Litio', icono: '🔋', importacion: pct(100, 0), proveedor: `Chile (${pct(79, 0)})`, crma: 'estrategica' },
  { recurso: 'Cobre', icono: '🔌', importacion: pct(48, 0), proveedor: `Polonia (${pct(19, 0)}, producción de la UE) · Chile (${pct(14, 0)})`, crma: 'estrategica' },
];

const CONFLICTOS: Conflicto[] = [
  {
    id: 1,
    icono: '🛢️',
    titulo: 'Guerra del Golfo',
    fecha: '1990–1991',
    // Hallazgo 1929: decía que el Golfo «alberga más del 60 %». OPEP, ASB 2025, tabla 3.1:
    // Oriente Medio 871.218 de 1.566.869 millones de barriles a fin de 2024 = 55,6 %.
    descripcion: `En agosto de 1990 Irak invadió Kuwait, al que acusaba de producir por encima de su cuota de la OPEP y de extraer crudo del yacimiento fronterizo de Rumaila; una coalición internacional encabezada por EE. UU. expulsó al ejército iraquí en 1991. Oriente Medio reúne hoy el ${pct(55.6, 1)} de las reservas probadas de crudo del mundo (OPEP, Annual Statistical Bulletin 2025, fin de 2024, sin contar las arenas bituminosas).`,
  },
  {
    id: 2,
    icono: '🔋',
    // Hallazgo 1923: el título hablaba del coltán (mena del tántalo, que va a condensadores) y el
    // texto del cobalto (el de las baterías). USGS MCS 2026, capítulos COBALT y TANTALUM.
    titulo: 'RD del Congo: el cobalto de las baterías',
    fecha: 'Desde el año 2000',
    descripcion: `La República Democrática del Congo aportó en 2025 el ${pct(73, 0)} del cobalto minado en el mundo, un metal cuyo principal uso son las baterías de ion-litio (USGS, Mineral Commodity Summaries 2026). En 2025 el país suspendió temporalmente sus exportaciones de cobalto y después las sometió a cuotas. La minería de Katanga, donde está el cobalto, se organizó en la época colonial belga. En el este del país se extrae el coltán, mena del tántalo para condensadores electrónicos, y allí grupos armados han financiado sus operaciones con minerales: por eso EE. UU. (ley Dodd-Frank, 2010) y la UE (Reglamento (UE) 2017/821) exigen diligencia debida sobre el estaño, el tántalo, el wolframio y el oro.`,
  },
  {
    id: 3,
    icono: '⚡',
    titulo: 'Crisis del Gas Europeo',
    fecha: '2022',
    descripcion: `Tras la invasión rusa de Ucrania, las importaciones de gas ruso de la UE —gasoducto y GNL— pasaron del ${pct(45, 0)} del total en 2021 al ${pct(12, 0)} en 2025, de 152.000 a 36.000 millones de m³ (Comisión Europea, REPowerEU). La UE sustituyó ese gas con más gas noruego por gasoducto y más GNL, sobre todo de EE. UU., y aceleró la inversión en renovables y en eficiencia.`,
  },
  {
    id: 4,
    icono: '🧲',
    titulo: 'Rivalidad EE. UU.-China por las tierras raras',
    fecha: '2010–presente',
    descripcion: `China produjo en 2025 el ${pct(69, 0)} de las tierras raras minadas en el mundo (USGS, MCS 2026) y, según la Comisión Europea (2023), procesa el ${pct(85, 0)} de las ligeras y la totalidad de las pesadas. En 2010, durante una disputa territorial con Japón, sus envíos de tierras raras a ese país se interrumpieron, según denunció Tokio; Pekín negó un embargo oficial. EE. UU. restringe desde 2022 la exportación a China de semiconductores avanzados, y China somete a licencia desde agosto de 2023 la exportación de galio y germanio y en 2025 endureció los controles sobre varias tierras raras (USGS, MCS 2026).`,
  },
  {
    id: 5,
    icono: '🔌',
    titulo: 'Diplomacia del Litio: el Triángulo',
    fecha: '2020–presente',
    // Hallazgo 1916 (el mismo que el 1532 de visualizador-cadenas-suministro): decía que el
    // Triángulo concentra el 60 % de las reservas. USGS MCS 2026: Chile 9,2 + Argentina 4,4 de
    // 37 Mt = 36,8 %; Bolivia sin reservas declaradas; recursos 28 + 23 + 13 = 64 de ~150 Mt.
    descripcion: `Chile y Argentina, dos de los tres países del llamado Triángulo del Litio, reúnen el ${pct(37, 0)} de las reservas mundiales: 9,2 y 4,4 de 37 millones de toneladas (USGS, Mineral Commodity Summaries 2026). Bolivia, el tercero, no tiene reservas declaradas, pero sí 23 millones de toneladas de recursos; contando los recursos, los tres suman 64 de unos 150 millones de toneladas, en torno al ${pct(43, 0)}. Cada país lo gestiona de forma distinta: en Bolivia la explotación corresponde a la empresa estatal YLB, que en 2023 firmó un acuerdo con un consorcio liderado por la china CATL; Chile aprobó en 2023 una Estrategia Nacional del Litio que da al Estado la mayoría en los salares estratégicos, y en Argentina el recurso pertenece a las provincias, que otorgan concesiones a empresas privadas. La UE firmó en 2023 acuerdos de materias primas con Chile y Argentina.`,
  },
];

// Hallazgo 1921: el gráfico decía «fuente: AIE» con multiplicadores de 2 a 3 veces los de la AIE.
// AIE, Global Critical Minerals Outlook 2024, resumen ejecutivo, escenario NZE (el más exigente),
// de 2023 a 2040: litio «by a factor of nine»; «Graphite demand almost quadruples by 2040 in the
// NZE Scenario, while demand for nickel, cobalt and rare earth elements doubled». El cobre no
// tiene multiplicador en ese resumen, así que sale del gráfico en lugar de inventárselo.
const PROYECCION_AIE: Proyeccion[] = [
  { mineral: 'Litio', multiplicador: 9, formulacion: 'se multiplica por nueve' },
  { mineral: 'Grafito', multiplicador: 4, formulacion: 'casi se cuadruplica' },
  { mineral: 'Níquel', multiplicador: 2, formulacion: 'se duplica' },
  { mineral: 'Cobalto', multiplicador: 2, formulacion: 'se duplica' },
  { mineral: 'Tierras Raras', multiplicador: 2, formulacion: 'se duplica' },
];

const chartData = {
  labels: PROYECCION_AIE.map((p) => p.mineral),
  datasets: [
    {
      label: '2023 (base = 1)',
      data: PROYECCION_AIE.map(() => 1),
      backgroundColor: 'rgba(46, 134, 171, 0.7)',
      borderColor: '#2E86AB',
      borderWidth: 1,
    },
    {
      label: '2040 (AIE, escenario NZE)',
      data: PROYECCION_AIE.map((p) => p.multiplicador),
      backgroundColor: 'rgba(72, 169, 166, 0.7)',
      borderColor: '#48A9A6',
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: {
      display: true,
      text: 'Demanda en 2040 frente a 2023 (multiplicador)',
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) =>
          `${ctx.dataset.label}: ×${formatNumber(ctx.parsed.y ?? 0, 0)}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Multiplicador de demanda' },
    },
  },
};

const DESCRIPCION_GRAFICO = `Gráfico de barras: demanda de minerales en 2040 frente a 2023 según la AIE, escenario de cero emisiones netas. ${PROYECCION_AIE.map(
  (p) => `${p.mineral}: ${p.formulacion}`,
).join('; ')}. Los mismos datos están en la tabla que sigue al gráfico.`;

function EtiquetaCrma({ estatus }: { estatus: EstatusCrma }) {
  return estatus === 'estrategica' ? (
    <span className={styles.crmaEstrategica}>Estratégica</span>
  ) : (
    <span className={styles.crmaNoFigura}>No figura</span>
  );
}

export default function VisualizadorGeopoliticaRecursos() {
  const [recursoActivo, setRecursoActivo] = useState<RecursoId>('petroleo');
  const [conflictoAbierto, setConflictoAbierto] = useState<number | null>(null);

  const recurso = RECURSOS.find((r) => r.id === recursoActivo) as Recurso;

  const toggleConflicto = (id: number) => {
    setConflictoAbierto((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Geopolítica de los Recursos</h1>
        <p>
          Petróleo, litio, tierras raras y más: quién los produce, dónde están las reservas
          y por qué definen el poder del siglo XXI.
        </p>
      </header>

      <LegalNotice />

      {/* Bloque 1: Selector de recursos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recursos Estratégicos del Siglo XXI</h2>
        <p className={styles.sectionSubtitle}>
          Selecciona un recurso para ver productores, reservas, usos y su lugar en la ley
          europea de materias primas críticas.
        </p>

        <div className={styles.recursosTabs} role="tablist" aria-label="Selección de recurso estratégico">
          {RECURSOS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={recursoActivo === r.id}
              aria-controls={`panel-${r.id}`}
              className={`${styles.recursoTab} ${recursoActivo === r.id ? styles.activo : ''}`}
              onClick={() => setRecursoActivo(r.id)}
            >
              <span className={styles.recursoTabIcono} aria-hidden="true">{r.icono}</span>
              {r.nombre}
            </button>
          ))}
        </div>

        <div
          id={`panel-${recurso.id}`}
          role="tabpanel"
          className={styles.recursoDetalle}
        >
          <div className={styles.recursoDetalleHeader}>
            <span className={styles.recursoDetalleIcono} aria-hidden="true">{recurso.icono}</span>
            <h3 className={styles.recursoDetalleTitulo}>{recurso.nombre}</h3>
            <span
              className={`${styles.criticidadBadge} ${
                recurso.crma === 'estrategica' ? styles.criticidadEstrategica : styles.criticidadNoFigura
              }`}
            >
              Ley europea de materias primas críticas: {recurso.crmaDetalle}
            </span>
          </div>

          <div className={styles.productoresGrid}>
            <div>
              <p className={styles.subTitulo}>Top 5 Productores</p>
              {recurso.productores.map((prod) => (
                <div key={prod.pais} className={styles.barraItem}>
                  <div className={styles.barraLabel}>
                    <span>{prod.pais}</span>
                    <span>{pct(prod.porcentaje, recurso.decimales)}</span>
                  </div>
                  {/* La cifra ya está en la etiqueta: la barra es solo su dibujo, a escala 0-100 %. */}
                  <div className={styles.barraHorizontal} aria-hidden="true">
                    <div
                      className={styles.barraRelleno}
                      style={{ width: `${Math.min(prod.porcentaje, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className={styles.fuente}>Cuota de la producción mundial. {recurso.fuenteProduccion}</p>
            </div>

            <div>
              <p className={styles.subTitulo}>Mayores Reservas</p>
              <ul className={styles.reservasList}>
                {recurso.reservas.map((reserva) => (
                  <li key={reserva}>{reserva}</li>
                ))}
              </ul>
              <p className={styles.fuente}>{recurso.fuenteReservas}</p>
            </div>
          </div>

          <p className={styles.subTitulo}>Usos Principales</p>
          <ul className={styles.usosList}>
            {recurso.usos.map((uso) => (
              <li key={uso}>{uso}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bloque 2: Dependencia UE */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <h2 className={styles.sectionTitle}>Dependencia de Europa</h2>
        <p className={styles.sectionSubtitle}>
          Porcentaje importado, principal proveedor y lugar en la Ley de Materias Primas Críticas
          de la UE (Reglamento (UE) 2024/1252).
        </p>

        <div className={styles.gridDependencia}>
          <div className={styles.gridDependenciaHeader}>
            <span>Recurso</span>
            <span>Importación UE</span>
            <span>Principal proveedor</span>
            <span>En la ley</span>
          </div>
          {DEPENDENCIA_UE.map((fila) => (
            <div key={fila.recurso} className={styles.gridDependenciaFila}>
              <div className={styles.recursoNombre}>
                <span aria-hidden="true">{fila.icono}</span>
                {fila.recurso}
              </div>
              <div className={styles.celdaDato} data-label="Importación UE">
                <span className={styles.porcentaje}>{fila.importacion}</span>
              </div>
              <div className={`${styles.celdaDato} ${styles.celdaProveedor}`} data-label="Principal proveedor">
                <span>{fila.proveedor}</span>
              </div>
              <div className={styles.celdaDato} data-label="En la ley">
                <EtiquetaCrma estatus={fila.crma} />
              </div>
            </div>
          ))}
        </div>
        <p className={styles.fuente}>
          Importación: petróleo y gas, Eurostat (2023); litio (refinado), tierras raras y cobre
          (extracción), Comisión Europea, <em>Study on the Critical Raw Materials for the EU 2023</em>{' '}
          (media de 2016-2020). Proveedores: Eurostat (2024; petróleo por valor, gas por volumen) y
          el mismo estudio de la Comisión. «Estratégica»: figura en el anexo I del Reglamento (UE)
          2024/1252.
        </p>
      </section>

      {/* Bloque 3: Conflictos por recursos */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <h2 className={styles.sectionTitle}>Conflictos por Recursos</h2>
        <p className={styles.sectionSubtitle}>
          5 casos clave donde los recursos estratégicos han moldeado la geopolítica mundial.
        </p>

        <div className={styles.timelineConflictos}>
          {CONFLICTOS.map((conflicto) => (
            <div key={conflicto.id} className={styles.conflictoCard}>
              <button
                type="button"
                className={styles.conflictoHeader}
                onClick={() => toggleConflicto(conflicto.id)}
                aria-expanded={conflictoAbierto === conflicto.id}
                aria-controls={`conflicto-body-${conflicto.id}`}
              >
                <span className={styles.conflictoIcono} aria-hidden="true">{conflicto.icono}</span>
                <span className={styles.conflictoTitulo}>{conflicto.titulo}</span>
                <span className={styles.conflictoFecha}>{conflicto.fecha}</span>
                <span
                  className={`${styles.conflictoChevron} ${conflictoAbierto === conflicto.id ? styles.abierto : ''}`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>
              {conflictoAbierto === conflicto.id && (
                <div
                  id={`conflicto-body-${conflicto.id}`}
                  className={styles.conflictoBody}
                >
                  {conflicto.descripcion}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bloque 4: Transición energética */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <h2 className={styles.sectionTitle}>Transición Energética y Nuevas Dependencias</h2>
        <p className={styles.sectionSubtitle}>
          La energía verde requiere minerales. Demanda en 2040 frente a 2023 según la AIE
          (Global Critical Minerals Outlook 2024), en su escenario de cero emisiones netas (NZE),
          el más exigente; con las políticas actuales el crecimiento que proyecta es menor.
        </p>

        <div className={styles.chartContainer}>
          <Bar data={chartData} options={chartOptions} aria-label={DESCRIPCION_GRAFICO} />
        </div>

        <table className={styles.tablaDatos}>
          <caption>Datos del gráfico (AIE, Global Critical Minerals Outlook 2024, escenario NZE)</caption>
          <thead>
            <tr>
              <th scope="col">Mineral</th>
              <th scope="col">Demanda en 2040 frente a 2023</th>
            </tr>
          </thead>
          <tbody>
            {PROYECCION_AIE.map((p) => (
              <tr key={p.mineral}>
                <th scope="row">{p.mineral}</th>
                <td>
                  {p.formulacion.charAt(0).toUpperCase() + p.formulacion.slice(1)} (×{formatNumber(p.multiplicador, 0)})
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className={styles.mensajeClave}>
          &ldquo;La transición verde crea nuevas dependencias de minerales críticos concentrados
          en pocos países. Descarbonizar no elimina la geopolítica de los recursos: la transforma.&rdquo;
        </p>
      </section>

      {/* EducationalSection */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <EducationalSection
          title="¿Qué son los recursos estratégicos y por qué importan?"
          subtitle="Petróleo, litio, tierras raras y la nueva geopolítica de la energía"
        >
          <p>
            Los <strong>recursos estratégicos</strong> son materias primas cuyo acceso resulta
            crítico para la economía, la seguridad nacional o la soberanía tecnológica de un país
            o bloque. No son solo energéticos (petróleo, gas): incluyen minerales industriales
            como el litio, el cobalto o las tierras raras.
          </p>

          <h4>Reservas no es lo mismo que recursos</h4>
          <p>
            Las <strong>reservas</strong> son la parte de un yacimiento que se puede extraer hoy con
            rentabilidad y con la tecnología disponible; los <strong>recursos</strong> incluyen
            además lo identificado que aún no cumple esas condiciones. Por eso un país puede tener
            grandes recursos y ninguna reserva declarada, como le ocurre a Bolivia con el litio.
          </p>

          <h4>El &ldquo;Triángulo del Litio&rdquo; y por qué importa</h4>
          <p>
            Argentina, Bolivia y Chile forman el llamado Triángulo del Litio. Chile y Argentina
            reúnen el 37{NB}% de las reservas mundiales (USGS, Mineral Commodity Summaries 2026);
            Bolivia no declara reservas, pero sí grandes recursos, y contando los recursos los tres
            países suman en torno al 43{NB}% del total mundial. El refinado y la fabricación de
            baterías se concentran, en cambio, en China, y China, EE. UU. y la UE compiten por
            contratos de suministro a largo plazo.
          </p>

          <h4>La Ley de Materias Primas Críticas de la UE (Reglamento (UE) 2024/1252)</h4>
          <p>
            Propuesta en 2023 y aprobada en abril de 2024, la <strong>Critical Raw Materials Act</strong>{' '}
            fija para 2030 unas referencias (<em>benchmarks</em>) sobre el consumo anual de la UE de
            materias primas estratégicas: el 10{NB}% de la extracción, el 40{NB}% de la transformación
            y el 25{NB}% del reciclado deben hacerse dentro de la UE, y ningún país tercero debe
            aportar más del 65{NB}% de cada una. La ley identifica 34 materias primas fundamentales,
            de las que 17 son estratégicas, entre ellas el litio, el cobalto, el cobre, el grafito
            natural y las tierras raras para imanes.
          </p>

          <h4>Cómo diversifica Europa sus proveedores</h4>
          <p>
            Tras la crisis del gas de 2022, Europa aceleró tres estrategias: diversificación
            geográfica (más gas noruego y más GNL, sobre todo de EE. UU.), asociaciones estratégicas
            de materias primas —memorandos no vinculantes con más de una decena de países desde
            2021, entre ellos Chile, Argentina, Namibia, Kazajistán y Australia— y aceleración de las
            renovables para reducir la demanda de combustibles fósiles.
          </p>

          <div className={styles.warningBox}>
            La dependencia de un solo proveedor para un recurso crítico es una vulnerabilidad
            estructural, porque el suministro puede usarse como instrumento de presión política.
            Dos ejemplos recientes: la caída del gas ruso en Europa a partir de 2022 y los controles
            de China a la exportación de tierras raras de 2025.
          </div>
        </EducationalSection>
      </section>

      <RelatedApps apps={getRelatedApps('visualizador-geopolitica-recursos')} />
      <ShareCard appName="visualizador-geopolitica-recursos" />
      <Footer appName="visualizador-geopolitica-recursos" />
    </div>
  );
}
