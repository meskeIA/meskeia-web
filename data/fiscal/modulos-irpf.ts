/**
 * Datos fiscales: límites de exclusión del régimen de módulos (estimación objetiva) IRPF
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente de los LÍMITES: art. 31.1.3.ª Ley 35/2006 IRPF (150.000 / 75.000 / 150.000 €),
 * elevados a 250.000 / 125.000 / 250.000 € por la DT 32.ª LIRPF, y su aplicación a
 * 2025-2026 según la sede de la AEAT. NO salen de la Orden de módulos: la Orden
 * HAC/1425/2025, art. 3.1 a) y c), remite al art. 31.1.3.ª sin cifras.
 * Verificado: 2026-10-02 (ver FISCAL_MODULOS_IRPF_META)
 * URL oficial: https://sede.agenciatributaria.gob.es/Sede/empresarios-individuales-profesionales/contribuyentes-modulos/quien-se-aplica/irpf.html
 *
 * ⚠️ Estos tres límites son ADEMÁS de que la actividad esté en el listado de la
 * Orden HFP/HAC del ejercicio: cumplirlos no basta si la actividad no está en
 * el listado (p. ej. profesionales puros nunca pueden acogerse a módulos).
 */

/**
 * ⚠️ 02/10/2026 — hallazgo 2610 del Inspector. Hasta hoy el sello atribuía los importes a la
 * Orden de módulos («límites prorrogados por Orden HAC/1425/2025»), y la Orden no fija ninguno:
 * su art. 3.1 a) y c) remite «al previsto, para el período impositivo 2026, en el artículo
 * 31.1.3.ª» LIRPF, que dice 150.000 / 75.000 / 150.000 €. Cotejado ese día en el BOE:
 *   · la DT 32.ª LIRPF consolidada (BOE-A-2006-20764, última actualización del 28/02/2026) fija
 *     250.000 / 125.000 / 250.000 € «para los ejercicios 2016 a 2024», y nada más;
 *   · las tres prórrogas a 2025-2026 —RDL 9/2024 (BOE-A-2024-26915), RDL 16/2025
 *     (BOE-A-2025-26458) y RDL 2/2026 (BOE-A-2026-2547)— las derogó el Congreso al no
 *     convalidarlas (resoluciones BOE-A-2025-1136, BOE-A-2026-2024 y BOE-A-2026-4667);
 *   · la sede de la AEAT (página «Quién puede aplicar el método de estimación objetiva»,
 *     actualizada el 28/09/2026) dice: «Desde 2016 hasta 2026 inclusive los límites de 150.000 €
 *     y 75.000 € pasan a ser 250.000 € y 125.000 €», y lo mismo para las compras.
 * Se conservan los 250.000 € porque es el criterio que aplica la Administración, pero su base
 * legal para 2026 NO está en el texto consolidado, y la app lo dice. Al re-sellar: leer la DT 32.ª
 * y la sede de la AEAT, NO la Orden de módulos (que nunca llevará cifras y no avisaría de una
 * vuelta a 150.000 €).
 */
export const FISCAL_MODULOS_IRPF_META = {
  fuente: 'Ley 35/2006 IRPF, art. 31.1.3.ª (150.000 / 75.000 €) y DT 32.ª (250.000 / 125.000 € para 2016-2024); para 2025-2026, criterio de la AEAT',
  verificado: '2026-10-02',
  vigencia: '2025-2026',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/empresarios-individuales-profesionales/contribuyentes-modulos/quien-se-aplica/irpf.html',
  nota: 'La AEAT aplica los límites elevados «desde 2016 hasta 2026 inclusive», pero el texto consolidado de la DT 32.ª LIRPF solo nombra 2016-2024: las prórrogas a 2025-2026 por real decreto-ley fueron derogadas al no convalidarse. Si tus cifras están entre 150.000 € y 250.000 € (o entre 75.000 € y 125.000 € facturados a empresas), confírmalo con tu asesor antes de decidir. Se excluye del régimen si se supera CUALQUIERA de los límites.',
  /** Resumen visible de la salvedad, para el aviso de la app. */
  salvedad: 'La AEAT los aplica para 2026, aunque el texto consolidado de la ley solo los fija hasta 2024 (las prórrogas posteriores por real decreto-ley no se convalidaron). Sin ellos, los límites serían 150.000 € y 75.000 €.',
};

/**
 * Orden anual que desarrolla el método de estimación objetiva y publica el listado de
 * actividades que pueden acogerse a módulos, con sus signos, índices y módulos.
 *
 * ⚠️ Existe porque hasta el 13/09/2026 tres avisos visibles de
 * `simulador-modulos-vs-directa` citaban un comodín sin sustituir, «Orden HFP/X/2024»,
 * que no es una referencia localizable (hallazgo 810 del Inspector), y el faqJsonLd de
 * la misma app citaba una cuarta cosa. La cita se deriva de aquí, no se teclea.
 *
 * Verificado 2026-09-13 contra el BOE: la Orden HAC/1425/2025, de 9 de diciembre,
 * mantiene para 2026 la estructura y los importes de la Orden HAC/1347/2024 (ejercicio
 * 2025) y fija una reducción general del 5 % sobre el rendimiento neto de módulos.
 */
export const ORDEN_MODULOS_VIGENTE = {
  referencia: 'Orden HAC/1425/2025',
  fecha: '9 de diciembre de 2025',
  ejercicio: 2026,
  boe: 'BOE-A-2025-25272',
  url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-25272',
  anterior: 'Orden HAC/1347/2024 (ejercicio 2025)',
};

/**
 * Reducción general del rendimiento neto de módulos del ejercicio (DA 1.ª de la Orden anual).
 *
 * ⚠️ Existe porque hasta el 29/09/2026 `modulosVsDirecta.ts` aplicaba a los módulos la
 * reducción de la estimación directa SIMPLIFICADA (art. 30.2.ª RIRPF), con su tope de
 * 2.000 € (hallazgo 2445 del Inspector). Son dos figuras distintas: la de módulos NO tiene
 * tope en euros, y se aplica sobre el «rendimiento neto de módulos», que es lo que queda
 * DESPUÉS de las minoraciones por incentivos al empleo y a la inversión (Anexo II, instr.
 * 2.2) y de los índices correctores (instr. 2.3). El motor la restaba antes del empleo.
 *
 * Verificado 2026-09-29 contra el texto del BOE-A-2025-25272: «podrán reducir el
 * rendimiento neto de módulos obtenido en 2026 en un 5 por ciento» (DA 1.ª.1), y se tiene
 * en cuenta también en los pagos fraccionados (DA 1.ª.3). Es transitoria: la fija cada
 * Orden para su ejercicio, así que al re-sellar hay que leer la del año siguiente.
 */
export const REDUCCION_GENERAL_MODULOS = {
  porcentaje: 5,
  ejercicio: 2026,
  norma: 'DA 1.ª de la Orden HAC/1425/2025',
  verificado: '2026-09-29',
};

/**
 * Reducción general de módulos ya calculada, sin tope.
 *
 * @param rendimientoNetoModulos Rendimiento neto de módulos (tras incentivos e índices), en €.
 * @returns El importe de la reducción, 0 si el rendimiento no es positivo.
 */
export function reduccionGeneralModulos(rendimientoNetoModulos: number): number {
  if (!(rendimientoNetoModulos > 0)) return 0;
  return (rendimientoNetoModulos * REDUCCION_GENERAL_MODULOS.porcentaje) / 100;
}

export const LIMITES_EXCLUSION_MODULOS_2025 = {
  // Volumen de rendimientos íntegros del conjunto de actividades (año anterior)
  ingresosConjuntoActividades: 250000,
  // Volumen de rendimientos íntegros facturados a otros empresarios/profesionales
  // obligados a expedir factura (año anterior) — es un importe absoluto, NO un
  // porcentaje sobre el total de clientes.
  facturacionAEmpresas: 125000,
  // Volumen de compras en bienes y servicios, excluido el inmovilizado (año anterior)
  comprasBienesYServicios: 250000,
};
