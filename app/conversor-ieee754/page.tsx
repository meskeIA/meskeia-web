'use client';

import { useState, useMemo } from 'react';
import styles from './ConversorIEEE754.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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
      <Footer appName="conversor-ieee754" />
    </div>
  );
}
