'use client';
// @disclaimer: exempt

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './DesempleoTipos.module.css';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TipoDesempleo = 'friccional' | 'estructural' | 'ciclico' | 'estacional';
type PoliticaTab = 'activas' | 'pasivas';

interface TipoInfo {
  id: TipoDesempleo;
  icono: string;
  nombre: string;
  tagline: string;
  porcentaje: string;
  duracion: string;
  descripcion: string;
  ejemplo: string;
  solucion: string;
  colorClass: string;
}

// ── Datos de tipos de desempleo ────────────────────────────────────────────────

const TIPOS: TipoInfo[] = [
  {
    id: 'friccional',
    icono: '🔄',
    nombre: 'Friccional',
    tagline: 'Tiempo de búsqueda entre empleos',
    porcentaje: '2–3%',
    duracion: 'Corta (semanas/meses)',
    descripcion:
      'Siempre existe, incluso en economías sanas. Es el tiempo que tarda un trabajador en encontrar un empleo que encaje con sus habilidades y expectativas, o que pasa entre dejar un trabajo y empezar otro.',
    ejemplo:
      'Un ingeniero de software que deja su empresa para buscar una con mejor salario. Tarda 2 meses en encontrar el siguiente puesto. Durante ese tiempo está "friccionalmenteˮ desempleado.',
    solucion:
      'Mejores plataformas de empleo (Infojobs, LinkedIn), transparencia de información salarial, servicios de orientación laboral del SEPE.',
    colorClass: 'friccional',
  },
  {
    id: 'estructural',
    icono: '🏭',
    nombre: 'Estructural',
    tagline: 'Desajuste entre habilidades y demanda del mercado',
    porcentaje: '5–10%',
    duracion: 'Larga (meses/años)',
    descripcion:
      'Causado por cambios tecnológicos o sectoriales que hacen obsoletas ciertas habilidades. Los trabajadores afectados necesitan reconversión porque lo que saben hacer ya no se demanda.',
    ejemplo:
      'Mineros en la reconversión industrial de los 80, conductores de taxi ante la irrupción de Uber, trabajadores de imprentas ante la digitalización, operadores de telefonía fija.',
    solucion:
      'Formación profesional para el empleo, FP Dual, programas de reciclaje laboral del SEPE, subsidios de reconversión sectorial.',
    colorClass: 'estructural',
  },
  {
    id: 'ciclico',
    icono: '📉',
    nombre: 'Cíclico',
    tagline: 'La recesión económica reduce la demanda de trabajo',
    porcentaje: '0–15%+',
    duracion: 'Sigue el ciclo económico',
    descripcion:
      'El más visible durante las crisis. Cuando la economía se contrae, las empresas venden menos y necesitan menos trabajadores. España pasó del 8% al 26% de paro entre 2007 y 2013.',
    ejemplo:
      'La crisis financiera de 2008–2013: construcción, hostelería e industria destruyeron empleo masivamente. No porque los trabajadores no tuviesen habilidades, sino porque no había demanda.',
    solucion:
      'Políticas keynesianas: estímulo fiscal, reducción de tipos de interés, ERTEs (mantienen el vínculo laboral evitando destrucción de empleo), inversión pública en infraestructuras.',
    colorClass: 'ciclico',
  },
  {
    id: 'estacional',
    icono: '❄️',
    nombre: 'Estacional',
    tagline: 'Variaciones predecibles por estación del año',
    porcentaje: '±2%',
    duracion: 'Predecible y recurrente',
    descripcion:
      'Variaciones regulares a lo largo del año ligadas a sectores estacionales. En España, el turismo y la agricultura generan grandes oscilaciones. No es un problema estructural sino un patrón previsible.',
    ejemplo:
      'Hostelería y restauración en verano (Baleares, Canarias, Costa del Sol) y cosecha agrícola (temporeros en Huelva, Almería). El paro baja en julio-agosto y sube en noviembre-enero regularmente.',
    solucion:
      'Contratos fijos-discontinuos (reforma laboral 2022), que reconocen la estacionalidad sin precarizar. La prestación por desempleo cubre los períodos sin actividad.',
    colorClass: 'estacional',
  },
];

// ── Datos para el gráfico histórico ───────────────────────────────────────────

interface DatoHistorico {
  anio: number;
  espania: number;
  ue: number;
}

const DATOS_HISTORICOS: DatoHistorico[] = [
  { anio: 2000, espania: 13, ue: 8 },
  { anio: 2005, espania: 9, ue: 8 },
  { anio: 2007, espania: 8, ue: 7 },
  { anio: 2008, espania: 11, ue: 7 },
  { anio: 2009, espania: 18, ue: 9 },
  { anio: 2012, espania: 25, ue: 10 },
  { anio: 2013, espania: 26, ue: 10 },
  { anio: 2015, espania: 22, ue: 9 },
  { anio: 2017, espania: 17, ue: 7 },
  { anio: 2019, espania: 14, ue: 6 },
  { anio: 2020, espania: 16, ue: 7 },
  { anio: 2021, espania: 15, ue: 7 },
  { anio: 2022, espania: 13, ue: 6 },
  { anio: 2023, espania: 12, ue: 6 },
  { anio: 2024, espania: 11, ue: 6 },
];

// ── Utilidades SVG ─────────────────────────────────────────────────────────────

const SVG_W = 640;
const SVG_H = 280;
const PAD_L = 48;
const PAD_R = 24;
const PAD_T = 24;
const PAD_B = 40;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

const anioMin = 2000;
const anioMax = 2024;
const pctMax = 30;

const xDePorcentaje = (anio: number): number =>
  PAD_L + ((anio - anioMin) / (anioMax - anioMin)) * PLOT_W;

const yDePorcentaje = (pct: number): number =>
  PAD_T + PLOT_H - (pct / pctMax) * PLOT_H;

const buildPolylinePoints = (datos: DatoHistorico[], campo: 'espania' | 'ue'): string =>
  datos.map(d => `${xDePorcentaje(d.anio)},${yDePorcentaje(d[campo])}`).join(' ');

// ── Componente principal ───────────────────────────────────────────────────────

export default function DesempleoTiposPage() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoDesempleo | null>(null);
  const [politicaTab, setPoliticaTab] = useState<PoliticaTab>('activas');

  const tipoActual = TIPOS.find(t => t.id === tipoSeleccionado) ?? null;

  const handleTipoClick = (id: TipoDesempleo) => {
    setTipoSeleccionado(prev => (prev === id ? null : id));
  };

  const puntosEspania = buildPolylinePoints(DATOS_HISTORICOS, 'espania');
  const puntosUE = buildPolylinePoints(DATOS_HISTORICOS, 'ue');

  // Punto máximo España 2013
  const maxEspania = DATOS_HISTORICOS.find(d => d.anio === 2013);
  const xMax = maxEspania ? xDePorcentaje(maxEspania.anio) : 0;
  const yMax = maxEspania ? yDePorcentaje(maxEspania.espania) : 0;

  // Años del eje X (selección reducida para no saturar)
  const aniosEjeX = [2000, 2005, 2010, 2015, 2020, 2024];

  // Curva de Beveridge: puntos de referencia
  // viewBox 0 0 400 300, ejeX = desempleo (0-30%), ejeY = vacantes (0-8%)
  const BEV_W = 400;
  const BEV_H = 300;
  const BEV_PAD_L = 52;
  const BEV_PAD_R = 20;
  const BEV_PAD_T = 20;
  const BEV_PAD_B = 44;
  const BEV_PLOT_W = BEV_W - BEV_PAD_L - BEV_PAD_R;
  const BEV_PLOT_H = BEV_H - BEV_PAD_T - BEV_PAD_B;

  const bevX = (unemp: number) => BEV_PAD_L + (unemp / 30) * BEV_PLOT_W;
  const bevY = (vac: number) => BEV_PAD_T + BEV_PLOT_H - (vac / 8) * BEV_PLOT_H;

  // Punto A: crisis 2012 — alto paro (25%), pocas vacantes (0.8%)
  const pA = { unemp: 25, vac: 0.8 };
  // Punto B: auge 2023 — menor paro (12%), más vacantes (3%)
  const pB = { unemp: 12, vac: 3.2 };

  // Path de la curva de Beveridge (cuadrática que pasa por A y B aprox.)
  // Hipérbola convexa: Q (controlPoint) cerca del origen con vacantes altas
  const cX = bevX(4);
  const cY = bevY(7.5);
  const startX = bevX(2);
  const startY = bevY(7);
  const endX = bevX(28);
  const endY = bevY(0.3);
  const beveridgePath = `M ${startX} ${startY} Q ${cX} ${cY} ${endX} ${endY}`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Economía · Mercado Laboral</span>
          <h1 className={styles.heroTitle}>Tipos de Desempleo</h1>
          <p className={styles.heroSubtitle}>
            Friccional, estructural, cíclico, estacional: por qué el paro no es todo igual
          </p>
          <p className={styles.heroDesc}>
            El NAIRU, la curva de Beveridge, la evolución histórica España vs UE y las políticas que
            realmente funcionan para reducir el desempleo.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* ── Sección 1: Los 4 tipos ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🗂️</span>
            <h2 className={styles.sectionTitle}>Los 4 tipos de desempleo</h2>
            <p className={styles.sectionSubtitle}>
              Haz clic en cada tipo para ver su descripción, ejemplos y soluciones.
            </p>
          </div>

          <div className={styles.tiposGrid}>
            {TIPOS.map(tipo => (
              <button
                key={tipo.id}
                type="button"
                className={`${styles.tipoCard} ${styles[`tipoCard_${tipo.colorClass}`]} ${tipoSeleccionado === tipo.id ? styles.tipoCardActivo : ''}`}
                onClick={() => handleTipoClick(tipo.id)}
                aria-expanded={tipoSeleccionado === tipo.id}
                aria-controls={`detalle-${tipo.id}`}
              >
                <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
                <strong className={styles.tipoNombre}>{tipo.nombre}</strong>
                <span className={styles.tipoTagline}>{tipo.tagline}</span>
                <span className={styles.tipoPct}>{tipo.porcentaje} del total</span>
              </button>
            ))}
          </div>

          {tipoActual && (
            <div
              id={`detalle-${tipoActual.id}`}
              className={`${styles.tipoDetalle} ${styles[`tipoDetalle_${tipoActual.colorClass}`]}`}
              role="region"
              aria-label={`Detalle del desempleo ${tipoActual.nombre}`}
              aria-live="polite"
            >
              <div className={styles.tipoDetalleHeader}>
                <span aria-hidden="true">{tipoActual.icono}</span>
                <h3 className={styles.tipoDetalleTitulo}>Desempleo {tipoActual.nombre}</h3>
              </div>
              <p className={styles.tipoDetalleDesc}>{tipoActual.descripcion}</p>

              <div className={styles.tipoDetalleGrid}>
                <div className={styles.tipoDetalleDato}>
                  <span className={styles.tipoDetalleDatoLabel}>⏱️ Duración típica</span>
                  <span className={styles.tipoDetalleDatoVal}>{tipoActual.duracion}</span>
                </div>
                <div className={styles.tipoDetalleDato}>
                  <span className={styles.tipoDetalleDatoLabel}>📊 Magnitud estimada</span>
                  <span className={styles.tipoDetalleDatoVal}>{tipoActual.porcentaje}</span>
                </div>
              </div>

              <div className={styles.tipoDetalleBloque}>
                <p className={styles.tipoDetalleBloqueLabel}>💼 Ejemplo real</p>
                <p>{tipoActual.ejemplo}</p>
              </div>

              <div className={styles.tipoDetalleBloque}>
                <p className={styles.tipoDetalleBloqueLabel}>🛠️ Posibles soluciones</p>
                <p>{tipoActual.solucion}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Sección 2: NAIRU ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🎯</span>
            <h2 className={styles.sectionTitle}>El NAIRU y la tasa de paro &ldquo;natural&rdquo;</h2>
          </div>

          <div className={styles.nairu}>
            <div className={styles.nairuBadge}>
              <span className={styles.nairuAcronimo}>NAIRU</span>
              <span className={styles.nairuDef}>
                Non-Accelerating Inflation Rate of Unemployment
              </span>
            </div>

            <p className={styles.nairuExplicacion}>
              Si el paro baja por debajo del NAIRU, los trabajadores tienen más poder de negociación
              y exigen salarios más altos. Las empresas suben precios para compensar costes. El
              resultado: <strong>inflación que se acelera</strong>.
            </p>

            <div className={styles.nairuPaisesGrid}>
              <div className={styles.nairuPais}>
                <span className={styles.nairuPaisFlag}>🇪🇸</span>
                <span className={styles.nairuPaisNombre}>España</span>
                <span className={`${styles.nairuPaisPct} ${styles.nairuPctAlto}`}>~10–12%</span>
                <span className={styles.nairuPaisComentario}>
                  Dualidad laboral fijos/temporales, rigideces, negociación colectiva sectorial
                </span>
              </div>
              <div className={styles.nairuPais}>
                <span className={styles.nairuPaisFlag}>🇩🇪</span>
                <span className={styles.nairuPaisNombre}>Alemania</span>
                <span className={`${styles.nairuPaisPct} ${styles.nairuPctMedio}`}>~3–4%</span>
                <span className={styles.nairuPaisComentario}>
                  Cogestión empresarial, formación dual, mercado laboral flexible y coordinado
                </span>
              </div>
              <div className={styles.nairuPais}>
                <span className={styles.nairuPaisFlag}>🇩🇰</span>
                <span className={styles.nairuPaisNombre}>Dinamarca</span>
                <span className={`${styles.nairuPaisPct} ${styles.nairuPctBajo}`}>~3–4%</span>
                <span className={styles.nairuPaisComentario}>
                  &ldquo;Flexiseguridad&rdquo;: fácil despido + generosas prestaciones + formación continua
                </span>
              </div>
              <div className={styles.nairuPais}>
                <span className={styles.nairuPaisFlag}>🇺🇸</span>
                <span className={styles.nairuPaisNombre}>EE. UU.</span>
                <span className={`${styles.nairuPaisPct} ${styles.nairuPctMedio}`}>~4–5%</span>
                <span className={styles.nairuPaisComentario}>
                  Mercado laboral flexible, alta movilidad geográfica, menor protección social
                </span>
              </div>
            </div>

            <div className={styles.nairuConclusión}>
              <p>
                El NAIRU no es una ley de la naturaleza: puede reducirse con reformas estructurales
                (mejor formación, mayor flexibilidad con más seguridad, reducción de la dualidad
                laboral). El reto político es cómo bajar el NAIRU sin aumentar la precariedad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 3: Curva de Beveridge ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">📐</span>
            <h2 className={styles.sectionTitle}>La Curva de Beveridge</h2>
            <p className={styles.sectionSubtitle}>
              Relación entre la tasa de desempleo y la tasa de vacantes sin cubrir.
            </p>
          </div>

          <div className={styles.beveridgeContainer}>
            <svg
              viewBox={`0 0 ${BEV_W} ${BEV_H}`}
              className={styles.beveridgeSvg}
              role="img"
              aria-label="Curva de Beveridge: relación entre desempleo y vacantes. Punto A (2012): 25% paro, 0,8% vacantes. Punto B (2023): 12% paro, 3,2% vacantes."
            >
              {/* Ejes */}
              <line
                x1={BEV_PAD_L} y1={BEV_PAD_T}
                x2={BEV_PAD_L} y2={BEV_PAD_T + BEV_PLOT_H}
                stroke="var(--text-secondary)" strokeWidth="1.5"
              />
              <line
                x1={BEV_PAD_L} y1={BEV_PAD_T + BEV_PLOT_H}
                x2={BEV_PAD_L + BEV_PLOT_W} y2={BEV_PAD_T + BEV_PLOT_H}
                stroke="var(--text-secondary)" strokeWidth="1.5"
              />

              {/* Etiquetas de ejes */}
              <text
                x={BEV_PAD_L + BEV_PLOT_W / 2}
                y={BEV_H - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-secondary)"
              >
                Tasa de desempleo (%)
              </text>
              <text
                x={12}
                y={BEV_PAD_T + BEV_PLOT_H / 2}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-secondary)"
                transform={`rotate(-90, 12, ${BEV_PAD_T + BEV_PLOT_H / 2})`}
              >
                Tasa de vacantes (%)
              </text>

              {/* Marcas eje X */}
              {[0, 10, 20, 30].map(v => (
                <g key={v}>
                  <line
                    x1={bevX(v)} y1={BEV_PAD_T + BEV_PLOT_H}
                    x2={bevX(v)} y2={BEV_PAD_T + BEV_PLOT_H + 4}
                    stroke="var(--text-secondary)" strokeWidth="1"
                  />
                  <text
                    x={bevX(v)}
                    y={BEV_PAD_T + BEV_PLOT_H + 16}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-secondary)"
                  >
                    {v}%
                  </text>
                </g>
              ))}

              {/* Marcas eje Y */}
              {[0, 2, 4, 6, 8].map(v => (
                <g key={v}>
                  <line
                    x1={BEV_PAD_L - 4} y1={bevY(v)}
                    x2={BEV_PAD_L} y2={bevY(v)}
                    stroke="var(--text-secondary)" strokeWidth="1"
                  />
                  <text
                    x={BEV_PAD_L - 8}
                    y={bevY(v) + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--text-secondary)"
                  >
                    {v}%
                  </text>
                </g>
              ))}

              {/* La curva */}
              <path
                d={beveridgePath}
                fill="none"
                stroke="#48A9A6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Punto A — crisis 2012 */}
              <circle
                cx={bevX(pA.unemp)}
                cy={bevY(pA.vac)}
                r={7}
                fill="#E74C3C"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={bevX(pA.unemp) - 12}
                y={bevY(pA.vac) - 12}
                fontSize="11"
                fontWeight="700"
                fill="#E74C3C"
                textAnchor="middle"
              >
                A (2012)
              </text>
              <text
                x={bevX(pA.unemp) - 12}
                y={bevY(pA.vac) - 1}
                fontSize="9"
                fill="#E74C3C"
                textAnchor="middle"
              >
                25% paro
              </text>

              {/* Punto B — auge 2023 */}
              <circle
                cx={bevX(pB.unemp)}
                cy={bevY(pB.vac)}
                r={7}
                fill="#2E86AB"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={bevX(pB.unemp) + 36}
                y={bevY(pB.vac) - 8}
                fontSize="11"
                fontWeight="700"
                fill="#2E86AB"
                textAnchor="middle"
              >
                B (2023)
              </text>
              <text
                x={bevX(pB.unemp) + 36}
                y={bevY(pB.vac) + 4}
                fontSize="9"
                fill="#2E86AB"
                textAnchor="middle"
              >
                12% paro
              </text>
            </svg>

            <div className={styles.beveridgeExplicacion}>
              <p>
                Cuando hay <strong>muchas vacantes y mucho paro simultáneamente</strong>, indica
                desempleo <em>estructural</em>: las habilidades de los desempleados no encajan con
                lo que demandan las empresas.
              </p>
              <p>
                Cuando hay <strong>pocas vacantes y mucho paro</strong>, es desempleo{' '}
                <em>cíclico</em>: simplemente falta demanda en la economía.
              </p>
              <p>
                El movimiento de A a B (crisis 2012 → recuperación 2023) sigue la curva hacia
                arriba-izquierda: menos paro, más vacantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 4: Evolución histórica ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">📈</span>
            <h2 className={styles.sectionTitle}>Evolución histórica: España vs UE (2000–2024)</h2>
          </div>

          <div className={styles.graficoContainer}>
            {/* Leyenda */}
            <div className={styles.leyenda} role="list" aria-label="Leyenda del gráfico">
              <div className={styles.leyendaItem} role="listitem">
                <span className={`${styles.leyendaDot} ${styles.leyendaDotEspania}`} aria-hidden="true" />
                <span>España</span>
              </div>
              <div className={styles.leyendaItem} role="listitem">
                <span className={`${styles.leyendaDot} ${styles.leyendaDotUE}`} aria-hidden="true" />
                <span>Media UE</span>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className={styles.graficoSvg}
              role="img"
              aria-label="Gráfico de líneas de la tasa de paro en España vs la media de la UE entre 2000 y 2024. España alcanzó un máximo del 26% en 2013. En 2024, España tiene un 11% frente al 6% de la UE."
            >
              {/* Cuadrícula horizontal */}
              {[0, 5, 10, 15, 20, 25, 30].map(pct => (
                <g key={pct}>
                  <line
                    x1={PAD_L} y1={yDePorcentaje(pct)}
                    x2={PAD_L + PLOT_W} y2={yDePorcentaje(pct)}
                    stroke="var(--text-muted)"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  <text
                    x={PAD_L - 6}
                    y={yDePorcentaje(pct) + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--text-secondary)"
                  >
                    {pct}%
                  </text>
                </g>
              ))}

              {/* Etiquetas eje X */}
              {aniosEjeX.map(anio => (
                <g key={anio}>
                  <line
                    x1={xDePorcentaje(anio)} y1={PAD_T + PLOT_H}
                    x2={xDePorcentaje(anio)} y2={PAD_T + PLOT_H + 5}
                    stroke="var(--text-secondary)"
                    strokeWidth="1"
                  />
                  <text
                    x={xDePorcentaje(anio)}
                    y={SVG_H - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-secondary)"
                  >
                    {anio}
                  </text>
                </g>
              ))}

              {/* Línea UE */}
              <polyline
                points={puntosUE}
                fill="none"
                stroke="#2E86AB"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Línea España */}
              <polyline
                points={puntosEspania}
                fill="none"
                stroke="#E74C3C"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Marcador máximo España 2013 */}
              <circle cx={xMax} cy={yMax} r={6} fill="#E74C3C" stroke="#fff" strokeWidth="2" />
              <line
                x1={xMax} y1={yMax - 8}
                x2={xMax} y2={yMax - 32}
                stroke="#E74C3C"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                x={xMax}
                y={yMax - 36}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#E74C3C"
              >
                26% (2013)
              </text>
            </svg>

            <p className={styles.graficoFuente}>
              Fuente: Eurostat / INE (datos aproximados con fines educativos)
            </p>
          </div>

          {/* Hitos clave */}
          <div className={styles.hitosGrid}>
            <div className={styles.hitoCard}>
              <span className={styles.hitoAnio}>2007–2013</span>
              <p className={styles.hitoTexto}>
                La Gran Recesión dispara el paro español del 8% al 26%. El mayor aumento de paro
                de un país desarrollado en tiempos de paz.
              </p>
            </div>
            <div className={styles.hitoCard}>
              <span className={styles.hitoAnio}>2013–2019</span>
              <p className={styles.hitoTexto}>
                Recuperación lenta impulsada por el turismo, la construcción y el consumo. La
                brecha con la UE se reduce pero no desaparece.
              </p>
            </div>
            <div className={styles.hitoCard}>
              <span className={styles.hitoAnio}>2020</span>
              <p className={styles.hitoTexto}>
                COVID-19: los ERTEs evitaron que el paro se disparara como en 2008. España usó la
                experiencia de la crisis anterior.
              </p>
            </div>
            <div className={styles.hitoCard}>
              <span className={styles.hitoAnio}>2022–2024</span>
              <p className={styles.hitoTexto}>
                Reforma laboral 2022 reduce temporalidad (del 25% al 17%). Paro baja al 11% pero
                España sigue siendo segunda con más paro de la UE.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 5: Políticas activas vs pasivas ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">⚙️</span>
            <h2 className={styles.sectionTitle}>Políticas activas vs políticas pasivas</h2>
          </div>

          {/* Tabs */}
          <div className={styles.tabs} role="tablist" aria-label="Tipos de políticas de empleo">
            <button
              type="button"
              role="tab"
              aria-selected={politicaTab === 'activas'}
              aria-controls="panel-activas"
              id="tab-activas"
              className={`${styles.tab} ${politicaTab === 'activas' ? styles.tabActivo : ''}`}
              onClick={() => setPoliticaTab('activas')}
            >
              ✅ Políticas Activas
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={politicaTab === 'pasivas'}
              aria-controls="panel-pasivas"
              id="tab-pasivas"
              className={`${styles.tab} ${politicaTab === 'pasivas' ? styles.tabActivo : ''}`}
              onClick={() => setPoliticaTab('pasivas')}
            >
              🛡️ Políticas Pasivas
            </button>
          </div>

          {/* Panel activas */}
          <div
            id="panel-activas"
            role="tabpanel"
            aria-labelledby="tab-activas"
            hidden={politicaTab !== 'activas'}
            className={styles.tabPanel}
          >
            <p className={styles.tabIntro}>
              Las políticas activas buscan <strong>reducir el desempleo</strong> facilitando que los
              trabajadores encuentren empleo o que las empresas contraten más.
            </p>
            <ul className={styles.politicaLista}>
              <li>
                <strong>Formación profesional para el empleo (SEPE):</strong> cursos subvencionados
                para actualizar habilidades. FP Dual: aprendizaje en empresa + instituto.
              </li>
              <li>
                <strong>Orientación e intermediación laboral:</strong> oficinas de empleo autonómicas
                que conectan oferta y demanda de trabajo.
              </li>
              <li>
                <strong>Incentivos a la contratación:</strong> bonificaciones en cuotas de la
                Seguridad Social por contratar desempleados de larga duración, jóvenes o mayores de 50.
              </li>
              <li>
                <strong>Empleo público contracíclico:</strong> inversión en obras públicas e
                infraestructuras en períodos de recesión para crear demanda de trabajo.
              </li>
              <li>
                <strong>Reforma laboral 2022:</strong> contrato fijo-discontinuo, límite a la
                temporalidad, fin de los contratos de obra y servicio. Temporalidad bajó del 25% al 17%.
              </li>
            </ul>
            <div className={styles.tabConclusión}>
              <p>
                <strong>Objetivo:</strong> reincorporar trabajadores al mercado laboral y reducir el
                desempleo estructural mejorando el ajuste entre habilidades y demanda.
              </p>
            </div>
          </div>

          {/* Panel pasivas */}
          <div
            id="panel-pasivas"
            role="tabpanel"
            aria-labelledby="tab-pasivas"
            hidden={politicaTab !== 'pasivas'}
            className={styles.tabPanel}
          >
            <p className={styles.tabIntro}>
              Las políticas pasivas <strong>compensan económicamente</strong> al desempleado durante
              el período de búsqueda de empleo, sin intentar crear empleo directamente.
            </p>
            <ul className={styles.politicaLista}>
              <li>
                <strong>Prestación contributiva por desempleo:</strong> 70% del salario base los
                primeros 6 meses, 50% a partir del 7.º mes. Duración máxima: 2 años (requiere haber
                cotizado mínimo 1 año).
              </li>
              <li>
                <strong>Subsidio por desempleo (no contributivo):</strong> ~480 €/mes para quienes
                han agotado la prestación o no tienen acceso a ella (mayores de 45, parados de larga
                duración, emigrantes retornados).
              </li>
              <li>
                <strong>Renta Activa de Inserción (RAI):</strong> para colectivos vulnerables con
                especiales dificultades de inserción (discapacidad, violencia de género, emigrantes).
              </li>
              <li>
                <strong>ERTEs (Expedientes de Regulación Temporal de Empleo):</strong> los trabajadores
                pasan temporalmente al desempleo con el 70% de la prestación, manteniendo el vínculo
                laboral para reincorporarse cuando mejore la actividad.
              </li>
            </ul>
            <div className={styles.tabConclusión}>
              <p>
                <strong>Debate económico:</strong> las políticas pasivas pueden generar un{' '}
                <em>efecto desincentivo</em> (no buscar empleo si la prestación es suficiente). La
                evidencia empírica muestra que este efecto es moderado cuando las prestaciones son
                temporales y existe orientación laboral activa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="La economía del desempleo"
        subtitle="Por qué el paro es inevitable, medible y tratable"
        defaultOpen={false}
      >
        <h3>Cómo se mide el paro: la EPA y la metodología OIT</h3>
        <p>
          En España, el desempleo se mide mediante la{' '}
          <strong>EPA (Encuesta de Población Activa)</strong>, elaborada por el INE cada trimestre.
          Sigue la metodología de la OIT: una persona está desempleada si cumple <em>tres condiciones
          simultáneas</em>: sin trabajo, disponible para trabajar y buscando empleo activamente en
          las últimas 4 semanas.
        </p>
        <p>
          Esto significa que quien ha dejado de buscar empleo (los <em>desanimados</em>) no computa
          como desempleado sino como &ldquo;inactivo&rdquo;. El paro oficial puede infraestimar el
          verdadero problema.
        </p>

        <h3>Por qué el paro oficial puede infraestimar el problema</h3>
        <p>
          Existen varias formas de empleo precario que no aparecen en la tasa de paro:
        </p>
        <ul>
          <li>
            <strong>Subempleo:</strong> personas que trabajan menos horas de las que desean. España
            tiene una tasa de subempleo por insuficiencia de horas del 5-6%.
          </li>
          <li>
            <strong>Parados desanimados:</strong> personas que quieren trabajar pero han dejado de
            buscar porque creen que no encontrarán. Especialmente relevante en economías con alto
            desempleo estructural.
          </li>
          <li>
            <strong>Falsos autónomos:</strong> personas que facturan como autónomos pero dependen de
            un solo cliente. Legalmente empleados, estadísticamente &ldquo;ocupados&rdquo;.
          </li>
        </ul>

        <h3>La trampa del desempleo estructural en España</h3>
        <p>
          España tiene el segundo NAIRU más alto de la UE. Las causas históricas son complejas:
        </p>
        <ul>
          <li>
            <strong>Alta temporalidad histórica:</strong> antes de la reforma de 2022, el 25% de los
            contratos eran temporales (media UE: 12%). La temporalidad frenaba la inversión en
            formación tanto de empresas como de trabajadores.
          </li>
          <li>
            <strong>Desajuste formativo:</strong> España tiene simultáneamente alta tasa de
            universitarios y alta tasa de abandono escolar temprano (20%), con un déficit en FP
            Media. El mercado demanda perfiles de FP que el sistema no produce suficientemente.
          </li>
          <li>
            <strong>Negociación colectiva sectorial:</strong> los convenios sectoriales dificultan
            el ajuste salarial a la productividad real de cada empresa.
          </li>
          <li>
            <strong>Concentración geográfica:</strong> las oportunidades de empleo están muy
            concentradas en Madrid y Barcelona. La movilidad geográfica en España es menor que en
            Alemania o EEUU.
          </li>
        </ul>

        <div className={styles.warningBox}>
          <strong>Nota:</strong> La tasa de paro española sigue siendo la segunda más alta de la UE
          (tras Grecia). La solución requiere reformas estructurales en el mercado laboral, la
          formación profesional y la negociación colectiva. No existe una solución única: las
          políticas más efectivas combinan elementos de los modelos nórdico (flexiseguridad),
          alemán (FP dual) y la adaptación al contexto español.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-desempleo-tipos')} />
      <ShareCard appName="visualizador-desempleo-tipos" />
      <Footer appName="visualizador-desempleo-tipos" />
    </div>
  );
}
