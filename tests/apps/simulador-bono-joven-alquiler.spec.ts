import { test, expect, Page } from '@playwright/test';
import { BONO_ALQUILER_JOVEN_2026 } from '../../data/fiscal/vivienda-joven';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Inspector — simulador-bono-joven-alquiler (segmento fiscal, RIESGO 1 CRÍTICO)
 * Inspeccionada el 02/09/2026 y RE-INSPECCIONADA el 07/09/2026 y el 10/09/2026.
 *
 * ── Cómo está organizado este fichero ────────────────────────────────────────
 *   1. CASOS 1-3 y guardianes — la inspección del 02/09/2026. Siguen pasando tal cual.
 *   2. REGRESIÓN 02/09 — los cuatro hallazgos de aquella pasada (596-599), reparados ese
 *      mismo día.
 *   3. CASOS 4-6 y guardianes — los casos nuevos de la re-inspección del 07/09/2026.
 *   4. REGRESIÓN 07/09 — los cuatro hallazgos de esa re-inspección (642-645), reparados el
 *      09/09/2026. Se escribieron con `test.fail()` afirmando lo que DEBERÍA pasar; al
 *      repararlos se les quitó la marca y quedan como regresión.
 *   5. CASOS 7-9 — los casos nuevos de la re-inspección del 10/09/2026.
 *   6. REGRESIÓN 10/09 — los tres hallazgos de esa pasada (686-688), reparados ese mismo día.
 *   7. CASOS 10-12 y REGRESIÓN 14/09 — la re-inspección del 14/09/2026 y sus cuatro hallazgos
 *      (852-855), reparados el 15/09/2026.
 *   8. CASOS 13-15 — los casos nuevos de la re-inspección del 21/09/2026.
 *   9. REGRESIÓN 21/09 — H8, H9 y H10 (hallazgos 1168-1170), que se escribieron con
 *      `test.fail()` y se REPARARON el 21/09/2026 (352da52c): se les quitó la marca y quedan
 *      como guardián, igual que los anteriores.
 *  10. CASOS 16-19, móvil y REGRESIÓN 28/09 — la re-inspección del 28/09/2026, con la
 *      sección 3.ª del RD 326/2026 cotejada contra el texto del BOE. Sus diez hallazgos
 *      (2388-2397, tests H11-H20) se escribieron con `test.fail()` y se REPARARON el mismo
 *      28/09/2026: se les quitó la marca y quedan como guardián, igual que los anteriores.
 *  11. CASOS 20-22, móvil y HALLAZGOS 07/10 — la re-inspección del 07/10/2026 (la 11.ª), que
 *      reverifica 2388-2397 y coteja con el BOE las cinco sospechas que dejó la del 28/09. Sus
 *      hallazgos (tests H21-H28) van con `test.fail()`: ABIERTOS a esa fecha.
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

/**
 * La nota del límite del art. 137 tal y como se escribe desde el 28/09/2026: «60 %» con espacio
 * duro (U+00A0) entre la cifra y el signo (hallazgo 2393). Hasta entonces los casos buscaban
 * «Límite: 60% de la renta», sin espacio, y con el formato corregido las aserciones de
 * `toHaveCount(0)` habrían pasado en verde sin mirar nada. `getByText` normaliza los espacios
 * (también el duro), y las aserciones de `toHaveCount(1)` con esta misma constante —CASOS 2, 7
 * y 10 y el guardián del 480,75 €— prueban que casa con lo que la página pinta.
 */
const NOTA_LIMITE = 'Límite: 60\u00A0% de la renta';

async function abrir(page: Page) {
  await page.goto(RUTA, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#alquiler');
  // Que #alquiler EXISTA no significa que React lo haya hidratado: bajo `next dev` compilando
  // con carga, los clics «Sí» anteriores a la hidratación se perdían y la suite fallaba por
  // tiempo (sospecha del 26/09, reproducida el 28/09 retrasando los chunks). Esperarla aquí
  // arregla los 26 casos antiguos que usan este helper sin tocar ninguna de sus aserciones.
  await esperarHidratacion(page, ['#alquiler']);
}

/**
 * Marca «Sí» en los 7 requisitos de la checklist (cada uno es un role="group").
 *
 * Eran 6 hasta el 10/09/2026, cuando el hallazgo 686 añadió el de la incompatibilidad del
 * art. 136 con otras ayudas al pago del alquiler: la regla estaba sellada en
 * `BONO_ALQUILER_JOVEN_2026.compatibleConOtrasAyudasAlquiler` y no la leía nadie, así que
 * quien ya cobraba una ayuda autonómica recibía «🎉 ¡Cumples todos los requisitos!».
 */
async function marcarTodosLosRequisitos(page: Page, salvo?: { indice: number; valor: 'No' }) {
  const grupos = page.getByRole('group');
  const total = await grupos.count();
  // 8 bloqueantes + 1 condicionante. Eran 7 hasta el 28/09/2026, cuando el hallazgo 2388 añadió
  // el del arrendador (parentesco y socio, art. 133.2.b y c) y la sospecha del art. 8.2.a el de
  // la nacionalidad o residencia legal, los dos justo antes del condicionante de la comunidad
  // autónoma: los índices 0-5 no se han movido y la comunidad pasa del 6 al 8. El 07/10/2026 el
  // hallazgo 2985 añadió el del art. 8.5 (al corriente con Hacienda y la Seguridad Social, art.
  // 13 de la Ley 38/2003) antes de la nacionalidad: 9 bloqueantes + 1, la comunidad pasa al 9.
  expect(total).toBe(10);
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
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(0);

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
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(1);

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
    // respondido «No» el veredicto no puede ser APTO, pero tampoco un rechazo tajante.
    // Fue el índice 6 desde que el hallazgo 686 insertó el del art. 136 en la quinta posición, y
    // es el 8 desde el 28/09/2026 (arrendador, hallazgo 2388, y nacionalidad, art. 8.2.a).
    await marcarTodosLosRequisitos(page, { indice: 9, valor: 'No' }); // la comunidad autónoma

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('Cumples los requisitos básicos');
    expect(resultado).toContain('Tu Comunidad Autónoma no tiene el Bono Joven activo ahora mismo');
    // Y lo que sigue ya no dice que «los plazos varían cada año», que contradecía el art. 138
    // (misma forma que el hallazgo 2396); la frase va separada de la anterior, no pegada
    expect(resultado).toContain('hasta que abra su convocatoria. El art. 138');
    expect(resultado).not.toContain('plazos varían cada año');
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
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(0);

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
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(0);

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
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(1);
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
    expect(resultado).toContain('al menos un requisito imprescindible que no cumples');
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
    // Con el espacio duro del hallazgo 2393, que `norm` convierte en espacio normal
    expect(escenario).toContain(`el ${porcentaje.toLocaleString('es-ES')} % de la renta`);

    // El rótulo del panel sale del plazo del art. 134 que multiplica su propia cifra
    await page.fill('#alquiler', '600');
    const panel = await panelDeAhorro(page);
    expect(panel[2]).toContain(`Máximo en ${BONO_ALQUILER_JOVEN_2026.plazo.totalMaximoMeses / 12} años`);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 10/09/2026 (segmento fiscal, RIESGO 1 CRÍTICO)
// ═════════════════════════════════════════════════════════════════════════════
//
// Primero se ejecutó entera la batería anterior: **20/20 en verde**, así que los ocho
// hallazgos de las dos pasadas previas (596-599 y 642-645) siguen cerrados y el refactor
// de motores del 10/09/2026 no ha tocado nada de esta app — no tiene motor propio: el
// cálculo (una comparación y una multiplicación) vive en `page.tsx`, y ni
// `check-motores-consumidos.mjs` ni `check-parser-numerico.mjs` ni `check-a11y-jsx.mjs`
// señalan este fichero.
//
// AUDITORÍA DE LOS CASOS PREVIOS (obligatoria en esta tanda): se revisó uno por uno que
// lo que cada test afirma siga siendo lo que la app DEBE hacer, no solo lo que hace.
// Ninguno fija como contrato un comportamiento hoy defectuoso: los catorce casos y
// guardianes anteriores anclan sus cifras en `data/fiscal/vivienda-joven.ts` y en
// `data/fiscal/iprem.ts`, y las cuatro regresiones 642-645 siguen describiendo lo que la
// norma pide. No se ha modificado ninguno.
//
// De dónde sale cada cifra esperada de los casos nuevos: `data/fiscal/vivienda-joven.ts`,
// sellado contra el BOE (RD 326/2026, BOE-A-2026-8872) el 23/08/2026. Ninguna de memoria.
//
// CASOS NUEVOS (resueltos a mano ANTES de abrir el navegador)
// ───────────────────────────────────────────────────────────
//   CASO 7 (normal) — VIVIENDA en municipio ordinario · 450 €/mes · los 6 requisitos a «Sí»
//       tope de renta   450 ≤ 1.000 (rentaMaximaMensual.vivienda, art. 133.1.e) → dentro
//       60 % de 450 = 270 < 300 (ayudaMaximaMensual.vivienda, art. 137)
//       ayuda           mín(300; 270) = 270,00 €   ← aquí manda el PORCENTAJE
//       pago real       450 − 270 = 180,00 €
//       4 años          270 × 48 (plazo.totalMaximoMeses, art. 134) = 12.960,00 €
//       veredicto       APTO **citando 270,00 €/mes**, no los 300 € del programa
//       Es el hueco que quedaba: el guardián del 480,75 € comprueba el panel cuando el
//       60 % muerde, pero no marca los requisitos, así que nunca llega a la tarjeta de
//       veredicto — que es justo donde esta app anunció una vez el máximo del programa
//       en lugar de la ayuda efectiva.
//
//   CASO 8 (límite) — VIVIENDA en municipio ordinario · 1.000 €/mes CLAVADOS
//       1.000 = rentaMaximaMensual.vivienda (art. 133.1.e), el tope de portada de la app,
//       y hasta hoy sin cubrir: los casos previos probaban 1.100 y 1.200 (por encima),
//       nunca el borde inclusive.
//       tope de renta   1.000 ≤ 1.000 → dentro, sin aviso
//       60 % de 1.000 = 600 > 300 → ayuda = mín(300; 600) = 300,00 €
//       pago real       1.000 − 300 = 700,00 €
//       4 años          300 × 48 = 14.400,00 €
//       nota del 60 %   NO (la ayuda no queda rebajada por el porcentaje)
//       veredicto       APTO · y con 1.001 € → NO APTO (tope 1000,00 €, introducido 1001,00 €)
//
//   CASO 9 (rechazo) — HABITACIÓN en municipio ordinario · 900 €/mes
//       900 > 600 (rentaMaximaMensual.habitacion) → NO APTO por el art. 133.1.e
//       El aviso debe citar el tope de la HABITACIÓN (600,00 €), no el de vivienda:
//       equivocarse de tope aquí rechaza a quien tiene derecho o al revés.
//       panel de ahorro: ninguna tarjeta
//       Y con la MISMA renta cambiando el selector a vivienda completa:
//       900 ≤ 1.000 → APTO · ayuda mín(300; 540) = 300,00 € · pago 600,00 € · 14.400,00 €
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Inspección 10/09/2026 — casos nuevos', () => {
  test('CASO 7 (normal): vivienda a 450 €/mes → el 60 % manda (270,00 €) y el veredicto cita la ayuda EFECTIVA', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 450 ≤ 1.000 = rentaMaximaMensual.vivienda (art. 133.1.e)
    await page.fill('#alquiler', '450');
    await marcarTodosLosRequisitos(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);

    const panel = await panelDeAhorro(page);
    // mín(300 € de ayudaMaximaMensual.vivienda; 60 % de 450 = 270 €) = 270 €
    expect(panel[0]).toContain('270,00 €');
    // 450 − 270
    expect(panel[1]).toContain('180,00 €');
    // 270 × 48 meses (plazo.totalMaximoMeses, art. 134)
    expect(panel[2]).toContain('12.960,00 €');

    // El porcentaje rebaja la cuantía: hay que decirlo
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(1);

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('¡Cumples todos los requisitos!');
    // La tarjeta anuncia lo que este caso puede cobrar, no el tope del programa
    expect(resultado).toContain('270,00 €/mes');
    expect(resultado).not.toContain('300,00 €');
  });

  test('CASO 8 (límite): 1.000 €/mes clavados es el último importe con derecho a ayuda (art. 133.1.e, inclusive)', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 1.000 € = rentaMaximaMensual.vivienda (art. 133.1.e), tope INCLUSIVE
    await page.fill('#alquiler', '1000');
    await marcarTodosLosRequisitos(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);

    const panel = await panelDeAhorro(page);
    // 60 % de 1.000 = 600 > 300 → manda la cuantía fija del art. 137
    expect(panel[0]).toContain('300,00 €');
    // 1.000 − 300
    expect(panel[1]).toContain('700,00 €');
    // 300 × 48
    expect(panel[2]).toContain('14.400,00 €');
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(0);

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('¡Cumples todos los requisitos!');

    // Un euro por encima del tope de portada cae al otro lado
    await abrir(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    await page.fill('#alquiler', '1001');
    await marcarTodosLosRequisitos(page);

    const aviso = norm(await page.locator('[class*="avisoRenta"]').first().innerText());
    expect(aviso).toContain('1000,00 €/mes'); // es-ES no agrupa los millares de cuatro cifras
    expect(aviso).toContain('1001,00 €/mes');
    expect(aviso).toContain('art. 133.1.e');
    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(await panelDeAhorro(page)).toHaveLength(0);
  });

  test('CASO 9 (rechazo): 900 €/mes por una habitación supera SU tope de 600 €, y la misma renta sí vale como vivienda completa', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    // 600 € = rentaMaximaMensual.habitacion (art. 133.1.e); 900 lo supera
    await page.fill('#alquiler', '900');
    await marcarTodosLosRequisitos(page);

    const aviso = norm(await page.locator('[class*="avisoRenta"]').first().innerText());
    expect(aviso).toContain('Para una habitación el tope es 600,00 €/mes');
    expect(aviso).toContain('900,00 €/mes');
    // El tope de la vivienda completa no pinta nada en un contrato de habitación
    expect(aviso).not.toContain('1000,00 €');

    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).toContain('600,00 €/mes');
    expect(await panelDeAhorro(page)).toHaveLength(0);

    // Misma renta, otro tipo de contrato: 900 ≤ 1.000 → sí hay derecho
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);
    const panel = await panelDeAhorro(page);
    // mín(300; 60 % de 900 = 540) = 300
    expect(panel[0]).toContain('300,00 €');
    // 900 − 300
    expect(panel[1]).toContain('600,00 €');
    expect(panel[2]).toContain('14.400,00 €');
    const apto = norm(await page.locator('[role="status"]').first().innerText());
    expect(apto).toContain('¡Cumples todos los requisitos!');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los tres hallazgos de la re-inspección del 10/09/2026 (686-688),
// REPARADOS ese mismo día. Se escribieron con `test.fail()` afirmando lo que DEBERÍA
// pasar, igual que se hizo con 642-645; hecha la reparación se les quitó la marca y
// quedan como guardián.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 10/09/2026 (686-688), reparados el 10/09/2026', () => {
  // H1 (ALTO) — La incompatibilidad del art. 136 no llega nunca al veredicto.
  // `BONO_ALQUILER_JOVEN_2026.compatibleConOtrasAyudasAlquiler = false` está sellado en
  // el módulo y NO lo lee nadie en todo el repositorio (grep: solo su definición). La regla
  // sí se cuenta en tres canales de prosa —FAQ visible, faqJsonLd y el consejo de la
  // deducción autonómica—, pero los tres viven dentro del `<EducationalSection>` colapsado
  // o en el JSON-LD; fuera de la guía la página no dice «incompatible», ni «art. 136», ni
  // «otra ayuda» ni «ayuda al pago». Es la misma forma de los hallazgos 596 y 645 (la
  // corrección llega a un canal y no al otro), pero al revés: aquí lo que se quedó fuera
  // es el veredicto. Consecuencia: quien ya cobra una ayuda autonómica al alquiler responde
  // «Sí» a los 6 requisitos y recibe «¡Cumples todos los requisitos! En principio puedes
  // solicitar el Bono Joven al Alquiler», cuando el RD lo excluye. Y el CLAUDE.md del
  // proyecto prohíbe expresamente esconder una advertencia legal dentro de
  // `<EducationalSection>`.
  // REPARADO 10/09/2026 (hallazgo 686): la checklist pregunta por otras ayudas al pago del
  // alquiler, y el requisito es BLOQUEANTE, como exige el art. 136.
  test('H1 — la incompatibilidad del art. 136 debería condicionar el veredicto, no solo la guía', async ({ page }) => {
    await abrir(page);

    // O la checklist pregunta por otras ayudas al alquiler...
    const tarjetas = page.locator('[class*="checkCard"]');
    const preguntas: string[] = [];
    for (let i = 0; i < await tarjetas.count(); i++) preguntas.push(norm(await tarjetas.nth(i).innerText()));
    const laPregunta = preguntas.some(p => /otra ayuda al (pago del )?alquiler|incompatib/i.test(p));

    // ...o el propio veredicto de «apto» avisa de que el art. 136 la excluye
    await page.fill('#alquiler', '600');
    await marcarTodosLosRequisitos(page);
    const apto = norm(await page.locator('[role="status"]').first().innerText());
    const loAvisa = /incompatib|art\. 136|otra ayuda al pago/i.test(apto);

    expect(laPregunta || loAvisa).toBe(true);
  });

  // H2 (MEDIO) — El `faqJsonLd` afirma a los asistentes de IA que el bono «está sujeto al
  // IRPF como ganancia patrimonial no derivada de la transmisión de elementos patrimoniales»
  // y que debe declararse en el ejercicio en que se cobra. La página VISIBLE no contiene ni
  // «tributa» ni «ganancia patrimonial» (0 apariciones con la guía educativa desplegada), el
  // `<DataReference>` solo respalda el RD 326/2026 —que no regula el IRPF— y no hay módulo de
  // `data/fiscal` que selle ese tratamiento. Es una afirmación fiscal de nivel 1 que solo
  // circula por el canal que leen ChatGPT, Perplexity y Bing Copilot, donde ni el lector ni
  // el Vigía Normativo la ven pasar. La invariante que se comprueba admite las dos
  // reparaciones posibles: retirarla del FAQPage, o publicarla también en la página con su
  // fuente.
  // REPARADO 10/09/2026 (hallazgo 687): se retira del FAQPage, que era la reparación que el
  // propio hallazgo ofrecía como primera opción. No había módulo de data/fiscal que sellara
  // ese tratamiento, así que publicarlo en la página habría sido afirmarlo sin fuente.
  test('H2 — lo que el FAQPage afirma sobre el IRPF debería poder leerse también en la página', async ({ page }) => {
    await abrir(page);
    const respuesta = await page.request.get(RUTA);
    const html = await respuesta.text();
    const afirmaTributacion = /ganancia patrimonial|tributa en el IRPF/i.test(html);

    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const visible = norm(await page.locator('body').innerText());

    // Si se le cuenta a un asistente de IA, se le cuenta también al lector
    expect(afirmaTributacion ? /ganancia patrimonial|tributa/i.test(visible) : true).toBe(true);
  });

  // H3 (BAJO) — La ayuda mensual y el acumulado que la app enseña juntos no se multiplican.
  // El 60 % del art. 137 puede dar fracciones de céntimo, y la app multiplica el número SIN
  // redondear mientras publica el redondeado: con 333,33 €/mes de habitación la ayuda sale
  // 199,998 €, que la tarjeta muestra como «200,00 €», y el acumulado 199,998 × 48 =
  // 9.599,904 → «9599,90 €», cuando 200,00 × 48 son 9.600,00 €. Una ayuda se abona en
  // céntimos: el redondeo pertenece a la cuantía mensual, no al total.
  // REPARADO 10/09/2026 (hallazgo 688): el redondeo al céntimo se aplica a la cuantía MENSUAL,
  // y el acumulado se calcula sobre ella.
  test('H3 — el acumulado de 4 años debería ser la ayuda mensual REDONDEADA por 48', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    // 333,33 ≤ 600 (art. 133.1.e) · 60 % de 333,33 = 199,998 < 200 (art. 137)
    await page.fill('#alquiler', '333.33');

    const panel = await panelDeAhorro(page);
    expect(panel[0]).toContain('200,00 €');
    // 200,00 × 48 = 9.600 → «9600,00 €» (es-ES no agrupa cuatro cifras). Antes de la reparación
    // salía 9599,90 € (hallazgo 688, REPARADO el 10/09/2026).
    expect(panel[2]).toContain('9600,00 €');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 14/09/2026 (segmento fiscal, RIESGO 1 CRÍTICO) — la 8.ª
// ═════════════════════════════════════════════════════════════════════════════
//
// Primero se ejecutó entera la batería anterior: **26/26 en verde**, así que los once
// hallazgos de las tres pasadas previas (596-599, 642-645 y 686-688) siguen cerrados.
// Comprobado además a mano en el navegador lo que el acta del 10/09 daba por reparado:
//
//   · 686 (ALTO) — la incompatibilidad del art. 136 llega al VEREDICTO: es el quinto
//     requisito de la checklist, va marcado IMPRESCINDIBLE, y su explicación imprime
//     «INCOMPATIBLE» derivándolo de `compatibleConOtrasAyudasAlquiler`. La página lo dice
//     ya FUERA de la guía colapsada (comprobado sobre el `innerText` del body sin abrir
//     `<EducationalSection>`). Lo fija como caso el CASO 12 de esta tanda.
//   · 688 (BAJO) — la ayuda mensual y el acumulado se multiplican: 300 €/mes de habitación
//     dan 180,00 € y 8.640,00 € (180 × 48), y 333,33 € dan 200,00 € y 9600,00 €.
//   · 687 (MEDIO) — el `faqJsonLd` servido ya no afirma nada sobre el IRPF: ni «ganancia
//     patrimonial» ni «tributa» aparecen en el HTML servido (0 apariciones).
//
// AUDITORÍA DE LOS CASOS PREVIOS: se revisó uno por uno que lo que cada test afirma siga
// siendo lo que la app DEBE hacer. Ninguno fija como contrato un comportamiento defectuoso;
// no se ha modificado ninguno.
//
// De dónde sale cada cifra esperada: `data/fiscal/vivienda-joven.ts`, sellado contra el BOE
// (RD 326/2026, BOE-A-2026-8872) el 23/08/2026. Ninguna de memoria.
//
// CASOS NUEVOS (resueltos a mano ANTES de abrir el navegador)
// ───────────────────────────────────────────────────────────
//   CASO 10 (normal) — HABITACIÓN en municipio ordinario · 300 €/mes
//       tope de renta  300 ≤ 600 (rentaMaximaMensual.habitacion, art. 133.1.e) → dentro
//       60 % de 300 = 180 < 200 (ayudaMaximaMensual.habitacion, art. 137)
//       ayuda          mín(200; 180) = 180,00 €   ← manda el PORCENTAJE
//       pago real      300 − 180 = 120,00 €
//       4 años         180 × 48 (plazo.totalMaximoMeses, art. 134) = 8.640 → «8640,00 €»
//       veredicto      APTO citando 180,00 €/mes, y CON la nota «Límite: 60% de la renta»
//       Es el hueco que quedaba en la habitación: el 60 % mordiendo en municipio ORDINARIO
//       (el CASO 2 lo cubría solo en municipio pequeño, donde el tope de renta ya es otro).
//
//   CASO 11 (límite) — HABITACIÓN en municipio ordinario · 600 €/mes CLAVADOS
//       600 = rentaMaximaMensual.habitacion (art. 133.1.e). Sin cubrir hasta hoy: los casos
//       previos probaban 500 (por debajo) y 900 (por encima), nunca el borde inclusive.
//       tope de renta  600 ≤ 600 → dentro, sin aviso
//       60 % de 600 = 360 > 200 → ayuda = mín(200; 360) = 200,00 €
//       pago real      600 − 200 = 400,00 €
//       4 años         200 × 48 = 9.600 → «9600,00 €»
//       nota del 60 %  NO (el porcentaje no rebaja la cuantía)
//       veredicto      APTO · y con 601 € → NO APTO (tope 600,00 €, introducido 601,00 €)
//
//   CASO 12 (rechazo) — VIVIENDA · 700 €/mes · «No» a la incompatibilidad del art. 136
//       700 ≤ 1.000 (art. 133.1.e): la renta NO es el problema, y de ser apto la ayuda
//       sería mín(300; 60 % de 700 = 420) = 300,00 €/mes.
//       Quien ya cobra otra ayuda al pago del alquiler queda excluido por el art. 136
//       (`compatibleConOtrasAyudasAlquiler = false`): NO APTO, sin panel de ahorro y sin
//       que aparezca en pantalla la cifra de 300,00 € que no va a cobrar.
// ═════════════════════════════════════════════════════════════════════════════

/** Abre la ruta y espera a que React haya montado el input: antes de eso, un clic se pierde */
async function abrirHidratado(page: Page) {
  await abrir(page);
  await esperarHidratacion(page, ['#alquiler']);
}

test.describe('Inspección 14/09/2026 — casos nuevos', () => {
  test('CASO 10 (normal): habitación a 300 €/mes en municipio ordinario → el 60 % manda (180,00 €)', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    // 300 ≤ 600 = rentaMaximaMensual.habitacion (art. 133.1.e)
    await sembrarValor(page, '#alquiler', '300');
    await marcarTodosLosRequisitos(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);

    const panel = await panelDeAhorro(page);
    // mín(200 € de ayudaMaximaMensual.habitacion; 60 % de 300 = 180 €) = 180 €
    expect(panel[0]).toContain('180,00 €');
    // 300 − 180
    expect(panel[1]).toContain('120,00 €');
    // 180 × 48 meses (plazo.totalMaximoMeses, art. 134) — es-ES no agrupa cuatro cifras
    expect(panel[2]).toContain('8640,00 €');

    // El porcentaje rebaja la cuantía del art. 137: hay que decirlo
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(1);

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('¡Cumples todos los requisitos!');
    // La tarjeta anuncia lo que este caso cobra, no los 200 € del tope de la habitación
    expect(resultado).toContain('180,00 €/mes');
    expect(resultado).not.toContain('200,00 €');
  });

  test('CASO 11 (límite): 600 €/mes clavados es el último alquiler de habitación con derecho a ayuda (art. 133.1.e, inclusive)', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    // 600 € = rentaMaximaMensual.habitacion (art. 133.1.e), tope INCLUSIVE
    await sembrarValor(page, '#alquiler', '600');
    await marcarTodosLosRequisitos(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);

    const panel = await panelDeAhorro(page);
    // 60 % de 600 = 360 > 200 → manda la cuantía fija del art. 137
    expect(panel[0]).toContain('200,00 €');
    // 600 − 200
    expect(panel[1]).toContain('400,00 €');
    // 200 × 48 — es-ES no agrupa cuatro cifras
    expect(panel[2]).toContain('9600,00 €');
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(0);

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('¡Cumples todos los requisitos!');

    // Un euro por encima del tope de la habitación cae al otro lado
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    await sembrarValor(page, '#alquiler', '601');
    await marcarTodosLosRequisitos(page);

    const aviso = norm(await page.locator('[class*="avisoRenta"]').first().innerText());
    expect(aviso).toContain('Para una habitación el tope es 600,00 €/mes');
    expect(aviso).toContain('601,00 €/mes');
    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(await panelDeAhorro(page)).toHaveLength(0);
  });

  test('CASO 12 (rechazo): cobrar otra ayuda al alquiler excluye por el art. 136, aunque la renta esté dentro del tope', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 700 ≤ 1.000 = rentaMaximaMensual.vivienda: la renta no es el motivo del rechazo
    await sembrarValor(page, '#alquiler', '700');
    // Índice 4 = «No cobras ninguna otra ayuda al pago del alquiler» (art. 136), bloqueante
    await marcarTodosLosRequisitos(page, { indice: 4, valor: 'No' });

    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).toContain('al menos un requisito imprescindible que no cumples');
    // Ni la cifra que NO va a cobrar: mín(300; 60 % de 700 = 420) = 300 €/mes
    expect(rechazo).not.toContain('300,00 €');
    expect(await panelDeAhorro(page)).toHaveLength(0);

    // Y la regla se lee en pantalla sin desplegar la guía educativa
    const visible = norm(await page.locator('body').innerText());
    expect(visible).toContain('art. 136');
    expect(visible).toContain('INCOMPATIBLE');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los cuatro hallazgos de la re-inspección del 14/09/2026 (852-855),
// REPARADOS el 15/09/2026. Se escribieron con `test.fail()` afirmando lo que DEBERÍA
// pasar, igual que se hizo con 642-645 y 686-688; hecha la reparación se les quitó la
// marca y quedan como guardián.
//
// Los cuatro eran de la misma familia, la que esta app ya conoce: el texto que
// acompaña al veredicto afirma más de lo que el veredicto sostiene.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos del 14/09/2026 (852-855), reparados el 15/09/2026', () => {
  // H4 (MEDIO) — El requisito del contrato es una EXIGENCIA del RD según la propia app, y
  // el veredicto lo trata como un adorno.
  //
  // La tarjeta dice «El contrato debe estar formalizado por escrito y depositada la fianza»
  // y la FAQ de la página se lo atribuye al Real Decreto sin matices: «el RD 326/2026 no
  // fija a nivel estatal ninguna condición sobre el propietario: SOLO EXIGE que el contrato
  // de arrendamiento esté formalizado por escrito y con la fianza depositada (art. 133.1.e)».
  // Pero en `REQUISITOS` va con `bloqueante: false`, sin el distintivo IMPRESCINDIBLE, así
  // que quien responde «No» —y la pregunta ya contempla el futuro: «está registrado (o lo
  // estará)»— recibe «⚠️ Cumples los requisitos básicos · Cumples los requisitos
  // obligatorios, aunque algunos aspectos adicionales (contrato registrado, documentación
  // completa...) pueden condicionar la aprobación final», con el panel de ahorro entero
  // pintado: 300,00 €/mes y 14.400,00 € en 4 años.
  //
  // Es la forma exacta del hallazgo 686 (art. 136), reparado el 10/09: una condición que el
  // RD impone se cuenta en la prosa y no llega al veredicto. Y el sentido del error es el
  // malo para un dictamen de elegibilidad: se le dice a quien no cumple que sí cumple.
  //
  // La invariante admite las dos reparaciones posibles: o el requisito pasa a bloqueante
  // (como el del art. 136), o la tarjeta y la FAQ dejan de presentarlo como exigencia
  // estatal y lo describen como lo que entonces sería —un trámite que concreta cada CA—.
  test('H4 — o el contrato del art. 133.1.e condiciona el veredicto, o la app deja de llamarlo exigencia', async ({ page }) => {
    await abrirHidratado(page);

    // ¿La app lo presenta como una exigencia del Real Decreto?
    const tarjetas = page.locator('[class*="checkCard"]');
    const contrato = norm(await tarjetas.nth(5).innerText());
    /*
      ⚠️ 21/09/2026 — esta aserción localizaba la tarjeta por «contrato de arrendamiento», que
      era el enunciado de la pregunta ANTES del hallazgo 1168. Aquella pregunta iba del
      REGISTRO del contrato —que la propia explicación presenta como un añadido de cada
      comunidad autónoma— mientras bloqueaba por el art. 133.1.e, que exige otra cosa. Ahora
      la pregunta es la del artículo, y la tarjeta se localiza por lo que no ha cambiado: que
      es la del contrato.
    */
    expect(contrato).toContain('contrato'); // la tarjeta esperada
    /*
      ⚠️ 28/09/2026 (hallazgo 2390) — aquí se exigía que la tarjeta dijera «fianza depositada»,
      y eso CONSAGRABA el defecto: cotejado con el BOE, ninguna letra del art. 133 menciona la
      fianza, y el contrato no es el art. 133.1.e (el tope de renta) sino el 133.1.a, que para
      la habitación dispensa además la forma de la Ley 29/1994. Lo que la tarjeta tiene que
      decir es el artículo del que sale; que la fianza NO es una exigencia del RD lo fija H13.
    */
    expect(contrato).toContain('art. 133.1.a');
    const loPresentaComoExigencia = /debe estar formalizado por escrito/i.test(contrato);

    // ¿Y qué hace el veredicto cuando se responde que NO lo está ni lo estará?
    await sembrarValor(page, '#alquiler', '700'); // 700 ≤ 1.000: la renta no es el problema
    await marcarTodosLosRequisitos(page, { indice: 5, valor: 'No' });
    const veredicto = norm(await page.locator('[role="status"]').first().innerText());
    const afirmaQueCumple = /Cumples los requisitos obligatorios/.test(veredicto);

    // No pueden ser las dos cosas a la vez
    expect(loPresentaComoExigencia && afirmaQueCumple).toBe(false);
  });

  // H5 (BAJO) — El `faqJsonLd` teclea a mano dos umbrales que el módulo sella y que el
  // propio fichero ya sabe importar.
  //
  // `metadata.ts` importa `UMBRAL_IPREM_VIVIENDA_JOVEN` y deriva de él `general` (5), pero
  // la respuesta de ingresos escribe «5,5 veces con el 33% o más, 6 veces con el 65% o más»
  // como texto literal, teniendo `discapacidad33` y `discapacidad65` a una propiedad de
  // distancia. La página visible SÍ los deriva (la tarjeta de la checklist imprime «5,5» y
  // «6» desde el módulo), así que si el RD moviera cualquiera de los dos, la página y el
  // FAQPage dirían cosas distintas — y el que se quedaría mintiendo es el canal que leen
  // ChatGPT, Perplexity y Bing Copilot sin nada al lado que lo contradiga.
  //
  // Es el patrón de los hallazgos 489, 645 y 687, que esta app ya ha reparado tres veces en
  // otros sitios: la cifra correcta hoy pero desanclada del módulo. Mismo caso con el plazo:
  // «(2 años renovables por otros 2)» está tecleado junto a un `DURACION_TOTAL_ANIOS` que sí
  // sale de `plazo.totalMaximoMeses`.
  test('H5 — los umbrales por discapacidad del FAQPage deberían salir del módulo, como los de la página', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const fuente = readFileSync(
      join(process.cwd(), 'app', 'simulador-bono-joven-alquiler', 'metadata.ts'),
      'utf8',
    );
    // 5,5 = UMBRAL_IPREM_VIVIENDA_JOVEN.discapacidad33 · 6 = .discapacidad65 (art. 133.1.d)
    expect(fuente).not.toContain('5,5 veces con el 33%');
    expect(fuente).not.toContain('6 veces con el 65%');
    // 2 + 2 = plazo.inicialMeses / 12 y plazo.prorrogaMaximaMeses / 12 (art. 134)
    expect(fuente).not.toContain('(2 años renovables por otros 2)');
  });

  // H6 (BAJO) — «Cumples los requisitos obligatorios» con la renta sin comprobar.
  //
  // Con los 7 requisitos a «Sí» y el campo de renta vacío, el veredicto dice literalmente
  // «Cumples los requisitos obligatorios, aunque algunos aspectos adicionales (...) pueden
  // condicionar la aprobación final. Falta comprobar la renta: introdúcela aquí arriba para
  // verificarla contra el tope del art. 133.1.e». Las dos frases se contradicen dentro del
  // mismo párrafo: el tope de renta no es un «aspecto adicional» sino una condición
  // obligatoria del RD —la propia app rechaza de plano a quien la supera, antes incluso de
  // mirar la checklist—, así que mientras no se conozca no se puede afirmar que se cumplen
  // los requisitos obligatorios. El sentido del error vuelve a ser el optimista.
  test('H6 — sin renta tecleada el veredicto no debería afirmar que se cumplen los requisitos obligatorios', async ({ page }) => {
    await abrirHidratado(page);
    await marcarTodosLosRequisitos(page); // los 7 a «Sí», sin tocar la renta

    const veredicto = norm(await page.locator('[role="status"]').first().innerText());
    // Que reconozca que falta la renta está bien; afirmar a la vez el cumplimiento, no.
    // ⚠️ La redacción se rehízo al reparar (15/09/2026): en vez de añadir «Falta comprobar la
    // renta» detrás de una afirmación que la contradecía, el veredicto entero cambia mientras
    // la renta no está, y el titular deja de decir «Cumples». Lo que este caso fija es eso: que
    // nombre lo que falta y NO afirme el cumplimiento, no la frase concreta.
    expect(veredicto).toMatch(/falta la renta|Falta comprobar la renta/i);
    expect(veredicto).not.toContain('Cumples los requisitos obligatorios');
  });

  // H7 (BAJO) — El rechazo nombra una sola causa cuando hay dos.
  //
  // Con 1.500 €/mes de vivienda (> 1.000 del art. 133.1.e) Y la edad respondida «No», el
  // veredicto atribuye el rechazo únicamente a la renta: «La renta que has introducido
  // (1500,00 €/mes) supera el máximo de 1000,00 €/mes que da derecho a esta ayuda». Del
  // requisito imprescindible que también falla no dice nada, porque la rama de la renta
  // sustituye al mensaje genérico en lugar de sumarse a él. Quien lo lea concluirá que
  // mudándose a un piso más barato tendría derecho, cuando la edad lo excluye igual.
  // El sentido del error no es el veredicto —que es correcto— sino la acción que induce.
  test('H7 — cuando fallan la renta Y un requisito imprescindible, el rechazo debería nombrar los dos', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 1.500 > 1.000 = rentaMaximaMensual.vivienda (art. 133.1.e)
    await sembrarValor(page, '#alquiler', '1500');
    // Índice 0 = «Tienes entre 18 y 35 años (inclusive)» (art. 133.1.b), bloqueante
    await marcarTodosLosRequisitos(page, { indice: 0, valor: 'No' });

    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).toContain('1000,00 €/mes'); // la causa que sí nombra
    expect(rechazo).toMatch(/imprescindible/i); // la que se calla
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 21/09/2026 (segmento fiscal, RIESGO 1 CRÍTICO) — la 9.ª
// ═════════════════════════════════════════════════════════════════════════════
//
// Objeto de esta pasada: el VEREDICTO de elegibilidad, que es donde caían los cuatro
// hallazgos del 14/09 (852-855), reparados el 15/09. Se comprobó uno por uno en el
// navegador que siguen cerrados Y que la reparación no ha introducido el defecto
// simétrico — que es el riesgo propio de este tipo de arreglo: quien endurece un
// dictamen para dejar de aprobar de más puede pasar a rechazar o a avisar de más.
//
//   · 852 (MEDIO) — el contrato del art. 133.1.e es BLOQUEANTE: lleva el distintivo
//     IMPRESCINDIBLE y respondido «No» da «❌ No cumples los requisitos obligatorios»
//     sin panel de ahorro. Lo fija el CASO 14.
//   · 853 (BAJO) — con los 7 requisitos a «Sí» y la renta sin teclear, el titular ya
//     no dice «Cumples»: dice «Falta un dato para poder juzgarlo» y nombra la renta
//     como condición del art. 133.1.e. Comprobado; lo guarda el caso H6 de arriba.
//   · 854 (BAJO) — con renta fuera de tope Y un imprescindible a «No», el rechazo
//     nombra las DOS causas («Y además, hay al menos un requisito imprescindible»).
//     Lo fija el CASO 15, con otro requisito y otro tope que el caso H7.
//   · 855 (BAJO) — el `faqJsonLd` deriva ya los dos umbrales por discapacidad y los
//     dos tramos del plazo del módulo. Comprobado en el HTML servido: «5,5 veces con
//     el 33 %», «6 veces con el 65 %» y «2 años renovables por otros 2» siguen siendo
//     los valores correctos, y ahora salen de `UMBRAL_IPREM_VIVIENDA_JOVEN` y de
//     `plazo.*`. Lo guarda el caso H5 de arriba, que mira la FUENTE (es un latente:
//     desde la página servida las dos versiones se leen igual).
//
// AUDITORÍA DE LOS CASOS PREVIOS: revisados uno por uno. Ninguno fija como contrato un
// comportamiento hoy defectuoso; todas sus cifras siguen ancladas en `data/fiscal`. Lo
// único que se ha tocado son dos rótulos de sección que habían quedado mintiendo
// («Hallazgos abiertos» sobre hallazgos ya reparados) y un comentario que contaba 5
// bloqueantes cuando son 6 desde que el 852 ascendió el del contrato.
//
// De dónde sale cada cifra esperada: `data/fiscal/vivienda-joven.ts`, sellado contra el
// BOE (RD 326/2026, BOE-A-2026-8872) el 23/08/2026. Ninguna de memoria.
//
// CASOS NUEVOS (resueltos a mano ANTES de abrir el navegador)
// ───────────────────────────────────────────────────────────
//   CASO 13 (normal) — VIVIENDA en municipio ordinario · 800 €/mes · los 7 a «Sí»
//       tope de renta  800 ≤ 1.000 (rentaMaximaMensual.vivienda, art. 133.1.e) → dentro
//       60 % de 800 = 480 > 300 (ayudaMaximaMensual.vivienda, art. 137)
//       ayuda          mín(300; 480) = 300,00 €   ← manda la cuantía fija
//       pago real      800 − 300 = 500,00 €
//       4 años         300 × 48 (plazo.totalMaximoMeses, art. 134) = 14.400,00 €
//       nota del 60 %  NO (el porcentaje no rebaja la cuantía)
//       veredicto      APTO citando 300,00 €/mes
//       800 € es además la renta del escenario «Trabajador de 32 años» del bloque
//       educativo: con la MISMA entrada, prosa y motor tienen que decir lo mismo
//       (300 €/mes, el 37,5 % de la renta, 500 €/mes de pago real). Es el cruce que
//       pedía el hallazgo 645, ahora comprobado contra el simulador y no solo contra
//       el código.
//
//   CASO 14 (límite) — VIVIENDA · 1.000,00 € CLAVADOS + contrato (art. 133.1.e) a «No»
//       1.000 = rentaMaximaMensual.vivienda: el canto es INCLUSIVE (`<=` en el código),
//       así que la renta NO es causa de rechazo.
//       contrato «No» → bloqueante desde el 852 → NO APTO, sin panel y sin aviso de renta
//       Lo que este caso vigila es el simétrico del 854: si el rechazo nombrara la renta
//       —o dijera «Y además»— estaría inventando una causa en el canto exacto del tope.
//       Control: el mismo 1.000 con los 7 a «Sí» → APTO · 300,00 € · 700,00 € · 14.400,00 €
//
//   CASO 15 (rechazo, DOS causas) — HABITACIÓN en municipio ≤ 10.000 hab. · 400 €/mes
//                                   + «No» a la incompatibilidad del art. 136 (índice 4)
//       tope de renta  400 > 250 (rentaMaximaMensual.municipioPequeno.habitacion) → fuera
//       y además       el art. 136 excluye por sí solo
//       El rechazo tiene que nombrar LAS DOS causas, con el tope de la habitación en
//       municipio pequeño (250,00 €), no el de la vivienda ni el de la habitación
//       ordinaria. Sin panel de ahorro.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Inspección 21/09/2026 — casos nuevos', () => {
  test('CASO 13 (normal): vivienda a 800 €/mes → 300,00 € de ayuda, y la prosa del bloque educativo dice lo mismo que el motor', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 800 ≤ 1.000 = rentaMaximaMensual.vivienda (art. 133.1.e)
    await sembrarValor(page, '#alquiler', '800');
    await marcarTodosLosRequisitos(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);

    const panel = await panelDeAhorro(page);
    // mín(300 € de ayudaMaximaMensual.vivienda; 60 % de 800 = 480 €) = 300 €
    expect(panel[0]).toContain('300,00 €');
    // 800 − 300
    expect(panel[1]).toContain('500,00 €');
    // 300 × 48 meses (plazo.totalMaximoMeses, art. 134)
    expect(panel[2]).toContain('14.400,00 €');

    // El 60 % de 800 (480 €) queda por encima de la cuantía: el límite no muerde
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(0);

    const resultado = norm(await page.locator('[role="status"]').first().innerText());
    expect(resultado).toContain('¡Cumples todos los requisitos!');
    expect(resultado).toContain('300,00 €/mes');

    // Misma entrada, otro canal: el escenario del bloque educativo. 300/800 = 37,5 %
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const escenario = norm(await page.getByText(/Trabajador de 32 años/).locator('xpath=..').innerText());
    expect(escenario).toContain('Alquiler de 800 €/mes');
    expect(escenario).toContain('300 €/mes');
    expect(escenario).toContain('el 37,5 % de la renta'); // «37,5 %»: espacio duro (2393), normalizado por `norm`
    expect(escenario).toContain('Paga 500 €/mes');
  });

  test('CASO 14 (límite): con 1.000,00 € clavados el rechazo por el contrato del art. 133.1.e no puede atribuir nada a la renta', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 1.000 € = rentaMaximaMensual.vivienda (art. 133.1.e), tope INCLUSIVE
    await sembrarValor(page, '#alquiler', '1000');
    // Índice 5 = el requisito del contrato, bloqueante desde la reparación del hallazgo 852
    // (15/09/2026); su pregunta es la del art. 133.1.a desde el hallazgo 2390 (28/09/2026)
    await marcarTodosLosRequisitos(page, { indice: 5, valor: 'No' });

    // El canto es inclusive: ni aviso de renta ni panel de ahorro
    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);
    expect(await panelDeAhorro(page)).toHaveLength(0);

    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).toContain('al menos un requisito imprescindible que no cumples');
    // Simétrico del 854: la renta está DENTRO, así que no puede figurar como causa
    expect(rechazo).not.toContain('supera el máximo');
    expect(rechazo).not.toContain('Y además');
    expect(rechazo).not.toContain('1000,00 €/mes');

    // Control: ese mismo importe con todo a «Sí» sí da derecho a la ayuda
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    await sembrarValor(page, '#alquiler', '1000');
    await marcarTodosLosRequisitos(page);
    const panel = await panelDeAhorro(page);
    // 60 % de 1.000 = 600 > 300 → manda la cuantía fija del art. 137
    expect(panel[0]).toContain('300,00 €');
    // 1.000 − 300
    expect(panel[1]).toContain('700,00 €');
    // 300 × 48
    expect(panel[2]).toContain('14.400,00 €');
    const apto = norm(await page.locator('[role="status"]').first().innerText());
    expect(apto).toContain('¡Cumples todos los requisitos!');
  });

  test('CASO 15 (rechazo): 400 €/mes por una habitación en municipio pequeño Y otra ayuda al alquiler → el rechazo nombra las DOS causas', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    await page.getByRole('button', { name: /El municipio tiene 10\.000 habitantes o menos/ }).click();
    // 250 € = rentaMaximaMensual.municipioPequeno.habitacion (art. 133.1.e); 400 lo supera
    await sembrarValor(page, '#alquiler', '400');
    // Índice 4 = «No cobras ninguna otra ayuda al pago del alquiler» (art. 136), bloqueante
    await marcarTodosLosRequisitos(page, { indice: 4, valor: 'No' });

    const aviso = norm(await page.locator('[class*="avisoRenta"]').first().innerText());
    expect(aviso).toContain('Para una habitación en un municipio de 10.000 habitantes o menos el tope es 250,00 €/mes');
    expect(aviso).toContain('400,00 €/mes');

    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    // Causa 1 — el art. 133.1.e, con el tope del municipio pequeño y no otro
    expect(rechazo).toContain('400,00 €/mes');
    expect(rechazo).toContain('250,00 €/mes');
    // Causa 2 — el art. 136, SUMADA a la anterior (hallazgo 854)
    expect(rechazo).toContain('Y además, hay al menos un requisito imprescindible');

    expect(await panelDeAhorro(page)).toHaveLength(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los tres hallazgos de la re-inspección del 21/09/2026 (1168, 1169 y 1170),
// REPARADOS el 21/09. Se escribieron con `test.fail()` afirmando lo que la app DEBERÍA hacer,
// igual que 642-645, 686-688 y 852-855; al repararlos se les quitó la marca sin tocar ninguna
// aserción, así que lo que hoy pasa en verde es exactamente lo que ayer fallaba en rojo.
//
// Los tres son de la misma familia: la reparación del 15/09 endureció el dictamen y el
// texto que lo acompaña no se ajustó en el sentido contrario.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Regresión — hallazgos 1168, 1169 y 1170 del 21/09/2026', () => {
  // H8 (MEDIO) — la pregunta que ahora BLOQUEA no es la del artículo que ella misma cita.
  //
  // Al reparar el 852 el requisito del contrato pasó a `bloqueante: true` con distintivo
  // IMPRESCINDIBLE, pero su PREGUNTA se quedó como estaba: «El contrato de arrendamiento
  // está registrado (o lo estará)». Y su propia explicación dice otra cosa: «El art. 133.1.e
  // del RD 326/2026 exige que el contrato esté formalizado por escrito y la fianza
  // depositada. Las CA pueden pedir ADEMÁS su depósito oficial». Es decir, la app describe
  // el registro/depósito oficial como un añadido autonómico y a la vez bloquea con él un
  // dictamen estatal.
  //
  // Consecuencia: quien tiene su contrato por escrito y la fianza depositada —o sea, quien
  // SÍ cumple el art. 133.1.e— pero no lo tiene «registrado» ni lo va a estar, responde «No»
  // con toda honestidad y recibe «❌ No cumples los requisitos obligatorios», sin panel y
  // sin matiz. Es el defecto simétrico del 852: aquel aprobaba de más, este rechaza de más,
  // y en un dictamen de elegibilidad los dos sentidos del error importan.
  //
  // La invariante admite las tres reparaciones posibles: alinear la pregunta con el artículo
  // (preguntar por el contrato escrito y la fianza depositada), devolver el requisito a no
  // bloqueante, o dejar de presentar el registro como un añadido de las CA.
  test('H8 — el requisito que bloquea por el art. 133.1.e debería preguntar por lo que ese artículo exige', async ({ page }) => {
    await abrirHidratado(page);
    const tarjeta = page.locator('[class*="checkCard"]').nth(5);
    const pregunta = norm(await tarjeta.locator('[class*="checkPregunta"]').innerText());
    const explicacion = norm(await tarjeta.locator('[class*="checkExplicacion"]').innerText());

    // ¿La pregunta que decide el veredicto va del registro y no de lo que exige el artículo?
    const preguntaPorElRegistro = /registrad/i.test(pregunta) && !/(escrito|fianza)/i.test(pregunta);
    // ¿Y la propia app llama a eso un añadido de las comunidades autónomas?
    const esAnadidoAutonomico = /Las CA pueden pedir además/i.test(explicacion);
    // ¿Y aun así bloquea?
    const bloquea = (await tarjeta.getByText('IMPRESCINDIBLE').count()) > 0;

    // Las tres cosas a la vez no pueden ser: se rechaza de plano a quien cumple el RD
    expect(preguntaPorElRegistro && esAnadidoAutonomico && bloquea).toBe(false);
  });

  // H9 (BAJO) — «una renta más baja no bastaría por sí sola» también cuando la renta está
  // dentro del tope, o cuando no se ha tecleado ninguna.
  //
  // La reparación del 854 hizo que las dos causas se SUMEN en vez de sustituirse, y para
  // ello añadió al párrafo del requisito imprescindible la coletilla «así que una renta más
  // baja no bastaría por sí sola». Esa coletilla solo tiene sentido en el caso doble, pero
  // se imprime SIEMPRE que falla un bloqueante:
  //
  //   · con 600 €/mes (600 ≤ 1.000, la renta es correcta) y la edad a «No» →
  //     «Hay al menos un requisito imprescindible que no cumples, así que una renta más baja
  //      no bastaría por sí sola.»
  //   · con el campo de renta VACÍO y la edad a «No» → exactamente el mismo texto, hablando
  //     de rebajar una renta que el usuario no ha llegado a introducir.
  //
  // Induce a creer que la renta forma parte del problema cuando no lo es: es el error del
  // 854 al revés (aquel callaba una causa, este insinúa una que no existe), y el sentido es
  // el mismo que la app quiere evitar — que el lector deduzca una acción equivocada.
  test('H9 — con la renta dentro del tope el rechazo no debería especular con una renta más baja', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 600 ≤ 1.000 = rentaMaximaMensual.vivienda (art. 133.1.e): la renta NO es el problema
    await sembrarValor(page, '#alquiler', '600');
    // Índice 0 = «Tienes entre 18 y 35 años (inclusive)» (art. 133.1.b), bloqueante
    await marcarTodosLosRequisitos(page, { indice: 0, valor: 'No' });

    const rechazo = norm(await page.locator('[role="status"]').first().innerText());
    expect(rechazo).toContain('al menos un requisito imprescindible que no cumples');
    // La coletilla del 854 pertenece al caso de DOS causas, no a este
    expect(rechazo).not.toContain('una renta más baja no bastaría por sí sola');
  });

  // H10 (BAJO) — una renta ilegible es, para el motor, un campo vacío, y nada lo dice.
  //
  // `alquilerNum = Math.max(0, parseSpanishNumberOr(alquilMensual))`: `parseSpanishNumberOr`
  // devuelve 0 en todo lo que `parseSpanishNumber` RECHAZA («mil euros», «1e3», «12abc»), así
  // que un texto ilegible y un campo vacío son la misma cosa. El guardián de negativos —que
  // sí existe, porque `alquilerCrudo < 0` se comprueba aparte— marca `aria-invalid` y explica
  // el problema; el ilegible no marca nada.
  //
  // Lo importante está bien: el veredicto NO se presenta como firme, dice «Falta un dato para
  // poder juzgarlo» (reparación del 853). Lo que falla es lo que pide a continuación —
  // «Introdúcela aquí arriba para comprobarla contra su tope»— a alguien que la ve escrita en
  // el campo: no sabrá que lo que tecleó no vale, y la asimetría con el negativo es del propio
  // código, no de la norma.
  test('H10 — una renta que el parser rechaza debería señalarse, no confundirse con el campo vacío', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // `parseSpanishNumber('mil euros')` = NaN → `parseSpanishNumberOr` lo convierte en 0
    await sembrarValor(page, '#alquiler', 'mil euros');
    await marcarTodosLosRequisitos(page);

    const marcadoInvalido = (await page.locator('#alquiler').getAttribute('aria-invalid')) === 'true';
    const veredicto = norm(await page.locator('[role="status"]').first().innerText());
    const pideQueLaIntroduzca = /Introdúcela aquí arriba/.test(veredicto);

    // O se dice que lo tecleado no vale, o no se le pide introducir lo que ya introdujo
    expect(marcadoInvalido || !pideQueLaIntroduzca).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 28/09/2026 (segmento fiscal, RIESGO 1 CRÍTICO) — la 10.ª
// ═════════════════════════════════════════════════════════════════════════════
//
// Primero se ejecutó entera la batería anterior contra el build de producción de HEAD:
// **39/39 en verde**. Comprobado además a mano en el navegador lo que tocó 352da52c
// (21/09), más allá de lo que miran H8-H10:
//
//   · 1168 — la pregunta del contrato ya es «El contrato está por escrito y la fianza
//     depositada (o lo estará)» y la explicación dice que el registro autonómico «este
//     simulador no verifica». Respondida «No» con 600 €/mes: rechazo con UNA causa,
//     «Hay al menos un requisito imprescindible que no cumples.», sin panel. PERO: cotejada
//     con el BOE, esa pregunta seguía sin ser la del artículo que cita — ver H13 abajo
//     (hallazgo 2390, REPARADO el 28/09/2026).
//   · 1169 — la coletilla «una renta más baja no bastaría» ya solo sale con la renta fuera
//     de tope; comprobado también con el campo VACÍO (H9 solo lo mira con 600 €). CASO 18.
//   · 1170 — «12abc», «1e3» y «mil» marcan aria-invalid, enlazan #alquiler-error por
//     aria-describedby y el veredicto dice «La que has introducido no es válida: corrígela
//     aquí arriba.»; al corregir a 550 el aviso desaparece y el cálculo vuelve. CASO 19.
//   · b7733c6d (22/09) — la cabecera de la tabla pasa a --primary-boton. Sin incidencias.
//
// ── Cotejo con la FUENTE que cita el módulo ──────────────────────────────────
// Esta pasada leyó el texto consolidado del RD 326/2026 en el BOE (BOE-A-2026-8872,
// arts. 8 y 132-139), que es la fuente que cita FISCAL_VIVIENDA_JOVEN_META. Todas las cifras
// de BONO_ALQUILER_JOVEN_2026 y UMBRAL_IPREM_VIVIENDA_JOVEN coinciden (300/200 €, 60 %,
// 1.000/600/500/250 €, 24+24 meses, 18-35 inclusive, 5/5,5/6 × IPREM), y el art. 8.2.b
// confirma el IPREM «referido a 14 pagas» que usa la checklist (5 × 8.400 = 42.000 €).
// Lo que NO coincide es la prosa de la app sobre los requisitos que el módulo no sella:
//   · art. 133.1.e es SOLO el tope de renta; el contrato es el art. 133.1.a, que no habla
//     de fianza y para la habitación dispensa expresamente la forma de la LAU (H13);
//   · art. 133.2.b excluye el parentesco hasta segundo grado con el arrendador y el
//     133.2.c al socio del arrendador: ni la checklist ni el veredicto lo miran (H11), y la
//     FAQ afirma que el RD «no fija ninguna condición sobre el propietario» (H12);
//   · art. 133.2.a exceptúa al propietario que no puede disponer de su vivienda por
//     separación o divorcio, causa ajena o inaccesibilidad por discapacidad (H14);
//   · art. 133.3 (cambio de domicilio: 15 días, sin interrupción) y art. 138 (convocatorias
//     abiertas de forma continuada y permanente) contradicen dos textos de la página
//     (H18 y H19); la regla de la pareja no está en el RD (H20).
//
// ── Sobre los fallos de este spec en la suite con --workers=4 sobre next dev ──
// Se reprodujo: el helper `abrir()` de arriba espera a que #alquiler EXISTA, no a que React
// lo haya hidratado, y lo usan 26 de los 39 casos anteriores. Retrasando 1,5 s los chunks
// JS (lo que hace `next dev` compilando bajo carga) los 7 clics «Sí» se pierden: 0 pulsados,
// ningún role="status" y el `innerText` de la tarjeta espera hasta los 30 s. Es exactamente
// el síntoma de aquella sesión. Los casos nuevos usan `abrirHidratado`. No se ha tocado el
// helper (no se reescriben los tests existentes): basta con que `abrir()` llame a
// `esperarHidratacion(page, ['#alquiler'])`.
// → HECHO al reparar los hallazgos 2388-2397 (28/09/2026): `abrir()` ya espera la hidratación.
//
// De dónde sale cada cifra esperada: `data/fiscal/vivienda-joven.ts` (sellado contra el BOE
// el 23/08/2026) y, para los requisitos que el módulo no recoge, el texto del BOE citado.
//
// CASOS NUEVOS (resueltos a mano ANTES de abrir el navegador)
// ───────────────────────────────────────────────────────────
//   CASO 16 (normal, coma decimal) — VIVIENDA · «412,35» €/mes · los 7 a «Sí»
//       parseSpanishNumber('412,35') = 412,35 ≤ 1.000 (rentaMaximaMensual.vivienda)
//       60 % de 412,35 = 247,41 < 300 (ayudaMaximaMensual.vivienda, limiteSobreRenta)
//       ayuda          247,41 €   ← manda el porcentaje, con céntimos
//       pago real      412,35 − 247,41 = 164,94 €
//       4 años         247,41 × 48 (plazo.totalMaximoMeses) = 11.875,68 €
//       veredicto      APTO citando 247,41 €/mes · con la nota del límite del 60 %
//
//   CASO 17 (límite, los dos separadores) — VIVIENDA · «1.000,00» y «1.000,01»
//       1.000,00 = rentaMaximaMensual.vivienda (art. 133.1.e, «igual o inferior») → dentro
//         ayuda mín(300; 600) = 300,00 · pago 700,00 · 4 años 14.400,00 · APTO
//       1.000,01 > 1.000 → fuera por un céntimo: aviso con «1000,00 €/mes» y
//         «1000,01 €/mes» (es-ES no agrupa cuatro cifras) · NO APTO · sin panel
//       y 1.000,00 como HABITACIÓN → 1.000 > 600 (rentaMaximaMensual.habitacion) · NO APTO
//
//   CASO 18 (rechazo, reparación del 1169) — VIVIENDA · 600 €/mes · contrato a «No»
//       600 ≤ 1.000: la renta no es causa → «Hay al menos un requisito imprescindible que
//       no cumples.» sin «Y además», sin «supera el máximo», sin coletilla, sin panel.
//       Y con el campo de renta VACÍO + edad a «No»: tampoco coletilla.
//
//   CASO 19 (rechazo del dato, reparación del 1170) — «12abc» y «1e3»
//       parseSpanishNumber → NaN → aria-invalid="true", aria-describedby="alquiler-error",
//       «no es un importe válido», veredicto «Falta un dato…» con «corrígela aquí arriba»
//       y sin «Introdúcela»; con 550 → 550 ≤ 1.000, 60 % = 330 > 300 → 300,00 · 250,00 ·
//       14.400,00 y el aviso desaparece.
// ═════════════════════════════════════════════════════════════════════════════

/** Marca «Sí» en todas las respuestas, sin fijar cuántos requisitos hay (sobrevive a que se añada uno) */
async function marcarTodoSi(page: Page) {
  for (const si of await page.getByRole('button', { name: 'Sí', exact: true }).all()) await si.click();
}

/** La tarjeta de veredicto de la app (no el anunciador de rutas de Next) */
const veredictoDe = (page: Page) => page.locator('[class*="resultadoCard"]');

test.describe('Inspector 28/09/2026 — casos nuevos', () => {
  test('CASO 16 (normal): vivienda a «412,35» €/mes → el 60 % manda con céntimos: 247,41 €, 164,94 € y 11.875,68 €', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // Coma decimal española: 412,35 ≤ 1.000 = rentaMaximaMensual.vivienda (art. 133.1.e)
    await sembrarValor(page, '#alquiler', '412,35');
    await marcarTodoSi(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);
    const panel = await panelDeAhorro(page);
    // 60 % (limiteSobreRenta) de 412,35 = 247,41 < 300 (ayudaMaximaMensual.vivienda)
    expect(panel[0]).toContain('247,41 €');
    // 412,35 − 247,41
    expect(panel[1]).toContain('164,94 €');
    // 247,41 × 48 (plazo.totalMaximoMeses, art. 134)
    expect(panel[2]).toContain('11.875,68 €');
    // El porcentaje rebaja la cuantía: se dice (tolerante al espacio duro que pide el H16)
    await expect(page.getByText(/Límite: 60\s?% de la renta/)).toHaveCount(1);

    await expect(veredictoDe(page)).toBeVisible();
    const veredicto = norm(await veredictoDe(page).innerText());
    expect(veredicto).toContain('¡Cumples todos los requisitos!');
    expect(veredicto).toContain('247,41 €/mes');
    expect(veredicto).not.toContain('300,00 €');
  });

  test('CASO 17 (límite): «1.000,00» es el último importe con derecho, «1.000,01» ya no, y el mismo 1.000 como habitación tampoco', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 1.000 = rentaMaximaMensual.vivienda (art. 133.1.e, «igual o inferior»)
    await sembrarValor(page, '#alquiler', '1.000,00');
    await marcarTodoSi(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);
    let panel = await panelDeAhorro(page);
    expect(panel[0]).toContain('300,00 €'); // mín(300; 60 % de 1.000 = 600)
    expect(panel[1]).toContain('700,00 €'); // 1.000 − 300
    expect(panel[2]).toContain('14.400,00 €'); // 300 × 48
    expect(norm(await veredictoDe(page).innerText())).toContain('¡Cumples todos los requisitos!');

    // Un céntimo por encima del tope, con punto de millar y coma decimal
    await sembrarValor(page, '#alquiler', '1.000,01');
    const aviso = norm(await page.locator('[class*="avisoRenta"]').innerText());
    expect(aviso).toContain('1000,00 €/mes'); // es-ES no agrupa cuatro cifras
    expect(aviso).toContain('1000,01 €/mes');
    const rechazo = norm(await veredictoDe(page).innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).toContain('1000,01 €/mes');
    panel = await panelDeAhorro(page);
    expect(panel).toHaveLength(0);

    // El mismo 1.000 como habitación: 1.000 > 600 = rentaMaximaMensual.habitacion
    await sembrarValor(page, '#alquiler', '1.000,00');
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    const avisoHab = norm(await page.locator('[class*="avisoRenta"]').innerText());
    expect(avisoHab).toContain('Para una habitación el tope es 600,00 €/mes');
    expect(avisoHab).toContain('1000,00 €/mes');
    expect(norm(await veredictoDe(page).innerText())).toContain('No cumples los requisitos obligatorios');
    expect(await panelDeAhorro(page)).toHaveLength(0);
  });

  test('CASO 18 (rechazo): el contrato a «No» con la renta dentro del tope rechaza con UNA causa, y sin renta tampoco se habla de rebajarla', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    // 600 ≤ 1.000 = rentaMaximaMensual.vivienda: la renta no es causa de nada
    await sembrarValor(page, '#alquiler', '600');
    await marcarTodoSi(page);
    const contrato = page.locator('[class*="checkCard"]').filter({ hasText: /contrato/i }).first();
    await contrato.getByRole('button', { name: 'No', exact: true }).click();

    const rechazo = norm(await veredictoDe(page).innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).toContain('Hay al menos un requisito imprescindible que no cumples.');
    expect(rechazo).not.toContain('Y además');
    expect(rechazo).not.toContain('supera el máximo');
    expect(rechazo).not.toContain('una renta más baja');
    expect(await panelDeAhorro(page)).toHaveLength(0);

    // Hallazgo 1169, la variante que H9 no mira: el campo de renta VACÍO
    await abrirHidratado(page);
    await marcarTodoSi(page);
    const edad = page.locator('[class*="checkCard"]').filter({ hasText: /años \(inclusive\)/ }).first();
    await edad.getByRole('button', { name: 'No', exact: true }).click();
    const sinRenta = norm(await veredictoDe(page).innerText());
    expect(sinRenta).toContain('Hay al menos un requisito imprescindible que no cumples.');
    expect(sinRenta).not.toContain('una renta más baja');
  });

  test('CASO 19 (dato ilegible): «12abc» y «1e3» se señalan como no válidos; corregido a 550 vuelve el cálculo', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    await marcarTodoSi(page);
    const campo = page.locator('#alquiler');

    for (const ilegible of ['12abc', '1e3']) {
      // parseSpanishNumber rechaza los dos (NaN): no es un campo vacío (hallazgo 1170)
      await sembrarValor(page, '#alquiler', ilegible);
      await expect(campo).toHaveAttribute('aria-invalid', 'true');
      await expect(campo).toHaveAttribute('aria-describedby', 'alquiler-error');
      await expect(page.locator('#alquiler-error')).toContainText(`«${ilegible}» no es un importe válido`);
      const veredicto = norm(await veredictoDe(page).innerText());
      expect(veredicto).toContain('Falta un dato para poder juzgarlo');
      expect(veredicto).toContain('La que has introducido no es válida: corrígela aquí arriba.');
      expect(veredicto).not.toContain('Introdúcela');
      expect(await panelDeAhorro(page)).toHaveLength(0);
    }

    // Corregido: 550 ≤ 1.000 · 60 % de 550 = 330 > 300 → 300,00 · 250,00 · 14.400,00
    await sembrarValor(page, '#alquiler', '550');
    await expect(campo).toHaveAttribute('aria-invalid', 'false');
    await expect(page.locator('#alquiler-error')).toHaveCount(0);
    const panel = await panelDeAhorro(page);
    expect(panel[0]).toContain('300,00 €');
    expect(panel[1]).toContain('250,00 €');
    expect(panel[2]).toContain('14.400,00 €');
    expect(norm(await veredictoDe(page).innerText())).toContain('¡Cumples todos los requisitos!');
  });
});

test.describe('Inspector 28/09/2026 — móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('A 390 px el panel entero cabe, los botones de modalidad se apilan y la página no se desborda', async ({ page }) => {
    await abrirHidratado(page);
    // Mismo caso que el CASO 17: 1.000,00 € → 300,00 · 700,00 · 14.400,00
    await sembrarValor(page, '#alquiler', '1.000,00');
    await marcarTodoSi(page);
    const panel = await panelDeAhorro(page);
    expect(panel[0]).toContain('300,00 €');
    expect(panel[1]).toContain('700,00 €');
    expect(panel[2]).toContain('14.400,00 €');
    for (const caja of await page.locator('[class*="ahorroCard"]').all()) {
      const b = await caja.boundingBox();
      expect(b).not.toBeNull();
      if (b) expect(b.x + b.width).toBeLessThanOrEqual(390);
    }

    // ≤ 480 px: el selector de modalidad pasa a una columna
    const viv = await page.getByRole('button', { name: /Vivienda completa/ }).boundingBox();
    const hab = await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).boundingBox();
    expect(viv && hab && Math.abs(viv.x - hab.x) < 2 && hab.y > viv.y).toBe(true);

    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// REGRESIÓN — los diez hallazgos de la re-inspección del 28/09/2026 (2388-2397), REPARADOS
// el 28/09/2026. Se escribieron con `test.fail()` afirmando lo que la app DEBERÍA hacer; al
// repararlos se les quitó la marca y quedan como guardián. Ninguna aserción del Inspector se
// ha retirado ni aflojado: donde la reparación permitía comprobar más, se ha AÑADIDO.
// La fuente de H11-H14 y H18-H20 es el texto consolidado del RD 326/2026 en el BOE
// (https://www.boe.es/buscar/act.php?id=BOE-A-2026-8872), el que cita FISCAL_VIVIENDA_JOVEN_META,
// re-cotejado artículo por artículo al reparar (arts. 8, 132-139 y 140-145).
// ═════════════════════════════════════════════════════════════════════════════

/** Contraste WCAG del texto de un elemento contra su fondo compuesto (capas con alfa incluidas) */
async function contrasteDe(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const leer = (c: string): number[] => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    };
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) capas.push(leer(getComputedStyle(n).backgroundColor));
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const t = leer(getComputedStyle(el).color);
    const texto = [0, 1, 2].map((k) => t[k] * t[3] + fondo[k] * (1 - t[3]));
    const [L1, L2] = [lum(texto), lum(fondo)];
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  });
}

/** La primera tarjeta de la checklist cuyo texto casa con el patrón */
const tarjetaCon = (page: Page, patron: RegExp) =>
  page.locator('[class*="checkCard"]').filter({ hasText: patron }).first();

test.describe('Regresión — hallazgos 2388-2397 del 28/09/2026, reparados el 28/09/2026', () => {
  // H11 (ALTO) — REPARADO (28/09/2026) (hallazgo 2388): el veredicto no miraba las
  // exclusiones del art. 133.2.b y c. «No podrá concederse la ayuda cuando … la persona
  // arrendataria tenga parentesco en primer o segundo grado de consanguinidad o de afinidad
  // con la persona arrendadora» (b), ni cuando sea socia o partícipe del arrendador (c).
  // Ninguno de los 7 requisitos lo preguntaba, así que un joven que alquila el piso de su padre
  // o de su hermana respondía «Sí» a todo con honestidad y recibía «¡Cumples todos los
  // requisitos!» con 300,00 €/mes. Es la forma del hallazgo 686 (art. 136, reparado el 10/09):
  // una exclusión del RD que no llega al veredicto, en el sentido malo — aprobar de más.
  // CASO: vivienda 600 €/mes, los 7 a «Sí» → esperado un requisito (o aviso en el veredicto)
  // sobre el parentesco con el arrendador · obtenido «¡Cumples todos los requisitos!» y ni
  // «parentesco» ni «familiar» en toda la página fuera de la guía colapsada.
  // Reparación: requisito BLOQUEANTE (el RD dice «no podrá concederse», no admite matiz: un
  // aviso junto a «¡Cumples todos los requisitos!» seguiría aprobando de más). Se añade la
  // comprobación de que DECIDE: respondido «No», el veredicto rechaza y no pinta ayuda.
  test('H11 — el veredicto debería contemplar la exclusión por parentesco con el arrendador (art. 133.2.b)', async ({ page }) => {
    await abrirHidratado(page);
    await sembrarValor(page, '#alquiler', '600'); // 600 ≤ 1.000: la renta no es el problema
    await marcarTodoSi(page);
    const checklist = norm(await page.locator('[class*="checkGrid"]').innerText());
    const veredicto = norm(await veredictoDe(page).innerText());
    expect(`${checklist} ${veredicto}`).toMatch(/parentesco|familiar|133\.2\.b/i);

    // El CASO de la ficha: el arrendador es familiar de segundo grado → responde «No»
    const arrendador = tarjetaCon(page, /133\.2\.b/);
    await expect(arrendador.getByText('IMPRESCINDIBLE', { exact: true })).toHaveCount(1);
    expect(norm(await arrendador.innerText())).toContain('133.2.c'); // y el socio del arrendador
    await arrendador.getByRole('button', { name: 'No', exact: true }).click();
    const rechazo = norm(await veredictoDe(page).innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).not.toContain('300,00 €');
    expect(await panelDeAhorro(page)).toHaveLength(0);
  });

  // H12 (MEDIO) — REPARADO (28/09/2026) (hallazgo 2389): la FAQ del propietario negaba una
  // regla que el RD sí fija. Decía «El RD 326/2026 no fija a nivel estatal ninguna condición
  // sobre el propietario … comprueba si la tuya restringe el parentesco», cuando el art.
  // 133.2.b lo excluye para toda España. Lo escribió la reparación del hallazgo 537 (30/08),
  // que se juzgó contra el módulo —que no recogía el art. 133.2— y no contra el BOE: la FAQ
  // anterior, que el 537 tachó de «heredada del plan anterior», decía lo correcto.
  // CASO: abrir la guía → «¿El propietario del piso debe cumplir algún requisito?» →
  // esperado el parentesco hasta segundo grado del art. 133.2.b · obtenido «no fija a nivel
  // estatal ninguna condición sobre el propietario».
  // Añadido al reparar: la misma FAQ atribuía el contrato al art. 133.1.e (hallazgo 2390).
  test('H12 — la FAQ del propietario debería recoger el art. 133.2.b, no negarlo', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const faq = norm(
      await page.getByRole('heading', { name: /propietario del piso/ }).locator('xpath=..').innerText(),
    );
    expect(faq).not.toContain('no fija a nivel estatal ninguna condición sobre el propietario');
    expect(faq).toMatch(/133\.2\.b|segundo grado/);
    expect(faq).toContain('133.2.c');
    expect(faq).toContain('133.1.a');
    expect(faq).not.toContain('133.1.e'); // la letra e) es el tope de renta, no el contrato
  });

  // H13 (MEDIO) — REPARADO (28/09/2026) (hallazgo 2390): el requisito del contrato no era el
  // del artículo que citaba. En el BOE el art. 133.1.e es SOLO el tope de renta (el mismo que
  // BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual atribuye a esa letra); el contrato es el art.
  // 133.1.a, que pide un contrato «formalizado en los términos de la Ley 29/1994» y añade: «Si
  // se trata de alquiler de habitación no es exigible que la formalización sea en los términos
  // de la Ley 29/1994». Ninguna letra del art. 133 habla de fianza. La reparación del 1168
  // alineó la pregunta con lo que la explicación atribuía al 133.1.e, pero esa atribución era
  // la equivocada; y en habitación el requisito, bloqueante, exigía lo que el RD dispensa.
  // CASO: habitación 400 €/mes (≤ 600), todo «Sí» salvo «El contrato está por escrito y la
  // fianza depositada» a «No» (habitación sin fianza depositada) → esperado que no se rechace
  // por una exigencia que el art. 133.1.a dispensa para la habitación · obtenido «No cumples
  // los requisitos obligatorios», con la explicación citando el art. 133.1.e.
  // Reparación: la pregunta es la del art. 133.1.a (tener contrato de alquiler o de cesión, o
  // firmarlo tras la concesión) y la fianza pasa a ser lo que la comunidad PUEDE añadir (art.
  // 8.1). Añadido: quien alquila una habitación sin fianza depositada responde ahora «Sí», y el
  // veredicto le concede mín(200; 60 % de 400 = 240) = 200,00 €/mes.
  test('H13 — el requisito del contrato debería citar el art. 133.1.a y no exigir fianza a la habitación', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    await sembrarValor(page, '#alquiler', '400'); // 400 ≤ 600 = rentaMaximaMensual.habitacion
    await marcarTodoSi(page);
    const tarjeta = page.locator('[class*="checkCard"]').filter({ hasText: /contrato/i }).first();
    const pregunta = norm(await tarjeta.locator('[class*="checkPregunta"]').innerText());
    const explicacion = norm(await tarjeta.locator('[class*="checkExplicacion"]').innerText());

    // El caso de la ficha contesta «Sí» a una pregunta que ya no pide fianza, y cobra
    expect(pregunta).not.toMatch(/fianza/i);
    const apto = norm(await veredictoDe(page).innerText());
    expect(apto).toContain('¡Cumples todos los requisitos!');
    expect(apto).toContain('200,00 €/mes');

    await tarjeta.getByRole('button', { name: 'No', exact: true }).click();
    const veredicto = norm(await veredictoDe(page).innerText());

    // El art. 133.1.e es el tope de renta, no el contrato
    expect(explicacion).not.toMatch(/133\.1\.e/);
    expect(explicacion).toMatch(/133\.1\.a/);
    // En habitación no puede bloquear por una fianza que el RD no exige
    expect(/fianza/i.test(pregunta) && /No cumples los requisitos obligatorios/.test(veredicto)).toBe(false);
  });

  // H14 (MEDIO) — REPARADO (28/09/2026) (hallazgo 2391): el requisito del propietario
  // bloqueaba sin las excepciones del art. 133.2.a: «Se exceptuarán de este requisito quienes
  // siendo titulares de una vivienda acrediten su no disponibilidad por causa de separación o
  // divorcio, no puedan habitarla por cualquier otra causa ajena a su voluntad o cuando la
  // vivienda resulte inaccesible por razón de discapacidad con un grado reconocido igual o
  // superior al 33 %». La tarjeta decía a secas «No puedes ser titular de un derecho de
  // propiedad o usufructo sobre ninguna vivienda en España». Rechazaba de más, como el 1168.
  // CASO: joven copropietario de una vivienda que tras el divorcio no puede usar → responde
  // «No» a «No eres propietario de una vivienda en España» → esperado que la tarjeta recoja
  // la excepción (o no bloquee) · obtenido «No cumples los requisitos obligatorios».
  // Añadido al reparar: la excepción tiene que estar en la PREGUNTA, que es lo que se contesta,
  // y las tres causas del artículo en la explicación.
  test('H14 — el requisito de no ser propietario debería recoger las excepciones del art. 133.2.a', async ({ page }) => {
    await abrirHidratado(page);
    const tarjeta = page.locator('[class*="checkCard"]').filter({ hasText: /propietari/i }).first();
    expect(norm(await tarjeta.innerText())).toMatch(/separaci|divorcio|ajena a tu voluntad|inaccesible|133\.2\.a/i);

    const pregunta = norm(await tarjeta.locator('[class*="checkPregunta"]').innerText());
    expect(pregunta).toMatch(/salvo|excepci/i);
    const explicacion = norm(await tarjeta.locator('[class*="checkExplicacion"]').innerText());
    expect(explicacion).toContain('art. 133.2.a');
    expect(explicacion).toContain('separación o divorcio');
    expect(explicacion).toContain('ajena a su voluntad');
    // 33 = exclusiones.propiedad.discapacidadMinimaInaccesible (art. 133.2.a)
    expect(explicacion).toContain(
      `inaccesible por una discapacidad reconocida del ${BONO_ALQUILER_JOVEN_2026.exclusiones.propiedad.discapacidadMinimaInaccesible} % o más`,
    );
  });

  // H15 (MEDIO) — REPARADO (28/09/2026) (hallazgo 2392): la cifra principal de la app y dos
  // avisos no llegaban al contraste mínimo en el tema claro. «Ayuda mensual» (.ahorroValor,
  // 24 px/800, #10b981 sobre blanco) daba 2,54:1 y por ser texto grande exige 3:1; el distintivo
  // IMPRESCINDIBLE (11,2 px) 3,09:1, el «hasta 300 €/mes» de los botones de modalidad (teal de
  // marca como texto, 12,5 px) 2,55:1 y el mensaje de renta no válida (#E53E3E, 12,8 px) 4,13:1,
  // que en oscuro caía a 3,48:1 porque no tenía variante; los tres exigen 4,5:1.
  // CASO: vivienda 450 €/mes y luego «12abc» → esperado ≥ 3:1 la cifra y ≥ 4,5:1 el resto ·
  // obtenido 2,54 · 3,09 · 2,55 · 4,13 (claro) y 3,48 (oscuro).
  // Reparación: tokens de texto propios (--color-ok-texto, --color-fail-texto) con variante
  // oscura, y --secondary-texto / --primary-texto para la marca como texto. Añadido al reparar:
  // se mide TODO en los dos temas (el acta solo midió el error en oscuro), el distintivo también
  // sobre la tarjeta en rojo y el rótulo del botón activo, que daba 3,74:1 en claro y 2,95:1 en
  // oscuro. Sin transiciones a medias: el cambio de tema y el de estado de una tarjeta animan
  // fondos y colores 0,2-0,3 s, e incluso con movimiento reducido (0,01 ms) `getComputedStyle`
  // devuelve el valor de PARTIDA hasta el fotograma siguiente — la primera versión de este test
  // midió así 1,56:1 en oscuro, con el fondo aún claro. `asentar()` espera a que no quede
  // ninguna transición CSS en curso antes de medir.
  test('H15 — la ayuda mensual, el distintivo IMPRESCINDIBLE y los avisos deberían cumplir el contraste AA', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await abrirHidratado(page);
    const primerGrupo = page.locator('[class*="radioGroup"]').first();
    const asentar = async () => {
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      await page.waitForFunction(() =>
        document.getAnimations().filter((a) => a instanceof CSSTransition).every((a) => a.playState !== 'running'),
      );
    };

    for (const tema of ['light', 'dark'] as const) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), tema);
      await sembrarValor(page, '#alquiler', '450');
      await asentar();
      const ayuda = await contrasteDe(page, '[class*="ahorroValor"]');
      const distintivo = await contrasteDe(page, '[class*="badgeImprescindible"]');
      const modalidad = await contrasteDe(page, '[class*="tipoBtnActivo"] [class*="tipoBono"]');
      const modalidadInactiva = await contrasteDe(
        page,
        '[class*="tipoSelector"] button:not([class*="tipoBtnActivo"]) [class*="tipoBono"]',
      );
      const rotuloActivo = await contrasteDe(page, '[class*="tipoSelector"] [class*="tipoBtnActivo"]');
      // El distintivo sobre la tarjeta en rojo de un requisito respondido «No»
      await primerGrupo.getByRole('button', { name: 'No', exact: true }).click();
      await asentar();
      const distintivoFallo = await contrasteDe(page, '[class*="checkCardFail"] [class*="badgeImprescindible"]');
      await primerGrupo.getByRole('button', { name: 'No', exact: true }).click(); // vuelve a pendiente
      await sembrarValor(page, '#alquiler', '12abc');
      await asentar();
      const error = await contrasteDe(page, '#alquiler-error');

      expect(ayuda, `ayuda mensual (${tema})`).toBeGreaterThanOrEqual(3); // texto grande
      expect(distintivo, `IMPRESCINDIBLE (${tema})`).toBeGreaterThanOrEqual(4.5);
      expect(distintivoFallo, `IMPRESCINDIBLE en tarjeta roja (${tema})`).toBeGreaterThanOrEqual(4.5);
      expect(modalidad, `«hasta … €/mes» activo (${tema})`).toBeGreaterThanOrEqual(4.5);
      expect(modalidadInactiva, `«hasta … €/mes» inactivo (${tema})`).toBeGreaterThanOrEqual(4.5);
      expect(rotuloActivo, `rótulo del botón activo (${tema})`).toBeGreaterThanOrEqual(4.5);
      expect(error, `error de renta (${tema})`).toBeGreaterThanOrEqual(4.5);
    }
  });

  // H16 (BAJO) — REPARADO (28/09/2026) (hallazgo 2393): el porcentaje iba pegado a la cifra
  // («Límite: 60% de la renta», «el 37,5% de la renta», «del 60%») o con espacio normal
  // («33 % o más»), contra la regla de formato vigente desde el 25/09/2026: «15 %» con espacio
  // duro U+00A0, corregido app a app cuando pasa el Inspector.
  // CASO: vivienda 450 €/mes → esperado «Límite: 60 % de la renta» con U+00A0 · obtenido
  // «Límite: 60% de la renta»; y la tarjeta de ingresos «33 %» con U+0020.
  // Añadido al reparar: el 65 %, el escenario del bloque educativo y un barrido de todos los
  // textos de la app (checklist, panel, pasos y guía) buscando cifras con el % mal separado.
  test('H16 — los porcentajes deberían llevar espacio duro antes del %', async ({ page }) => {
    await abrirHidratado(page);
    await sembrarValor(page, '#alquiler', '450'); // 60 % de 450 = 270 < 300: sale la nota
    const nota = (await page.locator('[class*="ahorroNota"]').textContent()) ?? '';
    expect(nota).toContain('60 % de la renta');
    const ingresos = (await tarjetaCon(page, /IPREM/).textContent()) ?? '';
    expect(ingresos).toContain('33 %');
    expect(ingresos).toContain('65 %');

    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const trabajador = (await page.getByText(/Trabajador de 32 años/).locator('xpath=..').textContent()) ?? '';
    expect(trabajador).toContain('37,5 % de la renta');

    const zonas = ['[class*="checkGrid"]', '[class*="ahorroPanel"]', '[class*="pasosGrid"]', '[class*="guideSection"]', '[class*="warningBox"]'];
    const textos: string[] = [];
    for (const zona of zonas) textos.push(...(await page.locator(zona).allTextContents()));
    // Ni «60%» ni «60 %» con el espacio normal: solo el duro
    expect(textos.join('\n')).not.toMatch(/\d(%| %)/);
  });

  // H17 (BAJO) — REPARADO (28/09/2026) (hallazgo 2394): la edad máxima seguía tecleada en
  // tres textos de page.tsx pudiendo salir de BONO_ALQUILER_JOVEN_2026.edad.maxima, que la
  // pregunta de la MISMA tarjeta ya usaba: la explicación «personas de hasta 35 años», el
  // escenario «Pareja joven, ambos ≤35» y el título de FAQ «¿Qué pasa si cumplo 36 años…»
  // (cuyo cuerpo sí derivaba edad.maxima + 1). Latente: hoy coinciden con el art. 133.1.b.
  // CASO: grep en page.tsx → esperado 0 literales de la edad · obtenido 3.
  test('H17 — la edad máxima de la prosa debería salir del módulo, como la de la pregunta', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const fuente = readFileSync(join(process.cwd(), 'app', 'simulador-bono-joven-alquiler', 'page.tsx'), 'utf8');
    // 35 = BONO_ALQUILER_JOVEN_2026.edad.maxima (art. 133.1.b)
    expect(fuente).not.toContain('personas de hasta 35 años');
    expect(fuente).not.toContain('ambos ≤35');
    expect(fuente).not.toContain('cumplo 36 años');
  });

  // H18 (BAJO) — REPARADO (28/09/2026) (hallazgo 2395): la FAQ del cambio de piso presentaba
  // como «generalmente / según los casos» lo que el art. 133.3 fija: comunicarlo «en el plazo
  // máximo de quince días desde la firma del nuevo contrato», y se conserva la ayuda si el
  // nuevo cumple los requisitos y «se formalice sin interrupción temporal con el anterior»,
  // ajustando la cuantía, que será igual o inferior. Sin el plazo ni la condición de
  // continuidad, quien deja un hueco entre contratos o avisa tarde no sabe que se juega la
  // ayuda. CASO: guía → «¿Qué ocurre si cambio de piso…?» → esperado 15 días y art. 133.3 ·
  // obtenido «Generalmente debes comunicarlo a la CA. Según los casos…».
  // Añadido al reparar: la continuidad entre contratos, y que los días salen del módulo.
  test('H18 — la FAQ del cambio de piso debería dar el plazo de 15 días del art. 133.3', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const faq = norm(await page.getByRole('heading', { name: /cambio de piso/ }).locator('xpath=..').innerText());
    expect(faq).toMatch(/quince días|15 días/);
    expect(faq).toContain('133.3');
    // 15 = cambioDomicilio.diasParaComunicar (art. 133.3)
    expect(faq).toContain(`${BONO_ALQUILER_JOVEN_2026.cambioDomicilio.diasParaComunicar} días desde la firma`);
    expect(faq).toContain('sin interrupción temporal con el anterior');
    expect(faq).not.toMatch(/Generalmente|Según los casos/);
  });

  // H19 (BAJO) — REPARADO (28/09/2026) (hallazgo 2396): el paso 1 decía «Algunas están
  // activas todo el año, otras tienen plazos específicos», y el art. 138 dispone que las
  // comunidades autónomas «realizarán convocatorias abiertas de esta ayuda de forma
  // continuada y permanente». CASO: sección «Proceso de solicitud», paso 1 → esperado
  // coherente con el art. 138 · obtenido «otras tienen plazos específicos».
  // Añadido al reparar: que el paso cite el artículo.
  test('H19 — el proceso de solicitud no debería contradecir las convocatorias permanentes del art. 138', async ({ page }) => {
    await abrirHidratado(page);
    const pasos = norm(await page.locator('[class*="pasosGrid"]').innerText());
    expect(pasos).not.toContain('otras tienen plazos específicos');
    expect(pasos).toContain('art. 138');
    expect(pasos).toContain('continuada y permanente');
  });

  // H20 (BAJO) — REPARADO (28/09/2026) (hallazgo 2397): el escenario «Pareja joven» afirmaba
  // una regla que no está en el RD: «Solo uno de los titulares puede beneficiarse del bono.
  // Si ambos cumplen, el bono se asigna a uno». Los arts. 132-139 hacen beneficiaria a toda
  // persona física que reúna los requisitos y no limitan la ayuda a una por contrato (buscado
  // también en todo el texto del RD). Es la forma de los hallazgos 537 y 599: una regla
  // normativa sin artículo detrás. CASO: guía → escenario «Pareja joven» → esperado cita de
  // artículo o no afirmarla · obtenido la regla sin fuente.
  test('H20 — el escenario de la pareja no debería afirmar una regla que el RD no contiene', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const pareja = norm(await page.getByText(/Pareja joven/).locator('xpath=..').innerText());
    const afirmaUnoSolo = /Solo uno de los titulares puede beneficiarse/.test(pareja);
    expect(afirmaUnoSolo && !/art\. \d+/.test(pareja)).toBe(false);
    expect(pareja).not.toContain('se asigna a uno');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SOSPECHAS del acta del 28/09/2026 CONFIRMADAS contra el BOE y reparadas el mismo día, y
// la excepción del art. 136 que apareció al cotejarlo. No tenían ficha: cada una lleva aquí
// su caso resuelto a mano y el texto del artículo que lo decide.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Sospechas del 28/09/2026 confirmadas y reparadas', () => {
  // Art. 8.2.a — «Cuando las personas beneficiarias sean personas físicas deberán poseer la
  // nacionalidad española, o la de alguno de los Estados miembros de la Unión Europea o del
  // Espacio Económico Europeo, Suiza, o el parentesco determinado por la normativa que sea de
  // aplicación. En el caso de los extranjeros no comunitarios deberán tener residencia legal
  // en España». La checklist no lo preguntaba: la forma del 2388, aprobar de más.
  // CASO: vivienda 600 €/mes (≤ 1.000), todo «Sí» salvo la nacionalidad o residencia legal →
  // NO APTO, sin panel y sin los 300,00 €/mes que no va a cobrar.
  test('Art. 8.2.a — sin nacionalidad UE/EEE/Suiza ni residencia legal en España no se concede', async ({ page }) => {
    await abrirHidratado(page);
    await sembrarValor(page, '#alquiler', '600');
    await marcarTodoSi(page);
    const nacionalidad = tarjetaCon(page, /8\.2\.a/);
    expect(norm(await nacionalidad.innerText())).toMatch(/residencia legal/);
    await expect(nacionalidad.getByText('IMPRESCINDIBLE', { exact: true })).toHaveCount(1);
    await nacionalidad.getByRole('button', { name: 'No', exact: true }).click();

    const rechazo = norm(await veredictoDe(page).innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).not.toContain('300,00 €');
    expect(await panelDeAhorro(page)).toHaveLength(0);
  });

  // Art. 136, segundo párrafo — «No se considerarán afectados por esta incompatibilidad los
  // supuestos excepcionales en que las comunidades autónomas […], los municipios, otras
  // entidades públicas, organizaciones no gubernamentales o asociaciones aporten una ayuda para
  // esa misma finalidad a beneficiarias víctimas de violencia de género, […] familias
  // monoparentales o monomarentales, personas objeto de desahucio de su vivienda habitual […] y
  // otras personas especialmente vulnerables». La tarjeta del art. 136 decía «venga del Estado,
  // de tu Comunidad Autónoma o de tu ayuntamiento» sin la excepción: la forma del 2391, rechazar
  // de más a quien el RD deja fuera de la incompatibilidad.
  // CASO: madre sola que cobra una ayuda municipal al alquiler para familias monoparentales →
  // la pregunta tiene que dejarle responder «Sí» (la excepción está en la pregunta y en la
  // explicación), y con 600 €/mes y todo «Sí» → APTO, 300,00 €/mes.
  test('Art. 136 — la incompatibilidad recoge sus excepciones para colectivos vulnerables', async ({ page }) => {
    await abrirHidratado(page);
    const otras = tarjetaCon(page, /art\. 136/);
    const pregunta = norm(await otras.locator('[class*="checkPregunta"]').innerText());
    const explicacion = norm(await otras.locator('[class*="checkExplicacion"]').innerText());
    expect(pregunta).toMatch(/salvo|excepci/i);
    expect(explicacion).toContain('INCOMPATIBLE'); // la regla sigue siendo la regla (hallazgo 686)
    expect(explicacion).toContain('familias monoparentales o monomarentales');
    expect(explicacion).toContain('violencia de género');

    await sembrarValor(page, '#alquiler', '600');
    await marcarTodoSi(page);
    const apto = norm(await veredictoDe(page).innerText());
    expect(apto).toContain('¡Cumples todos los requisitos!');
    expect(apto).toContain('300,00 €/mes');
  });

  // Art. 133.1.b — «Tener menos de treinta y cinco años, incluida la edad de treinta y cinco
  // años, en el momento de solicitar la ayuda». La FAQ decía que el RD «no dice qué ocurre» si
  // se cumplen 36 durante el cobro; el artículo fija el momento en que se mide la edad, y lo
  // que de verdad deja abierto es la prórroga del art. 134.
  test('Art. 133.1.b — la FAQ de la edad dice cuándo se mide: al solicitar la ayuda', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const faq = norm(
      await page
        .getByRole('heading', { name: new RegExp(`cumplo ${BONO_ALQUILER_JOVEN_2026.edad.maxima + 1} años`) })
        .locator('xpath=..')
        .innerText(),
    );
    expect(faq).toContain('en el momento de solicitar la ayuda');
    expect(faq).toContain('art. 134');
    // La tarjeta de la edad lo dice también
    const edad = norm(await tarjetaCon(page, /años \(inclusive\)/).innerText());
    expect(edad).toContain('en el momento de solicitar la ayuda');
  });

  // Renta «0» tecleada — el tercer caso de la familia del 538 (negativo) y el 1170 (ilegible):
  // `parseSpanishNumber('0')` = 0, que el motor no distinguía del campo en blanco, así que no se
  // marcaba `aria-invalid` y el veredicto pedía «Introdúcela aquí arriba» a quien la ve escrita.
  // CASO: vivienda, todo «Sí», renta «0» y «0,00» → aria-invalid="true", aviso «mayor que 0 €»,
  // veredicto «Falta un dato…» con «corrígela aquí arriba» y sin «Introdúcela»; sin panel.
  test('Renta «0» tecleada — se señala como no válida, no se confunde con el campo vacío', async ({ page }) => {
    await abrirHidratado(page);
    await marcarTodoSi(page);
    const campo = page.locator('#alquiler');
    for (const cero of ['0', '0,00']) {
      await sembrarValor(page, '#alquiler', cero);
      await expect(campo).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#alquiler-error')).toContainText('mayor que 0');
      const veredicto = norm(await veredictoDe(page).innerText());
      expect(veredicto).toContain('Falta un dato para poder juzgarlo');
      expect(veredicto).toContain('corrígela aquí arriba');
      expect(veredicto).not.toContain('Introdúcela');
      expect(await panelDeAhorro(page)).toHaveLength(0);
    }
    // Y el campo vacío sigue siendo campo vacío: sin aviso de error
    await sembrarValor(page, '#alquiler', '');
    await expect(campo).toHaveAttribute('aria-invalid', 'false');
    await expect(page.locator('#alquiler-error')).toHaveCount(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 07/10/2026 (segmento fiscal, RIESGO 1 CRÍTICO) — la 11.ª
// ═════════════════════════════════════════════════════════════════════════════
//
// Contra el build de producción de HEAD (19865f19). Desde 12e36291 la app solo ha cambiado
// por lo que comparte: b6cd1b90 (comentario del módulo) y d5f22541 (el parser lee el signo
// menos tipográfico U+2212: «−100» marca aria-invalid y avisa de importe negativo).
//
// ── Reverificación de 2388-2397 (12e36291) con su CASO original ─────────────
//   · 2388 — vivienda 600 €, todo «Sí» → APTO; arrendador a «No» → «No cumples», sin panel.
//   · 2389 — la FAQ del propietario cita 133.2.b, 133.2.c y 133.1.a; ya no niega el parentesco.
//   · 2390 — habitación 400 € sin fianza depositada: la pregunta es la del art. 133.1.a y el
//     veredicto concede 200,00 €/mes.
//   · 2391 — «No eres propietario … (salvo las excepciones de abajo)», con las tres causas.
//   · 2392 — medido en los dos temas: ayuda 5,48/7,47 · IMPRESCINDIBLE 5,32/8,14 · modalidad
//     activa 4,69/5,44 e inactiva 5,15/6,43 · error 6,47/7,56 · aviso de renta 9,04/9,17.
//   · 2393 — «Límite: 60 % de la renta» con U+00A0. El único «0%» pegado de la página es la
//     tarjeta de RelatedApps de otra app («sin el 20% de entrada», data/app-relations.ts).
//   · 2394 — 0 literales de la edad en page.tsx. · 2395 — 15 días y continuidad (art. 133.3).
//   · 2396 — paso 1 con el art. 138. · 2397 — la pareja ya no afirma «un bono por contrato».
//   Las diez VERIFICADAS. Al lado: con 9 requisitos, «casi» (comunidad pendiente o «No»)
//   sigue saliendo y volver a pulsar un «Sí» deja la tarjeta pendiente y quita el veredicto.
//
// ── Cotejo con la FUENTE (texto consolidado del BOE, BOE-A-2026-8872, leído hoy) ──
//   Lo que la reparación del 28/09 dejó sin alcanzar, por la forma que ya conoce esta app:
//   · arts. 8.3 párr. 2.º y 8.5 — al corriente con Hacienda y la Seguridad Social; causas del
//     art. 13 de la Ley 38/2003; revocación en este plan o el anterior. Ni la checklist ni el
//     veredicto los miran (H21): la forma del 2388 y del 8.2.a, aprobar de más.
//   · art. 133.1.a — admite al TITULAR de un contrato en toda España; la FAQ dice «en la
//     mayoría de las CCAA» (H22).
//   · DA 1.ª — «podrán concederse con efectos desde el 1 de enero de 2026». Es lo único que el
//     RD dice sobre desde cuándo; la página afirma que «suele ser retroactiva desde la fecha de
//     solicitud» sin artículo y no menciona la DA (H23).
//   · art. 8.4 — las comunidades reconocen las ayudas «teniendo en cuenta las preferencias»
//     aplicables y las adicionales que fije cada una; la FAQ afirma que «resuelven por orden de
//     entrada hasta agotar los fondos» (H24).
//   · art. 133.1.e y 133.1.d en el FAQPage — la respuesta del tope de renta omite los 500/250 €
//     de los municipios de 10.000 habitantes o menos y la de ingresos omite el 5,5 × IPREM de
//     los hijos de víctimas de violencia de género (H25).
//   · Tres preguntas BLOQUEANTES enuncian la regla sin lo que el RD admite, cuando la reparación
//     del 2391 llevó la excepción a la pregunta en propietario y otras ayudas: ingresos (5,5/6 ×
//     IPREM y el descuento de dependencia y pensiones no contributivas, art. 133.1.d, H26),
//     residencia («constituya o VAYA A constituir», art. 133.1.c, H27) y arrendador (las
//     cooperativas del art. 133.2.c, H28).
//   Sospecha (e), DESCARTADA: «cofinanciada por las comunidades autónomas» lo sostiene el
//   art. 6.5 (de 2027 a 2030 el Plan se financia 60 % Ministerio / 40 % comunidades; en 2026 no
//   es condición) y el art. 4.2.c (los convenios recogen los recursos de cada comunidad).
//
// De dónde sale cada cifra esperada: `data/fiscal/vivienda-joven.ts` (re-sellado contra el BOE
// el 28/09/2026) e `IPREM_2026.anual14` = 8.400 € (`data/fiscal/iprem.ts`). Ninguna de memoria.
//
// CASOS NUEVOS (resueltos a mano ANTES de abrir el navegador)
// ───────────────────────────────────────────────────────────
//   CASO 20 (normal) — HABITACIÓN en municipio ordinario · «275,50» €/mes · los 9 a «Sí»
//       tope de renta  275,50 ≤ 600 (rentaMaximaMensual.habitacion, art. 133.1.e) → dentro
//       60 % de 275,50 = 165,30 < 200 (ayudaMaximaMensual.habitacion, art. 137)
//       ayuda          165,30 €   ← manda el porcentaje
//       pago real      275,50 − 165,30 = 110,20 €
//       4 años         165,30 × 48 (plazo.totalMaximoMeses) = 7.934,40 → «7934,40 €»
//       veredicto      APTO citando 165,30 €/mes · con la nota del límite del 60 %
//
//   CASO 21 (límite) — HABITACIÓN en municipio ≤ 10.000 hab. · «249,99» y «250,01» €/mes
//       249,99 ≤ 250 (rentaMaximaMensual.municipioPequeno.habitacion) → dentro
//       60 % de 249,99 = 149,994 → al céntimo 149,99 € < 200 → ayuda 149,99 €
//       pago real      249,99 − 149,99 = 100,00 € · 4 años 149,99 × 48 = 7.199,52 → «7199,52 €»
//       250,01 > 250 → NO APTO por un céntimo, sin panel (tope 250,00 € · introducido 250,01 €)
//       La checklist enseña los tres umbrales de ingresos: 5 × 8.400 = 42.000 €, 5,5 × 8.400 =
//       46.200 € y 6 × 8.400 = 50.400 € (UMBRAL_IPREM_VIVIENDA_JOVEN, art. 133.1.d).
//
//   CASO 22 (rechazo) — VIVIENDA en municipio ≤ 10.000 hab. · 800 €/mes · los 9 a «Sí»
//       800 > 500 (rentaMaximaMensual.municipioPequeno.vivienda) → NO APTO, sin panel
//       Control: el mismo 800 sin el municipio pequeño → 800 ≤ 1.000 → APTO · mín(300; 480)
//       = 300,00 € · pago 500,00 € · 14.400,00 €. Es el caso que el FAQPage da por bueno (H25).
// ═════════════════════════════════════════════════════════════════════════════

/** Las preguntas del FAQPage tal y como se sirven (lo que leen buscadores y asistentes de IA) */
async function faqPageServido(page: Page): Promise<{ name: string; text: string }[]> {
  const html = await (await page.request.get(RUTA)).text();
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const j = JSON.parse(m[1]) as {
      '@type'?: string;
      mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
    };
    if (j['@type'] === 'FAQPage' && j.mainEntity) {
      return j.mainEntity.map((q) => ({ name: q.name, text: norm(q.acceptedAnswer.text) }));
    }
  }
  return [];
}

/** El texto de una pregunta de la FAQ visible (la guía tiene que estar desplegada) */
async function faqVisible(page: Page, titulo: RegExp): Promise<string> {
  return norm(await page.getByRole('heading', { name: titulo }).locator('xpath=..').innerText());
}

test.describe('Inspector 07/10/2026 — casos nuevos', () => {
  test('CASO 20 (normal): habitación a «275,50» €/mes → el 60 % manda: 165,30 €, 110,20 € y 7934,40 €', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    // 275,50 ≤ 600 = rentaMaximaMensual.habitacion (art. 133.1.e)
    await sembrarValor(page, '#alquiler', '275,50');
    await marcarTodoSi(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);
    const panel = await panelDeAhorro(page);
    // 60 % (limiteSobreRenta) de 275,50 = 165,30 < 200 (ayudaMaximaMensual.habitacion)
    expect(panel[0]).toContain('165,30 €');
    // 275,50 − 165,30
    expect(panel[1]).toContain('110,20 €');
    // 165,30 × 48 (plazo.totalMaximoMeses, art. 134) — es-ES no agrupa cuatro cifras
    expect(panel[2]).toContain('7934,40 €');
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(1);

    const veredicto = norm(await veredictoDe(page).innerText());
    expect(veredicto).toContain('¡Cumples todos los requisitos!');
    expect(veredicto).toContain('165,30 €/mes');
    expect(veredicto).not.toContain('200,00 €');
  });

  test('CASO 21 (límite): habitación en municipio pequeño a «249,99» cobra 149,99 € (redondeo al céntimo); a «250,01» ya no', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    await page.getByRole('button', { name: /El municipio tiene 10\.000 habitantes o menos/ }).click();
    // 249,99 ≤ 250 = rentaMaximaMensual.municipioPequeno.habitacion (art. 133.1.e)
    await sembrarValor(page, '#alquiler', '249,99');
    await marcarTodoSi(page);

    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);
    let panel = await panelDeAhorro(page);
    // 60 % de 249,99 = 149,994 → 149,99 € al céntimo (hallazgo 688: se redondea la mensual)
    expect(panel[0]).toContain('149,99 €');
    // 249,99 − 149,99
    expect(panel[1]).toContain('100,00 €');
    // 149,99 × 48 = 7.199,52 — no 149,994 × 48 = 7.199,71
    expect(panel[2]).toContain('7199,52 €');
    await expect(page.getByText(NOTA_LIMITE)).toHaveCount(1);
    const apto = norm(await veredictoDe(page).innerText());
    expect(apto).toContain('¡Cumples todos los requisitos!');
    expect(apto).toContain('149,99 €/mes');

    // Los tres umbrales de ingresos del art. 133.1.d × IPREM_2026.anual14 (8.400 €)
    const ingresos = norm(await tarjetaCon(page, /IPREM/).innerText());
    expect(ingresos).toContain('42.000 €/año'); // 5 × 8.400
    expect(ingresos).toContain('46.200 €/año'); // 5,5 × 8.400
    expect(ingresos).toContain('50.400 €/año'); // 6 × 8.400

    // Un céntimo por encima del tope del municipio pequeño
    await sembrarValor(page, '#alquiler', '250,01');
    const aviso = norm(await page.locator('[class*="avisoRenta"]').innerText());
    expect(aviso).toContain('Para una habitación en un municipio de 10.000 habitantes o menos el tope es 250,00 €/mes');
    expect(aviso).toContain('250,01 €/mes');
    expect(norm(await veredictoDe(page).innerText())).toContain('No cumples los requisitos obligatorios');
    panel = await panelDeAhorro(page);
    expect(panel).toHaveLength(0);
  });

  test('CASO 22 (rechazo): 800 €/mes por una vivienda en municipio pequeño supera su tope de 500 €; sin el municipio pequeño, la misma renta sí da 300,00 €', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Vivienda completa/ }).click();
    const municipio = page.getByRole('button', { name: /El municipio tiene 10\.000 habitantes o menos/ });
    await municipio.click();
    await expect(municipio).toHaveAttribute('aria-pressed', 'true');
    // 800 > 500 = rentaMaximaMensual.municipioPequeno.vivienda (art. 133.1.e)
    await sembrarValor(page, '#alquiler', '800');
    await marcarTodoSi(page);

    const aviso = norm(await page.locator('[class*="avisoRenta"]').innerText());
    expect(aviso).toContain('Para una vivienda completa en un municipio de 10.000 habitantes o menos el tope es 500,00 €/mes');
    expect(aviso).toContain('800,00 €/mes');
    expect(aviso).toContain('art. 133.1.e');
    const rechazo = norm(await veredictoDe(page).innerText());
    expect(rechazo).toContain('No cumples los requisitos obligatorios');
    expect(rechazo).toContain('500,00 €/mes');
    expect(rechazo).not.toContain('300,00 €');
    expect(await panelDeAhorro(page)).toHaveLength(0);

    // Control: fuera del municipio pequeño, 800 ≤ 1.000 = rentaMaximaMensual.vivienda
    await municipio.click();
    await expect(page.locator('[class*="avisoRenta"]')).toHaveCount(0);
    const panel = await panelDeAhorro(page);
    expect(panel[0]).toContain('300,00 €'); // mín(300; 60 % de 800 = 480)
    expect(panel[1]).toContain('500,00 €'); // 800 − 300
    expect(panel[2]).toContain('14.400,00 €'); // 300 × 48
    expect(norm(await veredictoDe(page).innerText())).toContain('¡Cumples todos los requisitos!');
  });
});

test.describe('Inspector 07/10/2026 — móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 21 a 390 px: las tres cifras caben, el aviso del municipio pequeño se lee entero y la página no se desborda', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Habitación \(piso compartido\)/ }).click();
    await page.getByRole('button', { name: /El municipio tiene 10\.000 habitantes o menos/ }).click();
    await sembrarValor(page, '#alquiler', '249,99');
    await marcarTodoSi(page);
    const panel = await panelDeAhorro(page);
    expect(panel[0]).toContain('149,99 €');
    expect(panel[1]).toContain('100,00 €');
    expect(panel[2]).toContain('7199,52 €');
    for (const caja of await page.locator('[class*="ahorroCard"]').all()) {
      const b = await caja.boundingBox();
      expect(b).not.toBeNull();
      if (b) expect(b.x + b.width).toBeLessThanOrEqual(390);
    }

    await sembrarValor(page, '#alquiler', '250,01');
    const aviso = page.locator('[class*="avisoRenta"]');
    await expect(aviso).toBeVisible();
    const caja = await aviso.boundingBox();
    expect(caja && caja.x >= 0 && caja.x + caja.width <= 390).toBe(true);
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// HALLAZGOS de la re-inspección del 07/10/2026 — REPARADOS ese día. Cada test afirma lo que la app
// DEBERÍA hacer y lleva `test.fail()`; al repararlo, se le quita la marca y queda de guardián.
// Fuente: texto consolidado del RD 326/2026 en el BOE (BOE-A-2026-8872), el que cita
// FISCAL_VIVIENDA_JOVEN_META.urlOficial.
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Hallazgos del 07/10/2026 (REPARADOS ese mismo día)', () => {
  // H21 (ALTO) — ABIERTO. Los arts. 8.3 y 8.5 del RD no llegan al veredicto. El 8.3, párr. 2.º:
  // «En todo caso, las personas beneficiarias deberán estar al corriente en el cumplimiento de las
  // obligaciones tributarias y frente a la Seguridad Social conforme a lo dispuesto en los
  // artículos 13 y 14 de la Ley 38/2003». El 8.5: «No podrán obtener la condición de persona
  // beneficiaria […] quienes incurran en alguna de las circunstancias previstas el artículo 13 de
  // la Ley 38/2003 […]. Tampoco […] quienes hayan sido sujetos de una revocación […] de alguna de
  // las ayudas contempladas en éste o el anterior plan estatal de vivienda por incumplimiento o
  // causa imputable al solicitante». Es la forma del 2388 y del art. 8.2.a, reparados el 28/09:
  // una exclusión común a todas las ayudas del Plan que no pregunta nadie, y aprobar de más.
  // CASO: vivienda 600 €/mes y los 9 a «Sí», con una deuda con la Seguridad Social (o con
  // Hacienda) → esperado un requisito imprescindible o un aviso en el veredicto · obtenido
  // «¡Cumples todos los requisitos! … 300,00 €/mes», y 0 apariciones de «Seguridad Social»,
  // «obligaciones tributarias» o «Ley 38/2003» en toda la página, guía desplegada incluida.
  test('H21 — el veredicto debería contemplar estar al corriente con Hacienda y la Seguridad Social (art. 8.3) y las causas del art. 8.5', async ({ page }) => {
    await abrirHidratado(page);
    await sembrarValor(page, '#alquiler', '600'); // 600 ≤ 1.000: la renta no es el problema
    await marcarTodoSi(page);
    const checklist = norm(await page.locator('[class*="checkGrid"]').innerText());
    const veredicto = norm(await veredictoDe(page).innerText());
    // «art. 8.1» y «art. 8.2.a» ya salen en la checklist: el patrón no los cuenta
    expect(`${checklist} ${veredicto}`).toMatch(/Seguridad Social|obligaciones tributarias|Ley 38\/2003|art\. 8\.[35]/);
  });

  // H22 (BAJO) — ABIERTO. La FAQ «¿Se puede pedir el bono si ya tengo contrato firmado?» responde
  // «Sí, en la mayoría de las CCAA», cuando el art. 133.1.a pone en primer lugar, para toda
  // España, «Ser titular […] de un contrato de arrendamiento» (y además admite a quien esté «en
  // condiciones de suscribir» uno). La propia checklist lo pregunta así, citando el 133.1.a: la
  // FAQ contradice a la tarjeta que decide el veredicto.
  // CASO: guía → «¿Se puede pedir el bono si ya tengo contrato firmado?» → esperado «Sí» con el
  // art. 133.1.a, sin condicionarlo a la comunidad · obtenido «Sí, en la mayoría de las CCAA
  // puedes solicitar el Bono Joven aunque el contrato ya esté vigente».
  test('H22 — la FAQ del contrato ya firmado no debería condicionar a la comunidad lo que el art. 133.1.a admite siempre', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const faq = await faqVisible(page, /contrato firmado/);
    expect(faq).not.toContain('en la mayoría de las CCAA');
    expect(faq).toContain('133.1.a');
  });

  // H23 (BAJO) — ABIERTO. Desde cuándo se cobra. La FAQ afirma «La ayuda suele ser retroactiva
  // desde la fecha de solicitud» y la advertencia «La retroactividad no está garantizada en todas
  // las CCAA: algunas pagan desde la fecha de solicitud, no desde el inicio del contrato», las dos
  // sin artículo. Lo único que el RD dice de los efectos es la disposición adicional primera:
  // «Las ayudas de la línea de financiación para reducir la tasa de esfuerzo […] así como para
  // impulsar la emancipación de las personas jóvenes podrán concederse con efectos desde el 1 de
  // enero de 2026» (la línea del art. 3.3, que incluye esta ayuda), y la página no lo menciona.
  // Es la forma de los hallazgos 599 y 2397: una regla presentada como habitual sin norma detrás.
  // CASO: contrato vigente desde el 01/02/2026 y solicitud en octubre → la página le dice que lo
  // habitual es cobrar desde la solicitud (pierde febrero-septiembre) · esperado: que la DA 1.ª
  // permite conceder la ayuda con efectos desde el 01/01/2026 y que lo concreta su convocatoria ·
  // obtenido: «suele ser retroactiva desde la fecha de solicitud» y 0 apariciones de «1 de enero».
  test('H23 — lo que la página dice sobre la retroactividad debería salir de la DA 1.ª, no de un «suele»', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const faq = await faqVisible(page, /contrato firmado/);
    const pagina = norm(await page.locator('body').innerText());
    expect(faq).not.toMatch(/suele ser retroactiva desde la fecha de solicitud/);
    // Si la página habla de retroactividad, da el dato del RD
    const hablaDeRetroactividad = /retroactiv/i.test(pagina);
    const daLaDA1 = /1 de enero de 2026|disposición adicional primera/i.test(pagina);
    expect(!hablaDeRetroactividad || daLaDA1).toBe(true);
  });

  // H24 (BAJO) — ABIERTO. La FAQ «¿Cuánto tarda en resolverse la solicitud?» acaba con «las CCAA
  // resuelven por orden de entrada hasta agotar los fondos asignados», como regla de todas. El RD
  // no fija el orden de entrada; su art. 8.4 dice lo contrario de una regla única: «El órgano
  // competente […] reconocerá las ayudas […] teniendo en cuenta las preferencias que resulten de
  // aplicación […] así como las preferencias adicionales que […] pueda establecer cada comunidad
  // autónoma». Que los fondos son limitados sí lo sostiene el RD («dentro de las disponibilidades
  // presupuestarias existentes», art. 3); el «Muchas CCAA agotan los fondos» del consejo ⚡ es una
  // generalización sin fuente que la misma reparación puede reformular.
  // CASO: guía → «¿Cuánto tarda en resolverse la solicitud?» → esperado: sin un criterio de
  // resolución que el RD no fija (o con el art. 8.4) · obtenido «las CCAA resuelven por orden de
  // entrada hasta agotar los fondos asignados».
  test('H24 — la FAQ del plazo de resolución no debería afirmar un «orden de entrada» que el RD no fija (art. 8.4)', async ({ page }) => {
    await abrirHidratado(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const faq = await faqVisible(page, /tarda en resolverse/);
    expect(faq).not.toContain('resuelven por orden de entrada');
  });

  // H25 (MEDIO) — ABIERTO. El FAQPage recorta dos condiciones que la página y el motor sí aplican,
  // en el canal que leen ChatGPT, Perplexity y Bing Copilot sin el aviso de renta al lado:
  //   · «¿Hasta qué alquiler mensual puedo pedir el Bono Joven?» → «El art. 133.1.e […] fija la
  //     renta máxima del contrato en 1000 € al mes para una vivienda completa y 600 € al mes para
  //     una habitación. Si tu alquiler los supera, no puedes acceder». El mismo art. 133.1.e baja
  //     esas cifras a 500 y 250 € «si el arrendamiento se localiza en municipios o núcleos de
  //     población de 10.000 habitantes o menos» (municipioPequeno), y el motor lo aplica.
  //   · «¿Cuáles son los requisitos de ingresos…?» → el umbral «sube con discapacidad reconocida
  //     (5,5 veces con el 33 % o más…)», y el art. 133.1.d da también el 5,5 «de persona que sea
  //     hijo o hija de víctimas de violencia de género», que la tarjeta de la checklist sí recoge.
  // CASO: vivienda de 800 €/mes en un municipio de 10.000 habitantes o menos → el FAQPage la da
  // por debajo del tope (800 ≤ 1.000) · la app la rechaza: «el tope es 500,00 €/mes» (CASO 22).
  test('H25 — el FAQPage debería dar los topes del municipio pequeño y el umbral de los hijos de víctimas de violencia de género', async ({ page }) => {
    await abrirHidratado(page);
    const faq = await faqPageServido(page);
    const tope = faq.find((q) => /Hasta qué alquiler mensual/.test(q.name));
    const ingresos = faq.find((q) => /requisitos de ingresos/.test(q.name));
    expect(tope).toBeDefined();
    expect(ingresos).toBeDefined();
    const pequeno = BONO_ALQUILER_JOVEN_2026.rentaMaximaMensual.municipioPequeno;
    expect(tope?.text).toContain(`${pequeno.vivienda} €`); // 500 € (art. 133.1.e)
    expect(tope?.text).toContain(`${pequeno.habitacion} €`); // 250 € (art. 133.1.e)
    expect(ingresos?.text).toMatch(/violencia de género/);
  });

  // H26 (MEDIO) — ABIERTO. La pregunta de ingresos, BLOQUEANTE, enuncia solo el umbral general:
  // «Tus rentas anuales no superan 5 veces el IPREM (42.000 €/año)». El art. 133.1.d lo sube a
  // 5,5 × (46.200 €) con discapacidad del 33 % o siendo hijo o hija de víctima de violencia de
  // género y a 6 × (50.400 €) con el 65 %, y añade: «A efectos de este cómputo de ingresos se
  // descontarán las prestaciones económicas y ayudas de la Ley de Dependencia, así como las
  // pensiones de incapacidad o jubilación no contributivas», que la página no dice en ningún sitio.
  // La explicación da los umbrales altos pero no dice cómo responder, cuando la reparación del
  // 2391 (28/09) llevó la excepción a la PREGUNTA en propietario y otras ayudas («salvo las
  // excepciones de abajo» y «responde «Sí»»). Rechaza de más, como el 2391.
  // CASO: discapacidad del 33 % y rentas de 44.000 €/año (≤ 5,5 × 8.400 = 46.200 €) → la
  // pregunta pide responder sobre 42.000 € → «No» → «No cumples los requisitos obligatorios» ·
  // esperado: que la pregunta admita su umbral (y el descuento de dependencia y pensiones no
  // contributivas) · obtenido: la regla general sola.
  test('H26 — la pregunta de ingresos debería admitir los umbrales y el descuento del art. 133.1.d, no solo los 42.000 €', async ({ page }) => {
    await abrirHidratado(page);
    const tarjeta = tarjetaCon(page, /IPREM/);
    const pregunta = norm(await tarjeta.locator('[class*="checkPregunta"]').innerText());
    const explicacion = norm(await tarjeta.locator('[class*="checkExplicacion"]').innerText());
    expect(pregunta).toContain('42.000 €/año'); // la tarjeta esperada: 5 × IPREM_2026.anual14
    // La excepción llega a lo que se contesta, como en las tarjetas reparadas por el 2391
    expect(pregunta).toMatch(/salvo|excepci|5,5|discapacidad/i);
    // Y el descuento del último inciso del art. 133.1.d
    expect(`${pregunta} ${explicacion}`).toMatch(/dependencia/i);
  });

  // H27 (MEDIO) — ABIERTO. La pregunta de residencia, BLOQUEANTE, va en presente: «La vivienda es
  // tu residencia habitual y permanente». El art. 133.1.c pide que la vivienda «constituya o vaya
  // a constituir la residencia habitual y permanente», y su 2.º da a quien todavía va a alquilar
  // dos meses desde la concesión para aportar el empadronamiento. La reparación del 2390 (28/09)
  // abrió ese camino en la tarjeta de al lado («o lo firmarás si te conceden la ayuda», art.
  // 133.1.a), pero esta lo vuelve a cerrar: quien aún no ha firmado no vive allí.
  // CASO: joven que busca piso y aún no ha firmado → «Sí» al contrato («lo firmarás…»), y a «La
  // vivienda es tu residencia habitual y permanente» la respuesta honesta es «No» → «No cumples
  // los requisitos obligatorios» · esperado: que la pregunta admita la vivienda que lo será.
  test('H27 — la pregunta de residencia debería admitir la vivienda que lo VA A SER (art. 133.1.c), como el contrato que se firmará', async ({ page }) => {
    await abrirHidratado(page);
    const contrato = norm(await tarjetaCon(page, /133\.1\.a/).locator('[class*="checkPregunta"]').innerText());
    expect(contrato).toContain('lo firmarás'); // el camino que abrió el 2390
    const residencia = norm(await tarjetaCon(page, /residencia habitual/).locator('[class*="checkPregunta"]').innerText());
    expect(residencia).toMatch(/será|vaya a|vayas a|vas a vivir|irás a vivir/i);
  });

  // H28 (BAJO) — ABIERTO. La pregunta del arrendador, BLOQUEANTE, excluye a secas a quien sea
  // socio de quien le alquila; el art. 133.2.c exceptúa «que se trate de sociedades cooperativas,
  // incluidas en régimen de cesión en uso, ya sean de vivienda, de consumo o integrales de
  // vivienda y consumo y sin ánimo de lucro». La excepción solo está en la explicación, sin decir
  // cómo responder (a diferencia de propietario y otras ayudas tras el 2391), y además la estrecha
  // a la «cesión de uso» cuando el RD dice «incluidas».
  // CASO: socio de una cooperativa de vivienda sin ánimo de lucro que le cede el piso en uso →
  // «Quien te alquila no es […] una persona o empresa de la que seas socio» → «No» honesto → «No
  // cumples los requisitos obligatorios» · esperado: que la excepción llegue a la pregunta o que
  // la explicación diga que responda «Sí».
  test('H28 — la excepción de las cooperativas del art. 133.2.c debería llegar a la pregunta del arrendador', async ({ page }) => {
    await abrirHidratado(page);
    const tarjeta = tarjetaCon(page, /133\.2\.b/);
    const pregunta = norm(await tarjeta.locator('[class*="checkPregunta"]').innerText());
    const explicacion = norm(await tarjeta.locator('[class*="checkExplicacion"]').innerText());
    expect(explicacion).toContain('cooperativa'); // la excepción existe, pero solo aquí
    const llegaALaPregunta = /salvo|excepci|cooperativa/i.test(pregunta);
    const diceComoResponder = /responde «Sí»/.test(explicacion);
    expect(llegaALaPregunta || diceComoResponder).toBe(true);
  });
});
