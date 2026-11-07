import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado, leerValorEnReact } from './_hidratacion';

/**
 * Simulador de Balance de Blancos — Inspector, 07/11/2026 (PRIMERA inspección)
 *
 * Qué promete: mover el balance de blancos (WB) de 2500 a 10.000 K sobre tres escenas con luz
 * distinta (tungsteno 3200 K, nublado 6500 K, atardecer 3500 K) y leer si la foto sale neutra,
 * naranja o azul, con qué intensidad y si se recupera en edición.
 *
 * De dónde sale cada esperado (calculado ANTES de mirar la app):
 *   · Diferencia = WB elegido − WB correcto de la escena (la app no declara otra fórmula).
 *   · Dirección (física y bloque educativo de la propia app): WB POR ENCIMA de la luz real → la
 *     cámara cree que la luz es más azul de lo que es, añade naranja → foto cálida; POR DEBAJO → azul.
 *   · Cortes que declara el código (clasificarBalance y la «Lectura de la imagen»):
 *     |Δ| ≤ 200 neutro · etiqueta «Ligeramente» hasta 1500 y «Demasiado» por encima ·
 *     intensidad Suave ≤ 800, Notable ≤ 2000, Muy fuerte > 2000 · recuperable fácil ≤ 1500,
 *     «En RAW sí; en JPEG con pérdida» ≤ 3000, «Solo en RAW y con esfuerzo» > 3000.
 *   · Velo de la escena: opacidad = min(0,55, |Δ|/3500 × 0,55), naranja #fb923c o azul #3b82f6.
 *   · Mired = 10⁶ / K: la escala en la que un mismo salto se percibe igual (por eso los filtros
 *     CTO/CTB se gradúan en mireds y no en kelvin).
 *   · es-ES no agrupa cuatro cifras («2300 K») y sí cinco («10.000 K»).
 *
 * Los `test.fail()` son hallazgos ABIERTOS de esta inspección: afirman lo correcto y hoy fallan.
 * Cada uno tiene un caso hermano en verde que garantiza que sus anclas existen (C0386).
 */

const RUTA = '/simulador-balance-blancos/';
const DESLIZADOR = '#wb-slider';

const insignia = (page: Page) => page.locator('label[for="wb-slider"] [class*="valueBadge"]');
const diferencia = (page: Page) => page.locator('[class*="balanceTitle"]');
const etiqueta = (page: Page) => page.locator('[class*="balanceLabel"]');
const velo = (page: Page) => page.locator('svg[class*="escenaSvg"] > rect[pointer-events="none"]');
const fila = (page: Page, rotulo: string) =>
  page.locator('[class*="resultRow"]').filter({ hasText: rotulo }).locator('[class*="resultValue"]');

interface Lectura {
  valor: string;
  diferencia: string;
  etiqueta: string;
  tinte: string;
  intensidad: string;
  blanco: string;
  recuperable: string;
}

/** Espera a que la pantalla diga exactamente esto (con reintento: el render va tras el evento). */
async function esperarLectura(page: Page, l: Lectura): Promise<void> {
  await expect(insignia(page)).toHaveText(l.valor);
  await expect(diferencia(page)).toHaveText(`Diferencia con el WB correcto: ${l.diferencia}`);
  await expect(etiqueta(page)).toHaveText(l.etiqueta);
  await expect(fila(page, 'Tinte dominante')).toHaveText(l.tinte);
  await expect(fila(page, 'Intensidad del tinte')).toHaveText(l.intensidad);
  await expect(fila(page, 'Aspecto del blanco')).toHaveText(l.blanco);
  await expect(fila(page, '¿Recuperable en edición?')).toHaveText(l.recuperable);
}

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Simulador de Balance de Blancos');
  await esperarHidratacion(page, [DESLIZADOR]);
}

const NEUTRA = {
  etiqueta: '✅ Balance correcto',
  tinte: 'Neutro (sin dominante)',
  intensidad: 'Imperceptible',
  blanco: 'Blanco neutro',
  recuperable: 'Sí, fácilmente (sobre todo en RAW)',
};

interface PreguntaLd {
  name: string;
  acceptedAnswer: { text: string };
}

async function faqPage(page: Page): Promise<PreguntaLd[]> {
  for (const bloque of await page.locator('script[type="application/ld+json"]').allTextContents()) {
    const datos = JSON.parse(bloque) as { '@type'?: string; mainEntity?: PreguntaLd[] };
    if (datos['@type'] === 'FAQPage' && datos.mainEntity) return datos.mainEntity;
  }
  throw new Error('La página no lleva FAQPage');
}

test.describe('Simulador de balance de blancos · escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · tungsteno con el preset Luz día: +2300 K, naranja muy fuerte', async ({ page }) => {
    // Luz 3200 K, WB 5500 K → Δ = 5500 − 3200 = +2300 K. WB por encima → naranja.
    // 2300 > 1500 → «Demasiado cálido» · 2300 > 2000 → «Muy fuerte» · 1500 < 2300 ≤ 3000 →
    // «En RAW sí; en JPEG con pérdida». Lo mismo que dice la FAQ visible («la diferencia de
    // 2300K genera un dominante naranja muy fuerte»).
    await esperarLectura(page, { valor: '3200 K', diferencia: '0 K', ...NEUTRA });
    await page.getByRole('button', { name: /^Luz día/ }).click();
    await esperarLectura(page, {
      valor: '5500 K',
      diferencia: '+2300 K',
      etiqueta: 'Demasiado cálido (muy naranja)',
      tinte: 'Naranja / cálido',
      intensidad: 'Muy fuerte',
      blanco: 'Blanco amarillento',
      recuperable: 'En RAW sí; en JPEG con pérdida',
    });
    // Velo: 2300/3500 × 0,55 = 0,36143, naranja
    await expect(velo(page)).toHaveCount(1);
    await expect(velo(page)).toHaveAttribute('fill', '#fb923c');
    expect(Number(await velo(page).getAttribute('opacity'))).toBeCloseTo(0.36143, 3);
    // Marcadores: (5500 − 2500)/7500 = 40 % · correcto (3200 − 2500)/7500 = 9,333 %
    const pos = await page.evaluate(() => ({
      actual: parseFloat((document.querySelector('[class*="balanceMarker"]') as HTMLElement).style.left),
      correcto: parseFloat((document.querySelector('[class*="balanceTarget"]') as HTMLElement).style.left),
    }));
    expect(pos.actual).toBeCloseTo(40, 2);
    expect(pos.correcto).toBeCloseTo(9.333, 2);
  });

  test('CASO 2 (límite) · neutro exacto, extremo inferior y el corte de ±200 K', async ({ page }) => {
    // Nublado: al cambiar de escena el WB vuelve al correcto (6500 K) → Δ = 0, sin velo
    await page.getByRole('tab', { name: /Día nublado/ }).click();
    await esperarLectura(page, { valor: '6500 K', diferencia: '0 K', ...NEUTRA });
    await expect(velo(page)).toHaveCount(0);

    // Inicio del deslizador con el teclado: 2500 K → Δ = 2500 − 6500 = −4000 K, azul.
    // 4000 > 3000 → «Solo en RAW y con esfuerzo». Velo: 4000/3500 > 1 → tope 0,55
    await page.locator(DESLIZADOR).focus();
    await page.keyboard.press('Home');
    await esperarLectura(page, {
      valor: '2500 K',
      diferencia: '-4000 K',
      etiqueta: 'Demasiado frío (muy azul)',
      tinte: 'Azul / frío',
      intensidad: 'Muy fuerte',
      blanco: 'Blanco azulado',
      recuperable: 'Solo en RAW y con esfuerzo',
    });
    await expect(velo(page)).toHaveAttribute('fill', '#3b82f6');
    expect(Number(await velo(page).getAttribute('opacity'))).toBeCloseTo(0.55, 3);

    // Corte de ±200 K en tungsteno: 3400 (Δ +200) sigue neutro; 3500 (Δ +300) ya es cálido suave
    await page.getByRole('tab', { name: /Interior tungsteno/ }).click();
    await sembrarValor(page, DESLIZADOR, 3400);
    await esperarLectura(page, { valor: '3400 K', diferencia: '+200 K', ...NEUTRA });
    await sembrarValor(page, DESLIZADOR, 3500);
    await esperarLectura(page, {
      valor: '3500 K',
      diferencia: '+300 K',
      etiqueta: 'Ligeramente cálido',
      tinte: 'Naranja / cálido',
      intensidad: 'Suave',
      blanco: 'Blanco amarillento',
      recuperable: 'Sí, fácilmente (sobre todo en RAW)',
    });
  });

  test('CASO 3 (se acota) · fuera de rango y fuera de paso: 12.000 → 10.000, 1000 → 2500, 2550 → 2600', async ({
    page,
  }) => {
    // El deslizador va de 2500 a 10.000 en pasos de 100: lo de fuera se recorta al extremo y un
    // valor entre pasos va al más cercano (en el empate, al mayor: regla HTML del step).
    expect(await sembrarValorAcotado(page, DESLIZADOR, 12000)).toBe('10000');
    // Tungsteno: Δ = 10.000 − 3200 = +6800 K; cinco cifras → «10.000 K» en la insignia
    await esperarLectura(page, {
      valor: '10.000 K',
      diferencia: '+6800 K',
      etiqueta: 'Demasiado cálido (muy naranja)',
      tinte: 'Naranja / cálido',
      intensidad: 'Muy fuerte',
      blanco: 'Blanco amarillento',
      recuperable: 'Solo en RAW y con esfuerzo',
    });
    expect(Number(await velo(page).getAttribute('opacity'))).toBeCloseTo(0.55, 3);
    // Seguir subiendo con el teclado no pasa del tope
    await page.locator(DESLIZADOR).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('PageUp');
    await expect(insignia(page)).toHaveText('10.000 K');
    expect(await leerValorEnReact(page, DESLIZADOR)).toBe('10000');

    // 1000 → 2500: Δ = 2500 − 3200 = −700 → «Ligeramente frío», Suave
    expect(await sembrarValorAcotado(page, DESLIZADOR, 1000)).toBe('2500');
    await esperarLectura(page, {
      valor: '2500 K',
      diferencia: '-700 K',
      etiqueta: 'Ligeramente frío',
      tinte: 'Azul / frío',
      intensidad: 'Suave',
      blanco: 'Blanco azulado',
      recuperable: 'Sí, fácilmente (sobre todo en RAW)',
    });
    // 2550 → 2600: Δ = −600
    expect(await sembrarValorAcotado(page, DESLIZADOR, 2550)).toBe('2600');
    await expect(diferencia(page)).toHaveText('Diferencia con el WB correcto: -600 K');
  });

  test('CASO 4 · atardecer: subir el WB calienta la foto y bajarlo la enfría (ancla del consejo invertido)', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: /Atardecer/ }).click();
    await esperarLectura(page, { valor: '3500 K', diferencia: '0 K', ...NEUTRA });
    // 4500 → Δ +1000: cálido; 5500 → Δ +2000: «Demasiado cálido»; 3000 → Δ −500: frío
    await sembrarValor(page, DESLIZADOR, 4500);
    await expect(etiqueta(page)).toHaveText('Ligeramente cálido');
    await expect(fila(page, 'Tinte dominante')).toHaveText('Naranja / cálido');
    await sembrarValor(page, DESLIZADOR, 5500);
    await expect(etiqueta(page)).toHaveText('Demasiado cálido (muy naranja)');
    await sembrarValor(page, DESLIZADOR, 3000);
    await expect(etiqueta(page)).toHaveText('Ligeramente frío');
    await expect(fila(page, 'Tinte dominante')).toHaveText('Azul / frío');
    // El consejo del hallazgo existe y se ve al abrir la guía
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    await expect(page.locator('[class*="tipCard"]').filter({ hasText: 'El atardecer no se neutraliza' })).toBeVisible();
  });

  test('CASO 5 · cambiar de escena y «Volver al WB correcto» devuelven el WB de la escena', async ({ page }) => {
    await page.getByRole('button', { name: /^Sombra/ }).click();
    await expect(diferencia(page)).toHaveText('Diferencia con el WB correcto: +4300 K'); // 7500 − 3200
    await page.getByRole('button', { name: /Volver al WB correcto \(3200 K\)/ }).click();
    await esperarLectura(page, { valor: '3200 K', diferencia: '0 K', ...NEUTRA });
    await page.getByRole('button', { name: /^Sombra/ }).click();
    await page.getByRole('tab', { name: /Atardecer/ }).click();
    await expect(page.getByRole('tab', { name: /Atardecer/ })).toHaveAttribute('aria-selected', 'true');
    await esperarLectura(page, { valor: '3500 K', diferencia: '0 K', ...NEUTRA });
    await expect(page.getByRole('button', { name: /Volver al WB correcto \(3500 K\)/ })).toBeVisible();
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · la intensidad se juzga en kelvin y no en mireds: 54 mired salen «Muy fuerte» y 56 o 87 mired, «Suave»', async ({
    page,
  }) => {
    // Nublado 6500 K con WB 10.000 K: 10⁶/6500 − 10⁶/10000 = 153,85 − 100 = 53,85 mired
    // Tungsteno 3200 K con WB 3900 K: 10⁶/3200 − 10⁶/3900 = 312,50 − 256,41 = 56,09 mired
    // Tungsteno 3200 K con WB 2500 K: 10⁶/2500 − 10⁶/3200 = 400 − 312,5 = 87,5 mired
    // Un desvío igual o mayor en mireds no puede salir con MENOS intensidad. Hoy: nublado →
    // «Muy fuerte» (Δ 3500 K); tungsteno → «Suave» las dos veces (Δ ±700 K).
    test.fail();
    const GRADO: Record<string, number> = { Imperceptible: 0, Suave: 1, Notable: 2, 'Muy fuerte': 3 };
    await page.getByRole('tab', { name: /Día nublado/ }).click();
    await sembrarValor(page, DESLIZADOR, 10000);
    const nublado = GRADO[(await fila(page, 'Intensidad del tinte').textContent()) ?? ''];
    await page.getByRole('tab', { name: /Interior tungsteno/ }).click();
    await sembrarValor(page, DESLIZADOR, 3900);
    const tungstenoCalido = GRADO[(await fila(page, 'Intensidad del tinte').textContent()) ?? ''];
    await sembrarValor(page, DESLIZADOR, 2500);
    const tungstenoFrio = GRADO[(await fila(page, 'Intensidad del tinte').textContent()) ?? ''];
    expect(tungstenoCalido).toBeGreaterThanOrEqual(nublado);
    expect(tungstenoFrio).toBeGreaterThanOrEqual(nublado);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · el consejo «Sube el WB ligeramente solo si está fuera de control» va al revés', async ({
    page,
  }) => {
    // CASO 4 comprueba que en la propia app subir el WB del atardecer CALIENTA la foto: para domar
    // un cálido fuera de control hay que bajarlo hacia 3500 K, no subirlo.
    test.fail();
    const consejo = page.locator('[class*="tipCard"]').filter({ hasText: 'El atardecer no se neutraliza' });
    expect(await consejo.textContent()).not.toContain('Sube el WB ligeramente solo si está fuera de control');
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · la escena tungsteno llama «luz día» a 6500 K; el preset y la tabla dicen 5500 K', async ({
    page,
  }) => {
    // Preset «Luz día» = 5500 K, tabla «Luz día ~5500 K», y 6500 K es «Nublado» en los dos sitios.
    await expect(page.getByRole('button', { name: /^Luz día/ })).toContainText('5500 K');
    test.fail();
    expect(await page.locator('[class*="escenaInfo"]').textContent()).not.toContain('6500K (luz día)');
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · la vela: «unos 1.800K» en el FAQPage y «~1900 K» en la tabla', async ({
    page,
  }) => {
    const filaVela = page.locator('[class*="comparativaTable"] tr').filter({ hasText: 'Vela' }).locator('td').nth(1);
    const tabla = Number(((await filaVela.textContent()) ?? '').replace(/\D/g, ''));
    expect(tabla).toBe(1900); // ancla: la fila existe
    test.fail();
    const respuesta = (await faqPage(page)).map((p) => p.acceptedAnswer.text).join(' ');
    const vela = respuesta.match(/vela emite unos ([\d.]+)\s?K/i);
    if (vela) expect(Number(vela[1].replace(/\./g, ''))).toBe(tabla);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · «Demasiado cálido (muy naranja)» con intensidad «Notable»: la etiqueta y la intensidad cortan en sitios distintos', async ({
    page,
  }) => {
    // Atardecer 3500 K con WB 5500 K: Δ = +2000. Etiqueta: > 1500 → «Demasiado…»; intensidad:
    // ≤ 2000 → «Notable». Lo mismo para todo |Δ| de 1600 a 2000 K.
    await page.getByRole('tab', { name: /Atardecer/ }).click();
    await sembrarValor(page, DESLIZADOR, 5500);
    await expect(diferencia(page)).toHaveText('Diferencia con el WB correcto: +2000 K');
    test.fail();
    const muy = ((await etiqueta(page).textContent()) ?? '').startsWith('Demasiado');
    const muyFuerte = (await fila(page, 'Intensidad del tinte').textContent()) === 'Muy fuerte';
    expect(muy).toBe(muyFuerte);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · la barra del resultado pone el marcador en el azul cuando la foto sale naranja', async ({
    page,
  }) => {
    // Tungsteno con el preset Sombra (7500 K): marcador al (7500 − 2500)/7500 = 66,7 % de un
    // degradado naranja → blanco (50 %) → azul. Bajo el marcador, ≈ rgb(173, 211, 253), azul claro,
    // mientras la etiqueta dice «Demasiado cálido (muy naranja)». La barra pinta el color de la
    // LUZ de cada kelvin, que es el contrario del tinte que deja ese WB.
    await page.getByRole('button', { name: /^Sombra/ }).click();
    await expect(etiqueta(page)).toHaveText('Demasiado cálido (muy naranja)');
    const color = await page.evaluate(() => {
      const barra = document.querySelector('[class*="balanceBar"]') as HTMLElement;
      const marcador = document.querySelector('[class*="balanceMarker"]') as HTMLElement;
      const p = parseFloat(marcador.style.left);
      const paradas = [...getComputedStyle(barra).backgroundImage.matchAll(/rgb\((\d+), (\d+), (\d+)\) ([\d.]+)%/g)].map(
        (m) => ({ r: +m[1], g: +m[2], b: +m[3], p: +m[4] }),
      );
      const i = paradas.findIndex((s, k) => k < paradas.length - 1 && p >= s.p && p <= paradas[k + 1].p);
      const a = paradas[i];
      const z = paradas[i + 1];
      const t = (p - a.p) / (z.p - a.p);
      return { p, paradas: paradas.length, r: a.r + (z.r - a.r) * t, b: a.b + (z.b - a.b) * t };
    });
    expect(color.paradas).toBeGreaterThanOrEqual(2); // ancla: la barra tiene su degradado
    expect(color.p).toBeCloseTo(66.667, 2);
    test.fail();
    expect(color.r).toBeGreaterThan(color.b);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · dos preguntas del FAQPage repiten las de la FAQ visible con otra respuesta', async ({
    page,
  }) => {
    const ld = await faqPage(page);
    const visibles = await page.locator('[class*="faqItem"]').evaluateAll((items) =>
      items.map((it) => ({
        pregunta: it.querySelector('strong')?.textContent?.trim() ?? '',
        respuesta: it.querySelector('p')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      })),
    );
    const ldNaranja = ld.find((p) => /interior.*naranja/i.test(p.name));
    const visNaranja = visibles.find((p) => /interior.*naranja/i.test(p.pregunta));
    const ldIncorrecto = ld.find((p) => /incorrecto/i.test(p.name));
    const visIncorrecto = visibles.find((p) => /incorrecto/i.test(p.pregunta));
    // anclas: las cuatro existen
    expect(ldNaranja && visNaranja && ldIncorrecto && visIncorrecto).toBeTruthy();
    test.fail();
    // Una sola constante (PREGUNTAS_FRECUENTES): mismo enunciado y misma respuesta
    expect(visNaranja!.pregunta).toBe(ldNaranja!.name);
    expect(visNaranja!.respuesta).toBe(ldNaranja!.acceptedAnswer.text);
    expect(visIncorrecto!.pregunta).toBe(ldIncorrecto!.name);
    expect(visIncorrecto!.respuesta).toBe(ldIncorrecto!.acceptedAnswer.text);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · emojis leídos por el lector: «💡 Interior tungsteno:» y «✅ Balance correcto»', async ({
    page,
  }) => {
    await expect(etiqueta(page)).toHaveText('✅ Balance correcto');
    test.fail();
    expect(await page.locator('[class*="escenaInfo"]').ariaSnapshot()).not.toContain('💡');
    expect(await page.locator('[class*="balanceMeter"]').ariaSnapshot()).not.toContain('✅');
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · las pestañas de escena no responden a las flechas ni apuntan a su panel', async ({
    page,
  }) => {
    const pestanas = page.getByRole('tab');
    await expect(pestanas).toHaveCount(3);
    test.fail();
    await page.getByRole('tab', { name: /Interior tungsteno/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Día nublado/ })).toBeFocused({ timeout: 1000 });
    await expect(pestanas.first()).toHaveAttribute('aria-controls', /.+/, { timeout: 1000 });
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · formato: «10 000 K» en la escala y «10 000K» en la nota, frente a «10.000 K» de la insignia', async ({
    page,
  }) => {
    expect(await sembrarValorAcotado(page, DESLIZADOR, 10000)).toBe('10000');
    await expect(insignia(page)).toHaveText('10.000 K');
    test.fail();
    expect(await page.locator('[class*="scaleRow"] span').last().textContent()).toBe('10.000 K');
    expect(await page.locator('[class*="unitLabel"]').textContent()).not.toMatch(/10 000/);
  });
});

// Móvil — Pixel 7 enumerado campo a campo (un `...devices[...]` dentro de un describe
// arrastraría `defaultBrowserType` y forzaría un worker nuevo).
test.describe('Simulador de balance de blancos · móvil', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('MÓVIL · el deslizador se ve, nada lo tapa y responde al toque; los presets también', async ({ page }) => {
    await abrir(page);
    const ancho = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(ancho.sw).toBeLessThanOrEqual(ancho.cw);

    const deslizador = page.locator(DESLIZADOR);
    await deslizador.scrollIntoViewIfNeeded();
    await expect(deslizador).toBeVisible();
    const caja = (await deslizador.boundingBox())!;
    const x = caja.x + caja.width * 0.8;
    const y = caja.y + caja.height / 2;
    expect(await page.evaluate(([px, py]) => document.elementFromPoint(px, py)?.id, [x, y])).toBe('wb-slider');

    // Toque al 80 % de la pista. Con la pista de 330 px y el pulgar de 22 px:
    // 2500 + (264 − 11)/(330 − 22) × 7500 = 8660 → paso de 100 → 8700. Holgura por la maquetación.
    await page.touchscreen.tap(x, y);
    await expect.poll(() => leerValorEnReact(page, DESLIZADOR)).not.toBe('3200');
    const v = Number(await leerValorEnReact(page, DESLIZADOR));
    expect(v).toBeGreaterThanOrEqual(8400);
    expect(v).toBeLessThanOrEqual(9000);
    await expect(insignia(page)).toHaveText(`${v} K`);
    await expect(diferencia(page)).toHaveText(`Diferencia con el WB correcto: +${v - 3200} K`);
    await expect(etiqueta(page)).toHaveText('Demasiado cálido (muy naranja)');

    // Preset Sombra por toque: 7500 − 3200 = +4300 K
    await page.getByRole('button', { name: /^Sombra/ }).tap();
    await expect(insignia(page)).toHaveText('7500 K');
    await expect(diferencia(page)).toHaveText('Diferencia con el WB correcto: +4300 K');
  });
});
