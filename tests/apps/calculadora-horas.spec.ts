import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Calculadora de Horas — lo que añadió S0224 (24/10/2026), comprobado en el navegador.
 * Las cuentas se resolvieron a mano (el motor tiene las suyas en tests/horas-motor.spec.ts):
 *
 *   45 min + 45 min          = 90 min = 1:30 (media 0:45)
 *   12:50 + media hora       = 770 + 30 = 800 min = 13:20
 *   «45» sin unidad          = 45 horas, y la app avisa de cómo escribir minutos
 *   15 min entre 4           = 225 s = 0:03:45
 *   7:45 por 5               = 38:45
 */

const LINEA = (n: number) => `input[aria-label="Tiempo de la línea ${n}"]`;
const FACTOR_POR = 'input[aria-label="Multiplicar el total por"]';
const FACTOR_ENTRE = 'input[aria-label="Repartir el total entre"]';
/** El número grande del panel «Total» (la clase del módulo CSS lleva un sufijo que cambia). */
const TOTAL = (page: Page) => page.locator('[class*="resultadoGrande"]');

async function escribir(page: Page, selector: string, texto: string): Promise<void> {
  const caja = page.locator(selector);
  await caja.fill(texto);
  await esperarValorEnReact(page, caja, texto);
}

test.describe('calculadora-horas — minutos con unidad y operar el total', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-horas/');
    await esperarHidratacion(page, [LINEA(1), FACTOR_POR]);
  });

  test('45 min + 45 min = 1:30', async ({ page }) => {
    await escribir(page, LINEA(1), '45 min');
    await escribir(page, LINEA(2), '45 min');
    await expect(TOTAL(page)).toHaveText('1:30');
    await expect(page.locator('strong', { hasText: /^0:45$/ })).toBeVisible();
    await expect(page.getByText('Hay alguna línea que no se entiende')).toHaveCount(0);
  });

  test('12:50 + media hora = 13:20', async ({ page }) => {
    await escribir(page, LINEA(1), '12:50');
    await escribir(page, LINEA(2), 'media hora');
    await expect(TOTAL(page)).toHaveText('13:20');
  });

  test('una cifra sola se lee como horas y la app lo avisa', async ({ page }) => {
    await escribir(page, LINEA(1), '45');
    await expect(TOTAL(page)).toHaveText('45:00');
    await expect(page.getByText(/Una cifra sin unidad se lee como horas/)).toBeVisible();
    await escribir(page, LINEA(1), '45 min');
    await expect(page.getByText(/Una cifra sin unidad se lee como horas/)).toHaveCount(0);
  });

  test('15 min entre 4 = 0:03:45', async ({ page }) => {
    await escribir(page, LINEA(1), '15 min');
    await page.getByRole('button', { name: '÷ entre' }).click();
    await expect(page.getByRole('button', { name: '÷ entre' })).toHaveAttribute('aria-pressed', 'true');
    await escribir(page, FACTOR_ENTRE, '4');
    await expect(page.locator('strong', { hasText: '0:03:45' })).toBeVisible();
  });

  test('7:45 por 5 = 38:45', async ({ page }) => {
    await escribir(page, LINEA(1), '7:45');
    await escribir(page, FACTOR_POR, '5');
    await expect(page.locator('strong', { hasText: '38:45' })).toBeVisible();
  });

  test('repartir entre cero no da cifra', async ({ page }) => {
    await escribir(page, LINEA(1), '1:00');
    await page.getByRole('button', { name: '÷ entre' }).click();
    await escribir(page, FACTOR_ENTRE, '0');
    await expect(page.getByText('No se puede repartir entre cero.')).toBeVisible();
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector — primera inspección entera, 02/11/2026 (segmento motor). Los tres modos.
 * Esperados resueltos A MANO antes de abrir la app; el oráculo es la aritmética del reloj:
 *
 *   CASO 1 (normal) · Sumar y restar
 *     1:45 + 2:20 + 0:50 (la tarjeta «Facturar por horas» del bloque educativo)
 *       105 + 140 + 50 = 295 min = 4:55 · 295 ÷ 60 = 4,9166… → «4,92 h» · media 295 ÷ 3 = 98,3 → 1:38
 *     7:45 + 2,5 − 45 min = 465 + 150 − 45 = 570 min = 9:30 · «9,50 h» · media 570 ÷ 3 = 190 = 3:10
 *
 *   CASO 2 (límite)
 *     Sumar y restar · 23:59 + 0:01 = 1440 min = 24:00 (una duración NO vuelve a 0:00)
 *                    · 1:00 − 1:30 = −30 min → «−0:30» · −0,50 h · −30 min
 *     Entre dos horas · 22:00 → 06:00 con 30 min de pausa: (360 + 1440 − 1320) − 30 = 450 = 7:30
 *                       y el aviso de medianoche (lo mismo que dice la tarjeta «Turnos de noche»)
 *                     · 23:59 → 00:00 = 1 min, cruza · 00:00 → 23:59 = 1439 min = 23:59, no cruza
 *     Parte semanal · L 22:00–06:00 p30 = 7:30 · M a V 09:00–17:30 p30 = 8:00 × 4 = 32:00
 *                     450 + 1920 = 2370 min = 39:30 en 5 días · media 2370 ÷ 5 = 474 = 7:54
 *                     jornada 40 h = 2400 min → diferencia −30 min = «−0:30» · −0,50 h
 *                     y sigue ahí al recargar (lo promete la FAQ «¿Se guarda lo que escribo?»)
 *
 *   CASO 3 (rechazo)
 *     Sumar y restar · «25:70», «abc», «7 45» → ninguna se entiende: aviso, aria-invalid, total 0:00
 *     Entre dos horas · 09:00 → 10:00 con 90 min de pausa = −30 min, con su aviso
 *                     · sin hora de salida no hay cifra
 *
 *   HALLAZGOS que quedan ABIERTOS (test.fail(): pasan a fallar el día que se reparen)
 *     · Los segundos se redondean al minuto EN CADA LÍNEA (parsearTiempo hace Math.round):
 *       0:00:30 + 0:00:30 = 60 s = 0:01 → la app da 0:02 · 1:20:30 + 1:20:30 = 161 min = 2:41 →
 *       2:42 · cuatro pistas de 0:03:30 = 14 min → 0:16. La FAQ visible invita a «afinar» con
 *       segundos y la propia guía dice «Redondea al final, nunca en cada línea».
 *     · Una guardia de 24 h (08:00 → 08:00) sale 0:00 sin aviso; con 30 min de pausa, «−0:30» y
 *       «La pausa que has puesto es mayor que el turno completo». La FAQ solo excluye los turnos
 *       de MÁS de un día.
 *     · Con una pausa negativa la app pide «Introduce la hora de entrada y la de salida» con las
 *       dos horas puestas.
 *     · «horas efectivas en 1 días».
 *     · La FAQ visible dice que todo lo que no es múltiplo de 6 minutos da un decimal periódico:
 *       15 min = 0,25 h y 45 min = 0,75 h son exactos (la tabla de la propia app lo enseña).
 *     · El FAQPage responde a la pregunta de la medianoche con otro texto que el de la FAQ visible
 *       y se calla su límite («Lo que no hace es adivinar turnos de más de un día»).
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

/** Normaliza espacios para comparar el texto de una respuesta con el del JSON-LD. */
const normal = (s: string | null): string => (s ?? '').replace(/\s+/g, ' ').trim();

async function escribirEn(page: Page, caja: Locator, texto: string): Promise<void> {
  await caja.fill(texto);
  await esperarValorEnReact(page, caja, texto);
}

/** La cifra de una tarjeta del resultado, por su etiqueta, dentro de un panel. */
function valorDe(page: Page, panel: string, etiqueta: string): Locator {
  return page
    .locator(`${panel} [class*="resultadoSecundario"] > div`)
    .filter({ has: page.getByText(etiqueta, { exact: true }) })
    .locator('strong');
}

async function abrirPestana(page: Page, nombre: RegExp, panel: string): Promise<void> {
  const pestana = page.getByRole('tab', { name: nombre });
  await pestana.click();
  await expect(pestana).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(panel)).toBeVisible();
}

/** Rellena el modo «Entre dos horas». La pausa, solo si se da. */
async function turno(page: Page, entrada: string, salida: string | null, pausa?: string): Promise<void> {
  await escribirEn(page, page.getByLabel('Hora de entrada', { exact: true }), entrada);
  if (salida !== null) {
    await escribirEn(page, page.getByLabel('Hora de salida', { exact: true }), salida);
  }
  if (pausa !== undefined) {
    await escribirEn(page, page.getByLabel('Pausa a descontar (minutos)', { exact: true }), pausa);
  }
}

async function dia(page: Page, nombre: string, entrada: string, salida: string, pausa?: string): Promise<void> {
  await escribirEn(page, page.getByLabel(`Hora de entrada del ${nombre}`, { exact: true }), entrada);
  await escribirEn(page, page.getByLabel(`Hora de salida del ${nombre}`, { exact: true }), salida);
  if (pausa !== undefined) {
    await escribirEn(page, page.getByLabel(`Pausa del ${nombre} en minutos`, { exact: true }), pausa);
  }
}

interface PreguntaLd {
  name: string;
  acceptedAnswer: { text: string };
}

/** Las preguntas del FAQPage que sirve el layout (lo leen buscadores y asistentes de IA). */
async function preguntasFaqLd(page: Page): Promise<PreguntaLd[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const bloque of bloques) {
    const datos = JSON.parse(bloque) as { '@type'?: string; mainEntity?: PreguntaLd[] };
    if (datos['@type'] === 'FAQPage') return datos.mainEntity ?? [];
  }
  return [];
}

/** La respuesta de la FAQ visible cuya pregunta casa con `pregunta`. */
function respuestaVisible(page: Page, pregunta: RegExp | string): Locator {
  return page
    .locator('[class*="faqItem"]')
    .filter({ has: page.locator('h4', { hasText: pregunta }) })
    .locator('p');
}

const PANEL_LISTA = '#panel-lista';
const PANEL_INTERVALO = '#panel-intervalo';
const PANEL_SEMANA = '#panel-semana';

/** El aviso bajo el resultado, no la ayuda del formulario, que dice casi lo mismo. */
const avisoMedianoche = (page: Page): Locator =>
  page.locator(`${PANEL_INTERVALO} [class*="aviso"]`, { hasText: 'El turno cruza la medianoche' });

test.describe('Inspector 02/11/2026 · Sumar y restar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-horas/');
    await esperarHidratacion(page, [LINEA(1), FACTOR_POR]);
  });

  test('CASO 1 (normal) · 1:45 + 2:20 + 0:50 = 4:55 = 4,92 h (la tarjeta «Facturar por horas»)', async ({ page }) => {
    await escribir(page, LINEA(1), '1:45');
    await escribir(page, LINEA(2), '2:20');
    await escribir(page, LINEA(3), '0:50');
    await expect(TOTAL(page)).toHaveText('4:55');
    await expect(valorDe(page, PANEL_LISTA, 'En horas decimales')).toHaveText('4,92 h');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('295 min');
    await expect(valorDe(page, PANEL_LISTA, 'Tiempos contados')).toHaveText('3');
    await expect(valorDe(page, PANEL_LISTA, 'Media por tiempo')).toHaveText('1:38');
    // La tarjeta del bloque educativo dice lo mismo que calcula la app
    await expect(page.getByText(/El total es 4:55, que en decimal son\s+4,92 horas/)).toHaveCount(1);
  });

  test('CASO 1 (normal) · 7:45 + 2,5 − 45 min = 9:30, mezclando formatos y una resta', async ({ page }) => {
    await escribir(page, LINEA(1), '7:45');
    await escribir(page, LINEA(2), '2,5');
    await escribir(page, LINEA(3), '45 min');
    await page.getByRole('button', { name: 'Línea 3: sumando. Pulsa para restar' }).click();
    await expect(page.getByRole('button', { name: 'Línea 3: restando. Pulsa para sumar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(TOTAL(page)).toHaveText('9:30');
    await expect(valorDe(page, PANEL_LISTA, 'En horas decimales')).toHaveText('9,50 h');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('570 min');
    await expect(valorDe(page, PANEL_LISTA, 'Media por tiempo')).toHaveText('3:10');
  });

  test('CASO 2 (límite) · 23:59 + 0:01 = 24:00, sin volver a 0:00', async ({ page }) => {
    await escribir(page, LINEA(1), '23:59');
    await escribir(page, LINEA(2), '0:01');
    await expect(TOTAL(page)).toHaveText('24:00');
    await expect(valorDe(page, PANEL_LISTA, 'En horas decimales')).toHaveText('24,00 h');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('1440 min');
  });

  test('CASO 2 (límite) · 1:00 − 1:30 = −0:30, con el signo delante', async ({ page }) => {
    await escribir(page, LINEA(1), '1:00');
    await escribir(page, LINEA(2), '1:30');
    await page.getByRole('button', { name: 'Línea 2: sumando. Pulsa para restar' }).click();
    await expect(TOTAL(page)).toHaveText('−0:30');
    await expect(valorDe(page, PANEL_LISTA, 'En horas decimales')).toHaveText(/^[-−]0,50 h$/);
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText(/^[-−]30 min$/);
  });

  test('CASO 3 (rechazo) · «25:70», «abc» y «7 45» no se entienden ni cuentan', async ({ page }) => {
    await escribir(page, LINEA(1), '25:70');
    await escribir(page, LINEA(2), 'abc');
    await escribir(page, LINEA(3), '7 45');
    await expect(
      page.getByRole('alert').filter({ hasText: 'Hay alguna línea que no se entiende' }),
    ).toBeVisible();
    for (const n of [1, 2, 3]) {
      await expect(page.locator(LINEA(n))).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(TOTAL(page)).toHaveText('0:00');
    await expect(valorDe(page, PANEL_LISTA, 'Tiempos contados')).toHaveText('0');
    await expect(page.locator('body')).not.toContainText(/NaN|Infinity|undefined/);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · los segundos se redondean al minuto en cada línea', async ({ page }) => {
    // parsearTiempo devuelve Math.round(minutos): 0:00:30 = 0,5 min → 1 en cada línea.
    // 30 s + 30 s = 60 s = 0:01 (hoy 0:02) · 1:20:30 + 1:20:30 = 80,5 + 80,5 = 161 min = 2:41
    // (hoy 2:42, con el ejemplo de la propia FAQ) · 4 × 0:03:30 = 14 min = 0:14 (hoy 0:16).
    // Los tres esperados son minutos exactos: valen con o sin segundos en pantalla.
    test.fail();
    await escribir(page, LINEA(1), '0:00:30');
    await escribir(page, LINEA(2), '0:00:30');
    expect(normal(await TOTAL(page).textContent())).toMatch(/^0:01(:00)?$/);

    await escribir(page, LINEA(1), '1:20:30');
    await escribir(page, LINEA(2), '1:20:30');
    expect(normal(await TOTAL(page).textContent())).toMatch(/^2:41(:00)?$/);

    await escribir(page, LINEA(1), '0:03:30');
    await escribir(page, LINEA(2), '0:03:30');
    await escribir(page, LINEA(3), '0:03:30');
    await page.getByRole('button', { name: 'Añadir línea' }).click();
    await escribir(page, LINEA(4), '0:03:30');
    expect(normal(await TOTAL(page).textContent())).toMatch(/^0:14(:00)?$/);
  });
});

test.describe('Inspector 02/11/2026 · Entre dos horas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-horas/');
    await esperarHidratacion(page, [LINEA(1)]);
    await abrirPestana(page, /Entre dos horas/, PANEL_INTERVALO);
  });

  test('CASO 2 (límite) · 22:00 → 06:00 con 30 min de pausa = 7:30, y avisa de la medianoche', async ({ page }) => {
    await turno(page, '22:00', '06:00', '30');
    await expect(page.locator(`${PANEL_INTERVALO} [class*="resultadoGrande"]`)).toHaveText('7:30');
    await expect(valorDe(page, PANEL_INTERVALO, 'En horas decimales')).toHaveText('7,50 h');
    await expect(valorDe(page, PANEL_INTERVALO, 'En minutos')).toHaveText('450 min');
    await expect(avisoMedianoche(page)).toBeVisible();
  });

  test('CASO 2 (límite) · 23:59 → 00:00 = 0:01 y 00:00 → 23:59 = 23:59', async ({ page }) => {
    await turno(page, '23:59', '00:00');
    await expect(page.locator(`${PANEL_INTERVALO} [class*="resultadoGrande"]`)).toHaveText('0:01');
    await expect(valorDe(page, PANEL_INTERVALO, 'En minutos')).toHaveText('1 min');
    await expect(avisoMedianoche(page)).toBeVisible();

    await turno(page, '00:00', '23:59');
    await expect(page.locator(`${PANEL_INTERVALO} [class*="resultadoGrande"]`)).toHaveText('23:59');
    await expect(valorDe(page, PANEL_INTERVALO, 'En horas decimales')).toHaveText('23,98 h');
    await expect(avisoMedianoche(page)).toHaveCount(0);
  });

  test('CASO 3 (rechazo) · una pausa mayor que el turno avisa; sin salida no hay cifra', async ({ page }) => {
    await turno(page, '09:00', '10:00', '90');
    await expect(page.locator(`${PANEL_INTERVALO} [class*="resultadoGrande"]`)).toHaveText('−0:30');
    await expect(
      page.getByRole('alert').filter({ hasText: 'La pausa que has puesto es mayor que el turno completo.' }),
    ).toBeVisible();

    await escribirEn(page, page.getByLabel('Hora de salida', { exact: true }), '');
    await expect(page.getByText('Introduce la hora de entrada y la de salida.')).toBeVisible();
    await expect(page.locator(`${PANEL_INTERVALO} [class*="resultadoGrande"]`)).toHaveCount(0);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · una guardia de 24 h (08:00 → 08:00) sale 0:00 sin aviso', async ({ page }) => {
    // fin < ini es falso con las dos horas iguales, así que el turno dura 0. La FAQ visible solo
    // excluye «turnos de más de un día», y la tarjeta «Turnos de noche» nombra sanidad y
    // seguridad, donde la guardia de 24 h es habitual. Esperado: 24:00, o un aviso de que con
    // las dos horas iguales no se sabe si es 0 o un día entero. Con 30 min de pausa la app dice
    // hoy «−0:30» y «La pausa que has puesto es mayor que el turno completo».
    test.fail();
    await turno(page, '08:00', '08:00');
    const grande = normal(await page.locator(`${PANEL_INTERVALO} [class*="resultadoGrande"]`).textContent());
    const avisos = await page.locator(`${PANEL_INTERVALO} [class*="aviso"]`).count();
    expect(grande === '24:00' || avisos > 0).toBe(true);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · con una pausa negativa pide las dos horas que ya están puestas', async ({ page }) => {
    // pausaValida es falso con −30 y el turno queda en null, que pinta el mensaje del campo vacío.
    // Esperado: un aviso sobre la pausa, no «Introduce la hora de entrada y la de salida».
    test.fail();
    await turno(page, '09:00', '17:00', '-30');
    const resultado = normal(await page.locator(`${PANEL_INTERVALO} > div`).nth(1).textContent());
    expect(resultado).not.toContain('Introduce la hora de entrada y la de salida');
    expect(resultado).toMatch(/pausa/i);
  });
});

test.describe('Inspector 02/11/2026 · Parte semanal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-horas/');
    await esperarHidratacion(page, [LINEA(1)]);
    await abrirPestana(page, /Parte semanal/, PANEL_SEMANA);
  });

  test('CASO 2 (límite) · una noche y cuatro jornadas = 39:30, −0:30 frente a 40 h, y se guarda', async ({ page }) => {
    await dia(page, 'Lunes', '22:00', '06:00', '30');
    for (const nombre of ['Martes', 'Miércoles', 'Jueves', 'Viernes']) {
      await dia(page, nombre, '09:00', '17:30', '30');
    }
    const grande = page.locator(`${PANEL_SEMANA} [class*="resultadoGrande"]`);
    await expect(grande).toHaveText('39:30');
    await expect(page.locator(`${PANEL_SEMANA} [class*="resultadoPie"]`)).toHaveText('horas efectivas en 5 días');
    await expect(page.locator(`${PANEL_SEMANA} [class*="celdaTotal"]`)).toHaveText([
      '7:30', '8:00', '8:00', '8:00', '8:00', '—', '—',
    ]);
    await expect(valorDe(page, PANEL_SEMANA, 'Total decimal')).toHaveText('39,50 h');
    await expect(valorDe(page, PANEL_SEMANA, 'Media diaria')).toHaveText('7:54');
    await expect(valorDe(page, PANEL_SEMANA, 'Diferencia con la jornada')).toHaveText('−0:30');
    await expect(valorDe(page, PANEL_SEMANA, 'Equivale a')).toHaveText(/^[-−]0,50 h$/);

    // «para que no se pierda al recargar la página» (FAQ «¿Se guarda lo que escribo?»)
    await page.reload();
    await esperarHidratacion(page, [LINEA(1)]);
    await abrirPestana(page, /Parte semanal/, PANEL_SEMANA);
    await expect(page.getByLabel('Hora de entrada del Lunes', { exact: true })).toHaveValue('22:00');
    await expect(grande).toHaveText('39:30');
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · con un solo día el pie dice «en 1 días»', async ({ page }) => {
    // 09:00 → 17:00 = 8:00 en un día. Hoy: «horas efectivas en 1 días».
    test.fail();
    await dia(page, 'Lunes', '09:00', '17:00');
    await expect(page.locator(`${PANEL_SEMANA} [class*="resultadoGrande"]`)).toHaveText('8:00');
    expect(normal(await page.locator(`${PANEL_SEMANA} [class*="resultadoPie"]`).textContent())).toBe(
      'horas efectivas en 1 día',
    );
  });
});

test.describe('Inspector 02/11/2026 · FAQ visible y FAQPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-horas/');
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · la FAQ llama periódico a todo lo que no es múltiplo de 6 minutos', async ({ page }) => {
    // m ÷ 60 es decimal exacto si m es múltiplo de 3: 15 min = 0,25 h y 45 min = 0,75 h, como
    // enseña la tabla de la propia app. La FAQ dice «En el resto de casos el decimal es periódico».
    test.fail();
    await expect(page.locator('[class*="equivalenciaItem"]').filter({ hasText: '15 min' })).toContainText('0,25 h');
    const respuesta = normal(await respuestaVisible(page, '¿Por qué 20 minutos son 0,33 horas').textContent());
    expect(respuesta).toContain('20 ÷ 60 = 0,333');
    expect(respuesta).not.toMatch(/resto de casos el decimal es periódico/);
  });

  test('HALLAZGO (02/11/2026, ABIERTO) · la pregunta de la medianoche tiene dos respuestas y el FAQPage calla el límite', async ({ page }) => {
    // FAQ visible «¿Qué pasa con los turnos que terminan de madrugada?»: termina con «Lo que no hace
    // es adivinar turnos de más de un día». FAQPage «¿Cómo calculo las horas trabajadas si el turno
    // pasa de medianoche?»: «basta con introducir las dos horas tal cual», sin el límite.
    // Reparación: UNA constante que importen las dos (check:faq-unica).
    test.fail();
    const preguntas = await preguntasFaqLd(page);
    const ld = preguntas.find((p) => /medianoche|madrugada/i.test(p.name));
    expect(ld).toBeDefined();
    const visible = normal(await respuestaVisible(page, /madrugada|medianoche/).textContent());
    expect(visible).toContain('más de un día');
    expect(normal(ld?.acceptedAnswer.text ?? '')).toBe(visible);
  });
});
