/**
 * Calculadora del Impuesto Temporal de Solidaridad de Grandes Fortunas (ITSGF)
 * Usada por: MCP server (calcular_impuesto_grandes_fortunas)
 *
 * Calcula la cuota del Impuesto Temporal de Solidaridad de las Grandes Fortunas,
 * creado por la Ley 38/2022 para patrimonios netos superiores a 3 millones de euros.
 * Complementa al Impuesto sobre el Patrimonio (IP) autonómico.
 *
 * Marco normativo:
 *   - Ley 38/2022, de 27 de diciembre: creacion del ITSGF (disposicion adicional 1.a)
 *   - Ley 19/1991 del Impuesto sobre el Patrimonio (subsidiaria en todo lo no regulado)
 *   - LISD + LGT: reglas generales aplicables
 *
 * CARACTERISTICAS DEL ITSGF:
 *   - Sujetos: personas fisicas residentes en Espana
 *   - Caracter: COMPLEMENTARIO al IP. Si el IP de la CCAA grava efectivamente
 *     (no esta bonificado), la cuota del IP se deduce de la cuota del ITSGF.
 *   - Solo pagan quienes la CCAA haya bonificado o eliminado el IP (Madrid, Andalucia 2022)
 *   - TRANSITORIAMENTE para 2022 y 2023 (prorrogado ano a ano)
 *   - Gestionado por el Estado (no por las CCAA)
 *
 * ESCALA DEL ITSGF (Ley 38/2022 DA 1.a Tres):
 *   - Hasta 3.000.000 EUR (base liquidable): EXENTO (minimo exento igual que IP)
 *   - De 3.000.000 a 5.347.998,03 EUR: 1,7%
 *   - De 5.347.998,03 a 10.695.996,06 EUR: 2,1%
 *   - Mas de 10.695.996,06 EUR: 3,5%
 *
 * MINIMO EXENTO (igual que IP — Ley 19/1991 art. 28):
 *   - 700.000 EUR con caracter general
 *   - 300.000 EUR adicionales por vivienda habitual (max.)
 *
 * DEDUCCION DEL IP AUTONÓMICO:
 *   Si la CCAA tiene IP vigente y efectivo, se deduce la cuota del IP de la cuota del ITSGF.
 *   Solo pagan la diferencia. Si cuota IP >= cuota ITSGF, no hay pago adicional.
 *
 * ELEMENTOS EXENTOS (mismos que en IP — Ley 19/1991 art. 4):
 *   - Empresa familiar (art. 4.8): si cumple requisitos de exencion en IP
 *   - Vivienda habitual: hasta 300.000 EUR
 *   - Planes de pensiones, seguros de vida con aseguramiento de dependencia
 *   - Derechos de propiedad intelectual (si el autor es el sujeto pasivo)
 *
 * Fuente: Ley 38/2022 + Ley 19/1991 (IP) - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sucesiones, calcular_empresa_familiar_isd, calcular_irpf
 */

// --- Constantes ---

const MINIMO_EXENTO_GENERAL = 700_000;        // EUR
const LIMITE_EXENCION_VIVIENDA_HABITUAL = 300_000; // EUR maxima exencion VH

// Escala ITSGF (Ley 38/2022)
const TRAMOS_ITSGF: { desde: number; hasta: number; tipo: number }[] = [
  { desde: 0,              hasta: 3_000_000,      tipo: 0   },
  { desde: 3_000_000,      hasta: 5_347_998.03,   tipo: 1.7 },
  { desde: 5_347_998.03,   hasta: 10_695_996.06,  tipo: 2.1 },
  { desde: 10_695_996.06,  hasta: Infinity,        tipo: 3.5 },
];

// --- Tipos publicos ---

export interface ParametrosImpuestoGrandesFortunas {
  /** Patrimonio bruto total (suma de bienes y derechos) (EUR) */
  patrimonioBruto: number;
  /** Valor de la vivienda habitual incluido en el patrimonio bruto (EUR) */
  valorViviendaHabitual?: number;
  /** Deudas y cargas deducibles (EUR) */
  deudasDeducibles?: number;
  /** Valor de empresa familiar exenta en IP (EUR) */
  valorEmpresaFamiliarExenta?: number;
  /** Cuota liquida del Impuesto sobre el Patrimonio pagada a la CCAA (EUR) */
  cuotaIPAutonomicoLiquida?: number;
  /**
   * La CCAA tiene Impuesto de Patrimonio efectivo vigente (no bonificado al 100%)?
   * Si true, la cuota IP se deduce del ITSGF.
   * Madrid bonificaba al 100% (desde 2022 volvio a cobrarlo) — verifique el ejercicio.
   */
  ccaaTieneIPEfectivo?: boolean;
}

export interface ResultadoImpuestoGrandesFortunas {
  /** Patrimonio bruto declarado (EUR) */
  patrimonioBruto: number;
  /** Exencion vivienda habitual aplicada (EUR) */
  exencionViviendaHabitual: number;
  /** Exencion empresa familiar (EUR) */
  exencionEmpresaFamiliar: number;
  /** Total exenciones (EUR) */
  totalExenciones: number;
  /** Deudas deducidas (EUR) */
  deudasDeducidas: number;
  /** Patrimonio neto (EUR) */
  patrimonioNeto: number;
  /** Minimo exento personal (EUR) */
  minimoExento: number;
  /** Base liquidable (EUR) */
  baseLiquidable: number;
  /** Cuota integra ITSGF antes de deducciones (EUR) */
  cuotaIntegraITSGF: number;
  /** Deduccion cuota IP autonómico (EUR) */
  deduccionIPAutonomicoLiquida: number;
  /** Cuota a pagar ITSGF (EUR) */
  cuotaAPagar: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// --- Funcion auxiliar: cuota ITSGF ---

function calcularCuotaITSGF(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  for (const tramo of TRAMOS_ITSGF) {
    if (base <= tramo.desde) break;
    const baseTramo = Math.min(base, tramo.hasta) - tramo.desde;
    cuota += baseTramo * tramo.tipo / 100;
  }
  return cuota;
}

// --- Funcion principal ---

export function calcularImpuestoGrandesFortunas(
  p: ParametrosImpuestoGrandesFortunas
): ResultadoImpuestoGrandesFortunas {
  if (p.patrimonioBruto < 0) throw new Error('El patrimonio bruto no puede ser negativo.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // --- Exenciones ---
  const exencionViviendaHabitual = r(Math.min(p.valorViviendaHabitual ?? 0, LIMITE_EXENCION_VIVIENDA_HABITUAL));
  const exencionEmpresaFamiliar = r(p.valorEmpresaFamiliarExenta ?? 0);
  const totalExenciones = r(exencionViviendaHabitual + exencionEmpresaFamiliar);
  const deudasDeducidas = r(p.deudasDeducibles ?? 0);

  const patrimonioNeto = r(Math.max(0, p.patrimonioBruto - totalExenciones - deudasDeducidas));
  const minimoExento = MINIMO_EXENTO_GENERAL;
  const baseLiquidable = r(Math.max(0, patrimonioNeto - minimoExento));

  // --- Cuota ---
  const cuotaIntegraITSGF = r(calcularCuotaITSGF(baseLiquidable));
  const deduccionIPAutonomicoLiquida = r(Math.min(cuotaIntegraITSGF, p.cuotaIPAutonomicoLiquida ?? 0));
  const cuotaAPagar = r(Math.max(0, cuotaIntegraITSGF - deduccionIPAutonomicoLiquida));

  // --- Advertencias ---
  if (baseLiquidable === 0) {
    advertencias.push(
      'Base liquidable cero o negativa: el patrimonio neto no supera el minimo exento de ' +
      MINIMO_EXENTO_GENERAL.toLocaleString('es-ES') + ' EUR. No hay cuota a pagar.'
    );
  }
  if (p.ccaaTieneIPEfectivo && (p.cuotaIPAutonomicoLiquida ?? 0) >= cuotaIntegraITSGF) {
    advertencias.push(
      'La cuota del IP autonómico es igual o superior a la cuota del ITSGF: no hay pago adicional. ' +
      'El ITSGF actua como complemento cuando la CCAA bonifica o elimina el IP (como Madrid hasta 2022 o Andalucia).'
    );
  }
  advertencias.push(
    'Caracter temporal: el ITSGF fue creado por la Ley 38/2022 como impuesto "temporal". ' +
    'Ha sido prorrogado para cada ejercicio mediante ley de presupuestos o real decreto. ' +
    'Verifique si sigue vigente para el ejercicio que esta consultando.'
  );
  advertencias.push(
    'Complementariedad con el IP: si su CCAA aplica el IP con efectividad (Cataluna, Galicia, Valencia, etc.), ' +
    'la cuota del IP se deduce de la cuota del ITSGF. En la practica, solo pagan el ITSGF los residentes ' +
    'en CCAA que tenian el IP bonificado (ej. Madrid hasta 2022, Andalucia en algunos ejercicios).'
  );
  advertencias.push(
    'Limite conjunto IP + IRPF: si la suma de cuotas de IRPF + IP supera el 60% de la base imponible del IRPF, ' +
    'se puede reducir la cuota del IP (y por tanto afectar al ITSGF). ' +
    'Este calculo requiere los datos completos de la declaracion de IRPF.'
  );

  return {
    patrimonioBruto: r(p.patrimonioBruto),
    exencionViviendaHabitual,
    exencionEmpresaFamiliar,
    totalExenciones,
    deudasDeducidas,
    patrimonioNeto,
    minimoExento,
    baseLiquidable,
    cuotaIntegraITSGF,
    deduccionIPAutonomicoLiquida,
    cuotaAPagar,
    advertencias,
    fuenteDatos: 'Ley 38/2022 (ITSGF) + Ley 19/1991 (IP) - vigente 2025',
  };
}
