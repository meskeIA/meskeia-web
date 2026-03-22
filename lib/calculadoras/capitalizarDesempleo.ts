/**
 * Calculadora de Capitalización de la Prestación por Desempleo — lógica pura
 * Usada por: MCP server (calcular_capitalizar_desempleo)
 *
 * Calcula el importe del pago único (capitalización) de la prestación por
 * desempleo para trabajadores que van a constituirse como autónomos, iniciar
 * una actividad económica o incorporarse como socios trabajadores de cooperativas
 * o sociedades laborales.
 *
 * Modalidades (DA 1.ª Ley 45/2002 + RD 1044/1985):
 *
 * A) PAGO ÚNICO (autónomos / capitalización total):
 *    - Importe: prestación pendiente × 100% (autónomo individual)
 *    - Uso: inversión en la actividad, capital social o cuota de ingreso a cooperativa
 *    - Requisito: no haber sido autónomo o socio cooperativa en los 5 años anteriores
 *
 * B) COOPERATIVA / SOCIEDAD LABORAL (incorporación como socio trabajador):
 *    - Modalidad A: capitalización para pago de cuota de incorporación
 *    - Modalidad B: abono mensual continuo de la prestación (sin capitalizar)
 *
 * C) SUBSIDIO REDUCCIÓN COTIZACIONES SS:
 *    - El importe capitalizado puede destinarse íntegramente a sufragar la cotización
 *      a la Seguridad Social como autónomo durante el período de prestación
 *
 * Requisitos generales:
 *   - Período pendiente mínimo: 3 meses (en algunos CCAA puede variar)
 *   - No haber capitalizado en los últimos 4 años (regla general)
 *   - Solicitar ANTES de iniciar la actividad (imprescindible)
 *   - Menores de 30 años (o 35 si tienen hijos): pueden capitalizar el 100% en cualquier supuesto
 *
 * Retención IRPF: El pago único NO tributa en IRPF (exento conforme a LIRPF art. 7.n)
 * si se invierte en la actividad. Si no se cumple el requisito de permanencia (5 años),
 * puede tributar.
 *
 * Fuente: DA 1.ª Ley 45/2002 + RD 1044/1985 + LIRPF art. 7.n — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_pension_desempleo, calcular_cuota_autonomo, calcular_irpf
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const PCT_CAPITALIZACION_AUTONOMO = 100;          // % de la prestación pendiente
const PCT_CAPITALIZACION_COOPERATIVA = 100;       // % para cooperativas/soc. laborales
const MESES_MINIMOS_PARA_CAPITALIZAR = 3;         // meses mínimos pendientes
const ANIOS_SIN_CAPITALIZAR_PREVIOS = 4;          // años sin haber capitalizado antes

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type ModalidadCapitalizacion =
  | 'autonomo'             // Autónomo individual (pago único 100%)
  | 'cooperativa'          // Incorporación a cooperativa / sociedad laboral
  | 'reduccion_cuotas_ss'; // Destinado a pagar cuotas SS autónomo

export interface ParametrosCapitalizarDesempleo {
  /** Importe mensual bruto de la prestación por desempleo (€) */
  prestacionMensualBruta: number;
  /** Meses pendientes de prestación en el momento de la solicitud */
  mesesPendientes: number;
  /** Modalidad de capitalización elegida */
  modalidad: ModalidadCapitalizacion;
  /** Edad del beneficiario (años) — afecta a los requisitos */
  edad?: number;
  /** ¿Tiene hijos a cargo? (relevante para menores de 35 años) */
  tieneHijos?: boolean;
  /** ¿Ha capitalizado en los últimos 4 años? */
  haCapitalizadoAnteriormente?: boolean;
}

export interface ResultadoCapitalizarDesempleo {
  /** Prestación mensual bruta (€) */
  prestacionMensualBruta: number;
  /** Meses pendientes de prestación */
  mesesPendientes: number;
  /** Importe total de la prestación pendiente (€) */
  importeTotalPendiente: number;
  /** Modalidad de capitalización */
  modalidad: ModalidadCapitalizacion;
  /** Porcentaje capitalizable (%) */
  pctCapitalizable: number;
  /** **Importe del pago único / capitalización (€)** */
  importeCapitalizacion: number;
  /** ¿Cumple el requisito de meses mínimos? */
  cumpleMesesMinimos: boolean;
  /** ¿Cumple el requisito de no haber capitalizado antes? */
  cumpleRequisitoPrevio: boolean;
  /** ¿Reúne los requisitos para capitalizar? */
  puedeCapitalizar: boolean;
  /** Motivo de no poder capitalizar (si aplica) */
  motivoNoCapitaliza?: string;
  /** ¿Está exento de IRPF el pago único? */
  exentoIRPF: boolean;
  /** Cuota autónoma que podría cubrir durante N meses (si modalidad reduccion_cuotas_ss) */
  mesesCubiertosSSEstimado?: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularCapitalizarDesempleo(p: ParametrosCapitalizarDesempleo): ResultadoCapitalizarDesempleo {
  if (p.prestacionMensualBruta <= 0) throw new Error('La prestación mensual bruta debe ser mayor que cero.');
  if (p.mesesPendientes < 0) throw new Error('Los meses pendientes no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const haCapitalizadoAntes = p.haCapitalizadoAnteriormente ?? false;
  const edad = p.edad ?? 35;

  const cumpleMesesMinimos = p.mesesPendientes >= MESES_MINIMOS_PARA_CAPITALIZAR;
  const cumpleRequisitoPrevio = !haCapitalizadoAntes;

  const puedeCapitalizar = cumpleMesesMinimos && cumpleRequisitoPrevio;
  let motivoNoCapitaliza: string | undefined;
  if (!puedeCapitalizar) {
    const motivos: string[] = [];
    if (!cumpleMesesMinimos) motivos.push(`Quedan solo ${p.mesesPendientes} meses de prestación (mínimo ${MESES_MINIMOS_PARA_CAPITALIZAR})`);
    if (!cumpleRequisitoPrevio) motivos.push(`Ya se capitalizó en los últimos ${ANIOS_SIN_CAPITALIZAR_PREVIOS} años`);
    motivoNoCapitaliza = motivos.join('. ');
  }

  const importeTotalPendiente = r(p.prestacionMensualBruta * p.mesesPendientes);

  let pctCapitalizable: number;
  switch (p.modalidad) {
    case 'autonomo':
    case 'reduccion_cuotas_ss':
      pctCapitalizable = PCT_CAPITALIZACION_AUTONOMO;
      break;
    case 'cooperativa':
      pctCapitalizable = PCT_CAPITALIZACION_COOPERATIVA;
      break;
  }

  const importeCapitalizacion = puedeCapitalizar ? r(importeTotalPendiente * pctCapitalizable / 100) : 0;

  // Estimación meses cubiertos SS si se destina a cuotas (cuota base aprox. 300 €/mes tarifa plana primer año)
  const mesesCubiertosSSEstimado = p.modalidad === 'reduccion_cuotas_ss'
    ? Math.floor(importeCapitalizacion / 300) // Estimación con cuota aproximada
    : undefined;

  const advertencias: string[] = [
    'La solicitud de capitalización DEBE presentarse ANTES de iniciar la actividad. Hacerlo después invalida el derecho.',
    `Requisito de antigüedad: no haber sido autónomo o socio de cooperativa en los ${ANIOS_SIN_CAPITALIZAR_PREVIOS} años anteriores (regla general; puede variar por CCAA).`,
    'El SEPE puede requerir justificación de la inversión. Guardar facturas y documentación de constitución durante al menos 5 años.',
    'El pago único está exento de IRPF si la actividad se mantiene durante al menos 5 años (LIRPF art. 7.n). Si se abandona antes, puede tributar.',
  ];

  if (edad < 30 || (edad < 35 && (p.tieneHijos ?? false))) {
    advertencias.push(`Beneficio para menores de ${p.tieneHijos ? '35' : '30'} años: posibilidad de acceder a condiciones especiales de capitalización. Consultar con el SEPE.`);
  }

  if (p.modalidad === 'reduccion_cuotas_ss') {
    advertencias.push('En la modalidad de reducción de cuotas SS, el importe capitalizado se abona directamente a la TGSS cada mes. El autónomo recibe menos en mano pero cubre su cotización.');
    if (mesesCubiertosSSEstimado !== undefined) {
      advertencias.push(`Estimación orientativa: con ${importeCapitalizacion.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € se podrían cubrir ~${mesesCubiertosSSEstimado} meses de cuota autónoma (~300 €/mes tarifa inicial). Verificar cuota real en RETA.`);
    }
  }

  if (p.modalidad === 'cooperativa') {
    advertencias.push('Para incorporación a cooperativa o sociedad laboral, el importe capitalizado se destina al pago de la cuota de ingreso o adquisición de participaciones sociales.');
  }

  return {
    prestacionMensualBruta: r(p.prestacionMensualBruta),
    mesesPendientes: p.mesesPendientes,
    importeTotalPendiente,
    modalidad: p.modalidad,
    pctCapitalizable,
    importeCapitalizacion,
    cumpleMesesMinimos,
    cumpleRequisitoPrevio,
    puedeCapitalizar,
    motivoNoCapitaliza,
    exentoIRPF: true, // Si cumple 5 años de permanencia
    mesesCubiertosSSEstimado,
    advertencias,
    fuenteDatos: 'DA 1.ª Ley 45/2002 + RD 1044/1985 + LIRPF art. 7.n — vigente 2025',
  };
}
