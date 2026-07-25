/**
 * Gastos de compra por TIPO de inmueble — lógica pura sin React ni DOM
 * Usada por: MCP de Delegum (calcular_gastos_compra_inmueble)
 *
 * `compraventa.ts` resuelve el caso de la vivienda y su escenario completo (hipoteca,
 * ahorro necesario, venta). Este módulo cubre el resto del catálogo inmobiliario,
 * donde la rama fiscal diverge de verdad y aplicar la regla de la vivienda produce
 * resultados equivocados:
 *
 *  - garaje / trastero: el IVA reducido del 10% es el del ANEJO transmitido con la
 *    vivienda (art. 91.Uno.1.7º LIVA); comprado por separado tributa al 21%.
 *  - local comercial / nave: en segunda mano cabe la renuncia a la exención de IVA
 *    (art. 20.Dos LIVA) con inversión del sujeto pasivo, que sustituye el ITP por IVA.
 *  - solar edificable: no está exento de IVA — decide quién vende (promotor → IVA 21%
 *    + AJD; particular → ITP).
 *  - finca rústica: exenta de IVA (art. 20.Uno.20º LIVA), luego paga ITP incluso
 *    vendiendo un empresario, y NO genera plusvalía municipal (el IIVTNU solo grava
 *    suelo urbano).
 *
 * Replica el criterio de las apps especializadas de meskeIA del clúster de gastos de
 * compraventa. Fuente de los datos: data/fiscal/inmuebles.ts
 */

import {
  TIPOS_ITP_CCAA_2025,
  IVA_INMUEBLES_2025,
  TIPOS_AJD_2025,
  COSTES_COMPRAVENTA_2025,
  FISCAL_INMUEBLES_META,
} from '@/data/fiscal';
import type { PerfilCompradorMCP } from './compraventa';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoInmuebleCompra =
  | 'vivienda'
  | 'garaje'
  | 'trastero'
  | 'local_comercial'
  | 'nave_industrial'
  | 'solar_edificable'
  | 'finca_rustica';

export interface ParametrosGastosCompra {
  /** Precio de compra en euros */
  precio: number;
  /** Comunidad autónoma (clave interna o nombre) */
  ccaa: string;
  /** Tipo de inmueble: determina la rama fiscal aplicable */
  tipoInmueble: TipoInmuebleCompra;
  /** true = primera entrega del promotor (obra nueva); false = segunda mano */
  obraNueva?: boolean;
  /**
   * Solo para garaje y trastero: si se adquiere junto con la vivienda como anejo.
   * Determina el IVA reducido del 10% frente al general del 21% en obra nueva.
   */
  anejoDeVivienda?: boolean;
  /**
   * Solo para local, nave y finca rústica en segunda mano: el vendedor renuncia a la
   * exención de IVA (art. 20.Dos LIVA). Exige que ambas partes sean empresarios o
   * profesionales con derecho a deducción. La operación pasa de ITP a IVA con
   * inversión del sujeto pasivo, más AJD.
   */
  renunciaExencionIva?: boolean;
  /** Solo para solar edificable: si el vendedor es promotor/empresario (IVA) o particular (ITP) */
  vendedorEsEmpresario?: boolean;
  /** Perfil del comprador — solo produce efecto en vivienda y anejos residenciales */
  perfilComprador?: PerfilCompradorMCP;
  /** Gastos de gestoría en euros (por defecto 500) */
  gestoria?: number;
}

export interface ResultadoGastosCompra {
  precio: number;
  ccaaNombre: string;
  tipoInmueble: TipoInmuebleCompra;
  tipoImpuesto: string;
  porcentajeImpuesto: number;
  importeImpuesto: number;
  ajd: number;
  notaria: number;
  registro: number;
  gestoria: number;
  totalGastos: number;
  totalOperacion: number;
  /** El IVA soportado es potencialmente deducible por un empresario o profesional */
  ivaDeducible: boolean;
  /** El vendedor tributa por plusvalía municipal (falso en suelo rústico) */
  vendedorPagaPlusvaliaMunicipal: boolean;
  /** Explicación de la rama fiscal aplicada */
  nota: string;
  /** Avisos relevantes de la operación */
  advertencias: string[];
  fuenteDatos: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sinTildes = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function normalizarCCAA(ccaa: string): string {
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

function getTipoITP(ccaaNombre: string, perfil: PerfilCompradorMCP): { tipo: number; nota: string } {
  const datos = TIPOS_ITP_CCAA_2025.find(t => sinTildes(t.ccaa) === sinTildes(ccaaNombre));
  if (!datos) return { tipo: 8, nota: 'CCAA no encontrada — usando media orientativa del 8%.' };

  const usaReducido = perfil !== 'general' && datos.reducido !== undefined;
  return {
    tipo: usaReducido ? (datos.reducido ?? datos.tipo) : datos.tipo,
    nota: usaReducido
      ? `Tipo reducido ${datos.reducido}% — ${datos.notaReducido ?? 'perfil especial'}.`
      : `Tipo general ${datos.tipo}% en ${datos.ccaa}.`,
  };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularGastosCompraInmueble(p: ParametrosGastosCompra): ResultadoGastosCompra {
  if (p.precio <= 0) throw new Error('El precio del inmueble debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const ccaaNombre = normalizarCCAA(p.ccaa);
  const obraNueva = p.obraNueva ?? false;
  const anejo = p.anejoDeVivienda ?? true;
  const advertencias: string[] = [];

  let tipoImpuesto = '';
  let porcentajeImpuesto = 0;
  let importeImpuesto = 0;
  let ajd = 0;
  let ivaDeducible = false;
  let nota = '';

  // La plusvalía municipal (IIVTNU) grava el incremento de valor del SUELO URBANO:
  // la finca rústica queda fuera del hecho imponible.
  const vendedorPagaPlusvaliaMunicipal = p.tipoInmueble !== 'finca_rustica';

  // ¿Puede acceder a los tipos reducidos de ITP por perfil del comprador? Solo la
  // vivienda y sus anejos transmitidos con ella; el resto va siempre al tipo general.
  const admiteTipoReducido =
    p.tipoInmueble === 'vivienda' ||
    ((p.tipoInmueble === 'garaje' || p.tipoInmueble === 'trastero') && anejo);
  const perfil: PerfilCompradorMCP = admiteTipoReducido ? (p.perfilComprador ?? 'general') : 'general';

  const aplicarITP = (motivo: string) => {
    const { tipo, nota: notaTipo } = getTipoITP(ccaaNombre, perfil);
    tipoImpuesto = 'ITP (segunda mano)';
    porcentajeImpuesto = tipo;
    importeImpuesto = r(p.precio * tipo / 100);
    ajd = 0; // ITP y AJD gradual son incompatibles sobre el mismo acto (art. 31.2 TRLITP)
    nota = `${motivo} ${notaTipo}`;
  };

  const aplicarIVA = (porcentaje: number, etiqueta: string, motivo: string) => {
    tipoImpuesto = etiqueta;
    porcentajeImpuesto = porcentaje;
    importeImpuesto = r(p.precio * porcentaje / 100);
    ajd = r(p.precio * TIPOS_AJD_2025.general / 100);
    ivaDeducible = porcentaje === IVA_INMUEBLES_2025.local;
    nota = motivo;
  };

  switch (p.tipoInmueble) {
    case 'vivienda':
      if (obraNueva) {
        aplicarIVA(IVA_INMUEBLES_2025.obraNueva, 'IVA (obra nueva)',
          'Primera entrega de vivienda: IVA reducido del 10% más AJD.');
      } else {
        aplicarITP('Vivienda de segunda mano: exenta de IVA, tributa por ITP.');
      }
      break;

    case 'garaje':
    case 'trastero': {
      const bien = p.tipoInmueble === 'garaje' ? 'garaje' : 'trastero';
      if (obraNueva) {
        const porcentaje = anejo ? IVA_INMUEBLES_2025.garageCon : IVA_INMUEBLES_2025.garaje;
        aplicarIVA(porcentaje, 'IVA (obra nueva)', anejo
          ? `El ${bien} se transmite con la vivienda como anejo: IVA reducido del ${porcentaje}% (art. 91.Uno.1.7º LIVA).`
          : `El ${bien} se adquiere de forma independiente: IVA general del ${porcentaje}%, no el reducido del anejo.`);
        if (p.tipoInmueble === 'garaje' && anejo) {
          advertencias.push('El IVA reducido se limita a un máximo de dos plazas de garaje transmitidas con la vivienda; a partir de la tercera se aplica el 21%.');
        }
      } else {
        aplicarITP(`${bien.charAt(0).toUpperCase()}${bien.slice(1)} de segunda mano: tributa por ITP.`);
        if (!anejo) {
          advertencias.push('Al adquirirse de forma independiente, los tipos reducidos de ITP por perfil del comprador no suelen aplicar: casi todos exigen que la compra sea de vivienda habitual.');
        }
      }
      break;
    }

    case 'local_comercial':
    case 'nave_industrial': {
      const bien = p.tipoInmueble === 'local_comercial' ? 'local comercial' : 'nave industrial';
      if (obraNueva) {
        aplicarIVA(IVA_INMUEBLES_2025.local, 'IVA (obra nueva)',
          `Primera entrega de ${bien}: IVA general del 21% más AJD.`);
      } else if (p.renunciaExencionIva) {
        aplicarIVA(IVA_INMUEBLES_2025.local, 'IVA (renuncia a la exención · inversión del sujeto pasivo)',
          `Segunda transmisión de ${bien} con renuncia a la exención de IVA (art. 20.Dos LIVA): tributa por IVA al 21% en lugar de por ITP.`);
        advertencias.push('La renuncia solo cabe si comprador y vendedor son empresarios o profesionales con derecho a deducción. El IVA no se paga al vendedor: lo autoliquida el comprador por inversión del sujeto pasivo.');
        advertencias.push(`Muchas comunidades aplican un tipo de AJD incrementado cuando hay renuncia a la exención; aquí se usa el tipo medio orientativo del ${TIPOS_AJD_2025.general}%.`);
      } else {
        aplicarITP(`Segunda transmisión de ${bien}: exenta de IVA (art. 20.Uno.22º LIVA), tributa por ITP.`);
        advertencias.push('Si comprador y vendedor son empresarios con derecho a deducción, puede convenir renunciar a la exención de IVA: el ITP es un coste no recuperable, mientras que el IVA autoliquidado se deduce.');
      }
      advertencias.push('Los tipos reducidos de ITP (joven, familia numerosa, discapacidad) son exclusivos de la vivienda habitual: aquí se aplica siempre el tipo general.');
      break;
    }

    case 'solar_edificable':
      // El suelo edificable NO está exento de IVA: decide la condición del vendedor.
      if (p.vendedorEsEmpresario) {
        aplicarIVA(IVA_INMUEBLES_2025.local, 'IVA (vendedor empresario o promotor)',
          'La entrega de un solar por un empresario o promotor está sujeta y no exenta de IVA: 21% más AJD.');
      } else {
        aplicarITP('El solar lo vende un particular: la operación queda fuera del IVA y tributa por ITP.');
      }
      advertencias.push('El vendedor paga plusvalía municipal (IIVTNU): el solar es suelo urbano.');
      break;

    case 'finca_rustica':
      // La entrega de terrenos rústicos está EXENTA de IVA aunque venda un empresario.
      if (p.renunciaExencionIva) {
        aplicarIVA(IVA_INMUEBLES_2025.local, 'IVA (renuncia a la exención · inversión del sujeto pasivo)',
          'Finca rústica con renuncia a la exención de IVA (art. 20.Dos LIVA) entre empresarios o profesionales con derecho a deducción.');
        advertencias.push('La renuncia solo cabe entre empresarios o profesionales con derecho a deducción; en una compraventa entre particulares no es posible.');
      } else {
        aplicarITP('La entrega de terrenos rústicos está exenta de IVA (art. 20.Uno.20º LIVA): tributa por ITP aunque el vendedor sea un empresario.');
      }
      advertencias.push('La venta de una finca rústica NO genera plusvalía municipal: el IIVTNU solo grava el suelo urbano.');
      advertencias.push('La Ley 19/1995 de Modernización de las Explotaciones Agrarias prevé reducciones de ITP para agricultores profesionales y explotaciones prioritarias.');
      break;
  }

  const notariaBase = p.precio * COSTES_COMPRAVENTA_2025.notaria.estimacion / 100;
  const notaria = r(Math.min(
    Math.max(notariaBase, COSTES_COMPRAVENTA_2025.notaria.minimo),
    COSTES_COMPRAVENTA_2025.notaria.maximo,
  ));

  const registroBase = p.precio * COSTES_COMPRAVENTA_2025.registro.estimacion / 100;
  const registro = r(Math.min(
    Math.max(registroBase, COSTES_COMPRAVENTA_2025.registro.minimo),
    COSTES_COMPRAVENTA_2025.registro.maximo,
  ));

  const gestoria = p.gestoria ?? 500;
  const totalGastos = r(importeImpuesto + ajd + notaria + registro + gestoria);

  advertencias.push('La base imponible del ITP es el valor de referencia catastral cuando supera el precio escriturado.');

  return {
    precio: p.precio,
    ccaaNombre,
    tipoInmueble: p.tipoInmueble,
    tipoImpuesto,
    porcentajeImpuesto,
    importeImpuesto,
    ajd,
    notaria,
    registro,
    gestoria,
    totalGastos,
    totalOperacion: r(p.precio + totalGastos),
    ivaDeducible,
    vendedorPagaPlusvaliaMunicipal,
    nota,
    advertencias,
    fuenteDatos: `${FISCAL_INMUEBLES_META.fuente} — verificado ${FISCAL_INMUEBLES_META.verificado}`,
  };
}
