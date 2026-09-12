/**
 * Impacto en el IRPF de un divorcio o separación (modelo estatal orientativo).
 *
 * Fuente ÚNICA del cálculo: lo usan la tool `calcular_impuestos_divorcio` del MCP de Delegum y
 * la app `app/impuestos-divorcio/`, que desde el 10/09/2026 ya no lleva su copia inline. La
 * fuente única de tramos, mínimos y reducciones es data/fiscal/irpf.ts.
 *
 * Nació como «réplica server-side» de la app y arrastró un «TODO: unificar» durante tres meses;
 * mientras estuvo abierto, la copia de la app y esta divergieron en el validador (ver abajo).
 *
 * Alcance: SOLO IRPF (pensión compensatoria art. 55, mínimo por descendientes,
 * imputación de rentas inmobiliarias art. 85, deducción transitoria vivienda D.T. 18ª).
 * NO calcula ITP/AJD, plusvalía municipal ni ganancia patrimonial. La liquidación de
 * gananciales se considera no sujeta. Sin variaciones por CCAA ni regímenes forales.
 *
 * ── Contrato de entrada (09/09/2026) ──────────────────────────────────────────
 * Del original se replicaron las funciones de cálculo pero NO el `pasoValido()` de la app,
 * que es donde vivían sus condiciones de completitud. Sin él, el motor resolvía solo lo que
 * nadie le había dicho: afirmaba que se perdía la deducción de la hipoteca sin saber quién la
 * paga, hacía desaparecer el bloque de hijos entero por faltar el número, y aceptaba ingresos
 * negativos o un 500 % de propiedad. La regla que se aplica ahora, uniforme en los cuatro
 * bloques y calcada de `pasoValido()`:
 *
 *   - Falta el DISCRIMINANTE del bloque (rolPension, custodia, posVivienda, posHipoteca)
 *     → el bloque no se emite. Es la guarda que ya tenían pensión, hijos y vivienda.
 *   - Falta la MAGNITUD con el discriminante presente (pensionMensual, numHijos,
 *     valorCatastral, cuotaHipoteca) → se RECHAZA con un error que nombra el campo.
 *     Callar omitiría dinero en silencio (hasta 2.584 €/año en el bloque de hijos) y
 *     rellenar con un cero publicaría una cifra donde no hay dato.
 *   - Los rangos (finitud, signos, 1–4 hijos, 0–100 % de propiedad) se comprueban siempre,
 *     como hace `calcularIRPF` en este mismo directorio.
 *
 * Excepción deliberada: `catastroRevisado` sigue cayendo a "no revisado" (tipo 2 %) cuando no
 * se declara, pese a que `pasoValido()` lo exige. Es el comportamiento fijado en
 * tests/calculadoras-invariantes.spec.ts para que un cambio se vea, y el default declarado
 * en el schema del MCP.
 */
import {
  cuotaEscalaGeneral,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  calcularReduccionRendimientosTrabajo,
} from '@/data/fiscal/irpf';

export type RegimenDivorcio = 'gananciales' | 'separacion' | 'participacion';
export type CustodiaDivorcio = 'exclusiva-tengo' | 'exclusiva-otro' | 'compartida';
export type PosViviendaDivorcio = 'me-quedo' | 'salgo' | 'vendemos';
export type RolPensionDivorcio = 'pago' | 'cobro';
export type PosHipotecaDivorcio = 'me-quedo' | 'otro-paga';

export interface ParametrosImpuestosDivorcio {
  regimen: RegimenDivorcio;
  /** Ingresos brutos anuales del trabajo (€). */
  ingresos: number;
  tieneHijos?: boolean;
  /** 1-4 (4 = "4 o más", como en la app). Obligatorio si hay hijos y custodia. */
  numHijos?: number;
  custodia?: CustodiaDivorcio;
  tieneVivienda?: boolean;
  posVivienda?: PosViviendaDivorcio;
  /** Obligatorio si se sale de la vivienda y su uso no se asigna a los hijos. */
  valorCatastral?: number;
  /** % de propiedad del contribuyente. Por defecto 50. */
  porcPropiedad?: number;
  /** true → tipo 1,1 %; false → 2 %. */
  catastroRevisado?: boolean;
  viviendaAsignadaHijos?: boolean;
  tienePensionConyuge?: boolean;
  rolPension?: RolPensionDivorcio;
  /** €/mes. Obligatorio si hay pensión compensatoria y rol declarado. */
  pensionMensual?: number;
  tieneHipotecaAntigua?: boolean;
  posHipoteca?: PosHipotecaDivorcio;
  /** Cuota anual de hipoteca que paga el contribuyente (€). Obligatoria si "me-quedo". */
  cuotaHipoteca?: number;
}

export interface ResultadoImpuestosDivorcio {
  gananciales: boolean;
  pensionConyuge?: { pensionAnual: number; tipo: 'ahorro' | 'coste'; importe: number };
  hijos?: {
    minimoTotal: number;
    minimoAplicable: number;
    porcentaje: number;
    ahorroEstimado: number;
    custodia: CustodiaDivorcio;
  };
  vivienda?: { imputacionAnual: number; costeFiscal: number; exenta: boolean };
  hipoteca?: { deduccionAnual: number; tipo: 'mantiene' | 'pierde' };
}

/** Base máxima anual de la deducción por vivienda habitual (régimen transitorio). */
const TOPE_DEDUCCION_HIPOTECA = 9040;

/** Máximo de hijos del modelo: 4 significa "4 o más" (igual que el selector de la app). */
const MAX_HIJOS = 4;

const REGIMENES: readonly RegimenDivorcio[] = ['gananciales', 'separacion', 'participacion'];

/** Redondeo a céntimos. Todo lo que se publica pasa por aquí, y lo derivado se calcula sobre lo ya redondeado. */
const r = (n: number) => Math.round(n * 100) / 100;

/** Cuota integra de IRPF por tramos progresivos (escala general). */
const calcularCuotaIRPF = cuotaEscalaGeneral;

/**
 * Base liquidable simplificada a partir de ingresos brutos del trabajo.
 * Aproximación de la app: NO descuenta cotizaciones SS ni mínimo personal.
 */
function calcularBaseSimplificada(ingresosBrutos: number): number {
  const rnt = Math.max(0, ingresosBrutos - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral);
  const reduccion = calcularReduccionRendimientosTrabajo(rnt);
  return Math.max(0, rnt - reduccion);
}

/** Suma del mínimo por descendientes (cumulativo por número de hijos). */
function calcularMinimoHijos(numHijos: number): number {
  const m = MINIMOS_IRPF_2025;
  let total = 0;
  for (let i = 1; i <= numHijos; i++) {
    if (i === 1) total += m.hijo_1;
    else if (i === 2) total += m.hijo_2;
    else if (i === 3) total += m.hijo_3;
    else total += m.hijo_4_mas;
  }
  return total;
}

// ─── Validación de entrada ─────────────────────────────────────────────────────

/** Un número que no es un número finito no puede recorrer una escala de tramos: se rechaza antes. */
function exigirFinito(valor: number, campo: string): void {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new Error(`El campo "${campo}" debe ser un número finito (recibido: ${String(valor)}).`);
  }
}

function exigirRango(valor: number, campo: string, min: number, max: number, unidad = ''): void {
  exigirFinito(valor, campo);
  if (valor < min || valor > max) {
    throw new Error(`El campo "${campo}" debe estar entre ${min}${unidad} y ${max}${unidad} (recibido: ${valor}${unidad}).`);
  }
}

function validarParametros(p: ParametrosImpuestosDivorcio): void {
  // Rangos y finitud — lo mismo que hace calcularIRPF en este directorio.
  if (!REGIMENES.includes(p.regimen)) {
    throw new Error(`Régimen económico matrimonial no reconocido: "${String(p.regimen)}". Valores válidos: ${REGIMENES.join(', ')}.`);
  }
  exigirFinito(p.ingresos, 'ingresos');
  if (p.ingresos < 0) throw new Error('Los ingresos brutos anuales no pueden ser negativos.');

  if (p.numHijos !== undefined) {
    exigirFinito(p.numHijos, 'numHijos');
    if (!Number.isInteger(p.numHijos) || p.numHijos < 1 || p.numHijos > MAX_HIJOS) {
      throw new Error(`El campo "numHijos" debe ser un entero entre 1 y ${MAX_HIJOS} (usa ${MAX_HIJOS} para "4 o más"). Recibido: ${p.numHijos}.`);
    }
  }
  if (p.valorCatastral !== undefined) {
    exigirFinito(p.valorCatastral, 'valorCatastral');
    if (p.valorCatastral < 0) throw new Error('El valor catastral no puede ser negativo.');
  }
  if (p.porcPropiedad !== undefined) exigirRango(p.porcPropiedad, 'porcPropiedad', 0, 100, ' %');
  if (p.pensionMensual !== undefined) {
    exigirFinito(p.pensionMensual, 'pensionMensual');
    if (p.pensionMensual < 0) throw new Error('La pensión compensatoria mensual no puede ser negativa.');
  }
  if (p.cuotaHipoteca !== undefined) {
    exigirFinito(p.cuotaHipoteca, 'cuotaHipoteca');
    if (p.cuotaHipoteca < 0) throw new Error('La cuota anual de hipoteca no puede ser negativa.');
  }

  // Completitud por bloque: si el discriminante está, la magnitud no puede faltar.
  if (p.tienePensionConyuge && p.rolPension && !((p.pensionMensual ?? 0) > 0)) {
    throw new Error('Has indicado que hay pensión compensatoria y quién la paga, pero no su importe: "pensionMensual" (€/mes) es obligatorio y mayor que 0.');
  }
  if (p.tieneHijos && p.custodia && p.numHijos === undefined) {
    throw new Error(`Has indicado que hay hijos a cargo y el tipo de custodia, pero no cuántos hijos: "numHijos" (1-${MAX_HIJOS}; ${MAX_HIJOS} = "4 o más") es obligatorio para calcular el mínimo por descendientes.`);
  }
  if (p.tieneVivienda && p.posVivienda === 'salgo' && p.viviendaAsignadaHijos !== true) {
    if (!((p.valorCatastral ?? 0) > 0)) {
      throw new Error('Has indicado que sales de la vivienda y que su uso no se asigna a los hijos, pero no su valor catastral: "valorCatastral" (€) es obligatorio y mayor que 0 para calcular la imputación de renta inmobiliaria.');
    }
    if (p.porcPropiedad !== undefined && p.porcPropiedad <= 0) {
      throw new Error('El porcentaje de propiedad de la vivienda de la que sales debe ser mayor que 0 %: con 0 % no hay imputación que calcular.');
    }
  }
  if (p.tieneHipotecaAntigua && p.posHipoteca === 'me-quedo' && !((p.cuotaHipoteca ?? 0) > 0)) {
    throw new Error('Has indicado que te quedas con la hipoteca anterior a 2013, pero no cuánto pagas por ella: "cuotaHipoteca" (€/año) es obligatoria y mayor que 0 para calcular la deducción.');
  }
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularImpuestosDivorcio(
  p: ParametrosImpuestosDivorcio
): ResultadoImpuestosDivorcio {
  validarParametros(p);

  const base = calcularBaseSimplificada(p.ingresos);
  const resultado: ResultadoImpuestosDivorcio = {
    gananciales: p.regimen === 'gananciales',
  };

  // Pensión compensatoria al cónyuge
  const pensionMensual = p.pensionMensual ?? 0;
  if (p.tienePensionConyuge && p.rolPension && pensionMensual > 0) {
    const pensionAnual = r(pensionMensual * 12);
    if (p.rolPension === 'pago') {
      // Reduce la base del pagador → ahorro
      const importe = r(Math.max(
        0,
        calcularCuotaIRPF(base) - calcularCuotaIRPF(Math.max(0, base - pensionAnual))
      ));
      resultado.pensionConyuge = { pensionAnual, tipo: 'ahorro', importe };
    } else {
      // Tributa como renta del que la cobra → coste
      const baseCon = calcularBaseSimplificada(p.ingresos + pensionAnual);
      const importe = r(Math.max(0, calcularCuotaIRPF(baseCon) - calcularCuotaIRPF(base)));
      resultado.pensionConyuge = { pensionAnual, tipo: 'coste', importe };
    }
  }

  // Mínimo por descendientes según custodia
  const numHijos = p.numHijos ?? 0;
  if (p.tieneHijos && p.custodia && numHijos > 0) {
    const minimoTotal = r(calcularMinimoHijos(numHijos));
    const porcentaje =
      p.custodia === 'exclusiva-otro' ? 0 : p.custodia === 'compartida' ? 50 : 100;
    // Cada cifra se deriva de la anterior YA redondeada: el desglose impreso tiene que cuadrar.
    const minimoAplicable = r(minimoTotal * (porcentaje / 100));
    // Art. 63.1.2 LIRPF: el minimo NO reduce la base, se grava a tipo cero. Su ahorro es
    // lo que la escala le aplica ENCIMA del minimo personal, no el tipo marginal de quien
    // declara. Hasta el 12/09/2026 aqui habia un 19 % fijo: exacto hasta dos hijos (el
    // minimo cabe entero en el primer tramo) y corto desde el tercero, donde parte cae ya
    // al 24 % — 110 EUR menos con tres hijos y 335 EUR con cuatro.
    const ahorroEstimado = r(
      calcularCuotaIRPF(MINIMOS_IRPF_2025.personal + minimoAplicable)
        - calcularCuotaIRPF(MINIMOS_IRPF_2025.personal),
    );
    resultado.hijos = { minimoTotal, minimoAplicable, porcentaje, ahorroEstimado, custodia: p.custodia };
  }

  // Vivienda: solo el que sale genera imputación de renta inmobiliaria
  if (p.tieneVivienda && p.posVivienda === 'salgo') {
    if (p.viviendaAsignadaHijos === true) {
      resultado.vivienda = { imputacionAnual: 0, costeFiscal: 0, exenta: true };
    } else if ((p.valorCatastral ?? 0) > 0) {
      const tipo = p.catastroRevisado ? 0.011 : 0.02;
      const porc = (p.porcPropiedad ?? 50) / 100;
      // El coste fiscal se calcula sobre la imputación YA redondeada, que es la que se publica:
      // hacerlo sobre la no redondeada descuadraba el desglose por 1 céntimo en el 8,5 % de los casos.
      const imputacionAnual = r((p.valorCatastral ?? 0) * porc * tipo);
      const costeFiscal = r(calcularCuotaIRPF(base + imputacionAnual) - calcularCuotaIRPF(base));
      resultado.vivienda = { imputacionAnual, costeFiscal, exenta: false };
    }
  }

  // Hipoteca anterior a 2013 (deducción transitoria).
  // Exige su discriminante como los otros tres bloques: era el único con `else`, y ese `else`
  // se tragaba el undefined afirmando que se perdía la deducción sin que nadie lo hubiera dicho.
  if (p.tieneHipotecaAntigua && p.posHipoteca) {
    if (p.posHipoteca === 'me-quedo') {
      const deduccionAnual = r(Math.min(p.cuotaHipoteca ?? 0, TOPE_DEDUCCION_HIPOTECA) * 0.15);
      resultado.hipoteca = { deduccionAnual, tipo: 'mantiene' };
    } else {
      resultado.hipoteca = { deduccionAnual: 0, tipo: 'pierde' };
    }
  }

  return resultado;
}
