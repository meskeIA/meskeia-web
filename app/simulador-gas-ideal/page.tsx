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
import { formatNumber } from '@/lib';
import styles from './SimuladorGasIdeal.module.css';

type Tab = 'gas-ideal' | 'procesos' | 'ciclos';
type CalcVar = 'P' | 'V' | 'T' | 'n';
type Proceso = 'isotermo' | 'isobaro' | 'isocoro' | 'adiabatico';
type Ciclo = 'carnot' | 'otto' | 'diesel' | 'stirling';

// R en J/(mol·K). Trabajamos en SI: P en Pa, V en m³, T en K, n en mol.
// Para presentar al usuario, convertimos: 1 atm = 101325 Pa, 1 L = 0.001 m³.
const R = 8.314;
const ATM_TO_PA = 101325;
const L_TO_M3 = 0.001;

interface Molecula {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface PuntoPV {
  P: number; // Pa
  V: number; // m³
}

// ---------- TAB 1: Gas Ideal ----------

function GasIdealTab(): React.ReactElement {
  const [calcVar, setCalcVar] = useState<CalcVar>('P');
  // Inputs en unidades amigables: atm, L, K, mol
  const [Patm, setPatm] = useState<number>(1);
  const [VL, setVL] = useState<number>(22.4);
  const [TK, setTK] = useState<number>(273.15);
  const [nMol, setNMol] = useState<number>(1);

  // Cálculo automático de la variable seleccionada
  const calculado = useMemo(() => {
    const P_Pa = Patm * ATM_TO_PA;
    const V_m3 = VL * L_TO_M3;
    if (calcVar === 'P') {
      // P = nRT/V
      if (V_m3 <= 0) return null;
      const P = (nMol * R * TK) / V_m3;
      return P / ATM_TO_PA; // atm
    }
    if (calcVar === 'V') {
      if (P_Pa <= 0) return null;
      const V = (nMol * R * TK) / P_Pa;
      return V / L_TO_M3; // L
    }
    if (calcVar === 'T') {
      if (nMol <= 0) return null;
      const T = (P_Pa * V_m3) / (nMol * R);
      return T; // K
    }
    if (calcVar === 'n') {
      if (TK <= 0) return null;
      const n = (P_Pa * V_m3) / (R * TK);
      return n; // mol
    }
    return null;
  }, [calcVar, Patm, VL, TK, nMol]);

  // Valores efectivos (mostrando el calculado en lugar del input correspondiente)
  const Pef = calcVar === 'P' && calculado !== null ? calculado : Patm;
  const Vef = calcVar === 'V' && calculado !== null ? calculado : VL;
  const Tef = calcVar === 'T' && calculado !== null ? calculado : TK;
  const nef = calcVar === 'n' && calculado !== null ? calculado : nMol;

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
    const speedFactor = Math.sqrt(Math.max(50, Tef) / 273.15) * 1.2;

    // Tamaño de la caja escalado al volumen relativo
    const Vref = 22.4;
    const scaleV = Math.min(1, Math.max(0.35, Math.sqrt(Vef / Vref)));
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
        const tColor = Math.min(1, Math.max(0, (Tef - 100) / 800));
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
  }, [Tef, Vef, initMoleculas]);

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
              onChange={(e) => setCalcVar(e.target.value as CalcVar)}
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
                value={calcVar === 'P' && calculado !== null ? Number(calculado.toFixed(3)) : Patm}
                onChange={(e) => setPatm(Number(e.target.value))}
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
                value={calcVar === 'V' && calculado !== null ? Number(calculado.toFixed(3)) : VL}
                onChange={(e) => setVL(Number(e.target.value))}
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
                value={calcVar === 'T' && calculado !== null ? Number(calculado.toFixed(2)) : TK}
                onChange={(e) => setTK(Number(e.target.value))}
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
                value={calcVar === 'n' && calculado !== null ? Number(calculado.toFixed(4)) : nMol}
                onChange={(e) => setNMol(Number(e.target.value))}
                disabled={calcVar === 'n'}
              />
            </div>
          </div>

          <div className={styles.formulaBox}>
            <p className={styles.formulaTex}>P · V = n · R · T</p>
            <p className={styles.formulaCaption}>R = 8,314 J/(mol·K) = 0,0821 atm·L/(mol·K)</p>
          </div>

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
              <span className={styles.resultValue}>{formatNumber(Pef, 3)} atm</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>V</span>
              <span className={styles.resultValue}>{formatNumber(Vef, 3)} L</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>T</span>
              <span className={styles.resultValue}>
                {formatNumber(Tef, 2)} K ({formatNumber(Tef - 273.15, 1)} °C)
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>n</span>
              <span className={styles.resultValue}>{formatNumber(nef, 4)} mol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- TAB 2: Procesos ----------

interface ResultadoProceso {
  P2: number; // Pa
  V2: number; // m³
  T2: number; // K
  W: number; // J (trabajo realizado por el gas)
  Q: number; // J
  dU: number; // J
  formula: string;
}

function ProcesosTab(): React.ReactElement {
  const [proceso, setProceso] = useState<Proceso>('isotermo');
  const [P1atm, setP1atm] = useState<number>(1);
  const [V1L, setV1L] = useState<number>(10);
  const [T1K, setT1K] = useState<number>(300);
  const [V2L, setV2L] = useState<number>(20); // para isotermo y adiabático
  const [P2atm, setP2atm] = useState<number>(0.5); // para isobaro/isocoro
  const [T2K, setT2K] = useState<number>(600);
  const [nMol, setNMol] = useState<number>(1);
  const [gamma, setGamma] = useState<number>(1.4);

  // Calcular resultado
  const resultado = useMemo<ResultadoProceso | null>(() => {
    const P1 = P1atm * ATM_TO_PA;
    const V1 = V1L * L_TO_M3;
    const T1 = T1K;
    const V2 = V2L * L_TO_M3;

    // Cv y Cp para gas ideal según γ
    // ΔU = n·Cv·ΔT, con Cv = R/(γ-1)
    const Cv = R / (gamma - 1);

    if (proceso === 'isotermo') {
      // T = cte → P1V1 = P2V2; W = nRT·ln(V2/V1); Q = W; ΔU = 0
      if (V2 <= 0 || V1 <= 0) return null;
      const P2 = (P1 * V1) / V2;
      const T2 = T1;
      const W = nMol * R * T1 * Math.log(V2 / V1);
      return {
        P2,
        V2,
        T2,
        W,
        Q: W,
        dU: 0,
        formula: 'P₁V₁ = P₂V₂ · W = nRT·ln(V₂/V₁) · ΔU = 0',
      };
    }
    if (proceso === 'isobaro') {
      // P = cte → V1/T1 = V2/T2; W = P·ΔV; ΔU = nCv·ΔT; Q = ΔU+W
      const P2 = P1;
      const T2 = T2K;
      if (T1 <= 0) return null;
      const V2calc = V1 * (T2 / T1);
      const W = P2 * (V2calc - V1);
      const dU = nMol * Cv * (T2 - T1);
      const Q = dU + W;
      return {
        P2,
        V2: V2calc,
        T2,
        W,
        Q,
        dU,
        formula: 'V₁/T₁ = V₂/T₂ · W = P·ΔV · ΔU = nCᵥ·ΔT',
      };
    }
    if (proceso === 'isocoro') {
      // V = cte → P1/T1 = P2/T2; W = 0; ΔU = nCv·ΔT; Q = ΔU
      const V2calc = V1;
      const T2 = T2K;
      if (T1 <= 0) return null;
      const P2 = P1 * (T2 / T1);
      const W = 0;
      const dU = nMol * Cv * (T2 - T1);
      const Q = dU;
      return {
        P2,
        V2: V2calc,
        T2,
        W,
        Q,
        dU,
        formula: 'P₁/T₁ = P₂/T₂ · W = 0 · Q = ΔU = nCᵥ·ΔT',
      };
    }
    // adiabático: Q = 0; PV^γ = cte; T·V^(γ-1) = cte
    if (V2 <= 0 || V1 <= 0) return null;
    const P2 = P1 * Math.pow(V1 / V2, gamma);
    const T2 = T1 * Math.pow(V1 / V2, gamma - 1);
    const W = (P1 * V1 - P2 * V2) / (gamma - 1);
    const dU = -W; // Q = 0 → ΔU = -W
    return {
      P2,
      V2,
      T2,
      W,
      Q: 0,
      dU,
      formula: 'PVᵞ = cte · TVᵞ⁻¹ = cte · Q = 0 · W = (P₁V₁−P₂V₂)/(γ−1)',
    };
  }, [proceso, P1atm, V1L, T1K, V2L, T2K, nMol, gamma]);

  // Curva PV
  const curvaPV = useMemo<PuntoPV[]>(() => {
    if (!resultado) return [];
    const P1 = P1atm * ATM_TO_PA;
    const V1 = V1L * L_TO_M3;
    const T1 = T1K;
    const N = 60;
    const pts: PuntoPV[] = [];

    if (proceso === 'isotermo') {
      const V2 = resultado.V2;
      for (let i = 0; i <= N; i += 1) {
        const V = V1 + (V2 - V1) * (i / N);
        if (V > 0) pts.push({ P: (nMol * R * T1) / V, V });
      }
    } else if (proceso === 'isobaro') {
      const V2 = resultado.V2;
      for (let i = 0; i <= N; i += 1) {
        const V = V1 + (V2 - V1) * (i / N);
        pts.push({ P: P1, V });
      }
    } else if (proceso === 'isocoro') {
      const P2 = resultado.P2;
      for (let i = 0; i <= N; i += 1) {
        const P = P1 + (P2 - P1) * (i / N);
        pts.push({ P, V: V1 });
      }
    } else {
      const V2 = resultado.V2;
      for (let i = 0; i <= N; i += 1) {
        const V = V1 + (V2 - V1) * (i / N);
        if (V > 0) {
          const P = P1 * Math.pow(V1 / V, gamma);
          pts.push({ P, V });
        }
      }
    }
    return pts;
  }, [proceso, resultado, P1atm, V1L, T1K, nMol, gamma]);

  // SVG dimensiones y escala
  const svgW = 500;
  const svgH = 380;
  const padL = 60;
  const padR = 25;
  const padT = 25;
  const padB = 50;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const escalaPV = useMemo(() => {
    if (curvaPV.length === 0) {
      return { Vmin: 0, Vmax: 1, Pmin: 0, Pmax: 1 };
    }
    let Vmin = Infinity;
    let Vmax = -Infinity;
    let Pmin = Infinity;
    let Pmax = -Infinity;
    for (const p of curvaPV) {
      if (p.V < Vmin) Vmin = p.V;
      if (p.V > Vmax) Vmax = p.V;
      if (p.P < Pmin) Pmin = p.P;
      if (p.P > Pmax) Pmax = p.P;
    }
    const Vrange = Vmax - Vmin || 1;
    const Prange = Pmax - Pmin || 1;
    return {
      Vmin: Vmin - Vrange * 0.1,
      Vmax: Vmax + Vrange * 0.1,
      Pmin: Math.max(0, Pmin - Prange * 0.1),
      Pmax: Pmax + Prange * 0.15,
    };
  }, [curvaPV]);

  const toX = useCallback(
    (V_m3: number): number => {
      const VL = V_m3 / L_TO_M3;
      const VLmin = escalaPV.Vmin / L_TO_M3;
      const VLmax = escalaPV.Vmax / L_TO_M3;
      return padL + ((VL - VLmin) / (VLmax - VLmin)) * plotW;
    },
    [escalaPV, plotW]
  );

  const toY = useCallback(
    (P_Pa: number): number => {
      const Patm = P_Pa / ATM_TO_PA;
      const Pmin = escalaPV.Pmin / ATM_TO_PA;
      const Pmax = escalaPV.Pmax / ATM_TO_PA;
      return padT + plotH - ((Patm - Pmin) / (Pmax - Pmin)) * plotH;
    },
    [escalaPV, plotH]
  );

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
                value={P1atm}
                onChange={(e) => setP1atm(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="V1">V₁ (L)</label>
              <input
                id="V1"
                type="number"
                step="0.5"
                value={V1L}
                onChange={(e) => setV1L(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="T1">T₁ (K)</label>
              <input
                id="T1"
                type="number"
                step="10"
                value={T1K}
                onChange={(e) => setT1K(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="np">n (mol)</label>
              <input
                id="np"
                type="number"
                step="0.1"
                value={nMol}
                onChange={(e) => setNMol(Number(e.target.value))}
              />
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
                  value={V2L}
                  onChange={(e) => setV2L(Number(e.target.value))}
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
                  value={T2K}
                  onChange={(e) => setT2K(Number(e.target.value))}
                />
              </div>
            )}
            {proceso === 'adiabatico' && (
              <div className={styles.inputGroup}>
                <label htmlFor="gamma">γ (Cp/Cv)</label>
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
            )}
            {/* placeholder vacío opcional */}
            {(proceso === 'isobaro' || proceso === 'isocoro') && <div />}
            {/* P2 indicado para isobaro está implícito; mostramos placeholder */}
            {proceso === 'isobaro' && (
              <div className={styles.inputGroup}>
                <label>P₂ (atm)</label>
                <input
                  type="number"
                  value={P1atm}
                  disabled
                  readOnly
                />
              </div>
            )}
          </div>

          {/* P2atm no se usa en cálculo directamente, pero lo dejamos referenciado */}
          {false && <span>{P2atm}</span>}

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
              <p className={styles.formulaCaption}>1ᵉʳ principio: ΔU = Q − W (gas hace W &gt; 0 al expandirse)</p>
            </div>
          )}
        </div>

        <div>
          <h3 className={styles.panelTitle}>Diagrama P-V</h3>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className={styles.pvDiagram}
            role="img"
            aria-label="Diagrama presión-volumen del proceso"
          >
            {/* Grid */}
            {Array.from({ length: 5 }).map((_, i) => {
              const y = padT + (plotH * (i + 1)) / 5;
              return (
                <line
                  key={`gh${i}`}
                  className={styles.pvGrid}
                  x1={padL}
                  x2={padL + plotW}
                  y1={y}
                  y2={y}
                />
              );
            })}
            {Array.from({ length: 5 }).map((_, i) => {
              const x = padL + (plotW * (i + 1)) / 5;
              return (
                <line
                  key={`gv${i}`}
                  className={styles.pvGrid}
                  x1={x}
                  x2={x}
                  y1={padT}
                  y2={padT + plotH}
                />
              );
            })}

            {/* Axes */}
            <line
              className={styles.pvAxis}
              x1={padL}
              y1={padT}
              x2={padL}
              y2={padT + plotH}
            />
            <line
              className={styles.pvAxis}
              x1={padL}
              y1={padT + plotH}
              x2={padL + plotW}
              y2={padT + plotH}
            />

            {/* Curva del proceso */}
            {pathD && <path d={pathD} className={procesoColorClass} />}

            {/* Puntos inicial y final */}
            {curvaPV.length > 0 && (
              <>
                <circle
                  className={styles.pvPoint}
                  cx={toX(curvaPV[0].V)}
                  cy={toY(curvaPV[0].P)}
                  r={5}
                />
                <text
                  className={styles.pvLabel}
                  x={toX(curvaPV[0].V) + 8}
                  y={toY(curvaPV[0].P) - 6}
                >
                  1
                </text>
                <circle
                  className={styles.pvPoint}
                  cx={toX(curvaPV[curvaPV.length - 1].V)}
                  cy={toY(curvaPV[curvaPV.length - 1].P)}
                  r={5}
                />
                <text
                  className={styles.pvLabel}
                  x={toX(curvaPV[curvaPV.length - 1].V) + 8}
                  y={toY(curvaPV[curvaPV.length - 1].P) - 6}
                >
                  2
                </text>
              </>
            )}

            {/* Etiquetas ejes */}
            <text className={styles.pvAxisLabel} x={padL + plotW / 2} y={svgH - 12} textAnchor="middle">
              V (L)
            </text>
            <text
              className={styles.pvAxisLabel}
              x={18}
              y={padT + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90 18 ${padT + plotH / 2})`}
            >
              P (atm)
            </text>

            {/* Ticks numéricos */}
            <text
              className={styles.pvAxisLabel}
              x={padL}
              y={padT + plotH + 15}
              textAnchor="middle"
            >
              {formatNumber(escalaPV.Vmin / L_TO_M3, 1)}
            </text>
            <text
              className={styles.pvAxisLabel}
              x={padL + plotW}
              y={padT + plotH + 15}
              textAnchor="middle"
            >
              {formatNumber(escalaPV.Vmax / L_TO_M3, 1)}
            </text>
            <text
              className={styles.pvAxisLabel}
              x={padL - 8}
              y={padT + plotH + 4}
              textAnchor="end"
            >
              {formatNumber(escalaPV.Pmin / ATM_TO_PA, 2)}
            </text>
            <text className={styles.pvAxisLabel} x={padL - 8} y={padT + 8} textAnchor="end">
              {formatNumber(escalaPV.Pmax / ATM_TO_PA, 2)}
            </text>
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

interface ResultadoCiclo {
  eta: number; // eficiencia [0..1]
  etaCarnot: number;
  W: number; // trabajo neto J
  Qh: number; // calor absorbido J
  Qc: number; // calor cedido J
  puntos: PuntoPV[]; // ciclo cerrado
}

function CiclosTab(): React.ReactElement {
  const [ciclo, setCiclo] = useState<Ciclo>('carnot');
  const [Th, setTh] = useState<number>(800);
  const [Tc, setTc] = useState<number>(300);
  const [V1, setV1] = useState<number>(2); // L (mínimo Otto/Diesel = compresión)
  const [V2, setV2] = useState<number>(20); // L (máximo)
  const [r, setR] = useState<number>(10); // ratio compresión Otto/Diesel
  const [rc, setRc] = useState<number>(2); // cut-off Diesel
  const [nMol, setNMol] = useState<number>(1);
  const [gamma, setGamma] = useState<number>(1.4);

  const resultado = useMemo<ResultadoCiclo | null>(() => {
    const Cv = R / (gamma - 1);
    const Cp = gamma * Cv;
    const etaCarnot = Th > 0 ? 1 - Tc / Th : 0;

    if (ciclo === 'carnot') {
      // 4 estados: 1→2 expansión isoterma a Th; 2→3 expansión adiabática Th→Tc;
      // 3→4 compresión isoterma a Tc; 4→1 compresión adiabática Tc→Th.
      // Tomamos V1, V2 (a Th); calculamos V3, V4 con relaciones adiabáticas.
      const V1_m3 = V1 * L_TO_M3;
      const V2_m3 = V2 * L_TO_M3;
      if (V1_m3 <= 0 || V2_m3 <= 0 || Th <= 0 || Tc <= 0) return null;
      // Relación adiabática T·V^(γ-1) = cte
      // 2→3: Th·V2^(γ-1) = Tc·V3^(γ-1) → V3 = V2·(Th/Tc)^(1/(γ-1))
      const V3_m3 = V2_m3 * Math.pow(Th / Tc, 1 / (gamma - 1));
      // 4→1: Tc·V4^(γ-1) = Th·V1^(γ-1) → V4 = V1·(Th/Tc)^(1/(γ-1))
      const V4_m3 = V1_m3 * Math.pow(Th / Tc, 1 / (gamma - 1));
      const P1 = (nMol * R * Th) / V1_m3;
      const P2 = (nMol * R * Th) / V2_m3;
      const P3 = (nMol * R * Tc) / V3_m3;
      const P4 = (nMol * R * Tc) / V4_m3;

      // Calor absorbido en isoterma 1→2: Qh = nRTh·ln(V2/V1)
      const Qh = nMol * R * Th * Math.log(V2_m3 / V1_m3);
      // Calor cedido en isoterma 3→4: |Qc| = nRTc·ln(V3/V4)
      const Qc = nMol * R * Tc * Math.log(V3_m3 / V4_m3);
      const W = Qh - Qc;
      const eta = Qh > 0 ? W / Qh : 0;

      // Construir curva del ciclo
      const puntos: PuntoPV[] = [];
      const N = 30;
      // 1→2 isoterma Th
      for (let i = 0; i <= N; i += 1) {
        const V = V1_m3 + ((V2_m3 - V1_m3) * i) / N;
        puntos.push({ P: (nMol * R * Th) / V, V });
      }
      // 2→3 adiabática
      for (let i = 1; i <= N; i += 1) {
        const V = V2_m3 + ((V3_m3 - V2_m3) * i) / N;
        const P = P2 * Math.pow(V2_m3 / V, gamma);
        puntos.push({ P, V });
      }
      // 3→4 isoterma Tc
      for (let i = 1; i <= N; i += 1) {
        const V = V3_m3 + ((V4_m3 - V3_m3) * i) / N;
        puntos.push({ P: (nMol * R * Tc) / V, V });
      }
      // 4→1 adiabática (cierre)
      for (let i = 1; i <= N; i += 1) {
        const V = V4_m3 + ((V1_m3 - V4_m3) * i) / N;
        const P = P4 * Math.pow(V4_m3 / V, gamma);
        puntos.push({ P, V });
      }

      return { eta, etaCarnot, W, Qh, Qc, puntos };
    }

    if (ciclo === 'otto') {
      // Otto: 4 procesos. 1→2 compresión adiabática; 2→3 isocora calentamiento;
      // 3→4 expansión adiabática; 4→1 isocora enfriamiento.
      // Inputs: V_max=V2, V_min=V_max/r, Tc=T1 (al inicio), Th=T3 (después calentar).
      const Vmax = V2 * L_TO_M3;
      const Vmin = Vmax / r;
      if (Vmin <= 0 || r <= 1) return null;
      const T1 = Tc;
      const T2 = T1 * Math.pow(r, gamma - 1); // adiabática
      const T3 = Th;
      const T4 = T3 / Math.pow(r, gamma - 1);
      const P1 = (nMol * R * T1) / Vmax;
      const P2 = (nMol * R * T2) / Vmin;
      const P3 = (nMol * R * T3) / Vmin;
      const P4 = (nMol * R * T4) / Vmax;

      // Calor: solo en isocoras
      const Qh = nMol * Cv * (T3 - T2); // 2→3 absorbido
      const Qc = nMol * Cv * (T4 - T1); // 4→1 cedido (positivo)
      const W = Qh - Qc;
      const eta = 1 - 1 / Math.pow(r, gamma - 1);

      const puntos: PuntoPV[] = [];
      const N = 30;
      // 1→2 adiabática (V de Vmax a Vmin)
      for (let i = 0; i <= N; i += 1) {
        const V = Vmax + ((Vmin - Vmax) * i) / N;
        const P = P1 * Math.pow(Vmax / V, gamma);
        puntos.push({ P, V });
      }
      // 2→3 isocora (V=Vmin, P sube)
      for (let i = 1; i <= N; i += 1) {
        const P = P2 + ((P3 - P2) * i) / N;
        puntos.push({ P, V: Vmin });
      }
      // 3→4 adiabática (V de Vmin a Vmax)
      for (let i = 1; i <= N; i += 1) {
        const V = Vmin + ((Vmax - Vmin) * i) / N;
        const P = P3 * Math.pow(Vmin / V, gamma);
        puntos.push({ P, V });
      }
      // 4→1 isocora (V=Vmax, P baja)
      for (let i = 1; i <= N; i += 1) {
        const P = P4 + ((P1 - P4) * i) / N;
        puntos.push({ P, V: Vmax });
      }

      return { eta, etaCarnot, W, Qh, Qc, puntos };
    }

    if (ciclo === 'diesel') {
      // Diesel: 1→2 compresión adiabática; 2→3 isobara expansión (combustión a P cte);
      // 3→4 expansión adiabática; 4→1 isocora enfriamiento.
      const Vmax = V2 * L_TO_M3;
      const Vmin = Vmax / r;
      if (Vmin <= 0 || r <= 1 || rc <= 1) return null;
      const T1 = Tc;
      const T2 = T1 * Math.pow(r, gamma - 1);
      const V3_m3 = Vmin * rc;
      // Isobárico 2→3: V/T = cte
      const T3 = T2 * rc;
      // Adiabático 3→4 hasta V4=Vmax
      const T4 = T3 * Math.pow(V3_m3 / Vmax, gamma - 1);
      const P1 = (nMol * R * T1) / Vmax;
      const P2 = (nMol * R * T2) / Vmin;
      const P3 = P2; // isobaro
      const P4 = (nMol * R * T4) / Vmax;

      const Qh = nMol * Cp * (T3 - T2); // isobárica
      const Qc = nMol * Cv * (T4 - T1); // isocórica enfriamiento
      const W = Qh - Qc;
      const eta = 1 - (1 / Math.pow(r, gamma - 1)) * ((Math.pow(rc, gamma) - 1) / (gamma * (rc - 1)));

      const puntos: PuntoPV[] = [];
      const N = 30;
      // 1→2 adiabática (Vmax → Vmin)
      for (let i = 0; i <= N; i += 1) {
        const V = Vmax + ((Vmin - Vmax) * i) / N;
        const P = P1 * Math.pow(Vmax / V, gamma);
        puntos.push({ P, V });
      }
      // 2→3 isobara (Vmin → V3)
      for (let i = 1; i <= N; i += 1) {
        const V = Vmin + ((V3_m3 - Vmin) * i) / N;
        puntos.push({ P: P2, V });
      }
      // 3→4 adiabática (V3 → Vmax)
      for (let i = 1; i <= N; i += 1) {
        const V = V3_m3 + ((Vmax - V3_m3) * i) / N;
        const P = P3 * Math.pow(V3_m3 / V, gamma);
        puntos.push({ P, V });
      }
      // 4→1 isocora (Vmax)
      for (let i = 1; i <= N; i += 1) {
        const P = P4 + ((P1 - P4) * i) / N;
        puntos.push({ P, V: Vmax });
      }

      return { eta, etaCarnot, W, Qh, Qc, puntos };
    }

    // Stirling: 4 procesos. 1→2 isoterma a Th expansión (V1→V2);
    // 2→3 isocora enfriamiento Th→Tc; 3→4 isoterma a Tc compresión (V2→V1);
    // 4→1 isocora calentamiento Tc→Th.
    const V1_m3 = V1 * L_TO_M3;
    const V2_m3 = V2 * L_TO_M3;
    if (V1_m3 <= 0 || V2_m3 <= 0 || Th <= 0 || Tc <= 0) return null;
    const P1 = (nMol * R * Th) / V1_m3;
    const P2 = (nMol * R * Th) / V2_m3;
    const P3 = (nMol * R * Tc) / V2_m3;
    const P4 = (nMol * R * Tc) / V1_m3;

    // Sin regenerador ideal: Qh = nRTh·ln(V2/V1) + nCv(Th-Tc); Qc = nRTc·ln(V2/V1) + nCv(Th-Tc)
    // Con regenerador (idealizado, eficiencia Carnot): solo se considera el calor isotermo
    // Aquí asumimos Stirling con regenerador ideal → η = 1 - Tc/Th
    const QhIso = nMol * R * Th * Math.log(V2_m3 / V1_m3);
    const QcIso = nMol * R * Tc * Math.log(V2_m3 / V1_m3);
    const W = QhIso - QcIso;
    const Qh = QhIso;
    const Qc = QcIso;
    const eta = Th > 0 ? 1 - Tc / Th : 0;

    const puntos: PuntoPV[] = [];
    const N = 30;
    // 1→2 isoterma Th
    for (let i = 0; i <= N; i += 1) {
      const V = V1_m3 + ((V2_m3 - V1_m3) * i) / N;
      puntos.push({ P: (nMol * R * Th) / V, V });
    }
    // 2→3 isocora (V=V2, P baja)
    for (let i = 1; i <= N; i += 1) {
      const P = P2 + ((P3 - P2) * i) / N;
      puntos.push({ P, V: V2_m3 });
    }
    // 3→4 isoterma Tc
    for (let i = 1; i <= N; i += 1) {
      const V = V2_m3 + ((V1_m3 - V2_m3) * i) / N;
      puntos.push({ P: (nMol * R * Tc) / V, V });
    }
    // 4→1 isocora (V=V1)
    for (let i = 1; i <= N; i += 1) {
      const P = P4 + ((P1 - P4) * i) / N;
      puntos.push({ P, V: V1_m3 });
    }

    return { eta, etaCarnot, W, Qh, Qc, puntos };
  }, [ciclo, Th, Tc, V1, V2, r, rc, nMol, gamma]);

  // SVG
  const svgW = 500;
  const svgH = 380;
  const padL = 60;
  const padR = 25;
  const padT = 25;
  const padB = 50;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const escalaPV = useMemo(() => {
    if (!resultado || resultado.puntos.length === 0) {
      return { Vmin: 0, Vmax: 1, Pmin: 0, Pmax: 1 };
    }
    let Vmin = Infinity;
    let Vmax = -Infinity;
    let Pmin = Infinity;
    let Pmax = -Infinity;
    for (const p of resultado.puntos) {
      if (p.V < Vmin) Vmin = p.V;
      if (p.V > Vmax) Vmax = p.V;
      if (p.P < Pmin) Pmin = p.P;
      if (p.P > Pmax) Pmax = p.P;
    }
    const Vrange = Vmax - Vmin || 1;
    const Prange = Pmax - Pmin || 1;
    return {
      Vmin: Vmin - Vrange * 0.08,
      Vmax: Vmax + Vrange * 0.08,
      Pmin: Math.max(0, Pmin - Prange * 0.08),
      Pmax: Pmax + Prange * 0.12,
    };
  }, [resultado]);

  const toX = useCallback(
    (V_m3: number): number => {
      const VL = V_m3 / L_TO_M3;
      const VLmin = escalaPV.Vmin / L_TO_M3;
      const VLmax = escalaPV.Vmax / L_TO_M3;
      return padL + ((VL - VLmin) / (VLmax - VLmin)) * plotW;
    },
    [escalaPV, plotW]
  );

  const toY = useCallback(
    (P_Pa: number): number => {
      const Patm = P_Pa / ATM_TO_PA;
      const Pmin = escalaPV.Pmin / ATM_TO_PA;
      const Pmax = escalaPV.Pmax / ATM_TO_PA;
      return padT + plotH - ((Patm - Pmin) / (Pmax - Pmin)) * plotH;
    },
    [escalaPV, plotH]
  );

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
                    value={Th}
                    onChange={(e) => setTh(Number(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="Tc">T fría (K)</label>
                  <input
                    id="Tc"
                    type="number"
                    step="10"
                    value={Tc}
                    onChange={(e) => setTc(Number(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="V1c">V₁ (L)</label>
                  <input
                    id="V1c"
                    type="number"
                    step="0.5"
                    value={V1}
                    onChange={(e) => setV1(Number(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="V2c">V₂ (L)</label>
                  <input
                    id="V2c"
                    type="number"
                    step="0.5"
                    value={V2}
                    onChange={(e) => setV2(Number(e.target.value))}
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
                    value={Tc}
                    onChange={(e) => setTc(Number(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="Tho">T pico (K)</label>
                  <input
                    id="Tho"
                    type="number"
                    step="50"
                    value={Th}
                    onChange={(e) => setTh(Number(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="V2o">V máx (L)</label>
                  <input
                    id="V2o"
                    type="number"
                    step="0.5"
                    value={V2}
                    onChange={(e) => setV2(Number(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="r">Compresión r</label>
                  <input
                    id="r"
                    type="number"
                    step="0.5"
                    min="1.5"
                    value={r}
                    onChange={(e) => setR(Number(e.target.value))}
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
                      value={rc}
                      onChange={(e) => setRc(Number(e.target.value))}
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
                value={nMol}
                onChange={(e) => setNMol(Number(e.target.value))}
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

          {resultado && (
            <div className={styles.resultBlock}>
              <p className={styles.resultTitle}>Balance del ciclo</p>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Eficiencia η</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(resultado.eta * 100, 2)} %
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>η Carnot (cota máx)</span>
                <span className={styles.resultValue}>
                  {formatNumber(resultado.etaCarnot * 100, 2)} %
                </span>
              </div>
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
                  <span className={styles.efficiencyValue}>
                    {formatNumber(resultado.eta * 100, 1)} %
                  </span>
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
                  <span className={styles.efficiencyValue}>
                    {formatNumber(resultado.etaCarnot * 100, 1)} %
                  </span>
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
              {ciclo === 'otto' && 'Motor de gasolina: solo depende de la compresión y γ'}
              {ciclo === 'diesel' && 'Penaliza el cut-off (rc) por la inyección continua'}
              {ciclo === 'stirling' && 'Cota teórica igual a Carnot. Real: 30-40 %.'}
            </p>
          </div>
        </div>

        <div>
          <h3 className={styles.panelTitle}>Diagrama P-V del ciclo</h3>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className={styles.pvDiagram}
            role="img"
            aria-label="Diagrama presión-volumen del ciclo termodinámico"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = padT + (plotH * (i + 1)) / 5;
              return (
                <line
                  key={`gh${i}`}
                  className={styles.pvGrid}
                  x1={padL}
                  x2={padL + plotW}
                  y1={y}
                  y2={y}
                />
              );
            })}
            {Array.from({ length: 5 }).map((_, i) => {
              const x = padL + (plotW * (i + 1)) / 5;
              return (
                <line
                  key={`gv${i}`}
                  className={styles.pvGrid}
                  x1={x}
                  x2={x}
                  y1={padT}
                  y2={padT + plotH}
                />
              );
            })}

            <line
              className={styles.pvAxis}
              x1={padL}
              y1={padT}
              x2={padL}
              y2={padT + plotH}
            />
            <line
              className={styles.pvAxis}
              x1={padL}
              y1={padT + plotH}
              x2={padL + plotW}
              y2={padT + plotH}
            />

            {pathD && (
              <>
                <path d={pathD} className={styles.pvFill} />
                <path d={pathD} className={styles.pvCurve} />
              </>
            )}

            <text className={styles.pvAxisLabel} x={padL + plotW / 2} y={svgH - 12} textAnchor="middle">
              V (L)
            </text>
            <text
              className={styles.pvAxisLabel}
              x={18}
              y={padT + plotH / 2}
              textAnchor="middle"
              transform={`rotate(-90 18 ${padT + plotH / 2})`}
            >
              P (atm)
            </text>
            <text
              className={styles.pvAxisLabel}
              x={padL}
              y={padT + plotH + 15}
              textAnchor="middle"
            >
              {formatNumber(escalaPV.Vmin / L_TO_M3, 1)}
            </text>
            <text
              className={styles.pvAxisLabel}
              x={padL + plotW}
              y={padT + plotH + 15}
              textAnchor="middle"
            >
              {formatNumber(escalaPV.Vmax / L_TO_M3, 1)}
            </text>
            <text
              className={styles.pvAxisLabel}
              x={padL - 8}
              y={padT + plotH + 4}
              textAnchor="end"
            >
              {formatNumber(escalaPV.Pmin / ATM_TO_PA, 2)}
            </text>
            <text className={styles.pvAxisLabel} x={padL - 8} y={padT + 8} textAnchor="end">
              {formatNumber(escalaPV.Pmax / ATM_TO_PA, 2)}
            </text>
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
                  absurdo (η &gt; 100 %), revisa T en K y la fórmula del ciclo.
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
