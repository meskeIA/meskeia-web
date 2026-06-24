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
  'visualizador-llm-funcionamiento': 'computacion',
  'simulador-sql-join': 'computacion',
  'simulador-planificador-procesos': 'computacion',
  'simulador-reemplazo-paginas': 'computacion',
  'simulador-recursion': 'computacion',
  'simulador-regresion': 'computacion',
  'simulador-kmeans': 'computacion',
  'simulador-puertas-logicas': 'computacion',
  'visualizador-estructuras-datos': 'computacion',
  'visualizador-logica-proposicional': 'computacion',
  'visualizador-teoria-informacion': 'computacion',
  'visualizador-arquitectura-computador': 'computacion',
  'simulador-hashing-colisiones': 'computacion',
  'simulador-cifrado-cesar': 'computacion',
  'simulador-tcp-handshake': 'computacion',
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
  // Química
  'simulador-equilibrio-quimico': 'quimica',
  'simulador-titulacion': 'quimica',
  'simulador-vsepr': 'quimica',
  'simulador-estequiometria': 'quimica',
  'simulador-cinetica-arrhenius': 'quimica',
  'simulador-tabla-periodica-tendencias': 'quimica',
  'visualizador-termodinamica-quimica': 'quimica',
  'visualizador-electroquimica': 'quimica',
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
  // Tierra y Espacio
  'visualizador-exoplanetas': 'tierra-espacio',
  'visualizador-terremotos-tsunamis': 'tierra-espacio',
  'visualizador-agujeros-negros': 'tierra-espacio',
  'visualizador-cosmologia': 'tierra-espacio',
  'visualizador-ciclo-carbono-completo': 'tierra-espacio',
  'visualizador-el-nino': 'tierra-espacio',
};

// Slugs de apps servidas bajo stemum.com (passthrough en el proxy).
export const STEMUM_APP_SLUGS = new Set(Object.keys(STEMUM_APP_DISCIPLINA));

// Rutas de páginas del portal (home + disciplinas) que el proxy reescribe a
// /stemum/*. La cadena vacía representa la home (stemum.com/).
export const STEMUM_PORTAL_SLUGS = new Set(['', ...Object.keys(STEMUM_DISCIPLINAS)]);

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
