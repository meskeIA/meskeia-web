/**
 * Calculadora del Modelo 111 — Retenciones e Ingresos a Cuenta
 * Usada por: MCP server (calcular_modelo_111)
 *
 * Calcula el importe a ingresar en el Modelo 111 (declaracion trimestral
 * de retenciones e ingresos a cuenta del IRPF) correspondiente a:
 *   - Rendimientos del trabajo (nominas, retribuciones dinerarias)
 *   - Rendimientos de actividades economicas (profesionales)
 *   - Premios y ganancias patrimoniales sometidos a retencion
 *   - Otros rendimientos (consejeros, impatriados, etc.)
 *
 * Marco normativo:
 *   - LIRPF arts. 99-105: obligacion de retener e ingresar
 *   - RIRPF arts. 74-110: tipos y procedimientos de retencion
 *   - Orden EHA/3435/2007: aprobacion del Modelo 111
 *   - Orden HAP/2215/2013: procedimiento electronico modelo 111
 *
 * TIPOS DE RETENCION FIJOS (RIRPF 2025):
 *   - Profesionales (actividades economicas):  15% general / 7% inicio actividad
 *   - Profesionales con ingresos < 15.000 EUR:  15% (pero ver excepcion 7%)
 *   - Administradores y consejeros:            35% / 19% (entidades < 100k EUR facturacion)
 *   - Premios de concursos y juegos:           19%
 *   - Propiedad intelectual (derechos autor):  19% general / 7% si < 15k EUR
 *   - Impatriados (Beckham):                   24% hasta 600k EUR
 *   - Rentas del trabajo: tipo variable segun tabla (no calculable directamente sin datos IRPF completos)
 *
 * MODELO 111 — PLAZOS:
 *   - Declaracion trimestral: 1-20 abril (T1), 1-20 julio (T2), 1-20 octubre (T3), 1-20 enero (T4)
 *   - Grandes empresas: mensual (modelo 111 mensual)
 *
 * Fuente: LIRPF arts. 99-105 + RIRPF arts. 74-110 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_autonomos_cuota_ss, calcular_derechos_autor_irpf
 */

// --- Constantes ---

const TIPO_PROFESIONALES_GENERAL = 15;      // %
const TIPO_PROFESIONALES_INICIO = 7;         // % primeros 2 anos de actividad
const TIPO_ADMINISTRADORES_GENERAL = 35;    // %
const TIPO_ADMINISTRADORES_PEQUENA = 19;    // % entidades con facturacion < 100.000 EUR
const TIPO_PREMIOS = 19;                    // %
const TIPO_PROPIEDAD_INTELECTUAL = 19;      // %
const TIPO_PROPIEDAD_INTELECTUAL_REDUCIDO = 7; // % si ingresos < 15.000 EUR
const TIPO_IMPATRIADOS = 24;               // %
const UMBRAL_EMPRESA_PEQUENA = 100_000;    // EUR facturacion para tipo reducido admin.

// --- Tipos publicos ---

export type CategoriaModelo111 =
  | 'trabajo'              // Rendimientos del trabajo (nominas) — tipo variable
  | 'profesionales'        // Actividades economicas (autonomos facturando)
  | 'profesionales_inicio' // Idem, inicio de actividad (<= 2 anos)
  | 'administradores'      // Consejeros / administradores empresa grande
  | 'administradores_pequena_empresa' // Consejeros entidad < 100k EUR facturacion
  | 'premios'              // Premios concursos y juegos
  | 'propiedad_intelectual'       // Derechos de autor general
  | 'propiedad_intelectual_reducida' // Derechos de autor ingresos < 15k EUR
  | 'impatriados';         // Trabajadores con regimen especial impatriados

export interface LineaRetencion111 {
  categoria: CategoriaModelo111;
  descripcion?: string;
  /** Numero de perceptores en el trimestre */
  numPerceptores: number;
  /** Base de retencion total de todos los perceptores (EUR) */
  baseRetencion: number;
  /**
   * Tipo de retencion efectivo aplicado (%)
   * Para 'trabajo': obligatorio informarlo (calculo previo segun RIRPF art. 82-87)
   * Para el resto: se puede omitir y se usa el tipo legal
   */
  tipoRetencionAplicado?: number;
}

export interface ParametrosModelo111 {
  /** Trimestre a declarar (1-4) */
  trimestre: 1 | 2 | 3 | 4;
  /** Ejercicio fiscal */
  ejercicio: number;
  lineas: LineaRetencion111[];
}

export interface DetalleLinea111 {
  categoria: CategoriaModelo111;
  descripcion: string;
  numPerceptores: number;
  baseRetencion: number;
  tipoAplicado: number;
  cuotaRetencion: number;
}

export interface ResultadoModelo111 {
  trimestre: number;
  ejercicio: number;
  detalle: DetalleLinea111[];
  /** Total perceptores (suma todas las lineas) */
  totalPerceptores: number;
  /** Total base de retenciones (EUR) */
  totalBase: number;
  /** Total retenciones a ingresar (EUR) */
  totalRetenciones: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Tipo por categoria ---

function tipoLegal(cat: CategoriaModelo111): number {
  switch (cat) {
    case 'trabajo': return 0;   // Variable — requiere tipo explicito
    case 'profesionales': return TIPO_PROFESIONALES_GENERAL;
    case 'profesionales_inicio': return TIPO_PROFESIONALES_INICIO;
    case 'administradores': return TIPO_ADMINISTRADORES_GENERAL;
    case 'administradores_pequena_empresa': return TIPO_ADMINISTRADORES_PEQUENA;
    case 'premios': return TIPO_PREMIOS;
    case 'propiedad_intelectual': return TIPO_PROPIEDAD_INTELECTUAL;
    case 'propiedad_intelectual_reducida': return TIPO_PROPIEDAD_INTELECTUAL_REDUCIDO;
    case 'impatriados': return TIPO_IMPATRIADOS;
  }
}

const DESCRIPCIONES_CAT: Record<CategoriaModelo111, string> = {
  trabajo: 'Rendimientos del trabajo (nominas y retribuciones dinerarias)',
  profesionales: 'Actividades economicas — profesionales (tipo general 15%)',
  profesionales_inicio: 'Actividades economicas — inicio de actividad (tipo reducido 7%)',
  administradores: 'Administradores y consejeros — empresa grande (35%)',
  administradores_pequena_empresa: 'Administradores y consejeros — empresa pequeña (19%)',
  premios: 'Premios de concursos, juegos y rifas (19%)',
  propiedad_intelectual: 'Propiedad intelectual — derechos de autor (19%)',
  propiedad_intelectual_reducida: 'Propiedad intelectual — ingresos < 15.000 EUR (7%)',
  impatriados: 'Impatriados (regimen especial art. 93 LIRPF) (24%)',
};

// --- Funcion principal ---

export function calcularModelo111(p: ParametrosModelo111): ResultadoModelo111 {
  if (!p.lineas || p.lineas.length === 0) throw new Error('Debe indicar al menos una linea de retencion.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  let totalPerceptores = 0;
  let totalBase = 0;
  let totalRetenciones = 0;
  const detalle: DetalleLinea111[] = [];

  for (const linea of p.lineas) {
    if (linea.baseRetencion < 0) throw new Error('La base de retencion no puede ser negativa.');
    const tipoBase = tipoLegal(linea.categoria);
    let tipoAplicado: number;

    if (linea.categoria === 'trabajo') {
      if (linea.tipoRetencionAplicado === undefined || linea.tipoRetencionAplicado < 0) {
        throw new Error(
          'Para rendimientos del trabajo (categoria "trabajo"), debe indicar el ' +
          'tipo de retencion efectivo aplicado (tipoRetencionAplicado). ' +
          'Este tipo se calcula segun el procedimiento del RIRPF arts. 82-87 ' +
          'considerando la situacion personal y familiar del trabajador.'
        );
      }
      tipoAplicado = linea.tipoRetencionAplicado;
    } else {
      tipoAplicado = linea.tipoRetencionAplicado ?? tipoBase;
    }

    const cuotaRetencion = r(linea.baseRetencion * tipoAplicado / 100);
    totalPerceptores += linea.numPerceptores;
    totalBase += linea.baseRetencion;
    totalRetenciones += cuotaRetencion;

    detalle.push({
      categoria: linea.categoria,
      descripcion: linea.descripcion ?? DESCRIPCIONES_CAT[linea.categoria],
      numPerceptores: linea.numPerceptores,
      baseRetencion: r(linea.baseRetencion),
      tipoAplicado,
      cuotaRetencion,
    });
  }

  totalBase = r(totalBase);
  totalRetenciones = r(totalRetenciones);

  advertencias.push(
    'Modelo 111 — Plazos de presentacion: ' +
    'T1 → del 1 al 20 de abril; T2 → del 1 al 20 de julio; ' +
    'T3 → del 1 al 20 de octubre; T4 → del 1 al 20 de enero del ejercicio siguiente.'
  );
  advertencias.push(
    'Las retenciones de nominas del trabajo se calculan segun las tablas del RIRPF ' +
    '(arts. 82-87) en funcion del salario bruto anual, minimo personal y familiar, ' +
    'discapacidad, deduccion por movilidad geografica, etc. ' +
    'Use la calculadora de retenciones del trabajo para obtener el tipo correcto.'
  );
  advertencias.push(
    'Tipo reducido profesionales (7%): aplicable durante el ano de inicio y los dos ' +
    'siguientes siempre que en ninguno de los cuatro anos anteriores se hayan obtenido ' +
    'rendimientos de actividades economicas. Se comunica mediante declaracion expresa al pagador.'
  );
  if (detalle.some(d => d.categoria === 'administradores_pequena_empresa')) {
    advertencias.push(
      'Tipo reducido administradores (19%): aplica cuando la entidad pagadora tiene ' +
      'un importe neto de la cifra de negocios del ano anterior inferior a ' +
      UMBRAL_EMPRESA_PEQUENA.toLocaleString('es-ES') + ' EUR.'
    );
  }

  return {
    trimestre: p.trimestre,
    ejercicio: p.ejercicio,
    detalle,
    totalPerceptores,
    totalBase,
    totalRetenciones,
    advertencias,
    fuenteDatos: 'LIRPF arts. 99-105 + RIRPF arts. 74-110 — vigente 2025',
  };
}
