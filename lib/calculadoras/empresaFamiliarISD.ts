/**
 * Calculadora de Reduccion Empresa Familiar en el ISD — logica pura
 * Usada por: MCP server (calcular_empresa_familiar_isd)
 *
 * Calcula la reduccion del 95% aplicable en el Impuesto sobre Sucesiones
 * y Donaciones (ISD) sobre el valor de participaciones en empresas familiares
 * y negocios individuales, para fomentar la continuidad de las empresas familiares.
 *
 * Marco normativo:
 *   - LISD art. 20.2.c (herencia) y art. 20.6 (donacion): reduccion 95%
 *   - LIRPF art. 4.Ocho.Dos: exencion bienes afectos en Patrimonio (IP)
 *   - RD 1704/1999: condiciones para la exencion en IP (el ISD se remite a IP)
 *   - LISD art. 20.6.b: donacion empresa familiar — requisitos adicionales
 *
 * REQUISITOS PARA LA REDUCCION EN SUCESIONES (LISD art. 20.2.c):
 *   1. La empresa/participaciones deben estar EXENTAS en el Impuesto sobre el Patrimonio
 *      (art. 4.Ocho LIRPF/LIP) en el momento del fallecimiento.
 *   2. El heredero debe cumplir alguna de las siguientes condiciones:
 *      a) Ser conyuge, descendiente, ascendiente, o colateral hasta 3.er grado
 *      b) El empresario causante debe haber ejercido funciones de direccion
 *         y percibir por ello mas del 50% de sus rendimientos netos
 *   3. Los herederos deben MANTENER lo adquirido durante 5 o 10 anos (segun CCAA)
 *      sin enajenar ni perder el derecho a la exencion en IP.
 *
 * REQUISITOS PARA EXENCION EN IP (LIRPF art. 4.Ocho.Dos):
 *   - Empresa individual o participaciones en entidades
 *   - Actividad economica (no gestion de patrimonio puro — art. 25.2 LIS)
 *   - Participacion >= 5% individual o >= 20% con familiares hasta 2.o grado
 *   - Ejercicio efectivo de funciones de direccion
 *   - Retribucion por funciones de direccion > 50% de rendimientos netos totales
 *
 * PORCENTAJE DE REDUCCION:
 *   - Base general: 95% sobre el valor de la empresa/participaciones
 *   - Algunas CCAA amplian al 99% o al 100% (Pais Vasco, Navarra)
 *
 * MANTENIMIENTO (plazo minimo):
 *   - Regimen estatal: 10 anos
 *   - Algunas CCAA: 5 anos (Cataluna, Andalucia, Madrid, Galicia...)
 *
 * Fuente: LISD arts. 20.2.c y 20.6 + LIRPF art. 4.Ocho.Dos — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sucesiones, calcular_donaciones, calcular_legitimas
 */

// --- Constantes ---

const PCT_REDUCCION_EMPRESA_FAMILIAR_BASE = 95;   // % reduccion estatal
const PLAZO_MANTENIMIENTO_ESTATAL_ANIOS = 10;      // anos mantenimiento (regimen estatal)

// CCAA con plazo reducido (5 anos) o mayor reduccion
const CCAA_PLAZO_REDUCIDO: Record<string, number> = {
  madrid: 5,
  cataluna: 5,
  andalucia: 5,
  galicia: 5,
  valencia: 5,
  aragon: 5,
  castilla_la_mancha: 5,
};

const CCAA_PCT_REDUCCION: Record<string, number> = {
  pais_vasco: 99,
  navarra: 99,
};

// --- Tipos publicos ---

export type ComunidadAutonomaEF =
  | 'madrid' | 'cataluna' | 'andalucia' | 'galicia' | 'valencia'
  | 'pais_vasco' | 'navarra' | 'aragon' | 'castilla_la_mancha'
  | 'castilla_y_leon' | 'extremadura' | 'murcia' | 'asturias'
  | 'cantabria' | 'la_rioja' | 'baleares' | 'canarias' | 'estatal';

export type TipoTransmision = 'herencia' | 'donacion';

export type TipoParentesco =
  | 'conyuge'
  | 'descendiente'          // hijos, nietos
  | 'ascendiente'           // padres, abuelos
  | 'colateral_1er_grado'   // hermanos
  | 'colateral_2o_grado'    // sobrinos/tios
  | 'colateral_3er_grado'   // primos/tios-abuelos
  | 'sin_parentesco';

export interface ParametrosEmpresaFamiliarISD {
  tipoTransmision: TipoTransmision;
  ccaa: ComunidadAutonomaEF;
  tipoParentesco: TipoParentesco;
  valorEmpresaParticipaciones: number;
  pctParticipacion: number;
  estaExentaEnPatrimonio: boolean;
  ejerceFuncionesDereccion: boolean;
  retribucionDireccionSuperior50pct: boolean;
  tipoIS?: number;
}

export interface ResultadoEmpresaFamiliarISD {
  cumpleRequisitos: boolean;
  razonesIncumplimiento: string[];
  pctReduccion: number;
  valorBase: number;
  importeReduccion: number;
  baseImponibleTrasByReduccion: number;
  plazoMantenimientoAnios: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularEmpresaFamiliarISD(p: ParametrosEmpresaFamiliarISD): ResultadoEmpresaFamiliarISD {
  if (p.valorEmpresaParticipaciones <= 0) throw new Error('El valor de la empresa o participaciones debe ser mayor que cero.');
  if (p.pctParticipacion <= 0 || p.pctParticipacion > 100) throw new Error('El porcentaje de participacion debe estar entre 0 y 100.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const razonesIncumplimiento: string[] = [];

  // --- Verificacion de requisitos ---
  let cumpleRequisitos = true;

  if (!p.estaExentaEnPatrimonio) {
    cumpleRequisitos = false;
    razonesIncumplimiento.push('La empresa/participaciones NO estan exentas en el Impuesto sobre el Patrimonio. La exencion en IP (LIRPF art. 4.Ocho.Dos) es requisito previo e indispensable para la reduccion en ISD.');
  }

  if (!p.ejerceFuncionesDereccion) {
    cumpleRequisitos = false;
    razonesIncumplimiento.push('No se ejercen funciones de direccion efectivas. Es necesario que el transmitente (o algun miembro del grupo familiar) ejerza funciones de gestion o administracion efectiva en la empresa.');
  }

  if (!p.retribucionDireccionSuperior50pct && p.ejerceFuncionesDereccion) {
    cumpleRequisitos = false;
    razonesIncumplimiento.push('La retribucion por funciones de direccion no supera el 50% de los rendimientos netos totales del transmitente. Es requisito que la principal fuente de renta sea la empresa familiar (art. 4.Ocho.Dos.c LIRPF).');
  }

  const parentescosValidos: TipoParentesco[] = [
    'conyuge', 'descendiente', 'ascendiente', 'colateral_1er_grado', 'colateral_2o_grado', 'colateral_3er_grado'
  ];
  if (!parentescosValidos.includes(p.tipoParentesco)) {
    cumpleRequisitos = false;
    razonesIncumplimiento.push('El adquirente no tiene el grado de parentesco requerido. Solo pueden aplicar la reduccion: conyuges, descendientes, ascendientes y colaterales hasta 3.er grado (LISD art. 20.2.c).');
  }

  if (p.tipoTransmision === 'donacion' && p.tipoParentesco !== 'conyuge' && p.tipoParentesco !== 'descendiente') {
    cumpleRequisitos = false;
    razonesIncumplimiento.push('En donacion, la reduccion solo aplica al conyuge y descendientes (no a ascendientes ni colaterales). Para herencia, el ambito de parentesco es mas amplio (hasta 3.er grado colateral).');
  }

  // --- Porcentaje de reduccion segun CCAA ---
  const pctReduccion = CCAA_PCT_REDUCCION[p.ccaa] ?? PCT_REDUCCION_EMPRESA_FAMILIAR_BASE;
  const plazoMantenimientoAnios = CCAA_PLAZO_REDUCIDO[p.ccaa] ?? PLAZO_MANTENIMIENTO_ESTATAL_ANIOS;

  // --- Calculo de la reduccion ---
  const valorBase = r(p.valorEmpresaParticipaciones * p.pctParticipacion / 100);
  const importeReduccion = cumpleRequisitos ? r(valorBase * pctReduccion / 100) : 0;
  const baseImponibleTrasByReduccion = r(valorBase - importeReduccion);

  // --- Advertencias ---
  if (cumpleRequisitos) {
    advertencias.push(
      'Obligacion de mantenimiento: el adquirente debe mantener lo adquirido durante ' +
      plazoMantenimientoAnios + ' anos sin enajenarlo ni perder los requisitos de exencion en IP. ' +
      'El incumplimiento genera liquidacion complementaria con intereses de demora.'
    );
    advertencias.push(
      'Verificacion previa obligatoria: solicite una valoracion de las participaciones a efectos del ISD ' +
      'mediante el procedimiento de comprobacion de valores (art. 57 LGT). ' +
      'La AEAT puede revisar el valor declarado.'
    );
  }
  advertencias.push(
    'Exencion en Patrimonio (IP): este requisito previo exige participacion >= 5% (individual) o >= 20% (grupo familiar hasta 2.o grado), ' +
    'ejercicio efectivo de funciones de direccion y retribucion > 50% de rendimientos netos totales. ' +
    'Verifique que se declara correctamente la exencion en el Modelo 714 (IP) del causante.'
  );
  if (p.tipoTransmision === 'donacion') {
    advertencias.push(
      'Donacion de empresa familiar (LISD art. 20.6): el donante debe tener 65 anos o mas, o encontrarse ' +
      'en situacion de incapacidad permanente, SALVO que se trate de participaciones en entidad (no negocio individual). ' +
      'Consulte si su CCAA tiene requisitos adicionales o distintos.'
    );
  }

  return {
    cumpleRequisitos,
    razonesIncumplimiento,
    pctReduccion,
    valorBase,
    importeReduccion,
    baseImponibleTrasByReduccion,
    plazoMantenimientoAnios,
    advertencias,
    fuenteDatos: 'LISD arts. 20.2.c y 20.6 + LIRPF art. 4.Ocho.Dos (RD 1704/1999) - vigente 2025',
  };
}
