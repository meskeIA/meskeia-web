/**
 * Calculadora de Retencion e IRPF sobre Dividendos
 * Usada por: MCP server (calcular_retencion_dividendos)
 *
 * Calcula la retencion aplicable a los dividendos y participaciones en
 * beneficios, la tributacion en el IRPF del receptor persona fisica,
 * y la exencion aplicable en el Impuesto sobre Sociedades cuando el
 * receptor es una entidad con participacion significativa.
 *
 * Marco normativo:
 *   - LIRPF art. 25.1.a: dividendos como rendimiento del capital mobiliario
 *   - LIRPF art. 96.4: retencion del 19% sobre dividendos
 *   - LIS art. 21: exencion de dividendos en IS (participacion >= 5%, 1 ano)
 *   - LIRNR art. 14: dividendos de no residentes (tipo general 19%)
 *   - CDI: tipos reducidos segun convenio con el pais de la fuente
 *
 * TRIBUTACION EN IRPF (persona fisica residente):
 *   - Los dividendos tributan como rendimiento del capital mobiliario
 *   - Se integran en la BASE DEL AHORRO (no en la base general)
 *   - Escala del ahorro 2025: 19% / 21% / 23% / 27% / 28%
 *   - Retencion a cuenta: 19% (practica la empresa pagadora)
 *   - Los gastos de administracion y deposito son deducibles
 *
 *   EXENCION 1.500 EUR (DEROGADA):
 *   La exencion de los primeros 1.500 EUR de dividendos quedo derogada
 *   desde 2015 (Ley 26/2014). TODOS los dividendos tributan.
 *
 * TRIBUTACION EN IS (persona juridica receptora):
 *   - EXENCION art. 21: si la participacion es >= 5% (o valor > 20 M EUR)
 *     mantenida durante >= 1 ano: los dividendos estan EXENTOS de IS
 *   - Si no se cumplen los requisitos: tributan al tipo IS (generalmente 25%)
 *   - Retencion: NO se practica retencion si el receptor es una sociedad
 *     con participacion >= 5% (RIS art. 61)
 *
 * DIVIDENDOS DE NO RESIDENTES:
 *   - Tipo general LIRNR: 19%
 *   - Tipos reducidos por CDI (Convenio de Doble Imposicion): generalmente 5-15%
 *     segun el convenio aplicable
 *
 * Fuente: LIRPF art. 25.1 + LIS art. 21 + LIRNR — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_impuesto_sociedades, calcular_plusvalias_irpf
 */

// --- Constantes ---

const PCT_RETENCION_DIVIDENDOS = 19;      // % retencion general IRPF/IRNR
const PCT_PARTICIPACION_EXENCION_IS = 5;  // % participacion minima para exencion IS art. 21
const MESES_TENENCIA_MINIMA_IS = 12;      // Meses de tenencia minima para exencion IS

// Escala base del ahorro 2025
const TRAMOS_AHORRO: { hasta: number; tipo: number }[] = [
  { hasta: 6_000, tipo: 19 },
  { hasta: 50_000, tipo: 21 },
  { hasta: 200_000, tipo: 23 },
  { hasta: 300_000, tipo: 27 },
  { hasta: Infinity, tipo: 28 },
];

// --- Tipos publicos ---

export type TipoReceptorDividendo = 'persona_fisica_residente' | 'sociedad_residente' | 'no_residente';

export interface ParametrosRetencionDividendos {
  tipoReceptor: TipoReceptorDividendo;
  /** Importe bruto del dividendo acordado (EUR) */
  dividendoBruto: number;
  /** Gastos de administracion y deposito (EUR) — solo para PF */
  gastosAdministracion?: number;
  /**
   * Para receptor sociedad: porcentaje de participacion en la entidad pagadora (%)
   * Para determinar si aplica la exencion del art. 21 LIS
   */
  porcentajeParticipacion?: number;
  /**
   * Para receptor sociedad: meses de tenencia de la participacion
   */
  mesesTenencia?: number;
  /**
   * Para no residentes: tipo del CDI aplicable (si existe convenio)
   * Si es null, se aplica el tipo general del 19%
   */
  tipoCDI?: number;
  /** Otros dividendos del ahorro en el ejercicio (para calcular escala acumulada) */
  otrosRdtoAhorroEjercicio?: number;
}

export interface ResultadoRetencionDividendos {
  tipoReceptor: TipoReceptorDividendo;
  dividendoBruto: number;
  gastosDeducibles: number;
  /** Rendimiento neto del capital mobiliario (EUR) */
  rendimientoNeto: number;
  /** Aplica exencion IS art. 21? */
  aplicaExencionIS: boolean;
  motivoNoExencion?: string;
  /** Retencion praticada por la pagadora (EUR) */
  retencionPracticada: number;
  /** Dividendo neto cobrado por el receptor (EUR) */
  dividendoNeto: number;
  /** Cuota IRPF/IS sobre el dividendo (EUR) */
  cuotaImpuesto: number;
  /** Tipo efectivo sobre dividendo bruto (%) */
  tipoEfectivo: number;
  /** Cuota diferencial (cuota - retencion) */
  cuotaDiferencial: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion auxiliar ---

function cuotaAhorro(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let resto = base;
  let ant = 0;
  for (const t of TRAMOS_AHORRO) {
    const tramo = Math.min(resto, t.hasta - ant);
    cuota += tramo * t.tipo / 100;
    resto -= tramo;
    ant = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

// --- Funcion principal ---

export function calcularRetencionDividendos(
  p: ParametrosRetencionDividendos
): ResultadoRetencionDividendos {
  if (p.dividendoBruto <= 0) throw new Error('El dividendo bruto debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const gastosDeducibles = r(p.gastosAdministracion ?? 0);
  const rendimientoNeto = r(p.dividendoBruto - gastosDeducibles);

  let retencionPracticada = 0;
  let cuotaImpuesto = 0;
  let aplicaExencionIS = false;
  let motivoNoExencion: string | undefined;
  let tipoEfectivo = 0;

  if (p.tipoReceptor === 'persona_fisica_residente') {
    retencionPracticada = r(p.dividendoBruto * PCT_RETENCION_DIVIDENDOS / 100);
    // Cuota en escala ahorro (con otros rendimientos del ahorro acumulados)
    const baseAcum = r(rendimientoNeto + (p.otrosRdtoAhorroEjercicio ?? 0));
    const cuotaAcumulada = r(cuotaAhorro(baseAcum));
    const cuotaAnteriores = r(cuotaAhorro(p.otrosRdtoAhorroEjercicio ?? 0));
    cuotaImpuesto = r(cuotaAcumulada - cuotaAnteriores);
    tipoEfectivo = p.dividendoBruto > 0 ? r(cuotaImpuesto / p.dividendoBruto * 100) : 0;

    advertencias.push(
      'EXENCION 1.500 EUR DEROGADA (desde 2015): todos los dividendos tributan. ' +
      'No existe exencion para los primeros euros de dividendos en IRPF.'
    );
    advertencias.push(
      'La retencion del ' + PCT_RETENCION_DIVIDENDOS + '% la practica la sociedad pagadora. ' +
      'Los dividendos se integran en la base del ahorro junto con otras rentas del capital mobiliario. ' +
      'La escala progresiva (19%-28%) puede superar la retencion si la base del ahorro es alta.'
    );
  } else if (p.tipoReceptor === 'sociedad_residente') {
    const pctPart = p.porcentajeParticipacion ?? 0;
    const mesesTen = p.mesesTenencia ?? 0;
    aplicaExencionIS = pctPart >= PCT_PARTICIPACION_EXENCION_IS && mesesTen >= MESES_TENENCIA_MINIMA_IS;

    if (!aplicaExencionIS) {
      if (pctPart < PCT_PARTICIPACION_EXENCION_IS) {
        motivoNoExencion = 'Participacion inferior al ' + PCT_PARTICIPACION_EXENCION_IS + '% (' + pctPart + '%).';
      } else {
        motivoNoExencion = 'Tenencia inferior a ' + MESES_TENENCIA_MINIMA_IS + ' meses (' + mesesTen + ' meses).';
      }
      cuotaImpuesto = r(rendimientoNeto * 25 / 100); // Tipo general IS
      tipoEfectivo = p.dividendoBruto > 0 ? r(cuotaImpuesto / p.dividendoBruto * 100) : 0;
    }

    // Retencion: NO se retiene si participacion >= 25% (RIS art. 61.1.a)
    if (pctPart >= 25) {
      retencionPracticada = 0;
      advertencias.push(
        'NO SE PRACTICA RETENCION: la participacion del ' + pctPart + '% supera el 25%, ' +
        'por lo que la sociedad pagadora no practica retencion (RIS art. 61.1.a).'
      );
    } else {
      retencionPracticada = r(p.dividendoBruto * PCT_RETENCION_DIVIDENDOS / 100);
    }

    if (aplicaExencionIS) {
      advertencias.push(
        'EXENCION IS ART. 21: los dividendos estan EXENTOS de IS al cumplirse: ' +
        'participacion >= ' + PCT_PARTICIPACION_EXENCION_IS + '% (' + pctPart + '%) ' +
        'y tenencia >= ' + MESES_TENENCIA_MINIMA_IS + ' meses (' + mesesTen + ' meses).'
      );
    } else {
      advertencias.push('Los dividendos NO estan exentos de IS: ' + (motivoNoExencion ?? ''));
    }
  } else {
    // No residente
    const tipoCDI = p.tipoCDI;
    const tipoAplicable = tipoCDI !== undefined ? tipoCDI : PCT_RETENCION_DIVIDENDOS;
    retencionPracticada = r(p.dividendoBruto * tipoAplicable / 100);
    cuotaImpuesto = retencionPracticada;
    tipoEfectivo = tipoAplicable;

    advertencias.push(
      'IRNR (no residente): tipo de retencion aplicado ' + tipoAplicable + '%' +
      (tipoCDI !== undefined ? ' (tipo CDI aplicable)' : ' (tipo general IRNR — sin CDI)') + '. ' +
      'El CDI puede reducir el tipo a 5-15% segun el convenio con el pais de residencia del receptor.'
    );
  }

  const dividendoNeto = r(p.dividendoBruto - retencionPracticada);
  const cuotaDiferencial = r(cuotaImpuesto - retencionPracticada);

  return {
    tipoReceptor: p.tipoReceptor,
    dividendoBruto: r(p.dividendoBruto),
    gastosDeducibles,
    rendimientoNeto,
    aplicaExencionIS,
    motivoNoExencion,
    retencionPracticada,
    dividendoNeto,
    cuotaImpuesto: aplicaExencionIS ? 0 : cuotaImpuesto,
    tipoEfectivo: aplicaExencionIS ? 0 : tipoEfectivo,
    cuotaDiferencial: aplicaExencionIS ? r(-retencionPracticada) : cuotaDiferencial,
    advertencias,
    fuenteDatos: 'LIRPF art. 25.1 + LIS art. 21 + LIRNR — vigente 2025',
  };
}
