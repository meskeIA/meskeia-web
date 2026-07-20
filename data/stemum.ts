/**
 * Catálogo del portal Stemum (stemum.com) — fuente única de verdad.
 *
 * Lo consumen:
 * - `proxy.ts` (host-rewrite): qué slugs son apps del catálogo y qué rutas son
 *   páginas de portal.
 * - `MeskeiaLogo` (breadcrumb): a qué disciplina pertenece la app actual.
 *
 * Para añadir una app a una oleada: añade su slug a la disciplina correspondiente.
 */

// Disciplinas del portal: slug de ruta → etiqueta visible.
export const STEMUM_DISCIPLINAS: Record<string, string> = {
  'computacion': 'Computación',
  'fisica': 'Física',
  'matematicas': 'Matemáticas',
  'quimica': 'Química',
  'biologia': 'Biología',
  'tierra-espacio': 'Tierra y Espacio',
};

// App (slug) → disciplina (slug). Las apps viven en meskeIA y se sirven bajo
// stemum.com en passthrough; este mapa da la pertenencia para el breadcrumb.
export const STEMUM_APP_DISCIPLINA: Record<string, string> = {
  // Computación
  'visualizador-algoritmos-ordenacion': 'computacion',
  'simulador-automatas-finitos': 'computacion',
  'simulador-maquina-turing': 'computacion',
  'simulador-grafos': 'computacion',
  'simulador-arboles-bst-avl': 'computacion',
  'simulador-arboles-b': 'computacion',
  'visualizador-llm-funcionamiento': 'computacion',
  'simulador-sql-join': 'computacion',
  'simulador-planificador-procesos': 'computacion',
  'simulador-concurrencia': 'computacion',
  'simulador-modelo-osi': 'computacion',
  'simulador-programacion-dinamica': 'computacion',
  'simulador-backtracking': 'computacion',
  'simulador-git-ramas': 'computacion',
  'simulador-reemplazo-paginas': 'computacion',
  'simulador-recursion': 'computacion',
  'simulador-regresion': 'computacion',
  'simulador-kmeans': 'computacion',
  'simulador-puertas-logicas': 'computacion',
  'calculadora-algebra-booleana': 'computacion',
  'visualizador-estructuras-datos': 'computacion',
  'visualizador-logica-proposicional': 'computacion',
  'visualizador-teoria-informacion': 'computacion',
  'visualizador-arquitectura-computador': 'computacion',
  'simulador-hashing-colisiones': 'computacion',
  'simulador-cifrado-cesar': 'computacion',
  'simulador-tcp-handshake': 'computacion',
  'visualizador-ia-redes-neuronales': 'computacion',
  'visualizador-computacion-cuantica': 'computacion',
  'simulador-ordenacion': 'computacion',
  'playground-sql': 'computacion',
  'simulador-pathfinding': 'computacion',
  'visualizador-ruido-perlin': 'computacion',
  'visualizador-espacios-color': 'computacion',
  'simulador-boids': 'computacion',
  'simulador-automatas-celulares': 'computacion',
  'visualizador-convolucion-kernels': 'computacion',
  'visualizador-iluminacion-phong': 'computacion',
  'visualizador-quadtree': 'computacion',
  // Física
  'simulador-campo-electrico': 'fisica',
  'simulador-pendulo': 'fisica',
  'simulador-colisiones': 'fisica',
  'simulador-ondas-interferencia': 'fisica',
  'simulador-gas-ideal': 'fisica',
  'visualizador-efecto-doppler': 'fisica',
  'simulador-proyectiles': 'fisica',
  'simulador-circuitos-electricos': 'fisica',
  'simulador-conservacion-energia': 'fisica',
  'simulador-lentes-opticas': 'fisica',
  'simulador-fluidos-bernoulli': 'fisica',
  'simulador-movimiento-circular': 'fisica',
  'simulador-mas-resorte': 'fisica',
  'visualizador-vuelo-avion': 'fisica',
  'visualizador-motor-electrico': 'fisica',
  'visualizador-relatividad-general': 'fisica',
  'visualizador-superconductividad': 'fisica',
  'visualizador-optica-ondulatoria': 'fisica',
  'visualizador-circuitos-electronicos': 'fisica',
  'visualizador-motor-combustion': 'fisica',
  'visualizador-radioactividad': 'fisica',
  'visualizador-optica': 'fisica',
  'visualizador-maquinas-simples': 'fisica',
  'visualizador-sonido-ondas': 'fisica',
  'visualizador-espectro-electromagnetico': 'fisica',
  'visualizador-energia-nuclear': 'fisica',
  'visualizador-relatividad-especial': 'fisica',
  'visualizador-mecanica-cuantica': 'fisica',
  'visualizador-particulas-subatomicas': 'fisica',
  'simulador-termodinamica-carnot': 'fisica',
  // Matemáticas
  'visualizador-calculo-visual': 'matematicas',
  'simulador-derivada-pendiente': 'matematicas',
  'simulador-integral-area': 'matematicas',
  'simulador-distribucion-normal': 'matematicas',
  'visualizador-transformada-fourier': 'matematicas',
  'simulador-monty-hall': 'matematicas',
  'simulador-teorema-central-limite': 'matematicas',
  'simulador-intervalos-confianza': 'matematicas',
  'simulador-test-hipotesis': 'matematicas',
  'simulador-teorema-bayes': 'matematicas',
  'simulador-funciones-transformaciones': 'matematicas',
  'visualizador-volumenes': 'matematicas',
  'visualizador-trigonometria': 'matematicas',
  'visualizador-geometria-analitica': 'matematicas',
  'visualizador-algebra-lineal': 'matematicas',
  'visualizador-ecuaciones-diferenciales': 'matematicas',
  'visualizador-numeros-complejos': 'matematicas',
  'visualizador-topologia': 'matematicas',
  'visualizador-combinatoria': 'matematicas',
  'visualizador-series-convergencia': 'matematicas',
  'visualizador-geometria-fractales': 'matematicas',
  'visualizador-numeros-primos': 'matematicas',
  'visualizador-estadistica-cotidiana': 'matematicas',
  'visualizador-estadistica-inferencial': 'matematicas',
  'simulador-trigonometria-circulo-unitario': 'matematicas',
  'visualizador-curvas-bezier': 'matematicas',
  'visualizador-funciones-easing': 'matematicas',
  // Química
  'simulador-equilibrio-quimico': 'quimica',
  'simulador-titulacion': 'quimica',
  'simulador-disoluciones': 'quimica',
  'simulador-vsepr': 'quimica',
  'simulador-estequiometria': 'quimica',
  'simulador-cinetica-arrhenius': 'quimica',
  'simulador-tabla-periodica-tendencias': 'quimica',
  'visualizador-termodinamica-quimica': 'quimica',
  'visualizador-electroquimica': 'quimica',
  'visualizador-carbono': 'quimica',
  'visualizador-cinetica-quimica': 'quimica',
  // Biología
  'simulador-lotka-volterra': 'biologia',
  'simulador-ecosistema-trofico': 'biologia',
  'visualizador-modelos-epidemiologicos': 'biologia',
  'simulador-deriva-genetica': 'biologia',
  'simulador-punnett': 'biologia',
  'simulador-mitosis-meiosis': 'biologia',
  'simulador-fotosintesis-factores': 'biologia',
  'visualizador-crispr-cas9': 'biologia',
  'visualizador-epigenetica': 'biologia',
  'visualizador-embriogenesis': 'biologia',
  'visualizador-microbiologia': 'biologia',
  'visualizador-evolucion-humana': 'biologia',
  'visualizador-evolucion-molecular': 'biologia',
  'simulador-potencial-accion': 'biologia',
  // Tierra y Espacio
  'visualizador-exoplanetas': 'tierra-espacio',
  'visualizador-terremotos-tsunamis': 'tierra-espacio',
  'visualizador-agujeros-negros': 'tierra-espacio',
  'visualizador-cosmologia': 'tierra-espacio',
  'visualizador-ciclo-carbono-completo': 'tierra-espacio',
  'visualizador-el-nino': 'tierra-espacio',
  'visualizador-vida-estrella': 'tierra-espacio',
  'visualizador-sistema-solar': 'tierra-espacio',
  'visualizador-ciclo-nitrogeno': 'tierra-espacio',
};

/**
 * MATERIAL DE APOYO — contenedor subordinado del portal.
 *
 * Piezas de CONSULTA (tablas, formularios y, en el futuro, glosarios) que
 * acompañan a los simuladores sin formar parte del catálogo: no se tocan ni se
 * ajustan, se consultan. Por eso viven fuera de STEMUM_APP_DISCIPLINA — no
 * cuentan como simuladores en el hero ni ensucian las páginas de disciplina,
 * que prometen manipulación en tiempo real.
 *
 * Criterio de admisión: buscador SIEMPRE, más al menos una capa que un PDF no
 * puede dar. Esa capa cambia según la disciplina — demostración en matemáticas,
 * ejemplo real o formulador en química, equivalencias y orden de magnitud en
 * física— así que no se exige "demostración" literalmente. Una lista plana sin
 * ninguna de esas capas se queda en meskeIA y no entra aquí.
 *
 * `disciplina` no sirve para clasificar la sección (es una lista única), solo
 * para el breadcrumb de MeskeiaLogo y el enlace al pie de cada disciplina.
 */
export type MaterialApoyo = {
  slug: string;
  icon: string;
  titulo: string;
  desc: string;
  disciplina: string;
};

export const STEMUM_MATERIAL_APOYO: MaterialApoyo[] = [
  {
    slug: 'tabla-derivadas',
    icon: '📐',
    titulo: 'Tabla de derivadas',
    desc: 'Todas las fórmulas con buscador, regla de la cadena y un ejemplo resuelto en cada una.',
    disciplina: 'matematicas',
  },
  {
    slug: 'tabla-integrales',
    icon: '∫',
    titulo: 'Tabla de integrales',
    desc: 'Integrales inmediatas y métodos de integración, con la constante siempre presente.',
    disciplina: 'matematicas',
  },
  {
    slug: 'tabla-valencias',
    icon: '⚗️',
    titulo: 'Tabla de valencias',
    desc: 'Números de oxidación de cada elemento, las tres nomenclaturas IUPAC y formulador de compuestos.',
    disciplina: 'quimica',
  },
  {
    slug: 'tabla-areas-volumenes',
    icon: '📐',
    titulo: 'Tabla de áreas y volúmenes',
    desc: '48 figuras planas y cuerpos geométricos con su diagrama, las letras explicadas y un ejemplo numérico resuelto.',
    disciplina: 'matematicas',
  },
  {
    slug: 'tabla-limites-notables',
    icon: '♾️',
    titulo: 'Tabla de límites notables',
    desc: 'Límites notables, las 7 indeterminaciones y las equivalencias infinitesimales, con justificación y ejemplo.',
    disciplina: 'matematicas',
  },
  {
    slug: 'tabla-unidades-si',
    icon: '📏',
    titulo: 'Tabla de unidades del SI',
    desc: 'Las 7 básicas, las 22 derivadas descompuestas a unidades básicas, los 24 prefijos y las unidades aceptadas.',
    disciplina: 'fisica',
  },
  {
    slug: 'tabla-constantes-fisicas',
    icon: '🔬',
    titulo: 'Tabla de constantes físicas',
    desc: 'Constantes fundamentales con valores CODATA 2022, la fórmula donde aparecen y si son exactas o medidas.',
    disciplina: 'fisica',
  },
  {
    slug: 'tabla-solubilidad',
    icon: '🧪',
    titulo: 'Tabla de solubilidad',
    desc: 'Reglas y excepciones, iones poliatómicos, valores de Kps y un comprobador de precipitación catión×anión.',
    disciplina: 'quimica',
  },
  {
    slug: 'tabla-grupos-funcionales',
    icon: '⚛️',
    titulo: 'Tabla de grupos funcionales',
    desc: 'Fórmula, sufijo y prefijo IUPAC, diagrama y orden de prioridad ordenable para saber cuál manda al nombrar.',
    disciplina: 'quimica',
  },
  {
    slug: 'tabla-potenciales-redox',
    icon: '🔋',
    titulo: 'Tabla de potenciales redox',
    desc: '69 semirreacciones E°, serie de actividad de los metales y constructor de pilas que calcula E°pila, ΔG° y K.',
    disciplina: 'quimica',
  },
  {
    slug: 'tabla-ka-kb',
    icon: '🧫',
    titulo: 'Tabla de Ka y Kb',
    desc: 'Constantes de acidez y basicidad a 25 °C, con calculadora de pH y de disolución reguladora.',
    disciplina: 'quimica',
  },
];

// Slug → disciplina, para el breadcrumb del material de apoyo.
export const STEMUM_MATERIAL_DISCIPLINA: Record<string, string> =
  Object.fromEntries(STEMUM_MATERIAL_APOYO.map((m) => [m.slug, m.disciplina]));

// Material de apoyo de una disciplina (enlace al pie de su página).
export function materialDeDisciplina(disciplina: string): MaterialApoyo[] {
  return STEMUM_MATERIAL_APOYO.filter((m) => m.disciplina === disciplina);
}

// Slugs de apps servidas bajo stemum.com (passthrough en el proxy). Incluye el
// material de apoyo: se sirve bajo el dominio aunque no cuente como simulador.
export const STEMUM_APP_SLUGS = new Set([
  ...Object.keys(STEMUM_APP_DISCIPLINA),
  ...STEMUM_MATERIAL_APOYO.map((m) => m.slug),
]);

// Rutas de páginas del portal (home + disciplinas + material de apoyo) que el
// proxy reescribe a /stemum/*. La cadena vacía representa la home (stemum.com/).
export const STEMUM_MATERIAL_SLUG = 'material-apoyo';

export const STEMUM_PORTAL_SLUGS = new Set([
  '',
  ...Object.keys(STEMUM_DISCIPLINAS),
  STEMUM_MATERIAL_SLUG,
]);

// Conteos derivados automáticamente del catálogo (para los contadores de la
// home y del hero). Al añadir una app a STEMUM_APP_DISCIPLINA se actualizan solos.
export const STEMUM_APPS_POR_DISCIPLINA: Record<string, number> = Object.values(
  STEMUM_APP_DISCIPLINA,
).reduce<Record<string, number>>((acc, disciplina) => {
  acc[disciplina] = (acc[disciplina] ?? 0) + 1;
  return acc;
}, {});

// Total de apps publicadas en el portal.
export const STEMUM_TOTAL_APPS = Object.keys(STEMUM_APP_DISCIPLINA).length;
