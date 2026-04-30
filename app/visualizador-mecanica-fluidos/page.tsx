'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './MecanikaFluidos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabActivo = 'reynolds' | 'magnus' | 'bernoulli' | 'mach';

interface ReynoldsState {
  velocidad: number;
  longitud: number;
  viscosidad: number;
}

interface MagnusState {
  omega: number;
  velocidadTraslacion: number;
}

interface BernoulliState {
  anguloAtaque: number;
  modoRealidad: boolean;
}

interface MachState {
  velocidad: number;
  presionLocal: number;
}

interface PresetFluido {
  nombre: string;
  emoji: string;
  velocidad: number;
  longitud: number;
  viscosidad: number;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const DENSIDAD_AGUA = 1000; // kg/m³
const VELOCIDAD_SONIDO = 343; // m/s en aire
const PRESION_VAPOR_AGUA = 2337; // Pa a 20°C
const RADIO_PELOTA = 0.11; // m (pelota fútbol)

const PRESETS_FLUIDO: PresetFluido[] = [
  {
    nombre: 'Agua en tubería',
    emoji: '🚿',
    velocidad: 1.5,
    longitud: 0.05,
    viscosidad: 0.001,
    descripcion: 'Re típico en tuberías domésticas — suele ser turbulento',
  },
  {
    nombre: 'Miel a temperatura ambiente',
    emoji: '🍯',
    velocidad: 0.1,
    longitud: 0.02,
    viscosidad: 0.1,
    descripcion: 'Muy viscosa — el flujo es siempre laminar',
  },
  {
    nombre: 'Sangre en arteria',
    emoji: '🩸',
    velocidad: 0.3,
    longitud: 0.003,
    viscosidad: 0.004,
    descripcion: 'Flujo típico en arteria carótida — zona de transición',
  },
];

// ─────────────────────────────────────────────
// Funciones de cálculo
// ─────────────────────────────────────────────

function calcularReynolds(v: number, L: number, mu: number): number {
  return (DENSIDAD_AGUA * v * L) / mu;
}

function clasificarFlujo(re: number): { label: string; color: string; clase: string } {
  if (re < 2300) return { label: 'Laminar', color: '#2E86AB', clase: 'laminar' };
  if (re > 4000) return { label: 'Turbulento', color: '#E84A5F', clase: 'turbulento' };
  return { label: 'Transición', color: '#F4A261', clase: 'transicion' };
}

function calcularFuerzaMagnus(omega: number, v: number): number {
  // F = ρ · π · r² · ω · v (por unidad de longitud)
  return DENSIDAD_AGUA * Math.PI * RADIO_PELOTA * RADIO_PELOTA * omega * v * 0.01;
}

function calcularMach(v: number): number {
  return v / VELOCIDAD_SONIDO;
}

function clasificarMach(m: number): { label: string; color: string; descripcion: string } {
  if (m < 0.8) return { label: 'Subsónico', color: '#2E86AB', descripcion: 'Las ondas de presión se propagan delante del objeto' };
  if (m <= 1.2) return { label: 'Transónico', color: '#F4A261', descripcion: 'Mezcla de zonas subsónicas y supersónicas — zona crítica' };
  if (m <= 5) return { label: 'Supersónico', color: '#E84A5F', descripcion: 'Ondas de choque oblicuas — cono de Mach visible' };
  return { label: 'Hipersónico', color: '#9B2335', descripcion: 'Calentamiento aerodinámico extremo — plasma en el borde de ataque' };
}

// ─────────────────────────────────────────────
// SVG: Reynolds
// ─────────────────────────────────────────────

function SvgReynolds({ re, clase }: { re: number; clase: string }) {
  const W = 400;
  const H = 180;
  const N_LINEAS = 7;

  if (clase === 'laminar') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svgFluido} aria-label="Flujo laminar — líneas paralelas ordenadas">
        {/* Canal */}
        <rect x={0} y={0} width={W} height={H} fill="var(--bg-card)" />
        <rect x={0} y={0} width={W} height={8} fill="#2E86AB" opacity={0.3} />
        <rect x={0} y={H - 8} width={W} height={8} fill="#2E86AB" opacity={0.3} />
        {/* Líneas de flujo paralelas */}
        {Array.from({ length: N_LINEAS }, (_, i) => {
          const y = 16 + (i * (H - 32)) / (N_LINEAS - 1);
          return (
            <line key={i} x1={10} y1={y} x2={W - 10} y2={y}
              stroke="#2E86AB" strokeWidth={1.5} opacity={0.7 + 0.05 * i} />
          );
        })}
        {/* Flechas indicando velocidad (perfil parabólico) */}
        {Array.from({ length: N_LINEAS }, (_, i) => {
          const y = 16 + (i * (H - 32)) / (N_LINEAS - 1);
          const centro = (N_LINEAS - 1) / 2;
          const dist = Math.abs(i - centro) / centro;
          const largo = 30 + 50 * (1 - dist * dist);
          return (
            <polygon key={`a${i}`}
              points={`${200 + largo},${y} ${200 + largo - 8},${y - 5} ${200 + largo - 8},${y + 5}`}
              fill="#2E86AB" opacity={0.8} />
          );
        })}
        <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={11} fill="#2E86AB" fontWeight="600">
          Re = {Math.round(re)} — Flujo Laminar
        </text>
      </svg>
    );
  }

  if (clase === 'turbulento') {
    // Líneas caóticas con seno + ruido determinístico
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svgFluido} aria-label="Flujo turbulento — trayectorias caóticas">
        <rect x={0} y={0} width={W} height={H} fill="var(--bg-card)" />
        <rect x={0} y={0} width={W} height={8} fill="#E84A5F" opacity={0.25} />
        <rect x={0} y={H - 8} width={W} height={8} fill="#E84A5F" opacity={0.25} />
        {Array.from({ length: N_LINEAS + 2 }, (_, i) => {
          const yBase = 12 + (i * (H - 24)) / (N_LINEAS + 1);
          const seed = (i + 1) * 3;
          const puntos: string[] = [];
          for (let x = 0; x <= W; x += 8) {
            const y = yBase + Math.sin(x * 0.07 + seed) * 12
              + Math.sin(x * 0.13 + seed * 2) * 7
              + Math.sin(x * 0.23 + seed * 0.5) * 5;
            puntos.push(`${x},${Math.max(10, Math.min(H - 10, y))}`);
          }
          return (
            <polyline key={i} points={puntos.join(' ')}
              stroke="#E84A5F" strokeWidth={1.4} fill="none" opacity={0.65} />
          );
        })}
        <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={11} fill="#E84A5F" fontWeight="600">
          Re = {Math.round(re)} — Flujo Turbulento
        </text>
      </svg>
    );
  }

  // Transición: mezcla
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.svgFluido} aria-label="Flujo en transición laminar-turbulento">
      <rect x={0} y={0} width={W} height={H} fill="var(--bg-card)" />
      <rect x={0} y={0} width={W} height={8} fill="#F4A261" opacity={0.25} />
      <rect x={0} y={H - 8} width={W} height={8} fill="#F4A261" opacity={0.25} />
      {Array.from({ length: N_LINEAS }, (_, i) => {
        const yBase = 16 + (i * (H - 32)) / (N_LINEAS - 1);
        const puntos: string[] = [];
        for (let x = 0; x <= W; x += 8) {
          const caos = x / W;
          const y = yBase + Math.sin(x * 0.04 + i) * 4 * caos
            + Math.sin(x * 0.11 + i * 2) * 8 * caos * caos;
          puntos.push(`${x},${Math.max(10, Math.min(H - 10, y))}`);
        }
        return (
          <polyline key={i} points={puntos.join(' ')}
            stroke="#F4A261" strokeWidth={1.4} fill="none" opacity={0.7} />
        );
      })}
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={11} fill="#F4A261" fontWeight="600">
        Re = {Math.round(re)} — Zona de Transición
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Magnus
// ─────────────────────────────────────────────

function SvgMagnus({ omega, velocidadTraslacion }: { omega: number; velocidadTraslacion: number }) {
  const W = 500;
  const H = 280;
  const cx = 80;
  const cy = H / 2;
  const r = 28;

  // Trayectoria parabólica con deflexión por Magnus
  const fuerza = calcularFuerzaMagnus(omega, velocidadTraslacion);
  const deflexion = fuerza * 30; // escala visual

  const puntos: string[] = [];
  for (let t = 0; t <= 1; t += 0.02) {
    const x = cx + t * (W - cx - 20);
    const y = cy - deflexion * t * (1 - t * 0.3);
    puntos.push(`${x},${y}`);
  }

  // Líneas de flujo alrededor de la pelota
  const ladoAlta = omega > 0 ? 'bottom' : 'top'; // lado de alta presión

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.svgFluido} aria-label="Efecto Magnus — trayectoria curva de la pelota">
      <rect x={0} y={0} width={W} height={H} fill="var(--bg-card)" />

      {/* Trayectoria sin Magnus (recta punteada) */}
      <line x1={cx} y1={cy} x2={W - 20} y2={cy}
        stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="6,4" opacity={0.5} />
      <text x={W - 15} y={cy - 6} fontSize={10} fill="var(--text-muted)" textAnchor="end">sin Magnus</text>

      {/* Trayectoria con Magnus */}
      {puntos.length > 1 && (
        <polyline points={puntos.join(' ')}
          stroke={omega >= 0 ? '#2E86AB' : '#E84A5F'} strokeWidth={2.5} fill="none" />
      )}

      {/* Pelota */}
      <circle cx={cx} cy={cy} r={r} fill={omega >= 0 ? '#2E86AB' : '#E84A5F'} opacity={0.85} />
      {/* Indicador de rotación */}
      {omega !== 0 && (
        <>
          <path d={omega > 0
            ? `M ${cx} ${cy - r + 6} A ${r - 6} ${r - 6} 0 1 1 ${cx - 4} ${cy - r + 6}`
            : `M ${cx} ${cy - r + 6} A ${r - 6} ${r - 6} 0 1 0 ${cx + 4} ${cy - r + 6}`}
            stroke="white" strokeWidth={2} fill="none" strokeLinecap="round" />
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize={11} fill="white" fontWeight="700">
            {omega > 0 ? '↻' : '↺'}
          </text>
        </>
      )}

      {/* Etiquetas presión */}
      {omega !== 0 && (
        <>
          <rect x={cx - 38} y={ladoAlta === 'top' ? cy - r - 28 : cy + r + 4}
            width={76} height={20} rx={6} fill={ladoAlta === 'top' ? '#E84A5F' : '#2E86AB'} opacity={0.2} />
          <text x={cx} y={ladoAlta === 'top' ? cy - r - 13 : cy + r + 19}
            textAnchor="middle" fontSize={10} fill={ladoAlta === 'top' ? '#E84A5F' : '#2E86AB'} fontWeight="600">
            Alta presión
          </text>
          <rect x={cx - 36} y={ladoAlta === 'bottom' ? cy - r - 28 : cy + r + 4}
            width={72} height={20} rx={6} fill={ladoAlta === 'bottom' ? '#E84A5F' : '#2E86AB'} opacity={0.2} />
          <text x={cx} y={ladoAlta === 'bottom' ? cy - r - 13 : cy + r + 19}
            textAnchor="middle" fontSize={10} fill={ladoAlta === 'bottom' ? '#E84A5F' : '#2E86AB'} fontWeight="600">
            Baja presión
          </text>
        </>
      )}

      {/* Destino de la pelota */}
      {puntos.length > 0 && (
        <circle cx={parseFloat(puntos[puntos.length - 1].split(',')[0])}
          cy={parseFloat(puntos[puntos.length - 1].split(',')[1])}
          r={6} fill={omega >= 0 ? '#2E86AB' : '#E84A5F'} opacity={0.5} />
      )}

      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--text-secondary)">
        F Magnus = {Math.abs(fuerza).toFixed(3)} N · v = {velocidadTraslacion} m/s · ω = {omega} rad/s
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Bernoulli (perfil alar)
// ─────────────────────────────────────────────

function SvgBernoulli({ anguloAtaque, modoRealidad }: { anguloAtaque: number; modoRealidad: boolean }) {
  const W = 500;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2;

  // Perfil NACA simplificado (elipse asimétrica)
  const largo = 180;
  const grosor = 28;
  const rad = anguloAtaque * Math.PI / 180;

  // Puntos del perfil alar (12 puntos clave)
  const perfilSup: Array<[number, number]> = [
    [-90, 0], [-70, -12], [-45, -22], [-10, -grosor], [20, -grosor + 5], [60, -14], [90, -2]
  ];
  const perfilInf: Array<[number, number]> = [
    [-90, 0], [-65, 6], [-30, 10], [10, 9], [50, 6], [80, 3], [90, -2]
  ];

  function rotarPunto(px: number, py: number): [number, number] {
    const rx = px * Math.cos(-rad) - py * Math.sin(-rad);
    const ry = px * Math.sin(-rad) + py * Math.cos(-rad);
    return [cx + rx, cy + ry];
  }

  const puntosPerfilSup = perfilSup.map(([x, y]) => rotarPunto(x * largo / 90, y));
  const puntosPerfilInf = perfilInf.map(([x, y]) => rotarPunto(x * largo / 90, y));

  const pathData = [
    `M ${puntosPerfilSup[0][0]},${puntosPerfilSup[0][1]}`,
    ...puntosPerfilSup.slice(1).map(([x, y]) => `L ${x},${y}`),
    ...puntosPerfilInf.slice(1).reverse().map(([x, y]) => `L ${x},${y}`),
    'Z'
  ].join(' ');

  // Líneas de flujo — más densas y rápidas arriba
  const nLineas = 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.svgFluido} aria-label="Perfil alar con líneas de flujo Bernoulli">
      <rect x={0} y={0} width={W} height={H} fill="var(--bg-card)" />

      {/* Líneas de flujo superiores (más rápidas, azul más oscuro) */}
      {Array.from({ length: nLineas }, (_, i) => {
        const offset = -38 - i * 14;
        const [x0, y0] = rotarPunto(-largo * 0.95, offset);
        const [x1, y1] = rotarPunto(largo * 0.95, offset + (modoRealidad ? -8 - i * 2 : -4));
        return (
          <line key={`sup${i}`} x1={x0} y1={y0} x2={x1} y2={y1}
            stroke="#1A6B8A" strokeWidth={1.4} opacity={0.6} />
        );
      })}

      {/* Líneas de flujo inferiores (más lentas, azul claro) */}
      {Array.from({ length: nLineas }, (_, i) => {
        const offset = 16 + i * 14;
        const [x0, y0] = rotarPunto(-largo * 0.95, offset);
        const [x1, y1] = rotarPunto(largo * 0.95, offset);
        return (
          <line key={`inf${i}`} x1={x0} y1={y0} x2={x1} y2={y1}
            stroke="#7FB3D3" strokeWidth={1.4} opacity={0.55} />
        );
      })}

      {/* Perfil alar */}
      <path d={pathData} fill="#2E86AB" opacity={0.85} stroke="#1A6B8A" strokeWidth={1.5} />

      {/* Etiquetas velocidad/presión */}
      {(() => {
        const [lx, ly] = rotarPunto(0, -52);
        return (
          <text x={lx} y={ly} textAnchor="middle" fontSize={11} fill="#1A6B8A" fontWeight="700">
            v ↑ (rápido) · P ↓ (baja presión)
          </text>
        );
      })()}
      {(() => {
        const [lx, ly] = rotarPunto(0, 38);
        return (
          <text x={lx} y={ly} textAnchor="middle" fontSize={11} fill="#7FB3D3" fontWeight="700">
            v ↓ (lento) · P ↑ (alta presión)
          </text>
        );
      })()}

      {/* Flecha de sustentación */}
      {(() => {
        const [ax, ay] = rotarPunto(0, -68);
        return (
          <>
            <line x1={cx} y1={cy - 10} x2={ax} y2={ay}
              stroke="#27ae60" strokeWidth={2.5} markerEnd="url(#arrowLift)" />
            <defs>
              <marker id="arrowLift" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <polygon points="0,0 8,4 0,8" fill="#27ae60" />
              </marker>
            </defs>
          </>
        );
      })()}

      {/* Panel modo */}
      <rect x={8} y={8} width={modoRealidad ? 210 : 180} height={42} rx={8}
        fill={modoRealidad ? '#27ae60' : '#F4A261'} opacity={0.15} />
      <text x={16} y={24} fontSize={11} fill={modoRealidad ? '#27ae60' : '#F4A261'} fontWeight="700">
        {modoRealidad ? '✅ Realidad: Bernoulli + Kutta-Joukowski' : '⚠️ Mito: Solo Bernoulli (incompleto)'}
      </text>
      <text x={16} y={42} fontSize={10} fill="var(--text-secondary)">
        {modoRealidad
          ? `Ángulo: ${anguloAtaque}° aporta ~${Math.round(anguloAtaque * 3.5)}% sustentación extra`
          : 'El ángulo de ataque no explicado por Bernoulli clásico'}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Mach
// ─────────────────────────────────────────────

function SvgMach({ mach }: { mach: number }) {
  const W = 460;
  const H = 200;
  const cx = 100;
  const cy = H / 2;

  const regimen = clasificarMach(mach);
  const anguloMach = mach > 1 ? Math.asin(1 / mach) : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.svgFluido} aria-label={`Régimen ${regimen.label} — número de Mach ${mach.toFixed(2)}`}>
      <rect x={0} y={0} width={W} height={H} fill="var(--bg-card)" />

      {/* Objeto (avión simplificado) */}
      <polygon points={`${cx},${cy} ${cx - 30},${cy - 14} ${cx - 30},${cy + 14}`}
        fill={regimen.color} opacity={0.9} />
      <line x1={cx - 30} y1={cy} x2={cx - 50} y2={cy}
        stroke={regimen.color} strokeWidth={3} opacity={0.7} />

      {/* Ondas de choque en supersónico */}
      {mach > 1 && (
        <>
          <line x1={cx} y1={cy}
            x2={cx + (W - cx - 20)}
            y2={cy - (W - cx - 20) * Math.tan(anguloMach)}
            stroke={regimen.color} strokeWidth={2} strokeDasharray="none" opacity={0.8} />
          <line x1={cx} y1={cy}
            x2={cx + (W - cx - 20)}
            y2={cy + (W - cx - 20) * Math.tan(anguloMach)}
            stroke={regimen.color} strokeWidth={2} opacity={0.8} />
          <text x={cx + 80} y={cy - (80 * Math.tan(anguloMach)) - 8}
            fontSize={10} fill={regimen.color} fontWeight="600">
            Onda de choque (cono de Mach)
          </text>
        </>
      )}

      {/* Ondas de presión (círculos concéntricos) — subsónico */}
      {mach <= 0.8 && (
        [60, 100, 145, 195].map((r, i) => (
          <circle key={i} cx={cx - 5} cy={cy} r={r}
            stroke="#2E86AB" strokeWidth={1.2} fill="none" opacity={0.3 - i * 0.06} />
        ))
      )}

      {/* M = 1 — borde de la onda */}
      {mach > 0.8 && mach <= 1.2 && (
        <line x1={cx} y1={10} x2={cx} y2={H - 10}
          stroke="#F4A261" strokeWidth={2} strokeDasharray="5,4" opacity={0.7} />
      )}

      {/* Etiqueta M */}
      <rect x={W - 130} y={8} width={122} height={50} rx={8}
        fill={regimen.color} opacity={0.12} />
      <text x={W - 69} y={28} textAnchor="middle" fontSize={16} fill={regimen.color} fontWeight="800">
        M = {mach.toFixed(2)}
      </text>
      <text x={W - 69} y={48} textAnchor="middle" fontSize={11} fill={regimen.color} fontWeight="600">
        {regimen.label}
      </text>

      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--text-secondary)">
        {regimen.descripcion}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Cavitación
// ─────────────────────────────────────────────

function SvgCavitacion({ presionLocal }: { presionLocal: number }) {
  const W = 420;
  const H = 180;
  const cavita = presionLocal < PRESION_VAPOR_AGUA;
  const nBurbujas = cavita ? Math.min(12, Math.round((PRESION_VAPOR_AGUA - presionLocal) / 400)) : 0;

  const burbujas = Array.from({ length: nBurbujas }, (_, i) => ({
    cx: 60 + ((i * 137) % (W - 120)),
    cy: 40 + ((i * 73) % (H - 80)),
    r: 4 + (i % 4) * 3,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.svgFluido} aria-label={cavita ? 'Cavitación activa — burbujas de vapor' : 'Sin cavitación — presión suficiente'}>
      <rect x={0} y={0} width={W} height={H} fill={cavita ? '#FFF5F5' : 'var(--bg-card)'}
        className={styles.svgBg} />

      {/* Hélice simplificada */}
      <ellipse cx={50} cy={H / 2} rx={12} ry={35} fill="#48A9A6" opacity={0.7} />
      <ellipse cx={50} cy={H / 2} rx={8} ry={25} fill="#2E86AB" opacity={0.6} />
      <circle cx={50} cy={H / 2} r={8} fill="#1A6B8A" />

      {/* Flujo de agua */}
      {!cavita && Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={70} y1={30 + i * 28} x2={W - 20} y2={30 + i * 28}
          stroke="#7FB3D3" strokeWidth={1.5} opacity={0.5} />
      ))}

      {/* Burbujas de cavitación */}
      {burbujas.map((b, i) => (
        <g key={i}>
          <circle cx={b.cx + 70} cy={b.cy} r={b.r} fill="white"
            stroke="#E84A5F" strokeWidth={1.2} opacity={0.85} />
          <circle cx={b.cx + 70 - b.r / 3} cy={b.cy - b.r / 3} r={b.r / 3}
            fill="white" opacity={0.5} />
        </g>
      ))}

      {/* Etiqueta */}
      <rect x={W - 195} y={8} width={187} height={44} rx={8}
        fill={cavita ? '#E84A5F' : '#2E86AB'} opacity={0.12} />
      <text x={W - 101} y={26} textAnchor="middle" fontSize={12} fill={cavita ? '#E84A5F' : '#2E86AB'} fontWeight="700">
        {cavita ? `⚠️ Cavitación activa` : '✅ Sin cavitación'}
      </text>
      <text x={W - 101} y={44} textAnchor="middle" fontSize={10} fill="var(--text-secondary)">
        P local = {presionLocal.toLocaleString('es-ES')} Pa · P vapor = {PRESION_VAPOR_AGUA.toLocaleString('es-ES')} Pa
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Slider helper
// ─────────────────────────────────────────────

interface SliderProps {
  label: string;
  valor: number;
  min: number;
  max: number;
  step: number;
  unidad: string;
  descripcion?: string;
  onChange: (v: number) => void;
}

function Slider({ label, valor, min, max, step, unidad, descripcion, onChange }: SliderProps) {
  const pct = ((valor - min) / (max - min)) * 100;
  return (
    <div className={styles.sliderGroup}>
      <label className={styles.sliderLabel}>
        {label}
        <span className={styles.sliderValor}>{valor} {unidad}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valor}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={styles.sliderInput}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
        aria-label={`${label}: ${valor} ${unidad}`}
      />
      {descripcion && <span className={styles.sliderDesc}>{descripcion}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMecanikaFluidos() {
  const [tabActivo, setTabActivo] = useState<TabActivo>('reynolds');

  const [reynolds, setReynolds] = useState<ReynoldsState>({
    velocidad: 1.5,
    longitud: 0.05,
    viscosidad: 0.001,
  });

  const [magnus, setMagnus] = useState<MagnusState>({
    omega: 4,
    velocidadTraslacion: 20,
  });

  const [bernoulli, setBernoulli] = useState<BernoulliState>({
    anguloAtaque: 6,
    modoRealidad: false,
  });

  const [machState, setMachState] = useState<MachState>({
    velocidad: 250,
    presionLocal: 5000,
  });

  const re = calcularReynolds(reynolds.velocidad, reynolds.longitud, reynolds.viscosidad);
  const flujo = clasificarFlujo(re);
  const mach = calcularMach(machState.velocidad);
  const regimenMach = clasificarMach(mach);

  const aplicarPreset = useCallback((p: PresetFluido) => {
    setReynolds({ velocidad: p.velocidad, longitud: p.longitud, viscosidad: p.viscosidad });
  }, []);

  const TABS: Array<{ id: TabActivo; label: string; emoji: string }> = [
    { id: 'reynolds', label: 'Número de Reynolds', emoji: '🌊' },
    { id: 'magnus', label: 'Efecto Magnus', emoji: '⚽' },
    { id: 'bernoulli', label: 'Bernoulli y el Avión', emoji: '✈️' },
    { id: 'mach', label: 'Mach y Cavitación', emoji: '💥' },
  ];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>💧 Mecánica de Fluidos</h1>
        <p className={styles.heroSubtitle}>
          Reynolds, efecto Magnus, el mito de Bernoulli en la aviación y los números de Mach.
          Visualizaciones interactivas con animaciones SVG en tiempo real.
        </p>
      </header>

      <LegalNotice />

      {/* Navegación de tabs */}
      <nav className={styles.tabNav} aria-label="Secciones del visualizador">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTabActivo(tab.id)}
            className={`${styles.tabBtn} ${tabActivo === tab.id ? styles.tabBtnActivo : ''}`}
            aria-pressed={tabActivo === tab.id}
            aria-label={tab.label}
          >
            <span className={styles.tabIcon} aria-hidden="true">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── TAB 1: Reynolds ── */}
      {tabActivo === 'reynolds' && (
        <section className={styles.seccion} aria-label="Número de Reynolds">
          <h2 className={styles.seccionTitulo}>Número de Reynolds</h2>
          <p className={styles.seccionDesc}>
            Re = ρvL/μ — compara las fuerzas inerciales con las fuerzas viscosas. Por debajo de 2.300 el flujo es ordenado (laminar); por encima de 4.000, caótico (turbulento).
          </p>

          {/* Presets */}
          <div className={styles.presetsGrid} role="group" aria-label="Ejemplos preconfigurados">
            {PRESETS_FLUIDO.map(p => (
              <button key={p.nombre} onClick={() => aplicarPreset(p)} className={styles.presetBtn}>
                <span aria-hidden="true">{p.emoji}</span>
                <span>{p.nombre}</span>
                <span className={styles.presetDesc}>{p.descripcion}</span>
              </button>
            ))}
          </div>

          <div className={styles.slidersGrid}>
            <Slider label="Velocidad v" valor={reynolds.velocidad} min={0.1} max={10} step={0.1}
              unidad="m/s" descripcion="Velocidad media del fluido en el canal"
              onChange={v => setReynolds(s => ({ ...s, velocidad: v }))} />
            <Slider label="Longitud L" valor={reynolds.longitud} min={0.01} max={1} step={0.01}
              unidad="m" descripcion="Longitud característica (diámetro de tubería)"
              onChange={v => setReynolds(s => ({ ...s, longitud: v }))} />
            <Slider label="Viscosidad μ" valor={reynolds.viscosidad} min={0.001} max={0.1} step={0.001}
              unidad="Pa·s" descripcion="Agua ≈ 0,001 · Sangre ≈ 0,004 · Miel ≈ 0,1"
              onChange={v => setReynolds(s => ({ ...s, viscosidad: v }))} />
          </div>

          {/* Resultado */}
          <div className={styles.resultadoCard} style={{ borderColor: flujo.color }}>
            <div className={styles.resultadoValor} style={{ color: flujo.color }}>
              Re = {Math.round(re).toLocaleString('es-ES')}
            </div>
            <div className={styles.resultadoLabel} style={{ color: flujo.color }}>
              Flujo {flujo.label}
            </div>
            <div className={styles.resultadoRango}>
              {re < 2300 && 'Por debajo del umbral de transición (2.300) — flujo ordenado y predecible'}
              {re >= 2300 && re <= 4000 && 'Zona de transición entre 2.300 y 4.000 — comportamiento inestable'}
              {re > 4000 && 'Por encima del umbral turbulento (4.000) — flujo caótico con vórtices'}
            </div>
          </div>

          <SvgReynolds re={re} clase={flujo.clase} />
        </section>
      )}

      {/* ── TAB 2: Magnus ── */}
      {tabActivo === 'magnus' && (
        <section className={styles.seccion} aria-label="Efecto Magnus">
          <h2 className={styles.seccionTitulo}>Efecto Magnus</h2>
          <p className={styles.seccionDesc}>
            Cuando una pelota gira, arrastra el aire a su alrededor. Un lado va más rápido (baja presión) y el otro más lento (alta presión). La diferencia de presión genera una fuerza lateral: la pelota curva.
          </p>

          <div className={styles.slidersGrid}>
            <Slider label="Rotación ω" valor={magnus.omega} min={-10} max={10} step={0.5}
              unidad="rad/s" descripcion="Positivo = topspin (curva hacia abajo) · Negativo = backspin"
              onChange={v => setMagnus(s => ({ ...s, omega: v }))} />
            <Slider label="Velocidad de traslación" valor={magnus.velocidadTraslacion} min={5} max={30} step={1}
              unidad="m/s" descripcion="Velocidad de vuelo de la pelota"
              onChange={v => setMagnus(s => ({ ...s, velocidadTraslacion: v }))} />
          </div>

          <div className={styles.resultadoCard}>
            <div className={styles.resultadoValor} style={{ color: magnus.omega >= 0 ? '#2E86AB' : '#E84A5F' }}>
              F Magnus = {Math.abs(calcularFuerzaMagnus(magnus.omega, magnus.velocidadTraslacion)).toFixed(3)} N
            </div>
            <div className={styles.resultadoLabel}>
              {magnus.omega > 0 ? 'Topspin — la pelota cae más rápido' : magnus.omega < 0 ? 'Backspin — la pelota flota más' : 'Sin rotación — trayectoria recta'}
            </div>
          </div>

          <SvgMagnus omega={magnus.omega} velocidadTraslacion={magnus.velocidadTraslacion} />

          {/* Ejemplos deportivos */}
          <div className={styles.ejemplosGrid}>
            {[
              { deporte: 'Fútbol', emoji: '⚽', descripcion: 'El tiro libre con efecto: ω ≈ 8 rad/s, curva hasta 3 m laterales en 30 m de vuelo' },
              { deporte: 'Tenis', emoji: '🎾', descripcion: 'Topspin: pelota baja antes, permite golpes más agresivos sin salir del campo' },
              { deporte: 'Béisbol', emoji: '⚾', descripcion: 'Curveball: backspin hace que la pelota caiga menos de lo esperado por el bateador' },
            ].map(e => (
              <div key={e.deporte} className={styles.ejemploCard}>
                <span className={styles.ejemploEmoji} aria-hidden="true">{e.emoji}</span>
                <strong>{e.deporte}</strong>
                <span className={styles.ejemploDesc}>{e.descripcion}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB 3: Bernoulli ── */}
      {tabActivo === 'bernoulli' && (
        <section className={styles.seccion} aria-label="Bernoulli y la sustentación del avión">
          <h2 className={styles.seccionTitulo}>Bernoulli y el Avión</h2>
          <p className={styles.seccionDesc}>
            El mito: "el avión vuela porque el aire de arriba va más rápido y por Bernoulli hay menos presión". La realidad: Bernoulli solo explica ~30% de la sustentación. El resto viene de la circulación (Kutta-Joukowski) y el ángulo de ataque.
          </p>

          <div className={styles.slidersGrid}>
            <Slider label="Ángulo de ataque" valor={bernoulli.anguloAtaque} min={0} max={20} step={1}
              unidad="°" descripcion="Mayor ángulo → más sustentación (hasta la entrada en pérdida ~16°)"
              onChange={v => setBernoulli(s => ({ ...s, anguloAtaque: v }))} />
          </div>

          <div className={styles.toggleRow}>
            <button
              onClick={() => setBernoulli(s => ({ ...s, modoRealidad: !s.modoRealidad }))}
              className={`${styles.toggleBtn} ${bernoulli.modoRealidad ? styles.toggleBtnOn : ''}`}
              aria-pressed={bernoulli.modoRealidad}
            >
              {bernoulli.modoRealidad ? '✅ Modo Realidad (Kutta-Joukowski)' : '⚠️ Modo Mito (Solo Bernoulli)'}
            </button>
          </div>

          <SvgBernoulli anguloAtaque={bernoulli.anguloAtaque} modoRealidad={bernoulli.modoRealidad} />

          <div className={styles.warningBox} role="note">
            <strong>¿Por qué vuela el avión de verdad?</strong>
            <p>
              La sustentación total se debe a: (1) la diferencia de presión Bernoulli (≈30%), (2) la circulación del flujo alrededor del ala — teorema de Kutta-Joukowski (≈50%), y (3) el ángulo de ataque que deflecta el aire hacia abajo por tercera ley de Newton (≈20%). Un avión puede volar boca abajo — algo imposible si solo operara Bernoulli.
            </p>
          </div>

          <div className={styles.infoGrid}>
            {[
              { titulo: 'Bernoulli (30%)', desc: 'Diferencia de curvatura entre extradós e intradós crea diferencia de velocidad y presión', color: '#2E86AB' },
              { titulo: 'Kutta-Joukowski (50%)', desc: 'La circulación del fluido alrededor del ala genera sustentación — el verdadero motor aerodinámico', color: '#48A9A6' },
              { titulo: 'Ángulo de ataque (20%)', desc: 'El ala desvía el aire hacia abajo; por 3ª ley de Newton el ala sube. Dominante en maniobras', color: '#27ae60' },
            ].map(info => (
              <div key={info.titulo} className={styles.infoCard} style={{ borderTopColor: info.color }}>
                <strong style={{ color: info.color }}>{info.titulo}</strong>
                <p>{info.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── TAB 4: Mach y Cavitación ── */}
      {tabActivo === 'mach' && (
        <section className={styles.seccion} aria-label="Número de Mach y cavitación">
          <h2 className={styles.seccionTitulo}>Mach y Cavitación</h2>

          {/* Mach */}
          <h3 className={styles.subseccionTitulo}>Número de Mach</h3>
          <p className={styles.seccionDesc}>
            M = v / c_sonido. Mide qué fracción de la velocidad del sonido alcanza un objeto. Cuando M &gt; 1 se forman ondas de choque — el "boom sónico".
          </p>

          <div className={styles.slidersGrid}>
            <Slider label="Velocidad del objeto" valor={machState.velocidad} min={0} max={2000} step={10}
              unidad="m/s" descripcion="Velocidad del sonido en aire: 343 m/s"
              onChange={v => setMachState(s => ({ ...s, velocidad: v }))} />
          </div>

          <div className={styles.resultadoCard} style={{ borderColor: regimenMach.color }}>
            <div className={styles.resultadoValor} style={{ color: regimenMach.color }}>
              M = {mach.toFixed(2)}
            </div>
            <div className={styles.resultadoLabel} style={{ color: regimenMach.color }}>
              {regimenMach.label}
            </div>
            <div className={styles.resultadoRango}>{regimenMach.descripcion}</div>
          </div>

          <SvgMach mach={mach} />

          <div className={styles.regimenesGrid}>
            {[
              { label: 'Subsónico', rango: 'M < 0,8', color: '#2E86AB', ejemplo: 'Avión comercial (M ≈ 0,85), helicóptero' },
              { label: 'Transónico', rango: '0,8 ≤ M ≤ 1,2', color: '#F4A261', ejemplo: 'Zona crítica: aparecen ondas de choque locales' },
              { label: 'Supersónico', rango: '1,2 < M ≤ 5', color: '#E84A5F', ejemplo: 'F-22 (M ≈ 2,2), Concorde (M ≈ 2,04), bala (M ≈ 2,7)' },
              { label: 'Hipersónico', rango: 'M > 5', color: '#9B2335', ejemplo: 'Cápsula Apolo reentrada (M ≈ 36), X-15 (M ≈ 6,7)' },
            ].map(r => (
              <div key={r.label} className={styles.regimenCard} style={{ borderLeftColor: r.color }}>
                <strong style={{ color: r.color }}>{r.label}</strong>
                <span className={styles.regimenRango}>{r.rango}</span>
                <span className={styles.regimenEjemplo}>{r.ejemplo}</span>
              </div>
            ))}
          </div>

          {/* Cavitación */}
          <h3 className={styles.subseccionTitulo} style={{ marginTop: '2.5rem' }}>Cavitación</h3>
          <p className={styles.seccionDesc}>
            Cuando la presión local de un líquido cae por debajo de su presión de vapor (2.337 Pa para agua a 20°C), se forman burbujas de vapor que implotan violentamente al entrar en zonas de mayor presión. El daño acumulado destruye metales.
          </p>

          <Slider label="Presión local" valor={machState.presionLocal} min={500} max={8000} step={100}
            unidad="Pa" descripcion={`Presión de vapor del agua a 20°C: 2.337 Pa. ${machState.presionLocal < PRESION_VAPOR_AGUA ? '⚠️ ¡Cavitación activa!' : '✅ Sin cavitación'}`}
            onChange={v => setMachState(s => ({ ...s, presionLocal: v }))} />

          <SvgCavitacion presionLocal={machState.presionLocal} />

          <div className={styles.aplicacionesGrid}>
            {[
              { titulo: 'Hélices de barco', desc: 'Las cavidades implotan sobre el metal con presiones de hasta 1.000 atm. Una hélice puede quedar inutilizada en semanas.' },
              { titulo: 'Litotripsia', desc: 'Uso médico controlado: ondas de choque que generan cavitación para fragmentar cálculos renales sin cirugía.' },
              { titulo: 'Sónar y ultrasonidos', desc: 'La cavitación acústica limpia piezas industriales y se usa en procesos de esterilización y homogenización.' },
            ].map(a => (
              <div key={a.titulo} className={styles.aplicacionCard}>
                <strong>{a.titulo}</strong>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sección educativa */}
      <EducationalSection title="¿Qué es la mecánica de fluidos?" subtitle="Fundamentos de flujo, presión y fenómenos aerodinámicos">

        <h3>Comparativa de Fenómenos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Fenómeno</th>
                <th>Descripción</th>
                <th>Aplicación</th>
                <th>Parámetro clave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Flujo laminar (Re bajo)</td>
                <td>Capas paralelas sin mezcla</td>
                <td>Microfluídica, sangre en capilares</td>
                <td>Re &lt; 2300</td>
              </tr>
              <tr>
                <td>Flujo turbulento (Re alto)</td>
                <td>Torbellinos caóticos</td>
                <td>Intercambiadores de calor, tuberías industriales</td>
                <td>Re &gt; 4000</td>
              </tr>
              <tr>
                <td>Efecto Magnus</td>
                <td>Trayectoria curvada por rotación</td>
                <td>Béisbol, fútbol, tenis, golf</td>
                <td>ω (velocidad angular)</td>
              </tr>
              <tr>
                <td>Principio de Bernoulli</td>
                <td>Mayor velocidad = menor presión</td>
                <td>Alas de avión, venturímetros</td>
                <td>P + ½ρv² = cte</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>✈️ Ingeniería Aeronáutica</h4>
            <p>Diseñar perfiles alares que maximicen la sustentación aplicando Bernoulli. El número de Reynolds determina si el flujo sobre el ala es laminar (eficiente) o turbulento (drag).</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>⚽ Deportes con Efecto</h4>
            <p>Los jugadores profesionales dominan intuitivamente el efecto Magnus: un balón con efecto lateral curva su trayectoria porque la rotación crea diferencia de presión a ambos lados.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🔧 Ingeniería de Tuberías</h4>
            <p>El número de Reynolds ayuda a predecir pérdidas de carga en tuberías. Un flujo turbulento disipa más energía pero transfiere más calor: el diseño depende del balance.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🚢 Diseño Naval</h4>
            <p>La cavitación es el mayor enemigo de las hélices de barco: las burbujas implosionan contra el metal causando erosión. Controlar la presión local evita cavitación.</p>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Qué significa que el número de Reynolds sea adimensional?</strong>
            <p>Re = ρvL/μ combina densidad, velocidad, tamaño y viscosidad en un único número sin unidades. Esto permite comparar flujos completamente diferentes: un avión y un barco pueden tener el mismo Re si sus proporciones lo permiten.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué curva un balón con efecto?</strong>
            <p>El efecto Magnus: la rotación del balón arrastra aire a su alrededor. En el lado donde el balón gira «con» el flujo, el aire acelera y la presión baja. En el otro lado sube. Esta diferencia de presión crea una fuerza lateral.</p>
            <div className={styles.faqTip}>💡 La fuerza Magnus es F = ρ·ω×v·V, proporcional a densidad del aire, velocidad angular y velocidad lineal.</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es exactamente la cavitación?</strong>
            <p>Cuando la presión local de un fluido cae por debajo de su presión de vapor, el líquido se vaporiza formando burbujas. Al recuperarse la presión, las burbujas implotan con fuerza devastadora, erosionando el metal de hélices y bombas.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿El principio de Bernoulli explica el vuelo?</strong>
            <p>Parcialmente. Bernoulli explica que el aire más veloz sobre el ala tiene menor presión. Pero la sustentación también requiere que el ala deflecte el aire hacia abajo (3ª ley de Newton). La realidad necesita ambos efectos.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Para qué se usa el número de Reynolds en la práctica?</strong>
            <p>Para escalar experimentos: se prueban modelos pequeños en túnel de viento manteniendo el mismo Re que el objeto real. Si el Re coincide, el comportamiento del flujo es dinámicamente similar.</p>
          </div>
        </div>

        <h3>Guía de Uso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Elige el fenómeno</h4>
              <p>Selecciona una de las 4 pestañas: Reynolds, Magnus, Bernoulli/Mach o Cavitación. Cada una ilustra un aspecto diferente de la mecánica de fluidos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Ajusta los parámetros</h4>
              <p>Usa los sliders para modificar velocidad, densidad, diámetro o viscosidad. Observa cómo cambia el número adimensional resultante en tiempo real.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Observa el régimen</h4>
              <p>Fíjate en el cambio visual entre flujo laminar (líneas paralelas) y turbulento (torbellinos). La transición ocurre gradualmente alrededor de Re 2300-4000.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Interpreta el resultado</h4>
              <p>Relaciona los valores calculados con aplicaciones reales: ¿en qué régimen opera un avión? ¿cuánto curva una pelota de tenis profesional?</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Compara fenómenos</h4>
              <p>Visita todas las pestañas para ver cómo los fluidos se comportan de formas radicalmente distintas según las condiciones. La unidad subyacente es la misma física.</p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📐</span>
            <div>
              <strong>Usa unidades SI</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Introduce velocidades en m/s, longitudes en m y viscosidades en Pa·s para obtener el Re correcto sin conversiones.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔢</span>
            <div>
              <strong>Re como clasificador</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Re &lt; 2300 → laminar. Re &gt; 4000 → turbulento. 2300-4000 → zona de transición inestable.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎯</span>
            <div>
              <strong>Similitud dinámica</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Dos flujos con el mismo Re se comportan igual aunque tengan escalas muy diferentes: principio clave para ensayos en túnel de viento.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💧</span>
            <div>
              <strong>Presión vs velocidad</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Bernoulli solo aplica a flujos estacionarios, incompresibles y sin fricción. Para flujos reales, añade términos de pérdida de carga.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBoxEdu}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            Errores Conceptuales Frecuentes
          </div>
          <ul className={styles.warningList}>
            <li><strong>No confundir Re alto con «rápido»</strong> — El número de Reynolds depende de viscosidad y tamaño: un insecto nadando en miel puede tener Re muy bajo a alta velocidad relativa.</li>
            <li><strong>Bernoulli no es la única causa del vuelo</strong> — La deflexión del aire (Newton) contribuye tanto o más que la diferencia de presión. Ambos efectos coexisten.</li>
            <li><strong>El efecto Magnus depende de la densidad del fluido</strong> — En el vacío no hay efecto Magnus: necesita un fluido para crear las diferencias de presión.</li>
            <li><strong>La cavitación no es ebullición térmica</strong> — Ocurre por presión baja, no temperatura alta. El agua puede «hervir» a 20°C si la presión cae lo suficiente.</li>
            <li><strong>Flujo turbulento no siempre es malo</strong> — En intercambiadores de calor, la turbulencia mejora la transferencia térmica. El objetivo es el régimen correcto para cada aplicación.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-mecanica-fluidos')} />
      <ShareCard appName="visualizador-mecanica-fluidos" />
      <Footer appName="visualizador-mecanica-fluidos" />
    </div>
  );
}
