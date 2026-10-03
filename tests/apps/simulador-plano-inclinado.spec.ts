import { test, expect, devices, Page } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  esperarValorEnReact,
  leerValorEnReact,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  comprobarRespuesta,
  toleranciaDe,
  leerRespuesta,
  generarEjercicioAleatorio,
} from '../../app/simulador-plano-inclinado/casos';
import { G, analizarPlano } from '../../app/simulador-plano-inclinado/motor';

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
 * HALLAZGOS 1286-1290 — REPARADOS el 23/09/2026 (H1-H3 abajo, sin `test.fail()`, y H4-H5 al final)
 *   H1 · alto · «Soltar el bloque» por segunda vez, sin «Reiniciar posición», relanzaba el
 *        bloque desde la cima CON la velocidad final del recorrido anterior (`handleSoltar`
 *        tomaba `simulacion.v` aunque el arranque volviera a `posicionInicial`). Caso 1:
 *        1.ª suelta 6,21 m/s, 2.ª 8,82 m/s, 3.ª 10,79 m/s, con la app publicando 6,20 m/s.
 *   H2 · bajo · al llegar abajo la «Velocidad instantánea» se quedaba con la del fotograma que
 *        ya había rebasado la base (u se capaba a 0, v no): con 60° y μ 0,20 mostraba 7,82 m/s
 *        junto a «Velocidad al llegar abajo 7,75 m/s». El exceso era a·Δt.
 *   H3 · bajo · mover un deslizador EN MARCHA y devolverlo a su valor reanudaba sola la
 *        animación (el `animando` seguía en true y la clave volvía a coincidir): el bloque
 *        saltaba de la cima a donde se quedó y seguía bajando sin que nadie pulsara nada.
 *
 * RE-INSPECCIÓN DEL 03/10/2026 (bloques del final del fichero). Los cinco siguen cerrados: H1
 *   también en la rama «sube» (F = +100 N: dos sueltas llegan arriba a 10,54 m/s). Novedades
 *   desde el 23/09: el lote del hero (586a4d61, a1d72a9c) y «Casos para clase» (6dc4f85a).
 *   Sospecha (a) del 27/09 — el corrector usa el 1 %: CONFIRMADA, hallazgo (bloque «corrector»).
 *   Sospecha (b) del 01/10 — la píldora «Stemum › Física» pisa el h1 de 1024 a ~1110 px:
 *   DESCARTADA con medida (la píldora acaba en x = 232 y el título empieza en x ≥ 247).
 *
 * LAS ANIMACIONES se miden con el reloj falso de Playwright: con él los fotogramas caen cada
 * 16 ms exactos y las cifras de la animación son deterministas (6,21 y 7,82 no dependen de la
 * carga de la máquina). H3 va con el reloj real porque es una carrera de estados, no de tiempos.
 */

/**
 * stemum.com → el servidor local, para ver la app como la sirve el portal (data-brand="stemum"
 * y la píldora «Stemum › Física» en la barra fija). Al NIVEL DEL FICHERO porque `launchOptions`
 * fuerza un worker nuevo; al resto de tests no les afecta: solo resuelve ese host.
 */
test.use({ launchOptions: { args: ['--host-resolver-rules=MAP stemum.com 127.0.0.1:3050'] } });

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
    // integración; el desfase fino de ese último fotograma era el hallazgo H2 (REPARADO).
    expect(await valor(page, 'Velocidad instantánea')).toBeCloseTo(6.2, 1);
  });

  test('H1 — soltar otra vez sin reiniciar relanza el bloque desde la cima y EN REPOSO', async ({
    page,
  }) => {
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
    // Mismos parámetros → misma llegada: √(2·3,205858·6) = 6,202443 m/s. Antes de la
    // reparación (H1, REPARADO el 23/09/2026): 8,82.
    expect(await valor(page, 'Velocidad instantánea')).toBeCloseTo(6.2, 1);
  });

  test('H2 — al llegar abajo, la velocidad instantánea es la publicada (7,75 m/s)', async ({
    page,
  }) => {
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
    // de la pantalla porque el panel pone las dos cifras una debajo de otra. Antes de la
    // reparación (H2, REPARADO el 23/09/2026): 7,82.
    expect(await valor(page, 'Velocidad instantánea')).toBeCloseTo(7.75, 2);
  });
});

test.describe('Simulador de plano inclinado — cambiar parámetros en marcha', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  test('H3 — devolver un deslizador a su valor NO reanuda sola la animación', async ({ page }) => {
    await sembrarCaso1(page);
    await botonSoltar(page).click();
    await page.waitForTimeout(700); // a medio camino (≈ 5,2 m)

    // 15° con μₛ 0,40 → tg 15° = 0,268: reposo. El recorrido deja de valer y el bloque vuelve arriba.
    await sembrarValor(page, '#angulo', 15);
    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    await expect.poll(() => leerFila(page, 'Posición sobre la rampa')).toBe('6,00 m');

    // Volver a 30°: nadie ha pulsado «Soltar», así que el bloque debe seguir quieto en la cima.
    // Antes de la reparación (H3, REPARADO el 23/09/2026) reanudaba solo desde donde se quedó;
    // según lo que tardara la máquina en sembrar, a los 500 ms seguía bajando (el botón decía
    // «⏸ Pausar») o ya había llegado abajo (botón «Soltar», posición «0,00 m»). Las dos
    // aserciones vigilan que no vuelva.
    await sembrarValor(page, '#angulo', 30);
    await page.waitForTimeout(500);
    await expect(botonSoltar(page)).toHaveText(/Soltar el bloque/);
    expect(await leerFila(page, 'Posición sobre la rampa')).toBe('6,00 m');
  });
});

test.describe('Simulador de plano inclinado — balance de energía y g', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  // HALLAZGO 1289 — con F ≠ 0 el balance publicado no cerraba: faltaba el trabajo de F.
  // 5 kg · 25° · μₛ 0,50 · μₖ 0,30 · F −10 N · L 4 m: Ep = 5·9,81·4·sen 25° = 82,92 J,
  // rozamiento 0,30·5·9,81·cos 25°·4 = 53,35 J, W(F) = −(−10)·4 = +40,00 J → Ec = 69,57 J,
  // que es ½·5·v² con la v publicada (5,28 m/s).
  test('H4 — con fuerza aplicada, el balance incluye su trabajo y cierra', async ({ page }) => {
    await sembrarValor(page, '#angulo', 25);
    await sembrarValor(page, '#mus', 0.5);
    await sembrarValor(page, '#muk', 0.3);
    await sembrarValor(page, '#fuerza', -10);
    await expect.poll(() => leerFila(page, 'Trabajo de la fuerza aplicada (−F·L)')).toBe('40,00 J');
    expect(await leerFila(page, 'Energía potencial inicial')).toBe('82,92 J');
    expect(await leerFila(page, 'Disipado por rozamiento')).toBe('53,35 J');
    expect(await leerFila(page, 'Energía cinética al llegar (½·m·v²)')).toBe('69,57 J');
    const v = await valor(page, 'Velocidad al llegar abajo');
    expect(0.5 * 5 * v * v).toBeCloseTo(69.57, 0);
  });

  // HALLAZGO 1290 — la página no decía qué g usa.
  test('H5 — la página dice que usa g = 9,81 m/s²', async ({ page }) => {
    await expect(page.getByText('Con g = 9,81 m/s²')).toBeVisible();
    expect(await leerFila(page, 'Peso P = m·g')).toBe('49,05 N');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * simulador-plano-inclinado · casos para clase (tarea de tipo A, 28/09/2026)
 *
 * Doce problemas de dinámica en el plano inclinado. Los casos calculan SOLO con `analizarPlano`
 * de `motor.ts`, que se EXTRAJO del `useMemo` `fisica` de page.tsx sin tocar una operación
 * (0 diferencias en 1.449.360 combinaciones contra el cuerpo original): lo que corrige la
 * sección y lo que pinta el panel sale de la misma función.
 *
 * CONVENIO DE ESTA APP: g = 9,81 m/s² · la fuerza aplicada es paralela al plano, así que
 * N = m·g·cos θ · en reposo el rozamiento es el que EQUILIBRA (no μₛ·N) · si desliza, μₖ·N ·
 * ángulo crítico = arctg μₛ.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (a mano, sin mirar la app):
 *   1 · Pₓ = 10·9,81·sen 30° = 98,1·0,5                                       = 49,05 N
 *   2 · N = 98,1·cos 30° = 98,1·0,866025 = 84,957                             → 84,96 N
 *   3 · a = g·sen 30° = 9,81·0,5                                              = 4,905 m/s²
 *   4 · tg 40° = 0,839 > 0,5 → desliza; a = 9,81·(0,642788 − 0,3·0,766044)
 *       = 9,81·0,412975 = 4,0513                                              → 4,05 m/s²
 *   5 · tg 25° = 0,466 < 0,5 → no desliza                                     = 0 m/s²
 *   6 · tg 30° = 0,577 < 0,7 → en reposo; F_r = Pₓ = 20·9,81·0,5 = 98,10 N
 *       (μₛ·N = 0,7·169,91 = 118,94 N es el error clásico)                    = 98,10 N
 *   7 · θc = arctg 0,75                                                       → 36,87°
 *   8 · a = 9,81·(0,5 − 0,2·0,866025) = 3,2059; t = √(2·4/3,2059) = 1,5797  → 1,58 s
 *   9 · a = 9,81·(0,573576 − 0,25·0,819152) = 3,6178; v = √(2·3,6178·5) = 6,0148 → 6,01 m/s
 *  10 · F = 20·9,81·(sen 15° + 0,3·cos 15°) = 196,2·0,548597 = 107,635       → 107,63 N
 *  11 · E_p = 8·9,81·(5·sen 30°) = 8·9,81·2,5                                 = 196,20 J
 *  12 · W = μₖ·N·d = 0,1·50·9,81·cos 30°·10 = 424,79                         → 424,79 J
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const A_MANO_CASOS: Readonly<Record<number, number>> = {
  1: 49.05,
  2: 84.96,
  3: 4.905,
  4: 4.05,
  5: 0,
  6: 98.1,
  7: 36.87,
  8: 1.58,
  9: 6.01,
  10: 107.63,
  11: 196.2,
  12: 424.79,
};

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («84,96 N» → 2). */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

const redondeo = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

test.describe('simulador-plano-inclinado · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(redondeo(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    // Sin `pesos?` suelto: en dinámica «peso» es la fuerza m·g y casaba con el caso 1. La moneda
    // se reconoce por su gentilicio.
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|argentinos|chilenos|uruguayos)|Bachillerato|selectividad)\b/i;
    // La sigla va aparte y con mayúsculas: con /i, el pronombre «eso» la disparaba en falso.
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', async () => {
    for (const caso of CASOS) {
      const decimales = caso.datos.decimales ?? 2;
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      // El caso 5 pide redondear aunque su respuesta sea 0 exacto, a propósito: como el 4, para
      // que la frase no delate la respuesta. Por eso la implicación va en un solo sentido.
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
      if (!exacto) {
        expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(true);
        expect(caso.enunciado, `caso ${caso.id}: se redondea y el enunciado no lo pide`).toMatch(/redonde|decimal|unidades|décima/i);
      }
    }
  });

  test('5.ter · si la respuesta cambia con g = 10, el enunciado declara g = 9,81', async () => {
    // Se prueba EJECUTANDO, no leyendo: el caso 7 (ángulo crítico) no depende de g y no tiene
    // por qué nombrarla (lección de simulador-conservacion-energia, 14/09/2026).
    for (const caso of CASOS) {
      const conDiez = resolverCaso(caso.datos, 10);
      const cambia = !comprobarRespuesta(conDiez.valor, caso.datos).correcto;
      if (cambia) expect(caso.enunciado, `caso ${caso.id}`).toContain('g = 9,81');
    }
    // Y el que se aparta con g = 10 al menos en uno: si no, la invariante no mira nada.
    expect(CASOS.some((c) => !comprobarRespuesta(resolverCaso(c.datos, 10).valor, c.datos).correcto)).toBe(true);
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.pregunta)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta)).toBe(true);
      expect(redondeo(resolverCaso(m.datos).valor, m.datos.decimales ?? 2)).toBe(m.respuesta);
    }
  });

  test('7 · el convenio queda fijado: g = 9,81, rozamiento en reposo = el que equilibra', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_CASOS[caso.id]);
    }

    // (b) El motor extraído: la g de la app y el estado de fábrica del acta (5 kg, 25°).
    expect(G).toBe(9.81);
    const fabrica = analizarPlano({ masa: 5, angulo: 25, muS: 0.5, muK: 0.3, fuerza: 0, longitud: 4 });
    expect(fabrica.peso).toBeCloseTo(49.05, 10);
    expect(fabrica.estado).toBe('reposo');
    expect(fabrica.rozamientoReal).toBeCloseTo(fabrica.pesoParalelo, 10);

    // (c) Con g = 9,8 (la de muchos libros) ya NO entran los doce. Hasta el hallazgo 2783 este
    //     test exigía que entraran todos, y eso consagraba la tolerancia del 1 %: los enunciados
    //     que dependen de g dicen «toma g = 9,81 m/s²». Entran solo el 5 y el 7, que no dependen
    //     de g (a = 0; arctg μₛ), y el 4, el 8 y el 9, donde el 0,1 % de diferencia no mueve la
    //     cifra pedida (4,0471 → 4,05; 1,5805 → 1,58; 6,0118 → 6,01): ahí 9,8 da LA MISMA
    //     respuesta redondeada, y rechazarla sería corregir la g y no la cuenta.
    const entranCon98 = CASOS.filter(
      (caso) => comprobarRespuesta(resolverCaso(caso.datos, 9.8).valor, caso.datos).correcto,
    ).map((c) => c.id);
    expect(entranCon98).toEqual([4, 5, 7, 8, 9]);
    for (const caso of CASOS) {
      const con98 = redondeo(resolverCaso(caso.datos, 9.8).valor, caso.datos.decimales ?? 2);
      if (entranCon98.includes(caso.id)) expect(con98, `caso ${caso.id}`).toBe(caso.respuesta);
    }

    // (d) El error del tema NO entra: μₛ·N como rozamiento de un cuerpo en reposo (caso 6).
    expect(comprobarRespuesta(0.7 * 20 * 9.81 * Math.cos(Math.PI / 6), CASOS[5].datos).correcto).toBe(false);
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    const caso = (id: number) => CASOS[id - 1].datos;
    expect(comprobarRespuesta(0, caso(5)).correcto).toBe(true);
    expect(comprobarRespuesta(NaN, caso(4)).correcto).toBe(false);
    expect(comprobarRespuesta(NaN, caso(4)).motivo).not.toMatch(/NaN/);
    // La tolerancia es la de la PREGUNTA (hallazgo 2783): 0 si la cifra es exacta (el 0 del caso
    // 5, el 4,905 del 3, el 98,10 del 6), media unidad del último decimal pedido si no lo es.
    expect(toleranciaDe(caso(5))).toBe(0);
    expect(toleranciaDe(caso(3))).toBe(0);
    expect(toleranciaDe(caso(6))).toBe(0);
    expect(toleranciaDe(caso(12))).toBeCloseTo(0.005, 12);
    // Borde exacto de la tolerancia, por los dos lados (hallazgo 1211 del 22/09/2026), alrededor
    // de la cifra SIN redondear (36,869898°), y un pelo más allá ya no.
    const exacto = resolverCaso(caso(7)).valor;
    expect(comprobarRespuesta(exacto + 0.005, caso(7)).correcto).toBe(true);
    expect(comprobarRespuesta(exacto - 0.005, caso(7)).correcto).toBe(true);
    expect(comprobarRespuesta(exacto + 0.0051, caso(7)).correcto).toBe(false);
    // La lectura de lo tecleado (hallazgo 2784): un punto solo es decimal; la coma, también.
    expect(leerRespuesta('4.905')).toBe(4.905);
    expect(leerRespuesta('4,905')).toBe(4.905);
    expect(leerRespuesta(' 84.96 ')).toBe(84.96);
    expect(leerRespuesta('−0,5')).toBe(-0.5);
    expect(leerRespuesta('1.234,5')).toBe(1234.5);
    expect(leerRespuesta('4,05abc')).toBeNaN();
    expect(leerRespuesta('1e3')).toBeNaN();
  });
});

test.describe('simulador-plano-inclinado · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('#casos-aula');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta', ...DESLIZADORES]);
  });

  test('el caso 5 (no desliza) se corrige con 0', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 5:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('0');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto!');
  });

  test('μₛ·N en el caso 6 se rechaza y la solución enseña 98,10 N', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 6:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('118,94');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('No es correcto');
    const solucion = seccion(page).getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(seccion(page).locator('#casos-resultado')).toContainText('98,10 N');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN DEL 03/10/2026
 *
 * Valores esperados resueltos A MANO antes de abrir el navegador, con un script propio que no
 * importa el motor de la app (g = 9,81, la que declara la página):
 *
 *   CASO A (normal) 6 kg · 40° · μₛ 0,60 · μₖ 0,35 · L 7 m · F 0 → tg 40° = 0,839 > 0,60: desliza
 *     P 58,86 · N = 58,86·cos 40° = 45,089376 · Pₓ = 58,86·sen 40° = 37,834479
 *     Fr,máx = 0,6·N = 27,053626 · Fr = 0,35·N = 15,781282 · a = (37,834479 − 15,781282)/6
 *     = 3,675533 · θc = arctg 0,6 = 30,963757° · t = √(14/a) = 1,951659 · v = √(2·a·7) = 7,173386
 *     Ep = 58,86·7·sen 40° = 264,841351 · W_roz = 15,781282·7 = 110,468971 · Ec = 154,372380
 *     (= ½·6·v²: cuadra)
 *   CASO B (límites)
 *     B1 umbral: μₛ = 0,58 → θc = 30,113733°. 4 kg a 30° (tg 0,577 < 0,58): reposo, Fr = Pₓ =
 *        19,62 (NO μₛ·N = 19,710045). A 31°: desliza, N 33,635245, Fr = 0,4·N = 13,454098,
 *        a = (20,210094 − 13,454098)/4 = 1,688999, t 2,433242, v 4,109743.
 *     B2 θ = 0 con rozamiento: 7 kg, μₛ 0,5 → N = m·g = 68,67, Pₓ = 0, Fr = 0, reposo.
 *     B3 F = −30 N (empuja cuesta abajo), 5 kg, 20°, μₛ 0,5, μₖ 0,3, L 4 → desliza: a = 6,589702,
 *        v 7,260690; Ep 67,104352 − W_roz 55,310308 + W_F 120 = 131,794044 = ½·5·v².
 *     B4 F = +100 N, mismos datos → sube: a = (100 − 16,776088 − 13,827577)/5 = 13,879267 y
 *        llega arriba a √(2·a·4) = 10,537274 m/s, en las dos sueltas.
 *   CASO C (rechazo) — los deslizadores ya estaban medidos el 23/09 (CASO 3 de arriba). Lo que se
 *     puede teclear es la respuesta de «Casos para clase»: vacío, «abc», «-», «4,05abc», «1e3» y
 *     «4,05 m/s²» se rechazan con «Escribe un número»; «4.05», « 4,05 » y «+4,05» valen.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Pone los seis parámetros, sin sembrar los que React ya tiene (no probaría nada). */
async function sembrarParametros(
  page: Page,
  p: { masa: number; angulo: number; muS: number; muK: number; fuerza?: number; longitud: number },
): Promise<void> {
  const poner = async (sel: string, v: number) => {
    if ((await leerValorEnReact(page, sel)) !== String(v)) await sembrarValor(page, sel, v);
  };
  // μₛ arriba del todo primero: así μₖ no se capa al ponerlo, y al bajar μₛ ya no lo toca
  await poner('#mus', 1.5);
  await poner('#muk', p.muK);
  await poner('#mus', p.muS);
  await poner('#masa', p.masa);
  await poner('#angulo', p.angulo);
  await poner('#fuerza', p.fuerza ?? 0);
  await poner('#longitud', p.longitud);
}

test.describe('Re-inspección 03/10/2026 — el simulador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  test('CASO A (normal) — 6 kg, 40°, μₛ 0,60, μₖ 0,35, L 7 m: todas las filas', async ({ page }) => {
    await sembrarParametros(page, { masa: 6, angulo: 40, muS: 0.6, muK: 0.35, longitud: 7 });
    await expect(veredicto(page)).toHaveText('El bloque desliza cuesta abajo');
    // Se lee el texto entero: la pantalla da dos decimales y el error más fino que vigila
    // (g = 9,8 en vez de 9,81, un 0,1 %) ya mueve la segunda decimal de casi todas.
    expect(await leerFila(page, 'Peso P = m·g')).toBe('58,86 N');
    expect(await leerFila(page, 'Normal N = m·g·cos θ')).toBe('45,09 N');
    expect(await leerFila(page, 'Peso paralelo m·g·sen θ')).toBe('37,83 N');
    expect(await leerFila(page, 'Rozamiento máximo μₛ·N')).toBe('27,05 N');
    expect(await leerFila(page, 'Rozamiento real')).toBe('15,78 N');
    expect(await leerFila(page, 'Aceleración')).toBe('3,68 m/s²');
    expect(await leerFila(page, 'Ángulo crítico arctg(μₛ)')).toBe('31,0°');
    expect(await leerFila(page, 'Tiempo en bajar 7,0 m')).toBe('1,95 s');
    expect(await leerFila(page, 'Velocidad al llegar abajo')).toBe('7,17 m/s');
    expect(await leerFila(page, 'Energía potencial inicial')).toBe('264,84 J');
    expect(await leerFila(page, 'Disipado por rozamiento')).toBe('110,47 J');
    expect(await leerFila(page, 'Energía cinética al llegar (½·m·v²)')).toBe('154,37 J');
  });

  test('CASO B1 (umbral) — μₛ 0,58: a 30° no desliza (Fr = Pₓ) y a 31° sí (Fr = μₖ·N)', async ({
    page,
  }) => {
    await sembrarParametros(page, { masa: 4, angulo: 30, muS: 0.58, muK: 0.4, longitud: 5 });
    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    expect(await leerFila(page, 'Ángulo crítico arctg(μₛ)')).toBe('30,1°');
    expect(await leerFila(page, 'Rozamiento máximo μₛ·N')).toBe('19,71 N');
    expect(await leerFila(page, 'Rozamiento real')).toBe('19,62 N'); // = Pₓ, no μₛ·N
    expect(await leerFila(page, 'Aceleración')).toBe('0,00 m/s²');

    await sembrarValor(page, '#angulo', 31);
    await expect(veredicto(page)).toHaveText('El bloque desliza cuesta abajo');
    expect(await leerFila(page, 'Rozamiento real')).toBe('13,45 N');
    expect(await leerFila(page, 'Aceleración')).toBe('1,69 m/s²');
    expect(await leerFila(page, 'Tiempo en bajar 5,0 m')).toBe('2,43 s');
    expect(await leerFila(page, 'Velocidad al llegar abajo')).toBe('4,11 m/s');
  });

  test('CASO B2 (θ = 0 con rozamiento) — N = m·g, Pₓ = 0 y el rozamiento no actúa', async ({
    page,
  }) => {
    await sembrarParametros(page, { masa: 7, angulo: 0, muS: 0.5, muK: 0.3, longitud: 4 });
    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    expect(await leerFila(page, 'Normal N = m·g·cos θ')).toBe('68,67 N');
    expect(await leerFila(page, 'Peso paralelo m·g·sen θ')).toBe('0,00 N');
    expect(await leerFila(page, 'Rozamiento máximo μₛ·N')).toBe('34,34 N'); // 0,5·68,67 = 34,335
    expect(await leerFila(page, 'Rozamiento real')).toBe('0,00 N');
  });

  test('CASO B3 (F = −30 N) — el balance de energía cierra con el trabajo de F (H4)', async ({
    page,
  }) => {
    await sembrarParametros(page, { masa: 5, angulo: 20, muS: 0.5, muK: 0.3, fuerza: -30, longitud: 4 });
    await expect(veredicto(page)).toHaveText('El bloque desliza cuesta abajo');
    expect(await leerFila(page, 'Aceleración')).toBe('6,59 m/s²');
    expect(await leerFila(page, 'Velocidad al llegar abajo')).toBe('7,26 m/s');
    expect(await leerFila(page, 'Energía potencial inicial')).toBe('67,10 J');
    expect(await leerFila(page, 'Disipado por rozamiento')).toBe('55,31 J');
    expect(await leerFila(page, 'Trabajo de la fuerza aplicada (−F·L)')).toBe('120,00 J');
    expect(await leerFila(page, 'Energía cinética al llegar (½·m·v²)')).toBe('131,79 J');
  });

  test('«Verlo en el simulador» de los casos 7 y 10 dice la verdad con los deslizadores', async ({
    page,
  }) => {
    // Caso 7: μₛ 0,75 → a 36° quieta, a 37° resbala (tg 36° = 0,727 · tg 37° = 0,754)
    await sembrarParametros(page, { masa: 5, angulo: 36, muS: 0.75, muK: 0.5, longitud: 4 });
    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    await sembrarValor(page, '#angulo', 37);
    await expect(veredicto(page)).toHaveText('El bloque desliza cuesta abajo');
    // Caso 10: 20 kg, 15°, μ = 0,30 → Pₓ + μ·N = 50,780297 + 56,854394 = 107,634691
    await sembrarParametros(page, { masa: 20, angulo: 15, muS: 0.3, muK: 0.3, fuerza: 107, longitud: 4 });
    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    await sembrarValor(page, '#fuerza', 108);
    await expect(veredicto(page)).toHaveText('El bloque sube por el plano');
  });
});

test.describe('Re-inspección 03/10/2026 — la animación', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  test('CASO A a media rampa — la posición y la velocidad instantáneas cumplen v² = 2·a·(L − u)', async ({
    page,
  }) => {
    // Relación independiente del instante exacto: si la integración no es la del movimiento
    // uniformemente acelerado (p. ej. Euler sin el ½·a·dt²), se separa unos 0,2 m²/s² en 1 s.
    // La holgura de 0,1 cubre el redondeo de la pantalla (u y v a ±0,005).
    await sembrarParametros(page, { masa: 6, angulo: 40, muS: 0.6, muK: 0.35, longitud: 7 });
    await pausarReloj(page);
    await botonSoltar(page).click();
    await page.clock.runFor(1000);
    await expect(botonSoltar(page)).toHaveText(/Pausar/);
    await botonSoltar(page).click(); // pausa: la lectura no se mueve mientras se lee
    const u = await valor(page, 'Posición sobre la rampa');
    const v = await valor(page, 'Velocidad instantánea');
    expect(u).toBeGreaterThan(4.5); // a ~1 s: 7 − ½·3,675533·1² = 5,16 m
    expect(u).toBeLessThan(6.5);
    expect(Math.abs(v * v - 2 * 3.675533 * (7 - u))).toBeLessThan(0.1);
    // Reanudar termina el recorrido con la velocidad publicada
    await botonSoltar(page).click();
    await page.clock.runFor(3000);
    await expect.poll(() => leerFila(page, 'Posición sobre la rampa')).toBe('0,00 m');
    expect(await leerFila(page, 'Velocidad instantánea')).toBe('7,17 m/s');
  });

  test('CASO B4 (sube, F = +100 N) — soltar dos veces llega arriba igual (H1 en la rama «sube»)', async ({
    page,
  }) => {
    await sembrarParametros(page, { masa: 5, angulo: 20, muS: 0.5, muK: 0.3, fuerza: 100, longitud: 4 });
    await expect(veredicto(page)).toHaveText('El bloque sube por el plano');
    expect(await leerFila(page, 'Posición sobre la rampa')).toBe('0,00 m'); // parte de la base
    await pausarReloj(page);
    for (const suelta of [1, 2]) {
      await botonSoltar(page).click();
      await page.clock.runFor(2000);
      await expect.poll(() => leerFila(page, 'Posición sobre la rampa'), `suelta ${suelta}`).toBe('4,00 m');
      // √(2·13,879267·4) = 10,537274. Antes de la reparación de H1, la 2.ª suelta pasaba de largo.
      expect(await leerFila(page, 'Velocidad instantánea'), `suelta ${suelta}`).toBe('10,54 m/s');
    }
  });
});

test.describe('Re-inspección 03/10/2026 — el hero (sospecha b, descartada)', () => {
  // La píldora «Stemum › Física» acaba en x = 232 y el título centrado empieza en x = 247 a
  // 1024 px (255 a 1040, 295 a 1120): 0 puntos del h1 tapados de 1024 a 1120 y a 800 px. Con
  // «Física» la píldora es más corta que la de «Matemáticas» (x = 287, visualizador-volumenes).
  test('bajo stemum.com, de 1024 a 1120 px y a 800, la píldora no pisa el título', async ({ page }) => {
    await puenteHmr(page);
    await page.goto('http://stemum.com/simulador-plano-inclinado/');
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await expect(page.locator('[class*="stemumPill"]')).toBeVisible();
    const tapados: string[] = [];
    for (const ancho of [360, 390, 800, 1023, 1024, 1032, 1040, 1060, 1080, 1100, 1110, 1120]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      if (m.tapados > 0) tapados.push(`${ancho} px: ${m.tapados}/${m.total}`);
    }
    expect(tapados).toEqual([]);
  });

  test('en meskeia.com el logo no tapa el título (lote 586a4d61 y a1d72a9c)', async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    for (const ancho of [360, 390, 768, 800, 1023, 1024, 1280]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo el logo`).toBe(0);
    }
  });
});

/* ── «Casos para clase» en el navegador ─────────────────────────────────────────────────── */

const RESPUESTAS_A_MANO: Readonly<Record<number, string>> = {
  1: '49,05', // 10·9,81·sen 30°
  2: '84,96', // 98,1·cos 30° = 84,957092
  3: '4,905', // 9,81·sen 30°, con TRES decimales
  4: '4,05', // 9,81·(sen 40° − 0,3·cos 40°) = 4,051278
  5: '0', // tg 25° = 0,466 < 0,5
  6: '98,10', // en reposo: Fr = Pₓ = 20·9,81·0,5
  7: '36,87', // arctg 0,75 = 36,869898°
  8: '1,58', // √(8/3,205858) = 1,579694
  9: '6,01', // √(2·3,617810·5) = 6,014827
  10: '107,63', // 20·9,81·(sen 15° + 0,3·cos 15°) = 107,634691
  11: '196,20', // 8·9,81·5·sen 30°
  12: '424,79', // 0,1·50·9,81·cos 30°·10 = 424,785461
};

/**
 * Errores conceptuales típicos, calculados a mano: seno por coseno, ángulo en radianes, masa en
 * vez de peso, μₛ por μₖ, olvidar el rozamiento, sumarlo, signo de F, N = m·g, h = L, g = 10.
 * Ninguno cae hoy dentro de la tolerancia, y tiene que seguir así tras cualquier reparación.
 */
const ERRORES_CONCEPTUALES: Readonly<Record<number, readonly string[]>> = {
  1: ['84,96', '5', '-96,93', '50'], // cos · masa · rad · g = 10
  2: ['49,05', '98,1', '15,13', '86,6'], // sen · N = m·g · rad · g = 10
  3: ['8,496', '-9,693', '5'], // cos · rad · g = 10
  4: ['2,55', '6,31', '8,56', '5,62', '9,27', '8,10', '4,13'], // μₛ · sin roz · roz sumado · sen↔cos · rad · m·a · g = 10
  5: ['1,48', '4,15'], // «desliza» con μₖ · sin rozamiento
  6: ['118,94', '84,96', '169,91', '100'], // μₛ·N · μₖ·N · cos · g = 10
  7: ['0,64', '26,57', '48,59', '41,41'], // radianes · arctg μₖ · arcsen · arccos
  8: ['1,84', '1,28', '1,12', '1,10', '1,56'], // μₛ · sin roz · sin el 2 · roz sumado · g = 10
  9: ['4,91', '7,50', '4,25'], // μₛ · sin roz · sin el 2
  10: ['126,59', '-6,07', '50,78', '109,72'], // μₛ (arrancar) · signo del roz · solo Pₓ · g = 10
  11: ['392,4', '339,83', '20', '200'], // h = L · cos · masa · g = 10
  12: ['637,18', '245,25', '490,5', '433,01'], // μₛ · sen · N = m·g · g = 10
};

/** Vecinos, truncamientos y redondeos de más, fuera de lo que admite la PREGUNTA (ver el hallazgo). */
const VECINOS_QUE_NO_SON_LA_RESPUESTA: Readonly<Record<number, readonly string[]>> = {
  1: ['49,06', '49,1', '48,6', '49,5'],
  2: ['84,97', '85', '85,8', '84,2'],
  3: ['4,906', '4,91', '4,95', '4,86'],
  4: ['4,04', '4,06', '4,01', '4,09'],
  5: ['0,01'],
  6: ['98,11', '99', '97,2'],
  7: ['36,86', '36,88', '36,9', '37', '37,2'],
  8: ['1,57', '1,59'],
  9: ['6,00', '6,07', '6,05', '5,96'],
  10: ['108', '107', '108,7', '106,6'],
  11: ['196,21', '197', '198', '194,3'],
  12: ['424,8', '425', '429', '420,6'],
};

/** Escribe una respuesta en el caso abierto y devuelve el veredicto que pinta la app. */
async function corregir(page: Page, respuesta: string): Promise<string> {
  const sec = page.locator('#casos-aula');
  await sec.locator('#casos-respuesta').fill(respuesta);
  await sec.locator('#casos-comprobar').click();
  return ((await sec.locator('#casos-veredicto').textContent()) ?? '').trim();
}

async function abrirCaso(page: Page, id: number): Promise<void> {
  const boton = page.locator('#casos-aula').getByRole('button', { name: new RegExp(`^Caso ${id}:`) });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

test.describe('Re-inspección 03/10/2026 — el corrector de «Casos para clase»', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#casos-respuesta', ...DESLIZADORES]);
  });

  test('las doce claves resueltas a mano se aceptan y ningún error conceptual típico cuela', async ({
    page,
  }) => {
    const mal: string[] = [];
    for (let id = 1; id <= 12; id++) {
      await abrirCaso(page, id);
      if (!(await corregir(page, RESPUESTAS_A_MANO[id])).includes('¡Correcto!')) {
        mal.push(`caso ${id}: rechaza la clave ${RESPUESTAS_A_MANO[id]}`);
      }
      for (const error of ERRORES_CONCEPTUALES[id]) {
        if ((await corregir(page, error)).includes('¡Correcto!')) mal.push(`caso ${id}: acepta ${error}`);
      }
    }
    expect(mal).toEqual([]);
  });

  test('«Practicar» da la respuesta que sale a mano (semillas fijas de Date.now)', async ({ page }) => {
    const sec = page.locator('#casos-aula');
    const esperados: [number, RegExp, string][] = [
      // 2 kg, 40°, μₛ 0,6, μₖ 0,1 → 9,81·(sen 40° − 0,1·cos 40°) = 5,554258
      [1, /2 kg .*40°, con μₛ = 0,6 y μₖ = 0,1/, '5,55 m/s²'],
      // 10 kg, 45° → 98,1·sen 45° = 69,367175
      [2, /10 kg .*45°/, '69,37 N'],
      // 10 kg, 15°, μₛ 0,2, μₖ 0,1, rampa 3 m → a = 1,591441, t = √(6/a) = 1,941694
      [1234, /10 kg .*15°, con μₛ = 0,2 y μₖ = 0,1.*rampa de 3 m/, '1,94 s'],
    ];
    for (const [semilla, enunciado, clave] of esperados) {
      await page.evaluate((s) => {
        Date.now = () => s;
      }, semilla);
      await sec.locator('#casos-practicar').click();
      await expect(sec.locator('#casos-enunciado')).toHaveText(enunciado);
      await sec.getByRole('button', { name: /Ver solución/ }).click();
      await expect(sec.locator('#casos-resultado')).toContainText(clave);
    }
  });

  // HALLAZGO 2783 (calculo, medio) — REPARADO el 03/10/2026: la tolerancia es la de la PREGUNTA
  // (media unidad del último decimal pedido alrededor de la cifra sin redondear, 0 si es exacta),
  // como en simulador-mas-resorte (2626). El acta, tal como se levantó: `comprobarRespuesta`
  // acepta cualquier cosa a menos del 1 % de la clave REDONDEADA (`toleranciaDe`, casos.ts:392).
  // Los doce enunciados dan datos exactos (g = 9,81 declarada, μ y masas exactos), así que la
  // pregunta solo admite media unidad del redondeo pedido. Con el 1 % cuelan, en los doce, ±1 en
  // la última cifra, el truncamiento y el redondeo de más: 37 por 36,87°, 107 y 108 por
  // 107,63 N, 198 por 196,20 J, 429 por 424,79 J, 4,86–4,95 en el caso 3, que pide TRES
  // decimales (4,905). Y el caso 9 acepta 6,07, que es lo que sale con g = 10, cuando la
  // introducción dice «g = 10, no» y su pista «con g = 10 el resultado queda fuera de la
  // tolerancia». Ningún error conceptual cuela (test de arriba). Los vecinos de la lista están
  // fuera incluso si la reparación decidiera admitir g = 9,8 además de 9,81.
  test('el corrector rechaza vecinos, truncamientos y redondeos de más', async ({ page }) => {
    const colados: string[] = [];
    for (let id = 1; id <= 12; id++) {
      await abrirCaso(page, id);
      for (const vecino of VECINOS_QUE_NO_SON_LA_RESPUESTA[id]) {
        if ((await corregir(page, vecino)).includes('¡Correcto!')) colados.push(`caso ${id}: ${vecino}`);
      }
    }
    // Practicar, semilla 2 (Pₓ = 69,37 N): el entero 69 y la décima 69,4 tampoco son la respuesta
    await page.evaluate(() => {
      Date.now = () => 2;
    });
    await page.locator('#casos-practicar').click();
    await expect(page.locator('#casos-enunciado')).toContainText('10 kg');
    for (const vecino of ['69', '69,4']) {
      if ((await corregir(page, vecino)).includes('¡Correcto!')) colados.push(`práctica 2: ${vecino}`);
    }
    expect(colados).toEqual([]);
    // Y la clave de esa práctica sí entra, con coma y con punto decimal
    expect(await corregir(page, '69,37')).toContain('¡Correcto!');
    expect(await corregir(page, '69.37')).toContain('¡Correcto!');
  });

  test('2783 · la pista del caso 2 lleva a la clave, y el caso 9 con g = 10 queda fuera', async ({
    page,
  }) => {
    // La pista daba cos 30° ≈ 0,866, y 98,1·0,866 = 84,9546 → 84,95, que el corrector nuevo
    // rechaza con razón (la clave es 98,1·cos 30° = 84,957092 → 84,96). Ahora da 0,8660254.
    await abrirCaso(page, 2);
    await page.locator('#casos-aula').getByRole('button', { name: /Ver pista/ }).click();
    await expect(page.locator('#casos-pista')).toContainText('0,8660254');
    expect(await corregir(page, '84,96')).toContain('¡Correcto!');
    expect(await corregir(page, '84,95')).toContain('No es correcto');
    // Caso 9: con la pista (sen 35° ≈ 0,5736, cos 35° ≈ 0,8192) sale 6,0149 → 6,01; con g = 10,
    // √(2·10·(0,573576 − 0,25·0,819152)·5) = 6,0727 → 6,07, que su pista dice que no vale.
    await abrirCaso(page, 9);
    expect(await corregir(page, '6,01')).toContain('¡Correcto!');
    expect(await corregir(page, '6,07')).toContain('No es correcto');
  });

  // HALLAZGO 2784 (operativa, bajo) — REPARADO el 03/10/2026: `leerRespuesta` lee un punto solo
  // como decimal (ninguna respuesta llega a mil), la forma del 2384. El acta: el caso 3 es el
  // único que pide TRES decimales, y
  // `parseSpanishNumber` lee «4.905» como millares (un punto seguido de un grupo de tres cifras).
  // Quien escribe la respuesta exacta con punto decimal, como en México y buena parte de
  // Latinoamérica, recibe «No es correcto. Te has desviado 4900,1 de la respuesta». Con dos
  // decimales («4.05») no pasa. Es la forma del hallazgo 2384 (simulador-campo-electrico).
  test('caso 3: la respuesta exacta escrita con punto decimal («4.905») no se da por mala', async ({
    page,
  }) => {
    await abrirCaso(page, 3);
    expect(await corregir(page, '4,905')).toContain('¡Correcto!');
    expect(await corregir(page, '4.905')).not.toContain('No es correcto');
    expect(await corregir(page, '4.905')).toContain('¡Correcto!');
    // Y un error con punto se mide como error, no como millares: 4,95 está a 0,045
    expect(await corregir(page, '4.950')).toContain('Te has desviado 0,045');
  });

  // HALLAZGO 2791 (contenido, bajo) — REPARADO el 03/10/2026. La introducción escribía «una
  // desviación del 1 %» con espacio normal (U+0020). Con el corrector nuevo (2783) la frase del
  // 1 % ya no es verdad y se fue con él: la intro describe ahora el criterio de la pregunta. El
  // test mira las dos cosas, porque sin la segunda pasaría también con la intro vacía.
  test('la introducción no separa el «%» con un espacio normal', async ({ page }) => {
    const intro = (await page.locator('#casos-aula p').first().textContent()) ?? '';
    expect(intro).not.toMatch(/\d ?%/);
    expect(intro).not.toMatch(/\d (m\/s|N\b|J\b|kg\b)/); // unidades con espacio duro
    expect(intro).toContain('no hay margen');
    expect(intro).toContain('redondea solo al final');
    expect(intro).not.toContain('1\u00A0%'); // ni el 1 % de antes, con espacio duro
  });
});

/* ── Rótulos, contraste y lectura ───────────────────────────────────────────────────────── */

/** Contraste WCAG entre dos colores «rgb(r, g, b)». */
function contraste(a: string, b: string): number {
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = (color: string) => {
    const [r, g, bl] = (color.match(/\d+(\.\d+)?/g) ?? []).map(Number);
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(bl);
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Espera a que no quede ninguna transición en curso (los botones y el tema las tienen). */
async function esperarSinTransiciones(page: Page): Promise<void> {
  await page.mouse.move(0, 0);
  await page.waitForFunction(() => document.getAnimations().length === 0);
}

async function pasarAOscuro(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await esperarSinTransiciones(page);
}

/** Pares texto/fondo de los textos en color de marca, con el fondo real (degradado: sus paradas). */
async function paresDeMarca(page: Page): Promise<{ nombre: string; texto: string; fondos: string[] }[]> {
  return page.evaluate(() => {
    const fondosDe = (el: Element): string[] => {
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = getComputedStyle(e);
        const paradas = c.backgroundImage.match(/rgba?\([^)]+\)/g);
        if (paradas) return paradas;
        const a = c.backgroundColor.match(/rgba\([^)]*,\s*([\d.]+)\)/);
        if (c.backgroundColor !== 'transparent' && !(a && Number(a[1]) < 0.5)) return [c.backgroundColor];
      }
      return ['rgb(255, 255, 255)'];
    };
    const sel: Record<string, string> = {
      'Soltar el bloque': '[class*="calcBtn"]:not([class*="Ghost"])',
      'valor del deslizador': '[class*="valueBadge"]',
      'aceleración (resultado destacado)': '[class*="resultValueAccent"]',
      'número de paso': '[class*="stepNumber"]',
      'título de escenario': '[class*="escenarioCard"] h4',
      // No es de marca, pero va sobre el mismo degradado: en oscuro se quedaba en 4,43–4,48:1
      'etiqueta de resultados': '[class*="resultBlock"] [class*="resultLabel"]',
    };
    return Object.entries(sel).map(([nombre, s]) => {
      const el = document.querySelector(s)!;
      return { nombre, texto: getComputedStyle(el).color, fondos: fondosDe(el) };
    });
  });
}

test.describe('Re-inspección 03/10/2026 — contraste y rótulos (escritorio)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  // HALLAZGO 2786 (accesibilidad, medio) — REPARADO el 03/10/2026: --primary-boton bajo texto
  // blanco, --primary-texto como texto, y en oscuro un tono propio para la aceleración y las
  // etiquetas sobre el degradado. Bajo stemum.com, el test de abajo. El acta: texto en color de
  // marca por debajo de 4,5:1, y
  // ninguno es texto grande (≤ 16 px en negrita). En claro: «Soltar el bloque» y los números de
  // los pasos, blanco sobre --primary (4,11:1); los valores de los deslizadores y los títulos de
  // los escenarios, --primary sobre la tarjeta (4,11:1); la aceleración, --primary sobre el
  // degradado de resultados (3,77–3,92:1). En oscuro: «Soltar el bloque» y los pasos, blanco
  // sobre #3FA5D1 (2,79:1; 2,21:1 bajo stemum.com); la aceleración, #3FA5D1 sobre #1e3a5f →
  // #14532d (3,26–4,12:1). Existen --primary-boton y --primary-texto.
  test('los textos en color de marca llegan a 4,5:1 en los dos temas', async ({ page }) => {
    // Un estado que desliza, para que «Soltar el bloque» esté activo (desactivado no cuenta)
    await sembrarValor(page, '#angulo', 40);
    await expect(botonSoltar(page)).toBeEnabled();
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await esperarSinTransiciones(page);
    const bajos = (pares: { nombre: string; texto: string; fondos: string[] }[]) =>
      pares
        .map((p) => ({ ...p, ratio: Math.min(...p.fondos.map((f) => contraste(p.texto, f))) }))
        .filter((p) => p.ratio < 4.5)
        .map((p) => `${p.nombre} ${p.ratio.toFixed(2)}:1`);
    const claro = bajos(await paresDeMarca(page));
    await pasarAOscuro(page);
    const oscuro = bajos(await paresDeMarca(page));
    expect({ claro, oscuro }).toEqual({ claro: [], oscuro: [] });
  });

  // 2786 bajo stemum.com: el portal cambia --primary a violeta (#C99BF5 en oscuro, que con texto
  // blanco daba 2,21:1). Se sirve la app con data-brand="stemum" (host mapeado al servidor local
  // al principio del fichero, con el puente de HMR para que se hidrate) y se miden los dos temas.
  test('2786 · bajo stemum.com los textos de marca también llegan a 4,5:1 en los dos temas', async ({
    page,
  }) => {
    await puenteHmr(page);
    await page.goto('http://stemum.com/simulador-plano-inclinado/');
    await esperarHidratacion(page, DESLIZADORES);
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await sembrarValor(page, '#angulo', 40);
    await expect(botonSoltar(page)).toBeEnabled();
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await esperarSinTransiciones(page);
    const bajos = (pares: { nombre: string; texto: string; fondos: string[] }[]) =>
      pares
        .map((p) => ({ ...p, ratio: Math.min(...p.fondos.map((f) => contraste(p.texto, f))) }))
        .filter((p) => p.ratio < 4.5)
        .map((p) => `${p.nombre} ${p.ratio.toFixed(2)}:1`);
    const claro = bajos(await paresDeMarca(page));
    await pasarAOscuro(page);
    const pares = await paresDeMarca(page);
    // Que de verdad es el violeta del portal y no el azul de meskeIA
    expect(pares.find((p) => p.nombre === 'valor del deslizador')?.texto).toBe('rgb(201, 155, 245)');
    const oscuro = bajos(pares);
    expect({ claro, oscuro }).toEqual({ claro: [], oscuro: [] });
  });

  // HALLAZGO 2787 (accesibilidad, bajo) — REPARADO el 03/10/2026: #c2410c y #7e22ce (sin la
  // transparencia en el rótulo), --primary-texto en «θ», el bloque en --primary-boton y «x»/«y»
  // con variante oscura. El acta: rótulos del diagrama por debajo de 4,5:1 (son de
  // 12-15 px). En claro, sobre #f8fafc: «Fr = …» (#ea580c) 3,40:1, «Px/Py = …» (#9333ea al 75 %)
  // 3,43:1 y «θ = …» (--primary) 3,92:1. En los dos temas, la masa del bloque, blanco sobre el
  // #2e86ab fijo del bloque, 4,11:1. En oscuro, «x» e «y» de «Ejes girados» siguen en #64748b
  // (no tienen variante oscura) sobre #0f172a: 3,75:1.
  test('los rótulos del diagrama se leen sobre el lienzo (4,5:1) en los dos temas', async ({ page }) => {
    await page.getByLabel('Ejes girados').check();
    await esperarSinTransiciones(page);
    const medir = () =>
      page.evaluate(() => {
        const svg = document.querySelector('svg[viewBox="0 0 800 460"]')!;
        const lienzo = getComputedStyle(svg).backgroundColor;
        const relleno = (sel: string) => {
          const t = svg.querySelector(sel)!;
          let opacidad = 1;
          for (let e: Element | null = t; e && e !== svg; e = e.parentElement) {
            opacidad *= Number(getComputedStyle(e).opacity);
          }
          return { color: getComputedStyle(t).fill, opacidad };
        };
        return {
          lienzo,
          bloque: getComputedStyle(svg.querySelector('rect')!).fill,
          rotulos: {
            rozamiento: relleno('[class*="vRozamiento"] text'),
            componente: relleno('[class*="vComponente"] text'),
            angulo: relleno('[class*="textoAngulo"]'),
            eje: relleno('[class*="textoEje"]'),
          },
          masa: relleno('[class*="textoBloque"]'),
        };
      });
    /** Color efectivo de un texto semitransparente sobre su fondo. */
    const mezcla = (c: string, fondo: string, a: number) => {
      const [r, g, b] = (c.match(/\d+(\.\d+)?/g) ?? []).map(Number);
      const [R, G, B] = (fondo.match(/\d+(\.\d+)?/g) ?? []).map(Number);
      return `rgb(${r * a + R * (1 - a)}, ${g * a + G * (1 - a)}, ${b * a + B * (1 - a)})`;
    };
    const bajos = (m: Awaited<ReturnType<typeof medir>>) => {
      const fuera = Object.entries(m.rotulos)
        .map(([nombre, r]) => [nombre, contraste(mezcla(r.color, m.lienzo, r.opacidad), m.lienzo)] as const)
        .filter(([, ratio]) => ratio < 4.5)
        .map(([nombre, ratio]) => `${nombre} ${ratio.toFixed(2)}:1`);
      const masa = contraste(m.masa.color, m.bloque);
      if (masa < 4.5) fuera.push(`masa del bloque ${masa.toFixed(2)}:1`);
      return fuera;
    };
    const claro = bajos(await medir());
    await pasarAOscuro(page);
    const oscuro = bajos(await medir());
    expect({ claro, oscuro }).toEqual({ claro: [], oscuro: [] });
  });

  // HALLAZGO 2788 (operativa, bajo) — REPARADO el 03/10/2026: `colocarRotulos` aparta en vertical
  // el rótulo que pisa a otro ya colocado. Se miden los tres casos de la ficha. El acta: cuando
  // la fuerza aplicada va en la misma recta que otra
  // fuerza, sus flechas salen del mismo punto y sus rótulos se montan. Con los valores por
  // defecto y F = +10 N (el bloque sigue quieto: |10 − 20,73| ≤ 22,23), F y el rozamiento
  // estático apuntan los dos cuesta arriba y «Fr = 10,7 N» y «F = 10,0 N» se tapan un 96 %; con
  // F = −10 N, «F» tapa un 28 % de «Px». Es justo el estado que enseña que el estático se ajusta.
  test('con F = +10 N los rótulos «Fr» y «F» del diagrama no se tapan', async ({ page }) => {
    /** Fracción de la caja menor que tapa la otra, entre dos rótulos localizados por su prefijo. */
    const solape = (a: string, b: string) =>
      page.evaluate(
        ([pa, pb]) => {
          const caja = (prefijo: string) =>
            Array.from(document.querySelectorAll('svg g > text'))
              .find((t) => (t.textContent ?? '').startsWith(prefijo))!
              .getBoundingClientRect();
          const x1 = caja(pa);
          const x2 = caja(pb);
          const x = Math.max(0, Math.min(x1.right, x2.right) - Math.max(x1.left, x2.left));
          const y = Math.max(0, Math.min(x1.bottom, x2.bottom) - Math.max(x1.top, x2.top));
          return (x * y) / Math.min(x1.width * x1.height, x2.width * x2.height);
        },
        [a, b] as const,
      );
    // El caso de la ficha: 5 kg, 25°, μₛ 0,50 y F = +10 N, quieto
    await sembrarValor(page, '#fuerza', 10);
    await expect(veredicto(page)).toHaveText('El bloque NO desliza');
    await expect(page.locator('svg g > text', { hasText: /^Fr = 10,7 N$/ })).toHaveCount(1);
    expect(await solape('Fr = ', 'F = ')).toBeLessThan(0.1);
    // F = −10 N: «F» y «Px» apuntan los dos cuesta abajo (antes, 28 %)
    await sembrarValor(page, '#fuerza', -10);
    await expect(page.locator('svg g > text', { hasText: /^F = 10,0 N$/ })).toHaveCount(1);
    expect(await solape('F = ', 'Px = ')).toBeLessThan(0.1);
    // F = +5 N a 40°: desliza y el cinético apunta cuesta arriba con F (antes, 42 %)
    await sembrarValor(page, '#fuerza', 5);
    await sembrarValor(page, '#angulo', 40);
    await expect(veredicto(page)).toHaveText('El bloque desliza cuesta abajo');
    await expect(page.locator('svg g > text', { hasText: /^Fr = 11,3 N$/ })).toHaveCount(1);
    expect(await solape('Fr = ', 'F = ')).toBeLessThan(0.1);
    // Y ningún par de rótulos se tapa en ninguno de los tres
    for (const f of [10, -10, 5]) {
      await sembrarValor(page, '#fuerza', f);
      const peor = await page.evaluate(() => {
        const cajas = Array.from(document.querySelectorAll('svg g > text')).map((t) =>
          t.getBoundingClientRect(),
        );
        let max = 0;
        for (let i = 0; i < cajas.length; i++) {
          for (let j = i + 1; j < cajas.length; j++) {
            const [a, b] = [cajas[i], cajas[j]];
            const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            max = Math.max(max, (x * y) / Math.min(a.width * a.height, b.width * b.height));
          }
        }
        return max;
      });
      expect(peor, `F = ${f} N`).toBeLessThan(0.1);
    }
  });

  // HALLAZGO 2790 (accesibilidad, bajo) — REPARADO el 03/10/2026: los seis llevan aria-valuetext
  // con coma decimal y unidad (separada con espacio duro). El acta: los seis deslizadores no
  // tenían aria-valuetext: el
  // lector anuncia el valor crudo del <input type="range">, con punto decimal y sin unidad
  // («0.5», «0.3»), aunque el rótulo de al lado diga «0,50». Forma del hallazgo 1807.
  test('los deslizadores anuncian su valor en formato español', async ({ page }) => {
    await expect(page.locator('#mus')).toHaveAttribute('aria-valuetext', '0,50');
    await expect(page.locator('#muk')).toHaveAttribute('aria-valuetext', '0,30');
    await expect(page.locator('#masa')).toHaveAttribute('aria-valuetext', '5,0\u00A0kg');
    await expect(page.locator('#angulo')).toHaveAttribute('aria-valuetext', '25°');
    await expect(page.locator('#fuerza')).toHaveAttribute('aria-valuetext', '0\u00A0N');
    await expect(page.locator('#longitud')).toHaveAttribute('aria-valuetext', '4,0\u00A0m');
    // Y siguen al valor: la fuerza dice hacia dónde empuja, y la masa con medio kilo
    await sembrarValor(page, '#fuerza', -12);
    await expect(page.locator('#fuerza')).toHaveAttribute('aria-valuetext', '12\u00A0N cuesta abajo');
    await sembrarValor(page, '#masa', 7.5);
    await expect(page.locator('#masa')).toHaveAttribute('aria-valuetext', '7,5\u00A0kg');
    // El árbol de accesibilidad lo anuncia así, no «0.5»
    const arbol = await page.locator('#mus').ariaSnapshot();
    expect(arbol).toContain('0,50');
  });

  // HALLAZGO 2785 (calculo, bajo) — REPARADO el 03/10/2026: el panel y los casos redondean con
  // `redondearCifra` (sobre la cifra decimal, quitado el ruido binario). El acta: el mismo valor
  // exacto, 4,905, sale con dos redondeos
  // distintos en el mismo panel: con 0,5 kg, 30° y sin rozamiento, P = 0,5·9,81 = 4,905 N se
  // pinta «4,91 N» y a = 9,81·sen 30° = 4,905 m/s² se pinta «4,90 m/s²» (sen 30° en coma
  // flotante es 0,49999999999999994). El «Verlo en el simulador» del caso 3 lo deja por escrito
  // («da 4,90 m/s²») para un alumno al que se le enseña que 4,905 redondea a 4,91.
  test('un empate exacto se redondea igual en todo el panel', async ({ page }) => {
    await page.getByRole('button', { name: /Sin rozamiento/ }).click();
    await esperarValorEnReact(page, '#mus', 0);
    await esperarValorEnReact(page, '#muk', 0);
    await sembrarValor(page, '#angulo', 30);
    await sembrarValor(page, '#masa', 0.5);
    expect(await leerFila(page, 'Peso P = m·g')).toBe('4,91 N');
    expect(await valor(page, 'Aceleración')).toBe(await valor(page, 'Peso P = m·g'));
    // Y el texto del caso 3 cita lo que el panel pinta con 20 kg
    await sembrarValor(page, '#masa', 20);
    const aceleracion = await leerFila(page, 'Aceleración');
    await abrirCaso(page, 3);
    await page.locator('#casos-aula').getByRole('button', { name: /Verlo en el simulador/ }).click();
    await expect(page.locator('#casos-como-comprobar')).toContainText(aceleracion);
    expect(aceleracion).toBe('4,91 m/s²');
  });
});

test.describe('Re-inspección 03/10/2026 — el diagrama en móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('la página no se desborda en horizontal', async ({ page }) => {
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  // HALLAZGO 2789 (accesibilidad, bajo) — REPARADO el 03/10/2026: la letra de los rótulos se
  // escala con el ancho real del <svg>; en móvil llevan solo el nombre y las cifras van en una
  // leyenda HTML debajo. El acta: a 390 px el <svg> del diagrama mide 308 px para un
  // viewBox de 800: los rótulos de las fuerzas (12 px) se pintan a 12·308/800 ≈ 4,6 px, la masa
  // del bloque igual y «θ = …» a 5,8 px. Son las cifras del diagrama de cuerpo libre, y el texto
  // HTML más pequeño de la app mide 12 px. Mismo suelo de 10 px que en simulador-proyectiles.
  test('a 390 px los rótulos del diagrama se pintan a 10 px o más', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
    await page.getByLabel('Ejes girados').check(); // «x» e «y» también cuentan
    const medir = () =>
      page.locator('svg[viewBox="0 0 800 460"] text').evaluateAll((textos) =>
        textos.map((t) => {
          const escala = (t as SVGTextElement).ownerSVGElement!.getScreenCTM()!.a;
          return parseFloat(getComputedStyle(t).fontSize) * escala;
        }),
      );
    // La escala sale de medir el <svg> tras montarse: se espera a que se aplique
    await expect.poll(async () => Math.min(...(await medir()))).toBeGreaterThanOrEqual(10);
    expect((await medir()).length).toBeGreaterThan(5);
    // Las cifras no se pierden: van en la leyenda de debajo, con la masa del bloque
    const leyenda = page.locator('#leyenda-fuerzas');
    await expect(leyenda).toContainText('m = 5,0\u00A0kg');
    await expect(leyenda).toContainText('P = 49,1\u00A0N');
    await expect(leyenda).toContainText('Fr = 20,7\u00A0N');
    // Y no se montan entre sí (a 390 px el caso de la ficha también se tapaba)
    await sembrarValor(page, '#fuerza', 10);
    await expect(leyenda).toContainText('F = 10,0\u00A0N');
    const peor = await page.evaluate(() => {
      const cajas = Array.from(document.querySelectorAll('svg g > text')).map((t) =>
        t.getBoundingClientRect(),
      );
      let max = 0;
      for (let i = 0; i < cajas.length; i++) {
        for (let j = i + 1; j < cajas.length; j++) {
          const [a, b] = [cajas[i], cajas[j]];
          const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
          const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          max = Math.max(max, (x * y) / Math.min(a.width * a.height, b.width * b.height));
        }
      }
      return max;
    });
    expect(peor).toBeLessThan(0.1);
  });
});

/** Cuántos puntos del texto del <h1> (muestreo de 4 en 4 px) caen bajo la barra fija del logo. */
async function tituloBajoLaBarra(page: Page): Promise<{ total: number; tapados: number }> {
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  return page.locator('h1').evaluate((h1) => {
    const barra = document.querySelector('[class*="headerBar"]');
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    let total = 0;
    let tapados = 0;
    for (const q of Array.from(rango.getClientRects())) {
      for (let x = q.left + 2; x < q.right - 1; x += 4) {
        for (let y = q.top + 4; y < q.bottom - 3; y += 4) {
          total++;
          const e = document.elementFromPoint(x, y);
          if (e && barra?.contains(e)) tapados++;
        }
      }
    }
    return { total, tapados };
  });
}

/**
 * Bajo stemum.com, el `next dev` local rechaza el WebSocket de HMR (`allowedDevOrigins` solo
 * admite meskeia.com) y, sin él, la página no se hidrata: la píldora no llega a montarse. El
 * puente reenvía el socket a localhost:3050. Copiado de `visualizador-volumenes.spec.ts`; bajo
 * `next start` no hay HMR y no hace nada.
 */
async function puenteHmr(page: Page): Promise<void> {
  const abiertos: WebSocket[] = [];
  page.on('close', () => abiertos.forEach((s) => s.close()));
  await page.routeWebSocket(/\/_next\/(webpack-)?hmr/, (ws) => {
    const u = new URL(ws.url());
    const arriba = new WebSocket(`ws://localhost:3050${u.pathname}${u.search}`);
    arriba.binaryType = 'arraybuffer';
    abiertos.push(arriba);
    const cola: (string | Buffer)[] = [];
    arriba.onopen = () => {
      for (const m of cola) arriba.send(m);
      cola.length = 0;
    };
    ws.onMessage((m) => {
      if (arriba.readyState === WebSocket.OPEN) arriba.send(m);
      else cola.push(m);
    });
    arriba.onmessage = (e: MessageEvent) =>
      ws.send(typeof e.data === 'string' ? e.data : Buffer.from(e.data as ArrayBuffer));
    ws.onClose(() => arriba.close());
  });
}
