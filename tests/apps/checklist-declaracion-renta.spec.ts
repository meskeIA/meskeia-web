import { readFileSync } from 'node:fs';
import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import {
  OBLIGACION_DECLARAR_2025,
  REDUCCION_TRIBUTACION_CONJUNTA_2025,
} from '../../data/fiscal/irpf';
import { LIMITES_PLAN_PENSIONES_2025 } from '../../data/fiscal/pensiones';
import { DEDUCCION_MATERNIDAD_IRPF } from '../../data/fiscal/maternidad';
import {
  ESCALA_RECARGO_EXTEMPORANEO,
  FRACCIONAMIENTO_IRPF,
} from '../../data/fiscal/recargos-sanciones';

/**
 * Inspector — checklist-declaracion-renta (segmento interactiva · fiscal, riesgo 1)
 *
 * Primera inspección: 14/11/2026. Promete en su <h1> «Checklist Declaración de la Renta 2026» y
 * en el subtítulo «Documentos organizados por perfil para la campaña del ejercicio 2025». La
 * verdad comprobable: el recuento y el progreso del checklist por perfiles, y lo normativo que
 * afirma (plazos de la campaña, obligación de declarar, deducciones). No promete guardar el
 * progreso: al recargar vuelve a 0 y eso no es un defecto.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   (.inspector-trabajo/checklist-renta-esperados.md)
 *   Items de CATEGORIAS en page.tsx: Datos personales 8 (todos) · Trabajo 6 (asalariado) ·
 *   Actividad 7 (autónomo) · Pensiones 4 (pensionista) · Inversiones 6 (inversor) · Inmuebles 8
 *   (propietario) · Deducciones 8 = 5 universales + sindicatos (asal., aut.) + alquiler habitual
 *   (asal., aut., pens.) + mutualidad (aut.).
 *   Totales: asalariado 21 · autónomo 23 · pensionista 18 · asal.+aut. 29 · aut.+pens. 27 ·
 *   asal.+inversor 27 · los cinco 47. El % es Math.round(marcados / total × 100).
 *   CASO 1 (normal): asalariado, 5 marcados → 5 de 21 = 23,81 % → 24 %; contadores 2/8, 2/6, 1/7;
 *     desmarcar el IBAN → 4 de 21 = 19,05 % → 19 %; añadir Inversor → 4 de 27 = 14,81 % → 15 %.
 *   CASO 2 (límite): los cinco perfiles, «Marcar todo» → 47/47, 100 % y mensaje de completado;
 *     «Desmarcar todo» → 0 de 47; Espacio sobre un item → 1 de 47 = 2,13 % → 2 %.
 *     Asal.+aut., marcar todo (29/29), quitar asalariado → 23 de 23 (100 %), añadir pensionista →
 *     23 de 27 = 85,19 % → 85 %: lo marcado y oculto no cuenta.
 *   CASO 3 (tratar aparte, móvil): pulsar el único perfil activo no lo desactiva (mínimo 1);
 *     solo pensionista → 0 de 18; un item → 1 de 18 = 5,56 % → 6 %.
 *
 * FUENTES (nunca la memoria)
 *   · Orden HAC/277/2026, de 25 de marzo (BOE-A-2026-7041), modelo 100 del ejercicio 2025:
 *     presentación del 8 de abril al 30 de junio de 2026 (art. 7.1); domiciliación del PAGO único
 *     o del primer plazo hasta el 25 de junio (art. 12.3); 2.º plazo del 40 % hasta el 5 de
 *     noviembre de 2026 (art. 11.5). «6 may» (teléfono) y «1 jun» (oficinas) no están en la Orden:
 *     no se comprueban.
 *   · data/fiscal: OBLIGACION_DECLARAR_2025, REDUCCION_TRIBUTACION_CONJUNTA_2025,
 *     LIMITES_PLAN_PENSIONES_2025, DEDUCCION_MATERNIDAD_IRPF, ESCALA_RECARGO_EXTEMPORANEO,
 *     SANCION_PRESENTACION_TARDIA_SIN_PERJUICIO, FRACCIONAMIENTO_IRPF.
 *   · Ley 49/2002, art. 19 (redacción del RDL 6/2023, en vigor desde el 01/01/2024): 80 % hasta
 *     250 €, 40 % el resto, 45 % por recurrencia (dos ejercicios anteriores). DA 9.ª.3: las
 *     entidades de la Iglesia Católica son beneficiarias del mecenazgo (arts. 16 a 25).
 *   · Ley 35/2006, art. 23.2 (Ley 12/2023): reducción del alquiler de vivienda 90/70/60 % con
 *     condiciones y 50 % «en cualquier otro caso».
 *
 * HALLAZGOS del 14/11/2026 (los ABIERTOS llevan test.fail())
 *   A. ABIERTO — FAQ «¿Estoy obligado…?»: 15.000 € con dos pagadores; el límite es 15.876 € y el
 *      umbral de 1.500 € es el del 2.º y restantes pagadores en conjunto.
 *   B. ABIERTO — Donativos con la escala anterior a 2024 (80 % de 150 €, 35 %, 40 % a los 3 años) y
 *      un 25 % para la Iglesia Católica: en la nota del checklist, en la FAQ y en una tarjeta.
 *   C. ABIERTO — «25 jun · Último día para domiciliar devoluciones»: se domicilia el PAGO.
 *   D. ABIERTO — Presentar tarde: «recargo del 1 % mensual… aunque salga a devolver… hasta el 20 %»
 *      y «si sale a devolver… simplemente pierdes la devolución».
 *   E. ABIERTO — Alquiler de vivienda: «aplica la reducción del 60 %» sin condiciones.
 *   F. ABIERTO — Campaña cerrada presentada como vigente (fechas sin año, «Ya puedes acceder a Renta
 *      Web desde el 8 de abril…», «Estará disponible desde el 8 de abril de 2026»).
 *   G. ABIERTO — metadata y JSON-LD: «renta 2025 (ejercicio 2024)» frente al h1 «Renta 2026» y
 *      «ejercicio 2025».
 *   H. ABIERTO — La pregunta de la conjunta está en las dos FAQ con respuestas distintas (la del
 *      JSON-LD añade «parejas de hecho» y calla los 2.150 € de la monoparental).
 *   I. ABIERTO — `features` vacía en el jsonLd.
 *   J. ABIERTO — Accesibilidad: barra de progreso sin nombre accesible; <ul> cuyos hijos son
 *      role="checkbox" (la lista pierde su semántica).
 *   K. ABIERTO — «%» pegado a la cifra («24%»).
 *   L. ABIERTO — Datos normativos tecleados que ya están en data/fiscal, sin DataReference (no lo
 *      mide este spec: es de código; los cotejos de abajo vigilan que los que hoy cuadran sigan).
 *   M. ABIERTO — Modelo 720 «sanciones de hasta el 150 %» en presente y «madres trabajadoras» en la
 *      deducción por maternidad (desde 2023 también con prestación por desempleo).
 */

const RUTA = '/checklist-declaracion-renta/';

/**
 * Un importe en euros tal como puede escribirlo la página: con o sin el punto de millar en las
 * cifras de cuatro dígitos (`Intl` en es-ES escribe «3400», el texto de la app «3.400»).
 */
const cifra = (n: number): RegExp =>
  new RegExp(`(^|[^\\d.])${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\.?')}[\\s\\u00a0]?€`);

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

function perfil(page: Page, nombre: RegExp): Locator {
  return page.getByRole('button', { name: nombre });
}

function item(page: Page, nombre: RegExp): Locator {
  return page.getByRole('checkbox', { name: nombre });
}

function textoProgreso(page: Page): Locator {
  return page.getByText(/documentos verificados$|¡Tienes todo preparado/).first();
}

function contadorCategoria(page: Page, titulo: string): Locator {
  return page
    .getByRole('heading', { name: titulo, exact: true })
    .locator('xpath=following-sibling::span[1]');
}

async function comprobarProgreso(page: Page, marcados: number, total: number, pct: number): Promise<void> {
  if (marcados === total) {
    await expect(textoProgreso(page)).toContainText('¡Tienes todo preparado para hacer la renta!');
  } else {
    await expect(textoProgreso(page)).toHaveText(`${marcados} de ${total} documentos verificados`);
  }
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(pct));
  await expect(page.getByRole('checkbox')).toHaveCount(total);
  await expect(page.locator('[role="checkbox"][aria-checked="true"]')).toHaveCount(marcados);
}

/** Texto de un nodo aunque esté dentro de la guía plegada (está en el DOM, oculto por clase). */
async function texto(loc: Locator): Promise<string> {
  return ((await loc.first().textContent()) ?? '').replace(/\s+/g, ' ').trim();
}

async function respuestaFaqVisible(page: Page, pregunta: string): Promise<string> {
  return texto(page.locator('dt', { hasText: pregunta }).locator('xpath=following-sibling::dd[1]'));
}

interface Nodo { [k: string]: unknown }

async function jsonLd(page: Page): Promise<Nodo[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
      (s) => JSON.parse(s.textContent ?? '{}') as Record<string, unknown>,
    ),
  );
}

// ──────────────────────────────────────────────────────────────────────────────
test.describe('checklist-declaracion-renta — operativa (escritorio)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 — asalariado: 5 de 21 → 24 %, desmarcar → 19 %, añadir Inversor → 15 %', async ({ page }) => {
    await expect(perfil(page, /^Asalariado/)).toHaveAttribute('aria-pressed', 'true');
    await comprobarProgreso(page, 0, 21, 0);

    for (const n of [
      /^DNI\/NIF en vigor/,
      /^Número de cuenta IBAN/,
      /^Certificado de retenciones e ingresos del trabajo/,
      /^Certificado de retenciones de otros empleadores/,
      /^Certificado de aportaciones al plan de pensiones/,
    ]) {
      await item(page, n).click();
      await expect(item(page, n)).toHaveAttribute('aria-checked', 'true');
    }
    // 5 / 21 = 23,81 % → 24
    await comprobarProgreso(page, 5, 21, 24);
    await expect(contadorCategoria(page, 'Datos personales y acceso')).toHaveText('2/8');
    await expect(contadorCategoria(page, 'Rendimientos del trabajo')).toHaveText('2/6');
    await expect(contadorCategoria(page, 'Deducciones y reducciones')).toHaveText('1/7');

    // 4 / 21 = 19,05 % → 19
    await item(page, /^Número de cuenta IBAN/).click();
    await comprobarProgreso(page, 4, 21, 19);
    await expect(contadorCategoria(page, 'Datos personales y acceso')).toHaveText('1/8');

    // Inversor suma 6 items sin marcar: 4 / 27 = 14,81 % → 15
    await perfil(page, /^Inversor/).click();
    await comprobarProgreso(page, 4, 27, 15);
    await expect(contadorCategoria(page, 'Inversiones y productos financieros')).toHaveText('0/6');
  });

  test('CASO 1 — la lista descargada lleva perfil y progreso del momento', async ({ page }) => {
    await item(page, /^DNI\/NIF en vigor/).click();
    await perfil(page, /^Inversor/).click();
    const [descarga] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Descargar lista' }).click(),
    ]);
    expect(descarga.suggestedFilename()).toBe('checklist-renta-2026.txt');
    const contenido = readFileSync(await descarga.path(), 'utf8');
    expect(contenido).toContain('Perfil: Asalariado, Inversor');
    // 1 / 27 = 3,70 % → 4 (con o sin el espacio del hallazgo K)
    expect(contenido).toMatch(/Progreso: 1\/27 \(4 ?\s?%\)/);
    expect(contenido).toContain('[✓] * DNI/NIF en vigor');
  });

  test('CASO 2 — los cinco perfiles: marcar todo 47/47 (100 %), desmarcar 0/47, Espacio 1/47', async ({ page }) => {
    for (const p of [/^Autónomo/, /^Pensionista/, /^Inversor/, /^Propietario/]) {
      await perfil(page, p).click();
      await expect(perfil(page, p)).toHaveAttribute('aria-pressed', 'true');
    }
    await comprobarProgreso(page, 0, 47, 0);

    await page.getByRole('button', { name: 'Marcar todo', exact: true }).click();
    await comprobarProgreso(page, 47, 47, 100);
    await expect(page.getByRole('alert').filter({ hasText: '¡Todo en orden!' })).toBeVisible();
    await expect(contadorCategoria(page, 'Inmuebles y rendimientos del alquiler')).toHaveText('8/8');
    await expect(contadorCategoria(page, 'Deducciones y reducciones')).toHaveText('8/8');

    await page.getByRole('button', { name: 'Desmarcar todo', exact: true }).click();
    await comprobarProgreso(page, 0, 47, 0);
    await expect(page.getByRole('alert').filter({ hasText: '¡Todo en orden!' })).toHaveCount(0);

    // Teclado: el item es role="checkbox" con tabIndex 0. 1 / 47 = 2,13 % → 2
    await item(page, /^DNI\/NIF en vigor/).focus();
    await page.keyboard.press('Space');
    await comprobarProgreso(page, 1, 47, 2);
    await page.keyboard.press('Enter');
    await comprobarProgreso(page, 0, 47, 0);
  });

  test('CASO 2 — lo marcado de un perfil retirado no cuenta: 29/29 → 23/23 → 23 de 27 (85 %)', async ({ page }) => {
    await perfil(page, /^Autónomo/).click();
    await comprobarProgreso(page, 0, 29, 0);
    await page.getByRole('button', { name: 'Marcar todo', exact: true }).click();
    await comprobarProgreso(page, 29, 29, 100);

    await perfil(page, /^Asalariado/).click();
    await expect(perfil(page, /^Asalariado/)).toHaveAttribute('aria-pressed', 'false');
    await comprobarProgreso(page, 23, 23, 100);

    // 23 / 27 = 85,19 % → 85
    await perfil(page, /^Pensionista/).click();
    await comprobarProgreso(page, 23, 27, 85);
    await expect(contadorCategoria(page, 'Pensiones y prestaciones (pensionista)')).toHaveText('0/4');
  });

  test('CASO 2 — sin persistencia prometida: al recargar vuelve a asalariado y 0 de 21', async ({ page }) => {
    await item(page, /^DNI\/NIF en vigor/).click();
    await comprobarProgreso(page, 1, 21, 5); // 1 / 21 = 4,76 % → 5
    await abrir(page);
    await comprobarProgreso(page, 0, 21, 0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
const PIXEL_7 = devices['Pixel 7'];

test.describe('checklist-declaracion-renta — CASO 3 (móvil, Pixel 7)', () => {
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test('el único perfil activo no se puede desactivar; solo pensionista → 18 items, 1 marcado → 6 %', async ({ page }) => {
    await abrir(page);
    await perfil(page, /^Asalariado/).tap();
    await expect(perfil(page, /^Asalariado/)).toHaveAttribute('aria-pressed', 'true');
    await comprobarProgreso(page, 0, 21, 0);

    await perfil(page, /^Pensionista/).tap();
    await perfil(page, /^Asalariado/).tap();
    await comprobarProgreso(page, 0, 18, 0);
    await expect(contadorCategoria(page, 'Deducciones y reducciones')).toHaveText('0/6');

    await perfil(page, /^Pensionista/).tap();
    await expect(perfil(page, /^Pensionista/)).toHaveAttribute('aria-pressed', 'true');
    await comprobarProgreso(page, 0, 18, 0);

    // 1 / 18 = 5,56 % → 6
    await item(page, /^Certificado de pensión del INSS/).tap();
    await comprobarProgreso(page, 1, 18, 6);

    const ancho = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      vista: document.documentElement.clientWidth,
    }));
    expect(ancho.doc, 'sin desbordamiento horizontal').toBeLessThanOrEqual(ancho.vista);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
test.describe('checklist-declaracion-renta — lo normativo (fuente: Orden HAC/277/2026 y data/fiscal)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('cotejos que hoy cuadran: 8 abr, 30 jun, 5 nov, 22.000 €, 3.400/2.150 €, 1.500/8.500 €, 1.200/1.000 €, 60/40 %', async ({ page }) => {
    // Orden HAC/277/2026, arts. 5.2 y 7.1
    await expect(page.getByText('Apertura Renta Web (presentación online)')).toBeVisible();
    await expect(page.getByText('8 abr', { exact: true })).toBeVisible();
    await expect(page.getByText('30 jun', { exact: true })).toBeVisible();

    const obligado = await respuestaFaqVisible(page, '¿Estoy obligado a hacer la declaración de la renta?');
    expect(obligado).toMatch(cifra(OBLIGACION_DECLARAR_2025.trabajo.unPagador));

    const conjunta = await respuestaFaqVisible(page, '¿Sale mejor la declaración individual o conjunta?');
    expect(conjunta).toMatch(cifra(REDUCCION_TRIBUTACION_CONJUNTA_2025.biparental));
    expect(conjunta).toMatch(cifra(REDUCCION_TRIBUTACION_CONJUNTA_2025.monoparental));

    const plan = await texto(item(page, /^Certificado de aportaciones al plan de pensiones/));
    expect(plan).toMatch(cifra(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual));
    expect(plan).toMatch(cifra(LIMITES_PLAN_PENSIONES_2025.limiteEmpresaAnual));

    const maternidad = await texto(page.getByText(/tienen derecho a la deducción por maternidad/));
    expect(maternidad).toMatch(cifra(DEDUCCION_MATERNIDAD_IRPF.importeAnualPorHijo));
    expect(maternidad).toMatch(cifra(DEDUCCION_MATERNIDAD_IRPF.incrementoGuarderia.importeMaximoAnual));

    // FRACCIONAMIENTO_IRPF y Orden HAC/277/2026 art. 11.5 (5 de noviembre de 2026)
    const aplazar = await respuestaFaqVisible(page, '¿Puedo aplazar el pago si la declaración sale a pagar?');
    expect(aplazar).toMatch(new RegExp(`${FRACCIONAMIENTO_IRPF.primerPlazoPct}[\\s\\u00a0]?%`));
    expect(aplazar).toMatch(new RegExp(`${FRACCIONAMIENTO_IRPF.segundoPlazoPct}[\\s\\u00a0]?%`));
    expect(aplazar).toContain('5 de noviembre de 2026');
  });

  test('A · ABIERTO — obligación de declarar con dos pagadores: 15.876 €, no 15.000 €', async ({ page }) => {
    test.fail(true, 'Hallazgo A abierto: la FAQ dice 15.000 €');
    // Asalariado con 15.500 € y un 2.º pagador de 2.000 €: 15.500 < 15.876 → no está obligado.
    const obligado = await respuestaFaqVisible(page, '¿Estoy obligado a hacer la declaración de la renta?');
    expect(obligado).toMatch(cifra(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores));
    expect(obligado).not.toContain('15.000 €');
  });

  test('B · ABIERTO — donativos (Ley 49/2002 art. 19 desde 2024): 80 % hasta 250 €, 40 % el resto', async ({ page }) => {
    test.fail(true, 'Hallazgo B abierto: 80 % de 150 €, 35 % y 25 % para la Iglesia');
    // Donativo de 250 € a una ONG: 80 % × 250 = 200 € (la app da 80 % × 150 + 35 % × 100 = 155 €)
    const nota = await texto(item(page, /^Justificantes de donaciones a ONGs/));
    expect(nota).toContain('250 €');
    expect(nota).not.toContain('primeros 150 €');
    const faq = await respuestaFaqVisible(page, '¿Cómo funciona la deducción por donaciones a ONGs?');
    expect(faq).toContain('250 €');
    expect(faq).toContain('45');
    expect(faq).not.toContain('la deducción es del 25%');
    const tarjeta = await texto(page.getByText(/Las donaciones a entidades acogidas a la Ley 49\/2002 tienen una deducción/));
    expect(tarjeta).not.toContain('primeros 150 €');
  });

  test('C · ABIERTO — el 25 de junio es el último día para domiciliar el PAGO (art. 12.3), no devoluciones', async ({ page }) => {
    test.fail(true, 'Hallazgo C abierto: «Último día para domiciliar devoluciones»');
    await expect(page.getByText('25 jun', { exact: true })).toBeVisible();
    await expect(page.getByText(/domiciliar devoluciones/)).toHaveCount(0);
    await expect(page.getByText(/domiciliar el pago/i).first()).toBeVisible();
  });

  test('D · ABIERTO — presentar tarde: 1 % + 1 % por mes, 15 % a los 12 meses; a devolver no hay recargo', async ({ page }) => {
    test.fail(true, 'Hallazgo D abierto: «1% mensual… aunque salga a devolver… hasta el 20%»');
    // Cuota de 1.000 € presentada 3 meses y 10 días tarde sin requerimiento:
    // (1 + 3) % = 40 € (ESCALA_RECARGO_EXTEMPORANEO); a devolver: multa fija de 100 € (art. 198.2).
    const aviso = await texto(page.locator('li', { hasText: 'Presentar fuera de plazo la declaración que sale a devolver' }));
    expect(aviso).toContain(`${ESCALA_RECARGO_EXTEMPORANEO.porcentajeMas12Meses}`);
    expect(aviso).not.toContain('aunque salga a devolver');
    expect(aviso).not.toContain('20%');
    const faq = await respuestaFaqVisible(page, '¿Qué pasa si no presento la declaración estando obligado?');
    expect(faq).not.toContain('simplemente pierdes la devolución');
  });

  test('E · ABIERTO — alquiler de vivienda (art. 23.2 LIRPF, Ley 12/2023): 50 % en el caso general', async ({ page }) => {
    test.fail(true, 'Hallazgo E abierto: «aplica la reducción del 60%» sin condiciones');
    // Contrato de 2024, sin rehabilitar ni zona tensionada, rendimiento neto 6.000 € → 3.000 € (no 3.600 €)
    const linea = await texto(page.locator('li', { hasText: 'Si es vivienda habitual para el inquilino' }));
    expect(linea).toMatch(/50\s?%/);
  });

  test('F · ABIERTO — campaña 2026 cerrada (30/06/2026) presentada como vigente', async ({ page }) => {
    test.fail(true, 'Hallazgo F abierto: fechas pasadas en futuro y sin año');
    await page.getByRole('button', { name: 'Marcar todo', exact: true }).click();
    const mensaje = page.getByRole('alert').filter({ hasText: '¡Todo en orden!' });
    await expect(mensaje).toBeVisible();
    // Hoy (14/11/2026) el plazo de la Orden HAC/277/2026 (8 abr – 30 jun 2026) ya terminó.
    await expect(mensaje).not.toContainText('Ya puedes acceder a Renta Web desde el 8 de abril');
    const borrador = await respuestaFaqVisible(page, '¿Qué es el borrador y cuándo estará disponible?');
    expect(borrador).not.toContain('Estará disponible desde el 8 de abril de 2026');
  });

  test('G · ABIERTO — la description dice «ejercicio 2024»; el h1 y el subtítulo, Renta 2026 y ejercicio 2025', async ({ page }) => {
    test.fail(true, 'Hallazgo G abierto');
    await expect(page.locator('h1')).toContainText('Renta 2026');
    await expect(page.getByText('campaña del ejercicio 2025')).toBeVisible();
    const descripcion = await page.locator('meta[name="description"]').getAttribute('content');
    expect(descripcion).not.toContain('ejercicio 2024');
    const app = (await jsonLd(page)).find((n) => n['@type'] === 'WebApplication');
    expect(String(app?.description)).not.toContain('ejercicio 2024');
  });

  test('H · ABIERTO — la conjunta en las dos FAQ con respuestas distintas', async ({ page }) => {
    test.fail(true, 'Hallazgo H abierto');
    const faq = (await jsonLd(page)).find((n) => n['@type'] === 'FAQPage');
    const preguntas = (faq?.mainEntity ?? []) as { name: string; acceptedAnswer: { text: string } }[];
    const jsonConjunta = preguntas.find((q) => /conjunta/.test(q.name))?.acceptedAnswer.text ?? '';
    // REDUCCION_TRIBUTACION_CONJUNTA_2025: biparental (matrimonio) 3.400 € · monoparental 2.150 €
    expect(jsonConjunta).toMatch(cifra(REDUCCION_TRIBUTACION_CONJUNTA_2025.monoparental));
    expect(jsonConjunta).not.toContain('parejas de hecho');
  });

  test('I · ABIERTO — features del JSON-LD con 4 a 8 características', async ({ page }) => {
    test.fail(true, 'Hallazgo I abierto: features: []');
    const app = (await jsonLd(page)).find((n) => n['@type'] === 'WebApplication');
    expect(((app?.featureList ?? []) as string[]).length).toBeGreaterThanOrEqual(4);
  });

  test('J · ABIERTO — accesibilidad: la barra de progreso sin nombre y la lista sin listitems', async ({ page }) => {
    test.fail(true, 'Hallazgo J abierto');
    await expect(page.getByRole('progressbar')).toHaveAccessibleName(/\S/);
    const hijosCheckbox = await page.evaluate(
      () => document.querySelectorAll('ul > [role="checkbox"], ol > [role="checkbox"]').length,
    );
    expect(hijosCheckbox).toBe(0);
  });

  test('K · ABIERTO — el porcentaje de progreso con espacio duro: «24 %»', async ({ page }) => {
    test.fail(true, 'Hallazgo K abierto: «0%» pegado');
    await expect(page.getByText(/^\d+ %$/)).toBeVisible();
  });
});
