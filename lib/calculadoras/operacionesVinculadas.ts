/**
 * Calculadora de Operaciones Vinculadas y Precios de Transferencia
 * Usada por: MCP server (calcular_operaciones_vinculadas)
 *
 * Analiza si una operacion entre personas o entidades vinculadas requiere
 * valoracion a precio de mercado (arm's length) y calcula el ajuste primario
 * y el potencial ajuste bilateral conforme a la normativa de precios de
 * transferencia del Impuesto sobre Sociedades.
 *
 * Marco normativo:
 *   - LIS art. 18: operaciones vinculadas
 *   - LIS art. 18.1: concepto de vinculacion
 *   - LIS art. 18.2: metodos de valoracion
 *   - LIS art. 18.4: obligaciones de documentacion
 *   - RIS arts. 13-16: desarrollo de los metodos y documentacion
 *   - Directrices OCDE sobre precios de transferencia (2022)
 *
 * CONCEPTO DE VINCULACION (LIS art. 18.1):
 *   Son operaciones vinculadas las realizadas entre:
 *   - Entidad y sus socios/participes (participacion >= 25%)
 *   - Entidad y sus administradores/directivos
 *   - Entidad y parientes de administradores hasta 3er grado
 *   - Dos entidades del mismo grupo empresarial
 *   - Entidad y entidades que participa >= 25% la misma persona
 *   - Una entidad y sus establecimientos permanentes
 *
 * METODOS DE VALORACION (art. 18.4):
 *   1. PCI — Precio Comparable no Controlado: precio de operacion identica entre independientes
 *   2. PRR — Precio de Reventa: precio de reventa al cliente - margen bruto mercado
 *   3. CMAI — Coste Mas Margen: coste de produccion + margen bruto mercado
 *   4. MBA — Margen Neto Transaccional: margen neto / indicador de beneficios
 *   5. RB — Reparto de Beneficios: reparto de los beneficios combinados de la operacion
 *
 * OBLIGACIONES DE DOCUMENTACION:
 *   - Grupo (Master File): si el grupo factura > 45 M EUR a nivel mundial
 *   - Entidad (Local File): si operaciones vinculadas superan 250.000 EUR con un mismo vinculado
 *   - EXCEPCIONES (solo para PYMES < 45 M EUR del grupo):
 *     No documentacion si cada operacion < 250.000 EUR con el mismo vinculado
 *
 * AJUSTE PRIMARIO Y BILATERAL:
 *   Si el precio pactado difiere del valor de mercado:
 *   - Ajuste primario: correccion en el IS de la entidad que pacto el precio inferior
 *   - Ajuste bilateral: la otra entidad puede solicitar el ajuste correlativo
 *     para evitar doble imposicion (procedimiento amistoso si es internacional)
 *
 * Fuente: LIS art. 18 + RIS arts. 13-16 + Directrices OCDE — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_transparencia_fiscal_internacional
 */

// --- Constantes ---

const UMBRAL_DOCUMENTACION_LOCAL = 250_000;    // EUR por vinculado
const UMBRAL_DOCUMENTACION_GRUPO = 45_000_000; // EUR facturacion mundial del grupo

// --- Tipos publicos ---

export type MetodoValoracionOV =
  | 'precio_comparable_no_controlado'  // PCI — mas fiable
  | 'precio_de_reventa'                // PRR
  | 'coste_mas_margen'                 // CMAI
  | 'margen_neto_transaccional'        // MBA
  | 'reparto_beneficios';              // RB — para intangibles unicos

export type TipoOperacionOV =
  | 'compraventa_bienes'
  | 'prestacion_servicios'
  | 'prestamo_financiero'
  | 'cesion_intangibles'         // Royalties, licencias IP
  | 'arrendamiento_inmueble'
  | 'garantia_aval'
  | 'retribucion_administrador'; // Retribucion de administradores vinculados

export interface ParametrosOperacionesVinculadas {
  tipoOperacion: TipoOperacionOV;
  metodoValoracion: MetodoValoracionOV;
  /** Valor pactado en la operacion entre vinculados (EUR) */
  valorPactado: number;
  /** Valor de mercado estimado segun el metodo de valoracion (EUR) */
  valorMercadoEstimado: number;
  /** Las operaciones con este mismo vinculado superan 250.000 EUR en el ejercicio? */
  superaUmbralDocumentacion?: boolean;
  /** El grupo empresarial supera los 45 M EUR de facturacion mundial? */
  grupoSuperaUmbralMasterFile?: boolean;
  /** Tipo IS del contribuyente que realiza el ajuste primario (%) */
  tipoIS?: number;
}

export interface ResultadoOperacionesVinculadas {
  tipoOperacion: TipoOperacionOV;
  metodoValoracion: MetodoValoracionOV;
  valorPactado: number;
  valorMercadoEstimado: number;
  /** Diferencia entre el valor de mercado y el pactado (EUR) — positivo = infravalorado */
  diferenciaValoracion: number;
  /** Existe desviacion significativa del precio de mercado? */
  existeDesviacion: boolean;
  /** Ajuste primario estimado en base imponible IS (EUR) */
  ajustePrimarioBaseImponible: number;
  /** Impacto estimado en cuota IS del ajuste primario (EUR) */
  impactoCuotaIS: number;
  /** Requiere documentacion Local File? */
  requiereDocumentacionLocal: boolean;
  /** Requiere documentacion Master File del grupo? */
  requiereDocumentacionGrupo: boolean;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularOperacionesVinculadas(
  p: ParametrosOperacionesVinculadas
): ResultadoOperacionesVinculadas {
  if (p.valorPactado < 0 || p.valorMercadoEstimado < 0) {
    throw new Error('Los valores de la operacion no pueden ser negativos.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const tipoIS = p.tipoIS ?? 25;

  const diferenciaValoracion = r(p.valorMercadoEstimado - p.valorPactado);
  const existeDesviacion = Math.abs(diferenciaValoracion) > 0;
  const ajustePrimarioBaseImponible = existeDesviacion ? r(Math.abs(diferenciaValoracion)) : 0;
  const impactoCuotaIS = existeDesviacion ? r(ajustePrimarioBaseImponible * tipoIS / 100) : 0;

  const requiereDocumentacionLocal = p.superaUmbralDocumentacion ?? (p.valorPactado >= UMBRAL_DOCUMENTACION_LOCAL);
  const requiereDocumentacionGrupo = p.grupoSuperaUmbralMasterFile ?? false;

  if (existeDesviacion) {
    const sentido = diferenciaValoracion > 0 ? 'inferior al de mercado' : 'superior al de mercado';
    advertencias.push(
      'DESVIACION DE PRECIOS DE TRANSFERENCIA: el valor pactado (' + p.valorPactado.toLocaleString('es-ES') + ' EUR) ' +
      'es ' + sentido + ' (' + p.valorMercadoEstimado.toLocaleString('es-ES') + ' EUR). ' +
      'La Agencia Tributaria puede practicar un ajuste primario de ' + ajustePrimarioBaseImponible.toLocaleString('es-ES') +
      ' EUR en la base imponible, con impacto en cuota de ' + impactoCuotaIS.toLocaleString('es-ES') + ' EUR.'
    );
    advertencias.push(
      'AJUSTE BILATERAL: la entidad vinculada que recibe el ajuste puede solicitar el ' +
      'ajuste correlativo (bilateral) para evitar doble imposicion. En operaciones ' +
      'internacionales, puede iniciarse un Procedimiento Amistoso (MAP) conforme al CDI aplicable.'
    );
  }

  if (requiereDocumentacionLocal) {
    advertencias.push(
      'DOCUMENTACION OBLIGATORIA — LOCAL FILE: las operaciones con este vinculado superan ' +
      UMBRAL_DOCUMENTACION_LOCAL.toLocaleString('es-ES') + ' EUR. Debe prepararse y ' +
      'conservarse la documentacion especifica del art. 18.3 LIS (informacion sobre ' +
      'el contribuyente y sus operaciones vinculadas). Disponible para la AEAT en caso de inspeccion.'
    );
  }
  if (requiereDocumentacionGrupo) {
    advertencias.push(
      'DOCUMENTACION OBLIGATORIA — MASTER FILE (grupo): el grupo supera los ' +
      UMBRAL_DOCUMENTACION_GRUPO.toLocaleString('es-ES') + ' EUR de facturacion mundial. ' +
      'La entidad matriz debe preparar el Informe maestro (Master File) del grupo.'
    );
  }

  advertencias.push(
    'METODO SELECCIONADO (' + p.metodoValoracion + '): el metodo PCI (precio comparable no controlado) ' +
    'es el preferido por la OCDE cuando existe un comparable fiable. Los metodos de margen neto ' +
    'son los mas usados en la practica para servicios intragrupo.'
  );
  advertencias.push(
    'Las sanciones por incumplimiento de precios de transferencia pueden alcanzar el 15% ' +
    'del ajuste (sin documentacion) o el 10% con documentacion incompleta (RIS art. 16). ' +
    'La AEAT dispone de la Base de datos ORBIS y comparables de OCDE para sus comprobaciones.'
  );

  return {
    tipoOperacion: p.tipoOperacion,
    metodoValoracion: p.metodoValoracion,
    valorPactado: r(p.valorPactado),
    valorMercadoEstimado: r(p.valorMercadoEstimado),
    diferenciaValoracion,
    existeDesviacion,
    ajustePrimarioBaseImponible,
    impactoCuotaIS,
    requiereDocumentacionLocal,
    requiereDocumentacionGrupo,
    advertencias,
    fuenteDatos: 'LIS art. 18 + RIS arts. 13-16 + Directrices OCDE — vigente 2025',
  };
}
