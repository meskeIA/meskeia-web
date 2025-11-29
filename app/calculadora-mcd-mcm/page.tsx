'use client';

import { useState } from 'react';
import styles from './CalculadoraMcdMcm.module.css';
import { MeskeiaLogo, Footer, ResultCard } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';

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

      <section className={styles.infoSection}>
        <h2>¿Qué son el MCD y el MCM?</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>MCD - Máximo Común Divisor</h3>
            <p>Es el mayor número que divide exactamente a todos los números dados. Se usa para simplificar fracciones.</p>
            <div className={styles.example}>
              <strong>Ejemplo:</strong> MCD(12, 18) = 6<br />
              Porque 6 es el mayor número que divide a 12 y a 18.
            </div>
          </div>
          <div className={styles.infoCard}>
            <h3>MCM - Mínimo Común Múltiplo</h3>
            <p>Es el menor número que es múltiplo de todos los números dados. Se usa para sumar fracciones con distinto denominador.</p>
            <div className={styles.example}>
              <strong>Ejemplo:</strong> MCM(4, 6) = 12<br />
              Porque 12 es el menor número divisible por 4 y por 6.
            </div>
          </div>
        </div>
      </section>

      <Footer appName="calculadora-mcd-mcm" />
    </div>
  );
}
