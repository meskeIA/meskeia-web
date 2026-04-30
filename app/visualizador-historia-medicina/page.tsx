'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaMedicina.module.css';
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

type Era = 'antiguedad' | 'mediaeval' | 'renacimiento' | 'industrial' | 'biomedica' | 'digital';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface Periodo {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  era: Era;
  descripcion: string;
  obraIconica: string;
  paises: string[];
  color: string;
}

interface EventoHistorico {
  anio: number;
  texto: string;
}

interface EraDefinicion {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

// ─────────────────────────────────────────────
// Utilidad: formatear años negativos
// ─────────────────────────────────────────────

function formatAnio(anio: number): string {
  if (anio === 9999) return 'Presente';
  if (anio < 0) return `${Math.abs(anio)} a.C.`;
  return `${anio}`;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: Periodo[] = [
  {
    id: 'hipocratica',
    nombre: 'Medicina Hipocrática',
    anioInicio: -460,
    anioFin: -270,
    era: 'antiguedad',
    descripcion: 'Hipócrates de Cos establece la medicina como disciplina racional, separándola de la magia. Introducción de la observación clínica y el pronóstico sistemático.',
    obraIconica: 'Corpus Hippocraticum',
    paises: ['Grecia'],
    color: '#7B6F47',
  },
  {
    id: 'alejandrina',
    nombre: 'Medicina Alejandrina',
    anioInicio: -330,
    anioFin: -30,
    era: 'antiguedad',
    descripcion: 'La Escuela de Alejandría practica la disección humana sistemática. Herófilo y Erasístrato describen el cerebro, el corazón y el sistema nervioso con precisión anatómica.',
    obraIconica: 'Biblioteca Médica de Alejandría',
    paises: ['Egipto', 'Grecia'],
    color: '#B8860B',
  },
  {
    id: 'galenica',
    nombre: 'Medicina Galénica',
    anioInicio: 130,
    anioFin: 1543,
    era: 'mediaeval',
    descripcion: 'Galeno de Pérgamo sistematiza el conocimiento médico antiguo. Su autoridad dominará la medicina occidental durante más de 1.400 años.',
    obraIconica: 'De Usu Partium (Galeno)',
    paises: ['Roma', 'Europa'],
    color: '#8B4513',
  },
  {
    id: 'islamica',
    nombre: 'Medicina Islámica',
    anioInicio: 830,
    anioFin: 1250,
    era: 'mediaeval',
    descripcion: 'Los médicos islámicos preservan y amplían el conocimiento griego. Avicena (Ibn Sina) escribe el Canon de Medicina, usado en universidades europeas hasta el siglo XVII.',
    obraIconica: 'Canon de Medicina (Avicena)',
    paises: ['Persia', 'Arabia', 'Al-Ándalus'],
    color: '#2E8B57',
  },
  {
    id: 'anatomia',
    nombre: 'Anatomía Moderna',
    anioInicio: 1490,
    anioFin: 1620,
    era: 'renacimiento',
    descripcion: 'Vesalio corrige a Galeno mediante disecciones sistemáticas. Leonardo da Vinci ilustra el cuerpo humano con precisión sin precedentes.',
    obraIconica: 'De Humani Corporis Fabrica (Vesalio, 1543)',
    paises: ['Italia', 'Países Bajos'],
    color: '#4682B4',
  },
  {
    id: 'fisiologia',
    nombre: 'Fisiología Experimental',
    anioInicio: 1628,
    anioFin: 1780,
    era: 'renacimiento',
    descripcion: 'Harvey descubre la circulación sanguínea. Malpighi observa los capilares con microscopio. Nace la fisiología como ciencia experimental rigurosa.',
    obraIconica: 'De Motu Cordis (Harvey, 1628)',
    paises: ['Inglaterra', 'Italia'],
    color: '#9370DB',
  },
  {
    id: 'clinica',
    nombre: 'Medicina Clínica Hospitalaria',
    anioInicio: 1750,
    anioFin: 1870,
    era: 'industrial',
    descripcion: 'Las grandes clínicas hospitalarias europeas desarrollan la semiología y la anatomía patológica. Laennec inventa el estetoscopio y sistematiza la auscultación.',
    obraIconica: 'Tratado de Auscultación Medial (Laennec, 1819)',
    paises: ['Francia', 'Austria', 'Alemania'],
    color: '#FF7043',
  },
  {
    id: 'microbiologia',
    nombre: 'Microbiología y Teoría de Gérmenes',
    anioInicio: 1860,
    anioFin: 1920,
    era: 'industrial',
    descripcion: 'Pasteur y Koch demuestran que los microorganismos causan enfermedades. Nace la bacteriología y la inmunología moderna.',
    obraIconica: 'Postulados de Koch (1884)',
    paises: ['Francia', 'Alemania'],
    color: '#20B2AA',
  },
  {
    id: 'cirugia',
    nombre: 'Cirugía Moderna',
    anioInicio: 1846,
    anioFin: 1950,
    era: 'biomedica',
    descripcion: 'La anestesia (1846) y la antisepsia (1867) transforman la cirugía de trance mortal a procedimiento seguro. Lister introduce el ácido carbólico.',
    obraIconica: 'Primera cirugía con éter (Boston, 1846)',
    paises: ['EE.UU.', 'Inglaterra'],
    color: '#E53935',
  },
  {
    id: 'farmacologia',
    nombre: 'Farmacología Industrial',
    anioInicio: 1900,
    anioFin: 9999,
    era: 'biomedica',
    descripcion: 'El descubrimiento de la penicilina (1928) inicia la era antibiótica. La industria farmacéutica desarrolla vacunas, antivirales y fármacos sintéticos masivamente.',
    obraIconica: 'Penicilina (Fleming, 1928)',
    paises: ['Reino Unido', 'EE.UU.', 'Global'],
    color: '#00ACC1',
  },
  {
    id: 'radiologia',
    nombre: 'Radiología y Diagnóstico por Imagen',
    anioInicio: 1895,
    anioFin: 9999,
    era: 'biomedica',
    descripcion: 'Röntgen descubre los rayos X. El siglo XX añade ecografía, TAC, resonancia magnética y PET. El diagnóstico se vuelve no invasivo y de alta precisión.',
    obraIconica: 'Descubrimiento de los rayos X (Röntgen, 1895)',
    paises: ['Alemania', 'Global'],
    color: '#1E88E5',
  },
  {
    id: 'biologia-molecular',
    nombre: 'Biología Molecular',
    anioInicio: 1953,
    anioFin: 9999,
    era: 'digital',
    descripcion: 'Watson y Crick describen la doble hélice del ADN. Nace la genética molecular, que revoluciona la comprensión de las enfermedades hereditarias y el cáncer.',
    obraIconica: 'Estructura del ADN (Watson-Crick, 1953)',
    paises: ['Reino Unido', 'EE.UU.'],
    color: '#F06292',
  },
  {
    id: 'genomica',
    nombre: 'Genómica y Proteómica',
    anioInicio: 1990,
    anioFin: 9999,
    era: 'digital',
    descripcion: 'El Proyecto Genoma Humano (1990-2003) secuencia los 3.000 millones de pares de bases. CRISPR (2012) permite editar genes con precisión quirúrgica.',
    obraIconica: 'Proyecto Genoma Humano (2003)',
    paises: ['EE.UU.', 'Global'],
    color: '#66BB6A',
  },
  {
    id: 'precision-ia',
    nombre: 'Medicina de Precisión e IA',
    anioInicio: 2015,
    anioFin: 9999,
    era: 'digital',
    descripcion: 'Algoritmos de IA diagnostican enfermedades con precisión comparable a especialistas. La medicina se personaliza según el perfil genómico de cada paciente.',
    obraIconica: 'AlphaFold — predicción de proteínas (DeepMind, 2020)',
    paises: ['Global'],
    color: '#FFD54F',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -460, texto: 'Hipócrates codifica el juramento médico y la ética clínica' },
  { anio: 1543, texto: 'Vesalio publica De Humani Corporis Fabrica, corrigiendo a Galeno' },
  { anio: 1628, texto: 'Harvey demuestra experimentalmente la circulación sanguínea' },
  { anio: 1796, texto: 'Jenner desarrolla la primera vacuna contra la viruela' },
  { anio: 1846, texto: 'Primera cirugía con anestesia general en Massachusetts General Hospital' },
  { anio: 1895, texto: 'Röntgen descubre los rayos X y los aplica al diagnóstico médico' },
  { anio: 1928, texto: 'Fleming descubre la penicilina, revolucionando el tratamiento de infecciones' },
  { anio: 1953, texto: 'Watson y Crick describen la estructura de doble hélice del ADN' },
  { anio: 1980, texto: 'OMS declara erradicada la viruela — primera enfermedad eliminada por vacunación' },
  { anio: 2003, texto: 'Publicación completa del Proyecto Genoma Humano' },
];

const ERAS_DEF: EraDefinicion[] = [
  { nombre: 'Antigüedad', desde: -500, hasta: 500, icono: '🏛️' },
  { nombre: 'Edad Media e Islam', desde: 500, hasta: 1400, icono: '📜' },
  { nombre: 'Renacimiento científico', desde: 1400, hasta: 1750, icono: '🔬' },
  { nombre: 'Medicina industrial', desde: 1750, hasta: 1900, icono: '🏥' },
  { nombre: 'Revolución biomédica', desde: 1900, hasta: 1970, icono: '💊' },
  { nombre: 'Biomedicina digital', desde: 1970, hasta: 9999, icono: '🧬' },
];

const ETIQUETAS_ERA: Record<Era, string> = {
  antiguedad: 'Antigüedad',
  mediaeval: 'Edad Media',
  renacimiento: 'Renacimiento',
  industrial: 'Era Industrial',
  biomedica: 'Biomedicina',
  digital: 'Era Digital',
};

const COLORES_ERA: Record<Era, string> = {
  antiguedad: '#7B6F47',
  mediaeval: '#8B4513',
  renacimiento: '#4682B4',
  industrial: '#FF7043',
  biomedica: '#E53935',
  digital: '#66BB6A',
};

// ─────────────────────────────────────────────
// SVG Timeline — constantes
// ─────────────────────────────────────────────

const ANIO_INICIO_GLOBAL = -500;
const ANIO_FIN_GLOBAL = 2025;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 55;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - ANIO_INICIO_GLOBAL) / (ANIO_FIN_GLOBAL - ANIO_INICIO_GLOBAL)) * AREA_ANCHO;
}

// ─────────────────────────────────────────────
// Subcomponente: Panel de detalle
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: Periodo }) {
  const anioFinTexto = formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_ERA[periodo.era]}</span>

      <div className={styles.descripcionBox}>
        <p>{periodo.descripcion}</p>
      </div>

      <div className={styles.detalleMeta}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Países / Regiones</h4>
          <div className={styles.badgesRow}>
            {periodo.paises.map((p) => (
              <span key={p} className={styles.instrumentoBadge}>{p}</span>
            ))}
          </div>
        </div>
        <div className={styles.obraIconica}>
          <span className={styles.obraIconicaLabel}>Obra / Hito icónico</span>
          <p>{periodo.obraIconica}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<Periodo | null>(null);

  const filas: Periodo[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const periodo of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      const limiteUltimo = ultimoEnFila
        ? anioAX(ultimoEnFila.anioFin === 9999 ? ANIO_FIN_GLOBAL : ultimoEnFila.anioFin) + 4
        : -Infinity;
      if (!ultimoEnFila || limiteUltimo <= anioAX(periodo.anioInicio)) {
        filas[f].push(periodo);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(periodo);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  // Marcadores de siglos — incluyendo a.C. y d.C.
  const marcadores: number[] = [-400, -200, 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. Abarca desde el 460 a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la medicina"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcadores */}
          {marcadores.map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">
                {m < 0 ? `${Math.abs(m)}a.C.` : m}
              </text>
            </g>
          ))}

          {/* Rectángulos de períodos */}
          {filas.map((fila, fi) =>
            fila.map((periodo) => {
              const anioFin = periodo.anioFin === 9999 ? ANIO_FIN_GLOBAL : periodo.anioFin;
              const x = anioAX(periodo.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === periodo.id;

              return (
                <g key={periodo.id} onClick={() => setSeleccionado(esSeleccionado ? null : periodo)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={periodo.color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 50 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={10}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {periodo.nombre}
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
        {(Object.keys(ETIQUETAS_ERA) as Era[]).map((era) => (
          <span key={era} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: COLORES_ERA[era] }} aria-hidden="true" />
            {ETIQUETAS_ERA[era]}
          </span>
        ))}
      </div>

      {seleccionado && <PanelDetalle periodo={seleccionado} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Período en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const periodo = PERIODOS[indice];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Período en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {PERIODOS.map((p, i) => (
          <button
            key={p.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: p.color, borderColor: p.color } : {}}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: periodo.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: periodo.color }}>
          <h3>{periodo.nombre}</h3>
          <p>{formatAnio(periodo.anioInicio)} – {formatAnio(periodo.anioFin)}</p>
          <span>{ETIQUETAS_ERA[periodo.era]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <p className={styles.descripcionText}>{periodo.descripcion}</p>

          <div className={styles.detalleMeta}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Países / Regiones</h4>
              <div className={styles.badgesRow}>
                {periodo.paises.map((p) => (
                  <span key={p} className={styles.instrumentoBadge}>{p}</span>
                ))}
              </div>
            </div>
            <div className={styles.obraIconica}>
              <span className={styles.obraIconicaLabel}>Obra / Hito icónico</span>
              <p>{periodo.obraIconica}</p>
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
  const [eraFiltro, setEraFiltro] = useState<Era | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const periodosFiltrados = useMemo(() => {
    return PERIODOS.filter((p) => {
      const coincideEra = eraFiltro === 'todos' || p.era === eraFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        p.nombre.toLowerCase().includes(termino) ||
        p.obraIconica.toLowerCase().includes(termino) ||
        p.paises.some((pais) => pais.toLowerCase().includes(termino));
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
          Todos
        </button>
        {(Object.keys(ETIQUETAS_ERA) as Era[]).map((era) => (
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
        placeholder="Buscar por período, hito o país..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período médico"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Años</th>
              <th>Era</th>
              <th>Hito icónico</th>
              <th>Países</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((p, i) => (
              <tr
                key={p.id}
                style={i % 2 === 0 ? { background: `${p.color}18` } : {}}
              >
                <td><strong style={{ color: p.color }}>{p.nombre}</strong></td>
                <td>{formatAnio(p.anioInicio)} – {formatAnio(p.anioFin)}</td>
                <td>
                  <span className={styles.badgeCategoria} style={{ background: `${COLORES_ERA[p.era]}22`, color: COLORES_ERA[p.era] }}>
                    {ETIQUETAS_ERA[p.era]}
                  </span>
                </td>
                <td>{p.obraIconica}</td>
                <td>{p.paises.join(', ')}</td>
              </tr>
            ))}
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
// Tab 4: Contexto Histórico por eras
// ─────────────────────────────────────────────

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos médicos y eventos históricos organizados por eras, desde la Grecia antigua hasta la medicina digital.
      </p>

      <div className={styles.erasGrid}>
        {ERAS_DEF.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anioInicio < era.hasta && (p.anioFin === 9999 ? era.hasta === 9999 : p.anioFin > era.desde)
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

export default function HistoriaMedicina() {
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
        <h1 className={styles.heroTitle}>Historia de la Medicina</h1>
        <p className={styles.heroSubtitle}>
          De Hipócrates a la inteligencia artificial — cronología visual de 2.500 años de historia médica, descubrimientos y hitos que transformaron la salud humana
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
        title="¿Cómo ha evolucionado la medicina a lo largo de la historia?"
        subtitle="Un recorrido por los grandes períodos que configuraron la ciencia médica moderna"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: períodos clave de la historia médica</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Años</th>
                <th>Aportación clave</th>
                <th>Figura representativa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Medicina Hipocrática</strong></td>
                <td>460 a.C. – 270 a.C.</td>
                <td>Observación clínica racional, ética médica</td>
                <td>Hipócrates de Cos</td>
              </tr>
              <tr>
                <td><strong>Medicina Islámica</strong></td>
                <td>830 – 1250</td>
                <td>Canon de Medicina, preservación del saber griego</td>
                <td>Avicena (Ibn Sina)</td>
              </tr>
              <tr>
                <td><strong>Anatomía Moderna</strong></td>
                <td>1490 – 1620</td>
                <td>Disección sistemática, corrección de Galeno</td>
                <td>Andrés Vesalio</td>
              </tr>
              <tr>
                <td><strong>Microbiología y Gérmenes</strong></td>
                <td>1860 – 1920</td>
                <td>Teoría microbiana de la enfermedad</td>
                <td>Louis Pasteur / Robert Koch</td>
              </tr>
              <tr>
                <td><strong>Biología Molecular</strong></td>
                <td>1953 – presente</td>
                <td>Estructura del ADN, genética molecular</td>
                <td>Watson y Crick</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Casos de Uso */}
        <h3>¿Para quién es útil este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🩺</span>
            <div>
              <strong>Estudiante de medicina</strong>
              <p>Sitúa en perspectiva los conceptos que estudias: entender de dónde viene cada práctica médica refuerza la comprensión y la memoria a largo plazo.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏥</span>
            <div>
              <strong>Profesional de la salud</strong>
              <p>Contextualiza la práctica clínica actual en la larga cadena de descubrimientos que la hacen posible: desde el juramento hipocrático hasta CRISPR.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
            <div>
              <strong>Historiador de la ciencia</strong>
              <p>Explora las transiciones entre períodos, las rupturas paradigmáticas y la influencia de los contextos políticos y culturales en el avance médico.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
            <div>
              <strong>Público general curioso</strong>
              <p>Descubre cómo pasamos de las teorías de los humores a la edición genética en apenas 2.500 años de historia apasionante y sorprendentemente no lineal.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué es el juramento hipocrático y sigue vigente hoy?</strong>
            <p>El juramento hipocrático (siglo V a.C.) estableció los principios éticos fundamentales de la medicina: beneficencia, confidencialidad y no maleficencia. El texto original ha sido ampliamente modificado — pocas facultades usan la versión literal — pero sus principios éticos nucleares siguen siendo el fundamento deontológico de la medicina moderna, recogidos en el Código de Deontología Médica.</p>
            <span className={styles.faqTip}>El juramento original prohíbe explícitamente la cirugía — esa tarea correspondía a los cirujanos-barberos, no a los médicos.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué dominó Galeno la medicina durante 1.400 años?</strong>
            <p>Galeno (129-216 d.C.) sistematizó todo el saber médico grecorromano en un corpus monumental y lo integró en una cosmología cristiana compatible. La Iglesia medieval canonizó su obra como verdad incuestionable. Solo la combinación del humanismo renacentista, la imprenta y el espíritu científico de Vesalio (1543) permitió cuestionar sus errores anatómicos, fundamentalmente derivados de disecciones en animales que extrapoló al humano.</p>
            <span className={styles.faqTip}>Galeno describió la sangre fluyendo por el tabique cardiaco — una apertura que no existe en humanos. Harvey lo refutó experimentalmente en 1628.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué cambió la teoría de los gérmenes de Pasteur y Koch?</strong>
            <p>Antes de 1860, la medicina dominante creía que las enfermedades surgían espontáneamente del &quot;miasma&quot; (aire corrupto) o del desequilibrio de humores. Pasteur demostró que los microorganismos causan fermentación y putrefacción; Koch identificó bacterias específicas para enfermedades específicas. Esto transformó radicalmente la higiene hospitalaria, la vacunación y la cirugía antiséptica de Lister.</p>
            <span className={styles.faqTip}>Semmelweis propuso el lavado de manos en 1847, décadas antes de que la teoría microbiana lo explicara. Murió marginado — los postulados de Koch le dieron la razón póstumamente.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo comenzó la medicina basada en evidencia?</strong>
            <p>La medicina basada en evidencia (MBE) como disciplina formal surgió en la Universidad McMaster (Canadá) en los años 1980-1990, sistematizando el uso de ensayos clínicos aleatorizados y meta-análisis. Sin embargo, sus raíces son más antiguas: los ensayos clínicos de James Lind con el escorbuto (1747) y las observaciones estadísticas de Nightingale durante la Guerra de Crimea (1854) son considerados precursores fundamentales.</p>
            <span className={styles.faqTip}>Florence Nightingale fue una pionera en estadística médica: sus gráficas de área polar (rosas) visualizaron que más soldados morían por infecciones hospitalarias que por heridas de combate.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la medicina de precisión y en qué se diferencia de la medicina tradicional?</strong>
            <p>La medicina tradicional aplica tratamientos iguales a todos los pacientes con el mismo diagnóstico. La medicina de precisión (o personalizada) adapta la prevención y el tratamiento al perfil genómico, proteómico y microbiómico de cada individuo. La secuenciación del genoma completo ya es clínicamente accesible en enfermedades oncológicas y raras. La IA acelera el análisis de estos datos a escala imposible para la capacidad humana.</p>
            <span className={styles.faqTip}>AlphaFold (DeepMind, 2020) predijo la estructura tridimensional de casi todas las proteínas humanas conocidas — un problema sin resolver durante 50 años — en meses.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo navegar 2.500 años de historia médica sin perderse</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Sitúate en la Antigüedad: el origen racional</strong>
              <p>Comienza por Hipócrates (460 a.C.) y la Escuela de Alejandría. Este es el momento fundacional: la medicina se separa de la religión y la magia. La observación clínica y el pronóstico sistemático nacen aquí.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Salta al medievo islámico: el puente que salvó el conocimiento</strong>
              <p>Entre los siglos IX y XIII, mientras Europa estaba en la oscuridad médica, los médicos islámicos tradujeron, ampliaron y sistematizaron toda la medicina grecorromana. Sin Avicena, el Renacimiento médico europeo habría tardado siglos más.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Comprende la revolución científica del XVI-XVII</strong>
              <p>Vesalio (1543) y Harvey (1628) establecen el método experimental en medicina: observar, medir y corregir la autoridad cuando la evidencia lo exige. La anatomía y la fisiología se convierten en ciencias empíricas.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Sigue la revolución bacteriológica del XIX</strong>
              <p>Pasteur, Koch y Lister transforman la medicina de arte especulativo a ciencia experimental rigurosa. La anestesia (1846) y la antisepsia (1867) hacen de la cirugía un procedimiento viable. La mortalidad hospitalaria cae drásticamente.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Llega a la era genómica: el mapa completo del ser humano</strong>
              <p>Watson y Crick (1953), el Proyecto Genoma Humano (2003) y CRISPR (2012) abren la era de la medicina molecular. Por primera vez en la historia, podemos no solo tratar enfermedades sino potencialmente corregir sus causas genéticas en el origen.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para usar este visualizador eficazmente</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Usa la pestaña &quot;Línea del Tiempo&quot; primero para tener la perspectiva completa. La superposición de períodos es intencional: la medicina nunca avanza de forma limpia y secuencial.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <p>En &quot;Comparativa&quot; filtra por era para ver qué períodos coexistieron. La Medicina Galénica y la Medicina Islámica se solapan durante siglos — no son sucesivas sino paralelas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>Observa los eventos históricos en &quot;Contexto Histórico&quot; y conecta cada hito médico con su contexto político y cultural. La Revolución Francesa y la medicina hospitalaria francesa son inseparables.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <p>Los grandes saltos médicos coinciden siempre con avances en tecnología: el microscopio (Malpighi), la imprenta (Vesalio), el ordenador (genómica), la IA (medicina de precisión).</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al estudiar historia de la medicina</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Confundir <strong>&quot;medicina antigua = primitiva&quot;</strong> — Hipócrates describía síntomas clínicos con una precisión que no fue superada durante siglos. Sus observaciones sobre el pronóstico siguen siendo válidas.</li>
            <li>Creer que la medicina medieval europea fue un período de <strong>estancamiento total</strong> — los monasterios conservaron textos médicos clásicos y desarrollaron herbolaria y enfermería sistemática.</li>
            <li>Atribuir la penicilina solo a Fleming: <strong>Chain, Florey y Heatley</strong> desarrollaron la producción industrializable. El Nobel de 1945 fue compartido por los tres, aunque Fleming es el más recordado.</li>
            <li>Pensar que la medicina basada en evidencia <strong>ha sustituido la experiencia clínica</strong>: la MBE no niega el juicio del médico, lo complementa con datos poblacionales para reducir el sesgo.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-medicina')} />
      <ShareCard appName="visualizador-historia-medicina" />
      <Footer appName="visualizador-historia-medicina" />
    </div>
  );
}
