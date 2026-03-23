/**
 * Calculadora de Derechos de Autor e Intelectuales en IRPF
 * Usada por: MCP server (calcular_derechos_autor_irpf)
 *
 * Calcula la tributacion de los rendimientos derivados de la propiedad
 * intelectual, derechos de autor y de imagen en el IRPF, incluyendo la
 * reduccion del 60% para autores de obras literarias, artisticas o cientificas.
 *
 * Marco normativo:
 *   - LIRPF art. 25.4.a: rendimientos del capital mobiliario por cesion derechos
 *   - LIRPF art. 26.2: reduccion del 60% autores (Ley 26/2014, vigente desde 2015)
 *   - LIRPF art. 33: ganancias patrimoniales por transmision plena de derechos
 *   - LIRPF art. 27: cuando la actividad de autor es economica (empresarial/profesional)
 *   - LIRPF art. 95: derechos de imagen (regimen especial de imputacion de rentas)
 *
 * CLASIFICACION DE LOS RENDIMIENTOS POR DERECHOS DE AUTOR:
 *
 *   A) CAPITAL MOBILIARIO (LIRPF art. 25.4.a) CON REDUCCION 60%:
 *      - El propio AUTOR cede el derecho de explotacion de su obra
 *      - Reduccion del 60% sobre los rendimientos netos
 *      - Rendimiento neto reducido tributa en la BASE GENERAL (no del ahorro)
 *      - Gastos deducibles: los necesarios para obtener el rendimiento
 *        (cuotas de autor, gastos de produccion, agentes, etc.)
 *
 *   B) ACTIVIDAD ECONOMICA (LIRPF art. 27):
 *      - Cuando el autor realiza de forma habitual una actividad de creacion
 *        con medios propios (estudio, empleados, etc.) — es actividad economica
 *      - Tributa en estimacion directa (normal o simplificada)
 *      - SIN reduccion del 60% (el regimen de actividades economicas tiene sus
 *        propias reducciones y gastos deducibles)
 *
 *   C) GANANCIAS PATRIMONIALES (LIRPF art. 33):
 *      - Transmision PLENA de los derechos (no cesion temporal)
 *      - Tributa en base del ahorro (19-28%)
 *      - Sin la reduccion del 60%
 *
 *   D) DERECHOS DE IMAGEN (LIRPF art. 92):
 *      - Cesion de imagen a traves de sociedad interpuesta
 *      - Imputacion especial si empresa paga a sociedad del artista
 *      - Tipo del 19% sobre la contraprestacion recibida por la sociedad
 *
 * REDUCCION DEL 60% (LIRPF art. 26.2):
 *   SOLO para: autor persona fisica que cede (no transmite) el derecho de
 *   explotacion de obras literarias, artisticas o cientificas.
 *   La reduccion aplica sobre el RENDIMIENTO NETO (ya descontados gastos).
 *   El resultado tributa en BASE GENERAL progresiva.
 *
 * Fuente: LIRPF arts. 25.4.a, 26.2, 27, 33, 92 - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_reduccion_irregular_irpf, calcular_retribucion_especie
 */

// --- Constantes ---

const PCT_REDUCCION_AUTOR = 60;           // % reduccion rendimientos autor capital mobiliario
const PCT_RETENCION_AUTOR_GENERAL = 19;   // % retencion estandar derechos de autor
const PCT_RETENCION_AUTOR_REDUCIDO = 7;   // % retencion reducida si rendimientos < 15.000 EUR y < 25% total

// Escala general 2025 (base general - tramos IRPF estado + autonomia, estimacion)
const TRAMOS_GENERALES_ESTIMADOS: { hasta: number; tipo: number }[] = [
  { hasta: 12_450,  tipo: 19 },
  { hasta: 20_200,  tipo: 24 },
  { hasta: 35_200,  tipo: 30 },
  { hasta: 60_000,  tipo: 37 },
  { hasta: 300_000, tipo: 45 },
  { hasta: Infinity, tipo: 47 },
];

// --- Tipos publicos ---

export type TipoRendimientoAutor =
  | 'cesion_derechos_capital_mobiliario'  // Autor cede explotacion — con reduccion 60%
  | 'actividad_economica_habitual'         // Autor como actividad economica — sin reduccion
  | 'transmision_plena_derechos'           // Venta de derechos — ganancia patrimonial ahorro
  | 'derechos_imagen';                     // Imagen cedida a sociedad interpuesta

export interface ParametrosDerechosAutorIRPF {
  tipoRendimiento: TipoRendimientoAutor;
  /** Ingresos brutos por derechos de autor/imagen (EUR) */
  ingresosBrutos: number;
  /** Gastos deducibles directamente relacionados (EUR) */
  gastosDeducibles?: number;
  /**
   * Valor de adquisicion de los derechos (EUR)
   * Solo para transmision_plena_derechos (calcula G/P patrimonial)
   */
  valorAdquisicionDerechos?: number;
  /** Retenciones ya practicadas (EUR) */
  retencionesPracticadas?: number;
}

export interface ResultadoDerechosAutorIRPF {
  tipoRendimiento: TipoRendimientoAutor;
  ingresosBrutos: number;
  gastosDeducibles: number;
  rendimientoNeto: number;
  /** Importe de la reduccion (EUR) — solo si cesion derechos capital mobiliario */
  importeReduccion: number;
  /** Rendimiento neto reducido o ganancia patrimonial sujeta (EUR) */
  baseImponible: number;
  /** Cuota IRPF estimada (EUR) */
  cuotaEstimada: number;
  /** Tipo efectivo estimado sobre ingresos brutos (%) */
  tipoEfectivo: number;
  /** Retencion aplicable (%) */
  pctRetencion: number;
  /** Cuota diferencial (cuota - retenciones) (EUR) */
  cuotaDiferencial: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funciones auxiliares ---

function cuotaGeneral(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let resto = base;
  let ant = 0;
  for (const t of TRAMOS_GENERALES_ESTIMADOS) {
    const tramo = Math.min(resto, t.hasta - ant);
    cuota += tramo * t.tipo / 100;
    resto -= tramo;
    ant = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

function cuotaAhorro(base: number): number {
  if (base <= 0) return 0;
  const tramos = [
    { hasta: 6_000, tipo: 19 }, { hasta: 50_000, tipo: 21 },
    { hasta: 200_000, tipo: 23 }, { hasta: 300_000, tipo: 27 }, { hasta: Infinity, tipo: 28 },
  ];
  let cuota = 0;
  let resto = base;
  let ant = 0;
  for (const t of tramos) {
    const tramo = Math.min(resto, t.hasta - ant);
    cuota += tramo * t.tipo / 100;
    resto -= tramo;
    ant = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

// --- Funcion principal ---

export function calcularDerechosAutorIRPF(p: ParametrosDerechosAutorIRPF): ResultadoDerechosAutorIRPF {
  if (p.ingresosBrutos <= 0) throw new Error('Los ingresos brutos deben ser mayores que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const gastosDeducibles = r(p.gastosDeducibles ?? 0);
  const rendimientoNeto = r(Math.max(0, p.ingresosBrutos - gastosDeducibles));
  let importeReduccion = 0;
  let baseImponible = 0;
  let cuotaEstimada = 0;
  let pctRetencion = PCT_RETENCION_AUTOR_GENERAL;

  switch (p.tipoRendimiento) {
    case 'cesion_derechos_capital_mobiliario': {
      importeReduccion = r(rendimientoNeto * PCT_REDUCCION_AUTOR / 100);
      baseImponible = r(rendimientoNeto - importeReduccion);
      cuotaEstimada = r(cuotaGeneral(baseImponible));
      if (p.ingresosBrutos < 15_000) {
        pctRetencion = PCT_RETENCION_AUTOR_REDUCIDO;
        advertencias.push(
          'Retencion reducida: si los rendimientos de derechos de autor del periodo no superan ' +
          '15.000 EUR Y representan menos del 25% de la totalidad de los rendimientos del trabajo, ' +
          'la retencion aplicable es del ' + PCT_RETENCION_AUTOR_REDUCIDO + '% (en lugar del ' +
          PCT_RETENCION_AUTOR_GENERAL + '%).'
        );
      }
      advertencias.push(
        'Reduccion del ' + PCT_REDUCCION_AUTOR + '% (LIRPF art. 26.2): aplicable SOLO al propio autor ' +
        'que cede (no transmite) los derechos de explotacion de obras literarias, artisticas o cientificas. ' +
        'No aplica a editores, distribuidores ni a quienes adquieren los derechos de un tercero.'
      );
      break;
    }
    case 'actividad_economica_habitual': {
      baseImponible = rendimientoNeto;
      cuotaEstimada = r(cuotaGeneral(baseImponible));
      pctRetencion = 15;
      advertencias.push(
        'Actividad economica: si la creacion de obras es la actividad habitual del autor con medios ' +
        'propios, tributa en estimacion directa (LIRPF art. 27). NO se aplica la reduccion del 60%. ' +
        'Puede deducirse todos los gastos necesarios: amortizacion de equipos, cuotas de autor, ' +
        'viajes de investigacion, biblioteca profesional, etc.'
      );
      break;
    }
    case 'transmision_plena_derechos': {
      const valorAdq = r(p.valorAdquisicionDerechos ?? 0);
      baseImponible = r(Math.max(0, rendimientoNeto - valorAdq));
      cuotaEstimada = r(cuotaAhorro(baseImponible));
      pctRetencion = 19;
      advertencias.push(
        'Transmision plena de derechos: la venta definitiva de los derechos de autor genera una ' +
        'GANANCIA PATRIMONIAL (no rendimiento de capital). Tributa en la base del ahorro (19-28%). ' +
        'No aplica la reduccion del 60% ni la retencion de derechos de autor (19% de ganancias).'
      );
      break;
    }
    case 'derechos_imagen': {
      baseImponible = rendimientoNeto;
      cuotaEstimada = r(rendimientoNeto * 0.19); // tipo especial 19% LIRPF art. 92
      pctRetencion = 19;
      advertencias.push(
        'Derechos de imagen cedidos a sociedad interpuesta (LIRPF art. 92): ' +
        'si la empresa paga a una sociedad del artista por los derechos de imagen, ' +
        'el artista persona fisica debe imputar como renta la contraprestacion recibida por la sociedad. ' +
        'Tipo especial del 19%. Requiere que el 85% de los ingresos de la sociedad provengan de la imagen.'
      );
      break;
    }
  }

  const retencionesPracticadas = r(p.retencionesPracticadas ?? 0);
  const cuotaDiferencial = r(cuotaEstimada - retencionesPracticadas);
  const tipoEfectivo = p.ingresosBrutos > 0 ? r(cuotaEstimada / p.ingresosBrutos * 100) : 0;

  return {
    tipoRendimiento: p.tipoRendimiento,
    ingresosBrutos: r(p.ingresosBrutos),
    gastosDeducibles,
    rendimientoNeto,
    importeReduccion,
    baseImponible,
    cuotaEstimada,
    tipoEfectivo,
    pctRetencion,
    cuotaDiferencial,
    advertencias,
    fuenteDatos: 'LIRPF arts. 25.4.a, 26.2, 27, 33, 92 - vigente 2025',
  };
}
