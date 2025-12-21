'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorPuertasLogicas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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
        title="¿Quieres aprender más sobre puertas lógicas?"
        subtitle="Descubre los fundamentos de la electrónica digital"
      >
        <section className={styles.guideSection}>
          <h2>Fundamentos de Lógica Digital</h2>
          <p className={styles.introParagraph}>
            Las puertas lógicas son los bloques fundamentales de todos los circuitos digitales.
            Desde microprocesadores hasta memorias, todo se construye combinando estas operaciones básicas.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Puertas Básicas</h4>
              <p>
                <strong>AND</strong>: Salida 1 solo si TODAS las entradas son 1. Como una serie de interruptores.
                <br /><strong>OR</strong>: Salida 1 si AL MENOS UNA entrada es 1. Como interruptores en paralelo.
                <br /><strong>NOT</strong>: Invierte la señal. El inversor más básico.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Puertas Universales</h4>
              <p>
                <strong>NAND</strong> y <strong>NOR</strong> son puertas universales: cualquier circuito digital
                puede construirse usando solo una de ellas. Por eso son tan importantes en el diseño de chips.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>XOR y Paridad</h4>
              <p>
                La puerta <strong>XOR</strong> detecta si las entradas son diferentes. Es esencial para
                sumadores binarios, detectores de paridad y circuitos de cifrado.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Álgebra de Boole</h4>
              <p>
                Las leyes de De Morgan permiten simplificar expresiones:
                <code>NOT(A AND B) = (NOT A) OR (NOT B)</code>. Fundamental para optimizar circuitos.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-puertas-logicas')} />
      <Footer appName="simulador-puertas-logicas" />
    </div>
  );
}
