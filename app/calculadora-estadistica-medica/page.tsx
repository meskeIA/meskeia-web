'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraEstadisticaMedica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

type CalculatorMode = 'diagnostico' | 'epidemiologia' | 'nnt';

interface DiagnosticResults {
  sensibilidad: number;
  especificidad: number;
  vpp: number;
  vpn: number;
  lrPositivo: number;
  lrNegativo: number;
  prevalencia: number;
  exactitud: number;
}

interface EpidemiologiaResults {
  oddsRatio: number;
  riesgoRelativo: number;
  riesgoExpuestos: number;
  riesgoNoExpuestos: number;
  reduccionRiesgoAbsoluto: number;
  reduccionRiesgoRelativo: number;
  nnt: number;
  icOddsRatio: { lower: number; upper: number };
  icRiesgoRelativo: { lower: number; upper: number };
}

interface NNTResults {
  nnt: number;
  cer: number;
  eer: number;
  arr: number;
  rrr: number;
}

export default function CalculadoraEstadisticaMedicaPage() {
  const [mode, setMode] = useState<CalculatorMode>('diagnostico');

  // Tabla 2x2 para pruebas diagnósticas
  // Filas: Prueba+ / Prueba-
  // Columnas: Enfermo / Sano
  const [vp, setVp] = useState(''); // Verdaderos Positivos
  const [fp, setFp] = useState(''); // Falsos Positivos
  const [fn, setFn] = useState(''); // Falsos Negativos
  const [vn, setVn] = useState(''); // Verdaderos Negativos

  // Tabla 2x2 para epidemiología
  // Filas: Expuesto / No expuesto
  // Columnas: Caso / Control (o Enfermo / Sano)
  const [a, setA] = useState(''); // Expuestos con enfermedad
  const [b, setB] = useState(''); // Expuestos sin enfermedad
  const [c, setC] = useState(''); // No expuestos con enfermedad
  const [d, setD] = useState(''); // No expuestos sin enfermedad

  // NNT directo
  const [cerInput, setCerInput] = useState(''); // Control Event Rate (%)
  const [eerInput, setEerInput] = useState(''); // Experimental Event Rate (%)

  // Calcular resultados diagnósticos
  const diagnosticResults = useMemo((): DiagnosticResults | null => {
    const vpNum = parseFloat(vp) || 0;
    const fpNum = parseFloat(fp) || 0;
    const fnNum = parseFloat(fn) || 0;
    const vnNum = parseFloat(vn) || 0;

    const total = vpNum + fpNum + fnNum + vnNum;
    if (total === 0) return null;

    const enfermos = vpNum + fnNum;
    const sanos = fpNum + vnNum;
    const pruebaPositiva = vpNum + fpNum;
    const pruebaNegativa = fnNum + vnNum;

    if (enfermos === 0 || sanos === 0) return null;

    const sensibilidad = vpNum / enfermos;
    const especificidad = vnNum / sanos;
    const vppCalc = pruebaPositiva > 0 ? vpNum / pruebaPositiva : 0;
    const vpnCalc = pruebaNegativa > 0 ? vnNum / pruebaNegativa : 0;
    const prevalencia = enfermos / total;
    const exactitud = (vpNum + vnNum) / total;

    // Razones de verosimilitud
    const lrPositivo = especificidad > 0 ? sensibilidad / (1 - especificidad) : Infinity;
    const lrNegativo = sensibilidad > 0 ? (1 - sensibilidad) / especificidad : Infinity;

    return {
      sensibilidad: sensibilidad * 100,
      especificidad: especificidad * 100,
      vpp: vppCalc * 100,
      vpn: vpnCalc * 100,
      lrPositivo,
      lrNegativo,
      prevalencia: prevalencia * 100,
      exactitud: exactitud * 100,
    };
  }, [vp, fp, fn, vn]);

  // Calcular resultados epidemiológicos
  const epidemiologiaResults = useMemo((): EpidemiologiaResults | null => {
    const aNum = parseFloat(a) || 0;
    const bNum = parseFloat(b) || 0;
    const cNum = parseFloat(c) || 0;
    const dNum = parseFloat(d) || 0;

    if (aNum + bNum === 0 || cNum + dNum === 0) return null;
    if (bNum === 0 || cNum === 0) return null; // Evitar división por 0

    // Odds Ratio
    const oddsRatio = (aNum * dNum) / (bNum * cNum);

    // Riesgo Relativo (solo válido en estudios de cohortes)
    const riesgoExpuestos = aNum / (aNum + bNum);
    const riesgoNoExpuestos = cNum / (cNum + dNum);
    const riesgoRelativo = riesgoNoExpuestos > 0 ? riesgoExpuestos / riesgoNoExpuestos : Infinity;

    // Reducción de riesgo
    const arr = riesgoNoExpuestos - riesgoExpuestos; // ARR (puede ser negativo si exposición aumenta riesgo)
    const rrr = riesgoNoExpuestos > 0 ? arr / riesgoNoExpuestos : 0;
    const nnt = arr !== 0 ? Math.abs(1 / arr) : Infinity;

    // Intervalos de confianza 95% (método de Woolf para OR)
    const lnOR = Math.log(oddsRatio);
    const seOR = Math.sqrt(1/aNum + 1/bNum + 1/cNum + 1/dNum);
    const icOddsRatio = {
      lower: Math.exp(lnOR - 1.96 * seOR),
      upper: Math.exp(lnOR + 1.96 * seOR),
    };

    // IC para RR (método log)
    const lnRR = Math.log(riesgoRelativo);
    const seRR = Math.sqrt((1/aNum) - (1/(aNum+bNum)) + (1/cNum) - (1/(cNum+dNum)));
    const icRiesgoRelativo = {
      lower: Math.exp(lnRR - 1.96 * seRR),
      upper: Math.exp(lnRR + 1.96 * seRR),
    };

    return {
      oddsRatio,
      riesgoRelativo,
      riesgoExpuestos: riesgoExpuestos * 100,
      riesgoNoExpuestos: riesgoNoExpuestos * 100,
      reduccionRiesgoAbsoluto: arr * 100,
      reduccionRiesgoRelativo: rrr * 100,
      nnt,
      icOddsRatio,
      icRiesgoRelativo,
    };
  }, [a, b, c, d]);

  // Calcular NNT directo
  const nntResults = useMemo((): NNTResults | null => {
    const cer = parseFloat(cerInput) / 100;
    const eer = parseFloat(eerInput) / 100;

    if (isNaN(cer) || isNaN(eer)) return null;
    if (cer < 0 || cer > 1 || eer < 0 || eer > 1) return null;

    const arr = cer - eer;
    const rrr = cer > 0 ? arr / cer : 0;
    const nnt = arr !== 0 ? Math.abs(1 / arr) : Infinity;

    return {
      nnt,
      cer: cer * 100,
      eer: eer * 100,
      arr: arr * 100,
      rrr: rrr * 100,
    };
  }, [cerInput, eerInput]);

  const clearAll = () => {
    setVp(''); setFp(''); setFn(''); setVn('');
    setA(''); setB(''); setC(''); setD('');
    setCerInput(''); setEerInput('');
  };

  const loadExample = () => {
    if (mode === 'diagnostico') {
      // Ejemplo: Prueba diagnóstica para detectar enfermedad
      setVp('90'); setFp('15');
      setFn('10'); setVn('185');
    } else if (mode === 'epidemiologia') {
      // Ejemplo: Estudio caso-control de factor de riesgo
      setA('50'); setB('30');
      setC('20'); setD('100');
    } else {
      // Ejemplo: Ensayo clínico
      setCerInput('20'); setEerInput('12');
    }
  };

  const interpretLR = (lr: number, positive: boolean): string => {
    if (positive) {
      if (lr > 10) return 'Cambio grande (prueba muy útil para confirmar)';
      if (lr > 5) return 'Cambio moderado';
      if (lr > 2) return 'Cambio pequeño';
      return 'Cambio insignificante';
    } else {
      if (lr < 0.1) return 'Cambio grande (prueba muy útil para descartar)';
      if (lr < 0.2) return 'Cambio moderado';
      if (lr < 0.5) return 'Cambio pequeño';
      return 'Cambio insignificante';
    }
  };

  const interpretOR = (or: number): string => {
    if (or > 4) return 'Asociación fuerte';
    if (or > 2) return 'Asociación moderada';
    if (or > 1.5) return 'Asociación débil';
    if (or >= 0.67) return 'Sin asociación significativa';
    if (or >= 0.5) return 'Efecto protector débil';
    if (or >= 0.25) return 'Efecto protector moderado';
    return 'Efecto protector fuerte';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Estadística Médica</h1>
        <p className={styles.subtitle}>
          Sensibilidad, especificidad, valores predictivos, odds ratio, riesgo relativo y NNT
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Selector de modo */}
      <div className={styles.modeSelector}>
        <button
          className={`${styles.modeBtn} ${mode === 'diagnostico' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('diagnostico')}
        >
          <span className={styles.modeIcon}>🔬</span>
          <span className={styles.modeName}>Pruebas Diagnósticas</span>
          <span className={styles.modeDesc}>Sensibilidad, Especificidad, VPP, VPN</span>
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'epidemiologia' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('epidemiologia')}
        >
          <span className={styles.modeIcon}>📊</span>
          <span className={styles.modeName}>Epidemiología</span>
          <span className={styles.modeDesc}>Odds Ratio, Riesgo Relativo</span>
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'nnt' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('nnt')}
        >
          <span className={styles.modeIcon}>💊</span>
          <span className={styles.modeName}>NNT Directo</span>
          <span className={styles.modeDesc}>Número Necesario a Tratar</span>
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <h2>
              {mode === 'diagnostico' && 'Tabla 2x2 - Prueba Diagnóstica'}
              {mode === 'epidemiologia' && 'Tabla 2x2 - Estudio Epidemiológico'}
              {mode === 'nnt' && 'Tasas de Eventos'}
            </h2>
            <div className={styles.panelActions}>
              <button onClick={loadExample} className={styles.exampleBtn}>
                Cargar ejemplo
              </button>
              <button onClick={clearAll} className={styles.clearBtn}>
                Limpiar
              </button>
            </div>
          </div>

          {mode === 'diagnostico' && (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.table2x2}>
                  <thead>
                    <tr>
                      <th></th>
                      <th className={styles.colHeader}>
                        <span className={styles.colIcon}>✓</span> Enfermo
                      </th>
                      <th className={styles.colHeader}>
                        <span className={styles.colIcon}>✗</span> Sano
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className={styles.rowHeader}>
                        <span className={styles.rowIcon}>+</span> Prueba +
                      </th>
                      <td>
                        <input
                          type="number"
                          value={vp}
                          onChange={(e) => setVp(e.target.value)}
                          placeholder="VP"
                          className={styles.cellInput}
                          min="0"
                        />
                        <span className={styles.cellLabel}>Verdaderos +</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={fp}
                          onChange={(e) => setFp(e.target.value)}
                          placeholder="FP"
                          className={styles.cellInput}
                          min="0"
                        />
                        <span className={styles.cellLabel}>Falsos +</span>
                      </td>
                    </tr>
                    <tr>
                      <th className={styles.rowHeader}>
                        <span className={styles.rowIcon}>-</span> Prueba -
                      </th>
                      <td>
                        <input
                          type="number"
                          value={fn}
                          onChange={(e) => setFn(e.target.value)}
                          placeholder="FN"
                          className={styles.cellInput}
                          min="0"
                        />
                        <span className={styles.cellLabel}>Falsos -</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={vn}
                          onChange={(e) => setVn(e.target.value)}
                          placeholder="VN"
                          className={styles.cellInput}
                          min="0"
                        />
                        <span className={styles.cellLabel}>Verdaderos -</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={styles.tableHint}>
                VP = positivos correctos | FP = falsos positivos | FN = falsos negativos | VN = negativos correctos
              </p>
            </>
          )}

          {mode === 'epidemiologia' && (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.table2x2}>
                  <thead>
                    <tr>
                      <th></th>
                      <th className={styles.colHeader}>
                        <span className={styles.colIcon}>⚠️</span> Caso
                      </th>
                      <th className={styles.colHeader}>
                        <span className={styles.colIcon}>✓</span> Control
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className={styles.rowHeader}>
                        <span className={styles.rowIcon}>E+</span> Expuesto
                      </th>
                      <td>
                        <input
                          type="number"
                          value={a}
                          onChange={(e) => setA(e.target.value)}
                          placeholder="a"
                          className={styles.cellInput}
                          min="0"
                        />
                        <span className={styles.cellLabel}>a</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={b}
                          onChange={(e) => setB(e.target.value)}
                          placeholder="b"
                          className={styles.cellInput}
                          min="0"
                        />
                        <span className={styles.cellLabel}>b</span>
                      </td>
                    </tr>
                    <tr>
                      <th className={styles.rowHeader}>
                        <span className={styles.rowIcon}>E-</span> No expuesto
                      </th>
                      <td>
                        <input
                          type="number"
                          value={c}
                          onChange={(e) => setC(e.target.value)}
                          placeholder="c"
                          className={styles.cellInput}
                          min="0"
                        />
                        <span className={styles.cellLabel}>c</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={d}
                          onChange={(e) => setD(e.target.value)}
                          placeholder="d"
                          className={styles.cellInput}
                          min="0"
                        />
                        <span className={styles.cellLabel}>d</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={styles.tableHint}>
                Caso-control: Casos (enfermos) vs Controles (sanos) | Cohortes: Expuestos vs No expuestos
              </p>
            </>
          )}

          {mode === 'nnt' && (
            <div className={styles.nntInputs}>
              <div className={styles.inputGroup}>
                <label>Tasa de eventos en grupo control (CER)</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    value={cerInput}
                    onChange={(e) => setCerInput(e.target.value)}
                    placeholder="20"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className={styles.unit}>%</span>
                </div>
                <span className={styles.inputHint}>Control Event Rate - Proporción de eventos sin tratamiento</span>
              </div>
              <div className={styles.inputGroup}>
                <label>Tasa de eventos en grupo experimental (EER)</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    value={eerInput}
                    onChange={(e) => setEerInput(e.target.value)}
                    placeholder="12"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className={styles.unit}>%</span>
                </div>
                <span className={styles.inputHint}>Experimental Event Rate - Proporción de eventos con tratamiento</span>
              </div>
            </div>
          )}
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2>Resultados</h2>

          {mode === 'diagnostico' && diagnosticResults && (
            <div className={styles.resultsGrid}>
              <div className={`${styles.resultCard} ${styles.highlight}`}>
                <div className={styles.resultIcon}>🎯</div>
                <div className={styles.resultValue}>{formatNumber(diagnosticResults.sensibilidad, 1)}%</div>
                <div className={styles.resultLabel}>Sensibilidad</div>
                <div className={styles.resultDesc}>Detecta enfermos correctamente</div>
              </div>
              <div className={`${styles.resultCard} ${styles.highlight}`}>
                <div className={styles.resultIcon}>🛡️</div>
                <div className={styles.resultValue}>{formatNumber(diagnosticResults.especificidad, 1)}%</div>
                <div className={styles.resultLabel}>Especificidad</div>
                <div className={styles.resultDesc}>Identifica sanos correctamente</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>✅</div>
                <div className={styles.resultValue}>{formatNumber(diagnosticResults.vpp, 1)}%</div>
                <div className={styles.resultLabel}>VPP</div>
                <div className={styles.resultDesc}>Valor Predictivo Positivo</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>❌</div>
                <div className={styles.resultValue}>{formatNumber(diagnosticResults.vpn, 1)}%</div>
                <div className={styles.resultLabel}>VPN</div>
                <div className={styles.resultDesc}>Valor Predictivo Negativo</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>📈</div>
                <div className={styles.resultValue}>{formatNumber(diagnosticResults.lrPositivo, 2)}</div>
                <div className={styles.resultLabel}>LR+</div>
                <div className={styles.resultDesc}>{interpretLR(diagnosticResults.lrPositivo, true)}</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>📉</div>
                <div className={styles.resultValue}>{formatNumber(diagnosticResults.lrNegativo, 2)}</div>
                <div className={styles.resultLabel}>LR-</div>
                <div className={styles.resultDesc}>{interpretLR(diagnosticResults.lrNegativo, false)}</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>📊</div>
                <div className={styles.resultValue}>{formatNumber(diagnosticResults.prevalencia, 1)}%</div>
                <div className={styles.resultLabel}>Prevalencia</div>
                <div className={styles.resultDesc}>Proporción de enfermos</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>🎯</div>
                <div className={styles.resultValue}>{formatNumber(diagnosticResults.exactitud, 1)}%</div>
                <div className={styles.resultLabel}>Exactitud</div>
                <div className={styles.resultDesc}>Aciertos totales</div>
              </div>
            </div>
          )}

          {mode === 'epidemiologia' && epidemiologiaResults && (
            <div className={styles.resultsGrid}>
              <div className={`${styles.resultCard} ${styles.highlight}`}>
                <div className={styles.resultIcon}>⚖️</div>
                <div className={styles.resultValue}>{formatNumber(epidemiologiaResults.oddsRatio, 2)}</div>
                <div className={styles.resultLabel}>Odds Ratio</div>
                <div className={styles.resultDesc}>{interpretOR(epidemiologiaResults.oddsRatio)}</div>
                <div className={styles.resultIC}>
                  IC 95%: {formatNumber(epidemiologiaResults.icOddsRatio.lower, 2)} - {formatNumber(epidemiologiaResults.icOddsRatio.upper, 2)}
                </div>
              </div>
              <div className={`${styles.resultCard} ${styles.highlight}`}>
                <div className={styles.resultIcon}>📊</div>
                <div className={styles.resultValue}>{formatNumber(epidemiologiaResults.riesgoRelativo, 2)}</div>
                <div className={styles.resultLabel}>Riesgo Relativo</div>
                <div className={styles.resultDesc}>Solo válido en cohortes</div>
                <div className={styles.resultIC}>
                  IC 95%: {formatNumber(epidemiologiaResults.icRiesgoRelativo.lower, 2)} - {formatNumber(epidemiologiaResults.icRiesgoRelativo.upper, 2)}
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>⚠️</div>
                <div className={styles.resultValue}>{formatNumber(epidemiologiaResults.riesgoExpuestos, 1)}%</div>
                <div className={styles.resultLabel}>Riesgo Expuestos</div>
                <div className={styles.resultDesc}>Incidencia en expuestos</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>✓</div>
                <div className={styles.resultValue}>{formatNumber(epidemiologiaResults.riesgoNoExpuestos, 1)}%</div>
                <div className={styles.resultLabel}>Riesgo No Expuestos</div>
                <div className={styles.resultDesc}>Incidencia en no expuestos</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>📉</div>
                <div className={styles.resultValue}>{formatNumber(Math.abs(epidemiologiaResults.reduccionRiesgoAbsoluto), 1)}%</div>
                <div className={styles.resultLabel}>{epidemiologiaResults.reduccionRiesgoAbsoluto >= 0 ? 'ARR' : 'ARI'}</div>
                <div className={styles.resultDesc}>
                  {epidemiologiaResults.reduccionRiesgoAbsoluto >= 0 ? 'Reducción Riesgo Absoluto' : 'Aumento Riesgo Absoluto'}
                </div>
              </div>
              <div className={`${styles.resultCard} ${styles.success}`}>
                <div className={styles.resultIcon}>💊</div>
                <div className={styles.resultValue}>
                  {epidemiologiaResults.nnt === Infinity ? '∞' : formatNumber(epidemiologiaResults.nnt, 1)}
                </div>
                <div className={styles.resultLabel}>{epidemiologiaResults.reduccionRiesgoAbsoluto >= 0 ? 'NNT' : 'NNH'}</div>
                <div className={styles.resultDesc}>
                  {epidemiologiaResults.reduccionRiesgoAbsoluto >= 0
                    ? 'Número Necesario a Tratar'
                    : 'Número Necesario para Dañar'}
                </div>
              </div>
            </div>
          )}

          {mode === 'nnt' && nntResults && (
            <div className={styles.resultsGrid}>
              <div className={`${styles.resultCard} ${styles.highlight} ${styles.fullWidth}`}>
                <div className={styles.resultIcon}>💊</div>
                <div className={styles.resultValue}>
                  {nntResults.nnt === Infinity ? '∞' : formatNumber(nntResults.nnt, 1)}
                </div>
                <div className={styles.resultLabel}>{nntResults.arr >= 0 ? 'NNT' : 'NNH'}</div>
                <div className={styles.resultDesc}>
                  {nntResults.arr >= 0
                    ? `Hay que tratar a ${Math.ceil(nntResults.nnt)} pacientes para prevenir 1 evento`
                    : `Por cada ${Math.ceil(nntResults.nnt)} pacientes tratados, 1 sufrirá un evento adverso`}
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>📊</div>
                <div className={styles.resultValue}>{formatNumber(nntResults.cer, 1)}%</div>
                <div className={styles.resultLabel}>CER</div>
                <div className={styles.resultDesc}>Tasa grupo control</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>💉</div>
                <div className={styles.resultValue}>{formatNumber(nntResults.eer, 1)}%</div>
                <div className={styles.resultLabel}>EER</div>
                <div className={styles.resultDesc}>Tasa grupo experimental</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>📉</div>
                <div className={styles.resultValue}>{formatNumber(Math.abs(nntResults.arr), 1)}%</div>
                <div className={styles.resultLabel}>{nntResults.arr >= 0 ? 'ARR' : 'ARI'}</div>
                <div className={styles.resultDesc}>
                  {nntResults.arr >= 0 ? 'Reducción Absoluta' : 'Aumento Absoluto'}
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon}>📈</div>
                <div className={styles.resultValue}>{formatNumber(Math.abs(nntResults.rrr), 1)}%</div>
                <div className={styles.resultLabel}>{nntResults.rrr >= 0 ? 'RRR' : 'RRI'}</div>
                <div className={styles.resultDesc}>
                  {nntResults.rrr >= 0 ? 'Reducción Relativa' : 'Aumento Relativo'}
                </div>
              </div>
            </div>
          )}

          {((mode === 'diagnostico' && !diagnosticResults) ||
            (mode === 'epidemiologia' && !epidemiologiaResults) ||
            (mode === 'nnt' && !nntResults)) && (
            <div className={styles.noResults}>
              <span className={styles.noResultsIcon}>📊</span>
              <p>Introduce los datos para ver los resultados</p>
            </div>
          )}
        </div>
      </div>


      <DisclaimerCard variant="medical" severity="high" collapsible={false} context="calculadora-estadistica-medica">
        <p>Esta calculadora es <strong>exclusivamente educativa</strong> para estudiantes de ciencias de la salud. <strong>Limitaciones críticas:</strong></p>
        <ul className={styles.disclaimerList}>
          <li><strong>NO usar para decisiones clínicas reales</strong>: Los cálculos requieren validación con datos clínicos completos y contexto del paciente</li>
          <li><strong>Simplificaciones matemáticas</strong>: Los estudios epidemiológicos reales consideran variables confusoras, sesgos y intervalos de confianza complejos</li>
          <li><strong>Interpretación requiere formación</strong>: Sensibilidad, especificidad, VPP y VPN dependen de la prevalencia de la enfermedad en la población estudiada</li>
        </ul>
        <p className={styles.highlight}><strong>⚕️ Solo para fines educativos y académicos.</strong> Las decisiones diagnósticas y terapéuticas deben tomarlas médicos con acceso a la historia clínica completa del paciente.</p>
        <p>meskeIA no asume ninguna responsabilidad por decisiones tomadas en base a los resultados de esta herramienta, ni por un uso inadecuado de la misma.</p>
      </DisclaimerCard>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre estadística médica?"
        subtitle="Conceptos clave, fórmulas y ejemplos prácticos"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Fundamentales</h2>
          <p className={styles.introParagraph}>
            La estadística médica es esencial para interpretar pruebas diagnósticas y estudios
            epidemiológicos. Estas métricas ayudan a evaluar la utilidad clínica de tests y tratamientos.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Sensibilidad (Sens)</h4>
              <p>
                Proporción de enfermos correctamente identificados por la prueba.
                <br /><strong>Fórmula:</strong> VP / (VP + FN)
                <br /><strong>Uso:</strong> Alta sensibilidad es crucial para pruebas de cribado.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Especificidad (Esp)</h4>
              <p>
                Proporción de sanos correctamente identificados.
                <br /><strong>Fórmula:</strong> VN / (VN + FP)
                <br /><strong>Uso:</strong> Alta especificidad evita falsos positivos.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Valor Predictivo Positivo (VPP)</h4>
              <p>
                Probabilidad de estar enfermo si la prueba es positiva.
                <br /><strong>Fórmula:</strong> VP / (VP + FP)
                <br /><strong>Nota:</strong> Depende de la prevalencia.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Valor Predictivo Negativo (VPN)</h4>
              <p>
                Probabilidad de estar sano si la prueba es negativa.
                <br /><strong>Fórmula:</strong> VN / (VN + FN)
                <br /><strong>Nota:</strong> También depende de la prevalencia.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Odds Ratio (OR)</h4>
              <p>
                Razón de odds entre expuestos y no expuestos.
                <br /><strong>Fórmula:</strong> (a × d) / (b × c)
                <br /><strong>Uso:</strong> Estudios caso-control y transversales.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>NNT (Número Necesario a Tratar)</h4>
              <p>
                Pacientes a tratar para prevenir un evento.
                <br /><strong>Fórmula:</strong> 1 / ARR
                <br /><strong>Ideal:</strong> Cuanto menor, más efectivo el tratamiento.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Razones de Verosimilitud (Likelihood Ratios)</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>LR+ (Cociente de probabilidad positivo)</h4>
              <p>
                Cuánto aumenta la probabilidad de enfermedad si la prueba es positiva.
                <br /><strong>Fórmula:</strong> Sensibilidad / (1 - Especificidad)
                <br /><strong>Interpretación:</strong> LR+ &gt; 10 = cambio grande
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>LR- (Cociente de probabilidad negativo)</h4>
              <p>
                Cuánto disminuye la probabilidad de enfermedad si la prueba es negativa.
                <br /><strong>Fórmula:</strong> (1 - Sensibilidad) / Especificidad
                <br /><strong>Interpretación:</strong> LR- &lt; 0.1 = cambio grande
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 1: Tabla Comparativa de Métricas */}
        <section className={styles.guideSection}>
          <h2>Tabla Comparativa de Métricas Diagnósticas y de Asociación</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Definición</th>
                  <th>Fórmula</th>
                  <th>Rango</th>
                  <th>Cuándo usar</th>
                  <th>Ejemplo real</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Sensibilidad</strong></td>
                  <td>Proporción de enfermos que el test detecta correctamente</td>
                  <td>VP / (VP + FN)</td>
                  <td>0 – 100%</td>
                  <td>Cribado poblacional, descartar enfermedad</td>
                  <td>PCR COVID: 95% sens → de 100 enfermos detecta 95</td>
                </tr>
                <tr>
                  <td><strong>Especificidad</strong></td>
                  <td>Proporción de sanos que el test identifica correctamente</td>
                  <td>VN / (VN + FP)</td>
                  <td>0 – 100%</td>
                  <td>Confirmación diagnóstica, evitar tratamientos innecesarios</td>
                  <td>Mamografía: 90% esp → de 100 sanas solo 10 dan falso positivo</td>
                </tr>
                <tr>
                  <td><strong>VPP</strong></td>
                  <td>Probabilidad de estar enfermo si el test es positivo</td>
                  <td>VP / (VP + FP)</td>
                  <td>0 – 100%</td>
                  <td>Interpretar un resultado positivo en la práctica clínica</td>
                  <td>Prevalencia 1%: VPP = 16% aunque sensibilidad sea 95%</td>
                </tr>
                <tr>
                  <td><strong>VPN</strong></td>
                  <td>Probabilidad de estar sano si el test es negativo</td>
                  <td>VN / (VN + FN)</td>
                  <td>0 – 100%</td>
                  <td>Descartar enfermedad en urgencias o cribados</td>
                  <td>D-dímero negativo: VPN &gt;99% para TEP en probabilidad baja</td>
                </tr>
                <tr>
                  <td><strong>Odds Ratio (OR)</strong></td>
                  <td>Razón de la odds de enfermedad entre expuestos y no expuestos</td>
                  <td>(a × d) / (b × c)</td>
                  <td>0 – ∞ (1 = sin asociación)</td>
                  <td>Estudios caso-control; eventos raros</td>
                  <td>OR = 3,2 → fumadores tienen 3,2 veces más odds de cáncer de pulmón</td>
                </tr>
                <tr>
                  <td><strong>Riesgo Relativo (RR)</strong></td>
                  <td>Razón del riesgo entre expuestos y no expuestos</td>
                  <td>Riesgo expuestos / Riesgo no expuestos</td>
                  <td>0 – ∞ (1 = sin asociación)</td>
                  <td>Estudios de cohorte; comunicar riesgo a pacientes</td>
                  <td>RR = 2,5 → el grupo tratado tiene 2,5× el riesgo de recaída</td>
                </tr>
                <tr>
                  <td><strong>NNT</strong></td>
                  <td>Pacientes a tratar para prevenir un evento adverso adicional</td>
                  <td>1 / ARR</td>
                  <td>1 – ∞ (menor = mejor)</td>
                  <td>Comparar eficacia clínica, comunicar beneficio a pacientes</td>
                  <td>NNT = 25 → hay que dar estatinas a 25 pacientes para evitar 1 infarto en 5 años</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso por Perfil */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso por Perfil Profesional</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🩺</span>
                <h3>Médico Clínico</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Evaluar si un test de antígenos puede sustituir a la PCR para el diagnóstico de COVID-19 en urgencias.
              </p>
              <p>
                Construye la tabla 2×2 con los datos del laboratorio: PCR como gold standard, antígenos como test a evaluar.
                Con VP=180, FP=12, FN=20, VN=288: Sensibilidad 90%, Especificidad 96%, VPP 93,8%.
                Con prevalencia de urgencias del 30%, el VPP real es suficiente para iniciar aislamiento sin esperar PCR.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> El médico usa sensibilidad para decidir si puede descartar con un negativo, y el VPP (con la prevalencia local) para saber cuánto confiar en un positivo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📊</span>
                <h3>Epidemiólogo</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Medir la asociación entre tabaco y cáncer de pulmón en una cohorte de 5.000 personas seguidas 10 años.
              </p>
              <p>
                Tabla: fumadores con cáncer (a=120), fumadores sin cáncer (b=1.380), no fumadores con cáncer (c=30), no fumadores sin cáncer (d=3.470).
                OR = (120×3470)/(1380×30) = 10,05. RR = (120/1500)/(30/3500) = 9,33.
                IC 95% OR: [6,2 – 16,3] no cruza 1 → asociación estadísticamente significativa.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> En cohortes preferir el RR (más intuitivo). El OR se usa cuando el evento es raro (&lt;10% en expuestos) o en caso-control donde el RR no es calculable.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💊</span>
                <h3>Farmacólogo</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Decidir si incluir en la guía terapéutica un nuevo anticoagulante cuya eficacia se publicó como "reducción del riesgo relativo del 22%".
              </p>
              <p>
                El ensayo: CER (control) = 5% eventos/año, EER (tratamiento) = 3,9% eventos/año.
                ARR = 5% – 3,9% = 1,1%. NNT = 1/0,011 = 91 pacientes/año para evitar 1 evento.
                La reducción relativa del 22% suena impresionante, pero el NNT de 91 con un fármaco de alto coste cuestiona su inclusión como primera línea.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Exigir siempre el NNT y el ARR además del RRR. Un RRR alto con ARR bajo indica que el beneficio absoluto es pequeño.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏥</span>
                <h3>Gestor Sanitario</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Comparar dos programas de cribado de cáncer colorrectal: test de sangre oculta en heces (TSOH) vs. colonoscopia cada 10 años.
              </p>
              <p>
                TSOH: coste €15/persona, sensibilidad 74%, especificidad 96%. Colonoscopia: coste €600, sensibilidad 95%, especificidad 99%.
                En una población de 100.000 personas con prevalencia 0,5%: TSOH detecta 370 de 500 casos con 3.998 falsos positivos; colonoscopia detecta 475 con 998 falsos positivos.
                Cada caso adicional detectado con colonoscopia cuesta €280.000 más. La decisión depende de cuánto vale un falso positivo evitado.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> El gestor pondera sensibilidad, especificidad, coste por caso detectado y coste de los falsos positivos (biopsias, ansiedad, complicaciones).
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cuándo usar OR en lugar de RR?</dt>
              <dd>
                Usa el OR en estudios <strong>caso-control</strong> (donde no puedes calcular incidencia real) y cuando el evento es <strong>raro (&lt;10%)</strong> en ambos grupos.
                Usa el RR en estudios de <strong>cohorte</strong> prospectivos donde conoces el tiempo de seguimiento y la incidencia acumulada.
                Cuando el evento es frecuente (&gt;10%), el OR sobreestima el RR, a veces duplicando el efecto aparente.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué sensibilidad mínima exige un test de cribado?</dt>
              <dd>
                Depende de las consecuencias de un falso negativo. Para enfermedades graves y tratables (cáncer de mama, VIH en embarazadas, PKU neonatal)
                se exige sensibilidad &ge;95-99%. Un test de cribado de tuberculosis con sensibilidad del 85% dejaría sin diagnosticar al 15% de enfermos,
                que seguirían contagiando. En la práctica, se acepta una sensibilidad menor si el coste del seguimiento es muy alto o la prevalencia es bajísima.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Por qué el VPP depende de la prevalencia?</dt>
              <dd>
                El VPP se ve arrastrado por la proporción de enfermos reales en la población que pruebas.
                Ejemplo concreto: test con sensibilidad 99% y especificidad 99%.
                En una población con prevalencia 1% (10 enfermos en 1.000): VP=9,9, FP=9,9 → VPP = 50%. Solo la mitad de los positivos son enfermos reales.
                En una población con prevalencia 50% (500 enfermos en 1.000): VP=495, FP=5 → VPP = 99%. Por eso el mismo test funciona muy distinto en urgencias vs. cribado poblacional.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué es la curva ROC y para qué sirve?</dt>
              <dd>
                La curva ROC (Receiver Operating Characteristic) representa gráficamente todos los pares (sensibilidad, 1-especificidad) posibles
                al variar el punto de corte de una prueba cuantitativa (ej. nivel de troponina para infarto).
                El área bajo la curva (AUC) resume la capacidad discriminativa: AUC=0,5 equivale a un test sin valor (azar puro),
                AUC&ge;0,9 es excelente. Se usa para elegir el punto de corte óptimo según si se prioriza sensibilidad (descartar) o especificidad (confirmar).
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo interpreto un NNT de 50?</dt>
              <dd>
                NNT=50 significa que hay que tratar a 50 pacientes durante el tiempo del ensayo (ej. 5 años) para prevenir 1 evento adverso adicional.
                Si el tratamiento es barato, seguro y el evento que previene es grave (ej. infarto mortal), un NNT de 50 puede ser aceptable.
                Si el fármaco cuesta €10.000/año y tiene efectos secundarios frecuentes, un NNT de 50 es probablemente rechazable.
                Compara siempre el NNT con el NNH (número necesario para causar daño) del mismo fármaco.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cuál es la diferencia entre riesgo absoluto y relativo?</dt>
              <dd>
                El <strong>riesgo absoluto</strong> (ARR) es la diferencia real de probabilidades: si el grupo control tiene 8% de infartos y el tratado 4%, el ARR=4%.
                El <strong>riesgo relativo</strong> (RRR) es el porcentaje de reducción: 4%/8% = 50% de reducción relativa.
                El problema: "50% de reducción" suena mucho más impresionante que "4 infartos menos por cada 100 pacientes tratados".
                Ambos son correctos, pero el RRR puede inflar la percepción del beneficio cuando el riesgo basal es bajo.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué significa el intervalo de confianza del OR?</dt>
              <dd>
                El IC 95% del OR indica el rango dentro del cual se encuentra el verdadero OR con un 95% de confianza.
                Reglas de interpretación: si el IC <strong>no incluye el 1</strong> (ej. IC: 1,8 – 4,2), la asociación es estadísticamente significativa.
                Si incluye el 1 (ej. IC: 0,7 – 2,3), no hay evidencia suficiente de asociación.
                Un IC muy amplio (ej. 0,9 – 18,5) indica mucha incertidumbre, generalmente por tamaño muestral pequeño.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cuándo tiene un test buena discriminación?</dt>
              <dd>
                Un test discrimina bien cuando separa claramente enfermos de sanos. Los criterios habituales son:
                AUC &ge; 0,90 = excelente, AUC 0,80-0,89 = bueno, AUC 0,70-0,79 = aceptable, AUC &lt; 0,70 = pobre.
                Complementariamente, un LR+ &ge; 10 (o LR- &le; 0,1) indica un cambio clínicamente relevante en la probabilidad post-test.
                Un test puede tener buena discriminación (AUC alto) pero ser poco útil si el punto de corte óptimo no es aplicable en la práctica clínica real.
              </dd>
            </div>
          </dl>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Cómo Evaluar un Nuevo Test Diagnóstico</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Construir la tabla 2×2</h4>
                <p>
                  Aplica el test a estudio y el gold standard de forma <strong>ciega e independiente</strong> en la misma muestra de pacientes.
                  Clasifica cada paciente en VP, FP, FN o VN. Ejemplo: evalúas test de antígenos frente a PCR en 500 pacientes de urgencias.
                  Resultado: VP=180, FP=12, FN=20, VN=288.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Calcular sensibilidad y especificidad</h4>
                <p>
                  Sensibilidad = 180/(180+20) = <strong>90%</strong>. Especificidad = 288/(288+12) = <strong>96%</strong>.
                  Estas métricas son propiedades intrínsecas del test, no dependen de la prevalencia.
                  La sensibilidad del 90% significa que el test falla en 1 de cada 10 enfermos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Calcular VPP y VPN con la prevalencia de tu población</h4>
                <p>
                  En urgencias la prevalencia es 40%. VPP = (0,90×0,40)/[(0,90×0,40)+(0,04×0,60)] = <strong>93,8%</strong>.
                  VPN = (0,96×0,60)/[(0,96×0,60)+(0,10×0,40)] = <strong>93,5%</strong>.
                  Si aplicas el mismo test en cribado con prevalencia 1%, el VPP cae a 18%: la mayoría de positivos serán falsos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Trazar la curva ROC (si el test es cuantitativo)</h4>
                <p>
                  Si el test da un valor numérico (ej. nivel de troponina en ng/L), varía el punto de corte y calcula cada par (sensibilidad, 1-especificidad).
                  El área bajo la curva (AUC) resume el rendimiento global. AUC=0,95 para troponina de alta sensibilidad en infarto vs. AUC=0,60 para CK-MB total.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h4>Elegir el punto de corte óptimo según el objetivo clínico</h4>
                <p>
                  Para <strong>descartar</strong> enfermedad (cribado): priorizar sensibilidad alta aunque caiga la especificidad (punto de corte bajo).
                  Para <strong>confirmar</strong> enfermedad: priorizar especificidad alta (punto de corte alto).
                  El índice de Youden (Sensibilidad + Especificidad - 1) maximiza la suma; no siempre es el óptimo clínico.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h4>Interpretar en contexto clínico</h4>
                <p>
                  Considera la probabilidad pre-test del paciente concreto (historia clínica, síntomas, factores de riesgo).
                  Un LR+ de 8 eleva una probabilidad pre-test del 20% al 67%. El nomograma de Fagan permite hacer esto visualmente sin calculadora.
                  Un resultado no se interpreta en el vacío: el mismo OR puede ser decisivo en un fármaco barato y irrelevante en uno caro con efectos adversos frecuentes.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <h4>Comunicar resultados de forma comprensible</h4>
                <p>
                  Al paciente: usa frecuencias naturales ("de 100 personas como usted, 4 tendrán un infarto en 5 años sin tratamiento; con la pastilla serán 2").
                  Al comité clínico: presenta sensibilidad, especificidad, VPP, VPN, AUC y sus IC 95%.
                  Nunca presentes solo la reducción relativa del riesgo sin el NNT y el ARR.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas en Estadística Médica</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <h4>Usa la prevalencia de tu población, no la del estudio</h4>
              <p>
                El VPP y VPN del artículo original son válidos <strong>solo para la prevalencia de ese estudio</strong>.
                Si el estudio se hizo en una clínica especializada con prevalencia 40% y tú trabajas en atención primaria con prevalencia 5%,
                recalcula el VPP con tu prevalencia. La fórmula: VPP = (Sens × prev) / (Sens × prev + (1-Esp) × (1-prev)).
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💬</span>
              <h4>Comunica con NNT, no con reducciones relativas</h4>
              <p>
                Las reducciones de riesgo relativo (RRR) inflan la percepción del beneficio cuando el riesgo basal es bajo.
                "Reducción del 50% del riesgo de infarto" puede significar pasar de 2% a 1% (NNT=100) o de 20% a 10% (NNT=10).
                Usa siempre el NNT junto al tiempo de seguimiento del ensayo: "NNT=25 a 5 años".
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <h4>Reporta siempre el IC 95% junto al OR o RR</h4>
              <p>
                Un OR=3,5 sin intervalo de confianza no dice nada sobre la precisión del estimador.
                IC [3,1 – 3,9] indica alta precisión (muestra grande, efecto real). IC [1,1 – 11,2] indica gran incertidumbre.
                Revistas de impacto como NEJM o Lancet exigen reportar IC 95% en todos los estimadores de asociación.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔬</span>
              <h4>Verifica la calidad del gold standard</h4>
              <p>
                Si el gold standard tiene errores de clasificación (imperfect reference standard), la sensibilidad y especificidad del test a estudio
                estarán sesgadas. Ejemplo: la biopsia hepática tiene variabilidad interobservador del 20% en fibrosis → un test comparado contra ella
                puede parecer peor de lo que es. Considera estudios de concordancia del propio gold standard antes de aceptar los resultados.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <h4>Pondera el coste del falso positivo vs. el falso negativo</h4>
              <p>
                No siempre se deben minimizar ambos por igual. En cribado de cáncer de cérvix, un falso negativo (cáncer no detectado) es mucho más grave
                que un falso positivo (colposcopia innecesaria). En cribado de sepsis neonatal, un falso positivo conlleva antibióticos innecesarios con riesgos propios.
                Adapta el punto de corte según qué error es más costoso en tu contexto clínico.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌍</span>
              <h4>No generalices a poblaciones distintas a las del ensayo</h4>
              <p>
                Un test con sensibilidad 95% en adultos jóvenes puede tener sensibilidad 70% en mayores de 80 años con comorbilidades.
                Un NNT calculado en pacientes de riesgo cardiovascular alto no aplica a población de bajo riesgo.
                Antes de implementar, verifica si la población del estudio es comparable a la tuya en edad, prevalencia y estadio de enfermedad.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores que llevan a conclusiones clínicas equivocadas</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Ignorar la prevalencia al calcular VPP:</strong> Un test con 99% de sensibilidad y 99% de especificidad tiene un VPP de solo 50%
              cuando la prevalencia de la enfermedad es 0,1% (1 de cada 1.000 personas). En poblaciones de bajo riesgo, la mayoría de positivos son falsos,
              lo que puede llevar a tratamientos innecesarios con sus riesgos y costes asociados.
            </li>
            <li>
              <strong>Confundir RR con OR cuando el evento es frecuente:</strong> Cuando el evento ocurre en más del 10% de los expuestos,
              el OR sobreestima el RR de forma sustancial. Un OR=4,0 puede corresponder a un RR real de 2,5. Comunicar el OR como si fuera un RR
              en estos casos infla el riesgo aparente y puede llevar a decisiones erróneas sobre intervenciones preventivas.
            </li>
            <li>
              <strong>Interpretar el NNT sin especificar el horizonte temporal:</strong> Un NNT=20 a 1 año es muy diferente de un NNT=20 a 10 años.
              El NNT depende directamente del tiempo de seguimiento del ensayo. Comparar NNTs de ensayos con diferentes duraciones lleva a conclusiones incorrectas sobre eficacia relativa de tratamientos.
            </li>
            <li>
              <strong>Usar el mismo punto de corte en poblaciones diferentes:</strong> Un nivel de troponina de 14 ng/L como umbral para infarto
              fue validado en adultos de 18-75 años. En mayores de 80 años, los niveles basales son más altos por deterioro renal y masa muscular reducida,
              aumentando los falsos positivos. Cada punto de corte debe validarse en la población donde se va a aplicar.
            </li>
            <li>
              <strong>Confundir significación estadística con relevancia clínica:</strong> Con N=50.000 pacientes, una diferencia de presión arterial
              de 1 mmHg entre grupos puede ser estadísticamente significativa (p&lt;0,001) pero carece de relevancia clínica.
              La significación estadística solo indica que el efecto no es cero; no dice nada sobre su magnitud ni su importancia clínica.
              Siempre complementar el valor p con el tamaño del efecto (ARR, OR) y su IC 95%.
            </li>
            <li>
              <strong>Generalizar resultados de un ensayo a poblaciones distintas:</strong> Un ensayo con fumadores de 45-65 años en Europa Occidental
              con alto riesgo cardiovascular no es directamente aplicable a mujeres jóvenes sin factores de riesgo, ni a poblaciones de Asia o África
              con perfiles genéticos y de riesgo basal diferentes. Verificar siempre la validez externa antes de implementar una intervención.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-estadistica-medica')} />
      <ShareCard appName="calculadora-estadistica-medica" />
      <Footer appName="calculadora-estadistica-medica" />
    </div>
  );
}
