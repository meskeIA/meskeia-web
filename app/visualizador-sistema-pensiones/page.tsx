'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './SistemaPensiones.module.css';
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
// Datos del ratio trabajadores / pensionistas
// ─────────────────────────────────────────────

const DATOS_RATIO: { ano: number; ratio: number; proyeccion: boolean }[] = [
  { ano: 1975, ratio: 5.5, proyeccion: false },
  { ano: 1990, ratio: 4.0, proyeccion: false },
  { ano: 2000, ratio: 3.5, proyeccion: false },
  { ano: 2010, ratio: 3.2, proyeccion: false },
  { ano: 2020, ratio: 2.6, proyeccion: false },
  { ano: 2024, ratio: 2.3, proyeccion: false },
  { ano: 2030, ratio: 2.0, proyeccion: true },
  { ano: 2040, ratio: 1.7, proyeccion: true },
  { ano: 2050, ratio: 1.4, proyeccion: true },
];

function interpolarRatio(ano: number): { ratio: number; proyeccion: boolean } {
  for (let i = 0; i < DATOS_RATIO.length - 1; i++) {
    const d0 = DATOS_RATIO[i];
    const d1 = DATOS_RATIO[i + 1];
    if (ano >= d0.ano && ano <= d1.ano) {
      const t = (ano - d0.ano) / (d1.ano - d0.ano);
      return {
        ratio: parseFloat((d0.ratio + t * (d1.ratio - d0.ratio)).toFixed(2)),
        proyeccion: d1.proyeccion,
      };
    }
  }
  if (ano <= DATOS_RATIO[0].ano) return { ratio: DATOS_RATIO[0].ratio, proyeccion: false };
  return { ratio: DATOS_RATIO[DATOS_RATIO.length - 1].ratio, proyeccion: true };
}

// ─────────────────────────────────────────────
// Timeline de reformas
// ─────────────────────────────────────────────

const REFORMAS = [
  {
    ano: 1995,
    titulo: 'Pacto de Toledo',
    descripcion: 'Acuerdo político multipartidista para garantizar la sostenibilidad del sistema a largo plazo. Separación de fuentes de financiación.',
    color: '#2E86AB',
  },
  {
    ano: 2011,
    titulo: 'Reforma 2011: retraso gradual a 67 años (Ley 27/2011, gobierno PSOE)',
    descripcion: 'Se retrasa la edad de jubilación ordinaria de 65 a 67 años (gradual hasta 2027). Se amplía el período de cómputo de 15 a 25 años y se exige cotizar 37 años para el 100%.',
    color: '#48A9A6',
  },
  {
    ano: 2013,
    titulo: 'Reforma 2013: Factor de Sostenibilidad (Ley 23/2013)',
    descripcion: 'Vincula la pensión inicial a la esperanza de vida. Aprobado pero suspendido antes de aplicarse en 2019 y finalmente derogado.',
    color: '#7FB3D3',
  },
  {
    ano: 2021,
    titulo: 'Derogación del Factor',
    descripcion: 'Se deroga el Factor de Sostenibilidad. La Ley 21/2021 establece la revalorización de las pensiones con el IPC anual, manteniendo el poder adquisitivo bajo el marco normativo actual.',
    color: '#48A9A6',
  },
  {
    ano: 2023,
    titulo: 'Reforma Escrivá',
    descripcion: 'Cotización extra solidaria para rentas altas y creación del MEI (Mecanismo de Equidad Intergeneracional): 0,6% extra sobre la nómina hasta 2032 para reconstruir el Fondo de Reserva.',
    color: '#2E86AB',
  },
  {
    ano: 2027,
    titulo: '37 años para pensión completa',
    descripcion: '37 años cotizados obligatorios para obtener el 100% de la pensión. Este umbral entra en vigor como resultado de la reforma de 2011.',
    color: '#7FB3D3',
  },
];

// ─────────────────────────────────────────────
// Datos del Fondo de Reserva
// ─────────────────────────────────────────────

const FONDO_RESERVA: { ano: number; importe: number; etiqueta: string }[] = [
  { ano: 2011, importe: 66000, etiqueta: 'Máximo histórico' },
  { ano: 2013, importe: 53700, etiqueta: '' },
  { ano: 2015, importe: 32500, etiqueta: 'Crisis económica' },
  { ano: 2017, importe: 8000, etiqueta: 'Mínimo post-crisis' },
  { ano: 2020, importe: 3000, etiqueta: '' },
  { ano: 2024, importe: 10000, etiqueta: 'Reconstrucción MEI' },
];

const MAX_FONDO = 70000;

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemaPensiones() {
  const [anoSlider, setAnoSlider] = useState(2024);
  const [sistemaActivo, setSistemaActivo] = useState<'reparto' | 'capitalizacion'>('reparto');

  const { ratio, proyeccion } = useMemo(() => interpolarRatio(anoSlider), [anoSlider]);

  // Número de iconos de trabajadores a mostrar (máx 8 para UI)
  const iconosTrabajadores = useMemo(() => {
    const n = Math.round(Math.min(ratio, 8));
    return Math.max(1, n);
  }, [ratio]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Sistema de Pensiones Español</h1>
        <p className={styles.subtitle}>
          Cómo funciona el reparto, qué factores influyen en su sostenibilidad y las reformas que lo han modelado
        </p>
      </header>

      <LegalNotice />

      {/* SECCIÓN 1: Reparto vs Capitalización */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>¿Cómo se financia tu pensión?</h2>
        <p className={styles.seccionSubtitulo}>
          Existen dos grandes modelos de pensiones públicas en el mundo. España usa el reparto.
        </p>

        <div className={styles.tabsBotones} role="tablist" aria-label="Modelos de pensiones">
          <button
            className={`${styles.tabBoton} ${sistemaActivo === 'reparto' ? styles.tabActivo : ''}`}
            onClick={() => setSistemaActivo('reparto')}
            role="tab"
            aria-selected={sistemaActivo === 'reparto'}
            aria-controls="panel-reparto"
          >
            Reparto (España)
          </button>
          <button
            className={`${styles.tabBoton} ${sistemaActivo === 'capitalizacion' ? styles.tabActivo : ''}`}
            onClick={() => setSistemaActivo('capitalizacion')}
            role="tab"
            aria-selected={sistemaActivo === 'capitalizacion'}
            aria-controls="panel-capitalizacion"
          >
            Capitalización (alternativa)
          </button>
        </div>

        <div
          id="panel-reparto"
          role="tabpanel"
          className={`${styles.sistemaPanel} ${sistemaActivo === 'reparto' ? styles.sistemaPanelActivo : styles.sistemaPanelOculto}`}
          aria-hidden={sistemaActivo !== 'reparto'}
        >
          <div className={styles.sistemaFlujoReparto}>
            {/* SVG flujo reparto */}
            <svg
              viewBox="0 0 520 120"
              className={styles.svgFlujo}
              aria-label="Diagrama del sistema de reparto: trabajadores financian directamente a pensionistas"
              role="img"
            >
              {/* Trabajadores activos */}
              <rect x="0" y="20" width="140" height="80" rx="10" fill="rgba(46,134,171,0.12)" stroke="#2E86AB" strokeWidth="1.5" />
              <text x="70" y="45" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2E86AB">Trabajadores</text>
              <text x="70" y="62" textAnchor="middle" fontSize="22">👷</text>
              <text x="70" y="90" textAnchor="middle" fontSize="10" fill="#666">Cotizaciones HOY</text>

              {/* Flecha → Caja SS */}
              <path d="M 142 60 L 188 60" stroke="#2E86AB" strokeWidth="2" markerEnd="url(#arr)" />
              <text x="165" y="52" textAnchor="middle" fontSize="9" fill="#888">flujo</text>

              {/* Caja SS */}
              <rect x="190" y="20" width="140" height="80" rx="10" fill="rgba(72,169,166,0.12)" stroke="#48A9A6" strokeWidth="1.5" />
              <text x="260" y="45" textAnchor="middle" fontSize="11" fontWeight="600" fill="#48A9A6">Tesorería SS</text>
              <text x="260" y="65" textAnchor="middle" fontSize="11" fill="#555">Redistribuye</text>
              <text x="260" y="88" textAnchor="middle" fontSize="9" fill="#888">Sin fondo propio</text>

              {/* Flecha → Pensionistas */}
              <path d="M 332 60 L 378 60" stroke="#48A9A6" strokeWidth="2" markerEnd="url(#arr2)" />

              {/* Pensionistas */}
              <rect x="380" y="20" width="140" height="80" rx="10" fill="rgba(46,134,171,0.08)" stroke="#2E86AB" strokeWidth="1.5" />
              <text x="450" y="45" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2E86AB">Pensionistas</text>
              <text x="450" y="62" textAnchor="middle" fontSize="22">🧓</text>
              <text x="450" y="90" textAnchor="middle" fontSize="10" fill="#666">Pensión mensual</text>

              <defs>
                <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#2E86AB" />
                </marker>
                <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#48A9A6" />
                </marker>
              </defs>
            </svg>
          </div>

          <div className={styles.sistemaCaracteristicas}>
            <div className={styles.sistemaVentajas}>
              <h4 className={styles.caracteristicasTitulo}>Ventajas</h4>
              <ul className={styles.caracteristicasLista}>
                <li>Solidaridad intergeneracional entre activos y jubilados</li>
                <li>Rentabilidad ligada al crecimiento económico y del empleo</li>
                <li>Protege frente a inflación si se revaloriza con IPC</li>
                <li>Simple de entender: trabajas → cotizas → cobras</li>
              </ul>
            </div>
            <div className={styles.sistemaRiesgos}>
              <h4 className={styles.caracteristicasTitulo}>Riesgos</h4>
              <ul className={styles.caracteristicasLista}>
                <li>Vulnerable al envejecimiento demográfico</li>
                <li>Depende del número de trabajadores activos</li>
                <li>Las generaciones futuras cargan con más peso</li>
                <li>Presión creciente con la bajada de natalidad</li>
              </ul>
            </div>
          </div>

          <p className={styles.sistemaEjemplos}>
            <strong>Países con reparto puro:</strong> España, Francia, Italia, Alemania (con complementos)
          </p>
        </div>

        <div
          id="panel-capitalizacion"
          role="tabpanel"
          className={`${styles.sistemaPanel} ${sistemaActivo === 'capitalizacion' ? styles.sistemaPanelActivo : styles.sistemaPanelOculto}`}
          aria-hidden={sistemaActivo !== 'capitalizacion'}
        >
          <div className={styles.sistemaFlujoReparto}>
            {/* SVG flujo capitalización */}
            <svg
              viewBox="0 0 520 120"
              className={styles.svgFlujo}
              aria-label="Diagrama del sistema de capitalización: cada trabajador acumula su propio fondo"
              role="img"
            >
              {/* Trabajador joven */}
              <rect x="0" y="20" width="130" height="80" rx="10" fill="rgba(46,134,171,0.12)" stroke="#2E86AB" strokeWidth="1.5" />
              <text x="65" y="45" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2E86AB">Trabajador</text>
              <text x="65" y="62" textAnchor="middle" fontSize="22">🧑‍💼</text>
              <text x="65" y="90" textAnchor="middle" fontSize="10" fill="#666">Cotiza en activo</text>

              {/* Flecha → Fondo */}
              <path d="M 132 60 L 178 60" stroke="#2E86AB" strokeWidth="2" markerEnd="url(#arr3)" />

              {/* Fondo individual */}
              <rect x="180" y="20" width="160" height="80" rx="10" fill="rgba(72,169,166,0.12)" stroke="#48A9A6" strokeWidth="1.5" />
              <text x="260" y="42" textAnchor="middle" fontSize="11" fontWeight="600" fill="#48A9A6">Fondo Individual</text>
              <text x="260" y="60" textAnchor="middle" fontSize="10" fill="#555">Acumula con intereses</text>
              <text x="260" y="76" textAnchor="middle" fontSize="10" fill="#555">durante 40 años</text>
              <text x="260" y="92" textAnchor="middle" fontSize="9" fill="#888">📈 invertido en mercados</text>

              {/* Flecha → Jubilado */}
              <path d="M 342 60 L 388 60" stroke="#48A9A6" strokeWidth="2" markerEnd="url(#arr4)" />

              {/* Jubilado (mismo trabajador) */}
              <rect x="390" y="20" width="130" height="80" rx="10" fill="rgba(46,134,171,0.08)" stroke="#2E86AB" strokeWidth="1.5" />
              <text x="455" y="42" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2E86AB">Jubilado</text>
              <text x="455" y="59" textAnchor="middle" fontSize="22">🧓</text>
              <text x="455" y="90" textAnchor="middle" fontSize="10" fill="#666">Mismo trabajador</text>

              <defs>
                <marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#2E86AB" />
                </marker>
                <marker id="arr4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#48A9A6" />
                </marker>
              </defs>
            </svg>
          </div>

          <div className={styles.sistemaCaracteristicas}>
            <div className={styles.sistemaVentajas}>
              <h4 className={styles.caracteristicasTitulo}>Ventajas</h4>
              <ul className={styles.caracteristicasLista}>
                <li>Independiente de la demografía: tu fondo es tuyo</li>
                <li>Puede crecer con rentabilidad del mercado a largo plazo</li>
                <li>No crea deuda intergeneracional</li>
                <li>Heredable en muchos sistemas</li>
              </ul>
            </div>
            <div className={styles.sistemaRiesgos}>
              <h4 className={styles.caracteristicasTitulo}>Riesgos</h4>
              <ul className={styles.caracteristicasLista}>
                <li>Expuesto a crisis financieras (como en Chile 2008)</li>
                <li>Sin solidaridad: quienes cotizaron poco, cobran poco</li>
                <li>La transición desde el reparto es muy costosa</li>
                <li>Alta dependencia de comisiones de gestoras privadas</li>
                <li>Las pensiones dependen del momento concreto de jubilación (riesgo de secuencia). En Chile, gran parte de las pensiones del sistema AFP quedan por debajo del salario mínimo.</li>
              </ul>
            </div>
          </div>

          <p className={styles.sistemaEjemplos}>
            <strong>Países con capitalización:</strong> Chile (AFP), Australia (Superannuation), Países Bajos, Suecia (parcial)
          </p>
        </div>
      </section>

      {/* SECCIÓN 2: Ratio trabajadores/pensionistas */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>La presión demográfica</h2>
        <p className={styles.seccionSubtitulo}>
          Un indicador clave: la ratio entre trabajadores cotizando y pensionistas. Su evolución es uno de los factores que condiciona la sostenibilidad del sistema, junto con productividad, salarios e inmigración.
        </p>

        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label htmlFor="slider-ano" className={styles.sliderLabel}>
              Año seleccionado
            </label>
            <span className={styles.sliderValor}>
              {anoSlider}
              {proyeccion && <span className={styles.proyeccionBadge}> (proyección)</span>}
            </span>
          </div>
          <input
            id="slider-ano"
            type="range"
            min={1975}
            max={2050}
            step={1}
            value={anoSlider}
            onChange={(e) => setAnoSlider(Number(e.target.value))}
            className={styles.slider}
            aria-label={`Año: ${anoSlider}`}
          />
          <div className={styles.sliderExtremos}>
            <span>1975</span>
            <span>2024 (hoy)</span>
            <span>2050</span>
          </div>
        </div>

        <div className={styles.ratioVisualizacion} aria-live="polite" aria-atomic="true">
          <div className={styles.ratioTexto}>
            En <strong>{anoSlider}</strong>,{' '}
            <strong className={styles.ratioNumero}>{ratio.toFixed(1)}</strong> trabajadores financian
            cada pensión
          </div>

          <div className={styles.ratioIconos} aria-label={`${ratio.toFixed(1)} trabajadores por pensionista`}>
            <div className={styles.ratioGrupoTrabajadores}>
              {Array.from({ length: iconosTrabajadores }).map((_, i) => (
                <span key={i} className={styles.iconoTrabajador} aria-hidden="true">
                  👷
                </span>
              ))}
              {ratio > 8 && (
                <span className={styles.iconoExtra} aria-hidden="true">+{(ratio - 8).toFixed(1)}</span>
              )}
            </div>
            <div className={styles.ratioFlecha} aria-hidden="true">→</div>
            <div className={styles.ratioGrupoPensionista}>
              <span className={styles.iconoPensionista} aria-hidden="true">🧓</span>
            </div>
          </div>

          <p className={styles.ratioNota}>
            {anoSlider <= 2024
              ? 'Dato histórico de la Seguridad Social española'
              : 'Proyección según tendencias demográficas del INE y AIREF'}
          </p>
        </div>

        {/* Mini gráfico de línea CSS */}
        <div className={styles.ratioGrafico}>
          <div className={styles.ratioGraficoTitulo}>Evolución del ratio (1975–2050)</div>
          <div className={styles.ratioGraficoBarra}>
            {DATOS_RATIO.map((d, i) => {
              const altoPct = (d.ratio / 6) * 100;
              const activo = d.ano === anoSlider || (i > 0 && anoSlider >= DATOS_RATIO[i - 1].ano && anoSlider < d.ano);
              return (
                <div key={d.ano} className={styles.ratioGraficoColumna}>
                  <div
                    className={`${styles.ratioGraficoBarra2} ${d.proyeccion ? styles.barraProy : ''} ${activo ? styles.barraActiva : ''}`}
                    style={{ height: `${altoPct}%` }}
                    title={`${d.ano}: ${d.ratio} trabajadores/pensionista`}
                  />
                  <span className={styles.ratioGraficoLabel}>{d.ano}</span>
                </div>
              );
            })}
          </div>
          <div className={styles.ratioGraficoLeyenda}>
            <span className={styles.leyendaHistorico}>Histórico</span>
            <span className={styles.leyendaProyeccion}>Proyección</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: Gasto en pensiones */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>El gasto en pensiones hoy (datos 2024–2026)</h2>
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcono} aria-hidden="true">💶</span>
            <span className={styles.kpiValor}>~200.000 M€</span>
            <span className={styles.kpiLabel}>Gasto total en pensiones</span>
            <span className={styles.kpiSub}>≈ 12,6% del PIB</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcono} aria-hidden="true">👥</span>
            <span className={styles.kpiValor}>~10 millones</span>
            <span className={styles.kpiLabel}>Pensionistas en España</span>
            <span className={styles.kpiSub}>1 de cada 5 españoles</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcono} aria-hidden="true">📊</span>
            <span className={styles.kpiValor}>~1.200 €/mes</span>
            <span className={styles.kpiLabel}>Pensión media</span>
            <span className={styles.kpiSub}>Contributiva de jubilación</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcono} aria-hidden="true">⬆️</span>
            <span className={styles.kpiValor}>3.359,60 €/mes</span>
            <span className={styles.kpiLabel}>Pensión máxima</span>
            <span className={styles.kpiSub}>Tope 2026</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiIcono} aria-hidden="true">⬇️</span>
            <span className={styles.kpiValor}>1.256,60 €/mes</span>
            <span className={styles.kpiLabel}>Pensión mínima</span>
            <span className={styles.kpiSub}>Con cónyuge a cargo (2026)</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: Timeline de reformas */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Las grandes reformas (1995–2027)</h2>
        <p className={styles.seccionSubtitulo}>
          El sistema no ha parado de reformarse ante los retos demográficos y económicos
        </p>

        <div className={styles.timeline}>
          {REFORMAS.map((reforma, idx) => (
            <div key={reforma.ano} className={styles.timelineItem}>
              <div className={styles.timelineConector} aria-hidden="true">
                <div className={styles.timelinePunto} style={{ background: reforma.color }} />
                {idx < REFORMAS.length - 1 && <div className={styles.timelineLinea} />}
              </div>
              <div className={styles.timelineContenido}>
                <div className={styles.timelineAno} style={{ color: reforma.color }}>
                  {reforma.ano}
                </div>
                <h3 className={styles.timelineTitulo}>{reforma.titulo}</h3>
                <p className={styles.timelineDesc}>{reforma.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 5: Proyecciones AIREF */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Proyecciones AIREF: gasto futuro</h2>
        <p className={styles.seccionSubtitulo}>
          La Autoridad Independiente de Responsabilidad Fiscal estima el coste futuro del sistema
        </p>

        <div className={styles.proyeccionGrafico}>
          {[
            { ano: 2024, pct: 12.6, proyeccion: false },
            { ano: 2030, pct: 13.5, proyeccion: true },
            { ano: 2040, pct: 15.0, proyeccion: true },
            { ano: 2050, pct: 16.0, proyeccion: true },
          ].map((d) => {
            const anchoPct = (d.pct / 18) * 100;
            return (
              <div key={d.ano} className={styles.proyeccionFila}>
                <span className={styles.proyeccionAno}>{d.ano}</span>
                <div className={styles.proyeccionBarraWrap}>
                  <div
                    className={`${styles.proyeccionBarra} ${d.proyeccion ? styles.proyeccionBarraProy : ''}`}
                    style={{ width: `${anchoPct}%` }}
                    title={`${d.pct}% del PIB`}
                    aria-label={`${d.ano}: ${d.pct}% del PIB${d.proyeccion ? ' (proyección)' : ''}`}
                  />
                  <span className={styles.proyeccionValor}>{d.pct}%</span>
                </div>
              </div>
            );
          })}
          <p className={styles.proyeccionNota}>% del PIB destinado a pensiones</p>
        </div>

        <div className={styles.insightBox}>
          <p>
            La AIREF proyecta que el gasto en pensiones alcanzará el{' '}
            <strong>15–17% del PIB en 2050</strong> si no hay reformas. Para contexto:{' '}
            <strong>Italia y Grecia ya están en torno al 15-16% del PIB</strong>. Es un peso fiscal alto pero sostenible si va acompañado de ingresos correspondientes (cotizaciones, productividad, aportaciones del Estado).
          </p>
        </div>
      </section>

      {/* SECCIÓN 6: Fondo de Reserva */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>El Fondo de Reserva ("la hucha de las pensiones")</h2>
        <p className={styles.seccionSubtitulo}>
          Creado para guardar superávits y cubrir pensiones en tiempos difíciles
        </p>

        <div className={styles.fondoGrafico}>
          {FONDO_RESERVA.map((d) => {
            const altoPct = (d.importe / MAX_FONDO) * 100;
            return (
              <div key={d.ano} className={styles.fondoColumna}>
                <div className={styles.fondoBarraWrap}>
                  {d.etiqueta && (
                    <span className={styles.fondoEtiqueta}>{d.etiqueta}</span>
                  )}
                  <div
                    className={styles.fondoBarra}
                    style={{ height: `${Math.max(altoPct, 2)}%` }}
                    title={`${d.ano}: ${(d.importe / 1000).toFixed(0)}.000 M€`}
                    aria-label={`${d.ano}: ${(d.importe / 1000).toFixed(0)}.000 millones de euros`}
                  />
                </div>
                <span className={styles.fondoValor}>{(d.importe / 1000).toFixed(0)}k M€</span>
                <span className={styles.fondoAno}>{d.ano}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.insightBox}>
          <p>
            El fondo alcanzó su <strong>máximo de 66.000 M€ en 2011</strong>. La crisis económica
            obligó a utilizarlo para pagar pensiones entre 2012 y 2017, reduciéndolo a apenas 8.000
            M€. Desde 2023, el <strong>Mecanismo de Equidad Intergeneracional (MEI)</strong> está
            reconstruyéndolo hasta llegar a ~10.000 M€ en 2024.
          </p>
        </div>
      </section>

      {/* BLOQUE EDUCATIVO */}
      <EducationalSection
        title="El sistema de pensiones español"
        subtitle="Un pacto entre generaciones bajo presión demográfica"
      >
        <section>
          <h3>¿Cómo se calcula tu pensión pública?</h3>
          <p>
            La pensión contributiva de jubilación en España depende de tres factores principales:
          </p>
          <ol>
            <li>
              <strong>Base reguladora</strong>: media de tus bases de cotización de los últimos 25
              años (con corrección de IPC excepto los 2 últimos)
            </li>
            <li>
              <strong>Porcentaje aplicable</strong>: mínimo 15 años cotizados para acceder (50%).
              Se necesitan 36 años y 9 meses cotizados para cobrar el 100% (en 2026; alcanzará los 37 años en 2027).
            </li>
            <li>
              <strong>Edad de jubilación</strong>: en 2026, con 66 años y 10 meses (o 65 si se acreditan 38 años y 3 meses).
              La edad ordinaria alcanzará los 67 años en 2027 (o 65 con 38 años y 6 meses).
            </li>
          </ol>
          <p>
            La pensión resultante no puede superar el tope máximo (3.359,60 €/mes en 2026) ni quedar
            por debajo de las pensiones mínimas garantizadas.
          </p>
        </section>

        <section>
          <h3>¿Cómo se financia la Seguridad Social?</h3>
          <p>
            La Seguridad Social española se financia principalmente a través de las{' '}
            <strong>cotizaciones sociales</strong>: un porcentaje del salario bruto que pagan tanto
            el trabajador como la empresa.
          </p>
          <ul>
            <li>
              <strong>Contingencias comunes</strong> (cubre enfermedad, jubilación): empresas pagan
              ~23,6%, trabajadores ~4,7% del salario bruto
            </li>
            <li>
              <strong>MEI</strong> (Mecanismo de Equidad Intergeneracional, desde 2023): 0,6% extra
              entre empresa y trabajador, destinado al Fondo de Reserva
            </li>
            <li>
              Otras cotizaciones: desempleo, FOGASA, formación profesional
            </li>
          </ul>
          <p>
            El Estado también complementa la financiación con aportaciones del Presupuesto General,
            especialmente para cubrir déficits estructurales y pensiones no contributivas.
          </p>
        </section>

        <section>
          <h3>Comparativa internacional: % PIB en pensiones</h3>
          <p>
            España no está sola ante el reto del envejecimiento. Varios países europeos ya gastan
            más que España en pensiones como porcentaje del PIB:
          </p>
          <ul>
            <li>
              <strong>Grecia</strong>: ~16% del PIB — el más alto de la UE (demografía + crisis)
            </li>
            <li>
              <strong>Italia</strong>: ~15,4% del PIB — sistema muy generoso heredado del pasado
            </li>
            <li>
              <strong>Francia</strong>: ~14% del PIB — reformas recientes (Macron) para ajustar
            </li>
            <li>
              <strong>España</strong>: ~12,6% del PIB — en la media-alta europea
            </li>
            <li>
              <strong>Alemania</strong>: ~10% del PIB — con más capitalización complementaria
            </li>
            <li>
              <strong>Suecia</strong>: ~7% del PIB — sistema mixto (reparto + capitalización nocional)
            </li>
          </ul>
          <p>
            Los países nórdicos y Países Bajos han desarrollado sólidos sistemas de capitalización
            complementarios que reducen la dependencia del reparto puro.
          </p>
        </section>

        <div className={styles.warningBox}>
          Los datos de proyección son estimaciones basadas en tendencias demográficas actuales. La
          sostenibilidad real del sistema dependerá de la evolución del empleo, la natalidad, la
          inmigración, el crecimiento económico y las reformas futuras. Las proyecciones son
          escenarios, no certezas.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-sistema-pensiones')} />
      <ShareCard appName="visualizador-sistema-pensiones" />
      <Footer appName="visualizador-sistema-pensiones" />
    </div>
  );
}
