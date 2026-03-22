/**
 * Calculadora de Deducciones Autonómicas por Vivienda Habitual — lógica pura
 * Usada por: MCP server (calcular_deduccion_vivienda_ccaa)
 *
 * Calcula las deducciones autonómicas aplicables en la cuota íntegra autonómica
 * del IRPF por inversión en vivienda habitual, complementarias o independientes
 * del régimen estatal transitorio.
 *
 * CONTEXTO:
 *   A) Régimen estatal transitorio (DA 18.ª LIRPF):
 *      Para viviendas adquiridas antes del 01/01/2013 que ya hubieran generado
 *      derecho a deducción, se mantiene la deducción estatal del 7,5% sobre la
 *      base máxima anual de 9.040 €, hasta un máximo anual de 678 € estatales
 *      (7,5% × 9.040 €). La parte autonómica (7,5%) depende de cada CCAA.
 *
 *   B) Deducciones autonómicas actuales (post-2013):
 *      Las CCAA pueden establecer sus propias deducciones en la cuota autonómica,
 *      independientes del régimen transitorio. Las más habituales:
 *      - Para jóvenes compradores (≤35 años)
 *      - Para rehabilitación de vivienda habitual
 *      - Para VPO (Vivienda de Protección Oficial)
 *      - Para familia numerosa
 *      - Para zonas rurales en riesgo de despoblación
 *
 * Esta calculadora cubre AMBOS regímenes.
 *
 * Fuente: DA 18.ª LIRPF + normativas autonómicas vigentes — verificado 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_itp_ccaa, calcular_hipoteca
 */

// ─── Constantes régimen estatal transitorio ───────────────────────────────

const BASE_MAXIMA_DEDUCCION_TRANSITORIA = 9040;   // €/año (estatal + autonómico)
const PCT_ESTATAL_TRANSITORIO = 7.5;               // % cuota estatal
const PCT_AUTONOMICO_TRANSITORIO_DEFAULT = 7.5;    // % cuota autonómica (varía por CCAA)
const DEDUCCION_ESTATAL_MAX_TRANSITORIA = BASE_MAXIMA_DEDUCCION_TRANSITORIA * PCT_ESTATAL_TRANSITORIO / 100; // 678 €

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type ComunidadAutonomaVivienda =
  | 'andalucia' | 'aragon' | 'asturias' | 'baleares' | 'canarias' | 'cantabria'
  | 'castilla_la_mancha' | 'castilla_leon' | 'cataluna' | 'extremadura' | 'galicia'
  | 'la_rioja' | 'madrid' | 'murcia' | 'navarra' | 'pais_vasco' | 'valencia';

export type TipoDeduccionViviendaCCAA =
  | 'transitorio_pre2013'     // Régimen transitorio compras antes del 01/01/2013
  | 'joven'                   // Deducción autonómica para compradores jóvenes
  | 'rehabilitacion'          // Rehabilitación de vivienda habitual
  | 'alquiler_joven'          // Deducción por alquiler para jóvenes
  | 'zona_rural';             // Zona rural o municipio en despoblación

export interface ParametrosDeduccionViviendaCCAA {
  /** Comunidad Autónoma */
  comunidadAutonoma: ComunidadAutonomaVivienda;
  /** Tipo de deducción a calcular */
  tipoDeduccion: TipoDeduccionViviendaCCAA;
  /**
   * Cantidades invertidas en el año (amortización capital + intereses hipoteca +
   * seguros vinculados + gastos asociados a la adquisición) (€/año).
   * Necesario para régimen transitorio.
   */
  inversionAnual?: number;
  /** Edad del contribuyente (para deducciones de jóvenes) */
  edadContribuyente?: number;
  /**
   * Base imponible total del contribuyente (€) — para verificar límites de renta.
   * Muchas deducciones autonómicas están condicionadas a renta máxima.
   */
  baseImponibleTotal?: number;
  /** Cuota íntegra autonómica previa (€) — para verificar que la deducción no supere la cuota */
  cuotaIntegra?: number;
}

interface InfoDeduccionCCAA {
  nombre: string;
  pctDeduccion: number;
  baseMaxima: number;
  deduccionMaxima: number;
  limiteEdad?: number;
  limiteRenta?: number;       // Renta máxima para poder aplicarla (base imponible)
  disponible: boolean;
  notas: string;
}

// ─── Tabla de deducciones autonómicas principales 2025 ──────────────────────

function obtenerInfoDeduccion(
  ccaa: ComunidadAutonomaVivienda,
  tipo: TipoDeduccionViviendaCCAA
): InfoDeduccionCCAA {
  // Régimen transitorio: la parte autonómica varía por CCAA
  // La mayoría mantienen el 7,5% autonómico complementando el 7,5% estatal
  if (tipo === 'transitorio_pre2013') {
    const tablaPctAuto: Partial<Record<ComunidadAutonomaVivienda, number>> = {
      andalucia: 7.5, aragon: 7.5, asturias: 7.5, baleares: 7.5, canarias: 6.25,
      cantabria: 7.5, castilla_la_mancha: 7.5, castilla_leon: 7.5, cataluna: 9,
      extremadura: 7.5, galicia: 7.5, la_rioja: 7.5, madrid: 7.5, murcia: 7.5,
      navarra: 7, pais_vasco: 11, valencia: 7.5,
    };
    const pct = tablaPctAuto[ccaa] ?? 7.5;
    const maxAuto = BASE_MAXIMA_DEDUCCION_TRANSITORIA * pct / 100;
    return {
      nombre: 'Régimen transitorio (compra antes del 01/01/2013) — parte autonómica',
      pctDeduccion: pct,
      baseMaxima: BASE_MAXIMA_DEDUCCION_TRANSITORIA,
      deduccionMaxima: maxAuto,
      disponible: true,
      notas: `Complementa la deducción estatal del ${PCT_ESTATAL_TRANSITORIO}%. Solo si el contribuyente ya aplicó la deducción en 2012 o anteriores y cumplía los requisitos. Base máxima: 9.040 €/año (compartida con la cuota estatal).`,
    };
  }

  // Deducciones autonómicas actuales (post-2013)
  switch (ccaa) {
    case 'andalucia':
      if (tipo === 'joven') return {
        nombre: 'Deducción autonómica Andalucía — jóvenes ≤35 años',
        pctDeduccion: 2, baseMaxima: 9040, deduccionMaxima: 180.8,
        limiteEdad: 35, limiteRenta: 19000,
        disponible: true,
        notas: 'Deducción del 2% de las cantidades invertidas en vivienda habitual por jóvenes ≤35 años, con renta ≤19.000 € (individual) o ≤24.000 € (conjunta). Requiere vivienda en municipio ≤100.000 habitantes.',
      };
      break;

    case 'cataluna':
      if (tipo === 'joven') return {
        nombre: 'Deducción Cataluña — jóvenes ≤32 años',
        pctDeduccion: 7.5, baseMaxima: 9040, deduccionMaxima: 678,
        limiteEdad: 32, limiteRenta: 30000,
        disponible: true,
        notas: 'El 7,5% autonómico sobre base máx. 9.040 €. Requisito: edad ≤32 años y base imponible ≤30.000 €. Solo para primer acceso. La CCAA puede reconocer el 9% autonómico en algunas circunstancias.',
      };
      break;

    case 'madrid':
      if (tipo === 'joven' || tipo === 'rehabilitacion') return {
        nombre: 'Deducción autonómica Madrid (no disponible)',
        pctDeduccion: 0, baseMaxima: 0, deduccionMaxima: 0,
        disponible: false,
        notas: 'La Comunidad de Madrid eliminó la deducción autonómica propia por vivienda habitual. Solo se mantiene el régimen transitorio para compras anteriores a 2013.',
      };
      break;

    case 'pais_vasco':
      return {
        nombre: 'Deducción País Vasco (régimen foral)',
        pctDeduccion: 18, baseMaxima: 20000, deduccionMaxima: 3600,
        limiteRenta: 30000,
        disponible: true,
        notas: 'Régimen foral propio: 18% sobre base máx. 20.000 €/año (deducción máx. 3.600 €). No aplica el régimen estatal transitorio (régimen foral independiente). Verificar con Hacienda Foral (Álava, Gipuzkoa o Bizkaia).',
      };

    case 'navarra':
      return {
        nombre: 'Deducción Navarra (régimen foral)',
        pctDeduccion: 15, baseMaxima: 7000, deduccionMaxima: 1050,
        disponible: true,
        notas: 'Régimen foral navarro: 15% sobre base máx. 7.000 €/año. No aplica el régimen estatal transitorio. Verificar con Hacienda Foral de Navarra.',
      };

    case 'valencia':
      if (tipo === 'joven') return {
        nombre: 'Deducción autonómica Valencia — jóvenes ≤35 años',
        pctDeduccion: 5, baseMaxima: 9040, deduccionMaxima: 452,
        limiteEdad: 35, limiteRenta: 25000,
        disponible: true,
        notas: '5% sobre cantidades invertidas para jóvenes ≤35 años con renta ≤25.000 € (individual) o ≤40.000 € (conjunta). Solo si es primera vivienda habitual.',
      };
      break;

    case 'galicia':
      if (tipo === 'rehabilitacion') return {
        nombre: 'Deducción Galicia — rehabilitación vivienda habitual',
        pctDeduccion: 7.5, baseMaxima: 9040, deduccionMaxima: 678,
        disponible: true,
        notas: 'El 7,5% autonómico para rehabilitación de vivienda habitual. Galicia no tiene deducción autonómica propia para compra (solo rehabilitación y el régimen transitorio pre-2013).',
      };
      break;

    case 'castilla_leon':
      if (tipo === 'joven' || tipo === 'zona_rural') return {
        nombre: 'Deducción Castilla y León — jóvenes y zonas rurales',
        pctDeduccion: 7.5, baseMaxima: 9040, deduccionMaxima: 678,
        limiteEdad: 36, limiteRenta: 18900,
        disponible: true,
        notas: 'El 7,5% autonómico para jóvenes ≤35 años con renta ≤18.900 €. Puede ampliar a 15% en zonas rurales o municipios ≤10.000 habitantes (verificar con la AEAT de Castilla y León).',
      };
      break;

    case 'canarias':
      if (tipo === 'joven') return {
        nombre: 'Deducción Canarias — primera vivienda jóvenes',
        pctDeduccion: 3, baseMaxima: 9040, deduccionMaxima: 271.2,
        limiteEdad: 35, limiteRenta: 24000,
        disponible: true,
        notas: '3% autonómico para primera adquisición por jóvenes ≤35 años. Renta máxima: 24.000 € individual / 36.000 € conjunta.',
      };
      break;
  }

  // Default: deducción autonómica general (7,5%)
  return {
    nombre: `Deducción autonómica ${ccaa} — ${tipo}`,
    pctDeduccion: PCT_AUTONOMICO_TRANSITORIO_DEFAULT,
    baseMaxima: BASE_MAXIMA_DEDUCCION_TRANSITORIA,
    deduccionMaxima: DEDUCCION_ESTATAL_MAX_TRANSITORIA,
    disponible: false,
    notas: `Datos específicos para esta CCAA y tipo de deducción no disponibles en esta versión. Consultar con la Agencia Tributaria autonómica correspondiente o la AEAT.`,
  };
}

// ─── Interfaz resultado ────────────────────────────────────────────────────

export interface ResultadoDeduccionViviendaCCAA {
  /** Comunidad Autónoma */
  comunidadAutonoma: ComunidadAutonomaVivienda;
  /** Tipo de deducción calculada */
  tipoDeduccion: TipoDeduccionViviendaCCAA;
  /** Nombre descriptivo de la deducción */
  nombreDeduccion: string;
  /** ¿Está disponible esta deducción en esta CCAA? */
  disponible: boolean;
  /** Porcentaje de deducción (%) */
  pctDeduccion: number;
  /** Base máxima de la deducción (€) */
  baseMaxima: number;
  /** Base de deducción aplicada (mínimo entre inversión y base máxima) (€) */
  baseAplicada: number;
  /** **Deducción autonómica calculada (€)** */
  deduccionAutonomica: number;
  /** Deducción estatal transitoria (€) — solo para tipo transitorio_pre2013 */
  deduccionEstatalTransitoria: number;
  /** **Deducción total IRPF (estatal + autonómica) (€)** */
  deduccionTotal: number;
  /** Notas sobre la deducción */
  notas: string;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularDeduccionViviendaCCAA(
  p: ParametrosDeduccionViviendaCCAA
): ResultadoDeduccionViviendaCCAA {
  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const info = obtenerInfoDeduccion(p.comunidadAutonoma, p.tipoDeduccion);
  const inversion = p.inversionAnual ?? 0;

  const baseAplicada = info.disponible ? r(Math.min(inversion, info.baseMaxima)) : 0;
  const deduccionAutonomica = info.disponible ? r(baseAplicada * info.pctDeduccion / 100) : 0;

  // Deducción estatal (solo régimen transitorio)
  const deduccionEstatalTransitoria = (p.tipoDeduccion === 'transitorio_pre2013' && info.disponible)
    ? r(baseAplicada * PCT_ESTATAL_TRANSITORIO / 100)
    : 0;

  const deduccionTotal = r(deduccionAutonomica + deduccionEstatalTransitoria);

  // Verificar límites de renta
  if (info.limiteRenta && p.baseImponibleTotal && p.baseImponibleTotal > info.limiteRenta) {
    advertencias.push(`Su base imponible (${p.baseImponibleTotal.toLocaleString('es-ES')} €) supera el límite de renta de esta deducción (${info.limiteRenta.toLocaleString('es-ES')} €). No podría aplicarse.`);
  }

  // Verificar límite de edad
  if (info.limiteEdad && p.edadContribuyente && p.edadContribuyente > info.limiteEdad) {
    advertencias.push(`Su edad (${p.edadContribuyente} años) supera el límite de esta deducción (≤${info.limiteEdad} años). No podría aplicarse.`);
  }

  // Advertencia régimen transitorio
  if (p.tipoDeduccion === 'transitorio_pre2013') {
    advertencias.push('Régimen transitorio: solo aplicable si se adquirió la vivienda ANTES del 01/01/2013 y se había ya aplicado la deducción en algún ejercicio anterior. Si compró antes de 2013 pero nunca declaró la deducción, no puede empezar a aplicarla ahora.');
    advertencias.push(`Deducción estatal (${PCT_ESTATAL_TRANSITORIO}%): ${deduccionEstatalTransitoria.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € + deducción autonómica (${info.pctDeduccion}%): ${deduccionAutonomica.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € = ${deduccionTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € total.`);
  }

  if (!info.disponible) {
    advertencias.push(`Esta deducción no está disponible en ${p.comunidadAutonoma} para el tipo seleccionado. ${info.notas}`);
  }

  advertencias.push('Verificar siempre con la normativa actualizada de la CCAA, ya que los tipos y límites pueden modificarse anualmente por ley de presupuestos autonómica.');

  return {
    comunidadAutonoma: p.comunidadAutonoma,
    tipoDeduccion: p.tipoDeduccion,
    nombreDeduccion: info.nombre,
    disponible: info.disponible,
    pctDeduccion: info.pctDeduccion,
    baseMaxima: info.baseMaxima,
    baseAplicada,
    deduccionAutonomica,
    deduccionEstatalTransitoria,
    deduccionTotal,
    notas: info.notas,
    advertencias,
    fuenteDatos: 'DA 18.ª LIRPF (régimen transitorio) + Normativas autonómicas — vigente 2025',
  };
}
