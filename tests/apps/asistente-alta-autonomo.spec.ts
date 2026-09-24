import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * asistente-alta-autonomo — generado por /inspector el 24/09/2026.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * «Guía completa para darte de alta como trabajador autónomo en España. Checklist interactivo
 * con todos los trámites y calculadora de cuota.» La calculadora NO pide rendimientos: ofrece
 * cuatro bases (mínima, «intermedia» de 1.200 €, máxima y personalizada) y calcula
 * cuota = base × tipo, con la tarifa plana como alternativa si la situación es «Primera alta».
 *
 * DE DÓNDE SALE CADA CIFRA — de `data/fiscal`, NO de lo que devuelve la app
 * ───────────────────────────────────────────────────────────────────────────
 *   · data/fiscal/autonomos.ts (vigencia 2026, RDL 13/2022 + Orden PJC/297/2026, art. 18):
 *       BASES_RETA_2025.minima = 653,59 € (base mínima del tramo 1 de 2026, pese al nombre)
 *       BASES_RETA_2025.maxima = 5.101,20 €
 *       TIPO_COTIZACION_RETA   = 31,50 %
 *       TARIFA_PLANA_2025      = 80 €/mes durante 12 meses
 *   · Gestoría 50-150 €/mes y seguro RC 150-500 €/año: rangos orientativos de la propia app
 *     (no son dato normativo), solo intervienen en el total anual.
 *
 * ⚠️ es-ES NO agrupa las cifras de cuatro dígitos (minimumGroupingDigits = 2): «1510,57 €»
 * sin punto y «18.322,54 €» con él. Es el formateador compartido, no un defecto de la app.
 *
 * HALLAZGOS ABIERTOS: al final, con `test.fail()`. Afirman lo que DEBERÍA pasar, así que hoy
 * fallan a propósito; al repararlos se les quita la marca y quedan como candado.
 */

const RUTA = '/asistente-alta-autonomo/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

async function texto(loc: Locator): Promise<string> {
  return limpiar(await loc.innerText());
}

/** Importe (el <strong>) de una fila del resultado de la cuota, por su etiqueta. */
function filaCuota(page: Page, etiqueta: string): Locator {
  return page.locator('[class*="cuotaItem"]').filter({ hasText: etiqueta }).locator('strong');
}

/** Importe de una fila del desglose de costes anuales, por su etiqueta. */
function filaCoste(page: Page, etiqueta: string): Locator {
  return page.locator('[class*="costeItem"]').filter({ hasText: etiqueta }).locator('[class*="costeValor"]');
}

const ahorro = (page: Page) => page.locator('[class*="cuotaAhorro"] strong');
const campoPersonalizado = (page: Page) =>
  page.getByRole('textbox', { name: 'Base de cotización personalizada' });

async function abrirCostes(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Cuota y Costes/ }).click();
  await expect(page.getByRole('heading', { name: /Calculadora de Cuota Autónomo/ })).toBeVisible();
}

async function elegirBase(page: Page, valor: 'minima' | 'media' | 'maxima' | 'personalizada'): Promise<void> {
  await page.locator(`input[name="baseElegida"][value="${valor}"]`).check();
}

/** Escribe en la base personalizada, espera a React y (opcional) sale del campo. */
async function escribirBase(page: Page, valor: string): Promise<Locator> {
  const campo = campoPersonalizado(page);
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
  return campo;
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Asistente Alta Autónomo');
  // Testigo: la casilla «Tengo o tendré local/oficina» existe desde la carga.
  await esperarHidratacion(page, ['input[type="checkbox"]']);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · normal: primera alta con base mínima, y base personalizada «1.500»', async ({ page }) => {
  await abrirCostes(page);

  // Por defecto: base mínima y «Primera alta».
  //   cuota = 653,59 × 31,50 % = 205,880850 → 205,88 €
  //   ahorro primer año = (205,880850 − 80) × 12 = 1.510,5702 → 1510,57 €
  //   cuota anual con tarifa plana = 80 × 12 = 960,00 €
  //   total anual = 960 + 50×12 + 150 = 1710,00 € ... 960 + 150×12 + 500 = 3260,00 €
  await expect(filaCuota(page, 'Base de cotización elegida').first()).toHaveText(/653,59\s€/);
  expect(await texto(filaCuota(page, 'Tipo de cotización'))).toBe('31,50%');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');
  expect(await texto(filaCuota(page, 'Con tarifa plana'))).toBe('80,00 €/mes');
  expect(await texto(ahorro(page))).toBe('1510,57 €');
  expect(await texto(filaCoste(page, 'Cuota autónomo (anual)'))).toBe('960,00 €');
  expect(await texto(filaCoste(page, 'Total anual estimado'))).toBe('1710,00 € - 3260,00 €');

  // «1.500» con punto de millar debe leerse como mil quinientos (parseSpanishNumber).
  //   cuota = 1.500 × 31,50 % = 472,50 €
  //   ahorro = (472,50 − 80) × 12 = 4710,00 €
  await elegirBase(page, 'personalizada');
  const campo = await escribirBase(page, '1.500');
  await campo.blur();
  await expect(campo).toHaveValue('1.500');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('1500,00 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('472,50 €');
  expect(await texto(ahorro(page))).toBe('4710,00 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · límites: base máxima, y la personalizada se acota a [653,59 ; 5.101,20]', async ({ page }) => {
  await abrirCostes(page);

  // Base máxima: 5.101,20 × 31,50 % = 1.606,878 → 1606,88 €
  // (coincide con cuotaMaxima del tramo 15 de TRAMOS_RETA_2025)
  //   ahorro = (1.606,878 − 80) × 12 = 18.322,536 → 18.322,54 €
  await elegirBase(page, 'maxima');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('5101,20 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('1606,88 €');
  expect(await texto(ahorro(page))).toBe('18.322,54 €');

  // 9.000 € supera la base máxima: al salir del campo se acota a 5.101,20 → 1606,88 €
  await elegirBase(page, 'personalizada');
  let campo = await escribirBase(page, '9000');
  await campo.blur();
  await expect(campo).toHaveValue('5101.2');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('5101,20 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('1606,88 €');

  // 500 € queda por debajo de la base mínima: al salir se acota a 653,59 → 205,88 €
  campo = await escribirBase(page, '500');
  await campo.blur();
  await expect(campo).toHaveValue('653.59');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('653,59 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 · entradas que no son una base: negativa, texto y vacío acaban en la base mínima', async ({ page }) => {
  await abrirCostes(page);
  await elegirBase(page, 'personalizada');

  // −100: al salir del campo se acota a la base mínima → 653,59 € y 205,88 €
  let campo = await escribirBase(page, '-100');
  await campo.blur();
  await expect(campo).toHaveValue('653.59');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');

  // Texto: el control rechaza las letras, el campo se queda vacío y la app cae a la base
  // mínima (parseSpanishNumber('') → NaN → || BASES_RETA_2025.minima) → 205,88 €
  await campo.fill('');
  await esperarValorEnReact(page, campo, '');
  await campo.pressSequentially('abc');
  await expect(campo).toHaveValue('');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('653,59 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');
  expect(await texto(ahorro(page))).toBe('1510,57 €');
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGOS ABIERTOS
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO · con el foco en el campo, una base negativa publica una cuota negativa', async ({ page }) => {
  // Hasta el blur la app calcula con el valor crudo: «-100» muestra cuota −31,50 € y
  // «Ahorro primer año: -1338,00 €». Lo que DEBERÍA pasar: ninguna cuota negativa en pantalla
  // (una base por debajo de 653,59 € no existe en el RETA de 2026).
  test.fail(true, 'Hallazgo abierto: base negativa → cuota −31,50 € mientras el campo tiene el foco');
  await abrirCostes(page);
  await elegirBase(page, 'personalizada');
  await escribirBase(page, '-100');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).not.toMatch(/^-/);
});

test('HALLAZGO · pluriactividad en primera alta no ve la tarifa plana', async ({ page }) => {
  // La situación es un radio EXCLUSIVO: «Primera alta» o «Pluriactividad». Quien se da de alta
  // por primera vez y además trabaja por cuenta ajena no puede marcar las dos cosas, y al
  // elegir «Pluriactividad» la calculadora quita la tarifa plana (puedesTarifaPlana solo es
  // cierto con 'nueva_alta'). La propia tabla educativa de la app dice «Tarifa plana 80 € ·
  // Pluriactividad: ✅ Sí si es primera alta como autónomo».
  //   Esperado (TARIFA_PLANA_2025): fila «Con tarifa plana» 80,00 €/mes y cuota anual 960,00 €
  //   Obtenido hoy: sin fila de tarifa plana y cuota anual 205,880850 × 12 = 2470,57 €
  test.fail(true, 'Hallazgo abierto: pluriactividad en primera alta pierde la tarifa plana');
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.locator('input[name="situacionLaboral"][value="pluriactividad"]').check();
  await abrirCostes(page);
  await expect(filaCuota(page, 'Con tarifa plana')).toHaveText(/80,00\s€\/mes/, { timeout: 2000 });
  expect(await texto(filaCoste(page, 'Cuota autónomo (anual)'))).toBe('960,00 €');
});

test('HALLAZGO · el epígrafe 849.7 no es «diseño gráfico» en las Tarifas del IAE', async ({ page }) => {
  // La lista EPIGRAFES_COMUNES está escrita a mano en la app. Contrastada con el catálogo
  // oficial que publica data/fiscal/cnae-iae.ts (public/datos/cnae-iae-catalogo.json,
  // RD Legislativo 1175/1990):
  //   849.7 (sección 1.ª) = «Servicios de gestión administrativa»   — la app: «diseño gráfico»
  //   849.5 = mensajería y reparto (la app: traducción; traductores = 774 de la sección 2.ª)
  //   721.1 = transporte urbano colectivo (la app: taxi/VTC; autotaxis = 721.2)
  //   855   = alquiler de medios de transporte / corredores de apuestas (la app: agentes
  //           comerciales; son el 511 de la sección 2.ª)
  //   831   = médicos de medicina general (la app: especialistas; son el 832)
  //   769.9 = otros servicios de telecomunicación (la app: otros servicios informáticos)
  // Al pulsar el epígrafe, la app rellena la descripción con su etiqueta: quien lo copie al
  // 036/037 declara una actividad que no es la suya.
  test.fail(true, 'Hallazgo abierto: la descripción de 849.7 no es la de las Tarifas del IAE');
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.locator('button[class*="btnBuscarEpigrafe"]').click();
  await page.locator('button[class*="epigrafeItem"]').filter({ hasText: '849.7' }).click();
  await expect(page.getByPlaceholder('Ej: 763')).toHaveValue('849.7');
  await expect(page.getByPlaceholder('Ej: Programación informática')).toHaveValue(
    /gestión administrativa/i,
    { timeout: 2000 },
  );
});
