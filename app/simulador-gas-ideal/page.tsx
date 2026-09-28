'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatPercentage } from '@/lib';
import styles from './SimuladorGasIdeal.module.css';
// Toda la física vive en ./motor.ts (28/09/2026): la ecuación de estado, los procesos y los
// ciclos, con sus validaciones. Los casos para clase (./casos.ts) corrigen con la MISMA
// aritmética que pintan las pestañas; aquí solo se pinta.
import {
  R,
  ATM_TO_PA,
  L_TO_M3,
  calcularGasIdeal,
  errorGasIdeal,
  calcularProceso,
  errorProceso,
  molesDelEstado,
  curvaProceso,
  escalaDiagrama,
  calcularCiclo,
  errorCiclo,
  type CalcVar,
  type Proceso,
  type Ciclo,
  type PuntoPV,
  type EscalaPV,
  type EntradaProceso,
  type ResultadoProceso,
  type EntradaCiclo,
  type ResultadoCiclo,
} from './motor';
import CasosAula from './CasosAula';

type Tab = 'gas-ideal' | 'procesos' | 'ciclos';

interface Molecula {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// ---------- Campos numéricos ----------

/**
 * Lo que hay en un campo numérico: NaN si está vacío o a medio escribir, nunca 0. Con
 * `Number(e.target.value)` un campo vaciado valía 0 y la app calculaba con un gas sin moles
 * (hallazgo 2357); ahora el motor lo rechaza con un aviso.
 */
function leerCampo(e: React.ChangeEvent<HTMLInputElement>): number {
  return e.target.valueAsNumber;
}

/** Lo que se pinta en un campo: vacío si no hay número. */
function mostrarCampo(valor: number): number | '' {
  return Number.isFinite(valor) ? valor : '';
}

/**
 * Un valor CALCULADO que se enseña en un campo, con 6 cifras significativas: las justas para
 * que, cuando pasa a ser dato (hallazgo 2358), despejar de vuelta devuelva el valor de partida
 * a la precisión que imprime el panel (11,2 L → 2,00114 atm → 11,200 L).
 */
function valorDeCampo(valor: number): number {
  return Number(valor.toPrecision(6));
}

/** Una cifra del panel, o «—» si no la hay: nunca «No definido» ni un número inventado. */
function cifra(valor: number, decimales: number): string {
  return Number.isFinite(valor) ? formatNumber(valor, decimales) : '—';
}

/** Cifra sin ceros de relleno, para los datos del gas: «1,4», «1,67». */
function cifraCorta(valor: number): string {
  return (valor + 0).toLocaleString('es-ES', { maximumFractionDigits: 3 });
}

// ---------- Diagrama P-V (común a Procesos y Ciclos) ----------

const SVG_W = 500;
const SVG_H = 380;
const PAD_L = 60;
const PAD_R = 25;
const PAD_T = 25;
const PAD_B = 50;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

/** Escala de un diagrama sin puntos: solo sirve para no dividir por cero. */
const ESCALA_VACIA: EscalaPV = { Vmin: 0, Vmax: 1, Pmin: 0, Pmax: 1 };

function useEjes(escala: EscalaPV | null) {
  const e = escala ?? ESCALA_VACIA;
  const toX = useCallback(
    (V_m3: number): number => PAD_L + ((V_m3 - e.Vmin) / (e.Vmax - e.Vmin)) * PLOT_W,
    [e.Vmin, e.Vmax],
  );
  const toY = useCallback(
    (P_Pa: number): number => PAD_T + PLOT_H - ((P_Pa - e.Pmin) / (e.Pmax - e.Pmin)) * PLOT_H,
    [e.Pmin, e.Pmax],
  );
  return { toX, toY };
}

/** Rejilla, ejes, rótulos y las cuatro cifras de los extremos (solo si hay escala). */
function MarcoDiagrama({ escala }: { escala: EscalaPV | null }): React.ReactElement {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => {
        const y = PAD_T + (PLOT_H * (i + 1)) / 5;
        return <line key={`gh${i}`} className={styles.pvGrid} x1={PAD_L} x2={PAD_L + PLOT_W} y1={y} y2={y} />;
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = PAD_L + (PLOT_W * (i + 1)) / 5;
        return <line key={`gv${i}`} className={styles.pvGrid} x1={x} x2={x} y1={PAD_T} y2={PAD_T + PLOT_H} />;
      })}

      <line className={styles.pvAxis} x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} />
      <line className={styles.pvAxis} x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} />

      <text className={styles.pvAxisLabel} x={PAD_L + PLOT_W / 2} y={SVG_H - 12} textAnchor="middle">
        V (L)
      </text>
      <text
        className={styles.pvAxisLabel}
        x={18}
        y={PAD_T + PLOT_H / 2}
        textAnchor="middle"
        transform={`rotate(-90 18 ${PAD_T + PLOT_H / 2})`}
      >
        P (atm)
      </text>

      {escala ? (
        <>
          <text className={styles.pvAxisLabel} x={PAD_L} y={PAD_T + PLOT_H + 15} textAnchor="middle">
            {formatNumber(escala.Vmin / L_TO_M3, 1)}
          </text>
          <text className={styles.pvAxisLabel} x={PAD_L + PLOT_W} y={PAD_T + PLOT_H + 15} textAnchor="middle">
            {formatNumber(escala.Vmax / L_TO_M3, 1)}
          </text>
          <text className={styles.pvAxisLabel} x={PAD_L - 8} y={PAD_T + PLOT_H + 4} textAnchor="end">
            {formatNumber(escala.Pmin / ATM_TO_PA, 2)}
          </text>
          <text className={styles.pvAxisLabel} x={PAD_L - 8} y={PAD_T + 8} textAnchor="end">
            {formatNumber(escala.Pmax / ATM_TO_PA, 2)}
          </text>
        </>
      ) : (
        <text className={styles.pvAxisLabel} x={PAD_L + PLOT_W / 2} y={PAD_T + PLOT_H / 2} textAnchor="middle">
          Sin diagrama: corrige los datos del panel
        </text>
      )}
    </>
  );
}

// ---------- TAB 1: Gas Ideal ----------

function GasIdealTab(): React.ReactElement {
  const [calcVar, setCalcVar] = useState<CalcVar>('P');
  // Inputs en unidades amigables: atm, L, K, mol. NaN = campo vacío.
  const [Patm, setPatm] = useState<number>(1);
  const [VL, setVL] = useState<number>(22.4);
  const [TK, setTK] = useState<number>(273.15);
  const [nMol, setNMol] = useState<number>(1);

  // Cálculo automático de la variable seleccionada, o el motivo por el que no se puede.
  const error = useMemo(() => errorGasIdeal(calcVar, Patm, VL, TK, nMol), [calcVar, Patm, VL, TK, nMol]);
  const calculado = useMemo(
    () => calcularGasIdeal(calcVar, Patm, VL, TK, nMol),
    [calcVar, Patm, VL, TK, nMol]
  );

  /**
   * Valor efectivo de cada variable: la despejada sale SOLO del cálculo, y sin cálculo no hay
   * valor (NaN → «—»). Antes caía al valor tecleado antes de despejarla, y «Estado actual»
   * enseñaba un P = 1 atm que no salía de ningún cálculo (hallazgo 2358).
   */
  const efectivo = (v: CalcVar, tecleado: number): number =>
    calcVar === v ? (calculado ?? NaN) : tecleado;
  const Pef = efectivo('P', Patm);
  const Vef = efectivo('V', VL);
  const Tef = efectivo('T', TK);
  const nef = efectivo('n', nMol);

  /** Lo que enseña cada campo: el calculado en el despejado (vacío si no lo hay), el tecleado en el resto. */
  const valorInput = (v: CalcVar, tecleado: number): number | '' =>
    calcVar === v ? (calculado !== null ? valorDeCampo(calculado) : '') : mostrarCampo(tecleado);

  /**
   * Al cambiar la variable que se despeja, la que se despejaba pasa a ser DATO con el valor que
   * enseñaba su campo. Antes recuperaba el tecleado antes de despejarla, así que no se podía
   * comprobar un resultado despejando otra variable: V = 11,2 L → P = 2,001 atm → al calcular V
   * salía 22,413 L en vez de 11,200 (hallazgo 2358).
   */
  function cambiarCalcVar(nueva: CalcVar) {
    const fijar: Record<CalcVar, (v: number) => void> = { P: setPatm, V: setVL, T: setTK, n: setNMol };
    fijar[calcVar](calculado !== null ? valorDeCampo(calculado) : NaN);
    setCalcVar(nueva);
  }

  // La animación necesita un estado físico: sin él, la caja de referencia (22,4 L y 0 °C).
  const Tanim = Number.isFinite(Tef) && Tef > 0 ? Tef : 273.15;
  const Vanim = Number.isFinite(Vef) && Vef > 0 ? Vef : 22.4;

  // Animación de moléculas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const moleculasRef = useRef<Molecula[]>([]);
  const animRef = useRef<number | null>(null);

  const N_MOLECULAS = 35;

  const initMoleculas = useCallback((width: number, height: number) => {
    const arr: Molecula[] = [];
    for (let i = 0; i < N_MOLECULAS; i += 1) {
      arr.push({
        x: 10 + Math.random() * (width - 20),
        y: 10 + Math.random() * (height - 20),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
      });
    }
    moleculasRef.current = arr;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    if (moleculasRef.current.length === 0) {
      initMoleculas(W, H);
    }

    // Velocidad media ∝ √T (escalada)
    const speedFactor = Math.sqrt(Math.max(50, Tanim) / 273.15) * 1.2;

    // Tamaño de la caja escalado al volumen relativo
    const Vref = 22.4;
    const scaleV = Math.min(1, Math.max(0.35, Math.sqrt(Vanim / Vref)));
    const boxW = W * scaleV;
    const boxH = H * scaleV;
    const boxX = (W - boxW) / 2;
    const boxY = (H - boxH) / 2;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      // Caja del gas
      ctx.strokeStyle = '#2E86AB';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = 'rgba(46, 134, 171, 0.05)';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      // Mover moléculas
      const arr = moleculasRef.current;
      for (let i = 0; i < arr.length; i += 1) {
        const m = arr[i];
        // Reescalar velocidad si T cambió (mantener dirección)
        const v = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        if (v > 0) {
          const target = speedFactor;
          if (Math.abs(v - target) > 0.05) {
            const k = target / v;
            m.vx *= k;
            m.vy *= k;
          }
        } else {
          m.vx = (Math.random() - 0.5) * speedFactor;
          m.vy = (Math.random() - 0.5) * speedFactor;
        }

        m.x += m.vx;
        m.y += m.vy;

        // Mantener moléculas dentro de la caja escalada
        if (m.x < boxX + 4) {
          m.x = boxX + 4;
          m.vx = -m.vx;
        }
        if (m.x > boxX + boxW - 4) {
          m.x = boxX + boxW - 4;
          m.vx = -m.vx;
        }
        if (m.y < boxY + 4) {
          m.y = boxY + 4;
          m.vy = -m.vy;
        }
        if (m.y > boxY + boxH - 4) {
          m.y = boxY + boxH - 4;
          m.vy = -m.vy;
        }

        // Dibujar molécula (color depende de T)
        const tColor = Math.min(1, Math.max(0, (Tanim - 100) / 800));
        const r = Math.floor(46 + tColor * 200);
        const g = Math.floor(134 - tColor * 80);
        const b = Math.floor(171 - tColor * 100);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [Tanim, Vanim, initMoleculas]);

  return (
    <div>
      <div className={styles.controlsPanel}>
        <div>
          <h3 className={styles.panelTitle}>Variables del gas</h3>
          <div className={styles.inputGroup} style={{ marginBottom: '0.85rem' }}>
            <label htmlFor="calcvar">
              <span>Calcular</span>
              <span className={styles.unitLabel}>variable a despejar</span>
            </label>
            <select
              id="calcvar"
              value={calcVar}
              onChange={(e) => cambiarCalcVar(e.target.value as CalcVar)}
            >
              <option value="P">Presión (P)</option>
              <option value="V">Volumen (V)</option>
              <option value="T">Temperatura (T)</option>
              <option value="n">Cantidad (n)</option>
            </select>
          </div>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="P">
                <span>P (atm)</span>
              </label>
              <input
                id="P"
                type="number"
                step="0.1"
                value={valorInput('P', Patm)}
                onChange={(e) => setPatm(leerCampo(e))}
                disabled={calcVar === 'P'}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="V">
                <span>V (L)</span>
              </label>
              <input
                id="V"
                type="number"
                step="0.5"
                value={valorInput('V', VL)}
                onChange={(e) => setVL(leerCampo(e))}
                disabled={calcVar === 'V'}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="T">
                <span>T (K)</span>
              </label>
              <input
                id="T"
                type="number"
                step="5"
                value={valorInput('T', TK)}
                onChange={(e) => setTK(leerCampo(e))}
                disabled={calcVar === 'T'}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="n">
                <span>n (mol)</span>
              </label>
              <input
                id="n"
                type="number"
                step="0.1"
                value={valorInput('n', nMol)}
                onChange={(e) => setNMol(leerCampo(e))}
                disabled={calcVar === 'n'}
              />
            </div>
          </div>

          <div className={styles.formulaBox}>
            <p className={styles.formulaTex}>P · V = n · R · T</p>
            <p className={styles.formulaCaption}>R = 8,314 J/(mol·K) = 0,0821 atm·L/(mol·K)</p>
          </div>

          {error && (
            <p className={styles.warningInline} role="alert">
              {error}
            </p>
          )}

          {calculado !== null && (
            <div className={styles.resultBlock}>
              <p className={styles.resultTitle}>Resultado</p>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>
                  {calcVar === 'P' && 'Presión P'}
                  {calcVar === 'V' && 'Volumen V'}
                  {calcVar === 'T' && 'Temperatura T'}
                  {calcVar === 'n' && 'Cantidad n'}
                </span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(calculado, calcVar === 'n' ? 4 : 3)}{' '}
                  {calcVar === 'P' && 'atm'}
                  {calcVar === 'V' && 'L'}
                  {calcVar === 'T' && 'K'}
                  {calcVar === 'n' && 'mol'}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Equivalencia</span>
                <span className={styles.resultValue}>
                  {calcVar === 'P' && `${formatNumber(calculado * ATM_TO_PA / 1000, 2)} kPa`}
                  {calcVar === 'V' && `${formatNumber(calculado * L_TO_M3 * 1000, 2)} dm³`}
                  {calcVar === 'T' && `${formatNumber(calculado - 273.15, 2)} °C`}
                  {calcVar === 'n' && `${formatNumber(calculado * 6.022, 3)} ×10²³ moléculas`}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.gasContainer}>
          <h3 className={styles.panelTitle}>Caja de gas (esquemática)</h3>
          <canvas
            ref={canvasRef}
            width={460}
            height={320}
            className={styles.moleculasCanvas}
          />
          <p className={styles.moleculasCaption}>
            Velocidad media ∝ √T · Tamaño caja ∝ √V · Color ∝ T
          </p>
          <div className={styles.resultBlock} style={{ width: '100%' }}>
            <p className={styles.resultTitle}>Estado actual</p>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>P</span>
              <span className={styles.resultValue}>{cifra(Pef, 3)} atm</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>V</span>
              <span className={styles.resultValue}>{cifra(Vef, 3)} L</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>T</span>
              <span className={styles.resultValue}>
                {Number.isFinite(Tef)
                  ? `${formatNumber(Tef, 2)} K (${formatNumber(Tef - 273.15, 1)} °C)`
                  : '— K'}
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>n</span>
              <span className={styles.resultValue}>{cifra(nef, 4)} mol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- TAB 2: Procesos ----------

function ProcesosTab(): React.ReactElement {
  const [proceso, setProceso] = useState<Proceso>('isotermo');
  // Estado inicial: P₁, V₁ y T₁ se teclean; n SALE de ellos (n = P₁V₁/RT₁, hallazgo 2352).
  const [P1atm, setP1atm] = useState<number>(1);
  const [V1L, setV1L] = useState<number>(10);
  const [T1K, setT1K] = useState<number>(300);
  const [V2L, setV2L] = useState<number>(20); // para isotermo y adiabático
  const [T2K, setT2K] = useState<number>(600); // para isobárico e isocórico
  const [gamma, setGamma] = useState<number>(1.4);

  const entrada = useMemo<EntradaProceso>(
    () => ({ proceso, P1atm, V1L, T1K, V2L, T2K, gamma }),
    [proceso, P1atm, V1L, T1K, V2L, T2K, gamma]
  );
  const error = useMemo(() => errorProceso(entrada), [entrada]);
  const resultado = useMemo<ResultadoProceso | null>(() => calcularProceso(entrada), [entrada]);
  // La n del estado inicial se enseña aunque el estado final no valga todavía.
  const nEstado = useMemo(() => molesDelEstado(P1atm, V1L, T1K), [P1atm, V1L, T1K]);

  // Curva P-V y escala: del MISMO estado que las cifras (hallazgos 2353 y 2362).
  const curvaPV = useMemo<PuntoPV[]>(
    () => (resultado ? curvaProceso(proceso, resultado) : []),
    [proceso, resultado]
  );
  const escala = useMemo(() => escalaDiagrama(curvaPV, 0.1, 0.1, 0.15), [curvaPV]);
  const { toX, toY } = useEjes(escala);

  const pathD = useMemo(() => {
    if (curvaPV.length === 0) return '';
    return curvaPV
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.V).toFixed(2)} ${toY(p.P).toFixed(2)}`)
      .join(' ');
  }, [curvaPV, toX, toY]);

  const procesoColorClass = {
    isotermo: styles.pvCurveIsoterm,
    isobaro: styles.pvCurveIsobar,
    isocoro: styles.pvCurveIsocor,
    adiabatico: styles.pvCurveAdiabat,
  }[proceso];

  const primero = curvaPV[0];
  const ultimo = curvaPV[curvaPV.length - 1];

  return (
    <div>
      <div className={styles.cicloSelector}>
        {(['isotermo', 'isobaro', 'isocoro', 'adiabatico'] as Proceso[]).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={proceso === p}
            className={`${styles.cicloCard} ${proceso === p ? styles.cicloCardActive : ''}`}
            onClick={() => setProceso(p)}
          >
            {p === 'isotermo' && 'Isotermo (T cte)'}
            {p === 'isobaro' && 'Isobárico (P cte)'}
            {p === 'isocoro' && 'Isocórico (V cte)'}
            {p === 'adiabatico' && 'Adiabático (Q=0)'}
          </button>
        ))}
      </div>

      <div className={styles.controlsPanel}>
        <div>
          <h3 className={styles.panelTitle}>Estado inicial</h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="P1">P₁ (atm)</label>
              <input
                id="P1"
                type="number"
                step="0.1"
                value={mostrarCampo(P1atm)}
                onChange={(e) => setP1atm(leerCampo(e))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="V1">V₁ (L)</label>
              <input
                id="V1"
                type="number"
                step="0.5"
                value={mostrarCampo(V1L)}
                onChange={(e) => setV1L(leerCampo(e))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="T1">T₁ (K)</label>
              <input
                id="T1"
                type="number"
                step="10"
                value={mostrarCampo(T1K)}
                onChange={(e) => setT1K(leerCampo(e))}
              />
            </div>
            <div className={styles.inputGroup}>
              {/* n no se teclea: la fija el estado inicial. Con cuatro campos libres el estado
                  de fábrica incumplía PV = nRT por un factor 2,46 (hallazgo 2352). */}
              <label htmlFor="np">
                <span>n (mol)</span>
                <span className={styles.unitLabel}>calculado: P₁V₁/(RT₁)</span>
              </label>
              <input
                id="np"
                type="number"
                value={nEstado !== null ? Math.round(nEstado * 10000) / 10000 : ''}
                disabled
                readOnly
              />
            </div>
            <div className={styles.inputGroup}>
              {/* γ a la vista en los cuatro procesos: el ΔU y el Q del isobárico y del
                  isocórico dependen de él, y antes solo se veía en el adiabático (hallazgo 2356). */}
              <label htmlFor="gamma">γ (Cp/Cv) del gas</label>
              <select
                id="gamma"
                value={gamma}
                onChange={(e) => setGamma(Number(e.target.value))}
              >
                <option value={1.67}>1,67 (monoatómico: He, Ar)</option>
                <option value={1.4}>1,4 (diatómico: O₂, N₂)</option>
                <option value={1.33}>1,33 (poliatómico: CO₂, H₂O)</option>
              </select>
            </div>
          </div>

          <h3 className={styles.panelTitle} style={{ marginTop: '1rem' }}>
            Estado final
          </h3>
          <div className={styles.inputGrid}>
            {(proceso === 'isotermo' || proceso === 'adiabatico') && (
              <div className={styles.inputGroup}>
                <label htmlFor="V2">V₂ (L)</label>
                <input
                  id="V2"
                  type="number"
                  step="0.5"
                  value={mostrarCampo(V2L)}
                  onChange={(e) => setV2L(leerCampo(e))}
                />
              </div>
            )}
            {(proceso === 'isobaro' || proceso === 'isocoro') && (
              <div className={styles.inputGroup}>
                <label htmlFor="T2">T₂ (K)</label>
                <input
                  id="T2"
                  type="number"
                  step="10"
                  value={mostrarCampo(T2K)}
                  onChange={(e) => setT2K(leerCampo(e))}
                />
              </div>
            )}
            {/* Lo que el proceso deja fijo, con su nombre accesible (hallazgo 2359: el P₂ del
                isobárico era un <label> sin htmlFor y un <input> sin id). */}
            {proceso === 'isobaro' && (
              <div className={styles.inputGroup}>
                <label htmlFor="P2iso">
                  <span>P₂ (atm)</span>
                  <span className={styles.unitLabel}>= P₁</span>
                </label>
                <input id="P2iso" type="number" value={mostrarCampo(P1atm)} disabled readOnly />
              </div>
            )}
            {proceso === 'isocoro' && (
              <div className={styles.inputGroup}>
                <label htmlFor="V2iso">
                  <span>V₂ (L)</span>
                  <span className={styles.unitLabel}>= V₁</span>
                </label>
                <input id="V2iso" type="number" value={mostrarCampo(V1L)} disabled readOnly />
              </div>
            )}
          </div>

          {error && (
            <p className={styles.warningInline} role="alert">
              {error}
            </p>
          )}

          {resultado && (
            <div className={styles.resultBlock}>
              <p className={styles.resultTitle}>Estado final y balance energético</p>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>P₂</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.P2 / ATM_TO_PA, 3)} atm
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>V₂</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.V2 / L_TO_M3, 3)} L
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>T₂</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.T2, 2)} K ({formatNumber(resultado.T2 - 273.15, 1)} °C)
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Trabajo W</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(resultado.W, 2)} J
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Calor Q</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(resultado.Q, 2)} J
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>ΔU</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(resultado.dU, 2)} J
                </span>
              </div>
            </div>
          )}

          {resultado && (
            <div className={styles.formulaBox}>
              <p className={styles.formulaTex}>{resultado.formula}</p>
              <p className={styles.formulaCaption}>
                {proceso === 'isotermo'
                  ? `n = ${formatNumber(resultado.n, 4)} mol · el isotermo no depende de γ`
                  : `n = ${formatNumber(resultado.n, 4)} mol · γ = ${cifraCorta(resultado.gamma)} → Cᵥ = R/(γ−1) = ${formatNumber(R / (resultado.gamma - 1), 2)} J/(mol·K)`}
              </p>
              <p className={styles.formulaCaption}>1ᵉʳ principio: ΔU = Q − W (gas hace W &gt; 0 al expandirse)</p>
              {/* W, Q y ΔU salen cada uno de su fórmula: esta comprobación NO es una identidad
                  (antes Q se calculaba como ΔU + W y cuadraba siempre, hallazgo 2352). */}
              <p className={styles.formulaCaption}>
                Comprobación: Q − W = {formatNumber(resultado.Q - resultado.W, 2)} J; ΔU calculado aparte ={' '}
                {formatNumber(resultado.dU, 2)} J
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 className={styles.panelTitle}>Diagrama P-V</h3>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className={styles.pvDiagram}
            role="img"
            aria-label="Diagrama presión-volumen del proceso"
          >
            <MarcoDiagrama escala={escala} />

            {/* Curva del proceso */}
            {pathD && <path d={pathD} className={procesoColorClass} />}

            {/* Puntos inicial y final */}
            {primero && ultimo && (
              <>
                <circle className={styles.pvPoint} cx={toX(primero.V)} cy={toY(primero.P)} r={5} />
                <text className={styles.pvLabel} x={toX(primero.V) + 8} y={toY(primero.P) - 6}>
                  1
                </text>
                <circle className={styles.pvPoint} cx={toX(ultimo.V)} cy={toY(ultimo.P)} r={5} />
                <text className={styles.pvLabel} x={toX(ultimo.V) + 8} y={toY(ultimo.P) - 6}>
                  2
                </text>
              </>
            )}
          </svg>
          <p className={styles.moleculasCaption}>
            Curva real del proceso. Punto 1 = inicial, punto 2 = final.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- TAB 3: Ciclos ----------

function CiclosTab(): React.ReactElement {
  const [ciclo, setCiclo] = useState<Ciclo>('carnot');
  const [Th, setTh] = useState<number>(800);
  const [Tc, setTc] = useState<number>(300);
  const [V1, setV1] = useState<number>(2); // L (Carnot y Stirling)
  const [V2, setV2] = useState<number>(20); // L (máximo)
  const [r, setR] = useState<number>(10); // ratio compresión Otto/Diesel
  const [rc, setRc] = useState<number>(2); // cut-off Diesel
  const [nMol, setNMol] = useState<number>(1);
  const [gamma, setGamma] = useState<number>(1.4);

  const entrada = useMemo<EntradaCiclo>(
    () => ({ ciclo, Th, Tc, V1L: V1, V2L: V2, r, rc, nMol, gamma }),
    [ciclo, Th, Tc, V1, V2, r, rc, nMol, gamma]
  );
  // Un ciclo fuera de su dominio (Otto con la T pico por debajo de la T tras la compresión,
  // hallazgo 2354) se rechaza con aviso: nunca se publica una η mayor que la de Carnot.
  const error = useMemo(() => errorCiclo(entrada), [entrada]);
  const resultado = useMemo<ResultadoCiclo | null>(() => calcularCiclo(entrada), [entrada]);

  const escala = useMemo(
    () => (resultado ? escalaDiagrama(resultado.puntos, 0.08, 0.08, 0.12) : null),
    [resultado]
  );
  const { toX, toY } = useEjes(escala);

  const pathD = useMemo(() => {
    if (!resultado || resultado.puntos.length === 0) return '';
    const parts = resultado.puntos.map(
      (p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.V).toFixed(2)} ${toY(p.P).toFixed(2)}`
    );
    return `${parts.join(' ')} Z`;
  }, [resultado, toX, toY]);

  return (
    <div>
      <div className={styles.cicloSelector}>
        {(['carnot', 'otto', 'diesel', 'stirling'] as Ciclo[]).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={ciclo === c}
            className={`${styles.cicloCard} ${ciclo === c ? styles.cicloCardActive : ''}`}
            onClick={() => setCiclo(c)}
          >
            {c === 'carnot' && 'Carnot'}
            {c === 'otto' && 'Otto (gasolina)'}
            {c === 'diesel' && 'Diesel'}
            {c === 'stirling' && 'Stirling'}
          </button>
        ))}
      </div>

      <div className={styles.controlsPanel}>
        <div>
          <h3 className={styles.panelTitle}>Parámetros del ciclo</h3>
          <div className={styles.inputGrid}>
            {(ciclo === 'carnot' || ciclo === 'stirling') && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="Th">T caliente (K)</label>
                  <input
                    id="Th"
                    type="number"
                    step="20"
                    value={mostrarCampo(Th)}
                    onChange={(e) => setTh(leerCampo(e))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="Tc">T fría (K)</label>
                  <input
                    id="Tc"
                    type="number"
                    step="10"
                    value={mostrarCampo(Tc)}
                    onChange={(e) => setTc(leerCampo(e))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="V1c">V₁ (L)</label>
                  <input
                    id="V1c"
                    type="number"
                    step="0.5"
                    value={mostrarCampo(V1)}
                    onChange={(e) => setV1(leerCampo(e))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="V2c">V₂ (L)</label>
                  <input
                    id="V2c"
                    type="number"
                    step="0.5"
                    value={mostrarCampo(V2)}
                    onChange={(e) => setV2(leerCampo(e))}
                  />
                </div>
              </>
            )}

            {(ciclo === 'otto' || ciclo === 'diesel') && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="Tco">T fría inicial (K)</label>
                  <input
                    id="Tco"
                    type="number"
                    step="10"
                    value={mostrarCampo(Tc)}
                    onChange={(e) => setTc(leerCampo(e))}
                  />
                </div>
                {/* El Diesel no tiene «T pico» que teclear: su T máxima es T₃ = T₂·rc y la fija
                    el cut-off. El campo no entraba en su cálculo y solo movía la η de Carnot de
                    referencia (hallazgo 2355); ahora T₃ sale en el balance. */}
                {ciclo === 'otto' && (
                  <div className={styles.inputGroup}>
                    <label htmlFor="Tho">T pico (K)</label>
                    <input
                      id="Tho"
                      type="number"
                      step="50"
                      value={mostrarCampo(Th)}
                      onChange={(e) => setTh(leerCampo(e))}
                    />
                  </div>
                )}
                <div className={styles.inputGroup}>
                  <label htmlFor="V2o">V máx (L)</label>
                  <input
                    id="V2o"
                    type="number"
                    step="0.5"
                    value={mostrarCampo(V2)}
                    onChange={(e) => setV2(leerCampo(e))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="r">Compresión r</label>
                  <input
                    id="r"
                    type="number"
                    step="0.5"
                    min="1.5"
                    value={mostrarCampo(r)}
                    onChange={(e) => setR(leerCampo(e))}
                  />
                </div>
                {ciclo === 'diesel' && (
                  <div className={styles.inputGroup}>
                    <label htmlFor="rc">Cut-off rc</label>
                    <input
                      id="rc"
                      type="number"
                      step="0.1"
                      min="1.05"
                      value={mostrarCampo(rc)}
                      onChange={(e) => setRc(leerCampo(e))}
                    />
                  </div>
                )}
              </>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="nc">n (mol)</label>
              <input
                id="nc"
                type="number"
                step="0.1"
                value={mostrarCampo(nMol)}
                onChange={(e) => setNMol(leerCampo(e))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="gc">γ</label>
              <select id="gc" value={gamma} onChange={(e) => setGamma(Number(e.target.value))}>
                <option value={1.67}>1,67 (monoatómico)</option>
                <option value={1.4}>1,4 (diatómico)</option>
                <option value={1.33}>1,33 (poliatómico)</option>
              </select>
            </div>
          </div>

          {error && (
            <p className={styles.warningInline} role="alert">
              {error}
            </p>
          )}

          {resultado && (
            <div className={styles.resultBlock}>
              <p className={styles.resultTitle}>Balance del ciclo</p>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Eficiencia η</span>
                <span className={styles.resultValueAccent}>{formatPercentage(resultado.eta, 2)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>η Carnot (cota máx)</span>
                <span className={styles.resultValue}>{formatPercentage(resultado.etaCarnot, 2)}</span>
              </div>
              {resultado.Tcompresion !== null && (
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>T tras la compresión T₂</span>
                  <span className={styles.resultValue}>{formatNumber(resultado.Tcompresion, 2)} K</span>
                </div>
              )}
              {ciclo === 'diesel' && (
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>T máx del ciclo T₃ = T₂·rc</span>
                  <span className={styles.resultValue}>{formatNumber(resultado.Tmax, 2)} K</span>
                </div>
              )}
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Trabajo neto W</span>
                <span className={styles.resultValue}>{formatNumber(resultado.W, 2)} J</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Calor absorbido Qh</span>
                <span className={styles.resultValue}>{formatNumber(resultado.Qh, 2)} J</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Calor cedido Qc</span>
                <span className={styles.resultValue}>{formatNumber(resultado.Qc, 2)} J</span>
              </div>

              <div className={styles.efficiency} style={{ marginTop: '0.75rem' }}>
                <div className={styles.efficiencyRow}>
                  <span className={styles.efficiencyLabel}>η ciclo</span>
                  <div className={styles.efficiencyBarTrack}>
                    <div
                      className={styles.efficiencyBar}
                      style={{ width: `${Math.max(0, Math.min(100, resultado.eta * 100))}%` }}
                    />
                  </div>
                  <span className={styles.efficiencyValue}>{formatPercentage(resultado.eta, 1)}</span>
                </div>
                <div className={styles.efficiencyRow}>
                  <span className={styles.efficiencyLabel}>η Carnot</span>
                  <div className={styles.efficiencyBarTrack}>
                    <div
                      className={`${styles.efficiencyBar} ${styles.efficiencyBarCarnot}`}
                      style={{
                        width: `${Math.max(0, Math.min(100, resultado.etaCarnot * 100))}%`,
                      }}
                    />
                  </div>
                  <span className={styles.efficiencyValue}>{formatPercentage(resultado.etaCarnot, 1)}</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formulaBox}>
            <p className={styles.formulaTex}>
              {ciclo === 'carnot' && 'η = 1 − Tc/Th'}
              {ciclo === 'otto' && 'η = 1 − 1/rᵞ⁻¹'}
              {ciclo === 'diesel' && 'η = 1 − (1/rᵞ⁻¹) · (rcᵞ−1)/(γ(rc−1))'}
              {ciclo === 'stirling' && 'η = 1 − Tc/Th  (con regenerador ideal)'}
            </p>
            <p className={styles.formulaCaption}>
              {ciclo === 'carnot' && 'Cota máxima absoluta: ningún ciclo real supera Carnot'}
              {ciclo === 'otto' &&
                'Motor de gasolina: solo depende de la compresión y γ. La T pico tiene que superar la T tras la compresión'}
              {ciclo === 'diesel' &&
                'Penaliza el cut-off (rc) por la inyección continua. La T máxima es T₃ = T₂·rc: la fija el cut-off'}
              {ciclo === 'stirling' && <>Cota teórica igual a Carnot. Real: 30-40&nbsp;%.</>}
            </p>
            {ciclo !== 'carnot' && ciclo !== 'stirling' && (
              <p className={styles.formulaCaption}>
                La η de Carnot de referencia se calcula entre la T fría y la T máxima del ciclo.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className={styles.panelTitle}>Diagrama P-V del ciclo</h3>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className={styles.pvDiagram}
            role="img"
            aria-label="Diagrama presión-volumen del ciclo termodinámico"
          >
            <MarcoDiagrama escala={escala} />

            {pathD && (
              <>
                <path d={pathD} className={styles.pvFill} />
                <path d={pathD} className={styles.pvCurve} />
              </>
            )}
          </svg>
          <p className={styles.moleculasCaption}>
            Área encerrada = trabajo neto del ciclo. Sentido horario = ciclo motor.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Página principal ----------

export default function Page(): React.ReactElement {
  const [tab, setTab] = useState<Tab>('gas-ideal');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Gas Ideal y Termodinámica</h1>
        <p>
          Manipula presión, volumen, temperatura y cantidad. Compara procesos y ciclos termodinámicos
          con diagramas P-V interactivos.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <div className={styles.panel}>
          <div className={styles.tabBar} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'gas-ideal'}
              className={`${styles.tabBtn} ${tab === 'gas-ideal' ? styles.tabActive : ''}`}
              onClick={() => setTab('gas-ideal')}
            >
              Ley del Gas Ideal
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'procesos'}
              className={`${styles.tabBtn} ${tab === 'procesos' ? styles.tabActive : ''}`}
              onClick={() => setTab('procesos')}
            >
              Procesos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'ciclos'}
              className={`${styles.tabBtn} ${tab === 'ciclos' ? styles.tabActive : ''}`}
              onClick={() => setTab('ciclos')}
            >
              Ciclos
            </button>
          </div>

          {tab === 'gas-ideal' && <GasIdealTab />}
          {tab === 'procesos' && <ProcesosTab />}
          {tab === 'ciclos' && <CiclosTab />}
        </div>

        {/* Tarea de aula (skill /casos-aula-meskeia): fuera del panel de pestañas, para que se
            vea sea cual sea la pestaña, y FUERA de EducationalSection, que nace colapsada. */}
        <CasosAula />

        <EducationalSection
          title="Guía del Gas Ideal y Termodinámica"
          subtitle="Procesos, ciclos y máquinas térmicas"
        >
          <h3 className={styles.eduSubtitle}>Resumen de Procesos Termodinámicos</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Proceso</th>
                  <th>Se mantiene</th>
                  <th>Trabajo W</th>
                  <th>Calor Q</th>
                  <th>ΔU</th>
                  <th>Fórmula clave</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Isotermo</strong>
                  </td>
                  <td>T</td>
                  <td>nRT·ln(V₂/V₁)</td>
                  <td>= W</td>
                  <td>0</td>
                  <td>P₁V₁ = P₂V₂</td>
                </tr>
                <tr>
                  <td>
                    <strong>Isobárico</strong>
                  </td>
                  <td>P</td>
                  <td>P·ΔV</td>
                  <td>nCₚ·ΔT</td>
                  <td>nCᵥ·ΔT</td>
                  <td>V₁/T₁ = V₂/T₂</td>
                </tr>
                <tr>
                  <td>
                    <strong>Isocórico</strong>
                  </td>
                  <td>V</td>
                  <td>0</td>
                  <td>nCᵥ·ΔT = ΔU</td>
                  <td>nCᵥ·ΔT</td>
                  <td>P₁/T₁ = P₂/T₂</td>
                </tr>
                <tr>
                  <td>
                    <strong>Adiabático</strong>
                  </td>
                  <td>Q (= 0)</td>
                  <td>(P₁V₁−P₂V₂)/(γ−1)</td>
                  <td>0</td>
                  <td>−W</td>
                  <td>PVᵞ = cte</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de secundaria</h4>
              <p>
                Practica problemas de gases ideales: manipula PV=nRT despejando cualquier variable y
                visualiza cómo afecta a las moléculas el cambio de T y V.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Universitario de ingeniería</h4>
              <p>
                Compara los ciclos Otto, Diesel y Stirling viendo el impacto del ratio de compresión
                y γ sobre la eficiencia teórica del motor.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Curiosidad sobre motores</h4>
              <p>
                Entiende por qué un motor diésel comprime mucho más que uno de gasolina, y por qué
                el ciclo Stirling es interesante para energías renovables.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Profesor de termodinámica</h4>
              <p>
                Recurso visual para explicar diagramas P-V en el aula, mostrando cómo el área
                encerrada del ciclo equivale al trabajo neto producido.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué el ciclo de Carnot es el límite teórico?</strong>
              <p>
                Porque es totalmente reversible: cada paso (isotermo y adiabático) puede invertirse
                sin pérdidas. Cualquier irreversibilidad (rozamiento, gradiente de temperatura,
                turbulencia) reduce la eficiencia. Carnot demostró matemáticamente que ningún ciclo
                operando entre Th y Tc puede superar 1 − Tc/Th.
              </p>
              <p className={styles.faqTip}>η Carnot solo depende de las dos temperaturas extremas.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo se relaciona la eficiencia con la temperatura?</strong>
              <p>
                Cuanto mayor es Th y menor Tc, mayor la eficiencia. Por eso las centrales térmicas
                trabajan a temperaturas muy altas (turbinas a 600 °C) y refrigeran con torres o
                ríos. En motores de combustión interna, subir Th implica materiales que aguanten más
                calor: ahí está el límite real.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre Otto y Diesel?</strong>
              <p>
                El ciclo Otto (gasolina) absorbe el calor a volumen constante: combustión casi
                instantánea por chispa. El Diesel inyecta combustible mientras el émbolo ya se está
                expandiendo, así que la combustión ocurre a presión casi constante. Por eso el Otto
                es más eficiente en términos absolutos para el mismo r, pero el Diesel admite
                ratios de compresión mucho mayores (15-22 vs 8-12), lo que en la práctica le da más
                rendimiento.
              </p>
              <p className={styles.faqTip}>Más compresión → mejor rendimiento. Pero también más caro construir.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué un gas ideal no se licúa nunca?</strong>
              <p>
                Porque el modelo asume que las moléculas no interactúan entre sí salvo por choques
                elásticos. Sin fuerzas atractivas no hay condensación. Los gases reales se desvían
                del modelo ideal a presiones altas o temperaturas bajas: ahí ya importan las fuerzas
                de Van der Waals y el volumen propio de las moléculas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es exactamente la energía interna U?</strong>
              <p>
                Es la suma de todas las energías microscópicas del gas: cinética de traslación de las
                moléculas, rotación, vibración y energía potencial entre ellas. Para un gas ideal
                monoatómico solo cuenta la traslación: U = (3/2)nRT. Para un gas diatómico se suman
                rotaciones: U = (5/2)nRT.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿De qué depende γ (gamma)?</strong>
              <p>
                γ = Cₚ/Cᵥ depende de los grados de libertad del gas. Monoatómicos (He, Ar, Ne):
                γ ≈ 1,67. Diatómicos a temperatura ambiente (O₂, N₂, aire): γ ≈ 1,40.
                Poliatómicos (CO₂, H₂O, CH₄): γ ≈ 1,30 porque tienen más modos vibracionales que
                absorben energía.
              </p>
              <p className={styles.faqTip}>El aire en condiciones normales se modela bien con γ = 1,4.</p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>
            Cómo Resolver un Problema de Termodinámica — Paso a Paso
          </h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica el sistema y los estados</strong>
                <p>
                  Define qué gas es, sus propiedades (n, γ) y cuántos estados tiene el problema (1 →
                  2, ciclo de 4 etapas, etc.). Apunta P, V, T conocidos en cada estado.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Pasa todo a unidades SI</strong>
                <p>
                  Convierte presión a Pa, volumen a m³, temperatura a K (no °C). El error más común:
                  usar °C en PV=nRT.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Clasifica el proceso</strong>
                <p>
                  ¿Qué se mantiene constante? T (isotermo), P (isobaro), V (isocoro), Q=0 (adiabático).
                  De esa elección depende qué fórmula aplicar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula W, Q y ΔU con las fórmulas correctas</strong>
                <p>
                  Aplica la tabla resumen. Aplica el primer principio ΔU = Q − W para verificar
                  consistencia.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Comprueba signos y orden de magnitud</strong>
                <p>
                  Si el gas se expande, W &gt; 0. Si se calienta, ΔU &gt; 0. Si el resultado es
                  absurdo (η &gt; 100&nbsp;%), revisa T en K y la fórmula del ciclo.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✓</span>
              <div>
                <strong>Trabaja siempre en kelvin</strong>
                <p>0 °C = 273,15 K. Una T en °C metida en PV=nRT da resultados erróneos.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✓</span>
              <div>
                <strong>Elige R adecuada</strong>
                <p>
                  R = 8,314 J/(mol·K) si trabajas en SI. R = 0,0821 atm·L/(mol·K) si manejas atm y L.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✓</span>
              <div>
                <strong>Dibuja el diagrama P-V</strong>
                <p>Te ayuda a ver el sentido del proceso y a no equivocarte con los signos de W.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✓</span>
              <div>
                <strong>Verifica el primer principio</strong>
                <p>ΔU = Q − W siempre se cumple. Si los signos no cuadran, revisa el cálculo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✓</span>
              <div>
                <strong>Compara con Carnot</strong>
                <p>
                  Calcula η Carnot como referencia. Si tu ciclo da una η mayor, hay un error en algún
                  paso.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✓</span>
              <div>
                <strong>Identifica γ correcto</strong>
                <p>
                  Aire ≈ 1,4. He, Ne, Ar ≈ 1,67. CO₂, vapor ≈ 1,30. γ erróneo arruina las adiabáticas.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <span>Errores Frecuentes</span>
            </div>
            <ul className={styles.warningList}>
              <li>
                Confundir el signo de Q y W: el convenio físico es W &gt; 0 cuando el gas se expande
                (hace trabajo); Q &gt; 0 cuando el gas absorbe calor.
              </li>
              <li>
                Usar °C en PV=nRT: la temperatura debe estar en kelvin siempre. Sumar 273,15 al valor
                en °C.
              </li>
              <li>
                Asumir que adiabático = Q=0 sin más: implica que no hay intercambio de calor con el
                entorno, lo cual exige aislamiento o velocidad muy alta del proceso.
              </li>
              <li>
                Confundir Cᵥ y Cₚ: Cᵥ se usa cuando V es constante (isocoro) y para ΔU; Cₚ se usa
                cuando P es constante (isobaro) y para Q en isobárico.
              </li>
              <li>
                Aplicar el modelo ideal a presiones altas o temperaturas bajas: cerca de la
                licuefacción los gases se desvían mucho del comportamiento ideal.
              </li>
              <li>
                Confundir un proceso con un ciclo: un proceso lleva del estado 1 al 2; un ciclo es
                cerrado y vuelve al estado inicial, generando trabajo neto = área encerrada.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-gas-ideal')} />
      </main>

      <ShareCard appName="simulador-gas-ideal" />
      <Footer appName="simulador-gas-ideal" />
    </div>
  );
}
