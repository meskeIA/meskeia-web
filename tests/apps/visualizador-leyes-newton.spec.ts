import { test, expect, Page, Locator } from '@playwright/test';
import {
  esperarPaginaAsentada,
  esperarValorEnReact,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';

/**
 * Inspector — visualizador-leyes-newton (segmento interactiva · Stemum, física)
 *
 * Primera inspección: 18/11/2026. La app promete en su <h1> «Las 3 Leyes de Newton» y en el
 * subtítulo «Inercia, F = m × a y acción-reacción … explicadas con simulaciones interactivas».
 * Cuatro pestañas: 1.ª ley (dos cajas empujadas, «Sin fricción (hielo)» y «Con fricción
 * (asfalto)»), 2.ª ley (deslizadores de masa 1-100 kg y fuerza 1-1000 N, resultado a = F / m y
 * una flecha rotulada «F = … N»), 3.ª ley (cuatro pares acción-reacción animados) y «Newton en
 * Números». Todo el cálculo vive en page.tsx: `aceleracion = fuerza / masa`, pintada con
 * formatNumber(…, 2), y `anchoFlecha = min(max(a · 2, 10), 200)` px.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/vln-esperados.mjs)
 *   CASO 1 (normal) — m = 7 kg, F = 200 N (la bola de bolos de la tabla de la app):
 *     a = 200 / 7 = 28,5714… → «28,57 m/s²» (la tabla, con un decimal, dice 28,6: cuadra).
 *   CASO 2 (límite: los extremos de los deslizadores) — m = 100 kg (End), F = 1 N (Home):
 *     a = 0,01 → «0,01 m/s²»; m = 1 kg, F = 1000 N: a = 1000 → «1000,00 m/s²» (con cuatro cifras
 *     enteras es-ES no agrupa: RAE 2010 e Intl).
 *   CASO 3 (rechazo) — masa 0 o −5 y fuerza 0 o 5000: el deslizador las recorta a [1, 100] kg y
 *     [1, 1000] N, así que nunca se divide por cero ni sale «∞»/«No definido»: m ← 0 deja «1 kg»
 *     y a = 100 / 1 = «100,00»; F ← 5000 deja «1000 N» y «1000,00»; F ← 0 deja «1 N» y «1,00».
 *
 *   1.ª LEY — sin rozamiento, tras el empujón la velocidad es CONSTANTE: x(t) lineal, y la misma
 *     distancia en cada cuarto del tiempo (último cuarto / primer cuarto = 1). La app anima las
 *     dos cajas con `transition: left 2s ease-out` = cubic-bezier(0, 0, 0,58, 1), que recorre
 *     0,378 / 0,685 / 0,907 / 1 de la distancia a los 25/50/75/100 % del tiempo: cociente 0,247,
 *     el mismo perfil que una deceleración uniforme hasta pararse (0,438 / 0,750 / 0,938 / 1).
 *
 *   BLOQUE EDUCATIVO — «F = dp/dt … funciona incluso cuando la masa cambia (como un cohete)»:
 *     cohete en reposo, sin fuerza externa, m0 = 1000 kg, expulsa 100 kg a u = 2000 m/s.
 *     Tsiolkovski: Δv = 2000 · ln(1000/900) = 210,7 m/s. F = d(mv)/dt con F = 0 y v0 = 0 da
 *     m·v = 0 → v = 0 m/s siempre: esa fórmula aplicada al cuerpo que pierde masa es errónea.
 *
 * FUENTES: g estándar 9,80665 m/s² y velocidad de escape 11,186 km/s, de la ficha de la Tierra de
 * la NASA (nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html); nombres de unidades con
 * minúscula (newton), Real Decreto 2032/2009, anexo, cap. III, apartado 1.6 (BOE-A-2010-927).
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (18/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

// Sin «reduce»: la 1.ª ley se juzga por su animación, que con movimiento reducido dura 0,01 ms.
test.use({ locale: 'es-ES', reducedMotion: 'no-preference' });

const RUTA = '/visualizador-leyes-newton/';

const panel = (page: Page): Locator => page.getByRole('tabpanel');
const resultado = (page: Page): Locator => panel(page).locator('[class$="_resultadoValor"]');
const flechaFuerza = (page: Page): Locator =>
  panel(page).locator('[aria-hidden="true"][style*="width"]');

async function pestana(page: Page, nombre: RegExp): Promise<void> {
  const tab = page.getByRole('tab', { name: nombre });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
}

async function abrirSegundaLey(page: Page): Promise<void> {
  await pestana(page, /2\.ª Ley/);
  await expect(page.locator('#masa')).toBeVisible();
}

async function anchoFlecha(page: Page): Promise<number> {
  // La flecha tiene `transition: width 0.3s`: esperar a que deje de cambiar
  let previo = -1;
  let actual = (await flechaFuerza(page).boundingBox())?.width ?? -1;
  while (Math.abs(actual - previo) > 0.01) {
    await page.waitForTimeout(150);
    previo = actual;
    actual = (await flechaFuerza(page).boundingBox())?.width ?? -1;
  }
  return actual;
}

type VentanaMuestras = Window & { __muestras?: number[][] };

/**
 * Posición x de las dos cajas de la 1.ª ley respecto a su pista, en cada fotograma, durante
 * `ms` milisegundos desde que se arranca. Por el rectángulo, no por `left`: vale también si la
 * reparación anima con `transform`.
 */
async function muestrearCajas(page: Page, accion: () => Promise<void>, ms: number): Promise<number[][]> {
  await page.evaluate((dur) => {
    const v = window as VentanaMuestras;
    const cajas = Array.from(document.querySelectorAll('[role="tabpanel"] [aria-hidden="true"]'))
      .filter((e) => e.textContent?.includes('📦'))
      .slice(0, 2);
    v.__muestras = [];
    const t0 = performance.now();
    const paso = (): void => {
      const t = performance.now() - t0;
      v.__muestras!.push([
        t,
        ...cajas.map((c) => c.getBoundingClientRect().left - c.parentElement!.getBoundingClientRect().left),
      ]);
      if (t < dur) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }, ms);
  await accion();
  await page.waitForFunction(
    (dur) => {
      const m = (window as VentanaMuestras).__muestras ?? [];
      return m.length > 0 && m[m.length - 1][0] >= dur;
    },
    ms,
    { timeout: ms + 10000 },
  );
  return page.evaluate(() => (window as VentanaMuestras).__muestras ?? []);
}

/** x interpolada en el instante t (ms) de la columna `col`. */
function xEn(m: number[][], col: number, t: number): number {
  for (let i = 1; i < m.length; i++) {
    if (m[i][0] >= t) {
      const [ta, tb] = [m[i - 1][0], m[i][0]];
      const f = tb === ta ? 0 : (t - ta) / (tb - ta);
      return m[i - 1][col] + f * (m[i][col] - m[i - 1][col]);
    }
  }
  return m[m.length - 1][col];
}

test.describe('visualizador-leyes-newton', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
  });

  test('CASO 1 (normal): m = 7 kg y F = 200 N dan a = 200 / 7 = 28,57 m/s²', async ({ page }) => {
    await abrirSegundaLey(page);
    // Parte de 10 kg y 100 N: los dos valores cambian, así que la siembra prueba algo
    await expect(resultado(page)).toHaveText('10,00');
    await sembrarValor(page, '#masa', 7);
    await sembrarValor(page, '#fuerza', 200);
    await expect(page.locator('label[for="masa"]')).toContainText('7 kg');
    await expect(page.locator('label[for="fuerza"]')).toContainText('200 N');
    await expect(resultado(page)).toHaveText('28,57');
    await expect(panel(page).locator('[class$="_resultadoUnidad"]')).toHaveText('m/s²');
    // La tabla de ejemplos de la propia app: 200 / 7 = 28,571… → «28,6» con un decimal
    await expect(page.getByRole('row', { name: /Bola bowling/ })).toContainText('28,6 m/s²');
    await expect(page.getByRole('row', { name: /Pelota fútbol/ })).toContainText('500 m/s²');
  });

  test('CASO 2 (límite): masa al máximo y fuerza al mínimo con el teclado dan 0,01; masa mínima y fuerza máxima, 1000,00', async ({ page }) => {
    await abrirSegundaLey(page);
    await page.locator('#masa').focus();
    await page.keyboard.press('End');
    await esperarValorEnReact(page, '#masa', 100);
    await page.locator('#fuerza').focus();
    await page.keyboard.press('Home');
    await esperarValorEnReact(page, '#fuerza', 1);
    // 1 N / 100 kg = 0,01 m/s²
    await expect(resultado(page)).toHaveText('0,01');
    await expect(page.locator('label[for="masa"]')).toContainText('100 kg');

    await sembrarValor(page, '#masa', 1);
    await sembrarValor(page, '#fuerza', 1000);
    // 1000 N / 1 kg = 1000 m/s²; cuatro cifras enteras sin punto de millar (RAE 2010, Intl es-ES)
    await expect(resultado(page)).toHaveText('1000,00');
  });

  test('CASO 3 (rechazo): masa 0 o negativa y fuerza 0 o 5000 se recortan al rango y nunca dividen por cero', async ({ page }) => {
    await abrirSegundaLey(page);
    expect(await sembrarValorAcotado(page, '#masa', 0)).toBe('1');
    await expect(page.locator('label[for="masa"]')).toContainText('1 kg');
    await expect(resultado(page)).toHaveText('100,00'); // 100 N / 1 kg
    expect(await sembrarValorAcotado(page, '#fuerza', 5000)).toBe('1000');
    await expect(resultado(page)).toHaveText('1000,00');
    expect(await sembrarValorAcotado(page, '#fuerza', 0)).toBe('1');
    await expect(resultado(page)).toHaveText('1,00');
    await sembrarValor(page, '#masa', 20);
    expect(await sembrarValorAcotado(page, '#masa', -5)).toBe('1');
    await expect(resultado(page)).toHaveText('1,00');
    await expect(panel(page)).not.toContainText(/∞|No definido|NaN|Infinity/);
  });

  test('Newton en Números: g = 9,8 m/s², escape 11,2 km/s y 70 kg × 9,80665 ≈ 686 N (ficha de la Tierra de la NASA)', async ({ page }) => {
    await pestana(page, /Newton en Números/);
    await expect(panel(page)).toContainText('9,8 m/s²');
    await expect(panel(page)).toContainText('11,2 km/s');
    await expect(panel(page)).toContainText('~686 N');
    await expect(panel(page)).toContainText('1687');
  });

  // ABIERTO (18/11/2026, calculo alto) — la caja «Sin fricción (hielo)», rotulada «Sigue
  // indefinidamente», frena hasta pararse: ease-out en vez de velocidad constante. Medido: recorre
  // 0,389 / 0,694 / 0,912 de su trayecto a los 25/50/75 % del tiempo, igual que la caja con
  // fricción (0,397 / 0,699 / 0,916). Esperado: último cuarto / primer cuarto ≈ 1 (obtenido ≈ 0,23).
  test.fail('1.ª ley: sin rozamiento, la caja recorre lo mismo en cada cuarto del movimiento (velocidad constante)', async ({ page }) => {
    const m = await muestrearCajas(
      page,
      () => page.getByRole('button', { name: 'Iniciar simulación de inercia' }).click(),
      3500,
    );
    const x0 = m[0][1];
    const xFin = m[m.length - 1][1];
    const ini = m.find((r) => Math.abs(r[1] - x0) > 0.5);
    const ultimo = [...m].reverse().find((r) => Math.abs(r[1] - xFin) > 0.5);
    expect(ini, 'la caja sin fricción no se movió').toBeTruthy();
    const [tIni, tFin] = [ini![0], ultimo![0]];
    const dur = tFin - tIni;
    const primerCuarto = xEn(m, 1, tIni + dur * 0.25) - x0;
    const ultimoCuarto = xEn(m, 1, tFin) - xEn(m, 1, tIni + dur * 0.75);
    const cociente = ultimoCuarto / primerCuarto;
    // Uniforme: 1. Ease-out (lo de hoy): 0,247 teórico. Margen holgado para el muestreo por fotograma.
    expect(cociente).toBeGreaterThan(0.8);
    expect(cociente).toBeLessThan(1.25);
  });

  // ABIERTO (18/11/2026, operativa medio) — «Simular empujón» solo funciona la primera vez: el
  // segundo clic pone la caja a 10 px CON la transición puesta y dos fotogramas después la vuelve a
  // mandar al final, así que apenas se mueve. Medido: left mínimo 723,8 px tras el 2.º clic
  // (esperado: vuelve al inicio, ~11 px desde el borde de la pista, y repite el empujón).
  test.fail('1.ª ley: un segundo «Simular empujón» devuelve la caja al inicio y repite la simulación', async ({ page }) => {
    const boton = page.getByRole('button', { name: 'Iniciar simulación de inercia' });
    await muestrearCajas(page, () => boton.click(), 2600);
    const m = await muestrearCajas(page, () => boton.click(), 1500);
    const minimo = Math.min(...m.map((r) => r[1]));
    expect(minimo).toBeLessThan(60);
  });

  // ABIERTO (18/11/2026, calculo medio) — la flecha rotulada «F = … N» mide 2 · a px (entre 10 y
  // 200), no la fuerza: con F = 100 N, pasar de 10 a 50 kg la encoge de 20 a 10 px, y F = 1000 N
  // con 100 kg dibuja la misma flecha de 20 px que F = 100 N con 10 kg.
  test.fail('2.ª ley: la flecha rotulada «F = 100 N» no cambia de longitud al cambiar solo la masa', async ({ page }) => {
    await abrirSegundaLey(page);
    await expect(panel(page)).toContainText('F = 100 N');
    const con10 = await anchoFlecha(page);
    await sembrarValor(page, '#masa', 50);
    await expect(resultado(page)).toHaveText('2,00');
    await expect(panel(page)).toContainText('F = 100 N');
    const con50 = await anchoFlecha(page);
    expect(con50).toBeCloseTo(con10, 0);
  });

  // ABIERTO (18/11/2026, contenido bajo) — en los cuatro pares de la 3.ª ley, la flecha «acción»
  // apunta al cuerpo que recibe la REACCIÓN. Cohete: «Acción: el motor expulsa gases hacia abajo»
  // es la fuerza sobre los gases (izquierda, «Gases ↓», se van a la izquierda al animar) → «←
  // acción» y «→ reacción»; la app pinta «→ acción» y «← reacción».
  test.fail('3.ª ley: la flecha de la acción apunta hacia los gases, que es sobre quien actúa según el texto', async ({ page }) => {
    await pestana(page, /3\.ª Ley/);
    await expect(panel(page)).toContainText('Acción: El motor expulsa gases a gran velocidad hacia abajo');
    const textos = await panel(page).locator('[class*="_arFlecha"]').allInnerTexts();
    const accion = textos.find((t) => /acción/.test(t) && !/reacción/.test(t)) ?? '';
    expect(accion.trim()).toMatch(/^←/);
  });

  // ABIERTO (18/11/2026, contenido medio) — el bloque educativo dice que F = dp/dt «funciona
  // incluso cuando la masa cambia (como un cohete…)» y que «es la versión que se usa en …
  // astrodinámica». Cohete en reposo sin fuerza externa, 1000 kg, expulsa 100 kg a 2000 m/s:
  // Tsiolkovski da 210,7 m/s; d(mv)/dt = 0 da v = 0. Se usa m·dv/dt = F + u·dm/dt (Meshchersky).
  test.fail('Bloque educativo: no presenta F = dp/dt como válida para un cuerpo que pierde masa', async ({ page }) => {
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.locator('[data-guia-educativa]')).toContainText('F = dp/dt');
    await expect(page.locator('[data-guia-educativa]')).not.toContainText(
      'funciona incluso cuando la masa cambia',
      { timeout: 2000 },
    );
  });

  // ABIERTO (18/11/2026, contenido bajo) — el FAQPage dice que las leyes «se superan en dos casos»
  // (cerca de c y escala atómica) y el bloque educativo, que «fallan en tres regímenes» (añade las
  // masas enormes: relatividad general, que es también la mayor corrección del GPS que cita la
  // propia app). Además el subtítulo dice «todo movimiento en el universo».
  test.fail('FAQPage: la respuesta sobre la validez de las leyes incluye el régimen de la relatividad general, como la página', async ({ page }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques
      .map((b) => JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] })
      .find((j) => j['@type'] === 'FAQPage');
    const respuesta = faq?.mainEntity?.find((q) => q.name.includes('siguen siendo válidas'))?.acceptedAnswer.text ?? '';
    expect(respuesta).toContain('mecánica cuántica');
    expect(respuesta).toMatch(/relatividad general/);
  });

  // ABIERTO (18/11/2026, contenido bajo) — nombres de unidad: «1 Newton = …» y «en Newtons» con
  // mayúscula, cuando el RD 2032/2009 (anexo, cap. III, 1.6) manda minúscula aunque venga de un
  // científico; y el aria-label de los deslizadores dice «1 newtons» y «1 kilogramos».
  test.fail('Unidades: «newton» con minúscula y en singular con 1', async ({ page }) => {
    await pestana(page, /Newton en Números/);
    await expect(panel(page)).not.toContainText(/\bNewtons\b|1 Newton =/, { timeout: 2000 });
    await abrirSegundaLey(page);
    expect(await sembrarValorAcotado(page, '#fuerza', 1)).toBe('1');
    await expect(page.locator('#fuerza')).not.toHaveAttribute('aria-label', /1 newtons/, { timeout: 2000 });
  });

  // ABIERTO (18/11/2026, contenido bajo) — «Newton formuló las leyes del movimiento con 23 años,
  // durante la Gran Plaga (1665-1666)» sin fuente: en esos años avanzó el cálculo, la óptica y la
  // gravitación con notas tempranas sobre el choque; las tres leyes se enuncian en De motu (1684)
  // y los Principia (1687), como dice la propia línea de tiempo de la app.
  test.fail('Newton en Números: no atribuye las tres leyes a 1665-1666 sin fuente', async ({ page }) => {
    await pestana(page, /Newton en Números/);
    await expect(panel(page)).toContainText('Principia Mathematica: las 3 leyes del movimiento');
    await expect(panel(page)).not.toContainText('formuló las leyes del movimiento con 23 años', { timeout: 2000 });
  });

  // ABIERTO (18/11/2026, accesibilidad bajo) — el resultado a = F / m no está en ninguna región
  // viva: quien mueve el deslizador con lector de pantalla oye «Masa: 50 kilogramos» y nunca la
  // aceleración.
  test.fail('2.ª ley: la aceleración se anuncia en una región viva al mover un deslizador', async ({ page }) => {
    await abrirSegundaLey(page);
    await sembrarValor(page, '#masa', 50);
    await expect(
      panel(page).locator(':is([aria-live], [role="status"], output)'),
    ).toContainText('2,00', { timeout: 2000 });
  });

  // ABIERTO (18/11/2026, accesibilidad bajo) — las pestañas tienen role="tab" pero las flechas no
  // las recorren (patrón de pestañas de la APG) y aria-controls apunta a panel-1…3, que no existen
  // en el DOM salvo el de la pestaña activa.
  test.fail('Pestañas: la flecha derecha pasa a la siguiente', async ({ page }) => {
    await page.getByRole('tab', { name: /1\.ª Ley/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /2\.ª Ley/ })).toHaveAttribute('aria-selected', 'true', { timeout: 2000 });
  });
});

test.describe('visualizador-leyes-newton en móvil', () => {
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('las cuatro pestañas caben sin desborde y la 2.ª ley calcula con el dedo', async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    for (const nombre of [/1\.ª Ley/, /2\.ª Ley/, /3\.ª Ley/, /Newton en Números/]) {
      await page.getByRole('tab', { name: nombre }).tap();
      await expect(page.getByRole('tab', { name: nombre })).toHaveAttribute('aria-selected', 'true');
      const { sw, cw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      expect(sw).toBeLessThanOrEqual(cw);
    }
    await page.getByRole('tab', { name: /2\.ª Ley/ }).tap();
    await sembrarValor(page, '#fuerza', 250);
    await expect(resultado(page)).toHaveText('25,00'); // 250 N / 10 kg
  });
});
