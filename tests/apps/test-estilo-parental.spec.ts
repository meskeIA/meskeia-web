import { test, expect, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — test-estilo-parental (test de autoconocimiento; hasta el 11/11/2026 la cola lo
 * clasificaba «fiscal, riesgo 1» porque `ESTILOS_PARENTALES` vivía en `data/fiscal/maternidad.ts`;
 * hoy vive en `data/estilos-parentales.ts`, hallazgo 4502).
 *
 * Primera inspección: 11/11/2026. Reparado en /reparar del mismo día (4490-4502 salvo 4493).
 *
 * LA ARITMÉTICA (desde la reparación del 11/11/2026)
 *   16 preguntas Likert 1-5 (Muy en desacuerdo … Muy de acuerdo).
 *     control = (P1+P2+P3+P4) − (P5+P6+P7+P8) + 16
 *     afecto  = (P9+P10+P11+P12) − (P13+P14+P15+P16) + 16
 *   Cada suma de cuatro va de 4 a 20, así que cada dimensión va de 0 a 32 (punto medio 16). Antes
 *   se sumaba 20 y se mostraba «sobre 40» con una escala de 4 a 36 (hallazgo 4492).
 *   Estilo: > 16 alto, < 16 bajo; con un 16 en una dimensión no se asigna estilo: «Entre X e Y», o
 *   «Sin tendencia predominante» con 16 en las dos (antes 16 → «bajo»: hallazgo 4491).
 *   Punto del cuadrante: left = control/32 · 100 %, top = 100 − afecto/32 · 100 %
 *   (derecha = más control, arriba = más afecto; el eje X dice «Bajo control … Alto control»).
 *
 *   Empates: en cada dimensión, 38.165 de las 5^8 = 390.625 combinaciones (9,8 %) caen justo en el
 *   punto medio (Σ N(s)² con N(s) = 1,4,10,20,35,52,68,80,85,80,… las formas de sumar s con cuatro
 *   dados de 5 caras); antes la app las daba todas por «bajo».
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
/** control (4+4+5+4) − (2+2+1+3) + 16 = 25 · afecto (5+4+5+5) − (3+2+1+1) + 16 = 28 → democrático */
const DEMOCRATICO_MODERADO = [4, 4, 5, 4, 2, 2, 1, 3, 5, 4, 5, 5, 3, 2, 1, 1];
/** control 20 − 4 + 16 = 32 · afecto 20 − 4 + 16 = 32 */
const DEMOCRATICO_MAXIMO = [5, 5, 5, 5, 1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1];
/** control 32 · afecto 4 − 20 + 16 = 0 */
const AUTORITARIO_MAXIMO = [5, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5];
/** control 0 · afecto 32 */
const PERMISIVO_MAXIMO = [1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1];
/** control 0 · afecto 0 */
const NEGLIGENTE_MAXIMO = [1, 1, 1, 1, 5, 5, 5, 5, 1, 1, 1, 1, 5, 5, 5, 5];
/** control 13 − 12 + 16 = 17 (> 16, alto por un punto) · afecto 32 → democrático */
const UMBRAL_CONTROL_17 = [4, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 1, 1, 1, 1];
/**
 * «De acuerdo» con los cuatro ítems de afecto positivo (hablo cada día con mi hijo/a, intento
 * entender qué siente, le digo que le quiero, celebro sus logros), neutral en la 14 y la 16, y
 * «Muy de acuerdo» con la 13 (cuesta encontrar momentos a solas) y la 15 (ocupado/a, delego el
 * cuidado). control (4·4) − (2·4) + 16 = 24 · afecto 16 − (5+3+5+3) + 16 = 16, el punto medio:
 * desde el 11/11/2026, «Entre Democrático y Autoritario» (antes, «Autoritario»).
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
  test('25 de control y 28 de afecto → «Democrático (Autoritativo)», punto en 75,3125 % / 16,25 %', async ({ page }) => {
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MODERADO);
    await expect(perfil(page)).toHaveText('Democrático (Autoritativo)');
    await expect(puntuaciones(page).nth(0)).toHaveText('25/32');
    await expect(puntuaciones(page).nth(1)).toHaveText('28/32');
    // Posición = 5 + valor/32 · 90 (0 → 5 %, 16 → 50 %, 32 → 95 %):
    // left = 5 + 25/32 · 90 = 75,3125 % · top = 100 − (5 + 28/32 · 90) = 16,25 %
    await expect(punto(page)).toHaveAttribute('style', /left: 75\.3125%; top: 16\.25%/);
    expect(await cuadranteDelPunto(page)).toEqual(['Democrático']);
    await expect(page.locator('[class*="styleCard"]')).toContainText('Normas claras con explicaciones razonadas');
  });
});

test.describe('Caso 2 (límite): los cuatro estilos se alcanzan y el umbral es estricto', () => {
  const extremos: [string, number[], string, number, number][] = [
    ['democrático', DEMOCRATICO_MAXIMO, 'Democrático (Autoritativo)', 32, 32],
    ['autoritario', AUTORITARIO_MAXIMO, 'Autoritario', 32, 0],
    ['permisivo', PERMISIVO_MAXIMO, 'Permisivo (Indulgente)', 0, 32],
    ['negligente', NEGLIGENTE_MAXIMO, 'Negligente (No implicado)', 0, 0],
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

  test('control 17 (un punto sobre el medio) con afecto 32 → democrático, no permisivo', async ({ page }) => {
    await abrir(page);
    await verResultado(page, UMBRAL_CONTROL_17);
    await expect(perfil(page)).toHaveText('Democrático (Autoritativo)');
    await expect(puntuaciones(page).nth(0)).toHaveText(/^17\//);
  });

  test('extremos democrático y negligente: su punto cae en su cuadrante', async ({ page }) => {
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MAXIMO); // left 95 %, top 5 %
    expect(await cuadranteDelPunto(page)).toEqual(['Democrático']);
    await page.getByRole('button', { name: 'Repetir test' }).click();
    await verResultado(page, NEGLIGENTE_MAXIMO); // left 5 %, top 95 %
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

  // HALLAZGO 4496 (REPARADO): con una pregunta pendiente el botón decía «Responde las 1 preguntas restantes».
  test('con 15 respuestas el botón concuerda en singular', async ({ page }) => {
    await abrir(page);
    await responder(page, DEMOCRATICO_MODERADO, 15);
    await expect(botonVer(page)).toHaveText('Responde la pregunta que falta');
    await responder(page, DEMOCRATICO_MODERADO, 14);
    await expect(botonVer(page)).toHaveText('Responde la pregunta que falta');
  });
});

test.describe('Cálculo: cuadrante, punto medio y escala (reparados el 11/11/2026)', () => {
  // HALLAZGO 4490 (REPARADO): los rótulos Autoritario y Permisivo estaban intercambiados. El punto
  // se coloca con left = control (derecha = alto control, como dice el eje «Bajo control … Alto
  // control») y top invertido sobre el afecto (arriba = alto afecto); el cuadrante de arriba a la
  // izquierda (bajo control, alto afecto) decía «Autoritario» y el de abajo a la derecha (alto
  // control, bajo afecto), «Permisivo». El eje vertical, además, no tenía rótulo.
  test('el punto de un resultado autoritario cae en el cuadrante «Autoritario»', async ({ page }) => {
    await abrir(page);
    await verResultado(page, AUTORITARIO_MAXIMO);
    await expect(perfil(page)).toHaveText('Autoritario');
    expect(await cuadranteDelPunto(page)).toEqual(['Autoritario']);
    await expect(page.getByText('Alto afecto', { exact: true })).toBeVisible();
    await expect(page.getByText('Bajo afecto', { exact: true })).toBeVisible();
  });

  test('el punto de un resultado permisivo cae en el cuadrante «Permisivo»', async ({ page }) => {
    await abrir(page);
    await verResultado(page, PERMISIVO_MAXIMO);
    await expect(perfil(page)).toHaveText('Permisivo (Indulgente)');
    expect(await cuadranteDelPunto(page)).toEqual(['Permisivo']);
  });

  // HALLAZGO 4491 (REPARADO): el punto medio contaba como «bajo» en las dos dimensiones. Contestar
  // lo mismo a las 16 preguntas (todo Neutral, todo «Muy de acuerdo» o todo «Muy en desacuerdo»)
  // deja el punto en el centro exacto del cuadrante, y la app decía «Negligente (No implicado)»:
  // «El progenitor está ausente física o emocionalmente» y la recomendación de servicios sociales.
  test('contestar lo mismo a todo (16 y 16, el centro) da «Sin tendencia predominante», no «Negligente»', async ({ page }) => {
    for (const v of [3, 5, 1]) {
      await abrir(page);
      await verResultado(page, Array(16).fill(v));
      await expect(punto(page)).toHaveAttribute('style', /left: 50%; top: 50%/);
      await expect(perfil(page)).toHaveText('Sin tendencia predominante');
      await expect(page.locator('[class*="styleCard"]')).toContainText('Tu puntuación de control y de afecto está justo en el punto medio de la escala (16 de 32)');
      await expect(page.getByText('servicios sociales')).toHaveCount(0);
    }
  });

  test('con el punto medio solo en el afecto, el resultado queda entre los dos estilos que separa', async ({ page }) => {
    await abrir(page);
    await verResultado(page, TRABAJA_Y_DELEGA); // control 24 (alto), afecto 16 (medio)
    await expect(perfil(page)).toHaveText('Entre Democrático y Autoritario');
    await expect(page.locator('[class*="styleCard"]')).toContainText('Tu puntuación de afecto está justo en el punto medio');
  });

  // HALLAZGO 4492 (REPARADO): cada dimensión iba de 4 a 36, pero se mostraba «sobre 40»: el máximo
  // posible salía «36/40» y el mínimo «4/40» (también en el aria-label del punto). Hoy va de 0 a 32.
  test('las respuestas de máximo control y afecto muestran el máximo de la escala, y las de mínimo, 0', async ({ page }) => {
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MAXIMO);
    for (const i of [0, 1]) {
      const texto = (await puntuaciones(page).nth(i).textContent()) ?? '';
      const [num, den] = texto.split('/').map((p) => Number(p.trim()));
      expect(num, texto).toBe(den);
    }
    await expect(punto(page)).toHaveAttribute('aria-label', 'Tu posición: Control 32 de 32, Afecto 32 de 32');
    await expect(punto(page)).toHaveAttribute('style', /left: 95%; top: 5%/);
    await page.getByRole('button', { name: 'Repetir test' }).click();
    await verResultado(page, NEGLIGENTE_MAXIMO);
    await expect(puntuaciones(page).nth(0)).toHaveText('0/32');
    await expect(puntuaciones(page).nth(1)).toHaveText('0/32');
  });
});

test.describe('Hallazgo abierto de contenido: los ítems 13 y 15 miden disponibilidad, no afecto', () => {
  // ABIERTO (4493, espera la decisión del usuario: cambiar ítems del test es cambiar lo que mide):
  // quien está «De acuerdo» con los cuatro ítems de afecto positivo pero trabaja muchas horas y
  // delega parte del cuidado (13 y 15 «Muy de acuerdo») no llega a afecto alto: hasta el 11/11/2026
  // le daba «Autoritario»; desde la reparación del punto medio (4491), «Entre Democrático y
  // Autoritario». CLAUDE.md §1.quinquies 2 y 4: asunción de privilegio y moralizar una elección
  // legítima (delegar el cuidado en abuelos o en una escuela infantil).
  test.fail('afecto positivo «De acuerdo» en 9-12 queda en afecto alto aunque trabaje y delegue', async ({ page }) => {
    await abrir(page);
    await verResultado(page, TRABAJA_Y_DELEGA);
    await expect(puntuaciones(page).nth(0)).toHaveText(/^24\//);
    await expect(perfil(page)).toHaveText('Democrático (Autoritativo)', { timeout: 2000 });
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

  // HALLAZGO 4497 (REPARADO): cada radiogroup se llamaba «Pregunta N»; el enunciado no formaba
  // parte de su nombre, y quien llegaba con Tab oía «Pregunta 2, Muy en desacuerdo» sin la afirmación.
  test('el grupo de opciones se anuncia con el enunciado de la pregunta', async ({ page }) => {
    await abrir(page);
    await expect(
      page.getByRole('radiogroup', { name: 'Pregunta 2 de 16 Establezco horarios fijos para comer, dormir y hacer deberes' }),
    ).toHaveCount(1);
  });

  // HALLAZGO 4498 (REPARADO): el botón pulsado desaparecía al pintar el resultado y el foco caía a
  // <body>; con «Repetir test», igual. Hoy va al encabezado del resultado y a la entradilla del test.
  test('tras «Ver mi resultado» con teclado el foco va al encabezado del resultado', async ({ page }) => {
    await abrir(page);
    await responder(page, DEMOCRATICO_MODERADO);
    await botonVer(page).focus();
    await page.keyboard.press('Enter');
    await expect(perfil(page)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tu tendencia predominante' })).toBeFocused();
    await page.getByRole('button', { name: 'Repetir test' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('No hay respuestas correctas ni incorrectas.')).toBeFocused();
  });

  // HALLAZGO 4499 (REPARADO): el emoji grande del resultado (🤝, 👊…) iba en su propio <div> sin
  // aria-hidden, junto al encabezado «Tu tendencia predominante»: un lector de pantalla lo leía antes.
  test('el emoji del encabezado del resultado va oculto al lector de pantalla', async ({ page }) => {
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MODERADO);
    const oculto = await page
      .locator('[class*="resultIcon"]')
      .evaluate((el) => !!el.closest('[aria-hidden="true"]') || !!el.querySelector('[aria-hidden="true"]'));
    expect(oculto).toBe(true);
  });

  for (const tema of ['light', 'dark'] as const) {
    // HALLAZGO 4500 (REPARADO): los rótulos del cuadrante (12 px, peso 600: texto normal, exige
    // 4,5:1). Medido el 11/11/2026: claro, Negligente 4,28:1 · oscuro, Autoritario 4,21,
    // Negligente 3,95 y Permisivo 4,40.
    test(`tema ${tema}: los cuatro rótulos del cuadrante cumplen 4,5:1`, async ({ page }) => {
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

  // HALLAZGO 4501 (REPARADO): «Ver mi resultado» hacía scrollTo(0) y dejaba arriba el hero, el
  // distintivo y el aviso legal: medido el 11/11/2026, el nombre del estilo quedaba entre 694 y
  // 761 px de una pantalla de 740 (cortado). Se mide cuando el desplazamiento PARA.
  test('tras «Ver mi resultado» el nombre del estilo queda entero a la vista', async ({ page }) => {
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

test.describe('Contenido editorial (reparado el 11/11/2026)', () => {
  // HALLAZGO 4494 (REPARADO): afirmaciones concluyentes sin fuente sobre un marco discutido
  // (§1.quinquies 3 y 5), en la misma página que reconoce que el modelo «se desarrolló en un
  // contexto occidental». Hoy dicen lo mismo que el FAQPage, con cautela («sugieren», «ningún estilo
  // funciona igual»), y la recomendación del democrático ya no dice «por la evidencia».
  test('la guía no da por «confirmado» ni «determinante» lo que la investigación discute', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const cultura = page.locator('details', { hasText: '¿La cultura influye en el estilo parental?' });
    const genetica = page.locator('li', { hasText: 'El estilo parental no importa, es genética' });
    await expect(cultura).toHaveCount(1);
    await expect(genetica).toHaveCount(1);
    await expect(cultura).not.toContainText('la investigación intercultural confirma');
    await expect(genetica).not.toContainText('el ambiente familiar es determinante');
    await expect(cultura).toContainText('ningún estilo funciona igual en todas las culturas');
    await expect(page.locator('li', { hasText: 'Ser estricto es mejor que ser blando' })).not.toContainText('La evidencia muestra');
    await abrir(page);
    await verResultado(page, DEMOCRATICO_MODERADO);
    await expect(page.locator('[class*="recommendationBox"]')).not.toContainText('por la evidencia');
  });

  // HALLAZGO 4495 (REPARADO): el distintivo «es-data» decía que los datos de referencia eran de
  // España, pero la app no tiene ningún dato español: el marco (Baumrind, Maccoby y Martin) y la
  // evidencia que cita salen de muestras de EE. UU. Hoy lleva la variante «global».
  test('el distintivo de región no atribuye a España datos que la app no tiene', async ({ page }) => {
    await abrir(page);
    await expect(page.getByText('Datos de referencia: España')).toHaveCount(0);
    await expect(page.getByText('Herramienta universal')).toBeVisible();
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
