'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './RevolucionesIndustriales.module.css';
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

type EraId = 'preindustrial' | 'primera' | 'segunda' | 'tercera' | 'industria4' | 'industria5';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface Movimiento {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  color: string;
  descripcion: string;
  obraIconica: string;
  paises: string[];
  eraId: EraId;
}

interface EventoHistorico {
  anio: number;
  texto: string;
}

interface Era {
  id: EraId;
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const MOVIMIENTOS: Movimiento[] = [
  { id: 'manufactura', nombre: 'Manufactura Preindustrial', anioInicio: 1400, anioFin: 1760, color: '#795548', descripcion: 'Sistema de producción artesanal organizado en gremios. La especialización y los viajes de aprendizaje transfieren el conocimiento técnico entre generaciones. Base de la Europa medieval y renacentista.', obraIconica: 'Estatutos del Gremio de Tejedores de Lana (York, 1400)', paises: ['Europa'], eraId: 'preindustrial' },
  { id: 'primera-rev', nombre: 'Primera Revolución Industrial', anioInicio: 1760, anioFin: 1840, color: '#5D4037', descripcion: 'Mecanización de la industria textil con la spinning jenny (1764) y el telar mecánico. La máquina de vapor de Watt (1769) proporciona energía sin depender del agua o el viento. Nace la fábrica moderna.', obraIconica: 'Máquina de vapor de James Watt (1769)', paises: ['Reino Unido'], eraId: 'primera' },
  { id: 'ferrocarril', nombre: 'Era del Ferrocarril', anioInicio: 1825, anioFin: 1900, color: '#4E342E', descripcion: 'El ferrocarril Stockton–Darlington (1825) inaugura el transporte masivo de personas y mercancías. En 1870 hay 210.000 km de vías en el mundo. El ferrocarril unifica naciones y mercados.', obraIconica: 'Ferrocarril Stockton–Darlington (1825)', paises: ['Reino Unido', 'EE.UU.', 'Europa'], eraId: 'primera' },
  { id: 'segunda-rev', nombre: 'Segunda Revolución Industrial', anioInicio: 1870, anioFin: 1914, color: '#1565C0', descripcion: 'Electricidad, acero Bessemer, motor de combustión interna y química industrial. EE.UU. y Alemania superan a Gran Bretaña. Surgen las grandes corporaciones y los monopolios industriales.', obraIconica: 'Sistema eléctrico de Edison en Manhattan (1882)', paises: ['EE.UU.', 'Alemania'], eraId: 'segunda' },
  { id: 'fordismo', nombre: 'Producción en Serie — Fordismo', anioInicio: 1913, anioFin: 1970, color: '#F57F17', descripcion: 'Henry Ford introduce la cadena de montaje (1913), reduciendo el tiempo de fabricación del Model T de 12 horas a 93 minutos. El taylorismo organiza el trabajo científicamente y maximiza la productividad.', obraIconica: 'Cadena de montaje Ford en Highland Park (1913)', paises: ['EE.UU.'], eraId: 'segunda' },
  { id: 'petroquimica', nombre: 'Industria Petroquímica y Plásticos', anioInicio: 1900, anioFin: 9999, color: '#37474F', descripcion: 'El petróleo y sus derivados (plásticos, fertilizantes, medicamentos) transforman la industria y la vida cotidiana. La Bakelita (1907) inaugura la era del plástico sintético.', obraIconica: 'Bakelita — primer plástico sintético (1907)', paises: ['EE.UU.', 'Europa'], eraId: 'segunda' },
  { id: 'tercera-rev', nombre: 'Tercera Revolución Industrial', anioInicio: 1945, anioFin: 2000, color: '#1B5E20', descripcion: 'El transistor (1947), el microprocesador (1971) y el software transforman la producción. La automatización y la robótica desplazan el trabajo manual repetitivo en las fábricas.', obraIconica: 'Transistor de los Laboratorios Bell (1947)', paises: ['EE.UU.', 'Japón', 'Global'], eraId: 'tercera' },
  { id: 'robotica', nombre: 'Automatización Robótica', anioInicio: 1961, anioFin: 9999, color: '#006064', descripcion: 'Unimate (1961) es el primer robot industrial en General Motors. Japón lidera la robótica industrial en los 80-90. Los cobots (robots colaborativos) emergen en los 2010s para trabajar junto a humanos.', obraIconica: 'Robot industrial Unimate en General Motors (1961)', paises: ['EE.UU.', 'Japón'], eraId: 'tercera' },
  { id: 'digital', nombre: 'Revolución Digital', anioInicio: 1969, anioFin: 9999, color: '#4527A0', descripcion: 'Internet (1969), el PC (1975), el software empresarial (ERP, CRM) y las plataformas digitales transforman todos los sectores económicos. La información se convierte en el principal activo productivo.', obraIconica: 'Apple Macintosh — PC personal masivo (1984)', paises: ['EE.UU.', 'Global'], eraId: 'tercera' },
  { id: 'globalizacion', nombre: 'Globalización Industrial', anioInicio: 1985, anioFin: 9999, color: '#00695C', descripcion: 'Las cadenas de valor globales redistribuyen la producción mundial. China se convierte en la "fábrica del mundo". Los contenedores marítimos y la logística global redefinen la industria manufacturera.', obraIconica: 'Entrada de China en la OMC (2001)', paises: ['China', 'Global'], eraId: 'industria4' },
  { id: 'industria4', nombre: 'Industria 4.0', anioInicio: 2011, anioFin: 9999, color: '#0277BD', descripcion: 'IoT industrial, impresión 3D, gemelos digitales y análisis de Big Data en fábricas inteligentes. El Foro Económico Mundial acuña el término "Cuarta Revolución Industrial" en el Davos de 2016.', obraIconica: 'Estrategia Industrie 4.0 de Alemania (2011)', paises: ['Alemania', 'Global'], eraId: 'industria4' },
  { id: 'ia-industria', nombre: 'IA e Industria', anioInicio: 2020, anioFin: 9999, color: '#6A1B9A', descripcion: 'Modelos de IA generativa aceleran el diseño, la investigación y la producción. Los robots autónomos con visión por computadora y razonamiento sustituyen trabajos cognitivos. Surge la "Industria 5.0".', obraIconica: 'ChatGPT y Copilot en entornos industriales (2023)', paises: ['EE.UU.', 'China', 'Global'], eraId: 'industria5' },
  { id: 'renovables', nombre: 'Energías Renovables', anioInicio: 2000, anioFin: 9999, color: '#558B2F', descripcion: 'La caída del coste de la energía solar (−90% entre 2010 y 2023) y el auge del hidrógeno verde apuntan a una revolución industrial baja en carbono que redefinirá la geopolítica energética global.', obraIconica: 'Paridad de red solar fotovoltaica (2014)', paises: ['Global'], eraId: 'industria5' },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1769, texto: 'James Watt patenta la máquina de vapor mejorada — motor de la 1ª Revolución' },
  { anio: 1793, texto: 'Eli Whitney inventa la desmotadora de algodón — dispara la producción textil' },
  { anio: 1825, texto: 'Primer ferrocarril público de vapor Stockton–Darlington en marcha' },
  { anio: 1882, texto: 'Edison inaugura la primera central eléctrica en Pearl Street, Nueva York' },
  { anio: 1913, texto: 'Ford introduce la cadena de montaje — transforma la industria mundial' },
  { anio: 1947, texto: 'Invención del transistor en los Laboratorios Bell — inicio de la era electrónica' },
  { anio: 1971, texto: 'Intel lanza el microprocesador 4004 — nace la computación personal' },
  { anio: 2001, texto: 'China entra en la OMC — consolida la globalización de la producción' },
  { anio: 2011, texto: 'Alemania lanza la estrategia Industrie 4.0 — nace la fábrica inteligente' },
  { anio: 2023, texto: 'IA generativa entra en los flujos de trabajo industrial y de diseño' },
];

const ERAS: Era[] = [
  { id: 'preindustrial', nombre: 'Preindustrial', desde: 1400, hasta: 1760, icono: '⚒️' },
  { id: 'primera', nombre: '1ª Revolución Industrial', desde: 1760, hasta: 1870, icono: '🏭' },
  { id: 'segunda', nombre: '2ª Revolución Industrial', desde: 1870, hasta: 1945, icono: '⚡' },
  { id: 'tercera', nombre: '3ª Revolución Industrial', desde: 1945, hasta: 2000, icono: '💻' },
  { id: 'industria4', nombre: 'Industria 4.0', desde: 2000, hasta: 2020, icono: '🤖' },
  { id: 'industria5', nombre: 'Industria 5.0 e IA', desde: 2020, hasta: 9999, icono: '🧠' },
];

const ETIQUETAS_ERA: Record<EraId, string> = {
  preindustrial: 'Preindustrial',
  primera: '1ª Revolución',
  segunda: '2ª Revolución',
  tercera: '3ª Revolución',
  industria4: 'Industria 4.0',
  industria5: 'Industria 5.0',
};

const COLORES_ERA: Record<EraId, string> = {
  preindustrial: '#795548',
  primera: '#5D4037',
  segunda: '#1565C0',
  tercera: '#1B5E20',
  industria4: '#0277BD',
  industria5: '#6A1B9A',
};

// ─────────────────────────────────────────────
// Panel de detalle
// ─────────────────────────────────────────────

function PanelDetalle({ movimiento }: { movimiento: Movimiento }) {
  const anioFinTexto = movimiento.anioFin === 9999 ? 'Presente' : movimiento.anioFin.toString();
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: movimiento.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: movimiento.color }}>{movimiento.nombre}</h3>
      <p className={styles.detallePeriodo}>{movimiento.anioInicio} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_ERA[movimiento.eraId]}</span>

      <div className={styles.descripcionBox}>
        <p>{movimiento.descripcion}</p>
      </div>

      <div className={styles.paisesRow}>
        <h4 className={styles.detalleSubtitulo}>Países líderes</h4>
        <div className={styles.badgesRow}>
          {movimiento.paises.map((p) => (
            <span key={p} className={styles.paisBadge}>{p}</span>
          ))}
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Hito icónico</span>
        <p>{movimiento.obraIconica}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const ANO_INICIO_GLOBAL = 1400;
const ANO_FIN_GLOBAL = 2030;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anoAX(anio: number): number {
  return MARGEN_IZQ + ((anio - ANO_INICIO_GLOBAL) / (ANO_FIN_GLOBAL - ANO_INICIO_GLOBAL)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<Movimiento | null>(null);

  const filas: Movimiento[][] = [[], [], [], [], []];
  const ordenados = [...MOVIMIENTOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const mov of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anoAX(ultimoEnFila.anioFin === 9999 ? ANO_FIN_GLOBAL : ultimoEnFila.anioFin) + 4 <= anoAX(mov.anioInicio)) {
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

  const marcadores: number[] = [];
  for (let s = 1400; s <= 2030; s += 100) marcadores.push(s);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en una fase para ver sus detalles.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de las revoluciones industriales"
        >
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {marcadores.map((s) => (
            <g key={s}>
              <line x1={anoAX(s)} y1={FILA_OFFSET_Y} x2={anoAX(s)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anoAX(s)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{s}</text>
            </g>
          ))}

          {filas.map((fila, fi) =>
            fila.map((mov) => {
              const anioFin = mov.anioFin === 9999 ? ANO_FIN_GLOBAL : mov.anioFin;
              const x = anoAX(mov.anioInicio);
              const w = Math.max(anoAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === mov.id;

              return (
                <g key={mov.id} onClick={() => setSeleccionado(esSeleccionado ? null : mov)} style={{ cursor: 'pointer' }}>
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
                      {mov.nombre}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      <div className={styles.leyendaCategorias}>
        {(Object.keys(ETIQUETAS_ERA) as EraId[]).map((era) => (
          <span key={era} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: COLORES_ERA[era] }} aria-hidden="true" />
            {ETIQUETAS_ERA[era]}
          </span>
        ))}
      </div>

      {seleccionado && <PanelDetalle movimiento={seleccionado} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Fase en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const movimiento = MOVIMIENTOS[indice];
  const anioFinTexto = movimiento.anioFin === 9999 ? 'Presente' : movimiento.anioFin.toString();

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Fase en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {MOVIMIENTOS.map((mov, i) => (
          <button
            key={mov.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: mov.color, borderColor: mov.color } : {}}
          >
            {mov.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: movimiento.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: movimiento.color }}>
          <h3>{movimiento.nombre}</h3>
          <p>{movimiento.anioInicio} – {anioFinTexto}</p>
          <span>{ETIQUETAS_ERA[movimiento.eraId]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.descripcionBox}>
            <p>{movimiento.descripcion}</p>
          </div>

          <div className={styles.paisesRow}>
            <h4 className={styles.detalleSubtitulo}>Países líderes</h4>
            <div className={styles.badgesRow}>
              {movimiento.paises.map((p) => (
                <span key={p} className={styles.paisBadge}>{p}</span>
              ))}
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Hito icónico</span>
            <p>{movimiento.obraIconica}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Fase anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {MOVIMIENTOS.length}</span>
        <button
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(MOVIMIENTOS.length - 1, i + 1))}
          disabled={indice === MOVIMIENTOS.length - 1}
          aria-label="Fase siguiente"
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
  const [eraFiltro, setEraFiltro] = useState<EraId | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const movimientosFiltrados = useMemo(() => {
    return MOVIMIENTOS.filter((mov) => {
      const coincideEra = eraFiltro === 'todos' || mov.eraId === eraFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        mov.nombre.toLowerCase().includes(termino) ||
        mov.paises.some((p) => p.toLowerCase().includes(termino));
      return coincideEra && coincideBusqueda;
    });
  }, [eraFiltro, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          className={`${styles.filtroCatBtn} ${eraFiltro === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setEraFiltro('todos')}
        >
          Todas
        </button>
        {(Object.keys(ETIQUETAS_ERA) as EraId[]).map((era) => (
          <button
            key={era}
            className={`${styles.filtroCatBtn} ${eraFiltro === era ? styles.filtroCatBtnActivo : ''}`}
            onClick={() => setEraFiltro(era)}
            style={eraFiltro === era ? { background: COLORES_ERA[era], borderColor: COLORES_ERA[era] } : {}}
          >
            {ETIQUETAS_ERA[era]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por fase o país..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar fase industrial"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Fase</th>
              <th>Período</th>
              <th>Era</th>
              <th>Tecnología motriz</th>
              <th>Países líderes</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((mov, i) => {
              const anioFinTexto = mov.anioFin === 9999 ? 'Presente' : mov.anioFin.toString();
              return (
                <tr
                  key={mov.id}
                  style={i % 2 === 0 ? { background: `${mov.color}18` } : {}}
                >
                  <td><strong style={{ color: mov.color }}>{mov.nombre}</strong></td>
                  <td>{mov.anioInicio}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_ERA[mov.eraId]}22`, color: COLORES_ERA[mov.eraId] }}>
                      {ETIQUETAS_ERA[mov.eraId]}
                    </span>
                  </td>
                  <td>{mov.obraIconica.split('(')[0].trim()}</td>
                  <td>{mov.paises.join(', ')}</td>
                </tr>
              );
            })}
            {movimientosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.sinResultados}>Sin resultados para la búsqueda actual.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Contexto Histórico — eras
// ─────────────────────────────────────────────

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Fases industriales y eventos clave organizados por eras.
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
            <div key={era.id} className={styles.eraCard}>
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
                      key={m.id}
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

export default function RevolucionesIndustriales() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Fase en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Revoluciones Industriales</h1>
        <p className={styles.heroSubtitle}>
          De la máquina de vapor a la IA y la Industria 4.0 — cronología interactiva de 13 fases que transformaron la economía mundial
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
            <button
              key={tab.id}
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
        title="¿Qué son las revoluciones industriales y cómo han transformado el mundo?"
        subtitle="De la artesanía medieval a la inteligencia artificial: cómo cada oleada tecnológica redefinió el trabajo, la economía y la sociedad"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa: 5 fases clave de la industrialización</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Revolución</th>
                <th>Período</th>
                <th>Tecnología motriz</th>
                <th>Impacto en el trabajo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1ª Revolución Industrial</strong></td>
                <td>1760–1840</td>
                <td>Máquina de vapor, telares mecánicos</td>
                <td>Del taller artesanal a la fábrica; trabajo fabril masivo</td>
              </tr>
              <tr>
                <td><strong>2ª Revolución Industrial</strong></td>
                <td>1870–1914</td>
                <td>Electricidad, acero, motor de explosión</td>
                <td>División científica del trabajo (taylorismo); grandes empresas</td>
              </tr>
              <tr>
                <td><strong>Fordismo</strong></td>
                <td>1913–1970</td>
                <td>Cadena de montaje, producción en masa</td>
                <td>Trabajo repetitivo especializado; salarios altos, consumo masivo</td>
              </tr>
              <tr>
                <td><strong>3ª Revolución Industrial</strong></td>
                <td>1945–2000</td>
                <td>Transistor, ordenador, robot</td>
                <td>Automatización del trabajo repetitivo; auge del sector servicios</td>
              </tr>
              <tr>
                <td><strong>Industria 4.0</strong></td>
                <td>2011–hoy</td>
                <td>IoT, IA, Big Data, impresión 3D</td>
                <td>Fábricas inteligentes; nuevos perfiles digitales; trabajo híbrido</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Casos de Uso */}
        <h3>¿Para quién es útil este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
            <div>
              <strong>Estudiante de historia económica</strong>
              <p>Prepara exámenes de bachillerato o universidad visualizando la cronología, los países líderes y los inventos clave de cada revolución industrial en un único recurso.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏭</span>
            <div>
              <strong>Empresario que quiere entender la Industria 4.0</strong>
              <p>Contextualiza dónde se encuentra tu empresa en el ciclo histórico industrial y qué tecnologías caracterizan la siguiente ola de transformación productiva.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">👷</span>
            <div>
              <strong>Trabajador preocupado por la automatización</strong>
              <p>Entiende que cada revolución industrial ha destruido empleos obsoletos y creado nuevos perfiles. La historia ofrece contexto para leer el presente con perspectiva.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
            <div>
              <strong>Inversor en tecnología</strong>
              <p>Identifica los patrones históricos de adopción tecnológica: qué países lideraron cada revolución y qué sectores concentraron el capital en cada fase.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuántas revoluciones industriales ha habido?</strong>
            <p>Los historiadores suelen distinguir cuatro: la 1ª (vapor y textil, 1760), la 2ª (electricidad y acero, 1870), la 3ª (electrónica y automatización, 1945) y la 4ª o Industria 4.0 (IoT e IA, 2011). La "Industria 5.0" es un marco más reciente que enfatiza la colaboración humano-robot y la sostenibilidad, aunque no todos los expertos la reconocen como revolución plena.</p>
            <span className={styles.faqTip}>El Foro Económico Mundial popularizó el término "Cuarta Revolución Industrial" a partir de Davos 2016, aunque la estrategia Industrie 4.0 alemana data de 2011.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué comenzó la 1ª Revolución Industrial en el Reino Unido?</strong>
            <p>La confluencia de varios factores únicos: abundancia de carbón y hierro, sistema de patentes que protegía las inversiones, acceso marítimo global, mercado interior unificado sin aduanas internas, y una cultura de experimentación práctica impulsada por la Royal Society. Ni Francia ni España tenían la misma combinación en ese momento.</p>
            <span className={styles.faqTip}>En 1800, el Reino Unido producía más del 50% del hierro fundido del mundo. En 1850, su PIB industrial superaba al de toda la Europa continental combinada.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre la 3ª y la 4ª Revolución Industrial?</strong>
            <p>La 3ª (1945-2000) digitalizó procesos existentes: máquinas controladas por ordenador, robótica programable, ERP y automatización de oficina. La 4ª funde el mundo físico y digital mediante sensores IoT, gemelos digitales y IA que no solo ejecutan instrucciones sino que toman decisiones autónomas. La diferencia no es de grado sino de naturaleza: la 4ª crea sistemas que aprenden y se adaptan.</p>
            <span className={styles.faqTip}>Una fábrica de la 3ª Revolución ejecuta programas; una fábrica de la 4ª optimiza sus propios programas en tiempo real con datos de miles de sensores.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Destruye empleos la automatización?</strong>
            <p>Históricamente, cada revolución industrial ha destruido categorías laborales (tejedores artesanales, datilógrafos, operadores telefónicos) y creado nuevas categorías que no existían (mecánicos, programadores, gestores de e-commerce). El debate actual sobre la IA es si esta vez la velocidad del cambio superará la capacidad de adaptación del mercado laboral. La evidencia histórica sugiere que la transición existe pero el resultado neto ha sido positivo en términos de empleo total.</p>
            <span className={styles.faqTip}>El teléfono destruyó el empleo de los mensajeros telégraficos. Pero el propio teléfono creó cientos de miles de puestos de operadora, técnico e instalador durante décadas.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la Industria 5.0?</strong>
            <p>Es un marco conceptual propuesto por la Comisión Europea (2021) que reorienta la Industria 4.0 hacia tres pilares: centrada en el humano (el trabajador en el centro, no la eficiencia), sostenible (economía circular, carbono neutro) y resiliente (cadenas de suministro robustas ante crisis). No implica un salto tecnológico nuevo sino una redefinición de prioridades sobre las tecnologías de la 4ª Revolución.</p>
            <span className={styles.faqTip}>La pandemia de 2020 aceleró el debate sobre Industria 5.0 al revelar la fragilidad de las cadenas globales hiperespecializadas.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo entender la cronología de las revoluciones industriales</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica la tecnología motriz de cada fase</strong>
              <p>Cada revolución tiene una tecnología que actúa como catalizador sistémico: el vapor en la 1ª, la electricidad en la 2ª, el transistor en la 3ª, el IoT e IA en la 4ª. Esa tecnología no solo mejora un proceso: transforma la lógica de toda la economía.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Observa qué país lideró cada oleada</strong>
              <p>La hegemonía industrial cambia: Reino Unido (1ª), EE.UU. y Alemania (2ª y 3ª), Global-China (4ª). Liderar una revolución industrial implica una ventaja geopolítica y económica que puede durar décadas. La pérdida de ese liderazgo también explica declives históricos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Fíjate en la superposición de fases</strong>
              <p>Las revoluciones no se suceden limpiamente: el fordismo nació dentro de la 2ª Revolución y convivió con la 3ª. La economía petroquímica sigue dominando aunque emerge la de las energías renovables. Las transiciones son procesos de décadas, no eventos puntuales.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Relaciona cada revolución con su impacto en el trabajo</strong>
              <p>La 1ª creó el proletariado fabril; la 2ª generó el trabajo en cadena y los sindicatos industriales; la 3ª impulsó el trabajo de cuello blanco; la 4ª está creando perfiles de "analista de datos" y "técnico de cobots" que no existían hace 10 años.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Conecta con el contexto político y social</strong>
              <p>La 1ª Revolución Industrial coincidió con las revoluciones liberales y el marxismo; la 2ª con el imperialismo y las guerras mundiales; la 3ª con la Guerra Fría y el Estado del bienestar; la 4ª con la globalización y el debate sobre la desigualdad tecnológica. La industria nunca es solo tecnología.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para usar este visualizador</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Empieza por la pestaña "Línea del Tiempo" para tener una visión global de la superposición de fases antes de explorar cada una en detalle.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <p>Usa la pestaña "Comparativa" para filtrar por era e identificar qué fases convivieron simultáneamente y cómo se relacionan entre sí.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>Las fechas son orientativas: la "Primera Revolución Industrial" tardó 80 años en extenderse desde el norte de Inglaterra hasta el continente europeo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>Presta atención a los países líderes: cada revolución ha redistribuido el poder económico global. Entender ese patrón histórico ayuda a leer la geopolítica del presente.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al entender las revoluciones industriales</strong>
          </div>
          <ul className={styles.warningList}>
            <li>La <strong>1ª Revolución Industrial no fue un evento puntual</strong>: tardó décadas en extenderse desde el norte de Inglaterra al resto de Europa. En 1820, Francia y Alemania seguían siendo economías mayoritariamente agrarias.</li>
            <li>No toda la industria de un país transiciona a la vez: en 1900, coexistían fábricas con maquinaria de vapor de última generación y talleres artesanales usando técnicas del siglo XVI en la misma ciudad.</li>
            <li><strong>Revolución Industrial no equivale a progreso universal</strong>: las primeras décadas del trabajo fabril implicaron jornadas de 16 horas, trabajo infantil y condiciones insalubres que tardaron décadas en regularse.</li>
            <li>La <strong>Industria 4.0 no es solo robotización</strong>: su característica definitoria es la conectividad entre máquinas, datos y decisiones en tiempo real, no simplemente sustituir personas por robots.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-revoluciones-industriales')} />
      <ShareCard appName="visualizador-revoluciones-industriales" />
      <Footer appName="visualizador-revoluciones-industriales" />
    </div>
  );
}
