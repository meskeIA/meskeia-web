/**
 * Calculadora de Regimen Fiscal Especial de Trabajadores Desplazados (Impatriados)
 * Usada por: MCP server (calcular_regimen_impatriados)
 *
 * Calcula la carga fiscal bajo el regimen especial para trabajadores desplazados
 * a Espana, conocido coloquialmente como "Ley Beckham" (LIRPF art. 93).
 * Permite tributar como no residente (IRNR) a tipos fijos durante 6 anos.
 *
 * Marco normativo:
 *   - LIRPF art. 93: regimen especial impatriados
 *   - RIRNR: tipos de gravamen para no residentes
 *   - Ley 28/2022 (Ley Startups): ampliacion a emprendedores y nomadas digitales
 *
 * CONDICIONES DE ACCESO (LIRPF art. 93.1):
 *   1. No haber sido residente en Espana en los 5 anos anteriores al desplazamiento
 *   2. El desplazamiento debe producirse por:
 *      a) Contrato de trabajo (incluido deportistas — Beckham original)
 *      b) Adquisicion de la condicion de administrador de entidad (desde Ley Startups)
 *      c) Actividad economica calificada como emprendedora (desde Ley Startups)
 *      d) Actividad economica de altamente cualificados que presten servicios
 *         a empresas de tecnologia, o que lleven a cabo actividades de formacion,
 *         investigacion, desarrollo e innovacion (nomadas digitales)
 *   3. No obtener rentas a traves de establecimiento permanente en Espana
 *
 * DURACION: 6 anos fiscales (el de llegada + 5 siguientes)
 *
 * ESCALA DE GRAVAMEN (como no residente — IRNR):
 *   - Rentas del trabajo hasta 600.000 EUR: 24%
 *   - Rentas del trabajo que excedan 600.000 EUR: 47%
 *   - Rentas del capital mobiliario y otras: escala ahorro (igual que IRPF)
 *   - Dividendos, intereses, ganancias: tipos del ahorro (19%-28%)
 *
 * VENTAJAS VS IRPF GENERAL:
 *   - El 24% es fijo hasta 600.000 EUR (sin tramos progresivos que llegan al 47%)
 *   - Las rentas del trabajo de fuente extranjera NO tributan en Espana
 *   - Patrimonio: solo bienes situados en Espana (no obligacion informar bienes exterior)
 *   - Ahorro en Modelo 720 (bienes en el exterior)
 *
 * INCONVENIENTES:
 *   - No se pueden aplicar deducciones familiares (minimo personal/familiar, hijos...)
 *   - No se puede optar por declaracion conjunta
 *   - Cuotas SS mas altas (cotiza como trabajador extranjero en muchos casos)
 *
 * Fuente: LIRPF art. 93 + Ley 28/2022 (Startups) - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_sueldo_neto, calcular_irnr
 */

// --- Constantes ---

const LIMITE_TIPO_REDUCIDO = 600_000;   // EUR - hasta aqui al 24%
const TIPO_REDUCIDO = 24;               // % hasta 600.000 EUR
const TIPO_EXCESO = 47;                 // % sobre el exceso de 600.000 EUR
const DURACION_REGIMEN_ANOS = 6;        // anos de aplicacion del regimen

// Escala del ahorro 2025 (misma que IRPF general)
const TRAMOS_AHORRO: { hasta: number; tipo: number }[] = [
  { hasta: 6_000,   tipo: 19 },
  { hasta: 50_000,  tipo: 21 },
  { hasta: 200_000, tipo: 23 },
  { hasta: 300_000, tipo: 27 },
  { hasta: Infinity, tipo: 28 },
];

// --- Tipos publicos ---

export type MotivoDesplazamiento =
  | 'contrato_trabajo'          // Contrato de trabajo con empresa espanola
  | 'administrador_entidad'     // Administrador de sociedad (Ley Startups)
  | 'emprendedor'               // Actividad emprendedora (Ley Startups)
  | 'nomada_digital'            // Teletrabajador internacional (Ley Startups)
  | 'investigacion_docencia';   // I+D o docencia en universidad/centro

export interface ParametrosRegimenImpatriados {
  motivoDesplazamiento: MotivoDesplazamiento;
  /** Salario bruto anual de fuente espanola (EUR) */
  salarioBrutoAnualEspana: number;
  /** Rentas del trabajo de fuente extranjera (EUR) — EXENTAS bajo el regimen */
  salarioFuenteExtranjera?: number;
  /** Rendimientos del capital mobiliario (dividendos, intereses) (EUR) */
  rendimientosCapitalMobiliario?: number;
  /** Ganancias patrimoniales del ahorro (EUR) */
  gananciasPatrimoniales?: number;
  /** Cuota SS anual en Espana (EUR) — deducible del salario bruto */
  cuotaSSAnual?: number;
  /** Anio del regimen (1-6) — para informacion sobre duracion restante */
  anoRegimen?: number;
}

export interface ResultadoRegimenImpatriados {
  motivoDesplazamiento: MotivoDesplazamiento;
  /** Salario bruto Espana (EUR) */
  salarioBrutoEspana: number;
  /** Salario fuente extranjera exento (EUR) */
  salarioExentoExtranjero: number;
  /** Base del trabajo sujeta (EUR) */
  baseTrabajoSujeta: number;
  /** Cuota trabajo tramo 24% (EUR) */
  cuotaTrabajo24pct: number;
  /** Cuota trabajo tramo 47% sobre exceso 600.000 EUR (EUR) */
  cuotaTrabajo47pct: number;
  /** Cuota total rentas del trabajo (EUR) */
  cuotaTotalTrabajo: number;
  /** Cuota rentas del ahorro (EUR) */
  cuotaAhorro: number;
  /** Cuota total IRNR (EUR) */
  cuotaTotalIRNR: number;
  /** Tipo efectivo global (%) */
  tipoEfectivoGlobal: number;
  /** Anos de regimen restantes (informativo) */
  anosRestantes: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion auxiliar ---

function calcularCuotaAhorro(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let resto = base;
  let anterior = 0;
  for (const t of TRAMOS_AHORRO) {
    const tramo = Math.min(resto, t.hasta - anterior);
    cuota += tramo * t.tipo / 100;
    resto -= tramo;
    anterior = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

// --- Funcion principal ---

export function calcularRegimenImpatriados(p: ParametrosRegimenImpatriados): ResultadoRegimenImpatriados {
  if (p.salarioBrutoAnualEspana < 0) throw new Error('El salario bruto debe ser mayor o igual a cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const cuotaSS = p.cuotaSSAnual ?? 0;
  const baseTrabajoSujeta = r(Math.max(0, p.salarioBrutoAnualEspana - cuotaSS));

  // Cuota trabajo: 24% hasta 600k, 47% sobre exceso
  const baseHasta600k = Math.min(baseTrabajoSujeta, LIMITE_TIPO_REDUCIDO);
  const baseExceso = Math.max(0, baseTrabajoSujeta - LIMITE_TIPO_REDUCIDO);
  const cuotaTrabajo24pct = r(baseHasta600k * TIPO_REDUCIDO / 100);
  const cuotaTrabajo47pct = r(baseExceso * TIPO_EXCESO / 100);
  const cuotaTotalTrabajo = r(cuotaTrabajo24pct + cuotaTrabajo47pct);

  // Rentas del ahorro
  const baseAhorro = r((p.rendimientosCapitalMobiliario ?? 0) + (p.gananciasPatrimoniales ?? 0));
  const cuotaAhorro = r(calcularCuotaAhorro(baseAhorro));
  const cuotaTotalIRNR = r(cuotaTotalTrabajo + cuotaAhorro);

  const salarioExentoExtranjero = r(p.salarioFuenteExtranjera ?? 0);
  const ingresosTotales = r(p.salarioBrutoAnualEspana + salarioExentoExtranjero + baseAhorro);
  const tipoEfectivoGlobal = ingresosTotales > 0 ? r(cuotaTotalIRNR / ingresosTotales * 100) : 0;

  const anoRegimen = p.anoRegimen ?? 1;
  const anosRestantes = Math.max(0, DURACION_REGIMEN_ANOS - anoRegimen);

  // Advertencias
  if (p.motivoDesplazamiento === 'nomada_digital' || p.motivoDesplazamiento === 'emprendedor') {
    advertencias.push(
      'Ley Startups (Ley 28/2022): desde el 1 de enero de 2023, el regimen se amplia a emprendedores, ' +
      'administradores de empresas (con participacion <25%) y nomadas digitales que presten servicios ' +
      'a empresas o clientes fuera de Espana. El porcentaje de teletrabajo para clientes espanoles no ' +
      'puede superar el 20% del total de la actividad.'
    );
  }
  advertencias.push(
    'Rentas fuente extranjera: bajo este regimen, los rendimientos del trabajo de fuente extranjera ' +
    'NO tributan en Espana (al contrario que en el IRPF general por residencia). ' +
    'Esto es la principal ventaja para trabajadores con clientes o empleadores en el extranjero.'
  );
  advertencias.push(
    'INCOMPATIBILIDADES: no se puede aplicar el minimo personal ni familiar, ni deduccion por hijos, ' +
    'ni declaracion conjunta, ni deducciones autonomicas. ' +
    'Para familias con hijos o patrimonios complejos, compare con el IRPF general.'
  );
  advertencias.push(
    'Duracion: ' + DURACION_REGIMEN_ANOS + ' anos fiscales (el del desplazamiento + 5 siguientes). ' +
    'Quedan aproximadamente ' + anosRestantes + ' anos de regimen. ' +
    'La renuncia es voluntaria pero irrevocable para ese ejercicio.'
  );
  advertencias.push(
    'Modelo 149: solicitud de aplicacion del regimen en los 6 meses siguientes al inicio de la actividad en Espana. ' +
    'Si no se presenta en plazo, se pierde el derecho al regimen para ese ejercicio.'
  );

  return {
    motivoDesplazamiento: p.motivoDesplazamiento,
    salarioBrutoEspana: r(p.salarioBrutoAnualEspana),
    salarioExentoExtranjero,
    baseTrabajoSujeta,
    cuotaTrabajo24pct,
    cuotaTrabajo47pct,
    cuotaTotalTrabajo,
    cuotaAhorro,
    cuotaTotalIRNR,
    tipoEfectivoGlobal,
    anosRestantes,
    advertencias,
    fuenteDatos: 'LIRPF art. 93 + Ley 28/2022 (Startups) - vigente 2025',
  };
}
