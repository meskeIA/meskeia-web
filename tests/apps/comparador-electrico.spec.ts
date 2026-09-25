import { test, expect, type Page, type Locator } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  esperarValorEnReact,
  leerValorEnReact,
  sembrarValor,
} from './_hidratacion';

/**
 * Comparador eléctrico vs combustión — test de regresión del Inspector (25/09/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «¿Cuándo compensa el coche, carro o auto eléctrico?» · metadata «Calcula el punto de
 * equilibrio entre un coche eléctrico y uno de gasolina […] Muestra el año en que el eléctrico
 * empieza a ser más barato». Entradas: precios de compra, subsidio (select), km/año, consumos,
 * precios de la energía, cargador doméstico y horizonte (5/8/10/15 años). Salida: «Año N»,
 * ahorro anual, inversión neta, coste por km y una tabla de costes acumulados año a año.
 *
 * EL MODELO DE LA APP (page.tsx:72-134), que es el que se usa para los casos a mano
 * ──────────────────────────────────────────────────────────────────────────────────
 *   energía EV  = km/100 · kWh/100 km · €/kWh        energía gasolina = km/100 · l/100 km · €/l
 *   mantenimiento fijo: 800 €/año el EV y 1.000 €/año el de gasolina (declarado en la nota)
 *   coste acumulado EV(n)       = (precio EV − subsidio − precio gasolina) + (energía EV + mant. EV) · n + cargador
 *   coste acumulado gasolina(n) = (energía gasolina + mant. gasolina) · n
 * El cargador es un desembolso de la compra: en el coste ACUMULADO cuenta entero desde el año 1
 * y una sola vez. La app lo reparte como cargador/10 cada año (page.tsx:100 y :111).
 *
 * DATO NORMATIVO (consultado el 25/09/2026)
 * ─────────────────────────────────────────
 * RD 609/2026, de 22 de julio, Programa Auto+ (BOE-A-2026-16010, 23/07/2026), preámbulo III:
 * «el Programa MOVES, que, mediante sus diversas convocatorias, ha estado vigente entre los años
 * 2019 y 2025». La app ofrece MOVES III (4.500 € / 7.000 € con achatarramiento) como vigente y
 * lo resta por defecto.
 *
 * HALLAZGOS ABIERTOS (cada uno vigilado por un test.fail que avisará cuando se repare)
 * ───────────────────────────────────────────────────────────────────────────────────────
 *   A · el cargador se reparte en 10 años: equilibrio un año antes y, a 15 años, contado 1,5 veces
 *   B · MOVES III presentado como vigente y restado por defecto
 *   C · eléctrico más barato de compra pero más caro de uso: «cada año adicional supone un ahorro mayor»
 *   D · cambiar el horizonte sin recalcular reescribe el mensaje con el horizonte nuevo
 *   E · «1.500» tecleado (es-ES) queda en 500: la app convierte el valor intermedio en 0
 *   F · cargador negativo aceptado
 *   G · km = 0 tras un cálculo: el botón se apaga y el «Año 4» anterior sigue en pantalla
 *   H · contraste del botón principal, del enlace del CTA y de los separadores
 *   I · nombre accesible que no contiene la etiqueta visible
 *   J · «0.18 €/kWh» con punto decimal y «30%» sin espacio en el FAQ
 */

test.use({ locale: 'es-ES' });

const RUTA = '/comparador-electrico/';
const RESULTADOS = 'section[aria-label="Resultados del comparador"]';
const TARJETA = `${RESULTADOS} [role="status"]`;

type CampoNumero =
  | 'precioElectrico'
  | 'precioGasolina'
  | 'kmAnuales'
  | 'consumoElectrico'
  | 'consumoGasolina'
  | 'precioLuz'
  | 'precioGasolinaLitro'
  | 'cargador';
type CampoSelect = 'moves' | 'anios';
type Campos = Partial<Record<CampoNumero | CampoSelect, number>>;

const SELECTS: readonly CampoSelect[] = ['moves', 'anios'];

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#precioElectrico', '#kmAnuales', '#cargador']);
}

async function fijar(page: Page, campos: Campos): Promise<void> {
  for (const [campo, valor] of Object.entries(campos)) {
    const selector = `#${campo}`;
    if ((SELECTS as readonly string[]).includes(campo)) {
      await page.locator(selector).selectOption(String(valor));
      await esperarValorEnReact(page, selector, String(valor));
    } else {
      await sembrarValor(page, selector, String(valor));
    }
  }
}

function botonCalcular(page: Page): Locator {
  return page.getByRole('button', { name: /Calcular el punto de equilibrio/ });
}

async function calcular(page: Page): Promise<void> {
  await botonCalcular(page).click();
  await expect(page.locator(TARJETA)).toBeVisible();
}

/** Celda de la tabla: fila = año (1…), columna 0 Año · 1 EV · 2 Gasolina · 3 Diferencia. */
function celda(page: Page, anio: number, columna: number): Locator {
  return page.locator(`${RESULTADOS} tbody tr`).nth(anio - 1).locator('td').nth(columna);
}

function estadistica(page: Page, i: number): Locator {
  return page.locator('[aria-label="Resumen de métricas clave"] > div').nth(i);
}

// Caso A del Inspector: 15.000 km, 6 l/100 km a 1,60 €/l, 16 kWh/100 km a 0,15 €/kWh,
// EV 35.000 €, gasolina 25.000 €, sin subsidio, sin cargador, 10 años.
const CASO_NORMAL: Campos = {
  moves: 0,
  consumoGasolina: 6,
  precioGasolinaLitro: 1.6,
  precioLuz: 0.15,
  cargador: 0,
};

test.describe('Cálculo', () => {
  test('caso normal sin cargador: equilibrio en el año 8', async ({ page }) => {
    // A mano: energía gasolina 150 · 6 · 1,60 = 1.440 €/año; energía EV 150 · 16 · 0,15 = 360 €/año.
    // Ahorro anual (energía + 200 € de mantenimiento) = 1.080 + 200 = 1.280 €.
    // Inversión neta = 35.000 − 25.000 = 10.000 €. Diferencia(n) = 1.280·n − 10.000:
    // año 7 → −1.040 €; año 8 → +240 € ⇒ «Año 8».
    // Año 8: EV 10.000 + (360 + 800)·8 = 19.280 €; gasolina (1.440 + 1.000)·8 = 19.520 €.
    // Coste por km: EV 1.160/15.000 = 7,7 ct; gasolina 2.440/15.000 = 16,3 ct.
    await abrir(page);
    await fijar(page, CASO_NORMAL);
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 8');
    await expect(estadistica(page, 0)).toContainText(/1280,00\s€/);
    await expect(estadistica(page, 1)).toContainText(/10\.000,00\s€/);
    await expect(estadistica(page, 2)).toContainText(/7,7 ct\/km/);
    await expect(estadistica(page, 2)).toContainText(/16,3 ct\/km/);
    await expect(celda(page, 7, 3)).toHaveText(/^-1040,00\s€$/);
    await expect(celda(page, 8, 1)).toHaveText(/^19\.280,00\s€$/);
    await expect(celda(page, 8, 2)).toHaveText(/^19\.520,00\s€$/);
    await expect(celda(page, 8, 3)).toHaveText(/^\+240,00\s€$/);
  });

  test('un precio de compra negativo no deja calcular', async ({ page }) => {
    // Debe rechazarse: un coche no cuesta −35.000 €. La app exige precio > 0 (page.tsx:160).
    await abrir(page);
    await fijar(page, { precioElectrico: -35000 });
    await expect(botonCalcular(page)).toBeDisabled();
  });

  // HALLAZGO A — el cargador se reparte como cargador/10 al año (page.tsx:100, :111).
  test.fail('el cargador se paga al comprar: con 1.200 € el equilibrio llega en el año 5', async ({ page }) => {
    // A mano (EV 30.000 €, gasolina 25.000 €, sin subsidio, resto por defecto: 15.000 km,
    // 16 kWh a 0,18 €, 7 l a 1,65 €): energía EV 432 €, gasolina 1.732,50 €.
    // EV(n) = 5.000 + 1.200 + 1.232·n ; gasolina(n) = 2.732,50·n
    // año 4: 11.128 € frente a 10.930 € → aún no ; año 5: 12.360 € frente a 13.662,50 € ⇒ «Año 5».
    // La app cuenta 120 €/año de cargador y da «Año 4».
    await abrir(page);
    await fijar(page, { precioElectrico: 30000, moves: 0, cargador: 1200 });
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 5');
  });

  // HALLAZGO A — a 15 años el cargador de 800 € se cuenta como 1.200 €.
  test.fail('a 15 años el cargador cuenta una sola vez en el coste acumulado del eléctrico', async ({ page }) => {
    // A mano (caso normal con cargador 800 € y horizonte 15):
    // EV(15) = 10.000 + 800 + (360 + 800)·15 = 28.200 €. La app suma 80 €·15 = 1.200 € → 28.600 €.
    await abrir(page);
    await fijar(page, { ...CASO_NORMAL, cargador: 800, anios: 15 });
    await calcular(page);
    await expect(celda(page, 15, 1)).toHaveText(/^28\.200,00\s€$/);
  });

  // HALLAZGO C — el primer año con diferencia ≥ 0 se presenta como punto sin retorno.
  test.fail('eléctrico más barato de compra pero más caro de uso: no promete un ahorro creciente', async ({ page }) => {
    // A mano: EV 20.000 €, gasolina 25.000 €, sin subsidio, 20 kWh/100 km a 0,60 €/kWh
    // (carga pública), 5 l/100 km a 1,40 €/l, sin cargador, 15.000 km, 10 años.
    // Energía EV 150·20·0,60 = 1.800 €; gasolina 150·5·1,40 = 1.050 €.
    // Diferencia(n) = 2.050·n − (−5.000 + 2.600·n) = 5.000 − 550·n → año 9: +50 €; año 10: −500 €.
    // El eléctrico va por delante hasta el año 9 y a partir del 10 sale más caro: la frase
    // «cada año adicional supone un ahorro neto acumulado mayor» es falsa aquí.
    await abrir(page);
    await fijar(page, {
      precioElectrico: 20000,
      moves: 0,
      consumoElectrico: 20,
      consumoGasolina: 5,
      precioLuz: 0.6,
      precioGasolinaLitro: 1.4,
      cargador: 0,
    });
    await calcular(page);
    await expect(celda(page, 9, 3)).toHaveText(/^\+50,00\s€$/);
    await expect(celda(page, 10, 3)).toHaveText(/^-500,00\s€$/);
    await expect(page.locator(TARJETA)).not.toContainText(
      'cada año adicional supone un ahorro neto acumulado mayor',
    );
  });
});

test.describe('Dato normativo', () => {
  // HALLAZGO B — MOVES III terminó en 2025 (RD 609/2026, preámbulo III). La app lo ofrece como
  // vigente (page.tsx:228-244, :537-544) y lo resta por defecto (page.tsx:58).
  test.fail('no ofrece MOVES III como ayuda vigente', async ({ page }) => {
    await abrir(page);
    const opciones = (await page.locator('#moves option').allTextContents()).join(' | ');
    expect(opciones, 'opciones del select de subsidio').not.toMatch(/MOVES III/);
    await expect(page.locator('main')).not.toContainText('sigue activo en 2025');
  });
});

test.describe('Entradas', () => {
  // HALLAZGO E — actualizarCampo (page.tsx:145-150): parseFloat casero y NaN → 0 en un input
  // controlado. En es-ES el punto de millar deja el valor intermedio vacío, la app lo pone a 0
  // y lo que se sigue tecleando se añade detrás del 0: «1.500» → «0500» → 500 €.
  test.fail('«1.500» tecleado en el cargador se lee como mil quinientos', async ({ page }) => {
    await abrir(page);
    const campo = page.locator('#cargador');
    await campo.click();
    await page.keyboard.press('Control+A');
    await campo.pressSequentially('1.500');
    await expect.poll(() => leerValorEnReact(page, '#cargador')).toBe('1500');
  });

  // HALLAZGO F — el cargador no se valida (page.tsx:159-166): −800 € abarata el eléctrico.
  test.fail('un cargador negativo no se acepta', async ({ page }) => {
    // Con el caso normal y cargador −800 € la app resta 80 €/año: EV año 1 = 11.160 − 80 = 11.080 €.
    // Lo correcto es rechazarlo (botón apagado o aviso). Si la reparación apaga el botón, el
    // test pasa y test.fail avisa de que ya está arreglado.
    await abrir(page);
    await fijar(page, { ...CASO_NORMAL, cargador: -800 });
    if (await botonCalcular(page).isDisabled()) return;
    await calcular(page);
    await expect(page.getByText(/^11\.080,00\s€$/)).toHaveCount(0);
  });

  // HALLAZGO G — km = 0 apaga el botón en silencio y deja el resultado anterior en pantalla.
  test.fail('poner 0 km tras calcular no deja a la vista el año de equilibrio anterior', async ({ page }) => {
    // Por defecto la app da «Año 4». Con 0 km no hay ahorro por uso posible: el «Año 4» ya no
    // corresponde a lo que hay en el formulario.
    await abrir(page);
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('en el año 4');
    await sembrarValor(page, '#kmAnuales', '0');
    await expect(botonCalcular(page)).toBeDisabled();
    await expect(page.getByText('El eléctrico empieza a ser más barato en el año 4')).toHaveCount(0);
  });

  // HALLAZGO D — el mensaje sin equilibrio lee form.anios (page.tsx:411) y la tabla, el cálculo viejo.
  test.fail('cambiar el horizonte sin recalcular no reescribe el veredicto', async ({ page }) => {
    // Sin subsidio y resto por defecto: diferencia(n) = 1.420,50·n − 10.000 → año 8 (> 5).
    // A 5 años: «No se alcanza el break-even en 5 años» (correcto). Al pasar a 15 sin recalcular,
    // la app escribe «en 15 años» aunque con 15 años ella misma da «Año 8».
    await abrir(page);
    await fijar(page, { moves: 0, anios: 5 });
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('No se alcanza el break-even en 5 años');
    await fijar(page, { anios: 15 });
    await expect(page.locator(TARJETA)).not.toContainText('en 15 años');
  });
});

test.describe('Accesibilidad y formato', () => {
  async function contrastes(page: Page): Promise<{ boton: number; cta: number; divisor: number }> {
    return page.evaluate(() => {
      const leer = (s: string): number[] => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        return m ? m[1].split(/[ ,/]+/).filter(Boolean).map(Number) : [0, 0, 0, 0];
      };
      const lum = (c: number[]): number => {
        const f = (x: number): number => {
          const v = x / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
      };
      const ratio = (a: number[], b: number[]): number => {
        const [x, y] = [lum(a), lum(b)];
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      };
      const fondoOpaco = (el: Element): number[] => {
        for (let e: Element | null = el; e; e = e.parentElement) {
          const c = leer(getComputedStyle(e).backgroundColor);
          const alfa = c.length > 3 ? c[3] : 1;
          if (alfa >= 0.99) return c;
        }
        return [255, 255, 255];
      };
      const boton = document.querySelector('[class*="btnCalcular"]') as HTMLElement;
      const csB = getComputedStyle(boton);
      const paradas = [...csB.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map((m) => leer(m[0]));
      const blanco = leer(csB.color);
      const cta = document.querySelector('[class*="ctaLink"]') as HTMLElement;
      const csC = getComputedStyle(cta);
      const divisor = document.querySelector('[class*="sectionDivider"]') as HTMLElement;
      return {
        boton: Math.min(...paradas.map((p) => ratio(blanco, p))),
        cta: ratio(leer(csC.color), leer(csC.backgroundColor)),
        divisor: ratio(leer(getComputedStyle(divisor).color), fondoOpaco(divisor)),
      };
    });
  }

  async function prepararContraste(page: Page, tema: 'light' | 'dark'): Promise<void> {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await abrir(page);
    await calcular(page); // el enlace del CTA solo existe con resultado
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, tema);
    await esperarPaginaAsentada(page);
  }

  // HALLAZGO H — blanco sobre el degradado --primary → --secondary (CSS:172-173), blanco sobre
  // --primary en el CTA (CSS:426-427) y --primary como texto de 12,5 px (CSS:73). Texto normal: 4,5:1.
  test.fail('contraste en claro: botón, enlace del CTA y separadores ≥ 4,5:1', async ({ page }) => {
    // Medido el 25/09/2026: botón 4,11 → 2,80 (#2E86AB → #48A9A6); CTA 4,11; separadores 4,11.
    await prepararContraste(page, 'light');
    const c = await contrastes(page);
    expect(c.boton, 'botón «Calcular punto de equilibrio»').toBeGreaterThanOrEqual(4.5);
    expect(c.cta, 'enlace «Ir al Selector de Vehículo»').toBeGreaterThanOrEqual(4.5);
    expect(c.divisor, 'separadores «Precios de compra»…').toBeGreaterThanOrEqual(4.5);
  });

  test.fail('contraste en oscuro: botón y enlace del CTA ≥ 4,5:1', async ({ page }) => {
    // Medido el 25/09/2026: botón 2,79 → 2,23 (rgb 63,165,209 → 90,189,185); CTA 2,79.
    await prepararContraste(page, 'dark');
    const c = await contrastes(page);
    expect(c.boton, 'botón «Calcular punto de equilibrio»').toBeGreaterThanOrEqual(4.5);
    expect(c.cta, 'enlace «Ir al Selector de Vehículo»').toBeGreaterThanOrEqual(4.5);
  });

  // HALLAZGO I — los aria-label sustituyen a la etiqueta visible con otro texto (WCAG 2.5.3).
  test.fail('el nombre accesible contiene la etiqueta visible', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('spinbutton', { name: 'Kilómetros anuales' })).toHaveCount(1);
    await expect(page.getByRole('spinbutton', { name: 'Precio del eléctrico' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Calcular punto de equilibrio' })).toHaveCount(1);
  });

  // HALLAZGO J — page.tsx:316 «~0.18 €/kWh» y metadata.ts:106 «30% y un 40%».
  test.fail('formato español: coma decimal en las pistas y % separado en el FAQ', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('main')).not.toContainText(/\d\.\d{2}\s€\/kWh/);
    const faq = (await page.locator('script[type="application/ld+json"]').allTextContents()).find((t) =>
      t.includes('FAQPage'),
    );
    expect(faq, 'JSON-LD FAQPage').toBeDefined();
    expect(faq ?? '').not.toMatch(/\d%/);
  });
});

test.describe('Móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('con resultado, la página no desborda en horizontal', async ({ page }) => {
    await abrir(page);
    await fijar(page, CASO_NORMAL);
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('en el año 8');
    const ancho = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      vista: document.documentElement.clientWidth,
    }));
    expect(ancho.pagina).toBeLessThanOrEqual(ancho.vista);
  });
});
