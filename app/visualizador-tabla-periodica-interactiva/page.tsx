'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './TablaPeriodica.module.css';
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
// Tipos
// ─────────────────────────────────────────────

type Seccion = 'electronegatividad' | 'radio' | 'ionizacion' | 'importan';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

interface Elemento {
  z: number;         // Número atómico
  simbolo: string;
  nombre: string;
  en: number | null;  // Electronegatividad (Pauling)
  radio: number | null; // Radio atómico (pm)
  ei: number | null;  // Primera energía de ionización (kJ/mol)
  fila: number;       // Fila en la tabla (1-4 para períodos 1-4)
  col: number;        // Columna en la tabla (1-18)
}

const SECCIONES: SeccionInfo[] = [
  { id: 'electronegatividad', titulo: 'Electronegatividad', icono: '⚡', subtitulo: 'Quién atrae electrones con más fuerza' },
  { id: 'radio', titulo: 'Radio Atómico', icono: '⭕', subtitulo: 'El tamaño importa (a escala atómica)' },
  { id: 'ionizacion', titulo: 'Energía de Ionización', icono: '💥', subtitulo: 'Lo que cuesta arrancar un electrón' },
  { id: 'importan', titulo: '¿Por qué Importan?', icono: '🔬', subtitulo: 'Aplicaciones reales de las tendencias' },
];

// ─────────────────────────────────────────────
// Datos: primeros 36 elementos (H–Kr)
// Valores reales: EN (Pauling), Radio (pm empírico), EI (kJ/mol)
// ─────────────────────────────────────────────

const ELEMENTOS: Elemento[] = [
  // Período 1
  { z: 1,  simbolo: 'H',  nombre: 'Hidrógeno',   en: 2.20, radio: 25,  ei: 1312, fila: 1, col: 1 },
  { z: 2,  simbolo: 'He', nombre: 'Helio',        en: null, radio: 31,  ei: 2372, fila: 1, col: 18 },
  // Período 2
  { z: 3,  simbolo: 'Li', nombre: 'Litio',        en: 0.98, radio: 145, ei: 520,  fila: 2, col: 1 },
  { z: 4,  simbolo: 'Be', nombre: 'Berilio',      en: 1.57, radio: 105, ei: 900,  fila: 2, col: 2 },
  { z: 5,  simbolo: 'B',  nombre: 'Boro',         en: 2.04, radio: 85,  ei: 801,  fila: 2, col: 13 },
  { z: 6,  simbolo: 'C',  nombre: 'Carbono',      en: 2.55, radio: 70,  ei: 1086, fila: 2, col: 14 },
  { z: 7,  simbolo: 'N',  nombre: 'Nitrógeno',    en: 3.04, radio: 65,  ei: 1402, fila: 2, col: 15 },
  { z: 8,  simbolo: 'O',  nombre: 'Oxígeno',      en: 3.44, radio: 60,  ei: 1314, fila: 2, col: 16 },
  { z: 9,  simbolo: 'F',  nombre: 'Flúor',        en: 3.98, radio: 50,  ei: 1681, fila: 2, col: 17 },
  { z: 10, simbolo: 'Ne', nombre: 'Neón',         en: null, radio: 38,  ei: 2081, fila: 2, col: 18 },
  // Período 3
  { z: 11, simbolo: 'Na', nombre: 'Sodio',        en: 0.93, radio: 180, ei: 496,  fila: 3, col: 1 },
  { z: 12, simbolo: 'Mg', nombre: 'Magnesio',     en: 1.31, radio: 150, ei: 738,  fila: 3, col: 2 },
  { z: 13, simbolo: 'Al', nombre: 'Aluminio',     en: 1.61, radio: 125, ei: 578,  fila: 3, col: 13 },
  { z: 14, simbolo: 'Si', nombre: 'Silicio',      en: 1.90, radio: 110, ei: 786,  fila: 3, col: 14 },
  { z: 15, simbolo: 'P',  nombre: 'Fósforo',      en: 2.19, radio: 100, ei: 1012, fila: 3, col: 15 },
  { z: 16, simbolo: 'S',  nombre: 'Azufre',       en: 2.58, radio: 100, ei: 1000, fila: 3, col: 16 },
  { z: 17, simbolo: 'Cl', nombre: 'Cloro',        en: 3.16, radio: 100, ei: 1251, fila: 3, col: 17 },
  { z: 18, simbolo: 'Ar', nombre: 'Argón',        en: null, radio: 71,  ei: 1521, fila: 3, col: 18 },
  // Período 4
  { z: 19, simbolo: 'K',  nombre: 'Potasio',      en: 0.82, radio: 220, ei: 419,  fila: 4, col: 1 },
  { z: 20, simbolo: 'Ca', nombre: 'Calcio',       en: 1.00, radio: 180, ei: 590,  fila: 4, col: 2 },
  { z: 21, simbolo: 'Sc', nombre: 'Escandio',     en: 1.36, radio: 160, ei: 633,  fila: 4, col: 3 },
  { z: 22, simbolo: 'Ti', nombre: 'Titanio',      en: 1.54, radio: 140, ei: 659,  fila: 4, col: 4 },
  { z: 23, simbolo: 'V',  nombre: 'Vanadio',      en: 1.63, radio: 135, ei: 651,  fila: 4, col: 5 },
  { z: 24, simbolo: 'Cr', nombre: 'Cromo',        en: 1.66, radio: 140, ei: 653,  fila: 4, col: 6 },
  { z: 25, simbolo: 'Mn', nombre: 'Manganeso',    en: 1.55, radio: 140, ei: 717,  fila: 4, col: 7 },
  { z: 26, simbolo: 'Fe', nombre: 'Hierro',       en: 1.83, radio: 140, ei: 762,  fila: 4, col: 8 },
  { z: 27, simbolo: 'Co', nombre: 'Cobalto',      en: 1.88, radio: 135, ei: 760,  fila: 4, col: 9 },
  { z: 28, simbolo: 'Ni', nombre: 'Níquel',       en: 1.91, radio: 135, ei: 737,  fila: 4, col: 10 },
  { z: 29, simbolo: 'Cu', nombre: 'Cobre',        en: 1.90, radio: 135, ei: 745,  fila: 4, col: 11 },
  { z: 30, simbolo: 'Zn', nombre: 'Zinc',         en: 1.65, radio: 135, ei: 906,  fila: 4, col: 12 },
  { z: 31, simbolo: 'Ga', nombre: 'Galio',        en: 1.81, radio: 130, ei: 579,  fila: 4, col: 13 },
  { z: 32, simbolo: 'Ge', nombre: 'Germanio',     en: 2.01, radio: 125, ei: 762,  fila: 4, col: 14 },
  { z: 33, simbolo: 'As', nombre: 'Arsénico',     en: 2.18, radio: 115, ei: 947,  fila: 4, col: 15 },
  { z: 34, simbolo: 'Se', nombre: 'Selenio',      en: 2.55, radio: 115, ei: 941,  fila: 4, col: 16 },
  { z: 35, simbolo: 'Br', nombre: 'Bromo',        en: 2.96, radio: 115, ei: 1140, fila: 4, col: 17 },
  { z: 36, simbolo: 'Kr', nombre: 'Kriptón',      en: 3.00, radio: 88,  ei: 1351, fila: 4, col: 18 },
];

// ─────────────────────────────────────────────
// Funciones de color
// ─────────────────────────────────────────────

function interpolarColor(valor: number, min: number, max: number, colores: [string, string, string]): string {
  const t = Math.max(0, Math.min(1, (valor - min) / (max - min)));
  // Azul → Verde → Rojo (3 stops)
  if (t < 0.5) {
    const t2 = t * 2;
    return mezclarHex(colores[0], colores[1], t2);
  }
  const t2 = (t - 0.5) * 2;
  return mezclarHex(colores[1], colores[2], t2);
}

function mezclarHex(hex1: string, hex2: string, t: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

function colorElectronegatividad(en: number | null): string {
  if (en === null) return '#CCCCCC';
  return interpolarColor(en, 0.7, 4.0, ['#3B82F6', '#10B981', '#EF4444']);
}

function colorEnergia(ei: number | null): string {
  if (ei === null) return '#CCCCCC';
  return interpolarColor(ei, 400, 2400, ['#8B5CF6', '#F59E0B', '#EAB308']);
}

function textoContraste(bgColor: string): string {
  // Extraer RGB del string rgb(r,g,b)
  const match = bgColor.match(/(\d+),(\d+),(\d+)/);
  if (!match) return '#000000';
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.5 ? '#000000' : '#FFFFFF';
}

// ─────────────────────────────────────────────
// Componente: Grid de la tabla periódica
// ─────────────────────────────────────────────

interface TooltipData {
  elemento: Elemento;
  x: number;
  y: number;
}

interface TablaGridProps {
  modo: 'electronegatividad' | 'radio' | 'ionizacion';
}

function TablaGrid({ modo }: TablaGridProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const handleClick = useCallback((el: Elemento, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.min(rect.left, window.innerWidth - 320);
    const y = rect.bottom + 8;
    setTooltip(prev => prev?.elemento.z === el.z ? null : { elemento: el, x, y });
  }, []);

  const cerrarTooltip = useCallback(() => setTooltip(null), []);

  // Generar grid completo 4 filas x 18 cols
  const celdas: (Elemento | null)[][] = [];
  for (let fila = 1; fila <= 4; fila++) {
    const filaArr: (Elemento | null)[] = [];
    for (let col = 1; col <= 18; col++) {
      const el = ELEMENTOS.find(e => e.fila === fila && e.col === col) ?? null;
      filaArr.push(el);
    }
    celdas.push(filaArr);
  }

  return (
    <>
      {/* Leyenda */}
      <div className={styles.leyenda}>
        {modo === 'electronegatividad' && (
          <>
            <span className={styles.leyendaLabel}>Baja</span>
            <div className={styles.leyendaBarra} style={{ background: 'linear-gradient(to right, #3B82F6, #10B981, #EF4444)' }} />
            <span className={styles.leyendaLabel}>Alta</span>
          </>
        )}
        {modo === 'radio' && (
          <>
            <span className={styles.leyendaLabel}>Pequeño (31 pm)</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>— tamaño del círculo proporcional al radio —</span>
            <span className={styles.leyendaLabel}>Grande (220 pm)</span>
          </>
        )}
        {modo === 'ionizacion' && (
          <>
            <span className={styles.leyendaLabel}>Baja</span>
            <div className={styles.leyendaBarra} style={{ background: 'linear-gradient(to right, #8B5CF6, #F59E0B, #EAB308)' }} />
            <span className={styles.leyendaLabel}>Alta</span>
          </>
        )}
      </div>

      {/* Flechas de tendencia */}
      <div className={styles.flechas}>
        {modo === 'electronegatividad' && (
          <>
            <div className={styles.flecha}>
              <svg className={styles.flechaSvg} viewBox="0 0 80 24" aria-hidden="true">
                <defs><marker id="arrEN1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#EF4444" /></marker></defs>
                <line x1="4" y1="12" x2="70" y2="12" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrEN1)" />
              </svg>
              <span>Aumenta →</span>
            </div>
            <div className={styles.flecha}>
              <svg className={styles.flechaSvg} viewBox="0 0 80 24" aria-hidden="true">
                <defs><marker id="arrEN2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#EF4444" /></marker></defs>
                <line x1="4" y1="20" x2="70" y2="4" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrEN2)" />
              </svg>
              <span>Aumenta ↑</span>
            </div>
          </>
        )}
        {modo === 'radio' && (
          <>
            <div className={styles.flecha}>
              <svg className={styles.flechaSvg} viewBox="0 0 80 24" aria-hidden="true">
                <defs><marker id="arrR1" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto-start-reverse"><polygon points="0 0, 8 3, 0 6" fill="#2E86AB" /></marker></defs>
                <line x1="70" y1="12" x2="4" y2="12" stroke="#2E86AB" strokeWidth="2" markerEnd="url(#arrR1)" />
              </svg>
              <span>← Aumenta</span>
            </div>
            <div className={styles.flecha}>
              <svg className={styles.flechaSvg} viewBox="0 0 80 24" aria-hidden="true">
                <defs><marker id="arrR2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#2E86AB" /></marker></defs>
                <line x1="4" y1="4" x2="70" y2="20" stroke="#2E86AB" strokeWidth="2" markerEnd="url(#arrR2)" />
              </svg>
              <span>Aumenta ↓</span>
            </div>
          </>
        )}
        {modo === 'ionizacion' && (
          <>
            <div className={styles.flecha}>
              <svg className={styles.flechaSvg} viewBox="0 0 80 24" aria-hidden="true">
                <defs><marker id="arrEI1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#F59E0B" /></marker></defs>
                <line x1="4" y1="12" x2="70" y2="12" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrEI1)" />
              </svg>
              <span>Aumenta →</span>
            </div>
            <div className={styles.flecha}>
              <svg className={styles.flechaSvg} viewBox="0 0 80 24" aria-hidden="true">
                <defs><marker id="arrEI2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#F59E0B" /></marker></defs>
                <line x1="4" y1="20" x2="70" y2="4" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrEI2)" />
              </svg>
              <span>Aumenta ↑</span>
            </div>
          </>
        )}
      </div>

      {/* Grid */}
      <div className={styles.tablaWrapper}>
        <div className={styles.tablaGrid} role="grid" aria-label="Tabla periódica - primeros 36 elementos">
          {celdas.map((fila, fi) =>
            fila.map((el, ci) => {
              if (!el) {
                return <div key={`vacio-${fi}-${ci}`} className={styles.elementoVacio} />;
              }

              if (modo === 'radio') {
                const maxRadio = 220;
                const minRadio = 25;
                const radio = el.radio ?? 100;
                const tamano = 20 + ((radio - minRadio) / (maxRadio - minRadio)) * 80;
                return (
                  <button
                    key={el.z}
                    type="button"
                    className={styles.elemento}
                    onClick={(e) => handleClick(el, e)}
                    aria-label={`${el.nombre}: radio ${el.radio ?? '?'} pm`}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className={styles.circuloRadio}
                      style={{ width: `${tamano}%`, height: `${tamano}%` }}
                    />
                    <span className={styles.elementoSimbolo} style={{ fontSize: '0.55rem', position: 'absolute', bottom: '1px' }}>
                      {el.simbolo}
                    </span>
                  </button>
                );
              }

              const bgColor = modo === 'electronegatividad'
                ? colorElectronegatividad(el.en)
                : colorEnergia(el.ei);
              const textColor = textoContraste(bgColor);

              return (
                <button
                  key={el.z}
                  type="button"
                  className={styles.elemento}
                  onClick={(e) => handleClick(el, e)}
                  aria-label={`${el.nombre}: ${modo === 'electronegatividad'
                    ? `electronegatividad ${el.en ?? 'N/D'}`
                    : `EI ${el.ei ?? 'N/D'} kJ/mol`}`}
                  style={{ background: bgColor, color: textColor }}
                >
                  <span className={styles.elementoNumero} style={{ color: textColor }}>{el.z}</span>
                  <span className={styles.elementoSimbolo}>{el.simbolo}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <>
          <div className={styles.tooltipOverlay} onClick={cerrarTooltip} aria-hidden="true" />
          <div
            className={styles.tooltip}
            style={{ left: `${Math.max(8, tooltip.x)}px`, top: `${Math.min(tooltip.y, window.innerHeight - 240)}px` }}
            role="dialog"
            aria-label={`Datos de ${tooltip.elemento.nombre}`}
          >
            <div className={styles.tooltipHeader}>
              <span className={styles.tooltipSimbolo}>{tooltip.elemento.simbolo}</span>
              <span className={styles.tooltipNombre}>{tooltip.elemento.nombre}</span>
            </div>
            <div className={styles.tooltipDatos}>
              <span className={styles.tooltipDato}><strong>Z:</strong> {tooltip.elemento.z}</span>
              <span className={styles.tooltipDato}>
                <strong>Electronegatividad:</strong> {tooltip.elemento.en !== null ? formatNumber(tooltip.elemento.en, 2) : 'N/D (gas noble)'}
              </span>
              <span className={styles.tooltipDato}>
                <strong>Radio atómico:</strong> {tooltip.elemento.radio !== null ? `${formatNumber(tooltip.elemento.radio, 0)} pm` : 'N/D'}
              </span>
              <span className={styles.tooltipDato}>
                <strong>1ª Energía ionización:</strong> {tooltip.elemento.ei !== null ? `${formatNumber(tooltip.elemento.ei, 0)} kJ/mol` : 'N/D'}
              </span>
            </div>
            <p className={styles.tooltipCerrar}>Toca fuera para cerrar</p>
          </div>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Sección 1: Electronegatividad
// ─────────────────────────────────────────────

function SeccionElectronegatividad() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La <strong>electronegatividad</strong> mide la capacidad de un átomo para atraer electrones en un enlace químico. Escala de Pauling: de 0,79 (Cs) a 3,98 (F).</p>
      </div>

      <TablaGrid modo="electronegatividad" />

      <div className={styles.datoDestacado}>
        <span className={styles.datoNumero}>3,98</span>
        <span className={styles.datoTexto}>El flúor tiene la electronegatividad más alta de toda la tabla periódica — atrae electrones con fuerza brutal.</span>
      </div>

      <div className={styles.insight}>
        <p>
          La diferencia de electronegatividad entre dos átomos determina el tipo de enlace:
          si la diferencia es <strong>&gt; 1,7</strong> → enlace iónico (como NaCl).
          Si es <strong>&lt; 0,4</strong> → covalente puro (como H₂).
          Entre ambos → covalente polar (como H₂O, la molécula de la vida).
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Radio Atómico
// ─────────────────────────────────────────────

function SeccionRadio() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El <strong>radio atómico</strong> mide el tamaño del átomo. Tendencia opuesta a la electronegatividad: aumenta hacia abajo y hacia la izquierda.</p>
      </div>

      <TablaGrid modo="radio" />

      <div className={styles.datoDestacado}>
        <span className={styles.datoNumero}>7×</span>
        <span className={styles.datoTexto}>El potasio (220 pm) es 7 veces más grande que el helio (31 pm). Mismo universo, escalas radicalmente distintas.</span>
      </div>

      <div className={styles.insight}>
        <p>
          Al añadir capas de electrones, el átomo crece como una cebolla. Pero dentro del mismo período,
          al añadir protones al núcleo, la carga positiva <strong>tira de los electrones hacia dentro</strong>,
          haciendo el átomo más pequeño. Por eso el flúor (9 protones) es más pequeño que el litio (3 protones)
          en el mismo período.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Energía de Ionización
// ─────────────────────────────────────────────

function SeccionIonizacion() {
  // Datos para gráfico de barras
  const maxEI = Math.max(...ELEMENTOS.filter(e => e.ei !== null).map(e => e.ei as number));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La <strong>primera energía de ionización</strong> es la energía necesaria para arrancar el electrón más externo. Los gases nobles tienen los valores más altos: sus electrones están muy contentos donde están.</p>
      </div>

      <TablaGrid modo="ionizacion" />

      {/* Gráfico de barras */}
      <div className={styles.graficoBarra}>
        <h3 className={styles.graficoTitulo}>Primera energía de ionización (kJ/mol) — Elementos 1-36</h3>
        <div className={styles.barrasContainer}>
          {ELEMENTOS.map(el => {
            const ei = el.ei ?? 0;
            const altura = (ei / maxEI) * 100;
            const esNoble = [2, 10, 18, 36].includes(el.z);
            const color = esNoble ? '#EAB308' : '#8B5CF6';
            return (
              <div key={el.z} className={styles.barraItem} title={`${el.nombre}: ${formatNumber(ei, 0)} kJ/mol`}>
                <div
                  className={styles.barra}
                  style={{ height: `${altura}%`, background: color }}
                />
                <span className={styles.barraLabel}>{el.simbolo}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoNumero} style={{ fontSize: '1.8rem' }}>2.372</span>
        <span className={styles.datoTexto}>kJ/mol — lo que cuesta arrancar un electrón al helio. Es la energía de ionización más alta de todos los elementos.</span>
      </div>

      <div className={styles.insight}>
        <p>
          Los <strong>picos en el gráfico son los gases nobles</strong> (He, Ne, Ar, Kr): tienen su capa electrónica completa
          y arrancarles un electrón es extremadamente difícil. Los <strong>valles son los metales alcalinos</strong> (Li, Na, K):
          tienen un solo electrón externo que pierden fácilmente, por eso son tan reactivos.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: ¿Por qué importan?
// ─────────────────────────────────────────────

interface Aplicacion {
  icono: string;
  titulo: string;
  propiedad: string;
  descripcion: string;
}

const APLICACIONES: Aplicacion[] = [
  {
    icono: '🔋',
    titulo: 'Baterías y energía',
    propiedad: 'Electronegatividad → polaridad de enlaces',
    descripcion: 'La diferencia de electronegatividad entre ánodo y cátodo genera el voltaje. Las baterías de litio funcionan porque el Li cede electrones fácilmente (baja EN) y el CoO₂ los atrae (alta EN).',
  },
  {
    icono: '💎',
    titulo: 'Materiales y cristales',
    propiedad: 'Radio atómico → estructura cristalina',
    descripcion: 'El tamaño de los átomos determina cómo se empaquetan en un cristal. El diamante (C con radio 70 pm) y el grafeno son el mismo elemento con diferente estructura. El silicio (110 pm) es la base de toda la electrónica.',
  },
  {
    icono: '⚡',
    titulo: 'Reactividad química',
    propiedad: 'Energía de ionización → facilidad de formar iones',
    descripcion: 'Los metales alcalinos (baja EI) reaccionan violentamente con el agua. El sodio explota al contacto. El potasio arde con llama violeta. El cesio detona. Todo porque pierden su electrón externo casi sin esfuerzo.',
  },
  {
    icono: '🧲',
    titulo: 'Semiconductores',
    propiedad: 'Afinidad electrónica → conductividad controlada',
    descripcion: 'Los semiconductores (Si, Ge) tienen propiedades intermedias que permiten controlar el flujo de electrones. Dopándolos con elementos de diferente grupo (B, P, As) se crean los chips que mueven el mundo.',
  },
];

function SeccionImportan() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La tabla periódica es un <strong>mapa</strong>: las tendencias predicen el comportamiento químico de cualquier elemento. No es memorizar datos — es entender patrones.</p>
      </div>

      <div className={styles.aplicacionesGrid}>
        {APLICACIONES.map(app => (
          <div key={app.titulo} className={styles.aplicacionCard}>
            <span className={styles.aplicacionIcono} aria-hidden="true">{app.icono}</span>
            <h3 className={styles.aplicacionTitulo}>{app.titulo}</h3>
            <p className={styles.aplicacionDesc}>
              <strong>{app.propiedad}</strong>
            </p>
            <p className={styles.aplicacionDesc}>{app.descripcion}</p>
          </div>
        ))}
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoNumero}>3</span>
        <span className={styles.datoTexto}>elementos predijo Mendeleev antes de que se descubrieran (galio, escandio y germanio), solo mirando los huecos y tendencias de su tabla.</span>
      </div>

      <div className={styles.insight}>
        <p>
          En 1869, Mendeleev dejó <strong>huecos deliberados</strong> en su tabla y predijo las propiedades exactas
          de elementos que aún no existían. Cuando se descubrieron el galio (1875), el escandio (1879) y el
          germanio (1886), sus propiedades coincidían con las predicciones. La tabla periódica no es una lista:
          es una <strong>herramienta predictiva</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorTablaPeriodInteractiva() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('electronegatividad');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'electronegatividad': return <SeccionElectronegatividad />;
      case 'radio': return <SeccionRadio />;
      case 'ionizacion': return <SeccionIonizacion />;
      case 'importan': return <SeccionImportan />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Tendencias de la Tabla Periódica</h1>
          <p className={styles.subtitle}>El mapa de la química: patrones que predicen el comportamiento de la materia</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre tendencias periódicas"
          subtitle="Conceptos clave y curiosidades"
          defaultOpen={false}
        >
          <h3>¿Por qué existen las tendencias?</h3>
          <p>
            Las tendencias periódicas existen porque la <strong>estructura electrónica</strong> de los átomos
            sigue un patrón regular. Al avanzar en un período (izquierda → derecha), se añaden protones y
            electrones en la misma capa: más carga nuclear = más atracción = átomos más pequeños y más
            electronegativos. Al bajar en un grupo, se añaden nuevas capas: más distancia = menos atracción
            = átomos más grandes y menos electronegativos.
          </p>

          <h3>Excepciones a las tendencias</h3>
          <p>
            Las tendencias son <strong>generales, no absolutas</strong>. Los metales de transición (período 4,
            grupos 3-12) muestran variaciones porque llenan orbitales d, que apantallan parcialmente la carga
            nuclear. Por ejemplo, el radio atómico apenas cambia del Sc al Zn. Y los gases nobles no tienen
            electronegatividad asignada porque raramente forman enlaces.
          </p>

          <h3>¿Qué es la afinidad electrónica?</h3>
          <p>
            Es la energía liberada cuando un átomo neutro <strong>captura un electrón</strong>. Es complementaria
            a la energía de ionización (que mide lo que cuesta perder uno). Los halógenos (F, Cl, Br) tienen
            las afinidades más altas: están a un electrón de completar su capa y lo quieren con urgencia.
          </p>

          <h3>¿Cuántas propiedades periódicas hay?</h3>
          <p>
            Además de las tres principales (electronegatividad, radio atómico, energía de ionización), existen
            muchas otras: <strong>radio iónico, punto de fusión, densidad, carácter metálico, potencial de
            reducción</strong> y más. Todas siguen patrones similares porque todas dependen de la misma causa:
            la estructura electrónica.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de química con fines educativos.
            Los valores mostrados son aproximados y pueden variar ligeramente según la fuente consultada.
            Se muestran los primeros 36 elementos (H–Kr) para ilustrar tendencias generales.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-tabla-periodica-interactiva')} />
        <ShareCard appName="visualizador-tabla-periodica-interactiva" />
        <Footer appName="visualizador-tabla-periodica-interactiva" />
      </div>
    </>
  );
}
