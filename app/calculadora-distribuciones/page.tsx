'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraDistribuciones.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import jStat from 'jstat';

type DistributionType = 'normal' | 'poisson' | 'exponential' | 'uniform' | 'gamma' | 'beta' | 'binomial' | 'student';

interface DistributionConfig {
  id: DistributionType;
  name: string;
  icon: string;
  description: string;
  params: {
    name: string;
    symbol: string;
    default: string;
    min?: number;
    max?: number;
    step?: number;
    help: string;
  }[];
  isContinuous: boolean;
}

const distributions: DistributionConfig[] = [
  {
    id: 'normal',
    name: 'Normal (Gaussiana)',
    icon: '📊',
    description: 'Distribución en campana, la más importante en estadística',
    params: [
      { name: 'Media', symbol: 'μ', default: '0', help: 'Centro de la distribución' },
      { name: 'Desviación estándar', symbol: 'σ', default: '1', min: 0.001, help: 'Dispersión de los datos (debe ser > 0)' },
    ],
    isContinuous: true,
  },
  {
    id: 'poisson',
    name: 'Poisson',
    icon: '🎲',
    description: 'Eventos raros en un intervalo de tiempo o espacio',
    params: [
      { name: 'Lambda', symbol: 'λ', default: '5', min: 0.001, help: 'Tasa media de ocurrencias (debe ser > 0)' },
    ],
    isContinuous: false,
  },
  {
    id: 'exponential',
    name: 'Exponencial',
    icon: '⏱️',
    description: 'Tiempo entre eventos en un proceso de Poisson',
    params: [
      { name: 'Lambda (tasa)', symbol: 'λ', default: '1', min: 0.001, help: 'Tasa de ocurrencias por unidad de tiempo' },
    ],
    isContinuous: true,
  },
  {
    id: 'uniform',
    name: 'Uniforme',
    icon: '📐',
    description: 'Todos los valores tienen la misma probabilidad',
    params: [
      { name: 'Mínimo', symbol: 'a', default: '0', help: 'Valor mínimo del rango' },
      { name: 'Máximo', symbol: 'b', default: '1', help: 'Valor máximo del rango' },
    ],
    isContinuous: true,
  },
  {
    id: 'gamma',
    name: 'Gamma',
    icon: '📈',
    description: 'Generalización de exponencial, útil para tiempos de espera',
    params: [
      { name: 'Forma', symbol: 'α', default: '2', min: 0.001, help: 'Parámetro de forma (shape)' },
      { name: 'Escala', symbol: 'β', default: '1', min: 0.001, help: 'Parámetro de escala (scale)' },
    ],
    isContinuous: true,
  },
  {
    id: 'beta',
    name: 'Beta',
    icon: '🔄',
    description: 'Probabilidades y proporciones entre 0 y 1',
    params: [
      { name: 'Alfa', symbol: 'α', default: '2', min: 0.001, help: 'Parámetro de forma alfa' },
      { name: 'Beta', symbol: 'β', default: '5', min: 0.001, help: 'Parámetro de forma beta' },
    ],
    isContinuous: true,
  },
  {
    id: 'binomial',
    name: 'Binomial',
    icon: '🎯',
    description: 'Éxitos en n ensayos independientes',
    params: [
      { name: 'Ensayos', symbol: 'n', default: '10', min: 1, step: 1, help: 'Número de ensayos (entero positivo)' },
      { name: 'Probabilidad', symbol: 'p', default: '0,5', min: 0, max: 1, help: 'Probabilidad de éxito (0 a 1)' },
    ],
    isContinuous: false,
  },
  {
    id: 'student',
    name: 't de Student',
    icon: '🎓',
    description: 'Para muestras pequeñas cuando σ es desconocida',
    params: [
      { name: 'Grados de libertad', symbol: 'ν', default: '10', min: 1, step: 1, help: 'Grados de libertad (n-1 típicamente)' },
    ],
    isContinuous: true,
  },
];

type CalcMode = 'pdf' | 'cdf' | 'cdf_range' | 'quantile';

export default function CalculadoraDistribucionesPage() {
  const [selectedDist, setSelectedDist] = useState<DistributionType>('normal');
  const [params, setParams] = useState<Record<string, string>>({});
  const [calcMode, setCalcMode] = useState<CalcMode>('cdf');
  const [xValue, setXValue] = useState('0');
  const [xMin, setXMin] = useState('-1');
  const [xMax, setXMax] = useState('1');
  const [probability, setProbability] = useState('0,5');

  const currentDist = distributions.find(d => d.id === selectedDist)!;

  // Parsear número (acepta coma o punto)
  const parseNum = (s: string): number => {
    return parseFloat(s.replace(',', '.'));
  };

  // Obtener parámetros como números
  const getParams = (): number[] => {
    return currentDist.params.map(p => {
      const val = params[p.symbol] ?? p.default;
      return parseNum(val);
    });
  };

  // Calcular resultados
  const results = useMemo(() => {
    const paramValues = getParams();
    const x = parseNum(xValue);
    const p = parseNum(probability);
    const xMinVal = parseNum(xMin);
    const xMaxVal = parseNum(xMax);

    // Validar parámetros
    if (paramValues.some(isNaN)) return null;

    try {
      let pdf = 0, cdf = 0, cdfRange = 0, quantileVal = 0;
      let mean = 0, variance = 0, mode = '-', median = 0;

      switch (selectedDist) {
        case 'normal': {
          const [mu, sigma] = paramValues;
          if (sigma <= 0) return null;
          pdf = jStat.normal.pdf(x, mu, sigma);
          cdf = jStat.normal.cdf(x, mu, sigma);
          cdfRange = jStat.normal.cdf(xMaxVal, mu, sigma) - jStat.normal.cdf(xMinVal, mu, sigma);
          quantileVal = jStat.normal.inv(p, mu, sigma);
          mean = mu;
          variance = sigma * sigma;
          mode = formatNumber(mu, 4);
          median = mu;
          break;
        }
        case 'poisson': {
          const [lambda] = paramValues;
          if (lambda <= 0) return null;
          const k = Math.floor(x);
          if (k < 0) {
            pdf = 0;
            cdf = 0;
          } else {
            pdf = jStat.poisson.pdf(k, lambda);
            cdf = jStat.poisson.cdf(k, lambda);
          }
          const kMin = Math.ceil(xMinVal);
          const kMax = Math.floor(xMaxVal);
          cdfRange = 0;
          for (let i = Math.max(0, kMin); i <= kMax; i++) {
            cdfRange += jStat.poisson.pdf(i, lambda);
          }
          // Cuantil exacto para Poisson (búsqueda secuencial)
          let cumProbPoisson = 0;
          quantileVal = 0;
          for (let k2 = 0; k2 <= Math.ceil(lambda * 5 + 50); k2++) {
            cumProbPoisson += jStat.poisson.pdf(k2, lambda);
            if (cumProbPoisson >= p) { quantileVal = k2; break; }
          }
          mean = lambda;
          variance = lambda;
          mode = Math.floor(lambda).toString();
          median = Math.round(lambda + 1/3 - 0.02/lambda);
          break;
        }
        case 'exponential': {
          const [lambda] = paramValues;
          if (lambda <= 0) return null;
          if (x < 0) {
            pdf = 0;
            cdf = 0;
          } else {
            pdf = jStat.exponential.pdf(x, lambda);
            cdf = jStat.exponential.cdf(x, lambda);
          }
          cdfRange = jStat.exponential.cdf(Math.max(0, xMaxVal), lambda) - jStat.exponential.cdf(Math.max(0, xMinVal), lambda);
          quantileVal = -Math.log(1 - p) / lambda;
          mean = 1 / lambda;
          variance = 1 / (lambda * lambda);
          mode = '0';
          median = Math.log(2) / lambda;
          break;
        }
        case 'uniform': {
          const [a, b] = paramValues;
          if (a >= b) return null;
          if (x < a) {
            pdf = 0;
            cdf = 0;
          } else if (x > b) {
            pdf = 0;
            cdf = 1;
          } else {
            pdf = 1 / (b - a);
            cdf = (x - a) / (b - a);
          }
          const clampedMin = Math.max(a, xMinVal);
          const clampedMax = Math.min(b, xMaxVal);
          cdfRange = clampedMax > clampedMin ? (clampedMax - clampedMin) / (b - a) : 0;
          quantileVal = a + p * (b - a);
          mean = (a + b) / 2;
          variance = Math.pow(b - a, 2) / 12;
          mode = `[${formatNumber(a, 2)}, ${formatNumber(b, 2)}]`;
          median = (a + b) / 2;
          break;
        }
        case 'gamma': {
          const [alpha, beta] = paramValues;
          if (alpha <= 0 || beta <= 0) return null;
          if (x <= 0) {
            pdf = 0;
            cdf = 0;
          } else {
            pdf = jStat.gamma.pdf(x, alpha, beta);
            cdf = jStat.gamma.cdf(x, alpha, beta);
          }
          cdfRange = jStat.gamma.cdf(Math.max(0, xMaxVal), alpha, beta) - jStat.gamma.cdf(Math.max(0, xMinVal), alpha, beta);
          quantileVal = jStat.gamma.inv(p, alpha, beta);
          mean = alpha * beta;
          variance = alpha * beta * beta;
          mode = alpha >= 1 ? formatNumber((alpha - 1) * beta, 4) : '0';
          median = jStat.gamma.inv(0.5, alpha, beta);
          break;
        }
        case 'beta': {
          const [alpha, beta] = paramValues;
          if (alpha <= 0 || beta <= 0) return null;
          if (x <= 0 || x >= 1) {
            pdf = 0;
            cdf = x <= 0 ? 0 : 1;
          } else {
            pdf = jStat.beta.pdf(x, alpha, beta);
            cdf = jStat.beta.cdf(x, alpha, beta);
          }
          const clampedMinB = Math.max(0, xMinVal);
          const clampedMaxB = Math.min(1, xMaxVal);
          cdfRange = jStat.beta.cdf(clampedMaxB, alpha, beta) - jStat.beta.cdf(clampedMinB, alpha, beta);
          quantileVal = jStat.beta.inv(p, alpha, beta);
          mean = alpha / (alpha + beta);
          variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
          if (alpha > 1 && beta > 1) {
            mode = formatNumber((alpha - 1) / (alpha + beta - 2), 4);
          } else if (alpha <= 1 && beta > 1) {
            mode = '0';
          } else if (alpha > 1 && beta <= 1) {
            mode = '1';
          } else {
            mode = '0 y 1';
          }
          median = jStat.beta.inv(0.5, alpha, beta);
          break;
        }
        case 'binomial': {
          const [n, prob] = paramValues;
          if (n < 1 || prob < 0 || prob > 1) return null;
          const nInt = Math.floor(n);
          const k = Math.floor(x);
          if (k < 0 || k > nInt) {
            pdf = 0;
            cdf = k < 0 ? 0 : 1;
          } else {
            pdf = jStat.binomial.pdf(k, nInt, prob);
            cdf = jStat.binomial.cdf(k, nInt, prob);
          }
          const kMin = Math.ceil(xMinVal);
          const kMax = Math.floor(xMaxVal);
          cdfRange = 0;
          for (let i = Math.max(0, kMin); i <= Math.min(nInt, kMax); i++) {
            cdfRange += jStat.binomial.pdf(i, nInt, prob);
          }
          // Cuantil aproximado
          let cumProb = 0;
          quantileVal = 0;
          for (let i = 0; i <= nInt; i++) {
            cumProb += jStat.binomial.pdf(i, nInt, prob);
            if (cumProb >= p) {
              quantileVal = i;
              break;
            }
          }
          mean = nInt * prob;
          variance = nInt * prob * (1 - prob);
          mode = Math.floor((nInt + 1) * prob).toString();
          median = Math.round(nInt * prob);
          break;
        }
        case 'student': {
          const [df] = paramValues;
          if (df < 1) return null;
          pdf = jStat.studentt.pdf(x, df);
          cdf = jStat.studentt.cdf(x, df);
          cdfRange = jStat.studentt.cdf(xMaxVal, df) - jStat.studentt.cdf(xMinVal, df);
          quantileVal = jStat.studentt.inv(p, df);
          mean = df > 1 ? 0 : NaN;
          variance = df > 2 ? df / (df - 2) : (df > 1 ? Infinity : NaN);
          mode = '0';
          median = 0;
          break;
        }
      }

      return {
        pdf,
        cdf,
        cdfRange,
        quantile: quantileVal,
        mean,
        variance,
        std: Math.sqrt(variance),
        mode,
        median,
      };
    } catch {
      return null;
    }
  }, [selectedDist, params, xValue, xMin, xMax, probability, currentDist.params]);

  // Cambiar distribución
  const handleDistChange = (dist: DistributionType) => {
    setSelectedDist(dist);
    setParams({});
    // Valores predeterminados de x según distribución
    if (dist === 'poisson' || dist === 'binomial') {
      setXValue('5');
      setXMin('0');
      setXMax('10');
    } else if (dist === 'exponential' || dist === 'gamma') {
      setXValue('1');
      setXMin('0');
      setXMax('3');
    } else if (dist === 'beta' || dist === 'uniform') {
      setXValue('0,5');
      setXMin('0');
      setXMax('1');
    } else {
      setXValue('0');
      setXMin('-2');
      setXMax('2');
    }
  };

  // Actualizar parámetro
  const updateParam = (symbol: string, value: string) => {
    setParams(prev => ({ ...prev, [symbol]: value }));
  };

  const calcModes: { id: CalcMode; name: string; description: string }[] = [
    { id: 'pdf', name: currentDist.isContinuous ? 'PDF f(x)' : 'PMF P(X=k)', description: currentDist.isContinuous ? 'Densidad en un punto' : 'Probabilidad exacta' },
    { id: 'cdf', name: 'CDF P(X≤x)', description: 'Probabilidad acumulada' },
    { id: 'cdf_range', name: 'P(a≤X≤b)', description: 'Probabilidad en rango' },
    { id: 'quantile', name: 'Cuantil', description: 'Valor para probabilidad dada' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>Calculadora de Distribuciones</h1>
        <p className={styles.subtitle}>
          Normal, Poisson, Exponencial, Uniforme, Gamma, Beta, Binomial y t-Student
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <main className={styles.mainContent}>
        {/* Selector de distribución */}
        <section className={styles.distSelector}>
          <h2 className={styles.sectionTitle}>Selecciona una distribución</h2>
          <div className={styles.distGrid}>
            {distributions.map(dist => (
              <button
                key={dist.id}
                onClick={() => handleDistChange(dist.id)}
                className={`${styles.distCard} ${selectedDist === dist.id ? styles.distSelected : ''}`}
                aria-pressed={selectedDist === dist.id}
              >
                <span className={styles.distIcon} aria-hidden="true">{dist.icon}</span>
                <span className={styles.distName}>{dist.name}</span>
                <span className={styles.distType}>{dist.isContinuous ? 'Continua' : 'Discreta'}</span>
              </button>
            ))}
          </div>
        </section>

        <div className={styles.calculatorGrid}>
          {/* Panel de parámetros */}
          <section className={styles.inputPanel}>
            <h2 className={styles.panelTitle}>
              {currentDist.icon} {currentDist.name}
            </h2>
            <p className={styles.distDescription}>{currentDist.description}</p>

            <div className={styles.paramSection}>
              <h3 className={styles.paramTitle}>Parámetros</h3>
              {currentDist.params.map(param => {
                const paramId = `param-${param.symbol}-${selectedDist}`;
                return (
                  <div key={param.symbol} className={styles.inputGroup}>
                    <label htmlFor={paramId} className={styles.label}>
                      {param.name} ({param.symbol})
                    </label>
                    <input
                      id={paramId}
                      type="text"
                      inputMode={param.step === 1 ? 'numeric' : 'decimal'}
                      value={params[param.symbol] ?? param.default}
                      onChange={e => updateParam(param.symbol, e.target.value)}
                      className={styles.input}
                      placeholder={param.default}
                    />
                    <span className={styles.helpText}>{param.help}</span>
                  </div>
                );
              })}
            </div>

            <div className={styles.modeSection}>
              <h3 className={styles.paramTitle}>Tipo de cálculo</h3>
              <div className={styles.modeButtons}>
                {calcModes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setCalcMode(mode.id)}
                    className={`${styles.modeBtn} ${calcMode === mode.id ? styles.modeActive : ''}`}
                    aria-pressed={calcMode === mode.id}
                  >
                    <span className={styles.modeName}>{mode.name}</span>
                    <span className={styles.modeDesc}>{mode.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs según modo */}
            <div className={styles.valueSection}>
              {(calcMode === 'pdf' || calcMode === 'cdf') && (
                <div className={styles.inputGroup}>
                  <label htmlFor="input-x-value" className={styles.label}>
                    Valor {currentDist.isContinuous ? 'x' : 'k'}
                  </label>
                  <input
                    id="input-x-value"
                    type="text"
                    inputMode={currentDist.isContinuous ? 'decimal' : 'numeric'}
                    value={xValue}
                    onChange={e => setXValue(e.target.value)}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
              )}

              {calcMode === 'cdf_range' && (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="input-x-min" className={styles.label}>Valor mínimo (a)</label>
                    <input
                      id="input-x-min"
                      type="text"
                      inputMode="decimal"
                      value={xMin}
                      onChange={e => setXMin(e.target.value)}
                      className={styles.input}
                      placeholder="-1"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="input-x-max" className={styles.label}>Valor máximo (b)</label>
                    <input
                      id="input-x-max"
                      type="text"
                      inputMode="decimal"
                      value={xMax}
                      onChange={e => setXMax(e.target.value)}
                      className={styles.input}
                      placeholder="1"
                    />
                  </div>
                </>
              )}

              {calcMode === 'quantile' && (
                <div className={styles.inputGroup}>
                  <label htmlFor="input-probability" className={styles.label}>Probabilidad (0 a 1)</label>
                  <input
                    id="input-probability"
                    type="text"
                    inputMode="decimal"
                    value={probability}
                    onChange={e => setProbability(e.target.value)}
                    className={styles.input}
                    placeholder="0,5"
                  />
                  <span className={styles.helpText}>
                    Ej: 0,95 para el percentil 95
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Panel de resultados */}
          <section className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
            <h2 className={styles.panelTitle}>Resultados</h2>

            {results ? (
              <>
                {/* Resultado principal */}
                <div className={styles.mainResult}>
                  {calcMode === 'pdf' && (
                    <div className={styles.resultHighlight}>
                      <span className={styles.resultLabel}>
                        {currentDist.isContinuous ? 'Densidad f(x)' : 'Probabilidad P(X = k)'}
                      </span>
                      <span className={styles.resultValue}>
                        {formatNumber(results.pdf, 8)}
                      </span>
                      {currentDist.isContinuous && (
                        <span className={styles.resultNote}>
                          La densidad NO es probabilidad directamente
                        </span>
                      )}
                    </div>
                  )}

                  {calcMode === 'cdf' && (
                    <div className={styles.resultHighlight}>
                      <span className={styles.resultLabel}>
                        P(X ≤ {xValue.replace(',', '.')})
                      </span>
                      <span className={styles.resultValue}>
                        {formatNumber(results.cdf, 8)}
                      </span>
                      <span className={styles.resultPercent}>
                        ({formatNumber(results.cdf * 100, 4)}%)
                      </span>
                    </div>
                  )}

                  {calcMode === 'cdf_range' && (
                    <div className={styles.resultHighlight}>
                      <span className={styles.resultLabel}>
                        P({xMin.replace(',', '.')} ≤ X ≤ {xMax.replace(',', '.')})
                      </span>
                      <span className={styles.resultValue}>
                        {formatNumber(results.cdfRange, 8)}
                      </span>
                      <span className={styles.resultPercent}>
                        ({formatNumber(results.cdfRange * 100, 4)}%)
                      </span>
                    </div>
                  )}

                  {calcMode === 'quantile' && (
                    <div className={styles.resultHighlight}>
                      <span className={styles.resultLabel}>
                        Cuantil {formatNumber(parseNum(probability) * 100, 1)}%
                      </span>
                      <span className={styles.resultValue}>
                        {formatNumber(results.quantile, 6)}
                      </span>
                      <span className={styles.resultNote}>
                        P(X ≤ {formatNumber(results.quantile, 4)}) = {probability.replace(',', '.')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Estadísticas de la distribución */}
                <div className={styles.statsSection}>
                  <h3 className={styles.statsTitle}>Propiedades de la distribución</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Media (μ)</span>
                      <span className={styles.statValue}>
                        {isNaN(results.mean) ? 'No definida' : formatNumber(results.mean, 6)}
                      </span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Varianza (σ²)</span>
                      <span className={styles.statValue}>
                        {!isFinite(results.variance) ? '∞' : formatNumber(results.variance, 6)}
                      </span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Desv. Estándar (σ)</span>
                      <span className={styles.statValue}>
                        {!isFinite(results.std) ? '∞' : formatNumber(results.std, 6)}
                      </span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Moda</span>
                      <span className={styles.statValue}>{results.mode}</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Mediana</span>
                      <span className={styles.statValue}>
                        {formatNumber(results.median, 6)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resultados adicionales */}
                {calcMode === 'cdf' && (
                  <div className={styles.additionalResults}>
                    <div className={styles.additionalCard}>
                      <span className={styles.additionalLabel}>P(X &gt; {xValue.replace(',', '.')})</span>
                      <span className={styles.additionalValue}>{formatNumber(1 - results.cdf, 8)}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.placeholder}>
                <p>Introduce parámetros válidos para ver los resultados.</p>
                <ul className={styles.validationList}>
                  {selectedDist === 'normal' && <li>σ debe ser mayor que 0</li>}
                  {selectedDist === 'poisson' && <li>λ debe ser mayor que 0</li>}
                  {selectedDist === 'exponential' && <li>λ debe ser mayor que 0</li>}
                  {selectedDist === 'uniform' && <li>a debe ser menor que b</li>}
                  {selectedDist === 'gamma' && <li>α y β deben ser mayores que 0</li>}
                  {selectedDist === 'beta' && <li>α y β deben ser mayores que 0</li>}
                  {selectedDist === 'binomial' && <li>n ≥ 1 y 0 ≤ p ≤ 1</li>}
                  {selectedDist === 'student' && <li>Grados de libertad ≥ 1</li>}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Tabla de cuantiles comunes */}
        {results && (
          <section className={styles.quantileTable}>
            <h3 className={styles.tableTitle}>Cuantiles comunes</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Percentil</th>
                    <th>5%</th>
                    <th>10%</th>
                    <th>25%</th>
                    <th>50%</th>
                    <th>75%</th>
                    <th>90%</th>
                    <th>95%</th>
                    <th>99%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Valor</td>
                    {[0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95, 0.99].map(p => {
                      const paramValues = getParams();
                      let q = 0;
                      try {
                        switch (selectedDist) {
                          case 'normal': q = jStat.normal.inv(p, paramValues[0], paramValues[1]); break;
                          case 'exponential': q = -Math.log(1 - p) / paramValues[0]; break;
                          case 'uniform': q = paramValues[0] + p * (paramValues[1] - paramValues[0]); break;
                          case 'gamma': q = jStat.gamma.inv(p, paramValues[0], paramValues[1]); break;
                          case 'beta': q = jStat.beta.inv(p, paramValues[0], paramValues[1]); break;
                          case 'student': q = jStat.studentt.inv(p, paramValues[0]); break;
                          default: q = NaN;
                        }
                      } catch {
                        q = NaN;
                      }
                      return (
                        <td key={p}>
                          {isNaN(q) ? '-' : formatNumber(q, 4)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="educational"
        severity="low"
        context="calculadora-distribuciones"
        collapsible={true}
      />


      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre distribuciones de probabilidad?"
        subtitle="Descubre cuándo usar cada distribución y cómo interpretarlas"
      >
        <section className={styles.guideSection}>
          <h2>Guía de Distribuciones de Probabilidad</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📊 Normal (Gaussiana)</h4>
              <p>
                La distribución más importante en estadística. Describe fenómenos naturales
                como alturas, pesos, errores de medición. El <strong>Teorema Central del Límite</strong>
                explica por qué: la suma de muchas variables aleatorias tiende a ser normal.
              </p>
              <p className={styles.formula}>f(x) = (1/σ√2π) e^(-(x-μ)²/2σ²)</p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎲 Poisson</h4>
              <p>
                Modela el número de eventos en un intervalo fijo de tiempo o espacio cuando
                los eventos ocurren independientemente. Ejemplos: llamadas por hora, defectos
                por metro, accidentes por día.
              </p>
              <p className={styles.formula}>P(X=k) = (λ^k × e^(-λ)) / k!</p>
            </div>

            <div className={styles.contentCard}>
              <h4>⏱️ Exponencial</h4>
              <p>
                Tiempo de espera entre eventos de Poisson. Tiene la propiedad de
                <strong> &quot;sin memoria&quot;</strong>: la probabilidad de esperar más tiempo no depende
                de cuánto ya has esperado. Usada en fiabilidad y colas.
              </p>
              <p className={styles.formula}>f(x) = λe^(-λx) para x ≥ 0</p>
            </div>

            <div className={styles.contentCard}>
              <h4>🔲 Uniforme</h4>
              <p>
                Todos los valores en un rango tienen la misma probabilidad. Representa
                incertidumbre total sobre dónde caerá un valor. Usada en generación
                de números aleatorios y como prior no informativo.
              </p>
              <p className={styles.formula}>f(x) = 1/(b-a) para a ≤ x ≤ b</p>
            </div>

            <div className={styles.contentCard}>
              <h4>📈 Gamma</h4>
              <p>
                Generaliza la exponencial. Modela el tiempo hasta que ocurran α eventos
                de Poisson. Muy flexible: incluye exponencial (α=1) y chi-cuadrado
                como casos especiales. Usada en fiabilidad y climatología.
              </p>
              <p className={styles.formula}>f(x) = (x^(α-1) × e^(-x/β)) / (β^α × Γ(α))</p>
            </div>

            <div className={styles.contentCard}>
              <h4>🔄 Beta</h4>
              <p>
                Define probabilidades sobre el intervalo [0,1]. Ideal para modelar
                proporciones, tasas de éxito, o como prior en inferencia bayesiana.
                Muy flexible según los valores de α y β.
              </p>
              <p className={styles.formula}>f(x) = x^(α-1)(1-x)^(β-1) / B(α,β)</p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎯 Binomial</h4>
              <p>
                Número de éxitos en n ensayos independientes con probabilidad p.
                Ejemplos: caras en n lanzamientos, clientes que compran de n visitantes.
                Para n grande y p pequeño, se aproxima a Poisson.
              </p>
              <p className={styles.formula}>P(X=k) = C(n,k) × p^k × (1-p)^(n-k)</p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎓 t de Student</h4>
              <p>
                Similar a la normal pero con colas más pesadas. Se usa cuando
                estimamos la media poblacional con muestras pequeñas y σ desconocida.
                Con más grados de libertad, se aproxima a la normal.
              </p>
              <p className={styles.formula}>Grados de libertad = n - 1</p>
            </div>
          </div>

          <h3>Conceptos Clave</h3>
          <div className={styles.conceptsGrid}>
            <div className={styles.conceptCard}>
              <h4>PDF vs CDF</h4>
              <p>
                <strong>PDF (Función de Densidad)</strong>: Altura de la curva en un punto.
                En distribuciones continuas NO es probabilidad directamente.
              </p>
              <p>
                <strong>CDF (Función de Distribución)</strong>: Área bajo la curva hasta x.
                P(X ≤ x) = área acumulada = probabilidad real.
              </p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Cuantiles</h4>
              <p>
                El cuantil p es el valor x tal que P(X ≤ x) = p.
                Ejemplo: el cuantil 0,95 de una N(0,1) es 1,645.
              </p>
              <p>
                <strong>Percentil 95</strong> = Cuantil 0,95 = Valor que deja el 95% de
                los datos por debajo.
              </p>
            </div>
          </div>

          {/* 1. Tabla Comparativa v2.0 */}
          <div className={styles.tableWrapper}>
            <h3>⚖️ Tabla Comparativa de Distribuciones de Probabilidad</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Las 6 distribuciones más importantes: cuándo usarlas, sus parámetros y cómo calcularlas en Python/R
            </p>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Distribución</th>
                  <th>Tipo</th>
                  <th>Parámetros</th>
                  <th>Uso típico</th>
                  <th>Ejemplo real</th>
                  <th>Python / R</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Normal</strong></td>
                  <td>Continua</td>
                  <td>μ (media), σ (desv. std.)</td>
                  <td>Sumas de muchos efectos independientes, errores de medición</td>
                  <td>Alturas de estudiantes: μ=170 cm, σ=8 cm → P(X &gt; 185) = 3,1%</td>
                  <td><code>scipy.stats.norm(170,8).sf(185)</code> / <code>pnorm(185,170,8,lower=F)</code></td>
                </tr>
                <tr>
                  <td><strong>Poisson</strong></td>
                  <td>Discreta</td>
                  <td>λ (tasa media)</td>
                  <td>Conteo de eventos raros en tiempo o espacio fijo</td>
                  <td>Llamadas a soporte: λ=12/hora → P(X=15) = 7,2%</td>
                  <td><code>scipy.stats.poisson(12).pmf(15)</code> / <code>dpois(15,12)</code></td>
                </tr>
                <tr>
                  <td><strong>Binomial</strong></td>
                  <td>Discreta</td>
                  <td>n (ensayos), p (prob. éxito)</td>
                  <td>Número de éxitos en ensayos Bernoulli independientes</td>
                  <td>Control calidad: n=200, p=0,03 → P(defectos &gt; 10) = 8,4%</td>
                  <td><code>scipy.stats.binom(200,0.03).sf(10)</code> / <code>pbinom(10,200,0.03,F)</code></td>
                </tr>
                <tr>
                  <td><strong>Exponencial</strong></td>
                  <td>Continua</td>
                  <td>λ (tasa de eventos)</td>
                  <td>Tiempo entre eventos de Poisson, vida útil de componentes</td>
                  <td>MTBF servidor: λ=0,002 fallos/hora → P(fallo &lt; 100h) = 18,1%</td>
                  <td><code>scipy.stats.expon(scale=500).cdf(100)</code> / <code>pexp(100,0.002)</code></td>
                </tr>
                <tr>
                  <td><strong>t-Student</strong></td>
                  <td>Continua</td>
                  <td>ν (grados de libertad)</td>
                  <td>Estimación de medias con σ desconocida y muestras pequeñas</td>
                  <td>Muestra n=12, ν=11 → valor crítico t(0,975) = 2,201 vs 1,960 (Normal)</td>
                  <td><code>scipy.stats.t(11).ppf(0.975)</code> / <code>qt(0.975,11)</code></td>
                </tr>
                <tr>
                  <td><strong>Chi-cuadrado</strong></td>
                  <td>Continua</td>
                  <td>k (grados de libertad)</td>
                  <td>Pruebas de independencia, bondad de ajuste, varianza</td>
                  <td>Test independencia 3×3: k=(3-1)(3-1)=4 → valor crítico χ²(0,95)=9,49</td>
                  <td><code>scipy.stats.chi2(4).ppf(0.95)</code> / <code>qchisq(0.95,4)</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Casos de Uso por Perfil */}
          <div className={styles.escenariosGrid}>
            <h3 style={{ gridColumn: '1 / -1' }}>👥 Casos de Uso por Perfil Profesional</h3>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧑‍🎓</span>
                <h4>Estudiante de Estadística</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Para exámenes y TFG:</strong> Verificar supuesto de normalidad antes de aplicar t-test o ANOVA. Con n=25 observaciones y σ desconocida, usa t(24) en lugar de Normal estándar. El intervalo de confianza al 95% se calcula como x̄ ± 2,064·(s/√25) con el cuantil t(0,975; 24)=2,064.
              </p>
              <p className={styles.escenarioTip}><strong>Herramienta clave:</strong> Selecciona t de Student con ν=n-1. Calcula el cuantil al 0,975 para tests bilaterales o al 0,95 para unilaterales.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏭</span>
                <h4>Ingeniero de Calidad</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Control estadístico de procesos (SPC):</strong> Las medidas de piezas siguen Normal(μ, σ). Six Sigma exige que los defectos queden fuera de ±6σ, lo que implica P(defecto) &lt; 3,4 por millón. Para conteo de defectos por lote usa Binomial; para defectos por m² de superficie usa Poisson.
              </p>
              <p className={styles.escenarioTip}><strong>Herramienta clave:</strong> Normal para cartas de control X̄-R. Binomial para planes de muestreo de aceptación (n=50, p=0,02).</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📋</span>
                <h4>Actuario / Asegurador</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Modelos de riesgo:</strong> El número de siniestros por póliza sigue Poisson(λ). El importe por siniestro sigue Log-Normal o Gamma. VaR al 99,5% (Solvencia II): con cartera Normal(μ=1M€, σ=200k€), el capital requerido es μ - 2,576·σ = 485.200€. La t-Student modela retornos con colas pesadas.
              </p>
              <p className={styles.escenarioTip}><strong>Herramienta clave:</strong> Poisson para frecuencia de siniestros. Gamma(α=2, β=5000) para severidad media de reclamaciones de automóvil.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔬</span>
                <h4>Científico de Datos</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Machine learning y pruebas A/B:</strong> A/B testing bayesiano: tasa de conversión sigue Beta(α, β). Con prior Beta(1,1) y 30 éxitos en 100 visitas, el posterior es Beta(31,71) con media 30,4% y P(versión B &gt; versión A) calculable analíticamente. Naive Bayes asume Normal para features continuas.
              </p>
              <p className={styles.escenarioTip}><strong>Herramienta clave:</strong> Beta(31,71) para modelar tasas de conversión post-experimento. Binomial para calcular significancia estadística de tests A/B.</p>
            </div>
          </div>

          {/* 3. FAQ */}
          <div className={styles.faqList}>
            <h3 style={{ marginBottom: '1rem' }}>❓ Preguntas Frecuentes sobre Distribuciones de Probabilidad</h3>
            <div className={styles.faqItem}>
              <h4>¿Cuándo usar Normal vs t-Student?</h4>
              <p>Usa Normal cuando conoces σ (desviación estándar poblacional) o tienes muestras grandes (n &gt; 30). Usa t-Student cuando σ es desconocida y la estimas con la muestra. El cuantil t(0,975; ν=10) = 2,228 vs 1,960 de la Normal: la diferencia es relevante con muestras pequeñas. Con ν &gt; 30, la t-Student converge prácticamente a la Normal estándar.</p>
              <p className={styles.faqTip}>Regla práctica: si n &lt; 30 y σ desconocida → siempre t-Student.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el p-valor y cómo interpretarlo correctamente?</h4>
              <p>El p-valor es la probabilidad de obtener un resultado tan extremo o más que el observado, asumiendo que la hipótesis nula es cierta. p=0,03 NO significa &quot;hay 3% de probabilidad de que H₀ sea verdadera&quot;. Significa: &quot;si H₀ fuera cierta, solo el 3% de las muestras darían un estadístico tan extremo&quot;. Con α=0,05, rechazamos H₀ si p &lt; 0,05.</p>
              <p className={styles.faqTip}>Errores comunes: p &lt; 0,05 no implica que el efecto sea grande ni importante en la práctica.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Diferencia entre distribución discreta y continua?</h4>
              <p>Discreta: toma valores aislados (enteros). P(X=k) son probabilidades reales que suman 1. Ejemplos: Poisson, Binomial. Continua: toma cualquier valor en un intervalo. f(x) es densidad, NO probabilidad. P(X=x) = 0 exactamente. Solo tiene sentido P(a ≤ X ≤ b) = ∫f(x)dx = CDF(b) - CDF(a). Ejemplos: Normal, Exponencial, Gamma.</p>
              <p className={styles.faqTip}>Señal de error: si dices &quot;la probabilidad de exactamente 1,73&quot; en una distribución continua, el resultado siempre es 0.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es la función de densidad de probabilidad (PDF)?</h4>
              <p>La PDF f(x) describe la &quot;densidad&quot; de probabilidad en cada punto. Para obtener probabilidad real debes integrar: P(a ≤ X ≤ b) = ∫[a,b] f(x)dx. La PDF puede tomar valores mayores que 1 (ej: Normal(0; 0,1) tiene f(0) ≈ 3,99). La CDF F(x) = P(X ≤ x) siempre está entre 0 y 1 y es la que te da probabilidades directas.</p>
              <p className={styles.faqTip}>Esta calculadora calcula tanto PDF (densidad en un punto) como CDF (área acumulada = probabilidad real).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo verificar si mis datos siguen una distribución Normal?</h4>
              <p>1) Visual: histograma (forma de campana) y Q-Q plot (puntos sobre la diagonal). 2) Test de Shapiro-Wilk: p &gt; 0,05 indica normalidad (potente para n &lt; 50). 3) Test de Kolmogorov-Smirnov: adecuado para n &gt; 50. 4) Coeficientes de asimetría (debe ser ≈ 0) y curtosis (debe ser ≈ 3). Si la muestra es grande (n &gt; 100), el TCL hace que la media muestral sea normal aunque los datos no lo sean.</p>
              <p className={styles.faqTip}>En R: <code>shapiro.test(x)</code> / En Python: <code>scipy.stats.shapiro(x)</code></p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo usar Poisson vs Binomial?</h4>
              <p>Binomial(n, p): cuando hay un número fijo n de ensayos y cada uno tiene probabilidad p de éxito. Ejemplo: 200 piezas inspeccionadas, p=3% defectuosas. Poisson(λ): cuando n es muy grande y p muy pequeña (np = λ constante). Regla: si n &gt; 100 y p &lt; 0,01, Poisson ≈ Binomial con λ = n·p. Ejemplo: defectos en 1.000 metros de cable con p=0,002 → Poisson(λ=2).</p>
              <p className={styles.faqTip}>También usa Poisson cuando no hay un &quot;máximo&quot; de eventos (llamadas por hora no tienen límite superior fijo).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el intervalo de confianza al 95%?</h4>
              <p>Si repitieras el experimento 100 veces, en 95 de ellas el intervalo calculado contendría el verdadero parámetro. Con Normal: IC₉₅ = x̄ ± 1,96·(σ/√n). Con t-Student (σ desconocida): IC₉₅ = x̄ ± t(0,975; n-1)·(s/√n). Para n=16, t(0,975; 15) = 2,131. El IC NO significa &quot;hay 95% de probabilidad de que el parámetro esté en este intervalo&quot;.</p>
              <p className={styles.faqTip}>Aumentar el nivel de confianza (99%) amplía el intervalo; aumentar n lo estrecha.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el Teorema Central del Límite (TCL)?</h4>
              <p>El TCL establece que la media muestral x̄ de n observaciones independientes de cualquier distribución (con media μ y varianza σ² finitas) converge a Normal(μ, σ²/n) cuando n → ∞. Prácticamente, con n ≥ 30 ya es una buena aproximación. Consecuencia: aunque los datos individuales sean exponenciales, uniformes o cualquier otra forma, su media sigue una distribución aproximadamente normal.</p>
              <p className={styles.faqTip}>El TCL justifica por qué se usa el test t para medias incluso cuando los datos no son normales, siempre que n sea suficientemente grande.</p>
            </div>
          </div>

          {/* 4. Guía Paso a Paso */}
          <div className={styles.stepGuide}>
            <h3 style={{ marginBottom: '0.25rem' }}>📋 Cómo Elegir la Distribución Correcta: 7 Pasos</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Proceso sistemático para seleccionar el modelo probabilístico adecuado a tus datos
            </p>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Identifica si tu variable es discreta o continua</h4>
                <p>¿La variable toma valores enteros (conteos)? → Discreta: Binomial, Poisson. ¿Puede tomar cualquier valor real en un rango (medidas, tiempos)? → Continua: Normal, Exponencial, Gamma, Beta, Uniforme. Este filtro inicial elimina la mitad de las opciones. Los tiempos siempre son continuos; los conteos siempre son discretos.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Determina el dominio (rango) de valores posibles</h4>
                <p>¿Puede ser negativa? → Normal, t-Student (dominio: (-∞, +∞)). ¿Solo positiva? → Exponencial, Gamma, Log-Normal (dominio: (0, +∞)). ¿Solo entre 0 y 1? → Beta (ideal para proporciones y probabilidades). ¿Enteros de 0 a n? → Binomial. ¿Enteros desde 0 sin límite? → Poisson. El dominio físico del fenómeno es una restricción dura.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Analiza el mecanismo generador del fenómeno</h4>
                <p>¿Es suma de muchos efectos pequeños e independientes? → Normal (TCL). ¿Es un conteo de eventos raros por unidad de exposición? → Poisson. ¿Es el número de éxitos en n ensayos Bernoulli? → Binomial. ¿Es el tiempo hasta el primer evento de Poisson? → Exponencial. ¿Es el tiempo hasta el k-ésimo evento? → Gamma. ¿Es una proporción o tasa de éxito? → Beta. El mecanismo físico es la guía más confiable.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Examina la forma de la distribución empírica</h4>
                <p>Haz un histograma. ¿Forma simétrica en campana? → Normal. ¿Sesgada a la derecha con cola larga? → Exponencial, Gamma, Log-Normal. ¿Casi plana? → Uniforme. ¿Bimodal? → Posible mezcla de dos poblaciones. Calcula la asimetría (skewness): Normal → 0, Exponencial → 2, Gamma → 2/√α. La curtosis indica colas pesadas: Normal → 3, Exponencial → 9.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Estima los parámetros con tus datos (MLE)</h4>
                <p>Normal: μ̂ = media muestral, σ̂ = desviación estándar. Poisson: λ̂ = media muestral. Exponencial: λ̂ = 1/media. Binomial: p̂ = éxitos/ensayos. Para Gamma y Beta usa scipy.stats.gamma.fit() en Python o fitdistr(datos, &quot;gamma&quot;) en R. Estos son los estimadores de Máxima Verosimilitud (MLE), que son consistentes y asintóticamente eficientes.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Valida el ajuste con pruebas estadísticas</h4>
                <p>Test de Kolmogorov-Smirnov (KS): compara CDF empírica vs teórica. p &gt; 0,05 indica buen ajuste. Test de Shapiro-Wilk: específico para normalidad, potente con n &lt; 50. Q-Q plot: los puntos deben seguir la línea diagonal. Test Chi-cuadrado de bondad de ajuste: divide los datos en intervalos y compara frecuencias observadas vs esperadas. Si el p-valor del KS es 0,32, el ajuste es bueno.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Compara modelos alternativos con AIC/BIC</h4>
                <p>Si dudas entre Gamma y Log-Normal (ambas sirven para datos positivos con sesgo), ajusta las dos y compara el AIC (Akaike Information Criterion): AIC = 2k - 2·log(L), donde k = número de parámetros. El modelo con menor AIC es preferible. ΔAIC &gt; 4 indica evidencia sustancial a favor del modelo con menor AIC. BIC penaliza más los parámetros adicionales y es mejor para selección de modelos con muestras grandes.</p>
              </div>
            </div>
          </div>

          {/* 5. Mejores Prácticas */}
          <div className={styles.tipsGrid}>
            <h3 style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>✅ Mejores Prácticas al Trabajar con Distribuciones</h3>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <h4>Visualiza antes de asumir</h4>
              <p>Haz siempre un histograma y un Q-Q plot antes de seleccionar una distribución. El 70% de los errores en análisis estadístico provienen de asumir normalidad sin verificarla. Matplotlib, ggplot2 o incluso Excel permiten validaciones rápidas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔢</span>
              <h4>Atención a la parametrización</h4>
              <p>La Exponencial tiene dos formas: con tasa λ (scipy.stats usa escala=1/λ) y con escala=1/λ. La Gamma en R puede especificarse con shape/rate o shape/scale. Verifica siempre la documentación. Un error de parametrización invierte el resultado completamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <h4>Verifica la independencia</h4>
              <p>Binomial y Poisson asumen eventos independientes. Series temporales, datos autocorrelacionados o eventos que se &quot;contagian&quot; violan este supuesto. El test de Ljung-Box detecta autocorrelación. Si falla, los intervalos de confianza calculados serán incorrectos (demasiado estrechos).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚠️</span>
              <h4>Cuida las colas de la distribución</h4>
              <p>La Normal subestima la probabilidad de eventos extremos. En finanzas, seguros y gestión de riesgos, usa t-Student (colas pesadas) o distribuciones de Valores Extremos (GEV, GPD). El VaR al 99,9% basado en Normal puede subestimar el riesgo real en un factor de 3-5x.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <h4>Tamaño muestral y potencia estadística</h4>
              <p>Con n &lt; 30, los tests son poco potentes (alta tasa de falsos negativos). Para detectar una diferencia de 0,5 desviaciones estándar con potencia 80% y α=0,05, necesitas n ≥ 64 por grupo. Usa <code>pwr.t.test()</code> en R o <code>statsmodels.stats.power</code> en Python para calcular n óptimo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧪</span>
              <h4>Pruebas de bondad de ajuste siempre</h4>
              <p>Nunca publiques resultados sin validar el ajuste. KS test, Shapiro-Wilk, Chi-cuadrado y Anderson-Darling son complementarios: KS detecta diferencias en la mediana, AD es más sensible en las colas. Un p-valor &gt; 0,05 no confirma la distribución, solo no la rechaza: reporta el estadístico de ajuste, no solo el p-valor.</p>
            </div>
          </div>

          {/* 6. Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores que invalidan el análisis estadístico</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Asumir normalidad sin verificarla:</strong> El TCL garantiza normalidad de la media muestral, no de los datos individuales. Ingresos, tiempos de respuesta web y precios de activos son típicamente asimétricos. Siempre aplica Shapiro-Wilk o KS test antes de usar métodos paramétricos.</li>
              <li><strong>Confundir parámetros poblacionales con estadísticos muestrales:</strong> μ es la media poblacional (desconocida); x̄ es la media muestral (estimación). σ es la desviación estándar poblacional; s es la muestral. Usar σ cuando solo tienes s lleva a intervalos de confianza incorrectamente estrechos.</li>
              <li><strong>Interpretar mal el p-valor:</strong> p=0,03 NO significa &quot;hay 97% de probabilidad de que la hipótesis alternativa sea cierta&quot;. Significa: &quot;si H₀ fuera cierta, el 3% de las muestras mostrarían este resultado por azar&quot;. Un p-valor pequeño no implica que el efecto sea grande o importante: un n=10.000 puede dar p=0,001 con diferencias irrelevantes en la práctica.</li>
              <li><strong>Usar distribución incorrecta para datos de conteo:</strong> Los datos de conteo (número de llamadas, defectos, siniestros) son discretos y no negativos. Aplicar una regresión Normal a conteos viola los supuestos y puede predecir valores negativos. Usa Poisson o Binomial Negativa (si hay sobredispersión: varianza &gt;&gt; media).</li>
              <li><strong>Ignorar el supuesto de independencia:</strong> Si los datos tienen estructura temporal, espacial o de clustering, las observaciones no son independientes. Una regresión Normal sobre ventas mensuales autocorrelacionadas subestima los errores estándar, inflando artificialmente la significancia estadística. Usa modelos ARIMA o modelos de efectos mixtos.</li>
              <li><strong>Mezclar distribuciones de poblaciones distintas:</strong> Si tus tiempos de respuesta provienen de dos servidores con rendimientos muy distintos, la distribución conjunta será bimodal. Ajustar una sola Exponencial o Normal dará un pésimo ajuste. Usa modelos de mezcla (Gaussian Mixture Models) o segmenta los datos antes del análisis.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-distribuciones')} />
      <ShareCard appName="calculadora-distribuciones" />
      <Footer appName="calculadora-distribuciones" />
    </div>
  );
}
