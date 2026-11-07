import { test, expect, devices, type Page } from '@playwright/test';
import { jsonLd, faqJsonLd } from '../../app/cronometro/metadata';
import { esperarValorEnReact } from './_hidratacion';

/**
 * Cronómetro y Temporizador — test de regresión del Inspector (1.ª pasada, 07/11/2026).
 * Salió en la cola con FIRMA DE ROTURA: 70 % de visitas cortas (catálogo 59 %) y 5,7 % de
 * recargas (catálogo 2,4 %) en 70 visitas.
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Cronómetro y Temporizador» · «Mide el tiempo con precisión desde el móvil (celular),
 *   tableta u ordenador».
 * · Panel: «Cronómetro — Mide tiempo con precisión de centésimas y registra vueltas» ·
 *   «Temporizador — Cuenta atrás con alarma sonora al finalizar» · «Presets rápidos».
 * · FAQ visible: usa Date.now() («error inferior a 10 ms»); al cambiar de pestaña «el tiempo
 *   final sigue siendo correcto porque se basa en Date.now(), no en el número de ticks».
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS (a mano, antes de ejecutar la app)
 * ──────────────────────────────────────────────────────────────────────
 * · El reloj lo lleva `page.clock`: instalado antes de cargar y PARADO antes del primer clic,
 *   de modo que cada `runFor(n)` son n ms exactos de marcha y `fastForward(n)` es la pestaña
 *   dormida (el reloj salta y los intervalos disparan una sola vez, al volver).
 *   ⚠️ `runFor` NO es instantáneo aquí: cede al navegador en cada tic y la app repinta la página
 *   entera cada 10 ms, así que un minuto de `runFor` cuesta ~65 s reales (medido el 07/11/2026).
 *   Los tramos largos van con `fastForward`, que da el mismo número porque la app calcula
 *   Date.now() − inicio; `runFor` queda para los tramos cortos donde importa cada tic.
 * · Con `serviceWorkers: 'block'` (playwright.config.ts) el registro del SW resuelve sin
 *   registro y su `setInterval(r.update, 1 h)` revienta al saltar una hora: el spec lo deja
 *   pendiente para siempre. Es cosa del bloqueo del test, no de la app.
 * · Lectura mm:ss,cc (h:mm:ss,cc desde una hora): 65.430 ms = 1 min 5 s 43 cs → «01:05,43».
 *   Las vueltas guardan el acumulado y su diferencia con la anterior.
 * · Cronómetro (CASO 1): 65,43 s → vuelta 1 (01:05,43 · +01:05,43) → 12,34 s más → vuelta 2
 *   (01:17,77 · +00:12,34) → 5 s en pausa no cuentan → 2,23 s más = 80,00 s → «01:20,00».
 * · Pestaña dormida (CASO 2): 10 s + salto de 3.589.990 ms = 3.599.990 ms → «59:59,99»; 10 ms
 *   más = 3.600.000 ms → «1:00:00,00».
 * · Temporizador 0 h 1 min 30 s = 90 s (CASO 4): a los 30 s quedan 60 s → «01:00» y el progreso
 *   es 30/90 = 1/3, así que el trazo del círculo (r = 45) deja sin pintar 2π·45·(2/3) = 188,50;
 *   10 s en pausa no cuentan; 20 s más → quedan 40 s → «00:40»; a los 90 s de marcha, alarma.
 * · Rechazo (CASO 3): 0:0:0 no es una cuenta atrás; 2 min y −30 s tampoco (los campos son
 *   `min="0"`).
 *
 * Lo que la app da bien se comprueba con el separador decimal libre ([.,]), para que el
 * hallazgo del formato no tape la mecánica; el formato va en su propio test.
 */

const RUTA = '/cronometro/';
const DISPLAY = '[class*="tiempoDisplay"]:not([class*="tiempoDisplayTemporizador"])';
const DISPLAY_TEMP = '[class*="tiempoDisplayTemporizador"]';

async function esperarBotonesHidratados(page: Page): Promise<void> {
  // Sin inputs en el modo cronómetro: el testigo es el fiber de React en el botón Iniciar
  // (cabecera de _hidratacion.ts: un clic en cuanto el botón tiene fiber llega 6 de 6).
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll('button')].find((x) =>
        (x.textContent ?? '').includes('Iniciar'),
      );
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactFiber$')));
    },
    null,
    { timeout: 15000 },
  );
}

async function abrir(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
    } catch {
      /* sin almacenamiento: saldrá el aviso */
    }
    // Ver la cabecera: sin esto, saltar una hora dispara el r.update() del SW bloqueado
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register = () => new Promise<ServiceWorkerRegistration>(() => {});
    }
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Cronómetro y Temporizador');
  await esperarBotonesHidratados(page);
}

async function pararReloj(page: Page): Promise<void> {
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(ahora + 1000);
}

const boton = (page: Page, nombre: RegExp) => page.getByRole('button', { name: nombre });

async function vueltas(page: Page): Promise<string[][]> {
  return page.locator('[class*="vueltaItem"]').evaluateAll((filas) =>
    filas.map((f) => [...f.querySelectorAll('span')].map((s) => (s.textContent ?? '').trim())),
  );
}

async function abrirTemporizador(page: Page, h: string, m: string, s: string): Promise<void> {
  await boton(page, /Temporizador/).click();
  const campos = page.getByRole('spinbutton');
  await expect(campos).toHaveCount(3);
  await campos.nth(0).fill(h);
  await esperarValorEnReact(page, campos.nth(0), h);
  await campos.nth(1).fill(m);
  await esperarValorEnReact(page, campos.nth(1), m);
  await campos.nth(2).fill(s);
  await esperarValorEnReact(page, campos.nth(2), s);
}

test.describe('Cronómetro y Temporizador — escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('CASO 1 (normal) · 65,43 s + vuelta + 12,34 s + vuelta + 5 s en pausa + 2,23 s = 01:20,00', async ({
    page,
  }) => {
    await pararReloj(page);
    await expect(page.locator(DISPLAY)).toHaveText(/^00:00[.,]00$/);
    await boton(page, /Iniciar/).click();
    // Los dos primeros segundos, tic a tic: el marcador avanza solo
    await page.clock.runFor(2000);
    await expect(page.locator(DISPLAY)).toHaveText(/^00:02[.,]00$/);
    await page.clock.fastForward(63430); // 2.000 + 63.430 = 65.430 ms
    await expect(page.locator(DISPLAY)).toHaveText(/^01:05[.,]43$/);
    await boton(page, /Vuelta/).click();
    await expect(page.locator('[class*="vueltaItem"]')).toHaveCount(1);

    await page.clock.fastForward(12340);
    await expect(page.locator(DISPLAY)).toHaveText(/^01:17[.,]77$/);
    await boton(page, /Vuelta/).click();
    await expect(page.locator('[class*="vueltaItem"]')).toHaveCount(2);

    await boton(page, /Pausar/).click();
    await page.clock.fastForward(5000);
    await expect(page.locator(DISPLAY)).toHaveText(/^01:17[.,]77$/); // la pausa congela

    await boton(page, /Iniciar/).click();
    await page.clock.runFor(2230);
    await expect(page.locator(DISPLAY)).toHaveText(/^01:20[.,]00$/);

    await expect(page.getByRole('heading', { name: 'Vueltas (2)' })).toBeVisible();
    const v = (await vueltas(page)).map((fila) => fila.map((t) => t.replace('.', ',')));
    // La más reciente arriba
    expect(v).toEqual([
      ['#2', '01:17,77', '+00:12,34'],
      ['#1', '01:05,43', '+01:05,43'],
    ]);
  });

  test('CASO 2 (límite) · pestaña dormida una hora: 59:59,99 al volver, 1:00:00,00 a los 10 ms, y Reiniciar a cero', async ({
    page,
  }) => {
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.fastForward(10000);
    await boton(page, /Vuelta/).click();
    await expect(page.locator('[class*="vueltaItem"]')).toHaveCount(1);

    // El salto es lo que vive una pestaña en segundo plano o un móvil con la pantalla apagada:
    // ningún tic en medio. 10.000 + 3.589.990 = 3.599.990 ms
    await page.clock.fastForward(3589990);
    await expect(page.locator(DISPLAY)).toHaveText(/^59:59[.,]99$/);
    await page.clock.runFor(10);
    await expect(page.locator(DISPLAY)).toHaveText(/^1:00:00[.,]00$/);

    // Reiniciar en marcha: para, vuelve a cero y borra las vueltas
    await boton(page, /Reiniciar/).click();
    await expect(page.locator(DISPLAY)).toHaveText(/^00:00[.,]00$/);
    await expect(page.locator('[class*="vueltaItem"]')).toHaveCount(0);
    await expect(boton(page, /Reiniciar/)).toBeDisabled();
    await expect(boton(page, /Vuelta/)).toBeDisabled();
    await page.clock.runFor(3000);
    await expect(page.locator(DISPLAY)).toHaveText(/^00:00[.,]00$/); // no sigue contando
  });

  test('CASO 3 (rechazo) · temporizador a 0 h 0 min 0 s: no arranca', async ({ page }) => {
    const dialogos: string[] = [];
    page.on('dialog', async (d) => {
      dialogos.push(d.message());
      await d.accept();
    });
    await abrirTemporizador(page, '0', '0', '0');
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.runFor(2000);
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('00:00');
    await expect(boton(page, /Iniciar/)).toBeVisible();
    await expect(boton(page, /Pausar/)).toHaveCount(0);
    expect(dialogos).toEqual([]);
  });

  test('CASO 4 (normal) · temporizador 1 min 30 s: 01:00 a los 30 s, pausa, 00:40 y alarma a los 90 s de marcha', async ({
    page,
  }) => {
    const dialogos: string[] = [];
    page.on('dialog', async (d) => {
      dialogos.push(d.message());
      await d.accept();
    });
    await abrirTemporizador(page, '0', '1', '30');
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('01:30');

    await page.clock.runFor(30000);
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('01:00');
    // 2π·45·(1 − 1/3) = 188,4956: vigila un progreso invertido (94,25) o sin avanzar (282,74)
    const offset = Number(
      await page.locator('[class*="circuloRelleno"]').getAttribute('stroke-dashoffset'),
    );
    expect(offset).toBeCloseTo(188.5, 0);

    await boton(page, /Pausar/).click();
    await page.clock.runFor(10000);
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('01:00'); // la pausa congela

    await boton(page, /Iniciar/).click();
    await page.clock.runFor(20000);
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('00:40');
    expect(dialogos).toEqual([]);

    await page.clock.runFor(40000);
    await expect.poll(() => dialogos).toEqual(['¡Tiempo terminado!']);
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('00:00');
    await expect(boton(page, /Iniciar/)).toBeVisible();
  });

  test('El temporizador también acaba bien con la pestaña dormida: 90 s de salto disparan la alarma al volver', async ({
    page,
  }) => {
    const dialogos: string[] = [];
    page.on('dialog', async (d) => {
      dialogos.push(d.message());
      await d.accept();
    });
    await abrirTemporizador(page, '0', '1', '30');
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.fastForward(120000);
    await expect.poll(() => dialogos).toEqual(['¡Tiempo terminado!']);
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('00:00');
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · formato español: 65,43 s se leen «01:05,43», con coma decimal', async ({
    page,
  }) => {
    // CLAUDE.md §2: la coma es el separador decimal. Hoy: «01:05.43» (formatearTiempo,
    // page.tsx:156 y 160, pega los centésimos con un punto). Afecta al marcador y a cada vuelta.
    test.fail();
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.fastForward(65430);
    await expect(page.locator(DISPLAY)).toHaveText(/^01:05[.,]43$/); // la cifra, bien
    await expect(page.locator(DISPLAY)).toHaveText('01:05,43'); // el separador, no
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · cada pausa tira lo marchado desde el último tic: 4 × 1,005 s = 4,02 s', async ({
    page,
  }) => {
    // pausarCronometro (page.tsx:68) se queda con el valor del último tic de 10 ms y
    // iniciarCronometro (page.tsx:62) reanuda desde ahí: lo marchado entre ese tic y el clic se
    // pierde en cada pausa (hasta 10 ms, más si el hilo va cargado). Hoy: «00:04.00».
    test.fail();
    await pararReloj(page);
    for (let i = 0; i < 4; i++) {
      await boton(page, /Iniciar/).click();
      await page.clock.runFor(1005);
      await boton(page, /Pausar/).click();
      await expect(boton(page, /Iniciar/)).toBeVisible();
    }
    await expect(page.locator(DISPLAY)).toHaveText(/^00:04[.,]02$/);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · cuenta atrás de 3 s: a los 2,5 s quedan 0,5 s y debe marcar 00:01, no 00:00', async ({
    page,
  }) => {
    // formatearTiempo redondea hacia abajo (Math.floor, page.tsx:148): el último segundo se ve
    // «00:00» con la cuenta en marcha y la alarma aún por sonar, y el primero dura 100 ms.
    test.fail();
    await abrirTemporizador(page, '0', '0', '3');
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.runFor(2500);
    await expect(boton(page, /Pausar/)).toBeVisible(); // sigue en marcha
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('00:01');
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · el marcador del temporizador no muestra el tiempo elegido: atajo «10 min» → 10:00', async ({
    page,
  }) => {
    // El círculo pinta tiempoTemporizador, que vale 0 hasta pulsar Iniciar (page.tsx:313): con
    // 5 min por defecto o con un atajo elegido, el número grande sigue en «00:00».
    test.fail();
    await boton(page, /Temporizador/).click();
    await page.getByRole('button', { name: '10 min', exact: true }).click();
    await expect(page.getByRole('spinbutton').nth(1)).toHaveValue('10'); // el atajo sí llega
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('10:00');
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · 2 min y −30 s no es una cuenta atrás válida y arranca 01:30', async ({
    page,
  }) => {
    // Los campos son min="0", pero iniciarTemporizador (page.tsx:99-103) suma lo que haya:
    // 2·60 − 30 = 90 s. Y 0:0:0 no arranca sin decir por qué (CASO 3).
    test.fail();
    await abrirTemporizador(page, '0', '2', '-30');
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.runFor(500);
    await expect(boton(page, /Pausar/)).toHaveCount(0);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · la «alarma sonora» es un chasquido de 23 ms, una sola vez', async ({
    page,
  }) => {
    // El WAV en base64 (page.tsx:53) declara 1.546 bytes de datos a 8.000 Hz (0,193 s) y solo
    // trae 186 (0,023 s), sin bucle. Para una cuenta atrás de cocina o Pomodoro, con la pestaña
    // detrás, es lo único que avisa. Esperado: un aviso audible (≥ 1 s o en bucle hasta parar).
    test.fail();
    await page.addInitScript(() => {
      const w = window as unknown as { __plays: { dur: number; loop: boolean }[] };
      w.__plays = [];
      const original = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
        w.__plays.push({ dur: this.duration, loop: this.loop });
        return original.call(this);
      };
    });
    page.on('dialog', (d) => d.accept());
    await page.reload();
    await esperarBotonesHidratados(page);
    await abrirTemporizador(page, '0', '0', '2');
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.runFor(2000);
    const plays = await page.evaluate(
      () => (window as unknown as { __plays: { dur: number; loop: boolean }[] }).__plays,
    );
    expect(plays).toHaveLength(1);
    expect(plays[0].loop || plays[0].dur >= 1).toBe(true);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · Pausar: blanco sobre ámbar a 2,15:1 (texto de 17,6 px exige 4,5:1)', async ({
    page,
  }) => {
    test.fail();
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.runFor(1000);
    await page.mouse.move(0, 0);
    const contraste = await boton(page, /Pausar/).evaluate((b) => {
      const lum = (rgb: string): number => {
        const [r, g, bl] = (rgb.match(/\d+/g) ?? []).slice(0, 3).map((n) => Number(n) / 255);
        const f = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
      };
      const s = getComputedStyle(b);
      const a = lum(s.color);
      const f = lum(s.backgroundColor);
      return (Math.max(a, f) + 0.05) / (Math.min(a, f) + 0.05);
    });
    expect(contraste).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · los campos horas, min y seg no tienen nombre accesible', async ({
    page,
  }) => {
    // Los rótulos son <span> sueltos (page.tsx:329, 341, 353): un lector de pantalla oye tres
    // «botón de número» iguales.
    test.fail();
    await boton(page, /Temporizador/).click();
    await expect(page.getByRole('spinbutton', { name: /hora/i })).toHaveCount(1);
    await expect(page.getByRole('spinbutton', { name: /min/i })).toHaveCount(1);
    await expect(page.getByRole('spinbutton', { name: /seg/i })).toHaveCount(1);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · la flecha «↺» entra en el nombre de Reiniciar', async ({ page }) => {
    // ▶, ⏸ y 🏁 van en <span aria-hidden>; ↺ no (page.tsx:265 y 390).
    test.fail();
    await expect(page.getByRole('button', { name: 'Reiniciar', exact: true })).toHaveCount(1);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · la FAQ de Pomodoro dice «reinicia y repite» y que las vueltas llevan la cuenta, pero Reiniciar las borra', async ({
    page,
  }) => {
    test.fail();
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.runFor(1000);
    await boton(page, /Vuelta/).click();
    await boton(page, /Pausar/).click();
    await boton(page, /Reiniciar/).click(); // «Tras el descanso, reinicia y repite»
    await expect(page.locator('[class*="vueltaItem"]')).toHaveCount(1);
  });
});

test.describe('Cronómetro y Temporizador — lo publicado', () => {
  test('HALLAZGO (07/11/2026, ABIERTO) · `features` del JSON-LD vacía (§1.ter pide 4-8)', () => {
    test.fail();
    expect((jsonLd as { featureList?: string[] }).featureList?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · la FAQ del JSON-LD contradice a la visible y al código', async ({
    page,
  }) => {
    // Precisión: la visible (y page.tsx:62-64) usa Date.now(); la del JSON-LD dice
    // performance.now(). Pausa larga Pomodoro: la página dice 20-30 min (FAQ y escenario), el
    // JSON-LD 15-30. La reparación es UNA constante PREGUNTAS_FRECUENTES (check:faq-unica).
    test.fail();
    await page.goto(RUTA);
    const textoLd = faqJsonLd.mainEntity.map((q) => q.acceptedAnswer.text).join(' ');
    const html = await page.content();
    expect(html).toContain('Date.now()');
    expect(textoLd).not.toContain('performance.now()');
    expect(html).toContain('20-30 minutos');
    expect(textoLd).toContain('20-30 minutos');
  });
});

const P7 = devices['Pixel 7'];

test.describe('Cronómetro y Temporizador — móvil (Pixel 7)', () => {
  test.use({
    viewport: P7.viewport,
    userAgent: P7.userAgent,
    deviceScaleFactor: P7.deviceScaleFactor,
    isMobile: P7.isMobile,
    hasTouch: P7.hasTouch,
  });

  test('Un toque arranca, 3 s marcan 00:03,00 y 1:23:45,67 cabe en el ancho', async ({ page }) => {
    await abrir(page);
    await pararReloj(page);
    await boton(page, /Iniciar/).tap();
    await page.clock.runFor(3000);
    await expect(page.locator(DISPLAY)).toHaveText(/^00:03[.,]00$/);
    // 3.000 + 5.022.670 = 5.025.670 ms = 1 h 23 min 45 s 67 cs
    await page.clock.fastForward(5022670);
    await expect(page.locator(DISPLAY)).toHaveText(/^1:23:45[.,]67$/);
    const ancho = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(ancho.sw).toBeLessThanOrEqual(ancho.cw);
  });

  test('HALLAZGO (07/11/2026, ABIERTO) · primera visita: Vuelta y Reiniciar quedan bajo el pliegue', async ({
    page,
  }) => {
    // El DisclaimerCard (desplegado en cada sesión, nivel medium) va ANTES de la herramienta
    // (page.tsx:204), no en la posición 6 de la estructura estándar. Medido el 07/11/2026:
    // aviso 320-565, Iniciar 790-842, Vuelta 854-907, Reiniciar 919-971 con 839 de alto.
    test.fail();
    await page.goto(RUTA);
    await esperarBotonesHidratados(page);
    const alto = page.viewportSize()?.height ?? 0;
    for (const nombre of [/Iniciar/, /Vuelta/, /Reiniciar/]) {
      const caja = await boton(page, nombre).boundingBox();
      expect(caja).not.toBeNull();
      expect((caja?.y ?? 0) + (caja?.height ?? 0)).toBeLessThanOrEqual(alto);
    }
  });
});
