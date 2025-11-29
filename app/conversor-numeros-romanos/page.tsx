'use client';

import { useState } from 'react';
import styles from './ConversorNumerosRomanos.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { formatNumber } from '@/lib';

type ModoType = 'arabigo-romano' | 'romano-arabigo';

const VALORES_ROMANOS: [string, number][] = [
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
  ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
  ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
];

const SIMBOLOS_ROMANOS: Record<string, number> = {
  'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
};

export default function ConversorNumerosRomanosPage() {
  const [modo, setModo] = useState<ModoType>('arabigo-romano');
  const [entrada, setEntrada] = useState('');
  const [resultado, setResultado] = useState('');
  const [error, setError] = useState('');
  const [desglose, setDesglose] = useState<string[]>([]);

  const arabigoARomano = (num: number): { romano: string; pasos: string[] } => {
    if (num < 1 || num > 3999) {
      throw new Error('El número debe estar entre 1 y 3999');
    }

    let resultado = '';
    let restante = num;
    const pasos: string[] = [];

    for (const [simbolo, valor] of VALORES_ROMANOS) {
      while (restante >= valor) {
        resultado += simbolo;
        restante -= valor;
        pasos.push(`${simbolo} = ${formatNumber(valor, 0)}`);
      }
    }

    return { romano: resultado, pasos };
  };

  const romanoAArabigo = (romano: string): { numero: number; pasos: string[] } => {
    const input = romano.toUpperCase().trim();
    if (!/^[IVXLCDM]+$/.test(input)) {
      throw new Error('Solo se permiten los símbolos I, V, X, L, C, D, M');
    }

    let resultado = 0;
    const pasos: string[] = [];

    for (let i = 0; i < input.length; i++) {
      const actual = SIMBOLOS_ROMANOS[input[i]];
      const siguiente = SIMBOLOS_ROMANOS[input[i + 1]] || 0;

      if (actual < siguiente) {
        resultado -= actual;
        pasos.push(`${input[i]} (resta ${formatNumber(actual, 0)})`);
      } else {
        resultado += actual;
        pasos.push(`${input[i]} = ${formatNumber(actual, 0)}`);
      }
    }

    return { numero: resultado, pasos };
  };

  const convertir = () => {
    setError('');
    setResultado('');
    setDesglose([]);

    try {
      if (modo === 'arabigo-romano') {
        const num = parseInt(entrada, 10);
        if (isNaN(num)) {
          throw new Error('Introduce un número válido');
        }
        const { romano, pasos } = arabigoARomano(num);
        setResultado(romano);
        setDesglose(pasos);
      } else {
        const { numero, pasos } = romanoAArabigo(entrada);
        setResultado(formatNumber(numero, 0));
        setDesglose(pasos);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const intercambiar = () => {
    setModo(modo === 'arabigo-romano' ? 'romano-arabigo' : 'arabigo-romano');
    setEntrada('');
    setResultado('');
    setDesglose([]);
    setError('');
  };

  const ejemploRapido = (valor: number | string) => {
    setEntrada(String(valor));
    setError('');
  };

  const ejemplos = modo === 'arabigo-romano'
    ? [2024, 1999, 500, 49, 14, 9]
    : ['MMXXIV', 'MCMXCIX', 'XLIX', 'XIV', 'IX', 'IV'];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Números Romanos</h1>
        <p className={styles.subtitle}>
          Convierte entre números arábigos (1, 2, 3...) y romanos (I, II, III...)
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${modo === 'arabigo-romano' ? styles.active : ''}`}
            onClick={() => { setModo('arabigo-romano'); setEntrada(''); setResultado(''); setDesglose([]); setError(''); }}
          >
            Arábigo → Romano
          </button>
          <button
            className={`${styles.modeBtn} ${modo === 'romano-arabigo' ? styles.active : ''}`}
            onClick={() => { setModo('romano-arabigo'); setEntrada(''); setResultado(''); setDesglose([]); setError(''); }}
          >
            Romano → Arábigo
          </button>
        </div>

        <div className={styles.converterBox}>
          <div className={styles.inputSection}>
            <label className={styles.label}>
              {modo === 'arabigo-romano' ? 'Número arábigo (1-3999)' : 'Número romano'}
            </label>
            <input
              type="text"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder={modo === 'arabigo-romano' ? 'Ej: 2024' : 'Ej: MMXXIV'}
              className={styles.input}
            />
            <div className={styles.quickExamples}>
              <span className={styles.quickLabel}>Ejemplos:</span>
              {ejemplos.map((ej) => (
                <button
                  key={String(ej)}
                  onClick={() => ejemploRapido(ej)}
                  className={styles.quickBtn}
                >
                  {ej}
                </button>
              ))}
            </div>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.buttonRow}>
            <button onClick={convertir} className={styles.btnPrimary}>
              Convertir
            </button>
            <button onClick={intercambiar} className={styles.btnSwap} title="Intercambiar">
              ⇄
            </button>
          </div>

          {resultado && (
            <div className={styles.resultSection}>
              <div className={styles.resultBox}>
                <span className={styles.resultLabel}>Resultado:</span>
                <span className={styles.resultValue}>{resultado}</span>
              </div>

              {desglose.length > 0 && (
                <div className={styles.breakdown}>
                  <h4>Desglose:</h4>
                  <div className={styles.breakdownItems}>
                    {desglose.map((paso, i) => (
                      <span key={i} className={styles.breakdownItem}>{paso}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <section className={styles.referenceSection}>
        <h2>Tabla de Símbolos Romanos</h2>
        <div className={styles.symbolsGrid}>
          {[
            { s: 'I', v: 1 }, { s: 'V', v: 5 }, { s: 'X', v: 10 },
            { s: 'L', v: 50 }, { s: 'C', v: 100 }, { s: 'D', v: 500 }, { s: 'M', v: 1000 }
          ].map(({ s, v }) => (
            <div key={s} className={styles.symbolCard}>
              <span className={styles.symbol}>{s}</span>
              <span className={styles.value}>{formatNumber(v, 0)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.rulesSection}>
        <h2>Reglas de los Números Romanos</h2>
        <div className={styles.rulesGrid}>
          <div className={styles.ruleCard}>
            <h3>📝 Suma</h3>
            <p>Si un símbolo va seguido de otro de igual o menor valor, se suman.</p>
            <code>VI = 5 + 1 = 6</code>
          </div>
          <div className={styles.ruleCard}>
            <h3>➖ Resta</h3>
            <p>Si un símbolo de menor valor precede a uno mayor, se resta.</p>
            <code>IV = 5 - 1 = 4</code>
          </div>
          <div className={styles.ruleCard}>
            <h3>🔢 Repetición</h3>
            <p>Un símbolo puede repetirse hasta 3 veces consecutivas (I, X, C, M).</p>
            <code>III = 3, XXX = 30</code>
          </div>
          <div className={styles.ruleCard}>
            <h3>⚠️ Límites</h3>
            <p>V, L y D nunca se repiten. El máximo representable es 3999 (MMMCMXCIX).</p>
            <code>No: VV, LL, DD</code>
          </div>
        </div>
      </section>

      <Footer appName="conversor-numeros-romanos" />
    </div>
  );
}
