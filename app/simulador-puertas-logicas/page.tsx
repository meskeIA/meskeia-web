'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './SimuladorPuertasLogicas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { evaluarExpresion, extraerVariables, MAX_VARIABLES } from './motor';
import { RETOS, corregirIntento, type Correccion } from './motor-retos';

// ============================================
// TIPOS
// ============================================
type SimulatorMode = 'tablas' | 'circuitos' | 'expresiones' | 'retos';
type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';
type CircuitType = 'halfAdder' | 'fullAdder' | 'mux2to1' | 'comparador' | 'decoder2to4';

interface GateInfo {
  name: string;
  symbol: string;
  inputs: number;
  description: string;
  expression: string;
}

interface CircuitInfo {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  compute: (inputs: boolean[]) => boolean[];
}

// ============================================
// DATOS DE PUERTAS LÓGICAS
// ============================================
const GATES: Record<GateType, GateInfo> = {
  AND: {
    name: 'AND',
    symbol: '∧',
    inputs: 2,
    description: 'Salida 1 solo si TODAS las entradas son 1',
    expression: 'Y = A · B'
  },
  OR: {
    name: 'OR',
    symbol: '∨',
    inputs: 2,
    description: 'Salida 1 si AL MENOS UNA entrada es 1',
    expression: 'Y = A + B'
  },
  NOT: {
    name: 'NOT',
    symbol: '¬',
    inputs: 1,
    description: 'Invierte la entrada: 0→1, 1→0',
    expression: 'Y = Ā'
  },
  NAND: {
    name: 'NAND',
    symbol: '⊼',
    inputs: 2,
    description: 'AND negado: salida 0 solo si ambas son 1',
    expression: 'Y = (A · B)̄'
  },
  NOR: {
    name: 'NOR',
    symbol: '⊽',
    inputs: 2,
    description: 'OR negado: salida 1 solo si ambas son 0',
    expression: 'Y = (A + B)̄'
  },
  XOR: {
    name: 'XOR',
    symbol: '⊕',
    inputs: 2,
    description: 'Salida 1 si las entradas son DIFERENTES',
    expression: 'Y = A ⊕ B'
  },
  XNOR: {
    name: 'XNOR',
    symbol: '⊙',
    inputs: 2,
    description: 'Salida 1 si las entradas son IGUALES',
    expression: 'Y = A ⊙ B'
  }
};

// ============================================
// FUNCIONES DE PUERTAS
// ============================================
const gateFunction = (gate: GateType, a: boolean, b: boolean = false): boolean => {
  switch (gate) {
    case 'AND': return a && b;
    case 'OR': return a || b;
    case 'NOT': return !a;
    case 'NAND': return !(a && b);
    case 'NOR': return !(a || b);
    case 'XOR': return a !== b;
    case 'XNOR': return a === b;
    default: return false;
  }
};

// ============================================
// CIRCUITOS PREDEFINIDOS
// ============================================
const CIRCUITS: Record<CircuitType, CircuitInfo> = {
  halfAdder: {
    name: 'Half Adder (Semisumador)',
    description: 'Suma dos bits. S = A XOR B, C = A AND B',
    inputs: ['A', 'B'],
    outputs: ['S (Suma)', 'C (Acarreo)'],
    compute: ([a, b]) => [a !== b, a && b]
  },
  fullAdder: {
    name: 'Full Adder (Sumador Completo)',
    description: 'Suma dos bits + acarreo de entrada',
    inputs: ['A', 'B', 'Cin'],
    outputs: ['S (Suma)', 'Cout (Acarreo)'],
    compute: ([a, b, cin]) => {
      const sum = (a !== b) !== cin;
      const cout = (a && b) || (cin && (a !== b));
      return [sum, cout];
    }
  },
  mux2to1: {
    name: 'Multiplexor 2:1',
    description: 'Selecciona entre D0 y D1 según S',
    inputs: ['D0', 'D1', 'S (Select)'],
    outputs: ['Y'],
    compute: ([d0, d1, s]) => [s ? d1 : d0]
  },
  comparador: {
    name: 'Comparador 1-bit',
    description: 'Compara dos bits A y B',
    inputs: ['A', 'B'],
    outputs: ['A > B', 'A = B', 'A < B'],
    compute: ([a, b]) => [a && !b, a === b, !a && b]
  },
  decoder2to4: {
    name: 'Decodificador 2:4',
    description: 'Activa una de 4 salidas según entrada binaria',
    // A1 va PRIMERO: es el bit más significativo del número decodificado (índice = 2·A1 + A0),
    // y la tabla se enumera de izquierda a derecha empezando por el MSB. Con A0 delante, la
    // diagonal salía Y0·Y2·Y1·Y3 y parecía rota (hallazgo 140).
    inputs: ['A1', 'A0'],
    outputs: ['Y0', 'Y1', 'Y2', 'Y3'],
    compute: ([a1, a0]) => {
      const index = (a1 ? 2 : 0) + (a0 ? 1 : 0);
      return [index === 0, index === 1, index === 2, index === 3];
    }
  }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorPuertasLogicasPage() {
  const [mode, setMode] = useState<SimulatorMode>('tablas');
  const [selectedGate, setSelectedGate] = useState<GateType>('AND');
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitType>('halfAdder');
  const [circuitInputs, setCircuitInputs] = useState<boolean[]>([false, false, false, false]);
  const [expression, setExpression] = useState('(A AND B) OR (NOT C)');

  // Modo 4: retos. `intento` es lo que el usuario escribe; `correccion` solo aparece
  // cuando pulsa Comprobar, para que la tabla no vaya cambiando mientras teclea.
  const [retoIndice, setRetoIndice] = useState(0);
  const [intento, setIntento] = useState('');
  const [correccion, setCorreccion] = useState<Correccion | null>(null);
  const [pistaVisible, setPistaVisible] = useState(false);
  const [solucionVisible, setSolucionVisible] = useState(false);
  const [resueltos, setResueltos] = useState<string[]>([]);

  // ============================================
  // MODO 1: TABLAS DE VERDAD
  // ============================================
  const truthTable = useMemo(() => {
    const gate = GATES[selectedGate];
    const rows: { inputs: boolean[]; output: boolean }[] = [];

    if (gate.inputs === 1) {
      rows.push({ inputs: [false], output: gateFunction(selectedGate, false) });
      rows.push({ inputs: [true], output: gateFunction(selectedGate, true) });
    } else {
      rows.push({ inputs: [false, false], output: gateFunction(selectedGate, false, false) });
      rows.push({ inputs: [false, true], output: gateFunction(selectedGate, false, true) });
      rows.push({ inputs: [true, false], output: gateFunction(selectedGate, true, false) });
      rows.push({ inputs: [true, true], output: gateFunction(selectedGate, true, true) });
    }

    return rows;
  }, [selectedGate]);

  // ============================================
  // MODO 2: CIRCUITOS
  // ============================================
  const circuitOutputs = useMemo(() => {
    const circuit = CIRCUITS[selectedCircuit];
    const inputs = circuitInputs.slice(0, circuit.inputs.length);
    return circuit.compute(inputs);
  }, [selectedCircuit, circuitInputs]);

  const toggleCircuitInput = (index: number) => {
    const newInputs = [...circuitInputs];
    newInputs[index] = !newInputs[index];
    setCircuitInputs(newInputs);
  };

  // ============================================
  // MODO 3: EXPRESIONES
  // ============================================
  const analisisExpresion = useMemo(() => extraerVariables(expression), [expression]);
  const expressionVariables = analisisExpresion.ok ? analisisExpresion.variables : [];

  /**
   * La tabla y el error se calculan JUNTOS y sin efectos secundarios.
   *
   * Antes el error se escribía con setExpressionError DENTRO del useMemo —un efecto durante
   * el render— y el fallo real se perdía en un `catch` que devolvía una columna de ceros.
   * Ahora, si la expresión no se entiende, lo que sale es el motivo.
   */
  const resultadoExpresion = useMemo((): { filas: { inputs: boolean[]; output: boolean }[]; error: string } => {
    if (!expression.trim()) return { filas: [], error: '' };
    if (!analisisExpresion.ok) return { filas: [], error: analisisExpresion.error };
    if (analisisExpresion.variables.length === 0) return { filas: [], error: '' };

    const vars = analisisExpresion.variables;
    const filas: { inputs: boolean[]; output: boolean }[] = [];

    for (let i = 0; i < Math.pow(2, vars.length); i++) {
      const inputs: boolean[] = [];
      const variables: Record<string, boolean> = {};
      for (let j = 0; j < vars.length; j++) {
        const value = Boolean((i >> (vars.length - 1 - j)) & 1);
        inputs.push(value);
        variables[vars[j]] = value;
      }
      const r = evaluarExpresion(expression, variables);
      if (!r.ok) return { filas: [], error: r.error };
      filas.push({ inputs, output: r.valor });
    }

    return { filas, error: '' };
  }, [expression, analisisExpresion]);

  const expressionTruthTable = resultadoExpresion.filas;

  // ============================================
  // MODO 4: RETOS
  // ============================================
  const retoActual = RETOS[retoIndice];

  const comprobarIntento = () => {
    const resultado = corregirIntento(intento, retoActual);
    setCorreccion(resultado);
    if (resultado.resuelto && !resueltos.includes(retoActual.id)) {
      setResueltos([...resueltos, retoActual.id]);
    }
  };

  const irAReto = (indice: number) => {
    setRetoIndice(indice);
    setIntento('');
    setCorreccion(null);
    setPistaVisible(false);
    setSolucionVisible(false);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Puertas y Compuertas Lógicas</h1>
        <p className={styles.subtitle}>
          Tablas de verdad, circuitos digitales y expresiones booleanas. Puertas
          lógicas (también llamadas <strong>compuertas lógicas</strong>): AND, OR,
          NOT, NAND, NOR, XOR y XNOR.
        </p>
      </header>

      <LegalNotice />

      {/* Mode Selector */}
      <div className={styles.modeSelector}>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'tablas' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('tablas')}
          aria-pressed={mode === 'tablas'}
        >
          <span className={styles.modeIcon} aria-hidden="true">📊</span>
          <span className={styles.modeName}>Tablas de Verdad</span>
          <span className={styles.modeDesc}>7 puertas lógicas</span>
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'circuitos' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('circuitos')}
          aria-pressed={mode === 'circuitos'}
        >
          <span className={styles.modeIcon} aria-hidden="true">🔌</span>
          <span className={styles.modeName}>Circuitos</span>
          <span className={styles.modeDesc}>Simulación interactiva</span>
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'expresiones' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('expresiones')}
          aria-pressed={mode === 'expresiones'}
        >
          <span className={styles.modeIcon} aria-hidden="true">🧮</span>
          <span className={styles.modeName}>Expresiones</span>
          <span className={styles.modeDesc}>Álgebra booleana</span>
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'retos' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('retos')}
          aria-pressed={mode === 'retos'}
        >
          <span className={styles.modeIcon} aria-hidden="true">🎯</span>
          <span className={styles.modeName}>Retos</span>
          <span className={styles.modeDesc}>{RETOS.length} ejercicios</span>
        </button>
      </div>

      {/* ============================================ */}
      {/* MODO 1: TABLAS DE VERDAD */}
      {/* ============================================ */}
      {mode === 'tablas' && (
        <div className={styles.mainContent}>
          {/* Selector de puerta */}
          <div className={styles.gateSelector}>
            {(Object.keys(GATES) as GateType[]).map((gate) => (
              <button
                key={gate}
                type="button"
                className={`${styles.gateBtn} ${selectedGate === gate ? styles.gateBtnActive : ''}`}
                onClick={() => setSelectedGate(gate)}
                aria-pressed={selectedGate === gate}
              >
                <span className={styles.gateSymbol}>{GATES[gate].symbol}</span>
                <span className={styles.gateName}>{gate}</span>
              </button>
            ))}
          </div>

          {/* Info de la puerta */}
          <div className={styles.gateInfo}>
            <div className={styles.gateInfoHeader}>
              <span className={styles.gateInfoSymbol}>{GATES[selectedGate].symbol}</span>
              <div>
                <h3>Puerta {GATES[selectedGate].name}</h3>
                <p className={styles.gateExpression}>{GATES[selectedGate].expression}</p>
              </div>
            </div>
            <p className={styles.gateDescription}>{GATES[selectedGate].description}</p>
          </div>

          {/* Tabla de verdad */}
          <div className={styles.truthTableContainer}>
            <h3>Tabla de Verdad</h3>
            <table className={styles.truthTable}>
              <thead>
                <tr>
                  <th>A</th>
                  {GATES[selectedGate].inputs === 2 && <th>B</th>}
                  <th className={styles.outputHeader}>Y</th>
                </tr>
              </thead>
              <tbody>
                {truthTable.map((row, idx) => (
                  <tr key={idx}>
                    <td className={row.inputs[0] ? styles.cellOne : styles.cellZero}>
                      {row.inputs[0] ? '1' : '0'}
                    </td>
                    {GATES[selectedGate].inputs === 2 && (
                      <td className={row.inputs[1] ? styles.cellOne : styles.cellZero}>
                        {row.inputs[1] ? '1' : '0'}
                      </td>
                    )}
                    <td className={`${styles.outputCell} ${row.output ? styles.cellOne : styles.cellZero}`}>
                      {row.output ? '1' : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Diagrama de la puerta */}
          <div className={styles.gateDiagram}>
            <h3>Símbolo</h3>
            <div className={styles.diagramContainer}>
              <svg viewBox="0 0 200 100" className={styles.gateSvg}>
                {/* Inputs */}
                <line x1="10" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="2" />
                {GATES[selectedGate].inputs === 2 && (
                  <line x1="10" y1="70" x2="50" y2="70" stroke="currentColor" strokeWidth="2" />
                )}
                <text x="5" y="35" className={styles.svgText}>A</text>
                {GATES[selectedGate].inputs === 2 && (
                  <text x="5" y="75" className={styles.svgText}>B</text>
                )}

                {/* Gate body */}
                {selectedGate === 'NOT' ? (
                  <>
                    <polygon points="50,15 50,85 120,50" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="125" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </>
                ) : selectedGate === 'AND' || selectedGate === 'NAND' ? (
                  <>
                    <path d="M50,20 L90,20 A30,30 0 0,1 90,80 L50,80 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                    {selectedGate === 'NAND' && (
                      <circle cx="125" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
                    )}
                  </>
                ) : selectedGate === 'OR' || selectedGate === 'NOR' ? (
                  <>
                    <path d="M50,20 Q70,50 50,80 Q100,80 120,50 Q100,20 50,20" fill="none" stroke="currentColor" strokeWidth="2" />
                    {selectedGate === 'NOR' && (
                      <circle cx="125" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
                    )}
                  </>
                ) : (
                  <>
                    <path d="M50,20 Q70,50 50,80 Q100,80 120,50 Q100,20 50,20" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M45,30 Q55,50 45,70" fill="none" stroke="currentColor" strokeWidth="2" />
                    {selectedGate === 'XNOR' && (
                      <circle cx="125" cy="50" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
                    )}
                  </>
                )}

                {/* Output */}
                <line x1={selectedGate === 'NOT' || selectedGate === 'NAND' || selectedGate === 'NOR' || selectedGate === 'XNOR' ? "130" : "120"} y1="50" x2="190" y2="50" stroke="currentColor" strokeWidth="2" />
                <text x="185" y="45" className={styles.svgText}>Y</text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODO 2: CIRCUITOS */}
      {/* ============================================ */}
      {mode === 'circuitos' && (
        <div className={styles.mainContent}>
          {/* Selector de circuito */}
          <div className={styles.circuitSelector}>
            {(Object.keys(CIRCUITS) as CircuitType[]).map((circuit) => (
              <button
                key={circuit}
                type="button"
                aria-pressed={selectedCircuit === circuit}
                className={`${styles.circuitBtn} ${selectedCircuit === circuit ? styles.circuitBtnActive : ''}`}
                onClick={() => {
                  setSelectedCircuit(circuit);
                  setCircuitInputs([false, false, false, false]);
                }}
              >
                <span className={styles.circuitName}>{CIRCUITS[circuit].name}</span>
              </button>
            ))}
          </div>

          {/* Info del circuito */}
          <div className={styles.circuitInfo}>
            <h3>{CIRCUITS[selectedCircuit].name}</h3>
            <p>{CIRCUITS[selectedCircuit].description}</p>
          </div>

          {/* Panel interactivo */}
          <div className={styles.circuitPanel}>
            {/* Entradas */}
            <div className={styles.ioSection}>
              <h4>Entradas</h4>
              <div className={styles.ioGrid}>
                {CIRCUITS[selectedCircuit].inputs.map((input, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-pressed={circuitInputs[idx]}
                    className={`${styles.ioSwitch} ${circuitInputs[idx] ? styles.ioSwitchOn : ''}`}
                    onClick={() => toggleCircuitInput(idx)}
                  >
                    <span className={styles.ioLabel}>{input}</span>
                    <span className={styles.ioValue}>{circuitInputs[idx] ? '1' : '0'}</span>
                    <span className={styles.ioIndicator} aria-hidden="true">{circuitInputs[idx] ? '🟢' : '⚫'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flecha — decorativa: separa entradas de salidas y no aporta información
                que no esté ya en los rótulos, así que se oculta a la ayuda técnica */}
            <div className={styles.arrowContainer} aria-hidden="true">
              <span className={styles.arrow}>→</span>
            </div>

            {/* Salidas */}
            <div className={styles.ioSection}>
              <h4>Salidas</h4>
              <div className={styles.ioGrid}>
                {CIRCUITS[selectedCircuit].outputs.map((output, idx) => (
                  // role="status" + aria-live: al conmutar una entrada, la salida CAMBIA, y
                  // eso es justo lo que enseña este modo. Sin anunciarlo, quien no ve la
                  // pantalla no se entera de lo único que ocurre (hallazgo 139).
                  <div
                    key={idx}
                    className={`${styles.ioLed} ${circuitOutputs[idx] ? styles.ioLedOn : ''}`}
                    role="status"
                    aria-live="polite"
                  >
                    <span className={styles.ioLabel}>{output}</span>
                    <span className={styles.ioValue}>{circuitOutputs[idx] ? '1' : '0'}</span>
                    <span className={styles.ioIndicator} aria-hidden="true">{circuitOutputs[idx] ? '🔴' : '⚫'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla completa del circuito */}
          <div className={styles.circuitTableContainer}>
            <h4>Tabla Completa</h4>
            <table className={styles.truthTable}>
              <thead>
                <tr>
                  {/* Sin recortar por el primer espacio: en el comparador 1-bit eso convertía
                      «A > B», «A = B» y «A < B» en tres columnas llamadas «A» (hallazgo 137). */}
                  {CIRCUITS[selectedCircuit].inputs.map((input, idx) => (
                    <th key={idx}>{input}</th>
                  ))}
                  {CIRCUITS[selectedCircuit].outputs.map((output, idx) => (
                    <th key={idx} className={styles.outputHeader}>{output}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.pow(2, CIRCUITS[selectedCircuit].inputs.length) }).map((_, rowIdx) => {
                  const inputs: boolean[] = [];
                  for (let j = 0; j < CIRCUITS[selectedCircuit].inputs.length; j++) {
                    inputs.push(Boolean((rowIdx >> (CIRCUITS[selectedCircuit].inputs.length - 1 - j)) & 1));
                  }
                  const outputs = CIRCUITS[selectedCircuit].compute(inputs);
                  const isCurrentRow = inputs.every((v, i) => v === circuitInputs[i]);

                  return (
                    <tr key={rowIdx} className={isCurrentRow ? styles.currentRow : ''}>
                      {inputs.map((input, idx) => (
                        <td key={idx} className={input ? styles.cellOne : styles.cellZero}>
                          {input ? '1' : '0'}
                        </td>
                      ))}
                      {outputs.map((output, idx) => (
                        <td key={idx} className={`${styles.outputCell} ${output ? styles.cellOne : styles.cellZero}`}>
                          {output ? '1' : '0'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODO 3: EXPRESIONES */}
      {/* ============================================ */}
      {mode === 'expresiones' && (
        <div className={styles.mainContent}>
          {/* Input de expresión */}
          <div className={styles.expressionInput}>
            <label htmlFor="expression">Expresión Booleana</label>
            <input
              id="expression"
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="Ej: (A AND B) OR (NOT C)"
              className={styles.expressionField}
            />
            {resultadoExpresion.error && (
              <p className={styles.expressionError} role="alert">{resultadoExpresion.error}</p>
            )}
          </div>

          {/* Ayuda de sintaxis */}
          <div className={styles.syntaxHelp}>
            <h4>Sintaxis válida</h4>
            <div className={styles.syntaxGrid}>
              <div className={styles.syntaxItem}>
                <code>AND</code> o <code>·</code> o <code>∧</code>
              </div>
              <div className={styles.syntaxItem}>
                <code>OR</code> o <code>+</code> o <code>∨</code>
              </div>
              <div className={styles.syntaxItem}>
                <code>NOT</code> o <code>¬</code>
              </div>
              <div className={styles.syntaxItem}>
                <code>XOR</code> o <code>⊕</code>
              </div>
              <div className={styles.syntaxItem}>
                <code>(</code> <code>)</code> para agrupar
              </div>
              <div className={styles.syntaxItem}>
                Variables: <code>A</code> a <code>D</code>
              </div>
            </div>
          </div>

          {/* Ejemplos rápidos */}
          <div className={styles.examplesSection}>
            <h4>Ejemplos</h4>
            <div className={styles.examplesGrid}>
              <button type="button" onClick={() => setExpression('A AND B')} className={styles.exampleBtn}>
                A AND B
              </button>
              <button type="button" onClick={() => setExpression('A OR B')} className={styles.exampleBtn}>
                A OR B
              </button>
              <button type="button" onClick={() => setExpression('NOT A')} className={styles.exampleBtn}>
                NOT A
              </button>
              <button type="button" onClick={() => setExpression('(A AND B) OR C')} className={styles.exampleBtn}>
                (A AND B) OR C
              </button>
              <button type="button" onClick={() => setExpression('A XOR B')} className={styles.exampleBtn}>
                A XOR B
              </button>
              <button type="button" onClick={() => setExpression('NOT (A OR B)')} className={styles.exampleBtn}>
                NOT (A OR B)
              </button>
              <button type="button" onClick={() => setExpression('(A AND B) OR (C AND D)')} className={styles.exampleBtn}>
                (A·B) + (C·D)
              </button>
              <button type="button" onClick={() => setExpression('(NOT A) AND (NOT B)')} className={styles.exampleBtn}>
                Ā · B̄
              </button>
            </div>
          </div>

          {/* Tabla de verdad de la expresión */}
          {expressionTruthTable.length > 0 && (
            <div className={styles.truthTableContainer}>
              <h3>Tabla de Verdad: <code>{expression}</code></h3>
              <table className={styles.truthTable}>
                <thead>
                  <tr>
                    {expressionVariables.map((v) => (
                      <th key={v}>{v}</th>
                    ))}
                    <th className={styles.outputHeader}>Y</th>
                  </tr>
                </thead>
                <tbody>
                  {expressionTruthTable.map((row, idx) => (
                    <tr key={idx}>
                      {row.inputs.map((input, i) => (
                        <td key={i} className={input ? styles.cellOne : styles.cellZero}>
                          {input ? '1' : '0'}
                        </td>
                      ))}
                      <td className={`${styles.outputCell} ${row.output ? styles.cellOne : styles.cellZero}`}>
                        {row.output ? '1' : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* MODO 4: RETOS */}
      {/* ============================================ */}
      {mode === 'retos' && (
        <div className={styles.mainContent}>
          <div className={styles.retosIntro}>
            <h2 className={styles.retosTitulo}>Del enunciado al circuito</h2>
            <p>
              En los otros modos escribes un circuito y el simulador te dice qué hace.
              Aquí es al revés: te damos la tabla de verdad que tiene que salir y tú
              buscas la expresión que la produce, con los menos operadores posibles.
            </p>
            <p className={styles.retosProgreso}>
              Resueltos: <strong>{resueltos.length}</strong> de {RETOS.length}
            </p>
          </div>

          {/* Selector de reto */}
          <div className={styles.retosSelector}>
            {RETOS.map((reto, indice) => (
              <button
                key={reto.id}
                type="button"
                aria-pressed={indice === retoIndice}
                className={`${styles.retoBtn} ${indice === retoIndice ? styles.retoBtnActive : ''} ${resueltos.includes(reto.id) ? styles.retoBtnResuelto : ''}`}
                onClick={() => irAReto(indice)}
              >
                <span className={styles.retoBtnNumero}>{indice + 1}</span>
                <span className={styles.retoBtnNombre}>{reto.nombre}</span>
                {resueltos.includes(reto.id) && (
                  <span className={styles.retoBtnCheck} aria-label="resuelto">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Enunciado y tabla objetivo */}
          <div className={styles.retoPanel}>
            <div className={styles.retoEnunciado}>
              <h3>{retoActual.nombre}</h3>
              <p>{retoActual.enunciado}</p>
              {retoActual.permitidos && (
                <p className={styles.retoRestriccion}>
                  <span aria-hidden="true">🔒</span> Solo puedes usar:{' '}
                  <strong>{retoActual.permitidos.join(', ')}</strong>
                </p>
              )}
            </div>

            <div className={styles.retoTrabajo}>
            <div className={styles.retoObjetivo}>
              <h4>Tabla que debes conseguir</h4>
              <table className={styles.truthTable}>
                <thead>
                  <tr>
                    {retoActual.variables.map((v) => (
                      <th key={v}>{v}</th>
                    ))}
                    <th className={styles.outputHeader}>Y</th>
                  </tr>
                </thead>
                <tbody>
                  {retoActual.salidas.map((esperado, i) => {
                    const fila = correccion?.filas[i];
                    return (
                      <tr key={i} className={fila && !fila.acierta ? styles.filaFallo : ''}>
                        {retoActual.variables.map((v, j) => {
                          const bit = Boolean((i >> (retoActual.variables.length - 1 - j)) & 1);
                          return (
                            <td key={v} className={bit ? styles.cellOne : styles.cellZero}>
                              {bit ? '1' : '0'}
                            </td>
                          );
                        })}
                        <td className={`${styles.outputCell} ${esperado ? styles.cellOne : styles.cellZero}`}>
                          {esperado ? '1' : '0'}
                          {fila && !fila.acierta && (
                            <span className={styles.tuValor}> (tú: {fila.obtenido ? '1' : '0'})</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          {/* Intento */}
          <div className={styles.retoRespuesta}>
          <div className={styles.retoIntento}>
            <label htmlFor="intento-reto">Tu expresión</label>
            <div className={styles.retoIntentoFila}>
              <input
                id="intento-reto"
                type="text"
                value={intento}
                onChange={(e) => setIntento(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') comprobarIntento();
                }}
                placeholder={`Escribe usando ${retoActual.variables.join(', ')}`}
                className={styles.expressionField}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className={styles.btnComprobar}
                onClick={comprobarIntento}
                disabled={intento.trim().length === 0}
              >
                Comprobar
              </button>
            </div>
            <p className={styles.retoAyudaSintaxis}>
              Admite <code>AND</code>, <code>OR</code>, <code>NOT</code>, <code>XOR</code>,{' '}
              <code>NAND</code>, <code>NOR</code>, <code>XNOR</code>, los símbolos{' '}
              <code>·</code> <code>+</code> <code>!</code>, la prima <code>A&apos;</code> y el
              producto implícito <code>AB</code>.
            </p>
          </div>

          {/* Veredicto */}
          {correccion && (
            <div
              className={`${styles.retoVeredicto} ${
                correccion.resuelto
                  ? styles.veredictoOk
                  : correccion.valida
                    ? styles.veredictoFallo
                    : styles.veredictoError
              }`}
              role="status"
              aria-live="polite"
            >
              {!correccion.valida && (
                <p>
                  <strong>No se puede evaluar.</strong> {correccion.error}
                </p>
              )}

              {correccion.valida && !correccion.resuelto && (
                <p>
                  <strong>
                    Aciertas {correccion.aciertos} de {correccion.total} filas.
                  </strong>{' '}
                  Las que fallan están marcadas en la tabla, con el valor que da tu
                  expresión al lado del esperado.
                </p>
              )}

              {correccion.resuelto && (
                <>
                  <p>
                    <strong>Resuelto.</strong> Tu expresión produce la tabla completa con{' '}
                    {correccion.operadores}{' '}
                    {correccion.operadores === 1 ? 'operador' : 'operadores'}.
                  </p>
                  <p>
                    {correccion.operadores < retoActual.operadoresReferencia
                      ? `Nuestra solución de referencia usa ${retoActual.operadoresReferencia}: la tuya es más corta.`
                      : correccion.operadores === retoActual.operadoresReferencia
                        ? 'Es la misma longitud que nuestra solución de referencia.'
                        : `Nuestra solución de referencia lo consigue con ${retoActual.operadoresReferencia}. Se puede acortar.`}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Pista y solución */}
          <div className={styles.retoAyudas}>
            <button
              type="button"
              className={styles.btnAyuda}
              onClick={() => setPistaVisible(!pistaVisible)}
              aria-expanded={pistaVisible}
            >
              {pistaVisible ? 'Ocultar pista' : 'Ver pista'}
            </button>
            <button
              type="button"
              className={styles.btnAyuda}
              onClick={() => setSolucionVisible(!solucionVisible)}
              aria-expanded={solucionVisible}
            >
              {solucionVisible ? 'Ocultar solución' : 'Ver una solución'}
            </button>
          </div>

          {pistaVisible && (
            <div className={styles.retoPista}>
              <p>{retoActual.pista}</p>
            </div>
          )}

          {solucionVisible && (
            <div className={styles.retoSolucion}>
              <p>
                Una solución con {retoActual.operadoresReferencia}{' '}
                {retoActual.operadoresReferencia === 1 ? 'operador' : 'operadores'}:
              </p>
              <code className={styles.retoSolucionCodigo}>{retoActual.referencia}</code>
              <p className={styles.retoSolucionNota}>
                No es necesariamente la única ni la más corta posible: es la que usamos como
                referencia para comparar.
              </p>
            </div>
          )}

          </div>
            </div>
          </div>

          {/* Cómo se cuentan los operadores */}
          <div className={styles.retoNotaConteo}>
            <h4>Qué cuenta como operador</h4>
            <p>
              Cada operador que escribes suma uno, incluidos los <code>NOT</code>. Un circuito
              real puede necesitar menos puertas que operadores tenga la expresión, porque una
              señal intermedia se reparte a varias entradas: el XOR con NAND se escribe con
              cinco operadores y se construye con cuatro puertas, reutilizando{' '}
              <code>A NAND B</code> en dos sitios.
            </p>
          </div>
        </div>
      )}

      {/* Educational Section */}
      <EducationalSection
        title="Fundamentos de Lógica Digital"
        subtitle="Todo lo que necesitas saber sobre puertas lógicas (compuertas lógicas), álgebra de Boole y circuitos digitales"
        icon="🔌"
      >
        {/* Sección 1: Tabla Comparativa */}
        <section>
          <h3>Comparativa de las 7 Puertas Lógicas</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Puerta</th>
                  <th>Símbolo</th>
                  <th>Entradas</th>
                  <th>Expresión</th>
                  <th>Salida HIGH cuando...</th>
                  <th>Universal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>AND</strong></td>
                  <td>∧</td>
                  <td>2</td>
                  <td><code>Y = A·B</code></td>
                  <td>Todas las entradas son 1</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><strong>OR</strong></td>
                  <td>∨</td>
                  <td>2</td>
                  <td><code>Y = A+B</code></td>
                  <td>Al menos una entrada es 1</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><strong>NOT</strong></td>
                  <td>¬</td>
                  <td>1</td>
                  <td><code>Y = Ā</code></td>
                  <td>La entrada es 0</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><strong>NAND</strong></td>
                  <td>⊼</td>
                  <td>2</td>
                  <td><code>Y = (A·B)̄</code></td>
                  <td>No todas las entradas son 1</td>
                  <td><strong>Sí</strong></td>
                </tr>
                <tr>
                  <td><strong>NOR</strong></td>
                  <td>⊽</td>
                  <td>2</td>
                  <td><code>Y = (A+B)̄</code></td>
                  <td>Todas las entradas son 0</td>
                  <td><strong>Sí</strong></td>
                </tr>
                <tr>
                  <td><strong>XOR</strong></td>
                  <td>⊕</td>
                  <td>2</td>
                  <td><code>Y = A⊕B</code></td>
                  <td>Las entradas son diferentes</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><strong>XNOR</strong></td>
                  <td>⊙</td>
                  <td>2</td>
                  <td><code>Y = A⊙B</code></td>
                  <td>Las entradas son iguales</td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de Uso */}
        <section>
          <h3>Casos de Uso por Perfil</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <strong>Estudiante preuniversitario</strong>
              </div>
              <p className={styles.escenarioExample}>
                Examen tipo: &quot;Simplifica A·(A+B)&quot;. Usando el teorema de absorción: A·(A+B) = A·A + A·B = A + A·B = <strong>A</strong>. Resultado: una conexión directa sin puertas.
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> Memoriza las leyes De Morgan: NOT(A·B) = NOT(A)+NOT(B). Son las más preguntadas en exámenes preuniversitarios.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔬</span>
                <strong>Estudiante de ingeniería</strong>
              </div>
              <p className={styles.escenarioExample}>
                Diseñar un semisumador de 1 bit: puerta XOR para la suma (S = A⊕B) + puerta AND para el acarreo (C = A·B). <strong>Solo 2 puertas para sumar bits binarios.</strong>
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> Practica implementando cualquier función con solo puertas NAND. Es ejercicio estándar en arquitectura de computadores.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔧</span>
                <strong>Técnico en electrónica</strong>
              </div>
              <p className={styles.escenarioExample}>
                Detector de paridad para comunicaciones serie: <strong>3 puertas XOR en cascada</strong> detectan si el número de unos en 4 bits es par o impar. Usado en UART para verificar integridad de datos.
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> En diseño real, NAND y NOR son más eficientes en silicio. Los fabricantes de chips los usan como bloques constructivos básicos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💻</span>
                <strong>Diseñador de sistemas digitales</strong>
              </div>
              <p className={styles.escenarioExample}>
                Multiplexor 4:1 para seleccionar entre 4 fuentes de datos: 3 puertas AND (con señales de selección) + 1 puerta OR. <strong>Base de los buses de datos en microprocesadores.</strong>
              </p>
              <p className={styles.escenarioTip}>
                <span aria-hidden="true">💡</span> Entender la lógica subyacente permite optimizar el uso de LUTs en FPGAs y celdas estándar en ASICs.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section>
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Es lo mismo una puerta lógica que una compuerta lógica?</h4>
              <p>Sí, son <strong>el mismo componente</strong>: un circuito que recibe entradas binarias (0 y 1) y devuelve una salida según una operación lógica. La única diferencia es el término regional: en España se dice <strong>puerta lógica</strong> y en buena parte de Hispanoamérica (México, Colombia, Argentina...) se dice <strong>compuerta lógica</strong>. Ambas traducen el inglés <em>logic gate</em>.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Este simulador funciona igual con cualquiera de los dos nombres: las 7 puertas (o compuertas) AND, OR, NOT, NAND, NOR, XOR y XNOR son universales.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es el Álgebra de Boole y para qué sirve?</h4>
              <p>El Álgebra de Boole (1854) es el sistema matemático que describe los circuitos digitales. Trabaja con solo dos valores (0 y 1) y tres operaciones básicas (AND, OR, NOT). Permite simplificar expresiones lógicas para reducir el número de puertas y ahorrar coste, energía y espacio en silicio.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Las leyes fundamentales son conmutativa (A·B = B·A), asociativa y distributiva (A·(B+C) = A·B + A·C).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué NAND y NOR se llaman puertas universales?</h4>
              <p>Porque cualquier función lógica puede implementarse usando <strong>únicamente puertas NAND</strong> (o únicamente NOR). NOT(A) = A NAND A; AND(A,B) = NOT(A NAND B); OR(A,B) = (NOT A) NAND (NOT B). Los fabricantes de chips simplifican la producción usando una sola celda estándar.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> En FPGAs modernas, los &quot;Look-Up Tables&quot; (LUT) son la generalización de este concepto: una tabla de memoria que implementa cualquier función booleana.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es una tabla de verdad y cómo se construye?</h4>
              <p>Una tabla de verdad lista todas las combinaciones posibles de entradas (2<sup>n</sup> filas para n entradas) y la salida correspondiente. Para 2 entradas: 4 filas (00, 01, 10, 11). Para 3 entradas: 8 filas. Para 10 entradas: 1.024 filas.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Construye siempre las entradas en orden binario natural (de 0 a 2^n-1) para no omitir ninguna combinación.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre XOR y XNOR?</h4>
              <p>XOR da salida 1 cuando las entradas son <strong>DIFERENTES</strong>. XNOR da 1 cuando son <strong>IGUALES</strong>. Son complementarias: si A XOR B = Y, entonces A XNOR B = NOT(Y). XOR se usa en sumadores y detectores de paridad; XNOR en comparadores de igualdad.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> XOR detecta si el número de unos en la entrada es impar. Concatenando XORs se construyen generadores/verificadores de paridad.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo se aplican las Leyes de De Morgan?</h4>
              <p>Primera ley: <strong>NOT(A AND B) = NOT(A) OR NOT(B)</strong>. Segunda ley: <strong>NOT(A OR B) = NOT(A) AND NOT(B)</strong>. Permiten convertir NAND en OR con entradas negadas y NOR en AND con entradas negadas. Son esenciales para simplificar circuitos.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Para aplicar De Morgan: 1) Niega toda la expresión, 2) Cambia AND por OR (o viceversa), 3) Niega cada variable individual.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es una expresión en Forma Normal Canónica?</h4>
              <p>Existen dos formas: <strong>Suma de Minterms (SOP)</strong> y Producto de Maxterms (POS). SOP: para cada fila con salida 1, escribe el AND de variables y únelos con OR. Cualquier tabla de verdad puede expresarse en forma canónica.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> SOP es más intuitiva: lee las filas con salida 1, escribe el mintérmino para cada una y únelos con OR.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Para qué sirven los Mapas de Karnaugh?</h4>
              <p>Los K-Maps son un método <strong>gráfico</strong> para simplificar expresiones booleanas. Organizan la tabla de verdad en cuadrícula donde celdas adyacentes difieren en una variable (código Gray). Agrupando celdas con valor 1 en potencias de 2, se obtiene la expresión mínima.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Son muy eficientes para hasta 4-5 variables. Para más, se usan algoritmos como Quine-McCluskey o herramientas EDA.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo se implementan las puertas en hardware real?</h4>
              <p>Las puertas lógicas se implementan con <strong>transistores CMOS</strong>. Una puerta NAND básica usa 4 transistores (2 NMOS en serie + 2 PMOS en paralelo). Los microprocesadores modernos tienen miles de millones de transistores operando a frecuencias de GHz.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> La tecnología CMOS domina porque solo consume energía durante las transiciones. Una puerta CMOS en reposo consume esencialmente cero potencia.</p>
            </div>
          </div>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section>
          <h3>Cómo resolver un problema de lógica digital paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Lee el enunciado e identifica entradas y salidas</strong>
                <p>Define claramente cuántas variables de entrada tienes (A, B, C...) y qué debe representar la salida. Ejemplo: &quot;alarma que se activa cuando A=1 AND (B=1 OR C=1)&quot;.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Construye la tabla de verdad</strong>
                <p>Lista todas las 2<sup>n</sup> combinaciones de entradas. Para 2 variables: 4 filas; para 3: 8 filas. Rellena la columna de salida según el enunciado para cada combinación.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Obtén la expresión booleana (SOP)</strong>
                <p>Para cada fila con salida 1, escribe el AND de las variables (directas si son 1, negadas si son 0). Une todos los términos con OR. Resultado: la expresión en Suma de Minterms.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Simplifica con Álgebra de Boole o K-Map</strong>
                <p>Aplica las leyes de Boole para reducir términos. Para 3-4 variables, usa un Mapa de Karnaugh para encontrar la expresión mínima visualmente agrupando unos adyacentes.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Dibuja el diagrama de circuito</strong>
                <p>Traduce la expresión simplificada a puertas: cada AND → puerta AND, cada OR → puerta OR, cada negación → NOT. Usa el modo &quot;Tablas de Verdad&quot; de este simulador para verificar cada puerta.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Verifica con el simulador</strong>
                <p>Usa el modo &quot;Expresiones&quot; para introducir tu expresión booleana y genera la tabla automáticamente. Comprueba que coincide exactamente con tu tabla del paso 2.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Optimiza si es necesario</strong>
                <p>¿Puedes implementar con solo puertas NAND? ¿Con menos puertas totales? Aplica De Morgan para transformar las puertas y reducir la variedad de componentes necesarios en la implementación física.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5: Mejores Prácticas */}
        <section>
          <h3>6 Mejores Prácticas en Lógica Digital</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <strong>Empieza por la tabla de verdad</strong>
              <p>Antes de pensar en puertas, define la tabla. Es el contrato de tu circuito: especifica el comportamiento exacto para cada combinación. Sin tabla, sin diseño correcto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <strong>Aplica De Morgan para simplificar</strong>
              <p>Cuando veas NOT(AND) o NOT(OR), aplica De Morgan. Reduce el número de puertas y hace las expresiones más manejables. Es la herramienta más poderosa de simplificación.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <strong>Usa NAND/NOR en hardware real</strong>
              <p>Son más eficientes en silicio. En FPGAs y ASICs, el compilador las prefiere. Si diseñas hardware, piensa en términos de NAND/NOR desde el principio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧩</span>
              <strong>Construye de abajo arriba</strong>
              <p>Domina las 7 puertas básicas, luego semisumadores y comparadores, luego la UAL. Cada nivel de abstracción se construye sobre el anterior.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Verifica con múltiples métodos</strong>
              <p>Si obtienes una expresión, compruébala construyendo la tabla de verdad y simulándola. Los errores de precedencia son muy comunes. Este simulador facilita la verificación.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <strong>Documenta las simplificaciones</strong>
              <p>En exámenes y proyectos, muestra cada paso: &quot;A·1 = A&quot; o &quot;A+A&apos; = 1&quot; deben estar justificados. Los profesores valoran el proceso, no solo el resultado.</p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>6 errores conceptuales frecuentes en lógica digital</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir XOR con OR</strong> — OR da 1 cuando ambas entradas son 1. XOR da 0 en ese caso. Para entradas (1,1): OR=1, XOR=0. Error muy común en exámenes.</li>
            <li><strong>NAND y NOR no son asociativos</strong> — (A NAND B) NAND C ≠ A NAND (B NAND C). A diferencia de AND y OR, siempre usa paréntesis para especificar el orden.</li>
            <li><strong>Aplicar mal las Leyes de De Morgan</strong> — NOT(A+B) ≠ NOT(A)+NOT(B). La ley correcta: NOT(A+B) = NOT(A)·NOT(B). Distribuir la negación sin cambiar el operador es el error más frecuente.</li>
            <li><strong>Confundir &apos;0&apos; lógico con señal flotante</strong> — El &apos;0&apos; lógico es una tensión baja definida (~0 V). Un pin flotante (no conectado) NO es &apos;0&apos;; su comportamiento es indefinido y puede causar fallos aleatorios.</li>
            <li><strong>Ignorar los tiempos de propagación</strong> — Las puertas tienen retardos (1-10 ns). En circuitos rápidos, &quot;glitches&quot; ocurren cuando diferentes caminos tienen retardos distintos. Crítico en diseño de alta frecuencia.</li>
            <li><strong>Diseñar sin simplificar</strong> — Implementar la SOP directamente puede requerir 3× más puertas. Una expresión con 8 minterms podría simplificarse a 2 términos. Siempre simplifica antes de implementar.</li>
          </ul>
        </div>
      </EducationalSection>

      {/* Conceptos relacionados — FUERA de la EducationalSection a propósito: ese componente
          solo monta sus hijos tras el clic (isOpen && children), así que su contenido no llega
          al HTML servido ni al crawler. Estos enlaces internos van visibles para que cuenten. */}
      <section className={styles.relatedConcepts}>
        <h2>Sigue explorando lógica y computación</h2>
        <p>
          Las puertas (o compuertas) lógicas son el ladrillo con el que se construye toda la
          informática. Si quieres ver cómo encajan en el panorama completo:
        </p>
        <ul>
          <li>
            Detrás de cada puerta hay una proposición verdadera o falsa: practica con el{' '}
            <a href="/visualizador-logica-proposicional/">visualizador de lógica proposicional</a>{' '}
            para dominar el álgebra de Boole que simplifica estos circuitos.
          </li>
          <li>
            Millones de estas compuertas forman un procesador: descubre cómo en el{' '}
            <a href="/visualizador-arquitectura-computador/">visualizador de la arquitectura del computador</a>.
          </li>
          <li>
            Las puertas viven en circuitos reales: experimenta con el{' '}
            <a href="/visualizador-circuitos-electronicos/">visualizador de circuitos electrónicos</a>{' '}
            para conectar la lógica con la electrónica digital.
          </li>
          <li>
            La lógica binaria es la base de la teoría de la información: mide bits y paridad en el{' '}
            <a href="/visualizador-teoria-informacion/">visualizador de teoría de la información</a>, o
            sube un nivel hasta la computación teórica con el{' '}
            <a href="/simulador-maquina-turing/">simulador de la máquina de Turing</a>.
          </li>
        </ul>
        <p className={styles.relatedConceptsTip}>
          <span aria-hidden="true">💡</span> ¿Buscabas una <strong>calculadora de compuertas lógicas</strong> o un{' '}
          <strong>sumador binario</strong>? Es esta misma herramienta: usa el modo «Expresiones»
          para evaluar cualquier fórmula booleana, y el modo «Circuitos» para los sumadores
          (half adder y full adder).
        </p>
      </section>

      <RelatedApps apps={getRelatedApps('simulador-puertas-logicas')} />
      <ShareCard appName="simulador-puertas-logicas" />
      <Footer appName="simulador-puertas-logicas" />
    </div>
  );
}
