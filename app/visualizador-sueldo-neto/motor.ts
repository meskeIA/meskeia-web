/**
 * Motor del visualizador de sueldo bruto a neto — sin React ni DOM.
 *
 * Lo comparten la página (cascada, guía y gráfico) y `metadata.ts` (FAQPage), para que la prosa
 * y el JSON-LD salgan de la MISMA cuenta que la calculadora (hallazgos 1894 y 1896 del
 * 25/09/2026: el FAQPage y el recuadro de conclusión llevaban cifras escritas a mano de antes de
 * las reparaciones del motor fiscal, y contradecían a la cascada).
 *
 * Supuesto fijo (hallazgo 1899): contribuyente soltero/a, sin hijos ni ascendientes a cargo,
 * menor de 65 años y sin discapacidad, con un solo pagador, contrato indefinido y la escala
 * general combinada de `TRAMOS_IRPF_2025` (estatal + tipo autonómico medio). Es un
 * visualizador de UN solo mando; la situación familiar la pregunta `estimador-sueldo-neto`.
 */

import {
  TRAMOS_IRPF_2025,
  desglosarEscalaGeneral,
  cuotaEscalaGeneral,
  calcularCuotaIntegraGeneral,
  COTIZACIONES_SS_2026,
  BASES_SS_2026,
  MINIMOS_IRPF_2025,
  calcularRendimientoNetoTrabajo,
  calcularDeduccionRentasBajas,
  limitarDeduccionRendimientosTrabajo,
} from '@/data/fiscal';

/**
 * Liquidaciones de cotización al año. Son DOCE, tenga la nómina 12 pagas o 14: el art. 147
 * LGSS obliga a incluir en la base mensual «la parte proporcional de las pagas
 * extraordinarias», de modo que las extras se prorratean dentro de los doce meses en vez de
 * cotizar aparte. El tope máximo (5.101,20 €/mes en 2026) se aplica a esa base mensual.
 *
 * ⚠️ CORREGIDO EL 12/09/2026. Aquí ponía 14, y con él se dividía el bruto y se multiplicaba
 * la cuota. Por debajo del tope da lo mismo —bruto/14 × 14 es bruto—, así que el defecto
 * estuvo invisible; por encima, no: la app topaba la cotización en 71.416,80 € de bruto en
 * vez de en 61.214,40 €, y cobraba hasta 663,16 €/año de más (4.642,09 € donde corresponden
 * 3.978,94 €). Eso rebajaba además la base del IRPF, y el neto publicado salía unos 365 €
 * por debajo del real. Era el único sitio del catálogo que dividía entre 14: las otras cinco
 * apps de nómina y `lib/calculadoras/sueldoNeto.ts` ya usaban 12.
 *
 * Fuente: art. 147 LGSS + Orden PJC/297/2026 (Seguridad Social, «Bases y tipos de
 * cotización»). Verificado en sesión el 12/09/2026.
 */
export const LIQUIDACIONES_SS_ANUALES = 12;

/** Ejercicio de las cuantías de la DA 61.ª que se aplican (las de 2026, RDL 5/2026). */
export const EJERCICIO_DEDUCCION = 2026;

/** Tipo total de la cotización del trabajador (%), suma de COTIZACIONES_SS_2026. */
export const TIPO_SS_TRABAJADOR =
  COTIZACIONES_SS_2026.contingenciasComunes +
  COTIZACIONES_SS_2026.desempleo +
  COTIZACIONES_SS_2026.formacionProfesional +
  COTIZACIONES_SS_2026.mef;

/** Bruto anual a partir del cual la base de cotización se topa y la SS deja de crecer. */
export const BRUTO_TOPE_SS = BASES_SS_2026.maxima * LIQUIDACIONES_SS_ANUALES;

/** Cotización anual máxima del trabajador: la del tope. */
export const SS_MAXIMA_ANUAL = BASES_SS_2026.maxima * (TIPO_SS_TRABAJADOR / 100) * LIQUIDACIONES_SS_ANUALES;

/** Primer tipo y tipo máximo de la escala que se aplica, con el umbral de este último. */
export const ESCALA_RESUMEN = {
  tipoMinimo: TRAMOS_IRPF_2025[0].tipo,
  hastaPrimerTramo: TRAMOS_IRPF_2025[0].hasta,
  tipoMaximo: TRAMOS_IRPF_2025[TRAMOS_IRPF_2025.length - 1].tipo,
  desdeTipoMaximo: TRAMOS_IRPF_2025[TRAMOS_IRPF_2025.length - 2].hasta,
};

export interface TramoDesglose {
  desde: number;
  hasta: number | null;
  base: number;
  tipo: number;
  cuota: number;
}

export interface DesgloseSueldo {
  brutoAnual: number;
  brutoMensual: number;
  // Cotizaciones SS
  baseSSMensual: number;
  baseSSTopada: boolean;
  ssContingencias: number;
  ssDesempleo: number;
  ssFormacion: number;
  ssMEI: number;
  totalSS: number;
  // Camino a la base del IRPF (arts. 19 y 20 LIRPF)
  /** Bruto − cotizaciones (gastos de las letras a) a e) del art. 19.2). */
  rendimientoPrevio: number;
  /** Gastos generales del art. 19.2.f): 2.000 €, sin pasar del rendimiento. */
  gastosGenerales: number;
  /** Reducción por obtención de rendimientos del trabajo (art. 20). */
  reduccionArt20: number;
  /** Base liquidable general, con el mínimo personal DENTRO. */
  baseLiquidable: number;
  // IRPF
  /** Mínimo personal (art. 57 LIRPF). NO reduce la base: se grava a tipo cero. */
  minimoPersonal: number;
  /** Parte del mínimo que cabe en la base: la que se grava a tipo cero (≤ base). */
  minimoAplicado: number;
  /** Escala aplicada a la base liquidable entera (primera aplicación, art. 63.1.2.º). */
  cuotaEscalaIRPF: number;
  /** Escala aplicada al mínimo aplicado (segunda aplicación), que se resta de la anterior. */
  cuotaMinimoIRPF: number;
  /** Cuota íntegra = cuotaEscalaIRPF − cuotaMinimoIRPF. */
  cuotaIntegraIRPF: number;
  /** Deducción por obtención de rendimientos del trabajo (DA 61.ª), ya topada en la cuota. */
  deduccionDA61: number;
  /** IRPF que corresponde en el año (cuota estimada), NO la retención mensual del reglamento. */
  irpfAnual: number;
  tipoEfectivoIRPF: number;
  /** Tipo del último tramo en el que entra la base (0 si la base es 0). */
  tipoMarginal: number;
  desgloseTramosIRPF: TramoDesglose[];
  // Resultado
  netoAnual: number;
  netoMensual: number;
  // Para visualización
  pctSS: number;
  pctIRPF: number;
  pctNeto: number;
}

export function calcularSueldo(brutoAnual: number): DesgloseSueldo {
  const bruto = Number.isFinite(brutoAnual) ? Math.max(0, brutoAnual) : 0;
  const brutoMensual = bruto / LIQUIDACIONES_SS_ANUALES;

  // 1. Cotizaciones SS (sobre base mensual prorrateada, limitada al tope)
  // Sin suelo en la base MÍNIMA: esa base es la de jornada completa, y coincide con el SMI, así
  // que un bruto anual por debajo solo puede ser jornada parcial o parte del año — y entonces
  // se cotiza por lo cobrado. Hasta el 24/09/2026 se subía a la mínima: 14.000 € a media
  // jornada cotizaban sobre 17.092,80 € (1.111 € en vez de 910 €).
  const pagas = LIQUIDACIONES_SS_ANUALES;
  const baseSSMensual = Math.min(brutoMensual, BASES_SS_2026.maxima);
  const ssContingencias = baseSSMensual * (COTIZACIONES_SS_2026.contingenciasComunes / 100) * pagas;
  const ssDesempleo = baseSSMensual * (COTIZACIONES_SS_2026.desempleo / 100) * pagas;
  const ssFormacion = baseSSMensual * (COTIZACIONES_SS_2026.formacionProfesional / 100) * pagas;
  const ssMEI = baseSSMensual * (COTIZACIONES_SS_2026.mef / 100) * pagas;
  const totalSS = ssContingencias + ssDesempleo + ssFormacion + ssMEI;

  // 2. Base del IRPF: gastos del art. 19 y reducción del art. 20, medida sobre bruto − SS ANTES
  // de restar los 2.000 € de la letra f) (hallazgo 1687 de estimador-sueldo-neto, mismo
  // defecto: hasta el 25/09/2026 se medía después).
  const rnt = calcularRendimientoNetoTrabajo({ integros: bruto, gastosAaE: totalSS });
  const baseLiquidable = Math.max(0, rnt.rendimientoNetoReducido);

  // 3. Mínimo personal. NO reduce la base (art. 63.1.2.º LIRPF): la base liquidable general lo
  // lleva dentro y se grava a tipo cero restando de la cuota la escala aplicada a él. Si la
  // base no llega al mínimo, solo se grava a tipo cero la parte que cabe (el mismo tope que
  // aplica calcularCuotaIntegraGeneral).
  //
  // ATENCIÓN 12/09/2026: hasta esta fecha esta app restaba el mínimo de la base antes de
  // aplicar la escala, que lo valora al tipo marginal y subestima la cuota: 610,50 € con
  // 30.000 € de bruto y 1.443 € de 80.000 en adelante.
  const minimoPersonal = MINIMOS_IRPF_2025.personal;
  const minimoAplicado = Math.min(minimoPersonal, baseLiquidable);

  const { cuota: cuotaEscalaIRPF, tramos } = desglosarEscalaGeneral(baseLiquidable);
  const desgloseTramosIRPF: TramoDesglose[] = tramos.map((t) => ({
    desde: t.desde, hasta: t.hasta, base: t.base, tipo: t.tipo, cuota: t.cuota,
  }));
  const cuotaMinimoIRPF = cuotaEscalaGeneral(minimoAplicado);
  const cuotaIntegraIRPF = calcularCuotaIntegraGeneral(baseLiquidable, minimoPersonal);

  // 4. Deducción por obtención de rendimientos del trabajo (DA 61.ª LIRPF, cuantías de 2026):
  // sobre el bruto, con tope en la cuota íntegra, que aquí es toda del trabajo.
  const deduccionDA61 = limitarDeduccionRendimientosTrabajo(
    calcularDeduccionRentasBajas(bruto, 0, EJERCICIO_DEDUCCION),
    cuotaIntegraIRPF,
  );
  const irpfAnual = Math.max(0, cuotaIntegraIRPF - deduccionDA61);

  // 5. Neto
  const netoAnual = bruto - totalSS - irpfAnual;
  const netoMensual = netoAnual / 12;

  const pct = (x: number) => (bruto > 0 ? (x / bruto) * 100 : 0);

  return {
    brutoAnual: bruto,
    brutoMensual,
    baseSSMensual,
    baseSSTopada: brutoMensual > BASES_SS_2026.maxima,
    ssContingencias, ssDesempleo, ssFormacion, ssMEI, totalSS,
    rendimientoPrevio: rnt.rendimientoPrevio,
    gastosGenerales: rnt.otrosGastos,
    reduccionArt20: rnt.reduccion,
    baseLiquidable,
    minimoPersonal, minimoAplicado,
    cuotaEscalaIRPF, cuotaMinimoIRPF, cuotaIntegraIRPF,
    deduccionDA61, irpfAnual,
    tipoEfectivoIRPF: pct(irpfAnual),
    tipoMarginal: desgloseTramosIRPF[desgloseTramosIRPF.length - 1]?.tipo ?? 0,
    desgloseTramosIRPF,
    netoAnual, netoMensual,
    pctSS: pct(totalSS),
    pctIRPF: pct(irpfAnual),
    pctNeto: pct(netoAnual),
  };
}

/**
 * Primer bruto del deslizador (pasos de 1.000 € desde 15.000) en el que el IRPF anual supera a
 * la cotización del trabajador. Lo usa la guía para decir HASTA DÓNDE pesa más la SS, en vez de
 * una cifra escrita a mano que envejezca con el próximo cambio normativo (hallazgo 1896).
 */
export function brutoDondeIrpfSuperaSS(desde = 15000, hasta = 150000, paso = 1000): number | null {
  for (let b = desde; b <= hasta; b += paso) {
    const d = calcularSueldo(b);
    if (d.irpfAnual > d.totalSS) return b;
  }
  return null;
}
