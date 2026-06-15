'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './CineticaQuimica.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface EjemploPerfil {
  nombre: string;
  ea: number;
  deltaH: number;
  eaCat: number;
  catalizador: string;
}

interface FactorVelocidad {
  icono: string;
  titulo: string;
  mecanismo: string;
  ejemplo: string;
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const R_UNIVERSAL = 8.314; // J/(mol·K)
const FACTOR_A = 1e13;     // Factor preexponencial (orden de magnitud típico)

const EJEMPLOS_PERFIL: EjemploPerfil[] = [
  { nombre: 'H₂/O₂ con Pt', ea: 150, deltaH: -241, eaCat: 50, catalizador: 'Pt' },
  { nombre: 'H₂O₂ (MnO₂)', ea: 75, deltaH: -98, eaCat: 30, catalizador: 'MnO₂' },
  { nombre: 'NH₃ Haber-Bosch', ea: 230, deltaH: -46, eaCat: 150, catalizador: 'Fe' },
];

const FACTORES: FactorVelocidad[] = [
  {
    icono: '🌡️',
    titulo: 'Temperatura',
    mecanismo:
      'Al aumentar la temperatura, las moléculas tienen más energía cinética. Una fracción mayor supera la barrera de activación Ea. Según Arrhenius, la constante k crece exponencialmente con T — no de forma lineal.',
    ejemplo: 'Regla de van\'t Hoff: por cada 10 °C de aumento, la velocidad se aproximadamente duplica. La nevera baja a ~4 °C para ralentizar la descomposición de los alimentos.',
  },
  {
    icono: '🧪',
    titulo: 'Concentración',
    mecanismo:
      'A mayor concentración de reactivos, hay más moléculas por unidad de volumen, lo que aumenta la frecuencia de colisiones. Solo las colisiones con orientación y energía correctas producen reacción.',
    ejemplo: 'Combustión: el oxígeno puro enciende materiales que no arden en aire (21% O₂). El hierro arde vigorosamente en O₂ puro (pastilla efervescente en O₂ vs. aire).',
  },
  {
    icono: '⚡',
    titulo: 'Catalizadores',
    mecanismo:
      'Los catalizadores ofrecen una ruta alternativa de reacción con menor Ea. No se consumen ni alteran el ΔH o ΔG — solo bajan la barrera. Catalizadores heterogéneos (sólido + gas/líquido) y homogéneos (misma fase).',
    ejemplo: 'Convertidor catalítico del coche (Pt/Pd/Rh): oxida CO y NOₓ a 300 °C en vez de los 600+ °C que requeriría sin catalizador. Las enzimas son biocatalizadores: aceleran reacciones 10⁶–10¹² veces.',
  },
  {
    icono: '📐',
    titulo: 'Superficie de contacto',
    mecanismo:
      'En reacciones heterogéneas (sólido + fluido), la reacción ocurre en la superficie del sólido. Dividir el sólido en partículas menores aumenta drásticamente el área superficial expuesta.',
    ejemplo: 'Explosión de polvo de harina: un grano de trigo es inerte, pero el polvo suspendido tiene enorme área superficial y puede explotar. Las pastillas efervescentes se disuelven mucho más rápido en polvo que enteras.',
  },
  {
    icono: '☀️',
    titulo: 'Luz y radiación',
    mecanismo:
      'Algunos fotones tienen energía suficiente para excitar moléculas, superando la Ea o generando radicales libres que inician cadenas de reacción. Esto se llama fotocatálisis o fotoquímica.',
    ejemplo: 'Destrucción del ozono estratosférico: la luz UV divide O₃ → O₂ + O• (radical). Los CFC actúan como catalizadores en cadena. Fotosíntesis: la clorofila capta fotones para impulsar una reacción termodinámicamente desfavorable (ΔG > 0).',
  },
];

// ─────────────────────────────────────────────
// Componente: SVG Perfil de Energía
// ─────────────────────────────────────────────

interface SvgPerfilProps {
  ea: number;
  deltaH: number;
  eaCat: number;
  mostrarCat: boolean;
}

function SvgPerfil({ ea, deltaH, mostrarCat, eaCat }: SvgPerfilProps) {
  const W = 400;
  const H = 260;
  const padX = 36;
  const padY = 20;
  const plotW = W - padX * 2;
  const plotH = H - padY * 2 - 20;

  // Energías relativas (kJ/mol): reactivos = 0, TS = +ea, productos = deltaH
  const energiaMax = ea + 10;
  const energiaMin = Math.min(0, deltaH) - 10;
  const rango = energiaMax - energiaMin;

  const yEscala = (e: number) => padY + plotH - ((e - energiaMin) / rango) * plotH;

  const yReact = yEscala(0);
  const yTS = yEscala(ea);
  const yProd = yEscala(deltaH);
  const yTScat = yEscala(eaCat);

  // Construir path suave para la curva de energía (sin catalizador)
  const x0 = padX;
  const x1 = padX + plotW * 0.35;
  const x2 = padX + plotW * 0.5;
  const x3 = padX + plotW * 0.65;
  const x4 = padX + plotW;

  const pathNormal = `M ${x0},${yReact} C ${x1},${yReact} ${x1},${yTS} ${x2},${yTS} C ${x3},${yTS} ${x3},${yProd} ${x4},${yProd}`;
  const pathCat = `M ${x0},${yReact} C ${x1},${yReact} ${x1},${yTScat} ${x2},${yTScat} C ${x3},${yTScat} ${x3},${yProd} ${x4},${yProd}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.svgGrafico}
      aria-label="Perfil de energía de reacción con estado de transición"
      role="img"
    >
      <defs>
        <marker id="arrowE" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#999" />
        </marker>
      </defs>

      {/* Fondo */}
      <rect width={W} height={H} fill="var(--bg-card)" rx="8" />

      {/* Eje Y */}
      <line x1={padX} y1={padY} x2={padX} y2={padY + plotH + 12} stroke="#ccc" strokeWidth="1" />
      <text x={padX - 4} y={padY + 6} textAnchor="end" fontSize="8" fill="#999">E</text>

      {/* Eje X */}
      <line x1={padX - 4} y1={padY + plotH} x2={padX + plotW + 4} y2={padY + plotH} stroke="#ccc" strokeWidth="1" />
      <text x={padX + plotW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#999">Coordenada de reacción →</text>

      {/* Línea de reactivos */}
      <line x1={x0} y1={yReact} x2={x0 + 20} y2={yReact} stroke="#48A9A6" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
      <text x={x0 + 2} y={yReact - 5} fontSize="8" fill="#48A9A6">Reactivos</text>
      <text x={x0 + 2} y={yReact + 12} fontSize="7" fill="#999">(0 kJ/mol)</text>

      {/* Línea de productos */}
      <line x1={x4 - 20} y1={yProd} x2={x4} y2={yProd} stroke="#48A9A6" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
      <text x={x4 - 2} y={yProd - 5} fontSize="8" fill="#48A9A6" textAnchor="end">Productos</text>
      <text x={x4 - 2} y={yProd + 12} fontSize="7" fill="#999" textAnchor="end">{deltaH > 0 ? '+' : ''}{deltaH} kJ/mol</text>

      {/* Curva principal */}
      <path d={pathNormal} fill="none" stroke="#2E86AB" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Curva con catalizador */}
      {mostrarCat && (
        <path d={pathCat} fill="none" stroke="#E67E22" strokeWidth="2" strokeDasharray="6 3" strokeLinejoin="round" />
      )}

      {/* Etiqueta TS */}
      <circle cx={x2} cy={yTS} r="4" fill="#2E86AB" />
      <text x={x2 + 6} y={yTS - 4} fontSize="8" fill="#2E86AB" fontWeight="700">TS</text>

      {/* Flecha Ea */}
      <line x1={x2 - 18} y1={yReact} x2={x2 - 18} y2={yTS + 2} stroke="#2E86AB" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" markerEnd="url(#arrowE)" />
      <text x={x2 - 28} y={(yReact + yTS) / 2 + 4} fontSize="8" fill="#2E86AB" fontWeight="700" textAnchor="middle">Ea</text>
      <text x={x2 - 28} y={(yReact + yTS) / 2 + 14} fontSize="7" fill="#2E86AB" textAnchor="middle">{ea} kJ</text>

      {/* Flecha ΔH */}
      {deltaH !== 0 && (
        <>
          <line x1={x4 - 8} y1={yReact} x2={x4 - 8} y2={yProd + 2} stroke="#48A9A6" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" markerEnd="url(#arrowE)" />
          <text x={x4 + 4} y={(yReact + yProd) / 2 + 4} fontSize="8" fill="#48A9A6" fontWeight="600">ΔH</text>
        </>
      )}

      {/* Etiqueta TS catalizador */}
      {mostrarCat && (
        <>
          <circle cx={x2} cy={yTScat} r="4" fill="#E67E22" />
          <text x={x2 + 6} y={yTScat - 4} fontSize="8" fill="#E67E22" fontWeight="700">TS (cat)</text>
          <text x={x2 + 6} y={yTScat + 8} fontSize="7" fill="#E67E22">Ea={eaCat} kJ</text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente: SVG Arrhenius k vs T
// ─────────────────────────────────────────────

interface SvgArrheniusProps {
  eaKJ: number;
  tActual: number;
}

function SvgArrhenius({ eaKJ, tActual }: SvgArrheniusProps) {
  const W = 340;
  const H = 180;
  const padX = 40;
  const padY = 16;
  const plotW = W - padX - 16;
  const plotH = H - padY - 28;

  const eaJ = eaKJ * 1000;
  const calcK = (t: number) => FACTOR_A * Math.exp(-eaJ / (R_UNIVERSAL * t));

  const tMin = 273;
  const tMax = 1000;
  const pasos = 60;

  const kValues = Array.from({ length: pasos + 1 }, (_, i) => {
    const t = tMin + ((tMax - tMin) / pasos) * i;
    return calcK(t);
  });

  const kMax = Math.max(...kValues);
  const kMin = Math.min(...kValues);
  const kRango = kMax - kMin || 1;

  const xEscala = (t: number) => padX + ((t - tMin) / (tMax - tMin)) * plotW;
  const yEscala = (k: number) => padY + plotH - ((k - kMin) / kRango) * plotH;

  const puntos = kValues
    .map((k, i) => {
      const t = tMin + ((tMax - tMin) / pasos) * i;
      return `${xEscala(t)},${yEscala(k)}`;
    })
    .join(' ');

  const xAct = xEscala(tActual);
  const kAct = calcK(tActual);
  const yAct = yEscala(kAct);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.svgGrafico}
      aria-label="Gráfico de Arrhenius: constante k en función de la temperatura T"
      role="img"
    >
      <rect width={W} height={H} fill="var(--bg-card)" rx="8" />

      {/* Ejes */}
      <line x1={padX} y1={padY} x2={padX} y2={padY + plotH + 6} stroke="#ccc" strokeWidth="1" />
      <line x1={padX - 4} y1={padY + plotH} x2={padX + plotW + 4} y2={padY + plotH} stroke="#ccc" strokeWidth="1" />

      {/* Etiquetas ejes */}
      <text x={padX + plotW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#999">Temperatura (K) →</text>
      <text x={8} y={padY + plotH / 2} textAnchor="middle" fontSize="9" fill="#999" transform={`rotate(-90, 8, ${padY + plotH / 2})`}>k →</text>

      {/* Curva k vs T */}
      <polyline points={puntos} fill="none" stroke="#2E86AB" strokeWidth="2" strokeLinejoin="round" />

      {/* Punto actual */}
      <circle cx={xAct} cy={yAct} r="5" fill="#E74C3C" />
      <line x1={xAct} y1={yAct} x2={xAct} y2={padY + plotH} stroke="#E74C3C" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      <text x={xAct} y={padY + plotH + 12} textAnchor="middle" fontSize="8" fill="#E74C3C">{tActual} K</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente: SVG Arrhenius linealizado ln(k) vs 1/T
// ─────────────────────────────────────────────

interface SvgLinealProps {
  eaKJ: number;
  tActual: number;
}

function SvgLineal({ eaKJ, tActual }: SvgLinealProps) {
  const W = 340;
  const H = 180;
  const padX = 44;
  const padY = 16;
  const plotW = W - padX - 16;
  const plotH = H - padY - 28;

  const eaJ = eaKJ * 1000;
  const calcLnK = (t: number) => Math.log(FACTOR_A) - eaJ / (R_UNIVERSAL * t);

  const tMin = 273;
  const tMax = 1000;
  const pasos = 40;

  const puntos1T: number[] = [];
  const puntosLnK: number[] = [];

  for (let i = 0; i <= pasos; i++) {
    const t = tMin + ((tMax - tMin) / pasos) * i;
    puntos1T.push(1 / t);
    puntosLnK.push(calcLnK(t));
  }

  const xMin = Math.min(...puntos1T);
  const xMax = Math.max(...puntos1T);
  const yMin = Math.min(...puntosLnK);
  const yMax = Math.max(...puntosLnK);
  const xRango = xMax - xMin || 1;
  const yRango = yMax - yMin || 1;

  const xE = (v: number) => padX + ((v - xMin) / xRango) * plotW;
  const yE = (v: number) => padY + plotH - ((v - yMin) / yRango) * plotH;

  const puntosStr = puntos1T.map((x, i) => `${xE(x)},${yE(puntosLnK[i])}`).join(' ');

  const x1Act = 1 / tActual;
  const y1Act = calcLnK(tActual);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.svgGrafico}
      aria-label="Gráfico de Arrhenius linealizado: ln(k) en función de 1/T"
      role="img"
    >
      <rect width={W} height={H} fill="var(--bg-card)" rx="8" />

      <line x1={padX} y1={padY} x2={padX} y2={padY + plotH + 6} stroke="#ccc" strokeWidth="1" />
      <line x1={padX - 4} y1={padY + plotH} x2={padX + plotW + 4} y2={padY + plotH} stroke="#ccc" strokeWidth="1" />

      <text x={padX + plotW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#999">1/T (K⁻¹) →</text>
      <text x={8} y={padY + plotH / 2} textAnchor="middle" fontSize="9" fill="#999" transform={`rotate(-90, 8, ${padY + plotH / 2})`}>ln(k)</text>

      <text x={padX + plotW - 4} y={padY + 14} textAnchor="end" fontSize="8" fill="#999" fontStyle="italic">pendiente = -Ea/R</text>

      <polyline points={puntosStr} fill="none" stroke="#48A9A6" strokeWidth="2" strokeLinejoin="round" />

      <circle cx={xE(x1Act)} cy={yE(y1Act)} r="5" fill="#E74C3C" />
      <text x={xE(x1Act)} y={padY + plotH + 12} textAnchor="middle" fontSize="8" fill="#E74C3C">{(x1Act * 1000).toFixed(2)}×10⁻³</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente: SVG Orden de reacción
// ─────────────────────────────────────────────

interface SvgOrdenProps {
  orden: 0 | 1 | 2;
  k: number;
  color: string;
}

function SvgOrden({ orden, k, color }: SvgOrdenProps) {
  const W = 260;
  const H = 160;
  const padX = 32;
  const padY = 14;
  const plotW = W - padX - 12;
  const plotH = H - padY - 24;

  const A0 = 1.0; // concentración inicial normalizada
  const tMax = orden === 0 ? A0 / k : orden === 1 ? 5 / k : 5 / (k * A0);
  const pasos = 50;

  const calcA = (t: number): number => {
    if (orden === 0) return Math.max(0, A0 - k * t);
    if (orden === 1) return A0 * Math.exp(-k * t);
    return A0 / (1 + k * A0 * t);
  };

  const tValues = Array.from({ length: pasos + 1 }, (_, i) => (tMax / pasos) * i);
  const aValues = tValues.map(calcA);

  const xE = (t: number) => padX + (t / tMax) * plotW;
  const yE = (a: number) => padY + plotH - (a / A0) * plotH;

  const puntos = tValues.map((t, i) => `${xE(t)},${yE(aValues[i])}`).join(' ');

  // Vida media
  const t12 = orden === 0 ? A0 / (2 * k) : orden === 1 ? Math.log(2) / k : 1 / (k * A0);
  const xt12 = xE(Math.min(t12, tMax));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.svgGrafico}
      aria-label={`Gráfico de concentración vs tiempo para reacción de orden ${orden}`}
      role="img"
    >
      <rect width={W} height={H} fill="var(--bg-card)" rx="8" />

      <line x1={padX} y1={padY} x2={padX} y2={padY + plotH + 4} stroke="#ccc" strokeWidth="1" />
      <line x1={padX - 4} y1={padY + plotH} x2={padX + plotW + 4} y2={padY + plotH} stroke="#ccc" strokeWidth="1" />

      <text x={padX + plotW / 2} y={H - 4} textAnchor="middle" fontSize="8" fill="#999">Tiempo →</text>
      <text x={padX + 2} y={padY + 8} fontSize="8" fill="#999">[A]₀</text>

      <polyline points={puntos} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />

      {/* Línea de vida media */}
      {t12 <= tMax && (
        <>
          <line x1={xt12} y1={padY + plotH / 2} x2={xt12} y2={padY + plotH} stroke={color} strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
          <text x={xt12 + 2} y={padY + plotH - 4} fontSize="7" fill={color}>t₁/₂</text>
        </>
      )}

      {/* Línea horizontal en A0/2 */}
      <line x1={padX} y1={padY + plotH / 2} x2={padX + plotW} y2={padY + plotH / 2} stroke="#ccc" strokeWidth="0.8" strokeDasharray="3 3" />
      <text x={padX - 2} y={padY + plotH / 2 + 4} fontSize="7" fill="#aaa" textAnchor="end">½[A]₀</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCineticaQuimica() {
  // ── Estado: Perfil de energía ──
  const [ea, setEa] = useState(150);
  const [deltaH, setDeltaH] = useState(-241);
  const [mostrarCat, setMostrarCat] = useState(false);
  const [eaCat, setEaCat] = useState(50);
  const [ejemploActivo, setEjemploActivo] = useState<number | null>(0);

  // ── Estado: Arrhenius ──
  const [eaArr, setEaArr] = useState(80);
  const [tArr, setTArr] = useState(500);

  // ── Estado: Órdenes ──
  const [kOrden0, setKOrden0] = useState(0.1);
  const [kOrden1, setKOrden1] = useState(0.3);
  const [kOrden2, setKOrden2] = useState(0.5);

  // ── Estado: Factores ──
  const [factorActivo, setFactorActivo] = useState<number | null>(null);

  // Cálculo de k con Arrhenius
  const kCalculado = useMemo(() => {
    const eaJ = eaArr * 1000;
    return FACTOR_A * Math.exp(-eaJ / (R_UNIVERSAL * tArr));
  }, [eaArr, tArr]);

  const lnK = Math.log(kCalculado);

  // Vidas medias para órdenes
  const A0 = 1.0;
  const t12_0 = A0 / (2 * kOrden0);
  const t12_1 = Math.log(2) / kOrden1;
  const t12_2 = 1 / (kOrden2 * A0);

  // Cargar ejemplo de perfil
  const cargarEjemplo = (idx: number) => {
    const ej = EJEMPLOS_PERFIL[idx];
    setEa(ej.ea);
    setDeltaH(ej.deltaH);
    setEaCat(ej.eaCat);
    setEjemploActivo(idx);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcono} aria-hidden="true">⚗️</span>
        <h1>Cinética Química</h1>
        <p>
          Energía de activación, ecuación de Arrhenius y órdenes de reacción — qué controla
          la velocidad de las reacciones con visualizaciones interactivas.
        </p>
      </header>

      <LegalNotice />

      {/* ─── 1. Perfil de Energía ─────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Perfil de Energía de Reacción</h2>
        <p className={styles.subtituloSeccion}>
          El estado de transición (complejo activado) es el punto de energía máxima que los reactivos deben superar.
          El catalizador ofrece una ruta alternativa con menor barrera.
        </p>

        <div className={styles.perfilWrapper}>
          {/* SVG */}
          <div className={styles.svgContainer}>
            <SvgPerfil ea={ea} deltaH={deltaH} mostrarCat={mostrarCat} eaCat={eaCat} />
          </div>

          {/* Controles */}
          <div className={styles.controlsPanel}>
            {/* Ejemplos */}
            <div className={styles.controlGrupo}>
              <span className={styles.controlLabel}>Ejemplos preconfigurados:</span>
              <div className={styles.ejemplosBtns}>
                {EJEMPLOS_PERFIL.map((ej, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.btnEjemplo} ${ejemploActivo === i ? styles.btnEjemploActivo : ''}`}
                    onClick={() => cargarEjemplo(i)}
                    aria-pressed={ejemploActivo === i}
                  >
                    {ej.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Ea */}
            <div className={styles.controlGrupo}>
              <label className={styles.controlLabel}>
                Energía de activación Ea: <span className={styles.controlValor}>{ea} kJ/mol</span>
              </label>
              <input
                type="range"
                min={30}
                max={250}
                value={ea}
                onChange={(e) => { setEa(Number(e.target.value)); setEjemploActivo(null); }}
                className={styles.slider}
                aria-label="Energía de activación"
              />
            </div>

            {/* Slider ΔH */}
            <div className={styles.controlGrupo}>
              <label className={styles.controlLabel}>
                Entalpía de reacción ΔH: <span className={styles.controlValor}>{deltaH} kJ/mol</span>
              </label>
              <input
                type="range"
                min={-300}
                max={150}
                value={deltaH}
                onChange={(e) => { setDeltaH(Number(e.target.value)); setEjemploActivo(null); }}
                className={styles.slider}
                aria-label="Entalpía de reacción"
              />
            </div>

            {/* Toggle catalizador */}
            <div className={styles.controlGrupo}>
              <div className={styles.toggleRow}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${mostrarCat ? styles.toggleBtnActivo : ''}`}
                  onClick={() => setMostrarCat((v) => !v)}
                  aria-label={mostrarCat ? 'Desactivar catalizador' : 'Activar catalizador'}
                  aria-pressed={mostrarCat}
                >
                  <span className={styles.toggleBtnHandle} />
                </button>
                <span className={styles.toggleLabel}>
                  {mostrarCat ? `Catalizador activo (Ea = ${eaCat} kJ/mol)` : 'Sin catalizador'}
                </span>
              </div>
              {mostrarCat && (
                <input
                  type="range"
                  min={10}
                  max={Math.max(ea - 10, 15)}
                  value={eaCat}
                  onChange={(e) => setEaCat(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Energía de activación con catalizador"
                />
              )}
            </div>

            {/* Leyenda */}
            <div className={styles.leyendaPeril}>
              <div className={styles.leyendaItem}>
                <div className={styles.leyendaLinea} style={{ background: '#2E86AB' }} />
                <span>Sin catalizador</span>
              </div>
              {mostrarCat && (
                <div className={styles.leyendaItem}>
                  <div className={styles.leyendaLinea} style={{ height: '2px', borderTop: '2px dashed #E67E22', background: 'none' } as React.CSSProperties} />
                  <span>Con catalizador</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Ecuación de Arrhenius ─────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Ecuación de Arrhenius</h2>
        <p className={styles.subtituloSeccion}>
          Relaciona la constante de velocidad k con la temperatura T y la energía de activación Ea
        </p>

        <div className={styles.formulaBox}>
          <div className={styles.formulaTeX}>k = A · e<sup>−Ea/RT</sup></div>
          <div className={styles.formulaDesc}>
            A = factor preexponencial (frecuencia de colisiones con orientación correcta) &nbsp;·&nbsp; R = 8,314 J/(mol·K) &nbsp;·&nbsp; T en Kelvin
          </div>
        </div>

        <div className={styles.arrheniusWrapper}>
          {/* Controles */}
          <div className={styles.controlsPanel}>
            <div className={styles.controlGrupo}>
              <label className={styles.controlLabel}>
                Ea: <span className={styles.controlValor}>{eaArr} kJ/mol</span>
              </label>
              <input
                type="range"
                min={20}
                max={200}
                value={eaArr}
                onChange={(e) => setEaArr(Number(e.target.value))}
                className={styles.slider}
                aria-label="Energía de activación para Arrhenius"
              />
            </div>
            <div className={styles.controlGrupo}>
              <label className={styles.controlLabel}>
                T: <span className={styles.controlValor}>{tArr} K ({tArr - 273} °C)</span>
              </label>
              <input
                type="range"
                min={273}
                max={1000}
                value={tArr}
                onChange={(e) => setTArr(Number(e.target.value))}
                className={styles.slider}
                aria-label="Temperatura"
              />
            </div>

            <div className={styles.arrheniusValorBox} role="status" aria-live="polite" aria-atomic="true">
              <strong>ln(k) relativo</strong>
              <span>{lnK.toFixed(1)}</span>
            </div>

            <div className={styles.reglaPractica}>
              <strong>Regla de van&apos;t Hoff:</strong> por cada 10 °C de aumento de temperatura,
              la velocidad se aproximadamente duplica (equivale a que Ea ≈ 50 kJ/mol). Compruébalo
              moviendo el slider de T en pasos de 10 K y observando el punto rojo en el gráfico.
            </div>
          </div>

          {/* Gráficos */}
          <div className={styles.arrheniusGraficos}>
            <div className={styles.svgContainer}>
              <SvgArrhenius eaKJ={eaArr} tActual={tArr} />
            </div>
            <div className={styles.svgContainer}>
              <SvgLineal eaKJ={eaArr} tActual={tArr} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Órdenes de reacción ───────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Órdenes de Reacción</h2>
        <p className={styles.subtituloSeccion}>
          El orden determina cómo varía la velocidad al cambiar la concentración del reactivo.
          Cada orden tiene una forma característica de curva de concentración vs. tiempo.
        </p>

        <div className={styles.ordenesWrapper}>
          <div className={styles.ordenesGraficos}>
            {/* Orden 0 */}
            <div className={styles.ordenCard}>
              <h3 className={styles.ordenTitulo}>Orden 0</h3>
              <p className={styles.ordenFormula}>[A] = [A]₀ − k·t</p>
              <SvgOrden orden={0} k={kOrden0} color="#2E86AB" />
              <div className={styles.kSliderRow}>
                <label>k:</label>
                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.01}
                  value={kOrden0}
                  onChange={(e) => setKOrden0(Number(e.target.value))}
                  aria-label="Constante de velocidad orden 0"
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{kOrden0.toFixed(2)}</span>
              </div>
              <div className={styles.ordenEjemplo}>
                t₁/₂ = [A]₀/(2k) = <strong>{t12_0.toFixed(1)} s</strong>
                <br />Ej: descomposición catalítica superficial
              </div>
            </div>

            {/* Orden 1 */}
            <div className={styles.ordenCard}>
              <h3 className={styles.ordenTitulo}>Orden 1</h3>
              <p className={styles.ordenFormula}>[A] = [A]₀ · e<sup>−kt</sup></p>
              <SvgOrden orden={1} k={kOrden1} color="#48A9A6" />
              <div className={styles.kSliderRow}>
                <label>k:</label>
                <input
                  type="range"
                  min={0.05}
                  max={1.0}
                  step={0.01}
                  value={kOrden1}
                  onChange={(e) => setKOrden1(Number(e.target.value))}
                  aria-label="Constante de velocidad orden 1"
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{kOrden1.toFixed(2)}</span>
              </div>
              <div className={styles.ordenEjemplo}>
                t₁/₂ = ln2/k = <strong>{t12_1.toFixed(1)} s</strong> (constante)
                <br />Ej: desintegración radiactiva, hidrólisis ácida
              </div>
            </div>

            {/* Orden 2 */}
            <div className={styles.ordenCard}>
              <h3 className={styles.ordenTitulo}>Orden 2</h3>
              <p className={styles.ordenFormula}>1/[A] = 1/[A]₀ + k·t</p>
              <SvgOrden orden={2} k={kOrden2} color="#E67E22" />
              <div className={styles.kSliderRow}>
                <label>k:</label>
                <input
                  type="range"
                  min={0.1}
                  max={2.0}
                  step={0.05}
                  value={kOrden2}
                  onChange={(e) => setKOrden2(Number(e.target.value))}
                  aria-label="Constante de velocidad orden 2"
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{kOrden2.toFixed(2)}</span>
              </div>
              <div className={styles.ordenEjemplo}>
                t₁/₂ = 1/(k·[A]₀) = <strong>{t12_2.toFixed(1)} s</strong> (crece con t)
                <br />Ej: reacciones bimoleculares, dimerización
              </div>
            </div>
          </div>

          {/* Resumen de vidas medias */}
          <div className={styles.vidaMediaBox}>
            <strong>Comparativa de vidas medias (t₁/₂) con [A]₀ = 1,0 M</strong>
            <div className={styles.vidaMediaValores}>
              <div className={styles.vidaMediaItem}>
                <span>Orden 0</span>
                <span style={{ color: '#2E86AB' }}>{t12_0.toFixed(1)} s</span>
              </div>
              <div className={styles.vidaMediaItem}>
                <span>Orden 1</span>
                <span style={{ color: '#48A9A6' }}>{t12_1.toFixed(1)} s</span>
              </div>
              <div className={styles.vidaMediaItem}>
                <span>Orden 2</span>
                <span style={{ color: '#E67E22' }}>{t12_2.toFixed(1)} s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Factores que afectan la velocidad ─────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Factores que Controlan la Velocidad</h2>
        <p className={styles.subtituloSeccion}>
          Cinco variables que determinan cuántas colisiones moleculares eficaces ocurren por segundo
        </p>

        <div className={styles.factoresGrid}>
          {FACTORES.map((f, i) => (
            <div
              key={i}
              className={`${styles.factorCard} ${factorActivo === i ? styles.factorCardActivo : ''}`}
              onClick={() => setFactorActivo(factorActivo === i ? null : i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFactorActivo(factorActivo === i ? null : i); }}
              aria-expanded={factorActivo === i}
              aria-label={`Factor: ${f.titulo}`}
            >
              <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
              <h3 className={styles.factorTitulo}>{f.titulo}</h3>
              <p className={styles.factorMecanismo}>{f.mecanismo}</p>
              <div className={styles.factorEjemplo}>
                <strong>Ejemplo cotidiano:</strong> {f.ejemplo}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Sección educativa v2.0 ───────────────────────── */}
      <EducationalSection
        title="Cinética Química: La Velocidad de las Reacciones"
        subtitle="Energía de activación, Arrhenius y órdenes de reacción explicados visualmente"
      >
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h4>Cinética vs. Termodinámica: preguntas complementarias</h4>
            <p>
              La termodinámica responde a &quot;¿puede ocurrir esta reacción?&quot; (ΔG &lt; 0 = espontánea).
              La cinética responde a &quot;¿a qué velocidad ocurre?&quot;. Una reacción puede ser
              espontánea termodinámicamente y aun así ser prácticamente imposible a temperatura
              ambiente si la Ea es muy alta.
            </p>
            <p>
              El diamante es el ejemplo clásico: ΔG &lt; 0 para su conversión en grafito, pero la Ea
              es tan extremadamente alta que la transformación tardaría miles de millones de años.
              Los catalizadores solo actúan sobre la cinética (bajan Ea), no sobre la termodinámica.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Teoría de colisiones y orientación molecular</h4>
            <p>
              Para que una reacción ocurra, las moléculas deben colisionar con energía suficiente
              (≥ Ea) y con la orientación correcta. La fracción de colisiones eficaces es
              f = e<sup>−Ea/RT</sup>, la parte exponencial de Arrhenius.
            </p>
            <p>
              A temperatura ambiente (298 K), si Ea = 60 kJ/mol, solo 1 de cada 2×10¹⁰ colisiones
              supera la barrera. Por eso muchas reacciones son lentas aunque sean espontáneas:
              la probabilidad de superar la barrera por colisión es minúscula.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>El estado de transición y el complejo activado</h4>
            <p>
              El estado de transición (TS) es la geometría molecular de máxima energía a lo largo de
              la coordenada de reacción. No es un intermedio estable: tiene vida de ~10⁻¹³ s. La
              teoría del estado de transición (Eyring, 1935) predice k a partir de la función de
              partición del TS.
            </p>
            <p>
              Los intermedios de reacción, en cambio, son mínimos de energía entre el TS y los
              productos, con mayor estabilidad temporal. Un mecanismo de reacción puede tener varios TS
              (uno por etapa elemental) y varios intermedios.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Svante Arrhenius y el descubrimiento de la ecuación</h4>
            <p>
              Svante Arrhenius (1889) propuso empíricamente que la constante de velocidad varía con la
              temperatura según k = A·e<sup>−Ea/RT</sup>, ajustando datos experimentales. El significado
              físico de A y Ea lo proporcionaron más tarde la teoría de colisiones y la teoría del
              estado de transición.
            </p>
            <p>
              La linealización de la ecuación (gráfico de Arrhenius: ln k vs 1/T) permite determinar
              experimentalmente Ea a partir de la pendiente (−Ea/R) de la recta. Es un método clásico
              de laboratorio de cinética química.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Órdenes de reacción en la práctica industrial</h4>
            <p>
              Los órdenes de reacción se determinan experimentalmente, no a partir de la estequiometría
              (excepto en reacciones elementales). Una reacción 2A → B puede ser de orden 1, 2 o incluso
              orden fraccionario según el mecanismo.
            </p>
            <p>
              La desintegración radiactiva es siempre de orden 1 (t₁/₂ independiente de la cantidad
              inicial), propiedad usada en datación radiométrica (carbono-14, uranio-238). En farmacología,
              la mayoría de fármacos siguen cinética de primer orden para la eliminación (dosis dependiente
              de concentración plasmática).
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Catalizadores en la industria y biología</h4>
            <p>
              El proceso Haber-Bosch (síntesis de NH₃) usa Fe como catalizador a 400–500 °C y 150–300 atm.
              Sin catalizador, la Ea es tan alta que la reacción sería impráctica. Este proceso produce
              el nitrógeno fijo que alimenta ~50% de la humanidad mediante fertilizantes.
            </p>
            <p>
              Las enzimas son biocatalizadores proteicos que reducen Ea hasta 10⁶–10¹² veces respecto
              a la reacción no catalizada. La ureasa cataliza la hidrólisis de urea 10¹⁴ veces más
              rápido que en agua pura. Las enzimas son altamente específicas (sustrato concreto) y
              operan en condiciones fisiológicas suaves (37 °C, pH neutro).
            </p>
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          <strong>Nota cinética fundamental:</strong> La cinética explica por qué existen reacciones
          termodinámicamente favorables que no ocurren a temperatura ambiente. El diamante debería
          convertirse espontáneamente en grafito (ΔG &lt; 0), pero la Ea es tan elevada que el proceso
          tardaría miles de millones de años. Del mismo modo, el H₂ y el O₂ coexisten en una mezcla sin
          reaccionar hasta que una llama proporciona la energía de activación inicial — y entonces la
          reacción se propaga en cadena de forma explosiva.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-cinetica-quimica')} />
      <ShareCard appName="visualizador-cinetica-quimica" />
      <Footer appName="visualizador-cinetica-quimica" />
    </div>
  );
}
