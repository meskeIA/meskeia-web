'use client';
// @disclaimer: exempt

import { useState, useCallback, useMemo } from 'react';
import styles from './CalculadoraAlgebraBooleana.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  minimizar,
  terminoDeImplicante,
  expresionMinima,
  totalLiterales,
  type ModoSalida,
} from '@/lib/calculadoras/karnaugh';

type NumVariables = 2 | 3 | 4;
type OutputMode = ModoSalida;

interface KarnaughGroup {
  cells: number[];
  term: string;
  color: string;
  /** Implicante primo esencial: es el único que cubre alguna celda */
  esencial: boolean;
  /** Nº de variables que sobreviven en el término */
  literales: number;
}

// Colores para grupos
const GROUP_COLORS = [
  'rgba(231, 76, 60, 0.3)',    // Rojo
  'rgba(46, 134, 171, 0.3)',   // Azul meskeIA
  'rgba(46, 204, 113, 0.3)',   // Verde
  'rgba(155, 89, 182, 0.3)',   // Púrpura
  'rgba(241, 196, 15, 0.3)',   // Amarillo
  'rgba(230, 126, 34, 0.3)',   // Naranja
  'rgba(26, 188, 156, 0.3)',   // Turquesa
  'rgba(52, 73, 94, 0.3)',     // Gris oscuro
];

// Gray code para ordenar filas/columnas de Karnaugh
const GRAY_CODE_2 = ['00', '01', '11', '10'];
const GRAY_CODE_1 = ['0', '1'];

export default function CalculadoraAlgebraBooleanaPage() {
  const [numVariables, setNumVariables] = useState<NumVariables>(3);
  const [truthTable, setTruthTable] = useState<(0 | 1 | 'X')[]>(() =>
    Array(Math.pow(2, 3)).fill(0) as (0 | 1 | 'X')[]
  );
  const [outputMode, setOutputMode] = useState<OutputMode>('sop');
  const [showSteps, setShowSteps] = useState(false);

  // Cambiar número de variables
  const handleNumVariablesChange = useCallback((newNum: NumVariables) => {
    setNumVariables(newNum);
    setTruthTable(Array(Math.pow(2, newNum)).fill(0) as (0 | 1 | 'X')[]);
  }, []);

  // Toggle valor en la tabla de verdad (0 -> 1 -> X -> 0)
  const toggleTruthValue = useCallback((index: number) => {
    setTruthTable(prev => {
      const newTable = [...prev];
      if (newTable[index] === 0) newTable[index] = 1;
      else if (newTable[index] === 1) newTable[index] = 'X';
      else newTable[index] = 0;
      return newTable;
    });
  }, []);

  // Nombres de variables
  const variableNames = useMemo(() => {
    if (numVariables === 2) return ['A', 'B'];
    if (numVariables === 3) return ['A', 'B', 'C'];
    return ['A', 'B', 'C', 'D'];
  }, [numVariables]);

  // Estructura del mapa de Karnaugh según el número de variables
  const karnaughStructure = useMemo(() => {
    if (numVariables === 2) {
      // 2x2: A en filas, B en columnas
      return {
        rows: GRAY_CODE_1,
        cols: GRAY_CODE_1,
        rowLabels: ['A'],
        colLabels: ['B'],
        getCellIndex: (row: number, col: number) => {
          const a = row;
          const b = col;
          return a * 2 + b;
        }
      };
    } else if (numVariables === 3) {
      // 2x4: A en filas, BC en columnas
      return {
        rows: GRAY_CODE_1,
        cols: GRAY_CODE_2,
        rowLabels: ['A'],
        colLabels: ['B', 'C'],
        getCellIndex: (row: number, col: number) => {
          const a = row;
          const bc = GRAY_CODE_2[col];
          const b = parseInt(bc[0]);
          const c = parseInt(bc[1]);
          return a * 4 + b * 2 + c;
        }
      };
    } else {
      // 4x4: AB en filas, CD en columnas
      return {
        rows: GRAY_CODE_2,
        cols: GRAY_CODE_2,
        rowLabels: ['A', 'B'],
        colLabels: ['C', 'D'],
        getCellIndex: (row: number, col: number) => {
          const ab = GRAY_CODE_2[row];
          const cd = GRAY_CODE_2[col];
          const a = parseInt(ab[0]);
          const b = parseInt(ab[1]);
          const c = parseInt(cd[0]);
          const d = parseInt(cd[1]);
          return a * 8 + b * 4 + c * 2 + d;
        }
      };
    }
  }, [numVariables]);

  // Obtener mintérminos (donde f=1), maxtérminos (donde f=0) y don't cares (donde f=X)
  const minterms = useMemo(() =>
    truthTable.map((v, i) => v === 1 ? i : -1).filter(i => i !== -1),
    [truthTable]
  );

  const maxterms = useMemo(() =>
    truthTable.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1),
    [truthTable]
  );

  const dontCares = useMemo(() =>
    truthTable.map((v, i) => v === 'X' ? i : -1).filter(i => i !== -1),
    [truthTable]
  );

  // Minimización exacta: Quine-McCluskey + cobertura mínima (lib/calculadoras/karnaugh.ts).
  // Garantiza la expresión con menos términos y, a igualdad, menos literales.
  const resultado = useMemo(
    () => minimizar(truthTable, numVariables, outputMode),
    [truthTable, numVariables, outputMode]
  );

  // Grupos del mapa, listos para pintar
  const karnaughGroups: KarnaughGroup[] = useMemo(() =>
    resultado.grupos.map((grupo, i) => ({
      cells: grupo.celdas,
      term: terminoDeImplicante(grupo.patron, variableNames, outputMode),
      color: GROUP_COLORS[i % GROUP_COLORS.length],
      esencial: grupo.esencial,
      literales: grupo.literales,
    })),
    [resultado, variableNames, outputMode]
  );

  // Implicantes primos NO seleccionados: existen, pero no hacen falta para la mínima
  const primosDescartados = useMemo(() => {
    const elegidos = new Set(resultado.grupos.map(g => g.patron));
    return resultado.primos
      .filter(p => !elegidos.has(p.patron))
      .map(p => terminoDeImplicante(p.patron, variableNames, outputMode));
  }, [resultado, variableNames, outputMode]);

  // Expresión simplificada final
  const simplifiedExpression = useMemo(
    () => expresionMinima(resultado, variableNames, outputMode),
    [resultado, variableNames, outputMode]
  );

  // Coste de la expresión: nº de términos y de literales
  const costeExpresion = useMemo(() => ({
    terminos: resultado.grupos.length,
    literales: totalLiterales(resultado),
  }), [resultado]);

  // Verificar si una celda está en un grupo
  const getCellGroups = useCallback((cellIndex: number): KarnaughGroup[] => {
    return karnaughGroups.filter(g => g.cells.includes(cellIndex));
  }, [karnaughGroups]);

  // Obtener color de celda mezclando grupos
  const getCellBackground = useCallback((cellIndex: number): string => {
    const groups = getCellGroups(cellIndex);
    if (groups.length === 0) return 'transparent';
    if (groups.length === 1) return groups[0].color;

    // Mezclar colores si está en múltiples grupos
    return groups[groups.length - 1].color;
  }, [getCellGroups]);

  // Generar tabla de verdad
  const renderTruthTable = () => {
    const rows = [];
    const numRows = Math.pow(2, numVariables);

    for (let i = 0; i < numRows; i++) {
      const binary = i.toString(2).padStart(numVariables, '0');
      rows.push(
        <tr key={i} className={truthTable[i] === 1 ? styles.activeRow : ''}>
          <td className={styles.rowNumber}>{i}</td>
          {binary.split('').map((bit, j) => (
            <td key={j}>{bit}</td>
          ))}
          <td
            className={`${styles.outputCell} ${
              truthTable[i] === 1 ? styles.outputOne :
              truthTable[i] === 'X' ? styles.outputX : styles.outputZero
            }`}
            onClick={() => toggleTruthValue(i)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTruthValue(i);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Fila ${i}: F vale ${truthTable[i]}. Pulsa para cambiar`}
          >
            {truthTable[i]}
          </td>
        </tr>
      );
    }

    return rows;
  };

  // Renderizar mapa de Karnaugh
  const renderKarnaughMap = () => {
    const { rows, cols, rowLabels, colLabels, getCellIndex } = karnaughStructure;

    return (
      <div className={styles.karnaughContainer}>
        <table className={styles.karnaughMap}>
          <thead>
            <tr>
              <th className={styles.cornerCell}>{rowLabels.join('')}\{colLabels.join('')}</th>
              {cols.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <th>{row}</th>
                {cols.map((_, colIdx) => {
                  const cellIndex = getCellIndex(rowIdx, colIdx);
                  const value = truthTable[cellIndex];
                  const background = getCellBackground(cellIndex);
                  const groups = getCellGroups(cellIndex);

                  return (
                    <td
                      key={colIdx}
                      className={`${styles.karnaughCell} ${
                        value === 1 ? styles.cellOne :
                        value === 'X' ? styles.cellX : styles.cellZero
                      }`}
                      style={{ backgroundColor: background }}
                      onClick={() => toggleTruthValue(cellIndex)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleTruthValue(cellIndex);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Celda ${cellIndex}: vale ${value}${groups.length > 0 ? `, en el grupo ${groups.map(g => g.term).join(' y ')}` : ''}. Pulsa para cambiar`}
                      title={groups.length > 0 ? `Grupos: ${groups.map(g => g.term).join(', ')}` : ''}
                    >
                      <span className={styles.cellValue}>{value}</span>
                      <span className={styles.cellIndex}>{cellIndex}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Ejemplos predefinidos
  const loadExample = (example: string) => {
    switch (example) {
      case 'xor':
        // XOR de 2 variables
        handleNumVariablesChange(2);
        setTimeout(() => setTruthTable([0, 1, 1, 0]), 0);
        break;
      case 'majority':
        // Votación mayoría de 3 variables
        handleNumVariablesChange(3);
        setTimeout(() => setTruthTable([0, 0, 0, 1, 0, 1, 1, 1]), 0);
        break;
      case 'bcd':
        // BCD inválido (>9)
        handleNumVariablesChange(4);
        setTimeout(() => setTruthTable([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]), 0);
        break;
      case 'parity':
        // Paridad impar de 4 bits
        handleNumVariablesChange(4);
        setTimeout(() => setTruthTable([0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0]), 0);
        break;
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🔢</span>
        <h1 className={styles.title}>Calculadora de Álgebra Booleana</h1>
        <p className={styles.subtitle}>
          Simplifica expresiones booleanas con mapas de Karnaugh
        </p>
      </header>

      <LegalNotice />

      {/* Configuración */}
      <section className={styles.configSection}>
        <h2 className={styles.sectionTitle}>Configuración</h2>

        <div className={styles.configRow}>
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Número de Variables</label>
            <div className={styles.variableSelector}>
              {([2, 3, 4] as NumVariables[]).map(num => (
                <button
                  type="button"
                  key={num}
                  className={`${styles.variableBtn} ${numVariables === num ? styles.variableBtnActive : ''}`}
                  onClick={() => handleNumVariablesChange(num)}
                  aria-pressed={numVariables === num}
                >
                  {num} vars
                  <span className={styles.variableNames}>
                    {num === 2 ? 'A, B' : num === 3 ? 'A, B, C' : 'A, B, C, D'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Forma de Salida</label>
            <div className={styles.modeSelector}>
              <button
                type="button"
                className={`${styles.modeBtn} ${outputMode === 'sop' ? styles.modeBtnActive : ''}`}
                onClick={() => setOutputMode('sop')}
                aria-pressed={outputMode === 'sop'}
              >
                SOP
                <span className={styles.modeDesc}>Suma de Productos</span>
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${outputMode === 'pos' ? styles.modeBtnActive : ''}`}
                onClick={() => setOutputMode('pos')}
                aria-pressed={outputMode === 'pos'}
              >
                POS
                <span className={styles.modeDesc}>Producto de Sumas</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.examplesRow}>
          <span className={styles.examplesLabel}>Ejemplos:</span>
          <button type="button" className={styles.exampleBtn} onClick={() => loadExample('xor')}>
            XOR (2 vars)
          </button>
          <button type="button" className={styles.exampleBtn} onClick={() => loadExample('majority')}>
            Mayoría (3 vars)
          </button>
          <button type="button" className={styles.exampleBtn} onClick={() => loadExample('bcd')}>
            BCD inválido (4 vars)
          </button>
          <button type="button" className={styles.exampleBtn} onClick={() => loadExample('parity')}>
            Paridad (4 vars)
          </button>
        </div>
      </section>

      {/* Contenido Principal */}
      <div className={styles.mainContent}>
        {/* Tabla de Verdad */}
        <section className={styles.truthTableSection}>
          <h2 className={styles.sectionTitle}>Tabla de Verdad</h2>
          <p className={styles.hint}>Haz clic en la columna F para cambiar: 0 → 1 → X → 0</p>

          <div className={styles.tableWrapper}>
            <table className={styles.truthTable}>
              <thead>
                <tr>
                  <th>#</th>
                  {variableNames.map(name => (
                    <th key={name}>{name}</th>
                  ))}
                  <th className={styles.outputHeader}>F</th>
                </tr>
              </thead>
              <tbody>
                {renderTruthTable()}
              </tbody>
            </table>
          </div>

          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendZero}`}></span> 0 = Falso
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendOne}`}></span> 1 = Verdadero
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendX}`}></span> X = Don&apos;t Care
            </span>
          </div>
        </section>

        {/* Mapa de Karnaugh */}
        <section className={styles.karnaughSection}>
          <h2 className={styles.sectionTitle}>Mapa de Karnaugh</h2>
          <p className={styles.hint}>Los grupos coloreados son los de la expresión mínima: los esenciales van marcados</p>

          {renderKarnaughMap()}

          {/* Leyenda de grupos */}
          {karnaughGroups.length > 0 && (
            <div className={styles.groupsLegend}>
              <h4>Grupos de la expresión mínima:</h4>
              <div className={styles.groupsList}>
                {karnaughGroups.map((group, i) => (
                  <div key={i} className={styles.groupItem}>
                    <span
                      className={styles.groupColor}
                      style={{ backgroundColor: group.color }}
                    ></span>
                    <span className={styles.groupTerm}>{group.term}</span>
                    {group.esencial && (
                      <span className={styles.groupEssential} title="Es el único implicante primo que cubre alguna de sus celdas: tiene que estar en la solución">
                        esencial
                      </span>
                    )}
                    <span className={styles.groupCells}>
                      [{group.cells.map(c => dontCares.includes(c) ? `${c}(X)` : c).join(', ')}]
                    </span>
                  </div>
                ))}
              </div>
              <p className={styles.groupsNote}>
                Un implicante primo es <strong>esencial</strong> cuando es el único que cubre
                alguna celda: no hay solución mínima sin él. Los don&apos;t care usados en un
                grupo aparecen marcados con <code>(X)</code>.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Resultado */}
      <section className={styles.resultSection} role="status" aria-live="polite" aria-atomic="false">
        <h2 className={styles.sectionTitle}>Expresión Simplificada</h2>

        <div className={styles.resultBox}>
          <div className={styles.resultExpression}>
            {simplifiedExpression}
          </div>
          <div className={styles.resultInfo}>
            <span>Forma: {outputMode === 'sop' ? 'Suma de Productos (SOP)' : 'Producto de Sumas (POS)'}</span>
            <span>Mintérminos: {minterms.length > 0 ? minterms.join(', ') : 'ninguno'}</span>
            {dontCares.length > 0 && (
              <span>Don&apos;t Cares: {dontCares.join(', ')}</span>
            )}
            {costeExpresion.terminos > 0 && (
              <span>
                Coste: {costeExpresion.terminos} {costeExpresion.terminos === 1 ? 'término' : 'términos'}
                {' · '}{costeExpresion.literales} {costeExpresion.literales === 1 ? 'literal' : 'literales'}
              </span>
            )}
          </div>
          <p className={styles.resultNote}>
            Minimización exacta por Quine-McCluskey: no existe otra expresión con menos
            términos, ni con los mismos términos y menos literales.
          </p>
        </div>

        {/* Pasos detallados */}
        <div className={styles.stepsSection}>
          <button
            type="button"
            className={styles.stepsToggle}
            onClick={() => setShowSteps(!showSteps)}
            aria-expanded={showSteps}
          >
            {showSteps ? '▼' : '▶'} Ver proceso de simplificación
          </button>

          {showSteps && (
            <div className={styles.stepsContent}>
              <div className={styles.step}>
                <strong>Paso 1:</strong> Identificar {outputMode === 'sop' ? 'mintérminos (F=1)' : 'maxtérminos (F=0)'}
                <br />
                {outputMode === 'sop'
                  ? `Mintérminos: m(${minterms.join(', ')})${dontCares.length > 0 ? ` + d(${dontCares.join(', ')})` : ''}`
                  : `Maxtérminos: M(${maxterms.join(', ')})${dontCares.length > 0 ? ` + d(${dontCares.join(', ')})` : ''}`
                }
              </div>

              <div className={styles.step}>
                <strong>Paso 2:</strong> Obtener todos los implicantes primos
                <br />
                Se combinan las celdas que difieren en un solo bit, y se repite mientras
                queden fusiones posibles. Lo que ya no se puede agrandar es un implicante primo.
                <br />
                {resultado.primos.length > 0
                  ? `${resultado.primos.length} implicantes primos: ${resultado.primos.map(p => terminoDeImplicante(p.patron, variableNames, outputMode)).join(', ')}`
                  : 'La función es constante: no hay implicantes que calcular'
                }
              </div>

              <div className={styles.step}>
                <strong>Paso 3:</strong> Elegir la cobertura mínima
                <br />
                {karnaughGroups.length > 0 ? (
                  <>
                    {karnaughGroups.filter(g => g.esencial).length > 0
                      ? `Esenciales (obligatorios): ${karnaughGroups.filter(g => g.esencial).map(g => g.term).join(', ')}`
                      : 'No hay implicantes esenciales: la elección se resuelve por búsqueda exacta'}
                    <br />
                    {karnaughGroups.filter(g => !g.esencial).length > 0 && (
                      <>Añadidos para cubrir el resto: {karnaughGroups.filter(g => !g.esencial).map(g => g.term).join(', ')}<br /></>
                    )}
                    {primosDescartados.length > 0 && (
                      <>Descartados por redundantes: {primosDescartados.join(', ')}</>
                    )}
                  </>
                ) : 'No hay grupos que formar'}
              </div>

              <div className={styles.step}>
                <strong>Paso 4:</strong> Escribir la expresión {outputMode === 'sop' ? 'SOP' : 'POS'}
                <br />
                {simplifiedExpression}
                {costeExpresion.terminos > 0 && (
                  <> — {costeExpresion.terminos} {costeExpresion.terminos === 1 ? 'término' : 'términos'}, {costeExpresion.literales} {costeExpresion.literales === 1 ? 'literal' : 'literales'}</>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tabla de referencia */}
      <section className={styles.referenceSection}>
        <h2 className={styles.sectionTitle}>Referencia Rápida</h2>

        <div className={styles.referenceGrid}>
          <div className={styles.referenceCard}>
            <h4>📐 Reglas de Agrupación</h4>
            <ul>
              <li>Solo agrupar 1, 2, 4, 8, 16... (potencias de 2)</li>
              <li>Los grupos deben ser rectangulares</li>
              <li>Los grupos pueden envolver los bordes</li>
              <li>Cada 1 debe pertenecer a al menos un grupo</li>
              <li>Grupos más grandes = expresión más simple</li>
            </ul>
          </div>

          <div className={styles.referenceCard}>
            <h4>🔤 Operadores Booleanos</h4>
            <ul>
              <li><code>A&apos;</code> = NOT A (complemento)</li>
              <li><code>AB</code> = A AND B (producto)</li>
              <li><code>A + B</code> = A OR B (suma)</li>
              <li><code>SOP</code> = Suma de Productos (OR de ANDs)</li>
              <li><code>POS</code> = Producto de Sumas (AND de ORs)</li>
            </ul>
          </div>

          <div className={styles.referenceCard}>
            <h4>❓ Don&apos;t Care (X)</h4>
            <ul>
              <li>Condiciones que nunca ocurren</li>
              <li>Pueden ser 0 o 1 según convenga</li>
              <li>Ayudan a formar grupos más grandes</li>
              <li>Ejemplo: BCD códigos 10-15</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre Álgebra Booleana?"
        subtitle="Descubre los fundamentos de la lógica digital y simplificación de circuitos"
      >
        {/* Sección 1: Tabla Comparativa */}
        <div className={styles.eduBlock}>
          <h3 className={styles.eduBlockTitle}>Puertas Lógicas y Leyes del Álgebra Booleana</h3>
          <div className={styles.tableResponsive}>
            <table className={styles.eduTable}>
              <thead>
                <tr>
                  <th>Puerta</th>
                  <th>Símbolo</th>
                  <th>Tabla verdad</th>
                  <th>Expresión</th>
                  <th>Equivalencia NAND</th>
                  <th>Uso en circuitos reales</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>AND</strong></td>
                  <td><code>&amp;</code></td>
                  <td>0,0→0 · 0,1→0 · 1,0→0 · 1,1→1</td>
                  <td><code>A · B</code></td>
                  <td><code>NAND(NAND(A,B), NAND(A,B))</code></td>
                  <td>Habilitar señales, máscaras de bits</td>
                </tr>
                <tr>
                  <td><strong>OR</strong></td>
                  <td><code>|</code></td>
                  <td>0,0→0 · 0,1→1 · 1,0→1 · 1,1→1</td>
                  <td><code>A + B</code></td>
                  <td><code>NAND(NAND(A,A), NAND(B,B))</code></td>
                  <td>Combinar señales, detección de eventos</td>
                </tr>
                <tr>
                  <td><strong>NOT</strong></td>
                  <td><code>¬</code></td>
                  <td>0→1 · 1→0</td>
                  <td><code>A&apos;</code></td>
                  <td><code>NAND(A, A)</code></td>
                  <td>Inversión de señal, lógica activa-baja</td>
                </tr>
                <tr>
                  <td><strong>NAND</strong></td>
                  <td><code>↑</code></td>
                  <td>0,0→1 · 0,1→1 · 1,0→1 · 1,1→0</td>
                  <td><code>(A · B)&apos;</code></td>
                  <td>Puerta base (universal)</td>
                  <td>Lógica TTL, CMOS, diseño FPGA</td>
                </tr>
                <tr>
                  <td><strong>NOR</strong></td>
                  <td><code>↓</code></td>
                  <td>0,0→1 · 0,1→0 · 1,0→0 · 1,1→0</td>
                  <td><code>(A + B)&apos;</code></td>
                  <td><code>NAND(NAND(NAND(A,A), NAND(B,B)), ...)</code></td>
                  <td>Circuitos RTL, lógica de control</td>
                </tr>
                <tr>
                  <td><strong>XOR</strong></td>
                  <td><code>⊕</code></td>
                  <td>0,0→0 · 0,1→1 · 1,0→1 · 1,1→0</td>
                  <td><code>A ⊕ B</code></td>
                  <td>4 puertas NAND</td>
                  <td>Sumadores, paridad, cifrado</td>
                </tr>
                <tr>
                  <td><strong>XNOR</strong></td>
                  <td><code>⊙</code></td>
                  <td>0,0→1 · 0,1→0 · 1,0→0 · 1,1→1</td>
                  <td><code>(A ⊕ B)&apos;</code></td>
                  <td>5 puertas NAND</td>
                  <td>Comparadores, detectores de igualdad</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección 2: Escenarios */}
        <div className={styles.eduBlock}>
          <h3 className={styles.eduBlockTitle}>Casos de Uso Reales</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <div className={styles.scenarioIcon}>💻</div>
              <h4 className={styles.scenarioTitle}>Diseñador de circuitos digitales</h4>
              <p className={styles.scenarioDesc}>
                Minimizar un circuito de 6 variables con Mapa de Karnaugh: de 12 compuertas AND/OR a 4 compuertas NAND. Ahorro del 67% en área de silicio y consumo.
              </p>
              <div className={styles.scenarioTip}>
                <strong>Tip:</strong> Mapas de Karnaugh para n≤6 variables; para n&gt;6 usa algoritmo Quine-McCluskey o Espresso.
              </div>
            </div>

            <div className={styles.scenarioCard}>
              <div className={styles.scenarioIcon}>🔒</div>
              <h4 className={styles.scenarioTitle}>Sistemas de acceso</h4>
              <p className={styles.scenarioDesc}>
                Control de acceso: ENTRAR = (TarjetaVálida AND HorarioLaboral) OR (TarjetaAdmin AND NOT Bloqueado). Implementado con 3 compuertas NAND universales.
              </p>
              <div className={styles.scenarioTip}>
                <strong>Tip:</strong> NAND y NOR son puertas universales: cualquier función booleana se implementa solo con ellas.
              </div>
            </div>

            <div className={styles.scenarioCard}>
              <div className={styles.scenarioIcon}>🖥️</div>
              <h4 className={styles.scenarioTitle}>Arquitectura de CPU</h4>
              <p className={styles.scenarioDesc}>
                La ALU de un procesador ARM Cortex-M0 usa álgebra booleana para operaciones bit a bit: AND, OR, XOR entre registros. XOR para detectar cambios de bit (flip-flops, paridad).
              </p>
              <div className={styles.scenarioTip}>
                <strong>Tip:</strong> XOR es la puerta de la suma binaria sin acarreo: 1⊕1=0, 1⊕0=1.
              </div>
            </div>

            <div className={styles.scenarioCard}>
              <div className={styles.scenarioIcon}>🔍</div>
              <h4 className={styles.scenarioTitle}>Motor de búsqueda</h4>
              <p className={styles.scenarioDesc}>
                Google usa álgebra booleana en búsquedas: &apos;python AND (tutorial OR curso) NOT básico&apos;. El índice invertido evalúa esta expresión booleana sobre millones de documentos.
              </p>
              <div className={styles.scenarioTip}>
                <strong>Tip:</strong> Las expresiones booleanas en SQL (WHERE A AND B OR NOT C) siguen exactamente las mismas leyes.
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: FAQ */}
        <div className={styles.eduBlock}>
          <h3 className={styles.eduBlockTitle}>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Por qué NAND es una puerta universal?</summary>
              <div className={styles.faqAnswer}>
                Cualquier función booleana (AND, OR, NOT, XOR...) puede construirse solo con puertas NAND. NOT(A) = NAND(A,A). AND(A,B) = NAND(NAND(A,B), NAND(A,B)). En la práctica, los chips usan solo NAND para minimizar tipos de componentes.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Qué es la forma canónica SOP?</summary>
              <div className={styles.faqAnswer}>
                Sum of Products: suma (OR) de productos (AND) de literales. Ej: f = A&apos;B + AB&apos; + AB. Cada término es un minterm donde f=1. Siempre existe y es única para una función dada.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Cuándo usar Mapa de Karnaugh vs Quine-McCluskey?</summary>
              <div className={styles.faqAnswer}>
                Karnaugh: visual, manual, hasta 6 variables. Quine-McCluskey: algorítmico, cualquier número de variables, implementable en software. Para n&gt;6, las herramientas EDA (Vivado, Quartus) usan variantes de Quine-McCluskey.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Qué son los don&apos;t cares en un mapa de Karnaugh?</summary>
              <div className={styles.faqAnswer}>
                Combinaciones de entrada que nunca ocurrirán en la práctica. Se pueden agrupar como 0 o 1 según convenga para minimizar. Ejemplo: un circuito para dígitos BCD nunca tendrá entradas 1010-1111.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Diferencia entre XOR y XNOR?</summary>
              <div className={styles.faqAnswer}>
                XOR (⊕): salida 1 cuando las entradas son DISTINTAS. XNOR: salida 1 cuando las entradas son IGUALES. XOR detecta diferencias, XNOR detecta igualdad. Usados en comparadores, generadores de paridad, cifrado.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Qué es el hazard en circuitos combinacionales?</summary>
              <div className={styles.faqAnswer}>
                Glitch temporal cuando múltiples señales cambian y llegan con distinto retardo a una puerta. Causa pulsos espurios en la salida. Se elimina añadiendo términos de consenso en el diseño booleano.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Cómo se relaciona álgebra booleana con SQL?</summary>
              <div className={styles.faqAnswer}>
                WHERE A AND B OR NOT C sigue las leyes de De Morgan y distributividad. Los optimizadores de SQL reescriben las condiciones usando álgebra booleana para elegir el plan de ejecución más eficiente.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Qué es el teorema de De Morgan?</summary>
              <div className={styles.faqAnswer}>
                NOT(A AND B) = NOT(A) OR NOT(B). NOT(A OR B) = NOT(A) AND NOT(B). Permite convertir NAND a NOT-OR y NOR a NOT-AND. Fundamental para simplificar expresiones y cambiar entre formas SOP y POS.
              </div>
            </details>
          </div>
        </div>

        {/* Sección 4: Guía Paso a Paso */}
        <div className={styles.eduBlock}>
          <h3 className={styles.eduBlockTitle}>Cómo Minimizar con Mapa de Karnaugh (7 pasos)</h3>
          <div className={styles.stepsList}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Definir la función</strong>
                <p>Construye la tabla de verdad completa. Para n variables, hay 2^n filas. Identifica los minterms donde f=1.</p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Dibujar el mapa</strong>
                <p>Para 2 vars: 2×2, para 3: 2×4, para 4: 4×4. El orden de columnas es código Gray (00,01,11,10) para que celdas adyacentes difieran en 1 bit.</p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Rellenar el mapa</strong>
                <p>Escribe 1 en cada celda que corresponda a un minterm donde f=1. Los don&apos;t cares se marcan con X.</p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Identificar grupos</strong>
                <p>Agrupa celdas adyacentes con 1s (y X si ayuda): grupos de 1, 2, 4, 8, 16 celdas. Los grupos deben ser lo más grandes posible. Las esquinas son adyacentes (el mapa es toroidal).</p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Extraer términos</strong>
                <p>Cada grupo produce un término: las variables que son iguales en todo el grupo se conservan (complementadas o no), las que varían desaparecen.</p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Escribir la expresión SOP</strong>
                <p>Haz OR de todos los términos. Verifica con la tabla de verdad.</p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Implementar con NAND universales</strong>
                <p>Aplica De Morgan: la expresión SOP se convierte directamente a NAND-NAND. Dos niveles de NAND equivalen a SOP.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 5: Mejores Prácticas */}
        <div className={styles.eduBlock}>
          <h3 className={styles.eduBlockTitle}>Mejores Prácticas de Diseño Booleano</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🗺️</div>
              <h4 className={styles.tipTitle}>Grupos máximos, pero sin redundancia</h4>
              <p className={styles.tipDesc}>Agranda cada grupo todo lo posible (menos literales = circuito más simple), pero descarta el grupo cuyas celdas ya cubren otros: un término redundante añade puertas sin cambiar la función.</p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🔄</div>
              <h4 className={styles.tipTitle}>Usa NOR/NAND universales</h4>
              <p className={styles.tipDesc}>En FPGA y ASIC, implementa con NAND para minimizar celdas lógicas. NAND-NAND = SOP en 2 niveles.</p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>✅</div>
              <h4 className={styles.tipTitle}>Verifica con tabla de verdad</h4>
              <p className={styles.tipDesc}>Siempre comprueba la expresión minimizada evaluando todos los casos. Un error en el mapa invalida el circuito.</p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🔢</div>
              <h4 className={styles.tipTitle}>Don&apos;t cares bien definidos</h4>
              <p className={styles.tipDesc}>Solo usa don&apos;t care cuando la combinación es físicamente imposible o no importa. Un don&apos;t care mal colocado puede causar comportamiento erróneo en entradas no previstas.</p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>📐</div>
              <h4 className={styles.tipTitle}>POS cuando hay más 0s que 1s</h4>
              <p className={styles.tipDesc}>Si hay pocos 0s en la tabla, minimiza en POS (Product of Sums) agrupando los 0s. Más eficiente cuando f=0 es el caso común.</p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🏭</div>
              <h4 className={styles.tipTitle}>Herramientas EDA para diseño real</h4>
              <p className={styles.tipDesc}>Para circuitos con &gt;6 variables, usa Vivado (Xilinx), Quartus (Intel/Altera) o Yosys. Implementan Espresso y síntesis lógica automática.</p>
            </div>
          </div>
        </div>

        {/* Sección 6: Warning Box */}
        <div className={styles.warningBox}>
          <h4 className={styles.warningTitle}>⚠️ Errores que invalidan el diseño booleano</h4>
          <ul className={styles.warningList}>
            <li><strong>Orden incorrecto en el mapa de Karnaugh</strong>: Las columnas deben ir en código Gray (00,01,11,10), NO en orden binario (00,01,10,11). Con orden incorrecto, los grupos adyacentes son incorrectos.</li>
            <li><strong>Grupos que no son potencias de 2</strong>: Solo son válidos grupos de 1, 2, 4, 8, 16 celdas. Un grupo de 3 o 5 celdas es incorrecto.</li>
            <li><strong>Olvidar la toroidalidad del mapa</strong>: Las esquinas y bordes son adyacentes. La columna izquierda es adyacente a la derecha, la fila superior a la inferior.</li>
            <li><strong>Confundir NAND y NOR universales</strong>: Ambas son universales pero las conversiones son distintas. NOT(A) = NAND(A,A) pero NOT(A) = NOR(A,A).</li>
            <li><strong>Ignorar los hazards</strong>: Un diseño minimizado puede tener glitches. Añade términos de consenso para eliminarlos en circuitos síncronos sensibles.</li>
            <li><strong>Don&apos;t care en entradas posibles</strong>: Marcar como X una combinación que puede ocurrir → comportamiento impredecible. Solo usa X en combinaciones garantizadas como imposibles.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-algebra-booleana')} />
      <ShareCard appName="calculadora-algebra-booleana" />
      <Footer appName="calculadora-algebra-booleana" />
    </div>
  );
}
