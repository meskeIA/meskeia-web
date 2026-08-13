/**
 * Calculadora de Prestación por Nacimiento y Cuidado de Menor — lógica pura
 * Usada por: MCP server (calcular_permiso_parental)
 *
 * Calcula la prestación económica de la Seguridad Social por nacimiento,
 * adopción o acogimiento (baja por maternidad/paternidad), conforme al
 * Real Decreto-ley 6/2019 que equiparó los permisos de ambos progenitores.
 *
 * Duración vigente (RDL 9/2025, en vigor desde el 31-jul-2025):
 * - 19 semanas por progenitor en familia biparental; 32 en monoparental
 * - Las 6 primeras son obligatorias e ininterrumpidas tras el parto
 * - El resto se disfruta de forma flexible, y puede ser a tiempo parcial
 *
 * Cuantía: 100% de la base reguladora (base de cotización del mes anterior / 30),
 * EXENTA de IRPF (art. 7.h de la Ley 35/2006).
 *
 * ⚠️ CORREGIDO EL 13/08/2026 — este motor arrastraba tres errores desde su
 * último sello (2025-01-15), todos anteriores al RDL 9/2025:
 *   1. 16 semanas fijas, la duración derogada el 31-jul-2025, sin distinguir
 *      familia monoparental.
 *   2. +2 semanas por hijo adicional en parto múltiple, cuando el RDL 9/2025
 *      fija 1 (`maternidad.ts` ya tenía el dato correcto).
 *   3. Descontaba una retención de IRPF de una prestación EXENTA, de modo que
 *      anunciaba un neto INFERIOR al que se cobra. Los campos `retencionIRPF`
 *      y `cuantiaMensualNeta` se conservan por compatibilidad, siempre a 0 y
 *      al bruto respectivamente.
 * El fallo pudo pasar desapercibido tanto tiempo porque el módulo hardcodeaba
 * sus semanas en vez de importarlas de `data/fiscal/maternidad.ts`, que sí está
 * bajo el manifiesto de vigilancia y sí se actualizó a su debido tiempo.
 *
 * ⚠️ DUPLICA a `prestacionMaternidadPaternidad.ts`, que cubre lo mismo con más
 * detalle (carencia del art. 178 y subsidio no contributivo del art. 182).
 * Unificarlos está pendiente de decidir: ver la Agenda Operativa.
 *
 * Fuente: LGSS arts. 177-182 (RDL 8/2015) + RDL 9/2025 (BOE-A-2025-15741) + RD 295/2009
 * Verificado: 2026-08-13
 *
 * Encadenable con: calcular_sueldo_neto, calcular_baja_medica, calcular_irpf
 */

import { PERMISO_NACIMIENTO, AMPLIACION_POR_ID } from '@/data/fiscal';

// ─── Constantes ────────────────────────────────────────────────────────────────
// Fuente única: data/fiscal/maternidad.ts. Nada de semanas escritas a mano aquí.

const PERMISO_BIPARENTAL = PERMISO_NACIMIENTO.find((p) => p.tipoFamilia === 'biparental')!;
const PERMISO_MONOPARENTAL = PERMISO_NACIMIENTO.find((p) => p.tipoFamilia === 'monoparental')!;

const SEMANAS_OBLIGATORIAS = PERMISO_BIPARENTAL.semanasObligatorias; // 6, ininterrumpidas al inicio
const SEMANAS_POR_HIJO_ADICIONAL = AMPLIACION_POR_ID['parto-multiple'].semanasExtra;
const SEMANAS_DISCAPACIDAD = AMPLIACION_POR_ID['discapacidad-menor'].semanasExtra;
const SEMANAS_MAX_HOSPITALIZACION = AMPLIACION_POR_ID['hospitalizacion-neonatal'].semanasExtra;
const DIAS_SEMANA = 7;                  // la prestación se calcula en días naturales
const PCT_PRESTACION = 1.00;            // 100% de la base reguladora

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SituacionLaboral = 'empleado' | 'autonomo' | 'funcionario';
export type ModoDisfrute = 'completo' | 'parcial_50' | 'parcial_75' | 'parcial_87_5';
export type TipoFamiliaPermiso = 'biparental' | 'monoparental';

export interface ParametrosPermisoParental {
  /** Situación laboral del beneficiario */
  situacionLaboral?: SituacionLaboral;
  /** Base de cotización del mes anterior al inicio del permiso (€) */
  baseCotizacionMensual: number;
  /** Modo de disfrute del permiso (las 10 semanas voluntarias). Por defecto 'completo'. */
  modoDisfrute?: ModoDisfrute;
  /** Tipo de familia: 'biparental' (19 semanas) o 'monoparental' (32, RDL 9/2025). Por defecto biparental. */
  tipoFamilia?: TipoFamiliaPermiso;
  /** ¿Parto/adopción múltiple? (+1 semana por cada hijo a partir del segundo). Por defecto false. */
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
  /** Tipo de familia aplicado */
  tipoFamilia: TipoFamiliaPermiso;
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

  // Semanas base según el tipo de familia (RDL 9/2025)
  const tipoFamilia = p.tipoFamilia ?? 'biparental';
  const semanasBase = tipoFamilia === 'monoparental'
    ? PERMISO_MONOPARENTAL.semanasTotal
    : PERMISO_BIPARENTAL.semanasTotal;

  // Semanas adicionales
  const semanasMultiple = p.partoMultiple && numHijos > 1 ? (numHijos - 1) * SEMANAS_POR_HIJO_ADICIONAL : 0;
  const semanasDiscapacidad = p.discapacidadHijo ? SEMANAS_DISCAPACIDAD : 0;
  // Hospitalización: un día por cada día de ingreso, con el tope del módulo
  const semanasHospitalizacion = Math.min(SEMANAS_MAX_HOSPITALIZACION, Math.ceil(hospitalizacion / 7));

  const semanasPermiso = semanasBase + semanasMultiple + semanasDiscapacidad + semanasHospitalizacion;
  const diasPermiso = semanasPermiso * DIAS_SEMANA;

  // Base reguladora
  const baseReguladoraDiaria = r(p.baseCotizacionMensual / 30);
  const cuantiaDiariaBruta = r(baseReguladoraDiaria * PCT_PRESTACION);
  const cuantiaMensualBruta = r(cuantiaDiariaBruta * 30);

  // IRPF: la prestación está EXENTA (art. 7.h Ley 35/2006), así que no hay
  // retención que descontar y el neto coincide con el bruto. Los dos campos se
  // mantienen para no romper a quien ya los lee.
  const retencionIRPF = 0;
  const cuantiaMensualNeta = cuantiaMensualBruta;

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
    'Los autónomos también tienen derecho a esta prestación si están al corriente de pago y acreditan el período mínimo de cotización que corresponda a su edad (art. 178 LGSS).',
    'La prestación está EXENTA de IRPF: no se declara ni soporta retención (art. 7.h de la Ley 35/2006, redacción del RDL 27/2018).',
    `El permiso es intransferible entre progenitores. Cada progenitor de una familia biparental tiene derecho individual a ${PERMISO_BIPARENTAL.semanasTotal} semanas, y el progenitor único de una familia monoparental a ${PERMISO_MONOPARENTAL.semanasTotal} (RDL 9/2025, en vigor desde el 31 de julio de 2025).`,
  ];
  if (situacion === 'autonomo') {
    advertencias.push('Para autónomos: la actividad debe quedar suspendida durante el período de descanso obligatorio (6 semanas). En el período voluntario puede compatibilizarse con el trabajo.');
  }

  return {
    situacionLaboral: situacion,
    tipoFamilia,
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
    fuenteDatos: 'LGSS arts. 177-182 (RDL 8/2015) + RDL 9/2025 (BOE-A-2025-15741) — verificado 2026-08-13',
  };
}
