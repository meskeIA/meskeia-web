/**
 * Calculadora de Sanciones Tributarias — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_sancion_tributaria)
 *
 * Calcula la sanción tributaria aplicable a infracciones de la LGT
 * y las reducciones por conformidad y pronto pago.
 *
 * Infracciones y tipos (LGT arts. 191-206):
 *
 * A) INFRACCIÓN POR DEJAR DE INGRESAR (art. 191 LGT) — la más habitual:
 *    - LEVE: cuota < 3.000 € O cuota ≥ 3.000 € sin ocultación → 50%
 *    - GRAVE: cuota ≥ 3.000 € con ocultación O uso medios fraudulentos → 50-100%
 *      * 50% base + puntaje por perjuicio económico (hasta +25%) y reiteración (+25%)
 *    - MUY GRAVE: defraudación especialmente grave (medios fraudulentos) → 100-150%
 *
 * B) INFRACCIÓN POR NO PRESENTAR DECLARACIÓN (art. 198 LGT):
 *    - Sin perjuicio económico: 200 €/declaración (400 € si requerimiento previo)
 *    - Con perjuicio económico: mismos % que art. 191
 *
 * Reducciones aplicables sobre la sanción (LGT art. 188):
 *    - Por conformidad (acuerdo con la Administración): 30%
 *    - Por pronto pago (pago en período voluntario): 25%
 *    - Ambas reduciones son acumulables: 30% + 25% × (1-0,30) = 47,5% total
 *
 * Recargo por presentación extemporánea (NO es sanción, LGT art. 27):
 *    Ver calcular_recargo_presentacion_tardia
 *
 * Nota: Las sanciones NO tienen intereses de demora adicionales si se pagan
 * en período voluntario. Solo se añaden intereses si se aplaza su pago.
 *
 * Fuente: LGT arts. 181-212 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_recargo_presentacion_tardia, calcular_pago_aplazado_aeat, calcular_irpf
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const PCT_SANCION_LEVE = 50;
const PCT_SANCION_GRAVE_MIN = 50;
const PCT_SANCION_GRAVE_MAX = 100;
const PCT_SANCION_MUY_GRAVE_MIN = 100;
const PCT_SANCION_MUY_GRAVE_MAX = 150;

const PCT_REDUCCION_CONFORMIDAD = 30;
const PCT_REDUCCION_PRONTO_PAGO = 25;

const SANCION_FIJA_NO_PRESENTAR = 200;
const SANCION_FIJA_NO_PRESENTAR_REQUERIMIENTO = 400;

// Puntaje adicional por perjuicio económico (LGT art. 187.1.a)
// % cuota/deuda respecto a base sanción → incremento %
const PERJUICIO_ECONOMICO_TRAMOS = [
  { hasta: 10, incremento: 0 },
  { hasta: 25, incremento: 10 },
  { hasta: 50, incremento: 15 },
  { hasta: 100, incremento: 25 },
];

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type GradoInfraccion = 'leve' | 'grave' | 'muy_grave';
export type TipoInfraccion =
  | 'dejar_de_ingresar'      // Art. 191 LGT — la más habitual
  | 'no_presentar'           // Art. 198 LGT — no presentar declaración
  | 'obtener_devolucion_improcedente' // Art. 193 LGT
  | 'acreditar_partidas_falsas';     // Art. 194-195 LGT

export interface ParametrosSancionTributaria {
  /** Tipo de infracción tributaria */
  tipoInfraccion: TipoInfraccion;
  /** Grado de la infracción (determinado por la Inspección o aplicable al caso) */
  gradoInfraccion: GradoInfraccion;
  /** Cuota defraudada / dejada de ingresar (€) — base de la sanción */
  cuotaDefraudada: number;
  /** ¿Hubo ocultación de datos a la Administración? (agrava la infracción) */
  huboOcultacion?: boolean;
  /** ¿Hay reiteración (sanción firme anterior en los 4 años previos)? */
  hayReiteracion?: boolean;
  /** ¿El infractor presta conformidad con la liquidación? (reduce la sanción 30%) */
  conformidad?: boolean;
  /** ¿Paga en período voluntario sin aplazamiento? (reduce la sanción 25%) */
  prontoPago?: boolean;
  /** Porcentaje del perjuicio económico (cuota/base imponible × 100) — para graduar infracción grave */
  pctPerjuicioEconomico?: number;
}

export interface ResultadoSancionTributaria {
  /** Tipo de infracción */
  tipoInfraccion: TipoInfraccion;
  /** Grado de infracción */
  gradoInfraccion: GradoInfraccion;
  /** Cuota defraudada (€) */
  cuotaDefraudada: number;
  /** Porcentaje base de la sanción (%) */
  porcentajeBaseSancion: number;
  /** Incremento por perjuicio económico (%) */
  incrementoPerjuicioEconomico: number;
  /** Incremento por reiteración (%) */
  incrementoReiteracion: number;
  /** Porcentaje total de la sanción antes de reducciones (%) */
  porcentajeTotalSancion: number;
  /** Sanción bruta antes de reducciones (€) */
  sancionBruta: number;
  /** Reducción por conformidad (€) */
  reduccionConformidad: number;
  /** Reducción por pronto pago (€) */
  reduccionProntoPago: number;
  /** Total reducciones (€) */
  totalReducciones: number;
  /** **Sanción final a pagar (€)** */
  sancionFinal: number;
  /** Porcentaje de reducción total aplicado (%) */
  pctReduccionTotal: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularSancionTributaria(p: ParametrosSancionTributaria): ResultadoSancionTributaria {
  if (p.cuotaDefraudada < 0) throw new Error('La cuota defraudada no puede ser negativa.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // Porcentaje base según grado
  let porcentajeBase: number;
  switch (p.gradoInfraccion) {
    case 'leve':
      porcentajeBase = PCT_SANCION_LEVE;
      break;
    case 'grave':
      porcentajeBase = PCT_SANCION_GRAVE_MIN;
      break;
    case 'muy_grave':
      porcentajeBase = PCT_SANCION_MUY_GRAVE_MIN;
      break;
  }

  // Incremento por perjuicio económico (solo infracciones graves y muy graves)
  let incrementoPerjuicio = 0;
  const pctPerjuicio = p.pctPerjuicioEconomico ?? 0;
  if (['grave', 'muy_grave'].includes(p.gradoInfraccion) && pctPerjuicio > 0) {
    const tramo = PERJUICIO_ECONOMICO_TRAMOS.find(t => pctPerjuicio <= t.hasta);
    if (tramo) incrementoPerjuicio = tramo.incremento;
    else incrementoPerjuicio = 25; // Máximo
  }

  // Incremento por reiteración
  const incrementoReiteracion = p.hayReiteracion ? 25 : 0;

  // Porcentaje total (con límites por grado)
  let porcentajeTotal = porcentajeBase + incrementoPerjuicio + incrementoReiteracion;
  if (p.gradoInfraccion === 'grave') {
    porcentajeTotal = Math.min(porcentajeTotal, PCT_SANCION_GRAVE_MAX);
  } else if (p.gradoInfraccion === 'muy_grave') {
    porcentajeTotal = Math.min(porcentajeTotal, PCT_SANCION_MUY_GRAVE_MAX);
  }

  // Sanción bruta
  let sancionBruta: number;
  if (p.tipoInfraccion === 'no_presentar' && p.cuotaDefraudada === 0) {
    // Infracción formal sin perjuicio económico
    sancionBruta = p.pctPerjuicioEconomico === 0 ? SANCION_FIJA_NO_PRESENTAR : p.cuotaDefraudada * porcentajeTotal / 100;
    advertencias.push(`Infracción por no presentar sin perjuicio económico: sanción fija de ${SANCION_FIJA_NO_PRESENTAR} € (${SANCION_FIJA_NO_PRESENTAR_REQUERIMIENTO} € si hubo requerimiento previo de la Administración).`);
  } else {
    sancionBruta = r(p.cuotaDefraudada * porcentajeTotal / 100);
  }

  // Reducciones (art. 188 LGT)
  const reduccionConformidad = p.conformidad ? r(sancionBruta * PCT_REDUCCION_CONFORMIDAD / 100) : 0;
  const baseTraConformidad = r(sancionBruta - reduccionConformidad);
  const reduccionProntoPago = p.prontoPago ? r(baseTraConformidad * PCT_REDUCCION_PRONTO_PAGO / 100) : 0;

  const totalReducciones = r(reduccionConformidad + reduccionProntoPago);
  const sancionFinal = r(sancionBruta - totalReducciones);
  const pctReduccionTotal = sancionBruta > 0 ? r(totalReducciones / sancionBruta * 100) : 0;

  advertencias.push('La clasificación del grado de infracción (leve/grave/muy grave) la realiza la Inspección o la Administración tributaria, no el contribuyente. Esta calculadora asume el grado indicado.');
  advertencias.push(`Reducciones: conformidad (-${PCT_REDUCCION_CONFORMIDAD}%) y pronto pago (-${PCT_REDUCCION_PRONTO_PAGO}%) son acumulables. La reducción por pronto pago se aplica sobre la sanción ya reducida por conformidad.`);
  advertencias.push('La sanción es compatible con los intereses de demora y recargos sobre la cuota defraudada, que se calculan y pagan por separado. Use calcular_recargo_presentacion_tardia para el recargo extemporáneo.');
  advertencias.push('El sistema de infracciones y sanciones tributarias puede impugnarse. El plazo para recurrir es de 1 mes desde la notificación (recurso de reposición) o presentar reclamación económico-administrativa.');

  if (p.gradoInfraccion === 'muy_grave') {
    advertencias.push('Las infracciones muy graves pueden conllevar publicidad de las sanciones (lista de deudores tributarios) si superan 1M€ y otras consecuencias accesorias.');
  }

  return {
    tipoInfraccion: p.tipoInfraccion,
    gradoInfraccion: p.gradoInfraccion,
    cuotaDefraudada: r(p.cuotaDefraudada),
    porcentajeBaseSancion: porcentajeBase,
    incrementoPerjuicioEconomico: incrementoPerjuicio,
    incrementoReiteracion,
    porcentajeTotalSancion: porcentajeTotal,
    sancionBruta: r(sancionBruta),
    reduccionConformidad,
    reduccionProntoPago,
    totalReducciones,
    sancionFinal,
    pctReduccionTotal,
    advertencias,
    fuenteDatos: 'LGT arts. 181-212 (Ley 58/2003) — vigente 2025',
  };
}
