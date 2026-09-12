import { test, expect, Page } from '@playwright/test';

/**
 * estimacion-deduccion-discapacidad — el mínimo valorado al tipo marginal
 * Escrita el 12/09/2026, tras reparar el defecto.
 *
 * QUÉ DEFECTO VIGILA
 * ──────────────────
 * Es el mismo error del art. 63.1.2.º LIRPF con otra forma. Aquí no había ninguna base de la
 * que restar: la app pedía al usuario su tipo marginal y publicaba `ahorro = mínimo × marginal`,
 * con el texto «el mínimo reduce la base liquidable, no la cuota».
 *
 * La premisa es falsa. El mínimo NO reduce la base: forma parte de la base liquidable general
 * y se grava a tipo cero aplicando la escala dos veces y restando. La consecuencia práctica es
 * que **el ahorro no depende del tipo marginal de quien declara**: el mínimo se valora siempre
 * a los tipos bajos de la escala. La app SOBREESTIMABA el ahorro hasta más del doble — con el
 * mínimo máximo de 12.000 € y un marginal del 45 % publicaba 5.400 € donde la ley da 2.535 €.
 *
 * El parámetro `tipoMarginal` desapareció con el defecto, aquí y en la tool
 * `calcular_deduccion_discapacidad` del MCP de Delegum, porque no interviene en el resultado.
 *
 * Normas verificadas en sesión el 12/09/2026 contra la AEAT (manual de ayuda de Renta 2025,
 * «8.4.3.1 Cuota íntegra estatal»; arts. 60 y 61 LIRPF para los importes del mínimo).
 *
 * CÓMO SE CALCULA EL AHORRO, A MANO
 * ─────────────────────────────────
 * Es lo que la escala aplica al mínimo por discapacidad ENCIMA del mínimo personal de 5.550 €:
 *     ahorro = escala(5.550 + mínimo) − escala(5.550)
 * Escala: 12.450 @19 % · 20.200 @24 % · 35.200 @30 % …
 *
 *   mínimo  3.000 € → escala(8.550) − escala(5.550)  = 3.000×19 %                 =   570,00 €
 *   mínimo  6.000 € → escala(11.550) − escala(5.550) = 6.000×19 %                 = 1.140,00 €
 *   mínimo  9.000 € → escala(14.550) − escala(5.550) = 6.900×19 % + 2.100×24 %    = 1.815,00 €
 *   mínimo 12.000 € → escala(17.550) − escala(5.550) = 6.900×19 % + 5.100×24 %    = 2.535,00 €
 *
 * Es una cota INFERIOR: quien tenga además mínimos por descendientes o ascendientes los apila
 * debajo, y el de discapacidad cae en tramos algo más altos.
 */

const RUTA = '/estimacion-deduccion-discapacidad/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

async function fila(page: Page, etiqueta: string): Promise<string> {
  const f = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
  return limpiar(await f.locator('span').nth(1).innerText());
}

async function ahorro(page: Page): Promise<string> {
  return limpiar(await page.locator('css=p:below(:text("Ahorro fiscal estimado"))').first().innerText());
}

async function estimar(page: Page, opciones: { titular?: string; grado?: string; asistencia?: boolean }): Promise<void> {
  if (opciones.titular) await page.getByRole('radio', { name: opciones.titular }).check();
  if (opciones.grado) await page.getByRole('radio', { name: opciones.grado }).check();
  if (opciones.asistencia) await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Estimar ahorro fiscal por discapacidad' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Estimación de Deducción IRPF por Discapacidad'
  );
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · contribuyente con grado 33-64 %, sin acreditar asistencia', async ({ page }) => {
  // Mínimo = 3.000 € (art. 60, sin el incremento por gastos de asistencia).
  // Ahorro = escala(8.550) − escala(5.550) = 3.000 × 19 % = 570,00 €, al 19,00 % efectivo.
  // Antes de la reparación, con el marginal por defecto del 24 %, publicaba 720,00 €; y con
  // un marginal del 47 %, 1.410,00 €, que es dos veces y media lo que la ley concede.
  await estimar(page, { grado: 'Del 33% al 64%' });

  expect(await fila(page, 'Total mínimo aplicable')).toBe('3000,00 €');
  expect(await fila(page, 'Tipo al que se valora el mínimo')).toBe('19,00 %');
  expect(await ahorro(page)).toBe('570,00 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · grado ≥ 65 %: 9.000 + 3.000 € y el mínimo cruza al segundo tramo', async ({ page }) => {
  // Mínimo = 9.000 € (art. 60) + 3.000 € de gastos de asistencia, que con grado ≥ 65 % proceden
  // por el propio grado, sin acreditar nada más = 12.000 €.
  // Ahorro = escala(17.550) − escala(5.550)
  //        = (12.450 − 5.550)×19 % + (17.550 − 12.450)×24 %
  //        = 6.900×19 % + 5.100×24 % = 1.311,00 + 1.224,00 = 2.535,00 €
  // Tipo efectivo = 2.535 / 12.000 = 21,125 % → 21,13 %
  //
  // Este es el caso donde el defecto valía más: con un marginal del 45 % la app publicaba
  // 5.400,00 €, es decir 2.865,00 € de ahorro que no existen.
  await estimar(page, { grado: '65% o superior' });

  expect(await fila(page, 'Mínimo por discapacidad')).toBe('9000,00 €');
  expect(await fila(page, 'Gastos de asistencia')).toBe('3000,00 €');
  expect(await fila(page, 'Total mínimo aplicable')).toBe('12.000,00 €');
  expect(await fila(page, 'Tipo al que se valora el mínimo')).toBe('21,13 %');
  expect(await ahorro(page)).toBe('2535,00 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('ya no se pregunta el tipo marginal, porque no interviene', async ({ page }) => {
  // El selector de tipo marginal era la cara visible del defecto: prometía que el ahorro
  // dependía de la renta de quien declara. Si vuelve a aparecer, el error ha vuelto con él.
  await expect(page.getByLabel('Tipo marginal IRPF aproximado')).toHaveCount(0);

  await estimar(page, { grado: '65% o superior' });
  const nota = page.locator('css=div[role="note"]').last();
  await expect(nota).toContainText('no reduce la base liquidable');
  await expect(nota).toContainText('tipo cero');
  await expect(nota).toContainText('no depende de tu tipo marginal');
  await expect(nota).toContainText('cota inferior');
});
