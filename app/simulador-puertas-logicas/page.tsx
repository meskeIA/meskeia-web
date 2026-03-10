'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorPuertasLogicas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type SimulatorMode = 'tablas' | 'circuitos' | 'expresiones';
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
    inputs: ['A0', 'A1'],
    outputs: ['Y0', 'Y1', 'Y2', 'Y3'],
    compute: ([a0, a1]) => {
      const index = (a1 ? 2 : 0) + (a0 ? 1 : 0);
      return [index === 0, index === 1, index === 2, index === 3];
    }
  }
};

// ============================================
// PARSER DE EXPRESIONES BOOLEANAS
// ============================================
const parseExpression = (expr: string, variables: Record<string, boolean>): boolean => {
  // Normalizar expresión
  let normalized = expr.toUpperCase()
    .replace(/\s+/g, '')
    .replace(/NOT\s*/gi, '!')
    .replace(/AND/gi, '&')
    .replace(/OR/gi, '|')
    .replace(/XOR/gi, '^')
    .replace(/·/g, '&')
    .replace(/\+/g, '|')
    .replace(/⊕/g, '^')
    .replace(/∧/g, '&')
    .replace(/∨/g, '|')
    .replace(/¬/g, '!');

  // Reemplazar variables por valores
  Object.entries(variables).forEach(([name, value]) => {
    const regex = new RegExp(name, 'gi');
    normalized = normalized.replace(regex, value ? '1' : '0');
  });

  // Evaluar expresión
  try {
    // Convertir a expresión JavaScript evaluable
    const jsExpr = normalized
      .replace(/!/g, '!')
      .replace(/&/g, '&&')
      .replace(/\|/g, '||')
      .replace(/\^/g, '!==')
      .replace(/1/g, 'true')
      .replace(/0/g, 'false');

    // Evaluar de forma segura
    // eslint-disable-next-line no-new-func
    return new Function(`return ${jsExpr}`)();
  } catch {
    return false;
  }
};

const extractVariables = (expr: string): string[] => {
  const matches = expr.toUpperCase().match(/[A-Z]/g);
  if (!matches) return [];
  return [...new Set(matches)].sort();
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
  const [expressionError, setExpressionError] = useState('');

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
  const expressionVariables = useMemo(() => extractVariables(expression), [expression]);

  const expressionTruthTable = useMemo(() => {
    if (expressionVariables.length === 0 || expressionVariables.length > 4) {
      setExpressionError(expressionVariables.length > 4 ? 'Máximo 4 variables (A-D)' : '');
      return [];
    }

    setExpressionError('');
    const rows: { inputs: boolean[]; output: boolean }[] = [];
    const numRows = Math.pow(2, expressionVariables.length);

    for (let i = 0; i < numRows; i++) {
      const inputs: boolean[] = [];
      const variables: Record<string, boolean> = {};

      for (let j = 0; j < expressionVariables.length; j++) {
        const value = Boolean((i >> (expressionVariables.length - 1 - j)) & 1);
        inputs.push(value);
        variables[expressionVariables[j]] = value;
      }

      try {
        const output = parseExpression(expression, variables);
        rows.push({ inputs, output });
      } catch {
        setExpressionError('Expresión inválida');
        return [];
      }
    }

    return rows;
  }, [expression, expressionVariables]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Puertas Lógicas</h1>
        <p className={styles.subtitle}>
          Tablas de verdad, circuitos digitales y expresiones booleanas
        </p>
      </header>

      <LegalNotice />

      {/* Mode Selector */}
      <div className={styles.modeSelector}>
        <button
          className={`${styles.modeBtn} ${mode === 'tablas' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('tablas')}
        >
          <span className={styles.modeIcon}>📊</span>
          <span className={styles.modeName}>Tablas de Verdad</span>
          <span className={styles.modeDesc}>7 puertas lógicas</span>
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'circuitos' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('circuitos')}
        >
          <span className={styles.modeIcon}>🔌</span>
          <span className={styles.modeName}>Circuitos</span>
          <span className={styles.modeDesc}>Simulación interactiva</span>
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'expresiones' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('expresiones')}
        >
          <span className={styles.modeIcon}>🧮</span>
          <span className={styles.modeName}>Expresiones</span>
          <span className={styles.modeDesc}>Álgebra booleana</span>
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
                className={`${styles.gateBtn} ${selectedGate === gate ? styles.gateBtnActive : ''}`}
                onClick={() => setSelectedGate(gate)}
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
                    className={`${styles.ioSwitch} ${circuitInputs[idx] ? styles.ioSwitchOn : ''}`}
                    onClick={() => toggleCircuitInput(idx)}
                  >
                    <span className={styles.ioLabel}>{input}</span>
                    <span className={styles.ioValue}>{circuitInputs[idx] ? '1' : '0'}</span>
                    <span className={styles.ioIndicator}>{circuitInputs[idx] ? '🟢' : '⚫'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flecha */}
            <div className={styles.arrowContainer}>
              <span className={styles.arrow}>→</span>
            </div>

            {/* Salidas */}
            <div className={styles.ioSection}>
              <h4>Salidas</h4>
              <div className={styles.ioGrid}>
                {CIRCUITS[selectedCircuit].outputs.map((output, idx) => (
                  <div
                    key={idx}
                    className={`${styles.ioLed} ${circuitOutputs[idx] ? styles.ioLedOn : ''}`}
                  >
                    <span className={styles.ioLabel}>{output}</span>
                    <span className={styles.ioValue}>{circuitOutputs[idx] ? '1' : '0'}</span>
                    <span className={styles.ioIndicator}>{circuitOutputs[idx] ? '🔴' : '⚫'}</span>
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
                  {CIRCUITS[selectedCircuit].inputs.map((input, idx) => (
                    <th key={idx}>{input.split(' ')[0]}</th>
                  ))}
                  {CIRCUITS[selectedCircuit].outputs.map((output, idx) => (
                    <th key={idx} className={styles.outputHeader}>{output.split(' ')[0]}</th>
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
            {expressionError && <p className={styles.expressionError}>{expressionError}</p>}
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
              <button onClick={() => setExpression('A AND B')} className={styles.exampleBtn}>
                A AND B
              </button>
              <button onClick={() => setExpression('A OR B')} className={styles.exampleBtn}>
                A OR B
              </button>
              <button onClick={() => setExpression('NOT A')} className={styles.exampleBtn}>
                NOT A
              </button>
              <button onClick={() => setExpression('(A AND B) OR C')} className={styles.exampleBtn}>
                (A AND B) OR C
              </button>
              <button onClick={() => setExpression('A XOR B')} className={styles.exampleBtn}>
                A XOR B
              </button>
              <button onClick={() => setExpression('NOT (A OR B)')} className={styles.exampleBtn}>
                NOT (A OR B)
              </button>
              <button onClick={() => setExpression('(A AND B) OR (C AND D)')} className={styles.exampleBtn}>
                (A·B) + (C·D)
              </button>
              <button onClick={() => setExpression('(NOT A) AND (NOT B)')} className={styles.exampleBtn}>
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

      {/* Educational Section */}
      <EducationalSection
        title="Fundamentos de Lógica Digital"
        subtitle="Todo lo que necesitas saber sobre puertas lógicas, álgebra de Boole y circuitos digitales"
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
                <strong>Estudiante de bachillerato</strong>
              </div>
              <p className={styles.escenarioExample}>
                Examen PAU: &quot;Simplifica A·(A+B)&quot;. Usando el teorema de absorción: A·(A+B) = A·A + A·B = A + A·B = <strong>A</strong>. Resultado: una conexión directa sin puertas.
              </p>
              <p className={styles.escenarioTip}>
                💡 Memoriza las leyes De Morgan: NOT(A·B) = NOT(A)+NOT(B). Son las más preguntadas en selectividad.
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
                💡 Practica implementando cualquier función con solo puertas NAND. Es ejercicio estándar en arquitectura de computadores.
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
                💡 En diseño real, NAND y NOR son más eficientes en silicio. Los fabricantes de chips los usan como bloques constructivos básicos.
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
                💡 Entender la lógica subyacente permite optimizar el uso de LUTs en FPGAs y celdas estándar en ASICs.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section>
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué es el Álgebra de Boole y para qué sirve?</h4>
              <p>El Álgebra de Boole (1854) es el sistema matemático que describe los circuitos digitales. Trabaja con solo dos valores (0 y 1) y tres operaciones básicas (AND, OR, NOT). Permite simplificar expresiones lógicas para reducir el número de puertas y ahorrar coste, energía y espacio en silicio.</p>
              <p className={styles.faqTip}>💡 Las leyes fundamentales son conmutativa (A·B = B·A), asociativa y distributiva (A·(B+C) = A·B + A·C).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué NAND y NOR se llaman puertas universales?</h4>
              <p>Porque cualquier función lógica puede implementarse usando <strong>únicamente puertas NAND</strong> (o únicamente NOR). NOT(A) = A NAND A; AND(A,B) = NOT(A NAND B); OR(A,B) = (NOT A) NAND (NOT B). Los fabricantes de chips simplifican la producción usando una sola celda estándar.</p>
              <p className={styles.faqTip}>💡 En FPGAs modernas, los &quot;Look-Up Tables&quot; (LUT) son la generalización de este concepto: una tabla de memoria que implementa cualquier función booleana.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es una tabla de verdad y cómo se construye?</h4>
              <p>Una tabla de verdad lista todas las combinaciones posibles de entradas (2<sup>n</sup> filas para n entradas) y la salida correspondiente. Para 2 entradas: 4 filas (00, 01, 10, 11). Para 3 entradas: 8 filas. Para 10 entradas: 1.024 filas.</p>
              <p className={styles.faqTip}>💡 Construye siempre las entradas en orden binario natural (de 0 a 2^n-1) para no omitir ninguna combinación.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre XOR y XNOR?</h4>
              <p>XOR da salida 1 cuando las entradas son <strong>DIFERENTES</strong>. XNOR da 1 cuando son <strong>IGUALES</strong>. Son complementarias: si A XOR B = Y, entonces A XNOR B = NOT(Y). XOR se usa en sumadores y detectores de paridad; XNOR en comparadores de igualdad.</p>
              <p className={styles.faqTip}>💡 XOR detecta si el número de unos en la entrada es impar. Concatenando XORs se construyen generadores/verificadores de paridad.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo se aplican las Leyes de De Morgan?</h4>
              <p>Primera ley: <strong>NOT(A AND B) = NOT(A) OR NOT(B)</strong>. Segunda ley: <strong>NOT(A OR B) = NOT(A) AND NOT(B)</strong>. Permiten convertir NAND en OR con entradas negadas y NOR en AND con entradas negadas. Son esenciales para simplificar circuitos.</p>
              <p className={styles.faqTip}>💡 Para aplicar De Morgan: 1) Niega toda la expresión, 2) Cambia AND por OR (o viceversa), 3) Niega cada variable individual.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es una expresión en Forma Normal Canónica?</h4>
              <p>Existen dos formas: <strong>Suma de Minterms (SOP)</strong> y Producto de Maxterms (POS). SOP: para cada fila con salida 1, escribe el AND de variables y únelos con OR. Cualquier tabla de verdad puede expresarse en forma canónica.</p>
              <p className={styles.faqTip}>💡 SOP es más intuitiva: lee las filas con salida 1, escribe el mintérmino para cada una y únelos con OR.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Para qué sirven los Mapas de Karnaugh?</h4>
              <p>Los K-Maps son un método <strong>gráfico</strong> para simplificar expresiones booleanas. Organizan la tabla de verdad en cuadrícula donde celdas adyacentes difieren en una variable (código Gray). Agrupando celdas con valor 1 en potencias de 2, se obtiene la expresión mínima.</p>
              <p className={styles.faqTip}>💡 Son muy eficientes para hasta 4-5 variables. Para más, se usan algoritmos como Quine-McCluskey o herramientas EDA.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo se implementan las puertas en hardware real?</h4>
              <p>Las puertas lógicas se implementan con <strong>transistores CMOS</strong>. Una puerta NAND básica usa 4 transistores (2 NMOS en serie + 2 PMOS en paralelo). Los microprocesadores modernos tienen miles de millones de transistores operando a frecuencias de GHz.</p>
              <p className={styles.faqTip}>💡 La tecnología CMOS domina porque solo consume energía durante las transiciones. Una puerta CMOS en reposo consume esencialmente cero potencia.</p>
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
              <span className={styles.tipIcon}>📊</span>
              <strong>Empieza por la tabla de verdad</strong>
              <p>Antes de pensar en puertas, define la tabla. Es el contrato de tu circuito: especifica el comportamiento exacto para cada combinación. Sin tabla, sin diseño correcto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Aplica De Morgan para simplificar</strong>
              <p>Cuando veas NOT(AND) o NOT(OR), aplica De Morgan. Reduce el número de puertas y hace las expresiones más manejables. Es la herramienta más poderosa de simplificación.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚡</span>
              <strong>Usa NAND/NOR en hardware real</strong>
              <p>Son más eficientes en silicio. En FPGAs y ASICs, el compilador las prefiere. Si diseñas hardware, piensa en términos de NAND/NOR desde el principio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧩</span>
              <strong>Construye de abajo arriba</strong>
              <p>Domina las 7 puertas básicas, luego semisumadores y comparadores, luego la UAL. Cada nivel de abstracción se construye sobre el anterior.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Verifica con múltiples métodos</strong>
              <p>Si obtienes una expresión, compruébala construyendo la tabla de verdad y simulándola. Los errores de precedencia son muy comunes. Este simulador facilita la verificación.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📝</span>
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

      <RelatedApps apps={getRelatedApps('simulador-puertas-logicas')} />
      <ShareCard appName="simulador-puertas-logicas" />
      <Footer appName="simulador-puertas-logicas" />
    </div>
  );
}
