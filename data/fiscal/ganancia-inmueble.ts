/**
 * Cálculo de la ganancia patrimonial por transmisión de un inmueble (IRPF)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 *
 * Este módulo NO contiene datos normativos con fecha de caducidad (los tramos de
 * la base del ahorro viven en `inmuebles.ts`): contiene la FÓRMULA del art. 35
 * LIRPF y las dos exenciones que más veces cambian el resultado. Existe porque
 * la misma fórmula estaba copiada a mano en cuatro apps de compraventa, y en las
 * cuatro estaba incompleta de la misma manera: el valor de adquisición se
 * quedaba en el precio de compra (sin los impuestos y gastos que el vendedor
 * pagó al comprar) y el valor de transmisión no descontaba la plusvalía
 * municipal. Ambos desvíos empujan el impuesto AL ALZA.
 *
 * Fórmula (arts. 34, 35 y 36 LIRPF):
 *   valor de adquisición  = precio de compra
 *                         + gastos y tributos inherentes a la adquisición
 *                           (ITP o IVA, notaría, registro, gestoría) satisfechos
 *                           por el adquirente, EXCLUIDOS los intereses
 *                         + inversiones y mejoras
 *                         − amortizaciones fiscalmente deducibles (art. 40 RIRPF,
 *                           inmueble arrendado o afecto a actividad económica)
 *   valor de transmisión  = precio de venta
 *                         − gastos y tributos inherentes a la transmisión
 *                           satisfechos por el transmitente (comisión de agencia,
 *                           plusvalía municipal, certificado energético…)
 *   ganancia              = valor de transmisión − valor de adquisición
 *
 * Exenciones aplicadas:
 *   - Mayores de 65 años que transmiten su vivienda habitual: exención TOTAL
 *     (art. 33.4.b LIRPF).
 *   - Reinversión en vivienda habitual: exención total o proporcional a lo
 *     reinvertido (art. 38 LIRPF y art. 41 RIRPF). Cuando la vivienda transmitida
 *     tenía préstamo pendiente, el "importe total obtenido" se minora en el
 *     principal pendiente de amortizar (art. 41.1, párrafo 2.º RIRPF).
 *
 * LO QUE ESTE MÓDULO NO HACE (y por qué se dice en vez de aproximarlo):
 *   - Coeficientes de abatimiento de la DT 9.ª LIRPF (adquisiciones anteriores al
 *     31/12/1994), que reducen la ganancia con un límite acumulado de 400.000 €
 *     de valor de transmisión por contribuyente. Dependen del historial completo
 *     del contribuyente, no solo de esta operación.
 *   - Compensación con pérdidas patrimoniales de otras operaciones del ejercicio.
 *   - Transmisiones con más de un titular, no residentes y transmisiones lucrativas.
 *
 * Fuente: Ley 35/2006 del IRPF (arts. 33 a 40 y DT 9.ª) + RD 439/2007 (RIRPF, arts. 40 y 41)
 */

import { calcularCuotaBaseAhorro } from './inmuebles';
// El motivo de la exención se PRESENTA al usuario, así que su porcentaje lleva coma decimal:
// toFixed() escribía «51.8 %» en una app en español (CLAUDE.md global §2, hallazgo 433).
import { formatNumber } from '@/lib/formatters';

export interface EntradaGananciaInmueble {
  /** Precio de venta escriturado (€) */
  precioVenta: number;
  /** Precio de compra escriturado en su día (€) */
  precioCompra: number;
  /** Impuestos y gastos que pagó AL COMPRAR: ITP o IVA, notaría, registro, gestoría (€) */
  gastosAdquisicion?: number;
  /** Inversiones y mejoras (no gastos de conservación ni reparación) (€) */
  mejoras?: number;
  /** Amortizaciones fiscalmente deducibles si estuvo alquilado o afecto (€) */
  amortizacionesDeducidas?: number;
  /** Gastos de la venta a cargo del vendedor: comisión, gestoría, certificado energético (€) */
  gastosTransmision?: number;
  /** Plusvalía municipal (IIVTNU) satisfecha por el vendedor (€) */
  plusvaliaMunicipal?: number;
  /** Vendedor mayor de 65 años que transmite su vivienda habitual (art. 33.4.b LIRPF) */
  exentoPorEdad?: boolean;
  /** Reinversión en nueva vivienda habitual (art. 38 LIRPF). Omitir si no aplica */
  reinversion?: {
    /** Importe que se reinvierte o se compromete a reinvertir en 2 años (€) */
    importeReinvertido: number;
    /** Principal del préstamo pendiente de amortizar al transmitir (€) */
    principalPendiente?: number;
  };
}

export interface ResultadoGananciaInmueble {
  valorAdquisicion: number;
  valorTransmision: number;
  /** Ganancia (positiva) o pérdida (negativa) patrimonial */
  ganancia: number;
  esPerdida: boolean;
  /** Parte exenta por transmisión de vivienda habitual por mayor de 65 años */
  exentaPorEdad: number;
  /** Parte exenta por reinversión en vivienda habitual */
  exentaPorReinversion: number;
  /** Proporción reinvertida aplicada (0 a 1) */
  proporcionReinvertida: number;
  /** Importe total obtenido a efectos del art. 41 RIRPF (transmisión − préstamo pendiente) */
  importeTotalObtenido: number;
  /** Ganancia sujeta y no exenta: la que tributa */
  baseImponible: number;
  /** Cuota del IRPF sobre la base del ahorro */
  cuotaIRPF: number;
  /** Tipo efectivo sobre la ganancia total (%) */
  tipoEfectivo: number;
  /** Motivo de la exención cuando la hay, para mostrarlo en la interfaz */
  motivoExencion: string | null;
}

/**
 * Calcula la ganancia patrimonial de un inmueble y su cuota en el IRPF.
 * No redondea: cada consumidor decide cómo presentar los importes.
 */
export function calcularGananciaInmueble(e: EntradaGananciaInmueble): ResultadoGananciaInmueble {
  const positivo = (n: number | undefined) => Math.max(0, n ?? 0);

  const valorAdquisicion = Math.max(
    0,
    positivo(e.precioCompra) + positivo(e.gastosAdquisicion) + positivo(e.mejoras) - positivo(e.amortizacionesDeducidas),
  );

  const valorTransmision = Math.max(
    0,
    positivo(e.precioVenta) - positivo(e.gastosTransmision) - positivo(e.plusvaliaMunicipal),
  );

  const ganancia = valorTransmision - valorAdquisicion;
  const esPerdida = ganancia <= 0;

  // Una pérdida patrimonial no genera cuota (se compensa en la declaración, fuera del alcance)
  if (esPerdida) {
    return {
      valorAdquisicion,
      valorTransmision,
      ganancia,
      esPerdida: true,
      exentaPorEdad: 0,
      exentaPorReinversion: 0,
      proporcionReinvertida: 0,
      importeTotalObtenido: valorTransmision,
      baseImponible: 0,
      cuotaIRPF: 0,
      tipoEfectivo: 0,
      motivoExencion: null,
    };
  }

  // La exención por edad es total y absorbe cualquier otra: se comprueba primero
  if (e.exentoPorEdad) {
    return {
      valorAdquisicion,
      valorTransmision,
      ganancia,
      esPerdida: false,
      exentaPorEdad: ganancia,
      exentaPorReinversion: 0,
      proporcionReinvertida: 0,
      importeTotalObtenido: valorTransmision,
      baseImponible: 0,
      cuotaIRPF: 0,
      tipoEfectivo: 0,
      motivoExencion: 'Mayor de 65 años que transmite su vivienda habitual (art. 33.4.b LIRPF)',
    };
  }

  // Reinversión en vivienda habitual: exención proporcional a lo reinvertido
  let exentaPorReinversion = 0;
  let proporcionReinvertida = 0;
  const importeTotalObtenido = Math.max(0, valorTransmision - positivo(e.reinversion?.principalPendiente));

  if (e.reinversion && e.reinversion.importeReinvertido > 0 && importeTotalObtenido > 0) {
    proporcionReinvertida = Math.min(1, e.reinversion.importeReinvertido / importeTotalObtenido);
    exentaPorReinversion = ganancia * proporcionReinvertida;
  }

  const baseImponible = Math.max(0, ganancia - exentaPorReinversion);
  const cuotaIRPF = calcularCuotaBaseAhorro(baseImponible);

  const motivoExencion = proporcionReinvertida >= 1
    ? 'Reinversión total del importe obtenido en una nueva vivienda habitual (art. 38 LIRPF)'
    : proporcionReinvertida > 0
      ? `Reinversión parcial: exento el ${formatNumber(proporcionReinvertida * 100, 1)} % de la ganancia (art. 41 RIRPF)`
      : null;

  return {
    valorAdquisicion,
    valorTransmision,
    ganancia,
    esPerdida: false,
    exentaPorEdad: 0,
    exentaPorReinversion,
    proporcionReinvertida,
    importeTotalObtenido,
    baseImponible,
    cuotaIRPF,
    tipoEfectivo: ganancia > 0 ? (cuotaIRPF / ganancia) * 100 : 0,
    motivoExencion,
  };
}
