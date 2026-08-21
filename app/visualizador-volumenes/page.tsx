'use client';
// @disclaimer: exempt

import { useState, useMemo, useId } from 'react';
import styles from './VisualizadorVolumenes.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// =========================================================
// TIPOS
// =========================================================
type Figura = 'esfera' | 'cubo' | 'cilindro' | 'cono' | 'piramide';

interface FiguraInfo {
  id: Figura;
  nombre: string;
  icono: string;
}

const FIGURAS: FiguraInfo[] = [
  { id: 'esfera', nombre: 'Esfera', icono: '⚽' },
  { id: 'cubo', nombre: 'Paralelepípedo', icono: '📦' },
  { id: 'cilindro', nombre: 'Cilindro', icono: '🥫' },
  { id: 'cono', nombre: 'Cono', icono: '🍦' },
  { id: 'piramide', nombre: 'Pirámide', icono: '🔺' },
];

// =========================================================
// HELPERS SVG
// =========================================================
type Pt = [number, number];
const CX = 150;
const CY = 148;

// Recorrido de los controles de medida. En un solo sitio porque de él depende también la
// escala del dibujo de la esfera: si cambian aquí, el dibujo sigue respondiendo igual.
const DIM_MIN = 1;
const DIM_MAX = 50;
// Tope del campo escrito. El slider llega a DIM_MAX porque más recorrido lo vuelve
// impreciso, pero una medida real no tiene por qué caber ahí: un depósito de r=120 era
// sencillamente inintroducible, en una app que promete calcular volúmenes.
const DIM_MAX_CAMPO = 100000;

function iso(x: number, y: number, z: number, s: number, ox = CX, oy = CY): Pt {
  return [ox + (x - z) * s * 0.866, oy - y * s + (x + z) * s * 0.5];
}

function ptsStr(arr: Pt[]): string {
  return arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

function mid(a: Pt, b: Pt): Pt {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

// =========================================================
// COMPONENTES SVG POR FIGURA
// =========================================================

function SvgEsfera({ radio }: { radio: number }) {
  // Las otras cuatro figuras se ajustan al lienzo y cambian de PROPORCIÓN al mover sus
  // sliders; una esfera no tiene proporción que cambiar, así que lo único que puede
  // responder es su tamaño. Con Math.min(radio * 14, 72) quedaba clavada en 72 px desde
  // r=6: el 90 % del recorrido del control dibujaba exactamente lo mismo mientras el
  // volumen se multiplicaba por 578, en una app que promete verlo cambiar en tiempo real.
  // La raíz comprime el tramo alto sin llegar a saturar, de modo que cada tirón del slider
  // mueve algo, y se normaliza contra DIM_MAX para que siga valiendo si el rango cambia.
  const R_PX_MIN = 12;
  const R_PX_MAX = 72;
  const r = R_PX_MIN + (R_PX_MAX - R_PX_MIN) * Math.min(1, Math.sqrt(radio / DIM_MAX));
  return (
    <>
      <defs>
        <radialGradient id="gSph" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#7FB3D3" />
          <stop offset="55%" stopColor="#2E86AB" />
          <stop offset="100%" stopColor="#1a5278" />
        </radialGradient>
      </defs>
      <ellipse cx={CX} cy={CY + r * 0.88} rx={r * 0.62} ry={r * 0.11} fill="rgba(0,0,0,0.13)" />
      <circle cx={CX} cy={CY} r={r} fill="url(#gSph)" stroke="#1a5278" strokeWidth="1.5" />
      <ellipse cx={CX} cy={CY} rx={r} ry={r * 0.25} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <ellipse cx={CX} cy={CY} rx={r * 0.25} ry={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3,3" />
      <line x1={CX} y1={CY} x2={CX + r} y2={CY} stroke="white" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.85" />
      <text x={CX + r * 0.5 + 2} y={CY - 8} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">r={medExacta(radio)}</text>
    </>
  );
}

function SvgCubo({ ancho, largo, alto }: { ancho: number; largo: number; alto: number }) {
  const W = ancho, D = largo, H = alto;
  const sw = (W + D) * 0.866;
  const sh = H + (W + D) * 0.5;
  const s = Math.min(105 / Math.max(sw, 0.1), 115 / Math.max(sh, 0.1), 13);
  const by = CY + H * s / 2;

  function isoL(x: number, y: number, z: number): Pt {
    return [CX + (x - z) * s * 0.866, by - y * s + (x + z) * s * 0.5];
  }

  const b00 = isoL(-W / 2, 0, -D / 2);
  const b10 = isoL(W / 2, 0, -D / 2);
  const b11 = isoL(W / 2, 0, D / 2);
  const b01 = isoL(-W / 2, 0, D / 2);
  const t00 = isoL(-W / 2, H, -D / 2);
  const t10 = isoL(W / 2, H, -D / 2);
  const t11 = isoL(W / 2, H, D / 2);
  const t01 = isoL(-W / 2, H, D / 2);

  const mB01B11 = mid(b01, b11);
  const mB10B11 = mid(b10, b11);
  const mB10T10 = mid(b10, t10);

  return (
    <>
      <line x1={b00[0]} y1={b00[1]} x2={b01[0]} y2={b01[1]} stroke="#2E86AB" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      <line x1={b00[0]} y1={b00[1]} x2={b10[0]} y2={b10[1]} stroke="#2E86AB" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      <line x1={b00[0]} y1={b00[1]} x2={t00[0]} y2={t00[1]} stroke="#2E86AB" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      <polygon points={ptsStr([b01, b11, t11, t01])} fill="#48A9A6" fillOpacity="0.72" stroke="#1a5278" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={ptsStr([b10, b11, t11, t10])} fill="#2E86AB" fillOpacity="0.72" stroke="#1a5278" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={ptsStr([t00, t10, t11, t01])} fill="#7FB3D3" fillOpacity="0.78" stroke="#1a5278" strokeWidth="1.5" strokeLinejoin="round" />
      <text x={mB01B11[0]} y={mB01B11[1] + 17} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="bold">a={medExacta(ancho)}</text>
      <text x={mB10B11[0]} y={mB10B11[1] + 17} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="bold">b={medExacta(largo)}</text>
      <text x={b10[0] + 9} y={mB10T10[1] + 4} textAnchor="start" fill="var(--text-primary)" fontSize="11" fontWeight="bold">h={medExacta(alto)}</text>
    </>
  );
}

function SvgCilindro({ radio, altura }: { radio: number; altura: number }) {
  const s = Math.min(105 / Math.max(radio * 2, 0.1), 115 / Math.max(altura + radio * 0.76, 0.1), 13);
  const rx = radio * s;
  const ry = rx * 0.38;
  const bodyH = altura * s;
  const topY = CY - bodyH / 2;
  const botY = CY + bodyH / 2;

  return (
    <>
      <defs>
        <linearGradient id="gCyl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a5278" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#2E86AB" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#7FB3D3" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1a5278" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="gCylTop" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#48A9A6" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#7FB3D3" />
          <stop offset="100%" stopColor="#2E86AB" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <ellipse cx={CX} cy={botY + ry * 0.4} rx={rx * 0.65} ry={ry * 0.3} fill="rgba(0,0,0,0.12)" />
      <rect x={CX - rx} y={topY} width={rx * 2} height={bodyH} fill="url(#gCyl)" />
      <line x1={CX - rx} y1={topY} x2={CX - rx} y2={botY} stroke="#1a5278" strokeWidth="1.5" />
      <line x1={CX + rx} y1={topY} x2={CX + rx} y2={botY} stroke="#1a5278" strokeWidth="1.5" />
      <ellipse cx={CX} cy={botY} rx={rx} ry={ry} fill="#2E86AB" fillOpacity="0.65" stroke="#1a5278" strokeWidth="1.5" />
      <ellipse cx={CX} cy={topY} rx={rx} ry={ry} fill="url(#gCylTop)" stroke="#1a5278" strokeWidth="1.5" />
      <line x1={CX} y1={topY} x2={CX + rx} y2={topY} stroke="white" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.85" />
      <text x={CX + rx / 2 + 2} y={topY - 8} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">r={medExacta(radio)}</text>
      <line x1={CX + rx + 10} y1={topY} x2={CX + rx + 10} y2={botY} stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="2,2" />
      <line x1={CX + rx + 6} y1={topY} x2={CX + rx + 14} y2={topY} stroke="var(--text-secondary)" strokeWidth="1" />
      <line x1={CX + rx + 6} y1={botY} x2={CX + rx + 14} y2={botY} stroke="var(--text-secondary)" strokeWidth="1" />
      <text x={CX + rx + 16} y={(topY + botY) / 2 + 4} textAnchor="start" fill="var(--text-primary)" fontSize="11" fontWeight="bold">h={medExacta(altura)}</text>
    </>
  );
}

function SvgCono({ radio, altura }: { radio: number; altura: number }) {
  const s = Math.min(105 / Math.max(radio * 2, 0.1), 115 / Math.max(altura + radio * 0.4, 0.1), 13);
  const rx = radio * s;
  const ry = rx * 0.38;
  const h = altura * s;
  const baseY = CY + h * 0.38;
  const apexY = baseY - h;

  return (
    <>
      <defs>
        <linearGradient id="gConL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a5278" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2E86AB" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="gConR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7FB3D3" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#1a5278" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <ellipse cx={CX} cy={baseY + ry * 0.4} rx={rx * 0.62} ry={ry * 0.28} fill="rgba(0,0,0,0.12)" />
      <polygon
        points={`${(CX - rx).toFixed(1)},${baseY.toFixed(1)} ${CX.toFixed(1)},${apexY.toFixed(1)} ${CX.toFixed(1)},${baseY.toFixed(1)}`}
        fill="url(#gConL)" stroke="#1a5278" strokeWidth="1.5" strokeLinejoin="round"
      />
      <polygon
        points={`${CX.toFixed(1)},${apexY.toFixed(1)} ${(CX + rx).toFixed(1)},${baseY.toFixed(1)} ${CX.toFixed(1)},${baseY.toFixed(1)}`}
        fill="url(#gConR)" stroke="#1a5278" strokeWidth="1.5" strokeLinejoin="round"
      />
      <ellipse cx={CX} cy={baseY} rx={rx} ry={ry} fill="#2E86AB" fillOpacity="0.65" stroke="#1a5278" strokeWidth="1.5" />
      <circle cx={CX} cy={apexY} r={3} fill="white" stroke="#1a5278" strokeWidth="1" />
      <line x1={CX} y1={baseY} x2={CX + rx} y2={baseY} stroke="white" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.85" />
      <text x={CX + rx / 2 + 2} y={baseY + 17} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="bold">r={medExacta(radio)}</text>
      <line x1={CX + rx + 10} y1={apexY} x2={CX + rx + 10} y2={baseY} stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="2,2" />
      <line x1={CX + rx + 6} y1={apexY} x2={CX + rx + 14} y2={apexY} stroke="var(--text-secondary)" strokeWidth="1" />
      <line x1={CX + rx + 6} y1={baseY} x2={CX + rx + 14} y2={baseY} stroke="var(--text-secondary)" strokeWidth="1" />
      <text x={CX + rx + 16} y={(apexY + baseY) / 2 + 4} textAnchor="start" fill="var(--text-primary)" fontSize="11" fontWeight="bold">h={medExacta(altura)}</text>
    </>
  );
}

function SvgPiramide({ lado, altura }: { lado: number; altura: number }) {
  const L = lado, H = altura;
  const sw = L * 1.732;
  const sh = H + L * 0.5;
  const s = Math.min(105 / Math.max(sw, 0.1), 115 / Math.max(sh, 0.1), 13);
  const by = CY + H * s / 2 - L * s * 0.25;

  function isoL(x: number, y: number, z: number): Pt {
    return [CX + (x - z) * s * 0.866, by - y * s + (x + z) * s * 0.5];
  }

  const b00 = isoL(-L / 2, 0, -L / 2);
  const b10 = isoL(L / 2, 0, -L / 2);
  const b11 = isoL(L / 2, 0, L / 2);
  const b01 = isoL(-L / 2, 0, L / 2);
  const apex = isoL(0, H, 0);
  const center = isoL(0, 0, 0);
  const mB10B11 = mid(b10, b11);

  return (
    <>
      <line x1={b00[0]} y1={b00[1]} x2={b10[0]} y2={b10[1]} stroke="#2E86AB" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      <line x1={b00[0]} y1={b00[1]} x2={b01[0]} y2={b01[1]} stroke="#2E86AB" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      <line x1={b00[0]} y1={b00[1]} x2={apex[0]} y2={apex[1]} stroke="#2E86AB" strokeWidth="1" strokeDasharray="3,2" opacity="0.45" />
      <polygon points={ptsStr([apex, b01, b11])} fill="#48A9A6" fillOpacity="0.72" stroke="#1a5278" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={ptsStr([apex, b10, b11])} fill="#2E86AB" fillOpacity="0.72" stroke="#1a5278" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1={apex[0]} y1={apex[1]} x2={center[0]} y2={center[1]} stroke="white" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
      <circle cx={apex[0]} cy={apex[1]} r={3} fill="white" stroke="#1a5278" strokeWidth="1" />
      <text x={apex[0] - 26} y={(apex[1] + center[1]) / 2 + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">h={medExacta(altura)}</text>
      <text x={mB10B11[0]} y={mB10B11[1] + 17} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="bold">l={medExacta(lado)}</text>
    </>
  );
}

// =========================================================
// HELPERS DE CÁLCULO
// =========================================================
function calcVolumen(figura: Figura, p: {
  radio: number; ancho: number; largo: number; alto: number;
  radioCil: number; alturaCil: number; radioCon: number; alturaCon: number;
  lado: number; alturaPir: number;
}): number {
  switch (figura) {
    case 'esfera': return (4 / 3) * Math.PI * Math.pow(p.radio, 3);
    case 'cubo': return p.ancho * p.largo * p.alto;
    case 'cilindro': return Math.PI * Math.pow(p.radioCil, 2) * p.alturaCil;
    case 'cono': return (1 / 3) * Math.PI * Math.pow(p.radioCon, 2) * p.alturaCon;
    case 'piramide': return (1 / 3) * Math.pow(p.lado, 2) * p.alturaPir;
  }
}

function getFormula(figura: Figura, p: {
  radio: number; ancho: number; largo: number; alto: number;
  radioCil: number; alturaCil: number; radioCon: number; alturaCon: number;
  lado: number; alturaPir: number;
}): string {
  switch (figura) {
    // Con decimales en juego, interpolar el número tal cual escribiría "12.5" a la
    // española: la medida se teclea con coma y la fórmula debe devolverla igual.
    case 'esfera': return `V = (4/3) × π × r³ = (4/3) × π × ${medExacta(p.radio)}³`;
    case 'cubo': return `V = a × b × h = ${medExacta(p.ancho)} × ${medExacta(p.largo)} × ${medExacta(p.alto)}`;
    case 'cilindro': return `V = π × r² × h = π × ${medExacta(p.radioCil)}² × ${medExacta(p.alturaCil)}`;
    case 'cono': return `V = (1/3) × π × r² × h = (1/3) × π × ${medExacta(p.radioCon)}² × ${medExacta(p.alturaCon)}`;
    case 'piramide': return `V = (1/3) × l² × h = (1/3) × ${medExacta(p.lado)}² × ${medExacta(p.alturaPir)}`;
  }
}

// Una medida escrita por el usuario: sin decimales si es entera, con los que tenga si no
function med(v: number): string {
  return formatNumber(v, Number.isInteger(v) ? 0 : 2);
}

/**
 * La medida tal cual entra en el cálculo, sin redondear.
 *
 * La caja «Fórmula aplicada» usaba `med()`, de dos decimales, mientras el volumen se
 * calcula con el valor completo: quien rehacía a mano la operación que la app enseña no
 * llegaba al número que la app muestra (Inspector, 20/08/2026). Hasta seis decimales,
 * que es donde el campo deja de admitir más.
 */
function medExacta(v: number): string {
  if (Number.isInteger(v)) return formatNumber(v, 0);
  const decimales = Math.min(6, (String(v).split('.')[1] ?? '').length);
  return formatNumber(v, decimales);
}

function formatVolumen(v: number): string {
  if (v < 10) return formatNumber(v, 4);
  if (v < 100) return formatNumber(v, 2);
  if (v < 100000) return formatNumber(v, 1);
  return formatNumber(v, 0);
}

// =========================================================
// COMPONENTE SLIDER REUTILIZABLE
// =========================================================
interface SliderProps {
  label: string;
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  simbolo?: string;
}
function Slider({ label, valor, min, max, onChange, simbolo = '' }: SliderProps) {
  // Un id propio por control: sin él la etiqueta queda huérfana y pulsar sobre el
  // texto no enfoca nada (área de acierto perdida, sensible en móvil).
  const idSlider = useId();
  const idCampo = useId();

  // El campo guarda su propio texto mientras se escribe. Si reflejara el número del estado,
  // teclear "12," se normalizaría a "12" en cuanto se pulsa la coma y sería imposible
  // escribir un decimal: el slider daba saltos de 1 y tampoco pasaba de 50, así que una lata
  // de r=12,5 había que redondearla a 13 (un 8 % de desviación) y un depósito de r=120 no
  // tenía manera de entrar. El slider sigue estando para explorar; el campo es para medir.
  const [texto, setTexto] = useState(() => med(valor));
  /**
   * Una entrada inválida se ignoraba en silencio: el texto malo se quedaba escrito
   * mientras la app seguía calculando con la última medida válida, así que el número
   * de la pantalla no correspondía a lo que se leía en el campo (Inspector, 20/08/2026).
   */
  const [avisoCampo, setAvisoCampo] = useState('');

  const desdeSlider = (v: number) => { setTexto(med(v)); setAvisoCampo(''); onChange(v); };
  const desdeCampo = (t: string) => {
    setTexto(t);
    if (t.trim() === '') { setAvisoCampo(''); return; }
    const n = parseSpanishNumber(t);
    if (isNaN(n)) {
      setAvisoCampo('Escribe un número: se sigue calculando con la última medida válida.');
      return;
    }
    if (n <= 0 || n > DIM_MAX_CAMPO) {
      setAvisoCampo(
        `La medida debe estar entre 0 y ${formatNumber(DIM_MAX_CAMPO, 0)}: se sigue calculando con la última válida.`,
      );
      return;
    }
    setAvisoCampo('');
    onChange(n);
  };

  return (
    <div className={styles.paramControl}>
      <div className={styles.paramHeader}>
        <label className={styles.paramLabel} htmlFor={idCampo}>{label}</label>
        <span className={styles.paramCampoCaja}>
          <input
            id={idCampo}
            type="text"
            inputMode="decimal"
            value={texto}
            onChange={(e) => desdeCampo(e.target.value)}
            className={styles.paramCampo}
            aria-label={`${label}, medida exacta`}
            aria-invalid={avisoCampo !== ''}
            aria-describedby={avisoCampo ? `${idCampo}-aviso` : undefined}
          />
          {simbolo && <span className={styles.paramSimbolo}>{simbolo}</span>}
        </span>
      </div>
      <input
        id={idSlider}
        type="range"
        min={min}
        max={max}
        step={0.5}
        value={Math.min(valor, max)}
        onChange={(e) => desdeSlider(Number(e.target.value))}
        className={styles.sliderRange}
        aria-label={`${label}, control deslizante: ${med(valor)}${simbolo}`}
        style={
          {
            '--slider-pct': `${((Math.min(Math.max(valor, min), max) - min) / (max - min)) * 100}%`,
          } as React.CSSProperties
        }
      />
      <div className={styles.sliderLimits}>
        {/* Por debajo del mínimo no había aviso, al contrario que por arriba: el
            deslizador marcaba el mínimo y el pie seguía anunciando el rango normal,
            así que campo y deslizador decían cosas distintas. */}
        <span>{valor < min ? `${med(valor)} · fuera del deslizador` : min}</span>
        <span>{valor > max ? `${med(valor)} · fuera del deslizador` : max}</span>
      </div>
      {avisoCampo && (
        <p id={`${idCampo}-aviso`} role="alert" className={styles.avisoCampo}>
          {avisoCampo}
        </p>
      )}
    </div>
  );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
export default function VisualizadorVolumenesPage() {
  const [figura, setFigura] = useState<Figura>('esfera');
  const [radio, setRadio] = useState(5);
  const [ancho, setAncho] = useState(6);
  const [largo, setLargo] = useState(4);
  const [alto, setAlto] = useState(5);
  const [radioCil, setRadioCil] = useState(4);
  const [alturaCil, setAlturaCil] = useState(8);
  const [radioCon, setRadioCon] = useState(4);
  const [alturaCon, setAlturaCon] = useState(10);
  const [lado, setLado] = useState(6);
  const [alturaPir, setAlturaPir] = useState(8);

  const params = useMemo(() => ({
    radio, ancho, largo, alto, radioCil, alturaCil, radioCon, alturaCon, lado, alturaPir,
  }), [radio, ancho, largo, alto, radioCil, alturaCil, radioCon, alturaCon, lado, alturaPir]);

  const volumen = useMemo(() => calcVolumen(figura, params), [figura, params]);
  const formula = useMemo(() => getFormula(figura, params), [figura, params]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🔷</span> Visualizador de Volúmenes 3D</h1>
        <p className={styles.subtitle}>
          Selecciona una figura, ajusta las dimensiones con los sliders y observa cómo cambia el volumen en tiempo real
        </p>
      </header>

      <LegalNotice />

      {/* Selector de figura */}
      <div className={styles.figSelector} role="group" aria-label="Seleccionar figura geométrica">
        {FIGURAS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFigura(f.id)}
            className={`${styles.figBtn} ${figura === f.id ? styles.figBtnActivo : ''}`}
            aria-pressed={figura === f.id}
          >
            <span className={styles.figBtnIcono} aria-hidden="true">{f.icono}</span>
            <span className={styles.figBtnNombre}>{f.nombre}</span>
          </button>
        ))}
      </div>

      {/* Grid principal: SVG + Controles */}
      <div className={styles.mainGrid}>

        {/* Panel SVG */}
        <div className={styles.svgPanel}>
          <svg
            viewBox="0 0 300 290"
            className={styles.svgFigura}
            aria-label={`Visualización 3D de ${FIGURAS.find(f => f.id === figura)?.nombre}`}
            role="img"
          >
            {figura === 'esfera' && <SvgEsfera radio={radio} />}
            {figura === 'cubo' && <SvgCubo ancho={ancho} largo={largo} alto={alto} />}
            {figura === 'cilindro' && <SvgCilindro radio={radioCil} altura={alturaCil} />}
            {figura === 'cono' && <SvgCono radio={radioCon} altura={alturaCon} />}
            {figura === 'piramide' && <SvgPiramide lado={lado} altura={alturaPir} />}
          </svg>
        </div>

        {/* Panel de controles */}
        <div className={styles.controlPanel}>
          {figura === 'esfera' && (
            <Slider label="Radio (r)" valor={radio} min={DIM_MIN} max={DIM_MAX} onChange={setRadio} />
          )}
          {figura === 'cubo' && (
            <>
              <Slider label="Anchura (a)" valor={ancho} min={DIM_MIN} max={DIM_MAX} onChange={setAncho} />
              <Slider label="Profundidad (b)" valor={largo} min={DIM_MIN} max={DIM_MAX} onChange={setLargo} />
              <Slider label="Altura (h)" valor={alto} min={DIM_MIN} max={DIM_MAX} onChange={setAlto} />
            </>
          )}
          {figura === 'cilindro' && (
            <>
              <Slider label="Radio (r)" valor={radioCil} min={DIM_MIN} max={DIM_MAX} onChange={setRadioCil} />
              <Slider label="Altura (h)" valor={alturaCil} min={DIM_MIN} max={DIM_MAX} onChange={setAlturaCil} />
            </>
          )}
          {figura === 'cono' && (
            <>
              <Slider label="Radio de la base (r)" valor={radioCon} min={DIM_MIN} max={DIM_MAX} onChange={setRadioCon} />
              <Slider label="Altura (h)" valor={alturaCon} min={DIM_MIN} max={DIM_MAX} onChange={setAlturaCon} />
            </>
          )}
          {figura === 'piramide' && (
            <>
              <Slider label="Lado de la base (l)" valor={lado} min={DIM_MIN} max={DIM_MAX} onChange={setLado} />
              <Slider label="Altura (h)" valor={alturaPir} min={DIM_MIN} max={DIM_MAX} onChange={setAlturaPir} />
            </>
          )}

          {/* Resultado */}
          <div className={styles.resultCard} role="status" aria-live="polite" aria-atomic="true" aria-label="Resultado del volumen">
            <span className={styles.resultLabel}>Volumen</span>
            <span className={styles.resultValor}>{formatVolumen(volumen)}</span>
            <span className={styles.resultUnidad}>unidades³</span>
          </div>

          {/* Fórmula */}
          <div className={styles.formulaBox}>
            <span className={styles.formulaLabel}>Fórmula aplicada</span>
            <code className={styles.formulaTexto}>{formula}</code>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CONTENIDO EDUCATIVO v2.0 */}
      {/* ========================================================= */}
      <EducationalSection
        title="📐 Guía completa de volúmenes geométricos"
        subtitle="Todo lo que necesitas saber sobre cómo se calculan los volúmenes de las figuras más comunes"
      >
        {/* 1. TABLA COMPARATIVA */}
        <section className={styles.guideSection}>
          <h2>Comparativa de fórmulas de volumen</h2>
          <p>Las cinco figuras geométricas más utilizadas en matemáticas y sus fórmulas de volumen.</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Figura</th>
                  <th>Parámetros</th>
                  <th>Fórmula</th>
                  <th>Ejemplo (unidades)</th>
                  <th>Uso típico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>⚽ Esfera</strong></td>
                  <td>Radio r</td>
                  <td><code>V = (4/3)πr³</code></td>
                  <td>r=5 → 523,6</td>
                  <td>Pelotas, depósitos, planetas</td>
                </tr>
                <tr>
                  <td><strong>📦 Paralelepípedo</strong></td>
                  <td>Anchura a, profundidad b, altura h</td>
                  <td><code>V = a × b × h</code></td>
                  <td>6×4×5 → 120</td>
                  <td>Habitaciones, cajas, piscinas</td>
                </tr>
                <tr>
                  <td><strong>🥫 Cilindro</strong></td>
                  <td>Radio r, altura h</td>
                  <td><code>V = πr²h</code></td>
                  <td>r=4, h=8 → 402,1</td>
                  <td>Latas, tuberías, columnas</td>
                </tr>
                <tr>
                  <td><strong>🍦 Cono</strong></td>
                  <td>Radio r, altura h</td>
                  <td><code>V = (1/3)πr²h</code></td>
                  <td>r=4, h=10 → 167,6</td>
                  <td>Embudos, cucuruchos, tejados</td>
                </tr>
                <tr>
                  <td><strong>🔺 Pirámide</strong></td>
                  <td>Lado l, altura h</td>
                  <td><code>V = (1/3)l²h</code></td>
                  <td>l=6, h=8 → 96</td>
                  <td>Monumentos, techos, cristales</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CASOS DE USO */}
        <section className={styles.guideSection}>
          <h2>Aplicaciones en la vida real</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🏗️</span>
                <h3>Construcción y arquitectura</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Ejemplo:</strong></p>
                <code>Depósito cilíndrico: r=3m, h=5m → V=141,4 m³ → 141.400 litros</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué importa:</strong> Los cálculos de volumen determinan la cantidad de material (hormigón, agua, gas) y, por tanto, el coste y la capacidad real de la instalación.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">🍕</span>
                <h3>Alimentación y envasado</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Ejemplo:</strong></p>
                <code>Cucurucho de helado: r=3cm, h=12cm → V=113,1 cm³ ≈ 113 ml</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué importa:</strong> La industria alimentaria usa fórmulas de volumen para calcular el contenido exacto de envases (latas cilíndricas, cajas, botes cónicos) y estandarizar porciones.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">⚗️</span>
                <h3>Ciencias y laboratorio</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Ejemplo:</strong></p>
                <code>Célula esférica: r=0,01mm → V=4,19×10⁻⁶ mm³ → 4,19 picolitros (4.188,8 fL)</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué importa:</strong> En biología celular, química y física, conocer el volumen exacto de objetos esféricos (glóbulos, burbujas, nanopartículas) es fundamental para calcular densidades y concentraciones.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcono} aria-hidden="true">📐</span>
                <h3>Matemáticas y estudios</h3>
              </div>
              <div className={styles.escenarioEjemplo}>
                <p><strong>Ejemplo:</strong></p>
                <code>3 conos = 1 cilindro (misma base y altura) → verificar con los sliders</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué importa:</strong> Visualizar la relación entre figuras (un cono es 1/3 del cilindro equivalente) convierte conceptos abstractos en algo comprobable de forma inmediata e intuitiva.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span>¿Por qué el cono tiene exactamente un tercio del volumen del cilindro?</h4>
              <p>
                Esta relación se puede demostrar mediante el principio de Cavalieri: si se llena un cono y se vierte en un cilindro del mismo radio y altura, caben exactamente tres conos. La demostración rigurosa utiliza integración (sumas de discos infinitesimales), pero la relación 1/3 ya era conocida por Euclides y Arquímedes gracias a métodos geométricos.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Experimenta:</strong> Pon el mismo radio y altura en el cilindro y en el cono y comprueba que el volumen del cono es exactamente un tercio.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span>¿Qué significa "volumen" en unidades al cubo?</h4>
              <p>
                El volumen mide el espacio tridimensional que ocupa un objeto. Si las dimensiones están en centímetros, el volumen está en cm³ (centímetros cúbicos). 1 cm³ equivale a 1 mililitro de líquido. Si las dimensiones están en metros, 1 m³ = 1.000 litros. El "cubo" proviene de que se multiplican tres dimensiones lineales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span>¿Por qué el volumen de la esfera tiene el factor (4/3)?</h4>
              <p>
                El factor (4/3) surge de la integración de discos circulares a lo largo del eje. Una esfera de radio r puede descomponerse en rodajas circulares infinitesimales cuya suma da π × r³ × (4/3). Arquímedes demostró que la esfera tiene exactamente 2/3 del volumen del cilindro que la circunscribe, lo que implica V = (4/3)πr³. Estaba tan orgulloso de este resultado que pidió que se grabara en su tumba.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Verifica:</strong> Compara el volumen de una esfera de radio 5 con el de un cilindro de radio 5 y altura 10: la esfera es 2/3 del cilindro.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span>¿Qué figura tiene más volumen para la misma superficie?</h4>
              <p>
                La esfera es la figura más eficiente en términos de volumen por superficie. Para una misma cantidad de material (superficie), la esfera encierra más volumen que cualquier otra forma. Por eso las burbujas de jabón son esféricas (minimizan la tensión superficial) y los glóbulos rojos, que necesitan transportar el máximo de hemoglobina, tienen forma de disco bicóncavo (optimizada para otra función: maximizar el intercambio de oxígeno).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span>¿Cómo se calcula el volumen de una pirámide no cuadrada?</h4>
              <p>
                Este visualizador muestra la pirámide de base cuadrada (V = l²h/3). Para bases rectangulares la fórmula es V = (a×b×h)/3, donde a y b son los lados de la base. Para bases triangulares, V = (base × altura_triángulo × h_pirámide)/6. En general, el volumen de cualquier pirámide es siempre (1/3) × área_base × altura.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span>¿Cómo afecta el radio al volumen en comparación con la altura?</h4>
              <p>
                El radio tiene mucho más impacto que la altura porque aparece elevado al cuadrado (cilindro, cono) o al cubo (esfera). Para un cilindro, duplicar el radio cuadruplica el volumen, mientras que duplicar la altura solo lo duplica. Esta es la razón por la que los bidones industriales son más anchos que altos: un pequeño incremento de radio equivale a mucho más volumen adicional que el mismo incremento en altura.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Compruébalo:</strong> Sube el radio del cilindro de 5 a 10 (×2) y observa que el volumen se multiplica por 4, no por 2.
              </p>
            </div>
          </div>
        </section>

        {/* 4. GUÍA PASO A PASO */}
        <section className={styles.guideSection}>
          <h2>Cómo usar el visualizador</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h3>Elige la figura</h3>
                <p>Haz clic en uno de los cinco botones del selector: Esfera, Paralelepípedo, Cilindro, Cono o Pirámide. La figura aparecerá en el panel izquierdo con una vista 3D isométrica.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h3>Ajusta las dimensiones</h3>
                <p>Mueve los sliders del panel derecho para cambiar el radio, altura o lado de la figura. El visualizador 3D se actualiza en tiempo real mostrando cómo cambia la forma con etiquetas de las dimensiones.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h3>Lee el resultado</h3>
                <p>El volumen calculado aparece en la tarjeta de resultado con formato español (punto de miles, coma decimal). El resultado se actualiza instantáneamente al mover cualquier slider.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h3>Comprende la fórmula</h3>
                <p>Debajo del resultado encontrarás la fórmula matemática con los valores actuales sustituidos. Esto te permite ver exactamente qué operaciones se están realizando para obtener el volumen.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h3>Compara figuras</h3>
                <p>Anota el volumen de una figura, cambia a otra y ajusta los sliders para igualar el volumen. Esto permite explorar qué dimensiones producen el mismo volumen en figuras distintas, un ejercicio clásico de geometría.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. MEJORES PRÁCTICAS */}
        <section className={styles.guideSection}>
          <h2>Consejos para trabajar con volúmenes</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">📏</span>
              <h3>Usa unidades consistentes</h3>
              <p>Siempre trabaja con las mismas unidades en todas las dimensiones. Si el radio está en metros, la altura también debe estar en metros. El resultado estará en metros cúbicos (m³).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🔢</span>
              <h3>Presta atención al exponente del radio</h3>
              <p>En la esfera el radio aparece elevado al cubo: pequeños errores de medición tienen gran impacto. Mide el radio con más precisión que la altura siempre que sea posible.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🔄</span>
              <h3>La altura es perpendicular a la base</h3>
              <p>Para cilindros, conos y pirámides, la altura h es siempre la distancia perpendicular entre la base y el vértice o tapa superior, no la longitud de la cara lateral.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🌍</span>
              <h3>Convierte a litros si necesitas líquido</h3>
              <p>1 dm³ = 1 litro. Si trabajas en decímetros, el resultado ya está en litros. En metros: 1 m³ = 1.000 litros. En centímetros: 1 cm³ = 1 mililitro.</p>
            </div>
          </div>
        </section>

        {/* 6. WARNING BOX */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
              <h2>Errores frecuentes al calcular volúmenes</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Confundir radio con diámetro:</strong> El radio es la mitad del diámetro. Si mides de punta a punta, divide entre 2 antes de introducirlo. Un error aquí multiplica el volumen por 4 (cilindro) u 8 (esfera).</li>
              <li><strong>Usar la altura slant en vez de la altura perpendicular:</strong> En conos y pirámides, la altura h es la distancia vertical desde la base hasta el vértice, no la longitud de la cara lateral (apotema lateral o generatriz). Son magnitudes distintas.</li>
              <li><strong>Olvidar el factor 1/3 en cono y pirámide:</strong> Es el error más frecuente en exámenes. Cono y pirámide son figuras "puntiagudas" que valen un tercio de su equivalente "lleno" (cilindro o prisma).</li>
              <li><strong>Mezclar unidades:</strong> Si una dimensión está en centímetros y otra en metros, el resultado será incorrecto. Convierte todo a la misma unidad antes de calcular.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-volumenes')} />
      <ShareCard appName="visualizador-volumenes" />
      <Footer appName="visualizador-volumenes" />
    </div>
  );
}
