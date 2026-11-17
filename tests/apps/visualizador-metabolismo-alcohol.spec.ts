import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';
import { comprobarFaqPageUnico } from './_faqpage-unico';

/**
 * visualizador-metabolismo-alcohol — PRIMERA INSPECCIÓN (Inspector, 17/11/2026)
 *
 * La app no calcula alcoholemia ni tiempos de eliminación y no tiene campos: son cuatro pestañas
 * (ruta metabólica, órganos, variante ALDH2, cerebro) y una guía educativa. No da límites legales
 * para conducir. Lo comprobable son sus cifras y lo que dicen su página y su FAQPage, y los
 * esperados se resolvieron a mano ANTES de abrirla.
 *
 *   CASO 1 (normal) — la guía: «En España, una UBE equivale a 10 gramos de alcohol puro».
 *     gramos = ml × (% vol / 100) × 0,8 (densidad del etanol redondeada; con 0,789 sale lo mismo
 *     a la décima de UBE):
 *       caña 200 ml al 5 %   → 200 × 0,05 × 0,8 =  8,0 g → 0,80 UBE
 *       vino 100 ml al 12 %  → 100 × 0,12 × 0,8 =  9,6 g → 0,96 UBE
 *       shot 25 ml al 40 %   →  25 × 0,40 × 0,8 =  8,0 g → 0,80 UBE
 *     Las tres caben en «aproximadamente 1 UBE» (entre 0,75 y 1,25).
 *     Copa de 150 ml de vino con 50 mg/L de acetaldehído: 0,150 × 50 = 7,5 mg; su etanol al 12 %:
 *     150 × 0,12 × 0,8 = 14,4 g (14,2 g con 0,789) → «unos 14 g». 14 g de etanol (46,07 g/mol)
 *     dan 14 × 44,05 / 46,07 = 13,4 g de acetaldehído: «del orden de varios miles de mg», bien.
 *   CASO 2 (límite: beber justo a la tasa de eliminación, 1 UBE por hora) — el etanol «is absorbed
 *     rapidly into the bloodstream from the stomach and small intestines» y «distributes into total
 *     body water (0.5-0.7 L/kg)» (HSDB en PubChem, CID 702, citando a Goodman & Gilman, 12.ª ed.,
 *     2011, p. 630). Una UBE en 70 kg: 10 / (70 × 0,7) = 0,20 g/L a 10 / (70 × 0,5) = 0,29 g/L.
 *     No es cero aunque no se supere la tasa: el FAQPage dice lo contrario (hallazgo).
 *   CASO 3 (se rechaza: frecuencias que no suman) — dentro de UNA población, normal + heterocigoto
 *     + homocigoto = 100 %. En Asia oriental la app da ~85 + ~50 + ~5-8 = 140-143 %. El resumen de
 *     NCBI Gene para ALDH2 (PubChem, gen 217): «Most Caucasians have two major isozymes, while
 *     approximately 50% of East Asians have the cytosolic isozyme but not the mitochondrial
 *     isozyme»: el ~50 % son TODOS los portadores, y los europeos no tienen la variante (hallazgo).
 *
 * Resultado: el caso 1 coincide; los casos 2 y 3 son hallazgos. Cada hallazgo va con `test.fail()`
 * y afirma lo CORRECTO: al repararse pasará, y habrá que quitarle el `test.fail()`.
 * Contraste: los colores de órgano y de genotipo llegan por `style={{ color }}` desde ORGANOS y
 * EFECTOS_ALDH2 de page.tsx, y check:semanticos-claro solo mira los .module.css.
 */

const RUTA = '/visualizador-metabolismo-alcohol/';

async function abrir(page: Page, tema: 'light' | 'dark' = 'light'): Promise<void> {
  if (tema === 'dark') {
    // La preferencia se guarda ANTES de cargar: sembrar data-theme tras el goto es una carrera.
    await page.addInitScript(() => window.localStorage.setItem('meskeia-theme', 'dark'));
  }
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
}

function pestanas(page: Page): Locator {
  return page.getByRole('navigation', { name: 'Secciones del visualizador' }).getByRole('button');
}

async function irA(page: Page, nombre: RegExp): Promise<void> {
  await pestanas(page).filter({ hasText: nombre }).click();
}

/** La sección de la pestaña activa, por su h2. */
function seccion(page: Page, titulo: string): Locator {
  return page.locator('section').filter({ has: page.getByRole('heading', { level: 2, name: titulo }) });
}

const H2_RUTA = 'Ruta metabólica del etanol';
const H2_ORGANOS = 'El acetaldehído, un tóxico multi-órgano';

function organo(page: Page, nombre: string): Locator {
  return page.getByRole('group', { name: 'Seleccionar órgano' }).getByRole('button', { name: nombre });
}

/** Las tres tarjetas de genotipo de la pestaña «Variante ALDH2», en orden. */
function tarjetasAldh2(page: Page): Locator {
  return page.locator('[class*="_aldh2Card"]');
}

interface NodoLd {
  '@type'?: string;
  featureList?: unknown[];
  features?: unknown[];
  url?: string;
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function jsonLd(page: Page): Promise<NodoLd[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap((s) => {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      return ((j['@graph'] as Record<string, unknown>[] | undefined) ?? [j]) as unknown as NodoLd[];
    }),
  );
}

test.describe('visualizador-metabolismo-alcohol', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('estructura: h1, aviso médico de nivel alto sin plegar y aviso del IARC', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Metabolismo del Alcohol');
    // Nivel 2 ALTO (salud/hábitos): severity="high" y collapsible={false} → sin botón de plegar.
    const aviso = page.getByRole('note').filter({ hasText: 'Este visualizador explica' });
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText(/carcinógeno del Grupo 1 \(evidencia\s+suficiente en humanos\)/);
    await expect(aviso).toContainText('TÚ ERES RESPONSABLE');
    await expect(aviso.getByRole('button', { name: /Ocultar aviso|Mostrar aviso/ })).toHaveCount(0);
    // La app no da límites de alcoholemia para conducir: si algún día los da, deben anclarse al
    // Reglamento General de Circulación (BOE, art. 20) y decir de qué país son.
  });

  test('CASO 1 (normal): las UBE de la guía y la copa de 150 ml cuadran con su aritmética', async ({ page }) => {
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const guia = page.locator('[data-guia-educativa]');
    const parrafo = guia.locator('p', { hasText: 'En España, una' });
    await expect(parrafo).toBeVisible();
    const texto = (await parrafo.innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('10 gramos de alcohol puro');
    const bebidas = [...texto.matchAll(/\((\d+) ml al (\d+)\s*%\)/g)].map((m) => ({ ml: Number(m[1]), grado: Number(m[2]) }));
    expect(bebidas).toEqual([
      { ml: 200, grado: 5 },
      { ml: 100, grado: 12 },
      { ml: 25, grado: 40 },
    ]);
    // 8,0 g · 9,6 g · 8,0 g → 0,80 · 0,96 · 0,80 UBE
    const ube = bebidas.map((b) => (b.ml * (b.grado / 100) * 0.8) / 10);
    expect(ube[0]).toBeCloseTo(0.8, 2);
    expect(ube[1]).toBeCloseTo(0.96, 2);
    expect(ube[2]).toBeCloseTo(0.8, 2);
    for (const u of ube) expect(u).toBeGreaterThanOrEqual(0.75);
    for (const u of ube) expect(u).toBeLessThanOrEqual(1.25);

    // Copa de 150 ml con 50 mg/L → 7,5 mg; ~14 g de etanol (150 × 0,12 × 0,8 = 14,4)
    const escala = guia.locator('p', { hasText: 'Una copa de 150 ml' });
    await expect(escala).toContainText('50 mg/L aporta unos 7,5 mg');
    await expect(escala).toContainText('aproximadamente 14 g de etanol');
    expect(0.15 * 50).toBeCloseTo(7.5, 6);
    expect(150 * 0.12 * 0.8).toBeCloseTo(14.4, 6);
    // 14 g de etanol → 13,4 g de acetaldehído (relación molar 1:1): «varios miles de miligramos»
    expect(14 * (44.05 / 46.07) * 1000).toBeGreaterThan(1000);
  });

  test('CASO 1 bis (operativa): las pestañas y el selector de órganos cambian el contenido', async ({ page }) => {
    const tabs = pestanas(page);
    await expect(tabs).toHaveCount(4);
    const pulsadas = () => tabs.evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-pressed')));
    expect(await pulsadas()).toEqual(['true', 'false', 'false', 'false']);
    await expect(page.getByRole('heading', { level: 2, name: 'Ruta metabólica del etanol' })).toBeVisible();

    await irA(page, /Órganos afectados/);
    expect(await pulsadas()).toEqual(['false', 'true', 'false', 'false']);
    await expect(page.getByRole('heading', { level: 2, name: 'El acetaldehído, un tóxico multi-órgano' })).toBeVisible();
    await organo(page, 'Estómago').click();
    await expect(organo(page, 'Estómago')).toHaveAttribute('aria-pressed', 'true');
    await expect(organo(page, 'Hígado')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('heading', { level: 3, name: 'Estómago' })).toBeVisible();
    await expect(page.getByText(/La mucosa gástrica tiene su propia ADH/)).toBeVisible();

    await irA(page, /Variante ALDH2/);
    await expect(tarjetasAldh2(page)).toHaveCount(3);
    await irA(page, /Cerebro y adicción/);
    expect(await pulsadas()).toEqual(['false', 'false', 'false', 'true']);
    await expect(page.getByRole('heading', { level: 3, name: 'Abstinencia: el peligro del rebote' })).toBeVisible();
  });

  test('REPARADO (hallazgo 4916) [contenido/alto] CASO 2 (límite): el FAQPage decía que el alcohol solo circula por la sangre si se supera 1 unidad por hora', async ({ page }) => {
    // REPARADO 17/11/2026 (hallazgo 4916): la respuesta dice que pasa a la sangre al absorberse y
    // llega al cerebro desde la primera copa, también bebiendo al ritmo de eliminación.
    // ENTRADA  FAQPage, «¿Cómo metaboliza el cuerpo el alcohol?»: beber justo 1 UBE (10 g) por hora
    // ESPERADO el etanol pasa a la sangre al absorberse y se reparte por el agua corporal (HSDB/
    //          Goodman & Gilman: 0,5-0,7 L/kg): 0,20-0,29 g/L en 70 kg, aunque no se supere la tasa.
    //          La propia página: «el alcohol en ayunas llega más rápido y con mayor concentración al
    //          cerebro» (Estómago) y «El etanol cruza la barrera hematoencefálica con facilidad» (Cerebro)
    // OBTENIDO «El hígado procesa aproximadamente una unidad de alcohol por hora; cuando se supera esa
    //          tasa, el alcohol excedente circula por la sangre y llega al cerebro y otros órganos.»
    expect(10 / (70 * 0.7)).toBeCloseTo(0.204, 3);
    expect(10 / (70 * 0.5)).toBeCloseTo(0.286, 3);
    const faq = (await jsonLd(page)).find((n) => n['@type'] === 'FAQPage');
    const r = faq?.mainEntity?.find((q) => q.name === '¿Cómo metaboliza el cuerpo el alcohol?')?.acceptedAnswer.text ?? '';
    expect(r.length).toBeGreaterThan(0);
    expect(r).not.toMatch(/cuando se supera esa tasa,? el alcohol excedente circula por la sangre/);
    expect(r).toContain('pasa a la sangre a medida que se absorbe');
    expect(r).toContain('no evita que el alcohol llegue al cerebro');
  });

  test('REPARADO (hallazgo 4917) [contenido/medio] CASO 3 (rechazo): las frecuencias de ALDH2 no sumaban 100 % y daban un 15 % de europeos portadores', async ({ page }) => {
    // REPARADO 17/11/2026. ENTRADA pestaña «Variante ALDH2», las tres tarjetas de genotipo.
    // ESPERADO en Asia oriental normal + portadores = 100 % (NCBI Gene: ~50 % sin la isoenzima
    //          mitocondrial activa, es decir, ~50 % de portadores en total); europeos: «Most Caucasians
    //          have two major isozymes». La fuente no reparte entre heterocigotos y homocigotos, así que
    //          la app tampoco: la tarjeta del heterocigoto da el ~50 % de los dos juntos y la del
    //          homocigoto dice que es la parte menor (con ~50 % de portadores, Hardy-Weinberg da un
    //          alelo de 1 − √0,5 ≈ 0,29 y un 9 % de homocigotos frente a un 41 % de heterocigotos).
    // OBTENIDO (antes) «~85%» normal, «~15% europeos / ~50% asiáticos orientales» y «~5-8% asiáticos
    //          orientales»: 85 + 50 + 5 = 140 % en Asia oriental.
    const q = 1 - Math.sqrt(0.5);
    expect(q * q).toBeLessThan(2 * q * (1 - q));
    await irA(page, /Variante ALDH2/);
    const t = await tarjetasAldh2(page).allInnerTexts();
    expect(t).toHaveLength(3);
    const normal = Number(t[0].match(/(\d+)\s*%\s*en Asia oriental/)?.[1]);
    const portadores = Number(t[1].match(/homocigoto, ~(\d+)\s*%\s*en Asia oriental/)?.[1]);
    expect(normal + portadores, `${normal} + ${portadores}`).toBe(100);
    expect(t[2]).toMatch(/parte menor de ese ~50\s*%/);
    expect(t.join(' ')).not.toMatch(/europeos/);
    expect(t[0]).toMatch(/mayoría de las personas de origen europeo/);
  });

  test('REPARADO (hallazgo 4919) [contenido/bajo]: «carcinógeno Tipo 1» en vez de «Grupo 1» del IARC', async ({ page }) => {
    // REPARADO 17/11/2026: «Grupo 1» en los dos sitios, atribuido al agente y no al cáncer.
    // ENTRADA  pestaña «Ruta metabólica» (aviso) y «Órganos afectados» → «Boca y esófago»
    // ESPERADO «Grupo 1», como dicen el aviso médico de la propia app y la OMS (04/01/2023: «a Group 1
    //          carcinogen by the International Agency for Research on Cancer»)
    // OBTENIDO «El acetaldehído es un carcinógeno Tipo 1 (IARC)» y «Riesgo de cáncer de cavidad oral
    //          (clasificado como carcinógeno Tipo 1 por IARC)», que además atribuye la clasificación al cáncer
    await expect(seccion(page, H2_RUTA)).toContainText('carcinógeno');
    await expect(seccion(page, H2_RUTA)).not.toContainText('Tipo 1', { timeout: 2000 });
    await irA(page, /Órganos afectados/);
    await organo(page, 'Boca y esófago').click();
    await expect(seccion(page, H2_ORGANOS)).toContainText('cáncer de cavidad oral');
    await expect(seccion(page, H2_ORGANOS)).not.toContainText('Tipo 1', { timeout: 2000 });
    await expect(seccion(page, H2_ORGANOS)).toContainText('Grupo 1 de carcinógenos');
    await irA(page, /Ruta metabólica/);
    await expect(seccion(page, H2_RUTA)).toContainText('carcinógeno del Grupo 1 (IARC)');
  });

  test('REPARADO (hallazgo 4920) [contenido/bajo]: el hígado llevaba el emoji del corazón y el estómago el de los pulmones', async ({ page }) => {
    // REPARADO 17/11/2026: 🧪 para el hígado, 🍽️ para el estómago y 🩺 en la pestaña.
    // ENTRADA  pestaña «Órganos afectados»
    // ESPERADO un icono que no sea otro órgano (o ninguno)
    // OBTENIDO «Hígado» y la pestaña «Órganos afectados» con 🫀 (U+1FAC0, ANATOMICAL HEART) y «Estómago»
    //          con 🫁 (U+1FAC1, LUNGS), en el botón y en el icono grande de la ficha
    await irA(page, /Órganos afectados/);
    const icono = (nombre: string) => organo(page, nombre).locator('span[aria-hidden="true"]').innerText();
    expect(await icono('Hígado')).not.toBe('\u{1FAC0}');
    expect(await icono('Estómago')).not.toBe('\u{1FAC1}');
    expect(await icono('Hígado')).toBe('🧪');
    const pestana = pestanas(page).filter({ hasText: /Órganos afectados/ });
    await expect(pestana).not.toContainText('\u{1FAC0}');
  });

  test('REPARADO (hallazgo 4921) [contenido/bajo]: el FAQPage traía cinco preguntas que la página no mostraba', async ({ page }) => {
    // REPARADO 17/11/2026: la guía pinta PREGUNTAS_FRECUENTES, de donde sale también el FAQPage.
    // ENTRADA  los dos bloques JSON-LD y el texto de la página (guía incluida)
    // ESPERADO cada pregunta del FAQPage pintada en una FAQ visible, las dos de PREGUNTAS_FRECUENTES
    //          (CLAUDE.md §1.ter, cabo C0593)
    // OBTENIDO 0 de 5 preguntas en la página: no hay FAQ visible
    await comprobarFaqPageUnico(page);
  });

  test('REPARADO (hallazgo 4922) [contenido/bajo]: el JSON-LD no era WebApplication ni declaraba características', async ({ page }) => {
    // REPARADO 17/11/2026: generateWebAppSchema con url y cinco características vistas en la app.
    // ENTRADA  el bloque JSON-LD que no es el FAQPage
    // ESPERADO WebApplication con url y 4-8 características reales (CLAUDE.md §1.ter)
    // OBTENIDO «@type»: «EducationalContent», sin url, sin featureList ni features
    const app = (await jsonLd(page)).find((n) => n['@type'] !== 'FAQPage');
    expect(app?.['@type']).toBe('WebApplication');
    expect(app?.url).toBe('https://meskeia.com/visualizador-metabolismo-alcohol/');
    const n = (app?.featureList ?? app?.features ?? []).length;
    expect(n).toBeGreaterThanOrEqual(4);
    expect(n).toBeLessThanOrEqual(8);
  });

  test('REPARADO (hallazgo 4923) [contenido/bajo]: el «%» iba pegado a la cifra y «10g» sin espacio', async ({ page }) => {
    // REPARADO 17/11/2026: espacio duro antes de «%» y de «g».
    // ENTRADA  pestañas «Órganos afectados» y «Variante ALDH2», y la guía
    // ESPERADO «90-95 %», «~85 %», «al 5 %» con espacio duro (CLAUDE.md global §2, desde el
    //          25/09/2026) y «10 g»
    // OBTENIDO «90-95%», «~85%», «~15% europeos / ~50% asiáticos orientales», «~5-8%», «25-30%»,
    //          «(200 ml al 5%)», «(100 ml al 12%)», «(25 ml al 40%)» y «10g de alcohol»
    await irA(page, /Variante ALDH2/);
    await expect(tarjetasAldh2(page).first()).not.toContainText(/\d%/, { timeout: 2000 });
    await irA(page, /Órganos afectados/);
    await expect(seccion(page, H2_ORGANOS)).toContainText('alcohol ingerido');
    await expect(seccion(page, H2_ORGANOS)).not.toContainText(/\d%|\d+g\b/, { timeout: 2000 });
    await expect(seccion(page, H2_ORGANOS)).toContainText('10 g de alcohol');
    const guia = (await page.locator('[data-guia-educativa]').textContent()) ?? '';
    expect(guia).toContain('(200 ml al 5 %)');
    expect(guia).not.toMatch(/\d%/);
  });

  test('REPARADO (hallazgo 4924) [contenido/bajo]: las cifras de las pestañas no citaban fuente', async ({ page }) => {
    // REPARADO 17/11/2026. ESPERADO cada cifra con su fuente y año (CLAUDE.md §1.quinquies, regla 1),
    // o retirada. Con fuente leída en la sesión: el 90-98 % que se oxida a acetato (HSDB en PubChem,
    // CID 702, citando a Goodman & Gilman, 12.ª ed., 2011, p. 630) y el ~50 % de portadores de Asia
    // oriental (NCBI Gene, ALDH2). Sin fuente accesible, retiradas: «10-100 veces mayor que en sangre»,
    // «al 25-30% de su capacidad» y «hasta 6-10 veces mayor».
    await irA(page, /Variante ALDH2/);
    const aldh2 = seccion(page, 'La variante ALDH2: el «efecto flus»');
    await expect(aldh2).toContainText('Fuente de las frecuencias: resumen de NCBI Gene');
    await expect(aldh2).not.toContainText(/6-10 veces|25-30/, { timeout: 2000 });
    await irA(page, /Órganos afectados/);
    await expect(seccion(page, H2_ORGANOS)).toContainText('Goodman & Gilman, 12.ª ed., 2011');
    await expect(seccion(page, H2_ORGANOS)).not.toContainText(/90-95/, { timeout: 2000 });
    await organo(page, 'Boca y esófago').click();
    await expect(seccion(page, H2_ORGANOS)).toContainText('acetaldehído que se forma en la saliva');
    await expect(seccion(page, H2_ORGANOS)).not.toContainText('10-100 veces', { timeout: 2000 });
  });

  test('REPARADO (hallazgo 4925) [contenido/bajo]: erratas «Via MEOS», «(posibles adicción)» y la sigla inglesa «BBB»', async ({ page }) => {
    // REPARADO 17/11/2026: «Vía MEOS», «(posible papel en la adicción)» y «barrera hematoencefálica».
    // ENTRADA  paso 4 de la ruta; ficha «Cerebro» de «Órganos afectados»
    // ESPERADO «Vía MEOS»; «(posible adicción)» o similar; «barrera hematoencefálica» (BHE), sin sigla inglesa
    // OBTENIDO «Via MEOS (consumo elevado)»; «tetrahidroisoquinolinas (posibles adicción)»; «cruzar
    //          parcialmente la BBB»
    await expect(seccion(page, H2_RUTA)).toContainText('MEOS');
    await expect(seccion(page, H2_RUTA)).not.toContainText('Via MEOS', { timeout: 2000 });
    await irA(page, /Órganos afectados/);
    await organo(page, 'Cerebro').click();
    await expect(seccion(page, H2_ORGANOS)).toContainText('tetrahidroisoquinolinas');
    await expect(seccion(page, H2_ORGANOS)).not.toContainText(/posibles adicción|\bBBB\b/, { timeout: 2000 });
    await expect(seccion(page, H2_ORGANOS)).toContainText('cruzar parcialmente la barrera hematoencefálica');
  });
});

test.describe('Hallazgos de accesibilidad: colores de órgano y genotipo por style={{ color }}', () => {
  // Umbrales WCAG 1.4.3: 3:1 para texto grande (≥ 18,66 px en negrita: los h3 de órgano, 22,4 px
  // 700, y las cifras de genotipo, 25,6 px 900) y 4,5:1 para las etiquetas de riesgo (12,48 px 700).

  test('REPARADO (hallazgo 4918) [accesibilidad/medio]: en claro, «Boca y esófago», dos cifras de genotipo y las tres etiquetas de riesgo', async ({ page }) => {
    // REPARADO 17/11/2026: el texto toma el tono -texto de su color, que cambia con el tema.
    // OBTENIDO (antes, 17/11/2026) h3 «Boca y esófago» #E67E22 sobre blanco 2,85:1 · «~85%» #27AE60 2,87:1 ·
    //          «~15% europeos…» #E67E22 2,85:1 · «Riesgo basal» 2,54:1 · «Riesgo elevado de cáncer»
    //          2,52:1 · «Máximo riesgo si beben» 3,98:1
    await abrir(page);
    await irA(page, /Órganos afectados/);
    await organo(page, 'Boca y esófago').click();
    const boca = page.getByRole('heading', { level: 3, name: 'Boca y esófago' });
    expect(await contrasteSobreFondoReal(boca), 'h3 Boca y esófago').toBeGreaterThanOrEqual(3);
    await irA(page, /Variante ALDH2/);
    const cifras = page.locator('[class*="_aldh2Porcentaje"]');
    for (let i = 0; i < 3; i++) {
      expect(await contrasteSobreFondoReal(cifras.nth(i)), await cifras.nth(i).innerText()).toBeGreaterThanOrEqual(3);
    }
    for (const riesgo of ['Riesgo basal', 'Riesgo elevado de cáncer', 'Máximo riesgo si beben']) {
      expect(await contrasteSobreFondoReal(page.getByText(riesgo, { exact: true })), riesgo).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('REPARADO (hallazgo 4918) [accesibilidad/medio]: en oscuro, «Hígado», «Estómago», «~5-8%» y las tres etiquetas de riesgo', async ({ page }) => {
    // REPARADO 17/11/2026: el texto toma el tono -texto de su color, que cambia con el tema.
    // OBTENIDO (antes, 17/11/2026) sobre la tarjeta #2D2D2D: h3 «Hígado» #C0392B 2,53:1 · «Estómago» #8E44AD
    //          2,35:1 · «~5-8% asiáticos orientales» #DC2626 2,85:1 · «Riesgo basal» 4,00:1 ·
    //          «Riesgo elevado de cáncer» 4,03:1 · «Máximo riesgo si beben» 2,66:1
    await abrir(page, 'dark');
    await irA(page, /Órganos afectados/);
    for (const nombre of ['Hígado', 'Boca y esófago', 'Estómago', 'Cerebro']) {
      await organo(page, nombre).click();
      const h3 = page.getByRole('heading', { level: 3, name: nombre });
      expect(await contrasteSobreFondoReal(h3), `h3 ${nombre}`).toBeGreaterThanOrEqual(3);
    }
    await irA(page, /Variante ALDH2/);
    const cifras = page.locator('[class*="_aldh2Porcentaje"]');
    for (let i = 0; i < 3; i++) {
      expect(await contrasteSobreFondoReal(cifras.nth(i)), await cifras.nth(i).innerText()).toBeGreaterThanOrEqual(3);
    }
    for (const riesgo of ['Riesgo basal', 'Riesgo elevado de cáncer', 'Máximo riesgo si beben']) {
      expect(await contrasteSobreFondoReal(page.getByText(riesgo, { exact: true })), riesgo).toBeGreaterThanOrEqual(4.5);
    }
  });
});
