import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Sorteo de Amigo Invisible (S0239) — TRANSICIONES de la vista; el reparto lo prueban los casos
 * a mano de tests/amigo-invisible-motor.spec.ts.
 *
 * Estado que tiene la app y que aquí se recorre:
 *   · organizador: lista → exclusiones → sorteo (sin enseñar el resultado) → entrega por
 *     enlaces o por turnos con el móvil (oculto → revelado → «ya lo ha visto»);
 *   · repetir el sorteo pide confirmación, porque invalida los enlaces enviados;
 *   · participante: llega con #r=… y solo ve lo suyo, tras pulsar; un enlace dañado avisa;
 *   · la lista y el sorteo sobreviven a una recarga (localStorage).
 */

const RUTA = '/sorteo-amigo-invisible/';
const NOMBRES = ['Ana', 'Luis', 'Marta', 'Jorge', 'Lucía', 'Daniel'];

async function abrir(page: Page) {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#ai-nombres', '#ai-evento']);
}

async function escribirLista(page: Page, nombres: string[]) {
  const texto = nombres.join('\n');
  await page.locator('#ai-nombres').fill(texto);
  await esperarValorEnReact(page, '#ai-nombres', texto);
}

async function excluir(page: Page, de: string, a: string, alReves: boolean) {
  await page.locator('#ai-excl-de').selectOption(de);
  await page.locator('#ai-excl-a').selectOption(a);
  const check = page.getByLabel('Y al revés (son pareja)');
  if ((await check.isChecked()) !== alReves) await check.click();
  await page.getByRole('button', { name: 'Añadir exclusión' }).click();
}

/** Copia el mensaje de una persona y devuelve el enlace que contiene. */
async function enlaceDe(page: Page, nombre: string): Promise<string> {
  await page.getByRole('button', { name: `Copiar el mensaje para ${nombre}` }).click();
  await expect(page.getByRole('status')).toContainText(`Copiado el mensaje para ${nombre}`);
  const texto = await page.evaluate(() => navigator.clipboard.readText());
  const url = texto.match(/https?:\/\/\S+#r=[A-Za-z0-9_-]+/)?.[0];
  if (!url) throw new Error(`El mensaje copiado no lleva enlace: ${texto}`);
  return url;
}

test.describe('Sorteo de amigo invisible', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('sin 3 personas no se puede sortear; con la lista de ejemplo, sí', async ({ page }) => {
    const sortear = page.getByRole('button', { name: 'Hacer el sorteo' });
    await expect(sortear).toBeDisabled();
    await escribirLista(page, ['Ana', 'Luis']);
    await expect(sortear).toBeDisabled();
    await expect(page.getByText('Faltan 1 para poder sortear.')).toBeVisible();
    await page.locator('#ai-nombres').fill('');
    await esperarValorEnReact(page, '#ai-nombres', '');
    await page.getByRole('button', { name: 'Probar con una lista de ejemplo' }).click();
    await expect(page.getByText('6 personas', { exact: false })).toBeVisible();
    await expect(sortear).toBeEnabled();
  });

  test('el sorteo no enseña el resultado al organizador', async ({ page }) => {
    await escribirLista(page, NOMBRES);
    await page.getByRole('button', { name: 'Hacer el sorteo' }).click();
    await expect(page.getByRole('heading', { name: '4. Que cada uno descubra el suyo' })).toBeVisible();
    await expect(page.getByText('Te toca regalar a')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Copiar el mensaje para / })).toHaveCount(6);
  });

  test('los 6 enlaces forman un reparto válido que respeta la pareja excluida', async ({ page, context }) => {
    await escribirLista(page, NOMBRES);
    await excluir(page, 'Ana', 'Luis', true);
    await expect(page.getByRole('list', { name: 'Exclusiones añadidas' }).getByRole('listitem')).toHaveCount(2);
    await page.getByRole('button', { name: 'Hacer el sorteo' }).click();

    const destino = new Map<string, string>();
    const receptor = await context.newPage();
    for (const n of NOMBRES) {
      const url = await enlaceDe(page, n);
      expect(url).not.toContain(n);
      await receptor.goto(url);
      await expect(receptor.getByRole('heading', { name: `Hola, ${n}` })).toBeVisible();
      // Oculto hasta que su dueño lo pide
      await expect(receptor.getByText('Te toca regalar a')).toHaveCount(0);
      await receptor.getByRole('button', { name: 'Ver a quién le regalo' }).click();
      const a = (await receptor.locator('[class*="revelacionNombre"]').innerText()).trim();
      destino.set(n, a);
    }
    await receptor.close();

    for (const n of NOMBRES) expect(destino.get(n)).not.toBe(n);
    expect(new Set(destino.values()).size).toBe(6);
    expect([...destino.values()].every((a) => NOMBRES.includes(a))).toBe(true);
    expect(destino.get('Ana')).not.toBe('Luis');
    expect(destino.get('Luis')).not.toBe('Ana');
  });

  test('el enlace lleva el nombre del sorteo, el presupuesto y la fecha en formato español', async ({ page, context }) => {
    await page.locator('#ai-evento').fill('Navidad en familia');
    await esperarValorEnReact(page, '#ai-evento', 'Navidad en familia');
    await escribirLista(page, NOMBRES);
    await page.locator('#ai-presupuesto').fill('20 €');
    await esperarValorEnReact(page, '#ai-presupuesto', '20 €');
    await page.locator('#ai-fecha').fill('2026-12-24');
    await esperarValorEnReact(page, '#ai-fecha', '2026-12-24');
    await page.getByRole('button', { name: 'Hacer el sorteo' }).click();
    const url = await enlaceDe(page, 'Marta');
    const receptor = await context.newPage();
    await receptor.goto(url);
    await expect(receptor.getByText('Navidad en familia')).toBeVisible();
    await expect(receptor.getByText('20 €')).toBeVisible();
    await expect(receptor.getByText('24/12/2026')).toBeVisible();
    await receptor.getByRole('button', { name: 'Organizar otro sorteo' }).click();
    await expect(receptor.getByRole('heading', { name: '1. Quién participa' })).toBeVisible();
    expect(new URL(receptor.url()).hash).toBe('');
  });

  test('pasar el móvil: oculto, revelado y marcado como visto', async ({ page }) => {
    await escribirLista(page, NOMBRES);
    await page.getByRole('button', { name: 'Hacer el sorteo' }).click();
    await page.getByRole('tab', { name: 'Pasar el móvil' }).click();
    await page.getByRole('button', { name: 'Marta', exact: true }).click();
    await expect(page.getByText('Pasa el móvil a Marta')).toBeVisible();
    await expect(page.getByText('te toca regalar a')).toHaveCount(0);

    await page.getByRole('button', { name: 'Soy Marta: ver el mío' }).click();
    await expect(page.getByText('Marta, te toca regalar a')).toBeVisible();
    const a = (await page.locator('[class*="revelacionNombre"]').innerText()).trim();
    expect(NOMBRES).toContain(a);
    expect(a).not.toBe('Marta');

    await page.getByRole('button', { name: 'Ya lo he visto: ocultar' }).click();
    await expect(page.getByText('te toca regalar a')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Marta ya lo ha visto' })).toBeVisible();
    await expect(page.getByText('1 de 6 lo han visto.')).toBeVisible();

    // «Volver» antes de revelar no cuenta como visto
    await page.getByRole('button', { name: 'Luis', exact: true }).click();
    await page.getByRole('button', { name: 'Volver', exact: true }).click();
    await expect(page.getByText('1 de 6 lo han visto.')).toBeVisible();
  });

  test('repetir el sorteo pide confirmación y reinicia los turnos', async ({ page }) => {
    await escribirLista(page, NOMBRES);
    await page.getByRole('button', { name: 'Hacer el sorteo' }).click();
    await page.getByRole('tab', { name: 'Pasar el móvil' }).click();
    await page.getByRole('button', { name: 'Ana', exact: true }).click();
    await page.getByRole('button', { name: 'Soy Ana: ver el mío' }).click();
    await page.getByRole('button', { name: 'Ya lo he visto: ocultar' }).click();
    await expect(page.getByText('1 de 6 lo han visto.')).toBeVisible();

    await page.getByRole('button', { name: 'Volver a sortear' }).click();
    await expect(page.getByText('los enlaces que ya hayas enviado dejarán de valer')).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByText('1 de 6 lo han visto.')).toBeVisible();

    await page.getByRole('button', { name: 'Volver a sortear' }).click();
    await page.getByRole('button', { name: 'Sí, sortear de nuevo' }).click();
    await expect(page.getByText('0 de 6 lo han visto.')).toBeVisible();
  });

  test('si una persona no puede regalar a nadie, se dice quién', async ({ page }) => {
    await escribirLista(page, ['Ana', 'Luis', 'Marta']);
    await excluir(page, 'Ana', 'Luis', false);
    await excluir(page, 'Ana', 'Marta', false);
    await page.getByRole('button', { name: 'Hacer el sorteo' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Ana no puede regalar a nadie' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '4. Que cada uno descubra el suyo' })).toHaveCount(0);
  });

  test('la lista y el sorteo sobreviven a una recarga, con los mismos enlaces', async ({ page }) => {
    await escribirLista(page, NOMBRES);
    await page.getByRole('button', { name: 'Hacer el sorteo' }).click();
    const antes = await enlaceDe(page, 'Jorge');
    await page.reload();
    await esperarHidratacion(page, ['#ai-nombres']);
    await expect(page.locator('#ai-nombres')).toHaveValue(NOMBRES.join('\n'));
    expect(await enlaceDe(page, 'Jorge')).toBe(antes);
  });

  test('un enlace dañado avisa y deja organizar uno nuevo', async ({ page }) => {
    await page.goto(`${RUTA}#r=estonoesunenlace`);
    await expect(page.getByRole('alert').filter({ hasText: 'Este enlace está incompleto o dañado' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '1. Quién participa' })).toBeVisible();
  });
});
