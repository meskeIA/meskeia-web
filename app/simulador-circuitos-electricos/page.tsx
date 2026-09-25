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
import { formatNumber, parseSpanishNumber } from '@/lib';
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
  V: number;
  /** Las resistencias YA parseadas con las que se calculó, para que la tabla no relea los inputs (hallazgo 872) */
  resistencias: number[];
  I: number;
  tensiones: number[];
  potencias: number[];
  potenciaTotal: number;
}

interface ResultadoParalelo {
  Req: number;
  V: number;
  resistencias: number[];
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

/**
 * Margen relativo con el que se acepta que V, I y R tecleados A LA VEZ cumplan V = I × R.
 * Un 1 % deja pasar los redondeos normales de un enunciado (dos o tres cifras significativas)
 * y caza las ternas que no describen ningún circuito posible (hallazgo 869).
 */
const TOLERANCIA_OHM = 0.01;

const PREFIJOS_SI: [number, string][] = [
  [1e-3, 'm'],
  [1e-6, 'µ'],
  [1e-9, 'n'],
  [1e-12, 'p'],
];

/** ¿Imprimir `valor` con `decimales` fijos lo dejaría en un cero que no es? */
function seRedondeaACero(valor: number, decimales: number): boolean {
  return Number.isFinite(valor) && valor !== 0 && Math.abs(valor) < 0.5 * 10 ** -decimales;
}

/**
 * Una magnitud con su unidad, sin ceros falsos (hallazgo 1666).
 *
 * Con decimales fijos, 1,9149 µA salía «≈0 A» y 2,5 mW salía «0,00 W»: un cero SIN «≈» al lado
 * de una corriente distinta de cero. Mientras la cifra cabe en los decimales de siempre se
 * imprime igual que antes; cuando se redondearía a cero, pasa al prefijo del SI que la deja
 * legible (mA, µA, mW…), con los mismos decimales.
 */
function cifra(valor: number, unidad: string, decimales: number): string {
  if (!seRedondeaACero(valor, decimales)) return `${formatNumber(valor, decimales)} ${unidad}`;
  const abs = Math.abs(valor);
  const prefijo = PREFIJOS_SI.find(([factor]) => abs >= factor) ?? PREFIJOS_SI[PREFIJOS_SI.length - 1];
  return `${formatNumber(valor / prefijo[0], decimales)} ${prefijo[1]}${unidad}`;
}

/** Para una celda cuya columna ya dice la unidad: sin ella, salvo que haga falta un prefijo. */
function cifraCelda(valor: number, unidad: string, decimales: number): string {
  return seRedondeaACero(valor, decimales) ? cifra(valor, unidad, decimales) : formatNumber(valor, decimales);
}

/** La corriente en A con su equivalencia en mA, o con prefijo si en A se perdería. */
function corrienteConMa(I: number, separador: string, cierre = ''): string {
  if (seRedondeaACero(I, 4)) return cifra(I, 'A', 4);
  return `${formatNumber(I, 4)} A${separador}${formatNumber(I * 1000, 2)} mA${cierre}`;
}

/**
 * La R tecleada, con los decimales que de verdad tiene (mínimo 2, como la columna): la tabla
 * reimprimía 0,047 Ω como «0,05», otra resistencia que la del campo (hallazgo 1666).
 */
function resistenciaTecleada(r: number): string {
  if (Math.abs(r) < 1e-4) return cifra(r, 'Ω', 4);
  let d = 2;
  while (d < 6 && Math.abs(r * 10 ** d - Math.round(r * 10 ** d)) > 1e-6) d++;
  return formatNumber(r, d);
}

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
  const [potTarifa, setPotTarifa] = useState('0,18');
  const [resPot, setResPot] = useState<ResultadoPotencia | null>(null);
  const [errorPot, setErrorPot] = useState('');

/**
 * Por qué no vale un solo mensaje para todo (hallazgos 874 y 875).
 *
 * `parseSpanishNumber` devuelve NaN tanto para lo que no es un número como para la notación
 * científica, que rechaza a propósito. La app lo comunicaba todo como «deben ser valores
 * positivos», así que quien escribía «1e3» —que su propio campo daba por válido, porque el
 * navegador lo considera un número y cumple el min=0— veía rechazado un valor correcto con
 * una explicación que no le decía qué corregir.
 *
 * Y un 0 TECLEADO se descartaba en silencio como si el campo estuviera vacío: en la pestaña
 * de Potencia, V = 230, I = 0, R = 5 se «completaba» sola a I = 46 A y publicaba consumo y
 * coste, con el campo de I mostrando todavía 0. La misma entrada recibía dos respuestas
 * distintas según la pestaña, porque la Ley de Ohm sí la rechazaba.
 */
function motivoDeRechazo(etiqueta: string, texto: string, admiteCero = false): string | null {
  if (texto.trim() === '') return null; // vacío es «no lo sé», y eso cada pestaña lo trata a su modo
  const valor = parseSpanishNumber(texto);
  if (!Number.isFinite(valor)) {
    return /e/i.test(texto)
      ? `${etiqueta}: la notación científica («${texto.trim()}») no se admite aquí. Escribe el número completo, por ejemplo 1000 en vez de 1e3.`
      : `${etiqueta}: «${texto.trim()}» no es un número.`;
  }
  // Horas, días y tarifa admiten el cero (autoconsumo a 0 €/kWh, un aparato que no se usa):
  // el rechazo general lo impedía y dejaba muertas las validaciones «< 0» de calcPotencia
  // (hallazgo 1667). En V, I y R un 0 escrito sigue sin ser «no lo sé».
  if (admiteCero ? valor < 0 : valor <= 0) {
    return admiteCero ? `${etiqueta}: no puede ser negativo.` : `${etiqueta}: tiene que ser mayor que cero.`;
  }
  return null;
}

  function calcOhm() {
    setErrorOhm('');
    setResOhm(null);
    const motivoOhm =
      motivoDeRechazo(labels[incognita].a, ohmA) ??
      motivoDeRechazo(labels[incognita].b, ohmB) ??
      (ohmA.trim() === '' || ohmB.trim() === '' ? 'Introduce dos valores positivos.' : null);
    if (motivoOhm) { setErrorOhm(motivoOhm); return; }
    const a = parseSpanishNumber(ohmA);
    const b = parseSpanishNumber(ohmB);
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
    const V = parseSpanishNumber(vSerie);
    if (isNaN(V) || V <= 0) { setErrorSerie('Tensión de fuente inválida.'); return; }
    const motivoSerie = rsSerie
      .slice(0, numSerie)
      .map((texto, i) => motivoDeRechazo(`R${i + 1}`, texto) ?? (texto.trim() === '' ? `R${i + 1}: falta el valor.` : null))
      .find(Boolean);
    if (motivoSerie) { setErrorSerie(motivoSerie); return; }
    const rs = rsSerie.slice(0, numSerie).map(parseSpanishNumber);
    const Req = rs.reduce((a, r) => a + r, 0);
    const I = V / Req;
    const tensiones = rs.map(r => I * r);
    const potencias = rs.map(r => I * I * r);
    setResSerie({ Req, V, resistencias: rs, I, tensiones, potencias, potenciaTotal: I * I * Req });
  }

  function calcParalelo() {
    setErrorPar('');
    setResPar(null);
    const V = parseSpanishNumber(vPar);
    if (isNaN(V) || V <= 0) { setErrorPar('Tensión de fuente inválida.'); return; }
    const motivoPar = rsPar
      .slice(0, numPar)
      .map((texto, i) => motivoDeRechazo(`R${i + 1}`, texto) ?? (texto.trim() === '' ? `R${i + 1}: falta el valor.` : null))
      .find(Boolean);
    if (motivoPar) { setErrorPar(motivoPar); return; }
    const rs = rsPar.slice(0, numPar).map(parseSpanishNumber);
    const invReq = rs.reduce((a, r) => a + 1 / r, 0);
    const Req = 1 / invReq;
    const corrientes = rs.map(r => V / r);
    const Itotal = corrientes.reduce((a, i) => a + i, 0);
    const potencias = rs.map(r => V * V / r);
    setResPar({ Req, V, resistencias: rs, Itotal, corrientes, potencias, potenciaTotal: V * V / Req });
  }

  function calcPotencia() {
    setErrorPot('');
    setResPot(null);
    const V = parseSpanishNumber(potV);
    const I = parseSpanishNumber(potI);
    const R = parseSpanishNumber(potR);
    const horas = parseSpanishNumber(potHoras);
    const dias = parseSpanishNumber(potDias);
    const tarifa = parseSpanishNumber(potTarifa);
    // Primero, lo ESCRITO que no puede ser: un 0 en cualquiera de los tres no es «no lo sé».
    const motivoPot = ([
      ['Tensión (V)', potV, false],
      ['Corriente (I)', potI, false],
      ['Resistencia (R)', potR, false],
      ['Horas al día', potHoras, true],
      ['Días', potDias, true],
      ['Tarifa', potTarifa, true],
    ] as [string, string, boolean][])
      .map(([etiqueta, texto, admiteCero]) => motivoDeRechazo(etiqueta, texto, admiteCero))
      .find(Boolean);
    if (motivoPot) { setErrorPot(motivoPot); return; }

    const validos = [V, I, R].filter(v => !isNaN(v) && v > 0);
    if (validos.length < 2) { setErrorPot('Introduce al menos dos de los tres valores (V, I, R).'); return; }
    // Con los tres rellenos ninguna rama del despeje se ejecuta, así que hasta ahora la ficha
    // podía enseñar una terna que no cumple la ley de Ohm como si fuera un circuito real: las
    // tres fórmulas del encabezado (V×I, V²/R, I²×R) daban tres potencias distintas. No se
    // recalcula ninguno, porque no hay forma de saber cuál de los tres está mal (hallazgo 869).
    if (validos.length === 3 && Math.abs(V - I * R) > TOLERANCIA_OHM * I * R) {
      setErrorPot(
        `Los tres valores no pueden darse a la vez: la ley de Ohm exige V = I × R = ${formatNumber(I * R, 4)} V, ` +
        `no ${formatNumber(V, 4)} V. Corrige uno o deja vacío el que quieras que se calcule.`
      );
      return;
    }
    let fV = V, fI = I, fR = R;
    if (isNaN(fV) || fV <= 0) fV = fI * fR;
    else if (isNaN(fI) || fI <= 0) fI = fV / fR;
    else if (isNaN(fR) || fR <= 0) fR = fV / fI;
    const P = fV * fI;
    if (!isFinite(P) || P <= 0) { setErrorPot('No se puede calcular la potencia con esos valores.'); return; }
    // El bloque de consumo y coste es la cifra DESTACADA del panel, y sus tres campos no se
    // validaban: vacíos se propagaban como NaN hasta imprimirse «No definido» sin decir cuál
    // faltaba, al lado de una P y una R correctas (hallazgo 870). El cero sí se admite —una
    // tarifa de 0 €/kWh es autoconsumo, y 0 horas da 0 kWh, que no es una cifra falsa.
    if (isNaN(horas) || horas < 0) { setErrorPot('Indica las horas de uso diario (un número de 0 o más).'); return; }
    if (isNaN(dias) || dias < 0) { setErrorPot('Indica los días del periodo (un número de 0 o más).'); return; }
    if (isNaN(tarifa) || tarifa < 0) { setErrorPot('Indica la tarifa eléctrica en €/kWh (un número de 0 o más).'); return; }
    const energiaKwh = (P / 1000) * horas * dias;
    const costeEuros = energiaKwh * tarifa;
    setResPot({ P, V: fV, I: fI, R: fR, energiaKwh, costeEuros });
  }

  /**
   * Cambiar el número de resistencias retira la ficha anterior (hallazgo 1663): la tabla y el
   * Req describían el circuito calculado mientras los campos y el diagrama ya mostraban otro.
   * Si el número no cambia (ya en el mínimo o en el máximo), la ficha sigue siendo válida.
   */
  function cambiarNumSerie(delta: number) {
    const nuevo = Math.min(MAX_R, Math.max(2, numSerie + delta));
    if (nuevo === numSerie) return;
    setNumSerie(nuevo);
    setResSerie(null);
    setErrorSerie('');
  }

  function cambiarNumPar(delta: number) {
    const nuevo = Math.min(MAX_R, Math.max(2, numPar + delta));
    if (nuevo === numPar) return;
    setNumPar(nuevo);
    setResPar(null);
    setErrorPar('');
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

  // Ids de los campos de la pestaña de resistencias activa: cada <label> nombra su campo, en vez
  // de que el lector de pantalla anuncie el placeholder («Ω», «voltios») (hallazgo 1664)
  const prefijoR = tab === 'paralelo' ? 'par' : 'serie';

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
              type="button"
              // Cuál de las cuatro calculadoras está en pantalla lo decía solo una clase CSS,
              // invisible para un lector de pantalla (hallazgo 871)
              aria-pressed={tab === t}
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
                    type="button"
                    aria-pressed={incognita === u}
                    className={`${styles.unknownBtn} ${incognita === u ? styles.unknownActive : ''}`}
                    onClick={() => { setIncognita(u); setResOhm(null); setErrorOhm(''); }}
                  >
                    Calcular {u === 'V' ? 'Tensión (V)' : u === 'I' ? 'Corriente (I)' : 'Resistencia (R)'}
                  </button>
                ))}
              </div>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="ohm-a">{labels[incognita].a}</label>
                  <input
                    id="ohm-a"
                    type="text"
                    inputMode="decimal"
                    min="0"
                    value={ohmA}
                    onChange={e => setOhmA(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="ohm-b">{labels[incognita].b}</label>
                  <input
                    id="ohm-b"
                    type="text"
                    inputMode="decimal"
                    min="0"
                    value={ohmB}
                    onChange={e => setOhmB(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              {errorOhm && <p role="alert" className={styles.avisoError}>{errorOhm}</p>}
              <button type="button" className={styles.calcBtn} onClick={calcOhm}>Calcular</button>

              <div role="status" aria-live="polite">
              {resOhm && (
                <div className={styles.resultBlock}>
                  <p className={styles.resultTitle}>Resultado</p>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Tensión (V)</span>
                    <span className={resOhm && incognita === 'V' ? styles.resultValueAccent : styles.resultValue}>
                      {cifra(resOhm.V, 'V', 4)}
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Corriente (I)</span>
                    <span className={resOhm && incognita === 'I' ? styles.resultValueAccent : styles.resultValue}>
                      {corrienteConMa(resOhm.I, ' — ')}
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Resistencia (R)</span>
                    <span className={resOhm && incognita === 'R' ? styles.resultValueAccent : styles.resultValue}>
                      {cifra(resOhm.R, 'Ω', 4)}
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Potencia disipada (P)</span>
                    <span className={styles.resultValue}>{cifra(resOhm.V * resOhm.I, 'W', 4)}</span>
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
                <button type="button" className={styles.countBtn} onClick={() => cambiarNumSerie(-1)} aria-label="Reducir">−</button>
                <span className={styles.countValue}>{numSerie}</span>
                <button type="button" className={styles.countBtn} onClick={() => cambiarNumSerie(1)} aria-label="Aumentar">+</button>
              </div>
              <div className={styles.resistoresGrid}>
                {Array.from({ length: numSerie }, (_, i) => (
                  <div key={i} className={styles.resistorCard}>
                    <label htmlFor={`${prefijoR}-r${i + 1}`} className={styles.resistorLabel}>R{i + 1}</label>
                    <input
                      id={`${prefijoR}-r${i + 1}`}
                      type="text"
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
                <label htmlFor={`${prefijoR}-v`}>Tensión de fuente (V)</label>
                <input
                  id={`${prefijoR}-v`}
                  type="text"
                  inputMode="decimal"
                  min="0"
                  value={vSerie}
                  onChange={e => setVSerie(e.target.value)}
                  placeholder="voltios"
                />
              </div>
              {errorSerie && <p role="alert" className={styles.avisoError}>{errorSerie}</p>}
              <button type="button" className={styles.calcBtn} onClick={calcSerie}>Calcular circuito</button>

              <div role="status" aria-live="polite">
              {resSerie && (
                <>
                  <div className={styles.resultBlock} style={{ marginBottom: '1rem' }}>
                    <p className={styles.resultTitle}>Resumen del circuito</p>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Resistencia equivalente</span>
                      <span className={styles.resultValueAccent}>{cifra(resSerie.Req, 'Ω', 3)}</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Corriente total</span>
                      <span className={styles.resultValue}>{corrienteConMa(resSerie.I, ' (', ')')}</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Potencia total disipada</span>
                      <span className={styles.resultValue}>{cifra(resSerie.potenciaTotal, 'W', 4)}</span>
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
                      {resSerie.resistencias.map((r, i) => (
                        <tr key={i}>
                          <td>R{i + 1}</td>
                          <td>{resistenciaTecleada(r)}</td>
                          <td>{cifra(resSerie.tensiones[i], 'V', 4)}</td>
                          <td>{cifraCelda(resSerie.I, 'A', 4)}</td>
                          <td>{cifraCelda(resSerie.potencias[i], 'W', 4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={styles.diagrama}>{diagramaSerie(resSerie.resistencias.length)}</div>
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
                <button type="button" className={styles.countBtn} onClick={() => cambiarNumPar(-1)} aria-label="Reducir">−</button>
                <span className={styles.countValue}>{numPar}</span>
                <button type="button" className={styles.countBtn} onClick={() => cambiarNumPar(1)} aria-label="Aumentar">+</button>
              </div>
              <div className={styles.resistoresGrid}>
                {Array.from({ length: numPar }, (_, i) => (
                  <div key={i} className={styles.resistorCard}>
                    <label htmlFor={`${prefijoR}-r${i + 1}`} className={styles.resistorLabel}>R{i + 1}</label>
                    <input
                      id={`${prefijoR}-r${i + 1}`}
                      type="text"
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
                <label htmlFor={`${prefijoR}-v`}>Tensión de fuente (V)</label>
                <input
                  id={`${prefijoR}-v`}
                  type="text"
                  inputMode="decimal"
                  min="0"
                  value={vPar}
                  onChange={e => setVPar(e.target.value)}
                  placeholder="voltios"
                />
              </div>
              {errorPar && <p role="alert" className={styles.avisoError}>{errorPar}</p>}
              <button type="button" className={styles.calcBtn} onClick={calcParalelo}>Calcular circuito</button>

              <div role="status" aria-live="polite">
              {resPar && (
                <>
                  <div className={styles.resultBlock} style={{ marginBottom: '1rem' }}>
                    <p className={styles.resultTitle}>Resumen del circuito</p>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Resistencia equivalente</span>
                      <span className={styles.resultValueAccent}>{cifra(resPar.Req, 'Ω', 4)}</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Corriente total (fuente)</span>
                      <span className={styles.resultValue}>{cifra(resPar.Itotal, 'A', 4)}</span>
                    </div>
                    <div className={styles.resultRow}>
                      <span className={styles.resultLabel}>Potencia total disipada</span>
                      <span className={styles.resultValue}>{cifra(resPar.potenciaTotal, 'W', 4)}</span>
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
                      {resPar.resistencias.map((r, i) => (
                        <tr key={i}>
                          <td>R{i + 1}</td>
                          <td>{resistenciaTecleada(r)}</td>
                          {/* La tensión del nodo, formateada como sus celdas vecinas y no en crudo
                              desde el input, que la sacaba con punto decimal (hallazgo 872) */}
                          <td>{cifraCelda(resPar.V, 'V', 4)}</td>
                          <td>{cifraCelda(resPar.corrientes[i], 'A', 4)}</td>
                          <td>{cifraCelda(resPar.potencias[i], 'W', 4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={styles.diagrama}>{diagramaParalelo(resPar.resistencias.length)}</div>
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
                  <label htmlFor="pot-v">Tensión V (voltios)</label>
                  <input id="pot-v" type="text" inputMode="decimal" min="0" value={potV} onChange={e => setPotV(e.target.value)} placeholder="opcional si tienes I y R" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="pot-i">Corriente I (amperios)</label>
                  <input id="pot-i" type="text" inputMode="decimal" min="0" value={potI} onChange={e => setPotI(e.target.value)} placeholder="opcional si tienes V y R" />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="pot-r">Resistencia R (ohmios)</label>
                  <input id="pot-r" type="text" inputMode="decimal" min="0" value={potR} onChange={e => setPotR(e.target.value)} placeholder="opcional si tienes V e I" />
                </div>
              </div>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="pot-horas">Horas de uso diario</label>
                  <input id="pot-horas" type="text" inputMode="decimal" min="0" value={potHoras} onChange={e => setPotHoras(e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="pot-dias">Días del periodo</label>
                  <input id="pot-dias" type="text" inputMode="decimal" min="1" value={potDias} onChange={e => setPotDias(e.target.value)} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="pot-tarifa">Tarifa eléctrica (€/kWh)</label>
                  <input id="pot-tarifa" type="text" inputMode="decimal" min="0" value={potTarifa} onChange={e => setPotTarifa(e.target.value)} />
                </div>
              </div>
              {errorPot && <p role="alert" className={styles.avisoError}>{errorPot}</p>}
              <button type="button" className={styles.calcBtn} onClick={calcPotencia}>Calcular</button>

              <div role="status" aria-live="polite">
              {resPot && (
                <div className={styles.resultBlock}>
                  <p className={styles.resultTitle}>Resultado energético</p>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Tensión (V)</span>
                    <span className={styles.resultValue}>{cifra(resPot.V, 'V', 4)}</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Corriente (I)</span>
                    <span className={styles.resultValue}>{cifra(resPot.I, 'A', 4)}</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Resistencia (R)</span>
                    <span className={styles.resultValue}>{cifra(resPot.R, 'Ω', 4)}</span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Potencia (P)</span>
                    <span className={styles.resultValueAccent}>{cifra(resPot.P, 'W', 2)}</span>
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
