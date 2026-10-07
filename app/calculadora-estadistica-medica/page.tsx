'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraEstadisticaMedica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  diagnostico,
  epidemiologia,
  incluyeUno,
  leerRecuento,
  nntDirecto,
  vppBayes,
  type Intervalo,
  type Valor,
} from './motor';

type CalculatorMode = 'diagnostico' | 'epidemiologia' | 'nnt';

/** Espacio duro entre la cifra y el % (Ortografía de la RAE, 2010). */
const NB = ' ';

/** Fracción → «81,8 %»; `null` → «No definido»; Infinity → «∞». */
const pct = (v: Valor, dec = 1): string =>
  v === null ? 'No definido' : Number.isFinite(v) ? `${formatNumber(v * 100, dec)}${NB}%` : '∞';

/** Razón → «2,50»; `null` → «No definido»; Infinity → «∞». */
const razon = (v: Valor, dec = 2): string =>
  v === null ? 'No definido' : Number.isFinite(v) ? formatNumber(v, dec) : '∞';

const ic = (i: Intervalo | null): string =>
  i === null ? `IC 95${NB}%: no calculable con una celda a 0` : `IC 95${NB}%: ${formatNumber(i.inferior, 2)} – ${formatNumber(i.superior, 2)}`;

// Cifras de los ejemplos del bloque educativo, calculadas con el MISMO motor (3033-3036)
const EJ_EPIDEMIOLOGO = epidemiologia(120, 1380, 30, 3470)!;
const EJ_MEDICO = diagnostico(180, 12, 20, 288)!;
const EJ_VPP_PREV30 = vppBayes(0.9, 0.96, 0.3);
const EJ_VPP_PREV01 = vppBayes(0.99, 0.99, 0.001);
// Gestor: 100.000 personas, prevalencia 0,5 % → 500 enfermos y 99.500 sanos
const GESTOR = (() => {
  const enfermos = 500;
  const sanos = 99_500;
  const tsoh = { coste: 15, sens: 0.74, esp: 0.96 };
  const colono = { coste: 600, sens: 0.95, esp: 0.99 };
  const detTsoh = Math.round(enfermos * tsoh.sens);
  const detColono = Math.round(enfermos * colono.sens);
  return {
    detTsoh,
    detColono,
    fpTsoh: Math.round(sanos * (1 - tsoh.esp)),
    fpColono: Math.round(sanos * (1 - colono.esp)),
    costePorCasoAdicional: ((colono.coste - tsoh.coste) * (enfermos + sanos)) / (detColono - detTsoh),
  };
})();

/**
 * Recuentos: enteros y no negativos. Antes `parseFloat(x) || 0` aceptaba −20 y 90,5, y salían
 * sensibilidades del 128 % y razones negativas, interpretadas además (hallazgo 3025).
 */
const leer = (t: string): number | null => leerRecuento(t, parseSpanishNumber);
const invalido = (r: (number | null)[]): boolean => r.some((x) => x !== null && Number.isNaN(x));

export default function CalculadoraEstadisticaMedicaPage() {
  const [mode, setMode] = useState<CalculatorMode>('diagnostico');

  // Tabla 2x2 para pruebas diagnósticas — filas: prueba + / −; columnas: enfermo / sano
  const [vp, setVp] = useState('');
  const [fp, setFp] = useState('');
  const [fn, setFn] = useState('');
  const [vn, setVn] = useState('');

  // Tabla 2x2 de exposición × evento
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [d, setD] = useState('');

  // NNT directo
  const [cerInput, setCerInput] = useState('');
  const [eerInput, setEerInput] = useState('');

  const recuentosDiag = [vp, fp, fn, vn].map(leer);
  const recuentosEpi = [a, b, c, d].map(leer);
  const errorDiag = invalido(recuentosDiag);
  const errorEpi = invalido(recuentosEpi);

  const diagnosticResults = useMemo(() => {
    const r = [vp, fp, fn, vn].map(leer);
    if (invalido(r)) return null;
    const [w, x, y, z] = r.map((v) => v ?? 0);
    return diagnostico(w, x, y, z);
  }, [vp, fp, fn, vn]);

  const epidemiologiaResults = useMemo(() => {
    const r = [a, b, c, d].map(leer);
    if (invalido(r)) return null;
    const [w, x, y, z] = r.map((v) => v ?? 0);
    return epidemiologia(w, x, y, z);
  }, [a, b, c, d]);

  const cerNum = cerInput.trim() === '' ? NaN : parseSpanishNumber(cerInput);
  const eerNum = eerInput.trim() === '' ? NaN : parseSpanishNumber(eerInput);
  const errorNnt =
    (cerInput.trim() !== '' && (isNaN(cerNum) || cerNum < 0 || cerNum > 100)) ||
    (eerInput.trim() !== '' && (isNaN(eerNum) || eerNum < 0 || eerNum > 100));
  const nntResults = useMemo(() => nntDirecto(cerNum / 100, eerNum / 100), [cerNum, eerNum]);

  const clearAll = () => {
    setVp(''); setFp(''); setFn(''); setVn('');
    setA(''); setB(''); setC(''); setD('');
    setCerInput(''); setEerInput('');
  };

  const loadExample = () => {
    if (mode === 'diagnostico') {
      setVp('90'); setFp('15');
      setFn('10'); setVn('185');
    } else if (mode === 'epidemiologia') {
      // Estudio de casos y controles de un factor de riesgo
      setA('50'); setB('30');
      setC('20'); setD('100');
    } else {
      setCerInput('20'); setEerInput('12');
    }
  };

  const interpretLR = (lr: Valor, positive: boolean): string => {
    // Una razón que no se puede calcular no se interpreta (antes NaN salía «Cambio insignificante»)
    if (lr === null) return 'No se puede interpretar: falta un grupo';
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

  /**
   * Magnitud del OR por su valor, y SIGNIFICACIÓN por su IC (hallazgo 3028): antes un OR de 1,42
   * con IC 1,12 – 1,79 salía «Sin asociación significativa», contra la FAQ de la propia página.
   */
  const interpretOR = (or: Valor, intervalo: Intervalo | null): string => {
    if (or === null) return 'No definido';
    const magnitud = !Number.isFinite(or)
      ? 'No finito (una celda es 0)'
      : or > 4
        ? 'Asociación fuerte'
        : or > 2
          ? 'Asociación moderada'
          : or > 1.5
            ? 'Asociación débil'
            : or >= 0.67
              ? 'Cercano a 1'
              : or >= 0.5
                ? 'Efecto protector débil'
                : or >= 0.25
                  ? 'Efecto protector moderado'
                  : 'Efecto protector fuerte';
    const contieneUno = incluyeUno(intervalo);
    if (contieneUno === null) return magnitud;
    return `${magnitud} · ${contieneUno ? 'IC incluye el 1: no significativo' : 'IC no incluye el 1: significativo'}`;
  };

  const epiAumenta = (epidemiologiaResults?.reduccionRiesgoAbsoluto ?? 0) < 0;
  const nntAumenta = (nntResults?.arr ?? 0) < 0;

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
          type="button"
          className={`${styles.modeBtn} ${mode === 'diagnostico' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('diagnostico')}
          aria-pressed={mode === 'diagnostico'}
        >
          <span className={styles.modeIcon} aria-hidden="true">🔬</span>
          <span className={styles.modeName}>Pruebas Diagnósticas</span>
          <span className={styles.modeDesc}>Sensibilidad, Especificidad, VPP, VPN</span>
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'epidemiologia' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('epidemiologia')}
          aria-pressed={mode === 'epidemiologia'}
        >
          <span className={styles.modeIcon} aria-hidden="true">📊</span>
          <span className={styles.modeName}>Epidemiología</span>
          <span className={styles.modeDesc}>Odds Ratio, Riesgo Relativo</span>
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'nnt' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('nnt')}
          aria-pressed={mode === 'nnt'}
        >
          <span className={styles.modeIcon} aria-hidden="true">💊</span>
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
              <button type="button" onClick={loadExample} className={styles.exampleBtn}>
                Cargar ejemplo
              </button>
              <button type="button" onClick={clearAll} className={styles.clearBtn}>
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
                        <span className={styles.colIcon} aria-hidden="true">✓</span> Enfermo
                      </th>
                      <th className={styles.colHeader}>
                        <span className={styles.colIcon} aria-hidden="true">✗</span> Sano
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className={styles.rowHeader}>
                        <span className={styles.rowIcon} aria-hidden="true">+</span> Prueba +
                      </th>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={vp}
                          onChange={(e) => setVp(e.target.value)}
                          placeholder="VP"
                          aria-label="Verdaderos positivos (VP): prueba positiva y enfermo"
                          className={styles.cellInput}
                        />
                        <span className={styles.cellLabel} aria-hidden="true">Verdaderos +</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={fp}
                          onChange={(e) => setFp(e.target.value)}
                          placeholder="FP"
                          aria-label="Falsos positivos (FP): prueba positiva y sano"
                          className={styles.cellInput}
                        />
                        <span className={styles.cellLabel} aria-hidden="true">Falsos +</span>
                      </td>
                    </tr>
                    <tr>
                      <th className={styles.rowHeader}>
                        <span className={styles.rowIcon} aria-hidden="true">-</span> Prueba -
                      </th>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={fn}
                          onChange={(e) => setFn(e.target.value)}
                          placeholder="FN"
                          aria-label="Falsos negativos (FN): prueba negativa y enfermo"
                          className={styles.cellInput}
                        />
                        <span className={styles.cellLabel} aria-hidden="true">Falsos -</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={vn}
                          onChange={(e) => setVn(e.target.value)}
                          placeholder="VN"
                          aria-label="Verdaderos negativos (VN): prueba negativa y sano"
                          className={styles.cellInput}
                        />
                        <span className={styles.cellLabel} aria-hidden="true">Verdaderos -</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={styles.tableHint}>
                VP = positivos correctos | FP = falsos positivos | FN = falsos negativos | VN = negativos correctos
              </p>
              {errorDiag && (
                <p className={styles.errorRecuento} role="alert">
                  Cada casilla es un recuento de personas: un número entero de 0 en adelante.
                </p>
              )}
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
                        <span className={styles.colIcon} aria-hidden="true">⚠️</span> Con evento (caso)
                      </th>
                      <th className={styles.colHeader}>
                        <span className={styles.colIcon} aria-hidden="true">✓</span> Sin evento (control)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className={styles.rowHeader}>
                        <span className={styles.rowIcon} aria-hidden="true">E+</span> Expuesto
                      </th>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={a}
                          onChange={(e) => setA(e.target.value)}
                          placeholder="a"
                          aria-label="a: expuestos con el evento (casos expuestos)"
                          className={styles.cellInput}
                        />
                        <span className={styles.cellLabel} aria-hidden="true">a</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={b}
                          onChange={(e) => setB(e.target.value)}
                          placeholder="b"
                          aria-label="b: expuestos sin el evento (controles expuestos)"
                          className={styles.cellInput}
                        />
                        <span className={styles.cellLabel} aria-hidden="true">b</span>
                      </td>
                    </tr>
                    <tr>
                      <th className={styles.rowHeader}>
                        <span className={styles.rowIcon} aria-hidden="true">E-</span> No expuesto
                      </th>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={c}
                          onChange={(e) => setC(e.target.value)}
                          placeholder="c"
                          aria-label="c: no expuestos con el evento (casos no expuestos)"
                          className={styles.cellInput}
                        />
                        <span className={styles.cellLabel} aria-hidden="true">c</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={d}
                          onChange={(e) => setD(e.target.value)}
                          placeholder="d"
                          aria-label="d: no expuestos sin el evento (controles no expuestos)"
                          className={styles.cellInput}
                        />
                        <span className={styles.cellLabel} aria-hidden="true">d</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={styles.tableHint}>
                Casos y controles: solo el OR es estimable · Cohortes: además el RR, los riesgos, la ARR y el NNT
              </p>
              {errorEpi && (
                <p className={styles.errorRecuento} role="alert">
                  Cada casilla es un recuento de personas: un número entero de 0 en adelante.
                </p>
              )}
            </>
          )}

          {mode === 'nnt' && (
            <div className={styles.nntInputs}>
              <div className={styles.inputGroup}>
                <label htmlFor="cer">Tasa de eventos en grupo control (CER)</label>
                <div className={styles.inputWithUnit}>
                  <input
                    id="cer"
                    type="text"
                    inputMode="decimal"
                    value={cerInput}
                    onChange={(e) => setCerInput(e.target.value)}
                    placeholder="20"
                  />
                  <span className={styles.unit}>%</span>
                </div>
                <span className={styles.inputHint}>Control Event Rate - Proporción de eventos sin tratamiento</span>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="eer">Tasa de eventos en grupo experimental (EER)</label>
                <div className={styles.inputWithUnit}>
                  <input
                    id="eer"
                    type="text"
                    inputMode="decimal"
                    value={eerInput}
                    onChange={(e) => setEerInput(e.target.value)}
                    placeholder="12"
                  />
                  <span className={styles.unit}>%</span>
                </div>
                <span className={styles.inputHint}>Experimental Event Rate - Proporción de eventos con tratamiento</span>
              </div>
              {errorNnt && (
                <p className={styles.errorRecuento} role="alert">
                  Las tasas son porcentajes entre 0 y 100.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
          <h2>Resultados</h2>

          {mode === 'diagnostico' && diagnosticResults && (
            <div className={styles.resultsGrid}>
              <div className={`${styles.resultCard} ${styles.highlight}`}>
                <div className={styles.resultIcon} aria-hidden="true">🎯</div>
                <div className={styles.resultValue}>{pct(diagnosticResults.sensibilidad)}</div>
                <div className={styles.resultLabel}>Sensibilidad</div>
                <div className={styles.resultDesc}>
                  {diagnosticResults.sensibilidad === null ? 'No calculable: no hay enfermos' : 'Detecta enfermos correctamente'}
                </div>
              </div>
              <div className={`${styles.resultCard} ${styles.highlight}`}>
                <div className={styles.resultIcon} aria-hidden="true">🛡️</div>
                <div className={styles.resultValue}>{pct(diagnosticResults.especificidad)}</div>
                <div className={styles.resultLabel}>Especificidad</div>
                <div className={styles.resultDesc}>
                  {diagnosticResults.especificidad === null ? 'No calculable: no hay sanos' : 'Identifica sanos correctamente'}
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">✅</div>
                <div className={styles.resultValue}>{pct(diagnosticResults.vpp)}</div>
                <div className={styles.resultLabel}>VPP</div>
                <div className={styles.resultDesc}>
                  {diagnosticResults.vpp === null ? 'No definido: no hay positivos (0/0)' : 'Valor Predictivo Positivo'}
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">❌</div>
                <div className={styles.resultValue}>{pct(diagnosticResults.vpn)}</div>
                <div className={styles.resultLabel}>VPN</div>
                <div className={styles.resultDesc}>
                  {diagnosticResults.vpn === null ? 'No definido: no hay negativos (0/0)' : 'Valor Predictivo Negativo'}
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">📈</div>
                <div className={styles.resultValue}>{razon(diagnosticResults.lrPositivo)}</div>
                <div className={styles.resultLabel}>LR+</div>
                <div className={styles.resultDesc}>{interpretLR(diagnosticResults.lrPositivo, true)}</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">📉</div>
                <div className={styles.resultValue}>{razon(diagnosticResults.lrNegativo)}</div>
                <div className={styles.resultLabel}>LR-</div>
                <div className={styles.resultDesc}>{interpretLR(diagnosticResults.lrNegativo, false)}</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">📊</div>
                <div className={styles.resultValue}>{pct(diagnosticResults.prevalencia)}</div>
                <div className={styles.resultLabel}>Prevalencia</div>
                <div className={styles.resultDesc}>Proporción de enfermos</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">🎯</div>
                <div className={styles.resultValue}>{pct(diagnosticResults.exactitud)}</div>
                <div className={styles.resultLabel}>Exactitud</div>
                <div className={styles.resultDesc}>Aciertos totales</div>
              </div>
            </div>
          )}

          {mode === 'epidemiologia' && epidemiologiaResults && (
            <div className={styles.resultsGrid}>
              <div className={`${styles.resultCard} ${styles.highlight}`}>
                <div className={styles.resultIcon} aria-hidden="true">⚖️</div>
                <div className={styles.resultValue}>{razon(epidemiologiaResults.oddsRatio)}</div>
                <div className={styles.resultLabel}>Odds Ratio</div>
                <div className={styles.resultDesc}>{interpretOR(epidemiologiaResults.oddsRatio, epidemiologiaResults.icOddsRatio)}</div>
                <div className={styles.resultIC}>{ic(epidemiologiaResults.icOddsRatio)}</div>
              </div>
              <div className={`${styles.resultCard} ${styles.highlight}`}>
                <div className={styles.resultIcon} aria-hidden="true">📊</div>
                <div className={styles.resultValue}>{razon(epidemiologiaResults.riesgoRelativo)}</div>
                <div className={styles.resultLabel}>Riesgo Relativo</div>
                <div className={styles.resultDesc}>Solo válido en cohortes</div>
                <div className={styles.resultIC}>{ic(epidemiologiaResults.icRiesgoRelativo)}</div>
              </div>
              {/* ⚠️ 07/10/2026 (hallazgo 3029): riesgos, ARR, RRR y NNT solo son estimables en
                  cohortes; con columnas de casos y controles no son incidencias reales */}
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">⚠️</div>
                <div className={styles.resultValue}>{pct(epidemiologiaResults.riesgoExpuestos)}</div>
                <div className={styles.resultLabel}>Riesgo Expuestos</div>
                <div className={styles.resultDesc}>Incidencia en expuestos · solo en cohortes</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">✓</div>
                <div className={styles.resultValue}>{pct(epidemiologiaResults.riesgoNoExpuestos)}</div>
                <div className={styles.resultLabel}>Riesgo No Expuestos</div>
                <div className={styles.resultDesc}>Incidencia en no expuestos · solo en cohortes</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">📉</div>
                <div className={styles.resultValue}>{pct(Math.abs(epidemiologiaResults.reduccionRiesgoAbsoluto))}</div>
                <div className={styles.resultLabel}>{epiAumenta ? 'ARI' : 'ARR'}</div>
                <div className={styles.resultDesc}>
                  {epiAumenta ? 'Aumento Riesgo Absoluto' : 'Reducción Riesgo Absoluto'} · solo en cohortes
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">📈</div>
                <div className={styles.resultValue}>
                  {epidemiologiaResults.reduccionRiesgoRelativo === null
                    ? 'No definida'
                    : pct(Math.abs(epidemiologiaResults.reduccionRiesgoRelativo))}
                </div>
                <div className={styles.resultLabel}>{epiAumenta ? 'RRI' : 'RRR'}</div>
                <div className={styles.resultDesc}>
                  {epidemiologiaResults.reduccionRiesgoRelativo === null
                    ? 'Sin eventos en no expuestos: no hay base'
                    : `${epiAumenta ? 'Aumento' : 'Reducción'} Riesgo Relativo · solo en cohortes`}
                </div>
              </div>
              <div className={`${styles.resultCard} ${styles.success}`}>
                <div className={styles.resultIcon} aria-hidden="true">💊</div>
                <div className={styles.resultValue}>
                  {Number.isFinite(epidemiologiaResults.nnt) ? formatNumber(epidemiologiaResults.nnt, 1) : '∞'}
                </div>
                <div className={styles.resultLabel}>{epiAumenta ? 'NNH' : 'NNT'}</div>
                <div className={styles.resultDesc}>
                  {epiAumenta ? 'Número Necesario para Dañar' : 'Número Necesario a Tratar'} · solo en cohortes
                </div>
              </div>
            </div>
          )}

          {mode === 'nnt' && nntResults && (
            <div className={styles.resultsGrid}>
              <div className={`${styles.resultCard} ${styles.highlight} ${styles.fullWidth}`}>
                <div className={styles.resultIcon} aria-hidden="true">💊</div>
                <div className={styles.resultValue}>
                  {Number.isFinite(nntResults.nnt) ? formatNumber(nntResults.nnt, 1) : '∞'}
                </div>
                <div className={styles.resultLabel}>{nntAumenta ? 'NNH' : 'NNT'}</div>
                <div className={styles.resultDesc}>
                  {!Number.isFinite(nntResults.nnt)
                    ? 'Sin diferencia entre grupos: el tratamiento no cambia la tasa de eventos'
                    : nntAumenta
                      ? `Por cada ${Math.ceil(nntResults.nnt)} pacientes tratados, 1 sufrirá un evento adicional`
                      : `Hay que tratar a ${Math.ceil(nntResults.nnt)} pacientes para prevenir 1 evento`}
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">📊</div>
                <div className={styles.resultValue}>{pct(nntResults.cer)}</div>
                <div className={styles.resultLabel}>CER</div>
                <div className={styles.resultDesc}>Tasa grupo control</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">💉</div>
                <div className={styles.resultValue}>{pct(nntResults.eer)}</div>
                <div className={styles.resultLabel}>EER</div>
                <div className={styles.resultDesc}>Tasa grupo experimental</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">📉</div>
                <div className={styles.resultValue}>{pct(Math.abs(nntResults.arr))}</div>
                <div className={styles.resultLabel}>{nntAumenta ? 'ARI' : 'ARR'}</div>
                <div className={styles.resultDesc}>
                  {nntAumenta ? 'Aumento Absoluto' : 'Reducción Absoluta'}
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.resultIcon} aria-hidden="true">📈</div>
                <div className={styles.resultValue}>
                  {nntResults.rrr === null ? 'No definida' : pct(Math.abs(nntResults.rrr))}
                </div>
                <div className={styles.resultLabel}>{nntAumenta ? 'RRI' : 'RRR'}</div>
                <div className={styles.resultDesc}>
                  {nntResults.rrr === null
                    ? 'Con CER del 0 % no hay base para un cambio relativo'
                    : nntAumenta ? 'Aumento Relativo' : 'Reducción Relativa'}
                </div>
              </div>
            </div>
          )}

          {((mode === 'diagnostico' && !diagnosticResults) ||
            (mode === 'epidemiologia' && !epidemiologiaResults) ||
            (mode === 'nnt' && !nntResults)) && (
            <div className={styles.noResults}>
              <span className={styles.noResultsIcon} aria-hidden="true">📊</span>
              <p>
                {(mode === 'diagnostico' && errorDiag) || (mode === 'epidemiologia' && errorEpi) || (mode === 'nnt' && errorNnt)
                  ? 'Corrige los datos marcados para ver los resultados'
                  : mode === 'epidemiologia' && !errorEpi && recuentosEpi.some((v) => v !== null)
                    ? 'Faltan datos: hace falta al menos una persona en el grupo expuesto y otra en el no expuesto'
                    : 'Introduce los datos para ver los resultados'}
              </p>
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
        <p className={styles.highlight}><strong><span aria-hidden="true">⚕️</span> Solo para fines educativos y académicos.</strong> Las decisiones diagnósticas y terapéuticas deben tomarlas médicos con acceso a la historia clínica completa del paciente.</p>
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
                <br /><strong>Interpretación:</strong> LR- &lt; 0,1 = cambio grande
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
                  <td>0 – 100&nbsp;%</td>
                  <td>Cribado poblacional, descartar enfermedad</td>
                  <td>PCR COVID: 95&nbsp;% sens → de 100 enfermos detecta 95</td>
                </tr>
                <tr>
                  <td><strong>Especificidad</strong></td>
                  <td>Proporción de sanos que el test identifica correctamente</td>
                  <td>VN / (VN + FP)</td>
                  <td>0 – 100&nbsp;%</td>
                  <td>Confirmación diagnóstica, evitar tratamientos innecesarios</td>
                  <td>Mamografía: 90&nbsp;% esp → de 100 sanas solo 10 dan falso positivo</td>
                </tr>
                <tr>
                  <td><strong>VPP</strong></td>
                  <td>Probabilidad de estar enfermo si el test es positivo</td>
                  <td>VP / (VP + FP)</td>
                  <td>0 – 100&nbsp;%</td>
                  <td>Interpretar un resultado positivo en la práctica clínica</td>
                  <td>Prevalencia 1&nbsp;%: VPP = 16&nbsp;% aunque sensibilidad sea 95&nbsp;%</td>
                </tr>
                <tr>
                  <td><strong>VPN</strong></td>
                  <td>Probabilidad de estar sano si el test es negativo</td>
                  <td>VN / (VN + FN)</td>
                  <td>0 – 100&nbsp;%</td>
                  <td>Descartar enfermedad en urgencias o cribados</td>
                  <td>D-dímero negativo: VPN &gt;99&nbsp;% para TEP en probabilidad baja</td>
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
          <h2>Ejercicios por perfil profesional</h2>
          <p className={styles.introParagraph}>
            Ejemplos didácticos para practicar la lectura de las métricas. No son recomendaciones de actuación
            clínica ni de política sanitaria: esas decisiones requieren la evidencia completa y el criterio profesional.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🩺</span>
                <h3>Médico Clínico</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Leer la validación de un test de antígenos frente a la PCR en urgencias.
              </p>
              <p>
                Construye la tabla 2×2 con los datos del laboratorio: PCR como gold standard, antígenos como test a evaluar.
                Con VP=180, FP=12, FN=20, VN=288: sensibilidad {pct(EJ_MEDICO.sensibilidad, 0)}, especificidad {pct(EJ_MEDICO.especificidad, 0)} y,
                con la prevalencia de esa muestra ({pct(EJ_MEDICO.prevalencia, 0)}), VPP {pct(EJ_MEDICO.vpp)}. Con una prevalencia del 30{NB}%
                el mismo test daría un VPP del {pct(EJ_VPP_PREV30)}: el VPP es de la población, no del test.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> El médico usa sensibilidad para decidir si puede descartar con un negativo, y el VPP (con la prevalencia local) para saber cuánto confiar en un positivo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                <h3>Epidemiólogo</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Medir la asociación entre tabaco y cáncer de pulmón en una cohorte de 5.000 personas seguidas 10 años.
              </p>
              <p>
                Tabla: fumadores con cáncer (a=120), fumadores sin cáncer (b=1.380), no fumadores con cáncer (c=30), no fumadores sin cáncer (d=3.470).
                OR = (120×3470)/(1380×30) = {razon(EJ_EPIDEMIOLOGO.oddsRatio)}. RR = (120/1500)/(30/3500) = {razon(EJ_EPIDEMIOLOGO.riesgoRelativo)}.
                IC 95{NB}% OR: {formatNumber(EJ_EPIDEMIOLOGO.icOddsRatio!.inferior, 2)} – {formatNumber(EJ_EPIDEMIOLOGO.icOddsRatio!.superior, 2)} (método de Woolf, el de esta calculadora): no incluye el 1 → asociación estadísticamente significativa.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> En cohortes preferir el RR (más intuitivo). El OR se usa cuando el evento es raro (&lt;10{NB}% en expuestos) o en casos y controles, donde el RR no es calculable.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💊</span>
                <h3>Farmacólogo</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Lectura crítica de un ensayo de un anticoagulante cuya eficacia se publicó como "reducción del riesgo relativo del 22{NB}%".
              </p>
              <p>
                El ensayo: CER (control) = 5&nbsp;% eventos/año, EER (tratamiento) = 3,9&nbsp;% eventos/año.
                ARR = 5{NB}% – 3,9{NB}% = 1,1{NB}%. NNT = 1/0,011 = 91 pacientes durante un año para evitar 1 evento.
                La reducción relativa del 22{NB}% suena impresionante; el NNT de 91 muestra cuánto beneficio absoluto hay detrás.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Exigir siempre el NNT y el ARR además del RRR. Un RRR alto con ARR bajo indica que el beneficio absoluto es pequeño.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏥</span>
                <h3>Gestor Sanitario</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Comparar con números dos pruebas de cribado de cáncer colorrectal: test de sangre oculta en heces (TSOH) y colonoscopia.
              </p>
              <p>
                TSOH: coste 15{NB}€/persona, sensibilidad 74{NB}%, especificidad 96{NB}%. Colonoscopia: coste 600{NB}€, sensibilidad 95{NB}%, especificidad 99{NB}%.
                En una población de 100.000 personas con prevalencia 0,5{NB}% (500 enfermos y 99.500 sanos): el TSOH detecta {formatNumber(GESTOR.detTsoh, 0)} casos
                con {formatNumber(GESTOR.fpTsoh, 0)} falsos positivos; la colonoscopia, {formatNumber(GESTOR.detColono, 0)} con {formatNumber(GESTOR.fpColono, 0)}.
                Cada caso adicional detectado con colonoscopia cuesta unos {formatNumber(GESTOR.costePorCasoAdicional, 0)}{NB}€ más ((600 − 15) × 100.000 / {GESTOR.detColono - GESTOR.detTsoh}).
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> La comparación pondera sensibilidad, especificidad, coste por caso detectado y coste de los falsos positivos (biopsias, ansiedad, complicaciones).
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <dl className={styles.faqList}>
            {/* Del MISMO array que el FAQPage de metadata.ts (hallazgos 3031 y 3032) */}
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <dt>{f.question}</dt>
                <dd>{f.answer}</dd>
              </div>
            ))}
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
                  Sensibilidad = 180/(180+20) = <strong>90&nbsp;%</strong>. Especificidad = 288/(288+12) = <strong>96&nbsp;%</strong>.
                  Estas métricas son propiedades intrínsecas del test, no dependen de la prevalencia.
                  La sensibilidad del 90&nbsp;% significa que el test falla en 1 de cada 10 enfermos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Calcular VPP y VPN con la prevalencia de tu población</h4>
                <p>
                  En urgencias la prevalencia es 40&nbsp;%. VPP = (0,90×0,40)/[(0,90×0,40)+(0,04×0,60)] = <strong>93,8&nbsp;%</strong>.
                  VPN = (0,96×0,60)/[(0,96×0,60)+(0,10×0,40)] = <strong>93,5&nbsp;%</strong>.
                  Si aplicas el mismo test en cribado con prevalencia 1&nbsp;%, el VPP cae a 18&nbsp;%: la mayoría de positivos serán falsos.
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
                  Un LR+ de 8 eleva una probabilidad pre-test del 20&nbsp;% al 67&nbsp;%. El nomograma de Fagan permite hacer esto visualmente sin calculadora.
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
                  Al comité clínico: presenta sensibilidad, especificidad, VPP, VPN, AUC y sus IC 95&nbsp;%.
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
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Usa la prevalencia de tu población, no la del estudio</h4>
              <p>
                El VPP y VPN del artículo original son válidos <strong>solo para la prevalencia de ese estudio</strong>.
                Si el estudio se hizo en una clínica especializada con prevalencia 40&nbsp;% y tú trabajas en atención primaria con prevalencia 5&nbsp;%,
                recalcula el VPP con tu prevalencia. La fórmula: VPP = (Sens × prev) / (Sens × prev + (1-Esp) × (1-prev)).
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💬</span>
              <h4>Comunica con NNT, no con reducciones relativas</h4>
              <p>
                Las reducciones de riesgo relativo (RRR) inflan la percepción del beneficio cuando el riesgo basal es bajo.
                "Reducción del 50&nbsp;% del riesgo de infarto" puede significar pasar de 2&nbsp;% a 1&nbsp;% (NNT=100) o de 20&nbsp;% a 10&nbsp;% (NNT=10).
                Usa siempre el NNT junto al tiempo de seguimiento del ensayo: "NNT=25 a 5 años".
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <h4>Reporta siempre el IC 95&nbsp;% junto al OR o RR</h4>
              <p>
                Un OR=3,5 sin intervalo de confianza no dice nada sobre la precisión del estimador.
                IC [3,1 – 3,9] indica alta precisión (muestra grande, efecto real). IC [1,1 – 11,2] indica gran incertidumbre.
                Revistas de impacto como NEJM o Lancet exigen reportar IC 95&nbsp;% en todos los estimadores de asociación.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔬</span>
              <h4>Verifica la calidad del gold standard</h4>
              <p>
                Si el gold standard tiene errores de clasificación (imperfect reference standard), la sensibilidad y especificidad del test a estudio
                estarán sesgadas. Ejemplo: la biopsia hepática tiene variabilidad interobservador del 20&nbsp;% en fibrosis → un test comparado contra ella
                puede parecer peor de lo que es. Considera estudios de concordancia del propio gold standard antes de aceptar los resultados.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <h4>Pondera el coste del falso positivo vs. el falso negativo</h4>
              <p>
                No siempre se deben minimizar ambos por igual. En cribado de cáncer de cérvix, un falso negativo (cáncer no detectado) es mucho más grave
                que un falso positivo (colposcopia innecesaria). En cribado de sepsis neonatal, un falso positivo conlleva antibióticos innecesarios con riesgos propios.
                Adapta el punto de corte según qué error es más costoso en tu contexto clínico.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌍</span>
              <h4>No generalices a poblaciones distintas a las del ensayo</h4>
              <p>
                Un test con sensibilidad 95&nbsp;% en adultos jóvenes puede tener sensibilidad 70&nbsp;% en mayores de 80 años con comorbilidades.
                Un NNT calculado en pacientes de riesgo cardiovascular alto no aplica a población de bajo riesgo.
                Antes de implementar, verifica si la población del estudio es comparable a la tuya en edad, prevalencia y estadio de enfermedad.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores que llevan a conclusiones clínicas equivocadas</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Ignorar la prevalencia al calcular VPP:</strong> Un test con 99{NB}% de sensibilidad y 99{NB}% de especificidad tiene un VPP de solo {pct(EJ_VPP_PREV01, 0)}
              cuando la prevalencia de la enfermedad es 0,1{NB}% (1 de cada 1.000 personas), y del 50{NB}% cuando es del 1{NB}%. En poblaciones de bajo riesgo, la mayoría de positivos son falsos,
              lo que puede llevar a tratamientos innecesarios con sus riesgos y costes asociados.
            </li>
            <li>
              <strong>Confundir RR con OR cuando el evento es frecuente:</strong> Cuando el evento ocurre en más del 10&nbsp;% de los expuestos,
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
              Siempre complementar el valor p con el tamaño del efecto (ARR, OR) y su IC 95&nbsp;%.
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
