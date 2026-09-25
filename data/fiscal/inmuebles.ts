/**
 * Datos fiscales: Inmuebles — ITP, AJD, IVA obra nueva, plusvalías
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado en 2026.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuentes:
 *   - ITP/AJD: Real Decreto Legislativo 1/1993 (texto refundido del ITP y AJD) + tipos autonómicos
 *   - Plusvalías IRPF: Ley 35/2006 del IRPF (art. 46-49)
 *   - IVA: Ley 37/1992 del IVA
 *   - Plusvalía municipal: RDL 26/2021
 *
 * Verificado: 2025-01-15
 * URL oficial ITP: https://sede.agenciatributaria.gob.es/Sede/itp-ajd.html
 * URL oficial IRPF plusvalías: https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml
 */

export const FISCAL_INMUEBLES_META = {
  // «Ley 1/1993» no existe: el texto refundido del impuesto es un Real Decreto Legislativo
  // (BOE-A-1993-25359). Lo publicaba el sello de toda app de riesgo 1 que lo pinta (hallazgo
  // 1600 del Inspector, 24/09/2026).
  fuente: 'Real Decreto Legislativo 1/1993 (ITP y AJD) + Ley 35/2006 IRPF + Ley 37/1992 IVA + RDL 26/2021',
  verificado: '2026-06-17',
  vigencia: '2026',
  urlOficialITP: 'https://sede.agenciatributaria.gob.es/Sede/itp-ajd.html',
  urlOficialIRPF: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml',
  nota: 'El ITP de la vivienda varía por comunidad autónoma: del 4% (País Vasco, donde el resto de inmuebles tributa al 7%) al 10% de tipo general, y hasta el 13% en el tramo más alto de las comunidades con escala progresiva (Baleares y Cataluña). Los tipos indicados son orientativos. Consulta el tipo exacto de tu CCAA antes de calcular.',
};

// ─── ITP (Impuesto Transmisiones Patrimoniales) — Vivienda de segunda mano ───

export interface TipoITPCCAA {
  ccaa: string;
  tipo: number;       // % sobre el valor del inmueble
  reducido?: number;  // % para jóvenes u otros colectivos (si existe)
  notaReducido?: string;
  /**
   * Tipo de los inmuebles que NO son vivienda (local, nave, solar, terreno, y garaje o trastero
   * que no se transmiten con la vivienda), solo donde la norma los grava distinto de ella.
   * Sin este campo, el tipo general `tipo` vale para cualquier inmueble.
   */
  tipoNoVivienda?: number;
  notaNoVivienda?: string;
}

/**
 * Tipos ITP 2025 por comunidad autónoma
 * IMPORTANTE: Cada CCAA puede tener tipos reducidos para jóvenes, familias numerosas,
 * discapacitados u otras circunstancias. Verificar siempre en la hacienda autonómica.
 */
export const TIPOS_ITP_CCAA_2025: TipoITPCCAA[] = [
  { ccaa: 'Andalucía',          tipo: 7,    reducido: 3.5,  notaReducido: 'Tipo general 7%. Vivienda habitual ≤150.000 €: 6%. Reducido 3,5%: jóvenes <35 (≤150.000 €), familia numerosa o discapacidad ≥33% (≤250.000 €), municipios despoblados' },
  { ccaa: 'Aragón',             tipo: 8,    reducido: 7,    notaReducido: 'Tipo general en escala de cinco tramos con cuota acumulada (8 % hasta 400.000 €; luego 8,5 %, 9 %, 9,5 % y 10 % desde 750.000 € — art. 121-1). Aragón NO tiene tipos reducidos por colectivo, sino bonificaciones en cuota: 12,5 % para menores de 35 años, discapacidad ≥65 % y mujeres víctimas de violencia de género, con el inmueble ≤100.000 € (art. 121-4), compatibles entre sí — el 7 % es ese 12,5 % ya descontado del 8 %. Familia numerosa: bonificación del 50 % (art. 121-5: exige vender la vivienda anterior, +10 % de superficie y renta ≤35.000 €, e incompatible con las demás), que sube al 60 % en medio rural (art. 160-3)' },
  { ccaa: 'Asturias',           tipo: 8,    reducido: 4,    notaReducido: 'Jóvenes <35 años, familia numerosa, discapacidad ≥65% (vivienda habitual ≤150.000 €)' },
  { ccaa: 'Baleares',           tipo: 8,    reducido: 4,    notaReducido: 'Escala progresiva 8/9/10/12/13% según valor. Reducido 4% vivienda habitual ≤270.151 €; menores de 30 años o discapacidad ≥33%: 0%; familia numerosa o VPO: 5%' },
  { ccaa: 'Canarias',           tipo: 6.5,  reducido: 5,    notaReducido: 'Vivienda habitual, valor ≤150.000 € (sin ser titular de otra vivienda)' },
  { ccaa: 'Cantabria',          tipo: 9,    reducido: 7,    notaReducido: 'Vivienda habitual valor < 200.000 €; jóvenes <36 años hasta 4%' },
  { ccaa: 'Castilla-La Mancha', tipo: 9,    reducido: 6,    notaReducido: 'Jóvenes <36 años, familia numerosa o discapacidad, vivienda habitual ≤180.000 €' },
  { ccaa: 'Castilla y León',    tipo: 8,    reducido: 4,    notaReducido: 'Reducido 4% (≤150.000 €) o 6% (resto) para jóvenes <36, familia numerosa/monoparental, discapacidad ≥65%, VPO o zonas rurales. Jóvenes <36 en municipios <10.000 hab. (≤150.000 €): 0,01%' },
  { ccaa: 'Cataluña',           tipo: 10,   reducido: 5,    notaReducido: 'Jóvenes ≤35 años desde el 27/06/2025 (Decreto-ley 5/2025; antes ≤32) con renta ≤36.000 €, familia numerosa/monoparental o discapacidad ≥65% (vivienda habitual). VPO: 7%. Escala progresiva 10/11/12/13% según valor' },
  { ccaa: 'Extremadura',        tipo: 8,    reducido: 7,    notaReducido: 'Vivienda habitual (≤180.000 €, con límites de renta). ⚠️ Dato orientativo: escala progresiva (8/10/11%) y varios tipos para jóvenes/familia numerosa según valor y renta — verifica la tarifa vigente en gobiernodeextremadura.es' },
  { ccaa: 'Galicia',            tipo: 8,    reducido: 3,    notaReducido: 'Jóvenes <36 años, familias numerosas, discapacidad ≥65% (vivienda habitual ≤150.000 €)' },
  { ccaa: 'La Rioja',           tipo: 7,    reducido: 4,    notaReducido: 'Jóvenes <40 años, primera vivienda habitual (novedad 2025); familia numerosa o discapacidad ≥33%: 5%. ⚠️ Dato orientativo: existen varios escalones adicionales según colectivo y municipio — verifica la tarifa vigente en larioja.org' },
  { ccaa: 'Madrid',             tipo: 6,    reducido: 5.4,  notaReducido: 'Bonificación 10% sobre cuota, vivienda habitual ≤250.000 € (6% → 5,4% efectivo); familia numerosa: 4%; jóvenes <35 en municipios <2.500 hab.: exento 100%' },
  { ccaa: 'Murcia',             tipo: 7.75, reducido: 3,    notaReducido: 'Tipo general 7,75% desde 25/07/2025 (Ley 3/2025, antes 8%). Reducido 3% (art. 8.6 del Decreto Legislativo 1/2010): jóvenes de edad ≤40 en vivienda habitual, con base imponible general menos mínimo personal y familiar <40.000 € y base del ahorro ≤1.800 €, SIN límite de valor del inmueble; familia numerosa (renta <44.000 €, +6.000 € por hijo); discapacidad ≥65%. VPO régimen especial: 4%' },
  { ccaa: 'Navarra',            tipo: 6,    reducido: 5,    notaReducido: 'Jóvenes <35 años, familias con 2+ hijos, discapacidad o VPO (vivienda habitual ≤180.304 €)' },
  // 24/09/2026 (hallazgo 1582 del Inspector): el 4 % es SOLO de la vivienda. Verificado en el
  // texto consolidado de las dos normas forales: Bizkaia, NF 1/2011 art. 13 (a: «El 7 por 100
  // si se trata de la transmisión de bienes inmuebles»; b: 4 % «la transmisión de viviendas en
  // general, incluidas las plazas de garaje, con un máximo de dos unidades, y anexos, situados
  // en el mismo edificio, que se transmitan conjuntamente […] no tendrán la consideración de
  // anexos a viviendas los locales de negocio»), y Gipuzkoa, NF 18/1987 art. 11.1, a) y b), con
  // la misma redacción (texto vigente de 2025 de la Diputación). Álava (NF 11/2003) no se pudo
  // consultar en su fuente oficial: se le aplica lo que las otras dos dicen igual.
  { ccaa: 'País Vasco',         tipo: 4,    reducido: 2.5,  notaReducido: 'Jóvenes <35 años, familia numerosa, discapacidad ≥65% o VPO (vivienda habitual). Normativa foral: puede variar ligeramente entre Álava/Bizkaia/Gipuzkoa',
    tipoNoVivienda: 7, notaNoVivienda: 'El 4% es solo de la vivienda (y hasta dos garajes y anexos del mismo edificio transmitidos con ella). Locales, naves, solares, terrenos y garajes o trasteros sueltos: 7% (NF 1/2011 de Bizkaia, art. 13.a; NF 18/1987 de Gipuzkoa, art. 11.1.a). Álava sin verificar.' },
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
  garaje:            21,   // % — IVA garaje o trastero independiente (si no va con la vivienda)
  /**
   * % — IVA del anejo transmitido CONJUNTAMENTE con la vivienda: garajes (máximo dos
   * plazas) y trasteros. Art. 91.Uno.1.7º LIVA, que los grava al mismo tipo que la
   * vivienda por ser «anexos que se transmitan conjuntamente».
   *
   * Se llamaba `garageCon` y solo documentaba el garaje, así que las apps de trastero
   * calculaban con esta constante mientras sus textos anunciaban `obraNueva`: dos
   * constantes para un único dato, que existen separadas precisamente para poder
   * divergir (hallazgo 641 del Inspector, 07/09/2026).
   */
  anejoVinculado:    10,
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
/**
 * Sello PROPIO de la escala del ahorro, separado de FISCAL_INMUEBLES_META.
 *
 * ⚠  Existe porque el sello del módulo entero mide otra cosa: su `verificado` subió
 * cuatro veces entre enero y junio de 2026 (2025-01-15 → 2026-06-12 → 06-13 → 06-17) en
 * commits que solo revisaban TIPOS_ITP_CCAA_2025, un tributo que las apps de la escala del
 * ahorro ni siquiera calculan; y su `fuente` nombra cuatro normas, tres de las cuales no
 * tienen nada que ver con la ganancia patrimonial. Una app que rotulaba «IRPF de la venta»
 * enseñaba así una fecha ganada revisando el ITP (hallazgo 781 del Inspector).
 *
 * La fecha es la de la revisión del 2026-08-12, que verificó uno a uno contra el texto
 * consolidado del BOE los artículos que sostienen el IRPF —el art. 66 incluido, que es
 * este— y así lo dejó escrito en la cabecera de data/fiscal/irpf.ts.
 */
export const GANANCIAS_PATRIMONIALES_META = {
  fuente: 'Ley 35/2006 del IRPF, art. 66 (escala de la base del ahorro), redacción de la Ley 7/2024 con efectos 1/1/2025',
  verificado: '2026-08-12',
  vigencia: '2026',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml',
  nota: 'Toda ganancia patrimonial por transmisión tributa con esta escala, sea cual sea el plazo de tenencia: la distinción corto/largo plazo desapareció en 2015 (Ley 26/2014).',
};

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
  baseNormativa: 'TRLRHL (RD Legislativo 2/2004), arts. 104-110; coeficientes del art. 107.4 en la redacción del art. 24 del RDL 8/2023',
  quien: 'Paga el vendedor. En herencias, el heredero. En donaciones, el donatario.',
  tipoMaximoLegal: 30,  // % — Límite legal que ningún municipio puede superar
  tipoOrientativo: 25,  // % — Media orientativa para estimaciones sin dato municipal
  nota: 'El tipo impositivo lo fija cada Ayuntamiento hasta el máximo legal del 30%. Consulta el tipo exacto de tu municipio antes de calcular.',
  urlReferencia: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214#a107',
  verificado: '2026-09-24',
  vigencia: '2026',
  aviso: 'Los coeficientes máximos se actualizan por norma con rango de ley; cada Ayuntamiento puede aplicar los suyos, iguales o inferiores. Verificar para el ejercicio en curso.',
};

/**
 * Plazo de autoliquidación del ITP y AJD.
 *
 * ── De dónde sale (11/09/2026, hallazgo 713 del Inspector) ───────────────────
 * Estaba escrito a mano en el bloque educativo de `simulador-gastos-compraventa-garaje`, una
 * app de riesgo 1, sin norma citada al lado — y en la MISMA frase el recargo por presentación
 * tardía sí venía sellado desde `ESCALA_RECARGO_EXTEMPORANEO`, con su base normativa impresa
 * en pantalla. Un párrafo con un dato con fuente y otro sin ella, y el segundo es el que fija
 * la fecha desde la que corre el primero. `grep "30 días hábiles" data/ lib/` devolvía cero:
 * no había en el repositorio nada que lo respaldase ni que permitiera revisarlo el día que una
 * comunidad fije otro plazo.
 *
 * ⚠️ El plazo es de gestión autonómica: hay comunidades que lo amplían (Cataluña lo tiene en
 * un mes en varios supuestos). Por eso el dato lleva el aviso: el valor de abajo es el del
 * Reglamento estatal, que rige en defecto de norma propia.
 */
export const PLAZO_ITP = {
  dias: 30,
  unidad: 'días hábiles',
  baseNormativa: 'art. 102.1 del Reglamento del ITPAJD, RD 828/1995',
  desde: 'el día en que se cause el acto o contrato',
  aviso: 'Plazo estatal supletorio: algunas comunidades autónomas fijan el suyo. Confirma el de la tuya antes de presentar.',
  urlReferencia: 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-14257',
  verificado: '2026-09-11',
  vigencia: '2026',
};

/**
 * Plazos de declaración del IIVTNU (plusvalía municipal).
 *
 * ── De dónde sale (15/09/2026, hallazgo 864 del Inspector) ───────────────────
 * `simulador-heredar-vivienda` servía el plazo del IIVTNU desde `PLAZO_ISD.mesesPresentacion`
 * —la constante de OTRO tributo, cuyo dies a quo es el fallecimiento— porque no había ninguna
 * propia: `grep -rn PLAZO_IIVTNU data/` no devolvía nada. Coinciden hoy en seis meses, así que
 * ninguna cifra estaba mal, pero el día que uno de los dos se moviera la app habría movido el
 * otro sin que nadie se enterase. Es el caso de `PLAZO_ITP` (hallazgo 713) y el de `PLAZO_ISD`
 * (hallazgo 782) por tercera vez.
 *
 * ⚠️ LA PRÓRROGA NO ES LA DEL ISD, y esa confusión ya estaba publicada: el mismo día,
 * `orientacion-tramitacion-herencias` afirmaba «A diferencia del IS, no admite prórroga»
 * mientras `estimador-plusvalia-municipal` ofrecía «otros 6 meses ante el Ayuntamiento». El
 * art. 110.2.b) da SEIS MESES PRORROGABLES HASTA UN AÑO a solicitud del sujeto pasivo: no es
 * la prórroga del art. 68 RISD (que hay que pedir dentro de los cinco primeros meses y devenga
 * intereses), sino un plazo distinto de un tributo distinto que se liquida además ante otra
 * administración. Verificado en sesión el 15/09/2026 contra el texto consolidado del BOE
 * (API de legislación consolidada, bloque a110): el artículo conserva su redacción original de
 * 2004 y el RDL 26/2021 no lo modificó.
 */
export const PLAZO_IIVTNU = {
  /** Art. 110.2.a): transmisiones entre vivos (compraventa, donación). */
  diasHabilesInterVivos: 30,
  /** Art. 110.2.b): transmisiones por causa de muerte. */
  mesesMortisCausa: 6,
  /** Art. 110.2.b): «prorrogables hasta un año a solicitud del sujeto pasivo». */
  admiteProrrogaMortisCausa: true,
  mesesMaximoConProrroga: 12,
  baseNormativa: 'art. 110.2 del TRLRHL (RD Legislativo 2/2004)',
  desde: 'la fecha del devengo del impuesto',
  aviso: 'Se declara ante el Ayuntamiento donde esté el inmueble, no ante la comunidad autónoma. Cada ordenanza fija su forma de gestión (declaración o autoliquidación).',
  urlReferencia: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214#a110',
  verificado: '2026-09-15',
  vigencia: '2026',
};

/**
 * Plazo para pedir la devolución de una plusvalía municipal ingresada indebidamente.
 *
 * ── De dónde sale (25/09/2026, hallazgo 1646 del Inspector) ──────────────────
 * `estimador-plusvalia-municipal` animaba a reclamar plusvalías «pagadas antes de 2021» con
 * «4 años para reclamar», escrito a mano en tres sitios. Con esa misma regla, cualquier pago
 * anterior al 01/01/2021 prescribió como muy tarde a finales de 2024: la app ofrecía como vía
 * abierta una que su propio plazo cerraba. El plazo no estaba en ningún módulo.
 *
 * No es una regla del IIVTNU sino de la LGT, que rige también la gestión de los tributos
 * locales: prescribe a los cuatro años el derecho a solicitar la devolución de ingresos
 * indebidos (art. 66.c) y el plazo se cuenta desde el día siguiente al del ingreso, o desde el
 * día siguiente al fin del plazo de autoliquidación si se pagó dentro de él (art. 67.1).
 * Verificado en sesión el 25/09/2026 contra el texto consolidado del BOE (API de legislación
 * consolidada, BOE-A-2003-23186, bloques a66 y a67, últimas versiones).
 *
 * ⚠️ La vía de la PÉRDIDA la abrió la STC 59/2017 (11/05/2017), no la STC 182/2021: esta
 * última anuló el método de cálculo y dejó expresamente fuera las situaciones no impugnadas
 * antes de su fecha (26/10/2021).
 */
export const PRESCRIPCION_DEVOLUCION_IIVTNU = {
  anios: 4,
  baseNormativa: 'arts. 66.c) y 67.1 de la Ley General Tributaria (Ley 58/2003)',
  desde: 'el día siguiente al del pago (o al fin del plazo de autoliquidación, si se pagó dentro de él)',
  urlReferencia: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a66',
  verificado: '2026-09-25',
  vigencia: '2026',
};

/**
 * Coeficientes máximos del IIVTNU por años de generación (art. 107.4 TRLRHL)
 *
 * Los Ayuntamientos pueden aplicar coeficientes INFERIORES a estos máximos.
 * Para calcular: Base imponible = Valor catastral del suelo × coeficiente
 *
 * ── Verificado el 24/09/2026 contra el BOE (hallazgo 1559 del Inspector) ─────
 * API de legislación consolidada, BOE-A-2004-4214, bloque a107, última versión (28/01/2026).
 * Es la tabla que el art. 24 del RDL 8/2023 dio al art. 107.4, vigente desde el 01/01/2024.
 * Las dos actualizaciones posteriores decayeron: la del RDL 9/2024 (derogado el 22/01/2025,
 * no convalidado) y la del RDL 16/2025 («Se deja sin efecto la modificación de los importes
 * máximos de los coeficientes», por la Resolución de 27/01/2026 que publica su derogación).
 *
 * Hasta ese día aquí estaba la tabla con la que el RDL 26/2021 redactó el artículo (vigente
 * del 10/11/2021 al 31/12/2022), sellada como «2025»: coincidía con la vigente en UNO de los
 * 21 tramos. La leían siete sitios del catálogo —el motor de la familia de compraventa, el de
 * la API y el MCP, `estimador-plusvalia-municipal`, `simulador-heredar-vivienda`…—, así que
 * todos liquidaban la plusvalía con coeficientes de 2022: 7 años a 0,12 en vez de 0,20, o
 * 20 años a 0,45 en vez de 0,40. El nombre de la constante se conserva para no romper a
 * nadie; lo que manda es la fecha de verificación de PLUSVALIA_MUNICIPAL_META.
 *
 * ⚠️ No se lee con `find()` a mano: `coeficienteIIVTNU()` aplica además el PRORRATEO por
 * meses del periodo inferior a un año, que la ley exige y ninguna consulta directa hacía.
 */
export interface CoeficienteIIVTNU {
  anios: number;        // Años de tenencia (0 = menos de 1 año)
  label: string;        // Etiqueta legible
  coeficiente: number;  // Coeficiente máximo legal
}

export const COEFICIENTES_IIVTNU_2025: CoeficienteIIVTNU[] = [
  { anios: 0,  label: 'Menos de 1 año', coeficiente: 0.15 },
  { anios: 1,  label: '1 año',          coeficiente: 0.15 },
  { anios: 2,  label: '2 años',         coeficiente: 0.14 },
  { anios: 3,  label: '3 años',         coeficiente: 0.14 },
  { anios: 4,  label: '4 años',         coeficiente: 0.16 },
  { anios: 5,  label: '5 años',         coeficiente: 0.18 },
  { anios: 6,  label: '6 años',         coeficiente: 0.19 },
  { anios: 7,  label: '7 años',         coeficiente: 0.20 },
  { anios: 8,  label: '8 años',         coeficiente: 0.19 },
  { anios: 9,  label: '9 años',         coeficiente: 0.15 },
  { anios: 10, label: '10 años',        coeficiente: 0.12 },
  { anios: 11, label: '11 años',        coeficiente: 0.10 },
  { anios: 12, label: '12 años',        coeficiente: 0.09 },
  { anios: 13, label: '13 años',        coeficiente: 0.09 },
  { anios: 14, label: '14 años',        coeficiente: 0.09 },
  { anios: 15, label: '15 años',        coeficiente: 0.09 },
  { anios: 16, label: '16 años',        coeficiente: 0.10 },
  { anios: 17, label: '17 años',        coeficiente: 0.13 },
  { anios: 18, label: '18 años',        coeficiente: 0.17 },
  { anios: 19, label: '19 años',        coeficiente: 0.23 },
  { anios: 20, label: '20 o más años',  coeficiente: 0.40 },
];

/** Coeficiente del IIVTNU ya resuelto para un periodo de generación concreto. */
export interface CoeficienteIIVTNUAplicado {
  /** Coeficiente que multiplica al valor catastral del suelo. */
  coeficiente: number;
  /** Fila de la tabla de la que sale («Menos de 1 año», «7 años», «20 o más años»…). */
  label: string;
  /** Periodo inferior a un año: el coeficiente anual se ha prorrateado por meses completos. */
  prorrateado: boolean;
  /** Meses completos usados en el prorrateo (solo si `prorrateado`). */
  meses?: number;
  /**
   * Sin los meses, el prorrateo se hace con 11, el máximo que cabe por debajo del año: la
   * cifra es entonces un TECHO, y quien la publique tiene que decirlo.
   */
  cotaSuperior: boolean;
}

/**
 * El coeficiente del art. 107.4 TRLRHL para unos años de generación, con las dos reglas de
 * cómputo que el mismo apartado fija y que las siete consultas directas a la tabla aplicaban
 * cada una a su manera (verificado en el BOE el 24/09/2026, hallazgo 1560 del Inspector):
 *
 *  - «En el cómputo del número de años transcurridos se tomarán años completos»: `Math.floor`,
 *    con tope en 20 («Igual o superior a 20 años»).
 *  - «En el caso de que el periodo de generación sea inferior a un año, se prorrateará el
 *    coeficiente anual teniendo en cuenta el número de meses completos». Hasta ese día toda la
 *    reventa dentro del año se liquidaba con el coeficiente ENTERO, por encima de lo que la ley
 *    permite para cualquier número de meses.
 *
 * Sin `mesesCompletos` ni años con decimales (las apps que solo preguntan años enteros), un
 * periodo inferior al año se calcula con 11 meses y se marca `cotaSuperior`: es la cifra más
 * alta que la ley admite, no la del usuario.
 */
export function coeficienteIIVTNU(anios: number, mesesCompletos?: number): CoeficienteIIVTNUAplicado {
  const aniosCompletos = Math.min(Math.max(0, Math.floor(anios)), 20);
  const fila =
    COEFICIENTES_IIVTNU_2025.find((c) => c.anios === aniosCompletos) ??
    COEFICIENTES_IIVTNU_2025[COEFICIENTES_IIVTNU_2025.length - 1];
  if (aniosCompletos >= 1) {
    return { coeficiente: fila.coeficiente, label: fila.label, prorrateado: false, cotaSuperior: false };
  }
  // Unos años con decimales por debajo de uno ya dicen los meses (0,5 años = 6 meses completos),
  // que es como los reciben los motores de la API y el MCP.
  const deLosAnios = anios > 0 && anios < 1 ? anios * 12 : undefined;
  const mesesDados = mesesCompletos ?? deLosAnios;
  const sinMeses = mesesDados === undefined || !Number.isFinite(mesesDados);
  const meses = sinMeses ? 11 : Math.min(Math.max(0, Math.floor(mesesDados as number)), 11);
  return {
    coeficiente: (fila.coeficiente * meses) / 12,
    label: fila.label,
    prorrateado: true,
    meses,
    cotaSuperior: sinMeses,
  };
}
