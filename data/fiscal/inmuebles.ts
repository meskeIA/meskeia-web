/**
 * Datos fiscales: Inmuebles — ITP, AJD, IVA obra nueva, plusvalías
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado en 2026.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuentes:
 *   - ITP/AJD: Ley 1/1993 del ITP y AJD + tipos autonómicos
 *   - Plusvalías IRPF: Ley 35/2006 del IRPF (art. 46-49)
 *   - IVA: Ley 37/1992 del IVA
 *   - Plusvalía municipal: RDL 26/2021
 *
 * Verificado: 2025-01-15
 * URL oficial ITP: https://sede.agenciatributaria.gob.es/Sede/itp-ajd.html
 * URL oficial IRPF plusvalías: https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml
 */

export const FISCAL_INMUEBLES_META = {
  fuente: 'Ley 1/1993 ITP-AJD + Ley 35/2006 IRPF + Ley 37/1992 IVA + RDL 26/2021',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficialITP: 'https://sede.agenciatributaria.gob.es/Sede/itp-ajd.html',
  urlOficialIRPF: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml',
  nota: 'El ITP varía por comunidad autónoma (6-11%). Los tipos indicados son orientativos. Consulta el tipo exacto de tu CCAA antes de calcular.',
};

// ─── ITP (Impuesto Transmisiones Patrimoniales) — Vivienda de segunda mano ───

export interface TipoITPCCAA {
  ccaa: string;
  tipo: number;       // % sobre el valor del inmueble
  reducido?: number;  // % para jóvenes u otros colectivos (si existe)
  notaReducido?: string;
}

/**
 * Tipos ITP 2025 por comunidad autónoma
 * IMPORTANTE: Cada CCAA puede tener tipos reducidos para jóvenes, familias numerosas,
 * discapacitados u otras circunstancias. Verificar siempre en la hacienda autonómica.
 */
export const TIPOS_ITP_CCAA_2025: TipoITPCCAA[] = [
  { ccaa: 'Andalucía',          tipo: 7,    reducido: 3.5,  notaReducido: 'Familias numerosas, discapacidad ≥33%, jóvenes <35 años en zonas rurales' },
  { ccaa: 'Aragón',             tipo: 8,    reducido: 5,    notaReducido: 'Jóvenes <36 años, primera vivienda habitual' },
  { ccaa: 'Asturias',           tipo: 8,    reducido: 3,    notaReducido: 'Zonas despobladas, jóvenes' },
  { ccaa: 'Baleares',           tipo: 8,    reducido: 4,    notaReducido: 'Primera vivienda habitual precio < 270.151 €' },
  { ccaa: 'Canarias',           tipo: 6.5 },
  { ccaa: 'Cantabria',          tipo: 10 },
  { ccaa: 'Castilla-La Mancha', tipo: 9,    reducido: 6,    notaReducido: 'Zonas despobladas' },
  { ccaa: 'Castilla y León',    tipo: 8,    reducido: 4,    notaReducido: 'Jóvenes <36 años vivienda habitual' },
  { ccaa: 'Cataluña',           tipo: 10,   reducido: 5,    notaReducido: 'Precio < 190.000 € y comprador <33 años u otras circunstancias' },
  { ccaa: 'Extremadura',        tipo: 8,    reducido: 7 },
  { ccaa: 'Galicia',            tipo: 10,   reducido: 3,    notaReducido: 'Familias numerosas, zonas despobladas' },
  { ccaa: 'La Rioja',           tipo: 7 },
  { ccaa: 'Madrid',             tipo: 6 },
  { ccaa: 'Murcia',             tipo: 8,    reducido: 3,    notaReducido: 'Familias numerosas, discapacidad' },
  { ccaa: 'Navarra',            tipo: 6 },
  { ccaa: 'País Vasco',         tipo: 4,    notaReducido:   'Tipo general. Verificar normativa foral' },
  { ccaa: 'Valencia',           tipo: 10,   reducido: 8,    notaReducido: 'Primera vivienda habitual precio < 1M €' },
  { ccaa: 'Media orientativa',  tipo: 8 },
];

export const ITP_MEDIA_ORIENTATIVA = 8; // % — Media para estimaciones sin CCAA definida

// ─── AJD (Actos Jurídicos Documentados) — Hipotecas y escrituras ─────────────

export const TIPOS_AJD_2025 = {
  general:       1.5,  // % — Tipo medio orientativo (varía 0,5%-2% por CCAA)
  minimo:        0.5,  // % — Tipo mínimo
  maximo:        2.0,  // % — Tipo máximo
  nota: 'El AJD en hipotecas lo paga la entidad financiera desde la Ley 5/2019. En escrituras de compraventa sin hipoteca, lo paga el comprador.',
};

// ─── IVA en obra nueva ────────────────────────────────────────────────────────

export const IVA_INMUEBLES_2025 = {
  obraNueva:         10,   // % — IVA vivienda nueva (primera transmisión del promotor)
  viviendaProtegida: 4,    // % — IVA vivienda de protección oficial
  garaje:            21,   // % — IVA garaje independiente (si no va con la vivienda)
  garageCon:         10,   // % — IVA garaje incluido con la vivienda (hasta 2 plazas)
  local:             21,   // % — IVA local comercial
};

// ─── Plusvalías IRPF (Ganancias Patrimoniales) ───────────────────────────────

export interface TramoGananciasPatrimoniales {
  hasta: number;
  tipo: number;  // %
}

/**
 * Tramos de ganancias y pérdidas patrimoniales en IRPF 2025
 * Se aplica a: venta de inmuebles, fondos, acciones, criptomonedas, etc.
 * Rendimientos > 1 año: base del ahorro (estos tramos)
 * Rendimientos < 1 año: base general (tramos normales del IRPF)
 */
export const TRAMOS_GANANCIAS_PATRIMONIALES_2025: TramoGananciasPatrimoniales[] = [
  { hasta: 6000,     tipo: 19 },
  { hasta: 50000,    tipo: 21 },
  { hasta: 200000,   tipo: 23 },
  { hasta: 300000,   tipo: 27 },
  { hasta: Infinity, tipo: 30 },
];

// ─── Otros costes de compraventa ─────────────────────────────────────────────

export const COSTES_COMPRAVENTA_2025 = {
  notaria: {
    estimacion:    0.3,   // % aproximado sobre el precio (orientativo)
    minimo:        400,   // € mínimo aproximado
    maximo:        2500,  // € máximo aproximado en operaciones estándar
    nota: 'Los honorarios notariales están regulados por arancel. Varían según el precio de la operación.',
  },
  registro: {
    estimacion:    0.2,   // % aproximado sobre el precio (orientativo)
    minimo:        150,   // € mínimo aproximado
    maximo:        1000,  // € máximo aproximado
    nota: 'Los honorarios de registro están regulados por arancel.',
  },
  gestoria: {
    estimacion:    0.15,  // % aproximado (orientativo)
    rango: '300 € - 800 €',
    nota: 'Opcional. Necesaria para inscripción hipotecaria.',
  },
};

// ─── Plusvalía Municipal (IIVTNU) ─────────────────────────────────────────────

export const PLUSVALIA_MUNICIPAL_META = {
  nombre: 'Impuesto sobre el Incremento del Valor de los Terrenos de Naturaleza Urbana (IIVTNU)',
  baseNormativa: 'RDL 26/2021, de 8 de noviembre (método objetivo o directo)',
  quien: 'Paga el vendedor. En herencias, el heredero.',
  nota: 'El importe varía enormemente según el municipio (tipo máximo 30%), los años de tenencia y el valor catastral del suelo. Consultar al Ayuntamiento o gestoría.',
  urlReferencia: 'https://sede.agenciatributaria.gob.es',
};
