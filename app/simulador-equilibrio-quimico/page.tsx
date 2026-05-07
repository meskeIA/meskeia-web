'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
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
import styles from './SimuladorEquilibrioQuimico.module.css';

// ============================================================
// Tipos
// ============================================================

type EstadoFisico = 'g' | 'l' | 's' | 'aq';
type DireccionDesplazamiento = 'derecha' | 'izquierda' | 'equilibrio';

interface Especie {
  simbolo: string;
  coef: number;
  estado: EstadoFisico;
}

interface Reaccion {
  id: string;
  nombre: string;
  ecuacion: string;
  reactivos: Especie[];
  productos: Especie[];
  Kc: number;
  exotermica: boolean;
  deltaH: number; // kJ/mol
  contexto: string;
  // Concentraciones iniciales sugeridas (orden = reactivos + productos)
  inicialesSugeridas: Record<string, number>;
}

type TipoPerturbacion =
  | 'anadir-reactivo'
  | 'quitar-reactivo'
  | 'anadir-producto'
  | 'quitar-producto'
  | 'subir-temperatura'
  | 'bajar-temperatura'
  | 'comprimir'
  | 'expandir'
  | 'catalizador';

interface Perturbacion {
  tipo: TipoPerturbacion;
  especie?: string;
  cantidad?: number;
  descripcion: string;
}

// ============================================================
// Reacciones del simulador
// ============================================================

const REACCIONES: Reaccion[] = [
  {
    id: 'haber-bosch',
    nombre: 'Síntesis de amoníaco (Haber-Bosch)',
    ecuacion: 'N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g)',
    reactivos: [
      { simbolo: 'N₂', coef: 1, estado: 'g' },
      { simbolo: 'H₂', coef: 3, estado: 'g' },
    ],
    productos: [{ simbolo: 'NH₃', coef: 2, estado: 'g' }],
    Kc: 0.5,
    exotermica: true,
    deltaH: -92,
    contexto: 'Producción industrial de fertilizantes. Δn = 2 − 4 = −2 (mol gas).',
    inicialesSugeridas: { 'N₂': 1.0, 'H₂': 3.0, 'NH₃': 0.5 },
  },
  {
    id: 'esterificacion',
    nombre: 'Esterificación (acetato de etilo)',
    ecuacion: 'CH₃COOH(l) + C₂H₅OH(l) ⇌ CH₃COOC₂H₅(l) + H₂O(l)',
    reactivos: [
      { simbolo: 'CH₃COOH', coef: 1, estado: 'l' },
      { simbolo: 'C₂H₅OH', coef: 1, estado: 'l' },
    ],
    productos: [
      { simbolo: 'CH₃COOC₂H₅', coef: 1, estado: 'l' },
      { simbolo: 'H₂O', coef: 1, estado: 'l' },
    ],
    Kc: 4.0,
    exotermica: false,
    deltaH: -3,
    contexto: 'Equilibrio en disolución líquida. Δn = 0, la presión no afecta.',
    inicialesSugeridas: { 'CH₃COOH': 1.0, 'C₂H₅OH': 1.0, 'CH₃COOC₂H₅': 0.2, 'H₂O': 0.2 },
  },
  {
    id: 'pcl5',
    nombre: 'Disociación de PCl₅',
    ecuacion: 'PCl₅(g) ⇌ PCl₃(g) + Cl₂(g)',
    reactivos: [{ simbolo: 'PCl₅', coef: 1, estado: 'g' }],
    productos: [
      { simbolo: 'PCl₃', coef: 1, estado: 'g' },
      { simbolo: 'Cl₂', coef: 1, estado: 'g' },
    ],
    Kc: 0.04,
    exotermica: false,
    deltaH: 88,
    contexto: 'Reacción endotérmica. Δn = +1: la presión sí afecta.',
    inicialesSugeridas: { 'PCl₅': 1.0, 'PCl₃': 0.1, 'Cl₂': 0.1 },
  },
  {
    id: 'so3',
    nombre: 'Síntesis de SO₃ (proceso de contacto)',
    ecuacion: '2 SO₂(g) + O₂(g) ⇌ 2 SO₃(g)',
    reactivos: [
      { simbolo: 'SO₂', coef: 2, estado: 'g' },
      { simbolo: 'O₂', coef: 1, estado: 'g' },
    ],
    productos: [{ simbolo: 'SO₃', coef: 2, estado: 'g' }],
    Kc: 4.32,
    exotermica: true,
    deltaH: -198,
    contexto: 'Producción de ácido sulfúrico. Δn = −1: comprimir favorece productos.',
    inicialesSugeridas: { 'SO₂': 1.0, 'O₂': 0.5, 'SO₃': 0.5 },
  },
  {
    id: 'no2-n2o4',
    nombre: 'Equilibrio NO₂ / N₂O₄',
    ecuacion: '2 NO₂(g) ⇌ N₂O₄(g)',
    reactivos: [{ simbolo: 'NO₂', coef: 2, estado: 'g' }],
    productos: [{ simbolo: 'N₂O₄', coef: 1, estado: 'g' }],
    Kc: 170,
    exotermica: true,
    deltaH: -57,
    contexto: 'Equilibrio rojizo/incoloro clásico. Δn = −1.',
    inicialesSugeridas: { 'NO₂': 0.2, 'N₂O₄': 1.0 },
  },
  {
    id: 'water-gas-shift',
    nombre: 'Water-gas shift (CO + H₂O)',
    ecuacion: 'CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)',
    reactivos: [
      { simbolo: 'CO', coef: 1, estado: 'g' },
      { simbolo: 'H₂O', coef: 1, estado: 'g' },
    ],
    productos: [
      { simbolo: 'CO₂', coef: 1, estado: 'g' },
      { simbolo: 'H₂', coef: 1, estado: 'g' },
    ],
    Kc: 5.0,
    exotermica: true,
    deltaH: -41,
    contexto: 'Producción de hidrógeno industrial. Δn = 0, P no afecta.',
    inicialesSugeridas: { 'CO': 1.0, 'H₂O': 1.0, 'CO₂': 0.5, 'H₂': 0.5 },
  },
];

// ============================================================
// Funciones de cálculo
// ============================================================

function especieParticipaEnK(estado: EstadoFisico, reaccionTodaEnLiquido: boolean): boolean {
  // Sólidos y líquidos puros NO entran en Kc.
  // Excepción didáctica: la esterificación se trata como en disolución, así que
  // si TODA la reacción es líquida, las concentraciones sí entran en Kc.
  if (reaccionTodaEnLiquido) return true;
  return estado === 'g' || estado === 'aq';
}

function calcularQ(reaccion: Reaccion, concentraciones: Record<string, number>): number {
  const todaEnLiquido =
    reaccion.reactivos.every((e) => e.estado === 'l') &&
    reaccion.productos.every((e) => e.estado === 'l');

  let numerador = 1;
  let denominador = 1;
  let hayNumerador = false;
  let hayDenominador = false;

  for (const p of reaccion.productos) {
    if (especieParticipaEnK(p.estado, todaEnLiquido)) {
      const c = Math.max(concentraciones[p.simbolo] ?? 0, 1e-12);
      numerador *= Math.pow(c, p.coef);
      hayNumerador = true;
    }
  }
  for (const r of reaccion.reactivos) {
    if (especieParticipaEnK(r.estado, todaEnLiquido)) {
      const c = Math.max(concentraciones[r.simbolo] ?? 0, 1e-12);
      denominador *= Math.pow(c, r.coef);
      hayDenominador = true;
    }
  }
  if (!hayNumerador) numerador = 1;
  if (!hayDenominador) denominador = 1;
  return numerador / denominador;
}

function deltaN(reaccion: Reaccion): number {
  const sumProd = reaccion.productos
    .filter((e) => e.estado === 'g')
    .reduce((s, e) => s + e.coef, 0);
  const sumReact = reaccion.reactivos
    .filter((e) => e.estado === 'g')
    .reduce((s, e) => s + e.coef, 0);
  return sumProd - sumReact;
}

/**
 * Calcula nuevo equilibrio resolviendo numéricamente el avance ξ tal que Q(ξ) = Kc.
 * Usa búsqueda binaria sobre el rango físicamente posible de ξ.
 */
function nuevoEquilibrio(
  reaccion: Reaccion,
  concentraciones: Record<string, number>,
  KcEfectiva: number,
): Record<string, number> {
  const todaEnLiquido =
    reaccion.reactivos.every((e) => e.estado === 'l') &&
    reaccion.productos.every((e) => e.estado === 'l');

  // Rango de ξ
  // ξ > 0: avanza hacia productos, consume reactivos. Limit: min(c[r]/coef)
  let ximax = Infinity;
  for (const r of reaccion.reactivos) {
    if (especieParticipaEnK(r.estado, todaEnLiquido)) {
      const c = concentraciones[r.simbolo] ?? 0;
      ximax = Math.min(ximax, c / r.coef);
    }
  }
  // ξ < 0: avanza hacia reactivos, consume productos. Limit: -min(c[p]/coef)
  let ximin = -Infinity;
  for (const p of reaccion.productos) {
    if (especieParticipaEnK(p.estado, todaEnLiquido)) {
      const c = concentraciones[p.simbolo] ?? 0;
      ximin = Math.max(ximin, -c / p.coef);
    }
  }
  if (!isFinite(ximax)) ximax = 100;
  if (!isFinite(ximin)) ximin = -100;

  // f(ξ) = Q(concentraciones desplazadas en ξ) - Kc
  const f = (xi: number): number => {
    const conc: Record<string, number> = {};
    for (const r of reaccion.reactivos) {
      conc[r.simbolo] = Math.max((concentraciones[r.simbolo] ?? 0) - r.coef * xi, 1e-12);
    }
    for (const p of reaccion.productos) {
      conc[p.simbolo] = Math.max((concentraciones[p.simbolo] ?? 0) + p.coef * xi, 1e-12);
    }
    return calcularQ(reaccion, conc) - KcEfectiva;
  };

  // Búsqueda binaria con ε
  const eps = 1e-6;
  let lo = ximin + eps;
  let hi = ximax - eps;
  const flo = f(lo);
  const fhi = f(hi);
  let xi = 0;
  if (flo * fhi > 0) {
    // No hay raíz en el rango (caso patológico): devolver tal cual
    return { ...concentraciones };
  }
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-9) {
      xi = mid;
      break;
    }
    if (fm * f(lo) < 0) {
      hi = mid;
    } else {
      lo = mid;
    }
    xi = mid;
  }

  const resultado: Record<string, number> = {};
  for (const r of reaccion.reactivos) {
    resultado[r.simbolo] = Math.max((concentraciones[r.simbolo] ?? 0) - r.coef * xi, 0);
  }
  for (const p of reaccion.productos) {
    resultado[p.simbolo] = Math.max((concentraciones[p.simbolo] ?? 0) + p.coef * xi, 0);
  }
  return resultado;
}

/**
 * Ecuación de van't Hoff simplificada: ln(K2/K1) = -ΔH/R · (1/T2 − 1/T1)
 * R = 8.314 J/(mol·K), ΔH en J/mol
 */
function nuevoKcConTemperatura(
  KcInicial: number,
  deltaH_kJmol: number,
  T1: number,
  T2: number,
): number {
  if (T1 === T2) return KcInicial;
  const R = 8.314;
  const dHJ = deltaH_kJmol * 1000;
  const lnRatio = (-dHJ / R) * (1 / T2 - 1 / T1);
  return KcInicial * Math.exp(lnRatio);
}

// ============================================================
// Componente principal
// ============================================================

export default function SimuladorEquilibrioQuimicoPage() {
  const [reaccionId, setReaccionId] = useState<string>(REACCIONES[0].id);
  const reaccion = useMemo(
    () => REACCIONES.find((r) => r.id === reaccionId) ?? REACCIONES[0],
    [reaccionId],
  );

  const [concentraciones, setConcentraciones] = useState<Record<string, number>>(
    () => ({ ...REACCIONES[0].inicialesSugeridas }),
  );
  const [temperaturaK, setTemperaturaK] = useState<number>(298);
  const [historialPerturbaciones, setHistorialPerturbaciones] = useState<Perturbacion[]>([]);
  const [mensaje, setMensaje] = useState<string>('Selecciona una reacción y aplica una perturbación para ver Le Chatelier en acción.');

  // Cambia de reacción y resetea estado
  const cambiarReaccion = useCallback((id: string) => {
    const nueva = REACCIONES.find((r) => r.id === id);
    if (!nueva) return;
    setReaccionId(id);
    setConcentraciones({ ...nueva.inicialesSugeridas });
    setTemperaturaK(298);
    setHistorialPerturbaciones([]);
    setMensaje(`Reacción cargada: ${nueva.nombre}. Pulsa una perturbación para experimentar.`);
  }, []);

  const KcEfectiva = useMemo(
    () => nuevoKcConTemperatura(reaccion.Kc, reaccion.deltaH, 298, temperaturaK),
    [reaccion, temperaturaK],
  );

  const Q = useMemo(() => calcularQ(reaccion, concentraciones), [reaccion, concentraciones]);

  const direccion: DireccionDesplazamiento = useMemo(() => {
    const ratio = Q / KcEfectiva;
    if (ratio > 1.02) return 'izquierda';
    if (ratio < 0.98) return 'derecha';
    return 'equilibrio';
  }, [Q, KcEfectiva]);

  const equilibrioPredicho = useMemo(
    () => nuevoEquilibrio(reaccion, concentraciones, KcEfectiva),
    [reaccion, concentraciones, KcEfectiva],
  );

  const dN = deltaN(reaccion);

  // Actualizar concentración manualmente
  const setConc = (simbolo: string, valor: number) => {
    setConcentraciones((prev) => ({ ...prev, [simbolo]: Math.max(valor, 0) }));
  };

  // ============================================================
  // Aplicar perturbaciones
  // ============================================================

  const aplicarPerturbacion = (tipo: TipoPerturbacion, especie?: string) => {
    const cantidad = 0.5; // mol/L de cambio estándar
    const dT = 50; // K
    const factorP = 2; // factor de compresión/expansión

    if (tipo === 'anadir-reactivo' && especie) {
      setConcentraciones((prev) => ({ ...prev, [especie]: (prev[especie] ?? 0) + cantidad }));
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, especie, cantidad, descripcion: `Añadido ${formatNumber(cantidad, 2)} mol/L de ${especie}` },
      ]);
      setMensaje(
        `Añadiste ${especie}: el sistema se opone al cambio consumiendo parte de ${especie} y desplazándose hacia los productos (→).`,
      );
      return;
    }
    if (tipo === 'quitar-reactivo' && especie) {
      setConcentraciones((prev) => ({
        ...prev,
        [especie]: Math.max((prev[especie] ?? 0) - cantidad, 0.01),
      }));
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, especie, cantidad, descripcion: `Retirado ${formatNumber(cantidad, 2)} mol/L de ${especie}` },
      ]);
      setMensaje(
        `Retiraste ${especie}: el sistema se opone al cambio formando más ${especie} y desplazándose hacia los reactivos (←).`,
      );
      return;
    }
    if (tipo === 'anadir-producto' && especie) {
      setConcentraciones((prev) => ({ ...prev, [especie]: (prev[especie] ?? 0) + cantidad }));
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, especie, cantidad, descripcion: `Añadido ${formatNumber(cantidad, 2)} mol/L de ${especie}` },
      ]);
      setMensaje(
        `Añadiste ${especie}: el sistema se opone al cambio consumiendo parte de ${especie} y desplazándose hacia los reactivos (←).`,
      );
      return;
    }
    if (tipo === 'quitar-producto' && especie) {
      setConcentraciones((prev) => ({
        ...prev,
        [especie]: Math.max((prev[especie] ?? 0) - cantidad, 0.01),
      }));
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, especie, cantidad, descripcion: `Retirado ${formatNumber(cantidad, 2)} mol/L de ${especie}` },
      ]);
      setMensaje(
        `Retiraste ${especie}: el sistema se opone al cambio formando más ${especie} y desplazándose hacia los productos (→).`,
      );
      return;
    }
    if (tipo === 'subir-temperatura') {
      const Tnueva = temperaturaK + dT;
      setTemperaturaK(Tnueva);
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: `Temperatura subida +${dT} K (ahora ${Tnueva} K)` },
      ]);
      if (reaccion.exotermica) {
        setMensaje(
          `Subiste T en una reacción exotérmica (ΔH<0): el sistema absorbe el calor extra desplazándose hacia los reactivos (←). Kc disminuye.`,
        );
      } else {
        setMensaje(
          `Subiste T en una reacción endotérmica (ΔH>0): el sistema absorbe el calor extra desplazándose hacia los productos (→). Kc aumenta.`,
        );
      }
      return;
    }
    if (tipo === 'bajar-temperatura') {
      const Tnueva = Math.max(temperaturaK - dT, 100);
      setTemperaturaK(Tnueva);
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: `Temperatura bajada −${dT} K (ahora ${Tnueva} K)` },
      ]);
      if (reaccion.exotermica) {
        setMensaje(
          `Bajaste T en una reacción exotérmica (ΔH<0): el sistema libera menos calor y se desplaza hacia los productos (→). Kc aumenta.`,
        );
      } else {
        setMensaje(
          `Bajaste T en una reacción endotérmica (ΔH>0): el sistema libera el déficit de calor desplazándose hacia los reactivos (←). Kc disminuye.`,
        );
      }
      return;
    }
    if (tipo === 'comprimir') {
      if (dN === 0) {
        setMensaje(
          `Comprimir no afecta porque Δn = 0 (igual número de moles de gas a cada lado). Kc y la posición no cambian.`,
        );
        setHistorialPerturbaciones((h) => [
          ...h,
          { tipo, descripcion: `Compresión (sin efecto, Δn=0)` },
        ]);
        return;
      }
      // Comprimir = aumentar todas las concentraciones de gases en factor P
      setConcentraciones((prev) => {
        const nuevo: Record<string, number> = { ...prev };
        for (const e of [...reaccion.reactivos, ...reaccion.productos]) {
          if (e.estado === 'g') nuevo[e.simbolo] = (nuevo[e.simbolo] ?? 0) * factorP;
        }
        return nuevo;
      });
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: `Compresión ×${factorP} (volumen reducido a la mitad)` },
      ]);
      if (dN < 0) {
        setMensaje(
          `Comprimiste el sistema (Δn=${dN}<0): se desplaza hacia el lado con menos moles de gas, los productos (→).`,
        );
      } else {
        setMensaje(
          `Comprimiste el sistema (Δn=${dN}>0): se desplaza hacia el lado con menos moles de gas, los reactivos (←).`,
        );
      }
      return;
    }
    if (tipo === 'expandir') {
      if (dN === 0) {
        setMensaje(
          `Expandir no afecta porque Δn = 0. Kc y la posición no cambian.`,
        );
        setHistorialPerturbaciones((h) => [
          ...h,
          { tipo, descripcion: `Expansión (sin efecto, Δn=0)` },
        ]);
        return;
      }
      setConcentraciones((prev) => {
        const nuevo: Record<string, number> = { ...prev };
        for (const e of [...reaccion.reactivos, ...reaccion.productos]) {
          if (e.estado === 'g') nuevo[e.simbolo] = (nuevo[e.simbolo] ?? 0) / factorP;
        }
        return nuevo;
      });
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: `Expansión ×${factorP} (volumen duplicado)` },
      ]);
      if (dN < 0) {
        setMensaje(
          `Expandiste el sistema (Δn=${dN}<0): se desplaza hacia el lado con más moles de gas, los reactivos (←).`,
        );
      } else {
        setMensaje(
          `Expandiste el sistema (Δn=${dN}>0): se desplaza hacia el lado con más moles de gas, los productos (→).`,
        );
      }
      return;
    }
    if (tipo === 'catalizador') {
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: 'Añadido catalizador' },
      ]);
      setMensaje(
        `Añadiste un catalizador: solo acelera la llegada al equilibrio en ambos sentidos por igual. NO desplaza el equilibrio ni cambia Kc.`,
      );
      return;
    }
  };

  const aplicarEquilibrioPredicho = () => {
    setConcentraciones({ ...equilibrioPredicho });
    setMensaje('Aplicado el nuevo equilibrio: Q ≈ Kc. El sistema está estabilizado.');
  };

  const reiniciar = () => {
    setConcentraciones({ ...reaccion.inicialesSugeridas });
    setTemperaturaK(298);
    setHistorialPerturbaciones([]);
    setMensaje('Estado inicial restaurado.');
  };

  // ============================================================
  // Render
  // ============================================================

  // Calcular escala para gráfico de barras (max concentración)
  const todasEspecies = [...reaccion.reactivos, ...reaccion.productos];
  const maxConc = Math.max(
    ...todasEspecies.map((e) => Math.max(concentraciones[e.simbolo] ?? 0, equilibrioPredicho[e.simbolo] ?? 0)),
    0.1,
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Equilibrio Químico</h1>
        <p>Principio de Le Chatelier en acción</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de reacción */}
        <section className={styles.panel} aria-labelledby="seleccion-reaccion">
          <h2 id="seleccion-reaccion" className={styles.panelTitle}>
            1. Elige una reacción reversible
          </h2>
          <div className={styles.reaccionSelector}>
            {REACCIONES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`${styles.reaccionCard} ${reaccionId === r.id ? styles.reaccionActive : ''}`}
                onClick={() => cambiarReaccion(r.id)}
                aria-pressed={reaccionId === r.id}
              >
                <strong>{r.nombre}</strong>
                <span className={styles.ecuacion}>{r.ecuacion}</span>
                <span className={styles.reaccionMeta}>
                  Kc ≈ {formatNumber(r.Kc, 2)} · {r.exotermica ? 'exotérmica' : 'endotérmica'} · ΔH = {formatNumber(r.deltaH, 0)} kJ/mol
                </span>
              </button>
            ))}
          </div>
          <p className={styles.contextoReaccion}>{reaccion.contexto}</p>
        </section>

        {/* Concentraciones iniciales */}
        <section className={styles.panel} aria-labelledby="concentraciones-titulo">
          <h2 id="concentraciones-titulo" className={styles.panelTitle}>
            2. Concentraciones actuales (mol/L)
          </h2>
          <div className={styles.inputGrid}>
            {todasEspecies.map((e) => {
              const esReactivo = reaccion.reactivos.some((r) => r.simbolo === e.simbolo);
              return (
                <div key={e.simbolo} className={styles.inputGroup}>
                  <label htmlFor={`conc-${e.simbolo}`}>
                    [{e.simbolo}] <span className={styles.unitLabel}>({esReactivo ? 'reactivo' : 'producto'} · {e.estado})</span>
                  </label>
                  <input
                    id={`conc-${e.simbolo}`}
                    type="number"
                    min={0}
                    step={0.05}
                    value={concentraciones[e.simbolo] ?? 0}
                    onChange={(ev) => setConc(e.simbolo, parseFloat(ev.target.value) || 0)}
                    inputMode="decimal"
                  />
                </div>
              );
            })}
            <div className={styles.inputGroup}>
              <label htmlFor="temperatura">
                Temperatura <span className={styles.unitLabel}>(K)</span>
              </label>
              <input
                id="temperatura"
                type="number"
                min={100}
                max={2000}
                step={10}
                value={temperaturaK}
                onChange={(ev) => setTemperaturaK(parseFloat(ev.target.value) || 298)}
                inputMode="decimal"
              />
            </div>
          </div>
          <button type="button" onClick={reiniciar} className={styles.calcBtn}>
            Restaurar valores iniciales
          </button>
        </section>

        {/* Perturbaciones */}
        <section className={styles.panel} aria-labelledby="perturbaciones-titulo">
          <h2 id="perturbaciones-titulo" className={styles.panelTitle}>
            3. Aplica una perturbación
          </h2>
          <div className={styles.perturbacionGrid}>
            {reaccion.reactivos.map((r) => (
              <div key={`pr-${r.simbolo}`} className={styles.perturbacionGroup}>
                <span className={styles.perturbacionLabel}>Reactivo {r.simbolo}</span>
                <button
                  type="button"
                  className={styles.perturbacionBtn}
                  onClick={() => aplicarPerturbacion('anadir-reactivo', r.simbolo)}
                >
                  + Añadir {r.simbolo}
                </button>
                <button
                  type="button"
                  className={styles.perturbacionBtn}
                  onClick={() => aplicarPerturbacion('quitar-reactivo', r.simbolo)}
                >
                  − Quitar {r.simbolo}
                </button>
              </div>
            ))}
            {reaccion.productos.map((p) => (
              <div key={`pp-${p.simbolo}`} className={styles.perturbacionGroup}>
                <span className={styles.perturbacionLabel}>Producto {p.simbolo}</span>
                <button
                  type="button"
                  className={styles.perturbacionBtn}
                  onClick={() => aplicarPerturbacion('anadir-producto', p.simbolo)}
                >
                  + Añadir {p.simbolo}
                </button>
                <button
                  type="button"
                  className={styles.perturbacionBtn}
                  onClick={() => aplicarPerturbacion('quitar-producto', p.simbolo)}
                >
                  − Quitar {p.simbolo}
                </button>
              </div>
            ))}
            <div className={styles.perturbacionGroup}>
              <span className={styles.perturbacionLabel}>Temperatura</span>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('subir-temperatura')}
              >
                ↑ Subir T (+50 K)
              </button>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('bajar-temperatura')}
              >
                ↓ Bajar T (−50 K)
              </button>
            </div>
            <div className={styles.perturbacionGroup}>
              <span className={styles.perturbacionLabel}>
                Presión {dN === 0 ? '(Δn=0, sin efecto)' : `(Δn=${dN})`}
              </span>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('comprimir')}
              >
                ↑ Comprimir (×2)
              </button>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('expandir')}
              >
                ↓ Expandir (÷2)
              </button>
            </div>
            <div className={styles.perturbacionGroup}>
              <span className={styles.perturbacionLabel}>Catalizador</span>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('catalizador')}
              >
                + Añadir catalizador
              </button>
            </div>
          </div>
        </section>

        {/* Visualización */}
        <section className={styles.panel} aria-labelledby="visualizacion-titulo">
          <h2 id="visualizacion-titulo" className={styles.panelTitle}>
            4. Visualización del sistema
          </h2>

          <div className={styles.barChart}>
            {todasEspecies.map((e) => {
              const esReactivo = reaccion.reactivos.some((r) => r.simbolo === e.simbolo);
              const valor = concentraciones[e.simbolo] ?? 0;
              const altura = (valor / maxConc) * 100;
              return (
                <div key={`bar-${e.simbolo}`} className={styles.barColumn}>
                  <span className={styles.barValue}>{formatNumber(valor, 3)}</span>
                  <div
                    className={`${styles.bar} ${esReactivo ? styles.barReactivo : styles.barProducto}`}
                    style={{ height: `${Math.max(altura, 2)}%` }}
                    aria-label={`${e.simbolo}: ${formatNumber(valor, 3)} mol por litro`}
                  />
                  <span className={styles.barLabel}>{e.simbolo}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.flechaDesplazamiento} aria-live="polite">
            {direccion === 'derecha' && (
              <span className={styles.flechaDerecha}>
                Q &lt; Kc → Sistema avanza HACIA PRODUCTOS →
              </span>
            )}
            {direccion === 'izquierda' && (
              <span className={styles.flechaIzquierda}>
                ← Q &gt; Kc → Sistema retrocede HACIA REACTIVOS
              </span>
            )}
            {direccion === 'equilibrio' && (
              <span className={styles.flechaEquilibrio}>
                ⇌ Q ≈ Kc → Sistema EN EQUILIBRIO
              </span>
            )}
          </div>
        </section>

        {/* Resultados */}
        <section className={styles.panel} aria-labelledby="resultados-titulo">
          <h2 id="resultados-titulo" className={styles.panelTitle}>
            5. Análisis cuantitativo
          </h2>
          <div className={styles.resultBlock}>
            <h3 className={styles.resultTitle}>Cociente Q vs constante Kc</h3>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Q (cociente actual)</span>
              <span className={styles.resultValueAccent}>{formatNumber(Q, 4)}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Kc (a {temperaturaK} K)</span>
              <span className={styles.resultValueAccent}>{formatNumber(KcEfectiva, 4)}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Kc (a 298 K, referencia)</span>
              <span className={styles.resultValue}>{formatNumber(reaccion.Kc, 4)}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Δn (gas)</span>
              <span className={styles.resultValue}>{formatNumber(dN, 0)}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Dirección de desplazamiento</span>
              <span className={styles.resultValueAccent}>
                {direccion === 'derecha' && '→ Productos'}
                {direccion === 'izquierda' && '← Reactivos'}
                {direccion === 'equilibrio' && '⇌ Equilibrio'}
              </span>
            </div>
          </div>

          <div className={styles.resultBlock}>
            <h3 className={styles.resultTitle}>Nuevo equilibrio predicho</h3>
            {todasEspecies.map((e) => (
              <div key={`eq-${e.simbolo}`} className={styles.resultRow}>
                <span className={styles.resultLabel}>[{e.simbolo}]eq</span>
                <span className={styles.resultValue}>
                  {formatNumber(equilibrioPredicho[e.simbolo] ?? 0, 4)} mol/L
                </span>
              </div>
            ))}
            <button
              type="button"
              className={styles.calcBtn}
              onClick={aplicarEquilibrioPredicho}
              style={{ marginTop: '0.75rem' }}
            >
              Aplicar nuevo equilibrio
            </button>
          </div>

          <div className={styles.mensajePedagogico} role="status">
            <strong>Le Chatelier dice:</strong> {mensaje}
          </div>

          {historialPerturbaciones.length > 0 && (
            <div className={styles.historial}>
              <h4>Historial de perturbaciones</h4>
              <ol>
                {historialPerturbaciones.map((p, i) => (
                  <li key={i}>{p.descripcion}</li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <EducationalSection
          title="Guía de Equilibrio Químico"
          subtitle="Principio de Le Chatelier y constante Kc"
        >
          <h3>Tabla de Reacciones del Simulador</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Reacción</th>
                  <th>Ecuación</th>
                  <th>Kc (≈)</th>
                  <th>Tipo</th>
                  <th>Δn</th>
                  <th>Aplicación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Haber-Bosch</td>
                  <td>N₂ + 3H₂ ⇌ 2NH₃</td>
                  <td>0,5</td>
                  <td>Exotérmica</td>
                  <td>−2</td>
                  <td>Fertilizantes</td>
                </tr>
                <tr>
                  <td>Esterificación</td>
                  <td>Ácido + alcohol ⇌ éster + H₂O</td>
                  <td>4,0</td>
                  <td>Casi neutra</td>
                  <td>0</td>
                  <td>Aromas, disolventes</td>
                </tr>
                <tr>
                  <td>PCl₅</td>
                  <td>PCl₅ ⇌ PCl₃ + Cl₂</td>
                  <td>0,04</td>
                  <td>Endotérmica</td>
                  <td>+1</td>
                  <td>Síntesis cloruros</td>
                </tr>
                <tr>
                  <td>Contacto (SO₃)</td>
                  <td>2SO₂ + O₂ ⇌ 2SO₃</td>
                  <td>4,32</td>
                  <td>Exotérmica</td>
                  <td>−1</td>
                  <td>Ácido sulfúrico</td>
                </tr>
                <tr>
                  <td>NO₂/N₂O₄</td>
                  <td>2NO₂ ⇌ N₂O₄</td>
                  <td>170</td>
                  <td>Exotérmica</td>
                  <td>−1</td>
                  <td>Demostraciones de aula</td>
                </tr>
                <tr>
                  <td>Water-gas shift</td>
                  <td>CO + H₂O ⇌ CO₂ + H₂</td>
                  <td>5,0</td>
                  <td>Exotérmica</td>
                  <td>0</td>
                  <td>Producción de H₂</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de química de secundaria</h4>
              <p>
                Practica problemas típicos de Le Chatelier: añadir reactivo, cambiar T, calcular Kc.
                Usa Haber-Bosch o NO₂/N₂O₄ para entender perturbaciones clásicas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Universitario de ingeniería química</h4>
              <p>
                Visualiza por qué la industria de SO₃ trabaja a baja T y alta P, y por qué Haber-Bosch
                exige compromiso entre cinética (T alta) y termodinámica (T baja).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Profesor de secundaria</h4>
              <p>
                Proyecta el simulador en clase y aplica perturbaciones en directo. Permite a los
                estudiantes ver Q acercarse a Kc tras cada cambio.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Aficionado a la divulgación científica</h4>
              <p>
                Entiende cómo el ciclo del nitrógeno industrial (Haber) cambió la agricultura mundial
                y por qué la presión y la temperatura son palancas críticas.
              </p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué dice exactamente el Principio de Le Chatelier?</strong>
              <p>
                Si un sistema en equilibrio se perturba (cambio en concentración, temperatura o
                presión), el sistema responde desplazando el equilibrio en el sentido que minimiza
                esa perturbación.
              </p>
              <p className={styles.faqTip}>Es una regla cualitativa: predice dirección, no magnitud.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué los catalizadores no desplazan el equilibrio?</strong>
              <p>
                Un catalizador acelera por igual la reacción directa e inversa, así que se llega
                antes al equilibrio, pero la posición del equilibrio (las concentraciones finales)
                no cambia. Kc tampoco cambia.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa al cambiar la presión si Δn = 0?</strong>
              <p>
                Nada: si el número de moles de gas es igual a ambos lados, comprimir o expandir
                multiplica todas las concentraciones por el mismo factor y Q sigue igual a Kc.
                Ejemplos del simulador: water-gas shift y esterificación (líquidos puros).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo afecta la temperatura a Kc?</strong>
              <p>
                Sí cambia Kc, a diferencia de las demás perturbaciones. La ecuación de van&apos;t Hoff
                lo cuantifica: ln(K₂/K₁) = −ΔH/R · (1/T₂ − 1/T₁). En exotérmicas, subir T baja Kc.
                En endotérmicas, subir T sube Kc.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre Q y Kc?</strong>
              <p>
                Q es el cociente de reacción calculado con las concentraciones <em>actuales</em>,
                estén o no en equilibrio. Kc es el valor que toma Q <em>en el equilibrio</em>. Si
                Q&lt;Kc el sistema avanza a productos; si Q&gt;Kc retrocede a reactivos; si Q=Kc ya
                está en equilibrio.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué los sólidos y líquidos puros no aparecen en Kc?</strong>
              <p>
                Su actividad es 1 por convenio: la concentración de un sólido o de un líquido puro
                no varía aunque la cantidad cambie, porque su densidad es constante. Solo gases y
                solutos en disolución entran en la expresión de Kc.
              </p>
            </div>
          </div>

          <h3>Cómo Predecir un Desplazamiento — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Escribe la expresión de Kc</strong>
                <p>
                  Kc = [productos]^coef / [reactivos]^coef. Excluye sólidos y líquidos puros.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula Q con las concentraciones actuales</strong>
                <p>
                  Sustituye los valores reales en la fórmula. Q tendrá las mismas unidades que Kc.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Compara Q con Kc</strong>
                <p>
                  Q&lt;Kc: faltan productos, avanza a la derecha. Q&gt;Kc: sobran productos, retrocede.
                  Q=Kc: ya está en equilibrio.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Identifica la perturbación</strong>
                <p>
                  Concentración (cambia Q, no Kc), temperatura (cambia Kc), presión/volumen (cambia
                  Q en gases con Δn≠0) o catalizador (no cambia nada del equilibrio).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Aplica Le Chatelier para predecir</strong>
                <p>
                  El sistema se opone al cambio. Si añades A, lo consume. Si calientas una
                  exotérmica, va a reactivos. Si comprimes con Δn&lt;0, va a productos.
                </p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧪</span>
              <div>
                <strong>Equilibra primero</strong>
                <p>Sin coeficientes correctos, los exponentes en Kc estarán mal y todo el cálculo será incorrecto.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <div>
                <strong>Coeficientes = exponentes</strong>
                <p>El coeficiente estequiométrico de cada especie es su exponente en la expresión de Kc.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌡️</span>
              <div>
                <strong>Solo T cambia Kc</strong>
                <p>Memoriza esto: concentración, presión y catalizador NO modifican Kc. Solo la temperatura.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔢</span>
              <div>
                <strong>Calcula Δn antes de presión</strong>
                <p>Δn = mol gases productos − mol gases reactivos. Si Δn=0, la presión no afecta.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <div>
                <strong>Usa el calor como reactivo o producto</strong>
                <p>En exotérmicas, trata el calor como producto. Subir T = añadir producto = retroceso.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <div>
                <strong>Verifica con Q vs Kc</strong>
                <p>Después de cada perturbación, comprueba que el sentido de desplazamiento corresponde a la comparación Q–Kc.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <span>Errores Frecuentes</span>
            </div>
            <ul className={styles.warningList}>
              <li>Incluir sólidos o líquidos puros en la expresión de Kc.</li>
              <li>Confundir Q con Kc al resolver problemas de predicción.</li>
              <li>Asumir que añadir un catalizador desplaza el equilibrio (no lo hace).</li>
              <li>No usar los coeficientes estequiométricos como exponentes en Kc.</li>
              <li>Aplicar el efecto de la presión en reacciones con Δn = 0 (no afecta).</li>
              <li>Confundir el efecto de la temperatura en Kc con un simple desplazamiento (T sí cambia el valor de Kc).</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-equilibrio-quimico')} />
        <ShareCard appName="simulador-equilibrio-quimico" />
      </main>

      <Footer appName="simulador-equilibrio-quimico" />
    </div>
  );
}
