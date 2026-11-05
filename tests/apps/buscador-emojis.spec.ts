/**
 * buscador-emojis — origen: /nueva-app-meskeia (PASO 4.bis), 05/11/2026, idea del usuario.
 *
 * La búsqueda está probada aparte (tests/buscador-emojis-motor.spec.ts). Aquí se miran las
 * TRANSICIONES de la vista:
 *  - arranque con las 6 destacadas → escribir cambia la lista → borrar vuelve a las destacadas;
 *  - un tema se activa y se desactiva con el mismo botón (aria-pressed), y escribir lo desactiva;
 *  - pulsar un emoji lo copia (portapapeles real) y lo anuncia en la región de estado;
 *  - «+» lo añade al mensaje, «Copiar mensaje» copia el texto entero y «Vaciar» lo deja vacío;
 *  - pegar un emoji muestra su aviso y sus intenciones; pulsar una lleva a buscarla.
 * Lo que Win + . no encuentra («me alegro», «qué bien») es justo lo que debe salir aquí.
 */
import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { DESTACADAS, INTENCIONES } from '../../app/buscador-emojis/intenciones';

const URL = '/buscador-emojis/';
const CAMPO = '#consulta-emoji';
const MENSAJE = '#mensaje-emoji';

const tarjetas = (page: Page) => page.locator('section[aria-labelledby="titulo-resultados"] article');
const tituloResultados = (page: Page) => page.locator('#titulo-resultados');

async function escribir(page: Page, texto: string) {
  await page.locator(CAMPO).fill(texto);
  await esperarValorEnReact(page, CAMPO, texto);
}

test.describe('Buscador de emojis por intención', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(URL);
    await esperarHidratacion(page, [CAMPO, MENSAJE]);
  });

  test('arranca con las destacadas y vuelve a ellas al borrar', async ({ page }) => {
    await expect(tituloResultados(page)).toHaveText('Lo que más se busca');
    await expect(tarjetas(page)).toHaveCount(DESTACADAS.length);

    await escribir(page, 'me alegro');
    await expect(tituloResultados(page)).toHaveText('Para «me alegro»');
    await expect(tarjetas(page).first().locator('h3').first()).toHaveText('Me alegro por ti');

    await escribir(page, '');
    await expect(tituloResultados(page)).toHaveText('Lo que más se busca');
  });

  test('«qué bien» encuentra «Me alegro por ti» y avisa de 🙂', async ({ page }) => {
    await escribir(page, 'qué bien');
    const primera = tarjetas(page).first();
    await expect(primera.locator('h3').first()).toHaveText('Me alegro por ti');
    await expect(primera.getByText('Cuidado con')).toBeVisible();
    await expect(primera.locator('li', { hasText: 'frío o de compromiso' })).toContainText('🙂');
  });

  test('una frase que no está en el diccionario lo dice', async ({ page }) => {
    await escribir(page, 'xyzzy');
    await expect(tarjetas(page)).toHaveCount(0);
    await expect(page.getByText('No encontramos esa frase en el diccionario')).toBeVisible();
  });

  test('un tema se activa y se desactiva, y escribir lo desactiva', async ({ page }) => {
    const tema = page.getByRole('button', { name: /Disculparse/ });
    const enGrupo = INTENCIONES.filter((i) => i.grupo === 'perdon').length;

    await tema.click();
    await expect(tema).toHaveAttribute('aria-pressed', 'true');
    await expect(tituloResultados(page)).toHaveText('Disculparse');
    await expect(tarjetas(page)).toHaveCount(enGrupo);

    await tema.click();
    await expect(tema).toHaveAttribute('aria-pressed', 'false');
    await expect(tituloResultados(page)).toHaveText('Lo que más se busca');

    await tema.click();
    await expect(tema).toHaveAttribute('aria-pressed', 'true');
    await escribir(page, 'gracias');
    await expect(tema).toHaveAttribute('aria-pressed', 'false');
    await expect(tituloResultados(page)).toHaveText('Para «gracias»');
  });

  test('un ejemplo rellena el buscador', async ({ page }) => {
    await page.getByRole('button', { name: 'lo siento', exact: true }).click();
    await expect(page.locator(CAMPO)).toHaveValue('lo siento');
    await expect(tarjetas(page).first().locator('h3').first()).toHaveText('Lo siento, perdón');
  });

  test('pulsar un emoji lo copia y lo anuncia', async ({ page }) => {
    await escribir(page, 'gracias');
    await tarjetas(page).first().getByRole('button', { name: /^Copiar 🙏/ }).click();
    await expect(page.getByRole('status')).toHaveText('Copiado: 🙏');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('🙏');
  });

  test('componer un mensaje: añadir, copiar entero y vaciar', async ({ page }) => {
    const mensaje = page.locator(MENSAJE);
    const copiarMensaje = page.getByRole('button', { name: 'Copiar mensaje' });
    const vaciar = page.getByRole('button', { name: 'Vaciar' });
    await expect(copiarMensaje).toBeDisabled();

    await mensaje.fill('¡Enhorabuena! ');
    await esperarValorEnReact(page, MENSAJE, '¡Enhorabuena! ');
    await escribir(page, 'felicidades');
    await tarjetas(page).first().getByRole('button', { name: 'Añadir 🎉 al mensaje' }).click();
    await expect(mensaje).toHaveValue('¡Enhorabuena! 🎉');

    await copiarMensaje.click();
    await expect(page.getByRole('status')).toHaveText('Copiado: el mensaje');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('¡Enhorabuena! 🎉');

    await vaciar.click();
    await expect(mensaje).toHaveValue('');
    await expect(copiarMensaje).toBeDisabled();
    await expect(vaciar).toBeDisabled();
  });

  test('pegar 🙂 muestra su aviso, y una intención desaconsejada lleva a buscarla', async ({ page }) => {
    await escribir(page, '🙂');
    const panel = page.getByRole('region', { name: 'Qué significan los emojis que has pegado' });
    await expect(panel.getByRole('heading', { name: 'Cara sonriente leve' })).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Saludo cordial o profesional' })).toBeVisible();

    await panel.getByRole('button', { name: 'Me alegro por ti' }).click();
    await expect(page.locator(CAMPO)).toHaveValue('Me alegro por ti');
    await expect(tarjetas(page).first().locator('h3').first()).toHaveText('Me alegro por ti');
  });
});
