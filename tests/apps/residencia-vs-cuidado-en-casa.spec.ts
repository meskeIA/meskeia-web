import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Residencia vs Cuidado en Casa — regresión del comparador de costes de cuidados.
 *
 * QUÉ PROMETE (leído el 21/09/2026)
 *   · <h1>: «Residencia vs Cuidado en Casa».
 *   · Subtítulo: «Compara costes y factores de las opciones de cuidado para mayores · 2025».
 *   · <title> y openGraph: «Residencia vs Cuidado en Casa - Comparativa de costes».
 *   · description: «Compara los costes orientativos de residencia privada, servicio de ayuda
 *     a domicilio (SAD) y cuidador en casa para elegir la opción de cuidado más adecuada».
 *   · En pantalla: <RegionBadge variant="es-only" />, <LegalNotice /> y <DisclaimerCard
 *     variant="financial" severity="critical"> (nivel 1, NO colapsable). NO monta
 *     <DataReference> pese a anunciar «medias nacionales 2025» y citar cuantías del SAAD.
 *
 * DE DÓNDE SALEN LOS NÚMEROS — de la propia app, NO de `data/fiscal/` (esto es hallazgo):
 * `calcularOpciones(horas, grado)` en `page.tsx` no importa nada de `@/data/fiscal` y fija a
 * mano todas las cuantías. Las fórmulas, tal como están escritas hoy:
 *   · Residencia privada  → 1.600 – 3.200 €/mes, constante (no depende de nada).
 *   · SAD en domicilio    → mín = horas × 18 €/h × 22 días · máx = horas × 22 × 26.
 *     (el `precioHoraSAD = 18` declarado solo interviene en el extremo bajo; el extremo alto
 *      mezcla otro precio con otro número de días, y el comentario del código dice usar 26).
 *   · Cuidador en casa    → tres tramos por horas/día:
 *         h ≤ 4  «Auxiliar a tiempo parcial»           mín = h × 16 × 22 · máx = h × 20 × 22
 *         4 < h ≤ 8 «Auxiliar a jornada completa»      1.750 – 2.200 €/mes (planos)
 *         h > 8  «Cuidador interno (incluye alojamiento)» 1.300 – 1.700 €/mes (planos)
 *   · La insignia «Más económica» va a la opción de MENOR extremo inferior.
 *   · El grado de dependencia NO entra en ningún número: solo cambia textos.
 *
 * El contraste normativo se hace contra `data/fiscal/smi.ts` (`SMI_2025.mensual12` = 1.381,33 €
 * y `SMI_2026.mensual12` = 1.424,50 €, RD 87/2025 y RD 126/2026) y contra
 * `data/fiscal/dependencia.ts` (`PRESTACIONES_DEPENDENCIA_2025`), que la app ignora.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 — NORMAL (3 h/día de ayuda, Grado II reconocido)
 *       Residencia → 1.600,00 – 3.200,00 €/mes (constante).
 *       SAD        → 3 × 18 × 22 = 1.188 € · 3 × 22 × 26 = 1.716 €.
 *       Cuidador   → 3 ≤ 4 → tramo parcial: 3 × 16 × 22 = 1.056 € · 3 × 20 × 22 = 1.320 €.
 *       Extremos inferiores 1.600 / 1.188 / 1.056 → la insignia va al auxiliar parcial.
 *       Discrimina la fórmula: si el SAD usara 26 días también en el mínimo saldrían 1.404 €,
 *       y si el auxiliar usara el precio del SAD saldrían 1.188 €. Por eso el euro exacto.
 *
 *   CASO 2 — EL LÍMITE (24 h/día, Grado III) y la frontera de los tramos
 *       24 h/día → SAD 24 × 18 × 22 = 9.504 € · 24 × 22 × 26 = 13.728 €.
 *       Cuidador → 24 > 8 → interno 1.300 – 1.700 €/mes, y se lleva la insignia por ser
 *       1.300 < 1.600 (residencia) < 9.504 (SAD).
 *       ⚠️ DOS HALLAZGOS que este caso fija para que cualquier reparación rompa el test:
 *         (a) 1.300 €/mes queda POR DEBAJO del SMI en cómputo mensual (1.381,33 € en 2025 y
 *             1.424,50 € en 2026, `SMI_*.mensual12`), antes de cotización alguna, y el código
 *             lo describe como «coste total empleador». Y una sola persona no puede cubrir
 *             24 h/día: la app corona esa opción como la más barata justo en el escenario de
 *             gran dependencia.
 *         (b) el coste del cuidador DECRECE al pedir más horas: con 8 h/día son 1.750 €/mes
 *             y con 24 h/día, 1.300 €/mes. Más cuidado por menos dinero.
 *
 *   CASO 3 — LO QUE DEBE RECHAZARSE (0 h y 25 h) y lo que NO rechaza
 *       0 h y 25 h están fuera de [1, 24] → aviso «Introduce las horas de cuidado al día
 *       (entre 1 y 24).» ⚠️ HALLAZGO: el aviso NO retira la comparativa anterior, que sigue
 *       en pantalla con los importes de las 3 h del paso previo.
 *       ⚠️ HALLAZGO del parseo: `comparar()` usa `parseFloat(horas.replace(',', '.'))` en vez
 *       de `parseSpanishNumber`, así que «1.500» (mil quinientas horas, formato español) se
 *       lee como 1,5 h y la app calcula 1,5 × 18 × 22 = 594 € en lugar de rechazarlo. De paso
 *       rotula «(1.5h/día)», con punto decimal inglés.
 *
 * ⚠️ `formatCurrency` (es-ES) separa el millar SOLO a partir de cinco dígitos enteros: imprime
 *    «1600,00 €» sin punto y «13.728,00 €» con él. El espacio antes del € es U+00A0, así que
 *    el texto se normaliza antes de comparar.
 */

const RUTA = '/residencia-vs-cuidado-en-casa/';
const HORAS = 'input[aria-label="Horas de cuidado necesarias al día"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'load' });
  await esperarHidratacion(page, [HORAS]);
}

/** Una tarjeta de opción, por el nombre que imprime su cabecera. */
function tarjeta(page: Page, nombre: string | RegExp) {
  return page.locator('[class*="opcionCard"]').filter({ hasText: nombre });
}

/** El rango de coste de una tarjeta, con el NBSP de `formatCurrency` ya normalizado. */
async function coste(page: Page, nombre: string | RegExp): Promise<string> {
  const texto = await tarjeta(page, nombre).locator('[class*="opcionCoste"]').innerText();
  return texto.replace(/ /g, ' ').trim();
}

/** El aviso de la app. NO vale `getByRole('alert')`: aquí ese rol lo tienen también el
 *  DisclaimerCard crítico y el anunciador de rutas de Next. */
function aviso(page: Page) {
  return page.locator('[class*="errorMsg"]');
}

async function comparar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Comparar opciones' }).click();
}

test.describe('Residencia vs Cuidado en Casa', () => {
  test('CASO 1 — 3 h/día con Grado II: 1.188 € de SAD y la insignia en el auxiliar parcial', async ({ page }) => {
    await abrir(page);

    // El campo arranca en 4 y el grado en «No valorado»: las dos siembras cambian el estado.
    await sembrarValor(page, HORAS, '3');
    await page.selectOption('#gradoDep', 'grado2');
    await comparar(page);

    // Constante del motor: no depende de las horas ni del grado.
    expect(await coste(page, 'Residencia privada')).toBe('1600,00 € – 3200,00 €/mes');
    // 3 × 18 €/h × 22 días = 1.188 · 3 × 22 × 26 = 1.716
    expect(await coste(page, /SAD en domicilio/)).toBe('1188,00 € – 1716,00 €/mes');
    // Tramo parcial (3 ≤ 4): 3 × 16 × 22 = 1.056 · 3 × 20 × 22 = 1.320
    expect(await coste(page, 'Auxiliar a tiempo parcial')).toBe('1056,00 € – 1320,00 €/mes');

    // La cabecera del SAD lleva las horas pedidas.
    await expect(tarjeta(page, /SAD en domicilio/)).toContainText('SAD en domicilio (3h/día)');

    // «Más económica» = menor extremo inferior (1.056 < 1.188 < 1.600).
    await expect(tarjeta(page, 'Auxiliar a tiempo parcial').locator('[class*="opcionBadge"]')).toHaveText('Más económica');
    await expect(tarjeta(page, 'Residencia privada').locator('[class*="opcionBadge"]')).toHaveCount(0);
    await expect(tarjeta(page, /SAD en domicilio/).locator('[class*="opcionBadge"]')).toHaveCount(0);

    // El grado solo mueve textos, nunca importes.
    await expect(tarjeta(page, /SAD en domicilio/)).toContainText('Con Grado 2 reconocido');
    // ⚠️ HALLAZGO: la nota de ayudas públicas se imprime en las dos opciones de domicilio y
    // NUNCA en la residencia, aunque la PEVS de `PRESTACIONES_DEPENDENCIA_2025` (833,96 €/mes
    // en Grado III) también se destina a plaza residencial.
    await expect(tarjeta(page, 'Residencia privada').locator('[class*="notaPublica"]')).toHaveCount(0);
  });

  test('CASO 2 — 24 h/día con Grado III: el interno sale a 1.300 €/mes y se lleva la insignia', async ({ page }) => {
    await abrir(page);

    await sembrarValor(page, HORAS, '24');
    await page.selectOption('#gradoDep', 'grado3');
    await comparar(page);

    // 24 × 18 × 22 = 9.504 · 24 × 22 × 26 = 13.728 (cinco cifras: aquí sí hay punto de millar)
    expect(await coste(page, /SAD en domicilio/)).toBe('9504,00 € – 13.728,00 €/mes');
    expect(await coste(page, 'Residencia privada')).toBe('1600,00 € – 3200,00 €/mes');

    // ⚠️ HALLAZGO (a): importe plano por debajo del SMI mensual (1.381,33 € en 2025 /
    // 1.424,50 € en 2026, `SMI_*.mensual12` de data/fiscal/smi.ts) descrito como coste TOTAL
    // del empleador, y coronado «Más económica» en el escenario de 24 h de gran dependencia.
    // Se fija el valor de hoy para que la reparación rompa este test.
    expect(await coste(page, 'Cuidador interno (incluye alojamiento)')).toBe('1300,00 € – 1700,00 €/mes');
    await expect(
      tarjeta(page, 'Cuidador interno (incluye alojamiento)').locator('[class*="opcionBadge"]'),
    ).toHaveText('Más económica');

    // ⚠️ HALLAZGO (b): con 8 h/día el mismo concepto cuesta MÁS que con 24 h/día.
    await sembrarValor(page, HORAS, '8');
    await comparar(page);
    expect(await coste(page, 'Auxiliar a jornada completa')).toBe('1750,00 € – 2200,00 €/mes');
    // 8 × 18 × 22 = 3.168 · 8 × 22 × 26 = 4.576
    expect(await coste(page, /SAD en domicilio/)).toBe('3168,00 € – 4576,00 €/mes');
    // Con 8 h la más barata pasa a ser la residencia (1.600 < 1.750 < 3.168).
    await expect(tarjeta(page, 'Residencia privada').locator('[class*="opcionBadge"]')).toHaveText('Más económica');
  });

  test('CASO 3 — 0 h y 25 h se avisan, pero «1.500» se cuela como 1,5 h', async ({ page }) => {
    await abrir(page);

    // Primero una comparación válida, para poder ver qué hace el aviso con lo ya calculado.
    await sembrarValor(page, HORAS, '3');
    await comparar(page);
    expect(await coste(page, /SAD en domicilio/)).toBe('1188,00 € – 1716,00 €/mes');

    // 0 está fuera de [1, 24]: la app avisa.
    await sembrarValor(page, HORAS, '0');
    await comparar(page);
    await expect(aviso(page)).toBeVisible();
    await expect(aviso(page)).toHaveAttribute('role', 'alert');
    await expect(aviso(page)).toContainText('Introduce las horas de cuidado al día (entre 1 y 24).');
    // ⚠️ HALLAZGO: el aviso convive con la comparativa anterior, que sigue entera en pantalla
    // con los importes de las 3 h del paso previo. Se fija para que retirarla rompa el test.
    expect(await coste(page, /SAD en domicilio/)).toBe('1188,00 € – 1716,00 €/mes');

    // 25 está fuera por arriba: mismo aviso.
    await sembrarValor(page, HORAS, '25');
    await comparar(page);
    await expect(aviso(page)).toContainText('entre 1 y 24');

    // ⚠️ HALLAZGO del parseo: «1.500» son mil quinientas horas en español —fuera de rango—,
    // pero `parseFloat('1.500')` da 1,5 y la app calcula: 1,5 × 18 × 22 = 594 €, 1,5 × 22 × 26
    // = 858 €. Con `parseSpanishNumber` (el parser canónico) saldría 1.500 y se rechazaría.
    await sembrarValor(page, HORAS, '1.500');
    await comparar(page);
    await expect(aviso(page)).toHaveCount(0);
    expect(await coste(page, /SAD en domicilio/)).toBe('594,00 € – 858,00 €/mes');
    // Y el rótulo escribe el decimal con punto inglés, no con coma española.
    await expect(tarjeta(page, /SAD en domicilio/)).toContainText('SAD en domicilio (1.5h/día)');
  });

  test('las piezas obligatorias de una app de riesgo 1', async ({ page }) => {
    await abrir(page);

    // DisclaimerCard nivel 1 CRÍTICO: role="alert" y NUNCA colapsable.
    const disclaimer = page.locator('[class*="severity-critical"]').first();
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toHaveAttribute('role', 'alert');
    await expect(disclaimer).toContainText('estimaciones orientativas');
    expect(await disclaimer.locator('details, summary, button').count()).toBe(0);

    // LegalNotice.
    await expect(page.getByRole('link', { name: 'Política de Privacidad' }).first()).toBeVisible();

    // RegionBadge es-only: la app es de normativa española.
    await expect(page.locator('body')).toContainText('Solo España');

    await expect(page.locator('h1')).toHaveText('Residencia vs Cuidado en Casa');

    // ⚠️ HALLAZGO: NO hay <DataReference>, aunque la app fecha sus datos en 2025 y su FAQ cita
    // cuantías del SAAD. Por eso aquí se comprueba su AUSENCIA: cuando se monte, este test
    // avisará de que hay que sustituirlo por la comprobación del sello de verificación.
    await expect(page.locator('[aria-label="Datos de referencia normativos"]')).toHaveCount(0);
  });
});
