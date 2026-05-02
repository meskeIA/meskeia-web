'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaPsicologia.module.css';
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

type Categoria = 'filosofica' | 'experimental' | 'clinica' | 'cognitiva' | 'neurociencia';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoPsicologia {
  id: number;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  color: string;
  corriente: string;
  descripcion: string;
  personas: string[];
  categoria: Categoria;
}

interface EventoHistorico {
  anio: number;
  descripcion: string;
}

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
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

const PERIODOS: PeriodoPsicologia[] = [
  { id: 1, nombre: "Raíces Filosóficas Griegas", anioInicio: -400, anioFin: -200, color: "#7986CB", corriente: "Filosofía del alma y la razón", descripcion: "Platón y Aristóteles sientan las bases conceptuales: el alma tripartita, la memoria, los sueños y la percepción como objeto de estudio filosófico.", personas: ["Platón", "Aristóteles", "Hipócrates"], categoria: "filosofica" },
  { id: 2, nombre: "Psicología Medieval e Islámica", anioInicio: 400, anioFin: 1600, color: "#9575CD", corriente: "Integración fe y razón", descripcion: "Avicena describe estados emocionales en el Canon de Medicina. Los escolásticos medievales debaten sobre el alma y la cognición.", personas: ["Avicena", "Averroes", "Tomás de Aquino"], categoria: "filosofica" },
  { id: 3, nombre: "Empirismo y Asociacionismo", anioInicio: 1600, anioFin: 1800, color: "#AB47BC", corriente: "Asociación de ideas", descripcion: "Locke, Hume y Hartley proponen que la mente se forma por asociación de experiencias sensoriales, sentando las bases del empirismo psicológico.", personas: ["John Locke", "David Hume", "David Hartley"], categoria: "filosofica" },
  { id: 4, nombre: "Psicofísica y Fisiología", anioInicio: 1800, anioFin: 1879, color: "#EC407A", corriente: "Medición del umbral sensorial", descripcion: "Fechner establece la psicofísica midiendo la relación entre estímulo físico y percepción. Helmholtz mide la velocidad del impulso nervioso.", personas: ["Gustav Fechner", "Hermann von Helmholtz", "Ernst Weber"], categoria: "experimental" },
  { id: 5, nombre: "Psicología Experimental", anioInicio: 1879, anioFin: 1900, color: "#EF5350", corriente: "Introspección controlada", descripcion: "Wundt funda el primer laboratorio de psicología en Leipzig (1879). James describe la corriente de conciencia. Nace la psicología como ciencia independiente.", personas: ["Wilhelm Wundt", "William James", "Hermann Ebbinghaus"], categoria: "experimental" },
  { id: 6, nombre: "Psicoanálisis", anioInicio: 1895, anioFin: 1945, color: "#FF7043", corriente: "Inconsciente y asociación libre", descripcion: "Freud desarrolla el psicoanálisis: inconsciente, mecanismos de defensa, interpretación de sueños. Jung, Adler y Klein amplían y divergen de la teoría freudiana.", personas: ["Sigmund Freud", "Carl Jung", "Melanie Klein"], categoria: "clinica" },
  { id: 7, nombre: "Conductismo", anioInicio: 1913, anioFin: 1960, color: "#FFA726", corriente: "Condicionamiento observable", descripcion: "Watson proclama que la psicología debe estudiar solo conductas observables. Pavlov descubre el condicionamiento clásico. Skinner desarrolla el condicionamiento operante.", personas: ["John B. Watson", "Iván Pávlov", "B.F. Skinner"], categoria: "experimental" },
  { id: 8, nombre: "Psicología Humanista", anioInicio: 1940, anioFin: 1975, color: "#FFCA28", corriente: "Autorrealización y potencial humano", descripcion: "Maslow propone la jerarquía de necesidades. Rogers desarrolla la terapia centrada en el cliente. La psicología humanista rechaza el determinismo conductista y psicoanalítico.", personas: ["Abraham Maslow", "Carl Rogers", "Rollo May"], categoria: "clinica" },
  { id: 9, nombre: "Psicología Cognitiva", anioInicio: 1956, anioFin: 1985, color: "#66BB6A", corriente: "Procesamiento de información", descripcion: "Miller publica 'El mágico número 7'. Neisser acuña 'psicología cognitiva'. El ordenador se convierte en metáfora de la mente: memoria, atención, lenguaje.", personas: ["George Miller", "Ulric Neisser", "Noam Chomsky"], categoria: "cognitiva" },
  { id: 10, nombre: "Psicología Social y Clínica Moderna", anioInicio: 1960, anioFin: 1990, color: "#26A69A", corriente: "Influencia social y terapias cognitivo-conductuales", descripcion: "Milgram estudia la obediencia a la autoridad. Zimbardo conduce el experimento de la prisión de Stanford. Beck desarrolla la terapia cognitiva para la depresión.", personas: ["Stanley Milgram", "Philip Zimbardo", "Aaron Beck"], categoria: "clinica" },
  { id: 11, nombre: "Neurociencia Cognitiva", anioInicio: 1980, anioFin: 2000, color: "#29B6F6", corriente: "Neuroimagen y correlatos neurales", descripcion: "La fMRI permite visualizar el cerebro en acción. Se identifican regiones para memoria (hipocampo), emociones (amígdala) y decisiones (corteza prefrontal).", personas: ["Michael Gazzaniga", "Antonio Damasio", "Eric Kandel"], categoria: "neurociencia" },
  { id: 12, nombre: "Psicología Positiva", anioInicio: 1998, anioFin: 2015, color: "#5C6BC0", corriente: "Bienestar, fortalezas y resiliencia", descripcion: "Seligman inaugura la psicología positiva centrándose en el florecimiento humano, las fortalezas de carácter y el bienestar, no solo en la patología.", personas: ["Martin Seligman", "Mihaly Csikszentmihalyi", "Christopher Peterson"], categoria: "cognitiva" },
  { id: 13, nombre: "Psicología Computacional", anioInicio: 2000, anioFin: 2020, color: "#8D6E63", corriente: "Modelos computacionales de la mente", descripcion: "Redes neuronales artificiales inspiran teorías del aprendizaje. La psicología evolucionista explica mecanismos cognitivos. Apps de mindfulness y terapia digital emergen.", personas: ["Daniel Kahneman", "Joshua Greene", "David Marr"], categoria: "neurociencia" },
  { id: 14, nombre: "Neurociencia e IA Aplicada", anioInicio: 2015, anioFin: 9999, color: "#78909C", corriente: "Terapia digital y IA clínica", descripcion: "Chatbots terapéuticos (Woebot), estimulación cerebral no invasiva, análisis de lenguaje para diagnóstico de depresión. La IA comienza a asistir en evaluación psicológica.", personas: ["Karl Deisseroth", "Yann LeCun", "Yoshua Bengio"], categoria: "neurociencia" },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -387, descripcion: "Platón funda la Academia: el alma como objeto de estudio filosófico" },
  { anio: 1879, descripcion: "Wundt funda el primer laboratorio de psicología experimental en Leipzig" },
  { anio: 1895, descripcion: "Freud y Breuer publican 'Estudios sobre la histeria', origen del psicoanálisis" },
  { anio: 1913, descripcion: "Watson proclama el manifiesto conductista: solo conductas observables" },
  { anio: 1943, descripcion: "Maslow publica 'Una teoría de la motivación humana' con su jerarquía de necesidades" },
  { anio: 1956, descripcion: "Miller publica 'El mágico número 7': nace oficialmente la psicología cognitiva" },
  { anio: 1980, descripcion: "Primera fMRI del cerebro humano: la neurociencia cognitiva toma forma" },
  { anio: 1998, descripcion: "Seligman inaugura la psicología positiva en su discurso presidencial APA" },
  { anio: 2017, descripcion: "Woebot lanza el primer chatbot terapéutico basado en TCC con IA" },
];

const ERAS: Era[] = [
  { nombre: "Filosofía y Alma", desde: -400, hasta: 1800, icono: "🦉" },
  { nombre: "Empirismo y Fisiología", desde: 1800, hasta: 1879, icono: "🔬" },
  { nombre: "Psicología Científica", desde: 1879, hasta: 1920, icono: "🧪" },
  { nombre: "Grandes Escuelas", desde: 1920, hasta: 1960, icono: "🛋️" },
  { nombre: "Revolución Cognitiva", desde: 1960, hasta: 2000, icono: "🧠" },
  { nombre: "Neurociencia y Era Digital", desde: 2000, hasta: 9999, icono: "💻" },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  filosofica: 'Filosófica',
  experimental: 'Experimental',
  clinica: 'Clínica',
  cognitiva: 'Cognitiva',
  neurociencia: 'Neurociencia',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  filosofica: '#7986CB',
  experimental: '#EF5350',
  clinica: '#66BB6A',
  cognitiva: '#29B6F6',
  neurociencia: '#78909C',
};

// ─────────────────────────────────────────────
// Constantes de timeline
// ─────────────────────────────────────────────

const AÑO_MIN = -400;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoPsicologia }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Corriente Principal</h4>
          <ul className={styles.caracteristicasList}>
            <li>{periodo.corriente}</li>
          </ul>
          <h4 className={styles.detalleSubtitulo} style={{ marginTop: '0.75rem' }}>Descripción</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{periodo.descripcion}</p>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Figuras Clave</h4>
          <ul className={styles.artistasList}>
            {periodo.personas.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoPsicologia | null>(null);

  const filas: PeriodoPsicologia[][] = [[], [], [], []];
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

  const siglos: number[] = [-300, -100, 200, 500, 800, 1100, 1400, 1700, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde el 400 a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de historia de la psicología"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcador del año 0 */}
          <line x1={anioAX(0)} y1={FILA_OFFSET_Y} x2={anioAX(0)} y2={svgAlto - 16} stroke="#888" strokeWidth={1} strokeDasharray="4,3" />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#888" textAnchor="middle">año 0</text>

          {/* Marcadores de siglos */}
          {siglos.map((s) => (
            <g key={s}>
              <line x1={anioAX(s)} y1={FILA_OFFSET_Y} x2={anioAX(s)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(s)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{formatAnio(s)}</text>
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
            <span className={styles.preguntaIcono} aria-hidden="true">🧠</span>
            <p>{periodo.corriente}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Corriente Principal</h4>
              <ul className={styles.caracteristicasList}>
                <li>{periodo.corriente}</li>
              </ul>
              <h4 className={styles.detalleSubtitulo} style={{ marginTop: '0.75rem' }}>Descripción</h4>
              <div className={styles.contextoBox}>
                <p>{periodo.descripcion}</p>
              </div>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Figuras Clave</h4>
              <ul className={styles.artistasList}>
                {periodo.personas.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
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
        per.corriente.toLowerCase().includes(termino) ||
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
          Todas
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
        placeholder="Buscar por período, corriente o psicólogo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de psicología"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Fechas</th>
              <th>Categoría</th>
              <th>Corriente Principal</th>
              <th>Figura Clave</th>
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
                  <td className={styles.preguntaCell}>{per.corriente}</td>
                  <td>{per.personas[0]}</td>
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

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos y eventos de la psicología organizados por eras históricas.
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

export default function VisualizadorHistoriaPsicologia() {
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
        <h1 className={styles.heroTitle}>Historia de la Psicología</h1>
        <p className={styles.heroSubtitle}>
          De Platón a la IA terapéutica — 14 períodos con corrientes, figuras clave y contexto histórico de 2.400 años de estudio de la mente
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
        title="Historia de la psicología: corrientes y escuelas"
        subtitle="Cómo evolucionó el estudio científico de la mente desde la filosofía griega hasta la inteligencia artificial"
      >
        {/* Sección 1 — Texto principal */}
        <p>
          La psicología como ciencia independiente tiene apenas 145 años, pero sus raíces se hunden en los 2.400 años de reflexión filosófica
          sobre el alma, la mente y la conducta humana. Cuando Wilhelm Wundt fundó el primer laboratorio de psicología experimental en
          Leipzig en 1879, estaba formalizando una disciplina que Platón y Aristóteles habían anticipado al preguntar qué es el alma, cómo
          funciona la memoria y qué impulsa nuestras acciones.
        </p>
        <p>
          El siglo XX fue el escenario de una batalla intelectual extraordinaria entre escuelas radicalmente opuestas. El psicoanálisis de
          Freud afirmaba que la clave de la conducta estaba en el inconsciente y los conflictos infantiles reprimidos. El conductismo de
          Watson y Skinner rechazaba cualquier referencia a la mente interna y se limitaba a estudiar la conducta observable y sus
          refuerzos. La psicología humanista de Maslow y Rogers reaccionó contra ambos con una visión positiva del ser humano orientado
          al crecimiento. La revolución cognitiva de los años 50 y 60 devolvió la mente al centro del estudio, usando el ordenador
          como metáfora del procesamiento de información.
        </p>
        <p>
          Hoy, la neurociencia cognitiva ha transformado nuestra comprensión de la mente al permitir visualizar el cerebro en funcionamiento.
          La psicología positiva ha cambiado el foco de la patología al florecimiento. Y la inteligencia artificial empieza a redefinir
          tanto los modelos teóricos de la mente como las herramientas terapéuticas disponibles. Este visualizador recorre 14 períodos
          clave para entender cómo llegamos hasta aquí.
        </p>

        {/* Sección 2 — Casos de uso */}
        <h3>¿Para quién es útil esta cronología?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
            <div>
              <strong>Psicoanálisis vs. Conductismo</strong>
              <p>Entiende por qué estas dos escuelas dominantes del siglo XX eran incompatibles: una estudiaba el inconsciente sin experimentos, la otra rechazaba cualquier referencia a procesos internos no observables.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
            <div>
              <strong>Cognitiva vs. Neurociencia</strong>
              <p>La psicología cognitiva usaba el ordenador como metáfora de la mente. La neurociencia cognitiva fue un paso más allá: busca los correlatos neurales reales de esos procesos mentales con neuroimagen.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌱</span>
            <div>
              <strong>Humanista vs. Psicología Positiva</strong>
              <p>Ambas se centran en el potencial humano, no en la patología. La diferencia está en el método: la positiva usa diseños experimentales rigurosos donde la humanista usaba reflexión fenomenológica.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💬</span>
            <div>
              <strong>Clínica clásica vs. Terapia digital</strong>
              <p>Del diván de Freud al chatbot terapéutico: la terapia cognitivo-conductual fue la primera en estandarizarse y medirse. Hoy sus protocolos se implementan en apps y asistentes de IA clínica.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Freud sigue siendo válido científicamente?</strong>
            <p>Muchos conceptos freudianos han sido abandonados por la psicología científica por no ser falsables (no pueden refutarse con evidencia). Sin embargo, su influencia cultural es enorme y algunos mecanismos como la represión o la proyección han encontrado respaldo parcial en la investigación cognitiva moderna. La neuropsicoanálisis intenta tender puentes entre ambos mundos.</p>
            <span className={styles.faqTip}>Consejo: distingue entre el psicoanálisis como práctica clínica y como teoría científica — son debates separados.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es exactamente la psicología positiva?</strong>
            <p>La psicología positiva, inaugurada por Martin Seligman en 1998, estudia científicamente el bienestar, las fortalezas de carácter, el flow, la resiliencia y el florecimiento humano. No es autoayuda ni pensamiento positivo: usa metodología experimental rigurosa. Su modelo PERMA describe los cinco pilares del bienestar: emociones positivas, engagement, relaciones, sentido y logro.</p>
            <span className={styles.faqTip}>El libro "La auténtica felicidad" de Seligman es un buen punto de entrada.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puede la IA hacer terapia psicológica?</strong>
            <p>La IA actual puede guiar técnicas de TCC estructuradas con cierta eficacia para síntomas leves de ansiedad y depresión (Woebot ha mostrado resultados prometedores en ensayos controlados). Sin embargo, no puede reemplazar la relación terapéutica humana, el diagnóstico clínico, las crisis de salud mental graves ni la adaptación flexible a cada caso. Es una herramienta complementaria, no sustituta.</p>
            <span className={styles.faqTip}>La ética de la IA en salud mental es uno de los debates más activos de la psicología clínica actual.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia a un psicólogo de un psiquiatra?</strong>
            <p>El psiquiatra es médico especializado: puede prescribir medicación y trata trastornos mentales desde un modelo biomédico. El psicólogo clínico es licenciado en psicología con formación especializada: usa psicoterapia y evaluación psicológica. En España, el psicólogo clínico requiere el título de Especialista en Psicología Clínica (PIR). Ambos pueden colaborar en el tratamiento de un mismo paciente.</p>
            <span className={styles.faqTip}>Para trastornos moderados-graves, el abordaje combinado (medicación + psicoterapia) suele ser más eficaz que cualquiera por separado.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo ha cambiado el tratamiento de la depresión?</strong>
            <p>La historia es fascinante: en el psicoanálisis, la depresión se entendía como agresión vuelta hacia uno mismo y se trataba con años de terapia. Con el conductismo, se identificó el papel del refuerzo y la indefensión aprendida. Beck desarrolló la terapia cognitiva en los 70 demostrando que los pensamientos negativos automáticos son el mecanismo central. Hoy la TCC tiene protocolos de 12-20 sesiones con eficacia comparable a los antidepresivos para depresión moderada.</p>
            <span className={styles.faqTip}>La psicología positiva añade una dimensión: no solo reducir síntomas, sino construir bienestar activamente.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo explorar esta cronología de psicología</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Empieza por la Línea del Tiempo</strong>
              <p>Visualiza los 14 períodos en perspectiva temporal. Observa las superposiciones: el conductismo y el psicoanálisis coexistieron décadas con visiones radicalmente opuestas de la mente.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Explora las corrientes que más te interesen</strong>
              <p>En "Período en Detalle" puedes navegar uno a uno por los 14 períodos con sus figuras clave, corriente principal y descripción completa. Úsalo para estudiar o refrescar conocimientos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Compara escuelas con el filtro de categorías</strong>
              <p>En "Comparativa" puedes filtrar por categoría (filosófica, experimental, clínica, cognitiva, neurociencia) para ver qué corrientes pertenecen a cada tradición y compararlas entre sí.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Ubica los hitos en su contexto histórico</strong>
              <p>El Tab "Contexto Histórico" organiza los períodos y eventos por eras. Observa cómo el nacimiento de la psicología científica en 1879 coincide con la era del positivismo y la industrialización.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Conecta la psicología con otras disciplinas</strong>
              <p>La psicología cognitiva nació del encuentro con la lingüística (Chomsky) y la informática. La neurociencia cognitiva debe todo a la física y la medicina. Ninguna escuela psicológica se entiende en aislamiento.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender la historia de la psicología</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <p>La historia de la psicología es una cadena de reacciones: el conductismo rechazó el psicoanálisis, el humanismo rechazó el conductismo, la cognitiva reaccionó contra el conductismo. Entender cada escuela requiere entender contra qué reaccionaba.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>Las escuelas psicológicas tienen geografía: el psicoanálisis nació en Viena, el conductismo en EE.UU., la psicología humanista en California. El contexto cultural explica muchas de sus diferencias de énfasis.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <p>La psicología moderna no elige entre escuelas: integra lo que funciona. Un buen psicólogo clínico conoce el apego (psicoanalítico), la TCC (cognitivo-conductual) y las intervenciones basadas en mindfulness (contemplativo-cognitivo).</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💡</span>
            <p>Muchos conceptos de uso cotidiano provienen directamente de estas escuelas: el "inconsciente" (Freud), el "condicionamiento" (Pavlov), la "autorrealización" (Maslow), el "flow" (Csikszentmihalyi). La psicología ha moldeado el lenguaje de la cultura popular.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>⚠️ Esta cronología es educativa.</strong>
          <ul>
            <li>Para atención psicológica profesional consulta a un psicólogo colegiado. Esta herramienta no proporciona diagnóstico ni orientación clínica.</li>
            <li>Si tienes síntomas de ansiedad, depresión u otro trastorno mental, contacta con tu médico de cabecera o un psicólogo clínico.</li>
            <li>En España, el Colegio Oficial de Psicólogos tiene un buscador de profesionales en <strong>cop.es</strong>. El servicio público de salud mental es accesible a través del médico de atención primaria.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-psicologia')} />
      <ShareCard appName="visualizador-historia-psicologia" />
      <Footer appName="visualizador-historia-psicologia" />
    </div>
  );
}
