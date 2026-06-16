'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ElNino.module.css';
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

type TabId = 'normal' | 'elnino' | 'lanina' | 'prediccion';

interface TabInfo {
  id: TabId;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const TABS: TabInfo[] = [
  { id: 'normal', titulo: 'Normal (Neutral)', icono: '🌊', subtitulo: 'Condiciones de referencia' },
  { id: 'elnino', titulo: 'El Niño', icono: '🔥', subtitulo: 'Vientos débiles, agua cálida al Este' },
  { id: 'lanina', titulo: 'La Niña', icono: '❄️', subtitulo: 'Vientos fuertes, agua fría al Este' },
  { id: 'prediccion', titulo: 'Predicción ENSO', icono: '📊', subtitulo: 'Índices, historia e impacto' },
];

interface Teleconexion {
  zona: string;
  efecto: string;
  icono: string;
  tipo: 'lluvia' | 'sequia' | 'temperatura';
}

const TELECONEXIONES_NINO: Teleconexion[] = [
  { zona: 'Australia e Indonesia', efecto: 'Sequías intensas', icono: '🔥', tipo: 'sequia' },
  { zona: 'Perú y Ecuador', efecto: 'Lluvias torrenciales', icono: '🌧️', tipo: 'lluvia' },
  { zona: 'Sahel y África Central', efecto: 'Reducción de lluvias', icono: '🌵', tipo: 'sequia' },
  { zona: 'California (EE.UU.)', efecto: 'Más precipitaciones', icono: '🌧️', tipo: 'lluvia' },
  { zona: 'Canadá y Alaska', efecto: 'Inviernos más cálidos', icono: '🌡️', tipo: 'temperatura' },
  { zona: 'España (Península)', efecto: 'Inviernos más secos y cálidos', icono: '☀️', tipo: 'sequia' },
  { zona: 'India (monzón)', efecto: 'Monzón más débil', icono: '💧', tipo: 'sequia' },
  { zona: 'Sur de Brasil', efecto: 'Más lluvias', icono: '🌧️', tipo: 'lluvia' },
];

const TELECONEXIONES_NINA: Teleconexion[] = [
  { zona: 'Australia e Indonesia', efecto: 'Lluvias e inundaciones', icono: '🌧️', tipo: 'lluvia' },
  { zona: 'Perú y Ecuador', efecto: 'Sequías', icono: '🔥', tipo: 'sequia' },
  { zona: 'India y Sudeste Asiático', efecto: 'Monzón más intenso', icono: '🌊', tipo: 'lluvia' },
  { zona: 'California (EE.UU.)', efecto: 'Temporadas secas', icono: '🌵', tipo: 'sequia' },
  { zona: 'Este de EE.UU.', efecto: 'Inviernos más fríos', icono: '❄️', tipo: 'temperatura' },
  { zona: 'España (Península)', efecto: 'Inviernos más fríos y lluviosos', icono: '🌨️', tipo: 'lluvia' },
  { zona: 'Filipinas', efecto: 'Mayor actividad tropical', icono: '🌀', tipo: 'lluvia' },
  { zona: 'Cuerno de África', efecto: 'Más lluvias', icono: '🌧️', tipo: 'lluvia' },
];

interface EventoENSO {
  anio: string;
  tipo: 'nino' | 'nina';
  intensidad: 'moderado' | 'fuerte' | 'muy_fuerte';
  descripcion: string;
}

const EVENTOS_HISTORICOS: EventoENSO[] = [
  { anio: '1972-73', tipo: 'nino', intensidad: 'fuerte', descripcion: 'Colapso pesquero en Perú' },
  { anio: '1982-83', tipo: 'nino', intensidad: 'muy_fuerte', descripcion: 'El más intenso del s.XX hasta entonces' },
  { anio: '1988-89', tipo: 'nina', intensidad: 'fuerte', descripcion: 'Sequía en EE.UU., inundaciones en Bangladesh' },
  { anio: '1997-98', tipo: 'nino', intensidad: 'muy_fuerte', descripcion: 'Récord histórico hasta 2015' },
  { anio: '1999-00', tipo: 'nina', intensidad: 'moderado', descripcion: 'Seguida inmediatamente al Niño 97-98' },
  { anio: '2010-11', tipo: 'nina', intensidad: 'fuerte', descripcion: 'Inundaciones históricas en Australia' },
  { anio: '2015-16', tipo: 'nino', intensidad: 'muy_fuerte', descripcion: 'Igualó récord 1997-98' },
  { anio: '2021-22', tipo: 'nina', intensidad: 'moderado', descripcion: 'Triple La Niña (2020-2023)' },
  { anio: '2023-24', tipo: 'nino', intensidad: 'muy_fuerte', descripcion: 'El más intenso registrado' },
];

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PacificoDiagram({ modo }: { modo: 'normal' | 'elnino' | 'lanina' }) {
  const aguaCalienteX = modo === 'elnino' ? 50 : modo === 'lanina' ? 15 : 25;
  const aguaCalienteAncho = modo === 'elnino' ? 45 : modo === 'lanina' ? 30 : 35;
  const nubeX = modo === 'elnino' ? 55 : modo === 'lanina' ? 15 : 20;
  const vientoIntensidad = modo === 'lanina' ? 'Fuertes →' : modo === 'elnino' ? 'Débiles ⇢' : 'Alisios →';
  const tempEste = modo === 'elnino' ? '+3°C' : modo === 'lanina' ? '-2°C' : '22°C';
  const tempOeste = modo === 'elnino' ? '+1°C' : modo === 'lanina' ? '+0.5°C' : '30°C';
  const colorEste = modo === 'elnino' ? '#FF6B35' : modo === 'lanina' ? '#1E88E5' : '#42A5F5';
  const colorOeste = modo === 'elnino' ? '#FF4444' : modo === 'lanina' ? '#FF7043' : '#FF5722';

  return (
    <div className={styles.svgWrapper} role="img" aria-label={`Diagrama del Pacífico en condiciones ${modo}`}>
      <svg viewBox="0 0 500 200" className={styles.pacificSvg} aria-hidden="true">
        {/* Fondo océano */}
        <defs>
          <linearGradient id={`gradOcean-${modo}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={colorEste} stopOpacity="0.3" />
            <stop offset={`${aguaCalienteX}%`} stopColor={colorEste} stopOpacity="0.15" />
            <stop offset={`${aguaCalienteX + aguaCalienteAncho}%`} stopColor={colorOeste} stopOpacity="0.35" />
            <stop offset="100%" stopColor={colorOeste} stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Océano */}
        <rect x="50" y="80" width="400" height="80" rx="4" fill={`url(#gradOcean-${modo})`} stroke="#ccc" strokeWidth="1" />

        {/* Etiquetas continentes */}
        <text x="55" y="72" fontSize="11" fontWeight="bold" fill="var(--text-primary)">PERÚ / ECUADOR</text>
        <text x="380" y="72" fontSize="11" fontWeight="bold" fill="var(--text-primary)">INDONESIA</text>

        {/* Temperaturas */}
        <text x="60" y="125" fontSize="12" fontWeight="bold" fill={colorEste}>{tempEste}</text>
        <text x="400" y="125" fontSize="12" fontWeight="bold" fill={colorOeste}>{tempOeste}</text>

        {/* Upwelling (solo en normal y La Niña) */}
        {modo !== 'elnino' && (
          <>
            <line x1="75" y1="160" x2="75" y2="120" stroke="#1E88E5" strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrowUp)" />
            <text x="55" y="175" fontSize="9" fill="#1E88E5">upwelling</text>
          </>
        )}

        {/* Nube con lluvia */}
        <ellipse cx={`${nubeX + 10}%`} cy="45" rx="30" ry="15" fill="#B0BEC5" opacity="0.85" />
        <ellipse cx={`${nubeX + 14}%`} cy="38" rx="22" ry="13" fill="#CFD8DC" opacity="0.9" />
        {[0, 8, 16].map((offset, i) => (
          <line key={i} x1={`${nubeX * 5 + 15 + offset}`} y1="60" x2={`${nubeX * 5 + 13 + offset}`} y2="72" stroke="#64B5F6" strokeWidth="1.5" />
        ))}

        {/* Sol (subsidencia, lado seco) */}
        {modo !== 'elnino' && (
          <text x="390" y="48" fontSize="22" aria-hidden="true">☀️</text>
        )}
        {modo === 'elnino' && (
          <text x="60" y="48" fontSize="22" aria-hidden="true">☀️</text>
        )}

        {/* Vientos alisios */}
        <defs>
          <marker id="arrowRight" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#546E7A" />
          </marker>
          <marker id="arrowLeft" markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto">
            <path d="M8,0 L8,6 L0,3 z" fill="#E53935" />
          </marker>
          <marker id="arrowUp" markerWidth="8" markerHeight="8" refX="3" refY="0" orient="auto">
            <path d="M0,8 L6,8 L3,0 z" fill="#1E88E5" />
          </marker>
        </defs>

        {/* Flecha vientos superficie (E→O) */}
        <line
          x1={modo === 'elnino' ? 340 : 380}
          y1="105"
          x2={modo === 'elnino' ? 160 : 130}
          y2="105"
          stroke={modo === 'elnino' ? '#999' : '#546E7A'}
          strokeWidth={modo === 'lanina' ? 3 : 2}
          strokeDasharray={modo === 'elnino' ? '5,3' : 'none'}
          markerEnd="url(#arrowRight)"
        />

        {/* Texto vientos */}
        <text x="200" y="100" fontSize="10" fill="#546E7A" textAnchor="middle">{vientoIntensidad}</text>

        {/* Célula Walker — arco superior retorno */}
        <path
          d="M 430 90 Q 250 20 90 90"
          fill="none"
          stroke="#78909C"
          strokeWidth="1.5"
          strokeDasharray="6,3"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

function TablaComparativa() {
  const filas = [
    { aspecto: 'Temp. Pacífico Este', normal: '~22°C (línea base)', nino: '+2°C a +5°C (anomalía)', nina: '-1°C a -3°C (anomalía)' },
    { aspecto: 'Vientos alisios', normal: 'Moderados, este→oeste', nino: 'Débiles o invertidos', nina: 'Más fuertes de lo normal' },
    { aspecto: 'Lluvias Indonesia', normal: 'Abundantes (convección)', nino: 'Sequía (lluvias al este)', nina: 'Muy abundantes, inundaciones' },
    { aspecto: 'Lluvias Perú/Ecuador', normal: 'Escasas (subsidencia)', nino: 'Torrenciales', nina: 'Muy escasas, sequía' },
    { aspecto: 'Australia', normal: 'Normal', nino: 'Sequía severa', nina: 'Lluvias e inundaciones' },
    { aspecto: 'España (invierno)', normal: 'Referencia estacional', nino: 'Más cálido y seco', nina: 'Más frío y lluvioso' },
  ];

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.comparativaTable} aria-label="Comparativa de condiciones ENSO">
        <thead>
          <tr>
            <th scope="col">Aspecto</th>
            <th scope="col" className={styles.normalCell}>Normal</th>
            <th scope="col" className={styles.ninoCell}>El Niño</th>
            <th scope="col" className={styles.niniaCell}>La Niña</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i}>
              <td className={styles.aspectoCell}>{fila.aspecto}</td>
              <td className={styles.normalCell}>{fila.normal}</td>
              <td className={styles.ninoCell}>{fila.nino}</td>
              <td className={styles.niniaCell}>{fila.nina}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimelineENSO() {
  return (
    <div className={styles.timelineContainer} role="list" aria-label="Eventos ENSO históricos">
      {EVENTOS_HISTORICOS.map((evento) => (
        <div
          key={evento.anio}
          role="listitem"
          className={`${styles.eventoBase} ${evento.tipo === 'nino' ? styles.eventoNino : styles.eventoNinia}`}
        >
          <span className={styles.eventoAnio}>{evento.anio}</span>
          <span className={styles.eventoTipo}>{evento.tipo === 'nino' ? '🔥 El Niño' : '❄️ La Niña'}</span>
          <span className={styles.eventoIntensidad}>
            {evento.intensidad === 'muy_fuerte' ? '★★★' : evento.intensidad === 'fuerte' ? '★★' : '★'}
          </span>
          <span className={styles.eventoDesc}>{evento.descripcion}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorElNino() {
  const [tabActiva, setTabActiva] = useState<TabId>('normal');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcon} aria-hidden="true">🌊</span>
          <h1>El Niño y La Niña: ENSO Explicado</h1>
          <p>
            Cómo un calentamiento del Pacífico tropical reorganiza el clima de todo el planeta: desde las sequías en
            Australia hasta los inviernos en España.
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Tabs de navegación */}
        <nav className={styles.tabs} aria-label="Secciones del visualizador ENSO">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActive : ''}`}
              onClick={() => setTabActiva(tab.id)}
              aria-pressed={tabActiva === tab.id}
              aria-label={`Ver sección: ${tab.titulo}`}
            >
              <span aria-hidden="true">{tab.icono}</span>
              <span className={styles.tabTitulo}>{tab.titulo}</span>
              <span className={styles.tabSub}>{tab.subtitulo}</span>
            </button>
          ))}
        </nav>

        {/* ── Tab 1: Normal ── */}
        {tabActiva === 'normal' && (
          <section className={styles.content} aria-labelledby="tab-normal-titulo">
            <h2 id="tab-normal-titulo" className={styles.sectionTitle}>
              🌊 Condiciones Normales (Estado Neutral)
            </h2>
            <p className={styles.intro}>
              En condiciones de referencia, los vientos alisios soplan de este a oeste a lo largo del Pacífico tropical.
              Esta circulación, llamada <strong>célula de Walker</strong>, mantiene el equilibrio climático global.
            </p>

            <PacificoDiagram modo="normal" />

            <div className={styles.mecanismosGrid}>
              <div className={styles.mecanismoCard}>
                <h3>💨 Vientos Alisios</h3>
                <p>
                  Soplan de este a oeste de forma estable. Arrastran la capa superficial de agua cálida hacia el Pacífico
                  Occidental (Indonesia, Filipinas, norte de Australia).
                </p>
              </div>
              <div className={styles.mecanismoCard}>
                <h3>🌊 Surgencia (Upwelling)</h3>
                <p>
                  En la costa de Perú y Ecuador, el arrastre del agua superficial crea un vacío que se rellena con agua
                  fría y rica en nutrientes procedente de capas profundas. Es la base de uno de los caladeros más
                  productivos del mundo.
                </p>
              </div>
              <div className={styles.mecanismoCard}>
                <h3>🌧️ Convección Tropical</h3>
                <p>
                  El agua cálida (~29-30°C) del Pacífico Occidental evapora enormes cantidades de vapor de agua, que sube
                  formando sistemas de convección profunda. Es la fuente de lluvias de Indonesia, Melanesia y norte de
                  Australia.
                </p>
              </div>
              <div className={styles.mecanismoCard}>
                <h3>☀️ Subsidencia en el Este</h3>
                <p>
                  El aire que sube en el Oeste diverge en altura, cruza el Pacífico y desciende sobre Perú y Ecuador,
                  creando condiciones de subsidencia (cielos despejados, poca lluvia). El ciclo vuelve a empezar.
                </p>
              </div>
            </div>

            <div className={styles.datosDestacados}>
              <div className={styles.dato}>
                <span className={styles.datoNumero}>~8°C</span>
                <span className={styles.datoLabel}>Diferencia de temperatura entre el Pacífico Este y Oeste</span>
              </div>
              <div className={styles.dato}>
                <span className={styles.datoNumero}>200 m</span>
                <span className={styles.datoLabel}>Profundidad típica de la termoclina en el Pacífico Tropical</span>
              </div>
              <div className={styles.dato}>
                <span className={styles.datoNumero}>2-7 años</span>
                <span className={styles.datoLabel}>Periodo de retorno irregular del ciclo ENSO</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Tab 2: El Niño ── */}
        {tabActiva === 'elnino' && (
          <section className={styles.content} aria-labelledby="tab-elnino-titulo">
            <h2 id="tab-elnino-titulo" className={styles.sectionTitle}>
              🔥 El Niño — Calentamiento del Pacífico Central y Este
            </h2>
            <p className={styles.intro}>
              Cada 2-7 años, los vientos alisios se debilitan. El agua cálida acumulada en el oeste se desplaza hacia el
              centro y este del Pacífico. La circulación Walker se colapsa y el mundo entero lo nota.
            </p>

            <PacificoDiagram modo="elnino" />

            <div className={styles.cambiosNino}>
              <h3>¿Qué cambia durante El Niño?</h3>
              <ul className={styles.cambiosList}>
                <li>Los vientos alisios se debilitan o invierten su dirección</li>
                <li>Anomalía de temperatura superficial de <strong>+2°C a +5°C</strong> en el Pacífico Central (región Niño 3.4)</li>
                <li>La termoclina se hunde en el Pacífico Este, suprimiendo el upwelling peruano</li>
                <li>La zona de convección profunda migra del Oeste hacia el Centro del Pacífico</li>
                <li>El colapso pesquero en Perú: sin agua fría, las anchovetas desaparecen</li>
                <li>La temperatura media global del planeta sube (el calor oceánico se libera a la atmósfera)</li>
              </ul>
            </div>

            <h3 className={styles.teleconexTitulo}>Teleconexiones globales de El Niño</h3>
            <div className={styles.teleconexGrid}>
              {TELECONEXIONES_NINO.map((tc, i) => (
                <div key={i} className={`${styles.teleconexCard} ${styles.ninoCard}`}>
                  <span className={styles.teleconexIcono} aria-hidden="true">{tc.icono}</span>
                  <div>
                    <strong>{tc.zona}</strong>
                    <p>{tc.efecto}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.warningBox}>
              <span aria-hidden="true">📌</span>
              <div>
                <strong>Eventos históricos extremos</strong>
                <p>
                  El Niño de 1997-98 causó más de 2.000 muertes y pérdidas económicas de 33.000 millones de dólares a nivel
                  mundial. El de 2015-16 igualó su intensidad. El de 2023-24 fue el más cálido jamás registrado.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Tab 3: La Niña ── */}
        {tabActiva === 'lanina' && (
          <section className={styles.content} aria-labelledby="tab-lanina-titulo">
            <h2 id="tab-lanina-titulo" className={styles.sectionTitle}>
              ❄️ La Niña — El Opuesto de El Niño
            </h2>
            <p className={styles.intro}>
              La Niña es el polo opuesto del ciclo ENSO. Los vientos alisios se intensifican por encima de lo normal,
              el upwelling peruano aumenta, y el Pacífico Este se enfría por debajo de su media histórica.
            </p>

            <PacificoDiagram modo="lanina" />

            <div className={styles.cambiosNino}>
              <h3>¿Qué cambia durante La Niña?</h3>
              <ul className={styles.cambiosList}>
                <li>Los vientos alisios son más fuertes que en condiciones normales</li>
                <li>Anomalía de temperatura de <strong>-1°C a -3°C</strong> en el Pacífico Este</li>
                <li>La termoclina asciende en el este, intensificando el upwelling</li>
                <li>La convección tropical queda más concentrada sobre Indonesia y Filipinas</li>
                <li>Mayor actividad de ciclones tropicales en el Atlántico durante el otoño</li>
                <li>Tendencia a enfriar ligeramente la temperatura media global</li>
              </ul>
            </div>

            <h3 className={styles.teleconexTitulo}>Teleconexiones globales de La Niña</h3>
            <div className={styles.teleconexGrid}>
              {TELECONEXIONES_NINA.map((tc, i) => (
                <div key={i} className={`${styles.teleconexCard} ${styles.niniaCard}`}>
                  <span className={styles.teleconexIcono} aria-hidden="true">{tc.icono}</span>
                  <div>
                    <strong>{tc.zona}</strong>
                    <p>{tc.efecto}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className={styles.comparativaTitulo}>Tabla comparativa: Normal vs El Niño vs La Niña</h3>
            <TablaComparativa />
          </section>
        )}

        {/* ── Tab 4: Predicción ENSO ── */}
        {tabActiva === 'prediccion' && (
          <section className={styles.content} aria-labelledby="tab-prediccion-titulo">
            <h2 id="tab-prediccion-titulo" className={styles.sectionTitle}>
              📊 Predicción y Seguimiento del ENSO
            </h2>
            <p className={styles.intro}>
              ENSO es el sistema climático más predecible del planeta a escala estacional... pero solo hasta 6-9 meses de
              antelación. Más allá de ese horizonte, la incertidumbre crece exponencialmente.
            </p>

            <div className={styles.indicesGrid}>
              <div className={styles.indiceCard}>
                <h3>🔵 Índice SOI</h3>
                <p className={styles.indiceSubtitulo}>Southern Oscillation Index</p>
                <p>
                  Diferencia de presión atmosférica entre Tahití (alta presión) y Darwin, Australia (baja presión).
                </p>
                <div className={styles.indiceValores}>
                  <span className={styles.valorNino}>SOI {'<'} 0 → El Niño 🔥</span>
                  <span className={styles.valorNinia}>SOI {'>'} 0 → La Niña ❄️</span>
                </div>
              </div>
              <div className={styles.indiceCard}>
                <h3>🟠 Índice ONI</h3>
                <p className={styles.indiceSubtitulo}>Oceanic Niño Index</p>
                <p>
                  Anomalía de temperatura superficial del mar en la región Niño 3.4 (Pacífico Central), promedio de 3
                  meses consecutivos.
                </p>
                <div className={styles.indiceValores}>
                  <span className={styles.valorNino}>ONI {'≥'} +0.5°C × 5 meses → El Niño 🔥</span>
                  <span className={styles.valorNinia}>ONI {'≤'} -0.5°C × 5 meses → La Niña ❄️</span>
                </div>
              </div>
            </div>

            <h3 className={styles.timelineTitulo}>Eventos ENSO históricos destacados</h3>
            <TimelineENSO />

            <div className={styles.modelosCard}>
              <h3>🤖 Modelos de predicción</h3>
              <p>
                La NOAA y el IRI (International Research Institute) publican mensualmente los resultados de 20+ modelos
                acoplados océano-atmósfera. Los modelos dinámicos calculan la evolución física del sistema; los
                estadísticos buscan patrones históricos. La combinación (ensemble) da la mejor estimación.
              </p>
              <p>
                La <strong>&quot;barrera de predictibilidad de primavera&quot;</strong> (spring predictability barrier) es
                una limitación real: los modelos tienen menos capacidad de predicción cuando se inicializan en
                marzo-abril, porque la variabilidad natural es máxima entonces.
              </p>
            </div>

            <div className={styles.espanaCard}>
              <h3>🇪🇸 Impacto de ENSO en España</h3>
              <p>
                España está demasiado lejos del Pacífico para recibir señales directas de ENSO. La influencia llega de
                forma <em>indirecta</em>, mediada principalmente por la <strong>Oscilación del Atlántico Norte (NAO)</strong>:
              </p>
              <ul className={styles.espanaList}>
                <li>El Niño tiende a favorecer una NAO negativa en invierno → bloqueo anticiclónico → inviernos más cálidos y secos en la Península</li>
                <li>La Niña tiende a favorecer NAO positiva o neutra → más flujo atlántico → inviernos más fríos y lluviosos</li>
                <li>La señal no es determinista: la correlación existe, pero hay mucha variabilidad de un año a otro</li>
                <li>El Mediterráneo oriental también responde: El Niño → más lluvias en la cuenca mediterránea oriental</li>
              </ul>
            </div>
          </section>
        )}

        {/* Sección educativa */}
        <EducationalSection title="Conceptos clave sobre ENSO" subtitle="Termoclina, upwelling, PDO y cambio climático">
          <div className={styles.educSection}>
            <h3>¿Qué es la termoclina?</h3>
            <p>
              La termoclina es la capa del océano donde la temperatura cambia más rápidamente con la profundidad. Separa
              la capa superficial cálida y bien mezclada (~100-200 m de profundidad) del agua fría y densa del fondo. En
              el Pacífico Tropical, la termoclina es más profunda en el Oeste (~200 m) y más somera en el Este (~50 m),
              lo que facilita el upwelling peruano. Durante El Niño, la termoclina se hunde en el Este, suprimiendo ese
              upwelling.
            </p>

            <h3>¿Por qué el upwelling es tan productivo?</h3>
            <p>
              El agua fría que sube desde las profundidades arrastra nutrientes (nitratos, fosfatos, silicatos) que en la
              superficie han sido consumidos por el fitoplancton. Al llegar a la zona fótica (donde penetra la luz solar),
              esos nutrientes disparan una explosión de vida: fitoplancton → zooplancton → anchoveta → atún, delfines,
              pingüinos, lobos marinos. La corriente de Humboldt frente a Perú-Chile es uno de los ecosistemas marinos
              más productivos del planeta.
            </p>

            <h3>ENSO vs PDO: ¿qué diferencia hay?</h3>
            <p>
              La <strong>PDO</strong> (Pacific Decadal Oscillation) es un patrón de variabilidad climática del Pacífico
              norte con una escala de tiempo de <em>décadas</em> (20-30 años), frente a los 2-7 años de ENSO. Cuando la
              PDO está en fase cálida, los eventos El Niño tienden a ser más frecuentes e intensos. Cuando está en fase
              fría, dominan La Niña. La PDO modula la &quot;frecuencia de fondo&quot; de ENSO, pero no lo causa
              directamente.
            </p>

            <h3>El cambio climático y ENSO</h3>
            <p>
              Los modelos climáticos sugieren que el cambio climático podría intensificar los eventos ENSO extremos,
              haciendo más frecuentes los El Niño y La Niña &quot;muy fuertes&quot;. Sin embargo, hay mucha
              incertidumbre: algunos modelos predicen mayor frecuencia de El Niño; otros, de La Niña. Lo que sí es más
              robusto es que un océano más cálido amplificará los impactos de cualquier evento ENSO sobre las
              precipitaciones y los fenómenos meteorológicos extremos.
            </p>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('visualizador-el-nino')} />
      <ShareCard appName="visualizador-el-nino" />
      <Footer appName="visualizador-el-nino" />
    </div>
  );
}
