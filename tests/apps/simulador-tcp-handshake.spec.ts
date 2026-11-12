import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Simulador del Handshake TCP — Inspector, 12/11/2026 (PRIMERA inspección)
 *
 * Motor bajo prueba: `generarPasos(isnC, isnS, modo)` al principio de
 * `app/simulador-tcp-handshake/page.tsx` (no hay módulo aparte), el panel lateral que enseña
 * Flags/Seq/Ack/Window del paquete activo y las etiquetas que `dibujarCanvas` pinta en el
 * <canvas> (se leen interceptando `fillText`). La app no importa nada de data/fiscal ni de
 * lib/calculadoras.
 *
 * DE DÓNDE SALE EL ESPERADO. La regla del protocolo, tal como la da el encargo y la propia app
 * («SYN y FIN consumen 1 en la secuencia», «ack = seq + 1»): SYN seq = x → SYN-ACK seq = y,
 * ack = x + 1 → ACK seq = x + 1, ack = y + 1. En el cierre activo del cliente sin datos de por
 * medio: FIN seq = x + 1, ack = y + 1 → ACK seq = y + 1, ack = x + 2 → FIN seq = y + 1,
 * ack = x + 2 → ACK seq = x + 2, ack = y + 2. La RFC 9293 NO se pudo consultar: rfc-editor.org
 * y datatracker.ietf.org no están en la red de fuentes oficiales de la tarea.
 *
 * Resueltos A MANO antes de ejecutar la app:
 *
 * CASO 1 (normal) — ISN 2500 / 7300, «Solo apertura» (aplicados con «Aplicar ISN»):
 *   1 SYN     C→S  SYN=1, ACK=0  seq 2500  ack –
 *   2 SYN-ACK S→C  SYN=1, ACK=1  seq 7300  ack 2501
 *   3 ACK     C→S  SYN=0, ACK=1  seq 2501  ack 7301   → «Conexión establecida», Siguiente se apaga
 * CASO 1b (normal, ciclo completo) — ISN 1000 / 5000 (los de partida), «Apertura + Cierre»:
 *   1-3 como arriba con 1000/5000 · 4 FIN C→S seq 1001 ack 5001 · 5 ACK S→C seq 5001 ack 1002 ·
 *   6 FIN S→C seq 5001 ack 1002 · 7 ACK C→S seq 1002 ack 5002 → «Conexión cerrada».
 * CASO 2 (límite) — los extremos que declara el propio campo (min = 1, max = 999999):
 *   ISN 999999 / 1 → SYN seq 999999 · SYN-ACK seq 1 ack 1000000 · ACK seq 1000000 ack 2.
 *   Por ENCIMA del máximo del campo, 4294967295 (2^32 − 1): el campo lo marca inválido
 *   (rangeOverflow), así que debe rechazarse; y si se admitiera, el número de secuencia de TCP es
 *   de 32 bits y se suma módulo 2^32 (ack = 0). Hoy lo aplica y enseña ack = 4294967296.
 * CASO 3 (rechazo) — ISN cliente −5 → no se aplica (el SYN sigue con seq 1000) y se avisa.
 *   Hoy no se aplica, pero en silencio, y el campo se queda enseñando «-5».
 *
 * HALLAZGOS ABIERTOS de esta inspección (cada uno con su test.fail()):
 *   A. «Aplicar ISN» aplica lo que el propio campo marca inválido: 4294967295 → ack 4294967296;
 *      12.7 → seq 12 con el campo enseñando 12.7.
 *   B. −5 y 0 se descartan sin aviso; el campo sigue con el valor rechazado y el diagrama con el
 *      ISN anterior.
 *   C. La banda «CONEXIÓN CERRADA (TIME_WAIT)» del lienzo no se pinta nunca: su condición pide
 *      pasoActivo >= pasos.length y el paso activo llega como mucho a pasos.length − 1.
 *   D. El ACK final anuncia Window 0 (ventana cerrada) cuando los seis anteriores anuncian 65.535.
 *   E. «MSL ≈ 60 segundos» y «TIME_WAIT ≈ 120 s» sin fuente (la RFC 9293 §3.4.2 fija el MSL; no
 *      consultable desde la tarea).
 *   F. «¿Por qué … 3 pasos y no 2?» está en la FAQ visible y en el FAQPage con dos respuestas, y
 *      la visible dice al revés quién confirma qué.
 *   G. «Cómo usar» promete «valores aleatorios por defecto»; los de partida son siempre 1000/5000.
 *   H. En un móvil de 360 px el lienzo se estrecha y no baja de alto: el diagrama sale deformado.
 *   I. El panel del paquete no es una región viva: un lector de pantalla no oye el paso nuevo.
 */

interface VentanaLienzo {
  __textos: string[];
}

/** Anota cada texto que la app pinta en el lienzo: así se leen las etiquetas seq/ack. */
function ganchoLienzo(): void {
  const w = window as unknown as VentanaLienzo;
  w.__textos = [];
  const proto = CanvasRenderingContext2D.prototype;
  const original = proto.fillText;
  proto.fillText = function (
    this: CanvasRenderingContext2D,
    texto: string,
    x: number,
    y: number,
    maxWidth?: number,
  ): void {
    w.__textos.push(String(texto));
    if (maxWidth === undefined) original.call(this, texto, x, y);
    else original.call(this, texto, x, y, maxWidth);
  };
}

const textosLienzo = (page: Page): Promise<string[]> =>
  page.evaluate(() => [...new Set((window as unknown as VentanaLienzo).__textos)]);

const vaciarLienzo = (page: Page): Promise<void> =>
  page.evaluate(() => {
    (window as unknown as VentanaLienzo).__textos = [];
  });

/** El panel lateral de la app (hay otros dos <aside> en la página). */
const panel = (page: Page): Locator => page.locator('aside').filter({ hasText: /Pulsa Siguiente|Flags/ });

const dato = (page: Page, campo: 'Flags' | 'Seq' | 'Ack' | 'Window'): Locator =>
  panel(page).locator('dt', { hasText: new RegExp(`^${campo}$`) }).locator('xpath=following-sibling::dd[1]');

async function avanzar(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Siguiente paso' }).click();
  // «Anterior» se apaga mientras vuela el paquete y vuelve al aterrizar
  await expect(page.getByRole('button', { name: 'Paso anterior' })).toBeEnabled();
}

async function aplicarIsn(page: Page, cliente: string, servidor: string): Promise<void> {
  await page.locator('#isnCliente').fill(cliente);
  await esperarValorEnReact(page, '#isnCliente', cliente);
  await page.locator('#isnServidor').fill(servidor);
  await esperarValorEnReact(page, '#isnServidor', servidor);
  await page.getByRole('button', { name: 'Aplicar ISN' }).click();
}

interface PasoEsperado {
  origen: 'Cliente → Servidor' | 'Servidor → Cliente';
  flags: string;
  seq: string;
  ack: string;
  estado: string;
}

async function comprobarPaso(page: Page, n: number, e: PasoEsperado): Promise<void> {
  await expect(panel(page), `paso ${n}: sentido`).toContainText(e.origen);
  await expect(panel(page), `paso ${n}: estado`).toContainText(e.estado);
  await expect(dato(page, 'Flags'), `paso ${n}: flags`).toHaveText(e.flags);
  await expect(dato(page, 'Seq'), `paso ${n}: seq`).toHaveText(e.seq);
  await expect(dato(page, 'Ack'), `paso ${n}: ack`).toHaveText(e.ack);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(ganchoLienzo);
  await page.goto('/simulador-tcp-handshake/');
  await esperarHidratacion(page, ['#isnCliente', '#isnServidor']);
  await page.getByRole('button', { name: 'Rápida' }).click();
});

test.describe('CASO 1 (normal) — los números de secuencia y de acuse', () => {
  test('ISN 2500 / 7300, solo apertura: SYN 2500 → SYN-ACK 7300/2501 → ACK 2501/7301', async ({ page }) => {
    await aplicarIsn(page, '2500', '7300');
    await expect(panel(page)).toContainText('Inactivo');

    await avanzar(page);
    await comprobarPaso(page, 1, {
      origen: 'Cliente → Servidor',
      flags: 'SYN=1, ACK=0',
      seq: '2500',
      ack: '–',
      estado: 'SYN enviado',
    });
    await avanzar(page);
    await comprobarPaso(page, 2, {
      origen: 'Servidor → Cliente',
      flags: 'SYN=1, ACK=1',
      seq: '7300',
      ack: '2501',
      estado: 'SYN-ACK recibido',
    });
    await avanzar(page);
    await comprobarPaso(page, 3, {
      origen: 'Cliente → Servidor',
      flags: 'SYN=0, ACK=1',
      seq: '2501',
      ack: '7301',
      estado: 'Conexión establecida',
    });
    await expect(page.getByRole('button', { name: 'Siguiente paso' })).toBeDisabled();

    // Las mismas cifras, en las etiquetas que pinta el lienzo
    await expect
      .poll(() => textosLienzo(page))
      .toEqual(
        expect.arrayContaining([
          'SYN (seq=2500)',
          'SYN-ACK (seq=7300, ack=2501)',
          'ACK (seq=2501, ack=7301)',
          'CONEXIÓN ESTABLECIDA',
        ]),
      );
  });

  test('ISN 1000 / 5000, apertura + cierre: el FIN consume un número y el último ACK es 1002/5002', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Apertura + Cierre' }).click();
    await expect(panel(page)).toContainText('Inactivo');
    await vaciarLienzo(page);

    const esperados: PasoEsperado[] = [
      { origen: 'Cliente → Servidor', flags: 'SYN=1, ACK=0', seq: '1000', ack: '–', estado: 'SYN enviado' },
      { origen: 'Servidor → Cliente', flags: 'SYN=1, ACK=1', seq: '5000', ack: '1001', estado: 'SYN-ACK recibido' },
      { origen: 'Cliente → Servidor', flags: 'SYN=0, ACK=1', seq: '1001', ack: '5001', estado: 'Conexión establecida' },
      { origen: 'Cliente → Servidor', flags: 'FIN=1, ACK=1', seq: '1001', ack: '5001', estado: 'Cerrando conexión' },
      { origen: 'Servidor → Cliente', flags: 'SYN=0, ACK=1', seq: '5001', ack: '1002', estado: 'Cerrando conexión' },
      { origen: 'Servidor → Cliente', flags: 'FIN=1, ACK=1', seq: '5001', ack: '1002', estado: 'Cerrando conexión' },
      { origen: 'Cliente → Servidor', flags: 'SYN=0, ACK=1', seq: '1002', ack: '5002', estado: 'Conexión cerrada' },
    ];
    for (const [i, e] of esperados.entries()) {
      await avanzar(page);
      await comprobarPaso(page, i + 1, e);
    }
    await expect(page.getByRole('button', { name: 'Siguiente paso' })).toBeDisabled();

    await expect
      .poll(() => textosLienzo(page))
      .toEqual(
        expect.arrayContaining([
          'SYN (seq=1000)',
          'SYN-ACK (seq=5000, ack=1001)',
          'ACK (seq=1001, ack=5001)',
          'FIN (seq=1001, ack=5001)',
          'ACK (seq=5001, ack=1002)',
          'FIN (seq=5001, ack=1002)',
          'ACK (seq=1002, ack=5002)',
        ]),
      );
  });

  test('HALLAZGO (12/11/2026, ABIERTO) · C: la banda «CONEXIÓN CERRADA (TIME_WAIT)» no se pinta nunca', async ({
    page,
  }) => {
    // dibujarCanvas la pinta si `pasoActivo >= pasos.length`, pero avanzarPaso no pasa de
    // pasos.length − 1 (= 6): tras el séptimo paso el lienzo no la trae, y es el único sitio del
    // diagrama que nombra TIME_WAIT. La de «CONEXIÓN ESTABLECIDA» sí sale tras el tercero.
    test.fail();
    await page.getByRole('button', { name: 'Apertura + Cierre' }).click();
    for (let i = 0; i < 7; i++) await avanzar(page);
    await expect(panel(page)).toContainText('Conexión cerrada');
    await expect.poll(() => textosLienzo(page), { timeout: 3000 }).toContain('CONEXIÓN CERRADA (TIME_WAIT)');
  });

  test('HALLAZGO (12/11/2026, ABIERTO) · D: el ACK final anuncia Window 0', async ({ page }) => {
    // Los seis segmentos anteriores anuncian 65.535 y nada en la simulación llena el búfer de
    // recepción del cliente; una ventana 0 es la señal de «no me mandes más» del control de
    // flujo, y la app no la explica. Esperado 65.535 (la misma) · obtenido 0.
    test.fail();
    await page.getByRole('button', { name: 'Apertura + Cierre' }).click();
    for (let i = 0; i < 6; i++) await avanzar(page);
    await expect(dato(page, 'Window')).toHaveText('65.535');
    await avanzar(page);
    await expect(dato(page, 'Seq')).toHaveText('1002');
    await expect(dato(page, 'Window'), { message: 'paso 7: ventana' }).toHaveText('65.535', { timeout: 2000 });
  });
});

test.describe('CASO 2 (límite) — los extremos del campo y lo que hay más allá', () => {
  test('ISN 999999 / 1 (máximo y mínimo del campo): SYN-ACK ack 1000000, ACK 1000000/2', async ({ page }) => {
    await aplicarIsn(page, '999999', '1');
    await avanzar(page);
    await comprobarPaso(page, 1, {
      origen: 'Cliente → Servidor',
      flags: 'SYN=1, ACK=0',
      seq: '999999',
      ack: '–',
      estado: 'SYN enviado',
    });
    await avanzar(page);
    await comprobarPaso(page, 2, {
      origen: 'Servidor → Cliente',
      flags: 'SYN=1, ACK=1',
      seq: '1',
      ack: '1000000',
      estado: 'SYN-ACK recibido',
    });
    await avanzar(page);
    await comprobarPaso(page, 3, {
      origen: 'Cliente → Servidor',
      flags: 'SYN=0, ACK=1',
      seq: '1000000',
      ack: '2',
      estado: 'Conexión establecida',
    });
  });

  test('HALLAZGO (12/11/2026, ABIERTO) · A: aplica 4294967295, que el campo marca inválido, y enseña ack 4294967296', async ({
    page,
  }) => {
    // El campo declara max = 999999 y lo marca con rangeOverflow, pero aplicarISN solo mira
    // `>= 1`. Esperado: rechazo (el SYN sigue con 1000 y el SYN-ACK con ack 1001) o, si se
    // admite, la suma módulo 2^32 del campo de 32 bits (ack 0) · obtenido: ack 4294967296.
    test.fail();
    await aplicarIsn(page, '4294967295', '5000');
    expect(
      await page.locator('#isnCliente').evaluate((el) => (el as HTMLInputElement).validity.rangeOverflow),
    ).toBe(true);
    await avanzar(page);
    const seqSyn = (await dato(page, 'Seq').textContent()) ?? '';
    await avanzar(page);
    if (seqSyn === '1000') {
      await expect(dato(page, 'Ack')).toHaveText('1001', { timeout: 2000 });
    } else {
      expect(seqSyn).toBe('4294967295');
      await expect(dato(page, 'Ack')).toHaveText('0', { timeout: 2000 });
    }
  });

  test('HALLAZGO (12/11/2026, ABIERTO) · A: aplica 12.7 como 12 con el campo enseñando 12.7', async ({ page }) => {
    // Un ISN es entero; el campo (step 1 por defecto) marca 12.7 con stepMismatch y parseInt lo
    // trunca. Esperado: rechazo (el SYN sigue con 1000) · obtenido: seq 12.
    test.fail();
    await aplicarIsn(page, '12.7', '5000');
    await avanzar(page);
    await expect(dato(page, 'Seq')).toHaveText('1000', { timeout: 2000 });
  });
});

test.describe('CASO 3 (rechazo) — un ISN negativo', () => {
  test('ISN cliente −5 no se aplica: el SYN sigue saliendo con seq 1000', async ({ page }) => {
    await aplicarIsn(page, '-5', '5000');
    await avanzar(page);
    await expect(dato(page, 'Seq')).toHaveText('1000');
    await expect(dato(page, 'Ack')).toHaveText('–');
  });

  test('HALLAZGO (12/11/2026, ABIERTO) · B: el rechazo es mudo y el campo sigue diciendo −5', async ({ page }) => {
    // Esperado: un aviso de la app junto al formulario (o el campo vuelve al ISN en vigor) ·
    // obtenido: ningún mensaje, el campo enseña «-5» y el diagrama usa 1000. Igual con 0.
    test.fail();
    await aplicarIsn(page, '-5', '5000');
    const aviso = page.getByRole('alert').filter({ hasText: /ISN|secuencia/i });
    const campoCoherente = (await page.locator('#isnCliente').inputValue()) === '1000';
    if (!campoCoherente) await expect(aviso).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Textos: FAQ, guía y fuente', () => {
  test('HALLAZGO (12/11/2026, ABIERTO) · F: «3 pasos y no 2» tiene dos respuestas, y la visible invierte quién confirma', async ({
    page,
  }) => {
    // FAQ visible: «el tercer ACK permite al cliente confirmar que el servidor recibió el
    // SYN-ACK» (el SYN-ACK lo ENVÍA el servidor; quien lo recibe y lo confirma es el cliente,
    // como dice su frase siguiente). FAQPage: «el cliente nunca confirmaría que recibió el
    // SYN-ACK del servidor». La reparación es UNA constante que lean las dos (check:faq-unica).
    test.fail();
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    let respuestaJsonLd = '';
    for (const b of bloques) {
      const datos = JSON.parse(b) as {
        '@type'?: string;
        mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
      };
      if (datos['@type'] !== 'FAQPage') continue;
      const p = datos.mainEntity?.find((q) => /(tres|3) pasos y no (dos|2)/.test(q.name));
      if (p) respuestaJsonLd = p.acceptedAnswer.text;
    }
    const respuestaVisible =
      (await page
        .locator('h4', { hasText: /(tres|3) pasos y no (dos|2)/ })
        .locator('xpath=following-sibling::p[1]')
        .textContent()) ?? '';
    expect(respuestaVisible).not.toContain('confirmar que el servidor recibió el SYN-ACK');
    expect(respuestaVisible.trim()).toBe(respuestaJsonLd.trim());
  });

  test('HALLAZGO (12/11/2026, ABIERTO) · G: la guía promete ISN aleatorios por defecto y salen 1000 y 5000', async ({
    page,
  }) => {
    test.fail();
    await expect(page.locator('#isnCliente')).toHaveValue('1000');
    await expect(page.locator('#isnServidor')).toHaveValue('5000');
    // El paso 1 de «Cómo usar el simulador»: el <strong> y el resto de la frase, en su <div>
    const paso1 = page.locator('strong', { hasText: 'Configura los ISN' }).locator('xpath=..');
    await expect(paso1).toContainText('de cliente y servidor');
    await expect(paso1).not.toContainText('valores aleatorios por defecto', { timeout: 2000 });
  });

  test('HALLAZGO (12/11/2026, ABIERTO) · E: MSL ≈ 60 s y TIME_WAIT ≈ 120 s, sin fuente', async ({ page }) => {
    // La RFC 9293 §3.4.2 es la que fija el MSL; no se pudo cotejar desde la tarea (rfc-editor.org
    // fuera de la red de fuentes). La cifra tiene que salir citada de ahí o matizarse.
    test.fail();
    const faq = (await page.locator('h4', { hasText: 'TIME_WAIT' }).locator('xpath=following-sibling::p[1]').textContent()) ?? '';
    expect(faq).not.toMatch(/≈\s*60 segundos/);
  });
});

test.describe('Móvil y accesibilidad', () => {
  test('HALLAZGO (12/11/2026, ABIERTO) · H: a 360 px el lienzo se estrecha sin bajar de alto y deforma el diagrama', async ({
    page,
  }) => {
    // `.canvas { max-width: 100% }` encoge el ancho, pero el alto va fijo en línea (380 px):
    // relación pintada 0,73 frente a la del dibujo 1,26 (el texto sale al 58 % de ancho).
    test.fail();
    await page.setViewportSize({ width: 360, height: 740 });
    await page.waitForTimeout(300);
    const r = await page.locator('canvas').evaluate((el) => {
      const c = el as HTMLCanvasElement;
      const caja = c.getBoundingClientRect();
      return { dibujo: c.width / c.height, pintada: caja.width / caja.height };
    });
    expect(Math.abs(r.pintada - r.dibujo) / r.dibujo).toBeLessThan(0.02);
  });

  test('HALLAZGO (12/11/2026, ABIERTO) · I: el paquete nuevo no se anuncia (sin región viva)', async ({ page }) => {
    // Al pulsar Siguiente el foco se queda en el botón y el panel cambia sin aria-live ni
    // role="status"; el lienzo tiene un aria-label fijo que no dice qué paquetes hay.
    test.fail();
    await avanzar(page);
    await expect(
      page.locator('[aria-live="polite"], [role="status"]').filter({ hasText: /SYN/ }),
    ).not.toHaveCount(0, { timeout: 2000 });
  });
});
