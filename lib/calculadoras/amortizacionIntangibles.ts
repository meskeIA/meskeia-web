/**
 * Calculadora de Amortizacion Fiscal de Activos Intangibles en IS
 * Usada por: MCP server (calcular_amortizacion_intangibles)
 *
 * Calcula la amortizacion fiscal deducible de activos intangibles en el
 * Impuesto sobre Sociedades, incluyendo el fondo de comercio, la propiedad
 * intelectual, las marcas, las patentes y otros activos inmateriales.
 *
 * Marco normativo:
 *   - LIS art. 12.2: amortizacion del inmovilizado intangible
 *   - LIS art. 12.3: amortizacion del fondo de comercio (derogado limite 1% — TRLIS)
 *   - LIS art. 13.3: libertad de amortizacion para ciertos intangibles
 *   - NIC 38 (NIIF) y Plan General Contable (PGC): normas contables de referencia
 *   - Resolucion ICAC 28/05/2013: vida util de los activos intangibles
 *   - Ley 27/2014 (LIS vigente): consolidacion del marco fiscal de intangibles
 *
 * REGIMEN VIGENTE (desde 2016 — Ley 27/2014):
 *
 *   A) INMOVILIZADO INTANGIBLE CON VIDA UTIL DEFINIDA:
 *      Fiscal = contable (segun vida util estimada)
 *      Maximo fiscal: cuota contable (sin acelerador especial, salvo libertad amortizacion)
 *
 *   B) INMOVILIZADO INTANGIBLE CON VIDA UTIL INDEFINIDA (incluyendo marcas):
 *      Amortizacion fiscal: 1/10 del valor (10% anual = maximo 10 anos)
 *      Independientemente de si contablemente no se amortiza (NIC 38 de vida indefinida)
 *
 *   C) FONDO DE COMERCIO:
 *      Fiscal: 1/20 del valor (5% anual = 20 anos)
 *      Contable: tambien 1/10 segun PGC 2007 reformado (Resolucion ICAC 2013)
 *      El fondo de comercio generado internamente NO es activable ni amortizable.
 *      Solo aplica al adquirido en operaciones onerosas.
 *
 *   D) PROPIEDAD INDUSTRIAL (patentes, disenos, modelos):
 *      Segun vida util del derecho (plazo de la patente = generalmente 20 anos)
 *      Tipo maximo: 2 tablas del RIVA — ver Reglamento IS
 *
 *   NOTA sobre fondo de comercio adquirido en operaciones intragrupo:
 *      NO es amortizable fiscalmente (solo el de terceros).
 *
 * Fuente: LIS art. 12 + RIS tablas amortizacion — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_deduccion_idi
 */

// --- Constantes ---

const PCT_AMORTIZACION_FONDO_COMERCIO = 5;         // % anual maximo (20 anos)
const PCT_AMORTIZACION_INDEFINIDA = 10;            // % anual maximo vida util indefinida (10 anos)

// --- Tipos publicos ---

export type TipoActivoIntangible =
  | 'fondo_comercio'             // Adquirido en operacion onerosa — 5% max (20 anos)
  | 'vida_util_indefinida'       // Marcas, nombres comerciales con vida indefinida — 10% max
  | 'vida_util_definida'         // Patentes, concesiones, software con plazo determinado
  | 'propiedad_intelectual'      // Derechos autor, software original — segun vida util
  | 'concesion_administrativa';  // Concesiones admin. — vida util = plazo concesion

export interface ParametrosAmortizacionIntangibles {
  tipoActivo: TipoActivoIntangible;
  /** Valor de adquisicion del activo intangible (EUR) */
  valorAdquisicion: number;
  /**
   * Vida util estimada (anos)
   * Para fondo_comercio y vida_util_indefinida: se ignora (se usa el maximo legal)
   * Para el resto: obligatorio para calcular la cuota anual
   */
  vidaUtilAnios?: number;
  /**
   * Amortizacion contable registrada en el ejercicio (EUR)
   * Si se proporciona, se verifica si el gasto fiscal es deducible
   */
  amortizacionContableEjercicio?: number;
  /** Numero de anos transcurridos desde la adquisicion (para calcular valor neto) */
  anosTranscurridos?: number;
}

export interface ResultadoAmortizacionIntangibles {
  tipoActivo: TipoActivoIntangible;
  valorAdquisicion: number;
  /** Vida util fiscal aplicada (anos) */
  vidaUtilFiscalAnios: number;
  /** Cuota anual de amortizacion fiscal maxima deducible (EUR/ano) */
  cuotaAnualFiscal: number;
  /** Cuota anual en porcentaje sobre el valor de adquisicion (%) */
  pctAmortizacion: number;
  /** Amortizacion contable declarada en el ejercicio (EUR) */
  amortizacionContableEjercicio: number;
  /** Es la amortizacion contable deducible fiscalmente? */
  amortizacionContableDeducible: boolean;
  /** Ajuste extracontable necesario (positivo = menos gasto fiscal) */
  ajusteExtracontable: number;
  /** Valor neto fiscal tras anos transcurridos (EUR) */
  valorNetoFiscal: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularAmortizacionIntangibles(
  p: ParametrosAmortizacionIntangibles
): ResultadoAmortizacionIntangibles {
  if (p.valorAdquisicion <= 0) throw new Error('El valor de adquisicion debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  let vidaUtilFiscalAnios: number;
  let pctAmortizacion: number;

  switch (p.tipoActivo) {
    case 'fondo_comercio':
      vidaUtilFiscalAnios = 20;
      pctAmortizacion = PCT_AMORTIZACION_FONDO_COMERCIO;
      advertencias.push(
        'FONDO DE COMERCIO (LIS art. 12.2): amortizable al maximo del 5% anual (20 anos), ' +
        'exclusivamente si fue adquirido en una operacion onerosa a terceros. ' +
        'El fondo de comercio generado internamente NO es activable ni amortizable.'
      );
      advertencias.push(
        'ATENCIÓN: el fondo de comercio surgido en operaciones entre empresas del grupo ' +
        '(fusiones, adquisiciones intragrupo) NO es fiscalmente amortizable. ' +
        'El ajuste extracontable positivo sera igual a la amortizacion contable registrada.'
      );
      break;
    case 'vida_util_indefinida':
      vidaUtilFiscalAnios = 10;
      pctAmortizacion = PCT_AMORTIZACION_INDEFINIDA;
      advertencias.push(
        'INTANGIBLE CON VIDA UTIL INDEFINIDA (LIS art. 12.2): la ley permite amortizar ' +
        'hasta un 10% anual (10 anos) aunque contablemente no se amortice (NIC 38 / PGC). ' +
        'Esto genera una diferencia temporaria positiva con Hacienda: el gasto fiscal es mayor ' +
        'que el contable en los anos de amortizacion y se revierte al final de la vida util.'
      );
      break;
    case 'propiedad_intelectual':
    case 'concesion_administrativa':
    case 'vida_util_definida': {
      if (!p.vidaUtilAnios || p.vidaUtilAnios <= 0) {
        throw new Error(
          'Para activos intangibles con vida util definida, debe indicar la vida util estimada en anos.'
        );
      }
      vidaUtilFiscalAnios = p.vidaUtilAnios;
      pctAmortizacion = r(100 / vidaUtilFiscalAnios);
      if (p.tipoActivo === 'propiedad_intelectual') {
        advertencias.push(
          'PROPIEDAD INTELECTUAL / SOFTWARE: la vida util fiscal debe ser la estimada segun ' +
          'la obsolescencia tecnologica o el plazo de explotacion. Para el software de uso ' +
          'general se aceptan 3-5 anos. Para software especifico, la vida util real del proyecto.'
        );
      }
      if (p.tipoActivo === 'concesion_administrativa') {
        advertencias.push(
          'CONCESION ADMINISTRATIVA: la vida util fiscal coincide con el plazo de la concesion. ' +
          'Al terminar la concesion, el intangible se amortiza totalmente y no tiene valor residual ' +
          '(salvo condiciones especiales del contrato).'
        );
      }
      break;
    }
  }

  const cuotaAnualFiscal = r(p.valorAdquisicion * pctAmortizacion / 100);

  // Comparar con amortizacion contable
  const amortContable = r(p.amortizacionContableEjercicio ?? cuotaAnualFiscal);
  let amortizacionContableDeducible = true;
  let ajusteExtracontable = 0;

  if (amortContable > cuotaAnualFiscal) {
    amortizacionContableDeducible = false;
    ajusteExtracontable = r(amortContable - cuotaAnualFiscal);
    advertencias.push(
      'AJUSTE EXTRACONTABLE POSITIVO: la amortizacion contable (' + amortContable.toLocaleString('es-ES') + ' EUR) ' +
      'supera el maximo fiscal deducible (' + cuotaAnualFiscal.toLocaleString('es-ES') + ' EUR). ' +
      'Se debe realizar un ajuste positivo de ' + ajusteExtracontable.toLocaleString('es-ES') + ' EUR ' +
      'en la liquidacion del IS (diferencia temporaria deducible — se revertira en ejercicios futuros).'
    );
  }

  // Valor neto fiscal
  const anosTransc = p.anosTranscurridos ?? 0;
  const amortAcumuladaFiscal = r(Math.min(p.valorAdquisicion, cuotaAnualFiscal * anosTransc));
  const valorNetoFiscal = r(Math.max(0, p.valorAdquisicion - amortAcumuladaFiscal));

  advertencias.push(
    'La tabla de amortizacion del RIS fija tipos maximos y minimos por categoria. ' +
    'Si la amortizacion contable es inferior al maximo fiscal, el gasto contable es el deducible ' +
    '(principio de inscripcion contable — art. 11.3 LIS).'
  );

  return {
    tipoActivo: p.tipoActivo,
    valorAdquisicion: r(p.valorAdquisicion),
    vidaUtilFiscalAnios,
    cuotaAnualFiscal,
    pctAmortizacion,
    amortizacionContableEjercicio: amortContable,
    amortizacionContableDeducible,
    ajusteExtracontable,
    valorNetoFiscal,
    advertencias,
    fuenteDatos: 'LIS art. 12 + RIS tablas amortizacion — vigente 2025',
  };
}
