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
 *   HALLAZGOS 3931-3936, REPARADOS en /reparar del 02/11/2026 (sus tests ya no llevan test.fail())
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

  test('HALLAZGO 3931 (02/11/2026, REPARADO) · los segundos ya no se redondean al minuto en cada línea', async ({ page }) => {
    // parsearTiempo devolvía Math.round(minutos): 0:00:30 = 0,5 min → 1 en cada línea.
    // 30 s + 30 s = 60 s = 0:01 (daba 0:02) · 1:20:30 + 1:20:30 = 80,5 + 80,5 = 161 min = 2:41
    // (daba 2:42, con el ejemplo de la propia FAQ) · 4 × 0:03:30 = 14 min = 0:14 (daba 0:16).
    // Ahora cada línea se redondea al segundo y el total se pinta en h:mm:ss si le quedan.
    await escribir(page, LINEA(1), '1:20:30');
    await expect(TOTAL(page)).toHaveText('1:20:30');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('80,50 min');

    await escribir(page, LINEA(1), '0:00:30');
    await escribir(page, LINEA(2), '0:00:30');
    await expect(TOTAL(page)).toHaveText('0:01');

    await escribir(page, LINEA(1), '1:20:30');
    await escribir(page, LINEA(2), '1:20:30');
    await expect(TOTAL(page)).toHaveText('2:41');

    await escribir(page, LINEA(1), '0:03:30');
    await escribir(page, LINEA(2), '0:03:30');
    await escribir(page, LINEA(3), '0:03:30');
    await page.getByRole('button', { name: 'Añadir línea' }).click();
    await escribir(page, LINEA(4), '0:03:30');
    await expect(TOTAL(page)).toHaveText(/^0:14(:00)?$/);
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

  test('HALLAZGO 3932 (02/11/2026, REPARADO) · una guardia de 24 h (08:00 → 08:00) sale 24:00 y lo avisa', async ({ page }) => {
    // fin < ini era falso con las dos horas iguales, así que el turno duraba 0. La FAQ visible solo
    // excluye «turnos de más de un día», y la tarjeta «Turnos de noche» nombra sanidad y
    // seguridad, donde la guardia de 24 h es habitual. Ahora: 24:00 con un aviso de que se ha
    // contado un día entero. Con 30 min de pausa, 1440 − 30 = 1410 min = 23:30 (daba «−0:30» y
    // «La pausa que has puesto es mayor que el turno completo»).
    const grande = page.locator(`${PANEL_INTERVALO} [class*="resultadoGrande"]`);
    await turno(page, '08:00', '08:00');
    await expect(grande).toHaveText('24:00');
    await expect(page.locator(`${PANEL_INTERVALO} [class*="aviso"]`, { hasText: 'guardia de 24 horas' })).toBeVisible();

    await escribirEn(page, page.getByLabel('Pausa a descontar (minutos)', { exact: true }), '30');
    await expect(grande).toHaveText('23:30');
    await expect(page.getByText('La pausa que has puesto es mayor que el turno completo.')).toHaveCount(0);
  });

  test('HALLAZGO 3935 (02/11/2026, REPARADO) · con una pausa negativa avisa de la pausa', async ({ page }) => {
    // pausaValida es falso con −30 y el turno quedaba en null, que pintaba el mensaje del campo
    // vacío. Ahora: un aviso sobre la pausa, no «Introduce la hora de entrada y la de salida».
    await turno(page, '09:00', '17:00', '-30');
    await expect(page.getByRole('alert').filter({ hasText: /pausa/i })).toBeVisible();
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

  test('HALLAZGO 3936 (02/11/2026, REPARADO) · con un solo día el pie dice «en 1 día»', async ({ page }) => {
    // 09:00 → 17:00 = 8:00 en un día. Decía «horas efectivas en 1 días».
    await dia(page, 'Lunes', '09:00', '17:00');
    await expect(page.locator(`${PANEL_SEMANA} [class*="resultadoGrande"]`)).toHaveText('8:00');
    await expect(page.locator(`${PANEL_SEMANA} [class*="resultadoPie"]`)).toHaveText('horas efectivas en 1 día');
    await dia(page, 'Martes', '09:00', '17:00');
    await expect(page.locator(`${PANEL_SEMANA} [class*="resultadoPie"]`)).toHaveText('horas efectivas en 2 días');
  });
});

test.describe('Inspector 02/11/2026 · FAQ visible y FAQPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-horas/');
  });

  test('HALLAZGO 3934 (02/11/2026, REPARADO) · la FAQ ya no llama periódico a todo lo que no es múltiplo de 6 minutos', async ({ page }) => {
    // m ÷ 60 es decimal exacto si m es múltiplo de 3: 15 min = 0,25 h y 45 min = 0,75 h, como
    // enseña la tabla de la propia app. La FAQ decía «En el resto de casos el decimal es periódico».
    await expect(page.locator('[class*="equivalenciaItem"]').filter({ hasText: '15 min' })).toContainText('0,25 h');
    const respuesta = normal(await respuestaVisible(page, '¿Por qué 20 minutos son 0,33 horas').textContent());
    expect(respuesta).toContain('20 ÷ 60 = 0,333');
    expect(respuesta).not.toMatch(/resto de casos el decimal es periódico/);
  });

  test('HALLAZGO 3933 (02/11/2026, REPARADO) · la pregunta de la medianoche tiene una sola respuesta, con el límite', async ({ page }) => {
    // FAQ visible «¿Qué pasa con los turnos que terminan de madrugada?»: terminaba con «Lo que no hace
    // es adivinar turnos de más de un día». FAQPage «¿Cómo calculo las horas trabajadas si el turno
    // pasa de medianoche?»: «basta con introducir las dos horas tal cual», sin el límite.
    // Ahora las dos salen de PREGUNTA_MEDIANOCHE (metadata.ts).
    const preguntas = await preguntasFaqLd(page);
    const ld = preguntas.find((p) => /medianoche|madrugada/i.test(p.name));
    expect(ld).toBeDefined();
    const visible = normal(await respuestaVisible(page, /madrugada|medianoche/).textContent());
    expect(visible).toContain('más de un día');
    expect(normal(ld?.acceptedAnswer.text ?? '')).toBe(visible);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector — modo cambio, 14/11/2026. El diff (911b7cee..a4743803f) solo añade tres
 * comentarios `parser-ok` sobre los tres `Number(texto.replace(',', '.'))` de
 * lib/calculadoras/horas.ts. Se recorren los tres caminos; esperados resueltos A MANO antes de
 * abrir la app (1 h = 60 min, y cada línea se redondea al segundo):
 *
 *   Camino A · parsearSinUnidad, Number(decimal) — cifra sin unidad o con «h» pegada
 *     «1,5»            1,5 × 60 = 90 min → 1:30 · línea «1,50 h»
 *     «23,5» + «0,5»   1410 + 30 = 1440 min → 24:00 (no vuelve a 0:00) · «24,00 h» · «1440 min»
 *     «0,0»            0 min → 0:00, cuenta como tiempo (Tiempos contados 1) y sin aviso
 *     «1.5»            1,5 h → 1:30: el punto decimal está admitido a propósito («7.75» en la
 *                      cabecera del motor y en tests/horas-motor.spec.ts)
 *   Camino B · parsearConUnidad, las horas — «horas», «hora», «hr»
 *     «1,5 horas»                  90 min → 1:30
 *     «23,5 horas» + «media hora»  1410 + 30 = 1440 → 24:00
 *   Camino C · parsearConUnidad, los minutos
 *     «1,5 min»                    90 s → 0:01:30 · «1,50 min» · línea 1,5 ÷ 60 = 0,025 → «0,03 h»
 *     «1 h 59,5 min»               60 + 59,5 = 119,5 min → 1:59:30 (59,5 < 60: se admite)
 *     «23 h 59,5 min» + «0,5 min»  1380 + 59,5 + 0,5 = 1440 → 24:00
 *   Rechazo (aviso, aria-invalid, nada cuenta): «1,5,5» y «1.5.5» (dos separadores), «12abc» y
 *     «1e3» (lo que parseFloat sí aceptaba), «1,5 horas 20 min» (decimales en las horas junto a
 *     minutos), «1 h 60 min» (60 o más junto a horas), «45,5,5 min».
 *
 *   HALLAZGO 4596 (14/11/2026, REPARADO el mismo día) · el punto de millares se leía como decimal en los tres caminos.
 *     El parser-ok de a4743803f dice «no hay millares que leer», pero los dos regex dejan pasar un
 *     punto seguido de exactamente tres cifras, que en el formato del proyecto es el de millares
 *     (CLAUDE.md global §2: «1.234,56»; parseSpanishNumber, lib/formatters.ts: «el punto solo
 *     agrupa millares cuando parte el número en grupos de exactamente tres cifras»):
 *       «1.780» (jornada anual de convenio)  1780 h → 1780:00 · la app da 1:46:48 (1,78 h)
 *       «2.000 horas»                        2000 h → 2000:00 · la app da 2:00
 *       «1.500 min»                          1500 min = 25 h → 25:00 · la app da 0:01:30
 *     Ninguno lleva aviso ni aria-invalid. Es el defecto que vigila check:parser
 *     («lee "1.500" como 1,5»), callado por los tres parser-ok.
 * ══════════════════════════════════════════════════════════════════════════════════════════ */

/** La equivalencia en horas decimales que la app pinta a la derecha de la línea n. */
const equivalenciaDe = (page: Page, n: number): Locator =>
  page.locator('li').filter({ has: page.locator(LINEA(n)) }).locator('[class*="equivalencia"]');

const avisoLista = (page: Page): Locator =>
  page.getByRole('alert').filter({ hasText: 'Hay alguna línea que no se entiende' });

test.describe('Inspector 14/11/2026 · los tres Number con la coma cambiada (a4743803f)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-horas/');
    await esperarHidratacion(page, [LINEA(1), FACTOR_POR]);
  });

  test('Camino A (normal) · «1,5» = 1:30 y «1.5» también (el punto decimal está admitido)', async ({ page }) => {
    await escribir(page, LINEA(1), '1,5');
    await expect(TOTAL(page)).toHaveText('1:30');
    await expect(equivalenciaDe(page, 1)).toHaveText('1,50 h');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('90 min');

    await escribir(page, LINEA(1), '1.5');
    await expect(TOTAL(page)).toHaveText('1:30');
    await expect(avisoLista(page)).toHaveCount(0);
  });

  test('Camino A (límite) · «23,5» + «0,5» = 24:00 y «0,0» cuenta como 0:00', async ({ page }) => {
    await escribir(page, LINEA(1), '23,5');
    await escribir(page, LINEA(2), '0,5');
    await expect(TOTAL(page)).toHaveText('24:00');
    await expect(valorDe(page, PANEL_LISTA, 'En horas decimales')).toHaveText('24,00 h');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('1440 min');

    await escribir(page, LINEA(1), '0,0');
    await escribir(page, LINEA(2), '');
    await expect(TOTAL(page)).toHaveText('0:00');
    await expect(valorDe(page, PANEL_LISTA, 'Tiempos contados')).toHaveText('1');
    await expect(page.locator(LINEA(1))).toHaveAttribute('aria-invalid', 'false');
    await expect(avisoLista(page)).toHaveCount(0);
  });

  test('Camino B · «1,5 horas» = 1:30 y «23,5 horas» + «media hora» = 24:00', async ({ page }) => {
    await escribir(page, LINEA(1), '1,5 horas');
    await expect(TOTAL(page)).toHaveText('1:30');
    await expect(equivalenciaDe(page, 1)).toHaveText('1,50 h');

    await escribir(page, LINEA(1), '23,5 horas');
    await escribir(page, LINEA(2), 'media hora');
    await expect(TOTAL(page)).toHaveText('24:00');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('1440 min');
  });

  test('Camino C · «1,5 min» = 0:01:30, «1 h 59,5 min» = 1:59:30 y suman 24:00 en el límite', async ({ page }) => {
    await escribir(page, LINEA(1), '1,5 min');
    await expect(TOTAL(page)).toHaveText('0:01:30');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('1,50 min');
    await expect(equivalenciaDe(page, 1)).toHaveText('0,03 h');

    await escribir(page, LINEA(1), '1 h 59,5 min');
    await expect(TOTAL(page)).toHaveText('1:59:30');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('119,50 min');

    await escribir(page, LINEA(1), '23 h 59,5 min');
    await escribir(page, LINEA(2), '0,5 min');
    await expect(TOTAL(page)).toHaveText('24:00');
    await expect(valorDe(page, PANEL_LISTA, 'En minutos')).toHaveText('1440 min');
  });

  test('Rechazo · dos separadores, texto pegado, notación científica y minutos de reloj ≥ 60', async ({ page }) => {
    for (const malo of ['1,5,5', '1.5.5', '12abc', '1e3', '1,5 horas 20 min', '1 h 60 min', '45,5,5 min']) {
      await escribir(page, LINEA(1), malo);
      await expect(page.locator(LINEA(1)), malo).toHaveAttribute('aria-invalid', 'true');
      await expect(avisoLista(page), malo).toBeVisible();
      await expect(TOTAL(page), malo).toHaveText('0:00');
      await expect(valorDe(page, PANEL_LISTA, 'Tiempos contados'), malo).toHaveText('0');
      await expect(equivalenciaDe(page, 1), malo).toHaveText('');
    }
  });

  // HALLAZGO 4596 (14/11/2026, REPARADO en /reparar el mismo día: leerCifra con
  // parseSpanishNumber en lib/calculadoras/horas.ts). Uno por camino, para que una reparación a
  // medias se vea.
  const MILLARES: Array<{ camino: string; texto: string; esperado: string; hoy: string }> = [
    { camino: 'A (sin unidad)', texto: '1.780', esperado: '1780:00', hoy: '1:46:48' },
    { camino: 'B (horas)', texto: '2.000 horas', esperado: '2000:00', hoy: '2:00' },
    { camino: 'C (minutos)', texto: '1.500 min', esperado: '25:00', hoy: '0:01:30' },
  ];
  for (const { camino, texto, esperado, hoy } of MILLARES) {
    test(`HALLAZGO 4596 (14/11/2026, REPARADO) · camino ${camino}: «${texto}» es ${esperado}, no ${hoy}`, async ({ page }) => {
      // El punto seguido de exactamente tres cifras agrupa millares (parseSpanishNumber); antes
      // Number(texto.replace(',', '.')) lo leía como decimal y no avisaba.
      await escribir(page, LINEA(1), texto);
      await expect(TOTAL(page)).toHaveText(esperado, { timeout: 2000 });
    });
  }
});
