'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaDeporte.module.css';
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

type Categoria = 'antigua' | 'medieval' | 'moderno' | 'olimpismo' | 'masas' | 'comercial' | 'escandalo' | 'digital';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoDeporte {
  id: number;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  color: string;
  modalidad: string;
  descripcion: string;
  personas: string[];
  categoria: Categoria;
}

interface EventoHistorico {
  anio: number;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Helper para años negativos (a.C.)
// ─────────────────────────────────────────────

function formatAnio(anio: number): string {
  return anio < 0 ? `${Math.abs(anio)} a.C.` : String(anio);
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoDeporte[] = [
  { id: 1, nombre: "Olimpismo Griego", anioInicio: -776, anioFin: -146, color: "#F9A825", modalidad: "Atletismo, lucha y carros", descripcion: "Los Juegos Olímpicos de Olimpia celebran cada cuatro años competiciones de atletismo, lucha, boxeo y carreras de cuadrigas. Los vencedores reciben una corona de olivo y gloria eterna en el mundo griego.", personas: ["Milón de Crotona", "Alejandro Magno"], categoria: "antigua" },
  { id: 2, nombre: "Juegos y Espectáculos Romanos", anioInicio: -250, anioFin: 400, color: "#FF8F00", modalidad: "Gladiadores, circo y naumaquia", descripcion: "Roma transforma el deporte en espectáculo de masas. Los gladiadores combaten en el Coliseo ante 50.000 espectadores. Las carreras de cuadrigas en el Circo Máximo congregan a 250.000 personas.", personas: ["Espartaco", "Diocleciano"], categoria: "antigua" },
  { id: 3, nombre: "Juegos Medievales y Caballerescos", anioInicio: 500, anioFin: 1500, color: "#8D6E63", modalidad: "Torneos, justas y juego de pelota", descripcion: "Los torneos caballerescos combinan exhibición militar y entretenimiento cortesano. La pelota vasca, la lucha tradicional y la arquería se practican en toda Europa como entrenamiento y ocio.", personas: ["Rodrigo de Vivar 'El Cid'", "Godofredo de Bouillon"], categoria: "medieval" },
  { id: 4, nombre: "Deportes Modernos Tempranos", anioInicio: 1500, anioFin: 1800, color: "#795548", modalidad: "Cricket, golf, hípica y boxeo", descripcion: "Inglaterra codifica las primeras reglas del cricket (1700s), el golf en Escocia y el boxeo con Marquess of Queensberry. La hípica se convierte en deporte aristocrático. Las regatas náuticas son símbolo de estatus.", personas: ["Jack Broughton", "Capitán Matthew Webb"], categoria: "moderno" },
  { id: 5, nombre: "Codificación y las Reglas Modernas", anioInicio: 1800, anioFin: 1896, color: "#5C6BC0", modalidad: "Fútbol, rugby, tenis y atletismo codificados", descripcion: "Los colegios ingleses codifican el fútbol (1863, FA), el rugby (1871) y el tenis (1873). El atletismo adopta reglas internacionales. El deporte organizado abandona la violencia extrema y se reglamenta.", personas: ["Ebenezer Cobb Morley", "Walter Clopton Wingfield", "Thomas Arnold"], categoria: "moderno" },
  { id: 6, nombre: "Olimpismo Moderno", anioInicio: 1896, anioFin: 1936, color: "#3F51B5", modalidad: "Juegos Olímpicos y amateurismo", descripcion: "Coubertin resucita los Juegos Olímpicos en Atenas (1896). El fútbol crea la FIFA (1904). Los Juegos de Berlín (1936) son instrumentalizados por el nazismo. El olimpismo promulga el amateurismo frente al profesionalismo.", personas: ["Pierre de Coubertin", "Jesse Owens", "Spiridon Louis"], categoria: "olimpismo" },
  { id: 7, nombre: "Deporte de Masas y Radio", anioInicio: 1920, anioFin: 1960, color: "#E91E63", modalidad: "Fútbol global, boxeo y ciclismo", descripcion: "La radio lleva el deporte a millones de hogares. El fútbol se globaliza: Copa del Mundo (1930), Pelé y Di Stéfano son los primeros superestrelles. El ciclismo (Tour de France) y el boxeo (Joe Louis, Rocky Marciano) dominan.", personas: ["Pelé", "Di Stéfano", "Joe Louis"], categoria: "masas" },
  { id: 8, nombre: "Televisión y Globalización", anioInicio: 1960, anioFin: 1984, color: "#F44336", modalidad: "Derechos de TV y escándalos políticos", descripcion: "México 68 y los JJ.OO. se transmiten en color a todo el mundo. El atentado de Múnich (1972) politiza los Juegos. El boicot mutuo de Moscú (1980) y Los Ángeles (1984) convierte el deporte en arma de la Guerra Fría.", personas: ["Dick Fosbury", "Nadia Comaneci", "Mark Spitz"], categoria: "masas" },
  { id: 9, nombre: "Comercialización y Sponsoring", anioInicio: 1984, anioFin: 2000, color: "#FF5722", modalidad: "Marcas, sponsors y deporte-espectáculo", descripcion: "Los JJOO de Los Ángeles (1984) se financian con sponsors privados. Michael Jordan y Nike crean el deporte como marca global. La Champions League y la Fórmula 1 se convierten en negocios multimillonarios.", personas: ["Michael Jordan", "Ayrton Senna", "Juan Antonio Samaranch"], categoria: "comercial" },
  { id: 10, nombre: "Dopaje y Escándalos", anioInicio: 1988, anioFin: 2012, color: "#9C27B0", modalidad: "EPO, dopaje sistemático y antidopaje", descripcion: "Ben Johnson es descalificado en Seúl (1988). El caso Festina (1998) sacude el ciclismo. Lance Armstrong admite dopaje sistemático. La WADA (2000) crea el sistema antidopaje mundial.", personas: ["Ben Johnson", "Lance Armstrong", "Marion Jones"], categoria: "escandalo" },
  { id: 11, nombre: "Era Digital y Streaming", anioInicio: 2000, anioFin: 2015, color: "#00BCD4", modalidad: "Streaming, redes sociales y datos", descripcion: "Los derechos de TV alcanzan cifras astronómicas (LaLiga, Premier, NBA). Los atletas construyen marcas personales en redes sociales. La analítica de datos transforma la táctica deportiva.", personas: ["Cristiano Ronaldo", "LeBron James", "Usain Bolt"], categoria: "digital" },
  { id: 12, nombre: "eSports como Deporte", anioInicio: 2010, anioFin: 9999, color: "#8BC34A", modalidad: "Competición de videojuegos profesional", descripcion: "League of Legends, CS:GO y Fortnite generan audiencias de millones. Los eSports entran en los Juegos Asiáticos (2018) y se debaten para los JJ.OO. Los jugadores profesionales tienen contratos millonarios.", personas: ["Faker", "N0tail", "Ninja"], categoria: "digital" },
  { id: 13, nombre: "Deporte Post-COVID", anioInicio: 2020, anioFin: 2023, color: "#607D8B", modalidad: "Estadios vacíos y salud mental", descripcion: "Tokio 2020 celebra los primeros JJ.OO. sin público. Naomi Osaka y Simone Biles visibilizan la salud mental en el deporte de élite. El streaming y el deporte sin estadio revelan nuevos modelos de negocio.", personas: ["Naomi Osaka", "Simone Biles", "Novak Djokovic"], categoria: "masas" },
  { id: 14, nombre: "Deporte con IA y Biomecánica", anioInicio: 2020, anioFin: 9999, color: "#FF9800", modalidad: "VAR, análisis predictivo e IA entrenadora", descripcion: "El VAR en fútbol introduce la revisión tecnológica de decisiones. La IA analiza biomecánica en tiempo real. Los wearables monitorizan a los atletas. Los algoritmos predicen lesiones y diseñan planes de entrenamiento.", personas: ["Rafael Nadal", "Erling Haaland", "Iga Świątek"], categoria: "digital" },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -776, descripcion: "Primeros Juegos Olímpicos registrados en Olimpia: Corebo de Élide gana el estadio" },
  { anio: 1863, descripcion: "La Football Association codifica las primeras reglas del fútbol moderno en Londres" },
  { anio: 1896, descripcion: "Pierre de Coubertin resucita los Juegos Olímpicos en Atenas: 14 países, 241 atletas" },
  { anio: 1930, descripcion: "Uruguay gana el primer Mundial de fútbol de la FIFA ante 93.000 espectadores" },
  { anio: 1936, descripcion: "Jesse Owens gana 4 oros en Berlín ante Hitler, desmontando el mito de la superioridad aria" },
  { anio: 1972, descripcion: "Atentado de Múnich en los JJ.OO.: 11 atletas israelíes asesinados por el grupo Septiembre Negro" },
  { anio: 1988, descripcion: "Ben Johnson bate el récord mundial en Seúl y es descalificado por dopaje (estanozolol)" },
  { anio: 2021, descripcion: "Tokio 2020 se celebra sin público por COVID-19: Naomi Osaka y Biles visibilizan la salud mental" },
  { anio: 2024, descripcion: "El breaking debuta en los JJ.OO. de París; los eSports se consolidan como deporte global" },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  antigua: 'Antigüedad',
  medieval: 'Medieval',
  moderno: 'Moderno Temprano',
  olimpismo: 'Olimpismo',
  masas: 'Deporte de Masas',
  comercial: 'Comercialización',
  escandalo: 'Escándalos',
  digital: 'Era Digital',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  antigua: '#F9A825',
  medieval: '#8D6E63',
  moderno: '#5C6BC0',
  olimpismo: '#3F51B5',
  masas: '#E91E63',
  comercial: '#FF5722',
  escandalo: '#9C27B0',
  digital: '#00BCD4',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoDeporte }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.modalidadBox}>
        <span className={styles.obraIconicaLabel}>Modalidad Dominante</span>
        <p>{periodo.modalidad}</p>
      </div>

      <div className={styles.preguntaBox}>
        <span className={styles.preguntaLabel}>Descripción</span>
        <p className={styles.preguntaTexto}>{periodo.descripcion}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Figuras destacadas</span>
        <ul className={styles.artistasList}>
          {periodo.personas.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = -776;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 60;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoDeporte | null>(null);

  const filas: PeriodoDeporte[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin === 9999 ? AÑO_MAX : ultimoEnFila.anioFin) + 4 <= anioAX(per.anioInicio)) {
        filas[f].push(per);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(per);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  const marcadores: number[] = [-500, 0, 500, 1000, 1500, 1800, 1900, 1950, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde el 776 a.C. hasta 2024.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia del deporte"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcador del año 0 */}
          <line x1={anioAX(0)} y1={FILA_OFFSET_Y} x2={anioAX(0)} y2={svgAlto - 16} stroke="#888" strokeWidth={1} strokeDasharray="4,3" />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#888" textAnchor="middle">año 0</text>

          {/* Marcadores */}
          {marcadores.filter(m => m !== 0).map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{formatAnio(m)}</text>
            </g>
          ))}

          {/* Rectángulos de períodos */}
          {filas.map((fila, fi) =>
            fila.map((per) => {
              const anioFin = per.anioFin === 9999 ? AÑO_MAX : per.anioFin;
              const x = anioAX(per.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === per.id;

              return (
                <g key={per.id} onClick={() => setSeleccionado(esSeleccionado ? null : per)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={per.color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 50 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={9}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {per.nombre.length > 18 ? per.nombre.substring(0, 16) + '…' : per.nombre}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Leyenda */}
      <div className={styles.leyendaCategorias}>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <span key={cat} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: COLORES_CATEGORIA[cat] }} aria-hidden="true" />
            {ETIQUETAS_CATEGORIA[cat]}
          </span>
        ))}
      </div>

      {seleccionado && (
        <PanelDetalle periodo={seleccionado} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Período en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const periodo = PERIODOS[indice];
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : formatAnio(periodo.anioFin);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Período en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {PERIODOS.map((per, i) => (
          <button
            key={per.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: per.color, borderColor: per.color } : {}}
          >
            {per.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: periodo.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: periodo.color }}>
          <h3>{periodo.nombre}</h3>
          <p>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">🏅</span>
            <p>{periodo.modalidad}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Descripción</span>
            <p>{periodo.descripcion}</p>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Figuras destacadas</span>
            <ul className={styles.artistasList}>
              {periodo.personas.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Período anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {PERIODOS.length}</span>
        <button
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(PERIODOS.length - 1, i + 1))}
          disabled={indice === PERIODOS.length - 1}
          aria-label="Período siguiente"
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
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const periodosFiltrados = useMemo(() => {
    return PERIODOS.filter((per) => {
      const coincideCategoria = categoriaFiltro === 'todos' || per.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        per.nombre.toLowerCase().includes(termino) ||
        per.modalidad.toLowerCase().includes(termino) ||
        per.personas.some((p) => p.toLowerCase().includes(termino));
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoriaFiltro, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          className={`${styles.filtroCatBtn} ${categoriaFiltro === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setCategoriaFiltro('todos')}
        >
          Todos
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <button
            key={cat}
            className={`${styles.filtroCatBtn} ${categoriaFiltro === cat ? styles.filtroCatBtnActivo : ''}`}
            onClick={() => setCategoriaFiltro(cat)}
            style={categoriaFiltro === cat ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat] } : {}}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período, modalidad o figura..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período deportivo"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Años</th>
              <th>Categoría</th>
              <th>Figura destacada</th>
              <th>Modalidad Dominante</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => {
              const anioFinTexto = per.anioFin === 9999 ? 'actualidad' : formatAnio(per.anioFin);
              return (
                <tr
                  key={per.id}
                  style={i % 2 === 0 ? { background: `${per.color}18` } : {}}
                >
                  <td><strong style={{ color: per.color }}>{per.nombre}</strong></td>
                  <td>{formatAnio(per.anioInicio)}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                      {ETIQUETAS_CATEGORIA[per.categoria]}
                    </span>
                  </td>
                  <td>{per.personas[0]}</td>
                  <td className={styles.preguntaCell}>{per.modalidad}</td>
                </tr>
              );
            })}
            {periodosFiltrados.length === 0 && (
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

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

const ERAS: Era[] = [
  { nombre: "Deporte en la Antigüedad", desde: -776, hasta: 500, icono: "🏛️" },
  { nombre: "Juegos Medievales y Modernos", desde: 500, hasta: 1800, icono: "⚔️" },
  { nombre: "Codificación y Olimpismo", desde: 1800, hasta: 1950, icono: "🏅" },
  { nombre: "Deporte de Masas y TV", desde: 1950, hasta: 1990, icono: "📺" },
  { nombre: "Comercialización y Escándalo", desde: 1990, hasta: 2010, icono: "💰" },
  { nombre: "Era Digital y eSports", desde: 2010, hasta: 9999, icono: "🎮" },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos deportivos y eventos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anioInicio < era.hasta && (p.anioFin === 9999 || p.anioFin > era.desde)
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
                    {formatAnio(era.desde)} – {era.hasta === 9999 ? 'hoy' : formatAnio(era.hasta)}
                  </span>
                </div>
              </div>

              {periodosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {periodosEra.map((p) => (
                    <span
                      key={p.id}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${p.color}1A`, color: p.color, borderColor: `${p.color}55` }}
                    >
                      {p.nombre}
                    </span>
                  ))}
                </div>
              )}

              {eventosEra.length > 0 && (
                <ul className={styles.eraEventos}>
                  {eventosEra.map((ev) => (
                    <li key={ev.anio} className={styles.eraEvento}>
                      <span className={styles.eraEventoAnio}>{formatAnio(ev.anio)}</span>
                      <span className={styles.eraEventoTexto}>{ev.descripcion}</span>
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

export default function VisualizadorHistoriaDeporte() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Período en Detalle' },
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
        <h1 className={styles.heroTitle}>Historia del Deporte</h1>
        <p className={styles.heroSubtitle}>
          De los Juegos Olímpicos griegos a los eSports — 14 períodos con figuras clave, modalidades y contexto histórico
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
        title="Historia del deporte: de Olimpia a los eSports"
        subtitle="Cómo el deporte ha evolucionado a lo largo de 2.800 años de historia humana"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos clave en la historia del deporte</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Años</th>
                <th>Categoría</th>
                <th>Figura clave</th>
                <th>Modalidad</th>
                <th>Hito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Olimpismo Griego</strong></td>
                <td>776–146 a.C.</td>
                <td>Antigüedad</td>
                <td>Milón de Crotona</td>
                <td>Atletismo y lucha</td>
                <td>Primer deporte organizado a escala civilizatoria</td>
              </tr>
              <tr>
                <td><strong>Olimpismo Moderno</strong></td>
                <td>1896–1936</td>
                <td>Olimpismo</td>
                <td>Pierre de Coubertin</td>
                <td>Atletismo, natación</td>
                <td>Renacimiento de los Juegos Olímpicos en Atenas</td>
              </tr>
              <tr>
                <td><strong>Deporte de Masas y Radio</strong></td>
                <td>1920–1960</td>
                <td>Deporte de Masas</td>
                <td>Pelé</td>
                <td>Fútbol y boxeo</td>
                <td>La radio globaliza el deporte</td>
              </tr>
              <tr>
                <td><strong>Comercialización</strong></td>
                <td>1984–2000</td>
                <td>Comercialización</td>
                <td>Michael Jordan</td>
                <td>Baloncesto, F1</td>
                <td>Nike y Jordan crean el deporte como marca global</td>
              </tr>
              <tr>
                <td><strong>Dopaje y Escándalos</strong></td>
                <td>1988–2012</td>
                <td>Escándalos</td>
                <td>Lance Armstrong</td>
                <td>Ciclismo, atletismo</td>
                <td>WADA y el sistema antidopaje mundial</td>
              </tr>
              <tr>
                <td><strong>eSports como Deporte</strong></td>
                <td>2010–presente</td>
                <td>Era Digital</td>
                <td>Faker</td>
                <td>Videojuegos competitivos</td>
                <td>Audiencias de millones y contratos millonarios</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios */}
        <h3>Grandes debates en la historia del deporte</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
            <div>
              <strong>Olimpismo antiguo vs. moderno</strong>
              <p>Los Juegos griegos eran una ceremonia religiosa y política dedicada a Zeus. Los Juegos modernos de Coubertin buscan la paz internacional y el ideal amateurista — luego sustituido por el profesionalismo descarado del siglo XXI.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎖️</span>
            <div>
              <strong>Deporte amateur vs. profesional</strong>
              <p>Hasta los años 80, el olimpismo prohibía a los atletas cobrar. El debate entre pureza amateur y profesionalismo definió un siglo de política deportiva, hasta que el dinero televisivo lo resolvió definitivamente.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
            <div>
              <strong>Deporte físico vs. eSports</strong>
              <p>¿Son los eSports un deporte? La pregunta divide a federaciones y atletas. Con audiencias que superan al Tour de France y atletas con contratos millonarios, los eSports han dejado de ser una cuestión filosófica para convertirse en industria.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💉</span>
            <div>
              <strong>Deporte limpio vs. dopaje</strong>
              <p>Desde los estimulantes del ciclismo del siglo XIX hasta el dopaje genético del siglo XXI, la búsqueda del rendimiento máximo ha estado en permanente tensión con la integridad competitiva. El dopaje no es un fenómeno moderno: los atletas griegos consumían higos secos y brebajes.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuándo se crearon los primeros Juegos Olímpicos?</strong>
            <p>Los primeros Juegos Olímpicos registrados se celebraron en Olimpia en el año 776 a.C. Se convocaban cada cuatro años (olympiada) en honor a Zeus y duraban cinco días. Incluían carreras a pie, lanzamiento de disco y jabalina, salto de longitud, lucha y boxeo. Se celebraron ininterrumpidamente hasta el año 393 d.C., cuando el emperador Teodosio los prohibió por considerarlos ritos paganos.</p>
            <span className={styles.faqTip}>Curiosidad: durante los Juegos Olímpicos se declaraba una tregua sagrada (ekecheiria) que obligaba a suspender todas las guerras en Grecia.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo se codificó el fútbol moderno?</strong>
            <p>La Football Association (FA) redactó las primeras reglas unificadas del fútbol el 26 de octubre de 1863 en Londres. Antes existían versiones caóticas del juego en los colegios ingleses, cada uno con sus propias reglas. La codificación del fútbol permitió que equipos de distintos colegios pudieran enfrentarse con normas comunes, sentando las bases del deporte más popular del mundo.</p>
            <span className={styles.faqTip}>El rugby nació exactamente de esa reunión: el representante del Rugby School rechazó la prohibición de usar las manos y se marchó a crear su propio deporte.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Los eSports son deporte olímpico?</strong>
            <p>En 2024, el COI lanzó los primeros Juegos Olímpicos de eSports (Paris Games Week). Sin embargo, los títulos olímpicos de eSports excluyen los videojuegos con violencia (shooters, juegos de guerra) y se centran en simulaciones de deportes tradicionales (ajedrez virtual, simuladores de vela, tenis virtual). Los Juegos Asiáticos 2022 ya incluyeron eSports como modalidad oficial con medallas reales.</p>
            <span className={styles.faqTip}>League of Legends tiene más espectadores en sus finales mundiales que la Super Bowl de la NFL en muchos países asiáticos.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué fue el caso Festina?</strong>
            <p>En julio de 1998, durante el Tour de France, la policía francesa detuvo al masajista del equipo Festina con un maletín lleno de EPO, hormona del crecimiento y anabolizantes. El escándalo reveló que el dopaje no era individual sino sistémico y organizado por los propios equipos ciclistas. El Tour expulsó a Festina y varios equipos se retiraron en protesta. El caso fue el detonante de la creación de la WADA (Agencia Mundial Antidopaje) en 1999.</p>
            <span className={styles.faqTip}>Lance Armstrong ganó los 7 Tours de France posteriores al caso Festina dopado, lo que revela que el escándalo no resolvió el problema sino que lo sofisticó.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuánto cobran los deportistas más ricos del mundo?</strong>
            <p>En 2024, Cristiano Ronaldo ingresa unos 200 millones de dólares anuales (salario en Arabia Saudí más marcas), seguido de cerca por LeBron James (~128M$) y Lionel Messi (~130M$). Pero el deporte más lucrativo para sus estrellas es el golf: los contratos de LIV Golf han convertido a jugadores de segunda fila en multimillonarios. Michael Jordan sigue siendo el deportista más rico de la historia con un patrimonio de unos 3.200 millones de dólares gracias a sus royalties de Nike.</p>
            <span className={styles.faqTip}>Jordan gana más dinero al año en royalties de Air Jordan que durante toda su carrera como jugador activo de la NBA.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo entender la evolución histórica del deporte</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>El deporte como espejo de la sociedad</strong>
              <p>Cada período deportivo refleja los valores de su época. Los Juegos griegos celebraban la excelencia individual y la competencia entre ciudades-estado. El olimpismo moderno de Coubertin promovía la paz internacional. El deporte de masas del siglo XX democratizó el ocio. Los eSports reflejan la economía de la atención digital.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>La tecnología transforma el deporte</strong>
              <p>La radio (1920s) masificó el deporte sin necesidad de presencia física. La televisión (1960s) lo convirtió en espectáculo global. Internet y el streaming (2000s) fragmentaron la audiencia y crearon deportes nativos digitales. La IA y los wearables (2020s) están transformando el entrenamiento y la táctica en tiempo real.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>El dinero como motor de cambio</strong>
              <p>Los Juegos de Los Ángeles 1984 fueron los primeros en financiarse con patrocinadores privados y demostraron que el olimpismo podía ser rentable. Ese modelo transformó el deporte global: los derechos de TV de la Premier League valen hoy más de 10.000 millones de euros por ciclo trienal.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>El deporte como política</strong>
              <p>Jesse Owens en Berlín 1936, el Black Power de México 1968, el atentado de Múnich 1972, los boicots de Moscú 1980 y Los Ángeles 1984: el deporte ha sido constantemente usado como escenario de confrontación política. El "deporte limpio de política" es un mito: el deporte siempre ha sido político.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>La salud mental como nueva frontera</strong>
              <p>Tokio 2020 marcó un punto de inflexión: Naomi Osaka se retiró de Roland Garros alegando salud mental, y Simone Biles abandonó varias finales olímpicas por el mismo motivo. Por primera vez en la historia, los deportistas de élite visibilizaron el coste psicológico del rendimiento extremo, cuestionando el mito del atleta invencible.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender el deporte moderno</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📺</span>
            <p>Los derechos de televisión son el motor financiero del deporte moderno. Sin ellos, no existirían los salarios millonarios ni las infraestructuras actuales. La Premier League inglesa vale más que todas las ligas europeas restantes juntas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>El fútbol es el único deporte verdaderamente global: 210 países en la FIFA, más que en la ONU. Ningún otro deporte compite en penetración cultural en todos los continentes simultáneamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔬</span>
            <p>La ciencia del deporte ha transformado el rendimiento más en los últimos 30 años que en los 2.000 anteriores. La nutrición, la biomecánica, el análisis de datos y la recuperación activa han redefinido los límites humanos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🤖</span>
            <p>El VAR, la Hawk-Eye en tenis y el análisis de datos en baloncesto (Moneyball) muestran que la IA no viene a reemplazar el deporte sino a hacerlo más preciso, justo y analizable. Los entrenadores del futuro serán también científicos de datos.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Las cronologías del deporte antiguo se basan en fuentes históricas que pueden ser incompletas. Los Juegos Olímpicos griegos se celebraron ininterrumpidamente durante 1.000 años, pero solo conservamos registros parciales.</strong>
          <ul>
            <li>Las fechas del deporte antiguo (776 a.C. en adelante) son aproximaciones basadas en fuentes históricas clásicas, no en registros deportivos modernos. Los arqueólogos y filólogos continúan debatiendo cronologías exactas.</li>
            <li>Los períodos se solapan intencionalmente: el "Olimpismo Moderno" y el "Deporte de Masas y Radio" conviven cronológicamente porque describen fenómenos paralelos, no lineales.</li>
            <li>Los datos sobre ingresos de deportistas corresponden a estimaciones públicas (Forbes, SportsPro) y pueden variar significativamente según fuente y año de referencia.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-deporte')} />
      <ShareCard appName="visualizador-historia-deporte" />
      <Footer appName="visualizador-historia-deporte" />
    </div>
  );
}
