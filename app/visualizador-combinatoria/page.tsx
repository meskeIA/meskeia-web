'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './Combinatoria.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ======== TIPOS ========
type TabId = 'permcomb' | 'pascal' | 'principio';
type PascalPattern = 'binomial' | 'fibonacci' | 'potencias2' | 'triangulares' | 'sierpinski';

interface TreeNode {
  value: number;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
  selected: boolean;
  level: number;
}

interface PascalCell {
  row: number;
  col: number;
  value: number;
}

interface MultiplyStep {
  label: string;
  options: number;
}

// ======== MATEMÁTICAS ========
function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function permutations(n: number, k: number): number {
  if (k > n) return 0;
  return factorial(n) / factorial(n - k);
}

function combinations(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

function buildPascalRow(row: number): number[] {
  const result: number[] = [];
  for (let col = 0; col <= row; col++) {
    result.push(combinations(row, col));
  }
  return result;
}

function buildPascalTriangle(rows: number): PascalCell[][] {
  const triangle: PascalCell[][] = [];
  for (let r = 0; r <= rows; r++) {
    const rowData: PascalCell[] = [];
    for (let c = 0; c <= r; c++) {
      rowData.push({ row: r, col: c, value: combinations(r, c) });
    }
    triangle.push(rowData);
  }
  return triangle;
}

// ======== COLORES DE PATRONES PASCAL ========
function getPascalCellColor(cell: PascalCell, pattern: PascalPattern, maxRows: number): string {
  const { row, col, value } = cell;
  switch (pattern) {
    case 'binomial':
      return 'var(--primary)';
    case 'fibonacci': {
      // Diagonales ascendentes: 1,1,2,3,5,8,13...
      // Diagonal d = row - col
      const d = row - col;
      const fibIndexes = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78];
      const flat = row * (row + 1) / 2 + col;
      if (fibIndexes.includes(flat) && d >= 0 && col === 0) return '#F59E0B';
      // resaltar columna 0 y diagonales
      if (col === 0) return '#F59E0B';
      if (row - col === col - 1) return '#F59E0B';
      return 'var(--primary)';
    }
    case 'potencias2':
      // Suma de cada fila = 2^row; resaltar toda la fila con intensidad
      return `hsl(${160 + row * 8}, 70%, ${55 - row * 2}%)`;
    case 'triangulares': {
      // Columna k=2: 1,3,6,10,15... son números triangulares
      if (col === 2) return '#10B981';
      return 'var(--primary)';
    }
    case 'sierpinski': {
      // Números impares: resaltar
      if (value % 2 !== 0) return '#7C3AED';
      return '#E5E7EB';
    }
    default:
      return 'var(--primary)';
  }
}

// ======== ÁRBOL DE PERMUTACIONES SVG ========
function buildPermTree(n: number, k: number): TreeNode[] {
  if (n > 5 || k === 0) return [];
  const nodes: TreeNode[] = [];
  const svgWidth = 360;
  const svgHeight = 200;
  const levelHeight = svgHeight / (k + 1);

  // Nodo raíz
  nodes.push({ value: -1, x: svgWidth / 2, y: 20, selected: false, level: -1 });

  // Generar hasta k niveles con hasta n ramas
  function buildLevel(parentX: number, parentY: number, level: number, count: number) {
    if (level >= k) return;
    const startX = parentX - (count * 30) / 2;
    for (let i = 0; i < Math.min(count, n); i++) {
      const x = startX + i * 30 + 15;
      const y = parentY + levelHeight;
      nodes.push({
        value: i + 1,
        x,
        y,
        parentX,
        parentY,
        selected: i < k,
        level,
      });
      if (level + 1 < k) {
        buildLevel(x, y, level + 1, Math.min(count - 1, n - 1));
      }
    }
  }

  if (n <= 4) {
    buildLevel(svgWidth / 2, 20, 0, n);
  }

  return nodes;
}

// ======== BINOMIO DE NEWTON ========
interface NewtonTerm {
  k: number;
  coef: number;
  aPow: number;
  bPow: number;
  value: number;
}

function expandBinomial(a: number, b: number, nPow: number): NewtonTerm[] {
  const terms: NewtonTerm[] = [];
  for (let k = 0; k <= nPow; k++) {
    const coef = combinations(nPow, k);
    const aPow = nPow - k;
    const bPow = k;
    const value = coef * Math.pow(a, aPow) * Math.pow(b, bPow);
    terms.push({ k, coef, aPow, bPow, value });
  }
  return terms;
}

function formatTerm(term: NewtonTerm, a: number, b: number): string {
  const { coef, aPow, bPow, value } = term;
  const parts: string[] = [];
  if (coef !== 1 || (aPow === 0 && bPow === 0)) parts.push(String(coef));
  if (aPow > 0) parts.push(aPow === 1 ? `${a}` : `${a}^${aPow}`);
  if (bPow > 0) parts.push(bPow === 1 ? `${b}` : `${b}^${bPow}`);
  const label = parts.join('·') || String(coef);
  return `${label} = ${value}`;
}

// ======== COMPONENTE PRINCIPAL ========
export default function VisualizadorCombinatoriaPage() {
  const [activeTab, setActiveTab] = useState<TabId>('permcomb');

  // Tab 1 — Permutaciones y Combinaciones
  const [nVal, setNVal] = useState(4);
  const [kVal, setKVal] = useState(2);

  // Tab 2 — Pascal
  const [pascalRows, setPascalRows] = useState(7);
  const [pascalPattern, setPascalPattern] = useState<PascalPattern>('binomial');
  const [selectedCell, setSelectedCell] = useState<PascalCell | null>(null);

  // Tab 3 — Multiplicación y Newton
  const [multiplySteps, setMultiplySteps] = useState<MultiplyStep[]>([
    { label: 'Paso 1', options: 3 },
    { label: 'Paso 2', options: 2 },
  ]);
  const [newtonA, setNewtonA] = useState(1);
  const [newtonB, setNewtonB] = useState(1);
  const [newtonN, setNewtonN] = useState(3);

  // ======== CÁLCULOS ========
  const pnk = useMemo(() => permutations(nVal, kVal), [nVal, kVal]);
  const cnk = useMemo(() => combinations(nVal, kVal), [nVal, kVal]);
  const treeNodes = useMemo(() => {
    if (nVal <= 5) return buildPermTree(nVal, kVal);
    return [];
  }, [nVal, kVal]);

  const pascalTriangle = useMemo(() => buildPascalTriangle(pascalRows), [pascalRows]);
  const rowSums = useMemo(
    () => pascalTriangle.map(row => row.reduce((s, c) => s + c.value, 0)),
    [pascalTriangle]
  );

  const multiplyTotal = useMemo(
    () => multiplySteps.reduce((acc, s) => acc * Math.max(1, s.options), 1),
    [multiplySteps]
  );
  const newtonTerms = useMemo(
    () => expandBinomial(newtonA, newtonB, newtonN),
    [newtonA, newtonB, newtonN]
  );
  const newtonTotal = useMemo(
    () => newtonTerms.reduce((s, t) => s + t.value, 0),
    [newtonTerms]
  );

  // ======== HANDLERS ========
  const handleNChange = useCallback((v: number) => {
    setNVal(v);
    if (kVal > v) setKVal(v);
  }, [kVal]);

  const addMultiplyStep = useCallback(() => {
    if (multiplySteps.length < 4) {
      setMultiplySteps(prev => [...prev, { label: `Paso ${prev.length + 1}`, options: 2 }]);
    }
  }, [multiplySteps.length]);

  const removeMultiplyStep = useCallback(() => {
    if (multiplySteps.length > 1) {
      setMultiplySteps(prev => prev.slice(0, -1));
    }
  }, [multiplySteps.length]);

  const updateStep = useCallback((idx: number, options: number) => {
    setMultiplySteps(prev => prev.map((s, i) => i === idx ? { ...s, options } : s));
  }, []);

  // ======== SVG PASCAL ========
  const CELL_SIZE = 32;
  const CELL_GAP = 4;
  const pascalSvgWidth = (pascalRows + 1) * (CELL_SIZE + CELL_GAP) + 40;
  const pascalSvgHeight = (pascalRows + 1) * (CELL_SIZE + CELL_GAP) + 20;

  const patternButtons: { id: PascalPattern; label: string }[] = [
    { id: 'binomial', label: 'Coeficientes' },
    { id: 'fibonacci', label: 'Fibonacci' },
    { id: 'potencias2', label: 'Potencias de 2' },
    { id: 'triangulares', label: 'Números triangulares' },
    { id: 'sierpinski', label: 'Sierpinski' },
  ];

  // ======== RENDER ========
  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🔣</div>
        <h1 className={styles.heroTitle}>Combinatoria Visual</h1>
        <p className={styles.heroSubtitle}>
          Permutaciones, combinaciones, triángulo de Pascal y binomio de Newton — con árboles animados y patrones ocultos
        </p>
      </header>

      <LegalNotice />

      {/* TABS */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabs} role="tablist">
          {([
            { id: 'permcomb', label: 'Permutaciones y Combinaciones' },
            { id: 'pascal', label: 'Triángulo de Pascal' },
            { id: 'principio', label: 'Multiplicación y Newton' },
          ] as { id: TabId; label: string }[]).map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PERMUTACIONES Y COMBINACIONES */}
        {activeTab === 'permcomb' && (
          <div className={styles.tabPanel} role="tabpanel">
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel}>
                n (total de elementos): <strong>{nVal}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={nVal}
                onChange={e => handleNChange(Number(e.target.value))}
                className={styles.slider}
                aria-label="Número total de elementos n"
              />
              <label className={styles.sliderLabel}>
                k (elementos a elegir): <strong>{kVal}</strong>
              </label>
              <input
                type="range"
                min={0}
                max={nVal}
                value={kVal}
                onChange={e => setKVal(Number(e.target.value))}
                className={styles.slider}
                aria-label="Número de elementos a elegir k"
              />
            </div>

            <div className={styles.resultsGrid}>
              <div className={styles.resultCard}>
                <div className={styles.resultLabel}>Permutaciones P(n,k)</div>
                <div className={styles.resultFormula}>
                  P({nVal},{kVal}) = {nVal}! / ({nVal}-{kVal})!
                </div>
                <div className={styles.resultValue}>{pnk.toLocaleString('es-ES')}</div>
                <p className={styles.resultDesc}>
                  El <strong>orden importa</strong>. Elige {kVal} de {nVal} en secuencia.
                </p>
              </div>
              <div className={`${styles.resultCard} ${styles.resultCardSecondary}`}>
                <div className={styles.resultLabel}>Combinaciones C(n,k)</div>
                <div className={styles.resultFormula}>
                  C({nVal},{kVal}) = {nVal}! / ({kVal}!·({nVal}-{kVal})!)
                </div>
                <div className={styles.resultValue}>{cnk.toLocaleString('es-ES')}</div>
                <p className={styles.resultDesc}>
                  El <strong>orden NO importa</strong>. Grupos de {kVal} de {nVal}.
                </p>
              </div>
            </div>

            <div className={styles.ratioBox}>
              <span className={styles.ratioLabel}>Relación:</span>{' '}
              P({nVal},{kVal}) = C({nVal},{kVal}) × {kVal}! = {cnk} × {factorial(kVal)} = {pnk.toLocaleString('es-ES')}
            </div>

            {/* Árbol SVG */}
            {nVal <= 5 && kVal > 0 && kVal <= 3 ? (
              <div className={styles.treeSection}>
                <h3 className={styles.treeSectionTitle}>Árbol de posibilidades (n≤5, k≤3)</h3>
                <p className={styles.treeDesc}>
                  Ramas <span className={styles.selectedBadge}>seleccionadas</span> muestran una ruta P(n,k).
                </p>
                <div className={styles.svgWrapper}>
                  <svg
                    viewBox="0 0 360 220"
                    className={styles.treeSvg}
                    aria-label={`Árbol de permutaciones para n=${nVal}, k=${kVal}`}
                  >
                    {/* Conexiones */}
                    {treeNodes.slice(1).map((node, i) => (
                      <line
                        key={`line-${i}`}
                        x1={node.parentX}
                        y1={node.parentY}
                        x2={node.x}
                        y2={node.y}
                        stroke={node.selected ? '#2E86AB' : '#CBD5E1'}
                        strokeWidth={node.selected ? 2 : 1}
                        strokeDasharray={node.selected ? undefined : '4,2'}
                      />
                    ))}
                    {/* Nodos */}
                    {treeNodes.map((node, i) => (
                      <g key={`node-${i}`}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={i === 0 ? 14 : 10}
                          fill={node.selected ? '#2E86AB' : '#E2E8F0'}
                          stroke={node.selected ? '#1A5F7A' : '#94A3B8'}
                          strokeWidth={1.5}
                        />
                        <text
                          x={node.x}
                          y={node.y + 4}
                          textAnchor="middle"
                          fontSize={i === 0 ? 11 : 9}
                          fill={node.selected ? '#FFFFFF' : '#475569'}
                          fontWeight="600"
                        >
                          {i === 0 ? '●' : node.value}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            ) : (
              <div className={styles.treeHint}>
                <span aria-hidden="true">🌳</span> El árbol se muestra para n ≤ 5 y k ≤ 3.
                Actualmente: n={nVal}, k={kVal}.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRIÁNGULO DE PASCAL */}
        {activeTab === 'pascal' && (
          <div className={styles.tabPanel} role="tabpanel">
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel}>
                Filas del triángulo: <strong>{pascalRows + 1}</strong> (filas 0–{pascalRows})
              </label>
              <input
                type="range"
                min={3}
                max={12}
                value={pascalRows}
                onChange={e => { setPascalRows(Number(e.target.value)); setSelectedCell(null); }}
                className={styles.slider}
                aria-label="Número de filas del triángulo de Pascal"
              />
            </div>

            {/* Botones de patrón */}
            <div className={styles.patternButtons} role="group" aria-label="Seleccionar patrón">
              {patternButtons.map(btn => (
                <button
                  key={btn.id}
                  className={`${styles.patternBtn} ${pascalPattern === btn.id ? styles.patternBtnActive : ''}`}
                  onClick={() => { setPascalPattern(btn.id); setSelectedCell(null); }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Descripción del patrón */}
            <div className={styles.patternDesc}>
              {pascalPattern === 'binomial' && 'Coeficientes binomiales C(n,k): cada número es la suma de los dos de arriba.'}
              {pascalPattern === 'fibonacci' && 'Las sumas de las diagonales (/↗) dan la secuencia de Fibonacci: 1, 1, 2, 3, 5, 8, 13…'}
              {pascalPattern === 'potencias2' && `La suma de cada fila es 2ⁿ. Fila actual más larga suma ${rowSums[pascalRows]?.toLocaleString('es-ES')}.`}
              {pascalPattern === 'triangulares' && 'Columna k=2 resaltada: 1, 3, 6, 10, 15, 21… son los números triangulares T(n).'}
              {pascalPattern === 'sierpinski' && 'Al resaltar los números IMPARES aparece el fractal triángulo de Sierpinski.'}
            </div>

            {/* SVG Pascal */}
            <div className={styles.pascalWrapper}>
              <svg
                viewBox={`0 0 ${pascalSvgWidth} ${pascalSvgHeight}`}
                className={styles.pascalSvg}
                aria-label="Triángulo de Pascal interactivo"
              >
                {pascalTriangle.map((row, r) =>
                  row.map((cell, c) => {
                    const totalCellsInRow = r + 1;
                    const rowWidth = totalCellsInRow * (CELL_SIZE + CELL_GAP) - CELL_GAP;
                    const startX = (pascalSvgWidth - rowWidth) / 2;
                    const cx = startX + c * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
                    const cy = r * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 10;
                    const color = getPascalCellColor(cell, pascalPattern, pascalRows);
                    const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                    const displayVal = cell.value > 999 ? '…' : String(cell.value);
                    return (
                      <g
                        key={`${r}-${c}`}
                        onClick={() => setSelectedCell(isSelected ? null : cell)}
                        style={{ cursor: 'pointer' }}
                        role="button"
                        aria-label={`C(${r},${c}) = ${cell.value}`}
                      >
                        <rect
                          x={cx - CELL_SIZE / 2}
                          y={cy - CELL_SIZE / 2}
                          width={CELL_SIZE}
                          height={CELL_SIZE}
                          rx={4}
                          fill={color}
                          opacity={pascalPattern === 'sierpinski' && cell.value % 2 === 0 ? 0.15 : 0.85}
                          stroke={isSelected ? '#F59E0B' : 'rgba(255,255,255,0.3)'}
                          strokeWidth={isSelected ? 2.5 : 1}
                        />
                        <text
                          x={cx}
                          y={cy + 4}
                          textAnchor="middle"
                          fontSize={cell.value > 99 ? 7 : 9}
                          fill="#FFFFFF"
                          fontWeight="600"
                        >
                          {displayVal}
                        </text>
                      </g>
                    );
                  })
                )}
              </svg>
            </div>

            {selectedCell && (
              <div className={styles.cellInfo} role="alert" aria-live="polite">
                <strong>C({selectedCell.row}, {selectedCell.col}) = {selectedCell.value}</strong>
                {' '}— Fila {selectedCell.row}, posición {selectedCell.col}
                {' '}— Suma de esa fila: {rowSums[selectedCell.row]?.toLocaleString('es-ES')} = 2^{selectedCell.row}
              </div>
            )}

            {pascalPattern === 'potencias2' && (
              <div className={styles.rowSumsTable}>
                <h4 className={styles.rowSumsTitle}>Sumas de fila = 2ⁿ</h4>
                <div className={styles.rowSumsList}>
                  {rowSums.slice(0, 9).map((s, r) => (
                    <div key={r} className={styles.rowSumItem}>
                      <span className={styles.rowSumLabel}>Fila {r}</span>
                      <span className={styles.rowSumValue}>{s}</span>
                      <span className={styles.rowSumPow}>= 2^{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRINCIPIO MULTIPLICACIÓN + NEWTON */}
        {activeTab === 'principio' && (
          <div className={styles.tabPanel} role="tabpanel">
            {/* SECCIÓN A: PRINCIPIO DE MULTIPLICACIÓN */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>A — Principio de Multiplicación</h3>
              <p className={styles.sectionDesc}>
                Si tienes {multiplySteps.map(s => s.options).join(' opciones × ')} opciones en cada paso,
                el total de combinaciones posibles es su producto.
              </p>

              <div className={styles.multiplySteps}>
                {multiplySteps.map((step, idx) => (
                  <div key={idx} className={styles.multiplyStep}>
                    <label className={styles.stepLabel}>{step.label}</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={step.options}
                      onChange={e => updateStep(idx, Math.max(1, Math.min(20, Number(e.target.value))))}
                      className={styles.stepInput}
                      aria-label={`Opciones en ${step.label}`}
                    />
                    <span className={styles.stepUnit}>opciones</span>
                    {idx < multiplySteps.length - 1 && <span className={styles.stepOp}>×</span>}
                  </div>
                ))}
              </div>

              <div className={styles.multiplyActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={addMultiplyStep}
                  disabled={multiplySteps.length >= 4}
                  aria-label="Añadir paso"
                >
                  + Añadir paso
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={removeMultiplyStep}
                  disabled={multiplySteps.length <= 1}
                  aria-label="Quitar último paso"
                >
                  − Quitar paso
                </button>
              </div>

              <div className={styles.multiplyResult}>
                <span className={styles.multiplyFormula}>
                  {multiplySteps.map(s => s.options).join(' × ')} =
                </span>
                <span className={styles.multiplyTotal}>{multiplyTotal.toLocaleString('es-ES')}</span>
                <span className={styles.multiplySubtitle}>combinaciones posibles</span>
              </div>
            </div>

            {/* SECCIÓN B: BINOMIO DE NEWTON */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>B — Binomio de Newton (a+b)^n</h3>

              <div className={styles.newtonControls}>
                <div className={styles.newtonSlider}>
                  <label className={styles.sliderLabel}>
                    a = <strong>{newtonA}</strong>
                  </label>
                  <input
                    type="range"
                    min={-3}
                    max={3}
                    value={newtonA}
                    onChange={e => setNewtonA(Number(e.target.value))}
                    className={styles.slider}
                    aria-label="Valor de a"
                  />
                </div>
                <div className={styles.newtonSlider}>
                  <label className={styles.sliderLabel}>
                    b = <strong>{newtonB}</strong>
                  </label>
                  <input
                    type="range"
                    min={-3}
                    max={3}
                    value={newtonB}
                    onChange={e => setNewtonB(Number(e.target.value))}
                    className={styles.slider}
                    aria-label="Valor de b"
                  />
                </div>
                <div className={styles.newtonSlider}>
                  <label className={styles.sliderLabel}>
                    n = <strong>{newtonN}</strong>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={newtonN}
                    onChange={e => setNewtonN(Number(e.target.value))}
                    className={styles.slider}
                    aria-label="Exponente n"
                  />
                </div>
              </div>

              <div className={styles.newtonHeader}>
                ({newtonA} + {newtonB})^{newtonN} = {newtonTotal.toLocaleString('es-ES')}
              </div>

              <p className={styles.newtonPascalNote}>
                Los coeficientes C({newtonN},k) corresponden a la fila {newtonN} del triángulo de Pascal:
                <strong> [{buildPascalRow(newtonN).join(', ')}]</strong>
              </p>

              <div className={styles.newtonTerms}>
                {newtonTerms.map((term, i) => (
                  <div key={i} className={styles.newtonTerm}>
                    <div className={styles.newtonCoef}>
                      C({newtonN},{term.k}) = {term.coef}
                    </div>
                    <div className={styles.newtonTermBody}>
                      {formatTerm(term, newtonA, newtonB)}
                    </div>
                    {i < newtonTerms.length - 1 && (
                      <div className={styles.newtonPlus}>+</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN EDUCATIVA */}
      <EducationalSection
        title="¿Qué es la combinatoria y por qué importa?"
        subtitle="Permutaciones, combinaciones, triángulo de Pascal, principio de multiplicación y binomio de Newton"
      >
        <div className={styles.eduContent}>
          <h3 className={styles.eduHeading}>Permutación vs Combinación</h3>
          <p>
            La diferencia fundamental: en una <strong>permutación</strong> el orden importa (ABC ≠ BAC),
            mientras que en una <strong>combinación</strong> solo importa qué elementos se eligen (ABC = BAC).
            Fórmulas: P(n,k) = n!/(n-k)! y C(n,k) = n!/(k!·(n-k)!).
          </p>

          <h3 className={styles.eduHeading}>El Triángulo de Pascal: historia y patrones ocultos</h3>
          <p>
            Descrito en China por Yang Hui (s. XIII) y en Europa por Pascal (1665), este triángulo
            esconde múltiples patrones: los números de Fibonacci en sus diagonales, potencias de 2
            en las sumas de fila, números triangulares en la columna k=2, y el fractal de Sierpinski
            al resaltar los números impares.
          </p>

          <h3 className={styles.eduHeading}>Principio de Multiplicación</h3>
          <p>
            Si una tarea se divide en pasos independientes con n₁, n₂, …, nₖ opciones cada uno,
            el total de maneras de completarla es n₁ × n₂ × … × nₖ. Es la base del conteo combinatorio.
          </p>

          <h3 className={styles.eduHeading}>Binomio de Newton</h3>
          <p>
            (a+b)^n = Σ C(n,k)·a^(n-k)·b^k. Los coeficientes son exactamente la fila n del
            triángulo de Pascal. Para n=2: a²+2ab+b²; para n=3: a³+3a²b+3ab²+b³.
          </p>

          <h3 className={styles.eduHeading}>Aplicaciones en criptografía y probabilidad</h3>
          <p>
            RSA usa combinatoria para calcular el espacio de claves (2^2048 posibilidades para RSA-2048).
            En probabilidad, C(n,k) cuenta los casos favorables de eventos binomiales. La distribución
            binomial P(X=k) = C(n,k)·p^k·(1-p)^(n-k) modela lanzamientos de moneda, ensayos clínicos
            y control de calidad industrial.
          </p>
        </div>

        {/* ── Sección 1: Tabla Comparativa ── */}
        <h3 className={styles.eduHeading} style={{ marginTop: '1.5rem' }}>Permutación vs Combinación — Comparativa rápida</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th></th>
                <th>Permutación P(n,k)</th>
                <th>Combinación C(n,k)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>¿Importa el orden?</td>
                <td>✅ Sí</td>
                <td>❌ No</td>
              </tr>
              <tr>
                <td>Fórmula</td>
                <td>n! / (n−k)!</td>
                <td>n! / k!(n−k)!</td>
              </tr>
              <tr>
                <td>P(5,2) vs C(5,2)</td>
                <td>20</td>
                <td>10</td>
              </tr>
              <tr>
                <td>Ejemplo</td>
                <td>Podio 1º/2º/3º en 5 corredores</td>
                <td>Equipo de 2 en 5 personas</td>
              </tr>
              <tr>
                <td>Relación</td>
                <td>P(n,k) = k! · C(n,k)</td>
                <td>C(n,k) = P(n,k) / k!</td>
              </tr>
              <tr>
                <td>Uso típico</td>
                <td>Contraseñas, pódios, ordenaciones</td>
                <td>Equipos, muestras, selecciones</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Sección 2: Casos de Uso ── */}
        <h3 className={styles.eduHeading}>Casos de uso por perfil</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔐</span>
              <h3>Criptógrafo / Seguridad</h3>
            </div>
            <p>Las contraseñas de 8 caracteres en un alfabeto de 62 son permutaciones (el orden importa). El espacio de clave de AES-256 equivale a C(256, muchos bits) posibles combinaciones.</p>
            <p className={styles.escenarioTip}>Permutaciones = ordenaciones → seguridad por espacio de clave</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧬</span>
              <h3>Biólogo / Genética</h3>
            </div>
            <p>Las combinaciones calculan genotipos posibles: un organismo diploide con k loci heterocigóticos de n totales tiene C(n,k) combinaciones posibles de alelos.</p>
            <p className={styles.escenarioTip}>Combinaciones = grupos sin orden → diversidad genética</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
              <h3>Estadístico</h3>
            </div>
            <p>La distribución binomial es combinatoria aplicada a probabilidad: P(k éxitos en n ensayos) = C(n,k)·p^k·(1−p)^(n−k). Base de tests A/B, control de calidad y ensayos clínicos.</p>
            <p className={styles.escenarioTip}>C(n,k) cuenta los casos favorables de eventos binomiales</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏆</span>
              <h3>Organizador de Torneos</h3>
            </div>
            <p>Los grupos de fase regular son combinaciones (no importa quién es local). Los cruces de eliminatoria son permutaciones (local vs visitante cambia el resultado esperado).</p>
            <p className={styles.escenarioTip}>Fase de grupos = C(n,2) partidos por grupo</p>
          </div>
        </div>

        {/* ── Sección 3: FAQ ── */}
        <h3 className={styles.eduHeading}>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cuándo uso permutación y cuándo combinación?</h4>
            <p>La pregunta clave es: ¿el resultado A,B es diferente de B,A? Si sí (podio, PIN, contraseña) → permutación. Si es lo mismo (equipo, muestra, grupo) → combinación.</p>
            <div className={styles.faqTip}>Truco: palabras como "ordenar", "pódio" o "secuencia" indican permutación; "equipo", "grupo" o "muestra" indican combinación.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el factorial y por qué aparece en estas fórmulas?</h4>
            <p>n! = 1×2×3×…×n cuenta todas las maneras de ordenar n elementos distintos. Las fórmulas de permutación y combinación dividen por los factoriales de los elementos que NO queremos ordenar.</p>
            <div className={styles.faqTip}>Por definición, 0! = 1. Sin esto, C(n,0) = 1 (hay una sola forma de no elegir nada) no funcionaría.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué el triángulo de Pascal aparece en el binomio de Newton?</h4>
            <p>Al expandir (a+b)^n, cada término tiene la forma C(n,k)·a^(n-k)·b^k. Los coeficientes C(n,k) son exactamente la fila n del triángulo de Pascal porque Pascal construyó su triángulo precisamente a partir de los coeficientes binomiales.</p>
            <div className={styles.faqTip}>Propiedad de Pascal: C(n,k) = C(n-1,k-1) + C(n-1,k) — cada número es la suma de los dos de arriba.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el principio de multiplicación y cuándo aplica?</h4>
            <p>Si una tarea tiene etapas independientes con n₁, n₂, …, nₖ opciones cada una, el total es n₁×n₂×…×nₖ. Aplica cuando las elecciones en cada etapa no afectan las opciones de las demás.</p>
            <div className={styles.faqTip}>Ejemplo: 3 colores × 4 tallas × 2 géneros = 24 modelos diferentes de ropa.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué son los números de Fibonacci y por qué están en el triángulo de Pascal?</h4>
            <p>La secuencia 1, 1, 2, 3, 5, 8, 13, 21… se forma sumando los dos anteriores. Aparece en el triángulo de Pascal al sumar las diagonales ascendentes (↗): cada diagonal suma un número de Fibonacci.</p>
            <div className={styles.faqTip}>Esta conexión entre combinatoria y Fibonacci apareció por primera vez en los estudios de Fibonacci sobre crecimiento de poblaciones.</div>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuántas combinaciones posibles tiene un sudoku de 9×9?</h4>
            <p>Aproximadamente 6,67 × 10²¹ sudokus válidos completos (sin contar simetrías). Este enorme número se calcula con principio multiplicativo y combinaciones con restricciones de cada fila, columna y caja 3×3.</p>
            <div className={styles.faqTip}>Si un ordenador probara un millón de sudokus por segundo, tardaría más de 200 millones de años en probarlos todos.</div>
          </div>
        </div>

        {/* ── Sección 4: Guía Paso a Paso ── */}
        <h3 className={styles.eduHeading}>Guía paso a paso: resolver un problema combinatorio</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Identifica si el orden importa</h4>
              <p>¿El resultado A,B es diferente de B,A? Si sí → Permutación. Si es el mismo resultado → Combinación.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Determina n y k</h4>
              <p>n es el total de elementos disponibles. k es cuántos se eligen o se ordenan. Verifica que k ≤ n.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Aplica la fórmula correcta</h4>
              <p>Permutación: P(n,k) = n!/(n−k)!. Combinación: C(n,k) = n!/[k!(n−k)!]. Usa la calculadora de esta app para valores grandes.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Aplica el principio multiplicativo si hay etapas</h4>
              <p>Si el problema tiene múltiples etapas independientes, calcula cada una por separado y multiplica todos los resultados entre sí.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Verifica tu resultado</h4>
              <p>C(n,k) siempre es menor o igual que P(n,k). Además, C(n,k) = C(n, n−k): elegir 3 de 10 da el mismo número que "rechazar" 7 de 10.</p>
            </div>
          </div>
        </div>

        {/* ── Sección 5: Mejores Prácticas ── */}
        <h3 className={styles.eduHeading}>Mejores prácticas y trucos</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <h4>Palabras clave</h4>
            <p>"Grupos", "equipos", "muestras" → combinaciones. "Pódio", "ordenar", "contraseña" → permutaciones.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <h4>Simetría C(n,k)</h4>
            <p>C(n,k) = C(n, n−k). Elegir 3 de 10 = rechazar 7 de 10. Usa la versión más sencilla de calcular.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <h4>Triángulo de Pascal</h4>
            <p>Evita calcular factoriales grandes: cada número es suma de los dos de arriba. Construye el triángulo para valores pequeños.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <h4>Distribución Binomial</h4>
            <p>P(k éxitos en n) = C(n,k)·p^k·(1−p)^(n−k). Combinatoria aplicada directamente a probabilidad.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <h4>Criptografía</h4>
            <p>El tamaño del espacio de clave (permutaciones o combinaciones posibles) determina la seguridad. Más bits = más seguridad logarítmica.</p>
          </div>
        </div>

        {/* ── Sección 6: Warning Box ── */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Comunes en Combinatoria</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Usar combinación cuando el orden importa:</strong> El PIN 1234 ≠ PIN 4321. Si el orden importa, es permutación, no combinación.</li>
            <li><strong>❌ Olvidar que 0! = 1:</strong> Es una definición, no un cálculo. Sin ella, C(n,0) = 1 (hay una sola forma de elegir 0 elementos: no elegir ninguno) no tendría sentido.</li>
            <li><strong>❌ Confundir "con reposición" y "sin reposición":</strong> Lanzar un dado varias veces = con reposición. Sacar cartas de una baraja = sin reposición. Las fórmulas estándar asumen sin reposición.</li>
            <li><strong>❌ Ignorar el principio multiplicativo cuando hay etapas:</strong> Si en cada etapa hay opciones independientes, el total es el PRODUCTO, no la suma.</li>
            <li><strong>❌ Pensar que más combinaciones = más seguridad siempre:</strong> La seguridad de una contraseña depende del logaritmo del espacio (bits de entropía), no del número absoluto.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-combinatoria')} />
      <ShareCard appName="visualizador-combinatoria" />
      <Footer appName="visualizador-combinatoria" />
    </div>
  );
}
