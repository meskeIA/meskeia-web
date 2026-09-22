/**
 * Prueba del INSTRUMENTO con el que se miden los dos specs de `--text-muted`.
 *
 * Un medidor de contraste que se equivoca no da error: da un número, y el número
 * parece un hallazgo. Los tres casos de aquí abajo son los tres errores que cometió
 * de verdad mientras se escribía, cada uno detectado por una cifra imposible o por
 * una captura, nunca por un fallo del test:
 *
 *   1. `color(srgb 0.93 0.96 0.97)` leído con una regex numérica → rgb(1, 1, 1).
 *      Un azul clarísimo pasaba por NEGRO, y con él el único elemento del catálogo
 *      donde esta reparación parecía empeorar el contraste (7,33 → 4,09). Era falso.
 *   2. Un gradiente de marca al 6 % tomado como color sólido → 1,44:1 donde se lee
 *      perfectamente, por no componer el alfa sobre lo que hay debajo.
 *   3. Dividir por el alfa al leer el píxel «para des-premultiplicar» →
 *      rgb(380, 380, 380), que no es un color.
 *
 * Si alguna vez el barrido devuelve CERO elementos, esto falla antes y dice por qué:
 * es la otra forma de mentir que ya tuvo (un matcher hexadecimal que no casaba con
 * `gray` ni con `#999`, y el barrido salía en verde sin haber medido nada).
 */
import { test, expect } from '@playwright/test';
import { medirMuted, prepararParaMedir } from './contraste-text-muted-auxiliares';

/** Página sintética: cada caja declara su `--text-muted` y su fondo, y dice el ratio que debe salir. */
const PAGINA = `
<!doctype html><html data-theme="light"><head><meta charset="utf-8"><style>
  body { margin: 0; background: #FFFFFF; font-family: sans-serif; }
  div { font-size: 13px; padding: 8px; }
  .muted { color: var(--text-muted); }
  #hex        { --text-muted: #6E6E6E; --text-secondary: #666666; background: #FFFFFF; }
  #corto      { --text-muted: #999;    --text-secondary: #666666; background: #FFFFFF; }
  #nombrado   { --text-muted: gray;    --text-secondary: #555555; background: #FFFFFF; }
  #srgb       { --text-muted: #6E6E6E; --text-secondary: #666666; background: color(srgb 0.934431 0.962039 0.973647); }
  #gradiente  { --text-muted: #6E6E6E; --text-secondary: #666666; background-color: #FFFFFF;
                background-image: linear-gradient(135deg, rgba(46, 134, 171, 0.06), rgba(46, 134, 171, 0.06)); }
  #translucido{ --text-muted: #6E6E6E; --text-secondary: #666666; background: rgba(0, 0, 0, 0.04); }
</style></head><body>
  <div id="hex"><span class="muted">texto sobre blanco</span></div>
  <div id="corto"><span class="muted">token escrito de tres cifras</span></div>
  <div id="nombrado"><span class="muted">token con nombre de color</span></div>
  <div id="srgb"><span class="muted">fondo en color(srgb ...)</span></div>
  <div id="gradiente"><span class="muted">fondo con gradiente al 6 por ciento</span></div>
  <div id="translucido"><span class="muted">fondo negro al 4 por ciento</span></div>
</body></html>`;

/** ratio esperado (calculado a mano con la fórmula WCAG) y fondo que debe deducir. */
const ESPERADO: Record<string, { ratio: number; fondo: string }> = {
  'texto sobre blanco': { ratio: 5.1, fondo: 'rgb(255, 255, 255)' },
  'token escrito de tres cifras': { ratio: 2.85, fondo: 'rgb(255, 255, 255)' },
  'token con nombre de color': { ratio: 3.95, fondo: 'rgb(255, 255, 255)' },
  'fondo en color(srgb ...)': { ratio: 4.63, fondo: 'rgb(238, 245, 248)' },
  'fondo con gradiente al 6 por ciento': { ratio: 4.75, fondo: 'rgb(242, 248, 250) (con gradiente)' },
  'fondo negro al 4 por ciento': { ratio: 4.68, fondo: 'rgb(245, 245, 245)' },
};

test('el medidor lee bien el color, el fondo y el gradiente', async ({ page }) => {
  await page.setContent(PAGINA);
  await prepararParaMedir(page);
  const { medidas } = await medirMuted(page);

  // Que mida ALGO: el fallo más silencioso de este instrumento es devolver cero.
  expect(medidas.length, 'el barrido no ha encontrado ningún elemento con --text-muted').toBe(6);

  const canales = (s: string) => (s.match(/\d+/g) ?? []).map(Number);
  for (const [texto, esperado] of Object.entries(ESPERADO)) {
    const m = medidas.find((x) => x.texto.startsWith(texto.slice(0, 30)));
    expect(m, `no se ha medido «${texto}»`).toBeTruthy();
    // ±1 por canal: el canvas cuantiza, y componer un 6 % de alfa deja 243 donde la
    // aritmética da 242,46. Un error de verdad no se queda en una unidad.
    const [r1, g1, b1] = canales(m!.fondo);
    const [r2, g2, b2] = canales(esperado.fondo);
    expect(
      Math.max(Math.abs(r1 - r2), Math.abs(g1 - g2), Math.abs(b1 - b2)),
      `fondo mal deducido en «${texto}»: ${m!.fondo} en vez de ${esperado.fondo}`,
    ).toBeLessThanOrEqual(1);
    expect(m!.fondo.includes('(con gradiente)'), `gradiente mal señalado en «${texto}»`)
      .toBe(esperado.fondo.includes('(con gradiente)'));
    expect(
      Math.abs(m!.ratio - esperado.ratio),
      `«${texto}»: ${m!.ratio}:1 sobre ${m!.fondo}, se esperaba ${esperado.ratio}:1`,
    ).toBeLessThanOrEqual(0.06);
  }
});

test('la jerarquía se lee en la dirección correcta', async ({ page }) => {
  await page.setContent(PAGINA.replace('--text-muted: #6E6E6E; --text-secondary: #666666; background: #FFFFFF;',
    '--text-muted: #6E6E6E; --text-secondary: #666666; background: #FFFFFF;'));
  await prepararParaMedir(page);
  const { jerarquia } = await medirMuted(page);
  // #6E6E6E es más claro que #666666: es la jerarquía del tema claro.
  expect(jerarquia).toBe('muted-mas-claro');
});
