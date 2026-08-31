import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — estimador-costes-divorcio (segmento cálculo, RIESGO 1 CRÍTICO)
 * Primera inspección: 31/08/2026.
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Estimador de Costes de Divorcio en España 2026»
 *   sub.  «Cuánto cuesta divorciarse en España: precio del abogado, procurador y tarifa
 *          notarial según el tipo de procedimiento (mutuo acuerdo vs contencioso), hijos
 *          y bienes comunes»
 *
 *   El cálculo vive entero en `calcular()`, dentro de `app/estimador-costes-divorcio/page.tsx`
 *   (no hay motor aparte). Los honorarios son horquillas de mercado declaradas como
 *   orientativas (DisclaimerCard severity="critical"); lo único con respaldo normativo que
 *   usa la app es la exención de tasas judiciales para personas físicas desde 2015, que
 *   coincide con `TASAS_JUDICIALES.personasFisicasExentasDesde` en
 *   `data/fiscal/costas-judiciales.ts` — pero la app no la importa ni la cita (hallazgo 2).
 *
 * Nota de formato (ya documentada en `estimador-costas-judiciales.spec.ts`): `formatCurrency`
 * usa es-ES con `useGrouping:'auto'`, que NO agrupa los millares de un número de cuatro cifras
 * («1450,00 €», no «1.450,00 €») y SÍ los de cinco o más («12.800,00 €»). Verificado que ocurre
 * también dentro de Chromium (no es solo un artefacto de Node): es el comportamiento real que
 * ve cualquier visitante. No es un hallazgo nuevo — se asume y se codifica tal cual en las
 * cadenas esperadas de este fichero, igual que en el resto del catálogo.
 *
 * CASOS (resueltos a mano ANTES de ejecutar la app, sobre `calcular()` en page.tsx)
 * ──────────────────────────────────────────────────────────────────────────────
 *   CASO 1 (normal) — mutuo acuerdo judicial · sin hijos · sin bienes
 *       abogado 500–1.200 (rama sin_bienes, !tieneHijos) · procurador 250 (fijo)
 *       total = 750,00 € – 1.450,00 € · duración 2–4 meses
 *
 *   CASO 2 (límite, el más caro que ofrece la app) — contencioso · con hijos · bienes complejos
 *       abogado 4.000–12.000 (rama bienes_complejos, tieneHijos) · procurador 800
 *       (bienes_complejos usa el escalón caro del procurador)
 *       total = 4.800,00 € – 12.800,00 € (POR CÓNYUGE) · duración 6–18 meses
 *
 *   CASO 3 (aviso claro / guarda de estado inválido) — el divorcio notarial (Ley 15/2015)
 *       solo es posible SIN hijos menores. El formulario lo impone: al elegir «notarial»
 *       oculta la pregunta de hijos y resetea `tieneHijos` a false, en vez de dejar que el
 *       usuario arme una combinación que la ley no permite.
 *       Se parte de judicial + hijos=Sí + bienes simples (total 1.250–2.250 €), se cambia a
 *       notarial y se comprueba que (a) la pregunta desaparece, (b) el resultado anterior se
 *       limpia, (c) al volver a judicial el estado de hijos vuelve a «No» — no se queda
 *       pegado en «Sí» por detrás del formulario —, y (d) el cálculo notarial con bienes
 *       simples da 900,00 € – 1.700,00 € (abogado 700–1.500, notario 150, registro 50).
 *
 * HALLAZGOS que este fichero por sí solo NO puede impedir en el futuro (ver acta)
 * ────────────────────────────────────────────────────────────────────────────
 *   1 — La tarjeta «Comparativa rápida» y las FAQ (metadata.ts) dan un rango fijo de
 *       650–2.550 € para el notarial. El propio motor, recorriendo sus 3 complejidades,
 *       solo puede dar 700–2.800 €: el rango publicado no es alcanzable por la calculadora
 *       que tiene al lado. Las otras dos tarjetas (mutuo acuerdo 750–3.750 €, contencioso
 *       2.000–12.800 €) SÍ coinciden exactamente con los extremos reales — ver el test de
 *       consistencia más abajo.
 *   2 — No hay `<DataReference>` ni cita de fuente para "exentas de tasas desde 2015",
 *       pese a que el dato ya vive con fuente y fecha de verificación en
 *       `data/fiscal/costas-judiciales.ts`.
 */

const RUTA = '/estimador-costes-divorcio/';

/** `formatCurrency` separa la cifra del € con un espacio duro (U+00A0): se normaliza. */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

async function elegirTipo(page: Page, etiqueta: string): Promise<void> {
  await page.getByRole('button', { name: etiqueta }).click();
}

async function elegirHijos(page: Page, si: boolean): Promise<void> {
  await page.getByRole('button', { name: si ? 'Sí' : 'No', exact: true }).click();
}

async function elegirComplejidad(page: Page, etiqueta: string): Promise<void> {
  await page.getByRole('button', { name: etiqueta }).click();
}

async function estimar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Estimar costes' }).click();
}

async function hayResultado(page: Page): Promise<boolean> {
  return (await page.getByText('Completa los datos y pulsa').count()) === 0;
}

/** «Coste total estimado[ (por cónyuge)]» — la horquilla que preside la tarjeta de resultados. */
async function totalEstimado(page: Page): Promise<string> {
  const importe = page.locator('div', { hasText: /^\d.*€.*–.*€$/ }).last();
  return limpiar(await importe.innerText());
}

async function etiquetaTotal(page: Page): Promise<string> {
  const etiqueta = page.getByText(/^Coste total estimado/);
  return limpiar(await etiqueta.innerText());
}

/**
 * Importe de una fila del desglose («Abogado», «Procurador», «Notario», «Registro Civil»,
 * «Tasas judiciales»). No se ancla `nombre` al inicio: cada fila empieza con un emoji
 * decorativo (`aria-hidden`, pero SIGUE en el texto visible) antes del nombre de la partida.
 */
async function partida(page: Page, nombre: RegExp): Promise<string> {
  const fila = page.locator('[class*="desgloseItem"]', { hasText: nombre });
  return limpiar(await fila.locator('strong').innerText());
}

async function duracion(page: Page): Promise<string> {
  return limpiar(await page.getByText(/^Duración estimada/).innerText());
}

async function notas(page: Page): Promise<string[]> {
  const parrafos = page.locator('[class*="nota"]:not([class*="notasCard"])');
  const salida: string[] = [];
  for (let i = 0; i < (await parrafos.count()); i++) {
    // Quita el emoji ℹ️ decorativo del principio.
    salida.push(limpiar(await parrafos.nth(i).innerText()).replace(/^ℹ️\s*/, '').trim());
  }
  return salida;
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador de Costes de Divorcio en España 2026');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 (normal) · mutuo acuerdo judicial, sin hijos, sin bienes: 750,00 € – 1450,00 €', async ({ page }) => {
  // Riesgo 1: el disclaimer crítico va SIEMPRE desplegado (no colapsable).
  const disclaimer = page.locator('[role="alert"]').first();
  await expect(disclaimer).toContainText('orientativ');
  expect(await disclaimer.locator('button').count()).toBe(0);

  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await elegirHijos(page, false);
  await elegirComplejidad(page, 'Sin bienes comunes');
  await estimar(page);

  expect(await etiquetaTotal(page)).toBe('Coste total estimado');
  expect(await partida(page, /Abogado/)).toBe('500,00 € – 1200,00 €');
  expect(await partida(page, /Procurador/)).toBe('250,00 €');
  expect(await partida(page, /Tasas judiciales/)).toBe('Exento');
  expect(await totalEstimado(page)).toBe('750,00 € – 1450,00 €');
  expect(await duracion(page)).toBe('Duración estimada: 2–4 meses');
  expect(await notas(page)).toEqual([
    'Un solo abogado y procurador para ambos (coste compartido)',
    'Las personas físicas están exentas de tasas judiciales desde 2015',
  ]);

  // No se muestran filas de notario ni registro civil fuera del notarial.
  expect(await page.locator('[class*="desgloseItem"]', { hasText: /^Notario/ }).count()).toBe(0);
  expect(await page.locator('[class*="desgloseItem"]', { hasText: /^Registro Civil/ }).count()).toBe(0);

  // Regla de accesibilidad obligatoria: todo <button> de la app lleva type="button".
  const sinType = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .filter(b => b.getRootNode() === document && !b.getAttribute('type'))
      .map(b => (b.textContent || '').slice(0, 40)),
  );
  expect(sinType).toEqual([]);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 (límite) · contencioso, con hijos, bienes complejos: 4800,00 € – 12.800,00 € por cónyuge', async ({ page }) => {
  await elegirTipo(page, 'Contencioso');
  await elegirHijos(page, true);
  await elegirComplejidad(page, 'Bienes complejos');
  await estimar(page);

  // El propio motor avisa de que el importe es por cónyuge, no por pareja.
  expect(await etiquetaTotal(page)).toBe('Coste total estimado (por cónyuge)');
  expect(await partida(page, /Abogado/)).toBe('4000,00 € – 12.000,00 €');
  expect(await partida(page, /Procurador/)).toBe('800,00 €'); // escalón caro (bienes complejos)
  expect(await partida(page, /Tasas judiciales/)).toBe('Exento');
  expect(await totalEstimado(page)).toBe('4800,00 € – 12.800,00 €');
  expect(await duracion(page)).toBe('Duración estimada: 6–18 meses');
  expect(await notas(page)).toEqual([
    'Cada cónyuge necesita su propio abogado y procurador',
    'Los importes mostrados son por cónyuge — el coste total familiar sería el doble',
    'Posibles informes periciales psicosociales si hay disputa sobre custodia',
    'Las personas físicas están exentas de tasas judiciales desde 2015',
  ]);

  // Aviso adicional específico del contencioso (condena en costas).
  await expect(page.getByText('cada cónyuge paga sus propios gastos')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 (aviso claro) · el notarial oculta y resetea la pregunta de hijos, no la deja pegada en "Sí"', async ({ page }) => {
  // Punto de partida: judicial + hijos=Sí + bienes simples → 1.250–2.250 €.
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await elegirHijos(page, true);
  await elegirComplejidad(page, 'Bienes simples');
  await estimar(page);
  expect(await totalEstimado(page)).toBe('1250,00 € – 2250,00 €');
  expect(await notas(page)).toContain('Se necesita convenio regulador con medidas sobre custodia, alimentos y uso de vivienda');

  // El divorcio notarial (Ley 15/2015) solo es posible sin hijos menores: la app
  // debe impedir la combinación, no solo advertirla.
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await expect(page.getByText('¿Hay hijos menores o con discapacidad?')).toHaveCount(0);
  expect(await hayResultado(page)).toBe(false); // el resultado anterior (con hijos) se limpia

  // El estado de "hijos" no debe quedar pegado en Sí por detrás del formulario: al volver
  // a judicial, el switch debe mostrarse otra vez en "No", no conservar la elección previa.
  await elegirTipo(page, 'Mutuo acuerdo (judicial)');
  await expect(page.getByRole('button', { name: 'No', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Sí', exact: true })).toHaveAttribute('aria-pressed', 'false');

  // Y el cálculo notarial en sí, con bienes simples: abogado 700–1.500, notario 150, registro 50.
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  await elegirComplejidad(page, 'Bienes simples');
  await estimar(page);
  expect(await partida(page, /Abogado/)).toBe('700,00 € – 1500,00 €');
  expect(await partida(page, /Procurador/)).toBe('No necesario');
  expect(await partida(page, /Notario/)).toBe('150,00 €');
  expect(await partida(page, /Registro Civil/)).toBe('50,00 €');
  expect(await totalEstimado(page)).toBe('900,00 € – 1700,00 €');
  expect(await duracion(page)).toBe('Duración estimada: 1–2 meses');
});

// ─────────────────────────────────────────────────────────────────────────────
test('HALLAZGO 1 · la "Comparativa rápida" del notarial no es alcanzable por el propio motor', async ({ page }) => {
  // Recorremos las 3 complejidades patrimoniales del notarial y nos quedamos con el
  // mínimo y el máximo global que el propio `calcular()` puede llegar a producir.
  const complejidades = ['Sin bienes comunes', 'Bienes simples', 'Bienes complejos'];
  const totales: string[] = [];
  await elegirTipo(page, 'Mutuo acuerdo (notarial)');
  for (const c of complejidades) {
    await elegirComplejidad(page, c);
    await estimar(page);
    totales.push(await totalEstimado(page));
  }
  // sin_bienes → 700–1.200 · bienes_simples → 900–1.700 · bienes_complejos → 1300–2800
  expect(totales).toEqual(['700,00 € – 1200,00 €', '900,00 € – 1700,00 €', '1300,00 € – 2800,00 €']);
  // El mínimo real (700) y el máximo real (2.800) no coinciden con el "650 – 2.550 €"
  // que muestra la tarjeta estática de comparación (ver hallazgo 1 del acta).
  const comparativaNotarial = page.locator('[class*="comparativaItem"]', { hasText: 'Notarial' });
  await expect(comparativaNotarial).toContainText('650');
  await expect(comparativaNotarial).toContainText('2.550');
});
