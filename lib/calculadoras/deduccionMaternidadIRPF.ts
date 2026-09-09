/**
 * Calculadora de la Deduccion por Maternidad en IRPF
 * Usada por: MCP server (calcular_deduccion_maternidad_irpf)
 *
 * Calcula la deduccion por maternidad y el incremento adicional por gastos
 * en guarderia o centros de educacion infantil, aplicables en el IRPF.
 *
 * Marco normativo:
 *   - LIRPF art. 81: deduccion por maternidad
 *   - LIRPF art. 81.2: incremento adicional por guarderia
 *   - Ley 31/2022 (PGE 2023), art. 64: redaccion vigente desde el 01-ene-2023
 *
 * DEDUCCION POR MATERNIDAD — REDACCION VIGENTE (Ley 31/2022):
 *   La reforma de 2023 AMPLIO las VIAS DE ACCESO, no las suprimio. Sigue haciendo
 *   falta alguna relacion con el sistema de Seguridad Social; lo que cambio es que
 *   ya no se exige estar de alta y en activo en el momento del nacimiento.
 *
 *   Vias del art. 81.1 — son ALTERNATIVAS, basta cumplir UNA (data/fiscal/maternidad.ts,
 *   `situacionesConDerecho`):
 *     1. 'alta'           — de alta en la Seguridad Social o mutualidad alternativa.
 *     2. 'desempleo'      — percibiendo prestacion o subsidio de desempleo al nacer el menor.
 *     3. 'alta-posterior' — alta posterior al nacimiento, al alcanzar 30 dias cotizados.
 *   Quien no encaja en ninguna ('ninguna') NO tiene derecho: la deduccion es 0 €.
 *
 *   CUANTIA:
 *   - 1.200 EUR por cada hijo menor de 3 anos (100 EUR/mes por mes completo)
 *   - Art. 81.3, parrafo 2: por la via 'alta-posterior', la deduccion del mes en que se
 *     completan los 30 dias cotizados se incrementa en 150 EUR.
 *   - Limite: no puede superar las cotizaciones y cuotas totales a la SS del ejercicio.
 *
 *   ABONO ANTICIPADO:
 *   - 100 EUR/mes/hijo, se solicita en el modelo 140 de la AEAT.
 *
 * INCREMENTO ADICIONAL POR GUARDERIA (art. 81.2):
 *   - Gastos en guarderias o centros de educacion infantil autorizados, hijos < 3 anos.
 *   - Limite POR CADA HIJO (Manual practico Renta 2025, «Limites de la deduccion»:
 *     «El incremento de la deduccion por cada hijo que otorgue derecho a la misma no podra
 *     superar PARA CADA HIJO ninguno de los dos limites»):
 *       a) 1.000 EUR anuales, y
 *       b) el gasto efectivo NO subvencionado satisfecho en relacion con ESE hijo.
 *   - La madre debe estar dada de alta en la SS (vias 'alta' y 'alta-posterior').
 *   - Se declara en la renta anual (NO hay abono anticipado de este incremento).
 *
 * INCOMPATIBILIDADES:
 *   - Las deducciones del art. 81 bis (familia numerosa, discapacidad) son
 *     compatibles con la deduccion por maternidad, pero el abono anticipado
 *     de la maternidad es incompatible con el abono anticipado del art. 81 bis.
 *
 * Los importes (1.200 / 100 / 1.000 / 150) NO se hardcodean aqui: se importan de
 * data/fiscal/maternidad.ts, que es donde se re-sellan en la revision fiscal.
 *
 * Encadenable con: calcular_irpf, calcular_deduccion_familia_numerosa
 */
import {
  DEDUCCION_MATERNIDAD_IRPF,
  FISCAL_MATERNIDAD_META,
} from '@/data/fiscal/maternidad';

// --- Constantes (fuente unica: data/fiscal/maternidad.ts) ---

const DEDUCCION_MATERNIDAD_ANUAL = DEDUCCION_MATERNIDAD_IRPF.importeAnualPorHijo;              // 1.200 EUR/hijo
const DEDUCCION_MATERNIDAD_MENSUAL = DEDUCCION_MATERNIDAD_IRPF.importeMensualPorHijo;          // 100 EUR/mes
const INCREMENTO_MAX_GUARDERIA = DEDUCCION_MATERNIDAD_IRPF.incrementoGuarderia.importeMaximoAnual; // 1.000 EUR/hijo
const INCREMENTO_ALTA_POSTERIOR = DEDUCCION_MATERNIDAD_IRPF.incrementoAltaPosterior.importe;   // 150 EUR
const MESES_LIMITE_EDAD = 36; // El derecho se pierde al cumplir 3 anos

// --- Tipos publicos ---

/**
 * Situacion de la madre frente al art. 81.1 LIRPF. Las tres primeras son las vias
 * ALTERNATIVAS que dan derecho; 'ninguna' es no cumplir ninguna de ellas.
 * Mismo tipo union que usa la app hermana `estimacion-deduccion-maternidad`.
 */
export type SituacionMaternidad = 'alta' | 'desempleo' | 'alta-posterior' | 'ninguna';

export interface HijoDeduccionMaternidad {
  /** Edad del hijo en meses al inicio del ejercicio (0-35 — hasta 3 anos) */
  edadMesesInicioEjercicio: number;
  /** Meses en los que el hijo es menor de 3 anos en el ejercicio (1-12) */
  mesesConDerechoEjercicio: number;
  /** Gastos pagados en guarderia o centro educacion infantil por este hijo en el ejercicio (EUR) */
  gastosGuarderiaAnuales?: number;
}

export interface ParametrosDeduccionMaternidadIRPF {
  hijos: HijoDeduccionMaternidad[];
  /**
   * Cotizaciones totales a la SS pagadas en el ejercicio por la madre (EUR)
   * Incluye cuota obrera de RETA o de Regimen General
   * Usado para verificar el limite de la deduccion
   */
  cotizacionesSSTotalesAnio: number;
  /**
   * Via del art. 81.1 por la que se accede a la deduccion. Es el parametro preferente:
   * distingue las TRES vias con derecho de la ausencia de derecho ('ninguna').
   * Por defecto 'alta'.
   */
  situacion?: SituacionMaternidad;
  /**
   * @deprecated Compatibilidad con la firma anterior, que colapsaba las cuatro
   * situaciones en un booleano. Solo se lee si `situacion` no viene:
   * `false` → 'ninguna' (sin derecho) · `true` o ausente → 'alta'.
   */
  madreEnActivoOPrestacion?: boolean;
  /** Solicito abono anticipado (modelo 140) para el ejercicio? */
  abonoAnticipado?: boolean;
  /** Importe ya cobrado como abono anticipado en el ejercicio (EUR) */
  importeAbonoAnticipadoCobrado?: number;
}

export interface DetalleHijoMaternidad {
  mesesConDerecho: number;
  /** Deduccion por maternidad bruta de este hijo: meses x 100 EUR, antes de limites */
  deduccionBruta: number;
  /** Art. 81.3: 150 EUR del mes en que se completan los 30 dias cotizados (solo via 'alta-posterior') */
  incrementoAltaPosterior: number;
  /** Parte del total publicado que corresponde a la maternidad de este hijo, ya recortada por el limite */
  deduccionMaternidadEfectivaHijo: number;
  gastosGuarderia: number;
  incrementoGuarderia: number;
  /** Deduccion efectiva total de este hijo. La suma de estas lineas ES `totalDeduccionEfectiva` */
  totalDeduccionHijo: number;
}

export interface ResultadoDeduccionMaternidadIRPF {
  /** Via del art. 81.1 efectivamente aplicada (ya resuelta la compatibilidad hacia atras) */
  situacion: SituacionMaternidad;
  /** false cuando no se cumple ninguna de las tres vias del art. 81.1 */
  tieneDerecho: boolean;
  /** Numero de hijos con derecho a deduccion */
  numHijosConDerecho: number;
  detalleHijos: DetalleHijoMaternidad[];
  /** Suma de deducciones brutas por maternidad, incluidos los 150 EUR del art. 81.3 (antes del limite) */
  totalDeduccionBruta: number;
  /** Suma de los 150 EUR del art. 81.3 por hijo (solo via 'alta-posterior') */
  totalIncrementoAltaPosterior: number;
  /** Incremento adicional por guarderia efectivo */
  totalIncrementoGuarderia: number;
  /** Limite por cotizaciones SS. Sin derecho es 0: no hay deduccion que limitar */
  limiteMaternidadCotizaciones: number;
  /** Deduccion por maternidad efectiva (tras limite) */
  deduccionMaternidadEfectiva: number;
  /** Incremento guarderia efectivo (tras limite) */
  incrementoGuarderiaEfectivo: number;
  /** Total deduccion efectiva (maternidad + guarderia) */
  totalDeduccionEfectiva: number;
  /** Cantidad ya cobrada como abono anticipado */
  abonoAnticipadoCobrado: number;
  /** Resultado en la declaracion: positivo = cobrar, negativo = devolver */
  resultadoDeclaracion: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Utilidades internas ---

const r = (n: number) => Math.round(n * 100) / 100;

/**
 * Reparte `total` entre lineas proporcionalmente a `pesos`, en centimos y por restos
 * mayores, de modo que la suma de las lineas publicadas sea EXACTAMENTE el total
 * publicado. Sin esto, 1.000 / 3 se publica tres veces como 333,33 y suma 999,99.
 */
function repartirEnCentimos(total: number, pesos: number[]): number[] {
  if (pesos.length === 0) return [];
  const centimos = Math.round(total * 100);
  const sumaPesos = pesos.reduce((s, x) => s + x, 0);
  if (centimos <= 0 || sumaPesos <= 0) return pesos.map(() => 0);

  const exactos = pesos.map((p) => (centimos * p) / sumaPesos);
  const asignados = exactos.map((x) => Math.floor(x));
  let resto = centimos - asignados.reduce((s, x) => s + x, 0);
  const orden = exactos
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; resto > 0 && k < orden.length; k++, resto--) {
    asignados[orden[k].i] += 1;
  }
  return asignados.map((c) => c / 100);
}

/** Resuelve la via aplicable manteniendo compatibilidad con el parametro booleano anterior. */
function resolverSituacion(p: ParametrosDeduccionMaternidadIRPF): SituacionMaternidad {
  if (p.situacion) return p.situacion;
  if (p.madreEnActivoOPrestacion === false) return 'ninguna';
  return 'alta';
}

// --- Funcion principal ---

export function calcularDeduccionMaternidadIRPF(
  p: ParametrosDeduccionMaternidadIRPF
): ResultadoDeduccionMaternidadIRPF {
  if (!p.hijos || p.hijos.length === 0) throw new Error('Debe indicar al menos un hijo.');
  if (p.cotizacionesSSTotalesAnio < 0) throw new Error('Las cotizaciones no pueden ser negativas.');

  const advertencias: string[] = [];

  const situacion = resolverSituacion(p);
  const tieneDerecho = situacion !== 'ninguna';
  // El incremento por guarderia exige alta en la SS: las vias 'alta' y 'alta-posterior'.
  const estaDeAltaEnSS = situacion === 'alta' || situacion === 'alta-posterior';
  const porAltaPosterior = situacion === 'alta-posterior';

  const detalleHijos: DetalleHijoMaternidad[] = [];
  let hijosDescartadosPorEdad = 0;
  let hijosDescartadosSinMeses = 0;
  let huboGastosNegativos = false;
  const mesesIncoherentes: string[] = [];

  for (let i = 0; i < p.hijos.length; i++) {
    const hijo = p.hijos[i];
    // Solo aplica si el hijo es menor de 36 meses (3 anos)
    if (hijo.edadMesesInicioEjercicio >= MESES_LIMITE_EDAD) {
      hijosDescartadosPorEdad++;
      continue;
    }
    const meses = Math.max(0, Math.min(12, hijo.mesesConDerechoEjercicio));
    // Un hijo con 0 meses de derecho no es un «hijo con derecho»: no genera deduccion
    // ni incremento de guarderia, asi que no debe contarse en el desglose.
    if (meses === 0) {
      hijosDescartadosSinMeses++;
      continue;
    }

    // Coherencia entre edad y meses: un hijo de 30 meses el 1 de enero cumple 3 anos en el
    // mes 6, asi que como mucho puede dar 6 meses de derecho. No se rechaza —una adopcion o
    // un alta a mitad de ano pueden justificar el desajuste— pero se avisa.
    const mesesPosibles = Math.max(0, Math.min(12, MESES_LIMITE_EDAD - hijo.edadMesesInicioEjercicio));
    if (meses > mesesPosibles) {
      mesesIncoherentes.push(
        `hijo ${i + 1}: ${meses} meses declarados con ${hijo.edadMesesInicioEjercicio} meses de edad al inicio del ejercicio (maximo coherente: ${mesesPosibles})`
      );
    }

    const gastosDeclarados = hijo.gastosGuarderiaAnuales ?? 0;
    if (gastosDeclarados < 0) huboGastosNegativos = true;
    // Un gasto negativo producia un incremento negativo, es decir, MENOS deduccion.
    const gastosGuarderia = r(Math.max(0, gastosDeclarados));

    detalleHijos.push({
      mesesConDerecho: meses,
      // El tope de 12 meses ya acota a 1.200 EUR; el min() es la red por si data/fiscal
      // dejara de cuadrar (12 x mensual != anual) en una revision futura.
      deduccionBruta: r(Math.min(meses * DEDUCCION_MATERNIDAD_MENSUAL, DEDUCCION_MATERNIDAD_ANUAL)),
      incrementoAltaPosterior: porAltaPosterior ? INCREMENTO_ALTA_POSTERIOR : 0,
      deduccionMaternidadEfectivaHijo: 0,
      gastosGuarderia,
      incrementoGuarderia: 0,
      totalDeduccionHijo: 0,
    });
  }

  const totalIncrementoAltaPosterior = r(
    detalleHijos.reduce((s, d) => s + d.incrementoAltaPosterior, 0)
  );
  // La bruta incluye los 150 EUR del art. 81.3, que la norma configura como incremento de
  // «la deduccion correspondiente al mes» y por tanto viaja bajo su mismo limite.
  const totalDeduccionBruta = tieneDerecho
    ? r(detalleHijos.reduce((s, d) => s + d.deduccionBruta + d.incrementoAltaPosterior, 0))
    : 0;

  // Limite de la deduccion de maternidad por cotizaciones. Sin ninguna de las tres vias del
  // art. 81.1 NO hay deduccion: antes se ponia el limite a Infinity y se pagaba el maximo,
  // convirtiendo la falta de derecho en ausencia de limite.
  const limiteMaternidadCotizaciones = tieneDerecho ? r(p.cotizacionesSSTotalesAnio) : 0;
  const deduccionMaternidadEfectiva = r(Math.min(totalDeduccionBruta, limiteMaternidadCotizaciones));

  // Incremento por guarderia: los dos limites del art. 81.2 se aplican POR HIJO
  // (Manual practico Renta 2025, «Limites de la deduccion»).
  const incrementoPorHijo = detalleHijos.map((d) =>
    r(Math.min(INCREMENTO_MAX_GUARDERIA, d.gastosGuarderia))
  );
  const incrementoBruto = r(incrementoPorHijo.reduce((s, x) => s + x, 0));
  // PENDIENTE DE CONFIRMAR EN /triaje-fiscal: si el incremento esta ademas limitado por las
  // cotizaciones del ejercicio. La pagina de limites de la AEAT solo cita los dos anteriores
  // (1.000 EUR y gasto efectivo no subvencionado, ambos por hijo), pero no se ha podido anclar
  // con la rotundidad necesaria, asi que se CONSERVA el tope por cotizaciones tal como estaba:
  // aplicado al agregado del incremento.
  const incrementoGuarderiaEfectivo = estaDeAltaEnSS
    ? r(Math.min(incrementoBruto, r(p.cotizacionesSSTotalesAnio)))
    : 0;

  // Repartir entre hijos lo efectivamente deducible, para que las lineas publicadas sumen el
  // total publicado (antes las lineas daban la BRUTA y el total la EFECTIVA).
  const maternidadPorHijo = repartirEnCentimos(
    deduccionMaternidadEfectiva,
    detalleHijos.map((d) => d.deduccionBruta + d.incrementoAltaPosterior)
  );
  const guarderiaPorHijo = repartirEnCentimos(incrementoGuarderiaEfectivo, incrementoPorHijo);

  for (let i = 0; i < detalleHijos.length; i++) {
    detalleHijos[i].deduccionMaternidadEfectivaHijo = maternidadPorHijo[i];
    detalleHijos[i].incrementoGuarderia = guarderiaPorHijo[i];
    detalleHijos[i].totalDeduccionHijo = r(maternidadPorHijo[i] + guarderiaPorHijo[i]);
  }

  const totalDeduccionEfectiva = r(deduccionMaternidadEfectiva + incrementoGuarderiaEfectivo);
  const abonoAnticipadoCobrado = r(p.importeAbonoAnticipadoCobrado ?? 0);
  const resultadoDeclaracion = r(totalDeduccionEfectiva - abonoAnticipadoCobrado);

  // --- Advertencias ---

  if (!tieneDerecho) {
    advertencias.push(
      'SIN DERECHO A LA DEDUCCION: no se cumple ninguna de las tres vias alternativas del ' +
      'art. 81.1 LIRPF —estar de alta en la Seguridad Social o mutualidad, percibir prestacion ' +
      'o subsidio de desempleo al nacer el menor, o darse de alta despues del nacimiento y ' +
      'alcanzar 30 dias cotizados—. La reforma de 2023 (Ley 31/2022) AMPLIO esas vias de ' +
      'acceso, no las suprimio: sigue haciendo falta cumplir una de ellas. Si la situacion ' +
      'cambia durante el ano, la deduccion se calcula por los meses en que si se cumple.'
    );
  }
  if (porAltaPosterior && totalIncrementoAltaPosterior > 0) {
    advertencias.push(
      `ALTA POSTERIOR AL NACIMIENTO: se aplican ${INCREMENTO_ALTA_POSTERIOR} EUR adicionales por hijo ` +
      '(art. 81.3, parrafo 2) en el mes en que se completan los 30 dias cotizados. ' +
      `Total por este concepto: ${totalIncrementoAltaPosterior.toLocaleString('es-ES')} EUR.`
    );
  }
  if (deduccionMaternidadEfectiva < totalDeduccionBruta) {
    advertencias.push(
      'LIMITE POR COTIZACIONES: la deduccion por maternidad (' + totalDeduccionBruta.toLocaleString('es-ES') + ' EUR) ' +
      'supera las cotizaciones SS del ejercicio (' + p.cotizacionesSSTotalesAnio.toLocaleString('es-ES') + ' EUR). ' +
      'La deduccion efectiva queda limitada a ' + deduccionMaternidadEfectiva.toLocaleString('es-ES') + ' EUR.'
    );
  }
  if (p.abonoAnticipado) {
    advertencias.push(
      'ABONO ANTICIPADO: los importes cobrados mensualmente (100 EUR/mes/hijo) a cuenta del ' +
      'modelo 140 se descuentan del resultado final de la declaracion. ' +
      'Si se cobro mas de lo correspondiente, la diferencia se integra como cuota diferencial positiva.'
    );
  }
  if (incrementoBruto > 0 && !estaDeAltaEnSS) {
    advertencias.push(
      'El incremento adicional por guarderia NO es aplicable si la madre no esta dada de alta en la SS ' +
      '(requisito de estar en activo es especifico de este incremento, no de la deduccion base).'
    );
  }
  if (huboGastosNegativos) {
    advertencias.push(
      'Se han indicado gastos de guarderia negativos. Se han tratado como 0 EUR: un gasto no puede ' +
      'reducir la deduccion. Revisa los importes introducidos.'
    );
  }
  if (mesesIncoherentes.length > 0) {
    advertencias.push(
      'MESES INCOHERENTES CON LA EDAD: ' + mesesIncoherentes.join('; ') + '. El derecho se pierde el mes ' +
      'en que el hijo cumple 3 anos. Puede ser correcto en adopcion o acogimiento; en otro caso, revisa los datos.'
    );
  }
  if (hijosDescartadosPorEdad > 0 || hijosDescartadosSinMeses > 0) {
    const motivos: string[] = [];
    if (hijosDescartadosPorEdad > 0) motivos.push(`${hijosDescartadosPorEdad} por tener 3 anos o mas al inicio del ejercicio`);
    if (hijosDescartadosSinMeses > 0) motivos.push(`${hijosDescartadosSinMeses} por no declarar ningun mes con derecho`);
    advertencias.push(`Hijos no computados: ${motivos.join(' y ')}.`);
  }

  return {
    situacion,
    tieneDerecho,
    numHijosConDerecho: detalleHijos.length,
    detalleHijos,
    totalDeduccionBruta,
    totalIncrementoAltaPosterior: tieneDerecho ? totalIncrementoAltaPosterior : 0,
    totalIncrementoGuarderia: incrementoGuarderiaEfectivo,
    limiteMaternidadCotizaciones,
    deduccionMaternidadEfectiva,
    incrementoGuarderiaEfectivo,
    totalDeduccionEfectiva,
    abonoAnticipadoCobrado,
    resultadoDeclaracion,
    advertencias,
    fuenteDatos:
      `LIRPF art. 81, redaccion del art. 64 de la Ley 31/2022 — vigencia ${FISCAL_MATERNIDAD_META.vigencia}, ` +
      `verificado ${FISCAL_MATERNIDAD_META.verificado}`,
  };
}
