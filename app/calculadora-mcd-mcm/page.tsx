'use client';

import { useState } from 'react';
import styles from './CalculadoraMcdMcm.module.css';
import { MeskeiaLogo, Footer, ResultCard, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface Resultado {
  mcd: number;
  mcm: number;
  factoresMcd: Map<number, number>;
  factoresMcm: Map<number, number>;
  numeros: number[];
}

// Calcular MCD de dos números usando algoritmo de Euclides
function mcdDos(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Calcular MCM de dos números
function mcmDos(a: number, b: number): number {
  return Math.abs(a * b) / mcdDos(a, b);
}

// Calcular MCD de array de números
function mcdArray(nums: number[]): number {
  return nums.reduce((acc, num) => mcdDos(acc, num));
}

// Calcular MCM de array de números
function mcmArray(nums: number[]): number {
  return nums.reduce((acc, num) => mcmDos(acc, num));
}

// Factorizar un número
function factorizar(n: number): Map<number, number> {
  const factores = new Map<number, number>();
  let num = Math.abs(n);
  let divisor = 2;

  while (num > 1) {
    while (num % divisor === 0) {
      factores.set(divisor, (factores.get(divisor) || 0) + 1);
      num = num / divisor;
    }
    divisor++;
  }

  return factores;
}

// Obtener factores comunes (para MCD)
function factoresMcd(numeros: number[]): Map<number, number> {
  const todosFactores = numeros.map(n => factorizar(n));
  const resultado = new Map<number, number>();

  if (todosFactores.length === 0) return resultado;

  // Obtener todos los primos del primer número
  const primerFactores = todosFactores[0];

  primerFactores.forEach((exp, primo) => {
    let minExp = exp;
    // Verificar si el primo está en todos los demás y obtener mínimo exponente
    for (let i = 1; i < todosFactores.length; i++) {
      const expEnOtro = todosFactores[i].get(primo);
      if (expEnOtro === undefined) {
        minExp = 0;
        break;
      }
      minExp = Math.min(minExp, expEnOtro);
    }
    if (minExp > 0) {
      resultado.set(primo, minExp);
    }
  });

  return resultado;
}

// Obtener todos los factores (para MCM)
function factoresMcm(numeros: number[]): Map<number, number> {
  const todosFactores = numeros.map(n => factorizar(n));
  const resultado = new Map<number, number>();

  todosFactores.forEach(factores => {
    factores.forEach((exp, primo) => {
      const expActual = resultado.get(primo) || 0;
      resultado.set(primo, Math.max(expActual, exp));
    });
  });

  return resultado;
}

export default function CalculadoraMcdMcmPage() {
  const [inputs, setInputs] = useState(['', '', '']);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (index: number) => {
    if (inputs.length > 2) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const calcular = () => {
    setError('');
    setResultado(null);

    // Parsear y validar números
    const numeros: number[] = [];
    for (const input of inputs) {
      if (input.trim() === '') continue;
      const num = parseSpanishNumber(input);
      if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
        setError('Todos los valores deben ser números enteros positivos');
        return;
      }
      numeros.push(num);
    }

    if (numeros.length < 2) {
      setError('Introduce al menos 2 números');
      return;
    }

    const mcd = mcdArray(numeros);
    const mcm = mcmArray(numeros);

    setResultado({
      mcd,
      mcm,
      factoresMcd: factoresMcd(numeros),
      factoresMcm: factoresMcm(numeros),
      numeros,
    });
  };

  const limpiar = () => {
    setInputs(['', '', '']);
    setResultado(null);
    setError('');
  };

  const formatFactores = (factores: Map<number, number>): string => {
    if (factores.size === 0) return '1';
    const parts: string[] = [];
    const sortedKeys = Array.from(factores.keys()).sort((a, b) => a - b);
    sortedKeys.forEach(primo => {
      const exp = factores.get(primo)!;
      if (exp === 1) {
        parts.push(`${primo}`);
      } else {
        parts.push(`${primo}^${exp}`);
      }
    });
    return parts.join(' × ');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora MCD y MCM</h1>
        <p className={styles.subtitle}>
          Calcula el Máximo Común Divisor y Mínimo Común Múltiplo de hasta 5 números
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2>Introduce los números</h2>

          <div className={styles.inputList}>
            {inputs.map((input, index) => (
              <div key={index} className={styles.inputRow}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Número ${index + 1}`}
                  className={styles.numberInput}
                />
                {inputs.length > 2 && (
                  <button
                    onClick={() => removeInput(index)}
                    className={styles.removeBtn}
                    title="Eliminar"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {inputs.length < 5 && (
            <button onClick={addInput} className={styles.addBtn}>
              + Añadir número
            </button>
          )}

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular MCD y MCM
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <ResultCard
                title="MCD (Máximo Común Divisor)"
                value={formatNumber(resultado.mcd, 0)}
                variant="highlight"
                icon="🔢"
                description="El mayor número que divide a todos"
              />

              <ResultCard
                title="MCM (Mínimo Común Múltiplo)"
                value={formatNumber(resultado.mcm, 0)}
                variant="info"
                icon="✖️"
                description="El menor múltiplo común a todos"
              />

              <div className={styles.explanationBox}>
                <h3>Descomposición en factores primos</h3>

                <div className={styles.factorizationGrid}>
                  {resultado.numeros.map((num, i) => (
                    <div key={i} className={styles.factorRow}>
                      <span className={styles.numLabel}>{formatNumber(num, 0)} =</span>
                      <span className={styles.factors}>{formatFactores(factorizar(num))}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.methodBox}>
                  <div className={styles.methodItem}>
                    <strong>MCD = {formatNumber(resultado.mcd, 0)}</strong>
                    <p>Factores comunes con menor exponente:</p>
                    <code>{formatFactores(resultado.factoresMcd) || '1'}</code>
                  </div>

                  <div className={styles.methodItem}>
                    <strong>MCM = {formatNumber(resultado.mcm, 0)}</strong>
                    <p>Todos los factores con mayor exponente:</p>
                    <code>{formatFactores(resultado.factoresMcm)}</code>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🔢</span>
              <p>Introduce al menos 2 números y pulsa &quot;Calcular&quot;</p>
            </div>
          )}
        </div>
      </div>

      <EducationalSection
        title="MCD y MCM: Guía Completa"
        subtitle="Entiende el algoritmo de Euclides, la factorización en primos y las aplicaciones del MCD y MCM en matemáticas y programación"
        icon="🔢"
      >
        <section>
          <h4>¿Qué son el MCD y el MCM?</h4>
          <ul>
            <li><strong>MCD (Máximo Común Divisor)</strong>: El mayor número entero positivo que divide exactamente a todos los números dados sin dejar resto. También llamado GCD en inglés (Greatest Common Divisor).</li>
            <li><strong>MCM (Mínimo Común Múltiplo)</strong>: El menor número entero positivo que es múltiplo de todos los números dados. También llamado LCM (Least Common Multiple).</li>
          </ul>
          <p><strong>Relación entre MCD y MCM</strong> (para dos números a y b): <code>MCD(a,b) × MCM(a,b) = a × b</code></p>
          <p>Ejemplo: MCD(12,18) = 6 y MCM(12,18) = 36 → 6 × 36 = 216 = 12 × 18 ✓</p>
        </section>

        <section>
          <h4>El algoritmo de Euclides: la forma más eficiente</h4>
          <p>El <strong>algoritmo de Euclides</strong> (≈300 a.C.) es uno de los algoritmos más antiguos conocidos y sigue siendo el más eficiente para calcular el MCD. Su principio: <em>MCD(a, b) = MCD(b, a mod b)</em>, y se repite hasta que el resto es 0.</p>
          <p><strong>Ejemplo paso a paso: MCD(48, 18)</strong></p>
          <ul>
            <li>MCD(48, 18): 48 = 2×18 + 12 → resto 12</li>
            <li>MCD(18, 12): 18 = 1×12 + 6 → resto 6</li>
            <li>MCD(12, 6): 12 = 2×6 + 0 → resto 0 → ¡MCD = 6!</li>
          </ul>
          <p>Esta herramienta usa el algoritmo de Euclides internamente. Para más de dos números: MCD(a,b,c) = MCD(MCD(a,b), c).</p>
        </section>

        <section>
          <h4>Método de factorización en primos</h4>
          <p>Alternativa al algoritmo de Euclides, más visual para aprender:</p>
          <ul>
            <li><strong>Para el MCD</strong>: Descompone cada número en factores primos. Toma los factores <em>comunes</em> con el <em>menor</em> exponente.</li>
            <li><strong>Para el MCM</strong>: Toma <em>todos</em> los factores (comunes y no comunes) con el <em>mayor</em> exponente.</li>
          </ul>
          <p><strong>Ejemplo: MCD y MCM de 12 y 18</strong></p>
          <ul>
            <li>12 = 2² × 3¹</li>
            <li>18 = 2¹ × 3²</li>
            <li>MCD = 2¹ × 3¹ = <strong>6</strong> (factores comunes, menor exponente)</li>
            <li>MCM = 2² × 3² = <strong>36</strong> (todos los factores, mayor exponente)</li>
          </ul>
        </section>

        <section>
          <h4>Aplicaciones en matemáticas</h4>
          <ul>
            <li><strong>Simplificar fracciones</strong>: Divide numerador y denominador por su MCD. Ej: 18/24 → MCD(18,24)=6 → 18/6 / 24/6 = 3/4.</li>
            <li><strong>Sumar fracciones con distinto denominador</strong>: El mínimo común denominador es el MCM de los denominadores. Ej: 1/4 + 1/6 → MCM(4,6)=12 → 3/12 + 2/12 = 5/12.</li>
            <li><strong>Problemas de distribución equitativa</strong>: ¿Cuántos grupos iguales máximos puedes formar con 24 manzanas y 36 naranjas? MCD(24,36) = 12 grupos, cada uno con 2 manzanas y 3 naranjas.</li>
            <li><strong>Números primos entre sí (coprimos)</strong>: Dos números son coprimos si su MCD = 1. Ej: MCD(8,9) = 1 → son coprimos aunque ninguno sea primo.</li>
          </ul>
        </section>

        <section>
          <h4>Aplicaciones en programación y tecnología</h4>
          <ul>
            <li><strong>Sincronización de ciclos</strong>: Si un proceso A se repite cada 6 segundos y B cada 4 segundos, ¿cuándo coinciden? MCM(6,4) = 12 segundos.</li>
            <li><strong>Reducción de razones en interfaces</strong>: Las relaciones de aspecto de pantallas (16:9, 4:3) se expresan reduciendo por su MCD. 1920×1080: MCD(1920,1080)=120 → 16:9.</li>
            <li><strong>Criptografía RSA</strong>: El algoritmo de Euclides extendido es fundamental para calcular el inverso modular, que es la base del cifrado RSA.</li>
            <li><strong>Algoritmos de fracciones en software</strong>: Calculadoras, hojas de cálculo y lenguajes de programación con tipos racionales (Python <code>fractions.Fraction</code>) usan el MCD para mantener fracciones en forma reducida.</li>
          </ul>
        </section>

        <section>
          <h4>Curiosidades y propiedades</h4>
          <ul>
            <li>MCD(a, 0) = a (cualquier número divide a 0)</li>
            <li>MCD(a, a) = a</li>
            <li>Si a divide a b, entonces MCD(a, b) = a y MCM(a, b) = b</li>
            <li>El algoritmo de Euclides tiene complejidad O(log min(a,b)) — extremadamente eficiente incluso con números muy grandes</li>
            <li>El MCD de los n primeros números naturales crece lentamente: MCD(1,2,...,n) = 1 para n &gt; 2, pero el MCM crece aproximadamente como e^n (función del primo más grande ≤ n)</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-mcd-mcm')} />

      <ShareCard appName="calculadora-mcd-mcm" />
      <Footer appName="calculadora-mcd-mcm" />
    </div>
  );
}
