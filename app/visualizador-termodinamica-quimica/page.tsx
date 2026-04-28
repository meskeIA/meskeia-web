'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './TermodinamicaQuimica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'entalpia' | 'gibbs' | 'equilibrio' | 'lechatelier';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'entalpia', titulo: 'Entalpía', icono: '⚡', subtitulo: 'Perfil de reacción y catalizadores' },
  { id: 'gibbs', titulo: 'Energía de Gibbs', icono: '🔮', subtitulo: 'ΔG = ΔH − TΔS' },
  { id: 'equilibrio', titulo: 'Equilibrio Kₑq', icono: '⚖️', subtitulo: 'Concentraciones y ΔG°' },
  { id: 'lechatelier', titulo: 'Le Chatelier', icono: '🏭', subtitulo: 'Síntesis de amoniaco Haber-Bosch' },
];

// ─────────────────────────────────────────────
// Sección 1: Diagrama de entalpía
// ─────────────────────────────────────────────

interface EjemploEntalpia {
  id: string;
  nombre: string;
  reaccion: string;
  dH: number; // kJ/mol
  ea: number; // kJ/mol (barrera de activación)
  descripcion: string;
}

const EJEMPLOS_ENTALPIA: EjemploEntalpia[] = [
  {
    id: 'metano',
    nombre: 'Combustión del metano',
    reaccion: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    dH: -890,
    ea: 125,
    descripcion: 'Reacción exotérmica: los productos tienen menos energía que los reactivos. ΔH negativo.',
  },
  {
    id: 'fotosintesis',
    nombre: 'Fotosíntesis',
    reaccion: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
    dH: 2803,
    ea: 0,
    descripcion: 'Reacción endotérmica: la planta absorbe energía lumínica. ΔH positivo.',
  },
  {
    id: 'haber',
    nombre: 'Síntesis de amoniaco (Haber)',
    reaccion: 'N₂ + 3H₂ ⇌ 2NH₃',
    dH: -92,
    ea: 335,
    descripcion: 'Moderadamente exotérmica pero con altísima barrera de activación — requiere catalizador de hierro.',
  },
];

const DiagramaEntalpia = () => {
  const [ejemploId, setEjemploId] = useState<string>('metano');
  const [catalizador, setCatalizador] = useState<number>(0); // 0-100 → reducción de Ea

  const ejemplo = EJEMPLOS_ENTALPIA.find(e => e.id === ejemploId) ?? EJEMPLOS_ENTALPIA[0];
  const esExo = ejemplo.dH < 0;

  // SVG viewBox 0 0 440 220
  const svgW = 440;
  const svgH = 220;
  const padX = 50;
  const padY = 30;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY * 2;

  // Niveles de energía normalizados (0 = línea base)
  const absMax = Math.max(Math.abs(ejemplo.dH), ejemplo.ea + Math.abs(ejemplo.dH)) || 100;
  const scaleY = (e: number) => padY + plotH / 2 - (e / absMax) * (plotH / 2 - 10);

  const yReactivos = scaleY(0);
  const yProductos = scaleY(-ejemplo.dH); // si exo: dH<0 → productos más bajos
  const eaReducida = ejemplo.ea * (1 - catalizador / 100);
  const yBarrera = scaleY(ejemplo.ea > 0 ? eaReducida : 0);

  const x0 = padX;
  const xMid = svgW / 2;
  const x1 = svgW - padX;

  const pathD = ejemplo.ea > 0
    ? `M ${x0} ${yReactivos} C ${x0 + plotW * 0.2} ${yReactivos}, ${xMid - 40} ${yBarrera + 8}, ${xMid} ${yBarrera} S ${x1 - plotW * 0.2} ${yProductos}, ${x1} ${yProductos}`
    : `M ${x0} ${yReactivos} C ${x0 + plotW * 0.35} ${yReactivos}, ${xMid - 40} ${yProductos}, ${x1} ${yProductos}`;

  const colorLinea = esExo ? '#22C55E' : '#F43F5E';

  return (
    <div>
      <div className={styles.ejemplosRow}>
        {EJEMPLOS_ENTALPIA.map(ej => (
          <button
            key={ej.id}
            className={`${styles.ejemploBtn} ${ej.id === ejemploId ? styles.ejemploBtnActivo : ''}`}
            onClick={() => { setEjemploId(ej.id); setCatalizador(0); }}
            aria-pressed={ej.id === ejemploId}
          >
            {ej.nombre}
          </button>
        ))}
      </div>

      <div className={styles.svgWrapper}>
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          aria-label={`Diagrama de entalpía para ${ejemplo.nombre}`}
          role="img"
        >
          {/* Ejes */}
          <line x1={x0} y1={padY} x2={x0} y2={svgH - padY} stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <line x1={x0} y1={svgH - padY} x2={x1} y2={svgH - padY} stroke="currentColor" strokeWidth="1.5" opacity="0.3" />

          {/* Etiquetas ejes */}
          <text x={x0 - 10} y={padY + plotH / 2} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6" transform={`rotate(-90,${x0 - 38},${padY + plotH / 2})`}>Energía (kJ/mol)</text>
          <text x={svgW / 2} y={svgH - 6} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Coordenada de reacción →</text>

          {/* Línea de reactivos */}
          <line x1={x0} y1={yReactivos} x2={x0 + 50} y2={yReactivos} stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
          <text x={x0 + 25} y={yReactivos - 8} textAnchor="middle" fontSize="11" fill="#6366F1" fontWeight="700">Reactivos</text>

          {/* Línea de productos */}
          <line x1={x1 - 50} y1={yProductos} x2={x1} y2={yProductos} stroke={colorLinea} strokeWidth="3" strokeLinecap="round" />
          <text x={x1 - 25} y={yProductos - 8} textAnchor="middle" fontSize="11" fill={colorLinea} fontWeight="700">Productos</text>

          {/* Curva de perfil */}
          <path d={pathD} fill="none" stroke={colorLinea} strokeWidth="2.5" strokeLinecap="round" />

          {/* Flecha ΔH */}
          <defs>
            <marker id="arrowDH" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 Z" fill={esExo ? '#22C55E' : '#F43F5E'} />
            </marker>
          </defs>
          <line
            x1={x1 - 12} y1={yReactivos}
            x2={x1 - 12} y2={yProductos + (esExo ? 6 : -6)}
            stroke={esExo ? '#22C55E' : '#F43F5E'} strokeWidth="1.5"
            markerEnd="url(#arrowDH)"
          />
          <text
            x={x1 + 5} y={(yReactivos + yProductos) / 2 + 4}
            fontSize="11" fill={esExo ? '#22C55E' : '#F43F5E'} fontWeight="700"
          >
            ΔH={ejemplo.dH > 0 ? '+' : ''}{formatNumber(ejemplo.dH, 0)}
          </text>

          {/* Barrera Ea (si existe) */}
          {ejemplo.ea > 0 && (
            <>
              <line x1={xMid} y1={yBarrera} x2={xMid} y2={yReactivos} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,3" />
              <text x={xMid + 6} y={(yBarrera + yReactivos) / 2 + 4} fontSize="10" fill="#F59E0B" fontWeight="700">
                Ea={formatNumber(eaReducida, 0)} kJ
              </text>
              {catalizador > 0 && (
                <text x={xMid + 6} y={(yBarrera + yReactivos) / 2 + 16} fontSize="9" fill="#22C55E">
                  (−{catalizador}%)
                </text>
              )}
            </>
          )}
        </svg>
      </div>

      {ejemplo.ea > 0 && (
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>🧪 Añadir catalizador</span>
          <input
            type="range" min={0} max={80} value={catalizador}
            onChange={e => setCatalizador(Number(e.target.value))}
            className={styles.slider}
            aria-label="Reducción de barrera de activación con catalizador"
          />
          <span className={styles.sliderValue}>−{catalizador}% Ea</span>
        </div>
      )}

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0.5rem 0' }}>
        {ejemplo.reaccion}
      </p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
        {ejemplo.descripcion}
        {ejemplo.ea > 0 && catalizador > 0 && ' El catalizador reduce la barrera de activación sin afectar ΔH (los productos y reactivos quedan en la misma posición energética).'}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sección 2: Energía libre de Gibbs
// ─────────────────────────────────────────────

const R_CONSTANTE = 8.314; // J/(mol·K)

interface CasoGibbs {
  signoDH: string;
  signoDS: string;
  signoG: string;
  cuando: string;
}

const CASOS_GIBBS: CasoGibbs[] = [
  { signoDH: '−', signoDS: '+', signoG: '− siempre', cuando: 'Siempre espontánea' },
  { signoDH: '+', signoDS: '−', signoG: '+ siempre', cuando: 'Nunca espontánea' },
  { signoDH: '−', signoDS: '−', signoG: 'depende de T', cuando: 'Espontánea a T baja' },
  { signoDH: '+', signoDS: '+', signoG: 'depende de T', cuando: 'Espontánea a T alta' },
];

const CalculadoraGibbs = () => {
  const [dH, setDH] = useState<number>(-100);  // kJ/mol
  const [dS, setDS] = useState<number>(50);    // J/(mol·K)
  const [T, setT] = useState<number>(298);      // K

  const dG = dH * 1000 - T * dS; // en J/mol
  const dGkJ = dG / 1000;

  const espontanea = dGkJ < -1;
  const noEspontanea = dGkJ > 1;
  const equilibrio = !espontanea && !noEspontanea;

  const claseResultado = espontanea
    ? styles.resultadoEspontanea
    : noEspontanea
    ? styles.resultadoNoEspontanea
    : styles.resultadoEquilibrio;

  const colorDG = espontanea ? '#16A34A' : noEspontanea ? '#DC2626' : '#D97706';
  const etiqueta = espontanea ? '✅ Reacción espontánea' : noEspontanea ? '❌ Reacción no espontánea' : '⚖️ Sistema en equilibrio';

  // Determinar fila activa en tabla
  const filaActiva = (() => {
    if (dH < 0 && dS > 0) return 0;
    if (dH > 0 && dS < 0) return 1;
    if (dH < 0 && dS < 0) return 2;
    return 3;
  })();

  return (
    <div>
      <div className={styles.formulaCentral} aria-label="Fórmula de Gibbs">
        ΔG = ΔH − T·ΔS
      </div>

      <div className={styles.card}>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>ΔH (entalpía)</span>
          <input
            type="range" min={-500} max={500} value={dH}
            onChange={e => setDH(Number(e.target.value))}
            className={styles.slider}
            aria-label={`Entalpía: ${dH} kJ/mol`}
          />
          <span className={styles.sliderValue}>{dH > 0 ? '+' : ''}{formatNumber(dH, 0)} kJ/mol</span>
        </div>

        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>ΔS (entropía)</span>
          <input
            type="range" min={-300} max={300} value={dS}
            onChange={e => setDS(Number(e.target.value))}
            className={styles.slider}
            aria-label={`Entropía: ${dS} J/mol·K`}
          />
          <span className={styles.sliderValue}>{dS > 0 ? '+' : ''}{formatNumber(dS, 0)} J/mol·K</span>
        </div>

        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>T (temperatura)</span>
          <input
            type="range" min={1} max={1000} value={T}
            onChange={e => setT(Number(e.target.value))}
            className={styles.slider}
            aria-label={`Temperatura: ${T} K`}
          />
          <span className={styles.sliderValue}>{formatNumber(T, 0)} K ({formatNumber(T - 273, 0)} °C)</span>
        </div>
      </div>

      <div className={`${styles.resultadoGibbs} ${claseResultado}`} role="status" aria-live="polite">
        <div className={styles.resultadoDG} style={{ color: colorDG }}>
          ΔG = {dGkJ > 0 ? '+' : ''}{formatNumber(dGkJ, 1)} kJ/mol
        </div>
        <p className={styles.resultadoDesc} style={{ color: colorDG }}>{etiqueta}</p>
      </div>

      <div className={styles.card}>
        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 0, marginBottom: '0.7rem' }}>
          Los 4 casos posibles de ΔH y ΔS:
        </p>
        <table className={styles.tablaCasos} aria-label="Tabla de casos de signo de ΔH y ΔS">
          <thead>
            <tr>
              <th>ΔH</th>
              <th>ΔS</th>
              <th>ΔG</th>
              <th>Espontaneidad</th>
            </tr>
          </thead>
          <tbody>
            {CASOS_GIBBS.map((caso, i) => (
              <tr key={i} className={i === filaActiva ? styles.filaActiva : ''} aria-current={i === filaActiva ? 'true' : undefined}>
                <td><span className={caso.signoDH === '−' ? styles.signoNeg : styles.signoPos}>{caso.signoDH}</span></td>
                <td><span className={caso.signoDS === '+' ? styles.signoNeg : styles.signoPos}>{caso.signoDS}</span></td>
                <td><span className={styles.signoCero}>{caso.signoG}</span></td>
                <td>{caso.cuando}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sección 3: Equilibrio Kₑq
// ─────────────────────────────────────────────

const EquilibrioKeq = () => {
  const [logKeq, setLogKeq] = useState<number>(0); // log10 de Keq: -2 a +2

  const keq = Math.pow(10, logKeq);
  const T = 298; // K
  const R = R_CONSTANTE;

  // Para A ⇌ B, si [A]₀ = 1 mol/L: [B]eq = Keq/(1+Keq), [A]eq = 1/(1+Keq)
  const concProductos = keq / (1 + keq);
  const concReactivos = 1 / (1 + keq);

  const pctProd = Math.min(concProductos * 100, 100);
  const pctReact = Math.min(concReactivos * 100, 100);

  const dG0 = -R * T * Math.log(keq) / 1000; // kJ/mol

  const descripcionKeq = keq > 100
    ? 'El equilibrio favorece fuertemente los productos (Keq >> 1)'
    : keq < 0.01
    ? 'El equilibrio favorece fuertemente los reactivos (Keq << 1)'
    : keq > 1
    ? 'El equilibrio favorece los productos (Keq > 1)'
    : keq < 1
    ? 'El equilibrio favorece los reactivos (Keq < 1)'
    : 'Concentraciones iguales de reactivos y productos (Keq ≈ 1)';

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>log₁₀(Kₑq)</span>
          <input
            type="range" min={-2} max={2} step={0.1} value={logKeq}
            onChange={e => setLogKeq(Number(e.target.value))}
            className={styles.slider}
            aria-label={`log10 de Kₑq: ${logKeq}`}
          />
          <span className={styles.sliderValue}>{logKeq >= 0 ? '+' : ''}{formatNumber(logKeq, 1)}</span>
        </div>

        <div className={styles.keqDisplay} aria-live="polite">
          <div className={styles.keqValor}>Kₑq = {keq >= 100 ? formatNumber(keq, 0) : formatNumber(keq, 2)}</div>
          <p className={styles.keqLabel}>{descripcionKeq}</p>
        </div>
      </div>

      {/* SVG con recipientes y moléculas */}
      <div className={styles.svgWrapper}>
        <svg viewBox="0 0 440 160" width="100%" aria-label="Diagrama de equilibrio A ⇌ B" role="img">
          {/* Recipiente reactivos */}
          <rect x={30} y={30} width={140} height={110} rx={8} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <text x={100} y={22} textAnchor="middle" fontSize="13" fontWeight="700" fill="#6366F1">Reactivos (A)</text>
          <rect x={34} y={34} width={132} height={102} rx={6} fill="#EEF2FF" opacity="0.5" />

          {/* Barra de reactivos */}
          <rect x={34} y={34 + 102 * (1 - pctReact / 100)} width={132} height={102 * (pctReact / 100)} rx={4}
            fill="#6366F1" opacity="0.6" style={{ transition: 'all 0.6s ease' }} />
          <text x={100} y={90} textAnchor="middle" fontSize="16" fontWeight="800" fill="white">
            {formatNumber(pctReact, 0)}%
          </text>

          {/* Flecha de equilibrio */}
          <text x={220} y={82} textAnchor="middle" fontSize="22" fontWeight="700" fill="currentColor" opacity="0.5">⇌</text>
          <text x={220} y={100} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.4">A ⇌ B</text>

          {/* Recipiente productos */}
          <rect x={270} y={30} width={140} height={110} rx={8} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <text x={340} y={22} textAnchor="middle" fontSize="13" fontWeight="700" fill="#2E86AB">Productos (B)</text>
          <rect x={274} y={34} width={132} height={102} rx={6} fill="#E0F2FE" opacity="0.5" />

          {/* Barra de productos */}
          <rect x={274} y={34 + 102 * (1 - pctProd / 100)} width={132} height={102 * (pctProd / 100)} rx={4}
            fill="#2E86AB" opacity="0.6" style={{ transition: 'all 0.6s ease' }} />
          <text x={340} y={90} textAnchor="middle" fontSize="16" fontWeight="800" fill="white">
            {formatNumber(pctProd, 0)}%
          </text>
        </svg>
      </div>

      <div className={styles.relacionGibbs} aria-live="polite">
        <span>Relación con energía libre estándar: ΔG° = −RT · ln(Kₑq)</span>
        <strong>
          ΔG° = {dG0 > 0 ? '+' : ''}{formatNumber(dG0, 1)} kJ/mol
          {dG0 < -5 ? ' → Productos favorecidos' : dG0 > 5 ? ' → Reactivos favorecidos' : ' → Equilibrio intermedio'}
        </strong>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sección 4: Le Chatelier — Síntesis de amoniaco
// ─────────────────────────────────────────────

type Perturbacion = 'ninguna' | 'concentracion' | 'temperatura' | 'presion';

interface InfoPerturbacion {
  id: Perturbacion;
  icono: string;
  label: string;
  explicacion: string;
  desplaza: 'productos' | 'reactivos';
  pctN2: number;
  pctH2: number;
  pctNH3: number;
}

const PERTURBACIONES: InfoPerturbacion[] = [
  {
    id: 'concentracion',
    icono: '🧪',
    label: 'Añadir N₂',
    explicacion:
      'Al aumentar la concentración de N₂ (reactivo), el sistema contrarresta el cambio desplazándose hacia los productos para consumir el exceso de N₂ y producir más NH₃.',
    desplaza: 'productos',
    pctN2: 75, pctH2: 50, pctNH3: 70,
  },
  {
    id: 'temperatura',
    icono: '🌡️',
    label: 'Aumentar T',
    explicacion:
      'La síntesis de NH₃ es exotérmica (ΔH = −92 kJ/mol). Al subir la temperatura, el sistema favorece la reacción inversa (endotérmica) para absorber el calor añadido, desplazándose hacia reactivos.',
    desplaza: 'reactivos',
    pctN2: 65, pctH2: 70, pctNH3: 25,
  },
  {
    id: 'presion',
    icono: '💨',
    label: 'Aumentar presión',
    explicacion:
      'Los reactivos ocupan 4 moles de gas (1 N₂ + 3 H₂), los productos solo 2 moles (2 NH₃). Al aumentar la presión, el sistema se desplaza hacia donde hay menos moles de gas: los productos.',
    desplaza: 'productos',
    pctN2: 55, pctH2: 40, pctNH3: 75,
  },
];

const BASE_HABER = { pctN2: 50, pctH2: 50, pctNH3: 40 };

const LeChatelier = () => {
  const [pertSeleccion, setPertSeleccion] = useState<Perturbacion>('ninguna');

  const pert = PERTURBACIONES.find(p => p.id === pertSeleccion);
  const datos = pert ?? { pctN2: BASE_HABER.pctN2, pctH2: BASE_HABER.pctH2, pctNH3: BASE_HABER.pctNH3, desplaza: 'productos' as const };

  return (
    <div>
      <div className={styles.haberInfo}>
        <div className={styles.haberFormula}>N₂ + 3H₂ ⇌ 2NH₃ &nbsp; (ΔH = −92 kJ/mol)</div>
        <p className={styles.haberStats}>Proceso Haber-Bosch · ~150 millones de toneladas de NH₃/año · 1-2% del consumo energético mundial</p>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.7rem', marginTop: 0 }}>
        Elige una perturbación y observa cómo el equilibrio responde según el principio de Le Chatelier:
      </p>

      <div className={styles.perturbaciones} role="group" aria-label="Perturbaciones del equilibrio">
        {PERTURBACIONES.map(p => (
          <button
            key={p.id}
            className={`${styles.pertBtn} ${pertSeleccion === p.id ? styles.pertBtnActivo : ''}`}
            onClick={() => setPertSeleccion(pertSeleccion === p.id ? 'ninguna' : p.id)}
            aria-pressed={pertSeleccion === p.id}
          >
            <span className={styles.pertIcono} aria-hidden="true">{p.icono}</span>
            {p.label}
          </button>
        ))}
      </div>

      {pert && (
        <div className={styles.lechatResult} role="status" aria-live="polite">
          <div className={styles.lechatReaccion}>N₂ + 3H₂ ⇌ 2NH₃</div>
          <p className={styles.lechatExplicacion}>{pert.explicacion}</p>
          <div className={`${styles.lechatDesplaza} ${pert.desplaza === 'productos' ? styles.haciaProductos : styles.haciaReactivos}`}>
            {pert.desplaza === 'productos' ? '→ Equilibrio se desplaza hacia los PRODUCTOS (más NH₃)' : '← Equilibrio se desplaza hacia los REACTIVOS (menos NH₃)'}
          </div>
        </div>
      )}

      {/* Barras de concentración */}
      <div className={styles.card}>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 0, marginBottom: '0.7rem' }}>
          Concentraciones relativas de cada especie:
        </p>
        <div className={styles.barrasHaber}>
          <div className={styles.barraHaberItem}>
            <span className={styles.barraHaberLabel}>N₂</span>
            <div className={styles.barraHaberTrack}>
              <div className={`${styles.barraHaberFill} ${styles.barraHaberN2}`} style={{ width: `${datos.pctN2}%` }}>
                <span className={styles.barraHaberTexto}>{datos.pctN2}%</span>
              </div>
            </div>
          </div>
          <div className={styles.barraHaberItem}>
            <span className={styles.barraHaberLabel}>H₂</span>
            <div className={styles.barraHaberTrack}>
              <div className={`${styles.barraHaberFill} ${styles.barraHaberH2}`} style={{ width: `${datos.pctH2}%` }}>
                <span className={styles.barraHaberTexto}>{datos.pctH2}%</span>
              </div>
            </div>
          </div>
          <div className={styles.barraHaberItem}>
            <span className={styles.barraHaberLabel}>NH₃</span>
            <div className={styles.barraHaberTrack}>
              <div className={`${styles.barraHaberFill} ${styles.barraHaberNH3}`} style={{ width: `${datos.pctNH3}%` }}>
                <span className={styles.barraHaberTexto}>{datos.pctNH3}%</span>
              </div>
            </div>
          </div>
        </div>
        {!pert && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 0, marginTop: '0.5rem' }}>
            ↑ Estado de equilibrio inicial. Selecciona una perturbación para ver el cambio.
          </p>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function TermodinamicaQuimicaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('entalpia');

  const seccionInfo = SECCIONES.find(s => s.id === seccionActiva) ?? SECCIONES[0];

  const bloques = useMemo(() => [
    {
      titulo: '¿En qué se diferencia de la termodinámica física?',
      contenido: (
        <p>
          La termodinámica física estudia máquinas de calor, ciclos de Carnot y la entropía del universo. La
          termodinámica <em>química</em> responde a una pregunta distinta: <strong>¿ocurrirá esta reacción?</strong> y
          <strong> ¿hasta dónde llegará?</strong> Conecta la energía con el equilibrio molecular y es la base de la
          química industrial moderna.
        </p>
      ),
    },
    {
      titulo: 'Entalpía (ΔH): el intercambio de calor en reacciones',
      contenido: (
        <>
          <p>
            ΔH mide el calor intercambiado a presión constante. Si ΔH &lt; 0 la reacción es <strong>exotérmica</strong>
            (libera calor — los productos tienen menos energía). Si ΔH &gt; 0 es <strong>endotérmica</strong> (absorbe
            calor). Pero ΔH solo no determina la espontaneidad: el hielo se derrite a temperatura ambiente aunque ΔH &gt; 0.
          </p>
          <p>
            La <strong>barrera de activación Ea</strong> es la energía necesaria para iniciar la reacción. Un
            catalizador reduce Ea sin cambiar los niveles energéticos de reactivos y productos — y por tanto sin cambiar ΔH.
          </p>
        </>
      ),
    },
    {
      titulo: 'Entropía química (ΔS): el desorden molecular',
      contenido: (
        <p>
          La entropía mide el número de microestados posibles. Un gas tiene más entropía que un líquido; una molécula
          grande más que una pequeña. Cuando una reacción produce más moles de gas o especies más desordenadas, ΔS &gt; 0.
          La naturaleza tiende a maximizar la entropía total del universo — y esto compite con (o coopera con) la entalpía.
        </p>
      ),
    },
    {
      titulo: 'Energía libre de Gibbs: el criterio definitivo de espontaneidad',
      contenido: (
        <>
          <p>
            ΔG = ΔH − T·ΔS combina entalpía y entropía en un único criterio: si ΔG &lt; 0, la reacción es espontánea a
            esa temperatura. Si ΔG &gt; 0, no lo es. Si ΔG ≈ 0, el sistema está en equilibrio.
          </p>
          <p>
            La temperatura juega un papel clave: a T alta el término −T·ΔS domina; a T baja domina ΔH. Por eso algunas
            reacciones solo son espontáneas por encima (o por debajo) de cierta temperatura.
          </p>
          <div className={styles.warningBox}>
            <strong>Importante:</strong> Una reacción con ΔG &lt; 0 es termodinámicamente espontánea, pero puede ser
            cinéticamente muy lenta. La gasolina es espontánea oxidarse en el aire, pero no lo hace sin ignición.
            <strong> La termodinámica dice &apos;puede&apos;, la cinética dice &apos;cuándo&apos;.</strong>
          </div>
        </>
      ),
    },
    {
      titulo: 'Constante de equilibrio Kₑq y su conexión con ΔG°',
      contenido: (
        <p>
          En el equilibrio, las velocidades de reacción directa e inversa son iguales. La constante Kₑq = [productos] /
          [reactivos] (expresada en concentraciones elevadas a sus coeficientes estequiométricos). Si Kₑq &gt;&gt; 1, los
          productos están favorecidos; si Kₑq &lt;&lt; 1, los reactivos. La relación ΔG° = −RT·ln(Kₑq) permite calcular
          una de las dos magnitudes conociendo la otra.
        </p>
      ),
    },
    {
      titulo: 'Le Chatelier en la industria: el proceso Haber-Bosch',
      contenido: (
        <>
          <p>
            El proceso Haber-Bosch sintetiza amoniaco (NH₃) desde N₂ y H₂. Sin él, no existiría suficiente fertilizante
            para alimentar a la población mundial actual. El principio de Le Chatelier dicta las condiciones óptimas:
          </p>
          <ul>
            <li><strong>Presión alta</strong> (~200 atm) → favorece los productos (menos moles de gas)</li>
            <li><strong>Temperatura media</strong> (~400-500 °C) → compromiso entre velocidad (cinética) y rendimiento (termodinámica)</li>
            <li><strong>Catalizador de hierro</strong> → reduce Ea para que la reacción sea viable a 400 °C</li>
          </ul>
          <p>
            Sin el catalizador, habría que subir la temperatura tanto que el equilibrio se desplazaría hacia los reactivos,
            haciendo el proceso inviable industrialmente. Haber y Bosch recibieron sendos premios Nobel por este desarrollo.
          </p>
        </>
      ),
    },
  ], []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Termodinámica Química</h1>
          <p className={styles.subtitle}>
            ΔG, entalpía, entropía y equilibrio — cuándo y por qué ocurren las reacciones
          </p>
        </header>

        <LegalNotice />

        {/* Navegación de secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map(sec => (
            <button
              key={sec.id}
              className={`${styles.navBtn} ${seccionActiva === sec.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(sec.id)}
              aria-pressed={seccionActiva === sec.id}
              aria-label={`${sec.titulo}: ${sec.subtitulo}`}
            >
              <span className={styles.navIcono} aria-hidden="true">{sec.icono}</span>
              <span className={styles.navTexto}>{sec.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de sección activa */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>{seccionInfo.titulo}</h2>
          <p className={styles.seccionSubtitulo}>{seccionInfo.subtitulo}</p>
        </div>

        {/* Contenido de sección */}
        <div className={styles.seccionContent}>
          {seccionActiva === 'entalpia' && <DiagramaEntalpia />}
          {seccionActiva === 'gibbs' && <CalculadoraGibbs />}
          {seccionActiva === 'equilibrio' && <EquilibrioKeq />}
          {seccionActiva === 'lechatelier' && <LeChatelier />}
        </div>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Termodinámica Química: ¿Cuándo Ocurre una Reacción?"
          subtitle="ΔG, entalpía, entropía y equilibrio — la energética de las reacciones"
        >
          {bloques.map((bloque, i) => (
            <div key={i}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{bloque.titulo}</h3>
              {bloque.contenido}
            </div>
          ))}
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-termodinamica-quimica')} />
        <ShareCard appName="visualizador-termodinamica-quimica" />
        <Footer appName="visualizador-termodinamica-quimica" />
      </div>
    </>
  );
}
