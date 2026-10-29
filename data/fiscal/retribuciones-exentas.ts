/**
 * data/fiscal/retribuciones-exentas.ts
 * Dietas y retribuciones en especie del trabajo que no tributan en el IRPF: manutención y
 * kilometraje de los desplazamientos, comedor de empresa, transporte colectivo y seguro médico.
 *
 * Nace el 29/10/2026 (cabos C0109 y C0183). Hasta entonces estas cuantías iban tecleadas en
 * selector-movilidad-urbana y estimador-sueldo-neto, y como constantes locales en los motores
 * `lib/calculadoras/kilometraje.ts` y `lib/calculadoras/deduccionAutonomoIRPF.ts`: sin módulo ni
 * sello, el Vigía Normativo no podía re-sellarlas. Ninguna estaba mal.
 *
 * Cotejado en sesión el 29/10/2026 contra el texto consolidado del BOE (API de legislación
 * consolidada, última `<version>` de cada bloque):
 *   · RD 439/2007 (RIRPF, BOE-A-2007-6820), art. 9.A.3.a: manutención exenta de 53,34 € diarios
 *     en España y 91,35 € en el extranjero si se pernocta fuera del municipio de trabajo y de
 *     residencia; sin pernoctar, 26,67 € y 48,08 €. La estancia exenta es la que se justifique.
 *     No hay exención si el desplazamiento a un mismo sitio dura más de nueve meses seguidos.
 *   · RIRPF art. 9.A.2.b: locomoción en vehículo propio, «0,19 euros por kilómetro» en el texto
 *     del artículo, revisada a 0,26 €/km por la Orden HFP/792/2023 (BOE-A-2023-16461), en vigor
 *     desde el 17/07/2023, más peajes y aparcamiento justificados. En transporte público, lo
 *     que se justifique con factura.
 *   · RIRPF art. 45.2.1.º (redacción del RD 1074/2017, vigente desde el 01/01/2018): las fórmulas
 *     indirectas del servicio de comedor (vales, tarjetas) «no podrán superar 11 euros diarios»;
 *     el exceso es retribución en especie, y lo no gastado un día no se acumula a otro (45.2.2.º.b).
 *   · Ley 35/2006 (LIRPF, BOE-A-2006-20764), art. 42.3.e: transporte colectivo de viajeros entre
 *     casa y trabajo, «con el límite de 1.500 euros anuales para cada trabajador»; RIRPF art. 46
 *     bis.1.2.º (vigente desde el 12/07/2015): pagado con tarjeta u otro medio electrónico, «no
 *     podrá exceder de 136,36 euros mensuales por trabajador, con el límite de 1.500 euros
 *     anuales»; si se superan, tributa solo el exceso (46 bis.2).
 *   · LIRPF art. 42.3.c (vigente desde el 01/01/2023): primas de seguro de enfermedad del
 *     trabajador, su cónyuge y sus descendientes, exentas hasta 500 € anuales por persona, o
 *     1.500 € por cada una con discapacidad.
 *   · LIRPF art. 30.2.5.ª.c (vigente desde el 01/01/2018): el AUTÓNOMO en estimación directa
 *     deduce su manutención pagada por medios electrónicos en restauración y hostelería «con los
 *     límites cuantitativos establecidos reglamentariamente para las dietas […] de manutención de
 *     los trabajadores», que son los de `DIETAS_MANUTENCION_EXENTAS`. El kilometraje NO: el art. 9
 *     solo habla del empleado y de las relaciones laborales especiales.
 */

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_RETRIBUCIONES_EXENTAS_META = {
  fuente: 'RD 439/2007 (RIRPF), arts. 9, 45 y 46 bis, con la Orden HFP/792/2023 para el kilometraje; Ley 35/2006 (LIRPF), arts. 42.3 y 30.2.5.ª',
  verificado: '2026-10-29',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a9',
  nota: 'Son límites de lo que la empresa puede pagar sin que tribute en el IRPF: lo que los excede es retribución sujeta. Las dietas de manutención marcan también el tope deducible de la manutención del autónomo (art. 30.2.5.ª LIRPF); el kilometraje, no.',
};

// ─── Dietas de manutención (art. 9.A.3.a RIRPF) ──────────────────────────────

/** Euros diarios exentos por gastos de manutención en un municipio distinto del de trabajo y residencia. */
export const DIETAS_MANUTENCION_EXENTAS = {
  espana: { sinPernocta: 26.67, conPernocta: 53.34 },
  extranjero: { sinPernocta: 48.08, conPernocta: 91.35 },
  /** Un desplazamiento continuado a un mismo destino de más de estos meses deja de estar exento */
  mesesMaximosDesplazamiento: 9,
  baseNormativa: 'Art. 9.A.3.a RIRPF (RD 439/2007)',
} as const;

// ─── Kilometraje en vehículo propio (art. 9.A.2.b RIRPF) ─────────────────────

export const KILOMETRAJE_EXENTO = {
  /** Euros por kilómetro, más los peajes y el aparcamiento que se justifiquen */
  eurosPorKm: 0.26,
  baseNormativa: 'Art. 9.A.2.b RIRPF, cuantía revisada por la Orden HFP/792/2023 (BOE-A-2023-16461)',
} as const;

// ─── Comedor de empresa: vales y tarjetas (art. 42.3.a LIRPF y 45 RIRPF) ─────

export const COMEDOR_FORMULAS_INDIRECTAS = {
  /** Euros por día hábil; lo no gastado un día no pasa al siguiente */
  eurosPorDia: 11,
  baseNormativa: 'Art. 42.3.a LIRPF y art. 45.2 RIRPF',
} as const;

// ─── Transporte colectivo (art. 42.3.e LIRPF y 46 bis RIRPF) ─────────────────

export const TRANSPORTE_COLECTIVO_EXENTO = {
  /** Euros al año por trabajador */
  limiteAnual: 1_500,
  /** Euros al mes si se paga con tarjeta u otro medio electrónico, sin pasar del límite anual */
  limiteMensualTarjeta: 136.36,
  baseNormativa: 'Art. 42.3.e LIRPF y art. 46 bis.1.2.º RIRPF',
} as const;

// ─── Seguro de enfermedad (art. 42.3.c LIRPF) ────────────────────────────────

export const SEGURO_ENFERMEDAD_EXENTO = {
  /** Euros al año por persona asegurada: el trabajador, su cónyuge y sus descendientes */
  porPersona: 500,
  /** Euros al año por cada persona asegurada con discapacidad */
  porPersonaConDiscapacidad: 1_500,
  baseNormativa: 'Art. 42.3.c LIRPF',
} as const;
