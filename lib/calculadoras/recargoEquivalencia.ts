/**
 * Calculadora de Recargo de Equivalencia del IVA
 * Usada por: MCP server (calcular_recargo_equivalencia)
 *
 * Calcula el IVA total a pagar por comerciantes minoristas sujetos al
 * regimen especial del recargo de equivalencia (LIVA arts. 148-163).
 * En este regimen, el proveedor cobra al comerciante el IVA normal
 * MAS el recargo de equivalencia; a cambio, el comerciante NO presenta
 * declaraciones de IVA por sus ventas al publico.
 *
 * Marco normativo:
 *   - LIVA arts. 148-163: regimen especial del recargo de equivalencia
 *   - RIVA arts. 59-61: desarrollo reglamentario
 *
 * QUIENES ESTAN OBLIGADOS:
 *   - Comerciantes minoristas (personas fisicas o comunidades de bienes)
 *   - Que vendan articulos al consumidor final (>80% ventas a particulares)
 *   - Actividades NO excluidas (inmuebles, vehiculos, objetos de arte/coleccion,
 *     joyeria, maquinaria industrial, suministros, etc. — ver lista LIVA art. 149)
 *
 * TIPOS DEL RECARGO DE EQUIVALENCIA (LIVA art. 161):
 *   - IVA al 21%: recargo 5,2%  → total que paga el comerciante: 21% + 5,2% = 26,2%
 *   - IVA al 10%: recargo 1,4%  → total: 10% + 1,4% = 11,4%
 *   - IVA al 4%:  recargo 0,5%  → total: 4% + 0,5% = 4,5%
 *   - IVA al 0%:  recargo 0%    → total: 0%
 *
 * FUNCIONAMIENTO:
 *   1. El PROVEEDOR cobra al comerciante: base + IVA + recargo de equivalencia
 *   2. El COMERCIANTE vende al publico con IVA pero NO hace declaracion de IVA
 *   3. El proveedor ingresa el IVA + recargo en Hacienda
 *   4. El comerciante NO puede deducir el IVA soportado en sus compras
 *
 * VENTAJA: simplificacion administrativa total (no hay Modelo 303)
 * DESVENTAJA: el recargo es un coste neto no recuperable para el comerciante
 *
 * Fuente: LIVA arts. 148-163 + RIVA arts. 59-61 - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_iva, calcular_modelo_303, calcular_precio_venta
 */

// --- Constantes ---

// Tipos IVA y recargos de equivalencia (LIVA art. 161)
const TIPOS_RECARGO: Record<number, number> = {
  21: 5.2,
  10: 1.4,
  4:  0.5,
  0:  0,
};

// --- Tipos publicos ---

export type TipoIVARecargo = 0 | 4 | 10 | 21;

export interface LineaCompraRecargo {
  descripcion?: string;
  baseImponible: number;
  tipoIVA: TipoIVARecargo;
}

export interface ParametrosRecargoEquivalencia {
  /** Lineas de compra al proveedor */
  compras: LineaCompraRecargo[];
  /** Precio de venta al publico (con IVA incluido) — para calcular margen bruto */
  precioVentaPublicoConIVA?: number;
  /** Margen comercial bruto aplicado sobre el precio de compra (%) */
  margenComercialPct?: number;
}

export interface ResultadoRecargoEquivalencia {
  /** Total base imponible de compras (EUR) */
  totalBaseImponible: number;
  /** Total IVA soportado en compras (EUR) */
  totalIVASoportado: number;
  /** Total recargo de equivalencia soportado (EUR) */
  totalRecargo: number;
  /** Total pagado al proveedor (base + IVA + recargo) (EUR) */
  totalPagadoProveedor: number;
  /** Recargo como % del precio de compra neto (sin IVA) */
  pctRecargoSobreBase: number;
  /** Precio de venta con IVA estimado si se aplica margen (EUR) */
  precioVentaEstimado: number;
  /** Margen neto real tras el recargo (EUR) */
  margenNetoRealTraRecargo: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularRecargoEquivalencia(p: ParametrosRecargoEquivalencia): ResultadoRecargoEquivalencia {
  if (!p.compras || p.compras.length === 0) throw new Error('Debe indicar al menos una linea de compra.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  let totalBaseImponible = 0;
  let totalIVASoportado = 0;
  let totalRecargo = 0;

  for (const linea of p.compras) {
    const tipoRecargo = TIPOS_RECARGO[linea.tipoIVA] ?? 0;
    totalBaseImponible += linea.baseImponible;
    totalIVASoportado += linea.baseImponible * linea.tipoIVA / 100;
    totalRecargo += linea.baseImponible * tipoRecargo / 100;
  }

  totalBaseImponible = r(totalBaseImponible);
  totalIVASoportado = r(totalIVASoportado);
  totalRecargo = r(totalRecargo);
  const totalPagadoProveedor = r(totalBaseImponible + totalIVASoportado + totalRecargo);
  const pctRecargoSobreBase = totalBaseImponible > 0 ? r(totalRecargo / totalBaseImponible * 100) : 0;

  // Precio de venta estimado con margen
  let precioVentaEstimado = 0;
  let margenNetoRealTraRecargo = 0;
  if (p.margenComercialPct !== undefined && p.margenComercialPct > 0) {
    // El margen se aplica sobre el coste total (base + recargo, sin IVA soportado ya que no es coste real en RE)
    // En recargo de equivalencia, el IVA repercutido en venta = ingreso de Hacienda, no es margen
    // Coste real = base + recargo (el IVA lo recauda el proveedor, no es coste neto real del comerciante)
    const costeNeto = r(totalBaseImponible + totalRecargo);
    const precioVentaSinIVA = r(costeNeto * (1 + p.margenComercialPct / 100));
    // IVA en venta al tipo predominante (estimamos el tipo medio)
    const tipoMedioIVA = totalBaseImponible > 0 ? totalIVASoportado / totalBaseImponible : 0.21;
    precioVentaEstimado = r(precioVentaSinIVA * (1 + tipoMedioIVA));
    margenNetoRealTraRecargo = r(precioVentaSinIVA - costeNeto);
  } else if (p.precioVentaPublicoConIVA) {
    const tipoMedioIVA = totalBaseImponible > 0 ? totalIVASoportado / totalBaseImponible : 0.21;
    const precioVentaSinIVA = r(p.precioVentaPublicoConIVA / (1 + tipoMedioIVA));
    const costeNeto = r(totalBaseImponible + totalRecargo);
    precioVentaEstimado = p.precioVentaPublicoConIVA;
    margenNetoRealTraRecargo = r(precioVentaSinIVA - costeNeto);
  }

  advertencias.push(
    'En el recargo de equivalencia, el comerciante NO puede deducir el IVA soportado en sus compras. ' +
    'El proveedor ingresa en Hacienda tanto el IVA como el recargo. ' +
    'El comerciante NO presenta el Modelo 303 (autoliquidacion trimestral de IVA).'
  );
  advertencias.push(
    'Tipos vigentes 2025 — recargo de equivalencia: ' +
    'IVA 21% + 5,2% recargo | IVA 10% + 1,4% recargo | IVA 4% + 0,5% recargo. ' +
    'El recargo es un COSTE NETO adicional que no se puede recuperar.'
  );
  advertencias.push(
    'Actividades excluidas del recargo de equivalencia: vehiculos, inmuebles, joyeria y metales preciosos, ' +
    'objetos de arte/antiguedades, maquinaria industrial, combustibles, materiales de construccion, ' +
    'tabaco y labores del tabaco, y otras (LIVA art. 149). ' +
    'Verifique si su actividad esta excluida — en ese caso tributa por el regimen general de IVA.'
  );

  return {
    totalBaseImponible,
    totalIVASoportado,
    totalRecargo,
    totalPagadoProveedor,
    pctRecargoSobreBase,
    precioVentaEstimado,
    margenNetoRealTraRecargo,
    advertencias,
    fuenteDatos: 'LIVA arts. 148-163 + RIVA arts. 59-61 - vigente 2025',
  };
}
