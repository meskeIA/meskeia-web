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
import styles from './CadenasSuministro.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface ComponenteSmartphone {
  id: string;
  nombre: string;
  icono: string;
  pais: string;
  empresa: string;
  cosте: string;
  curioso: string;
  x: number;
  y: number;
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

const COMPONENTES: ComponenteSmartphone[] = [
  {
    id: 'pantalla',
    nombre: 'Pantalla OLED',
    icono: '📱',
    pais: 'Corea del Sur / China',
    empresa: 'Samsung Display, BOE Technology (China), LG Display',
    cosте: '~25–30%',
    curioso:
      'Una pantalla OLED de alta gama contiene más de 800 millones de subpíxeles. Samsung fabrica pantallas para Apple aunque sean competidores directos en smartphones.',
    x: 90,
    y: 55,
  },
  {
    id: 'procesador',
    nombre: 'Procesador (SoC)',
    icono: '⚙️',
    pais: 'Diseñado en EEUU/UK — Fabricado en Taiwán/Corea',
    empresa: 'Apple / Qualcomm (diseño) → TSMC / Samsung Foundry (fabricación)',
    cosте: '~20–25%',
    curioso:
      'TSMC fabrica chips para Apple, AMD, NVIDIA, Qualcomm y decenas de empresas más — aunque no diseña ninguno. El 92% de los chips más avanzados del mundo se fabrican en Taiwán.',
    x: 270,
    y: 55,
  },
  {
    id: 'bateria',
    nombre: 'Batería de litio',
    icono: '🔋',
    pais: 'Litio de Chile/Australia — Celdas en China',
    empresa: 'CATL, BYD, LG Energy Solution, Samsung SDI',
    cosте: '~10–15%',
    curioso:
      'El litio del Triángulo del Litio (Chile, Argentina, Bolivia) representa el 60% de las reservas mundiales. Sin embargo, el 75% de la producción de celdas de batería ocurre en China.',
    x: 450,
    y: 55,
  },
  {
    id: 'camaras',
    nombre: 'Módulo de cámaras',
    icono: '📷',
    pais: 'Japón / China / Suecia',
    empresa: 'Sony Semiconductor (sensores), Largan Precision (lentes), Sunny Optical',
    cosте: '~10–12%',
    curioso:
      'El sensor de imagen Sony IMX es tan dominante que incluso los iPhone y Galaxy usan sensores Sony. Sony controla ~45% del mercado mundial de sensores CMOS para smartphones.',
    x: 90,
    y: 175,
  },
  {
    id: 'memoria',
    nombre: 'Memoria flash (NAND)',
    icono: '💾',
    pais: 'Japón / Corea del Sur / China',
    empresa: 'Kioxia (Japón), SK Hynix (Corea), Samsung, Micron (EEUU)',
    cosте: '~8–12%',
    curioso:
      'Un smartphone de 256 GB contiene capas de memoria apiladas verticalmente (3D NAND) con hasta 232 capas de células de memoria. En 2020, una inundación en una fábrica de Kioxia afectó al 30% del suministro mundial de NAND.',
    x: 270,
    y: 175,
  },
  {
    id: 'antenas',
    nombre: 'Antenas 5G',
    icono: '📡',
    pais: 'Finlandia / Suecia / EEUU',
    empresa: 'Qualcomm (módems), Ericsson, Nokia (tecnología base), Murata (componentes RF)',
    cosте: '~5–8%',
    curioso:
      'Un smartphone 5G puede contener hasta 15 antenas distintas (Wi-Fi, Bluetooth, GPS, 5G mmWave, NFC). El diseño de antenas en metales tan finos requiere simulaciones de campo electromagnético durante meses.',
    x: 450,
    y: 175,
  },
  {
    id: 'chasis',
    nombre: 'Chasis de aluminio',
    icono: '🏗️',
    pais: 'China (fabricación) — Bauxita de Guinea/Australia',
    empresa: 'Foxconn, Pegatron, BYD Electronics (mecanizado CNC)',
    cosте: '~5–7%',
    curioso:
      'El chasis de un iPhone requiere más de 100 operaciones de fresado CNC. El aluminio 7075 aeroespacial empleado es tan duro que las máquinas CNC desgastan sus brocas cada pocos centenares de piezas.',
    x: 90,
    y: 295,
  },
  {
    id: 'ensamblaje',
    nombre: 'Ensamblaje final',
    icono: '🔧',
    pais: 'China / India / Vietnam',
    empresa: 'Foxconn (Hon Hai), Pegatron, Wingtech — plantas en Zhengzhou, Chennai, Hanói',
    cosте: '~3–5%',
    curioso:
      'La fábrica de Foxconn en Zhengzhou ("iPhone City") emplea 350.000 personas y puede fabricar 500.000 iPhones al día. A pesar de la complejidad del producto, el ensamblaje manual representa solo el 3–5% del coste total.',
    x: 270,
    y: 295,
  },
];

// ─────────────────────────────────────────────
// Datos: Disrupciones históricas
// ─────────────────────────────────────────────

const DISRUPCIONES: DisrupcionHistorica[] = [
  {
    anio: '2020–2022',
    titulo: 'Crisis global de semiconductores',
    resumen: 'La pandemia disparó la demanda de electrónicos mientras cerraban las fábricas. La industria automovilística, que había cancelado pedidos de chips en 2020, no pudo recuperar su lugar en la cola de producción.',
    duracion: '~2,5 años',
    coste: '$210.000M pérdidas industria auto',
    industrias: 'Automoción, electrónica de consumo, electrodomésticos, defensa',
    leccion:
      'La filosofía just-in-time sin inventario mínimo de componentes estratégicos puede paralizar industrias enteras. Varios países aprobaron subsidios billonarios (CHIPS Act en EEUU, European Chips Act) para relocalizar fabricación.',
  },
  {
    anio: 'Marzo 2021',
    titulo: 'Bloqueo del Canal de Suez (Ever Given)',
    resumen: 'El portacontenedores Ever Given (400 m de eslora) encalló durante 6 días, bloqueando el paso de 12% del comercio mundial.',
    duracion: '6 días',
    coste: '$9.600M/día en comercio bloqueado',
    industrias: 'Petróleo, electrónica, textil, alimentación, automóvil',
    leccion:
      'Una única vía marítima concentra un porcentaje enorme del comercio global. El incidente aceleró el debate sobre la resiliencia de las rutas de transporte y la diversificación de proveedores logísticos.',
  },
  {
    anio: 'Q2 2020',
    titulo: 'COVID-19: cierre de fábricas en Asia',
    resumen: 'Los cierres de Wuhan y la región del Delta del Río Perla interrumpieron la producción de electrónica, textil y componentes para todo el mundo en el segundo trimestre de 2020.',
    duracion: '~3–4 meses (cierre masivo)',
    coste: 'Caída 30% comercio global en Q2 2020',
    industrias: 'Toda la manufactura: textil, electrónica, farmacéutica, alimentación',
    leccion:
      'La hiperdependencia de una única región para manufactura expone a la economía global a riesgos sistémicos. La pandemia fue el detonante que puso la resiliencia de cadenas de suministro en la agenda política de todos los gobiernos.',
  },
  {
    anio: 'Octubre 2011',
    titulo: 'Inundaciones en Tailandia',
    resumen: 'Las peores inundaciones en décadas anegaron la región de Ayutthaya, donde se concentraba gran parte de la producción mundial de discos duros (HDD).',
    duracion: '~4 meses',
    coste: '$45.000M en daños económicos',
    industrias: 'Almacenamiento de datos, electrónica personal, servidores',
    leccion:
      'Tailandia concentraba el 45% de la producción mundial de HDDs. La concentración geográfica extrema de un componente convierte un desastre natural local en una crisis tecnológica global. El precio de los discos duros se triplicó durante 6 meses.',
  },
  {
    anio: 'Marzo 2011',
    titulo: 'Terremoto y tsunami de Japón (Tōhoku)',
    resumen: 'El terremoto de 9.0 y el tsunami subsiguiente destruyeron instalaciones industriales clave en el norte de Japón, interrumpiendo el suministro de más de 500 componentes para la industria automovilística global.',
    duracion: '~6 meses para recuperación parcial',
    coste: '$210.000M daños totales',
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
      'Intel construye dos gigafábricas en Ohio (EEUU) con $20.000M de inversión bajo el CHIPS Act. Apple trasladó líneas de ensamblaje de Mac Pro a Texas.',
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
    if (nivelDisrupcion < 75) return 'Stocks al 40% — producción sostenida aún';
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
              viewBox="0 0 540 380"
              className={styles.svgDiagrama}
              aria-label="Diagrama interactivo de componentes de un smartphone con 8 componentes clicables"
              role="img"
            >
              <defs>
                <linearGradient id="gradFondo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8F4F8" />
                  <stop offset="100%" stopColor="#D0EAF2" />
                </linearGradient>
                <linearGradient id="gradComp" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2E86AB" />
                  <stop offset="100%" stopColor="#48A9A6" />
                </linearGradient>
                <linearGradient id="gradCompActivo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1A6A8A" />
                  <stop offset="100%" stopColor="#2E8A86" />
                </linearGradient>
              </defs>

              {/* Fondo */}
              <rect x="0" y="0" width="540" height="380" rx="14" fill="url(#gradFondo)" />

              {/* Título del diagrama */}
              <text x="270" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2E86AB">
                Componentes globales de un smartphone moderno
              </text>

              {/* Líneas de conexión al centro */}
              {COMPONENTES.map((comp) => (
                <line
                  key={`linea-${comp.id}`}
                  x1={comp.x + 55}
                  y1={comp.y + 28}
                  x2={270}
                  y2={190}
                  stroke="#2E86AB"
                  strokeWidth="1"
                  strokeOpacity="0.25"
                  strokeDasharray="4 3"
                />
              ))}

              {/* Smartphone central */}
              <rect x="220" y="145" width="100" height="90" rx="10" fill="#2E86AB" opacity="0.15" />
              <rect x="228" y="153" width="84" height="74" rx="7" fill="#2E86AB" opacity="0.25" />
              <text x="270" y="193" textAnchor="middle" fontSize="18" fill="#2E86AB">📱</text>
              <text x="270" y="210" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2E86AB">
                ~40 países
              </text>
              <text x="270" y="222" textAnchor="middle" fontSize="8" fill="#2E86AB" opacity="0.8">
                involucrados
              </text>

              {/* Botones de componentes */}
              {COMPONENTES.map((comp) => {
                const isActivo = componenteActivo === comp.id;
                return (
                  <g
                    key={comp.id}
                    onClick={() => setComponenteActivo(isActivo ? null : comp.id)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    aria-label={`Ver detalles de ${comp.nombre}`}
                    aria-pressed={isActivo}
                  >
                    <rect
                      x={comp.x}
                      y={comp.y}
                      width="110"
                      height="56"
                      rx="8"
                      fill={isActivo ? 'url(#gradCompActivo)' : 'url(#gradComp)'}
                      opacity={isActivo ? 1 : 0.82}
                    />
                    <text
                      x={comp.x + 55}
                      y={comp.y + 20}
                      textAnchor="middle"
                      fontSize="16"
                      fill="white"
                    >
                      {comp.icono}
                    </text>
                    <text
                      x={comp.x + 55}
                      y={comp.y + 36}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="700"
                      fill="white"
                    >
                      {comp.nombre.length > 16 ? comp.nombre.slice(0, 15) + '…' : comp.nombre}
                    </text>
                    <text
                      x={comp.x + 55}
                      y={comp.y + 48}
                      textAnchor="middle"
                      fontSize="7.5"
                      fill="white"
                      opacity="0.88"
                    >
                      {comp.pais.split('/')[0].trim().slice(0, 20)}
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
                  <span className={styles.costeLabel}>Coste aproximado del total del dispositivo:</span>
                  <span className={styles.costeBadge}>{componente.cosте}</span>
                </div>
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
              <span className={styles.sliderValor}>{nivelDisrupcion}%</span>
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
                  <p className={styles.jitSubnombre}>Toyota Production System, 1950s</p>
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
            return (
              <div
                key={i}
                className={styles.timelineItem}
                onClick={() => setDisrupcionActiva(isActiva ? null : i)}
                role="listitem"
                aria-expanded={isActiva}
              >
                <div className={styles.timelinePunto} aria-hidden="true" />
                <div className={`${styles.timelineCard} ${isActiva ? styles.timelineCardActiva : ''}`}>
                  <p className={styles.timelineAnio}>{d.anio}</p>
                  <h3 className={styles.timelineTitulo}>{d.titulo}</h3>
                  <p className={styles.timelineResumen}>{d.resumen}</p>

                  {isActiva && (
                    <div className={styles.timelineDetalle}>
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
          <strong>Tendencia 2020–2024:</strong> Según McKinsey Global Institute, el 81% de las empresas
          manufactureras globales han comenzado a diversificar su base de proveedores desde 2020.
          Alrededor del 45% ha movido parte de su producción a nuevas geografías, y se espera
          que hasta el 26% del comercio mundial se relocalice en la próxima década.
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
              interdependientes. Una empresa como Apple tiene más de 200 proveedores directos
              y miles de proveedores de segundo y tercer nivel distribuidos por 43 países.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>La revolución del contenedor (Malcolm McLean, 1956)</h4>
            <p>
              En 1956, el camionero Malcolm McLean tuvo la idea de colocar camiones enteros sobre
              barcos. El contenedor estandarizado de acero (TEU: Twenty-foot Equivalent Unit) redujo
              el coste de carga/descarga de $5,86/tonelada a $0,16/tonelada — una reducción del 97%.
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
              pedidos a proveedores. Si los supermercados incrementan sus pedidos un 5% ante
              señales de escasez, el mayorista hace pedidos de un 10% más, el fabricante de un 20%
              más, y el proveedor de materias primas puede ver pedidos con un 40% de incremento.
            </p>
            <p>
              El término fue acuñado por Jay Forrester (MIT, 1961) y popularizado por Hau Lee
              (Stanford, 1997). La solución es la visibilidad en tiempo real de la demanda en todos
              los eslabones y la reducción de lead times, algo que la digitalización e IoT están
              facilitando.
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
              Walmart usa blockchain para rastrear lechugas desde la granja hasta la tienda en
              2,2 segundos (antes tardaba 6 días). Maersk y IBM desplegaron TradeLens para
              digitalizar el transporte marítimo. La UE exige desde 2024 pasaportes digitales
              de producto para baterías de vehículos eléctricos, incluyendo trazabilidad de materias
              primas desde la mina.
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
