'use client';

import { useState, useEffect } from 'react';
import styles from './CalculadoraSistemasNumericos.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Base = 2 | 8 | 10 | 16;
type Operation = 'add' | 'sub' | 'and' | 'or' | 'xor' | 'not' | 'shl' | 'shr';

interface ConversionResult {
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
  steps: string[];
}

// Validar si un string es válido para una base
function isValidForBase(value: string, base: Base): boolean {
  if (!value || value.trim() === '') return true;
  const patterns: Record<Base, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9A-Fa-f]+$/,
  };
  return patterns[base].test(value.trim());
}

// Convertir de cualquier base a decimal
function toDecimal(value: string, base: Base): number {
  if (!value || value.trim() === '') return 0;
  return parseInt(value.trim(), base);
}

// Convertir de decimal a cualquier base
function fromDecimal(decimal: number, base: Base): string {
  if (isNaN(decimal) || decimal < 0) return '0';
  return decimal.toString(base).toUpperCase();
}

// Generar pasos de conversión
function generateSteps(value: string, fromBase: Base, toBase: Base): string[] {
  if (!value || value.trim() === '') return [];

  const steps: string[] = [];
  const decimal = toDecimal(value, fromBase);

  const baseNames: Record<Base, string> = {
    2: 'binario',
    8: 'octal',
    10: 'decimal',
    16: 'hexadecimal',
  };

  // Paso 1: Mostrar el valor original
  steps.push(`Valor original en ${baseNames[fromBase]}: ${value.toUpperCase()}`);

  // Paso 2: Si no es decimal, convertir a decimal primero
  if (fromBase !== 10) {
    const digits = value.toUpperCase().split('').reverse();
    const calculations = digits.map((d, i) => {
      const digitValue = parseInt(d, fromBase);
      return `${d} × ${fromBase}^${i} = ${digitValue} × ${Math.pow(fromBase, i)} = ${digitValue * Math.pow(fromBase, i)}`;
    });
    steps.push(`Conversión a decimal:`);
    calculations.forEach(calc => steps.push(`  ${calc}`));
    steps.push(`  Suma total = ${decimal}`);
  }

  // Paso 3: Si el destino no es decimal, convertir desde decimal
  if (toBase !== 10 && decimal > 0) {
    steps.push(`Conversión de decimal ${decimal} a ${baseNames[toBase]}:`);
    let temp = decimal;
    const divisions: string[] = [];
    while (temp > 0) {
      const remainder = temp % toBase;
      const remainderStr = toBase === 16 ? remainder.toString(16).toUpperCase() : remainder.toString();
      divisions.push(`  ${temp} ÷ ${toBase} = ${Math.floor(temp / toBase)}, resto = ${remainderStr}`);
      temp = Math.floor(temp / toBase);
    }
    divisions.forEach(div => steps.push(div));
    steps.push(`  Leyendo los restos de abajo a arriba: ${fromDecimal(decimal, toBase)}`);
  }

  return steps;
}

// Formatear binario en grupos de 4
function formatBinary(binary: string): string {
  if (!binary) return '0';
  // Rellenar para que sea múltiplo de 4
  const padded = binary.padStart(Math.ceil(binary.length / 4) * 4, '0');
  return padded.match(/.{1,4}/g)?.join(' ') || '0';
}

// Operaciones binarias
function performOperation(a: number, b: number, op: Operation, bits: number = 8): { result: number; explanation: string } {
  let result: number;
  let explanation: string;

  // Aplicar máscara para limitar bits
  const mask = (1 << bits) - 1;
  const aLimited = a & mask;
  const bLimited = b & mask;

  switch (op) {
    case 'add':
      result = (aLimited + bLimited) & mask;
      explanation = `${aLimited} + ${bLimited} = ${result} (módulo ${Math.pow(2, bits)})`;
      break;
    case 'sub':
      result = ((aLimited - bLimited) + Math.pow(2, bits)) & mask;
      explanation = `${aLimited} - ${bLimited} = ${result} (complemento a 2)`;
      break;
    case 'and':
      result = aLimited & bLimited;
      explanation = `${aLimited.toString(2).padStart(bits, '0')} AND ${bLimited.toString(2).padStart(bits, '0')} = ${result.toString(2).padStart(bits, '0')}`;
      break;
    case 'or':
      result = aLimited | bLimited;
      explanation = `${aLimited.toString(2).padStart(bits, '0')} OR ${bLimited.toString(2).padStart(bits, '0')} = ${result.toString(2).padStart(bits, '0')}`;
      break;
    case 'xor':
      result = aLimited ^ bLimited;
      explanation = `${aLimited.toString(2).padStart(bits, '0')} XOR ${bLimited.toString(2).padStart(bits, '0')} = ${result.toString(2).padStart(bits, '0')}`;
      break;
    case 'not':
      result = (~aLimited) & mask;
      explanation = `NOT ${aLimited.toString(2).padStart(bits, '0')} = ${result.toString(2).padStart(bits, '0')}`;
      break;
    case 'shl':
      result = (aLimited << (bLimited % bits)) & mask;
      explanation = `${aLimited.toString(2).padStart(bits, '0')} << ${bLimited} = ${result.toString(2).padStart(bits, '0')}`;
      break;
    case 'shr':
      result = aLimited >> (bLimited % bits);
      explanation = `${aLimited.toString(2).padStart(bits, '0')} >> ${bLimited} = ${result.toString(2).padStart(bits, '0')}`;
      break;
    default:
      result = 0;
      explanation = '';
  }

  return { result, explanation };
}

export default function CalculadoraSistemasNumericosPage() {
  // Estado para conversión
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState<Base>(10);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  // Estado para operaciones
  const [operandA, setOperandA] = useState('');
  const [operandB, setOperandB] = useState('');
  const [operation, setOperation] = useState<Operation>('add');
  const [opBase, setOpBase] = useState<Base>(10);
  const [bitWidth, setBitWidth] = useState(8);
  const [opResult, setOpResult] = useState<{ result: number; explanation: string } | null>(null);

  // Convertir cuando cambia el input
  useEffect(() => {
    if (!inputValue || inputValue.trim() === '') {
      setResult(null);
      setError('');
      return;
    }

    if (!isValidForBase(inputValue, inputBase)) {
      setError(`Valor inválido para base ${inputBase}`);
      setResult(null);
      return;
    }

    setError('');
    const decimal = toDecimal(inputValue, inputBase);

    if (decimal > Number.MAX_SAFE_INTEGER) {
      setError('Número demasiado grande');
      return;
    }

    setResult({
      binary: fromDecimal(decimal, 2),
      octal: fromDecimal(decimal, 8),
      decimal: fromDecimal(decimal, 10),
      hex: fromDecimal(decimal, 16),
      steps: generateSteps(inputValue, inputBase, 10),
    });
  }, [inputValue, inputBase]);

  // Realizar operación
  const handleOperation = () => {
    if (!operandA) return;

    const a = toDecimal(operandA, opBase);
    const b = operation === 'not' ? 0 : toDecimal(operandB, opBase);

    if (!isValidForBase(operandA, opBase) || (operation !== 'not' && !isValidForBase(operandB, opBase))) {
      setOpResult(null);
      return;
    }

    setOpResult(performOperation(a, b, operation, bitWidth));
  };

  // Copiar al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const baseLabels: Record<Base, string> = {
    2: 'Binario (Base 2)',
    8: 'Octal (Base 8)',
    10: 'Decimal (Base 10)',
    16: 'Hexadecimal (Base 16)',
  };

  const operationLabels: Record<Operation, { name: string; symbol: string; description: string }> = {
    add: { name: 'Suma', symbol: '+', description: 'Suma aritmética' },
    sub: { name: 'Resta', symbol: '-', description: 'Resta aritmética' },
    and: { name: 'AND', symbol: '&', description: 'AND bit a bit' },
    or: { name: 'OR', symbol: '|', description: 'OR bit a bit' },
    xor: { name: 'XOR', symbol: '^', description: 'XOR bit a bit' },
    not: { name: 'NOT', symbol: '~', description: 'Complemento a 1' },
    shl: { name: 'Shift Left', symbol: '<<', description: 'Desplazamiento izquierda' },
    shr: { name: 'Shift Right', symbol: '>>', description: 'Desplazamiento derecha' },
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🔢</span>
        <h1 className={styles.title}>Calculadora de Sistemas Numéricos</h1>
        <p className={styles.subtitle}>
          Convierte entre binario, octal, decimal y hexadecimal con explicación paso a paso
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de Conversión */}
        <section className={styles.conversionSection}>
          <h2 className={styles.sectionTitle}>📐 Conversión de Bases</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Base de entrada:</label>
            <div className={styles.baseSelector}>
              {([2, 8, 10, 16] as Base[]).map(base => (
                <button
                  key={base}
                  onClick={() => setInputBase(base)}
                  className={`${styles.baseBtn} ${inputBase === base ? styles.baseBtnActive : ''}`}
                >
                  {base === 2 ? 'BIN' : base === 8 ? 'OCT' : base === 10 ? 'DEC' : 'HEX'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>{baseLabels[inputBase]}:</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              placeholder={inputBase === 2 ? '11010110' : inputBase === 8 ? '326' : inputBase === 10 ? '214' : 'D6'}
              className={`${styles.input} ${error ? styles.inputError : ''}`}
            />
            {error && <span className={styles.errorMsg}>{error}</span>}
          </div>

          {result && (
            <div className={styles.resultsGrid}>
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Binario (Base 2)</span>
                  <button
                    onClick={() => copyToClipboard(result.binary)}
                    className={styles.copyBtn}
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
                <div className={styles.resultValue}>{formatBinary(result.binary)}</div>
              </div>

              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Octal (Base 8)</span>
                  <button
                    onClick={() => copyToClipboard(result.octal)}
                    className={styles.copyBtn}
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
                <div className={styles.resultValue}>{result.octal}</div>
              </div>

              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Decimal (Base 10)</span>
                  <button
                    onClick={() => copyToClipboard(result.decimal)}
                    className={styles.copyBtn}
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
                <div className={styles.resultValue}>{result.decimal}</div>
              </div>

              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Hexadecimal (Base 16)</span>
                  <button
                    onClick={() => copyToClipboard(result.hex)}
                    className={styles.copyBtn}
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
                <div className={styles.resultValue}>{result.hex}</div>
              </div>
            </div>
          )}

          {result && result.steps.length > 0 && (
            <div className={styles.stepsSection}>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className={styles.stepsToggle}
              >
                {showSteps ? '▼' : '▶'} Ver proceso paso a paso
              </button>
              {showSteps && (
                <div className={styles.stepsContent}>
                  {result.steps.map((step, i) => (
                    <div key={i} className={styles.step}>{step}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Panel de Operaciones */}
        <section className={styles.operationsSection}>
          <h2 className={styles.sectionTitle}>⚡ Operaciones Binarias</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Base de entrada:</label>
            <div className={styles.baseSelector}>
              {([2, 8, 10, 16] as Base[]).map(base => (
                <button
                  key={base}
                  onClick={() => setOpBase(base)}
                  className={`${styles.baseBtn} ${opBase === base ? styles.baseBtnActive : ''}`}
                >
                  {base === 2 ? 'BIN' : base === 8 ? 'OCT' : base === 10 ? 'DEC' : 'HEX'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ancho de bits:</label>
            <div className={styles.baseSelector}>
              {[4, 8, 16, 32].map(bits => (
                <button
                  key={bits}
                  onClick={() => setBitWidth(bits)}
                  className={`${styles.baseBtn} ${bitWidth === bits ? styles.baseBtnActive : ''}`}
                >
                  {bits} bits
                </button>
              ))}
            </div>
          </div>

          <div className={styles.operationInputs}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Operando A:</label>
              <input
                type="text"
                value={operandA}
                onChange={(e) => setOperandA(e.target.value.toUpperCase())}
                placeholder={opBase === 10 ? '42' : opBase === 2 ? '101010' : opBase === 8 ? '52' : '2A'}
                className={styles.input}
              />
            </div>

            {operation !== 'not' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Operando B:</label>
                <input
                  type="text"
                  value={operandB}
                  onChange={(e) => setOperandB(e.target.value.toUpperCase())}
                  placeholder={opBase === 10 ? '15' : opBase === 2 ? '1111' : opBase === 8 ? '17' : 'F'}
                  className={styles.input}
                />
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Operación:</label>
            <div className={styles.operationSelector}>
              {(Object.keys(operationLabels) as Operation[]).map(op => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={`${styles.opBtn} ${operation === op ? styles.opBtnActive : ''}`}
                  title={operationLabels[op].description}
                >
                  <span className={styles.opSymbol}>{operationLabels[op].symbol}</span>
                  <span className={styles.opName}>{operationLabels[op].name}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleOperation} className={styles.calculateBtn}>
            Calcular
          </button>

          {opResult && (
            <div className={styles.opResultCard}>
              <div className={styles.opResultHeader}>Resultado:</div>
              <div className={styles.opResultValue}>
                <div className={styles.opResultRow}>
                  <span>Binario:</span>
                  <code>{formatBinary(opResult.result.toString(2).padStart(bitWidth, '0'))}</code>
                </div>
                <div className={styles.opResultRow}>
                  <span>Decimal:</span>
                  <code>{opResult.result}</code>
                </div>
                <div className={styles.opResultRow}>
                  <span>Hexadecimal:</span>
                  <code>{opResult.result.toString(16).toUpperCase()}</code>
                </div>
              </div>
              <div className={styles.opExplanation}>{opResult.explanation}</div>
            </div>
          )}
        </section>
      </div>

      {/* Tabla de referencia */}
      <section className={styles.referenceSection}>
        <h2 className={styles.sectionTitle}>📚 Tabla de Referencia Rápida</h2>
        <div className={styles.referenceTable}>
          <table>
            <thead>
              <tr>
                <th>Decimal</th>
                <th>Binario</th>
                <th>Octal</th>
                <th>Hexadecimal</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => (
                <tr key={n}>
                  <td>{n}</td>
                  <td>{n.toString(2).padStart(4, '0')}</td>
                  <td>{n.toString(8)}</td>
                  <td>{n.toString(16).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Info educativa */}
      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>💡 ¿Qué son los sistemas numéricos?</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>🔢 Binario (Base 2)</h3>
            <p>Usa solo 0 y 1. Es el lenguaje nativo de los ordenadores. Cada dígito se llama "bit".</p>
            <code>1010₂ = 1×8 + 0×4 + 1×2 + 0×1 = 10₁₀</code>
          </div>
          <div className={styles.infoCard}>
            <h3>8️⃣ Octal (Base 8)</h3>
            <p>Usa dígitos del 0 al 7. Cada dígito octal representa exactamente 3 bits.</p>
            <code>12₈ = 1×8 + 2×1 = 10₁₀</code>
          </div>
          <div className={styles.infoCard}>
            <h3>🔟 Decimal (Base 10)</h3>
            <p>El sistema que usamos habitualmente. Usa dígitos del 0 al 9.</p>
            <code>10₁₀ = 1×10 + 0×1 = 10₁₀</code>
          </div>
          <div className={styles.infoCard}>
            <h3>🔤 Hexadecimal (Base 16)</h3>
            <p>Usa 0-9 y A-F (A=10, B=11... F=15). Muy usado en programación para representar colores, direcciones de memoria, etc.</p>
            <code>A₁₆ = 10₁₀ | FF₁₆ = 255₁₀</code>
          </div>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('calculadora-sistemas-numericos')} />
      <Footer appName="calculadora-sistemas-numericos" />
    </div>
  );
}
