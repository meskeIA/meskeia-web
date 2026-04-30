'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './AlgebraLineal.module.css';
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

interface Vector2D {
  x: number;
  y: number;
}

interface Matriz2x2 {
  a: number; // fila 0, col 0
  b: number; // fila 0, col 1
  c: number; // fila 1, col 0
  d: number; // fila 1, col 1
}

interface MatrizSimetrica2x2 {
  a: number; // fila 0, col 0 (= fila 1, col 1 del off-diagonal)
  b: number; // fila 0, col 1 = fila 1, col 0
  d: number; // fila 1, col 1
}

type TabActivo = 'vectores' | 'transformaciones' | 'determinante' | 'eigenvalores';

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const SVG_SIZE = 350;
const ESCALA = 30; // píxeles por unidad matemática
const ORIGEN_X = SVG_SIZE / 2;
const ORIGEN_Y = SVG_SIZE / 2;
const GRID_RANGE = 5; // de -5 a 5

const PRESETS: { label: string; matriz: Matriz2x2 }[] = [
  { label: 'Identidad', matriz: { a: 1, b: 0, c: 0, d: 1 } },
  { label: 'Rotación 45°', matriz: { a: 0.707, b: -0.707, c: 0.707, d: 0.707 } },
  { label: 'Escala ×2', matriz: { a: 2, b: 0, c: 0, d: 2 } },
  { label: 'Cizalla', matriz: { a: 1, b: 1, c: 0, d: 1 } },
  { label: 'Reflexión', matriz: { a: 1, b: 0, c: 0, d: -1 } },
];

// ─────────────────────────────────────────────
// Helpers matemáticos
// ─────────────────────────────────────────────

function toSvgX(x: number): number {
  return ORIGEN_X + x * ESCALA;
}
function toSvgY(y: number): number {
  return ORIGEN_Y - y * ESCALA;
}

function modulo(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function productoEscalar(u: Vector2D, v: Vector2D): number {
  return u.x * v.x + u.y * v.y;
}

function anguloEntreVectores(u: Vector2D, v: Vector2D): number {
  const mu = modulo(u);
  const mv = modulo(v);
  if (mu === 0 || mv === 0) return 0;
  const cos = Math.max(-1, Math.min(1, productoEscalar(u, v) / (mu * mv)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function determinante(m: Matriz2x2): number {
  return m.a * m.d - m.b * m.c;
}

function aplicarMatriz(m: Matriz2x2, v: Vector2D): Vector2D {
  return {
    x: m.a * v.x + m.b * v.y,
    y: m.c * v.x + m.d * v.y,
  };
}

// Eigenvalores para matriz simétrica [[a,b],[b,d]] via fórmula analítica
function calcularEigenvalores(m: MatrizSimetrica2x2): { lambda1: number; lambda2: number } {
  const traza = m.a + m.d;
  const det = m.a * m.d - m.b * m.b;
  const discriminante = (traza / 2) * (traza / 2) - det;
  if (discriminante < 0) {
    return { lambda1: traza / 2, lambda2: traza / 2 };
  }
  const raiz = Math.sqrt(discriminante);
  return {
    lambda1: traza / 2 + raiz,
    lambda2: traza / 2 - raiz,
  };
}

// Eigenvector para eigenvalor dado (matriz simétrica)
function calcularEigenvector(m: MatrizSimetrica2x2, lambda: number): Vector2D {
  // (A - λI)v = 0
  // Si b != 0: v = (b, λ-a) normalizado
  // Si b == 0: eigenvectores canónicos
  if (Math.abs(m.b) > 1e-9) {
    const vx = m.b;
    const vy = lambda - m.a;
    const mag = Math.sqrt(vx * vx + vy * vy);
    return { x: vx / mag, y: vy / mag };
  }
  // diagonal: eigenvectores son (1,0) y (0,1)
  if (Math.abs(m.a - lambda) < 1e-9) return { x: 1, y: 0 };
  return { x: 0, y: 1 };
}

// ─────────────────────────────────────────────
// Subcomponentes SVG
// ─────────────────────────────────────────────

interface PlanoCartesianoProps {
  gridColor?: string;
}

function PlanoCartesiano({ gridColor = '#ddd' }: PlanoCartesianoProps) {
  const lineas: string[] = [];
  for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
    const svgX = toSvgX(i);
    const svgY0 = toSvgY(-GRID_RANGE);
    const svgY1 = toSvgY(GRID_RANGE);
    lineas.push(`M${svgX},${svgY0} L${svgX},${svgY1}`);
    const svgXy = toSvgY(i);
    const svgX0 = toSvgX(-GRID_RANGE);
    const svgX1 = toSvgX(GRID_RANGE);
    lineas.push(`M${svgX0},${svgXy} L${svgX1},${svgXy}`);
  }

  return (
    <>
      {/* Cuadrícula */}
      <path d={lineas.join(' ')} stroke={gridColor} strokeWidth="0.5" fill="none" />
      {/* Ejes */}
      <line x1={toSvgX(-GRID_RANGE)} y1={ORIGEN_Y} x2={toSvgX(GRID_RANGE)} y2={ORIGEN_Y}
        stroke="currentColor" strokeWidth="1.5" />
      <line x1={ORIGEN_X} y1={toSvgY(-GRID_RANGE)} x2={ORIGEN_X} y2={toSvgY(GRID_RANGE)}
        stroke="currentColor" strokeWidth="1.5" />
      {/* Etiquetas de ejes */}
      <text x={toSvgX(GRID_RANGE) - 12} y={ORIGEN_Y + 14} fontSize="11" fill="currentColor">x</text>
      <text x={ORIGEN_X + 6} y={toSvgY(GRID_RANGE) + 14} fontSize="11" fill="currentColor">y</text>
    </>
  );
}

interface FlechaVectorProps {
  desde: Vector2D;
  hasta: Vector2D;
  color: string;
  etiqueta?: string;
  dasharray?: string;
}

function FlechaVector({ desde, hasta, color, etiqueta, dasharray }: FlechaVectorProps) {
  const x1 = toSvgX(desde.x);
  const y1 = toSvgY(desde.y);
  const x2 = toSvgX(hasta.x);
  const y2 = toSvgY(hasta.y);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return null;

  // Flecha (triángulo)
  const arrowLen = 10;
  const angle = Math.atan2(dy, dx);
  const ax1 = x2 - arrowLen * Math.cos(angle - 0.4);
  const ay1 = y2 - arrowLen * Math.sin(angle - 0.4);
  const ax2 = x2 - arrowLen * Math.cos(angle + 0.4);
  const ay2 = y2 - arrowLen * Math.sin(angle + 0.4);

  const mx = (x1 + x2) / 2 - 10;
  const my = (y1 + y2) / 2 - 8;

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5"
        strokeDasharray={dasharray} />
      <polygon points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`} fill={color} />
      {etiqueta && (
        <text x={mx} y={my} fontSize="13" fontWeight="700" fill={color}>{etiqueta}</text>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────
// Tab 1 — Vectores 2D
// ─────────────────────────────────────────────

function TabVectores() {
  const [u, setU] = useState<Vector2D>({ x: 3, y: 1 });
  const [v, setV] = useState<Vector2D>({ x: 1, y: 3 });

  const suma: Vector2D = { x: u.x + v.x, y: u.y + v.y };
  const pe = productoEscalar(u, v);
  const angulo = anguloEntreVectores(u, v);
  const modU = modulo(u);
  const modV = modulo(v);

  return (
    <div className={styles.tabContent}>
      <div className={styles.interactivo}>
        {/* Controles */}
        <div className={styles.controles}>
          <div className={styles.vectorGroup}>
            <h4 className={styles.vectorLabel} style={{ color: '#2E86AB' }}>Vector u</h4>
            <label className={styles.sliderLabel}>
              u<sub>x</sub> = {u.x}
              <input type="range" min="-5" max="5" step="0.5" value={u.x}
                onChange={(e) => setU((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
                className={styles.slider} aria-label="Componente x del vector u" />
            </label>
            <label className={styles.sliderLabel}>
              u<sub>y</sub> = {u.y}
              <input type="range" min="-5" max="5" step="0.5" value={u.y}
                onChange={(e) => setU((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
                className={styles.slider} aria-label="Componente y del vector u" />
            </label>
          </div>

          <div className={styles.vectorGroup}>
            <h4 className={styles.vectorLabel} style={{ color: '#48A9A6' }}>Vector v</h4>
            <label className={styles.sliderLabel}>
              v<sub>x</sub> = {v.x}
              <input type="range" min="-5" max="5" step="0.5" value={v.x}
                onChange={(e) => setV((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
                className={styles.slider} aria-label="Componente x del vector v" />
            </label>
            <label className={styles.sliderLabel}>
              v<sub>y</sub> = {v.y}
              <input type="range" min="-5" max="5" step="0.5" value={v.y}
                onChange={(e) => setV((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
                className={styles.slider} aria-label="Componente y del vector v" />
            </label>
          </div>

          <div className={styles.metricas}>
            <div className={styles.metrica}>
              <span className={styles.metricaNombre}>u · v</span>
              <span className={styles.metricaValor}>{pe.toFixed(2)}</span>
            </div>
            <div className={styles.metrica}>
              <span className={styles.metricaNombre}>|u|</span>
              <span className={styles.metricaValor}>{modU.toFixed(2)}</span>
            </div>
            <div className={styles.metrica}>
              <span className={styles.metricaNombre}>|v|</span>
              <span className={styles.metricaValor}>{modV.toFixed(2)}</span>
            </div>
            <div className={styles.metrica}>
              <span className={styles.metricaNombre}>Ángulo</span>
              <span className={styles.metricaValor}>{angulo.toFixed(1)}°</span>
            </div>
          </div>

          <div className={styles.formulaBox}>
            <strong>u · v = |u||v|cos(θ)</strong>
            <br />
            {pe.toFixed(2)} = {modU.toFixed(2)} × {modV.toFixed(2)} × cos({angulo.toFixed(1)}°)
          </div>
        </div>

        {/* SVG */}
        <div className={styles.svgContainer}>
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className={styles.svg} aria-label="Plano cartesiano con vectores u y v">
            <PlanoCartesiano />
            {/* Suma: paralelogramo punteado */}
            <FlechaVector desde={u} hasta={suma} color="#48A9A6" dasharray="4 3" />
            <FlechaVector desde={v} hasta={suma} color="#2E86AB" dasharray="4 3" />
            {/* Vectores principales */}
            <FlechaVector desde={{ x: 0, y: 0 }} hasta={u} color="#2E86AB" etiqueta="u" />
            <FlechaVector desde={{ x: 0, y: 0 }} hasta={v} color="#48A9A6" etiqueta="v" />
            {/* Suma u+v */}
            <FlechaVector desde={{ x: 0, y: 0 }} hasta={suma} color="#E67E22" etiqueta="u+v" />
          </svg>
          <p className={styles.svgNota}>
            La regla del paralelogramo: <strong style={{ color: '#E67E22' }}>u+v</strong> es la diagonal del paralelogramo formado por <strong style={{ color: '#2E86AB' }}>u</strong> y <strong style={{ color: '#48A9A6' }}>v</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2 — Transformaciones Lineales
// ─────────────────────────────────────────────

function TabTransformaciones() {
  const [matriz, setMatriz] = useState<Matriz2x2>({ a: 1, b: 0, c: 0, d: 1 });

  const det = useMemo(() => determinante(matriz), [matriz]);

  const aplicarPreset = useCallback((m: Matriz2x2) => {
    setMatriz(m);
  }, []);

  // Generar líneas de la cuadrícula transformada
  const lineasTransformadas = useMemo(() => {
    const lineas: string[] = [];
    for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
      // Líneas verticales originales → transformadas
      const p0 = aplicarMatriz(matriz, { x: i, y: -GRID_RANGE });
      const p1 = aplicarMatriz(matriz, { x: i, y: GRID_RANGE });
      lineas.push(`M${toSvgX(p0.x)},${toSvgY(p0.y)} L${toSvgX(p1.x)},${toSvgY(p1.y)}`);

      // Líneas horizontales originales → transformadas
      const q0 = aplicarMatriz(matriz, { x: -GRID_RANGE, y: i });
      const q1 = aplicarMatriz(matriz, { x: GRID_RANGE, y: i });
      lineas.push(`M${toSvgX(q0.x)},${toSvgY(q0.y)} L${toSvgX(q1.x)},${toSvgY(q1.y)}`);
    }
    return lineas.join(' ');
  }, [matriz]);

  // Vectores base transformados
  const e1t = aplicarMatriz(matriz, { x: 1, y: 0 });
  const e2t = aplicarMatriz(matriz, { x: 0, y: 1 });

  const gridColor = det < 0 ? 'rgba(231,76,60,0.5)' : 'rgba(46,134,171,0.5)';

  return (
    <div className={styles.tabContent}>
      <div className={styles.interactivo}>
        {/* Controles */}
        <div className={styles.controles}>
          <h4 className={styles.vectorLabel}>Matriz A = [a b; c d]</h4>
          <div className={styles.matrizSliders}>
            {(['a', 'b', 'c', 'd'] as (keyof Matriz2x2)[]).map((key) => (
              <label key={key} className={styles.sliderLabel}>
                {key} = {matriz[key].toFixed(2)}
                <input type="range" min="-3" max="3" step="0.1"
                  value={matriz[key]}
                  onChange={(e) => setMatriz((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                  className={styles.slider}
                  aria-label={`Componente ${key} de la matriz`} />
              </label>
            ))}
          </div>

          <div className={styles.matrizVisual}>
            <span className={styles.matrizBracket}>[</span>
            <div className={styles.matrizCeldas}>
              <span>{matriz.a.toFixed(2)}</span>
              <span>{matriz.b.toFixed(2)}</span>
              <span>{matriz.c.toFixed(2)}</span>
              <span>{matriz.d.toFixed(2)}</span>
            </div>
            <span className={styles.matrizBracket}>]</span>
          </div>

          <div className={styles.metricas}>
            <div className={`${styles.metrica} ${det < 0 ? styles.metricaRoja : det === 0 ? styles.metricaAmarilla : ''}`}>
              <span className={styles.metricaNombre}>det(A)</span>
              <span className={styles.metricaValor}>{det.toFixed(3)}</span>
            </div>
          </div>

          <div className={styles.detMensaje}>
            {det === 0
              ? '⚠️ det = 0: la transformación colapsa el plano a una línea (o punto). No es invertible.'
              : det < 0
              ? '↩️ det < 0: la orientación se invierte (izquierda/derecha se intercambian).'
              : '✓ det > 0: la orientación se preserva.'}
          </div>

          <div className={styles.presets}>
            <p className={styles.presetsLabel}>Presets:</p>
            <div className={styles.presetsBotones}>
              {PRESETS.map((p) => (
                <button key={p.label} className={styles.presetBtn}
                  onClick={() => aplicarPreset(p.matriz)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG */}
        <div className={styles.svgContainer}>
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className={styles.svg} aria-label="Cuadrícula transformada por la matriz">
            {/* Cuadrícula original muy tenue */}
            <PlanoCartesiano gridColor="rgba(180,180,180,0.2)" />
            {/* Cuadrícula transformada */}
            <path d={lineasTransformadas} stroke={gridColor} strokeWidth="0.9" fill="none" />
            {/* Ejes transformados */}
            <line x1={ORIGEN_X} y1={ORIGEN_Y}
              x2={toSvgX(e1t.x)} y2={toSvgY(e1t.y)}
              stroke="#2E86AB" strokeWidth="2.5" />
            <line x1={ORIGEN_X} y1={ORIGEN_Y}
              x2={toSvgX(e2t.x)} y2={toSvgY(e2t.y)}
              stroke="#48A9A6" strokeWidth="2.5" />
            <text x={toSvgX(e1t.x) + 4} y={toSvgY(e1t.y) - 4}
              fontSize="12" fontWeight="700" fill="#2E86AB">Ae₁</text>
            <text x={toSvgX(e2t.x) + 4} y={toSvgY(e2t.y) - 4}
              fontSize="12" fontWeight="700" fill="#48A9A6">Ae₂</text>
          </svg>
          <p className={styles.svgNota}>
            La cuadrícula transformada revela cómo A estira/rota el plano. El <strong style={{ color: '#2E86AB' }}>azul</strong> y <strong style={{ color: '#48A9A6' }}>teal</strong> son los vectores base transformados.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3 — Determinante como Área
// ─────────────────────────────────────────────

function TabDeterminante() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(0);
  const [d, setD] = useState(2);

  const v1: Vector2D = { x: a, y: c }; // primera columna
  const v2: Vector2D = { x: b, y: d }; // segunda columna
  const det = a * d - b * c;
  const area = Math.abs(det);

  // Vértices del paralelogramo: O, v1, v1+v2, v2
  const px = [
    toSvgX(0), toSvgX(v1.x), toSvgX(v1.x + v2.x), toSvgX(v2.x),
  ].join(',');
  const py = [
    toSvgY(0), toSvgY(v1.y), toSvgY(v1.y + v2.y), toSvgY(v2.y),
  ].join(',');
  const puntos = `${toSvgX(0)},${toSvgY(0)} ${toSvgX(v1.x)},${toSvgY(v1.y)} ${toSvgX(v1.x + v2.x)},${toSvgY(v1.y + v2.y)} ${toSvgX(v2.x)},${toSvgY(v2.y)}`;

  void px; void py;

  return (
    <div className={styles.tabContent}>
      <div className={styles.interactivo}>
        {/* Controles */}
        <div className={styles.controles}>
          <h4 className={styles.vectorLabel}>Columnas de la matriz</h4>
          <p className={styles.sliderDescripcion}>Los vectores columna v₁ y v₂ forman el paralelogramo cuya área es |det(A)|.</p>

          <div className={styles.vectorGroup}>
            <h5 className={styles.vectorSubLabel} style={{ color: '#2E86AB' }}>v₁ = (a, c)</h5>
            <label className={styles.sliderLabel}>
              a = {a}
              <input type="range" min="-5" max="5" step="0.5" value={a}
                onChange={(e) => setA(parseFloat(e.target.value))}
                className={styles.slider} aria-label="Componente a" />
            </label>
            <label className={styles.sliderLabel}>
              c = {c}
              <input type="range" min="-5" max="5" step="0.5" value={c}
                onChange={(e) => setC(parseFloat(e.target.value))}
                className={styles.slider} aria-label="Componente c" />
            </label>
          </div>

          <div className={styles.vectorGroup}>
            <h5 className={styles.vectorSubLabel} style={{ color: '#48A9A6' }}>v₂ = (b, d)</h5>
            <label className={styles.sliderLabel}>
              b = {b}
              <input type="range" min="-5" max="5" step="0.5" value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className={styles.slider} aria-label="Componente b" />
            </label>
            <label className={styles.sliderLabel}>
              d = {d}
              <input type="range" min="-5" max="5" step="0.5" value={d}
                onChange={(e) => setD(parseFloat(e.target.value))}
                className={styles.slider} aria-label="Componente d" />
            </label>
          </div>

          <div className={styles.metricas}>
            <div className={styles.metrica}>
              <span className={styles.metricaNombre}>det(A) = ad − bc</span>
              <span className={styles.metricaValor}>{det.toFixed(2)}</span>
            </div>
            <div className={styles.metrica}>
              <span className={styles.metricaNombre}>Área = |det|</span>
              <span className={styles.metricaValor}>{area.toFixed(2)}</span>
            </div>
          </div>

          {det === 0 && (
            <div className={styles.detMensaje}>
              ⚠️ Los vectores son colineales: el paralelogramo tiene área cero. La matriz no es invertible.
            </div>
          )}
        </div>

        {/* SVG */}
        <div className={styles.svgContainer}>
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className={styles.svg} aria-label="Paralelogramo formado por los vectores columna">
            <PlanoCartesiano />
            {/* Paralelogramo relleno */}
            <polygon points={puntos}
              fill={det < 0 ? 'rgba(231,76,60,0.18)' : 'rgba(46,134,171,0.18)'}
              stroke={det < 0 ? 'rgba(231,76,60,0.7)' : 'rgba(46,134,171,0.7)'}
              strokeWidth="1.5" />
            {/* Vectores */}
            <FlechaVector desde={{ x: 0, y: 0 }} hasta={v1} color="#2E86AB" etiqueta="v₁" />
            <FlechaVector desde={{ x: 0, y: 0 }} hasta={v2} color="#48A9A6" etiqueta="v₂" />
            {/* Lados del paralelogramo */}
            <FlechaVector desde={v1} hasta={{ x: v1.x + v2.x, y: v1.y + v2.y }} color="#48A9A6" dasharray="4 3" />
            <FlechaVector desde={v2} hasta={{ x: v1.x + v2.x, y: v1.y + v2.y }} color="#2E86AB" dasharray="4 3" />
            {/* Etiqueta de área */}
            <text x={toSvgX((v1.x + v2.x) / 2) - 10} y={toSvgY((v1.y + v2.y) / 2) + 5}
              fontSize="13" fontWeight="700"
              fill={det < 0 ? '#c0392b' : '#2E86AB'}>
              Área = {area.toFixed(2)}
            </text>
          </svg>
          <p className={styles.svgNota}>
            El área del paralelogramo azul es exactamente |det(A)|. Si det {'<'} 0 (rojo), los vectores se han &quot;invertido&quot;.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4 — Eigenvalores / Eigenvectores
// ─────────────────────────────────────────────

function TabEigenvalores() {
  const [ms, setMs] = useState<MatrizSimetrica2x2>({ a: 2, b: 1, d: 2 });

  const mat: Matriz2x2 = { a: ms.a, b: ms.b, c: ms.b, d: ms.d };
  const { lambda1, lambda2 } = calcularEigenvalores(ms);
  const ev1 = calcularEigenvector(ms, lambda1);
  const ev2 = calcularEigenvector(ms, lambda2);

  // Aplicar la matriz a los eigenvectores: resultado = λ·v
  const av1 = aplicarMatriz(mat, ev1); // = lambda1 * ev1
  const av2 = aplicarMatriz(mat, ev2); // = lambda2 * ev2

  const escEigen = 2.5; // escala visual para eigenvectores

  return (
    <div className={styles.tabContent}>
      <div className={styles.interactivo}>
        {/* Controles */}
        <div className={styles.controles}>
          <h4 className={styles.vectorLabel}>Matriz simétrica A = [a b; b d]</h4>
          <p className={styles.sliderDescripcion}>
            Las matrices simétricas siempre tienen eigenvalores reales y eigenvectores ortogonales.
          </p>

          <label className={styles.sliderLabel}>
            a = {ms.a}
            <input type="range" min="-3" max="3" step="0.5" value={ms.a}
              onChange={(e) => setMs((prev) => ({ ...prev, a: parseFloat(e.target.value) }))}
              className={styles.slider} aria-label="Componente a de la matriz simétrica" />
          </label>
          <label className={styles.sliderLabel}>
            b = {ms.b}
            <input type="range" min="-3" max="3" step="0.5" value={ms.b}
              onChange={(e) => setMs((prev) => ({ ...prev, b: parseFloat(e.target.value) }))}
              className={styles.slider} aria-label="Componente b (off-diagonal) de la matriz simétrica" />
          </label>
          <label className={styles.sliderLabel}>
            d = {ms.d}
            <input type="range" min="-3" max="3" step="0.5" value={ms.d}
              onChange={(e) => setMs((prev) => ({ ...prev, d: parseFloat(e.target.value) }))}
              className={styles.slider} aria-label="Componente d de la matriz simétrica" />
          </label>

          <div className={styles.eigenResultados}>
            <div className={styles.eigenFila}>
              <span className={styles.eigenIcon} style={{ color: '#2E86AB' }}>λ₁</span>
              <span className={styles.eigenValor}>{lambda1.toFixed(3)}</span>
              <span className={styles.eigenVec}>v₁ = ({ev1.x.toFixed(2)}, {ev1.y.toFixed(2)})</span>
            </div>
            <div className={styles.eigenFila}>
              <span className={styles.eigenIcon} style={{ color: '#48A9A6' }}>λ₂</span>
              <span className={styles.eigenValor}>{lambda2.toFixed(3)}</span>
              <span className={styles.eigenVec}>v₂ = ({ev2.x.toFixed(2)}, {ev2.y.toFixed(2)})</span>
            </div>
          </div>

          <div className={styles.formulaBox}>
            <strong>Av = λv</strong>
            <br />
            El eigenvector <span style={{ color: '#2E86AB' }}>v₁</span> solo escala: A·v₁ = {lambda1.toFixed(2)}·v₁
            <br />
            El eigenvector <span style={{ color: '#48A9A6' }}>v₂</span> solo escala: A·v₂ = {lambda2.toFixed(2)}·v₂
          </div>
        </div>

        {/* SVG */}
        <div className={styles.svgContainer}>
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className={styles.svg} aria-label="Eigenvectores como ejes invariantes de la transformación">
            <PlanoCartesiano />
            {/* Eigenvectores (antes: longitud escEigen) */}
            <FlechaVector
              desde={{ x: 0, y: 0 }}
              hasta={{ x: ev1.x * escEigen, y: ev1.y * escEigen }}
              color="#2E86AB" etiqueta="v₁" />
            <FlechaVector
              desde={{ x: 0, y: 0 }}
              hasta={{ x: -ev1.x * escEigen, y: -ev1.y * escEigen }}
              color="#2E86AB" />
            <FlechaVector
              desde={{ x: 0, y: 0 }}
              hasta={{ x: ev2.x * escEigen, y: ev2.y * escEigen }}
              color="#48A9A6" etiqueta="v₂" />
            <FlechaVector
              desde={{ x: 0, y: 0 }}
              hasta={{ x: -ev2.x * escEigen, y: -ev2.y * escEigen }}
              color="#48A9A6" />
            {/* Eigenvectores transformados Av (líneas punteadas) */}
            <FlechaVector
              desde={{ x: 0, y: 0 }}
              hasta={{ x: av1.x, y: av1.y }}
              color="#E67E22" dasharray="5 3" etiqueta="Av₁" />
            <FlechaVector
              desde={{ x: 0, y: 0 }}
              hasta={{ x: av2.x, y: av2.y }}
              color="#E67E22" dasharray="5 3" etiqueta="Av₂" />
          </svg>
          <p className={styles.svgNota}>
            Los eigenvectores <strong style={{ color: '#2E86AB' }}>v₁</strong> y <strong style={{ color: '#48A9A6' }}>v₂</strong> no cambian de dirección. La transformación <strong style={{ color: '#E67E22' }}>Av</strong> (naranja punteado) queda siempre sobre el mismo eje.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAlgebraLineal() {
  const [tabActivo, setTabActivo] = useState<TabActivo>('vectores');

  const tabs: { id: TabActivo; label: string }[] = [
    { id: 'vectores', label: 'Vectores 2D' },
    { id: 'transformaciones', label: 'Transformaciones' },
    { id: 'determinante', label: 'Determinante' },
    { id: 'eigenvalores', label: 'Eigenvalores' },
  ];

  return (
    <div className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono} aria-hidden="true">🔢</div>
        <h1 className={styles.titulo}>Álgebra Lineal Visual</h1>
        <p className={styles.subtitulo}>
          Vectores, transformaciones, determinantes y eigenvalores — todo con geometría interactiva.
          La esencia del álgebra lineal, sin ecuaciones abstractas.
        </p>
        <p className={styles.heroNota}>
          4 modos interactivos · Funciona en el navegador · Sin instalación
        </p>
      </header>

      <LegalNotice />

      {/* Tabs */}
      <div className={styles.tabsWrap}>
        <div className={styles.tabs} role="tablist" aria-label="Modos del visualizador">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabActivo === tab.id}
              className={`${styles.tab} ${tabActivo === tab.id ? styles.tabActivo : ''}`}
              onClick={() => setTabActivo(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabPanel} role="tabpanel">
          {tabActivo === 'vectores' && <TabVectores />}
          {tabActivo === 'transformaciones' && <TabTransformaciones />}
          {tabActivo === 'determinante' && <TabDeterminante />}
          {tabActivo === 'eigenvalores' && <TabEigenvalores />}
        </div>
      </div>

      <EducationalSection
        title="¿Qué es el álgebra lineal y por qué importa?"
        subtitle="La matemática de las transformaciones del espacio, el fundamento de la IA y los gráficos 3D"
      >
        <h3>¿Qué estudia el álgebra lineal?</h3>
        <p>
          El álgebra lineal es la rama de las matemáticas que estudia los <strong>vectores</strong>,
          los <strong>espacios vectoriales</strong> y las <strong>transformaciones lineales</strong>.
          A diferencia del cálculo —que estudia el cambio infinitesimal— el álgebra lineal estudia
          relaciones que escalan, rotan y proyectan el espacio de manera predecible y elegante.
        </p>
        <p>
          Está en todas partes: los gráficos de videojuegos, la compresión de imágenes, el reconocimiento
          facial, los modelos de lenguaje y la mecánica cuántica son imposibles sin álgebra lineal.
        </p>

        <h3>Vectores: dirección y magnitud</h3>
        <p>
          Un vector en 2D es simplemente un par de números (x, y) que representa un desplazamiento en
          el plano. Su <strong>módulo</strong> |v| = √(x²+y²) es su longitud, y su <strong>dirección</strong>
          es el ángulo que forma con el eje x. La suma de dos vectores sigue la <em>regla del paralelogramo</em>:
          el vector resultante es la diagonal del paralelogramo que forman los dos vectores.
        </p>
        <p>
          El <strong>producto escalar</strong> u·v = |u||v|cos(θ) captura la «similitud de dirección»
          entre dos vectores. Si es 0, son perpendiculares. Si es positivo, apuntan en la misma dirección.
          Si es negativo, apuntan en sentidos opuestos.
        </p>

        <h3>Matrices como transformaciones del espacio</h3>
        <p>
          Una matriz 2×2 no es solo una tabla de números: es una <strong>transformación del plano</strong>.
          Multiplicar un vector por una matriz equivale a aplicarle esa transformación. Los dos vectores
          columna de la matriz son exactamente a dónde van los vectores base (1,0) y (0,1) después de
          la transformación. Todo lo demás se transforma de forma proporcional.
        </p>
        <p>
          Esta es la idea central de 3Blue1Brown: <em>«piensa en las matrices como
          transformaciones del espacio, no como listas de números»</em>.
        </p>

        <h3>El determinante: interpretación geométrica</h3>
        <p>
          El determinante de una matriz 2×2 mide el <strong>factor de escala del área</strong>
          bajo la transformación. Si |det| = 2, la transformación duplica todas las áreas.
          Si det = 0, la transformación colapsa el plano a una línea (o un punto) y no tiene
          inversa. Si det &lt; 0, la transformación <em>invierte la orientación</em>: izquierda y
          derecha se intercambian, como un espejo.
        </p>
        <p>
          Visualmente, el determinante es exactamente el área del paralelogramo formado por
          los vectores columna de la matriz. Esta geometría hace comprensible por qué det(AB) = det(A)·det(B).
        </p>

        <h3>Eigenvalores y eigenvectores: los ejes invariantes</h3>
        <p>
          Dado una transformación lineal A, un <strong>eigenvector</strong> es un vector que,
          al aplicarle A, solo cambia de escala pero no de dirección: Av = λv. El escalar
          λ es el <strong>eigenvalor</strong> correspondiente, que indica cuánto se estira o comprime ese vector.
        </p>
        <p>
          Los eigenvectores son los «ejes invariantes» de la transformación: el espacio puede
          retorcerse en muchas direcciones, pero los eigenvectores permanecen en su misma línea.
          Para matrices simétricas (como las covarianzas estadísticas), los eigenvectores son
          siempre ortogonales entre sí.
        </p>

        <h3>Aplicaciones del mundo real</h3>
        <ul>
          <li>
            <strong>PCA (Análisis de Componentes Principales):</strong> descompone un conjunto de datos
            en sus eigenvectores principales (las «direcciones de mayor varianza»). Se usa en
            compresión de imágenes, visualización de datos de alta dimensión y reducción del ruido.
          </li>
          <li>
            <strong>Gráficos 3D:</strong> rotaciones, escalas y proyecciones en videojuegos y CAD
            son multiplicaciones de matrices. La GPU aplica miles de millones de estas por segundo.
          </li>
          <li>
            <strong>Google PageRank:</strong> el ranking original de Google era el eigenvector
            principal de una matriz de enlaces entre páginas web.
          </li>
          <li>
            <strong>Compresión de imágenes (SVD):</strong> la descomposición en valores singulares
            generaliza los eigenvalores y permite comprimir imágenes manteniendo solo las «direcciones
            más importantes».
          </li>
          <li>
            <strong>Redes neuronales:</strong> las capas de las redes neuronales son transformaciones
            lineales seguidas de funciones no lineales. Entender el álgebra lineal es esencial para
            comprender la IA moderna.
          </li>
        </ul>

        {/* ── Sección 1: Tabla Comparativa ── */}
        <h3>Conceptos clave de un vistazo</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Objeto matemático</th>
                <th>Operación clave</th>
                <th>Resultado</th>
                <th>Aplicación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Vector</strong></td>
                <td>Flecha con dirección y módulo</td>
                <td>Suma, producto escalar</td>
                <td>Vector, escalar</td>
                <td>Física, gráficos 3D</td>
              </tr>
              <tr>
                <td><strong>Matriz</strong></td>
                <td>Tabla de números</td>
                <td>Multiplicación, transposición</td>
                <td>Transformación lineal</td>
                <td>Redes neuronales, rotaciones</td>
              </tr>
              <tr>
                <td><strong>Determinante</strong></td>
                <td>Escalar de una matriz cuadrada</td>
                <td>det(A) = ad − bc</td>
                <td>Factor de escala de área</td>
                <td>Resolver sistemas lineales</td>
              </tr>
              <tr>
                <td><strong>Eigenvalor/vector</strong></td>
                <td>Par (λ, v) tal que Av = λv</td>
                <td>Polinomio característico</td>
                <td>Ejes invariantes</td>
                <td>PCA, PageRank, cuántica</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Sección 2: Casos de Uso ── */}
        <h3>¿Quién usa el álgebra lineal y cómo?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
              <h3>Ingeniero de IA/ML</h3>
            </div>
            <p>Las matrices de pesos en redes neuronales son transformaciones lineales. El entrenamiento mediante backpropagation usa multiplicación matricial en cada capa.</p>
            <p className={styles.escenarioTip}>Cada «capa densa» en PyTorch o TensorFlow es literalmente una multiplicación de matrices seguida de una función no lineal.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <h3>Desarrollador de Videojuegos</h3>
            </div>
            <p>Rotaciones, escalas y proyecciones en 3D son matrices. La GPU aplica millones de transformaciones matriciales por segundo para renderizar cada fotograma.</p>
            <p className={styles.escenarioTip}>La matriz de perspectiva que convierte el espacio 3D en la pantalla 2D es una de las transformaciones más importantes del motor gráfico.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
              <h3>Científico de Datos</h3>
            </div>
            <p>PCA (Análisis de Componentes Principales) usa eigenvalores para encontrar las direcciones de mayor varianza y reducir dimensiones preservando la información relevante.</p>
            <p className={styles.escenarioTip}>Con eigenvalores puedes comprimir un dataset de 1000 variables a 10 componentes que explican el 95% de la varianza.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧑‍🔬</span>
              <h3>Físico Cuántico</h3>
            </div>
            <p>Los estados cuánticos son vectores en espacio de Hilbert. Los observables físicos (posición, momento, energía) son matrices simétricas llamadas operadores hermitianos.</p>
            <p className={styles.escenarioTip}>El principio de incertidumbre de Heisenberg se expresa directamente en términos de conmutadores matriciales: AB − BA ≠ 0.</p>
          </div>
        </div>

        {/* ── Sección 3: FAQ ── */}
        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cuál es la diferencia entre el álgebra lineal y el álgebra de bachillerato?</h4>
            <p>El álgebra de bachillerato trabaja con escalares (números) y ecuaciones de una variable. El álgebra lineal trabaja con vectores y matrices: objetos que viven en espacios de múltiples dimensiones. Las «ecuaciones» son transformaciones que mueven el espacio completo, no solo un punto en una recta.</p>
            <p className={styles.faqTip}>Ejemplo: resolver ax = b en bachillerato. En álgebra lineal: Ax = b, donde A es una matriz y x un vector — la solución existe si det(A) ≠ 0.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué significa que una transformación lineal «preserva la estructura»?</h4>
            <p>Una transformación T es lineal si: T(u + v) = T(u) + T(v) y T(αv) = αT(v). En términos geométricos: el origen no se mueve, las líneas rectas siguen siendo rectas, y las líneas paralelas siguen paralelas. La escala y la proporción se preservan.</p>
            <p className={styles.faqTip}>Lo que NO puede hacer una transformación lineal: curvar líneas, desplazar el origen, o crear nuevas intersecciones.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué el determinante mide el área?</h4>
            <p>El determinante de una matriz 2×2 da el área del paralelogramo formado por sus vectores columna. Cuando aplicas la transformación, todas las áreas del plano se multiplican por |det(A)|. Si det = 2, todo se duplica. Si det = 0, todo se colapsa a una línea (área cero).</p>
            <p className={styles.faqTip}>En 3D, el determinante mide el volumen del paralelepípedo formado por las tres columnas.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo tiene una matriz eigenvalores complejos?</h4>
            <p>Cuando el discriminante del polinomio característico es negativo: (traza/2)² - det &lt; 0. Las matrices de rotación pura (sin reflexión ni escala) siempre tienen eigenvalores complejos, porque no hay ninguna dirección real que «solo se estire». En el visualizador solo mostramos matrices simétricas, que garantizan eigenvalores reales.</p>
            <p className={styles.faqTip}>Los eigenvalores complejos aparecen en sistemas de oscilación y control — representan rotaciones en el espacio de estados del sistema.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el rango de una matriz y cuándo importa?</h4>
            <p>El rango es el número de columnas (o filas) linealmente independientes — la «dimensión real» de la imagen de la transformación. Si la matriz 3×3 tiene rango 2, colapsa el espacio 3D a un plano 2D. Rango máximo = la matriz es invertible. Rango menor = información perdida.</p>
            <p className={styles.faqTip}>En aprendizaje automático, el rango de la matriz de datos determina cuántas dimensiones independientes tiene realmente tu dataset.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se usa el álgebra lineal en redes neuronales?</h4>
            <p>Cada capa de una red neuronal aplica una transformación lineal (multiplicación de matrices W·x + b) seguida de una función de activación no lineal. El entrenamiento calcula gradientes mediante multiplicaciones matriciales encadenadas (backpropagation). Sin álgebra lineal eficiente no existiría la IA moderna.</p>
            <p className={styles.faqTip}>GPT-4 aplica matrices de millones de parámetros para generar cada token. La atención (attention) en transformers es esencialmente un producto de matrices sobre vectores de «query», «key» y «value».</p>
          </div>
        </div>

        {/* ── Sección 4: Guía Paso a Paso ── */}
        <h3>Guía: cómo entender una transformación lineal en 5 pasos</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Visualiza los vectores base</h4>
              <p>Identifica (1,0) y (0,1) — los vectores canónicos. Toda transformación queda completamente definida por dónde van estos dos vectores. El resto del espacio se mueve de forma proporcional.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Lee la matriz columna a columna</h4>
              <p>La primera columna [a, c] es el destino de (1,0). La segunda columna [b, d] es el destino de (0,1). No necesitas más para entender completamente la transformación.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Calcula el determinante</h4>
              <p>det = ad − bc. Indica el factor de escala de área. Si es negativo, la orientación se invierte. Si es cero, la transformación colapsa el espacio y no es invertible.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Busca los eigenvectores</h4>
              <p>Resuelve det(A − λI) = 0 para obtener los eigenvalores λ. Luego sustituye cada λ en (A − λI)v = 0 para hallar los eigenvectores. Son las direcciones que la transformación solo estira, sin rotar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Aplica a datos reales</h4>
              <p>Multiplica cualquier vector por la matriz para ver dónde «aterriza». En el visualizador, mueve los sliders y observa en tiempo real cómo la cuadrícula se transforma — eso es álgebra lineal en acción.</p>
            </div>
          </div>
        </div>

        {/* ── Sección 5: Mejores Prácticas ── */}
        <h3>Claves para dominar el álgebra lineal</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <h4>Piensa en transformaciones</h4>
            <p>Las matrices son funciones del espacio, no listas de números. Cada columna es a dónde va un vector base.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <h4>El orden importa</h4>
            <p>La composición A∘B se calcula como AB, pero AB ≠ BA en general. Rotar y luego escalar ≠ escalar y luego rotar.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <h4>Invertibilidad</h4>
            <p>Una matriz es invertible si y solo si su determinante es distinto de cero. Si det = 0, la transformación destruye información.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <h4>Polinomio característico</h4>
            <p>Para encontrar eigenvalores, resuelve det(A − λI) = 0. Para matrices 2×2 es una ecuación cuadrática sencilla.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <h4>Matrices simétricas</h4>
            <p>Si A = Aᵀ, todos sus eigenvalores son reales y los eigenvectores son ortogonales entre sí. Muy conveniente para PCA.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧮</span>
            <h4>det(AB) = det(A)·det(B)</h4>
            <p>El determinante de un producto es el producto de los determinantes. Si A escala ×2 y B escala ×3, AB escala ×6.</p>
          </div>
        </div>

        {/* ── Sección 6: Warning Box ── */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Comunes en Álgebra Lineal</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Pensar que AB = BA:</strong> La multiplicación matricial NO es conmutativa en general. Rotar 90° y luego escalar ≠ escalar y luego rotar.</li>
            <li><strong>❌ Confundir matriz inversa con transpuesta:</strong> A⁻¹ existe solo si det(A) ≠ 0. La transpuesta Aᵀ siempre existe y tiene filas y columnas intercambiadas.</li>
            <li><strong>❌ Buscar eigenvalores de matrices no cuadradas:</strong> Los eigenvalores solo se definen para matrices cuadradas n×n.</li>
            <li><strong>❌ Olvidar que det(AB) = det(A)·det(B):</strong> El determinante de un producto es el producto de los determinantes.</li>
            <li><strong>❌ Interpretar det = 0 como «error»:</strong> Det = 0 significa que la transformación colapsa el espacio (proyecta a menor dimensión). Es perfectamente válido matemáticamente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-algebra-lineal')} />
      <ShareCard appName="visualizador-algebra-lineal" />
      <Footer appName="visualizador-algebra-lineal" />
    </div>
  );
}
