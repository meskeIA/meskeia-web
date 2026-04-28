'use client';
import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import styles from './GeopoliticaEnergetica.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type EnergiaToggle = 'gas' | 'petroleo' | 'electricidad';
type PeriodoToggle = 'pre2022' | 'post2022';
type MixAnio = 2010 | 2015 | 2019 | 2023;
type InfraToggle = 'gasoductos' | 'lng';
type InversionToggle = 'inversion' | 'capacidad';
type EstadoInfra = 'operativo' | 'suspendido' | 'construccion';

interface FlujoOrigen {
  origen: string;
  color: string;
  pre2022: number;
  post2022: number;
}

interface RegionMix {
  region: string;
  data: Record<MixAnio, number[]>;
}

interface Infraestructura {
  nombre: string;
  tipo: 'gasoducto' | 'lng';
  origen: string;
  destino: string;
  capacidad: string;
  estado: EstadoInfra;
}

interface InversionRegion {
  region: string;
  inversion2023: number;
  capacidadGW: number;
  neutralidad: string;
}

// ─── Datos: Flujos de gas UE (Eurostat / IEA 2023) ────────────────────────────
const FLUJOS_GAS: FlujoOrigen[] = [
  { origen: 'Noruega', color: '#2E86AB', pre2022: 24, post2022: 32 },
  { origen: 'Rusia (gasoducto)', color: '#e74c3c', pre2022: 38, post2022: 8 },
  { origen: 'Argelia', color: '#f39c12', pre2022: 11, post2022: 12 },
  { origen: 'GNL (Qatar, EEUU...)', color: '#48A9A6', pre2022: 20, post2022: 40 },
  { origen: 'Otros/producción UE', color: '#95a5a6', pre2022: 7, post2022: 8 },
];

const FLUJOS_PETROLEO: FlujoOrigen[] = [
  { origen: 'Rusia', color: '#e74c3c', pre2022: 27, post2022: 9 },
  { origen: 'Oriente Medio', color: '#f39c12', pre2022: 15, post2022: 18 },
  { origen: 'Noruega', color: '#2E86AB', pre2022: 12, post2022: 14 },
  { origen: 'EEUU / Canadá', color: '#3498db', pre2022: 11, post2022: 20 },
  { origen: 'África Occidental', color: '#e67e22', pre2022: 10, post2022: 11 },
  { origen: 'Kazajistán / Azerbaiyán', color: '#9b59b6', pre2022: 9, post2022: 10 },
  { origen: 'Otros', color: '#95a5a6', pre2022: 16, post2022: 18 },
];

const FLUJOS_ELECTRICIDAD: FlujoOrigen[] = [
  { origen: 'Generación interna UE', color: '#2E86AB', pre2022: 88, post2022: 90 },
  { origen: 'Noruega (hidro)', color: '#48A9A6', pre2022: 5, post2022: 5 },
  { origen: 'Suiza', color: '#7FB3D3', pre2022: 4, post2022: 3 },
  { origen: 'Ucrania / otros', color: '#95a5a6', pre2022: 3, post2022: 2 },
];

// ─── Datos: Mix energético por región (% de generación eléctrica) ─────────────
// Orden colores: carbón, gas, nuclear, hidro, solar/eólica, otras
const COLORES_MIX = ['#37474f', '#ef6c00', '#7c4dff', '#0288d1', '#43a047', '#90a4ae'];
const FUENTES_MIX = ['Carbón', 'Gas', 'Nuclear', 'Hidráulica', 'Solar/Eólica', 'Otras'];

const MIX_REGIONES: RegionMix[] = [
  {
    region: 'UE',
    data: {
      2010: [25, 23, 27, 13, 6, 6],
      2015: [21, 19, 26, 14, 12, 8],
      2019: [15, 21, 25, 14, 18, 7],
      2023: [12, 19, 22, 14, 26, 7],
    },
  },
  {
    region: 'EEUU',
    data: {
      2010: [45, 24, 19, 6, 3, 3],
      2015: [33, 33, 19, 6, 6, 3],
      2019: [24, 38, 20, 7, 8, 3],
      2023: [17, 43, 19, 7, 13, 1],
    },
  },
  {
    region: 'China',
    data: {
      2010: [78, 2, 2, 16, 1, 1],
      2015: [72, 3, 3, 19, 3, 0],
      2019: [62, 3, 5, 17, 11, 2],
      2023: [54, 3, 5, 14, 22, 2],
    },
  },
  {
    region: 'India',
    data: {
      2010: [68, 7, 3, 12, 4, 6],
      2015: [67, 5, 3, 12, 7, 6],
      2019: [63, 4, 3, 11, 12, 7],
      2023: [55, 4, 3, 10, 21, 7],
    },
  },
  {
    region: 'Oriente Medio',
    data: {
      2010: [1, 62, 0, 1, 1, 35],
      2015: [1, 59, 0, 1, 3, 36],
      2019: [1, 57, 0, 2, 5, 35],
      2023: [1, 54, 0, 2, 8, 35],
    },
  },
  {
    region: 'África',
    data: {
      2010: [38, 11, 2, 15, 2, 32],
      2015: [36, 12, 2, 16, 4, 30],
      2019: [34, 13, 2, 16, 7, 28],
      2023: [30, 14, 2, 17, 11, 26],
    },
  },
];

const ANIOS_MIX: MixAnio[] = [2010, 2015, 2019, 2023];
const ANIO_IDX: Record<number, MixAnio> = { 0: 2010, 1: 2015, 2: 2019, 3: 2023 };

// ─── Datos: Infraestructuras clave ───────────────────────────────────────────
const INFRAESTRUCTURAS: Infraestructura[] = [
  { nombre: 'Nord Stream 1', tipo: 'gasoducto', origen: 'Rusia', destino: 'Alemania', capacidad: '55 bcm/año', estado: 'suspendido' },
  { nombre: 'Nord Stream 2', tipo: 'gasoducto', origen: 'Rusia', destino: 'Alemania', capacidad: '55 bcm/año', estado: 'suspendido' },
  { nombre: 'TurkStream', tipo: 'gasoducto', origen: 'Rusia', destino: 'Turquía/Balcanes', capacidad: '31,5 bcm/año', estado: 'operativo' },
  { nombre: 'Medgaz', tipo: 'gasoducto', origen: 'Argelia', destino: 'España', capacidad: '10,5 bcm/año', estado: 'operativo' },
  { nombre: 'Trans-Adriatic Pipeline (TAP)', tipo: 'gasoducto', origen: 'Azerbaiyán', destino: 'Italia/Grecia', capacidad: '10 bcm/año', estado: 'operativo' },
  { nombre: 'Baltic Pipe', tipo: 'gasoducto', origen: 'Noruega', destino: 'Polonia/Dinamarca', capacidad: '10 bcm/año', estado: 'operativo' },
  { nombre: 'EUGAL', tipo: 'gasoducto', origen: 'Alemania', destino: 'Rep. Checa', capacidad: '51 bcm/año', estado: 'operativo' },
  { nombre: 'Terminal GNL Wilhelmshaven', tipo: 'lng', origen: 'Qatar / EEUU / Noruega', destino: 'Alemania', capacidad: '5 bcm/año', estado: 'operativo' },
  { nombre: 'Terminal GNL Dunkerque', tipo: 'lng', origen: 'Qatar / EEUU', destino: 'Francia', capacidad: '13 bcm/año', estado: 'operativo' },
  { nombre: 'Terminal GNL Barcelona', tipo: 'lng', origen: 'Qatar / EEUU / Argelia', destino: 'España', capacidad: '16 bcm/año', estado: 'operativo' },
  { nombre: 'Terminal GNL Sines', tipo: 'lng', origen: 'Qatar / EEUU / Nigeria', destino: 'Portugal', capacidad: '8 bcm/año', estado: 'operativo' },
  { nombre: 'Baltic LNG (Rusia)', tipo: 'lng', origen: 'Rusia', destino: 'Global', capacidad: '13 bcm/año', estado: 'construccion' },
];

// ─── Datos: Inversión renovable y capacidad ───────────────────────────────────
const INVERSION_REGIONES: InversionRegion[] = [
  { region: 'China', inversion2023: 670, capacidadGW: 1480, neutralidad: '2060' },
  { region: 'EEUU', inversion2023: 303, capacidadGW: 390, neutralidad: '2050' },
  { region: 'Europa', inversion2023: 264, capacidadGW: 620, neutralidad: '2050 (UE)' },
  { region: 'India', inversion2023: 83, capacidadGW: 185, neutralidad: '2070' },
  { region: 'Resto del mundo', inversion2023: 130, capacidadGW: 280, neutralidad: 'Variable' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const estadoClass = (estado: EstadoInfra): string => {
  if (estado === 'operativo') return styles.statusOperativo;
  if (estado === 'suspendido') return styles.statusSuspendido;
  return styles.statusConstruccion;
};

const estadoLabel = (estado: EstadoInfra): string => {
  if (estado === 'operativo') return 'Operativo';
  if (estado === 'suspendido') return 'Suspendido';
  return 'En construcción';
};

const inversionMax = Math.max(...INVERSION_REGIONES.map((r) => r.inversion2023));
const capacidadMax = Math.max(...INVERSION_REGIONES.map((r) => r.capacidadGW));

// ─── Componente principal ─────────────────────────────────────────────────────
export default function VisualizadorGeopoliticaEnergetica() {
  const [energiaToggle, setEnergiaToggle] = useState<EnergiaToggle>('gas');
  const [periodoToggle, setPeriodoToggle] = useState<PeriodoToggle>('post2022');
  const [mixAnioIdx, setMixAnioIdx] = useState<number>(3);
  const [infraToggle, setInfraToggle] = useState<InfraToggle>('gasoductos');
  const [inversionToggle, setInversionToggle] = useState<InversionToggle>('inversion');

  const mixAnio = ANIO_IDX[mixAnioIdx];

  const flujoActual =
    energiaToggle === 'gas'
      ? FLUJOS_GAS
      : energiaToggle === 'petroleo'
        ? FLUJOS_PETROLEO
        : FLUJOS_ELECTRICIDAD;

  const infraFiltradas = INFRAESTRUCTURAS.filter((i) =>
    infraToggle === 'gasoductos' ? i.tipo === 'gasoducto' : i.tipo === 'lng'
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Geopolítica Energética</h1>
        <p>
          Flujos, dependencias e infraestructuras del sistema energético global.
          Datos: IEA, Eurostat, IRENA, BP Statistical Review.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="geopolitica-energetica"
      />

      {/* ── BLOQUE 1: Dependencias energéticas de la UE ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dependencias energéticas de la UE</h2>
        <p className={styles.sectionSubtitle}>
          Origen de las importaciones según fuente energética. Comparativa pre y post-2022.
          Fuente: Eurostat Energy Statistics / IEA.
        </p>

        {/* Toggle de tipo de energía */}
        <div className={styles.toggleTabs}>
          {(['gas', 'petroleo', 'electricidad'] as EnergiaToggle[]).map((e) => (
            <button
              key={e}
              className={`${styles.toggleTab} ${energiaToggle === e ? styles.toggleTabActive : ''}`}
              onClick={() => setEnergiaToggle(e)}
              aria-pressed={energiaToggle === e}
            >
              {e === 'gas' ? 'Gas natural' : e === 'petroleo' ? 'Petróleo' : 'Electricidad'}
            </button>
          ))}
        </div>

        {/* Toggle de período */}
        <div className={styles.comparisonToggle}>
          <button
            className={`${styles.compBtn} ${periodoToggle === 'pre2022' ? styles.compBtnActive : ''}`}
            onClick={() => setPeriodoToggle('pre2022')}
            aria-pressed={periodoToggle === 'pre2022'}
          >
            Pre-2022 (media 2018-2021)
          </button>
          <button
            className={`${styles.compBtn} ${periodoToggle === 'post2022' ? styles.compBtnActive : ''}`}
            onClick={() => setPeriodoToggle('post2022')}
            aria-pressed={periodoToggle === 'post2022'}
          >
            Post-2022 (estimación 2023)
          </button>
        </div>

        <div className={styles.sankeyWrapper}>
          <p className={styles.sankeyTitle}>
            {energiaToggle === 'gas'
              ? 'Gas natural: origen de las importaciones de la UE (%)'
              : energiaToggle === 'petroleo'
                ? 'Petróleo: origen de las importaciones de la UE (%)'
                : 'Electricidad: origen de la generación/importación UE (%)'}
          </p>
          <div className={styles.sankeyDiagram}>
            {flujoActual.map((f) => {
              const pct = periodoToggle === 'pre2022' ? f.pre2022 : f.post2022;
              return (
                <div key={f.origen} className={styles.sankeyRow}>
                  <span className={styles.sankeyLabel}>{f.origen}</span>
                  <div className={styles.sankeyBarTrack}>
                    <div
                      className={styles.sankeyBar}
                      style={{ width: `${pct}%`, backgroundColor: f.color }}
                      role="meter"
                      aria-label={`${f.origen}: ${pct}%`}
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      {pct >= 8 ? `${pct}%` : ''}
                    </div>
                  </div>
                  <span className={styles.sankeyPct}>{pct}%</span>
                </div>
              );
            })}
          </div>
          <p className={styles.sankeyNote}>
            Los porcentajes pueden no sumar exactamente 100% por redondeo y metodologías distintas
            según fuente.
          </p>
        </div>
      </section>

      <hr className={styles.separator} />

      {/* ── BLOQUE 2: Mix energético mundial ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Mix energético mundial por región</h2>
        <p className={styles.sectionSubtitle}>
          Composición de la generación eléctrica por fuente para 6 regiones del mundo.
          Desliza para ver la evolución 2010-2023. Fuente: IEA World Energy Outlook.
        </p>

        <div className={styles.mixWrapper}>
          <div className={styles.sliderRow}>
            <label htmlFor="mixSlider">Año:</label>
            <input
              id="mixSlider"
              type="range"
              min={0}
              max={3}
              step={1}
              value={mixAnioIdx}
              onChange={(e) => setMixAnioIdx(Number(e.target.value))}
              aria-label="Seleccionar año para el mix energético"
            />
            <span className={styles.sliderYear}>{mixAnio}</span>
          </div>

          <div className={styles.mixGrid}>
            {MIX_REGIONES.map((r) => {
              const vals = r.data[mixAnio];
              return (
                <div key={r.region} className={styles.mixRegionRow}>
                  <span className={styles.mixRegionLabel}>{r.region}</span>
                  <div className={styles.mixBar} role="img" aria-label={`Mix energético ${r.region} ${mixAnio}`}>
                    {vals.map((v, i) => (
                      <div
                        key={FUENTES_MIX[i]}
                        className={styles.mixBarSegment}
                        style={{ width: `${v}%`, backgroundColor: COLORES_MIX[i] }}
                        title={`${FUENTES_MIX[i]}: ${v}%`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.mixLegend} role="list" aria-label="Leyenda del mix energético">
            {FUENTES_MIX.map((f, i) => (
              <div key={f} className={styles.mixLegendItem} role="listitem">
                <span
                  className={styles.mixLegendDot}
                  style={{ backgroundColor: COLORES_MIX[i] }}
                  aria-hidden="true"
                />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className={styles.separator} />

      {/* ── BLOQUE 3: Infraestructuras clave ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Infraestructuras energéticas clave</h2>
        <p className={styles.sectionSubtitle}>
          Principales gasoductos transnacionales y terminales de regasificación GNL en Europa.
          Capacidad en bcm/año (miles de millones de m³/año).
        </p>

        <div className={styles.toggleTabs}>
          <button
            className={`${styles.toggleTab} ${infraToggle === 'gasoductos' ? styles.toggleTabActive : ''}`}
            onClick={() => setInfraToggle('gasoductos')}
            aria-pressed={infraToggle === 'gasoductos'}
          >
            Gasoductos
          </button>
          <button
            className={`${styles.toggleTab} ${infraToggle === 'lng' ? styles.toggleTabActive : ''}`}
            onClick={() => setInfraToggle('lng')}
            aria-pressed={infraToggle === 'lng'}
          >
            Terminales GNL
          </button>
        </div>

        <div className={styles.infraWrapper}>
          <div className={styles.infraDiagram}>
            <table className={styles.infraTable}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Capacidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {infraFiltradas.map((inf) => (
                  <tr key={inf.nombre}>
                    <td>
                      <strong>{inf.nombre}</strong>
                    </td>
                    <td>{inf.origen}</td>
                    <td>{inf.destino}</td>
                    <td>{inf.capacidad}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${estadoClass(inf.estado)}`}>
                        {estadoLabel(inf.estado)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <hr className={styles.separator} />

      {/* ── BLOQUE 4: Inversión renovable ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Transición energética: inversión por región (2023)</h2>
        <p className={styles.sectionSubtitle}>
          Inversión en energías renovables y capacidad instalada acumulada. Compromisos de
          neutralidad carbono como declaraciones de intención. Fuente: IRENA / IEA / BloombergNEF.
        </p>

        {/* Datos destacados */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>$1,45B</span>
            <span className={styles.statLabel}>Inversión global renovables 2023 (bn USD)</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>3.380 GW</span>
            <span className={styles.statLabel}>Capacidad renovable acumulada mundial</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>46%</span>
            <span className={styles.statLabel}>Cuota China de la inversión global</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>+9,6%</span>
            <span className={styles.statLabel}>Capacidad renovable añadida en 2023 vs 2022</span>
          </div>
        </div>

        <div className={styles.inversionWrapper}>
          <div className={styles.inversionToggle}>
            <button
              className={`${styles.toggleTab} ${inversionToggle === 'inversion' ? styles.toggleTabActive : ''}`}
              onClick={() => setInversionToggle('inversion')}
              aria-pressed={inversionToggle === 'inversion'}
            >
              Inversión 2023 (bn USD)
            </button>
            <button
              className={`${styles.toggleTab} ${inversionToggle === 'capacidad' ? styles.toggleTabActive : ''}`}
              onClick={() => setInversionToggle('capacidad')}
              aria-pressed={inversionToggle === 'capacidad'}
            >
              Capacidad instalada (GW)
            </button>
          </div>

          <div className={styles.barChartH}>
            {INVERSION_REGIONES.map((r) => {
              const valor =
                inversionToggle === 'inversion' ? r.inversion2023 : r.capacidadGW;
              const maximo = inversionToggle === 'inversion' ? inversionMax : capacidadMax;
              const pct = Math.round((valor / maximo) * 100);
              const etiqueta =
                inversionToggle === 'inversion'
                  ? `$${r.inversion2023}bn`
                  : `${r.capacidadGW} GW`;
              return (
                <div key={r.region} className={styles.barChartRow}>
                  <span className={styles.barChartLabel}>{r.region}</span>
                  <div className={styles.barChartTrack}>
                    <div
                      className={styles.barChartFill}
                      style={{ width: `${pct}%`, backgroundColor: '#2E86AB' }}
                      role="meter"
                      aria-label={`${r.region}: ${etiqueta}`}
                      aria-valuenow={valor}
                      aria-valuemin={0}
                      aria-valuemax={maximo}
                    >
                      {pct >= 20 && <span>{etiqueta}</span>}
                    </div>
                  </div>
                  <span className={styles.barChartValue}>
                    {pct < 20 ? etiqueta : ''} · {r.neutralidad}
                  </span>
                </div>
              );
            })}
          </div>

          <p className={styles.inversionSource}>
            Neutral. carbono: declaraciones de intención de cada bloque — no garantías de
            cumplimiento. IRENA/IEA 2023.
          </p>
        </div>
      </section>

      {/* ── SECCIÓN EDUCATIVA v2.0 ── */}
      <EducationalSection
        title="Geopolítica Energética: Flujos, Dependencias e Infraestructuras"
        subtitle="Cómo se produce, transporta y consume la energía que mueve el mundo"
        icon="⚡"
      >
        <div>
          <h3>¿Qué es la seguridad energética?</h3>
          <p>
            La Agencia Internacional de la Energía (IEA) define la seguridad energética a partir de
            cuatro dimensiones: <strong>disponibilidad</strong> (suficiente oferta física),{' '}
            <strong>accesibilidad</strong> (infraestructuras para distribuirla),{' '}
            <strong>asequibilidad</strong> (precios que no comprometan la economía) y{' '}
            <strong>sostenibilidad</strong> (compatibilidad con objetivos climáticos). Un país que
            controla sus fuentes de energía dispone de mayor margen de maniobra en política exterior
            y menor vulnerabilidad ante interrupciones de suministro.
          </p>

          <h3>La geografía de los combustibles fósiles</h3>
          <p>
            Los combustibles fósiles están distribuidos de forma desigual. El 55% de las reservas
            probadas de petróleo convencional se concentran en Oriente Medio (Arabia Saudí, Irak,
            Irán, Kuwait, EAU). Las reservas de gas natural están más diversificadas: Rusia,
            Irán y Qatar acumulan en torno al 50% de las reservas mundiales. Por contraste, el
            consumo está concentrado en Asia-Pacífico (38%), Europa (12%) y América del Norte
            (21%). Esta asimetría entre donde se produce y donde se consume es la base estructural
            de la geopolítica energética.
          </p>

          <h3>El gas natural licuado y la flexibilización de las rutas</h3>
          <p>
            Hasta la década de 2010, el gas se transportaba casi exclusivamente por gasoducto,
            vinculando geográficamente a productor y consumidor. La expansión del comercio de{' '}
            <strong>gas natural licuado (GNL)</strong> —gas enfriado a -162 °C y transportado en
            buques metaneros— ha flexibilizado las rutas de suministro: cualquier exportador
            con terminal de licuefacción puede acceder a cualquier importador con terminal de
            regasificación. En 2023, Europa recibió GNL procedente de EEUU (~50%), Qatar (~25%)
            y Noruega, Nigeria y otros. Esta mayor diversificación implica también mayor exposición
            a la volatilidad del precio global del GNL.
          </p>

          <h3>La transición energética como reconfiguración geopolítica</h3>
          <p>
            La electrificación masiva y el crecimiento de las renovables están alterando los
            patrones de dependencia energética. Los países sin grandes reservas de combustibles
            fósiles pero con abundante sol y viento —España, Chile, Marruecos, India— ganan
            ventaja relativa en el nuevo mapa. Sin embargo, la transición crea nuevas dependencias:
            la fabricación de paneles solares (concentrada en China), la producción de
            aerogeneradores y, sobre todo, los minerales críticos.
          </p>

          <h3>Minerales críticos para las energías renovables</h3>
          <p>
            Las baterías de litio-ion (vehículos eléctricos, almacenamiento eléctrico) requieren
            litio, cobalto, níquel y manganeso. Los imanes de turbinas eólicas y motores
            eléctricos usan <strong>tierras raras</strong> (neodimio, disprosio). En 2023, China
            producía el 70% del refinado de litio, el 73% del refinado de cobalto y el 92% del
            refinado de tierras raras. La IEA señala este grado de concentración como un riesgo
            estructural para la transición, análogo al que representó la dependencia del gas ruso
            para Europa.
          </p>

          <h3>Interdependencia económica como factor de estabilidad</h3>
          <p>
            La teoría de la <em>paz democrática</em> y los estudios de economía política
            internacional sugieren que los vínculos comerciales profundos entre países —incluidos
            los energéticos— elevan el coste de los conflictos. Sin embargo, la dependencia
            asimétrica (cuando un actor necesita más al otro que viceversa) puede convertirse en
            herramienta de presión. El análisis de los flujos energéticos requiere distinguir entre
            interdependencia simétrica —que puede ser estabilizadora— e interdependencia asimétrica
            —que puede generar vulnerabilidades. Los datos de las secciones anteriores permiten
            identificar qué relaciones caen en cada categoría.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota sobre las fuentes de datos</strong>
            Los datos de flujos energéticos provienen de la Agencia Internacional de la Energía
            (IEA) y Eurostat. Las cifras de mix energético son estimaciones con diferentes
            metodologías según la fuente. Los compromisos de neutralidad carbono son declaraciones
            de intención, no garantías. Los datos de infraestructuras reflejan el estado publicado
            por operadores y medios especializados; las capacidades reales de operación pueden
            diferir de las nominales. Año de referencia general: 2023.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-geopolitica-energetica')} />
      <ShareCard appName="visualizador-geopolitica-energetica" />
      <Footer appName="visualizador-geopolitica-energetica" />
    </div>
  );
}
