'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaInternet.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface Hito {
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

const MOVIMIENTOS: Hito[] = [
  {
    nombre: 'ARPANET',
    anioInicio: 1969,
    anioFin: 1990,
    color: '#1565C0',
    descripcion: 'Red experimental militar que conecta cuatro universidades estadounidenses. El primer mensaje enviado en 1969 fue "lo" — el sistema colapsó antes de completar "login".',
    obraIconica: 'Primer mensaje ARPANET (UCLA→Stanford, 1969)',
    paises: ['EE.UU.'],
  },
  {
    nombre: 'Correo Electrónico',
    anioInicio: 1971,
    anioFin: 9999,
    color: '#6A1B9A',
    descripcion: 'Ray Tomlinson inventa el email y elige el símbolo @ para separar usuario y máquina. Primera aplicación "killer" de Internet, que sigue siendo la más utilizada.',
    obraIconica: 'Primer email de Tomlinson (1971)',
    paises: ['EE.UU.'],
  },
  {
    nombre: 'TCP/IP e Infraestructura',
    anioInicio: 1983,
    anioFin: 9999,
    color: '#00695C',
    descripcion: 'Vint Cerf y Bob Kahn diseñan TCP/IP, el protocolo universal de comunicación. ARPANET adopta TCP/IP el 1 de enero de 1983: fecha del "nacimiento oficial" de Internet.',
    obraIconica: 'Adopción de TCP/IP (1 enero 1983)',
    paises: ['EE.UU.'],
  },
  {
    nombre: 'DNS — Nombres de Dominio',
    anioInicio: 1984,
    anioFin: 9999,
    color: '#2E7D32',
    descripcion: 'Paul Mockapetris diseña el DNS, permitiendo usar nombres como "google.com" en lugar de direcciones IP numéricas. La infraestructura invisible de todo el Internet.',
    obraIconica: 'Especificación DNS RFC 1034 (1987)',
    paises: ['EE.UU.'],
  },
  {
    nombre: 'World Wide Web',
    anioInicio: 1991,
    anioFin: 9999,
    color: '#E65100',
    descripcion: 'Tim Berners-Lee publica la primera página web desde el CERN. HTML, HTTP y URL crean el sistema hipermedia que popularizará Internet entre el público general.',
    obraIconica: 'info.cern.ch — primera web pública (1991)',
    paises: ['Suiza', 'Global'],
  },
  {
    nombre: 'Navegadores Gráficos',
    anioInicio: 1993,
    anioFin: 2015,
    color: '#F57F17',
    descripcion: 'Mosaic (1993) y Netscape Navigator (1994) llevan la web al gran público con imágenes y colores. La "guerra de navegadores" entre Netscape e Internet Explorer define una era.',
    obraIconica: 'Netscape Navigator 1.0 (1994)',
    paises: ['EE.UU.'],
  },
  {
    nombre: 'Comercio Electrónico',
    anioInicio: 1994,
    anioFin: 9999,
    color: '#FF6F00',
    descripcion: 'Amazon (1994) y eBay (1995) abren el e-commerce. La primera transacción segura online se realiza con NetMarket en agosto de 1994: un CD de Sting por 12,48 dólares.',
    obraIconica: 'Lanzamiento de Amazon.com (julio 1994)',
    paises: ['EE.UU.', 'Global'],
  },
  {
    nombre: 'Burbuja Puntocom',
    anioInicio: 1996,
    anioFin: 2002,
    color: '#C62828',
    descripcion: 'Euforia especulativa en empresas .com. El Nasdaq sube un 400% entre 1995 y 2000, y colapsa un 78% hasta 2002. Pone a prueba qué modelos de negocio son viables en Internet.',
    obraIconica: 'Colapso del Nasdaq (abril 2000)',
    paises: ['EE.UU.', 'Global'],
  },
  {
    nombre: 'Banda Ancha y WiFi',
    anioInicio: 1999,
    anioFin: 9999,
    color: '#558B2F',
    descripcion: 'La banda ancha ADSL y el estándar WiFi 802.11b democratizan el acceso. Internet deja de ser por llamada telefónica y se vuelve siempre conectado y ubicuo.',
    obraIconica: 'Estándar WiFi 802.11b (1999)',
    paises: ['Global'],
  },
  {
    nombre: 'Redes Sociales',
    anioInicio: 2003,
    anioFin: 9999,
    color: '#1976D2',
    descripcion: 'MySpace (2003), Facebook (2004), YouTube (2005), Twitter (2006) e Instagram (2010) transforman la web en plataforma de participación y comunicación masiva.',
    obraIconica: 'Lanzamiento de Facebook (febrero 2004)',
    paises: ['EE.UU.', 'Global'],
  },
  {
    nombre: 'Internet Móvil',
    anioInicio: 2007,
    anioFin: 9999,
    color: '#7B1FA2',
    descripcion: 'El iPhone (2007) y el ecosistema de apps democratizan el acceso móvil. En 2016 el tráfico móvil supera por primera vez al de escritorio en todo el mundo.',
    obraIconica: 'iPhone de Apple (enero 2007)',
    paises: ['EE.UU.', 'Global'],
  },
  {
    nombre: 'Cloud Computing',
    anioInicio: 2006,
    anioFin: 9999,
    color: '#0288D1',
    descripcion: 'Amazon Web Services (2006) democratiza la infraestructura tecnológica. Las empresas dejan de gestionar servidores propios y acceden a capacidad bajo demanda.',
    obraIconica: 'Lanzamiento de Amazon S3 y EC2 (2006)',
    paises: ['EE.UU.', 'Global'],
  },
  {
    nombre: 'Big Data e IoT',
    anioInicio: 2010,
    anioFin: 9999,
    color: '#00838F',
    descripcion: 'Miles de millones de dispositivos conectados generan datos en tiempo real. Hadoop y Spark procesan petabytes. El Internet de las Cosas conecta hogares, ciudades y fábricas.',
    obraIconica: 'Protocolo MQTT estándar IoT (ISO 2013)',
    paises: ['Global'],
  },
  {
    nombre: 'IA Generativa en Red',
    anioInicio: 2022,
    anioFin: 9999,
    color: '#AD1457',
    descripcion: 'ChatGPT alcanza 100 millones de usuarios en dos meses — el crecimiento más rápido de cualquier aplicación en la historia. Los modelos de lenguaje cambian cómo se crea y consume contenido.',
    obraIconica: 'ChatGPT de OpenAI (noviembre 2022)',
    paises: ['EE.UU.', 'Global'],
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1969, texto: 'ARPANET envía el primer mensaje entre UCLA y Stanford' },
  { anio: 1971, texto: 'Primer correo electrónico entre dos computadoras en red' },
  { anio: 1983, texto: 'Internet adopta TCP/IP — "nacimiento oficial" de Internet' },
  { anio: 1991, texto: 'Tim Berners-Lee lanza la primera página web desde el CERN' },
  { anio: 1994, texto: 'Amazon.com abre — nace el comercio electrónico moderno' },
  { anio: 2000, texto: 'Colapso de la burbuja puntocom — Nasdaq pierde 5 billones de dólares' },
  { anio: 2004, texto: 'Nace Facebook, inaugurando la era de las redes sociales masivas' },
  { anio: 2007, texto: 'iPhone lanza la era del internet en el bolsillo' },
  { anio: 2016, texto: 'El tráfico móvil supera al de escritorio por primera vez en la historia' },
  { anio: 2022, texto: 'ChatGPT alcanza 100M de usuarios en 2 meses — la IA generativa entra en Internet' },
];

const ERAS: Era[] = [
  { nombre: 'Red experimental', desde: 1960, hasta: 1983, icono: '🖥️' },
  { nombre: 'Protocolos y DNS', desde: 1983, hasta: 1993, icono: '📡' },
  { nombre: 'La World Wide Web', desde: 1993, hasta: 2000, icono: '🌐' },
  { nombre: 'Burbuja y Web 2.0', desde: 2000, hasta: 2010, icono: '💥' },
  { nombre: 'Era Móvil y Social', desde: 2010, hasta: 2020, icono: '📱' },
  { nombre: 'IA y Cloud', desde: 2020, hasta: 9999, icono: '🤖' },
];

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ hito }: { hito: Hito }) {
  const anioFinTexto = hito.anioFin === 9999 ? 'Presente' : hito.anioFin.toString();
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: hito.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: hito.color }}>{hito.nombre}</h3>
      <p className={styles.detallePeriodo}>{hito.anioInicio} – {anioFinTexto}</p>
      <div className={styles.badgesRow}>
        {hito.paises.map((p) => (
          <span key={p} className={styles.paisBadge}>{p}</span>
        ))}
      </div>
      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Hito icónico</span>
        <p>{hito.obraIconica}</p>
      </div>
      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Descripción</span>
        <p>{hito.descripcion}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const ANIO_INICIO_GLOBAL = 1965;
const ANIO_FIN_GLOBAL = 2025;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - ANIO_INICIO_GLOBAL) / (ANIO_FIN_GLOBAL - ANIO_INICIO_GLOBAL)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<Hito | null>(null);

  // Distribuir hitos en filas para evitar solapamiento
  const filas: Hito[][] = [[], [], [], []];
  const ordenados = [...MOVIMIENTOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const hito of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin === 9999 ? ANIO_FIN_GLOBAL : ultimoEnFila.anioFin) + 4 <= anioAX(hito.anioInicio)) {
        filas[f].push(hito);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(hito);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  // Marcadores de décadas
  const decadas: number[] = [];
  for (let d = 1970; d <= 2020; d += 10) decadas.push(d);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un hito para ver sus detalles.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de Internet"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcadores de décadas */}
          {decadas.map((d) => (
            <g key={d}>
              <line x1={anioAX(d)} y1={FILA_OFFSET_Y} x2={anioAX(d)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(d)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{d}</text>
            </g>
          ))}

          {/* Rectángulos de hitos */}
          {filas.map((fila, fi) =>
            fila.map((hito) => {
              const anioFin = hito.anioFin === 9999 ? ANIO_FIN_GLOBAL : hito.anioFin;
              const x = anioAX(hito.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.nombre === hito.nombre;

              return (
                <g key={hito.nombre} onClick={() => setSeleccionado(esSeleccionado ? null : hito)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={hito.color}
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
                      {hito.nombre}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Panel de detalle al hacer clic */}
      {seleccionado && (
        <PanelDetalle hito={seleccionado} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Hito en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const hito = MOVIMIENTOS[indice];
  const anioFinTexto = hito.anioFin === 9999 ? 'Presente' : hito.anioFin.toString();

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Hito en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {MOVIMIENTOS.map((h, i) => (
          <button
            key={h.nombre}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: h.color, borderColor: h.color } : {}}
          >
            {h.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: hito.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: hito.color }}>
          <h3>{hito.nombre}</h3>
          <p>{hito.anioInicio} – {anioFinTexto}</p>
          <div className={styles.paisesHeaderBadges}>
            {hito.paises.map((p) => (
              <span key={p} className={styles.paisHeaderBadge}>{p}</span>
            ))}
          </div>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Hito icónico</span>
            <p>{hito.obraIconica}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Descripción completa</span>
            <p>{hito.descripcion}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Hito anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {MOVIMIENTOS.length}</span>
        <button
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(MOVIMIENTOS.length - 1, i + 1))}
          disabled={indice === MOVIMIENTOS.length - 1}
          aria-label="Hito siguiente"
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

  const hitosFiltrados = useMemo(() => {
    const termino = busqueda.toLowerCase();
    if (!termino) return MOVIMIENTOS;
    return MOVIMIENTOS.filter(
      (h) =>
        h.nombre.toLowerCase().includes(termino) ||
        h.paises.some((p) => p.toLowerCase().includes(termino)) ||
        h.descripcion.toLowerCase().includes(termino)
    );
  }, [busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por tecnología, país o descripción..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar hito de Internet"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Tecnología / Hito</th>
              <th>Período</th>
              <th>Países</th>
              <th>Hito icónico</th>
              <th>Resumen</th>
            </tr>
          </thead>
          <tbody>
            {hitosFiltrados.map((h, i) => {
              const anioFinTexto = h.anioFin === 9999 ? 'Presente' : h.anioFin.toString();
              return (
                <tr key={h.nombre} style={i % 2 === 0 ? { background: `${h.color}18` } : {}}>
                  <td><strong style={{ color: h.color }}>{h.nombre}</strong></td>
                  <td>{h.anioInicio}–{anioFinTexto}</td>
                  <td>{h.paises.join(', ')}</td>
                  <td>{h.obraIconica}</td>
                  <td>{h.descripcion.slice(0, 90)}…</td>
                </tr>
              );
            })}
            {hitosFiltrados.length === 0 && (
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
// Tab 4: Contexto Histórico — vista por eras
// ─────────────────────────────────────────────

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Hitos y eventos de Internet organizados por eras tecnológicas.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const hitosEra = MOVIMIENTOS.filter(
            (h) => h.anioInicio < era.hasta && (h.anioFin === 9999 || h.anioFin > era.desde)
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

              {hitosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {hitosEra.map((h) => (
                    <span
                      key={h.nombre}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${h.color}1A`, color: h.color, borderColor: `${h.color}55` }}
                    >
                      {h.nombre}
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

export default function HistoriaInternet() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Hito en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia de Internet</h1>
        <p className={styles.heroSubtitle}>
          De ARPANET (1969) a la IA Generativa — cronología interactiva de los hitos, protocolos y revoluciones que construyeron la red global
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
        title="¿Cómo evolucionó Internet desde un proyecto militar hasta la IA generativa?"
        subtitle="Cronología, hitos y contexto de la mayor infraestructura tecnológica de la historia"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: etapas clave de Internet</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Etapa</th>
                <th>Años</th>
                <th>Tecnología clave</th>
                <th>Impacto principal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Red experimental</strong></td>
                <td>1969–1983</td>
                <td>ARPANET, email</td>
                <td>Conexión entre universidades y agencias militares</td>
              </tr>
              <tr>
                <td><strong>Protocolos universales</strong></td>
                <td>1983–1993</td>
                <td>TCP/IP, DNS</td>
                <td>Estándares abiertos que permiten la interoperabilidad global</td>
              </tr>
              <tr>
                <td><strong>World Wide Web</strong></td>
                <td>1991–2000</td>
                <td>HTML, HTTP, navegadores</td>
                <td>Internet llega al público general con páginas e hipervínculos</td>
              </tr>
              <tr>
                <td><strong>Web 2.0 y social</strong></td>
                <td>2003–2012</td>
                <td>Redes sociales, banda ancha, móvil</td>
                <td>Los usuarios crean contenido; Internet se vuelve participativo</td>
              </tr>
              <tr>
                <td><strong>IA y Cloud</strong></td>
                <td>2006–hoy</td>
                <td>AWS, IoT, LLMs</td>
                <td>Infraestructura distribuida y contenido generado por IA</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Casos de Uso */}
        <h3>¿Para quién es útil este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
            <div>
              <strong>Desarrollador web</strong>
              <p>Comprende el contexto histórico de las tecnologías que usas: por qué HTTP es así, cómo nació el DNS y qué motivó la adopción de TCP/IP frente a otros protocolos.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
            <div>
              <strong>Emprendedor digital</strong>
              <p>Sitúa tu startup en el arco histórico: cada nueva capa tecnológica (web, móvil, cloud, IA) ha creado oportunidades de negocio radicalmente nuevas. ¿Cuál es la tuya?</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
            <div>
              <strong>Estudiante de tecnología</strong>
              <p>Prepara temas de historia de la informática con una cronología visual que conecta inventos, protocolos y contexto social de cada época.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📰</span>
            <div>
              <strong>Periodista de innovación</strong>
              <p>Ubica noticias sobre IA, cloud o redes sociales en el arco evolutivo de Internet para dar contexto histórico a tus lectores.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Quién inventó Internet?</strong>
            <p>Ninguna persona sola. Internet es el resultado de décadas de trabajo colectivo: Vint Cerf y Bob Kahn diseñaron TCP/IP; Tim Berners-Lee inventó la Web; Ray Tomlinson creó el email; Paul Mockapetris diseñó el DNS. ARPANET fue el proyecto gubernamental que puso en marcha la red original.</p>
            <span className={styles.faqTip}>Pregunta trampa habitual: "¿lo inventó Al Gore?" — Gore impulsó legislación para democratizar el acceso, pero no inventó Internet.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre Internet y la World Wide Web?</strong>
            <p>Internet es la infraestructura física y de protocolos (cables, routers, TCP/IP, DNS) que conecta dispositivos globalmente. La Web (WWW) es una aplicación que corre sobre Internet usando HTTP y HTML para publicar y enlazar páginas. El email, el FTP o el VoIP también son aplicaciones de Internet, pero no son la Web.</p>
            <span className={styles.faqTip}>Analogía: Internet es la red eléctrica; la Web es una de las muchas cosas que puedes conectar a ella.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué fue la burbuja puntocom?</strong>
            <p>Entre 1996 y 2000, el entusiasmo por Internet disparó la valoración de empresas .com sin modelos de negocio sostenibles. El Nasdaq subió un 400% y luego colapsó un 78%. Muchas empresas quebraron (Pets.com, Webvan), pero las sobrevivientes (Amazon, Google) construyeron los fundamentos del Internet moderno. La burbuja enseñó que la tecnología no reemplaza la economía básica.</p>
            <span className={styles.faqTip}>Amazon perdió el 90% de su valor en bolsa durante el colapso, pero sobrevivió y hoy es una de las empresas más valiosas del mundo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo cambió el iPhone el uso de Internet?</strong>
            <p>Antes del iPhone (2007), el acceso móvil era torpe y caro. Apple integró navegador completo, pantalla táctil y conectividad 3G en un único dispositivo de consumo masivo. El App Store (2008) creó un ecosistema donde apps especializadas superaron a las webs genéricas en muchos casos de uso. En 2016, el tráfico móvil superó por primera vez al de escritorio en todo el mundo.</p>
            <span className={styles.faqTip}>El iPhone no fue el primer smartphone, pero sí el primero que redefinió qué podía esperarse de uno.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la Web3 y cómo encaja en esta cronología?</strong>
            <p>Web3 es el término para una internet basada en blockchain, con propiedad descentralizada de datos y activos digitales (criptomonedas, NFTs, DAOs). Sus defensores lo presentan como la siguiente etapa tras la Web 2.0 centralizada en plataformas. Su adopción real es todavía limitada y su impacto a largo plazo es objeto de debate: algunos lo ven como revolución, otros como especulación.</p>
            <span className={styles.faqTip}>La Web3 aún no ha producido una aplicación de uso masivo comparable al email o las redes sociales. Su historia está por escribirse.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo leer la cronología de Internet en 5 pasos</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Empieza por la infraestructura (1969–1983)</strong>
              <p>ARPANET, TCP/IP y DNS son los cimientos invisibles. Sin ellos, nada de lo que vino después sería posible. Comprender estos protocolos te da el contexto para entender por qué Internet es tan resiliente y descentralizado.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Distingue entre Internet y la Web (1991)</strong>
              <p>La Web fue solo una de las primeras aplicaciones populares de Internet. Antes ya existía el email (1971) y el FTP. Berners-Lee no inventó Internet; inventó una forma de compartir información sobre ella que resultó ser extremadamente popular.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Identifica los ciclos de adopción masiva</strong>
              <p>Cada nueva capa tecnológica (web gráfica → e-commerce → banda ancha → redes sociales → móvil → cloud) tardó entre 5 y 10 años en alcanzar masa crítica. El patrón se repite: tecnología → plataformas → ecosistema → normalización.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Lee la burbuja puntocom como filtro, no como fracaso</strong>
              <p>El colapso de 2000 eliminó a las empresas sin modelo de negocio real y dejó sobrevivir a las que tenían fundamentos sólidos. Amazon, Google y eBay salieron más fuertes. Las crisis tecnológicas suelen acelerar la madurez del sector.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Conecta cada hito con su contexto social y económico</strong>
              <p>Internet no evolucionó en el vacío: la Guerra Fría motivó ARPANET, la globalización impulsó el e-commerce, el smartphone democratizó el acceso y la pandemia de 2020 aceleró la digitalización una década. La tecnología y la sociedad se moldean mutuamente.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para navegar esta cronología</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <p>En la pestaña Comparativa, usa el buscador para filtrar por tecnología o país y comparar hitos de la misma época lado a lado.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📡</span>
            <p>Los hitos marcados como "Presente" (anioFin = presente) son tecnologías activas hoy. Las fechas de fin indican cuándo dejaron de ser dominantes, no cuándo desaparecieron.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌐</span>
            <p>Fíjate en el patrón geográfico: la mayoría de los hitos fundacionales son de EE.UU. La Web nació en Suiza (CERN). La globalización real de Internet llegó con el móvil y el cloud.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏳</span>
            <p>Usa la pestaña Contexto Histórico para ver qué eventos históricos coinciden con cada era tecnológica: la relación entre sociedad y tecnología es bidireccional.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes al entender la historia de Internet</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Internet ≠ World Wide Web</strong> — son cosas distintas: Internet es la infraestructura de red global; la Web es una aplicación que corre sobre ella usando HTTP y HTML. El email y el FTP son también aplicaciones de Internet, pero no son la Web.</li>
            <li><strong>ARPANET no era "el Internet"</strong> — era una red experimental de cuatro nodos. El Internet moderno nació en 1983 con la adopción de TCP/IP, que permitió conectar redes heterogéneas entre sí.</li>
            <li><strong>La burbuja puntocom no fue solo un fracaso</strong> — fue también un proceso de selección natural que eliminó modelos sin futuro y fortaleció a los que tenían fundamentos reales. Amazon y Google salieron reforzados.</li>
            <li><strong>La Web 2.0 no es una versión de software</strong> — es un término conceptual acuñado en 2004 para describir el cambio hacia webs participativas (blogs, wikis, redes sociales) donde los usuarios generan el contenido.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-internet')} />
      <ShareCard appName="visualizador-historia-internet" />
      <Footer appName="visualizador-historia-internet" />
    </div>
  );
}
