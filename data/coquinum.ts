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
 * cuando existan las apps; ver _private/GASTRONOMIA.md.
 */

// Categorías del portal: slug de ruta → etiqueta visible.
export const COQUINUM_CATEGORIAS: Record<string, string> = {
  'panaderia-reposteria': 'Panadería y repostería',
  'cocina-recetas': 'Cocina y recetas',
  'medidas-conversiones': 'Medidas y conversiones',
  'coccion': 'Cocción y temperatura',
  'conservacion': 'Conservación',
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
  'calculadora-almibar': 'panaderia-reposteria',
  'calculadora-merengue': 'panaderia-reposteria',
  'calculadora-crema-pastelera': 'panaderia-reposteria',
  'calculadora-macarons': 'panaderia-reposteria',
  'calculadora-royal-icing': 'panaderia-reposteria',
  'guia-tipos-pan': 'panaderia-reposteria',
  // Cocina y recetas (calculadoras generales + planificación)
  'calculadora-cocina': 'cocina-recetas',
  'escalador-recetas': 'cocina-recetas',
  'planificador-menu': 'cocina-recetas',
  'selector-dieta': 'cocina-recetas',
  'cantidades-evento': 'cocina-recetas',
  'asado-personas': 'cocina-recetas',
  // Medidas y conversiones (la cuña LATAM: el foso técnico de precisión)
  'conversor-tazas-gramos': 'medidas-conversiones',
  'ajuste-recetas-altitud': 'medidas-conversiones',
  'conversor-temperatura-horno': 'medidas-conversiones',
  'sustituciones-ingredientes': 'medidas-conversiones',
  'conversor-moldes': 'medidas-conversiones',
  'medidas-a-ojo': 'medidas-conversiones',
  'densidad-liquidos': 'medidas-conversiones',
  // Cocción y temperatura (seguridad y punto)
  'temperatura-coccion-carne': 'coccion',
  'tiempos-coccion': 'coccion',
  'conversor-horno-airfryer': 'coccion',
  'tiempos-asado': 'coccion',
  'sous-vide': 'coccion',
  'calculadora-salmuera': 'coccion',
  'huevo-perfecto': 'coccion',
  // Conservación (seguridad alimentaria y duración)
  'calculadora-caducidad': 'conservacion',
  'calculadora-congelacion': 'conservacion',
  'descongelacion-segura': 'conservacion',
  'calculadora-mermelada': 'conservacion',
  'calculadora-encurtidos': 'conservacion',
  'fermentados-vegetales': 'conservacion',
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
  'guia-chiles': 'ingredientes-despensa',
  'guia-harinas': 'ingredientes-despensa',
  'guia-tipos-sal': 'ingredientes-despensa',
  'guia-chocolate': 'ingredientes-despensa',
  'guia-azucares': 'ingredientes-despensa',
  'guia-tuberculos-latam': 'ingredientes-despensa',
  'guia-maices': 'ingredientes-despensa',
  'calendario-temporada': 'ingredientes-despensa',
  // Bebidas (todo el ala líquida)
  'ratio-cafe': 'bebidas',
  'escalado-cocteles': 'bebidas',
  'aguas-frescas': 'bebidas',
  'maridaje': 'bebidas',
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

// Nombre e icono de cada app del portal, para el bloque "Más de [categoría]" que
// se muestra al pie de cada app bajo coquinum.com (navegación interna verde, en
// lugar de dejar al visitante en un callejón sin salida). Generado desde
// data/applications.ts; mantener sincronizado si cambia el nombre o el icono.
export interface CoquinumAppInfo {
  nombre: string;
  icon: string;
}

export const COQUINUM_APP_INFO: Record<string, CoquinumAppInfo> = {
  'calculadora-porcentaje-panadero': { nombre: 'Porcentaje del panadero', icon: '🥖' },
  'calculadora-hidratacion-pan': { nombre: 'Hidratación del pan', icon: '💧' },
  'calculadora-masa-madre': { nombre: 'Sustitución por masa madre', icon: '🦠' },
  'calculadora-temperatura-masa': { nombre: 'Temperatura de la masa', icon: '🌡️' },
  'calculadora-ganache': { nombre: 'Ganache de chocolate', icon: '🍫' },
  'calculadora-gelatina': { nombre: 'Sustitución de gelatina', icon: '🟡' },
  'calculadora-puntos-azucar': { nombre: 'Puntos del azúcar', icon: '🍬' },
  'calculadora-masa-pizza': { nombre: 'Masa de pizza', icon: '🍕' },
  'fermentacion-temperatura': { nombre: 'Fermentación por temperatura', icon: '⏳' },
  'calculadora-almibar': { nombre: 'Almíbar', icon: '🍯' },
  'calculadora-merengue': { nombre: 'Merengue', icon: '🍥' },
  'calculadora-crema-pastelera': { nombre: 'Crema pastelera', icon: '🍮' },
  'calculadora-macarons': { nombre: 'Macarons', icon: '🌈' },
  'calculadora-royal-icing': { nombre: 'Glaseado real', icon: '🎨' },
  'guia-tipos-pan': { nombre: 'Tipos de pan', icon: '🍞' },
  'calculadora-cocina': { nombre: 'Calculadora de cocina', icon: '🍳' },
  'escalador-recetas': { nombre: 'Escalador de recetas', icon: '⚖️' },
  'planificador-menu': { nombre: 'Planificador de menú', icon: '📅' },
  'selector-dieta': { nombre: 'Selector de dieta', icon: '🥗' },
  'cantidades-evento': { nombre: 'Cantidades para un evento', icon: '🎉' },
  'asado-personas': { nombre: 'Carne para un asado', icon: '🍖' },
  'escalado-cocteles': { nombre: 'Escalado de cócteles', icon: '🍸' },
  'aguas-frescas': { nombre: 'Aguas frescas y limonada', icon: '🍋' },
  'maridaje': { nombre: 'Maridaje de comida', icon: '🍷' },
  'conversor-tazas-gramos': { nombre: 'Tazas a gramos', icon: '🥄' },
  'ajuste-recetas-altitud': { nombre: 'Ajuste por altitud', icon: '⛰️' },
  'conversor-temperatura-horno': { nombre: 'Temperatura de horno', icon: '🌡️' },
  'sustituciones-ingredientes': { nombre: 'Sustituciones de ingredientes', icon: '🔄' },
  'conversor-moldes': { nombre: 'Conversor de moldes', icon: '⭕' },
  'medidas-a-ojo': { nombre: 'Medidas a ojo', icon: '🤏' },
  'densidad-liquidos': { nombre: 'Conversor de líquidos', icon: '💧' },
  'temperatura-coccion-carne': { nombre: 'Temperatura de cocción', icon: '🌡️' },
  'tiempos-coccion': { nombre: 'Tiempos de cocción', icon: '⏱️' },
  'conversor-horno-airfryer': { nombre: 'Horno → freidora de aire', icon: '🌀' },
  'tiempos-asado': { nombre: 'Tiempos de asado', icon: '🍗' },
  'sous-vide': { nombre: 'Sous-vide', icon: '♨️' },
  'calculadora-salmuera': { nombre: 'Salmuera (brining)', icon: '🧂' },
  'huevo-perfecto': { nombre: 'El huevo perfecto', icon: '🥚' },
  'calculadora-caducidad': { nombre: 'Cuánto dura cada alimento', icon: '🧊' },
  'calculadora-congelacion': { nombre: 'Qué se puede congelar', icon: '❄️' },
  'descongelacion-segura': { nombre: 'Descongelación segura', icon: '🧊' },
  'calculadora-mermelada': { nombre: 'Mermelada', icon: '🍓' },
  'calculadora-encurtidos': { nombre: 'Encurtidos', icon: '🥒' },
  'fermentados-vegetales': { nombre: 'Fermentados vegetales', icon: '🥬' },
  'escandallo-food-cost': { nombre: 'Escandallo y food cost', icon: '💼' },
  'calculadora-merma': { nombre: 'Calculadora de merma', icon: '📉' },
  'ratio-cafe': { nombre: 'Ratio de café', icon: '☕' },
  'guia-aceite-oliva': { nombre: 'Aceite de oliva', icon: '🫒' },
  'guia-cortes-carne': { nombre: 'Cortes de carne', icon: '🥩' },
  'guia-especias': { nombre: 'Especias', icon: '🌿' },
  'guia-hierbas-aromaticas': { nombre: 'Hierbas aromáticas', icon: '🌿' },
  'guia-quesos': { nombre: 'Quesos', icon: '🧀' },
  'guia-setas': { nombre: 'Setas', icon: '🍄' },
  'guia-frutas-exoticas': { nombre: 'Frutas exóticas', icon: '🍑' },
  'guia-vinagres-mundo': { nombre: 'Vinagres del mundo', icon: '🧪' },
  'guia-tipos-arroz': { nombre: 'Tipos de arroz', icon: '🍚' },
  'guia-tipos-pasta': { nombre: 'Tipos de pasta', icon: '🍝' },
  'guia-superalimentos': { nombre: 'Superalimentos', icon: '🥗' },
  'aditivos-e-alimentarios': { nombre: 'Aditivos E alimentarios', icon: '🏷️' },
  'guia-chiles': { nombre: 'Chiles y pimientos', icon: '🌶️' },
  'guia-harinas': { nombre: 'Harinas', icon: '🌾' },
  'guia-tipos-sal': { nombre: 'Tipos de sal', icon: '🧂' },
  'guia-chocolate': { nombre: 'Chocolate y cacao', icon: '🍫' },
  'guia-azucares': { nombre: 'Azúcares y endulzantes', icon: '🍬' },
  'guia-tuberculos-latam': { nombre: 'Tubérculos de Latinoamérica', icon: '🥔' },
  'guia-maices': { nombre: 'Maíces y nixtamal', icon: '🌽' },
  'calendario-temporada': { nombre: 'Calendario de temporada', icon: '📅' },
  'guia-cafe': { nombre: 'Café', icon: '☕' },
  'guia-te': { nombre: 'Té', icon: '🍵' },
  'guia-infusiones': { nombre: 'Infusiones', icon: '🫖' },
  'guia-cocteles': { nombre: 'Cócteles clásicos', icon: '🍸' },
  'guia-estilos-cerveza': { nombre: 'Estilos de cerveza', icon: '🍺' },
  'guia-varietales-vino': { nombre: 'Varietales de vino', icon: '🍷' },
  'que-vino-elegir': { nombre: '¿Qué vino elegir?', icon: '🍷' },
  'que-cerveza-elegir': { nombre: '¿Qué cerveza elegir?', icon: '🍺' },
  'visualizador-mapa-especias': { nombre: 'El mapa de las especias', icon: '🌶️' },
  'visualizador-viaje-comida': { nombre: 'El viaje de tu comida', icon: '🍽️' },
  'visualizador-huella-alimentos': { nombre: 'La huella de lo que comes', icon: '🌍' },
  'visualizador-digestion-nutrientes': { nombre: 'Digestión y nutrientes', icon: '🍎' },
};

export interface CoquinumHermana {
  slug: string;
  nombre: string;
  icon: string;
}

export interface CoquinumNavCategoria {
  categoria: string;
  categoriaSlug: string;
  hermanas: CoquinumHermana[];
}

/**
 * Dada una app del portal, devuelve su categoría y las apps "hermanas" (misma
 * categoría) para el bloque "Más de [categoría]". Devuelve null si el slug no es
 * una app de Coquinum.
 */
export function getCoquinumHermanas(slug: string, max = 6): CoquinumNavCategoria | null {
  const cat = COQUINUM_APP_CATEGORIA[slug];
  if (!cat) return null;
  const hermanas = Object.keys(COQUINUM_APP_CATEGORIA)
    .filter((s) => s !== slug && COQUINUM_APP_CATEGORIA[s] === cat && COQUINUM_APP_INFO[s])
    .slice(0, max)
    .map((s) => ({ slug: s, nombre: COQUINUM_APP_INFO[s].nombre, icon: COQUINUM_APP_INFO[s].icon }));
  return { categoria: COQUINUM_CATEGORIAS[cat], categoriaSlug: cat, hermanas };
}
