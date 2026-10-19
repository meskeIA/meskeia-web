import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Testigo de la familia «campo numérico que se puede teclear» — components/CampoNumerico.tsx
 *
 * DE DÓNDE SALE (cabos C0066, C0069 y C0081; Agenda `campo-numerico-compartido`, 19/10/2026)
 * Un `<input type="number">` con `onChange={(e) => setX(Number(e.target.value) || respaldo)}`
 * entrega vacío en cualquier estado intermedio, así que vaciar el campo lo rellenaba con el
 * respaldo BAJO EL CURSOR y lo tecleado quedaba detrás («1» + «3» = «13»), y «14.» o «-» a medio
 * escribir se convertían en 0. `fill()` no lo ve: escribe el valor entero de golpe y el test pasa
 * en verde. Por eso aquí se teclea PULSACIÓN A PULSACIÓN, como una persona.
 *
 * Para cada campo migrado:
 *   1. se vacía con Ctrl+A y Retroceso → el campo queda VACÍO (antes: el respaldo);
 *   2. se teclea la cifra tecla a tecla → el campo enseña exactamente lo tecleado;
 *   3. la app la usa: la lectura de la página enseña el valor en formato español;
 *   4. al salir del campo, enseña el valor aplicado en formato español.
 *
 * Reinyección: con el `type="number"` y el `||` de antes, el paso 1 falla en todos (el campo
 * se rellena con el respaldo) y el 2 da «12400» o «0.15».
 */

interface Campo {
  slug: string;
  /** Selector del campo. */
  campo: string;
  /** Lo que se teclea, tecla a tecla. */
  teclear: string;
  /** Lo que tiene que decir la página con ese valor (selector y texto). */
  lectura: { selector: string; texto: string };
  /** Lo que enseña el campo al salir. */
  alSalir: string;
  /** Antes de tocar el campo (pestañas, modos). */
  preparar?: (page: Page) => Promise<void>;
  /** Un `<input>` presente al cargar, si el campo solo aparece tras `preparar`. */
  hidratado?: string;
}

const CAMPOS: Campo[] = [
  {
    slug: 'calculadora-seccion-cable',
    campo: '#tension',
    teclear: '400',
    lectura: { selector: 'label[for="tension"]', texto: '400 V' },
    alSalir: '400',
  },
  {
    slug: 'calculadora-seccion-cable',
    campo: '#longitud',
    teclear: '12.5',
    lectura: { selector: 'label[for="longitud"]', texto: '12,5 m' },
    alSalir: '12,5',
  },
  {
    slug: 'calculadora-seccion-cable',
    campo: '#potencia',
    teclear: '2300',
    lectura: { selector: 'label[for="potencia"]', texto: '2300 W' },
    alSalir: '2300',
  },
  {
    slug: 'calculadora-seccion-cable',
    campo: '#corriente',
    teclear: '16,5',
    lectura: { selector: 'label[for="corriente"]', texto: '16,5 A' },
    alSalir: '16,5',
    hidratado: '#tension',
    preparar: async (page) => {
      await page.getByRole('button', { name: 'Corriente (A)' }).click();
    },
  },
  {
    // Antes: Math.max(1, … Number(v) || 1): vaciar dejaba «1» y teclear «58» daba 158
    slug: 'simulador-disoluciones',
    campo: 'input[aria-label="Masa molar personalizada en g/mol"]',
    teclear: '58.44',
    lectura: { selector: 'p:has(input[aria-label="Masa molar personalizada en g/mol"]) strong', texto: '58,44 g/mol' },
    alSalir: '58,44',
    hidratado: '#masa-input',
    preparar: async (page) => {
      await page.locator('button:has-text("Personalizado")').first().click();
    },
  },
];

for (const c of CAMPOS) {
  test(`${c.slug} ${c.campo}: se vacía y se teclea «${c.teclear}» tecla a tecla`, async ({ page }) => {
    await page.goto(`/${c.slug}/`);
    await esperarHidratacion(page, [c.hidratado ?? c.campo]);
    if (c.preparar) await c.preparar(page);

    const campo = page.locator(c.campo);
    await campo.click();
    await campo.press('Control+a');
    await campo.press('Backspace');
    await expect(campo, 'vaciar el campo NO lo rellena con un respaldo').toHaveValue('');

    await campo.pressSequentially(c.teclear, { delay: 40 });
    await expect(campo, 'el campo enseña lo tecleado, tal cual').toHaveValue(c.teclear);
    await expect(page.locator(c.lectura.selector)).toContainText(c.lectura.texto);

    await campo.press('Tab');
    await expect(campo, 'al salir enseña el valor aplicado').toHaveValue(c.alSalir);
  });
}
