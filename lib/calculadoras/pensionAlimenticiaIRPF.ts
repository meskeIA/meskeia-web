/**
 * Calculadora de Pension Alimenticia en IRPF
 * Usada por: MCP server (calcular_pension_alimenticia_irpf)
 *
 * Calcula el tratamiento fiscal de las pensiones de alimentos y pensiones
 * compensatorias en el IRPF, tanto para el pagador como para el receptor,
 * en situaciones de separacion, divorcio o nulidad matrimonial.
 *
 * Marco normativo:
 *   - LIRPF art. 7.k: exencion de las anualidades por alimentos a hijos
 *   - LIRPF art. 55: reduccion de la base imponible por pension compensatoria
 *   - LIRPF art. 64: regla especial escala anualidades por alimentos a hijos
 *   - LIRPF art. 75: deduccion autonomica (informativa)
 *   - Codigo Civil arts. 90, 93, 97-100: marco civil
 *
 * TIPOS DE PENSION EN IRPF:
 *
 *   A) ANUALIDADES POR ALIMENTOS A HIJOS (art. 7.k + art. 64):
 *      Para el RECEPTOR (hijo, normalmente menor):
 *        - EXENTAS en IRPF si las paga el padre/madre por resolucion judicial
 *        - Los hijos menores normalmente no declaran IRPF
 *      Para el PAGADOR (progenitor):
 *        - NO son deducibles de la base imponible (diferente a la compensatoria)
 *        - PERO aplica la regla especial del art. 64: las anualidades por alimentos
 *          tributan en la escala general como si fueran la parte mas baja de la base
 *          (reduce el tipo medio, ventaja fiscal indirecta)
 *        - NO reducen la base imponible general como la pension compensatoria
 *
 *   B) PENSION COMPENSATORIA AL EX-CONYUGE (art. 55):
 *      Para el PAGADOR:
 *        - REDUCE la base imponible general (similar a aportacion plan pensiones)
 *        - Limite: la base imponible general no puede quedar negativa
 *      Para el RECEPTOR:
 *        - Tributa como rendimiento del trabajo en la base GENERAL
 *        - El pagador debe practicar retencion del 15% si se paga de forma periodica
 *
 *   C) PENSION COMPENSATORIA EN FORMA DE CAPITAL (pago unico):
 *      - No reduce la base imponible del pagador
 *      - Para el receptor: puede ser ganancia patrimonial
 *
 * REGLA ART. 64 (anualidades hijos — ventaja fiscal pagador):
 *   La base liquidable se divide en dos partes:
 *   1. Anualidades por alimentos
 *   2. Resto de la base liquidable
 *   Cada parte tributa por separado con la tarifa general,
 *   sumando las cuotas resultantes.
 *   Esto evita que las anualidades se sumen al resto y suban el tipo marginal.
 *
 * Fuente: LIRPF arts. 7.k, 55, 64 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_declaracion_conjunta
 */

// --- Constantes ---

// Escala general 2025 (estimada — estado + autonomia)
const TRAMOS_GENERALES: { hasta: number; tipo: number }[] = [
  { hasta: 12_450,  tipo: 19 },
  { hasta: 20_200,  tipo: 24 },
  { hasta: 35_200,  tipo: 30 },
  { hasta: 60_000,  tipo: 37 },
  { hasta: 300_000, tipo: 45 },
  { hasta: Infinity, tipo: 47 },
];

const PCT_RETENCION_PENSION_COMPENSATORIA = 15; // %

// --- Tipos publicos ---

export type TipoPensionIRPF =
  | 'alimentos_hijos'        // Anualidades por alimentos a hijos — exentas receptor, regla art.64 pagador
  | 'compensatoria_periodica' // Pension compensatoria periodica — reduce base pagador, RDT receptor
  | 'compensatoria_capital';  // Pension compensatoria en un pago unico

export type RolContribuyente = 'pagador' | 'receptor';

export interface ParametrosPensionAlimenticiaIRPF {
  tipoPension: TipoPensionIRPF;
  rol: RolContribuyente;
  /** Importe anual de la pension (EUR) */
  importeAnual: number;
  /**
   * Base liquidable general del pagador (sin incluir la pension como gasto)
   * Solo para tipoPension='alimentos_hijos' y rol='pagador' — para calcular ventaja art. 64
   */
  baseLiquidableGeneralPagador?: number;
}

export interface ResultadoPensionAlimenticiaIRPF {
  tipoPension: TipoPensionIRPF;
  rol: RolContribuyente;
  importeAnual: number;
  /** Para el pagador: reduccion de base imponible (EUR) — solo pension compensatoria */
  reduccionBaseImponible: number;
  /** Para el pagador (alimentos hijos): cuota sin regla art.64 (referencia) */
  cuotaSinReglaEspecial: number;
  /** Para el pagador (alimentos hijos): cuota con regla art.64 */
  cuotaConReglaEspecial: number;
  /** Ahorro fiscal por la regla art.64 (EUR) */
  ahorroFiscalReglaEspecial: number;
  /** Para el receptor: importe exento / tributable (EUR) */
  importeExento: number;
  importeTributable: number;
  /** Retencion aplicable (solo pension compensatoria receptor) */
  pctRetencion: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funciones auxiliares ---

function cuotaEscalaGeneral(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let resto = base;
  let ant = 0;
  for (const t of TRAMOS_GENERALES) {
    const tramo = Math.min(resto, t.hasta - ant);
    cuota += tramo * t.tipo / 100;
    resto -= tramo;
    ant = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

// --- Funcion principal ---

export function calcularPensionAlimenticiaIRPF(
  p: ParametrosPensionAlimenticiaIRPF
): ResultadoPensionAlimenticiaIRPF {
  if (p.importeAnual <= 0) throw new Error('El importe anual de la pension debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  let reduccionBaseImponible = 0;
  let cuotaSinReglaEspecial = 0;
  let cuotaConReglaEspecial = 0;
  let ahorroFiscalReglaEspecial = 0;
  let importeExento = 0;
  let importeTributable = 0;
  let pctRetencion = 0;

  if (p.tipoPension === 'alimentos_hijos') {
    if (p.rol === 'pagador') {
      // Regla especial art. 64
      const baseTotal = p.baseLiquidableGeneralPagador ?? 0;
      if (baseTotal > 0) {
        const anualidades = Math.min(p.importeAnual, baseTotal);
        const restoBase = r(baseTotal - anualidades);
        // Sin regla: base total tributa junta
        cuotaSinReglaEspecial = r(cuotaEscalaGeneral(baseTotal));
        // Con regla: anualidades + resto tributan por separado
        cuotaConReglaEspecial = r(cuotaEscalaGeneral(anualidades) + cuotaEscalaGeneral(restoBase));
        ahorroFiscalReglaEspecial = r(Math.max(0, cuotaSinReglaEspecial - cuotaConReglaEspecial));
      }
      advertencias.push(
        'REGLA ART. 64 LIRPF: las anualidades por alimentos a hijos NO reducen la base imponible, ' +
        'pero tributan de forma separada del resto de la base liquidable, lo que reduce el tipo ' +
        'marginal efectivo. El ahorro fiscal se produce porque cada parte (anualidades + resto) ' +
        'comienza desde el tramo mas bajo de la tarifa.'
      );
      advertencias.push(
        'Las anualidades por alimentos a hijos establecidas por resolucion judicial NO son ' +
        'deducibles de la base imponible general (diferente de la pension compensatoria al conyuge). ' +
        'Tampoco aplica el minimo por descendientes si el hijo convive con el otro progenitor que paga.'
      );
    } else {
      // Receptor (hijo)
      importeExento = r(p.importeAnual);
      importeTributable = 0;
      advertencias.push(
        'EXENCION (LIRPF art. 7.k): las anualidades por alimentos recibidas de los padres ' +
        'en virtud de decision judicial estan EXENTAS de IRPF para el hijo receptor. ' +
        'No se declaran en la renta del hijo.'
      );
    }
  } else if (p.tipoPension === 'compensatoria_periodica') {
    if (p.rol === 'pagador') {
      reduccionBaseImponible = r(p.importeAnual);
      advertencias.push(
        'REDUCCION BASE IMPONIBLE (LIRPF art. 55): la pension compensatoria al ex-conyuge ' +
        'reduce la base imponible general del pagador. La base imponible general no puede ' +
        'quedar negativa por esta reduccion (el exceso no se traslada a ejercicios futuros).'
      );
      advertencias.push(
        'El pagador debe practicar retencion del ' + PCT_RETENCION_PENSION_COMPENSATORIA + '% ' +
        'si la pension se abona de forma periodica y el receptor no esta exento de tributacion.'
      );
    } else {
      // Receptor
      importeTributable = r(p.importeAnual);
      importeExento = 0;
      pctRetencion = PCT_RETENCION_PENSION_COMPENSATORIA;
      advertencias.push(
        'RENDIMIENTO DEL TRABAJO (LIRPF art. 17.2.f): la pension compensatoria periodica ' +
        'recibida tributa como rendimiento del trabajo en la BASE GENERAL del IRPF ' +
        '(escala progresiva del 19% al 47%). El pagador practicara retencion del ' +
        PCT_RETENCION_PENSION_COMPENSATORIA + '%.'
      );
    }
  } else {
    // compensatoria_capital
    if (p.rol === 'pagador') {
      advertencias.push(
        'PENSION COMPENSATORIA EN CAPITAL (pago unico): NO reduce la base imponible del pagador ' +
        '(diferente de la pension periodica). El pagador no puede aplicar el art. 55 LIRPF. ' +
        'Para el receptor puede tener la consideracion de ganancia patrimonial.'
      );
    } else {
      importeTributable = r(p.importeAnual);
      advertencias.push(
        'PENSION COMPENSATORIA EN CAPITAL: el pago unico puede tributar como ganancia patrimonial ' +
        'en la BASE DEL AHORRO (escala 19%-28%), no como rendimiento del trabajo. ' +
        'Consultar DGT para el caso concreto (depende de si sustituye rentas periodicas o es ' +
        'entrega de bienes).'
      );
    }
  }

  return {
    tipoPension: p.tipoPension,
    rol: p.rol,
    importeAnual: r(p.importeAnual),
    reduccionBaseImponible,
    cuotaSinReglaEspecial,
    cuotaConReglaEspecial,
    ahorroFiscalReglaEspecial,
    importeExento,
    importeTributable,
    pctRetencion,
    advertencias,
    fuenteDatos: 'LIRPF arts. 7.k, 55, 64 — vigente 2025',
  };
}
