'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaTelevision.module.css';
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

type Categoria =
  | 'experimental'
  | 'publica'
  | 'color'
  | 'privada_cable'
  | 'espana'
  | 'digital'
  | 'streaming'
  | 'series_oro'
  | 'plataformas'
  | 'ia';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoTelevision {
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

const PERIODOS: PeriodoTelevision[] = [
  {
    id: 'baird_farnsworth',
    nombre: 'Primeras Imágenes: Baird y Farnsworth',
    anioInicio: 1926,
    anioFin: 1936,
    categoria: 'experimental',
    formato: 'Sistema mecánico y electrónico',
    inventores: ['John Logie Baird', 'Philo Farnsworth', 'Vladimir Zworykin'],
    hitos: [
      'Primera demostración pública de Baird (1926)',
      'Farnsworth demuestra TV totalmente electrónica (1927)',
      'Zworykin e iconoscopio de RCA',
      'BBC inicia emisiones regulares (1936)',
      'Primeras Olimpiadas televisadas: Berlín 1936',
    ],
    obra: 'La primera demostración pública de televisión de John Logie Baird en el Royal Institution de Londres (26/01/1926) — imágenes de 30 líneas',
    pregunta: '¿Por qué el escocés Baird y el americano Farnsworth lucharon simultáneamente por la misma invención y quién ganó realmente?',
    contexto: 'John Logie Baird demostró la primera TV mecánica el 26 de enero de 1926 en Londres usando un disco de Nipkow. Philo Farnsworth (19 años) presentó en 1927 la primera TV totalmente electrónica. Zworykin y RCA perfeccionaron el iconoscopio. La BBC inició emisiones regulares en 1936. Las Olimpiadas de Berlín de 1936 se retransmitieron a televisores públicos en Berlín: primera gran cobertura televisiva.',
    color: '#8B4513',
  },
  {
    id: 'tv_publica',
    nombre: 'Televisión Pública y Posguerra',
    anioInicio: 1946,
    anioFin: 1956,
    categoria: 'publica',
    formato: 'Blanco y negro público',
    inventores: ['BBC', 'CBS', 'NBC', 'RCA'],
    hitos: [
      'BBC reanuda emisiones tras WWII (1946)',
      'Primer debate político televisado (1948)',
      'NBC en color experimental (1954)',
      'Coronación de Isabel II — primer evento televisivo masivo (1953)',
      '10 millones de televisores en EE.UU. (1950)',
    ],
    obra: 'La coronación de Isabel II (2 de junio de 1953) — 20 millones de espectadores en UK, aceleró la compra de televisores en masa',
    pregunta: '¿Cómo la coronación de Isabel II convirtió el televisor de lujo en electrodoméstico de masas?',
    contexto: 'Tras la WWII, la BBC reanudó emisiones en 1946. El número de televisores en EE.UU. pasó de 8.000 en 1946 a 10 millones en 1950. La coronación de Isabel II (1953) fue el primer acontecimiento que hizo comprar televisores masivamente: los vecinos se agolpaban en casa del que tenía uno. CBS y NBC competían: NBC ya emitía en color experimental. El debate Nixon-Kennedy de 1960 demostraría el poder político de la TV.',
    color: '#4A4A4A',
  },
  {
    id: 'television_espana',
    nombre: 'TVE y la Televisión en España Franquista',
    anioInicio: 1956,
    anioFin: 1975,
    categoria: 'espana',
    formato: 'TV pública monopolio',
    inventores: ['TVE (1956)', 'Jesús Hermida', 'Chicho Ibáñez Serrador'],
    hitos: [
      'TVE comienza emisiones (28/10/1956)',
      'UHF — segundo canal TVE (1966)',
      'Estudio 1 — teatro televisado de calidad',
      'El Semanal — noticias bajo censura',
      'Eurovisión 1969 — España en primer plano',
    ],
    obra: 'TVE inicia sus emisiones el 28 de octubre de 1956 desde el Paseo de La Habana, Madrid — primer canal de televisión español',
    pregunta: '¿Cómo usó el franquismo la televisión para modernizar la imagen del régimen mientras mantenía la censura?',
    contexto: 'TVE comenzó emisiones el 28 de octubre de 1956. El régimen franquista vio en la TV una herramienta de modernización: Plan de Estabilización (1959) y el "desarrollismo" coincidieron con la extensión del televisor. Chicho Ibáñez Serrador creó programas de éxito masivo. El Telediario informaba bajo censura estricta. Eurovisión 1969 fue un escaparate internacional. El televisor en blanco y negro llegó a millones de hogares españoles en los 60.',
    color: '#8B0000',
  },
  {
    id: 'television_color',
    nombre: 'La Televisión en Color Conquista el Mundo',
    anioInicio: 1962,
    anioFin: 1975,
    categoria: 'color',
    formato: 'NTSC/PAL color',
    inventores: ['RCA (NTSC)', 'Walter Bruch (PAL)', 'Henri de France (SECAM)'],
    hitos: [
      'NTSC color en EE.UU. (1954)',
      'Sistema PAL europeo (1967)',
      'Luna en color: Apollo 11 (1969)',
      'TVE-2 en color (1976)',
      'Guerras de estándares NTSC vs PAL vs SECAM',
    ],
    obra: 'La llegada del hombre a la Luna (20/07/1969) — 600 millones de espectadores en todo el mundo, la mayor audiencia televisiva de la historia hasta entonces',
    pregunta: '¿Por qué el mundo tardó 15 años en adoptar el color cuando la tecnología ya existía desde los años 40?',
    contexto: 'La TV en color NTSC llegó a EE.UU. en 1954 pero fue ignorada por cara. La Luna en color (1969) convenció al mundo. Europa adoptó PAL (1967) y SECAM (Francia): la "guerra de los estándares" dividió el continente. TVE comenzó a emitir en color en 1976. El precio de los televisores en color cayó un 60% entre 1975 y 1980. España tardó más que Europa occidental por el modelo de industrialización tardía.',
    color: '#FFD700',
  },
  {
    id: 'tv_privada_cable',
    nombre: 'TV Privada, Cable y Satélite',
    anioInicio: 1975,
    anioFin: 1995,
    categoria: 'privada_cable',
    formato: 'Cable y satélite privado',
    inventores: ['Ted Turner (CNN)', 'Rupert Murdoch (Fox)', 'MTV'],
    hitos: [
      'CNN — primer canal de noticias 24h (1980)',
      'MTV — vídeo musical (1981)',
      'Fox Network (1986)',
      'Sky Television (1989)',
      'TV por cable llega al 60% de hogares americanos (1990)',
    ],
    obra: 'CNN de Ted Turner (1/6/1980) — primer canal de noticias 24 horas, redefinió el periodismo televisivo mundial',
    pregunta: '¿Cómo CNN y la guerra del Golfo (1991) inventaron el periodismo televisivo en tiempo real?',
    contexto: 'Ted Turner lanzó CNN en 1980 apostando por noticias 24 horas cuando todos decían que nadie vería noticias continuas. La Guerra del Golfo (1991) le dio la razón: el mundo entero siguió los bombardeos en directo. MTV (1981) cambió la industria musical al convertir el videoclip en el nuevo sello. Fox de Murdoch compitió directamente con las tres grandes redes. El cable llegó a más del 60% de hogares americanos en 1990.',
    color: '#FF4500',
  },
  {
    id: 'television_espana_democracia',
    nombre: 'TV Privada en España Democrática',
    anioInicio: 1983,
    anioFin: 2000,
    categoria: 'espana',
    formato: 'TV privada generalista',
    inventores: ['Antena 3', 'Telecinco', 'Canal+', 'Autonómicas'],
    hitos: [
      'Canal 33 — primera TV autonómica (1983)',
      'Ley de TV Privada (1988)',
      'Antena 3 y Telecinco (1990)',
      'Canal+ de pago (1990)',
      'La 2 se reinventa como canal cultural',
    ],
    obra: 'La apertura de Antena 3 y Telecinco en 1990 — fin del monopolio televisivo español de 34 años',
    pregunta: '¿Qué cambió en la televisión española cuando en 1990 llegaron las privadas y el público tuvo elección por primera vez?',
    contexto: 'Las televisiones autonómicas (TV3, ETB, TVG, Canal 9) rompieron primero el monopolio de TVE. La Ley de TV Privada de 1988 concedió licencias a Antena 3, Telecinco y Canal+. En enero de 1990, las tres arrancaron. La audiencia de TVE cayó del 90% al 35% en una década. Canal+ trajo el cine de estreno y el fútbol de pago. La guerra de audiencias triplicó los ingresos publicitarios del sector.',
    color: '#2E86AB',
  },
  {
    id: 'tv_digital_tdt',
    nombre: 'TDT y la Transición Digital',
    anioInicio: 1998,
    anioFin: 2012,
    categoria: 'digital',
    formato: 'TDT y alta definición',
    inventores: ['HDTV consortium', 'DVB-T estándar europeo'],
    hitos: [
      'HDTV lanzamiento en EE.UU. (1998)',
      'DVB-T estándar europeo de TDT',
      'Apagón analógico España (3/04/2010)',
      'TDT HD llega a hogares españoles',
      'Multiplicación de canales: La Sexta, Cuatro, Energy, Neox',
    ],
    obra: 'El apagón analógico español (3 de abril de 2010) — toda España pasó a TDT en una sola noche, con la señal analógica apagada oficialmente',
    pregunta: '¿Por qué la TDT llegó con 10 años de retraso en España y qué cambió realmente para los espectadores?',
    contexto: 'EE.UU. apagó la señal analógica en 2009; España en abril de 2010. La TDT multiplicó los canales: de 5 a 25 canales gratuitos. Nacieron La Sexta (2006), Cuatro (2005), Energy, Neox, Nova. La HDTV llegó progresivamente. Pero la TDT fragmentó la audiencia sin mejorar el contenido: más canales con menos presupuesto cada uno. El apagón analógico eliminó millones de televisores obsoletos.',
    color: '#1E90FF',
  },
  {
    id: 'internet_tv',
    nombre: 'Internet y la Primera Crisis Televisiva',
    anioInicio: 2005,
    anioFin: 2013,
    categoria: 'streaming',
    formato: 'Vídeo online y piratería',
    inventores: ['YouTube (2005)', 'Hulu', 'TV en diferido'],
    hitos: [
      'YouTube fundado (2005)',
      'Google compra YouTube por 1.650M$ (2006)',
      'Hulu — plataforma de cadenas (2007)',
      'El iPlayer de BBC (2007)',
      'Series descargadas por P2P — Seinfeld, Lost, 24',
    ],
    obra: 'YouTube (2005) — del "Yo en el zoo" de Jawed Karim a la plataforma con 500 horas de vídeo subidas por minuto',
    pregunta: '¿Cómo respondieron las televisiones tradicionales al desafío de YouTube y el vídeo online entre 2005 y 2013?',
    contexto: 'YouTube nació en 2005 y fue comprado por Google en 2006 por 1.650 millones. Las series americanas se descargaban masivamente por BitTorrent. Hulu (2007) fue la respuesta conjunta de Fox, NBC y ABC: un Netflix antes de Netflix. La BBC lanzó iPlayer (2007) para ver en diferido. Las cadenas aprendieron que el espectador quería ver CUÁNDO quería, no cuándo decidían ellas. El "time-shifting" con TiVo y grabadores digitales cambió para siempre el consumo.',
    color: '#FF0000',
  },
  {
    id: 'netflix_streaming',
    nombre: 'Netflix y la Revolución del Streaming',
    anioInicio: 2007,
    anioFin: 2016,
    categoria: 'streaming',
    formato: 'Streaming bajo demanda (SVOD)',
    inventores: ['Reed Hastings (Netflix)', 'Ted Sarandos', 'Amazon Prime Video'],
    hitos: [
      'Netflix lanza streaming (2007)',
      'House of Cards — primera serie propia (2013)',
      'Netflix llega a España (2015)',
      'Amazon Prime Video (2011)',
      'Stranger Things (2016) — fenómeno cultural',
    ],
    obra: 'House of Cards (Netflix, 1/2/2013) — los 13 episodios de una sola temporada publicados simultáneamente: nació el binge-watching',
    pregunta: '¿Por qué Netflix decidió publicar una temporada entera de una vez y qué consecuencias tuvo para la cultura televisiva?',
    contexto: 'Netflix comenzó como alquiler de DVDs por correo (1997). En 2007 lanzó streaming. En 2013, House of Cards fue la primera apuesta por contenido propio de calidad cinematográfica: Kevin Spacey, David Fincher, 100 millones de presupuesto. La decisión de publicar 13 episodios el mismo día inventó el binge-watching y el "¿ya lo has visto?". Llegó a España en octubre de 2015. En 2016 ya estaba en 190 países.',
    color: '#E50914',
  },
  {
    id: 'edad_oro_series',
    nombre: 'La Edad de Oro de las Series',
    anioInicio: 2010,
    anioFin: 2020,
    categoria: 'series_oro',
    formato: 'Series cinematográficas premium',
    inventores: ['Vince Gilligan (Breaking Bad)', 'David Benioff (GOT)', 'Alex Pina (La Casa de Papel)'],
    hitos: [
      'Breaking Bad (AMC, 2008-2013)',
      'Game of Thrones (HBO, 2011-2019)',
      'La Casa de Papel (Netflix desde 2017)',
      'Chernobyl (HBO, 2019)',
      'Squid Game (Netflix, 2021)',
    ],
    obra: 'Breaking Bad — elegida la mejor serie de la historia por Metacritic y Time: 5 temporadas, 62 episodios, el viaje de Walter White',
    pregunta: '¿Cómo España consiguió producir La Casa de Papel, la primera serie no anglófona en ser número 1 mundial en Netflix?',
    contexto: 'La "Peak TV" (término de FX Networks) describe la explosión de calidad: más de 500 series originales producidas anualmente en EE.UU. desde 2015. Breaking Bad, The Wire, Game of Thrones y Mad Men fueron reconocidas como equivalentes a la gran literatura. La Casa de Papel de Álex Pina fue rechazada por varias cadenas españolas antes de que Netflix la comprara y relanzara globalmente en 2017. Squid Game (Corea, 2021) demostró que la ficción no anglófona podía dominar el mundo.',
    color: '#8B0000',
  },
  {
    id: 'guerra_plataformas',
    nombre: 'La Guerra de las Plataformas',
    anioInicio: 2019,
    anioFin: 2023,
    categoria: 'plataformas',
    formato: 'SVOD múltiple y fatiga de plataformas',
    inventores: ['Disney+', 'HBO Max', 'Apple TV+', 'Paramount+'],
    hitos: [
      'Disney+ lanzamiento (2019)',
      'Warner lanza HBO Max (2020)',
      'Apple TV+ con Ted Lasso y Severance',
      'Paramount+, Peacock, Discovery+',
      'Agotamiento del espectador: ¿cuántas plataformas son demasiadas?',
    ],
    obra: 'Disney+ (12/11/2019) — 10 millones de suscriptores en el primer día: la mayor apuesta de Disney fuera de sus parques',
    pregunta: '¿Puede el espectador permitirse 5 suscripciones de streaming a la vez o el mercado volverá a consolidarse?',
    contexto: 'El lanzamiento de Disney+ en noviembre de 2019 marcó el inicio de la guerra total: el catálogo de Disney, Marvel, Star Wars y Pixar en un solo servicio. HBO Max, Apple TV+, Paramount+ y Peacock fragmentaron aún más el mercado. En 2022, Netflix perdió suscriptores por primera vez en su historia. El espectador tiene fatiga de plataformas y password-sharing. La industria anticipa consolidación: adquisiciones, fusiones y el regreso parcial del modelo lineal.',
    color: '#000080',
  },
  {
    id: 'tv_libre_y_social',
    nombre: 'Televisión Social y Directo',
    anioInicio: 2020,
    anioFin: 2025,
    categoria: 'plataformas',
    formato: 'Live streaming y TV social',
    inventores: ['Twitch', 'TikTok Live', 'YouTube Live'],
    hitos: [
      'Twitch — 140M usuarios en 2021',
      'TikTok Live supera a YouTube en tiempo visto',
      'TV tradicional pierde jóvenes menores de 35',
      'Eurodivisión — Twitter como segunda pantalla',
      'El fútbol como último bastión del directo',
    ],
    obra: 'Twitch (2011, comprado por Amazon en 2014 por 970M$) — convirtió los videojuegos en el nuevo entretenimiento televisivo para menores de 30',
    pregunta: '¿Por qué los menores de 35 años casi no ven televisión lineal y qué consecuencias tiene para la industria?',
    contexto: 'Los menores de 35 ven un 70% menos de TV lineal que en 2010. Twitch, TikTok Live y YouTube Live son su "televisión". Solo el fútbol y los grandes eventos en directo retienen audiencia joven. El modelo publicitario de la TV generalista se desmorona con la fuga de los jóvenes. Las cadenas intentan ser relevantes en redes sociales. La "segunda pantalla" (el móvil mientras ves la TV) cambia cómo se produce contenido: más emocional, más comentable.',
    color: '#9146FF',
  },
  {
    id: 'ia_television',
    nombre: 'IA en Televisión y Producción',
    anioInicio: 2022,
    anioFin: 2030,
    categoria: 'ia',
    formato: 'IA generativa aplicada a TV',
    inventores: ['OpenAI Sora', 'Adobe Premiere con IA', 'Runway ML'],
    hitos: [
      'Sora — generación de vídeo con IA (2024)',
      'IA para subtitulado y traducción automática',
      'Huelga de guionistas de Hollywood por la IA (2023)',
      'Edición automática con IA',
      'Actores digitales y deepfakes',
    ],
    obra: 'Sora de OpenAI (2024) — genera vídeo hiperrealista de 1 minuto a partir de texto: el inicio del fin de la producción televisiva tradicional',
    pregunta: '¿Sustituirá la IA a guionistas, actores y directores, o solo cambiará las herramientas que usan los creativos?',
    contexto: 'La huelga de guionistas y actores de Hollywood (2023) tuvo la IA como causa principal: los estudios querían usar IA para escribir guiones y generar réplicas digitales de actores. SAG-AFTRA y WGA ganaron protecciones temporales. Sora de OpenAI (2024) generó vídeo cinematográfico a partir de texto. Runway ML permite edición con IA. El coste de producción de una serie podría caer un 90% con IA. La pregunta no es si la IA llegará, sino a qué ritmo y bajo qué regulación.',
    color: '#FF6B35',
  },
  {
    id: 'television_futuro',
    nombre: 'Televisión Interactiva y Personalizada',
    anioInicio: 2024,
    anioFin: 2035,
    categoria: 'ia',
    formato: 'TV interactiva e IA personalizada',
    inventores: ['Netflix con IA', 'Google TV', 'Apple Vision Pro'],
    hitos: [
      'Netflix — recomendaciones IA (80% del visionado)',
      'Apple Vision Pro — TV en realidad mixta',
      'Narrativas interactivas (Bandersnatch)',
      'Personalización total del feed televisivo',
      'TV generativa: episodios únicos para cada espectador',
    ],
    obra: 'Black Mirror: Bandersnatch (Netflix, 2018) — primer gran experimento de narrativa televisiva interactiva donde el espectador elige el desenlace',
    pregunta: '¿Llegaremos a ver series generadas por IA en tiempo real, adaptadas a los gustos exactos de cada espectador?',
    contexto: 'El 80% de lo que ve un usuario de Netflix lo recomienda el algoritmo de IA. Apple Vision Pro (2024) introdujo la TV en realidad mixta: pantallas virtuales de 30 metros en tu salón. Bandersnatch (2018) fue el primer experimento mainstream de narrativa interactiva. Los investigadores trabajan en series generadas en tiempo real por IA, adaptadas al estado emocional del espectador. La televisión del futuro podría ser completamente personalizada: nunca dos personas verían el mismo episodio.',
    color: '#7B2FBE',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1926, evento: 'John Logie Baird demuestra la primera televisión mecánica ante público en el Royal Institution de Londres' },
  { anio: 1936, evento: 'BBC inicia emisiones regulares de televisión; Olimpiadas de Berlín 1936 se retransmiten por TV' },
  { anio: 1953, evento: 'Coronación de Isabel II — 20 millones de espectadores: el televisor se convierte en electrodoméstico de masas' },
  { anio: 1956, evento: 'TVE inicia emisiones desde el Paseo de La Habana, Madrid — primer canal de televisión español' },
  { anio: 1969, evento: 'Apollo 11: 600 millones ven la llegada del hombre a la Luna en directo — mayor audiencia televisiva hasta entonces' },
  { anio: 1980, evento: 'Ted Turner lanza CNN — el primer canal de noticias 24 horas del mundo' },
  { anio: 1990, evento: 'Antena 3 y Telecinco arrancan en España — fin del monopolio de TVE tras 34 años' },
  { anio: 2010, evento: 'Apagón analógico en España (3 de abril) — toda la señal de TV pasa a TDT en una sola noche' },
  { anio: 2013, evento: 'Netflix publica House of Cards completo en un día: nace el binge-watching como fenómeno cultural' },
  { anio: 2019, evento: 'Disney+ lanza en EE.UU. con 10M suscriptores en el primer día — comienza la guerra de plataformas' },
  { anio: 2023, evento: 'Huelga de guionistas y actores de Hollywood contra la IA: SAG-AFTRA y WGA paran la industria' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  experimental: 'Experimental',
  publica: 'TV Pública',
  color: 'Color',
  privada_cable: 'Cable/Satélite',
  espana: 'España',
  digital: 'Digital/TDT',
  streaming: 'Streaming',
  series_oro: 'Edad de Oro',
  plataformas: 'Plataformas',
  ia: 'IA',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  experimental: '#8B4513',
  publica: '#4A4A4A',
  color: '#B8860B',
  privada_cable: '#FF4500',
  espana: '#8B0000',
  digital: '#1E90FF',
  streaming: '#E50914',
  series_oro: '#C0392B',
  plataformas: '#000080',
  ia: '#7B2FBE',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoTelevision }) {
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {periodo.anioFin}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
          <ul className={styles.caracteristicasList}>
            {periodo.hitos.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Protagonistas</h4>
          <ul className={styles.artistasList}>
            {periodo.inventores.map((inv) => (
              <li key={inv}>{inv}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Hito icónico</span>
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

const AÑO_MIN = 1926;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoTelevision | null>(null);

  const filas: PeriodoTelevision[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      const anioFinUltimo = ultimoEnFila ? Math.min(ultimoEnFila.anioFin, AÑO_MAX) : 0;
      if (!ultimoEnFila || anioAX(anioFinUltimo) + 4 <= anioAX(per.anioInicio)) {
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

  const marcadores: number[] = [1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 1926 hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la televisión"
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
              <h4 className={styles.detalleSubtitulo}>Hitos principales</h4>
              <ul className={styles.caracteristicasList}>
                {periodo.hitos.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Protagonistas clave</h4>
              <ul className={styles.artistasList}>
                {periodo.inventores.map((inv) => <li key={inv}>{inv}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Hito icónico</span>
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
        per.inventores.some((inv) => inv.toLowerCase().includes(termino));
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
        placeholder="Buscar por período o protagonista..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período televisivo"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Protagonista clave</th>
              <th>Formato</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => (
              <tr
                key={per.id}
                style={i % 2 === 0 ? { background: `${per.color}18` } : {}}
              >
                <td><strong style={{ color: per.color }}>{per.nombre}</strong></td>
                <td>{per.anioInicio}–{per.anioFin}</td>
                <td>
                  <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                    {ETIQUETAS_CATEGORIA[per.categoria]}
                  </span>
                </td>
                <td>{per.inventores[0]}</td>
                <td className={styles.formatoCell}>{per.formato}</td>
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
  {
    nombre: 'Inventores y Pioneros',
    desde: 1926,
    hasta: 1950,
    icono: '📺',
    descripcion: 'Baird, Farnsworth y Zworykin crean la televisión; la BBC y la coronación de Isabel II la hacen masiva',
  },
  {
    nombre: 'Blanco y Negro y TVE',
    desde: 1950,
    hasta: 1970,
    icono: '📡',
    descripcion: 'La TV llega a los hogares españoles bajo Franco; la Luna en color conquista el mundo',
  },
  {
    nombre: 'Color, Cable y MTV',
    desde: 1970,
    hasta: 1995,
    icono: '🎨',
    descripcion: 'CNN inventa las noticias 24h; MTV revoluciona la música; las privadas rompen el monopolio de TVE',
  },
  {
    nombre: 'Digital y Streaming',
    desde: 1995,
    hasta: 2013,
    icono: '💿',
    descripcion: 'YouTube, TDT y el apagón analógico; Netflix inventa el binge-watching con House of Cards',
  },
  {
    nombre: 'Edad de Oro de las Series',
    desde: 2013,
    hasta: 2020,
    icono: '🏆',
    descripcion: 'Breaking Bad, GOT y La Casa de Papel convierten la TV en la nueva literatura popular',
  },
  {
    nombre: 'Guerra de Plataformas e IA',
    desde: 2020,
    hasta: 2035,
    icono: '🤖',
    descripcion: 'Disney+, Twitch, huelga de Hollywood y Sora definen el futuro incierto de la televisión',
  },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos televisivos y eventos históricos organizados por eras.
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
                    {era.desde} – {era.hasta === 2035 ? 'hoy' : era.hasta}
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

export default function VisualizadorHistoriaTelevision() {
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
        <h1 className={styles.heroTitle}>Historia de la Televisión</h1>
        <p className={styles.heroSubtitle}>
          De Baird y Farnsworth a Netflix, Breaking Bad y la IA generativa — 14 períodos con TVE, TV privada, TDT y el futuro del streaming
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
        title="Guía completa sobre la historia de la televisión"
        subtitle="Cómo la televisión transformó la sociedad y sigue reinventándose en la era digital"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 5 eras clave de la historia de la televisión</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Modelo negocio</th>
                <th>Hito clave</th>
                <th>Impacto en España</th>
                <th>Reto pendiente</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>TV Pública</strong></td>
                <td>Licencia + publicidad estatal</td>
                <td>Coronación Isabel II (1953)</td>
                <td>TVE monopolio 1956–1990</td>
                <td>Financiación sostenible sin publicidad</td>
              </tr>
              <tr>
                <td><strong>Cable y Satélite</strong></td>
                <td>Suscripción mensual</td>
                <td>CNN 24h (1980), MTV (1981)</td>
                <td>Canal+ llega en 1990</td>
                <td>Fragmentación de audiencias</td>
              </tr>
              <tr>
                <td><strong>TDT</strong></td>
                <td>Publicidad + canales gratuitos</td>
                <td>Apagón analógico (2010)</td>
                <td>25 canales gratuitos en España</td>
                <td>Contenido de calidad con bajo presupuesto</td>
              </tr>
              <tr>
                <td><strong>Streaming</strong></td>
                <td>SVOD (suscripción mensual)</td>
                <td>House of Cards — binge-watching (2013)</td>
                <td>Netflix llega a España en 2015</td>
                <td>Fatiga de plataformas y password-sharing</td>
              </tr>
              <tr>
                <td><strong>IA y Personalización</strong></td>
                <td>Algoritmo + publicidad segmentada</td>
                <td>Sora genera vídeo desde texto (2024)</td>
                <td>Producción española amenazada por IA</td>
                <td>Regulación de derechos de actores y guionistas</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios futuros */}
        <h3>Cuatro escenarios para el futuro de la televisión</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📉</span>
            <div>
              <strong>Desaparición de la TV lineal</strong>
              <p>La televisión generalista pierde a los menores de 35. En 10 años, solo los mayores de 60 verán TV lineal. Las cadenas se reconvierten o desaparecen.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
            <div>
              <strong>IA genera series personalizadas</strong>
              <p>Netflix y otras plataformas generan episodios únicos adaptados al perfil de cada espectador. Los guionistas pasan a ser "directores de IA".</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔗</span>
            <div>
              <strong>Consolidación de plataformas</strong>
              <p>La fatiga de plataformas fuerza fusiones: Netflix + Apple TV+, Disney+ + Hulu. Quedará un oligopolio de 3-4 grandes plataformas globales.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📺</span>
            <div>
              <strong>Regreso de la TV pública de calidad</strong>
              <p>La BBC, RTVE y France Télévisions reinventan el modelo público con producción de prestigio, financiada por ciudadanos sin anuncios.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre historia de la televisión</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Quién inventó realmente la televisión: Baird o Farnsworth?</strong>
            <p>Depende de qué se entienda por "televisión". Baird demostró la primera TV mecánica (disco de Nipkow) en enero de 1926. Farnsworth presentó la primera TV totalmente electrónica en 1927. La televisión moderna deriva del sistema electrónico de Farnsworth y Zworykin, no del mecánico de Baird. Sin embargo, Baird fue el primero en hacer una demostración pública y comercializó televisores antes. Ambos inventaron cosas distintas con el mismo nombre.</p>
            <span className={styles.faqTip}>Paradoja: la RCA de Sarnoff usó el sistema de Zworykin (rival de Farnsworth) y pagó millones en royalties a Farnsworth pese a intentar negarle la patente.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué la coronación de Isabel II fue tan importante para la historia de la televisión?</strong>
            <p>El 2 de junio de 1953, más de 20 millones de personas vieron la coronación en televisión en el Reino Unido. Las ventas de televisores se dispararon antes y después del evento: los vecinos que no tenían televisor se reunían en casa del que lo tenía. Fue el primer acontecimiento que convirtió el televisor de artículo de lujo en electrodoméstico que "hay que tener". Sin la coronación, la expansión de la TV doméstica habría tardado más años.</p>
            <span className={styles.faqTip}>Dato: en 1950 había 300.000 televisores en UK. En 1955, dos años después de la coronación, ya había 4,5 millones.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué fue exactamente el binge-watching y por qué lo inventó Netflix?</strong>
            <p>El binge-watching (maratón de episodios) existía en pequeña escala con DVDs de series. Netflix lo convirtió en norma el 1 de febrero de 2013 al publicar los 13 episodios de House of Cards simultáneamente. La razón: Netflix no necesitaba anclar a sus suscriptores a una hora semanal (no tenía publicidad ni competencia horaria). Descubrió que los usuarios que hacían maratón tenían menor tasa de cancelación. El binge-watching era mejor negocio para Netflix que el modelo episodio-a-episodio.</p>
            <span className={styles.faqTip}>Efecto cultural: el "¿ya lo has visto?" sustituyó al "¿lo viste anoche?". Las conversaciones sobre series pasaron a ser atemporales.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo La Casa de Papel se convirtió en la primera serie no anglófona en ser número 1 mundial?</strong>
            <p>La Casa de Papel fue producida por Antena 3 en España (2017) como thriller de atracos con presupuesto modesto. Tras malas audiencias, Antena 3 la canceló. Netflix la compró, la redoblé con nuevo sonido y la relanzó globalmente en diciembre de 2017. El algoritmo de Netflix la detectó como hit potencial y la promocionó masivamente. En semanas era número 1 en 20 países. Demostró que el contenido local de calidad puede ser global si tiene la distribución correcta.</p>
            <span className={styles.faqTip}>Ironía: la serie que Antena 3 canceló por fracaso de audiencias fue vista por más de 100 millones de hogares en Netflix.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Sustituirá la IA a los guionistas y actores de televisión?</strong>
            <p>La huelga de Hollywood (2023) consiguió protecciones temporales: los estudios no pueden usar IA para sustituir guionistas ni crear réplicas digitales de actores sin consentimiento. Pero la tecnología avanza más rápido que la regulación. Sora de OpenAI (2024) ya genera vídeo cinematográfico a partir de texto. En la próxima década, la IA cambiará radicalmente la producción de TV: los guionistas usarán IA como herramienta, no serán sustituidos del todo. Los géneros más afectados serán los de bajo presupuesto y formato repetitivo.</p>
            <span className={styles.faqTip}>Perspectiva histórica: el video no mató a la radio, el streaming no mató al cine. La IA no matará la narrativa humana, pero cambiará quién puede crearla.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Guía en 5 pasos para entender el ecosistema audiovisual actual</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Entiende la diferencia entre TV lineal y bajo demanda</strong>
              <p>La TV lineal emite en tiempo real: todos ven lo mismo a la misma hora (el telediario, el partido). La TV bajo demanda (streaming) permite ver cualquier contenido cuando quieras. Esta distinción es la más importante para entender el conflicto actual: los jóvenes ya no toleran el horario impuesto, los mayores no entienden por qué no hay "parrilla".</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Comprende los modelos de negocio y cómo afectan al contenido</strong>
              <p>La TV pública (licencia) tiende a contenido de servicio público. La TV comercial (publicidad) busca audiencia máxima en horario de máxima audiencia. El streaming SVOD (suscripción) puede arriesgar con nichos porque cobra por cabeza, no por anuncio. El modelo de negocio determina qué se produce y cómo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Identifica qué plataformas existen y cuál es tu perfil</strong>
              <p>Netflix (series internacionales), Disney+ (franquicias, familias), HBO Max (cine de autor y dramas premium), Movistar+ (deporte y producción española), Amazon Prime (mezcla), Apple TV+ (pocas series de mucha calidad). Ninguna plataforma lo tiene todo. La elección depende de qué tipo de contenido consumes más.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Conecta el contenido con el contexto social y político que lo produjo</strong>
              <p>Breaking Bad (2008) nació en la crisis económica americana: el hombre de clase media que cruza líneas morales por desesperación. El Cuento de la Criada (2017) surgió en el contexto Trump. Chernobyl (2019) fue una reflexión sobre el coste de las mentiras institucionales. La mejor televisión siempre dialoga con su momento histórico.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Sigue la producción española con perspectiva global</strong>
              <p>España es hoy uno de los países con mayor producción televisiva de calidad en Europa: La Casa de Papel, El Cid, Élite, Intimidad, Antidisturbios, 30 monedas. El ecosistema de producción audiovisual español, combinado con la distribución global de plataformas, es una oportunidad histórica. Seguir el sector te permite entender cómo funciona la industria desde dentro.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>4 consejos para navegar el mundo de las plataformas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <p>Rota las suscripciones en lugar de pagar todas a la vez. Suscríbete a Netflix, termina lo que quieres ver, cancela y pásate a Disney+ o HBO Max. Ahorras y evitas la fatiga de plataformas. La mayoría permiten cancelar sin penalización.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <p>Usa webs como JustWatch para saber en qué plataforma está cada serie o película sin tener que buscar una a una. Te ayuda a decidir qué suscripción activa conviene en cada momento según tus títulos pendientes.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📡</span>
            <p>No olvides la TV pública gratuita: RTVE Play tiene un catálogo creciente sin suscripción. La Filmoteca de Andalucía, Filmin y Mubi ofrecen cine de autor con precios moderados. No todo lo bueno está en las grandes plataformas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <p>El fútbol y los grandes eventos en directo siguen siendo el bastión de la TV lineal. Si te importa el deporte de alta competición, la suscripción a Movistar+ o DAZN sigue siendo inevitable. Es el único contenido que la TV tradicional conserva en exclusiva.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Sobre los datos de este visualizador</strong>
          <ul>
            <li>Los datos de audiencia y suscriptores provienen de informes públicos de Nielsen, Kantar, y las propias plataformas. Las proyecciones futuras son análisis de la industria sujetos a cambios.</li>
            <li>Las fechas de períodos son orientativas: los movimientos televisivos se solapan y no tienen fronteras exactas. Un período "empieza" cuando se convierte en dominante, no cuando aparece la primera señal.</li>
            <li>Los datos de TVE y televisión española están verificados con fuentes del Archivo RTVE, la Academia de Televisión y estudios de historia de los medios de comunicación en España.</li>
            <li>La sección "Televisión Interactiva y Personalizada" (2024-2035) incluye proyecciones especulativas basadas en tendencias actuales — no son hechos confirmados sino escenarios posibles.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-television')} />
      <ShareCard appName="visualizador-historia-television" />
      <Footer appName="visualizador-historia-television" />
    </div>
  );
}
