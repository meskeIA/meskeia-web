import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * adaptacion-hogar — Inspector, primera inspección (11/11/2026), riesgo 1.
 *
 * La app es una lista de 23 adaptaciones en 6 estancias; cada una lleva coste mínimo y máximo,
 * prioridad (alta/media/baja) y si tiene ayudas. El resumen suma los mínimos y los máximos de lo
 * marcado y cuenta marcadas, prioritarias (alta), con ayuda y sin ayuda. Los esperados salen de
 * la tabla CATEGORIAS de su page.tsx, sumados a mano ANTES de abrir el navegador.
 * formatCurrency es Intl es-ES: con cuatro cifras enteras no agrupa («3000,00 €», RAE 2010) y
 * con cinco sí («10.050,00 €»): no es un defecto.
 *
 * CASOS (verde, red de regresión):
 *   1 · normal  · barras (80–300, alta, ayuda) + silla de ducha (50–200, alta) + cama articulada
 *                 (400–2.500, media, ayuda) = 530–3.000 € · 3 marcadas · 2 prioritarias · 2 con
 *                 ayuda · 1 sin ayuda.
 *   2 · límite  · las 23 marcadas: mínimos 1.060 + 510 + 850 + 650 + 6.700 + 280 = 10.050 €;
 *                 máximos 4.050 + 2.950 + 3.200 + 4.000 + 18.800 + 1.800 = 34.800 € · 13 de
 *                 prioridad alta · 11 con ayuda · 12 sin ella.
 *   3 · neutro  · marcar y desmarcar devuelve el mensaje de lista vacía, sin «0,00 € – 0,00 €».
 *   Cabo C0465  · la casilla es un checkbox nativo con nombre (aria-label) y cada gesto la conmuta
 *                 UNA vez: clic en el texto de la fila, clic en la casilla y Tab + Espacio.
 *
 * HALLAZGOS — ABIERTOS (cada uno con su test.fail(), que afirma lo que la app DEBE hacer):
 *   H1 (alto)  · Tabla de ayudas: «Prestación vinculada a servicio (SAAD) · Hasta 833 €/mes
 *                (Grado III)». data/fiscal/dependencia.ts (anexo IV del RD 1051/2013, redacción
 *                del RD 675/2023): 747,25 €/mes; y esa prestación va vinculada a un servicio del
 *                catálogo del art. 15.1 de la Ley 39/2006, donde no hay ninguno de obras: la
 *                adaptación del hogar es la subvención de su disposición adicional 3.ª.
 *   H2 (alto)  · «Plan de Vivienda (Estatal) · 40%-80% del coste · Discapacidad/dependencia
 *                acreditada». RD 326/2026 (BOE-A-2026-8872): art. 99.2.b, 70 % (80 % si reside
 *                alguien con discapacidad ≥ 33 % o mayor de 65); art. 108.1, hasta el 80 %; los
 *                beneficiarios (arts. 96.1 y 105.1) no exigen discapacidad ni dependencia.
 *   H3 (medio) · FAQ «¿Se pueden hacer obras en un piso de alquiler?»: «con el consentimiento del
 *                propietario». LAU art. 24 (BOE-A-1994-26003): previa notificación escrita, sin
 *                consentimiento; discapacidad o más de setenta años; reponer si lo exige el
 *                arrendador al terminar.
 *   H4 (medio) · Costes que se contradicen en la misma página: la FAQ visible dice barras
 *                500-1.500 € (la lista suma 80–300), y el FAQPage silla 2.000–6.000 € y
 *                plataforma 5.000–15.000 € (la lista, 2.500–6.000 y 4.000–12.000).
 *   H5 (bajo)  · «Eliminar o fijar alfombras» (0–50 €) se pinta «Sin coste» y el total sube 50 €.
 *   H6 (bajo)  · Cabo C0465: 23 <label> sin control que envuelven dos <div> cada uno.
 *   H7 (bajo)  · features del JSON-LD vacía.
 *   H8 (bajo)  · Textos: «1 de tus adaptaciones pueden ser elegibles», «la lista de la izquierda»
 *                en móvil (va encima), «%» pegado a la cifra y «cambia de bañera a ducha».
 */

const RUTA = '/adaptacion-hogar/';

/** innerText con los espacios duros de Intl pasados a espacio normal. */
const limpiar = (s: string): string => s.replace(/ /g, ' ').replace(/[ \t]+/g, ' ');

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[type="checkbox"]']);
}

const casilla = (page: Page, nombre: string): Locator =>
  page.getByRole('checkbox', { name: nombre, exact: true });

const tarjetaResumen = (page: Page): Locator =>
  page.getByRole('heading', { name: 'Resumen de tu plan' }).locator('..');

async function textoResumen(page: Page): Promise<string> {
  return limpiar(await tarjetaResumen(page).innerText());
}

/** La cifra de una de las cuatro estadísticas del resumen, por su rótulo. */
async function cifra(page: Page, rotulo: string): Promise<string> {
  const bloque = tarjetaResumen(page).getByText(rotulo, { exact: true }).locator('..');
  return (await bloque.innerText()).replace(rotulo, '').trim();
}

async function abrirGuia(page: Page): Promise<string> {
  await page.getByRole('button', { name: /Ver guía educativa/ }).click();
  return limpiar(await page.locator('body').innerText());
}

/** Los bloques JSON-LD de la página, ya parseados. */
async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.map((t) => JSON.parse(t) as Record<string, unknown>);
}

test.beforeEach(async ({ page }) => {
  await abrir(page);
});

test('CASO 1 (normal) · barras + silla de ducha + cama articulada = 530–3000 €', async ({ page }) => {
  // CATEGORIAS: barras 80–300 (alta, ayuda) · silla 50–200 (alta, sin ayuda) ·
  // cama 400–2500 (media, ayuda). 80 + 50 + 400 = 530 · 300 + 200 + 2500 = 3000.
  for (const n of ['Barras de apoyo en ducha y WC', 'Silla o asiento de ducha', 'Cama articulada o ajustable']) {
    await casilla(page, n).check();
  }
  const texto = await textoResumen(page);
  expect(texto).toContain('530,00 € – 3000,00 €');
  expect(await cifra(page, 'Adaptaciones seleccionadas')).toBe('3');
  expect(await cifra(page, 'Prioritarias')).toBe('2');
  expect(await cifra(page, 'Con ayudas posibles')).toBe('2');
  expect(await cifra(page, 'Sin ayudas específicas')).toBe('1');
  expect(texto).toContain('2 de tus adaptaciones pueden ser elegibles');
  expect(texto).toContain('Detalle de adaptaciones (3)');
  expect(texto).toContain('Cama articulada o ajustable\n400,00 €–2500,00 €');
});

test('CASO 2 (límite) · las 23 marcadas = 10.050–34.800 €, 13 prioritarias, 11 con ayuda', async ({ page }) => {
  // Mínimos por estancia: baño 1060 · dormitorio 510 · cocina 850 · accesos 650 ·
  // escaleras 6700 · seguridad 280 = 10.050. Máximos: 4050 · 2950 · 3200 · 4000 · 18.800 ·
  // 1800 = 34.800. Prioridad alta: 4 + 2 + 0 + 2 + 3 + 2 = 13. Con ayuda: 2 + 1 + 1 + 3 + 3 + 1 = 11.
  const todas = page.getByRole('checkbox');
  await expect(todas).toHaveCount(23);
  for (let i = 0; i < 23; i++) await todas.nth(i).check();
  const texto = await textoResumen(page);
  expect(texto).toContain('10.050,00 € – 34.800,00 €');
  expect(await cifra(page, 'Adaptaciones seleccionadas')).toBe('23');
  expect(await cifra(page, 'Prioritarias')).toBe('13');
  expect(await cifra(page, 'Con ayudas posibles')).toBe('11');
  expect(await cifra(page, 'Sin ayudas específicas')).toBe('12');
  // Cinco cifras sí agrupan: la plataforma elevadora llega a 12.000
  expect(texto).toContain('Plataforma elevadora vertical\n4000,00 €–12.000,00 €');
});

test('CASO 3 (neutro) · marcar y desmarcar devuelve la lista vacía, sin un total a cero', async ({ page }) => {
  const resumen = tarjetaResumen(page);
  await expect(resumen.getByText('Marca las adaptaciones que necesitas')).toBeVisible();
  const barras = casilla(page, 'Barras de apoyo en ducha y WC');
  await barras.check();
  await expect(resumen.getByText('Coste total orientativo')).toBeVisible();
  await barras.uncheck();
  await expect(resumen.getByText('Marca las adaptaciones que necesitas')).toBeVisible();
  await expect(resumen.getByText('Coste total orientativo')).toHaveCount(0);
  expect(await textoResumen(page)).not.toContain('0,00 €');
});

test.describe('Cabo C0465 · casillas de la lista', () => {
  test('cada casilla es un checkbox con el nombre de su adaptación', async ({ page }) => {
    await expect(page.getByRole('checkbox')).toHaveCount(23);
    await expect(casilla(page, 'Barras de apoyo en ducha y WC')).toHaveCount(1);
    await expect(casilla(page, 'Plataforma elevadora vertical')).toHaveCount(1);
  });

  test('un clic en el TEXTO de la fila conmuta una sola vez', async ({ page }) => {
    const texto = page.getByText('Barras de apoyo en ducha y WC', { exact: true }).first();
    await texto.click();
    await expect(casilla(page, 'Barras de apoyo en ducha y WC')).toBeChecked();
    expect(await cifra(page, 'Adaptaciones seleccionadas')).toBe('1');
    await texto.click();
    await expect(casilla(page, 'Barras de apoyo en ducha y WC')).not.toBeChecked();
  });

  test('un clic directo en la CASILLA conmuta una sola vez (no la fila y el change a la vez)', async ({ page }) => {
    const silla = casilla(page, 'Silla o asiento de ducha');
    await silla.click();
    await expect(silla).toBeChecked();
    expect(await cifra(page, 'Adaptaciones seleccionadas')).toBe('1');
    await silla.click();
    await expect(silla).not.toBeChecked();
  });

  test('con teclado: Tab llega a la casilla y Espacio la marca y desmarca', async ({ page }) => {
    await page.getByRole('heading', { name: 'Selecciona las adaptaciones que necesitas' }).click();
    await page.keyboard.press('Tab');
    await expect(casilla(page, 'Barras de apoyo en ducha y WC')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(casilla(page, 'Barras de apoyo en ducha y WC')).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(casilla(page, 'Silla o asiento de ducha')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(casilla(page, 'Silla o asiento de ducha')).toBeChecked();
    expect(limpiar(await textoResumen(page))).toContain('130,00 € – 500,00 €');
    await page.keyboard.press('Space');
    await expect(casilla(page, 'Silla o asiento de ducha')).not.toBeChecked();
  });

  test('HALLAZGO H6 (11/11/2026, ABIERTO) · ninguna fila lleva un <label> sin control', async ({ page }) => {
    // Hoy las 23 filas llevan <label> sin htmlFor ni control dentro, con dos <div> (un label
    // solo admite contenido de frase). Arreglo del cabo: cambiarlo por <div> (la casilla ya se
    // nombra con aria-label) o htmlFor + quitar el onClick de la fila; los casos de arriba
    // vigilan que cada gesto siga conmutando una vez.
    test.fail();
    const huerfanos = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('input[type="checkbox"] + label')).filter(
          (l) => !(l as HTMLLabelElement).control,
        ).length,
    );
    expect(huerfanos).toBe(0);
  });
});

test('HALLAZGO H5 (11/11/2026, ABIERTO) · «Eliminar o fijar alfombras» no dice «Sin coste» si suma 50 €', async ({ page }) => {
  // CATEGORIAS: costeMin 0, costeMax 50. La fila y el detalle dicen «Sin coste» (miran solo el
  // mínimo) y el total dice «0,00 € – 50,00 €». Lo que se pinta por fila tiene que cuadrar con
  // lo que suma.
  test.fail();
  const alfombras = casilla(page, 'Eliminar o fijar alfombras');
  await alfombras.check();
  const fila = limpiar(await alfombras.locator('..').innerText());
  const resumen = await textoResumen(page);
  if (fila.includes('Sin coste')) {
    expect(resumen).toContain('0,00 € – 0,00 €');
  } else {
    expect(fila).toMatch(/50(,00)? €/);
  }
});

test('HALLAZGO H1 (11/11/2026, REPARADO) · la prestación vinculada no se ofrece como ayuda de obras ni con 833 €/mes', async ({ page }) => {
  // data/fiscal/dependencia.ts, PRESTACIONES_DEPENDENCIA_2025 (anexo IV del RD 1051/2013,
  // cotejado con BOE-A-2013-13811): vinculada al servicio, grado III = 747,25 €/mes. Ley
  // 39/2006, art. 17.2: «en todo caso, vinculada a la adquisición de un servicio» (cotejado en
  // el BOE el 11/11/2026); las adaptaciones del hogar son las ayudas de su disposición
  // adicional 3.ª, letra b, con carácter de subvención. Ahora la cifra sale de cuantiaMaximaPEVS(3)
  // y la fila dice que va a un servicio, no a obras; la DA 3.ª tiene su propia fila.
  const texto = await abrirGuia(page);
  expect(texto).not.toContain('833 €/mes');
  expect(texto).not.toContain('servicio de adaptación del entorno');
  expect(texto).toContain('Hasta 747,25 €/mes en grado III');
  expect(texto).toContain('disposición adicional 3.ª');
  // Datos con caducidad → DataReference tras el aviso
  await expect(page.getByText(/Ley 39\/2006 LAPAD/).first()).toBeVisible();
});

test('HALLAZGO H2 (11/11/2026, REPARADO) · el Plan Estatal de Vivienda no exige discapacidad ni cubre «40-80 %»', async ({ page }) => {
  // RD 326/2026, Plan Estatal de Vivienda 2026-2030 (BOE-A-2026-8872, cotejado el 11/11/2026):
  // art. 99.2.b, «El 70 % del coste de la actuación», hasta el 80 % si reside una persona con
  // discapacidad o mayor de 65; art. 108.1, hasta el 80 % dentro de la vivienda; arts. 96.1 y
  // 105.1, beneficiarios sin requisito de discapacidad ni dependencia (solo suben la cuantía).
  // No hay módulo de data/fiscal para este programa: la app ya no da porcentajes y remite a la
  // convocatoria, y dice quién puede pedirla.
  const texto = await abrirGuia(page);
  expect(texto).not.toContain('40%-80% del coste');
  expect(texto).not.toContain('40-80% del coste');
  expect(texto).not.toContain('Discapacidad/dependencia acreditada');
  expect(texto).not.toContain('subvención 60%');
  expect(texto).toContain('no exige discapacidad');
});

test('HALLAZGO H3 (11/11/2026, REPARADO) · obras en alquiler: notificación escrita, no consentimiento (LAU art. 24)', async ({ page }) => {
  // Ley 29/1994, art. 24.1 (BOE-A-1994-26003, cotejado el 11/11/2026): el arrendatario, «previa
  // notificación escrita al arrendador», puede hacer las obras necesarias por discapacidad o
  // edad superior a setenta años (suya, de su cónyuge o pareja o de familiares que convivan);
  // art. 24.2: al terminar, «reponer la vivienda al estado anterior, si así lo exige el arrendador».
  const texto = await abrirGuia(page);
  expect(texto).not.toContain('con el consentimiento del propietario');
  expect(texto).toMatch(/notificárselo antes por escrito/);
  expect(texto).toMatch(/setenta años/);
  expect(texto).toMatch(/reponer la vivienda/);
});

test('HALLAZGO H4 (11/11/2026, ABIERTO) · las FAQ no contradicen los costes que suma la lista', async ({ page }) => {
  // La lista suma barras 80–300 €, silla salvaescaleras 2500–6000 € y plataforma 4000–12.000 €.
  // FAQ visible: «Barras de seguridad en baño (500-1.500 €)», «sillas salvaescaleras
  // (3.000-10.000 €)». FAQPage: silla «2.000–6.000 €», plataforma «5.000–15.000 €».
  test.fail();
  const texto = await abrirGuia(page);
  expect(texto).not.toContain('Barras de seguridad en baño (500-1.500 €)');
  expect(texto).not.toContain('(3.000-10.000 €)');
  const faq = JSON.stringify((await jsonLd(page)).find((b) => b['@type'] === 'FAQPage'));
  expect(faq).not.toContain('2.000–6.000 €');
  expect(faq).not.toContain('5.000–15.000 €');
});

test('HALLAZGO H7 (11/11/2026, ABIERTO) · features del JSON-LD con al menos 4 características', async ({ page }) => {
  test.fail();
  const app = (await jsonLd(page)).find((b) => b['@type'] === 'WebApplication');
  expect(app).toBeTruthy();
  expect(((app?.featureList as unknown[]) ?? []).length).toBeGreaterThanOrEqual(4);
});

test.describe('HALLAZGO H8 (11/11/2026, ABIERTO) · textos', () => {
  test('con una sola adaptación con ayuda, la frase concuerda en singular', async ({ page }) => {
    test.fail();
    await casilla(page, 'Barras de apoyo en ducha y WC').check();
    expect(await textoResumen(page)).not.toContain('1 de tus adaptaciones pueden ser elegibles');
  });

  test('en móvil la lista va ENCIMA del resumen, no «a la izquierda»', async ({ page }) => {
    test.fail();
    await page.setViewportSize({ width: 390, height: 844 });
    await abrir(page);
    const lista = await page.getByRole('heading', { name: 'Selecciona las adaptaciones que necesitas' }).boundingBox();
    const resumen = await page.getByRole('heading', { name: 'Resumen de tu plan' }).boundingBox();
    expect(lista && resumen && lista.y < resumen.y).toBe(true);
    expect(await textoResumen(page)).not.toContain('de la izquierda');
  });

  test('el «%» va separado de la cifra (Ortografía de la RAE, 2010)', async ({ page }) => {
    // Hoy: «40-80%», «40%-80%», «100%», «10-30%», «≥33%», «10% en lugar de 21%», «60%»…
    // Se mira solo la guía de la app (el abuelo del botón), no los componentes compartidos.
    test.fail();
    await abrirGuia(page);
    const guia = page.getByRole('button', { name: /Ocultar guía educativa/ }).locator('../..');
    await expect(guia).toContainText('Comparativa: Ayudas disponibles');
    expect(limpiar(await guia.innerText())).not.toMatch(/\d%/);
  });

  test('FAQPage: «cambio de bañera a ducha», no «cambia»', async ({ page }) => {
    test.fail();
    const faq = JSON.stringify((await jsonLd(page)).find((b) => b['@type'] === 'FAQPage'));
    expect(faq).not.toContain('cambia de bañera a ducha');
  });
});
