'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './Filosofia.module.css';
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

type Categoria = 'antigua' | 'helenistica' | 'medieval' | 'moderna' | 'contemporanea';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface CorrienteFilosofica {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  filosofos: string[];
  conceptos: string[];
  obraFundamental: string;
  preguntaCentral: string;
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
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

const CORRIENTES: CorrienteFilosofica[] = [
  {
    id: 'presocratics', nombre: 'Presocráticos', anioInicio: -620, anioFin: -400,
    categoria: 'antigua',
    filosofos: ['Tales de Mileto', 'Heráclito', 'Parménides', 'Pitágoras', 'Empédocles', 'Demócrito'],
    conceptos: ['Arché (principio de todo)', 'Logos', 'Átomo', 'Devenir vs ser', 'Cosmovisión racional'],
    obraFundamental: 'Fragmentos de Heráclito (Peri Physeos)',
    preguntaCentral: '¿Cuál es el principio último de todas las cosas?',
    contexto: 'Los primeros filósofos griegos abandonaron la explicación mítica del cosmos para buscar causas naturales. Tales propuso el agua, Heráclito el fuego, Demócrito los átomos: nació la filosofía occidental.',
    color: '#8B4513',
  },
  {
    id: 'sofismo', nombre: 'Sofismo', anioInicio: -450, anioFin: -350,
    categoria: 'antigua',
    filosofos: ['Protágoras', 'Gorgias', 'Trasímaco', 'Hipias de Élide'],
    conceptos: ['Relativismo', 'Retórica como arte', 'Nomos vs physis', 'Verdad subjetiva', 'Educación como mercancía'],
    obraFundamental: '"El hombre es la medida de todas las cosas" — Protágoras',
    preguntaCentral: '¿Existe una verdad objetiva o todo depende del punto de vista?',
    contexto: 'Los sofistas fueron maestros itinerantes que cobraban por enseñar retórica y virtud cívica en la Atenas democrática. Sócrates los atacó como vendedores de apariencia; ellos vieron la relatividad donde él veía certeza.',
    color: '#CD853F',
  },
  {
    id: 'socratico', nombre: 'Sócrates, Platón y Aristotelismo', anioInicio: -470, anioFin: -322,
    categoria: 'antigua',
    filosofos: ['Sócrates', 'Platón', 'Aristóteles'],
    conceptos: ['Mayéutica socrática', 'Mundo de las Ideas', 'Alegoría de la caverna', 'Lógica formal', 'Teleología', 'Ética de la virtud'],
    obraFundamental: 'La República – Platón',
    preguntaCentral: '¿Qué es la justicia, la virtud y el conocimiento verdadero?',
    contexto: 'La triada más influyente de la historia del pensamiento. Platón fundó la Academia y postuló un mundo ideal más real que el sensible. Aristóteles lo contradijo con su método empírico y su lógica formal.',
    color: '#DAA520',
  },
  {
    id: 'estoicismo', nombre: 'Estoicismo', anioInicio: -300, anioFin: 200,
    categoria: 'helenistica',
    filosofos: ['Zenón de Citio', 'Epicteto', 'Marco Aurelio', 'Séneca', 'Crisipo'],
    conceptos: ['Logos universal', 'Apatheia (ecuanimidad)', 'Virtud como único bien', 'Cosmopolitismo', 'Deber y providencia'],
    obraFundamental: 'Meditaciones – Marco Aurelio',
    preguntaCentral: '¿Cómo vivir bien en un mundo que no podemos controlar?',
    contexto: 'Fundado en Atenas, el estoicismo floreció en Roma como filosofía práctica. Marco Aurelio, emperador y filósofo, encarnó su ideal: actuar con virtud independientemente de las circunstancias externas.',
    color: '#708090',
  },
  {
    id: 'epicureismo', nombre: 'Epicureísmo', anioInicio: -307, anioFin: 200,
    categoria: 'helenistica',
    filosofos: ['Epicuro', 'Lucrecio', 'Metrodoro'],
    conceptos: ['Ataraxia (paz del alma)', 'Placer como ausencia de dolor', 'Atomismo materialista', 'Amistad como bien supremo', 'Rechazo del miedo a la muerte'],
    obraFundamental: 'De rerum natura – Lucrecio',
    preguntaCentral: '¿Cómo alcanzar la felicidad y la serenidad duradera?',
    contexto: 'Mal comprendido como hedonismo vulgar, el epicureísmo propuso el placer tranquilo de la amistad y el saber como camino a la felicidad. El Jardín de Epicuro fue el primer espacio filosófico abierto a mujeres y esclavos.',
    color: '#3CB371',
  },
  {
    id: 'neoplatonismo', nombre: 'Neoplatonismo', anioInicio: 200, anioFin: 500,
    categoria: 'helenistica',
    filosofos: ['Plotino', 'Porfirio', 'Proclo', 'Jámblico'],
    conceptos: ['El Uno como principio absoluto', 'Emanación', 'Éxtasis místico', 'Alma y materia', 'Jerarquía del ser'],
    obraFundamental: 'Las Enéadas – Plotino',
    preguntaCentral: '¿Cómo el alma puede retornar a su origen divino?',
    contexto: 'Última gran síntesis filosófica antigua, el neoplatonismo fusionó el platonismo con el misticismo oriental. Influyó decisivamente en el cristianismo primitivo y en el islam medieval.',
    color: '#9370DB',
  },
  {
    id: 'medieval', nombre: 'Filosofía Medieval y Escolástica', anioInicio: 400, anioFin: 1400,
    categoria: 'medieval',
    filosofos: ['Agustín de Hipona', 'Tomás de Aquino', 'Averroes', 'Maimónides', 'Anselmo de Canterbury', 'Duns Escoto'],
    conceptos: ['Fe y razón', 'Problema de los universales', 'Teología natural', 'Argumento ontológico', 'Síntesis aristotélico-cristiana'],
    obraFundamental: 'Suma Teológica – Tomás de Aquino',
    preguntaCentral: '¿Puede la razón demostrar las verdades de la fe?',
    contexto: 'Mil años de filosofía medieval no fueron la Edad Oscura que imaginó el Renacimiento. Averroes transmitió a Aristóteles a Europa; Aquino lo cristianizó; Maimónides hizo lo propio en el judaísmo.',
    color: '#8B008B',
  },
  {
    id: 'humanismo', nombre: 'Humanismo Renacentista', anioInicio: 1350, anioFin: 1600,
    categoria: 'moderna',
    filosofos: ['Pico della Mirandola', 'Erasmo de Rotterdam', 'Maquiavelo', 'Montaigne', 'Tomás Moro'],
    conceptos: ['Dignidad humana', 'Studia humanitatis', 'Virtù política', 'Escepticismo suave', 'Reforma del individuo'],
    obraFundamental: 'Discurso sobre la dignidad del hombre – Pico della Mirandola',
    preguntaCentral: '¿Cuál es la naturaleza y el lugar del ser humano en el cosmos?',
    contexto: 'El Renacimiento redescubrió la Antigüedad y puso al hombre en el centro. Maquiavelo secularizó la política; Montaigne inventó el ensayo como forma de conocimiento personal.',
    color: '#20B2AA',
  },
  {
    id: 'racionalismo', nombre: 'Racionalismo', anioInicio: 1637, anioFin: 1715,
    categoria: 'moderna',
    filosofos: ['René Descartes', 'Baruch Spinoza', 'Gottfried Wilhelm Leibniz'],
    conceptos: ['Cogito ergo sum', 'Ideas innatas', 'Sustancia', 'Mónadas', 'Método deductivo', 'Duda metódica'],
    obraFundamental: 'Meditaciones Metafísicas – René Descartes',
    preguntaCentral: '¿Qué podemos conocer con certeza mediante la sola razón?',
    contexto: 'Descartes fundó la filosofía moderna dudando de todo excepto del acto mismo de pensar. Spinoza radicalizó su monismo; Leibniz concilió metafísica y matemáticas con la teoría de las mónadas.',
    color: '#1E90FF',
  },
  {
    id: 'empirismo', nombre: 'Empirismo', anioInicio: 1689, anioFin: 1780,
    categoria: 'moderna',
    filosofos: ['John Locke', 'George Berkeley', 'David Hume', 'Francis Bacon'],
    conceptos: ['Tabula rasa', 'Experiencia sensorial como fuente', 'Escepticismo', 'Causalidad como hábito mental', 'Distinción ideas/impresiones'],
    obraFundamental: 'Tratado de la Naturaleza Humana – David Hume',
    preguntaCentral: '¿Proviene todo conocimiento de la experiencia de los sentidos?',
    contexto: 'Frente al racionalismo continental, la filosofía británica apostó por la experiencia. Hume llegó al escepticismo radical: ni la causalidad ni el yo son más que hábitos mentales. Kant confesó que Hume lo despertó de su "sueño dogmático".',
    color: '#228B22',
  },
  {
    id: 'ilustracion', nombre: 'Ilustración', anioInicio: 1700, anioFin: 1800,
    categoria: 'moderna',
    filosofos: ['Voltaire', 'Jean-Jacques Rousseau', 'Immanuel Kant', 'Montesquieu', 'Diderot'],
    conceptos: ['Razón como guía universal', 'Progreso', 'Contrato social', 'Derechos naturales', 'Separación de poderes', '¡Sapere aude!'],
    obraFundamental: 'Crítica de la Razón Pura – Immanuel Kant',
    preguntaCentral: '¿Puede la razón ilustrar a la humanidad y conducirla al progreso?',
    contexto: 'La Ilustración se propuso disipar la ignorancia con la luz de la razón. La Encyclopédie de Diderot y D\'Alembert fue su monumento. Kant sintetizó racionalismo y empirismo en la revolución copernicana de la filosofía.',
    color: '#FFD700',
  },
  {
    id: 'idealismo', nombre: 'Idealismo Alemán', anioInicio: 1781, anioFin: 1830,
    categoria: 'moderna',
    filosofos: ['Immanuel Kant', 'Johann Gottlieb Fichte', 'Friedrich Schelling', 'Georg Wilhelm Friedrich Hegel'],
    conceptos: ['Fenómeno vs noúmeno', 'Yo absoluto', 'Dialéctica (tesis-antítesis-síntesis)', 'Geist (Espíritu)', 'Historia como despliegue de la razón'],
    obraFundamental: 'Fenomenología del Espíritu – G. W. F. Hegel',
    preguntaCentral: '¿Es la realidad una construcción del espíritu o la mente?',
    contexto: 'Hegel convirtió la historia en filosofía y la filosofía en historia. Su dialéctica influyó en Marx (que la invirtió) y en toda la filosofía continental posterior. La Revolución Francesa fue su acontecimiento fundador.',
    color: '#4169E1',
  },
  {
    id: 'marxismo', nombre: 'Marxismo y Materialismo Histórico', anioInicio: 1840, anioFin: 9999,
    categoria: 'contemporanea',
    filosofos: ['Karl Marx', 'Friedrich Engels', 'Antonio Gramsci', 'György Lukács', 'Louis Althusser'],
    conceptos: ['Praxis', 'Lucha de clases', 'Alienación', 'Superestructura e infraestructura', 'Hegemonía cultural', 'Fetichismo de la mercancía'],
    obraFundamental: 'El Capital – Karl Marx',
    preguntaCentral: '¿Cómo las condiciones materiales determinan la conciencia y la historia?',
    contexto: 'Marx invirtió la dialéctica hegeliana: no es el Espíritu sino las relaciones de producción lo que mueve la historia. El Manifiesto Comunista transformó la teoría en programa político de alcance global.',
    color: '#DC143C',
  },
  {
    id: 'existencialismo', nombre: 'Existencialismo', anioInicio: 1840, anioFin: 1970,
    categoria: 'contemporanea',
    filosofos: ['Søren Kierkegaard', 'Friedrich Nietzsche', 'Martin Heidegger', 'Jean-Paul Sartre', 'Albert Camus', 'Simone de Beauvoir'],
    conceptos: ['Angustia existencial', 'Voluntad de poder', 'Ser-en-el-mundo (Dasein)', 'La existencia precede a la esencia', 'Absurdo', 'Mala fe'],
    obraFundamental: 'El Ser y la Nada – Jean-Paul Sartre',
    preguntaCentral: '¿Qué significa existir y cómo asumir la libertad radical del ser humano?',
    contexto: 'El existencialismo surgió de la crisis de la modernidad. Nietzsche proclamó la muerte de Dios; Heidegger analizó el ser-hacia-la-muerte; Sartre convirtió la libertad en condena. Camus añadió la pregunta del suicidio como único problema filosófico serio.',
    color: '#2F4F4F',
  },
  {
    id: 'analitica', nombre: 'Filosofía Analítica', anioInicio: 1900, anioFin: 9999,
    categoria: 'contemporanea',
    filosofos: ['Gottlob Frege', 'Bertrand Russell', 'Ludwig Wittgenstein', 'Karl Popper', 'W. V. O. Quine', 'John Rawls'],
    conceptos: ['Análisis lógico del lenguaje', 'Teoría de los tipos', 'Verificacionismo', 'Falsabilidad', 'Juegos de lenguaje', 'Teoría de la justicia'],
    obraFundamental: 'Tractatus Logico-Philosophicus – Ludwig Wittgenstein',
    preguntaCentral: '¿Qué puede decirse con sentido y qué debe callarse?',
    contexto: 'Nacida en Cambridge y Viena, la filosofía analítica propuso que muchos problemas filosóficos son confusiones lingüísticas. Wittgenstein la fundó y luego la refutó a sí mismo con sus Investigaciones Filosóficas.',
    color: '#2E86AB',
  },
  {
    id: 'posmodernismo', nombre: 'Posmodernismo y Deconstrucción', anioInicio: 1960, anioFin: 9999,
    categoria: 'contemporanea',
    filosofos: ['Michel Foucault', 'Jacques Derrida', 'Gilles Deleuze', 'Jean-François Lyotard', 'Jean Baudrillard'],
    conceptos: ['Deconstrucción', 'Poder/saber', 'Fin de los grandes relatos', 'Simulacro', 'Diferencia', 'Genealogía'],
    obraFundamental: 'Las Palabras y las Cosas – Michel Foucault',
    preguntaCentral: '¿Son posibles los grandes relatos universales sobre verdad, razón e historia?',
    contexto: 'Tras el Mayo del 68, los filósofos franceses cuestionaron los fundamentos de la modernidad. Foucault analizó cómo el poder produce saber; Derrida mostró que los textos minan sus propias pretensiones de verdad.',
    color: '#FF6347',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -399, evento: 'Ejecución de Sócrates en Atenas — la filosofía se convierte en peligrosa' },
  { anio: -347, evento: 'Platón funda la Academia: primera institución filosófica permanente' },
  { anio: 529, evento: 'Justiniano cierra la Academia de Atenas: fin de la filosofía pagana clásica' },
  { anio: 1088, evento: 'Fundación de la Universidad de Bolonia: la escolástica toma forma institucional' },
  { anio: 1543, evento: 'Copérnico: la Tierra no es el centro — nueva cosmología, nueva filosofía natural' },
  { anio: 1789, evento: 'Revolución Francesa: los ideales ilustrados de razón y libertad llegan al poder' },
  { anio: 1848, evento: 'El Manifiesto Comunista: la filosofía como programa de transformación social' },
  { anio: 1900, evento: 'Freud publica La Interpretación de los Sueños: el inconsciente entra en la filosofía' },
  { anio: 1968, evento: 'Mayo del 68: el posmodernismo nace en las barricadas de París' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  antigua: 'Antigua',
  helenistica: 'Helenística',
  medieval: 'Medieval',
  moderna: 'Moderna',
  contemporanea: 'Contemporánea',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  antigua: '#8B4513',
  helenistica: '#708090',
  medieval: '#8B008B',
  moderna: '#1E90FF',
  contemporanea: '#DC143C',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ corriente }: { corriente: CorrienteFilosofica }) {
  const anioFinTexto = corriente.anioFin === 9999 ? 'actualidad' : formatAnio(corriente.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: corriente.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: corriente.color }}>{corriente.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(corriente.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[corriente.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Conceptos clave</h4>
          <ul className={styles.caracteristicasList}>
            {corriente.conceptos.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Filósofos clave</h4>
          <ul className={styles.artistasList}>
            {corriente.filosofos.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra fundamental</span>
        <p>{corriente.obraFundamental}</p>
      </div>

      <div className={styles.preguntaBox}>
        <span className={styles.preguntaLabel}>Pregunta central</span>
        <p className={styles.preguntaTexto}>{corriente.preguntaCentral}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{corriente.contexto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = -620;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<CorrienteFilosofica | null>(null);

  // Distribuir corrientes en filas para evitar solapamiento
  const filas: CorrienteFilosofica[][] = [[], [], [], []];
  const ordenados = [...CORRIENTES].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const cor of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin === 9999 ? AÑO_MAX : ultimoEnFila.anioFin) + 4 <= anioAX(cor.anioInicio)) {
        filas[f].push(cor);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(cor);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  // Marcadores de siglos con años negativos
  const siglos: number[] = [-500, -300, -100, 200, 500, 800, 1100, 1400, 1700, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en una corriente para ver sus detalles. La línea abarca desde el 620 a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de corrientes filosóficas"
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

          {/* Rectángulos de corrientes */}
          {filas.map((fila, fi) =>
            fila.map((cor) => {
              const anioFin = cor.anioFin === 9999 ? AÑO_MAX : cor.anioFin;
              const x = anioAX(cor.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === cor.id;

              return (
                <g key={cor.id} onClick={() => setSeleccionado(esSeleccionado ? null : cor)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={cor.color}
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
                      {cor.nombre.length > 18 ? cor.nombre.substring(0, 16) + '…' : cor.nombre}
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
        <PanelDetalle corriente={seleccionado} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Corriente en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const corriente = CORRIENTES[indice];
  const anioFinTexto = corriente.anioFin === 9999 ? 'actualidad' : formatAnio(corriente.anioFin);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Corriente en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {CORRIENTES.map((cor, i) => (
          <button
            key={cor.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: cor.color, borderColor: cor.color } : {}}
          >
            {cor.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: corriente.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: corriente.color }}>
          <h3>{corriente.nombre}</h3>
          <p>{formatAnio(corriente.anioInicio)} – {anioFinTexto}</p>
          <span>{ETIQUETAS_CATEGORIA[corriente.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">?</span>
            <p>{corriente.preguntaCentral}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Conceptos clave</h4>
              <ul className={styles.caracteristicasList}>
                {corriente.conceptos.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Filósofos clave</h4>
              <ul className={styles.artistasList}>
                {corriente.filosofos.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra fundamental</span>
            <p>{corriente.obraFundamental}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
            <p>{corriente.contexto}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Corriente anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {CORRIENTES.length}</span>
        <button
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(CORRIENTES.length - 1, i + 1))}
          disabled={indice === CORRIENTES.length - 1}
          aria-label="Corriente siguiente"
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

  const corrientesFiltradas = useMemo(() => {
    return CORRIENTES.filter((cor) => {
      const coincideCategoria = categoriaFiltro === 'todos' || cor.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        cor.nombre.toLowerCase().includes(termino) ||
        cor.filosofos.some((f) => f.toLowerCase().includes(termino));
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
        placeholder="Buscar por corriente o filósofo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar corriente filosófica"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Corriente</th>
              <th>Período</th>
              <th>Categoría</th>
              <th>Filósofo clave</th>
              <th>Pregunta central</th>
            </tr>
          </thead>
          <tbody>
            {corrientesFiltradas.map((cor, i) => {
              const anioFinTexto = cor.anioFin === 9999 ? 'actualidad' : formatAnio(cor.anioFin);
              return (
                <tr
                  key={cor.id}
                  style={i % 2 === 0 ? { background: `${cor.color}18` } : {}}
                >
                  <td><strong style={{ color: cor.color }}>{cor.nombre}</strong></td>
                  <td>{formatAnio(cor.anioInicio)}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[cor.categoria]}22`, color: COLORES_CATEGORIA[cor.categoria] }}>
                      {ETIQUETAS_CATEGORIA[cor.categoria]}
                    </span>
                  </td>
                  <td>{cor.filosofos[0]}</td>
                  <td className={styles.preguntaCell}>{cor.preguntaCentral}</td>
                </tr>
              );
            })}
            {corrientesFiltradas.length === 0 && (
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
  { nombre: 'Filosofía Antigua', desde: -620, hasta: 1, icono: '🏛️' },
  { nombre: 'Helenismo y Roma', desde: 1, hasta: 500, icono: '🦅' },
  { nombre: 'Filosofía Medieval', desde: 500, hasta: 1400, icono: '✝️' },
  { nombre: 'Humanismo y Racionalismo', desde: 1400, hasta: 1700, icono: '🔭' },
  { nombre: 'Ilustración e Idealismo', desde: 1700, hasta: 1840, icono: '💡' },
  { nombre: 'Filosofía Contemporánea', desde: 1840, hasta: 9999, icono: '🧠' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Corrientes filosóficas y eventos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const corrientesEra = CORRIENTES.filter(
            (c) => c.anioInicio < era.hasta && (c.anioFin === 9999 || c.anioFin > era.desde)
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

              {corrientesEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {corrientesEra.map((c) => (
                    <span
                      key={c.id}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${c.color}1A`, color: c.color, borderColor: `${c.color}55` }}
                    >
                      {c.nombre}
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

export default function VisualizadorFilosofia() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Corriente en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia de la Filosofía</h1>
        <p className={styles.heroSubtitle}>
          De los presocráticos al posmodernismo — 16 corrientes filosóficas con filósofos clave, conceptos y contexto histórico
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
        title="Historia de la filosofía: corrientes y pensadores"
        subtitle="Cómo las grandes preguntas filosóficas han transformado nuestra forma de entender el mundo"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 corrientes filosóficas clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Corriente</th>
                <th>Período</th>
                <th>Categoría</th>
                <th>Filósofo clave</th>
                <th>Concepto central</th>
                <th>Obra fundamental</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Presocráticos</strong></td>
                <td>620–400 a.C.</td>
                <td>Antigua</td>
                <td>Heráclito</td>
                <td>Arché (principio primordial)</td>
                <td>Fragmentos de Heráclito</td>
              </tr>
              <tr>
                <td><strong>Estoicismo</strong></td>
                <td>300 a.C.–200 d.C.</td>
                <td>Helenística</td>
                <td>Marco Aurelio</td>
                <td>Apatheia (ecuanimidad)</td>
                <td>Meditaciones</td>
              </tr>
              <tr>
                <td><strong>Escolástica</strong></td>
                <td>400–1400</td>
                <td>Medieval</td>
                <td>Tomás de Aquino</td>
                <td>Fe y razón</td>
                <td>Suma Teológica</td>
              </tr>
              <tr>
                <td><strong>Racionalismo</strong></td>
                <td>1637–1715</td>
                <td>Moderna</td>
                <td>Descartes</td>
                <td>Cogito ergo sum</td>
                <td>Meditaciones Metafísicas</td>
              </tr>
              <tr>
                <td><strong>Existencialismo</strong></td>
                <td>1840–1970</td>
                <td>Contemporánea</td>
                <td>Sartre</td>
                <td>La existencia precede a la esencia</td>
                <td>El Ser y la Nada</td>
              </tr>
              <tr>
                <td><strong>Posmodernismo</strong></td>
                <td>1960–presente</td>
                <td>Contemporánea</td>
                <td>Foucault</td>
                <td>Fin de los grandes relatos</td>
                <td>Las Palabras y las Cosas</td>
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
              <strong>Estudiante de bachillerato</strong>
              <p>Prepara el examen de Historia de la Filosofía de selectividad identificando las corrientes, sus representantes y sus conceptos centrales con la cronología visual.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
            <div>
              <strong>Lector curioso</strong>
              <p>Quiere entender qué corriente filosófica está leyendo al abrir un libro de Camus, Wittgenstein o Foucault, y qué contexto histórico explica sus ideas.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">✏️</span>
            <div>
              <strong>Opositor de Filosofía</strong>
              <p>Necesita repasar el mapa completo de la historia de la filosofía occidental para los temarios de oposición de Secundaria o Universidad.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
            <div>
              <strong>Aficionado a la historia del pensamiento</strong>
              <p>Explora las conexiones entre filosofía, historia política y ciencia para entender cómo las ideas transforman las sociedades a lo largo del tiempo.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué la filosofía antigua sigue siendo relevante hoy?</strong>
            <p>Los presocráticos plantearon preguntas sobre la naturaleza de la realidad que la física cuántica sigue discutiendo. Aristóteles creó la lógica formal que usamos en programación. Los estoicos desarrollaron técnicas de gestión emocional que la psicología cognitiva ha redescubierto. La antigüedad no es historia muerta: es el laboratorio donde nacieron las categorías con las que pensamos.</p>
            <span className={styles.faqTip}>Consejo: lee las Meditaciones de Marco Aurelio como si fuera un libro de autoayuda del siglo XXI — funciona.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre racionalismo y empirismo?</strong>
            <p>El racionalismo (Descartes, Spinoza, Leibniz) sostiene que el conocimiento verdadero proviene de la razón pura, independientemente de los sentidos — hay ideas innatas que no necesitan experiencia. El empirismo (Locke, Hume) sostiene que la mente es una tabla en blanco y todo conocimiento proviene de la experiencia sensorial. Kant intentó sintetizar ambas posturas con su filosofía crítica.</p>
            <span className={styles.faqTip}>La famosa frase de Kant: "Los conceptos sin intuiciones son vacíos; las intuiciones sin conceptos son ciegas."</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El existencialismo de Sartre y el de Camus son lo mismo?</strong>
            <p>Camus rechazaba que le llamaran existencialista. Sartre afirma que la existencia precede a la esencia: somos lo que hacemos, tenemos libertad radical. Camus se interesa por el absurdo — la tensión entre el deseo humano de sentido y el silencio del universo — sin afirmar ni negar la libertad. Para Camus, la respuesta al absurdo es la rebelión; para Sartre, la asunción de la responsabilidad.</p>
            <span className={styles.faqTip}>Lee El mito de Sísifo de Camus para entender el absurdo desde dentro.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿En qué se diferencia la filosofía analítica de la continental?</strong>
            <p>La filosofía analítica (anglosajona) busca claridad y rigor lógico: analiza el lenguaje, la lógica y los argumentos formales. La filosofía continental (francesa, alemana) aborda la existencia, la historia, el poder y la cultura con un estilo más literario y especulativo. Wittgenstein vs. Heidegger es el ejemplo paradigmático de esta división.</p>
            <span className={styles.faqTip}>La división no es geográfica hoy: hay filósofos analíticos en Francia y continentales en EE.UU.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El posmodernismo dice que no existe la verdad?</strong>
            <p>No exactamente. El posmodernismo cuestiona los grandes relatos universales que pretenden explicarlo todo (la Razón, el Progreso, la Ciencia como verdad absoluta). Foucault no dice que la verdad no existe, sino que lo que se considera verdad en cada época está ligado a relaciones de poder. Derrida no niega el significado, sino que muestra cómo los textos generan significados que escapan a la intención del autor.</p>
            <span className={styles.faqTip}>La crítica posmoderna al cientificismo no implica negacionismo científico — es una distinción importante.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo estudiar una corriente filosófica eficazmente</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el contexto histórico</strong>
              <p>Toda filosofía nace en un tiempo y lugar concretos. El estoicismo surge en el mundo helenístico tras la crisis de la polis griega; el existencialismo, tras las guerras mundiales. Pregúntate: ¿qué crisis o transformación histórica responde esta filosofía?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Formula la pregunta central</strong>
              <p>Cada corriente parte de una pregunta fundamental. El racionalismo: ¿qué podemos saber con certeza? El existencialismo: ¿cómo vivir con libertad? Dominar la pregunta es dominar la corriente. El resto son intentos de respuesta.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Aprende tres conceptos clave</strong>
              <p>No intentes memorizar todo. Con tres conceptos bien entendidos puedes explicar cualquier corriente: uno sobre metafísica (qué es real), uno sobre epistemología (qué podemos conocer) y uno sobre ética (cómo debemos actuar).</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Lee un texto primario, aunque sea fragmentado</strong>
              <p>Ningún manual sustituye al texto original. Aunque sea una selección de diez páginas del Tractatus, las Meditaciones o El Capital, el contacto directo con la escritura del filósofo cambia la comprensión radicalmente respecto a leer solo resúmenes.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Conecta con la corriente siguiente</strong>
              <p>La filosofía es un diálogo a través del tiempo. El empirismo responde al racionalismo; Kant responde al empirismo; Hegel responde a Kant; Marx responde a Hegel. Entender las corrientes como conversación es más eficaz que estudiarlas como islas aisladas.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para estudiar historia de la filosofía</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p>La filosofía no es solo historia de ideas abstractas: cada corriente tiene implicaciones políticas, científicas y éticas concretas que puedes rastrear en el mundo actual.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p>Las corrientes se solapan y dialogan entre sí: Kant es racionalista Y empirista a la vez. No fuerces fronteras rígidas donde los propios filósofos no las ponían.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Empieza por las corrientes antiguas (presocráticos, Platón, Aristóteles) y moderna temprana (Descartes, Hume, Kant): son la base de toda la filosofía posterior.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p>Usa la cronología para ver qué filósofo leyó a quién y de qué debate histórico participa cada corriente — el orden temporal importa para entender la lógica del desarrollo filosófico.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al estudiar filosofía</strong>
          <ul>
            <li>Confundir <strong>Idealismo</strong> (postura filosófica sobre la naturaleza de la realidad) con idealismo en sentido coloquial (tener ideales). El Idealismo alemán de Hegel afirma que la realidad es racional y espiritual, no que seamos ingenuamente optimistas.</li>
            <li>Llamar <strong>nihilista</strong> a Nietzsche: Nietzsche describía el nihilismo como la crisis que había que superar, no como su propia posición. La voluntad de poder y el eterno retorno son respuestas al nihilismo, no ejemplos de él.</li>
            <li>Asumir que <strong>empirismo = ciencia</strong> y <strong>racionalismo = religión</strong>: Spinoza era racionalista y panteísta-materialista; Newton era empirista y profundamente religioso. Las categorías filosóficas no coinciden con las divisiones entre ciencia y fe.</li>
            <li>Estudiar la filosofía continental y la analítica como si fueran incompatibles: muchas de las preguntas más interesantes del siglo XXI (filosofía de la mente, ética de la IA, epistemología social) se nutren de ambas tradiciones simultáneamente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-filosofia')} />
      <ShareCard appName="visualizador-filosofia" />
      <Footer appName="visualizador-filosofia" />
    </div>
  );
}
