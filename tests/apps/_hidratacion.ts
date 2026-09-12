import { Page } from '@playwright/test';

/**
 * Esperar a que una app esté HIDRATADA antes de interactuar con ella.
 *
 * ── El problema, medido el 12/09/2026 ────────────────────────────────────────
 * `page.goto()` espera al evento `load`, que garantiza que los chunks se han DESCARGADO,
 * no que React los haya ejecutado. Y esperar a un encabezado tampoco sirve: el <h1> viaja
 * en el HTML servido, así que está en pantalla mucho antes de que la página responda a
 * nada. Entre esos dos instantes hay una ventana —32 ms en un simulador ligero, más en
 * cuanto la máquina va cargada— en la que el test ya puede escribir en un input y la app
 * todavía no se entera.
 *
 * Lo que ocurre entonces no es un simple «no pasó nada», y por eso cuesta tanto verlo:
 *
 *   · El DOM SÍ cambia (el deslizador se mueve, el campo muestra el texto), de modo que
 *     una comprobación sobre el propio input pasa en verde. Lo que no cambia es el estado
 *     de React, así que todo lo que se derive de él —una etiqueta, un `aria-label`, un
 *     resultado calculado— sigue mostrando el valor anterior. La página queda descuadrada
 *     consigo misma y el test mide otra cosa distinta de la que cree.
 *   · Si además el valor se sembró con el setter nativo, el intento perdido deja el
 *     rastreador de valor de React apuntando a un valor que nunca llegó a aplicarse.
 *     A partir de ahí React DESCARTA por duplicado cualquier evento con ese mismo valor,
 *     así que reintentar no lo arregla nunca: solo lo desatasca un valor distinto.
 *
 * Los dos casos que lo destaparon:
 *   · `simulador-vsepr` — determinista: pedir X=2,E=2 devolvía AX₄E₂ porque el primer
 *     movimiento de cada test se perdía siempre.
 *   · `visualizador-sonido-ondas` — intermitente (1 de cada 3 corridas): tras `fill('880')`
 *     el botón «Escuchar tono a 880 hercios» no llegaba a existir. Reproducido a voluntad
 *     estrangulando la CPU con `Emulation.setCPUThrottlingRate`.
 *
 * ── Cómo se sondea ───────────────────────────────────────────────────────────
 * Por el rastreador de valor que React instala en cada input controlado al montarlo. Es un
 * interno de React, sí, pero es exactamente la precondición que necesita el test: si no
 * está, el evento no va a llegar. Y si React lo cambiase algún día, esto fallaría con un
 * mensaje legible en vez de dejar pasar tests que miden la molécula equivocada.
 *
 * ⚠️ Hay ~8 specs más del catálogo que siembran valores con el setter nativo y no esperan
 * a nada (`grep -rl "HTMLInputElement.prototype" tests/`). No están en rojo, pero corren
 * el mismo riesgo: el fallo aparece cuando la máquina va cargada, y en verde no se
 * distingue de un test que sí comprueba algo.
 *
 * @param page   La página, ya cargada.
 * @param selectores Los inputs cuya interactividad va a necesitar el test.
 */
export async function esperarHidratacion(
  page: Page,
  selectores: readonly string[],
): Promise<void> {
  await page.waitForFunction(
    (sels) =>
      sels.every((sel) =>
        Boolean(
          (document.querySelector(sel) as unknown as Record<string, unknown> | null)
            ?._valueTracker,
        ),
      ),
    selectores as string[],
    { timeout: 15000 },
  );
}
