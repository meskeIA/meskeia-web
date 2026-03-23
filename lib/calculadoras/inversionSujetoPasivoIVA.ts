/**
 * Calculadora de Inversion del Sujeto Pasivo en IVA
 * Usada por: MCP server (calcular_inversion_sujeto_pasivo_iva)
 *
 * Determina si una operacion esta sujeta a inversion del sujeto pasivo (ISP)
 * en el IVA espanol, calcula el IVA autoliquidado y el efecto en los libros
 * de registro del empresario o profesional receptor.
 *
 * Marco normativo:
 *   - LIVA art. 84.Uno.2.o: supuestos de inversion del sujeto pasivo
 *   - RIVA art. 24 quater: requisitos formales
 *   - DGT consultas vinculantes: interpretacion de supuestos
 *
 * SUPUESTOS DE INVERSION DEL SUJETO PASIVO (LIVA art. 84.Uno.2.o):
 *
 *   a) INMUEBLES:
 *      - Entregas de inmuebles exentas por renuncia (art. 20.Uno.20.o y 22.o)
 *      - Entregas en ejecucion de garantia sobre inmuebles
 *
 *   b) CONSTRUCCION Y REHABILITACION:
 *      - Prestaciones de servicios de construccion/rehabilitacion con subcontratacion
 *        cuando el destinatario es empresario/profesional que actua como tal
 *      - El contratista principal emite factura sin IVA; el subcontratista tambien
 *        (ISP en cascada)
 *
 *   c) ENTREGAS DE DESECHOS Y MATERIALES DE RECUPERACION:
 *      - Chatarra, desperdicios de hierro, acero, cobre, etc.
 *      - Material de deshecho de papel, carton, vidrio, plasticos
 *
 *   d) ENTREGAS DE ORO:
 *      - Oro de inversion (art. 140)
 *      - Productos semielaborados de oro (ley >= 325 milesimas)
 *
 *   e) DERECHOS DE EMISION DE CO2
 *
 *   f) TELECOMUNICACIONES, ELECTRONICOS Y TABLETAS:
 *      - Solo si el destinatario es revendedor o empresario/profesional
 *      - Y el importe total de las operaciones en la factura > 5.000 EUR
 *
 *   g) PRESTACIONES DE SERVICIOS DE INTERMEDIACION EN NOMBRE AJENO
 *      - Cuando el prestador no este establecido en el TAI
 *
 * EFECTO CONTABLE:
 *   El receptor emite IVA repercutido (debe) e IVA soportado (haber)
 *   => Si es deducible al 100%: efecto neutro en caja
 *   => Si hay prorrata: parte del IVA soportado no es deducible
 *
 * Fuente: LIVA art. 84 + RIVA art. 24 quater — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_prorrata_iva, calcular_regimen_simplificado_iva
 */

// --- Constantes ---

const UMBRAL_ELECTRONICOS_EUR = 5_000;

// --- Tipos publicos ---

export type SuperpuestoISP =
  | 'inmueble_renuncia_exencion'       // Entrega inmueble segunda mano con renuncia exencion
  | 'inmueble_ejecucion_garantia'      // Ejecucion hipotecaria / dacion en pago
  | 'construccion_subcontratacion'     // Servicios construccion/rehabilitacion subcontratados
  | 'desechos_recuperacion'            // Chatarra, papel, carton, vidrio, plasticos reciclaje
  | 'oro_inversion'                    // Oro de inversion / semielaborados >= 325 milesimas
  | 'derechos_emision_co2'             // Derechos emision CO2 y otros gases
  | 'electronicos_revendedor'          // Moviles, tablets, consolas — destinatario revendedor
  | 'electronicos_empresario'          // Moviles, tablets, consolas — destinatario empresario (>5k EUR factura)
  | 'servicios_prestador_no_establecido'; // Prestador no establecido en TAI

export interface ParametrosInversionSujetoPasivoIVA {
  supuesto: SuperpuestoISP;
  /** Base imponible de la operacion (EUR) */
  baseImponible: number;
  /** Tipo de IVA aplicable (%) — 4, 10 o 21 */
  tipoIVA: 4 | 10 | 21;
  /**
   * Porcentaje de prorrata definitiva del receptor (%)
   * 0 = no tiene derecho a deduccion (exento sin renuncia)
   * 100 = deduccion plena (general por defecto)
   */
  porcentajeProrrataReceptor?: number;
  /** Importe total de la factura (EUR) — requerido para supuesto electronicos_empresario */
  importeTotalFactura?: number;
}

export interface ResultadoInversionSujetoPasivoIVA {
  supuesto: SuperpuestoISP;
  baseImponible: number;
  tipoIVA: number;
  /** Cuota IVA autoliquidada por el receptor (EUR) */
  cuotaIVAautoliquidada: number;
  /** IVA soportado deducible (EUR) */
  ivaDeducible: number;
  /** IVA soportado no deducible (EUR) */
  ivaNoDeducible: number;
  /** Efecto neto en caja del receptor (EUR, negativo = pago neto) */
  efectoNeto: number;
  /** Descripcion del supuesto legal */
  descripcionSupuesto: string;
  /** La operacion esta sujeta a ISP? */
  sujetaISP: boolean;
  motivoNoISP?: string;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Descripcion por supuesto ---

const DESCRIPCIONES: Record<SuperpuestoISP, string> = {
  inmueble_renuncia_exencion: 'Entrega de inmueble de segunda mano con renuncia a la exencion del art. 20.Uno.20.o LIVA',
  inmueble_ejecucion_garantia: 'Entrega de inmueble en ejecucion de garantia o dacion en pago',
  construccion_subcontratacion: 'Servicios de construccion o rehabilitacion con subcontratacion (contratista → subcontratista o promotor → contratista)',
  desechos_recuperacion: 'Entregas de desechos y materiales de recuperacion (chatarra, papel, carton, vidrio, plasticos)',
  oro_inversion: 'Entregas de oro de inversion o productos semielaborados de oro (ley >= 325 milesimas)',
  derechos_emision_co2: 'Transmisiones de derechos de emision de CO2 y otros gases de efecto invernadero',
  electronicos_revendedor: 'Entregas de telefonos moviles, tablets y consolas a revendedores (cualquier importe)',
  electronicos_empresario: 'Entregas de telefonos moviles, tablets y consolas a empresario/profesional (importe factura > 5.000 EUR)',
  servicios_prestador_no_establecido: 'Prestaciones de servicios por prestador no establecido en el TAI con destinatario empresario/profesional',
};

// --- Funcion principal ---

export function calcularInversionSujetoPasivoIVA(
  p: ParametrosInversionSujetoPasivoIVA
): ResultadoInversionSujetoPasivoIVA {
  if (p.baseImponible <= 0) throw new Error('La base imponible debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const prorrata = p.porcentajeProrrataReceptor ?? 100;

  // Verificacion supuesto electronicos_empresario
  let sujetaISP = true;
  let motivoNoISP: string | undefined;

  if (p.supuesto === 'electronicos_empresario') {
    const totalFactura = p.importeTotalFactura ?? p.baseImponible;
    if (totalFactura <= UMBRAL_ELECTRONICOS_EUR) {
      sujetaISP = false;
      motivoNoISP =
        'El importe total de la factura (' + totalFactura.toLocaleString('es-ES') + ' EUR) no supera ' +
        'el umbral de ' + UMBRAL_ELECTRONICOS_EUR.toLocaleString('es-ES') + ' EUR. ' +
        'La ISP solo aplica a electronicos para empresarios cuando el importe de la factura supera dicho umbral.';
    }
  }

  if (!sujetaISP) {
    return {
      supuesto: p.supuesto,
      baseImponible: r(p.baseImponible),
      tipoIVA: p.tipoIVA,
      cuotaIVAautoliquidada: 0,
      ivaDeducible: 0,
      ivaNoDeducible: 0,
      efectoNeto: 0,
      descripcionSupuesto: DESCRIPCIONES[p.supuesto],
      sujetaISP: false,
      motivoNoISP,
      advertencias,
      fuenteDatos: 'LIVA art. 84.Uno.2.o + RIVA art. 24 quater — vigente 2025',
    };
  }

  const cuotaIVAautoliquidada = r(p.baseImponible * p.tipoIVA / 100);
  const ivaDeducible = r(cuotaIVAautoliquidada * prorrata / 100);
  const ivaNoDeducible = r(cuotaIVAautoliquidada - ivaDeducible);
  // Con ISP: el receptor declara el IVA como repercutido (cobra de Hacienda en modelo) y como soportado (paga a Hacienda).
  // El efecto neto es la cuota NO deducible (la no deducible sale de bolsillo).
  const efectoNeto = -ivaNoDeducible;

  advertencias.push(
    'INVERSION DEL SUJETO PASIVO: el receptor de la operacion (usted) debe autoliquidar el IVA ' +
    'en su declaracion periodica (modelo 303). El proveedor emite factura SIN IVA. ' +
    'El receptor declara la cuota como IVA repercutido (devengado) y como IVA soportado (si es deducible).'
  );
  if (p.supuesto === 'construccion_subcontratacion') {
    advertencias.push(
      'ATENCION: La ISP en construccion aplica tanto en la relacion promotor-contratista como ' +
      'contratista-subcontratista, siempre que el destinatario sea empresario o profesional ' +
      'que actua como tal. No aplica a particulares.'
    );
  }
  if (p.supuesto === 'electronicos_revendedor' || p.supuesto === 'electronicos_empresario') {
    advertencias.push(
      'ELECTRONICOS (LIVA art. 84.Uno.2.o g-h): la ISP solo aplica a telefonos moviles, ' +
      'consolas de videojuegos, ordenadores portatiles y tablets. El proveedor debe conservar ' +
      'declaracion del destinatario sobre su condicion de revendedor o empresario.'
    );
  }
  if (prorrata < 100) {
    advertencias.push(
      'Con prorrata del ' + prorrata + '%: el IVA soportado no deducible (' +
      ivaNoDeducible.toLocaleString('es-ES') + ' EUR) es un mayor coste de la operacion ' +
      '(no recuperable de Hacienda).'
    );
  }
  advertencias.push(
    'FACTURACION: el proveedor debe indicar en la factura "inversion del sujeto pasivo" y ' +
    'el NIF del destinatario. La factura no incluye cuota de IVA.'
  );

  return {
    supuesto: p.supuesto,
    baseImponible: r(p.baseImponible),
    tipoIVA: p.tipoIVA,
    cuotaIVAautoliquidada,
    ivaDeducible,
    ivaNoDeducible,
    efectoNeto,
    descripcionSupuesto: DESCRIPCIONES[p.supuesto],
    sujetaISP: true,
    advertencias,
    fuenteDatos: 'LIVA art. 84.Uno.2.o + RIVA art. 24 quater — vigente 2025',
  };
}
