// Ajuste de recetas por altitud — lógica pura
//
// El foso LATAM: gran parte del público cocina en altura (CDMX 2240 m, Bogotá
// 2640 m, Quito 2850 m, La Paz 3640 m) siguiendo recetas pensadas para el nivel
// del mar. En altura el agua hierve más fría (los guisos tardan más) y las masas
// con leudante suben de golpe y se desinflan. Casi nadie lo resuelve bien en
// español.
//
// Punto de ebullición: aproximación lineal Tb(°C) ≈ 100 − altitud_m / 285,
// fiable hasta ~4000 m (coincide con tablas: CDMX ≈ 92 °C, La Paz ≈ 87 °C).
// Ajustes de horneado: bandas de High Altitude Baking de Colorado State
// University Extension (pub. 41.000) y USDA, convertidas a sistema métrico.
// Verificado: 2026-06.

export interface MetaAltitud {
  fuente: string;
  urlOficial: string;
  verificado: string;
}

export const ALTITUD_META: MetaAltitud = {
  fuente: 'Colorado State University Extension — High Altitude Baking + USDA',
  urlOficial: 'https://extension.colostate.edu/topic-areas/nutrition-food-safety-health/high-altitude-food-preparation-9-307/',
  verificado: '2026-06',
};

// ─── Ciudades de referencia (altitud en metros) ───────────────────────────────

export interface Ciudad {
  nombre: string;
  pais: string;
  altitud: number;
}

export const CIUDADES: Ciudad[] = [
  { nombre: 'Nivel del mar', pais: '—', altitud: 0 },
  { nombre: 'Madrid', pais: 'España', altitud: 667 },
  { nombre: 'San José', pais: 'Costa Rica', altitud: 1170 },
  { nombre: 'Ciudad de Guatemala', pais: 'Guatemala', altitud: 1500 },
  { nombre: 'Guadalajara', pais: 'México', altitud: 1566 },
  { nombre: 'Medellín', pais: 'Colombia', altitud: 1495 },
  { nombre: 'Puebla', pais: 'México', altitud: 2135 },
  { nombre: 'Ciudad de México', pais: 'México', altitud: 2240 },
  { nombre: 'Arequipa', pais: 'Perú', altitud: 2335 },
  { nombre: 'San Cristóbal de las Casas', pais: 'México', altitud: 2200 },
  { nombre: 'Toluca', pais: 'México', altitud: 2660 },
  { nombre: 'Bogotá', pais: 'Colombia', altitud: 2640 },
  { nombre: 'Quito', pais: 'Ecuador', altitud: 2850 },
  { nombre: 'Cusco', pais: 'Perú', altitud: 3399 },
  { nombre: 'La Paz', pais: 'Bolivia', altitud: 3640 },
  { nombre: 'El Alto', pais: 'Bolivia', altitud: 4150 },
];

// ─── Punto de ebullición del agua ─────────────────────────────────────────────

export function puntoEbullicion(altitudM: number): number {
  const t = 100 - altitudM / 285;
  return Math.round(t * 10) / 10;
}

// ─── Ajustes de horneado por bandas de altitud ────────────────────────────────

export interface AjusteAltitud {
  banda: string;
  significativo: boolean;
  // Repostería con leudante químico (bizcochos, magdalenas, galletas).
  hornoMasC: number; // subir la temperatura del horno (°C)
  leudanteReduccionPct: number; // reducir polvo de hornear / bicarbonato (%)
  liquidoMasMlPorTaza: number; // añadir líquido por cada taza (240 ml)
  azucarMenosGPorTaza: number; // reducir azúcar por cada taza (200 g)
  harinaMasGPorTaza: number; // reforzar con harina por cada taza (120 g)
  // Panadería con levadura.
  levaduraNota: string;
  // Cocción en agua (guisos, legumbres, pasta, huevos).
  coccionAguaNota: string;
  ollaPresion: boolean;
  resumen: string;
}

interface Banda extends Omit<AjusteAltitud, 'banda'> {
  hasta: number; // límite superior de la banda (m); Infinity para la última
  etiqueta: string;
}

// Bandas crecientes. La primera que cumpla altitud < hasta gana.
const BANDAS: Banda[] = [
  {
    hasta: 900,
    etiqueta: 'Altitud baja',
    significativo: false,
    hornoMasC: 0,
    leudanteReduccionPct: 0,
    liquidoMasMlPorTaza: 0,
    azucarMenosGPorTaza: 0,
    harinaMasGPorTaza: 0,
    levaduraNota: 'Sin cambios: la fermentación va a su ritmo normal.',
    coccionAguaNota: 'Tiempos de cocción habituales.',
    ollaPresion: false,
    resumen: 'Por debajo de unos 900 m las recetas funcionan sin ajustes apreciables.',
  },
  {
    hasta: 1500,
    etiqueta: 'Altitud media (≈900–1500 m)',
    significativo: true,
    hornoMasC: 10,
    leudanteReduccionPct: 10,
    liquidoMasMlPorTaza: 10,
    azucarMenosGPorTaza: 10,
    harinaMasGPorTaza: 0,
    levaduraNota: 'La masa sube algo más rápido: vigila el volumen en vez de fiarte solo del reloj.',
    coccionAguaNota: 'Guisos y legumbres tardan un poco más; añade unos minutos.',
    ollaPresion: false,
    resumen: 'Ajustes leves: reduce un poco el leudante y añade algo de líquido.',
  },
  {
    hasta: 2100,
    etiqueta: 'Altitud notable (≈1500–2100 m)',
    significativo: true,
    hornoMasC: 10,
    leudanteReduccionPct: 15,
    liquidoMasMlPorTaza: 20,
    azucarMenosGPorTaza: 15,
    harinaMasGPorTaza: 8,
    levaduraNota: 'Reduce la levadura ~15% o acorta el levado; haz un plegado extra si hace falta.',
    coccionAguaNota: 'El agua ya hierve por debajo de 94 °C: las legumbres pueden tardar bastante más.',
    ollaPresion: false,
    resumen: 'Empieza a notarse: refuerza con harina y sube el horno para fijar la estructura.',
  },
  {
    hasta: 2700,
    etiqueta: 'Altura (≈2100–2700 m) · CDMX, Bogotá',
    significativo: true,
    hornoMasC: 15,
    leudanteReduccionPct: 20,
    liquidoMasMlPorTaza: 30,
    azucarMenosGPorTaza: 20,
    harinaMasGPorTaza: 8,
    levaduraNota: 'Reduce la levadura ~25%: a esta altura las masas se sobrefermentan con facilidad.',
    coccionAguaNota: 'Cocción en agua claramente más lenta; la olla a presión ayuda mucho con legumbres y carnes.',
    ollaPresion: true,
    resumen: 'Zona típica de gran ciudad andina/mexicana: ajustes claros en toda la repostería.',
  },
  {
    hasta: 3300,
    etiqueta: 'Gran altura (≈2700–3300 m) · Quito, Cusco',
    significativo: true,
    hornoMasC: 15,
    leudanteReduccionPct: 25,
    liquidoMasMlPorTaza: 40,
    azucarMenosGPorTaza: 25,
    harinaMasGPorTaza: 15,
    levaduraNota: 'Levadura −25% y levados cortos; vigila de cerca, la masa sube muy rápido.',
    coccionAguaNota: 'El agua hierve cerca de 90 °C: usa olla a presión para legumbres, garbanzos y carnes.',
    ollaPresion: true,
    resumen: 'Ajustes fuertes: más harina, menos azúcar y leudante, horno más caliente.',
  },
  {
    hasta: Infinity,
    etiqueta: 'Muy gran altura (>3300 m) · La Paz, El Alto',
    significativo: true,
    hornoMasC: 20,
    leudanteReduccionPct: 30,
    liquidoMasMlPorTaza: 50,
    azucarMenosGPorTaza: 30,
    harinaMasGPorTaza: 15,
    levaduraNota: 'Levadura −25/30% y mucha vigilancia; la sobrefermentación es casi inmediata.',
    coccionAguaNota: 'El agua hierve por debajo de 88 °C: la olla a presión deja de ser opcional para legumbres.',
    ollaPresion: true,
    resumen: 'Altura extrema: la repostería necesita reajustes notables y la cocción en agua, presión.',
  },
];

export function ajustarPorAltitud(altitudM: number): AjusteAltitud {
  const banda = BANDAS.find((b) => altitudM < b.hasta) ?? BANDAS[BANDAS.length - 1];
  return {
    banda: banda.etiqueta,
    significativo: banda.significativo,
    hornoMasC: banda.hornoMasC,
    leudanteReduccionPct: banda.leudanteReduccionPct,
    liquidoMasMlPorTaza: banda.liquidoMasMlPorTaza,
    azucarMenosGPorTaza: banda.azucarMenosGPorTaza,
    harinaMasGPorTaza: banda.harinaMasGPorTaza,
    levaduraNota: banda.levaduraNota,
    coccionAguaNota: banda.coccionAguaNota,
    ollaPresion: banda.ollaPresion,
    resumen: banda.resumen,
  };
}
