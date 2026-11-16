import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * Temperatura interna de cocción (temperatura-coccion-carne) — inspección del 16/11/2026
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Temperatura interna de cocción»: «el punto exacto de la carne y el pescado, y la
 *   temperatura mínima segura para evitar riesgos. En °C y °F». No hay campos numéricos (ni peso
 *   ni grosor ni tiempo de horno): se elige un alimento y la app pinta su mínimo seguro, el reposo
 *   y la tabla de puntos, con un ⚠ en los que quedan por debajo del mínimo. Los datos viven en
 *   lib/calculadoras/coccionCarne.ts, que cita el USDA FSIS («Safe Minimum Internal Temperatures»).
 *
 * DE DÓNDE SALEN LOS ESPERADOS
 *   · °C → °F: °F = °C × 9/5 + 32, redondeado al entero. Calculado a mano antes de abrir la app:
 *       52 → 125,6 → 126 · 57 → 134,6 → 135 · 58 → 136,4 → 136 · 63 → 145,4 → 145
 *       68 → 154,4 → 154 · 71 → 159,8 → 160 · 72 → 161,6 → 162 · 74 → 165,2 → 165
 *   · Mínimos de aves (74 °C / 165 °F) y carne picada (71 °C / 160 °F): los del USDA que fija el
 *     encargo de la inspección. Cotejados con la AESAN (fichas «Campilobacteriosis» y
 *     «Toxiinfección por Escherichia coli», 18/04/2022): «el cocinado completo y homogéneo del
 *     alimento, a una temperatura mayor o igual a 70 ºC durante al menos 2 minutos, destruirá a la
 *     bacteria»; 74 y 71 no quedan por debajo.
 *   · Mínimo de 63 °C / 145 °F en piezas enteras y pescado: el del módulo. fsis.usda.gov no está en
 *     la red de fuentes de la tarea y no se pudo cotejar; la AESAN (ficha del anisakis) pide para el
 *     pescado «60 °C de temperatura por lo menos durante un minuto en toda la pieza», y 58 °C (el
 *     «Al punto» del pescado) queda por debajo: su ⚠ es correcto.
 *
 * Los casos «HALLAZGO (…, ABIERTO)» afirman lo CORRECTO y llevan test.fail() mientras el hallazgo
 * siga abierto: al repararlo, se quita la marca y el título pasa a REPARADO.
 */

const RUTA = '/temperatura-coccion-carne/';

interface Punto {
  nombre: string;
  c: number;
  f: number;
  bajoMinimo: boolean;
}

interface Alimento {
  minC: number;
  minF: number;
  reposo: number;
  puntos: Punto[];
}

// Esperado literal, con el °F calculado a mano (cabecera) y el ⚠ donde °C < mínimo.
const ESPERADO: Record<string, Alimento> = {
  'Vacuno y cordero (pieza entera)': {
    minC: 63, minF: 145, reposo: 3,
    puntos: [
      { nombre: 'Poco hecho', c: 52, f: 126, bajoMinimo: true },
      { nombre: 'Al punto menos', c: 57, f: 135, bajoMinimo: true },
      { nombre: 'Al punto', c: 63, f: 145, bajoMinimo: false },
      { nombre: 'Al punto más', c: 68, f: 154, bajoMinimo: false },
      { nombre: 'Muy hecho', c: 72, f: 162, bajoMinimo: false },
    ],
  },
  'Cerdo (pieza entera)': {
    minC: 63, minF: 145, reposo: 3,
    puntos: [
      { nombre: 'Jugoso', c: 63, f: 145, bajoMinimo: false },
      { nombre: 'Al punto', c: 68, f: 154, bajoMinimo: false },
      { nombre: 'Muy hecho', c: 71, f: 160, bajoMinimo: false },
    ],
  },
  'Aves (pollo, pavo)': {
    minC: 74, minF: 165, reposo: 0,
    puntos: [{ nombre: 'Hecho (seguro)', c: 74, f: 165, bajoMinimo: false }],
  },
  'Carne picada (hamburguesa, albóndigas)': {
    minC: 71, minF: 160, reposo: 0,
    puntos: [{ nombre: 'Hecho (seguro)', c: 71, f: 160, bajoMinimo: false }],
  },
  'Pescado y marisco': {
    minC: 63, minF: 145, reposo: 0,
    puntos: [
      { nombre: 'Jugoso', c: 52, f: 126, bajoMinimo: true },
      { nombre: 'Al punto', c: 58, f: 136, bajoMinimo: true },
      { nombre: 'Hecho', c: 63, f: 145, bajoMinimo: false },
    ],
  },
};

/**
 * La app no tiene ningún <input>, así que `esperarHidratacion` de `_hidratacion.ts` (que sondea el
 * rastreador de valor de un input) no sirve. El testigo para una app de solo botones es que React
 * haya colgado sus props del botón: antes de eso, un clic no llega al estado.
 */
async function esperarHidratacionBotones(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const boton = document.querySelector('[role="group"][aria-label="Alimento"] button');
      return Boolean(boton) && Object.keys(boton as Element).some((k) => k.startsWith('__reactProps$'));
    },
    null,
    { timeout: 20_000 },
  );
}

function grupoAlimentos(page: Page): Locator {
  return page.getByRole('group', { name: 'Alimento' });
}

async function elegir(page: Page, nombre: string): Promise<void> {
  const boton = grupoAlimentos(page).getByRole('button', { name: nombre, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** La caja del mínimo seguro (la única región viva con ese texto). */
function cajaMinimo(page: Page): Locator {
  return page.locator('section[aria-live="polite"]').filter({ hasText: 'temperatura mínima segura' });
}

function regionPuntos(page: Page): Locator {
  return page.getByRole('region', { name: /Puntos de cocción/ });
}

interface FilaLeida {
  nombre: string;
  c: number;
  f: number;
  bajoMinimo: boolean;
}

async function leerFilas(page: Page): Promise<FilaLeida[]> {
  const filas = regionPuntos(page).locator('tbody tr');
  const n = await filas.count();
  const leidas: FilaLeida[] = [];
  for (let i = 0; i < n; i++) {
    const fila = filas.nth(i);
    const celdas = fila.getByRole('cell');
    const nombre = (await celdas.nth(0).innerText()).replace('⚠', '').trim();
    const c = Number((await celdas.nth(1).innerText()).replace('°C', '').trim());
    const f = Number((await celdas.nth(2).innerText()).replace('°F', '').trim());
    const bajoMinimo = (await fila.getByRole('img', { name: 'Por debajo del mínimo seguro' }).count()) > 0;
    leidas.push({ nombre, c, f, bajoMinimo });
  }
  return leidas;
}

async function comprobarAlimento(page: Page, nombre: string): Promise<void> {
  const e = ESPERADO[nombre];
  const caja = cajaMinimo(page);
  await expect(caja).toContainText(`${e.minC} °C / ${e.minF} °F`);
  await expect(caja).toContainText('temperatura mínima segura (USDA)');
  if (e.reposo > 0) await expect(caja).toContainText(`reposo de ${e.reposo} min`);
  else await expect(caja).not.toContainText('reposo');
  expect(await leerFilas(page)).toEqual(e.puntos);
}

/** Las respuestas del FAQPage del JSON-LD, por pregunta. */
async function faqLd(page: Page): Promise<Record<string, string>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const respuestas: Record<string, string> = {};
  for (const b of bloques) {
    const j = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (j['@type'] !== 'FAQPage') continue;
    for (const q of j.mainEntity ?? []) respuestas[q.name] = q.acceptedAnswer.text;
  }
  return respuestas;
}

async function featuresLd(page: Page): Promise<string[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  for (const b of bloques) {
    const j = JSON.parse(b) as { '@type'?: string; featureList?: string[] };
    if (j['@type'] === 'WebApplication') return j.featureList ?? [];
  }
  return [];
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacionBotones(page);
});

test.describe('Temperaturas y puntos de cocción', () => {
  test('CASO 1 (normal) · vacuno: 63 °C / 145 °F con 3 min de reposo, y ⚠ en poco hecho y al punto menos', async ({ page }) => {
    // Vacuno es el estado inicial: se pasa antes por cerdo para que el clic cambie algo de verdad.
    await elegir(page, 'Cerdo (pieza entera)');
    await elegir(page, 'Vacuno y cordero (pieza entera)');
    await comprobarAlimento(page, 'Vacuno y cordero (pieza entera)');
    // El aviso de los puntos poco hechos se ve sin abrir la sección educativa.
    await expect(regionPuntos(page).locator('p')).toContainText('por debajo del mínimo seguro');
    await expect(regionPuntos(page).locator('p')).toBeVisible();
  });

  test('CASO 2 (límite) · aves, el mínimo más alto: 74 °C / 165 °F, un único punto, sin reposo y sin ⚠', async ({ page }) => {
    await elegir(page, 'Aves (pollo, pavo)');
    await comprobarAlimento(page, 'Aves (pollo, pavo)');
    // Carne picada: 71 °C / 160 °F (159,8 °F redondeado); tampoco ofrece un punto poco hecho.
    await elegir(page, 'Carne picada (hamburguesa, albóndigas)');
    await comprobarAlimento(page, 'Carne picada (hamburguesa, albóndigas)');
    // El punto más bajo del catálogo, 52 °C (pescado jugoso), y 58 °C, por debajo de los 60 °C de
    // la AESAN para el anisakis: los dos con ⚠.
    await elegir(page, 'Pescado y marisco');
    await comprobarAlimento(page, 'Pescado y marisco');
  });

  test('CASO 3 (lo que debe rechazarse) · ningún punto por debajo del mínimo sale sin ⚠, y cada °F es el °C convertido', async ({ page }) => {
    // No hay campos que puedan recibir un 0, un negativo o un texto. Lo que la app debe «rechazar»
    // es presentar como seguro un punto por debajo de su mínimo: se mide en los cinco alimentos,
    // con el mínimo que pinta la propia caja, sin mirar la tabla ESPERADO.
    for (const nombre of Object.keys(ESPERADO)) {
      await elegir(page, nombre);
      await expect(grupoAlimentos(page).locator('button[aria-pressed="true"]')).toHaveCount(1);
      const textoCaja = await cajaMinimo(page).innerText();
      const minimo = Number(/(\d+) °C/.exec(textoCaja)?.[1]);
      expect(minimo, `mínimo de ${nombre}`).toBeGreaterThan(0);
      const filas = await leerFilas(page);
      expect(filas.length, `filas de ${nombre}`).toBeGreaterThan(0);
      for (const fila of filas) {
        expect(fila.f, `${nombre} · ${fila.nombre}: °F`).toBe(Math.round((fila.c * 9) / 5 + 32));
        expect(fila.bajoMinimo, `${nombre} · ${fila.nombre}: ⚠ si ${fila.c} < ${minimo}`).toBe(fila.c < minimo);
      }
    }
    // Aves y picada no ofrecen ningún punto por debajo de su mínimo.
    for (const nombre of ['Aves (pollo, pavo)', 'Carne picada (hamburguesa, albóndigas)']) {
      await elegir(page, nombre);
      expect((await leerFilas(page)).every((f) => !f.bajoMinimo)).toBe(true);
    }
  });

  test('El aviso de responsabilidad está fuera de la sección educativa y a la vista', async ({ page }) => {
    await expect(page.getByText('Aviso Médico Importante')).toBeVisible();
  });
});

test.describe('Contenido de seguridad alimentaria', () => {
  // HALLAZGO [medio] (16/11/2026, ABIERTO): el cerdo sale «seguro» a 63 °C sin ningún matiz. La
  // AESAN (ficha «Triquinelosis»): la carne comercial está analizada, pero «el principal riesgo
  // recae en la carne de cerdos sacrificados en matanzas domiciliarias y de jabalíes cazados para
  // autoconsumo que no son sometidos a análisis de triquina», y para ellos: «Cocinar bien la carne
  // a 70° C al menos 2 minutos». La app no nombra ni la AESAN ni ese caso.
  test('HALLAZGO (16/11/2026, ABIERTO) · el cerdo avisa del caso de matanza o jabalí sin análisis de triquina (70 °C, 2 min)', async ({ page }) => {
    test.fail();
    await elegir(page, 'Cerdo (pieza entera)');
    // A la vista, no dentro de la sección educativa (que nace plegada): caja, tabla y nota.
    const aLaVista = [
      await cajaMinimo(page).innerText(),
      await regionPuntos(page).innerText(),
      await page.getByText(/Mínimos seguros:/).innerText(),
    ].join(' ');
    expect(aLaVista).toMatch(/triquin|matanza|jabal/i);
    expect(aLaVista).toMatch(/70\s?°C/);
  });

  // HALLAZGO [medio] (16/11/2026, ABIERTO): «usa pescado muy fresco y previamente congelado
  // (anisakis)» sin decir cómo. La AESAN (página del anisakis): en casa, «congelar el pescado a
  // -15 °C o temperatura inferior durante al menos 4 días» (recomienda contar 5); en la industria,
  // «–20 °C durante 24 horas o a -35 °C durante 15 horas como mínimo».
  test('HALLAZGO (16/11/2026, ABIERTO) · el aviso del pescado dice a qué temperatura y cuánto tiempo congelarlo', async ({ page }) => {
    test.fail();
    await elegir(page, 'Pescado y marisco');
    const aviso = regionPuntos(page).locator('p');
    await expect(aviso).toContainText(/[-−–]\s?(15|20)\s?°C/);
    await expect(aviso).toContainText(/\d+\s?(días|horas)/);
  });

  // HALLAZGO [bajo] (16/11/2026, ABIERTO): la FAQ del JSON-LD da 3 min de reposo también al
  // pescado («vacuno, cordero, cerdo y pescado son seguras a 63 °C (145 °F) con 3 minutos de
  // reposo»), igual que el bloque educativo («vacuno, cerdo y pescado (con reposo)»); la caja del
  // pescado no pide reposo (reposoMin 0) y la otra FAQ limita el reposo a «vacuno, cerdo y cordero».
  test('HALLAZGO (16/11/2026, ABIERTO) · la FAQ y la caja del pescado coinciden en si hay reposo', async ({ page }) => {
    test.fail();
    const respuestas = await faqLd(page);
    const minima = Object.entries(respuestas).find(([q]) => q.includes('temperatura mínima segura'))?.[1] ?? '';
    expect(minima).not.toBe('');
    const faqDaReposoAlPescado = /pescado[^.]*reposo/.test(minima);
    await elegir(page, 'Pescado y marisco');
    const cajaDaReposo = (await cajaMinimo(page).innerText()).includes('reposo');
    expect(faqDaReposoAlPescado).toBe(cajaDaReposo);
  });
});

test.describe('Formato y metadatos', () => {
  // HALLAZGO [bajo] (16/11/2026, ABIERTO): «Funciona 100% en el navegador» en las features del
  // JSON-LD: el «%» va separado con espacio duro (CLAUDE.md global §2, decidido el 25/09/2026).
  test('HALLAZGO (16/11/2026, ABIERTO) · ninguna feature del JSON-LD lleva el «%» pegado a la cifra', async ({ page }) => {
    test.fail();
    const features = await featuresLd(page);
    expect(features.length).toBeGreaterThanOrEqual(4);
    for (const f of features) expect(f).not.toMatch(/\d%/);
  });

  // HALLAZGO [bajo] (16/11/2026, ABIERTO): la nota de la fuente dice «Verificado 2026-06» (formato
  // ISO; el español es «06/2026» o «junio de 2026») y no enlaza la fuente: `urlOficial` existe en
  // COCCION_META pero la página no lo usa.
  test('HALLAZGO (16/11/2026, ABIERTO) · la fecha de verificación va en formato español y la fuente se puede abrir', async ({ page }) => {
    test.fail();
    const nota = page.getByText(/Mínimos seguros:/);
    await expect(nota).not.toContainText(/\d{4}-\d{2}/);
    await expect(nota.getByRole('link')).toHaveCount(1);
  });
});
