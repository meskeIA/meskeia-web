'use client';
// @disclaimer: exempt

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './NumerosComplejos.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Operacion = 'suma' | 'resta' | 'producto' | 'conjugado';

// ─────────────────────────────────────────────
// Utilidades matemáticas
// ─────────────────────────────────────────────

function modulo(re: number, im: number): number {
  return Math.sqrt(re * re + im * im);
}

function argGrados(re: number, im: number): number {
  return (Math.atan2(im, re) * 180) / Math.PI;
}

function fmtNum(n: number): string {
  const s = n.toFixed(2);
  return s;
}

function fmtComplejo(re: number, im: number): string {
  const signo = im >= 0 ? '+' : '−';
  return `${fmtNum(re)} ${signo} ${fmtNum(Math.abs(im))}i`;
}

// Transformación de coordenadas matemáticas → SVG
const ARGAND_CENTRO_X = 250;
const ARGAND_CENTRO_Y = 210;
const ARGAND_ESCALA = 45; // 1 unidad = 45px

function svgX(re: number): number {
  return ARGAND_CENTRO_X + re * ARGAND_ESCALA;
}

function svgY(im: number): number {
  return ARGAND_CENTRO_Y - im * ARGAND_ESCALA;
}

// ─────────────────────────────────────────────
// Componente: Flecha SVG
// ─────────────────────────────────────────────

interface FlechaProps {
  re: number;
  im: number;
  color: string;
  strokeWidth?: number;
  dashed?: boolean;
  markerId: string;
  label?: string;
}

function FlechaSVG({ re, im, color, strokeWidth = 2.5, dashed = false, markerId, label }: FlechaProps) {
  const x2 = svgX(re);
  const y2 = svgY(im);
  // Acortar ligeramente para que la punta de flecha quede bien
  const dist = Math.sqrt((x2 - ARGAND_CENTRO_X) ** 2 + (y2 - ARGAND_CENTRO_Y) ** 2);
  const factor = dist > 12 ? (dist - 10) / dist : 0;
  const x2sh = ARGAND_CENTRO_X + (x2 - ARGAND_CENTRO_X) * factor;
  const y2sh = ARGAND_CENTRO_Y + (y2 - ARGAND_CENTRO_Y) * factor;

  // Posición de la etiqueta: ligeramente más allá del punto
  const labelX = x2 + (x2 - ARGAND_CENTRO_X) * 0.12 + (im > 0 ? 4 : -4);
  const labelY = y2 + (y2 - ARGAND_CENTRO_Y) * 0.12;

  return (
    <>
      <line
        x1={ARGAND_CENTRO_X}
        y1={ARGAND_CENTRO_Y}
        x2={x2sh}
        y2={y2sh}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '6 3' : undefined}
        markerEnd={`url(#${markerId})`}
      />
      <circle cx={x2} cy={y2} r={4} fill={color} />
      {label && (
        <text x={labelX} y={labelY} fontSize="11" fill={color} fontWeight="600" textAnchor="middle">
          {label}
        </text>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Componente: Plano de Argand
// ─────────────────────────────────────────────

function PlanoArgand() {
  const [re1, setRe1] = useState(2.0);
  const [im1, setIm1] = useState(1.5);
  const [re2, setRe2] = useState(-1.0);
  const [im2, setIm2] = useState(2.0);
  const [operacion, setOperacion] = useState<Operacion>('suma');

  const resultados: Record<Operacion, { re: number; im: number }> = {
    suma:      { re: re1 + re2,               im: im1 + im2 },
    resta:     { re: re1 - re2,               im: im1 - im2 },
    producto:  { re: re1 * re2 - im1 * im2,   im: re1 * im2 + im1 * re2 },
    conjugado: { re: re1,                      im: -im1 },
  };
  const res = resultados[operacion];

  const simbolo: Record<Operacion, string> = {
    suma: '+',
    resta: '−',
    producto: '×',
    conjugado: 'conj',
  };

  const insight: Record<Operacion, string> = {
    suma: 'Sumar = trasladar el vector z₁ en la dirección de z₂',
    resta: 'Restar = trasladar en dirección opuesta a z₂',
    producto: `|z₁|·|z₂| = ${(modulo(re1, im1) * modulo(re2, im2)).toFixed(2)} (módulos se multiplican). Ángulo = ${argGrados(re1, im1).toFixed(1)}° + ${argGrados(re2, im2).toFixed(1)}° (ángulos se suman)`,
    conjugado: 'El conjugado refleja z₁ en el eje real. |z̄| = |z|',
  };

  const OPETIQUETAS: { id: Operacion; label: string }[] = [
    { id: 'suma',      label: '⊕ Suma' },
    { id: 'resta',     label: '⊖ Resta' },
    { id: 'producto',  label: '× Producto' },
    { id: 'conjugado', label: 'z̄ Conjugado' },
  ];

  // Grid lines verticales: re = -5..5
  const gridRe = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
  // Grid lines horizontales: im = -4..4
  const gridIm = [-4, -3, -2, -1, 1, 2, 3, 4];

  return (
    <section className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>El Plano de Argand</h2>
      <p className={styles.seccionDesc}>
        Cada número complejo z = a + bi es un <strong>punto</strong> (o vector) en el plano.
        El eje horizontal representa la parte real, el vertical la parte imaginaria.
        Las operaciones se convierten en <strong>transformaciones geométricas</strong>.
      </p>

      <div className={styles.operacionBtns}>
        {OPETIQUETAS.map(op => (
          <button
            key={op.id}
            type="button"
            className={`${styles.opBtn} ${operacion === op.id ? styles.opBtnActivo : ''}`}
            onClick={() => setOperacion(op.id)}
            aria-pressed={operacion === op.id}
          >
            {op.label}
          </button>
        ))}
      </div>

      <div className={styles.argandWrapper}>
        <svg
          viewBox="0 0 500 420"
          className={styles.argandSvg}
          aria-label="Plano de Argand — representación geométrica de números complejos"
          role="img"
        >
          <defs>
            {/* Marcadores de flecha */}
            <marker id="arrow-z1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#2E86AB" />
            </marker>
            <marker id="arrow-z2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#48A9A6" />
            </marker>
            <marker id="arrow-res" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#E67E22" />
            </marker>
          </defs>

          {/* Grid vertical */}
          {gridRe.map(r => (
            <line
              key={`gv${r}`}
              x1={svgX(r)} y1={20}
              x2={svgX(r)} y2={400}
              stroke="#e8e8e8"
              strokeWidth="0.7"
            />
          ))}
          {/* Grid horizontal */}
          {gridIm.map(i => (
            <line
              key={`gh${i}`}
              x1={20} y1={svgY(i)}
              x2={480} y2={svgY(i)}
              stroke="#e8e8e8"
              strokeWidth="0.7"
            />
          ))}

          {/* Eje X (Re) */}
          <line x1={20} y1={ARGAND_CENTRO_Y} x2={476} y2={ARGAND_CENTRO_Y} stroke="#888" strokeWidth="1.8" />
          <polygon points={`476,${ARGAND_CENTRO_Y - 5} 486,${ARGAND_CENTRO_Y} 476,${ARGAND_CENTRO_Y + 5}`} fill="#888" />
          <text x={488} y={ARGAND_CENTRO_Y + 4} fontSize="13" fill="#888" fontWeight="600">Re</text>

          {/* Eje Y (Im) */}
          <line x1={ARGAND_CENTRO_X} y1={400} x2={ARGAND_CENTRO_X} y2={24} stroke="#888" strokeWidth="1.8" />
          <polygon points={`${ARGAND_CENTRO_X - 5},24 ${ARGAND_CENTRO_X},14 ${ARGAND_CENTRO_X + 5},24`} fill="#888" />
          <text x={ARGAND_CENTRO_X + 6} y={14} fontSize="13" fill="#888" fontWeight="600">Im</text>

          {/* Etiquetas de escala en eje Re */}
          {[-4, -2, 2, 4].map(r => (
            <text key={`lr${r}`} x={svgX(r)} y={ARGAND_CENTRO_Y + 16} fontSize="10" fill="#aaa" textAnchor="middle">
              {r}
            </text>
          ))}
          {/* Etiquetas de escala en eje Im */}
          {[-3, -1, 1, 3].map(i => (
            <text key={`li${i}`} x={ARGAND_CENTRO_X - 14} y={svgY(i) + 4} fontSize="10" fill="#aaa" textAnchor="middle">
              {i}
            </text>
          ))}

          {/* Paralelogramo de suma */}
          {operacion === 'suma' && (
            <>
              <line
                x1={svgX(re1)} y1={svgY(im1)}
                x2={svgX(res.re)} y2={svgY(res.im)}
                stroke="#ccc" strokeWidth="1" strokeDasharray="4 3"
              />
              <line
                x1={svgX(re2)} y1={svgY(im2)}
                x2={svgX(res.re)} y2={svgY(res.im)}
                stroke="#ccc" strokeWidth="1" strokeDasharray="4 3"
              />
            </>
          )}

          {/* Vector z₁ */}
          <FlechaSVG re={re1} im={im1} color="#2E86AB" markerId="arrow-z1" label="z₁" />

          {/* Vector z₂ (no mostrar en conjugado) */}
          {operacion !== 'conjugado' && (
            <FlechaSVG re={re2} im={im2} color="#48A9A6" markerId="arrow-z2" label="z₂" />
          )}

          {/* Vector resultado */}
          <FlechaSVG re={res.re} im={res.im} color="#E67E22" strokeWidth={2.5} dashed markerId="arrow-res" label="=" />
        </svg>
      </div>

      {/* Sliders */}
      <div className={styles.slidersGrid}>
        <div className={styles.sliderItem}>
          <label className={styles.sliderLabel}>Re(z₁): <strong>{re1.toFixed(1)}</strong></label>
          <input
            type="range" min={-4} max={4} step={0.5}
            value={re1} onChange={e => setRe1(Number(e.target.value))}
            aria-label="Parte real de z₁"
          />
        </div>
        <div className={styles.sliderItem}>
          <label className={styles.sliderLabel}>Im(z₁): <strong>{im1.toFixed(1)}</strong></label>
          <input
            type="range" min={-4} max={4} step={0.5}
            value={im1} onChange={e => setIm1(Number(e.target.value))}
            aria-label="Parte imaginaria de z₁"
          />
        </div>
        {operacion !== 'conjugado' && (
          <>
            <div className={styles.sliderItem}>
              <label className={styles.sliderLabel}>Re(z₂): <strong>{re2.toFixed(1)}</strong></label>
              <input
                type="range" min={-4} max={4} step={0.5}
                value={re2} onChange={e => setRe2(Number(e.target.value))}
                aria-label="Parte real de z₂"
              />
            </div>
            <div className={styles.sliderItem}>
              <label className={styles.sliderLabel}>Im(z₂): <strong>{im2.toFixed(1)}</strong></label>
              <input
                type="range" min={-4} max={4} step={0.5}
                value={im2} onChange={e => setIm2(Number(e.target.value))}
                aria-label="Parte imaginaria de z₂"
              />
            </div>
          </>
        )}
      </div>

      {/* Resultado */}
      <div className={styles.resultadoCalculo} aria-live="polite">
        <div>z₁ = {fmtComplejo(re1, im1)}</div>
        {operacion !== 'conjugado' && <div>{simbolo[operacion]} z₂ = {fmtComplejo(re2, im2)}</div>}
        <div className={styles.resultadoLinea}>──────────────────</div>
        <div>
          {operacion === 'conjugado' ? 'z̄₁' : '='} {fmtComplejo(res.re, res.im)}
        </div>
      </div>

      <p className={styles.insightOperacion}>{insight[operacion]}</p>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente: Forma Polar
// ─────────────────────────────────────────────

function FormaPolar() {
  const [re1, setRe1] = useState(2.0);
  const [im1, setIm1] = useState(1.5);

  const r = modulo(re1, im1);
  const theta = argGrados(re1, im1);

  return (
    <section className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Forma Polar</h2>
      <div className={styles.polarCard}>
        <p>
          Cualquier número complejo z = a + bi puede escribirse como:{' '}
          <strong>z = r · e^(iθ)</strong>
        </p>
        <ul className={styles.polarLista}>
          <li><strong>r = |z| = √(a²+b²)</strong> → el módulo (longitud del vector)</li>
          <li><strong>θ = arg(z) = atan2(b,a)</strong> → el argumento (ángulo con el eje real)</li>
          <li>Multiplicar en forma polar: módulos se <strong>multiplican</strong>, ángulos se <strong>suman</strong></li>
          <li>Potencias: z^n = r^n · e^(inθ) → <strong>fórmula de De Moivre</strong></li>
        </ul>

        <div className={styles.slidersGrid} style={{ marginTop: '16px' }}>
          <div className={styles.sliderItem}>
            <label className={styles.sliderLabel}>Re(z): <strong>{re1.toFixed(1)}</strong></label>
            <input
              type="range" min={-4} max={4} step={0.5}
              value={re1} onChange={e => setRe1(Number(e.target.value))}
              aria-label="Parte real de z"
            />
          </div>
          <div className={styles.sliderItem}>
            <label className={styles.sliderLabel}>Im(z): <strong>{im1.toFixed(1)}</strong></label>
            <input
              type="range" min={-4} max={4} step={0.5}
              value={im1} onChange={e => setIm1(Number(e.target.value))}
              aria-label="Parte imaginaria de z"
            />
          </div>
        </div>

        <div className={styles.resultadoCalculo} style={{ marginTop: '16px' }}>
          <div>z = {fmtComplejo(re1, im1)}</div>
          <div>r = {r.toFixed(3)}</div>
          <div>θ = {theta.toFixed(1)}°</div>
          <div>z = {r.toFixed(3)} · e^(i·{theta.toFixed(1)}°)</div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente: Círculo de Euler
// ─────────────────────────────────────────────

function CirculoEuler() {
  const [theta, setTheta] = useState(Math.PI / 3);

  const cx = 170;
  const cy = 150;
  const r = 100;
  const px = cx + Math.cos(theta) * r;
  const py = cy - Math.sin(theta) * r;

  const thetaGrados = (theta * 180) / Math.PI;
  const cosVal = Math.cos(theta);
  const sinVal = Math.sin(theta);

  return (
    <section className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>La Fórmula de Euler: e^(iθ) = cos(θ) + i·sin(θ)</h2>
      <p className={styles.seccionDesc}>
        Cuando θ varía de 0 a 2π, el punto e^(iθ) recorre el <strong>círculo unitario</strong>.
        Las proyecciones sobre los ejes son exactamente cos(θ) e i·sin(θ).
      </p>

      <div className={styles.eulerSvgWrapper}>
        <svg viewBox="0 0 340 300" className={styles.eulerSvg} aria-label="Círculo unitario de Euler con punto móvil" role="img">
          {/* Grid sutil */}
          {[-1, 0, 1].map(n => (
            <g key={n}>
              <line x1={cx + n * r} y1={20} x2={cx + n * r} y2={280} stroke="#f0f0f0" strokeWidth="0.8" />
              <line x1={20} y1={cy + n * r} x2={320} y2={cy + n * r} stroke="#f0f0f0" strokeWidth="0.8" />
            </g>
          ))}

          {/* Ejes */}
          <line x1={20} y1={cy} x2={316} y2={cy} stroke="#ccc" strokeWidth="1.2" />
          <line x1={cx} y1={20} x2={cx} y2={276} stroke="#ccc" strokeWidth="1.2" />

          {/* Círculo unitario */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ddd" strokeWidth="1.5" />

          {/* Proyección horizontal (cos) */}
          <line
            x1={cx} y1={py}
            x2={px} y2={py}
            stroke="#48A9A6" strokeWidth="1.2" strokeDasharray="4 3"
          />
          {/* Proyección vertical (sin) */}
          <line
            x1={px} y1={cy}
            x2={px} y2={py}
            stroke="#E67E22" strokeWidth="1.2" strokeDasharray="4 3"
          />

          {/* Radio al punto */}
          <line
            x1={cx} y1={cy}
            x2={px} y2={py}
            stroke="#2E86AB" strokeWidth="2.5"
          />

          {/* Punto en el círculo */}
          <circle cx={px} cy={py} r={5} fill="#2E86AB" />

          {/* Etiquetas cos/sin */}
          <text x={(cx + px) / 2} y={py - 6} fontSize="10" fill="#48A9A6" textAnchor="middle">
            cos={cosVal.toFixed(2)}
          </text>
          <text x={px + 8} y={(cy + py) / 2} fontSize="10" fill="#E67E22">
            sin={sinVal.toFixed(2)}
          </text>

          {/* Origen */}
          <circle cx={cx} cy={cy} r={3} fill="#888" />

          {/* Etiquetas ejes */}
          <text x={318} y={cy + 4} fontSize="11" fill="#888">Re</text>
          <text x={cx + 6} y={18} fontSize="11" fill="#888">Im</text>

          {/* Labels -1, 1 en ejes */}
          <text x={cx + r + 2} y={cy + 14} fontSize="9" fill="#bbb">1</text>
          <text x={cx - r - 8} y={cy + 14} fontSize="9" fill="#bbb">-1</text>
          <text x={cx + 4} y={cy - r - 2} fontSize="9" fill="#bbb">i</text>
          <text x={cx + 4} y={cy + r + 14} fontSize="9" fill="#bbb">-i</text>
        </svg>
      </div>

      <div className={styles.sliderItem} style={{ maxWidth: '400px', margin: '0 auto 16px' }}>
        <label className={styles.sliderLabel}>
          θ = <strong>{thetaGrados.toFixed(0)}°</strong>
        </label>
        <input
          type="range"
          min={0}
          max={Math.PI * 2}
          step={0.05}
          value={theta}
          onChange={e => setTheta(Number(e.target.value))}
          aria-label="Ángulo theta en radianes"
        />
      </div>

      <div className={styles.resultadoCalculo} style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
        <div>θ = {thetaGrados.toFixed(0)}°</div>
        <div>e^(iθ) = {cosVal.toFixed(3)} + {sinVal.toFixed(3)}i</div>
        <div>cos(θ) = {cosVal.toFixed(3)}, sin(θ) = {sinVal.toFixed(3)}</div>
      </div>

      <div className={styles.eulerBox}>
        <p>Cuando θ = π (180°):</p>
        <p className={styles.eulerFormula}>e^(iπ) = −1</p>
        <p>O lo que es lo mismo:</p>
        <p className={styles.eulerFormula}>e^(iπ) + 1 = 0</p>
        <p className={styles.eulerDesc}>
          La identidad más bella de las matemáticas — conecta e, π, i, 1 y 0 en una sola ecuación.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function NumerosComplejosPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Números Complejos</h1>
        <p className={styles.subtitle}>
          El plano de Argand, las operaciones como geometría y la identidad e^(iπ)+1=0
        </p>
      </header>

      <LegalNotice />

      {/* Sección 1: Por qué existen */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>¿Por qué existen los números complejos?</h2>
        <div className={styles.contexto}>
          <p>
            Empieza con una pregunta simple: <strong>¿qué número elevado al cuadrado da −1?</strong>
          </p>
          <p>
            En los números reales, x² = −1 no tiene solución. El cuadrado de cualquier número real
            es siempre positivo o cero. Pero en 1545, el matemático Gerolamo Cardano necesitó
            manejar estas raíces &quot;imposibles&quot; para resolver ecuaciones cúbicas — y funcionó,
            aunque sin entender del todo por qué.
          </p>
        </div>
        <div className={styles.historiasGrid}>
          <div className={styles.historiaCard}>
            <span className={styles.historiaIcono} aria-hidden="true">😕</span>
            <h3>El error del nombre</h3>
            <p>
              René Descartes los llamó &quot;imaginarios&quot; en 1637 para denigrarlos. El nombre
              quedó, aunque es completamente engañoso: los números imaginarios no son más
              inventados que los negativos (que también se llamaron &quot;absurdos&quot; en su día).
            </p>
          </div>
          <div className={styles.historiaCard}>
            <span className={styles.historiaIcono} aria-hidden="true">📐</span>
            <h3>Gauss los legitimó</h3>
            <p>
              Carl Friedrich Gauss los dotó de base geométrica en el plano (1797). No son
              &quot;imaginarios&quot;: son <strong>pares de números reales</strong> (a, b) con
              una aritmética especial. El plano de Argand (propuesto por Jean-Robert Argand en 1806)
              los hizo completamente visuales.
            </p>
          </div>
          <div className={styles.historiaCard}>
            <span className={styles.historiaIcono} aria-hidden="true">🌍</span>
            <h3>Imprescindibles hoy</h3>
            <p>
              Sin números complejos no existirían: la mecánica cuántica, la ingeniería eléctrica AC,
              la transformada de Fourier, el procesado de señal, la teoría de control, ni los
              fractales. Son una herramienta real para describir la realidad.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 2: Plano de Argand */}
      <PlanoArgand />

      {/* Sección 3: Forma Polar */}
      <FormaPolar />

      {/* Sección 4: Fórmula de Euler */}
      <CirculoEuler />

      {/* Sección 5: Aplicaciones */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Aplicaciones en el mundo real</h2>
        <div className={styles.aplicacionesGrid}>
          <div className={styles.aplicacionCard}>
            <span className={styles.aplicacionIcono} aria-hidden="true">⚡</span>
            <h3>Circuitos AC</h3>
            <p>
              La impedancia Z = R + jX combina resistencia R y reactancia X.
              Los ingenieros usan <em>j</em> en vez de <em>i</em> para no confundir con la
              corriente eléctrica. El análisis de circuitos de corriente alterna es
              álgebra compleja pura.
            </p>
          </div>
          <div className={styles.aplicacionCard}>
            <span className={styles.aplicacionIcono} aria-hidden="true">🎵</span>
            <h3>Transformada de Fourier</h3>
            <p>
              Descompone cualquier señal en frecuencias. La fórmula usa e^(−iωt).
              Aplicaciones directas: compresión MP3, ecografías médicas, MRI, filtros de audio
              y cualquier procesado de señal digital.
            </p>
          </div>
          <div className={styles.aplicacionCard}>
            <span className={styles.aplicacionIcono} aria-hidden="true">⚛️</span>
            <h3>Mecánica cuántica</h3>
            <p>
              La función de onda ψ(x,t) es de valor complejo. El módulo al cuadrado |ψ|²
              da la densidad de probabilidad de encontrar la partícula. Sin números complejos,
              la mecánica cuántica es sencillamente informulable.
            </p>
          </div>
        </div>
      </section>

      {/* Sección 6: Nota sobre fractales */}
      <div className={styles.notaFractales}>
        <p>
          💡 El conjunto de Mandelbrot (z → z² + c) es otra aplicación fascinante de los números
          complejos. Si quieres explorar los fractales que generan →{' '}
          <a href="/visualizador-geometria-fractales/" className={styles.link}>
            Visualizador de Fractales
          </a>
        </p>
      </div>

      <EducationalSection
        title="Historia de los números imposibles"
        subtitle="De Cardano a Gauss — cómo aceptamos lo inconcebible"
        defaultOpen={false}
      >
        <h3>Cardano y la raíz de lo negativo (1545)</h3>
        <p>
          En su <em>Ars Magna</em>, Gerolamo Cardano presentó la solución de la cúbica general.
          Para ciertos casos necesitaba calcular √(−15) — algo &quot;imposible&quot; — pero el
          resultado final era real y correcto. Cardano lo llamó &quot;sofístico&quot; y siguió adelante.
        </p>

        <h3>Rafael Bombelli formaliza las reglas (1572)</h3>
        <p>
          Bombelli fue el primero en establecer reglas aritméticas explícitas para √−1, incluyendo
          que (√−1)(√−1) = −1. Sin entender qué eran geométricamente, ya sabía calcular con ellos.
        </p>

        <h3>La geometrización: Argand y Gauss (1797–1831)</h3>
        <p>
          Gauss demostró el Teorema Fundamental del Álgebra: todo polinomio de grado n tiene
          exactamente n raíces complejas. Argand los visualizó en el plano que lleva su nombre.
          A partir de aquí, los números complejos dejaron de ser &quot;imposibles&quot; para ser
          <strong>geometría de un plano extendido</strong>.
        </p>

        <h3>Hamilton y los cuaterniones (1843)</h3>
        <p>
          Intentando extender los complejos a 3D, William Hamilton descubrió que necesitaba 4
          dimensiones: los cuaterniones ℍ = {'{'}a + bi + cj + dk{'}'}. Hoy son fundamentales en
          gráficos 3D y robótica para representar rotaciones sin el problema del gimbal lock.
        </p>

        <div className={styles.warningBox}>
          <strong>ℹ️ Nota:</strong> Los valores del plano son aproximaciones al paso de slider de
          0,5 unidades. Las fórmulas de operaciones son exactas.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-numeros-complejos')} />
      <ShareCard appName="visualizador-numeros-complejos" />
      <Footer appName="visualizador-numeros-complejos" />
    </div>
  );
}
