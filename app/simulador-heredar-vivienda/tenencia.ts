/**
 * Tenencia del causante para el IIVTNU (art. 107.4 TRLRHL): años y meses COMPLETOS, contados
 * de fecha a fecha.
 *
 * Sin dependencias, para que el spec pueda probarla sin navegador. La usa `page.tsx`.
 *
 * ── De dónde sale ────────────────────────────────────────────────────────────
 * El art. 107.4 TRLRHL manda tomar el coeficiente por «años completos» y, por debajo del año,
 * prorratearlo por «meses completos», «sin tener en cuenta las fracciones de mes». Los plazos
 * por meses o años se cuentan de fecha a fecha (art. 5.1 del Código Civil), y cuando el mes
 * final no tiene el día equivalente al inicial el plazo vence el último día de ese mes.
 *
 * Hallazgo 1615 (25/09/2026): con solo el AÑO se contaba un año de más a quien compró en un mes
 * posterior al de hoy. Se pasó a preguntar el mes, pero sin el día el aniversario se daba por
 * cumplido en cuanto llegaba su mes (hallazgo 2126): una escritura del 28/09/2006 vista el
 * 25/09/2026 son 19 años (coeficiente 0,23), no 20 (0,40). Desde el 26/09/2026 se pregunta
 * también el día.
 */

/** Días del mes `mes` (1-12) del año `anio`, con los bisiestos. */
export function diasDelMes(anio: number, mes: number): number {
  return new Date(anio, mes, 0).getDate();
}

/** Una fecha civil: año, mes (1-12) y día (1-31). */
export interface FechaCivil {
  anio: number;
  mes: number;
  dia: number;
}

/**
 * Meses completos entre `desde` y `hasta`, de fecha a fecha. NEGATIVO si `desde` es posterior a
 * `hasta`: quien llama decide qué hacer con una fecha imposible, en vez de toparla en 0 en
 * silencio, que es lo que liquidaba «0 meses de tenencia» para una compra posterior a la
 * muerte (hallazgo 2125).
 *
 * Ejemplos (hasta = 25/09/2026): 28/09/2006 → 239 (19 años y 11 meses) · 25/09/2006 → 240 ·
 * 28/08/2026 → 0 · 25/08/2026 → 1 · 26/09/2026 → −1. Y de fecha a fecha con meses cortos:
 * 31/08/2026 → 30/09/2026 es un mes completo.
 */
export function mesesCompletosEntre(desde: FechaCivil, hasta: FechaCivil): number {
  const meses = (hasta.anio - desde.anio) * 12 + (hasta.mes - desde.mes);
  // El día del vencimiento es el mismo día del mes, o el último si ese mes no lo tiene.
  const diaVencimiento = Math.min(desde.dia, diasDelMes(hasta.anio, hasta.mes));
  return hasta.dia < diaVencimiento ? meses - 1 : meses;
}
