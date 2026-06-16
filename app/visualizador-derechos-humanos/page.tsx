'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './DerechosHumanos.module.css';
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

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface Movimiento {
  nombre: string;
  anioInicio: number;
  anioFin: number;
  color: string;
  descripcion: string;
  obraIconica: string;
  paises: string[];
}

interface EventoHistorico {
  anio: number;
  texto: string;
}

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const MOVIMIENTOS: Movimiento[] = [
  { nombre: 'Magna Carta y Derecho Común', anioInicio: 1215, anioFin: 1700, color: '#5D4037', descripcion: 'La Magna Carta (1215) limita el poder real y garantiza derechos a los barones ingleses. Germen del estado de derecho y el due process que inspirará constituciones del mundo entero.', obraIconica: 'Magna Carta (1215)', paises: ['Inglaterra'] },
  { nombre: 'Habeas Corpus y Liberalismo Temprano', anioInicio: 1679, anioFin: 1789, color: '#1565C0', descripcion: 'El Habeas Corpus Act (1679) prohíbe la detención sin juicio. Locke teoriza los derechos naturales. Se sienta la base filosófica de los derechos individuales modernos.', obraIconica: 'Habeas Corpus Act (1679)', paises: ['Inglaterra'] },
  { nombre: 'Revolución Americana', anioInicio: 1776, anioFin: 1800, color: '#B71C1C', descripcion: 'La Declaración de Independencia proclama que todos los hombres son creados iguales. La Carta de Derechos (1791) garantiza libertades fundamentales por primera vez en una constitución nacional.', obraIconica: 'Declaración de Independencia (1776)', paises: ['EE.UU.'] },
  { nombre: 'Revolución Francesa y DDHH', anioInicio: 1789, anioFin: 1815, color: '#4527A0', descripcion: 'La Declaración de los Derechos del Hombre y del Ciudadano (1789) universaliza los derechos más allá de la nación. Libertad, igualdad y fraternidad como principios de gobierno.', obraIconica: 'Declaración DDHH francesa (agosto 1789)', paises: ['Francia'] },
  { nombre: 'Abolicionismo', anioInicio: 1783, anioFin: 1888, color: '#1B5E20', descripcion: 'Movimiento para abolir la esclavitud. Gran Bretaña abolió en 1833, EE.UU. en 1865 (13ª Enmienda), Brasil en 1888. Primera gran victoria de los derechos humanos a escala universal.', obraIconica: '13ª Enmienda de EE.UU. (1865)', paises: ['Reino Unido', 'EE.UU.', 'Brasil'] },
  { nombre: 'Movimiento Obrero', anioInicio: 1848, anioFin: 1940, color: '#E65100', descripcion: 'Las revoluciones de 1848 y la Primera Internacional Obrera impulsan derechos laborales. La OIT (1919) formaliza los primeros estándares internacionales del trabajo: jornada de 8 horas, no al trabajo infantil.', obraIconica: 'Creación de la OIT (1919)', paises: ['Europa', 'Global'] },
  { nombre: 'Sufragismo', anioInicio: 1848, anioFin: 1945, color: '#880E4F', descripcion: 'La Convención de Seneca Falls (1848) inicia el movimiento sufragista organizado. Nueva Zelanda concede el voto femenino en 1893. España en 1931, Francia en 1944, Suiza en 1971.', obraIconica: 'Declaración de Sentimientos de Seneca Falls (1848)', paises: ['Nueva Zelanda', 'EE.UU.', 'España', 'Global'] },
  { nombre: 'Sistema ONU de DDHH', anioInicio: 1945, anioFin: 9999, color: '#0D47A1', descripcion: 'La Carta de las Naciones Unidas (1945) y la Declaración Universal (1948) crean el primer sistema internacional permanente de protección de los derechos humanos.', obraIconica: 'Declaración Universal de Derechos Humanos (1948)', paises: ['Global'] },
  { nombre: 'Derechos Civiles y Descolonización', anioInicio: 1955, anioFin: 1980, color: '#004D40', descripcion: 'El Movimiento por los Derechos Civiles en EE.UU. y los procesos de descolonización en África y Asia expanden los derechos a escala planetaria. Rosa Parks, Luther King, Gandhi como figuras clave.', obraIconica: 'Ley de Derechos Civiles de EE.UU. (1964)', paises: ['EE.UU.', 'África', 'Asia'] },
  { nombre: 'Derechos de la Mujer e Igualdad', anioInicio: 1960, anioFin: 9999, color: '#AD1457', descripcion: 'La segunda ola feminista impulsa la igualdad de género. La CEDAW (1979) es el tratado internacional sobre derechos de la mujer. El movimiento #MeToo (2017) redefine el debate sobre acoso y violencia.', obraIconica: 'CEDAW — Convención sobre Eliminación de la Discriminación (1979)', paises: ['Global'] },
  { nombre: 'Derechos del Niño', anioInicio: 1959, anioFin: 9999, color: '#F57F17', descripcion: 'La Convención sobre los Derechos del Niño (1989) es el tratado de DDHH más ratificado de la historia: 196 países. Protege la educación, la salud y la protección contra explotación laboral.', obraIconica: 'Convención sobre los Derechos del Niño ONU (1989)', paises: ['Global'] },
  { nombre: 'Justicia Penal Internacional', anioInicio: 1945, anioFin: 9999, color: '#37474F', descripcion: 'Los Juicios de Núremberg (1945) establecen la responsabilidad individual por crímenes de guerra. El Estatuto de Roma (1998) crea la Corte Penal Internacional permanente en La Haya.', obraIconica: 'Estatuto de Roma — Corte Penal Internacional (1998)', paises: ['Global'] },
  { nombre: 'Derechos Digitales y Privacidad', anioInicio: 2016, anioFin: 9999, color: '#1A237E', descripcion: 'El GDPR europeo (2018) establece el derecho a la privacidad digital y el "derecho al olvido". La ONU reconoce el acceso a Internet como derecho humano. Debates crecientes sobre vigilancia masiva e IA.', obraIconica: 'GDPR — Reglamento General de Protección de Datos UE (2018)', paises: ['UE', 'Global'] },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1215, texto: 'Magna Carta: primer documento que limita el poder del rey en favor del ciudadano' },
  { anio: 1789, texto: 'Declaración de los Derechos del Hombre y del Ciudadano — Revolución Francesa' },
  { anio: 1848, texto: 'Convención de Seneca Falls — inicio organizado del movimiento sufragista' },
  { anio: 1865, texto: '13ª Enmienda — abolición de la esclavitud en EE.UU.' },
  { anio: 1919, texto: 'Fundación de la OIT — primeros estándares laborales internacionales' },
  { anio: 1948, texto: 'Asamblea General ONU aprueba la Declaración Universal de Derechos Humanos' },
  { anio: 1964, texto: 'Ley de Derechos Civiles de EE.UU. — ilegaliza la discriminación racial' },
  { anio: 1989, texto: 'Convención sobre los Derechos del Niño — tratado más ratificado de la historia' },
  { anio: 1998, texto: 'Estatuto de Roma — se crea la Corte Penal Internacional permanente' },
  { anio: 2018, texto: 'GDPR entra en vigor — modelo global de protección de datos personales' },
];

const ERAS: Era[] = [
  { nombre: 'Fundamentos medievales', desde: 1200, hasta: 1700, icono: '📜' },
  { nombre: 'Ilustración y Revoluciones', desde: 1700, hasta: 1850, icono: '🕯️' },
  { nombre: 'Abolicionismo y Sufragio', desde: 1850, hasta: 1920, icono: '✊' },
  { nombre: 'Sistema Internacional ONU', desde: 1920, hasta: 1960, icono: '🌐' },
  { nombre: 'Derechos Civiles globales', desde: 1960, hasta: 2000, icono: '✌️' },
  { nombre: 'Derechos Digitales', desde: 2000, hasta: 9999, icono: '💻' },
];

// ─────────────────────────────────────────────
// Panel de detalle (clic en SVG)
// ─────────────────────────────────────────────

function PanelDetalle({ movimiento }: { movimiento: Movimiento }) {
  const anioFinTexto = movimiento.anioFin === 9999 ? 'Presente' : movimiento.anioFin.toString();
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: movimiento.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: movimiento.color }}>{movimiento.nombre}</h3>
      <p className={styles.detallePeriodo}>{movimiento.anioInicio} – {anioFinTexto}</p>

      <div className={styles.detallePaises}>
        {movimiento.paises.map((p) => (
          <span key={p} className={styles.paisBadge}>{p}</span>
        ))}
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Documento / Hito clave</span>
        <p>{movimiento.obraIconica}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Descripción</span>
        <p>{movimiento.descripcion}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const ANO_INICIO_GLOBAL = 1200;
const ANO_FIN_GLOBAL = 2025;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - ANO_INICIO_GLOBAL) / (ANO_FIN_GLOBAL - ANO_INICIO_GLOBAL)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<Movimiento | null>(null);

  // Distribuir movimientos en filas para evitar solapamiento
  const filas: Movimiento[][] = [[], [], [], [], []];
  const ordenados = [...MOVIMIENTOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const mov of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      const anioFinUltimo = ultimoEnFila ? (ultimoEnFila.anioFin === 9999 ? ANO_FIN_GLOBAL : ultimoEnFila.anioFin) : 0;
      if (!ultimoEnFila || anioAX(anioFinUltimo) + 4 <= anioAX(mov.anioInicio)) {
        filas[f].push(mov);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(mov);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  // Marcadores de siglos
  const siglos: number[] = [];
  for (let s = 1300; s <= 2000; s += 100) siglos.push(s);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un movimiento para ver sus detalles.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de derechos humanos"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcadores de siglos */}
          {siglos.map((s) => (
            <g key={s}>
              <line x1={anioAX(s)} y1={FILA_OFFSET_Y} x2={anioAX(s)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(s)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{s}</text>
            </g>
          ))}

          {/* Rectángulos de movimientos */}
          {filas.map((fila, fi) =>
            fila.map((mov, mi) => {
              const anioFin = mov.anioFin === 9999 ? ANO_FIN_GLOBAL : mov.anioFin;
              const x = anioAX(mov.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.nombre === mov.nombre;

              return (
                <g key={`${fi}-${mi}`} onClick={() => setSeleccionado(esSeleccionado ? null : mov)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={mov.color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 60 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={9}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {mov.nombre.length > 22 ? mov.nombre.slice(0, 22) + '…' : mov.nombre}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {seleccionado && <PanelDetalle movimiento={seleccionado} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Movimiento en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const movimiento = MOVIMIENTOS[indice];
  const anioFinTexto = movimiento.anioFin === 9999 ? 'Presente' : movimiento.anioFin.toString();

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Movimiento en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {MOVIMIENTOS.map((mov, i) => (
          <button
            key={mov.nombre}
            type="button"
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: mov.color, borderColor: mov.color } : {}}
            aria-pressed={i === indice}
          >
            {mov.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: movimiento.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: movimiento.color }}>
          <h3>{movimiento.nombre}</h3>
          <p>{movimiento.anioInicio} – {anioFinTexto}</p>
          <div className={styles.detallePaisesBadges}>
            {movimiento.paises.map((p) => (
              <span key={p} className={styles.paisBadgeBlanco}>{p}</span>
            ))}
          </div>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Documento / Hito clave</span>
            <p>{movimiento.obraIconica}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Descripción</span>
            <p>{movimiento.descripcion}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          type="button"
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Movimiento anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {MOVIMIENTOS.length}</span>
        <button
          type="button"
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(MOVIMIENTOS.length - 1, i + 1))}
          disabled={indice === MOVIMIENTOS.length - 1}
          aria-label="Movimiento siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Comparativa
// ─────────────────────────────────────────────

function TabComparativa() {
  const [busqueda, setBusqueda] = useState('');

  const movimientosFiltrados = useMemo(() => {
    return MOVIMIENTOS.filter((mov) => {
      const termino = busqueda.toLowerCase();
      return !termino ||
        mov.nombre.toLowerCase().includes(termino) ||
        mov.paises.some((p) => p.toLowerCase().includes(termino)) ||
        mov.obraIconica.toLowerCase().includes(termino);
    });
  }, [busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por movimiento, país o documento..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar movimiento de derechos humanos"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Movimiento</th>
              <th>Período</th>
              <th>Derecho conquistado</th>
              <th>Documento clave</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((mov, i) => {
              const anioFinTexto = mov.anioFin === 9999 ? 'Presente' : mov.anioFin.toString();
              return (
                <tr
                  key={mov.nombre}
                  style={i % 2 === 0 ? { background: `${mov.color}18` } : {}}
                >
                  <td><strong style={{ color: mov.color }}>{mov.nombre}</strong></td>
                  <td>{mov.anioInicio}–{anioFinTexto}</td>
                  <td>{mov.descripcion.slice(0, 80)}…</td>
                  <td>{mov.obraIconica}</td>
                </tr>
              );
            })}
            {movimientosFiltrados.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.sinResultados}>Sin resultados para la búsqueda actual.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Contexto Histórico — vista por eras
// ─────────────────────────────────────────────

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Movimientos y eventos de derechos humanos organizados por eras históricas.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const movimientosEra = MOVIMIENTOS.filter(
            (m) => m.anioInicio < era.hasta && (m.anioFin === 9999 || m.anioFin > era.desde)
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && (era.hasta === 9999 ? true : ev.anio < era.hasta)
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>
                    {era.desde} – {era.hasta === 9999 ? 'hoy' : era.hasta}
                  </span>
                </div>
              </div>

              {movimientosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {movimientosEra.map((m) => (
                    <span
                      key={m.nombre}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${m.color}1A`, color: m.color, borderColor: `${m.color}55` }}
                    >
                      {m.nombre}
                    </span>
                  ))}
                </div>
              )}

              {eventosEra.length > 0 && (
                <ul className={styles.eraEventos}>
                  {eventosEra.map((ev) => (
                    <li key={ev.anio} className={styles.eraEvento}>
                      <span className={styles.eraEventoAnio}>{ev.anio}</span>
                      <span className={styles.eraEventoTexto}>{ev.texto}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function DerechosHumanos() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Movimiento en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia de los Derechos Humanos</h1>
        <p className={styles.heroSubtitle}>
          De la Magna Carta a los derechos digitales — cronología interactiva de 13 movimientos, tratados y hitos que transformaron la protección de los derechos humanos
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tabActiva === tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.tabContent} role="tabpanel">
          {tabActiva === 'timeline' && <TabTimeline />}
          {tabActiva === 'detalle' && <TabDetalle />}
          {tabActiva === 'comparativa' && <TabComparativa />}
          {tabActiva === 'contexto' && <TabContexto />}
        </div>
      </main>

      <EducationalSection
        title="¿Cómo han evolucionado los derechos humanos a lo largo de la historia?"
        subtitle="De los primeros límites al poder medieval a la protección digital del siglo XXI"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Cronología comparativa: movimientos clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Movimiento</th>
                <th>Período</th>
                <th>Derecho conquistado</th>
                <th>Documento clave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Magna Carta</strong></td>
                <td>1215–1700</td>
                <td>Límite del poder real, due process</td>
                <td>Magna Carta (1215)</td>
              </tr>
              <tr>
                <td><strong>Abolicionismo</strong></td>
                <td>1783–1888</td>
                <td>Prohibición de la esclavitud</td>
                <td>13ª Enmienda de EE.UU. (1865)</td>
              </tr>
              <tr>
                <td><strong>Sufragismo</strong></td>
                <td>1848–1945</td>
                <td>Derecho al voto femenino</td>
                <td>Convención de Seneca Falls (1848)</td>
              </tr>
              <tr>
                <td><strong>Sistema ONU</strong></td>
                <td>1945–hoy</td>
                <td>Sistema internacional de protección</td>
                <td>Declaración Universal DDHH (1948)</td>
              </tr>
              <tr>
                <td><strong>Derechos Digitales</strong></td>
                <td>2016–hoy</td>
                <td>Privacidad y acceso a Internet</td>
                <td>GDPR UE (2018)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Casos de Uso */}
        <h3>¿Para quién es útil este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">⚖️</span>
            <div>
              <strong>Estudiante de derecho</strong>
              <p>Contextualiza la evolución de los tratados internacionales, desde el habeas corpus hasta la Corte Penal Internacional, para preparar exámenes o trabajos académicos.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">✊</span>
            <div>
              <strong>Activista de derechos humanos</strong>
              <p>Conecta la lucha actual con los precedentes históricos: sufragismo, abolicionismo y derechos civiles como inspiración y marco de referencia.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📰</span>
            <div>
              <strong>Periodista</strong>
              <p>Sitúa en perspectiva histórica las noticias sobre conflictos, legislación y violaciones de derechos humanos con datos cronológicos precisos.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
            <div>
              <strong>Ciudadano interesado en historia política</strong>
              <p>Comprende cómo se han conquistado los derechos que hoy damos por sentado y qué movimientos sociales los hicieron posibles.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué es la Declaración Universal de DDHH y quién la redactó?</strong>
            <p>La Declaración Universal de Derechos Humanos fue aprobada por la Asamblea General de las Naciones Unidas el 10 de diciembre de 1948. Fue redactada por un comité presidido por Eleanor Roosevelt e integrado por representantes de 18 países. Enuncia 30 artículos que cubren derechos civiles, políticos, económicos, sociales y culturales.</p>
            <span className={styles.faqTip}>El 10 de diciembre se celebra el Día Internacional de los Derechos Humanos en su conmemoración.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre DDHH y derechos civiles?</strong>
            <p>Los derechos humanos son universales e inherentes a toda persona por el hecho de serlo, reconocidos en el derecho internacional (tratados de la ONU). Los derechos civiles son los derechos que un Estado reconoce a sus ciudadanos y residentes, garantizados por la constitución o leyes nacionales. Un país puede violar los DDHH aunque sus leyes civiles sean formalmente correctas.</p>
            <span className={styles.faqTip}>Ejemplo: la segregación racial en EE.UU. era legal (derecho civil nacional) pero violaba los DDHH internacionales.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Son los derechos humanos aplicables en todos los países?</strong>
            <p>En teoría sí, pues se basan en el principio de universalidad. En la práctica, los Estados que ratifican los tratados asumen obligaciones jurídicas, pero el cumplimiento depende de mecanismos de supervisión internacionales (Consejo de Derechos Humanos de la ONU, Corte Penal Internacional) que tienen capacidad coercitiva limitada. El cumplimiento real varía enormemente entre países.</p>
            <span className={styles.faqTip}>195 países han ratificado la Convención sobre los Derechos del Niño, la más ratificada de la historia.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el derecho al olvido?</strong>
            <p>El derecho al olvido (o derecho a la supresión) permite a una persona solicitar que ciertos datos personales sean eliminados de bases de datos y resultados de búsqueda cuando ya no son relevantes o necesarios. Fue reconocido por el Tribunal de Justicia de la UE en 2014 y codificado en el GDPR de 2018. Es uno de los nuevos derechos fundamentales de la era digital.</p>
            <span className={styles.faqTip}>Google recibió más de 5 millones de solicitudes de derecho al olvido entre 2014 y 2023.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué derechos humanos están bajo amenaza hoy?</strong>
            <p>En 2025, los principales DDHH en riesgo incluyen: la libertad de prensa (más de 550 periodistas encarcelados según RSF), el derecho de asilo (creciente endurecimiento de políticas migratorias en Europa y EE.UU.), la privacidad digital (vigilancia masiva estatal), los derechos LGTBI+ en países con legislación restrictiva, y los derechos relacionados con el cambio climático y el derecho a un medioambiente sano.</p>
            <span className={styles.faqTip}>La ONU reconoció en 2022 el derecho a un medioambiente limpio, saludable y sostenible como derecho humano universal.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>5 pasos para comprender la evolución de los derechos humanos</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el punto de partida: derechos como privilegio</strong>
              <p>Antes del siglo XIII, no existía el concepto moderno de derechos inherentes. El poder era absoluto y los privilegios dependían del rango social. La Magna Carta fue el primer freno jurídico al poder arbitrario, aunque solo protegía a los barones, no al pueblo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Comprende la Ilustración como salto filosófico</strong>
              <p>Locke, Rousseau y Voltaire transformaron los privilegios en derechos naturales inherentes a todo ser humano por razón de su humanidad. La Revolución Francesa y la Americana tradujeron esa filosofía en constituciones y declaraciones concretas por primera vez.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Sigue el patrón: lucha social → norma jurídica</strong>
              <p>Abolicionismo, sufragismo, movimiento obrero y derechos civiles comparten el mismo patrón: primero una movilización social que visibiliza la injusticia, después una respuesta legislativa nacional y finalmente la codificación en tratados internacionales. No hay tratado sin lucha previa.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Analiza el sistema ONU como arquitectura permanente</strong>
              <p>Tras el Holocausto y la Segunda Guerra Mundial, la comunidad internacional decidió crear un sistema permanente supranacional. La DUDH (1948), los Pactos de 1966, la CEDAW (1979), la CDN (1989) y el Estatuto de Roma (1998) son los pilares de esa arquitectura que continúa expandiéndose.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Conecta el presente con los retos emergentes</strong>
              <p>Los derechos digitales, el derecho al medioambiente y los derechos frente a la inteligencia artificial son los nuevos frentes. La historia de los DDHH muestra que cada nueva amenaza tecnológica o social genera eventualmente una respuesta jurídica: así ocurrió con la industrialización (derechos laborales) y así está ocurriendo con la digitalización.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para usar esta cronología</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Empieza por la pestaña &quot;Contexto Histórico&quot; para situar cada era antes de explorar los movimientos en detalle. El contexto geopolítico explica por qué surgen los derechos cuando surgen.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <p>Fíjate en los solapamientos de la línea del tiempo: abolicionismo y sufragismo convivieron décadas, y el movimiento obrero y los derechos civiles se reforzaron mutuamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <p>Usa la tabla comparativa para relacionar cada movimiento con su documento fundacional: la historia de los DDHH es también la historia de los textos jurídicos que la plasmaron.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>Observa la columna de países: los derechos han tenido velocidades muy distintas en diferentes partes del mundo. La universalidad es un objetivo en construcción, no un hecho consumado.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores comunes al estudiar derechos humanos</strong>
          <ul>
            <li>Confundir <strong>derechos humanos con derechos constitucionales</strong>: los primeros son universales e inherentes, los segundos dependen del país y su constitución. Un Estado puede tener una constitución que no garantice todos los DDHH internacionales.</li>
            <li>Creer que la <strong>Declaración Universal de 1948 es vinculante</strong>: es una declaración política, no un tratado jurídicamente obligatorio. Los Pactos Internacionales de 1966 (Civiles y Políticos; Económicos, Sociales y Culturales) sí crean obligaciones jurídicas para los estados que los ratifican.</li>
            <li>Pensar que los derechos son <strong>conquistas permanentes e irreversibles</strong>: la historia muestra retrocesos. Derechos conquistados pueden ser erosionados mediante legislación regresiva, estados de excepción o cambios de régimen político.</li>
            <li>Asumir que la <strong>Corte Penal Internacional tiene jurisdicción universal</strong>: solo puede juzgar a ciudadanos de estados que hayan ratificado el Estatuto de Roma (123 de 195), o casos remitidos por el Consejo de Seguridad de la ONU.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-derechos-humanos')} />
      <ShareCard appName="visualizador-derechos-humanos" />
      <Footer appName="visualizador-derechos-humanos" />
    </div>
  );
}
