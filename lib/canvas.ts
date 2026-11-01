/**
 * Ayudantes de dibujo en `<canvas>` que no dependen de la versión del navegador.
 *
 * ⚠️ 01/11/2026 (cabo C0535) — `CanvasRenderingContext2D.roundRect` no existe en Chrome < 99,
 * Safari < 16 ni Firefox < 112, y llamarlo sin comprobarlo tumba la app entera a la pantalla
 * de error. Caso de origen: la fila `pag:error` 140878 de Turso (30/10/2026), simulador-mitosis-meiosis
 * en un Chrome 97 de Linux, «TypeError: e.roundRect is not a function»; la app tiene aulas de
 * Perú y Chile, donde los ordenadores de clase tardan en actualizarse. Las seis apps que lo
 * llamaban pasan por aquí.
 */

/**
 * Añade al trazado actual un rectángulo con las esquinas redondeadas, como `ctx.roundRect` con
 * un radio único. Usa el método nativo si existe y, si no, lo traza con `arcTo`, que tienen
 * todos los navegadores. No llama a `beginPath` ni a `fill`/`stroke`: igual que el nativo.
 */
export function trazarRectRedondeado(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  radio: number
): void {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, ancho, alto, radio);
    return;
  }
  // Como el nativo: un ancho o alto negativo dibuja hacia el otro lado.
  const x0 = ancho < 0 ? x + ancho : x;
  const y0 = alto < 0 ? y + alto : y;
  const w = Math.abs(ancho);
  const h = Math.abs(alto);
  const r = Math.max(0, Math.min(radio, w / 2, h / 2));
  ctx.moveTo(x0 + r, y0);
  ctx.arcTo(x0 + w, y0, x0 + w, y0 + h, r);
  ctx.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
  ctx.arcTo(x0, y0 + h, x0, y0, r);
  ctx.arcTo(x0, y0, x0 + w, y0, r);
  ctx.closePath();
}
