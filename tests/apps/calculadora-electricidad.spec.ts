import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * calculadora-electricidad — Inspector, primera inspección (11/11/2026).
 *
 * Siete modos: Ley de Ohm (V = I·R), Potencia (P = V·I), Serie/Paralelo
 * (Req = ΣR · 1/Req = Σ1/R), Divisores (Vout = Vin·R2/(R1+R2) · I1 = Iin·R2/(R1+R2)),
 * Mixtos (expresión serie(…)/paralelo(…) anidable), RC/RL (τ = R·C · τ = L/R, carga
 * V0·(1−e^(−t/τ)), fc = 1/(2πτ)) y Consumo (kWh = P/1000·h, coste = kWh·€/kWh, anual = mensual·12).
 * Todos los esperados están resueltos a mano con esas fórmulas ANTES de ejecutar la app; ninguno
 * depende de un dato normativo (el precio del kWh lo teclea el usuario).
 *
 * CASOS (verde, red de regresión):
 *   1 · normal   · 12 V / 100 Ω = 0,12 A (el ejemplo del FAQPage) · divisores por defecto · RC y RL
 *                  por defecto · 150 W × 5 h × 30 d a 0,18 €/kWh (el televisor del FAQPage).
 *   2 · límite   · «1.500» leído como mil quinientos en Ohm y en Consumo, salida con millares
 *                  («30.000,0000 V») · el «Circuito complejo» de Mixtos · «4,7, 10» en paralelo ·
 *                  siete resistencias en serie.
 *   3 · rechazo  · Mixtos rechaza paralelo(10, 0) con aviso.
 *
 * REPARADOS el 11/11/2026 (/reparar): H1, H2, H3, H5, H7, H8, H10 y H12 (sin test.fail()).
 * HALLAZGOS — los demás siguen ABIERTOS (cada uno con su test.fail(), que afirma lo que la app DEBE hacer):
 *   H1 (alto)   · Mixtos parte por TODAS las comas: serie(10,5, 20) da 35 Ω (30,5) y paralelo(4,7, 10)
 *                 da 2,0290 Ω (3,1973). Serie/Paralelo lo arregló el 04/09/2026; Mixtos no.
 *   H2 (alto)   · FAQ visible «¿Qué sección de cable necesito?»: «1,5 mm² hasta 16 A … 4 mm² hasta
 *                 25 A (cocina, lavadora) …» frente a la ITC-BT-25, Tabla 1 (BOE-A-2002-18099):
 *                 C1 10 A/1,5 mm² · C2 16 A/2,5 · C3 cocina y horno 25 A/6 · C4 lavadora 20 A/4.
 *   H3 (medio)  · Serie/Paralelo descarta en silencio el 0, los negativos y el texto: «10, 0, 20» en
 *                 paralelo da 6,6667 Ω (un 0 Ω en paralelo es un cortocircuito: 0 Ω, o un aviso).
 *   H4 (medio)  · Sin prefijos: 12 V / 1.000.000 Ω da «≈0 A» (12 µA); 12 V / 4.700 Ω, «0,0026 A»
 *                 (2,5532 mA); fc de τ = 100 s, «0,00 Hz» (0,0016 Hz).
 *   H5 (medio)  · Entrada imposible o vacía: panel en blanco sin aviso (R = 0, «abc»); el
 *                 «Ingresa los valores para calcular» no sale nunca (exige que los 7 modos fallen).
 *   H6 (bajo)   · Acepta lo imposible: 25 h de uso al día, potencia negativa (coste negativo).
 *   H7 (medio)  · Guía: «bomba de 1.500 W a 230 V, 15 m, caída máx. 3 % … la caída de tensión exige
 *                 2,5 mm²». Con γ = 44 (cobre XLPE, el peor caso de calculadora-seccion-cable)
 *                 1,5 mm² cae 2,96 V = 1,29 %.
 *   H8 (medio)  · Guía: «bajar de 5,75 kW a 4,6 kW ahorra ~15 €/mes»; con su propio «~3,5 €/kW» del
 *                 paso 6, 1,15 kW × 3,5 = 4,03 €/mes.
 *   H9 (bajo)   · Guía, paso 6: «alquiler equipo medida (~3 €/mes)»; la Orden ITC/3860/2007,
 *                 anexo II d), lo fija en 0,81 €/mes.
 *   H10 (medio) · features del JSON-LD: «conversión automática de unidades» (no la hay) y «hasta 6
 *                 componentes» (admite cualquier número).
 *   H11 (bajo)  · Formato: «0.45» por defecto en Potencia; «63,2%», «95%», «99%» sin espacio.
 *   H12 (medio) · Los selectores de cada modo (Voltaje/Corriente/Resistencia, Serie/Paralelo,
 *                 Tensión/Corriente, RC/RL) no llevan aria-pressed.
 *   H13 (bajo)  · Emojis de la guía sin aria-hidden (título «⚡ Aprende…», iconos de escenarios y
 *                 prácticas) e inputs numéricos sin inputMode="decimal".
 *   H14 (bajo)  · Cifras sin fuente o contradictorias: «el 80% de incendios…», «el 95% de los
 *                 problemas…», «ahorrar 30-40% en la factura» (en otra tarjeta, «en esas cargas»).
 *   H15 (bajo)  · FAQPage: «ESO y Bachillerato» (vocabulario solo de España, §1.bis).
 */

const RUTA = '/calculadora-electricidad/';

const normalizar = (s: string): string => s.replace(/\s+/g, ' ').trim();

function panel(page: Page): Locator {
  return page
    .locator('[role="status"]')
    .filter({ has: page.getByRole('heading', { name: 'Resultados', exact: true }) });
}

/**
 * El panel por su texto VISIBLE normalizado: `toContainText` lee textContent, que pega la etiqueta
 * y la cifra de cada tarjeta («Corriente (I)0,1200 A»); innerText las separa como se ven.
 */
async function verEnPanel(page: Page, fragmento: string): Promise<void> {
  await expect
    .poll(async () => normalizar(await panel(page).innerText()), { message: `el panel muestra «${fragmento}»` })
    .toContain(fragmento);
}

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#corriente', '#resistencia']);
}

/** Cambia de tipo de cálculo con los botones de arriba (los primeros con ese nombre). */
async function modo(page: Page, nombre: string): Promise<void> {
  const boton = page.getByRole('button', { name: nombre, exact: true }).first();
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function pulsar(page: Page, nombre: string | RegExp): Promise<void> {
  await page.getByRole('button', { name: nombre, exact: typeof nombre === 'string' }).click();
}

/** fill() pasa por el navegador; el testigo confirma que el estado de React lo recogió. */
async function escribir(page: Page, selector: string, valor: string): Promise<void> {
  await page.fill(selector, valor);
  await esperarValorEnReact(page, selector, valor);
}

async function textoGuia(page: Page): Promise<string> {
  await pulsar(page, 'Ver guía educativa');
  const guia = page.locator('[data-guia-educativa]').filter({ hasText: 'Leyes y Fórmulas' });
  return normalizar((await guia.textContent()) ?? '');
}

interface BloqueJsonLd {
  '@type'?: string;
  featureList?: string[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function jsonLd(page: Page, tipo: string): Promise<BloqueJsonLd> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const datos = bloques.map((b) => JSON.parse(b) as BloqueJsonLd);
  const bloque = datos.find((d) => d['@type'] === tipo);
  if (!bloque) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return bloque;
}

test.beforeEach(async ({ page }) => {
  await abrir(page);
});

// ============================================================
// CASO 1 — normal
// ============================================================

test('CASO 1a · Ohm: 12 V / 100 Ω = 0,12 A, el ejemplo del FAQPage', async ({ page }) => {
  // I = V / R = 12 / 100 = 0,12 A → formatNumber(…, 4) = «0,1200 A»
  await pulsar(page, 'Corriente');
  await escribir(page, '#voltaje', '12');
  await escribir(page, '#resistencia', '100');
  await verEnPanel(page,'Corriente (I) 0,1200 A');
  await verEnPanel(page,'I = 12,00 V / 100,00 Ω');
});

test('CASO 1b · divisores por defecto (12 V, 1 kΩ, 2 kΩ, 10 mA)', async ({ page }) => {
  await modo(page, 'Divisores');
  // Tensión: Vout = 12·2000/3000 = 8 V · ratio 2/3 = 0,6667 · I = 12/3000 = 4 mA
  // P_R1 = 0,004²·1000 = 16 mW · P_R2 = 0,004²·2000 = 32 mW
  const p = panel(page);
  await verEnPanel(page,'Voltaje de Salida (Vout) 8,0000 V');
  await verEnPanel(page,'Ratio (R2/(R1+R2)) 0,6667');
  await verEnPanel(page,'Corriente 4,0000 mA');
  await verEnPanel(page,'Potencia R1 16,00 mW');
  await verEnPanel(page,'Potencia R2 32,00 mW');
  // Corriente: I1 = 10·2000/3000 = 6,6667 mA · I2 = 3,3333 mA · Req = 2000000/3000 = 666,67 Ω
  // V = 0,010 A · 666,67 Ω = 6,6667 V
  await pulsar(page, 'Corriente');
  await verEnPanel(page,'Corriente por R1 6,6667 mA');
  await verEnPanel(page,'Corriente por R2 3,3333 mA');
  await verEnPanel(page,'Voltaje común 6,6667 V');
  await verEnPanel(page,'Req paralelo 666,67 Ω');
});

test('CASO 1c · RC y RL por defecto (1 kΩ, 100 µF, 10 mH, 5 V, t = 0,1 s)', async ({ page }) => {
  await modo(page, 'RC/RL');
  const p = panel(page);
  // RC: τ = 1000·100e-6 = 0,1 s = 100 ms · Vc = 5·(1 − e^−1) = 3,1606 V · descarga 5·e^−1 = 1,8394 V
  // I = (5/1000)·e^−1 = 1,8394 mA · E = ½·100e-6·5² = 1,25 mJ = 1250 µJ · fc = 1/(2π·0,1) = 1,59 Hz
  await verEnPanel(page,'Constante de Tiempo (τ) 100,0000 ms');
  await verEnPanel(page,'3,1606 V');
  await verEnPanel(page,'1,8394 V');
  await verEnPanel(page,'Corriente Carga 1,8394 mA');
  await verEnPanel(page,'Energía Almacenada 1250,0000 µJ');
  await verEnPanel(page,'Frec. Corte 1,59 Hz');
  // RL: τ = 0,01/1000 = 10 µs · fc = 1000/(2π·0,01) = 15.915,49 Hz · I(0,1 s) = 5/1000 = 5 mA
  await pulsar(page, 'RL (Inductor)');
  await verEnPanel(page,'Constante de Tiempo (τ) 10,0000 µs');
  await verEnPanel(page,'5,0000 mA');
  await verEnPanel(page,'Energía Almacenada 0,1250 µJ');
  await verEnPanel(page,'Frec. Corte 15.915,49 Hz');
});

test('CASO 1d · Consumo: 150 W × 5 h × 30 días a 0,18 €/kWh (el televisor del FAQPage)', async ({ page }) => {
  await modo(page, 'Consumo');
  await escribir(page, '#potencia-consumo', '150');
  await escribir(page, '#horas-uso', '5');
  await escribir(page, '#dias-mes', '30');
  await escribir(page, '#precio-kwh', '0,18');
  // 0,15 kW × 5 h = 0,75 kWh/día · × 30 = 22,5 kWh/mes · × 0,18 = 4,05 €/mes · × 12 = 48,60 €/año
  const p = panel(page);
  await verEnPanel(page,'Consumo Diario 0,750 kWh/día');
  await verEnPanel(page,'Consumo Mensual 22,50 kWh/mes');
  await verEnPanel(page,'Coste Mensual 4,05 €');
  await verEnPanel(page,'Coste Anual 48,60 €');
});

// ============================================================
// CASO 2 — límite
// ============================================================

test('CASO 2a · Ohm: «1.500» A × 20 Ω = 30.000 V (millar español en la entrada y en la salida)', async ({ page }) => {
  // «1.500» = mil quinientos (punto de millar) → V = 1500 · 20 = 30.000 V
  await escribir(page, '#corriente', '1.500');
  await escribir(page, '#resistencia', '20');
  await verEnPanel(page,'Voltaje (V) 30.000,0000 V');
  await verEnPanel(page,'V = 1500,00 A × 20,00 Ω');
});

test('CASO 2b · Consumo: «1.500» W × 2 h × 30 días a 0,20 €/kWh', async ({ page }) => {
  await modo(page, 'Consumo');
  await escribir(page, '#potencia-consumo', '1.500');
  await escribir(page, '#horas-uso', '2');
  await escribir(page, '#dias-mes', '30');
  await escribir(page, '#precio-kwh', '0,20');
  // 1,5 kW × 2 h = 3 kWh/día · × 30 = 90 kWh/mes · × 0,20 = 18 €/mes · × 12 = 216 €/año
  const p = panel(page);
  await verEnPanel(page,'Consumo Diario 3,000 kWh/día');
  await verEnPanel(page,'Consumo Mensual 90,00 kWh/mes');
  await verEnPanel(page,'Coste Mensual 18,00 €');
  await verEnPanel(page,'Coste Anual 216,00 €');
});

test('CASO 2c · Mixtos: el «Circuito complejo» serie(100, paralelo(200, serie(300, 400)), 500)', async ({ page }) => {
  await modo(page, 'Mixtos');
  await pulsar(page, 'Circuito complejo');
  // serie(300, 400) = 700 · paralelo(200, 700) = 140000/900 = 155,5556 · + 100 + 500 = 755,5556 Ω
  await expect(page.locator('#configuracion-mixta')).toHaveValue('serie(100, paralelo(200, serie(300, 400)), 500)');
  await verEnPanel(page,'Resistencia Equivalente 755,5556 Ω');
});

test('CASO 2d · Serie/Paralelo: «4,7, 10» en paralelo y siete resistencias en serie', async ({ page }) => {
  await modo(page, 'Serie/Paralelo');
  const p = panel(page);
  // Por defecto (10, 20, 30): serie 60 Ω; paralelo 1/(1/10 + 1/20 + 1/30) = 5,4545 Ω
  await verEnPanel(page,'Resistencia Equivalente (Serie) 60,0000 Ω');
  // Siete resistencias de 1 Ω: 7 Ω (la app no tiene el tope de 6 que anuncia el JSON-LD)
  await escribir(page, '#resistencias', '1, 1, 1, 1, 1, 1, 1');
  await verEnPanel(page,'Resistencia Equivalente (Serie) 7,0000 Ω');
  await verEnPanel(page,'Resistencias: 7');
  // Paralelo de 4,7 Ω (coma decimal) y 10 Ω: 1/(1/4,7 + 1/10) = 3,1973 Ω
  await pulsar(page, /^Paralelo/);
  await escribir(page, '#resistencias', '4,7, 10');
  await verEnPanel(page,'Resistencia Equivalente (Paralelo) 3,1973 Ω');
  await verEnPanel(page,'R1 = 4,70 Ω');
  await verEnPanel(page,'R2 = 10,00 Ω');
});

// ============================================================
// CASO 3 — rechazo
// ============================================================

test('CASO 3 · Mixtos rechaza paralelo(10, 0) con aviso', async ({ page }) => {
  await modo(page, 'Mixtos');
  await escribir(page, '#configuracion-mixta', 'paralelo(10, 0)');
  await expect(panel(page).getByRole('alert')).toContainText('Verifica la expresión del circuito');
  await expect(panel(page)).not.toContainText('Resistencia Equivalente');
});

// ============================================================
// HALLAZGOS — ABIERTOS
// ============================================================

test('HALLAZGO H1 (4437) — REPARADO · Mixtos lee la coma decimal: serie(10,5, 20) = 30,5 Ω', async ({ page }) => {
  // REPARADO el 11/11/2026. Daba 35,0000 Ω (leía 10 + 5 + 20) y 2,0290 Ω (paralelo(4, 7, 10)).
  // Mismo criterio que Serie/Paralelo: con un espacio en el nivel, la coma entre cifras es decimal.
  await modo(page, 'Mixtos');
  await escribir(page, '#configuracion-mixta', 'serie(10,5, 20)');
  await verEnPanel(page,'Resistencia Equivalente 30,5000 Ω');
  // 1/(1/4,7 + 1/10) = 3,1973 Ω
  await escribir(page, '#configuracion-mixta', 'paralelo(4,7, 10)');
  await verEnPanel(page,'Resistencia Equivalente 3,1973 Ω');
  // Sin espacios la coma sigue separando, como antes: 10 + 20 = 30 Ω.
  await escribir(page, '#configuracion-mixta', 'serie(10,20)');
  await verEnPanel(page,'Resistencia Equivalente 30,0000 Ω');
  // Anidado: 10,5 + 1/(1/4,7 + 1/10) = 13,6973 Ω
  await escribir(page, '#configuracion-mixta', 'serie(10,5, paralelo(4,7, 10))');
  await verEnPanel(page,'Resistencia Equivalente 13,6973 Ω');
});

test('HALLAZGO H2 (4438) — REPARADO · la regla de secciones de la FAQ cuadra con la ITC-BT-25', async ({ page }) => {
  // REPARADO el 11/11/2026, cotejado en la sesión con la ITC-BT-25 del BOE. ITC-BT-25, Tabla 1 (REBT, BOE-A-2002-18099): C1 iluminación 10 A y 1,5 mm² · C2 tomas
  // de uso general 16 A y 2,5 mm² · C3 cocina y horno 25 A y 6 mm² · C4 lavadora, lavavajillas y
  // termo 20 A y 4 mm². La FAQ visible empareja cada sección con el interruptor del escalón de
  // arriba: «1,5 mm² hasta 16 A … 2,5 mm² hasta 20 A … 4 mm² hasta 25 A (cocina, lavadora), 6 mm²
  // hasta 32 A (horno…)». En la ITC-BT-19, Tabla 1, 1,5 mm² PVC en tubo empotrado (método A, dos
  // cargados) admite 13 A: un automático de 16 A no lo protege.
  const t = await textoGuia(page);
  expect(t).not.toContain('1,5 mm² hasta 16 A');
  expect(t).not.toContain('2,5 mm² hasta 20 A');
  expect(t).not.toContain('4 mm² hasta 25 A (cocina');
  expect(t).toContain('iluminación, 10 A y 1,5 mm²');
  expect(t).toContain('cocina y horno, 25 A y 6 mm²');
});

test('HALLAZGO H3 (4439) — REPARADO · un 0 Ω en paralelo no se descarta en silencio', async ({ page }) => {
  // REPARADO el 11/11/2026. Una resistencia de 0 Ω en paralelo cortocircuita el conjunto: Req = 0 Ω,
  // o un aviso. Daba 6,6667 Ω (1/(1/10 + 1/20)) con «Resistencias: 2»; igual con «-5» o «abc».
  await modo(page, 'Serie/Paralelo');
  await pulsar(page, /^Paralelo/);
  await escribir(page, '#resistencias', '10, -5, 20');
  await expect(panel(page).getByRole('alert')).toContainText('no puede ser negativa');
  await escribir(page, '#resistencias', '10, abc, 20');
  await expect(panel(page).getByRole('alert')).toContainText('«abc» no es un número');
  await escribir(page, '#resistencias', '10, 0, 20');
  const p = panel(page);
  await expect(p).not.toContainText('6,6667');
  await expect(p.getByRole('alert')).toContainText('cortocircuito');
  await expect(p).not.toContainText('Resistencia Equivalente');
  const avisos = await page.locator('[role="alert"]:not(#__next-route-announcer__)').count();
  const texto = await p.innerText();
  expect(/0,0000[\s ]*Ω/.test(texto) || avisos > 0).toBe(true);
});

test('HALLAZGO H4 (4440) — REPARADO · corrientes de µA y mA y frecuencias de mHz no se pierden al redondear', async ({ page }) => {
  // REPARADO el 11/11/2026 (/reparar). Obtenido antes: «≈0 A», «0,0026 A» y «0,00 Hz». Ahora lo
  // que perdería cifras en la unidad base baja a mili, micro o nano (conPrefijo): 12,0000 µA,
  // 2,5532 mA y 1,59 mHz; 0,12 A sigue en amperios (CASO 1a).
  await pulsar(page, 'Corriente');
  await escribir(page, '#voltaje', '12');
  // 12 / 1.000.000 = 0,000012 A = 12 µA
  await escribir(page, '#resistencia', '1.000.000');
  await verEnPanel(page, 'Corriente (I) 12,0000 µA');
  let texto = await panel(page).innerText();
  expect(texto).not.toContain('≈0');
  expect(texto).toMatch(/0,000012\d*[\s ]*A|12(,0+)?[\s ]*µA/);
  // 12 / 4.700 = 0,00255319 A = 2,5532 mA
  await escribir(page, '#resistencia', '4.700');
  await verEnPanel(page, 'Corriente (I) 2,5532 mA');
  texto = await panel(page).innerText();
  expect(texto).toMatch(/2,553\d*[\s ]*mA|0,002553\d*[\s ]*A/);
  // RC con 100 kΩ y 1000 µF: τ = 100 s → fc = 1/(2π·100) = 0,0016 Hz (1,59 mHz)
  await modo(page, 'RC/RL');
  await escribir(page, '#resistencia-rcrl', '100.000');
  await escribir(page, '#capacitancia', '1000');
  await verEnPanel(page,'Constante de Tiempo (τ) 100.000,0000 ms');
  const fc = normalizar(await panel(page).getByText('Frec. Corte').locator('..').innerText());
  expect(fc).toMatch(/0,0016\d*[\s ]*Hz|1,59\d*[\s ]*mHz/);
});

test('HALLAZGO H5 (4441) — REPARADO · R = 0 o un texto no dejan el panel en blanco', async ({ page }) => {
  // REPARADO el 11/11/2026. I = V/R con R = 0 no existe: la app debe decirlo. El panel solo decía
  // «Resultados»; el «Ingresa los valores para calcular» no salía porque su condición exigía que
  // fallaran los SIETE modos a la vez. Ahora mira el modo activo.
  await pulsar(page, 'Corriente');
  await escribir(page, '#resistencia', '0');
  await expect(panel(page)).not.toHaveText(/^\s*Resultados\s*$/);
  await expect(panel(page).getByRole('alert')).toContainText('dividir entre 0');
  await escribir(page, '#resistencia', 'abc');
  await expect(panel(page)).not.toHaveText(/^\s*Resultados\s*$/);
  await expect(panel(page).getByRole('alert')).toContainText('sean números');
  // Mixtos con un número mal escrito: aviso de sintaxis, no «No definido Ω».
  await modo(page, 'Mixtos');
  await escribir(page, '#configuracion-mixta', 'serie(10.5.3, 2)');
  await expect(panel(page).getByRole('alert')).toContainText('Verifica la expresión del circuito');
  await expect(panel(page)).not.toContainText('No definido');
});

test('HALLAZGO H6 (4442) — REPARADO · Consumo no acepta 25 h al día ni potencia negativa', async ({ page }) => {
  // REPARADO el 11/11/2026 (/reparar). Un día tiene 24 h; una potencia de -1000 W no consume.
  // Obtenido antes: «25,000 kWh/día» (1 kW × 25 h) y «-12,00 €/mes» (-1 kW × 2 h × 30 d × 0,20).
  // Ahora no calcula y el aviso dice qué sobra. Lo mismo R negativa en Ohm y t negativo en RC.
  await modo(page, 'Consumo');
  await escribir(page, '#horas-uso', '25');
  await expect(panel(page)).not.toContainText('25,000');
  await expect(panel(page).getByRole('alert')).toContainText('de 0 a 24');
  await escribir(page, '#horas-uso', '24');
  await verEnPanel(page, 'Consumo Diario 24,000 kWh/día');
  await escribir(page, '#horas-uso', '2');
  await escribir(page, '#precio-kwh', '0,20');
  await escribir(page, '#potencia-consumo', '-1000');
  await expect(panel(page)).not.toContainText(/-\d/);
  await expect(panel(page).getByRole('alert')).toContainText('no puede ser negativa');
  await modo(page, 'Ley de Ohm');
  await pulsar(page, 'Corriente');
  await escribir(page, '#resistencia', '-6');
  await expect(panel(page)).not.toContainText('-2,0000');
  await expect(panel(page).getByRole('alert')).toContainText('Una resistencia no puede ser negativa');
  await modo(page, 'RC/RL');
  await escribir(page, '#tiempo-rcrl', '-1');
  await expect(panel(page).getByRole('alert')).toContainText('no puede ser negativo');
});

test('HALLAZGO H7 (4443) — REPARADO · el escenario de la bomba: 1,5 mm² cumple la caída del 3 % a 15 m', async ({ page }) => {
  // REPARADO el 11/11/2026. I = 1500/230 = 6,52 A. Caída monofásica ΔV = 2·L·I/(γ·S) con cos φ = 1 (el de la
  // propia guía). Con γ = 44 m/(Ω·mm²) (cobre a 90 °C, el peor caso de calculadora-seccion-cable):
  // 1,5 mm² → 2·15·6,5217/(44·1,5) = 2,96 V = 1,29 % < 3 %; la sección mínima por caída es 0,64 mm².
  // Y el 3 % (6,9 V) no se alcanza hasta L = 6,9·44·1,5/(2·6,5217) ≈ 34,9 m («unos 35 m»).
  const corriente = 1500 / 230;
  const caida = (2 * 15 * corriente) / (44 * 1.5);
  expect((caida / 230) * 100).toBeCloseTo(1.29, 2);
  expect((0.03 * 230 * 44 * 1.5) / (2 * corriente)).toBeCloseTo(34.9, 1);
  const t = await textoGuia(page);
  expect(t).not.toContain('la caída de tensión exige 2,5 mm²');
  expect(t).toContain('Basta 1,5 mm²');
  expect(t).toMatch(/1,29\s%/);
});

test('HALLAZGO H8 (4444) — REPARADO · el ahorro por bajar potencia cuadra con la tarifa del paso 6', async ({ page }) => {
  // REPARADO el 11/11/2026. Paso 6: «Término de potencia (~3,5 €/kW contratado × kW/mes)». Bajar de
  // 5,75 a 4,6 kW son 1,15 kW × 3,5 = 4,03 €/mes; la tarjeta decía «~15 €/mes».
  expect((5.75 - 4.6) * 3.5).toBeCloseTo(4.025, 3);
  const t = await textoGuia(page);
  expect(t).not.toContain('ahorra ~15 €/mes');
  expect(t).toContain('ahorra unos 4 €/mes');
});

test('HALLAZGO H9 — ABIERTO · el alquiler del contador es el de la Orden ITC/3860/2007', async ({ page }) => {
  // ABIERTO. Orden ITC/3860/2007, anexo II d) (BOE-A-2007-22458): «Contadores electrónicos con
  // discriminación horaria y con posibilidad de telegestión para consumidores domésticos»,
  // 0,81 €/mes. La guía dice «alquiler equipo medida (~3 €/mes)».
  test.fail();
  const t = await textoGuia(page);
  expect(t).not.toContain('alquiler equipo medida (~3 €/mes)');
});

test('HALLAZGO H10 (4446) — REPARADO · las features del JSON-LD prometen solo lo que hace la app', async ({ page }) => {
  // REPARADO el 11/11/2026. Potencia no convierte unidades (W, V y A fijos) y Serie/Paralelo admite
  // más de 6 resistencias (CASO 2d: siete dan 7 Ω).
  const app = await jsonLd(page, 'WebApplication');
  const features = app.featureList ?? [];
  expect(features.length).toBeGreaterThanOrEqual(4);
  expect(features.length).toBeLessThanOrEqual(8);
  expect(features.some((f) => /conversión automática de unidades/i.test(f))).toBe(false);
  expect(features.some((f) => /hasta 6 componentes/i.test(f))).toBe(false);
});

test('HALLAZGO H11 — ABIERTO · formato español: «0,45» y el % separado', async ({ page }) => {
  // ABIERTO. Obtenido el 11/11/2026: «0.45» en el campo de corriente de Potencia y «1τ (63,2%)»,
  // «3τ (95%)», «5τ (99%)» en RC/RL (CLAUDE.md global §2: «63,2 %», con espacio duro).
  test.fail();
  await modo(page, 'Potencia');
  await expect(page.locator('#corriente-pot')).toHaveValue('0,45');
  await modo(page, 'RC/RL');
  const texto = await panel(page).innerText();
  expect(texto).toMatch(/63,2[\s ]%/);
  expect(texto).toMatch(/95[\s ]%/);
});

test('HALLAZGO H12 (4448) — REPARADO · los selectores de cada modo llevan aria-pressed', async ({ page }) => {
  // REPARADO el 11/11/2026. Los botones de tipo de cálculo sí lo llevaban; los de «Calcular» (Voltaje,
  // Corriente, Resistencia), Serie/Paralelo, Tensión/Corriente y RC/RL no: aria-pressed = null.
  await pulsar(page, 'Corriente');
  await expect(page.getByRole('button', { name: 'Corriente', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Voltaje', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await modo(page, 'Serie/Paralelo');
  await pulsar(page, /^Paralelo/);
  await expect(page.getByRole('button', { name: /^Paralelo/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /^Serie$/ })).toHaveAttribute('aria-pressed', 'false');
  await modo(page, 'RC/RL');
  await pulsar(page, 'RL (Inductor)');
  await expect(page.getByRole('button', { name: 'RL (Inductor)', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'RC (Capacitor)', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('HALLAZGO H13 — ABIERTO · emojis de la guía ocultos al lector e inputs con teclado decimal', async ({ page }) => {
  // ABIERTO. Obtenido el 11/11/2026: «⚡ Aprende Electricidad…» (título, emoji junto a texto) y los
  // iconos 🏠 ⚡ 🌞 🏭 🔌 ⏰ 🌡️ 💡 🔋 📊 sin aria-hidden; inputmode = null en los campos numéricos.
  test.fail();
  const sueltos = await page.evaluate(() => {
    const raices = Array.from(document.querySelectorAll('[data-guia-educativa]'));
    const titulo = Array.from(document.querySelectorAll('h3')).find((h) => h.textContent?.includes('Aprende Electricidad'));
    if (titulo) raices.push(titulo);
    const emoji = /\p{Extended_Pictographic}/u;
    const encontrados: string[] = [];
    for (const raiz of raices) {
      const recorrido = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
      for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
        const texto = n.textContent ?? '';
        if (emoji.test(texto) && !n.parentElement?.closest('[aria-hidden="true"]')) encontrados.push(texto.trim());
      }
    }
    return encontrados;
  });
  expect(sueltos).toEqual([]);
  await expect(page.locator('#corriente')).toHaveAttribute('inputmode', 'decimal');
  await expect(page.locator('#resistencia')).toHaveAttribute('inputmode', 'decimal');
});

test('HALLAZGO H14 — ABIERTO · la guía no da cifras sin fuente ni se contradice', async ({ page }) => {
  // ABIERTO. «El 80% de incendios en instalaciones solares son por cables mal dimensionados» y «las
  // siete leyes … resuelven el 95% de los problemas eléctricos reales», sin fuente; la FAQ promete
  // «ahorrar 30-40% en la factura eléctrica» y la tarjeta de buenas prácticas, «30-40% en esas cargas».
  test.fail();
  const t = await textoGuia(page);
  expect(t).not.toMatch(/80[\s ]?%\s+de\s+incendios/);
  expect(t).not.toMatch(/95[\s ]?%\s+de\s+los\s+problemas/);
  expect(t).not.toMatch(/30-40[\s ]?%\s+en\s+la\s+factura/);
});

test('HALLAZGO H15 — ABIERTO · el FAQPage no usa vocabulario solo de España', async ({ page }) => {
  // ABIERTO. «estudiantes de Física y Tecnología (ESO y Bachillerato)» (CLAUDE.md §1.bis:
  // secundaria, preparatoria, educación media).
  test.fail();
  const faq = await jsonLd(page, 'FAQPage');
  const textos = (faq.mainEntity ?? []).map((q) => `${q.name} ${q.acceptedAnswer.text}`).join(' ');
  expect(textos).not.toMatch(/\bESO\b|Bachillerato/);
});
