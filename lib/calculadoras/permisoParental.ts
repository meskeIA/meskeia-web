/**
 * Calculadora de Prestación por Nacimiento y Cuidado de Menor — lógica pura
 * Usada por: MCP server (calcular_permiso_parental)
 *
 * Calcula la prestación económica de la Seguridad Social por nacimiento,
 * adopción o acogimiento (baja por maternidad/paternidad), conforme al
 * Real Decreto-ley 6/2019 que equiparó los permisos de ambos progenitores.
 *
 * Desde 2021: AMBOS progenitores tienen derecho a 16 semanas (112 días)
 * intransferibles e individuales.
 *
 * Cuantía: 100% de la base reguladora (base de cotización del mes anterior / 30)
 *
 * Duración del permiso:
 * - 16 semanas (112 días) para cada progenitor
 * - Las 6 primeras semanas son obligatorias e ininterrumpidas
 * - Las 10 semanas restantes pueden disfrutarse a tiempo parcial (50-75-87,5%)
 *
 * Disfrute a tiempo parcial: la prestación se reduce proporcionalmente
 * pero el período se amplía hasta cubrir las semanas correspondientes.
 *
 * Fuente: LGSS arts. 177-182 (RDL 8/2015) + RDL 6/2019 + RD 295/2009
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sueldo_neto, calcular_baja_medica, calcular_irpf
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const SEMANAS_PERMISO_TOTAL = 16;       // semanas por progenitor
const SEMANAS_OBLIGATORIAS = 6;         // semanas ininterrumpidas obligatorias al inicio
const DIAS_SEMANA = 7;                  // la prestación se calcula en días naturales
const PCT_PRESTACION = 1.00;            // 100% de la base reguladora

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SituacionLaboral = 'empleado' | 'autonomo' | 'funcionario';
export type ModoDisfrute = 'completo' | 'parcial_50' | 'parcial_75' | 'parcial_87_5';

export interface ParametrosPermisoParental {
  /** Situación laboral del beneficiario */
  situacionLaboral?: SituacionLaboral;
  /** Base de cotización del mes anterior al inicio del permiso (€) */
  baseCotizacionMensual: number;
  /** Modo de disfrute del permiso (las 10 semanas voluntarias). Por defecto 'completo'. */
  modoDisfrute?: ModoDisfrute;
  /** ¿Parto/adopción múltiple? (+ 2 semanas por cada hijo a partir del segundo). Por defecto false. */
  partoMultiple?: boolean;
  /** Número de hijos en caso de parto múltiple. Por defecto 1. */
  numHijos?: number;
  /** ¿Hijo con discapacidad (≥33%)? (+ 2 semanas adicionales). Por defecto false. */
  discapacidadHijo?: boolean;
  /** ¿Parto prematuro u hospitalización tras el parto? (+ días de hospitalización). Por defecto 0. */
  diasHospitalizacion?: number;
}

export interface ResultadoPermisoParental {
  /** Situación laboral */
  situacionLaboral: SituacionLaboral;
  /** Semanas totales del permiso */
  semanasPermiso: number;
  /** Días naturales totales del permiso */
  diasPermiso: number;
  /** Base reguladora diaria (€) */
  baseReguladoraDiaria: number;
  /** Base reguladora mensual (€) */
  baseReguladoraMensual: number;
  /** Cuantía diaria bruta de la prestación (€) */
  cuantiaDiariaBruta: number;
  /** Cuantía mensual bruta equivalente (€) — para comparar con salario */
  cuantiaMensualBruta: number;
  /** Retención IRPF estimada (€/mes) */
  retencionIRPF: number;
  /** Cuantía mensual neta estimada (€) */
  cuantiaMensualNeta: number;
  /** Modo de disfrute */
  modoDisfrute: ModoDisfrute;
  /** Si es tiempo parcial: jornada trabajada (%) */
  jornadaTrabajada?: number;
  /** Si es tiempo parcial: semanas totales reales (ampliadas) */
  semanasRealesConParcial?: number;
  /** Detalle de semanas adicionales */
  semanasSuplementarias: {
    partoMultiple: number;
    discapacidad: number;
    hospitalizacion: number;
  };
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPermisoParental(p: ParametrosPermisoParental): ResultadoPermisoParental {
  if (p.baseCotizacionMensual <= 0) throw new Error('La base de cotización mensual debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  const situacion = p.situacionLaboral ?? 'empleado';
  const modo = p.modoDisfrute ?? 'completo';
  const numHijos = p.numHijos ?? 1;
  const hospitalizacion = p.diasHospitalizacion ?? 0;

  // Semanas adicionales
  const semanasMultiple = p.partoMultiple && numHijos > 1 ? (numHijos - 1) * 2 : 0;
  const semanasDiscapacidad = p.discapacidadHijo ? 2 : 0;
  // Hospitalización: hasta 13 semanas adicionales máx (días completos, convertir a semanas)
  const semanasHospitalizacion = Math.min(13, Math.ceil(hospitalizacion / 7));

  const semanasPermiso = SEMANAS_PERMISO_TOTAL + semanasMultiple + semanasDiscapacidad + semanasHospitalizacion;
  const diasPermiso = semanasPermiso * DIAS_SEMANA;

  // Base reguladora
  const baseReguladoraDiaria = r(p.baseCotizacionMensual / 30);
  const cuantiaDiariaBruta = r(baseReguladoraDiaria * PCT_PRESTACION);
  const cuantiaMensualBruta = r(cuantiaDiariaBruta * 30);

  // Retención IRPF estimada
  const cuantiaAnual = cuantiaMensualBruta * 12;
  let retencionPct = 0;
  if (cuantiaAnual > 20000) retencionPct = 15;
  else if (cuantiaAnual > 12000) retencionPct = 10;
  else if (cuantiaAnual > 7000) retencionPct = 7;
  const retencionIRPF = r(cuantiaMensualBruta * retencionPct / 100);
  const cuantiaMensualNeta = r(cuantiaMensualBruta - retencionIRPF);

  // Tiempo parcial
  let jornadaTrabajada: number | undefined;
  let semanasRealesConParcial: number | undefined;
  if (modo !== 'completo') {
    const reduccionMap: Record<ModoDisfrute, number> = {
      completo: 0,
      parcial_50: 50,
      parcial_75: 75,
      parcial_87_5: 87.5,
    };
    jornadaTrabajada = reduccionMap[modo];
    // Solo aplica a las 10 semanas voluntarias; las 6 obligatorias son siempre completas
    const pctPrestacionParcial = (100 - jornadaTrabajada) / 100;
    const semanasVoluntarias = semanasPermiso - SEMANAS_OBLIGATORIAS;
    const semanasAmpliadasVoluntarias = Math.ceil(semanasVoluntarias / pctPrestacionParcial);
    semanasRealesConParcial = SEMANAS_OBLIGATORIAS + semanasAmpliadasVoluntarias;
  }

  const advertencias: string[] = [
    'La prestación es compatible con el trabajo a tiempo parcial durante las semanas voluntarias. Las 6 primeras semanas son de descanso obligatorio.',
    'Los autónomos también tienen derecho a esta prestación si están al corriente de pago y han cotizado al menos 180 días en los últimos 7 años.',
    'La prestación tributa como rendimiento del trabajo en IRPF. La retención indicada es orientativa.',
    'El permiso es intransferible entre progenitores (desde RDL 6/2019). Cada progenitor tiene derecho individual a las 16 semanas.',
  ];
  if (situacion === 'autonomo') {
    advertencias.push('Para autónomos: la actividad debe quedar suspendida durante el período de descanso obligatorio (6 semanas). En el período voluntario puede compatibilizarse con el trabajo.');
  }

  return {
    situacionLaboral: situacion,
    semanasPermiso,
    diasPermiso,
    baseReguladoraDiaria,
    baseReguladoraMensual: r(p.baseCotizacionMensual),
    cuantiaDiariaBruta,
    cuantiaMensualBruta,
    retencionIRPF,
    cuantiaMensualNeta,
    modoDisfrute: modo,
    jornadaTrabajada,
    semanasRealesConParcial,
    semanasSuplementarias: {
      partoMultiple: semanasMultiple,
      discapacidad: semanasDiscapacidad,
      hospitalizacion: semanasHospitalizacion,
    },
    advertencias,
    fuenteDatos: 'LGSS arts. 177-182 (RDL 8/2015) + Real Decreto-ley 6/2019 — verificado 2025-01-15',
  };
}
