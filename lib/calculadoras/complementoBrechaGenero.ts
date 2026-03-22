/**
 * Calculadora de Complemento para la Reducción de la Brecha de Género — lógica pura
 * Usada por: MCP server (calcular_complemento_brecha_genero)
 *
 * Calcula el complemento de pensión por hijos/as para la reducción de la brecha
 * de género (antiguo "complemento de maternidad"), regulado por el RDL 3/2021
 * (Sentencia TJUE C-450/18) y el RD 364/2021.
 *
 * Contexto histórico:
 *   - Antes de RDL 3/2021: "complemento de maternidad" solo para mujeres.
 *   - TJUE (C-450/18, 12/12/2019): el complemento solo para mujeres es contrario
 *     a la Directiva 79/7/CEE de igualdad.
 *   - RDL 3/2021 (26/01/2021): crea el nuevo "complemento para la reducción de la
 *     brecha de género" accesible a hombres y mujeres bajo condiciones distintas.
 *
 * Requisitos y cuantía (LGSS art. 60, desde 04/02/2021):
 *
 * MUJERES:
 *   - Haber tenido 2 o más hijos/as
 *   - Ser beneficiaria de pensión de jubilación, viudedad o IP con inicio ≥ 04/02/2021
 *   - Que haya una brecha entre la pensión propia y la del exCónyuge/cónyuge ≥ 15%
 *     (solo aplica la condición de brecha para las nuevas altas, no para pensiones
 *     causadas antes de 04/02/2021 que siguen con las antiguas reglas)
 *   - Para pensiones causadas ANTES de 04/02/2021: las mujeres con ≥ 2 hijos que
 *     cobren pensión contributiva de jubilación, IP o viudedad siguen cobrando el
 *     complemento de maternidad (régimen transitorio)
 *
 * HOMBRES:
 *   - Haber tenido 2 o más hijos/as
 *   - La pensión de viudedad o jubilación/IP debe ser inferior a la de la madre
 *     de los hijos (prueba de brecha de género ≥ 15%)
 *   - Solo si la madre no percibe el complemento o lo pierde
 *
 * Cuantía por hijo (2025):
 *   - 378 €/año por cada hijo (≥ 2), es decir, 27 €/mes (14 pagas)
 *   - Límite: la cuantía del complemento no puede exceder el 50% de la pensión base
 *
 * Nota: Las cuantías se actualizan anualmente con el IPC.
 *
 * Fuente: LGSS art. 60 (redacción RDL 3/2021) + RD 364/2021 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_pension_publica, calcular_pension_viudedad, calcular_jubilacion_anticipada
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────────

const COMPLEMENTO_POR_HIJO_ANUAL_2025 = 378;  // €/año por hijo (≥ 2)
const COMPLEMENTO_POR_HIJO_MENSUAL_2025 = 27; // €/mes (14 pagas)
const MINIMO_HIJOS_PARA_COMPLEMENTO = 2;
const PCT_LIMITE_SOBRE_PENSION = 50;           // % máximo del complemento sobre la pensión base
const PCT_BRECHA_MINIMA_HOMBRES = 15;          // % mínimo de brecha de pensión para hombres

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SexoBeneficiario = 'mujer' | 'hombre';
export type TipoPensionBG = 'jubilacion' | 'incapacidad_permanente' | 'viudedad';
export type RegimenTransitorio = 'antes_04_02_2021' | 'desde_04_02_2021';

export interface ParametrosComplementoBrechaGenero {
  /** Sexo del beneficiario */
  sexo: SexoBeneficiario;
  /** Número de hijos/as */
  numHijos: number;
  /** Tipo de pensión que se percibe */
  tipoPension: TipoPensionBG;
  /** Cuantía mensual de la pensión base del beneficiario (€/mes) */
  cuantiaPensionBeneficiario: number;
  /** ¿La pensión se causó antes del 04/02/2021? (afecta al régimen aplicable) */
  pensionAntesDe2021?: boolean;
  /**
   * Para hombres: cuantía mensual de la pensión de la madre de los hijos (€/mes).
   * Necesaria para verificar la condición de brecha.
   */
  cuantiaPensionMadre?: number;
  /**
   * Para hombres: ¿La madre percibe el complemento?
   * Si la madre ya cobra el complemento, el hombre no puede acceder.
   */
  madrePcibeComplemento?: boolean;
}

export interface ResultadoComplementoBrechaGenero {
  /** Sexo del beneficiario */
  sexo: SexoBeneficiario;
  /** Número de hijos */
  numHijos: number;
  /** Tipo de pensión */
  tipoPension: TipoPensionBG;
  /** ¿Cumple el requisito mínimo de hijos? */
  cumpleRequisitosHijos: boolean;
  /** ¿Cumple el requisito de brecha de género (solo hombres)? */
  cumpleRequisitoBrechaHombres?: boolean;
  /** Brecha porcentual calculada (solo hombres) (%) */
  brechaCalculadaPct?: number;
  /** ¿Puede acceder al complemento? */
  tieneDerechoComplemento: boolean;
  /** Motivo de no acceso (si aplica) */
  motivoSinDerecho?: string;
  /** Complemento por hijo anual (€) */
  complementoPorHijoAnual: number;
  /** Complemento calculado antes de aplicar el límite (€/mes) */
  complementoBrutoMensual: number;
  /** Límite máximo del complemento (50% de la pensión base) (€/mes) */
  limiteMaximoComplemento: number;
  /** **Complemento efectivo mensual (€/mes)** */
  complementoEfectivoMensual: number;
  /** Complemento efectivo anual (14 pagas) (€/año) */
  complementoEfectivoAnual: number;
  /** Pensión total mensual con complemento (€/mes) */
  pensionTotalMensual: number;
  /** Régimen aplicable */
  regimenAplicable: RegimenTransitorio;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularComplementoBrechaGenero(p: ParametrosComplementoBrechaGenero): ResultadoComplementoBrechaGenero {
  if (p.numHijos < 0) throw new Error('El número de hijos no puede ser negativo.');
  if (p.cuantiaPensionBeneficiario <= 0) throw new Error('La cuantía de la pensión debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const cumpleRequisitosHijos = p.numHijos >= MINIMO_HIJOS_PARA_COMPLEMENTO;
  const pensionAntesDe2021 = p.pensionAntesDe2021 ?? false;
  const regimenAplicable: RegimenTransitorio = pensionAntesDe2021 ? 'antes_04_02_2021' : 'desde_04_02_2021';
  const advertencias: string[] = [];

  let tieneDerechoComplemento = true;
  let motivoSinDerecho: string | undefined;
  let cumpleRequisitoBrechaHombres: boolean | undefined;
  let brechaCalculadaPct: number | undefined;

  if (!cumpleRequisitosHijos) {
    tieneDerechoComplemento = false;
    motivoSinDerecho = `Se requieren mínimo ${MINIMO_HIJOS_PARA_COMPLEMENTO} hijos/as (tiene ${p.numHijos}).`;
  } else if (p.sexo === 'hombre') {
    // Hombres: condición de brecha
    if (p.madrePcibeComplemento) {
      tieneDerechoComplemento = false;
      motivoSinDerecho = 'La madre de los hijos ya percibe el complemento. El hombre no puede acceder simultáneamente.';
    } else if (p.cuantiaPensionMadre !== undefined) {
      const cuantiaMadre = p.cuantiaPensionMadre;
      if (cuantiaMadre > 0 && p.cuantiaPensionBeneficiario < cuantiaMadre) {
        brechaCalculadaPct = r((cuantiaMadre - p.cuantiaPensionBeneficiario) / cuantiaMadre * 100);
        cumpleRequisitoBrechaHombres = brechaCalculadaPct >= PCT_BRECHA_MINIMA_HOMBRES;
        if (!cumpleRequisitoBrechaHombres) {
          tieneDerechoComplemento = false;
          motivoSinDerecho = `La brecha de pensión (${brechaCalculadaPct}%) es inferior al mínimo requerido (${PCT_BRECHA_MINIMA_HOMBRES}%).`;
        }
      } else if (p.cuantiaPensionBeneficiario >= cuantiaMadre) {
        brechaCalculadaPct = 0;
        cumpleRequisitoBrechaHombres = false;
        tieneDerechoComplemento = false;
        motivoSinDerecho = 'La pensión del beneficiario no es inferior a la de la madre. No existe brecha de género.';
      }
    } else {
      // Sin datos de la pensión de la madre
      advertencias.push('Para hombres, es necesario conocer la pensión de la madre de los hijos para verificar la condición de brecha (≥ 15%). El resultado asume que cumple la condición.');
    }
  }

  if (!tieneDerechoComplemento) {
    return {
      sexo: p.sexo,
      numHijos: p.numHijos,
      tipoPension: p.tipoPension,
      cumpleRequisitosHijos,
      cumpleRequisitoBrechaHombres,
      brechaCalculadaPct,
      tieneDerechoComplemento: false,
      motivoSinDerecho,
      complementoPorHijoAnual: COMPLEMENTO_POR_HIJO_ANUAL_2025,
      complementoBrutoMensual: 0,
      limiteMaximoComplemento: r(p.cuantiaPensionBeneficiario * PCT_LIMITE_SOBRE_PENSION / 100),
      complementoEfectivoMensual: 0,
      complementoEfectivoAnual: 0,
      pensionTotalMensual: r(p.cuantiaPensionBeneficiario),
      regimenAplicable,
      advertencias,
      fuenteDatos: 'LGSS art. 60 (RDL 3/2021) + RD 364/2021 — vigente 2025',
    };
  }

  const complementoBrutoMensual = r(p.numHijos * COMPLEMENTO_POR_HIJO_MENSUAL_2025);
  const limiteMaximoComplemento = r(p.cuantiaPensionBeneficiario * PCT_LIMITE_SOBRE_PENSION / 100);
  const complementoEfectivoMensual = r(Math.min(complementoBrutoMensual, limiteMaximoComplemento));
  const complementoEfectivoAnual = r(complementoEfectivoMensual * 14);
  const pensionTotalMensual = r(p.cuantiaPensionBeneficiario + complementoEfectivoMensual);

  advertencias.push(`Cuantía 2025: ${COMPLEMENTO_POR_HIJO_MENSUAL_2025} €/mes (${COMPLEMENTO_POR_HIJO_ANUAL_2025} €/año) por cada hijo a partir del ${MINIMO_HIJOS_PARA_COMPLEMENTO}º. Se actualiza anualmente con el IPC.`);
  advertencias.push(`Límite: el complemento no puede superar el ${PCT_LIMITE_SOBRE_PENSION}% de la pensión base (${limiteMaximoComplemento.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €/mes).`);
  advertencias.push('El complemento tributa en IRPF como rendimiento del trabajo. Se incluye en la base de cotización de pensionistas que trabajen.');

  if (pensionAntesDe2021 && p.sexo === 'mujer') {
    advertencias.push('Régimen transitorio: para pensiones causadas antes del 04/02/2021, las mujeres continúan con el "complemento de maternidad" anterior (art. 60 LGSS en redacción vigente en la fecha del hecho causante).');
  }

  if (complementoBrutoMensual > limiteMaximoComplemento) {
    advertencias.push(`El complemento calculado (${complementoBrutoMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €/mes) supera el límite del ${PCT_LIMITE_SOBRE_PENSION}% de la pensión base. Se aplica el límite.`);
  }

  return {
    sexo: p.sexo,
    numHijos: p.numHijos,
    tipoPension: p.tipoPension,
    cumpleRequisitosHijos,
    cumpleRequisitoBrechaHombres,
    brechaCalculadaPct,
    tieneDerechoComplemento: true,
    complementoPorHijoAnual: COMPLEMENTO_POR_HIJO_ANUAL_2025,
    complementoBrutoMensual,
    limiteMaximoComplemento,
    complementoEfectivoMensual,
    complementoEfectivoAnual,
    pensionTotalMensual,
    regimenAplicable,
    advertencias,
    fuenteDatos: 'LGSS art. 60 (RDL 3/2021) + RD 364/2021 — vigente 2025',
  };
}
