import { test, expect, type Page, type Locator } from '@playwright/test';
import { jsonLd } from '../../app/temporizador-visual/metadata';
import { esperarValorEnReact } from './_hidratacion';

/**
 * Temporizador Visual — test de regresión del Inspector (1.ª pasada, 09/11/2026).
 *
 * QUÉ PROMETE LA APP
 * ──────────────────
 * · <h1> «Temporizador Visual» · «Elige cuánto tiempo quieres y pulsa Iniciar. El círculo te
 *   muestra cuánto queda». Presets de 1, 2, 5, 10, 15, 20 y 30 min y campo «Otro tiempo...»
 *   para «cualquier duración entre 1 y 180 minutos» (FAQ visible).
 * · FAQ visible: colores «Verde (más del 60 % restante) → Amarillo (40-60 %) → Naranja
 *   (20-40 %) → Rojo (menos del 20 %)»; al terminar «suena una secuencia de tres tonos
 *   ascendentes y el círculo queda en estado "Terminado". Debes pulsar Reiniciar»; en pantalla
 *   completa (F11) «el círculo ocupe toda la pantalla y sea visible desde lejos».
 * · `features` del JSON-LD: «Compatible con pantallas grandes y proyectores para uso en aula».
 *
 * DE DÓNDE SALEN LOS VALORES ESPERADOS (a mano, antes de ejecutar la app)
 * ──────────────────────────────────────────────────────────────────────
 * · El reloj lo lleva `page.clock`: instalado antes de cargar y PARADO antes del primer clic,
 *   así que cada `runFor(n)` son n ms exactos de marcha. `fastForward(n)` es la pestaña en
 *   segundo plano, la pantalla del móvil bloqueada o la tapa del portátil cerrada: el reloj
 *   salta y cada intervalo dispara UNA sola vez al volver (documentación de Playwright).
 * · Lectura MM:SS del tiempo que queda: 120 s − 30 s = 90 s → «01:30».
 * · Arco: circunferencia 2π·120 = 753,98; el trazo sin pintar es 753,98 × (1 − restante/total).
 *   90/120 → 188,50 · 65/120 → 345,58 · 40/120 → 502,65 · 20/120 → 628,32.
 * · Colores de la FAQ visible: 75 % verde · 54 % amarillo · 33 % naranja · 17 % rojo.
 * · Alarma: tres osciladores de 440, 550 y 660 Hz a los 0, 0,35 y 0,7 s (reproducirAlerta);
 *   con el sonido desactivado, ninguno.
 * · Límites del campo: 1 y 180 se aceptan (180 → «180:00»); 181, 0 y −5 se rechazan.
 * · Contraste (WCAG 2.1, 1.4.3): las cifras del círculo son texto grande (≈55 px, negrita) y
 *   piden 3:1; «Tiempo en marcha...» (17 px) y «Sonido activado» (15,2 px) piden 4,5:1.
 *   Calculado a mano: #22C55E sobre blanco 2,28:1 · #EAB308 1,92:1 · #F97316 2,80:1 ·
 *   #808080 sobre #2A2A2A 3,63:1 · #16A34A sobre su tinte oscuro 3,55:1.
 */

const RUTA = '/temporizador-visual/';

test.use({ locale: 'es-ES' });

interface Tono {
  f: number;
  retraso: number;
}

async function abrir(page: Page, opciones: { oscuro?: boolean } = {}): Promise<void> {
  await page.addInitScript((oscuro: boolean) => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
      if (oscuro) localStorage.setItem('meskeia-theme', 'dark');
    } catch {
      /* sin almacenamiento: saldrá el aviso */
    }
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register = () => new Promise<ServiceWorkerRegistration>(() => {});
    }
    // Testigo de la alarma: cuántos AudioContext y qué tonos arrancan
    const w = window as unknown as { __tonos: { f: number; retraso: number }[]; __contextos: number };
    w.__tonos = [];
    w.__contextos = 0;
    const Original = window.AudioContext;
    if (!Original) return;
    const crear = Original.prototype.createOscillator;
    Original.prototype.createOscillator = function (this: AudioContext): OscillatorNode {
      const osc = crear.call(this);
      const ctx = this;
      const arrancar = osc.start.bind(osc);
      osc.start = (cuando?: number) => {
        w.__tonos.push({ f: osc.frequency.value, retraso: Math.round(((cuando ?? 0) - ctx.currentTime) * 100) / 100 });
        arrancar(cuando);
      };
      return osc;
    };
    window.AudioContext = class extends Original {
      constructor(opciones?: AudioContextOptions) {
        super(opciones);
        w.__contextos++;
      }
    };
  }, Boolean(opciones.oscuro));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText(/Temporizador Visual/);
  // Testigo de hidratación: el fiber de React en el botón Iniciar (cabecera de _hidratacion.ts)
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll('button')].find((x) => (x.textContent ?? '').includes('Iniciar'));
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactFiber$')));
    },
    null,
    { timeout: 15000 },
  );
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(ahora + 1000);
}

const tiempo = (page: Page): Locator => page.locator('[role="timer"] svg text').nth(0);
const rotulo = (page: Page): Locator => page.locator('[role="timer"] svg text').nth(1);
const arco = (page: Page): Locator => page.locator('[role="timer"] svg circle').nth(1);
const principal = (page: Page): Locator =>
  page.getByRole('button', { name: /Iniciar|Pausar|Continuar|Terminado/ });
const preset = (page: Page, nombre: string): Locator => page.getByRole('button', { name: nombre, exact: true });
const campo = (page: Page): Locator => page.getByRole('spinbutton', { name: 'Tiempo personalizado en minutos' });
const aplicar = (page: Page): Locator => page.getByRole('button', { name: 'Aplicar tiempo personalizado' });

async function tonos(page: Page): Promise<Tono[]> {
  return page.evaluate(() => (window as unknown as { __tonos: Tono[] }).__tonos);
}

async function contextos(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __contextos: number }).__contextos);
}

async function offset(page: Page): Promise<number> {
  return Number(await arco(page).getAttribute('stroke-dashoffset'));
}

async function escribirMinutos(page: Page, valor: string): Promise<void> {
  await campo(page).fill(valor);
  await esperarValorEnReact(page, campo(page), valor);
}

/** Texto de cada región viva SIN lo que cuelga de un aria-hidden: lo que oye un lector. */
async function textoDeRegionesVivas(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const audible = (n: Node): string => {
      if (n.nodeType === Node.TEXT_NODE) return n.textContent ?? '';
      if (n instanceof Element && n.getAttribute('aria-hidden') === 'true') return '';
      return [...n.childNodes].map(audible).join(' ');
    };
    return [...document.querySelectorAll('[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"]')]
      .filter((el) => !el.closest('next-route-announcer'))
      .map((el) => audible(el).replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  });
}

function canales(css: string): number[] {
  return (css.match(/[\d.]+/g) ?? []).map(Number);
}

function luminancia([r, g, b]: number[]): number {
  const f = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contraste(a: number[], b: number[]): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function hexARgb(hex: string): number[] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

test.describe('Temporizador Visual — la cuenta atrás', () => {
  test('CASO 1 (normal) · 2 min: 01:30 verde a los 30 s, 01:05 amarillo a los 55 s, la pausa congela, 00:40 naranja y 00:20 rojo', async ({
    page,
  }) => {
    await abrir(page);
    await preset(page, '2 minutos').click();
    await expect(tiempo(page)).toHaveText('02:00');
    await expect(rotulo(page)).toHaveText('Listo para empezar');
    await expect(preset(page, '2 minutos')).toHaveAttribute('aria-pressed', 'true');

    await principal(page).click();
    await page.clock.runFor(30000);
    await expect(tiempo(page)).toHaveText('01:30');
    await expect(rotulo(page)).toHaveText('Tiempo en marcha...');
    await expect(tiempo(page)).toHaveAttribute('fill', '#22C55E'); // 75 %: verde
    expect(await offset(page)).toBeCloseTo(188.5, 0);
    await expect(page.locator('[role="timer"]')).toHaveAttribute('aria-label', 'Tiempo restante: 01:30');

    await page.clock.runFor(25000);
    await expect(tiempo(page)).toHaveText('01:05');
    await expect(tiempo(page)).toHaveAttribute('fill', '#EAB308'); // 54 %: amarillo
    expect(await offset(page)).toBeCloseTo(345.58, 0);

    // Pausa en un segundo entero (el intervalo acaba de disparar): no se pierde nada
    await principal(page).click();
    await expect(rotulo(page)).toHaveText('En pausa');
    await expect(principal(page)).toHaveText(/Continuar/);
    await page.clock.runFor(20000);
    await expect(tiempo(page)).toHaveText('01:05');

    await principal(page).click();
    await page.clock.runFor(25000);
    await expect(tiempo(page)).toHaveText('00:40');
    await expect(tiempo(page)).toHaveAttribute('fill', '#F97316'); // 33 %: naranja
    expect(await offset(page)).toBeCloseTo(502.65, 0);

    await page.clock.runFor(20000);
    await expect(tiempo(page)).toHaveText('00:20');
    await expect(tiempo(page)).toHaveAttribute('fill', '#EF4444'); // 17 %: rojo
    expect(await offset(page)).toBeCloseTo(628.32, 0);
  });

  test('CASO 2 (límite, fin de la cuenta) · 1 min: 00:01 a los 59 s, «¡Tiempo terminado!» y tres tonos a los 60 s, sin repetir, y Reiniciar vuelve a 01:00', async ({
    page,
  }) => {
    await abrir(page);
    await preset(page, '1 minuto').click();
    await principal(page).click();
    await page.clock.runFor(59000);
    await expect(tiempo(page)).toHaveText('00:01');
    await expect(principal(page)).toHaveText(/Pausar/);
    expect(await tonos(page)).toEqual([]);

    await page.clock.runFor(1000);
    await expect(tiempo(page)).toHaveText('00:00');
    await expect(rotulo(page)).toHaveText('¡Tiempo terminado!');
    await expect(principal(page)).toHaveText(/Terminado/);
    await expect(principal(page)).toBeDisabled();
    expect(await offset(page)).toBeCloseTo(753.98, 0); // círculo vacío
    await expect
      .poll(() => tonos(page))
      .toEqual([
        { f: 440, retraso: 0 },
        { f: 550, retraso: 0.35 },
        { f: 660, retraso: 0.7 },
      ]);

    await page.clock.runFor(5000);
    await expect(tiempo(page)).toHaveText('00:00'); // no sigue hacia negativo
    expect(await tonos(page)).toHaveLength(3); // la alarma suena una vez
    expect(await contextos(page)).toBe(1);

    await page.getByRole('button', { name: 'Reiniciar temporizador' }).click();
    await expect(tiempo(page)).toHaveText('01:00');
    await expect(rotulo(page)).toHaveText('Listo para empezar');
    await expect(principal(page)).toBeEnabled();
    expect(await offset(page)).toBeCloseTo(0, 1);
  });

  test('CASO 2b (límite) · con el sonido desactivado termina igual y no crea ningún AudioContext', async ({ page }) => {
    await abrir(page);
    await preset(page, '1 minuto').click();
    const sonido = page.locator('button[aria-pressed]').filter({ hasText: /Sonido/ });
    await sonido.click();
    await expect(sonido).toHaveAttribute('aria-pressed', 'false');
    await principal(page).click();
    await page.clock.runFor(61000);
    await expect(rotulo(page)).toHaveText('¡Tiempo terminado!');
    expect(await contextos(page)).toBe(0);
    expect(await tonos(page)).toEqual([]);
  });

  test('CASO 2c (límite del campo) · 180 min es el máximo admitido → «180:00»; 1 con Intro → «01:00» y el preset de 1 min marcado', async ({
    page,
  }) => {
    await abrir(page);
    await escribirMinutos(page, '180');
    await aplicar(page).click();
    await expect(tiempo(page)).toHaveText('180:00');
    await escribirMinutos(page, '1');
    await campo(page).press('Enter');
    await expect(tiempo(page)).toHaveText('01:00');
    await expect(preset(page, '1 minuto')).toHaveAttribute('aria-pressed', 'true');
  });

  test('CASO 3 (rechazo) · 181, 0 y −5 minutos no se aplican: el círculo sigue en 05:00 y arranca con 5 min', async ({
    page,
  }) => {
    await abrir(page);
    for (const valor of ['181', '0', '-5']) {
      await escribirMinutos(page, valor);
      await aplicar(page).click();
      await expect(tiempo(page)).toHaveText('05:00');
      await expect(rotulo(page)).toHaveText('Listo para empezar');
    }
    await principal(page).click();
    await page.clock.runFor(1000);
    await expect(tiempo(page)).toHaveText('04:59');
  });

  test('Cambiar de preset con la cuenta en marcha la para y pone el tiempo nuevo entero', async ({ page }) => {
    await abrir(page);
    await principal(page).click();
    await page.clock.runFor(3000);
    await expect(tiempo(page)).toHaveText('04:57');
    await preset(page, '10 minutos').click();
    await page.clock.runFor(3000);
    await expect(tiempo(page)).toHaveText('10:00');
    await expect(rotulo(page)).toHaveText('Listo para empezar');
  });
});

test.describe('Temporizador Visual — hallazgos de la 1.ª pasada (09/11/2026)', () => {
  test('HALLAZGO (09/11/2026, ABIERTO) · cuenta tics de setInterval: con la pestaña dormida 60 s, 5 min − 71 s de reloj marcan 04:48 y no 03:49', async ({
    page,
  }) => {
    // segundosRestantes baja 1 por cada disparo del intervalo de 1 s. Si el navegador no lo
    // dispara (pestaña en segundo plano más de 5 min, pantalla del móvil bloqueada, portátil
    // suspendido), la cuenta se para. Esperado: 300 − 10 − 60 − 1 = 229 s → «03:49». Hoy: «04:48».
    test.fail();
    await abrir(page);
    await principal(page).click();
    await page.clock.runFor(10000);
    await expect(tiempo(page)).toHaveText('04:50');
    await page.clock.fastForward(60000);
    await page.clock.runFor(1000);
    await expect(tiempo(page)).toHaveText('03:49');
  });

  test('HALLAZGO (09/11/2026, ABIERTO, el mismo) · 1 min con la pestaña dormida 120 s: al volver no ha terminado ni suena', async ({
    page,
  }) => {
    // Esperado: pasado el minuto, «¡Tiempo terminado!» y la alarma en cuanto la pestaña vuelve.
    // Hoy: «00:58» y «Tiempo en marcha...», sin ningún tono.
    test.fail();
    await abrir(page);
    await preset(page, '1 minuto').click();
    await principal(page).click();
    await page.clock.fastForward(120000);
    await page.clock.runFor(1000);
    await expect(rotulo(page)).toHaveText('¡Tiempo terminado!');
    await expect(tiempo(page)).toHaveText('00:00');
    await expect.poll(() => tonos(page)).toHaveLength(3);
  });

  test('HALLAZGO (09/11/2026, ABIERTO, el mismo) · cada pausa tira lo marchado desde el último tic: 4 × 1,5 s = 6 s y marca 04:56, no 04:54', async ({
    page,
  }) => {
    // Pausar borra el intervalo y Continuar crea otro que espera 1 s entero: el medio segundo
    // de cada tramo se pierde. Esperado: 300 − 6 = 294 s → «04:54». Hoy: «04:56».
    test.fail();
    await abrir(page);
    for (let i = 0; i < 4; i++) {
      await principal(page).click(); // Iniciar / Continuar
      await page.clock.runFor(1500);
      await principal(page).click(); // Pausar
      await expect(rotulo(page)).toHaveText('En pausa');
    }
    await expect(tiempo(page)).toHaveText('04:54');
  });

  test('HALLAZGO (09/11/2026, ABIERTO, el mismo) · cambiar el sonido en marcha reinicia el intervalo: 2 s con cuatro toques siguen en 05:00', async ({
    page,
  }) => {
    // El efecto del intervalo depende de [estado, sonidoActivo]: cada toque al sonido lo borra y
    // crea otro. Esperado: 300 − 2 = 298 s → «04:58». Hoy: «05:00».
    test.fail();
    await abrir(page);
    await principal(page).click();
    const sonido = page.locator('button[aria-pressed]').filter({ hasText: /Sonido/ });
    for (let i = 0; i < 4; i++) {
      await page.clock.runFor(500);
      await sonido.click();
    }
    await expect(tiempo(page)).toHaveText('04:58');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · «2,5» minutos se aplican como 02:00, sin aviso', async ({ page }) => {
    // El campo es type="number": en es-ES la coma tecleada llega como «2.5», y parseInt la corta
    // a 2. La FAQ visible promete «cualquier duración entre 1 y 180 minutos». Esperado: 02:30, o
    // que no se aplique y lo diga. Hoy: «02:00» y el campo se vacía.
    test.fail();
    await abrir(page);
    await campo(page).click();
    await page.keyboard.type('2,5');
    await esperarValorEnReact(page, campo(page), '2.5');
    await aplicar(page).click();
    const leido = await tiempo(page).textContent();
    if (leido === '05:00') {
      await expect(page.locator('[role="alert"], [role="status"]').filter({ hasText: /minuto/ })).toBeVisible();
    } else {
      expect(leido).toBe('02:30');
    }
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · 181 minutos se rechaza en silencio: ni un aviso del rango 1-180', async ({
    page,
  }) => {
    // aplicarPersonalizado no hace nada fuera de 1-180: el círculo sigue en 05:00, el campo
    // conserva «181» y el preset de 5 min pierde su marca. Esperado: un aviso que diga el rango.
    test.fail();
    await abrir(page);
    await escribirMinutos(page, '181');
    await aplicar(page).click();
    await expect(tiempo(page)).toHaveText('05:00');
    await expect(page.locator('[role="alert"], [role="status"]').filter({ hasText: /180/ })).toBeVisible();
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el fin no se anuncia: la región viva solo tiene un <svg aria-hidden>, y el foco cae a <body>', async ({
    page,
  }) => {
    // role="timer" aria-live="polite" envuelve un SVG con aria-hidden: lo único que cambia es su
    // aria-label, que una región viva no anuncia. Sin sonido (lo que la guía aconseja para
    // personas sensibles), un lector de pantalla no recibe nada. Además el botón con el foco pasa
    // a disabled y el foco se pierde.
    test.fail();
    await abrir(page);
    await preset(page, '1 minuto').click();
    await page.locator('button[aria-pressed]').filter({ hasText: /Sonido/ }).click();
    await principal(page).focus();
    await page.keyboard.press('Enter');
    await page.clock.runFor(60000);
    await expect(rotulo(page)).toHaveText('¡Tiempo terminado!');
    await expect.poll(() => textoDeRegionesVivas(page)).toContainEqual(expect.stringContaining('Tiempo terminado'));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · claro: las cifras del círculo en verde, amarillo y naranja no llegan a 3:1 sobre la tarjeta blanca', async ({
    page,
  }) => {
    // Hoy: verde #22C55E 2,28:1 · amarillo #EAB308 1,92:1 · naranja #F97316 2,80:1 (rojo 3,76:1).
    test.fail();
    await abrir(page);
    await preset(page, '1 minuto').click();
    const fondo = canales(
      await page.getByRole('region', { name: 'Temporizador', exact: true }).evaluate((s) => getComputedStyle(s).backgroundColor),
    );
    const medidos: Record<string, number> = {};
    medidos.verde = contraste(hexARgb((await tiempo(page).getAttribute('fill')) ?? ''), fondo);
    await principal(page).click();
    await page.clock.runFor(30000); // 50 %: amarillo
    await expect(tiempo(page)).toHaveText('00:30');
    medidos.amarillo = contraste(hexARgb((await tiempo(page).getAttribute('fill')) ?? ''), fondo);
    await page.clock.runFor(10000); // 33 %: naranja
    await expect(tiempo(page)).toHaveText('00:20');
    medidos.naranja = contraste(hexARgb((await tiempo(page).getAttribute('fill')) ?? ''), fondo);
    for (const [color, r] of Object.entries(medidos)) {
      expect(r, `${color}: ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
    }
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · oscuro: «Tiempo en marcha...» a 3,63:1 y «Sonido activado» a 3,55:1 (piden 4,5:1)', async ({
    page,
  }) => {
    // .svgEstado pasa a #808080 sobre #2A2A2A; «Sonido activado» usa var(--verde-texto, #16A34A)
    // y --verde-texto es `initial` en oscuro, así que manda #16A34A sobre su tinte verde al 12 %.
    test.fail();
    await abrir(page, { oscuro: true });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const seccion = page.getByRole('region', { name: 'Temporizador', exact: true });
    await expect.poll(() => seccion.evaluate((s) => getComputedStyle(s).backgroundColor)).toBe('rgb(42, 42, 42)');
    const fondo = canales(await seccion.evaluate((s) => getComputedStyle(s).backgroundColor));
    const estado = canales(await rotulo(page).evaluate((t) => getComputedStyle(t).fill));
    const sonido = page.locator('button[aria-pressed]').filter({ hasText: /Sonido/ });
    const [r, g, b, a] = canales(await sonido.evaluate((s) => getComputedStyle(s).backgroundColor));
    const alfa = a ?? 1;
    const fondoSonido = [r, g, b].map((c, i) => c * alfa + fondo[i] * (1 - alfa));
    const textoSonido = canales(await sonido.evaluate((s) => getComputedStyle(s).color));
    const rEstado = contraste(estado.slice(0, 3), fondo);
    const rSonido = contraste(textoSonido.slice(0, 3), fondoSonido);
    expect(rEstado, `estado ${rEstado.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    expect(rSonido, `sonido ${rSonido.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · F11 «para que el círculo ocupe toda la pantalla»: en 1920×1080 el círculo mide 320 px', async ({
    page,
  }) => {
    // max-width: 320px en .timerContainer. Si la página sigue prometiendo pantalla completa o
    // proyector, el círculo debe crecer con ella; si deja de prometerlo, este test pasa.
    test.fail();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await abrir(page);
    const prometeTodaLaPantalla = (await page.getByText('ocupe toda la pantalla').count()) > 0;
    const prometeProyector = ((jsonLd as { featureList?: string[] }).featureList ?? []).some((f) => /proyector/i.test(f));
    const caja = await page.locator('[role="timer"] svg').boundingBox();
    const ancho = caja?.width ?? 0;
    if (prometeTodaLaPantalla || prometeProyector) {
      expect(ancho, `círculo de ${ancho} px en 1920×1080`).toBeGreaterThanOrEqual(0.6 * 1080);
    }
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · nombres accesibles: «▶ Iniciar», un sonido que cambia de nombre y de aria-pressed a la vez, y «⏱️» en el título de la guía', async ({
    page,
  }) => {
    // El aria-label del botón principal repite el texto con el símbolo (▶ ⏸ ✅); el del sonido
    // dice el estado y además lleva aria-pressed; el title de EducationalSection trae «⏱️» junto
    // al 📚 del componente, sin aria-hidden.
    test.fail();
    await abrir(page);
    await expect(page.getByRole('button', { name: 'Iniciar', exact: true })).toHaveCount(1);
    const sonido = page.locator('button[aria-pressed]').filter({ hasText: /Sonido/ });
    const antes = await sonido.getAttribute('aria-label');
    await sonido.click();
    expect(await sonido.getAttribute('aria-label')).toBe(antes);
    await expect(page.getByRole('heading', { name: 'Todo sobre el Temporizador Visual', exact: true })).toHaveCount(1);
  });
});
