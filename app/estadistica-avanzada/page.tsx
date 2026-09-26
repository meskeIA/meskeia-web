'use client';

import { useState, useMemo } from 'react';
import styles from './EstadisticaAvanzada.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, LecturaSerie } from '@/components';
import { formatNumber, formatPercentage, parseSpanishNumber, parsearSerieNumerica, type ModoLectura } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  alfaTexto,
  chiBondadAjuste,
  chiIndependencia,
  correlacion,
  intervaloConfianza,
  normalidad,
  regresion,
  tPareadas,
  tUnaMuestra,
  tWelch,
  type ResultadoChi,
  type ErrorChi,
} from './motor';

type TabType = 'ttest' | 'correlation' | 'regression' | 'chisquare' | 'confidence' | 'normality';

/** Espacio duro entre la cifra y el `%` (Ortografía de la RAE, 2010). */
const PCT = '\u00A0%';

/** «y = 10,0000 − 2,0000x»: el signo de la pendiente va en el operador, no «+ -2,0000x» (2021). */
const ecuacionRecta = (ordenada: number, pendiente: number): string =>
  `y = ${formatNumber(ordenada, 4)} ${pendiente < 0 ? '−' : '+'} ${formatNumber(Math.abs(pendiente), 4)}x`;

const esErrorChi = (r: ResultadoChi | ErrorChi): r is ErrorChi => 'error' in r;

/** Los valores de un campo, con el papel de la coma que esté activo. */
const valoresDe = (texto: string, modo: ModoLectura): number[] => parsearSerieNumerica(texto, modo).valores;

/** Tabla de contingencia: una fila por línea, cada una leída como una serie. */
const leerTabla = (texto: string, modo: ModoLectura): number[][] =>
  texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '')
    .map((l) => valoresDe(l, modo));

export default function EstadisticaAvanzadaPage() {
  /**
   * Cómo leer la coma en TODOS los campos de esta página.
   *
   * Hasta el 04/09/2026 la app hacía `replace(/,/g, '.')` sobre el texto entero antes de
   * partirlo, de modo que la coma nunca podía separar valores: «23,25,28» se leía como un
   * único dato de 23,25 y el test se calculaba con él sin decir nada. Ahora el papel de la
   * coma lo deduce `parsearSerieNumerica` del propio texto —y el usuario puede imponerlo—,
   * con el número de valores leídos a la vista bajo cada campo.
   *
   * Los cálculos viven en `motor.ts` (26/09/2026): aquí solo se lee, se valida y se pinta.
   */
  const [modoLectura, setModoLectura] = useState<ModoLectura>('auto');

  /** Lectura completa de un campo, para enseñarla bajo él con `LecturaSerie`. */
  const leerSerie = (texto: string) => parsearSerieNumerica(texto, modoLectura);

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

  const [chiModo, setChiModo] = useState<'ajuste' | 'independencia'>('ajuste');
  const [chiObserved, setChiObserved] = useState('');
  const [chiExpected, setChiExpected] = useState('');
  const [chiTabla, setChiTabla] = useState('');

  const [confData, setConfData] = useState('');
  const [confLevel, setConfLevel] = useState('95');

  const [normData, setNormData] = useState('');

  /**
   * μ₀ con el parser del catálogo (2009): hasta el 26/09/2026 lo leía un parser casero
   * (cambiar la coma por punto y `|| 0`), que leía «1.500» como 1,5 y convertía cualquier
   * texto en 0 sin avisar. Ahora «1.500» es mil quinientos y lo que no es número se dice.
   */
  const muLeido = parseSpanishNumber(ttestMu);
  const errorMu =
    ttestType !== 'onesample'
      ? null
      : ttestMu.trim() === ''
        ? 'Escribe el valor de referencia μ₀.'
        : Number.isNaN(muLeido)
          ? `«${ttestMu}» no se ha reconocido como número: escribe μ₀ con coma decimal (p. ej. 4,5).`
          : null;

  const ttestResults = useMemo(() => {
    const data1 = valoresDe(ttestData1, modoLectura);
    const data2 = valoresDe(ttestData2, modoLectura);
    if (ttestType === 'onesample') return errorMu ? null : tUnaMuestra(data1, muLeido);
    if (ttestType === 'paired') return tPareadas(data1, data2);
    return tWelch(data1, data2);
  }, [ttestData1, ttestData2, ttestType, muLeido, errorMu, modoLectura]);

  const corrResults = useMemo(
    () => correlacion(
      valoresDe(corrData1, modoLectura),
      valoresDe(corrData2, modoLectura),
      corrType === 'pearson' ? 'Pearson' : 'Spearman'
    ),
    [corrData1, corrData2, corrType, modoLectura]
  );

  const regResults = useMemo(
    () => regresion(valoresDe(regX, modoLectura), valoresDe(regY, modoLectura)),
    [regX, regY, modoLectura]
  );

  /** Filas de la tabla de contingencia, para decir cuántas se han leído bajo el campo. */
  const filasTabla = useMemo(() => leerTabla(chiTabla, modoLectura), [chiTabla, modoLectura]);

  const chiResults = useMemo(() => {
    if (chiModo === 'independencia') return chiIndependencia(filasTabla);
    return chiBondadAjuste(valoresDe(chiObserved, modoLectura), valoresDe(chiExpected, modoLectura));
  }, [chiModo, chiObserved, chiExpected, filasTabla, modoLectura]);

  const confResults = useMemo(
    () => intervaloConfianza(valoresDe(confData, modoLectura), Number(confLevel) / 100),
    [confData, confLevel, modoLectura]
  );

  const normResults = useMemo(() => normalidad(valoresDe(normData, modoLectura)), [normData, modoLectura]);

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
        if (chiModo === 'independencia') {
          setChiTabla('10 20\n30 40');
        } else {
          // Esperadas que suman lo mismo que las observadas (100): antes eran «33.33 33.33
          // 33.33», que suman 99,99 y hoy obligarían a escalar.
          setChiObserved('45 35 20');
          setChiExpected('40 35 25');
        }
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

  /** Tarjeta de aviso para un estadístico que no existe con estos datos (2010, 2011). */
  const tarjetaIndefinido = (titulo: string, motivo: string) => (
    <div className={`${styles.resultCard} ${styles.fullWidth} ${styles.warningCard}`}>
      <span className={styles.resultLabel}>{titulo}</span>
      <span className={styles.resultValueSmall}>{motivo}</span>
    </div>
  );

  const chiOk = chiResults && !esErrorChi(chiResults) ? chiResults : null;
  const chiError = chiResults && esErrorChi(chiResults) ? chiResults.error : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>Estadística Avanzada</h1>
        <p className={styles.subtitle}>
          Tests de hipótesis, regresión, correlación e intervalos de confianza
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Tabs de navegación: la etiqueta se ve también en móvil (2016) */}
      <nav className={styles.tabNav} aria-label="Módulos de análisis">
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
                <label className={styles.label} htmlFor="ea-t-tipo">Tipo de test</label>
                <select
                  id="ea-t-tipo"
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
                <label className={styles.label} htmlFor="ea-t-g1">
                  {ttestType === 'onesample' ? 'Datos de la muestra' : 'Grupo 1'}
                </label>
                <textarea
                  id="ea-t-g1"
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
                  <label className={styles.label} htmlFor="ea-t-g2">Grupo 2</label>
                  <textarea
                    id="ea-t-g2"
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
                  <label className={styles.label} htmlFor="ea-t-mu">Valor de referencia (μ₀)</label>
                  <input
                    id="ea-t-mu"
                    type="text"
                    inputMode="decimal"
                    value={ttestMu}
                    onChange={e => setTtestMu(e.target.value)}
                    placeholder="0"
                    className={styles.input}
                    aria-invalid={errorMu !== null}
                    aria-describedby={errorMu ? 'ea-t-mu-error' : undefined}
                  />
                  {errorMu && (
                    <span id="ea-t-mu-error" className={styles.errorText} role="alert">{errorMu}</span>
                  )}
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
                    <span className={styles.resultValue}>{ttestResults.tipo}</span>
                  </div>
                  {ttestResults.motivoIndefinido || !ttestResults.veredicto ? (
                    tarjetaIndefinido(
                      'Estadístico t no definido',
                      ttestResults.motivoIndefinido ?? 'El test t no está definido con estos datos.'
                    )
                  ) : (
                    <>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Estadístico t</span>
                        <span className={styles.resultValue}>{formatNumber(ttestResults.t, 4)}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Grados de libertad</span>
                        <span className={styles.resultValue}>{formatNumber(ttestResults.gl, 2)}</span>
                      </div>
                      <div className={`${styles.resultCard} ${ttestResults.veredicto.significativo ? styles.significant : styles.notSignificant}`}>
                        <span className={styles.resultLabel}>p-valor</span>
                        <span className={styles.resultValue}>{formatNumber(ttestResults.p, 6)}</span>
                      </div>
                      <div className={`${styles.resultCard} ${styles.fullWidth} ${ttestResults.veredicto.significativo ? styles.significant : styles.notSignificant}`}>
                        <span className={styles.resultLabel}>Interpretación (α = {alfaTexto()})</span>
                        <span className={styles.resultValue}>{ttestResults.veredicto.texto}</span>
                      </div>
                    </>
                  )}
                  {ttestResults.media2 !== null ? (
                    <>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Media Grupo 1</span>
                        <span className={styles.resultValue}>{formatNumber(ttestResults.media1, 4)}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Media Grupo 2</span>
                        <span className={styles.resultValue}>{formatNumber(ttestResults.media2, 4)}</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>
                        {ttestType === 'paired' ? 'Media de las diferencias' : 'Media muestral'}
                      </span>
                      <span className={styles.resultValue}>{formatNumber(ttestResults.media1, 4)}</span>
                    </div>
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
                <label className={styles.label} htmlFor="ea-c-tipo">Tipo de correlación</label>
                <select
                  id="ea-c-tipo"
                  value={corrType}
                  onChange={e => setCorrType(e.target.value as typeof corrType)}
                  className={styles.select}
                >
                  <option value="pearson">Pearson (lineal)</option>
                  <option value="spearman">Spearman (rangos)</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="ea-c-x">Variable X</label>
                <textarea
                  id="ea-c-x"
                  value={corrData1}
                  onChange={e => setCorrData1(e.target.value)}
                  placeholder="Ej: 1 2 3 4 5 6 7 8 9 10"
                  className={styles.textarea}
                  rows={3}
                />
                <LecturaSerie serie={leerSerie(corrData1)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="ea-c-y">Variable Y</label>
                <textarea
                  id="ea-c-y"
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
                    <span className={styles.resultValue}>{corrResults.tipo}</span>
                  </div>
                  <div className={`${styles.resultCard} ${styles.highlight}`}>
                    <span className={styles.resultLabel}>Coeficiente (r)</span>
                    <span className={styles.resultValue}>{formatNumber(corrResults.r, 4)}</span>
                  </div>
                  {corrResults.motivoIndefinido || !corrResults.veredicto ? (
                    tarjetaIndefinido(
                      'Correlación no definida',
                      corrResults.motivoIndefinido ?? 'La correlación no está definida con estos datos.'
                    )
                  ) : (
                    <>
                      {corrResults.tipo === 'Pearson' && (
                        <div className={styles.resultCard}>
                          <span className={styles.resultLabel}>R² (varianza explicada)</span>
                          <span className={styles.resultValue}>{formatPercentage(corrResults.r * corrResults.r, 2)}</span>
                        </div>
                      )}
                      <div className={`${styles.resultCard} ${corrResults.veredicto.significativo ? styles.significant : styles.notSignificant}`}>
                        <span className={styles.resultLabel}>p-valor</span>
                        <span className={styles.resultValue}>{formatNumber(corrResults.p, 6)}</span>
                      </div>
                      <div className={`${styles.resultCard} ${styles.fullWidth}`}>
                        <span className={styles.resultLabel}>Interpretación</span>
                        <span className={styles.resultValue}>{corrResults.interpretacion}</span>
                        <span className={styles.resultValueSmall}>{corrResults.veredicto.texto}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Estadístico t</span>
                        <span className={styles.resultValue}>{formatNumber(corrResults.t, 4)}</span>
                      </div>
                    </>
                  )}
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
              {corrResults?.tipo === 'Spearman' && corrResults.veredicto && (
                <p className={styles.nota}>
                  Spearman: correlación de Pearson entre los rangos; los empates reciben el rango medio.
                  El p-valor usa la aproximación t con n − 2 grados de libertad.
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
                <label className={styles.label} htmlFor="ea-r-x">Variable independiente (X)</label>
                <textarea
                  id="ea-r-x"
                  value={regX}
                  onChange={e => setRegX(e.target.value)}
                  placeholder="Ej: 1 2 3 4 5 6 7 8 9 10"
                  className={styles.textarea}
                  rows={3}
                />
                <LecturaSerie serie={leerSerie(regX)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="ea-r-y">Variable dependiente (Y)</label>
                <textarea
                  id="ea-r-y"
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
                  {Number.isFinite(regResults.pendiente) && (
                    <div className={`${styles.resultCard} ${styles.fullWidth} ${styles.highlight}`}>
                      <span className={styles.resultLabel}>Ecuación de regresión</span>
                      <span className={styles.resultValueLarge}>{ecuacionRecta(regResults.ordenada, regResults.pendiente)}</span>
                    </div>
                  )}
                  {regResults.motivoIndefinido || !regResults.veredicto ? (
                    tarjetaIndefinido(
                      'Regresión no definida',
                      regResults.motivoIndefinido ?? 'La regresión no está definida con estos datos.'
                    )
                  ) : (
                    <>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Pendiente (β₁)</span>
                        <span className={styles.resultValue}>{formatNumber(regResults.pendiente, 4)}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Intercepto (β₀)</span>
                        <span className={styles.resultValue}>{formatNumber(regResults.ordenada, 4)}</span>
                      </div>
                      <div className={`${styles.resultCard} ${styles.highlight}`}>
                        <span className={styles.resultLabel}>R²</span>
                        <span className={styles.resultValue}>{formatPercentage(regResults.r2, 2)}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>r (correlación)</span>
                        <span className={styles.resultValue}>{formatNumber(regResults.r, 4)}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Error estándar</span>
                        <span className={styles.resultValue}>{formatNumber(regResults.errorEstandar, 4)}</span>
                      </div>
                      <div className={`${styles.resultCard} ${regResults.veredicto.significativo ? styles.significant : styles.notSignificant}`}>
                        <span className={styles.resultLabel}>p-valor (pendiente)</span>
                        <span className={styles.resultValue}>{formatNumber(regResults.pPendiente, 6)}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Estadístico F</span>
                        <span className={styles.resultValue}>{formatNumber(regResults.f, 4)}</span>
                      </div>
                    </>
                  )}
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
                <label className={styles.label} htmlFor="ea-chi-modo">Tipo de contraste</label>
                <select
                  id="ea-chi-modo"
                  value={chiModo}
                  onChange={e => setChiModo(e.target.value as typeof chiModo)}
                  className={styles.select}
                >
                  <option value="ajuste">Bondad de ajuste (una lista de frecuencias)</option>
                  <option value="independencia">Independencia (tabla de contingencia)</option>
                </select>
                <span className={styles.helperText}>
                  {chiModo === 'ajuste'
                    ? '¿Se ajustan las frecuencias observadas a las esperadas? gl = categorías − 1.'
                    : '¿Están relacionadas dos variables categóricas? gl = (filas − 1) × (columnas − 1).'}
                </span>
              </div>

              {chiModo === 'ajuste' ? (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="ea-chi-obs">Frecuencias observadas</label>
                    <textarea
                      id="ea-chi-obs"
                      value={chiObserved}
                      onChange={e => setChiObserved(e.target.value)}
                      placeholder="Ej: 45 35 20"
                      className={styles.textarea}
                      rows={2}
                    />
                    <LecturaSerie serie={leerSerie(chiObserved)} modo={modoLectura} onCambiarModo={setModoLectura} />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="ea-chi-esp">Frecuencias esperadas (opcional)</label>
                    <textarea
                      id="ea-chi-esp"
                      value={chiExpected}
                      onChange={e => setChiExpected(e.target.value)}
                      placeholder="Dejar vacío para distribución uniforme"
                      className={styles.textarea}
                      rows={2}
                      aria-describedby="ea-chi-esp-ayuda"
                    />
                    <LecturaSerie serie={leerSerie(chiExpected)} modo={modoLectura} onCambiarModo={setModoLectura} />
                    <span id="ea-chi-esp-ayuda" className={styles.helperText}>
                      Vacío: distribución uniforme. Puedes escribirlas como frecuencias o como proporciones
                      (0,5 0,3 0,2): si no suman lo mismo que las observadas, se escalan a ese total.
                    </span>
                  </div>
                </>
              ) : (
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="ea-chi-tabla">Tabla de contingencia (una fila por línea)</label>
                  <textarea
                    id="ea-chi-tabla"
                    value={chiTabla}
                    onChange={e => setChiTabla(e.target.value)}
                    placeholder={'Ej:\n10 20\n30 40'}
                    className={styles.textarea}
                    rows={4}
                    aria-describedby="ea-chi-tabla-ayuda"
                  />
                  <span id="ea-chi-tabla-ayuda" className={styles.helperText}>
                    Cada línea es una categoría de la primera variable; cada columna, una de la segunda.
                    {filasTabla.length > 0 &&
                      ` Leídas ${filasTabla.length} ${filasTabla.length === 1 ? 'fila' : 'filas'} de ${filasTabla.map(f => f.length).join(', ')} valores.`}
                  </span>
                </div>
              )}

              <button type="button" onClick={() => loadExample('chisquare')} className={styles.btnSecondary}>
                Cargar ejemplo
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Resultados</h2>
              {chiError ? (
                <div className={styles.resultsGrid}>
                  {tarjetaIndefinido('No se puede calcular', chiError)}
                </div>
              ) : chiOk ? (
                <div className={styles.resultsGrid}>
                  <div className={`${styles.resultCard} ${styles.highlight}`}>
                    <span className={styles.resultLabel}>Chi-cuadrado (χ²)</span>
                    <span className={styles.resultValue}>{formatNumber(chiOk.chi2, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Grados de libertad</span>
                    <span className={styles.resultValue}>{chiOk.gl}</span>
                  </div>
                  {chiOk.veredicto ? (
                    <>
                      <div className={`${styles.resultCard} ${chiOk.veredicto.significativo ? styles.significant : styles.notSignificant}`}>
                        <span className={styles.resultLabel}>p-valor</span>
                        <span className={styles.resultValue}>{formatNumber(chiOk.p, 6)}</span>
                      </div>
                      <div className={`${styles.resultCard} ${styles.fullWidth} ${chiOk.veredicto.significativo ? styles.significant : styles.notSignificant}`}>
                        <span className={styles.resultLabel}>Interpretación (α = {alfaTexto()})</span>
                        <span className={styles.resultValue}>{chiOk.veredicto.texto}</span>
                      </div>
                    </>
                  ) : (
                    tarjetaIndefinido(
                      'Aproximación χ² no fiable: sin p-valor ni veredicto',
                      `${chiOk.validez.menoresDe5} de las ${chiOk.validez.total} frecuencias esperadas son menores que 5 (la mínima es ${formatNumber(chiOk.validez.minima, 2)})` +
                        (chiOk.validez.menoresDe1 > 0 ? `, y ${chiOk.validez.menoresDe1} por debajo de 1` : '') +
                        (chiOk.gl === 1
                          ? '. Con 1 grado de libertad todas deben ser al menos 5.'
                          : '. La regla de Cochran pide que ninguna baje de 1 y que no más del 20\u00A0% baje de 5.') +
                        ' Agrupa categorías o usa un test exacto (multinomial o de Fisher).'
                    )
                  )}
                  {chiOk.yates && (
                    <div className={`${styles.resultCard} ${styles.fullWidth}`}>
                      <span className={styles.resultLabel}>Con corrección de continuidad de Yates (tabla 2×2)</span>
                      <span className={styles.resultValueSmall}>
                        χ² = {formatNumber(chiOk.yates.chi2, 4)} · p = {formatNumber(chiOk.yates.p, 6)}
                      </span>
                      <span className={styles.resultValueSmall}>
                        Es la que aplican por defecto R y SciPy en tablas 2×2; es más conservadora.
                      </span>
                    </div>
                  )}
                  {chiOk.avisos.map((aviso) => (
                    <div key={aviso} className={`${styles.resultCard} ${styles.fullWidth} ${styles.infoCard}`}>
                      <span className={styles.resultLabel}>Nota</span>
                      <span className={styles.resultValueSmall}>{aviso}</span>
                    </div>
                  ))}

                  <div className={`${styles.resultCard} ${styles.fullWidth}`}>
                    <span className={styles.resultLabel}>Detalle por {chiOk.modo === 'ajuste' ? 'categoría' : 'celda'}</span>
                    <div className={styles.tablaScroll}>
                      <table className={styles.detailTable}>
                        <thead>
                          <tr>
                            <th scope="col">{chiOk.modo === 'ajuste' ? 'Cat.' : 'Celda'}</th>
                            <th scope="col">Observado</th>
                            <th scope="col">Esperado</th>
                            <th scope="col">Contribución</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chiOk.celdas.map((d) => (
                            <tr key={d.etiqueta}>
                              <td>{d.etiqueta}</td>
                              <td>{formatNumber(d.observada, 2)}</td>
                              <td>{formatNumber(d.esperada, 2)}</td>
                              <td>{formatNumber(d.contribucion, 4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={styles.placeholder}>
                  {chiModo === 'ajuste'
                    ? 'Introduce al menos 2 frecuencias observadas.'
                    : 'Escribe la tabla de contingencia: al menos 2 filas de 2 valores, una fila por línea.'}
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
                <label className={styles.label} htmlFor="ea-ic-datos">Datos de la muestra</label>
                <textarea
                  id="ea-ic-datos"
                  value={confData}
                  onChange={e => setConfData(e.target.value)}
                  placeholder="Ej: 52 48 55 51 49 53 50 54"
                  className={styles.textarea}
                  rows={3}
                />
                <LecturaSerie serie={leerSerie(confData)} modo={modoLectura} onCambiarModo={setModoLectura} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="ea-ic-nivel">Nivel de confianza</label>
                <select
                  id="ea-ic-nivel"
                  value={confLevel}
                  onChange={e => setConfLevel(e.target.value)}
                  className={styles.select}
                >
                  <option value="90">90{PCT}</option>
                  <option value="95">95{PCT}</option>
                  <option value="99">99{PCT}</option>
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
                    <span className={styles.resultLabel}>Intervalo de Confianza al {formatNumber(confResults.nivel * 100, 0)}{PCT} (t-Student)</span>
                    <span className={styles.resultValueLarge}>
                      [{formatNumber(confResults.inferior, 4)} , {formatNumber(confResults.superior, 4)}]
                    </span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Media muestral (x̄)</span>
                    <span className={styles.resultValue}>{formatNumber(confResults.media, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Desviación estándar (s)</span>
                    <span className={styles.resultValue}>{formatNumber(confResults.desviacion, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Error estándar</span>
                    <span className={styles.resultValue}>{formatNumber(confResults.errorEstandar, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Tamaño (n)</span>
                    <span className={styles.resultValue}>{confResults.n}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Valor crítico t</span>
                    <span className={styles.resultValue}>{formatNumber(confResults.tCritico, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Margen de error</span>
                    <span className={styles.resultValue}>±{formatNumber(confResults.margen, 4)}</span>
                  </div>

                  <div className={`${styles.resultCard} ${styles.fullWidth} ${styles.infoCard}`}>
                    <span className={styles.resultLabel}>Comparación con distribución Normal (Z)</span>
                    <span className={styles.resultValueSmall}>
                      IC: [{formatNumber(confResults.inferiorZ, 4)} , {formatNumber(confResults.superiorZ, 4)}]
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
                <label className={styles.label} htmlFor="ea-n-datos">Datos de la muestra</label>
                <textarea
                  id="ea-n-datos"
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
                  {normResults.motivoIndefinido || normResults.noRechaza === null ? (
                    tarjetaIndefinido(
                      'Test Jarque-Bera no definido',
                      normResults.motivoIndefinido ?? 'El test no está definido con estos datos.'
                    )
                  ) : (
                    <>
                      <div className={`${styles.resultCard} ${styles.fullWidth} ${normResults.noRechaza ? styles.significant : styles.notSignificant}`}>
                        <span className={styles.resultLabel}>Test Jarque-Bera de Normalidad</span>
                        <span className={styles.resultValue}>
                          {normResults.noRechaza
                            ? `✓ No se rechaza normalidad (p ≥ ${alfaTexto()})`
                            : `✗ Se rechaza normalidad (p < ${alfaTexto()})`}
                        </span>
                      </div>

                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Estadístico JB</span>
                        <span className={styles.resultValue}>{formatNumber(normResults.jb, 4)}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>p-valor</span>
                        <span className={styles.resultValue}>{formatNumber(normResults.p, 6)}</span>
                      </div>

                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Asimetría (0 en la normal)</span>
                        <span className={styles.resultValue}>{formatNumber(normResults.asimetria, 4)}</span>
                      </div>
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Curtosis (3 en la normal)</span>
                        <span className={styles.resultValue}>{formatNumber(normResults.curtosis, 4)}</span>
                        <span className={styles.resultValueSmall}>Exceso (K − 3): {formatNumber(normResults.curtosis - 3, 4)}</span>
                      </div>

                      <div className={`${styles.resultCard} ${styles.fullWidth}`}>
                        <span className={styles.resultLabel}>Interpretación de forma</span>
                        <span className={styles.resultValueSmall}>{normResults.lecturaAsimetria}</span>
                        <span className={styles.resultValueSmall}>{normResults.lecturaCurtosis}</span>
                      </div>
                    </>
                  )}

                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Media</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.media, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Desv. estándar</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.desviacion, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Mínimo</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.minimo, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Máximo</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.maximo, 4)}</span>
                  </div>

                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Q1 (25{PCT})</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.q1, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Mediana (Q2)</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.q2, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>Q3 (75{PCT})</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.q3, 4)}</span>
                  </div>
                  <div className={styles.resultCard}>
                    <span className={styles.resultLabel}>IQR</span>
                    <span className={styles.resultValue}>{formatNumber(normResults.iqr, 4)}</span>
                  </div>

                  {normResults.atipicos.length > 0 && (
                    <div className={`${styles.resultCard} ${styles.fullWidth} ${styles.warningCard}`}>
                      <span className={styles.resultLabel}><span aria-hidden="true">⚠️</span> Valores atípicos detectados ({normResults.atipicos.length})</span>
                      <span className={styles.resultValueSmall}>
                        {normResults.atipicos.map(o => formatNumber(o, 2)).join(' · ')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className={styles.placeholder}>
                  Introduce al menos 3 valores para analizar la normalidad.
                </p>
              )}
              {normResults && normResults.noRechaza !== null && (
                <p className={styles.nota}>
                  Jarque-Bera es un contraste asintótico: con pocas observaciones su p-valor es solo
                  orientativo, y «no se rechaza» no demuestra que los datos sean normales.
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
              <h4><span aria-hidden="true">📊</span> Test t de Student</h4>
              <p>
                Compara medias de grupos. Usa <strong>muestras independientes</strong> cuando
                los grupos son diferentes (ej: tratamiento vs control). Usa <strong>muestras
                pareadas</strong> cuando mides lo mismo antes/después. Usa <strong>una muestra</strong>
                para comparar contra un valor teórico.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📈</span> Correlación</h4>
              <p>
                <strong>Pearson</strong> mide relación lineal entre variables continuas.
                <strong>Spearman</strong> es mejor cuando hay outliers o relaciones no lineales.
                r = 1 es correlación perfecta positiva, r = -1 perfecta negativa, r = 0 sin correlación.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📉</span> Regresión Lineal</h4>
              <p>
                Predice una variable (Y) a partir de otra (X). El <strong>R²</strong> indica
                qué porcentaje de la variabilidad de Y explica el modelo. La <strong>pendiente</strong>
                indica cuánto cambia Y por cada unidad de X.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🎲</span> Chi-cuadrado</h4>
              <p>
                Para variables categóricas. En <strong>bondad de ajuste</strong> compara una lista de
                frecuencias observadas con las esperadas (gl = k − 1). En <strong>independencia</strong>
                contrasta si dos variables están relacionadas a partir de su tabla de contingencia
                (gl = (filas − 1)(columnas − 1)).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🎯</span> Intervalos de Confianza</h4>
              <p>
                Un IC del 95&nbsp;% significa que si repitieras el estudio 100 veces, 95 de esos
                intervalos contendrían el verdadero parámetro poblacional. Más datos =
                intervalo más estrecho.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🔔</span> Tests de Normalidad</h4>
              <p>
                Muchos tests asumen datos normales. El test <strong>Jarque-Bera</strong> usa
                asimetría y curtosis. <strong>Asimetría</strong> ≈ 0 y <strong>curtosis</strong> ≈ 3 (exceso de curtosis ≈ 0)
                son lo propio de la normal. Valores extremos sugieren no normalidad.
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
            <h3><span aria-hidden="true">⚖️</span> ¿Qué Test Estadístico Usar? Comparativa Completa</h3>
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
                  <tr><td><strong>Chi-cuadrado de independencia</strong></td><td>Asociación entre dos variables categóricas (tabla de contingencia)</td><td>Categórico</td><td>Variables independientes</td><td>χ², p-valor</td></tr>
                  <tr><td><strong>Chi-cuadrado de bondad de ajuste</strong></td><td>¿Se ajustan unas frecuencias a una distribución teórica?</td><td>Categórico</td><td>Las proporciones son las esperadas</td><td>χ², p-valor</td></tr>
                  <tr><td><strong>Intervalo de confianza</strong></td><td>Estimar parámetro poblacional con incertidumbre</td><td>Cualquiera</td><td>No aplica</td><td>IC [lower, upper]</td></tr>
                  <tr><td><strong>Test de normalidad</strong></td><td>Verificar asunción de normalidad antes de otros tests</td><td>Continuo</td><td>Distribución normal</td><td>Decisión sí/no</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Casos de uso por perfil profesional */}
          <div className={styles.eduEscenariosSection}>
            <h3><span aria-hidden="true">💼</span> Casos de Uso por Perfil Profesional</h3>
            <p className={styles.eduEscenariosSubtitle}>Cómo usar estadística avanzada en tu contexto específico</p>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon} aria-hidden="true">🔬</span>
                  <h4>Investigador Académico</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Flujo típico:</strong> Test de normalidad → si falla, Mann-Whitney. Si pasa, t-test o ANOVA. Calcula tamaño del efecto (Cohen&apos;s d). Reporta IC 95&nbsp;% además del p-valor.</p>
                <p className={styles.eduEscenarioTip}><strong>Consejo clave:</strong> Nunca reportes solo el p-valor. El tamaño del efecto y el IC son obligatorios para revistas científicas de impacto desde 2016.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon} aria-hidden="true">📊</span>
                  <h4>Analista de Datos Empresarial</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Flujo típico:</strong> A/B test → t-test de dos muestras. Correlación entre variables de negocio → Pearson + regresión para cuantificar impacto económico.</p>
                <p className={styles.eduEscenarioTip}><strong>Consejo clave:</strong> En negocio, el p-valor &lt; 0,05 no basta. Calcula el impacto económico del tamaño del efecto: ¿0,3&nbsp;% de mejora en conversión vale el costo del cambio?</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon} aria-hidden="true">🎓</span>
                  <h4>Estudiante de Estadística</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Práctica recomendada:</strong> Para cada dataset, aplica: (1) estadísticos descriptivos, (2) visualización, (3) test de normalidad, (4) test apropiado, (5) interpretación en contexto del problema.</p>
                <p className={styles.eduEscenarioTip}><strong>Consejo clave:</strong> Aprende los supuestos antes que las fórmulas. Un t-test mal aplicado a datos no normales con n&lt;30 es peor que no hacer nada.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon} aria-hidden="true">🏥</span>
                  <h4>Profesional de Ciencias de la Salud</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Flujo típico:</strong> Comparar grupos de tratamiento → t-test (n&gt;30, normal) o Mann-Whitney. Factores de riesgo → correlación + regresión logística. Siempre reportar NNT (Número Necesario a Tratar).</p>
                <p className={styles.eduEscenarioTip}><strong>Consejo clave:</strong> En salud, la significancia clínica supera a la estadística. Una diferencia de presión arterial de 2 mmHg puede ser estadísticamente significativa con n=10.000 pero clínicamente irrelevante.</p>
              </div>
            </div>
          </div>

          {/* FAQ ampliado */}
          <div className={styles.eduFaqSection}>
            <h3><span aria-hidden="true">❓</span> Preguntas Frecuentes sobre Estadística Avanzada</h3>
            <p className={styles.eduFaqSubtitle}>Respuestas detalladas a las dudas más comunes en análisis estadístico</p>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Qué significa exactamente el p-valor?</h4>
                <p>El p-valor es la probabilidad de obtener un resultado tan extremo o más extremo que el observado, <strong>asumiendo que la hipótesis nula es cierta</strong>. p = 0,03 NO significa &quot;hay 3&nbsp;% de probabilidad de que H₀ sea verdadera&quot;. Significa que si H₀ fuera cierta, veríamos estos datos (o más extremos) el 3&nbsp;% de las veces. Tampoco es la probabilidad de equivocarse al rechazar: esa tasa de error de tipo I es α, que se fija antes de ver los datos; el p-valor cambia con cada muestra.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Por qué α = 0,05 es el umbral estándar?</h4>
                <p>Ronald Fisher lo propuso en 1925 como convención práctica, no como verdad matemática. Significa aceptar un 5&nbsp;% de probabilidad de rechazar H₀ siendo cierta (error tipo I). En algunos campos es diferente: en física de partículas un descubrimiento exige 5 sigma (p ≈ 0,0000003, una cola: 1 entre 3,5 millones), y en los ensayos clínicos confirmatorios se suele fijar α = 0,025 unilateral, que equivale al 0,05 bilateral (guía ICH E9).</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Cuál es la diferencia entre significancia estadística y relevancia práctica?</h4>
                <p>Con muestras grandes (n &gt; 10.000), casi cualquier diferencia será estadísticamente significativa aunque sea prácticamente inútil. Ejemplo: un fármaco que reduce la presión arterial 0,5 mmHg puede dar p &lt; 0,001 con n = 50.000, pero clínicamente es irrelevante (el umbral de relevancia es &gt; 5 mmHg). Solución: reportar siempre el tamaño del efecto (Cohen&apos;s d, r², η²).</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Cuándo usar t-test en lugar de Mann-Whitney?</h4>
                <p>Usa <strong>t-test</strong> cuando: datos aproximadamente normales (verifica con Shapiro-Wilk), n &gt; 30 (por TCL), sin outliers extremos. Usa <strong>Mann-Whitney</strong> (no paramétrico) cuando: datos sesgados o no normales, outliers significativos, datos ordinales, n pequeño (&lt; 30). Mann-Whitney no asume normalidad pero asume misma forma de distribución en ambos grupos.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Qué es la potencia estadística y por qué importa?</h4>
                <p>La potencia (1-β) es la probabilidad de detectar un efecto real cuando existe. Potencia = 0,8 significa 80&nbsp;% de probabilidad de rechazar H₀ si el efecto es real. Estudios con baja potencia (&lt; 0,6) producen resultados &quot;no significativos&quot; que en realidad son falsos negativos. Calcula el tamaño de muestra necesario ANTES del estudio para garantizar potencia ≥ 0,8 (convención estándar).</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Qué mide R² en regresión lineal?</h4>
                <p>R² (coeficiente de determinación) es la proporción de varianza de Y explicada por X. R² = 0,65 significa que X explica el 65&nbsp;% de la variabilidad de Y. Interpretación por campo: en ciencias naturales R² &gt; 0,9 es esperable; en ciencias sociales R² &gt; 0,5 es bueno; en finanzas R² &gt; 0,3 puede ser excelente. R² no mide si el modelo es correcto, solo si hay relación lineal.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Cuál es el problema del p-hacking y cómo evitarlo?</h4>
                <p>El p-hacking es manipular el análisis para obtener p &lt; 0,05: probar múltiples variables hasta encontrar una significativa, parar cuando aparece significancia, eliminar outliers selectivamente. Con 20 tests independientes, esperamos 1 falso positivo por azar. Solución: <strong>pre-registro del estudio</strong> (especificar hipótesis y análisis antes de recoger datos), corrección de Bonferroni para múltiples comparaciones (α/n tests).</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Cómo interpretar el coeficiente de correlación de Pearson?</h4>
                <p>r mide la fuerza y dirección de la relación LINEAL. Interpretación de Cohen: r = 0,1 débil, r = 0,3 moderado, r = 0,5 fuerte. Importante: r = 0,7 implica R² = 0,49, o sea que X explica solo el 49&nbsp;% de Y. <strong>Correlación no implica causalidad</strong>: el PIB per cápita correlaciona con el número de cines (ambos suben con la riqueza). Verifica siempre con un scatterplot antes de reportar correlación.</p>
              </div>
            </div>
          </div>

          {/* Guía paso a paso */}
          <div className={styles.eduStepSection}>
            <h3><span aria-hidden="true">📋</span> Proceso Correcto de Análisis Estadístico: 7 Pasos</h3>
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
                  <p>Para t-test: normalidad (Shapiro-Wilk si n&lt;50, Kolmogorov-Smirnov si n≥50), homocedasticidad (Levene). Para chi-cuadrado: frecuencias esperadas suficientes (regla de Cochran: ninguna por debajo de 1 y no más del 20&nbsp;% por debajo de 5; con 1 grado de libertad, todas ≥ 5). Para regresión: residuos normales, homocedasticidad, independencia. Si los supuestos fallan, usa alternativas no paramétricas o transformaciones.</p>
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
                  <p>El IC 95&nbsp;% da el rango plausible del parámetro poblacional. Complementa al p-valor con información sobre la magnitud. Interpretación correcta: &quot;si repitiéramos el estudio muchas veces, el 95&nbsp;% de los ICs calculados incluirían el verdadero parámetro&quot;. Si el IC de la diferencia incluye el 0, la diferencia no es significativa (equivalente a p &gt; 0,05).</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>7</div>
                <div className={styles.eduStepContent}>
                  <h4>Interpreta en contexto y comunica correctamente</h4>
                  <p>Reporta: estadístico(gl) = valor, p = valor exacto, IC 95&nbsp;% [a, b], tamaño del efecto con su clasificación. Evita: &quot;el estudio prueba que...&quot;, &quot;hay diferencias significativas&quot; sin especificar la magnitud. Di: &quot;Se encontró una diferencia estadísticamente significativa de 3,2 puntos (t(58) = 2,41, p = 0,019, d = 0,62, IC 95&nbsp;% [0,5, 5,9]), lo que representa un tamaño del efecto moderado&quot;.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips - mejores prácticas */}
          <div className={styles.eduTipsSection}>
            <h3><span aria-hidden="true">✅</span> Mejores Prácticas en Análisis Estadístico</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">📈</span>
                <h4>Siempre visualiza antes de calcular</h4>
                <p>Un scatterplot revela outliers, relaciones no lineales y agrupaciones que el estadístico resumen oculta. El cuarteto de Anscombe (mismo r, distribuciones totalmente distintas) lo ilustra perfectamente.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🎯</span>
                <h4>Reporta tamaño del efecto siempre</h4>
                <p>Cohen&apos;s d para diferencias de medias, r² para regresión, η² para ANOVA. Un efecto puede ser estadísticamente significativo pero prácticamente irrelevante (o viceversa con muestras pequeñas).</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🔢</span>
                <h4>Usa IC 95&nbsp;% además del p-valor</h4>
                <p>El intervalo de confianza comunica la precisión de la estimación y su relevancia práctica. Un IC [0,01, 0,02] indica precisión pero efecto minúsculo. Un IC [-5, 50] indica alta incertidumbre.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">⚠️</span>
                <h4>Corrige para comparaciones múltiples</h4>
                <p>Con 20 tests independientes a α=0,05, esperas 1 falso positivo. Aplica Bonferroni (α/n) para análisis exploratorios o FDR (Benjamini-Hochberg) para datos genómicos o de neuroimagen.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🔬</span>
                <h4>Verifica supuestos del test</h4>
                <p>Shapiro-Wilk para normalidad (antes del t-test), Levene para homocedasticidad, Durbin-Watson para autocorrelación (en series temporales). Un test aplicado con supuestos violados puede dar resultados falsos.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">📝</span>
                <h4>Pre-registra tus hipótesis</h4>
                <p>Especifica hipótesis, diseño, tamaño de muestra y análisis ANTES de recoger datos. Usa OSF (Open Science Framework) para pre-registro público. Esto elimina el sesgo de confirmación y el p-hacking.</p>
              </div>
            </div>
          </div>

          {/* Warning box - errores comunes */}
          <div className={styles.eduWarningBox}>
            <div className={styles.eduWarningHeader}>
              <span className={styles.eduWarningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores Estadísticos que Invalidan tus Conclusiones</h3>
            </div>
            <ul className={styles.eduWarningList}>
              <li><strong><span aria-hidden="true">❌</span> Interpretar p &gt; 0,05 como &quot;no hay efecto&quot;:</strong> Solo significa &quot;insuficiente evidencia para rechazar H₀&quot;. Puede ser por muestra pequeña (baja potencia) o porque el efecto es pequeño. Un IC que incluye valores clínicamente relevantes es más informativo.</li>
              <li><strong><span aria-hidden="true">❌</span> Hacer múltiples tests sin corrección:</strong> Probar 20 hipótesis independientes garantiza ~1 falso positivo por azar. Sin corrección (Bonferroni, FDR), los resultados son no reproducibles. Este es el origen principal de la &quot;crisis de replicación&quot; en ciencias.</li>
              <li><strong><span aria-hidden="true">❌</span> Asumir normalidad sin verificar:</strong> El t-test es robusto a desviaciones leves de normalidad con n &gt; 30, pero no con outliers extremos o distribuciones altamente sesgadas (ej: ingresos, tiempos de respuesta). Shapiro-Wilk + histograma, siempre.</li>
              <li><strong><span aria-hidden="true">❌</span> Confundir correlación con causalidad:</strong> r = 0,95 entre A y B no implica que A cause B. Puede ser relación espuria (ambos correlacionan con C), causalidad inversa (B causa A), o coincidencia. La causalidad requiere diseño experimental o métodos específicos (regresión instrumental, DAGs).</li>
              <li><strong><span aria-hidden="true">❌</span> Aplicar test paramétrico a datos ordinales:</strong> Escala Likert (1-5) NO es continua: la distancia entre &quot;De acuerdo&quot; y &quot;Muy de acuerdo&quot; no es igual a entre &quot;Neutro&quot; y &quot;De acuerdo&quot;. Usa Mann-Whitney, Kruskal-Wallis o modelos de regresión ordinal.</li>
              <li><strong><span aria-hidden="true">❌</span> Olvidar el tamaño del efecto con muestras grandes:</strong> Con n = 50.000, una diferencia de 0,001 mm puede ser p &lt; 0,001 pero completamente irrelevante. Cohen&apos;s d &lt; 0,2 es &quot;pequeño&quot; independientemente del p-valor. Siempre pregunta: ¿esta diferencia importa en la práctica?</li>
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
