import { test, expect, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — test-estilo-parental (la cola la clasifica «fiscal, riesgo 1» solo porque
 * `ESTILOS_PARENTALES` vive en `data/fiscal/maternidad.ts`; es un test de autoconocimiento).
 *
 * Primera inspección: 11/11/2026.
 *
 * Resuelto a mano ANTES de abrir el navegador, leyendo `app/test-estilo-parental/page.tsx`
 * (preguntas y puntuación inline) y `data/fiscal/maternidad.ts` (los 4 estilos).
 *
 * LA ARITMÉTICA
 *   16 preguntas Likert 1-5 (Muy en desacuerdo … Muy de acuerdo).
 *     control = (P1+P2+P3+P4) − (P5+P6+P7+P8) + 20
 *     afecto  = (P9+P10+P11+P12) − (P13+P14+P15+P16) + 20
 *   Cada suma de cuatro va de 4 a 20, así que cada dimensión va de 4 a 36 (punto medio 20).
 *   Estilo: control > 20 y afecto > 20 → democrático · control > 20 y afecto ≤ 20 → autoritario ·
 *   control ≤ 20 y afecto > 20 → permisivo · el resto → negligente.
 *   Punto del cuadrante: left = control/40 · 100 %, top = 100 − afecto/40 · 100 %
 *   (derecha = más control, arriba = más afecto; el eje X dice «Bajo control … Alto control»).
 *
 *   Empates: en cada dimensión, 38.165 de las 5^8 = 390.625 combinaciones (9,8 %) suman justo 20
 *   (Σ N(s)² con N(s) = 1,4,10,20,35,52,68,80,85,80,… las formas de sumar s con cuatro dados de 5
 *   caras) y la app las da todas por «bajo».
 */

const RUTA = '/test-estilo-parental/';
const TEXTO: Record<number, string> = {
  1: 'Muy en desacuerdo',
  2: 'En desacuerdo',
  3: 'Neutral',
  4: 'De acuerdo',
  5: 'Muy de acuerdo',
};

// Respuestas por pregunta (índice 0 = pregunta 1).
/** control (4+4+5+4) − (2+2+1+3) + 20 = 29 · afecto (5+4+5+5) − (3+2+1+1) + 20 = 32 → democrático */
const DEMOCRATICO_MODERADO = [4, 4, 5, 4, 2, 2, 1, 3, 5, 4, 5, 5, 3, 2, 1, 1];
/** control 20 − 4 + 20 = 36 · afecto 20 − 4 + 20 = 36 */
const DEMOCRATICO_MAXIMO = [5, 5, 5, 5, 1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1];
/** control 36 · afecto 4 − 20 + 20 = 4 */
const AUTORITARIO_MAXIMO = [5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5];
/** control 4 · afecto 36 */
const PERMISIVO_MAXIMO = [1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1];
/** control 4 · afecto 4 */
const NEGLIGENTE_MAXIMO = [1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 5, 5, 5, 5];
/** control 13 − 12 + 20 = 21 (> 20, alto por un punto) · afecto 36 → democrático */
const UMBRAL_CONTROL_21 = [4, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 1, 1, 1, 1];
/**
 * «De acuerdo» con los cuatro ítems de afecto positivo (hablo cada día con mi hijo/a, intento
 * entender qué siente, le digo que le quiero, celebro sus logros), neutral en la 14 y la 16, y
 * «Muy de acuerdo» con la 13 (cuesta encontrar momentos a solas) y la 15 (ocupado/a, delego el
 * cuidado). control (4·4) − (2·4) + 20 = 28 · afecto 16 − (5+3+5+3) + 20 = 20 → autoritario.
 */
const TRABAJA_Y_DELEGA = [4, 4, 4, 4, 2, 2, 2, 2, 4, 4, 4, 4, 5, 3, 5, 3];

const perfil = (page: Page) => page.locator('[class*="resultProfile"]');
const puntuaciones = (page: Page) => page.locator('[class*="scoreValue"]');
const botonVer = (page: Page) => page.locator('button[class*="btnPrimary"]');
const punto = (page: Page) => page.locator('[class*="userDot"]');

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

/** Contesta por tarjeta (no por el nombre del radiogroup, que un hallazgo pide cambiar). */
async function responder(page: Page, valores: number[], hasta = valores.length): Promise<void> {
  const tarjetas = page.locator('[class*="questionCard"]');
  for (let i = 0; i < hasta; i++) {
    await tarjetas.nth(i).getByRole('radio', { name: TEXTO[valores[i]], exact: true }).click();
  }
}

async function verResultado(page: Page, valores: number[]): Promise<void> {
  await responder(page, valores);
  await botonVer(page).click();
  await expect(perfil(page)).toBeVisible();
}

/** Nombre del cuadrante (rótulo pintado) que contiene el centro del punto del usuario. */
async function cuadranteDelPunto(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const dot = document.querySelector('[class*="userDot"]');
    if (!dot) return [];
    const d = dot.getBoundingClientRect();
    const cx = d.left + d.width / 2;
    const cy = d.top + d.height / 2;
    return Array.from(document.querySelectorAll('[class*="quadrantName"]'))
      .filter((n) => {
        const caja = n.parentElement?.parentElement?.getBoundingClientRect();
        return !!caja && cx > caja.left && cx < caja.right && cy > caja.top && cy < caja.bottom;
      })
      .map((n) => n.textContent ?? '');
  });
}

test.describe('Caso 1 (normal): un perfil democrático moderado', () => {
  test('29 de control y 32 de afecto → «Democrático (Autoritativo)», punto en 72,5 % / 20 %', async ({ page }) => {
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MODERADO);
    await expect(perfil(page)).toHaveText('Democrático (Autoritativo)');
    // La cifra, no la escala (la escala «/40» es otro hallazgo, abajo).
    await expect(puntuaciones(page).nth(0)).toHaveText(/^29\//);
    await expect(puntuaciones(page).nth(1)).toHaveText(/^32\//);
    // left = 29/40 · 100 = 72,5 % · top = 100 − 32/40 · 100 = 20 %
    await expect(punto(page)).toHaveAttribute('style', /left: 72\.5%; top: 20%/);
    expect(await cuadranteDelPunto(page)).toEqual(['Democrático']);
    await expect(page.locator('[class*="styleCard"]')).toContainText('Normas claras con explicaciones razonadas');
  });
});

test.describe('Caso 2 (límite): los cuatro estilos se alcanzan y el umbral es estricto', () => {
  const extremos: [string, number[], string, number, number][] = [
    ['democrático', DEMOCRATICO_MAXIMO, 'Democrático (Autoritativo)', 36, 36],
    ['autoritario', AUTORITARIO_MAXIMO, 'Autoritario', 36, 4],
    ['permisivo', PERMISIVO_MAXIMO, 'Permisivo (Indulgente)', 4, 36],
    ['negligente', NEGLIGENTE_MAXIMO, 'Negligente (No implicado)', 4, 4],
  ];
  for (const [nombre, valores, titulo, control, afecto] of extremos) {
    test(`respuestas extremas ${nombre} → «${titulo}» con ${control} y ${afecto}`, async ({ page }) => {
      await abrir(page);
      await verResultado(page, valores);
      await expect(perfil(page)).toHaveText(titulo);
      await expect(puntuaciones(page).nth(0)).toHaveText(new RegExp(`^${control}/`));
      await expect(puntuaciones(page).nth(1)).toHaveText(new RegExp(`^${afecto}/`));
    });
  }

  test('control 21 (un punto sobre el medio) con afecto 36 → democrático, no permisivo', async ({ page }) => {
    await abrir(page);
    await verResultado(page, UMBRAL_CONTROL_21);
    await expect(perfil(page)).toHaveText('Democrático (Autoritativo)');
    await expect(puntuaciones(page).nth(0)).toHaveText(/^21\//);
  });

  test('extremos democrático y negligente: su punto cae en su cuadrante', async ({ page }) => {
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MAXIMO); // left 90 %, top 10 %
    expect(await cuadranteDelPunto(page)).toEqual(['Democrático']);
    await page.getByRole('button', { name: 'Repetir test' }).click();
    await verResultado(page, NEGLIGENTE_MAXIMO); // left 10 %, top 90 %
    expect(await cuadranteDelPunto(page)).toEqual(['Negligente']);
  });
});

test.describe('Caso 3 (rechazo): sin las 16 respuestas no hay resultado', () => {
  test('con 0 y con 15 respuestas el botón está deshabilitado y un clic forzado no muestra nada', async ({ page }) => {
    await abrir(page);
    await expect(botonVer(page)).toBeDisabled();
    await expect(botonVer(page)).toHaveText('Responde las 16 preguntas restantes');
    await expect(page.getByText('0 de 16 preguntas respondidas')).toBeVisible();

    await responder(page, DEMOCRATICO_MODERADO, 15);
    await expect(page.getByText('15 de 16 preguntas respondidas')).toBeVisible();
    await expect(botonVer(page)).toBeDisabled();
    await botonVer(page).dispatchEvent('click'); // un clic sintético salta el `disabled`
    await expect(perfil(page)).toHaveCount(0);

    // Cambiar una respuesta ya dada no cuenta como otra pregunta respondida.
    await page.locator('[class*="questionCard"]').nth(0).getByRole('radio', { name: 'Muy de acuerdo', exact: true }).click();
    await expect(page.getByText('15 de 16 preguntas respondidas')).toBeVisible();
    await expect(page.locator('[class*="questionCard"]').nth(0).getByRole('radio', { checked: true })).toHaveText(
      'Muy de acuerdo',
    );
  });

  test('«Repetir test» vuelve a 0 respuestas', async ({ page }) => {
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MODERADO);
    await page.getByRole('button', { name: 'Repetir test' }).click();
    await expect(page.getByText('0 de 16 preguntas respondidas')).toBeVisible();
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
  });

  // ABIERTO: con una pregunta pendiente el botón dice «Responde las 1 preguntas restantes».
  test.fail('con 15 respuestas el botón concuerda en singular', async ({ page }) => {
    await abrir(page);
    await responder(page, DEMOCRATICO_MODERADO, 15);
    await expect(botonVer(page)).not.toHaveText(/las 1 preguntas/);
  });
});

test.describe('Hallazgos abiertos del cálculo', () => {
  // ABIERTO: los rótulos Autoritario y Permisivo están intercambiados. El punto se coloca con
  // left = control (derecha = alto control, como dice el eje «Bajo control … Alto control») y
  // top invertido sobre el afecto (arriba = alto afecto), pero el cuadrante de arriba a la
  // izquierda (bajo control, alto afecto) dice «Autoritario» y el de abajo a la derecha (alto
  // control, bajo afecto) dice «Permisivo». Medido el 11/11/2026: el autoritario extremo cae en
  // «Permisivo» y el permisivo extremo en «Autoritario».
  test.fail('el punto de un resultado autoritario cae en el cuadrante «Autoritario»', async ({ page }) => {
    await abrir(page);
    await verResultado(page, AUTORITARIO_MAXIMO);
    await expect(perfil(page)).toHaveText('Autoritario');
    expect(await cuadranteDelPunto(page)).toEqual(['Autoritario']);
  });

  test.fail('el punto de un resultado permisivo cae en el cuadrante «Permisivo»', async ({ page }) => {
    await abrir(page);
    await verResultado(page, PERMISIVO_MAXIMO);
    await expect(perfil(page)).toHaveText('Permisivo (Indulgente)');
    expect(await cuadranteDelPunto(page)).toEqual(['Permisivo']);
  });

  // ABIERTO: el punto medio (20) cuenta como «bajo» en las dos dimensiones. Contestar lo mismo a
  // las 16 preguntas (todo Neutral, todo «Muy de acuerdo» o todo «Muy en desacuerdo») da 20 y 20,
  // el punto en el centro exacto del cuadrante, y la app dice «Negligente (No implicado)»: «El
  // progenitor está ausente física o emocionalmente» y la recomendación de servicios sociales.
  test.fail('contestar lo mismo a todo (20 y 20, el centro) no da «Negligente»', async ({ page }) => {
    for (const v of [3, 5, 1]) {
      await abrir(page);
      await verResultado(page, Array(16).fill(v));
      await expect(punto(page)).toHaveAttribute('style', /left: 50%; top: 50%/);
      await expect(perfil(page)).not.toHaveText(/Negligente/);
    }
  });

  // ABIERTO: cada dimensión va de 4 a 36, pero se muestra «sobre 40»: el máximo posible sale
  // «36/40» y el mínimo «4/40» (también en el aria-label del punto, «Control 36 de 40»).
  test.fail('las respuestas de máximo control y afecto muestran el máximo de la escala', async ({ page }) => {
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MAXIMO);
    for (const i of [0, 1]) {
      const texto = (await puntuaciones(page).nth(i).textContent()) ?? '';
      const [num, den] = texto.split('/').map((p) => Number(p.trim()));
      expect(num, texto).toBe(den);
    }
  });
});

test.describe('Hallazgo abierto de contenido: los ítems 13 y 15 miden disponibilidad, no afecto', () => {
  // ABIERTO: quien está «De acuerdo» con los cuatro ítems de afecto positivo pero trabaja muchas
  // horas y delega parte del cuidado (13 y 15 «Muy de acuerdo») queda en afecto 20 = bajo, y con
  // control 28 la app le da «Autoritario» («Escasa demostración de afecto», «Poca expresión
  // emocional»). CLAUDE.md §1.quinquies 2 y 4: asunción de privilegio y moralizar una elección
  // legítima (delegar el cuidado en abuelos o en una escuela infantil).
  test.fail('afecto positivo «De acuerdo» en 9-12 no queda en bajo afecto por trabajar y delegar', async ({ page }) => {
    await abrir(page);
    await verResultado(page, TRABAJA_Y_DELEGA);
    await expect(puntuaciones(page).nth(0)).toHaveText(/^28\//);
    await expect(perfil(page)).not.toHaveText('Autoritario');
  });
});

test.describe('Accesibilidad', () => {
  test('todos los botones llevan type="button" y las opciones son radio con aria-checked', async ({ page }) => {
    await abrir(page);
    const sinType = await page.evaluate(
      () => Array.from(document.querySelectorAll('main button, [class*="container"] button')).filter((b) => b.getAttribute('type') !== 'button').length,
    );
    expect(sinType).toBe(0);
    const tarjeta = page.locator('[class*="questionCard"]').nth(1);
    await expect(tarjeta.getByRole('radio')).toHaveCount(5);
    await tarjeta.getByRole('radio', { name: 'Neutral', exact: true }).click();
    await expect(tarjeta.getByRole('radio', { name: 'Neutral', exact: true })).toHaveAttribute('aria-checked', 'true');
    await expect(tarjeta.getByRole('radio', { name: 'De acuerdo', exact: true })).toHaveAttribute('aria-checked', 'false');
    // Los emojis del hero y de la tabla van con aria-hidden.
    await expect(page.locator('h1 span[aria-hidden="true"]')).toHaveCount(1);
  });

  // ABIERTO: cada radiogroup se llama «Pregunta N»; el enunciado no forma parte de su nombre, y
  // quien llega con Tab oye «Pregunta 2, Muy en desacuerdo» sin la afirmación que valora.
  test.fail('el grupo de opciones se anuncia con el enunciado de la pregunta', async ({ page }) => {
    await abrir(page);
    await expect(
      page.getByRole('radiogroup', { name: /Establezco horarios fijos para comer, dormir y hacer deberes/ }),
    ).toHaveCount(1);
  });

  // ABIERTO: el botón pulsado desaparece al pintar el resultado y el foco cae a <body>.
  test.fail('tras «Ver mi resultado» con teclado el foco no queda en <body>', async ({ page }) => {
    await abrir(page);
    await responder(page, DEMOCRATICO_MODERADO);
    await botonVer(page).focus();
    await page.keyboard.press('Enter');
    await expect(perfil(page)).toBeVisible();
    const enBody = await page.evaluate(() => document.activeElement === document.body);
    expect(enBody).toBe(false);
  });

  // ABIERTO: el emoji grande del resultado (🤝, 👊…) va en su propio <div> sin aria-hidden, junto
  // al encabezado «Tu tendencia predominante»: un lector de pantalla lo lee antes.
  test.fail('el emoji del encabezado del resultado va oculto al lector de pantalla', async ({ page }) => {
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MODERADO);
    const oculto = await page
      .locator('[class*="resultIcon"]')
      .evaluate((el) => !!el.closest('[aria-hidden="true"]') || !!el.querySelector('[aria-hidden="true"]'));
    expect(oculto).toBe(true);
  });

  for (const tema of ['light', 'dark'] as const) {
    // ABIERTO: los rótulos del cuadrante (12 px, peso 600: texto normal, exige 4,5:1). Medido el
    // 11/11/2026: claro, Negligente 4,28:1 · oscuro, Autoritario 4,21, Negligente 3,95 y
    // Permisivo 4,40.
    test.fail(`tema ${tema}: los cuatro rótulos del cuadrante cumplen 4,5:1`, async ({ page }) => {
      await page.addInitScript((t) => window.localStorage.setItem('meskeia-theme', t), tema);
      await abrir(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      await verResultado(page, DEMOCRATICO_MODERADO);
      const nombres = page.locator('[class*="quadrantName"]');
      await expect(nombres).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        const n = nombres.nth(i);
        await expect.poll(() => contrasteSobreFondoReal(n), { timeout: 3000, message: (await n.textContent()) ?? '' }).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

test.describe('Móvil 360 px con toque', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('con toques se completa el test y sale el estilo', async ({ page }) => {
    await abrir(page);
    const tarjetas = page.locator('[class*="questionCard"]');
    for (let i = 0; i < 16; i++) {
      await tarjetas.nth(i).getByRole('radio', { name: TEXTO[DEMOCRATICO_MODERADO[i]], exact: true }).tap();
    }
    await botonVer(page).tap();
    await expect(perfil(page)).toHaveText('Democrático (Autoritativo)');
  });

  // ABIERTO: «Ver mi resultado» hace scrollTo(0) y deja arriba el hero, el distintivo y el aviso
  // legal: medido el 11/11/2026, el nombre del estilo queda entre 694 y 761 px de una pantalla de
  // 740 (cortado) y el cuadrante y las puntuaciones, fuera. El desplazamiento es suave y en su
  // camino hacia arriba pasa por el resultado: se mide cuando PARA, no mientras pasa.
  test.fail('tras «Ver mi resultado» el nombre del estilo queda entero a la vista', async ({ page }) => {
    await abrir(page);
    const tarjetas = page.locator('[class*="questionCard"]');
    for (let i = 0; i < 16; i++) {
      await tarjetas.nth(i).getByRole('radio', { name: TEXTO[DEMOCRATICO_MODERADO[i]], exact: true }).tap();
    }
    await botonVer(page).tap();
    await expect(perfil(page)).toHaveText('Democrático (Autoritativo)');
    await expect
      .poll(
        async () => {
          const antes = await page.evaluate(() => window.scrollY);
          await page.waitForTimeout(300);
          return antes === (await page.evaluate(() => window.scrollY));
        },
        { timeout: 5000 },
      )
      .toBe(true);
    const caja = await perfil(page).boundingBox();
    const alto = page.viewportSize()?.height ?? 740;
    expect(caja, 'el nombre del estilo tiene caja').not.toBeNull();
    expect(caja!.y, 'borde superior').toBeGreaterThanOrEqual(0);
    expect(caja!.y + caja!.height, 'borde inferior').toBeLessThanOrEqual(alto);
  });
});

test.describe('Hallazgos abiertos de contenido editorial', () => {
  // ABIERTO: afirmaciones concluyentes sin fuente sobre un marco discutido (§1.quinquies 3 y 5),
  // en la misma página que reconoce que el modelo «se desarrolló en un contexto occidental». El
  // FAQPage dice lo mismo con cautela («sugiere», «ningún estilo funciona igual en todos los
  // contextos»).
  test.fail('la guía no da por «confirmado» ni «determinante» lo que la investigación discute', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const cultura = page.locator('details', { hasText: '¿La cultura influye en el estilo parental?' });
    const genetica = page.locator('li', { hasText: 'El estilo parental no importa, es genética' });
    await expect(cultura).toHaveCount(1);
    await expect(genetica).toHaveCount(1);
    await expect(cultura).not.toContainText('la investigación intercultural confirma');
    await expect(genetica).not.toContainText('el ambiente familiar es determinante');
  });

  // ABIERTO: el distintivo «es-data» dice que los datos de referencia son de España, pero la app
  // no tiene ningún dato español: el marco (Baumrind, Maccoby y Martin) y la evidencia que cita
  // salen de muestras de EE. UU.
  test.fail('el distintivo de región no atribuye a España datos que la app no tiene', async ({ page }) => {
    await abrir(page);
    await expect(page.getByText('Datos de referencia: España')).toHaveCount(0);
  });
});

test.describe('JSON-LD', () => {
  test('WebApplication con al menos 4 features y FAQPage', async ({ page }) => {
    await abrir(page);
    const bloques = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (t) => JSON.parse(t) as Record<string, unknown>,
    );
    const app = bloques.find((b) => b['@type'] === 'WebApplication');
    const faq = bloques.find((b) => b['@type'] === 'FAQPage');
    expect(app).toBeTruthy();
    expect(faq).toBeTruthy();
    const features = (app?.featureList ?? app?.features ?? []) as unknown;
    const lista = Array.isArray(features) ? features : String(features).split(/,\s*/);
    expect(lista.length).toBeGreaterThanOrEqual(4);
  });
});
