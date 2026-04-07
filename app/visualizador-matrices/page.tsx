'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './Matrices.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'definicion' | 'operaciones' | 'transformaciones' | 'vidareal';

type Matriz2x2 = [[number, number], [number, number]];

const SECCIONES = [
  { id: 'definicion' as Seccion, titulo: '¿Qué es?', icono: '📐', subtitulo: 'Definición y tipos' },
  { id: 'operaciones' as Seccion, titulo: 'Operaciones', icono: '➕', subtitulo: 'Suma, multiplicación, determinante' },
  { id: 'transformaciones' as Seccion, titulo: 'Transformaciones', icono: '🔄', subtitulo: 'Rotación, escala, reflexión' },
  { id: 'vidareal' as Seccion, titulo: 'Vida real', icono: '🌍', subtitulo: 'Dónde se usan las matrices' },
];

const TIPOS_MATRIZ = [
  {
    nombre: 'Identidad',
    desc: 'No cambia nada. Es el "1" de las matrices.',
    datos: [[1, 0], [0, 1]],
    color: '#2E86AB',
  },
  {
    nombre: 'Diagonal',
    desc: 'Solo tiene valores en la diagonal principal.',
    datos: [[3, 0], [0, 5]],
    color: '#48A9A6',
  },
  {
    nombre: 'Simétrica',
    desc: 'Igual que su transpuesta (filas = columnas).',
    datos: [[2, 7], [7, 4]],
    color: '#7FB3D3',
  },
  {
    nombre: 'Nula',
    desc: 'Todo ceros. El "0" de las matrices.',
    datos: [[0, 0], [0, 0]],
    color: '#999999',
  },
];

// Figura base: cuadrado unitario centrado
const FIGURA_BASE: [number, number][] = [
  [1, 1], [1, -1], [-1, -1], [-1, 1],
];

type TransformacionInfo = {
  nombre: string;
  desc: string;
  matriz: Matriz2x2;
  icono: string;
};

const TRANSFORMACIONES: TransformacionInfo[] = [
  { nombre: 'Rotación 90°', desc: 'Gira la figura 90° en sentido antihorario', matriz: [[0, -1], [1, 0]], icono: '↩️' },
  { nombre: 'Rotación 180°', desc: 'Gira la figura media vuelta', matriz: [[-1, 0], [0, -1]], icono: '🔃' },
  { nombre: 'Escala ×2', desc: 'Duplica el tamaño de la figura', matriz: [[2, 0], [0, 2]], icono: '🔍' },
  { nombre: 'Escala ×0,5', desc: 'Reduce la figura a la mitad', matriz: [[0.5, 0], [0.5, 0.5]], icono: '🔎' },
  { nombre: 'Reflexión eje X', desc: 'Refleja respecto al eje horizontal', matriz: [[1, 0], [0, -1]], icono: '↕️' },
  { nombre: 'Reflexión eje Y', desc: 'Refleja respecto al eje vertical', matriz: [[-1, 0], [0, 1]], icono: '↔️' },
  { nombre: 'Cizalladura', desc: 'Deforma la figura en horizontal', matriz: [[1, 1], [0, 1]], icono: '📐' },
];

const APPS_REALES = [
  { icono: '🎮', titulo: 'Videojuegos', desc: 'Rotar, mover y escalar personajes y objetos 3D. Cada frame se calcula con matrices.' },
  { icono: '🔍', titulo: 'Google PageRank', desc: 'Internet como una enorme matriz de enlaces. Google la multiplica millones de veces para encontrar las páginas más relevantes.' },
  { icono: '🖼️', titulo: 'Compresión JPEG', desc: 'Las imágenes se comprimen con la DCT (Transformada Discreta del Coseno), que es una multiplicación de matrices.' },
  { icono: '🤖', titulo: 'Inteligencia Artificial', desc: 'Las redes neuronales son cadenas de multiplicaciones de matrices. Entrenar un modelo = ajustar millones de valores en matrices.' },
  { icono: '📡', titulo: 'GPS', desc: 'Triangular tu posición requiere resolver un sistema de ecuaciones — que internamente es una operación con matrices.' },
  { icono: '📊', titulo: 'Economía (Leontief)', desc: 'El modelo input-output de Leontief usa matrices para predecir cómo un cambio en un sector afecta a toda la economía.' },
];

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

function multiplicarMatrizPunto(m: Matriz2x2, punto: [number, number]): [number, number] {
  return [
    m[0][0] * punto[0] + m[0][1] * punto[1],
    m[1][0] * punto[0] + m[1][1] * punto[1],
  ];
}

function transformarFigura(figura: [number, number][], m: Matriz2x2): [number, number][] {
  return figura.map(p => multiplicarMatrizPunto(m, p));
}

// Coordenadas SVG: escala de la unidad matemática a píxeles
const SVG_SIZE = 300;
const SVG_ESCALA = 50; // 1 unidad = 50px
const SVG_CENTRO = SVG_SIZE / 2;

function mathToSvg(x: number, y: number): [number, number] {
  return [SVG_CENTRO + x * SVG_ESCALA, SVG_CENTRO - y * SVG_ESCALA];
}

function figuraAPolygonPoints(figura: [number, number][]): string {
  return figura.map(([x, y]) => {
    const [sx, sy] = mathToSvg(x, y);
    return `${sx},${sy}`;
  }).join(' ');
}

// ─────────────────────────────────────────────
// Sección 1: Definición
// ─────────────────────────────────────────────

function SeccionDefinicion() {
  const [tipoActivo, setTipoActivo] = useState(0);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Una matriz es <strong>una tabla rectangular de números</strong> organizada en filas y columnas. Piensa en ella como <strong>una hoja de cálculo con superpoderes</strong>: puede transformar coordenadas, resolver sistemas de ecuaciones y codificar relaciones complejas.</p>
      </div>

      <div className={styles.matrizEjemplo}>
        <div className={styles.matrizDemo}>
          <div className={styles.matrizLabel}>Matriz 2×2</div>
          <div className={styles.matrizGrid}>
            <span className={styles.celda} style={{ background: 'rgba(46,134,171,0.15)' }}>3</span>
            <span className={styles.celda} style={{ background: 'rgba(46,134,171,0.1)' }}>7</span>
            <span className={styles.celda} style={{ background: 'rgba(72,169,166,0.1)' }}>1</span>
            <span className={styles.celda} style={{ background: 'rgba(72,169,166,0.15)' }}>4</span>
          </div>
          <div className={styles.matrizAnotacion}>
            <span>← 2 filas</span>
            <span>↑ 2 columnas</span>
          </div>
        </div>
        <div className={styles.matrizDemo}>
          <div className={styles.matrizLabel}>Matriz 3×3</div>
          <div className={styles.matrizGrid3}>
            <span className={styles.celda}>1</span>
            <span className={styles.celda}>0</span>
            <span className={styles.celda}>2</span>
            <span className={styles.celda}>0</span>
            <span className={styles.celda}>5</span>
            <span className={styles.celda}>0</span>
            <span className={styles.celda}>3</span>
            <span className={styles.celda}>0</span>
            <span className={styles.celda}>1</span>
          </div>
        </div>
      </div>

      <h3 className={styles.subSeccionTitulo}>Tipos de matrices</h3>
      <div className={styles.tiposGrid}>
        {TIPOS_MATRIZ.map((tipo, idx) => (
          <button
            key={tipo.nombre}
            type="button"
            className={`${styles.tipoBtn} ${tipoActivo === idx ? styles.tipoBtnActivo : ''}`}
            onClick={() => setTipoActivo(idx)}
            aria-pressed={tipoActivo === idx}
            style={{ '--tipo-color': tipo.color } as React.CSSProperties}
          >
            <span className={styles.tipoNombre}>{tipo.nombre}</span>
          </button>
        ))}
      </div>

      <div className={styles.tipoDetalle}>
        <div className={styles.matrizGridPeq}>
          {TIPOS_MATRIZ[tipoActivo].datos.flat().map((val, i) => (
            <span
              key={i}
              className={styles.celdaPeq}
              style={{ color: TIPOS_MATRIZ[tipoActivo].color, fontWeight: val !== 0 ? 700 : 400 }}
            >
              {val}
            </span>
          ))}
        </div>
        <p className={styles.tipoDesc}>{TIPOS_MATRIZ[tipoActivo].desc}</p>
      </div>

      <div className={styles.insight}>
        <p>La <strong>dimensión</strong> de una matriz se escribe filas × columnas. Una matriz 2×3 tiene 2 filas y 3 columnas (6 valores en total). Las matrices cuadradas (n×n) son las más importantes: tienen determinante, pueden ser inversibles y representan transformaciones.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Operaciones
// ─────────────────────────────────────────────

type OperacionTab = 'suma' | 'multi' | 'det' | 'trans';

function SeccionOperaciones() {
  const [opActiva, setOpActiva] = useState<OperacionTab>('suma');

  return (
    <div className={styles.seccionContent}>
      <div className={styles.opNav}>
        {([
          { id: 'suma' as OperacionTab, label: 'Suma' },
          { id: 'multi' as OperacionTab, label: 'Multiplicación' },
          { id: 'det' as OperacionTab, label: 'Determinante' },
          { id: 'trans' as OperacionTab, label: 'Transpuesta' },
        ]).map(op => (
          <button
            key={op.id}
            type="button"
            className={`${styles.opBtn} ${opActiva === op.id ? styles.opBtnActivo : ''}`}
            onClick={() => setOpActiva(op.id)}
            aria-pressed={opActiva === op.id}
          >
            {op.label}
          </button>
        ))}
      </div>

      {opActiva === 'suma' && <OperacionSuma />}
      {opActiva === 'multi' && <OperacionMultiplicacion />}
      {opActiva === 'det' && <OperacionDeterminante />}
      {opActiva === 'trans' && <OperacionTranspuesta />}
    </div>
  );
}

function OperacionSuma() {
  const A = [[1, 3], [2, 0]];
  const B = [[4, 1], [0, 5]];
  const R = A.map((fila, i) => fila.map((v, j) => v + B[i][j]));

  return (
    <div className={styles.operacionContenido}>
      <div className={styles.contexto}>
        <p>Sumar matrices es <strong>sumar celda a celda</strong>. Ambas matrices deben tener la misma dimensión.</p>
      </div>
      <div className={styles.operacionVisual}>
        <div className={styles.matrizOp}>
          {A.flat().map((v, i) => (
            <span key={i} className={styles.celdaOp} style={{ background: 'rgba(46,134,171,0.12)' }}>{v}</span>
          ))}
        </div>
        <span className={styles.operador}>+</span>
        <div className={styles.matrizOp}>
          {B.flat().map((v, i) => (
            <span key={i} className={styles.celdaOp} style={{ background: 'rgba(72,169,166,0.12)' }}>{v}</span>
          ))}
        </div>
        <span className={styles.operador}>=</span>
        <div className={styles.matrizOp}>
          {R.flat().map((v, i) => (
            <span key={i} className={styles.celdaOp} style={{ background: 'rgba(46,134,171,0.2)', fontWeight: 700 }}>{v}</span>
          ))}
        </div>
      </div>
      <div className={styles.pasoAPaso}>
        <span className={styles.paso}><span style={{ color: '#2E86AB' }}>1</span>+<span style={{ color: '#48A9A6' }}>4</span>=<strong>5</strong></span>
        <span className={styles.paso}><span style={{ color: '#2E86AB' }}>3</span>+<span style={{ color: '#48A9A6' }}>1</span>=<strong>4</strong></span>
        <span className={styles.paso}><span style={{ color: '#2E86AB' }}>2</span>+<span style={{ color: '#48A9A6' }}>0</span>=<strong>2</strong></span>
        <span className={styles.paso}><span style={{ color: '#2E86AB' }}>0</span>+<span style={{ color: '#48A9A6' }}>5</span>=<strong>5</strong></span>
      </div>
      <div className={styles.insight}>
        <p>La suma de matrices es <strong>conmutativa</strong> (A + B = B + A) y <strong>asociativa</strong>. Igual que sumar números, pero con tablas enteras.</p>
      </div>
    </div>
  );
}

function OperacionMultiplicacion() {
  // A(2x2) * B(2x2)
  const A = [[2, 1], [0, 3]];
  const B = [[1, 4], [2, 0]];
  // R[i][j] = sum(A[i][k] * B[k][j])
  const R = [
    [A[0][0]*B[0][0]+A[0][1]*B[1][0], A[0][0]*B[0][1]+A[0][1]*B[1][1]],
    [A[1][0]*B[0][0]+A[1][1]*B[1][0], A[1][0]*B[0][1]+A[1][1]*B[1][1]],
  ];

  const [pasoActivo, setPasoActivo] = useState(0);
  const pasos = [
    { fila: 0, col: 0, calc: `${A[0][0]}×${B[0][0]} + ${A[0][1]}×${B[1][0]}`, resultado: R[0][0] },
    { fila: 0, col: 1, calc: `${A[0][0]}×${B[0][1]} + ${A[0][1]}×${B[1][1]}`, resultado: R[0][1] },
    { fila: 1, col: 0, calc: `${A[1][0]}×${B[0][0]} + ${A[1][1]}×${B[1][0]}`, resultado: R[1][0] },
    { fila: 1, col: 1, calc: `${A[1][0]}×${B[0][1]} + ${A[1][1]}×${B[1][1]}`, resultado: R[1][1] },
  ];

  return (
    <div className={styles.operacionContenido}>
      <div className={styles.contexto}>
        <p>Multiplicar matrices <strong>NO es celda a celda</strong>. Cada resultado es el producto escalar de una <strong>fila</strong> de A por una <strong>columna</strong> de B.</p>
      </div>
      <div className={styles.operacionVisual}>
        <div className={styles.matrizOp}>
          {A.flat().map((v, i) => {
            const fila = Math.floor(i / 2);
            const resaltado = fila === pasos[pasoActivo].fila;
            return <span key={i} className={styles.celdaOp} style={{ background: resaltado ? 'rgba(46,134,171,0.25)' : 'rgba(46,134,171,0.08)' }}>{v}</span>;
          })}
        </div>
        <span className={styles.operador}>×</span>
        <div className={styles.matrizOp}>
          {B.flat().map((v, i) => {
            const col = i % 2;
            const resaltado = col === pasos[pasoActivo].col;
            return <span key={i} className={styles.celdaOp} style={{ background: resaltado ? 'rgba(72,169,166,0.25)' : 'rgba(72,169,166,0.08)' }}>{v}</span>;
          })}
        </div>
        <span className={styles.operador}>=</span>
        <div className={styles.matrizOp}>
          {R.flat().map((v, i) => {
            const fila = Math.floor(i / 2);
            const col = i % 2;
            const esActivo = fila === pasos[pasoActivo].fila && col === pasos[pasoActivo].col;
            return <span key={i} className={styles.celdaOp} style={{ background: esActivo ? 'rgba(46,134,171,0.35)' : 'rgba(46,134,171,0.05)', fontWeight: esActivo ? 700 : 400 }}>{v}</span>;
          })}
        </div>
      </div>

      <div className={styles.pasoMulti}>
        <div className={styles.pasoCalc}>
          <span className={styles.pasoLabel}>Paso {pasoActivo + 1}/4:</span>
          <span className={styles.pasoFormula}>fila {pasos[pasoActivo].fila + 1} × col {pasos[pasoActivo].col + 1} → {pasos[pasoActivo].calc} = <strong>{pasos[pasoActivo].resultado}</strong></span>
        </div>
        <div className={styles.botonesSimulacion}>
          {pasos.map((_, i) => (
            <button key={i} type="button" className={`${styles.btnPaso} ${pasoActivo === i ? styles.btnPasoActivo : ''}`} onClick={() => setPasoActivo(i)}>
              Paso {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>La multiplicación de matrices <strong>NO es conmutativa</strong>: A × B ≠ B × A en general. El orden importa. Solo se pueden multiplicar si las columnas de A = filas de B.</p>
      </div>
    </div>
  );
}

function OperacionDeterminante() {
  const a = 5, b = 3, c = 2, d = 4;
  const det = a * d - b * c;

  return (
    <div className={styles.operacionContenido}>
      <div className={styles.contexto}>
        <p>El <strong>determinante</strong> de una matriz 2×2 es un número que indica si la matriz es inversible y cuánto &quot;estira&quot; el espacio.</p>
      </div>
      <div className={styles.determinanteVisual}>
        <div className={styles.detMatriz}>
          <span className={styles.celdaDet} style={{ color: '#2E86AB' }}>{a}</span>
          <span className={styles.celdaDet} style={{ color: '#e67e22' }}>{b}</span>
          <span className={styles.celdaDet} style={{ color: '#e67e22' }}>{c}</span>
          <span className={styles.celdaDet} style={{ color: '#2E86AB' }}>{d}</span>
        </div>
        <div className={styles.detFormula}>
          <div className={styles.detLinea}>
            <span style={{ color: '#2E86AB' }}>{a}</span> × <span style={{ color: '#2E86AB' }}>{d}</span> − <span style={{ color: '#e67e22' }}>{b}</span> × <span style={{ color: '#e67e22' }}>{c}</span>
          </div>
          <div className={styles.detLinea}>
            <span style={{ color: '#2E86AB' }}>{a * d}</span> − <span style={{ color: '#e67e22' }}>{b * c}</span> = <strong>{det}</strong>
          </div>
        </div>
      </div>
      <div className={styles.detExplicacion}>
        <div className={styles.detRegla}>
          <span className={styles.detReglaTitulo}>det = 0</span>
          <span className={styles.detReglaTexto}>La matriz aplasta el espacio a una línea. No es inversible.</span>
        </div>
        <div className={styles.detRegla}>
          <span className={styles.detReglaTitulo}>det &gt; 0</span>
          <span className={styles.detReglaTexto}>Conserva la orientación. El espacio se estira |det| veces.</span>
        </div>
        <div className={styles.detRegla}>
          <span className={styles.detReglaTitulo}>det &lt; 0</span>
          <span className={styles.detReglaTexto}>Invierte la orientación (como un espejo) y estira |det| veces.</span>
        </div>
      </div>
      <div className={styles.insight}>
        <p>Fórmula rápida: <strong>ad − bc</strong>. Si el determinante es {formatNumber(det, 0)}, la transformación multiplica el área por {formatNumber(det, 0)}. Si fuera 0, la matriz &quot;aplasta&quot; todo a una línea — pierde información y no se puede deshacer.</p>
      </div>
    </div>
  );
}

function OperacionTranspuesta() {
  const original = [[1, 4, 7], [2, 5, 8]];
  const transpuesta = [[1, 2], [4, 5], [7, 8]];

  return (
    <div className={styles.operacionContenido}>
      <div className={styles.contexto}>
        <p>La <strong>transpuesta</strong> de una matriz intercambia filas por columnas. La fila 1 se convierte en columna 1, la fila 2 en columna 2, etc.</p>
      </div>
      <div className={styles.transVisual}>
        <div>
          <div className={styles.matrizLabel}>Original (2×3)</div>
          <div className={styles.matrizTrans2x3}>
            {original.flat().map((v, i) => (
              <span key={i} className={styles.celdaTrans}>{v}</span>
            ))}
          </div>
        </div>
        <span className={styles.flechaTrans} aria-hidden="true">→</span>
        <div>
          <div className={styles.matrizLabel}>Transpuesta (3×2)</div>
          <div className={styles.matrizTrans3x2}>
            {transpuesta.flat().map((v, i) => (
              <span key={i} className={styles.celdaTrans}>{v}</span>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.transDestaque}>
        <p><strong>Fila 1</strong> [1, 4, 7] → <strong>Columna 1</strong> [1, 4, 7]</p>
        <p><strong>Fila 2</strong> [2, 5, 8] → <strong>Columna 2</strong> [2, 5, 8]</p>
      </div>
      <div className={styles.insight}>
        <p>Si transpones dos veces, vuelves a la original: (A<sup>T</sup>)<sup>T</sup> = A. Una matriz que es igual a su transpuesta se llama <strong>simétrica</strong> — son muy importantes en física e ingeniería.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Transformaciones 2D
// ─────────────────────────────────────────────

function SeccionTransformaciones() {
  const [transIdx, setTransIdx] = useState<number | null>(null);

  const figuraTransformada = useMemo(() => {
    if (transIdx === null) return FIGURA_BASE;
    return transformarFigura(FIGURA_BASE, TRANSFORMACIONES[transIdx].matriz);
  }, [transIdx]);

  const matrizActiva = transIdx !== null ? TRANSFORMACIONES[transIdx].matriz : [[1, 0], [0, 1]] as Matriz2x2;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las matrices 2×2 pueden <strong>transformar figuras</strong> en el plano. Selecciona una transformación para ver cómo el cuadrado cambia — y qué matriz lo produce.</p>
      </div>

      <div className={styles.transLayout}>
        <div className={styles.planoWrapper}>
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className={styles.planoCartesiano} aria-label="Plano cartesiano con figura transformable">
            {/* Cuadrícula */}
            {[-2, -1, 1, 2].map(n => (
              <g key={n}>
                <line x1={mathToSvg(n, -3)[0]} y1={mathToSvg(n, -3)[1]} x2={mathToSvg(n, 3)[0]} y2={mathToSvg(n, 3)[1]} stroke="#e0e0e0" strokeWidth="0.5" />
                <line y1={mathToSvg(-3, n)[1]} x1={mathToSvg(-3, n)[0]} y2={mathToSvg(3, n)[1]} x2={mathToSvg(3, n)[0]} stroke="#e0e0e0" strokeWidth="0.5" />
              </g>
            ))}
            {/* Ejes */}
            <line x1={SVG_CENTRO} y1="0" x2={SVG_CENTRO} y2={SVG_SIZE} stroke="#666" strokeWidth="1.5" />
            <line y1={SVG_CENTRO} x1="0" y2={SVG_CENTRO} x2={SVG_SIZE} stroke="#666" strokeWidth="1.5" />
            {/* Etiquetas ejes */}
            <text x={SVG_SIZE - 12} y={SVG_CENTRO - 8} fontSize="11" fill="#666" textAnchor="end">x</text>
            <text x={SVG_CENTRO + 8} y="14" fontSize="11" fill="#666">y</text>
            {/* Figura original (fantasma) */}
            {transIdx !== null && (
              <polygon
                points={figuraAPolygonPoints(FIGURA_BASE)}
                fill="rgba(46,134,171,0.08)"
                stroke="#2E86AB"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
            )}
            {/* Figura transformada */}
            <polygon
              points={figuraAPolygonPoints(figuraTransformada)}
              fill="rgba(72,169,166,0.25)"
              stroke="#48A9A6"
              strokeWidth="2"
              className={styles.figuraAnimada}
            />
            {/* Vértices */}
            {figuraTransformada.map(([x, y], i) => {
              const [sx, sy] = mathToSvg(x, y);
              return <circle key={i} cx={sx} cy={sy} r="4" fill="#48A9A6" />;
            })}
          </svg>
        </div>

        <div className={styles.transControles}>
          <div className={styles.matrizActiva}>
            <div className={styles.matrizLabel}>Matriz aplicada</div>
            <div className={styles.matrizGridPeq}>
              <span className={styles.celdaPeq}>{matrizActiva[0][0]}</span>
              <span className={styles.celdaPeq}>{matrizActiva[0][1]}</span>
              <span className={styles.celdaPeq}>{matrizActiva[1][0]}</span>
              <span className={styles.celdaPeq}>{matrizActiva[1][1]}</span>
            </div>
          </div>

          <div className={styles.transBotones}>
            <button
              type="button"
              className={`${styles.transBtn} ${transIdx === null ? styles.transBtnActivo : ''}`}
              onClick={() => setTransIdx(null)}
              aria-pressed={transIdx === null}
            >
              <span aria-hidden="true">⬜</span> Original
            </button>
            {TRANSFORMACIONES.map((t, idx) => (
              <button
                key={t.nombre}
                type="button"
                className={`${styles.transBtn} ${transIdx === idx ? styles.transBtnActivo : ''}`}
                onClick={() => setTransIdx(idx)}
                aria-pressed={transIdx === idx}
              >
                <span aria-hidden="true">{t.icono}</span> {t.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {transIdx !== null && (
        <div className={styles.transDesc}>
          <strong>{TRANSFORMACIONES[transIdx].nombre}:</strong> {TRANSFORMACIONES[transIdx].desc}
        </div>
      )}

      <div className={styles.insight}>
        <p>Cada transformación geométrica tiene una <strong>matriz única</strong> asociada. Combinar transformaciones = multiplicar sus matrices. Por eso la multiplicación de matrices no es conmutativa: rotar y luego escalar ≠ escalar y luego rotar.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Vida real
// ─────────────────────────────────────────────

function SeccionVidaReal() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las matrices no son solo teoría — están en <strong>todo lo que usas</strong>. Cada vez que juegas un videojuego, buscas en Google o usas GPS, hay matrices trabajando a toda velocidad.</p>
      </div>

      <div className={styles.appsGrid}>
        {APPS_REALES.map(app => (
          <div key={app.titulo} className={styles.appCard}>
            <span className={styles.appIcono} aria-hidden="true">{app.icono}</span>
            <h4 className={styles.appTitulo}>{app.titulo}</h4>
            <p className={styles.appDesc}>{app.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.datoCurioso}>
        <h4>Datos curiosos</h4>
        <ul>
          <li>Una imagen 4K es una <strong>matriz de 3.840 × 2.160</strong> píxeles — más de 8 millones de valores.</li>
          <li>GPT-4 tiene miles de millones de parámetros organizados en matrices. Entrenar el modelo es ajustar esos valores.</li>
          <li>Netflix usa <strong>factorización de matrices</strong> para recomendarte películas: descompone tu historial en patrones.</li>
          <li>Los gráficos de tu móvil procesan <strong>millones de multiplicaciones de matrices por segundo</strong> (GPU).</li>
        </ul>
      </div>

      <div className={styles.insight}>
        <p>Las matrices son el <strong>lenguaje universal de las transformaciones</strong>. Si algo se mueve, se escala, se comprime o se predice computacionalmente, hay una matriz involucrada. Por eso el álgebra lineal es la asignatura más importante de cualquier carrera técnica.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMatricesPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('definicion');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'definicion': return <SeccionDefinicion />;
      case 'operaciones': return <SeccionOperaciones />;
      case 'transformaciones': return <SeccionTransformaciones />;
      case 'vidareal': return <SeccionVidaReal />;
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.title}>Matrices: El Lenguaje Secreto de las Transformaciones</h1>
          <p className={styles.subtitle}>Una tabla con superpoderes — descubre cómo las matrices mueven, giran y escalan el mundo</p>
        </header>
        <LegalNotice />

        <nav className={styles.navSecciones} aria-label="Secciones">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSub}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection title="Matrices: más allá de lo visual" subtitle="Por qué importa entender álgebra lineal" defaultOpen={false}>
          <h3>Matrices e inteligencia artificial</h3>
          <p>Toda red neuronal es una secuencia de multiplicaciones de matrices seguidas de funciones de activación. El &quot;aprendizaje&quot; de una IA es literalmente ajustar los valores dentro de enormes matrices. El auge de las GPU en IA se debe precisamente a que son extraordinariamente rápidas multiplicando matrices en paralelo.</p>
          <h3>Matrices en ingeniería</h3>
          <p>Los ingenieros usan matrices para resolver sistemas de ecuaciones con miles de variables: tensiones en un puente, flujo de calor en un motor, vibraciones en un avión. El método de elementos finitos (FEM) se basa enteramente en operaciones con matrices.</p>
          <h3>La revolución de los gráficos 3D</h3>
          <p>Cada objeto 3D que ves en un videojuego se transforma con matrices 4×4 (traslación + rotación + escala). Tu GPU ejecuta miles de millones de estas multiplicaciones por segundo para renderizar cada frame a 60 FPS.</p>
          <div className={styles.warningBox}><strong>Nota:</strong> las transformaciones de esta herramienta son 2D con matrices 2×2. En la práctica, las transformaciones 3D usan matrices 4×4 (coordenadas homogéneas) y las de IA pueden tener millones de filas y columnas.</div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-matrices')} />
        <ShareCard appName="visualizador-matrices" />
        <Footer appName="visualizador-matrices" />
      </div>
    </>
  );
}
