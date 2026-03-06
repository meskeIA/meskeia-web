'use client';

import { useState, useMemo } from 'react';
import styles from './ConversorIEEE754.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Precision = 'single' | 'double';
type ConversionMode = 'decimalToBinary' | 'binaryToDecimal';

interface IEEE754Result {
  sign: string;
  exponent: string;
  mantissa: string;
  fullBinary: string;
  hexadecimal: string;
  decimalValue: number;
  biasedExponent: number;
  actualExponent: number;
  isSpecial: 'normal' | 'zero' | 'infinity' | 'nan' | 'denormalized';
  steps: string[];
}

// Configuración para cada precisión
const PRECISION_CONFIG = {
  single: { exponentBits: 8, mantissaBits: 23, bias: 127, totalBits: 32 },
  double: { exponentBits: 11, mantissaBits: 52, bias: 1023, totalBits: 64 },
};

// Convertir decimal a IEEE 754
function decimalToIEEE754(decimal: number, precision: Precision): IEEE754Result {
  const config = PRECISION_CONFIG[precision];
  const steps: string[] = [];

  // Caso especial: cero
  if (decimal === 0) {
    const sign = Object.is(decimal, -0) ? '1' : '0';
    return {
      sign,
      exponent: '0'.repeat(config.exponentBits),
      mantissa: '0'.repeat(config.mantissaBits),
      fullBinary: sign + '0'.repeat(config.exponentBits) + '0'.repeat(config.mantissaBits),
      hexadecimal: sign === '1' ? (precision === 'single' ? '80000000' : '8000000000000000') : '0'.repeat(precision === 'single' ? 8 : 16),
      decimalValue: decimal,
      biasedExponent: 0,
      actualExponent: 0,
      isSpecial: 'zero',
      steps: ['El número es cero, representación especial con todos los bits a 0'],
    };
  }

  // Caso especial: infinito
  if (!isFinite(decimal)) {
    const sign = decimal < 0 ? '1' : '0';
    return {
      sign,
      exponent: '1'.repeat(config.exponentBits),
      mantissa: '0'.repeat(config.mantissaBits),
      fullBinary: sign + '1'.repeat(config.exponentBits) + '0'.repeat(config.mantissaBits),
      hexadecimal: sign === '1' ? (precision === 'single' ? 'FF800000' : 'FFF0000000000000') : (precision === 'single' ? '7F800000' : '7FF0000000000000'),
      decimalValue: decimal,
      biasedExponent: Math.pow(2, config.exponentBits) - 1,
      actualExponent: Infinity,
      isSpecial: 'infinity',
      steps: ['El número es infinito, exponente todo 1s y mantisa todo 0s'],
    };
  }

  // Caso especial: NaN
  if (isNaN(decimal)) {
    return {
      sign: '0',
      exponent: '1'.repeat(config.exponentBits),
      mantissa: '1' + '0'.repeat(config.mantissaBits - 1),
      fullBinary: '0' + '1'.repeat(config.exponentBits) + '1' + '0'.repeat(config.mantissaBits - 1),
      hexadecimal: precision === 'single' ? '7FC00000' : '7FF8000000000000',
      decimalValue: NaN,
      biasedExponent: Math.pow(2, config.exponentBits) - 1,
      actualExponent: NaN,
      isSpecial: 'nan',
      steps: ['NaN: exponente todo 1s y mantisa distinta de 0'],
    };
  }

  // Determinar signo
  const sign = decimal < 0 ? '1' : '0';
  const absValue = Math.abs(decimal);
  steps.push(`1. Signo: ${decimal < 0 ? 'negativo (1)' : 'positivo (0)'}`);

  // Obtener representación binaria usando buffer
  const buffer = new ArrayBuffer(precision === 'single' ? 4 : 8);
  const view = new DataView(buffer);

  if (precision === 'single') {
    view.setFloat32(0, decimal, false);
  } else {
    view.setFloat64(0, decimal, false);
  }

  // Leer como entero para obtener bits
  let bits: bigint;
  if (precision === 'single') {
    bits = BigInt(view.getUint32(0, false));
  } else {
    bits = view.getBigUint64(0, false);
  }

  // Extraer componentes
  const fullBinary = bits.toString(2).padStart(config.totalBits, '0');
  const exponentBits = fullBinary.slice(1, 1 + config.exponentBits);
  const mantissaBits = fullBinary.slice(1 + config.exponentBits);

  const biasedExponent = parseInt(exponentBits, 2);
  const actualExponent = biasedExponent - config.bias;

  steps.push(`2. Valor absoluto: ${absValue}`);
  steps.push(`3. Exponente sesgado: ${biasedExponent} (binario: ${exponentBits})`);
  steps.push(`4. Exponente real: ${biasedExponent} - ${config.bias} = ${actualExponent}`);
  steps.push(`5. Mantisa: ${mantissaBits.slice(0, 10)}... (${config.mantissaBits} bits)`);

  // Determinar si es denormalizado
  const isSpecial = biasedExponent === 0 && mantissaBits !== '0'.repeat(config.mantissaBits)
    ? 'denormalized'
    : 'normal';

  // Hexadecimal
  const hexadecimal = bits.toString(16).toUpperCase().padStart(precision === 'single' ? 8 : 16, '0');

  return {
    sign,
    exponent: exponentBits,
    mantissa: mantissaBits,
    fullBinary,
    hexadecimal,
    decimalValue: decimal,
    biasedExponent,
    actualExponent,
    isSpecial,
    steps,
  };
}

// Convertir binario IEEE 754 a decimal
function ieee754ToDecimal(binaryString: string, precision: Precision): IEEE754Result {
  const config = PRECISION_CONFIG[precision];
  const steps: string[] = [];

  // Limpiar y validar entrada
  const cleanBinary = binaryString.replace(/\s/g, '');
  if (cleanBinary.length !== config.totalBits || !/^[01]+$/.test(cleanBinary)) {
    return {
      sign: '',
      exponent: '',
      mantissa: '',
      fullBinary: '',
      hexadecimal: '',
      decimalValue: NaN,
      biasedExponent: 0,
      actualExponent: 0,
      isSpecial: 'nan',
      steps: [`Error: Se requieren exactamente ${config.totalBits} bits (0s y 1s)`],
    };
  }

  const sign = cleanBinary[0];
  const exponentBits = cleanBinary.slice(1, 1 + config.exponentBits);
  const mantissaBits = cleanBinary.slice(1 + config.exponentBits);

  const biasedExponent = parseInt(exponentBits, 2);
  const signMultiplier = sign === '0' ? 1 : -1;

  steps.push(`1. Signo: ${sign} → ${signMultiplier === 1 ? 'positivo' : 'negativo'}`);
  steps.push(`2. Exponente: ${exponentBits} → ${biasedExponent}`);

  // Casos especiales
  if (biasedExponent === 0 && mantissaBits === '0'.repeat(config.mantissaBits)) {
    steps.push('3. Caso especial: Cero');
    return {
      sign,
      exponent: exponentBits,
      mantissa: mantissaBits,
      fullBinary: cleanBinary,
      hexadecimal: BigInt('0b' + cleanBinary).toString(16).toUpperCase().padStart(precision === 'single' ? 8 : 16, '0'),
      decimalValue: signMultiplier === 1 ? 0 : -0,
      biasedExponent: 0,
      actualExponent: 0,
      isSpecial: 'zero',
      steps,
    };
  }

  if (biasedExponent === Math.pow(2, config.exponentBits) - 1) {
    if (mantissaBits === '0'.repeat(config.mantissaBits)) {
      steps.push('3. Caso especial: Infinito');
      return {
        sign,
        exponent: exponentBits,
        mantissa: mantissaBits,
        fullBinary: cleanBinary,
        hexadecimal: BigInt('0b' + cleanBinary).toString(16).toUpperCase().padStart(precision === 'single' ? 8 : 16, '0'),
        decimalValue: signMultiplier * Infinity,
        biasedExponent,
        actualExponent: Infinity,
        isSpecial: 'infinity',
        steps,
      };
    } else {
      steps.push('3. Caso especial: NaN (Not a Number)');
      return {
        sign,
        exponent: exponentBits,
        mantissa: mantissaBits,
        fullBinary: cleanBinary,
        hexadecimal: BigInt('0b' + cleanBinary).toString(16).toUpperCase().padStart(precision === 'single' ? 8 : 16, '0'),
        decimalValue: NaN,
        biasedExponent,
        actualExponent: NaN,
        isSpecial: 'nan',
        steps,
      };
    }
  }

  // Calcular valor decimal
  let decimalValue: number;
  let actualExponent: number;
  let isSpecial: 'normal' | 'denormalized';

  if (biasedExponent === 0) {
    // Número denormalizado
    actualExponent = 1 - config.bias;
    let mantissaValue = 0;
    for (let i = 0; i < mantissaBits.length; i++) {
      if (mantissaBits[i] === '1') {
        mantissaValue += Math.pow(2, -(i + 1));
      }
    }
    decimalValue = signMultiplier * mantissaValue * Math.pow(2, actualExponent);
    isSpecial = 'denormalized';
    steps.push(`3. Número denormalizado (exponente = 0)`);
    steps.push(`4. Exponente real: 1 - ${config.bias} = ${actualExponent}`);
    steps.push(`5. Mantisa: 0.${mantissaBits.slice(0, 10)}...`);
  } else {
    // Número normalizado
    actualExponent = biasedExponent - config.bias;
    let mantissaValue = 1; // Bit implícito
    for (let i = 0; i < mantissaBits.length; i++) {
      if (mantissaBits[i] === '1') {
        mantissaValue += Math.pow(2, -(i + 1));
      }
    }
    decimalValue = signMultiplier * mantissaValue * Math.pow(2, actualExponent);
    isSpecial = 'normal';
    steps.push(`3. Exponente real: ${biasedExponent} - ${config.bias} = ${actualExponent}`);
    steps.push(`4. Mantisa con bit implícito: 1.${mantissaBits.slice(0, 10)}...`);
  }

  steps.push(`6. Valor decimal: ${decimalValue}`);

  return {
    sign,
    exponent: exponentBits,
    mantissa: mantissaBits,
    fullBinary: cleanBinary,
    hexadecimal: BigInt('0b' + cleanBinary).toString(16).toUpperCase().padStart(precision === 'single' ? 8 : 16, '0'),
    decimalValue,
    biasedExponent,
    actualExponent,
    isSpecial,
    steps,
  };
}

// Ejemplos predefinidos
const EXAMPLES = [
  { decimal: 3.14159, label: 'π ≈ 3.14159' },
  { decimal: -0.1, label: '-0.1 (no exacto)' },
  { decimal: 0.5, label: '0.5 (exacto)' },
  { decimal: 1.0, label: '1.0' },
  { decimal: 255, label: '255' },
  { decimal: 0.0000001, label: '0.0000001 (muy pequeño)' },
  { decimal: 1e38, label: '1×10³⁸ (muy grande)' },
];

export default function ConversorIEEE754Page() {
  const [mode, setMode] = useState<ConversionMode>('decimalToBinary');
  const [precision, setPrecision] = useState<Precision>('single');
  const [decimalInput, setDecimalInput] = useState('3.14159');
  const [binaryInput, setBinaryInput] = useState('');
  const [showSteps, setShowSteps] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const config = PRECISION_CONFIG[precision];

  const result = useMemo(() => {
    if (mode === 'decimalToBinary') {
      const num = parseFloat(decimalInput.replace(',', '.'));
      if (isNaN(num) && decimalInput.toLowerCase() !== 'nan') return null;
      if (decimalInput.toLowerCase() === 'nan') return decimalToIEEE754(NaN, precision);
      if (decimalInput.toLowerCase() === 'infinity' || decimalInput.toLowerCase() === 'inf') return decimalToIEEE754(Infinity, precision);
      if (decimalInput.toLowerCase() === '-infinity' || decimalInput.toLowerCase() === '-inf') return decimalToIEEE754(-Infinity, precision);
      return decimalToIEEE754(num, precision);
    } else {
      if (!binaryInput.trim()) return null;
      return ieee754ToDecimal(binaryInput, precision);
    }
  }, [mode, precision, decimalInput, binaryInput]);

  const handleCopy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExampleClick = (decimal: number) => {
    setMode('decimalToBinary');
    setDecimalInput(decimal.toString());
  };

  const formatBinaryWithSpaces = (binary: string, groupSize: number = 4) => {
    return binary.match(new RegExp(`.{1,${groupSize}}`, 'g'))?.join(' ') || binary;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🔢</span>
        <h1 className={styles.title}>Conversor IEEE 754</h1>
        <p className={styles.subtitle}>
          Convierte entre decimal y punto flotante. Visualiza signo, exponente y mantisa en binario.
        </p>
      </header>

      <LegalNotice />

      {/* Selector de modo y precisión */}
      <section className={styles.configSection}>
        <div className={styles.configRow}>
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Dirección</label>
            <div className={styles.modeSelector}>
              <button
                className={`${styles.modeBtn} ${mode === 'decimalToBinary' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('decimalToBinary')}
              >
                Decimal → Binario
              </button>
              <button
                className={`${styles.modeBtn} ${mode === 'binaryToDecimal' ? styles.modeBtnActive : ''}`}
                onClick={() => setMode('binaryToDecimal')}
              >
                Binario → Decimal
              </button>
            </div>
          </div>

          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Precisión</label>
            <div className={styles.precisionSelector}>
              <button
                className={`${styles.precisionBtn} ${precision === 'single' ? styles.precisionBtnActive : ''}`}
                onClick={() => setPrecision('single')}
              >
                <span className={styles.precisionIcon}>32</span>
                <span className={styles.precisionName}>Simple (float)</span>
              </button>
              <button
                className={`${styles.precisionBtn} ${precision === 'double' ? styles.precisionBtnActive : ''}`}
                onClick={() => setPrecision('double')}
              >
                <span className={styles.precisionIcon}>64</span>
                <span className={styles.precisionName}>Doble (double)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Entrada */}
      <section className={styles.inputSection}>
        <h2 className={styles.sectionTitle}>
          {mode === 'decimalToBinary' ? 'Número Decimal' : `Binario IEEE 754 (${config.totalBits} bits)`}
        </h2>

        {mode === 'decimalToBinary' ? (
          <>
            <input
              type="text"
              value={decimalInput}
              onChange={(e) => setDecimalInput(e.target.value)}
              placeholder="Ej: 3.14159, -0.5, 1e10"
              className={styles.input}
            />
            <div className={styles.examples}>
              <span className={styles.examplesLabel}>Ejemplos:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.decimal}
                  className={styles.exampleBtn}
                  onClick={() => handleExampleClick(ex.decimal)}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              value={binaryInput}
              onChange={(e) => setBinaryInput(e.target.value.replace(/[^01\s]/g, ''))}
              placeholder={`Introduce ${config.totalBits} bits (0s y 1s)`}
              className={styles.input}
              style={{ fontFamily: 'monospace' }}
            />
            <p className={styles.inputHint}>
              Formato: 1 bit signo + {config.exponentBits} bits exponente + {config.mantissaBits} bits mantisa
            </p>
          </>
        )}
      </section>

      {/* Resultados */}
      {result && (
        <section className={styles.resultsSection}>
          <h2 className={styles.sectionTitle}>Representación IEEE 754</h2>

          {/* Visualización de bits */}
          <div className={styles.bitsVisualization}>
            <div className={styles.bitsRow}>
              <div className={`${styles.bitGroup} ${styles.signBit}`}>
                <span className={styles.bitLabel}>Signo</span>
                <span className={styles.bitValue}>{result.sign}</span>
                <span className={styles.bitCount}>1 bit</span>
              </div>
              <div className={`${styles.bitGroup} ${styles.exponentBits}`}>
                <span className={styles.bitLabel}>Exponente</span>
                <span className={styles.bitValue}>{formatBinaryWithSpaces(result.exponent)}</span>
                <span className={styles.bitCount}>{config.exponentBits} bits</span>
              </div>
              <div className={`${styles.bitGroup} ${styles.mantissaBits}`}>
                <span className={styles.bitLabel}>Mantisa (fracción)</span>
                <span className={styles.bitValue}>
                  {result.mantissa.length > 24
                    ? formatBinaryWithSpaces(result.mantissa.slice(0, 24)) + '...'
                    : formatBinaryWithSpaces(result.mantissa)}
                </span>
                <span className={styles.bitCount}>{config.mantissaBits} bits</span>
              </div>
            </div>
          </div>

          {/* Resultados detallados */}
          <div className={styles.resultsGrid}>
            <div className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>Valor Decimal</span>
              </div>
              <div className={styles.resultValue}>
                {isNaN(result.decimalValue)
                  ? 'NaN'
                  : !isFinite(result.decimalValue)
                  ? (result.decimalValue > 0 ? '+∞' : '-∞')
                  : result.decimalValue.toPrecision(15).replace(/\.?0+$/, '')}
              </div>
            </div>

            <div className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>Hexadecimal</span>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopy(result.hexadecimal, 'hex')}
                >
                  {copied === 'hex' ? '✓' : '📋'}
                </button>
              </div>
              <div className={styles.resultValue}>0x{result.hexadecimal}</div>
            </div>

            <div className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>Exponente</span>
              </div>
              <div className={styles.resultValue}>
                {result.biasedExponent} - {config.bias} = {result.actualExponent}
              </div>
              <div className={styles.resultNote}>sesgado - sesgo = real</div>
            </div>

            <div className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>Tipo</span>
              </div>
              <div className={`${styles.resultValue} ${styles[result.isSpecial]}`}>
                {result.isSpecial === 'normal' && 'Normalizado'}
                {result.isSpecial === 'denormalized' && 'Denormalizado'}
                {result.isSpecial === 'zero' && 'Cero'}
                {result.isSpecial === 'infinity' && 'Infinito'}
                {result.isSpecial === 'nan' && 'NaN'}
              </div>
            </div>
          </div>

          {/* Binario completo */}
          <div className={styles.fullBinarySection}>
            <div className={styles.fullBinaryHeader}>
              <span className={styles.fullBinaryLabel}>Binario completo ({config.totalBits} bits)</span>
              <button
                className={styles.copyBtn}
                onClick={() => handleCopy(result.fullBinary, 'binary')}
              >
                {copied === 'binary' ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <code className={styles.fullBinaryValue}>
              {formatBinaryWithSpaces(result.fullBinary, 8)}
            </code>
          </div>

          {/* Pasos */}
          {showSteps && result.steps.length > 0 && (
            <div className={styles.stepsSection}>
              <button
                className={styles.stepsToggle}
                onClick={() => setShowSteps(!showSteps)}
              >
                📝 Proceso de conversión
              </button>
              <div className={styles.stepsContent}>
                {result.steps.map((step, i) => (
                  <div key={i} className={styles.step}>{step}</div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tabla de referencia */}
      <section className={styles.referenceSection}>
        <h2 className={styles.sectionTitle}>Referencia IEEE 754</h2>
        <div className={styles.referenceTable}>
          <table>
            <thead>
              <tr>
                <th>Precisión</th>
                <th>Total bits</th>
                <th>Signo</th>
                <th>Exponente</th>
                <th>Mantisa</th>
                <th>Sesgo</th>
                <th>Rango aprox.</th>
              </tr>
            </thead>
            <tbody>
              <tr className={precision === 'single' ? styles.activeRow : ''}>
                <td>Simple (float)</td>
                <td>32</td>
                <td>1</td>
                <td>8</td>
                <td>23</td>
                <td>127</td>
                <td>±3.4 × 10³⁸</td>
              </tr>
              <tr className={precision === 'double' ? styles.activeRow : ''}>
                <td>Doble (double)</td>
                <td>64</td>
                <td>1</td>
                <td>11</td>
                <td>52</td>
                <td>1023</td>
                <td>±1.8 × 10³⁰⁸</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre IEEE 754?"
        subtitle="Conceptos fundamentales de representación en punto flotante"
        icon="📚"
      >
        {/* 1. Tabla comparativa Half vs Single vs Double */}
        <div className={styles.eduComparativa}>
          <h2>📊 Comparativa: Half vs Single vs Double (IEEE 754)</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Half (16-bit)</th>
                  <th>Single (32-bit)</th>
                  <th>Double (64-bit)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Bits totales</strong></td>
                  <td>16</td>
                  <td>32</td>
                  <td>64</td>
                </tr>
                <tr>
                  <td><strong>Bits exponente</strong></td>
                  <td>5</td>
                  <td>8</td>
                  <td>11</td>
                </tr>
                <tr>
                  <td><strong>Bits mantisa</strong></td>
                  <td>10</td>
                  <td>23</td>
                  <td>52</td>
                </tr>
                <tr>
                  <td><strong>Sesgo</strong></td>
                  <td>15</td>
                  <td>127</td>
                  <td>1023</td>
                </tr>
                <tr>
                  <td><strong>Rango máximo</strong></td>
                  <td>±65.504</td>
                  <td>±3,4×10³⁸</td>
                  <td>±1,8×10³⁰⁸</td>
                </tr>
                <tr>
                  <td><strong>Precisión decimal</strong></td>
                  <td>~3-4 dígitos</td>
                  <td>~7 dígitos</td>
                  <td>~15-16 dígitos</td>
                </tr>
                <tr>
                  <td><strong>Velocidad</strong></td>
                  <td>Muy rápido (GPU)</td>
                  <td>Rápido</td>
                  <td>Moderado</td>
                </tr>
                <tr>
                  <td><strong>Uso típico</strong></td>
                  <td>ML/IA, shaders</td>
                  <td>C float, gráficos</td>
                  <td>C double, JS Number</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Casos de uso prácticos */}
        <div className={styles.eduEscenarios}>
          <h2>🌍 Casos de Uso Prácticos</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎮</span>
                <h3>Motores de Videojuegos</h3>
              </div>
              <p className={styles.escenarioExample}>
                Física y gráficos 3D usan float (32-bit). Millones de operaciones por frame.
                Precisión suficiente para coordenadas de pantalla.
              </p>
              <span className={styles.escenarioTip}>Unity: Transform.position es float</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🤖</span>
                <h3>Machine Learning / IA</h3>
              </div>
              <p className={styles.escenarioExample}>
                Redes neuronales usan half (16-bit/bfloat16) en GPU. Reduce VRAM a la mitad.
                Inferencia en móvil usa float8/int8.
              </p>
              <span className={styles.escenarioTip}>PyTorch: model.half()</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💰</span>
                <h3>Finanzas y Banca</h3>
              </div>
              <p className={styles.escenarioExample}>
                NUNCA usar float para dinero. 0,1 + 0,2 = 0,30000000000000004.
                0,1 € × 1.000.000 transacciones = error de 4.000 €.
              </p>
              <span className={styles.escenarioTip}>Usar BigDecimal o decimal</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔬</span>
                <h3>Cálculo Científico</h3>
              </div>
              <p className={styles.escenarioExample}>
                Simulaciones físicas usan double (64-bit). NASA, CERN, meteorología.
                La diferencia entre float y double puede ser la diferencia entre aterrizar en Marte o no.
              </p>
              <span className={styles.escenarioTip}>Siempre double en ciencia</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💻</span>
                <h3>Sistemas Embebidos</h3>
              </div>
              <p className={styles.escenarioExample}>
                Microcontroladores sin FPU usan fixed-point. Arduino evita float cuando es posible.
                STM32 con FPU usa float. Coste energético importante.
              </p>
              <span className={styles.escenarioTip}>Fixed-point sin FPU</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌐</span>
                <h3>JavaScript y Web</h3>
              </div>
              <p className={styles.escenarioExample}>
                Number siempre es double (64-bit). TypedArrays: Float32Array para WebGL.
                BigInt para enteros grandes exactos.
              </p>
              <span className={styles.escenarioTip}>Number = IEEE 754 double</span>
            </div>
          </div>
        </div>

        {/* 3. FAQ ampliado */}
        <div className={styles.eduFaq}>
          <h2>❓ Preguntas Frecuentes sobre Punto Flotante</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué 0,1 + 0,2 no es 0,3 exactamente?</h4>
              <p>
                0,1 en binario es 0,0001100110011... (periódico infinito). Al truncarse a 23 bits de mantisa,
                acumula error. Solución: redondear al comparar (<code>Math.abs(a-b) &lt; 1e-10</code>) o usar
                aritmética de precisión arbitraria.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo usar float (32-bit) vs double (64-bit)?</h4>
              <p>
                Float: gráficos, física de juegos, ML donde la velocidad y memoria importan.
                Double: finanzas, cálculo científico, por defecto en lenguajes (JS, Python).
                Regla práctica: si dudas, usa double.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es NaN y cuándo aparece?</h4>
              <p>
                Not a Number: resultado de 0/0, sqrt(-1), operaciones con infinito indeterminadas.
                NaN ≠ NaN (es la única cosa en programación que no es igual a sí misma).
                Verificar con <code>Number.isNaN(x)</code> en JavaScript.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué son los números denormalizados?</h4>
              <p>
                Números muy cercanos al cero (menores que 2^-126 en float). Permiten representar
                gradualmente el underflow en lugar de pasar directamente a cero. Más lentos en hardware
                por emulación software. Rango: 1,4×10⁻⁴⁵ hasta 1,2×10⁻³⁸ en float.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué los enteros grandes pierden precisión en float?</h4>
              <p>
                Float tiene 23 bits de mantisa = 2²⁴ = 16.777.217 enteros exactos. A partir de ese
                valor, solo puede representar números pares. Por eso JS usa Number.MAX_SAFE_INTEGER = 2⁵³-1
                (53 bits de mantisa en double).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo afecta el orden de las operaciones a la precisión?</h4>
              <p>
                (a+b)+c ≠ a+(b+c) en punto flotante. Sumar números muy grandes y muy pequeños pierde
                los dígitos pequeños. El algoritmo de Kahan compensa este error en sumas de muchos números.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre +0 y -0 en IEEE 754?</h4>
              <p>
                Son iguales en comparación (0 === -0 en JS), pero distintos en representación binaria
                (bit de signo diferente). 1/+0 = +Infinity, 1/-0 = -Infinity.
                En JavaScript: <code>Object.is(-0, 0)</code> devuelve false.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo inspeccionar los bits de un float en código?</h4>
              <p>
                C: <code>{'union { float f; uint32_t i; }'}</code>.
                Python: <code>struct.pack(&apos;f&apos;, 3.14)</code>.
                JavaScript: usar Float32Array + Uint32Array compartiendo el mismo ArrayBuffer.
                Útil para debugging y optimización de bajo nivel.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Guía paso a paso */}
        <div className={styles.eduGuia}>
          <h2>📖 Guía Paso a Paso: Convertir 3,14 a IEEE 754 Single</h2>
          <div className={styles.stepGuide}>
            <div className={styles.eduStep}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Determinar el signo</strong>
                <p>3,14 &gt; 0 → bit de signo = 0. Si fuera negativo, sería 1.</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Convertir parte entera a binario</strong>
                <p>3 en binario = 11₂ (3 = 2 + 1)</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Convertir parte decimal a binario</strong>
                <p>
                  0,14 × 2 = 0,28 (0) → 0,28 × 2 = 0,56 (0) → 0,56 × 2 = 1,12 (1) → ...
                  Resultado parcial: 0,001000111101...₂
                </p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Normalizar en notación científica binaria</strong>
                <p>11,001000111101...₂ = 1,1001000111101...₂ × 2¹</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Calcular exponente sesgado</strong>
                <p>Exponente real = 1, sesgo = 127 → 1 + 127 = 128 = 10000000₂</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Extraer mantisa (23 bits)</strong>
                <p>Parte fraccionaria de 1,1001000111101... = 10010001111010111000011₂</p>
              </div>
            </div>
            <div className={styles.eduStep}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Combinar los tres campos</strong>
                <p>0 | 10000000 | 10010001111010111000011 = 0x4048F5C3</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Mejores prácticas */}
        <div className={styles.eduTips}>
          <h2>✅ Mejores Prácticas con Punto Flotante</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Usa epsilon para comparar</strong>
              <p>Math.abs(a - b) &lt; Number.EPSILON en vez de a === b para floats</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔢</span>
              <strong>Double por defecto</strong>
              <p>En caso de duda, usa double (64-bit). La diferencia de rendimiento es mínima en CPUs modernas</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💶</span>
              <strong>Nunca float para dinero</strong>
              <p>Usa enteros de centavos o librerías especializadas (decimal.js, big.js). 0,1 + 0,2 ≠ 0,3</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🖥️</span>
              <strong>Float en arrays para WebGL</strong>
              <p>Float32Array consume la mitad de memoria que Float64Array en GPU. Importante para rendimiento gráfico</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <strong>Ordena las operaciones</strong>
              <p>Suma primero los números de magnitud similar. Evita (grandísimo + pequeñísimo) que pierde los dígitos pequeños</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <strong>Verifica NaN explícitamente</strong>
              <p>isNaN(x) en JS convierte a número antes. Usa Number.isNaN(x) para verificación exacta</p>
            </div>
          </div>
        </div>

        {/* 6. Warning box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores que Causan Bugs Difíciles de Detectar</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Comparar floats con ==:</strong> 0,1 + 0,2 === 0,3 es false. Usa comparación con margen de tolerancia (epsilon)</li>
            <li><strong>Usar float para dinero o contabilidad:</strong> 1,005 redondeado a 2 decimales da 1,00, no 1,01. En banca esto es un bug legal</li>
            <li><strong>Ignorar NaN propagante:</strong> NaN + cualquier cosa = NaN. Un NaN en el pipeline de cálculo corrompe todos los resultados downstream silenciosamente</li>
            <li><strong>Acumular errores en bucles:</strong> Sumar 0,1 mil veces en un bucle no da 100 exactamente (da 99,9999999...)</li>
            <li><strong>Cast implícito double→float:</strong> Al pasar double a una función que espera float pierdes ~8 dígitos de precisión sin aviso del compilador (sin -Wall)</li>
            <li><strong>Asumir que float es más rápido que double:</strong> En CPUs x86-64 modernas ambos tienen el mismo rendimiento. La ventaja de float es en memoria y ancho de banda (SIMD)</li>
          </ul>
        </div>

        {/* Contenido educativo base */}
        <section className={styles.infoSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>🔢 ¿Qué es IEEE 754?</h3>
              <p>
                Estándar internacional para representar números reales en computadores.
                Divide el número en tres partes: signo, exponente y mantisa (fracción).
              </p>
              <code>(-1)^signo × 1.mantisa × 2^exponente</code>
            </div>

            <div className={styles.infoCard}>
              <h3>📐 El Bit Implícito</h3>
              <p>
                En números normalizados, siempre hay un "1" implícito antes del punto
                decimal. Esto ahorra 1 bit de almacenamiento.
              </p>
              <code>1.01011... (el 1 inicial es implícito)</code>
            </div>

            <div className={styles.infoCard}>
              <h3>⚖️ El Sesgo (Bias)</h3>
              <p>
                El exponente se almacena con un sesgo para evitar números negativos.
                Se suma el sesgo al exponente real antes de almacenarlo.
              </p>
              <code>
                Simple: sesgo = 127<br />
                Doble: sesgo = 1023
              </code>
            </div>

            <div className={styles.infoCard}>
              <h3>⚠️ Números Especiales</h3>
              <p>
                <strong>Cero:</strong> Exp=0, Mantisa=0<br />
                <strong>Infinito:</strong> Exp=máx, Mantisa=0<br />
                <strong>NaN:</strong> Exp=máx, Mantisa≠0<br />
                <strong>Denormalizado:</strong> Exp=0, Mantisa≠0
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3>🎯 Precisión Limitada</h3>
              <p>
                No todos los decimales pueden representarse exactamente.
                Por ejemplo, 0.1 en binario es periódico infinito.
              </p>
              <code>0.1₁₀ = 0.0001100110011...₂ (infinito)</code>
            </div>

            <div className={styles.infoCard}>
              <h3>💻 En Programación</h3>
              <p>
                <strong>float</strong> (C/Java): precisión simple (32 bits)<br />
                <strong>double</strong> (C/Java): precisión doble (64 bits)<br />
                <strong>Number</strong> (JavaScript): siempre doble
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-ieee754')} />
      <ShareCard appName="conversor-ieee754" />
      <Footer appName="conversor-ieee754" />
    </div>
  );
}
