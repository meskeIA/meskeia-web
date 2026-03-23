/**
 * Calculadora de Deducciones por Familia Numerosa y Discapacidad (IRPF art. 81 bis)
 * Usada por: MCP server (calcular_deduccion_familia_numerosa)
 *
 * Calcula las deducciones en cuota del IRPF por:
 *   - Familia numerosa (general y especial)
 *   - Ascendiente o descendiente con discapacidad
 *   - Conyuge no separado con discapacidad
 *   - Ascendiente separado o viudo con dos hijos sin derecho a anualidades
 *
 * Marco normativo:
 *   - LIRPF art. 81 bis: deducciones por familia numerosa y discapacidad
 *   - Ley 40/2003: Proteccion de familias numerosas (clasificacion)
 *   - Real Decreto 1971/1999: valoracion de la discapacidad
 *   - Ley 31/2022 (PGE 2023): incremento de los importes vigente desde 2023
 *
 * DEDUCCIONES DISPONIBLES (art. 81 bis — desde 2023):
 *
 *   a) FAMILIA NUMEROSA GENERAL (3 o mas hijos): 1.200 EUR/ano (100 EUR/mes)
 *   b) FAMILIA NUMEROSA ESPECIAL (5 o mas hijos, o 4 si alguno con discapacidad):
 *      2.400 EUR/ano (200 EUR/mes)
 *   c) PERSONA CON DISCAPACIDAD >= 33% (ascendiente o descendiente):
 *      1.200 EUR/ano (100 EUR/mes) por cada una
 *   d) PERSONA CON DISCAPACIDAD >= 65% (ascendiente o descendiente):
 *      2.400 EUR/ano (200 EUR/mes) por cada una (desde 2023)
 *   e) CONYUGE NO SEPARADO CON DISCAPACIDAD >= 33%:
 *      1.200 EUR/ano (100 EUR/mes)
 *   f) ASCENDIENTE SEPARADO O VIUDO con 2+ hijos (sin pensiones): 1.200 EUR/ano
 *
 * REQUISITOS COMUNES:
 *   - El contribuyente debe estar dado de alta en SS (trabajador activo o autonomo)
 *     O percibir prestaciones del SEPE (o pension de la Seguridad Social)
 *   - Para las de discapacidad: el familiar debe generar el minimo por descendiente
 *     o ascendiente en la declaracion del contribuyente
 *   - Limite de la deduccion: cotizaciones SS + cuotas mutualidad del ejercicio
 *
 * ABONO ANTICIPADO (Modelo 143):
 *   Igual que la deduccion por maternidad, se puede solicitar abono mensual
 *   anticipado de 100 EUR/mes o 200 EUR/mes segun la deduccion.
 *
 * INCREMENTO 2023 (Ley 31/2022):
 *   La discapacidad >= 65% pasa de 1.200 a 2.400 EUR (doble) desde 2023.
 *   Familia numerosa especial: no cambio el importe base.
 *
 * Fuente: LIRPF art. 81 bis (Ley 31/2022) — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_deduccion_maternidad_irpf
 */

// --- Constantes ---

const DEDUCCION_FN_GENERAL = 1_200;        // EUR/ano
const DEDUCCION_FN_ESPECIAL = 2_400;       // EUR/ano
const DEDUCCION_DISCAPACIDAD_33 = 1_200;   // EUR/ano por familiar
const DEDUCCION_DISCAPACIDAD_65 = 2_400;   // EUR/ano por familiar (desde 2023)
const DEDUCCION_CONYUGE_DISCAPACIDAD = 1_200; // EUR/ano
const DEDUCCION_ASCENDIENTE_SEPARADO = 1_200; // EUR/ano

// --- Tipos publicos ---

export type GradoDiscapacidadFN = 'ninguno' | 'grado_33_64' | 'grado_65_mas';

export interface FamiliarConDiscapacidad {
  /** Relacion con el contribuyente */
  parentesco: 'hijo' | 'ascendiente' | 'conyuge';
  gradoDiscapacidad: Exclude<GradoDiscapacidadFN, 'ninguno'>;
  /** Genera minimo por descendiente/ascendiente en la declaracion del contribuyente? */
  generaMinimo: boolean;
}

export interface ParametrosDeduccionFamiliaNumerosa {
  /** Tiene titulo de familia numerosa general (3+ hijos)? */
  familiaNumerosaGeneral?: boolean;
  /** Tiene titulo de familia numerosa especial (5+ hijos o 4+ si discapacidad)? */
  familiaNumerosaEspecial?: boolean;
  /** Lista de familiares con discapacidad que generan deduccion */
  familiaresConDiscapacidad?: FamiliarConDiscapacidad[];
  /**
   * Ascendiente separado/viudo con 2+ hijos sin derecho a anualidades?
   * Solo aplica al ascendiente (pagador) con custodia compartida / monoparental
   */
  ascendienteSeparadoConHijos?: boolean;
  /**
   * Cotizaciones SS totales del contribuyente en el ejercicio (EUR)
   * Limite de las deducciones del art. 81 bis
   */
  cotizacionesSSTotales: number;
  /** Importe ya cobrado como abono anticipado modelo 143 en el ejercicio (EUR) */
  importeAbonoAnticipadoCobrado?: number;
}

export interface LineaDeduccion81bis {
  concepto: string;
  importeAnual: number;
}

export interface ResultadoDeduccionFamiliaNumerosa {
  lineas: LineaDeduccion81bis[];
  /** Total deducciones brutas (EUR) */
  totalDeduccionBruta: number;
  /** Limite por cotizaciones SS */
  limiteCotzaciones: number;
  /** Total deduccion efectiva (tras limite) */
  totalDeduccionEfectiva: number;
  /** Abono anticipado ya cobrado (EUR) */
  abonoAnticipadoCobrado: number;
  /** Resultado en declaracion (deduccion - abono anticipado) */
  resultadoDeclaracion: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularDeduccionFamiliaNumerosa(
  p: ParametrosDeduccionFamiliaNumerosa
): ResultadoDeduccionFamiliaNumerosa {
  if (p.cotizacionesSSTotales < 0) throw new Error('Las cotizaciones SS no pueden ser negativas.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const lineas: LineaDeduccion81bis[] = [];

  // Familia numerosa
  if (p.familiaNumerosaEspecial) {
    lineas.push({ concepto: 'Familia numerosa de categoria especial', importeAnual: DEDUCCION_FN_ESPECIAL });
  } else if (p.familiaNumerosaGeneral) {
    lineas.push({ concepto: 'Familia numerosa de categoria general', importeAnual: DEDUCCION_FN_GENERAL });
  }

  // Familiares con discapacidad
  for (const fam of (p.familiaresConDiscapacidad ?? [])) {
    if (!fam.generaMinimo && fam.parentesco !== 'conyuge') {
      advertencias.push(
        'El familiar (' + fam.parentesco + ') con discapacidad no genera el minimo por descendiente ' +
        'o ascendiente en la declaracion — no da derecho a la deduccion del art. 81 bis.'
      );
      continue;
    }
    if (fam.parentesco === 'conyuge') {
      lineas.push({
        concepto: 'Conyuge no separado legalmente con discapacidad',
        importeAnual: DEDUCCION_CONYUGE_DISCAPACIDAD,
      });
    } else {
      const importe = fam.gradoDiscapacidad === 'grado_65_mas'
        ? DEDUCCION_DISCAPACIDAD_65
        : DEDUCCION_DISCAPACIDAD_33;
      lineas.push({
        concepto: (fam.parentesco === 'hijo' ? 'Descendiente' : 'Ascendiente') +
          ' con discapacidad ' + (fam.gradoDiscapacidad === 'grado_65_mas' ? '>= 65%' : '33-64%'),
        importeAnual: importe,
      });
    }
  }

  // Ascendiente separado con hijos
  if (p.ascendienteSeparadoConHijos) {
    lineas.push({
      concepto: 'Ascendiente separado o viudo con 2+ hijos sin pensiones de alimentos',
      importeAnual: DEDUCCION_ASCENDIENTE_SEPARADO,
    });
  }

  const totalDeduccionBruta = r(lineas.reduce((s, l) => s + l.importeAnual, 0));
  const limiteCotzaciones = r(p.cotizacionesSSTotales);
  const totalDeduccionEfectiva = r(Math.min(totalDeduccionBruta, limiteCotzaciones));
  const abonoAnticipadoCobrado = r(p.importeAbonoAnticipadoCobrado ?? 0);
  const resultadoDeclaracion = r(totalDeduccionEfectiva - abonoAnticipadoCobrado);

  if (totalDeduccionBruta > limiteCotzaciones) {
    advertencias.push(
      'LIMITE POR COTIZACIONES: el total de deducciones (' + totalDeduccionBruta.toLocaleString('es-ES') + ' EUR) ' +
      'supera las cotizaciones SS del ejercicio (' + limiteCotzaciones.toLocaleString('es-ES') + ' EUR). ' +
      'La deduccion efectiva queda limitada a ' + totalDeduccionEfectiva.toLocaleString('es-ES') + ' EUR.'
    );
  }
  if (p.familiaNumerosaGeneral && p.familiaNumerosaEspecial) {
    advertencias.push(
      'Solo puede aplicar una categoria de familia numerosa (general o especial). ' +
      'Se ha aplicado la especial por tener mayor importe. Verifique el titulo vigente.'
    );
  }
  advertencias.push(
    'ABONO ANTICIPADO (Modelo 143): se puede solicitar el pago mensual anticipado ' +
    '(100 EUR/mes deduccion general; 200 EUR/mes deduccion especial/discapacidad >= 65%). ' +
    'Los importes cobrados se descuentan del resultado de la declaracion anual.'
  );
  advertencias.push(
    'Las deducciones del art. 81 bis son INCOMPATIBLES entre si cuando se produce solapamiento ' +
    '(ej: un mismo hijo discapacitado puede dar derecho a la de familia numerosa Y a la de ' +
    'discapacidad — son compatibles y se suman).'
  );

  return {
    lineas,
    totalDeduccionBruta,
    limiteCotzaciones,
    totalDeduccionEfectiva,
    abonoAnticipadoCobrado,
    resultadoDeclaracion,
    advertencias,
    fuenteDatos: 'LIRPF art. 81 bis (Ley 31/2022) — vigente 2025',
  };
}
