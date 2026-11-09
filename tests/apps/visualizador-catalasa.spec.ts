import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { comprobarFaqPageUnico } from './_faqpage-unico';

/**
 * visualizador-catalasa — PRIMERA INSPECCIÓN (Inspector, 09/11/2026)
 *
 * La app no calcula nada que el usuario introduzca: es un visualizador con tres cosas
 * comprobables, y los esperados se resolvieron a mano ANTES de abrirla.
 *
 *   · La ecuación 2 H₂O₂ → 2 H₂O + O₂ tiene que estar ajustada:
 *       H: 2 × 2 = 4 a la izquierda · 2 × 2 = 4 a la derecha
 *       O: 2 × 2 = 4 a la izquierda · 2 × 1 + 2 = 4 a la derecha
 *   · El contador de la reacción sube hasta el número de recambio que la propia app declara
 *     (hero, FAQPage y visualizador-enzimas-cuerpo-humano): 40 millones por segundo, que en
 *     es-ES se escribe «40.000.000». En 80 pasos de 25 ms (2 s) sube de 500.000 en 500.000 y no
 *     puede pasarse del tope.
 *   · El experimento: cada sustancia pinta su actividad en la barra (ancho = actividad / 100) y
 *     tantas burbujas como round(12 × actividad / 100), siendo 12 las del hígado crudo:
 *       Hígado crudo  100 → ancho 1,00 · 12 burbujas
 *       Patata cruda   40 → ancho 0,40 · 12 × 0,40 = 4,8 → 5 burbujas
 *       Hígado cocido   2 → ancho 0,02 · 12 × 0,02 = 0,24 → 0 burbujas
 *       Solo agua       0 → ancho 0,00 · 0 burbujas
 *
 *   CASO 1 (normal): «Patata cruda» → 40, barra al 40 %, 5 burbujas, solo ella aria-pressed.
 *   CASO 2 (límite): el contador llega a 40.000.000 y para; «Solo agua» deja la barra a 0 y sin
 *     burbujas; «Reiniciar» (también a mitad de animación) vuelve a 0 y no sigue subiendo.
 *   CASO 3 (se rechaza): con la reacción activa, un segundo «Activar» no la reinicia.
 *
 * Los tres coincidieron con lo calculado (Playwright contra el 3052, script aparte). Lo que
 * sigue a esos casos son los HALLAZGOS de la inspección, cada uno con `test.fail()` y la
 * afirmación CORRECTA: cuando se reparen, el test pasará y habrá que quitarle el `test.fail()`.
 *
 * Fuente de la nota de seguridad: ficha técnica de AGUA OXIGENADA FORET 3 % (CIMA de la AEMPS,
 * n.º de registro 40859, revisión del texto de enero de 2017), sección 4.4: «Solo para uso
 * externo. NO TRAGAR. Se debe evitar el contacto con los ojos.»
 */

const RUTA = '/visualizador-catalasa/';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

function selector(page: Page): Locator {
  return page.getByRole('group', { name: 'Seleccionar sustancia para el experimento' });
}

function sustancia(page: Page, nombre: string): Locator {
  return selector(page).getByRole('button', { name: new RegExp(`^${nombre}`) });
}

function barra(page: Page): Locator {
  return page.getByRole('progressbar', { name: 'Nivel de actividad enzimática' });
}

/** La cifra que acompaña a «Actividad enzimática», encima de la barra. */
function cifraActividad(page: Page): Locator {
  return page.getByText('Actividad enzimática', { exact: true }).locator('xpath=..').locator('strong');
}

function burbujasVaso(page: Page): Locator {
  return page.getByRole('img', { name: /^Vaso con / }).locator('circle');
}

function burbujasTubo(page: Page): Locator {
  return page.getByRole('img', { name: 'Tubo de ensayo con reacción' }).locator('circle');
}

function contador(page: Page): Locator {
  return page.getByText('Reacciones por segundo:', { exact: true }).locator('xpath=..').locator('[aria-live]');
}

function activar(page: Page): Locator {
  return page.getByRole('button', { name: 'Activar reacción de la catalasa' });
}

function reiniciar(page: Page): Locator {
  return page.getByRole('button', { name: 'Reiniciar simulación' });
}

/** Ancho del relleno de la barra respecto a su carril (espera a que acabe la transición). */
async function anchoRelativo(page: Page): Promise<number> {
  return barra(page).evaluate((carril) => {
    const relleno = carril.firstElementChild as HTMLElement;
    return relleno.getBoundingClientRect().width / carril.getBoundingClientRect().width;
  });
}

/** Cuenta los átomos de un lado de la ecuación («2H₂O₂», «2H₂O+O₂»). */
function atomos(lado: string): Record<string, number> {
  const sub = '₀₁₂₃₄₅₆₇₈₉';
  const cuenta: Record<string, number> = {};
  for (const termino of lado.split('+')) {
    const m = termino.trim().match(/^(\d*)(.+)$/);
    if (!m) throw new Error(`Término ilegible: «${termino}»`);
    const coef = m[1] ? Number(m[1]) : 1;
    for (const [, el, indice] of m[2].matchAll(/([A-Z][a-z]?)([₀-₉]*)/g)) {
      const n = indice ? Number([...indice].map((c) => sub.indexOf(c)).join('')) : 1;
      cuenta[el] = (cuenta[el] ?? 0) + coef * n;
    }
  }
  return cuenta;
}

/** Registra cada valor que pinta el contador mientras corre la animación. */
async function vigilarContador(page: Page): Promise<void> {
  await contador(page).evaluate((el) => {
    const w = window as unknown as { __valoresContador: string[] };
    w.__valoresContador = [];
    new MutationObserver(() => w.__valoresContador.push(el.textContent ?? '')).observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
}

async function valoresContador(page: Page): Promise<number[]> {
  const textos = await page.evaluate(
    () => (window as unknown as { __valoresContador: string[] }).__valoresContador,
  );
  return textos.map((t) => Number(t.replace(/\./g, '')));
}

test.describe('CASO 1 · experimento con una sustancia normal', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('la ecuación de la catalasa está ajustada (H 4 = 4 · O 4 = 4)', async ({ page }) => {
    const ecuacion = page.getByText('→', { exact: true }).locator('xpath=..');
    const texto = ((await ecuacion.textContent()) ?? '').replace(/\s+/g, '');
    expect(texto).toBe('2H₂O₂→2H₂O+O₂');
    const [izquierda, derecha] = texto.split('→');
    expect(atomos(izquierda)).toEqual({ H: 4, O: 4 });
    expect(atomos(derecha)).toEqual({ H: 4, O: 4 });
  });

  test('«Patata cruda» → actividad 40, barra al 40 %, 5 burbujas y solo ella pulsada', async ({ page }) => {
    await sustancia(page, 'Patata cruda').click();
    await expect(sustancia(page, 'Patata cruda')).toHaveAttribute('aria-pressed', 'true');
    for (const otra of ['Hígado crudo', 'Hígado cocido', 'Solo agua']) {
      await expect(sustancia(page, otra)).toHaveAttribute('aria-pressed', 'false');
    }
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '40');
    // El formato de la cifra (con o sin espacio antes del %) lo vigila su HALLAZGO, abajo.
    await expect(cifraActividad(page)).toHaveText(/^40\s?%$/);
    // 12 × 0,40 = 4,8 → 5
    await expect(burbujasVaso(page)).toHaveCount(5);
    await expect(page.getByRole('img', { name: 'Vaso con Patata cruda' })).toBeVisible();
    // La barra tarda 0,5 s en llegar (transición de ancho). Un error sería 0,40 frente a 1,00.
    await expect.poll(() => anchoRelativo(page)).toBeCloseTo(0.4, 2);
  });

  test('las cuatro sustancias: barra = actividad / 100 y burbujas = round(12 × actividad / 100)', async ({ page }) => {
    const tabla: [string, number, number][] = [
      ['Hígado crudo', 100, 12],
      ['Patata cruda', 40, 5],
      ['Hígado cocido', 2, 0],
      ['Solo agua', 0, 0],
    ];
    for (const [nombre, actividad, burbujas] of tabla) {
      await sustancia(page, nombre).click();
      await expect(barra(page)).toHaveAttribute('aria-valuenow', String(actividad));
      await expect(burbujasVaso(page)).toHaveCount(burbujas);
      await expect.poll(() => anchoRelativo(page), { message: nombre }).toBeCloseTo(actividad / 100, 2);
    }
  });
});

test.describe('CASO 2 · el contador en su tope y los extremos del experimento', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('el contador sube a 40.000.000 sin pasarse, avisa del máximo y «Reiniciar» lo deja a 0', async ({ page }) => {
    await expect(contador(page)).toHaveText('0');
    await vigilarContador(page);
    await activar(page).click();
    await expect(contador(page)).toHaveText('40.000.000', { timeout: 6000 });
    await expect(page.getByText('¡Velocidad máxima!')).toBeVisible();
    await expect(burbujasTubo(page)).toHaveCount(8);
    const valores = await valoresContador(page);
    expect(Math.max(...valores)).toBe(40_000_000);
    for (let i = 1; i < valores.length; i++) expect(valores[i]).toBeGreaterThanOrEqual(valores[i - 1]);

    await reiniciar(page).click();
    await expect(contador(page)).toHaveText('0');
    await expect(burbujasTubo(page)).toHaveCount(0);
    await expect(page.getByText('¡Velocidad máxima!')).toHaveCount(0);
    await expect(activar(page)).toBeEnabled();
  });

  test('«Reiniciar» a mitad de la animación la para: el contador no vuelve a subir', async ({ page }) => {
    await activar(page).click();
    await expect.poll(async () => Number(((await contador(page).textContent()) ?? '0').replace(/\./g, ''))).toBeGreaterThan(0);
    await reiniciar(page).click();
    await page.waitForTimeout(2500); // más que los 2 s de la animación entera
    await expect(contador(page)).toHaveText('0');
  });

  test('«Solo agua» (control sin enzima) → actividad 0, barra vacía y ninguna burbuja', async ({ page }) => {
    await sustancia(page, 'Solo agua').click();
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '0');
    await expect(burbujasVaso(page)).toHaveCount(0);
    await expect.poll(() => anchoRelativo(page)).toBeCloseTo(0, 2);
  });
});

test.describe('CASO 3 · lo que se rechaza', () => {
  test('con la reacción activa, un segundo «Activar» no la reinicia', async ({ page }) => {
    await abrir(page);
    await activar(page).click();
    await expect(contador(page)).toHaveText('40.000.000', { timeout: 6000 });
    await expect(activar(page)).toBeDisabled();
    // Un clic sintético sobre el botón deshabilitado: React no debe atenderlo.
    await activar(page).dispatchEvent('click');
    await activar(page).click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(300);
    await expect(contador(page)).toHaveText('40.000.000');
  });
});

test.describe('Coherencia de las cifras del texto', () => {
  test('«~40.000 veces más rápida» = 40.000.000 / 1.000, y el FAQPage dice lo mismo que el contador', async ({ page }) => {
    await abrir(page);
    const tarjeta = page.getByText('Para contexto:').locator('xpath=..');
    await expect(tarjeta).toContainText('~1.000 reacciones/segundo');
    await expect(tarjeta).toContainText('40.000.000/segundo');
    expect(40_000_000 / 1_000).toBe(40_000);
    await expect(tarjeta).toContainText('~40.000 veces');
    const faq = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .join(' '),
    );
    expect(faq).toContain('40 millones de reacciones por segundo');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · «6 millones de moléculas por minuto» contradice los 40.000.000 por segundo', async ({ page }) => {
    // 40.000.000 /s × 60 s = 2.400.000.000 por minuto; «6 millones por minuto» son 100.000 /s,
    // 400 veces menos que la cifra del hero, del contador y del FAQPage. Pasa si la tarjeta
    // da una cifra que equivale a 40.000.000 por segundo, o si deja de dar una.
    test.fail();
    await abrir(page);
    const tarjeta = page.getByRole('heading', { name: 'La solución: catalasa', level: 3 }).locator('xpath=..');
    const texto = ((await tarjeta.textContent()) ?? '').replace(/\s+/g, ' ');
    const m = texto.match(/([\d.,]+)\s*millones de moléculas de H₂O₂ por (segundo|minuto)/);
    if (m) {
      const millones = Number(m[1].replace(/\./g, '').replace(',', '.'));
      const porSegundo = (millones * 1_000_000) / (m[2] === 'minuto' ? 60 : 1);
      expect(porSegundo).toBe(40_000_000);
    }
  });
});

test.describe('Hallazgos de contenido y aviso', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · la nota de seguridad del experimento se ve sin desplegar y pide no tocar los ojos', async ({ page }) => {
    // La app invita a hacer el experimento («uno de los más famosos de biología escolar») y su
    // única nota de seguridad vive DENTRO de <EducationalSection>, que nace plegada (CLAUDE.md,
    // «Estructura estándar»: nunca ocultar ahí una advertencia de responsabilidad). Además la
    // da por «segura» sin las precauciones de la ficha técnica del agua oxigenada al 3 % (CIMA
    // 40859, 4.4: «NO TRAGAR. Se debe evitar el contacto con los ojos.»).
    test.fail();
    const textos = await page
      .locator('[role="note"], [class*="isclaimer"]')
      .filter({ hasText: /agua oxigenada/i })
      .evaluateAll((els) => els.filter((e) => e.checkVisibility()).map((e) => e.textContent ?? ''));
    expect(textos.length, 'una nota visible sin desplegar la guía').toBeGreaterThan(0);
    expect(textos.join(' ')).toMatch(/ojos/i);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · «Cosmética» no da por probado que la catalasa frene las canas', async ({ page }) => {
    // La tarjeta afirma «La catalasa reduce el H₂O₂ que blanquea el cabello con la edad» como
    // efecto de productos anti-envejecimiento, y la guía de la propia app dice que el estudio
    // de 2009 solo «ha impulsado la investigación en tratamientos tópicos». Pasa si la tarjeta
    // lo presenta como línea de investigación, o si desaparece.
    test.fail();
    const tarjeta = page.getByRole('heading', { name: 'Cosmética', level: 3 }).locator('xpath=..');
    if ((await tarjeta.count()) > 0) {
      await expect(tarjeta).toContainText(/investig|en estudio|no demostrad|sin eficacia/i);
    }
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · los porcentajes y los grados llevan espacio duro («40 %», «55 °C»)', async ({ page }) => {
    // CLAUDE.md global §2 (decidido el 25/09/2026, Ortografía de la RAE 2010): «15 %» con
    // U+00A0. La app pega el símbolo: «40%», «0%/50%/100%» en la escala, «(3-6%)» en la nota
    // y «~55°C» y «>80°C» en la tarjeta de temperatura y en la explicación del hígado cocido.
    test.fail();
    await sustancia(page, 'Patata cruda').click();
    await expect(cifraActividad(page)).toHaveText('40 %');
    const escala = barra(page).locator('xpath=following-sibling::div[1]').locator('span');
    await expect(escala).toHaveText(['0 %', '50 %', '100 %']);
    // Solo el texto de la app: sus secciones y su guía (las relacionadas y el pie, fuera).
    const todo = await page.evaluate(() =>
      Array.from(document.querySelectorAll('section:not([aria-label="Aplicaciones relacionadas"]), [data-guia-educativa]'))
        .map((n) => n.textContent ?? '')
        .join(' '),
    );
    expect(todo).not.toMatch(/\d%|\d°C/);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el JSON-LD lista sus características y no corta la descripción', async ({ page }) => {
    // metadata.ts: `features: []` (CLAUDE.md §1.ter pide 4-8) y la description del jsonLd acaba
    // en «…y sus usos», cortada respecto a la de la metadata («…y sus usos industriales.»).
    test.fail();
    const app = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
        const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
        for (const n of nodos) if (n['@type'] === 'WebApplication') return n;
      }
      return null;
    });
    expect(app).not.toBeNull();
    const caracteristicas = (app?.featureList as string[] | undefined) ?? [];
    expect(caracteristicas.length).toBeGreaterThanOrEqual(4);
    expect(String(app?.description ?? '')).not.toMatch(/sus usos$/);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · las preguntas del FAQPage están en la página', async ({ page }) => {
    // El faqJsonLd trae 5 preguntas y la página no pinta ninguna FAQ: §1.ter pide que salgan de
    // PREGUNTAS_FRECUENTES, que page.tsx importa para pintarlas (cabo C0593).
    test.fail();
    await comprobarFaqPageUnico(page);
  });
});

test.describe('Hallazgos de accesibilidad', () => {
  test('HALLAZGO (09/11/2026, ABIERTO) · activar con el teclado no pierde el foco y el nombre dice lo que se ve', async ({ page }) => {
    // Al pulsar Intro, «Activar» se deshabilita con el foco dentro y este cae a <body>; y su
    // aria-label sigue diciendo «Activar reacción de la catalasa» mientras el texto visible es
    // «Reacción activa» (WCAG 2.5.3, la etiqueta visible debe estar en el nombre accesible).
    test.fail();
    await abrir(page);
    await activar(page).focus();
    await page.keyboard.press('Enter');
    await expect(contador(page)).not.toHaveText('0');
    const foco = await page.evaluate(() => document.activeElement?.tagName ?? 'BODY');
    expect(foco, 'el foco sigue en un control').not.toBe('BODY');
    const primero = page.getByText('Reacciones por segundo:', { exact: true }).locator('xpath=../..').getByRole('button').first();
    const visible = ((await primero.innerText()) ?? '').replace(/[^\p{L}\p{N}\s]/gu, '').trim();
    await expect(primero).toHaveAccessibleName(new RegExp(visible, 'i'));
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el contador no lanza 80 anuncios al lector de pantalla', async ({ page }) => {
    // El número lleva aria-live="polite" y cambia 80 veces en 2 s (de 500.000 en 500.000): el
    // lector encola cifras intermedias. Lo esperado es anunciar el resultado final (o marcar
    // aria-busy mientras anima). Se cuentan los cambios dentro de una región viva no ocupada.
    test.fail();
    await abrir(page);
    await page.evaluate(() => {
      const w = window as unknown as { __anuncios: number };
      w.__anuncios = 0;
      new MutationObserver((ms) => {
        for (const m of ms) {
          const nodo = m.target.nodeType === 1 ? (m.target as Element) : m.target.parentElement;
          const viva = nodo?.closest('[aria-live]');
          if (viva && viva.getAttribute('aria-live') !== 'off' && !nodo?.closest('[aria-busy="true"]')) {
            w.__anuncios++;
          }
        }
      }).observe(document.body, { childList: true, characterData: true, subtree: true });
    });
    await activar(page).click();
    await expect(contador(page)).toHaveText('40.000.000', { timeout: 6000 });
    const anuncios = await page.evaluate(() => (window as unknown as { __anuncios: number }).__anuncios);
    expect(anuncios).toBeLessThanOrEqual(3);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · en oscuro el subtítulo del hero llega a 4,5:1 en todo el renglón', async ({ page }) => {
    // En oscuro el módulo cambia var(--hero-bg) por un degradado #1a5f7a → #2a7a77, y la línea
    // «40 millones de reacciones por segundo…» (15,2 px, peso 400, opacidad 0,82) baja a
    // 4,11:1 en su tramo más claro a 390 px (4,25 a 1280). Con var(--hero-bg) da 6,21:1.
    test.fail();
    await page.addInitScript(() => localStorage.setItem('meskeia-theme', 'dark'));
    await page.setViewportSize({ width: 390, height: 844 });
    await abrir(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const linea = page.locator('header').getByText(/millones de reacciones por segundo/);
    const opacidad = Number(await linea.evaluate((e) => getComputedStyle(e).opacity));
    const color = await linea.evaluate((e) => getComputedStyle(e).color);
    expect(color).toBe('rgb(255, 255, 255)');
    const renglones = await linea.evaluate((e) => {
      const r = document.createRange();
      r.selectNodeContents(e);
      return Array.from(r.getClientRects()).map((c) => ({ x: c.x, y: c.y, width: c.width, height: c.height }));
    });
    await linea.evaluate((e) => {
      (e as HTMLElement).style.visibility = 'hidden';
    });
    let minimo = Infinity;
    for (const clip of renglones) {
      const png = (await page.screenshot({ clip })).toString('base64');
      const peor = await page.evaluate(
        async ({ b64, a }) => {
          const img = new Image();
          img.src = 'data:image/png;base64,' + b64;
          await img.decode();
          const lienzo = document.createElement('canvas');
          lienzo.width = img.width;
          lienzo.height = img.height;
          const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
          ctx.drawImage(img, 0, 0);
          const d = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
          const f = (v: number) => {
            const x = v / 255;
            return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          };
          const lum = (r: number, g: number, b: number) => 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
          let peor = Infinity;
          for (let i = 0; i < d.length; i += 4) {
            const fondo = [d[i], d[i + 1], d[i + 2]];
            const texto = fondo.map((v) => 255 * a + v * (1 - a));
            const l1 = lum(texto[0], texto[1], texto[2]);
            const l2 = lum(fondo[0], fondo[1], fondo[2]);
            peor = Math.min(peor, (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
          }
          return peor;
        },
        { b64: png, a: opacidad },
      );
      minimo = Math.min(minimo, peor);
    }
    expect(minimo).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('sin desborde lateral, botones de 44 px o más y la reacción y el selector responden al toque', async ({ page }) => {
    await abrir(page);
    const anchos = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(anchos[0]).toBeLessThanOrEqual(anchos[1]);
    for (const nombre of ['Hígado crudo', 'Patata cruda', 'Hígado cocido', 'Solo agua']) {
      const caja = await sustancia(page, nombre).boundingBox();
      expect(caja?.height ?? 0, nombre).toBeGreaterThanOrEqual(44);
    }
    await sustancia(page, 'Hígado cocido').tap();
    await expect(sustancia(page, 'Hígado cocido')).toHaveAttribute('aria-pressed', 'true');
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '2');
    await expect(burbujasVaso(page)).toHaveCount(0);
    await activar(page).tap();
    await expect(contador(page)).toHaveText('40.000.000', { timeout: 6000 });
    const caja = await reiniciar(page).boundingBox();
    expect(caja?.height ?? 0).toBeGreaterThanOrEqual(44);
    await reiniciar(page).tap();
    await expect(contador(page)).toHaveText('0');
  });
});
