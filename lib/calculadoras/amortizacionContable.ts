/**
 * Calculadora de Amortización Contable y Fiscal — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_amortizacion_contable)
 *
 * Calcula las tablas de amortización de un activo fijo según los métodos
 * permitidos por el Reglamento del Impuesto sobre Sociedades (RIS 2004)
 * y el Reglamento del IRPF para actividades económicas.
 *
 * Métodos:
 * A) Lineal — cuota constante = (coste - valor_residual) / vida_util
 * B) Porcentaje constante sobre el valor neto contable (degresiva)
 * C) Suma de dígitos (degresiva)
 *
 * Coeficientes máximos oficiales (tabla RIS 2004, grupos principales):
 * Ver constante COEFICIENTES_RIS_2004 abajo.
 *
 * Encadenable con: comparar_autonomo_vs_sl, calcular_irpf, calcular_break_even
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

/** Grupos de amortización del RIS 2004 (art. 12 Ley IS / art. 30 RIRPF) */
export const COEFICIENTES_RIS_2004: Record<string, { coefMax: number; periodoMax: number; descripcion: string }> = {
  'edificios_industriales':      { coefMax: 3,  periodoMax: 68,  descripcion: 'Edificios industriales y almacenes' },
  'edificios_comerciales':       { coefMax: 2,  periodoMax: 100, descripcion: 'Edificios comerciales, administrativos y de servicios' },
  'instalaciones':               { coefMax: 10, periodoMax: 20,  descripcion: 'Instalaciones técnicas / ingeniería' },
  'maquinaria_general':          { coefMax: 12, periodoMax: 18,  descripcion: 'Maquinaria general' },
  'maquinaria_especifica':       { coefMax: 16, periodoMax: 14,  descripcion: 'Maquinaria específica' },
  'vehiculos_turismo':           { coefMax: 16, periodoMax: 14,  descripcion: 'Vehículos turismo y todoterreno' },
  'vehiculos_transporte':        { coefMax: 20, periodoMax: 10,  descripcion: 'Camiones y vehículos de transporte' },
  'mobiliario':                  { coefMax: 10, periodoMax: 20,  descripcion: 'Mobiliario y enseres' },
  'equipos_informaticos':        { coefMax: 25, periodoMax: 8,   descripcion: 'Equipos para procesos de información' },
  'utillaje':                    { coefMax: 30, periodoMax: 8,   descripcion: 'Útiles y herramientas' },
  'sistemas_telecomunicaciones': { coefMax: 25, periodoMax: 8,   descripcion: 'Sistemas y programas informáticos' },
  'otro':                        { coefMax: 10, periodoMax: 20,  descripcion: 'Otros elementos de inmovilizado' },
};

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type MetodoAmortizacion = 'lineal' | 'porcentaje_constante' | 'suma_digitos';
export type GrupoRIS = keyof typeof COEFICIENTES_RIS_2004;

export interface FilaAmortizacion {
  /** Año del ejercicio (1, 2, 3...) */
  anio: number;
  /** Valor neto contable al inicio del ejercicio (€) */
  valorNetoInicio: number;
  /** Cuota de amortización del ejercicio (€) */
  cuotaAmortizacion: number;
  /** Amortización acumulada al final del ejercicio (€) */
  amortizacionAcumulada: number;
  /** Valor neto contable al final del ejercicio (€) */
  valorNetoFinal: number;
  /** Ahorro fiscal estimado (cuota × tipo IS/IRPF) (€) */
  ahorroFiscalEjercicio: number;
}

export interface ParametrosAmortizacionContable {
  /** Coste de adquisición del activo (€) */
  costeAdquisicion: number;
  /** Valor residual estimado al final de la vida útil (€). Por defecto 0. */
  valorResidual?: number;
  /** Vida útil en años */
  vidaUtil: number;
  /** Método de amortización. Por defecto 'lineal'. */
  metodo?: MetodoAmortizacion;
  /** Grupo RIS 2004 del activo (para validar coeficientes) */
  grupoRIS?: GrupoRIS;
  /** Tipo IS o IRPF del contribuyente (%) para calcular ahorro fiscal. Por defecto 25. */
  tipoImpuesto?: number;
  /**
   * Porcentaje de amortización acelerada para el método porcentaje_constante (%).
   * Si no se indica, se usa el doble del coeficiente lineal equivalente.
   */
  porcentajeConstante?: number;
}

export interface ResultadoAmortizacionContable {
  /** Método usado */
  metodo: MetodoAmortizacion;
  /** Coste de adquisición (€) */
  costeAdquisicion: number;
  /** Valor amortizable (coste - valor residual) (€) */
  valorAmortizable: number;
  /** Cuota anual lineal (€) — referencia */
  cuotaLinealAnual: number;
  /** Coeficiente máximo RIS (%) si se indicó grupo */
  coeficienteRISMax?: number;
  /** ¿El plazo indicado es compatible con RIS? */
  compatibleRIS?: boolean;
  /** Tabla de amortización año a año */
  tabla: FilaAmortizacion[];
  /** Total amortización (debe coincidir con valorAmortizable) (€) */
  totalAmortizado: number;
  /** Total ahorro fiscal acumulado (€) */
  totalAhorroFiscal: number;
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularAmortizacionContable(p: ParametrosAmortizacionContable): ResultadoAmortizacionContable {
  if (p.costeAdquisicion <= 0) throw new Error('El coste de adquisición debe ser mayor que cero.');
  if (p.vidaUtil <= 0 || p.vidaUtil > 100) throw new Error('La vida útil debe estar entre 1 y 100 años.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const valorResidual = p.valorResidual ?? 0;
  const valorAmortizable = r(p.costeAdquisicion - valorResidual);
  if (valorAmortizable < 0) throw new Error('El valor residual no puede superar el coste de adquisición.');

  const metodo = p.metodo ?? 'lineal';
  const tipoImpuesto = p.tipoImpuesto ?? 25;
  const cuotaLinealAnual = r(valorAmortizable / p.vidaUtil);

  // Validación RIS si se indicó grupo
  let coeficienteRISMax: number | undefined;
  let compatibleRIS: boolean | undefined;
  if (p.grupoRIS && COEFICIENTES_RIS_2004[p.grupoRIS]) {
    const grupoData = COEFICIENTES_RIS_2004[p.grupoRIS];
    coeficienteRISMax = grupoData.coefMax;
    const coefLinealUsado = r(100 / p.vidaUtil);
    compatibleRIS = coefLinealUsado <= grupoData.coefMax && p.vidaUtil <= grupoData.periodoMax;
  }

  const tabla: FilaAmortizacion[] = [];
  let valorNetoActual = p.costeAdquisicion;
  let acumulada = 0;

  // Porcentaje constante (degresiva): doble del lineal, máx 2× lineal
  const pctConstante = p.porcentajeConstante
    ? p.porcentajeConstante / 100
    : Math.min((2 / p.vidaUtil), 0.5); // máximo 50%

  // Suma de dígitos: S = n(n+1)/2
  const sumaDigitos = (p.vidaUtil * (p.vidaUtil + 1)) / 2;

  for (let anio = 1; anio <= p.vidaUtil; anio++) {
    const inicio = r(valorNetoActual);
    let cuota: number;

    switch (metodo) {
      case 'lineal':
        cuota = anio < p.vidaUtil
          ? cuotaLinealAnual
          : r(valorAmortizable - acumulada); // último año ajusta redondeo
        break;

      case 'porcentaje_constante': {
        const base = r(valorNetoActual - valorResidual);
        cuota = anio < p.vidaUtil
          ? r(base * pctConstante)
          : r(valorAmortizable - acumulada); // último año amortiza el resto
        break;
      }

      case 'suma_digitos': {
        const digito = p.vidaUtil - anio + 1; // dígitos decrecientes
        cuota = anio < p.vidaUtil
          ? r(valorAmortizable * digito / sumaDigitos)
          : r(valorAmortizable - acumulada);
        break;
      }

      default:
        throw new Error('Método de amortización no reconocido.');
    }

    // Aseguramos que no supere el valor amortizable pendiente
    cuota = Math.min(cuota, r(valorAmortizable - acumulada));
    cuota = r(cuota);

    acumulada = r(acumulada + cuota);
    valorNetoActual = r(p.costeAdquisicion - acumulada);
    const ahorroFiscal = r(cuota * (tipoImpuesto / 100));

    tabla.push({
      anio,
      valorNetoInicio: inicio,
      cuotaAmortizacion: cuota,
      amortizacionAcumulada: acumulada,
      valorNetoFinal: valorNetoActual,
      ahorroFiscalEjercicio: ahorroFiscal,
    });
  }

  const totalAmortizado = r(tabla.reduce((s, f) => s + f.cuotaAmortizacion, 0));
  const totalAhorroFiscal = r(tabla.reduce((s, f) => s + f.ahorroFiscalEjercicio, 0));

  return {
    metodo,
    costeAdquisicion: r(p.costeAdquisicion),
    valorAmortizable,
    cuotaLinealAnual,
    coeficienteRISMax,
    compatibleRIS,
    tabla,
    totalAmortizado,
    totalAhorroFiscal,
    fuenteDatos: 'Reglamento IS (RDL 4/2004) art. 12 + Tabla oficial de coeficientes de amortización — RIRPF art. 30 actividades económicas',
  };
}
