'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './LiteraturaMovimientos.module.css';
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

type Categoria = 'antigua' | 'medieval' | 'renacimiento' | 'barroco' | 'ilustracion' | 'romantico' | 'realismo' | 'vanguardia' | 'contemporaneo';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface MovimientoLiterario {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;      // 9999 = presente
  categoria: Categoria;
  autores: string[];
  caracteristicas: string[];
  obraIconica: string;
  generos: string[];
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
}

// ─────────────────────────────────────────────
// Helper años negativos
// ─────────────────────────────────────────────

function formatAnio(anio: number): string {
  return anio < 0 ? `${Math.abs(anio)} a.C.` : String(anio);
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const MOVIMIENTOS: MovimientoLiterario[] = [
  {
    id: 'epica-griega', nombre: 'Épica y Lírica Griega', anioInicio: -800, anioFin: -300,
    categoria: 'antigua',
    autores: ['Homero', 'Safo', 'Píndaro', 'Hesíodo', 'Arquíloco'],
    caracteristicas: ['Transmisión oral y en verso', 'Hexámetro dactílico', 'Intervención divina', 'Héroes y mitos', 'Performatividad'],
    obraIconica: 'La Ilíada y La Odisea – Homero',
    generos: ['Epopeya', 'Oda', 'Elegía', 'Lírica coral'],
    contexto: 'La literatura occidental comenzó como oralidad. Los aedos griegos memorizaban y cantaban miles de versos ante el ágora. Homero, ciego según la tradición, sintetizó siglos de tradición épica en dos poemas que aún nos hablan.',
    color: '#8B4513',
  },
  {
    id: 'teatro-clasico', nombre: 'Teatro Clásico Griego', anioInicio: -500, anioFin: -300,
    categoria: 'antigua',
    autores: ['Esquilo', 'Sófocles', 'Eurípides', 'Aristófanes', 'Menandro'],
    caracteristicas: ['Tragedia y catarsis', 'Coro como voz colectiva', 'Hamartia (error fatal del héroe)', 'Máscara y teatro al aire libre', 'Comedia política y social'],
    obraIconica: 'Edipo Rey – Sófocles',
    generos: ['Tragedia', 'Comedia', 'Drama satírico'],
    contexto: 'El teatro ateniense era un rito cívico y religioso. Los concursos dramáticos en honor a Dioniso reunían a toda la ciudadanía. Aristóteles convirtió la tragedia en objeto de análisis en su Poética, base de la teoría literaria occidental.',
    color: '#A0522D',
  },
  {
    id: 'literatura-latina', nombre: 'Literatura Latina', anioInicio: -200, anioFin: 400,
    categoria: 'antigua',
    autores: ['Virgilio', 'Ovidio', 'Horacio', 'Cicerón', 'Séneca', 'Tácito', 'Apuleyo'],
    caracteristicas: ['Imitatio de los griegos', 'Aurea mediocritas (justo medio)', 'Retórica como arte político', 'Epístola y sátira', 'Novela antigua (Apuleyo)'],
    obraIconica: 'La Eneida – Publio Virgilio Marón',
    generos: ['Epopeya', 'Elegía amorosa', 'Sátira', 'Oratoria', 'Historia'],
    contexto: 'Roma imitó y superó a Grecia. Virgilio creó la epopeya fundacional del Imperio; Ovidio subvirtió el mito con ironía; Cicerón elevó la prosa latina a canon. El latín literario sobrevivió mil años como lengua franca de Europa.',
    color: '#B8860B',
  },
  {
    id: 'medieval', nombre: 'Literatura Medieval', anioInicio: 500, anioFin: 1400,
    categoria: 'medieval',
    autores: ['Dante Alighieri', 'Geoffrey Chaucer', 'Chrétien de Troyes', 'Ibn Hazm de Córdoba', 'anónimo (El Cantar del Mío Cid)'],
    caracteristicas: ['Mester de clerecía y juglaría', 'Amor cortés', 'Alegoría cristiana', 'Épica feudal', 'Poesía trovadoresca'],
    obraIconica: 'La Divina Comedia – Dante Alighieri',
    generos: ['Cantar de gesta', 'Romance artúrico', 'Fabliaux', 'Lírica provenzal', 'Alegoría moral'],
    contexto: 'Lejos de la oscuridad que le atribuyó el Renacimiento, la literatura medieval fue rica y diversa. Dante escribió la Commedia en italiano vulgar, no en latín: un acto revolucionario que legitimó las lenguas romance.',
    color: '#556B2F',
  },
  {
    id: 'renacimiento', nombre: 'Humanismo y Renacimiento', anioInicio: 1350, anioFin: 1600,
    categoria: 'renacimiento',
    autores: ['Francesco Petrarca', 'Giovanni Boccaccio', 'Miguel de Cervantes', 'William Shakespeare', 'Erasmo de Rotterdam'],
    caracteristicas: ['Soneto petrarquista', 'Novela en prosa', 'Humanitas y dignidad del hombre', 'Imitación de los clásicos con nueva perspectiva', 'Teatro isabelino'],
    obraIconica: 'Don Quijote de la Mancha – Miguel de Cervantes',
    generos: ['Soneto', 'Novela picaresca', 'Teatro renacentista', 'Ensayo', 'Epístola humanista'],
    contexto: 'El Renacimiento redescubrió la Antigüedad y situó al hombre como protagonista. Cervantes inventó la novela moderna; Shakespeare abarcó toda la condición humana. La imprenta de Gutenberg lo hizo posible.',
    color: '#D4A017',
  },
  {
    id: 'barroco', nombre: 'Barroco Literario', anioInicio: 1580, anioFin: 1700,
    categoria: 'barroco',
    autores: ['Francisco de Quevedo', 'Luis de Góngora', 'Calderón de la Barca', 'Lope de Vega', 'John Milton', 'Jean Racine'],
    caracteristicas: ['Conceptismo (Quevedo): ingenio y agudeza', 'Culteranismo (Góngora): oscuridad y erudición', 'Teatro del Siglo de Oro español', 'Desengaño y vanitas vanitatum', 'Exuberancia ornamental'],
    obraIconica: 'La vida es sueño – Pedro Calderón de la Barca',
    generos: ['Auto sacramental', 'Comedia de capa y espada', 'Soneto barroco', 'Epopeya religiosa'],
    contexto: 'El Barroco reflejó la crisis del Imperio español y la Contrarreforma. Entre la conciencia de la muerte y la exuberancia formal, Quevedo y Góngora convirtieron el castellano en un instrumento de virtuosismo extremo.',
    color: '#CD853F',
  },
  {
    id: 'neoclasicismo', nombre: 'Neoclasicismo', anioInicio: 1680, anioFin: 1800,
    categoria: 'ilustracion',
    autores: ['Voltaire', 'Molière', 'Alexander Pope', 'Jonathan Swift', 'Jean de La Fontaine', 'Tomás de Iriarte'],
    caracteristicas: ['Razón y orden clásico', 'Unidades aristotélicas (tiempo, lugar, acción)', 'Sátira política y social', 'Verosimilitud y decoro', 'Fábula moralizante'],
    obraIconica: 'Cándido, o el optimismo – Voltaire',
    generos: ['Tragedia neoclásica', 'Comedia de costumbres', 'Sátira', 'Fábula', 'Ensayo filosófico'],
    contexto: 'La Ilustración exigió que la literatura fuese racional, moral y útil. Voltaire usó el cuento filosófico para demoler el optimismo de Leibniz. Swift convirtió la sátira en arma política sin igual.',
    color: '#4682B4',
  },
  {
    id: 'romanticismo', nombre: 'Romanticismo', anioInicio: 1780, anioFin: 1850,
    categoria: 'romantico',
    autores: ['Johann Wolfgang von Goethe', 'Lord Byron', 'Victor Hugo', 'Gustavo Adolfo Bécquer', 'José de Espronceda', 'Mary Shelley', 'Edgar Allan Poe'],
    caracteristicas: ['Yo romántico protagonista', 'Naturaleza como espejo del alma', 'Medievalismo y exotismo', 'Libertad creativa frente a normas', 'Melancolía y mal du siècle'],
    obraIconica: 'Fausto – Johann Wolfgang von Goethe',
    generos: ['Novela histórica', 'Poema épico romántico', 'Cuento gótico', 'Drama romántico', 'Rima y leyenda'],
    contexto: 'El Romanticismo fue la reacción emocional a la frialdad ilustrada. Nacido en Alemania (Sturm und Drang) y llegado a Europa tras la Revolución Francesa, exaltó el genio individual, la nación y la libertad.',
    color: '#C04040',
  },
  {
    id: 'realismo', nombre: 'Realismo y Naturalismo', anioInicio: 1830, anioFin: 1900,
    categoria: 'realismo',
    autores: ['Honoré de Balzac', 'Gustave Flaubert', 'Charles Dickens', 'León Tolstói', 'Benito Pérez Galdós', 'Émile Zola', 'Fiódor Dostoyevski'],
    caracteristicas: ['Observación minuciosa de la realidad social', 'Personajes de clase media y trabajadora', 'Determinismo social y biológico (Zola)', 'Narrador omnisciente', 'Crítica a la hipocresía burguesa'],
    obraIconica: 'Ana Karénina – León Tolstói',
    generos: ['Novela social', 'Novela de aprendizaje', 'Crónica de costumbres', 'Novela naturalista'],
    contexto: 'El Realismo surgió con la industrialización. Balzac catalogó la sociedad francesa en la Comedia Humana; Dickens denunció la miseria victoriana; Zola aplicó el determinismo científico a la novela. La burguesía se convirtió en protagonista y objeto de crítica.',
    color: '#2E8B57',
  },
  {
    id: 'modernismo-hispano', nombre: 'Modernismo Hispanoamericano', anioInicio: 1880, anioFin: 1920,
    categoria: 'vanguardia',
    autores: ['Rubén Darío', 'Antonio Machado', 'Juan Ramón Jiménez', 'José Martí', 'Amado Nervo'],
    caracteristicas: ['Esteticismo y musicalidad', 'Simbolismo francés adaptado', 'Exotismo y cosmopolitismo', 'Arte por el arte', 'Nueva versificación en castellano'],
    obraIconica: 'Azul – Rubén Darío',
    generos: ['Soneto modernista', 'Poema en prosa', 'Crónica literaria'],
    contexto: 'El primer movimiento literario genuinamente latinoamericano. Rubén Darío renovó el idioma desde Nicaragua y llegó a influir en la propia España. El modernismo fue la respuesta estética a la crisis colonial del 98.',
    color: '#9370DB',
  },
  {
    id: 'generacion98', nombre: 'Generación del 98 y Novecentismo', anioInicio: 1898, anioFin: 1930,
    categoria: 'vanguardia',
    autores: ['Miguel de Unamuno', 'Pío Baroja', 'Azorín', 'Antonio Machado', 'Ramón María del Valle-Inclán', 'José Ortega y Gasset'],
    caracteristicas: ['Crisis de identidad española tras 1898', 'Existencialismo avant la lettre', 'Ensayo como género literario central', 'Prosa sobria y castellana', 'Regeneracionismo intelectual'],
    obraIconica: 'En torno al casticismo – Miguel de Unamuno',
    generos: ['Ensayo', 'Novela existencial', 'Esperpento (Valle-Inclán)', 'Poesía de la tierra'],
    contexto: 'La derrota en Cuba y Filipinas (1898) traumatizó la intelectualidad española. La Generación del 98 se preguntó qué era España y por qué había fracasado. Unamuno convirtió la angustia en filosofía; Valle-Inclán la deformó en esperpento.',
    color: '#B8860B',
  },
  {
    id: 'vanguardias', nombre: 'Vanguardias del siglo XX', anioInicio: 1905, anioFin: 1940,
    categoria: 'vanguardia',
    autores: ['Guillaume Apollinaire', 'André Breton', 'Tristan Tzara', 'Federico García Lorca', 'Pablo Neruda', 'Vicente Huidobro'],
    caracteristicas: ['Ruptura total con la tradición', 'Surrealismo: inconsciente y sueño', 'Dadaísmo: absurdo y negación', 'Caligramas y poesía visual', 'Imagen pura sin lógica racional'],
    obraIconica: 'Poeta en Nueva York – Federico García Lorca',
    generos: ['Poema surrealista', 'Calligrama', 'Manifiesto literario', 'Teatro del absurdo (precursor)'],
    contexto: 'Las vanguardias estallaron en las heridas de la Primera Guerra Mundial. Si la razón había producido tanto horror, el arte debía abandonarla. El surrealismo buceó en el inconsciente freudiano; el dadaísmo destruyó el concepto mismo de arte.',
    color: '#FF6347',
  },
  {
    id: 'existencialismo-literario', nombre: 'Existencialismo Literario', anioInicio: 1938, anioFin: 1965,
    categoria: 'contemporaneo',
    autores: ['Jean-Paul Sartre', 'Albert Camus', 'Simone de Beauvoir', 'Franz Kafka', 'Samuel Beckett'],
    caracteristicas: ['Absurdo e insignificancia', 'Libertad como condena', 'Compromiso político del escritor', 'Alienación y burocracia kafkiana', 'Teatro del absurdo'],
    obraIconica: 'El Extranjero – Albert Camus',
    generos: ['Novela filosófica', 'Teatro del absurdo', 'Ensayo existencial', 'Nouvelle'],
    contexto: 'Dos guerras mundiales y el Holocausto convirtieron el absurdo en tema literario central. Camus propuso la rebelión como respuesta; Beckett esperó indefinidamente a Godot; Kafka profetizó el laberinto burocrático del siglo XX.',
    color: '#2F4F4F',
  },
  {
    id: 'boom-latinoamericano', nombre: 'Boom Latinoamericano', anioInicio: 1960, anioFin: 1975,
    categoria: 'contemporaneo',
    autores: ['Gabriel García Márquez', 'Mario Vargas Llosa', 'Julio Cortázar', 'Carlos Fuentes', 'José Donoso'],
    caracteristicas: ['Realismo mágico', 'Estructura narrativa experimental', 'Historia y política latinoamericana', 'Dictadura y resistencia', 'Tiempo no lineal'],
    obraIconica: 'Cien Años de Soledad – Gabriel García Márquez',
    generos: ['Novela total', 'Cuento fantástico', 'Novela histórica latinoamericana'],
    contexto: 'Los años 60 latinoamericanos fueron explosivos: Revolución Cubana, guerrillas, dictaduras. El boom convirtió la novela latinoamericana en fenómeno mundial. García Márquez fusionó la historia de Colombia con el mito. Cortázar inventó el cuento como artefacto.',
    color: '#8B008B',
  },
  {
    id: 'posmodernismo-literario', nombre: 'Posmodernismo Literario', anioInicio: 1970, anioFin: 9999,
    categoria: 'contemporaneo',
    autores: ['Jorge Luis Borges', 'Umberto Eco', 'Italo Calvino', 'Thomas Pynchon', 'Javier Marías'],
    caracteristicas: ['Metaficción: texto sobre el texto', 'Intertextualidad y pastiche', 'Ironía y distancia', 'Deconstrucción del narrador', 'Hibridación de géneros'],
    obraIconica: 'El Nombre de la Rosa – Umberto Eco',
    generos: ['Novela posmoderna', 'Metaficción', 'Novela histórica experimental', 'Hipertexto literario'],
    contexto: 'El posmodernismo literario cuestionó el concepto mismo de autoría y originalidad. Borges (precursor sin saberlo) construyó laberintos textuales; Eco mezcló filosofía con thriller medieval; Calvino exploró la lectura como escritura.',
    color: '#1E90FF',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -450, evento: 'Atenas en su apogeo: democracia, teatro y filosofía florecen juntos' },
  { anio: -47, evento: 'Biblioteca de Alejandría — centro del saber del mundo antiguo' },
  { anio: 1440, evento: 'Gutenberg inventa la imprenta: los libros dejan de ser privilegio clerical' },
  { anio: 1605, evento: 'Publicación de la Primera Parte del Quijote: nace la novela moderna' },
  { anio: 1789, evento: 'Revolución Francesa: la literatura se vuelve política y el escritor, ciudadano' },
  { anio: 1848, evento: 'Año de revoluciones europeas: el Realismo refleja la lucha de clases' },
  { anio: 1914, evento: 'Primera Guerra Mundial: las vanguardias nacen de la desilusión' },
  { anio: 1945, evento: 'Fin de la Segunda Guerra Mundial: el existencialismo y el absurdo toman el relevo' },
  { anio: 1967, evento: 'García Márquez publica Cien Años de Soledad: el Boom estalla mundialmente' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  antigua: 'Antigua',
  medieval: 'Medieval',
  renacimiento: 'Renacimiento',
  barroco: 'Barroco',
  ilustracion: 'Ilustración',
  romantico: 'Romántico',
  realismo: 'Realismo',
  vanguardia: 'Vanguardia',
  contemporaneo: 'Contemporáneo',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  antigua: '#8B4513',
  medieval: '#556B2F',
  renacimiento: '#D4A017',
  barroco: '#CD853F',
  ilustracion: '#4682B4',
  romantico: '#C04040',
  realismo: '#2E8B57',
  vanguardia: '#9370DB',
  contemporaneo: '#1E90FF',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ movimiento }: { movimiento: MovimientoLiterario }) {
  const anioFinTexto = movimiento.anioFin === 9999 ? 'actualidad' : formatAnio(movimiento.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: movimiento.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: movimiento.color }}>{movimiento.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(movimiento.anioInicio)} – {anioFinTexto}</p>
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
          <h4 className={styles.detalleSubtitulo}>Autores clave</h4>
          <ul className={styles.autoresList}>
            {movimiento.autores.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.generosBox}>
        <span className={styles.generosLabel}>Géneros literarios</span>
        <div className={styles.generosBadges}>
          {movimiento.generos.map((g) => (
            <span key={g} className={styles.generoBadge}>{g}</span>
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

const AÑO_MIN = -800;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 60;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<MovimientoLiterario | null>(null);

  // Distribuir movimientos en filas para evitar solapamiento
  const filas: MovimientoLiterario[][] = [[], [], [], []];
  const ordenados = [...MOVIMIENTOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const mov of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin === 9999 ? AÑO_MAX : ultimoEnFila.anioFin) + 4 <= anioAX(mov.anioInicio)) {
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

  // Marcadores de siglos: desde -800 hasta 2000
  const marcadores: number[] = [];
  for (let s = -800; s <= 2000; s += 200) marcadores.push(s);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un movimiento para ver sus detalles. El eje abarca desde el 800 a.C. hasta hoy.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de movimientos literarios desde el 800 a.C."
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Línea del año 0 */}
          <line x1={anioAX(0)} y1={FILA_OFFSET_Y} x2={anioAX(0)} y2={svgAlto - 16} stroke="#888" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#888" textAnchor="middle">0</text>

          {/* Marcadores de siglos */}
          {marcadores.map((s) => (
            <g key={s}>
              <line x1={anioAX(s)} y1={FILA_OFFSET_Y} x2={anioAX(s)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(s)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{formatAnio(s)}</text>
            </g>
          ))}

          {/* Rectángulos de movimientos */}
          {filas.map((fila, fi) =>
            fila.map((mov) => {
              const anioFin = mov.anioFin === 9999 ? AÑO_MAX : mov.anioFin;
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
  const anioFinTexto = movimiento.anioFin === 9999 ? 'actualidad' : formatAnio(movimiento.anioFin);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Movimiento en Detalle</h2>

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
          <p>{formatAnio(movimiento.anioInicio)} – {anioFinTexto}</p>
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
              <h4 className={styles.detalleSubtitulo}>Autores clave</h4>
              <ul className={styles.autoresList}>
                {movimiento.autores.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.generosBox}>
            <span className={styles.generosLabel}>Géneros literarios</span>
            <div className={styles.generosBadges}>
              {movimiento.generos.map((g) => (
                <span key={g} className={styles.generoBadge}>{g}</span>
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
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Movimiento anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {MOVIMIENTOS.length}</span>
        <button
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
        mov.autores.some((a) => a.toLowerCase().includes(termino));
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
        placeholder="Buscar por movimiento o autor..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar movimiento literario"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Movimiento</th>
              <th>Período</th>
              <th>Categoría</th>
              <th>Autor clave</th>
              <th>Característica principal</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((mov, i) => {
              const anioFinTexto = mov.anioFin === 9999 ? 'actualidad' : formatAnio(mov.anioFin);
              return (
                <tr
                  key={mov.id}
                  style={i % 2 === 0 ? { background: `${mov.color}18` } : {}}
                >
                  <td><strong style={{ color: mov.color }}>{mov.nombre}</strong></td>
                  <td>{formatAnio(mov.anioInicio)}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[mov.categoria]}22`, color: COLORES_CATEGORIA[mov.categoria] }}>
                      {ETIQUETAS_CATEGORIA[mov.categoria]}
                    </span>
                  </td>
                  <td>{mov.autores[0]}</td>
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
  { nombre: 'Literatura Antigua', desde: -800, hasta: 500, icono: '📜' },
  { nombre: 'Literatura Medieval', desde: 500, hasta: 1350, icono: '⚔️' },
  { nombre: 'Renacimiento y Barroco', desde: 1350, hasta: 1700, icono: '🎭' },
  { nombre: 'Ilustración y Romanticismo', desde: 1700, hasta: 1840, icono: '📖' },
  { nombre: 'Realismo y Vanguardias', desde: 1840, hasta: 1950, icono: '🔍' },
  { nombre: 'Literatura Contemporánea', desde: 1950, hasta: 9999, icono: '✍️' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Movimientos literarios y eventos históricos organizados por eras.
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
                    {formatAnio(era.desde)} – {era.hasta === 9999 ? 'hoy' : formatAnio(era.hasta)}
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
                      <span className={styles.eraEventoAnio}>{formatAnio(ev.anio)}</span>
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

export default function VisualizadorLiteraturaMovimientos() {
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
        <h1 className={styles.heroTitle}>Movimientos Literarios</h1>
        <p className={styles.heroSubtitle}>
          De Homero a García Márquez — cronología interactiva, autores y contexto histórico de 15 movimientos que definieron la literatura occidental
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
        title="Movimientos literarios: historia y contexto"
        subtitle="Cómo la literatura refleja su época y transforma nuestra forma de entender el mundo"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 movimientos clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Movimiento</th>
                <th>Período</th>
                <th>Categoría</th>
                <th>Género dominante</th>
                <th>Autor clave</th>
                <th>Obra icónica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Teatro Clásico Griego</strong></td>
                <td>500–300 a.C.</td>
                <td>Antigua</td>
                <td>Tragedia</td>
                <td>Sófocles</td>
                <td>Edipo Rey</td>
              </tr>
              <tr>
                <td><strong>Literatura Medieval</strong></td>
                <td>500–1400</td>
                <td>Medieval</td>
                <td>Cantar de gesta</td>
                <td>Dante Alighieri</td>
                <td>La Divina Comedia</td>
              </tr>
              <tr>
                <td><strong>Humanismo y Renacimiento</strong></td>
                <td>1350–1600</td>
                <td>Renacimiento</td>
                <td>Novela y teatro</td>
                <td>Cervantes</td>
                <td>Don Quijote</td>
              </tr>
              <tr>
                <td><strong>Romanticismo</strong></td>
                <td>1780–1850</td>
                <td>Romántico</td>
                <td>Novela histórica</td>
                <td>Goethe</td>
                <td>Fausto</td>
              </tr>
              <tr>
                <td><strong>Realismo y Naturalismo</strong></td>
                <td>1830–1900</td>
                <td>Realismo</td>
                <td>Novela social</td>
                <td>Tolstói</td>
                <td>Ana Karénina</td>
              </tr>
              <tr>
                <td><strong>Boom Latinoamericano</strong></td>
                <td>1960–1975</td>
                <td>Contemporáneo</td>
                <td>Novela total</td>
                <td>García Márquez</td>
                <td>Cien Años de Soledad</td>
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
              <strong>Estudiante de Lengua y Literatura</strong>
              <p>Prepara el examen de Selectividad o Bachillerato repasando los movimientos, autores y obras del temario con contexto histórico claro.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📖</span>
            <div>
              <strong>Lector que quiere contexto</strong>
              <p>Acaba de leer una novela clásica y quiere entender qué corriente literaria la inspiró, con quién comparte generación su autor y qué pasaba en el mundo.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏫</span>
            <div>
              <strong>Profesor de secundaria</strong>
              <p>Usa la cronología como apoyo visual en clase para mostrar la evolución de la literatura desde la épica griega hasta la narrativa contemporánea.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
            <div>
              <strong>Aficionado curioso</strong>
              <p>Ha leído el Quijote o Cien Años de Soledad y quiere entender dónde encajan esas obras en la historia de la literatura y qué vino antes y después.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué el Quijote es considerado la primera novela moderna?</strong>
            <p>Porque Cervantes rompió con la épica y el romance medievales al crear un protagonista ordinario que confunde la ficción con la realidad. Por primera vez, la narración analiza su propio funcionamiento como ficción: Cervantes juega con el lector, habla de manuscritos inventados y cuestiona la verosimilitud. Es metaficción avant la lettre, 400 años antes de que se inventara el término.</p>
            <span className={styles.faqTip}>Consejo: leer el prólogo de la Segunda Parte (1615), donde Cervantes contesta a Avellaneda, para ver hasta qué punto el texto es consciente de sí mismo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia el Realismo del Naturalismo?</strong>
            <p>El Realismo observa la realidad social sin idealizarla. El Naturalismo (Zola) añade el determinismo científico: los personajes están condicionados por su herencia biológica y su entorno social, igual que en un experimento de laboratorio. El naturalismo es el Realismo llevado al extremo positivista del siglo XIX.</p>
            <span className={styles.faqTip}>Ejemplo: Flaubert (Realismo) observa; Zola (Naturalismo) disecciona como un médico.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El Boom Latinoamericano y el Realismo Mágico son lo mismo?</strong>
            <p>No exactamente. El Boom fue un fenómeno editorial y cultural de los años 60 protagonizado por varios autores latinoamericanos (García Márquez, Vargas Llosa, Cortázar, Fuentes). El Realismo Mágico es una técnica narrativa específica donde lo sobrenatural se integra en lo cotidiano sin ser cuestionado, característica sobre todo de García Márquez. Vargas Llosa o Cortázar no son realistas mágicos.</p>
            <span className={styles.faqTip}>Dato: la etiqueta «Realismo Mágico» fue creada por el crítico alemán Franz Roh en 1925 para hablar de pintura, no de literatura.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué la épica griega se transmitía oralmente si era tan larga?</strong>
            <p>Los aedos usaban fórmulas métricas repetidas (epítetos homéricos como «la Aurora de rosados dedos» o «el de los pies ligeros Aquiles») que servían como bloques de construcción memorizables. Estas fórmulas encajan en el hexámetro dactílico y permiten componer miles de versos sin esfuerzo de memorizarlos literalmente: el ritmo guía la improvisación controlada.</p>
            <span className={styles.faqTip}>La teoría oral-formulaica de Milman Parry (1930) demostró este mecanismo estudiando a los guslares de los Balcanes.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es exactamente el Posmodernismo literario y en qué se diferencia del Modernismo?</strong>
            <p>El Modernismo literario (siglo XX, no confundir con el Modernismo hispanoamericano) buscó renovar el lenguaje y la forma con seriedad: Joyce, Woolf, Proust. El Posmodernismo acepta la imposibilidad de la novedad y juega con eso: mezcla géneros, cita a otros textos irónicamente, usa la autorreferencia y el pastiche. Si el Modernismo era serio en su ruptura, el Posmodernismo es irónico sobre la ruptura misma.</p>
            <span className={styles.faqTip}>Borges es el gran precursor posmoderno: sus laberintos textuales influyeron en Eco, Calvino y toda la posmodernidad literaria.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo usar este visualizador para estudiar literatura</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Empieza por la Línea del Tiempo</strong>
              <p>Observa el panorama completo desde el 800 a.C. hasta hoy. Identifica qué épocas tienen más movimientos y cuáles son más escasas. El eje temporal sitúa cada corriente en su contexto histórico de un vistazo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Haz clic en los movimientos que te interesen</strong>
              <p>Cada rectángulo en la timeline abre un panel con autores, características, géneros y contexto histórico. Identifica los movimientos del temario de tu examen o de las obras que estás leyendo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Usa la tab Detalle para profundizar</strong>
              <p>Navega movimiento a movimiento con los botones anterior/siguiente. Fíjate en cómo cada movimiento reacciona al anterior: el Romanticismo rechaza la Ilustración; el Realismo rechaza el Romanticismo; las Vanguardias rechazan todo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Filtra por categoría en la Comparativa</strong>
              <p>Agrupa los movimientos por época para ver patrones. Busca un autor específico para saber a qué corriente pertenece. La tabla facilita comparar períodos, géneros y características en paralelo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Conecta literatura e historia en el Contexto</strong>
              <p>La timeline doble muestra qué pasaba en el mundo cuando surgió cada movimiento. La Revolución Francesa y el Romanticismo; la Primera Guerra y las Vanguardias; la Guerra Fría y el Boom. La literatura siempre responde a su tiempo.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para estudiar historia de la literatura</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📚</span>
            <p>Los movimientos son categorías retrospectivas: los escritores rara vez sabían que pertenecían a una «corriente». Dante no se llamaba a sí mismo medieval; Flaubert rechazaba la etiqueta de realista.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p>Cada movimiento literario es una reacción al anterior. Aprende los movimientos en orden cronológico y busca siempre qué estaban rechazando o superando los autores de cada época.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Lee aunque sea fragmentos de las obras icónicas: leer el primer capítulo del Quijote, una oda de Horacio o el primer acto de Edipo Rey en diez minutos da más comprensión que horas de teoría.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p>Relaciona siempre la literatura con su contexto: la industria editorial, la censura, el mecenazgo, la alfabetización y la situación política explican por qué surgió cada corriente cuando surgió.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al estudiar movimientos literarios</strong>
          <ul>
            <li>Confundir el <strong>Modernismo hispanoamericano</strong> (Rubén Darío, 1880-1920: esteticismo y musicalidad en castellano) con el <strong>Modernismo anglosajón</strong> (Joyce, Woolf, 1910-1940: renovación de la forma narrativa). Son movimientos distintos con el mismo nombre.</li>
            <li>Llamar «realismo mágico» a toda la literatura latinoamericana: Cortázar es fantástico, Vargas Llosa es realista crítico, Borges es metaficción. El Boom agrupa estilos muy distintos.</li>
            <li>Creer que el Barroco solo existió en España: Francia (Racine, Corneille), Inglaterra (Milton) e Italia tuvieron un Barroco igualmente rico. El Siglo de Oro español es parte de un fenómeno europeo.</li>
            <li>Ignorar que la Generación del 98 y el Modernismo hispanoamericano son contemporáneos y se influyen mutuamente: Darío viajó a España e impactó en Machado, Valle-Inclán y Juan Ramón Jiménez.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-literatura-movimientos')} />
      <ShareCard appName="visualizador-literatura-movimientos" />
      <Footer appName="visualizador-literatura-movimientos" />
    </div>
  );
}
