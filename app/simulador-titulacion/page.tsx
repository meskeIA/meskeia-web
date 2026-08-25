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
import styles from './SimuladorTitulacion.module.css';

type TipoTitulacion = 'af-bf' | 'ad-bf' | 'af-bd' | 'ad-bd';
type Indicador = 'fenolftaleina' | 'naranja-metilo' | 'azul-bromotimol' | 'tornasol';

interface PuntoCurva {
  v: number;
  pH: number;
}

interface IndicadorInfo {
  nombre: string;
  rango: [number, number];
  colorAcido: string;
  colorBase: string;
  descripcionAcido: string;
  descripcionBase: string;
}

const INDICADORES: Record<Indicador, IndicadorInfo> = {
  fenolftaleina: {
    nombre: 'Fenolftaleína',
    rango: [8.2, 10],
    colorAcido: 'transparent',
    colorBase: '#e84393',
    descripcionAcido: 'incoloro',
    descripcionBase: 'rosa fucsia',
  },
  'naranja-metilo': {
    nombre: 'Naranja de metilo',
    rango: [3.1, 4.4],
    colorAcido: '#e74c3c',
    colorBase: '#f1c40f',
    descripcionAcido: 'rojo',
    descripcionBase: 'amarillo',
  },
  'azul-bromotimol': {
    nombre: 'Azul de bromotimol',
    rango: [6.0, 7.6],
    colorAcido: '#f1c40f',
    colorBase: '#3498db',
    descripcionAcido: 'amarillo',
    descripcionBase: 'azul',
  },
  tornasol: {
    nombre: 'Tornasol',
    rango: [5, 8],
    colorAcido: '#e74c3c',
    colorBase: '#3498db',
    descripcionAcido: 'rojo',
    descripcionBase: 'azul',
  },
};

const TIPOS_TITULACION: Record<TipoTitulacion, { titulo: string; ecuacion: string; ejemplo: string }> = {
  'af-bf': {
    titulo: 'Ácido fuerte + Base fuerte',
    ecuacion: 'HCl + NaOH → NaCl + H₂O',
    ejemplo: 'HCl + NaOH',
  },
  'ad-bf': {
    titulo: 'Ácido débil + Base fuerte',
    ecuacion: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
    ejemplo: 'CH₃COOH + NaOH',
  },
  'af-bd': {
    titulo: 'Ácido fuerte + Base débil',
    ecuacion: 'HCl + NH₃ → NH₄Cl',
    ejemplo: 'HCl + NH₃',
  },
  'ad-bd': {
    titulo: 'Ácido débil + Base débil',
    ecuacion: 'CH₃COOH + NH₃ → CH₃COONH₄',
    ejemplo: 'CH₃COOH + NH₃',
  },
};

/**
 * pH de una mezcla ácido débil / base conjugada, resolviendo el balance de cargas.
 *
 * Con [HA] = C_HA − x y [A⁻] = C_A + x, la constante de acidez da una cuadrática:
 *
 *     x² + (Ka + C_A)·x − Ka·C_HA = 0
 *
 * y de sus dos raíces solo la positiva tiene sentido físico. Es la fórmula que Henderson y
 * Hasselbalch simplifican SUPONIENDO que x es despreciable frente a C_HA y a C_A; esa
 * suposición se cae justo al principio de la valoración, cuando C_A es minúsculo, y ahí H-H
 * da un pH MENOR que el del ácido puro. De ahí el valle del hallazgo 343.
 *
 * Casos resueltos a mano con acético 0,1 M · 25 mL (pKa 4,76), antes de escribir esto:
 *   V = 0,00 mL → 2,8829 (idéntico a la aproximación ½(pKa − log C) que había: 2,88)
 *   V = 0,10 mL → 2,9502 → 2,95, y SUBE, que es lo que tiene que hacer al echar base
 *   V = 12,50 mL (semiequivalencia) → 4,7605, contra el 4,7600 de H-H: ahí sí valía
 *
 * `techo` acota el resultado: la cuadrática ignora la autoionización del agua, así que con
 * el HA casi agotado el pH se dispararía por encima del de la propia equivalencia (10,16 a
 * dos microlitros de ella). El pH antes de la equivalencia nunca puede superar el de la
 * equivalencia, y ese tope solo llega a morder a partir de V = 24,998 mL de 25.
 */
function phZonaTampon(C_HA: number, C_A: number, pKa: number, techo: number): number {
  const Ka = Math.pow(10, -pKa);
  const b = Ka + C_A;
  const x = (-b + Math.sqrt(b * b + 4 * Ka * C_HA)) / 2;
  return Math.min(-Math.log10(Math.max(x, 1e-14)), techo);
}

/** pH en la equivalencia de ácido débil + base fuerte: hidrólisis de la sal. */
function phEnEquivalenciaAdBf(moles_analito: number, V_total_L: number, pKa: number): number {
  const C_sal = moles_analito / V_total_L;
  return 7 + 0.5 * (pKa + Math.log10(Math.max(C_sal, 1e-14)));
}

/**
 * Calcula pH a un volumen V (mL) de titulante añadido para un escenario dado.
 */
function calcularPH(
  tipo: TipoTitulacion,
  V_titulante: number,
  V_analito: number,
  C_analito: number,
  C_titulante: number,
  pKa: number,
  pKb: number
): number {
  const moles_analito = (C_analito * V_analito) / 1000;
  const moles_titulante = (C_titulante * V_titulante) / 1000;
  const V_total_L = (V_analito + V_titulante) / 1000;
  const V_eq = (C_analito * V_analito) / C_titulante;

  // En todos los casos, el analito es el ácido y el titulante la base (esto se podría invertir)
  // Para simplicidad: siempre titulamos un ácido con una base.

  if (tipo === 'af-bf') {
    if (V_titulante < V_eq) {
      // Exceso de ácido
      const moles_H = moles_analito - moles_titulante;
      const conc_H = moles_H / V_total_L;
      return -Math.log10(Math.max(conc_H, 1e-14));
    } else if (Math.abs(V_titulante - V_eq) < 0.001) {
      return 7;
    } else {
      // Exceso de base
      const moles_OH = moles_titulante - moles_analito;
      const conc_OH = moles_OH / V_total_L;
      const pOH = -Math.log10(Math.max(conc_OH, 1e-14));
      return 14 - pOH;
    }
  }

  if (tipo === 'ad-bf') {
    if (V_titulante < V_eq) {
      // Una sola fórmula para V = 0 y para toda la zona tampón, y por eso no hay salto:
      // hasta el 25/08/2026 V = 0 usaba ½(pKa − log C) y V > 0 saltaba a
      // Henderson-Hasselbalch puro, así que la PRIMERA GOTA de NaOH bajaba el pH de 2,88 a
      // 2,36 — añadir base acidificaba (hallazgo 343). H-H no vale cuando n(A⁻) es mucho
      // menor que n(HA): ahí el H⁺ que aporta el propio ácido no es despreciable frente al
      // A⁻ que hay, y hay que resolver el balance de cargas.
      const moles_HA = moles_analito - moles_titulante;
      const moles_A = moles_titulante;
      if (moles_HA <= 0) return 7;
      // El techo es el pH de la equivalencia, calculado con el volumen que HABRÁ allí.
      const techo = phEnEquivalenciaAdBf(moles_analito, (V_analito + V_eq) / 1000, pKa);
      return phZonaTampon(moles_HA / V_total_L, moles_A / V_total_L, pKa, techo);
    } else if (Math.abs(V_titulante - V_eq) < 0.001) {
      // Punto de equivalencia: hidrólisis de la sal
      return phEnEquivalenciaAdBf(moles_analito, V_total_L, pKa);
    } else {
      // Exceso de base fuerte
      const moles_OH = moles_titulante - moles_analito;
      const conc_OH = moles_OH / V_total_L;
      const pOH = -Math.log10(Math.max(conc_OH, 1e-14));
      return 14 - pOH;
    }
  }

  if (tipo === 'af-bd') {
    // Titulamos ácido fuerte con base débil. Curva en imagen especular.
    if (V_titulante <= 0) {
      // pH inicial de ácido fuerte: pH = -log(C)
      return -Math.log10(C_analito);
    }
    if (V_titulante < V_eq) {
      // Antes de equivalencia: domina exceso de ácido fuerte
      const moles_H = moles_analito - moles_titulante;
      const conc_H = moles_H / V_total_L;
      return -Math.log10(Math.max(conc_H, 1e-14));
    } else if (Math.abs(V_titulante - V_eq) < 0.001) {
      // Punto de equivalencia: solución de sal de base débil + ácido fuerte
      const C_sal = moles_analito / V_total_L;
      // pH = 7 - 0.5*(pKb + log C_sal)
      return 7 - 0.5 * (pKb + Math.log10(Math.max(C_sal, 1e-14)));
    } else {
      // Exceso de base débil tras la equivalencia: zona tampón inversa
      const moles_BH = moles_analito;
      const moles_B = moles_titulante - moles_analito;
      if (moles_B <= 0) return 7;
      // pOH = pKb + log([BH+]/[B]) → pH = 14 - pOH
      const pOH = pKb + Math.log10(moles_BH / moles_B);
      return 14 - pOH;
    }
  }

  // ad-bd: aproximación
  if (V_titulante < V_eq) {
    // Misma zona tampón que en ad-bf y, hasta el 25/08/2026, el mismo valle en la primera
    // gota: el acta solo lo describe en ad-bf, pero el código era idéntico. Aquí el techo es
    // el pH de la equivalencia de ácido débil + base débil, ½(pKa + 14 − pKb).
    const moles_HA = moles_analito - moles_titulante;
    const moles_A = moles_titulante;
    if (moles_HA <= 0) return 7;
    return phZonaTampon(moles_HA / V_total_L, moles_A / V_total_L, pKa, 0.5 * (pKa + 14 - pKb));
  } else if (Math.abs(V_titulante - V_eq) < 0.001) {
    // pH ≈ 0.5*(pKa + 14 - pKb)
    return 0.5 * (pKa + 14 - pKb);
  } else {
    // Exceso de base débil
    const moles_BH = moles_analito;
    const moles_B = moles_titulante - moles_analito;
    if (moles_B <= 0) return 7;
    const pOH = pKb + Math.log10(moles_BH / moles_B);
    return 14 - pOH;
  }
}

function getColorMatraz(pH: number, indicador: Indicador): string {
  const info = INDICADORES[indicador];
  const [pHmin, pHmax] = info.rango;
  if (pH < pHmin) return info.colorAcido === 'transparent' ? '#f0f9ff' : info.colorAcido;
  if (pH > pHmax) return info.colorBase;
  // Transición en zona de viraje
  const t = (pH - pHmin) / (pHmax - pHmin);
  return interpolarColor(info.colorAcido, info.colorBase, t);
}

function interpolarColor(c1: string, c2: string, t: number): string {
  if (c1 === 'transparent') {
    // En transición a base: aumentar opacidad
    const rgb = hexToRgb(c2);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${t})`;
  }
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '');
  return {
    r: parseInt(m.substring(0, 2), 16),
    g: parseInt(m.substring(2, 4), 16),
    b: parseInt(m.substring(4, 6), 16),
  };
}

/**
 * Rótulo de la fase de la valoración.
 *
 * El punto de equivalencia es UNO y es V = V_eq. Hasta el 25/08/2026 esta función rotulaba
 * «Salto de equivalencia» justo en V_eq y llamaba «Punto de equivalencia» a todo lo que
 * quedara por debajo del 110 % —o sea, a 27,00 mL de una equivalencia de 25,00, que son
 * 2 mL PASADOS— mientras la app dedica una FAQ entera a distinguir el punto de equivalencia
 * del punto final (hallazgo 345). El salto es el tramo estrecho que lo rodea; la
 * equivalencia, el punto exacto.
 */
function getFase(V: number, V_eq: number): string {
  if (V <= 0) return 'Solución inicial del analito';
  // Tolerancia de la propia app para «estar en» la equivalencia (la misma de calcularPH)
  if (Math.abs(V - V_eq) < 0.001) return 'Punto de equivalencia';
  if (V < V_eq * 0.1) return 'Inicio de la titulación';
  if (V < V_eq * 0.9) return 'Zona tampón / Pre-equivalencia';
  if (V < V_eq) return 'Salto de equivalencia (antes del punto)';
  if (V < V_eq * 1.1) return 'Salto de equivalencia (pasado el punto)';
  return 'Exceso de titulante';
}

export default function SimuladorTitulacion() {
  const [tipo, setTipo] = useState<TipoTitulacion>('af-bf');
  const [V_analito, setVAnalito] = useState(25);
  const [C_analito, setCAnalito] = useState(0.1);
  const [C_titulante, setCTitulante] = useState(0.1);
  const [pKa, setPKa] = useState(4.76);
  const [pKb, setPKb] = useState(4.74);
  const [indicador, setIndicador] = useState<Indicador>('fenolftaleina');
  const [V_titulante, setVTitulante] = useState(0);

  const V_eq = useMemo(() => (C_analito * V_analito) / C_titulante, [C_analito, V_analito, C_titulante]);

  const pHActual = useMemo(
    () => calcularPH(tipo, V_titulante, V_analito, C_analito, C_titulante, pKa, pKb),
    [tipo, V_titulante, V_analito, C_analito, C_titulante, pKa, pKb]
  );

  // Calcular curva completa con muchos puntos para suavidad
  const curva = useMemo<PuntoCurva[]>(() => {
    const puntos: PuntoCurva[] = [];
    const V_max = V_eq * 2;
    const numPuntos = 200;
    for (let i = 0; i <= numPuntos; i++) {
      const v = (i / numPuntos) * V_max;
      const pH = calcularPH(tipo, v, V_analito, C_analito, C_titulante, pKa, pKb);
      puntos.push({ v, pH: Math.max(0, Math.min(14, pH)) });
    }
    return puntos;
  }, [tipo, V_eq, V_analito, C_analito, C_titulante, pKa, pKb]);

  /**
   * pH en el punto de equivalencia, que es lo que decide si un indicador sirve o no.
   */
  const pHEquivalencia = useMemo(
    () => calcularPH(tipo, V_eq, V_analito, C_analito, C_titulante, pKa, pKb),
    [tipo, V_eq, V_analito, C_analito, C_titulante, pKa, pKb]
  );

  /**
   * Si el indicador elegido sirve para ESTA valoración.
   *
   * La app tenía la teoría escrita en tres sitios —la tabla del bloque educativo, la FAQ
   * «¿cómo elijo el indicador correcto?» y hasta la metadata, que avisa de que el naranja de
   * metilo «daría un error importante» en ácido débil + base fuerte— y NADA de eso estaba
   * conectado con el selector: se elegía sin que la herramienta dijera una palabra, y con el
   * indicador inadecuado el propio simulador induce el error, porque el matraz declara
   * «amarillo» —color básico, punto final alcanzado— con la valoración al 32 % (hallazgo 344).
   *
   * El criterio es el que la propia app enseña: el rango de viraje tiene que contener el pH
   * de equivalencia, o al menos quedar dentro del salto vertical de la curva.
   */
  const indicadorAdecuado = useMemo(() => {
    const [min, max] = INDICADORES[indicador].rango;
    return pHEquivalencia >= min && pHEquivalencia <= max;
  }, [indicador, pHEquivalencia]);

  // Curva visible (solo hasta V_titulante actual)
  const curvaVisible = useMemo(
    () => curva.filter((p) => p.v <= V_titulante + 0.001),
    [curva, V_titulante]
  );

  const colorMatraz = getColorMatraz(pHActual, indicador);
  const fase = getFase(V_titulante, V_eq);
  // Sin tope: con Math.min(100, …) marcaba «100,0 %» igual en la equivalencia que a 108 % o
  // a 200 % del volumen equivalente, y es la ÚNICA cifra del panel que dice a qué altura del
  // ensayo se está una vez pasada la equivalencia (hallazgo 347).
  const porcentaje = V_eq > 0 ? (V_titulante / V_eq) * 100 : 0;
  const muestraPKa = tipo === 'ad-bf' || tipo === 'ad-bd';
  const muestraPKb = tipo === 'af-bd' || tipo === 'ad-bd';
  const V_max = V_eq * 2;

  const addGota = useCallback(() => {
    setVTitulante((v) => Math.min(v + 0.1, V_max));
  }, [V_max]);

  const addMl = useCallback(() => {
    setVTitulante((v) => Math.min(v + 1, V_max));
  }, [V_max]);

  const irAEquivalencia = useCallback(() => {
    setVTitulante(V_eq);
  }, [V_eq]);

  const reset = useCallback(() => {
    setVTitulante(0);
  }, []);

  // Construir polyline para curva
  const curvaPath = useMemo(() => {
    if (curvaVisible.length === 0) return '';
    return curvaVisible
      .map((p) => {
        const x = (p.v / V_max) * 460 + 30;
        const y = 320 - (p.pH / 14) * 290;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [curvaVisible, V_max]);

  const curvaCompleta = useMemo(() => {
    return curva
      .map((p) => {
        const x = (p.v / V_max) * 460 + 30;
        const y = 320 - (p.pH / 14) * 290;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [curva, V_max]);

  // Posición V_eq en SVG
  const xEq = (V_eq / V_max) * 460 + 30;
  // Rango indicador en SVG
  const yIndMin = 320 - (INDICADORES[indicador].rango[0] / 14) * 290;
  const yIndMax = 320 - (INDICADORES[indicador].rango[1] / 14) * 290;

  // Nivel de líquido en bureta (en %)
  const buretaNivel = V_max > 0 ? Math.max(0, Math.min(100, 100 - (V_titulante / V_max) * 100)) : 100;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Titulación Ácido-Base</h1>
        <p>Titula gota a gota y observa la curva de pH en tiempo real</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de tipo */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Elige el tipo de titulación</h2>
          <div className={styles.tabBar} role="group" aria-label="Tipo de titulación">
            {(Object.keys(TIPOS_TITULACION) as TipoTitulacion[]).map((t) => (
              <button
                type="button"
                key={t}
                aria-pressed={tipo === t}
                className={`${styles.tabBtn} ${tipo === t ? styles.tabActive : ''}`}
                onClick={() => {
                  setTipo(t);
                  setVTitulante(0);
                }}
              >
                <strong>{TIPOS_TITULACION[t].titulo}</strong>
                <span>{TIPOS_TITULACION[t].ecuacion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Configuración */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>2. Configura la valoración</h2>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="vAnalito">
                Volumen analito <span className={styles.unitLabel}>(mL)</span>
              </label>
              <input
                id="vAnalito"
                type="range"
                min={10}
                max={100}
                step={1}
                value={V_analito}
                onChange={(e) => {
                  setVAnalito(Number(e.target.value));
                  setVTitulante(0);
                }}
              />
              <span className={styles.sliderValue}>{formatNumber(V_analito, 0)} mL</span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="cAnalito">
                [Analito] <span className={styles.unitLabel}>(mol/L)</span>
              </label>
              <input
                id="cAnalito"
                type="range"
                min={0.01}
                max={1}
                step={0.01}
                value={C_analito}
                onChange={(e) => {
                  setCAnalito(Number(e.target.value));
                  setVTitulante(0);
                }}
              />
              <span className={styles.sliderValue}>{formatNumber(C_analito, 2)} M</span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="cTitulante">
                [Titulante] <span className={styles.unitLabel}>(mol/L)</span>
              </label>
              <input
                id="cTitulante"
                type="range"
                min={0.01}
                max={1}
                step={0.01}
                value={C_titulante}
                onChange={(e) => {
                  setCTitulante(Number(e.target.value));
                  setVTitulante(0);
                }}
              />
              <span className={styles.sliderValue}>{formatNumber(C_titulante, 2)} M</span>
            </div>

            {muestraPKa && (
              <div className={styles.inputGroup}>
                <label htmlFor="pKa">pKa del ácido débil</label>
                <input
                  id="pKa"
                  type="range"
                  min={1}
                  max={12}
                  step={0.1}
                  value={pKa}
                  onChange={(e) => {
                    setPKa(Number(e.target.value));
                    setVTitulante(0);
                  }}
                />
                <span className={styles.sliderValue}>pKa = {formatNumber(pKa, 2)}</span>
              </div>
            )}

            {muestraPKb && (
              <div className={styles.inputGroup}>
                <label htmlFor="pKb">pKb de la base débil</label>
                <input
                  id="pKb"
                  type="range"
                  min={1}
                  max={12}
                  step={0.1}
                  value={pKb}
                  onChange={(e) => {
                    setPKb(Number(e.target.value));
                    setVTitulante(0);
                  }}
                />
                <span className={styles.sliderValue}>pKb = {formatNumber(pKb, 2)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Selector de indicador */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>3. Elige el indicador</h2>
          <div className={styles.indicatorSelector}>
            {(Object.keys(INDICADORES) as Indicador[]).map((ind) => {
              const info = INDICADORES[ind];
              const sirve = pHEquivalencia >= info.rango[0] && pHEquivalencia <= info.rango[1];
              return (
                <button
                  key={ind}
                  type="button"
                  aria-pressed={indicador === ind}
                  className={`${styles.indicatorBtn} ${indicador === ind ? styles.indicatorActive : ''}`}
                  onClick={() => setIndicador(ind)}
                >
                  {info.nombre}
                  {sirve && <span className={styles.indicatorApto}> · apto aquí</span>}
                  <small>
                    Vira pH {formatNumber(info.rango[0], 1)}–{formatNumber(info.rango[1], 1)} ({info.descripcionAcido} → {info.descripcionBase})
                  </small>
                </button>
              );
            })}
          </div>

          {/* El aviso que faltaba: la app tenía la teoría escrita en tres sitios y ninguno
              estaba conectado con este selector (hallazgo 344). */}
          {!indicadorAdecuado && (
            <p className={styles.indicatorAviso} role="status">
              <strong>Este indicador no sirve para esta valoración.</strong> El punto de equivalencia
              está en pH {formatNumber(pHEquivalencia, 2)} y {INDICADORES[indicador].nombre} vira entre{' '}
              {formatNumber(INDICADORES[indicador].rango[0], 1)} y {formatNumber(INDICADORES[indicador].rango[1], 1)}:
              el color cambiaría {pHEquivalencia > INDICADORES[indicador].rango[1] ? 'antes' : 'después'} de
              llegar a la equivalencia, así que el punto final leído sería erróneo. Es exactamente el
              error que la tabla de más abajo explica.
            </p>
          )}
        </section>

        {/* Simulación */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>4. Titula y observa</h2>

          <div className={styles.simulationLayout}>
            {/* Bureta + matraz */}
            <div className={styles.buretaContainer}>
              <svg viewBox="0 0 100 380" className={styles.buretaSvg} aria-label="Bureta y matraz">
                {/* Bureta - tubo */}
                <rect x="40" y="10" width="20" height="220" fill="#e0f2fe" stroke="#475569" strokeWidth="1.5" rx="2" />
                {/* Líquido en bureta */}
                <rect
                  x="42"
                  y={12 + (216 * (100 - buretaNivel)) / 100}
                  width="16"
                  height={(216 * buretaNivel) / 100}
                  fill="#3b82f6"
                  opacity="0.7"
                />
                {/* Marcas */}
                {[0, 25, 50, 75, 100].map((p) => {
                  const y = 12 + (216 * p) / 100;
                  return (
                    <line key={p} x1="60" y1={y} x2="65" y2={y} stroke="var(--svg-eje)" strokeWidth="1" />
                  );
                })}
                {/* Llave */}
                <rect x="35" y="230" width="30" height="10" fill="#94a3b8" stroke="#475569" strokeWidth="1" rx="2" />
                <line x1="50" y1="240" x2="50" y2="255" stroke="#475569" strokeWidth="2" />

                {/* Matraz Erlenmeyer */}
                <path
                  d="M 30 260 L 30 280 L 15 350 L 85 350 L 70 280 L 70 260 Z"
                  fill={colorMatraz === 'transparent' ? '#f0f9ff' : colorMatraz}
                  fillOpacity={colorMatraz === 'transparent' ? 0.3 : 0.8}
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                {/* Cuello matraz */}
                <line x1="30" y1="260" x2="70" y2="260" stroke="#475569" strokeWidth="1.5" />
              </svg>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <strong>Color visible:</strong>{' '}
                <span style={{ color: colorMatraz === 'transparent' ? '#94a3b8' : colorMatraz, fontWeight: 700 }}>
                  {pHActual < INDICADORES[indicador].rango[0]
                    ? INDICADORES[indicador].descripcionAcido
                    : pHActual > INDICADORES[indicador].rango[1]
                    ? INDICADORES[indicador].descripcionBase
                    : 'transición'}
                </span>
              </div>
            </div>

            {/* Curva pH-V */}
            <div className={styles.curvaContainer}>
              <svg viewBox="0 0 500 350" className={styles.curvaSvg} aria-label="Curva de titulación">
                {/* Cuadrícula */}
                {[0, 2, 4, 6, 8, 10, 12, 14].map((ph) => {
                  const y = 320 - (ph / 14) * 290;
                  return (
                    <g key={ph}>
                      <line x1="30" y1={y} x2="490" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
                      <text x="22" y={y + 4} fontSize="10" fill="var(--svg-eje)" textAnchor="end">
                        {ph}
                      </text>
                    </g>
                  );
                })}

                {/* Eje X marcas */}
                {[0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((frac) => {
                  const v = frac * V_eq;
                  const x = (v / V_max) * 460 + 30;
                  return (
                    <g key={frac}>
                      <line x1={x} y1={320} x2={x} y2={325} stroke="var(--svg-eje)" strokeWidth="0.8" />
                      <text x={x} y={340} fontSize="9" fill="var(--svg-eje)" textAnchor="middle">
                        {formatNumber(v, 1)}
                      </text>
                    </g>
                  );
                })}

                {/* Banda rango indicador */}
                <rect
                  x="30"
                  y={yIndMax}
                  width="460"
                  height={yIndMin - yIndMax}
                  fill="#fef3c7"
                  opacity="0.5"
                />
                <text x="486" y={yIndMax + (yIndMin - yIndMax) / 2 + 3} fontSize="9" fill="var(--svg-viraje)" textAnchor="end">
                  Viraje
                </text>

                {/* Línea V_eq */}
                <line x1={xEq} y1="30" x2={xEq} y2="320" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x={xEq + 4} y="40" fontSize="10" fill="#059669" fontWeight="700">
                  V_eq
                </text>

                {/* Línea pKa (si aplica) */}
                {muestraPKa && (
                  <>
                    <line
                      x1="30"
                      y1={320 - (pKa / 14) * 290}
                      x2="490"
                      y2={320 - (pKa / 14) * 290}
                      stroke="#f59e0b"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text x="34" y={320 - (pKa / 14) * 290 - 4} fontSize="9" fill="#b45309">
                      pKa = {formatNumber(pKa, 2)}
                    </text>
                  </>
                )}

                {/* Línea pH=7 */}
                <line
                  x1="30"
                  y1={320 - (7 / 14) * 290}
                  x2="490"
                  y2={320 - (7 / 14) * 290}
                  stroke="#94a3b8"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                />

                {/* Curva completa (en gris claro) */}
                <polyline points={curvaCompleta} fill="none" stroke="#cbd5e1" strokeWidth="1" />

                {/* Curva visible (azul) */}
                {curvaVisible.length > 0 && (
                  <polyline points={curvaPath} fill="none" stroke="#2E86AB" strokeWidth="2.5" />
                )}

                {/* Punto actual */}
                {V_titulante > 0 && (
                  <circle
                    cx={(V_titulante / V_max) * 460 + 30}
                    cy={320 - (Math.max(0, Math.min(14, pHActual)) / 14) * 290}
                    r="5"
                    fill="#48A9A6"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                )}

                {/* Ejes */}
                <line x1="30" y1="30" x2="30" y2="320" stroke="#475569" strokeWidth="1" />
                <line x1="30" y1="320" x2="490" y2="320" stroke="#475569" strokeWidth="1" />
                <text x="14" y="20" fontSize="10" fill="#475569" fontWeight="700">
                  pH
                </text>
                <text x="490" y="348" fontSize="10" fill="#475569" fontWeight="700" textAnchor="end">
                  V (mL)
                </text>
              </svg>
              <div className={styles.faseLabel}>{fase}</div>
            </div>
          </div>

          {/* Botones de control */}
          <div className={styles.controlBar}>
            <button type="button" className={styles.gotaBtn} onClick={addGota} disabled={V_titulante >= V_max}>
              + Gota (0,1 mL)
            </button>
            <button type="button" className={styles.calcBtn} onClick={addMl} disabled={V_titulante >= V_max}>
              + 1 mL
            </button>
            <button type="button" className={styles.calcBtn} onClick={irAEquivalencia}>
              Ir a equivalencia
            </button>
            <button type="button" className={styles.resetBtn} onClick={reset}>
              ↺ Reiniciar
            </button>
          </div>

          {/* Resultados */}
          <div className={styles.resultBlock} role="status" aria-live="polite">
            <h3 className={styles.resultTitle}>Estado actual</h3>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>pH actual</span>
              <span className={styles.resultValueAccent}>{formatNumber(pHActual, 2)}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Volumen añadido</span>
              <span className={styles.resultValue}>{formatNumber(V_titulante, 2)} mL</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Volumen de equivalencia (V_eq)</span>
              <span className={styles.resultValue}>{formatNumber(V_eq, 2)} mL</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>% completado</span>
              <span className={styles.resultValue}>{formatNumber(porcentaje, 1)} %</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Fase</span>
              <span className={styles.resultValue}>{fase}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Indicador seleccionado</span>
              <span className={styles.resultValue}>{INDICADORES[indicador].nombre}</span>
            </div>
          </div>
        </section>

        <EducationalSection
          title="Guía de Titulación Ácido-Base"
          subtitle="Curvas de pH, equivalencia e indicadores"
        >
          <h3>Tabla de Indicadores Comunes</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Rango pH</th>
                  <th>Color ácido</th>
                  <th>Color básico</th>
                  <th>Cuándo usar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Naranja de metilo</td>
                  <td>3,1 – 4,4</td>
                  <td>Rojo</td>
                  <td>Amarillo</td>
                  <td>Ácido fuerte + base débil (equivalencia ácida)</td>
                </tr>
                <tr>
                  <td>Azul de bromotimol</td>
                  <td>6,0 – 7,6</td>
                  <td>Amarillo</td>
                  <td>Azul</td>
                  <td>Ácido fuerte + base fuerte (equivalencia neutra)</td>
                </tr>
                <tr>
                  <td>Tornasol</td>
                  <td>5,0 – 8,0</td>
                  <td>Rojo</td>
                  <td>Azul</td>
                  <td>Indicador general; baja precisión</td>
                </tr>
                <tr>
                  <td>Fenolftaleína</td>
                  <td>8,2 – 10,0</td>
                  <td>Incoloro</td>
                  <td>Rosa fucsia</td>
                  <td>Ácido débil + base fuerte (equivalencia básica)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Acidez de un vinagre</h4>
              <p>
                Titular ácido acético (CH₃COOH, débil) con NaOH 0,1 M y fenolftaleína. El punto de equivalencia
                aparece a pH ~8,7 (no neutro), por la sal acetato.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Análisis de antiácidos</h4>
              <p>
                Determinar la cantidad de hidróxido en un antiácido titulando con HCl. Curva inversa: pH baja al
                añadir titulante. Indicador: rojo de metilo o naranja.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Pureza de aspirina</h4>
              <p>
                El ácido acetilsalicílico (pKa ≈ 3,5) se titula con NaOH y se detecta con fenolftaleína. Permite
                calcular la masa real de aspirina por tableta.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Calidad del agua</h4>
              <p>
                La alcalinidad (carbonatos, bicarbonatos) se mide titulando con HCl hasta dos puntos de
                equivalencia: fenolftaleína (pH 8,3) y naranja de metilo (pH 4,3).
              </p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre punto de equivalencia y punto final?</strong>
              <p>
                El <em>punto de equivalencia</em> es el punto teórico donde los moles de ácido y base son iguales.
                El <em>punto final</em> es el punto experimental donde el indicador cambia de color.
              </p>
              <p className={styles.faqTip}>
                Tip: elige un indicador cuyo rango de viraje coincida con el pH del punto de equivalencia para
                minimizar el error.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el punto de equivalencia no es pH=7 en ácido débil + base fuerte?</strong>
              <p>
                Porque la sal formada (ej. acetato de sodio) sufre hidrólisis: el ion acetato es básico y eleva el
                pH por encima de 7.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la zona tampón en una titulación?</strong>
              <p>
                Es la región plana antes de la equivalencia (en titulaciones de ácido débil) donde coexisten ácido
                y su base conjugada. El pH cambia poco al añadir titulante; en el punto medio, pH = pKa.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo elijo el indicador correcto?</strong>
              <p>
                El rango de viraje del indicador debe quedar dentro del salto vertical de la curva. Si la curva
                tiene salto entre pH 4 y 10 (AF+BF), casi cualquier indicador funciona; si el salto es estrecho
                (AD+BD), la elección es crítica.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué la curva tiene un salto brusco?</strong>
              <p>
                Cerca de la equivalencia hay muy poco ácido o base sin reaccionar, por lo que añadir una gota más
                cambia drásticamente el pH. El salto es mayor cuando ambos reactivos son fuertes y concentrados.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué se sigue añadiendo titulante después de la equivalencia?</strong>
              <p>
                Para confirmar que hemos pasado el punto final y observar el plateau característico. En la
                práctica, basta con detectar el cambio de color y registrar el volumen.
              </p>
            </div>
          </div>

          <h3>Cómo Realizar una Titulación — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Preparar el analito</strong>
                <p>Pipetear un volumen exacto de la disolución a analizar en un matraz Erlenmeyer.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Añadir el indicador</strong>
                <p>Echar 2-3 gotas del indicador adecuado para el tipo de titulación.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Llenar la bureta</strong>
                <p>Cargar la bureta con el titulante de concentración conocida y enrasar a 0,00 mL.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Titular gota a gota</strong>
                <p>Añadir titulante mientras se agita, ralentizando cerca del punto final.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Registrar el volumen</strong>
                <p>Anotar el volumen consumido al primer cambio de color permanente. Repetir 2-3 veces.</p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Pesa el indicador</strong>
                <p>Usa exactamente 2-3 gotas: demasiado indicador puede consumir titulante y falsear el resultado.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💧</span>
              <div>
                <strong>Goteo controlado</strong>
                <p>Cerca del punto de equivalencia, añade media gota o lava la pared del matraz con agua destilada.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Lee la bureta a la altura del menisco</strong>
                <p>El nivel correcto es el inferior del menisco, leído al ojo para evitar paralaje.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <div>
                <strong>Repite tres veces</strong>
                <p>Calcula la media solo con los volúmenes que difieran en menos de 0,1 mL entre sí.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Usa pH-metro si puedes</strong>
                <p>Para titulaciones débil + débil, un pH-metro es más fiable que el indicador de color.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <div>
                <strong>Estandariza el titulante</strong>
                <p>Las disoluciones de NaOH absorben CO₂; estandarízalas con un patrón primario (KHFt) antes de usar.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores Frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>Confundir punto final con punto de equivalencia (pueden diferir 0,1-0,5 unidades de pH).</li>
              <li>Usar fenolftaleína en una titulación con punto de equivalencia ácido (pH&lt;5): el indicador no vira.</li>
              <li>No purgar la punta de la bureta: deja una burbuja que se escapa y desplaza el volumen.</li>
              <li>Añadir titulante demasiado rápido cerca del salto: se sobrepasa el punto final.</li>
              <li>No agitar el matraz: la mezcla no es homogénea y el indicador da lecturas erráticas.</li>
              <li>Usar disoluciones viejas de NaOH sin reestandarizar: el CO₂ disuelto altera la concentración real.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-titulacion')} />
        <ShareCard appName="simulador-titulacion" />
      </main>

      <Footer appName="simulador-titulacion" />
    </div>
  );
}
