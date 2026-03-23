/**
 * Calculadora del Impuesto Especial sobre Envases de Plastico No Reutilizables
 * Usada por: MCP server (calcular_impuesto_plasticos)
 *
 * Calcula el impuesto especial sobre los envases de plastico no reutilizables,
 * introducido por la Ley 7/2022 de residuos y suelo contaminado.
 *
 * Marco normativo:
 *   - Ley 7/2022, de 8 de abril: arts. 67-83 (Impuesto sobre envases de plastico)
 *   - RD 1055/2022: reglamento de envases y residuos de envases
 *   - Orden HAC/364/2023: modelo 592 (declaracion trimestral/mensual)
 *   - AEAT: instrucciones de cumplimentacion del modelo 592
 *
 * HECHO IMPONIBLE (art. 68 Ley 7/2022):
 *   La fabricacion, importacion o adquisicion intracomunitaria de envases
 *   no reutilizables que contengan plastico, realizados en Espana.
 *
 * SUJETOS PASIVOS:
 *   - Fabricantes establecidos en el TAI
 *   - Importadores (Hacienda lo liquida en DUA)
 *   - Adquirentes intracomunitarios de los envases
 *   - NO los distribuidores ni los usuarios finales (aunque pueden repercutirlo)
 *
 * TIPO IMPOSITIVO:
 *   - 0,45 EUR por kilogramo de plastico no reciclado contenido en el envase
 *   - Sobre el PESO NETO del plastico NO reciclado (no sobre el precio)
 *   - El plastico reciclado (procedente de residuos postconsumo) NO tributa
 *
 * EXENCIONES (art. 73 Ley 7/2022):
 *   - Envases de medicamentos, productos sanitarios, alimentos para usos medicos
 *   - Rollos de envoltura plastica para uso agricola (ensiladoras, acolchados)
 *   - Pinturas, tintas, lacas y adhesivos
 *   - Exportaciones fuera del TAI
 *   - Envases enviados a otro Estado miembro de la UE (con justificacion)
 *
 * BASE IMPONIBLE:
 *   - Cantidad de plastico no reciclado contenido en los envases (kilogramos)
 *   - En adquisiciones intracomunitarias: peso real del plastico no reciclado
 *   - En importaciones: el peso que figure en el DUA
 *
 * MODELO 592 — PLAZOS:
 *   - Grandes empresas: declaracion mensual (dentro del mes siguiente)
 *   - Resto: declaracion trimestral (dentro del mes siguiente al trimestre)
 *
 * ACREDITACION DE PLASTICO RECICLADO:
 *   El sujeto pasivo debe acreditar el contenido de plastico reciclado
 *   mediante certificado emitido por entidad certificadora acreditada (ENAC).
 *
 * Fuente: Ley 7/2022 arts. 67-83 + Orden HAC/364/2023 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_modelo_303, calcular_impuesto_sociedades
 */

// --- Constantes ---

const TIPO_EUR_POR_KG = 0.45;          // EUR/kg de plastico NO reciclado

// --- Tipos publicos ---

export type OperacionIPNR =
  | 'fabricacion'                    // Fabricante espanol
  | 'importacion'                    // Importacion desde terceros paises
  | 'adquisicion_intracomunitaria';   // Compra en otro Estado miembro UE

export type TipoEnvase =
  | 'alimentacion_bebidas'           // Botellas, bandejas, bolsas alimentarias
  | 'higiene_limpieza'               // Envases de detergente, gel, champu
  | 'industrial_comercial'           // Filmillos, palets, cubos industriales
  | 'agricola_reciclado'             // Rollos ensilado, acolchado — EXENTO
  | 'farmaceutico_sanitario'         // Medicamentos, productos sanitarios — EXENTO
  | 'otro';

export interface LineaEnvaseIPNR {
  tipoEnvase: TipoEnvase;
  descripcion?: string;
  /** Peso total del plastico contenido en los envases (kg) */
  pesoTotalPlasticoKg: number;
  /** Porcentaje de plastico reciclado postconsumo acreditado (0-100%) */
  pctPlasticoRecicladoAcreditado: number;
}

export interface ParametrosImpuestoPlasticos {
  tipoOperacion: OperacionIPNR;
  /** Periodo declarado: 'T1', 'T2', 'T3', 'T4' o 'MM/YYYY' para mensual */
  periodoDeclarado?: string;
  envases: LineaEnvaseIPNR[];
}

export interface DetalleEnvaseIPNR {
  tipoEnvase: TipoEnvase;
  descripcion: string;
  pesoTotalPlasticoKg: number;
  pctPlasticoRecicladoAcreditado: number;
  /** Peso no reciclado sujeto a impuesto (kg) */
  pesoNoRecicladoKg: number;
  estaExento: boolean;
  cuotaImpuesto: number;
}

export interface ResultadoImpuestoPlasticos {
  tipoOperacion: OperacionIPNR;
  detalleEnvases: DetalleEnvaseIPNR[];
  /** Total kg de plastico analizados */
  totalKgPlastico: number;
  /** Total kg de plastico reciclado (no tributado) */
  totalKgReciclado: number;
  /** Total kg de plastico no reciclado sujeto a impuesto */
  totalKgNoReciclado: number;
  /** Tipo impositivo (EUR/kg) */
  tipoEurKg: number;
  /** Cuota total del impuesto (EUR) */
  cuotaTotalImpuesto: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularImpuestoPlasticos(
  p: ParametrosImpuestoPlasticos
): ResultadoImpuestoPlasticos {
  if (!p.envases || p.envases.length === 0) throw new Error('Debe indicar al menos una linea de envases.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const detalleEnvases: DetalleEnvaseIPNR[] = [];

  let totalKgPlastico = 0;
  let totalKgReciclado = 0;
  let totalKgNoReciclado = 0;
  let cuotaTotalImpuesto = 0;

  for (const env of p.envases) {
    if (env.pesoTotalPlasticoKg < 0) throw new Error('El peso de plastico no puede ser negativo.');
    const pctRec = Math.max(0, Math.min(100, env.pctPlasticoRecicladoAcreditado));
    const estaExento = env.tipoEnvase === 'agricola_reciclado' || env.tipoEnvase === 'farmaceutico_sanitario';
    const kgReciclado = r(env.pesoTotalPlasticoKg * pctRec / 100);
    const kgNoReciclado = estaExento ? 0 : r(env.pesoTotalPlasticoKg - kgReciclado);
    const cuota = r(kgNoReciclado * TIPO_EUR_POR_KG);

    totalKgPlastico += env.pesoTotalPlasticoKg;
    totalKgReciclado += kgReciclado;
    totalKgNoReciclado += kgNoReciclado;
    cuotaTotalImpuesto += cuota;

    detalleEnvases.push({
      tipoEnvase: env.tipoEnvase,
      descripcion: env.descripcion ?? env.tipoEnvase.replace(/_/g, ' '),
      pesoTotalPlasticoKg: r(env.pesoTotalPlasticoKg),
      pctPlasticoRecicladoAcreditado: pctRec,
      pesoNoRecicladoKg: kgNoReciclado,
      estaExento,
      cuotaImpuesto: cuota,
    });
  }

  totalKgPlastico = r(totalKgPlastico);
  totalKgReciclado = r(totalKgReciclado);
  totalKgNoReciclado = r(totalKgNoReciclado);
  cuotaTotalImpuesto = r(cuotaTotalImpuesto);

  advertencias.push(
    'TIPO IMPOSITIVO: ' + TIPO_EUR_POR_KG.toLocaleString('es-ES') + ' EUR/kg de plastico NO reciclado ' +
    'contenido en los envases (Ley 7/2022 art. 82). Se aplica sobre el peso neto del plastico, ' +
    'no sobre el valor de la mercancia.'
  );
  advertencias.push(
    'PLASTICO RECICLADO: solo se descuenta si esta acreditado mediante certificado emitido por ' +
    'entidad acreditada por ENAC (Entidad Nacional de Acreditacion). ' +
    'Sin certificado, el 100% del plastico tributa aunque contenga material reciclado.'
  );
  advertencias.push(
    'MODELO 592: declaracion trimestral (mes siguiente al trimestre) para empresas no grandes; ' +
    'mensual para grandes empresas. Se presenta electronica y obligatoriamente en la AEAT.'
  );
  if (p.tipoOperacion === 'importacion') {
    advertencias.push(
      'IMPORTACION: el impuesto se liquida en el DUA de importacion por la Aduana. ' +
      'El importador no presenta el modelo 592 por las unidades importadas ' +
      '(solo para operaciones interiores y adquisiciones intracomunitarias).'
    );
  }

  return {
    tipoOperacion: p.tipoOperacion,
    detalleEnvases,
    totalKgPlastico,
    totalKgReciclado,
    totalKgNoReciclado,
    tipoEurKg: TIPO_EUR_POR_KG,
    cuotaTotalImpuesto,
    advertencias,
    fuenteDatos: 'Ley 7/2022 arts. 67-83 + Orden HAC/364/2023 — vigente 2025',
  };
}
