/**
 * Calculadora de Rendimiento del Capital Inmobiliario en IRPF
 * Usada por: MCP server (calcular_rendimiento_capital_inmobiliario)
 *
 * Calcula el rendimiento neto del capital inmobiliario declarable en el
 * IRPF por los ingresos obtenidos del arrendamiento de inmuebles
 * (vivienda, local, garaje, etc.), incluyendo todas las deducciones de
 * gastos permitidas y las reducciones aplicables.
 *
 * Marco normativo:
 *   - LIRPF arts. 22-24: rendimientos del capital inmobiliario
 *   - LIRPF art. 23: gastos deducibles
 *   - LIRPF art. 23.2: reduccion del arrendamiento de vivienda
 *   - Ley 12/2023 (Ley de Vivienda): nuevas reducciones desde 01/01/2024
 *   - RIRPF art. 13-15: reglas especiales
 *
 * GASTOS DEDUCIBLES (LIRPF art. 23.1):
 *   - Intereses de prestamos y gastos de financiacion para la adquisicion
 *   - IBI, tasa de basuras y otros tributos locales
 *   - Primas de seguro del inmueble (incendio, responsabilidad civil, etc.)
 *   - Gastos de reparacion y conservacion (NO mejoras que amplian capacidad)
 *   - Cuotas de comunidad de propietarios y derramas de conservacion
 *   - Gastos de administracion, gestion y vigilancia
 *   - Honorarios de abogados y procuradores en reclamaciones del inquilino
 *   - Gastos de formalizacion del contrato (Registro, notario)
 *   - AMORTIZACION: 3% sobre el mayor de (valor catastral de la construccion
 *     o coste de adquisicion de la construccion)
 *   - Otros gastos necesarios para obtener el rendimiento
 *
 *   LIMITE INTERESES + GASTOS FINANCIACION + REPARACION:
 *   El total de intereses + gastos financiacion + reparacion conservacion
 *   no puede superar los ingresos íntegros del inmueble (exceso trasladable
 *   a los 4 anos siguientes).
 *
 * REDUCCIONES SOBRE EL RENDIMIENTO NETO (desde 01/01/2024 — Ley 12/2023):
 *   a) 90%: si el inmueble esta en zona de mercado tensionado Y el alquiler
 *      se reduce >= 5% respecto al contrato anterior del mismo inmueble
 *   b) 70%: nuevo contrato en zona tensionada con arrendatario vulnerable
 *      (o primera vez que se alquila en zona tensionada)
 *   c) 60%: obras de rehabilitacion en los 2 anos anteriores al arrendamiento
 *   d) 50%: resto de arrendamientos de vivienda habitual (reduccion general)
 *   e) 0%: inmuebles no destinados a vivienda (locales, garajes, trasteros)
 *
 *   NOTA: La reduccion del 60% anterior (hasta 2023) baja al 50% desde 2024.
 *   La reduccion NO aplica si: rendimiento negativo, arrendamiento temporal
 *   inferior a 1 ano (turistica), o sobre el exceso que supere el limite
 *   de intereses/reparacion.
 *
 * Fuente: LIRPF arts. 22-24 + Ley 12/2023 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_retencion_alquiler, calcular_venta_inmueble
 */

// --- Constantes ---

const PCT_AMORTIZACION = 3;   // % anual sobre valor construccion (art. 23.1.b)

// --- Tipos publicos ---

export type TipoInmuebleRCI =
  | 'vivienda_habitual_arrendatario'   // Vivienda habitual del inquilino — reduccion 50%
  | 'vivienda_zona_tensionada_nueva'   // Primera vez en zona tensionada o arrendatario vulnerable — 70%
  | 'vivienda_rehabilitada'            // Obras de rehabilitacion en ultimos 2 anos — 60%
  | 'vivienda_tension_reduccion_5pct'  // Zona tensionada + reduccion >= 5% alquiler anterior — 90%
  | 'no_vivienda';                     // Local, garaje, trastero — sin reduccion

export interface GastosDeduciblesRCI {
  /** Intereses del prestamo hipotecario sobre el inmueble (EUR/ano) */
  interesesPrestamo?: number;
  /** Otros gastos de financiacion (comisiones, seguros vinculados al prestamo) (EUR/ano) */
  gastosFinanciacion?: number;
  /** IBI, tasa de basuras y tributos locales (EUR/ano) */
  ibiYTributos?: number;
  /** Primas de seguros del inmueble (EUR/ano) */
  seguros?: number;
  /** Gastos de reparacion y conservacion (NO mejoras) (EUR/ano) */
  reparacionConservacion?: number;
  /** Cuotas comunidad de propietarios (EUR/ano) */
  comunidad?: number;
  /** Gastos de administracion y gestion (agencia, administrador) (EUR/ano) */
  administracion?: number;
  /** Otros gastos necesarios (formalizacion, procuradores, etc.) (EUR/ano) */
  otros?: number;
  /**
   * Amortizacion del inmueble: si se proporciona se usa directamente.
   * Si no, se calcula como 3% del valor de construccion.
   */
  amortizacionDirecta?: number;
  /**
   * Valor de construccion del inmueble (EUR) — para calcular amortizacion
   * Mayor entre (valor catastral de la construccion) y (precio compra x % construccion)
   */
  valorConstruccion?: number;
}

export interface ParametrosRendimientoCapitalInmobiliario {
  tipoInmueble: TipoInmuebleRCI;
  /** Ingresos íntegros del arrendamiento en el ejercicio (EUR) */
  ingresosIntegros: number;
  gastos: GastosDeduciblesRCI;
  /**
   * Exceso de gastos de intereses+reparacion no deducido en anos anteriores
   * y pendiente de compensar (EUR)
   */
  excesoGastosPendientesAniosAnt?: number;
}

export interface ResultadoRendimientoCapitalInmobiliario {
  tipoInmueble: TipoInmuebleRCI;
  ingresosIntegros: number;
  /** Total gastos deducibles sin aplicar limite (EUR) */
  totalGastosBrutos: number;
  /** Amortizacion computada (EUR) */
  amortizacionComputada: number;
  /** Intereses + financiacion + reparacion: sujetos a limite */
  gastosSujetosLimite: number;
  /** Limite de intereses + reparacion (= ingresos integros) */
  limiteGastos: number;
  /** Exceso de intereses/reparacion no deducible este ano (trasladar 4 anos) */
  excesoNoDeducible: number;
  /** Total gastos deducibles efectivos (EUR) */
  totalGastosEfectivos: number;
  /** Rendimiento neto (antes de reduccion) (EUR) */
  rendimientoNeto: number;
  /** Porcentaje de reduccion aplicable (%) */
  pctReduccion: number;
  /** Importe de la reduccion (EUR) */
  importeReduccion: number;
  /** Rendimiento neto reducido declarable en IRPF (EUR) */
  rendimientoNetoReducido: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularRendimientoCapitalInmobiliario(
  p: ParametrosRendimientoCapitalInmobiliario
): ResultadoRendimientoCapitalInmobiliario {
  if (p.ingresosIntegros < 0) throw new Error('Los ingresos no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const g = p.gastos;

  // Amortizacion
  let amortizacionComputada = 0;
  if (g.amortizacionDirecta !== undefined) {
    amortizacionComputada = r(g.amortizacionDirecta);
  } else if (g.valorConstruccion) {
    amortizacionComputada = r(g.valorConstruccion * PCT_AMORTIZACION / 100);
  }

  // Gastos sujetos al limite (intereses + financiacion + reparacion/conservacion)
  const intereses = r((g.interesesPrestamo ?? 0) + (g.gastosFinanciacion ?? 0));
  const reparacion = r(g.reparacionConservacion ?? 0);
  const gastosSujetosLimite = r(intereses + reparacion);

  // Gastos no sujetos a limite
  const gastosLibres = r(
    (g.ibiYTributos ?? 0) +
    (g.seguros ?? 0) +
    (g.comunidad ?? 0) +
    (g.administracion ?? 0) +
    (g.otros ?? 0) +
    amortizacionComputada
  );

  const totalGastosBrutos = r(gastosSujetosLimite + gastosLibres);

  // Aplicar limite a intereses + reparacion
  const limiteGastos = r(p.ingresosIntegros);
  const gastosSujetosEfectivos = Math.min(gastosSujetosLimite, limiteGastos);
  const excesoNoDeducible = r(Math.max(0, gastosSujetosLimite - limiteGastos));

  if (excesoNoDeducible > 0) {
    advertencias.push(
      'LIMITE DE GASTOS: el total de intereses + gastos financiacion + reparacion/conservacion ' +
      '(' + gastosSujetosLimite.toLocaleString('es-ES') + ' EUR) supera los ingresos integros ' +
      '(' + limiteGastos.toLocaleString('es-ES') + ' EUR). ' +
      'El exceso de ' + excesoNoDeducible.toLocaleString('es-ES') + ' EUR no es deducible este ano, ' +
      'pero puede deducirse en los 4 ejercicios siguientes.'
    );
  }

  // Exceso de anos anteriores pendiente
  const excesoAnteriores = r(p.excesoGastosPendientesAniosAnt ?? 0);
  const totalGastosEfectivos = r(gastosSujetosEfectivos + gastosLibres + excesoAnteriores);

  const rendimientoNeto = r(p.ingresosIntegros - totalGastosEfectivos);

  // Reduccion segun tipo de inmueble
  let pctReduccion = 0;
  switch (p.tipoInmueble) {
    case 'vivienda_tension_reduccion_5pct': pctReduccion = 90; break;
    case 'vivienda_zona_tensionada_nueva': pctReduccion = 70; break;
    case 'vivienda_rehabilitada': pctReduccion = 60; break;
    case 'vivienda_habitual_arrendatario': pctReduccion = 50; break;
    case 'no_vivienda': pctReduccion = 0; break;
  }

  // La reduccion solo aplica si el rendimiento neto es positivo
  const importeReduccion = rendimientoNeto > 0 ? r(rendimientoNeto * pctReduccion / 100) : 0;
  const rendimientoNetoReducido = r(rendimientoNeto - importeReduccion);

  if (pctReduccion > 0) {
    advertencias.push(
      'Reduccion del ' + pctReduccion + '% (Ley 12/2023 — desde 01/01/2024): aplicable al ' +
      'rendimiento neto positivo. La reduccion solo aplica si el contrato de arrendamiento ' +
      'cumple los requisitos del tipo seleccionado y el inmueble esta destinado a vivienda habitual.'
    );
  }
  if (rendimientoNeto < 0) {
    advertencias.push(
      'RENDIMIENTO NETO NEGATIVO: no se aplica ninguna reduccion. ' +
      'El rendimiento negativo compensa otros rendimientos del capital inmobiliario del mismo ejercicio. ' +
      'El exceso no compensado se integra en la base general del IRPF.'
    );
  }
  advertencias.push(
    'AMORTIZACION (art. 23.1.b): el 3% del mayor entre el valor catastral de la construccion ' +
    'y el precio de adquisicion de la construccion (excluido el suelo). ' +
    'Solicitar certificado de valor catastral al Ayuntamiento para conocer la proporcion suelo/construccion.'
  );
  advertencias.push(
    'NO son deducibles: las mejoras que amplian la capacidad o vida util del inmueble ' +
    '(capitalizan en el valor de adquisicion para la futura plusvalia), ni el IVA si el ' +
    'arrendamiento esta exento de IVA (lo que es habitual en arrendamiento de vivienda).'
  );

  return {
    tipoInmueble: p.tipoInmueble,
    ingresosIntegros: r(p.ingresosIntegros),
    totalGastosBrutos,
    amortizacionComputada,
    gastosSujetosLimite,
    limiteGastos,
    excesoNoDeducible,
    totalGastosEfectivos,
    rendimientoNeto,
    pctReduccion,
    importeReduccion,
    rendimientoNetoReducido,
    advertencias,
    fuenteDatos: 'LIRPF arts. 22-24 + Ley 12/2023 — vigente 2025',
  };
}
