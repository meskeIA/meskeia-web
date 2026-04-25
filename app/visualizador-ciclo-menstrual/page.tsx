'use client';
// @disclaimer: exempt
import { useState } from 'react';
import styles from './CicloMenstrual.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ── Tipos ──────────────────────────────────────────────────────────────────

type FaseId = 'menstrual' | 'folicular' | 'ovulacion' | 'lutea';
type SeccionExtra = 'sop' | 'anticonceptivos' | null;

interface Fase {
  id: FaseId;
  nombre: string;
  dias: string;
  rangoInicio: number;
  rangoFin: number;
  color: string;
  hormonasProtagonistas: string;
  descripcion: string;
}

interface Hormona {
  nombre: string;
  color: string;
  datos: number[];
}

// ── Datos ──────────────────────────────────────────────────────────────────

const HORMONAS: Hormona[] = [
  {
    nombre: 'FSH',
    color: '#E74C3C',
    datos: [30, 25, 20, 18, 22, 28, 35, 40, 35, 30, 38, 30, 25, 15, 10, 8, 8, 10, 12, 12, 10, 10, 8, 8, 10, 12, 15, 20],
  },
  {
    nombre: 'LH',
    color: '#E67E22',
    datos: [10, 8, 8, 10, 12, 15, 18, 22, 30, 50, 100, 80, 20, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8],
  },
  {
    nombre: 'Estrógeno',
    color: '#9B59B6',
    datos: [15, 15, 20, 25, 30, 40, 52, 65, 78, 88, 95, 100, 75, 45, 30, 40, 55, 65, 70, 72, 68, 60, 50, 45, 35, 30, 25, 20],
  },
  {
    nombre: 'Progesterona',
    color: '#27AE60',
    datos: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10, 30, 55, 72, 85, 90, 88, 80, 65, 50, 35, 25, 15, 8],
  },
];

const FASES: Fase[] = [
  {
    id: 'menstrual',
    nombre: 'Fase Menstrual',
    dias: 'Días 1–5',
    rangoInicio: 1,
    rangoFin: 5,
    color: '#E74C3C',
    hormonasProtagonistas: 'FSH (comienza a subir), Estrógeno y Progesterona (caen)',
    descripcion:
      'Se produce el sangrado menstrual. El endometrio que se había engrosado se desprende porque no hubo embarazo. Los niveles de estrógeno y progesterona alcanzan su punto más bajo, lo que desencadena la menstruación. La FSH empieza a subir suavemente para estimular el desarrollo de nuevos folículos.',
  },
  {
    id: 'folicular',
    nombre: 'Fase Folicular',
    dias: 'Días 6–13',
    rangoInicio: 6,
    rangoFin: 13,
    color: '#3498DB',
    hormonasProtagonistas: 'FSH (estimula folículos), Estrógeno (sube progresivamente)',
    descripcion:
      'La FSH estimula entre 5 y 20 folículos en los ovarios, aunque normalmente solo uno alcanzará la madurez completa (folículo dominante). A medida que los folículos crecen, producen cantidades crecientes de estrógeno, que reconstruye el endometrio. La energía y el estado de ánimo suelen mejorar en esta fase gracias al estrógeno.',
  },
  {
    id: 'ovulacion',
    nombre: 'Ovulación',
    dias: 'Día 14 (aprox.)',
    rangoInicio: 13,
    rangoFin: 15,
    color: '#F39C12',
    hormonasProtagonistas: 'LH (pico brusco), Estrógeno (pico previo)',
    descripcion:
      'El pico brusco de LH desencadena la liberación del óvulo maduro desde el folículo dominante. El óvulo viaja por la trompa de Falopio hacia el útero. Este es el momento de mayor fertilidad: el óvulo tiene una vida de 12-24 horas, aunque los espermatozoides pueden vivir hasta 5 días. La temperatura basal sube ligeramente tras la ovulación.',
  },
  {
    id: 'lutea',
    nombre: 'Fase Lútea',
    dias: 'Días 15–28',
    rangoInicio: 15,
    rangoFin: 28,
    color: '#27AE60',
    hormonasProtagonistas: 'Progesterona (protagonista), Estrógeno (segundo plateau)',
    descripcion:
      'El folículo vacío se transforma en el cuerpo lúteo, que produce grandes cantidades de progesterona. Esta hormona prepara el endometrio para una posible implantación y mantiene el embarazo si ocurre la fecundación. Sin embarazo, el cuerpo lúteo se degrada hacia el día 25-26, la progesterona y el estrógeno caen bruscamente, y comienza el próximo ciclo.',
  },
];

// ── Helpers SVG ──────────────────────────────────────────────────────────────

const SVG_W = 700;
const SVG_H = 280;
const PAD_LEFT = 40;
const PAD_RIGHT = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 35;
const GRAPH_W = SVG_W - PAD_LEFT - PAD_RIGHT;
const GRAPH_H = SVG_H - PAD_TOP - PAD_BOTTOM;

function diaAX(dia: number): number {
  // dia va de 1 a 28
  return PAD_LEFT + ((dia - 1) / 27) * GRAPH_W;
}

function valorAY(valor: number): number {
  // valor normalizado 0-100
  return PAD_TOP + GRAPH_H - (valor / 100) * GRAPH_H;
}

function puntosHormona(datos: number[]): string {
  return datos
    .map((v, i) => `${diaAX(i + 1)},${valorAY(v)}`)
    .join(' ');
}

function xFase(rangoInicio: number): number {
  return diaAX(rangoInicio);
}

function anchoFase(rangoInicio: number, rangoFin: number): number {
  return diaAX(rangoFin) - diaAX(rangoInicio);
}

// ── Componente principal ───────────────────────────────────────────────────

export default function VisualizadorCicloMenstrual() {
  const [faseActiva, setFaseActiva] = useState<FaseId | null>(null);
  const [seccionExtra, setSeccionExtra] = useState<SeccionExtra>(null);

  const faseInfo = faseActiva ? FASES.find((f) => f.id === faseActiva) : null;

  function toggleFase(id: FaseId) {
    setFaseActiva((prev) => (prev === id ? null : id));
  }

  function toggleSeccion(s: 'sop' | 'anticonceptivos') {
    setSeccionExtra((prev) => (prev === s ? null : s));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Ciclo Menstrual: Fases y Hormonas</h1>
        <p>Las 4 hormonas protagonistas a lo largo de los 28 días del ciclo</p>
      </header>

      <LegalNotice />

      {/* Gráfico SVG */}
      <section className={styles.seccionGrafico}>
        <h2 className={styles.tituloSeccion}>Niveles hormonales a lo largo del ciclo</h2>

        <div className={styles.svgWrapper}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className={styles.svgGrafico}
            role="img"
            aria-label="Gráfico de niveles hormonales durante el ciclo menstrual"
          >
            {/* Fondo de fase activa */}
            {faseInfo && (
              <rect
                x={xFase(faseInfo.rangoInicio)}
                y={PAD_TOP}
                width={anchoFase(faseInfo.rangoInicio, faseInfo.rangoFin)}
                height={GRAPH_H}
                fill={faseInfo.color}
                opacity={0.12}
              />
            )}

            {/* Líneas de referencia horizontales */}
            {[0, 25, 50, 75, 100].map((nivel) => (
              <line
                key={nivel}
                x1={PAD_LEFT}
                y1={valorAY(nivel)}
                x2={SVG_W - PAD_RIGHT}
                y2={valorAY(nivel)}
                stroke="#ccc"
                strokeWidth={1}
                strokeDasharray={nivel === 0 ? '0' : '4 3'}
              />
            ))}

            {/* Eje X */}
            <line
              x1={PAD_LEFT}
              y1={PAD_TOP + GRAPH_H}
              x2={SVG_W - PAD_RIGHT}
              y2={PAD_TOP + GRAPH_H}
              stroke="#999"
              strokeWidth={1.5}
            />

            {/* Eje Y */}
            <line
              x1={PAD_LEFT}
              y1={PAD_TOP}
              x2={PAD_LEFT}
              y2={PAD_TOP + GRAPH_H}
              stroke="#999"
              strokeWidth={1.5}
            />

            {/* Etiquetas eje X */}
            {[1, 7, 14, 21, 28].map((dia) => (
              <g key={dia}>
                <line
                  x1={diaAX(dia)}
                  y1={PAD_TOP + GRAPH_H}
                  x2={diaAX(dia)}
                  y2={PAD_TOP + GRAPH_H + 5}
                  stroke="#999"
                  strokeWidth={1}
                />
                <text
                  x={diaAX(dia)}
                  y={PAD_TOP + GRAPH_H + 18}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#666"
                >
                  {dia === 1 ? 'Día 1' : dia === 14 ? 'Día 14' : `Día ${dia}`}
                </text>
              </g>
            ))}

            {/* Etiqueta eje Y */}
            <text
              x={PAD_LEFT - 6}
              y={valorAY(100)}
              textAnchor="end"
              fontSize={9}
              fill="#999"
              dominantBaseline="middle"
            >
              Alto
            </text>
            <text
              x={PAD_LEFT - 6}
              y={valorAY(0)}
              textAnchor="end"
              fontSize={9}
              fill="#999"
              dominantBaseline="middle"
            >
              Bajo
            </text>

            {/* Líneas de hormonas */}
            {HORMONAS.map((hormona) => (
              <polyline
                key={hormona.nombre}
                points={puntosHormona(hormona.datos)}
                fill="none"
                stroke={hormona.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* Marcador día 14 (ovulación) */}
            <line
              x1={diaAX(14)}
              y1={PAD_TOP}
              x2={diaAX(14)}
              y2={PAD_TOP + GRAPH_H}
              stroke="#F39C12"
              strokeWidth={1}
              strokeDasharray="5 3"
              opacity={0.7}
            />
            <text
              x={diaAX(14) + 3}
              y={PAD_TOP + 12}
              fontSize={9}
              fill="#F39C12"
            >
              Ovulación
            </text>
          </svg>
        </div>

        {/* Leyenda */}
        <div className={styles.leyenda} role="list" aria-label="Leyenda de hormonas">
          {HORMONAS.map((h) => (
            <div key={h.nombre} className={styles.leyendaItem} role="listitem">
              <span
                className={styles.leyendaColor}
                style={{ backgroundColor: h.color }}
                aria-hidden="true"
              />
              <span>{h.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Botones de fases */}
      <section className={styles.seccionFases}>
        <h2 className={styles.tituloSeccion}>Fases del ciclo</h2>
        <div className={styles.botonerFases} role="group" aria-label="Selecciona una fase para ver detalles">
          {FASES.map((fase) => (
            <button
              key={fase.id}
              className={`${styles.botonFase} ${faseActiva === fase.id ? styles.botonFaseActivo : ''}`}
              style={
                faseActiva === fase.id
                  ? { borderColor: fase.color, backgroundColor: fase.color + '18' }
                  : {}
              }
              onClick={() => toggleFase(fase.id)}
              aria-pressed={faseActiva === fase.id}
            >
              <span
                className={styles.puntoCiclo}
                style={{ backgroundColor: fase.color }}
                aria-hidden="true"
              />
              <span className={styles.nombreFase}>{fase.nombre}</span>
              <span className={styles.diasFase}>{fase.dias}</span>
            </button>
          ))}
        </div>

        {/* Detalle de fase */}
        {faseInfo && (
          <div
            className={styles.detalleFase}
            style={{ borderLeftColor: faseInfo.color }}
            role="region"
            aria-label={`Detalle de ${faseInfo.nombre}`}
          >
            <h3 style={{ color: faseInfo.color }}>{faseInfo.nombre}</h3>
            <p className={styles.diasDetalle}>{faseInfo.dias}</p>
            <p className={styles.hormonasDetalle}>
              <strong>Hormonas protagonistas:</strong> {faseInfo.hormonasProtagonistas}
            </p>
            <p className={styles.descripcionDetalle}>{faseInfo.descripcion}</p>
          </div>
        )}
      </section>

      {/* SOP y anticonceptivos */}
      <section className={styles.seccionExtra}>
        <h2 className={styles.tituloSeccion}>Variaciones y contextos clínicos</h2>
        <div className={styles.botonesExtra}>
          <button
            className={`${styles.botonExtra} ${seccionExtra === 'sop' ? styles.botonExtraActivo : ''}`}
            onClick={() => toggleSeccion('sop')}
            aria-pressed={seccionExtra === 'sop'}
          >
            SOP — Síndrome de Ovario Poliquístico
          </button>
          <button
            className={`${styles.botonExtra} ${seccionExtra === 'anticonceptivos' ? styles.botonExtraActivo : ''}`}
            onClick={() => toggleSeccion('anticonceptivos')}
            aria-pressed={seccionExtra === 'anticonceptivos'}
          >
            Anticonceptivos hormonales
          </button>
        </div>

        {seccionExtra === 'sop' && (
          <div className={styles.panelExtra} role="region" aria-label="Información sobre SOP">
            <h3>Síndrome de Ovario Poliquístico (SOP)</h3>
            <p>
              El SOP es la alteración endocrina más frecuente en personas con ovarios en edad reproductiva (8–13 % de prevalencia). Su característica hormonal principal es un <strong>ratio LH/FSH elevado</strong> (a menudo 2:1 o superior en lugar del 1:1 habitual). Esto altera la maduración folicular y la ovulación.
            </p>
            <p>
              Como consecuencia, los ciclos pueden ser <strong>irregulares, muy espaciados (oligomenorrea) o ausentes (amenorrea)</strong>. Los folículos no llegan a madurar completamente y permanecen como pequeños quistes en los ovarios, visibles en ecografía. También puede haber exceso de andrógenos (testosterona), causando acné, hirsutismo y dificultad para adelgazar.
            </p>
            <p>
              En términos de gráfico hormonal, el patrón del SOP no muestra el pico pronunciado de LH en el día 14 ni el plateau de progesterona en la fase lútea — el ciclo simplemente no se completa con regularidad.
            </p>
          </div>
        )}

        {seccionExtra === 'anticonceptivos' && (
          <div className={styles.panelExtra} role="region" aria-label="Información sobre anticonceptivos hormonales">
            <h3>Anticonceptivos hormonales — mecanismo de acción</h3>
            <p>
              Los anticonceptivos hormonales combinados (píldora, parche, anillo vaginal) actúan principalmente <strong>suprimiendo el pico de LH</strong>. Sin el pico de LH, el folículo dominante no se rompe y no hay ovulación.
            </p>
            <p>
              Lo logran mediante niveles constantes y artificiales de estrógeno y progestina sintética. Este nivel estable inhibe la señal del hipotálamo (GnRH) y de la hipófisis (FSH y LH), impidiendo la fluctuación hormonal natural. En términos prácticos, el gráfico hormonal durante el uso de la píldora sería casi <strong>plano</strong>, sin los picos característicos de la ovulación.
            </p>
            <p>
              Los métodos solo de progesterona (minipíldora, DIU hormonal, implante) funcionan principalmente espesando el moco cervical, aunque también pueden inhibir la ovulación en muchos ciclos. El DIU de cobre, al ser no hormonal, no altera el patrón hormonal — la ovulación ocurre con normalidad.
            </p>
          </div>
        )}
      </section>

      {/* Nota de diferenciación */}
      <div className={styles.notaDiferenciacion}>
        <p>
          Para hacer seguimiento de tu ciclo personal, visita el{' '}
          <a href="/seguimiento-ciclo-menstrual/">Seguimiento de Ciclo Menstrual</a>.
          Para aprender sobre el estrógeno en profundidad, consulta el{' '}
          <a href="/visualizador-estrogenos/">Visualizador de Estrógenos</a>.
        </p>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="Fisiología del ciclo menstrual"
        subtitle="El eje hipotálamo-hipófisis-ovario"
      >
        <div className={styles.contenidoEducativo}>
          <h3>El eje que lo controla todo</h3>
          <p>
            El ciclo menstrual está regulado por un eje de comunicación hormonal en tres niveles: el <strong>hipotálamo</strong> (en el cerebro) libera GnRH de forma pulsátil, lo que estimula a la <strong>hipófisis</strong> para secretar FSH y LH. Estas hormonas actúan sobre los <strong>ovarios</strong>, que a su vez producen estrógeno y progesterona. Estas hormonas ováricas retroalimentan al hipotálamo e hipófisis, creando el ciclo dinámico que observamos en el gráfico.
          </p>

          <h3>Duraciones normales: no solo 28 días</h3>
          <p>
            El ciclo menstrual &quot;de libro&quot; dura 28 días, pero la realidad es mucho más variable. La duración <strong>normal oscila entre 21 y 35 días</strong>. La fase folicular (antes de la ovulación) es la más variable entre personas; la fase lútea (tras la ovulación) suele ser más constante, de 12 a 16 días. Esto significa que la ovulación no ocurre siempre en el día 14.
          </p>

          <h3>Variabilidad a lo largo de la vida</h3>
          <p>
            Los ciclos pueden variar significativamente durante la adolescencia (cuando el eje hormonal se está estableciendo), durante la lactancia (donde la prolactina puede inhibir la ovulación), en respuesta al estrés, la pérdida de peso extrema, el ejercicio intenso o enfermedades. Acercándose a la perimenopausia, los ciclos pueden volverse irregulares de nuevo. Esta variabilidad es fisiológica y normal.
          </p>

          <div className={styles.warningBox} role="note">
            <strong>Nota importante:</strong> Este visualizador tiene finalidad exclusivamente educativa. Los ciclos menstruales varían enormemente entre personas y a lo largo de distintas etapas de la vida. Un ciclo diferente al modelo de 28 días no es necesariamente un problema. Ante irregularidades persistentes, dolor intenso u otros síntomas, consulta con un profesional sanitario.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-ciclo-menstrual')} />
      <ShareCard appName="visualizador-ciclo-menstrual" />
      <Footer appName="visualizador-ciclo-menstrual" />
    </div>
  );
}
