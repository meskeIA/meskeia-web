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
  /**
   * No hay cuota que calcular. Incluye el cero, y por eso NO basta para rotular: para eso
   * está `sinGananciaNiPerdida`.
   */
  esPerdida: boolean;
  /**
   * Se vende EXACTAMENTE por el valor de adquisición: ni ganancia ni pérdida.
   *
   * ── De dónde sale (15/09/2026, hallazgos 823 y 845 del Inspector) ───────────
   * `esPerdida = ganancia <= 0` es correcto donde se usa —con cero tampoco hay cuota—, pero
   * las apps lo trasladaban tal cual al rótulo y pintaban «Pérdida patrimonial 0,00 €» con
   * el texto «Vendes por debajo del valor de adquisición: no hay IRPF y la pérdida se puede
   * compensar en la declaración». Las dos mitades son falsas en ese punto: no se vende por
   * debajo, se vende exactamente por él, y no hay ninguna pérdida que compensar, así que la
   * frase manda a una casilla de la declaración que ese caso no genera. El importe no
   * engañaba; engañaba el consejo fiscal, en apps de riesgo 1.
   *
   * Se compara contra medio céntimo y no contra 0 exacto porque la ganancia sale de restas
   * en coma flotante: 20.000 − 17.830 puede dar 3,6e-12, que el usuario ve como 0,00 €. El
   * criterio es lo que la pantalla muestra.
   */
  sinGananciaNiPerdida: boolean;
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
  /** Medio céntimo: es lo que la pantalla redondea a «0,00 €». Ver la cabecera del campo. */
  const sinGananciaNiPerdida = Math.abs(ganancia) < 0.005;

  // Una pérdida patrimonial no genera cuota (se compensa en la declaración, fuera del alcance)
  if (esPerdida) {
    return {
      valorAdquisicion,
      valorTransmision,
      ganancia,
      esPerdida: true,
      sinGananciaNiPerdida,
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
      sinGananciaNiPerdida: false,
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

  /**
   * Con el principal pendiente IGUAL o MAYOR que el valor de transmisión, el importe total
   * obtenido del art. 41.1 RIRPF es 0, y cualquier reinversión lo cubre: el art. 41.4 solo hace
   * proporcional la exención «en el caso de que el importe de la reinversión fuera inferior al
   * total obtenido», y ninguna reinversión es inferior a 0. Hasta el 25/09/2026 la guarda
   * `importeTotalObtenido > 0` descartaba la exención ENTERA en ese caso —con 1 € menos de
   * hipoteca salía EXENTO y con 1 € más, la cuota completa (hallazgo 1797 del Inspector)—.
   * Sigue haciendo falta reinvertir algo (`importeReinvertido > 0`): el art. 41.1 exige que el
   * importe «se reinvierta en la adquisición de una nueva vivienda habitual».
   * Fuente: RD 439/2007, art. 41.1 y 41.4 (BOE-A-2007-6820, texto consolidado).
   */
  const cubiertoPorLaHipoteca = importeTotalObtenido <= 0;
  if (e.reinversion && e.reinversion.importeReinvertido > 0) {
    proporcionReinvertida = cubiertoPorLaHipoteca
      ? 1
      : Math.min(1, e.reinversion.importeReinvertido / importeTotalObtenido);
    exentaPorReinversion = ganancia * proporcionReinvertida;
  }

  const baseImponible = Math.max(0, ganancia - exentaPorReinversion);
  const cuotaIRPF = calcularCuotaBaseAhorro(baseImponible);

  const motivoExencion = proporcionReinvertida >= 1 && cubiertoPorLaHipoteca
    ? 'Reinversión en una nueva vivienda habitual: el principal pendiente del préstamo iguala o supera el valor de transmisión, así que el importe obtenido es 0 y cualquier reinversión lo cubre (art. 38 LIRPF y art. 41.1 RIRPF)'
    : proporcionReinvertida >= 1
      ? 'Reinversión total del importe obtenido en una nueva vivienda habitual (art. 38 LIRPF)'
      : proporcionReinvertida > 0
        ? `Reinversión parcial: exento el ${formatNumber(proporcionReinvertida * 100, 1)} % de la ganancia (art. 41 RIRPF)`
        : null;

  return {
    valorAdquisicion,
    valorTransmision,
    ganancia,
    esPerdida: false,
    sinGananciaNiPerdida: false,
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
