'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaCine.module.css';
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

type Categoria = 'mudo' | 'clasico' | 'moderno' | 'contemporaneo' | 'digital';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoCine {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  directores: string[];
  caracteristicas: string[];
  pelicula: string;
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

const PERIODOS: PeriodoCine[] = [
  {
    id: 'lumiere', nombre: 'Cine Primitivo', anioInicio: 1895, anioFin: 1910,
    categoria: 'mudo',
    directores: ['Louis Lumière', 'Auguste Lumière', 'Georges Méliès', 'Edwin S. Porter'],
    caracteristicas: ['Primera proyección pública de cine', 'Tomas documentales y actuadas', 'Truco de sustitución (Méliès)', 'Plano fijo sin montaje', 'Primera sala de cine (1895 París)'],
    pelicula: 'Viaje a la Luna — Georges Méliès (1902) — primera película de ciencia ficción',
    preguntaCentral: '¿Puede el cine ser algo más que registro de la realidad?',
    contexto: 'Los hermanos Lumière proyectaron el 28 de diciembre de 1895 en el Gran Café de París las primeras imágenes en movimiento ante un público de pago. Méliès descubrió el truco de sustitución por accidente y llevó el cine a la fantasía. Porter inventó el montaje con "Asalto y robo al tren" (1903).',
    color: '#8B4513',
  },
  {
    id: 'mudo_clasico', nombre: 'Cine Mudo Clásico', anioInicio: 1910, anioFin: 1927,
    categoria: 'mudo',
    directores: ['D.W. Griffith', 'Charlie Chaplin', 'Buster Keaton', 'F.W. Murnau', 'Sergei Eisenstein'],
    caracteristicas: ['Montaje narrativo (Griffith)', 'Comedia física (Chaplin, Keaton)', 'Expresionismo alemán', 'Montaje soviético (Eisenstein)', 'Actuación gestual sin sonido'],
    pelicula: 'El acorazado Potemkin — Eisenstein (1925) — la escalera de Odesa, montaje como emoción política',
    preguntaCentral: '¿Cómo contar historias complejas solo con imágenes y música?',
    contexto: 'Griffith sistematizó el lenguaje cinematográfico (primer plano, montaje paralelo). Chaplin creó a Charlot, el vagabundo universal. Murnau y el expresionismo alemán exploraron el horror y la angustia. Eisenstein demostró que el montaje podía crear emociones que ningún plano individual producía solo.',
    color: '#4A4A4A',
  },
  {
    id: 'sonoro', nombre: 'Llegada del Sonoro y Hollywood Clásico', anioInicio: 1927, anioFin: 1945,
    categoria: 'clasico',
    directores: ['Orson Welles', 'John Ford', 'Howard Hawks', 'Alfred Hitchcock', 'Billy Wilder'],
    caracteristicas: ['Primer largometraje sonoro (El cantante de jazz, 1927)', 'Sistema de estudios Hollywood', 'Géneros consolidados (western, noir, comedia screwball)', 'Código Hays (censura moral)', 'Ciudadano Kane — revolución visual'],
    pelicula: 'Ciudadano Kane — Orson Welles (1941) — profundidad de campo, flashbacks, luz expresiva',
    preguntaCentral: '¿Qué posibilidades narrativas abre el sonido y cómo organizar la industria cinematográfica?',
    contexto: 'El cantante de jazz (1927) hizo obsoleto el cine mudo en dos años. Hollywood construyó el sistema de estudios — MGM, Paramount, Warner, RKO — con contratos de exclusividad. Welles llegó de la radio con Ciudadano Kane (1941) y reinventó el lenguaje visual cinematográfico.',
    color: '#C8A000',
  },
  {
    id: 'edad_oro', nombre: 'Edad de Oro de Hollywood', anioInicio: 1939, anioFin: 1960,
    categoria: 'clasico',
    directores: ['John Huston', 'Elia Kazan', 'William Wyler', 'David Lean', 'Vincente Minnelli'],
    caracteristicas: ['Lo que el viento se llevó (1939)', 'Westerns épicos', 'Musicales de MGM', 'Sistema de estrellas (star system)', 'Epopeyeas históricas'],
    pelicula: 'Lo que el viento se llevó — Victor Fleming (1939) — 4 horas, tecnología Technicolor, récord de taquilla histórico',
    preguntaCentral: '¿Puede el cine contar relatos épicos que compitan con la novela del siglo XIX?',
    contexto: 'La Edad de Oro de Hollywood produjo los grandes géneros y el star system. Las estrellas eran propiedad de los estudios. El Technicolor hizo posibles los musicales de Minnelli. La televisión empezó a competir en los 50 y los estudios respondieron con el Cinemascope y el cine épico en pantalla enorme.',
    color: '#B8860B',
  },
  {
    id: 'nuevaola', nombre: 'Nouvelle Vague y Nuevas Olas Mundiales', anioInicio: 1950, anioFin: 1970,
    categoria: 'moderno',
    directores: ['François Truffaut', 'Jean-Luc Godard', 'Ingmar Bergman', 'Federico Fellini', 'Akira Kurosawa'],
    caracteristicas: ['Cámara en mano y rodaje en exteriores', 'Ruptura con el cine de género', 'Cine de autor como arte', 'Nouvelle Vague francesa', 'Neorrealismo italiano y cine europeo'],
    pelicula: 'Los cuatrocientos golpes — François Truffaut (1959) — primer largometraje de la Nouvelle Vague, autobiografía como cine',
    preguntaCentral: '¿Puede el cine ser tan personal y artístico como la literatura o la pintura?',
    contexto: 'Los críticos de Cahiers du Cinéma — Truffaut, Godard, Rohmer, Rivette — decidieron filmar con cámaras ligeras y presupuestos mínimos. Godard rompió el montaje clásico. Bergman y Fellini elevaron el cine europeo a arte de primera categoría. Kurosawa demostró que el cine japonés podía universalizarse.',
    color: '#20B2AA',
  },
  {
    id: 'nuevo_cine', nombre: 'Nuevo Hollywood', anioInicio: 1967, anioFin: 1980,
    categoria: 'moderno',
    directores: ['Francis Ford Coppola', 'Martin Scorsese', 'Steven Spielberg', 'Stanley Kubrick', 'Robert Altman'],
    caracteristicas: ['El Padrino — cine de género elevado', 'Taxi Driver — antihéroe urbano', 'Jaws y el blockbuster', 'El padrino II — continuación como obra maestra', 'Apocalypse Now — Vietnam como pesadilla'],
    pelicula: 'El Padrino — Francis Ford Coppola (1972) — 10 premios Oscar, fusión de cine de género y arte europeo',
    preguntaCentral: '¿Puede Hollywood combinar ambición artística y éxito de taquilla?',
    contexto: 'Los jóvenes directores del Nuevo Hollywood — influidos por la Nouvelle Vague — tomaron los estudios. Coppola hizo El Padrino; Scorsese exploró la violencia urbana americana; Spielberg inventó el blockbuster moderno con Tiburón (1975) y Star Wars cambió la industria para siempre.',
    color: '#8B0000',
  },
  {
    id: 'blockbuster', nombre: 'Era del Blockbuster', anioInicio: 1977, anioFin: 1995,
    categoria: 'contemporaneo',
    directores: ['George Lucas', 'Steven Spielberg', 'James Cameron', 'Tim Burton', 'Ridley Scott'],
    caracteristicas: ['Star Wars — la franquicia como modelo industrial', 'CGI emergente (Terminator 2, 1991)', 'Indiana Jones y el héroe de aventuras', 'Batman y el cómic en cine', 'Efectos especiales mecánicos y digitales'],
    pelicula: 'Star Wars: Una nueva esperanza — George Lucas (1977) — inventó la franquicia cinematográfica y el merchandising',
    preguntaCentral: '¿Puede el cine de entretenimiento masivo ser también mitología contemporánea?',
    contexto: 'Star Wars cambió el cine para siempre: Lucas inventó la franquicia, el merchandising y el Dolby Stereo. Spielberg respondió con E.T., Indiana Jones y Jurassic Park. Cameron empujó los límites del CGI. El blockbuster de verano se convirtió en la columna vertebral económica de Hollywood.',
    color: '#FF6347',
  },
  {
    id: 'cine_independiente', nombre: 'Cine Independiente Americano', anioInicio: 1984, anioFin: 2000,
    categoria: 'contemporaneo',
    directores: ['Jim Jarmusch', 'Spike Lee', 'Joel Coen', 'Ethan Coen', 'Quentin Tarantino'],
    caracteristicas: ['Sundance Film Festival como plataforma', 'Pulp Fiction — estructura no lineal postmoderna', 'Haz lo que debas (Spike Lee)', 'Blood Simple — los Coen', 'Bajo presupuesto y guión como protagonista'],
    pelicula: 'Pulp Fiction — Quentin Tarantino (1994) — estructura no lineal, diálogos pop, Palma de Oro Cannes',
    preguntaCentral: '¿Puede el cine de bajo presupuesto competir creativamente con el Hollywood industrial?',
    contexto: 'El movimiento indie americano nació en los años 80 como alternativa al blockbuster. Sundance fue su vitrina. Tarantino mezcló cine negro, spaghetti western y cultura pop con una estructura radicalmente no lineal. Los Hermanos Coen construyeron una filmografía de ironía y violencia sin igual.',
    color: '#2E8B57',
  },
  {
    id: 'cine_mundial', nombre: 'Cine Global y World Cinema', anioInicio: 1990, anioFin: 9999,
    categoria: 'contemporaneo',
    directores: ['Wong Kar-Wai', 'Pedro Almodóvar', 'Abbas Kiarostami', 'Bong Joon-ho', 'Alejandro G. Iñárritu'],
    caracteristicas: ['Cine coreano en Hollywood (Parásitos, 2019)', 'Almodóvar y el cine español internacional', 'Cine iraní (Kiarostami)', 'Cine hongkonés (Wong Kar-Wai)', 'Globalización del mercado cinematográfico'],
    pelicula: 'Parásitos — Bong Joon-ho (2019) — primer film no anglófono en ganar el Oscar a Mejor Película',
    preguntaCentral: '¿Es el cine americano el único cine universal?',
    contexto: 'Los años 90-2000 vieron la consolidación de cinematografías nacionales con proyección global. Almodóvar llevó el cine español a los Oscar. Wong Kar-Wai convirtió Hong Kong en referente estético mundial. En 2019, Parásitos de Bong Joon-ho rompió la barrera histórica de los Oscar: primer film en otra lengua ganando Mejor Película.',
    color: '#9932CC',
  },
  {
    id: 'digital_revolution', nombre: 'Revolución Digital', anioInicio: 1993, anioFin: 2010,
    categoria: 'digital',
    directores: ['George Lucas', 'James Cameron', 'Andy Wachowski', 'Lilly Wachowski', 'Peter Jackson'],
    caracteristicas: ['Dinosaurios CGI (Jurassic Park, 1993)', 'Matrix — bullet time digital', 'El señor de los anillos — motion capture', 'Avatar (2009) — 3D y revolución estética', 'Digital como lenguaje cinematográfico'],
    pelicula: 'Avatar — James Cameron (2009) — 2.900 millones de dólares en taquilla, revolución del 3D y CGI fotorrealista',
    preguntaCentral: '¿El CGI amplía o destruye el lenguaje cinematográfico?',
    contexto: 'Jurassic Park (1993) hizo posible lo imposible: dinosaurios fotorrealistas. Matrix inventó el bullet time. Jackson digitalizó la épica de Tolkien con motion capture. Cameron llegó a Avatar (2009) con un presupuesto de 500 millones para crear el mundo más detallado del cine digital — y recaudó 2.900 millones.',
    color: '#1E90FF',
  },
  {
    id: 'franquicias', nombre: 'Universos Cinematográficos y Franquicias', anioInicio: 2008, anioFin: 9999,
    categoria: 'digital',
    directores: ['Christopher Nolan', 'Joss Whedon', 'Ryan Coogler', 'Patty Jenkins'],
    caracteristicas: ['Marvel Cinematic Universe (MCU)', 'DC Comics en cine', 'Trilogía de Nolan — Batman Begins/Dark Knight/Rises', 'Black Panther y representación', 'Universos narrativos interconectados'],
    pelicula: 'El caballero oscuro — Christopher Nolan (2008) — redefinió el cine de superhéroes como tragedia shakespeariana',
    preguntaCentral: '¿Puede el cine de superhéroes ser cine serio?',
    contexto: 'Iron Man (2008) lanzó el MCU — la franquicia más rentable de la historia del cine. Nolan llevó Batman a la tragedia moral con El caballero oscuro (2008). El MCU alcanzó su cima con Avengers: Endgame (2019, 2.800M$). Black Panther (2018) demostró que un film de superhéroes podía ser también un fenómeno cultural y político.',
    color: '#C71585',
  },
  {
    id: 'streaming', nombre: 'Era del Streaming', anioInicio: 2013, anioFin: 9999,
    categoria: 'digital',
    directores: ['Alfonso Cuarón', 'Martin Scorsese', 'David Fincher', 'Jane Campion'],
    caracteristicas: ['Netflix como estudio cinematográfico', 'Roma — Oscar a Mejor Película para Netflix', 'El Irlandés — CGI de rejuvenecimiento', 'The Crown, Squid Game: series como cine', 'Distribución directa al hogar'],
    pelicula: 'Roma — Alfonso Cuarón (2018) — primer film de Netflix nominado al Oscar, ganó 3 (Dir., fotografía, lengua extranjera)',
    preguntaCentral: '¿Necesita el cine la sala de cine para existir como arte?',
    contexto: 'Netflix transformó la distribución: Roma de Cuarón ganó 3 Oscar siendo estreno directo en plataforma (2019). La pandemia de 2020 aceleró el cambio — las salas cerraron y el streaming explotó. Scorsese, Fincher y Campion llevan proyectos a plataformas. La línea entre cine y televisión desaparece.',
    color: '#E50914',
  },
  {
    id: 'found_footage', nombre: 'Géneros Emergentes y Cine de Autor Contemporáneo', anioInicio: 1999, anioFin: 9999,
    categoria: 'digital',
    directores: ['Darren Aronofsky', 'Paul Thomas Anderson', 'Sofia Coppola', 'Chloe Zhao', 'Greta Gerwig'],
    caracteristicas: ['Found footage (The Blair Witch Project, 1999)', 'Mumblecore — cine de bajo presupuesto digital', 'Cine de autor en el circuito de festivales', 'Nomadland y la periferia americana', 'Barbie como fenómeno cultural feminista'],
    pelicula: 'Nomadland — Chloé Zhao (2020) — Oscar Mejor Película y Dirección, primera directora asiática ganadora',
    preguntaCentral: '¿Qué voces y perspectivas trae el cine cuando se democratiza la producción?',
    contexto: 'Blair Witch Project (1999) inventó el found footage con 60.000$ y recaudó 248M$. La cámara digital democratizó la producción. El #MeToo (2017) transformó la industria. Zhao, Gerwig, Campion — las directoras irrumpen en los grandes premios. Barbie (2023) de Gerwig recaudó 1.400M$ mientras interrogaba los roles de género.',
    color: '#FF69B4',
  },
  {
    id: 'ia_generativa', nombre: 'Cine e Inteligencia Artificial', anioInicio: 2022, anioFin: 9999,
    categoria: 'digital',
    directores: ['Sam Altman (OpenAI Sora)', 'Investigadores de Runway', 'Pioneros IA en VFX'],
    caracteristicas: ['Sora (OpenAI, 2024) — vídeo fotorrealista por texto', 'Deepfake y CGI de rejuvenecimiento', 'IA en guión, casting y distribución', 'Huelga de Hollywood (2023) contra la IA', 'Democratización radical de la producción'],
    pelicula: 'Sora (OpenAI, 2024) — primer modelo de IA que genera minutos de vídeo fotorrealista; huelga SAG-AFTRA contra la IA',
    preguntaCentral: '¿Puede la IA crear cine? ¿Qué queda del autor y el actor en el cine del futuro?',
    contexto: 'La huelga de actores y guionistas de Hollywood en 2023 fue en parte por el miedo a la sustitución por IA. Runway y Pika Labs generan planos fotorrealistas desde texto. Sora de OpenAI (2024) produce vídeos de varios minutos. El debate es el mismo que el del cine primitivo: ¿es esto arte o tecnología?',
    color: '#483D8B',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1895, evento: 'Los hermanos Lumière proyectan las primeras imágenes en movimiento ante público de pago — nace el cine' },
  { anio: 1927, evento: 'El cantante de jazz — primer largometraje sonoro; el cine mudo muere en dos años' },
  { anio: 1939, evento: 'Año de oro de Hollywood: Lo que el viento se llevó + El mago de Oz + Stagecoach' },
  { anio: 1960, evento: 'Psicosis (Hitchcock) y La aventura (Antonioni) rompen las reglas del cine clásico' },
  { anio: 1975, evento: 'Tiburón (Spielberg) inventa el blockbuster de verano — modelo industrial que domina hasta hoy' },
  { anio: 1993, evento: 'Jurassic Park — el CGI fotorrealista de dinosaurios cambia para siempre el lenguaje visual' },
  { anio: 2008, evento: 'El caballero oscuro — el cine de superhéroes se toma en serio; Iron Man lanza el MCU' },
  { anio: 2019, evento: 'Parásitos (Bong Joon-ho) — primer film no anglófono en ganar el Oscar a Mejor Película' },
  { anio: 2023, evento: 'Huelga de Hollywood contra la IA — Sora de OpenAI llega al año siguiente' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  mudo: 'Mudo',
  clasico: 'Clásico',
  moderno: 'Moderno',
  contemporaneo: 'Contemporáneo',
  digital: 'Digital',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  mudo: '#4A4A4A',
  clasico: '#C8A000',
  moderno: '#20B2AA',
  contemporaneo: '#8B0000',
  digital: '#1E90FF',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoCine }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : periodo.anioFin.toString();
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Características</h4>
          <ul className={styles.caracteristicasList}>
            {periodo.caracteristicas.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Directores clave</h4>
          <ul className={styles.artistasList}>
            {periodo.directores.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Película icónica</span>
        <p>{periodo.pelicula}</p>
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
  const [seleccionado, setSeleccionado] = useState<PeriodoCine | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoCine[][] = [[], [], [], []];
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

  // Marcadores de años
  const marcadores: number[] = [1900, 1920, 1940, 1960, 1975, 1990, 2000, 2010, 2020];

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
          aria-label="Línea del tiempo de la historia del cine"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcadores de años */}
          {marcadores.map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{m}</text>
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
              <h4 className={styles.detalleSubtitulo}>Características principales</h4>
              <ul className={styles.caracteristicasList}>
                {periodo.caracteristicas.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Directores clave</h4>
              <ul className={styles.artistasList}>
                {periodo.directores.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Película icónica</span>
            <p>{periodo.pelicula}</p>
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
        per.directores.some((d) => d.toLowerCase().includes(termino));
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
        placeholder="Buscar por período o director..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período cinematográfico"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Director clave</th>
              <th>Película icónica</th>
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
                  <td>{per.directores[0]}</td>
                  <td className={styles.peliculaCell}>{per.pelicula}</td>
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
  { nombre: 'Cine Mudo', desde: 1895, hasta: 1927, icono: '🎭' },
  { nombre: 'Edad de Oro Hollywood', desde: 1927, hasta: 1950, icono: '⭐' },
  { nombre: 'Nueva Ola y Arthouse', desde: 1950, hasta: 1975, icono: '🎨' },
  { nombre: 'Blockbuster y VHS', desde: 1975, hasta: 1995, icono: '📼' },
  { nombre: 'Era Digital', desde: 1995, hasta: 2010, icono: '💿' },
  { nombre: 'Streaming e IA', desde: 2010, hasta: 9999, icono: '📱' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos cinematográficos y eventos históricos organizados por eras.
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

export default function VisualizadorHistoriaCine() {
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
        <h1 className={styles.heroTitle}>Historia del Cine</h1>
        <p className={styles.heroSubtitle}>
          De los hermanos Lumière al cine generado por IA — 14 períodos con los movimientos, directores y películas que transformaron el séptimo arte
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
        title="Historia del cine: movimientos y contexto"
        subtitle="Cómo el cine refleja su época y transforma nuestra forma de ver el mundo"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos clave de la historia del cine</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Rango</th>
                <th>Característica dominante</th>
                <th>Director clave</th>
                <th>Película icónica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cine Mudo Clásico</strong></td>
                <td>1910–1927</td>
                <td>Montaje narrativo y comedia física</td>
                <td>Charlie Chaplin</td>
                <td>El acorazado Potemkin</td>
              </tr>
              <tr>
                <td><strong>Hollywood Clásico</strong></td>
                <td>1927–1945</td>
                <td>Sistema de estudios y géneros</td>
                <td>Orson Welles</td>
                <td>Ciudadano Kane</td>
              </tr>
              <tr>
                <td><strong>Nouvelle Vague</strong></td>
                <td>1950–1970</td>
                <td>Cine de autor y ruptura formal</td>
                <td>François Truffaut</td>
                <td>Los cuatrocientos golpes</td>
              </tr>
              <tr>
                <td><strong>Nuevo Hollywood</strong></td>
                <td>1967–1980</td>
                <td>Fusión arte y entretenimiento</td>
                <td>Francis Ford Coppola</td>
                <td>El Padrino</td>
              </tr>
              <tr>
                <td><strong>Revolución Digital</strong></td>
                <td>1993–2010</td>
                <td>CGI fotorrealista</td>
                <td>James Cameron</td>
                <td>Avatar</td>
              </tr>
              <tr>
                <td><strong>Streaming e IA</strong></td>
                <td>2013–actualidad</td>
                <td>Distribución directa al hogar</td>
                <td>Alfonso Cuarón</td>
                <td>Roma</td>
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
              <strong>Estudiante de comunicación audiovisual</strong>
              <p>Repasa la evolución de los géneros y movimientos cinematográficos con la cronología visual para preparar exámenes y trabajos sobre historia del cine.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📺</span>
            <div>
              <strong>Cinéfilo curioso</strong>
              <p>Quiere entender el contexto histórico de las películas que ve en festivales o plataformas: por qué Godard rompe el raccord, qué es el Código Hays o cómo nació el blockbuster.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎬</span>
            <div>
              <strong>Aspirante a director o guionista</strong>
              <p>Necesita conocer las tradiciones y corrientes que ha heredado: desde el montaje soviético hasta la Nouvelle Vague, el Nuevo Hollywood y el cine independiente americano.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
            <div>
              <strong>Aficionado que quiere ir más allá</strong>
              <p>Ve películas de Marvel o Netflix y quiere entender qué tiene que ver eso con Eisenstein, Chaplin o la Nouvelle Vague y cómo llegamos aquí desde 1895.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué el cine mudo desapareció tan rápido cuando llegó el sonido?</strong>
            <p>El cantante de jazz (1927) fue un éxito comercial arrollador. En dos años, todos los estudios habían reconvertido sus instalaciones para el sonido. Los actores del mudo con voces inadecuadas o acentos extranjeros perdieron sus contratos. Chaplin fue uno de los pocos que resistió: El gran dictador (1940) fue su primer film completamente sonoro.</p>
            <span className={styles.faqTip}>Curiosidad: el sonido no "mejoró" automáticamente el cine. Los primeros años del sonoro fueron técnicamente más rígidos que los últimos años del cine mudo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es exactamente la "teoría del autor" en cine?</strong>
            <p>La politique des auteurs surgió en Cahiers du Cinéma (Truffaut, 1954): el director es el verdadero autor de una película como el escritor lo es de una novela, con independencia del estudio o el guionista. Permite analizar la filmografía completa de Hitchcock, Ford o Kubrick como una obra personal con temas y obsesiones recurrentes.</p>
            <span className={styles.faqTip}>La ironía: Truffaut y Godard, críticos que reivindicaban la autoría, acabaron convirtiéndose en autores tan reconocidos como los directores que admiraban.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El streaming está matando el cine?</strong>
            <p>Depende de cómo definas "cine". Las salas de cine han perdido público desde la pandemia de 2020 y no se han recuperado del todo. Pero la producción cinematográfica — películas narrativas de larga duración — nunca ha sido tan prolífica. El debate real es sobre la experiencia: ver Roma de Cuarón en una pantalla de 65 pulgadas frente a verla en IMAX son experiencias distintas, no equivalentes.</p>
            <span className={styles.faqTip}>Paradoja: los directores más ambiciosos del mundo (Scorsese, Fincher, Campion) producen ahora para plataformas que no pasan por las salas.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia a un "blockbuster" de una "película de autor"?</strong>
            <p>El blockbuster prioriza el retorno de inversión: presupuesto alto, estreno global simultáneo, franquicia explotable. La película de autor prioriza la visión personal del director, con independencia de la taquilla. La distinción no es absoluta: El Padrino de Coppola o Tiburón de Spielberg fueron blockbusters de autor. Nolan, Villeneuve o Denis Villeneuve operan en esa frontera hoy.</p>
            <span className={styles.faqTip}>El problema del cine de autor puro es económico: necesita festivales y distribuidores especializados para llegar a su público.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puede la inteligencia artificial hacer cine de verdad?</strong>
            <p>La IA ya genera planos individuales fotorrealistas (Runway, Sora). Lo que no puede —todavía— es mantener coherencia narrativa, emocional y visual durante 90 minutos con personajes complejos. El cine no es solo imágenes bonitas: es tiempo, ritmo, elección de qué mostrar y qué ocultar. Esas elecciones son aún profundamente humanas. La huelga de Hollywood en 2023 mostró que la industria toma el riesgo muy en serio.</p>
            <span className={styles.faqTip}>La misma pregunta se hizo en 1895 ("¿es esto arte?"), en 1927 ("el sonido destruirá la actuación"), en 1993 ("el CGI destruirá el cine real"). El cine siempre sobrevivió absorbiendo la tecnología.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo estudiar un período de la historia del cine</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el contexto histórico y tecnológico</strong>
              <p>Cada período cinematográfico nace de una tecnología (el sonido, el color, el CGI, el streaming) y de un contexto histórico (la Gran Depresión moldeó el cine negro; la Segunda Guerra Mundial impulsó el neorrealismo). Pregúntate: ¿qué tecnología cambió las posibilidades del cine en este período?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Ve al menos una película icónica del período</strong>
              <p>Ningún manual sustituye a la experiencia directa. Ver El acorazado Potemkin, Ciudadano Kane, Los cuatrocientos golpes o Pulp Fiction cambia radicalmente la comprensión del lenguaje cinematográfico. Elige una película que el período mismo considera fundacional.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Estudia el lenguaje visual: montaje, plano, encuadre</strong>
              <p>El cine mudo inventó el primer plano y el montaje paralelo. La Nouvelle Vague introdujo la cámara en mano y el jump cut. El digital trajo el bullet time. En cada período hay innovaciones técnicas que son también innovaciones expresivas — no son decorativas, cambian el significado.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Conecta el período con la economía de la industria</strong>
              <p>El Nuevo Hollywood surgió porque los estudios estaban en crisis y dieron libertad a directores jóvenes. El MCU surgió porque los cómics eran propiedades baratas con audiencia masiva. La industria cinematográfica es un arte y un negocio simultáneamente: entender la economía explica las decisiones artísticas.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Traza las influencias hacia adelante y hacia atrás</strong>
              <p>La Nouvelle Vague influyó directamente en el Nuevo Hollywood (Scorsese adoraba a Godard). El cine independiente americano de los 90 heredó a su vez el Nuevo Hollywood. Cada período es simultáneamente una reacción al anterior y una influencia sobre el siguiente. El mapa de influencias es tan importante como el período mismo.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Consejos para ver cine con perspectiva histórica</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎞️</span>
            <p>Cuando veas una película antigua, no juzgues con ojos actuales. Ciudadano Kane o El acorazado Potemkin eran radicalmente innovadores en su tiempo — su "antigüedad" visible es precisamente la huella de haber inventado el lenguaje que usamos hoy.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>Los períodos se solapan: el cine independiente americano existía durante el auge del blockbuster. Las fechas son orientativas — lo importante es entender qué corriente estética domina el debate cinematográfico de cada momento.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Empieza por los tres pilares fundacionales (Cine Mudo, Hollywood Clásico, Nouvelle Vague) antes de explorar la era digital y el streaming. Son el marco de referencia del que parte todo el cine posterior.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <p>Conecta el cine con las demás artes de su época: el expresionismo alemán en el cine mudo es inseparable de la pintura expresionista y el teatro de Brecht; la Nouvelle Vague dialoga con el nouveau roman literario y la filosofía existencialista.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al estudiar historia del cine</strong>
          <ul>
            <li>Confundir <strong>cine europeo</strong> con cine de autor y <strong>Hollywood</strong> con cine comercial: Kubrick, Nolan, Coppola y Spielberg son directores de Hollywood con visiones de autor profundamente personales. Y hay cine europeo tan comercial como cualquier blockbuster americano.</li>
            <li>Creer que Spielberg inventó el blockbuster <strong>solo</strong>: Tiburón (1975) estableció el modelo del estreno de verano masivo, pero Star Wars (1977) de Lucas añadió el merchandising y la franquicia. Ambos son los padres del blockbuster moderno.</li>
            <li>Pensar que el CGI es sinónimo de <strong>mal cine</strong>: 2001: Una odisea del espacio (1968), Blade Runner (1982) y Jurassic Park (1993) son films de autor que usaron los efectos especiales más avanzados de su época. La tecnología es neutral — lo que importa es al servicio de qué visión se usa.</li>
            <li>Reducir la <strong>Nouvelle Vague</strong> a los franceses: hubo nuevas olas en Alemania (Herzog, Fassbinder), Checoslovaquia (Forman, Chytilová), Brasil (Cinema Novo), Argentina y Japón (Oshima) en los años 60 y 70, todas con características propias e igualmente revolucionarias.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-cine')} />
      <ShareCard appName="visualizador-historia-cine" />
      <Footer appName="visualizador-historia-cine" />
    </div>
  );
}
