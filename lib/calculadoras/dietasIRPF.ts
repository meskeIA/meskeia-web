/**
 * Calculadora de Dietas y Gastos de Locomoción Exentos IRPF — lógica pura
 * Usada por: MCP server (calcular_dietas_irpf)
 *
 * Calcula la parte exenta y la parte sujeta a IRPF de las dietas y asignaciones
 * para gastos de locomoción y manutención pagadas por la empresa al trabajador,
 * aplicando los límites legales del RIRPF art. 9.
 *
 * Marco normativo:
 *   - RIRPF art. 9 (RD 439/2007, modificado)
 *   - LIRPF art. 17.1.d: las dietas están exentas hasta los límites reglamentarios
 *   - RD 7/2023 y actualizaciones: límite km propio vehículo subido a 0,26 €/km
 *
 * GASTOS DE LOCOMOCIÓN (RIRPF art. 9.A):
 *   a) Transporte público: exento el importe justificado (con billete/factura).
 *   b) Vehículo propio del trabajador:
 *      - 0,26 €/km (desde enero 2023, subido de 0,19 €/km)
 *      - Más los gastos de peaje y aparcamiento justificados.
 *   c) Vehículo de empresa: no genera dieta (la empresa paga el coste directamente).
 *
 * DIETAS POR MANUTENCIÓN Y ESTANCIA (RIRPF art. 9.B):
 *   Requisito: desplazamiento a MUNICIPIO DISTINTO al del trabajo habitual
 *   (y al del domicilio habitual del trabajador).
 *
 *   A) Con pernoctación (en municipio diferente al trabajo habitual):
 *      - España: 53,34 €/día de manutención (ilimitados días)
 *      - Extranjero: 91,35 €/día de manutención
 *      - Gastos de estancia (hotel): exentos con factura (sin límite con factura)
 *
 *   B) Sin pernoctación:
 *      - España: 26,67 €/día de manutención
 *      - Extranjero: 48,08 €/día de manutención
 *      - Sin gastos de estancia (no hay pernocta)
 *
 *   EXCEPCIÓN: Conductores/transportistas (RIRPF art. 9.B.3):
 *      - España: 36,06 €/día (con o sin pernocta)
 *      - Extranjero: 66,11 €/día
 *
 * PERSONAL AL SERVICIO DE LA ADMINISTRACIÓN PÚBLICA:
 *   Límites diferentes (según Ley de Presupuestos y RD de dietas de empleados públicos).
 *   Esta calculadora aplica los límites del régimen GENERAL (empresa privada).
 *
 * El exceso sobre los límites es rendimiento del trabajo sujeto a IRPF y SS.
 *
 * Fuente: RIRPF art. 9 (RD 439/2007) — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sueldo_neto, calcular_kilometraje, calcular_coste_empleado
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────

const LIMITE_KM_VEHICULO_PROPIO = 0.26;          // €/km (desde enero 2023)

// Manutención con pernoctación
const LIMITE_MANUTENCION_ESPANA_PERNOCTA = 53.34;    // €/día
const LIMITE_MANUTENCION_EXTRAN_PERNOCTA = 91.35;    // €/día

// Manutención sin pernoctación
const LIMITE_MANUTENCION_ESPANA_SIN_PERNOCTA = 26.67; // €/día
const LIMITE_MANUTENCION_EXTRAN_SIN_PERNOCTA = 48.08;  // €/día

// Transportistas
const LIMITE_TRANSPORTISTA_ESPANA = 36.06;   // €/día
const LIMITE_TRANSPORTISTA_EXTRAN = 66.11;   // €/día

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type TipoLocomocion = 'vehiculo_propio' | 'transporte_publico' | 'vehiculo_empresa';
export type ZonaDesplazamiento = 'espana' | 'extranjero';
export type TipoDesplazamiento = 'con_pernocta' | 'sin_pernocta' | 'transportista';

export interface GastoLocomocion {
  tipo: TipoLocomocion;
  /** Kilómetros recorridos (solo si tipo = vehiculo_propio) */
  kilometros?: number;
  /** Gastos de peaje y aparcamiento justificados con factura (€) */
  peajeAparcamiento?: number;
  /** Importe factura transporte público justificado (€) */
  importeTransportePublico?: number;
  /** Importe pagado por la empresa por vehículo de empresa (€) — normalmente 0, lo paga la empresa */
  importeVehiculoEmpresa?: number;
}

export interface GastoManutencion {
  zona: ZonaDesplazamiento;
  tipoDesplazamiento: TipoDesplazamiento;
  /** Número de días de desplazamiento */
  dias: number;
  /** Importe total de dietas pagadas por la empresa (€) */
  importePagadoEmpresa: number;
  /** Gastos de estancia/hotel justificados con factura (€) — solo si pernocta */
  gastosEstanciaJustificados?: number;
}

export interface ParametrosDietasIRPF {
  /** Gastos de locomoción del período */
  locomocion?: GastoLocomocion[];
  /** Gastos de manutención y estancia del período */
  manutencion?: GastoManutencion[];
}

export interface ResultadoDietasIRPF {
  // Locomoción
  /** Importe exento por locomoción (€) */
  locomocionExenta: number;
  /** Importe sujeto a IRPF por locomoción (€) */
  locomocionSujeta: number;

  // Manutención
  /** Límite máximo de dietas exentas (€) */
  limiteManutenciónExenta: number;
  /** Importe exento por manutención y estancia (€) */
  manutencionExenta: number;
  /** Importe sujeto a IRPF por manutención (€) */
  manutencionSujeta: number;

  // Totales
  /** **Total exento de IRPF (€)** */
  totalExento: number;
  /** **Total sujeto a IRPF (€)** */
  totalSujeto: number;
  /** Total percibido del empleador (€) */
  totalPercibido: number;

  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularDietasIRPF(p: ParametrosDietasIRPF): ResultadoDietasIRPF {
  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // ── Locomoción ────────────────────────────────────────────────────────────
  let locomocionExenta = 0;
  let locomocionSujeta = 0;

  for (const loc of (p.locomocion ?? [])) {
    if (loc.tipo === 'vehiculo_propio') {
      const km = loc.kilometros ?? 0;
      const limiteKm = r(km * LIMITE_KM_VEHICULO_PROPIO);
      const peaje = loc.peajeAparcamiento ?? 0;
      const exento = r(limiteKm + peaje);
      locomocionExenta += exento;
      // (lo que cobra el trabajador menos lo exento va a sujeto — aquí asumimos que cobra exactamente el límite exento)
    } else if (loc.tipo === 'transporte_publico') {
      locomocionExenta += r(loc.importeTransportePublico ?? 0);
    }
    // vehículo empresa: no genera dieta para el trabajador
  }
  locomocionExenta = r(locomocionExenta);

  // ── Manutención ───────────────────────────────────────────────────────────
  let limiteManutenciónExenta = 0;
  let manutencionExenta = 0;
  let manutencionSujeta = 0;

  for (const man of (p.manutencion ?? [])) {
    let limiteDiario: number;
    if (man.tipoDesplazamiento === 'transportista') {
      limiteDiario = man.zona === 'espana' ? LIMITE_TRANSPORTISTA_ESPANA : LIMITE_TRANSPORTISTA_EXTRAN;
    } else if (man.tipoDesplazamiento === 'con_pernocta') {
      limiteDiario = man.zona === 'espana' ? LIMITE_MANUTENCION_ESPANA_PERNOCTA : LIMITE_MANUTENCION_EXTRAN_PERNOCTA;
    } else {
      limiteDiario = man.zona === 'espana' ? LIMITE_MANUTENCION_ESPANA_SIN_PERNOCTA : LIMITE_MANUTENCION_EXTRAN_SIN_PERNOCTA;
    }

    const limiteManutTotal = r(limiteDiario * man.dias);
    const estanciaExenta = man.tipoDesplazamiento === 'con_pernocta' ? r(man.gastosEstanciaJustificados ?? 0) : 0;
    const limiteTotal = r(limiteManutTotal + estanciaExenta);

    limiteManutenciónExenta += limiteTotal;
    const exentoPeriodo = Math.min(man.importePagadoEmpresa, limiteTotal);
    const sujetoPeriodo = Math.max(0, man.importePagadoEmpresa - limiteTotal);
    manutencionExenta += exentoPeriodo;
    manutencionSujeta += sujetoPeriodo;
  }
  limiteManutenciónExenta = r(limiteManutenciónExenta);
  manutencionExenta = r(manutencionExenta);
  manutencionSujeta = r(manutencionSujeta);

  const totalExento = r(locomocionExenta + manutencionExenta);
  const totalSujeto = r(locomocionSujeta + manutencionSujeta);
  const totalPercibido = r(totalExento + totalSujeto);

  // ── Advertencias ──────────────────────────────────────────────────────────
  advertencias.push(`Vehículo propio: límite 2025 = ${LIMITE_KM_VEHICULO_PROPIO} €/km (subido de 0,19 €/km desde enero 2023 por RD 7/2023). Peajes y aparcamientos justificados con factura también exentos.`);
  advertencias.push('Las dietas solo están exentas si el desplazamiento es a un MUNICIPIO DIFERENTE al del lugar de trabajo habitual y al del domicilio del trabajador. Los desplazamientos dentro del mismo municipio de trabajo NO generan dieta exenta.');
  advertencias.push('El exceso de dietas sobre los límites del RIRPF art. 9 es rendimiento del trabajo sujeto a IRPF y a cotización a la Seguridad Social. La empresa debe incluirlo en el modelo 190 (retenciones del trabajo).');
  advertencias.push('Gastos de estancia (hotel): exentos sin límite cuantitativo, pero SIEMPRE con factura completa a nombre de la empresa o del trabajador. Sin factura, no hay exención.');
  if ((p.manutencion ?? []).some(m => m.tipoDesplazamiento === 'transportista')) {
    advertencias.push(`Transportistas: límite especial de ${LIMITE_TRANSPORTISTA_ESPANA} €/día (España) y ${LIMITE_TRANSPORTISTA_EXTRAN} €/día (extranjero), aplicable a conductores de vehículos de transporte. No aplica a cualquier trabajador que viaje.`);
  }

  return {
    locomocionExenta,
    locomocionSujeta,
    limiteManutenciónExenta,
    manutencionExenta,
    manutencionSujeta,
    totalExento,
    totalSujeto,
    totalPercibido,
    advertencias,
    fuenteDatos: 'RIRPF art. 9 (RD 439/2007, actualizado RD 7/2023) — vigente 2025',
  };
}
