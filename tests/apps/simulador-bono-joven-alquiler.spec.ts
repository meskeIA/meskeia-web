import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-bono-joven-alquiler (segmento cálculo, riesgo 1 CRÍTICO)
 *
 * De dónde sale cada cifra esperada
 * ─────────────────────────────────
 * ⚠️ Ninguno de los datos normativos de esta app vive en `data/fiscal/`: el Plan Estatal de
 * Vivienda 2026-2030 no tiene módulo (`grep -rn "326/2026" data/fiscal/` → 0 resultados).
 * Todos los umbrales están hardcodeados en `app/simulador-bono-joven-alquiler/page.tsx`, y la
 * fuente oficial que la propia app declara es la única ancla disponible:
 *
 *   - «Real Decreto 326/2026, de 22 de abril · Plan Estatal de Vivienda 2026-2030»
 *     (elemento `.heroLaw` del hero, repetido en metadata.ts, jsonLd y faqJsonLd).
 *
 * Umbrales tal y como los declara la app, y que este test fija como contrato:
 *   - Cuantía máxima: 300 €/mes vivienda completa · 200 €/mes habitación
 *     → `const BONO` en page.tsx; también en el subtítulo del hero y en metadata.description.
 *   - Duración máxima: 48 meses (4 años = 2 + renovación 2)
 *     → `const DURACION_MAX_MESES = 48` en page.tsx.
 *   - Tope del 60 % de la renta mensual → `alquilerNum * 0.6` en page.tsx, comentado allí
 *     como «El bono no puede superar el 60% de la renta mensual (RD 326/2026)».
 *   - Límite de renta 600 €/mes general, ampliable a 900 €/mes en zona tensionada
 *     → texto del requisito `renta` en `REQUISITOS`.
 *   - Edad 18-35 años inclusive → texto del requisito `edad` en `REQUISITOS`.
 *   - Límite de ingresos: la app NO lo cuantifica (lo remite a la convocatoria de cada CA),
 *     así que ningún caso de este test puede anclarse a una cifra de ingresos.
 *
 * Los tres casos están resueltos a mano ANTES de ejecutar la app; el cálculo va comentado
 * junto a cada aserción.
 *
 * Nota de formato: `formatCurrency` (lib/formatters.ts) usa es-ES, que NO agrupa los millares
 * de un número de cuatro cifras (9.600 → «9600,00 €») y sí los de cinco o más
 * (14.400 → «14.400,00 €»), y separa la cifra del € con un espacio duro (U+00A0).
 */

const RUTA = '/simulador-bono-joven-alquiler/';

/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

/** Los siete requisitos, con el texto literal de `REQUISITOS` en page.tsx. */
const REQUISITOS = {
  edad: 'Tienes entre 18 y 35 años (inclusive)',
  ingresos: 'Tus ingresos están dentro del límite establecido por tu Comunidad Autónoma',
  propietario: 'No eres propietario de una vivienda en España',
  habitual: 'La vivienda es tu residencia habitual y permanente',
  contrato: 'El contrato de arrendamiento está registrado (o lo estará)',
  renta: 'La renta mensual no supera 600 € (o 900 € en zonas tensionadas)',
  comunidad: 'Tu Comunidad Autónoma tiene el Bono Joven activo',
} as const;

/** Valor de una de las tres tarjetas del panel de ahorro, buscada por su etiqueta. */
async function valorPanel(page: Page, etiqueta: string): Promise<string> {
  const tarjeta = page.locator('[class*="ahorroCard"]').filter({ hasText: etiqueta }).first();
  const valor = tarjeta.locator('[class*="ahorroValor"]').first();
  return (await valor.innerText()).replace(ESPACIO_DURO, ' ').trim();
}

/** Responde «Sí» o «No» a uno de los requisitos de la checklist. */
async function responder(page: Page, requisito: string, valor: 'Sí' | 'No'): Promise<void> {
  const tarjeta = page.locator('[class*="checkCard"]').filter({ hasText: requisito }).first();
  await tarjeta.getByRole('button', { name: valor, exact: true }).click();
}

/** Marca «Sí» en los siete requisitos. */
async function responderTodoSi(page: Page): Promise<void> {
  for (const texto of Object.values(REQUISITOS)) await responder(page, texto, 'Sí');
}

/** Texto de la tarjeta de veredicto (apto / casi / no-apto). */
async function textoResultado(page: Page): Promise<string> {
  const tarjeta = page.locator('[class*="resultadoCard"]').first();
  return (await tarjeta.innerText()).replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();
}

test.describe('Simulador Bono Joven Alquiler — promesa y encuadre legal', () => {
  test('anuncia la ayuda, la norma que aplica y lleva el disclaimer de riesgo 1', async ({ page }) => {
    await page.goto(RUTA);

    await expect(page.locator('h1')).toHaveText('Simulador Bono Joven Alquiler');

    // Subtítulo: las dos cuantías y la duración que el motor usa (BONO y DURACION_MAX_MESES).
    const subtitulo = page.locator('[class*="subtitle"]').first();
    await expect(subtitulo).toContainText('300 €/mes');
    await expect(subtitulo).toContainText('200 €/mes');
    await expect(subtitulo).toContainText('4 años');

    // La app declara su norma de referencia en el hero (única ancla: no hay módulo en data/fiscal).
    await expect(page.locator('[class*="heroLaw"]').first()).toContainText(
      'Real Decreto 326/2026, de 22 de abril'
    );

    // Riesgo 1 → DisclaimerCard crítico y NO colapsable (_private/DISCLAIMER-POLICY.md §2).
    const disclaimer = page.locator('[class*="disclaimer"]').first();
    await expect(disclaimer).toBeVisible();
    await expect(disclaimer).toContainText('carácter exclusivamente orientativo');
    await expect(disclaimer).toContainText('no constituye asesoramiento financiero');
    // Sin control de plegado dentro del aviso: nada que lo pueda ocultar.
    await expect(disclaimer.getByRole('button')).toHaveCount(0);
  });

  test('HALLAZGO — falta DataReference pese a manejar datos normativos con caducidad', async ({ page }) => {
    await page.goto(RUTA);

    // La app fija cuantías (300/200 €), duración (48 meses), tope del 60 % y límites de renta
    // (600/900 €) atribuidos al RD 326/2026, pero no declara fecha de verificación ni enlace
    // a la fuente oficial. _private/DISCLAIMER-POLICY.md §6 lo exige para datos con caducidad.
    // Cuando se añada el componente, este test debe invertirse a toHaveCount(1).
    await expect(page.locator('[role="note"][aria-label="Datos de referencia normativos"]')).toHaveCount(0);
  });
});

test.describe('Simulador Bono Joven Alquiler — casos resueltos a mano', () => {
  /**
   * CASO 1 — NORMAL: perfil que cumple los siete requisitos.
   *
   * Vivienda completa, renta 600 €/mes.
   *   Tope del programa (BONO.vivienda)            = 300 €/mes
   *   Tope del 60 % de la renta: 600 × 0,60        = 360 €/mes
   *   Ayuda = min(300; 360)                        = 300,00 €/mes   ← manda el tope del programa
   *   Pago real = 600 − 300                        = 300,00 €/mes
   *   Máximo en 4 años = 300 × 48 (DURACION_MAX)   = 14.400,00 €
   * Como el tope del 60 % no muerde, la nota «Límite: 60% de la renta» NO debe aparecer.
   * Coincide con el escenario «Recién graduada, 23 años» del bloque educativo de la app.
   */
  test('CASO 1 NORMAL — vivienda a 600 €/mes y los siete requisitos cumplidos', async ({ page }) => {
    await page.goto(RUTA);
    await page.fill('#alquiler', '600');

    expect(await valorPanel(page, 'Ayuda mensual')).toBe('300,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('300,00 €');
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('14.400,00 €');
    await expect(page.locator('[class*="ahorroNota"]')).toHaveCount(0);

    await responderTodoSi(page);

    const resultado = await textoResultado(page);
    expect(resultado).toContain('¡Cumples todos los requisitos!');
    expect(resultado).toContain('300,00 €/mes durante hasta 4 años');
    expect(resultado).toContain('2 años renovables');
    expect(resultado).not.toContain('NaN');
  });

  /**
   * CASO 2 — LÍMITE: justo en el punto donde el tope del 60 % empieza a morder.
   *
   * El corte está en la renta R que hace 0,60 × R = 300 → R = 500,00 €/mes.
   *   R = 500 €: min(300; 500 × 0,60 = 300)        = 300,00 €/mes  ← empate exacto, sin nota
   *              pago real = 500 − 300             = 200,00 €/mes
   *   R = 499 €: min(300; 499 × 0,60 = 299,40)     = 299,40 €/mes  ← manda el 60 %, con nota
   *              pago real = 499 − 299,40          = 199,60 €/mes
   * Un euro de renta separa los dos regímenes: es el borde exacto del cálculo.
   *
   * En habitación el corte se desplaza a 200 / 0,60 = 333,33 €/mes.
   */
  test('CASO 2 LÍMITE — 500 €/mes es el punto exacto en que el tope del 60 % iguala al del programa', async ({ page }) => {
    await page.goto(RUTA);

    await page.fill('#alquiler', '500');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('300,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('200,00 €');
    // En el empate exacto el aviso del 60 % no debe salir: el tope que manda es el del programa.
    await expect(page.locator('[class*="ahorroNota"]')).toHaveCount(0);

    await page.fill('#alquiler', '499');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('299,40 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('199,60 €');
    await expect(page.locator('[class*="ahorroNota"]').first()).toHaveText('Límite: 60% de la renta');

    // Habitación a 350 €/mes: min(200; 350 × 0,60 = 210) = 200,00 €, manda el tope del programa.
    // Es el escenario «Habitación en piso compartido» del bloque educativo de la app.
    await page.getByRole('button', { name: /Habitación/ }).click();
    await page.fill('#alquiler', '350');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('200,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('150,00 €'); // 350 − 200
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('9600,00 €'); // 200 × 48 meses
    await expect(page.locator('[class*="ahorroNota"]')).toHaveCount(0);
  });

  /**
   * CASO 3 — RECHAZO: perfil no elegible por un requisito IMPRESCINDIBLE.
   *
   * Ser titular de una vivienda en España bloquea la ayuda (requisito `propietario`,
   * `bloqueante: true`). Respondido «No», el veredicto debe ser el de rechazo y explicar
   * por qué, sin NaN ni cifras huérfanas en el texto del veredicto.
   */
  test('CASO 3 RECHAZO — propietario de vivienda: deniega y explica, sin NaN', async ({ page }) => {
    await page.goto(RUTA);
    await page.fill('#alquiler', '600');
    await responderTodoSi(page);
    await responder(page, REQUISITOS.propietario, 'No');

    const resultado = await textoResultado(page);
    expect(resultado).toContain('No cumples los requisitos obligatorios');
    expect(resultado).toContain('requisito imprescindible que no cumples');
    expect(resultado).not.toContain('NaN');
    expect(resultado).not.toContain('No definido');
  });

  test('CASO 3 bis — entradas inválidas: sin panel de ayuda y sin NaN', async ({ page }) => {
    await page.goto(RUTA);

    // Renta negativa: `alquilerNum > 0` es falso → el panel de ahorro no se pinta.
    await page.fill('#alquiler', '-50');
    await expect(page.locator('[class*="ahorroCard"]')).toHaveCount(0);

    // Campo vacío: idem.
    await page.fill('#alquiler', '');
    await expect(page.locator('[class*="ahorroCard"]')).toHaveCount(0);

    // Cero: idem.
    await page.fill('#alquiler', '0');
    await expect(page.locator('[class*="ahorroCard"]')).toHaveCount(0);

    expect(await page.content()).not.toContain('NaN');
  });
});

test.describe('Simulador Bono Joven Alquiler — hallazgos del Inspector (21/08/2026)', () => {
  /**
   * HALLAZGO 1 — «Máximo en 4 años» ignora el tope del 60 % que la tarjeta contigua sí aplica.
   *
   * `totalAyudaMax = bonificacionMaxima * DURACION_MAX_MESES` usa siempre el tope del programa,
   * nunca la ayuda efectiva. Con vivienda a 300 €/mes:
   *   Ayuda mensual = min(300; 300 × 0,60 = 180) = 180,00 €    ← manda el 60 %
   *   Máximo en 4 años COHERENTE = 180 × 48      = 8640,00 €
   *   Máximo en 4 años MOSTRADO  = 300 × 48      = 14.400,00 € ← 5.760 € de más
   * Las otras dos tarjetas del mismo panel sí están personalizadas; esta no.
   * El test fija la conducta OBSERVADA: al corregirse, debe pasar a esperar 8640,00 €.
   */
  test('HALLAZGO — el total a 4 años no aplica el tope del 60 %: 300 €/mes muestra 14.400 € en vez de 8640 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.fill('#alquiler', '300');

    expect(await valorPanel(page, 'Ayuda mensual')).toBe('180,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('120,00 €');
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('14.400,00 €'); // observado; coherente: 8640,00 €
  });

  /**
   * HALLAZGO 2 — el veredicto «apto» anuncia el tope del programa, no la ayuda calculada.
   *
   * La tarjeta de resultado usa `bonificacionMaxima`, así que con una renta de 300 €/mes la
   * misma pantalla dice «Ayuda mensual 180,00 €» arriba y «recibir hasta 300,00 €/mes» abajo.
   */
  test('HALLAZGO — la tarjeta «apto» dice 300,00 €/mes mientras el panel dice 180,00 €', async ({ page }) => {
    await page.goto(RUTA);
    await page.fill('#alquiler', '300');
    await responderTodoSi(page);

    expect(await valorPanel(page, 'Ayuda mensual')).toBe('180,00 €');
    const resultado = await textoResultado(page);
    expect(resultado).toContain('¡Cumples todos los requisitos!');
    expect(resultado).toContain('300,00 €/mes'); // observado; coherente sería 180,00 €/mes
  });

  /**
   * HALLAZGO 3 — el panel de ayuda sigue en pantalla tras un veredicto de rechazo.
   *
   * El panel solo depende de `alquilerNum > 0`, no del veredicto. Un usuario al que la app
   * acaba de decir «No cumples los requisitos obligatorios» sigue leyendo, en la misma
   * pantalla, «Ayuda mensual 300,00 €» y «Máximo en 4 años 14.400,00 €».
   */
  test('HALLAZGO — un perfil rechazado sigue viendo 300,00 €/mes y 14.400,00 € en el panel', async ({ page }) => {
    await page.goto(RUTA);
    await page.fill('#alquiler', '600');
    await responderTodoSi(page);
    await responder(page, REQUISITOS.propietario, 'No');

    expect(await textoResultado(page)).toContain('No cumples los requisitos obligatorios');
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('300,00 €'); // observado
    expect(await valorPanel(page, 'Máximo en 4 años')).toBe('14.400,00 €'); // observado
  });

  /**
   * HALLAZGO 4 — superar el límite de renta que la propia app declara no impide el veredicto verde.
   *
   * El requisito `renta` («no supera 600 €, o 900 € en zonas tensionadas») está marcado
   * `bloqueante: false`. Con una renta de 1.200 €/mes —el doble del límite general— y ese
   * requisito respondido «No», el veredicto es «Cumples los requisitos básicos» y el panel
   * mantiene 300,00 €/mes. Además el simulador nunca cruza la renta tecleada con ese límite:
   * escribir 1.200 € en el campo no dispara ningún aviso.
   */
  test('HALLAZGO — renta de 1.200 €/mes, doble del límite declarado, da «Cumples los requisitos básicos»', async ({ page }) => {
    await page.goto(RUTA);
    await page.fill('#alquiler', '1200');
    await responderTodoSi(page);
    await responder(page, REQUISITOS.renta, 'No');

    const resultado = await textoResultado(page);
    expect(resultado).toContain('Cumples los requisitos básicos'); // observado
    expect(await valorPanel(page, 'Ayuda mensual')).toBe('300,00 €');
    expect(await valorPanel(page, 'Tu pago real')).toBe('900,00 €'); // 1.200 − 300
  });

  /**
   * HALLAZGO 5 — accesibilidad: los catorce botones «Sí»/«No» de la checklist no llevan
   * `type="button"` (regla obligatoria de CLAUDE.md §5). El único otro botón sin `type` de
   * la página pertenece a `TransparencyBanner`, componente compartido fuera de esta app.
   * Lo que sí está bien resuelto es el estado, anunciado con `aria-pressed`.
   */
  test('HALLAZGO — los 14 botones Sí/No de la checklist no declaran type="button"', async ({ page }) => {
    await page.goto(RUTA);

    // 7 requisitos × 2 botones = 14 botones de la checklist sin atributo `type`.
    await expect(page.locator('button[class*="radioBtn"]:not([type])')).toHaveCount(14);
    // Contraprueba: hoy NINGUNO de ellos lo declara.
    await expect(page.locator('button[class*="radioBtn"][type="button"]')).toHaveCount(0);

    const tarjeta = page.locator('[class*="checkCard"]').filter({ hasText: REQUISITOS.edad }).first();
    const botonSi = tarjeta.getByRole('button', { name: 'Sí', exact: true });
    await expect(botonSi).toHaveAttribute('aria-pressed', 'false');
    await botonSi.click();
    await expect(botonSi).toHaveAttribute('aria-pressed', 'true');
  });
});
