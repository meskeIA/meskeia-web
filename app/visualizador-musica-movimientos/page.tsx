'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './MusicaMovimientos.module.css';
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

type Categoria = 'medieval' | 'renacimiento' | 'barroco' | 'clasico' | 'romantico' | 'moderno' | 'contemporaneo';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface MovimientoMusical {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  compositores: string[];
  caracteristicas: string[];
  obraIconica: string;
  instrumentos: string[];
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const MOVIMIENTOS: MovimientoMusical[] = [
  {
    id: 'gregoriano', nombre: 'Canto Gregoriano', anioInicio: 850, anioFin: 1150,
    categoria: 'medieval',
    compositores: ['Hildegarda de Bingen', 'Papa Gregorio I (atribuido)'],
    caracteristicas: ['Monofónico', 'Texto litúrgico en latín', 'Sin acompañamiento', 'Modos gregorianos', 'Transmisión oral y manuscrita'],
    obraIconica: 'Ordo Virtutum – Hildegarda de Bingen',
    instrumentos: ['Voz humana'],
    contexto: 'Nacido en los monasterios medievales, el canto gregoriano fue el vehículo sonoro de la liturgia cristiana occidental durante siglos. Su nombre honra al papa Gregorio I, aunque su corpus se formó a lo largo de varios siglos.',
    color: '#8B6914',
  },
  {
    id: 'ars-antiqua', nombre: 'Ars Antiqua', anioInicio: 1150, anioFin: 1320,
    categoria: 'medieval',
    compositores: ['Léonin', 'Pérotin', 'Franco de Colonia'],
    caracteristicas: ['Polifonía temprana', 'Organum', 'Escuela de Notre Dame', 'Notación mensural', 'Conductus y motete'],
    obraIconica: 'Viderunt Omnes – Pérotin',
    instrumentos: ['Voz (tenor, duplum, triplum)', 'Organistrum'],
    contexto: 'En torno a la catedral de Notre Dame de París surgió la primera gran tradición polifónica occidental. Léonin y Pérotin codificaron el organum y sentaron las bases de la música escrita.',
    color: '#A0522D',
  },
  {
    id: 'ars-nova', nombre: 'Ars Nova', anioInicio: 1320, anioFin: 1400,
    categoria: 'medieval',
    compositores: ['Guillaume de Machaut', 'Philippe de Vitry', 'Francesco Landini'],
    caracteristicas: ['Mayor libertad rítmica', 'Isorritmia', 'Canciones profanas', 'Misa polifónica completa', 'Notación mensural avanzada'],
    obraIconica: 'Messe de Nostre Dame – Guillaume de Machaut',
    instrumentos: ['Voz', 'Laúd', 'Fídula', 'Arpa medieval'],
    contexto: 'El Ars Nova rompió la rigidez del período anterior, abrazando la complejidad rítmica y el repertorio profano. Coincidió con la Peste Negra y la crisis del papado avignonés.',
    color: '#B8860B',
  },
  {
    id: 'renacimiento', nombre: 'Renacimiento Musical', anioInicio: 1400, anioFin: 1600,
    categoria: 'renacimiento',
    compositores: ['Josquin des Prés', 'Giovanni Pierluigi da Palestrina', 'Tomás Luis de Victoria', 'Orlando di Lasso'],
    caracteristicas: ['Polifonía vocal plena', 'Madrigal', 'Misa y motete', 'Humanismo musical', 'Contrapunto imitativo', 'Claridad textual'],
    obraIconica: 'Missa Papae Marcelli – Palestrina',
    instrumentos: ['Voz', 'Virginal', 'Laúd renacentista', 'Flauta de pico', 'Viola da gamba'],
    contexto: 'La música renacentista viajó desde Flandes al resto de Europa refinando la polifonía con nuevos ideales humanistas. El Concilio de Trento convirtió la claridad textual en imperativo religioso.',
    color: '#D4A017',
  },
  {
    id: 'barroco', nombre: 'Barroco Musical', anioInicio: 1600, anioFin: 1750,
    categoria: 'barroco',
    compositores: ['Johann Sebastian Bach', 'Antonio Vivaldi', 'Georg Friedrich Händel', 'Claudio Monteverdi', 'Henry Purcell'],
    caracteristicas: ['Bajo continuo', 'Contrapunto complejo', 'Ópera y oratorio', 'Forma da capo', 'Suite y fuga', 'Teoría de los afectos'],
    obraIconica: 'Las Cuatro Estaciones – Antonio Vivaldi',
    instrumentos: ['Clavicémbalo', 'Órgano de tubos', 'Violín barroco', 'Cello', 'Trompeta natural', 'Traverso barroco'],
    contexto: 'El Barroco nació en Italia como nuevo lenguaje expresivo. La ópera de Monteverdi y las fugas de Bach definieron un período de ornamentación y control que coincidió con el absolutismo monárquico europeo.',
    color: '#CD853F',
  },
  {
    id: 'clasicismo', nombre: 'Clasicismo', anioInicio: 1750, anioFin: 1820,
    categoria: 'clasico',
    compositores: ['Joseph Haydn', 'Wolfgang Amadeus Mozart', 'Ludwig van Beethoven (período temprano)', 'Muzio Clementi'],
    caracteristicas: ['Forma sonata', 'Sinfonía en cuatro movimientos', 'Claridad formal', 'Equilibrio y elegancia', 'Cuarteto de cuerda', 'Dinámica expresiva graduada'],
    obraIconica: 'Sinfonía nº 40 en sol menor, K. 550 – W. A. Mozart',
    instrumentos: ['Pianoforte', 'Cuarteto de cuerda', 'Orquesta clásica', 'Flauta traversa moderna', 'Clarinete'],
    contexto: 'En Viena convergieron los tres grandes del clasicismo. La Ilustración impuso la razón y el orden: la música debía ser bella y comprensible. La forma sonata se convirtió en el armazón arquitectónico de toda una época.',
    color: '#4682B4',
  },
  {
    id: 'romanticismo', nombre: 'Romanticismo', anioInicio: 1820, anioFin: 1900,
    categoria: 'romantico',
    compositores: ['Franz Schubert', 'Johannes Brahms', 'Richard Wagner', 'Piotr Tchaikovsky', 'Frédéric Chopin', 'Franz Liszt', 'Giuseppe Verdi'],
    caracteristicas: ['Expresión emocional intensa', 'Música de programa', 'Leitmotiv wagneriano', 'Ópera romántica', 'Virtuosismo', 'Poema sinfónico', 'Lied alemán'],
    obraIconica: '9ª Sinfonía en re menor, op. 125 – Ludwig van Beethoven',
    instrumentos: ['Piano de concierto moderno', 'Orquesta romántica (hasta 100 músicos)', 'Trombón', 'Tuba', 'Clarinete'],
    contexto: 'El Romanticismo volcó la emoción individual sobre la razón ilustrada. Wagner reinventó la ópera como Gesamtkunstwerk (obra de arte total). Beethoven legó el ideal del compositor como genio solitario e incomprendido.',
    color: '#C04040',
  },
  {
    id: 'impresionismo', nombre: 'Impresionismo Musical', anioInicio: 1890, anioFin: 1930,
    categoria: 'moderno',
    compositores: ['Claude Debussy', 'Maurice Ravel', 'Erik Satie', 'Ottorino Respighi'],
    caracteristicas: ['Ambigüedad tonal', 'Escalas pentatónicas y modales', 'Color tímbrico', 'Textura etérea', 'Inspiración en la pintura y la poesía simbolista'],
    obraIconica: 'La Mer – Claude Debussy',
    instrumentos: ['Piano (nuevo uso del pedal sostenido)', 'Flauta', 'Arpa', 'Cuerdas en divisi', 'Celesta'],
    contexto: 'Debussy rechazó el peso germánico e inspirado en el gamelan javanés y los pintores impresionistas disolvió los bordes del acorde, abriendo la puerta a la modernidad musical del siglo XX.',
    color: '#6A9FB5',
  },
  {
    id: 'expresionismo', nombre: 'Expresionismo y Atonalismo', anioInicio: 1908, anioFin: 1940,
    categoria: 'moderno',
    compositores: ['Arnold Schoenberg', 'Alban Berg', 'Anton Webern', 'Igor Stravinsky'],
    caracteristicas: ['Atonalismo libre', 'Dodecafonismo (serie de 12 tonos)', 'Expresión angustiada', 'Ruptura con la tonalidad', 'Klangfarbenmelodie', 'Sprechstimme'],
    obraIconica: 'Pierrot Lunaire, op. 21 – Arnold Schoenberg',
    instrumentos: ['Piano preparado', 'Percusión ampliada', 'Voz hablada-cantada (Sprechstimme)'],
    contexto: 'La Segunda Escuela de Viena dinamitó la tonalidad occidental. Coincidió con el psicoanálisis de Freud, el expresionismo pictórico y la angustia de una Europa que marchaba hacia la Gran Guerra.',
    color: '#6A0DAD',
  },
  {
    id: 'jazz', nombre: 'Jazz', anioInicio: 1900, anioFin: 9999,
    categoria: 'contemporaneo',
    compositores: ['Louis Armstrong', 'Duke Ellington', 'Charlie Parker', 'Miles Davis', 'John Coltrane', 'Bill Evans'],
    caracteristicas: ['Improvisación como núcleo creativo', 'Blues y swing', 'Síncopa y poliritmo', 'Call and response', 'Evolución: swing → bebop → cool → free jazz'],
    obraIconica: 'Kind of Blue – Miles Davis',
    instrumentos: ['Trompeta', 'Saxofón', 'Piano', 'Contrabajo', 'Batería', 'Trombón', 'Clarinete'],
    contexto: 'Nacido en Nueva Orleans de la confluencia africana y europea, el jazz fue la primera música netamente americana. De los speakeasies de los años 20 a las vanguardias de los 60, nunca dejó de reinventarse.',
    color: '#2E4057',
  },
  {
    id: 'electroacustica', nombre: 'Música Electroacústica', anioInicio: 1948, anioFin: 9999,
    categoria: 'contemporaneo',
    compositores: ['Pierre Schaeffer', 'Karlheinz Stockhausen', 'Pierre Henry', 'Iannis Xenakis', 'Brian Eno'],
    caracteristicas: ['Musique concrète', 'Síntesis electrónica', 'Tape music', 'Música estocástica', 'Ambient', 'Manipulación de grabaciones'],
    obraIconica: 'Gesang der Jünglinge – Karlheinz Stockhausen',
    instrumentos: ['Oscilador electrónico', 'Magnetófono', 'Sintetizador Moog', 'Ordenador'],
    contexto: 'Los estudios de radio de París y Colonia se convirtieron en laboratorios sonoros. Por primera vez los compositores no necesitaban intérpretes: la electricidad era el nuevo instrumento universal.',
    color: '#1A6B5A',
  },
  {
    id: 'rock-pop', nombre: 'Rock y Pop', anioInicio: 1955, anioFin: 9999,
    categoria: 'contemporaneo',
    compositores: ['Elvis Presley', 'The Beatles', 'Led Zeppelin', 'David Bowie', 'Bob Dylan', 'Pink Floyd'],
    caracteristicas: ['Guitarra eléctrica como identidad', 'Forma verso-estribillo', 'Cultura juvenil rebelde', 'Grabación multipista', 'Álbum conceptual'],
    obraIconica: "Sgt. Pepper's Lonely Hearts Club Band – The Beatles",
    instrumentos: ['Guitarra eléctrica', 'Bajo eléctrico', 'Batería', 'Teclados Fender Rhodes', 'Sintetizador'],
    contexto: 'El rock fundió el rhythm & blues afroamericano con la sensibilidad blanca sureña. Los Beatles demostraron que el pop podía ser arte; el punk demostró que podía ser revolución.',
    color: '#C0392B',
  },
  {
    id: 'minimalismo', nombre: 'Minimalismo Musical', anioInicio: 1960, anioFin: 9999,
    categoria: 'contemporaneo',
    compositores: ['Philip Glass', 'Steve Reich', 'Terry Riley', 'La Monte Young', 'Arvo Pärt'],
    caracteristicas: ['Repetición gradual y transformación lenta', 'Proceso como estructura', 'Tonalidad recuperada', 'Influencias no occidentales', 'Catarsis hipnótica'],
    obraIconica: 'Music for 18 Musicians – Steve Reich',
    instrumentos: ['Piano', 'Marimba', 'Saxofón', 'Violín', 'Voz femenina amplificada'],
    contexto: 'Como reacción al serialismo hermético, los minimalistas recuperaron el pulso y la tonalidad. Reich estudió percusión en Ghana; Glass trabajó con Ravi Shankar. El resultado fue una música de catarsis lenta.',
    color: '#27AE60',
  },
  {
    id: 'electronica-dance', nombre: 'Música Electrónica y Dance', anioInicio: 1977, anioFin: 9999,
    categoria: 'contemporaneo',
    compositores: ['Kraftwerk', 'Daft Punk', 'Aphex Twin', 'Burial', 'Four Tet'],
    caracteristicas: ['Secuenciadores MIDI', 'Sampler y loops', 'Caja de ritmos TR-808/909', "Subgéneros: techno, house, ambient, drum'n'bass", 'Producción digital en DAW'],
    obraIconica: 'Trans-Europe Express – Kraftwerk',
    instrumentos: ['Sintetizador analógico', 'Drum machine', 'Sampler', 'Controlador MIDI', 'Software DAW'],
    contexto: 'Kraftwerk inventó el futuro sonoro desde Düsseldorf. La drum machine Roland TR-808 se convirtió en el corazón del hip-hop y del dance. Hoy la producción electrónica es el lenguaje musical global más extendido.',
    color: '#8E44AD',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1000, evento: 'Guido de Arezzo inventa la notación musical moderna (solmización)' },
  { anio: 1501, evento: 'Ottaviano Petrucci imprime por primera vez partituras musicales' },
  { anio: 1600, evento: 'Estreno de Euridice: primera ópera conservada completa' },
  { anio: 1709, evento: 'Bartolomeo Cristofori inventa el pianoforte en Florencia' },
  { anio: 1877, evento: 'Thomas Edison inventa el fonógrafo: la música puede grabarse y reproducirse' },
  { anio: 1913, evento: 'La Consagración de la Primavera de Stravinsky provoca un escándalo en París' },
  { anio: 1948, evento: 'Pierre Schaeffer crea la musique concrète en la radio de París' },
  { anio: 1969, evento: 'Festival de Woodstock: apogeo de la contracultura musical' },
  { anio: 2003, evento: 'iTunes transforma la distribución musical; el álbum como formato entra en crisis' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  medieval: 'Medieval',
  renacimiento: 'Renacimiento',
  barroco: 'Barroco',
  clasico: 'Clásico',
  romantico: 'Romántico',
  moderno: 'Moderno',
  contemporaneo: 'Contemporáneo',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  medieval: '#8B6914',
  renacimiento: '#D4A017',
  barroco: '#CD853F',
  clasico: '#4682B4',
  romantico: '#C04040',
  moderno: '#6A9FB5',
  contemporaneo: '#2E86AB',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ movimiento }: { movimiento: MovimientoMusical }) {
  const anioFinTexto = movimiento.anioFin === 9999 ? 'actualidad' : String(movimiento.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: movimiento.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: movimiento.color }}>{movimiento.nombre}</h3>
      <p className={styles.detallePeriodo}>{movimiento.anioInicio} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[movimiento.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Características</h4>
          <ul className={styles.caracteristicasList}>
            {movimiento.caracteristicas.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Compositores clave</h4>
          <ul className={styles.artistasList}>
            {movimiento.compositores.map((comp) => (
              <li key={comp}>{comp}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.instrumentosBadges}>
        <h4 className={styles.detalleSubtitulo}>Instrumentos</h4>
        <div className={styles.badgesRow}>
          {movimiento.instrumentos.map((inst) => (
            <span key={inst} className={styles.instrumentoBadge}>{inst}</span>
          ))}
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra icónica</span>
        <p>{movimiento.obraIconica}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{movimiento.contexto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_INICIO_GLOBAL = 850;
const AÑO_FIN_GLOBAL = 2024;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_INICIO_GLOBAL) / (AÑO_FIN_GLOBAL - AÑO_INICIO_GLOBAL)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<MovimientoMusical | null>(null);

  // Distribuir movimientos en filas para evitar solapamiento
  const filas: MovimientoMusical[][] = [[], [], [], []];
  const ordenados = [...MOVIMIENTOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const mov of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin === 9999 ? AÑO_FIN_GLOBAL : ultimoEnFila.anioFin) + 4 <= anioAX(mov.anioInicio)) {
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
  for (let s = 900; s <= 2000; s += 100) siglos.push(s);

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
          aria-label="Línea del tiempo de movimientos musicales"
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
            fila.map((mov) => {
              const anioFin = mov.anioFin === 9999 ? AÑO_FIN_GLOBAL : mov.anioFin;
              const x = anioAX(mov.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
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
                      {mov.nombre}
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

      {/* Panel de detalle al hacer clic */}
      {seleccionado && (
        <PanelDetalle movimiento={seleccionado} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Movimiento en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const movimiento = MOVIMIENTOS[indice];
  const anioFinTexto = movimiento.anioFin === 9999 ? 'actualidad' : String(movimiento.anioFin);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Movimiento en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {MOVIMIENTOS.map((mov, i) => (
          <button
            type="button"
            key={mov.id}
            aria-pressed={i === indice}
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
          <span>{ETIQUETAS_CATEGORIA[movimiento.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Características principales</h4>
              <ul className={styles.caracteristicasList}>
                {movimiento.caracteristicas.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Compositores clave</h4>
              <ul className={styles.artistasList}>
                {movimiento.compositores.map((comp) => <li key={comp}>{comp}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.instrumentosBadges}>
            <h4 className={styles.detalleSubtitulo}>Instrumentos</h4>
            <div className={styles.badgesRow}>
              {movimiento.instrumentos.map((inst) => (
                <span key={inst} className={styles.instrumentoBadge}>{inst}</span>
              ))}
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra icónica</span>
            <p>{movimiento.obraIconica}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
            <p>{movimiento.contexto}</p>
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
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const movimientosFiltrados = useMemo(() => {
    return MOVIMIENTOS.filter((mov) => {
      const coincideCategoria = categoriaFiltro === 'todos' || mov.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        mov.nombre.toLowerCase().includes(termino) ||
        mov.compositores.some((c) => c.toLowerCase().includes(termino));
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoriaFiltro, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          type="button"
          aria-pressed={categoriaFiltro === 'todos'}
          className={`${styles.filtroCatBtn} ${categoriaFiltro === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setCategoriaFiltro('todos')}
        >
          Todos
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <button
            type="button"
            key={cat}
            aria-pressed={categoriaFiltro === cat}
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
        placeholder="Buscar por movimiento o compositor..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar movimiento musical"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Movimiento</th>
              <th>Período</th>
              <th>Categoría</th>
              <th>Compositor clave</th>
              <th>Característica principal</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((mov, i) => {
              const anioFinTexto = mov.anioFin === 9999 ? 'actualidad' : String(mov.anioFin);
              return (
                <tr
                  key={mov.id}
                  style={i % 2 === 0 ? { background: `${mov.color}18` } : {}}
                >
                  <td><strong style={{ color: mov.color }}>{mov.nombre}</strong></td>
                  <td>{mov.anioInicio}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[mov.categoria]}22`, color: COLORES_CATEGORIA[mov.categoria] }}>
                      {ETIQUETAS_CATEGORIA[mov.categoria]}
                    </span>
                  </td>
                  <td>{mov.compositores[0]}</td>
                  <td>{mov.caracteristicas[0]}</td>
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
// Tab 4: Contexto Histórico — vista por eras
// ─────────────────────────────────────────────

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

const ERAS: Era[] = [
  { nombre: 'Edad Media', desde: 850, hasta: 1400, icono: '⛪' },
  { nombre: 'Renacimiento', desde: 1400, hasta: 1600, icono: '🎭' },
  { nombre: 'Barroco y Clasicismo', desde: 1600, hasta: 1820, icono: '🎻' },
  { nombre: 'Romanticismo e Impresionismo', desde: 1820, hasta: 1900, icono: '🎹' },
  { nombre: 'Primera mitad del siglo XX', desde: 1900, hasta: 1960, icono: '🎷' },
  { nombre: 'Música contemporánea', desde: 1960, hasta: 9999, icono: '🎛️' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Movimientos musicales y eventos históricos organizados por eras.
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
                      <span className={styles.eraEventoTexto}>{ev.evento}</span>
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

export default function VisualizadorMusicaMovimientos() {
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
        <h1 className={styles.heroTitle}>Movimientos Musicales</h1>
        <p className={styles.heroSubtitle}>
          Del Canto Gregoriano a la Música Electrónica — cronología, compositores y contexto histórico de 14 movimientos que transformaron la música occidental
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
            <button
              type="button"
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
        title="Movimientos musicales: historia y contexto"
        subtitle="Cómo la música refleja su época y transforma nuestra forma de escuchar el mundo"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 5 movimientos clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Movimiento</th>
                <th>Período</th>
                <th>Forma musical dominante</th>
                <th>Compositor clave</th>
                <th>Obra icónica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Canto Gregoriano</strong></td>
                <td>850–1150</td>
                <td>Canto llano monofónico</td>
                <td>Hildegarda de Bingen</td>
                <td>Ordo Virtutum</td>
              </tr>
              <tr>
                <td><strong>Barroco Musical</strong></td>
                <td>1600–1750</td>
                <td>Fuga y suite</td>
                <td>J. S. Bach</td>
                <td>Las Cuatro Estaciones</td>
              </tr>
              <tr>
                <td><strong>Clasicismo</strong></td>
                <td>1750–1820</td>
                <td>Forma sonata y sinfonía</td>
                <td>W. A. Mozart</td>
                <td>Sinfonía nº 40</td>
              </tr>
              <tr>
                <td><strong>Romanticismo</strong></td>
                <td>1820–1900</td>
                <td>Poema sinfónico y ópera</td>
                <td>Richard Wagner</td>
                <td>9ª Sinfonía (Beethoven)</td>
              </tr>
              <tr>
                <td><strong>Jazz</strong></td>
                <td>1900–actualidad</td>
                <td>Improvisación sobre estándar</td>
                <td>Miles Davis</td>
                <td>Kind of Blue</td>
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
              <strong>Estudiante de conservatorio o musicología</strong>
              <p>Prepara exámenes de historia de la música trazando la línea entre movimientos, formas y compositores clave con un único recurso visual.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎼</span>
            <div>
              <strong>Profesor de música</strong>
              <p>Muestra en clase la cronología interactiva para que los alumnos visualicen cómo el Barroco dio paso al Clasicismo y este al Romanticismo.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎧</span>
            <div>
              <strong>DJ o productor curioso</strong>
              <p>Descubre las raíces históricas de la música electrónica: desde Stockhausen hasta Kraftwerk, la línea es directa y fascinante.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎵</span>
            <div>
              <strong>Melómano aficionado</strong>
              <p>Escuchas a Debussy y quieres saber por qué suena tan diferente a Beethoven. El contexto histórico lo explica en segundos.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué el Barroco y el Clasicismo suenan tan distintos si solo los separan unos años?</strong>
            <p>El Barroco (Bach, Vivaldi) es ornamentado, contrapuntístico y continuo; el Clasicismo (Mozart, Haydn) es más limpio, periódico y estructurado en forma sonata. El Sturm und Drang alemán y la Ilustración francesa empujaron hacia la claridad y el equilibrio, abandonando la recargada textura barroca.</p>
            <span className={styles.faqTip}>Escucha el mismo tema en un clavicémbalo barroco y en un pianoforte clásico: la diferencia tímbrica lo dice todo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El jazz es un movimiento artístico serio como el Romanticismo?</strong>
            <p>Sí. El jazz tiene su propia teoría armónica (tensiones, extensiones, reemplazos de acorde), sus formas canónicas (blues de 12 compases, AABA de 32), sus escuelas (cool, bebop, free) y sus grandes compositores-improvisadores. Miles Davis o John Coltrane son tan complejos artísticamente como Brahms o Debussy.</p>
            <span className={styles.faqTip}>Kind of Blue (1959) introdujo la modalidad en el jazz: escúchalo sabiendo que cada tema se basa en modos en lugar de acordes.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué relación hay entre la música electroacústica y la música electrónica de baile actual?</strong>
            <p>La electroacústica (Schaeffer, Stockhausen) exploró el sonido como material sin preocuparse por el pulso o la pista de baile. Pero sus técnicas de edición, manipulación de cinta y síntesis electrónica llegaron directamente a los primeros sintetizadores modulares y de ahí a Kraftwerk, que los usó con ritmo. De Kraftwerk nació el techno de Detroit y el house de Chicago.</p>
            <span className={styles.faqTip}>El Roland TB-303 y la TR-808, originalmente considerados fracasos comerciales, se convirtieron en los instrumentos definitorios del acid house y el hip-hop.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el Minimalismo llegó después del Expresionismo si musicalmente parece más sencillo?</strong>
            <p>La historia del arte no avanza en línea recta de simple a complejo. El Minimalismo (Glass, Reich) fue una reacción deliberada contra la complejidad hermética del serialismo integral de los años 50-60. Era imposible que el público entendiera o disfrutara a Boulez o Babbitt; el Minimalismo recuperó la escucha activa con pulso, tonalidad y repetición hipnótica.</p>
            <span className={styles.faqTip}>Music for 18 Musicians de Steve Reich es un ejercicio de escucha activa: intenta seguir un solo instrumento durante los 55 minutos que dura.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo un movimiento musical termina y cuándo empieza otro?</strong>
            <p>Los musicólogos lo construyen retrospectivamente con criterios de análisis formal, contexto histórico y recepción crítica. En la práctica, los movimientos se solapan: el Romanticismo convivió con el Clasicismo durante décadas y el Jazz nació mientras el Impresionismo todavía florecía. Las fechas son herramientas pedagógicas, no fronteras reales.</p>
            <span className={styles.faqTip}>Pregunta clave: ¿cuándo cambia el consenso sobre qué materiales sonoros y qué formas se consideran válidos o interesantes?</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo analizar una pieza musical desconocida y ubicarla en su movimiento</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Escucha el pulso y el ritmo</strong>
              <p>¿Hay pulso regular (Clasicismo, Rock) o es libre y fluctuante (Gregoriano, Expresionismo)? El ritmo es la primera pista temporal: un ritmo sincopado apunta al jazz o al rock; un pulso mecánico y repetitivo al minimalismo o la música electrónica.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Identifica la textura: monofónica, homofónica o polifónica</strong>
              <p>¿Una sola voz sin acompañamiento (Gregoriano)? ¿Melodía con acordes de apoyo (Clasicismo, Pop)? ¿Varias voces independientes entrelazadas (Barroco, Renacimiento)? La textura delimita siglos enteros de posibilidades.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Analiza la armonía: tonal, modal o atonal</strong>
              <p>¿Reconoces escalas mayor y menor con resoluciones claras (Clasicismo, Romanticismo)? ¿Los acordes son ambiguos y no resuelven de forma esperada (Impresionismo)? ¿Suena deliberadamente disonante y sin centro tonal (Expresionismo)? La armonía reduce el período posible drásticamente.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Fíjate en los instrumentos</strong>
              <p>¿Clavicémbalo o clavecín (Barroco)? ¿Pianoforte moderno con orquesta amplia (Romanticismo)? ¿Guitarra eléctrica y batería (Rock)? ¿Solo sonidos electrónicos sin instrumentos acústicos (Electrónica)? Los timbres son marcadores históricos precisos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Contextualiza históricamente</strong>
              <p>¿Qué estaba ocurriendo en el mundo cuando se compuso? La Reforma Protestante impulsó el Renacimiento polifónico; la Ilustración moldeó el Clasicismo; las guerras mundiales deformaron el Expresionismo; la sociedad de consumo creó el Rock. La música nunca nace en el vacío.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para estudiar historia de la música</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎧</span>
            <p>Siempre escucha los ejemplos musicales al estudiar cada movimiento. La descripción teórica sin audición activa es solo memorización sin comprensión real.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>Los movimientos se solapan: el Romanticismo convivió con el Clasicismo tardío durante décadas. Las fechas son orientativas, no fronteras absolutas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Aprende primero los tres pilares (Barroco, Clasicismo, Romanticismo) antes de explorar movimientos del siglo XX. Son el marco de referencia indispensable.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <p>Conecta la música con las demás artes de su época: el Impresionismo musical de Debussy es inseparable de la pintura de Monet y la poesía de Mallarmé.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al estudiar historia de la música</strong>
          <ul>
            <li>Llamar <strong>&quot;clásica&quot;</strong> a toda la música culta occidental: el Clasicismo es solo el período Haydn-Mozart-Beethoven temprano (1750-1820). Bach es Barroco, no Clásico.</li>
            <li>Confundir <strong>Impresionismo musical</strong> con Impresionismo pictórico: son movimientos paralelos pero independientes. Debussy rechazaba la etiqueta de &quot;impresionista&quot;.</li>
            <li>Asumir que la música <strong>atonal</strong> es simplemente música disonante o &quot;mal hecha&quot;: el dodecafonismo tiene reglas compositivas estrictas y deliberadas.</li>
            <li>Creer que el <strong>Jazz</strong> es un único estilo: swing, bebop, cool, free jazz, fusion y jazz contemporáneo son tan distintos entre sí como el Barroco y el Romanticismo.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-musica-movimientos')} />
      <ShareCard appName="visualizador-musica-movimientos" />
      <Footer appName="visualizador-musica-movimientos" />
    </div>
  );
}
