import { test, expect, type Page } from '@playwright/test';
import { asentarAntesDeTraducir } from './_hidratacion';

/**
 * Afinador de Instrumentos — test de regresión de la ampliación del 21/09/2026 (S0156)
 *
 * QUÉ SE AMPLIÓ Y POR QUÉ: en 90 días la página recibía 169 impresiones de búsquedas por
 * instrumentos que NO tenía (trompeta 96, flauta 20, clarinete 16, bandurria 11, piano 10,
 * vihuela 9) frente a 17 de los cuatro que sí traía, todos de cuerda. Se añadieron las
 * familias de viento y tecla y, con ellas, lo que un afinador cromático no resuelve solo:
 * la TRANSPOSICIÓN. Una trompeta en si bemol que toca su Do escrito hace sonar un Si bemol,
 * y hasta ahora el afinador le contestaba con una nota que no era la de su partitura.
 *
 * Los valores esperados están resueltos a mano (La4 = 440 Hz, escala temperada):
 *   Mi2 = 82,41 Hz con La4 = 440  ·  82,78 Hz con La4 = 442
 *   La5 de la bandurria = 880,0 Hz  ·  Sol#3, su 6ª orden = 207,7 Hz
 *   Si bemol 3 = 233,08 Hz → lo lee Do4 una trompeta, Sol4 un saxo alto, Do5 un saxo tenor
 *
 * El micrófono NO se simula aquí: la detección de tono ya la cubren los tests del sonómetro
 * y del analizador de espectro, y lo que esta ampliación introduce —las afinaciones y la
 * traducción de la nota— es determinista y se ve sin tocar un instrumento. La aritmética
 * pura está además en tests/afinacion-instrumentos-motor.spec.ts (npm run test:calc).
 */

const RUTA = '/afinador-instrumentos/';

/**
 * La app es un client component: el HTML llega con los botones pintados pero sin manejador,
 * así que un clic anterior a la hidratación se pierde sin dejar rastro. Se usa el propio
 * selector de instrumento como testigo — cuando el botón queda marcado, React ya escucha.
 */
async function seleccionarInstrumento(page: Page, nombre: string): Promise<void> {
  const boton = page.getByRole('button', { name: nombre, exact: true });
  await expect(async () => {
    await boton.click({ force: true });
    await expect(boton).toHaveAttribute('aria-pressed', 'true', { timeout: 500 });
  }).toPass({ timeout: 20000 });
}

/** Frecuencia que muestra la cuerda n-ésima (1 = primera) del instrumento seleccionado. */
function cuerda(page: Page, numero: number) {
  return page.locator('[class*="cuerdaItem"]').nth(numero - 1);
}

test.describe('Afinaciones de cuerda', () => {
  test('la guitarra mantiene sus seis cuerdas y el Mi2 en 82,4 Hz', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');

    await expect(page.locator('[class*="cuerdaItem"]')).toHaveCount(6);
    await expect(cuerda(page, 1)).toContainText('Mi4');
    await expect(cuerda(page, 6)).toContainText('Mi2');
    await expect(cuerda(page, 6)).toContainText('82,4 Hz'); // formato español, no 82.4
  });

  test('la bandurria trae sus seis órdenes de Sol#3 a La5', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Bandurria');

    await expect(page.locator('[class*="cuerdaItem"]')).toHaveCount(6);
    await expect(cuerda(page, 1)).toContainText('La5');
    await expect(cuerda(page, 1)).toContainText('880,0 Hz');
    await expect(cuerda(page, 6)).toContainText('Sol#3');
    await expect(cuerda(page, 6)).toContainText('207,7 Hz');
    await expect(page.getByText(/afinadas por cuartas/i)).toBeVisible();
  });

  test('el laúd español suena una octava por debajo de la bandurria', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Laúd español');

    await expect(cuerda(page, 1)).toContainText('La4');
    await expect(cuerda(page, 6)).toContainText('Sol#2');
    await expect(cuerda(page, 6)).toContainText('103,8 Hz');
  });

  test('la vihuela mexicana avisa de que es reentrante', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Vihuela mexicana');

    await expect(page.locator('[class*="cuerdaItem"]')).toHaveCount(5);
    await expect(cuerda(page, 3)).toContainText('Sol4');
    await expect(page.getByText(/la 3ª cuerda \(Sol4\) es la nota más aguda/i)).toBeVisible();
  });

  test('cambiar el La de referencia mueve las frecuencias de las cuerdas', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await expect(cuerda(page, 6)).toContainText('82,4 Hz');

    // Antes del 21/09/2026 las frecuencias estaban escritas a mano para 440 Hz y elegir
    // «442 Hz (Orquesta)» no cambiaba ni un decimal de esta tabla.
    await page.getByRole('button', { name: /442 Hz/ }).click();
    await expect(cuerda(page, 6)).toContainText('82,8 Hz');
  });
});

test.describe('Instrumentos transpositores', () => {
  test('la trompeta explica que suena dos semitonos por debajo de lo que se lee', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Trompeta (si bemol)');

    await expect(page.getByText(/lo que suena va 2 semitonos por debajo de lo que lees/i)).toBeVisible();
    await expect(page.locator('[class*="cuerdaItem"]')).toHaveCount(0);
  });

  test('cada transpositor traduce el si bemol de concierto a SU nota escrita', async ({ page }) => {
    await page.goto(RUTA);
    const tabla = page.locator('[class*="referenciasTable"]');

    await seleccionarInstrumento(page, 'Trompeta (si bemol)');
    await expect(tabla.getByRole('row').filter({ hasText: 'La#3' })).toContainText('Do4');
    await expect(tabla.getByRole('row').filter({ hasText: 'La#3' })).toContainText('233,1 Hz');

    await seleccionarInstrumento(page, 'Saxo alto (mi bemol)');
    await expect(tabla.getByRole('row').filter({ hasText: 'La#3' })).toContainText('Sol4');

    await seleccionarInstrumento(page, 'Saxo tenor (si bemol)');
    await expect(tabla.getByRole('row').filter({ hasText: 'La#3' })).toContainText('Do5');
  });

  test('la flauta no transpone: no aparece la columna de la nota leída', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Flauta travesera');

    await expect(page.getByText(/lo que lees es lo que suena/i)).toBeVisible();
    await expect(page.locator('[class*="referenciasTable"]').getByRole('columnheader', { name: 'Tú lees' })).toHaveCount(0);
  });

  test('el piano dice para qué NO sirve', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Piano');

    await expect(page.getByText(/no para afinar el piano/i)).toBeVisible();
    await expect(page.locator('[class*="referenciasTable"]').getByRole('row').filter({ hasText: 'La4' })).toContainText('440,0 Hz');
  });
});

test.describe('Lo que la página promete', () => {
  test('el subtítulo anuncia las tres familias y la traducción', async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Afinador de Instrumentos');
    await expect(page.getByText(/cuerda, viento y tecla/i)).toBeVisible();
  });

  test('los tres grupos de instrumentos están en pantalla', async ({ page }) => {
    await page.goto(RUTA);
    for (const familia of ['Cuerda', 'Viento', 'Tecla']) {
      await expect(page.getByRole('heading', { name: new RegExp(familia, 'i'), level: 4 })).toBeVisible();
    }
  });

  test('el botón del micrófono sigue ahí y no arranca solo', async ({ page }) => {
    await page.goto(RUTA);
    const boton = page.getByRole('button', { name: /Iniciar afinador/i });
    await expect(boton).toBeVisible();
    await expect(boton).toHaveAttribute('aria-pressed', 'false');
  });
});

/**
 * Entrada de audio (S0245, 02/11/2026): la primera app de meskeIA que deja conectar un
 * instrumento externo. Con el permiso concedido aparece un selector con las entradas del
 * equipo; elegir una interfaz reabre el afinador con ese dispositivo sin pararlo, y enchufar
 * una con la página abierta la añade a la lista.
 *
 * Y el procesado de voz del navegador, apagado (cabo C0581): con `audio: true` la supresión
 * de ruido apagaba la nota sostenida —medido con el micrófono simulado de Chromium, un La3
 * constante caía de 0,12 a 0,025 de amplitud en dos segundos—. Aquí se comprueba lo que la
 * app PIDE al navegador, que es lo que puede volver atrás sin que nada lo vea.
 *
 * Los dispositivos son falsos: dos entradas, más los alias «default» y «communications» que
 * Chrome añade en Windows y que el selector no debe repetir.
 */
test.describe('Entrada de audio', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as {
        __pedidas: MediaTrackConstraints[];
        __enchufar: () => void;
      };
      w.__pedidas = [];
      const dispositivos = [
        { deviceId: 'default', kind: 'audioinput', label: 'Predeterminado - Micrófono interno', groupId: 'g1' },
        { deviceId: 'communications', kind: 'audioinput', label: 'Comunicaciones - Micrófono interno', groupId: 'g1' },
        { deviceId: 'mic-interno', kind: 'audioinput', label: 'Micrófono interno', groupId: 'g1' },
        { deviceId: 'interfaz-usb', kind: 'audioinput', label: 'Interfaz de audio USB', groupId: 'g2' },
        { deviceId: 'altavoz', kind: 'audiooutput', label: 'Altavoces', groupId: 'g3' },
      ];
      navigator.mediaDevices.enumerateDevices = async () => dispositivos.map((d) => ({ ...d, toJSON: () => d }) as MediaDeviceInfo);
      navigator.mediaDevices.getUserMedia = async (r) => {
        w.__pedidas.push((r?.audio ?? {}) as MediaTrackConstraints);
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.frequency.value = 440;
        const destino = ctx.createMediaStreamDestination();
        osc.connect(destino);
        osc.start();
        return destino.stream;
      };
      w.__enchufar = () => {
        dispositivos.push({ deviceId: 'grabadora-usb', kind: 'audioinput', label: 'Grabadora USB', groupId: 'g4' });
        navigator.mediaDevices.dispatchEvent(new Event('devicechange'));
      };
    });
  });

  const pedidas = (page: Page) =>
    page.evaluate(() => (window as unknown as { __pedidas: MediaTrackConstraints[] }).__pedidas);

  test('no hay selector hasta conceder el micrófono', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await expect(page.getByLabel('Entrada de audio')).toHaveCount(0);
  });

  test('abre el micrófono sin el procesado de voz del navegador', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();
    await expect(page.getByRole('button', { name: /Detener/i })).toBeVisible();

    const [primera] = await pedidas(page);
    expect(primera).toMatchObject({ echoCancellation: false, noiseSuppression: false, autoGainControl: false });
    expect(primera.deviceId).toBeUndefined(); // la predeterminada del sistema
    await expect(page.locator('[class*="notaNombre"]')).toHaveText('La');
  });

  test('lista las entradas sin repetir los alias de Windows ni las salidas', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();

    const selector = page.getByLabel('Entrada de audio');
    await expect(selector.locator('option')).toHaveText([
      'La predeterminada del sistema',
      'Micrófono interno',
      'Interfaz de audio USB',
    ]);
    await expect(selector).toHaveValue('');
  });

  test('elegir la interfaz reabre el afinador con ella, sin pararlo', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();

    await page.getByLabel('Entrada de audio').selectOption('interfaz-usb');
    await expect.poll(async () => (await pedidas(page)).length).toBe(2);
    const segunda = (await pedidas(page))[1];
    expect(segunda).toMatchObject({ deviceId: { exact: 'interfaz-usb' }, noiseSuppression: false });

    await expect(page.getByRole('button', { name: /Detener/i })).toBeVisible();
    await expect(page.locator('[class*="notaNombre"]')).toHaveText('La');
  });

  test('enchufar una entrada con la página abierta la añade a la lista', async ({ page }) => {
    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();
    const selector = page.getByLabel('Entrada de audio');
    await expect(selector.locator('option')).toHaveCount(3);

    await page.evaluate(() => (window as unknown as { __enchufar: () => void }).__enchufar());
    await expect(selector.locator('option')).toHaveCount(4);
    await expect(selector.locator('option').last()).toHaveText('Grabadora USB');
  });
});

/**
 * Página traducida por el navegador (cabo C0233, 13/10/2026). El dump de errores reunía en
 * esta app 4 NotFoundError: el aviso «Subir / Bajar tensión / Afinado» eran tres textos
 * condicionales sueltos, hermanos en el mismo <div>. Un traductor sustituye cada nodo de
 * texto por <font><font>…</font></font>, y React, al quitar el texto del estado anterior,
 * buscaba un nodo que ya no estaba (removeChild) y la app caía a la pantalla de error.
 * REPARADO (13/10/2026): cada texto en su <span>. El micrófono es un oscilador cuyo tono
 * mueve el test: 430 Hz queda 40 cents bajo el La4 y 450 Hz, 39 por encima.
 */
test.describe('Página traducida por el navegador', () => {
  test('pasar de «Subir tensión» a «Bajar tensión» y volver no tumba la app', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __tono: (f: number) => void };
      let osc: OscillatorNode | null = null;
      let ctx: AudioContext | null = null;
      w.__tono = (f) => {
        if (osc && ctx) osc.frequency.setValueAtTime(f, ctx.currentTime);
      };
      navigator.mediaDevices.getUserMedia = async () => {
        ctx = new AudioContext();
        osc = ctx.createOscillator();
        osc.frequency.value = 430;
        const destino = ctx.createMediaStreamDestination();
        osc.connect(destino);
        osc.start();
        return destino.stream;
      };
    });
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
    });

    /** Imita al traductor: cada nodo de texto visible pasa a <font><font>texto</font></font>. */
    // Antes del primer <font>, la página entera asentada (cabo C0493: ver asentarAntesDeTraducir)
    const traducir = async () => {
      await asentarAntesDeTraducir(page);
      return traducirYa();
    };
    const traducirYa = () =>
      page.evaluate(() => {
        const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) => {
            const padre = n.parentElement;
            if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
            if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });
        const nodos: Text[] = [];
        while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
        for (const nodo of nodos) {
          const exterior = document.createElement('font');
          const interior = document.createElement('font');
          interior.textContent = nodo.nodeValue;
          exterior.appendChild(interior);
          nodo.parentNode?.replaceChild(exterior, nodo);
        }
      });

    await page.goto(RUTA);
    await seleccionarInstrumento(page, 'Guitarra estándar');
    await page.getByRole('button', { name: /Iniciar afinador/i }).click();
    const aviso = page.locator('[class*="estadoAfinacion"]');
    await expect(aviso).toContainText('Subir tensión');

    await traducir();
    await page.evaluate(() => (window as unknown as { __tono: (f: number) => void }).__tono(450));
    await expect(aviso).toContainText('Bajar tensión');
    await traducir();
    await page.evaluate(() => (window as unknown as { __tono: (f: number) => void }).__tono(430));
    await expect(aviso).toContainText('Subir tensión');

    await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Detener/i })).toBeVisible();
    expect(errores).toEqual([]);
  });
});
