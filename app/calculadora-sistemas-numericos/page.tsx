'use client';
// @disclaimer: exempt

import { useState, useEffect } from 'react';
import styles from './CalculadoraSistemasNumericos.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

import {
  ANCHOS,
  agruparBinario,
  calcularOperacion,
  convertir,
  type Base,
  type Operacion,
  type ResultadoConversion,
} from './motor';

export default function CalculadoraSistemasNumericosPage() {
  // Estado para conversión
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState<Base>(10);
  const [result, setResult] = useState<Extract<ResultadoConversion, { ok: true }> | null>(null);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  // Estado para operaciones
  const [operandA, setOperandA] = useState('');
  const [operandB, setOperandB] = useState('');
  const [operation, setOperation] = useState<Operacion>('add');
  const [opBase, setOpBase] = useState<Base>(10);
  const [bitWidth, setBitWidth] = useState(8);
  const [opResult, setOpResult] = useState<{ resultado: number; explicacion: string } | null>(null);
  const [opError, setOpError] = useState('');

  // Convertir cuando cambia el input.
  // El error retira el resultado anterior: antes se quedaban en pantalla las tarjetas del
  // valor previo debajo del mensaje de error, y ya no correspondían a lo escrito.
  useEffect(() => {
    const conversion = convertir(inputValue, inputBase);

    if (!conversion) {
      setResult(null);
      setError('');
      return;
    }

    if (!conversion.ok) {
      setError(conversion.error);
      setResult(null);
      return;
    }

    setError('');
    setResult(conversion);
  }, [inputValue, inputBase]);

  // Realizar operación
  const handleOperation = () => {
    const calculo = calcularOperacion(operandA, operandB, operation, opBase, bitWidth);

    if (!calculo.ok) {
      setOpError(calculo.error);
      setOpResult(null);
      return;
    }

    setOpError('');
    setOpResult(calculo);
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

  const operationLabels: Record<Operacion, { name: string; symbol: string; description: string }> = {
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
        <span className={styles.heroIcon} aria-hidden="true">🔢</span>
        <h1 className={styles.title}>Calculadora de Sistemas Numéricos</h1>
        <p className={styles.subtitle}>
          Convierte entre binario, octal, decimal y hexadecimal con explicación paso a paso
        </p>
      </header>

      <LegalNotice />

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
                  type="button"
                  onClick={() => setInputBase(base)}
                  aria-pressed={inputBase === base}
                  className={`${styles.baseBtn} ${inputBase === base ? styles.baseBtnActive : ''}`}
                >
                  {base === 2 ? 'BIN' : base === 8 ? 'OCT' : base === 10 ? 'DEC' : 'HEX'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="valor-a-convertir">{baseLabels[inputBase]}:</label>
            <input
              id="valor-a-convertir"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              placeholder={inputBase === 2 ? '11010110' : inputBase === 8 ? '326' : inputBase === 10 ? '214' : 'D6'}
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'error-conversion' : undefined}
            />
            {error && <span id="error-conversion" role="alert" className={styles.errorMsg}>{error}</span>}
          </div>

          {result && (
            <div className={styles.resultsGrid} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Binario (Base 2)</span>
                  <button
                    onClick={() => copyToClipboard(result.binario)}
                    type="button"
                    className={styles.copyBtn}
                    title="Copiar"
                    aria-label="Copiar el valor en binario"
                  >
                    📋
                  </button>
                </div>
                <div className={styles.resultValue}>{agruparBinario(result.binario)}</div>
              </div>

              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultLabel}>Octal (Base 8)</span>
                  <button
                    onClick={() => copyToClipboard(result.octal)}
                    type="button"
                    className={styles.copyBtn}
                    title="Copiar"
                    aria-label="Copiar el valor en octal"
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
                    type="button"
                    className={styles.copyBtn}
                    title="Copiar"
                    aria-label="Copiar el valor en decimal"
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
                    onClick={() => copyToClipboard(result.hexadecimal)}
                    type="button"
                    className={styles.copyBtn}
                    title="Copiar"
                    aria-label="Copiar el valor en hexadecimal"
                  >
                    📋
                  </button>
                </div>
                <div className={styles.resultValue}>{result.hexadecimal}</div>
              </div>
            </div>
          )}

          {result && result.pasos.length > 0 && (
            <div className={styles.stepsSection}>
              <button
                type="button"
                onClick={() => setShowSteps(!showSteps)}
                aria-pressed={showSteps}
                className={styles.stepsToggle}
              >
                {showSteps ? '▼' : '▶'} Ver proceso paso a paso
              </button>
              {showSteps && (
                <div className={styles.stepsContent}>
                  {result.pasos.map((step, i) => (
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
                  type="button"
                  onClick={() => setOpBase(base)}
                  aria-pressed={opBase === base}
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
              {ANCHOS.map(bits => (
                <button
                  key={bits}
                  type="button"
                  onClick={() => setBitWidth(bits)}
                  aria-pressed={bitWidth === bits}
                  className={`${styles.baseBtn} ${bitWidth === bits ? styles.baseBtnActive : ''}`}
                >
                  {bits} bits
                </button>
              ))}
            </div>
          </div>

          <div className={styles.operationInputs}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="operando-a">Operando A:</label>
              <input
                id="operando-a"
                type="text"
                value={operandA}
                onChange={(e) => setOperandA(e.target.value.toUpperCase())}
                placeholder={opBase === 10 ? '42' : opBase === 2 ? '101010' : opBase === 8 ? '52' : '2A'}
                className={styles.input}
              />
            </div>

            {operation !== 'not' && (
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="operando-b">Operando B:</label>
                <input
                  id="operando-b"
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
              {(Object.keys(operationLabels) as Operacion[]).map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperation(op)}
                  aria-pressed={operation === op}
                  className={`${styles.opBtn} ${operation === op ? styles.opBtnActive : ''}`}
                  title={operationLabels[op].description}
                >
                  <span className={styles.opSymbol}>{operationLabels[op].symbol}</span>
                  <span className={styles.opName}>{operationLabels[op].name}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={handleOperation} className={styles.calculateBtn}>
            Calcular
          </button>

          {opError && (
            <div role="alert" className={styles.errorMsg}>
              {opError}
            </div>
          )}

          {opResult && (
            <div className={styles.opResultCard} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.opResultHeader}>Resultado:</div>
              <div className={styles.opResultValue}>
                <div className={styles.opResultRow}>
                  <span>Binario:</span>
                  <code>{agruparBinario(opResult.resultado.toString(2).padStart(bitWidth, '0'))}</code>
                </div>
                <div className={styles.opResultRow}>
                  <span>Decimal:</span>
                  <code>{opResult.resultado}</code>
                </div>
                <div className={styles.opResultRow}>
                  <span>Hexadecimal:</span>
                  <code>{opResult.resultado.toString(16).toUpperCase()}</code>
                </div>
              </div>
              <div className={styles.opExplanation}>{opResult.explicacion}</div>
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

      <EducationalSection
        title="¿Quieres aprender más sobre sistemas numéricos?"
        subtitle="Conceptos fundamentales y aplicaciones prácticas"
        icon="🔢"
      >
        {/* 1. Tabla Comparativa */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)', fontSize: '1.4rem' }}>
            📊 Los 4 Sistemas Numéricos: Comparativa
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Binario (Base 2)</th>
                  <th>Octal (Base 8)</th>
                  <th>Decimal (Base 10)</th>
                  <th>Hexadecimal (Base 16)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Dígitos</strong></td>
                  <td>0, 1</td>
                  <td>0-7</td>
                  <td>0-9</td>
                  <td>0-9, A-F</td>
                </tr>
                <tr>
                  <td><strong>Bits por dígito</strong></td>
                  <td>1 bit</td>
                  <td>3 bits</td>
                  <td>~3,32 bits</td>
                  <td>4 bits (nibble)</td>
                </tr>
                <tr>
                  <td><strong>Compacidad</strong></td>
                  <td>Muy verboso</td>
                  <td>Moderado</td>
                  <td>Natural</td>
                  <td>Muy compacto</td>
                </tr>
                <tr>
                  <td><strong>Uso principal</strong></td>
                  <td>Hardware, electrónica</td>
                  <td>Unix/Linux (permisos)</td>
                  <td>Uso cotidiano</td>
                  <td>Programación, colores</td>
                </tr>
                <tr>
                  <td><strong>Conversión a BIN</strong></td>
                  <td>Directo</td>
                  <td>Grupos de 3 bits</td>
                  <td>División sucesiva</td>
                  <td>Grupos de 4 bits</td>
                </tr>
                <tr>
                  <td><strong>Ejemplo (42₁₀)</strong></td>
                  <td>101010₂</td>
                  <td>52₈</td>
                  <td>42₁₀</td>
                  <td>2A₁₆</td>
                </tr>
                <tr>
                  <td><strong>Prefijo código</strong></td>
                  <td>0b101010</td>
                  <td>052 o 0o52</td>
                  <td>(ninguno)</td>
                  <td>0x2A</td>
                </tr>
                <tr>
                  <td><strong>Lenguajes</strong></td>
                  <td>C, Python, ensamblador</td>
                  <td>C, Python (chmod)</td>
                  <td>Todos</td>
                  <td>Todos (colores, memoria)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Casos de Uso Prácticos */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)', fontSize: '1.4rem' }}>
            🎯 Casos de Uso Prácticos
          </h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔌</span>
                <strong>Electrónica y hardware digital</strong>
              </div>
              <p className={styles.escenarioExample}>
                El binario es el lenguaje de los circuitos. Un transistor = 1 bit (0V = 0, 5V = 1). Los ingenieros diseñan puertas lógicas AND/OR/XOR que operan en binario. Ej: un sumador de 8 bits = 8 puertas lógicas en cascada.
              </p>
              <span className={styles.escenarioTip}>Base fundamental del hardware</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🖥️</span>
                <strong>Colores en diseño web</strong>
              </div>
              <p className={styles.escenarioExample}>
                <code>#FF5733</code> es hexadecimal: R=FF(255), G=57(87), B=33(51). CSS, Photoshop y Figma usan hex. Ventaja: 2 dígitos hex = 1 byte de color. <code>rgba(255, 87, 51, 0.8)</code> = <code>#FF5733CC</code>.
              </p>
              <span className={styles.escenarioTip}>Esencial para diseñadores</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🐧</span>
                <strong>Permisos en Linux/Unix</strong>
              </div>
              <p className={styles.escenarioExample}>
                <code>chmod 755</code> usa octal: 7=rwx(111₂), 5=r-x(101₂). Cada dígito octal = 3 bits de permisos. <code>chmod 644</code> = rw-r--r--. Los sysadmins deben dominar octal.
              </p>
              <span className={styles.escenarioTip}>Clave en administración de sistemas</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔐</span>
                <strong>Criptografía y hashing</strong>
              </div>
              <p className={styles.escenarioExample}>
                SHA-256 produce 256 bits = 32 bytes = 64 caracteres hex. <code>abc</code> → <code>ba7816bf8f01cfea...</code> El hexadecimal hace legibles los hashes binarios. Bitcoin addresses son hashes en base58.
              </p>
              <span className={styles.escenarioTip}>Seguridad y blockchain</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
                <strong>Depuración de bajo nivel</strong>
              </div>
              <p className={styles.escenarioExample}>
                Al depurar con GDB o lldb, las direcciones de memoria son hex (<code>0x7fff5fbff8a0</code>). Los dumps de memoria en hexdump. Los registros de CPU en hex. Esencial para ingenieros de sistemas embebidos.
              </p>
              <span className={styles.escenarioTip}>Imprescindible en debugging</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📡</span>
                <strong>Protocolos de red</strong>
              </div>
              <p className={styles.escenarioExample}>
                Las IPs en binario: 192.168.1.1 = 11000000.10101000.00000001.00000001. Las máscaras de subred: /24 = 11111111.11111111.11111111.00000000. Los bytes de los protocolos TCP/IP se leen en hex.
              </p>
              <span className={styles.escenarioTip}>Redes y telecomunicaciones</span>
            </div>
          </div>
        </div>

        {/* 3. FAQ Ampliado */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)', fontSize: '1.4rem' }}>
            ❓ Preguntas Frecuentes
          </h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué los ordenadores usan binario y no decimal?</h4>
              <p>Los transistores tienen dos estados estables: conducción (1) y corte (0). Intentar representar 10 estados analógicos es difícil y propenso a errores por ruido eléctrico. El binario es simple, robusto y escalable a miles de millones de transistores.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Para qué sirve el hexadecimal si tenemos decimal?</h4>
              <p>Cada dígito hex representa exactamente 4 bits (un nibble). Un byte = 2 dígitos hex. 1 GB = 0x40000000 (8 dígitos vs 10 decimales). Más compacto para leer datos binarios. Los colores RGB (0-255) se expresan perfectamente en 2 dígitos hex.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo se usa el octal hoy en día?</h4>
              <p>Principalmente en sistemas Unix/Linux para permisos de archivos (chmod). También en C para representar bytes (aunque hex es más común ahora). Históricamente usado cuando los ordenadores tenían arquitecturas de 12 o 36 bits (múltiplos de 3).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el complemento a 2 y para qué sirve?</h4>
              <p>Es la forma estándar de representar números negativos en binario. Para negar un número: invierte todos los bits y suma 1. Ventaja: la suma funciona igual para positivos y negativos sin circuitos especiales. Ejemplo: -5 en 8 bits = NOT(00000101) + 1 = 11111011.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo funciona el desplazamiento de bits (shift)?</h4>
              <p><code>n &lt;&lt; 1</code> multiplica por 2 (añade un 0 a la derecha). <code>n &gt;&gt; 1</code> divide por 2 (elimina el bit menos significativo). Mucho más rápido que multiplicar/dividir. <code>1 &lt;&lt; 10 = 1024</code> (2^10). Usado en optimizaciones de videojuegos y sistemas embebidos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es un nibble, un byte y una palabra?</h4>
              <p>Nibble = 4 bits = 1 dígito hex (0-15). Byte = 8 bits = 2 dígitos hex (0-255). Word = depende de la arquitectura (16 bits en x86 legacy, 32 en 32-bit, 64 en 64-bit). Kilobyte = 1024 bytes = 2^10 (no 1000).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué 1 KB son 1024 bytes y no 1000?</h4>
              <p>En binario, las potencias de 2 son naturales: 2^10 = 1024 ≈ 1000. Los fabricantes de discos usan 1000 (decimal), el SO muestra 1024 (binario). Por eso un disco de "1 TB" aparece como 931 GB en Windows. ISO definió KiB (kibibyte = 1024) para distinguir.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo convierto mentalmente hex a binario rápido?</h4>
              <p>Memoriza: 0=0000, 1=0001, ..., 9=1001, A=1010, B=1011, C=1100, D=1101, E=1110, F=1111. Luego convierte dígito a dígito: 0xAB = 1010 1011. Con práctica se hace en segundos. Trucos: F siempre es 1111, 8 siempre es 1000.</p>
            </div>
          </div>
        </div>

        {/* 4. Guía Paso a Paso */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)', fontSize: '1.4rem' }}>
            📋 Guía Paso a Paso: Convertir entre Bases
          </h3>
          <div className={styles.stepGuide}>
            {[
              {
                n: 1,
                title: 'Identifica la base origen y destino',
                desc: '¿De dónde a dónde? Si no es a decimal, siempre pasa por decimal como base intermedia (excepto BIN↔HEX que tienen atajo directo).',
              },
              {
                n: 2,
                title: 'BIN→HEX sin pasar por decimal',
                desc: 'Agrupa los bits en grupos de 4 desde la derecha. 10110111 → 1011|0111 → B|7 → 0xB7. Atajo extremadamente útil.',
              },
              {
                n: 3,
                title: 'HEX→BIN sin pasar por decimal',
                desc: 'Cada dígito hex = 4 bits. 0x3F → 0011|1111 → 00111111. Simple y reversible.',
              },
              {
                n: 4,
                title: 'Cualquier base→Decimal',
                desc: 'Multiplica cada dígito por la base elevada a su posición (de derecha a izquierda, empezando en 0). 1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11₁₀.',
              },
              {
                n: 5,
                title: 'Decimal→cualquier base',
                desc: 'Divide el número por la base repetidamente. Los restos leídos de abajo a arriba son el resultado. 42 ÷ 2: 21r0, 10r1, 5r0, 2r1, 1r0, 0r1 → 101010₂.',
              },
              {
                n: 6,
                title: 'Verifica el resultado',
                desc: 'Convierte el resultado de vuelta a decimal para comprobar. Si coincide con el original, la conversión es correcta.',
              },
              {
                n: 7,
                title: 'Practica con el playground',
                desc: 'Usa esta calculadora para verificar tus conversiones manuales. Los pasos detallados te muestran el proceso completo.',
              },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'var(--spacing-lg)' }}>
                <div className={styles.stepNumber}>{n}</div>
                <div className={styles.stepContent}>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Mejores Prácticas */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)', fontSize: '1.4rem' }}>
            ✅ Mejores Prácticas
          </h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Usa prefijos estándar en código</strong>
              <p><code>0b</code> para binario, <code>0o</code> para octal, <code>0x</code> para hex. <code>int a = 0xFF;</code> es más claro que <code>int a = 255;</code> cuando trabajas con bytes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Domina el truco BIN↔HEX</strong>
              <p>4 bits = 1 dígito hex. Convierte en grupos de 4 de derecha a izquierda. Esencial para leer dumps de memoria y hashes criptográficos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Permisos Linux en octal</strong>
              <p>Memoriza rwx=7, rw-=6, r-x=5, r--=4, ---=0. <code>chmod 755</code> = propietario rwx, grupo r-x, otros r-x. Muy frecuente en administración de sistemas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Piensa en potencias de 2</strong>
              <p>2^8=256, 2^10=1024≈1K, 2^16=65536, 2^32=4G. Memorizar estas potencias acelera el trabajo con sistemas de 8, 16, 32 y 64 bits.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>AND, OR y XOR para bits</strong>
              <p><code>valor &amp; 0x0F</code> extrae los 4 bits menos significativos. <code>valor | 0x80</code> activa el bit 7. <code>valor ^ 0xFF</code> invierte todos los bits.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Calculadora de programador del SO</strong>
              <p>Windows (Calc→Prog), macOS (Calc→Programmer), Linux (speedcrunch). Para conversiones rápidas sin abrir el IDE.</p>
            </div>
          </div>
        </div>

        {/* 6. Warning Box */}
        <div className={styles.warningBox} style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores Comunes al Trabajar con Sistemas Numéricos</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>El cero inicial en C/C++ significa octal:</strong> <code>int x = 0755;</code> NO es 755 decimal, es 755 en octal = 493 decimal. Un bug clásico en permisos de archivos programados en C.</li>
            <li><strong>Confundir unsigned y signed en operaciones de bits:</strong> En C, <code>char</code> puede ser signed (-128 a 127) o unsigned (0-255) según la plataforma. <code>(char)0xFF = -1</code> en signed, 255 en unsigned. Usar <code>uint8_t</code> para ser explícito.</li>
            <li><strong>Overflow silencioso:</strong> <code>uint8_t x = 255; x++;</code> → x = 0, sin error ni aviso. En Python los enteros son de precisión arbitraria (no hay overflow). En C/Java/Rust sí ocurre.</li>
            <li><strong>Shift de bits fuera de rango:</strong> <code>1 &lt;&lt; 32</code> en C con int de 32 bits es undefined behavior. En JavaScript los bits extras se descartan. Usa <code>BigInt</code> en JS o <code>1LL &lt;&lt; 32</code> en C para shifts grandes.</li>
            <li><strong>Mezclar BIN y OCT mentalmente:</strong> El octal NO incluye los dígitos 8 y 9. <code>078</code> es inválido en octal. En Python 3, <code>0o78</code> da error de sintaxis (correcto). En Python 2, <code>078</code> era tratado como decimal (bug silencioso).</li>
            <li><strong>Asumir que -1 en hex es 0xFF:</strong> Solo es cierto para 8 bits. En 16 bits, -1 = 0xFFFF. En 32 bits, -1 = 0xFFFFFFFF. Al hacer cast de tipos distintos, los bits extra se propagan o truncan.</li>
          </ul>
        </div>

        {/* 7. Conceptos Clave (infoCards originales) */}
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)', fontSize: '1.4rem' }}>
            💡 Conceptos Clave
          </h3>
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
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-sistemas-numericos')} />
      <ShareCard appName="calculadora-sistemas-numericos" />
      <Footer appName="calculadora-sistemas-numericos" />
    </div>
  );
}
