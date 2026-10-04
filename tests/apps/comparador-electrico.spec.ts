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
 * empieza a ser más barato». Entradas: precios de compra, ayuda a la compra (€, 0 por defecto),
 * km/año, consumos, precios de la energía, cargador doméstico, mantenimiento de cada coche y
 * horizonte (5/8/10/15 años). Salida: veredicto, ahorro de uso anual, diferencia al comprar,
 * coste por km y una tabla de costes TOTALES acumulados año a año.
 *
 * EL MODELO DE LA APP (motor.ts), que es el que se usa para los casos a mano
 * ──────────────────────────────────────────────────────────────────────────
 *   energía EV  = km/100 · kWh/100 km · €/kWh        energía gasolina = km/100 · l/100 km · €/l
 *   mantenimiento por defecto: 800 €/año el EV y 1.000 €/año el de gasolina (ahora son campos)
 *   coste total EV(n)       = precio EV − ayuda + cargador + (energía EV + mant. EV) · n
 *   coste total gasolina(n) = precio gasolina + (energía gasolina + mant. gasolina) · n
 * El cargador es un desembolso de la compra: cuenta entero desde el año 1 y una sola vez.
 *
 * DATO NORMATIVO (consultado el 25/09/2026)
 * ─────────────────────────────────────────
 * RD 609/2026, de 22 de julio, Programa Auto+ (BOE-A-2026-16010, 23/07/2026), preámbulo III:
 * «el Programa MOVES, que, mediante sus diversas convocatorias, ha estado vigente entre los años
 * 2019 y 2025». La app ofrecía MOVES III (4.500 € / 7.000 € con achatarramiento) como vigente y
 * lo restaba por defecto.
 *
 * REPARACIÓN DEL 26/09/2026 — lo que cambió en los casos
 * ──────────────────────────────────────────────────────
 * · Las columnas de coste eran una DIFERENCIA rotulada como coste (salían negativas, hallazgo
 *   1998). Ahora son costes totales (compra + uso): los importes de las columnas 1 y 2 suben en
 *   el precio de compra de cada coche; la columna «Ventaja del eléctrico» no cambia.
 * · El subsidio ya no es un select con MOVES III: es un campo numérico #ayuda, 0 por defecto.
 * · Los campos son de texto (inputMode decimal) leídos con parseSpanishNumber: su rol es
 *   `textbox`, no `spinbutton`, y guardan lo tecleado («1.500»), no el número normalizado.
 * · Tras el primer «Calcular» el resultado se recalcula con cada cambio y desaparece si un dato
 *   deja de ser válido.
 *
 * HALLAZGOS (reparados el 26/09/2026; se conserva su letra en cada caso)
 * ─────────────────────────────────────────────────────────────────────
 *   A · el cargador se reparte en 10 años: equilibrio un año antes y, a 15 años, contado 1,5 veces
 *   B · MOVES III presentado como vigente y restado por defecto
 *   C · eléctrico más barato de compra pero más caro de uso: «cada año adicional supone un ahorro mayor»
 *   D · cambiar el horizonte sin recalcular reescribe el mensaje con el horizonte nuevo
 *   E · «1.500» tecleado (es-ES) queda en 500: la app convierte el valor intermedio en 0
 *   F · cargador negativo aceptado
 *   G · km = 0 tras un cálculo: el botón se apaga y el año anterior sigue en pantalla
 *   H · contraste del botón principal, del enlace del CTA y de los separadores
 *   I · nombre accesible que no contiene la etiqueta visible
 *   J · «0.18 €/kWh» con punto decimal y «30%» sin espacio en el FAQ
 *
 * RE-INSPECCIÓN DEL 04/10/2026
 * ────────────────────────────
 * Los doce hallazgos de arriba siguen reparados: sus casos pasan. Casos nuevos, resueltos a mano
 * antes de ejecutar: uno normal con los once campos escritos en formato español, el equilibrio
 * justo en el año 15 (el borde del horizonte máximo), la ventaja que se agota, lo que debe
 * rechazarse, el tecleo pulsación a pulsación en escritorio y en móvil, y el título libre de la
 * barra del logo a 360, 800, 1024 y 1280 px (lotes del hero d056b066, 3de36a1f y a1d72a9c).
 * La sospecha del 28-30/09 sobre el tecleo se DESCARTA: los campos guardan el texto tal cual
 * («1.», «1,», «-», vacío) sin que React escriba «0» bajo el cursor, y el `Number(...)` de la
 * línea 433 es el del horizonte, un <select> de opciones fijas (5/8/10/15), que no se teclea.
 * Hallazgos ABIERTOS de esta vuelta, cada uno con su test.fail():
 *   K · los veredictos «nunca» y «se agota» dan por hecho que el sobrecoste de uso viene de la
 *       energía; con el mantenimiento editable, la propia app los desmiente cambiando los km
 *   L · mismo precio de compra y uso más caro: «Cuesta más de comprar» y «ya es más barato»
 *   M · «el Programa MOVES III estuvo vigente entre 2019 y 2025»: MOVES III es el RD 266/2021
 *   N · el FAQ agrupa cifras de cuatro dígitos («1.500,50 €») que la app escribe «1500,50 €»
 */

test.use({ locale: 'es-ES' });

const RUTA = '/comparador-electrico/';
const RESULTADOS = 'section[aria-label="Resultados del comparador"]';
const TARJETA = `${RESULTADOS} [role="status"]`;

type CampoNumero =
  | 'precioElectrico'
  | 'precioGasolina'
  | 'ayuda'
  | 'kmAnuales'
  | 'consumoElectrico'
  | 'consumoGasolina'
  | 'precioLuz'
  | 'precioGasolinaLitro'
  | 'cargador'
  | 'mantElectrico'
  | 'mantGasolina';
type CampoSelect = 'anios';
// Texto para escribir los importes en formato español («46.707,50»), como los teclea el usuario.
type Campos = Partial<Record<CampoNumero | CampoSelect, number | string>>;

const SELECTS: readonly CampoSelect[] = ['anios'];

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
  return page.getByRole('button', { name: 'Calcular punto de equilibrio' });
}

async function calcular(page: Page): Promise<void> {
  await botonCalcular(page).click();
  await expect(page.locator(TARJETA)).toBeVisible();
}

/** Celda de la tabla: fila = año (1…), columna 0 Año · 1 EV · 2 Gasolina · 3 Ventaja del EV. */
function celda(page: Page, anio: number, columna: number): Locator {
  return page.locator(`${RESULTADOS} tbody tr`).nth(anio - 1).locator('td').nth(columna);
}

function estadistica(page: Page, i: number): Locator {
  return page.locator('[aria-label="Resumen de métricas clave"] > div').nth(i);
}

// Caso A del Inspector: 15.000 km, 6 l/100 km a 1,60 €/l, 16 kWh/100 km a 0,15 €/kWh,
// EV 35.000 €, gasolina 25.000 €, sin ayuda (el valor por defecto), sin cargador, 10 años.
const CASO_NORMAL: Campos = {
  consumoGasolina: 6,
  precioGasolinaLitro: 1.6,
  precioLuz: 0.15,
  cargador: 0,
};

test.describe('Cálculo', () => {
  test('caso normal sin cargador: equilibrio en el año 8', async ({ page }) => {
    // A mano: energía gasolina 150 · 6 · 1,60 = 1.440 €/año; energía EV 150 · 16 · 0,15 = 360 €/año.
    // Ahorro anual (energía + 200 € de mantenimiento) = 1.080 + 200 = 1.280 €.
    // Diferencia al comprar = 35.000 − 25.000 = 10.000 €. Ventaja(n) = 1.280·n − 10.000:
    // año 7 → −1.040 €; año 8 → +240 € ⇒ «Año 8».
    // Año 8 (costes TOTALES, hallazgo 1998): EV 35.000 + (360 + 800)·8 = 44.280 €;
    // gasolina 25.000 + (1.440 + 1.000)·8 = 44.520 €. Antes la tabla mostraba la diferencia
    // (19.280 / 19.520), que en otros casos salía negativa rotulada como «coste».
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
    await expect(celda(page, 8, 1)).toHaveText(/^44\.280,00\s€$/);
    await expect(celda(page, 8, 2)).toHaveText(/^44\.520,00\s€$/);
    await expect(celda(page, 8, 3)).toHaveText(/^\+240,00\s€$/);
  });

  test('un precio de compra negativo no deja calcular', async ({ page }) => {
    // Debe rechazarse: un coche no cuesta −35.000 €. La app exige precio > 0 (leerFormulario).
    await abrir(page);
    await fijar(page, { precioElectrico: -35000 });
    await expect(botonCalcular(page)).toBeDisabled();
  });

  test('el ejemplo por defecto: sin ayuda y con el cargador al comprar, equilibrio en el año 8', async ({ page }) => {
    // A mano: energía EV 150·16·0,18 = 432 €, gasolina 150·7·1,65 = 1.732,50 €;
    // ahorro de uso 1.300,50 + 200 = 1500,50 €/año (cuatro cifras: sin punto de millar, RAE).
    // Diferencia al comprar = 35.000 − 0 + 800 − 25.000 = 10.800 €.
    // Año 7: 10.503,50 < 10.800 ; año 8: 12.004 ≥ 10.800 ⇒ «Año 8».
    await abrir(page);
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 8');
    await expect(estadistica(page, 0)).toContainText(/1500,50\s€/);
    await expect(estadistica(page, 1)).toContainText(/10\.800,00\s€/);
  });

  // HALLAZGO A (1995) — el cargador se repartía como cargador/10 al año.
  test('el cargador se paga al comprar: con 1.200 € el equilibrio llega en el año 5', async ({ page }) => {
    // A mano (EV 30.000 €, gasolina 25.000 €, sin ayuda, resto por defecto: 15.000 km,
    // 16 kWh a 0,18 €, 7 l a 1,65 €): energía EV 432 €, gasolina 1.732,50 €.
    // EV(n) = 30.000 + 1.200 + 1.232·n ; gasolina(n) = 25.000 + 2.732,50·n
    // año 4: ventaja 6.002 − 6.200 < 0 ; año 5: 7.502,50 − 6.200 ≥ 0 ⇒ «Año 5».
    // Con el reparto en 10 años la app daba «Año 4».
    await abrir(page);
    await fijar(page, { precioElectrico: 30000, cargador: 1200 });
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 5');
  });

  // HALLAZGO A (1995) — a 15 años el cargador de 800 € se contaba como 1.200 €.
  test('a 15 años el cargador cuenta una sola vez en el coste acumulado del eléctrico', async ({ page }) => {
    // A mano (caso normal con cargador 800 € y horizonte 15), en costes TOTALES (hallazgo 1998):
    // EV(15) = 35.000 + 800 + (360 + 800)·15 = 53.200 €. Con el reparto, 80 €·15 = 1.200 € → 53.600 €.
    // Ventaja(15) = 25.000 + 2.440·15 − 53.200 = 8.400 € (antes 8.000 €).
    await abrir(page);
    await fijar(page, { ...CASO_NORMAL, cargador: 800, anios: 15 });
    await calcular(page);
    await expect(celda(page, 15, 1)).toHaveText(/^53\.200,00\s€$/);
    await expect(celda(page, 15, 3)).toHaveText(/^\+8400,00\s€$/);
  });

  // HALLAZGO C (1998) — el primer año con ventaja ≥ 0 se presentaba como punto sin retorno.
  test('eléctrico más barato de compra pero más caro de uso: no promete un ahorro creciente', async ({ page }) => {
    // A mano: EV 20.000 €, gasolina 25.000 €, sin ayuda, 20 kWh/100 km a 0,60 €/kWh
    // (carga pública), 5 l/100 km a 1,40 €/l, sin cargador, 15.000 km, 10 años.
    // Energía EV 150·20·0,60 = 1.800 €; gasolina 150·5·1,40 = 1.050 €.
    // Ventaja(n) = −(−5.000) + (2.050 − 2.600)·n = 5.000 − 550·n → año 9: +50 €; año 10: −500 €.
    // El eléctrico va por delante hasta el año 9 y a partir del 10 sale más caro: la frase
    // «cada año adicional supone un ahorro neto acumulado mayor» es falsa aquí.
    await abrir(page);
    await fijar(page, {
      precioElectrico: 20000,
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
    // Lo que dice ahora: la ventaja se agota y desde el año 10 sale más caro.
    await expect(page.locator(TARJETA)).toContainText('Más caro desde el año 10');
    // Y ninguna columna de «coste» es negativa: año 1 EV = 20.000 + 1.800 + 800 = 22.600 €.
    await expect(celda(page, 1, 1)).toHaveText(/^22\.600,00\s€$/);
  });
});

test.describe('Dato normativo', () => {
  // HALLAZGO B (1996, 1997) — MOVES III terminó en 2025 (RD 609/2026, preámbulo III). La app lo
  // ofrecía como vigente y lo restaba por defecto. Ahora: campo de ayuda con 0 por defecto, la app
  // no la calcula, y el texto explica el Programa Auto+ con cifras de data/fiscal/ayudas-vehiculo.
  test('no ofrece MOVES III como ayuda vigente ni resta ninguna ayuda por defecto', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('#moves')).toHaveCount(0);
    await expect(page.locator('#ayuda')).toHaveValue('0');
    await expect(page.locator('main')).not.toContainText('sigue activo en 2025');
    await expect(page.locator('main')).not.toContainText('achatarramiento (7.000');
    // El MOVES III solo aparece como terminado.
    await expect(page.locator('main')).toContainText(/MOVES III terminó el 31\/12\/2025/);
    // Máximo del Auto+ para un turismo, del módulo (Anexo II del RD 609/2026).
    await expect(page.locator('main')).toContainText(/como máximo 4500\s€/);
    await calcular(page);
    await expect(estadistica(page, 1)).toContainText(/10\.800,00\s€/);
  });

  test('la ayuda que escribe el usuario se resta del precio del eléctrico', async ({ page }) => {
    // Caso normal con 3.000 € de ayuda: diferencia al comprar 7.000 €; 1.280·n ≥ 7.000 ⇒ n = 6.
    await abrir(page);
    await fijar(page, { ...CASO_NORMAL, ayuda: 3000 });
    await calcular(page);
    await expect(estadistica(page, 1)).toContainText(/7000,00\s€/);
    await expect(page.locator(TARJETA)).toContainText('en el año 6');
  });
});

test.describe('Entradas', () => {
  // HALLAZGO E (2000) — parseFloat casero y NaN → 0 en un input type=number controlado: en es-ES
  // «1.500» acababa en «0500» → 500 €. Ahora el campo es de texto y guarda lo tecleado, así que
  // lo que se comprueba es la LECTURA: el campo conserva «1.500» y el cálculo usa 1.500 €.
  test('«1.500» tecleado en el cargador se lee como mil quinientos', async ({ page }) => {
    // Caso normal con cargador 1.500 €: diferencia al comprar 35.000 + 1.500 − 25.000 = 11.500 €.
    await abrir(page);
    await fijar(page, CASO_NORMAL);
    const campo = page.locator('#cargador');
    await campo.click();
    await page.keyboard.press('Control+A');
    await campo.pressSequentially('1.500');
    await expect.poll(() => leerValorEnReact(page, '#cargador')).toBe('1.500');
    await calcular(page);
    await expect(estadistica(page, 1)).toContainText(/11\.500,00\s€/);
  });

  // HALLAZGO F (2001) — el cargador no se validaba: −800 € abarataba el eléctrico.
  test('un cargador negativo no se acepta', async ({ page }) => {
    await abrir(page);
    await fijar(page, { ...CASO_NORMAL, cargador: -800 });
    await expect(botonCalcular(page)).toBeDisabled();
    await expect(page.locator('#aviso-formulario')).toContainText('Cargador doméstico');
    await expect(page.locator('#aviso-formulario')).toContainText('No puede ser negativo');
  });

  // HALLAZGO G (2002) — km = 0 apagaba el botón en silencio y dejaba el resultado anterior.
  test('poner 0 km tras calcular no deja a la vista el año de equilibrio anterior', async ({ page }) => {
    // Por defecto la app da ahora «Año 8» (sin ayuda restada, hallazgo 1996). Con 0 km no hay
    // ahorro por uso posible: el «Año 8» ya no corresponde a lo que hay en el formulario.
    await abrir(page);
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('en el año 8');
    await sembrarValor(page, '#kmAnuales', '0');
    await expect(botonCalcular(page)).toBeDisabled();
    await expect(page.getByText('El eléctrico empieza a ser más barato en el año 8')).toHaveCount(0);
    await expect(page.locator('#aviso-formulario')).toContainText('Sin kilómetros no hay ahorro de uso');
  });

  // HALLAZGO D (1999) — el mensaje sin equilibrio leía el horizonte VIVO y la tabla, el cálculo viejo.
  test('cambiar el horizonte sin recalcular no reescribe el veredicto', async ({ page }) => {
    // Por defecto (cargador al comprar): ventaja(n) = 1.500,50·n − 10.800 → año 8 (> 5).
    // A 5 años: «No se alcanza el punto de equilibrio en 5 años» (correcto). Al pasar a 15, la app
    // recalcula (el resultado sigue al formulario tras el primer cálculo) y da «Año 8» con 15 filas.
    await abrir(page);
    await fijar(page, { anios: 5 });
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('No se alcanza el punto de equilibrio en 5 años');
    await expect(page.locator(TARJETA)).toContainText('en el año 8');
    await fijar(page, { anios: 15 });
    await expect(page.locator(TARJETA)).not.toContainText('en 15 años');
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 8');
    await expect(page.locator(`${RESULTADOS} tbody tr`)).toHaveCount(15);
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

  // HALLAZGO H (2003) — blanco sobre el degradado --primary → --secondary, blanco sobre --primary
  // en el CTA y --primary como texto de 12,5 px. Ahora -boton / -texto. Texto normal: 4,5:1.
  test('contraste en claro: botón, enlace del CTA y separadores ≥ 4,5:1', async ({ page }) => {
    // Medido el 25/09/2026: botón 4,11 → 2,80 (#2E86AB → #48A9A6); CTA 4,11; separadores 4,11.
    await prepararContraste(page, 'light');
    const c = await contrastes(page);
    expect(c.boton, 'botón «Calcular punto de equilibrio»').toBeGreaterThanOrEqual(4.5);
    expect(c.cta, 'enlace «Ir al Selector de Vehículo»').toBeGreaterThanOrEqual(4.5);
    expect(c.divisor, 'separadores «Precios de compra»…').toBeGreaterThanOrEqual(4.5);
  });

  test('contraste en oscuro: botón, enlace del CTA y separadores ≥ 4,5:1', async ({ page }) => {
    // Medido el 25/09/2026: botón 2,79 → 2,23 (rgb 63,165,209 → 90,189,185); CTA 2,79.
    await prepararContraste(page, 'dark');
    const c = await contrastes(page);
    expect(c.boton, 'botón «Calcular punto de equilibrio»').toBeGreaterThanOrEqual(4.5);
    expect(c.cta, 'enlace «Ir al Selector de Vehículo»').toBeGreaterThanOrEqual(4.5);
    expect(c.divisor, 'separadores «Precios de compra»…').toBeGreaterThanOrEqual(4.5);
  });

  // HALLAZGO I (2004) — los aria-label sustituían a la etiqueta visible (WCAG 2.5.3). Los campos
  // son ahora de texto (hallazgo 2000): su rol es textbox, no spinbutton.
  test('el nombre accesible contiene la etiqueta visible', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('textbox', { name: 'Kilómetros anuales' })).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: 'Precio del eléctrico' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Calcular punto de equilibrio' })).toHaveCount(1);
  });

  // HALLAZGO J (2005) — «~0.18 €/kWh» en una pista y «30%» / «100%» pegados en el JSON-LD.
  test('formato español: coma decimal en las pistas y % separado en el FAQ', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('main')).not.toContainText(/\d\.\d{2}\s€\/kWh/);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = scripts.find((t) => t.includes('FAQPage'));
    expect(faq, 'JSON-LD FAQPage').toBeDefined();
    expect(faq ?? '').not.toMatch(/\d%/);
    const todos = scripts.join(' ');
    expect(todos).not.toMatch(/\d%/);
    expect(todos, 'JSON-LD sin MOVES III vigente').not.toMatch(/MOVES III \(0|ofrece hasta 4\.500/);
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

  // Lotes del hero (d056b066): 80 px arriba hasta 1023 px. Medido el 04/10/2026: letras desde
  // y = 78 px, barra del logo hasta y = 52 px.
  test('el título queda libre de la barra del logo', async ({ page }) => {
    await abrir(page);
    await esperarPaginaAsentada(page);
    expect(await letrasBajoLaBarra(page)).toEqual({ barra: true, tapadas: 0 });
  });

  // Sospecha del 28-30/09 (descartada): en móvil, el campo guarda lo tecleado tal cual.
  test('tecleo en móvil: vaciar, «12», borrar y escribir «20.000» y «0,2» tecla a tecla', async ({ page }) => {
    // A mano, por defecto salvo km 20.000 y luz 0,2 €/kWh: energía EV 200·16·0,2 = 640 €;
    // gasolina 200·7·1,65 = 2.310 €; ahorro (2.310 + 1.000) − (640 + 800) = 1870,00 €/año.
    // Diferencia al comprar 10.800 € → 1.870·5 = 9.350 < 10.800 ≤ 1.870·6 = 11.220 ⇒ año 6.
    await abrir(page);
    await vaciarTocando(page, 'kmAnuales');
    await teclearYVer(page, 'kmAnuales', '12');
    await pulsarYVer(page, 'kmAnuales', 'Backspace', '1');
    await pulsarYVer(page, 'kmAnuales', 'Backspace', '');
    await teclearYVer(page, 'kmAnuales', '20.000');
    await vaciarTocando(page, 'precioLuz');
    await teclearYVer(page, 'precioLuz', '0,2');
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 6');
    await expect(estadistica(page, 0)).toContainText(/1870,00\s€/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RE-INSPECCIÓN DEL 04/10/2026
// ─────────────────────────────────────────────────────────────────────────────

/** ¿Cuántas cajas de texto del <h1> pisa la barra fija del logo? (la medida de la Ronda) */
async function letrasBajoLaBarra(page: Page): Promise<{ barra: boolean; tapadas: number }> {
  return page.evaluate(() => {
    const barra = Array.from(document.querySelectorAll('body *')).find((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return (
        cs.position === 'fixed' &&
        r.top <= 1 &&
        r.height < 120 &&
        r.width > 300 &&
        e.querySelector('a[href="/"]') !== null
      );
    });
    const h1 = document.querySelector('h1');
    if (!barra || !h1) return { barra: false, tapadas: -1 };
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    const letras = Array.from(rango.getClientRects()).filter((c) => c.width > 0);
    const piezas = Array.from(barra.children)
      .map((c) => c.getBoundingClientRect())
      .filter((c) => c.width > 0);
    const tapadas = letras.filter((c) =>
      piezas.some(
        (p) => !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom),
      ),
    ).length;
    return { barra: true, tapadas };
  });
}

/** Pulsa una tecla en el campo enfocado y comprueba que el DOM y React guardan `esperado`. */
async function pulsarYVer(page: Page, id: string, tecla: string, esperado: string): Promise<void> {
  await page.keyboard.press(tecla);
  await expect(page.locator(`#${id}`)).toHaveValue(esperado);
  await expect.poll(() => leerValorEnReact(page, `#${id}`)).toBe(esperado);
}

/** Teclea `texto` carácter a carácter y comprueba cada estado intermedio (nunca un «0» de React). */
async function teclearYVer(page: Page, id: string, texto: string): Promise<void> {
  let previo = await page.locator(`#${id}`).inputValue();
  for (const caracter of texto) {
    previo += caracter;
    await pulsarYVer(page, id, caracter, previo);
  }
}

/** Escritorio: clic, seleccionar todo y borrar. */
async function vaciarConTeclado(page: Page, id: string): Promise<void> {
  await page.locator(`#${id}`).click();
  await page.keyboard.press('Control+A');
  await pulsarYVer(page, id, 'Backspace', '');
}

/** Móvil: tocar, ir al final y borrar carácter a carácter. */
async function vaciarTocando(page: Page, id: string): Promise<void> {
  const campo = page.locator(`#${id}`);
  await campo.tap();
  await page.keyboard.press('End');
  const largo = (await campo.inputValue()).length;
  for (let i = 0; i < largo; i++) await page.keyboard.press('Backspace');
  await expect(campo).toHaveValue('');
  await expect.poll(() => leerValorEnReact(page, `#${id}`)).toBe('');
}

test.describe('Re-inspección 04/10/2026 · cálculo', () => {
  test('caso normal con los once campos en formato español: equilibrio en el año 5', async ({ page }) => {
    // A mano: EV 32.000 €, gasolina 24.000 €, ayuda 2.250 €, 18.000 km, 17,5 kWh/100 km a
    // 0,15 €/kWh, 6,5 l/100 km a 1,55 €/l, cargador 1.100 €, mantenimiento 600 y 950 €/año, 10 años.
    // Energía EV 180·17,5·0,15 = 472,50 €; gasolina 180·6,5·1,55 = 1.813,50 €.
    // Uso EV 1.072,50 €/año; uso gasolina 2.763,50 €/año → ahorro 1691,00 €/año.
    // Diferencia al comprar 32.000 − 2.250 + 1.100 − 24.000 = 6850,00 €.
    // Ventaja(n) = 1.691·n − 6.850 → año 4: −86,00 €; año 5: +1605,00 € ⇒ «Año 5».
    // Año 5: EV 30.850 + 1.072,50·5 = 36.212,50 €; gasolina 24.000 + 2.763,50·5 = 37.817,50 €.
    // Año 10: EV 41.575,00 €; gasolina 51.635,00 €; ventaja +10.060,00 €.
    // Coste por km: EV 1.072,50/18.000 = 5,96 ct → «6,0»; gasolina 2.763,50/18.000 = 15,35 ct → «15,4».
    await abrir(page);
    await fijar(page, {
      precioElectrico: '32.000',
      precioGasolina: '24.000',
      ayuda: '2.250',
      kmAnuales: '18.000',
      consumoElectrico: '17,5',
      consumoGasolina: '6,5',
      precioLuz: '0,15',
      precioGasolinaLitro: '1,55',
      cargador: '1.100',
      mantElectrico: '600',
      mantGasolina: '950',
    });
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 5');
    await expect(estadistica(page, 0)).toContainText(/1691,00\s€/);
    await expect(estadistica(page, 1)).toContainText(/6850,00\s€/);
    await expect(estadistica(page, 2)).toContainText(/6,0 ct\/km/);
    await expect(estadistica(page, 2)).toContainText(/15,4 ct\/km/);
    await expect(celda(page, 4, 3)).toHaveText(/^-86,00\s€$/);
    await expect(celda(page, 5, 1)).toHaveText(/^36\.212,50\s€$/);
    await expect(celda(page, 5, 2)).toHaveText(/^37\.817,50\s€$/);
    await expect(celda(page, 5, 3)).toHaveText(/^\+1605,00\s€$/);
    await expect(celda(page, 10, 1)).toHaveText(/^41\.575,00\s€$/);
    await expect(celda(page, 10, 2)).toHaveText(/^51\.635,00\s€$/);
    await expect(celda(page, 10, 3)).toHaveText(/^\+10\.060,00\s€$/);
  });

  test('borde: el equilibrio cae justo en el año 15, el horizonte máximo', async ({ page }) => {
    // A mano, por defecto salvo el precio del eléctrico «46.707,50»: ahorro 1500,50 €/año
    // (energía 432 € frente a 1.732,50 €, mantenimiento 800 € frente a 1.000 €).
    // Diferencia al comprar 46.707,50 + 800 − 25.000 = 22.507,50 € = 1.500,50 · 15 exactos.
    // Año 14: −1500,50 €; año 15: +0,00 € (ventaja ≥ 0) ⇒ «Año 15» con 15 años.
    // Año 15: EV 47.507,50 + 1.232·15 = 65.987,50 € = gasolina 25.000 + 2.732,50·15.
    // Con 10 años, fuera del horizonte: «recuperaría la diferencia en el año 15».
    await abrir(page);
    await fijar(page, { precioElectrico: '46.707,50', anios: 15 });
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 15');
    await expect(estadistica(page, 1)).toContainText(/22\.507,50\s€/);
    await expect(celda(page, 14, 3)).toHaveText(/^-1500,50\s€$/);
    await expect(celda(page, 15, 1)).toHaveText(/^65\.987,50\s€$/);
    await expect(celda(page, 15, 2)).toHaveText(/^65\.987,50\s€$/);
    await expect(celda(page, 15, 3)).toHaveText(/^\+0,00\s€$/);
    await fijar(page, { anios: 10 });
    await expect(page.locator(TARJETA)).toContainText('No se alcanza el punto de equilibrio en 10 años');
    await expect(page.locator(TARJETA)).toContainText('recuperaría la diferencia en el año 15');
    await expect(page.locator(`${RESULTADOS} tbody tr`)).toHaveCount(10);
  });

  test('la ventaja se agota: más barato de comprar, más caro de usar', async ({ page }) => {
    // A mano: EV 22.000 €, gasolina 24.000 €, sin cargador, 20.000 km, 18 kWh/100 km a
    // 0,55 €/kWh, 6 l/100 km a 1,50 €/l, mantenimiento 900 € los dos, 15 años.
    // Energía EV 200·18·0,55 = 1.980 €; gasolina 200·6·1,50 = 1.800 € → uso EV 2.880 €,
    // gasolina 2.700 € → sobrecoste 180,00 €/año. Diferencia al comprar −2000,00 €.
    // Ventaja(n) = 2.000 − 180·n → año 11: +20,00 €; año 12: −160,00 € ⇒ «Más caro desde el año 12».
    // Año 15: EV 22.000 + 2.880·15 = 65.200,00 €; gasolina 24.000 + 2.700·15 = 64.500,00 €.
    await abrir(page);
    await fijar(page, {
      precioElectrico: '22.000',
      precioGasolina: '24.000',
      cargador: '0',
      kmAnuales: '20.000',
      consumoElectrico: '18',
      precioLuz: '0,55',
      consumoGasolina: '6',
      precioGasolinaLitro: '1,50',
      mantElectrico: '900',
      mantGasolina: '900',
      anios: 15,
    });
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('Más caro desde el año 12');
    await expect(estadistica(page, 0)).toContainText(/180,00\s€/);
    await expect(estadistica(page, 0)).toContainText('Sobrecoste de uso');
    await expect(estadistica(page, 1)).toContainText(/-2000,00\s€/);
    await expect(celda(page, 11, 3)).toHaveText(/^\+20,00\s€$/);
    await expect(celda(page, 12, 3)).toHaveText(/^-160,00\s€$/);
    await expect(celda(page, 15, 1)).toHaveText(/^65\.200,00\s€$/);
    await expect(celda(page, 15, 2)).toHaveText(/^64\.500,00\s€$/);
    await expect(celda(page, 15, 3)).toHaveText(/^-700,00\s€$/);
  });

  test('se rechazan el texto no numérico, el consumo negativo y una ayuda mayor que el precio', async ({ page }) => {
    // Deben rechazarse: «12abc» no es un número (parseSpanishNumber → NaN), un consumo de
    // −16 kWh no existe, y 40.000 € de ayuda superan los 35.000 € del eléctrico.
    await abrir(page);
    await fijar(page, { precioGasolina: '12abc', consumoElectrico: '-16', ayuda: '40.000' });
    await expect(botonCalcular(page)).toBeDisabled();
    const aviso = page.locator('#aviso-formulario');
    await expect(aviso).toContainText('Precio del gasolina equivalente: Escribe un número');
    await expect(aviso).toContainText('Consumo eléctrico: Tiene que ser mayor que 0.');
    await expect(aviso).toContainText('La ayuda no puede ser mayor que el precio del eléctrico.');
    await expect(page.locator('#precioGasolina')).toHaveAttribute('aria-invalid', 'true');
  });

  // HALLAZGO K (ABIERTO) — el veredicto «nunca» afirma que ningún kilometraje recupera la
  // diferencia, pero con el mantenimiento del eléctrico por encima del de gasolina el sobrecoste
  // de uso viene del mantenimiento, y MÁS kilómetros sí la recuperan.
  test('«nunca»: no afirma que ningún kilometraje recupere la diferencia cuando más km la recuperan', async ({ page }) => {
    test.fail(true, 'Hallazgo K abierto: el veredicto «nunca» da por hecho que el sobrecoste es de energía');
    // A mano, por defecto salvo mantenimiento del eléctrico 1.500 €/año y 15 años:
    // · 15.000 km: uso EV 432 + 1.500 = 1.932 €; gasolina 1.732,50 + 1.000 = 2.732,50 € →
    //   ahorro 800,50 €; 10.800/800,50 = 13,49 ⇒ «Año 14».
    // · 5.000 km: energía EV 50·16·0,18 = 144 €, gasolina 50·7·1,65 = 577,50 € → uso EV
    //   1.644 €, gasolina 1.577,50 € → sobrecoste 66,50 € ⇒ «no compensa»… pero no «con ningún
    //   kilometraje»: la misma app, con 15.000 km, lo recupera en el año 14.
    await abrir(page);
    await fijar(page, { mantElectrico: '1.500', anios: 15 });
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 14');
    await fijar(page, { kmAnuales: '5.000' });
    await expect(page.locator(TARJETA)).toContainText('El eléctrico no compensa con estos datos');
    await expect(estadistica(page, 0)).toContainText(/66,50\s€/);
    await expect(page.locator(TARJETA)).not.toContainText('ningún kilometraje');
  });

  // HALLAZGO K (ABIERTO) — mismo defecto en «se agota»: «Cuantos más kilómetros recorras, antes
  // se agota» es falso cuando el sobrecoste viene del mantenimiento.
  test('«se agota»: no dice que más km la agotan antes cuando más km la hacen crecer', async ({ page }) => {
    test.fail(true, 'Hallazgo K abierto: el veredicto «se agota» da por hecho que el sobrecoste es de energía');
    // A mano: EV 22.000 €, gasolina 24.000 €, sin cargador, mantenimiento 1.500 € (EV) y
    // 900 € (gasolina), resto por defecto, 15 años. Diferencia al comprar −2.000 €.
    // · 15.000 km: uso EV 432 + 1.500 = 1.932 €; gasolina 1.732,50 + 900 = 2.632,50 € →
    //   ahorro 700,50 € ⇒ «Desde la compra».
    // · 5.000 km: uso EV 144 + 1.500 = 1.644 €; gasolina 577,50 + 900 = 1.477,50 € →
    //   sobrecoste 166,50 €; 2.000 − 166,50·12 = +2,00; ·13 = −164,50 ⇒ «Más caro desde el año 13».
    await abrir(page);
    await fijar(page, {
      precioElectrico: '22.000',
      precioGasolina: '24.000',
      cargador: '0',
      mantElectrico: '1.500',
      mantGasolina: '900',
      anios: 15,
    });
    await calcular(page);
    await expect(page.locator(TARJETA)).toContainText('Desde la compra');
    await expect(estadistica(page, 0)).toContainText(/700,50\s€/);
    await fijar(page, { kmAnuales: '5.000' });
    await expect(page.locator(TARJETA)).toContainText('Más caro desde el año 13');
    await expect(page.locator(TARJETA)).not.toContainText('Cuantos más kilómetros recorras, antes se agota');
  });

  // HALLAZGO L (ABIERTO) — con el mismo precio de compra (diferencia 0) y el uso más caro, el
  // veredicto «nunca» dice «Cuesta más de comprar» y la métrica «(el eléctrico ya es más barato)».
  test('mismo precio de compra y uso más caro: no dice que cueste más ni que ya sea más barato', async ({ page }) => {
    test.fail(true, 'Hallazgo L abierto: con diferencia al comprar 0 el texto afirma lo contrario');
    // A mano: EV 25.000 € = gasolina 25.000 €, sin cargador, luz 1 €/kWh, resto por defecto.
    // Energía EV 150·16·1 = 2.400 € → uso 3.200 €; gasolina 2.732,50 € → sobrecoste 467,50 €.
    // Diferencia al comprar 0,00 €: ni «cuesta más de comprar» ni «ya es más barato».
    await abrir(page);
    await fijar(page, { precioElectrico: '25.000', cargador: '0', precioLuz: '1' });
    await calcular(page);
    await expect(estadistica(page, 1)).toContainText(/^0,00\s€/);
    await expect(celda(page, 1, 3)).toHaveText(/^-467,50\s€$/);
    await expect(page.locator(TARJETA)).not.toContainText('Cuesta más de comprar');
    await expect(estadistica(page, 1)).not.toContainText('ya es más barato');
  });
});

test.describe('Re-inspección 04/10/2026 · contenido', () => {
  // HALLAZGO M (ABIERTO) — RD 609/2026 (BOE-A-2026-16010), preámbulo: «el Programa MOVES, que,
  // mediante sus diversas convocatorias, ha estado vigente entre los años 2019 y 2025», y en el
  // párrafo siguiente MOVES III es el «Real Decreto 266/2021, de 13 de abril». La app atribuye a
  // MOVES III los años de todo el programa (MOVES_III_HISTORICO.vigencia = '2019-2025').
  test('no atribuye a MOVES III la vigencia 2019-2025 de todo el Programa MOVES', async ({ page }) => {
    test.fail(true, 'Hallazgo M abierto: MOVES III (RD 266/2021) no pudo estar vigente en 2019');
    await abrir(page);
    await expect(page.locator('main')).toContainText('Hoy rige el Programa Auto+');
    await expect(page.locator('main')).not.toContainText('MOVES III estuvo vigente entre 2019');
  });

  // HALLAZGO N (ABIERTO) — CLAUDE.md §2 (RAE 2010): con cuatro cifras enteras no se agrupa. El
  // FAQ, escrito a mano, pone «1.000 €», «1.500,50 €» y «1.035 €»; la app escribe «1500,50 €».
  test('el FAQ no agrupa las cifras de cuatro dígitos', async ({ page }) => {
    test.fail(true, 'Hallazgo N abierto: «1.500,50 €», «1.000 €» y «1.035 €» en el FAQPage');
    await abrir(page);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = scripts.find((t) => t.includes('FAQPage')) ?? '';
    expect(faq, 'el FAQ cita el ahorro del ejemplo por defecto').toMatch(/1\.?500,50 €/);
    expect(faq).not.toMatch(/(^|[^\d.])\d\.\d{3}(?![\d.])/);
  });
});

test.describe('Re-inspección 04/10/2026 · tecleo en escritorio', () => {
  // Sospecha del 28-30/09 (DESCARTADA): con type="number", un estado intermedio vacío hacía que
  // React escribiera «0» bajo el cursor. Aquí los campos son de texto y guardan lo tecleado.
  test('vaciar, «1», «12» y borrar: el campo nunca se rellena con «0»', async ({ page }) => {
    await abrir(page);
    await calcular(page);
    await vaciarConTeclado(page, 'kmAnuales');
    await expect(page.locator('#kmAnuales-error')).toContainText('Escribe un número');
    await teclearYVer(page, 'kmAnuales', '12');
    await pulsarYVer(page, 'kmAnuales', 'Backspace', '1');
    await pulsarYVer(page, 'kmAnuales', 'Backspace', '');
    // Vacío: no hay resultado (no se calcula con un 0 inventado).
    await expect(page.locator(RESULTADOS)).toHaveCount(0);
    await teclearYVer(page, 'kmAnuales', '15.000');
    await expect(page.locator(TARJETA)).toContainText('El eléctrico empieza a ser más barato en el año 8');
  });

  test('«1.234,56», «1.5», «1,5» y «-» se conservan tecla a tecla y se leen bien', async ({ page }) => {
    // A mano: cargador «1.234,56» → diferencia al comprar 35.000 + 1.234,56 − 25.000 = 11.234,56 €.
    // Consumo de gasolina 1,5 l/100 km (escrito «1.5» o «1,5»): energía 150·1,5·1,65 = 371,25 € →
    // uso 1.371,25 €; ahorro 1.371,25 − 1.232 = 139,25 €/año. 139,25·80 = 11.140 < 11.234,56 ≤
    // 139,25·81 = 11.279,25 ⇒ «recuperaría la diferencia en el año 81» (con 15 l saldría otro año).
    await abrir(page);
    await calcular(page);
    await vaciarConTeclado(page, 'cargador');
    await teclearYVer(page, 'cargador', '1.234,56');
    await expect(estadistica(page, 1)).toContainText(/11\.234,56\s€/);
    await vaciarConTeclado(page, 'consumoGasolina');
    await teclearYVer(page, 'consumoGasolina', '1.5');
    await expect(page.locator(TARJETA)).toContainText('recuperaría la diferencia en el año 81');
    await vaciarConTeclado(page, 'consumoGasolina');
    await teclearYVer(page, 'consumoGasolina', '1,5');
    await expect(page.locator(TARJETA)).toContainText('recuperaría la diferencia en el año 81');
    await vaciarConTeclado(page, 'mantElectrico');
    await pulsarYVer(page, 'mantElectrico', '-', '-');
    await expect(page.locator('#mantElectrico-error')).toContainText('Escribe un número');
    await pulsarYVer(page, 'mantElectrico', '1', '-1');
    await expect(page.locator('#mantElectrico-error')).toContainText('No puede ser negativo');
    await expect(botonCalcular(page)).toBeDisabled();
  });

  test('el horizonte es un <select>: con el teclado da 15 filas', async ({ page }) => {
    await abrir(page);
    await calcular(page);
    await page.locator('#anios').focus();
    await page.keyboard.press('ArrowDown'); // 10 → 15
    await esperarValorEnReact(page, '#anios', '15');
    await expect(page.locator(`${RESULTADOS} tbody tr`)).toHaveCount(15);
  });
});

for (const ancho of [800, 1024, 1280]) {
  test.describe(`Título libre del logo a ${ancho} px`, () => {
    test.use({ viewport: { width: ancho, height: 800 } });

    // Lotes 3de36a1f y a1d72a9c: 100 px arriba de 769 a 1439 px. Medido el 04/10/2026: letras
    // desde y = 97 px y piezas de la barra hasta y = 77 px a los tres anchos.
    test('ninguna letra del h1 queda bajo la barra del logo', async ({ page }) => {
      await abrir(page);
      await esperarPaginaAsentada(page);
      expect(await letrasBajoLaBarra(page)).toEqual({ barra: true, tapadas: 0 });
    });
  });
}
