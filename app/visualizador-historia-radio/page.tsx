'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaRadio.module.css';
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

type Categoria = 'pioneros' | 'comercial' | 'guerra' | 'musica' | 'transistor' | 'fm' | 'privada' | 'digital' | 'podcast' | 'ia';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoRadio {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  formato: string;
  inventores: string[];
  hitos: string[];
  obra: string;
  pregunta: string;
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

const PERIODOS: PeriodoRadio[] = [
  {
    id: 'hertz_marconi', nombre: 'Los Pioneros de las Ondas', anioInicio: 1895, anioFin: 1907,
    categoria: 'pioneros', formato: 'Ondas hertzianas',
    inventores: ['Heinrich Hertz', 'Guglielmo Marconi', 'Nikola Tesla', 'Reginald Fessenden'],
    hitos: ['Hertz demuestra las ondas electromagnéticas (1887)', 'Marconi patenta la radio (1896)', 'Primera transmisión transatlántica Marconi (1901)', 'Primera transmisión de voz humana — Fessenden (1906)', 'Tesla disputa la patente de la radio'],
    obra: 'La transmisión transatlántica de Marconi desde Poldhu (Cornualles) a Terranova — 3.500 km de señal (1901)',
    pregunta: '¿Quién inventó realmente la radio: Marconi, Tesla o Fessenden?',
    contexto: 'Heinrich Hertz demostró en 1887 que las ondas electromagnéticas existían tal como predijo Maxwell. Marconi fue el primero en patentar un sistema de radio en 1896 y cruzar el Atlántico en 1901. Pero Fessenden logró la primera transmisión de voz humana en 1906, cantando "Oh Holy Night" a marineros en el Atlántico. Tesla reclamó la prioridad: el Tribunal Supremo de EE.UU. le reconoció algunas patentes en 1943.',
    color: '#8B4513',
  },
  {
    id: 'radio_experimental', nombre: 'Radio Experimental y Aficionados', anioInicio: 1907, anioFin: 1920,
    categoria: 'pioneros', formato: 'Onda corta y amateur',
    inventores: ['Lee de Forest', 'Edwin Armstrong', 'Reginald Fessenden'],
    hitos: ['Lee de Forest inventa el triodo (1906)', 'Primera emisión musical desde la Torre Eiffel (1908)', 'Red de radioaficionados ARRL (1914)', 'Radio en la Primera Guerra Mundial', 'Edwin Armstrong inventa el superheterodino (1918)'],
    obra: 'La primera emisión musical desde la Torre Eiffel — música de gramófono transmitida a barcos en el Atlántico (1908)',
    pregunta: '¿Por qué los gobiernos intentaron prohibir la radio amateur y qué papel jugó en la Primera Guerra Mundial?',
    contexto: 'Lee de Forest inventó el triodo (tubo al vacío) en 1906, haciendo posible amplificar señales de radio. Miles de radioaficionados montaron emisoras caseras. Los gobiernos incautaron sus equipos al estallar la WWI (1914), reconociendo el valor estratégico de la radio. Edwin Armstrong desarrolló el circuito superheterodino en 1918, base de todos los receptores modernos. La ARRL (1914) organizó la comunidad de radioaficionados.',
    color: '#8B6914',
  },
  {
    id: 'radio_comercial', nombre: 'Nacimiento de la Radio Comercial', anioInicio: 1920, anioFin: 1935,
    categoria: 'comercial', formato: 'AM broadcast',
    inventores: ['Frank Conrad (Westinghouse)', 'David Sarnoff (RCA)', 'John Reith (BBC)'],
    hitos: ['KDKA Pittsburgh — primera emisora comercial (2/11/1920)', 'BBC fundada (1922)', 'RCA y NBC — primera red radiofónica (1926)', 'Radio España — primera emisora española (1924)', 'Primer spot publicitario de radio (1922)'],
    obra: 'KDKA Pittsburgh — primera emisora comercial del mundo, transmitió los resultados de las elecciones presidenciales americanas el 2 de noviembre de 1920',
    pregunta: '¿Cómo pasó la radio de curiosidad técnica a medio de masas en solo 10 años?',
    contexto: 'El 2 de noviembre de 1920, KDKA de Pittsburgh transmitió los resultados electorales de Harding vs Cox ante millones de oyentes. La BBC nació en 1922 con el modelo de servicio público. En España, Radio España abrió en 1924, seguida de Unión Radio en 1925 (hoy SER). El primer spot publicitario fue emitido por WEAF de Nueva York en 1922: 10 minutos por 50 dólares.',
    color: '#C8A000',
  },
  {
    id: 'edad_dorada', nombre: 'La Edad de Oro de la Radio', anioInicio: 1930, anioFin: 1945,
    categoria: 'comercial', formato: 'AM con entretenimiento y drama',
    inventores: ['Orson Welles', 'Franklin D. Roosevelt', 'CBS y NBC'],
    hitos: ['La guerra de los mundos — Orson Welles (1938)', 'Fireside Chats de Roosevelt (1933-1944)', 'Radionovelas (soap operas)', 'Radio en la España franquista — RNE (1937)', 'La radio explica la Segunda Guerra Mundial'],
    obra: 'La guerra de los mundos — Orson Welles (30/10/1938) — 6 millones de oyentes creyeron una invasión alienígena real',
    pregunta: '¿Por qué Roosevelt eligió la radio para hablar directamente a los americanos desde la Casa Blanca y qué impacto tuvo?',
    contexto: 'Roosevelt pronunció 30 "Fireside Chats" por radio entre 1933 y 1944, reconectando con una nación en crisis. La guerra de los mundos de Welles (1938) demostró el poder hipnótico de la radio: emitida como boletines de noticias, causó pánico real. En la España de Franco, RNE (fundada en 1937 en Salamanca) fue herramienta de propaganda. La BBC fue el faro de la Europa ocupada durante la WWII.',
    color: '#DAA520',
  },
  {
    id: 'radio_guerra', nombre: 'Radio en la Segunda Guerra Mundial', anioInicio: 1939, anioFin: 1948,
    categoria: 'guerra', formato: 'Propaganda y noticiarios',
    inventores: ['BBC World Service', 'Goebbels (propaganda)', 'Radio Londres'],
    hitos: ['BBC World Service como voz de la resistencia', 'Radio Londres transmite a la Francia ocupada', 'Propaganda nazi de Goebbels', 'La Voz de América (VOA) fundada (1942)', 'Radio Free Europe (1949)'],
    obra: 'Radio Londres — "Ici Londres. Les Français parlent aux Français" — mensajes cifrados a la Resistencia francesa (1940-44)',
    pregunta: '¿Cómo usó Churchill la radio para mantener viva la resistencia europea durante la ocupación nazi?',
    contexto: 'La BBC World Service emitía en 40 idiomas hacia Europa ocupada. Radio Londres transmitía mensajes cifrados a los resistentes franceses: "El tío tiene bigote largo" podía significar que se iba a ejecutar un sabotaje. Goebbels construyó el "Volksempfänger" (receptor del pueblo) para 16 millones de hogares alemanes. La Voz de América (1942) y Radio Free Europe (1949) continuaron la guerra de las ondas en la Guerra Fría.',
    color: '#4A4A4A',
  },
  {
    id: 'rock_radio', nombre: 'Radio, Rock y Cultura Popular', anioInicio: 1948, anioFin: 1965,
    categoria: 'musica', formato: 'AM Top 40',
    inventores: ['Alan Freed (disc jockey)', 'Gordon McLendon (Top 40)', 'Elvis Presley'],
    hitos: ['El disc jockey como estrella de radio', 'Formato Top 40 (McLendon, 1953)', 'Alan Freed acuña "rock and roll" (1951)', 'Radio Luxemburgo desde Europa', 'La radio sobrevive a la llegada de la TV'],
    obra: 'Radio Luxemburgo — la emisora pirata más escuchada de Europa, transmitiendo rock desde el Gran Ducado (1933-1991)',
    pregunta: '¿Cómo salvó el rock and roll a la radio cuando la televisión amenazaba con matarla?',
    contexto: 'La llegada de la TV en los años 50 parecía condenar a la radio. Pero el formato Top 40 (McLendon, 1953) reinventó la radio como vehículo del rock and roll. Alan Freed acuñó el término "rock and roll" en WJMO Cleveland en 1951. Radio Luxemburgo y Radio Caroline emitían desde barcos en el Mar del Norte para eludir las restricciones europeas. La radio se volvió íntima, personal, el acompañante del adolescente rebelde.',
    color: '#FF4500',
  },
  {
    id: 'transistor_fm', nombre: 'Transistor, FM y Contracultura', anioInicio: 1960, anioFin: 1980,
    categoria: 'transistor', formato: 'FM estéreo',
    inventores: ['Edwin Armstrong (FM)', 'Los Beatles', 'Emisoras FM underground'],
    hitos: ['Radio de transistores portable (1954)', 'FM estéreo aprobada en EE.UU. (1961)', 'Emisoras FM de rock psicodélico (1967)', 'KMPX San Francisco — primera FM underground', 'Radio Nacional de España en FM (1972)'],
    obra: 'KMPX San Francisco (1967) — primera emisora FM underground de EE.UU., emitía álbumes completos de rock psicodélico sin cortar',
    pregunta: '¿Por qué la FM fue ignorada durante 20 años y cómo se convirtió en el hogar de la contracultura?',
    contexto: 'Edwin Armstrong inventó la FM en los años 30 pero RCA (que tenía invertidos millones en AM) la bloqueó durante décadas. La FM resucitó en los años 60 cuando los jóvenes quisieron escuchar álbumes completos, no singles. KMPX San Francisco (1967) emitía rock psicodélico sin interrupciones. La FM se convirtió en el hogar de la contracultura: emisoras que hablaban de Vietnam, drogas y política mientras la AM convencional callaba.',
    color: '#9400D3',
  },
  {
    id: 'radio_privada_espana', nombre: 'Radio Privada y Democracia en España', anioInicio: 1977, anioFin: 1995,
    categoria: 'privada', formato: 'AM/FM convencional',
    inventores: ['Cadena SER', 'Luis del Olmo', 'José María García', 'Cadena COPE'],
    hitos: ['Democratización de las ondas (1977)', 'La SER y COPE como actores políticos', 'Noche del 23-F — papel crucial de la radio', 'Onda Cero fundada (1990)', 'Los cuarenta principales en FM'],
    obra: 'La noche del 23-F (23/02/1981) — la radio española informó en tiempo real del golpe de Estado mientras la TV callaba',
    pregunta: '¿Por qué fue la radio y no la televisión el medio que informó a los españoles durante el golpe del 23-F?',
    contexto: 'Durante el intento de golpe de estado del 23-F de 1981, TVE emitió carta de ajuste mientras la radio informaba en directo. Luis del Olmo, Iñaki Gabilondo y José María García mantuvieron a los españoles pegados a sus transistores. La SER y la COPE se convirtieron en actores políticos de primer orden. Los 40 Principales (lanzados en FM en 1966) dominaron la música. La radio española vivió su mejor momento de audiencia en los 80.',
    color: '#2E86AB',
  },
  {
    id: 'radio_digital', nombre: 'Radio Digital y Satelital', anioInicio: 1990, anioFin: 2010,
    categoria: 'digital', formato: 'DAB y radio satelital',
    inventores: ['Sirius XM (EE.UU.)', 'WorldSpace', 'consorcio Eureka-147'],
    hitos: ['DAB — Digital Audio Broadcasting (1995)', 'Sirius XM — radio satelital de pago (2001)', 'Internet radio streaming (1993)', 'RDS — Radio Data System generalizado', 'España adopta DAB+ lentamente'],
    obra: 'Sirius XM Satellite Radio (2001) — 150 canales sin anuncios por suscripción, revolucionó el modelo de negocio radiofónico',
    pregunta: '¿Por qué la radio digital DAB fracasó en Europa mientras el streaming online la hacía irrelevante?',
    contexto: 'El estándar DAB de radio digital prometió calidad de CD sin interferencias. Pero la transición fue lenta y cara. Sirius XM en EE.UU. demostró que la suscripción funcionaba para radio. El verdadero cambio llegó por internet: ya en 1993, WXYC Chapel Hill retransmitía en línea. El RDS permitió mostrar el nombre del tema en el transistor. España fue reacia al DAB: miles de emisoras comunitarias no podían costearse la transición.',
    color: '#1E90FF',
  },
  {
    id: 'radio_online', nombre: 'Radio Online y Música en Streaming', anioInicio: 2000, anioFin: 2012,
    categoria: 'digital', formato: 'Streaming por internet',
    inventores: ['Last.fm', 'Pandora', 'Spotify (Suecia)'],
    hitos: ['Napster cambia la distribución musical (1999)', 'Last.fm — radio personalizada (2002)', 'Pandora — Music Genome Project (2000)', 'Spotify lanzamiento (2008)', 'iTunes Store (2003)'],
    obra: 'Pandora Radio — el Music Genome Project (2000): 400 atributos musicales para recomendar canciones con precisión matemática',
    pregunta: '¿Mató Spotify a la radio o la transformó en algo nuevo?',
    contexto: 'Last.fm (2002) registraba todo lo que escuchabas y recomendaba música afín. Pandora (2000) analizaba canciones con 400 atributos para crear estaciones personalizadas. Spotify (2008) ofreció todo el catálogo musical por suscripción. Las emisoras de radio se reinventaron como prescriptoras de tendencias, no como distribuidoras de música. La radio online multiplicó las emisoras: cualquiera podía emitir desde casa.',
    color: '#1DB954',
  },
  {
    id: 'podcast_revolucion', nombre: 'La Revolución del Podcast', anioInicio: 2004, anioFin: 2018,
    categoria: 'podcast', formato: 'Podcast on demand',
    inventores: ['Adam Curry', 'Dave Winer', 'Ira Glass (This American Life)', 'Sarah Koenig (Serial)'],
    hitos: ['Adam Curry y Dave Winer inventan el podcasting (2004)', 'iTunes añade soporte podcast (2005)', 'Serial — primer podcast viral (2014)', 'Podcast español: iVoox, Podium (2015)', 'Joe Rogan Experience — el podcast más escuchado del mundo'],
    obra: 'Serial (2014) — el podcast de Sarah Koenig sobre un asesinato de 1999 que descargaron 40 millones de personas en el primer mes',
    pregunta: '¿Por qué el podcast resucitó el formato radiofónico que la televisión e internet parecían haber enterrado?',
    contexto: 'Adam Curry (ex-VJ de MTV) y Dave Winer inventaron en 2004 un sistema de distribución RSS para audio: nació el podcasting. Apple integró podcasts en iTunes en 2005. Serial (2014) demostró que el periodismo narrativo largo funcionaba en audio: 40 millones de descargas en el primer mes. En España, iVoox (2008) y Podium Podcast de Prisa (2015) impulsaron el sector. Joe Rogan firmó con Spotify por 100 millones de dólares en 2020.',
    color: '#8B008B',
  },
  {
    id: 'podcast_industria', nombre: 'Podcast como Industria y Medio', anioInicio: 2018, anioFin: 2023,
    categoria: 'podcast', formato: 'Audio on demand premium',
    inventores: ['Spotify', 'Apple Podcasts', 'iVoox España'],
    hitos: ['Spotify compra Gimlet y Anchor (2019)', 'Spotify exclusivas con Joe Rogan (100M$)', 'Amazon compra Wondery', 'Audiolibros y podcasts de pago', 'Boom de true crime en español'],
    obra: 'El contrato de Joe Rogan con Spotify por 100 millones de dólares (2020) — el mayor contrato de la historia del audio',
    pregunta: '¿Es el podcast la radio del siglo XXI o un medio completamente nuevo con sus propias reglas?',
    contexto: 'Spotify compró Gimlet Media, Anchor, Parcast y Ringer por 1.000 millones de dólares para convertirse en el Netflix del audio. Joe Rogan firmó en exclusiva por 100M$ en 2020. Amazon compró Wondery. El true crime en español explotó (El Caso Alcàsser, Crimen y Criminología). La publicidad en podcast alcanzó 2.000 millones de dólares en 2023 en EE.UU. El modelo de distribución se diversificó: gratuito, suscripción, exclusivo.',
    color: '#006400',
  },
  {
    id: 'radio_social', nombre: 'Radio Social y Audio en Tiempo Real', anioInicio: 2020, anioFin: 2024,
    categoria: 'ia', formato: 'Audio social en tiempo real',
    inventores: ['Clubhouse', 'Twitter Spaces', 'Discord Stage Channels'],
    hitos: ['Clubhouse — audio social en tiempo real (2020)', 'Twitter Spaces', 'Discord Stage Channels', 'Boom durante el confinamiento COVID', 'Caída de Clubhouse tras el hype inicial'],
    obra: 'Clubhouse (2020) — la app de audio social que alcanzó 10 millones de usuarios en 2 meses durante el confinamiento de COVID',
    pregunta: '¿Fue Clubhouse la revolución del audio social o un fenómeno pasajero de la pandemia?',
    contexto: 'Clubhouse nació en abril de 2020, en pleno confinamiento global. Las salas de audio en directo conectaban a personas cuando no podían verse. Alcanzó 10 millones de usuarios en 2 meses. Twitter respondió con Spaces, Discord con Stage Channels. Pero Clubhouse no supo retener usuarios cuando el confinamiento acabó: perdió el 95% de tráfico en 6 meses. El audio social sobrevivió integrado en plataformas existentes, no como app independiente.',
    color: '#FF6B35',
  },
  {
    id: 'radio_ia', nombre: 'Radio con IA y Audio Generativo', anioInicio: 2022, anioFin: 2030,
    categoria: 'ia', formato: 'IA generativa de audio',
    inventores: ['Google NotebookLM', 'ElevenLabs', 'OpenAI Whisper'],
    hitos: ['ElevenLabs — clonación de voz con IA (2022)', 'Google NotebookLM — podcast IA generativo (2024)', 'OpenAI Whisper — transcripción automática', 'Locutores virtuales en emisoras', 'Noticias leídas por voz sintética'],
    obra: 'Google NotebookLM (2024) — genera podcasts conversacionales entre dos locutores IA a partir de cualquier documento',
    pregunta: '¿Sustituirán los locutores de IA a los presentadores de radio humanos, o la voz humana sigue siendo irremplazable?',
    contexto: 'ElevenLabs (2022) demostró que clonar una voz humana con 3 minutos de audio era posible. Google NotebookLM (2024) generó podcasts conversacionales entre dos locutores IA que suenan convincentemente humanos. OpenAI Whisper transcribe audio con precisión superior a humanos. Algunas emisoras locales ya usan locutores virtuales para franjas de madrugada. El debate sobre autenticidad y deepfakes de voz está abierto. La IA también personaliza la radio: cada oyente recibe una programación única.',
    color: '#FF0080',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1896, evento: 'Marconi patenta la radio y lleva sus experimentos a Inglaterra' },
  { anio: 1901, evento: 'Primera transmisión transatlántica de radio — Marconi cruza el Atlántico con una señal' },
  { anio: 1920, evento: 'KDKA Pittsburgh — primera emisora comercial del mundo, emite resultados electorales' },
  { anio: 1938, evento: 'La guerra de los mundos de Orson Welles causa pánico masivo en EE.UU.' },
  { anio: 1953, evento: 'Formato Top 40 de McLendon convierte la radio en el hogar del rock and roll' },
  { anio: 1981, evento: 'El 23-F: la radio española informa en directo del golpe mientras la TV calla' },
  { anio: 2004, evento: 'Adam Curry y Dave Winer inventan el podcasting con RSS de audio' },
  { anio: 2014, evento: 'Serial — 40 millones de descargas en el primer mes, el podcast se convierte en fenómeno global' },
  { anio: 2024, evento: 'Google NotebookLM genera podcasts con locutores IA a partir de cualquier documento' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  pioneros: 'Pioneros',
  comercial: 'Comercial',
  guerra: 'Guerra',
  musica: 'Música',
  transistor: 'Transistor/FM',
  fm: 'FM',
  privada: 'Radio Privada',
  digital: 'Digital',
  podcast: 'Podcast',
  ia: 'IA',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  pioneros: '#8B4513',
  comercial: '#C8A000',
  guerra: '#4A4A4A',
  musica: '#FF4500',
  transistor: '#9400D3',
  fm: '#6A0DAD',
  privada: '#2E86AB',
  digital: '#1E90FF',
  podcast: '#8B008B',
  ia: '#FF0080',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoRadio }) {
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {periodo.anioFin}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
          <ul className={styles.hitosList}>
            {periodo.hitos.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Inventores y protagonistas</h4>
          <ul className={styles.pionerosList}>
            {periodo.inventores.map((inv) => (
              <li key={inv}>{inv}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra / Hito icónico</span>
        <p>{periodo.obra}</p>
      </div>

      <div className={styles.preguntaBox}>
        <span className={styles.preguntaLabel}>Pregunta central</span>
        <p className={styles.preguntaTexto}>{periodo.pregunta}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{periodo.contexto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = 1895;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoRadio | null>(null);

  const filas: PeriodoRadio[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      const finUltimo = ultimoEnFila ? Math.min(ultimoEnFila.anioFin, AÑO_MAX) : AÑO_MIN;
      if (!ultimoEnFila || anioAX(finUltimo) + 4 <= anioAX(per.anioInicio)) {
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

  const marcadores: number[] = [1900, 1920, 1940, 1960, 1980, 2000, 2010, 2020];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 1895 hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la radio"
        >
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {marcadores.map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{m}</text>
            </g>
          ))}

          {filas.map((fila, fi) =>
            fila.map((per) => {
              const anioFin = Math.min(per.anioFin, AÑO_MAX);
              const x = anioAX(per.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === per.id;

              return (
                <g key={per.id} onClick={() => setSeleccionado(esSeleccionado ? null : per)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x} y={y} width={w} height={FILA_ALTO} rx={4}
                    fill={per.color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 50 && (
                    <text
                      x={x + w / 2} y={y + FILA_ALTO / 2 + 4}
                      fontSize={9} fill="#fff" textAnchor="middle" fontWeight={600}
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

      <div className={styles.leyendaCategorias}>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <span key={cat} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: COLORES_CATEGORIA[cat] }} aria-hidden="true" />
            {ETIQUETAS_CATEGORIA[cat]}
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
          <p>{periodo.anioInicio} – {periodo.anioFin}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">?</span>
            <p>{periodo.pregunta}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
              <ul className={styles.hitosList}>
                {periodo.hitos.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Inventores y protagonistas</h4>
              <ul className={styles.pionerosList}>
                {periodo.inventores.map((inv) => <li key={inv}>{inv}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra / Hito icónico</span>
            <p>{periodo.obra}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
            <p>{periodo.contexto}</p>
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
        per.inventores.some((inv) => inv.toLowerCase().includes(termino)) ||
        per.formato.toLowerCase().includes(termino);
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
        placeholder="Buscar por período, inventor o formato..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de la historia de la radio"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Formato</th>
              <th>Hito icónico</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => (
              <tr key={per.id} style={i % 2 === 0 ? { background: `${per.color}18` } : {}}>
                <td><strong style={{ color: per.color }}>{per.nombre}</strong></td>
                <td>{per.anioInicio}–{per.anioFin}</td>
                <td>
                  <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                    {ETIQUETAS_CATEGORIA[per.categoria]}
                  </span>
                </td>
                <td>{per.formato}</td>
                <td className={styles.peliculaCell}>{per.obra}</td>
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
// Tab 4: Contexto Histórico — vista por eras
// ─────────────────────────────────────────────

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
  descripcion: string;
}

const ERAS: Era[] = [
  { nombre: 'Ondas y Pioneros', desde: 1895, hasta: 1920, icono: '📡', descripcion: 'Hertz, Marconi y Tesla compiten por inventar la radio; las primeras voces cruzan el Atlántico' },
  { nombre: 'Edad de Oro AM', desde: 1920, hasta: 1955, icono: '📻', descripcion: 'La radio comercial conquista el hogar: Roosevelt, Orson Welles y el rock and roll nacen en las ondas' },
  { nombre: 'FM y Contracultura', desde: 1955, hasta: 1980, icono: '🎵', descripcion: 'El transistor hace la radio personal; el rock y la contracultura encuentran en la FM su hogar' },
  { nombre: 'Radio Privada y Democracia', desde: 1977, hasta: 2000, icono: '🗣️', descripcion: 'España democratiza las ondas; la radio relata el 23-F mientras la TV calla' },
  { nombre: 'Digital y Streaming', desde: 2000, hasta: 2015, icono: '💻', descripcion: 'Internet, Spotify y el podcast reinventan el audio; cualquiera puede ser emisora' },
  { nombre: 'Podcast e IA', desde: 2015, hasta: 2030, icono: '🎙️', descripcion: 'Joe Rogan, Serial y NotebookLM convierten el audio en el medio estrella del siglo XXI' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos radiofónicos y eventos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anioInicio < era.hasta && p.anioFin > era.desde
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && ev.anio < era.hasta
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>
                    {era.desde} – {era.hasta === 2030 ? 'hoy' : era.hasta}
                  </span>
                </div>
              </div>

              <p className={styles.eraDescripcion}>{era.descripcion}</p>

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

export default function VisualizadorHistoriaRadio() {
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
        <h1 className={styles.heroTitle}>Historia de la Radio</h1>
        <p className={styles.heroSubtitle}>
          De Marconi y Hertz al podcast con IA — 14 períodos con los inventores, hitos y formatos que transformaron el audio en 130 años de historia
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
        title="Guía completa sobre la historia de la radio"
        subtitle="Cómo la radio transformó la comunicación, la cultura y el entretenimiento en 130 años"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 5 formatos clave de la historia de la radio</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Tecnología</th>
                <th>Audiencia</th>
                <th>Modelo negocio</th>
                <th>Legado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>AM comercial (1920-55)</strong></td>
                <td>Ondas AM, válvulas de vacío</td>
                <td>Masiva, familiar, en el salón</td>
                <td>Publicidad + servicio público</td>
                <td>Inventó el entretenimiento de masas</td>
              </tr>
              <tr>
                <td><strong>FM contracultura (1960-80)</strong></td>
                <td>FM estéreo, transistor</td>
                <td>Joven, rebelde, individual</td>
                <td>Publicidad alternativa</td>
                <td>La radio como voz de la contracultura</td>
              </tr>
              <tr>
                <td><strong>Radio pública (1922-hoy)</strong></td>
                <td>AM/FM/DAB/streaming</td>
                <td>Ciudadana, plural, informada</td>
                <td>Canon/impuesto, sin publicidad</td>
                <td>Modelo de servicio público replicado en 100 países</td>
              </tr>
              <tr>
                <td><strong>Podcast (2004-hoy)</strong></td>
                <td>MP3/RSS/streaming</td>
                <td>Nicho apasionado, on demand</td>
                <td>Publicidad + suscripción + exclusivas</td>
                <td>Resucitó el audio narrativo largo</td>
              </tr>
              <tr>
                <td><strong>Radio IA (2022-hoy)</strong></td>
                <td>LLM, síntesis de voz, TTS</td>
                <td>Personalizada, 24/7</td>
                <td>Suscripción + datos de usuario</td>
                <td>Cuestiona la autenticidad y la autoría</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios */}
        <h3>Escenarios futuros para la radio</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
            <div>
              <strong>Radio totalmente personalizada por IA</strong>
              <p>Una IA compone la programación de cada oyente en tiempo real: canciones adaptadas a su estado de ánimo detectado, noticias relevantes para su perfil, locutores virtuales con su voz favorita. Cada oyente tiene su "emisora" única.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📉</span>
            <div>
              <strong>Desaparición de emisoras tradicionales</strong>
              <p>Las frecuencias AM/FM quedan vacías a medida que toda la escucha migra a plataformas digitales. Solo subsisten grandes cadenas y radio pública; las emisoras locales desaparecen por falta de financiación y audiencia suficiente.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎙️</span>
            <div>
              <strong>Podcast supera a televisión</strong>
              <p>El tiempo dedicado al audio on demand supera al consumo de televisión lineal entre menores de 40 años. Las grandes productoras invierten en podcasts como hicieron con series. El audio se convierte en el medio estrella del siglo XXI.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📻</span>
            <div>
              <strong>Renacimiento de la radio local</strong>
              <p>Paradójicamente, la saturación digital hace que la radio local y comunitaria resurja como espacio de confianza y comunidad. La gente vuelve a escuchar su ciudad en directo como reacción al ruido global del internet.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre historia de la radio</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Quién inventó realmente la radio: Marconi o Tesla?</strong>
            <p>La respuesta honesta es que no hay un único inventor. Marconi fue el primero en patentar un sistema de radio funcional (1896) y el primero en cruzar el Atlántico con una señal (1901). Tesla desarrolló ideas similares antes pero no llegó a construir un sistema completo y operativo a tiempo. El Tribunal Supremo de EE.UU. reconoció en 1943 algunas patentes de Tesla, tras su muerte, por razones que incluían invalidar las de Marconi. Fessenden realizó la primera transmisión de voz humana en 1906.</p>
            <span className={styles.faqTip}>La disputa sobre la "invención" de la radio refleja un patrón común: las grandes tecnologías emergen de decenas de contribuciones simultáneas, y la historia premia al que llega primero con la patente o el inversor adecuado.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué la radio sobrevivió a la televisión y a internet?</strong>
            <p>La radio sobrevivió a la televisión porque ofrece algo que la TV no puede: compañía en movimiento. Puedes escuchar radio conduciendo, cocinando o haciendo deporte. Sobrevivió a internet porque el audio es el único formato que no requiere atención visual. El podcast es la radio adaptada a internet: mismo principio (voz + historia), nueva distribución. La radio ha sobrevivido reinventándose tres veces en 100 años.</p>
            <span className={styles.faqTip}>La radio AM nunca desapareció del todo: en muchos países rurales y en situaciones de emergencia sigue siendo el medio más fiable, con emisoras que llevan décadas en frecuencias que no requieren internet.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué papel jugó la radio española durante la Transición y el 23-F?</strong>
            <p>La radio española vivió su momento de mayor impacto político entre 1977 y 1982. Durante la Transición, fue el espacio donde se debatieron abiertamente temas que la TV (controlada por el Estado) ignoraba. El 23 de febrero de 1981, cuando el teniente coronel Tejero irrumpió en el Congreso, TVE emitió carta de ajuste. Fue la radio — la SER, la COPE, la Cadena Rato — la que informó en directo durante horas, convirtiéndose en el único lazo de comunicación entre el gobierno democrático y los ciudadanos.</p>
            <span className={styles.faqTip}>El papel de la radio en el 23-F es un caso de estudio en escuelas de periodismo: demuestra que el medio más "primitivo" puede ser el más resistente en una crisis institucional.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Es el podcast realmente diferente de la radio convencional?</strong>
            <p>Sí, en aspectos cruciales. La radio convencional es lineal (todos escuchan lo mismo al mismo tiempo), efímera (desaparece al emitirse) y generalista (debe atraer a audiencias masivas). El podcast es asíncrono (cada oyente elige cuándo), permanente (queda archivado) y de nicho (puede dirigirse a 10.000 personas apasionadas por un tema específico). El modelo de negocio también es distinto: la radio vende publicidad masiva, el podcast vende acceso a audiencias muy específicas y comprometidas.</p>
            <span className={styles.faqTip}>Serial (2014) demostró que el audio puede sustentar periodismo narrativo de profundidad — el tipo de reportaje que en los 90 solo cabía en libros o revistas especializadas.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Pueden los locutores de IA sustituir a los presentadores humanos de radio?</strong>
            <p>Para franjas de madrugada y contenido repetitivo, ya lo están haciendo. Algunas emisoras locales en EE.UU. y Europa usan locutores virtuales fuera del horario prime. Pero la radio en directo — con sus errores, reacciones en tiempo real y conexión humana — sigue siendo irreplicable por la IA actual. El presentador de radio da sentido a lo que ocurre en el momento; la IA puede simularlo, pero no vivir el directo con el mismo riesgo y autenticidad.</p>
            <span className={styles.faqTip}>Google NotebookLM genera podcasts convincentes entre dos locutores IA, pero el oyente sabe que no hay nadie ahí. La autenticidad de la voz humana en directo tiene un valor que la IA, por ahora, no puede replicar completamente.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía 5 pasos */}
        <h3>Guía para entender la evolución del audio en 5 pasos</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica la tecnología que cambió las posibilidades del medio</strong>
              <p>Cada era radiofónica está marcada por una tecnología: la válvula de vacío (1906), el transistor (1954), la FM estéreo (1961), el MP3/RSS (2001), los modelos de lenguaje grande (2022). Pregúntate: ¿qué nuevo poder dio esta tecnología al emisor o al oyente? La respuesta explica casi todo lo demás.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Escucha al menos un archivo sonoro de cada era</strong>
              <p>Ningún texto describe la radio mejor que escuchar la radio. Los archivos sonoros de la BBC están disponibles online: los Fireside Chats de Roosevelt, Radio Londres durante la WWII, el pánico de La guerra de los mundos. Para el podcast, escucha el primer episodio de Serial. La experiencia auditiva es insustituible.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Conecta el modelo de negocio con el tipo de contenido</strong>
              <p>La radio de servicio público (BBC, RNE) produce contenido que el mercado no financia. La radio comercial AM produce entretenimiento masivo. El podcast de nicho sobrevive porque 10.000 oyentes muy comprometidos valen más publicitariamente que 1 millón de oyentes distraídos. El modelo económico determina qué voces se escuchan y cuáles no.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Estudia cómo cada era reaccionó a la anterior</strong>
              <p>La FM underground (1967) fue una reacción al conservadurismo de la AM. El podcast (2004) fue una reacción a la radio corporativa que nunca emitía lo que los oyentes querían escuchar. Clubhouse (2020) fue una reacción al podcasting grabado y editado — quería recuperar la espontaneidad del directo. Cada innovación radiofónica es también un manifiesto contra lo que existía antes.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Observa el papel político y social de la radio en cada período</strong>
              <p>Roosevelt usó la radio para reconstruir la confianza en el gobierno. Goebbels la usó para la propaganda totalitaria. La BBC resistió la ocupación nazi. La radio española sostuvo la Transición democrática. El podcast amplifica voces marginadas que la radio comercial ignoraba. El audio siempre ha sido un espacio de poder — quien controla las frecuencias controla el relato.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Consejos para ser un oyente crítico</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📡</span>
            <p>Cuando escuches radio AM o FM convencional, pregúntate quién posee esa emisora y qué intereses tiene. La concentración mediática ha reducido dramáticamente la diversidad de voces en el dial. Lo que parece "radio local" puede ser una cadena nacional con locutores grabados.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎙️</span>
            <p>En el podcast, distingue entre periodismo (verificado, con fuentes, responsable) y opinión o entretenimiento. La ausencia de filtros editoriales es la fortaleza del podcast — y también su riesgo. El "true crime" puede ser periodismo riguroso o explotar tragedias reales sin rigor ni cuidado.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🤖</span>
            <p>Con la llegada de la IA, verifica la fuente del audio que escuchas. Los deepfakes de voz son ya indistinguibles para el oído humano. Cuando un "político" diga algo sorprendente en audio, busca la fuente original antes de compartirlo. La desinformación auditiva será el próximo campo de batalla.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>La radio de servicio público (BBC, Radio Nacional de España, France Inter, Deutsche Welle) sigue siendo uno de los sistemas de información más fiables del mundo. Su financiación pública les permite cubrir noticias que no tienen valor comercial. Es un bien común que merece respaldo activo.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Los datos de audiencia y fechas históricas provienen de registros de la industria (EBU, Nielsen, Kantar). Las cifras de oyentes históricas son estimaciones basadas en fuentes de la época.</strong>
          <ul>
            <li>Las fechas de "primera emisora comercial" varían según la fuente: KDKA Pittsburgh (2/11/1920) es el consenso más aceptado, pero hay disputas con emisoras europeas de los años anteriores que operaban de forma irregular.</li>
            <li>Las cifras de audiencia de la era analógica (antes de los 80) son estimaciones basadas en ventas de receptores, encuestas y datos de los propios radiodifusores, no mediciones directas de consumo.</li>
            <li>El impacto real de La guerra de los mundos (1938) ha sido debatido por historiadores: los estudios modernos sugieren que el pánico fue más limitado de lo que la prensa de la época reportó, aunque sí causó confusión y alarma real en algunas zonas.</li>
            <li>Los datos del mercado de podcast (ingresos por publicidad, contratos exclusivos) son cifras reportadas por las propias plataformas y analistas del sector, con variaciones significativas entre fuentes.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-radio')} />
      <ShareCard appName="visualizador-historia-radio" />
      <Footer appName="visualizador-historia-radio" />
    </div>
  );
}
