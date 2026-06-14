'use client';
// @disclaimer: exempt

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorCircuitosElectricos.module.css';

type Tab = 'ohm' | 'serie' | 'paralelo' | 'potencia';
type Incognita = 'V' | 'I' | 'R';

interface ResultadoOhm {
  V: number;
  I: number;
  R: number;
}

interface ResultadoSerie {
  Req: number;
  I: number;
  tensiones: number[];
  potencias: number[];
  potenciaTotal: number;
}

interface ResultadoParalelo {
  Req: number;
  Itotal: number;
  corrientes: number[];
  potencias: number[];
  potenciaTotal: number;
}

interface ResultadoPotencia {
  P: number;
  V: number;
  I: number;
  R: number;
  energiaKwh: number;
  costeEuros: number;
}

const MAX_R = 6;

export default function SimuladorCircuitosElectricos() {
  const [tab, setTab] = useState<Tab>('ohm');

  // Ley de Ohm
  const [incognita, setIncognita] = useState<Incognita>('V');
  const [ohmA, setOhmA] = useState('');
  const [ohmB, setOhmB] = useState('');
  const [resOhm, setResOhm] = useState<ResultadoOhm | null>(null);
  const [errorOhm, setErrorOhm] = useState('');

  // Circuito serie
  const [numSerie, setNumSerie] = useState(3);
  const [rsSerie, setRsSerie] = useState<string[]>(Array(MAX_R).fill(''));
  const [vSerie, setVSerie] = useState('');
  const [resSerie, setResSerie] = useState<ResultadoSerie | null>(null);
  const [errorSerie, setErrorSerie] = useState('');

  // Circuito paralelo
  const [numPar, setNumPar] = useState(3);
  const [rsPar, setRsPar] = useState<string[]>(Array(MAX_R).fill(''));
  const [vPar, setVPar] = useState('');
  const [resPar, setResPar] = useState<ResultadoParalelo | null>(null);
  const [errorPar, setErrorPar] = useState('');

  // Potencia
  const [potV, setPotV] = useState('');
  const [potI, setPotI] = useState('');
  const [potR, setPotR] = useState('');
  const [potHoras, setPotHoras] = useState('1');
  const [potDias, setPotDias] = useState('30');
  const [potTarifa, setPotTarifa] = useState('0.18');
  const [resPot, setResPot] = useState<ResultadoPotencia | null>(null);
  const [errorPot, setErrorPot] = useState('');

  function calcOhm() {
    setErrorOhm('');
    setResOhm(null);
    const a = parseFloat(ohmA.replace(',', '.'));
    const b = parseFloat(ohmB.replace(',', '.'));
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
      setErrorOhm('Introduce dos valores positivos.');
      return;
    }
    let V: number, I: number, R: number;
    if (incognita === 'V') { I = a; R = b; V = I * R; }
    else if (incognita === 'I') { V = a; R = b; I = V / R; }
    else { V = a; I = b; R = V / I; }
    if (!isFinite(V) || !isFinite(I) || !isFinite(R) || R <= 0) {
      setErrorOhm('Valores fuera de rango. Verifica que no divides entre cero.');
      return;
    }
    setResOhm({ V, I, R });
  }

  function calcSerie() {
    setErrorSerie('');
    setResSerie(null);
    const V = parseFloat(vSerie.replace(',', '.'));
    if (isNaN(V) || V <= 0) { setErrorSerie('Tensión de fuente inválida.'); return; }
    const rs = rsSerie.slice(0, numSerie).map(s => parseFloat(s.replace(',', '.')));
    if (rs.some(r => isNaN(r) || r <= 0)) { setErrorSerie('Todas las resistencias deben ser valores positivos.'); return; }
    const Req = rs.reduce((a, r) => a + r, 0);
    const I = V / Req;
    const tensiones = rs.map(r => I * r);
    const potencias = rs.map(r => I * I * r);
    setResSerie({ Req, I, tensiones, potencias, potenciaTotal: I * I * Req });
  }

  function calcParalelo() {
    setErrorPar('');
    setResPar(null);
    const V = parseFloat(vPar.replace(',', '.'));
    if (isNaN(V) || V <= 0) { setErrorPar('Tensión de fuente inválida.'); return; }
    const rs = rsPar.slice(0, numPar).map(s => parseFloat(s.replace(',', '.')));
    if (rs.some(r => isNaN(r) || r <= 0)) { setErrorPar('Todas las resistencias deben ser valores positivos.'); return; }
    const invReq = rs.reduce((a, r) => a + 1 / r, 0);
    const Req = 1 / invReq;
    const corrientes = rs.map(r => V / r);
    const Itotal = corrientes.reduce((a, i) => a + i, 0);
    const potencias = rs.map(r => V * V / r);
    setResPar({ Req, Itotal, corrientes, potencias, potenciaTotal: V * V / Req });
  }

  function calcPotencia() {
    setErrorPot('');
    setResPot(null);
    const V = parseFloat(potV.replace(',', '.'));
    const I = parseFloat(potI.replace(',', '.'));
    const R = parseFloat(potR.replace(',', '.'));
    const horas = parseFloat(potHoras.replace(',', '.'));
    const dias = parseFloat(potDias.replace(',', '.'));
    const tarifa = parseFloat(potTarifa.replace(',', '.'));
    const validos = [V, I, R].filter(v => !isNaN(v) && v > 0);
    if (validos.length < 2) { setErrorPot('Introduce al menos dos de los tres valores (V, I, R).'); return; }
    let fV = V, fI = I, fR = R;
    if (isNaN(fV) || fV <= 0) fV = fI * fR;
    else if (isNaN(fI) || fI <= 0) fI = fV / fR;
    else if (isNaN(fR) || fR <= 0) fR = fV / fI;
    const P = fV * fI;
    if (!isFinite(P) || P <= 0) { setErrorPot('No se puede calcular la potencia con esos valores.'); return; }
    const energiaKwh = (P / 1000) * horas * dias;
    const costeEuros = energiaKwh * tarifa;
    setResPot({ P, V: fV, I: fI, R: fR, energiaKwh, costeEuros });
  }

  function updateRSerie(i: number, val: string) {
    setRsSerie(prev => { const n = [...prev]; n[i] = val; return n; });
  }

  function updateRPar(i: number, val: string) {
    setRsPar(prev => { const n = [...prev]; n[i] = val; return n; });
  }

  const labels: Record<Incognita, { a: string; b: string }> = {
    V: { a: 'Corriente I (A)', b: 'Resistencia R (Ω)' },
    I: { a: 'Tensión V (V)', b: 'Resistencia R (Ω)' },
    R: { a: 'Tensión V (V)', b: 'Corriente I (A)' },
  };

  const diagramaSerie = (n: number) => {
    const resistores = Array.from({ length: n }, (_, i) => `[R${i + 1}]`).join('─');
    return `  +─${resistores}─+\n  │              │\n [V]            GND\n  │              │\n  +──────────────+`;
  };

  const diagramaParalelo = (n: number) => {
    const lineas = Array.from({ length: n }, (_, i) => `  │──[R${i + 1}]──│`);
    return `  +──────────+\n${lineas.join('\n')}\n  │          │\n [V]        GND\n  │          │\n  +──────────+`;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Circuitos Eléctricos</h1>
        <p>Serie, paralelo, Ley de Ohm y potencia — hasta 6 resistencias</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabBar} aria-label="Secciones del simulador">
          {(['ohm', 'serie', 'paralelo', 'potencia'] as Tab[]).map(t => (
            <button
              key={t}
              className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'ohm' ? 'Ley de Ohm' : t === 'serie' ? 'Serie' : t === 'paralelo' ? 'Paralelo' : 'Potencia'}
            </button>
          ))}
        </nav>

        {/* TAB 1 — Ley de Ohm */}
        {tab === 'ohm' && (
          <div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Ley de Ohm: V = I × R</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Selecciona la magnitud que quieres calcular e introduce las otras dos.
              </p>
              <div className={styles.unknownSelector}>
                {(['V', 'I', 'R'] as Incognita[]).map(u => (
                  <button
                    key={u}
                    className={`${styles.unknownBtn} ${incognita === u ? styles.unknownActive : ''}`}
                    onClick={() => { setIncognita(u); setResOhm(null); setErrorOhm(''); }}
                  >
                    Calcular {u === 'V' ? 'Tensión (V)' : u === 'I' ? 'Corriente (I)' : 'Resistencia (R)'}
                  </button>
                ))}
              </div>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>{labels[incognita].a}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={ohmA}
                    onChange={e => setOhmA(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>{labels[incognita].b}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={ohmB}
                    onChange={e => setOhmB(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              {errorOhm && <p role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errorOhm}</p>}
              <button className={styles.calcBtn} onClick={calcOhm}>Calcular</button>

              <div role="status" aria-live="polite">
              {resOhm && (
                <div className={styles.resultBlock}>
                  <p className={styles.resultTitle}>Resultado</p>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Tensión (V)</span>
                    <span className={resOhm && incognita === 'V' ? styles.resultValueAccent : styles.resultValue}>
                      {formatNumber(resOhm.V, 4)} V
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Corriente (I)</span>
                    <span className={resOhm && incognita === 'I' ? styles.resultValueAccent : styles.resultValue}>
                      {formatNumber(resOhm.I, 4)} A — {formatNumber(resOhm.I * 1000, 2)} mA
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Resistencia (R)</span>
                    <span className={resOhm && incognita === 'R' ? styles.resultValueAccent : styles.resultValue}>
                      {formatNumber(resOhm.R, 4)} Ω
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Potencia disipada (P)</span>
                    <span className={styles.resultValue}>{formatNumber(resOhm.V * resOhm.I, 4)} W</span>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — Serie */}
        {tab === 'serie' && (
          <div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Circuito en Serie</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                R_eq = R₁ + R₂ + … | Misma corriente en todas las resistencias.
              </p>
              <div className={styles.countControl}>
                <label>Número de resistencias:</label>
                <button className={styles.countBtn} onClick={() => setNumSerie(n => Math.max(2, n - 1))} aria-label="Reducir">−</button>
                <span className={styles.countValue}>{numSerie}</span>
                <button className={styles.countBtn} onClick={() => setNumSerie(n => Math.min(MAX_R, n + 1))} aria-label="Aumentar">+</button>
              </div>
              <div className={styles.resistoresGrid}>
                {Array.from({ length: numSerie }, (_, i) => (
                  <div key={i} className={styles.resistorCard}>
                    <span className={styles.resistorLabel}>R{i + 1}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      className={styles.resistorInput}
                      placeholder="Ω"
                      value={rsSerie[i]}
                      onChange={e => updateRSerie(i, e.target.value)}
                    />
                    <span className={styles.unitLabel}>ohmios</span>
                  </div>
                ))}
              </div>
              <div className={styles.inputGroup} style={{ maxWidth: '220px', marginBottom: '1rem' }}>
                <label>Tensión de fuente (V)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={vSerie}
                  onChange={e => setVSerie(e.target.value)}
                  placeholder="voltios"
                />
              </div>
              {errorSerie && <p role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errorSerie}</p>}
              <button className={styles.calcBtn} onClick={calcSerie}>Calcular circuito</button>

              <div role="status" aria-live="polite">
              {resSerie && (
                <>
                  <div className={styles.resultBlock} style={{ marginBottom: '1rem' }}>
                    <p className={styles.resultTitle}>Resumen del circuito</p>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Resistencia equivalente</span>
                      <span className={styles.resultValueAccent}>{formatNumber(resSerie.Req, 3)} Ω</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Corriente total</span>
                      <span className={styles.resultValue}>{formatNumber(resSerie.I, 4)} A ({formatNumber(resSerie.I * 1000, 2)} mA)</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Potencia total disipada</span>
                      <span className={styles.resultValue}>{formatNumber(resSerie.potenciaTotal, 4)} W</span>
                    </div>
                  </div>
                  <table className={styles.compTable}>
                    <thead>
                      <tr>
                        <th>Componente</th>
                        <th>R (Ω)</th>
                        <th>V caída</th>
                        <th>I (A)</th>
                        <th>P (W)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rsSerie.slice(0, numSerie).map((r, i) => (
                        <tr key={i}>
                          <td>R{i + 1}</td>
                          <td>{formatNumber(parseFloat(r.replace(',', '.')), 2)}</td>
                          <td>{formatNumber(resSerie.tensiones[i], 4)} V</td>
                          <td>{formatNumber(resSerie.I, 4)}</td>
                          <td>{formatNumber(resSerie.potencias[i], 4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={styles.diagrama}>{diagramaSerie(numSerie)}</div>
                </>
              )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 — Paralelo */}
        {tab === 'paralelo' && (
          <div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Circuito en Paralelo</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                1/R_eq = 1/R₁ + 1/R₂ + … | Misma tensión en todas las ramas.
              </p>
              <div className={styles.countControl}>
                <label>Número de resistencias:</label>
                <button className={styles.countBtn} onClick={() => setNumPar(n => Math.max(2, n - 1))} aria-label="Reducir">−</button>
                <span className={styles.countValue}>{numPar}</span>
                <button className={styles.countBtn} onClick={() => setNumPar(n => Math.min(MAX_R, n + 1))} aria-label="Aumentar">+</button>
              </div>
              <div className={styles.resistoresGrid}>
                {Array.from({ length: numPar }, (_, i) => (
                  <div key={i} className={styles.resistorCard}>
                    <span className={styles.resistorLabel}>R{i + 1}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      className={styles.resistorInput}
                      placeholder="Ω"
                      value={rsPar[i]}
                      onChange={e => updateRPar(i, e.target.value)}
                    />
                    <span className={styles.unitLabel}>ohmios</span>
                  </div>
                ))}
              </div>
              <div className={styles.inputGroup} style={{ maxWidth: '220px', marginBottom: '1rem' }}>
                <label>Tensión de fuente (V)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={vPar}
                  onChange={e => setVPar(e.target.value)}
                  placeholder="voltios"
                />
              </div>
              {errorPar && <p role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errorPar}</p>}
              <button className={styles.calcBtn} onClick={calcParalelo}>Calcular circuito</button>

              <div role="status" aria-live="polite">
              {resPar && (
                <>
                  <div className={styles.resultBlock} style={{ marginBottom: '1rem' }}>
                    <p className={styles.resultTitle}>Resumen del circuito</p>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Resistencia equivalente</span>
                      <span className={styles.resultValueAccent}>{formatNumber(resPar.Req, 4)} Ω</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Corriente total (fuente)</span>
                      <span className={styles.resultValue}>{formatNumber(resPar.Itotal, 4)} A</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Potencia total disipada</span>
                      <span className={styles.resultValue}>{formatNumber(resPar.potenciaTotal, 4)} W</span>
                    </div>
                  </div>
                  <table className={styles.compTable}>
                    <thead>
                      <tr>
                        <th>Componente</th>
                        <th>R (Ω)</th>
                        <th>V (V)</th>
                        <th>I rama (A)</th>
                        <th>P (W)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rsPar.slice(0, numPar).map((r, i) => (
                        <tr key={i}>
                          <td>R{i + 1}</td>
                          <td>{formatNumber(parseFloat(r.replace(',', '.')), 2)}</td>
                          <td>{vPar}</td>
                          <td>{formatNumber(resPar.corrientes[i], 4)}</td>
                          <td>{formatNumber(resPar.potencias[i], 4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={styles.diagrama}>{diagramaParalelo(numPar)}</div>
                </>
              )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 — Potencia */}
        {tab === 'potencia' && (
          <div>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Potencia y Coste Energético</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                P = V × I = V²/R = I²×R. Introduce al menos dos de los tres valores eléctricos.
              </p>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>Tensión V (voltios)</label>
                  <input type="number" inputMode="decimal" min="0" value={potV} onChange={e => setPotV(e.target.value)} placeholder="opcional si tienes I y R" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Corriente I (amperios)</label>
                  <input type="number" inputMode="decimal" min="0" value={potI} onChange={e => setPotI(e.target.value)} placeholder="opcional si tienes V y R" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Resistencia R (ohmios)</label>
                  <input type="number" inputMode="decimal" min="0" value={potR} onChange={e => setPotR(e.target.value)} placeholder="opcional si tienes V e I" />
                </div>
              </div>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>Horas de uso diario</label>
                  <input type="number" inputMode="decimal" min="0" value={potHoras} onChange={e => setPotHoras(e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Días del periodo</label>
                  <input type="number" inputMode="decimal" min="1" value={potDias} onChange={e => setPotDias(e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Tarifa eléctrica (€/kWh)</label>
                  <input type="number" inputMode="decimal" min="0" value={potTarifa} onChange={e => setPotTarifa(e.target.value)} />
                </div>
              </div>
              {errorPot && <p role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>{errorPot}</p>}
              <button className={styles.calcBtn} onClick={calcPotencia}>Calcular</button>

              <div role="status" aria-live="polite">
              {resPot && (
                <div className={styles.resultBlock}>
                  <p className={styles.resultTitle}>Resultado energético</p>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Tensión (V)</span>
                    <span className={styles.resultValue}>{formatNumber(resPot.V, 4)} V</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Corriente (I)</span>
                    <span className={styles.resultValue}>{formatNumber(resPot.I, 4)} A</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Resistencia (R)</span>
                    <span className={styles.resultValue}>{formatNumber(resPot.R, 4)} Ω</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Potencia (P)</span>
                    <span className={styles.resultValueAccent}>{formatNumber(resPot.P, 2)} W</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Consumo del periodo</span>
                    <span className={styles.resultValue}>{formatNumber(resPot.energiaKwh, 4)} kWh</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Coste estimado</span>
                    <span className={styles.resultValueAccent}>{formatNumber(resPot.costeEuros, 4)} €</span>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        <EducationalSection
          title="Guía de Circuitos Eléctricos"
          subtitle="Serie, paralelo, Ley de Ohm y análisis de potencia"
        >
          {/* Tabla comparativa */}
          <h3>Comparativa: Serie vs Paralelo</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Serie</th>
                  <th>Paralelo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Resistencia equivalente</td>
                  <td>R_eq = R₁ + R₂ + … (mayor que cada R)</td>
                  <td>1/R_eq = 1/R₁ + 1/R₂ + … (menor que la mínima)</td>
                </tr>
                <tr>
                  <td>Corriente</td>
                  <td>Igual en todas las resistencias</td>
                  <td>Se divide en ramas; suma = total</td>
                </tr>
                <tr>
                  <td>Tensión</td>
                  <td>Se reparte; suma = fuente</td>
                  <td>Igual en todas las ramas</td>
                </tr>
                <tr>
                  <td>Fallo de un componente</td>
                  <td>Corta el circuito completo</td>
                  <td>Solo afecta a esa rama</td>
                </tr>
                <tr>
                  <td>Uso típico</td>
                  <td>Divisores de tensión, LEDs en cadena</td>
                  <td>Instalaciones domésticas, baterías</td>
                </tr>
                <tr>
                  <td>Potencia total</td>
                  <td>Suma de potencias individuales</td>
                  <td>Suma de potencias individuales</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Casos de uso */}
          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de física</h4>
              <p>Verifica resultados de ejercicios de circuitos antes del examen. Calcula R equivalente, caídas de tensión y corrientes de rama en segundos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Aficionado a la electrónica</h4>
              <p>Diseña circuitos con LEDs, calcula la resistencia de polarización correcta y estima el consumo de su proyecto Arduino o Raspberry Pi.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Técnico de instalaciones</h4>
              <p>Dimensiona circuitos de alumbrado, comprueba caídas de tensión en cables largos y estima el coste mensual de una instalación.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Docente de tecnología</h4>
              <p>Demuestra en clase la diferencia entre serie y paralelo de forma interactiva, sin necesidad de circuitos físicos ni equipos de medida.</p>
            </div>
          </div>

          {/* FAQ */}
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué la R equivalente en paralelo es siempre menor que la más pequeña?</strong>
              <p>Añadir ramas paralelas ofrece más caminos a la corriente, reduciendo la resistencia total. Matemáticamente, sumar inversos siempre produce un inverso mayor → R menor.</p>
              <p className={styles.faqTip}>Ejemplo: dos resistencias de 10 Ω en paralelo dan 5 Ω.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo sé si mis resistencias son correctas para un LED?</strong>
              <p>Usa la fórmula R = (V_fuente − V_LED) / I_LED. Para un LED rojo típico: V_LED ≈ 2 V, I_LED ≈ 20 mA. Con 5 V: R = (5−2)/0,02 = 150 Ω.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre vatios y kilovatios-hora?</strong>
              <p>El vatio (W) es potencia (energía por unidad de tiempo). El kWh es energía consumida: 1 kWh = 1.000 W durante 1 hora. La factura eléctrica se cobra en kWh.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Puedo mezclar serie y paralelo en el mismo circuito?</strong>
              <p>Sí, se llama circuito mixto. Debes resolver primero los bloques paralelos para obtener su R equivalente y luego sumarlos como si fuera un circuito serie.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué la instalación eléctrica doméstica es en paralelo?</strong>
              <p>Para que cada electrodoméstico reciba la misma tensión (230 V en Europa) y pueda funcionar de forma independiente. Si fuera en serie, apagar uno cortaría todo el circuito.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la caída de tensión y por qué importa?</strong>
              <p>Es la parte de la tensión total que "consume" cada resistencia (V_R = I × R). En instalaciones largas, el propio cable tiene resistencia y produce caídas que reducen la tensión útil.</p>
            </div>
          </div>

          {/* Guía paso a paso */}
          <h3>Cómo analizar un circuito serie — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica los componentes</strong>
                <p>Anota el valor en ohmios de cada resistencia y la tensión de la fuente de alimentación.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula la resistencia equivalente</strong>
                <p>Suma todas las resistencias: R_eq = R₁ + R₂ + R₃ + … El resultado es siempre mayor que cualquier R individual.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Obtén la corriente del circuito</strong>
                <p>Aplica la Ley de Ohm al circuito completo: I = V_fuente / R_eq. Esta corriente es la misma en todos los componentes.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula la caída de tensión en cada resistencia</strong>
                <p>V_i = I × R_i. Verifica que la suma de todas las caídas coincide con la tensión de la fuente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Calcula la potencia disipada</strong>
                <p>P_i = I² × R_i (o V_i × I). La suma de todas las potencias individuales = potencia total entregada por la fuente.</p>
              </div>
            </div>
          </div>

          {/* Mejores prácticas */}
          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <div>
                <strong>Usa el SI siempre</strong>
                <p>Trabaja en voltios, amperios y ohmios. Convierte antes de calcular (mA → A, kΩ → Ω).</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✔️</span>
              <div>
                <strong>Verifica con Kirchhoff</strong>
                <p>1ª ley: suma de corrientes en nodo = 0. 2ª ley: suma de tensiones en malla = 0.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔋</span>
              <div>
                <strong>Respeta la potencia máxima</strong>
                <p>Cada resistencia tiene una potencia máxima (en W). Superarla la quema. Usa el tab de Potencia para comprobarlo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <div>
                <strong>Considera la temperatura</strong>
                <p>La resistencia de los metales aumenta con la temperatura. Para corrientes altas, usa el valor nominal con margen de seguridad.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Dibuja el esquema primero</strong>
                <p>Antes de calcular, traza el circuito en papel identificando nodos y mallas. Reduce errores de interpretación.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <div>
                <strong>Desconecta antes de medir</strong>
                <p>En circuitos reales, apaga la fuente antes de conectar el ohmímetro. Medir resistencia con tensión aplicada destruye el instrumento.</p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores Frecuentes al Analizar Circuitos
            </div>
            <ul className={styles.warningList}>
              <li>Confundir serie y paralelo al calcular R_eq — el resultado puede ser opuesto al real.</li>
              <li>No convertir unidades (mA a A, kΩ a Ω) antes de aplicar la Ley de Ohm.</li>
              <li>Asumir que en paralelo la corriente de todas las ramas es igual (solo lo es si las R son iguales).</li>
              <li>Ignorar la resistencia interna de la fuente — en fuentes reales reduce la tensión disponible.</li>
              <li>Superar la potencia máxima nominal de las resistencias — provoca calentamiento o fallo.</li>
              <li>Medir con ohmímetro en un circuito energizado — valores erróneos y posible daño al instrumento.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-circuitos-electricos')} />
        <ShareCard appName="simulador-circuitos-electricos" />
      </main>

      <Footer appName="simulador-circuitos-electricos" />
    </div>
  );
}
