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
  { id: 'andalucia',         nombre: 'Andalucía',           bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, nota: 'Bonificación 100% desde 2022 (alternativa al tipo del ITSGF)' },
  { id: 'aragon',            nombre: 'Aragón',              bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 400000, nota: 'Mínimo exento reducido a 400.000 €. Sin bonificación general' },
  { id: 'asturias',          nombre: 'Asturias',            bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 700000, nota: 'Sin bonificación general — tarifa autonómica propia' },
  { id: 'baleares',          nombre: 'Baleares',            bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 700000, nota: 'Sin bonificación general' },
  { id: 'canarias',          nombre: 'Canarias',            bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 700000, nota: 'Sin bonificación general' },
  { id: 'cantabria',         nombre: 'Cantabria',           bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, nota: 'Bonificación general 100% desde 2024' },
  { id: 'castilla-leon',     nombre: 'Castilla y León',     bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, nota: 'Bonificación 100% desde 2024' },
  { id: 'castilla-la-mancha',nombre: 'Castilla-La Mancha',  bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 700000, nota: 'Sin bonificación general' },
  { id: 'cataluna',          nombre: 'Cataluña',            bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 500000, nota: 'Mínimo exento reducido a 500.000 €. Tarifa autonómica propia, más alta que la estatal' },
  { id: 'comunidad-valenciana', nombre: 'Comunidad Valenciana', bonificacion: 'normal', porcentajeBonificacion: 0, minimoExento: 500000, nota: 'Mínimo exento reducido a 500.000 €. Tarifa autonómica propia' },
  { id: 'extremadura',       nombre: 'Extremadura',         bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 500000, nota: 'Mínimo exento 500.000 € con bonificación 100% de la cuota desde 2023' },
  { id: 'galicia',           nombre: 'Galicia',             bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, nota: 'Bonificación 100% desde 2023 (con matices)' },
  { id: 'la-rioja',          nombre: 'La Rioja',            bonificacion: 'parcial', porcentajeBonificacion: 50,  minimoExento: 700000, nota: 'Bonificación parcial (deducción autonómica)' },
  { id: 'madrid',            nombre: 'Madrid',              bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, nota: 'Bonificación 100% histórica' },
  { id: 'murcia',            nombre: 'Murcia',              bonificacion: 'total',   porcentajeBonificacion: 100, minimoExento: 700000, nota: 'Bonificación 100% desde 2023' },
  { id: 'navarra',           nombre: 'Navarra (foral)',     bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 550000, foral: true, nota: 'Régimen foral propio (mínimo orientativo 550.000 €) — consulta la Hacienda Foral de Navarra' },
  { id: 'pais-vasco',        nombre: 'País Vasco (foral)',  bonificacion: 'normal',  porcentajeBonificacion: 0,   minimoExento: 800000, foral: true, nota: 'Régimen foral propio (mínimo orientativo 800.000 €) — consulta la Diputación Foral correspondiente' },
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
