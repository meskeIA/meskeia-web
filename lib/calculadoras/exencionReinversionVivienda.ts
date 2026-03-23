/**
 * Calculadora de Exencion por Reinversion en Vivienda Habitual
 * Usada por: MCP server (calcular_exencion_reinversion_vivienda)
 *
 * Calcula la exencion aplicable a la ganancia patrimonial derivada de la
 * transmision de la vivienda habitual cuando el importe se reinvierte en
 * la adquisicion de una nueva vivienda habitual (LIRPF art. 38.1).
 *
 * Marco normativo:
 *   - LIRPF art. 38.1: exencion por reinversion en vivienda habitual
 *   - RIRPF arts. 41-41 bis: desarrollo reglamentario
 *   - Consultas DGT: criterios sobre plazos y condiciones
 *
 * CONDICIONES DE LA EXENCION (LIRPF art. 38.1):
 *   1. La vivienda vendida debe ser la vivienda HABITUAL del contribuyente.
 *      Residencia efectiva y continuada durante al menos 3 anos (salvo causas justificadas).
 *   2. El importe total obtenido en la transmision debe reinvertirse en la
 *      adquisicion de una nueva vivienda habitual.
 *   3. PLAZOS:
 *      a) Compra ANTES de la venta: en los 2 anos anteriores a la transmision
 *      b) Compra DESPUES de la venta: en los 2 anos siguientes a la transmision
 *   4. Si solo se reinvierte PARTE del importe: exencion proporcional.
 *
 * CASOS ESPECIALES:
 *   - Mayores de 65 anos: exencion total de la ganancia sin necesidad de reinvertir
 *     (LIRPF art. 33.4.b) — no aplica esta calculadora, usar calcular_plusvalias_irpf
 *   - Con hipoteca pendiente: el "importe obtenido" se calcula NETO del capital pendiente
 *     si el comprador asume la deuda, o BRUTO si se cancela con el importe recibido
 *   - Construccion vivienda: el plazo de 2 anos se computa desde la firma del contrato,
 *     pero la vivienda debe estar terminada y habitarse en ese plazo (o en 4 anos si hay
 *     obra nueva)
 *
 * CALCULO DE LA EXENCION PROPORCIONAL:
 *   Si se reinvierte menos del 100% del precio de venta:
 *   Ganancia exenta = Ganancia total x (Importe reinvertido / Precio transmision)
 *   Ganancia sujeta = Ganancia total - Ganancia exenta
 *
 * Fuente: LIRPF art. 38.1 + RIRPF arts. 41-41bis - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_plusvalias_irpf, calcular_compraventa_inmueble, calcular_venta_inmueble
 */

// --- Constantes ---

const PCT_REDUCCION_IRREGULAR_GP = 30;   // no aplica directamente pero informativo
const PLAZO_REINVERSION_ANOS = 2;        // anos para reinvertir
const ANOS_RESIDENCIA_MINIMA = 3;        // anos minimos de residencia habitual
const ESCALA_AHORRO_2025: { hasta: number; tipo: number }[] = [
  { hasta: 6_000,   tipo: 19 },
  { hasta: 50_000,  tipo: 21 },
  { hasta: 200_000, tipo: 23 },
  { hasta: 300_000, tipo: 27 },
  { hasta: Infinity, tipo: 28 },
];

// --- Tipos publicos ---

export type SituacionReinversion =
  | 'reinversion_total'         // Se reinvierte el 100% del precio de venta
  | 'reinversion_parcial'       // Se reinvierte solo una parte
  | 'sin_reinversion'           // No hay reinversion (ganancia totalmente sujeta)
  | 'compra_previa_dos_anos';   // La nueva vivienda se compro antes de la venta (< 2 anos)

export interface ParametrosExencionReinversionVivienda {
  /** Precio de transmision de la vivienda habitual (EUR) */
  precioTransmision: number;
  /** Valor de adquisicion de la vivienda habitual vendida (EUR) */
  valorAdquisicion: number;
  /** Gastos de adquisicion (notaria, registro, ITP/AJD...) (EUR) */
  gastosAdquisicion?: number;
  /** Gastos de transmision (notaria, comision agencia, plusvalia municipal...) (EUR) */
  gastosTransmision?: number;
  /** Capital pendiente de hipoteca en el momento de la venta (EUR) */
  hipotecaPendiente?: number;
  /** Situacion respecto a la reinversion */
  situacionReinversion: SituacionReinversion;
  /**
   * Importe reinvertido en la nueva vivienda habitual (EUR)
   * Para reinversion_total o compra_previa_dos_anos: igual al precio de transmision
   * Para reinversion_parcial: el importe efectivamente reinvertido
   */
  importeReinvertido?: number;
  /** ¿Tiene el vendedor mas de 65 anos? (exencion total sin reinversion) */
  mayor65anos?: boolean;
}

export interface ResultadoExencionReinversionVivienda {
  /** Precio de transmision (EUR) */
  precioTransmision: number;
  /** Valor de adquisicion actualizado con gastos (EUR) */
  valorAdquisicionTotal: number;
  /** Ganancia patrimonial bruta (EUR) */
  gananciaBruta: number;
  /** Importe neto a reinvertir (precio transmision neto de hipoteca si aplica) (EUR) */
  importeNetoReinvertible: number;
  /** Importe efectivamente reinvertido (EUR) */
  importeReinvertido: number;
  /** Porcentaje reinvertido sobre el importe obtenido (%) */
  pctReinvertido: number;
  /** Ganancia exenta por reinversion (EUR) */
  gananciaExenta: number;
  /** Ganancia sujeta a IRPF (EUR) */
  gananciaSujeta: number;
  /** Cuota IRPF escala del ahorro sobre ganancia sujeta (EUR) */
  cuotaIRPF: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion auxiliar ---

function calcularCuotaAhorro(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let resto = base;
  let anterior = 0;
  for (const t of ESCALA_AHORRO_2025) {
    const tramo = Math.min(resto, t.hasta - anterior);
    cuota += tramo * t.tipo / 100;
    resto -= tramo;
    anterior = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

// --- Funcion principal ---

export function calcularExencionReinversionVivienda(
  p: ParametrosExencionReinversionVivienda
): ResultadoExencionReinversionVivienda {
  if (p.precioTransmision <= 0) throw new Error('El precio de transmision debe ser mayor que cero.');
  if (p.valorAdquisicion <= 0) throw new Error('El valor de adquisicion debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const gastosAdq = r(p.gastosAdquisicion ?? 0);
  const gastosTransm = r(p.gastosTransmision ?? 0);
  const valorAdquisicionTotal = r(p.valorAdquisicion + gastosAdq);
  const gananciaBruta = r(Math.max(0, p.precioTransmision - gastosTransm - valorAdquisicionTotal));

  // Importe neto disponible para reinvertir
  const hipoteca = r(p.hipotecaPendiente ?? 0);
  const importeNetoReinvertible = r(Math.max(0, p.precioTransmision - hipoteca));

  // Exencion >65 anos
  if (p.mayor65anos) {
    advertencias.push(
      'Contribuyente mayor de 65 anos: la ganancia patrimonial por transmision de cualquier elemento ' +
      'patrimonial esta TOTALMENTE EXENTA si el importe se destina a constituir una renta vitalicia ' +
      'asegurada (hasta 240.000 EUR, LIRPF art. 38.3). Para la vivienda habitual, la ganancia esta ' +
      'exenta directamente sin ninguna condicion de reinversion (LIRPF art. 33.4.b).'
    );
    return {
      precioTransmision: r(p.precioTransmision),
      valorAdquisicionTotal,
      gananciaBruta,
      importeNetoReinvertible,
      importeReinvertido: 0,
      pctReinvertido: 0,
      gananciaExenta: gananciaBruta,
      gananciaSujeta: 0,
      cuotaIRPF: 0,
      advertencias,
      fuenteDatos: 'LIRPF art. 33.4.b (>65 anos) - vigente 2025',
    };
  }

  let importeReinvertido = 0;
  let gananciaExenta = 0;
  let gananciaSujeta = 0;

  switch (p.situacionReinversion) {
    case 'reinversion_total':
    case 'compra_previa_dos_anos':
      importeReinvertido = importeNetoReinvertible;
      gananciaExenta = gananciaBruta;
      gananciaSujeta = 0;
      break;
    case 'reinversion_parcial': {
      importeReinvertido = r(p.importeReinvertido ?? 0);
      if (importeReinvertido >= importeNetoReinvertible) {
        gananciaExenta = gananciaBruta;
        gananciaSujeta = 0;
      } else {
        const pct = importeNetoReinvertible > 0 ? importeReinvertido / importeNetoReinvertible : 0;
        gananciaExenta = r(gananciaBruta * pct);
        gananciaSujeta = r(gananciaBruta - gananciaExenta);
      }
      break;
    }
    case 'sin_reinversion':
    default:
      importeReinvertido = 0;
      gananciaExenta = 0;
      gananciaSujeta = gananciaBruta;
      break;
  }

  const pctReinvertido = importeNetoReinvertible > 0 ? r(importeReinvertido / importeNetoReinvertible * 100) : 0;
  const cuotaIRPF = r(calcularCuotaAhorro(gananciaSujeta));

  // Advertencias
  advertencias.push(
    'Plazo de reinversion: ' + PLAZO_REINVERSION_ANOS + ' anos antes o despues de la venta. ' +
    'Si la compra de la nueva vivienda fue anterior a la venta, el plazo tambien es de 2 anos previos. ' +
    'La vivienda nueva debe ser la residencia habitual efectiva (vivir en ella al menos 12 meses desde la entrega).'
  );
  if (hipoteca > 0) {
    advertencias.push(
      'Hipoteca pendiente (' + hipoteca.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' EUR): ' +
      'el importe a reinvertir para exencion total es el PRECIO DE TRANSMISION menos el capital de hipoteca ' +
      'pendiente, si el comprador asume la deuda hipotecaria. ' +
      'Si se cancela la hipoteca con el dinero de la venta, el importe a reinvertir es el precio bruto total.'
    );
  }
  advertencias.push(
    'Residencia habitual: la vivienda debe haber constituido la residencia habitual durante al menos ' +
    ANOS_RESIDENCIA_MINIMA + ' anos de forma efectiva y continuada, salvo que el cambio se deba a ' +
    'causas justificadas (traslado laboral, matrimonio, separacion, enfermedad...).'
  );
  advertencias.push(
    'Comunicacion a la AEAT: la exencion debe consignarse en la declaracion de IRPF del ano de la venta. ' +
    'Si se reinvierte en anos posteriores, la ganancia exenta se declara igualmente en el ano de la venta ' +
    'y la exencion queda condicionada al cumplimiento del plazo de reinversion.'
  );

  return {
    precioTransmision: r(p.precioTransmision),
    valorAdquisicionTotal,
    gananciaBruta,
    importeNetoReinvertible,
    importeReinvertido,
    pctReinvertido,
    gananciaExenta,
    gananciaSujeta,
    cuotaIRPF,
    advertencias,
    fuenteDatos: 'LIRPF art. 38.1 + RIRPF arts. 41-41bis - vigente 2025',
  };
}
