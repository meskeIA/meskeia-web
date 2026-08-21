import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — calculadora-notas (segmento interactiva, riesgo 3, 459 usos reales)
 *
 * Primera inspección: 21/08/2026. La app promete en su <h1> «Calculadora de Notas: Media
 * Ponderada y Promedio Ponderado» y en su subtítulo «Media ponderada (promedio ponderado),
 * simulador EvAU (España) y conversor de escalas entre España, México, Argentina, Chile,
 * Colombia, Perú, Venezuela, GPA USA y porcentaje». La metadata añade «¿qué nota necesito
 * para aprobar?» y «notas por créditos ECTS». Hay, por tanto, cuatro motores comprobables.
 *
 * DÓNDE VIVE EL CÁLCULO — app/calculadora-notas/page.tsx
 *   · resultadoMedia      ← Σ(nota × créditos) / Σ(créditos), descartando filas con nota NaN,
 *                           créditos NaN o créditos ≤ 0. NO hay validación de rango de la nota.
 *   · resultadoSimulador  ← X = (objetivo × (credCursados + credRestantes) − actual × credCursados)
 *                               / credRestantes  ; estado «imposible» si X > 10, «difícil» si X > 8
 *   · resultadoEvau       ← acceso = 0,6 × bachillerato + 0,4 × media(fase general)
 *                           bonificación = (M1 − 5) × 0,2 + (M2 − 5) × 0,2   ← ver HALLAZGO 1
 *   · convertirNota()     ← normaliza a 0-10 y de ahí a cada escala:
 *                           Chile (n−1)/6×10 · Colombia n×2 · Perú/Venezuela n/2 ·
 *                           GPA n/4×10 · porcentaje n/10 ; luego recorta a [0, 10]
 *   lib/formatters.ts     ← formatNumber, salida en es-ES (coma decimal)
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — media ponderada de 3 asignaturas
 *       (7×6 + 5×3 + 9×9) / (6+3+9) = (42 + 15 + 81) / 18 = 138 / 18 = 7,6667 → «7,67»
 *       La media ARITMÉTICA sería (7+5+9)/3 = 7,00: el test distingue una de otra.
 *       GPA = 7,6667/10 × 4 = 3,0667 → «3,07» · porcentaje = 76,67 → «77%»
 *     Y el fallo clásico de estas apps —dividir entre 100 en vez de entre Σpesos— con pesos
 *     porcentuales que NO suman 100:
 *       8×50 + 6×30 = 400 + 180 = 580 ; 580 / 80 = 7,25   (dividir entre 100 daría 5,80)
 *
 *   CASO 2 (límite) — el 0, el 10, una sola asignatura, pesos que suman 0 y lo imposible
 *       una sola asignatura 10 con 6 ECTS → 10,00 · GPA 4,00 · 100%
 *       nota 0 → 0,00 «Suspenso», y el bloque de equivalencias se oculta (exige media > 0)
 *       todos los créditos a 0 → ninguna fila válida → «—», nunca NaN
 *       «¿qué nota necesito?» imposible: media 5 con 100 créditos, objetivo 8, restan 20
 *         X = (8 × 120 − 5 × 100) / 20 = (960 − 500) / 20 = 23 → debe decir «Imposible»,
 *         no «23,00», que es justo el fallo que se buscaba.
 *       objetivo ya superado: media 8 con 120 créditos, objetivo 5, restan 60
 *         X = (5 × 180 − 8 × 120) / 60 = (900 − 960) / 60 = −1 → 0,00 + aviso, no «−1,00».
 *
 *   CASO 3 (rechazo) — fuera de rango, texto y vacío
 *       «abc» y vacío → la fila se descarta y el panel muestra «—». Correcto, sin NaN.
 *       11 y −3 → la escala que declara el propio campo es «0-10»: deberían rechazarse.
 *
 * HALLAZGOS ABIERTOS (se documentan aquí como TESTIGO, NO se corrigen desde el test).
 * Si algún día se arreglan, los bloques marcados TESTIGO fallarán y habrá que invertirlos.
 *   1. EvAU · la bonificación de la fase específica usa (M − 5) × 0,2 en lugar de M × ponderador.
 *      La fórmula oficial es admisión = 0,6·NMB + 0,4·CFG + a·M1 + b·M2 con a,b ∈ {0,1; 0,2}
 *      sobre la nota entera de la materia superada (≥5). La propia app se contradice: el panel
 *      anuncia «Máximo posible: 14 puntos» y su FAQ dice «máximo +2 por materia», pero con
 *      (M−5)×0,2 el techo real es 12,000 y una materia con un 5 justo aporta 0,00.
 *   2. Media ponderada · no valida el rango: un 11 da media 11,00 «Sobresaliente», GPA 4,40
 *      (fuera de la escala 0-4) y 110%; un −3 da media −3,00.
 *   3. Conversor · Chile 5,8 —el ejemplo que propone el propio placeholder— sale 7,999999…
 *      por coma flotante: muestra «8,00» pero clasifica con los umbrales de 7,9 → letra «B» y
 *      «C (Bien)», cuando la tabla de equivalencias de la propia app dice 8,0-8,9 → «B+».
 *   4. Media ponderada · el total de créditos se imprime con 0 decimales: 4,5 + 3 = 7,5 se
 *      muestra como «8» mientras la media sí divide entre 7,5.
 *   5. Accesibilidad · ninguno de los 7 <button> propios lleva type="button", las 3 pestañas no
 *      exponen aria-pressed ni role="tab"+aria-selected (el estado activo viaja solo por la
 *      clase CSS) y los emojis decorativos no llevan aria-hidden="true".
 */

const RUTA = '/calculadora-notas/';

/** Nota de la fila i de la pestaña activa (todas usan el placeholder «0-10»). */
const nota = (page: Page, i: number) => page.locator('input[placeholder="0-10"]').nth(i);
/** Créditos ECTS de la fila i (pestaña Media Ponderada). */
const creditos = (page: Page, i: number) => page.locator('input[placeholder="ECTS"]').nth(i);

/** Texto del panel de resultados, con los espacios normalizados a uno solo. */
async function panel(page: Page): Promise<string> {
  return (await page.locator('[class*="resultadoPanel"]').first().innerText()).replace(/\s+/g, ' ').trim();
}

/** Valor grande del resultado principal (la media, o la nota de admisión en EvAU). */
async function valorPrincipal(page: Page): Promise<string> {
  return (await page.locator('[class*="resultadoValor"]').first().innerText()).trim();
}

/** Bloque del simulador «¿qué nota necesito?». */
async function simulador(page: Page): Promise<string> {
  return (await page.locator('[class*="simuladorResultado"]').first().innerText()).replace(/\s+/g, ' ').trim();
}

/** Rellena las cuatro casillas del simulador «¿qué nota necesito?». */
async function pedirNotaNecesaria(
  page: Page,
  mediaActual: string,
  credCursados: string,
  objetivo: string,
  credRestantes: string,
): Promise<string> {
  await page.locator('input[placeholder="6,5"]').fill(mediaActual);
  await page.locator('input[placeholder="120"]').fill(credCursados);
  await page.locator('input[placeholder="7,0"]').fill(objetivo);
  await page.locator('input[placeholder="60"]').fill(credRestantes);
  return simulador(page);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Calculadora de Notas: Media Ponderada y Promedio Ponderado',
  );
});

test.describe('Media ponderada — lo que promete el <h1>', () => {
  test('CASO 1 (normal) · (7×6 + 5×3 + 9×9) / 18 = 7,67 y no 7,00', async ({ page }) => {
    // 42 + 15 + 81 = 138 ; 138 / 18 = 7,6667 → 7,67. La media aritmética daría 7,00.
    await nota(page, 0).fill('7');
    await creditos(page, 0).fill('6');
    await nota(page, 1).fill('5');
    await creditos(page, 1).fill('3');
    await page.getByRole('button', { name: /Añadir asignatura/ }).click();
    await nota(page, 2).fill('9');
    await creditos(page, 2).fill('9');

    expect(await valorPrincipal(page)).toBe('7,67');
    const texto = await panel(page);
    expect(texto).toContain('Notable'); // 7,67 está entre 7 y 9
    expect(texto).toContain('Asignaturas 3');
    expect(texto).toContain('Créditos ECTS 18'); // 6 + 3 + 9
    expect(texto).toContain('Aprobadas 3');
    expect(texto).toContain('Suspensas 0');
    expect(texto).toContain('GPA (USA) 3,07'); // 7,6667 / 10 × 4 = 3,0667
    expect(texto).toContain('Porcentaje 77%'); // 7,6667 × 10 = 76,67
    expect(texto).not.toContain('7,00'); // no ha caído en la media aritmética
  });

  test('CASO 1 (normal) · pesos que NO suman 100: 580 / 80 = 7,25 (no 5,80)', async ({ page }) => {
    // Usando los pesos como porcentajes: 8×50 + 6×30 = 580. Divide entre Σpesos = 80, no entre 100.
    await nota(page, 0).fill('8');
    await creditos(page, 0).fill('50');
    await nota(page, 1).fill('6');
    await creditos(page, 1).fill('30');

    expect(await valorPrincipal(page)).toBe('7,25');
    expect(await panel(page)).toContain('Créditos ECTS 80');
  });

  test('CASO 2 (límite) · una sola asignatura con un 10', async ({ page }) => {
    // La segunda fila se queda sin nota, así que no cuenta: media = 10×6 / 6 = 10,00
    await nota(page, 0).fill('10');
    await creditos(page, 0).fill('6');

    expect(await valorPrincipal(page)).toBe('10,00');
    const texto = await panel(page);
    expect(texto).toContain('Sobresaliente');
    expect(texto).toContain('Asignaturas 1');
    expect(texto).toContain('Créditos ECTS 6');
    expect(texto).toContain('GPA (USA) 4,00'); // 10 / 10 × 4
    expect(texto).toContain('Porcentaje 100%');
  });

  test('CASO 2 (límite) · el 0 es una nota válida, no un campo vacío', async ({ page }) => {
    // 0×6 / 6 = 0,00 → cuenta como suspensa, y las equivalencias se ocultan (exigen media > 0)
    await nota(page, 0).fill('0');
    await creditos(page, 0).fill('6');

    expect(await valorPrincipal(page)).toBe('0,00');
    const texto = await panel(page);
    expect(texto).toContain('Suspenso');
    expect(texto).toContain('Asignaturas 1');
    expect(texto).toContain('Suspensas 1');
    expect(texto).not.toContain('GPA'); // sin equivalencias con media 0
  });

  test('CASO 2 (límite) · pesos que suman 0 → «—», nunca NaN ni 0/0', async ({ page }) => {
    await nota(page, 0).fill('7');
    await creditos(page, 0).fill('0');
    await nota(page, 1).fill('8');
    await creditos(page, 1).fill('0');

    expect(await valorPrincipal(page)).toBe('—');
    const texto = await panel(page);
    expect(texto).toContain('Asignaturas 0');
    expect(texto).not.toMatch(/NaN|Infinity|undefined|No definido/);
  });

  test('CASO 3 (rechazo) · texto y vacío se descartan sin ensuciar el resultado', async ({ page }) => {
    await nota(page, 0).fill('abc');
    await creditos(page, 0).fill('6');
    // la fila 2 se queda vacía a propósito
    expect(await valorPrincipal(page)).toBe('—');
    expect(await panel(page)).not.toMatch(/NaN|Infinity|undefined|No definido/);
  });

  test('CASO 3 (rechazo) · créditos negativos SÍ se descartan', async ({ page }) => {
    // −6 créditos no supera el filtro creditos > 0: solo cuenta la segunda fila → 4×6 / 6 = 4,00
    await nota(page, 0).fill('8');
    await creditos(page, 0).fill('-6');
    await nota(page, 1).fill('4');
    await creditos(page, 1).fill('6');

    expect(await valorPrincipal(page)).toBe('4,00');
    expect(await panel(page)).toContain('Asignaturas 1');
  });

  test('TESTIGO · HALLAZGO 2: una nota de 11 se acepta y contamina las equivalencias', async ({
    page,
  }) => {
    // El campo declara la escala «0-10» en su placeholder, pero no valida nada:
    // 11×6 / 6 = 11,00 → «Sobresaliente», GPA 11/10×4 = 4,40 (la escala GPA acaba en 4,0) y 110%.
    // Lo correcto sería rechazar la fila o avisar. Cuando se corrija, invertir estos expect.
    await nota(page, 0).fill('11');
    await creditos(page, 0).fill('6');

    expect(await valorPrincipal(page)).toBe('11,00');
    const texto = await panel(page);
    expect(texto).toContain('Sobresaliente');
    expect(texto).toContain('GPA (USA) 4,40');
    expect(texto).toContain('Porcentaje 110%');
  });

  test('TESTIGO · HALLAZGO 2: una nota de −3 también se acepta', async ({ page }) => {
    // −3×6 / 6 = −3,00. Cuando se corrija, invertir este expect.
    await nota(page, 0).fill('-3');
    await creditos(page, 0).fill('6');

    expect(await valorPrincipal(page)).toBe('-3,00');
    expect(await panel(page)).toContain('Suspenso');
  });

  test('TESTIGO · HALLAZGO 4: 4,5 + 3 créditos se imprimen como «8» aunque la media divide entre 7,5', async ({
    page,
  }) => {
    // (8×4,5 + 6×3) / 7,5 = (36 + 18) / 7,5 = 54 / 7,5 = 7,20 ← la media es correcta,
    // pero el total de créditos sale con 0 decimales y 7,5 se redondea a 8.
    await nota(page, 0).fill('8');
    await creditos(page, 0).fill('4,5');
    await nota(page, 1).fill('6');
    await creditos(page, 1).fill('3');

    expect(await valorPrincipal(page)).toBe('7,20');
    expect(await panel(page)).toContain('Créditos ECTS 8'); // debería decir 7,5
  });
});

test.describe('«¿Qué nota necesito?» — el despeje que promete la metadata', () => {
  test('CASO 1 (normal) · media 6,5 en 120 créditos, objetivo 7,0 con 60 por delante → 8,00', async ({
    page,
  }) => {
    // X = (7,0 × (120 + 60) − 6,5 × 120) / 60 = (1.260 − 780) / 60 = 480 / 60 = 8,00
    const texto = await pedirNotaNecesaria(page, '6,5', '120', '7', '60');
    expect(texto).toContain('8,00');
    expect(texto).toContain('Objetivo alcanzable'); // 8,00 no supera el umbral de «difícil» (> 8)
  });

  test('CASO 1 (normal) · el mismo despeje con objetivo 7,5 → 9,50 y aviso de dificultad', async ({
    page,
  }) => {
    // X = (7,5 × 180 − 780) / 60 = (1.350 − 780) / 60 = 570 / 60 = 9,50 → > 8 → «difícil»
    const texto = await pedirNotaNecesaria(page, '6,5', '120', '7,5', '60');
    expect(texto).toContain('9,50');
    expect(texto).toContain('Difícil pero posible');
  });

  test('CASO 2 (límite) · lo imposible se dice, no se imprime un 23', async ({ page }) => {
    // X = (8 × (100 + 20) − 5 × 100) / 20 = (960 − 500) / 20 = 460 / 20 = 23 → fuera de la escala
    const texto = await pedirNotaNecesaria(page, '5', '100', '8', '20');
    expect(texto).toContain('Imposible');
    expect(texto).toContain('No es posible alcanzar el objetivo con los créditos restantes');
    expect(texto).not.toContain('23');
  });

  test('CASO 2 (límite) · objetivo ya superado → 0,00 y aviso, no un negativo', async ({ page }) => {
    // X = (5 × 180 − 8 × 120) / 60 = (900 − 960) / 60 = −1 → se recorta a 0 y se explica
    const texto = await pedirNotaNecesaria(page, '8', '120', '5', '60');
    expect(texto).toContain('0,00');
    expect(texto).toContain('Ya has superado tu objetivo');
    expect(texto).not.toContain('-1');
  });

  test('CASO 3 (rechazo) · sin créditos restantes no se inventa una nota', async ({ page }) => {
    // credRestantes = 0 haría una división por cero: el bloque entero no debe renderizarse.
    await page.locator('input[placeholder="6,5"]').fill('6,5');
    await page.locator('input[placeholder="120"]').fill('120');
    await page.locator('input[placeholder="7,0"]').fill('7');
    await page.locator('input[placeholder="60"]').fill('0');
    await expect(page.locator('[class*="simuladorResultado"]')).toHaveCount(0);
  });
});

test.describe('Simulador EvAU', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: /Simulador EvAU/ }).click();
  });

  test('CASO 1 (normal) · la nota de ACCESO sí sale bien: 0,6×8 + 0,4×7 = 7,600', async ({
    page,
  }) => {
    // Fase general = media aritmética de (7, 6, 8, 7) = 28 / 4 = 7,00
    // Acceso = 8 × 0,6 + 7 × 0,4 = 4,80 + 2,80 = 7,60
    await page.locator('input[placeholder="Ej: 7,5"]').fill('8');
    const notas = ['7', '6', '8', '7'];
    for (let i = 0; i < notas.length; i++) await nota(page, i).fill(notas[i]);

    const texto = await panel(page);
    expect(texto).toContain('Nota de Acceso 7,600');
    expect(texto).toContain('Media Fase General 7,00');
    expect(texto).toContain('60% Bachillerato 4,80');
  });

  test('TESTIGO · HALLAZGO 1: la fase específica resta 5 antes de ponderar (8,600 en vez de 10,600)', async ({
    page,
  }) => {
    // Acceso 7,600 (caso anterior) más dos específicas de 9 y 6:
    //   Oficial : 7,60 + 9 × 0,2 + 6 × 0,2 = 7,60 + 1,80 + 1,20 = 10,600
    //   La app  : 7,60 + (9−5) × 0,2 + (6−5) × 0,2 = 7,60 + 0,80 + 0,20 = 8,600
    // Cuando se corrija, invertir estos expect.
    await page.locator('input[placeholder="Ej: 7,5"]').fill('8');
    const notas = ['7', '6', '8', '7', '9', '6'];
    for (let i = 0; i < notas.length; i++) await nota(page, i).fill(notas[i]);

    expect(await valorPrincipal(page)).toBe('8,600');
    expect(await panel(page)).toContain('Bonificación Específica +1,00'); // oficial: +3,00
  });

  test('TESTIGO · HALLAZGO 1: el expediente perfecto se queda en 12,000 y el panel anuncia 14', async ({
    page,
  }) => {
    // Bachillerato 10, las 4 troncales a 10 y las 2 específicas a 10:
    //   Oficial : 10 + 2 + 2 = 14,000 ← es el techo que anuncia la propia app
    //   La app  : 10 + (10−5)×0,2 + (10−5)×0,2 = 10 + 1 + 1 = 12,000
    await page.locator('input[placeholder="Ej: 7,5"]').fill('10');
    for (let i = 0; i < 6; i++) await nota(page, i).fill('10');

    expect(await valorPrincipal(page)).toBe('12,000');
    const texto = await panel(page);
    expect(texto).toContain('Máximo posible: 14 puntos'); // ...que su propia fórmula no alcanza
    expect(texto).toContain('Nota de Acceso 10,000');
  });

  test('TESTIGO · HALLAZGO 1: una específica aprobada con un 5 justo suma 0,00 (debería sumar 1,00)', async ({
    page,
  }) => {
    // (5 − 5) × 0,2 = 0. Con la fórmula oficial, 5 × 0,2 = 1,00 punto.
    await page.locator('input[placeholder="Ej: 7,5"]').fill('8');
    const notas = ['7', '6', '8', '7', '5'];
    for (let i = 0; i < notas.length; i++) await nota(page, i).fill(notas[i]);

    expect(await valorPrincipal(page)).toBe('7,600'); // oficial: 8,600
    expect(await panel(page)).toContain('Bonificación Específica +0,00');
  });

  test('CASO 3 (rechazo) · sin nota de bachillerato no se calcula nada', async ({ page }) => {
    const notas = ['7', '6', '8', '7'];
    for (let i = 0; i < notas.length; i++) await nota(page, i).fill(notas[i]);

    expect(await valorPrincipal(page)).toBe('—');
    expect(await panel(page)).not.toMatch(/NaN|undefined/);
  });
});

test.describe('Conversor de escalas', () => {
  const escala = (page: Page) => page.locator('[class*="conversorCard"] select');
  const resultados = (page: Page) => page.locator('[class*="conversorResultados"]');

  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: /Conversor Escalas/ }).click();
  });

  test('CASO 1 (normal) · un 11 peruano sobre 20 es un 5,50 español (aprobado justo)', async ({
    page,
  }) => {
    // Perú: n / 2 = 11 / 2 = 5,50 · Chile: 1 + 5,5/10 × 6 = 4,30 · Colombia: 5,5 / 2 = 2,75
    // GPA: 5,5 / 10 × 4 = 2,20 · porcentaje: 55%
    await escala(page).selectOption('peru');
    await page.locator('input[placeholder="15"]').fill('11');

    const texto = (await resultados(page).innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('España (0-10) 5,50');
    expect(texto).toContain('Chile (1-7) 4,30');
    expect(texto).toContain('Colombia (0-5) 2,75');
    expect(texto).toContain('GPA USA (0-4) 2,20');
    expect(texto).toContain('Porcentaje 55%');
    expect(texto).toContain('Calificación España Aprobado'); // España aprueba con 5
    expect(texto).toContain('Calificación México Reprobado'); // México aprueba con 6
    expect(texto).toContain('Calificación Perú/Venezuela Aprobado'); // Perú aprueba con 11 de 20
  });

  test('CASO 2 (límite) · el tope de cada escala coincide con el de las demás', async ({ page }) => {
    // Chile 7,0 → (7−1)/6 × 10 = 10 → 100%, GPA 4,00, Perú 20,00, Colombia 5,00
    await escala(page).selectOption('chile');
    await page.locator('input[placeholder="5,8"]').fill('7');

    const texto = (await resultados(page).innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('España (0-10) 10,00');
    expect(texto).toContain('Colombia (0-5) 5,00');
    expect(texto).toContain('Venezuela (0-20) 20,00');
    expect(texto).toContain('GPA USA (0-4) 4,00');
    expect(texto).toContain('Letra (USA) A');
  });

  test('TESTIGO · HALLAZGO 3: Chile 5,8 muestra 8,00 pero lo clasifica como si fuera 7,99', async ({
    page,
  }) => {
    // (5,8 − 1) / 6 × 10 = 7,999999999999999 en coma flotante. El número se imprime redondeado
    // a «8,00», pero los umbrales (≥ 8) se evalúan sobre el valor crudo, así que la letra cae a
    // «B» y el ECTS a «C (Bien)» — cuando la tabla de la propia app dice 8,0-8,9 → B+.
    // 5,8 es además el ejemplo que sugiere el placeholder de Chile. Al corregirse, invertir.
    await escala(page).selectOption('chile');
    await page.locator('input[placeholder="5,8"]').fill('5,8');

    const texto = (await resultados(page).innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('España (0-10) 8,00');
    expect(texto).toContain('Letra (USA) B'); // debería ser B+
    expect(texto).toContain('ECTS (Europa) C (Bien)'); // debería ser B (Muy Bien)
    expect(texto).toContain('Calificación México Bien'); // debería ser «Muy bien»
  });

  test('TESTIGO · HALLAZGO 2: un 15 en la escala 0-10 se recorta a 10,00 en silencio', async ({
    page,
  }) => {
    // convertirNota recorta a [0, 10] sin avisar: quien teclea 15 por error ve un 10 legítimo.
    await page.locator('input[placeholder="7,5"]').fill('15');

    const texto = (await resultados(page).innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('España (0-10) 10,00');
    expect(texto).not.toContain('Revisa'); // no aparece ningún aviso de rango
  });

  test('CASO 3 (rechazo) · texto sin números no pinta ninguna tabla de conversión', async ({
    page,
  }) => {
    await page.locator('input[placeholder="7,5"]').fill('abc');
    await expect(resultados(page)).toHaveCount(0);
  });
});

test.describe('Formato español y accesibilidad', () => {
  test('las cifras salen con coma decimal, nunca con punto', async ({ page }) => {
    // (7×6 + 5×3) / 9 = 57 / 9 = 6,3333 → «6,33» en es-ES. Ni «6.33» ni «2.53».
    await nota(page, 0).fill('7');
    await creditos(page, 0).fill('6');
    await nota(page, 1).fill('5');
    await creditos(page, 1).fill('3');

    const texto = await panel(page);
    expect(texto).toContain('6,33');
    expect(texto).toContain('GPA (USA) 2,53'); // 6,3333 / 10 × 4 = 2,5333
    expect(texto).not.toMatch(/\d+\.\d{2}/); // ningún punto decimal a la inglesa
  });

  test('TESTIGO · HALLAZGO 5: las 3 pestañas no exponen su estado y ningún botón lleva type', async ({
    page,
  }) => {
    for (const nombre of [/Media Ponderada/, /Simulador EvAU/, /Conversor Escalas/]) {
      const boton = page.getByRole('button', { name: nombre });
      // Regla obligatoria del proyecto (CLAUDE.md §5): type="button" siempre, y aria-pressed
      // en todo botón que cambie un estado visual. Al corregirse, invertir estos expect.
      expect(await boton.getAttribute('type')).toBeNull();
      expect(await boton.getAttribute('aria-pressed')).toBeNull();
      expect(await boton.getAttribute('aria-selected')).toBeNull();
    }
  });
});
