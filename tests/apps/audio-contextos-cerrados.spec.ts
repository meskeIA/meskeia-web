/**
 * AudioContext que no se cierran — cabo C0038 (la forma del 1978 de conversor-morse y del 1935).
 *
 * ruleta-aleatoria, planificador-rutinas y temporizador-pomodoro creaban un AudioContext NUEVO
 * por cada sonido y no lo cerraban nunca: cada contexto vivo mantiene su hilo de audio hasta que
 * se cierra la pestaña. En la ruleta, el «tic» del giro se dispara en ~30 % de los fotogramas,
 * así que una sola tirada dejaba decenas de contextos abiertos (Chrome avisa y acaba negándose a
 * crear más). recortador-audio reutiliza uno, pero no lo cerraba al salir de la app.
 *
 * Se mide contando, con un AudioContext instrumentado, cuántos quedan sin cerrar tras el sonido.
 * Solo la ruleta tiene aquí su caso: en planificador y pomodoro el sonido llega al completar una
 * tarea o un pomodoro (flujo largo), y la reparación es la misma línea (`onended` → `close()`).
 */
import { test, expect, type Page } from '@playwright/test';

async function instrumentarAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    const registro = { creados: 0, cerrados: 0 };
    (window as unknown as { __audio: typeof registro }).__audio = registro;
    class Contado extends Original {
      constructor(opciones?: AudioContextOptions) {
        super(opciones);
        registro.creados++;
      }
      close(): Promise<void> {
        registro.cerrados++;
        return super.close();
      }
    }
    window.AudioContext = Contado;
  });
}

const registro = (page: Page) =>
  page.evaluate(() => (window as unknown as { __audio: { creados: number; cerrados: number } }).__audio);

test('ruleta-aleatoria: tras una tirada no queda ningún AudioContext abierto', async ({ page }) => {
  test.setTimeout(30_000);
  await instrumentarAudio(page);
  await page.goto('/ruleta-aleatoria/');
  const girar = page.getByRole('button', { name: /¡Girar!/ });
  // Un clic previo a la hidratación se pierde: se repite hasta que React lo recoge.
  await expect(async () => {
    await girar.click({ timeout: 1000 });
    await expect(page.getByRole('button', { name: /Girando/ })).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(page.getByRole('button', { name: /Girar otra vez/ })).toBeVisible({ timeout: 10_000 });

  await expect
    .poll(async () => {
      const r = await registro(page);
      return r.creados - r.cerrados;
    }, { message: 'contextos creados menos cerrados, tras el sonido de victoria', timeout: 3000 })
    .toBe(0);
  expect((await registro(page)).creados, 'la tirada sonó').toBeGreaterThan(1);
});
