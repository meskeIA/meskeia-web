/**
 * Puertas de entrada de Cronicum (vertical de Historia).
 *
 * Doble eje de navegación sobre las 148 cronologías de `data/historias/`:
 *  - grupo 'mundo'         → civilizaciones, países y regiones (6 puertas)
 *  - grupo 'cosas'         → la historia temática / "de las cosas" (5 puertas)
 *  - grupo 'acontecimientos' → banda transversal de grandes hechos (1 puerta)
 *
 * Cada cronología (slug de `data/historias/index.ts`) se asigna a EXACTLY una
 * puerta. Si se añade una cronología nueva, asígnala aquí a su puerta.
 */

export interface Puerta {
  slug: string;            // slug de la puerta (URL: cronicum.com/<slug>)
  titulo: string;
  icono: string;
  descripcion: string;
  grupo: 'mundo' | 'cosas' | 'acontecimientos';
  slugs: string[];         // slugs de cronologías (claves de data/historias)
}

export const PUERTAS: Puerta[] = [
  // ───────────────────────── Eje 1 — El mundo ─────────────────────────
  {
    slug: 'mundo-antiguo',
    titulo: 'Mundo Antiguo',
    icono: '🏛️',
    descripcion:
      'Las civilizaciones que pusieron los cimientos: Grecia, Roma, Egipto, Mesopotamia, Persia, Bizancio y los orígenes de la humanidad.',
    grupo: 'mundo',
    slugs: [
      'grecia', 'roma', 'egipto', 'mesopotamia', 'imperio-persa',
      'historia-bizancio', 'historia-islam-clasico', 'espana-antigua', 'historia-prehistoria',
    ],
  },
  {
    slug: 'asia',
    titulo: 'Asia',
    icono: '🏯',
    descripcion:
      'Milenios de historia oriental: China, Japón, India, Corea, el Sudeste Asiático y los grandes imperios otomano y mongol.',
    grupo: 'mundo',
    slugs: [
      'japon', 'china-dinastias', 'historia-india', 'historia-china-moderna',
      'historia-japon-moderno', 'corea', 'sudeste-asiatico', 'historia-oriente-medio',
      'otomano', 'mongol',
    ],
  },
  {
    slug: 'europa',
    titulo: 'Europa',
    icono: '🏰',
    descripcion:
      'De la Edad Media a la época contemporánea: reinos, imperios y naciones europeas, incluida la historia de España por etapas.',
    grupo: 'mundo',
    slugs: [
      'espana-medieval', 'edad-media-europea', 'historia-rusia', 'historia-reino-unido',
      'historia-vikingos', 'historia-alemania', 'historia-italia', 'historia-francia-contemporanea',
      'espana-austrias', 'espana-borbones', 'espana-contemporanea', 'historia-austria-hungria',
      'historia-portugal-ultramar', 'escandinavia', 'paises-bajos', 'polonia',
    ],
  },
  {
    slug: 'america',
    titulo: 'América',
    icono: '🌎',
    descripcion:
      'De la conquista a los países modernos: Estados Unidos, Canadá y toda Latinoamérica, país a país.',
    grupo: 'mundo',
    slugs: [
      'historia-eeuu', 'canada', 'historia-america-latina', 'historia-conquista-america',
      'brasil-moderno', 'mexico-moderno', 'argentina', 'colombia', 'chile', 'peru',
      'ecuador', 'bolivia', 'paraguay',
      'cuba', 'venezuela', 'uruguay', 'centroamerica', 'republica-dominicana', 'puerto-rico',
    ],
  },
  {
    slug: 'precolombinas',
    titulo: 'Civilizaciones precolombinas',
    icono: '🗿',
    descripcion:
      'Las grandes culturas de América antes de 1492: mayas, aztecas, incas, olmecas y toltecas.',
    grupo: 'mundo',
    slugs: ['civilizaciones-precolombinas', 'maya', 'azteca', 'inca', 'olmeca', 'tolteca'],
  },
  {
    slug: 'africa-oceania',
    titulo: 'África y Oceanía',
    icono: '🌍',
    descripcion:
      'El continente africano y el mundo del Pacífico: una historia menos contada y en expansión.',
    grupo: 'mundo',
    slugs: [
      'historia-africa', 'imperios-africa-occidental', 'etiopia-aksum', 'gran-zimbabue',
      'reino-kongo', 'reino-benin', 'imperio-oyo',
      'australia', 'nueva-zelanda', 'pueblos-pacifico',
    ],
  },

  // ─────────────────── Eje 2 — La historia de las cosas ───────────────────
  {
    slug: 'ciencia-tecnologia',
    titulo: 'Ciencia y tecnología',
    icono: '🔬',
    descripcion:
      'Cómo avanzó el conocimiento: astronomía, física, matemáticas, medicina, electricidad, energía, robótica e inteligencia artificial.',
    grupo: 'cosas',
    slugs: [
      'astronomia', 'fisica', 'matematicas', 'quimica', 'medicina',
      'historia-medicina-contemporanea', 'historia-ciencia-espanola', 'historia-descubrimientos-cientificos',
      'historia-electricidad', 'energia', 'clima', 'robotica', 'historia-inteligencia-artificial',
      'viajes-espaciales', 'cartografia', 'estadistica',
    ],
  },
  {
    slug: 'comunicacion-digital',
    titulo: 'Comunicación y mundo digital',
    icono: '📡',
    descripcion:
      'De la imprenta y la radio a internet, los ordenadores, los videojuegos y las redes sociales.',
    grupo: 'cosas',
    slugs: [
      'internet', 'ordenadores', 'telefono', 'radio', 'television', 'silicon-valley',
      'redes-sociales', 'criptomonedas', 'videojuegos', 'videojuegos-espanoles',
      'historia-videojuegos-japoneses', 'prensa', 'historia-periodismo', 'publicidad',
      'diccionarios-enciclopedias', 'idiomas-mundo',
    ],
  },
  {
    slug: 'arte-cultura',
    titulo: 'Arte, cultura y deporte',
    icono: '🎭',
    descripcion:
      'Cine, música, arquitectura, moda, fotografía, teatro, danza y la historia del deporte.',
    grupo: 'cosas',
    slugs: [
      'cine', 'comics', 'danza', 'teatro', 'moda', 'moda-espanola', 'fotografia',
      'arquitectura-espanola', 'historia-arquitectura-moderna', 'historia-musica-popular',
      'psicologia', 'deporte', 'historia-futbol', 'historia-ocio', 'historia-turismo',
    ],
  },
  {
    slug: 'economia-ideas',
    titulo: 'Economía, derecho e ideas',
    icono: '⚖️',
    descripcion:
      'Banca, capitalismo, comercio, trabajo, agricultura, constituciones, derecho y pensamiento político.',
    grupo: 'cosas',
    slugs: [
      'banca', 'economia-espana', 'historia-economia-mundial', 'historia-capitalismo',
      'historia-comercio', 'historia-trabajo', 'historia-agricultura', 'historia-pensamiento-politico',
      'historia-constituciones', 'historia-derecho', 'historia-etica', 'historia-derechos-humanos',
      'historia-educacion',
    ],
  },
  {
    slug: 'vida-cotidiana',
    titulo: 'Vida cotidiana y salud',
    icono: '🏺',
    descripcion:
      'Gastronomía, vivienda, urbanismo, transporte, epidemias y salud pública a lo largo del tiempo.',
    grupo: 'cosas',
    slugs: [
      'gastronomia', 'chocolate', 'azucar', 'especias-rutas-comerciales', 'urbanismo',
      'vivienda', 'vejez-longevidad', 'epidemias', 'higiene-salud-publica',
      'aviacion', 'automocion', 'tren',
    ],
  },

  // ─────────────── Eje 3 — Grandes acontecimientos (transversal) ───────────────
  {
    slug: 'grandes-acontecimientos',
    titulo: 'Grandes acontecimientos',
    icono: '📜',
    descripcion:
      'Los momentos que cambiaron el rumbo de la humanidad: revoluciones, guerras mundiales, el Renacimiento, la Reforma, las Cruzadas y la Ilustración.',
    grupo: 'acontecimientos',
    slugs: [
      'revolucion-francesa', 'guerras-napoleonicas', 'primera-guerra-mundial',
      'segunda-guerra-mundial', 'historia-guerra-fria', 'renacimiento', 'la-reforma',
      'las-cruzadas', 'ilustracion', 'historia-union-europea', 'exploracion',
      'revolucion-industrial', 'revolucion-cientifica', 'descolonizacion',
      'revolucion-rusa', 'gran-depresion', 'independencias-hispanoamericanas',
      'peste-negra', 'caida-imperio-romano', 'caida-constantinopla',
      'revoluciones-1848', 'independencia-eeuu', 'guerra-civil-espanola',
    ],
  },
];

const PUERTA_POR_SLUG = new Map(PUERTAS.map((p) => [p.slug, p]));

/** Devuelve la puerta cuyo slug coincide, o null si no es una puerta. */
export function getPuerta(slug: string): Puerta | null {
  return PUERTA_POR_SLUG.get(slug) ?? null;
}

/** Slugs de todas las puertas (para generateStaticParams). */
export function getAllPuertaSlugs(): string[] {
  return PUERTAS.map((p) => p.slug);
}

// Mapa inverso cronología → puerta (para migas de pan / cross-linking).
const PUERTA_POR_CRONOLOGIA = new Map<string, Puerta>();
for (const p of PUERTAS) {
  for (const s of p.slugs) PUERTA_POR_CRONOLOGIA.set(s, p);
}

/** Devuelve la puerta a la que pertenece una cronología, o null. */
export function getPuertaDeCronologia(slug: string): Puerta | null {
  return PUERTA_POR_CRONOLOGIA.get(slug) ?? null;
}

/**
 * Conteo de cronologías por puerta (slug de puerta → nº). Derivado del
 * catálogo: al añadir una cronología a su puerta, el contador de la home se
 * actualiza solo (mismo patrón que STEMUM_APPS_POR_DISCIPLINA).
 */
export const CRONOLOGIAS_POR_PUERTA: Record<string, number> = Object.fromEntries(
  PUERTAS.map((p) => [p.slug, p.slugs.length]),
);

/**
 * Total de cronologías ÚNICAS del portal (para el badge del hero). Se calcula
 * sobre el conjunto de slugs sin duplicar: aunque cada cronología pertenece a
 * una sola puerta, esto evita que el total mienta si eso cambiara.
 */
export const CRONICUM_TOTAL_CRONOLOGIAS = new Set(
  PUERTAS.flatMap((p) => p.slugs),
).size;
