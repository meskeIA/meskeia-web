'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraEstadisticaMedica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora es una herramienta <strong>educativa</strong> para estudiantes de medicina,
          enfermería y epidemiología. Los resultados NO deben usarse para tomar decisiones clínicas
          reales. Consulta siempre con profesionales sanitarios cualificados.
        </p>
      </div>

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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-estadistica-medica')} />
      <Footer appName="calculadora-estadistica-medica" />
    </div>
  );
}
