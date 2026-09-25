/**
 * Motor de cálculo del estimador de sueldo neto — sin React ni DOM.
 *
 * Vive aparte de `page.tsx` desde el 25/09/2026 (hallazgos 1651 y 1656) para que la
 * calculadora, el bloque educativo y el FAQPage de `metadata.ts` saquen las cifras del MISMO
 * sitio. Hasta entonces los perfiles, la tabla «12 vs 14 pagas» y las horquillas del FAQPage
 * estaban escritos a mano con el modelo anterior a 2b80033d (reducción residual del art. 20)
 * y a 6dda61c2 (mínimo al tipo marginal), y contradecían a la calculadora de la misma página
 * en hasta 2.506 € de neto.
 *
 * Todos los datos normativos salen de `@/data/fiscal`: aquí no se escribe ningún tipo,
 * límite ni tramo.
 */
import {
  TRAMOS_IRPF_2025,
  calcularCuotaIntegraGeneral,
  COTIZACIONES_SS_2026,
  BASES_SS_2026,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  calcularReduccionRendimientosTrabajo,
  REDUCCION_TRIBUTACION_CONJUNTA_2025,
  calcularDeduccionRentasBajas,
  limitarDeduccionRendimientosTrabajo,
} from '@/data/fiscal';

/** Situación familiar para IRPF */
export type SituacionFamiliar = 'soltero' | 'casado_un_ingreso' | 'casado_dos_ingresos' | 'familia_monoparental';

/** Tipo total de cotización del trabajador (COTIZACIONES_SS_2026), en %. */
export const TIPO_SS_TRABAJADOR =
  COTIZACIONES_SS_2026.contingenciasComunes +
  COTIZACIONES_SS_2026.desempleo +
  COTIZACIONES_SS_2026.formacionProfesional +
  COTIZACIONES_SS_2026.mef;

/**
 * Cuota íntegra del IRPF (art. 63.1.2º LIRPF).
 *
 * ⚠️ CORREGIDO EL 12/09/2026. Hasta esta fecha la función restaba el mínimo personal y
 * familiar DE LA BASE antes de aplicar la escala, lo que lo valora al tipo MARGINAL del
 * contribuyente y rebaja la cuota más cuanto más alto es el sueldo. El art. 63.1.2º dice
 * lo contrario: el mínimo «no reduce la renta», forma parte de la base liquidable general
 * y se grava a TIPO CERO aplicando la escala dos veces — una a la base liquidable completa
 * y otra al mínimo — y restando la segunda cuota de la primera. Así el mínimo vale lo
 * mismo (el 19 % de los primeros tramos) para todos los contribuyentes con las mismas
 * circunstancias familiares, que es justamente el efecto que la norma persigue.
 *
 * El error subestimaba la cuota en 610,50 € con 30.000 € de bruto. Con 120.000 € eran
 * 1.443 € y no los 1.054,50 € que dijo el parte original, que confundió el error con la
 * cuota del propio mínimo: 1.443 € es el techo del defecto (5.550 × (45 − 19) %) y se
 * alcanza ya con 80.000 € de bruto. Medido el 12/09/2026.
 *
 * Es el mismo defecto que el commit 2b80033d (09/09/2026) reparó en seis motores de
 * `lib/calculadoras`; esta app quedó fuera porque calculaba por su cuenta. Desde el
 * 12/09/2026 la fórmula tampoco vive aquí: la pone `calcularCuotaIntegraGeneral`.
 *
 * Fuente: art. 63.1.2º Ley 35/2006 (AEAT, Manual práctico Renta 2025, cap. 15).
 */
function calcularIRPF(baseLiquidable: number, minimoPersonalFamiliar: number): number {
  return calcularCuotaIntegraGeneral(baseLiquidable, minimoPersonalFamiliar);
}

/** Tipo marginal (%) de la escala en la que cae una base liquidable. */
export function tipoMarginal(baseLiquidable: number): number {
  const tramo = TRAMOS_IRPF_2025.find((t) => baseLiquidable < t.hasta) ?? TRAMOS_IRPF_2025[TRAMOS_IRPF_2025.length - 1];
  return tramo.tipo;
}

// Función para calcular la Seguridad Social
export function calcularSeguridadSocial(salarioBrutoAnual: number): { anual: number; mensual: number; desglose: Record<string, number> } {
  const salarioMensual = salarioBrutoAnual / 12;

  // Aplicar la base MÁXIMA de cotización.
  // Sin suelo en la base MÍNIMA: esa base es la de jornada completa, y coincide con el SMI, así
  // que un bruto anual por debajo solo puede ser jornada parcial o parte del año — y entonces
  // se cotiza por lo cobrado. Hasta el 24/09/2026 se subía a la mínima: 14.000 € a media
  // jornada cotizaban sobre 17.092,80 € (1.111 € en vez de 910 €).
  const baseCotizacion = Math.min(salarioMensual, BASES_SS_2026.maxima);

  const desglose: Record<string, number> = {};

  desglose.contingenciasComunes = baseCotizacion * (COTIZACIONES_SS_2026.contingenciasComunes / 100);
  desglose.desempleo = baseCotizacion * (COTIZACIONES_SS_2026.desempleo / 100);
  desglose.formacionProfesional = baseCotizacion * (COTIZACIONES_SS_2026.formacionProfesional / 100);
  desglose.mef = baseCotizacion * (COTIZACIONES_SS_2026.mef / 100);

  const totalMensual = Object.values(desglose).reduce((a, b) => a + b, 0);

  return {
    mensual: totalMensual,
    anual: totalMensual * 12,
    desglose,
  };
}

// Mínimo personal y familiar (arts. 57 a 61 LIRPF). Ya NO recibe `situacion`: lo único que
// dependía de ella era la reducción por tributación conjunta, que se fue a su propia función
// por no ser un mínimo (ver calcularReduccionTributacionConjunta).
export function calcularMinimosPersonales(numHijos: number, hijosMenores3: number): number {
  let minimos = MINIMOS_IRPF_2025.personal;

  // Añadir por hijos
  if (numHijos >= 1) minimos += MINIMOS_IRPF_2025.hijo_1;
  if (numHijos >= 2) minimos += MINIMOS_IRPF_2025.hijo_2;
  if (numHijos >= 3) minimos += MINIMOS_IRPF_2025.hijo_3;
  if (numHijos >= 4) minimos += MINIMOS_IRPF_2025.hijo_4_mas * (numHijos - 3);

  // Adicional por hijos menores de 3 años
  minimos += hijosMenores3 * MINIMOS_IRPF_2025.hijo_menor_3;

  return minimos;
}

/**
 * Reducción por tributación conjunta (art. 84.2, reglas 3ª y 4ª LIRPF): solo aplica cuando
 * la unidad familiar declara conjunta, es decir, un único perceptor de ingresos
 * (matrimonio con un solo ingreso, o unidad monoparental con hijos).
 *
 * ⚠️ Vive aparte de `calcularMinimosPersonales` desde el 12/09/2026 porque NO es un mínimo:
 * la norma dice «la base imponible se reducirá en 3.400 euros anuales», así que se resta de
 * la base y se valora al tipo marginal, mientras que el mínimo del art. 63.1.2º se grava a
 * tipo cero. Sumarla al mínimo, como se hacía antes, le daba el tratamiento del otro.
 */
export function calcularReduccionTributacionConjunta(situacion: SituacionFamiliar, numHijos: number): number {
  if (situacion === 'casado_un_ingreso') return REDUCCION_TRIBUTACION_CONJUNTA_2025.biparental;
  if (situacion === 'familia_monoparental' && numHijos > 0) {
    return REDUCCION_TRIBUTACION_CONJUNTA_2025.monoparental;
  }
  return 0;
}

export interface ResultadoBrutoANeto {
  netoAnual: number;
  netoMensual: number;
  irpfAnual: number;
  irpfPorcentaje: number;
  ssAnual: number;
  ssDesglose: Record<string, number>;
  tipoRetencion: number;
  deduccionRentasBajas: number;
  /** Base imponible general: RNT − reducción del art. 20 (antes de la reducción del art. 84.2). */
  baseImponible: number;
  /** Base liquidable general (el mínimo va DENTRO: art. 63.1.2.º). */
  baseLiquidable: number;
  /** Mínimo personal y familiar, gravado a tipo cero. */
  minimos: number;
}

// Calcular neto a partir del bruto
export function calcularBrutoANeto(
  brutoAnual: number,
  situacion: SituacionFamiliar,
  numHijos: number,
  hijosMenores3: number,
  pagas: number
): ResultadoBrutoANeto {
  const ss = calcularSeguridadSocial(brutoAnual);
  // Rendimiento neto del trabajo (RNT): bruto - SS - gastos deducibles generales (art. 19 LIRPF)
  const rnt = Math.max(0, brutoAnual - ss.anual - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral);
  // Reducción por obtención de rendimientos del trabajo (art. 20 LIRPF)
  const reduccionRNT = calcularReduccionRendimientosTrabajo(rnt);
  const baseImponible = Math.max(0, rnt - reduccionRNT);
  // Base liquidable general = base imponible − reducciones de base (art. 84.2 en tributación
  // conjunta). El mínimo personal y familiar NO se resta aquí: entra en calcularIRPF.
  const baseLiquidable = Math.max(
    0,
    baseImponible - calcularReduccionTributacionConjunta(situacion, numHijos)
  );
  const minimos = calcularMinimosPersonales(numHijos, hijosMenores3);
  const cuotaIRPF = calcularIRPF(baseLiquidable, minimos);
  // Deducción por obtención de rendimientos del trabajo (DA 61.ª LIRPF, cuantías de 2026):
  // sobre el bruto, con tope en la cuota íntegra, que aquí es toda del trabajo.
  const deduccion = limitarDeduccionRendimientosTrabajo(
    calcularDeduccionRentasBajas(brutoAnual, 0, 2026),
    cuotaIRPF,
  );
  const irpfAnual = Math.max(0, cuotaIRPF - deduccion);
  const tipoRetencion = brutoAnual > 0 ? (irpfAnual / brutoAnual) * 100 : 0;
  const netoAnual = brutoAnual - ss.anual - irpfAnual;

  return {
    netoAnual,
    netoMensual: netoAnual / pagas,
    irpfAnual,
    irpfPorcentaje: brutoAnual > 0 ? (irpfAnual / brutoAnual) * 100 : 0,
    ssAnual: ss.anual,
    ssDesglose: ss.desglose,
    tipoRetencion,
    deduccionRentasBajas: deduccion,
    baseImponible,
    baseLiquidable,
    minimos,
  };
}

export interface ResultadoNetoABruto {
  brutoAnual: number;
  brutoMensual: number;
  irpfAnual: number;
  irpfPorcentaje: number;
  ssAnual: number;
  ssDesglose: Record<string, number>;
  tipoRetencion: number;
  deduccionRentasBajas: number;
}

// Calcular bruto a partir del neto (aproximación iterativa)
export function calcularNetoABruto(
  netoAnualObjetivo: number,
  situacion: SituacionFamiliar,
  numHijos: number,
  hijosMenores3: number,
  pagas: number
): ResultadoNetoABruto {
  // Estimación inicial: neto / 0.7 (asumiendo ~30% de deducciones)
  let brutoEstimado = netoAnualObjetivo / 0.7;
  const tolerancia = 0.01;
  const maxIteraciones = 100;

  const empaquetar = (bruto: number, r: ResultadoBrutoANeto): ResultadoNetoABruto => ({
    brutoAnual: bruto,
    brutoMensual: bruto / pagas,
    irpfAnual: r.irpfAnual,
    irpfPorcentaje: r.irpfPorcentaje,
    ssAnual: r.ssAnual,
    ssDesglose: r.ssDesglose,
    tipoRetencion: r.tipoRetencion,
    deduccionRentasBajas: r.deduccionRentasBajas,
  });

  for (let i = 0; i < maxIteraciones; i++) {
    const resultado = calcularBrutoANeto(brutoEstimado, situacion, numHijos, hijosMenores3, pagas);
    const diferencia = resultado.netoAnual - netoAnualObjetivo;

    if (Math.abs(diferencia) < tolerancia) {
      return empaquetar(brutoEstimado, resultado);
    }

    // Ajustar estimación
    brutoEstimado -= diferencia * 0.8;
  }

  // Devolver mejor aproximación
  return empaquetar(brutoEstimado, calcularBrutoANeto(brutoEstimado, situacion, numHijos, hijosMenores3, pagas));
}
