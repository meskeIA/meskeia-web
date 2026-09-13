/**
 * Datos fiscales: límites de exclusión del régimen de módulos (estimación objetiva) IRPF
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: art. 31 Ley 35/2006 IRPF + art. 32 Reglamento IRPF (RD 439/2007),
 * límites cuantitativos prorrogados desde 2016 por sucesivas Órdenes HFP/HAC
 * anuales (última: Orden HAC/1425/2025, que mantiene los mismos importes para 2026).
 * Verificado: 2026-09-02
 * URL oficial: https://sede.agenciatributaria.gob.es/Sede/empresarios-individuales-profesionales/contribuyentes-modulos/quien-se-aplica/irpf.html
 *
 * ⚠️ Estos tres límites son ADEMÁS de que la actividad esté en el listado de la
 * Orden HFP/HAC del ejercicio: cumplirlos no basta si la actividad no está en
 * el listado (p. ej. profesionales puros nunca pueden acogerse a módulos).
 */

export const FISCAL_MODULOS_IRPF_META = {
  fuente: 'Ley 35/2006 IRPF art. 31 + Reglamento IRPF (RD 439/2007) art. 32, límites prorrogados por Orden HAC/1425/2025',
  verificado: '2026-09-02',
  vigencia: '2025-2026',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/empresarios-individuales-profesionales/contribuyentes-modulos/quien-se-aplica/irpf.html',
  nota: 'Límites cuantitativos vigentes desde 2016 y prorrogados sin cambios ejercicio a ejercicio (la Orden HAC/1425/2025 los mantiene para 2026). Se excluye del régimen si se supera CUALQUIERA de los tres.',
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
