'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './AgujerosNegros.module.css';

// ─────────────────────────────────────────────
// Constantes físicas
// ─────────────────────────────────────────────

const G = 6.674e-11;   // m³/(kg·s²)
const C = 3e8;          // m/s
const M_SOL = 1.989e30; // kg

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface ZonaAnatomy {
  id: string;
  nombre: string;
  color: string;
  descripcion: string;
  formula?: string;
  soloRotante?: boolean;
}

interface TipoAgujeroNegro {
  id: string;
  nombre: string;
  icono: string;
  rango: string;
  origen: string;
  descripcion: string;
  ejemplos: string[];
}

interface FilaHawking {
  masa: string;
  tiempo: string;
}

// ─────────────────────────────────────────────
// Datos de anatomía
// ─────────────────────────────────────────────

const ZONAS: ZonaAnatomy[] = [
  {
    id: 'singularidad',
    nombre: 'Singularidad',
    color: '#ffffff',
    descripcion:
      'El punto (o anillo, en agujeros rotantes) donde la densidad y la curvatura del espacio-tiempo se vuelven infinitas según la Relatividad General. Las ecuaciones dejan de ser válidas aquí: se necesita una teoría de gravedad cuántica. Para agujeros de Kerr (rotantes), la singularidad es un anillo, no un punto.',
    formula: 'ρ → ∞, κ → ∞',
  },
  {
    id: 'horizonte',
    nombre: 'Horizonte de sucesos',
    color: '#ff6b35',
    descripcion:
      'La "membrana" unidireccional: nada — ni la luz ni la información — puede cruzarla hacia afuera. No es una superficie física, sino una región del espacio-tiempo. Su radio es el radio de Schwarzschild para agujeros no rotantes. Para un observador externo, un objeto que cae parece congelarse y desvanecerse; para quien cae, lo cruza sin notar nada especial (si el agujero es masivo).',
    formula: 'r_s = 2GM/c²',
  },
  {
    id: 'fotones',
    nombre: 'Esfera de fotones',
    color: '#f59e0b',
    descripcion:
      'Región donde los fotones (luz) pueden orbitar en círculo inestable. Radio = 1,5 × r_s para agujeros de Schwarzschild. Esta órbita es inestable: un fotón perturbado espirala hacia adentro o hacia afuera. La "sombra" observada por el EHT (Event Horizon Telescope) en M87* y Sgr A* corresponde a esta región: fotones que orbitan casi capturados forman el anillo luminoso.',
    formula: 'r_f = 3GM/c² = 1.5 · r_s',
  },
  {
    id: 'ergosfera',
    nombre: 'Ergosfera',
    color: '#8b5cf6',
    descripcion:
      'Existe solo en agujeros negros rotantes (Kerr). Región donde el espacio-tiempo arrastra a cualquier objeto a rotar con el agujero negro — incluso la luz no puede ir "hacia atrás". Sin embargo, objetos en la ergosfera aún pueden escapar, a diferencia del interior del horizonte. El proceso de Penrose permite extraer energía del agujero negro usando la ergosfera.',
    formula: 'r_e = GM/c² + √((GM/c²)² − a²cos²θ)',
    soloRotante: true,
  },
  {
    id: 'disco',
    nombre: 'Disco de acreción',
    color: '#ef4444',
    descripcion:
      'Gas y polvo que caen en espiral hacia el horizonte. La fricción y las fuerzas magnéticas calientan el material a millones de kelvins — emite luz visible, rayos X y ondas de radio. El interior del disco (cerca del horizonte) llega a temperaturas de 10⁷-10⁸ K. Lo que el EHT fotografió de M87* y Sgr A* es principalmente el disco de acreción, no el agujero negro en sí.',
  },
  {
    id: 'jets',
    nombre: 'Jets polares',
    color: '#06b6d4',
    descripcion:
      'Chorros de plasma relativista eyectados perpendiculares al plano de acreción, a velocidades cercanas a la de la luz. Originados por campos magnéticos intensos en el disco. Los jets de M87* se extienden 5.000 años-luz. El mecanismo exacto (Blandford-Znajek para agujeros rotantes, o Blandford-Payne para el disco) aún se investiga.',
  },
];

// ─────────────────────────────────────────────
// Datos de tipos de agujeros negros
// ─────────────────────────────────────────────

const TIPOS: TipoAgujeroNegro[] = [
  {
    id: 'estelares',
    nombre: 'Estelares',
    icono: '⭐',
    rango: '3 – 100 M☉',
    origen: 'Colapso gravitatorio de estrella masiva al final de su vida',
    descripcion:
      'Se forman cuando una estrella de más de ~20 masas solares agota su combustible nuclear. El núcleo colapsa en nanosegundos; la explosión exterior es una supernova. Si la masa del remanente supera ~3 M☉, la presión de degeneración de neutrones no puede detener el colapso: se forma un agujero negro estelar. Son los más estudiados a través de binarias de rayos X.',
    ejemplos: ['Cygnus X-1 (~21 M☉)', 'V404 Cygni (~9 M☉)', 'GW150914 (~36+29 M☉ fusionados)'],
  },
  {
    id: 'intermedios',
    nombre: 'Intermedios',
    icono: '🌀',
    rango: '100 – 100.000 M☉',
    origen: 'Mecanismo poco claro — posiblemente fusiones de estelares o colisiones en cúmulos',
    descripcion:
      'Los "eslabones perdidos" entre estelares y supermasivos. Difíciles de detectar porque no son tan abundantes como los estelares ni tan brillantes como los supermasivos. Candidatos en cúmulos globulares. Su formación podría explicar el origen de los supermasivos en el universo temprano.',
    ejemplos: [
      'HLX-1 en ESO 243-49 (~10.000 M☉)',
      'Candidato en NGC 6397 (~1.800 M☉)',
      'M82 X-1 (~400 M☉)',
    ],
  },
  {
    id: 'supermasivos',
    nombre: 'Supermasivos',
    icono: '🌌',
    rango: 'Millones – miles de millones de M☉',
    origen: 'Origen debatido: semillas en el universo temprano, fusiones de intermedios, colapso directo',
    descripcion:
      'Habitan en los núcleos de casi todas las galaxias masivas. Cuando están activos y acretando gas forman los cuásares y AGN (Núcleos Galácticos Activos), los objetos más luminosos del universo. Sagitario A*, en el centro de la Vía Láctea, tiene 4 millones de masas solares. M87* tiene 6.500 millones.',
    ejemplos: [
      'Sagitario A* (4×10⁶ M☉, 26.000 al)',
      'M87* (6.5×10⁹ M☉, 55 Mal)',
      'TON 618 (6.6×10¹⁰ M☉)',
    ],
  },
  {
    id: 'primordiales',
    nombre: 'Primordiales',
    icono: '🔬',
    rango: 'Cualquier masa (hipotéticos)',
    origen: 'Fluctuaciones de densidad en los primeros instantes del Big Bang',
    descripcion:
      'Hipotéticos agujeros negros formados en el universo extremadamente denso tras el Big Bang, sin necesidad de estrellas. Podrían tener masas desde un gramo hasta millones de masas solares. Son candidatos a materia oscura. Aún no detectados directamente. Hawking calculó que los más ligeros ya se habrían evaporado por radiación de Hawking.',
    ejemplos: ['Ninguno confirmado aún', 'Candidato: MACHO gravitacional', 'Candidate: GW190521 (150 M☉)'],
  },
];

// ─────────────────────────────────────────────
// Datos radiación de Hawking
// ─────────────────────────────────────────────

const HAWKING_TIMELINE: FilaHawking[] = [
  { masa: '1 gramo', tiempo: '~femtosegundos' },
  { masa: '10¹² kg (~luna)', tiempo: '~3×10¹⁶ años' },
  { masa: '1 M☉ (Sol)', tiempo: '~2×10⁶⁷ años' },
  { masa: 'Sgr A* (4×10⁶ M☉)', tiempo: '~3×10⁸³ años' },
  { masa: 'M87* (6.5×10⁹ M☉)', tiempo: '~10⁹⁶ años' },
];

// ─────────────────────────────────────────────
// Comparativa de Schwarzschild
// ─────────────────────────────────────────────

interface CompRef {
  nombre: string;
  rs: string;
}

const COMP_REF: CompRef[] = [
  { nombre: 'Tierra (5.97×10²⁴ kg)', rs: '~9 mm' },
  { nombre: 'Sol (1 M☉)', rs: '~3 km' },
  { nombre: 'Sgr A* (4×10⁶ M☉)', rs: '~12 millones km' },
  { nombre: 'M87* (6.5×10⁹ M☉)', rs: '~19.000 millones km' },
];

// ─────────────────────────────────────────────
// Helpers de cálculo
// ─────────────────────────────────────────────

const formatRs = (masaSolar: number): string => {
  const masaKg = masaSolar * M_SOL;
  const rs = (2 * G * masaKg) / (C * C);
  if (rs < 1) return `${(rs * 1000).toFixed(1)} mm`;
  if (rs < 1000) return `${rs.toFixed(1)} m`;
  if (rs < 1e6) return `${(rs / 1000).toFixed(1)} km`;
  if (rs < 1.5e11) return `${(rs / 1e6).toFixed(1)} millones km`;
  return `${(rs / 1.5e11).toFixed(2)} UA`;
};

const formatDensidad = (masaSolar: number): string => {
  const masaKg = masaSolar * M_SOL;
  const rs = (2 * G * masaKg) / (C * C);
  const vol = (4 / 3) * Math.PI * rs ** 3;
  const rho = masaKg / vol;
  if (rho > 1e18) return `~${(rho / 1e18).toFixed(0)} × 10¹⁸ kg/m³`;
  if (rho > 1e12) return `~${(rho / 1e12).toFixed(0)} × 10¹² kg/m³`;
  if (rho > 1e6) return `~${(rho / 1e6).toFixed(0)} × 10⁶ kg/m³`;
  return `~${rho.toFixed(0)} kg/m³`;
};

const MASA_LABELS: Record<number, string> = {
  1: '3 M☉ (estelar mínimo)',
  2: '10 M☉ (estelar típico)',
  3: '100 M☉ (estelar masivo)',
  4: '10.000 M☉ (intermedio)',
  5: '1 millón M☉ (supermasivo pequeño)',
  6: '100 millones M☉ (supermasivo)',
  7: '10.000 millones M☉ (supermasivo gigante)',
};

const MASA_VALORES: Record<number, number> = {
  1: 3,
  2: 10,
  3: 100,
  4: 1e4,
  5: 1e6,
  6: 1e8,
  7: 1e10,
};

// ─────────────────────────────────────────────
// SVG Anatomía — puntos para cada zona (cx, cy, r en viewBox 320×320)
// ─────────────────────────────────────────────

interface ZonaSVGConfig {
  cx: number;
  cy: number;
  r: number;
  zona: ZonaAnatomy;
}

// Posiciones SVG: centro 160,160; radio_total ~145
// singularidad r=8, horizonte r=34, fotones r=51, ergosfera elipse, disco fuera, jets líneas
const ZONAS_SVG_CONFIGS: ZonaSVGConfig[] = [
  { cx: 160, cy: 160, r: 8, zona: ZONAS[0] },   // singularidad
  { cx: 160, cy: 160, r: 34, zona: ZONAS[1] },   // horizonte
  { cx: 160, cy: 160, r: 51, zona: ZONAS[2] },   // esfera fotones
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function AgujerosNegrosPage(): React.ReactNode {
  const [zonaActiva, setZonaActiva] = useState<string | null>(null);
  const [masaSlider, setMasaSlider] = useState<number>(2);
  const [espagAnimando, setEspagAnimando] = useState<boolean>(false);
  const [tipoActivo, setTipoActivo] = useState<string>('estelares');

  const masaSolar = MASA_VALORES[masaSlider];
  const rsFormato = useMemo(() => formatRs(masaSolar), [masaSolar]);
  const densidadFormato = useMemo(() => formatDensidad(masaSolar), [masaSolar]);

  const zonaActivaData = useMemo(
    () => ZONAS.find((z) => z.id === zonaActiva) ?? null,
    [zonaActiva]
  );

  const tipoActivoData = useMemo(
    () => TIPOS.find((t) => t.id === tipoActivo) ?? TIPOS[0],
    [tipoActivo]
  );

  const handleZonaClick = useCallback((id: string): void => {
    setZonaActiva((prev) => (prev === id ? null : id));
  }, []);

  const handleLeyendaClick = useCallback((id: string): void => {
    setZonaActiva((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Astrofísica · Relatividad</span>
          <h1 className={styles.heroTitle}>Agujeros Negros</h1>
          <p className={styles.heroSubtitle}>
            Anatomía, fenomenología y extremos del universo — de Schwarzschild a M87*
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Nota diferenciadora */}
        <div className={styles.notaDiferencia}>
          <strong>¿Buscas la curvatura del espacio-tiempo en general?</strong> Esta app se centra
          en la anatomía específica de los agujeros negros.{' '}
          <a href="/visualizador-relatividad-general/" className={styles.link}>
            Ver Relatividad General →
          </a>
        </div>

        {/* 1. Anatomía SVG */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionIcono} aria-hidden="true">⚫</span>
            <div>
              <h2 className={styles.seccionTitulo}>Anatomía de un agujero negro</h2>
              <p className={styles.seccionSubtitulo}>
                Haz clic en cada zona o en la leyenda para explorar su descripción
              </p>
            </div>
          </div>

          <div className={styles.anatomiaWrapper}>
            <div className={styles.anatomiaFlex}>
              {/* SVG interactivo */}
              <div className={styles.svgContainer}>
                <svg
                  viewBox="0 0 320 320"
                  className={styles.svgAnatomy}
                  aria-label="Anatomía de un agujero negro — haz clic en cada capa"
                  role="img"
                >
                  <defs>
                    {/* Gradiente disco de acreción */}
                    <radialGradient id="discGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ff4500" stopOpacity="0.9" />
                      <stop offset="40%" stopColor="#ff8c00" stopOpacity="0.7" />
                      <stop offset="70%" stopColor="#ffd700" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#ff6347" stopOpacity="0.2" />
                    </radialGradient>
                    {/* Gradiente cuerpo negro */}
                    <radialGradient id="blackBodyGrad" cx="38%" cy="35%" r="60%">
                      <stop offset="0%" stopColor="#0d0d1f" />
                      <stop offset="100%" stopColor="#000000" />
                    </radialGradient>
                    {/* Filtro blur para el anillo */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Estrellas de fondo */}
                  {[
                    [20, 15], [290, 30], [45, 280], [300, 270], [140, 10], [10, 160],
                    [310, 140], [70, 50], [250, 60], [30, 220], [280, 200], [160, 305],
                    [90, 290], [220, 15], [5, 80], [315, 90],
                  ].map(([sx, sy], i) => (
                    <circle key={`star-${i}`} cx={sx} cy={sy} r={i % 3 === 0 ? 1.2 : 0.8}
                      fill="rgba(255,255,255,0.7)" />
                  ))}

                  {/* Disco de acreción (elipse exterior) */}
                  <ellipse
                    cx={160} cy={160}
                    rx={128} ry={22}
                    fill="url(#discGrad)"
                    style={{ cursor: 'pointer', opacity: zonaActiva === 'disco' ? 1 : 0.85 }}
                    onClick={() => handleZonaClick('disco')}
                    role="button"
                    aria-label="Disco de acreción"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZonaClick('disco'); }}
                  />

                  {/* Jets polares */}
                  <line x1={160} y1={160} x2={160} y2={18}
                    stroke="#06b6d4" strokeWidth={zonaActiva === 'jets' ? 5 : 3}
                    strokeLinecap="round" style={{ cursor: 'pointer', opacity: zonaActiva === 'jets' ? 1 : 0.7 }}
                    onClick={() => handleZonaClick('jets')}
                  />
                  <line x1={160} y1={160} x2={155} y2={18}
                    stroke="#06b6d4" strokeWidth={1} strokeOpacity={0.4} />
                  <line x1={160} y1={160} x2={165} y2={18}
                    stroke="#06b6d4" strokeWidth={1} strokeOpacity={0.4} />
                  <line x1={160} y1={160} x2={160} y2={302}
                    stroke="#06b6d4" strokeWidth={zonaActiva === 'jets' ? 5 : 3}
                    strokeLinecap="round" style={{ cursor: 'pointer', opacity: zonaActiva === 'jets' ? 1 : 0.7 }}
                    onClick={() => handleZonaClick('jets')}
                  />
                  <line x1={160} y1={160} x2={155} y2={302}
                    stroke="#06b6d4" strokeWidth={1} strokeOpacity={0.4} />
                  <line x1={160} y1={160} x2={165} y2={302}
                    stroke="#06b6d4" strokeWidth={1} strokeOpacity={0.4} />
                  {/* Botón transparente jets */}
                  <rect x={150} y={16} width={20} height={288} fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleZonaClick('jets')}
                    role="button" aria-label="Jets polares" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZonaClick('jets'); }}
                  />

                  {/* Ergosfera (elipse rotante — ligeramente oblada) */}
                  <ellipse
                    cx={160} cy={160} rx={72} ry={64}
                    fill="none"
                    stroke={zonaActiva === 'ergosfera' ? '#8b5cf6' : 'rgba(139,92,246,0.55)'}
                    strokeWidth={zonaActiva === 'ergosfera' ? 3 : 1.5}
                    strokeDasharray="6 4"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleZonaClick('ergosfera')}
                    role="button" aria-label="Ergosfera" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZonaClick('ergosfera'); }}
                  />
                  {/* Área de click ergosfera */}
                  <ellipse cx={160} cy={160} rx={72} ry={64}
                    fill="transparent" stroke="none"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleZonaClick('ergosfera')}
                  />

                  {/* Cuerpo negro (interior del horizonte) */}
                  <circle cx={160} cy={160} r={51} fill="url(#blackBodyGrad)" />

                  {/* Esfera de fotones */}
                  <circle
                    cx={160} cy={160} r={51}
                    fill="none"
                    stroke={zonaActiva === 'fotones' ? '#f59e0b' : 'rgba(245,158,11,0.5)'}
                    strokeWidth={zonaActiva === 'fotones' ? 3 : 1.5}
                    filter="url(#glow)"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleZonaClick('fotones')}
                    role="button" aria-label="Esfera de fotones" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZonaClick('fotones'); }}
                  />

                  {/* Horizonte de sucesos */}
                  <circle
                    cx={160} cy={160} r={34}
                    fill="rgba(0,0,0,0.9)"
                    stroke={zonaActiva === 'horizonte' ? '#ff6b35' : 'rgba(255,107,53,0.65)'}
                    strokeWidth={zonaActiva === 'horizonte' ? 3 : 1.5}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleZonaClick('horizonte')}
                    role="button" aria-label="Horizonte de sucesos" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZonaClick('horizonte'); }}
                  />

                  {/* Singularidad */}
                  <circle
                    cx={160} cy={160} r={8}
                    fill={zonaActiva === 'singularidad' ? '#ffffff' : 'rgba(255,255,255,0.85)'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleZonaClick('singularidad')}
                    role="button" aria-label="Singularidad" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleZonaClick('singularidad'); }}
                  />

                  {/* Etiquetas de zonas del SVG config */}
                  {ZONAS_SVG_CONFIGS.map(({ cx, cy, r, zona }) => (
                    <circle
                      key={zona.id}
                      cx={cx} cy={cy} r={r}
                      fill="transparent"
                      stroke="none"
                    />
                  ))}
                </svg>
                <p className={styles.anatomiaHint} aria-hidden="true">
                  Haz clic en cada capa para ver su descripción
                </p>
              </div>

              {/* Panel de información */}
              <div className={styles.anatomiaInfo}>
                {zonaActivaData ? (
                  <div className={styles.zonaCard}>
                    <h3 className={styles.zonaCardTitulo}>{zonaActivaData.nombre}</h3>
                    {zonaActivaData.formula && (
                      <span className={styles.zonaCardFormula}>{zonaActivaData.formula}</span>
                    )}
                    {zonaActivaData.soloRotante && (
                      <span className={styles.zonaCardFormula} style={{ display: 'block', marginTop: 4, background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
                        Solo en agujeros rotantes (Kerr)
                      </span>
                    )}
                    <p className={styles.zonaCardDesc}>{zonaActivaData.descripcion}</p>
                  </div>
                ) : (
                  <div className={styles.anatomiaInfoVacia}>
                    Selecciona una zona del diagrama o usa la leyenda
                  </div>
                )}
              </div>
            </div>

            {/* Leyenda de zonas */}
            <div className={styles.leyendaGrid} role="list" aria-label="Leyenda de zonas">
              {ZONAS.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  className={`${styles.leyendaItem} ${zonaActiva === z.id ? styles.leyendaActivo : ''}`}
                  onClick={() => handleLeyendaClick(z.id)}
                  aria-pressed={zonaActiva === z.id}
                  role="listitem"
                >
                  <span className={styles.leyendaDot} style={{ background: z.color }} aria-hidden="true" />
                  {z.nombre}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Calculadora radio de Schwarzschild */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionIcono} aria-hidden="true">📐</span>
            <div>
              <h2 className={styles.seccionTitulo}>Calculadora de radio de Schwarzschild</h2>
              <p className={styles.seccionSubtitulo}>
                r_s = 2GM/c² — el tamaño que necesita una masa para ser un agujero negro
              </p>
            </div>
          </div>

          <div className={styles.calcGrid}>
            <div className={styles.calcControl}>
              <label className={styles.calcLabel} htmlFor="masa-slider">
                Masa del agujero negro
              </label>
              <input
                id="masa-slider"
                type="range"
                min={1}
                max={7}
                step={1}
                value={masaSlider}
                onChange={(e) => setMasaSlider(Number(e.target.value))}
                className={styles.slider}
                aria-label={`Masa: ${MASA_LABELS[masaSlider]}`}
              />
              <div className={styles.masaDisplay}>{MASA_LABELS[masaSlider]}</div>

              <div className={styles.calcResultados}>
                <div className={styles.calcResultado}>
                  <div className={styles.calcResultadoLabel}>Radio de Schwarzschild (r_s)</div>
                  <div className={styles.calcResultadoValor} role="status" aria-live="polite">
                    {rsFormato}
                  </div>
                </div>
                <div className={styles.calcResultado}>
                  <div className={styles.calcResultadoLabel}>Densidad media (dentro del horizonte)</div>
                  <div className={styles.calcResultadoValor} role="status" aria-live="polite">
                    {densidadFormato}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className={styles.calcComparativa}>
                <p className={styles.calcComparativaTitle}>Referencias reales</p>
                {COMP_REF.map((ref) => (
                  <div key={ref.nombre} className={styles.comparativaFila}>
                    <span>{ref.nombre}</span>
                    <span className={styles.comparativaValor}>{ref.rs}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Espaguetización */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionIcono} aria-hidden="true">🍝</span>
            <div>
              <h2 className={styles.seccionTitulo}>Espaguetización</h2>
              <p className={styles.seccionSubtitulo}>
                Las fuerzas de marea diferenciales estiran cualquier objeto verticalmente
              </p>
            </div>
          </div>

          <div className={styles.espagWrapper}>
            {/* Escena de animación */}
            <div className={styles.espagEscena} aria-label="Animación de espaguetización" role="img">
              <div className={styles.espagAgujero} aria-hidden="true" />
              <div className={styles.espagFlecha} aria-hidden="true">→</div>
              <div
                className={`${styles.espagObjeto} ${espagAnimando ? styles.espagAnimar : ''}`}
                style={{ width: '30px', height: '30px' }}
                aria-hidden="true"
              />
            </div>

            <div className={styles.espagControles}>
              <button
                type="button"
                className={styles.btnToggle}
                onClick={() => setEspagAnimando((v) => !v)}
                aria-pressed={espagAnimando}
                aria-label={espagAnimando ? 'Detener animación de espaguetización' : 'Iniciar animación de espaguetización'}
              >
                <span aria-hidden="true">{espagAnimando ? '⏹' : '▶'}</span>{espagAnimando ? ' Detener' : ' Animar espaguetización'}
              </button>
            </div>

            <p className={styles.espagDesc}>
              Al caer hacia un agujero negro, la gravedad es más fuerte en los pies que en la
              cabeza (o viceversa). Esta diferencia —las <strong>fuerzas de marea</strong>—
              estira el cuerpo en la dirección radial y lo comprime lateralmente.
            </p>

            <div className={styles.espagModo} role="note">
              <strong>Masa del agujero negro importa:</strong> Para agujeros supermasivos como
              M87* (6.5×10⁹ M☉), la espaguetización ocurre{' '}
              <em>mucho después de cruzar el horizonte</em> (las fuerzas de marea son débiles en
              el horizonte). Para agujeros pequeños (~3 M☉), la espaguetización ocurre{' '}
              <em>antes de llegar al horizonte</em>.
            </div>
          </div>
        </section>

        {/* 4. Tipos de agujeros negros */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionIcono} aria-hidden="true">🔭</span>
            <div>
              <h2 className={styles.seccionTitulo}>Tipos de agujeros negros</h2>
              <p className={styles.seccionSubtitulo}>
                Cuatro categorías por masa y origen
              </p>
            </div>
          </div>

          <div className={styles.tiposTabs} role="tablist" aria-label="Tipos de agujeros negros">
            {TIPOS.map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                role="tab"
                aria-selected={tipoActivo === tipo.id}
                className={`${styles.tipoTab} ${tipoActivo === tipo.id ? styles.tipoTabActivo : ''}`}
                onClick={() => setTipoActivo(tipo.id)}
              >
                <span aria-hidden="true">{tipo.icono}</span> {tipo.nombre}
              </button>
            ))}
          </div>

          <div className={styles.tipoContenido} role="tabpanel">
            <div className={styles.tipoEncabezado}>
              <span className={styles.tipoIcono} aria-hidden="true">{tipoActivoData.icono}</span>
              <div>
                <p className={styles.tipoNombre}>{tipoActivoData.nombre}</p>
                <p className={styles.tipoMasa}>Masa: {tipoActivoData.rango}</p>
              </div>
            </div>
            <p className={styles.tipoDesc}>
              <strong>Origen:</strong> {tipoActivoData.origen}
            </p>
            <p className={styles.tipoDesc}>{tipoActivoData.descripcion}</p>
            <div className={styles.tipoEjemplos}>
              {tipoActivoData.ejemplos.map((ej) => (
                <span key={ej} className={styles.tipoEjemploTag}>{ej}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Radiación de Hawking */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionIcono} aria-hidden="true">✨</span>
            <div>
              <h2 className={styles.seccionTitulo}>Radiación de Hawking</h2>
              <p className={styles.seccionSubtitulo}>
                Los agujeros negros no son eternos — emiten radiación cuántica y se evaporan
              </p>
            </div>
          </div>

          <div className={styles.hawkingWrapper}>
            {/* Visualización pares virtuales */}
            <div className={styles.hawkingViz} aria-label="Visualización de pares virtuales cerca del horizonte">
              <div className={styles.hawkingHorizonte}>
                <div className={styles.hawkingCirculo} aria-hidden="true" />
                <div className={styles.hawkingParesZona} aria-hidden="true">
                  <div className={styles.hawkingPar}>
                    <span className={`${styles.particula} ${styles.particulaPos}`} />
                    <span className={styles.hawkingEscape}>escapa →</span>
                  </div>
                  <div className={styles.hawkingPar} style={{ animationDelay: '0.9s' }}>
                    <span className={`${styles.particula} ${styles.particulaNeg}`} />
                    <span className={styles.hawkingCae}>← cae</span>
                  </div>
                </div>
              </div>
              <p className={styles.hawkingTexto}>
                En el vacío cuántico, pares partícula-antipartícula se crean y aniquilan
                constantemente. Cerca del horizonte, uno puede caer y el otro escapar. El
                agujero negro "paga" la energía —pierde masa poco a poco.
              </p>
            </div>

            {/* Timeline de evaporación */}
            <div className={styles.hawkingTimeline}>
              <p className={styles.hawkingTimelineTitle}>Tiempo de evaporación por masa</p>
              {HAWKING_TIMELINE.map((fila) => (
                <div key={fila.masa} className={styles.hawkingFila}>
                  <span className={styles.hawkingFilaMasa}>{fila.masa}</span>
                  <span className={styles.hawkingFilaTiempo}>{fila.tiempo}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insight box */}
        <div className={styles.insightBox}>
          <p>
            En 2019, el Event Horizon Telescope publicó la primera imagen real de un agujero negro:
            M87*, a 55 millones de años-luz. En 2022 llegó Sagitario A*, el agujero negro en el
            centro de nuestra galaxia, a solo 26.000 años-luz. Lo que ves en esas imágenes no es el
            agujero negro en sí — es el disco de acreción caliente alrededor de la sombra que el
            horizonte proyecta sobre el fondo luminoso.
          </p>
        </div>
      </main>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="De Michell a M87*: la historia de los agujeros negros"
        subtitle="240 años desde la predicción teórica hasta la primera fotografía real"
        defaultOpen={false}
      >
        <div className={styles.educacional}>
          <h3>1783: la primera predicción — John Michell</h3>
          <p>
            El geólogo inglés John Michell escribió en 1783 a Henry Cavendish sobre la posibilidad
            de &ldquo;estrellas oscuras&rdquo;: objetos tan masivos que su velocidad de escape
            supere la velocidad de la luz (entonces conocida). Razonó usando mecánica newtoniana:
            si v_escape = √(2GM/r) ≥ c, la luz no podría escapar. El radio crítico era idéntico
            al radio de Schwarzschild moderno.
          </p>

          <h3>1916: Karl Schwarzschild y las trincheras</h3>
          <p>
            Solo semanas después de que Einstein publicara las ecuaciones de la Relatividad
            General (noviembre 1915), el astrónomo y soldado Karl Schwarzschild las resolvió
            exactamente desde el frente del Ejército Alemán en la Primera Guerra Mundial.
            Descubrió la solución de Schwarzschild: la métrica del espacio-tiempo fuera de una
            masa esférica. Murió meses después de enfermedad contraída en el frente. La solución
            implica una singularidad en r = 2GM/c², que se llamaría horizonte de sucesos.
          </p>

          <h3>El horizonte de sucesos: por qué la información no puede escapar</h3>
          <p>
            Para un observador externo, un reloj cayendo hacia el horizonte se ralentiza
            (dilatación temporal gravitacional) y se "congela" asintóticamente al color rojo
            extremo (corrimiento gravitacional al rojo). Para quien cae libremente en un agujero
            masivo, cruza el horizonte sin notar nada especial — las leyes físicas son normales
            localmente. Pero una vez cruzado, el futuro de cualquier rayo de luz apunta hacia la
            singularidad: no hay forma de "dar marcha atrás".
          </p>

          <h3>La paradoja de la información: Hawking vs. Susskind</h3>
          <p>
            En 1974, Stephen Hawking calculó que los agujeros negros emiten radiación térmica y
            se evaporan lentamente. Esto generó un dilema: si un agujero negro se evapora
            completamente emitiendo radiación térmica (aleatoria), ¿qué pasa con la información
            del objeto que cayó? ¿Se destruye? Eso violaría la mecánica cuántica (que es
            reversible). Leonard Susskind y Gerard &apos;t Hooft argumentaron que la información se
            codifica de algún modo en la radiación de Hawking. La resolución exacta sigue siendo
            uno de los problemas abiertos más profundos de la física teórica.
          </p>

          <h3>Sagitario A* y M87*: los dos agujeros fotografiados</h3>
          <p>
            El Event Horizon Telescope (EHT) es un telescopio del tamaño de la Tierra, una red
            de radiotelescopios sincronizados. En 2019 publicó la imagen de M87*, un gigante de
            6.500 millones de masas solares en la galaxia Virgo A, a 55 millones de años-luz. La
            imagen muestra el anillo de fotones luminoso alrededor de la sombra oscura. En 2022
            llegó la imagen de Sagitario A* (Sgr A*), en el centro de la Vía Láctea, mucho más
            difícil de fotografiar porque su variabilidad es mucho más rápida (días vs. años).
          </p>

          <h3>¿Qué hay dentro? La singularidad y la física de Planck</h3>
          <p>
            La Relatividad General predice una singularidad donde la densidad y la curvatura son
            infinitas. Pero esto indica que la teoría se rompe en ese punto. A densidades y
            curvaturas extremas (escala de Planck: longitud ~10⁻³⁵ m, tiempo ~10⁻⁴³ s), la
            gravedad cuántica debería tomar el relevo. Candidatos a teoría de gravedad cuántica
            son la Teoría de Cuerdas y la Gravedad Cuántica de Lazos (Loop Quantum Gravity), que
            predicen que la singularidad se &ldquo;suaviza&rdquo; o se evita, posiblemente
            creando un rebote hacia otro universo o hacia otra región del espacio-tiempo.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota sobre las imágenes del EHT:</strong> Nada de lo que entra en un
            horizonte de sucesos puede volver a salir — ni la luz. Pero la imagen que ves del
            agujero negro M87* es en realidad el disco de acreción caliente, no el agujero negro
            en sí. La "sombra" oscura central es la región donde el agujero negro absorbe los
            fotones que de otro modo llegarían al telescopio. El anillo brillante son fotones del
            disco que han dado media vuelta alrededor del agujero antes de escapar.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-agujeros-negros')} />
      <ShareCard appName="visualizador-agujeros-negros" />
      <Footer appName="visualizador-agujeros-negros" />
    </div>
  );
}
