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
 * Los importes eran `<input type="number">` leídos con `parseFloat(v.replace(',', '.'))`: Chromium,
 * en esta página `lang="es"`, entregaba «1.500» tal cual y se leía 1,5. Desde el 11/11/2026
 * (/reparar, hallazgos 4461-4465 y 4471) son `CampoNumerico`, como Días y Personas.
 *
 * Los casos abiertos van en `test.fail()` con «HALLAZGO (11/11/2026, ABIERTO)»: cuando se
 * reparen, el test pasará y `test.fail()` lo pondrá en rojo para que se quite la marca.
 * Los de contenido 4466-4470 y 4472 se repararon en la segunda tanda del 11/11/2026 y tienen su
 * test al final (no tenían caso escrito).
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

  test('HALLAZGO 4462 (11/11/2026, REPARADO) · CASO 3 · un importe negativo ya no resta del total', async ({
    page,
  }) => {
    // Un gasto no puede ser negativo: «-500» debe rechazarse (o quedarse en 0) y el total seguir
    // en 300. Entraba tal cual: total −200,00 € y −100,00 € por persona. Ahora CampoNumerico con
    // min 0 lo acota a 0.
    await teclear(page, 'Importe de Hotel / Airbnb en EUR', '300');
    await teclear(page, 'Importe de Vuelos en EUR', '-500');
    await expect(resumen(page)).toContainText(/Total del viaje\s*300,00\s*€/, { timeout: 2000 });
  });

  test('HALLAZGO 4461 (11/11/2026, REPARADO) · un importe con punto de millar se lee en formato español', async ({
    page,
  }) => {
    // «1.500» es mil quinientos y «1.234,56» mil doscientos treinta y cuatro con cincuenta y seis
    // (formato español, parseSpanishNumber). Daba total 1,50 € y, con «1.234,56», 1,23 €.
    await teclear(page, 'Personas', '1');
    await teclear(page, 'Importe de Vuelos en EUR', '1.500');
    await expect(resumen(page)).toContainText(/Total del viaje\s*1500,00\s*€/, { timeout: 2000 });
    await teclear(page, 'Importe de Vuelos en EUR', '1.234,56');
    await expect(resumen(page)).toContainText(/Total del viaje\s*1234,56\s*€/, { timeout: 2000 });
  });

  test('HALLAZGO 4461 (11/11/2026, REPARADO) · un presupuesto máximo con punto de millar se lee en formato español', async ({
    page,
  }) => {
    // «3.000» es tres mil: con 500 de hotel, 500 / 3000 = 16,67 → 17 % y sobran 2500.
    // Daba «500,00 / 3,00 €», «16667% del presupuesto», «Te excedes en 497,00 €».
    await teclear(page, 'Presupuesto máximo (opcional)', '3.000');
    await teclear(page, 'Importe de Hotel / Airbnb en EUR', '500');
    const panel = resumen(page);
    await expect(panel).toContainText(/500,00 \/ 3000,00 €/, { timeout: 2000 });
    await expect(panel).toContainText(/17\s?% del presupuesto/, { timeout: 2000 });
    await expect(panel).toContainText('Te sobran 2500,00 €', { timeout: 2000 });
  });

  test('HALLAZGO 4463 (11/11/2026, REPARADO) · el reparto automático de un presupuesto exacto suma el presupuesto', async ({
    page,
  }) => {
    // 1000 € con tres gastos en Comida: 20 % = 200 ÷ 3 = 66,666… El reparto redondeaba cada uno a
    // 66,67 (3 × 66,67 = 200,01) y el total pasaba a 1000,01. Ahora: 66,66 + 66,66 + 66,68 = 200.
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
    await expect(panel).toContainText(/Comida y bebida\s*200,00 €/);
  });

  test('HALLAZGO 4464 (11/11/2026, REPARADO) · el botón de reparto pone la divisa elegida', async ({
    page,
  }) => {
    // Con USD todo el resumen dice «USD»; el botón usaba formatCurrency, que fija el euro:
    // «Distribuir automáticamente (1000,00 €)».
    await page.getByLabel('Divisa').selectOption('USD');
    await teclear(page, 'Presupuesto máximo (opcional)', '1000');
    const boton = page.getByRole('button', { name: /Distribuir presupuesto máximo/ });
    await expect(boton).toContainText('USD', { timeout: 2000 });
    await expect(boton).not.toContainText('€', { timeout: 2000 });
  });

  test('HALLAZGO 4471 (11/11/2026, REPARADO) · la barra del presupuesto tiene nombre y hay una sola región viva', async ({
    page,
  }) => {
    // role="progressbar" exige nombre (WAI-ARIA 1.2); el aria-label iba en el div de fuera, que
    // es genérico y no lo transmite. Y había dos regiones vivas anidadas (la sección y la barra).
    await teclear(page, 'Presupuesto máximo (opcional)', '1000');
    await teclear(page, 'Importe de Hotel / Airbnb en EUR', '400');
    await expect(page.getByRole('progressbar', { name: /presupuesto/i })).toHaveCount(1, {
      timeout: 2000,
    });
    const vivas = resumen(page).locator('[aria-live]');
    await expect(vivas).toHaveCount(1);
    await expect(vivas).toContainText('Total del viaje');
    await expect(resumen(page)).not.toHaveAttribute('aria-live', /.+/);
  });

  test('HALLAZGO 4465 (11/11/2026, REPARADO) · las dietas fiscales llevan aviso crítico y DataReference', async ({
    page,
  }) => {
    // Suites viajes + finanzas con un componente fiscal (las dietas deducibles del autónomo):
    // nivel 1 de _private/DISCLAIMER-POLICY.md → DisclaimerCard critical, no plegable, y
    // DataReference con FISCAL_RETRIBUCIONES_EXENTAS_META. Era «general», «medium» y plegable,
    // sin DataReference.
    const faq = page.locator('li').filter({ hasText: '53,34' });
    if ((await faq.count()) > 0) {
      await expect(page.getByRole('note', { name: 'Aviso importante' })).toHaveCount(1, { timeout: 2000 });
      await expect(page.getByRole('note', { name: 'Datos de referencia normativos' })).toHaveCount(1, {
        timeout: 2000,
      });
    }
  });

  /** Texto de la guía educativa, ya abierta, con los espacios (también los duros) a uno. */
  async function guia(page: Page): Promise<string> {
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  }

  test('HALLAZGO 4466 (11/11/2026, REPARADO) · la FAQ del autónomo exige estimación directa y restauración', async ({
    page,
  }) => {
    // Art. 30.2.5.ª c LIRPF (BOE-A-2006-20764, cotejado el 11/11/2026): el art. 30 es el de la
    // estimación directa; la manutención, «en establecimientos de restauración y hostelería» y
    // pagada «utilizando cualquier medio electrónico de pago». Decía «Sí» a todo autónomo.
    const texto = await guia(page);
    expect(texto).toContain('Solo en estimación directa');
    expect(texto).toContain('establecimientos de restauración y hostelería');
    expect(texto).toContain('supermercado no entra');
    expect(texto).toContain('tarjeta u otro medio electrónico');
  });

  test('HALLAZGO 4467 (11/11/2026, REPARADO) · la ficha de negocios habla de dietas exentas, no deducibles', async ({
    page,
  }) => {
    // Art. 9.A.3 RIRPF (BOE-A-2007-6820, cotejado el 11/11/2026): «quedarán exceptuadas de
    // gravamen»; estancia, «los importes que se justifiquen»; manutención en el extranjero
    // pernoctando, 91,35 € al día. Decía «son deducibles con límites legales».
    const texto = await guia(page);
    expect(texto).not.toContain('los gastos de alojamiento y manutención son deducibles con límites legales');
    expect(texto).toContain('están exentas del IRPF');
    expect(texto).toContain('el hotel por el importe que justifiques y la manutención hasta 91,35 € al día en el extranjero');
  });

  test('HALLAZGO 4468 (11/11/2026, REPARADO) · las cifras de imprevistos y coste diario cuadran entre sí', async ({
    page,
  }) => {
    // Imprevistos: el FAQPage decía «entre un 10% y un 20%» y la página 10–15 %. Coste diario:
    // la tabla 100–150 € y el paso 2 «80–120 €». Ahora una sola cifra de cada, dicha como regla
    // práctica u orientativa.
    const faq = JSON.stringify(
      (await page.locator('script[type="application/ld+json"]').allTextContents())
        .map((t) => JSON.parse(t) as Record<string, unknown>)
        .find((b) => b['@type'] === 'FAQPage'),
    );
    expect(faq).not.toMatch(/10\s?% y un 20\s?%|acercarse al 20/);
    const texto = await guia(page);
    // (la columna «Familiar» de la tabla sí da 80–120 €: es otro perfil)
    expect(texto).not.toContain('cuenta al menos 80–120 €');
    expect(texto).toContain('la tabla de arriba estima 100–150 € por persona y día');
  });

  test('HALLAZGO 4469 (11/11/2026, REPARADO) · el JSON-LD WebApplication lleva de 4 a 8 características', async ({
    page,
  }) => {
    const app = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((t) => JSON.parse(t) as { '@type'?: string; featureList?: string[] })
      .find((b) => b['@type'] === 'WebApplication');
    expect((app?.featureList ?? []).length).toBeGreaterThanOrEqual(4);
    expect((app?.featureList ?? []).length).toBeLessThanOrEqual(8);
  });

  test('HALLAZGO 4470 (11/11/2026, REPARADO) · el % va separado de la cifra en el resumen y en la guía', async ({
    page,
  }) => {
    await teclear(page, 'Presupuesto máximo (opcional)', '3000');
    await teclear(page, 'Importe de Vuelos en EUR', '480');
    const panel = (await resumen(page).innerText()).replace(/\s+/g, ' ');
    // 480 / 3000 = 16 %; Transporte es el 100 % del total
    expect(panel).toContain('16 % del presupuesto');
    expect(panel).toContain('(100 %)');
    expect(panel).not.toMatch(/\d%/);
    expect(await guia(page)).not.toMatch(/\d%/);
  });

  test('HALLAZGO 4472 (11/11/2026, REPARADO) · la guía no recomienda entidades financieras con sus condiciones', async ({
    page,
  }) => {
    // Misma regla que selector-smartphone (81fd4bea): marcas y condiciones comerciales caducan y
    // parecen publicidad. Ahora dice qué buscar en una tarjeta.
    const texto = await guia(page);
    expect(texto).not.toMatch(/Revolut|Wise|N26/);
    expect(texto).toContain('sin comisión por cambio de divisa');
  });
});
