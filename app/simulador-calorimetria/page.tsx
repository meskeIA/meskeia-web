'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
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
import {
  SUSTANCIAS,
  sustanciaPorId,
  rangoSustancia,
  calcularTramos,
  resolverMezcla,
  type Tramo,
  type ProcesoTramo,
} from './motor';
import styles from './SimuladorCalorimetria.module.css';

interface Cuerpo {
  sustanciaId: string;
  masaG: number;
  temperatura: number;
}

const NOMBRE_PROCESO: Record<ProcesoTramo, string> = {
  calentar: 'calentamiento',
  enfriar: 'enfriamiento',
  fusion: 'fusión',
  solidificacion: 'solidificación',
  vaporizacion: 'vaporización',
  condensacion: 'condensación',
};

// ============================================================
// Presentación de un tramo
// ============================================================
function etiquetaTramo(tr: Tramo): string {
  const t = (x: number) => `${formatNumber(x, 1)} °C`;
  switch (tr.proceso) {
    case 'calentar':
      return `Calentar de ${t(tr.tIni)} a ${t(tr.tFin)}`;
    case 'enfriar':
      return `Enfriar de ${t(tr.tIni)} a ${t(tr.tFin)}`;
    case 'fusion':
      return tr.fraccion < 1
        ? `Fundir el ${formatNumber(tr.fraccion * 100, 1)} % a ${t(tr.tIni)}`
        : `Fundir a ${t(tr.tIni)}`;
    case 'solidificacion':
      return tr.fraccion < 1
        ? `Solidificar el ${formatNumber(tr.fraccion * 100, 1)} % a ${t(tr.tIni)}`
        : `Solidificar a ${t(tr.tIni)}`;
    case 'vaporizacion':
      return tr.fraccion < 1
        ? `Evaporar el ${formatNumber(tr.fraccion * 100, 1)} % a ${t(tr.tIni)}`
        : `Evaporar a ${t(tr.tIni)}`;
    case 'condensacion':
      return tr.fraccion < 1
        ? `Condensar el ${formatNumber(tr.fraccion * 100, 1)} % a ${t(tr.tIni)}`
        : `Condensar a ${t(tr.tIni)}`;
  }
}

function formulaTramo(tr: Tramo): string {
  const m = formatNumber(tr.masaKg, 3);
  if (tr.tipo === 'sensible') {
    return `Q = m · c · ΔT = ${m} · ${formatNumber(tr.coeficiente, 0)} · ${formatNumber(tr.tFin - tr.tIni, 1)}`;
  }
  const signo = tr.calor < 0 ? '−' : '';
  if (tr.fraccion < 1) {
    return `Q = ${signo}f · m · L = ${signo}${formatNumber(tr.fraccion, 4)} · ${m} · ${formatNumber(tr.coeficiente, 0)}`;
  }
  return `Q = ${signo}m · L = ${signo}${m} · ${formatNumber(tr.coeficiente, 0)}`;
}

function formatCalor(j: number): string {
  const abs = Math.abs(j);
  if (abs >= 1_000_000) return `${formatNumber(j / 1_000_000, 3)} MJ`;
  if (abs >= 1000) return `${formatNumber(j / 1000, 2)} kJ`;
  return `${formatNumber(j, 1)} J`;
}

function formatTiempo(segundos: number): string {
  if (!isFinite(segundos) || segundos <= 0) return '—';
  if (segundos < 60) return `${formatNumber(segundos, 1)} s`;
  if (segundos < 3600) {
    const min = Math.floor(segundos / 60);
    return `${min} min ${Math.round(segundos - min * 60)} s`;
  }
  const h = Math.floor(segundos / 3600);
  return `${h} h ${Math.round((segundos - h * 3600) / 60)} min`;
}

// ============================================================
// Problemas precargados
// ============================================================
const PRESETS_CALENTAR = [
  { id: 'clasico', nombre: 'Hielo a −10 °C hasta vapor a 120 °C', sustanciaId: 'agua', masaG: 200, t0: -10, t1: 120 },
  { id: 'hervidor', nombre: 'Hervir 1,5 L de agua del grifo', sustanciaId: 'agua', masaG: 1500, t0: 15, t1: 100 },
  { id: 'plomo', nombre: 'Fundir medio kilo de plomo', sustanciaId: 'plomo', masaG: 500, t0: 25, t1: 400 },
  { id: 'sarten', nombre: 'Calentar una sartén de hierro', sustanciaId: 'hierro', masaG: 1200, t0: 20, t1: 200 },
];

const PRESETS_MEZCLA = [
  {
    id: 'cubito',
    nombre: 'Un cubito de hielo en un vaso de agua',
    a: { sustanciaId: 'agua', masaG: 30, temperatura: -5 },
    b: { sustanciaId: 'agua', masaG: 250, temperatura: 25 },
  },
  {
    id: 'demasiado-hielo',
    nombre: 'Demasiado hielo: se queda en 0 °C',
    a: { sustanciaId: 'agua', masaG: 300, temperatura: -10 },
    b: { sustanciaId: 'agua', masaG: 200, temperatura: 20 },
  },
  {
    id: 'cuchara',
    nombre: 'Cuchara de hierro al rojo en agua',
    a: { sustanciaId: 'hierro', masaG: 150, temperatura: 300 },
    b: { sustanciaId: 'agua', masaG: 500, temperatura: 20 },
  },
  {
    id: 'cafe',
    nombre: 'Café caliente con leche de la nevera',
    a: { sustanciaId: 'agua', masaG: 200, temperatura: 85 },
    b: { sustanciaId: 'agua', masaG: 50, temperatura: 5 },
  },
];

// Lienzo de la curva de calentamiento
const SVG_W = 720;
const SVG_H = 340;
const MARGEN = { top: 24, right: 24, bottom: 46, left: 68 };

export default function SimuladorCalorimetria() {
  const [modo, setModo] = useState<'calentar' | 'mezclar'>('calentar');

  // Modo calentamiento
  const [sustanciaId, setSustanciaId] = useState('agua');
  const [masaG, setMasaG] = useState(200);
  const [tInicial, setTInicial] = useState(-10);
  const [tFinal, setTFinal] = useState(120);
  const [potencia, setPotencia] = useState(2000);

  // Modo mezcla
  const [cuerpoA, setCuerpoA] = useState<Cuerpo>({ sustanciaId: 'agua', masaG: 30, temperatura: -5 });
  const [cuerpoB, setCuerpoB] = useState<Cuerpo>({ sustanciaId: 'agua', masaG: 250, temperatura: 25 });

  const sustancia = sustanciaPorId(sustanciaId);
  const rango = rangoSustancia(sustancia);

  const t0Valido = Math.min(Math.max(tInicial, rango.min), rango.max);
  const t1Valido = Math.min(Math.max(tFinal, rango.min), rango.max);
  const fueraDeRango = t0Valido !== tInicial || t1Valido !== tFinal;

  const tramos = useMemo(
    () => calcularTramos(sustancia, masaG / 1000, t0Valido, t1Valido),
    [sustancia, masaG, t0Valido, t1Valido],
  );

  const calorTotal = useMemo(() => tramos.reduce((acc, t) => acc + t.calor, 0), [tramos]);
  const calorLatente = useMemo(
    () => tramos.filter((t) => t.tipo === 'latente').reduce((acc, t) => acc + t.calor, 0),
    [tramos],
  );

  const mezcla = useMemo(() => {
    const sa = sustanciaPorId(cuerpoA.sustanciaId);
    const sb = sustanciaPorId(cuerpoB.sustanciaId);
    const ra = rangoSustancia(sa);
    const rb = rangoSustancia(sb);
    const ta = Math.min(Math.max(cuerpoA.temperatura, ra.min), ra.max);
    const tb = Math.min(Math.max(cuerpoB.temperatura, rb.min), rb.max);
    if (cuerpoA.masaG <= 0 || cuerpoB.masaG <= 0) return null;
    return { sa, sb, ta, tb, ...resolverMezcla(sa, cuerpoA.masaG / 1000, ta, sb, cuerpoB.masaG / 1000, tb) };
  }, [cuerpoA, cuerpoB]);

  // Curva de temperatura frente a calor acumulado
  const curva = useMemo(() => {
    const puntos: { q: number; t: number }[] = [{ q: 0, t: t0Valido }];
    let acumulado = 0;
    for (const tr of tramos) {
      acumulado += Math.abs(tr.calor);
      puntos.push({ q: acumulado, t: tr.tFin });
    }
    const qMax = Math.max(acumulado, 1);
    const temps = puntos.map((p) => p.t);
    const tMin = Math.min(...temps);
    const tMax = Math.max(...temps);
    const span = tMax - tMin || 1;
    const ancho = SVG_W - MARGEN.left - MARGEN.right;
    const alto = SVG_H - MARGEN.top - MARGEN.bottom;
    const px = (q: number) => MARGEN.left + (q / qMax) * ancho;
    const py = (t: number) => MARGEN.top + alto - ((t - tMin) / span) * alto;
    return {
      puntos,
      tMin,
      tMax,
      path: puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.q).toFixed(1)} ${py(p.t).toFixed(1)}`).join(' '),
      px,
      py,
    };
  }, [tramos, t0Valido]);

  const handlePresetCalentar = (p: (typeof PRESETS_CALENTAR)[number]) => {
    setSustanciaId(p.sustanciaId);
    setMasaG(p.masaG);
    setTInicial(p.t0);
    setTFinal(p.t1);
  };

  const handlePresetMezcla = (p: (typeof PRESETS_MEZCLA)[number]) => {
    setCuerpoA({ ...p.a });
    setCuerpoB({ ...p.b });
  };

  const editorCuerpo = (etiqueta: string, cuerpo: Cuerpo, setCuerpo: (c: Cuerpo) => void, idBase: string) => {
    const s = sustanciaPorId(cuerpo.sustanciaId);
    const r = rangoSustancia(s);
    return (
      <div className={styles.cuerpoCard}>
        <h3 className={styles.cuerpoTitulo}>{etiqueta}</h3>
        <div className={styles.inputGroup}>
          <label htmlFor={`${idBase}-sustancia`}>Sustancia</label>
          <select
            id={`${idBase}-sustancia`}
            className={styles.select}
            value={cuerpo.sustanciaId}
            onChange={(ev) => setCuerpo({ ...cuerpo, sustanciaId: ev.target.value })}
          >
            {SUSTANCIAS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor={`${idBase}-masa`}>Masa (g)</label>
          <input
            id={`${idBase}-masa`}
            type="number"
            inputMode="decimal"
            min={1}
            step={10}
            className={styles.numberInput}
            value={cuerpo.masaG}
            onChange={(ev) => setCuerpo({ ...cuerpo, masaG: Math.max(Number(ev.target.value) || 0, 0) })}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor={`${idBase}-temp`}>Temperatura inicial (°C)</label>
          <input
            id={`${idBase}-temp`}
            type="number"
            inputMode="decimal"
            step={1}
            className={styles.numberInput}
            value={cuerpo.temperatura}
            onChange={(ev) => setCuerpo({ ...cuerpo, temperatura: Number(ev.target.value) || 0 })}
          />
          <span className={styles.inputHint}>
            Con datos entre {formatNumber(r.min, 1)} °C y {formatNumber(r.max, 0)} °C
          </span>
        </div>
      </div>
    );
  };

  const listaTramos = (ts: Tramo[], titulo: string) => (
    <div className={styles.tramosBloque}>
      <h3 className={styles.resultTitle}>{titulo}</h3>
      {ts.length === 0 ? (
        <p className={styles.resultNota}>Este cuerpo ya está a la temperatura de equilibrio: no intercambia calor.</p>
      ) : (
        <ol className={styles.tramosLista}>
          {ts.map((tr, i) => (
            <li
              key={`${tr.proceso}-${tr.tIni}-${i}`}
              className={tr.tipo === 'latente' ? styles.tramoLatente : styles.tramoSensible}
            >
              <div className={styles.tramoCabecera}>
                <span className={styles.tramoEtiqueta}>
                  <span className={styles.tramoFase}>{tr.nombreFase}</span>
                  {etiquetaTramo(tr)}
                </span>
                <span className={styles.tramoCalor}>{formatCalor(tr.calor)}</span>
              </div>
              <code className={styles.tramoFormula}>{formulaTramo(tr)}</code>
            </li>
          ))}
        </ol>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de calorimetría</h1>
        <p>
          El calor tramo a tramo para calentar, fundir y evaporar, y la temperatura de equilibrio al
          mezclar dos cuerpos — con el problema desarrollado paso a paso
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.modoSelector} role="group" aria-label="Tipo de problema">
          <button
            type="button"
            className={`${styles.modoBtn} ${modo === 'calentar' ? styles.modoBtnActivo : ''}`}
            aria-pressed={modo === 'calentar'}
            onClick={() => setModo('calentar')}
          >
            <span aria-hidden="true">🔥</span> Calentar o enfriar una sustancia
          </button>
          <button
            type="button"
            className={`${styles.modoBtn} ${modo === 'mezclar' ? styles.modoBtnActivo : ''}`}
            aria-pressed={modo === 'mezclar'}
            onClick={() => setModo('mezclar')}
          >
            <span aria-hidden="true">🧊</span> Mezclar dos cuerpos
          </button>
        </div>

        {modo === 'calentar' ? (
          <>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Datos del problema</h2>

              <div className={styles.sustanciasGrid}>
                {SUSTANCIAS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.sustanciaBtn} ${s.id === sustanciaId ? styles.sustanciaBtnActivo : ''}`}
                    aria-pressed={s.id === sustanciaId}
                    onClick={() => setSustanciaId(s.id)}
                  >
                    <span className={styles.sustanciaIcono} aria-hidden="true">
                      {s.icono}
                    </span>
                    <span className={styles.sustanciaNombre}>{s.nombre}</span>
                    <span className={styles.sustanciaDato}>
                      c = {formatNumber(s.cLiquido ?? s.cSolido ?? 0, 0)} J/(kg·K)
                    </span>
                  </button>
                ))}
              </div>

              <p className={styles.sustanciaNota}>{sustancia.nota}</p>

              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="masa">
                    Masa
                    <span className={styles.valueBadge}>{formatNumber(masaG / 1000, 3)} kg</span>
                  </label>
                  <input
                    id="masa"
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step={10}
                    className={styles.numberInput}
                    value={masaG}
                    onChange={(ev) => setMasaG(Math.max(Number(ev.target.value) || 0, 0))}
                  />
                  <span className={styles.inputHint}>En gramos. Un litro de agua son 1.000 g.</span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="t-inicial">Temperatura inicial (°C)</label>
                  <input
                    id="t-inicial"
                    type="number"
                    inputMode="decimal"
                    step={1}
                    className={styles.numberInput}
                    value={tInicial}
                    onChange={(ev) => setTInicial(Number(ev.target.value) || 0)}
                  />
                  <span className={styles.inputHint}>
                    Con datos entre {formatNumber(rango.min, 1)} °C y {formatNumber(rango.max, 0)} °C
                  </span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="t-final">Temperatura final (°C)</label>
                  <input
                    id="t-final"
                    type="number"
                    inputMode="decimal"
                    step={1}
                    className={styles.numberInput}
                    value={tFinal}
                    onChange={(ev) => setTFinal(Number(ev.target.value) || 0)}
                  />
                  <span className={styles.inputHint}>
                    {sustancia.tFusion !== undefined
                      ? `Funde a ${formatNumber(sustancia.tFusion, 1)} °C${
                          sustancia.tEbullicion !== undefined
                            ? ` y hierve a ${formatNumber(sustancia.tEbullicion, 1)} °C`
                            : ''
                        }`
                      : 'Sin cambios de estado modelados'}
                  </span>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="potencia">
                    Potencia del aparato
                    <span className={styles.valueBadge}>{formatNumber(potencia, 0)} W</span>
                  </label>
                  <input
                    id="potencia"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={100}
                    className={styles.numberInput}
                    value={potencia}
                    onChange={(ev) => setPotencia(Math.max(Number(ev.target.value) || 0, 0))}
                  />
                  <span className={styles.inputHint}>
                    Para estimar cuánto tardaría. Un hervidor doméstico ronda los 2.000 W.
                  </span>
                </div>
              </div>

              {fueraDeRango && (
                <div className={styles.aviso} role="alert" aria-live="polite">
                  <strong>Temperatura ajustada al rango con datos.</strong>
                  <span>
                    {sustancia.nombre} se modela entre {formatNumber(rango.min, 1)} °C y{' '}
                    {formatNumber(rango.max, 0)} °C
                    {sustancia.cGas === undefined && sustancia.tEbullicion !== undefined
                      ? ': no se incluyen valores de su fase gaseosa, así que el cálculo se detiene al hervir.'
                      : '. El cálculo usa los valores recortados a ese intervalo.'}
                  </span>
                </div>
              )}

              <h3 className={styles.subPanelTitle}>Problemas típicos</h3>
              <div className={styles.presetsGrid}>
                {PRESETS_CALENTAR.map((p) => (
                  <button key={p.id} type="button" className={styles.presetBtn} onClick={() => handlePresetCalentar(p)}>
                    {p.nombre}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Resultado</h2>

              <div className={styles.totalBox}>
                <div className={styles.totalPrincipal}>
                  <span className={styles.totalLabel}>Calor total {calorTotal < 0 ? 'cedido' : 'necesario'}</span>
                  <span className={styles.totalValor}>{formatCalor(Math.abs(calorTotal))}</span>
                </div>
                <div className={styles.equivalencias}>
                  <div>
                    <span>{formatNumber(Math.abs(calorTotal), 0)}</span> julios
                  </div>
                  <div>
                    <span>{formatNumber(Math.abs(calorTotal) / 4184, 2)}</span> kcal
                  </div>
                  <div>
                    <span>{formatNumber(Math.abs(calorTotal) / 3_600_000, 4)}</span> kWh
                  </div>
                  <div>
                    <span>{potencia > 0 ? formatTiempo(Math.abs(calorTotal) / potencia) : '—'}</span> a{' '}
                    {formatNumber(potencia, 0)} W
                  </div>
                </div>
              </div>

              {tramos.length === 0 ? (
                <p className={styles.resultNota}>
                  Con la temperatura inicial igual a la final no hay intercambio de calor. Cambia una
                  de las dos para ver el desglose.
                </p>
              ) : (
                <>
                  {listaTramos(tramos, 'Desglose paso a paso')}

                  {calorLatente !== 0 && (
                    <p className={styles.resultNota}>
                      Los cambios de estado se llevan{' '}
                      <strong>{formatNumber((Math.abs(calorLatente) / Math.abs(calorTotal)) * 100, 1)} %</strong> del
                      total sin que el termómetro se mueva ni un grado.
                    </p>
                  )}

                  <h3 className={styles.subPanelTitle}>Curva de calentamiento</h3>
                  <div className={styles.canvasWrapper}>
                    <svg
                      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                      className={styles.canvasSvg}
                      role="img"
                      aria-label={`Curva de temperatura frente a calor aportado, de ${formatNumber(t0Valido, 1)} grados a ${formatNumber(t1Valido, 1)} grados con ${formatCalor(Math.abs(calorTotal))} en total`}
                    >
                      <line
                        x1={MARGEN.left}
                        y1={SVG_H - MARGEN.bottom}
                        x2={SVG_W - MARGEN.right}
                        y2={SVG_H - MARGEN.bottom}
                        className={styles.eje}
                      />
                      <line
                        x1={MARGEN.left}
                        y1={MARGEN.top}
                        x2={MARGEN.left}
                        y2={SVG_H - MARGEN.bottom}
                        className={styles.eje}
                      />

                      {[curva.tMin, (curva.tMin + curva.tMax) / 2, curva.tMax].map((t, i) => (
                        <g key={`marca-${i}`}>
                          <line
                            x1={MARGEN.left - 4}
                            y1={curva.py(t)}
                            x2={SVG_W - MARGEN.right}
                            y2={curva.py(t)}
                            className={styles.rejilla}
                          />
                          <text x={MARGEN.left - 8} y={curva.py(t) + 4} className={styles.ejeTexto} textAnchor="end">
                            {formatNumber(t, 0)} °C
                          </text>
                        </g>
                      ))}

                      <path d={curva.path} className={styles.curva} />

                      {curva.puntos.map((p, i) => (
                        <circle key={`p-${i}`} cx={curva.px(p.q)} cy={curva.py(p.t)} r={4} className={styles.puntoCurva} />
                      ))}

                      <text x={(SVG_W + MARGEN.left) / 2} y={SVG_H - 12} className={styles.ejeTitulo} textAnchor="middle">
                        Calor aportado, hasta {formatCalor(Math.abs(calorTotal))} en total
                      </text>
                    </svg>
                  </div>
                  <p className={styles.canvasNota}>
                    Los tramos inclinados son calor sensible: sube la temperatura. Los horizontales
                    son las mesetas de cambio de estado, donde entra energía y el termómetro no se
                    mueve.
                  </p>
                </>
              )}
            </section>
          </>
        ) : (
          <>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Los dos cuerpos</h2>
              <div className={styles.cuerposGrid}>
                {editorCuerpo('Cuerpo A', cuerpoA, setCuerpoA, 'a')}
                {editorCuerpo('Cuerpo B', cuerpoB, setCuerpoB, 'b')}
              </div>

              <h3 className={styles.subPanelTitle}>Problemas típicos</h3>
              <div className={styles.presetsGrid}>
                {PRESETS_MEZCLA.map((p) => (
                  <button key={p.id} type="button" className={styles.presetBtn} onClick={() => handlePresetMezcla(p)}>
                    {p.nombre}
                  </button>
                ))}
              </div>

              <p className={styles.resultNota}>
                Se supone un calorímetro ideal: todo el calor que cede un cuerpo lo absorbe el otro,
                sin pérdidas al ambiente ni recipiente que se caliente.
              </p>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Resultado</h2>

              {mezcla === null ? (
                <p className={styles.resultNota}>Indica una masa mayor que cero en los dos cuerpos.</p>
              ) : (
                <>
                  <div className={styles.totalBox}>
                    <div className={styles.totalPrincipal}>
                      <span className={styles.totalLabel}>Temperatura de equilibrio</span>
                      <span className={styles.totalValor}>{formatNumber(mezcla.tEquilibrio, 2)} °C</span>
                    </div>
                    <div className={styles.equivalencias}>
                      <div>
                        <span>{formatCalor(Math.abs(mezcla.calorA))}</span>{' '}
                        {mezcla.calorA >= 0 ? 'los absorbe A' : 'los cede A'}
                      </div>
                      <div>
                        <span>{formatCalor(Math.abs(mezcla.calorB))}</span>{' '}
                        {mezcla.calorB >= 0 ? 'los absorbe B' : 'los cede B'}
                      </div>
                      <div>
                        <span>
                          {formatNumber(Math.min(mezcla.ta, mezcla.tb), 1)} … {formatNumber(Math.max(mezcla.ta, mezcla.tb), 1)} °C
                        </span>{' '}
                        intervalo donde tiene que caer
                      </div>
                    </div>
                  </div>

                  {mezcla.parcial && (
                    <div className={styles.avisoDestacado} role="status" aria-live="polite">
                      <strong>
                        <span aria-hidden="true">🧊</span> El cambio de estado se queda a medias
                      </strong>
                      <span>
                        Solo el {formatNumber(mezcla.parcial.fraccion * 100, 1)} % del cuerpo{' '}
                        {mezcla.parcial.cuerpo} completa la {NOMBRE_PROCESO[mezcla.parcial.proceso]}:{' '}
                        {formatNumber(mezcla.parcial.masaCambiadaG, 1)} g pasan a{' '}
                        {mezcla.parcial.nombreCambiado} y quedan {formatNumber(mezcla.parcial.masaRestanteG, 1)} g de{' '}
                        {mezcla.parcial.nombreRestante}. Mientras convivan las dos fases la
                        temperatura no se mueve de {formatNumber(mezcla.tEquilibrio, 1)} °C, y por eso
                        el resultado no es un número de grados cualquiera sino justo el del cambio de
                        estado.
                      </span>
                    </div>
                  )}

                  <div className={styles.balanceGrid}>
                    {listaTramos(mezcla.tramosA, `Cuerpo A · ${mezcla.sa.nombre} desde ${formatNumber(mezcla.ta, 1)} °C`)}
                    {listaTramos(mezcla.tramosB, `Cuerpo B · ${mezcla.sb.nombre} desde ${formatNumber(mezcla.tb, 1)} °C`)}
                  </div>

                  <p className={styles.resultNota}>
                    El balance se plantea como Q<sub>A</sub> + Q<sub>B</sub> = 0: lo que uno cede, con
                    signo negativo, es exactamente lo que el otro absorbe. Aquí suman{' '}
                    {formatCalor(Math.abs(mezcla.calorA + mezcla.calorB))}, que es solo el redondeo
                    del cálculo.
                  </p>
                </>
              )}
            </section>
          </>
        )}

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos de las sustancias</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Sustancia</th>
                  <th>c sólido</th>
                  <th>c líquido</th>
                  <th>Funde a</th>
                  <th>L fusión</th>
                  <th>Hierve a</th>
                  <th>L vaporización</th>
                </tr>
              </thead>
              <tbody>
                {SUSTANCIAS.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span aria-hidden="true">{s.icono}</span> {s.nombre}
                    </td>
                    <td>{s.cSolido !== undefined ? formatNumber(s.cSolido, 0) : '—'}</td>
                    <td>{s.cLiquido !== undefined ? formatNumber(s.cLiquido, 0) : '—'}</td>
                    <td>{s.tFusion !== undefined ? `${formatNumber(s.tFusion, 1)} °C` : '—'}</td>
                    <td>{s.lFusion !== undefined ? `${formatNumber(s.lFusion / 1000, 0)} kJ/kg` : '—'}</td>
                    <td>{s.tEbullicion !== undefined ? `${formatNumber(s.tEbullicion, 1)} °C` : '—'}</td>
                    <td>{s.lVaporizacion !== undefined ? `${formatNumber(s.lVaporizacion / 1000, 0)} kJ/kg` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.resultNota}>
            Calores específicos en J/(kg·K) a presión atmosférica normal. Fuente:{' '}
            <em>CRC Handbook of Chemistry and Physics</em>, 97.ª edición, con los redondeos habituales
            de los libros de texto. Un guion significa que esa fase no se modela por no haber un valor
            de manual suficientemente asentado.
          </p>
        </section>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Guía de calorimetría"
          subtitle="Calor sensible, calor latente y equilibrio térmico, con los errores que más puntos cuestan"
        >
          <p>
            La calorimetría se sostiene sobre dos fórmulas y una idea. Las fórmulas son Q = m·c·ΔT
            para cuando cambia la temperatura y Q = m·L para cuando cambia el estado. La idea es que
            nunca se aplican las dos a la vez: mientras el hielo se funde, la temperatura está clavada
            en 0 °C, y mientras el agua se calienta, no hay cambio de estado que pagar. Todo problema
            de calorimetría consiste en partir el camino en tramos y decidir qué fórmula toca en cada
            uno.
          </p>
          <p>
            El caso que mejor lo ilustra es el clásico de llevar hielo a −10 °C hasta vapor a 120 °C.
            Son cinco tramos, y el más caro con diferencia es la vaporización: cuesta más de cinco
            veces lo que calentar toda el agua de 0 °C a 100 °C. Esa desproporción explica por qué
            sudar refrigera tan bien y por qué una quemadura con vapor es mucho peor que una con agua
            hirviendo.
          </p>

          <h3 className={styles.eduSubtitle}>Las fórmulas y cuándo se usa cada una</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Situación</th>
                  <th>Fórmula</th>
                  <th>Qué cambia</th>
                  <th>En la curva</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Calentar o enfriar sin cambiar de estado</td>
                  <td>Q = m·c·ΔT</td>
                  <td>La temperatura</td>
                  <td>Tramo inclinado</td>
                </tr>
                <tr>
                  <td>Fundir un sólido</td>
                  <td>
                    Q = m·L<sub>f</sub>
                  </td>
                  <td>El estado, no la temperatura</td>
                  <td>Meseta horizontal</td>
                </tr>
                <tr>
                  <td>Evaporar un líquido</td>
                  <td>
                    Q = m·L<sub>v</sub>
                  </td>
                  <td>El estado, no la temperatura</td>
                  <td>Meseta horizontal, la más larga</td>
                </tr>
                <tr>
                  <td>Solidificar o condensar</td>
                  <td>Q = −m·L</td>
                  <td>El estado; ahora cede calor</td>
                  <td>La misma meseta al revés</td>
                </tr>
                <tr>
                  <td>Mezclar dos cuerpos</td>
                  <td>ΣQ = 0</td>
                  <td>Ambos hasta igualarse</td>
                  <td>
                    Convergen en T<sub>eq</sub>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Cuatro situaciones que conviene distinguir</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Solo calor sensible</h4>
              <p>
                El camino no cruza ningún punto de fusión ni de ebullición. Es el caso más sencillo:
                una sola aplicación de Q = m·c·ΔT y listo. Calentar agua de 20 °C a 80 °C entra aquí.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Con cambio de estado completo</h4>
              <p>
                El camino cruza una meseta entera. Hay que sumar el calor sensible de cada fase más el
                latente de cada cambio. El error típico es olvidar que el calor específico del hielo
                (2.090) no es el del agua líquida (4.180).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Cambio de estado a medias</h4>
              <p>
                El caso más traicionero: se echa tanto hielo que el agua no tiene energía para
                fundirlo todo. El equilibrio se queda clavado en 0 °C con hielo flotando, y la
                respuesta no es una temperatura sino una proporción.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Mezcla sin cambio de estado</h4>
              <p>
                Se resuelve con la media ponderada por m·c: T<sub>eq</sub> = (m₁c₁T₁ + m₂c₂T₂)/(m₁c₁ +
                m₂c₂). Esa fórmula abreviada solo vale aquí; si hay hielo de por medio, engaña.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Calor y temperatura son lo mismo?</strong>
              <p>
                No. La temperatura mide la energía cinética media de las moléculas; el calor es energía
                en tránsito de un cuerpo a otro. Una bañera a 30 °C contiene muchísima más energía
                térmica que una taza a 90 °C, aunque su temperatura sea menor.
              </p>
              <p className={styles.faqTip}>
                Por eso en las fórmulas aparece siempre la masa: sin ella, la temperatura no dice
                cuánta energía hay.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el calor específico del hielo es distinto del agua?</strong>
              <p>
                Porque son estructuras distintas. En el hielo las moléculas están fijas en una red y
                solo pueden vibrar; en el líquido pueden además rotar y desplazarse, y esos grados de
                libertad extra absorben energía. De ahí que el agua líquida necesite el doble: 4.180
                frente a 2.090 J/(kg·K).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué signo lleva el calor en el balance de una mezcla?</strong>
              <p>
                El criterio habitual es positivo cuando el cuerpo lo absorbe y negativo cuando lo cede,
                y con él el balance se escribe Q₁ + Q₂ = 0. Si prefieres escribir Q<sub>cedido</sub> =
                Q<sub>absorbido</sub>, ambos van en valor absoluto. Lo que no se puede es mezclar los
                dos convenios en la misma ecuación.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué mi resultado no coincide con el experimento de clase?</strong>
              <p>
                Porque el calorímetro real absorbe parte del calor y algo se escapa al ambiente. En el
                laboratorio se corrige con el equivalente en agua del calorímetro, un dato que se mide
                antes. Los cálculos de aquí suponen calorímetro ideal, que es la hipótesis de los
                enunciados de clase.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Una caloría es lo mismo que una caloría de los alimentos?</strong>
              <p>
                No: la caloría de las etiquetas es en realidad una kilocaloría, mil veces mayor. Una
                caloría física son 4,184 J, la energía que sube un grado a un gramo de agua. Un
                bocadillo de 400 kcal equivale a 1,67 MJ, de sobra para llevar cuatro litros de agua de
                20 °C a ebullición.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Se puede tener agua líquida por encima de 100 °C?</strong>
              <p>
                Sí, subiendo la presión: en una olla a presión el agua hierve hacia los 120 °C, y por
                eso cuece antes. Los datos de este simulador son a presión atmosférica normal, que es
                lo que suponen los problemas salvo que digan lo contrario.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo resolver un problema de calorimetría</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Sitúa el punto de partida y el de llegada</strong>
                <p>
                  Anota temperatura inicial, temperatura final y en qué estado está la sustancia en
                  cada una. Casi todo el problema se decide aquí.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Marca los cambios de estado que hay por el camino</strong>
                <p>
                  Para el agua, 0 °C y 100 °C. Si el intervalo los cruza, ahí van las mesetas y el
                  problema se parte en tramos.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Calcula cada tramo por separado</strong>
                <p>
                  Q = m·c·ΔT en los inclinados, con el calor específico de la fase que corresponda, y
                  Q = m·L en las mesetas. Nunca los mezcles en una sola cuenta.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Suma y comprueba el orden de magnitud</strong>
                <p>
                  Evaporar agua cuesta unos 2.257 kJ por kilo. Si tu total para un vaso de agua sale de
                  unos pocos julios o de varios gigajulios, hay un error de unidades.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>En las mezclas, comprueba si el cambio de estado se completa</strong>
                <p>
                  Calcula cuánta energía puede ceder el cuerpo caliente hasta llegar a la meseta y
                  compárala con la que hace falta para fundir todo el hielo. Si no llega, la respuesta
                  es 0 °C con hielo sobrante.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Responde a lo que pregunta el enunciado</strong>
                <p>
                  A veces piden julios, a veces kilocalorías y a veces el tiempo con una potencia dada.
                  Convertir al final es más seguro que arrastrar unidades raras por el camino.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ⚖️
              </span>
              <div>
                <strong>Pasa las masas a kilogramos</strong>
                <p>
                  Los calores específicos de manual vienen en J/(kg·K). Con gramos, el resultado sale
                  mil veces mayor.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🌡️
              </span>
              <div>
                <strong>Los incrementos valen igual en °C que en K</strong>
                <p>
                  Un salto de 20 °C es un salto de 20 K. Solo hay que convertir cuando la temperatura
                  aparece sola, no como diferencia.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📊
              </span>
              <div>
                <strong>Dibuja la curva antes de calcular</strong>
                <p>
                  Un croquis de temperatura frente a calor deja a la vista cuántos tramos hay. Es el
                  mejor seguro contra olvidar una meseta.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔍
              </span>
              <div>
                <strong>Comprueba el signo al final</strong>
                <p>
                  Si un cuerpo se enfría, su Q tiene que salir negativo. Un balance donde los dos
                  cuerpos absorben calor es imposible.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧊
              </span>
              <div>
                <strong>Con hielo, sospecha siempre</strong>
                <p>
                  Antes de aplicar la media ponderada, verifica que hay energía de sobra para fundirlo
                  entero. Es el error que más se repite en los exámenes.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📐
              </span>
              <div>
                <strong>Redondea solo al final</strong>
                <p>
                  Arrastrar decimales cortados por cinco tramos distintos desplaza el resultado más de
                  lo que parece.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              Errores frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                Usar el calor específico del agua líquida para el hielo o para el vapor. Son tres
                valores distintos: 2.090, 4.180 y 2.010 J/(kg·K).
              </li>
              <li>
                Aplicar Q = m·c·ΔT durante un cambio de estado. En la meseta ΔT es cero y la fórmula
                daría cero calor, justo lo contrario de lo que ocurre.
              </li>
              <li>
                Aplicar la fórmula de la media ponderada cuando hay hielo. Solo vale si ninguna de las
                dos sustancias cambia de estado.
              </li>
              <li>
                Olvidar el calor latente de vaporización, que en el agua es 5,4 veces mayor que
                calentar toda el agua de 0 °C a 100 °C.
              </li>
              <li>
                Trabajar en gramos con calores específicos dados en kilogramos, o mezclar calorías con
                julios a mitad del problema.
              </li>
              <li>
                Dar por bueno un equilibrio fuera del intervalo de las dos temperaturas iniciales. La
                temperatura final siempre queda entre ambas.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-calorimetria')} />
        <ShareCard appName="simulador-calorimetria" />
      </main>

      <Footer appName="simulador-calorimetria" />
    </div>
  );
}
