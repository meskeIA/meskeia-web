/**
 * Calculadora de Prestacion por Cese de Actividad de Autonomos
 * Usada por: MCP server (calcular_prestacion_cese_actividad)
 *
 * Calcula la prestacion economica por cese de actividad (equivalente al
 * paro de los trabajadores por cuenta ajena) para los trabajadores
 * autonomos acogidos al sistema de proteccion por cese de actividad.
 *
 * Marco normativo:
 *   - LGSS arts. 327-346: proteccion por cese de actividad
 *   - RD 1541/2011: reglamento de la prestacion
 *   - Ley 6/2017 (LETA) y Ley 14/2022: modificaciones
 *   - LGSS art. 339: cese de actividad para autonomos en RETA
 *   - LGSS art. 327 bis (Ley 14/2022): nuevo cese parcial y cese por bajos ingresos
 *
 * REQUISITOS PARA ACCEDER A LA PRESTACION (LGSS art. 330):
 *   1. Estar afiliado y en alta en RETA (o SETA)
 *   2. Tener cubierto el periodo minimo de cotizacion por cese:
 *      - 12 meses continuados inmediatamente anteriores al cese
 *   3. Encontrarse en situacion legal de cese (ver causas)
 *   4. No haber cumplido la edad ordinaria de jubilacion
 *   5. Estar al corriente de pago de cuotas a la SS
 *   6. Suscribir el compromiso de actividad (busqueda activa de empleo)
 *
 * CAUSAS LEGALES DE CESE (LGSS art. 331):
 *   a) Concurrencia de motivos economicos, tecnicos, productivos u organizativos
 *      que hagan inviable la actividad:
 *      - Perdidas en dos trimestres completos consecutivos (por debajo del SMI)
 *      - Ejecuciones judiciales o administrativas
 *   b) Fuerza mayor determinante del cese
 *   c) Perdida de la licencia administrativa
 *   d) Violencia de genero
 *   e) Divorcio o separacion en caso de socio en empresa familiar
 *
 * NUEVO CESE POR BAJOS INGRESOS (Ley 14/2022 — desde 01/01/2023):
 *   Autonomos con ingresos netos trimestrales inferiores al 75% del SMI
 *   pueden acceder a un cese parcial temporal con prestacion reducida.
 *
 * CUANTIA (LGSS art. 339):
 *   - Base reguladora: promedio de bases de cotizacion por cese de los 12 meses anteriores
 *   - Porcentaje: 70% de la base reguladora
 *   - Minimo: 80% del IPREM mensual (con cargas familiares: 107% o 133%)
 *   - Maximo: 175% IPREM mensual (175% con 1 hijo, 200% con 2+ hijos)
 *
 * DURACION (LGSS art. 338):
 *   Meses cotizados → Meses de prestacion:
 *   12-17 → 2; 18-23 → 3; 24-29 → 4; 30-35 → 5; 36-42 → 6; 43-47 → 8; >= 48 → 12
 *   Mayores de 60 anos: maximo 24 meses (si cotizaron >= 48 meses)
 *
 * IPREM 2025: 600,00 EUR/mes (indicativo; confirmar dato oficial)
 *
 * Fuente: LGSS arts. 327-346 + RD 1541/2011 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_autonomos_cuota_ss, calcular_irpf, calcular_jubilacion_autonomo
 */

// --- Constantes ---

const IPREM_MENSUAL_2025 = 600.00;     // EUR/mes (pendiente actualizacion oficial 2025)
const PCT_CUANTIA = 70;                // % sobre base reguladora
const PCT_MINIMO_SIN_CARGAS = 80;      // % IPREM
const PCT_MINIMO_CON_CARGAS = 107;     // % IPREM con cargas familiares
const PCT_MAXIMO_SIN_HIJOS = 175;      // % IPREM
const PCT_MAXIMO_1_HIJO = 175;         // % IPREM (se mantiene igual — maximo general)
const PCT_MAXIMO_2_HIJOS = 200;        // % IPREM
const MESES_MINIMOS_COTIZACION = 12;

// Tabla cotizacion → duracion (meses cotizados minimo, duracion prestacion)
const TABLA_DURACION: { minMeses: number; duracion: number }[] = [
  { minMeses: 12, duracion: 2 },
  { minMeses: 18, duracion: 3 },
  { minMeses: 24, duracion: 4 },
  { minMeses: 30, duracion: 5 },
  { minMeses: 36, duracion: 6 },
  { minMeses: 43, duracion: 8 },
  { minMeses: 48, duracion: 12 },
];

// --- Tipos publicos ---

export type TipoCeseActividad =
  | 'economico_perdidas'          // Perdidas en 2 trimestres consecutivos < SMI
  | 'ejecucion_judicial'          // Ejecucion judicial o administrativa
  | 'fuerza_mayor'                // Fuerza mayor que impide continuar
  | 'perdida_licencia'            // Perdida de licencia o autorizacion administrativa
  | 'violencia_genero'            // Victima de violencia de genero
  | 'divorcio_empresa_familiar'   // Divorcio/separacion en empresa familiar
  | 'bajos_ingresos';             // Ingresos netos < 75% SMI por trimestre (desde 2023)

export interface ParametrosPrestacionCeseActividad {
  tipoCese: TipoCeseActividad;
  /**
   * Meses cotizados por cese de actividad en RETA
   * (cotizacion especifica para la contingencia de cese)
   */
  mesesCotizados: number;
  /**
   * Suma de las bases de cotizacion por cese de los ultimos 12 meses (EUR)
   * Para calcular la base reguladora (promedio)
   */
  sumaBases12Meses: number;
  /** Numero de hijos menores de 26 anos a cargo (0, 1, 2+) */
  hijosACargo: number;
  /** El autonomo tiene 60 o mas anos en el momento del cese? */
  edad60oMas?: boolean;
}

export interface ResultadoPrestacionCeseActividad {
  tipoCese: TipoCeseActividad;
  mesesCotizados: number;
  /** Base reguladora mensual (promedio bases 12 meses) (EUR) */
  baseReguladora: number;
  /** Cuantia bruta mensual calculada (70% base reguladora) (EUR) */
  cuantiaBruta: number;
  /** Cuantia minima aplicable (EUR/mes) */
  cuantiaMinima: number;
  /** Cuantia maxima aplicable (EUR/mes) */
  cuantiaMaxima: number;
  /** Cuantia mensual final (tras aplicar minimos y maximos) (EUR) */
  cuantiaMensual: number;
  /** Duracion maxima de la prestacion (meses) */
  duracionMeses: number;
  /** Importe total estimado de la prestacion (EUR) */
  importeTotalEstimado: number;
  /** La situacion cumple los requisitos legales? */
  cumpleRequisitos: boolean;
  motivoIncumplimiento?: string;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularPrestacionCeseActividad(
  p: ParametrosPrestacionCeseActividad
): ResultadoPrestacionCeseActividad {
  if (p.mesesCotizados < 0) throw new Error('Los meses cotizados no pueden ser negativos.');
  if (p.sumaBases12Meses < 0) throw new Error('La suma de bases no puede ser negativa.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // Verificar requisito minimo de cotizacion
  const cumpleRequisitos = p.mesesCotizados >= MESES_MINIMOS_COTIZACION;
  if (!cumpleRequisitos) {
    return {
      tipoCese: p.tipoCese,
      mesesCotizados: p.mesesCotizados,
      baseReguladora: 0,
      cuantiaBruta: 0,
      cuantiaMinima: 0,
      cuantiaMaxima: 0,
      cuantiaMensual: 0,
      duracionMeses: 0,
      importeTotalEstimado: 0,
      cumpleRequisitos: false,
      motivoIncumplimiento:
        'El autonomo no cumple el periodo minimo de cotizacion de ' + MESES_MINIMOS_COTIZACION +
        ' meses continuados por la contingencia de cese de actividad. ' +
        'Meses cotizados declarados: ' + p.mesesCotizados + '.',
      advertencias: [
        'Para acceder a la proteccion por cese de actividad es necesario haber cotizado ' +
        'especificamente por esta contingencia durante al menos 12 meses continuados e inmediatamente ' +
        'anteriores al cese. Verificar que la cuota de autonomo incluia la cobertura por cese.'
      ],
      fuenteDatos: 'LGSS arts. 327-346 + RD 1541/2011 — vigente 2025',
    };
  }

  // Base reguladora
  const baseReguladora = r(p.sumaBases12Meses / 12);
  const cuantiaBruta = r(baseReguladora * PCT_CUANTIA / 100);

  // Minimos y maximos
  const tieneCargas = p.hijosACargo > 0;
  const cuantiaMinima = r(IPREM_MENSUAL_2025 * (tieneCargas ? PCT_MINIMO_CON_CARGAS : PCT_MINIMO_SIN_CARGAS) / 100);
  const pctMax = p.hijosACargo >= 2 ? PCT_MAXIMO_2_HIJOS : PCT_MAXIMO_SIN_HIJOS;
  const cuantiaMaxima = r(IPREM_MENSUAL_2025 * pctMax / 100);
  const cuantiaMensual = r(Math.min(cuantiaMaxima, Math.max(cuantiaMinima, cuantiaBruta)));

  // Duracion
  let duracionMeses = 0;
  for (const fila of TABLA_DURACION) {
    if (p.mesesCotizados >= fila.minMeses) {
      duracionMeses = fila.duracion;
    }
  }
  // Mayores de 60 anos: hasta 24 meses si >= 48 cotizados
  if (p.edad60oMas && p.mesesCotizados >= 48) {
    duracionMeses = Math.max(duracionMeses, 24);
  }

  const importeTotalEstimado = r(cuantiaMensual * duracionMeses);

  advertencias.push(
    'IPREM 2025 utilizado: ' + IPREM_MENSUAL_2025.toLocaleString('es-ES') + ' EUR/mes. ' +
    'Confirmar el valor oficial del IPREM 2025 cuando se publique en el BOE (generalmente en enero).'
  );
  advertencias.push(
    'La prestacion esta sujeta a IRPF (retencion del 15% a cuenta). ' +
    'La base de cotizacion a la SS se mantiene durante el cobro de la prestacion ' +
    '(cotizacion por todas las contingencias).'
  );
  if (p.tipoCese === 'bajos_ingresos') {
    advertencias.push(
      'CESE POR BAJOS INGRESOS (desde 01/01/2023 — Ley 14/2022): el autonomo debe ' +
      'acreditar que sus ingresos netos del trimestre son inferiores al 75% del SMI. ' +
      'La prestacion en este caso es reducida (50% cuantia ordinaria) y compatible ' +
      'con el mantenimiento de la actividad.'
    );
  }
  advertencias.push(
    'Para solicitar la prestacion: presentar solicitud en el SEPE o Mutua colaboradora ' +
    'en el plazo de 15 dias habiles desde el cese. El derecho nace al dia siguiente del cese.'
  );

  return {
    tipoCese: p.tipoCese,
    mesesCotizados: p.mesesCotizados,
    baseReguladora,
    cuantiaBruta,
    cuantiaMinima,
    cuantiaMaxima,
    cuantiaMensual,
    duracionMeses,
    importeTotalEstimado,
    cumpleRequisitos: true,
    advertencias,
    fuenteDatos: 'LGSS arts. 327-346 + RD 1541/2011 — vigente 2025',
  };
}
