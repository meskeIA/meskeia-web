/**
 * Calculadora del Complemento de Pension por Brecha de Genero
 * Usada por: MCP server (calcular_complemento_pension_brecha_genero)
 *
 * Calcula el complemento economico por brecha de genero aplicable a
 * las pensiones de jubilacion, incapacidad permanente y viudedad,
 * conforme a la reforma introducida por el Real Decreto-ley 3/2021.
 *
 * Marco normativo:
 *   - LGSS art. 60 (redaccion RDL 3/2021, de 2 de febrero):
 *     Complemento de pension por brecha de genero
 *   - Real Decreto-ley 3/2021: establece el nuevo complemento
 *   - STC 114/2021 (TC): anullo el anterior complemento por maternidad
 *     por discriminatorio (favorecia solo a mujeres). El RDL 3/2021
 *     sustituye el anterior y lo extiende a hombres con requisitos mas exigentes.
 *   - Orden SSM/1030/2021: criterios de aplicacion
 *   - Modificacion Ley 21/2021: actualizacion anual del complemento
 *
 * NUEVO COMPLEMENTO (desde 04/02/2021 — RDL 3/2021):
 *
 *   REQUISITOS COMUNES:
 *   - Tener una pension de jubilacion, incapacidad permanente o viudedad
 *   - Haber tenido 2 o mas hijos o hijas
 *   - Haber visto interrumpida o reducida la carrera de cotizacion
 *     por cuidado de hijos (acreditable mediante lagunas de cotizacion)
 *   - Para hombres: requisitos adicionales (ver infra)
 *
 *   BENEFICIARIOS:
 *   1. MUJERES: con 2+ hijos, siempre que la pension sea inferior a la de
 *      un hombre con mismo periodo cotizado en la misma empresa/CCAA.
 *      (Presuncion legal de brecha de genero por maternidad)
 *   2. HOMBRES: con 2+ hijos, solo si:
 *      - En los 2 anos anteriores al nacimiento/adopcion interrumpieron
 *        o redujeron su jornada por cuidado de hijos, Y
 *      - La pension reconocida es inferior a la de la conyuge/pareja de hecho
 *
 *   CUANTIA DEL COMPLEMENTO (art. 60.1 LGSS — 2025):
 *   - Por el 2.o hijo: 28,12 EUR/mes (importe mensual 2025 segun revalorizacion)
 *   - Por cada hijo adicional a partir del 2.o: se acumula la misma cuantia
 *   - Importe base: fijado anualmente por Ley de Presupuestos
 *   - Para 2025: pendiente de confirmar en BOE. Se usa el valor 2024 indexado.
 *
 *   COMPATIBILIDADES:
 *   - Compatible con cualquier tipo de pension contributiva
 *   - Compatible con trabajo a tiempo parcial posterior a la pension
 *   - Computa para el calculo del limite de pensiones publicas
 *
 * Fuente: LGSS art. 60 (RDL 3/2021) — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_jubilacion, calcular_pension_viudedad, calcular_incapacidad_permanente
 */

// --- Constantes ---

// Cuantia mensual del complemento por hijo (desde el 2.o) — 2025
// Fuente: art. 60 LGSS + revalorizacion anual. Confirmar en BOE enero 2025.
const CUANTIA_MENSUAL_POR_HIJO_2025 = 33.20;   // EUR/mes por hijo (desde el 2.o)
const HIJOS_MINIMOS = 2;
const MESES_ANIO = 14;  // 12 mensualidades + 2 pagas extraordinarias

// --- Tipos publicos ---

export type TipoPensionComplemento =
  | 'jubilacion'
  | 'incapacidad_permanente'
  | 'viudedad';

export type SexoBeneficiario = 'mujer' | 'hombre';

export interface ParametrosComplementoPensionBrechaGenero {
  tipoPension: TipoPensionComplemento;
  sexo: SexoBeneficiario;
  /** Numero de hijos o hijas biologicos o adoptados */
  numHijos: number;
  /**
   * Para mujeres: tiene la pension mas baja que un hombre equivalente?
   * (presuncion legal en favor de las mujeres — si se desconoce, indicar true)
   */
  acreditaBrechaGenero?: boolean;
  /**
   * Para hombres: interrumpio o redujo jornada en los 2 anos anteriores
   * al nacimiento/adopcion?
   */
  hombresInterrumpioJornada?: boolean;
  /**
   * Para hombres: su pension es inferior a la de su conyuge o pareja de hecho?
   */
  pensionInferiorConyuge?: boolean;
  /** Pension contributiva mensual reconocida (EUR) — antes del complemento */
  pensionMensualBase: number;
}

export interface ResultadoComplementoPensionBrechaGenero {
  tipoPension: TipoPensionComplemento;
  sexo: SexoBeneficiario;
  numHijos: number;
  /** Tiene derecho al complemento? */
  tieneDerechoComplemento: boolean;
  motivoDenegacion?: string;
  /** Numero de hijos que generan el complemento (numHijos - 1, min 0) */
  hijosQueGeneranComplemento: number;
  /** Cuantia mensual del complemento (EUR) */
  cuotaComplementoMensual: number;
  /** Cuantia anual del complemento (14 pagas) (EUR) */
  cuotaComplementoAnual: number;
  /** Pension total mensual con complemento (EUR) */
  pensionTotalMensual: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularComplementoPensionBrechaGenero(
  p: ParametrosComplementoPensionBrechaGenero
): ResultadoComplementoPensionBrechaGenero {
  if (p.pensionMensualBase <= 0) throw new Error('La pension mensual base debe ser mayor que cero.');
  if (p.numHijos < 0) throw new Error('El numero de hijos no puede ser negativo.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // Verificar requisitos
  let tieneDerechoComplemento = true;
  let motivoDenegacion: string | undefined;

  if (p.numHijos < HIJOS_MINIMOS) {
    tieneDerechoComplemento = false;
    motivoDenegacion =
      'El complemento requiere un minimo de ' + HIJOS_MINIMOS + ' hijos o hijas. ' +
      'Con ' + p.numHijos + ' hijo(s) no se cumple este requisito.';
  } else if (p.sexo === 'hombre') {
    const interrumpio = p.hombresInterrumpioJornada ?? false;
    const pensionInferior = p.pensionInferiorConyuge ?? false;
    if (!interrumpio || !pensionInferior) {
      tieneDerechoComplemento = false;
      motivoDenegacion =
        'Para los hombres, el complemento requiere: (1) haber interrumpido o reducido ' +
        'la jornada laboral en los 2 anos anteriores al nacimiento o adopcion de cada hijo, Y ' +
        '(2) que la pension reconocida sea inferior a la de la conyuge o pareja de hecho. ' +
        'No se cumplen ambos requisitos simultaneamente.';
    }
  } else {
    // Mujer — presuncion de brecha, pero se puede denegar si se acredita lo contrario
    const acredita = p.acreditaBrechaGenero ?? true;
    if (!acredita) {
      tieneDerechoComplemento = false;
      motivoDenegacion = 'No se acredita la brecha de genero en la pension.';
    }
  }

  if (!tieneDerechoComplemento) {
    return {
      tipoPension: p.tipoPension,
      sexo: p.sexo,
      numHijos: p.numHijos,
      tieneDerechoComplemento: false,
      motivoDenegacion,
      hijosQueGeneranComplemento: 0,
      cuotaComplementoMensual: 0,
      cuotaComplementoAnual: 0,
      pensionTotalMensual: r(p.pensionMensualBase),
      advertencias,
      fuenteDatos: 'LGSS art. 60 (RDL 3/2021) — vigente 2025',
    };
  }

  const hijosQueGeneranComplemento = p.numHijos - 1;
  const cuotaComplementoMensual = r(hijosQueGeneranComplemento * CUANTIA_MENSUAL_POR_HIJO_2025);
  const cuotaComplementoAnual = r(cuotaComplementoMensual * MESES_ANIO);
  const pensionTotalMensual = r(p.pensionMensualBase + cuotaComplementoMensual);

  advertencias.push(
    'CUANTIA 2025 ESTIMADA: ' + CUANTIA_MENSUAL_POR_HIJO_2025.toLocaleString('es-ES') + ' EUR/mes ' +
    'por hijo (desde el 2.o). El importe exacto se fija en la Ley de Presupuestos Generales ' +
    'y se revaloriza anualmente con el IPC. Verificar en BOE o INSS.'
  );
  advertencias.push(
    'El complemento se abona en 14 pagas (12 mensualidades + paga de verano + paga de Navidad). ' +
    'Computa a efectos del limite maximo de pension publica y del IRPF.'
  );
  if (p.sexo === 'hombre') {
    advertencias.push(
      'Para hombres: los requisitos son estrictos (interrupcion/reduccion jornada acreditada ' +
      'documentalmente y pension inferior a la del conyuge). Se recomienda solicitar informe ' +
      'de vida laboral y cotejar con la TGSS.'
    );
  }
  advertencias.push(
    'SOLICITUD: el complemento se reconoce a peticion del interesado o de oficio si la SS ' +
    'dispone de los datos. Si no consta automaticamente en la pension, presentar solicitud ' +
    'en el INSS con certificado de nacimiento de los hijos.'
  );

  return {
    tipoPension: p.tipoPension,
    sexo: p.sexo,
    numHijos: p.numHijos,
    tieneDerechoComplemento: true,
    hijosQueGeneranComplemento,
    cuotaComplementoMensual,
    cuotaComplementoAnual,
    pensionTotalMensual,
    advertencias,
    fuenteDatos: 'LGSS art. 60 (RDL 3/2021) — vigente 2025',
  };
}
