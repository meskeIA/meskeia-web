/**
 * Motor de orientador-tarifa-freelance: facturación necesaria para llevarse un neto mensual,
 * con la cuota del RETA y el IRPF calculados con data/fiscal (no con tipos fijos).
 *
 * Reparado el 14/11/2026 (hallazgos 4690, 4691, 4692, 4693 y 4698 del Inspector). Antes:
 *   · «IRPF Estimado» = tipo del desplegable × rendimiento, y las opciones del desplegable eran
 *     las RETENCIONES (7 % y 15 %), que son pagos a cuenta, no el impuesto (art. 101.5.a LIRPF).
 *   · La cuota de autónomos era un literal de 300 € que no salía del escenario.
 *   · `parseSpanishNumber(x) || defecto` cambiaba un 0 legítimo por el valor por defecto.
 * Ahora:
 *   · Cuota del RETA: `cotizacionRETADesdeActividad` (base mínima del tramo, estimación directa
 *     simplificada, la de casi todos los autónomos: REGIMEN_DIRECTA_POR_DEFECTO).
 *   · IRPF: `calcularCuotaIntegraGeneral` sobre el rendimiento neto de la simplificada (ya
 *     restados la cuota y el 5 % de difícil justificación), con el mínimo personal a tipo cero
 *     (art. 63.1.2.º LIRPF). No modela la reducción del 20 % por inicio de actividad (art. 32.3),
 *     mínimos familiares ni deducciones: la página lo dice.
 *   · Como la cuota y el IRPF dependen de la facturación, la facturación sin margen se resuelve
 *     buscando la menor que deja el neto pedido (bisección); el margen se aplica encima y la
 *     cuota y el IRPF que se enseñan son los de la facturación final.
 *
 * La retención de las facturas es un PAGO A CUENTA del IRPF: no cambia la tarifa, solo cuánto
 * adelanta el cliente a Hacienda cada mes. Se devuelve aparte, a título informativo.
 */
import {
  calcularCuotaIntegraGeneral,
  cotizacionRETADesdeActividad,
  MINIMOS_IRPF_2025,
  REGIMEN_DIRECTA_POR_DEFECTO,
} from '@/data/fiscal';

export interface EntradaTarifa {
  /** Neto que se quiere llevar a casa cada mes, tras gastos, cuota e IRPF (€). */
  netoMensual: number;
  /** Gastos de la actividad al mes, SIN la cuota de autónomos (€). */
  gastosMensuales: number;
  horasSemanales: number;
  diasVacaciones: number;
  diasFestivos: number;
  diasEnfermedad: number;
  /** Ocupación facturable, en % (0-100). */
  ocupacion: number;
  /** Tipo de IVA, en %. */
  iva: number;
  /** Margen de seguridad sobre la facturación, en %. */
  margen: number;
  /** Retención de IRPF en factura, en % (0 si no se retiene). */
  retencion: number;
}

export interface FiscalidadAnual {
  /** Ingresos − gastos de la actividad, sin la cuota (€/año). */
  ingresosMenosGastos: number;
  cuotaMensual: number;
  /** Rendimiento neto del IRPF en la simplificada (€/año). */
  rendimientoNetoIRPF: number;
  irpfAnual: number;
  /** Lo que queda tras gastos, cuota e IRPF (€/año). */
  netoAnual: number;
}

export interface ResultadoTarifa extends FiscalidadAnual {
  diasLaborablesAno: number;
  diasFacturablesAno: number;
  diasFacturablesMes: number;
  horasFacturablesAno: number;
  horasFacturablesMes: number;
  /** Facturación mensual necesaria, con el margen (€/mes, sin IVA). */
  facturacionMensual: number;
  facturacionAnual: number;
  tarifaHora: number;
  tarifaDia: number;
  tarifaSemana: number;
  tarifaHoraConIVA: number;
  tarifaDiaConIVA: number;
  tarifaSemanaConIVA: number;
  /** Retención que adelanta el cliente al mes (€). */
  retencionMensual: number;
}

const DIAS_FIN_DE_SEMANA = 52 * 2;

/** Cuota, IRPF y neto que deja una facturación anual dada. */
export function fiscalidadDeFacturacion(facturacionAnual: number, gastosAnuales: number): FiscalidadAnual {
  const ingresosMenosGastos = facturacionAnual - gastosAnuales;
  const cot = cotizacionRETADesdeActividad(ingresosMenosGastos, REGIMEN_DIRECTA_POR_DEFECTO);
  const irpfAnual = calcularCuotaIntegraGeneral(cot.rendimientoNetoIRPF, MINIMOS_IRPF_2025.personal);
  return {
    ingresosMenosGastos,
    cuotaMensual: cot.cuotaMensual,
    rendimientoNetoIRPF: cot.rendimientoNetoIRPF,
    irpfAnual,
    netoAnual: ingresosMenosGastos - cot.cuotaMensual * 12 - irpfAnual,
  };
}

/**
 * Menor facturación anual (sin margen) que deja al menos `netoAnual`. El neto crece con la
 * facturación salvo en los saltos de tramo del RETA (unos euros al mes): la bisección acaba en un
 * punto donde el neto ya alcanza el objetivo.
 */
export function facturacionParaNeto(netoAnual: number, gastosAnuales: number): number {
  const objetivo = Math.max(0, netoAnual);
  let lo = 0;
  let hi = Math.max(1000, gastosAnuales) + objetivo * 3 + 50000;
  while (fiscalidadDeFacturacion(hi, gastosAnuales).netoAnual < objetivo) hi *= 2;
  for (let i = 0; i < 200 && hi - lo > 1e-6; i++) {
    const medio = (lo + hi) / 2;
    if (fiscalidadDeFacturacion(medio, gastosAnuales).netoAnual >= objetivo) hi = medio;
    else lo = medio;
  }
  return hi;
}

export function calcularTarifa(e: EntradaTarifa): ResultadoTarifa {
  const diasLaborablesAno = 365 - DIAS_FIN_DE_SEMANA - e.diasVacaciones - e.diasFestivos - e.diasEnfermedad;
  const diasFacturablesAno = Math.max(0, diasLaborablesAno) * (e.ocupacion / 100);
  const diasFacturablesMes = diasFacturablesAno / 12;
  const horasDia = e.horasSemanales / 5;
  const horasFacturablesAno = diasFacturablesAno * horasDia;
  const horasFacturablesMes = horasFacturablesAno / 12;

  const gastosAnuales = e.gastosMensuales * 12;
  const facturacionSinMargen = facturacionParaNeto(e.netoMensual * 12, gastosAnuales);
  const facturacionAnual = facturacionSinMargen * (1 + e.margen / 100);
  const facturacionMensual = facturacionAnual / 12;
  const fiscal = fiscalidadDeFacturacion(facturacionAnual, gastosAnuales);

  const tarifaHora = horasFacturablesMes > 0 ? facturacionMensual / horasFacturablesMes : 0;
  const tarifaDia = diasFacturablesMes > 0 ? facturacionMensual / diasFacturablesMes : 0;
  const tarifaSemana = tarifaDia * 5;
  const factorIva = 1 + e.iva / 100;

  return {
    ...fiscal,
    diasLaborablesAno,
    diasFacturablesAno,
    diasFacturablesMes,
    horasFacturablesAno,
    horasFacturablesMes,
    facturacionMensual,
    facturacionAnual,
    tarifaHora,
    tarifaDia,
    tarifaSemana,
    tarifaHoraConIVA: tarifaHora * factorIva,
    tarifaDiaConIVA: tarifaDia * factorIva,
    tarifaSemanaConIVA: tarifaSemana * factorIva,
    retencionMensual: facturacionMensual * (e.retencion / 100),
  };
}
