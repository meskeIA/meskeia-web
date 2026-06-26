/**
 * Catálogo del portal Coquinum (coquinum.com) — fuente única de verdad.
 *
 * Lo consumen:
 * - `proxy.ts` (host-rewrite): qué slugs son apps del catálogo (passthrough) y
 *   qué rutas son páginas de portal (reescritura a /coquinum/*).
 * - `MeskeiaLogo` (breadcrumb): a qué categoría pertenece la app actual cuando se
 *   sirve bajo coquinum.com.
 * - `DescubreVertical`: banda meskeIA → Coquinum para apps gastro vistas en
 *   meskeia.com.
 *
 * Para añadir una app a una categoría: añade su slug a COQUINUM_APP_CATEGORIA y
 * crea su tarjeta en la página de categoría correspondiente.
 *
 * Curaduría Fase 1 (2026-06-26): 5 categorías pobladas con apps existentes (36).
 * Los bloques roadmap (cocción/temperatura, conservación, food cost) se añadirán
 * cuando existan las apps; ver GASTRONOMIA.md.
 */

// Categorías del portal: slug de ruta → etiqueta visible.
export const COQUINUM_CATEGORIAS: Record<string, string> = {
  'panaderia-reposteria': 'Panadería y repostería',
  'cocina-recetas': 'Cocina y recetas',
  'medidas-conversiones': 'Medidas y conversiones',
  'coccion': 'Cocción y temperatura',
  'costes-cocina': 'Costes y escandallo',
  'ingredientes-despensa': 'Ingredientes y despensa',
  'bebidas': 'Bebidas',
  'cultura-gastronomica': 'Cultura gastronómica',
};

// App (slug) → categoría (slug). Las apps viven en meskeIA y se sirven bajo
// coquinum.com en passthrough; este mapa da la pertenencia para el breadcrumb.
export const COQUINUM_APP_CATEGORIA: Record<string, string> = {
  // Panadería y repostería (el foso técnico)
  'calculadora-porcentaje-panadero': 'panaderia-reposteria',
  'calculadora-hidratacion-pan': 'panaderia-reposteria',
  'calculadora-masa-madre': 'panaderia-reposteria',
  'calculadora-temperatura-masa': 'panaderia-reposteria',
  'calculadora-ganache': 'panaderia-reposteria',
  'calculadora-gelatina': 'panaderia-reposteria',
  'calculadora-puntos-azucar': 'panaderia-reposteria',
  'calculadora-masa-pizza': 'panaderia-reposteria',
  'fermentacion-temperatura': 'panaderia-reposteria',
  'guia-tipos-pan': 'panaderia-reposteria',
  // Cocina y recetas (calculadoras generales + planificación)
  'calculadora-cocina': 'cocina-recetas',
  'escalador-recetas': 'cocina-recetas',
  'planificador-menu': 'cocina-recetas',
  'selector-dieta': 'cocina-recetas',
  // Medidas y conversiones (la cuña LATAM: el foso técnico de precisión)
  'conversor-tazas-gramos': 'medidas-conversiones',
  'ajuste-recetas-altitud': 'medidas-conversiones',
  'conversor-temperatura-horno': 'medidas-conversiones',
  'sustituciones-ingredientes': 'medidas-conversiones',
  // Cocción y temperatura (seguridad y punto)
  'temperatura-coccion-carne': 'coccion',
  'tiempos-coccion': 'coccion',
  // Costes y escandallo (ala B2B / hostelería)
  'escandallo-food-cost': 'costes-cocina',
  'calculadora-merma': 'costes-cocina',
  // Ingredientes y despensa (producto: cómo elegir y usar)
  'guia-aceite-oliva': 'ingredientes-despensa',
  'guia-cortes-carne': 'ingredientes-despensa',
  'guia-especias': 'ingredientes-despensa',
  'guia-hierbas-aromaticas': 'ingredientes-despensa',
  'guia-quesos': 'ingredientes-despensa',
  'guia-setas': 'ingredientes-despensa',
  'guia-frutas-exoticas': 'ingredientes-despensa',
  'guia-vinagres-mundo': 'ingredientes-despensa',
  'guia-tipos-arroz': 'ingredientes-despensa',
  'guia-tipos-pasta': 'ingredientes-despensa',
  'guia-superalimentos': 'ingredientes-despensa',
  'aditivos-e-alimentarios': 'ingredientes-despensa',
  // Bebidas (todo el ala líquida)
  'guia-cafe': 'bebidas',
  'guia-te': 'bebidas',
  'guia-infusiones': 'bebidas',
  'guia-cocteles': 'bebidas',
  'guia-estilos-cerveza': 'bebidas',
  'guia-varietales-vino': 'bebidas',
  'que-vino-elegir': 'bebidas',
  'que-cerveza-elegir': 'bebidas',
  // Cultura gastronómica (visualizadores temáticos)
  'visualizador-mapa-especias': 'cultura-gastronomica',
  'visualizador-viaje-comida': 'cultura-gastronomica',
  'visualizador-huella-alimentos': 'cultura-gastronomica',
  'visualizador-digestion-nutrientes': 'cultura-gastronomica',
};

// Slugs de apps servidas bajo coquinum.com (passthrough en el proxy).
export const COQUINUM_APP_SLUGS = new Set(Object.keys(COQUINUM_APP_CATEGORIA));

// Rutas de páginas del portal (home + categorías) que el proxy reescribe a
// /coquinum/*. La cadena vacía representa la home (coquinum.com/).
export const COQUINUM_PORTAL_SLUGS = new Set(['', ...Object.keys(COQUINUM_CATEGORIAS)]);

// Conteos derivados automáticamente del catálogo (para los contadores de la
// home y del hero). Al añadir una app a COQUINUM_APP_CATEGORIA se actualizan solos.
export const COQUINUM_APPS_POR_CATEGORIA: Record<string, number> = Object.values(
  COQUINUM_APP_CATEGORIA,
).reduce<Record<string, number>>((acc, categoria) => {
  acc[categoria] = (acc[categoria] ?? 0) + 1;
  return acc;
}, {});

// Total de apps publicadas en el portal.
export const COQUINUM_TOTAL_APPS = Object.keys(COQUINUM_APP_CATEGORIA).length;
