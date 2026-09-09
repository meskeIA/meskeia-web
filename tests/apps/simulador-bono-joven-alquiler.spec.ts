import { test, expect, Page } from '@playwright/test';
import { BONO_ALQUILER_JOVEN_2026 } from '../../data/fiscal/vivienda-joven';

/**
 * Inspector — simulador-bono-joven-alquiler (segmento fiscal, RIESGO 1 CRÍTICO)
 * Inspeccionada el 02/09/2026 y RE-INSPECCIONADA el 07/09/2026.
 *
 * ── Cómo está organizado este fichero ────────────────────────────────────────
 *   1. CASOS 1-3 y guardianes — la inspección del 02/09/2026. Siguen pasando tal cual.
 *   2. REGRESIÓN 02/09 — los cuatro hallazgos de aquella pasada (596-599), reparados ese
 *      mismo día.
 *   3. CASOS 4-6 y guardianes — los casos nuevos de la re-inspección del 07/09/2026.
 *   4. REGRESIÓN 07/09 — los cuatro hallazgos de esa re-inspección (642-645), reparados el
 *      09/09/2026. Se escribieron con `test.fail()` afirmando lo que DEBERÍA pasar; al
 *      repararlos se les quitó la marca y quedan como regresión.
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Simulador Bono Joven Alquiler»
 *   sub.  «Comprueba si puedes recibir hasta 300 €/mes (vivienda) o 200 €/mes (habitación)
 *          durante hasta 4 años»
 *   ley   «Real Decreto 326/2026, de 22 de abril · Plan Estatal de Vivienda 2026-2030»
 *
 * De dónde sale cada cifra esperada
 * ─────────────────────────────────
 *   TODAS de `data/fiscal/vivienda-joven.ts` (`BONO_ALQUILER_JOVEN_2026`), sellado contra el
 *   texto del BOE el 23/08/2026 — RD 326/2026, BOE-A-2026-8872. Ninguna sale de memoria:
 *
 *     · ayudaMaximaMensual.vivienda   = 300 €   (art. 137)
 *     · ayudaMaximaMensual.habitacion = 200 €   (art. 137)
 *     · limiteSobreRenta              = 0,6     (art. 137 — la ayuda es el MENOR de los dos)
 *     · rentaMaximaMensual.vivienda   = 1.000 € (art. 133.1.e)
 *     · rentaMaximaMensual.municipioPequeno.habitacion = 250 € (art. 133.1.e)
 *     · plazo.totalMaximoMeses        = 48      (art. 134: 24 + prórroga de 24)
 *
 *   El umbral de ingresos que la app enseña en la checklist sale de
 *   `UMBRAL_IPREM_VIVIENDA_JOVEN.general` = 5 (art. 133.1.d) × `IPREM_2026.anual14` = 8.400 €
 *   (`data/fiscal/iprem.ts`, Ley 31/2022 DA 90.ª) = 42.000 €/año.
 *
 * Variación autonómica
 * ────────────────────
 *   El RD fija el marco; cada CA concreta su convocatoria y solo puede elevar la renta máxima
 *   con acuerdo previo del Ministerio (art. 135). La app NO simula convocatorias autonómicas:
 *   lo dice en el DisclaimerCard crítico, en el aviso de renta y en el requisito no bloqueante
 *   «Tu Comunidad Autónoma tiene el Bono Joven activo». Este fichero comprueba que ese aviso
 *   sigue apareciendo, porque es lo que impide leer el resultado como una resolución.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras (7.200 → «7200,00 €») y sí los de cinco o más (14.400 → «14.400,00 €»), y
 * separa la cifra del € con espacio duro (U+00A0), que aquí se normaliza.
 *
 * CASOS (resueltos a mano ANTES de ejecutar la app)
 * ────────────────────────────────────────────────
 *   CASO 1 (normal)  — vivienda completa · 600 €/mes · los 6 requisitos a «Sí»
 *       tope de renta  600 ≤ 1.000 → dentro
 *       60 % de 600 = 360 → ayuda = mín(300; 360) = 300,00 €
 *       pago real      600 − 300 = 300,00 €
 *       4 años         300 × 48 = 14.400,00 €
 *       veredicto      APTO, y SIN la nota «Límite: 60% de la renta»
 *
 *   CASO 2 (límite)  — habitación · municipio ≤ 10.000 hab. · 250 €/mes = el tope exacto
 *       tope de renta  250 ≤ 250 → dentro (el art. 133.1.e es inclusive)
 *       60 % de 250 = 150 → ayuda = mín(200; 150) = 150,00 €  ← aquí SÍ muerde el 60 %
 *       pago real      250 − 150 = 100,00 €
 *       4 años         150 × 48 = 7.200,00 €
 *       veredicto      APTO, y CON la nota «Límite: 60% de la renta»
 *       251 € (un euro por encima) tiene que caer al lado contrario
 *
 *   CASO 3 (rechazo) — vivienda completa · 1.100 €/mes · los 6 requisitos a «Sí»
 *       1.100 > 1.000 → NO APTO por el art. 133.1.e aunque todo lo demás se cumpla,
 *       y el panel de ahorro NO debe pintarse (no hay ayuda que enseñar)
 */

const RUTA = '/simulador-bono-joven-alquiler/';

/** es-ES separa la cifra del € con U+00A0: se normaliza para poder comparar literales */
const norm = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

async function abrir(page: Page) {
  await page.goto(RUTA, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#alquiler');
}

/** Marca «Sí» en los 6 requisitos de la checklist (cada uno es un role="group") */
async function marcarTodosLosRequisitos(page: Page, salvo?: { indice: number; valor: 'No' }) {
  const grupos = page.getByRole('group');
  const total = await grupos.count();
  expect(total).toBe(6); // 4 bloqueantes + 2 condicionantes
  for (let i = 0; i < total; i++) {
    const valor = salvo && salvo.indice === i ? salvo.valor : 'Sí';
    await grupos.nth(i).getByRole('button', { name: valor, exact: true }).click();
  }
}

/** Los tres números del panel: ayuda mensual, pago real y acumulado */
async function panelDeAhorro(page: Page) {
  const cards = page.locator('[class*="ahorroCard"]');
  const total = await cards.count();
  const textos: string[] = [];
  for (let i = 0; i < total; i++) textos.push(norm(await cards.nth(i).innerText()));
  return textos;
}

test.describe('simulador-bono-joven-alquiler', () => {
  test('CASO 1 (normal): vivienda 600 €/mes → 300,00 € de ayuda, 300,00 € de pago y 14.400,00 € en 4 años', async ({ page }) => {
    await abrir(page);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Simulador Bono Joven Alquiler');

    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    await page.fill('#alquiler', '600');
    await marcarTodosLosRequisitos(page);

    const panel = await panelDeAhorro(page);
    // 300 € = ayudaMaximaMensual.vivienda (art. 137), por debajo del 60 % de 600 (=360 €)
    expect(panel[0]).toContain('300,00 €');
    expect(panel[0]).toContain('Ayuda mensual');
    // 600 − 300
    expect(panel[1]).toContain('300,00 €');
    expect(panel[1]).toContain('Tu pago real');
    // 300 × 48 meses (plazo.totalMaximoMeses, art. 134)
    expect(panel[2]).toContain('14.400,00 €');
    expect(panel[2]).toContain('Máximo en 4 años');

    // El 60 % no muerde en este caso: la nota no debe aparecer
    await expect(page.getByText('Límite: 60% de la renta')).toHaveCount(0);

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('¡Cumples todos los requisitos!');
    expect(resultado).toContain('300,00 €/mes');
  });

  test('CASO 2 (límite): habitación en municipio ≤ 10.000 hab. con 250 €/mes clavados → dentro del tope y el 60 % manda (150,00 €)', async ({ page }) => {
    await abrir(page);

    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    await page.getByRole('button', { name: /El municipio tiene 10\.000 habitantes o menos/ }).click();
    // 250 € = rentaMaximaMensual.municipioPequeno.habitacion (art. 133.1.e), tope INCLUSIVE
    await page.fill('#alquiler', '250');
    await marcarTodosLosRequisitos(page);

    // No debe saltar el aviso de renta excedida: 250 ≤ 250
    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);

    const panel = await panelDeAhorro(page);
    // mín(200 € de ayudaMaximaMensual.habitacion; 60 % de 250 = 150 €) = 150 €
    expect(panel[0]).toContain('150,00 €');
    // 250 − 150
    expect(panel[1]).toContain('100,00 €');
    // 150 × 48 — es-ES no agrupa los millares de cuatro cifras
    expect(panel[2]).toContain('7200,00 €');

    // Aquí el límite del art. 137 SÍ manda sobre la cuantía máxima: hay que decirlo
    await expect(page.getByText('Límite: 60% de la renta')).toHaveCount(1);

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('¡Cumples todos los requisitos!');

    // Un euro por encima del tope cae al otro lado
    await abrir(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    await page.getByRole('button', { name: /El municipio tiene 10\.000 habitantes o menos/ }).click();
    await page.fill('#alquiler', '251');
    await marcarTodosLosRequisitos(page);
    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).toContain('250,00 €/mes');
  });

  test('CASO 3 (rechazo): vivienda con 1.100 €/mes supera el tope de 1.000 € del art. 133.1.e, aunque cumpla todo lo demás', async ({ page }) => {
    await abrir(page);

    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 1.000 € = rentaMaximaMensual.vivienda (art. 133.1.e); 1.100 lo supera
    await page.fill('#alquiler', '1100');
    await marcarTodosLosRequisitos(page);

    const aviso = norm(await page.locator('[class*="avisoRenta"]').first().innerText());
    expect(aviso).toContain('La renta supera el máximo que da derecho a la ayuda');
    expect(aviso).toContain('1000,00 €/mes'); // es-ES no agrupa cuatro cifras
    expect(aviso).toContain('1100,00 €/mes');
    expect(aviso).toContain('art. 133.1.e');

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('No cumples los requisitos obligatorios');

    // Sin derecho a ayuda no se pinta ninguna cifra de ahorro
    expect(await panelDeAhorro(page)).toHaveLength(0);
  });

  test('El umbral de ingresos que enseña la checklist es 5 × IPREM de 14 pagas = 42.000 €/año', async ({ page }) => {
    await abrir(page);
    // 5 = UMBRAL_IPREM_VIVIENDA_JOVEN.general (art. 133.1.d)
    // 8.400 € = IPREM_2026.anual14 (Ley 31/2022, DA 90.ª) → 5 × 8.400 = 42.000
    const pregunta = norm(await page.getByText(/veces el IPREM/).first().innerText());
    expect(pregunta).toContain('5 veces el IPREM');
    expect(pregunta).toContain('42.000 €/año');
  });

  test('La app no oculta que la convocatoria la fija cada comunidad autónoma (art. 135)', async ({ page }) => {
    await abrir(page);
    await page.fill('#alquiler', '600');
    // El requisito «Tu CA tiene el Bono Joven activo» es el último y NO es bloqueante:
    // respondido «No» el veredicto no puede ser APTO, pero tampoco un rechazo tajante
    await marcarTodosLosRequisitos(page, { indice: 5, valor: 'No' });

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain('Tu Comunidad Autónoma no tiene el Bono Joven activo ahora mismo');
    expect(resultado).not.toContain('¡Cumples todos los requisitos!');
  });

  test('Una renta negativa se rechaza como dato inválido, no se trata como campo vacío', async ({ page }) => {
    await abrir(page);
    await page.fill('#alquiler', '-100');
    await expect(page.locator('#alquiler')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('La renta no puede ser un importe negativo.')).toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los cuatro hallazgos de la inspección del 02/09/2026 (596-599),
// REPARADOS ese mismo día.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 02/09/2026, reparados', () => {
  // 596 — el plazo y el ahorro de los escenarios se derivan de BONO_ALQUILER_JOVEN_2026, que
  // la app ya usaba en el hero: el «4 años (2 renovables)» y el «14.400 €» estaban tecleados.
  test('596 — el plazo y el ahorro salen del módulo, no de la prosa', async ({ page }) => {
    await abrir(page);
    const anios = BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12;
    const ahorro = BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda *
      BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses;

    // El escenario de la graduada publica exactamente el producto del módulo.
    const escenario = norm(await page.getByText(/Recién graduada/).locator('xpath=..').innerText());
    expect(escenario).toContain(`En ${anios} años ahorra`);
    expect(escenario).toContain(ahorro.toLocaleString('es-ES'));

    // Y el resultado de un caso apto cita el artículo del plazo.
    await page.fill('#alquiler', '600');
    for (const si of await page.getByRole('button', { name: 'Sí', exact: true }).all()) await si.click();
    await expect(page.getByText(/art\. 134 RD 326\/2026/)).toBeVisible();
  });

  // 597 — la página daba DOS rangos distintos y sin fuente para el plazo de resolución: el
  // paso 4 decía «3-6 meses» y la FAQ «desde 1-2 meses hasta 6 meses». El RD no lo regula.
  test('597 — el plazo de resolución no se inventa: lo fija cada convocatoria', async ({ page }) => {
    await abrir(page);
    // La guía se monta siempre en el DOM (por SEO) pero se pinta colapsada: hay que abrirla
    // para que `innerText` la devuelva.
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const pagina = norm(await page.locator('body').innerText());
    expect(pagina).not.toContain('3-6 meses');
    expect(pagina).not.toContain('1-2 meses');
    expect(pagina).toContain('el RD 326/2026 no fija ningún plazo de resolución');
  });

  // 598 — la tabla comparativa atribuía a las ayudas autonómicas una cuantía «30-40 % renta» y
  // una duración «1-3 años» sin fuente ni norma, junto a filas que sí vienen de data/fiscal.
  test('598 — la fila de las ayudas autonómicas ya no publica cifras sin fuente', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const fila = page.getByRole('row', { name: /Ayudas al alquiler de la CA/ });
    const texto = norm(await fila.innerText());
    expect(texto).not.toContain('30-40%');
    expect(texto).not.toContain('1-3 años');
    expect(texto).toContain('convocatoria autonómica');
  });

  // 599 — la FAQ afirmaba, solo con un «en general», que el bono se mantiene tras cumplir la
  // edad máxima. El módulo sella la edad de ACCESO, no la conservación del derecho.
  test('599 — la FAQ de la edad no afirma una regla que la norma no da', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const faq = norm(
      await page.getByRole('heading', { name: /cumplo 36 años/ }).locator('xpath=..').innerText(),
    );
    expect(faq).toContain('art. 133.1.b');
    // Ya no se afirma la conservación como si fuera regla estatal.
    expect(faq).not.toContain('el bono se mantiene durante todo el período');
    expect(faq).toContain('no dice qué ocurre');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 07/09/2026 — RE-INSPECCIÓN (segmento fiscal, RIESGO 1 CRÍTICO)
// ═════════════════════════════════════════════════════════════════════════════
//
// Lo primero fue ejecutar entera la batería del 02/09 antes de tocar nada:
// **10/10 en verde y ningún `test.fail()` pendiente**, así que los cuatro hallazgos de
// aquella inspección (596-599) cierran de verdad y no hay ninguna regresión. Comprobado
// además a mano en el navegador lo que aquella acta daba por reparado y esta batería no
// llegaba a cubrir:
//
//   · el parseo de la renta a la española (hallazgo 440) — la batería del 02/09 solo
//     tecleaba «1100», sin punto de millar, que es justo la forma en que el fallo se
//     manifestaba. Lo cubre ahora el CASO 6.
//   · «Máximo en 4 años» sobre la ayuda EFECTIVA y no sobre el tope del programa —
//     lo cubre el guardián del 60 % de más abajo (480,75 € → 13.845,60 €, no 14.400 €).
//   · el panel de ahorro con un perfil declarado NO elegible — guardián de la edad.
//   · la FAQ de compatibilidad contra el art. 136 — ya cubierta arriba en prosa y aquí
//     por el guardián del art. 135 (hallazgo 643, reparado el 09/09/2026).
//
// De dónde sale cada cifra esperada: `data/fiscal/vivienda-joven.ts`, sellado contra el
// BOE (RD 326/2026, BOE-A-2026-8872) el 23/08/2026. Ninguna de memoria.
//
// CASOS NUEVOS (resueltos a mano ANTES de abrir el navegador)
// ───────────────────────────────────────────────────────────
//   CASO 4 (normal) — HABITACIÓN en municipio ordinario · 500 €/mes
//       tope de renta   500 ≤ 600 (rentaMaximaMensual.habitacion, art. 133.1.e) → dentro
//       60 % de 500 = 300 · cuantía máxima habitación = 200 (art. 137)
//       ayuda           mín(200; 300) = 200,00 €   ← manda la cuantía fija, no el %
//       pago real       500 − 200 = 300,00 €
//       4 años          200 × 48 = 9.600 → «9600,00 €» (es-ES no agrupa cuatro cifras)
//       veredicto       APTO, SIN la nota «Límite: 60% de la renta»
//
//   CASO 5 (límite exacto, doble) — VIVIENDA en municipio ≤ 10.000 hab. · 500 €/mes
//       tope de renta   500 ≤ 500 (rentaMaximaMensual.municipioPequeno.vivienda) → dentro,
//                       el art. 133.1.e es inclusive
//       60 % de 500 = 300 = ayudaMaximaMensual.vivienda
//       ayuda           mín(300; 300) = 300,00 €
//       Es el punto EXACTO en que el tope porcentual alcanza la cuantía fija sin llegar a
//       morderla: la nota «Límite: 60% de la renta» NO debe salir, porque no rebaja nada.
//       Un euro más (501 €) cae del otro lado del art. 133.1.e y ya no hay ayuda.
//       pago real       500 − 300 = 200,00 €
//       4 años          300 × 48 = 14.400,00 €
//       veredicto       APTO · y con 501 € → NO APTO (tope 500,00 €, introducido 501,00 €)
//
//   CASO 6 (rechazo + parser español) — VIVIENDA · renta escrita «1.200»
//       parseSpanishNumber('1.200') = 1.200 — el punto parte el número en grupos de tres
//       cifras exactas, así que agrupa millares y no es decimal
//       1.200 > 1.000 (rentaMaximaMensual.vivienda) → NO APTO por el art. 133.1.e
//       panel de ahorro: ninguna tarjeta (no hay ayuda que enseñar)
//       Con el parseo casero anterior al 02/09 esto valía 1,20 €, quedaba muy por debajo
//       del tope y la app CONCEDÍA la ayuda a quien no tiene derecho.
//       Comprobado además TECLEANDO (no `fill`) con el navegador en locale es-ES:
//       «1.200» llega al estado como «1.200» y «450,50» como «450.50» —Chrome normaliza
//       la coma del teclado español al punto— y ninguno de los dos se lee mil veces menor.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Inspección 07/09/2026 — casos nuevos', () => {
  test('CASO 4 (normal): habitación a 500 €/mes → manda la cuantía fija (200,00 €), no el 60 %', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    // 500 ≤ 600 = rentaMaximaMensual.habitacion (art. 133.1.e)
    await page.fill('#alquiler', '500');
    await marcarTodosLosRequisitos(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);

    const panel = await panelDeAhorro(page);
    // mín(200 € de ayudaMaximaMensual.habitacion; 60 % de 500 = 300 €) = 200 €
    expect(panel[0]).toContain('200,00 €');
    // 500 − 200
    expect(panel[1]).toContain('300,00 €');
    // 200 × 48 meses (plazo.totalMaximoMeses) — es-ES no agrupa cuatro cifras
    expect(panel[2]).toContain('9600,00 €');

    // El 60 % de 500 (300 €) queda por encima de la cuantía: el límite no muerde
    await expect(page.getByText('Límite: 60% de la renta')).toHaveCount(0);

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('¡Cumples todos los requisitos!');
    expect(resultado).toContain('200,00 €/mes');
  });

  test('CASO 5 (límite exacto): 500 €/mes en municipio ≤ 10.000 hab. es a la vez el tope de renta y el punto de cruce del 60 %', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    await page.getByRole('button', { name: /El municipio tiene 10\.000 habitantes o menos/ }).click();
    // 500 € = rentaMaximaMensual.municipioPequeno.vivienda (art. 133.1.e), tope INCLUSIVE
    await page.fill('#alquiler', '500');
    await marcarTodosLosRequisitos(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);

    const panel = await panelDeAhorro(page);
    // 60 % de 500 = 300 = ayudaMaximaMensual.vivienda → mín(300; 300) = 300
    expect(panel[0]).toContain('300,00 €');
    // 500 − 300
    expect(panel[1]).toContain('200,00 €');
    // 300 × 48
    expect(panel[2]).toContain('14.400,00 €');

    // En el punto de cruce el tope porcentual IGUALA la cuantía pero no la rebaja: avisar
    // de un límite que no ha quitado ni un céntimo confundiría más de lo que informa.
    await expect(page.getByText('Límite: 60% de la renta')).toHaveCount(0);

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('¡Cumples todos los requisitos!');

    // Un euro por encima del tope del municipio pequeño cae al otro lado
    await abrir(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    await page.getByRole('button', { name: /El municipio tiene 10\.000 habitantes o menos/ }).click();
    await page.fill('#alquiler', '501');
    await marcarTodosLosRequisitos(page);

    const aviso = norm(await page.locator('[class*="avisoRenta"]').first().innerText());
    expect(aviso).toContain('500,00 €/mes');
    expect(aviso).toContain('501,00 €/mes');
    expect(aviso).toContain('municipio de 10.000 habitantes o menos');
    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(await panelDeAhorro(page)).toHaveLength(0);
  });

  test('CASO 6 (rechazo): la renta escrita «1.200» a la española vale 1.200 €, no 1,20 € (candado del hallazgo 440)', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // Punto de millar español: parseSpanishNumber lo agrupa, no lo toma por decimal
    await page.fill('#alquiler', '1.200');
    await marcarTodosLosRequisitos(page);

    const aviso = norm(await page.locator('[class*="avisoRenta"]').first().innerText());
    // Si se leyera 1,20 € no habría aviso ninguno: quedaría 998,80 € por debajo del tope
    expect(aviso).toContain('1200,00 €/mes');
    expect(aviso).toContain('1000,00 €/mes');
    expect(aviso).toContain('art. 133.1.e');

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('No cumples los requisitos obligatorios');
    expect(resultado).toContain('1200,00 €/mes');
    expect(await panelDeAhorro(page)).toHaveLength(0);
  });

  test('El punto de millar y la coma decimal TECLEADOS con el teclado español dan el mismo importe', async ({ browser }) => {
    // `fill` escribe el valor de golpe; un usuario teclea. Y con el navegador en es-ES
    // Chrome normaliza la coma del teclado al punto ANTES de que la app lo lea: esa es la
    // ruta por la que «1,500» acababa valiendo 1,5 antes de la reparación del 02/09.
    const ctx = await browser.newContext({ locale: 'es-ES' });
    const page = await ctx.newPage();
    await abrir(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();

    await page.click('#alquiler');
    await page.keyboard.type('450,50', { delay: 10 });
    // 450,50 ≤ 600 → dentro · 60 % = 270,30 > 200 → ayuda = 200,00 € · 450,50 − 200 = 250,50
    let panel = await panelDeAhorro(page);
    expect(panel[0]).toContain('200,00 €');
    expect(panel[1]).toContain('250,50 €');

    await page.locator('#alquiler').press('Control+a');
    await page.keyboard.type('1.200', { delay: 10 });
    // 1.200 > 1.000 → fuera de tope, y por tanto sin panel
    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(1);
    panel = await panelDeAhorro(page);
    expect(panel).toHaveLength(0);

    await ctx.close();
  });

  test('Cuando el 60 % muerde, el acumulado de 4 años sale de la ayuda EFECTIVA', async ({ page }) => {
    // Guardián de uno de los altos del 02/09: la tarjeta usaba el tope del programa.
    await abrir(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    await page.fill('#alquiler', '480.75');

    const panel = await panelDeAhorro(page);
    // 60 % de 480,75 = 288,45 < 300 → manda el porcentaje
    expect(panel[0]).toContain('288,45 €');
    // 480,75 − 288,45
    expect(panel[1]).toContain('192,30 €');
    // 288,45 × 48 = 13.845,60 — NO 300 × 48 = 14.400
    expect(panel[2]).toContain('13.845,60 €');
    expect(panel[2]).not.toContain('14.400,00 €');
    await expect(page.getByText('Límite: 60% de la renta')).toHaveCount(1);
  });

  test('Con un requisito imprescindible a «No» no se calcula ahorro, aunque la renta sea válida', async ({ page }) => {
    // El otro alto del 02/09: el panel seguía calculando para un perfil declarado NO elegible.
    // Índice 0 = «Tienes entre 18 y 35 años (inclusive)», bloqueante.
    await abrir(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    await page.fill('#alquiler', '750'); // 750 ≤ 1.000: la renta no es el problema
    await marcarTodosLosRequisitos(page, { indice: 0, valor: 'No' });

    expect(await panelDeAhorro(page)).toHaveLength(0);
    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('No cumples los requisitos obligatorios');
    expect(resultado).toContain('Existe al menos un requisito imprescindible que no cumples');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los cuatro hallazgos de la re-inspección del 07/09/2026 (642-645),
// REPARADOS el 09/09/2026. Se escribieron con `test.fail()` afirmando lo que DEBERÍA
// pasar; hecha la reparación se les quitó la marca y quedan como guardián.
// ═════════════════════════════════════════════════════════════════════════════

/** El `featureList` del Schema.org tal y como se sirve en producción */
async function featureListServido(page: Page): Promise<string> {
  const respuesta = await page.request.get(RUTA);
  const html = await respuesta.text();
  const m = html.match(/"featureList":\[(.*?)\]/);
  return m ? m[1] : '';
}

test.describe('Regresión — hallazgos del 07/09/2026 (642-645), reparados el 09/09/2026', () => {
  // 642 (H1) — El JSON-LD anunciaba una «Guía del proceso de solicitud paso a paso por
  // Comunidad Autónoma». La app no tiene ninguna: los 4 pasos de «Proceso de solicitud» son
  // idénticos para toda España y la página no nombra ni una sola comunidad autónoma. El
  // featureList es la señal estructurada que consumen Bing Copilot, ChatGPT y Perplexity para
  // grounding: prometer ahí un desglose por CA que no existe era exactamente lo que la app
  // repite que NO puede hacer («cada CA concreta su convocatoria»). Ahora esa entrada dice lo
  // que la página hace de verdad — resume el proceso y la documentación comunes a toda España.
  test('642 — el featureList no promete una guía por comunidad autónoma que la página no tiene', async ({ page }) => {
    await abrir(page);
    const features = await featureListServido(page);
    const prometeGuiaPorCA = /paso a paso por Comunidad Autónoma/.test(features);
    expect(prometeGuiaPorCA).toBe(false);

    const CCAA = [
      'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria',
      'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Extremadura', 'Galicia',
      'Madrid', 'Murcia', 'Navarra', 'País Vasco', 'La Rioja', 'Comunidad Valenciana',
    ];
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const pagina = norm(await page.locator('body').innerText());
    const nombradas = CCAA.filter(c => pagina.includes(c)).length;

    // O la guía por CA existe (nombra comunidades concretas), o no se anuncia.
    expect(prometeGuiaPorCA && nombradas < 3).toBe(false);
  });

  // 643 (H2) — La página se contradecía sobre quién fija el límite de renta. El aviso de renta
  // y el consejo «Consulta el límite de renta de tu CA» dicen, con el art. 135 del RD 326/2026
  // detrás, que la CA solo puede elevar el tope «con acuerdo previo del Ministerio»; el bloque
  // final de advertencias afirmaba que los «límites de renta, duración y documentación varían
  // significativamente según tu Comunidad Autónoma». Es la misma forma del hallazgo 599: prosa
  // que contradice al módulo sellado, y aquí empujaba a un solicitante rechazado por el
  // art. 133.1.e a creer que su CA tendría otro tope. El plazo, además, lo fija el art. 134
  // (24 meses + prórroga de hasta 24), no la CA. La advertencia reescrita separa lo que fija el
  // Estado (renta y plazo) de lo que concreta la CA (convocatoria, documentación, plazos).
  test('643 — la advertencia final ya no contradice el art. 135 que la propia app cita', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const pagina = norm(await page.locator('body').innerText());

    // Lo que la app dice donde importa (aviso de renta y consejo): el tope es estatal
    expect(pagina).toContain('solo con acuerdo previo del Ministerio');
    // Lo que decía el bloque de advertencias, y que no podía convivir con lo anterior
    expect(pagina).not.toContain('límites de renta, duración y documentación varían significativamente');
    // Y lo que dice ahora: el Estado fija renta y plazo, la CA concreta su convocatoria
    expect(pagina).toContain('art. 133.1.e) y el plazo de la ayuda');
    expect(pagina).toContain('los fija el Real Decreto para toda España');
  });

  // 644 (H3) — «RegionBadge» es el nombre interno del componente React de meskeIA, y se
  // publicaba tal cual como característica de la app en el featureList del Schema.org que leen
  // usuarios y buscadores. La característica real es «ayuda aplicable exclusivamente en España».
  test('644 — el featureList no publica el nombre interno de un componente', async ({ page }) => {
    await abrir(page);
    const features = await featureListServido(page);
    expect(features).toContain('exclusivamente en España');
    expect(features).not.toContain('RegionBadge');
  });

  // 645 (H4) — Dos de los cuatro escenarios del bloque educativo tenían el porcentaje TECLEADO
  // («el 50%», «el 37,5% de la renta») mientras el de habitación lo derivaba del módulo
  // —formatNumber((ayudaMaximaMensual.habitacion / 350) * 100, 0) = 57—. Es la forma exacta
  // del hallazgo 596, que se reparó en el plazo y en el ahorro pero no aquí. Las cifras eran
  // correctas (300/600 = 50 %, 300/800 = 37,5 %), y por eso el hallazgo era un latente que
  // solo se veía en el código: si `ayudaMaximaMensual.vivienda` pasara de 300 a 400 €, la
  // página seguiría diciendo «400 €/mes (el 50%, por debajo del límite del 60%)» cuando serían
  // 400/600 = 66,7 %, POR ENCIMA del tope del art. 137 — la prosa afirmaría justo lo contrario
  // de lo que el calculador de arriba estaría haciendo. Mismo patrón en la tarjeta del panel,
  // cuya etiqueta «Máximo en 4 años» estaba tecleada aunque el número saliera del módulo.
  //
  // Los cuatro escenarios pasan ahora por `calcularEscenario`, que hace la MISMA aritmética
  // que el simulador (mín(cuantía del art. 137; 60 % de la renta)) y redacta también el
  // veredicto sobre el tope: con la cuantía subida a 400 € la prosa diría «el 60% de la renta,
  // que es el máximo que permite el art. 137», no «por debajo del límite».
  test('645 — los porcentajes de los escenarios se derivan del módulo, como el de habitación', async ({ page }) => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const fuente = readFileSync(
      join(process.cwd(), 'app', 'simulador-bono-joven-alquiler', 'page.tsx'),
      'utf8',
    );
    expect(fuente).not.toContain('(el 50%,');
    expect(fuente).not.toContain('(el 37,5% de la renta');
    // La etiqueta de la tarjeta compartía el patrón: el número salía del módulo y el rótulo no
    expect(fuente).not.toContain('Máximo en 4 años');

    // Y lo que la página publica coincide con ese cálculo, hoy y si la cuantía cambiara
    await abrir(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const RENTA_EJEMPLO = 600; // la del escenario «Recién graduada»
    const ayuda = Math.min(
      BONO_ALQUILER_JOVEN_2026.ayudaMaximaMensual.vivienda,
      RENTA_EJEMPLO * BONO_ALQUILER_JOVEN_2026.limiteSobreRenta,
    );
    // Un decimal como mucho, igual que el `pct()` de la app
    const porcentaje = Math.round((ayuda / RENTA_EJEMPLO) * 1000) / 10;
    const escenario = norm(await page.getByText(/Recién graduada/).locator('xpath=..').innerText());
    expect(escenario).toContain(`el ${porcentaje.toLocaleString('es-ES')}% de la renta`);

    // El rótulo del panel sale del plazo del art. 134 que multiplica su propia cifra
    await page.fill('#alquiler', '600');
    const panel = await panelDeAhorro(page);
    expect(panel[2]).toContain(`Máximo en ${BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12} años`);
  });
});
