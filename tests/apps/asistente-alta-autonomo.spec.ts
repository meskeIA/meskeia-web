import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * asistente-alta-autonomo — generado por /inspector el 24/09/2026.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * «Guía completa para darte de alta como trabajador autónomo en España. Checklist interactivo
 * con todos los trámites y calculadora de cuota.» Desde el 24/09/2026 la calculadora pide los
 * rendimientos netos mensuales (opcional) y con ellos sitúa al usuario en su tramo de
 * TRAMOS_RETA_2025; ofrece cuatro bases (mínima y máxima DEL TRAMO, «intermedia» de 1.200 €
 * acotada al tramo, y personalizada) y calcula cuota = base × tipo, con la tarifa plana como
 * alternativa en «Primera alta» o en pluriactividad con primera alta. Sin rendimientos, la
 * horquilla es la general [653,59 ; 5.101,20], que es lo que miden los CASOS 1-3.
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
 * REGRESIONES: al final, una por hallazgo reparado el 24/09/2026 (1370-1375), con la fuente
 * de cada valor esperado en su comentario.
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
// REGRESIONES DE LOS HALLAZGOS REPARADOS (24/09/2026)
// ─────────────────────────────────────────────────────────────────────────────

test('REGRESIÓN 1375 · con el foco en el campo, una base negativa NO publica una cuota negativa', async ({ page }) => {
  // Antes, hasta el blur la app calculaba con el valor crudo: «-100» → cuota −31,50 € y
  // «Ahorro primer año: -1338,00 €». Ahora la base se acota a la horquilla también con el
  // foco puesto: −100 → 653,59 € (base mínima del tramo 1) → 205,88 € y ahorro 1510,57 €.
  await abrirCostes(page);
  await elegirBase(page, 'personalizada');
  await escribirBase(page, '-100');
  await expect(campoPersonalizado(page)).toBeFocused();
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('205,88 €');
  expect(await texto(ahorro(page))).toBe('1510,57 €');
  // Y por arriba: 9.000 con el foco → 5.101,20 → 1606,88 €
  await escribirBase(page, '9000');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('1606,88 €');
});

test('REGRESIÓN 1371 · pluriactividad en primera alta conserva la tarifa plana', async ({ page }) => {
  // Art. 38 ter de la Ley 20/2007: la cuota reducida es para quien causa alta inicial (o sin
  // alta en los 2 años anteriores), sin excluir a quien además trabaja por cuenta ajena.
  //   Con «primera alta» marcada (por defecto): 80,00 €/mes y cuota anual 80 × 12 = 960,00 €
  //   Sin ella: sin tarifa plana, cuota anual 653,59 × 31,50 % × 12 = 2.470,5702 → 2470,57 €
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.locator('input[name="situacionLaboral"][value="pluriactividad"]').check();
  const primeraAlta = page.getByRole('checkbox', { name: /Es mi primera alta como autónomo/ });
  await expect(primeraAlta).toBeChecked();
  await expect(page.getByText('¡Puedes solicitar la tarifa plana!')).toBeVisible();
  await abrirCostes(page);
  await expect(filaCuota(page, 'Con tarifa plana')).toHaveText(/80,00\s€\/mes/);
  expect(await texto(filaCoste(page, 'Cuota autónomo (anual)'))).toBe('960,00 €');

  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await primeraAlta.uncheck();
  await abrirCostes(page);
  await expect(filaCuota(page, 'Con tarifa plana')).toHaveCount(0);
  expect(await texto(filaCoste(page, 'Cuota autónomo (anual)'))).toBe('2470,57 €');
});

test('REGRESIÓN 1370 · los epígrafes de la lista llevan el literal del catálogo oficial del IAE', async ({ page }) => {
  // El literal de cada epígrafe sale de public/datos/cnae-iae-catalogo.json (el catálogo que
  // publica data/fiscal/cnae-iae.ts, RDL 1175/1990), buscado por SECCIÓN y código: el mismo
  // número es otra actividad en otra sección. Se coteja cada botón contra ese JSON.
  const respuesta = await page.request.get('/datos/cnae-iae-catalogo.json');
  expect(respuesta.ok()).toBe(true);
  const catalogo = (await respuesta.json()) as { iae: { seccion: string; codigo: string; titulo: string }[] };

  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.getByRole('button', { name: 'Ver epígrafes IAE frecuentes' }).click();
  const botones = page.locator('button[class*="epigrafeItem"]');
  await expect(botones.first()).toBeVisible();
  const n = await botones.count();
  expect(n).toBeGreaterThanOrEqual(15);
  for (let i = 0; i < n; i++) {
    const boton = botones.nth(i);
    const seccion = await boton.getAttribute('data-seccion');
    const codigo = await texto(boton.locator('[class*="epigrafeCodigo"]'));
    const oficial = catalogo.iae.find(e => e.seccion === seccion && e.codigo === codigo);
    expect(oficial, `${seccion} ${codigo} no está en el catálogo`).toBeTruthy();
    const titulo = oficial!.titulo;
    const esperado = titulo.charAt(0).toUpperCase() + titulo.slice(1);
    expect(await texto(boton.locator('[class*="epigrafeDesc"]'))).toContain(esperado);
  }

  // 763 de la sección 2.ª = «Programadores y Analistas de Informática» (antes la lista lo
  // daba como «Programadores, informáticos» y el caso de Pedro, como «Publicidad y RRPP»)
  await botones.filter({ hasText: 'Programadores y Analistas de Informática' }).click();
  await expect(page.getByPlaceholder('Ej: 763')).toHaveValue('763');
  await expect(page.getByPlaceholder('Ej: Programación informática')).toHaveValue('Programadores y Analistas de Informática');
  await expect(page.getByText('Sección 2ª de las Tarifas del IAE')).toBeVisible();
});

test('REGRESIÓN 1372 · los rendimientos netos sitúan la cuota en su tramo de 2026', async ({ page }) => {
  // TRAMOS_RETA_2025 (tabla 2026, Orden PJC/297/2026 art. 18): 1.600 €/mes cae en el tramo 6
  // (más de 1.500 y hasta 1.700), base entre 960,78 y 1.700,00 €.
  //   base mínima: 960,78 × 31,50 % = 302,6457 → 302,65 €
  //   base máxima: 1.700 × 31,50 % = 535,50 €
  //   personalizada 5.000 → se acota a 1.700 → 535,50 €
  await abrirCostes(page);
  const rendimientos = page.getByRole('textbox', { name: 'Rendimientos netos mensuales previstos' });
  await rendimientos.fill('1.600');
  await esperarValorEnReact(page, rendimientos, '1.600');
  await expect(page.locator('strong', { hasText: 'Tramo 6' })).toBeVisible();
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('960,78 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('302,65 €');

  await elegirBase(page, 'maxima');
  expect(await texto(filaCuota(page, 'Base de cotización elegida'))).toBe('1700,00 €');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('535,50 €');

  await elegirBase(page, 'personalizada');
  await escribirBase(page, '5000');
  expect(await texto(filaCuota(page, 'Cuota mensual normal'))).toBe('535,50 €');
});

test('REGRESIÓN 1373 · la SL tributa con la escala de micropymes y el 15 % de nueva creación', async ({ page }) => {
  // data/fiscal/sociedades.ts: TIPOS_IS_2025.general 25 %, nuevaCreacion 15 %,
  // TRAMOS_IS_MICROPYMES_2026 = 19 % hasta 50.000 € y 21 % en el resto
  await abrirCostes(page);
  const fila = page.locator('table tr').filter({ hasText: 'Fiscalidad' });
  const t = await texto(fila);
  expect(t).toContain('25 % general');
  expect(t).toContain('19 % hasta 50.000 €');
  expect(t).toContain('21 % en el resto');
  expect(t).toContain('15 % los dos primeros ejercicios');
  expect(t).not.toContain('IS fijo');
});

test('REGRESIÓN 1374 · un solo plazo para el alta en el RETA y la prórroga ligada al SMI', async ({ page }) => {
  // Art. 32.3 RD 84/1996: el alta de autónomos se solicita «con carácter previo» al inicio de
  // la actividad, dentro de los 60 días naturales anteriores. Art. 38 ter.2 Ley 20/2007: la
  // prórroga de la tarifa plana depende de que los rendimientos no lleguen al SMI.
  const cuerpo = limpiar((await page.locator('body').textContent()) ?? '');
  expect(cuerpo).not.toContain('tras Hacienda');
  expect(cuerpo).not.toContain('siguientes al alta en Hacienda');
  expect(cuerpo).not.toContain('desde el inicio de la actividad para darte');
  expect(cuerpo).not.toContain('si su comunidad tiene extensión');
  expect(cuerpo).toContain('hasta 60 días antes del inicio');
  const jsonLd = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
  expect(jsonLd).not.toContain('30 días hábiles');
  expect(jsonLd).toContain('60 días naturales de antelación');
});

// ─────────────────────────────────────────────────────────────────────────────
// Sospechas del Inspector reparadas el 24/09/2026 — cotejadas en el BOE ese día.
// ─────────────────────────────────────────────────────────────────────────────

test('24/09 · colaborador familiar: sin tarifa plana (art. 38 ter.11) y con la bonificación del art. 35', async ({ page }) => {
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.locator('input[name="situacionLaboral"][value="colaborador_familiar"]').check();
  await expect(page.getByText('¡Puedes solicitar la tarifa plana!')).toHaveCount(0);
  const aviso = page.locator('[class*="infoPluriactividad"]').filter({ hasText: 'familiar colaborador' });
  await expect(aviso).toContainText('art. 38 ter.11');
  await expect(aviso).toContainText('50 % durante 18 meses');
  await expect(aviso).toContainText('25 % los 6 siguientes');
});

test('24/09 · pluriactividad: el 50 % es un reintegro del exceso (art. 313 LGSS), no una reducción el primer año', async ({ page }) => {
  // Art. 313 LGSS en la redacción del RDL 13/2022 (desde 2023): reintegro del 50 % del exceso
  // de cotización por contingencias comunes sobre el umbral de la LPGE. No hay reducción de cuota.
  await expect(page.locator('body')).not.toContainText('Posible reducción del 50 % el 1.º año');
  await expect(page.locator('body')).not.toContainText('bonificación del 50 % en la cuota RETA durante el primer año');
  await page.getByRole('button', { name: /Mis Datos/ }).click();
  await page.locator('input[name="situacionLaboral"][value="pluriactividad"]').check();
  await expect(page.locator('[class*="infoPluriactividad"]').first()).toContainText('art. 313 LGSS');
});

test('24/09 · IAE: las personas físicas están exentas sin límite de cifra (art. 82.1.c TRLRHL)', async ({ page }) => {
  const html = await page.content();
  expect(html).not.toContain('su cifra de negocios no supere');
  expect(html).not.toContain('La mayoría de autónomos con facturación inferior a 1 millón');
  expect(html).toContain('Las personas físicas están exentas del pago sea cual sea su facturación');
  // Y las cifras del FAQPage salen de data/fiscal: la tarifa plana, 80 €.
  expect(html).toContain('cuota reducida de 80 €/mes durante los primeros 12 meses');
});
