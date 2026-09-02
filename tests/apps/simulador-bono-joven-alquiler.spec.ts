import { test, expect, Page } from '@playwright/test';
import { BONO_ALQUILER_JOVEN_2026 } from '../../data/fiscal/vivienda-joven';

/**
 * Inspector — simulador-bono-joven-alquiler (segmento fiscal, RIESGO 1 CRÍTICO)
 * Inspeccionada el 02/09/2026.
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
