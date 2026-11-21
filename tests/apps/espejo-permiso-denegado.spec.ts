import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * espejo — el permiso de cámara DENEGADO de verdad (inspección en modo firma, 21/11/2026)
 *
 * POR QUÉ UN FICHERO APARTE
 *   espejo.spec.ts lanza Chromium con --use-fake-ui-for-media-stream y el permiso concedido. Aquí
 *   el navegador dice que no, como cuando la persona pulsa «Bloquear» o lo bloqueó otro día:
 *   --use-fake-ui-for-media-stream=deny y el contexto sin permisos. getUserMedia rechaza con
 *   «NotAllowedError | Permission denied» (el name y el message de Chrome) y
 *   navigator.permissions.query({ name: 'camera' }) devuelve «denied».
 *   (Sin la bandera, Chromium sin interfaz rechaza con «NotSupportedError | Not supported», que no
 *   es lo que ve nadie: por eso la bandera.)
 *
 * QUÉ PROMETE LA PÁGINA PARA ESTE CASO
 *   · Guía, paso 1: «Si lo denegas, la app no podrá mostrar la imagen. Puedes cambiar este permiso
 *     en cualquier momento desde la configuración del navegador».
 *   · page.tsx, AVISOS.denegado: «Permiso de cámara denegado · Activa la cámara en la configuración
 *     del navegador», en un role="alert"; el recuadro pasa a «Pulsa para volver a intentarlo».
 *
 * ESPERADO, ESCRITO ANTES DE EJECUTAR
 *   Tras tocar el recuadro donde se ve (sin el desplazamiento automático de Playwright), el porqué
 *   y la salida se leen en la primera pantalla, y volver a tocar da alguna respuesta. Geometría del
 *   CSS calculada a mano: el aviso va DEBAJO del recuadro, que mide 9/16 × 392 = 697 px en el móvil
 *   (desde y ≈ 321 → el aviso en y ≈ 1030, con la pantalla en 839) y 3/4 × 660 = 880 px en
 *   escritorio (desde y = 356 → el aviso en y ≈ 1248).
 *
 * MEDIDO (21/11/2026)
 *   · El aviso sale y se anuncia (role="alert") y el recuadro vuelve a pedir la cámara: PASA.
 *   · El aviso empieza en y = 1030 con la pantalla en 839 (Pixel 7), y = 937 con 740 (Android de
 *     360 px), y = 1248 con 657 (portátil) e incluso con 947 (1920 × 1080). En la primera pantalla
 *     solo se lee «🚫 Pulsa para volver a intentarlo» (HALLAZGO, ABIERTO). Es una REGRESIÓN del
 *     arreglo del 15/11/2026 (9af0e302b): hasta entonces «Permiso de cámara denegado · Activa la
 *     cámara en la configuración del navegador» se pintaba DENTRO del recuadro; el arreglo lo sacó a
 *     un role="alert" debajo del recuadro (para anunciarlo) y dejó dentro solo la invitación.
 *   · Con el permiso bloqueado, el segundo toque llama otra vez a getUserMedia, que rechaza al
 *     instante, y no cambia NADA: 0 mutaciones en el aviso y en el recuadro, el mismo texto, nada
 *     que anunciar. «Pulsa para volver a intentarlo» invita a un bucle que no puede salir bien hasta
 *     desbloquear el permiso en el navegador, y la app no lo dice (HALLAZGO, ABIERTO).
 *
 * REPARADOS (reparar 21/11/2026)
 *   · Hallazgo 5353: el aviso va ENCIMA del recuadro (y se trae a la vista si quedó fuera), sin
 *     perder el role="alert".
 *   · Hallazgo 5354: con el permiso en «denied» (permissions.query) el aviso dice que el navegador
 *     la tiene bloqueada y cómo permitirla junto a la dirección de la página, y el recuadro pasa a
 *     «Pulsa para reintentar cuando hayas permitido la cámara». Cada rechazo vuelve a montar los
 *     párrafos del aviso (key = número de intento), así que se anuncia otra vez aunque diga lo mismo.
 */

test.use({
  permissions: [],
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream=deny'],
  },
});

test.beforeEach(() => {
  // Compilar la ruta en frío y montar la página se come los 30 s por defecto
  test.slow();
});

interface Ventana {
  __llamadas: number;
  __errores: string[];
  __mutaciones: number;
}

const AVISO = 'Permiso de cámara denegado';
const DETALLE = 'Activa la cámara en la configuración del navegador';
// Hallazgo 5354: con el permiso bloqueado, el recuadro ya no invita a «volver a intentarlo» sin más
const RECUADRO_BLOQUEADO = 'Pulsa para reintentar cuando hayas permitido la cámara';
const COMO_DESBLOQUEAR = 'junto a la dirección de la página';
const recuadro = (page: Page): Locator => page.getByRole('button', { name: /Pulsa para/ });
// getByRole('alert') casa también con el anunciador de rutas de Next: se acota por el texto
const avisoDeLaApp = (page: Page): Locator => page.getByRole('alert').filter({ hasText: AVISO });

/** Cuenta las llamadas a getUserMedia y apunta «name | message» de cada rechazo. */
async function contarLlamadas(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as Ventana;
    w.__llamadas = 0;
    w.__errores = [];
    w.__mutaciones = 0;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (c?: MediaStreamConstraints): Promise<MediaStream> => {
      w.__llamadas += 1;
      try {
        return await original(c);
      } catch (e) {
        const d = e as DOMException;
        w.__errores.push(`${d.name} | ${d.message}`);
        throw e;
      }
    };
  });
}

/** Espera a que React haya colgado su onClick del botón: un clic anterior se pierde. */
async function esperarBotonVivo(page: Page, boton: Locator): Promise<void> {
  const nodo = await boton.elementHandle({ timeout: 15000 });
  if (!nodo) throw new Error('El botón no llegó a existir en el DOM.');
  await page.waitForFunction(
    (el) => {
      const bruto = el as unknown as Record<string, unknown>;
      const clave = Object.keys(bruto).find((k) => k.startsWith('__reactProps$'));
      const props = clave ? (bruto[clave] as Record<string, unknown> | null) : null;
      return Boolean(props && typeof props.onClick === 'function');
    },
    nodo,
    { timeout: 15000 },
  );
}

async function abrir(page: Page): Promise<void> {
  await contarLlamadas(page);
  await page.goto('/espejo/');
  await esperarBotonVivo(page, recuadro(page));
  await esperarPaginaAsentada(page);
}

/** Toca donde lo haría una persona: en el centro de la parte VISIBLE del recuadro, sin desplazar. */
async function pulsarParteVisible(page: Page, tactil: boolean): Promise<void> {
  const punto = await recuadro(page).evaluate((b) => {
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: (Math.max(r.top, 0) + Math.min(r.bottom, window.innerHeight)) / 2 };
  });
  if (tactil) await page.touchscreen.tap(punto.x, punto.y);
  else await page.mouse.click(punto.x, punto.y);
}

const llamadas = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as Ventana).__llamadas);

interface Caja {
  top: number;
  bottom: number;
  ventana: number;
  scrollY: number;
}

async function cajaDelAviso(page: Page): Promise<Caja> {
  return avisoDeLaApp(page).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), ventana: window.innerHeight, scrollY: Math.round(window.scrollY) };
  });
}

test.describe('Portátil (ventana útil de 1366 × 657)', () => {
  test.use({ viewport: { width: 1366, height: 657 } });

  test('CASO · denegado de verdad: el aviso sale en un role="alert", dice cómo desbloquear la cámara y el recuadro vuelve a pedirla', async ({
    page,
  }) => {
    await abrir(page);
    await pulsarParteVisible(page, false);
    await expect(avisoDeLaApp(page)).toHaveCount(1);
    await expect(avisoDeLaApp(page)).toContainText(DETALLE);
    expect(await page.evaluate(() => (window as unknown as Ventana).__errores)).toEqual(['NotAllowedError | Permission denied']);
    expect(await page.evaluate(async () => (await navigator.permissions.query({ name: 'camera' as PermissionName })).state)).toBe('denied');
    // Hallazgo 5354 (REPARADO): antes «Pulsa para volver a intentarlo» con el permiso bloqueado
    await expect(avisoDeLaApp(page)).toContainText(COMO_DESBLOQUEAR);
    await expect(recuadro(page)).toHaveAccessibleName(RECUADRO_BLOQUEADO);
    await expect(page.getByRole('button', { name: /Apagar/ })).toHaveCount(0);
    await pulsarParteVisible(page, false);
    await expect.poll(() => llamadas(page)).toBe(2);
  });

  test('HALLAZGO 5353 (REPARADO 21/11/2026) · el porqué del fallo se lee en la primera pantalla, no debajo del recuadro', async ({
    page,
  }) => {
    // Medido antes: aviso en y = 1248 con la ventana en 657 (y también con 947, a 1920 × 1080).
    await abrir(page);
    await pulsarParteVisible(page, false);
    await expect(avisoDeLaApp(page)).toHaveCount(1);
    const caja = await cajaDelAviso(page);
    expect(caja.scrollY).toBe(0);
    expect(caja.top, `aviso en y = ${caja.top} con la ventana en ${caja.ventana}`).toBeLessThan(caja.ventana);
  });
});

const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];

test.describe('Móvil (Pixel 7)', () => {
  test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });

  test('CASO · denegado de verdad en el móvil: el aviso existe y el recuadro vuelve a pedir la cámara', async ({ page }) => {
    await abrir(page);
    await pulsarParteVisible(page, true);
    await expect(avisoDeLaApp(page)).toHaveCount(1);
    await expect(avisoDeLaApp(page)).toContainText(DETALLE);
    await expect(recuadro(page)).toHaveAccessibleName(RECUADRO_BLOQUEADO);
    await pulsarParteVisible(page, true);
    await expect.poll(() => llamadas(page)).toBe(2);
  });

  test('HALLAZGO 5353 (REPARADO 21/11/2026) · en el móvil el porqué del fallo se lee en la primera pantalla', async ({
    page,
  }) => {
    // Medido antes: aviso en y = 1030 con la pantalla en 839, bajo el recuadro de 697 px. Antes del
    // 15/11 el texto iba DENTRO del recuadro y se leía sin desplazar; ahora va encima.
    await abrir(page);
    await pulsarParteVisible(page, true);
    await expect(avisoDeLaApp(page)).toHaveCount(1);
    const caja = await cajaDelAviso(page);
    expect(caja.scrollY).toBe(0);
    expect(caja.top, `aviso en y = ${caja.top} con la pantalla en ${caja.ventana}`).toBeLessThan(caja.ventana);
  });

  test('HALLAZGO 5354 (REPARADO 21/11/2026) · con el permiso bloqueado, volver a tocar el recuadro vuelve a anunciar el aviso', async ({
    page,
  }) => {
    // Medido antes: 2.ª llamada a getUserMedia, rechazo inmediato, setAviso('denegado') con el mismo valor
    // → React no vuelve a pintar: 0 mutaciones en el aviso y en el recuadro.
    // Esperado: cada toque tiene respuesta (el aviso se vuelve a anunciar, o dice que el permiso
    // sigue bloqueado y que hay que desbloquearlo en el navegador: permissions.query ya da «denied»).
    await abrir(page);
    await pulsarParteVisible(page, true);
    await expect(avisoDeLaApp(page)).toHaveCount(1);
    await avisoDeLaApp(page).evaluate((aviso) => {
      const w = window as unknown as Ventana;
      const observador = new MutationObserver((lista) => {
        w.__mutaciones += lista.length;
      });
      const opciones = { subtree: true, childList: true, characterData: true, attributes: true };
      observador.observe(aviso, opciones);
      const caja = Array.from(document.querySelectorAll('button')).find((b) => /Pulsa para/.test(b.textContent ?? ''));
      if (caja?.parentElement) observador.observe(caja.parentElement, opciones);
    });
    await pulsarParteVisible(page, true);
    await expect.poll(() => llamadas(page)).toBe(2);
    await page.waitForTimeout(800);
    const mutaciones = await page.evaluate(() => (window as unknown as Ventana).__mutaciones);
    expect(mutaciones, 'cambios en el aviso o en el recuadro tras el segundo toque').toBeGreaterThan(0);
  });
});
