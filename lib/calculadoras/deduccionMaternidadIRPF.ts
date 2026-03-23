/**
 * Calculadora de la Deduccion por Maternidad en IRPF
 * Usada por: MCP server (calcular_deduccion_maternidad_irpf)
 *
 * Calcula la deduccion por maternidad y el incremento adicional por gastos
 * en guarderia o centros de educacion infantil, aplicables en el IRPF.
 *
 * Marco normativo:
 *   - LIRPF art. 81: deduccion por maternidad (version vigente 2023-2025)
 *   - LIRPF art. 81.2: incremento adicional por guarderia
 *   - RDL 20/2012 y sucesivas reformas: modificaciones historicas
 *   - Ley 31/2022 (PGE 2023): amplitud beneficiarios desde 01/01/2023
 *
 * DEDUCCION POR MATERNIDAD — VERSION 2023-2025 (Ley 31/2022):
 *   Beneficiarias (desde 01/01/2023 — amplitud respecto a 2022):
 *   - Madres con hijos menores de 3 anos con derecho al minimo por descendiente
 *   - Se amplio a: madres que perciben prestaciones contributivas o asistenciales
 *     del SEPE, madres trabajadoras por cuenta propia o ajena, y TAMBIEN a madres
 *     sin trabajo remunerado pero con descendientes con minimo aplicable (nueva)
 *   - NOTA: la condicion de trabajo o percepcion de prestacion solo era necesaria
 *     hasta 2022. Desde 2023 aplica a TODAS las madres con hijos < 3 anos con
 *     derecho al minimo.
 *
 *   CUANTIA:
 *   - 1.200 EUR por cada hijo menor de 3 anos (100 EUR/mes por mes completo)
 *   - Limite: no puede superar las cotizaciones y cuotas totales a la SS en el
 *     ejercicio (solo si la madre esta en activo). Si no trabaja: sin limite en
 *     cuotas pero con limite de 1.200 EUR por hijo.
 *   - Calculo mensual: por cada mes completo en que se tengan derecho (hijo < 3 anos)
 *
 *   ABONO ANTICIPADO:
 *   - Se puede solicitar el abono mensual anticipado: 100 EUR/mes/hijo
 *   - Se solicita en el modelo 140 de la AEAT
 *   - El abono anticipado es incompatible con otras deducciones familiares
 *     (familia numerosa, discapacidad ascendiente) en el mismo mes
 *
 * INCREMENTO ADICIONAL POR GUARDERIA (art. 81.2):
 *   - Gastos en guarderias o centros de educacion infantil autorizados
 *     para hijos menores de 3 anos
 *   - Hasta 1.000 EUR anuales adicionales (maximos)
 *   - Limite: el menor de:
 *     a) 1.000 EUR
 *     b) El importe de las cotizaciones SS del ejercicio
 *     c) Gastos anuales pagados en guarderia (cuotas de matricula + mensualidades)
 *   - La madre debe estar dada de alta en SS y trabajar
 *   - La guarderia debe estar autorizada por la administracion educativa
 *   - Se declara en la renta anual (NO hay abono anticipado de este incremento)
 *
 * INCOMPATIBILIDADES:
 *   - Las deducciones del art. 81 bis (familia numerosa, discapacidad) son
 *     compatibles con la deduccion por maternidad, pero el abono anticipado
 *     de la maternidad es incompatible con el abono anticipado del art. 81 bis.
 *
 * Fuente: LIRPF art. 81 (Ley 31/2022) — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_deduccion_familia_numerosa
 */

// --- Constantes ---

const DEDUCCION_MATERNIDAD_ANUAL = 1_200;     // EUR por hijo menor de 3 anos
const DEDUCCION_MATERNIDAD_MENSUAL = 100;     // EUR/mes
const INCREMENTO_MAX_GUARDERIA = 1_000;       // EUR adicionales maximo

// --- Tipos publicos ---

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
   * La madre estaba trabajando (por cuenta propia o ajena) o percibiendo
   * prestaciones contributivas/asistenciales del SEPE en el ejercicio?
   * (Desde 2023 la deduccion aplica aunque no trabaje, pero el limite de
   * cotizaciones solo aplica si trabaja)
   */
  madreEnActivoOPrestacion?: boolean;
  /** Solicito abono anticipado (modelo 140) para el ejercicio? */
  abonoAnticipado?: boolean;
  /** Importe ya cobrado como abono anticipado en el ejercicio (EUR) */
  importeAbonoAnticipadoCobrado?: number;
}

export interface DetalleHijoMaternidad {
  mesesConDerecho: number;
  deduccionBruta: number;
  gastosGuarderia: number;
  incrementoGuarderia: number;
  totalDeduccionHijo: number;
}

export interface ResultadoDeduccionMaternidadIRPF {
  /** Numero de hijos con derecho a deduccion */
  numHijosConDerecho: number;
  detalleHijos: DetalleHijoMaternidad[];
  /** Suma de deducciones brutas por maternidad (antes del limite de cotizaciones) */
  totalDeduccionBruta: number;
  /** Incremento adicional por guarderia (antes del limite) */
  totalIncrementoGuarderia: number;
  /** Limite por cotizaciones SS (si madre en activo) */
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

// --- Funcion principal ---

export function calcularDeduccionMaternidadIRPF(
  p: ParametrosDeduccionMaternidadIRPF
): ResultadoDeduccionMaternidadIRPF {
  if (!p.hijos || p.hijos.length === 0) throw new Error('Debe indicar al menos un hijo.');
  if (p.cotizacionesSSTotalesAnio < 0) throw new Error('Las cotizaciones no pueden ser negativas.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const madreActiva = p.madreEnActivoOPrestacion ?? true;

  const detalleHijos: DetalleHijoMaternidad[] = [];
  let totalDeduccionBruta = 0;
  let totalGastosGuarderia = 0;

  for (const hijo of p.hijos) {
    // Solo aplica si el hijo es menor de 36 meses (3 anos)
    if (hijo.edadMesesInicioEjercicio >= 36) continue;
    const meses = Math.max(0, Math.min(12, hijo.mesesConDerechoEjercicio));
    const deduccionBruta = r(meses * DEDUCCION_MATERNIDAD_MENSUAL);
    const gastosGuarderia = r(hijo.gastosGuarderiaAnuales ?? 0);
    totalDeduccionBruta += deduccionBruta;
    totalGastosGuarderia += gastosGuarderia;
    detalleHijos.push({ mesesConDerecho: meses, deduccionBruta, gastosGuarderia, incrementoGuarderia: 0, totalDeduccionHijo: 0 });
  }

  totalDeduccionBruta = r(totalDeduccionBruta);
  totalGastosGuarderia = r(totalGastosGuarderia);

  // Limite de la deduccion de maternidad por cotizaciones (si trabaja)
  const limiteMaternidadCotizaciones = madreActiva ? r(p.cotizacionesSSTotalesAnio) : Infinity;
  const deduccionMaternidadEfectiva = r(Math.min(totalDeduccionBruta, limiteMaternidadCotizaciones));

  // Incremento guarderia
  const incrementoBruto = r(Math.min(INCREMENTO_MAX_GUARDERIA, totalGastosGuarderia));
  // Limite incremento: min(1.000, cotizaciones, gastos guarderia)
  const limiteIncremento = madreActiva
    ? r(Math.min(INCREMENTO_MAX_GUARDERIA, p.cotizacionesSSTotalesAnio, totalGastosGuarderia))
    : 0;
  const incrementoGuarderiaEfectivo = madreActiva ? r(incrementoBruto <= limiteIncremento ? incrementoBruto : limiteIncremento) : 0;

  // Distribuir incremento guarderia entre hijos
  for (let i = 0; i < detalleHijos.length; i++) {
    const frac = totalGastosGuarderia > 0 ? detalleHijos[i].gastosGuarderia / totalGastosGuarderia : 0;
    detalleHijos[i].incrementoGuarderia = r(incrementoGuarderiaEfectivo * frac);
    detalleHijos[i].totalDeduccionHijo = r(detalleHijos[i].deduccionBruta + detalleHijos[i].incrementoGuarderia);
  }

  const totalDeduccionEfectiva = r(deduccionMaternidadEfectiva + incrementoGuarderiaEfectivo);
  const abonoAnticipadoCobrado = r(p.importeAbonoAnticipadoCobrado ?? 0);
  const resultadoDeclaracion = r(totalDeduccionEfectiva - abonoAnticipadoCobrado);

  if (!madreActiva) {
    advertencias.push(
      'Desde 2023 (Ley 31/2022), la deduccion por maternidad aplica aunque la madre no este ' +
      'trabajando ni perciba prestaciones, siempre que tenga derecho al minimo por descendiente. ' +
      'Sin embargo, el incremento adicional por guarderia SOLO aplica si la madre trabaja ' +
      '(esta dada de alta en la SS).'
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
  if (totalGastosGuarderia > 0 && !madreActiva) {
    advertencias.push(
      'El incremento adicional por guarderia NO es aplicable si la madre no esta dada de alta en la SS ' +
      '(requisito de estar en activo es especifico de este incremento, no de la deduccion base).'
    );
  }

  return {
    numHijosConDerecho: detalleHijos.length,
    detalleHijos,
    totalDeduccionBruta,
    totalIncrementoGuarderia: incrementoGuarderiaEfectivo,
    limiteMaternidadCotizaciones: madreActiva ? r(p.cotizacionesSSTotalesAnio) : r(DEDUCCION_MATERNIDAD_ANUAL * p.hijos.length),
    deduccionMaternidadEfectiva,
    incrementoGuarderiaEfectivo,
    totalDeduccionEfectiva,
    abonoAnticipadoCobrado,
    resultadoDeclaracion,
    advertencias,
    fuenteDatos: 'LIRPF art. 81 (Ley 31/2022) — vigente 2025',
  };
}
