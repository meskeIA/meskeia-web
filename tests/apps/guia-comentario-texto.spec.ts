import { test, expect, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — guia-comentario-texto (segmento INTERACTIVA sin número, riesgo 3)
 *
 * Primera inspección: 06/10/2026. Entró por delante de la cola por la sospecha del 01/10 en
 * `_private/inspector/SOSPECHAS.md`: desde el 29/09 la Ronda avisa cada noche de que «en
 * tableta vertical (800 px) el logo o el botón de tema tapan el título», y era la única URL
 * del catálogo con ese aviso.
 *
 * CONFIRMADA, con causa: el hero no deja arriba el hueco de 80 px de la plantilla. Su texto
 * empieza en y = 56 (margin-top 1rem del .hero + padding-top 2,5rem), y desde 769 px la barra
 * fija de MeskeiaLogo llega hasta y = 77 (padding 15 + píldora de 62). El lote del hero
 * (586a4d61, d056b066 y a1d72a9c, 187 apps) no la incluyó porque a 390 px su título queda
 * 0,4 px por debajo de la barra móvil (52-54 px) y la Ronda solo medía 390, 1024 y 1280; el
 * ancho de 800 px entró en la Ronda en el MISMO commit a1d72a9c (28/09 18:03), y la ronda del
 * 28/09 todavía no lo medía. d608b1ac (tokens --radius-large y --shadow-*) no tiene nada que
 * ver: este módulo no usa ninguno, y anulándolos en el navegador el tramo tapado es idéntico.
 *
 * Los casos son de operativa, no de cálculo: la app no calcula nada. Lo que tiene verdad
 * comprobable es su contenido (métrica de la Rima IV de Bécquer, cotejada con dos ediciones
 * de Wikisource) y la geometría del título.
 */

const RUTA = '/guia-comentario-texto/';

/**
 * El criterio exacto de la Ronda (`tituloTapado` de scripts/ronda.mjs): la barra fija con
 * enlace a la home, sus hijos (logo y botón de tema) y las cajas del TEXTO del <h1>.
 * Devuelve las letras del <h1> que pisa alguna pieza ('' si ninguna).
 */
async function letrasTapadas(page: Page): Promise<string> {
  return page.evaluate(() => {
    const barra = Array.from(document.querySelectorAll('body *')).find((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return (
        cs.position === 'fixed' &&
        r.top <= 1 &&
        r.height < 120 &&
        r.width > 300 &&
        e.querySelector('a[href="/"], a[href="https://meskeia.com/"]') !== null
      );
    });
    const h1 = document.querySelector('h1');
    if (!barra || !h1) throw new Error('Falta la barra fija del logo o el <h1>');
    const piezas = Array.from(barra.children)
      .map((c) => c.getBoundingClientRect())
      .filter((c) => c.width > 0);
    let tapadas = '';
    for (const nodo of Array.from(h1.childNodes)) {
      if (nodo.nodeType !== Node.TEXT_NODE) continue;
      const texto = nodo as Text;
      for (let k = 0; k < texto.length; k++) {
        const r = document.createRange();
        r.setStart(texto, k);
        r.setEnd(texto, k + 1);
        const c = r.getBoundingClientRect();
        if (c.width === 0) continue;
        const pisa = piezas.some(
          (p) => !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom),
        );
        if (pisa) tapadas += texto.data[k];
      }
    }
    return tapadas;
  });
}

/** Contraste WCAG entre el color del texto y el fondo OPACO del propio elemento. */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const rgb = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const lum = (c: number[]): number => {
      const f = (v: number): number => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const cs = getComputedStyle(el);
    const a = lum(rgb(cs.color));
    const b = lum(rgb(cs.backgroundColor));
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

async function abrir(page: Page, ancho: number, alto: number): Promise<void> {
  // Sin transiciones (globals.css las deja en 0,01 ms): la píldora del logo anima su tamaño
  // 0,3 s al cruzar los 768 px, y medirla a medio crecer da un tramo falso.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: ancho, height: alto });
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Comentario de Texto Literario');
  // Antes del primer clic: la app no tiene inputs que sirvan de testigo a esperarHidratacion.
  await esperarPaginaAsentada(page);
}

async function pasarAOscuro(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

// ─────────────────────────────────────────────────────────────────────────────
// CASO 1 — el título bajo la barra fija del logo
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CASO 1 — título tapado por la barra del logo', () => {
  /**
   * REPARADO el 06/10/2026 (hallazgo del Inspector del 06/10/2026: título tapado de 769 a 926 px).
   * Esperado, del CSS: >= 769 px la barra llega a y = 77 y el texto del h1 empieza en y = 53-56,
   * así que hay solape vertical; el horizontal depende del ancho del título centrado, que crece
   * con 4vw: a 800 px (letra de 32 px) empieza en x = 175 y la píldora acaba en x = 203.
   * Barrido 769-1023 de uno en uno: tapado de 769 a 926 («C» o «Co»); libre desde 927, donde la
   * primera letra ya empieza en x = 203. El botón de tema (x de W-64 a W-20) no toca nunca.
   * Obtenido el 06/10: 769 «Co» · 800 «Co» · 834 «C» · 900 «C» · 926 «C».
   */
  test('de 769 a 926 px ninguna pieza de la barra pisa las letras del h1', async ({ page }) => {
    await abrir(page, 800, 1112);
    const tapados: string[] = [];
    for (const ancho of [769, 800, 834, 900, 926]) {
      await page.setViewportSize({ width: ancho, height: 1112 });
      const letras = await letrasTapadas(page);
      if (letras) tapados.push(`${ancho}: «${letras}»`);
    }
    expect(tapados).toEqual([]);
  });

  /**
   * Controles que hoy pasan y deben seguir pasando: a <= 768 px la barra móvil acaba en
   * y = 52-54 y el h1 empieza en y = 54 (0,4 px de holgura a 390); desde 927 px el título ya
   * empieza a la derecha de la píldora (x >= 203). 1024 y 1280 son los anchos de la Ronda.
   */
  test('a 390, 768, 927, 1024 y 1280 px el título queda libre', async ({ page }) => {
    await abrir(page, 390, 844);
    for (const [ancho, alto] of [
      [390, 844],
      [768, 1112],
      [927, 1112],
      [1024, 768],
      [1280, 900],
    ]) {
      await page.setViewportSize({ width: ancho, height: alto });
      expect(await letrasTapadas(page), `a ${ancho} px`).toBe('');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 2 — uso normal: pestañas, plantillas y el ejemplo trabajado de Bécquer
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CASO 2 — uso normal en escritorio (1280 px)', () => {
  /**
   * Esperado, contado en page.tsx: 5 pestañas; «Metodología» abierta con 7 pasos; Plantillas
   * con 6 bloques y 4+4+4+4+5+5 = 26 botones; el primero copia la frase literal de Localización
   * y su rótulo pasa a «✓ Copiado» y vuelve a «Copiar» a los 1,8 s (setTimeout de la app).
   */
  test('Plantillas: 6 bloques, 26 frases y «Copiar» deja la frase literal en el portapapeles', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
      origin: 'http://localhost:3050',
    });
    await abrir(page, 1280, 900);
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(5);
    await expect(page.getByRole('tab', { name: 'Metodología' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel').locator('h3')).toHaveCount(7);

    await page.getByRole('tab', { name: 'Plantillas' }).click();
    await expect(page.getByRole('tab', { name: 'Plantillas' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: 'Metodología' })).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByRole('tabpanel').locator('h3')).toHaveText([
      /Localización/,
      /Tema/,
      /Estructura externa/,
      /Estructura interna/,
      /Recursos estilísticos/,
      /Conclusión/,
    ]);
    const copiar = page.getByRole('tabpanel').getByRole('button');
    await expect(copiar).toHaveCount(26);

    const primero = copiar.first();
    await primero.click();
    await expect(primero).toHaveText('✓ Copiado');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'El texto que vamos a comentar es un fragmento de [obra], escrita por [autor] en [año/período].',
    );
    await expect(primero).toHaveText('Copiar', { timeout: 4000 });
  });

  /**
   * Control del ejemplo trabajado. Hasta el 06/10/2026 la pestaña enseñaba los 12 primeros
   * versos como si fueran el poema; desde la reparación publica la Rima IV entera (Wikisource,
   * «Rimas (Bécquer, 1885)/Rima IV»): 36 versos, «¡habrá poesía!» en 12, 20, 28 y 36 (y sin
   * exclamación en el 4), y «mientras» abriendo los impares del 5 al 35 salvo el 15 («y en el
   * mar o en el cielo haya un abismo»).
   */
  test('Poesía: los 36 versos de la Rima IV, estribillo y anáfora de «mientras»', async ({ page }) => {
    await abrir(page, 1280, 900);
    await page.getByRole('tab', { name: 'Poesía' }).click();
    const versos = await page
      .locator('[class*="poemaVersos"] p')
      .evaluateAll((ps) => ps.map((p) => (p.textContent ?? '').replace(/ /g, '').trim()).filter(Boolean));
    expect(versos).toHaveLength(36);
    const conMientras = versos
      .map((v, i) => (/^mientras/i.test(v) ? i + 1 : 0))
      .filter((n) => n > 0);
    expect(conMientras).toEqual([5, 7, 9, 11, 13, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]);
    const estribillo = versos
      .map((v, i) => (/^¡?habrá poesía/i.test(v) ? i + 1 : 0))
      .filter((n) => n > 0);
    expect(estribillo).toEqual([4, 12, 20, 28, 36]);
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo del 06/10/2026, contenido: «habrá poesía» no es 6+1).
   * ha-brá-po-e-sí-a = 6 sílabas fonológicas (5 con sinéresis po-e). «poesía» es LLANA
   * (po-e-SÍ-a), y la ley del acento final solo suma una sílaba si el verso acaba en aguda
   * (es.wikipedia «Métrica», sección del cómputo silábico): llana, ni se suma ni se resta.
   * Esperado: 6 (o 5); la app dice «6+1=7 sílabas» y lo cuenta como heptasílabo.
   */
  test('la métrica de «habrá poesía» no suma la sílaba de la palabra aguda', async ({ page }) => {
    await abrir(page, 1280, 900);
    await page.getByRole('tab', { name: 'Poesía' }).click();
    const fila = page.locator('[class*="metricaFila"]').filter({ hasText: '«habrá poesía»' });
    await expect(fila).toHaveCount(1);
    await expect(fila).not.toContainText('6+1=7');
    await expect(fila).toContainText('6 sílabas');
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo del 06/10/2026, contenido: la Rima IV tiene 36 versos).
   * Wikisource, «Rimas (Bécquer, 1885)/Rima IV» y «Rimas (Bécquer, 1925)/Rima 4»: nueve
   * cuartetas, 36 versos, con «¡Habrá poesía!» cerrando los vv. 12, 20, 28 y 36. La app enseña
   * los 12 primeros sin decir que es un fragmento y afirma que la estructura externa es «tres
   * estrofas de 4 versos cada una (4+4+4)».
   */
  test('la estructura externa no presenta 12 de 36 versos como el poema entero', async ({ page }) => {
    await abrir(page, 1280, 900);
    await page.getByRole('tab', { name: 'Poesía' }).click();
    const externa = page.getByText('Estructura externa:').locator('..');
    await expect(externa).not.toContainText('tres estrofas de 4 versos cada una (4+4+4)');
    await expect(externa).toContainText('36 versos');
    await expect(externa).toContainText('nueve estrofas');
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo del 06/10/2026, contenido: la PAES no tiene comentario de texto).
   * DEMRE, «Temario de la PAES Regular obligatoria de Competencia Lectora» (19/03/2026):
   * «Esta prueba consta de 7 textos y 65 preguntas de selección múltiple con respuesta única
   * de 4 opciones». No hay prueba de «Lengua Castellana» ni comentario escrito.
   */
  test('no atribuye a la PAES un comentario de texto obligatorio', async ({ page }) => {
    await abrir(page, 1280, 900);
    const html = await page.content();
    expect(html).not.toContain('obligatorio en la EBAU/PAES de Lengua Castellana');
    expect(html).not.toContain('tu comunidad autónoma');
    expect(html).not.toContain('En muchas CCAA');
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo del 06/10/2026, contenido: el FAQPage cuenta otros 7 pasos).
   * La pestaña Metodología numera: 1 lectura · 2 localización · 3 tema · 4 estructura ·
   * 5 análisis métrico (poesía) / narrativo (prosa) · 6 recursos · 7 conclusión y valoración.
   * La respuesta 1 del FAQPage junta 5 y 6 («estudio de la forma y recursos estilísticos») y
   * parte el 7 en dos («valoración crítica personal y conclusión»): el análisis métrico, que
   * la propia guía llama «la parte más mecánica», no aparece. Esperado: la respuesta lo nombra.
   */
  test('la respuesta 1 del FAQPage enumera los mismos 7 pasos que la página', async ({ page }) => {
    await abrir(page, 1280, 900);
    const respuesta = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const d = JSON.parse(s.textContent ?? '{}') as {
          '@type'?: string;
          mainEntity?: { acceptedAnswer: { text: string } }[];
        };
        if (d['@type'] === 'FAQPage' && d.mainEntity) return d.mainEntity[0].acceptedAnswer.text;
      }
      return '';
    });
    expect(respuesta).toContain('7 pasos');
    expect(respuesta).toMatch(/métric/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 3 — móvil (390 px), teclado y contraste
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CASO 3 — móvil, teclado y contraste', () => {
  /**
   * REPARADO el 06/10/2026 (hallazgo del 06/10/2026, accesibilidad: pestañas sin nombre en móvil).
   * Hasta 768 px el CSS pone `.tabNombre { display: none }` y el icono va con aria-hidden: el
   * nombre accesible de las cinco pestañas queda VACÍO. Esperado: cada pestaña se llama como
   * en escritorio. Obtenido el 06/10: `tablist "Secciones de la guía"` con 5 `tab` sin nombre.
   */
  test('a 390 px las cinco pestañas conservan su nombre accesible', async ({ page }) => {
    await abrir(page, 390, 844);
    await expect(page.getByRole('tab')).toHaveCount(5);
    for (const nombre of ['Metodología', 'Poesía', 'Prosa narrativa', 'Vocabulario técnico', 'Plantillas']) {
      await expect(page.getByRole('tab', { name: nombre, exact: true }), nombre).toHaveCount(1);
    }
  });

  /**
   * Control a 390 px que hoy pasa: tocar la pestaña Plantillas la abre, y ningún elemento del
   * panel desborda el ancho de la pantalla en ninguna de las cinco pestañas.
   */
  test('a 390 px cada pestaña abre su panel sin desbordar el ancho', async ({ page }) => {
    await abrir(page, 390, 844);
    const tabs = page.getByRole('tab');
    for (let i = 0; i < 5; i++) {
      await tabs.nth(i).click();
      await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
      const desbordes = await page.evaluate(() => {
        const ancho = document.documentElement.clientWidth;
        return Array.from(document.querySelectorAll('[role=tabpanel] *')).filter((e) => {
          const r = e.getBoundingClientRect();
          if (!r.width || r.right <= ancho + 0.5) return false;
          for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === 'auto' || ox === 'scroll') return false;
          }
          return true;
        }).length;
      });
      expect(desbordes, `pestaña ${i + 1}`).toBe(0);
    }
    await expect(page.getByRole('tabpanel').getByRole('button')).toHaveCount(26);
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo del 06/10/2026, accesibilidad: teclado del tablist).
   * Patrón de pestañas de WAI-ARIA APG: con el foco en una pestaña, la flecha derecha lleva a la
   * siguiente. Esperado: foco en «Poesía». Obtenido: sigue en «Metodología» (no hay manejador;
   * tampoco aria-controls ni nombre en el tabpanel).
   */
  test('la flecha derecha pasa de «Metodología» a «Poesía»', async ({ page }) => {
    await abrir(page, 1280, 900);
    await page.getByRole('tab', { name: 'Metodología' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Poesía' })).toBeFocused();
    await expect(page.getByRole('tab', { name: 'Poesía' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: 'Plantillas' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Metodología' })).toBeFocused();
    // Tabindex itinerante: solo la pestaña activa está en la secuencia de Tab
    await expect(page.locator('[role=tab][tabindex="0"]')).toHaveCount(1);
    // El panel se nombra por su pestaña y las pestañas lo controlan
    await expect(page.getByRole('tabpanel', { name: 'Metodología' })).toHaveCount(1);
    await expect(page.getByRole('tab', { name: 'Poesía' })).toHaveAttribute('aria-controls', 'panel-guia');
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo del 06/10/2026, contraste de la pestaña activa en oscuro).
   * `[data-theme='dark'] .tabBtn { color: #b0b0b0 }` (0,2,0) gana a `.tabBtnActive { color:
   * #fff }` (0,1,0): el rótulo de la pestaña activa queda #B0B0B0 sobre #3FA5D1 = 1,29:1.
   * Esperado >= 4,5:1 (texto de 13,6-14,4 px).
   */
  test('en oscuro la pestaña activa llega a 4,5:1', async ({ page }) => {
    await abrir(page, 1280, 900);
    await pasarAOscuro(page);
    expect(await contraste(page, '[role=tab][aria-selected=true]')).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * REPARADO el 06/10/2026 (hallazgo del 06/10/2026, contraste de las cabeceras por clase).
   * `.plantillaTitulo`: blanco sobre var(--secondary) = #48A9A6 → 2,80:1 en claro (#5ABDB9 →
   * 2,23:1 en oscuro), texto de 15,2 px en negrita. Esperado >= 4,5:1 (--secondary-boton da
   * 5,15:1). Lo mismo en `.analisisTitulo` y `.vocCatTitulo` sobre var(--primary): 4,11:1 y 2,79:1.
   */
  /**
   * REPARADO el 06/10/2026 (hallazgo del 06/10/2026, accesibilidad: «Copiado» no se anuncia).
   * Los 26 botones llevan aria-label «Copiar frase de <bloque>» (cuatro o cinco iguales por
   * bloque) y el aria-label manda sobre el contenido: al copiar, el rótulo visible pasa a
   * «✓ Copiado» pero el nombre accesible no cambia y no hay región viva. Esperado: tras el clic,
   * un lector de pantalla puede leer «Copiado». Obtenido: nombre «Copiar frase de Localización».
   */
  test('tras copiar, el estado «Copiado» llega al nombre accesible o a una región viva', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
      origin: 'http://localhost:3050',
    });
    await abrir(page, 1280, 900);
    await page.getByRole('tab', { name: 'Plantillas' }).click();
    await page.getByRole('tabpanel').getByRole('button').first().click();
    await expect(page.getByRole('tabpanel').getByRole('button').first()).toHaveText('✓ Copiado');
    const anunciado =
      (await page.getByRole('tabpanel').getByRole('button', { name: /copiad[oa]/i }).count()) +
      (await page.locator('[aria-live], [role=status]').filter({ hasText: /copiad[oa]/i }).count());
    expect(anunciado).toBeGreaterThan(0);
  });

  test('las cabeceras de bloque con fondo de marca llegan a 4,5:1', async ({ page }) => {
    await abrir(page, 1280, 900);
    await page.getByRole('tab', { name: 'Plantillas' }).click();
    expect(await contraste(page, '[class*="plantillaTitulo"]')).toBeGreaterThanOrEqual(4.5);
    // La pestaña recién pulsada anima fondo y color 0,18 s desde el estado :hover: se mide al asentarse
    await expect
      .poll(() => contraste(page, '[role=tab][aria-selected=true]'))
      .toBeGreaterThanOrEqual(4.5);
    await page.getByRole('tab', { name: 'Poesía' }).click();
    expect(await contraste(page, '[class*="analisisTitulo"]')).toBeGreaterThanOrEqual(4.5);
    await page.getByRole('tab', { name: 'Vocabulario técnico' }).click();
    expect(await contraste(page, '[class*="vocCatTitulo"]')).toBeGreaterThanOrEqual(4.5);
    await pasarAOscuro(page);
    expect(await contraste(page, '[class*="vocCatTitulo"]')).toBeGreaterThanOrEqual(4.5);
    await page.getByRole('tab', { name: 'Plantillas' }).click();
    expect(await contraste(page, '[class*="plantillaTitulo"]')).toBeGreaterThanOrEqual(4.5);
  });
});
