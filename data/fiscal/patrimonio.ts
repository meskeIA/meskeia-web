/**
 * Datos fiscales: Impuesto sobre el Patrimonio (IP) e ITSGF
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado en 2026.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente principal: Ley 19/1991 del Impuesto sobre el Patrimonio
 *                  + Ley 38/2022 (Impuesto Solidaridad Grandes Fortunas)
 *                  + Normativa autonómica vigente
 * Verificado: 2025-01-15
 * URL oficial: https://sede.agenciatributaria.gob.es
 */

export const FISCAL_PATRIMONIO_META = {
  fuente: 'Ley 19/1991 del Impuesto sobre el Patrimonio (Art. 31) + normativa autonómica + Ley 38/2022 ITSGF',
  verificado: '2025-01-15',
  vigencia: '2025',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/iae-iva-otros-impuestos/impuesto-sobre-patrimonio.html',
  nota: 'Las bonificaciones autonómicas pueden modificarse cada ejercicio. Verifica con tu CCAA antes de tomar decisiones.',
};

// ─── Constantes del límite conjunto IRPF-Patrimonio (Art. 31 Ley 19/1991) ──

/**
 * Porcentaje del límite conjunto.
 * La suma de cuota íntegra IRPF + cuota íntegra Patrimonio
 * no puede superar el 60% de la suma de las bases imponibles del IRPF.
 */
export const LIMITE_CONJUNTO_PORCENTAJE = 0.60;

/**
 * Tope máximo de reducción sobre la cuota de Patrimonio.
 * La reducción nunca puede exceder del 80% de la cuota íntegra de Patrimonio,
 * por lo que siempre se paga al menos el 20% de la cuota.
 */
export const TOPE_REDUCCION_PORCENTAJE = 0.80;

// ─── ITSGF (Impuesto Temporal de Solidaridad de las Grandes Fortunas) ──

/**
 * Umbral de patrimonio neto a partir del cual aplica el ITSGF.
 * Patrimonios > 3M€ pueden tributar por ITSGF aunque su CCAA tenga
 * bonificación 100% en el Impuesto sobre el Patrimonio.
 *
 * Fuente: Ley 38/2022 + prórrogas posteriores.
 */
export const ITSGF_UMBRAL = 3_000_000;

export const ITSGF_META = {
  fuente: 'Ley 38/2022 — Impuesto Temporal de Solidaridad de las Grandes Fortunas',
  verificado: '2025-01-15',
  vigencia: '2025 (prorrogado)',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/iae-iva-otros-impuestos/impuesto-solidaridad-grandes-fortunas.html',
  nota: 'Aplica a patrimonios netos > 3M€. Coordinado con IP autonómico: si pagas IP, descuentas la cuota del ITSGF. Pensado para CCAA con bonificación 100%.',
};

// ─── Bonificaciones autonómicas en el Impuesto sobre el Patrimonio ──

export type BonificacionPatrimonio = 'total' | 'parcial' | 'normal';

export interface CCAAPatrimonio {
  id: string;
  nombre: string;
  bonificacion: BonificacionPatrimonio;
  porcentajeBonificacion: number; // 0 a 100
  minimoExento: number;           // mínimo exento aplicable (€) — el general estatal es 700.000
  foral?: boolean;                // régimen foral (Navarra, País Vasco): normativa propia
  itsgfInteraccion?: boolean;     // la bonificación es variable (depende del ITSGF, no es un % fijo)
  nota: string;
}

/**
 * Estado aproximado de bonificaciones autonómicas en IP para 2025.
 *
 * - 'total': bonificación cercana o igual al 100% → en la práctica no se paga IP
 *   (pero patrimonios > 3M€ pasan al ITSGF estatal).
 * - 'parcial': bonificación intermedia significativa.
 * - 'normal': sin bonificación general → IP se paga según tarifa autonómica.
 *
 * IMPORTANTE: este mapa es orientativo. Las bonificaciones cambian frecuentemente
 * por leyes autonómicas. Verifica con tu CCAA o con un asesor.
 */
export const BONIFICACIONES_CCAA_PATRIMONIO: CCAAPatrimonio[] = [
  { id: 'andalucia',         nombre: 'Andalucía',           bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, itsgfInteraccion: true,  nota: 'Bonificación ~100% coordinada con ITSGF (la cuota real depende de su interacción). Tarifa propia idéntica a la estatal.' },
  { id: 'aragon',            nombre: 'Aragón',              bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 400000, itsgfInteraccion: false, nota: 'Mínimo exento reducido a 400.000 €. Sin bonificación general. Tarifa estatal.' },
  { id: 'asturias',          nombre: 'Asturias',            bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 700000, itsgfInteraccion: false, nota: 'Sin bonificación general. Tarifa autonómica propia (tipos del 0,22% al 3,00%).' },
  { id: 'baleares',          nombre: 'Baleares',            bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 700000, itsgfInteraccion: false, nota: 'Sin bonificación general. Tarifa autonómica propia (tipos del 0,28% al 3,45%).' },
  { id: 'canarias',          nombre: 'Canarias',            bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 700000, itsgfInteraccion: false, nota: 'Sin bonificación general. Tarifa estatal.' },
  { id: 'cantabria',         nombre: 'Cantabria',           bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, itsgfInteraccion: true,  nota: 'Bonificación ~100% coordinada con ITSGF (la cuota real varía según el impuesto de solidaridad). Tarifa autonómica propia.' },
  { id: 'castilla-leon',     nombre: 'Castilla y León',     bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, itsgfInteraccion: true,  nota: 'Bonificación ~100% coordinada con ITSGF. Tarifa estatal.' },
  { id: 'castilla-la-mancha',nombre: 'Castilla-La Mancha',  bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 700000, itsgfInteraccion: false, nota: 'Sin bonificación general. Tarifa estatal.' },
  { id: 'cataluna',          nombre: 'Cataluña',            bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 500000, itsgfInteraccion: false, nota: 'Mínimo exento reducido a 500.000 €. Sin bonificación general. Tarifa propia más alta (0,21%–3,48%), con noveno tramo para patrimonios > 20 M€.' },
  { id: 'comunidad-valenciana', nombre: 'Comunidad Valenciana', bonificacion: 'normal', porcentajeBonificacion: 0, minimoExento: 500000, itsgfInteraccion: false, nota: 'Mínimo exento reducido a 500.000 €. Sin bonificación general. Tarifa autonómica propia (0,25%–3,50%).' },
  { id: 'extremadura',       nombre: 'Extremadura',         bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 500000, itsgfInteraccion: false, nota: 'Mínimo exento 500.000 €. Bonificación del 100% de la cuota desde 2023 (sin dependencia del ITSGF). Tarifa propia (0,30%–3,75%).' },
  { id: 'galicia',           nombre: 'Galicia',             bonificacion: 'parcial', porcentajeBonificacion: 50,  minimoExento: 700000, itsgfInteraccion: false, nota: 'Bonificación del 50% de la cuota. Tarifa propia idéntica a la estatal.' },
  { id: 'la-rioja',          nombre: 'La Rioja',            bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, itsgfInteraccion: true,  nota: 'Bonificación ~100% coordinada con ITSGF para patrimonios bajo 3,7 M€ (variable por encima). Tarifa estatal.' },
  { id: 'madrid',            nombre: 'Madrid',              bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, itsgfInteraccion: true,  nota: 'Bonificación ~100% coordinada con ITSGF (desde 2008; la cuota real depende de su interacción). Tarifa estatal.' },
  { id: 'murcia',            nombre: 'Murcia',              bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, itsgfInteraccion: true,  nota: 'Bonificación ~100% coordinada con ITSGF para patrimonios bajo 3,7 M€. Tarifa propia idéntica a la estatal.' },
  { id: 'navarra',           nombre: 'Navarra (foral)',     bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 550000, foral: true, itsgfInteraccion: false, nota: 'Régimen foral propio (mínimo orientativo 550.000 €) — consulta la Hacienda Foral de Navarra.' },
  { id: 'pais-vasco',        nombre: 'País Vasco (foral)',  bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 800000, foral: true, itsgfInteraccion: false, nota: 'Régimen foral propio (mínimo orientativo 800.000 €) — consulta la Diputación Foral correspondiente.' },
];

// ─── Datos estatales del Impuesto sobre el Patrimonio ──────────────────────────

/** Mínimo exento general estatal (€). Algunas CCAA lo reducen (ver array). */
export const MINIMO_EXENTO_ESTATAL = 700000;

/** Exención de la vivienda habitual (€) por contribuyente. Estatal. */
export const EXENCION_VIVIENDA_HABITUAL = 300000;

/**
 * Umbral de obligación de declarar por el valor BRUTO de bienes y derechos (€).
 * Si se supera, hay obligación de declarar AUNQUE la cuota sea cero (p. ej. por
 * bonificación autonómica) y con independencia de la comunidad autónoma.
 * Art. 37 Ley 19/1991.
 */
export const UMBRAL_OBLIGACION_DECLARAR = 2000000;

/** Obtiene el mínimo exento aplicable a una CCAA (o el estatal si no se encuentra). */
export function getMinimoExentoPatrimonio(ccaaId: string): number {
  const ccaa = BONIFICACIONES_CCAA_PATRIMONIO.find(c => c.id === ccaaId);
  return ccaa ? ccaa.minimoExento : MINIMO_EXENTO_ESTATAL;
}

// ─── Escalas autonómicas detalladas ─────────────────────────────────────────

/**
 * Tramo de escala de Patrimonio con cuota fija acumulada y tipo marginal.
 * Cálculo: cuota = cuotaFija + (base − desde) × tipoMarginal / 100
 */
export interface TramoPatrimonioDetallado {
  desde: number;
  hasta: number;
  cuotaFija: number;    // cuota acumulada al inicio del tramo
  tipoMarginal: number; // tipo marginal del tramo (%)
}

/**
 * Escalas autonómicas propias del Impuesto sobre el Patrimonio (IP) 2025.
 * Solo se almacenan las CCAA con tarifa diferente a la estatal.
 * Las demás (Galicia, Andalucía, Murcia, Aragón, Canarias, CyL, CLM, La Rioja, Madrid)
 * usan la escala estatal (con sus bonificaciones correspondientes).
 *
 * Fuente: Manual Práctico Impuesto sobre el Patrimonio 2025, AEAT
 * Verificado: 2026-06-18
 * URL: https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/patrimonio-2025/
 */
const ESCALAS_AUTONOMICAS_IP: Partial<Record<string, TramoPatrimonioDetallado[]>> = {
  /** Cataluña: Decreto Legislativo 1/2024 — tipos del 0,21% al 3,48%, noveno tramo > 20 M€ */
  cataluna: [
    { desde: 0,             hasta: 167129.45,   cuotaFija: 0,         tipoMarginal: 0.21  },
    { desde: 167129.45,     hasta: 334252.88,   cuotaFija: 350.97,    tipoMarginal: 0.315 },
    { desde: 334252.88,     hasta: 668499.75,   cuotaFija: 877.41,    tipoMarginal: 0.525 },
    { desde: 668499.75,     hasta: 1336999.75,  cuotaFija: 2632.21,   tipoMarginal: 0.945 },
    { desde: 1336999.75,    hasta: 2673999.01,  cuotaFija: 8949.54,   tipoMarginal: 1.365 },
    { desde: 2673999.01,    hasta: 5347998.03,  cuotaFija: 27199.58,  tipoMarginal: 1.785 },
    { desde: 5347998.03,    hasta: 10695996.06, cuotaFija: 74930.46,  tipoMarginal: 2.205 },
    { desde: 10695996.06,   hasta: 20000000,    cuotaFija: 192853.82, tipoMarginal: 2.75  },
    { desde: 20000000,      hasta: Infinity,    cuotaFija: 448713.93, tipoMarginal: 3.48  },
  ],
  /** Asturias: Art. 15 TR tributos cedidos — tipos del 0,22% al 3,00% */
  asturias: [
    { desde: 0,             hasta: 167129.45,   cuotaFija: 0,         tipoMarginal: 0.22  },
    { desde: 167129.45,     hasta: 334252.88,   cuotaFija: 367.68,    tipoMarginal: 0.33  },
    { desde: 334252.88,     hasta: 668499.75,   cuotaFija: 919.19,    tipoMarginal: 0.56  },
    { desde: 668499.75,     hasta: 1336999.51,  cuotaFija: 2790.97,   tipoMarginal: 1.02  },
    { desde: 1336999.51,    hasta: 2673999.01,  cuotaFija: 9609.67,   tipoMarginal: 1.48  },
    { desde: 2673999.01,    hasta: 5347998.03,  cuotaFija: 29397.26,  tipoMarginal: 1.97  },
    { desde: 5347998.03,    hasta: 10695996.06, cuotaFija: 82075.05,  tipoMarginal: 2.48  },
    { desde: 10695996.06,   hasta: Infinity,    cuotaFija: 214705.40, tipoMarginal: 3.00  },
  ],
  /** Baleares: tipos del 0,28% al 3,45% — tramos distintos a los estatales */
  baleares: [
    { desde: 0,             hasta: 170472.04,   cuotaFija: 0,         tipoMarginal: 0.28  },
    { desde: 170472.04,     hasta: 340937.04,   cuotaFija: 477.32,    tipoMarginal: 0.41  },
    { desde: 340937.04,     hasta: 681869.75,   cuotaFija: 1176.23,   tipoMarginal: 0.69  },
    { desde: 681869.75,     hasta: 1336739.51,  cuotaFija: 3528.67,   tipoMarginal: 1.24  },
    { desde: 1336739.51,    hasta: 2727479.00,  cuotaFija: 11649.06,  tipoMarginal: 1.79  },
    { desde: 2727479.00,    hasta: 5454958.00,  cuotaFija: 36543.30,  tipoMarginal: 2.35  },
    { desde: 5454958.00,    hasta: 10909915.99, cuotaFija: 100639.06, tipoMarginal: 2.90  },
    { desde: 10909915.99,   hasta: Infinity,    cuotaFija: 258832.84, tipoMarginal: 3.45  },
  ],
  /** Extremadura: D.Leg. 1/2018 — tipos del 0,30% al 3,75% (bonif. 100%) */
  extremadura: [
    { desde: 0,             hasta: 167129.45,   cuotaFija: 0,         tipoMarginal: 0.30  },
    { desde: 167129.45,     hasta: 334252.88,   cuotaFija: 501.39,    tipoMarginal: 0.45  },
    { desde: 334252.88,     hasta: 668499.75,   cuotaFija: 1253.44,   tipoMarginal: 0.75  },
    { desde: 668499.75,     hasta: 1336999.51,  cuotaFija: 3760.30,   tipoMarginal: 1.35  },
    { desde: 1336999.51,    hasta: 2673999.01,  cuotaFija: 12785.04,  tipoMarginal: 1.95  },
    { desde: 2673999.01,    hasta: 5347998.03,  cuotaFija: 38856.53,  tipoMarginal: 2.55  },
    { desde: 5347998.03,    hasta: 10695996.06, cuotaFija: 107043.51, tipoMarginal: 3.15  },
    { desde: 10695996.06,   hasta: Infinity,    cuotaFija: 275505.45, tipoMarginal: 3.75  },
  ],
  /** Cantabria: TR 2008 — tipos del 0,24% al 3,03% */
  cantabria: [
    { desde: 0,             hasta: 167129.45,   cuotaFija: 0,         tipoMarginal: 0.24  },
    { desde: 167129.45,     hasta: 334252.88,   cuotaFija: 401.11,    tipoMarginal: 0.36  },
    { desde: 334252.88,     hasta: 668499.75,   cuotaFija: 1002.75,   tipoMarginal: 0.61  },
    { desde: 668499.75,     hasta: 1336999.51,  cuotaFija: 3041.66,   tipoMarginal: 1.09  },
    { desde: 1336999.51,    hasta: 2673999.01,  cuotaFija: 10328.31,  tipoMarginal: 1.57  },
    { desde: 2673999.01,    hasta: 5347998.03,  cuotaFija: 31319.20,  tipoMarginal: 2.06  },
    { desde: 5347998.03,    hasta: 10695996.06, cuotaFija: 86403.58,  tipoMarginal: 2.54  },
    { desde: 10695996.06,   hasta: Infinity,    cuotaFija: 222242.73, tipoMarginal: 3.03  },
  ],
  /** Comunitat Valenciana: Ley 13/1997 — tipos del 0,25% al 3,50% */
  'comunidad-valenciana': [
    { desde: 0,             hasta: 167129.45,   cuotaFija: 0,         tipoMarginal: 0.25  },
    { desde: 167129.45,     hasta: 334252.88,   cuotaFija: 417.82,    tipoMarginal: 0.37  },
    { desde: 334252.88,     hasta: 668499.75,   cuotaFija: 1036.18,   tipoMarginal: 0.62  },
    { desde: 668499.75,     hasta: 1336999.51,  cuotaFija: 3108.51,   tipoMarginal: 1.12  },
    { desde: 1336999.51,    hasta: 2673999.01,  cuotaFija: 10595.71,  tipoMarginal: 1.62  },
    { desde: 2673999.01,    hasta: 5347998.03,  cuotaFija: 32255.10,  tipoMarginal: 2.12  },
    { desde: 5347998.03,    hasta: 10695996.06, cuotaFija: 88943.88,  tipoMarginal: 2.62  },
    { desde: 10695996.06,   hasta: Infinity,    cuotaFija: 229061.43, tipoMarginal: 3.50  },
  ],
};

/** Calcula la cuota bruta con una escala detallada (cuotaFija + tipoMarginal). */
function calcularCuotaConEscalaDetallada(
  tramos: TramoPatrimonioDetallado[],
  base: number,
): number {
  if (base <= 0) return 0;
  for (let i = tramos.length - 1; i >= 0; i--) {
    if (base > tramos[i].desde) {
      return tramos[i].cuotaFija + (base - tramos[i].desde) * (tramos[i].tipoMarginal / 100);
    }
  }
  return 0;
}

export interface ResultadoCuotaCCAA {
  cuotaBruta: number;
  porcentajeBonificacion: number; // 0–100
  cuotaNeta: number;
  escalaUsada: 'autonómica' | 'estatal';
  itsgfInteraccion: boolean;
  esForal: boolean;
}

/**
 * Calcula la cuota orientativa del IP para una CCAA específica.
 * Aplica la escala autonómica propia (si existe) o la estatal,
 * seguida de la bonificación de la comunidad.
 *
 * ⚠️ Para CCAs con itsgfInteraccion: la bonificación real depende del ITSGF —
 * el resultado orientativo muestra el 100% teórico, pero la cuota real puede
 * diferir (el ITSGF actúa como suelo mínimo).
 * ⚠️ Para CCAs forales: resultado según normativa estatal (orientativo).
 */
export function calcularCuotaPatrimonioCCAA(
  ccaaId: string,
  baseLiquidable: number,
): ResultadoCuotaCCAA {
  const ccaa = BONIFICACIONES_CCAA_PATRIMONIO.find((c) => c.id === ccaaId);
  const escalaPropia = ESCALAS_AUTONOMICAS_IP[ccaaId];

  const cuotaBruta = escalaPropia
    ? calcularCuotaConEscalaDetallada(escalaPropia, baseLiquidable)
    : calcularCuotaPatrimonioEstatal(baseLiquidable);

  const bonif = ccaa?.porcentajeBonificacion ?? 0;
  const cuotaNeta = Math.max(0, cuotaBruta * (1 - bonif / 100));

  return {
    cuotaBruta,
    porcentajeBonificacion: bonif,
    cuotaNeta,
    escalaUsada: escalaPropia ? 'autonómica' : 'estatal',
    itsgfInteraccion: ccaa?.itsgfInteraccion ?? false,
    esForal: ccaa?.foral ?? false,
  };
}

// ─── Escala estatal (mantenida para compatibilidad y como fallback) ───────────

/**
 * Escala estatal del Impuesto sobre el Patrimonio (art. 30 Ley 19/1991).
 * Se aplica sobre la base liquidable (base imponible − mínimo exento).
 * Es la escala por defecto; cada CCAA puede aprobar la suya.
 */
export interface TramoPatrimonio {
  hasta: number;
  tipo: number; // %
}

export const ESCALA_PATRIMONIO_ESTATAL: TramoPatrimonio[] = [
  { hasta: 167129.45,   tipo: 0.2 },
  { hasta: 334252.88,   tipo: 0.3 },
  { hasta: 668499.75,   tipo: 0.5 },
  { hasta: 1336999.51,  tipo: 0.9 },
  { hasta: 2673999.01,  tipo: 1.3 },
  { hasta: 5347998.03,  tipo: 1.7 },
  { hasta: 10695996.06, tipo: 2.1 },
  { hasta: Infinity,    tipo: 3.5 },
];

/** Calcula la cuota íntegra estatal (orientativa) sobre la base liquidable. */
export function calcularCuotaPatrimonioEstatal(baseLiquidable: number): number {
  let cuota = 0;
  let restante = Math.max(0, baseLiquidable);
  let limiteAnterior = 0;
  for (const tramo of ESCALA_PATRIMONIO_ESTATAL) {
    const anchura = tramo.hasta - limiteAnterior;
    const base = Math.min(restante, anchura);
    if (base <= 0) break;
    cuota += base * (tramo.tipo / 100);
    restante -= base;
    limiteAnterior = tramo.hasta;
  }
  return cuota;
}

// ─── Lógica de orientación: ¿se beneficia del límite conjunto? ──

export type ResultadoOrientacion =
  | { tipo: 'descarte-bonificacion'; mensaje: string; aplicaItsgf: boolean }
  | { tipo: 'descarte-no-supera-limite'; mensaje: string; excesoOMargen: number }
  | { tipo: 'posible'; reduccionEstimada: number; cuotaPatrimonioEstimada: number; mensaje: string };

export interface InputsOrientador {
  ccaaId: string;
  bi_irpf: number;
  cuota_irpf: number;
  cuota_patrimonio: number;
  patrimonioNeto: number; // Estimación opcional, para detectar tramo ITSGF
}

/**
 * Orienta a un contribuyente sobre si puede beneficiarse de la reducción
 * del límite conjunto IRPF-Patrimonio (Art. 31 Ley 19/1991).
 *
 * Devuelve uno de tres estados: descarte por bonificación CCAA, descarte por
 * no superar el límite, o posible beneficio (con cifras orientativas).
 *
 * IMPORTANTE: este cálculo es orientativo. El cálculo exacto requiere prorrateo
 * individual entre cónyuges en IRPF conjunto, exclusión de bienes improductivos
 * (Art. 31.1.b), aplicación de coeficientes de la base liquidable y otros matices.
 */
export function orientarLimiteConjunto(inputs: InputsOrientador): ResultadoOrientacion {
  const ccaa = BONIFICACIONES_CCAA_PATRIMONIO.find(c => c.id === inputs.ccaaId);

  // Caso 1: CCAA con bonificación total
  if (ccaa?.bonificacion === 'total') {
    const aplicaItsgf = inputs.patrimonioNeto >= ITSGF_UMBRAL;
    return {
      tipo: 'descarte-bonificacion',
      aplicaItsgf,
      mensaje: aplicaItsgf
        ? `En ${ccaa.nombre}, el Impuesto sobre el Patrimonio está bonificado al 100%, por lo que el límite conjunto del Art. 31 no aplica en tu caso. Como tu patrimonio supera los 3.000.000 €, podría aplicarte el ITSGF (Impuesto de Solidaridad de las Grandes Fortunas). Consulta con un asesor fiscal para evaluarlo.`
        : `En ${ccaa.nombre}, el Impuesto sobre el Patrimonio está bonificado al 100%. Como en la práctica no pagas cuota de Patrimonio, no hay nada que reducir mediante el límite conjunto.`,
    };
  }

  // Caso 2: la suma no supera el 60% de la BI IRPF
  const sumaCuotas = inputs.cuota_irpf + inputs.cuota_patrimonio;
  const limite60 = LIMITE_CONJUNTO_PORCENTAJE * inputs.bi_irpf;
  const exceso = sumaCuotas - limite60;

  if (exceso <= 0) {
    return {
      tipo: 'descarte-no-supera-limite',
      excesoOMargen: -exceso, // margen positivo (cuánto te falta para superar)
      mensaje: `La suma de tu cuota íntegra IRPF más la cuota íntegra de Patrimonio (${formatoEuros(sumaCuotas)}) no supera el 60% de tu base imponible IRPF (${formatoEuros(limite60)}). La reducción del Art. 31 no se activa en tu caso.`,
    };
  }

  // Caso 3: sí se beneficia (al menos en orientación)
  const topeReduccion = TOPE_REDUCCION_PORCENTAJE * inputs.cuota_patrimonio;
  const reduccionAplicable = Math.min(exceso, topeReduccion);
  const cuotaPatrimonioEstimada = inputs.cuota_patrimonio - reduccionAplicable;

  return {
    tipo: 'posible',
    reduccionEstimada: reduccionAplicable,
    cuotaPatrimonioEstimada,
    mensaje: `Podrías beneficiarte del límite conjunto del Art. 31. La reducción orientativa estimada es de ${formatoEuros(reduccionAplicable)} sobre la cuota de Patrimonio. Acude a un asesor fiscal para que aplique el cálculo exacto.`,
  };
}

// Helper interno (sin importar @/lib para mantener el módulo de datos auto-contenido)
function formatoEuros(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
