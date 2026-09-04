'use client';

import { useState, useMemo } from 'react';
import styles from './EstadisticaAvanzada.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, LecturaSerie } from '@/components';
import { formatNumber, parsearSerieNumerica, type ModoLectura } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import jStat from 'jstat';

type TabType = 'ttest' | 'correlation' | 'regression' | 'chisquare' | 'confidence' | 'normality';

// Interpretación de p-value
const interpretPValue = (p: number, alpha: number = 0.05): { text: string; significant: boolean } => {
  if (p < alpha) {
    return { text: `Significativo (p < ${alpha})`, significant: true };
  }
  return { text: `No significativo (p ≥ ${alpha})`, significant: false };
};

// Interpretación de correlación
const interpretCorrelation = (r: number): string => {
  const absR = Math.abs(r);
  const direction = r >= 0 ? 'positiva' : 'negativa';
  if (absR < 0.1) return 'Correlación nula o muy débil';
  if (absR < 0.3) return `Correlación ${direction} débil`;
  if (absR < 0.5) return `Correlación ${direction} moderada`;
  if (absR < 0.7) return `Correlación ${direction} fuerte`;
  if (absR < 0.9) return `Correlación ${direction} muy fuerte`;
  return `Correlación ${direction} casi perfecta`;
};

export default function EstadisticaAvanzadaPage() {
  /**
   * Cómo leer la coma en TODOS los campos de esta página.
   *
   * Hasta el 04/09/2026 la app hacía `replace(/,/g, '.')` sobre el texto entero antes de
   * partirlo, de modo que la coma nunca podía separar valores: «23,25,28» se leía como un
   * único dato de 23,25 y el test se calculaba con él sin decir nada. Ahora el papel de la
   * coma lo deduce `parsearSerieNumerica` del propio texto —y el usuario puede imponerlo—,
   * con el número de valores leídos a la vista bajo cada campo.
   */
  const [modoLectura, setModoLectura] = useState<ModoLectura>('auto');

  /** Lectura completa de un campo, para enseñarla; `parseData` se queda con los valores. */
  const leerSerie = (texto: string) => parsearSerieNumerica(texto, modoLectura);
  const parseData = (texto: string): number[] => leerSerie(texto).valores;

  const [activeTab, setActiveTab] = useState<TabType>('ttest');

  // Estados para cada módulo
  const [ttestData1, setTtestData1] = useState('');
  const [ttestData2, setTtestData2] = useState('');
  const [ttestType, setTtestType] = useState<'independent' | 'paired' | 'onesample'>('independent');
  const [ttestMu, setTtestMu] = useState('0');

  const [corrData1, setCorrData1] = useState('');
  const [corrData2, setCorrData2] = useState('');
  const [corrType, setCorrType] = useState<'pearson' | 'spearman'>('pearson');

  const [regX, setRegX] = useState('');
  const [regY, setRegY] = useState('');

  const [chiObserved, setChiObserved] = useState('');
  const [chiExpected, setChiExpected] = useState('');

  const [confData, setConfData] = useState('');
  const [confLevel, setConfLevel] = useState('95');

  const [normData, setNormData] = useState('');

  // Resultados T-Test
  const ttestResults = useMemo(() => {
    const data1 = parseData(ttestData1);
    const data2 = parseData(ttestData2);

    if (ttestType === 'onesample') {
      if (data1.length < 2) return null;
      const mu = parseFloat(ttestMu.replace(',', '.')) || 0;
      const mean = jStat.mean(data1);
      const std = jStat.stdev(data1, true);
      const n = data1.length;
      const se = std / Math.sqrt(n);
      const t = (mean - mu) / se;
      const df = n - 1;
      const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));

      return {
        type: 'Una muestra',
        t: t,
        df: df,
        pValue: pValue,
        mean1: mean,
        std1: std,
        n1: n,
        mu: mu,
        interpretation: interpretPValue(pValue)
      };
    }

    if (data1.length < 2 || data2.length < 2) return null;

    if (ttestType === 'paired') {
      if (data1.length !== data2.length) return null;
      const differences = data1.map((v, i) => v - data2[i]);
      const meanDiff = jStat.mean(differences);
      const stdDiff = jStat.stdev(differences, true);
      const n = differences.length;
      const se = stdDiff / Math.sqrt(n);
      const t = meanDiff / se;
      const df = n - 1;
      const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));

      return {
        type: 'Muestras pareadas',
        t: t,
        df: df,
        pValue: pValue,
        meanDiff: meanDiff,
        stdDiff: stdDiff,
        n: n,
        interpretation: interpretPValue(pValue)
      };
    }

    // Independent samples
    const mean1 = jStat.mean(data1);
    const mean2 = jStat.mean(data2);
    const var1 = jStat.variance(data1, true);
    const var2 = jStat.variance(data2, true);
    const n1 = data1.length;
    const n2 = data2.length;

    // Welch's t-test
    const se = Math.sqrt(var1/n1 + var2/n2);
    const t = (mean1 - mean2) / se;
    const dfNum = Math.pow(var1/n1 + var2/n2, 2);
    const dfDen = Math.pow(var1/n1, 2)/(n1-1) + Math.pow(var2/n2, 2)/(n2-1);
    const df = dfNum / dfDen;
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));

    return {
      type: 'Muestras independientes (Welch)',
      t: t,
      df: df,
      pValue: pValue,
      mean1: mean1,
      mean2: mean2,
      std1: Math.sqrt(var1),
      std2: Math.sqrt(var2),
      n1: n1,
      n2: n2,
      interpretation: interpretPValue(pValue)
    };
  }, [ttestData1, ttestData2, ttestType, ttestMu]);

  // Resultados Correlación
  const corrResults = useMemo(() => {
    const data1 = parseData(corrData1);
    const data2 = parseData(corrData2);

    if (data1.length < 3 || data2.length < 3 || data1.length !== data2.length) return null;

    const n = data1.length;

    if (corrType === 'pearson') {
      const r = jStat.corrcoeff(data1, data2);
      // Test de significancia
      const t = r * Math.sqrt((n - 2) / (1 - r * r));
      const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));
      const r2 = r * r;

      return {
        type: 'Pearson',
        r: r,
        r2: r2,
        t: t,
        df: n - 2,
        pValue: pValue,
        n: n,
        interpretation: interpretCorrelation(r),
        significance: interpretPValue(pValue)
      };
    }

    // Spearman (rangos)
    const rank = (arr: number[]): number[] => {
      const sorted = [...arr].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
      const ranks = new Array(arr.length);
      for (let i = 0; i < sorted.length; i++) {
        ranks[sorted[i].i] = i + 1;
      }
      return ranks;
    };

    const ranks1 = rank(data1);
    const ranks2 = rank(data2);
    const rho = jStat.corrcoeff(ranks1, ranks2);
    const t = rho * Math.sqrt((n - 2) / (1 - rho * rho));
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));

    return {
      type: 'Spearman',
      r: rho,
      r2: rho * rho,
      t: t,
      df: n - 2,
      pValue: pValue,
      n: n,
      interpretation: interpretCorrelation(rho),
      significance: interpretPValue(pValue)
    };
  }, [corrData1, corrData2, corrType]);

  // Resultados Regresión
  const regResults = useMemo(() => {
    const dataX = parseData(regX);
    const dataY = parseData(regY);

    if (dataX.length < 3 || dataY.length < 3 || dataX.length !== dataY.length) return null;

    const n = dataX.length;
    const meanX = jStat.mean(dataX);
    const meanY = jStat.mean(dataY);

    // Calcular pendiente y ordenada
    let sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumXY += (dataX[i] - meanX) * (dataY[i] - meanY);
      sumX2 += Math.pow(dataX[i] - meanX, 2);
    }

    const slope = sumXY / sumX2;
    const intercept = meanY - slope * meanX;

    // R-squared
    const predicted = dataX.map(x => intercept + slope * x);
    const ssRes = dataY.reduce((sum, y, i) => sum + Math.pow(y - predicted[i], 2), 0);
    const ssTot = dataY.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
    const r2 = 1 - ssRes / ssTot;
    const r = Math.sqrt(r2) * (slope >= 0 ? 1 : -1);

    // Error estándar de la regresión
    const se = Math.sqrt(ssRes / (n - 2));

    // Error estándar de la pendiente
    const seSlope = se / Math.sqrt(sumX2);
    const tSlope = slope / seSlope;
    const pSlope = 2 * (1 - jStat.studentt.cdf(Math.abs(tSlope), n - 2));

    // F-statistic
    const ssReg = ssTot - ssRes;
    const fStat = (ssReg / 1) / (ssRes / (n - 2));
    const pF = 1 - jStat.centralF.cdf(fStat, 1, n - 2);

    return {
      slope: slope,
      intercept: intercept,
      r: r,
      r2: r2,
      se: se,
      seSlope: seSlope,
      tSlope: tSlope,
      pSlope: pSlope,
      fStat: fStat,
      pF: pF,
      n: n,
      equation: `y = ${formatNumber(intercept, 4)} + ${formatNumber(slope, 4)}x`,
      interpretation: interpretPValue(pSlope)
    };
  }, [regX, regY]);

  // Resultados Chi-cuadrado
  const chiResults = useMemo(() => {
    const observed = parseData(chiObserved);
    const expected = parseData(chiExpected);

    if (observed.length < 2) return null;

    // Si no hay esperados, asumir distribución uniforme
    const exp = expected.length === observed.length
      ? expected
      : observed.map(() => jStat.sum(observed) / observed.length);

    if (exp.some(e => e <= 0)) return null;

    // Calcular chi-cuadrado
    let chi2 = 0;
    for (let i = 0; i < observed.length; i++) {
      chi2 += Math.pow(observed[i] - exp[i], 2) / exp[i];
    }

    const df = observed.length - 1;
    const pValue = 1 - jStat.chisquare.cdf(chi2, df);

    // Detalles por categoría
    const details = observed.map((o, i) => ({
      observed: o,
      expected: exp[i],
      contribution: Math.pow(o - exp[i], 2) / exp[i]
    }));

    return {
      chi2: chi2,
      df: df,
      pValue: pValue,
      details: details,
      interpretation: interpretPValue(pValue)
    };
  }, [chiObserved, chiExpected]);

  // Resultados Intervalo de Confianza
  const confResults = useMemo(() => {
    const data = parseData(confData);
    const level = parseFloat(confLevel) / 100;

    if (data.length < 2 || isNaN(level) || level <= 0 || level >= 1) return null;

    const n = data.length;
    const mean = jStat.mean(data);
    const std = jStat.stdev(data, true);
    const se = std / Math.sqrt(n);

    const alpha = 1 - level;
    const tCrit = jStat.studentt.inv(1 - alpha / 2, n - 1);
    const marginError = tCrit * se;

    const lowerBound = mean - marginError;
    const upperBound = mean + marginError;

    // También calcular con Z (para comparación con n grande)
    const zCrit = jStat.normal.inv(1 - alpha / 2, 0, 1);
    const marginErrorZ = zCrit * se;

    return {
      mean: mean,
      std: std,
      se: se,
      n: n,
      level: level * 100,
      tCrit: tCrit,
      marginError: marginError,
      lowerBound: lowerBound,
      upperBound: upperBound,
      zCrit: zCrit,
      marginErrorZ: marginErrorZ,
      lowerBoundZ: mean - marginErrorZ,
      upperBoundZ: mean + marginErrorZ
    };
  }, [confData, confLevel]);

  // Resultados Test de Normalidad
  const normResults = useMemo(() => {
    const data = parseData(normData);

    if (data.length < 3) return null;

    const n = data.length;
    const mean = jStat.mean(data);
    const std = jStat.stdev(data, true);
    const sorted = [...data].sort((a, b) => a - b);

    // Asimetría (Skewness)
    const skewness = (jStat as Record<string, (d: number[]) => number>).skewness(data);

    // Curtosis
    const kurtosis = (jStat as Record<string, (d: number[]) => number>).kurtosis(data);

    // Test de Jarque-Bera (aproximación para normalidad)
    const jb = (n / 6) * (Math.pow(skewness, 2) + Math.pow(kurtosis - 3, 2) / 4);
    const pJB = 1 - jStat.chisquare.cdf(jb, 2);

    // Cuartiles para análisis
    const q1 = jStat.percentile(data, 0.25);
    const q2 = jStat.percentile(data, 0.5);
    const q3 = jStat.percentile(data, 0.75);
    const iqr = q3 - q1;

    // Detectar outliers (método IQR)
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = data.filter(v => v < lowerFence || v > upperFence);

    // Interpretación de asimetría
    let skewInterp = 'Distribución simétrica';
    if (skewness < -0.5) skewInterp = 'Asimetría negativa (cola izquierda)';
    else if (skewness > 0.5) skewInterp = 'Asimetría positiva (cola derecha)';

    // Interpretación de curtosis
    let kurtInterp = 'Curtosis similar a la normal (mesocúrtica)';
    if (kurtosis < 2.5) kurtInterp = 'Curtosis baja (platicúrtica) - colas ligeras';
    else if (kurtosis > 3.5) kurtInterp = 'Curtosis alta (leptocúrtica) - colas pesadas';

    return {
      n: n,
      mean: mean,
      std: std,
      min: sorted[0],
      max: sorted[n - 1],
      skewness: skewness,
      kurtosis: kurtosis,
      jb: jb,
      pJB: pJB,
      q1: q1,
      q2: q2,
      q3: q3,
      iqr: iqr,
      outliers: outliers,
      skewInterp: skewInterp,
      kurtInterp: kurtInterp,
      normalityInterp: interpretPValue(pJB),
      isNormal: pJB >= 0.05
    };
  }, [normData]);

  // Ejemplos de datos
  const loadExample = (tab: TabType) => {
    switch (tab) {
      case 'ttest':
        setTtestData1('23 25 28 22 26 24 27 25 29 24');
        setTtestData2('20 22 24 21 23 19 25 22 26 21');
        setTtestType('independent');
        break;
      case 'correlation':
        setCorrData1('1 2 3 4 5 6 7 8 9 10');
        setCorrData2('2.1 4.3 5.8 8.2 9.5 12.1 14.2 15.8 18.3 20.1');
        break;
      case 'regression':
        setRegX('1 2 3 4 5 6 7 8 9 10');
        setRegY('2.5 5.1 7.2 9.8 12.3 14.9 17.1 19.8 22.4 25.0');
        break;
      case 'chisquare':
        setChiObserved('45 35 20');
        setChiExpected('33.33 33.33 33.33');
        break;
      case 'confidence':
        setConfData('52 48 55 51 49 53 50 54 47 56 52 48');
        setConfLevel('95');
        break;
      case 'normality':
        setNormData('23.5 25.1 22.8 24.3 26.0 23.9 25.5 24.7 22.1 25.8 24.0 23.2 25.3 24.8 23.7 26.2 24.5 25.0 23.4 24.9');
        break;
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'ttest', label: 'Test t-Student', icon: '📊' },
    { id: 'correlation', label: 'Correlación', icon: '📈' },
    { id: 'regression', label: 'Regresión', icon: '📉' },
    { id: 'chisquare', label: 'Chi-cuadrado', icon: '🎲' },
    { id: 'confidence', label: 'Int. Confianza', icon: '🎯' },
    { id: 'normality', label: 'Normalidad', icon: '🔔' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>📊</span>
        <h1 className={styles.title}>Estadística Avanzada</h1>
        <p className={styles.subtitle}>
          Tests de hipótesis, regresión, correlación e intervalos de confianza
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Tabs de navegación */}
      <nav className={styles.tabNav}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
            aria-pressed={activeTab === tab.id}
          >
            <span className={styles.tabIcon} aria-hidden="true">{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className={styles.mainContent}>
        {/* Test t-Student */}
        {activeTab === 'ttest' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Test t de Student</h2>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Tipo de test</label>
                <select
                  value={ttestType}
                  onChange={e => setTtestType(e.target.value as typeof ttestType)}
                  className={styles.select}
                >
                  <option value="independent">Muestras independientes</option>
                  <option value="paired">Muestras pareadas</option>
                  <option value="onesample">Una muestra</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  {ttestType === 'onesample' ? 'Datos de la muestra' : 'Grupo 1'}
                </label>
                <textarea
                  value={ttestData1}
                  onChange={e => setTtestData1(e.target.value)}
                  placeholder="Ej: 23 25 28 22 26 24 · con decimales: 23,5 25,1 o 23.5 25.1"
                  className={styles.textarea}
                  rows={3}
                />
                <LecturaSerie serie={leerSerie(ttestData1)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              {ttestType !== 'onesample' && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Grupo 2</label>
                  <textarea
                    value={ttestData2}
                    onChange={e => setTtestData2(e.target.value)}
                    placeholder="Ej: 20 22 24 21 23 19 · puedes pegar una columna de Excel"
                    className={styles.textarea}
                    rows={3}
                  />
                  <LecturaSerie serie={leerSerie(ttestData2)} modo={modoLectura} onCambiarModo={setModoLectura} />
                </div>
              )}

              {ttestType === 'onesample' && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Valor de referencia (μ₀)</label>
                  <input
                    type="text"
                    value={ttestMu}
                    onChange={e => setTtestMu(e.target.value)}
                    placeholder="0"
                    className={styles.input}
                  />
                </div>
              )}

              <button type="button" onClick={() => loadExample('ttest')} className={styles.btnSecondary}>
                Cargar ejemplo
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Resultados</h2>
              {ttestResults ? (
                <div className={styles.resultsGrid}>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Tipo de test</span>
                    <span className={styles.resultValue}>{ttestResults.type}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Estadístico t</span>
                    <span className={styles.resultValue}>{formatNumber(ttestResults.t, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Grados de libertad</span>
                    <span className={styles.resultValue}>{formatNumber(ttestResults.df, 2)}</span>
                  </div>
                  <div className={`${styles.resultCard} ${ttestResults.interpretation.significant ? styles.significant : styles.notSignificant}`}>
                    <span className={styles.resultLabel}>p-valor</span>
                    <span className={styles.resultValue}>{formatNumber(ttestResults.pValue, 6)}</span>
                  </div>
                  <div className={`${styles.resultCard} ${styles.fullWidth} ${ttestResults.interpretation.significant ? styles.significant : styles.notSignificant}`}>
                    <span className={styles.resultLabel}>Interpretación (α = 0,05)</span>
                    <span className={styles.resultValue}>{ttestResults.interpretation.text}</span>
                  </div>
                  {'mean1' in ttestResults && 'mean2' in ttestResults && (
                    <>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Media Grupo 1</span>
                        <span className={styles.resultValue}>{formatNumber((ttestResults as unknown as Record<string, number>).mean1 ?? 0, 4)}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Media Grupo 2</span>
                        <span className={styles.resultValue}>{formatNumber((ttestResults as unknown as Record<string, number>).mean2 ?? 0, 4)}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className={styles.placeholder}>
                  Introduce datos para ver los resultados del test t.
                  {ttestType === 'paired' && ' Las muestras pareadas deben tener el mismo tamaño.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Correlación */}
        {activeTab === 'correlation' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Análisis de Correlación</h2>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Tipo de correlación</label>
                <select
                  value={corrType}
                  onChange={e => setCorrType(e.target.value as typeof corrType)}
                  className={styles.select}
                >
                  <option value="pearson">Pearson (lineal)</option>
                  <option value="spearman">Spearman (rangos)</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Variable X</label>
                <textarea
                  value={corrData1}
                  onChange={e => setCorrData1(e.target.value)}
                  placeholder="Ej: 1 2 3 4 5 6 7 8 9 10"
                  className={styles.textarea}
                  rows={3}
                />
                <LecturaSerie serie={leerSerie(corrData1)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Variable Y</label>
                <textarea
                  value={corrData2}
                  onChange={e => setCorrData2(e.target.value)}
                  placeholder="Ej: 2.1 4.3 5.8 8.2 9.5"
                  className={styles.textarea}
                  rows={3}
                />
                <LecturaSerie serie={leerSerie(corrData2)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <button type="button" onClick={() => loadExample('correlation')} className={styles.btnSecondary}>
                Cargar ejemplo
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Resultados</h2>
              {corrResults ? (
                <div className={styles.resultsGrid}>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Tipo</span>
                    <span className={styles.resultValue}>{corrResults.type}</span>
                  </div>
                  <div className={`${styles.resultCard} ${styles.highlight}`}>
                    <span className={styles.resultLabel}>Coeficiente (r)</span>
                    <span className={styles.resultValue}>{formatNumber(corrResults.r, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>R² (varianza explicada)</span>
                    <span className={styles.resultValue}>{formatNumber(corrResults.r2 * 100, 2)}%</span>
                  </div>
                  <div className={`${styles.resultCard} ${corrResults.significance.significant ? styles.significant : styles.notSignificant}`}>
                    <span className={styles.resultLabel}>p-valor</span>
                    <span className={styles.resultValue}>{formatNumber(corrResults.pValue, 6)}</span>
                  </div>
                  <div className={`${styles.resultCard} ${styles.fullWidth}`}>
                    <span className={styles.resultLabel}>Interpretación</span>
                    <span className={styles.resultValue}>{corrResults.interpretation}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Estadístico t</span>
                    <span className={styles.resultValue}>{formatNumber(corrResults.t, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>n (pares)</span>
                    <span className={styles.resultValue}>{corrResults.n}</span>
                  </div>
                </div>
              ) : (
                <p className={styles.placeholder}>
                  Introduce dos variables con el mismo número de observaciones (mínimo 3).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Regresión Lineal */}
        {activeTab === 'regression' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Regresión Lineal Simple</h2>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Variable independiente (X)</label>
                <textarea
                  value={regX}
                  onChange={e => setRegX(e.target.value)}
                  placeholder="Ej: 1 2 3 4 5 6 7 8 9 10"
                  className={styles.textarea}
                  rows={3}
                />
                <LecturaSerie serie={leerSerie(regX)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Variable dependiente (Y)</label>
                <textarea
                  value={regY}
                  onChange={e => setRegY(e.target.value)}
                  placeholder="Ej: 2.5 5.1 7.2 9.8 12.3"
                  className={styles.textarea}
                  rows={3}
                />
                <LecturaSerie serie={leerSerie(regY)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <button type="button" onClick={() => loadExample('regression')} className={styles.btnSecondary}>
                Cargar ejemplo
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Resultados</h2>
              {regResults ? (
                <div className={styles.resultsGrid}>
                  <div className={`${styles.resultCard} ${styles.fullWidth} ${styles.highlight}`}>
                    <span className={styles.resultLabel}>Ecuación de regresión</span>
                    <span className={styles.resultValueLarge}>{regResults.equation}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Pendiente (β₁)</span>
                    <span className={styles.resultValue}>{formatNumber(regResults.slope, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Intercepto (β₀)</span>
                    <span className={styles.resultValue}>{formatNumber(regResults.intercept, 4)}</span>
                  </div>
                  <div className={`${styles.resultCard} ${styles.highlight}`}>
                    <span className={styles.resultLabel}>R²</span>
                    <span className={styles.resultValue}>{formatNumber(regResults.r2 * 100, 2)}%</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>r (correlación)</span>
                    <span className={styles.resultValue}>{formatNumber(regResults.r, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Error estándar</span>
                    <span className={styles.resultValue}>{formatNumber(regResults.se, 4)}</span>
                  </div>
                  <div className={`${styles.resultCard} ${regResults.interpretation.significant ? styles.significant : styles.notSignificant}`}>
                    <span className={styles.resultLabel}>p-valor (pendiente)</span>
                    <span className={styles.resultValue}>{formatNumber(regResults.pSlope, 6)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>F-statistic</span>
                    <span className={styles.resultValue}>{formatNumber(regResults.fStat, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>n (observaciones)</span>
                    <span className={styles.resultValue}>{regResults.n}</span>
                  </div>
                </div>
              ) : (
                <p className={styles.placeholder}>
                  Introduce las variables X e Y con el mismo número de valores (mínimo 3).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Chi-cuadrado */}
        {activeTab === 'chisquare' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Test Chi-cuadrado (χ²)</h2>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Frecuencias observadas</label>
                <textarea
                  value={chiObserved}
                  onChange={e => setChiObserved(e.target.value)}
                  placeholder="Ej: 45 35 20"
                  className={styles.textarea}
                  rows={2}
                />
                <LecturaSerie serie={leerSerie(chiObserved)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Frecuencias esperadas (opcional)</label>
                <textarea
                  value={chiExpected}
                  onChange={e => setChiExpected(e.target.value)}
                  placeholder="Dejar vacío para distribución uniforme"
                  className={styles.textarea}
                  rows={2}
                />
                <LecturaSerie serie={leerSerie(chiExpected)} modo={modoLectura} onCambiarModo={setModoLectura} />
                <span className={styles.helperText}>
                  Si se deja vacío, se asume distribución uniforme
                </span>
              </div>

              <button type="button" onClick={() => loadExample('chisquare')} className={styles.btnSecondary}>
                Cargar ejemplo
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Resultados</h2>
              {chiResults ? (
                <div className={styles.resultsGrid}>
                  <div className={`${styles.resultCard} ${styles.highlight}`}>
                    <span className={styles.resultLabel}>Chi-cuadrado (χ²)</span>
                    <span className={styles.resultValue}>{formatNumber(chiResults.chi2, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Grados de libertad</span>
                    <span className={styles.resultValue}>{chiResults.df}</span>
                  </div>
                  <div className={`${styles.resultCard} ${chiResults.interpretation.significant ? styles.significant : styles.notSignificant}`}>
                    <span className={styles.resultLabel}>p-valor</span>
                    <span className={styles.resultValue}>{formatNumber(chiResults.pValue, 6)}</span>
                  </div>
                  <div className={`${styles.resultCard} ${styles.fullWidth} ${chiResults.interpretation.significant ? styles.significant : styles.notSignificant}`}>
                    <span className={styles.resultLabel}>Interpretación (α = 0,05)</span>
                    <span className={styles.resultValue}>{chiResults.interpretation.text}</span>
                  </div>

                  <div className={`${styles.resultCard} ${styles.fullWidth}`}>
                    <span className={styles.resultLabel}>Detalle por categoría</span>
                    <table className={styles.detailTable}>
                      <thead>
                        <tr>
                          <th>Cat.</th>
                          <th>Observado</th>
                          <th>Esperado</th>
                          <th>Contribución</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chiResults.details.map((d, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{formatNumber(d.observed, 2)}</td>
                            <td>{formatNumber(d.expected, 2)}</td>
                            <td>{formatNumber(d.contribution, 4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className={styles.placeholder}>
                  Introduce al menos 2 frecuencias observadas.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Intervalo de Confianza */}
        {activeTab === 'confidence' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Intervalo de Confianza</h2>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Datos de la muestra</label>
                <textarea
                  value={confData}
                  onChange={e => setConfData(e.target.value)}
                  placeholder="Ej: 52 48 55 51 49 53 50 54"
                  className={styles.textarea}
                  rows={3}
                />
                <LecturaSerie serie={leerSerie(confData)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Nivel de confianza (%)</label>
                <select
                  value={confLevel}
                  onChange={e => setConfLevel(e.target.value)}
                  className={styles.select}
                >
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
              </div>

              <button type="button" onClick={() => loadExample('confidence')} className={styles.btnSecondary}>
                Cargar ejemplo
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Resultados</h2>
              {confResults ? (
                <div className={styles.resultsGrid}>
                  <div className={`${styles.resultCard} ${styles.fullWidth} ${styles.highlight}`}>
                    <span className={styles.resultLabel}>Intervalo de Confianza al {confResults.level}% (t-Student)</span>
                    <span className={styles.resultValueLarge}>
                      [{formatNumber(confResults.lowerBound, 4)} , {formatNumber(confResults.upperBound, 4)}]
                    </span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Media muestral (x̄)</span>
                    <span className={styles.resultValue}>{formatNumber(confResults.mean, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Desviación estándar (s)</span>
                    <span className={styles.resultValue}>{formatNumber(confResults.std, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Error estándar</span>
                    <span className={styles.resultValue}>{formatNumber(confResults.se, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Tamaño (n)</span>
                    <span className={styles.resultValue}>{confResults.n}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Valor crítico t</span>
                    <span className={styles.resultValue}>{formatNumber(confResults.tCrit, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Margen de error</span>
                    <span className={styles.resultValue}>±{formatNumber(confResults.marginError, 4)}</span>
                  </div>

                  <div className={`${styles.resultCard} ${styles.fullWidth} ${styles.infoCard}`}>
                    <span className={styles.resultLabel}>Comparación con distribución Normal (Z)</span>
                    <span className={styles.resultValueSmall}>
                      IC: [{formatNumber(confResults.lowerBoundZ, 4)} , {formatNumber(confResults.upperBoundZ, 4)}]
                    </span>
                    <span className={styles.helperText}>
                      La distribución t es más conservadora (IC más amplio) para muestras pequeñas
                    </span>
                  </div>
                </div>
              ) : (
                <p className={styles.placeholder}>
                  Introduce al menos 2 valores para calcular el intervalo de confianza.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Test de Normalidad */}
        {activeTab === 'normality' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Análisis de Normalidad</h2>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Datos de la muestra</label>
                <textarea
                  value={normData}
                  onChange={e => setNormData(e.target.value)}
                  placeholder="Ej: 23.5 25.1 22.8 24.3 26.0 23.9"
                  className={styles.textarea}
                  rows={4}
                />
                <LecturaSerie serie={leerSerie(normData)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <button type="button" onClick={() => loadExample('normality')} className={styles.btnSecondary}>
                Cargar ejemplo
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Resultados</h2>
              {normResults ? (
                <div className={styles.resultsGrid}>
                  <div className={`${styles.resultCard} ${styles.fullWidth} ${normResults.isNormal ? styles.significant : styles.notSignificant}`}>
                    <span className={styles.resultLabel}>Test Jarque-Bera de Normalidad</span>
                    <span className={styles.resultValue}>
                      {normResults.isNormal
                        ? '✓ No se rechaza normalidad (p ≥ 0,05)'
                        : '✗ Se rechaza normalidad (p < 0,05)'}
                    </span>
                  </div>

                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Estadístico JB</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.jb, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>p-valor</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.pJB, 6)}</span>
                  </div>

                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Asimetría (Skewness)</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.skewness, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Curtosis</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.kurtosis, 4)}</span>
                  </div>

                  <div className={`${styles.resultCard} ${styles.fullWidth}`}>
                    <span className={styles.resultLabel}>Interpretación de forma</span>
                    <span className={styles.resultValueSmall}>{normResults.skewInterp}</span>
                    <span className={styles.resultValueSmall}>{normResults.kurtInterp}</span>
                  </div>

                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Media</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.mean, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Desv. estándar</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.std, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Mínimo</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.min, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Máximo</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.max, 4)}</span>
                  </div>

                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Q1 (25%)</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.q1, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Mediana (Q2)</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.q2, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Q3 (75%)</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.q3, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>IQR</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.iqr, 4)}</span>
                  </div>

                  {normResults.outliers.length > 0 && (
                    <div className={`${styles.resultCard} ${styles.fullWidth} ${styles.warningCard}`}>
                      <span className={styles.resultLabel}>⚠️ Outliers detectados ({normResults.outliers.length})</span>
                      <span className={styles.resultValueSmall}>
                        {normResults.outliers.map(o => formatNumber(o, 2)).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className={styles.placeholder}>
                  Introduce al menos 3 valores para analizar la normalidad.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="estadistica-avanzada">
        <p>Esta calculadora es una <strong>herramienta educativa</strong> para estadística inferencial:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Para investigación académica o profesional</strong>: Utiliza software especializado (R, SPSS, Stata, Python) validado científicamente</li>
          <li><strong>Consulta con un estadístico profesional</strong>: Para interpretación de resultados en contextos críticos de investigación</li>
        </ul>
      </DisclaimerCard>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre estadística inferencial?"
        subtitle="Descubre cuándo usar cada test y cómo interpretar los resultados"
      >
        <section className={styles.guideSection}>
          <h2>Guía de Tests Estadísticos</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📊 Test t de Student</h4>
              <p>
                Compara medias de grupos. Usa <strong>muestras independientes</strong> cuando
                los grupos son diferentes (ej: tratamiento vs control). Usa <strong>muestras
                pareadas</strong> cuando mides lo mismo antes/después. Usa <strong>una muestra</strong>
                para comparar contra un valor teórico.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📈 Correlación</h4>
              <p>
                <strong>Pearson</strong> mide relación lineal entre variables continuas.
                <strong>Spearman</strong> es mejor cuando hay outliers o relaciones no lineales.
                r = 1 es correlación perfecta positiva, r = -1 perfecta negativa, r = 0 sin correlación.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📉 Regresión Lineal</h4>
              <p>
                Predice una variable (Y) a partir de otra (X). El <strong>R²</strong> indica
                qué porcentaje de la variabilidad de Y explica el modelo. La <strong>pendiente</strong>
                indica cuánto cambia Y por cada unidad de X.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎲 Chi-cuadrado</h4>
              <p>
                Compara frecuencias observadas vs esperadas. Útil para variables categóricas.
                Responde: ¿la distribución observada difiere significativamente de la esperada?
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎯 Intervalos de Confianza</h4>
              <p>
                Un IC del 95% significa que si repitieras el estudio 100 veces, 95 de esos
                intervalos contendrían el verdadero parámetro poblacional. Más datos =
                intervalo más estrecho.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🔔 Tests de Normalidad</h4>
              <p>
                Muchos tests asumen datos normales. El test <strong>Jarque-Bera</strong> usa
                asimetría y curtosis. <strong>Asimetría</strong> ≈ 0 y <strong>curtosis</strong> ≈ 3
                indican normalidad. Valores extremos sugieren no normalidad.
              </p>
            </div>
          </div>

          <h3>Interpretación del p-valor</h3>
          <div className={styles.pvalueTable}>
            <table>
              <thead>
                <tr>
                  <th>p-valor</th>
                  <th>Interpretación</th>
                  <th>Decisión típica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>p &lt; 0,001</td>
                  <td>Altamente significativo</td>
                  <td>Rechazar H₀ con alta confianza</td>
                </tr>
                <tr>
                  <td>p &lt; 0,01</td>
                  <td>Muy significativo</td>
                  <td>Rechazar H₀</td>
                </tr>
                <tr>
                  <td>p &lt; 0,05</td>
                  <td>Significativo</td>
                  <td>Rechazar H₀ (criterio estándar)</td>
                </tr>
                <tr>
                  <td>p ≥ 0,05</td>
                  <td>No significativo</td>
                  <td>No rechazar H₀</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Tabla comparativa de tests estadísticos */}
          <div className={styles.eduComparativaSection}>
            <h3>⚖️ ¿Qué Test Estadístico Usar? Comparativa Completa</h3>
            <p className={styles.eduComparativaSubtitle}>Guía rápida para elegir el análisis correcto según tus datos</p>
            <div className={styles.eduTablaWrapper}>
              <table className={styles.eduTablaComparativa}>
                <thead>
                  <tr>
                    <th>Test / Análisis</th>
                    <th>¿Cuándo usar?</th>
                    <th>Tipo de datos</th>
                    <th>Hipótesis nula</th>
                    <th>Resultado clave</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>t-test una muestra</strong></td><td>Comparar media de muestra con valor teórico</td><td>Continuo, normal</td><td>μ = μ₀</td><td>t-estadístico, p-valor</td></tr>
                  <tr><td><strong>t-test dos muestras</strong></td><td>Comparar medias de dos grupos</td><td>Continuo, normal</td><td>μ₁ = μ₂</td><td>t-estadístico, p-valor</td></tr>
                  <tr><td><strong>Correlación de Pearson</strong></td><td>Relación lineal entre dos variables continuas</td><td>Continuo, bivariado</td><td>ρ = 0</td><td>r, p-valor</td></tr>
                  <tr><td><strong>Regresión lineal</strong></td><td>Predecir Y a partir de X, cuantificar efecto</td><td>Continuo</td><td>β = 0</td><td>R², β, p-valor</td></tr>
                  <tr><td><strong>Chi-cuadrado</strong></td><td>Asociación entre variables categóricas</td><td>Categórico</td><td>Variables independientes</td><td>χ², p-valor</td></tr>
                  <tr><td><strong>Intervalo de confianza</strong></td><td>Estimar parámetro poblacional con incertidumbre</td><td>Cualquiera</td><td>No aplica</td><td>IC [lower, upper]</td></tr>
                  <tr><td><strong>Test de normalidad</strong></td><td>Verificar asunción de normalidad antes de otros tests</td><td>Continuo</td><td>Distribución normal</td><td>Decisión sí/no</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Casos de uso por perfil profesional */}
          <div className={styles.eduEscenariosSection}>
            <h3>💼 Casos de Uso por Perfil Profesional</h3>
            <p className={styles.eduEscenariosSubtitle}>Cómo usar estadística avanzada en tu contexto específico</p>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>🔬</span>
                  <h4>Investigador Académico</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Flujo típico:</strong> Test de normalidad → si falla, Mann-Whitney. Si pasa, t-test o ANOVA. Calcula tamaño del efecto (Cohen&apos;s d). Reporta IC 95% además del p-valor.</p>
                <p className={styles.eduEscenarioTip}><strong>Consejo clave:</strong> Nunca reportes solo el p-valor. El tamaño del efecto y el IC son obligatorios para revistas científicas de impacto desde 2016.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>📊</span>
                  <h4>Analista de Datos Empresarial</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Flujo típico:</strong> A/B test → t-test de dos muestras. Correlación entre variables de negocio → Pearson + regresión para cuantificar impacto económico.</p>
                <p className={styles.eduEscenarioTip}><strong>Consejo clave:</strong> En negocio, el p-valor &lt; 0,05 no basta. Calcula el impacto económico del tamaño del efecto: ¿0,3% de mejora en conversión vale el costo del cambio?</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>🎓</span>
                  <h4>Estudiante de Estadística</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Práctica recomendada:</strong> Para cada dataset, aplica: (1) estadísticos descriptivos, (2) visualización, (3) test de normalidad, (4) test apropiado, (5) interpretación en contexto del problema.</p>
                <p className={styles.eduEscenarioTip}><strong>Consejo clave:</strong> Aprende los supuestos antes que las fórmulas. Un t-test mal aplicado a datos no normales con n&lt;30 es peor que no hacer nada.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>🏥</span>
                  <h4>Profesional de Ciencias de la Salud</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Flujo típico:</strong> Comparar grupos de tratamiento → t-test (n&gt;30, normal) o Mann-Whitney. Factores de riesgo → correlación + regresión logística. Siempre reportar NNT (Número Necesario a Tratar).</p>
                <p className={styles.eduEscenarioTip}><strong>Consejo clave:</strong> En salud, la significancia clínica supera a la estadística. Una diferencia de presión arterial de 2 mmHg puede ser estadísticamente significativa con n=10.000 pero clínicamente irrelevante.</p>
              </div>
            </div>
          </div>

          {/* FAQ ampliado */}
          <div className={styles.eduFaqSection}>
            <h3>❓ Preguntas Frecuentes sobre Estadística Avanzada</h3>
            <p className={styles.eduFaqSubtitle}>Respuestas detalladas a las dudas más comunes en análisis estadístico</p>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué significa exactamente el p-valor?</h4>
                <p>El p-valor es la probabilidad de obtener un resultado tan extremo o más extremo que el observado, <strong>asumiendo que la hipótesis nula es cierta</strong>. p = 0,03 NO significa &quot;hay 3% de probabilidad de que H₀ sea verdadera&quot;. Significa que si H₀ fuera cierta, veríamos estos datos (o más extremos) el 3% de las veces. Es la frecuencia del error de tipo I bajo H₀.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Por qué α = 0,05 es el umbral estándar?</h4>
                <p>Ronald Fisher lo propuso en 1925 como convención práctica, no como verdad matemática. Significa aceptar un 5% de probabilidad de rechazar H₀ siendo cierta (error tipo I). En algunos campos es diferente: partículas subatómicas usan 5-sigma (p &lt; 0,000003), ensayos clínicos fases tardías usan α = 0,025 para mayor seguridad.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cuál es la diferencia entre significancia estadística y relevancia práctica?</h4>
                <p>Con muestras grandes (n &gt; 10.000), casi cualquier diferencia será estadísticamente significativa aunque sea prácticamente inútil. Ejemplo: un fármaco que reduce la presión arterial 0,5 mmHg puede dar p &lt; 0,001 con n = 50.000, pero clínicamente es irrelevante (el umbral de relevancia es &gt; 5 mmHg). Solución: reportar siempre el tamaño del efecto (Cohen&apos;s d, r², η²).</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cuándo usar t-test en lugar de Mann-Whitney?</h4>
                <p>Usa <strong>t-test</strong> cuando: datos aproximadamente normales (verifica con Shapiro-Wilk), n &gt; 30 (por TCL), sin outliers extremos. Usa <strong>Mann-Whitney</strong> (no paramétrico) cuando: datos sesgados o no normales, outliers significativos, datos ordinales, n pequeño (&lt; 30). Mann-Whitney no asume normalidad pero asume misma forma de distribución en ambos grupos.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué es la potencia estadística y por qué importa?</h4>
                <p>La potencia (1-β) es la probabilidad de detectar un efecto real cuando existe. Potencia = 0,8 significa 80% de probabilidad de rechazar H₀ si el efecto es real. Estudios con baja potencia (&lt; 0,6) producen resultados &quot;no significativos&quot; que en realidad son falsos negativos. Calcula el tamaño de muestra necesario ANTES del estudio para garantizar potencia ≥ 0,8 (convención estándar).</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué mide R² en regresión lineal?</h4>
                <p>R² (coeficiente de determinación) es la proporción de varianza de Y explicada por X. R² = 0,65 significa que X explica el 65% de la variabilidad de Y. Interpretación por campo: en ciencias naturales R² &gt; 0,9 es esperable; en ciencias sociales R² &gt; 0,5 es bueno; en finanzas R² &gt; 0,3 puede ser excelente. R² no mide si el modelo es correcto, solo si hay relación lineal.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cuál es el problema del p-hacking y cómo evitarlo?</h4>
                <p>El p-hacking es manipular el análisis para obtener p &lt; 0,05: probar múltiples variables hasta encontrar una significativa, parar cuando aparece significancia, eliminar outliers selectivamente. Con 20 tests independientes, esperamos 1 falso positivo por azar. Solución: <strong>pré-registro del estudio</strong> (especificar hipótesis y análisis antes de recoger datos), corrección de Bonferroni para múltiples comparaciones (α/n tests).</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cómo interpretar el coeficiente de correlación de Pearson?</h4>
                <p>r mide la fuerza y dirección de la relación LINEAL. Interpretación de Cohen: r = 0,1 débil, r = 0,3 moderado, r = 0,5 fuerte. Importante: r = 0,7 implica R² = 0,49, o sea que X explica solo el 49% de Y. <strong>Correlación no implica causalidad</strong>: el PIB per cápita correlaciona con el número de cines (ambos suben con la riqueza). Verifica siempre con un scatterplot antes de reportar correlación.</p>
              </div>
            </div>
          </div>

          {/* Guía paso a paso */}
          <div className={styles.eduStepSection}>
            <h3>📋 Proceso Correcto de Análisis Estadístico: 7 Pasos</h3>
            <p className={styles.eduComparativaSubtitle}>Desde los datos crudos hasta conclusiones válidas</p>
            <div className={styles.eduStepGuide}>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>1</div>
                <div className={styles.eduStepContent}>
                  <h4>Define la hipótesis ANTES de ver los datos</h4>
                  <p>Formula H₀ y H₁ de forma precisa y medible. &quot;El grupo A tiene mayor media que B&quot; es mejor que &quot;A es diferente de B&quot;. Especifica también α (típicamente 0,05), el test a usar, y el tamaño del efecto mínimo relevante. Si defines la hipótesis DESPUÉS de ver los datos, el análisis es exploratorio, no confirmatorio.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>2</div>
                <div className={styles.eduStepContent}>
                  <h4>Calcula el tamaño de muestra necesario</h4>
                  <p>Usa análisis de potencia (a priori) para determinar n. Necesitas: efecto mínimo relevante, α, potencia deseada (típico: 0,8). Sin esto, el estudio puede ser inconclusivo incluso si el efecto existe. Herramientas: G*Power (gratuito), pwr en R, statsmodels en Python.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>3</div>
                <div className={styles.eduStepContent}>
                  <h4>Explora y limpia los datos (EDA)</h4>
                  <p>Calcula estadísticos descriptivos: media, mediana, desviación estándar, mínimo, máximo, percentiles. Visualiza con histogramas, boxplots, scatterplots. Identifica outliers (IQR × 1,5), valores faltantes, errores de entrada. La exploración revela si los supuestos del test son razonables.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>4</div>
                <div className={styles.eduStepContent}>
                  <h4>Verifica los supuestos del test</h4>
                  <p>Para t-test: normalidad (Shapiro-Wilk si n&lt;50, Kolmogorov-Smirnov si n≥50), homocedasticidad (Levene). Para chi-cuadrado: frecuencias esperadas ≥ 5 en cada celda. Para regresión: residuos normales, homocedasticidad, independencia. Si los supuestos fallan, usa alternativas no paramétricas o transformaciones.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>5</div>
                <div className={styles.eduStepContent}>
                  <h4>Aplica el test estadístico apropiado</h4>
                  <p>Ejecuta el test con los datos completos. Calcula: estadístico del test (t, F, χ², r), p-valor bilateral o unilateral según la hipótesis, grados de libertad, tamaño del efecto (Cohen&apos;s d, r², η², w de Cramer). No redondees el p-valor a &quot;p&lt;0,05&quot;; reporta el valor exacto (ej: p = 0,027).</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>6</div>
                <div className={styles.eduStepContent}>
                  <h4>Calcula el intervalo de confianza</h4>
                  <p>El IC 95% da el rango plausible del parámetro poblacional. Complementa al p-valor con información sobre la magnitud. Interpretación correcta: &quot;si repitiéramos el estudio muchas veces, el 95% de los ICs calculados incluirían el verdadero parámetro&quot;. Si el IC de la diferencia incluye el 0, la diferencia no es significativa (equivalente a p &gt; 0,05).</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>7</div>
                <div className={styles.eduStepContent}>
                  <h4>Interpreta en contexto y comunica correctamente</h4>
                  <p>Reporta: estadístico(gl) = valor, p = valor exacto, IC 95% [a, b], tamaño del efecto con su clasificación. Evita: &quot;el estudio prueba que...&quot;, &quot;hay diferencias significativas&quot; sin especificar la magnitud. Di: &quot;Se encontró una diferencia estadísticamente significativa de 3,2 puntos (t(58) = 2,41, p = 0,019, d = 0,62, IC 95% [0,5, 5,9]), lo que representa un tamaño del efecto moderado&quot;.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips - mejores prácticas */}
          <div className={styles.eduTipsSection}>
            <h3>✅ Mejores Prácticas en Análisis Estadístico</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📈</span>
                <h4>Siempre visualiza antes de calcular</h4>
                <p>Un scatterplot revela outliers, relaciones no lineales y agrupaciones que el estadístico resumen oculta. El cuarteto de Anscombe (mismo r, distribuciones totalmente distintas) lo ilustra perfectamente.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🎯</span>
                <h4>Reporta tamaño del efecto siempre</h4>
                <p>Cohen&apos;s d para diferencias de medias, r² para regresión, η² para ANOVA. Un efecto puede ser estadísticamente significativo pero prácticamente irrelevante (o viceversa con muestras pequeñas).</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔢</span>
                <h4>Usa IC 95% además del p-valor</h4>
                <p>El intervalo de confianza comunica la precisión de la estimación y su relevancia práctica. Un IC [0,01, 0,02] indica precisión pero efecto minúsculo. Un IC [-5, 50] indica alta incertidumbre.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>⚠️</span>
                <h4>Corrige para comparaciones múltiples</h4>
                <p>Con 20 tests independientes a α=0,05, esperas 1 falso positivo. Aplica Bonferroni (α/n) para análisis exploratorios o FDR (Benjamini-Hochberg) para datos genómicos o de neuroimagen.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔬</span>
                <h4>Verifica supuestos del test</h4>
                <p>Shapiro-Wilk para normalidad (antes del t-test), Levene para homocedasticidad, Durbin-Watson para autocorrelación (en series temporales). Un test aplicado con supuestos violados puede dar resultados falsos.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📝</span>
                <h4>Pre-registra tus hipótesis</h4>
                <p>Especifica hipótesis, diseño, tamaño de muestra y análisis ANTES de recoger datos. Usa OSF (Open Science Framework) para pre-registro público. Esto elimina el sesgo de confirmación y el p-hacking.</p>
              </div>
            </div>
          </div>

          {/* Warning box - errores comunes */}
          <div className={styles.eduWarningBox}>
            <div className={styles.eduWarningHeader}>
              <span className={styles.eduWarningIcon}>⚠️</span>
              <h3>Errores Estadísticos que Invalidan tus Conclusiones</h3>
            </div>
            <ul className={styles.eduWarningList}>
              <li><strong>❌ Interpretar p &gt; 0,05 como &quot;no hay efecto&quot;:</strong> Solo significa &quot;insuficiente evidencia para rechazar H₀&quot;. Puede ser por muestra pequeña (baja potencia) o porque el efecto es pequeño. Un IC que incluye valores clínicamente relevantes es más informativo.</li>
              <li><strong>❌ Hacer múltiples tests sin corrección:</strong> Probar 20 hipótesis independientes garantiza ~1 falso positivo por azar. Sin corrección (Bonferroni, FDR), los resultados son no reproducibles. Este es el origen principal de la &quot;crisis de replicación&quot; en ciencias.</li>
              <li><strong>❌ Asumir normalidad sin verificar:</strong> El t-test es robusto a deviaciones leves de normalidad con n &gt; 30, pero no con outliers extremos o distribuciones altamente sesgadas (ej: ingresos, tiempos de respuesta). Shapiro-Wilk + histograma, siempre.</li>
              <li><strong>❌ Confundir correlación con causalidad:</strong> r = 0,95 entre A y B no implica que A cause B. Puede ser relación espuria (ambos correlacionan con C), causalidad inversa (B causa A), o coincidencia. La causalidad requiere diseño experimental o métodos específicos (regresión instrumental, DAGs).</li>
              <li><strong>❌ Aplicar test paramétrico a datos ordinales:</strong> Escala Likert (1-5) NO es continua: la distancia entre &quot;De acuerdo&quot; y &quot;Muy de acuerdo&quot; no es igual a entre &quot;Neutro&quot; y &quot;De acuerdo&quot;. Usa Mann-Whitney, Kruskal-Wallis o modelos de regresión ordinal.</li>
              <li><strong>❌ Olvidar el tamaño del efecto con muestras grandes:</strong> Con n = 50.000, una diferencia de 0,001 mm puede ser p &lt; 0,001 pero completamente irrelevante. Cohen&apos;s d &lt; 0,2 es &quot;pequeño&quot; independientemente del p-valor. Siempre pregunta: ¿esta diferencia importa en la práctica?</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estadistica-avanzada')} />
      <ShareCard appName="estadistica-avanzada" />
      <Footer appName="estadistica-avanzada" />
    </div>
  );
}
