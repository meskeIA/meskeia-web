'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './CalculadoraAlgebraBooleana.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type NumVariables = 2 | 3 | 4;
type OutputMode = 'sop' | 'pos';

interface KarnaughGroup {
  cells: number[];
  term: string;
  color: string;
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

  // Obtener mintérminos (donde f=1) y don't cares (donde f=X)
  const minterms = useMemo(() =>
    truthTable.map((v, i) => v === 1 ? i : -1).filter(i => i !== -1),
    [truthTable]
  );

  const dontCares = useMemo(() =>
    truthTable.map((v, i) => v === 'X' ? i : -1).filter(i => i !== -1),
    [truthTable]
  );

  // Algoritmo de Quine-McCluskey simplificado para encontrar grupos
  const findKarnaughGroups = useCallback((
    terms: number[],
    dontCareTerms: number[],
    numVars: number,
    mode: OutputMode
  ): KarnaughGroup[] => {
    // Para POS, trabajamos con maxtérminos (donde f=0)
    const allTerms = mode === 'sop'
      ? [...terms, ...dontCareTerms]
      : [...truthTable.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1), ...dontCareTerms];

    const primaryTerms = mode === 'sop' ? terms :
      truthTable.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1);

    if (primaryTerms.length === 0) return [];

    const groups: KarnaughGroup[] = [];
    const totalCells = Math.pow(2, numVars);

    // Verificar si todos son 1 o todos son 0
    if (allTerms.length === totalCells) {
      return [{
        cells: primaryTerms,
        term: mode === 'sop' ? '1' : '0',
        color: GROUP_COLORS[0]
      }];
    }

    // Encontrar grupos de potencia de 2 (1, 2, 4, 8, 16)
    const covered = new Set<number>();
    const possibleGroupSizes = [16, 8, 4, 2, 1].filter(s => s <= totalCells);

    for (const size of possibleGroupSizes) {
      if (size > allTerms.length) continue;

      // Generar todas las combinaciones posibles de grupos de este tamaño
      const groupCandidates = findValidGroups(allTerms, size, numVars);

      for (const candidate of groupCandidates) {
        // Verificar si este grupo cubre algún término primario no cubierto
        const uncoveredPrimary = candidate.filter(c =>
          primaryTerms.includes(c) && !covered.has(c)
        );

        if (uncoveredPrimary.length > 0) {
          // Generar el término simplificado
          const term = generateTerm(candidate, numVars, variableNames, mode);
          groups.push({
            cells: candidate.filter(c => primaryTerms.includes(c)),
            term,
            color: GROUP_COLORS[groups.length % GROUP_COLORS.length]
          });

          // Marcar como cubiertos
          candidate.forEach(c => {
            if (primaryTerms.includes(c)) covered.add(c);
          });
        }
      }
    }

    return groups;
  }, [truthTable, variableNames]);

  // Encontrar grupos válidos de un tamaño específico
  const findValidGroups = (terms: number[], size: number, numVars: number): number[][] => {
    const results: number[][] = [];
    const totalCells = Math.pow(2, numVars);

    // Para cada celda como punto de partida
    for (let start = 0; start < totalCells; start++) {
      // Generar grupos válidos que incluyan esta celda
      const groupsFromHere = generateGroupsFromCell(start, size, numVars, terms);
      results.push(...groupsFromHere);
    }

    // Eliminar duplicados
    const unique = results.filter((group, index) => {
      const sorted = [...group].sort((a, b) => a - b).join(',');
      return index === results.findIndex(g =>
        [...g].sort((a, b) => a - b).join(',') === sorted
      );
    });

    return unique;
  };

  // Generar grupos válidos desde una celda
  const generateGroupsFromCell = (
    start: number,
    size: number,
    numVars: number,
    validTerms: number[]
  ): number[][] => {
    const results: number[][] = [];

    // Los grupos válidos en Karnaugh son hipercubos (varían en ciertos bits)
    // Para un grupo de tamaño 2^k, debemos variar k bits
    const bitsToVary = Math.log2(size);
    if (!Number.isInteger(bitsToVary)) return [];

    // Generar todas las combinaciones de bits a variar
    const bitCombinations = getCombinations(numVars, bitsToVary);

    for (const bits of bitCombinations) {
      const group = generateGroupFromBits(start, bits, numVars);

      // Verificar que todos los miembros del grupo estén en los términos válidos
      if (group.every(cell => validTerms.includes(cell))) {
        results.push(group);
      }
    }

    return results;
  };

  // Generar grupo variando bits específicos
  const generateGroupFromBits = (base: number, bitsToVary: number[], numVars: number): number[] => {
    const size = Math.pow(2, bitsToVary.length);
    const group: number[] = [];

    for (let i = 0; i < size; i++) {
      let cell = base;
      for (let j = 0; j < bitsToVary.length; j++) {
        const bit = bitsToVary[j];
        const bitValue = (i >> j) & 1;
        if (bitValue === 1) {
          cell ^= (1 << (numVars - 1 - bit)); // Toggle bit
        } else {
          cell &= ~(1 << (numVars - 1 - bit)); // Clear bit
          cell |= ((base >> (numVars - 1 - bit)) & 1) << (numVars - 1 - bit); // Restore original
        }
      }
      // Recalcular celda correctamente
      cell = base;
      for (let j = 0; j < bitsToVary.length; j++) {
        const bit = bitsToVary[j];
        const bitValue = (i >> j) & 1;
        // Set or clear the bit
        cell = (cell & ~(1 << (numVars - 1 - bit))) | (bitValue << (numVars - 1 - bit));
      }
      if (!group.includes(cell)) {
        group.push(cell);
      }
    }

    return group;
  };

  // Obtener combinaciones de k elementos de n
  const getCombinations = (n: number, k: number): number[][] => {
    const result: number[][] = [];
    const combine = (start: number, combo: number[]) => {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < n; i++) {
        combo.push(i);
        combine(i + 1, combo);
        combo.pop();
      }
    };
    combine(0, []);
    return result;
  };

  // Generar término algebraico desde un grupo
  const generateTerm = (
    cells: number[],
    numVars: number,
    varNames: string[],
    mode: OutputMode
  ): string => {
    if (cells.length === 0) return mode === 'sop' ? '0' : '1';
    if (cells.length === Math.pow(2, numVars)) return mode === 'sop' ? '1' : '0';

    // Encontrar qué bits son constantes en el grupo
    const constantBits: { bit: number; value: number }[] = [];

    for (let bit = 0; bit < numVars; bit++) {
      const bitValues = cells.map(c => (c >> (numVars - 1 - bit)) & 1);
      const allSame = bitValues.every(v => v === bitValues[0]);
      if (allSame) {
        constantBits.push({ bit, value: bitValues[0] });
      }
    }

    if (constantBits.length === 0) return mode === 'sop' ? '1' : '0';

    if (mode === 'sop') {
      // SOP: producto de literales
      return constantBits.map(({ bit, value }) =>
        value === 1 ? varNames[bit] : `${varNames[bit]}'`
      ).join('');
    } else {
      // POS: suma de literales (complementados)
      return '(' + constantBits.map(({ bit, value }) =>
        value === 0 ? varNames[bit] : `${varNames[bit]}'`
      ).join(' + ') + ')';
    }
  };

  // Calcular grupos de Karnaugh
  const karnaughGroups = useMemo(() =>
    findKarnaughGroups(minterms, dontCares, numVariables, outputMode),
    [minterms, dontCares, numVariables, outputMode, findKarnaughGroups]
  );

  // Expresión simplificada final
  const simplifiedExpression = useMemo(() => {
    if (karnaughGroups.length === 0) {
      return outputMode === 'sop' ? 'F = 0' : 'F = 1';
    }

    const terms = karnaughGroups.map(g => g.term);

    if (outputMode === 'sop') {
      if (terms.includes('1')) return 'F = 1';
      return `F = ${terms.join(' + ')}`;
    } else {
      if (terms.includes('0')) return 'F = 0';
      return `F = ${terms.join('')}`;
    }
  }, [karnaughGroups, outputMode]);

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
        <span className={styles.heroIcon}>🔢</span>
        <h1 className={styles.title}>Calculadora de Álgebra Booleana</h1>
        <p className={styles.subtitle}>
          Simplifica expresiones booleanas con mapas de Karnaugh
        </p>
      </header>

      {/* Configuración */}
      <section className={styles.configSection}>
        <h2 className={styles.sectionTitle}>Configuración</h2>

        <div className={styles.configRow}>
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Número de Variables</label>
            <div className={styles.variableSelector}>
              {([2, 3, 4] as NumVariables[]).map(num => (
                <button
                  key={num}
                  className={`${styles.variableBtn} ${numVariables === num ? styles.variableBtnActive : ''}`}
                  onClick={() => handleNumVariablesChange(num)}
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
                className={`${styles.modeBtn} ${outputMode === 'sop' ? styles.modeBtnActive : ''}`}
                onClick={() => setOutputMode('sop')}
              >
                SOP
                <span className={styles.modeDesc}>Suma de Productos</span>
              </button>
              <button
                className={`${styles.modeBtn} ${outputMode === 'pos' ? styles.modeBtnActive : ''}`}
                onClick={() => setOutputMode('pos')}
              >
                POS
                <span className={styles.modeDesc}>Producto de Sumas</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.examplesRow}>
          <span className={styles.examplesLabel}>Ejemplos:</span>
          <button className={styles.exampleBtn} onClick={() => loadExample('xor')}>
            XOR (2 vars)
          </button>
          <button className={styles.exampleBtn} onClick={() => loadExample('majority')}>
            Mayoría (3 vars)
          </button>
          <button className={styles.exampleBtn} onClick={() => loadExample('bcd')}>
            BCD inválido (4 vars)
          </button>
          <button className={styles.exampleBtn} onClick={() => loadExample('parity')}>
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
          <p className={styles.hint}>Los grupos coloreados muestran las agrupaciones óptimas</p>

          {renderKarnaughMap()}

          {/* Leyenda de grupos */}
          {karnaughGroups.length > 0 && (
            <div className={styles.groupsLegend}>
              <h4>Grupos encontrados:</h4>
              <div className={styles.groupsList}>
                {karnaughGroups.map((group, i) => (
                  <div key={i} className={styles.groupItem}>
                    <span
                      className={styles.groupColor}
                      style={{ backgroundColor: group.color }}
                    ></span>
                    <span className={styles.groupTerm}>{group.term}</span>
                    <span className={styles.groupCells}>
                      [{group.cells.join(', ')}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Resultado */}
      <section className={styles.resultSection}>
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
          </div>
        </div>

        {/* Pasos detallados */}
        <div className={styles.stepsSection}>
          <button
            className={styles.stepsToggle}
            onClick={() => setShowSteps(!showSteps)}
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
                  : `Maxtérminos: M(${truthTable.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1).join(', ')})${dontCares.length > 0 ? ` + d(${dontCares.join(', ')})` : ''}`
                }
              </div>

              <div className={styles.step}>
                <strong>Paso 2:</strong> Agrupar celdas adyacentes en potencias de 2
                <br />
                {karnaughGroups.length > 0
                  ? karnaughGroups.map((g, i) => `Grupo ${i + 1}: celdas [${g.cells.join(', ')}] → ${g.term}`).join('\n')
                  : 'No hay grupos que formar'
                }
              </div>

              <div className={styles.step}>
                <strong>Paso 3:</strong> Generar expresión {outputMode === 'sop' ? 'SOP' : 'POS'}
                <br />
                {simplifiedExpression}
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
        <div className={styles.guideSection}>
          <h2>¿Qué es el Álgebra Booleana?</h2>
          <p>
            El álgebra booleana es un sistema matemático que trabaja con valores binarios
            (verdadero/falso, 1/0). Fue desarrollada por George Boole en 1854 y es
            fundamental en el diseño de circuitos digitales y programación.
          </p>

          <h3>Mapas de Karnaugh</h3>
          <p>
            Los mapas de Karnaugh (K-maps) son una herramienta gráfica para simplificar
            funciones booleanas. Fueron introducidos por Maurice Karnaugh en 1953 como
            una alternativa visual al método algebraico y al algoritmo Quine-McCluskey.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Código Gray</h4>
              <p>
                Las filas y columnas del mapa usan código Gray (solo un bit cambia entre
                celdas adyacentes). Esto permite que las celdas vecinas difieran en solo
                una variable, facilitando la agrupación.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Aplicaciones</h4>
              <p>
                Simplificación de circuitos digitales, diseño de PLDs (Programmable Logic
                Devices), optimización de código en compiladores, y diseño de máquinas de
                estados finitos.
              </p>
            </div>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-algebra-booleana')} />
      <Footer appName="calculadora-algebra-booleana" />
    </div>
  );
}
