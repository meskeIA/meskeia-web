import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';
import { contrasteSobreFondoReal } from './_contraste';

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
 *                           créditos NaN o créditos ≤ 0, y (desde el 23/08/2026, hallazgo 178)
 *                           las notas fuera de 0-10, con aviso. Las suspensas SÍ entran.
 *   · resultadoSimulador  ← X = (objetivo × (credCursados + credRestantes) − actual × credCursados)
 *                               / credRestantes  ; estado «imposible» si X > 10, «difícil» si X > 8
 *   · resultadoEvau       ← acceso = 0,6 × bachillerato + 0,4 × media(fase general)
 *                           bonificación = M1 × 0,2 + M2 × 0,2 (las dos mejores ≥ 5); hasta el
 *                           23/08/2026, (M − 5) × 0,2   ← ver HALLAZGO 1
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
 * HALLAZGOS del 21/08, reparados el 23/08/2026 (tanda 4). Se documentaron aquí como TESTIGO
 * —afirmando el comportamiento defectuoso— y al corregirse se invirtieron, que es lo que
 * aquel encabezado anticipaba. Hoy son la regresión que impide que vuelvan.
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
 *
 * INSPECCIÓN DE CAMBIO del 12/11/2026 — diff a7f3c27f..HEAD, cuatro commits: aced16e6 (a11y,
 * C0437), b74dc2b6 (texto semántico en claro, C0296), ff344392 (una sola FAQ, C0593) y 9b86f89d
 * (iconos de tarjeta, C0661). Esperados calculados ANTES de abrir el navegador:
 *   · C0296 · en claro, «Aprobadas» y «alcanzable» con --verde-texto #136E35, «Suspensas» y
 *     «difícil» con --ambar-texto #8A5A00 e «Imposible» con --rojo-texto #B91C1C, sobre el --hover
 *     #F5F5F5 del módulo: 5,82 · 5,44 · 5,94 : 1 (antes, #10B981 sobre #F5F5F5 daba 2,33). En
 *     oscuro los tokens valen `initial` y manda la reserva del módulo: #10B981 · #F59E0B · #FCA5A5
 *     sobre #333333 = 4,98 · 5,88 · 6,66. Medido igual a 1280 y a 390 px.
 *   · C0593 · el FAQPage y la FAQ visible salen de PREGUNTAS_FRECUENTES: mismas 8 preguntas con
 *     las mismas respuestas. El ejemplo de su 2.ª pregunta —final al 60 %, continua 4 al 40 %,
 *     objetivo 5— resuelto en «¿Qué nota necesito?» (4 · 40 · 5 · 60):
 *     X = (5 × 100 − 4 × 40) / 60 = 340 / 60 = 5,67, que es lo que la FAQ promete.
 *   · ABIERTOS (inspector 12/11/2026), con test.fail() — los casos, en su test:
 *     A. La FAQ del GPA («9-10 → 4,0», «3-4,9 → D») contradice al conversor (9 → 3,60; 3,5 → F)
 *        y a la tabla de equivalencias (0-4,9 → F, que el conversor llama D en 4,5).
 *     B. La fórmula que enseña el panel EvAU sigue siendo «(M1-5)×0.2 + (M2-5)×0.2», la que el
 *        hallazgo 177 retiró del motor, y escribe «0.2» con punto.
 *     C. Con una suspensa, la media incluye la suspensa sin decirlo, cuando la FAQ (RD 1125/2003,
 *        art. 5.3) y el bloque «Errores frecuentes» dicen que el expediente solo cuenta las superadas.
 *     D. Diez iconos de tarjeta (escenarioIcon, tipIcono), la ⭐ de «Fase Específica» y el «+» de
 *        «Añadir materia específica» siguen sin aria-hidden: C0661 solo buscaba eduEscenarioIcon.
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
  /**
   * ⚠️ 13/09/2026 — esperar al <h1> NO es esperar a que la app escuche: ese encabezado viaja
   * en el HTML servido, así que está en pantalla mucho antes de que React haya montado nada.
   * En la suite completa, con la máquina cargada, el último `fill()` del CASO 1 se perdía y
   * la media salía 6,00 en vez de 7,25 — el test medía una asignatura menos. En aislado
   * pasaba siempre, que es lo que hace tan caro verlo.
   *
   * `esperarHidratacion` sondea el rastreador de valor que React instala en cada input
   * controlado: es exactamente la precondición que el test necesita.
   */
  await esperarHidratacion(page, ['input[placeholder="0-10"]', 'input[placeholder="ECTS"]']);
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
    expect(texto).toContain('Peso total (créditos, horas…) 18'); // 6 + 3 + 9
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
    expect(await panel(page)).toContain('Peso total (créditos, horas…) 80');
  });

  test('CASO 2 (límite) · una sola asignatura con un 10', async ({ page }) => {
    // La segunda fila se queda sin nota, así que no cuenta: media = 10×6 / 6 = 10,00
    await nota(page, 0).fill('10');
    await creditos(page, 0).fill('6');

    expect(await valorPrincipal(page)).toBe('10,00');
    const texto = await panel(page);
    expect(texto).toContain('Sobresaliente');
    expect(texto).toContain('Asignaturas 1');
    expect(texto).toContain('Peso total (créditos, horas…) 6');
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

  test('HALLAZGO 2 (reparado) — una nota de 11 se descarta y se avisa', async ({ page }) => {
    // El campo declara la escala «0-10» en su placeholder y ahora la respeta. Antes, 11×6/6
    // daba 11,00 «Sobresaliente» con GPA 4,40 —y la escala GPA acaba en 4,0— y 110 %.
    await nota(page, 0).fill('11');
    await creditos(page, 0).fill('6');

    const texto = await panel(page);
    expect(texto).toContain('fuera del rango 0-10');
    expect(texto).not.toContain('GPA (USA) 4,40');
    expect(texto).not.toContain('Porcentaje 110%');
  });

  test('HALLAZGO 2 (reparado) — una nota de −3 tampoco entra en la media', async ({ page }) => {
    await nota(page, 0).fill('-3');
    await creditos(page, 0).fill('6');

    expect(await panel(page)).toContain('fuera del rango 0-10');
  });

  test('HALLAZGO 4 (reparado) — el peso total que se enseña es el que se ha usado', async ({
    page,
  }) => {
    // (8×4,5 + 6×3) / 7,5 = (36 + 18) / 7,5 = 54 / 7,5 = 7,20. La media siempre fue correcta;
    // lo que no cuadraba era el denominador que se enseñaba al lado, impreso sin decimales.
    await nota(page, 0).fill('8');
    await creditos(page, 0).fill('4,5');
    await nota(page, 1).fill('6');
    await creditos(page, 1).fill('3');

    expect(await valorPrincipal(page)).toBe('7,20');
    expect(await panel(page)).toContain('Peso total (créditos, horas…) 7,50');
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

  test('HALLAZGO 1 (reparado) — la fase específica pondera sobre la nota entera: 10,600', async ({
    page,
  }) => {
    // Acceso 7,600 (caso anterior) más dos específicas de 9 y 6:
    //   0,6·8 + 0,4·7 = 4,80 + 2,80 = 7,60 de acceso
    //   + 9 × 0,2 + 6 × 0,2 = 1,80 + 1,20 = 3,00 de fase específica  →  10,600
    // Reparado el 23/08/2026: antes se restaba 5 antes de ponderar y salía 8,600.
    await page.locator('input[placeholder="Ej: 7,5"]').fill('8');
    const notas = ['7', '6', '8', '7', '9', '6'];
    for (let i = 0; i < notas.length; i++) await nota(page, i).fill(notas[i]);

    expect(await valorPrincipal(page)).toBe('10,600');
    expect(await panel(page)).toContain('Bonificación Específica +3,00');
  });

  test('HALLAZGO 1 (reparado) — el expediente perfecto llega a los 14 que la app anuncia', async ({
    page,
  }) => {
    // Bachillerato 10, las 4 troncales a 10 y las 2 específicas a 10:
    //   0,6·10 + 0,4·10 = 10 de acceso · + 10×0,2 + 10×0,2 = 2 + 2  →  14,000
    // Es exactamente el techo que la propia app anuncia. Antes se quedaba en 12,000.
    await page.locator('input[placeholder="Ej: 7,5"]').fill('10');
    for (let i = 0; i < 6; i++) await nota(page, i).fill('10');

    expect(await valorPrincipal(page)).toBe('14,000');
    const texto = await panel(page);
    expect(texto).toContain('Máximo posible: 14 puntos'); // ...y ahora su fórmula sí lo alcanza
    expect(texto).toContain('Nota de Acceso 10,000');
  });

  test('HALLAZGO 1 (reparado) — una específica aprobada con un 5 justo suma 1,00', async ({
    page,
  }) => {
    // Una materia superada con un 5 justo pondera 5 × 0,2 = 1,00 punto. Antes, al restar 5
    // antes de ponderar, aportaba 0,00: aprobarla no servía de nada.
    await page.locator('input[placeholder="Ej: 7,5"]').fill('8');
    const notas = ['7', '6', '8', '7', '5'];
    for (let i = 0; i < notas.length; i++) await nota(page, i).fill(notas[i]);

    expect(await valorPrincipal(page)).toBe('8,600');
    expect(await panel(page)).toContain('Bonificación Específica +1,00');
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

  test('HALLAZGO 3 (reparado) — Chile 5,8 da 8,00 y se clasifica como 8,00', async ({
    page,
  }) => {
    // (5,8 − 1) / 6 × 10 = 7,999999999999999 en coma flotante. Antes el número se imprimía
    // redondeado a «8,00» pero los umbrales (≥ 8) se evaluaban sobre el valor crudo, así que
    // la cifra contradecía a su propia etiqueta: «B» y «C (Bien)» cuando la tabla de la misma
    // app dice 8,0-8,9 → B+. Reparado redondeando antes de clasificar. Y 5,8 no es rebuscado:
    // es el ejemplo que sugiere el placeholder de Chile.
    await escala(page).selectOption('chile');
    await page.locator('input[placeholder="5,8"]').fill('5,8');

    const texto = (await resultados(page).innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('España (0-10) 8,00');
    expect(texto).toContain('Letra (USA) B+');
    expect(texto).toContain('ECTS (Europa) B (Muy Bien)');
    expect(texto).toContain('Calificación México Muy bien');
  });

  test('HALLAZGO 2 (reparado) — un 15 en la escala 0-10 se avisa en vez de recortarse', async ({
    page,
  }) => {
    // Antes se recortaba a [0, 10] sin avisar: quien tecleaba 15 por error veía un 10 con
    // pinta de resultado legítimo. Ahora se dice cuál es el rango de la escala elegida.
    await page.locator('input[placeholder="7,5"]').fill('15');

    await expect(resultados(page)).toHaveCount(0);
    const cuerpo = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(cuerpo).toContain('Revisa el valor');
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

  test('HALLAZGO 5 (reparado) — las 3 pestañas exponen su estado y llevan type', async ({
    page,
  }) => {
    for (const nombre of [/Media Ponderada/, /Simulador EvAU/, /Conversor Escalas/]) {
      const boton = page.getByRole('button', { name: nombre });
      // Regla obligatoria del proyecto (CLAUDE.md §5): type="button" siempre, y aria-pressed
      // en todo botón que cambie un estado visual. Antes el estado activo viajaba solo por la
      // clase CSS, así que con lector de pantalla las tres pestañas sonaban idénticas.
      expect(await boton.getAttribute('type')).toBe('button');
      expect(await boton.getAttribute('aria-pressed')).not.toBeNull();
    }
  });
});

test.describe('JSON-LD', () => {
  test('C0593 · un solo FAQPage, con las preguntas de la FAQ visible', async ({ page }) => {
    await page.goto(RUTA);
    await comprobarFaqPageUnico(page);
  });

  test('C0593 · el FAQPage dice lo mismo que la FAQ visible, pregunta a pregunta y respuesta a respuesta', async ({
    page,
  }) => {
    // Las dos salen de PREGUNTAS_FRECUENTES (metadata.ts) desde ff344392: 8 pares idénticos.
    const { ld, visible } = await page.evaluate(() => {
      let ld: string[][] = [];
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
        };
        if (j['@type'] === 'FAQPage' && j.mainEntity) {
          ld = j.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]);
        }
      }
      const visible = Array.from(document.querySelectorAll('[class*="faqItem"]'))
        .filter((d) => d.querySelector('[class*="faqPregunta"]'))
        .map((d) => [
          d.querySelector('[class*="faqPregunta"]')?.textContent ?? '',
          d.querySelector('[class*="faqRespuesta"]')?.textContent ?? '',
        ]);
      return { ld, visible };
    });
    expect(visible).toHaveLength(8);
    expect(ld).toEqual(visible);
  });
});

/** Respuesta de la FAQ visible cuya pregunta casa con el patrón (la FAQ nace plegada: textContent). */
async function respuestaFaq(page: Page, pregunta: RegExp): Promise<string> {
  const pares = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class*="faqItem"]'))
      .filter((d) => d.querySelector('[class*="faqPregunta"]'))
      .map((d) => [
        d.querySelector('[class*="faqPregunta"]')?.textContent ?? '',
        d.querySelector('[class*="faqRespuesta"]')?.textContent ?? '',
      ]),
  );
  const par = pares.find(([q]) => pregunta.test(q));
  if (!par) throw new Error(`No hay ninguna pregunta de la FAQ que case con ${pregunta}`);
  return par[1];
}

test.describe('Inspección de cambio 12/11/2026 — texto semántico en claro (C0296)', () => {
  for (const tema of ['light', 'dark'] as const) {
    test(`${tema} · Aprobadas, Suspensas y las tres notas del simulador llegan a 4,5:1`, async ({
      page,
    }) => {
      if (tema === 'dark') {
        await page.addInitScript((t) => window.localStorage.setItem('meskeia-theme', t), tema);
        await page.goto(RUTA);
        await esperarHidratacion(page, ['input[placeholder="0-10"]', 'input[placeholder="ECTS"]']);
      }
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);

      // 8 con 6 ECTS y 3 con 6 ECTS: una aprobada y una suspensa, para que las dos tarjetas pinten.
      await nota(page, 0).fill('8');
      await creditos(page, 0).fill('6');
      await nota(page, 1).fill('3');
      await creditos(page, 1).fill('6');
      await expect(page.locator('[class*="resultadoValor"]').first()).toHaveText('5,50');

      // Esperado (cabecera): claro 5,82 y 5,44 · oscuro 4,98 y 5,88. Antes del lote, en claro, 2,33.
      const aprobadas = page.locator('[class*="statCard"][class*="success"] [class*="statValue"]');
      const suspensas = page.locator('[class*="statCard"][class*="warning"] [class*="statValue"]');
      await expect(aprobadas).toHaveText('1');
      await expect(suspensas).toHaveText('1');
      expect(await contrasteSobreFondoReal(aprobadas)).toBeGreaterThanOrEqual(4.5);
      expect(await contrasteSobreFondoReal(suspensas)).toBeGreaterThanOrEqual(4.5);

      // Los tres estados del simulador (sus cifras, en los CASOS de arriba).
      const valor = page.locator('[class*="simuladorResultadoValor"]');
      for (const [a, b, c, d, esperado] of [
        ['5', '100', '8', '20', 'Imposible'], // X = 23 → rojo · claro 5,94 · oscuro 6,66
        ['6,5', '120', '7,5', '60', '9,50'], // X = 9,50 → ámbar · 5,44 · 5,88
        ['6,5', '120', '7', '60', '8,00'], // X = 8,00 → verde · 5,82 · 4,98
      ] as const) {
        await pedirNotaNecesaria(page, a, b, c, d);
        await expect(valor).toHaveText(esperado);
        expect(await contrasteSobreFondoReal(valor), `«${esperado}» en ${tema}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

test.describe('Inspección de cambio 12/11/2026 — lo que dice la FAQ única (C0593)', () => {
  test('el ejemplo de la FAQ «examen final» sale en «¿Qué nota necesito?»: 5,67', async ({ page }) => {
    // FAQ: «Si el examen final vale un 60% y tienes un 4 en la evaluación continua (40%) …
    // nota_final ≥ (5 - 1,6) / 0,6 = 5,67. La calculadora puede resolver este cálculo».
    // Con los porcentajes en el lugar de los créditos: X = (5 × (40 + 60) − 4 × 40) / 60
    // = (500 − 160) / 60 = 340 / 60 = 5,6667 → «5,67», que no pasa de 8 → «alcanzable».
    const faq = await respuestaFaq(page, /examen final para aprobar/);
    expect(faq).toContain('5,67');
    const texto = await pedirNotaNecesaria(page, '4', '40', '5', '60');
    expect(texto).toContain('5,67');
    expect(texto).toContain('Objetivo alcanzable');
  });

  test('ABIERTO A (inspector 12/11/2026) — la FAQ del GPA no contradice al conversor ni a la tabla', async ({
    page,
  }) => {
    // FAQ: «9-10 → 4,0 (A), 7-8,9 → 3,0-3,9 (B), 5-6,9 → 2,0-2,9 (C), 3-4,9 → 1,0-1,9 (D),
    // 0-2,9 → 0,0 (F)». El conversor es lineal (nota / 10 × 4) con letra D desde 4:
    //   9 → 3,60 · A   7 → 2,80 · B   4,5 → 1,80 · D   3,5 → 1,40 · F
    // y la tabla de equivalencias de la misma pestaña pone «0 - 4,9 … 0 - 1,9 F», sin D.
    // Tres versiones de la misma conversión en una página: la reparación las deja en una.
    test.fail();
    const faq = await respuestaFaq(page, /GPA/);
    await page.getByRole('button', { name: /Conversor Escalas/ }).click();
    const entrada = page.locator('input[placeholder="7,5"]');
    const resultados = page.locator('[class*="conversorResultados"]');
    const convertir = async (n: string): Promise<{ gpa: string; letra: string }> => {
      await entrada.fill(n);
      await expect(resultados).toBeVisible();
      const t = (await resultados.innerText()).replace(/\s+/g, ' ');
      return {
        gpa: t.match(/GPA USA \(0-4\) ([\d,]+)/)?.[1] ?? '',
        letra: t.match(/Letra \(USA\) (\S+)/)?.[1] ?? '',
      };
    };
    const n9 = await convertir('9');
    const n7 = await convertir('7');
    const n45 = await convertir('4,5');
    const n35 = await convertir('3,5');
    const filaSuspenso = (
      await page.locator('table[class*="tablaConversion"] tbody tr').last().innerText()
    ).replace(/\s+/g, ' ');

    const contradicciones: string[] = [];
    if (faq.includes('9-10 → 4,0') && n9.gpa !== '4,00')
      contradicciones.push(`9: la FAQ dice GPA 4,0 y el conversor ${n9.gpa}`);
    if (faq.includes('7-8,9 → 3,0') && n7.gpa !== '3,00')
      contradicciones.push(`7: la FAQ dice GPA 3,0 y el conversor ${n7.gpa}`);
    if (faq.includes('3-4,9 → 1,0-1,9 (D)') && n35.letra !== 'D')
      contradicciones.push(`3,5: la FAQ dice D y el conversor ${n35.letra}`);
    if (/^0 - 4,9 .* F/.test(filaSuspenso) && n45.letra === 'D')
      contradicciones.push(`4,5: la tabla dice F y el conversor ${n45.letra}`);
    expect(contradicciones).toEqual([]);
  });
});

test.describe('Inspección de cambio 12/11/2026 — abiertos en el resto de lo tocado', () => {
  test('ABIERTO B (inspector 12/11/2026) — la fórmula del panel EvAU es la que calcula: M × 0,2', async ({
    page,
  }) => {
    // Bachillerato 8, troncales 7-6-8-7, específicas 9 y 6:
    //   acceso 0,6·8 + 0,4·7 = 7,600 · motor y FAQ («máximo +2 por materia»): 9×0,2 + 6×0,2 = 3,00
    //   → 10,600. La fórmula escrita en el panel, «Nota Acceso + (M1-5)×0.2 + (M2-5)×0.2», da
    //   7,600 + 0,80 + 0,20 = 8,600: es la del hallazgo 177, que se reparó en el motor y no aquí.
    //   Y «0.2» va con punto (CLAUDE.md §2), también en «Las 2 mejores notas (≥5) ponderan ×0.2».
    test.fail();
    await page.getByRole('button', { name: /Simulador EvAU/ }).click();
    await page.locator('input[placeholder="Ej: 7,5"]').fill('8');
    const notas = ['7', '6', '8', '7', '9', '6'];
    for (let i = 0; i < notas.length; i++) await nota(page, i).fill(notas[i]);
    expect(await valorPrincipal(page)).toBe('10,600');
    expect(await panel(page)).toContain('Bonificación Específica +3,00');

    const formula = (await panel(page)).split('Fórmula:')[1] ?? '';
    expect(formula).toContain('Nota Admisión');
    expect(formula).not.toContain('-5)');
    expect(formula).not.toMatch(/\d\.\d/);
    expect(await page.getByText(/Las 2 mejores notas/).innerText()).not.toMatch(/\d\.\d/);
  });

  test('ABIERTO C (inspector 12/11/2026) — con una suspensa, el panel da la media del expediente oficial: 8,00', async ({
    page,
  }) => {
    // 8 con 6 ECTS y 3 con 6 ECTS. La app da (48 + 18) / 12 = 5,50 «Aprobado» con «Suspensas 1».
    // El expediente oficial, según la FAQ de la propia app y el RD 1125/2003, art. 5.3 (BOE, «el
    // total de créditos obtenidos», los que se obtienen al superar la materia), solo cuenta las
    // superadas: 8 × 6 / 6 = 8,00. El bloque «Errores frecuentes» llama a incluir las suspensas
    // «error», y la tarjeta «Universitario» invita a «calcular tu expediente académico».
    test.fail();
    await nota(page, 0).fill('8');
    await creditos(page, 0).fill('6');
    await nota(page, 1).fill('3');
    await creditos(page, 1).fill('6');
    await expect(page.locator('[class*="resultadoValor"]').first()).not.toHaveText('—');
    expect(await panel(page)).toContain('8,00');
  });

  test('ABIERTO D (inspector 12/11/2026) — los iconos de tarjeta, la ⭐ y el «+» no se leen', async ({
    page,
  }) => {
    // 9b86f89d (C0661) puso aria-hidden al ⚠️ de warningIcono, pero el detector buscaba
    // eduEscenarioIcon/eduTipIcono y aquí las clases son escenarioIcon (4) y tipIcono (6): esos
    // diez siguen leyéndose («📚Estudiante de Bachillerato»). Igual la ⭐ del <h3> «Fase
    // Específica (Voluntaria)» y el «+» de «Añadir materia específica», en la línea a la que
    // aced16e6 añadió type="button" (el «+» de «Añadir asignatura» sí lo lleva).
    test.fail();
    const iconos = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('span[class*="escenarioIcon"], span[class*="tipIcono"], span[class*="warningIcono"]'),
      ).map((s) => ({ texto: s.textContent ?? '', oculto: s.getAttribute('aria-hidden') === 'true' })),
    );
    expect(iconos).toHaveLength(11); // 4 + 6 + 1: si cambia, el test ya no mira lo que creía
    expect(iconos.filter((i) => !i.oculto).map((i) => i.texto)).toEqual([]);

    await page.getByRole('button', { name: /Simulador EvAU/ }).click();
    await expect(
      page.getByRole('heading', { name: 'Fase Específica (Voluntaria)', exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByRole('button', { name: 'Añadir materia específica', exact: true }),
    ).toHaveCount(1);
  });
});
