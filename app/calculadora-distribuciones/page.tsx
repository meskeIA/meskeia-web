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
          const kMin = Math.floor(xMinVal);
          const kMax = Math.floor(xMaxVal);
          cdfRange = 0;
          for (let i = Math.max(0, kMin); i <= kMax; i++) {
            cdfRange += jStat.poisson.pdf(i, lambda);
          }
          // Cuantil aproximado para Poisson
          quantileVal = Math.round(lambda + Math.sqrt(lambda) * jStat.normal.inv(p, 0, 1));
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
          const kMin = Math.floor(xMinVal);
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
    const config = distributions.find(d => d.id === dist)!;
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
        <span className={styles.heroIcon}>📊</span>
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
              >
                <span className={styles.distIcon}>{dist.icon}</span>
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
              {currentDist.params.map(param => (
                <div key={param.symbol} className={styles.inputGroup}>
                  <label className={styles.label}>
                    {param.name} ({param.symbol})
                  </label>
                  <input
                    type="text"
                    value={params[param.symbol] ?? param.default}
                    onChange={e => updateParam(param.symbol, e.target.value)}
                    className={styles.input}
                    placeholder={param.default}
                  />
                  <span className={styles.helpText}>{param.help}</span>
                </div>
              ))}
            </div>

            <div className={styles.modeSection}>
              <h3 className={styles.paramTitle}>Tipo de cálculo</h3>
              <div className={styles.modeButtons}>
                {calcModes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setCalcMode(mode.id)}
                    className={`${styles.modeBtn} ${calcMode === mode.id ? styles.modeActive : ''}`}
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
                  <label className={styles.label}>
                    Valor {currentDist.isContinuous ? 'x' : 'k'}
                  </label>
                  <input
                    type="text"
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
                    <label className={styles.label}>Valor mínimo (a)</label>
                    <input
                      type="text"
                      value={xMin}
                      onChange={e => setXMin(e.target.value)}
                      className={styles.input}
                      placeholder="-1"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Valor máximo (b)</label>
                    <input
                      type="text"
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
                  <label className={styles.label}>Probabilidad (0 a 1)</label>
                  <input
                    type="text"
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
          <section className={styles.resultsPanel}>
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
        severity="medium"
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
              <h4>�� Uniforme</h4>
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

          {/* Tabla Comparativa */}
          <div className={styles.eduComparativaSection}>
            <h3>⚖️ Tabla Comparativa: ¿Cuándo Usar Cada Distribución?</h3>
            <p className={styles.eduComparativaSubtitle}>Selección rápida basada en el tipo de fenómeno a modelar</p>
            <div className={styles.eduTablaWrapper}>
              <table className={styles.eduTablaComparativa}>
                <thead>
                  <tr>
                    <th>Distribución</th>
                    <th>Tipo</th>
                    <th>Dominio</th>
                    <th>Parámetros clave</th>
                    <th>Uso principal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>Normal (Gaussian)</strong></td><td>Continua</td><td>(-∞, +∞)</td><td>μ (media), σ (desv. std.)</td><td>Alturas, pesos, errores medición, sumas por TCL</td></tr>
                  <tr><td><strong>Poisson</strong></td><td>Discreta</td><td>[0, ∞)</td><td>λ (tasa media)</td><td>Llamadas/hora, defectos/m², accidentes/día</td></tr>
                  <tr><td><strong>Exponencial</strong></td><td>Continua</td><td>[0, +∞)</td><td>λ (tasa de eventos)</td><td>Tiempo entre eventos, vida útil componentes, tiempos de espera</td></tr>
                  <tr><td><strong>Uniforme</strong></td><td>Continua</td><td>[a, b]</td><td>a (mín), b (máx)</td><td>Números aleatorios, prior no informativo, rondeo</td></tr>
                  <tr><td><strong>Gamma</strong></td><td>Continua</td><td>(0, +∞)</td><td>α (forma), β (escala)</td><td>Tiempo hasta k eventos, precipitaciones, modelos de fiabilidad</td></tr>
                  <tr><td><strong>Beta</strong></td><td>Continua</td><td>(0, 1)</td><td>α, β (forma)</td><td>Probabilidades, proporciones, prior bayesiano conjugado</td></tr>
                  <tr><td><strong>Binomial</strong></td><td>Discreta</td><td>[0, n]</td><td>n (ensayos), p (prob. éxito)</td><td>Control calidad, encuestas, conversiones e-commerce</td></tr>
                  <tr><td><strong>t de Student</strong></td><td>Continua</td><td>(-∞, +∞)</td><td>ν (grados libertad)</td><td>Estimación media con σ desconocida, muestras pequeñas</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Casos de Uso Prácticos */}
          <div className={styles.eduEscenariosSection}>
            <h3>💼 Casos de Uso Reales por Sector</h3>
            <p className={styles.eduEscenariosSubtitle}>Cómo aplican las distribuciones de probabilidad en contextos profesionales</p>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>🏭</span>
                  <h4>Control de Calidad Industrial</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Distribuciones usadas:</strong> Normal (medidas de piezas), Binomial (defectos por lote), Poisson (defectos por unidad de superficie). Un proceso &quot;six sigma&quot; implica que las medidas caen a &lt; 6σ de la media (P(defecto) &lt; 3,4 por millón).</p>
                <p className={styles.eduEscenarioTip}><strong>Aplicación:</strong> Límites de control estadístico de proceso (SPC) usan Normal. Si el proceso no es normal, usa distribuciones no paramétricas o transforma los datos.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>📡</span>
                  <h4>Ingeniería de Fiabilidad y Telecomunicaciones</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Distribuciones usadas:</strong> Exponencial (tiempo hasta fallo de componentes electrónicos), Weibull (variante de Gamma para degradación), Poisson (paquetes de datos por segundo en redes).</p>
                <p className={styles.eduEscenarioTip}><strong>Aplicación:</strong> MTBF (Mean Time Between Failures) sigue distribución Exponencial. Si λ = 0,001 fallos/hora, MTBF = 1/λ = 1.000 horas. La probabilidad de operar 500 horas sin fallo = e^(-0,5) ≈ 60,7%.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>📊</span>
                  <h4>Finanzas y Actuaría</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Distribuciones usadas:</strong> Normal (retornos de activos en Black-Scholes), t-Student (retornos reales con colas pesadas), Beta (probabilidades de default en ratings crediticios).</p>
                <p className={styles.eduEscenarioTip}><strong>Aplicación:</strong> VaR (Value at Risk) al 95%: ¿cuál es la pérdida máxima esperada? Con retornos Normal(μ, σ), VaR = μ - 1,645σ. La crisis de 2008 demostró que las colas reales son más pesadas que la Normal.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>🔬</span>
                  <h4>Ciencia de Datos y Machine Learning</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Distribuciones usadas:</strong> Beta (prior para tasas de conversión en bayesiano), Binomial (clasificación binaria y métricas de evaluación), Normal (distribución de pesos en redes neuronales).</p>
                <p className={styles.eduEscenarioTip}><strong>Aplicación:</strong> A/B testing bayesiano: modela la tasa de conversión de cada variante con Beta(α, β). Actualiza con observaciones (éxitos y fracasos). El área donde Beta_B &gt; Beta_A da la probabilidad de que B sea mejor.</p>
              </div>
            </div>
          </div>

          {/* FAQ Ampliado */}
          <div className={styles.eduFaqSection}>
            <h3>❓ Preguntas Frecuentes sobre Distribuciones de Probabilidad</h3>
            <p className={styles.eduFaqSubtitle}>Respuestas detalladas a las dudas más comunes</p>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Por qué la distribución Normal es tan común en la naturaleza?</h4>
                <p>Por el <strong>Teorema Central del Límite</strong> (TCL): la suma de muchas variables aleatorias independientes e idénticamente distribuidas tiende a una distribución Normal, independientemente de la distribución original. Esto explica por qué las alturas (suma de muchos factores genéticos y ambientales), los errores de medición, y los precios de acciones a largo plazo siguen distribuciones aproximadamente normales.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cuándo uso Poisson en lugar de Binomial?</h4>
                <p>La distribución de Poisson es una aproximación a la Binomial cuando n es muy grande y p es muy pequeño (np = λ constante). Regla práctica: usa Poisson cuando n &gt; 100 y p &lt; 0,01. Ejemplo: defectos en 1 km de cable con p = 0,001 defecto/metro → Poisson(λ = 1). La Binomial exacta sería Bin(1000, 0,001) que es computacionalmente equivalente.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué significa la propiedad &quot;sin memoria&quot; de la Exponencial?</h4>
                <p>P(T &gt; t+s | T &gt; t) = P(T &gt; s). Es decir: si un componente lleva funcionando t horas, la probabilidad de que dure s horas más es la misma que si fuera nuevo. Esto tiene implicaciones importantes: no es realista para componentes que se degradan. La distribución de Weibull (generalización) permite modelar fatiga y desgaste incremental.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cuál es la diferencia entre PDF y PMF?</h4>
                <p><strong>PDF</strong> (Probability Density Function): para distribuciones continuas. f(x) NO es probabilidad; es densidad. Para obtener probabilidad, debes integrar: P(a ≤ X ≤ b) = ∫f(x)dx. <strong>PMF</strong> (Probability Mass Function): para distribuciones discretas. P(X=k) SÍ es probabilidad directamente. La CDF (Función de Distribución Acumulada) funciona igual para ambas: P(X ≤ x) = área bajo la curva hasta x.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Para qué se usa la distribución Beta en inferencia bayesiana?</h4>
                <p>Beta es el <strong>prior conjugado</strong> para la distribución Binomial. Si el prior es Beta(α, β) y observas k éxitos en n ensayos, el posterior es Beta(α+k, β+n-k). Aplicación práctica: si tienes prior Beta(2,2) para la tasa de conversión web (neutro) y observas 30 conversiones en 100 visitas, el posterior es Beta(32,72) con media 32/104 ≈ 30,8%. Es la base del A/B testing bayesiano.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cuándo usar t-Student en lugar de Normal estándar?</h4>
                <p>Usa t-Student cuando estimas la media poblacional pero <strong>no conoces σ</strong> (lo normal en práctica). Con grados de libertad ν = n-1, la t-Student tiene colas más pesadas que la Normal, reflejando la incertidumbre adicional de estimar σ. Regla práctica: con ν &gt; 30, t-Student ≈ Normal estándar. El cuantil 95% de t(5) = 2,015 vs 1,645 de la Normal, evidenciando la diferencia para muestras pequeñas.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cómo elijo entre Gamma y Exponencial?</h4>
                <p>La <strong>Exponencial</strong> es un caso especial de Gamma con α=1: modela el tiempo hasta el primer evento. La <strong>Gamma(α, β)</strong> modela el tiempo hasta que ocurren α eventos. Si tienes un sistema que falla solo después de que fallen k componentes en serie, usa Gamma(k, 1/λ). La Gamma también es más flexible: puede modelar distribuciones simétricas (α grande) o sesgadas (α pequeño).</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué es el percentil 95 y cómo se calcula?</h4>
                <p>El percentil 95 (cuantil 0,95) es el valor x tal que P(X ≤ x) = 0,95. En la práctica: el 95% de los datos caen por debajo de este valor. Para Normal(0,1): percentil 95 = 1,645 (valor crítico en tests unilaterales). Para calcular cuantiles en distribuciones no estándar: usa la función de cuantil (inversa de la CDF). Esta calculadora calcula cuantiles exactos para las 8 distribuciones disponibles.</p>
              </div>
            </div>
          </div>

          {/* Guía Paso a Paso */}
          <div className={styles.eduStepSection}>
            <h3>📋 Cómo Elegir la Distribución Correcta: 6 Pasos</h3>
            <p className={styles.eduComparativaSubtitle}>Proceso sistemático para seleccionar el modelo probabilístico adecuado</p>
            <div className={styles.eduStepGuide}>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>1</div>
                <div className={styles.eduStepContent}>
                  <h4>¿Continua o discreta?</h4>
                  <p>Si la variable puede tomar cualquier valor real en un rango (longitud, tiempo, temperatura) → continua (Normal, Exponencial, Gamma, Beta, Uniforme). Si solo toma valores enteros (conteos, número de éxitos) → discreta (Binomial, Poisson). Este primer filtro elimina la mitad de opciones.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>2</div>
                <div className={styles.eduStepContent}>
                  <h4>Identifica el soporte (dominio) de la variable</h4>
                  <p>¿La variable puede ser negativa? → Normal o t-Student. ¿Solo valores positivos? → Exponencial, Gamma, LogNormal. ¿Solo entre 0 y 1? → Beta. ¿Solo enteros no negativos sin límite? → Poisson. ¿Enteros entre 0 y n? → Binomial. El dominio físico de la variable restringe las opciones válidas.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>3</div>
                <div className={styles.eduStepContent}>
                  <h4>¿Cuál es el mecanismo generador?</h4>
                  <p>¿Es una suma de muchos efectos independientes? → Normal (TCL). ¿Es un conteo de eventos raros por unidad? → Poisson. ¿Es el número de éxitos en n ensayos Bernoulli? → Binomial. ¿Es el tiempo entre eventos de Poisson? → Exponencial. ¿Es una proporción o probabilidad? → Beta. El mecanismo subyacente es la guía más confiable.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>4</div>
                <div className={styles.eduStepContent}>
                  <h4>Examina la asimetría (skewness) de los datos</h4>
                  <p>Datos simétricos alrededor de la media → Normal. Datos sesgados a la derecha (cola larga hacia valores grandes) → Exponencial, Gamma, LogNormal. Si los datos tienen sesgo moderado, la Gamma permite ajustar la asimetría con el parámetro α. Con α grande, la Gamma se vuelve casi simétrica. Histograma + Q-Q plot son las herramientas visuales clave.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>5</div>
                <div className={styles.eduStepContent}>
                  <h4>Ajusta los parámetros con los datos</h4>
                  <p>Estimación por Máxima Verosimilitud (MLE): para Normal, μ̂ = media muestral, σ̂ = desv. estándar. Para Poisson, λ̂ = media muestral. Para Exponencial, λ̂ = 1/media. Para Gamma y Beta, usa métodos numéricos (scipy.stats.fit en Python, fitdistr en R). Verifica el ajuste con el test de Kolmogorov-Smirnov o Chi-cuadrado de bondad de ajuste.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>6</div>
                <div className={styles.eduStepContent}>
                  <h4>Valida el ajuste visualmente y estadísticamente</h4>
                  <p>Herramientas visuales: Q-Q plot (los puntos deben seguir la línea diagonal), histograma vs curva teórica. Estadísticos de bondad de ajuste: Kolmogorov-Smirnov (p &gt; 0,05 indica buen ajuste), AIC/BIC para comparar modelos alternativos (menor = mejor). Si ninguna distribución teórica ajusta bien, considera distribuciones no paramétricas o mezclas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips - Mejores Prácticas */}
          <div className={styles.eduTipsSection}>
            <h3>✅ Mejores Prácticas al Trabajar con Distribuciones</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📊</span>
                <h4>Visualiza siempre primero</h4>
                <p>Antes de asumir una distribución, haz un histograma y un Q-Q plot. Los datos reales raras veces siguen distribuciones teóricas perfectamente.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔢</span>
                <h4>Entiende los parámetros</h4>
                <p>Parametrización importa: la Exponencial puede expresarse con λ (tasa) o con 1/λ (escala). Python scipy.stats usa escala; esta calculadora usa λ. Verifica siempre.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🎯</span>
                <h4>Verifica la independencia</h4>
                <p>Binomial y Poisson asumen observaciones independientes. Si hay correlación (series temporales, datos espaciales), las distribuciones estándar subestiman la varianza real.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>⚠️</span>
                <h4>Las colas importan mucho</h4>
                <p>La distribución Normal subestima eventos extremos. En finanzas y seguros, las distribuciones de cola pesada (t-Student, Pareto) son más realistas para modelar pérdidas catastróficas.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔬</span>
                <h4>Usa MLE para estimar parámetros</h4>
                <p>La Estimación por Máxima Verosimilitud (MLE) da los mejores estimadores insesgados para muestras grandes. Para muestras pequeñas, los estimadores bayesianos (MAP) pueden ser superiores.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📈</span>
                <h4>Compara modelos con AIC/BIC</h4>
                <p>Si dudas entre Gamma y LogNormal, ajusta ambas y compara el AIC (Akaike Information Criterion): el menor indica mejor ajuste penalizado por complejidad. La diferencia ΔAIC &gt; 4 es significativa.</p>
              </div>
            </div>
          </div>

          {/* Warning Box - Errores Comunes */}
          <div className={styles.eduWarningBox}>
            <div className={styles.eduWarningHeader}>
              <span className={styles.eduWarningIcon}>⚠️</span>
              <h3>Errores Comunes al Usar Distribuciones de Probabilidad</h3>
            </div>
            <ul className={styles.eduWarningList}>
              <li><strong>❌ Asumir normalidad sin verificar:</strong> El TCL garantiza normalidad de la media muestral con n grande, no de los datos individuales. Ingresos, tiempos de respuesta y precios de activos rara vez son normales. Shapiro-Wilk + histograma siempre antes.</li>
              <li><strong>❌ Confundir densidad con probabilidad en distribuciones continuas:</strong> f(x) puede ser mayor que 1 (Normal(0, 0.1) tiene densidad ≈ 3,99 en x=0). La probabilidad real requiere integración: P(X ∈ [a,b]) = CDF(b) - CDF(a). Nunca digas &quot;la probabilidad es f(x)&quot;.</li>
              <li><strong>❌ Usar Poisson cuando los eventos no son independientes:</strong> Poisson asume que la ocurrencia de un evento no afecta la probabilidad de los siguientes. En epidemias (contagios), accidentes de tráfico en cadena, o tweets virales, los eventos se autopromueven. Usa modelos Hawkes o distribuciones de cola pesada.</li>
              <li><strong>❌ Ignorar la sobredispersión en datos de conteo:</strong> Poisson asume varianza = media. Si varianza &gt;&gt; media (sobredispersión), usa Binomial Negativa. Ejemplo: número de visitas al médico por persona tiene alta varianza entre personas (algunos van 0 veces, otros 20+).</li>
              <li><strong>❌ Extrapolar más allá del rango de datos observados:</strong> Una distribución ajustada a datos históricos no predice confiablemente eventos fuera del rango observado. El VaR basado en Normal subestimó drásticamente las pérdidas en 2008. Para colas, usa Teoría de Valores Extremos (GEV, GPD).</li>
              <li><strong>❌ Mezclar distribuciones de distintas poblaciones sin modelarlo:</strong> Si tus datos provienen de 2 grupos (ej: tiempos de respuesta de servidores lentos y rápidos), la distribución combinada puede parecer bimodal. Un solo modelo Normal fallará. Usa modelos de mezcla (GMM) para datos con múltiples modos.</li>
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
