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
 *   - Las dos resoluciones de 2025 que declaran esos requisitos adicionales contrarios al
 *     principio de igualdad de trato (Directiva 79/7/CEE) NO van tecleadas aquí: viven en
 *     `COMPLEMENTO_BRECHA_GENERO_META.doctrina` y de ahí las lee esta calculadora, igual
 *     que la web. El complemento debe reconocerse a hombres y mujeres EN LAS MISMAS
 *     CONDICIONES, criterio que el INSS asumió en 2025.
 *   - Por tanto, esta calculadora NO aplica ya requisitos extra a los hombres. Los
 *     requisitos son idénticos para ambos sexos.
 *
 * ── Requisitos (idénticos para hombre y mujer desde la doctrina 2025) ────────────
 *   La lista —y por tanto CUÁNTOS son— vive en `REQUISITOS_ART60`, aquí abajo: es la única
 *   enumeración, y de ella salen también el aviso del panel de la web, el paso 1 de su
 *   guía y su FAQPage. Contarlos a mano en cada sitio fue el hallazgo 654, que dejó un
 *   «5 requisitos clave» en la web sin correspondencia con nada de lo que la app evalúa.
 *
 *   Dos reglas que NO son requisitos y que por eso quedan fuera de esa lista: la
 *   jubilación parcial, excluida expresamente (art. 60.4 LGSS, ver abajo), y el sexo del
 *   solicitante, que dejó de condicionar el derecho con la doctrina de 2025.
 *
 * ── Exclusión expresa (art. 60.4 LGSS) ───────────────────────────────────────────
 *   La JUBILACIÓN PARCIAL del art. 215 LGSS no da derecho al complemento, aunque sea
 *   contributiva y sea jubilación. Sí lo da el acceso posterior a la jubilación plena.
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
 * Fuente: `COMPLEMENTO_BRECHA_GENERO_META.fuente` (art. 60 LGSS + RDL de revalorización) y,
 * para la jurisprudencia, `COMPLEMENTO_BRECHA_GENERO_META.doctrina` — ambas en
 * data/fiscal/pensiones.ts, que es donde se revisan por /triaje-fiscal.
 *
 * Encadenable con: calcular_pension_publica, calcular_pension_viudedad, calcular_jubilacion_anticipada
 */

import {
  COMPLEMENTO_BRECHA_GENERO_2026,
  COMPLEMENTO_BRECHA_GENERO_META,
} from '@/data/fiscal';
import { formatFechaLarga } from '@/lib/formatters';

/**
 * La exclusión del art. 60.4 LGSS, leída del módulo fiscal y no tecleada aquí: es un dato
 * normativo, y como tal tiene que pasar por el ciclo /triaje-fiscal como los demás.
 */
const EXCLUSION_JUBILACION_PARCIAL = COMPLEMENTO_BRECHA_GENERO_2026.exclusiones.find(
  e => e.supuesto === 'jubilacion_parcial',
)!;

/** Fecha mínima del hecho causante, leída del módulo fiscal (hallazgo 504) */
export const FECHA_MINIMA_HECHO_CAUSANTE = formatFechaLarga(COMPLEMENTO_BRECHA_GENERO_2026.fechaMinimaHechoCausante);

/**
 * Las dos resoluciones de igualdad de trato, LEÍDAS del módulo fiscal.
 *
 * La web ya las interpolaba desde aquí (hallazgo 606), pero la reparación no viajó a este
 * gemelo, que las tecleaba en tres cadenas de runtime: mismas fechas, distinto origen. Con
 * las dos vías leyendo el mismo campo, la próxima resolución que matice la doctrina se
 * corrige una vez en data/fiscal y llega a la vez a la página y a las tools del MCP
 * (hallazgo 653).
 */
const DOCTRINA = COMPLEMENTO_BRECHA_GENERO_META.doctrina;

/**
 * Los requisitos del art. 60 LGSS que esta calculadora evalúa DE VERDAD, enumerados una
 * sola vez para todo el conjunto app + MCP.
 *
 * Cada uno se corresponde con una rama de denegación de `calcularComplementoBrechaGenero`:
 * pensión elegible (casos 1 y 1.bis), corte temporal (caso 2), hijos computables (caso 3) y
 * concurrencia con el otro progenitor (caso 4). Ni el sexo ni la denegación propia están
 * aquí: el primero dejó de condicionar el derecho con la doctrina de 2025 y la segunda no
 * es un requisito, sino la vía de reclamación.
 *
 * `detalle` va redactado para poder encadenarse en prosa (lo consume el FAQPage de la app);
 * `corto` es la etiqueta para listados.
 */
export const REQUISITOS_ART60 = [
  {
    corto: 'pensión contributiva elegible',
    detalle:
      'ser titular de una pensión contributiva de jubilación, incapacidad permanente o ' +
      'viudedad (las no contributivas y la jubilación parcial quedan fuera)',
  },
  {
    corto: `hecho causante desde el ${FECHA_MINIMA_HECHO_CAUSANTE}`,
    detalle: `que el hecho causante de la pensión sea el ${FECHA_MINIMA_HECHO_CAUSANTE} o posterior`,
  },
  {
    corto: 'al menos un hijo o hija computable',
    detalle:
      'tener al menos un hijo o hija nacido con vida o adoptado antes del hecho causante',
  },
  {
    corto: 'que el otro progenitor no lo perciba',
    detalle: 'que el otro progenitor no perciba ya el complemento por los mismos hijos',
  },
] as const;

/** Cuántos requisitos evalúa el verificador. Se cuenta, no se teclea (hallazgo 654). */
export const NUM_REQUISITOS_ART60 = REQUISITOS_ART60.length;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SexoBeneficiario = 'mujer' | 'hombre';
export type TipoPensionBG = 'jubilacion' | 'jubilacion_parcial' | 'incapacidad_permanente' | 'viudedad' | 'no_contributiva' | 'ninguna';
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
  /** Situación del OTRO progenitor respecto al complemento. Por defecto 'no_percibe'. */
  otroProgenitor?: EstadoOtroProgenitor;
  /**
   * ¿Al PROPIO beneficiario le denegaron el complemento en su día? Es lo que decide si
   * procede reclamar. Antes se deducía de `otroProgenitor === 'denegado'`, que es una
   * respuesta sobre OTRA persona: quien la marcaba recibía la instrucción de impugnar una
   * resolución denegatoria que no tenía, y a quien sí se la habían denegado a él no había
   * forma de decirlo. Sale del hallazgo 225 del Inspector (tanda 6).
   */
  denegacionPropia?: boolean;
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
    `Desde la STJUE ${DOCTRINA.stjue.asunto} (${DOCTRINA.stjue.fecha}) y la STS de ${DOCTRINA.ts.fecha}, hombres y mujeres tienen derecho en igualdad de condiciones: ya no se exigen requisitos adicionales a los hombres.`,
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
  // Caso 1.bis: jubilación parcial. Es contributiva y es jubilación, así que sin esta
  // comprobación caía en «procede» y devolvía un importe.
  if (p.tipoPension === 'jubilacion_parcial') {
    return noProcede(
      `${EXCLUSION_JUBILACION_PARCIAL.norma} excluye expresamente el complemento en la jubilación parcial. ${EXCLUSION_JUBILACION_PARCIAL.detalle}`,
      'Cuando accedas desde la jubilación parcial a la jubilación plena, solicita entonces el complemento ante el INSS citando el art. 60 LGSS.',
      [COMPLEMENTO_BRECHA_GENERO_META.nota],
    );
  }
  // Red de seguridad: las tres exclusiones de arriba cubren los tres valores de TipoPensionBG
  // que NO están en `pensionesElegibles` (hallazgo 504 — el dato no tenía consumidor). Si
  // algún día se añade un tipo de pensión nuevo sin darle su propia rama, esta comprobación
  // deniega con explicación en vez de conceder el complemento por defecto.
  if (!(COMPLEMENTO_BRECHA_GENERO_2026.pensionesElegibles as readonly string[]).includes(p.tipoPension)) {
    return noProcede(
      `El complemento solo se reconoce sobre pensiones de ${COMPLEMENTO_BRECHA_GENERO_2026.pensionesElegibles.join(', ')}.`,
      'Consulta con el INSS si tu modalidad de pensión da acceso a este complemento.',
    );
  }

  // Caso 2: hecho causante anterior al 04-feb-2021
  if (fecha === 'antes_2021') {
    return noProcede(
      `La pensión se causó antes del ${FECHA_MINIMA_HECHO_CAUSANTE}, fecha de entrada en vigor del complemento por brecha de género (RDL 3/2021). Para hechos causantes anteriores se aplicaba el antiguo complemento de maternidad, con reglas distintas.`,
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

  // Caso 5: al PROPIO beneficiario le denegaron el complemento → procede valorar reclamación.
  // Que se lo denegaran al otro progenitor no da derecho a reclamar nada.
  const esReclamacion = p.denegacionPropia === true;

  const pensionTotalMensual = p.cuantiaPensionBeneficiario !== undefined
    ? r2(p.cuantiaPensionBeneficiario + complementoMensual)
    : undefined;

  const motivo = esReclamacion
    ? (p.sexo === 'hombre'
        ? `Tras la STJUE de ${DOCTRINA.stjue.fecha} (${DOCTRINA.stjue.asunto}) y la doctrina del Tribunal Supremo (${DOCTRINA.ts.fecha}), las denegaciones previas a hombres por no cumplir requisitos adicionales son revisables. El complemento debe reconocerse en las mismas condiciones que a las mujeres.`
        : 'Se cumplen los requisitos básicos del art. 60 LGSS, así que conviene revisar el motivo de la resolución denegatoria: de él depende si cabe reclamar o si hay algo que subsanar.')
    : (p.sexo === 'hombre'
        ? 'Tras la doctrina TJUE/TS 2025, los hombres tienen derecho al complemento en las mismas condiciones que las mujeres. Se cumplen los requisitos básicos del art. 60 LGSS.'
        : 'Se cumplen los requisitos básicos del art. 60 LGSS para el reconocimiento del complemento.');

  const pasoSiguiente = esReclamacion
    ? (p.sexo === 'hombre'
        ? `Procede valorar reclamación: nueva solicitud o reclamación previa contra la resolución denegatoria, citando la ${DOCTRINA.stjue.corto} y la doctrina del TS. Recomendable acudir a un abogado laboralista o al sindicato.`
        : 'Recupera la resolución denegatoria y revisa su motivo con un abogado laboralista o con tu sindicato antes de volver a solicitarlo.')
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
