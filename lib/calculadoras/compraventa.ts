/**
 * Calculadora de Gastos de Compraventa Inmobiliaria — lógica pura sin React ni DOM
 * Usada por: MCP de Delegum · /chatgpt/compraventa
 *
 * Cubre los gastos del comprador (ITP/IVA, AJD, notaría, registro, gestoría)
 * y los del vendedor (plusvalía municipal IIVTNU, IRPF sobre ganancia patrimonial).
 *
 * Fuente: data/fiscal/inmuebles.ts · el ITP y el AJD, del motor de las apps (data/itp-ccaa.ts)
 *
 * Hasta el 09/10/2026 (cabo C0004) el ITP era el tipo PLANO de TIPOS_ITP_CCAA_2025: sin el
 * umbral valenciano (1.200.000 € → 108.000 € en vez de 132.000 €, Ley 13/1997 art. 13.Uno),
 * sin las escalas (Cataluña, 1.000.000 € al 10 % plano), sin el tipo vasco de lo que no es
 * vivienda (un local al 4 % en vez del 7 %) y aplicando el reducido de un perfil sin mirar sus
 * condiciones. El AJD era un 1,5 % igual en todas partes. Ahora los dos salen de las mismas
 * funciones que las siete apps del clúster de compraventa (`itpSegunApps`, `ajdSegunApps`),
 * que usa también gastosCompraInmueble.ts.
 *
 * Hasta el 18/10/2026 (cabo C0209, decisión del usuario del 17/10) la notaría y el registro eran
 * una estimación porcentual con mínimo y máximo (COSTES_COMPRAVENTA_2025: 0,3 % y 0,2 %), que no
 * llevaba la rebaja del 5 % del nº 2.1 de los aranceles ni sabía que en Canarias, Ceuta y Melilla
 * no se factura IVA: Madrid 200.000 € daba 600 € de notaría y 400 € de registro, y las apps, 721,04
 * y 224,96 €. Ahora salen de las mismas funciones que ellas (`honorariosSegunApps`).
 *
 * Hasta el 26/10/2026 (hito unificar-app-motor) el lado del VENDEDOR era una copia propia: no
 * restaba la plusvalía del valor de transmisión (art. 35.1 LIRPF: 14.980 € de IRPF donde la app
 * da 14.324,50), cobraba plusvalía vendiendo con pérdida (no sujeción del art. 104.5 TRLRHL) y
 * no sabía de Ceuta, Melilla ni territorio foral. Ahora es el cálculo de la pestaña Vendedor de
 * estimador-compraventa-inmueble: `calcularPlusvaliaMunicipal` y `calcularGananciaInmueble`. En el
 * mismo cambio, el garaje dejó de pagar ITP de vivienda habitual (hallazgo 833 de la app) y la
 * gestoría pasó a ser la de la app (`GESTORIA_POR_DEFECTO`), no 500 €.
 */

import {
  IVA_INMUEBLES_2025,
  coeficienteIIVTNU,
  calcularGananciaInmueble,
  PORCENTAJES_IVA,
  BONIFICACION_IIVTNU_CEUTA_MELILLA,
  DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA,
  PLUSVALIA_MUNICIPAL_META,
  FISCAL_INMUEBLES_META,
} from '@/data/fiscal';
import {
  ITP_CCAA,
  elegirTipoITP,
  importeITP,
  calcularAJD,
  tipoAJD,
  describirSubidaITP,
  CIUDADES_CON_BONIFICACION,
  TERRITORIOS_SIN_IVA,
  calcularNotario,
  calcularRegistro,
  honorariosLlevanIVA,
  notariaDeLibreAcuerdo,
  LIMITE_ARANCEL_NOTARIAL,
  GESTORIA_POR_DEFECTO,
  calcularPlusvaliaMunicipal,
  TERRITORIOS_IIVTNU_FORAL,
  motivoPlusvaliaForal,
  avisoIrpfForalResidente,
  TERRITORIOS_IRPF_FORAL,
  AVISO_IRPF_FORAL,
  normaliza,
  type ComunidadAutonoma,
  type ContextoAJD,
  type ObjetoTransmision,
  type PerfilComprador,
} from '@/data/itp-ccaa';
import { formatNumber } from '@/lib/formatters';

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
  /**
   * Obra nueva o VPO en Canarias, Ceuta o Melilla: no rige el IVA sino el IGIC o el IPSI, que no
   * se calcula. `importeImpuesto` vale 0 y el total va sin él (cabo C0184).
   */
  impuestoNoCalculado: boolean;
  ajd: number;
  notaria: number;
  registro: number;
  gestoria: number;
  totalGastos: number;
  totalOperacion: number;
  notaITP: string;
  /** De dónde salen la notaría y el registro, y lo que dejan fuera (IGIC o IPSI, libre acuerdo). */
  notaHonorarios: string;
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

const pct = (t: number) => `${formatNumber(t, Number.isInteger(t) ? 0 : 2)} %`;

/** La clave del motor de las apps para una comunidad dada por su clave o por su nombre. */
export function claveCCAA(ccaa: string): ComunidadAutonoma {
  const n = normaliza(ccaa.trim());
  const claves = Object.keys(ITP_CCAA) as ComunidadAutonoma[];
  const clave = claves.find(c => c === n || normaliza(ITP_CCAA[c].nombre) === n);
  if (!clave) throw new Error(`Comunidad autónoma no reconocida: «${ccaa}».`);
  return clave;
}

/**
 * ITP de una compra de segunda mano con el motor de las apps del clúster: escalas, umbral
 * valenciano, tipo propio de lo que no es vivienda, bonificación de Ceuta y Melilla y tipos
 * reducidos aplicados solo cuando el perfil cubre TODAS sus condiciones. Los que exigen algo
 * que no se pregunta (renta, municipio…) no se aplican: se nombran en la nota.
 */
export function itpSegunApps(
  precio: number,
  ccaa: ComunidadAutonoma,
  perfil: PerfilCompradorMCP,
  { objeto, viviendaHabitual }: { objeto: ObjetoTransmision; viviendaHabitual: boolean }
): { importe: number; tipoEfectivo: number; nota: string } {
  const perfilApps = perfil.replace('_', '-') as PerfilComprador;
  const elegido = elegirTipoITP(ccaa, perfilApps, precio, { viviendaHabitual, objeto });
  const importe = Math.round(importeITP(precio, ccaa, elegido) * 100) / 100;
  const tipoEfectivo = Math.round((importe / precio) * 10000) / 100;
  const nombre = ITP_CCAA[ccaa].nombre;
  const partes: string[] = [];
  if (elegido.esReducido) {
    partes.push(`Tipo reducido del ${pct(elegido.tipo)} en ${nombre}: ${elegido.nombre ?? 'perfil especial'}.`);
  } else {
    const subida = describirSubidaITP(ccaa);
    partes.push(subida
      ? `En ${nombre} ${subida}.`
      : `Tipo general del ${pct(elegido.tipo)} en ${nombre}.`);
    if (CIUDADES_CON_BONIFICACION.includes(ccaa)) {
      partes.push('Incluye la bonificación del 50 % de la cuota (art. 57 bis TRLITPAJD).');
    }
  }
  if (elegido.noComprobables.length) {
    partes.push(
      'Podría pagar menos si cumple requisitos que este cálculo no pregunta: ' +
      elegido.noComprobables
        .map(r => `${r.nombre} (${pct(r.tipo)}${r.condiciones.length ? `; ${r.condiciones.join(', ')}` : ''})`)
        .join(' · ') +
      '.'
    );
  }
  return { importe, tipoEfectivo, nota: partes.join(' ') };
}

/** AJD de la primera copia con el tipo de la comunidad (y la bonificación de Ceuta y Melilla). */
export function ajdSegunApps(precio: number, ccaa: ComunidadAutonoma, contexto: ContextoAJD): number {
  return Math.round(calcularAJD(precio, ccaa, contexto) * 100) / 100;
}

/**
 * Notaría y registro con el motor de las apps: la notaría es el punto medio de la horquilla de la
 * factura (1,5 a 2 veces el arancel del RD 1426/1989, `calcularNotario`) y el registro, el arancel
 * del RD 1427/1989 con presentación y nota simple (`calcularRegistro`); los dos con la rebaja del
 * 5 % del nº 2.1 y con IVA solo donde rige. La nota dice lo que la cifra deja fuera.
 */
export function honorariosSegunApps(
  precio: number,
  ccaa: ComunidadAutonoma,
): { notaria: number; registro: number; nota: string } {
  const notaria = Math.round(calcularNotario(precio, ccaa) * 100) / 100;
  const registro = Math.round(calcularRegistro(precio, ccaa) * 100) / 100;
  const partes = [
    'Notaría: punto medio de la factura habitual (1,5 a 2 veces el arancel del RD 1426/1989, por las copias y los folios); registro: arancel del RD 1427/1989.',
  ];
  if (!honorariosLlevanIVA(ccaa)) {
    const impuesto = TERRITORIOS_SIN_IVA[ccaa]?.impuesto ?? 'impuesto indirecto';
    partes.push(`En ${ITP_CCAA[ccaa].nombre} las dos facturas no llevan IVA sino ${impuesto}, que se cobra aparte y no está en estas cifras.`);
  }
  if (notariaDeLibreAcuerdo(precio)) {
    partes.push(`Lo que el precio excede de ${formatNumber(LIMITE_ARANCEL_NOTARIAL, 2)} € es de libre acuerdo con el notario: esa parte no está en la cifra.`);
  }
  return { notaria, registro, nota: partes.join(' ') };
}

const esResidencialObjeto = (t: TipoInmuebleMCP): boolean => t === 'vivienda' || t === 'garaje';

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularCompraventa(p: ParametrosCompraventa): ResultadoCompraventa {
  if (p.precioInmueble <= 0) throw new Error('El precio del inmueble debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const ccaa = claveCCAA(p.ccaa);
  const ccaaNombre = ITP_CCAA[ccaa].nombre;
  const tipoInmueble = p.tipoInmueble ?? 'vivienda';
  // AJD e IVA: el garaje va con la vivienda (objeto «vivienda» del motor); local y terreno, aparte
  const objeto: ObjetoTransmision = esResidencialObjeto(tipoInmueble) ? 'vivienda' : 'otro';
  // ITP: solo la vivienda es vivienda. Un garaje con su precio propio es un garaje SUELTO, que
  // no es vivienda habitual nunca y en el País Vasco paga el 7 % y no el 4 % (hallazgo 833 de
  // estimador-compraventa-inmueble: Andalucía, 25.000 €, joven, 875 € donde son 1.750 €).
  const objetoITP: ObjetoTransmision = tipoInmueble === 'vivienda' ? 'vivienda' : 'otro';
  const perfil = p.perfilComprador ?? 'general';
  const esResidencial = tipoInmueble === 'vivienda' || tipoInmueble === 'garaje';

  // ── COMPRADOR ────────────────────────────────────────────────────────────────

  let tipoImpuesto: string;
  let porcentajeImpuesto: number;
  let importeImpuesto: number;
  let notaITP: string;
  let impuestoNoCalculado = false;
  /** Canarias (IGIC), Ceuta y Melilla (IPSI): allí no se cobra IVA (hallazgo 156 de las apps) */
  const sinIva = TERRITORIOS_SIN_IVA[ccaa];

  if (p.tipoTransmision !== 'segunda_mano' && sinIva) {
    // Hasta el 16/10/2026 cobraba el 10 o el 4 % de IVA también aquí (cabo C0184). Como las
    // apps: se nombra el impuesto que corresponde y no se inventa cifra. El AJD sí se devenga.
    tipoImpuesto = `${sinIva.impuesto} (no calculado)`;
    porcentajeImpuesto = 0;
    importeImpuesto = 0;
    impuestoNoCalculado = true;
    notaITP = `En ${ccaaNombre} no rige el IVA: la ${p.tipoTransmision === 'vpo' ? 'vivienda protegida' : 'obra nueva'} tributa por el ${sinIva.impuesto} (${sinIva.nombre}), con sus propios tipos, que este cálculo no incluye. El total de gastos va sin él.`;
  } else if (p.tipoTransmision === 'vpo') {
    tipoImpuesto = 'IVA (VPO)';
    porcentajeImpuesto = IVA_INMUEBLES_2025.viviendaProtegida;
    importeImpuesto = r(p.precioInmueble * porcentajeImpuesto / 100);
    notaITP = 'IVA superreducido 4% para vivienda de protección oficial';
  } else if (p.tipoTransmision === 'obra_nueva') {
    tipoImpuesto = 'IVA (obra nueva)';
    // Cada rama con SU constante, como la app (hallazgos 674 y 770): hoy valen 10, 10 y 21
    porcentajeImpuesto = tipoInmueble === 'vivienda'
      ? IVA_INMUEBLES_2025.obraNueva
      : esResidencial
        ? IVA_INMUEBLES_2025.anejoVinculado
        : PORCENTAJES_IVA.general;
    importeImpuesto = r(p.precioInmueble * porcentajeImpuesto / 100);
    notaITP = `IVA ${porcentajeImpuesto}% (${esResidencial ? 'residencial' : 'comercial/industrial'})`;
  } else {
    const itp = itpSegunApps(p.precioInmueble, ccaa, perfil, { objeto: objetoITP, viviendaHabitual: objetoITP === 'vivienda' });
    tipoImpuesto = 'ITP (segunda mano)';
    porcentajeImpuesto = itp.tipoEfectivo;
    importeImpuesto = itp.importe;
    notaITP = itp.nota;
  }

  // AJD y ITP son incompatibles sobre el mismo acto (art. 31.2 TRLITP): en segunda mano
  // (sujeta a ITP) no se devenga AJD gradual. Solo aplica en obra nueva y VPO (sujetas a IVA).
  const ajd = p.tipoTransmision === 'segunda_mano'
    ? 0
    : ajdSegunApps(p.precioInmueble, ccaa, { objeto });
  // Como las apps: el AJD de la vivienda habitual no se da por hecho, se avisa (Valencia, 0,1 %)
  if (ajd > 0 && objeto === 'vivienda') {
    const habitual = tipoAJD(ccaa, { objeto, viviendaHabitual: true });
    if (habitual.motivo === 'vivienda-habitual') {
      notaITP += ` Si va a ser la vivienda habitual, el AJD baja al ${pct(habitual.tipo)}: ` +
        `${formatNumber(ajdSegunApps(p.precioInmueble, ccaa, { objeto, viviendaHabitual: true }), 2)} €.`;
    }
  }

  // Notaría y registro: los aranceles, como las apps (cabo C0209)
  const { notaria, registro, nota: notaHonorarios } = honorariosSegunApps(p.precioInmueble, ccaa);

  // Gestoría: la que propone la app, que tiene un solo campo para cualquier tipo de inmueble
  const gestoria = GESTORIA_POR_DEFECTO.vivienda;

  const totalGastos = r(importeImpuesto + ajd + notaria + registro + gestoria);
  const totalOperacion = r(p.precioInmueble + totalGastos);

  const comprador: GastosComprador = {
    precioInmueble: p.precioInmueble,
    tipoImpuesto,
    porcentajeImpuesto,
    importeImpuesto,
    impuestoNoCalculado,
    ajd,
    notaria,
    registro,
    gestoria,
    totalGastos,
    totalOperacion,
    notaITP,
    notaHonorarios,
  };

  // ── VENDEDOR (solo si se proporcionan datos) ──────────────────────────────────

  let vendedor: GastosVendedor | null = null;

  if (p.precioCompraOriginal !== undefined || p.valorCatastralSuelo !== undefined) {
    // Plusvalía municipal (IIVTNU), con la función de la pestaña Vendedor de la app
    let plusvaliaMunicipal: number | null = null;
    let metodoPlusvalia = '';
    const compra = p.precioCompraOriginal;
    // Sin incremento no hay plusvalía (art. 104.5 TRLRHL), y para saberlo bastan los dos precios
    const sinIncremento = compra !== undefined && compra > 0 && p.precioInmueble <= compra;

    if (TERRITORIOS_IIVTNU_FORAL.includes(ccaa)) {
      metodoPlusvalia = `No calculada: ${motivoPlusvaliaForal(ccaa)}.`;
    } else if (sinIncremento || (p.valorCatastralSuelo && p.aniosTenencia !== undefined)) {
      // Años completos, tope en 20 y prorrateo por meses bajo el año: coeficienteIIVTNU
      // (hallazgos 1559 y 1560, 24/09/2026), que es la que usa calcularPlusvaliaMunicipal.
      const tipoMunicipal = Math.min(p.tipoMunicipalIIVTNU ?? PLUSVALIA_MUNICIPAL_META.tipoOrientativo, PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal);
      const pm = calcularPlusvaliaMunicipal({
        valorCatastralSuelo: p.valorCatastralSuelo ?? 0,
        aniosPropiedad: p.aniosTenencia ?? 0,
        // Sin el precio de compra no se puede comprobar la no sujeción: va el objetivo
        precioCompra: compra ?? 0,
        precioVenta: p.precioInmueble,
        ccaa,
        tipoMaximo: tipoMunicipal,
      });
      plusvaliaMunicipal = r(pm.recomendado);
      if (pm.exento && compra !== undefined) {
        metodoPlusvalia = 'No sujeta: vendiendo por el precio de compra o por debajo no hay incremento de valor (art. 104.5 TRLRHL).';
      } else {
        const coefData = coeficienteIIVTNU(p.aniosTenencia ?? 0);
        const tramo = coefData.prorrateado
          ? `${coefData.label}, prorrateado por ${coefData.meses} meses${coefData.cotaSuperior ? ' (máximo: sin los meses exactos)' : ''}`
          : coefData.label;
        metodoPlusvalia = `Método objetivo: valor catastral suelo (${formatNumber(p.valorCatastralSuelo ?? 0, 2)} €) × coeficiente ${pm.coeficiente.toLocaleString('es-ES', { maximumFractionDigits: 4 })} (${tramo}) × tipo ${pct(tipoMunicipal)}`;
        if (pm.bonificadaCiudad) metodoPlusvalia += `, con la bonificación del ${BONIFICACION_IIVTNU_CEUTA_MELILLA.porcentaje} % de la cuota de ${ccaaNombre} (art. 159.2 TRLRHL)`;
        if (compra === undefined) metodoPlusvalia += '. Sin el precio de compra no se ha podido comprobar si hay incremento de valor: vendiendo por debajo de lo que costó no se paga (art. 104.5 TRLRHL)';
        metodoPlusvalia += '.';
      }
    }

    // IRPF sobre la ganancia patrimonial: el motor único del art. 35 LIRPF de las apps
    let gananciaPatrimonial: number | null = null;
    let irpfGananciaPatrimonial: number | null = null;
    let exentoIRPF = false;
    let motivoExencion = '';
    let avisoIRPF = '';

    if (compra !== undefined) {
      const g = calcularGananciaInmueble({
        precioVenta: p.precioInmueble,
        precioCompra: compra,
        // La plusvalía minora el valor de transmisión (art. 35.1 LIRPF)
        plusvaliaMunicipal: plusvaliaMunicipal ?? 0,
        exentoPorEdad: !!(p.vendedorMayor65 && p.esViviendaHabitual),
        // Ceuta y Melilla: la deducción del 60 % del art. 68.4 LIRPF
        inmuebleEnCeutaMelilla: CIUDADES_CON_BONIFICACION.includes(ccaa),
      });
      gananciaPatrimonial = r(g.ganancia);
      // Vende su vivienda habitual en el País Vasco o Navarra: reside allí y su IRPF es foral
      const avisoForal = avisoIrpfForalResidente(ccaa, !!p.esViviendaHabitual);

      if (g.esPerdida) {
        exentoIRPF = true;
        motivoExencion = 'No hay ganancia patrimonial (venta con pérdida o sin ganancia)';
        irpfGananciaPatrimonial = 0;
      } else if (avisoForal) {
        motivoExencion = `IRPF no calculado: ${avisoForal}.`;
      } else if (g.exentaPorEdad > 0) {
        exentoIRPF = true;
        // La app no la aplica sin los tres años de residencia del art. 41 bis RIRPF
        motivoExencion = `${g.motivoExencion}, siempre que haya sido su residencia habitual al menos tres años (art. 41 bis RIRPF).`;
        irpfGananciaPatrimonial = 0;
      } else {
        irpfGananciaPatrimonial = r(g.cuotaIRPF);
        // Puede no residir allí (no vende su vivienda habitual): la cuota estatal, con el aviso
        if (TERRITORIOS_IRPF_FORAL.includes(ccaa) && g.cuotaIRPF > 0) avisoIRPF = ` ${AVISO_IRPF_FORAL}`;
        if (g.deduccionCeutaMelilla > 0) {
          avisoIRPF = ` El IRPF lleva la deducción del ${DEDUCCION_IRPF_RENTAS_CEUTA_MELILLA.porcentaje} % por ganancias de inmuebles situados en ${ccaaNombre} (art. 68.4 LIRPF): ${formatNumber(g.deduccionCeutaMelilla, 2)} € menos.`;
        }
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
      nota: `${PLUSVALIA_MUNICIPAL_META.nota} El IRPF sobre la ganancia es orientativo: resta la plusvalía municipal del valor de transmisión (art. 35.1 LIRPF), pero no los impuestos y gastos de aquella compra, las mejoras ni los gastos de la venta, que bajarían la ganancia.${avisoIRPF}`,
    };
  }

  return {
    comprador,
    vendedor,
    ccaaNombre,
    fuenteDatos: `${FISCAL_INMUEBLES_META.fuente} — verificado ${FISCAL_INMUEBLES_META.verificado}`,
  };
}
