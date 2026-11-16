import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * visualizador-quimica-organica — test de regresión del Inspector (PRIMERA inspección, 16/11/2026)
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * H1 «Química Orgánica» · sub «Grupos funcionales, reacciones, aromaticidad e isomería con
 * visualizaciones interactivas». No calcula nada: los datos van escritos en `page.tsx` (GRUPOS,
 * REACCIONES, COMPUESTOS_AROMATICOS, TIPOS_ISOMERIA), sin motor ni `data/`. Su verdad comprobable
 * son las FICHAS (fórmula frente a nombre, polaridad, punto de ebullición, regla de Hückel) y la
 * OPERATIVA (4 pestañas, 8 grupos, 4 reacciones, 3 tipos de isomería, Kekulé/resonancia).
 * No muestra masas molares ni nombres IUPAC a partir de una estructura: no hay nada que cotejar
 * con los pesos atómicos de la CIAAW.
 *
 * VALORES ESPERADOS (resueltos a mano ANTES de abrir la app)
 * ──────────────────────────────────────────────────────────
 * · Fórmulas moleculares, contadas a mano átomo a átomo desde el nombre:
 *     metano CH4 · etileno C2H4 · etanol C2H6O · formaldehído CH2O · acetona C3H6O ·
 *     ácido acético C2H4O2 · acetato de etilo C4H8O2 · anilina C6H7N · benceno C6H6 ·
 *     tolueno C7H8 · naftaleno C10H8 · fenol C6H6O · ciclobutadieno C4H4.
 * · Regla de Hückel (4n + 2 electrones π): benceno, tolueno, fenol y anilina 6 = 4·1 + 2 → n = 1;
 *   naftaleno 10 = 4·2 + 2 → n = 2 (el mayor de la tabla); ciclobutadieno 4 = 4·1 → antiaromático.
 * · PubChem (NLM/NIH; datos del HSDB y de las fichas ICSC), consultado el 16/11/2026:
 *     ácido acético (CID 176), ebullición «117.9 °C» (CRC) y «118 °C» (ICSC).
 *     cis-2-buteno (CID 5287573), ebullición «3.72 °C» (CRC) · trans-2-buteno (CID 62695), «0.88 °C»
 *       (CRC) → el cis hierve MÁS alto que el trans, no más bajo.
 *     acetato de etilo (CID 8857), «In water, 8.0X10+4 mg/L at 25 °C» y «Very soluble in water
 *       (64 g/L at 25 °C)» → un éster pequeño es polar y se disuelve en agua.
 *     anilina (CID 6115), usos: colorantes, aceleradores del caucho, fármacos, isocianatos para
 *       espumas de uretano; ni nylon ni poliamida.
 *     aspirina (CID 2244), fabricación: «reacting acetic anhydride with salicylic acid» (Ullmann)
 *       y «from salicylic acid and acetic anhydride» (Merck): anhídrido acético, no ácido acético.
 *     estearato de sodio (CID 2724691): «STEARIC ACID IS REACTED WITH AN EQUIMOLAR PORTION OF
 *       SODIUM HYDROXIDE» → un jabón es la sal de un ácido graso, no un éster.
 * · La propia app: el nylon «se forma por reacción de aminas con ácidos carboxílicos (amidación)»
 *   (Casos de uso) y «el nylon (poliamida)» (FAQ del JSON-LD); la tabla educativa dice «Éster …
 *   Polar (sin puente H)».
 *
 * Los casos «HALLAZGO (…, ABIERTO)» afirman lo CORRECTO y llevan test.fail() mientras el hallazgo
 * siga abierto: al repararlo, se quita la marca.
 */

const RUTA = '/visualizador-quimica-organica/';

const MOVIL = {
  viewport: { width: 360, height: 740 },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

type Atomos = Record<string, number>;

/** Cuenta los átomos de una fórmula condensada con subíndices Unicode («CH₃COOC₂H₅» → C4 H8 O2). */
function contarAtomos(formula: string): Atomos {
  const normal = formula.replace(/[₀-₉]/g, (d) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(d)));
  const cuenta: Atomos = {};
  for (const m of normal.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    cuenta[m[1]] = (cuenta[m[1]] ?? 0) + (m[2] ? Number(m[2]) : 1);
  }
  return cuenta;
}

/** Fórmula molecular de cada ejemplo, contada a mano desde su NOMBRE (no desde la app). */
const EJEMPLOS_GRUPO: Record<string, { nombre: string; atomos: Atomos }> = {
  Alcanos: { nombre: 'Metano', atomos: { C: 1, H: 4 } },
  Alquenos: { nombre: 'Etileno', atomos: { C: 2, H: 4 } },
  Alcoholes: { nombre: 'Etanol', atomos: { C: 2, H: 6, O: 1 } },
  Aldehídos: { nombre: 'Formaldehído', atomos: { C: 1, H: 2, O: 1 } },
  Cetonas: { nombre: 'Acetona', atomos: { C: 3, H: 6, O: 1 } },
  'Ácidos Carboxílicos': { nombre: 'Ácido acético', atomos: { C: 2, H: 4, O: 2 } },
  Ésteres: { nombre: 'Acetato de etilo', atomos: { C: 4, H: 8, O: 2 } },
  Aminas: { nombre: 'Anilina', atomos: { C: 6, H: 7, N: 1 } },
};

const AROMATICOS: Record<string, Atomos> = {
  Benceno: { C: 6, H: 6 },
  Tolueno: { C: 7, H: 8 },
  Naftaleno: { C: 10, H: 8 },
  Fenol: { C: 6, H: 6, O: 1 },
  Anilina: { C: 6, H: 7, N: 1 },
  Ciclobutadieno: { C: 4, H: 4 },
};

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

async function irAPestana(page: Page, nombre: RegExp): Promise<void> {
  const pestana = page.getByRole('tab', { name: nombre });
  await pestana.click();
  await expect(pestana).toHaveAttribute('aria-selected', 'true');
}

/** Selecciona un grupo funcional y devuelve su ficha de detalle. */
async function elegirGrupo(page: Page, grupo: string): Promise<Locator> {
  const boton = page.getByRole('button', { name: new RegExp(`${grupo}$`) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
  const titulo = page.getByRole('heading', { level: 2, name: grupo, exact: true });
  await expect(titulo).toBeVisible();
  return titulo.locator('xpath=..');
}

/** El valor que acompaña a una etiqueta de la ficha («Polaridad» → «Polar»). */
function valorDe(contenedor: Locator, etiqueta: string): Locator {
  return contenedor.getByText(etiqueta, { exact: true }).locator('xpath=following-sibling::span[1]');
}

async function elegirReaccion(page: Page, nombre: string): Promise<Locator> {
  await irAPestana(page, /Reacciones/);
  const boton = page.getByRole('button', { name: nombre, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
  return page.getByRole('heading', { level: 2, name: nombre, exact: true }).locator('xpath=..');
}

function tarjetaAromatica(page: Page, nombre: string): Locator {
  return page
    .getByRole('region', { name: 'Aromaticidad y regla de Hückel' })
    .getByText(nombre, { exact: true })
    .locator('xpath=..');
}

async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Ver guía educativa/ }).click();
  await expect(page.getByRole('button', { name: /Ocultar guía educativa/ })).toBeVisible();
}

/** Respuesta visible de la FAQ de la guía para una pregunta. */
function respuestaVisible(page: Page, pregunta: string | RegExp): Locator {
  return page.locator('strong').filter({ hasText: pregunta }).locator('xpath=following-sibling::p[1]');
}

/** Las preguntas del FAQPage del JSON-LD, como {pregunta: respuesta}. */
async function faqLd(page: Page): Promise<Record<string, string>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const b of bloques) {
    const j = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (j['@type'] === 'FAQPage' && j.mainEntity) {
      return Object.fromEntries(j.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]));
    }
  }
  throw new Error('No hay FAQPage en el JSON-LD');
}

// ════════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — elegir un grupo muestra su ficha, y la fórmula cuadra con el nombre
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 1 · ficha de un grupo funcional', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('arranca en Alcoholes y «Ácidos Carboxílicos» muestra R−COOH, ácido acético, polar y 118 °C', async ({ page }) => {
    // Estado inicial: Alcoholes, el único pulsado
    await expect(page.getByRole('tab', { name: /Grupos Funcionales/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('button', { name: /Alcoholes$/ })).toHaveAttribute('aria-pressed', 'true');
    // Se cambia a OTRO grupo, para que el caso pruebe que el clic llega a React
    const ficha = await elegirGrupo(page, 'Ácidos Carboxílicos');
    await expect(page.getByRole('button', { name: /Alcoholes$/ })).toHaveAttribute('aria-pressed', 'false');
    await expect(ficha).toContainText('R−COOH');
    await expect(valorDe(ficha, 'Grupo funcional')).toHaveText('−COOH');
    await expect(valorDe(ficha, 'Ejemplo')).toHaveText('Ácido acético (CH₃COOH)');
    await expect(valorDe(ficha, 'Polaridad')).toHaveText('Polar');
    // PubChem CID 176: 117,9 °C (CRC) · 118 °C (ICSC)
    await expect(valorDe(ficha, 'Punto de ebullición')).toContainText('118 °C');
  });

  test('la fórmula del ejemplo de cada grupo es la del compuesto que nombra', async ({ page }) => {
    const pulsados = page.getByRole('region', { name: 'Grupos funcionales', exact: true }).locator('button[aria-pressed="true"]');
    for (const [grupo, esperado] of Object.entries(EJEMPLOS_GRUPO)) {
      const ficha = await elegirGrupo(page, grupo);
      await expect(pulsados).toHaveCount(1);
      const ejemplo = (await valorDe(ficha, 'Ejemplo').textContent()) ?? '';
      const m = ejemplo.match(/^(.+?) \(([^)]+)\)$/);
      expect(m, `ejemplo de ${grupo}: «${ejemplo}»`).not.toBeNull();
      expect(m![1]).toBe(esperado.nombre);
      expect(contarAtomos(m![2]), `${esperado.nombre} = ${m![2]}`).toEqual(esperado.atomos);
    }
  });

  test('las cuatro pestañas cambian el contenido y solo una queda seleccionada', async ({ page }) => {
    const secciones: [RegExp, string][] = [
      [/Reacciones/, 'Reacciones orgánicas básicas'],
      [/Aromaticidad/, 'Aromaticidad y regla de Hückel'],
      [/Isomería/, 'Tipos de isomería'],
      [/Grupos Funcionales/, 'Grupos funcionales'],
    ];
    for (const [pestana, region] of secciones) {
      await irAPestana(page, pestana);
      await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);
      await expect(page.getByRole('region', { name: region, exact: true })).toBeVisible();
    }
  });

  test('la adición de HBr al etileno está ajustada: C₂H₄ + HBr → C₂H₅Br', async ({ page }) => {
    const caja = await elegirReaccion(page, 'Adición electrófila (alquenos)');
    const ecuacion = (await caja.getByRole('region', { name: 'Ecuación química' }).textContent()) ?? '';
    const [izquierda, derecha] = ecuacion.split('→');
    const suma = (lado: string): Atomos => {
      const total: Atomos = {};
      for (const especie of lado.split('+')) {
        for (const [el, n] of Object.entries(contarAtomos(especie))) total[el] = (total[el] ?? 0) + n;
      }
      return total;
    };
    expect(suma(izquierda)).toEqual({ C: 2, H: 5, Br: 1 });
    expect(suma(derecha)).toEqual({ C: 2, H: 5, Br: 1 });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — el sistema π más grande de la tabla y el grupo de polaridad menos obvia
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 2 · límites: naftaleno (n = 2) y ésteres', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('naftaleno, C₁₀H₈ con 10 electrones π: n = 2, aromático', async ({ page }) => {
    await irAPestana(page, /Aromaticidad/);
    const naftaleno = tarjetaAromatica(page, 'Naftaleno');
    await expect(naftaleno).toContainText('C₁₀H₈');
    await expect(naftaleno).toContainText('10e⁻π · n=2');
    await expect(naftaleno.getByRole('img', { name: 'cumple la regla de Hückel' })).toBeVisible();
  });

  test('cada tarjeta aromática cumple 4n + 2 con su n y su fórmula es la de su nombre', async ({ page }) => {
    await irAPestana(page, /Aromaticidad/);
    for (const [nombre, atomos] of Object.entries(AROMATICOS)) {
      const tarjeta = tarjetaAromatica(page, nombre);
      const texto = (await tarjeta.textContent()) ?? '';
      const formula = texto.slice(nombre.length).match(/^[A-Z][A-Za-z₀-₉]*/)?.[0] ?? '';
      expect(contarAtomos(formula), `${nombre}: «${formula}»`).toEqual(atomos);
      const huckel = texto.match(/(\d+)e⁻π · n=(\d+)/);
      if (huckel) expect(Number(huckel[1]), nombre).toBe(4 * Number(huckel[2]) + 2);
    }
  });

  test('alternar Kekulé y resonancia cambia el dibujo y el texto', async ({ page }) => {
    await irAPestana(page, /Aromaticidad/);
    await expect(page.getByRole('img', { name: 'Benceno: estructura de Kekulé' })).toBeVisible();
    const resonancia = page.getByRole('button', { name: 'Resonancia (Thiele)' });
    await resonancia.click();
    await expect(resonancia).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Estructura de Kekulé' })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('img', { name: 'Benceno: estructura de resonancia' })).toBeVisible();
    await expect(page.getByText(/1,40 Å/)).toBeVisible();
  });

  // HALLAZGO [alto] (16/11/2026, ABIERTO): la ficha de los ésteres dice «Apolar». El acetato de
  // etilo se disuelve en agua (PubChem CID 8857: 80 g/L a 25 °C) y la tabla de la propia guía
  // dice «Éster … Polar (sin puente H)».
  test('HALLAZGO (16/11/2026, ABIERTO) · la ficha de los ésteres dice que son polares', async ({ page }) => {
    test.fail();
    const ficha = await elegirGrupo(page, 'Ésteres');
    await expect(valorDe(ficha, 'Polaridad')).toHaveText('Polar');
  });

  // HALLAZGO [alto] (16/11/2026, ABIERTO, segundo sitio): «Los alcanos y ésteres no [se disuelven
  // en agua]» en «Mejores prácticas».
  test('HALLAZGO (16/11/2026, ABIERTO) · la guía no pone a los ésteres con los alcanos como insolubles en agua', async ({ page }) => {
    test.fail();
    await abrirGuia(page);
    await expect(page.getByText('Polar vs apolar: regla de miscibilidad').locator('xpath=..')).not.toContainText('alcanos y ésteres no');
  });

  test.describe('móvil de 360 px', () => {
    test.use({ ...MOVIL });

    test('sin desbordamiento horizontal en ninguna pestaña', async ({ page }) => {
      for (const pestana of [/Grupos Funcionales/, /Reacciones/, /Aromaticidad/, /Isomería/]) {
        await irAPestana(page, pestana);
        const anchos = await page.evaluate(() => ({
          sw: document.documentElement.scrollWidth,
          cw: document.documentElement.clientWidth,
        }));
        expect(anchos.sw, String(pestana)).toBeLessThanOrEqual(anchos.cw);
      }
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CASO 3 (debe avisar) — el antiaromático se marca como tal; lo que no debe afirmar
// ════════════════════════════════════════════════════════════════════════════
test.describe('Caso 3 · avisos y afirmaciones que no deben salir', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('ciclobutadieno, 4 electrones π = 4n: se marca como NO aromático (antiaromático)', async ({ page }) => {
    await irAPestana(page, /Aromaticidad/);
    const ciclo = tarjetaAromatica(page, 'Ciclobutadieno');
    await expect(ciclo).toContainText('4e⁻π');
    await expect(ciclo.getByRole('img', { name: 'no cumple la regla de Hückel' })).toBeVisible();
    await expect(ciclo.getByRole('img', { name: 'cumple la regla de Hückel', exact: true })).toHaveCount(0);
    await expect(ciclo).toContainText('Antiaromático');
  });

  // HALLAZGO [medio] (16/11/2026, ABIERTO): «2-buteno cis … más polar, menor punto de ebullición».
  // PubChem: cis-2-buteno 3,72 °C, trans-2-buteno 0,88 °C (CRC): el cis hierve MÁS alto.
  test('HALLAZGO (16/11/2026, ABIERTO) · el cis-2-buteno no tiene menor punto de ebullición que el trans', async ({ page }) => {
    test.fail();
    await irAPestana(page, /Isomería/);
    await page.getByRole('button', { name: 'Isomería Geométrica (cis/trans)', exact: true }).click();
    const cis = page.getByText(/^2-buteno cis/);
    await expect(cis).toBeVisible();
    await expect(cis).not.toContainText('menor punto de ebullición');
    await expect(page.getByText(/^2-buteno trans/)).not.toContainText('mayor punto de ebullición');
  });

  // HALLAZGO [medio] (16/11/2026, ABIERTO): la tabla de la guía da el nylon como aplicación de
  // los ésteres. Es una poliamida (la propia app: «amidación»; FAQ del JSON-LD: «poliamida»).
  test('HALLAZGO (16/11/2026, ABIERTO) · la tabla de la guía no da el nylon como aplicación de los ésteres', async ({ page }) => {
    test.fail();
    await abrirGuia(page);
    await expect(page.getByRole('row', { name: /^Éster/ })).not.toContainText('nylon');
  });

  // HALLAZGO [medio] (16/11/2026, ABIERTO, segundo sitio): la tarjeta de la anilina lista «nylon».
  // PubChem CID 6115 (usos): colorantes, caucho, fármacos, isocianatos; ni nylon ni poliamida.
  test('HALLAZGO (16/11/2026, ABIERTO) · la tarjeta aromática de la anilina no le atribuye el nylon', async ({ page }) => {
    test.fail();
    await irAPestana(page, /Aromaticidad/);
    await expect(tarjetaAromatica(page, 'Anilina')).not.toContainText('nylon');
  });

  // HALLAZGO [medio] (16/11/2026, ABIERTO): «Ejemplo real» de la esterificación de Fischer.
  // Un jabón es la sal de un ácido graso (PubChem CID 2724691: ácido esteárico + NaOH); la
  // saponificación es la hidrólisis de un éster, lo contrario de esterificar.
  test('HALLAZGO (16/11/2026, ABIERTO) · la esterificación no presenta los jabones como producto suyo', async ({ page }) => {
    test.fail();
    const caja = await elegirReaccion(page, 'Esterificación de Fischer');
    await expect(caja).not.toContainText('saponificación inversa');
  });

  // HALLAZGO [medio] (16/11/2026, ABIERTO, mismo campo): la aspirina se fabrica con anhídrido
  // acético (PubChem CID 2244: Ullmann y Merck), no con ácido acético por Fischer.
  test('HALLAZGO (16/11/2026, ABIERTO) · la aspirina no sale de ácido salicílico + ácido acético', async ({ page }) => {
    test.fail();
    const caja = await elegirReaccion(page, 'Esterificación de Fischer');
    await expect(caja).not.toContainText(/salicílico \+ ac\. acético/);
  });

  // HALLAZGO [medio] (16/11/2026, ABIERTO, tercer sitio): FAQ del JSON-LD, «el jabón (ésteres y
  // jabones)».
  test('HALLAZGO (16/11/2026, ABIERTO) · la FAQ del JSON-LD no explica el jabón como «ésteres y jabones»', async ({ page }) => {
    test.fail();
    const respuestas = await faqLd(page);
    const nivel = Object.entries(respuestas).find(([q]) => q.includes('nivel educativo'))?.[1] ?? '';
    expect(nivel).not.toContain('ésteres y jabones');
  });

  // HALLAZGO [bajo] (16/11/2026, ABIERTO): «Catalizador: NaOH» en la SN2, cuya propia ecuación
  // consume el OH⁻; y «Catalizador: Oxidante: K₂Cr₂O₇, KMnO₄» en la oxidación. Son reactivos.
  test('HALLAZGO (16/11/2026, ABIERTO) · un reactivo que se consume no figura como catalizador', async ({ page }) => {
    test.fail();
    const sn2 = await elegirReaccion(page, 'Sustitución nucleófila (SN2)');
    if (await sn2.getByText('Catalizador', { exact: true }).count()) {
      await expect(valorDe(sn2, 'Catalizador')).not.toContainText('NaOH');
    }
    const oxidacion = await elegirReaccion(page, 'Oxidación de alcoholes');
    if (await oxidacion.getByText('Catalizador', { exact: true }).count()) {
      await expect(valorDe(oxidacion, 'Catalizador')).not.toContainText(/K₂Cr₂O₇|KMnO₄/);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Textos de la guía y del JSON-LD
// ════════════════════════════════════════════════════════════════════════════
test.describe('Guía y FAQ', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('el JSON-LD declara al menos 4 características y 5 preguntas', async ({ page }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === 'WebApplication');
    const lista = (app?.featureList ?? app?.features) as string[] | string | undefined;
    const n = Array.isArray(lista) ? lista.length : String(lista ?? '').split(',').filter(Boolean).length;
    expect(n).toBeGreaterThanOrEqual(4);
    expect(Object.keys(await faqLd(page))).toHaveLength(5);
  });

  // HALLAZGO [bajo] (16/11/2026, ABIERTO): «halogens» (inglés) en la FAQ visible y «fructales»
  // en la FAQ del JSON-LD.
  test('HALLAZGO (16/11/2026, ABIERTO) · sin «halogens» en la FAQ visible ni «fructales» en la del JSON-LD', async ({ page }) => {
    test.fail();
    const respuestas = await faqLd(page);
    expect(Object.values(respuestas).join(' ')).not.toContain('fructales');
    await abrirGuia(page);
    await expect(respuestaVisible(page, '¿Por qué el carbono forma tantos compuestos?')).not.toContainText('halogens');
  });

  // HALLAZGO [bajo] (16/11/2026, ABIERTO): la pregunta del benceno está en las dos FAQ con dos
  // respuestas escritas aparte. Si está en las dos, la respuesta debe ser la misma (una constante).
  test('HALLAZGO (16/11/2026, ABIERTO) · la pregunta del benceno no tiene dos respuestas distintas', async ({ page }) => {
    test.fail();
    const respuestas = await faqLd(page);
    const enLd = Object.entries(respuestas).find(([q]) => /benceno/i.test(q));
    await abrirGuia(page);
    const visible = respuestaVisible(page, /^¿[^?]*benceno[^?]*\?$/);
    if (enLd && (await visible.count())) {
      expect(((await visible.textContent()) ?? '').trim()).toBe(enLd[1].trim());
    }
  });

  // HALLAZGO [bajo] (16/11/2026, ABIERTO): «el grupo funcional determina el 90% de la
  // reactividad»: cifra sin fuente y con el «%» pegado (CLAUDE.md global §2, espacio duro).
  test('HALLAZGO (16/11/2026, ABIERTO) · el consejo del grupo funcional no lleva el «%» pegado a la cifra', async ({ page }) => {
    test.fail();
    await abrirGuia(page);
    const consejo = page.getByText('Identifica primero el grupo funcional', { exact: true }).locator('xpath=..');
    await expect(consejo).toBeVisible();
    expect(await consejo.innerText()).not.toMatch(/\d%/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Accesibilidad
// ════════════════════════════════════════════════════════════════════════════
test.describe('Accesibilidad', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('los selectores de grupo, reacción e isomería marcan el pulsado con aria-pressed', async ({ page }) => {
    await elegirGrupo(page, 'Aminas');
    await expect(page.getByRole('button', { name: /Alcoholes$/ })).toHaveAttribute('aria-pressed', 'false');
    await elegirReaccion(page, 'Oxidación de alcoholes');
    await expect(page.getByRole('button', { name: 'Esterificación de Fischer', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await irAPestana(page, /Isomería/);
    const optica = page.getByRole('button', { name: 'Isomería Óptica', exact: true });
    await optica.click();
    await expect(optica).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('note')).toContainText('talidomida');
  });

  // HALLAZGO [bajo] (16/11/2026, ABIERTO): role="tablist"/"tab" sin role="tabpanel" ni
  // aria-controls, y las flechas no mueven el foco entre pestañas (patrón de pestañas de la WAI-ARIA).
  test('HALLAZGO (16/11/2026, ABIERTO) · las pestañas tienen su panel y se recorren con las flechas', async ({ page }) => {
    test.fail();
    const grupos = page.getByRole('tab', { name: /Grupos Funcionales/ });
    const id = await grupos.getAttribute('aria-controls');
    expect(id).not.toBeNull();
    await expect(page.locator(`[id="${id}"]`)).toHaveAttribute('role', 'tabpanel');
    await grupos.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Reacciones/ })).toBeFocused();
  });
});
