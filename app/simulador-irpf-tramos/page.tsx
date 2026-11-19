'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
  RegionBadge,
  DataReference,
} from '@/components';
import { formatNumber, formatCurrency } from '@/lib';
import {
  TRAMOS_IRPF_2025,
  FISCAL_IRPF_META,
  MINIMOS_IRPF_2025,
  cuotaEscalaGeneral,
  calcularCuotaIntegraGeneral,
  desglosarEscalaGeneral,
} from '@/data/fiscal';
import styles from './SimuladorIrpfTramos.module.css';
import { FAQ_BASE_LIQUIDABLE, FAQ_TIPO_MEDIO, FAQ_SUBIR_TRAMO } from './faq';

// Año de los datos: la vigencia del módulo, como el title (hallazgo 5164)
const ANIO = FISCAL_IRPF_META.vigencia;

// Casos de uso calculados con la escala de data/fiscal, no tecleados (hallazgo 5160)
const fmtEur = (n: number) => formatCurrency(n);
const fmtPct = (n: number) => `${formatNumber(n, 2)} %`;
const JUBILADO_BASE = 24000;
const JUBILADO_ESCALA = cuotaEscalaGeneral(JUBILADO_BASE);
const JUBILADO_CUOTA = calcularCuotaIntegraGeneral(JUBILADO_BASE, MINIMOS_IRPF_2025.personal_65);
const MINIMO_HIJOS_2 = MINIMOS_IRPF_2025.hijo_1 + MINIMOS_IRPF_2025.hijo_2;
const MINIMO_FAMILIA = MINIMOS_IRPF_2025.personal + MINIMO_HIJOS_2;
// Ahorro frente al soltero de la misma base, que también tiene su mínimo personal
const AHORRO_FAMILIA = cuotaEscalaGeneral(MINIMO_FAMILIA) - cuotaEscalaGeneral(MINIMOS_IRPF_2025.personal);
// Asalariado y autónomo con el mínimo personal (hallazgo 5157): la cuota íntegra, no la escala
const ASALARIADO_BASE = 30000;
const ASALARIADO_ESCALA = cuotaEscalaGeneral(ASALARIADO_BASE);
const ASALARIADO_CUOTA = calcularCuotaIntegraGeneral(ASALARIADO_BASE, MINIMOS_IRPF_2025.personal);
const AUTONOMO_BASE = 45000;
const AUTONOMO_ESCALA = cuotaEscalaGeneral(AUTONOMO_BASE);
const AUTONOMO_CUOTA = calcularCuotaIntegraGeneral(AUTONOMO_BASE, MINIMOS_IRPF_2025.personal);

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Vista = 'tramos' | 'escalera' | 'comparativa';

interface DesgloseTramo {
  desde: number;
  hasta: number;
  tipo: number;
  baseAplicada: number;
  cuota: number;
}

interface ResultadoCuota {
  /** Cuota íntegra: la escala sobre la base menos la escala sobre el mínimo (art. 63.1.2.º LIRPF). */
  cuota: number;
  /** La escala aplicada a la base entera (la suma de la leyenda de tramos). */
  cuotaEscala: number;
  /** La escala aplicada a la parte de la base que corresponde al mínimo (tipo cero). */
  cuotaDelMinimo: number;
  /** El mínimo que cabe en la base: el que no cabe no llega a gravarse. */
  minimoAplicado: number;
  desglose: DesgloseTramo[];
  tipoMedio: number;
  tipoMarginal: number;
}

// ─── Lógica ────────────────────────────────────────────────────────────────────

const TOPE_VISUAL = 320000; // tope visualización para tramo abierto
const MINIMO_MAXIMO = 30000; // tope del deslizador del mínimo personal y familiar

/*
 * ⚠️ 19/11/2026 (hallazgo 5157, decidido por el usuario en el cabo C0833) — la «Cuota íntegra» era
 * la escala aplicada a la base, sin restar la cuota del mínimo personal y familiar: con 45.000 €
 * daba 12.351,50 € en vez de 11.297,00 € (1.054,50 € de más con cualquier base que supere 5.550 €).
 * Ahora la cuota sale de `calcularCuotaIntegraGeneral` y la leyenda de tramos, de
 * `desglosarEscalaGeneral`, las dos de data/fiscal.
 */
function calcularCuotaTramos(base: number, minimo: number): ResultadoCuota {
  const b = Math.max(0, base);
  const { cuota: cuotaEscala, tramos } = desglosarEscalaGeneral(b);
  const desglose: DesgloseTramo[] = TRAMOS_IRPF_2025.map((tramo, i) => {
    const aplicado = tramos[i];
    return {
      desde: i === 0 ? 0 : TRAMOS_IRPF_2025[i - 1].hasta,
      hasta: tramo.hasta === Infinity ? Math.max(TOPE_VISUAL, b + 50000) : tramo.hasta,
      tipo: tramo.tipo,
      baseAplicada: aplicado?.base ?? 0,
      cuota: aplicado?.cuota ?? 0,
    };
  });
  const minimoAplicado = Math.min(Math.max(0, minimo), b);
  const cuota = calcularCuotaIntegraGeneral(b, minimo);
  // Mientras la base no supera el mínimo, un euro más no paga nada: el marginal es 0
  const tipoMarginal = b > minimoAplicado && tramos.length > 0 ? tramos[tramos.length - 1].tipo : 0;

  return {
    cuota,
    cuotaEscala,
    cuotaDelMinimo: cuotaEscalaGeneral(minimoAplicado),
    minimoAplicado,
    desglose,
    tipoMedio: b > 0 ? (cuota / b) * 100 : 0,
    tipoMarginal,
  };
}

const COLORES_TRAMOS = ['#10b981', '#84cc16', '#eab308', '#f59e0b', '#ef4444', '#b91c1c'];
const CLASES_TRAMOS = [styles.tramoT19, styles.tramoT24, styles.tramoT30, styles.tramoT37, styles.tramoT45, styles.tramoT47];

const EJEMPLOS = [
  { etiqueta: '12.450 €', valor: 12450, descripcion: 'Frontera 1er tramo' },
  { etiqueta: '30.000 €', valor: 30000, descripcion: 'Asalariado medio' },
  { etiqueta: '60.000 €', valor: 60000, descripcion: 'Frontera 4º tramo' },
  { etiqueta: '100.000 €', valor: 100000, descripcion: 'Renta alta' },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SimuladorIrpfTramosPage() {
  const [base, setBase] = useState<number>(30000);
  const [incremento, setIncremento] = useState<number>(0);
  const [minimo, setMinimo] = useState<number>(MINIMOS_IRPF_2025.personal);
  const [vista, setVista] = useState<Vista>('tramos');

  const baseFinal = Math.max(0, base + incremento);

  const resultadoBase = useMemo(() => calcularCuotaTramos(base, minimo), [base, minimo]);
  const resultadoFinal = useMemo(() => calcularCuotaTramos(baseFinal, minimo), [baseFinal, minimo]);

  const diferenciaCuota = resultadoFinal.cuota - resultadoBase.cuota;

  const aplicarEjemplo = useCallback((valor: number) => {
    setBase(valor);
  }, []);

  // ─── SVG Vista por Tramos (barras horizontales apiladas) ────────────────────
  const renderVistaTramos = () => {
    const baseAMostrar = baseFinal > 0 ? baseFinal : 1;
    const totalAncho = 100; // %

    return (
      <div className={styles.tramosContainer}>
        <div
          className={styles.tramosBarStack}
          role="img"
          aria-label={`Desglose de IRPF para base liquidable de ${formatCurrency(baseFinal)}`}
        >
          {resultadoFinal.desglose.map((tramo, i) => {
            if (tramo.baseAplicada <= 0) return null;
            const ancho = (tramo.baseAplicada / baseAMostrar) * totalAncho;
            return (
              <div
                key={i}
                className={`${styles.tramoBar} ${CLASES_TRAMOS[i] ?? ''}`}
                style={{ width: `${ancho}%`, background: COLORES_TRAMOS[i] }}
                title={`Tramo ${tramo.tipo}%: ${formatCurrency(tramo.baseAplicada)} × ${tramo.tipo}% = ${formatCurrency(tramo.cuota)}`}
              >
                <span className={styles.tramoLabel}>{tramo.tipo}%</span>
              </div>
            );
          })}
        </div>

        <div className={styles.tramosLeyenda}>
          {resultadoFinal.desglose.map((tramo, i) => (
            <div key={i} className={styles.tramosLeyendaItem}>
              <span
                className={styles.tramosLeyendaSwatch}
                style={{ background: COLORES_TRAMOS[i] }}
                aria-hidden="true"
              />
              <div className={styles.tramosLeyendaTexto}>
                <strong>
                  Tramo {tramo.tipo}% ({formatCurrency(tramo.desde)} – {tramo.hasta >= TOPE_VISUAL ? '+∞' : formatCurrency(tramo.hasta)})
                </strong>
                {tramo.baseAplicada > 0 ? (
                  <span>
                    {formatCurrency(tramo.baseAplicada)} × {tramo.tipo}% = <strong>{formatCurrency(tramo.cuota)}</strong>
                  </span>
                ) : (
                  <span className={styles.muted}>Sin importe en este tramo</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* De la escala a la cuota íntegra: el mínimo se grava a tipo cero (hallazgo 5157) */}
        <dl className={styles.cuotaDesdeEscala}>
          <div>
            <dt>Escala sobre la base</dt>
            <dd>{formatCurrency(resultadoFinal.cuotaEscala)}</dd>
          </div>
          <div>
            <dt>
              − Escala sobre tu mínimo personal y familiar ({formatCurrency(resultadoFinal.minimoAplicado)}), que tributa a tipo cero
            </dt>
            <dd>{formatCurrency(resultadoFinal.cuotaDelMinimo)}</dd>
          </div>
          <div className={styles.cuotaDesdeEscalaTotal}>
            <dt>= Cuota íntegra</dt>
            <dd>{formatCurrency(resultadoFinal.cuota)}</dd>
          </div>
        </dl>
      </div>
    );
  };

  // ─── SVG Vista Escalera (función escalonada de tipos) ──────────────────────
  const renderVistaEscalera = () => {
    const ancho = 700;
    const alto = 360;
    const padL = 60;
    const padR = 30;
    const padT = 30;
    const padB = 50;
    const xMax = TOPE_VISUAL;
    const yMax = 50;

    const xToSvg = (x: number) => padL + (x / xMax) * (ancho - padL - padR);
    const yToSvg = (y: number) => alto - padB - (y / yMax) * (alto - padT - padB);

    // Construir puntos de la escalera
    const puntosEscalera: { x: number; y: number }[] = [];
    let xActual = 0;
    puntosEscalera.push({ x: 0, y: 0 });
    for (const tramo of TRAMOS_IRPF_2025) {
      const xSig = tramo.hasta === Infinity ? xMax : tramo.hasta;
      // tramo: de xActual a xSig al tipo
      puntosEscalera.push({ x: xActual, y: tramo.tipo });
      puntosEscalera.push({ x: xSig, y: tramo.tipo });
      xActual = xSig;
    }

    const pathEscalera = puntosEscalera
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xToSvg(p.x).toFixed(1)} ${yToSvg(p.y).toFixed(1)}`)
      .join(' ');

    const xBase = Math.min(base, xMax);
    const xBaseFinal = Math.min(baseFinal, xMax);

    // Marcas eje X
    const marcasX = [0, 50000, 100000, 150000, 200000, 250000, 300000];
    // Marcas eje Y (los 6 tipos)
    const marcasY = [0, 19, 24, 30, 37, 45, 47];

    return (
      <div className={styles.escaleraContainer}>
        <svg
          viewBox={`0 0 ${ancho} ${alto}`}
          className={styles.escaleraSvg}
          role="img"
          aria-label="Escalera de tipos marginales del IRPF según base liquidable"
        >
          {/* Líneas de cuadrícula horizontales */}
          {marcasY.map(y => (
            <line
              key={`gy-${y}`}
              x1={padL}
              y1={yToSvg(y)}
              x2={ancho - padR}
              y2={yToSvg(y)}
              stroke="#e5e7eb"
              strokeDasharray="2 4"
            />
          ))}

          {/* Eje X */}
          <line x1={padL} y1={alto - padB} x2={ancho - padR} y2={alto - padB} stroke="#9ca3af" strokeWidth="1.5" />
          {/* Eje Y */}
          <line x1={padL} y1={padT} x2={padL} y2={alto - padB} stroke="#9ca3af" strokeWidth="1.5" />

          {/* Marcas eje X */}
          {marcasX.map(x => (
            <g key={`mx-${x}`}>
              <line x1={xToSvg(x)} y1={alto - padB} x2={xToSvg(x)} y2={alto - padB + 4} stroke="#9ca3af" />
              <text x={xToSvg(x)} y={alto - padB + 18} textAnchor="middle" fontSize="10" fill="#6b7280">
                {x === 0 ? '0' : `${x / 1000}k`}
              </text>
            </g>
          ))}
          <text x={(ancho - padR + padL) / 2} y={alto - 8} textAnchor="middle" fontSize="11" fill="#6b7280">
            Base liquidable (€)
          </text>

          {/* Marcas eje Y */}
          {marcasY.map(y => (
            <g key={`my-${y}`}>
              <line x1={padL - 4} y1={yToSvg(y)} x2={padL} y2={yToSvg(y)} stroke="#9ca3af" />
              <text x={padL - 8} y={yToSvg(y) + 3} textAnchor="end" fontSize="10" fill="#6b7280">
                {y}%
              </text>
            </g>
          ))}
          <text
            x={15}
            y={(alto - padB + padT) / 2}
            textAnchor="middle"
            fontSize="11"
            fill="#6b7280"
            transform={`rotate(-90 15 ${(alto - padB + padT) / 2})`}
          >
            Tipo marginal
          </text>

          {/* Path de la escalera */}
          <path d={pathEscalera} fill="none" stroke="#2E86AB" strokeWidth="2.5" />

          {/* Punto base actual (rojo) */}
          <line
            x1={xToSvg(xBase)}
            y1={padT}
            x2={xToSvg(xBase)}
            y2={alto - padB}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle cx={xToSvg(xBase)} cy={yToSvg(resultadoBase.tipoMarginal)} r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
          <text
            x={xToSvg(xBase)}
            y={yToSvg(resultadoBase.tipoMarginal) - 12}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#ef4444"
          >
            Base
          </text>

          {/* Punto base + incremento (verde) si difiere */}
          {incremento !== 0 && (
            <>
              <line
                x1={xToSvg(xBaseFinal)}
                y1={padT}
                x2={xToSvg(xBaseFinal)}
                y2={alto - padB}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle cx={xToSvg(xBaseFinal)} cy={yToSvg(resultadoFinal.tipoMarginal)} r="6" fill="#10b981" stroke="white" strokeWidth="2" />
              <text
                x={xToSvg(xBaseFinal)}
                y={yToSvg(resultadoFinal.tipoMarginal) - 12}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#10b981"
              >
                + {formatNumber(incremento, 0)} €
              </text>
            </>
          )}
        </svg>

        <div className={styles.escaleraResumen}>
          <div className={styles.escaleraStat}>
            <span className={styles.escaleraStatLabel}>Tipo marginal</span>
            <strong>{formatNumber(resultadoFinal.tipoMarginal, 0)}%</strong>
            <span className={styles.muted}>Aplicado al último €</span>
          </div>
          <div className={styles.escaleraStat}>
            <span className={styles.escaleraStatLabel}>Tipo medio efectivo</span>
            <strong>{formatNumber(resultadoFinal.tipoMedio, 2)}%</strong>
            <span className={styles.muted}>Cuota total / base</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── Vista Comparativa ─────────────────────────────────────────────────────
  const renderVistaComparativa = () => {
    return (
      <div className={styles.comparativaLayout}>
        <div className={styles.comparativaCol}>
          <h3 className={styles.comparativaTitulo}>Base actual</h3>
          <p className={styles.comparativaBase}>{formatCurrency(base)}</p>
          <ul className={styles.comparativaLista}>
            <li>
              Cuota íntegra: <strong>{formatCurrency(resultadoBase.cuota)}</strong>
            </li>
            <li>
              Tipo medio efectivo: <strong>{formatNumber(resultadoBase.tipoMedio, 2)}%</strong>
            </li>
            <li>
              Tipo marginal: <strong>{formatNumber(resultadoBase.tipoMarginal, 0)}%</strong>
            </li>
            <li>
              Renta neta: <strong>{formatCurrency(base - resultadoBase.cuota)}</strong>
            </li>
          </ul>
        </div>

        <div className={styles.comparativaCol}>
          <h3 className={styles.comparativaTitulo}>Con incremento <span>{incremento >= 0 ? '+' : ''}</span>{formatCurrency(incremento)}</h3>
          <p className={styles.comparativaBase}>{formatCurrency(baseFinal)}</p>
          <ul className={styles.comparativaLista}>
            <li>
              Cuota íntegra: <strong>{formatCurrency(resultadoFinal.cuota)}</strong>
            </li>
            <li>
              Tipo medio efectivo: <strong>{formatNumber(resultadoFinal.tipoMedio, 2)}%</strong>
            </li>
            <li>
              Tipo marginal: <strong>{formatNumber(resultadoFinal.tipoMarginal, 0)}%</strong>
            </li>
            <li>
              Renta neta: <strong>{formatCurrency(baseFinal - resultadoFinal.cuota)}</strong>
            </li>
          </ul>
        </div>

        <div className={styles.diferenciaBadge} role="status" aria-live="polite">
          {incremento === 0 ? (
            <span key="rama-1">Mueve el slider de incremento para ver la diferencia.</span>
          ) : (
            <span key="rama-2">
              <span className={styles.diferenciaTitulo}>
                {incremento >= 0 ? 'Si subes' : 'Si bajas'} {formatCurrency(Math.abs(incremento))} de base liquidable:
              </span>
              <span className={styles.diferenciaValor}>
                {diferenciaCuota >= 0 ? '+' : '-'}
                {formatCurrency(Math.abs(diferenciaCuota))} de cuota IRPF
              </span>
              <span className={styles.diferenciaDetalle}>
                ({formatNumber((diferenciaCuota / (incremento || 1)) * 100, 1)}% del incremento se va en impuestos)
              </span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>{`Simulador Visual de Tramos IRPF ${ANIO}`}</h1>
        <p className={styles.subtitle}>
          Visualiza cómo afectan los tramos a tu cuota — interactivo y didáctico
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={`IRPF ${ANIO}`}
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
      />

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de vista */}
        <div className={styles.vistaSelector} role="tablist" aria-label="Modo de visualización">
          <button
            type="button"
            role="tab"
            aria-selected={vista === 'tramos'}
            className={`${styles.vistaBtn} ${vista === 'tramos' ? styles.vistaActive : ''}`}
            onClick={() => setVista('tramos')}
          >
            Vista por tramos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={vista === 'escalera'}
            className={`${styles.vistaBtn} ${vista === 'escalera' ? styles.vistaActive : ''}`}
            onClick={() => setVista('escalera')}
          >
            Escalera de tipos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={vista === 'comparativa'}
            className={`${styles.vistaBtn} ${vista === 'comparativa' ? styles.vistaActive : ''}`}
            onClick={() => setVista('comparativa')}
          >
            Comparativa
          </button>
        </div>

        {/* Controles */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Tu base liquidable</h2>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="baseSlider">
              Base liquidable: <span className={styles.sliderValue}>{formatCurrency(base)}</span>
            </label>
            <input
              id="baseSlider"
              type="range"
              min={0}
              max={400000}
              step={500}
              value={base}
              onChange={e => setBase(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0 €</span>
              <span>400.000 €</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="incSlider">
              Incremento simulado: <span className={styles.sliderValue}>
                <span>{incremento >= 0 ? '+' : ''}</span>{formatCurrency(incremento)}
              </span>
            </label>
            <input
              id="incSlider"
              type="range"
              min={-10000}
              max={10000}
              step={100}
              value={incremento}
              onChange={e => setIncremento(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>-10.000 €</span>
              <span>+10.000 €</span>
            </div>
            <p className={styles.sliderHint}>
              ¿Qué pasa si subes o bajas tu base liquidable? Mueve el slider y observa el efecto.
            </p>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="minimoSlider">
              Mínimo personal y familiar: <span className={styles.sliderValue}>{formatCurrency(minimo)}</span>
            </label>
            <input
              id="minimoSlider"
              type="range"
              min={0}
              max={MINIMO_MAXIMO}
              step={50}
              value={minimo}
              onChange={e => setMinimo(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0 €</span>
              <span>{formatCurrency(MINIMO_MAXIMO)}</span>
            </div>
            <p className={styles.sliderHint}>
              {`El personal es de ${formatCurrency(MINIMOS_IRPF_2025.personal)} (${formatCurrency(MINIMOS_IRPF_2025.personal_65)} desde los 65 años y ${formatCurrency(MINIMOS_IRPF_2025.personal_75)} desde los 75). Súmale los de hijos, ascendientes o discapacidad (paso 2 de la guía). No se resta de la base: se grava a tipo cero.`}
            </p>
          </div>

          <div className={styles.ejemplosGrid}>
            {EJEMPLOS.map(ej => (
              <button
                type="button"
                key={ej.valor}
                className={styles.ejemploBtn}
                onClick={() => aplicarEjemplo(ej.valor)}
                aria-label={`Aplicar base de ${ej.etiqueta}: ${ej.descripcion}`}
              >
                <strong>{ej.etiqueta}</strong>
                <span>{ej.descripcion}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visualización */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <span>{vista === 'tramos' && 'Cómo se reparte tu base entre los 6 tramos'}</span>
            <span>{vista === 'escalera' && 'Escalera de tipos marginales'}</span>
            <span>{vista === 'comparativa' && '¿Qué pasa si tu base cambia?'}</span>
          </h2>
          {vista === 'tramos' && renderVistaTramos()}
          {vista === 'escalera' && renderVistaEscalera()}
          {vista === 'comparativa' && renderVistaComparativa()}
        </div>

        {/* Resumen */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Resumen de la cuota IRPF</h2>
          <div className={styles.resumenGrid}>
            <div className={styles.resumenCard}>
              <span className={styles.resumenLabel}>Cuota íntegra</span>
              <strong className={styles.resumenValor}>{formatCurrency(resultadoFinal.cuota)}</strong>
              <span className={styles.muted}>Con el mínimo a tipo cero; sin deducciones</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenLabel}>Tipo medio efectivo</span>
              <strong className={styles.resumenValor}>{formatNumber(resultadoFinal.tipoMedio, 2)}%</strong>
              <span className={styles.muted}>Cuota / base</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenLabel}>Tipo marginal</span>
              <strong className={styles.resumenValor}>{formatNumber(resultadoFinal.tipoMarginal, 0)}%</strong>
              <span className={styles.muted}>Aplicado al último €</span>
            </div>
            <div className={styles.resumenCard}>
              <span className={styles.resumenLabel}>Renta neta tras IRPF</span>
              <strong className={styles.resumenValor}>{formatCurrency(baseFinal - resultadoFinal.cuota)}</strong>
              <span className={styles.muted}>Solo cuota IRPF</span>
            </div>
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía de los Tramos del IRPF"
        subtitle="Cómo funciona el impuesto sobre la renta en España"
      >
        <h3>{`Tabla de Tramos IRPF ${ANIO}`}</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tramo</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Tipo</th>
                <th>Cuota máxima del tramo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1º</td>
                <td>0 €</td>
                <td>12.450 €</td>
                <td>19%</td>
                <td>2.365,50 €</td>
              </tr>
              <tr>
                <td>2º</td>
                <td>12.450 €</td>
                <td>20.200 €</td>
                <td>24%</td>
                <td>1.860,00 €</td>
              </tr>
              <tr>
                <td>3º</td>
                <td>20.200 €</td>
                <td>35.200 €</td>
                <td>30%</td>
                <td>4.500,00 €</td>
              </tr>
              <tr>
                <td>4º</td>
                <td>35.200 €</td>
                <td>60.000 €</td>
                <td>37%</td>
                <td>9.176,00 €</td>
              </tr>
              <tr>
                <td>5º</td>
                <td>60.000 €</td>
                <td>300.000 €</td>
                <td>45%</td>
                <td>108.000,00 €</td>
              </tr>
              <tr>
                <td>6º</td>
                <td>300.000 €</td>
                <td>+∞</td>
                <td>47%</td>
                <td>Sin tope</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          Tramos estatales + autonómicos medios. Cada CCAA puede aplicar variaciones (Madrid, Andalucía y otras tienen tramos propios). Verificar siempre con la AEAT y la normativa autonómica.
        </p>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>Asalariado tipo (30.000 € base liquidable)</h4>
            <p>
              {`Reparto: 12.450 al 19 % + 7.750 al 24 % + 9.800 al 30 % =${fmtEur(ASALARIADO_ESCALA)} de escala. Restando la cuota de su mínimo personal (${fmtEur(MINIMOS_IRPF_2025.personal)} a tipo cero), la cuota íntegra queda en ${fmtEur(ASALARIADO_CUOTA)}: tipo medio ${fmtPct((ASALARIADO_CUOTA / ASALARIADO_BASE) * 100)}, marginal 30 %. Si su empresa le sube 1.000 €, 300 € se van al IRPF.`}
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Autónomo en RETA (45.000 € base liquidable)</h4>
            <p>
              {`Tres tramos llenos + parte del 4º: la escala da ${fmtEur(AUTONOMO_ESCALA)} y, restando la cuota de su mínimo personal, la cuota íntegra es de ${fmtEur(AUTONOMO_CUOTA)} (tipo medio ${fmtPct((AUTONOMO_CUOTA / AUTONOMO_BASE) * 100)}, marginal 37 %). Importante: el autónomo factura IVA aparte; el IRPF aplica solo sobre el rendimiento neto tras gastos deducibles.`}
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Jubilado con pensión (24.000 €)</h4>
            <p>
              {`Pensión = rendimiento del trabajo a efectos de IRPF. La escala da ${fmtEur(JUBILADO_ESCALA)} (${fmtPct((JUBILADO_ESCALA / JUBILADO_BASE) * 100)}); restando la cuota de su mínimo personal de mayor de 65 años (${fmtEur(MINIMOS_IRPF_2025.personal_65)}, que se grava a tipo cero), la cuota íntegra queda en ${fmtEur(JUBILADO_CUOTA)}, un ${fmtPct((JUBILADO_CUOTA / JUBILADO_BASE) * 100)}. Las pensiones llevan retención mensual; el resultado de la declaración suele ser pequeño.`}
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Familia con un solo ingreso (45.000 €, 2 hijos)</h4>
            <p>
              {`La base liquidable es la misma que la del soltero, pero la cuota es menor: el mínimo personal (${fmtEur(MINIMOS_IRPF_2025.personal)}) y los mínimos por hijos (${fmtEur(MINIMOS_IRPF_2025.hijo_1)} + ${fmtEur(MINIMOS_IRPF_2025.hijo_2)} = ${fmtEur(MINIMO_HIJOS_2)}) no se restan de la base, se gravan a tipo cero (art. 63.1.2.º LIRPF), así que se valoran a los tipos bajos de la escala y no al marginal. El soltero también tiene su mínimo personal: frente a él, la familia paga ${fmtEur(AHORRO_FAMILIA)} menos de cuota, lo que valen los ${fmtEur(MINIMO_HIJOS_2)} de los hijos en el primer tramo.`}
            </p>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>{FAQ_TIPO_MEDIO.pregunta}</strong>
            <p>{FAQ_TIPO_MEDIO.respuesta}</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿El IRPF es estatal o autonómico?</strong>
            <p>
              Ambos. La cuota se reparte 50% Estado / 50% CCAA. El Estado fija una escala estatal y cada Comunidad Autónoma fija su escala autonómica (puede tener tramos y tipos distintos). Madrid, Andalucía, Galicia y otras tienen escalas propias. Esta herramienta usa una escala media orientativa.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>{FAQ_BASE_LIQUIDABLE.pregunta}</strong>
            <p>{FAQ_BASE_LIQUIDABLE.respuesta}</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué los tramos son progresivos?</strong>
            <p>
              La progresividad es un principio constitucional (art. 31 CE): quien más gana, contribuye proporcionalmente más. Pero solo el exceso de cada tramo tributa al tipo más alto, no toda la base.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>{FAQ_SUBIR_TRAMO.pregunta}</strong>
            <p>{FAQ_SUBIR_TRAMO.respuesta}</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo se calcula la retención mensual en nómina?</strong>
            <p>
              La retención no es exactamente el tipo medio del IRPF anual: la AEAT publica un algoritmo que estima la cuota anual y la divide entre los meses de pago, ajustándola por circunstancias personales (familia, hijos, hipoteca anterior a 2013, etc.). Si la retención es mayor que la cuota final, te devuelven; si es menor, pagas en la declaración.
            </p>
          </div>
        </div>

        <h3>Cómo Calcular tu IRPF a Mano — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Calcula tu base imponible</strong>
              <p>
                Ingresos brutos (sueldo, pensión, alquileres, intereses…) menos cotizaciones SS, gastos deducibles del trabajo (2.000 €/año por defecto) y reducciones aplicables.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Obtén la base liquidable y suma tu mínimo personal y familiar</strong>
              <p>
                La base liquidable es la base imponible menos las reducciones (planes de pensiones, tributación conjunta…). El mínimo personal y familiar <strong>no se resta</strong> de ella (art. 63.1.2.º LIRPF): súmalo aparte para el paso 3. Personal: 5.550 €. Por cada hijo: 2.400 / 2.700 / 4.000 / 4.500 €. Adicional por hijo &lt; 3 años: 2.800 €. Mínimos por discapacidad o ascendientes a cargo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Aplica los tramos uno a uno</strong>
              <p>
                Ve rellenando los tramos de menor a mayor con la base liquidable entera: primer tramo (hasta 12.450 € al 19%), segundo (12.450–20.200 al 24%), etc. Suma las cuotas parciales. Aplica después la misma escala al importe del mínimo personal y familiar y resta esa cuota: así el mínimo tributa a tipo cero y no a tu tipo marginal.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Resta deducciones de cuota</strong>
              <p>
                Deducción por inversión en vivienda habitual (régimen transitorio anteriores a 2013), por maternidad, por familia numerosa, autonómicas… Cada deducción reduce directamente la cuota, no la base.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Compara con las retenciones practicadas</strong>
              <p>
                Si la cuota final &gt; retenciones → te toca pagar (resultado positivo). Si la cuota final &lt; retenciones → Hacienda te devuelve. Esa diferencia es la <em>cuota diferencial</em>.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💡</span>
            <div>
              <strong>Razona en marginal</strong>
              <p>Para decidir si te compensa una hora extra o un curso pagado por la empresa, usa el tipo marginal, no el medio.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <div>
              <strong>Planifica antes de fin de año</strong>
              {/* Los donativos de la Ley 49/2002 se deducen de la cuota íntegra (art. 19.1, BOE-A-2002-25039),
                  no de la base: hallazgo 5261 */}
              <p>Las aportaciones a planes de pensiones (hasta 1.500 €/año) reducen tu base liquidable. Los donativos a entidades de la Ley 49/2002 van aparte: no reducen la base, sino que dan una deducción en la cuota íntegra.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏠</span>
            <div>
              <strong>Revisa tu CCAA</strong>
              <p>Cada Comunidad Autónoma tiene escalas y deducciones distintas. Esta app usa una escala media orientativa.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📑</span>
            <div>
              <strong>Guarda los justificantes</strong>
              <p>Donaciones, gastos médicos, alquiler, hipoteca anterior a 2013… Si no tienes justificante, no puedes deducir.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧾</span>
            <div>
              <strong>Solicita el ajuste de retención</strong>
              <p>Si sabes que tu situación familiar cambió (boda, hijo, hipoteca), pide a tu empresa que recalcule la retención mensual.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">👤</span>
            <div>
              <strong>Asesoramiento profesional para casos complejos</strong>
              <p>Autónomos, alquileres, ganancias patrimoniales, herencias o cambios de residencia: consulta siempre con un asesor fiscal colegiado.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes a evitar
          </div>
          <ul className={styles.warningList}>
            <li>Confundir el tipo marginal con el tipo aplicado a toda la base (es solo al último euro).</li>
            <li>Restar el mínimo personal y familiar de la base antes de aplicar los tramos: se grava a tipo cero (art. 63.1.2.º LIRPF), y restarlo lo valora a tu tipo marginal y subestima la cuota.</li>
            <li>Ignorar las variaciones autonómicas: Madrid, Andalucía o Galicia tributan distinto.</li>
            <li>No actualizar los tramos tras la Ley de Presupuestos Generales del Estado de cada año.</li>
            <li>Asumir que la retención mensual de la nómina equivale a la cuota IRPF final.</li>
            <li>Confundir base imponible con base liquidable (la liquidable es la imponible menos las reducciones; el mínimo personal y familiar no se resta de ninguna de las dos).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="simulador-irpf-tramos" />
      <Footer appName="simulador-irpf-tramos" />
    </div>
  );
}
