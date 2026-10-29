/**
 * data/fiscal/recargos-sanciones.ts
 * Lo que cuesta declarar o pagar tarde: recargos y sanciones de la Ley General Tributaria,
 * el modelo 720 y el fraccionamiento sin intereses del IRPF.
 *
 * Nace el 29/10/2026 (cabo C0055). Hasta entonces estas cifras vivían tecleadas en la guía de
 * estimador-irpf («errores frecuentes»), y la escala del art. 27 en
 * `lib/calculadoras/recargoPresentacionTardia.ts`, donde ningún sello la amparaba y el Vigía
 * Normativo no la podía ver. Ninguna estaba mal: lo que faltaba era el contrato de vigilancia.
 *
 * Cotejado en sesión el 29/10/2026 contra el texto consolidado del BOE (API de legislación
 * consolidada, última `<version>` de cada bloque):
 *   · LGT art. 27 (BOE-A-2003-23186). Ap. 2 en la redacción del art. 13.3 de la Ley 11/2021
 *     (BOE-A-2021-11473), vigente desde el 11/07/2021: «un porcentaje igual al 1 por ciento más
 *     otro 1 por ciento adicional por cada mes completo de retraso»; «una vez transcurridos 12
 *     meses […] el recargo será del 15 por ciento», con intereses de demora desde el día
 *     siguiente al término de esos 12 meses. Ap. 5: «El importe de los recargos […] se reducirá
 *     en el 25 por ciento»: se reduce el RECARGO, no los intereses.
 *   · LGT art. 28 (redacción vigente desde el 01/01/2012): recargo ejecutivo del 5 %, de apremio
 *     reducido del 10 % y de apremio ordinario del 20 %. Solo el ordinario es compatible con los
 *     intereses de demora (28.5).
 *   · LGT art. 198.1 y 198.2 (vigente desde el 11/07/2021): no presentar en plazo una
 *     autoliquidación o declaración SIN perjuicio económico (una declaración a devolver) es
 *     infracción leve con «multa pecuniaria fija de 200 euros»; si se presenta fuera de plazo
 *     sin requerimiento previo, «la sanción […] será la mitad».
 *   · LGT disposición adicional 18.ª, en la redacción de la disposición final 4.ª de la Ley
 *     5/2022 (BOE-A-2022-3712), vigente desde el 11/03/2022: solo la obligación de informar. La
 *     versión anterior (Ley 11/2021) llevaba un «2. Régimen de infracciones y sanciones» propio
 *     —5.000 € por dato o conjunto de datos—, que la Ley 5/2022 suprimió: el incumplimiento se
 *     sanciona ya por el régimen general de la LGT.
 *   · RD 1065/2007 (RGAT, BOE-A-2007-15984), arts. 42 bis.4.e (cuentas), 42 ter.4.c (valores,
 *     seguros y rentas) y 54 bis.4.d (inmuebles): no hay obligación de informar de un bloque
 *     cuyo valor conjunto no supere 50.000 €; en los años siguientes solo hay que volver a
 *     declarar si ese valor sube más de 20.000 € sobre el de la última declaración.
 *   · RD 439/2007 (RIRPF, BOE-A-2007-6820), art. 62.2 (redacción del RD 249/2023, vigente desde
 *     el 25/04/2023): el ingreso de la autoliquidación «se podrá fraccionar, sin interés o
 *     recargo alguno, en dos partes: la primera, del 60 por ciento […] y la segunda, del 40 por
 *     ciento restante». Exige presentar en plazo y no vale para las complementarias. La fecha del
 *     segundo plazo NO está aquí: la fija cada año la orden del modelo 100 (art. 62.1).
 */

import { INTERES_DEMORA_TRIBUTARIO_2025 } from './intereses';

// ─── Metadatos ───────────────────────────────────────────────────────────────

export const FISCAL_RECARGOS_SANCIONES_META = {
  fuente: 'Ley 58/2003 General Tributaria, arts. 27, 28 y 198 y disposición adicional 18.ª (redacción de la Ley 5/2022); RD 1065/2007 (RGAT), arts. 42 bis, 42 ter y 54 bis; RD 439/2007 (RIRPF), art. 62.2',
  verificado: '2026-10-29',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186',
  nota: 'El recargo por presentar tarde sin requerimiento (art. 27) excluye la sanción; si llega antes Hacienda, hay sanción e intereses. Los recargos del período ejecutivo (art. 28) son de quien presentó en plazo pero no pagó.',
};

// ─── Recargo por declaración extemporánea sin requerimiento (art. 27 LGT) ─────

/**
 * La escala del art. 27.2, para que ninguna app la vuelva a escribir a mano.
 *
 * ── Por qué (27/08/2026) ──────────────────────────────────────────────────────
 * Los hallazgos 436 y 454 del Inspector encontraron «recargos del 5 % al 20 %» en el bloque
 * educativo de dos apps del clúster de compraventa: la escala ANTERIOR a la Ley 11/2021, que
 * sobre un ITP de 1.500 € hace temer 75 € donde el art. 27.2 cobra 15 €. Aquel número no salía de
 * ningún módulo, así que nada podía avisar de que había envejecido.
 *
 * ⚠️ 07/09/2026 — esta constante nació aquel día CON EL 1 % BASE FUERA. Al componer un texto
 * desde aquí, usar `porcentajeBase` + `porcentajePorMes`: el recargo NO es «1 % por mes», es
 * «1 % más 1 % por cada mes completo».
 *
 * Vivió en `lib/calculadoras/recargoPresentacionTardia.ts` hasta el 29/10/2026 (C0055); el motor
 * la importa de aquí.
 */
export const ESCALA_RECARGO_EXTEMPORANEO = {
  /** % fijo de partida, se debe desde el primer día de retraso (art. 27.2 LGT) */
  porcentajeBase: 1,
  /** % adicional por cada mes completo de retraso (art. 27.2 LGT) */
  porcentajePorMes: 1,
  /** Meses transcurridos a partir de los cuales se aplica el recargo fijo */
  mesesEscalaProporcional: 12,
  /** % fijo una vez transcurridos 12 meses, más intereses de demora */
  porcentajeMas12Meses: 15,
  /** % de reducción si el recargo se paga en período voluntario (art. 27.5 LGT) */
  reduccionProntoPago: 25,
  /** Interés de demora tributario anual (%) — de intereses.ts, no escrito aquí */
  interesDemoraAnual: INTERES_DEMORA_TRIBUTARIO_2025.tipo,
  baseNormativa: 'Art. 27.2 LGT (Ley 58/2003), redacción de la Ley 11/2021 (BOE-A-2021-11473)',
} as const;

// ─── Recargos del período ejecutivo (art. 28 LGT) ─────────────────────────────

/** Se calculan sobre toda la deuda no ingresada en período voluntario y son incompatibles entre sí. */
export const RECARGOS_PERIODO_EJECUTIVO = {
  /** % si se paga toda la deuda antes de que se notifique la providencia de apremio (28.2) */
  ejecutivo: 5,
  /** % si se paga la deuda y el recargo en el plazo del art. 62.5 tras la providencia (28.3) */
  apremioReducido: 10,
  /** % en los demás casos; es el único compatible con los intereses de demora (28.4 y 28.5) */
  apremioOrdinario: 20,
  baseNormativa: 'Art. 28 LGT (Ley 58/2003)',
} as const;

// ─── No presentar en plazo sin perjuicio económico (art. 198 LGT) ─────────────

const MULTA_FIJA_SIN_PERJUICIO = 200;

/** Es el caso de una declaración que sale a devolver: no hay cuota que se deje de ingresar. */
export const SANCION_PRESENTACION_TARDIA_SIN_PERJUICIO = {
  /** Multa fija, en euros (198.1) */
  multaFija: MULTA_FIJA_SIN_PERJUICIO,
  /** «La mitad» si se presenta fuera de plazo sin requerimiento previo (198.2) */
  multaSinRequerimiento: MULTA_FIJA_SIN_PERJUICIO / 2,
  baseNormativa: 'Art. 198.1 y 198.2 LGT (Ley 58/2003)',
} as const;

// ─── Bienes y derechos en el extranjero: modelo 720 (DA 18.ª LGT + RGAT) ──────

export const MODELO_720 = {
  /** Valor conjunto de un bloque (cuentas · valores, seguros y rentas · inmuebles) por encima del que hay que informar de él */
  umbralPorBloque: 50_000,
  /** Subida de ese valor sobre la última declaración que obliga a volver a presentarla */
  incrementoParaVolverADeclarar: 20_000,
  baseNormativa: 'Disposición adicional 18.ª LGT (redacción de la Ley 5/2022) y arts. 42 bis, 42 ter y 54 bis RGAT (RD 1065/2007)',
} as const;

// ─── Fraccionamiento de la Renta sin intereses (art. 62.2 RIRPF) ──────────────

export const FRACCIONAMIENTO_IRPF = {
  /** % que se ingresa al presentar la declaración */
  primerPlazoPct: 60,
  /** % restante, en el plazo que fija la orden anual del modelo 100 */
  segundoPlazoPct: 40,
  baseNormativa: 'Art. 62.2 RIRPF (RD 439/2007)',
} as const;
