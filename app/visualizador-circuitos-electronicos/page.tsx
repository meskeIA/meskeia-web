'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './CircuitosElectronicos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabActiva = 'rlc' | 'transistor' | 'puertas' | 'chip';
type ComponenteRLC = 'R' | 'L' | 'C';
type ModoTransistor = 'interruptor' | 'amplificador';
type PuertaLogica = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

interface NivelChip {
  id: number;
  nombre: string;
  descripcion: string;
  transistores: number;
  composicion: string;
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const NIVELES_CHIP: NivelChip[] = [
  {
    id: 1,
    nombre: 'Transistor MOSFET',
    descripcion: 'El bloque fundamental. Actúa como interruptor electrónico controlado por voltaje en la puerta (gate).',
    transistores: 1,
    composicion: 'Gate • Drain • Source — 3 terminales',
  },
  {
    id: 2,
    nombre: 'Puerta Lógica CMOS',
    descripcion: 'Una puerta NOT CMOS usa 2 transistores (1 NMOS + 1 PMOS). Una NAND usa 4 transistores.',
    transistores: 4,
    composicion: '2–4 transistores MOSFET complementarios',
  },
  {
    id: 3,
    nombre: 'Celda: Flip-Flop D',
    descripcion: 'Unidad de memoria de 1 bit. Formada por ~6 puertas lógicas. Recuerda su estado entre ciclos de reloj.',
    transistores: 24,
    composicion: '6 puertas lógicas ≈ 24 transistores',
  },
  {
    id: 4,
    nombre: 'Registro de 8 bits',
    descripcion: 'Un byte de memoria rápida. Agrupa 8 flip-flops en paralelo para almacenar 8 bits simultáneamente.',
    transistores: 192,
    composicion: '8 flip-flops D = 192 transistores',
  },
];

const TIMELINE = [
  { anio: 1971, chip: 'Intel 4004', transistores: 2300, escala: '10 µm' },
  { anio: 1993, chip: 'Intel Pentium', transistores: 3_100_000, escala: '800 nm' },
  { anio: 2006, chip: 'Intel Core 2', transistores: 291_000_000, escala: '65 nm' },
  { anio: 2017, chip: 'Apple A11', transistores: 4_300_000_000, escala: '10 nm' },
  { anio: 2023, chip: 'Apple M2', transistores: 20_000_000_000, escala: '3 nm' },
];

// ─────────────────────────────────────────────
// Helpers matemáticos
// ─────────────────────────────────────────────

function formatearTransistores(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace('.', ',')} mil millones`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace('.', ',')} millones`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace('.', ',')}k`;
  return n.toLocaleString('es-ES');
}

function calcularTau(r: number, c: number): number {
  return r * c; // segundos
}

function formatearTiempo(tau: number): string {
  if (tau >= 1) return `${tau.toFixed(2)} s`;
  if (tau >= 1e-3) return `${(tau * 1e3).toFixed(2)} ms`;
  if (tau >= 1e-6) return `${(tau * 1e6).toFixed(2)} µs`;
  return `${(tau * 1e9).toFixed(2)} ns`;
}

function formatearFrecuencia(f: number): string {
  if (f >= 1e9) return `${(f / 1e9).toFixed(2)} GHz`;
  if (f >= 1e6) return `${(f / 1e6).toFixed(2)} MHz`;
  if (f >= 1e3) return `${(f / 1e3).toFixed(2)} kHz`;
  return `${f.toFixed(2)} Hz`;
}

function tablaVerdad(puerta: PuertaLogica): { a: number; b: number; salida: number }[] {
  const filas = puerta === 'NOT'
    ? [{ a: 0, b: 0 }, { a: 1, b: 0 }]
    : [{ a: 0, b: 0 }, { a: 0, b: 1 }, { a: 1, b: 0 }, { a: 1, b: 1 }];

  return filas.map(({ a, b }) => {
    let salida = 0;
    switch (puerta) {
      case 'AND': salida = a & b; break;
      case 'OR': salida = a | b; break;
      case 'NOT': salida = a ? 0 : 1; break;
      case 'NAND': salida = (a & b) ? 0 : 1; break;
      case 'NOR': salida = (a | b) ? 0 : 1; break;
      case 'XOR': salida = a ^ b; break;
      case 'XNOR': salida = (a ^ b) ? 0 : 1; break;
    }
    return { a, b, salida };
  });
}

// ─────────────────────────────────────────────
// SVG Símbolos de puertas lógicas (IEEE)
// ─────────────────────────────────────────────

function SvgPuerta({ puerta }: { puerta: PuertaLogica }) {
  const w = 120, h = 80;
  // Líneas de entrada y salida comunes
  const entradas = puerta === 'NOT'
    ? [<line key="in1" x1="0" y1="40" x2="20" y2="40" stroke="currentColor" strokeWidth="2" />]
    : [
        <line key="in1" x1="0" y1="28" x2="20" y2="28" stroke="currentColor" strokeWidth="2" />,
        <line key="in2" x1="0" y1="52" x2="20" y2="52" stroke="currentColor" strokeWidth="2" />,
      ];
  const salida = <line key="out" x1="100" y1="40" x2="120" y2="40" stroke="currentColor" strokeWidth="2" />;

  if (puerta === 'AND' || puerta === 'NAND') {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className={styles.svgPuerta} aria-label={`Símbolo puerta ${puerta}`}>
        {entradas}
        <path d="M20 20 L20 60 L55 60 Q80 60 80 40 Q80 20 55 20 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {puerta === 'NAND' && <circle cx="84" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="2" />}
        <line x1={puerta === 'NAND' ? 88 : 80} y1="40" x2="120" y2="40" stroke="currentColor" strokeWidth="2" />
        {puerta !== 'NAND' && salida}
        <text x="48" y="44" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="600">{puerta}</text>
      </svg>
    );
  }
  if (puerta === 'OR' || puerta === 'NOR') {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className={styles.svgPuerta} aria-label={`Símbolo puerta ${puerta}`}>
        {entradas}
        <path d="M20 20 Q35 20 50 20 Q78 20 80 40 Q78 60 50 60 Q35 60 20 60 Q30 40 20 20 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {puerta === 'NOR' && <circle cx="84" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="2" />}
        <line x1={puerta === 'NOR' ? 88 : 80} y1="40" x2="120" y2="40" stroke="currentColor" strokeWidth="2" />
        {puerta !== 'NOR' && salida}
        <text x="52" y="44" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="600">{puerta}</text>
      </svg>
    );
  }
  if (puerta === 'NOT') {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className={styles.svgPuerta} aria-label="Símbolo puerta NOT">
        <line x1="0" y1="40" x2="20" y2="40" stroke="currentColor" strokeWidth="2" />
        <polygon points="20,20 20,60 76,40" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="80" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="84" y1="40" x2="120" y2="40" stroke="currentColor" strokeWidth="2" />
        <text x="45" y="44" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="600">NOT</text>
      </svg>
    );
  }
  // XOR / XNOR
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={styles.svgPuerta} aria-label={`Símbolo puerta ${puerta}`}>
      {entradas}
      <path d="M15 20 Q25 40 15 60" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M22 20 Q35 20 50 20 Q78 20 80 40 Q78 60 50 60 Q35 60 22 60 Q32 40 22 20 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      {puerta === 'XNOR' && <circle cx="84" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="2" />}
      <line x1={puerta === 'XNOR' ? 88 : 80} y1="40" x2="120" y2="40" stroke="currentColor" strokeWidth="2" />
      {puerta !== 'XNOR' && salida}
      <text x="52" y="44" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="600">{puerta}</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG Circuito RC — curva de carga
// ─────────────────────────────────────────────

function GraficaCargaRC({ tau }: { tau: number }) {
  const W = 300, H = 150, PAD = 30;
  const w = W - PAD * 2, h = H - PAD * 2;
  const puntos: string[] = [];
  for (let i = 0; i <= w; i++) {
    const t = (i / w) * 5 * tau;
    const v = 1 - Math.exp(-t / tau);
    const x = PAD + i;
    const y = PAD + h - v * h;
    puntos.push(`${x},${y}`);
  }
  const linea = puntos.join(' ');
  // Marca τ
  const xTau = PAD + w / 5;
  const yTau = PAD + h - (1 - Math.exp(-1)) * h;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.graficaSvg} aria-label="Curva de carga del condensador RC">
      {/* Ejes */}
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1.5" />
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1.5" />
      {/* Etiquetas */}
      <text x={PAD - 4} y={PAD + 4} fontSize="9" fill="var(--text-muted)" textAnchor="end">V_s</text>
      <text x={W - PAD} y={H - PAD + 12} fontSize="9" fill="var(--text-muted)" textAnchor="middle">t</text>
      <text x={PAD} y={H - PAD + 12} fontSize="9" fill="var(--text-muted)" textAnchor="middle">0</text>
      {/* Línea V_s */}
      <line x1={PAD} y1={PAD} x2={W - PAD} y2={PAD} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 3" />
      {/* Curva */}
      <polyline points={linea} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Marca τ — 63.2% */}
      <circle cx={xTau} cy={yTau} r="4" fill="var(--secondary)" />
      <line x1={xTau} y1={yTau} x2={xTau} y2={H - PAD} stroke="var(--secondary)" strokeWidth="1" strokeDasharray="3 2" />
      <text x={xTau + 6} y={yTau - 4} fontSize="8" fill="var(--secondary)" fontWeight="700">τ (63%)</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG Impedancia vs Frecuencia
// ─────────────────────────────────────────────

function GraficaImpedancia({ componente, r, c, l }: { componente: ComponenteRLC; r: number; c: number; l: number }) {
  const W = 300, H = 140, PAD = 30;
  const w = W - PAD * 2, h = H - PAD * 2;
  // Frecuencias log: 1 Hz → 1 GHz (9 décadas)
  const puntos: string[] = [];
  for (let i = 0; i <= w; i++) {
    const logF = 0 + (i / w) * 9; // 10^0 a 10^9
    const f = Math.pow(10, logF);
    const omega = 2 * Math.PI * f;
    let z: number;
    if (componente === 'R') z = r;
    else if (componente === 'L') z = omega * l;
    else z = 1 / (omega * c);
    const logZ = Math.log10(Math.max(z, 1e-3));
    // Normalizar entre ~0 y ~12 décadas
    const zNorm = Math.max(0, Math.min(1, (logZ + 1) / 12));
    const x = PAD + i;
    const y = PAD + h - zNorm * h;
    puntos.push(`${x},${y}`);
  }
  const linea = puntos.join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.graficaSvg} aria-label={`Impedancia vs frecuencia para ${componente}`}>
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1.5" />
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1.5" />
      <text x={PAD - 4} y={PAD + 4} fontSize="8" fill="var(--text-muted)" textAnchor="end">Z↑</text>
      <text x={W - PAD} y={H - PAD + 11} fontSize="8" fill="var(--text-muted)" textAnchor="end">f→</text>
      <text x={PAD} y={H - PAD + 11} fontSize="7" fill="var(--text-muted)" textAnchor="start">1 Hz</text>
      <text x={W - PAD} y={PAD + 4} fontSize="7" fill="var(--text-muted)" textAnchor="end">1 GHz</text>
      <polyline points={linea} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG Transistor NPN
// ─────────────────────────────────────────────

function SvgTransistorNPN({ on }: { on: boolean }) {
  const color = on ? '#27ae60' : 'currentColor';
  return (
    <svg viewBox="0 0 120 120" className={styles.svgTransistor} aria-label="Esquema transistor NPN">
      {/* Cuerpo */}
      <circle cx="60" cy="60" r="38" fill="none" stroke="var(--border)" strokeWidth="2" />
      {/* Línea vertical base */}
      <line x1="40" y1="30" x2="40" y2="90" stroke="currentColor" strokeWidth="3" />
      {/* Colector (arriba) */}
      <line x1="40" y1="38" x2="80" y2="18" stroke={color} strokeWidth="2.5" />
      {/* Emisor (abajo) con flecha */}
      <line x1="40" y1="82" x2="80" y2="102" stroke={color} strokeWidth="2.5" />
      <polygon points="80,102 70,94 76,89" fill={color} />
      {/* Base */}
      <line x1="10" y1="60" x2="40" y2="60" stroke={on ? '#f39c12' : 'currentColor'} strokeWidth="2.5" />
      {/* Etiquetas */}
      <text x="6" y="64" fontSize="11" fill="var(--text-secondary)" fontWeight="700">B</text>
      <text x="85" y="20" fontSize="11" fill="var(--text-secondary)" fontWeight="700">C</text>
      <text x="85" y="106" fontSize="11" fill="var(--text-secondary)" fontWeight="700">E</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCircuitosElectronicos() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('rlc');

  // Tab 1 — RLC
  const [componenteSeleccionado, setComponenteSeleccionado] = useState<ComponenteRLC>('R');
  const [rOhms, setROhms] = useState(1000); // 1 kΩ
  const [cFarads, setCFarads] = useState(1e-6); // 1 µF
  const [lHenrios] = useState(1e-3); // 1 mH (fijo para gráfica)

  // Tab 2 — Transistor
  const [modoTransistor, setModoTransistor] = useState<ModoTransistor>('interruptor');
  const [vBE, setVBE] = useState(0.5);
  const [beta, setBeta] = useState(100);
  const [senalEntradaMV, setSenalEntradaMV] = useState(10);

  // Tab 3 — Puertas
  const [puertaSeleccionada, setPuertaSeleccionada] = useState<PuertaLogica>('AND');
  const [entradaA, setEntradaA] = useState(0);
  const [entradaB, setEntradaB] = useState(0);

  // Tab 4 — Chip
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number>(1);

  // Cálculos derivados
  const tau = useMemo(() => calcularTau(rOhms, cFarads), [rOhms, cFarads]);
  const fCorte = useMemo(() => 1 / (2 * Math.PI * tau), [tau]);
  const transistorOn = vBE >= 0.7;
  const iB = transistorOn ? (vBE - 0.7) / 1000 : 0; // mA aproximado
  const iC = iB * beta;
  const ganancia = beta;

  const tabla = useMemo(() => tablaVerdad(puertaSeleccionada), [puertaSeleccionada]);
  const salidaActual = useMemo(() => {
    const fila = tabla.find(f =>
      puertaSeleccionada === 'NOT' ? f.a === entradaA : f.a === entradaA && f.b === entradaB
    );
    return fila ? fila.salida : 0;
  }, [tabla, entradaA, entradaB, puertaSeleccionada]);

  // Half adder
  const halfAdderSuma = entradaA ^ entradaB;
  const halfAdderCarry = entradaA & entradaB;

  const nivelInfo = NIVELES_CHIP.find(n => n.id === nivelSeleccionado);

  const rSliderPct = ((Math.log10(rOhms) - Math.log10(100)) / (Math.log10(100000) - Math.log10(100)) * 100).toFixed(1);
  const cSliderPct = ((Math.log10(cFarads) - Math.log10(1e-9)) / (Math.log10(1e-3) - Math.log10(1e-9)) * 100).toFixed(1);

  function formatR(v: number) {
    if (v >= 1000) return `${(v / 1000).toFixed(1)} kΩ`;
    return `${v} Ω`;
  }
  function formatC(v: number) {
    if (v >= 1e-3) return `${(v * 1e3).toFixed(1)} mF`;
    if (v >= 1e-6) return `${(v * 1e6).toFixed(1)} µF`;
    if (v >= 1e-9) return `${(v * 1e9).toFixed(1)} nF`;
    return `${v} F`;
  }

  const COMPONENTES: { id: ComponenteRLC; nombre: string; emoji: string; ley: string; desc: string; color: string }[] = [
    { id: 'R', nombre: 'Resistor', emoji: '⬛', ley: 'V = I · R', desc: 'Impide el paso de la corriente. La impedancia es constante con la frecuencia.', color: '#e74c3c' },
    { id: 'L', nombre: 'Inductor', emoji: '🌀', ley: 'V = L · dI/dt', desc: 'Almacena energía en campo magnético. Su impedancia aumenta con la frecuencia.', color: '#f39c12' },
    { id: 'C', nombre: 'Condensador', emoji: '⚡', ley: 'I = C · dV/dt', desc: 'Almacena energía en campo eléctrico. Su impedancia disminuye con la frecuencia.', color: '#2E86AB' },
  ];

  const PUERTAS: PuertaLogica[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>⚡ Circuitos Electrónicos</h1>
          <p className={styles.heroSubtitle}>
            De los componentes básicos al chip moderno: R, L, C, transistores, puertas lógicas y la jerarquía que hace posible la computación
          </p>
        </header>

        <LegalNotice />

        {/* Tabs de navegación */}
        <nav className={styles.tabNav} aria-label="Secciones del visualizador">
          {([
            { id: 'rlc', label: 'R, L, C', icon: '🔌' },
            { id: 'transistor', label: 'Transistor BJT', icon: '📡' },
            { id: 'puertas', label: 'Puertas Lógicas', icon: '🔀' },
            { id: 'chip', label: 'Al chip', icon: '💾' },
          ] as { id: TabActiva; label: string; icon: string }[]).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActiva(tab.id)}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              aria-pressed={tabActiva === tab.id}
            >
              <span className={styles.tabIcon} aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ══════════════════════════════════════════
            TAB 1 — Componentes R, L, C
        ══════════════════════════════════════════ */}
        {tabActiva === 'rlc' && (
          <section className={styles.seccion} aria-labelledby="titulo-rlc">
            <h2 id="titulo-rlc" className={styles.seccionTitulo}>Componentes Pasivos: R, L, C</h2>
            <p className={styles.seccionDesc}>
              Los tres bloques fundamentales de la electrónica analógica. Selecciona uno para ver su símbolo, la ley que lo gobierna y cómo varía su impedancia con la frecuencia.
            </p>

            {/* Selector de componente */}
            <div className={styles.componentesGrid}>
              {COMPONENTES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setComponenteSeleccionado(c.id)}
                  className={`${styles.componenteCard} ${componenteSeleccionado === c.id ? styles.componenteCardActivo : ''}`}
                  aria-pressed={componenteSeleccionado === c.id}
                >
                  <span className={styles.componenteEmoji} aria-hidden="true">{c.emoji}</span>
                  <span className={styles.componenteNombre}>{c.nombre} ({c.id})</span>
                  <code className={styles.componenteLey}>{c.ley}</code>
                </button>
              ))}
            </div>

            {/* Detalle del componente seleccionado */}
            {(() => {
              const comp = COMPONENTES.find(c => c.id === componenteSeleccionado)!;
              return (
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitulo}>{comp.nombre}</span>
                    <span className={styles.leyBadge}>{comp.ley}</span>
                  </div>
                  <p className={styles.cardDesc}>{comp.desc}</p>
                  <div className={styles.graficaGrid}>
                    <div>
                      <p className={styles.graficaLabel}>Impedancia Z vs Frecuencia (escala log)</p>
                      <GraficaImpedancia componente={componenteSeleccionado} r={rOhms} c={cFarads} l={lHenrios} />
                      <p className={styles.graficaHint}>
                        {componenteSeleccionado === 'R' && 'Z = R — independiente de la frecuencia'}
                        {componenteSeleccionado === 'L' && 'Z_L = ωL — sube proporcionalmente a f'}
                        {componenteSeleccionado === 'C' && 'Z_C = 1/(ωC) — baja al aumentar f'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Circuito RC */}
            <div className={styles.card}>
              <h3 className={styles.subTitulo}>Circuito RC en Serie</h3>
              <p className={styles.cardDesc}>
                Un resistor y un condensador en serie forman un circuito de primer orden. Ajusta R y C para ver cómo cambia la velocidad de carga y la frecuencia de corte.
              </p>

              <div className={styles.slidersGrid}>
                <div className={styles.sliderGroup}>
                  <label className={styles.sliderLabel}>
                    Resistencia (R)
                    <span className={styles.sliderValor}>{formatR(rOhms)}</span>
                  </label>
                  <input
                    type="range" min="0" max="100" step="1"
                    value={((Math.log10(rOhms) - Math.log10(100)) / (Math.log10(100000) - Math.log10(100)) * 100).toFixed(0)}
                    onChange={e => {
                      const pct = Number(e.target.value) / 100;
                      setROhms(Math.round(Math.pow(10, Math.log10(100) + pct * (Math.log10(100000) - Math.log10(100)))));
                    }}
                    className={styles.sliderInput}
                    style={{ '--pct': `${rSliderPct}%` } as React.CSSProperties}
                    aria-label="Resistencia"
                  />
                  <span className={styles.sliderDesc}>100 Ω — 100 kΩ</span>
                </div>
                <div className={styles.sliderGroup}>
                  <label className={styles.sliderLabel}>
                    Capacidad (C)
                    <span className={styles.sliderValor}>{formatC(cFarads)}</span>
                  </label>
                  <input
                    type="range" min="0" max="100" step="1"
                    value={((Math.log10(cFarads) - Math.log10(1e-9)) / (Math.log10(1e-3) - Math.log10(1e-9)) * 100).toFixed(0)}
                    onChange={e => {
                      const pct = Number(e.target.value) / 100;
                      setCFarads(Math.pow(10, Math.log10(1e-9) + pct * (Math.log10(1e-3) - Math.log10(1e-9))));
                    }}
                    className={styles.sliderInput}
                    style={{ '--pct': `${cSliderPct}%` } as React.CSSProperties}
                    aria-label="Capacidad"
                  />
                  <span className={styles.sliderDesc}>1 nF — 1000 µF</span>
                </div>
              </div>

              <div className={styles.metricasRow}>
                <div className={styles.metrica}>
                  <span className={styles.metricaLabel}>Constante de tiempo τ = RC</span>
                  <span className={styles.metricaValor}>{formatearTiempo(tau)}</span>
                </div>
                <div className={styles.metrica}>
                  <span className={styles.metricaLabel}>Frecuencia de corte f_c = 1/(2πRC)</span>
                  <span className={styles.metricaValor}>{formatearFrecuencia(fCorte)}</span>
                </div>
              </div>

              <p className={styles.graficaLabel}>Curva de carga: V_C(t) = V_s · (1 − e^(−t/τ))</p>
              <GraficaCargaRC tau={tau} />
              <p className={styles.graficaHint}>A t=τ el condensador alcanza el 63,2% de la tensión de alimentación V_s</p>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            TAB 2 — Transistor BJT
        ══════════════════════════════════════════ */}
        {tabActiva === 'transistor' && (
          <section className={styles.seccion} aria-labelledby="titulo-transistor">
            <h2 id="titulo-transistor" className={styles.seccionTitulo}>Transistor BJT — NPN</h2>
            <p className={styles.seccionDesc}>
              El transistor bipolar de unión (BJT) tiene tres terminales: Base (B), Colector (C) y Emisor (E).
              Puede funcionar como interruptor electrónico o como amplificador de señal.
            </p>

            <div className={styles.transistorLayout}>
              <div className={styles.svgTransistorZona}>
                <SvgTransistorNPN on={transistorOn} />
                <p className={styles.transistorEstado}>
                  Estado: <strong style={{ color: transistorOn ? '#27ae60' : '#e74c3c' }}>
                    {transistorOn ? 'CONDUCCIÓN (ON)' : 'CORTE (OFF)'}
                  </strong>
                </p>
              </div>

              <div className={styles.transistorControles}>
                {/* Selector de modo */}
                <div className={styles.modoSelector}>
                  {(['interruptor', 'amplificador'] as ModoTransistor[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModoTransistor(m)}
                      className={`${styles.modoBtn} ${modoTransistor === m ? styles.modoBtnActivo : ''}`}
                      aria-pressed={modoTransistor === m}
                    >
                      {m === 'interruptor'
                        ? <><span aria-hidden="true">🔌</span> Interruptor</>
                        : <><span aria-hidden="true">📈</span> Amplificador</>}
                    </button>
                  ))}
                </div>

                {modoTransistor === 'interruptor' && (
                  <div className={styles.modoContent}>
                    <div className={styles.sliderGroup}>
                      <label className={styles.sliderLabel}>
                        Tensión base-emisor (V_BE)
                        <span className={styles.sliderValor}>{vBE.toFixed(2)} V</span>
                      </label>
                      <input
                        type="range" min="0" max="100" step="1"
                        value={Math.round(vBE * 100)}
                        onChange={e => setVBE(Number(e.target.value) / 100)}
                        className={styles.sliderInput}
                        style={{ '--pct': `${vBE * 100}%` } as React.CSSProperties}
                        aria-label="Tensión base-emisor"
                      />
                      <span className={styles.sliderDesc}>Umbral: V_BE ≥ 0,70 V → transistor activo</span>
                    </div>

                    <div className={styles.sliderGroup}>
                      <label className={styles.sliderLabel}>
                        Ganancia de corriente (β / h_FE)
                        <span className={styles.sliderValor}>β = {beta}</span>
                      </label>
                      <input
                        type="range" min="50" max="300" step="10"
                        value={beta}
                        onChange={e => setBeta(Number(e.target.value))}
                        className={styles.sliderInput}
                        style={{ '--pct': `${((beta - 50) / 250 * 100).toFixed(1)}%` } as React.CSSProperties}
                        aria-label="Ganancia beta"
                      />
                      <span className={styles.sliderDesc}>50 — 300</span>
                    </div>

                    <div className={styles.metricasCol}>
                      <div className={`${styles.metrica} ${transistorOn ? styles.metricaOn : styles.metricaOff}`}>
                        <span className={styles.metricaLabel}>I_B (corriente de base)</span>
                        <span className={styles.metricaValor}>{transistorOn ? `${(iB * 1e6).toFixed(1)} µA` : '0 µA'}</span>
                      </div>
                      <div className={`${styles.metrica} ${transistorOn ? styles.metricaOn : styles.metricaOff}`}>
                        <span className={styles.metricaLabel}>I_C = β · I_B (corriente de colector)</span>
                        <span className={styles.metricaValor}>{transistorOn ? `${(iC * 1e3).toFixed(2)} mA` : '0 mA'}</span>
                      </div>
                    </div>

                    <div className={`${styles.warningBox} ${transistorOn ? styles.warningOn : styles.warningOff}`}>
                      <span aria-hidden="true">{transistorOn ? '💡' : '⭕'}</span>
                      {transistorOn
                        ? `Transistor en conducción: I_C = β·I_B ≈ ${(iC * 1e3).toFixed(2)} mA. El colector controla la carga (bombilla, motor, LED).`
                        : 'Transistor en corte: ninguna corriente fluye por colector-emisor. La carga está apagada.'}
                    </div>

                    <p className={styles.infoTexto}>
                      <strong>Ejemplo real:</strong> Un microcontrolador (3,3 V logic) no puede dar corriente suficiente para encender una bombilla directamente.
                      Un transistor amplifica esa pequeña corriente de base (µA) para controlar varios amperios en el colector.
                    </p>
                  </div>
                )}

                {modoTransistor === 'amplificador' && (
                  <div className={styles.modoContent}>
                    <div className={styles.sliderGroup}>
                      <label className={styles.sliderLabel}>
                        Señal de entrada (V_in)
                        <span className={styles.sliderValor}>{senalEntradaMV} mV</span>
                      </label>
                      <input
                        type="range" min="1" max="100" step="1"
                        value={senalEntradaMV}
                        onChange={e => setSenalEntradaMV(Number(e.target.value))}
                        className={styles.sliderInput}
                        style={{ '--pct': `${senalEntradaMV}%` } as React.CSSProperties}
                        aria-label="Señal de entrada en milivoltios"
                      />
                      <span className={styles.sliderDesc}>1 mV — 100 mV (señal pequeña)</span>
                    </div>

                    <div className={styles.amplificadorViz}>
                      <div className={styles.senalBox}>
                        <p className={styles.senalLabel}>Entrada V_in</p>
                        <p className={styles.senalValor}>{senalEntradaMV} mV</p>
                        <SvgOndaSeno amplitud={Math.min(senalEntradaMV / 100, 0.3)} color="var(--secondary)" />
                      </div>
                      <div className={styles.flechaAmplificacion}>
                        <span>×{ganancia}</span>
                        <span>→</span>
                      </div>
                      <div className={styles.senalBox}>
                        <p className={styles.senalLabel}>Salida V_out</p>
                        <p className={styles.senalValor}>{(senalEntradaMV * ganancia / 1000).toFixed(2)} V</p>
                        <SvgOndaSeno amplitud={Math.min((senalEntradaMV * ganancia) / 10000, 0.9)} color="var(--primary)" invertida />
                      </div>
                    </div>

                    {senalEntradaMV * ganancia > 5000 && (
                      <div className={`${styles.warningBox} ${styles.warningOff}`}>
                        <span aria-hidden="true">⚠️</span> La señal amplificada ({(senalEntradaMV * ganancia / 1000).toFixed(2)} V) supera la tensión de alimentación típica (5 V) — el transistor entraría en saturación y la señal se recortaría (clipping).
                      </div>
                    )}

                    <div className={styles.metricasRow}>
                      <div className={styles.metrica}>
                        <span className={styles.metricaLabel}>Ganancia de tensión</span>
                        <span className={styles.metricaValor}>A_v ≈ −β · R_C/r_e ≈ −{ganancia}</span>
                      </div>
                    </div>
                    <p className={styles.infoTexto}>
                      La señal de salida está <strong>invertida 180°</strong> respecto a la entrada (ganancia negativa).
                      Para audio, esta inversión es compensada con otro transistor en configuración de amplificador en cascada.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            TAB 3 — Puertas Lógicas
        ══════════════════════════════════════════ */}
        {tabActiva === 'puertas' && (
          <section className={styles.seccion} aria-labelledby="titulo-puertas">
            <h2 id="titulo-puertas" className={styles.seccionTitulo}>Puertas Lógicas</h2>
            <p className={styles.seccionDesc}>
              Las puertas lógicas son los bloques de la electrónica digital. Implementan el álgebra booleana: operan con 0 (falso) y 1 (verdadero).
              Elige una puerta, activa las entradas A y B y observa la salida.
            </p>

            {/* Selector de puerta */}
            <div className={styles.puertasSelector}>
              {PUERTAS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPuertaSeleccionada(p); setEntradaA(0); setEntradaB(0); }}
                  className={`${styles.puertaBtn} ${puertaSeleccionada === p ? styles.puertaBtnActivo : ''}`}
                  aria-pressed={puertaSeleccionada === p}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className={styles.puertaLayout}>
              {/* SVG + entradas */}
              <div className={styles.puertaVizCol}>
                <div className={styles.svgPuertaZona}>
                  <SvgPuerta puerta={puertaSeleccionada} />
                </div>

                {/* Toggles de entrada */}
                <div className={styles.entradasGrid}>
                  <button
                    type="button"
                    onClick={() => setEntradaA(entradaA ? 0 : 1)}
                    className={`${styles.toggleBtn} ${entradaA ? styles.toggleOn : styles.toggleOff}`}
                    aria-pressed={!!entradaA}
                    aria-label="Entrada A"
                  >
                    A = {entradaA}
                  </button>
                  {puertaSeleccionada !== 'NOT' && (
                    <button
                      type="button"
                      onClick={() => setEntradaB(entradaB ? 0 : 1)}
                      className={`${styles.toggleBtn} ${entradaB ? styles.toggleOn : styles.toggleOff}`}
                      aria-pressed={!!entradaB}
                      aria-label="Entrada B"
                    >
                      B = {entradaB}
                    </button>
                  )}
                </div>

                {/* LED resultado */}
                <div className={styles.ledResultado} role="status" aria-live="polite">
                  <div className={`${styles.led} ${salidaActual ? styles.ledOn : styles.ledOff}`} aria-hidden="true" />
                  <p className={styles.ledLabel}>Salida: <strong>{salidaActual}</strong></p>
                </div>
              </div>

              {/* Tabla de verdad */}
              <div className={styles.tablaVerdadZona}>
                <h3 className={styles.subTitulo}>Tabla de verdad — {puertaSeleccionada}</h3>
                <table className={styles.tablaVerdad} aria-label={`Tabla de verdad de la puerta ${puertaSeleccionada}`}>
                  <thead>
                    <tr>
                      <th>A</th>
                      {puertaSeleccionada !== 'NOT' && <th>B</th>}
                      <th>Salida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabla.map((fila, i) => {
                      const activa = puertaSeleccionada === 'NOT'
                        ? fila.a === entradaA
                        : fila.a === entradaA && fila.b === entradaB;
                      return (
                        <tr key={i} className={activa ? styles.filaActiva : ''} aria-current={activa ? 'true' : undefined}>
                          <td>{fila.a}</td>
                          {puertaSeleccionada !== 'NOT' && <td>{fila.b}</td>}
                          <td className={fila.salida ? styles.salidaUno : styles.salidaCero}>{fila.salida}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Descripción de la puerta */}
                <div className={styles.puertaDesc}>
                  {puertaSeleccionada === 'AND' && <p>AND: la salida es 1 <strong>solo si A=1 y B=1</strong>. Implementa la multiplicación booleana.</p>}
                  {puertaSeleccionada === 'OR' && <p>OR: la salida es 1 <strong>si al menos una entrada es 1</strong>. Implementa la suma booleana.</p>}
                  {puertaSeleccionada === 'NOT' && <p>NOT (inversor): invierte la entrada. A=0 → 1, A=1 → 0. Es la puerta más simple: 2 transistores CMOS.</p>}
                  {puertaSeleccionada === 'NAND' && <p>NAND (NOT AND): inverso de AND. Es <strong>funcionalmente completa</strong>: cualquier circuito se puede construir solo con NAND.</p>}
                  {puertaSeleccionada === 'NOR' && <p>NOR (NOT OR): inverso de OR. También es <strong>funcionalmente completa</strong>: cualquier función lógica se puede implementar con NOR.</p>}
                  {puertaSeleccionada === 'XOR' && <p>XOR (OR exclusivo): la salida es 1 <strong>solo si las entradas son diferentes</strong>. Esencial para sumas binarias y detección de errores.</p>}
                  {puertaSeleccionada === 'XNOR' && <p>XNOR (XOR negado): la salida es 1 <strong>solo si las entradas son iguales</strong>. Usado en comparadores y circuitos de paridad.</p>}
                </div>
              </div>
            </div>

            {/* Half Adder */}
            <div className={styles.card}>
              <h3 className={styles.subTitulo}>Suma de 1 bit: Half Adder</h3>
              <p className={styles.cardDesc}>
                Un half adder combina una puerta XOR (para la suma) y una puerta AND (para el acarreo) para sumar dos bits.
                Es el bloque básico de cualquier unidad aritmético-lógica (ALU).
              </p>
              <div className={styles.halfAdderLayout}>
                <div className={styles.halfAdderEntradas}>
                  <div className={styles.halfAdderBit}>A = {entradaA}</div>
                  <div className={styles.halfAdderBit}>B = {entradaB}</div>
                </div>
                <svg viewBox="0 0 200 100" className={styles.halfAdderSvg} aria-label="Diagrama half adder">
                  {/* Líneas de entrada */}
                  <line x1="0" y1="30" x2="30" y2="30" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="0" y1="70" x2="30" y2="70" stroke="currentColor" strokeWidth="1.5" />
                  {/* XOR - suma */}
                  <path d="M30 18 Q43 18 54 18 Q76 18 78 30 Q76 42 54 42 Q43 42 30 42 Q38 30 30 18 Z" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
                  <path d="M27 18 Q35 30 27 42" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
                  <text x="54" y="33" fontSize="7" fill="var(--primary)" textAnchor="middle" fontWeight="700">XOR</text>
                  {/* AND - carry */}
                  <path d="M30 58 L30 82 L54 82 Q76 82 76 70 Q76 58 54 58 Z" fill="none" stroke="var(--secondary)" strokeWidth="1.5" />
                  <text x="52" y="73" fontSize="7" fill="var(--secondary)" textAnchor="middle" fontWeight="700">AND</text>
                  {/* Salidas */}
                  <line x1="78" y1="30" x2="120" y2="30" stroke="var(--primary)" strokeWidth="1.5" />
                  <line x1="76" y1="70" x2="120" y2="70" stroke="var(--secondary)" strokeWidth="1.5" />
                  {/* Labels */}
                  <text x="125" y="33" fontSize="9" fill="var(--primary)" fontWeight="700">Suma={halfAdderSuma}</text>
                  <text x="125" y="73" fontSize="9" fill="var(--secondary)" fontWeight="700">Carry={halfAdderCarry}</text>
                  {/* Estado activo */}
                  <circle cx="108" cy="30" r="4" fill={halfAdderSuma ? 'var(--primary)' : 'var(--border)'} />
                  <circle cx="108" cy="70" r="4" fill={halfAdderCarry ? 'var(--secondary)' : 'var(--border)'} />
                </svg>
                <div className={styles.halfAdderResultado}>
                  <p>A + B = <strong>{entradaA} + {entradaB}</strong></p>
                  <p>Suma: <strong className={halfAdderSuma ? styles.salidaUno : ''}>{halfAdderSuma}</strong></p>
                  <p>Carry (acarreo): <strong className={halfAdderCarry ? styles.salidaUno : ''}>{halfAdderCarry}</strong></p>
                  {halfAdderCarry === 1 && <p className={styles.infoTexto}>El resultado en binario es <strong>10</strong> = 2 en decimal.</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            TAB 4 — Del Transistor al Chip
        ══════════════════════════════════════════ */}
        {tabActiva === 'chip' && (
          <section className={styles.seccion} aria-labelledby="titulo-chip">
            <h2 id="titulo-chip" className={styles.seccionTitulo}>Del Transistor al Chip</h2>
            <p className={styles.seccionDesc}>
              Un procesador moderno es una jerarquía de abstracción. En la base, millones de transistores MOSFET; en la cima, registros, cachés, núcleos y unidades funcionales.
              Haz clic en cada nivel para explorar su composición.
            </p>

            {/* Diagrama jerárquico */}
            <div className={styles.chipJerarquia}>
              {NIVELES_CHIP.map(nivel => (
                <button
                  key={nivel.id}
                  type="button"
                  onClick={() => setNivelSeleccionado(nivel.id)}
                  className={`${styles.nivelBtn} ${nivelSeleccionado === nivel.id ? styles.nivelBtnActivo : ''}`}
                  aria-pressed={nivelSeleccionado === nivel.id}
                >
                  <div className={styles.nivelNumero}>{nivel.id}</div>
                  <div className={styles.nivelInfo}>
                    <span className={styles.nivelNombre}>{nivel.nombre}</span>
                    <span className={styles.nivelTransistores}>≈ {formatearTransistores(nivel.transistores)} transistor{nivel.transistores > 1 ? 'es' : ''}</span>
                  </div>
                  <div className={styles.nivelFlecha} aria-hidden="true">▶</div>
                </button>
              ))}
            </div>

            {/* Detalle del nivel */}
            {nivelInfo && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitulo}>Nivel {nivelInfo.id}: {nivelInfo.nombre}</span>
                </div>
                <p className={styles.cardDesc}>{nivelInfo.descripcion}</p>
                <div className={styles.nivelDetalle}>
                  <div className={styles.nivelComposicion}>
                    <span className={styles.metricaLabel}>Composición</span>
                    <span className={styles.metricaValor}>{nivelInfo.composicion}</span>
                  </div>
                  <div className={styles.nivelComposicion}>
                    <span className={styles.metricaLabel}>Transistores totales</span>
                    <span className={styles.metricaValor}>{formatearTransistores(nivelInfo.transistores)}</span>
                  </div>
                </div>

                {/* SVG simplificado según nivel */}
                {nivelInfo.id === 1 && (
                  <svg viewBox="0 0 200 100" className={styles.chipSvg} aria-label="Esquema MOSFET">
                    <rect x="70" y="30" width="60" height="40" rx="4" fill="none" stroke="var(--primary)" strokeWidth="2" />
                    <line x1="10" y1="50" x2="70" y2="50" stroke="var(--secondary)" strokeWidth="2" />
                    <line x1="100" y1="10" x2="100" y2="30" stroke="var(--primary)" strokeWidth="2" />
                    <line x1="130" y1="50" x2="190" y2="50" stroke="var(--primary)" strokeWidth="2" />
                    <text x="100" y="54" textAnchor="middle" fontSize="10" fill="var(--primary)" fontWeight="700">MOSFET</text>
                    <text x="10" y="45" fontSize="9" fill="var(--text-secondary)">Gate</text>
                    <text x="100" y="22" textAnchor="middle" fontSize="9" fill="var(--text-secondary)">Drain</text>
                    <text x="160" y="45" fontSize="9" fill="var(--text-secondary)">Source</text>
                  </svg>
                )}
                {nivelInfo.id === 2 && (
                  <div className={styles.puertaCmosGrid}>
                    <div className={styles.puertaCmosItem}>
                      <p className={styles.senalLabel}>PMOS (canal P)</p>
                      <div className={styles.cmosBox} style={{ background: 'rgba(46,134,171,0.12)', borderColor: 'var(--primary)' }}>Fuente: V_DD</div>
                    </div>
                    <div className={styles.puertaCmosItem}>
                      <p className={styles.senalLabel}>NMOS (canal N)</p>
                      <div className={styles.cmosBox} style={{ background: 'rgba(72,169,166,0.12)', borderColor: 'var(--secondary)' }}>Fuente: GND</div>
                    </div>
                  </div>
                )}
                {nivelInfo.id >= 3 && (
                  <div className={styles.registroViz}>
                    {Array.from({ length: nivelInfo.id === 3 ? 6 : 8 }).map((_, i) => (
                      <div key={i} className={styles.flipFlopBox}>
                        <span className={styles.flipFlopLabel}>{nivelInfo.id === 3 ? `G${i + 1}` : `FF${i}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dato impactante */}
            <div className={styles.datoImpactante} role="note">
              <p className={styles.datoLabel}>Dato impactante</p>
              <p className={styles.datoValor}>50.000 millones</p>
              <p className={styles.datoDesc}>transistores en un procesador moderno (Apple M2, 2023)</p>
            </div>

            {/* Timeline */}
            <div className={styles.card}>
              <h3 className={styles.subTitulo}>Ley de Moore: densidad de transistores</h3>
              <p className={styles.cardDesc}>
                Gordon Moore predijo en 1965 que el número de transistores por chip se duplicaría cada ~2 años. La ley se cumplió durante décadas,
                aunque actualmente los límites cuánticos a escala de 2-3 nm la están desafiando.
              </p>
              <div className={styles.timeline}>
                {TIMELINE.map(item => {
                  const maxT = TIMELINE[TIMELINE.length - 1].transistores;
                  const barPct = Math.max(2, (Math.log10(item.transistores) / Math.log10(maxT)) * 100);
                  return (
                    <div key={item.anio} className={styles.timelineItem}>
                      <span className={styles.timelineAnio}>{item.anio}</span>
                      <div className={styles.timelineBarWrapper}>
                        <div className={styles.timelineBar} style={{ width: `${barPct}%` }} />
                      </div>
                      <div className={styles.timelineInfo}>
                        <span className={styles.timelineChip}>{item.chip}</span>
                        <span className={styles.timelineT}>{formatearTransistores(item.transistores)}</span>
                        <span className={styles.timelineEscala}>{item.escala}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Electrónica: de los electrones al chip"
          subtitle="De la ley de Ohm al procesador con 50.000 millones de transistores"
          defaultOpen={false}
        >
          <h3>Comparativa de Componentes y Conceptos</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Componente/Concepto</th>
                  <th>Función principal</th>
                  <th>Parámetro clave</th>
                  <th>Aplicación típica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Resistencia (R)</td>
                  <td>Limitar corriente, dividir tensión</td>
                  <td>Ohm (Ω), tolerancia</td>
                  <td>Pull-up, divisores de tensión</td>
                </tr>
                <tr>
                  <td>Condensador (C)</td>
                  <td>Almacenar carga, filtrar</td>
                  <td>Faradios (F), voltaje máx</td>
                  <td>Filtros paso bajo, fuentes</td>
                </tr>
                <tr>
                  <td>Bobina (L)</td>
                  <td>Almacenar energía magnética</td>
                  <td>Henrios (H), resistencia DC</td>
                  <td>Filtros paso alto, transformadores</td>
                </tr>
                <tr>
                  <td>Transistor BJT</td>
                  <td>Amplificar o conmutar</td>
                  <td>hFE (β), Ic máx, Vce</td>
                  <td>Amplificadores de audio, interruptores</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>📚 Estudiante de Electrónica</h4>
              <p>Antes de conectar un circuito real, simula el comportamiento RLC para entender la resonancia, el factor Q y las impedancias. Ver la curva de respuesta ayuda más que memorizar fórmulas.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🔧 Maker / Hobbyist</h4>
              <p>Verifica si un transistor NPN puede conducir suficiente corriente para activar un relé o un motor: la región de saturación (Vce_sat) dice si el transistor está «completamente abierto».</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>💻 Diseñador Digital</h4>
              <p>Las puertas NAND son universales: combinándolas puedes construir cualquier función lógica. El visualizador muestra cómo 4 NAND implementan un flip-flop RS, base de la memoria SRAM.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🖥️ Arquitecto de CPUs</h4>
              <p>Un procesador moderno tiene 50.000+ millones de transistores en 2 nm. Entender la jerarquía átomo→transistor→puerta→ALU→CPU es esencial para diseñar arquitecturas de silicio eficientes.</p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre resistencia e impedancia?</strong>
              <p>La resistencia (R) se opone a la corriente siempre por igual. La impedancia (Z) incluye la oposición de condensadores e inductores, que depende de la frecuencia. En CC, Z = R. En CA, Z = √(R² + (XL - XC)²).</p>
              <div className={styles.faqTip}>💡 A la frecuencia de resonancia (f₀ = 1/(2π√LC)), XL = XC y la impedancia es mínima (solo R).</div>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo amplifica un transistor si solo tiene 3 terminales?</strong>
              <p>Una pequeña corriente de base (IB, microamperios) controla una corriente de colector mucho mayor (IC, miliamperios). La ganancia de corriente β = IC/IB puede ser 100-500. La energía extra viene de la fuente de alimentación.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué se dice que NAND es una puerta universal?</strong>
              <p>Porque con solo puertas NAND puedes construir NOT (1 NAND), AND (NAND + NOT), OR (3 NAND), y por tanto cualquier función lógica. CMOS NAND es además muy eficiente energéticamente al combinar PMOS y NMOS.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa exactamente en la resonancia RLC?</strong>
              <p>Cuando XL = XC, la bobina y el condensador se «intercambian» energía entre sí (magnética↔eléctrica) sin consumirla. La corriente alcanza su máximo (limitada solo por R) y la impedancia es mínima. La frecuencia de resonancia es f₀ = 1/(2π√LC).</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuántos transistores hay en un procesador actual?</strong>
              <p>El Apple M3 Ultra (2024) tiene 184.000 millones. Un Intel Core i9 de 2023 ronda los 26.000 millones. Cada transistor es un interruptor nanométrico: con tecnología de 2 nm, caben 100 millones de transistores en 1 mm².</p>
            </div>
          </div>

          <h3>Guía de Uso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Explora RLC y resonancia</h4>
                <p>Ajusta R, L y C con los sliders. Observa cómo la frecuencia de resonancia cambia y cómo el factor Q (selectividad) depende de la resistencia.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Visualiza las zonas del transistor</h4>
                <p>En la pestaña BJT, mueve el slider de IB. Observa la transición de corte (off) → activa (amplificación) → saturación (on). Las curvas características I-V muestran cada región.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Prueba todas las puertas lógicas</h4>
                <p>Cambia las entradas A y B para cada tipo de puerta. Verifica que la tabla de verdad coincide con la salida Y. Nota que NAND y NOR son el inverso de AND y OR.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Recorre la jerarquía del chip</h4>
                <p>En la pestaña de jerarquía, sigue el recorrido: átomo de silicio → transistor → puerta lógica → biestable → sumador → ALU → núcleo → procesador.</p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <div>
                <strong>Ley de Ohm extendida</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>V = Z·I funciona igual que V = R·I pero con Z como número complejo. En CC, la parte imaginaria es cero y vuelves a la ley de Ohm clásica.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔌</span>
              <div>
                <strong>Transistor: región activa = amplificación</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Para amplificar, el transistor debe estar en región activa (Vbe ≈ 0,6 V, Vce &gt; 0,2 V). En saturación o corte solo conmuta: on/off.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧩</span>
              <div>
                <strong>NAND como bloque universal</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>En diseño digital CMOS, implementar todo con NAND simplifica el proceso de fabricación y reduce la variabilidad. Una tecnología de puerta vs muchas.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📉</span>
              <div>
                <strong>Ley de Moore y sus límites físicos</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>La duplicación de transistores cada 2 años se frena: a 2 nm, los gates tienen solo 10 átomos de grosor. Efecto túnel y disipación térmica son los límites físicos actuales.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBoxEdu}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores Conceptuales Frecuentes
            </div>
            <ul className={styles.warningList}>
              <li><strong>Impedancia ≠ resistencia en CA</strong> — Un condensador en CC es un circuito abierto (XC = ∞). En CA a alta frecuencia, XC → 0 y actúa casi como un hilo. Confundirlos destruye el análisis del circuito.</li>
              <li><strong>Transistor en saturación NO amplifica</strong> — En saturación, el transistor está «encendido» al máximo: IC es máxima pero ya no obedece IC = β·IB. Solo sirve para conmutación digital, no para amplificación lineal.</li>
              <li><strong>El fanout limita cuántas puertas puedes conectar</strong> — Cada puerta lógica puede conducir solo un número finito de entradas (fanout típico: 10-50 en CMOS). Superar el fanout degrada la señal y ralentiza el circuito.</li>
              <li><strong>La resonancia amplifica, pero también puede destruir</strong> — En circuitos de potencia, la resonancia puede generar sobretensiones que superan la tensión nominal de los componentes. El factor Q alto implica mayor amplificación y mayor riesgo.</li>
              <li><strong>NOT + AND ≠ NAND (en orden)</strong> — NAND(A,B) = NOT(AND(A,B)), no NOT(A) AND NOT(B). Aplicar De Morgan incorrectamente es un error clásico en diseño digital.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-circuitos-electronicos')} />
        <ShareCard appName="visualizador-circuitos-electronicos" />
        <Footer appName="visualizador-circuitos-electronicos" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: onda seno para amplificador
// ─────────────────────────────────────────────

function SvgOndaSeno({ amplitud, color, invertida = false }: { amplitud: number; color: string; invertida?: boolean }) {
  const W = 100, H = 50, cy = 25;
  const puntos: string[] = [];
  for (let i = 0; i <= W; i++) {
    const x = i;
    const rawY = Math.sin((i / W) * 2 * Math.PI) * amplitud * H * (invertida ? -1 : 1);
    const y = cy + rawY;
    puntos.push(`${x},${y}`);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 60 }} aria-hidden="true">
      <line x1="0" y1={cy} x2={W} y2={cy} stroke="var(--border)" strokeWidth="0.5" />
      <polyline points={puntos.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
