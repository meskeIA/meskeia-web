import { test, expect, Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarValorEnReact,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';

/**
 * Simulador de Plano Inclinado — primera inspección, 23/09/2026
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Simulador de Plano Inclinado» · subtítulo «¿Desliza o no desliza? Diagrama de cuerpo
 *   libre, rozamiento y aceleración». Seis deslizadores (masa 0,5–50 kg, θ 0–60°, μₛ y μₖ 0–1,5,
 *   fuerza paralela ±150 N, rampa 1–10 m), seis materiales de referencia y un veredicto
 *   («El bloque NO desliza» / «desliza cuesta abajo» / «sube por el plano»). Publica:
 *     P = m·g · N = m·g·cos θ · P∥ = m·g·sen θ · Fr,máx = μₛ·N · rozamiento real · |a| ·
 *     θc = arctg μₛ · y, si baja: tiempo en bajar L, velocidad al llegar abajo, energía
 *     potencial inicial y energía disipada por rozamiento · más la posición y la velocidad
 *     instantáneas de la animación. g = 9,81 m/s² (constante del código; la página no la dice).
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO ANTES DE ABRIR EL NAVEGADOR (script propio, sin la app)
 *   Eje x paralelo al plano, positivo cuesta arriba; F paralela, así que N = m·g·cos θ.
 *   Tendencia R = F − m·g·sen θ. Reposo si |R| ≤ μₛ·N, y entonces el estático vale |R| —lo
 *   NECESARIO, no μₛ·N—. Si desliza: Fr = μₖ·N opuesto al movimiento, a = (|R| − μₖ·N)/m,
 *   t = √(2L/a), v = √(2aL), Ep = m·g·L·sen θ, W_roz = μₖ·N·L.
 *
 *   CASO 1 (normal) 8 kg · 30° · μₛ 0,40 · μₖ 0,20 · L 6 m · F 0 → tg 30° = 0,577 > 0,40: DESLIZA
 *     P 78,480000 · N 67,965674 · P∥ 39,240000 · Fr,máx 27,186269 · Fr = μₖN 13,593135
 *     a = 9,81·(0,5 − 0,2·0,866025) = 3,205858 · θc 21,801409° · t 1,934722 s · v 6,202443 m/s
 *     Ep 235,440000 J · W_roz 81,558808 J (y ½mv² = 153,881 = Ep − W_roz: cuadra)
 *
 *   CASO 2 (límite)
 *     a) 10 kg · 20° · μₛ 0,60 → tg 20° = 0,364 < 0,60: REPOSO lejos del límite.
 *        P∥ 33,552176 · Fr,máx 55,310308 · Fr real = P∥ = 33,552176 (el error de libro sería
 *        publicar 55,31) · flecha de Fr cuesta ARRIBA.
 *     b) caucho (μₛ 1, μₖ 0,8) · 10 kg · 45° → tg 45° = 1 = μₛ: límite EXACTO, reposo (≤).
 *        En coma flotante sen 45° = 0,7071067811865475 < cos 45° = …476, así que el ≤ se cumple.
 *        P∥ = N = Fr,máx = Fr real = 69,367175 · θc = 45,0°.
 *     c) lo mismo a 46° → DESLIZA: N 68,145986 · Fr = 0,8·N = 54,516789 · a 1,605045 ·
 *        t 2,232551 · v 3,583344. (El salto μₛN → μₖN que describe la FAQ.)
 *     d) sin rozamiento, 10 kg, 0° → N = m·g = 98,10 · P∥ 0 · reposo. A 12° → a = g·sen 12° =
 *        2,039614 · t 1,980483 · v 4,039419 · Ep 81,584547 · W_roz 0.
 *     e) F = +40 N, 5 kg, 25°, μₛ 0,5 → R = 40 − 20,729426 = 19,270574 ≤ 22,227198: reposo con
 *        el estático CUESTA ABAJO valiendo 19,270574.
 *
 *   CASO 3 (debe rechazarse o tratarse aparte) — todos los controles son deslizadores: no hay
 *   dónde teclear «2.000.50» ni un negativo; el navegador capa al [min, max] del range.
 *     · bajar μₛ a 0,20 con μₖ en 0,30 → μₖ debe bajar con él (μₖ ≤ μₛ).
 *     · pedir μₖ 0,60 con μₛ 0,20 → debe quedarse en 0,20.
 *     · masa 0 → 0,5 kg (mínimo) · θ 75° → 60° (máximo).
 *     Resultado con 0,5 kg · 60° · μₛ = μₖ = 0,20: P 4,905 · N 2,4525 · Fr 0,4905 ·
 *     a = 9,81·(0,866025 − 0,1) = 7,514709 · t 1,031784 · v 7,753559. Si μₖ NO se capara y
 *     valiese 0,60, saldría a = 5,552709: la cifra delata el capado.
 *
 * LO QUE LA APP HACE BIEN (y estos tests fijan): todas las cifras estáticas cuadran al
 *   céntimo, el estático publicado es P∥ y no μₛ·N, su flecha cambia de sentido con F, el
 *   límite tg θ = μₛ queda en reposo, μₖ nunca supera a μₛ y en reposo no hay animación.
 *
 * HALLAZGOS ABIERTOS (al final, con `test.fail()`: afirman lo que DEBERÍA pasar)
 *   H1 · alto · «Soltar el bloque» por segunda vez, sin «Reiniciar posición», relanza el
 *        bloque desde la cima CON la velocidad final del recorrido anterior (`handleSoltar`
 *        toma `simulacion.v` aunque el arranque vuelva a `posicionInicial`). Caso 1:
 *        1.ª suelta 6,21 m/s, 2.ª 8,82 m/s, 3.ª 10,79 m/s, con la app publicando 6,20 m/s.
 *   H2 · bajo · al llegar abajo la «Velocidad instantánea» se queda con la del fotograma que ya
 *        ha rebasado la base (u se capa a 0, v no): con 60° y μ 0,20 muestra 7,82 m/s junto a
 *        «Velocidad al llegar abajo 7,75 m/s». El exceso es a·Δt (hasta a·0,05 con el tope de dt).
 *   H3 · bajo · mover un deslizador EN MARCHA y devolverlo a su valor reanuda solo la animación
 *        (el `animando` sigue en true y la clave vuelve a coincidir): el bloque salta de la cima
 *        a donde se quedó y sigue bajando sin que nadie pulse nada.
 *
 * LAS ANIMACIONES se miden con el reloj falso de Playwright: con él los fotogramas caen cada
 * 16 ms exactos y las cifras de la animación son deterministas (6,21 y 7,82 no dependen de la
 * carga de la máquina). H3 va con el reloj real porque es una carrera de estados, no de tiempos.
 */

const RUTA = '/simulador-plano-inclinado/';
const DESLIZADORES = ['#masa', '#angulo', '#mus', '#muk', '#fuerza', '#longitud'] as const;

/** Texto del valor de una fila de resultados, localizada por su etiqueta (clases con hash). */
async function leerFila(page: Page, etiqueta: string): Promise<string> {
  return page.evaluate((lab) => {
    for (const d of document.querySelectorAll('div')) {
      const sp = d.querySelectorAll(':scope > span');
      if (sp.length !== 2) continue;
      const texto = sp[0].textContent?.trim() ?? '';
      if (texto === lab || texto.startsWith(lab)) return sp[1].textContent?.trim() ?? '';
    }
    return '';
  }, etiqueta);
}

/** «1.234,56 N» → 1234.56 · «2,04 m/s²» → 2.04 · lo que no sea número → NaN. */
function aNumero(texto: string): number {
  const limpio = texto.replace(/[^\d,.\-−]/g, '').replace(/\./g, '').replace('−', '-');
  if (!/\d/.test(limpio)) return NaN;
  return Number(limpio.replace(',', '.'));
}

async function valor(page: Page, etiqueta: string): Promise<number> {
  return aNumero(await leerFila(page, etiqueta));
}

const veredicto = (page: Page) => page.locator('main section[role="status"] strong');
const botonSoltar = (page: Page) => page.getByRole('button', { name: /Soltar el bloque|Pausar/ });

/** Extremos de la flecha de una fuerza del diagrama («Fr», «F», «N»…), en coordenadas SVG. */
async function flecha(
  page: Page,
  nombre: string,
): Promise<{ dx: number; dy: number; rotulo: string } | null> {
  return page.evaluate((n) => {
    for (const g of document.querySelectorAll('svg g')) {
      const t = g.querySelector(':scope > text');
      const l = g.querySelector(':scope > line') as SVGLineElement | null;
      if (!t || !l || !(t.textContent ?? '').startsWith(`${n} `)) continue;
      return {
        dx: Number(l.getAttribute('x2')) - Number(l.getAttribute('x1')),
        dy: Number(l.getAttribute('y2')) - Number(l.getAttribute('y1')),
        rotulo: t.textContent ?? '',
      };
    }
    return null;
  }, nombre);
}

/** Siembra los parámetros del caso 1 (8 kg · 30° · μₛ 0,40 · μₖ 0,20 · L 6 m). */
async function sembrarCaso1(page: Page): Promise<void> {
  await sembrarValor(page, '#masa', 8);
  await sembrarValor(page, '#angulo', 30);
  await sembrarValor(page, '#mus', 0.4); // antes que μₖ: μₖ 0,30 ≤ 0,40, no se capa nada
  await sembrarValor(page, '#muk', 0.2);
  await sembrarValor(page, '#longitud', 6);
}

/** Congela el reloj falso: desde aquí solo avanza con `runFor`. */
async function pausarReloj(page: Page): Promise<void> {
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(ahora + 1000);
}

test.describe('Simulador de plano inclinado — cifras publicadas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  // La precisión: el defecto más fino que estos casos vigilan es tomar g = 9,8 en vez de
  // 9,81 (0,1 %), que sobre 78,48 N son 0,08 N y sobre a = 3,21 m/s² son 0,003. Por eso se
  // compara a la resolución de la pantalla (2 decimales, ±0,005) y no más holgado.
  test('CASO 1 (normal) — 8 kg, 30°, μₛ 0,40, μₖ 0,20, L 6 m: desliza y todo cuadra', async ({
    page,
  }) => {
    await sembrarCaso1(page);

    await expect(veredicto(page)).toHaveText('El bloque desliza cuesta abajo');
    expect(await valor(page, 'Peso P = m·g')).toBeCloseTo(78.48, 2); // 8·9,81
    expect(await valor(page, 'Normal N = m·g·cos θ')).toBeCloseTo(67.97, 2); // 67,965674
    expect(await valor(page, 'Peso paralelo m·g·sen θ')).toBeCloseTo(39.24, 2); // 78,48·0,5
    expect(await valor(page, 'Rozamiento máximo μₛ·N')).toBeCloseTo(27.19, 2); // 27,186269
    // Deslizando, el rozamiento real es el CINÉTICO: 0,20·67,965674 = 13,593135
    expect(await valor(page, 'Rozamiento real')).toBeCloseTo(13.59, 2);
    expect(await valor(page, 'Aceleración')).toBeCloseTo(3.21, 2); // 3,205858
    expect(await valor(page, 'Ángulo crítico arctg(μₛ)')).toBeCloseTo(21.8, 1); // 21,801409°
    expect(await valor(page, 'Tiempo en bajar')).toBeCloseTo(1.93, 2); // √(12/3,205858) = 1,934722
    expect(await valor(page, 'Velocidad al llegar abajo')).toBeCloseTo(6.2, 2); // 6,202443
    expect(await valor(page, 'Energía potencial inicial')).toBeCloseTo(235.44, 2); // 8·9,81·3
    expect(await valor(page, 'Disipado por rozamiento')).toBeCloseTo(81.56, 2); // 13,593135·6
    // Antes de soltar, el bloque está en la cima de la rampa de 6 m
    expect(await leerFila(page, 'Posición sobre la rampa')).toBe('6,00 m');
  });

  test('CASO 2a (límite, lejos) — en reposo el estático vale P∥ (33,55 N), no μₛ·N (55,31 N)', async ({
    page,
  }) => {
    await sembrarValor(page, '#masa', 10);
    await sembrarValor(page, '#angulo', 20);
    await sembrarValor(page, '#mus', 0.6);

    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    expect(await valor(page, 'Rozamiento máximo μₛ·N')).toBeCloseTo(55.31, 2); // 0,6·92,183846
    // El error clásico de libro sería publicar aquí 55,31: el estático es de respuesta.
    expect(await valor(page, 'Rozamiento real')).toBeCloseTo(33.55, 2); // = P∥ = 98,1·sen 20°
    expect(await valor(page, 'Peso paralelo m·g·sen θ')).toBeCloseTo(33.55, 2);
    expect(await valor(page, 'Aceleración')).toBe(0);
    // En equilibrio no hay nada que animar
    await expect(botonSoltar(page)).toBeDisabled();
    // La flecha de Fr sale del bloque CUESTA ARRIBA (la cima está a la derecha y arriba en el SVG)
    const fr = await flecha(page, 'Fr');
    expect(fr, 'el diagrama no dibuja la flecha de rozamiento').not.toBeNull();
    expect(fr!.rotulo).toBe('Fr = 33,6 N');
    expect(fr!.dx).toBeGreaterThan(0);
    expect(fr!.dy).toBeLessThan(0);
  });

  test('CASO 2b (límite exacto) — caucho a 45°: tg θ = μₛ, no desliza; a 46° sí', async ({
    page,
  }) => {
    await sembrarValor(page, '#masa', 10);
    await page.getByRole('button', { name: /Caucho sobre hormigón/ }).click();
    await esperarValorEnReact(page, '#mus', 1);
    await esperarValorEnReact(page, '#muk', 0.8);
    await sembrarValor(page, '#angulo', 45);

    // tg 45° = 1 = μₛ → reposo (la app y su FAQ usan «menor o igual»)
    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    expect(await valor(page, 'Ángulo crítico arctg(μₛ)')).toBeCloseTo(45.0, 1);
    expect(await valor(page, 'Peso paralelo m·g·sen θ')).toBeCloseTo(69.37, 2); // 69,367175
    expect(await valor(page, 'Rozamiento real')).toBeCloseTo(69.37, 2); // = P∥ = μₛ·N en el límite
    await expect(botonSoltar(page)).toBeDisabled();

    // Un grado más: desliza, y el rozamiento SALTA de μₛ·N a μₖ·N
    await sembrarValor(page, '#angulo', 46);
    await expect(veredicto(page)).toHaveText('El bloque desliza cuesta abajo');
    expect(await valor(page, 'Normal N = m·g·cos θ')).toBeCloseTo(68.15, 2); // 68,145986
    expect(await valor(page, 'Rozamiento real')).toBeCloseTo(54.52, 2); // 0,8·68,145986
    expect(await valor(page, 'Aceleración')).toBeCloseTo(1.61, 2); // 1,605045
    expect(await valor(page, 'Tiempo en bajar')).toBeCloseTo(2.23, 2); // 2,232551
    expect(await valor(page, 'Velocidad al llegar abajo')).toBeCloseTo(3.58, 2); // 3,583344
    await expect(botonSoltar(page)).toBeEnabled();
  });

  test('CASO 2c (límite, sin rozamiento) — a 0° N = m·g y reposo; a 12° a = g·sen θ', async ({
    page,
  }) => {
    await sembrarValor(page, '#masa', 10);
    await page.getByRole('button', { name: /Sin rozamiento/ }).click();
    await esperarValorEnReact(page, '#mus', 0);
    await esperarValorEnReact(page, '#muk', 0);
    await sembrarValor(page, '#angulo', 0);

    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    expect(await valor(page, 'Normal N = m·g·cos θ')).toBeCloseTo(98.1, 2); // todo el peso a N
    expect(await valor(page, 'Peso paralelo m·g·sen θ')).toBe(0);
    expect(await valor(page, 'Rozamiento real')).toBe(0);

    await sembrarValor(page, '#angulo', 12);
    await expect(veredicto(page)).toHaveText('El bloque desliza cuesta abajo');
    expect(await valor(page, 'Aceleración')).toBeCloseTo(2.04, 2); // 9,81·sen 12° = 2,039614
    expect(await valor(page, 'Tiempo en bajar')).toBeCloseTo(1.98, 2); // 1,980483
    expect(await valor(page, 'Velocidad al llegar abajo')).toBeCloseTo(4.04, 2); // 4,039419
    expect(await valor(page, 'Energía potencial inicial')).toBeCloseTo(81.58, 2); // 81,584547
    expect(await valor(page, 'Disipado por rozamiento')).toBe(0);
  });

  test('CASO 2d (límite con fuerza) — empujado 40 N cuesta arriba, el estático se da la vuelta', async ({
    page,
  }) => {
    // 5 kg · 25° · μₛ 0,50 (valores por defecto) · F +40 N
    await sembrarValor(page, '#fuerza', 40);

    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    // |40 − 20,729426| = 19,270574 ≤ 22,227198
    expect(await valor(page, 'Rozamiento real')).toBeCloseTo(19.27, 2);
    const fr = await flecha(page, 'Fr');
    expect(fr, 'el diagrama no dibuja la flecha de rozamiento').not.toBeNull();
    expect(fr!.rotulo).toBe('Fr = 19,3 N');
    // Ahora el bloque tiende a SUBIR: el rozamiento apunta cuesta abajo (izquierda y abajo)
    expect(fr!.dx).toBeLessThan(0);
    expect(fr!.dy).toBeGreaterThan(0);
  });

  test('CASO 3 (rechazo) — μₖ nunca supera a μₛ, la masa no baja de 0,5 kg ni θ pasa de 60°', async ({
    page,
  }) => {
    // Bajar μₛ por debajo de μₖ (0,30) arrastra a μₖ
    await sembrarValor(page, '#mus', 0.2);
    await esperarValorEnReact(page, '#muk', 0.2);
    // Mover μₖ a un valor admisible primero (0,10) para que el capado de después CAMBIE el
    // estado y no pase por un evento perdido
    await sembrarValor(page, '#muk', 0.1);
    await sembrarValor(page, '#muk', 0.6, { esperado: 0.2 });
    // El deslizador capa lo que no cabe
    expect(await sembrarValorAcotado(page, '#masa', 0)).toBe('0.5');
    expect(await sembrarValorAcotado(page, '#angulo', 75)).toBe('60');

    await expect(page.locator('label[for="muk"]')).toContainText('0,20');
    await expect(page.locator('label[for="masa"]')).toContainText('0,5 kg');
    await expect(page.locator('label[for="angulo"]')).toContainText('60°');
    await expect(veredicto(page)).toHaveText('El bloque desliza cuesta abajo');
    expect(await valor(page, 'Peso P = m·g')).toBeCloseTo(4.91, 2); // 0,5·9,81 = 4,905
    expect(await valor(page, 'Rozamiento real')).toBeCloseTo(0.49, 2); // 0,2·2,4525 = 0,4905
    // Con μₖ = 0,20 → 7,514709. Si μₖ hubiese quedado en 0,60 saldría 5,552709.
    expect(await valor(page, 'Aceleración')).toBeCloseTo(7.51, 2);
    expect(await valor(page, 'Tiempo en bajar')).toBeCloseTo(1.03, 2); // 1,031784
    expect(await valor(page, 'Velocidad al llegar abajo')).toBeCloseTo(7.75, 2); // 7,753559
    const resultados = page.getByRole('heading', { name: 'Análisis de fuerzas' }).locator('xpath=..');
    await expect(resultados).toContainText('Velocidad al llegar abajo');
    await expect(resultados).not.toContainText(/NaN|No definido|∞/);
  });
});

test.describe('Simulador de plano inclinado — la animación y lo publicado', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  test('CASO 1 animado — la primera suelta tarda lo publicado (1,93 s) y llega a 6,20 m/s', async ({
    page,
  }) => {
    await sembrarCaso1(page);
    await pausarReloj(page);
    await botonSoltar(page).click();

    // A 1,85 s (≤ 1,85 s simulados) le quedan 6 − ½·3,205858·1,85² = 0,51 m: sigue bajando
    await page.clock.runFor(1850);
    await expect
      .poll(async () => {
        const u = await valor(page, 'Posición sobre la rampa');
        return u > 0.3 && u < 1;
      })
      .toBe(true);
    // A 2,00 s ya ha llegado: t = 1,934722 s
    await page.clock.runFor(150);
    await expect.poll(() => leerFila(page, 'Posición sobre la rampa')).toBe('0,00 m');
    await expect(botonSoltar(page)).toHaveText(/Soltar el bloque/);
    // Holgura de un fotograma (a·Δt = 3,21·0,016 = 0,05): vigila errores gruesos de la
    // integración; el desfase fino de ese último fotograma es el hallazgo H2.
    expect(await valor(page, 'Velocidad instantánea')).toBeCloseTo(6.2, 1);
  });

  test('H1 — soltar otra vez sin reiniciar relanza el bloque desde la cima y EN REPOSO', async ({
    page,
  }) => {
    test.fail(
      true,
      'HALLAZGO H1: la segunda suelta arranca desde la cima con la velocidad final de la ' +
        'anterior (handleSoltar toma simulacion.v). Caso 1: llega a 8,82 m/s en vez de 6,20.',
    );
    await sembrarCaso1(page);
    await pausarReloj(page);

    await botonSoltar(page).click();
    await page.clock.runFor(4000);
    await expect.poll(() => leerFila(page, 'Posición sobre la rampa')).toBe('0,00 m');
    expect(await valor(page, 'Velocidad instantánea')).toBeCloseTo(6.2, 1); // 1.ª suelta: bien

    // El botón vuelve a decir «Soltar el bloque»: pulsarlo repite el experimento
    await botonSoltar(page).click();
    await page.clock.runFor(4000);
    await expect.poll(() => leerFila(page, 'Posición sobre la rampa')).toBe('0,00 m');
    // Mismos parámetros → misma llegada: √(2·3,205858·6) = 6,202443 m/s. Hoy: 8,82.
    expect(await valor(page, 'Velocidad instantánea')).toBeCloseTo(6.2, 1);
  });

  test('H2 — al llegar abajo, la velocidad instantánea es la publicada (7,75 m/s)', async ({
    page,
  }) => {
    test.fail(
      true,
      'HALLAZGO H2: la velocidad instantánea final es la del fotograma que ya rebasó la base ' +
        '(u se capa a 0, v no): 7,82 m/s junto a «Velocidad al llegar abajo 7,75 m/s».',
    );
    // 5 kg · 60° · μₛ 0,20 (μₖ baja con él a 0,20): a = 7,514709 → v = √(2·7,514709·4) = 7,753559
    await sembrarValor(page, '#angulo', 60);
    await sembrarValor(page, '#mus', 0.2);
    await esperarValorEnReact(page, '#muk', 0.2);
    expect(await valor(page, 'Velocidad al llegar abajo')).toBeCloseTo(7.75, 2);
    await pausarReloj(page);

    await botonSoltar(page).click();
    await page.clock.runFor(3000);
    await expect.poll(() => leerFila(page, 'Posición sobre la rampa')).toBe('0,00 m');
    // El exceso vale a·Δt (7,51·0,016 = 0,12 como máximo a 60 Hz): se compara a la resolución
    // de la pantalla porque el panel pone las dos cifras una debajo de otra. Hoy: 7,82.
    expect(await valor(page, 'Velocidad instantánea')).toBeCloseTo(7.75, 2);
  });
});

test.describe('Simulador de plano inclinado — cambiar parámetros en marcha', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  test('H3 — devolver un deslizador a su valor NO reanuda sola la animación', async ({ page }) => {
    test.fail(
      true,
      'HALLAZGO H3: «animando» sigue en true al invalidar el recorrido; al volver a la misma ' +
        'clave de parámetros la animación se reanuda sola desde donde se quedó.',
    );
    await sembrarCaso1(page);
    await botonSoltar(page).click();
    await page.waitForTimeout(700); // a medio camino (≈ 5,2 m)

    // 15° con μₛ 0,40 → tg 15° = 0,268: reposo. El recorrido deja de valer y el bloque vuelve arriba.
    await sembrarValor(page, '#angulo', 15);
    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    await expect.poll(() => leerFila(page, 'Posición sobre la rampa')).toBe('6,00 m');

    // Volver a 30°: nadie ha pulsado «Soltar», así que el bloque debe seguir quieto en la cima.
    // Hoy reanuda solo desde donde se quedó; según lo que tarde la máquina en sembrar, a los
    // 500 ms sigue bajando (el botón dice «⏸ Pausar») o ya ha llegado abajo (botón «Soltar»,
    // posición «0,00 m», medido en la primera corrida). Las dos aserciones vigilan el defecto.
    await sembrarValor(page, '#angulo', 30);
    await page.waitForTimeout(500);
    await expect(botonSoltar(page)).toHaveText(/Soltar el bloque/);
    expect(await leerFila(page, 'Posición sobre la rampa')).toBe('6,00 m');
  });
});
