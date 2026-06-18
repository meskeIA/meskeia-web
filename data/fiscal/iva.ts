/**
 * Datos fiscales: IVA (Impuesto sobre el Valor Añadido) — España
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Aplicable al territorio de aplicación
 * del IVA español (península + Baleares). Canarias (IGIC), Ceuta y Melilla
 * (IPSI) tienen sus propios impuestos indirectos.
 *
 * Fuentes:
 *   - Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido (LIVA)
 *   - Directiva 2006/112/CE del Consejo (Directiva del IVA)
 *   - AEAT — IVA: https://sede.agenciatributaria.gob.es
 *
 * Verificado: 2026-06-18
 * Vigencia: 2025-2026
 *
 * ⚠️ ACTUALIZACIÓN NECESARIA:
 *   - Los tipos impositivos pueden modificarse por Ley de Presupuestos o medidas
 *     coyunturales (como ocurrió con los alimentos básicos en 2023-2024).
 *   - El umbral de ventas a distancia / OSS está armonizado a nivel UE.
 */

export const FISCAL_IVA_META = {
  fuente: 'Ley 37/1992 del IVA + Directiva 2006/112/CE',
  verificado: '2026-06-18',
  vigencia: '2025-2026',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/iva.html',
  nota: 'Tipos vigentes en territorio IVA (península y Baleares). Verifica siempre el tipo aplicable a tu producto o servicio concreto en la AEAT.',
};

// ─── Tipos impositivos del IVA ────────────────────────────────────────────────

export interface TipoIVA {
  id: 'general' | 'reducido' | 'superreducido';
  porcentaje: number;
  nombre: string;
  descripcion: string;
  ejemplos: string[];
}

export const TIPOS_IVA: TipoIVA[] = [
  {
    id: 'general',
    porcentaje: 21,
    nombre: 'Tipo general',
    descripcion: 'Se aplica por defecto a la mayoría de bienes y servicios cuando no procede ningún tipo reducido.',
    ejemplos: ['Ropa y calzado', 'Electrónica y electrodomésticos', 'Servicios profesionales', 'Bebidas alcohólicas', 'Vehículos'],
  },
  {
    id: 'reducido',
    porcentaje: 10,
    nombre: 'Tipo reducido',
    descripcion: 'Bienes y servicios de primera necesidad o de interés social que no llegan al superreducido.',
    ejemplos: ['Hostelería y restauración', 'Transporte de viajeros', 'Entrega de viviendas nuevas', 'Alimentos en general', 'Agua', 'Entradas a eventos culturales'],
  },
  {
    id: 'superreducido',
    porcentaje: 4,
    nombre: 'Tipo superreducido',
    descripcion: 'Bienes de primera necesidad básicos y productos de especial protección.',
    ejemplos: ['Pan común, leche, huevos, frutas, verduras y legumbres', 'Libros, periódicos y revistas', 'Medicamentos de uso humano', 'Prótesis y vehículos para personas con discapacidad', 'Viviendas de protección oficial (VPO)'],
  },
];

export const PORCENTAJES_IVA = {
  general: 21,
  reducido: 10,
  superreducido: 4,
} as const;

// ─── Exenciones (art. 20 LIVA) ─────────────────────────────────────────────────
// Operaciones SIN IVA pero que, a diferencia de las exportaciones, normalmente
// NO dan derecho a deducir el IVA soportado (exención limitada).

export const EXENCIONES_ART20: { actividad: string; detalle: string }[] = [
  { actividad: 'Sanidad', detalle: 'Servicios de médicos, dentistas, psicólogos y profesionales sanitarios; asistencia hospitalaria.' },
  { actividad: 'Educación reglada', detalle: 'Enseñanza de centros autorizados y clases particulares de materias del plan de estudios.' },
  { actividad: 'Operaciones financieras', detalle: 'Préstamos, créditos, depósitos y la mayoría de servicios bancarios.' },
  { actividad: 'Seguros', detalle: 'Operaciones de seguro, reaseguro y capitalización.' },
  { actividad: 'Alquiler de vivienda', detalle: 'Arrendamiento de vivienda habitual (no locales ni alquiler turístico con servicios).' },
  { actividad: 'Servicios postales', detalle: 'Servicio postal universal y entrega de sellos de Correos.' },
];

// ─── Umbral de ventas a distancia y servicios digitales (OSS) ──────────────────
// Régimen de ventanilla única (One-Stop Shop). Umbral conjunto a nivel UE.

export const UMBRAL_OSS = {
  importe: 10000,
  periodo: 'anual',
  descripcion: 'Umbral conjunto para ventas a distancia de bienes y servicios digitales (TBE) a consumidores finales del resto de la UE. Por debajo se aplica el IVA español; por encima, el IVA del país de destino declarado vía OSS (modelo 369).',
  vigenciaDesde: '2021-07-01',
};

// ─── Recargo de equivalencia ───────────────────────────────────────────────────
// Régimen especial obligatorio para comerciantes minoristas (personas físicas)
// que venden a consumidor final. El proveedor repercute IVA + recargo.

export interface RecargoEquivalencia {
  tipoIVA: number;
  recargo: number;
}

export const RECARGO_EQUIVALENCIA: RecargoEquivalencia[] = [
  { tipoIVA: 21, recargo: 5.2 },
  { tipoIVA: 10, recargo: 1.4 },
  { tipoIVA: 4, recargo: 0.5 },
];

export const RECARGO_EQUIVALENCIA_TABACO = 1.75; // % adicional para el tabaco

// ─── Modelos tributarios de IVA ────────────────────────────────────────────────

export const MODELOS_IVA: { modelo: string; nombre: string; cuando: string }[] = [
  { modelo: '303', nombre: 'Autoliquidación de IVA', cuando: 'Trimestral (o mensual en REDEME). Declara el IVA repercutido menos el soportado.' },
  { modelo: '390', nombre: 'Resumen anual de IVA', cuando: 'Una vez al año, en enero, como recapitulación del ejercicio.' },
  { modelo: '349', nombre: 'Declaración recapitulativa de operaciones intracomunitarias', cuando: 'Cuando hay entregas o adquisiciones intracomunitarias de bienes o servicios.' },
  { modelo: '369', nombre: 'Ventanilla única (OSS)', cuando: 'Ventas a distancia y servicios digitales a particulares de la UE por encima del umbral.' },
];
