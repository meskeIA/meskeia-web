import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * presupuesto-viaje — Inspector, primera inspección (11/11/2026)
 *
 * Qué hace la app: suma los gastos de un viaje por categorías (transporte, alojamiento, comida,
 * actividades, otros), los divide entre los viajeros y entre los días (total ÷ días ÷ personas),
 * da el peso de cada categoría sobre el total y, con un presupuesto máximo, lo que sobra o se
 * excede y un reparto automático 30/35/20/10/5 %. La divisa solo cambia el símbolo: no convierte.
 *
 * Lo único normativo: la FAQ «¿El presupuesto de viaje es deducible…?» pinta las dietas de
 * manutención con `DIETAS_MANUTENCION_EXENTAS` de data/fiscal/retribuciones-exentas.ts, que
 * coinciden con el art. 9.A.3.a del RIRPF (RD 439/2007), cotejado en el BOE el 11/11/2026:
 * 53,34 € en España y 91,35 € en el extranjero pernoctando; 26,67 € y 48,08 € sin pernoctar.
 *
 * Los importes son `<input type="number">` leídos con `parseFloat(v.replace(',', '.'))`: Chromium,
 * en esta página `lang="es"`, entrega «1.500» tal cual y se lee 1,5; «1.234,56» llega como
 * «1.23456». Los campos Días y Personas ya son `CampoNumerico` y leen bien.
 *
 * Los casos abiertos van en `test.fail()` con «HALLAZGO (11/11/2026, ABIERTO)»: cuando se
 * reparen, el test pasará y `test.fail()` lo pondrá en rojo para que se quite la marca.
 */

test.use({ locale: 'es-ES' });

async function abrir(page: Page): Promise<void> {
  await page.goto('/presupuesto-viaje/');
  await esperarHidratacion(page, ['#destino', '#dias', '#personas', '#presupuestoMax']);
}

/** Escribe como un usuario: foco, seleccionar todo, teclear y salir del campo. */
async function teclear(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.getByLabel(etiqueta, { exact: true });
  await campo.click();
  await campo.press('Control+A');
  await campo.pressSequentially(valor, { delay: 10 });
  await campo.blur();
}

function resumen(page: Page): Locator {
  return page.locator('section').filter({ has: page.getByRole('heading', { name: /^Resumen/ }) });
}

test.describe('presupuesto-viaje', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · 7 días, 4 personas: total, por persona, por día, desglose y presupuesto', async ({
    page,
  }) => {
    await teclear(page, 'Personas', '4');
    await expect(page.locator('#personas')).toHaveValue('4');
    await teclear(page, 'Presupuesto máximo (opcional)', '3000');
    const importes: [string, string][] = [
      ['Importe de Vuelos en EUR', '480'],
      ['Importe de Trenes / buses en EUR', '60'],
      ['Importe de Hotel / Airbnb en EUR', '840'],
      ['Importe de Restaurantes en EUR', '350'],
      ['Importe de Supermercado en EUR', '90'],
      ['Importe de Museos / monumentos en EUR', '80'],
      ['Importe de Excursiones en EUR', '160'],
      ['Importe de Compras / souvenirs en EUR', '40'],
      ['Importe de Imprevistos en EUR', '150'],
    ];
    for (const [etiqueta, valor] of importes) await teclear(page, etiqueta, valor);

    const panel = resumen(page);
    // 480 + 60 + 840 + 350 + 90 + 80 + 160 + 40 + 150 = 2250 (es-ES no agrupa cuatro cifras)
    await expect(panel).toContainText(/Total del viaje\s*2250,00\s*€/);
    // 2250 ÷ 4 = 562,50 · 2250 ÷ 7 ÷ 4 = 80,357… → 80,36
    await expect(panel).toContainText(/Por persona \(4 viajeros\)\s*562,50 €/);
    await expect(panel).toContainText('80,36 €/día');
    // Transporte 540 (24 %), Alojamiento 840 (37,33 → 37), Comida 440 (19,56 → 20),
    // Actividades 240 (10,67 → 11), Otros 190 (8,44 → 8)
    await expect(panel).toContainText(/Transporte\s*540,00 €\s*\(24\s?%\)/);
    await expect(panel).toContainText(/Alojamiento\s*840,00 €\s*\(37\s?%\)/);
    await expect(panel).toContainText(/Comida y bebida\s*440,00 €\s*\(20\s?%\)/);
    await expect(panel).toContainText(/Actividades y entradas\s*240,00 €\s*\(11\s?%\)/);
    await expect(panel).toContainText(/Otros\s*190,00 €\s*\(8\s?%\)/);
    // 2250 ÷ 3000 = 75 %; sobran 750
    await expect(panel).toContainText('Dentro del presupuesto');
    await expect(panel).toContainText(/2250,00 \/ 3000,00 €/);
    await expect(panel).toContainText(/75\s?% del presupuesto/);
    await expect(panel).toContainText('Te sobran 750,00 €');
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    await expect(page.getByText('Subtotal: 540,00 €')).toBeVisible();
  });

  test('CASO 2 (límite) · 0 días se acota a 1, una persona, importe de más de mil con coma decimal', async ({
    page,
  }) => {
    await teclear(page, 'Días de viaje', '0');
    await expect(page.locator('#dias')).toHaveValue('1');
    await teclear(page, 'Personas', '1');
    await expect(page.locator('#personas')).toHaveValue('1');
    await teclear(page, 'Importe de Hotel / Airbnb en EUR', '1234,56');

    const panel = resumen(page);
    await expect(panel).toContainText(/Total del viaje\s*1234,56\s*€/);
    await expect(panel).toContainText(/Por persona \(1 viajero\)\s*1234,56 €/);
    // Con un solo día el «por día» es el «por persona»: la app no lo repite
    await expect(panel).not.toContainText('/día');
  });

  test('DATO · la FAQ de autónomos pinta las dietas de data/fiscal (art. 9.A.3.a RIRPF)', async ({
    page,
  }) => {
    // BOE-A-2007-6820, art. 9.A.3.a (versión de 17/07/2023): 53,34 / 91,35 € pernoctando;
    // 26,67 / 48,08 € sin pernoctar. formatCurrency pone espacio duro antes del euro.
    const faq = page.locator('li').filter({ hasText: 'deducible de impuestos para autónomos' });
    await expect(faq).toContainText(
      /26,67\s€ sin pernoctar y 53,34\s€ si pernoctas fuera; en el extranjero, 48,08\s€ y 91,35\s€/,
    );
  });

  test('CASO 3 (rechazo) · personas en 0 o con letras no se aceptan', async ({ page }) => {
    await teclear(page, 'Importe de Hotel / Airbnb en EUR', '300');
    // Letras: CampoNumerico las ignora y queda el valor anterior (2)
    await teclear(page, 'Personas', 'abc');
    await expect(page.locator('#personas')).toHaveValue('2');
    await expect(resumen(page)).toContainText(/Por persona \(2 viajeros\)\s*150,00 €/);
    // Cero: se acota al mínimo, 1
    await teclear(page, 'Personas', '0');
    await expect(page.locator('#personas')).toHaveValue('1');
    await expect(resumen(page)).toContainText(/Por persona \(1 viajero\)\s*300,00 €/);
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · CASO 3 · un importe negativo resta del total', async ({
    page,
  }) => {
    // Un gasto no puede ser negativo: «-500» debe rechazarse (o quedarse en 0) y el total seguir
    // en 300. Hoy entra tal cual: total −200,00 € y −100,00 € por persona. El `min="0"` del
    // input no impide teclearlo.
    test.fail();
    await teclear(page, 'Importe de Hotel / Airbnb en EUR', '300');
    await teclear(page, 'Importe de Vuelos en EUR', '-500');
    await expect(resumen(page)).toContainText(/Total del viaje\s*300,00\s*€/, { timeout: 2000 });
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · un importe con punto de millar se lee mil veces menor', async ({
    page,
  }) => {
    // «1.500» es mil quinientos y «1.234,56» mil doscientos treinta y cuatro con cincuenta y seis
    // (formato español, parseSpanishNumber). Hoy: total 1,50 € y, con «1.234,56», 1,23 €.
    test.fail();
    await teclear(page, 'Personas', '1');
    await teclear(page, 'Importe de Vuelos en EUR', '1.500');
    await expect(resumen(page)).toContainText(/Total del viaje\s*1500,00\s*€/, { timeout: 2000 });
    await teclear(page, 'Importe de Vuelos en EUR', '1.234,56');
    await expect(resumen(page)).toContainText(/Total del viaje\s*1234,56\s*€/, { timeout: 2000 });
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · un presupuesto máximo con punto de millar se lee mil veces menor', async ({
    page,
  }) => {
    // «3.000» es tres mil: con 500 de hotel, 500 / 3000 = 16,67 → 17 % y sobran 2500.
    // Hoy: «500,00 / 3,00 €», «16667% del presupuesto», «Te excedes en 497,00 €».
    test.fail();
    await teclear(page, 'Presupuesto máximo (opcional)', '3.000');
    await teclear(page, 'Importe de Hotel / Airbnb en EUR', '500');
    const panel = resumen(page);
    await expect(panel).toContainText(/500,00 \/ 3000,00 €/, { timeout: 2000 });
    await expect(panel).toContainText(/17\s?% del presupuesto/, { timeout: 2000 });
    await expect(panel).toContainText('Te sobran 2500,00 €', { timeout: 2000 });
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · el reparto automático de un presupuesto exacto da «Sobre presupuesto»', async ({
    page,
  }) => {
    // 1000 € con tres gastos en Comida: 20 % = 200 ÷ 3 = 66,666… El reparto redondea cada uno a
    // 66,67 (3 × 66,67 = 200,01) y el total pasa a 1000,01. Lo repartido debe sumar el presupuesto.
    test.fail();
    await teclear(page, 'Presupuesto máximo (opcional)', '1000');
    const tarjetaComida = page
      .locator('div')
      .filter({ has: page.getByRole('button', { name: 'Eliminar categoría Comida y bebida' }) })
      .filter({ has: page.getByRole('button', { name: '+ Añadir gasto' }) })
      .last();
    await tarjetaComida.getByRole('button', { name: '+ Añadir gasto' }).click();
    await page.getByRole('button', { name: /Distribuir presupuesto máximo/ }).click();
    const panel = resumen(page);
    await expect(panel).toContainText(/Total del viaje\s*1000,00\s*€/, { timeout: 2000 });
    await expect(panel).toContainText('Dentro del presupuesto', { timeout: 2000 });
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · el botón de reparto pone «€» aunque la divisa sea otra', async ({
    page,
  }) => {
    // Con USD todo el resumen dice «USD»; el botón usa formatCurrency, que fija el euro.
    // Hoy: «Distribuir automáticamente (1000,00 €)».
    test.fail();
    await page.getByLabel('Divisa').selectOption('USD');
    await teclear(page, 'Presupuesto máximo (opcional)', '1000');
    const boton = page.getByRole('button', { name: /Distribuir presupuesto máximo/ });
    await expect(boton).toContainText('USD', { timeout: 2000 });
    await expect(boton).not.toContainText('€', { timeout: 2000 });
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · la barra del presupuesto no tiene nombre accesible', async ({
    page,
  }) => {
    // role="progressbar" exige nombre (WAI-ARIA 1.2); el aria-label va en el div de fuera, que
    // es genérico y no lo transmite. Hoy el árbol accesible dice solo «progressbar».
    test.fail();
    await teclear(page, 'Presupuesto máximo (opcional)', '1000');
    await teclear(page, 'Importe de Hotel / Airbnb en EUR', '400');
    await expect(page.getByRole('progressbar', { name: /presupuesto/i })).toHaveCount(1, {
      timeout: 2000,
    });
  });

  test('HALLAZGO (11/11/2026, ABIERTO) · enseña dietas fiscales sin aviso crítico ni DataReference', async ({
    page,
  }) => {
    // Suites viajes + finanzas con un componente fiscal (las dietas deducibles del autónomo):
    // nivel 1 de _private/DISCLAIMER-POLICY.md → DisclaimerCard critical, no plegable, y
    // DataReference con FISCAL_RETRIBUCIONES_EXENTAS_META. Hoy: «general», «medium» y plegable,
    // sin DataReference. Si la reparación retira las dietas de la página, este test pasa y hay
    // que quitarle el test.fail().
    test.fail();
    const faq = page.locator('li').filter({ hasText: '53,34' });
    if ((await faq.count()) > 0) {
      await expect(page.getByRole('note', { name: 'Aviso importante' })).toHaveCount(1, { timeout: 2000 });
      await expect(page.getByRole('note', { name: 'Datos de referencia normativos' })).toHaveCount(1, {
        timeout: 2000,
      });
    }
  });
});
