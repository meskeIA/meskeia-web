/**
 * Calculadora de Gastos de Compraventa Inmobiliaria — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_compraventa_inmueble)
 *
 * Cubre los gastos del comprador (ITP/IVA, AJD, notaría, registro, gestoría)
 * y los del vendedor (plusvalía municipal IIVTNU, IRPF sobre ganancia patrimonial).
 *
 * Fuente: data/fiscal/inmuebles.ts
 */

import {
  TIPOS_ITP_CCAA_2025,
  IVA_INMUEBLES_2025,
  TIPOS_AJD_2025,
  COSTES_COMPRAVENTA_2025,
  COEFICIENTES_IIVTNU_2025,
  PLUSVALIA_MUNICIPAL_META,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  FISCAL_INMUEBLES_META,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoTransmision = 'segunda_mano' | 'obra_nueva' | 'vpo';
export type TipoInmuebleMCP = 'vivienda' | 'local_comercial' | 'garaje' | 'terreno';
export type PerfilCompradorMCP = 'general' | 'joven' | 'familia_numerosa' | 'discapacidad';

export interface ParametrosCompraventa {
  /** Precio de compraventa en euros */
  precioInmueble: number;
  /** Comunidad autónoma donde se ubica el inmueble */
  ccaa: string;
  /** Tipo de transmisión */
  tipoTransmision: TipoTransmision;
  /** Tipo de inmueble (afecta al IVA en obra nueva) */
  tipoInmueble?: TipoInmuebleMCP;
  /** Perfil del comprador (puede acceder a tipo reducido de ITP) */
  perfilComprador?: PerfilCompradorMCP;
  // ── Datos del vendedor (opcionales — solo si se quieren calcular gastos del vendedor) ──
  /** Precio de compra original del inmueble (para calcular ganancia patrimonial IRPF) */
  precioCompraOriginal?: number;
  /** Años de tenencia del inmueble (para plusvalía municipal) */
  aniosTenencia?: number;
  /** Valor catastral del suelo en euros (para plusvalía municipal IIVTNU) */
  valorCatastralSuelo?: number;
  /** Si el vendedor tiene más de 65 años (posible exención IRPF en vivienda habitual) */
  vendedorMayor65?: boolean;
  /** Si es la vivienda habitual del vendedor (exención IRPF mayores 65 y reinversión) */
  esViviendaHabitual?: boolean;
  /** Tipo municipal del IIVTNU que aplica el Ayuntamiento (%). Por defecto: 25% orientativo */
  tipoMunicipalIIVTNU?: number;
}

export interface GastosComprador {
  precioInmueble: number;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  importeImpuesto: number;
  ajd: number;
  notaria: number;
  registro: number;
  gestoria: number;
  totalGastos: number;
  totalOperacion: number;
  notaITP: string;
}

export interface GastosVendedor {
  plusvaliaMunicipal: number | null;
  metodoPlusvalia: string;
  gananciaPatrimonial: number | null;
  irpfGananciaPatrimonial: number | null;
  exentoIRPF: boolean;
  motivoExencion: string;
  totalGastosVendedor: number;
  nota: string;
}

export interface ResultadoCompraventa {
  comprador: GastosComprador;
  vendedor: GastosVendedor | null;
  ccaaNombre: string;
  fuenteDatos: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTipoITP(ccaaNombre: string, perfil: PerfilCompradorMCP): { tipo: number; nota: string } {
  const datos = TIPOS_ITP_CCAA_2025.find(
    t => t.ccaa.toLowerCase().replace(/[íóáéú]/g, c => ({ í: 'i', ó: 'o', á: 'a', é: 'e', ú: 'u' }[c] ?? c))
      === ccaaNombre.toLowerCase().replace(/[íóáéú]/g, c => ({ í: 'i', ó: 'o', á: 'a', é: 'e', ú: 'u' }[c] ?? c))
  );

  if (!datos) return { tipo: 8, nota: 'CCAA no encontrada — usando media orientativa del 8%' };

  const usaReducido = perfil !== 'general' && datos.reducido !== undefined;
  return {
    tipo: usaReducido ? (datos.reducido ?? datos.tipo) : datos.tipo,
    nota: usaReducido
      ? `Tipo reducido ${datos.reducido}% — ${datos.notaReducido ?? 'perfil especial'}`
      : `Tipo general ${datos.tipo}% en ${datos.ccaa}`,
  };
}

function calcularIRPFGanancia(ganancia: number): number {
  if (ganancia <= 0) return 0;
  let impuesto = 0;
  let base = ganancia;
  let prevHasta = 0;

  for (const tramo of TRAMOS_GANANCIAS_PATRIMONIALES_2025) {
    if (base <= 0) break;
    const tranche = Math.min(base, tramo.hasta === Infinity ? base : tramo.hasta - prevHasta);
    impuesto += tranche * (tramo.tipo / 100);
    base -= tranche;
    prevHasta = tramo.hasta;
  }
  return impuesto;
}

function normalizarCCAA(ccaa: string): string {
  // Mapeo de claves internas a nombres que coincidan con TIPOS_ITP_CCAA_2025
  const mapa: Record<string, string> = {
    'madrid': 'Madrid',
    'andalucia': 'Andalucía',
    'cataluna': 'Cataluña',
    'valencia': 'Valencia',
    'galicia': 'Galicia',
    'castilla-leon': 'Castilla y León',
    'castilla-mancha': 'Castilla-La Mancha',
    'aragon': 'Aragón',
    'baleares': 'Baleares',
    'canarias': 'Canarias',
    'cantabria': 'Cantabria',
    'asturias': 'Asturias',
    'extremadura': 'Extremadura',
    'murcia': 'Murcia',
    'rioja': 'La Rioja',
    'pais-vasco': 'País Vasco',
    'navarra': 'Navarra',
  };
  return mapa[ccaa.toLowerCase()] ?? ccaa;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularCompraventa(p: ParametrosCompraventa): ResultadoCompraventa {
  if (p.precioInmueble <= 0) throw new Error('El precio del inmueble debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const ccaaNombre = normalizarCCAA(p.ccaa);
  const tipoInmueble = p.tipoInmueble ?? 'vivienda';
  const perfil = p.perfilComprador ?? 'general';
  const esResidencial = tipoInmueble === 'vivienda' || tipoInmueble === 'garaje';

  // ── COMPRADOR ────────────────────────────────────────────────────────────────

  let tipoImpuesto: string;
  let porcentajeImpuesto: number;
  let importeImpuesto: number;
  let notaITP: string;

  if (p.tipoTransmision === 'vpo') {
    tipoImpuesto = 'IVA (VPO)';
    porcentajeImpuesto = IVA_INMUEBLES_2025.viviendaProtegida;
    importeImpuesto = r(p.precioInmueble * porcentajeImpuesto / 100);
    notaITP = 'IVA superreducido 4% para vivienda de protección oficial';
  } else if (p.tipoTransmision === 'obra_nueva') {
    tipoImpuesto = 'IVA (obra nueva)';
    porcentajeImpuesto = esResidencial ? IVA_INMUEBLES_2025.obraNueva : IVA_INMUEBLES_2025.local;
    importeImpuesto = r(p.precioInmueble * porcentajeImpuesto / 100);
    notaITP = `IVA ${porcentajeImpuesto}% (${esResidencial ? 'residencial' : 'comercial/industrial'})`;
  } else {
    const { tipo, nota } = getTipoITP(ccaaNombre, perfil);
    tipoImpuesto = 'ITP (segunda mano)';
    porcentajeImpuesto = tipo;
    importeImpuesto = r(p.precioInmueble * tipo / 100);
    notaITP = nota;
  }

  // AJD: en hipotecas lo paga el banco (Ley 5/2019); en compraventa sin hipoteca, el comprador
  // Para el MCP calculamos solo el AJD de la escritura de compraventa (no de la hipoteca)
  const ajd = r(p.precioInmueble * TIPOS_AJD_2025.general / 100);

  // Notaría: arancel regulado, estimación porcentual con límites
  const notariaBase = p.precioInmueble * COSTES_COMPRAVENTA_2025.notaria.estimacion / 100;
  const notaria = r(Math.min(
    Math.max(notariaBase, COSTES_COMPRAVENTA_2025.notaria.minimo),
    COSTES_COMPRAVENTA_2025.notaria.maximo,
  ));

  // Registro: arancel regulado, estimación porcentual con límites
  const registroBase = p.precioInmueble * COSTES_COMPRAVENTA_2025.registro.estimacion / 100;
  const registro = r(Math.min(
    Math.max(registroBase, COSTES_COMPRAVENTA_2025.registro.minimo),
    COSTES_COMPRAVENTA_2025.registro.maximo,
  ));

  // Gestoría: orientativo
  const gestoria = 500;

  const totalGastos = r(importeImpuesto + ajd + notaria + registro + gestoria);
  const totalOperacion = r(p.precioInmueble + totalGastos);

  const comprador: GastosComprador = {
    precioInmueble: p.precioInmueble,
    tipoImpuesto,
    porcentajeImpuesto,
    importeImpuesto,
    ajd,
    notaria,
    registro,
    gestoria,
    totalGastos,
    totalOperacion,
    notaITP,
  };

  // ── VENDEDOR (solo si se proporcionan datos) ──────────────────────────────────

  let vendedor: GastosVendedor | null = null;

  if (p.precioCompraOriginal !== undefined || p.valorCatastralSuelo !== undefined) {
    // Plusvalía municipal (IIVTNU)
    let plusvaliaMunicipal: number | null = null;
    let metodoPlusvalia = '';

    if (p.valorCatastralSuelo && p.aniosTenencia !== undefined) {
      const anios = Math.min(Math.max(0, Math.floor(p.aniosTenencia)), 20);
      const coefData = COEFICIENTES_IIVTNU_2025.find(c => c.anios === anios)
        ?? COEFICIENTES_IIVTNU_2025[COEFICIENTES_IIVTNU_2025.length - 1];
      const tipoMunicipal = Math.min(p.tipoMunicipalIIVTNU ?? PLUSVALIA_MUNICIPAL_META.tipoOrientativo, PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal);
      const baseImponibleIIVTNU = r(p.valorCatastralSuelo * coefData.coeficiente);
      plusvaliaMunicipal = r(baseImponibleIIVTNU * tipoMunicipal / 100);
      metodoPlusvalia = `Método objetivo: valor catastral suelo (${p.valorCatastralSuelo.toLocaleString('es-ES')} €) × coeficiente ${coefData.coeficiente} (${coefData.label}) × tipo ${tipoMunicipal}%`;
    }

    // IRPF sobre ganancia patrimonial
    let gananciaPatrimonial: number | null = null;
    let irpfGananciaPatrimonial: number | null = null;
    let exentoIRPF = false;
    let motivoExencion = '';

    if (p.precioCompraOriginal !== undefined) {
      gananciaPatrimonial = r(p.precioInmueble - p.precioCompraOriginal);

      if (p.vendedorMayor65 && p.esViviendaHabitual) {
        exentoIRPF = true;
        motivoExencion = 'Exención por mayor de 65 años con vivienda habitual (art. 33.4.b LIRPF)';
        irpfGananciaPatrimonial = 0;
      } else if (gananciaPatrimonial <= 0) {
        exentoIRPF = true;
        motivoExencion = 'No hay ganancia patrimonial (venta con pérdida o sin ganancia)';
        irpfGananciaPatrimonial = 0;
      } else {
        irpfGananciaPatrimonial = r(calcularIRPFGanancia(gananciaPatrimonial));
      }
    }

    const totalGastosVendedor = r(
      (plusvaliaMunicipal ?? 0) + (irpfGananciaPatrimonial ?? 0)
    );

    vendedor = {
      plusvaliaMunicipal,
      metodoPlusvalia,
      gananciaPatrimonial,
      irpfGananciaPatrimonial,
      exentoIRPF,
      motivoExencion,
      totalGastosVendedor,
      nota: `${PLUSVALIA_MUNICIPAL_META.nota} El IRPF sobre ganancia es orientativo — no incluye mejoras, gastos de compra deducibles ni coeficientes de actualización.`,
    };
  }

  return {
    comprador,
    vendedor,
    ccaaNombre,
    fuenteDatos: `${FISCAL_INMUEBLES_META.fuente} — verificado ${FISCAL_INMUEBLES_META.verificado}`,
  };
}
