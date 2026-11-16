/**
 * Mínimo por discapacidad en el IRPF (Ley 35/2006, arts. 60-65).
 *
 * Fuente ÚNICA del cálculo: lo usan la tool `calcular_deduccion_discapacidad` del MCP de Delegum
 * y la app `app/estimacion-deduccion-discapacidad/`, que desde el 10/09/2026 ya no lleva su copia
 * inline. La fuente única de los importes es data/fiscal/dependencia.ts
 * (DEDUCCIONES_IRPF_DISCAPACIDAD_2025).
 *
 * Nació como «réplica server-side» de esa app, y mientras las dos copias convivieron divergieron:
 * el 09/09/2026 se encontró aquí condicionado a `necesitaAsistencia` un incremento que el art. 60
 * concede también por grado ≥65 %, con la app haciéndolo bien. Eran 3.000 € de mínimo.
 *
 * ATENCION 12/09/2026: el minimo NO reduce la base liquidable, y de ahi salia el defecto
 * que este fichero arrastraba. El art. 63.1.2 LIRPF dice que el minimo «no reduce la renta»:
 * forma parte de la base liquidable general y se grava a TIPO CERO aplicando la escala dos
 * veces y restando. La consecuencia practica es que el ahorro NO depende del tipo marginal
 * del contribuyente: el minimo se valora a los tipos BAJOS de la escala, siempre.
 *
 * Hasta esa fecha el ahorro se calculaba como `totalMinimo x tipoMarginal`, con el marginal
 * elegido por quien preguntaba. Con el minimo maximo de 12.000 EUR y un marginal del 45 %
 * publicaba 5.400 EUR de ahorro donde la ley da 2.535 EUR: mas del doble. El parametro
 * `tipoMarginal` desaparecio con el defecto, porque no interviene en el resultado.
 */
import {
  DEDUCCIONES_IRPF_DISCAPACIDAD_2025,
  FISCAL_DEPENDENCIA_META,
} from '@/data/fiscal/dependencia';
import {
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025,
  calcularCuotaIntegraGeneral,
  calcularRendimientoNetoTrabajo,
  cuotaEscalaGeneral,
} from '@/data/fiscal/irpf';
import { cotizacionTrabajadorAnual } from '@/app/estimador-irpf/motor';

export type TitularDiscapacidad = 'contribuyente' | 'ascendiente' | 'descendiente';
export type GradoDiscapacidad = '33a65' | '65oMas';

export interface ParametrosDeduccionDiscapacidad {
  titular: TitularDiscapacidad;
  grado: GradoDiscapacidad;
  /**
   * ¿Acredita necesitar ayuda de terceras personas o movilidad reducida?
   * Es UNO de los tres supuestos alternativos del incremento por gastos de
   * asistencia: con grado ≥65 % el incremento se aplica igual sin marcarla.
   */
  necesitaAsistencia?: boolean;
  /**
   * Salario bruto anual (rendimiento íntegro del trabajo) cuando quien tiene la discapacidad es
   * el CONTRIBUYENTE y la obtiene como trabajador activo. Activa el incremento de los gastos
   * deducibles del art. 19.2.f LIRPF (+3.500 €, o +7.750 € con ayuda de terceros, movilidad
   * reducida o grado ≥ 65 %). Sin él, o con un familiar como titular, `trabajoActivo` es null.
   */
  salarioBrutoTrabajadorActivo?: number;
}

/**
 * Lo que añade el art. 19.2.f a un trabajador activo con discapacidad (hallazgo 4786; decidido
 * por el usuario en /reparar pendientes del 16/11/2026, cabo C0796). A diferencia del mínimo,
 * el incremento de gastos SÍ reduce la base, así que se valora a los tipos donde cae la base del
 * contribuyente: por eso hace falta el salario.
 */
export interface TrabajoActivoDiscapacidad {
  salarioBruto: number;
  /** Cotización del trabajador a la SS de 2025 (6,48 %, con el tope de la base máxima). */
  cotizacionSS: number;
  /** 3.500 € o 7.750 € (INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025). */
  incrementoGastos: number;
  /** Base liquidable general sin discapacidad: solo los 2.000 € generales de la letra f). */
  baseSinDiscapacidad: number;
  /** Base liquidable general con los 2.000 € más el incremento del art. 19.2.f. */
  baseConDiscapacidad: number;
  /** Cuota íntegra sin discapacidad (mínimo personal de 5.550 €). */
  cuotaSinDiscapacidad: number;
  /** Cuota íntegra con el mínimo por discapacidad y el incremento de gastos. */
  cuotaConDiscapacidad: number;
  /** Ahorro del mínimo con ESTA base (menor que `ahorroEstimado` si la base no le da cabida). */
  ahorroMinimo: number;
  /** Ahorro del incremento de gastos del art. 19.2.f, valorado después del mínimo. */
  ahorroIncrementoGastos: number;
  /** cuotaSinDiscapacidad − cuotaConDiscapacidad = ahorroMinimo + ahorroIncrementoGastos. */
  ahorroTotal: number;
}

export interface ResultadoDeduccionDiscapacidad {
  minimoDiscapacidad: number;
  gastosAsistencia: number;
  totalMinimo: number;
  /**
   * Ahorro en cuota (EUR) por el art. 63.1.2 LIRPF: lo que la escala aplica al minimo por
   * discapacidad ENCIMA del minimo personal. Es una cota INFERIOR: quien tenga ademas
   * minimos por descendientes o ascendientes los apila debajo y empuja este tramo hacia
   * arriba, con lo que ahorra algo mas.
   */
  ahorroEstimado: number;
  /** Tipo al que acaba valorandose el minimo (%): ahorroEstimado / totalMinimo. */
  tipoEfectivoAhorro: number;
  /** Solo con `salarioBrutoTrabajadorActivo` y titular «contribuyente»; si no, null. */
  trabajoActivo: TrabajoActivoDiscapacidad | null;
  fuente: string;
  verificado: string;
}

export function calcularDeduccionDiscapacidadIRPF(
  p: ParametrosDeduccionDiscapacidad
): ResultadoDeduccionDiscapacidad {
  // El contribuyente usa sus propios importes; ascendiente/descendiente usan los familiares.
  const datos =
    p.titular === 'contribuyente'
      ? DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente
      : DEDUCCIONES_IRPF_DISCAPACIDAD_2025.familiar;

  const minimoDiscapacidad =
    p.grado === '33a65' ? datos.discapacidad33a65 : datos.discapacidad65oMas;

  // Art. 60 LIRPF (y art. 61 para ascendientes/descendientes): el incremento de 3.000 € por
  // gastos de asistencia procede ante CUALQUIERA de tres supuestos ALTERNATIVOS —acreditar
  // necesitar ayuda de terceras personas, acreditar movilidad reducida, O un grado de
  // discapacidad igual o superior al 65 %—. Manual práctico Renta 2025 de la AEAT: «se
  // incrementará, en concepto de gastos de asistencia, en 3.000 euros anuales por cada
  // ascendiente o descendiente que acredite necesitar ayuda de terceras personas o movilidad
  // reducida, o un grado de discapacidad igual o superior al 65 por 100».
  // Con grado 33-64 % la acreditación SÍ es condición necesaria; con ≥65 % el grado basta.
  const tieneDerechoAsistencia = p.necesitaAsistencia === true || p.grado === '65oMas';

  const gastosAsistencia = tieneDerechoAsistencia
    ? p.grado === '33a65'
      ? datos.gastosAsistencia33a65
      : datos.gastosAsistencia65oMas
    : 0;

  const totalMinimo = minimoDiscapacidad + gastosAsistencia;

  // Art. 63.1.2 LIRPF: el minimo se grava a tipo cero, asi que lo que ahorra el minimo por
  // discapacidad es lo que la escala le aplica encima del minimo personal ya existente.
  const base = MINIMOS_IRPF_2025.personal;
  const ahorroEstimado =
    Math.round((cuotaEscalaGeneral(base + totalMinimo) - cuotaEscalaGeneral(base)) * 100) / 100;
  const tipoEfectivoAhorro =
    totalMinimo > 0 ? Math.round((ahorroEstimado / totalMinimo) * 10000) / 100 : 0;

  const salario = p.salarioBrutoTrabajadorActivo;
  const trabajoActivo =
    p.titular === 'contribuyente' && typeof salario === 'number' && Number.isFinite(salario) && salario > 0
      ? calcularTrabajoActivo(salario, totalMinimo, tieneDerechoAsistencia)
      : null;

  return {
    minimoDiscapacidad,
    gastosAsistencia,
    totalMinimo,
    ahorroEstimado,
    tipoEfectivoAhorro,
    trabajoActivo,
    fuente: FISCAL_DEPENDENCIA_META.fuente,
    verificado: FISCAL_DEPENDENCIA_META.verificado,
  };
}

/**
 * Art. 19.2.f LIRPF (BOE-A-2006-20764, cita literal en INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025):
 * los 2.000 € de «otros gastos» suben 3.500 € para el trabajador activo con discapacidad, y 7.750 €
 * si acredita ayuda de terceras personas o movilidad reducida, o un grado ≥ 65 % (los mismos tres
 * supuestos alternativos que el incremento por asistencia del art. 60).
 *
 * Caso del hallazgo 4786, a mano: 28.000 € brutos, grado 40 %, sin asistencia.
 *   SS 6,48 % = 1.814,40 → previo 26.185,60 → art. 20: 0 (≥ 19.747,5)
 *   sin discapacidad: base 24.185,60 · escala(24.185,60) − escala(5.550) = 4.366,68 €
 *   con ella: base 20.685,60 · escala(20.685,60) − escala(8.550) = 4.371,18 − 1.624,50 = 2.746,68 €
 *   ahorro 1.620,00 € = 570,00 del mínimo + 1.050,00 del art. 19.2.f (3.500 × 30 %).
 */
function calcularTrabajoActivo(
  salarioBruto: number,
  totalMinimo: number,
  conAsistenciaO65: boolean,
): TrabajoActivoDiscapacidad {
  const cotizacionSS = Math.round(cotizacionTrabajadorAnual(salarioBruto) * 100) / 100;
  const incrementoGastos = conAsistenciaO65
    ? INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025.asistenciaO65
    : INCREMENTO_GASTOS_TRABAJO_DISCAPACIDAD_2025.general;
  const general = GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral;

  const baseSinDiscapacidad = calcularRendimientoNetoTrabajo({
    integros: salarioBruto, gastosAaE: cotizacionSS, otrosGastos: general,
  }).rendimientoNetoReducido;
  const baseConDiscapacidad = calcularRendimientoNetoTrabajo({
    integros: salarioBruto, gastosAaE: cotizacionSS, otrosGastos: general + incrementoGastos,
  }).rendimientoNetoReducido;

  const personal = MINIMOS_IRPF_2025.personal;
  const redondear = (n: number) => Math.round(n * 100) / 100;
  const cuotaSinDiscapacidad = redondear(calcularCuotaIntegraGeneral(baseSinDiscapacidad, personal));
  const cuotaSoloMinimo = redondear(calcularCuotaIntegraGeneral(baseSinDiscapacidad, personal + totalMinimo));
  const cuotaConDiscapacidad = redondear(calcularCuotaIntegraGeneral(baseConDiscapacidad, personal + totalMinimo));

  return {
    salarioBruto,
    cotizacionSS,
    incrementoGastos,
    baseSinDiscapacidad: redondear(baseSinDiscapacidad),
    baseConDiscapacidad: redondear(baseConDiscapacidad),
    cuotaSinDiscapacidad,
    cuotaConDiscapacidad,
    ahorroMinimo: redondear(cuotaSinDiscapacidad - cuotaSoloMinimo),
    ahorroIncrementoGastos: redondear(cuotaSoloMinimo - cuotaConDiscapacidad),
    ahorroTotal: redondear(cuotaSinDiscapacidad - cuotaConDiscapacidad),
  };
}
