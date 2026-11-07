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

  test('CASO 3 (rechazo) · temporizador a 0 h 0 min 0 s: no arranca y dice por qué', async ({ page }) => {
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
    // REPARADO (hallazgo 4156): antes no pasaba nada y no se decía por qué
    await expect(page.getByRole('alert').filter({ hasText: 'mayor que cero' })).toBeVisible();
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
    // Cerrado el aviso, vuelve al tiempo elegido con el círculo vacío, listo para repetir
    // (hallazgo 4155: antes se quedaba en 00:00 con el círculo lleno hasta el siguiente arranque)
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('01:30');
    await expect(page.locator('[class*="circuloRelleno"]')).toHaveAttribute(
      'stroke-dashoffset',
      String(2 * Math.PI * 45),
    );
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
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('01:30');
  });

  test('HALLAZGO 4157 (07/11/2026, REPARADO) · formato español: 65,43 s se leen «01:05,43», con coma decimal', async ({
    page,
  }) => {
    // CLAUDE.md §2: la coma es el separador decimal. Antes: «01:05.43» (formatearTiempo pegaba
    // los centésimos con un punto), en el marcador y en cada vuelta.
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.fastForward(65430);
    await expect(page.locator(DISPLAY)).toHaveText('01:05,43');
    await boton(page, /Vuelta/).click();
    expect(await vueltas(page)).toEqual([['#1', '01:05,43', '+01:05,43']]);
  });

  test('HALLAZGO 4153 (07/11/2026, REPARADO) · cada pausa tiraba lo marchado desde el último tic: 4 × 1,005 s = 4,02 s', async ({
    page,
  }) => {
    // pausarCronometro se quedaba con el valor del último tic de 10 ms e iniciarCronometro
    // reanudaba desde ahí: lo marchado entre ese tic y el clic se perdía en cada pausa. Antes:
    // «00:04.00». Ahora la pausa lee Date.now() en el clic.
    await pararReloj(page);
    for (let i = 0; i < 4; i++) {
      await boton(page, /Iniciar/).click();
      await page.clock.runFor(1005);
      await boton(page, /Pausar/).click();
      await expect(boton(page, /Iniciar/)).toBeVisible();
    }
    await expect(page.locator(DISPLAY)).toHaveText(/^00:04[.,]02$/);
  });

  test('HALLAZGO 4154 (07/11/2026, REPARADO) · cuenta atrás de 3 s: a los 2,5 s quedan 0,5 s y marca 00:01, no 00:00', async ({
    page,
  }) => {
    // formatearTiempo redondeaba hacia abajo: el último segundo se veía «00:00» con la cuenta en
    // marcha y la alarma aún por sonar, y el primero duraba 100 ms. Ahora redondea por arriba.
    await abrirTemporizador(page, '0', '0', '3');
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.runFor(100);
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('00:03'); // el primer segundo dura 1 s
    await page.clock.runFor(2400);
    await expect(boton(page, /Pausar/)).toBeVisible(); // sigue en marcha
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('00:01');
  });

  test('HALLAZGO 4155 (07/11/2026, REPARADO) · el marcador del temporizador muestra el tiempo elegido: 05:00 de fábrica, atajo «10 min» → 10:00', async ({
    page,
  }) => {
    // El círculo pintaba tiempoTemporizador, que vale 0 hasta pulsar Iniciar: con 5 min por
    // defecto o con un atajo elegido, el número grande seguía en «00:00».
    await boton(page, /Temporizador/).click();
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('05:00');
    await page.getByRole('button', { name: '10 min', exact: true }).click();
    await expect(page.getByRole('spinbutton').nth(1)).toHaveValue('10'); // el atajo sí llega
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('10:00');
    await page.getByRole('button', { name: '1 hora', exact: true }).click();
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('1:00:00');
  });

  test('HALLAZGO 4156 (07/11/2026, REPARADO) · 2 min y −30 s no es una cuenta atrás válida: no arranca y lo dice', async ({
    page,
  }) => {
    // Los campos son min="0", pero iniciarTemporizador sumaba lo que hubiera: 2·60 − 30 = 90 s.
    await abrirTemporizador(page, '0', '2', '-30');
    await pararReloj(page);
    await boton(page, /Iniciar/).click();
    await page.clock.runFor(500);
    await expect(boton(page, /Pausar/)).toHaveCount(0);
    await expect(page.getByRole('alert').filter({ hasText: 'Revisa el tiempo' })).toBeVisible();
    // Al corregir el campo, el aviso se va y arranca
    const seg = page.getByRole('spinbutton', { name: /seg/i });
    await seg.fill('30');
    await esperarValorEnReact(page, seg, '30');
    await expect(page.getByRole('alert').filter({ hasText: 'Revisa el tiempo' })).toHaveCount(0);
    await boton(page, /Iniciar/).click();
    await expect(page.locator(DISPLAY_TEMP)).toHaveText('02:30');
    await expect(boton(page, /Pausar/)).toBeVisible();
  });

  test('HALLAZGO 4148 (07/11/2026, REPARADO) · la «alarma sonora» era un chasquido de 23 ms, una sola vez', async ({
    page,
  }) => {
    // El WAV en base64 declaraba 1.546 bytes de datos a 8.000 Hz (0,193 s) y solo traía 186
    // (0,023 s), sin bucle. Para una cuenta atrás de cocina o Pomodoro, con la pestaña detrás, es
    // lo único que avisa. Ahora: 1 s de tres pitidos, en bucle hasta cerrar el aviso de fin.
    await page.addInitScript(() => {
      const w = window as unknown as {
        __plays: { dur: number; loop: boolean }[];
        __alarma?: HTMLMediaElement;
      };
      w.__plays = [];
      const original = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
        w.__plays.push({ dur: this.duration, loop: this.loop });
        w.__alarma = this;
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
    expect(plays[0].loop).toBe(true);
    // El fichero entero, no un trozo: 8.000 muestras a 8.000 Hz
    if (!Number.isNaN(plays[0].dur)) expect(plays[0].dur).toBeCloseTo(1, 1);
    // Cerrado el aviso (el manejador de arriba lo acepta), se calla
    await expect
      .poll(() =>
        page.evaluate(() => (window as unknown as { __alarma?: HTMLMediaElement }).__alarma?.paused),
      )
      .toBe(true);
  });

  test('HALLAZGO 4150 (07/11/2026, REPARADO) · Pausar: blanco sobre ámbar a 2,15:1 (texto de 17,6 px exige 4,5:1)', async ({
    page,
  }) => {
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

  test('HALLAZGO 4151 (07/11/2026, REPARADO) · los campos horas, min y seg tienen nombre accesible', async ({
    page,
  }) => {
    // Los rótulos eran <span> sueltos: un lector de pantalla oía tres «botón de número» iguales.
    await boton(page, /Temporizador/).click();
    await expect(page.getByRole('spinbutton', { name: /hora/i })).toHaveCount(1);
    await expect(page.getByRole('spinbutton', { name: /min/i })).toHaveCount(1);
    await expect(page.getByRole('spinbutton', { name: /seg/i })).toHaveCount(1);
  });

  test('HALLAZGO 4158 (07/11/2026, REPARADO) · la flecha «↺» no entra en el nombre de Reiniciar', async ({ page }) => {
    // ▶, ⏸ y 🏁 iban en <span aria-hidden>; ↺ no.
    await expect(page.getByRole('button', { name: 'Reiniciar', exact: true })).toHaveCount(1);
    await boton(page, /Temporizador/).click();
    await expect(page.getByRole('button', { name: 'Reiniciar', exact: true })).toHaveCount(1);
  });

  test('HALLAZGO 4159 (07/11/2026, REPARADO) · la FAQ de Pomodoro decía «reinicia y repite», y Reiniciar borra las vueltas que llevan la cuenta', async ({
    page,
  }) => {
    // Reiniciar sigue borrando las vueltas, como avisan el paso 4 y los errores habituales: lo
    // que estaba mal era la instrucción. Ahora la FAQ manda reanudar con Iniciar, y así las
    // vueltas cuentan los ciclos.
    const pomodoro = page.locator('details', { hasText: '¿Cómo uso el cronómetro o el temporizador para la técnica Pomodoro?' });
    await expect(pomodoro).not.toContainText('reinicia y repite');
    await expect(pomodoro).toContainText('pulsa Iniciar, no Reiniciar');
    await pararReloj(page);
    for (let ciclo = 1; ciclo <= 2; ciclo++) {
      await boton(page, /Iniciar/).click();
      await page.clock.runFor(1000); // el bloque de trabajo
      await boton(page, /Vuelta/).click();
      await boton(page, /Pausar/).click(); // el descanso
      await page.clock.runFor(500);
    }
    await expect(page.locator('[class*="vueltaItem"]')).toHaveCount(2);
    await expect(page.locator(DISPLAY)).toHaveText('00:02,00'); // el descanso no cuenta
  });
});

test.describe('Cronómetro y Temporizador — lo publicado', () => {
  test('HALLAZGO 4160 (07/11/2026, REPARADO) · `features` del JSON-LD tenía 0 (§1.ter pide 4-8)', () => {
    const n = (jsonLd as { featureList?: string[] }).featureList?.length ?? 0;
    expect(n).toBeGreaterThanOrEqual(4);
    expect(n).toBeLessThanOrEqual(8);
  });

  test('HALLAZGO 4152 (07/11/2026, REPARADO) · la FAQ del JSON-LD contradecía a la visible y al código', async ({
    page,
  }) => {
    // Precisión: la visible (y el código) usa Date.now(); la del JSON-LD decía performance.now().
    // Pausa larga del Pomodoro: la página decía 20-30 min y el JSON-LD 15-30. Se queda 15-30, la
    // de Cirillo y la de temporizador-pomodoro del mismo catálogo (su FAQ y sus consejos).
    // Ahora las dos FAQ salen de PREGUNTAS_FRECUENTES (check:faq-unica).
    await page.goto(RUTA);
    const textoLd = faqJsonLd.mainEntity.map((q) => q.acceptedAnswer.text).join(' ');
    const html = await page.content();
    expect(html).toContain('Date.now()');
    expect(textoLd).not.toContain('performance.now()');
    expect(html).toContain('15-30 minutos');
    expect(textoLd).toContain('15-30 minutos');
    expect(html).not.toContain('20-30 minutos');
    // Una sola fuente: cada pregunta del FAQPage está en la página con la MISMA respuesta
    for (const q of faqJsonLd.mainEntity) {
      const item = page.locator('details', { hasText: q.name });
      await expect(item.locator('summary')).toHaveText(q.name);
      await expect(item.locator('p')).toHaveText(q.acceptedAnswer.text);
    }
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

  test('HALLAZGO 4149 (07/11/2026, REPARADO) · primera visita: Iniciar, Vuelta y Reiniciar dentro de la pantalla', async ({
    page,
  }) => {
    // El DisclaimerCard (desplegado en cada sesión, nivel medium) iba ANTES de la herramienta, no
    // en la posición 6 de la estructura estándar. Medido el 07/11/2026: aviso 320-565, Iniciar
    // 790-842, Vuelta 854-907, Reiniciar 919-971 con 839 de alto. Ahora va tras la herramienta.
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
