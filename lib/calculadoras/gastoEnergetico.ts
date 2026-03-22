/**
 * Calculadora de Gasto Energético del Hogar — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_gasto_energetico)
 *
 * Calcula el consumo eléctrico mensual y el coste estimado de la factura
 * a partir de los electrodomésticos del hogar y la tarifa eléctrica.
 *
 * Estructura del recibo eléctrico en España:
 *   Coste energía + Término de potencia → subtotal
 *   + Impuesto eléctrico (5.113%)
 *   + IVA (21%)
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface Electrodomestico {
  /** Nombre o descripción (ej: 'Nevera', 'TV salón') */
  nombre: string;
  /** Potencia en Watios (W) */
  potenciaW: number;
  /** Horas de uso al día */
  horasDia: number;
  /** Días de uso al mes (por defecto 30) */
  diasMes?: number;
  /** Número de unidades (por defecto 1) */
  cantidad?: number;
}

export interface ParametrosGastoEnergetico {
  /** Lista de electrodomésticos */
  electrodomesticos: Electrodomestico[];
  /**
   * Precio del kWh en €/kWh.
   * Valores orientativos 2024: PVPC media ~0.13 €/kWh, Mercado Libre ~0.15 €/kWh.
   * Por defecto 0.15 €/kWh.
   */
  preciokWh?: number;
  /**
   * Potencia contratada en kW (afecta al término de potencia mensual).
   * Valores habituales: 3.45, 4.6, 5.75, 6.9, 8.05, 9.2, 10.35 kW.
   * Por defecto 4.6 kW.
   */
  potenciaContratadaKW?: number;
}

export interface DetalleElectrodomestico {
  nombre: string;
  potenciaW: number;
  horasDia: number;
  diasMes: number;
  cantidad: number;
  consumoMensualKWh: number;
  costeMensual: number;
}

export interface ResultadoGastoEnergetico {
  /** Consumo total mensual (kWh) */
  consumoTotalKWh: number;
  /** Precio del kWh usado (€/kWh) */
  preciokWh: number;
  /** Coste de la energía consumida (€) */
  costeEnergia: number;
  /** Término de potencia mensual (€) */
  terminoPotencia: number;
  /** Potencia contratada usada (kW) */
  potenciaContratadaKW: number;
  /** Subtotal antes de impuestos */
  subtotal: number;
  /** Impuesto eléctrico (5.113%) */
  impuestoElectricidad: number;
  /** Base imponible IVA */
  baseIVA: number;
  /** IVA (21%) */
  iva: number;
  /** Total factura mensual estimada */
  totalMensual: number;
  /** Coste anual estimado */
  totalAnual: number;
  /** Detalle por electrodoméstico */
  detalle: DetalleElectrodomestico[];
}

// ─── Término de potencia orientativo (€/mes) ──────────────────────────────────
// Fuente: CNMC arancel regulado (acceso terceros redes), valores 2024 orientativos

const TERMINO_POTENCIA: Record<number, number> = {
  3.45:  30.67,
  4.6:   40.89,
  5.75:  51.12,
  6.9:   61.34,
  8.05:  71.56,
  9.2:   81.79,
  10.35: 92.01,
};

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularGastoEnergetico(p: ParametrosGastoEnergetico): ResultadoGastoEnergetico {
  if (p.electrodomesticos.length === 0) throw new Error('Debe proporcionar al menos un electrodoméstico.');
  if (p.electrodomesticos.length > 30) throw new Error('Máximo 30 electrodomésticos por cálculo.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const r4 = (n: number) => Math.round(n * 10000) / 10000;

  const preciokWh = p.preciokWh ?? 0.15;
  const potencia = p.potenciaContratadaKW ?? 4.6;

  if (preciokWh <= 0) throw new Error('El precio del kWh debe ser mayor que cero.');
  if (potencia <= 0) throw new Error('La potencia contratada debe ser mayor que cero.');

  // Término de potencia: buscar el valor más próximo en la tabla
  let terminoPotencia: number;
  const potenciasDisponibles = Object.keys(TERMINO_POTENCIA).map(Number);
  const masCercana = potenciasDisponibles.reduce((prev, curr) =>
    Math.abs(curr - potencia) < Math.abs(prev - potencia) ? curr : prev
  );
  terminoPotencia = TERMINO_POTENCIA[masCercana] ?? r(potencia * 8.88); // estimación lineal fallback

  const detalle: DetalleElectrodomestico[] = p.electrodomesticos.map(e => {
    if (e.potenciaW < 0) throw new Error(`Potencia negativa en "${e.nombre}".`);
    if (e.horasDia < 0 || e.horasDia > 24) throw new Error(`Horas/día fuera de rango en "${e.nombre}".`);
    const dias = e.diasMes ?? 30;
    const uds = e.cantidad ?? 1;
    const consumo = r4((e.potenciaW / 1000) * e.horasDia * dias * uds);
    return {
      nombre: e.nombre,
      potenciaW: e.potenciaW,
      horasDia: e.horasDia,
      diasMes: dias,
      cantidad: uds,
      consumoMensualKWh: r4(consumo),
      costeMensual: r(consumo * preciokWh),
    };
  });

  const consumoTotalKWh = r4(detalle.reduce((s, e) => s + e.consumoMensualKWh, 0));
  const costeEnergia = r(consumoTotalKWh * preciokWh);
  const subtotal = r(costeEnergia + terminoPotencia);
  const impuestoElectricidad = r(subtotal * 0.05113);
  const baseIVA = r(subtotal + impuestoElectricidad);
  const iva = r(baseIVA * 0.21);
  const totalMensual = r(baseIVA + iva);

  return {
    consumoTotalKWh: r4(consumoTotalKWh),
    preciokWh,
    costeEnergia,
    terminoPotencia: r(terminoPotencia),
    potenciaContratadaKW: potencia,
    subtotal,
    impuestoElectricidad,
    baseIVA,
    iva,
    totalMensual,
    totalAnual: r(totalMensual * 12),
    detalle,
  };
}
