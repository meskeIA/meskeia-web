'use client';

import { useState } from 'react';
import styles from './CalculadoraPorcentajes.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type CalculationType = 'percentOf' | 'whatPercent' | 'increase' | 'decrease' | 'variation';

interface CalculationMode {
  id: CalculationType;
  title: string;
  icon: string;
  description: string;
  input1Label: string;
  input2Label: string;
  resultLabel: string;
}

const MODES: CalculationMode[] = [
  {
    id: 'percentOf',
    title: '¿Cuánto es el X% de Y?',
    icon: '🔢',
    description: 'Calcular el porcentaje de una cantidad',
    input1Label: 'Porcentaje (%)',
    input2Label: 'Cantidad',
    resultLabel: 'Resultado',
  },
  {
    id: 'whatPercent',
    title: '¿Qué % es X de Y?',
    icon: '❓',
    description: 'Qué porcentaje representa una cantidad de otra',
    input1Label: 'Cantidad parcial',
    input2Label: 'Cantidad total',
    resultLabel: 'Porcentaje',
  },
  {
    id: 'increase',
    title: 'Aumentar X en Y%',
    icon: '📈',
    description: 'Aumentar una cantidad en un porcentaje',
    input1Label: 'Cantidad inicial',
    input2Label: 'Porcentaje de aumento (%)',
    resultLabel: 'Cantidad final',
  },
  {
    id: 'decrease',
    title: 'Disminuir X en Y%',
    icon: '📉',
    description: 'Disminuir una cantidad en un porcentaje',
    input1Label: 'Cantidad inicial',
    input2Label: 'Porcentaje de disminución (%)',
    resultLabel: 'Cantidad final',
  },
  {
    id: 'variation',
    title: 'Variación de X a Y',
    icon: '🔄',
    description: 'Calcular el cambio porcentual entre dos valores',
    input1Label: 'Valor inicial',
    input2Label: 'Valor final',
    resultLabel: 'Variación',
  },
];

export default function CalculadoraPorcentajesPage() {
  const [mode, setMode] = useState<CalculationType>('percentOf');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [resultado, setResultado] = useState<string | null>(null);
  const [detalles, setDetalles] = useState<string>('');

  const currentMode = MODES.find((m) => m.id === mode)!;

  const calcular = () => {
    const val1 = parseSpanishNumber(input1);
    const val2 = parseSpanishNumber(input2);

    if (isNaN(val1) || isNaN(val2)) {
      setResultado(null);
      return;
    }

    let result: number;
    let detail: string;

    switch (mode) {
      case 'percentOf':
        result = (val1 / 100) * val2;
        detail = `El ${formatNumber(val1, 2)}% de ${formatNumber(val2, 2)} es ${formatNumber(result, 2)}`;
        break;

      case 'whatPercent':
        if (val2 === 0) {
          setResultado('Error: división por cero');
          setDetalles('');
          return;
        }
        result = (val1 / val2) * 100;
        detail = `${formatNumber(val1, 2)} representa el ${formatNumber(result, 2)}% de ${formatNumber(val2, 2)}`;
        break;

      case 'increase':
        result = val1 * (1 + val2 / 100);
        const aumentoAbs = result - val1;
        detail = `${formatNumber(val1, 2)} + ${formatNumber(val2, 2)}% = ${formatNumber(result, 2)} (aumento de ${formatNumber(aumentoAbs, 2)})`;
        break;

      case 'decrease':
        result = val1 * (1 - val2 / 100);
        const disminucionAbs = val1 - result;
        detail = `${formatNumber(val1, 2)} - ${formatNumber(val2, 2)}% = ${formatNumber(result, 2)} (disminución de ${formatNumber(disminucionAbs, 2)})`;
        break;

      case 'variation':
        if (val1 === 0) {
          setResultado('Error: valor inicial cero');
          setDetalles('');
          return;
        }
        result = ((val2 - val1) / val1) * 100;
        const direccion = result >= 0 ? 'aumento' : 'disminución';
        detail = `De ${formatNumber(val1, 2)} a ${formatNumber(val2, 2)} hay un ${direccion} del ${formatNumber(Math.abs(result), 2)}%`;
        break;

      default:
        return;
    }

    if (mode === 'whatPercent' || mode === 'variation') {
      setResultado(`${formatNumber(result, 2)}%`);
    } else {
      setResultado(formatNumber(result, 2));
    }
    setDetalles(detail);
  };

  const limpiar = () => {
    setInput1('');
    setInput2('');
    setResultado(null);
    setDetalles('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Porcentajes</h1>
        <p className={styles.subtitle}>
          5 modos de cálculo para resolver cualquier problema con porcentajes
        </p>
      </header>

      <LegalNotice />

      <div className={styles.modeSelector}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`${styles.modeBtn} ${mode === m.id ? styles.active : ''}`}
            onClick={() => {
              setMode(m.id);
              limpiar();
            }}
          >
            <span className={styles.modeIcon}>{m.icon}</span>
            <span className={styles.modeTitle}>{m.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <div className={styles.modeDescription}>
            <span className={styles.descIcon}>{currentMode.icon}</span>
            <p>{currentMode.description}</p>
          </div>

          <NumberInput
            value={input1}
            onChange={setInput1}
            label={currentMode.input1Label}
            placeholder="0"
          />

          <NumberInput
            value={input2}
            onChange={setInput2}
            label={currentMode.input2Label}
            placeholder="0"
          />

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular
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
                title={currentMode.resultLabel}
                value={resultado}
                variant="highlight"
                icon="✅"
              />
              <div className={styles.detailBox}>
                <p>{detalles}</p>
              </div>

              <div className={styles.formulaBox}>
                <h4>Fórmula utilizada:</h4>
                {mode === 'percentOf' && <p>Resultado = (Porcentaje / 100) × Cantidad</p>}
                {mode === 'whatPercent' && <p>Porcentaje = (Parcial / Total) × 100</p>}
                {mode === 'increase' && <p>Final = Inicial × (1 + Porcentaje / 100)</p>}
                {mode === 'decrease' && <p>Final = Inicial × (1 - Porcentaje / 100)</p>}
                {mode === 'variation' && <p>Variación = ((Final - Inicial) / Inicial) × 100</p>}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>%</span>
              <p>Introduce los valores y pulsa &quot;Calcular&quot;</p>
            </div>
          )}
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('calculadora-porcentajes')} />

      <ShareCard appName="calculadora-porcentajes" />
      <Footer appName="calculadora-porcentajes" />
    </div>
  );
}
