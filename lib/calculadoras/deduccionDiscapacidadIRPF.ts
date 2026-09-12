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
import { MINIMOS_IRPF_2025, cuotaEscalaGeneral } from '@/data/fiscal/irpf';

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

  return {
    minimoDiscapacidad,
    gastosAsistencia,
    totalMinimo,
    ahorroEstimado,
    tipoEfectivoAhorro,
    fuente: FISCAL_DEPENDENCIA_META.fuente,
    verificado: FISCAL_DEPENDENCIA_META.verificado,
  };
}
