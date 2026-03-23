/**
 * Calculadora del Modelo 720 — Declaracion de Bienes y Derechos en el Extranjero
 * Usada por: MCP server (calcular_modelo720)
 *
 * Determina la obligacion de presentar el Modelo 720, los umbrales de cada
 * categoria de bienes, las fechas de presentacion y el regimen sancionador
 * aplicable segun la normativa vigente tras la sentencia TJUE C-788/19.
 *
 * Marco normativo:
 *   - DA 18.a LGT (anadida por Ley 7/2012): obligacion de informacion
 *   - RD 1065/2007 arts. 42 bis, 42 ter, 54 bis (RGAT): desarrollo reglamentario
 *   - TJUE Sentencia C-788/19 (27/01/2022): sanciones desproporcionadas
 *   - Ley 5/2022 (reforma): adaptacion a TJUE — elimina sanciones desproporcionadas
 *   - LIRPF DA 1.a (vigente): imputacion como ganancia patrimonial no justificada
 *
 * OBLIGACION DE PRESENTAR (art. 42 bis, 42 ter, 54 bis RGAT):
 *
 *   CATEGORIA A — Cuentas bancarias en entidades financieras extranjeras:
 *     Obligatorio si el saldo a 31/12 O el saldo medio del 4T supera 50.000 EUR
 *     (por cuenta y por titular/autorizado/beneficiario)
 *
 *   CATEGORIA B — Valores, acciones, fondos, seguros y rentas vitalicias:
 *     Obligatorio si el valor a 31/12 supera 50.000 EUR (por categoria)
 *     Subcategorias: acciones/participaciones, seguros de vida, rentas temporales/vitalicias
 *
 *   CATEGORIA C — Bienes inmuebles en el extranjero:
 *     Obligatorio si el valor de adquisicion supera 50.000 EUR (por inmueble)
 *
 * PRESENTACION:
 *   - Plazo: 1 enero - 31 marzo del ejercicio siguiente
 *   - Primera declaracion: todos los bienes que superen el umbral
 *   - Anos sucesivos: solo si variacion > 20.000 EUR respecto al ultimo declarado
 *   - Ejercicio de referencia: 31/12 del ano anterior
 *
 * SANCIONES (tras Ley 5/2022 — adaptacion TJUE):
 *   - Por no presentar o datos incorrectos: 300 EUR fijos (antes era proporcional)
 *   - Multas proporcionales: eliminadas por TJUE C-788/19
 *   - Presentacion fuera de plazo sin requerimiento: 200 EUR
 *   - Presentacion fuera de plazo con requerimiento: 5.000 EUR por dato/conjunto
 *
 * CONSECUENCIAS FISCALES (LIRPF DA 1.a):
 *   Si el contribuyente no puede justificar origen de bienes declarados fuera de plazo
 *   o no declarados: imputacion como ganancia patrimonial NO JUSTIFICADA en el IRPF
 *   del ejercicio mas antiguo no prescrito (con posible sancion adicional del 150%).
 *
 *   IMPORTANTE: Desde TJUE 2022, la prescripcion normal (4 anos) aplica incluso
 *   para bienes en el extranjero no declarados. La imprescriptibilidad fue eliminada.
 *
 * Fuente: DA 18.a LGT + RGAT arts. 42 bis/ter/54 bis + Ley 5/2022 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_prescripcion_fiscal, calcular_impuesto_patrimonio
 */

// --- Constantes ---

const UMBRAL_DECLARACION = 50_000;          // EUR — umbral por categoria
const VARIACION_DECLARAR_SIGUIENTE = 20_000; // EUR — variacion que obliga a redeclarar
const SANCION_FIJA_NO_PRESENTACION = 300;   // EUR (tras Ley 5/2022)
const SANCION_FUERA_PLAZO_VOLUNTARIO = 200; // EUR por dato/conjunto
const SANCION_FUERA_PLAZO_REQUERIMIENTO = 5_000; // EUR por dato/conjunto
const ANOS_PRESCRIPCION_GENERAL = 4;        // Anos prescripcion IRPF/IS

// --- Tipos publicos ---

export type CategoriaModelo720 = 'cuentas' | 'valores_seguros' | 'inmuebles';

export interface BienExtranjero {
  categoria: CategoriaModelo720;
  descripcion: string;
  /** Valor del bien a 31/12 del ejercicio (EUR) */
  valorActual: number;
  /** Solo cuentas: saldo medio del 4T (EUR) */
  saldoMedio4T?: number;
  /** Valor declarado en el ultimo Modelo 720 presentado (EUR) */
  valorUltimoDec?: number;
  /** Es primera declaracion de este bien? */
  primeraDeclaracion?: boolean;
}

export interface ParametrosModelo720 {
  ejercicio: number;
  bienes: BienExtranjero[];
  /** El contribuyente presento el 720 en ejercicios anteriores? */
  presentoAnosAnteriores?: boolean;
  /** Bienes que no se declararon pero deberian haberse declarado (para analisis de riesgo) */
  bienesNoDeclaradosPrescripcion?: number;
}

export interface AnalisisBien {
  categoria: CategoriaModelo720;
  descripcion: string;
  valorActual: number;
  superaUmbral: boolean;
  obligaDeclarar: boolean;
  motivoDeclaracion?: string;
  variacionRespectoDec?: number;
}

export interface ResultadoModelo720 {
  ejercicio: number;
  analisisBienes: AnalisisBien[];
  /** Hay obligacion de presentar el 720 este ano? */
  obligacionPresentar: boolean;
  /** Categorias que superan el umbral */
  categoriasSuperanUmbral: CategoriaModelo720[];
  /** Total bienes declarables (EUR) */
  totalDeclarable: number;
  /** Plazo de presentacion */
  plazoPresentacion: string;
  /** Sancion estimada si NO se presenta */
  sancionEstimadaNoPresenta: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularModelo720(p: ParametrosModelo720): ResultadoModelo720 {
  if (!p.bienes || p.bienes.length === 0) {
    throw new Error('Debe indicar al menos un bien en el extranjero.');
  }
  if (p.ejercicio < 2013 || p.ejercicio > 2030) {
    throw new Error('El ejercicio debe ser un ano valido entre 2013 y 2030.');
  }

  const advertencias: string[] = [];
  const analisisBienes: AnalisisBien[] = [];
  const categoriasSuperanUmbral = new Set<CategoriaModelo720>();

  // Agrupar valor por categoria para evaluar umbral agregado
  const totalPorCategoria: Record<CategoriaModelo720, number> = {
    cuentas: 0,
    valores_seguros: 0,
    inmuebles: 0,
  };

  for (const bien of p.bienes) {
    const valorEfectivo = bien.categoria === 'cuentas'
      ? Math.max(bien.valorActual, bien.saldoMedio4T ?? 0)
      : bien.valorActual;
    totalPorCategoria[bien.categoria] += valorEfectivo;
  }

  // Evaluar cada bien individualmente
  for (const bien of p.bienes) {
    const valorEfectivo = bien.categoria === 'cuentas'
      ? Math.max(bien.valorActual, bien.saldoMedio4T ?? 0)
      : bien.valorActual;

    const totalCat = totalPorCategoria[bien.categoria];
    const superaUmbral = totalCat >= UMBRAL_DECLARACION;

    let obligaDeclarar = false;
    let motivoDeclaracion: string | undefined;
    let variacionRespectoDec: number | undefined;

    if (superaUmbral) {
      categoriasSuperanUmbral.add(bien.categoria);
      if (bien.primeraDeclaracion || !p.presentoAnosAnteriores) {
        obligaDeclarar = true;
        motivoDeclaracion = 'Primera declaracion o nueva categoria';
      } else if (bien.valorUltimoDec !== undefined) {
        const variacion = Math.abs(valorEfectivo - bien.valorUltimoDec);
        variacionRespectoDec = variacion;
        if (variacion > VARIACION_DECLARAR_SIGUIENTE) {
          obligaDeclarar = true;
          motivoDeclaracion = 'Variacion > ' + VARIACION_DECLARAR_SIGUIENTE.toLocaleString('es-ES') + ' EUR respecto al ultimo declarado';
        }
      } else {
        // Sin referencia previa -> declarar por seguridad
        obligaDeclarar = true;
        motivoDeclaracion = 'Sin referencia de declaracion anterior — se recomienda declarar';
      }
    }

    analisisBienes.push({
      categoria: bien.categoria,
      descripcion: bien.descripcion,
      valorActual: bien.valorActual,
      superaUmbral,
      obligaDeclarar,
      motivoDeclaracion,
      variacionRespectoDec,
    });
  }

  const obligacionPresentar = analisisBienes.some(b => b.obligaDeclarar);
  const totalDeclarable = Math.round(
    analisisBienes.filter(b => b.obligaDeclarar).reduce((s, b) => s + b.valorActual, 0) * 100
  ) / 100;

  const plazoPresentacion = '1 de enero — 31 de marzo de ' + (p.ejercicio + 1);

  // Sancion estimada
  const numCategoriasObligadas = new Set(
    analisisBienes.filter(b => b.obligaDeclarar).map(b => b.categoria)
  ).size;
  const sancionEstimadaNoPresenta = numCategoriasObligadas > 0
    ? SANCION_FIJA_NO_PRESENTACION
    : 0;

  // Advertencias
  advertencias.push(
    'SENTENCIA TJUE C-788/19 (2022): las multas proporcionales del antiguo regimen ' +
    'fueron declaradas contrarias al derecho europeo. Desde la Ley 5/2022, la sancion ' +
    'por no presentar es de ' + SANCION_FIJA_NO_PRESENTACION + ' EUR fijos (no proporcional al valor).'
  );

  if (p.bienesNoDeclaradosPrescripcion && p.bienesNoDeclaradosPrescripcion > 0) {
    advertencias.push(
      'RIESGO DE BIENES NO DECLARADOS: si hay bienes en el extranjero que debieron ' +
      'declararse y no se declararon, la AEAT puede imputarlos como ganancia patrimonial ' +
      'no justificada en IRPF (DA 1.a LGT). Prescripcion general: ' + ANOS_PRESCRIPCION_GENERAL +
      ' anos desde la presentacion de la declaracion. La imprescriptibilidad fue ' +
      'eliminada por el TJUE en 2022.'
    );
  }

  if (categoriasSuperanUmbral.size === 0) {
    advertencias.push(
      'NINGUN BIEN SUPERA EL UMBRAL: el total por categoria no supera los ' +
      UMBRAL_DECLARACION.toLocaleString('es-ES') + ' EUR, por lo que no hay ' +
      'obligacion de presentar el Modelo 720 en el ejercicio ' + p.ejercicio + '.'
    );
  } else {
    advertencias.push(
      'UMBRAL: el limite de ' + UMBRAL_DECLARACION.toLocaleString('es-ES') + ' EUR ' +
      'se evalua por categoria (cuentas / valores y seguros / inmuebles) de forma agregada. ' +
      'Si el conjunto de una categoria supera 50.000 EUR, deben declararse TODOS los bienes de esa categoria.'
    );
    advertencias.push(
      'ANOS SUCESIVOS: una vez declarados, solo hay que volver a declarar si el valor ' +
      'de algun bien varia mas de ' + VARIACION_DECLARAR_SIGUIENTE.toLocaleString('es-ES') +
      ' EUR respecto a lo declarado, o si se adquieren nuevos bienes que superen el umbral.'
    );
  }

  advertencias.push(
    'CUENTAS: se declara el saldo a 31/12 Y el saldo medio del 4T. Se utiliza el mayor ' +
    'de los dos para evaluar el umbral. Deben declararse todas las cuentas en las que ' +
    'se sea titular, representante, autorizado, beneficiario o apoderado.'
  );

  return {
    ejercicio: p.ejercicio,
    analisisBienes,
    obligacionPresentar,
    categoriasSuperanUmbral: [...categoriasSuperanUmbral],
    totalDeclarable,
    plazoPresentacion,
    sancionEstimadaNoPresenta,
    advertencias,
    fuenteDatos: 'DA 18.a LGT + RGAT arts. 42 bis/ter/54 bis + Ley 5/2022 — vigente 2025',
  };
}
