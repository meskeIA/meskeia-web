'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaVideojuegos.module.css';
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

type Categoria = 'arcade' | 'consolas' | 'pc' | 'online' | 'movil' | 'ia';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoVideojuegos {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  estudios: string[];
  caracteristicas: string[];
  juego: string;
  preguntaCentral: string;
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

const PERIODOS: PeriodoVideojuegos[] = [
  {
    id: 'proto_videojuegos',
    nombre: 'Proto-videojuegos y Pong',
    anioInicio: 1958,
    anioFin: 1977,
    categoria: 'arcade',
    estudios: ['Atari', 'Magnavox', 'MIT'],
    caracteristicas: [
      'Tennis for Two (1958) — primer juego electrónico interactivo',
      'Spacewar! (1962) — primer juego en PC',
      'Pong (1972) — primer videojuego comercial de éxito',
      'Atari 2600 — primera consola doméstica de éxito',
      'Nacimiento de la industria del entretenimiento electrónico',
    ],
    juego: 'Pong — Atari (1972) — la pelota y la raqueta que fundaron una industria de 200.000 millones de dólares',
    preguntaCentral: '¿Puede una pantalla y un joystick convertirse en entretenimiento de masas?',
    contexto:
      'William Higinbotham creó Tennis for Two en 1958 como demostración científica, no como entretenimiento. Spacewar! (1962) fue el primer juego con mecánicas complejas. Pong (1972) de Atari fue el primer videojuego en conquistar los bares y hogares. El Atari 2600 llevó los videojuegos al salón familiar.',
    color: '#8B4513',
  },
  {
    id: 'edad_oro_arcade',
    nombre: 'Edad de Oro de los Arcades',
    anioInicio: 1978,
    anioFin: 1984,
    categoria: 'arcade',
    estudios: ['Namco', 'Midway', 'Nintendo', 'Taito'],
    caracteristicas: [
      'Space Invaders — primer juego con marcador de puntuación',
      'Pac-Man — icono cultural global',
      'Donkey Kong — primer juego de plataformas y origen de Mario',
      'Galaga, Centipede, Asteroids',
      'Sala de arcade como espacio social adolescente',
    ],
    juego: 'Pac-Man — Namco (1980) — el personaje de videojuego más reconocido del mundo, 14.000 millones de USD en ingresos acumulados',
    preguntaCentral: '¿Pueden los videojuegos crear iconos culturales comparables al cine o los cómics?',
    contexto:
      'Space Invaders (1978) provocó una escasez de monedas de 100 yenes en Japón — la primera crisis por un videojuego. Pac-Man (1980) fue el primer personaje de videojuego en aparecer en mercancía masiva. Donkey Kong (1981) fue la debut de Mario — el personaje de ficción más reconocible del mundo.',
    color: '#FFD700',
  },
  {
    id: 'consolas_8bit',
    nombre: 'Revolución de las Consolas Domésticas — 8 bits',
    anioInicio: 1983,
    anioFin: 1991,
    categoria: 'consolas',
    estudios: ['Nintendo', 'Sega', 'Capcom', 'Konami'],
    caracteristicas: [
      'NES (1983) — resurrección de la industria tras el crash de 1983',
      'Super Mario Bros — el lenguaje del juego de plataformas',
      'The Legend of Zelda — mundo abierto y exploración',
      'Mega Drive vs NES — primera guerra de consolas',
      'Game Boy — consola portátil de éxito masivo',
    ],
    juego: 'Super Mario Bros — Nintendo (1985) — vendió 40 millones de copias, definió el género de plataformas durante décadas',
    preguntaCentral: '¿Pueden los videojuegos recuperarse de una crisis de confianza y convertirse en industria cultural madura?',
    contexto:
      'El crash de 1983 hundió la industria americana — Atari colapsó. Nintendo rescató el mercado con la NES y un sistema de licencias estricto. Super Mario Bros (1985) estableció el lenguaje del juego de plataformas. Zelda inventó el RPG de aventura. Game Boy (1989) demostró que los videojuegos portátiles tenían mercado masivo.',
    color: '#E50000',
  },
  {
    id: 'consolas_16bit',
    nombre: 'Era de 16 Bits — La Gran Guerra de Consolas',
    anioInicio: 1991,
    anioFin: 1996,
    categoria: 'consolas',
    estudios: ['Nintendo', 'Sega', 'Square', 'Rare'],
    caracteristicas: [
      'SNES vs Mega Drive — Nintendo vs Sega',
      'Sonic the Hedgehog — velocidad como mecánica',
      'Final Fantasy VI — narrativa épica en consola',
      'Street Fighter II — populariza los juegos de lucha',
      'Mortal Kombat y el debate sobre la violencia en videojuegos',
    ],
    juego: 'Street Fighter II — Capcom (1991) — definió los juegos de lucha, causó la primera gran polémica política sobre videojuegos',
    preguntaCentral: '¿Pueden los videojuegos contar historias tan complejas como las novelas o el cine?',
    contexto:
      'La guerra entre SNES y Mega Drive fue la primera gran rivalidad de marketing en videojuegos — y prefiguró todas las posteriores. Final Fantasy VI (1994) demostró que un videojuego podía tener narrativa operística. Mortal Kombat provocó la primera audiencia del Congreso de EE.UU. sobre violencia en videojuegos — y llevó a la creación del sistema ESRB.',
    color: '#0000CD',
  },
  {
    id: 'tres_d',
    nombre: 'Revolución 3D — PlayStation y N64',
    anioInicio: 1995,
    anioFin: 2001,
    categoria: 'consolas',
    estudios: ['Sony', 'Nintendo', 'Rare', 'Square', 'Namco'],
    caracteristicas: [
      'PlayStation — Sony entra al mercado de consolas',
      'Super Mario 64 — inventa el movimiento en 3D',
      'Zelda: Ocarina of Time — narrativa y exploración tridimensional',
      'Final Fantasy VII — cut scenes cinematográficas',
      'Crash Bandicoot, Tomb Raider, Metal Gear Solid',
    ],
    juego: 'The Legend of Zelda: Ocarina of Time — Nintendo (1998) — el juego mejor valorado de la historia según Metacritic',
    preguntaCentral: '¿Cómo trasladar el lenguaje 2D de los videojuegos al espacio tridimensional?',
    contexto:
      'Sony entró al mercado con PlayStation en 1994 dirigiéndose a adolescentes mayores y adultos — CDs en vez de cartuchos, marketing sofisticado. Mario 64 (1996) resolvió el problema del movimiento 3D con la cámara dinámica. Ocarina of Time (1998) todavía aparece en todas las listas de los mejores videojuegos de la historia.',
    color: '#696969',
  },
  {
    id: 'online_emergente',
    nombre: 'PC Gaming y Online Emergente',
    anioInicio: 1993,
    anioFin: 2004,
    categoria: 'pc',
    estudios: ['id Software', 'Blizzard', 'Valve', 'Westwood'],
    caracteristicas: [
      'Doom — FPS como género y cultura',
      'Quake — primer FPS multijugador online',
      'StarCraft — esports como competición organizada',
      'Counter-Strike — nacido como mod gratuito',
      'World of Warcraft — MMO de masas',
    ],
    juego: 'Doom — id Software (1993) — creó el género FPS, vendido como shareware, base de la cultura gaming moderna',
    preguntaCentral: '¿Pueden los videojuegos conectar a jugadores de todo el mundo en tiempo real?',
    contexto:
      'Doom (1993) inventó el FPS moderno y la distribución shareware. Quake (1996) añadió el multijugador online. Blizzard construyó el mayor juego en tiempo real de la historia con StarCraft (1998) — que en Corea se convirtió en deporte nacional. Counter-Strike nació como mod gratuito y se convirtió en el juego competitivo más longevo.',
    color: '#556B2F',
  },
  {
    id: 'setima_generacion',
    nombre: 'Séptima Generación — HD y Casual Gaming',
    anioInicio: 2004,
    anioFin: 2012,
    categoria: 'consolas',
    estudios: ['Nintendo', 'Naughty Dog', 'Rockstar', 'Valve'],
    caracteristicas: [
      'Wii — control por movimiento y audiencia casual',
      'GTA San Andreas/IV — mundo abierto maduro',
      'Guitar Hero y Rock Band — música interactiva',
      'Xbox 360 y PS3 — era HD',
      'Half-Life 2 y narrativa ambiental',
    ],
    juego: 'Grand Theft Auto IV — Rockstar (2008) — 600M$ en primer día, narrativa adulta en mundo abierto fotorrealista',
    preguntaCentral: '¿Pueden los videojuegos llegar a audiencias que nunca antes habían jugado?',
    contexto:
      'La Wii de Nintendo (2006) llevó los videojuegos a abuelos y familias con control por movimiento — 101 millones de unidades vendidas. Rockstar demostró con GTA que los mundos abiertos podían tener densidad narrativa y crítica social. Valve lanzó Steam (2003) — la plataforma que transformó la distribución de PC gaming.',
    color: '#4169E1',
  },
  {
    id: 'movil',
    nombre: 'Gaming Móvil y Casual',
    anioInicio: 2007,
    anioFin: 9999,
    categoria: 'movil',
    estudios: ['Rovio', 'King', 'Supercell', 'Niantic', 'miHoYo'],
    caracteristicas: [
      'App Store (2008) — distribución directa sin intermediarios',
      'Angry Birds — primer hit móvil global',
      'Candy Crush — casual gaming y microtransacciones',
      'Pokémon Go — realidad aumentada de masas',
      'Genshin Impact — AAA free-to-play para móvil',
    ],
    juego: 'Pokémon Go — Niantic (2016) — 1.000 millones de descargas, sacó a la gente a la calle con realidad aumentada',
    preguntaCentral: '¿Los móviles democratizan el juego o lo trivializan con microtransacciones?',
    contexto:
      'El iPhone (2007) y la App Store (2008) crearon una nueva industria de gaming. Angry Birds (2009) fue el primer fenómeno móvil global. Las microtransacciones generaron polémicas de adicción y gasto en menores. Pokémon Go (2016) llevó la realidad aumentada a las masas. Genshin Impact (2020) demostró que el free-to-play podía ser AAA.',
    color: '#32CD32',
  },
  {
    id: 'octava_generacion',
    nombre: 'Octava Generación — Indie y Open World',
    anioInicio: 2012,
    anioFin: 2020,
    categoria: 'consolas',
    estudios: ['CD Projekt Red', 'Mojang', 'FromSoftware', 'Naughty Dog'],
    caracteristicas: [
      'Minecraft — mundos generados proceduralmente',
      'Dark Souls — dificultad como diseño intencional',
      'The Last of Us — narrativa cinematográfica',
      'The Witcher 3 — RPG de mundo abierto con escritura adulta',
      'Indie renaissance — Steam Greenlight y plataformas indie',
    ],
    juego: 'The Witcher 3: Wild Hunt — CD Projekt Red (2015) — 700+ horas de contenido, considerado el mejor RPG de mundo abierto',
    preguntaCentral: '¿Pueden los videojuegos independientes y el mundo abierto redefinir el medio?',
    contexto:
      'Minecraft (2009-2011) demostró que los gráficos importaban menos que la creatividad — 238 millones de copias vendidas. Dark Souls (2011) redefinió la dificultad como mecánica narrativa. The Last of Us (2013) llevó la narrativa cinematográfica al límite. The Witcher 3 (2015) demostró que un RPG europeo podía superar a los americanos.',
    color: '#2E8B57',
  },
  {
    id: 'esports',
    nombre: 'Esports y Gaming Competitivo',
    anioInicio: 2010,
    anioFin: 9999,
    categoria: 'online',
    estudios: ['Riot Games', 'Valve', 'Blizzard', 'Epic Games'],
    caracteristicas: [
      'League of Legends — esport con estadios llenos',
      'Dota 2 — The International con 40M$ en premios',
      'Fortnite Battle Royale — fenómeno cultural global',
      'Overwatch League — liga esports con franquicias',
      'Streaming (Twitch, YouTube Gaming) como espectáculo',
    ],
    juego: 'League of Legends — Riot Games (2009) — 150 millones de cuentas registradas, finales del Mundial en estadios olímpicos',
    preguntaCentral: '¿Son los videojuegos competitivos un deporte legítimo?',
    contexto:
      'League of Legends (2009) convirtió el gaming competitivo en espectáculo de masas — las finales del Mundial llenan estadios olímpicos. Twitch (2011) creó la economía del streaming de videojuegos. Fortnite (2017) alcanzó 350 millones de cuentas y organizó conciertos de Travis Scott con 12 millones de espectadores simultáneos.',
    color: '#FFD700',
  },
  {
    id: 'novena_generacion',
    nombre: 'Novena Generación — PS5, Xbox Series y Ray Tracing',
    anioInicio: 2020,
    anioFin: 9999,
    categoria: 'consolas',
    estudios: ['FromSoftware', 'Insomniac', 'Santa Monica Studio', 'Nintendo'],
    caracteristicas: [
      'PS5 y Xbox Series X — ray tracing en tiempo real',
      'Elden Ring — mundo abierto con diseño FromSoftware',
      'God of War Ragnarök — narrativa nórdica madura',
      'The Legend of Zelda: Tears of the Kingdom',
      'Game Pass y PlayStation Now — suscripción gaming',
    ],
    juego: 'Elden Ring — FromSoftware/George R.R. Martin (2022) — GOTY más votado, 25 millones de copias, crítica unánime',
    preguntaCentral: '¿Qué queda por innovar cuando los gráficos ya son casi fotorrealistas?',
    contexto:
      'La novena generación llegó en plena pandemia (noviembre 2020) — PlayStation 5 agotada durante dos años. Elden Ring (2022) de FromSoftware y George R.R. Martin demostró que la dificultad extrema + mundo abierto + lore profundo era la fórmula perfecta. Game Pass de Microsoft y PlayStation Plus transformaron la distribución hacia la suscripción.',
    color: '#003791',
  },
  {
    id: 'realidad_virtual',
    nombre: 'Realidad Virtual y Realidad Aumentada',
    anioInicio: 2016,
    anioFin: 9999,
    categoria: 'ia',
    estudios: ['Oculus/Meta', 'Valve', 'Sony', 'Apple'],
    caracteristicas: [
      'Oculus Rift y HTC Vive — VR de consumo (2016)',
      'Half-Life: Alyx — AAA diseñado para VR',
      'Meta Quest — VR inalámbrica accesible',
      'Apple Vision Pro (2024) — computación espacial',
      'VR en medicina, arquitectura y educación',
    ],
    juego: 'Half-Life: Alyx — Valve (2020) — primer juego AAA diseñado exclusivamente para VR, demostración definitiva del potencial',
    preguntaCentral: '¿La realidad virtual es el futuro del juego o una tecnología de nicho?',
    contexto:
      'Oculus fue comprada por Facebook (Meta) en 2014 por 2.300M$. Half-Life: Alyx (2020) demostró que el AAA era posible en VR — pero el mercado sigue siendo nicho. Apple Vision Pro (2024) redefinió la computación espacial. La VR ya tiene aplicaciones serias en medicina, arquitectura y entrenamiento militar.',
    color: '#8B008B',
  },
  {
    id: 'ia_gaming',
    nombre: 'Inteligencia Artificial y Gaming',
    anioInicio: 2022,
    anioFin: 9999,
    categoria: 'ia',
    estudios: ['Nvidia', 'OpenAI', 'Google DeepMind', 'Microsoft'],
    caracteristicas: [
      'DLSS y ray tracing con IA',
      'NPCs con IA conversacional (Inworld)',
      'Generación procedural por IA (mundos infinitos)',
      'AlphaGo/AlphaStar — IA supera a humanos en StarCraft',
      'ChatGPT como guionista, diseñador, tester de juegos',
    ],
    juego: 'AlphaStar (DeepMind, 2019) — primera IA que derrota a jugadores profesionales de StarCraft II con 99,8% de win rate',
    preguntaCentral: '¿La IA cambiará quién crea los videojuegos o solo quién los puebla?',
    contexto:
      'AlphaStar de DeepMind (2019) derrotó a los mejores profesionales del mundo en StarCraft II — el primer juego de estrategia en tiempo real donde la IA supera a los humanos. NVIDIA DLSS usa IA para generar fotogramas. Inworld AI permite NPCs con conversación emergente. Las herramientas de IA generativa amenazan y empoderan a la vez a los desarrolladores indie.',
    color: '#00CED1',
  },
  {
    id: 'metaverso',
    nombre: 'Metaverso y Gaming del Futuro',
    anioInicio: 2021,
    anioFin: 9999,
    categoria: 'ia',
    estudios: ['Epic Games', 'Meta', 'Roblox Corporation', 'Mojang'],
    caracteristicas: [
      'Roblox — plataforma de creación y juego para niños',
      'Fortnite como metaverso cultural (conciertos)',
      'Unreal Engine 5 — fotorrealismo en tiempo real',
      'NFTs en videojuegos — éxito y fracaso',
      'Generación Z como primera generación nativa del metaverso',
    ],
    juego: 'Roblox — Roblox Corporation (2006/2020) — 70 millones de usuarios diarios, economía de creadores con 750M$ anuales pagados',
    preguntaCentral: '¿Los videojuegos se convertirán en el espacio social principal de las nuevas generaciones?',
    contexto:
      'Epic Games convirtió Fortnite en un metaverso cultural con conciertos de Travis Scott (12,3M espectadores) y Travis Barker. Roblox tiene 70M de usuarios diarios — la mayoría menores de 16 años — y paga 750M$ anuales a creadores. Unreal Engine 5 (2022) produce escenas fotorrealistas en tiempo real. Los NFTs en gaming llegaron y fracasaron.',
    color: '#FF8C00',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1972, evento: 'Pong (Atari) — primer videojuego comercial de éxito; nace la industria del entretenimiento electrónico' },
  { anio: 1983, evento: 'Crisis del videojuego (crash de Atari) — casi destruye la industria; Nintendo la resucita en 1985' },
  { anio: 1993, evento: 'Doom y Mortal Kombat provocan la primera audiencia del Congreso sobre violencia en videojuegos' },
  { anio: 1996, evento: 'Super Mario 64 — resuelve el problema del movimiento 3D; la cámara dinámica como solución' },
  { anio: 2007, evento: 'iPhone y App Store — nace el gaming móvil; mil millones de jugadores nuevos en 5 años' },
  { anio: 2009, evento: 'Minecraft (beta) y League of Legends — la creatividad y los esports toman el control' },
  { anio: 2017, evento: 'Fortnite Battle Royale — 350 millones de cuentas, conciertos virtuales, primera supraapp del gaming' },
  { anio: 2019, evento: 'AlphaStar (DeepMind) supera a profesionales en StarCraft II — la IA domina los videojuegos de estrategia' },
  { anio: 2022, evento: 'Elden Ring arrasa como GOTY; ChatGPT llega al mundo — la IA generativa entra en el diseño de juegos' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  arcade: 'Arcade',
  consolas: 'Consolas',
  pc: 'PC',
  online: 'Online',
  movil: 'Móvil',
  ia: 'IA y futuro',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  arcade: '#8B4513',
  consolas: '#E50000',
  pc: '#556B2F',
  online: '#4169E1',
  movil: '#32CD32',
  ia: '#8B008B',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoVideojuegos }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : periodo.anioFin.toString();
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Características clave</h4>
          <ul className={styles.caracteristicasList}>
            {periodo.caracteristicas.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Estudios clave</h4>
          <ul className={styles.artistasList}>
            {periodo.estudios.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Juego icónico</span>
        <p>{periodo.juego}</p>
      </div>

      <div className={styles.preguntaBox}>
        <span className={styles.preguntaLabel}>Pregunta central</span>
        <p className={styles.preguntaTexto}>{periodo.preguntaCentral}</p>
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

const AÑO_MIN = 1958;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoVideojuegos | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoVideojuegos[][] = [[], [], [], []];
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

  const marcadores: number[] = [1965, 1975, 1985, 1995, 2005, 2010, 2015, 2020];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 1958 hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de los videojuegos"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcadores de años */}
          {marcadores.map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{m}</text>
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

      {/* Panel de detalle al hacer clic */}
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
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : periodo.anioFin.toString();

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
          <p>{periodo.anioInicio} – {anioFinTexto}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">?</span>
            <p>{periodo.preguntaCentral}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Características clave</h4>
              <ul className={styles.caracteristicasList}>
                {periodo.caracteristicas.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Estudios clave</h4>
              <ul className={styles.artistasList}>
                {periodo.estudios.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Juego icónico</span>
            <p>{periodo.juego}</p>
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
        per.estudios.some((e) => e.toLowerCase().includes(termino));
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
        placeholder="Buscar por período o estudio..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de la historia de los videojuegos"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Estudio clave</th>
              <th>Juego icónico</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => {
              const anioFinTexto = per.anioFin === 9999 ? 'actualidad' : per.anioFin.toString();
              return (
                <tr
                  key={per.id}
                  style={i % 2 === 0 ? { background: `${per.color}18` } : {}}
                >
                  <td><strong style={{ color: per.color }}>{per.nombre}</strong></td>
                  <td>{per.anioInicio}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                      {ETIQUETAS_CATEGORIA[per.categoria]}
                    </span>
                  </td>
                  <td>{per.estudios[0]}</td>
                  <td className={styles.preguntaCell}>{per.juego}</td>
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
  { nombre: 'Pioneros y Arcade', desde: 1958, hasta: 1984, icono: '🕹️' },
  { nombre: 'Consolas Domésticas', desde: 1983, hasta: 1996, icono: '🎮' },
  { nombre: '3D y PlayStation', desde: 1995, hasta: 2005, icono: '📀' },
  { nombre: 'Online y HD', desde: 2005, hasta: 2012, icono: '🌐' },
  { nombre: 'Móvil y Multijugador Masivo', desde: 2012, hasta: 2020, icono: '📱' },
  { nombre: 'IA y Metaverso', desde: 2020, hasta: 9999, icono: '🤖' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos y eventos de la historia de los videojuegos organizados por eras.
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
                    {era.desde} – {era.hasta === 9999 ? 'hoy' : era.hasta}
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

export default function VisualizadorHistoriaVideojuegos() {
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
        <h1 className={styles.heroTitle}>Historia de los Videojuegos</h1>
        <p className={styles.heroSubtitle}>
          De Pong a la inteligencia artificial generativa — 14 períodos con los juegos, estudios y tecnologías que definieron el entretenimiento interactivo
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
        title="Historia de los videojuegos: períodos y hitos"
        subtitle="Cómo los videojuegos pasaron de ser experimentos científicos a una industria de 200.000 millones de dólares"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 hitos de la historia de los videojuegos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Rango</th>
                <th>Categoría</th>
                <th>Estudio clave</th>
                <th>Juego icónico</th>
                <th>Innovación clave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Pong y Arcades</strong></td>
                <td>1958–1984</td>
                <td>Arcade</td>
                <td>Atari</td>
                <td>Pac-Man</td>
                <td>Entretenimiento electrónico de masas</td>
              </tr>
              <tr>
                <td><strong>Consolas 8 bits</strong></td>
                <td>1983–1991</td>
                <td>Consolas</td>
                <td>Nintendo</td>
                <td>Super Mario Bros</td>
                <td>Lenguaje del juego de plataformas</td>
              </tr>
              <tr>
                <td><strong>PlayStation 3D</strong></td>
                <td>1995–2001</td>
                <td>Consolas</td>
                <td>Sony / Nintendo</td>
                <td>Ocarina of Time</td>
                <td>Movimiento tridimensional y cámara dinámica</td>
              </tr>
              <tr>
                <td><strong>PC / Online</strong></td>
                <td>1993–2004</td>
                <td>PC</td>
                <td>id Software</td>
                <td>Doom</td>
                <td>FPS y multijugador online</td>
              </tr>
              <tr>
                <td><strong>Gaming Móvil</strong></td>
                <td>2007–presente</td>
                <td>Móvil</td>
                <td>Niantic</td>
                <td>Pokémon Go</td>
                <td>Mil millones de nuevos jugadores</td>
              </tr>
              <tr>
                <td><strong>Esports</strong></td>
                <td>2010–presente</td>
                <td>Online</td>
                <td>Riot Games</td>
                <td>League of Legends</td>
                <td>Competición en estadios olímpicos</td>
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
              <strong>Estudiante de diseño de videojuegos</strong>
              <p>Entiende el contexto histórico de los géneros y mecánicas que estudias: por qué el FPS nació en PC, cómo el 3D resolvió el problema del movimiento o qué causó el crash de 1983.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
            <div>
              <strong>Gamer veterano</strong>
              <p>Comprende la historia de los juegos que marcaron tu infancia y adolescencia — por qué Nintendo salvó la industria, qué hizo revolucionario a Doom o cómo Minecraft cambió las reglas del juego.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
            <div>
              <strong>Padre o madre</strong>
              <p>Entiende qué juegan tus hijos y el contexto cultural de los videojuegos: qué son los esports, por qué Roblox tiene 70 millones de usuarios diarios o qué son las microtransacciones.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
            <div>
              <strong>Profesional de la industria tecnológica</strong>
              <p>Contextualiza el sector de 200.000 millones de dólares que creció desde una pelota digital: modelos de negocio, plataformas, distribución digital y el impacto de la IA generativa en el diseño.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué fue el crash de los videojuegos de 1983 y por qué importa?</strong>
            <p>Entre 1983 y 1985 el mercado americano de videojuegos se desplomó un 97%: pasó de 3.200 millones de dólares a apenas 100 millones. Las causas fueron la saturación del mercado con juegos de baja calidad (el infame juego de E.T. como símbolo), la competencia de los ordenadores domésticos y la pérdida de confianza del consumidor. Nintendo rescató la industria en 1985 con la NES y un sistema de licencias estricto que garantizaba la calidad. Sin el crash de 1983, Nintendo probablemente no habría dominado la industria durante una década.</p>
            <span className={styles.faqTip}>El juego de E.T. de Atari (1982) vendió 10 millones de cartuchos — pero 5 millones fueron devueltos y enterrados en el desierto de Nuevo México.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Los esports son realmente un deporte?</strong>
            <p>Depende de la definición de deporte. Los esports tienen competición organizada con reglas, torneos internacionales, entrenamiento físico y mental intensivo, patrocinadores y audiencias de millones. Las finales del Mundial de League of Legends llenan estadios olímpicos. En Corea del Sur, los jugadores profesionales de StarCraft son tan famosos como los futbolistas. El Comité Olímpico Internacional ha reconocido los esports como competición, aunque no como deporte olímpico pleno. La habilidad cognitiva y los reflejos en League of Legends o Counter-Strike son tan medibles y entrenables como en el tenis de mesa.</p>
            <span className={styles.faqTip}>La final del Mundial de League of Legends 2019 tuvo 44 millones de espectadores simultáneos — más que las finales de la NBA o la Serie Mundial de béisbol.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Las microtransacciones y los loot boxes son juego de azar?</strong>
            <p>Es un debate legal activo. Los loot boxes (cajas de botín con recompensas aleatorias) son regulados como juego de azar en Bélgica, Países Bajos y otras jurisdicciones europeas. En España, la DGOJ analizó si los loot boxes constituyen juego de azar según la Ley de Regulación del Juego de 2011. El principal argumento a favor: tienen elemento de azar, pago real y recompensa de valor variable. En contra: las recompensas no son canjeables por dinero real en la mayoría de juegos. Los menores son el colectivo más vulnerable.</p>
            <span className={styles.faqTip}>FIFA Ultimate Team (EA Sports) generó más de 1.600 millones de dólares anuales con loot boxes — principalmente de jugadores menores de 18 años.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre un juego indie y un AAA?</strong>
            <p>Un juego AAA (Triple A) es producido por un gran estudio con presupuesto de cientos de millones de euros, equipos de cientos de personas y marketing masivo — God of War, Call of Duty, FIFA. Un juego indie (independiente) es desarrollado por un estudio pequeño o un solo desarrollador, generalmente con presupuesto limitado y distribuido digitalmente. La revolución indie comenzó con Steam (2003) y se consolidó con Steam Greenlight. Hoy, algunos juegos indie como Hollow Knight, Hades o Celeste superan en calidad crítica a muchos AAA.</p>
            <span className={styles.faqTip}>Minecraft fue creado por una sola persona (Notch) en su tiempo libre. Fue vendido a Microsoft en 2014 por 2.500 millones de dólares.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo cambiará la IA el diseño de videojuegos?</strong>
            <p>La IA ya está transformando el sector en varias dimensiones: DLSS de NVIDIA genera fotogramas con IA para mejorar el rendimiento; herramientas como Midjourney y DALL-E aceleran la creación de assets visuales; los NPCs con IA conversacional (Inworld, Convai) permiten diálogos emergentes no guionizados. A largo plazo, la IA podría generar mundos procedurales infinitos, adaptar la dificultad en tiempo real al jugador o escribir guiones dinámicos. El riesgo: reducción de empleo en roles de arte, testing y diseño de niveles. La oportunidad: estudios indie con presupuesto pequeño pueden crear contenido de calidad AAA.</p>
            <span className={styles.faqTip}>AlphaStar (DeepMind, 2019) alcanzó el top 0,2% de jugadores mundiales de StarCraft II jugando contra profesionales humanos en condiciones iguales.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo entender un período de la historia de los videojuegos</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el contexto tecnológico</strong>
              <p>Cada período está limitado y liberado por la tecnología disponible. Los arcades eran máquinas dedicadas porque los ordenadores domésticos no podían reproducir sus gráficos. El 3D llegó cuando el hardware pudo procesar polígonos en tiempo real. El gaming móvil nació con el iPhone porque los teléfonos anteriores no tenían pantallas táctiles ni potencia suficiente.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Identifica el modelo de negocio dominante</strong>
              <p>Los arcades vivían del pago por crédito. Las consolas del 8 bits de la venta de cartuchos con licencias estrictas. El PC gaming del shareware y la venta en caja. Steam transformó al modelo digital. Los móviles introdujeron el free-to-play con microtransacciones. Game Pass lleva hacia la suscripción. El modelo de negocio explica qué juegos se hacen y para quién.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Identifica la innovación de mecánica de juego</strong>
              <p>Cada período tiene una innovación mecánica central: la puntuación (Space Invaders), el movimiento en 3D (Mario 64), el multijugador online (Quake), el mundo abierto (GTA), el Battle Royale (Fortnite). Estas innovaciones definen el período porque abren géneros enteros que antes no existían.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Identifica la polémica cultural del período</strong>
              <p>Cada período generó una controversia cultural que reflejaba tensiones sociales más amplias: la violencia en arcades (1980s), Mortal Kombat y la clasificación por edades (1993), los loot boxes y la adicción (2010s), los esports como deporte legítimo (2015+). Las polémicas revelan cómo la sociedad procesa la irrupción de los videojuegos en la cultura.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Conecta con el período siguiente</strong>
              <p>Los períodos no terminan abruptamente — se solapan y se suceden por acumulación de innovaciones. Los arcades no murieron cuando llegaron las consolas domésticas: convivieron durante años. El PC gaming y las consolas siempre han coexistido. El gaming móvil no mató a las consolas. Entender las transiciones como superposiciones es más preciso que verlas como sustituciones.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para analizar la evolución del medio interactivo</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p>Los videojuegos son un medio narrativo, no solo un pasatiempo. Analiza el diseño de mecánicas como si fuera teoría literaria: qué comunica la dificultad de Dark Souls, qué dice el mundo abierto de GTA sobre la libertad individual.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p>Las cifras importan para entender el impacto: la industria de videojuegos supera en ingresos al cine y la música juntos. Contextualiza los números históricos con la inflación y el tamaño del mercado de cada época.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Estudia las diferencias geográficas: Japón dominó las consolas en los 80-90s; Corea del Sur creó los esports; EE.UU. definió el PC gaming; China es hoy el mayor mercado mundial. La geografía moldeó géneros y estilos de diseño.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p>Usa la cronología para identificar las obras que "inventaron" géneros: Doom inventó el FPS moderno, Mario 64 el juego 3D de plataformas, Zelda el action-RPG de aventura. Estos juegos son las gramáticas de sus géneros.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al hablar de historia de los videojuegos</strong>
          <ul>
            <li>Creer que <strong>Nintendo inventó los videojuegos</strong>: los videojuegos nacieron en los laboratorios universitarios americanos (Tennis for Two, 1958; Spacewar!, 1962) y en Atari (Pong, 1972). Nintendo llegó a las consolas domésticas en 1983 y al mercado americano en 1985 — trece años después de Pong.</li>
            <li>Confundir <strong>éxito comercial con calidad artística</strong>: los juegos más vendidos de la historia (Minecraft, Tetris, Mario) son extraordinariamente buenos, pero muchos éxitos comerciales son mediocres. Y muchos juegos aclamados por la crítica (Ico, Okami, Psychonauts) fueron fracasos comerciales en su lanzamiento.</li>
            <li>Pensar que <strong>los videojuegos son solo para niños</strong>: la edad media del jugador en España es de 32 años. El mercado adulto genera el 75% de los ingresos. Juegos como The Witcher 3, The Last of Us o Disco Elysium abordan temas tan complejos como cualquier novela literaria contemporánea.</li>
            <li>Subestimar el <strong>tamaño económico de la industria</strong>: los videojuegos generan más de 200.000 millones de dólares anuales — más que el cine (43.000M$) y la música grabada (26.000M$) juntos. Es la mayor industria del entretenimiento del mundo, y lleva siéndolo desde principios de los 2010s.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-videojuegos')} />
      <ShareCard appName="visualizador-historia-videojuegos" />
      <Footer appName="visualizador-historia-videojuegos" />
    </div>
  );
}
