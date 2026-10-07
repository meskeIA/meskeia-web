import { test, expect, Page, Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { esperarPaginaAsentada } from './_hidratacion';
import { TIPOS_IS_2025, TRAMOS_IS_MICROPYMES_2026 } from '../../data/fiscal/sociedades';
import { TRAMOS_IRPF_2025 } from '../../data/fiscal/irpf';

/**
 * Inspector — comparador-formas-juridicas (segmento cálculo, riesgo 1, con el listón de una app FISCAL)
 *
 * Primera inspección: 07/10/2026, sobre el build de HEAD 19865f19.
 *
 * QUÉ PROMETE
 *   <h1> «Comparador de Formas Jurídicas»: compara autónomo, SL/SLU, cooperativa de trabajo,
 *   asociación y comunidad de bienes por capital, socios, responsabilidad, fiscalidad, cotización,
 *   costes, plazos y contabilidad, y un «Test Rápido» de 5 preguntas que puntúa cada forma y
 *   saca un podio. No calcula ninguna cuota: sus «casos» son de operativa (el podio, el selector)
 *   y de dato (lo que afirma cada celda), con la verdad anclada en la norma.
 *
 * DÓNDE VIVE LA LÓGICA
 *   Todo en app/comparador-formas-juridicas/page.tsx: FORMAS_JURIDICAS (los datos), toggleForma
 *   (máximo 4, mínimo 1) y recomendacionTest (suma de puntos por respuesta; el orden de
 *   FORMAS_JURIDICAS deshace los empates porque Array.prototype.sort es estable). No importa NADA
 *   de data/fiscal.
 *
 * LAS FUENTES (leídas en sesión el 07/10/2026, no de memoria)
 *   · data/fiscal/sociedades.ts — TIPOS_IS_2025 (general 25, nuevaCreacion 15, cooperativas 20),
 *     TRAMOS_IS_MICROPYMES_2026 (19 % hasta 50.000 €, 21 % el resto), AUTONOMO_SOCIETARIO_2025.nota.
 *   · data/fiscal/irpf.ts — TRAMOS_IRPF_2025 (19/24/30/37/45/47, límites 12.450 / 20.200 / 35.200 /
 *     60.000 / 300.000), MINIMOS_IRPF_2025.personal 5.550 y calcularCuotaIntegraGeneral.
 *   · data/fiscal/autonomos.ts — TARIFA_PLANA_2025 (80 €, 12 meses).
 *   · Ley 27/2014 del IS, texto consolidado del BOE (BOE-A-2014-12328, actualizado a 02/09/2026):
 *       art. 29.1: «entidades de nueva creación … en el primer período impositivo en que la base
 *       imponible resulte positiva y en el siguiente, al tipo del 15 por ciento».
 *       DT 44.ª.2 (2026): microempresas 19 % / 21 %; «las entidades que cumplan las previsiones
 *       previstas en el artículo 101 … tributarán al 23 %» (art. 101: cifra de negocios < 10 M€).
 *       art. 29.3: «Tributarán al 10 por ciento las entidades … Ley 49/2002».
 *   · Ley 20/1990 de cooperativas (BOE-A-1990-30735, actualizada a 09/04/2026):
 *       art. 33.2.a: protegidas → resultados cooperativos «al tipo del 20 por 100».
 *       art. 34.2: especialmente protegidas, ADEMÁS «bonificación del 50 por 100 de la cuota íntegra».
 *       art. 7.a: las Cooperativas de Trabajo Asociado son especialmente protegidas.
 *   · Ley de Sociedades de Capital (BOE-A-2010-10544), art. 4.1, «Se modifica por el art. 2.1 de la
 *     Ley 18/2022», en vigor desde el 19/10/2022: capital de la SL «no podrá ser inferior a un euro»;
 *     mientras no alcance 3.000 €, reserva legal del 20 % del beneficio «hasta que dicha reserva junto
 *     con el capital social alcance» 3.000 €, sin plazo, y responsabilidad solidaria de los socios en
 *     la liquidación por la diferencia.
 *   · Ley 27/1999 de Cooperativas (BOE-A-1999-15681): art. 8, «al menos, por tres socios»;
 *     art. 45.2, «Los Estatutos fijarán el capital social mínimo»; art. 1.1, sociedad para
 *     «actividades económicas … con participación económica de las personas socias».
 *   · LO 1/2002 del Derecho de Asociación (BOE-A-2002-5852), art. 5.1: «acuerdo de tres o más personas».
 *   · LGSS (BOE-A-2015-11724), art. 305.2.b: al RETA el administrador «a título lucrativo … siempre
 *     que posean el control efectivo».
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (puntos de recomendacionTest)
 *   Normal  · Solo yo / riesgo bajo / < 20.000 € / sin inversores / beneficios
 *             → autónomo 3+2+3+1+1 = 10 · SL 2+0+0+0+1 = 3 · asociación 1 · CB 1 · cooperativa 0
 *             → 🥇 Autónomo, 🥈 SL; el 🥉 sale Asociación (empate a 1 con CB, gana por orden).
 *   Límite  · 3 o más / riesgo alto / > 60.000 € / busca inversión / beneficios
 *             → SL 2+4+4+3+1 = 14 · cooperativa 3+2 = 5 · asociación 2 · autónomo 1 · CB 0.
 *   Rechazo · 4 de 5 respuestas → recomendacionTest devuelve null: no hay podio.
 *   Imposible · 2 personas / riesgo medio / < 20.000 € / sin inversores / fin social
 *             → asociación 1+5 = 6 · SL 2+3 = 5 · autónomo 3+1 = 4 → 🥇 Asociación, que exige 3.
 *             · 2 personas / riesgo alto / < 20.000 € / sin inversores / cooperativo
 *             → cooperativa 2+5 = 7 · SL 2+4 = 6 · autónomo 4 → 🥇 Cooperativa, que exige 3.
 *   Escenario educativo «Diseñadora · 25.000 €/año»: calcularCuotaIntegraGeneral(25.000, 5.550)
 *             = escala(25.000) 5.665,50 − escala(5.550) 1.054,50 = 4.611,00 €; tramo marginal 30 %
 *             (20.200–35.200). La app dice «aproximadamente 5.500 € de IRPF (tramo 24 %)».
 *
 * HALLAZGOS (07/10/2026) — se abrieron con test.fail y se REPARARON ese mismo día: quedan como
 * regresión. Desde la reparación, el test DESCARTA las formas imposibles para el número de
 * personas (y la asociación para quien quiere beneficios), así que con «Solo yo» el podio tiene
 * dos puestos: Autónomo y SL. Los tipos se leen de data/fiscal (app/comparador-formas-juridicas/datos.ts).
 */

const NBSP = ' ';
const RUTA = '/comparador-formas-juridicas/';

const P_SOCIOS = '¿Cuántas personas vais a emprender?';
const P_RIESGO = '¿Qué nivel de riesgo patrimonial tiene tu actividad?';
const P_INGRESOS = '¿Qué facturación anual esperas?';
const P_INVERSION = '¿Necesitas atraer inversores externos?';
const P_OBJETIVO = '¿Cuál es el objetivo principal?';

type Respuesta = readonly [string, string];

const CASO_NORMAL: Respuesta[] = [
  [P_SOCIOS, 'Solo yo'],
  [P_RIESGO, 'Bajo (servicios, consultoría)'],
  [P_INGRESOS, `Menos de 20.000${NBSP}€`],
  [P_INVERSION, 'No, autofinanciación'],
  [P_OBJETIVO, 'Generar beneficios'],
];

const CASO_LIMITE: Respuesta[] = [
  [P_SOCIOS, '3 o más'],
  [P_RIESGO, 'Alto (empleados, stock, local)'],
  [P_INGRESOS, `Más de 60.000${NBSP}€`],
  [P_INVERSION, 'Sí, busco inversión'],
  [P_OBJETIVO, 'Generar beneficios'],
];

const DOS_PERSONAS_FIN_SOCIAL: Respuesta[] = [
  [P_SOCIOS, '2 personas'],
  [P_RIESGO, 'Medio (pequeño comercio)'],
  [P_INGRESOS, `Menos de 20.000${NBSP}€`],
  [P_INVERSION, 'No, autofinanciación'],
  [P_OBJETIVO, 'Fin social/sin ánimo de lucro'],
];

const DOS_PERSONAS_COOPERATIVO: Respuesta[] = [
  [P_SOCIOS, '2 personas'],
  [P_RIESGO, 'Alto (empleados, stock, local)'],
  [P_INGRESOS, `Menos de 20.000${NBSP}€`],
  [P_INVERSION, 'No, autofinanciación'],
  [P_OBJETIVO, 'Proyecto cooperativo igualitario'],
];

const AUTONOMO = 'Trabajador Autónomo';
const SL = 'Sociedad Limitada (SL / SLU)';
const COOPERATIVA = 'Cooperativa de Trabajo';
const ASOCIACION = 'Asociación sin Ánimo de Lucro';

const limpiar = (t: string | null): string => (t ?? '').replace(/\s+/g, ' ').trim();

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  // La app no tiene inputs: se espera a que React confirme la hidratación antes de pulsar nada.
  await esperarPaginaAsentada(page);
}

async function responderTest(page: Page, respuestas: readonly Respuesta[]): Promise<void> {
  for (const [pregunta, opcion] of respuestas) {
    const tarjeta = page
      .locator('[class*="preguntaCard"]')
      .filter({ has: page.getByRole('heading', { name: pregunta, exact: true }) });
    const boton = tarjeta.getByRole('button', { name: opcion, exact: true });
    await boton.click();
    // Con la 5.ª respuesta las preguntas desaparecen y sale el podio: vale cualquiera de las dos.
    await expect
      .poll(async () => {
        if ((await page.getByRole('heading', { name: 'Tu recomendación' }).count()) > 0) return 'podio';
        return (await boton.count()) > 0 ? await boton.getAttribute('aria-pressed') : 'sin botón';
      })
      .toMatch(/^(true|podio)$/);
  }
}

async function hacerTest(page: Page, respuestas: readonly Respuesta[]): Promise<string[]> {
  await page.getByRole('button', { name: 'Test Rápido', exact: true }).click();
  await responderTest(page, respuestas);
  await expect(page.getByRole('heading', { name: 'Tu recomendación' })).toBeVisible();
  return page.locator('[class*="rankingCard"] strong').allInnerTexts();
}

/** Celda de la tabla del comparador para un criterio y una forma (por el texto de su cabecera). */
async function celda(page: Page, criterio: string, forma: string): Promise<Locator> {
  const tabla = page.locator('table').first();
  const cabeceras = await tabla.locator('thead th').allInnerTexts();
  const i = cabeceras.findIndex((t) => t.includes(forma));
  if (i < 0) throw new Error(`No hay columna «${forma}» en la tabla: ${cabeceras.join(' | ')}`);
  return tabla.locator('tbody tr').filter({ hasText: criterio }).locator('td').nth(i);
}

async function seleccionarFormas(page: Page, nombres: string[]): Promise<void> {
  const selector = page.locator('[class*="selectorFormas"]');
  for (const n of nombres) {
    await selector.getByRole('button', { name: n, exact: true }).click();
    await expect(selector.getByRole('button', { name: n, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
}

async function verFicha(page: Page, forma: string): Promise<Locator> {
  await page.getByRole('button', { name: 'Ficha Detallada', exact: true }).click();
  await page.locator('[class*="selectorDetalle"]').getByRole('button', { name: forma, exact: true }).click();
  return page.locator('[class*="fichaDetalle"]');
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.getByRole('button', { name: 'Ocultar guía educativa' })).toBeVisible();
}

interface PreguntaFaq {
  name: string;
  acceptedAnswer: { text: string };
}

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  return bloques.map((b) => JSON.parse(b) as Record<string, unknown>);
}

async function faqPage(page: Page): Promise<PreguntaFaq[]> {
  const faq = (await jsonLd(page)).find((j) => j['@type'] === 'FAQPage');
  if (!faq) throw new Error('No hay FAQPage en el JSON-LD');
  return faq.mainEntity as PreguntaFaq[];
}

test.beforeEach(async ({ page }) => {
  await abrir(page);
});

// ═══════════════════════════════════════════════════════════════════════════
// CASOS QUE PASAN
// ═══════════════════════════════════════════════════════════════════════════

test('CASO 1 · normal — una persona, riesgo bajo, < 20.000 €, sin inversores, beneficios → 🥇 Autónomo, 🥈 SL', async ({ page }) => {
  // Puntos a mano: autónomo 10, SL 3 (cabecera del fichero).
  const podio = await hacerTest(page, CASO_NORMAL);
  expect(podio[0]).toBe(AUTONOMO);
  expect(podio[1]).toBe(SL);
});

test('CASO 2 · límite — 3 o más, riesgo alto, > 60.000 €, busca inversión, beneficios → 🥇 SL, 🥈 Cooperativa', async ({ page }) => {
  // Puntos a mano: SL 14 (la puntuación más alta que admite el test), cooperativa 5.
  const podio = await hacerTest(page, CASO_LIMITE);
  expect(podio[0]).toBe(SL);
  expect(podio[1]).toBe(COOPERATIVA);
});

test('CASO 3 · rechazo — con 4 de las 5 respuestas no hay recomendación; con la 5.ª, sí; «Repetir test» la borra', async ({ page }) => {
  await page.getByRole('button', { name: 'Test Rápido', exact: true }).click();
  await responderTest(page, CASO_NORMAL.slice(0, 4));
  // recomendacionTest devuelve null mientras falte una respuesta.
  await expect(page.getByRole('heading', { name: 'Tu recomendación' })).toHaveCount(0);
  await expect(page.locator('[class*="rankingCard"]')).toHaveCount(0);
  await responderTest(page, CASO_NORMAL.slice(4));
  // Con «Solo yo» solo caben Autónomo y SL: cooperativa y asociación exigen 3 personas y la CB 2
  await expect(page.locator('[class*="rankingCard"]')).toHaveCount(2);
  await expect(page.getByText(/Descartadas por tus respuestas/)).toBeVisible();
  await page.getByRole('button', { name: 'Repetir test', exact: true }).click();
  await expect(page.locator('[class*="rankingCard"]')).toHaveCount(0);
  await expect(page.locator('[class*="preguntaCard"]')).toHaveCount(5);
});

test('CASO 4 · selector — como mucho 4 formas y nunca menos de 1', async ({ page }) => {
  // El encabezado promete «(máx. 4)»; toggleForma ignora la 5.ª y no deja quitar la última.
  const selector = page.locator('[class*="selectorFormas"]');
  await expect(selector.getByRole('heading', { name: 'Selecciona las formas a comparar (máx. 4)' })).toBeVisible();
  await seleccionarFormas(page, ['Cooperativa', 'Asociación']);
  await selector.getByRole('button', { name: 'CB', exact: true }).click();
  await expect(selector.getByRole('button', { name: 'CB', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('table').first().locator('thead th')).toHaveCount(5); // «Criterio» + 4 formas
  for (const n of ['SL / SLU', 'Cooperativa', 'Asociación', 'Autónomo']) {
    await selector.getByRole('button', { name: n, exact: true }).click();
  }
  await expect(selector.getByRole('button', { name: 'Autónomo', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('table').first().locator('thead th')).toHaveCount(2);
});

test('CASO 5 · capital y socios mínimos de la tabla, anclados en la ley', async ({ page }) => {
  await seleccionarFormas(page, ['Cooperativa', 'Asociación']);
  // Art. 4.1 LSC (Ley 18/2022): la SL «no podrá ser inferior a un euro».
  await expect(await celda(page, 'Capital mínimo', 'SL / SLU')).toHaveText('1,00 €');
  await expect(await celda(page, 'Capital mínimo', 'Autónomo')).toHaveText('No requiere');
  await expect(await celda(page, 'Número de socios', 'SL / SLU')).toHaveText('1+');
  // Art. 8 Ley 27/1999: «al menos, por tres socios» · art. 5.1 LO 1/2002: «tres o más personas».
  await expect(await celda(page, 'Número de socios', 'Cooperativa')).toHaveText('3+');
  await expect(await celda(page, 'Número de socios', 'Asociación')).toHaveText('3+');
  await expect(await celda(page, 'Responsabilidad', 'Autónomo')).toContainText('Ilimitada');
  await expect(await celda(page, 'Responsabilidad', 'SL / SLU')).toContainText('Limitada');
});

test('CASO 6 · avisos de una app fiscal: DisclaimerCard crítico y no plegable, RegionBadge es-only', async ({ page }) => {
  const aviso = page.locator('[class*="disclaimerCard"]');
  await expect(aviso).toHaveCount(1);
  await expect(aviso).toHaveClass(/severity-critical/);
  await expect(aviso.locator('[aria-expanded]')).toHaveCount(0);
  await expect(page.getByText('Solo España', { exact: false }).first()).toBeVisible();
});

test('CASO 7 · testigo — los tipos que enseña la tabla coinciden HOY con data/fiscal', async ({ page }) => {
  // Pasa hoy porque los números coinciden; dejará de pasar el día que data/fiscal cambie la escala
  // (2027: 17 % / 20 %, art. 29.1 LIS) y la app siga con la suya tecleada (hallazgo de la tanda).
  await seleccionarFormas(page, ['Cooperativa']);
  const sl = limpiar(await (await celda(page, 'Fiscalidad', 'SL / SLU')).textContent());
  expect(sl).toMatch(new RegExp(`\\b${TIPOS_IS_2025.general}\\b`));
  expect(sl).toMatch(new RegExp(`\\b${TRAMOS_IS_MICROPYMES_2026[0].tipo}\\b`));
  expect(sl).toMatch(new RegExp(`\\b${TRAMOS_IS_MICROPYMES_2026[1].tipo}\\b`));
  const autonomo = limpiar(await (await celda(page, 'Fiscalidad', 'Autónomo')).textContent());
  expect(autonomo).toMatch(new RegExp(`\\b${TRAMOS_IRPF_2025[0].tipo}\\b`));
  expect(autonomo).toMatch(new RegExp(`\\b${TRAMOS_IRPF_2025[TRAMOS_IRPF_2025.length - 1].tipo}\\b`));
  const coop = limpiar(await (await celda(page, 'Fiscalidad', 'Cooperativa')).textContent());
  expect(coop).toMatch(new RegExp(`\\b${TIPOS_IS_2025.cooperativas}\\b`));
});

// ═══════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS (07/10/2026)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('hallazgos del 07/10/2026, reparados ese mismo día', () => {
  test('H1a · operativa alto — 2 personas con fin social: la 🥇 no puede ser una Asociación (mínimo 3)', async ({ page }) => {
    const podio = await hacerTest(page, DOS_PERSONAS_FIN_SOCIAL);
    expect(podio[0]).not.toBe(ASOCIACION);
  });

  test('H1b · operativa alto — 2 personas con proyecto cooperativo: la 🥇 no puede ser una Cooperativa (mínimo 3)', async ({ page }) => {
    const podio = await hacerTest(page, DOS_PERSONAS_COOPERATIVO);
    expect(podio[0]).not.toBe(COOPERATIVA);
  });

  test('H1c · operativa alto — «Solo yo» y «Generar beneficios»: el podio no puede incluir una Asociación', async ({ page }) => {
    const podio = await hacerTest(page, CASO_NORMAL);
    expect(podio).not.toContain(ASOCIACION);
  });

  test('H2 · dato medio — page.tsx teclea los tipos del IS, del IRPF y la tarifa plana en vez de importarlos de data/fiscal', () => {
    const fuente = readFileSync(join(process.cwd(), 'app', 'comparador-formas-juridicas', 'page.tsx'), 'utf8');
    expect(fuente).toMatch(/from ['"]@\/data\/fiscal(\/[a-z-]+)?['"]/);
  });

  test('H3 · dato medio — la SL no tiene un «tipo fijo del IS (25 %)»: nueva creación 15 %, micro 19/21 %, ERD 23 % en 2026', async ({ page }) => {
    const ficha = await verFicha(page, 'SL / SLU');
    await expect(ficha).not.toContainText('Tipo fijo del IS');
    // El tipo de nueva creación (art. 29.1 LIS) ya aparece, leído de data/fiscal
    await expect(ficha).toContainText(`${TIPOS_IS_2025.nuevaCreacion}${NBSP}%`);
  });

  test('H4 · dato medio — el 20 % es de las cooperativas protegidas; las especialmente protegidas tienen además el 50 % de bonificación', async ({ page }) => {
    await seleccionarFormas(page, ['Cooperativa']);
    const coop = limpiar(await (await celda(page, 'Fiscalidad', 'Cooperativa')).textContent());
    expect(coop).not.toMatch(/20\s*%\s*\(especialmente protegidas\)/);
  });

  test('H5 · dato medio — escenario «Diseñadora · 25.000 €/año»: cuota 4.611 € y tramo 30 %, no «5.500 € (tramo 24 %)»', async ({ page }) => {
    await abrirGuia(page);
    const escenario = limpiar(await page.locator('[class*="escenarioCard"]').filter({ hasText: 'Diseñadora independiente' }).textContent());
    expect(escenario).not.toMatch(/tramo 24\s*%/);
    // calcularCuotaIntegraGeneral(25.000, 5.550) = 4.611,00 € y tipo marginal del 30 %
    expect(escenario).toContain('4611,00 €');
    expect(escenario).toMatch(/marginal del 30\s%/);
  });

  test('H6 · dato medio — entre 40.000 y 60.000 € de beneficio el IRPF marginal es el 37 %, no el «45–47 %»', async ({ page }) => {
    await abrirGuia(page);
    const paso = limpiar(await page.locator('[class*="step"]').filter({ hasText: 'Estima tus beneficios anuales netos esperados' }).last().textContent());
    expect(paso).not.toMatch(/45\s*[–-]\s*47\s*%/);
  });

  test('H7 · contenido medio — un solo umbral autónomo/SL, no tres rangos distintos sin fuente', async ({ page }) => {
    await abrirGuia(page);
    const textos = (await page.locator('[class*="guideSection"]').allTextContents()).join(' ');
    const faq = (await faqPage(page)).map((q) => q.acceptedAnswer.text).join(' ');
    const rangos = new Set(
      [...`${textos} ${faq}`.matchAll(/(\d{2}\.000)\s*(?:[–-]|y)\s*(\d{2}\.000)\s*€/g)].map((m) => `${m[1]}-${m[2]}`),
    );
    expect([...rangos].length).toBeLessThanOrEqual(1);
  });

  test('H8 · contenido medio — el coste anual de mantener una SL es uno solo en toda la página', async ({ page }) => {
    await abrirGuia(page);
    // REPARADO: había cuatro horquillas incompatibles y ninguna fuente; ahora no se da ninguna cifra
    // (la tabla dice el nivel orientativo y la página remite a pedir presupuesto)
    const tabla = limpiar(await page.locator('[class*="comparativaTable"] tr').filter({ hasText: 'Coste anual de gestión' }).locator('td').nth(2).textContent());
    expect(tabla).toBe('Medio-alto');
    const guia = limpiar((await page.locator('[class*="guideSection"]').allTextContents()).join(' '));
    expect(guia).not.toMatch(/\d\.\d{3}\s*[–-]\s*\d\.\d{3}\s*€\/año/);
    expect(guia).not.toMatch(/~\s?\d\.\d{3}\s*€\/año/);
  });

  test('H9 · dato medio — FAQPage: el capital de 1 € lo trajo la Ley 18/2022 y la reserva del 20 % no dura «dos ejercicios»', async ({ page }) => {
    const capital = (await faqPage(page)).find((q) => q.name.includes('capital mínimo'));
    expect(capital).toBeDefined();
    expect(capital?.acceptedAnswer.text).toContain('18/2022');
    expect(capital?.acceptedAnswer.text).not.toContain('dos primeros ejercicios');
  });

  test('H10 · contenido medio — la pregunta de la cooperativa frente a la SL responde lo mismo en la FAQ visible y en el FAQPage', async ({ page }) => {
    await abrirGuia(page);
    const visible = limpiar(
      await page
        .locator('[class*="faqItem"]')
        .filter({ has: page.getByRole('heading', { name: '¿Qué ventajas fiscales tiene una cooperativa frente a una SL?' }) })
        .locator('p')
        .first()
        .textContent(),
    );
    const enFaqPage = (await faqPage(page)).find((q) => /ventajas.*cooperativa frente a una SL/.test(q.name));
    expect(enFaqPage).toBeDefined();
    expect(visible).toBe(limpiar(enFaqPage?.acceptedAnswer.text ?? ''));
  });

  test('H11 · contenido medio — datos normativos con caducidad sin <DataReference>', async ({ page }) => {
    await expect(page.getByRole('note', { name: 'Datos de referencia normativos' })).toHaveCount(1);
  });

  test('H12 · dato bajo — el administrador de una SL va al RETA solo con control efectivo y a título lucrativo', async ({ page }) => {
    const cotizacion = await celda(page, 'Cotización SS', 'SL / SLU');
    await expect(cotizacion).toContainText(/control/i);
  });

  test('H13 · dato bajo — la cooperativa no es «sin ánimo de lucro» ni la ley estatal le fija 3.000 € de capital', async ({ page }) => {
    const ficha = await verFicha(page, 'Cooperativa');
    await expect(ficha.locator('[class*="fichaHeader"] p')).not.toContainText('sin ánimo de lucro');
  });

  test('H14 · accesibilidad bajo — los botones «Ver ficha completa» de cada columna no dicen de qué forma son', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ver ficha completa', exact: true })).toHaveCount(0);
  });

  test('H15 · contenido bajo — el % y el € van separados de la cifra con espacio duro', async ({ page }) => {
    await expect(await celda(page, 'Fiscalidad', 'Autónomo')).toContainText(`19${NBSP}%`);
  });

  test('H16 · contenido bajo — «previene el 80 % de los litigios societarios», cifra sin fuente', async ({ page }) => {
    await abrirGuia(page);
    await expect(page.locator('[class*="stepGuide"]')).not.toContainText('80 % de los litigios');
  });

  test('H17 · contenido bajo — el JSON-LD WebApplication sale con featureList vacío', async ({ page }) => {
    const app = (await jsonLd(page)).find((j) => j['@type'] === 'WebApplication');
    expect(((app?.featureList as unknown[]) ?? []).length).toBeGreaterThanOrEqual(4);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MÓVIL (390 px)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('en móvil (390 px)', () => {
  // Se enumeran las opciones: un describe no admite `...devices[…]` (arrastra defaultBrowserType).
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO M1 · el test y la tabla se usan en 390 px sin desbordar la página', async ({ page }) => {
    await seleccionarFormas(page, ['Cooperativa', 'Asociación']);
    // La tabla de 4 columnas se desplaza dentro de su envoltorio; la página no.
    const anchoDoc = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(anchoDoc).toBeLessThanOrEqual(390);
    const podio = await hacerTest(page, CASO_NORMAL);
    expect(podio[0]).toBe(AUTONOMO);
    const primero = page.locator('[class*="rankingPrimero"]');
    await primero.scrollIntoViewIfNeeded();
    await expect(primero).toBeVisible();
    const caja = await primero.boundingBox();
    expect(caja).not.toBeNull();
    expect((caja?.x ?? 0) + (caja?.width ?? 0)).toBeLessThanOrEqual(390);
    await expect(primero.getByRole('button', { name: 'Ver ficha completa', exact: true })).toBeVisible(); // la flecha va con aria-hidden
  });
});
