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
  verificado: '2026-06-17',
  vigencia: '2026',
  urlOficialITP: 'https://sede.agenciatributaria.gob.es/Sede/itp-ajd.html',
  urlOficialIRPF: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml',
  nota: 'El ITP varía por comunidad autónoma (6-13%). Los tipos indicados son orientativos. Consulta el tipo exacto de tu CCAA antes de calcular.',
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
  { ccaa: 'Andalucía',          tipo: 7,    reducido: 3.5,  notaReducido: 'Tipo general 7%. Vivienda habitual ≤150.000 €: 6%. Reducido 3,5%: jóvenes <35 (≤150.000 €), familia numerosa o discapacidad ≥33% (≤250.000 €), municipios despoblados' },
  { ccaa: 'Aragón',             tipo: 8,    reducido: 5,    notaReducido: 'Jóvenes <36 años, primera vivienda habitual. ⚠️ Dato orientativo: Aragón aplica bonificaciones sobre la cuota que varían según colectivo y municipio — verifica la tarifa vigente en aragon.es' },
  { ccaa: 'Asturias',           tipo: 8,    reducido: 4,    notaReducido: 'Jóvenes <35 años, familia numerosa, discapacidad ≥65% (vivienda habitual ≤150.000 €)' },
  { ccaa: 'Baleares',           tipo: 8,    reducido: 4,    notaReducido: 'Escala progresiva 8/9/10/12/13% según valor. Reducido 4% vivienda habitual ≤270.151 €; menores de 30 años o discapacidad ≥33%: 0%; familia numerosa o VPO: 5%' },
  { ccaa: 'Canarias',           tipo: 6.5,  reducido: 5,    notaReducido: 'Vivienda habitual, valor ≤150.000 € (sin ser titular de otra vivienda)' },
  { ccaa: 'Cantabria',          tipo: 9,    reducido: 7,    notaReducido: 'Vivienda habitual valor < 200.000 €; jóvenes <36 años hasta 4%' },
  { ccaa: 'Castilla-La Mancha', tipo: 9,    reducido: 6,    notaReducido: 'Jóvenes <36 años, familia numerosa o discapacidad, vivienda habitual ≤180.000 €' },
  { ccaa: 'Castilla y León',    tipo: 8,    reducido: 4,    notaReducido: 'Reducido 4% (≤150.000 €) o 6% (resto) para jóvenes <36, familia numerosa/monoparental, discapacidad ≥65%, VPO o zonas rurales. Jóvenes <36 en municipios <10.000 hab. (≤150.000 €): 0,01%' },
  { ccaa: 'Cataluña',           tipo: 10,   reducido: 5,    notaReducido: 'Jóvenes ≤32 años (≤35 desde 27/06/2026) con renta ≤36.000 €, familia numerosa/monoparental o discapacidad ≥65% (vivienda habitual). VPO: 7%' },
  { ccaa: 'Extremadura',        tipo: 8,    reducido: 7,    notaReducido: 'Vivienda habitual (≤180.000 €, con límites de renta). ⚠️ Dato orientativo: escala progresiva (8/10/11%) y varios tipos para jóvenes/familia numerosa según valor y renta — verifica la tarifa vigente en gobiernodeextremadura.es' },
  { ccaa: 'Galicia',            tipo: 8,    reducido: 3,    notaReducido: 'Jóvenes <36 años, familias numerosas, discapacidad ≥65% (vivienda habitual ≤150.000 €)' },
  { ccaa: 'La Rioja',           tipo: 7,    reducido: 4,    notaReducido: 'Jóvenes <40 años, primera vivienda habitual (novedad 2025); familia numerosa o discapacidad ≥33%: 5%. ⚠️ Dato orientativo: existen varios escalones adicionales según colectivo y municipio — verifica la tarifa vigente en larioja.org' },
  { ccaa: 'Madrid',             tipo: 6,    reducido: 5.4,  notaReducido: 'Bonificación 10% sobre cuota, vivienda habitual ≤250.000 € (6% → 5,4% efectivo); familia numerosa: 4%; jóvenes <35 en municipios <2.500 hab.: exento 100%' },
  { ccaa: 'Murcia',             tipo: 7.75, reducido: 3,    notaReducido: 'Tipo general 7,75% desde 25/07/2025 (Ley 3/2025, antes 8%). Reducido 3%: jóvenes <35 (≤150.000 €), familia numerosa, discapacidad ≥65%; VPO régimen especial: 4%' },
  { ccaa: 'Navarra',            tipo: 6,    reducido: 5,    notaReducido: 'Jóvenes <35 años, familias con 2+ hijos, discapacidad o VPO (vivienda habitual ≤180.304 €)' },
  { ccaa: 'País Vasco',         tipo: 4,    reducido: 2.5,  notaReducido: 'Jóvenes <35 años, familia numerosa, discapacidad ≥65% o VPO (vivienda habitual). Normativa foral: puede variar ligeramente entre Álava/Bizkaia/Gipuzkoa' },
  { ccaa: 'Valencia',           tipo: 9,    reducido: 8,    notaReducido: 'Tipo general 9% desde 01/06/2026 (antes 10%) para vivienda usada ≤1.000.000 €; 11% por encima. Reducido 8% jóvenes <35/VPO; 6% jóvenes <35 (≤180.000 €); 4% familia numerosa/monoparental/discapacidad' },
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
 * Tramos de ganancias y pérdidas patrimoniales en IRPF 2025 (base del ahorro)
 * Se aplica a: venta de inmuebles, fondos, acciones, criptomonedas, etc.
 *
 * TODA ganancia patrimonial por transmisión tributa en la base del ahorro con
 * estos tramos, SEA CUAL SEA el plazo de tenencia: la distinción corto/largo
 * plazo (base general si < 1 año) desapareció en 2015 (Ley 26/2014).
 */
export const TRAMOS_GANANCIAS_PATRIMONIALES_2025: TramoGananciasPatrimoniales[] = [
  { hasta: 6000,     tipo: 19 },
  { hasta: 50000,    tipo: 21 },
  { hasta: 200000,   tipo: 23 },
  { hasta: 300000,   tipo: 27 },
  { hasta: Infinity, tipo: 30 },
];

/**
 * Calcula la cuota de la base del ahorro (IRPF) aplicando los tramos progresivos
 * de TRAMOS_GANANCIAS_PATRIMONIALES_2025 sobre una base positiva.
 *
 * Fuente única del cálculo: la usan la app estimador-plusvalias-irpf y la
 * calculadora compartida lib/calculadoras/plusvaliasIRPF.ts (tool MCP Delegum),
 * para que ambas no puedan divergir. No redondea (cada consumidor decide).
 */
export function calcularCuotaBaseAhorro(base: number): number {
  return desglosarCuotaBaseAhorro(base).reduce((suma, t) => suma + t.cuota, 0);
}

export interface TramoDesgloseAhorro {
  desde: number;
  hasta: number;
  tipo: number;
  base: number;
  cuota: number;
}

/**
 * Mismo cálculo que calcularCuotaBaseAhorro pero devolviendo el reparto por tramos,
 * para las interfaces que muestran el desglose. La cuota total es la SUMA de este
 * desglose por construcción: así el detalle mostrado nunca puede contradecir al total.
 */
export function desglosarCuotaBaseAhorro(base: number): TramoDesgloseAhorro[] {
  const desglose: TramoDesgloseAhorro[] = [];
  let restante = Math.max(0, base);
  let limiteAnterior = 0;
  for (const tramo of TRAMOS_GANANCIAS_PATRIMONIALES_2025) {
    const anchura = tramo.hasta - limiteAnterior;
    const enTramo = Math.min(restante, anchura);
    if (enTramo <= 0) break;
    desglose.push({
      desde: limiteAnterior,
      hasta: limiteAnterior + enTramo,
      tipo: tramo.tipo,
      base: enTramo,
      cuota: enTramo * (tramo.tipo / 100),
    });
    restante -= enTramo;
    limiteAnterior = tramo.hasta;
  }
  return desglose;
}

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
  baseNormativa: 'RDL 26/2021, de 8 de noviembre + coeficientes actualizados por Ley de Presupuestos',
  quien: 'Paga el vendedor. En herencias, el heredero. En donaciones, el donatario.',
  tipoMaximoLegal: 30,  // % — Límite legal que ningún municipio puede superar
  tipoOrientativo: 25,  // % — Media orientativa para estimaciones sin dato municipal
  nota: 'El tipo impositivo lo fija cada Ayuntamiento hasta el máximo legal del 30%. Consulta el tipo exacto de tu municipio antes de calcular.',
  urlReferencia: 'https://sede.agenciatributaria.gob.es',
  verificado: '2025-01-15',
  vigencia: '2025',
  aviso: 'Los coeficientes se actualizan anualmente por Ley de Presupuestos. Verificar para el ejercicio en curso.',
};

/**
 * Coeficientes máximos IIVTNU por años de tenencia — 2025
 *
 * Fuente: RDL 26/2021 + actualización anual vía Ley de Presupuestos.
 * Los Ayuntamientos pueden aplicar coeficientes INFERIORES a estos máximos.
 * Para calcular: Base imponible = Valor catastral del suelo × coeficiente
 *
 * ⚠️ Si España no aprueba PGE, se prorrogan los del ejercicio anterior.
 * Verificar en: https://www.hacienda.gob.es
 */
export interface CoeficienteIIVTNU {
  anios: number;        // Años de tenencia (0 = menos de 1 año)
  label: string;        // Etiqueta legible
  coeficiente: number;  // Coeficiente máximo legal
}

export const COEFICIENTES_IIVTNU_2025: CoeficienteIIVTNU[] = [
  { anios: 0,  label: 'Menos de 1 año',  coeficiente: 0.14 },
  { anios: 1,  label: '1 año',           coeficiente: 0.13 },
  { anios: 2,  label: '2 años',          coeficiente: 0.15 },
  { anios: 3,  label: '3 años',          coeficiente: 0.16 },
  { anios: 4,  label: '4 años',          coeficiente: 0.17 },
  { anios: 5,  label: '5 años',          coeficiente: 0.17 },
  { anios: 6,  label: '6 años',          coeficiente: 0.16 },
  { anios: 7,  label: '7 años',          coeficiente: 0.12 },
  { anios: 8,  label: '8 años',          coeficiente: 0.10 },
  { anios: 9,  label: '9 años',          coeficiente: 0.09 },
  { anios: 10, label: '10 años',         coeficiente: 0.08 },
  { anios: 11, label: '11 años',         coeficiente: 0.08 },
  { anios: 12, label: '12 años',         coeficiente: 0.08 },
  { anios: 13, label: '13 años',         coeficiente: 0.08 },
  { anios: 14, label: '14 años',         coeficiente: 0.10 },
  { anios: 15, label: '15 años',         coeficiente: 0.12 },
  { anios: 16, label: '16 años',         coeficiente: 0.16 },
  { anios: 17, label: '17 años',         coeficiente: 0.20 },
  { anios: 18, label: '18 años',         coeficiente: 0.26 },
  { anios: 19, label: '19 años',         coeficiente: 0.36 },
  { anios: 20, label: '20 o más años',   coeficiente: 0.45 },
];
