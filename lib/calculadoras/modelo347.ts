/**
 * Calculadora de Modelo 347 — Declaracion Anual de Operaciones con Terceros
 * Usada por: MCP server (calcular_modelo_347)
 *
 * Determina que operaciones con clientes o proveedores superan el umbral de
 * declaracion en el Modelo 347, calcula los importes acumulados por tercero,
 * e identifica las operaciones excluidas o con reglas especiales.
 *
 * Marco normativo:
 *   - RGGI arts. 31-35 (RD 1065/2007): obligacion informacion Modelo 347
 *   - Orden EHA/3012/2008 y modificaciones: forma y plazo del 347
 *   - LIVA arts. 121-122: volumenes de operaciones
 *
 * UMBRAL DE DECLARACION:
 *   Se declaran las operaciones con un mismo tercero que en el conjunto
 *   del ano natural superen 3.005,06 EUR (IVA incluido).
 *   - Se declara por trimestres naturales (desde 2014)
 *   - El umbral se calcula acumulando TODAS las operaciones con el tercero
 *
 * OPERACIONES EXCLUIDAS (RGGI art. 33.2):
 *   - Operaciones que ya figuran en el Modelo 190 (retenciones trabajo)
 *   - Operaciones que ya figuran en el Modelo 180 (retenciones capital inmobiliario)
 *   - Importaciones y exportaciones (figuran en el Modelo 349 si UE)
 *   - Operaciones en efectivo que ya se declaran en el Modelo 340
 *   - Arrendamientos de inmuebles urbanos (ciertas CCAA — Modelo 180)
 *   - Entregas y adquisiciones intracomunitarias (Modelo 349)
 *   - Operaciones con inversores de sujeto pasivo (para ciertos casos)
 *
 * OPERACIONES ESPECIALES:
 *   - Subvenciones: se incluyen las recibidas de organismos publicos
 *   - Seguros: las primas pagadas a aseguradoras si superan el umbral
 *   - Efectivo: operaciones en efectivo > 6.000 EUR deben identificarse
 *   - Inmuebles: arrendadores deben declarar los arrendatarios
 *
 * PLAZO DE PRESENTACION:
 *   - Febrero de cada ano (para el ejercicio anterior)
 *   - Presentacion electronica obligatoria
 *
 * Fuente: RGGI arts. 31-35 (RD 1065/2007) + Orden EHA/3012/2008 - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_iva, calcular_modelo_303, calcular_retencion_profesional
 */

// --- Constantes ---

const UMBRAL_DECLARACION = 3005.06;         // EUR - umbral anual por tercero
const UMBRAL_EFECTIVO = 6000;               // EUR - identificar si en efectivo
const MES_PRESENTACION = 'febrero';         // mes de presentacion del Modelo 347

// --- Tipos publicos ---

export type TrimestresDeclaracion = 'T1' | 'T2' | 'T3' | 'T4';

export type TipoOperacion347 =
  | 'compras'         // Adquisiciones de bienes y servicios
  | 'ventas'          // Entregas de bienes y prestaciones de servicios
  | 'arrendamiento'   // Arrendamiento inmuebles
  | 'subvencion'      // Subvenciones recibidas de organismo publico
  | 'seguro';         // Primas de seguro pagadas

export type MotivoExclusion347 =
  | 'incluida_mod_190'    // En nominas/retenciones trabajo (Mod. 190)
  | 'incluida_mod_180'    // En retenciones capital inmobiliario (Mod. 180)
  | 'incluida_mod_349'    // Intracomunitaria (Mod. 349)
  | 'importacion_exportacion'
  | 'sin_exclusion';

export interface OperacionTercero {
  descripcion?: string;
  trimestre: TrimestresDeclaracion;
  importeConIVA: number;
  tipoOperacion: TipoOperacion347;
  enEfectivo?: boolean;
  excluida?: boolean;
  motivoExclusion?: MotivoExclusion347;
}

export interface Tercero {
  nif: string;
  nombre: string;
  operaciones: OperacionTercero[];
}

export interface ParametrosModelo347 {
  terceros: Tercero[];
}

export interface ResumenTercero347 {
  nif: string;
  nombre: string;
  totalAnual: number;
  totalEfectivo: number;
  totalExcluido: number;
  totalDeclarable: number;
  porTrimestre: Record<TrimestresDeclaracion, number>;
  debeDeclararse: boolean;
  alertaEfectivo: boolean;
}

export interface ResultadoModelo347 {
  totalTerceros: number;
  tercerosSuperanUmbral: number;
  totalImporteDeclarable: number;
  totalImporteEfectivo: number;
  resumenTerceros: ResumenTercero347[];
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularModelo347(p: ParametrosModelo347): ResultadoModelo347 {
  if (!p.terceros || p.terceros.length === 0) {
    throw new Error('Debe indicar al menos un tercero con operaciones.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const resumenTerceros: ResumenTercero347[] = [];

  for (const tercero of p.terceros) {
    const porTrimestre: Record<TrimestresDeclaracion, number> = { T1: 0, T2: 0, T3: 0, T4: 0 };
    let totalAnual = 0;
    let totalEfectivo = 0;
    let totalExcluido = 0;

    for (const op of tercero.operaciones) {
      if (op.excluida) {
        totalExcluido += op.importeConIVA;
        continue;
      }
      totalAnual += op.importeConIVA;
      porTrimestre[op.trimestre] += op.importeConIVA;
      if (op.enEfectivo) {
        totalEfectivo += op.importeConIVA;
      }
    }

    const totalDeclarable = r(totalAnual);
    const debeDeclararse = totalDeclarable > UMBRAL_DECLARACION;
    const alertaEfectivo = totalEfectivo > UMBRAL_EFECTIVO;

    if (alertaEfectivo) {
      advertencias.push(
        'Tercero ' + tercero.nombre + ' (' + tercero.nif + '): ' +
        totalEfectivo.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' EUR en efectivo. ' +
        'Las operaciones en efectivo que superen ' + UMBRAL_EFECTIVO.toLocaleString('es-ES') +
        ' EUR deben identificarse como tales en el Modelo 347.'
      );
    }

    resumenTerceros.push({
      nif: tercero.nif,
      nombre: tercero.nombre,
      totalAnual: r(totalAnual),
      totalEfectivo: r(totalEfectivo),
      totalExcluido: r(totalExcluido),
      totalDeclarable,
      porTrimestre: {
        T1: r(porTrimestre.T1),
        T2: r(porTrimestre.T2),
        T3: r(porTrimestre.T3),
        T4: r(porTrimestre.T4),
      },
      debeDeclararse,
      alertaEfectivo,
    });
  }

  const tercerosSuperanUmbral = resumenTerceros.filter(t => t.debeDeclararse).length;
  const totalImporteDeclarable = r(resumenTerceros.filter(t => t.debeDeclararse).reduce((s, t) => s + t.totalDeclarable, 0));
  const totalImporteEfectivo = r(resumenTerceros.reduce((s, t) => s + t.totalEfectivo, 0));

  advertencias.push(
    'Umbral de declaracion: ' + UMBRAL_DECLARACION.toLocaleString('es-ES', { minimumFractionDigits: 2 }) +
    ' EUR por tercero en el conjunto del ano natural (IVA incluido). ' +
    'Se incluyen TODAS las operaciones con el mismo NIF aunque sean de distinta naturaleza.'
  );
  advertencias.push(
    'Presentacion: en ' + MES_PRESENTACION + ' (para el ejercicio del ano anterior). ' +
    'Plazo: del 1 al ultimo dia de febrero. Presentacion obligatoriamente electronica.'
  );
  advertencias.push(
    'Operaciones excluidas del 347: las ya declaradas en los Modelos 180 (retenciones capital inmobiliario), ' +
    '190 (retenciones rendimientos trabajo), 340 (libros registro) y 349 (operaciones intracomunitarias). ' +
    'Evite la doble declaracion revisando que operacion corresponde a cada modelo.'
  );

  return {
    totalTerceros: p.terceros.length,
    tercerosSuperanUmbral,
    totalImporteDeclarable,
    totalImporteEfectivo,
    resumenTerceros,
    advertencias,
    fuenteDatos: 'RGGI arts. 31-35 (RD 1065/2007) + Orden EHA/3012/2008 - vigente 2025',
  };
}
