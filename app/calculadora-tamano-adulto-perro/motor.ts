/**
 * Ración diaria orientativa del cachorro — la energía que necesita mientras crece y los gramos
 * de pienso que la contienen. Semilla S0207 (16/10/2026).
 *
 * Vive fuera de `page.tsx`, sin dependencias, porque el build compila la vista sin comprobar si
 * la cuenta está bien ([[feedback_motor_calculo_aparte_y_probado]]). Sus casos resueltos a mano
 * están en `tests/apps/calculadora-tamano-adulto-perro.spec.ts`.
 *
 * ── LA ECUACIÓN ─────────────────────────────────────────────────────────────
 *
 * National Research Council (2006), Nutrient Requirements of Dogs and Cats, ecuación de
 * crecimiento para cachorros después del destete:
 *
 *     EM (kcal/día) = 130 × PV^0,75 × 3,2 × (e^(−0,87·p) − 0,1)
 *
 *   PV = peso actual en kg · p = peso actual ÷ peso adulto esperado.
 *
 * Reproducida literalmente en Bradley et al. (2021), «Energy Requirements for Growth in the
 * Norfolk Terrier», Animals 11(5):1380, doi:10.3390/ani11051380, y con las mismas variables en
 * Alexander et al. (2017), «Energy requirements for growth in the Yorkshire terrier», Journal of
 * Nutritional Science 6:e26, doi:10.1017/jns.2017.26 (consultados el 16/10/2026).
 *
 * ⚠️ Esos dos estudios midieron que la ecuación SOBRESTIMA lo que comen de verdad cachorros de
 * raza pequeña en condición corporal ideal, sobre todo antes de las 20 semanas, y en los machos
 * más que en las hembras. La vista lo dice al lado de la cifra: es un punto de partida que se
 * ajusta con el peso semana a semana, no una dieta.
 *
 * ── POR QUÉ VA EN ESTA APP ──────────────────────────────────────────────────
 *
 * p es exactamente el «crecimiento actual» que la app ya calcula con su curva (el peso adulto
 * estimado es peso ÷ ese porcentaje). La ecuación necesita el único dato que el dueño no tiene a
 * mano —cuánto pesará de adulto—, y por eso esta app es la puerta, no la de alimentación.
 * No usa el RER (70 × PV^0,75) de `calculadora-alimentacion-mascotas`: es otra ecuación, y no
 * hay nada que compartir con ella.
 *
 * Nada lanza: un dato fuera de rango devuelve NaN, y la vista no pinta cifra.
 */

/** Constante de la ecuación de crecimiento del NRC (2006), en kcal/kg^0,75. */
export const NRC_BASE_KCAL = 130;
/** Factor de crecimiento de la misma ecuación. */
export const NRC_FACTOR_CRECIMIENTO = 3.2;
/** Exponente del término de p. */
export const NRC_COEFICIENTE_P = 0.87;

/**
 * Energía metabolizable diaria de un cachorro, en kcal/día. `fraccionAdulto` es p, entre 0 y 1:
 * 1 es un perro que ya ha terminado de crecer. NaN si algún dato es imposible.
 */
export function energiaCrecimientoKcal(pesoActualKg: number, fraccionAdulto: number): number {
  if (!Number.isFinite(pesoActualKg) || pesoActualKg <= 0) return NaN;
  if (!Number.isFinite(fraccionAdulto) || fraccionAdulto <= 0 || fraccionAdulto > 1) return NaN;
  return (
    NRC_BASE_KCAL *
    Math.pow(pesoActualKg, 0.75) *
    NRC_FACTOR_CRECIMIENTO *
    (Math.exp(-NRC_COEFICIENTE_P * fraccionAdulto) - 0.1)
  );
}

/**
 * Densidad energética admitida para el pienso, en kcal/kg: de la comida húmeda más ligera
 * (~700) al pienso seco más denso (~5000). Fuera de eso, casi seguro que se ha escrito en
 * otra unidad (kcal/100 g, MJ/kg), y la vista lo dice en vez de dar unos gramos absurdos.
 */
export const KCAL_POR_KG_MIN = 500;
export const KCAL_POR_KG_MAX = 6000;

/** Gramos de pienso que contienen `kcalDia`, con su energía metabolizable en kcal/kg. */
export function gramosDePienso(kcalDia: number, kcalPorKg: number): number {
  if (!Number.isFinite(kcalDia) || kcalDia <= 0) return NaN;
  if (!Number.isFinite(kcalPorKg) || kcalPorKg < KCAL_POR_KG_MIN || kcalPorKg > KCAL_POR_KG_MAX) return NaN;
  return (kcalDia / kcalPorKg) * 1000;
}

/*
 * ── «NO SÉ SU TAMAÑO»: QUÉ TAMAÑOS ENCAJAN CON SU PESO ────────────────────────
 *
 * Semilla S0283 (19/11/2026). Quien tiene un mestizo no puede elegir el «tamaño esperado de la
 * raza», que es justo lo que pregunta («¿cómo saber si un cachorro va a ser grande?»: 132
 * impresiones en 90 días a las que Google enseñaba la app por debajo de la posición 20).
 *
 * La app ya tiene lo necesario para contestarlo sin inventar nada: cada tamaño tiene su curva
 * (qué fracción del peso adulto lleva a esa edad) y su rango de peso adulto habitual. Se prueba
 * cada curva y se queda con los tamaños cuya proyección cae DENTRO de su propio rango. Es el
 * mismo contraste que la vista ya hacía con el tamaño elegido («la proyección encaja con la
 * categoría…»), recorrido sobre los cinco.
 *
 * Los rangos se solapan (pequeño 4-15 kg, mediano 8-20), así que a menudo encajan DOS tamaños,
 * y entonces la respuesta honrada es la horquilla de los dos, no una cifra. Si no encaja
 * ninguno (un peso imposible para su edad o un error al teclear), se devuelve el más cercano
 * con `encaja: false` para que la vista lo diga.
 */

/** Un tamaño candidato: la fracción del peso adulto que su curva da a esta edad y su rango. */
export interface CandidataTamano<T extends string> {
  tamano: T;
  /** Fracción del peso adulto ya alcanzada según la curva de ese tamaño, entre 0 y 1. */
  fraccion: number;
  /** Peso adulto habitual del tamaño, en kg. */
  min: number;
  max: number;
}

export interface TamanoQueEncaja<T extends string> {
  tamano: T;
  /** Peso adulto proyectado con la curva de ese tamaño, en kg. */
  pesoAdulto: number;
  /** false solo cuando no encajaba ninguno y este es el más cercano. */
  encaja: boolean;
}

/**
 * Los tamaños cuya proyección (peso ÷ fracción) cae dentro de su propio rango, en el orden en
 * que llegan. Si no encaja ninguno, el más cercano en escala logarítmica, con `encaja: false`.
 * Lista vacía si el peso o alguna fracción son imposibles.
 */
export function tamanosQueEncajan<T extends string>(
  pesoActualKg: number,
  candidatas: CandidataTamano<T>[],
): TamanoQueEncaja<T>[] {
  if (!Number.isFinite(pesoActualKg) || pesoActualKg <= 0 || candidatas.length === 0) return [];
  if (candidatas.some((c) => !Number.isFinite(c.fraccion) || c.fraccion <= 0 || c.fraccion > 1)) return [];

  const proyectadas = candidatas.map((c) => {
    const pesoAdulto = pesoActualKg / c.fraccion;
    // Distancia al rango en escala logarítmica: 0 dentro; fuera, cuántas veces se pasa o no llega
    const distancia = pesoAdulto < c.min ? Math.log(c.min / pesoAdulto)
      : pesoAdulto > c.max ? Math.log(pesoAdulto / c.max)
        : 0;
    return { tamano: c.tamano, pesoAdulto, distancia };
  });

  const dentro = proyectadas.filter((p) => p.distancia === 0);
  if (dentro.length > 0) return dentro.map(({ tamano, pesoAdulto }) => ({ tamano, pesoAdulto, encaja: true }));

  const cercana = proyectadas.reduce((a, b) => (b.distancia < a.distancia ? b : a));
  return [{ tamano: cercana.tamano, pesoAdulto: cercana.pesoAdulto, encaja: false }];
}
