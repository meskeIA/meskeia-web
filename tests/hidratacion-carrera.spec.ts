import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './apps/_hidratacion';

/**
 * El candado del propio candado: reinyecta la carrera de hidratación y exige que se vea.
 *
 * `tests/apps/_hidratacion.ts` existe porque un test puede escribir en un input antes de que
 * React lo haya montado: el DOM cambia, el estado de React no, y todo lo que se derive del
 * estado —una etiqueta, un resultado calculado— sigue en el valor viejo mientras el test pasa
 * en verde midiendo otra cosa. Eso no se puede comprobar leyendo el helper: hay que provocarlo.
 *
 * Se provoca estrangulando la CPU al 5 % con `Emulation.setCPUThrottlingRate` sobre una sesión
 * CDP, que es como se reprodujo a voluntad el fallo intermitente de `visualizador-sonido-ondas`
 * el 12/09/2026. La cobaya es `simulador-vsepr`, el caso determinista de aquel día: su
 * deslizador de enlaces arranca en 4 y el test le pide 2.
 *
 * Medido con rate 20 en este PC (i7-14700): tras `waitForSelector` el input ya está en pantalla
 * pero sin hidratar; se le siembra un 2 y queda DOM=2 · React=4. Y un segundo después, con la
 * app ya hidratada del todo, sigue DOM=2 · React=4 — ni siquiera se deshace solo, así que una
 * comprobación sobre el propio input pasaría y la molécula medida sería la equivocada.
 */

const RUTA = '/simulador-vsepr/';
const SLIDER = '#slider-enlaces';

/** Deja la CPU a 1/rate de su velocidad, para abrir la ventana entre `load` e hidratación. */
async function estrangularCPU(page: Page, rate: number): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
}

/** El valor con el que React ha RENDERIZADO el deslizador: su estado, no el del DOM. */
function valorEnReact(page: Page): Promise<string | null> {
  return page.evaluate((sel) => {
    const nodo = document.querySelector(sel) as unknown as Record<string, unknown> | null;
    if (!nodo) return null;
    const clave = Object.keys(nodo).find((k) => k.startsWith('__reactProps$'));
    if (!clave) return null;
    const props = nodo[clave] as Record<string, unknown> | null;
    return props && 'value' in props ? String(props.value) : null;
  }, SLIDER);
}

const estaHidratado = (page: Page): Promise<boolean> =>
  page.evaluate(
    (sel) =>
      Boolean((document.querySelector(sel) as unknown as Record<string, unknown>)?._valueTracker),
    SLIDER,
  );

test('la carrera es real: sembrar sin esperar mueve el DOM y deja a React en el valor viejo', async ({
  page,
}) => {
  test.slow(); // con la CPU al 5 % la página tarda segundos en hidratar
  await estrangularCPU(page, 20);
  await page.goto(RUTA);
  await page.waitForSelector(SLIDER); // el deslizador viaja en el HTML servido

  // Si en esta máquina la app ya hubiera hidratado, no hay carrera que observar y el test no
  // puede afirmar nada: se salta en vez de dar un falso rojo.
  test.skip(await estaHidratado(page), 'la app hidrató antes de tiempo: carrera no reproducida');

  // Exactamente lo que hacían los diez specs antes del 12/09/2026: setter nativo + evento
  // `input`, sin esperar a nada.
  await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLInputElement;
    // Sembrar esto con el helper lo haría bien y no quedaría nada que observar.
    // hidratacion-ok: es el defecto que este test reproduce a propósito.
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(el, '2');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, SLIDER);

  expect(await page.locator(SLIDER).inputValue(), 'el DOM sí recoge el valor').toBe('2');

  // Y se deja hidratar del todo antes de juzgar, para que nadie pueda decir que solo faltaba
  // esperar un poco más: el evento no llegó y no va a llegar.
  await page.waitForFunction(
    (sel) =>
      Boolean((document.querySelector(sel) as unknown as Record<string, unknown>)?._valueTracker),
    SLIDER,
    { timeout: 60000 },
  );
  await page.waitForTimeout(1000);
  expect(
    await valorEnReact(page),
    'el estado de React tenía que haberse quedado en 4: ese es el fallo que el helper evita',
  ).toBe('4');
});

test('con el helper, el valor llega al estado de React aunque la CPU vaya al 5 %', async ({
  page,
}) => {
  test.slow();
  await estrangularCPU(page, 20);
  await page.goto(RUTA);
  await esperarHidratacion(page, [SLIDER]);
  await sembrarValor(page, SLIDER, 2);
  expect(await valorEnReact(page)).toBe('2');
});

test('sembrarValor espera la hidratación por su cuenta, sin `esperarHidratacion` delante', async ({
  page,
}) => {
  test.slow();
  await estrangularCPU(page, 20);
  await page.goto(RUTA);
  // Sin ninguna espera previa: la garantía tiene que vivir dentro del helper, porque un spec
  // puede tocar un control que React monta más tarde (un panel que se despliega, otra pestaña).
  await sembrarValor(page, SLIDER, 2);
  expect(await valorEnReact(page)).toBe('2');
});
