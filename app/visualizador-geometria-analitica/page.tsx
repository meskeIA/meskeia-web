'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './GeometriaAnalitica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TipoConica = 'circunferencia' | 'elipse' | 'parabola' | 'hiperbola';
type TabPrincipal = TipoConica | 'polares';
type OrientacionParabola = 'vertical' | 'horizontal';
type CurvaPolar = 'rosa' | 'espiral' | 'cardioide';

interface ParamsCircunferencia {
  r: number;
  h: number;
  k: number;
}

interface ParamsElipse {
  a: number;
  b: number;
  h: number;
  k: number;
}

interface ParamsParabola {
  p: number;
  orientacion: OrientacionParabola;
  h: number;
  k: number;
}

interface ParamsHiperbola {
  a: number;
  b: number;
  h: number;
  k: number;
}

// ─────────────────────────────────────────────
// Constantes SVG
// ─────────────────────────────────────────────

const SVG_SIZE = 350;
const ORIGIN = SVG_SIZE / 2; // 175
const SCALE = 28; // píxeles por unidad

function toSvgX(x: number): number {
  return ORIGIN + x * SCALE;
}

function toSvgY(y: number): number {
  return ORIGIN - y * SCALE;
}

function clampSvg(v: number): number {
  return Math.max(-10, Math.min(SVG_SIZE + 10, v));
}

// ─────────────────────────────────────────────
// Componente: Ejes cartesianos
// ─────────────────────────────────────────────

function EjesCartesianos() {
  const ticks: number[] = [];
  for (let i = -6; i <= 6; i++) {
    if (i !== 0) ticks.push(i);
  }
  return (
    <g aria-hidden="true">
      {/* Cuadrícula */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={toSvgX(t)} y1={0}
            x2={toSvgX(t)} y2={SVG_SIZE}
            stroke="#e0e0e0" strokeWidth="0.5"
          />
          <line
            x1={0} y1={toSvgY(t)}
            x2={SVG_SIZE} y2={toSvgY(t)}
            stroke="#e0e0e0" strokeWidth="0.5"
          />
        </g>
      ))}
      {/* Eje X */}
      <line x1={0} y1={ORIGIN} x2={SVG_SIZE} y2={ORIGIN} stroke="#999" strokeWidth="1.2" />
      {/* Eje Y */}
      <line x1={ORIGIN} y1={0} x2={ORIGIN} y2={SVG_SIZE} stroke="#999" strokeWidth="1.2" />
      {/* Flechas */}
      <polygon points={`${SVG_SIZE},${ORIGIN} ${SVG_SIZE - 7},${ORIGIN - 4} ${SVG_SIZE - 7},${ORIGIN + 4}`} fill="#999" />
      <polygon points={`${ORIGIN},0 ${ORIGIN - 4},7 ${ORIGIN + 4},7`} fill="#999" />
      {/* Etiquetas */}
      <text x={SVG_SIZE - 4} y={ORIGIN - 8} fontSize="11" fill="#888" textAnchor="end">x</text>
      <text x={ORIGIN + 6} y={10} fontSize="11" fill="#888">y</text>
      {/* Marcas de escala */}
      {ticks.filter((t) => t % 2 === 0).map((t) => (
        <g key={`label-${t}`}>
          <text x={toSvgX(t)} y={ORIGIN + 14} fontSize="9" fill="#bbb" textAnchor="middle">{t}</text>
          <text x={ORIGIN - 5} y={toSvgY(t) + 3} fontSize="9" fill="#bbb" textAnchor="end">{t}</text>
        </g>
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────
// Componente: Punto focal
// ─────────────────────────────────────────────

interface PuntoFocalProps {
  x: number;
  y: number;
  label: string;
}

function PuntoFocal({ x, y, label }: PuntoFocalProps) {
  const sx = toSvgX(x);
  const sy = toSvgY(y);
  if (sx < -10 || sx > SVG_SIZE + 10 || sy < -10 || sy > SVG_SIZE + 10) return null;
  return (
    <g>
      <circle cx={sx} cy={sy} r={4} fill="#E84A5F" opacity={0.9} />
      <text x={sx + 6} y={sy - 6} fontSize="10" fill="#E84A5F" fontWeight="600">{label}</text>
    </g>
  );
}

// ─────────────────────────────────────────────
// Visualizador: Circunferencia
// ─────────────────────────────────────────────

interface VisualizadorCircunferenciaProps {
  params: ParamsCircunferencia;
  onChange: (p: ParamsCircunferencia) => void;
}

function VisualizadorCircunferencia({ params, onChange }: VisualizadorCircunferenciaProps) {
  const { r, h, k } = params;
  const cx = toSvgX(h);
  const cy = toSvgY(k);
  const radio = r * SCALE;

  return (
    <div className={styles.visorWrapper}>
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className={styles.svgCanvas}
        aria-label="Gráfica interactiva de circunferencia"
        role="img"
      >
        <EjesCartesianos />
        <circle
          cx={cx} cy={cy} r={radio}
          fill="none" stroke="#2E86AB" strokeWidth="2.5"
        />
        {/* Centro */}
        <circle cx={cx} cy={cy} r={4} fill="#48A9A6" opacity={0.85} />
        <text x={cx + 6} y={cy - 6} fontSize="10" fill="#48A9A6" fontWeight="600">
          C({h},{k})
        </text>
      </svg>

      <div className={styles.panelEcuacion}>
        <div className={styles.ecuacionTitulo}>Ecuación canónica</div>
        <div className={styles.ecuacion}>
          (x {h !== 0 ? (h > 0 ? `− ${h}` : `+ ${Math.abs(h)}`) : ''})²
          {' + '}
          (y {k !== 0 ? (k > 0 ? `− ${k}` : `+ ${Math.abs(k)}`) : ''})²
          {' = '}
          {r}²
          {' = '}
          {r * r}
        </div>
        <div className={styles.infoNotables}>
          <span>Centro: ({h}, {k})</span>
          <span>Radio: {r}</span>
          <span>Longitud: {(2 * Math.PI * r).toFixed(2)}</span>
          <span>Área: {(Math.PI * r * r).toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.sliders}>
        <label className={styles.sliderLabel}>
          Radio r = {r}
          <input type="range" min={1} max={8} step={0.5} value={r}
            onChange={(e) => onChange({ ...params, r: parseFloat(e.target.value) })}
            aria-label="Radio de la circunferencia"
          />
        </label>
        <label className={styles.sliderLabel}>
          Centro h = {h}
          <input type="range" min={-4} max={4} step={1} value={h}
            onChange={(e) => onChange({ ...params, h: parseInt(e.target.value) })}
            aria-label="Coordenada h del centro"
          />
        </label>
        <label className={styles.sliderLabel}>
          Centro k = {k}
          <input type="range" min={-4} max={4} step={1} value={k}
            onChange={(e) => onChange({ ...params, k: parseInt(e.target.value) })}
            aria-label="Coordenada k del centro"
          />
        </label>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visualizador: Elipse
// ─────────────────────────────────────────────

interface VisualizadorElipseProps {
  params: ParamsElipse;
  onChange: (p: ParamsElipse) => void;
}

function VisualizadorElipse({ params, onChange }: VisualizadorElipseProps) {
  const { a, b, h, k } = params;
  const bEfectivo = Math.min(b, a - 0.5);
  const c = Math.sqrt(Math.max(0, a * a - bEfectivo * bEfectivo));
  const e = c / a;
  const cx = toSvgX(h);
  const cy = toSvgY(k);

  // Puntos de la elipse como polilínea
  const N = 120;
  const puntosElipse: string[] = [];
  for (let i = 0; i <= N; i++) {
    const theta = (2 * Math.PI * i) / N;
    const px = toSvgX(h + a * Math.cos(theta));
    const py = toSvgY(k + bEfectivo * Math.sin(theta));
    puntosElipse.push(`${clampSvg(px)},${clampSvg(py)}`);
  }

  return (
    <div className={styles.visorWrapper}>
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className={styles.svgCanvas}
        aria-label="Gráfica interactiva de elipse"
        role="img"
      >
        <EjesCartesianos />
        <polyline
          points={puntosElipse.join(' ')}
          fill="none" stroke="#2E86AB" strokeWidth="2.5"
        />
        {/* Centro */}
        <circle cx={cx} cy={cy} r={3} fill="#48A9A6" />
        {/* Focos */}
        <PuntoFocal x={h + c} y={k} label="F₁" />
        <PuntoFocal x={h - c} y={k} label="F₂" />
        {/* Semiejes */}
        <line
          x1={toSvgX(h - a)} y1={cy}
          x2={toSvgX(h + a)} y2={cy}
          stroke="#7FB3D3" strokeWidth="1" strokeDasharray="4,3"
        />
        <line
          x1={cx} y1={toSvgY(k - bEfectivo)}
          x2={cx} y2={toSvgY(k + bEfectivo)}
          stroke="#7FB3D3" strokeWidth="1" strokeDasharray="4,3"
        />
      </svg>

      <div className={styles.panelEcuacion}>
        <div className={styles.ecuacionTitulo}>Ecuación canónica</div>
        <div className={styles.ecuacion}>
          (x {h !== 0 ? (h > 0 ? `− ${h}` : `+ ${Math.abs(h)}`) : ''})² / {a}²
          {' + '}
          (y {k !== 0 ? (k > 0 ? `− ${k}` : `+ ${Math.abs(k)}`) : ''})² / {bEfectivo.toFixed(1)}²
          {' = 1'}
        </div>
        <div className={styles.infoNotables}>
          <span>Centro: ({h}, {k})</span>
          <span>Semieje a: {a}</span>
          <span>Semieje b: {bEfectivo.toFixed(1)}</span>
          <span>c = {c.toFixed(2)}</span>
          <span>Excentricidad e: {e.toFixed(3)}</span>
          <span>F₁: ({(h + c).toFixed(2)}, {k})</span>
          <span>F₂: ({(h - c).toFixed(2)}, {k})</span>
        </div>
      </div>

      <div className={styles.sliders}>
        <label className={styles.sliderLabel}>
          Semieje a = {a}
          <input type="range" min={2} max={8} step={0.5} value={a}
            onChange={(e) => onChange({ ...params, a: parseFloat(e.target.value) })}
            aria-label="Semieje mayor a"
          />
        </label>
        <label className={styles.sliderLabel}>
          Semieje b = {bEfectivo.toFixed(1)}
          <input type="range" min={0.5} max={Math.max(0.5, a - 0.5)} step={0.5} value={b}
            onChange={(e) => onChange({ ...params, b: parseFloat(e.target.value) })}
            aria-label="Semieje menor b"
          />
        </label>
        <label className={styles.sliderLabel}>
          Centro h = {h}
          <input type="range" min={-3} max={3} step={1} value={h}
            onChange={(e) => onChange({ ...params, h: parseInt(e.target.value) })}
            aria-label="Coordenada h del centro"
          />
        </label>
        <label className={styles.sliderLabel}>
          Centro k = {k}
          <input type="range" min={-3} max={3} step={1} value={k}
            onChange={(e) => onChange({ ...params, k: parseInt(e.target.value) })}
            aria-label="Coordenada k del centro"
          />
        </label>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visualizador: Parábola
// ─────────────────────────────────────────────

interface VisualizadorParabolaProps {
  params: ParamsParabola;
  onChange: (p: ParamsParabola) => void;
}

function VisualizadorParabola({ params, onChange }: VisualizadorParabolaProps) {
  const { p, orientacion, h, k } = params;

  // Generar puntos de la parábola
  const N = 100;
  const puntosParabola: string[] = [];
  const t_max = 5.5;
  for (let i = 0; i <= N; i++) {
    const t = -t_max + (2 * t_max * i) / N;
    let px: number, py: number;
    if (orientacion === 'vertical') {
      // y - k = (1/4p)(x - h)²  →  x = h + t, y = k + t²/(4p)
      px = toSvgX(h + t);
      py = toSvgY(k + (t * t) / (4 * p));
    } else {
      // x - h = (1/4p)(y - k)²  →  y = k + t, x = h + t²/(4p)
      px = toSvgX(h + (t * t) / (4 * p));
      py = toSvgY(k + t);
    }
    puntosParabola.push(`${clampSvg(px)},${clampSvg(py)}`);
  }

  // Foco y directriz
  const focoX = orientacion === 'vertical' ? h : h + p;
  const focoY = orientacion === 'vertical' ? k + p : k;
  const directrizVal = orientacion === 'vertical' ? k - p : h - p;

  // Directriz como línea
  const directrizPts =
    orientacion === 'vertical'
      ? `0,${toSvgY(directrizVal)} ${SVG_SIZE},${toSvgY(directrizVal)}`
      : `${toSvgX(directrizVal)},0 ${toSvgX(directrizVal)},${SVG_SIZE}`;

  const ecuacion =
    orientacion === 'vertical'
      ? `(x ${h !== 0 ? (h > 0 ? `− ${h}` : `+ ${Math.abs(h)}`) : ''})² = ${4 * p}(y ${k !== 0 ? (k > 0 ? `− ${k}` : `+ ${Math.abs(k)}`) : ''})`
      : `(y ${k !== 0 ? (k > 0 ? `− ${k}` : `+ ${Math.abs(k)}`) : ''})² = ${4 * p}(x ${h !== 0 ? (h > 0 ? `− ${h}` : `+ ${Math.abs(h)}`) : ''})`;

  return (
    <div className={styles.visorWrapper}>
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className={styles.svgCanvas}
        aria-label="Gráfica interactiva de parábola"
        role="img"
      >
        <EjesCartesianos />
        {/* Directriz */}
        <polyline
          points={directrizPts}
          fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeDasharray="6,4"
        />
        {/* Parábola */}
        <polyline
          points={puntosParabola.join(' ')}
          fill="none" stroke="#2E86AB" strokeWidth="2.5"
        />
        {/* Vértice */}
        <circle cx={toSvgX(h)} cy={toSvgY(k)} r={4} fill="#48A9A6" />
        <text x={toSvgX(h) + 6} y={toSvgY(k) - 6} fontSize="10" fill="#48A9A6" fontWeight="600">V({h},{k})</text>
        {/* Foco */}
        <PuntoFocal x={focoX} y={focoY} label="F" />
      </svg>

      <div className={styles.panelEcuacion}>
        <div className={styles.ecuacionTitulo}>Ecuación canónica</div>
        <div className={styles.ecuacion}>{ecuacion}</div>
        <div className={styles.infoNotables}>
          <span>Vértice: ({h}, {k})</span>
          <span>Foco: ({focoX.toFixed(2)}, {focoY.toFixed(2)})</span>
          <span>p = {p} (distancia vértice-foco)</span>
          <span>Directriz: {orientacion === 'vertical' ? `y = ${directrizVal.toFixed(2)}` : `x = ${directrizVal.toFixed(2)}`}</span>
          <span>4p = {(4 * p).toFixed(1)}</span>
        </div>
      </div>

      <div className={styles.sliders}>
        <label className={styles.sliderLabel}>
          Parámetro p = {p}
          <input type="range" min={0.5} max={4} step={0.5} value={p}
            onChange={(e) => onChange({ ...params, p: parseFloat(e.target.value) })}
            aria-label="Parámetro p de la parábola"
          />
        </label>
        <label className={styles.sliderLabel}>
          Vértice h = {h}
          <input type="range" min={-4} max={4} step={1} value={h}
            onChange={(e) => onChange({ ...params, h: parseInt(e.target.value) })}
            aria-label="Coordenada h del vértice"
          />
        </label>
        <label className={styles.sliderLabel}>
          Vértice k = {k}
          <input type="range" min={-4} max={4} step={1} value={k}
            onChange={(e) => onChange({ ...params, k: parseInt(e.target.value) })}
            aria-label="Coordenada k del vértice"
          />
        </label>
        <div className={styles.orientacionGroup}>
          <span className={styles.orientacionLabel}>Orientación:</span>
          {(['vertical', 'horizontal'] as OrientacionParabola[]).map((ori) => (
            <button
              key={ori}
              type="button"
              className={`${styles.orientacionBtn} ${orientacion === ori ? styles.orientacionActivo : ''}`}
              onClick={() => onChange({ ...params, orientacion: ori })}
              aria-pressed={orientacion === ori}
            >
              {ori === 'vertical' ? '↑ Vertical' : '→ Horizontal'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visualizador: Hipérbola
// ─────────────────────────────────────────────

interface VisualizadorHiperbolaProps {
  params: ParamsHiperbola;
  onChange: (p: ParamsHiperbola) => void;
}

function VisualizadorHiperbola({ params, onChange }: VisualizadorHiperbolaProps) {
  const { a, b, h, k } = params;
  const c = Math.sqrt(a * a + b * b);
  const e = c / a;

  // Rama derecha e izquierda de la hipérbola
  const N = 80;
  const t_max = 2.5;
  const ramaD: string[] = [];
  const ramaI: string[] = [];

  for (let i = 0; i <= N; i++) {
    const t = -t_max + (2 * t_max * i) / N;
    const px_d = toSvgX(h + a * Math.cosh(t));
    const py_d = toSvgY(k + b * Math.sinh(t));
    const px_i = toSvgX(h - a * Math.cosh(t));
    const py_i = toSvgY(k + b * Math.sinh(t));
    ramaD.push(`${clampSvg(px_d)},${clampSvg(py_d)}`);
    ramaI.push(`${clampSvg(px_i)},${clampSvg(py_i)}`);
  }

  // Asíntotas: y - k = ±(b/a)(x - h)
  const pendiente = b / a;
  const x1s = h - 7, x2s = h + 7;
  const y1p = k + pendiente * (x1s - h);
  const y2p = k + pendiente * (x2s - h);
  const y1n = k - pendiente * (x1s - h);
  const y2n = k - pendiente * (x2s - h);

  return (
    <div className={styles.visorWrapper}>
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className={styles.svgCanvas}
        aria-label="Gráfica interactiva de hipérbola"
        role="img"
      >
        <EjesCartesianos />
        {/* Asíntotas */}
        <line
          x1={toSvgX(x1s)} y1={toSvgY(y1p)}
          x2={toSvgX(x2s)} y2={toSvgY(y2p)}
          stroke="#FF9F43" strokeWidth="1.5" strokeDasharray="8,4" opacity={0.8}
        />
        <line
          x1={toSvgX(x1s)} y1={toSvgY(y1n)}
          x2={toSvgX(x2s)} y2={toSvgY(y2n)}
          stroke="#FF9F43" strokeWidth="1.5" strokeDasharray="8,4" opacity={0.8}
        />
        {/* Hipérbola */}
        <polyline points={ramaD.join(' ')} fill="none" stroke="#2E86AB" strokeWidth="2.5" />
        <polyline points={ramaI.join(' ')} fill="none" stroke="#2E86AB" strokeWidth="2.5" />
        {/* Centro */}
        <circle cx={toSvgX(h)} cy={toSvgY(k)} r={3} fill="#48A9A6" />
        {/* Focos */}
        <PuntoFocal x={h + c} y={k} label="F₁" />
        <PuntoFocal x={h - c} y={k} label="F₂" />
        {/* Vértices */}
        <circle cx={toSvgX(h + a)} cy={toSvgY(k)} r={4} fill="#7FB3D3" />
        <circle cx={toSvgX(h - a)} cy={toSvgY(k)} r={4} fill="#7FB3D3" />
      </svg>

      <div className={styles.panelEcuacion}>
        <div className={styles.ecuacionTitulo}>Ecuación canónica</div>
        <div className={styles.ecuacion}>
          (x {h !== 0 ? (h > 0 ? `− ${h}` : `+ ${Math.abs(h)}`) : ''})² / {a}²
          {' − '}
          (y {k !== 0 ? (k > 0 ? `− ${k}` : `+ ${Math.abs(k)}`) : ''})² / {b}²
          {' = 1'}
        </div>
        <div className={styles.infoNotables}>
          <span>Centro: ({h}, {k})</span>
          <span>Vértices: (±{a}, {k})</span>
          <span>c = {c.toFixed(2)}</span>
          <span>Excentricidad e: {e.toFixed(3)}</span>
          <span>F₁: ({(h + c).toFixed(2)}, {k})</span>
          <span>F₂: ({(h - c).toFixed(2)}, {k})</span>
          <span>Asíntotas: y = ±{(b / a).toFixed(2)}x</span>
        </div>
      </div>

      <div className={styles.sliders}>
        <label className={styles.sliderLabel}>
          Semieje real a = {a}
          <input type="range" min={1} max={5} step={0.5} value={a}
            onChange={(e) => onChange({ ...params, a: parseFloat(e.target.value) })}
            aria-label="Semieje real a"
          />
        </label>
        <label className={styles.sliderLabel}>
          Semieje imaginario b = {b}
          <input type="range" min={1} max={5} step={0.5} value={b}
            onChange={(e) => onChange({ ...params, b: parseFloat(e.target.value) })}
            aria-label="Semieje imaginario b"
          />
        </label>
        <label className={styles.sliderLabel}>
          Centro h = {h}
          <input type="range" min={-3} max={3} step={1} value={h}
            onChange={(e) => onChange({ ...params, h: parseInt(e.target.value) })}
            aria-label="Coordenada h del centro"
          />
        </label>
        <label className={styles.sliderLabel}>
          Centro k = {k}
          <input type="range" min={-3} max={3} step={1} value={k}
            onChange={(e) => onChange({ ...params, k: parseInt(e.target.value) })}
            aria-label="Coordenada k del centro"
          />
        </label>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visualizador: Coordenadas Polares
// ─────────────────────────────────────────────

interface VisualizadorPolaresProps {
  curva: CurvaPolar;
  onCurva: (c: CurvaPolar) => void;
  nPetalos: number;
  onNPetalos: (n: number) => void;
}

function VisualizadorPolares({ curva, onCurva, nPetalos, onNPetalos }: VisualizadorPolaresProps) {
  const POLAR_SCALE = 22;
  const N = 500;

  function toPolarSvg(r: number, theta: number): [number, number] {
    return [
      clampSvg(ORIGIN + r * Math.cos(theta) * POLAR_SCALE),
      clampSvg(ORIGIN - r * Math.sin(theta) * POLAR_SCALE),
    ];
  }

  const puntos: string[] = [];
  for (let i = 0; i <= N; i++) {
    const theta = (2 * Math.PI * i) / N;
    let r = 0;
    if (curva === 'rosa') {
      r = Math.abs(4 * Math.cos(nPetalos * theta));
    } else if (curva === 'espiral') {
      const t_actual = (3 * Math.PI * i) / N; // 0 a 3π
      r = t_actual / (0.8 * Math.PI);
    } else {
      // cardioide: r = a(1 + cos θ)
      r = 3 * (1 + Math.cos(theta));
    }
    const [px, py] = toPolarSvg(r, curva === 'espiral' ? (3 * Math.PI * i) / N : theta);
    puntos.push(`${px},${py}`);
  }

  const OPCIONES_CURVA: { id: CurvaPolar; label: string }[] = [
    { id: 'rosa', label: 'Rosa de pétalos' },
    { id: 'espiral', label: 'Espiral de Arquímedes' },
    { id: 'cardioide', label: 'Cardioide' },
  ];

  return (
    <div className={styles.visorWrapper}>
      <div className={styles.tabsPolares}>
        {OPCIONES_CURVA.map((op) => (
          <button
            key={op.id}
            type="button"
            className={`${styles.tabPolar} ${curva === op.id ? styles.tabPolarActivo : ''}`}
            onClick={() => onCurva(op.id)}
            aria-pressed={curva === op.id}
          >
            {op.label}
          </button>
        ))}
      </div>

      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className={styles.svgCanvas}
        aria-label={`Curva polar: ${curva}`}
        role="img"
      >
        {/* Círculos de referencia polares */}
        {[2, 4, 6].map((r) => (
          <circle
            key={r}
            cx={ORIGIN} cy={ORIGIN} r={r * POLAR_SCALE}
            fill="none" stroke="#e0e0e0" strokeWidth="0.5"
          />
        ))}
        {/* Ejes */}
        <line x1={0} y1={ORIGIN} x2={SVG_SIZE} y2={ORIGIN} stroke="#ccc" strokeWidth="1" />
        <line x1={ORIGIN} y1={0} x2={ORIGIN} y2={SVG_SIZE} stroke="#ccc" strokeWidth="1" />
        {/* Curva */}
        <polyline points={puntos.join(' ')} fill="none" stroke="#48A9A6" strokeWidth="2" />
      </svg>

      <div className={styles.panelEcuacion}>
        <div className={styles.ecuacionTitulo}>Ecuación polar</div>
        <div className={styles.ecuacion}>
          {curva === 'rosa' && `r = 4|cos(${nPetalos}θ)`}
          {curva === 'espiral' && `r = θ / (0,8π)`}
          {curva === 'cardioide' && `r = 3(1 + cos θ)`}
        </div>
        <div className={styles.infoNotables}>
          {curva === 'rosa' && (
            <>
              <span>Pétalos: {nPetalos % 2 === 0 ? nPetalos * 2 : nPetalos}</span>
              <span>n par → 2n pétalos, n impar → n pétalos</span>
            </>
          )}
          {curva === 'espiral' && (
            <>
              <span>θ ∈ [0, 3π]</span>
              <span>Distancia crece linealmente con θ</span>
            </>
          )}
          {curva === 'cardioide' && (
            <>
              <span>Anchura máxima: 6 unidades</span>
              <span>Área = 3π/2 · a²</span>
            </>
          )}
        </div>
      </div>

      {curva === 'rosa' && (
        <div className={styles.sliders}>
          <label className={styles.sliderLabel}>
            Número n = {nPetalos} ({nPetalos % 2 === 0 ? nPetalos * 2 : nPetalos} pétalos)
            <input type="range" min={1} max={8} step={1} value={nPetalos}
              onChange={(e) => onNPetalos(parseInt(e.target.value))}
              aria-label="Número de pétalos de la rosa polar"
            />
          </label>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Configuración de tabs
// ─────────────────────────────────────────────

interface TabInfo {
  id: TabPrincipal;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const TABS: TabInfo[] = [
  { id: 'circunferencia', titulo: 'Circunferencia', icono: '⭕', subtitulo: 'x² + y² = r²' },
  { id: 'elipse', titulo: 'Elipse', icono: '🥚', subtitulo: 'x²/a² + y²/b² = 1' },
  { id: 'parabola', titulo: 'Parábola', icono: '📉', subtitulo: 'y = ax²' },
  { id: 'hiperbola', titulo: 'Hipérbola', icono: '✖️', subtitulo: 'x²/a² − y²/b² = 1' },
  { id: 'polares', titulo: 'Coordenadas Polares', icono: '🌀', subtitulo: 'r = f(θ)' },
];

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────

export default function VisualizadorGeometriaAnalitica() {
  const [tabActivo, setTabActivo] = useState<TabPrincipal>('circunferencia');

  // Estado por cónica
  const [paramsCirc, setParamsCirc] = useState<ParamsCircunferencia>({ r: 4, h: 0, k: 0 });
  const [paramsElipse, setParamsElipse] = useState<ParamsElipse>({ a: 5, b: 3, h: 0, k: 0 });
  const [paramsParabola, setParamsParabola] = useState<ParamsParabola>({ p: 2, orientacion: 'vertical', h: 0, k: 0 });
  const [paramsHiperbola, setParamsHiperbola] = useState<ParamsHiperbola>({ a: 3, b: 2, h: 0, k: 0 });

  // Estado coordenadas polares
  const [curvaPolar, setCurvaPolar] = useState<CurvaPolar>('rosa');
  const [nPetalos, setNPetalos] = useState<number>(3);

  const handleTabChange = useCallback((tab: TabPrincipal) => {
    setTabActivo(tab);
  }, []);

  const relatedApps = getRelatedApps('visualizador-geometria-analitica');

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono} aria-hidden="true">📐</div>
        <h1 className={styles.heroTitulo}>Geometría Analítica</h1>
        <p className={styles.heroSubtitulo}>
          Explora las cónicas — circunferencia, elipse, parábola e hipérbola —
          con gráficas interactivas, ecuaciones en tiempo real y coordenadas polares
        </p>
      </header>

      <LegalNotice />

      {/* Tabs de navegación */}
      <nav className={styles.tabsNav} aria-label="Selección de cónica o coordenadas polares">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tabActivo === tab.id ? styles.tabActivo : ''}`}
            onClick={() => handleTabChange(tab.id)}
            aria-pressed={tabActivo === tab.id}
            aria-label={`Ver ${tab.titulo}`}
          >
            <span className={styles.tabIcono} aria-hidden="true">{tab.icono}</span>
            <span className={styles.tabNombre}>{tab.titulo}</span>
            <span className={styles.tabSub}>{tab.subtitulo}</span>
          </button>
        ))}
      </nav>

      {/* Herramienta interactiva */}
      <main className={styles.herramienta}>
        {tabActivo === 'circunferencia' && (
          <VisualizadorCircunferencia params={paramsCirc} onChange={setParamsCirc} />
        )}
        {tabActivo === 'elipse' && (
          <VisualizadorElipse params={paramsElipse} onChange={setParamsElipse} />
        )}
        {tabActivo === 'parabola' && (
          <VisualizadorParabola params={paramsParabola} onChange={setParamsParabola} />
        )}
        {tabActivo === 'hiperbola' && (
          <VisualizadorHiperbola params={paramsHiperbola} onChange={setParamsHiperbola} />
        )}
        {tabActivo === 'polares' && (
          <VisualizadorPolares
            curva={curvaPolar}
            onCurva={setCurvaPolar}
            nPetalos={nPetalos}
            onNPetalos={setNPetalos}
          />
        )}
      </main>

      {/* Sección educativa */}
      <EducationalSection title="Geometría Analítica: la matemática del espacio con coordenadas" subtitle="Cónicas, focos, ecuaciones canónicas y coordenadas polares explicados visualmente">
        <h3>Las cónicas: secciones del cono</h3>
        <p>
          Las cónicas reciben su nombre porque se obtienen al cortar un cono de revolución con un plano.
          Dependiendo del ángulo del corte obtenemos cuatro curvas distintas:
        </p>
        <ul>
          <li><strong>Circunferencia</strong>: el plano corta perpendicular al eje del cono.</li>
          <li><strong>Elipse</strong>: el plano corta en ángulo oblicuo sin cruzar la base.</li>
          <li><strong>Parábola</strong>: el plano es paralelo a una generatriz del cono.</li>
          <li><strong>Hipérbola</strong>: el plano corta los dos nappes (mitades) del cono.</li>
        </ul>

        <h3>Ecuaciones canónicas</h3>
        <ul>
          <li><strong>Circunferencia</strong>: (x−h)² + (y−k)² = r² — Centro (h,k), radio r.</li>
          <li><strong>Elipse</strong>: (x−h)²/a² + (y−k)²/b² = 1 — Semiejes a y b (a&gt;b).</li>
          <li><strong>Parábola</strong>: (x−h)² = 4p(y−k) (vertical) — Vértice (h,k), parámetro p.</li>
          <li><strong>Hipérbola</strong>: (x−h)²/a² − (y−k)²/b² = 1 — Ramas simétricas con asíntotas.</li>
        </ul>

        <h3>Focos y propiedades geométricas</h3>
        <p>
          Cada cónica tiene <strong>focos</strong> — puntos especiales con propiedades métricas únicas.
          En la elipse, la suma de distancias de cualquier punto a los dos focos es constante (2a).
          En la hipérbola, la diferencia es constante (2a).
          En la parábola, cada punto equidista del foco y de la directriz.
        </p>
        <p>
          La <strong>excentricidad e</strong> mide cuánto se aleja la cónica de un círculo:
          e=0 es circunferencia, 0&lt;e&lt;1 es elipse, e=1 es parábola, e&gt;1 es hipérbola.
        </p>

        <h3>Coordenadas polares</h3>
        <p>
          Las coordenadas polares (r, θ) localizan un punto por su distancia al origen (r) y
          el ángulo θ medido desde el eje positivo. Conversión: x = r·cos θ, y = r·sin θ.
          Curvas como la rosa de pétalos, la espiral o la cardioide son mucho más sencillas
          de expresar en polares que en cartesianas.
        </p>

        <h3>Aplicaciones reales</h3>
        <ul>
          <li><strong>Elipse</strong>: órbitas planetarias (Kepler). El Sol ocupa un foco.</li>
          <li><strong>Parábola</strong>: antenas satelitales, faros de coche. El emisor va en el foco.</li>
          <li><strong>Hipérbola</strong>: torres de refrigeración nuclear, sistema GPS (hipérbolas de tiempo).</li>
          <li><strong>Circunferencia</strong>: ruedas, engranajes, arcos arquitectónicos.</li>
        </ul>

        {/* ── Sección 1: Tabla comparativa de las 4 cónicas ── */}
        <h3>Tabla comparativa de las 4 cónicas</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Cónica</th>
                <th>Ecuación canónica</th>
                <th>Focos</th>
                <th>Excentricidad</th>
                <th>Aplicación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Circunferencia</strong></td>
                <td>x² + y² = r²</td>
                <td>Centro (h, k)</td>
                <td>e = 0</td>
                <td>Ruedas, antenas omnidireccionales</td>
              </tr>
              <tr>
                <td><strong>Elipse</strong></td>
                <td>x²/a² + y²/b² = 1</td>
                <td>(±c, 0) con c = √(a²−b²)</td>
                <td>e = c/a &lt; 1</td>
                <td>Órbitas planetarias, espejos elípticos</td>
              </tr>
              <tr>
                <td><strong>Parábola</strong></td>
                <td>y = x²/4p</td>
                <td>F = (0, p)</td>
                <td>e = 1</td>
                <td>Antenas parabólicas, faros</td>
              </tr>
              <tr>
                <td><strong>Hipérbola</strong></td>
                <td>x²/a² − y²/b² = 1</td>
                <td>(±c, 0) con c = √(a²+b²)</td>
                <td>e = c/a &gt; 1</td>
                <td>GPS hiperbólico, cámaras gran angular</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Sección 2: Casos de uso por perfil ── */}
        <h3>¿Quién usa la geometría analítica?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🪐</span>
              <h3>Astrónomo / Física</h3>
            </div>
            <p>Las órbitas planetarias son elipses con el Sol en un foco (leyes de Kepler). Las trayectorias de cometas son hipérbolas o parábolas según la velocidad de escape.</p>
            <p className={styles.escenarioTip}>La fórmula unificadora en polares: r = p / (1 + e·cos θ) describe cualquier órbita cósmica.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📡</span>
              <h3>Ingeniero de Telecomunicaciones</h3>
            </div>
            <p>Las antenas parabólicas concentran toda la señal en el foco. Los reflectores de satélite usan superficies elípticas para redirigir la señal entre los dos focos.</p>
            <p className={styles.escenarioTip}>Una parábola refleja perfectamente las ondas paralelas al eje hacia su único foco.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏗️</span>
              <h3>Arquitecto</h3>
            </div>
            <p>Los arcos parabólicos en puentes distribuyen las cargas de forma óptima (Torre Eiffel, Puente Golden Gate). Las cúpulas elípticas tienen el efecto acústico: los ruidos se propagan entre focos.</p>
            <p className={styles.escenarioTip}>La Sala de los Susurros en el Capitolio de Washington usa geometría elíptica.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📐</span>
              <h3>Estudiante (Bachillerato / Acceso)</h3>
            </div>
            <p>Las cónicas aparecen en exámenes de bachillerato y pruebas de acceso a la universidad. Reconocer ecuaciones, identificar tipo, calcular focos y excentricidad son ejercicios habituales.</p>
            <p className={styles.escenarioTip}>El signo entre los términos cuadráticos es la clave: (+/+) elipse, (+/−) hipérbola, sin uno → parábola.</p>
          </div>
        </div>

        {/* ── Sección 3: Preguntas frecuentes ── */}
        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué se llaman &quot;cónicas&quot;?</h4>
            <p>Porque se obtienen al seccionar un cono de revolución con un plano. El matemático griego Apolonio de Perga las estudió en el siglo III a.C. y las clasificó según el ángulo del corte respecto al eje del cono.</p>
            <p className={styles.faqTip}>Imagina cortar un cucurucho de helado con un cuchillo en distintos ángulos: obtienes círculo, elipse, parábola o hipérbola.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo sé si una ecuación es una elipse o una hipérbola?</h4>
            <p>El signo entre los dos términos cuadráticos es el indicador: si ambos tienen signo positivo (x²/a² + y²/b² = 1) es una elipse. Si uno es positivo y el otro negativo (x²/a² − y²/b² = 1) es una hipérbola.</p>
            <p className={styles.faqTip}>Regla rápida: suma de cuadrados = elipse (cerrada); resta de cuadrados = hipérbola (abierta).</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué son los focos y para qué sirven?</h4>
            <p>Los focos son puntos especiales con propiedades métricas únicas. En la elipse, todo punto de la curva cumple que la suma de sus distancias a los dos focos es constante (= 2a). En la parábola, cada punto equidista del foco y de la directriz. Estas propiedades tienen aplicaciones ópticas y acústicas directas.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre coordenadas cartesianas y polares?</h4>
            <p>Las coordenadas cartesianas (x, y) ubican un punto por su desplazamiento horizontal y vertical. Las polares (r, θ) lo ubican por la distancia al origen y el ángulo. Se relacionan mediante x = r·cos θ e y = r·sin θ. Muchas curvas (espirales, rosas) son mucho más simples en polares.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo tiene excentricidad 0 y cuándo tiende a infinito?</h4>
            <p>La circunferencia tiene e = 0 (perfectamente circular). A medida que e crece hacia 1, la elipse se aplana. En e = 1 tenemos la parábola (abierta al infinito). Para e &gt; 1 la hipérbola se abre cada vez más; cuando e → ∞ las ramas se vuelven casi rectas.</p>
            <p className={styles.faqTip}>La excentricidad mide &quot;cuánto se aleja la forma del círculo perfecto&quot;.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué tiene que ver la cardioide con el corazón?</h4>
            <p>El nombre viene del griego &quot;kardia&quot; (corazón) por su forma característica, aunque matemáticamente es r = a(1 + cos θ). Se genera también como la trayectoria de un punto en una circunferencia que rueda alrededor de otra del mismo radio. Aparece en los patrones de micrófonos cardióides.</p>
          </div>
        </div>

        {/* ── Sección 4: Guía paso a paso ── */}
        <h3>Cómo analizar una cónica paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Identifica el tipo de cónica</h4>
              <p>Observa los términos cuadráticos: ¿aparecen x² e y² con el mismo signo? → elipse o circunferencia. ¿Con signos distintos? → hipérbola. ¿Solo aparece uno de los dos? → parábola.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Lleva la ecuación a forma canónica</h4>
              <p>Completa cuadrados si es necesario para expresar la ecuación en su forma estándar: (x−h)²/a² ± (y−k)²/b² = 1. Esto te da el centro (h, k) y los parámetros a y b directamente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Calcula los parámetros (a, b, c)</h4>
              <p>Para elipse: c = √(a²−b²). Para hipérbola: c = √(a²+b²). Para parábola: el parámetro p está directamente en la ecuación (4p es el coeficiente del término lineal).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Calcula la excentricidad</h4>
              <p>e = c/a para elipse e hipérbola. Verifica: e = 0 → circunferencia, 0 &lt; e &lt; 1 → elipse, e = 1 → parábola, e &gt; 1 → hipérbola. Esto confirma tu identificación del paso 1.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Dibuja marcando elementos clave</h4>
              <p>Señala el centro o vértice, los focos en su posición exacta (±c desde el centro), los semiejes a y b, y en el caso de la hipérbola traza las asíntotas y = ±(b/a)x.</p>
            </div>
          </div>
        </div>

        {/* ── Sección 5: Mejores prácticas ── */}
        <h3>Consejos para dominar las cónicas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <h4>El signo lo es todo</h4>
            <p>Memoriza: (+/+) → elipse o circunf., (+/−) → hipérbola, solo un cuadrado → parábola. Es la clave más rápida.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <h4>Focos en el interior</h4>
            <p>Los focos de la elipse siempre están dentro de la curva. Los de la hipérbola están fuera de cada rama. La parábola tiene un único foco.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <h4>Cuenta los focos</h4>
            <p>Circunferencia: ninguno (o el centro). Parábola: 1 foco. Elipse e hipérbola: 2 focos. Esto ayuda a distinguirlas rápidamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <h4>La excentricidad como medida</h4>
            <p>La excentricidad cuantifica cuánto se aleja la cónica de la circunferencia perfecta. A mayor e, más &quot;elongada&quot; o &quot;abierta&quot; es la curva.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <h4>Fórmula unificadora polar</h4>
            <p>En coordenadas polares r = p/(1+e·cos θ) unifica todas las cónicas en una sola fórmula cambiando únicamente e. Fundamental en mecánica orbital.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <h4>c² distinto según cónica</h4>
            <p>Elipse: c² = a²−b² (resta). Hipérbola: c² = a²+b² (suma). Son fórmulas distintas: no las confundas.</p>
          </div>
        </div>

        {/* ── Sección 6: Warning Box ── */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Comunes en Geometría Analítica</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir a y b en la elipse:</strong> a siempre es el semieje mayor (a &gt; b). Si a² está bajo x², el eje mayor es horizontal; si está bajo y², es vertical.</li>
            <li><strong>Fórmulas de c² distintas:</strong> en elipses c² = a²−b², en hipérbolas c² = a²+b². Son fórmulas distintas — el signo cambia entre cónicas.</li>
            <li><strong>Foco ≠ Vértice:</strong> el foco y el vértice son puntos distintos, salvo en la circunferencia donde el &quot;foco&quot; equivale al centro.</li>
            <li><strong>Directriz vs. asíntota:</strong> la directriz es una recta relacionada con la excentricidad (propia de la parábola); las asíntotas son las rectas que la hipérbola se aproxima sin tocar.</li>
            <li><strong>No ignorar las coordenadas polares:</strong> muchos problemas de física (mecánica orbital, campos radiales) son mucho más simples en polares que en cartesianas.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-geometria-analitica" />
      <Footer appName="visualizador-geometria-analitica" />
    </div>
  );
}
