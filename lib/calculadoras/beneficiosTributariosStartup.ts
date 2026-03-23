/**
 * Calculadora de Beneficios Tributarios para Startups (Ley 28/2022)
 * Usada por: MCP server (calcular_beneficios_tributarios_startup)
 *
 * Calcula y resume los incentivos fiscales disponibles para las startups
 * bajo el regimen fiscal especial de la Ley 28/2022 (Ley de Startups),
 * incluyendo el IS reducido, la deduccion por inversion en startups,
 * el diferimiento del IS, el regimen de stock options y el apoyo a
 * fundadores impatriados.
 *
 * Marco normativo:
 *   - Ley 28/2022, de 21 de diciembre: Ley de Startups (fomento del ecosistema)
 *   - LIS art. 29.1 (modificado Ley 28/2022): tipo reducido del 15%
 *   - LIRPF art. 68.1 (modificado): deduccion por inversion en startups
 *   - LIRPF art. 43 (modificado): stock options exentas hasta 50.000 EUR
 *   - LIRPF art. 93 (modificado): regimen Beckham para fundadores
 *
 * CONCEPTO DE STARTUP (Ley 28/2022 art. 4):
 *   Para ser EMPRESA EMERGENTE debe cumplir:
 *   a) Ser una entidad de nueva creacion (o menos de 5 anos de constitucion,
 *      7 si es biotecnologia, energia, industrial u otros con ciclo largo)
 *   b) No cotizar en mercado regulado
 *   c) No distribuir o haber distribuido dividendos
 *   d) No surgir de fusion, escision, transformacion o sucesion
 *   e) Tener sede social o establecimiento permanente en Espana
 *   f) Ser INNOVADORA: tener como fin el desarrollo de un proyecto innovador
 *      (acreditado por ENISA o similar entidad publica)
 *
 * BENEFICIOS FISCALES PRINCIPALES:
 *
 *   1. IS REDUCIDO AL 15% (LIS art. 29.1):
 *      - Los 4 primeros anos desde que la base imponible sea positiva
 *      - Mismo tipo que las entidades de nueva creacion generales (ya existia)
 *      - Novedad: ampliacion a 4 anos (antes era 2 anos para nuevas entidades)
 *      - Solo si no pierde la condicion de startup
 *
 *   2. DIFERIMIENTO DEL IS (Ley 28/2022 art. 11):
 *      - Aplazamiento sin garantias del pago del IS durante 2 anos
 *      - Si la empresa tiene base imponible positiva y cumple condicion startup
 *      - Primeros 2 ejercicios con base positiva: aplazamiento del pago (no del devengo)
 *
 *   3. DEDUCCION POR INVERSION (LIRPF art. 68.1 — inversores persona fisica):
 *      - 50% de la inversion en el ejercicio en acciones/participaciones de startups
 *      - Base maxima de inversion: 100.000 EUR/ano
 *      - Deduccion maxima: 50.000 EUR/ano
 *      - El inversor no puede participar mas del 40% antes de la inversion
 *      - La startup debe tener fondos propios < 400.000 EUR en el inicio del ejercicio
 *      - Deben mantenerse las participaciones >= 3 anos (para no devolver)
 *
 *   4. STOCK OPTIONS EXENTAS (LIRPF art. 43):
 *      - Exencion de hasta 50.000 EUR anuales en entrega de acciones a empleados
 *      - Solo para startups acreditadas como empresa emergente
 *      - Si se supera: el exceso tributa como rendimiento del trabajo
 *      - El valor de referencia: el precio de la ultima ampliacion de capital
 *
 *   5. REGIMEN BECKHAM AMPLIADO (LIRPF art. 93 — para fundadores):
 *      - Fundadores de startups que venian del extranjero: pueden optar
 *      - No requiere que el desplazamiento sea por contrato laboral (novedad)
 *      - Se extiende a autonomos (emprendedores) y nomadas digitales
 *
 * Fuente: Ley 28/2022 + LIS art. 29.1 + LIRPF arts. 43, 68.1, 93 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_regimen_impatriados, calcular_stock_options
 */

// --- Constantes ---

const TIPO_IS_REDUCIDO_STARTUP = 15;           // % durante 4 primeros anos positivos
const TIPO_IS_GENERAL = 25;                    // % general
const PCT_DEDUCCION_INVERSION = 50;            // % sobre la inversion
const BASE_MAX_DEDUCCION_INVERSION = 100_000;  // EUR/ano
const MAX_PARTICIPACION_PREVIA = 40;           // % maximo antes de invertir
const FONDOS_PROPIOS_MAX_STARTUP = 400_000;    // EUR fondos propios al inicio del ejercicio
const EXENCION_MAX_STOCK_OPTIONS = 50_000;     // EUR/ano exentos
const ANOS_IS_REDUCIDO = 4;                    // Anos con tipo reducido

// --- Tipos publicos ---

export interface ParametrosBeneficiosTributariosStartup {
  /** La entidad esta acreditada como empresa emergente (Ley 28/2022)? */
  estaAcreditadaStartup: boolean;
  /** Numero de anos desde el primer ejercicio con base imponible positiva (0-4) */
  anosConBasePositiva: number;
  /** Base imponible IS del ejercicio (EUR) */
  baseImponibleIS: number;
  /** La empresa quiere calcular el diferimiento del IS (primeros 2 anos con BI positiva)? */
  calcularDiferimiento?: boolean;

  // Para deduccion inversion (solo inversor persona fisica):
  /** Importe de la inversion en participaciones de la startup en el ejercicio (EUR) */
  importeInversionPersonaFisica?: number;
  /** Porcentaje de participacion previa del inversor antes de esta inversion (%) */
  pctParticipacionPrevia?: number;
  /** Fondos propios de la startup al inicio del ejercicio (EUR) */
  fondosPropiosStartup?: number;

  // Para stock options:
  /** Valor de acciones/participaciones entregadas a empleados este ano (EUR) */
  valorAccionesEntregadasEmpleados?: number;
}

export interface ResultadoBeneficiosTributariosStartup {
  estaAcreditadaStartup: boolean;
  /** IS a pagar con tipo reducido 15% (EUR) */
  cuotaISReducido: number;
  /** IS a pagar sin beneficio (tipo 25%) (EUR) */
  cuotaISSinBeneficio: number;
  /** Ahorro fiscal IS por tipo reducido (EUR) */
  ahorroISReducido: number;
  /** Aplica el tipo reducido este ejercicio? */
  aplicaTipoReducido: boolean;
  /** Anos restantes con tipo reducido */
  anosRestantesTipoReducido: number;
  /** Aplaza el pago IS este ejercicio (diferimiento)? */
  aplicaDiferimiento: boolean;
  /** Deduccion por inversion de persona fisica (EUR) */
  deduccionInversionPF: number;
  /** Inversion de PF que excede el limite (no genera deduccion adicional) */
  excesoInversionPF: number;
  /** Acciones entregadas a empleados: importe exento (EUR) */
  stockOptionsExento: number;
  /** Acciones entregadas a empleados: importe que tributa como RDT (EUR) */
  stockOptionsTributable: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularBeneficiosTributariosStartup(
  p: ParametrosBeneficiosTributariosStartup
): ResultadoBeneficiosTributariosStartup {
  if (p.baseImponibleIS < 0 && p.anosConBasePositiva > 0) {
    throw new Error('Si la base imponible es negativa, los anos con base positiva deben ser 0.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  if (!p.estaAcreditadaStartup) {
    advertencias.push(
      'La entidad NO esta acreditada como empresa emergente por ENISA o similar. ' +
      'Sin la acreditacion, los beneficios fiscales de la Ley 28/2022 NO son aplicables. ' +
      'Para obtenerla, debe presentar solicitud acreditando el caracter innovador del proyecto.'
    );
  }

  // IS reducido
  const aplicaTipoReducido = p.estaAcreditadaStartup && p.anosConBasePositiva < ANOS_IS_REDUCIDO;
  const anosRestantesTipoReducido = p.estaAcreditadaStartup
    ? Math.max(0, ANOS_IS_REDUCIDO - p.anosConBasePositiva)
    : 0;
  const tipoAplicable = aplicaTipoReducido ? TIPO_IS_REDUCIDO_STARTUP : TIPO_IS_GENERAL;
  const cuotaISReducido = r(Math.max(0, p.baseImponibleIS) * tipoAplicable / 100);
  const cuotaISSinBeneficio = r(Math.max(0, p.baseImponibleIS) * TIPO_IS_GENERAL / 100);
  const ahorroISReducido = r(Math.max(0, cuotaISSinBeneficio - cuotaISReducido));

  // Diferimiento
  const aplicaDiferimiento = (p.calcularDiferimiento ?? false) &&
    p.estaAcreditadaStartup &&
    p.anosConBasePositiva < 2;

  if (aplicaDiferimiento) {
    advertencias.push(
      'DIFERIMIENTO IS (Ley 28/2022 art. 11): la startup puede aplazar SIN GARANTIAS ' +
      'el pago del IS durante los 2 primeros ejercicios con base imponible positiva. ' +
      'El aplazamiento es del pago, no del devengo del impuesto. ' +
      'Debe solicitarse en el plazo de declaracion del IS.'
    );
  }

  // Deduccion inversion persona fisica
  let deduccionInversionPF = 0;
  let excesoInversionPF = 0;
  const invPF = p.importeInversionPersonaFisica ?? 0;
  if (invPF > 0) {
    const partPrevia = p.pctParticipacionPrevia ?? 0;
    const fondosPropios = p.fondosPropiosStartup ?? 0;
    const cumpleParticipacion = partPrevia <= MAX_PARTICIPACION_PREVIA;
    const cumpleFondos = fondosPropios <= FONDOS_PROPIOS_MAX_STARTUP;

    if (!p.estaAcreditadaStartup || !cumpleParticipacion || !cumpleFondos) {
      advertencias.push(
        'La deduccion por inversion en startup NO es aplicable porque: ' +
        (!p.estaAcreditadaStartup ? 'entidad no acreditada. ' : '') +
        (!cumpleParticipacion ? 'participacion previa supera el ' + MAX_PARTICIPACION_PREVIA + '%. ' : '') +
        (!cumpleFondos ? 'fondos propios de la startup superan ' + FONDOS_PROPIOS_MAX_STARTUP.toLocaleString('es-ES') + ' EUR. ' : '')
      );
    } else {
      const baseDeduccion = Math.min(invPF, BASE_MAX_DEDUCCION_INVERSION);
      excesoInversionPF = r(Math.max(0, invPF - BASE_MAX_DEDUCCION_INVERSION));
      deduccionInversionPF = r(baseDeduccion * PCT_DEDUCCION_INVERSION / 100);
      advertencias.push(
        'DEDUCCION POR INVERSION (LIRPF art. 68.1): ' + PCT_DEDUCCION_INVERSION + '% sobre ' +
        baseDeduccion.toLocaleString('es-ES') + ' EUR = **' + deduccionInversionPF.toLocaleString('es-ES') + ' EUR**. ' +
        'Las participaciones deben mantenerse minimo 3 anos. Si se transmiten antes, debe devolver la deduccion.'
      );
    }
  }

  // Stock options
  const valorAcciones = p.valorAccionesEntregadasEmpleados ?? 0;
  const stockOptionsExento = r(Math.min(valorAcciones, EXENCION_MAX_STOCK_OPTIONS));
  const stockOptionsTributable = r(Math.max(0, valorAcciones - EXENCION_MAX_STOCK_OPTIONS));

  if (valorAcciones > 0) {
    advertencias.push(
      'STOCK OPTIONS EXENTAS (LIRPF art. 43): hasta ' + EXENCION_MAX_STOCK_OPTIONS.toLocaleString('es-ES') + ' EUR/ano ' +
      'de entrega de acciones/participaciones a empleados estan exentos de IRPF. ' +
      'El valor de referencia es el precio de la ultima ampliacion de capital. ' +
      'El exceso tributa como rendimiento del trabajo en el momento de la entrega (no del ejercicio).'
    );
  }

  advertencias.push(
    'Para acceder a los beneficios fiscales de la Ley 28/2022 la entidad debe mantener ' +
    'la condicion de empresa emergente durante todo el ejercicio. Si pierde la condicion, ' +
    'los beneficios quedan sin efecto desde el ano en que se produce la perdida.'
  );

  return {
    estaAcreditadaStartup: p.estaAcreditadaStartup,
    cuotaISReducido,
    cuotaISSinBeneficio,
    ahorroISReducido,
    aplicaTipoReducido,
    anosRestantesTipoReducido,
    aplicaDiferimiento,
    deduccionInversionPF,
    excesoInversionPF,
    stockOptionsExento,
    stockOptionsTributable,
    advertencias,
    fuenteDatos: 'Ley 28/2022 + LIS art. 29.1 + LIRPF arts. 43, 68.1, 93 — vigente 2025',
  };
}
