/**
 * Casos de prueba de `scripts/check-hidratacion-tests.mjs` — NO es un test que se ejecute.
 *
 * Lo reinyecta `npm run hidratacion:probar-candado`, que exige que el candado cace las
 * siembras a mano y deje pasar todo lo demás. Vive fuera de `tests/` a propósito: si estuviera
 * dentro, el barrido del build lo cazaría en cada compilación.
 *
 * Las formas de abajo están copiadas de los diez specs tal y como estaban antes del 12/09/2026.
 */

/* eslint-disable */
// @ts-nocheck

// ── DEBEN CAZARSE ────────────────────────────────────────────────────────────

// 1 · la forma canónica, con el descriptor partido en tres líneas (simulador-modulos-vs-directa)
async function siembraPartida(page, id, valor) {
  await page.evaluate(([id, valor]) => {
    const el = document.getElementById(id);
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    ).set;
    setter.call(el, String(valor));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, [id, valor]);
}

// 2 · en una sola línea (simulador-fotografia, simulador-distribucion-normal)
async function siembraEnUnaLinea(page, id, v) {
  await page.locator(`#${id}`).evaluate((el, texto) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, String(v));
}

// 3 · con espacios alrededor del punto, que es JavaScript igual de válido
async function siembraEspaciada(page, el) {
  const d = Object.getOwnPropertyDescriptor(window . HTMLInputElement . prototype, 'value');
  d.set.call(el, '5');
}

// 4 · guardando el prototipo en una variable antes (la variante que se le podría ocurrir a
//     cualquiera para esquivar un candado escrito contra `getOwnPropertyDescriptor`)
async function siembraIndirecta(el) {
  const proto = window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, '7');
}

// ── DEBEN PASAR ──────────────────────────────────────────────────────────────

// 5 · el helper, que es la forma correcta
async function correcta(page) {
  await sembrarValor(page, '#slider-enlaces', 2);
}

// 6 · un fill() con su testigo de estado
async function correctaConFill(page, campo) {
  await campo.fill('12,5');
  await esperarValorEnReact(page, campo, '12,5');
}

// 7 · leer el valor del DOM no es sembrarlo
async function soloLeer(page, id) {
  return page.locator(`#${id}`).inputValue();
}

// 8 · el escape declarado
async function conEscape(el) {
  // hidratacion-ok: caso de prueba del propio candado
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, '3');
}

// 9 · otro prototipo, que no es el de los inputs
async function otroPrototipo(el) {
  const d = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
  return d;
}
