import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — calculadora-propinas (segmento fiscal, riesgo 1)
 *
 * Primera inspección: 14/11/2026. La app promete en su <h1> «Calculadora de Propinas» y en el
 * subtítulo «Calcula la propina automáticamente según el país y divide la cuenta entre varias
 * personas». Hay verdad comprobable: propina = cuenta × % / 100 · total = cuenta + propina ·
 * por persona = total / personas (app/calculadora-propinas/page.tsx, sin motor aparte).
 * Su única dependencia de data/fiscal es SMI_2026 (data/fiscal/smi.ts), que solo se cita en la FAQ
 * «España y EEUU»: 1.221 €/mes en 14 pagas, cotejado con el art. 1 del RD 126/2026
 * (BOE-A-2026-3815: «40,70 euros/día o 1 221 euros/mes»; anual 17 094 €).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/propinas-explorar.mjs)
 *   CASO 1 (normal)
 *     60 €, botón 10 %, 4 personas → propina 6,00 € · total 66,00 € · por persona 16,50 €
 *       (el ejemplo de la pregunta 3 del FAQPage: 60 + 6 = 66; 66 / 4 = 16,50)
 *     48 € al 15 % (por defecto) → 48 × 0,15 = 7,20 € · total 55,20 € (pregunta 2 del FAQPage)
 *     45 € al 15 % → 6,75 € · total 51,75 € (el «Truco del 10 %» del bloque educativo: 4,50 + 2,25)
 *     «45,5» al 10 % → 4,55 € · total 50,05 € (coma decimal)
 *   CASO 2 (límite)
 *     Estado inicial (0 €) → 0,00 € en las tres tarjetas, sin «Por persona» (1 persona)
 *     Japón (0 %), 100 € → propina 0,00 € · total 100,00 €
 *     60 personas → se topa en 50; 100 € al 10 % = 110 € / 50 = 2,20 €
 *     0 personas → aria-invalid y se usa 1 (min del campo)
 *   CASO 3 (rechazo)
 *     cuenta -50 € → aviso o 0; nunca propina -7,50 € ni total -57,50 €
 *     porcentaje -10 → nunca una «propina» de -10,00 € que rebaja la cuenta
 *     porcentaje 150 (el campo declara max=100) → topado o aviso; nunca 150,00 € en silencio
 *     «1.234,56» al 10 % → cuenta 1234,56 € · propina 123,46 € · total 1358,02 €
 *       (es-ES no agrupa cuatro cifras: «1358,02 €» no es un defecto)
 *
 * HALLAZGOS del 14/11/2026 (los abiertos llevan test.fail())
 *   A. La cuenta y el porcentaje son <input type="number"> leídos con parseFloat: «1.234,56» queda
 *      en «1.23456» y la cuenta pasa a 1,23 €; «1.500» a 1,50 €. La ficha promete «Formato español».
 *   B. Sin validación: cuenta negativa, porcentaje negativo y porcentaje > 100 se calculan sin aviso.
 *   C. Las preferencias no recuerdan un 0 %: con Japón guardado, al volver el desplegable dice
 *      «Japón (0% - No propina)» y se calcula al 15 % (`if (datos.porcentaje)` descarta el 0).
 *   D. Formato de salida: la tarjeta escribe «12.5%» (punto decimal) y todos los «%» van pegados.
 *   E. Cabo C0253: «45€ → 4,50€ … 4,50€ + 2,25€ = 6,75€» sin espacio ante el € y «%» pegados en el
 *      bloque educativo.
 *   F. Las dos respuestas sobre la tributación de las propinas (FAQPage y FAQ visible) se
 *      contradicen y ninguna se sostiene en el art. 17.1 LIRPF que cita la página; la del FAQPage
 *      no contesta lo que pregunta de la Seguridad Social.
 *   G. Tres preguntas del FAQPage repiten preguntas de la FAQ visible con otra respuesta.
 *   H. El FAQPage manda calcular sobre «el importe total»; la página, sobre el subtotal sin IVA.
 *   I. La description promete porcentajes «(5%, 10%, 15%)»; los botones son 10, 15 y 20.
 *   J. Tabla «Importe ejemplo (50 €)»: el taxi al 5 % son 2,50 €, y la tabla dice hasta 2,00 €.
 */

const RUTA = '/calculadora-propinas/';
const MONTO = '#monto';
const PORCENTAJE = '#porcentaje';
const PERSONAS = '#personas';

/** Quita los espacios duros para comparar con el texto que se lee. */
const plano = (t: string | null): string => (t ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [MONTO, PORCENTAJE, PERSONAS]);
}

/** La tarjeta de resultado por su título (h3 exacto), sin clases de módulo CSS. */
function tarjeta(page: Page, titulo: string): Locator {
  return page.getByRole('heading', { level: 3, name: titulo, exact: true }).locator('xpath=ancestor::div[2]');
}

async function cifra(page: Page, titulo: string): Promise<string> {
  return plano(await tarjeta(page, titulo).locator('p').first().textContent());
}

async function nota(page: Page, titulo: string): Promise<string> {
  return plano(await tarjeta(page, titulo).locator('p').nth(1).textContent());
}

/** Cuenta que el input admite tal cual (fill), comprobando que llegó al estado de React. */
async function ponerMonto(page: Page, valor: string): Promise<void> {
  await page.locator(MONTO).fill(valor);
  await esperarValorEnReact(page, MONTO, valor);
}

/** Teclea como una persona: fill() no admite «1.234,56» en un input numérico. */
async function teclear(page: Page, selector: string, texto: string): Promise<void> {
  const campo = page.locator(selector);
  await campo.click();
  await campo.press('Control+a');
  await campo.press('Backspace');
  await esperarValorEnReact(page, selector, '');
  await campo.pressSequentially(texto);
  await esperarPaginaAsentada(page);
}

async function pulsarPorcentaje(page: Page, n: number): Promise<void> {
  const boton = page.getByRole('button', { name: new RegExp(`^${n}\\s?%$`) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

interface Pregunta {
  q: string;
  a: string;
}

async function faqPage(page: Page): Promise<Pregunta[]> {
  return page.evaluate(() => {
    const salida: { q: string; a: string }[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of nodos) {
        if (n['@type'] !== 'FAQPage') continue;
        for (const e of n.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
          salida.push({ q: e.name, a: e.acceptedAnswer.text });
        }
      }
    }
    return salida;
  });
}

async function faqVisible(page: Page): Promise<Pregunta[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('details')).map((d) => ({
      q: (d.querySelector('summary')?.textContent ?? '').trim(),
      a: Array.from(d.querySelectorAll('p'))
        .map((p) => p.textContent ?? '')
        .join(' '),
    })),
  );
}

async function textoPagina(page: Page): Promise<string> {
  return page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return clon.textContent ?? '';
  });
}

test.describe('calculadora-propinas', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · 60 € al 10 % entre 4: 6,00 € de propina, 66,00 € y 16,50 € por persona', async ({ page }) => {
    // Ejemplo de la pregunta 3 del FAQPage: 60 × 0,10 = 6; 60 + 6 = 66; 66 / 4 = 16,50
    await ponerMonto(page, '60');
    await pulsarPorcentaje(page, 10);
    await teclear(page, PERSONAS, '4');
    await esperarValorEnReact(page, PERSONAS, '4');
    expect(await cifra(page, 'Monto original')).toBe('60,00 €');
    expect(await cifra(page, 'Propina total')).toBe('6,00 €');
    expect(await cifra(page, 'Total a pagar')).toBe('66,00 €');
    expect(await cifra(page, 'Por persona')).toBe('16,50 €');
    expect(await nota(page, 'Por persona')).toBe('4 personas');
  });

  test('CASO 1 (normal) · los ejemplos del FAQPage y del bloque educativo al 15 %', async ({ page }) => {
    // 15 % es el porcentaje inicial. 48 × 0,15 = 7,20 (pregunta 2 del FAQPage)
    await ponerMonto(page, '48');
    expect(await cifra(page, 'Propina total')).toBe('7,20 €');
    expect(await cifra(page, 'Total a pagar')).toBe('55,20 €');
    // «Truco del 10 %»: 45 € → 4,50 €, y el 15 % es eso más la mitad: 4,50 + 2,25 = 6,75
    await ponerMonto(page, '45');
    expect(await cifra(page, 'Propina total')).toBe('6,75 €');
    expect(await cifra(page, 'Total a pagar')).toBe('51,75 €');
  });

  test('CASO 1 (normal) · España en el desplegable aplica el 10 %, y la coma decimal se lee', async ({ page }) => {
    await page.selectOption('#pais', 'es-10');
    await expect(page.getByRole('button', { name: /^10\s?%$/ })).toHaveAttribute('aria-pressed', 'true');
    // «45,5» = 45,50 €; 45,5 × 0,10 = 4,55; 45,5 + 4,55 = 50,05
    await teclear(page, MONTO, '45,5');
    expect(await cifra(page, 'Monto original')).toBe('45,50 €');
    expect(await cifra(page, 'Propina total')).toBe('4,55 €');
    expect(await cifra(page, 'Total a pagar')).toBe('50,05 €');
  });

  test('CASO 2 (límite) · estado inicial a cero y sin tarjeta por persona', async ({ page }) => {
    expect(await cifra(page, 'Monto original')).toBe('0,00 €');
    expect(await cifra(page, 'Propina total')).toBe('0,00 €');
    expect(await cifra(page, 'Total a pagar')).toBe('0,00 €');
    await expect(page.getByRole('heading', { level: 3, name: 'Por persona', exact: true })).toHaveCount(0);
  });

  test('CASO 2 (límite) · Japón (0 %): 100 € dan 0,00 € de propina y 100,00 € en total', async ({ page }) => {
    await ponerMonto(page, '100');
    await page.selectOption('#pais', 'jp-0');
    await esperarPaginaAsentada(page);
    expect(await cifra(page, 'Propina total')).toBe('0,00 €');
    expect(await cifra(page, 'Total a pagar')).toBe('100,00 €');
  });

  test('CASO 2 (límite) · 60 personas se topan en 50 (110 € / 50 = 2,20 €) y 0 personas se marca', async ({ page }) => {
    await ponerMonto(page, '100');
    await pulsarPorcentaje(page, 10);
    await teclear(page, PERSONAS, '60');
    await esperarValorEnReact(page, PERSONAS, '50');
    await expect(page.locator(PERSONAS)).toHaveAttribute('aria-valuenow', '50');
    expect(await cifra(page, 'Total a pagar')).toBe('110,00 €');
    expect(await cifra(page, 'Por persona')).toBe('2,20 €');
    await teclear(page, PERSONAS, '0');
    await expect(page.locator(PERSONAS)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(PERSONAS)).toHaveAttribute('aria-valuenow', '1');
  });

  test('El SMI de la FAQ «España y EEUU» sale de data/fiscal: 1221,00 €/mes en 14 pagas (RD 126/2026)', async ({ page }) => {
    // Art. 1 del RD 126/2026: «1 221 euros/mes». es-ES no agrupa cuatro cifras.
    expect(plano(await textoPagina(page))).toContain('En España el SMI en 2026 es de 1221,00 €/mes (14 pagas)');
  });

  test('HALLAZGO A (14/11/2026, ABIERTO) · «1.234,56» se lee 1,23 € y «1.500» 1,50 €', async ({ page }) => {
    // <input type="number"> + parseFloat: el navegador deja «1.23456» en el campo.
    // Esperado: 1234,56 × 0,10 = 123,456 → 123,46 €; 1234,56 + 123,456 = 1358,016 → 1358,02 €.
    // Hoy: cuenta 1,23 €, propina 0,12 €, total 1,36 €; y «1.500» → 1,50 €.
    test.fail();
    await pulsarPorcentaje(page, 10);
    await teclear(page, MONTO, '1.234,56');
    expect(await cifra(page, 'Monto original')).toBe('1234,56 €');
    expect(await cifra(page, 'Propina total')).toBe('123,46 €');
    expect(await cifra(page, 'Total a pagar')).toBe('1358,02 €');
    await teclear(page, MONTO, '1.500');
    expect(await cifra(page, 'Monto original')).toBe('1500,00 €');
  });

  test('HALLAZGO B (14/11/2026, ABIERTO) · cuenta negativa, porcentaje negativo y > 100 se calculan sin aviso', async ({ page }) => {
    // Hoy: -50 € → propina -7,50 € y total -57,50 €; -10 % sobre 100 € → «propina» -10,00 € y
    // total 90,00 €; 150 % (el campo declara max=100) → 150,00 € sin aviso.
    test.fail();
    await ponerMonto(page, '-50');
    await page.locator(MONTO).press('Tab');
    await esperarPaginaAsentada(page);
    expect(await cifra(page, 'Propina total')).not.toMatch(/[-−]\s?\d/);
    expect(await cifra(page, 'Total a pagar')).not.toMatch(/[-−]\s?\d/);

    await ponerMonto(page, '100');
    await page.locator(PORCENTAJE).fill('-10');
    await esperarValorEnReact(page, PORCENTAJE, '-10');
    await page.locator(PORCENTAJE).press('Tab');
    await esperarPaginaAsentada(page);
    expect(await cifra(page, 'Propina total')).not.toMatch(/[-−]\s?\d/);

    await page.locator(PORCENTAJE).fill('150');
    await page.locator(PORCENTAJE).press('Tab');
    await esperarPaginaAsentada(page);
    expect(await cifra(page, 'Propina total')).not.toBe('150,00 €');
  });

  test('HALLAZGO C (14/11/2026, ABIERTO) · con Japón guardado, al volver se calcula al 15 %', async ({ page }) => {
    // localStorage guarda {"porcentaje":0,"pais":"jp-0"}; al cargar, `if (datos.porcentaje)`
    // descarta el 0 y el porcentaje queda en 15 con el desplegable en «Japón (0% - No propina)».
    // Esperado tras recargar: 100 € → 0,00 € de propina. Hoy: 15,00 € y total 115,00 €.
    test.fail();
    await page.selectOption('#pais', 'jp-0');
    await esperarPaginaAsentada(page);
    await page.reload();
    await esperarHidratacion(page, [MONTO, PORCENTAJE, PERSONAS]);
    await esperarPaginaAsentada(page);
    await expect(page.locator('#pais')).toHaveValue('jp-0');
    await ponerMonto(page, '100');
    expect(await cifra(page, 'Propina total')).toBe('0,00 €');
    expect(await cifra(page, 'Total a pagar')).toBe('100,00 €');
  });

  test('HALLAZGO D (14/11/2026, ABIERTO) · la tarjeta escribe «12.5%»: debe ser «12,5 %»', async ({ page }) => {
    // 80 € al 12,5 % = 10,00 € (la cifra en euros es correcta); el eco del porcentaje sale con
    // punto decimal y pegado. Los botones y el desplegable también pegan el «%» («10%», «España (10%)»).
    test.fail();
    await ponerMonto(page, '80');
    await teclear(page, PORCENTAJE, '12,5');
    expect(await cifra(page, 'Propina total')).toBe('10,00 €');
    expect(await nota(page, 'Propina total')).toBe('12,5 %');
    // El botón, con espacio (duro, U+00A0) entre la cifra y el «%»
    await expect(page.getByRole('button', { name: /^10\s%$/ })).toHaveCount(1);
  });

  test('HALLAZGO E (14/11/2026, ABIERTO, cabo C0253) · «45€ → 4,50€» sin espacio ante el € en el bloque educativo', async ({ page }) => {
    // Truco del 10 %: «Mueve el decimal un lugar: 45€ → 4,50€. Para 15% suma la mitad:
    // 4,50€ + 2,25€ = 6,75€.» Y «%» pegado en «España: 5-10%», «Estados Unidos: 15-20%»,
    // «Menos del 15%», «Japón: 0%», «Truco del 10%» y «15-18% es apropiado».
    // Los «%» pegados del formulario y la tarjeta son el hallazgo D: aquí solo los del bloque.
    test.fail();
    const texto = await textoPagina(page);
    expect(texto).not.toMatch(/\d€/);
    expect(plano(texto)).toContain('45 € → 4,50 €');
    expect(plano(texto)).toContain('4,50 € + 2,25 € = 6,75 €');
    for (const pegado of ['España: 5-10%', 'Estados Unidos: 15-20%', 'Menos del 15%', 'Japón: 0%', 'Truco del 10%', 'Para 15%', '15-18%']) {
      expect(plano(texto), `«${pegado}»`).not.toContain(pegado);
    }
  });

  test('HALLAZGO F (14/11/2026, ABIERTO) · las dos respuestas sobre el IRPF de las propinas se contradicen', async ({ page }) => {
    // Art. 17.1 LIRPF (BOE-A-2006-20764): «todas las contraprestaciones o utilidades, cualquiera
    // que sea su denominación o naturaleza, dinerarias o en especie, que deriven, directa o
    // indirectamente, del trabajo personal…». Sin condición de «habituales y cuantificables» y
    // sin obligación del trabajador de comunicarlas a la empresa.
    test.fail();
    const jsonld = (await faqPage(page)).find((p) => /impuestos|IRPF/i.test(p.q));
    const visible = (await faqVisible(page)).find((p) => /IRPF/i.test(p.q));
    expect(jsonld, 'el FAQPage pregunta por la tributación').toBeTruthy();
    expect(visible, 'la FAQ visible pregunta por la tributación').toBeTruthy();
    expect(jsonld!.a).not.toContain('habituales y cuantificables');
    expect(visible!.a).not.toContain('obligado a comunicarlas a la empresa');
    // Si pregunta por la Seguridad Social, la respuesta tiene que hablar de ella
    if (/Seguridad Social/i.test(jsonld!.q)) expect(jsonld!.a).toMatch(/Seguridad Social|cotiza/i);
  });

  test('HALLAZGO G (14/11/2026, ABIERTO) · tres preguntas del FAQPage repiten la FAQ visible con otra respuesta', async ({ page }) => {
    // Restaurante en España, EEUU frente a Europa/España e impuestos: misma pregunta, dos textos.
    // La reparación es UNA constante que pinten las dos (check:faq-unica).
    test.fail();
    const jsonld = await faqPage(page);
    const visible = await faqVisible(page);
    for (const tema of [/restaurante (en España|español)/i, /Estados Unidos|EEUU/i, /impuestos|IRPF/i]) {
      const j = jsonld.find((p) => tema.test(p.q));
      expect(j, `el FAQPage trata ${tema}`).toBeTruthy();
      const v = visible.find((p) => p.q === j!.q);
      expect(v, `«${j!.q}» está tal cual en la FAQ visible`).toBeTruthy();
      expect(plano(v!.a)).toContain(plano(j!.a));
    }
  });

  test('HALLAZGO H (14/11/2026, ABIERTO) · el FAQPage calcula sobre «el importe total» y la página sobre el subtotal sin IVA', async ({ page }) => {
    // FAQPage: «Multiplica el importe total de la cuenta por 0,15». Página: «Calcula sobre el
    // subtotal, no sobre el IVA» y «Introduce el subtotal sin propina (el importe antes del IVA…)».
    test.fail();
    const p15 = (await faqPage(page)).find((p) => /15\s?%/.test(p.q));
    const texto = plano(await textoPagina(page));
    expect(p15).toBeTruthy();
    expect(p15!.a.includes('importe total') && texto.includes('sobre el subtotal')).toBe(false);
  });

  test('HALLAZGO I (14/11/2026, ABIERTO) · la description promete «(5%, 10%, 15%)» y los botones son 10, 15 y 20', async ({ page }) => {
    test.fail();
    const descripcion = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    const prometidos = Array.from(descripcion.matchAll(/(\d+)\s?%/g)).map((m) => Number(m[1]));
    const grupo = page.getByRole('group', { name: /Selecciona porcentaje/ });
    const botones = (await grupo.getByRole('button').allTextContents()).map((t) =>
      Number(t.replace(/\D/g, '')),
    );
    expect(prometidos.length).toBeGreaterThan(0);
    for (const p of prometidos) expect(botones, `botón de ${p} %`).toContain(p);
  });

  test('HALLAZGO J (14/11/2026, ABIERTO) · tabla de 50 €: el taxi al 5 % son 2,50 €, no «hasta 2,00 €»', async ({ page }) => {
    // Columna «Importe ejemplo (50 €)», fila «Taxi · Redondear o 5 %»: 50 × 0,05 = 2,50 €.
    test.fail();
    const fila = page.locator('tr', { hasText: 'Taxi' });
    expect(plano(await fila.textContent())).toContain('2,50 €');
  });
});
