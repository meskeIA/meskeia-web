'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaComics.module.css';
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
  | 'precursores'
  | 'periodico'
  | 'clasico'
  | 'golden_age'
  | 'censura'
  | 'silver_age'
  | 'bronze_age'
  | 'europeo'
  | 'novela_grafica'
  | 'manga'
  | 'independiente'
  | 'adaptacion'
  | 'digital'
  | 'futuro';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoComic {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  estilo: string;
  autores: string[];
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

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoComic[] = [
  {
    id: 'precursores', nombre: 'Precursores del Cómic', anioInicio: 1827, anioFin: 1895, categoria: 'precursores',
    estilo: 'Historieta narrativa temprana',
    autores: ['Rodolphe Töpffer', 'Wilhelm Busch', 'Richard F. Outcault'],
    hitos: ['Les Voyages et aventures de M. Vieux Bois (Töpffer, 1827)', 'Max und Moritz — Busch (1865)', 'La bande dessinée en periódicos europeos', 'Yellow Kid — Outcault (1895)'],
    obra: 'Les Voyages et aventures de M. Vieux Bois — Rodolphe Töpffer (1827) — primera historieta gráfica narrativa',
    pregunta: '¿Cuándo nació realmente el cómic y a quién le corresponde el título de su inventor?',
    contexto: 'Rodolphe Töpffer creó en Ginebra los primeros álbumes de historietas con secuencia narrativa en los años 1820. Wilhelm Busch publicó Max und Moritz en 1865, influencia directa de la tira americana. Richard Outcault lanzó Yellow Kid en 1895 en el New York World, considerado el primer cómic de prensa americano con bocadillo de diálogo moderno. Goethe ya había elogiado las historietas de Töpffer.',
    color: '#8B4513',
  },
  {
    id: 'tiras_prensa', nombre: 'La Era de las Tiras de Prensa', anioInicio: 1895, anioFin: 1938, categoria: 'periodico',
    estilo: 'Tira cómica diaria de prensa',
    autores: ['Winsor McCay', 'Bud Fisher', 'George Herriman', 'Chester Gould'],
    hitos: ['Little Nemo in Slumberland (McCay, 1905)', 'Mutt and Jeff — primera tira diaria (1907)', 'Krazy Kat (Herriman, 1913)', 'Dick Tracy (Gould, 1931)', 'Popeye el Marino (1929)'],
    obra: 'Little Nemo in Slumberland de Winsor McCay (1905) — la obra maestra de la tira de prensa en términos artísticos',
    pregunta: '¿Cómo las tiras de prensa se convirtieron en el primer medio de comunicación de masas visual?',
    contexto: 'Winsor McCay llevó el arte de la tira cómica a cotas nunca superadas con Little Nemo (1905). Hearst y Pulitzer usaban los cómics como arma en la "guerra amarilla" de prensa. Mutt and Jeff (1907) inauguró la tira diaria tal como la conocemos. Krazy Kat de Herriman fue el favorito de artistas e intelectuales. Dick Tracy (1931) abrió el género de detectives. Los cómics llegaban a millones cada mañana.',
    color: '#C8A000',
  },
  {
    id: 'golden_age', nombre: 'La Edad de Oro de los Superhéroes', anioInicio: 1938, anioFin: 1956, categoria: 'golden_age',
    estilo: 'Superhéroe clásico americano',
    autores: ['Jerry Siegel', 'Joe Shuster', 'Bob Kane', 'Bill Finger', 'Jack Kirby'],
    hitos: ['Superman — Action Comics #1 (junio 1938)', 'Batman (1939)', 'Captain America (1941)', 'Wonder Woman (1941)', 'Marvel Comics #1 (1939)'],
    obra: 'Action Comics #1 (junio 1938) — primera aparición de Superman, hoy vale más de 3 millones de dólares',
    pregunta: '¿Por qué los superhéroes nacieron justo antes de la Segunda Guerra Mundial y qué necesidad psicológica cubrían?',
    contexto: 'Superman apareció en Action Comics #1 en junio de 1938, un año antes de que Hitler invadiera Polonia. Siegel y Shuster vendieron todos los derechos por 130 dólares. Batman (1939) fue la respuesta oscura a Superman. Captain America llegó en 1941 pegando a Hitler en la portada, 8 meses antes de Pearl Harbor. Los superhéroes eran la fantasía de poder ante una realidad amenazante. La Edad de Oro terminó con el Código Comics en 1954.',
    color: '#FF4500',
  },
  {
    id: 'codigo_censura', nombre: 'El Código Comics y la Censura', anioInicio: 1954, anioFin: 1961, categoria: 'censura',
    estilo: 'Autocensura post-Wertham',
    autores: ['Fredric Wertham (teórico)', 'Bill Gaines (EC Comics)'],
    hitos: ['Seducción del Inocente — Wertham (1954)', 'Audiencias del Senado contra los cómics', 'Comics Code Authority (octubre 1954)', 'Desaparición de los horror y crime comics', 'EC Comics cierra sus revistas'],
    obra: '"Seducción del Inocente" de Fredric Wertham (1954) — el libro que casi destruyó la industria del cómic',
    pregunta: '¿Fue el Código Comics la mayor censura cultural de la historia americana o una respuesta a excesos reales?',
    contexto: 'Fredric Wertham publicó en 1954 "Seducción del Inocente" acusando a los cómics de causar delincuencia juvenil. El Senado americano celebró audiencias. La industria creó el Comics Code Authority para evitar la regulación gubernamental: prohibía sangre, horror, villanos que escaparan a la justicia, palabras como "terror" o "horror". EC Comics (Mad, Tales from the Crypt) fue el gran perjudicado. El Código duró hasta 2011.',
    color: '#696969',
  },
  {
    id: 'silver_age', nombre: 'Edad de Plata y la Revolución Marvel', anioInicio: 1956, anioFin: 1970, categoria: 'silver_age',
    estilo: 'Superhéroe moderno con psicología',
    autores: ['Stan Lee', 'Jack Kirby', 'Steve Ditko', 'Julius Schwartz'],
    hitos: ['Flash relanzado (DC, 1956)', 'Fantastic Four #1 (1961)', 'Spider-Man (Amazing Fantasy #15, 1962)', 'X-Men (1963)', 'Daredevil, Thor, Iron Man (1963-64)'],
    obra: 'Amazing Fantasy #15 (agosto 1962) — primera aparición de Spider-Man, hoy vale 3.6 millones de dólares',
    pregunta: '¿Por qué Spider-Man representó una ruptura radical con los superhéroes anteriores?',
    contexto: 'Stan Lee y Jack Kirby reinventaron el cómic en 1961 con los Fantastic Four: héroes con problemas reales (crisis de pareja, inseguridades, deudas). Spider-Man en 1962 fue el gran cambio: un adolescente neurótico, con problemas en el instituto, que a veces pierde. Steve Ditko diseñó su estética nerviosa y ansiosa. DC respondió relanzando a Flash y luego a la Liga de la Justicia. La Edad de Plata dialogó con el movimiento de derechos civiles.',
    color: '#C0C0C0',
  },
  {
    id: 'bronze_age', nombre: 'Edad de Bronce: Compromiso Social', anioInicio: 1970, anioFin: 1985, categoria: 'bronze_age',
    estilo: 'Cómic comprometido socialmente',
    autores: ["Dennis O'Neil", 'Neal Adams', 'Chris Claremont'],
    hitos: ['"Hard Traveling Heroes" — Green Lantern/Green Arrow (1970)', 'Primer cómic de drogadicción (Spider-Man, 1971, sin Código)', 'X-Men de Claremont como metáfora de discriminación', 'Wolverine como personaje violento fuera del Código'],
    obra: 'Green Lantern/Green Arrow #76 (1970) — el cómic que confrontó al superhéroe con la pobreza y el racismo americano',
    pregunta: '¿Cómo usaron los cómics de los 70 a los superhéroes para criticar la sociedad americana?',
    contexto: "Dennis O'Neil y Neal Adams enviaron a Green Lantern y Green Arrow de viaje por la América profunda: pobreza, racismo, drogas. El número de Spider-Man sobre la drogadicción (1971) se publicó sin el sello del Código porque la FDA lo pidió. Chris Claremont convirtió a los X-Men en una metáfora de discriminación que resonó con la comunidad gay y las minorías. El Código empezó a resquebrajarse.",
    color: '#CD7F32',
  },
  {
    id: 'europeo', nombre: 'Bande Dessinée y el Cómic Europeo', anioInicio: 1929, anioFin: 2000, categoria: 'europeo',
    estilo: 'Bande dessinée franco-belga',
    autores: ['Hergé (Tintín)', 'René Goscinny', 'Albert Uderzo', 'Moebius (Jean Giraud)'],
    hitos: ['Tintín — Le Vingtième Siècle (1929)', 'Astérix — Pilote (1959)', 'Lucky Luke y el western europeo', 'El incal de Moebius y Jodorowsky (1980)', 'Los álbumes franco-belgas para adultos'],
    obra: 'Las Aventuras de Tintín (Hergé, 1929-1983) — 250 millones de álbumes vendidos en 80 idiomas',
    pregunta: '¿Por qué el cómic europeo tomó un camino radicalmente diferente al americano desde el principio?',
    contexto: 'Hergé lanzó Tintín en 1929 en un suplemento infantil belga. El álbum europeo (48 páginas, tapa dura, precio de libro) fue diferente al comic book americano desde el inicio. Astérix de Goscinny y Uderzo mezcló humor, historia y crítica política. Moebius y Jodorowsky crearon con "El incal" (1980) el paradigma del cómic de ciencia ficción adulto. Francia es el tercer mercado editorial del mundo, tras Japón y EE.UU.',
    color: '#4169E1',
  },
  {
    id: 'novela_grafica', nombre: 'La Novela Gráfica y la Madurez del Cómic', anioInicio: 1978, anioFin: 2000, categoria: 'novela_grafica',
    estilo: 'Novela gráfica para adultos',
    autores: ['Will Eisner', 'Art Spiegelman', 'Frank Miller', 'Alan Moore'],
    hitos: ['A Contract with God — Eisner (1978)', 'Maus I (Spiegelman, 1986)', 'Batman: El regreso del Caballero Oscuro (Miller, 1986)', 'Watchmen (Moore, 1986-87)', 'Maus gana el Pulitzer (1992)'],
    obra: 'Watchmen de Alan Moore y Dave Gibbons (1986-87) — redefinió lo que el cómic podía hacer narrativamente',
    pregunta: '¿Cómo cuatro obras publicadas en 1986 cambiaron para siempre la percepción cultural del cómic?',
    contexto: '1986 fue el año más importante del cómic americano: Miller publicó "El regreso del Caballero Oscuro" (Batman adulto, oscuro), Moore publicó "Watchmen" (superhéroes como metáfora del fin de la Guerra Fría), Spiegelman terminó Maus (el Holocausto narrado con ratones y gatos). Will Eisner había abierto el camino en 1978 con "A Contract with God". Maus ganó el Pulitzer en 1992. El término "novela gráfica" se consolidó.',
    color: '#191970',
  },
  {
    id: 'manga', nombre: 'El Manga Conquista el Mundo', anioInicio: 1950, anioFin: 2010, categoria: 'manga',
    estilo: 'Manga japonés y anime',
    autores: ['Osamu Tezuka', 'Akira Toriyama', 'Rumiko Takahashi', 'Naoki Urasawa'],
    hitos: ['Astro Boy — Tezuka (1952)', 'Dragon Ball (Toriyama, 1984)', 'Akira (Otomo, 1982) — manga adulto', 'Slam Dunk (1990)', 'One Piece — el manga más vendido de la historia (1997)'],
    obra: 'Astro Boy de Osamu Tezuka (1952) — el "Dios del Manga" y creador del lenguaje visual del manga moderno',
    pregunta: '¿Por qué el manga superó en ventas a cualquier otra forma de cómic del mundo?',
    contexto: 'Osamu Tezuka tomó el lenguaje cinematográfico de Disney y Eisner y creó el manga moderno en los años 50. El manga es para todas las edades: shonen (chicos), shojo (chicas), seinen (adultos), josei. Dragon Ball y su anime alcanzaron 250 millones de copias. One Piece (1997) es el manga más vendido de la historia: 520 millones de copias. El mercado del manga vale 7.000 millones de dólares anuales y supone el 40% del mercado editorial japonés.',
    color: '#FF1493',
  },
  {
    id: 'independiente', nombre: 'Cómic Independiente y Alternativo', anioInicio: 1968, anioFin: 2000, categoria: 'independiente',
    estilo: 'Underground comix y alternativo',
    autores: ['Robert Crumb', 'Harvey Pekar', 'Daniel Clowes', 'Chris Ware'],
    hitos: ['Zap Comix #1 — Crumb (1968)', 'American Splendor — Pekar (1976)', 'Ghost World — Clowes (1997)', 'Jimmy Corrigan — Chris Ware (2000)', 'Fantagraphics Books como editorial alternativa'],
    obra: 'Zap Comix #1 de Robert Crumb (1968) — nacimiento del underground comix, vendido en tiendas de cabeza',
    pregunta: '¿Cómo el movimiento underground de los 60-70 liberó al cómic de la censura y le dio voz propia?',
    contexto: 'Robert Crumb vio cómo el Código Comics aplastaba la creatividad y creó Zap Comix (1968), vendido en tiendas de parafernalia. El underground rechazó el Código: sexo, drogas, política, traumas. Harvey Pekar creó American Splendor (1976), autobiografía de un archivista de Cleveland. Fantagraphics publicó a los maestros del cómic alternativo. Chris Ware ganó el Guardian First Book Award con Jimmy Corrigan en 2001.',
    color: '#FF6347',
  },
  {
    id: 'adaptaciones', nombre: 'Cómic en el Cine y la Cultura Pop', anioInicio: 1978, anioFin: 2020, categoria: 'adaptacion',
    estilo: 'Adaptaciones y Marvel Cinematic Universe',
    autores: ['Stan Lee (cameos)', 'Kevin Feige (MCU)'],
    hitos: ['Superman (Donner, 1978)', 'Batman (Tim Burton, 1989)', 'X-Men (2000)', 'Spider-Man (Raimi, 2002)', 'Iron Man — inicio del MCU (2008)', 'Avengers: Endgame — 2.793 millones$ (2019)'],
    obra: 'Avengers: Endgame (2019) — 2.793 millones de dólares de taquilla, la segunda película más taquillera de la historia',
    pregunta: '¿Cómo transformó el MCU el negocio cinematográfico global durante una década?',
    contexto: 'Superman (1978) demostró que un superhéroe podía tomarse en serio cinematográficamente. Batman de Burton (1989) dio oscuridad. X-Men (2000) y Spider-Man (2002) relanzaron el género. Iron Man (2008) inició el MCU: 31 películas interconectadas, universo narrativo extendido. Avengers: Endgame (2019) recaudó 2.793M$ en 11 días. Disney compró Marvel en 2009 por 4.000M$; el MCU ha generado más de 30.000M$ en taquilla.',
    color: '#B8860B',
  },
  {
    id: 'digital_web', nombre: 'Webcómic y Cómic Digital', anioInicio: 2000, anioFin: 2020, categoria: 'digital',
    estilo: 'Webcómic y plataformas digitales',
    autores: ['Randall Munroe (xkcd)', 'Sarah Andersen', 'LINE Webtoon'],
    hitos: ['PvP Online (1998) — primer webcómic popular', 'xkcd — Munroe (2005)', 'Webtoon lanzamiento (2014)', 'Sarah Andersen en Instagram (2013)', 'Webtoon: 82 millones de usuarios (2023)'],
    obra: 'xkcd de Randall Munroe (2005) — el webcómic más influyente: ciencia, matemáticas y humor absurdo para millones',
    pregunta: '¿Están los webcómics democratizando la creación de cómics o fragmentando la industria?',
    contexto: "El webcómic nació en los años 90 con la web. xkcd de Munroe (2005) mezcla ciencia, matemáticas y humor; tiene más de 3.000 tiras. Webtoon (LINE, 2014) creó el formato vertical para móvil: scroll infinito. Sarah Andersen acumuló millones de seguidores en Instagram con \"Sarah's Scribbles\". Webtoon tiene 82 millones de usuarios y ha creado un modelo de negocio con suscripciones premium. La barrera de entrada desapareció.",
    color: '#1E90FF',
  },
  {
    id: 'ia_comics', nombre: 'Inteligencia Artificial y el Futuro del Cómic', anioInicio: 2022, anioFin: 2030, categoria: 'futuro',
    estilo: 'Cómic generado con IA',
    autores: ['Midjourney', 'Stable Diffusion', 'Adobe Firefly'],
    hitos: ['Midjourney v4 genera páginas de cómic (2022)', 'Comics con IA en concursos (2022)', 'Debate de autoría y derechos de autor', 'Adobe Firefly integrado en Photoshop (2023)', 'Primeros cómics comerciales con IA asistida'],
    obra: 'El cómic "Zarya of the Dawn" (2022) — primera obra con IA que generó debate legal sobre derechos de autor en EE.UU.',
    pregunta: '¿Reemplazará la IA a los dibujantes de cómics o se convertirá en una herramienta de amplificación creativa?',
    contexto: 'En 2022, Midjourney y Stable Diffusion demostraron que la IA podía generar páginas de cómic coherentes. "Zarya of the Dawn" (Kristina Kashtanova, 2022) fue el primer cómic con imágenes IA que la Oficina de Derechos de Autor de EE.UU. tuvo que dictaminar: registró el texto (humano) pero no las imágenes (IA). Los dibujantes protestaron. Adobe Firefly integró IA en Photoshop. El debate sobre autoría, trabajo y creatividad está abierto.',
    color: '#9932CC',
  },
  {
    id: 'nuevo_clasicismo', nombre: 'Renacimiento Gráfico del Siglo XXI', anioInicio: 2000, anioFin: 2025, categoria: 'novela_grafica',
    estilo: 'Novela gráfica del siglo XXI',
    autores: ['Alison Bechdel', 'Marjane Satrapi', 'Joe Sacco', 'David B.'],
    hitos: ['Persépolis — Satrapi (2000)', 'Fun Home — Bechdel (2006)', 'Palestina — Sacco (1993-1995)', 'La guerra eterna — Heller (2003)', 'Planeta a la venta — varios autores IA (2023)'],
    obra: 'Persépolis de Marjane Satrapi (2000) — la novela gráfica autobiográfica sobre la Revolución Iraní que ganó el mundo',
    pregunta: '¿Por qué la novela gráfica del siglo XXI encuentra en la autobiografía y el periodismo sus mejores herramientas?',
    contexto: 'Persépolis (2000) de la iraní Marjane Satrapi narró en blanco y negro la Revolución Islámica y el exilio: fue adaptada al cine de animación (2007). Fun Home de Alison Bechdel (2006) fue el primer musical de Broadway basado en una novela gráfica autobiográfica. Joe Sacco inventó el periodismo en cómics con Palestina (1993-95). La novela gráfica del XXI es el medio donde caben las historias que otros géneros rechazan.',
    color: '#2E8B57',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1827, evento: 'Töpffer publica la primera historieta gráfica con secuencia narrativa en Ginebra' },
  { anio: 1895, evento: 'Yellow Kid en el New York World — primer bocadillo de diálogo moderno y cómic de prensa masivo' },
  { anio: 1938, evento: 'Action Comics #1: Superman nace y lanza la Edad de Oro de los superhéroes' },
  { anio: 1954, evento: 'Comics Code Authority — la autocensura elimina el horror, el crimen y la crítica social del cómic americano' },
  { anio: 1962, evento: 'Spider-Man (Amazing Fantasy #15) — el superhéroe adolescente con problemas reales cambia la industria' },
  { anio: 1986, evento: 'Watchmen y El regreso del Caballero Oscuro — la novela gráfica adulta conquista la crítica literaria' },
  { anio: 1992, evento: 'Maus de Art Spiegelman gana el Pulitzer — el cómic es reconocido como literatura' },
  { anio: 2008, evento: 'Iron Man inaugura el MCU — el cómic se convierte en materia prima de Hollywood a escala global' },
  { anio: 2022, evento: 'La IA generativa crea páginas de cómic — debate legal sobre autoría y derechos de imagen' },
];

const ERAS: Era[] = [
  { nombre: 'Precursores y Prensa', desde: 1827, hasta: 1938, icono: '📰', descripcion: 'Töpffer inventa la historieta; las tiras de prensa llegan a millones cada mañana' },
  { nombre: 'Superhéroes y Censura', desde: 1938, hasta: 1961, icono: '🦸', descripcion: 'La Edad de Oro crea Superman y Batman; el Código casi destruye la industria' },
  { nombre: 'Revolución Marvel y Alternativas', desde: 1961, hasta: 1985, icono: '💥', descripcion: 'Stan Lee y Kirby reinventan el superhéroe; Europa y el underground toman su propio camino' },
  { nombre: 'Madurez: Novela Gráfica y Manga', desde: 1978, hasta: 2000, icono: '📚', descripcion: 'Watchmen, Maus y One Piece demuestran que el cómic puede ser literatura y fenómeno global' },
  { nombre: 'Cine y Webcómic', desde: 2000, hasta: 2020, icono: '🎬', descripcion: 'El MCU lleva los cómics al cine; Webtoon y xkcd nacen en internet' },
  { nombre: 'IA y Futuro del Cómic', desde: 2020, hasta: 9999, icono: '🤖', descripcion: 'La inteligencia artificial genera páginas, abre debates legales y redefine la creación' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  precursores: 'Precursores',
  periodico: 'Prensa',
  clasico: 'Clásico',
  golden_age: 'Golden Age',
  censura: 'Censura',
  silver_age: 'Silver Age',
  bronze_age: 'Bronze Age',
  europeo: 'Europeo',
  novela_grafica: 'Novela Gráfica',
  manga: 'Manga',
  independiente: 'Independiente',
  adaptacion: 'Adaptación',
  digital: 'Digital',
  futuro: 'IA/Futuro',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  precursores: '#8B4513',
  periodico: '#C8A000',
  clasico: '#DAA520',
  golden_age: '#FF4500',
  censura: '#696969',
  silver_age: '#A8A8A8',
  bronze_age: '#CD7F32',
  europeo: '#4169E1',
  novela_grafica: '#191970',
  manga: '#FF1493',
  independiente: '#FF6347',
  adaptacion: '#B8860B',
  digital: '#1E90FF',
  futuro: '#9932CC',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoComic }) {
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {periodo.anioFin}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Estilo narrativo</h4>
          <p className={styles.estiloTexto}>{periodo.estilo}</p>
          <h4 className={styles.detalleSubtitulo} style={{ marginTop: '0.75rem' }}>Hitos clave</h4>
          <ul className={styles.hitosList}>
            {periodo.hitos.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Autores clave</h4>
          <ul className={styles.artistasList}>
            {periodo.autores.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra icónica</span>
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

const AÑO_MIN = 1827;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoComic | null>(null);

  const filas: PeriodoComic[][] = [[], [], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin) + 4 <= anioAX(per.anioInicio)) {
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

  const marcadores: number[] = [1850, 1880, 1910, 1938, 1960, 1980, 2000, 2015];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 1827 hasta 2025.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia del cómic"
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
              const x = anioAX(per.anioInicio);
              const w = Math.max(anioAX(per.anioFin) - x, 10);
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
              <h4 className={styles.detalleSubtitulo}>Estilo narrativo</h4>
              <p className={styles.estiloTexto}>{periodo.estilo}</p>
              <h4 className={styles.detalleSubtitulo} style={{ marginTop: '0.75rem' }}>Hitos clave</h4>
              <ul className={styles.hitosList}>
                {periodo.hitos.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Autores clave</h4>
              <ul className={styles.artistasList}>
                {periodo.autores.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra icónica</span>
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
        per.autores.some((a) => a.toLowerCase().includes(termino)) ||
        per.estilo.toLowerCase().includes(termino);
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
        placeholder="Buscar por período, estilo o autor..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período del cómic"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Autor clave</th>
              <th>Obra icónica</th>
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
                <td>{per.autores[0]}</td>
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

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos del cómic y eventos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anioInicio < era.hasta && p.anioFin > era.desde
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

export default function VisualizadorHistoriaComics() {
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
        <h1 className={styles.heroTitle}>Historia del Cómic</h1>
        <p className={styles.heroSubtitle}>
          De Töpffer y el Yellow Kid hasta la IA generativa — 14 períodos con los estilos, autores y momentos clave que forjaron 200 años de historieta
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
        title="Guía completa sobre la historia del cómic"
        subtitle="Cómo la historieta evolucionó de tira de periódico a fenómeno cultural global"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 5 períodos clave de la historia del cómic</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Origen/País</th>
                <th>Formato</th>
                <th>Obra icónica</th>
                <th>Impacto cultural</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Prensa (1895–1938)</strong></td>
                <td>EE.UU. / Europa</td>
                <td>Tira diaria en periódico</td>
                <td>Little Nemo in Slumberland</td>
                <td>Primer medio visual de masas cotidiano</td>
              </tr>
              <tr>
                <td><strong>Golden Age (1938–1956)</strong></td>
                <td>EE.UU.</td>
                <td>Comic book de 10 centavos</td>
                <td>Action Comics #1 (Superman)</td>
                <td>Creación de los mitos pop del siglo XX</td>
              </tr>
              <tr>
                <td><strong>Manga (1952–hoy)</strong></td>
                <td>Japón</td>
                <td>Revista semanal y tankobon</td>
                <td>Astro Boy / One Piece</td>
                <td>40% del mercado editorial japonés; 520M copias One Piece</td>
              </tr>
              <tr>
                <td><strong>Novela Gráfica (1978–hoy)</strong></td>
                <td>EE.UU. / Europa</td>
                <td>Álbum de librería, tapa dura</td>
                <td>Watchmen / Maus (Pulitzer 1992)</td>
                <td>El cómic entra en la crítica literaria y la academia</td>
              </tr>
              <tr>
                <td><strong>Digital / Webtoon (2005–hoy)</strong></td>
                <td>Global (Korea, EE.UU.)</td>
                <td>Scroll vertical en móvil</td>
                <td>xkcd / Webtoon originals</td>
                <td>82M usuarios Webtoon; democratización total de la creación</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios */}
        <h3>Debates y escenarios del futuro del cómic</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
            <div>
              <strong>¿La IA reemplaza a los dibujantes?</strong>
              <p>Midjourney y Stable Diffusion ya generan páginas coherentes. El debate "Zarya of the Dawn" (2022) puso sobre la mesa la autoría legal. La respuesta más probable: la IA como herramienta de amplificación, no de sustitución total — como el color digital no eliminó al colorista.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎌</span>
            <div>
              <strong>¿Domina el manga globalmente?</strong>
              <p>En Europa y América Latina, el manga ya supera en ventas al cómic americano mainstream. Con 520 millones de copias de One Piece y plataformas como Shonen Jump+ en inglés, la hegemonía japonesa en el mercado global del cómic parece consolidarse.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📖</span>
            <div>
              <strong>¿El cómic puede ganar un Nobel de Literatura?</strong>
              <p>Maus ya ganó el Pulitzer. Persépolis fue nominada al Premio del Libro Americano. La academia literaria empieza a reconocer la novela gráfica como forma narrativa legítima. El Nobel de Literatura para un autor de cómic no es descartable en los próximos 20 años.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌐</span>
            <div>
              <strong>¿El metaverso de superhéroes es el futuro?</strong>
              <p>El MCU ya es el universo narrativo más interconectado de la historia del entretenimiento (31+ películas, series, cómics). Con la realidad aumentada y los videojuegos, los superhéroes podrían convertirse en el primer universo narrativo verdaderamente transmedia e interactivo a escala global.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre historia del cómic</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuándo se inventó el cómic y quién lo inventó?</strong>
            <p>Rodolphe Töpffer publicó en Ginebra en 1827 la primera historieta con secuencia narrativa. Wilhelm Busch llevó el medio a Alemania con Max und Moritz (1865). Richard Outcault inventó el bocadillo de diálogo moderno con Yellow Kid (1895) en el New York World. Los tres tienen razones para ser llamados "inventores" según la definición que se use.</p>
            <span className={styles.faqTip}>Curiosidad: Goethe vio los álbumes de Töpffer antes de morir y los elogió. El "inventor del cómic" tenía ya el reconocimiento del mayor literato alemán de su tiempo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué son exactamente el Golden Age, Silver Age y Bronze Age?</strong>
            <p>Son categorías historiográficas del cómic americano mainstream. El Golden Age (1938-1956) corresponde a la explosión de los superhéroes y las ventas millonarias. El Silver Age (1956-1970) es la reinvención psicológica de Marvel. El Bronze Age (1970-1985) introduce el compromiso social. Estas etiquetas no aplican al manga ni al cómic europeo, que tienen sus propias periodizaciones.</p>
            <span className={styles.faqTip}>Las fronteras son difusas: algunos historiadores sitúan el inicio del Silver Age en 1956 (Flash de Barry Allen), otros en 1961 (Fantastic Four). No hay consenso universal.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el manga tiene más lectores que el cómic americano?</strong>
            <p>Porque el manga es para todos: shonen (chicos jóvenes), shojo (chicas), seinen (adultos hombres), josei (adultas). El cómic americano durante décadas se enfocó casi exclusivamente en superhéroes para adolescentes masculinos. El manga cubre romance, gastronomía, deporte, samurái, ciencia ficción, horror y slice of life. Mayor variedad = mayor mercado.</p>
            <span className={styles.faqTip}>One Piece (1997) lleva vendidas 520 millones de copias. El récord de ventas del cómic americano más vendido de todos los tiempos es inferior a esa cifra en total acumulado.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia una novela gráfica de un comic book?</strong>
            <p>El comic book americano clásico es una publicación periódica de 24-32 páginas con cubierta de papel. La novela gráfica es un volumen completo y autoconclusivo (100-300+ páginas), generalmente de tapa dura y precio de libro, distribuida en librerías. La distinción es comercial y física, no necesariamente narrativa: Watchmen se publicó primero en 12 números de comic book y luego se recogió en volumen.</p>
            <span className={styles.faqTip}>Will Eisner acuñó el término "graphic novel" en 1978 con "A Contract with God" precisamente para diferenciarlo del comic book y acceder a las librerías literarias convencionales.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El Comics Code Authority destruyó el cómic americano?</strong>
            <p>Casi, pero no del todo. El Código (1954-2011) eliminó el horror, el crimen y la crítica social, obligando a los superhéroes como contenido dominante. Pero también impulsó la creatividad en respuesta: el underground comix (Crumb, 1968), la direct market de tiendas especializadas en los 80, y la novela gráfica surgieron como vías de escape al Código. La censura generó su propia contracorriente.</p>
            <span className={styles.faqTip}>Mad Magazine de EC Comics sobrevivió al Código convirtiéndose en revista satírica (no sujeta al Código, que solo regulaba cómics). La solución fue un cambio de formato, no de contenido.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Guía para iniciarse en el cómic: 5 pasos</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Elige tu punto de entrada según tus gustos</strong>
              <p>No empieces por el principio cronológico — empieza por lo que te interesa. ¿Te gusta la acción? Spider-Man o Naruto. ¿El humor? Astérix. ¿La literatura seria? Maus o Persépolis. ¿La ciencia? xkcd. El cómic es un medio, no un género: hay de todo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Lee al menos una obra de cada tradición</strong>
              <p>Americano, europeo y manga tienen lenguajes visuales diferentes. Leer un tomo de Astérix, un manga de Tezuka y un cómic de Marvel amplía radicalmente la comprensión del medio. Las convenciones que cada tradición da por supuestas son invisibles hasta que las comparas con las otras.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Estudia la gramática visual: viñeta, bocadillo, página</strong>
              <p>El cómic tiene un lenguaje propio. La viñeta es la unidad mínima; el bocadillo da voz; la transición entre viñetas es donde ocurre la magia narrativa. Scott McCloud en "Understanding Comics" (1993) explica este lenguaje con inigualable claridad — y lo hace en cómic.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Conecta cada obra con su contexto histórico</strong>
              <p>Superman (1938) es inseparable de la Gran Depresión y el auge del nazismo. Watchmen (1986) es inseparable de la Guerra Fría y la desconfianza en los héroes post-Watergate. El cómic siempre habla de su tiempo, aunque lo haga con capas y disfraces.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Explora el cómic independiente y autobiográfico</strong>
              <p>Maus, Persépolis, Fun Home, American Splendor — el cómic autobiográfico e independiente es donde el medio alcanza mayor densidad literaria. Son historias que ningún otro género narrativo contaría de la misma manera. Son el equivalente a la novela literaria frente al thriller de aeropuerto.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Consejos para leer cómics de diferentes tradiciones</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🇺🇸</span>
            <p>En el cómic americano de superhéroes, no intentes leer toda la continuidad desde el principio — es imposible. Lee arcos autoconclusivos o series de autor: "Watchmen", "El regreso del Caballero Oscuro", "Civil War". La continuidad compartida es un océano sin fondo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗼</span>
            <p>En el cómic europeo, empieza por Astérix o Tintín (los más accesibles), luego pasa a Corto Maltese o Los Incognitos. El álbum europeo está pensado como objeto completo: cada tomo tiene inicio, nudo y desenlace. No hay continuidades interminables.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🇯🇵</span>
            <p>El manga se lee de derecha a izquierda — dentro de cada página y dentro de cada viñeta. Tarda unas pocas páginas adaptarse. Empieza por mangas de volúmenes cortos (5-10 tomos) antes de comprometerte con series de 100+ volúmenes como One Piece o Detective Conan.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💻</span>
            <p>Los webcómics y Webtoon están diseñados para scroll vertical en móvil: las viñetas son tiras largas, no páginas. xkcd funciona mejor en escritorio por su humor referencial. Webtoon tiene un buscador potente por género — empieza por lo más popular de tu género favorito.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Nota sobre datos de ventas y rankings</strong>
          <ul>
            <li>Los <strong>datos de ventas y cifras de mercado</strong> son estimaciones de la industria (ICv2, Diamond Distribution, NPD BookScan). El mercado del cómic no tiene un registro oficial universal y las cifras varían según la fuente y el criterio (unidades vs. valor monetario).</li>
            <li>El <strong>ranking de obras y autores</strong> refleja el criterio editorial de meskeIA, no un canon oficial. La historia del cómic es un campo académico activo con debates permanentes sobre qué obras merecen considerarse fundacionales.</li>
            <li>Las <strong>edades del cómic americano</strong> (Golden, Silver, Bronze, Modern Age) son categorías historiográficas con fronteras difusas y sin consenso universal en las fechas exactas de transición.</li>
            <li>Las <strong>cifras de ventas del manga</strong> (especialmente One Piece) incluyen todas las ediciones y reimpresiones globales acumuladas desde el inicio de la publicación, no ventas anuales.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-comics')} />
      <ShareCard appName="visualizador-historia-comics" />
      <Footer appName="visualizador-historia-comics" />
    </div>
  );
}
