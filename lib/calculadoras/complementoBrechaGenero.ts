/**
 * Calculadora del Complemento para la Reducción de la Brecha de Género — lógica pura
 * Usada por: MCP meskeIA y MCP Delegum (calcular_complemento_brecha_genero)
 *            y, como referencia normativa, por la app /verificador-complemento-brecha-genero
 *
 * Complemento de pensión por hijos/as para la reducción de la brecha de género
 * (antiguo "complemento de maternidad"), regulado por el art. 60 LGSS en la redacción
 * dada por el RDL 3/2021 y revalorizado anualmente.
 *
 * ── Doctrina vigente (IMPORTANTE) ───────────────────────────────────────────────
 *   - RDL 3/2021 (04/02/2021): crea el complemento de brecha de género, accesible a
 *     hombres y mujeres, pero EXIGÍA a los hombres requisitos adicionales (interrupción
 *     de jornada en los 2 años previos al nacimiento Y pensión inferior a la de la madre).
 *   - STJUE C-623/23 (15/05/2025) y STS de 09/07/2025: declaran que esos requisitos
 *     adicionales para los hombres son contrarios al principio de igualdad de trato
 *     (Directiva 79/7/CEE). El complemento debe reconocerse a hombres y mujeres EN LAS
 *     MISMAS CONDICIONES. El INSS asumió este criterio en 2025.
 *   - Por tanto, esta calculadora NO aplica ya requisitos extra a los hombres. Los
 *     requisitos son idénticos para ambos sexos.
 *
 * ── Requisitos (idénticos para hombre y mujer desde la doctrina 2025) ────────────
 *   1. Ser beneficiario de una pensión contributiva: jubilación, incapacidad
 *      permanente o viudedad. (Las no contributivas quedan fuera.)
 *   2. Hecho causante de la pensión a partir del 04/02/2021.
 *   3. Tener al menos 1 hijo/a nacido con vida o adoptado antes del hecho causante.
 *   4. Que el otro progenitor no perciba el complemento por los mismos hijos
 *      (incompatibilidad: solo uno de los dos). En caso de concurrencia, la SS lo
 *      reconoce al progenitor con pensión pública de menor cuantía.
 *
 * ── Cuantía y cómputo ────────────────────────────────────────────────────────────
 *   - Importe FIJO por hijo/a (no porcentaje), con un máximo de 4 hijos computables.
 *   - Se abona en 14 pagas.
 *   - NO computa a efectos del límite máximo de pensiones públicas.
 *   - Tributa en IRPF como rendimiento del trabajo.
 *   - Histórico de cuantías mensuales por hijo: 27,00 € (2021), 30,40 € (2023),
 *     33,20 € (2024), 35,90 € (2025), 36,90 € (2026).
 *
 * Los importes y la doctrina se centralizan en data/fiscal/pensiones.ts.
 *
 * Fuente: art. 60 LGSS (RDL 3/2021) + RDL 3/2026 + STJUE C-623/23 + STS 09/07/2025
 *
 * Encadenable con: calcular_pension_publica, calcular_pension_viudedad, calcular_jubilacion_anticipada
 */

import {
  COMPLEMENTO_BRECHA_GENERO_2026,
  COMPLEMENTO_BRECHA_GENERO_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SexoBeneficiario = 'mujer' | 'hombre';
export type TipoPensionBG = 'jubilacion' | 'incapacidad_permanente' | 'viudedad' | 'no_contributiva' | 'ninguna';
export type FechaHechoCausante = 'antes_2021' | 'desde_2021' | 'sin_iniciar';
export type EstadoOtroProgenitor = 'no_percibe' | 'percibe' | 'denegado' | 'no_aplica';

export interface ParametrosComplementoBrechaGenero {
  /** Sexo del beneficiario (informativo: desde la doctrina 2025 no afecta al derecho) */
  sexo: SexoBeneficiario;
  /** Número de hijos/as nacidos con vida o adoptados antes del hecho causante */
  numHijos: number;
  /** Tipo de pensión que se percibe o se va a percibir */
  tipoPension: TipoPensionBG;
  /** Momento del hecho causante de la pensión. Por defecto 'desde_2021'. */
  fechaHechoCausante?: FechaHechoCausante;
  /** Situación del otro progenitor respecto al complemento. Por defecto 'no_percibe'. */
  otroProgenitor?: EstadoOtroProgenitor;
  /** Cuantía mensual de la pensión base del beneficiario (€/mes). Opcional: para mostrar la pensión total con complemento. */
  cuantiaPensionBeneficiario?: number;
}

export interface ResultadoComplementoBrechaGenero {
  sexo: SexoBeneficiario;
  numHijos: number;
  tipoPension: TipoPensionBG;
  /** ¿Procede el complemento? */
  tieneDerechoComplemento: boolean;
  /** Nº de hijos computables (mínimo derecho, máximo 4) */
  hijosComputables: number;
  /** Cuantía mensual por hijo aplicada (€/mes, año vigente) */
  cuantiaPorHijoMensual: number;
  /** Complemento mensual total (€/mes) */
  complementoMensual: number;
  /** Complemento anual total (14 pagas) (€/año) */
  complementoAnual: number;
  /** Motivo de la resolución (procede o no, y por qué) */
  motivo: string;
  /** ¿El caso encaja en una posible reclamación retroactiva (p. ej. denegación previa a hombre)? */
  esReclamacion: boolean;
  /** Paso siguiente recomendado */
  pasoSiguiente: string;
  /** Cuantía de la pensión base aportada (si la hubo) (€/mes) */
  cuantiaPensionBeneficiario?: number;
  /** Pensión total mensual con complemento (si se aportó la pensión base) (€/mes) */
  pensionTotalMensual?: number;
  /** Advertencias y notas legales */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularComplementoBrechaGenero(
  p: ParametrosComplementoBrechaGenero,
): ResultadoComplementoBrechaGenero {
  if (p.numHijos < 0) throw new Error('El número de hijos no puede ser negativo.');
  if (p.cuantiaPensionBeneficiario !== undefined && p.cuantiaPensionBeneficiario < 0) {
    throw new Error('La cuantía de la pensión no puede ser negativa.');
  }

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const { cuantiaPorHijoMensual, maxHijos, pagasAnuales } = COMPLEMENTO_BRECHA_GENERO_2026;
  const fecha = p.fechaHechoCausante ?? 'desde_2021';
  const otroProgenitor = p.otroProgenitor ?? 'no_percibe';

  const hijosComputables = Math.min(p.numHijos, maxHijos);
  const complementoMensual = r2(hijosComputables * cuantiaPorHijoMensual);
  const complementoAnual = r2(complementoMensual * pagasAnuales);

  const fuenteDatos = COMPLEMENTO_BRECHA_GENERO_META.fuente;
  const advertenciasBase = [
    'El complemento se abona en 14 pagas y NO computa a efectos del límite máximo de pensiones públicas: se suma aunque ya se perciba la pensión máxima.',
    'El complemento tributa en IRPF como rendimiento del trabajo.',
    'Desde la STJUE C-623/23 (15-may-2025) y la STS de 09-jul-2025, hombres y mujeres tienen derecho en igualdad de condiciones: ya no se exigen requisitos adicionales a los hombres.',
  ];

  // Helper para construir un resultado de "no procede"
  const noProcede = (motivo: string, pasoSiguiente: string, advertencias: string[] = []): ResultadoComplementoBrechaGenero => ({
    sexo: p.sexo,
    numHijos: p.numHijos,
    tipoPension: p.tipoPension,
    tieneDerechoComplemento: false,
    hijosComputables: 0,
    cuantiaPorHijoMensual,
    complementoMensual: 0,
    complementoAnual: 0,
    motivo,
    esReclamacion: false,
    pasoSiguiente,
    cuantiaPensionBeneficiario: p.cuantiaPensionBeneficiario,
    pensionTotalMensual: p.cuantiaPensionBeneficiario !== undefined ? r2(p.cuantiaPensionBeneficiario) : undefined,
    advertencias,
    fuenteDatos,
  });

  // Caso 1: la pensión no es contributiva elegible
  if (p.tipoPension === 'no_contributiva') {
    return noProcede(
      'El complemento solo se aplica a pensiones contributivas (jubilación, incapacidad permanente o viudedad). Las pensiones no contributivas no dan acceso.',
      'Si en el futuro accedes a una pensión contributiva y tienes hijos, revisa entonces tu derecho.',
    );
  }
  if (p.tipoPension === 'ninguna') {
    return noProcede(
      'El complemento se reconoce únicamente sobre una pensión ya causada.',
      'Cuando solicites jubilación, incapacidad permanente o viudedad, recuerda revisar este derecho.',
    );
  }

  // Caso 2: hecho causante anterior al 04-feb-2021
  if (fecha === 'antes_2021') {
    return noProcede(
      'La pensión se causó antes del 4 de febrero de 2021, fecha de entrada en vigor del complemento por brecha de género (RDL 3/2021). Para hechos causantes anteriores se aplicaba el antiguo complemento de maternidad, con reglas distintas.',
      'Si entonces percibías o se te denegó el antiguo complemento de maternidad, consulta a un profesional: la doctrina TJUE 2019 (caso WA) también afectó a aquel régimen.',
    );
  }
  if (fecha === 'sin_iniciar') {
    return noProcede(
      'Aún no hay una pensión causada. El complemento se reconoce al solicitar la pensión.',
      'Al solicitar la pensión, marca expresamente que pides el complemento del art. 60 LGSS.',
    );
  }

  // Caso 3: sin hijos computables
  if (p.numHijos === 0) {
    return noProcede(
      'El complemento exige al menos un hijo o hija nacido con vida o adoptado antes del hecho causante de la pensión.',
      'Sin hijos computables no procede este complemento.',
    );
  }

  // Caso 4: el otro progenitor ya percibe el complemento → incompatible
  if (otroProgenitor === 'percibe') {
    return noProcede(
      'Cada hijo o hija solo genera el complemento para uno de los progenitores. Si el otro progenitor ya lo percibe por los mismos hijos, no puede reconocerse de nuevo.',
      'En caso de concurrencia, la SS lo reconoce al progenitor con la pensión pública de menor cuantía. Si tu pensión es inferior, conviene revisar la asignación con un asesor.',
      [COMPLEMENTO_BRECHA_GENERO_META.nota],
    );
  }

  // Caso 5: denegación previa a un hombre antes de la doctrina 2025 → posible reclamación
  // (la denegación por requisitos adicionales solo se aplicaba históricamente a hombres)
  const esReclamacion = otroProgenitor === 'denegado' && p.sexo === 'hombre';

  const pensionTotalMensual = p.cuantiaPensionBeneficiario !== undefined
    ? r2(p.cuantiaPensionBeneficiario + complementoMensual)
    : undefined;

  const motivo = esReclamacion
    ? 'Tras la STJUE C-623/23 (15-may-2025) y la doctrina del Tribunal Supremo (09-jul-2025), las denegaciones previas a hombres por no cumplir requisitos adicionales son revisables. El complemento debe reconocerse en las mismas condiciones que a las mujeres.'
    : (p.sexo === 'hombre'
        ? 'Tras la doctrina TJUE/TS 2025, los hombres tienen derecho al complemento en las mismas condiciones que las mujeres. Se cumplen los requisitos básicos del art. 60 LGSS.'
        : 'Se cumplen los requisitos básicos del art. 60 LGSS para el reconocimiento del complemento.');

  const pasoSiguiente = esReclamacion
    ? 'Procede valorar reclamación: nueva solicitud o reclamación previa contra la resolución denegatoria, citando la STJUE C-623/23 y la doctrina del TS. Recomendable acudir a un abogado laboralista o al sindicato.'
    : 'Si ya cobras la pensión y el complemento no aparece en tu nómina, presenta una solicitud expresa ante el INSS (Sede Electrónica de la SS) citando el art. 60 LGSS.';

  const advertencias = [...advertenciasBase];
  advertencias.push(
    `Cuantía vigente (${COMPLEMENTO_BRECHA_GENERO_META.vigencia}): ${cuantiaPorHijoMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €/mes por hijo, máximo ${maxHijos} hijos. Se revaloriza anualmente.`,
  );
  if (p.numHijos > maxHijos) {
    advertencias.push(
      `Se computan ${maxHijos} hijos como máximo, aunque tengas ${p.numHijos}.`,
    );
  }
  advertencias.push(COMPLEMENTO_BRECHA_GENERO_META.nota);

  return {
    sexo: p.sexo,
    numHijos: p.numHijos,
    tipoPension: p.tipoPension,
    tieneDerechoComplemento: true,
    hijosComputables,
    cuantiaPorHijoMensual,
    complementoMensual,
    complementoAnual,
    motivo,
    esReclamacion,
    pasoSiguiente,
    cuantiaPensionBeneficiario: p.cuantiaPensionBeneficiario,
    pensionTotalMensual,
    advertencias,
    fuenteDatos,
  };
}
