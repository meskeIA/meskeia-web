import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { medirContraste } from '../_contraste';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

/**
 * Simulador del Modelo OSI — Inspector, 21/11/2026 (PRIMERA inspección)
 *
 * Motor bajo prueba: `CAPAS`, `ESCENARIOS`, `bloquesYpdu()` y `construirFotogramas()` al
 * principio de `app/simulador-modelo-osi/page.tsx` (no hay módulo aparte ni imports de data/ o
 * lib/calculadoras). La app no calcula cifras: su verdad comprobable es el orden de las capas,
 * la PDU de cada una, qué cabecera añade cada capa y en qué orden se retiran, a qué capa van
 * protocolos y dispositivos, la correspondencia con TCP/IP y los puertos que cita.
 *
 * DE DÓNDE SALE EL ESPERADO (decidido ANTES de ejecutar la app):
 *   · 15 pasos = 7 capas del emisor (7 → 1) + 1 de medio físico + 7 del receptor (1 → 7).
 *   · PDU: 7-5 Datos · 4 Segmento (TCP) o Datagrama (UDP) · 3 Paquete · 2 Trama · 1 Bits.
 *   · Encapsular: la capa 4 antepone su cabecera, la 3 la IP delante de esa, la 2 la MAC delante
 *     de todo y la cola FCS detrás; desencapsular las retira en orden inverso (2, 3, 4).
 *   · Dispositivos: hub/repetidor 1, switch 2, router 3. TCP/IP de 4 capas (RFC 1122):
 *     Aplicación = OSI 7-5, Transporte = 4, Internet = 3, Acceso a la red = 2-1.
 *   · Puertos, cotejados en la RFC (rfc-editor.org): HTTPS → TCP 443 (RFC 9110 §4.2.2: «TCP port
 *     443 (the reserved port for HTTP over TLS) is the default») · envío de correo SMTP → 587
 *     (RFC 6409 §3.1: «Port 587 is reserved for email message submission») · DNS → 53 (RFC 1035
 *     §4.2.1: «Messages sent using UDP user server port 53») · RTP no tiene puerto fijo: un puerto
 *     PAR elegido para cada sesión y RTCP en el impar siguiente (RFC 3550 §11).
 *
 * CASOS:
 *   1 (normal)  «Navegar una web» de punta a punta: los 15 pasos, sus PDU y sus cabeceras.
 *               «Enviar un correo» = SMTP · TCP 587; «Streaming de vídeo» = UDP → Datagrama.
 *   2 (límite)  Anterior apagado en el paso 1; Siguiente y Auto apagados en el 15; Reiniciar a
 *               mitad vuelve al paso 1; el Auto a 400 ms llega al 15 y se para; cambiar de
 *               escenario con el Auto en marcha vuelve al paso 1 y lo para; el deslizador acota
 *               a 400-2000 ms (99999 → 2000).
 *   3 (aparte)  En UDP la PDU de capa 4 es «Datagrama», no «Segmento»; y un protocolo con su
 *               puerto equivocado (DNS en el 443) debe marcarse mal: HALLAZGO A.
 *
 * HALLAZGOS de esta inspección (ABIERTOS):
 *   A. Streaming «RTP/DNS · UDP puerto 443» y cabecera «UDP:443»: DNS va al 53 y RTP no tiene
 *      puerto fijo; el 443 es el de HTTPS.
 *   B. En HTTPS (y en el correo, también con `seguridad: true`) la petición «GET /index.html»
 *      viaja EN CLARO dentro del segmento, el paquete y la trama; la propia página dice que TLS
 *      cifra en la capa 6. El campo `seguridad` de ESCENARIOS no lo lee nadie.
 *   C. La guía paso a paso dice que con TCP «o UDP» la PDU «pasa a ser un segmento», contra el
 *      simulador (Datagrama) y el FAQPage.
 *   D. El texto de la capa 2 dice «Añade la cabecera de capa 2» (y el receptor «quita la
 *      cabecera»), sin la cola FCS que dibuja el bloque y que la página pide no olvidar.
 *   E. Los números de capa: blanco sobre el color de la capa, de 2,70 a 4,11:1 en 5 de 7.
 *   F. «Auto» (blanco sobre --secondary) 2,80:1 en claro y 2,23:1 en oscuro; «Reiniciar» y
 *      «Pausar» (blanco sobre rojo al 85 %) 3,21:1 en claro.
 *   G. El bloque «FCS» (#7b5ea7 sin variante oscura) da 2,89:1 en oscuro.
 *   H. El botón Auto cambia su nombre a «Pausar» y conserva aria-pressed="true".
 *   I. Al pulsar una capa, su detalle aparece fuera de la pantalla (debajo de los controles).
 */

const PIXEL_7 = devices['Pixel 7'];

async function abrir(page: Page): Promise<void> {
  await page.goto('/simulador-modelo-osi/');
  await esperarHidratacion(page, ['#vel-input']);
}

const siguiente = (page: Page): Locator => page.getByRole('button', { name: 'Siguiente', exact: true });
const anterior = (page: Page): Locator => page.getByRole('button', { name: 'Anterior', exact: true });
const reiniciar = (page: Page): Locator => page.getByRole('button', { name: 'Reiniciar', exact: true });
const botonAuto = (page: Page): Locator => page.getByRole('button', { name: /^(Auto|Pausar)/ });
const progreso = (page: Page): Locator => page.getByText(/^Paso \d+ de \d+$/);
const estado = (page: Page): Locator =>
  page.locator('[role="status"]').filter({ hasText: /Emisor ·|Receptor ·|Transmisión por el medio/ });
const tituloPdu = (page: Page): Locator =>
  page.getByRole('heading', { level: 2, name: /^Unidad de datos \(PDU\)/ });
const bloques = (page: Page): Locator =>
  page.locator('section').filter({ has: tituloPdu(page) }).locator('h2 + div > div');
const escenario = (page: Page, nombre: RegExp): Locator => page.getByRole('button', { name: nombre });
/** Botón de una capa: el primero es el del emisor; el segundo, el del receptor. */
const capa = (page: Page, num: number, nombre: string): Locator =>
  page.getByRole('button', { name: new RegExp(`^${num} ?${nombre}`) });

async function irAlPaso(page: Page, n: number): Promise<void> {
  for (let i = 1; i < n; i++) await siguiente(page).click();
  await expect(progreso(page)).toHaveText(`Paso ${n} de 15`);
}

interface PasoEsperado {
  titulo: string;
  pdu: string;
  /** Cabeceras al principio de la PDU, en orden (la más externa primero). */
  cabeceras: string[];
  /** Cola al final de la PDU, si la hay. */
  cola?: string;
}

// «Navegar una web»: HTTPS sobre TCP 443. Resuelto a mano con el orden de encapsulación.
const BITS: PasoEsperado = { titulo: '', pdu: 'Bits', cabeceras: ['0101 1001 0110 1100'] };
const PASOS_WEB: PasoEsperado[] = [
  { titulo: 'Emisor · Capa 7: Aplicación.', pdu: 'Datos', cabeceras: [] },
  { titulo: 'Emisor · Capa 6: Presentación.', pdu: 'Datos', cabeceras: [] },
  { titulo: 'Emisor · Capa 5: Sesión.', pdu: 'Datos', cabeceras: [] },
  { titulo: 'Emisor · Capa 4: Transporte.', pdu: 'Segmento', cabeceras: ['TCP:443'] },
  { titulo: 'Emisor · Capa 3: Red.', pdu: 'Paquete', cabeceras: ['IP', 'TCP'] },
  { titulo: 'Emisor · Capa 2: Enlace de datos.', pdu: 'Trama', cabeceras: ['MAC', 'IP', 'TCP'], cola: 'FCS' },
  { ...BITS, titulo: 'Emisor · Capa 1: Física.' },
  { ...BITS, titulo: 'Transmisión por el medio.' },
  { ...BITS, titulo: 'Receptor · Capa 1: Física.' },
  { titulo: 'Receptor · Capa 2: Enlace de datos.', pdu: 'Trama', cabeceras: ['MAC', 'IP', 'TCP'], cola: 'FCS' },
  { titulo: 'Receptor · Capa 3: Red.', pdu: 'Paquete', cabeceras: ['IP', 'TCP'] },
  { titulo: 'Receptor · Capa 4: Transporte.', pdu: 'Segmento', cabeceras: ['TCP:443'] },
  { titulo: 'Receptor · Capa 5: Sesión.', pdu: 'Datos', cabeceras: [] },
  { titulo: 'Receptor · Capa 6: Presentación.', pdu: 'Datos', cabeceras: [] },
  { titulo: 'Receptor · Capa 7: Aplicación.', pdu: 'Datos', cabeceras: [] },
];

test.describe('Caso 1 (normal): encapsular una petición web de punta a punta', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('«Navegar una web»: 15 pasos, PDU y cabeceras en el orden de encapsulación y desencapsulación', async ({ page }) => {
    await expect(escenario(page, /Navegar una web/)).toHaveAttribute('aria-pressed', 'true');
    await expect(escenario(page, /Navegar una web/)).toContainText('HTTPS · TCP puerto 443');
    for (let i = 0; i < PASOS_WEB.length; i++) {
      const e = PASOS_WEB[i];
      const n = i + 1;
      await expect(progreso(page), `paso ${n}`).toHaveText(`Paso ${n} de 15`);
      await expect(estado(page), `paso ${n}: título`).toContainText(e.titulo);
      await expect(tituloPdu(page), `paso ${n}: PDU`).toHaveText(`Unidad de datos (PDU): ${e.pdu}`);
      const b = await bloques(page).allTextContents();
      expect(b.slice(0, e.cabeceras.length), `paso ${n}: cabeceras`).toEqual(e.cabeceras);
      if (e.cola) expect(b[b.length - 1], `paso ${n}: cola`).toBe(e.cola);
      if (e.pdu === 'Datos') expect(b, `paso ${n}: solo datos`).toHaveLength(1);
      if (n < 15) await siguiente(page).click();
    }
    await expect(siguiente(page)).toBeDisabled();
  });

  test('«Enviar un correo»: SMTP sobre TCP 587 (RFC 6409 §3.1) y la PDU de capa 4 es un segmento', async ({ page }) => {
    await escenario(page, /Enviar un correo/).click();
    await expect(escenario(page, /Enviar un correo/)).toContainText('SMTP · TCP puerto 587');
    await expect(progreso(page)).toHaveText('Paso 1 de 15');
    await irAlPaso(page, 4);
    await expect(tituloPdu(page)).toHaveText('Unidad de datos (PDU): Segmento');
    expect((await bloques(page).allTextContents())[0]).toBe('TCP:587');
  });

  test('«Streaming de vídeo»: con UDP la PDU de capa 4 es «Datagrama», y el paquete lleva la cabecera UDP', async ({ page }) => {
    await escenario(page, /Streaming de vídeo/).click();
    await irAlPaso(page, 4);
    await expect(tituloPdu(page)).toHaveText('Unidad de datos (PDU): Datagrama');
    expect((await bloques(page).allTextContents())[0]).toMatch(/^UDP:\d+$/);
    await siguiente(page).click();
    await expect(tituloPdu(page)).toHaveText('Unidad de datos (PDU): Paquete');
    expect((await bloques(page).allTextContents()).slice(0, 2)).toEqual(['IP', 'UDP']);
    // Receptor, capa 4 (paso 12): vuelve a ser un datagrama
    for (let i = 5; i < 12; i++) await siguiente(page).click();
    await expect(progreso(page)).toHaveText('Paso 12 de 15');
    await expect(estado(page)).toContainText('Receptor · Capa 4: Transporte.');
    await expect(tituloPdu(page)).toHaveText('Unidad de datos (PDU): Datagrama');
  });

  test('Detalle de capa: protocolos, dispositivos y TCP/IP de cada capa; pulsar otra vez lo cierra', async ({ page }) => {
    const esperado: [number, string, RegExp, RegExp, string][] = [
      [1, 'Física', /Bits/, /Hub.*repetidor/, 'Acceso a la red'],
      [2, 'Enlace de datos', /Trama/, /Switch/, 'Acceso a la red'],
      [3, 'Red', /Paquete/, /Router/, 'Internet'],
      [4, 'Transporte', /Segmento \/ Datagrama/, /Cortafuegos/, 'Transporte'],
      [7, 'Aplicación', /Datos/, /Navegador/, 'Aplicación'],
    ];
    for (const [num, nombre, pdu, disp, tcpip] of esperado) {
      await capa(page, num, nombre).first().click();
      const titulo = page.getByRole('heading', { level: 2, name: `Capa ${num}: ${nombre}` });
      await expect(titulo).toBeVisible();
      const seccion = page.locator('section').filter({ has: titulo });
      await expect(seccion, `capa ${num}: PDU`).toContainText(pdu);
      await expect(seccion, `capa ${num}: dispositivos`).toContainText(disp);
      await expect(seccion, `capa ${num}: TCP/IP`).toContainText(`Modelo TCP/IP${tcpip}`);
    }
    const s4 = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Capa 7: Aplicación' }) });
    await expect(s4).toContainText(/HTTP.*SMTP.*DNS/);
    await capa(page, 3, 'Red').first().click();
    const s3 = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Capa 3: Red' }) });
    await expect(s3).toContainText(/IP, ICMP/);
    // La misma capa en el receptor comparte el estado: la cierra
    await capa(page, 3, 'Red').nth(1).click();
    await expect(page.getByRole('heading', { level: 2, name: /^Capa \d/ })).toHaveCount(0);
  });

  test('Teclado: Enter y Espacio avanzan; Enter en una capa abre su detalle y Espacio lo cierra', async ({ page }) => {
    await siguiente(page).focus();
    await page.keyboard.press('Enter');
    await expect(progreso(page)).toHaveText('Paso 2 de 15');
    await page.keyboard.press('Space');
    await expect(progreso(page)).toHaveText('Paso 3 de 15');
    await capa(page, 4, 'Transporte').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 2, name: 'Capa 4: Transporte' })).toBeVisible();
    await expect(capa(page, 4, 'Transporte').first()).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Space');
    await expect(page.getByRole('heading', { level: 2, name: /^Capa \d/ })).toHaveCount(0);
  });

  test('FAQPage y features del JSON-LD: 5 preguntas distintas de la FAQ visible, 7 características', async ({ page }) => {
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
    const app = ld.find((x) => x['@type'] === 'WebApplication');
    expect(app.featureList.length).toBeGreaterThanOrEqual(4);
    const faq = ld.find((x) => x['@type'] === 'FAQPage');
    const preguntas: string[] = faq.mainEntity.map((q: { name: string }) => q.name);
    expect(preguntas).toHaveLength(5);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const visibles = await page.getByRole('heading', { level: 4 }).allTextContents();
    for (const p of preguntas) expect(visibles, `«${p}» repetida en la FAQ visible`).not.toContain(p);
    const respuesta = (frag: string): string =>
      faq.mainEntity.find((q: { name: string }) => q.name.includes(frag)).acceptedAnswer.text;
    // Coherentes con la tabla de la página y con el simulador
    expect(respuesta('modelo OSI y el modelo TCP/IP')).toMatch(/4 capas: Aplicación \(agrupa las capas OSI 7, 6 y 5\), Transporte \(capa 4\), Internet \(capa 3\) y Acceso a la red \(capas 2 y 1\)/);
    expect(respuesta('PDU')).toMatch(/segmento \(TCP\) o datagrama \(UDP\)/);
    expect(respuesta('router, un switch y un hub')).toMatch(/router trabaja en la capa 3[\s\S]*switch trabaja en la capa 2[\s\S]*hub trabaja en la capa 1/);
  });
});

test.describe('Caso 2 (límite): extremos de la animación y del deslizador', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('Paso 1: Anterior apagado y retroceder no hace nada; paso 15: Siguiente y Auto apagados', async ({ page }) => {
    await expect(progreso(page)).toHaveText('Paso 1 de 15');
    await expect(anterior(page)).toBeDisabled();
    await expect(estado(page)).toContainText('Emisor · Capa 7: Aplicación.');
    await irAlPaso(page, 15);
    await expect(siguiente(page)).toBeDisabled();
    await expect(botonAuto(page)).toBeDisabled();
    await expect(anterior(page)).toBeEnabled();
    await anterior(page).click();
    await expect(progreso(page)).toHaveText('Paso 14 de 15');
    await expect(estado(page)).toContainText('Receptor · Capa 6: Presentación.');
  });

  test('Reiniciar a mitad (paso 6, trama) vuelve al paso 1 con la PDU «Datos»', async ({ page }) => {
    await irAlPaso(page, 6);
    await expect(tituloPdu(page)).toHaveText('Unidad de datos (PDU): Trama');
    await reiniciar(page).click();
    await expect(progreso(page)).toHaveText('Paso 1 de 15');
    await expect(tituloPdu(page)).toHaveText('Unidad de datos (PDU): Datos');
    await expect(anterior(page)).toBeDisabled();
  });

  test('Auto a 400 ms recorre los 15 pasos (14 saltos ≈ 5,6 s) y se para solo al final', async ({ page }) => {
    test.setTimeout(45_000);
    await sembrarValor(page, '#vel-input', 400);
    await expect(page.getByText('400 ms', { exact: true })).toBeVisible();
    await botonAuto(page).click();
    await expect(progreso(page)).toHaveText('Paso 15 de 15', { timeout: 15_000 });
    await expect(botonAuto(page)).toHaveAccessibleName('Auto');
    await expect(botonAuto(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(botonAuto(page)).toBeDisabled();
  });

  test('Cambiar de escenario con el Auto en marcha vuelve al paso 1 y lo para', async ({ page }) => {
    await botonAuto(page).click();
    await expect(progreso(page)).not.toHaveText('Paso 1 de 15', { timeout: 5_000 });
    await escenario(page, /Streaming de vídeo/).click();
    await expect(progreso(page)).toHaveText('Paso 1 de 15');
    await page.waitForTimeout(2_500); // más de dos saltos a 1100 ms
    await expect(progreso(page)).toHaveText('Paso 1 de 15');
    await expect(botonAuto(page)).toHaveAttribute('aria-pressed', 'false');
  });

  test('Deslizador de velocidad: acota a 400-2000 ms (99999 → 2000) y responde a Inicio con el teclado', async ({ page }) => {
    const aceptado = await sembrarValorAcotado(page, '#vel-input', 99999);
    expect(aceptado).toBe('2000');
    await expect(page.getByText('2000 ms', { exact: true })).toBeVisible();
    await page.locator('#vel-input').focus();
    await page.keyboard.press('Home');
    await expect(page.getByText('400 ms', { exact: true })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('500 ms', { exact: true })).toBeVisible();
  });
});

test.describe('Hallazgos de contenido (ABIERTOS)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test.fail('A · Streaming: el protocolo que nombra debe ir con su puerto (DNS 53, RFC 1035; RTP sin puerto fijo, RFC 3550)', async ({ page }) => {
    const texto = (await escenario(page, /Streaming de vídeo/).textContent()) ?? '';
    const m = texto.match(/([^·]+?) · (TCP|UDP) puerto (\d+)$/);
    expect(m, 'etiqueta «<protocolo> · <transporte> puerto <n>»').not.toBeNull();
    const [, proto, , puerto] = m as RegExpMatchArray;
    // Hoy: «RTP/DNS · UDP puerto 443»
    if (/DNS/.test(proto)) expect(puerto, 'DNS usa el puerto 53 (RFC 1035 §4.2.1)').toBe('53');
    if (/RTP/.test(proto)) expect(puerto, 'RTP no usa el 443: puerto par elegido por sesión (RFC 3550 §11)').not.toBe('443');
  });

  test.fail('B · HTTPS: dentro de la trama la petición no puede viajar en claro (TLS cifra en la capa 6, según la propia página)', async ({ page }) => {
    await irAlPaso(page, 6); // Emisor · Capa 2: trama
    const b = await bloques(page).allTextContents();
    // Hoy: [MAC][IP][TCP][GET /index.html][FCS]
    expect(b.join(' '), 'la trama de HTTPS muestra TLS o datos cifrados').toMatch(/TLS|cifrad/i);
  });

  test.fail('C · Guía paso a paso: con UDP la PDU de capa 4 es un datagrama, no un segmento', async ({ page }) => {
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const paso = page.getByText('Transporte añade puertos (capa 4)', { exact: true }).locator('xpath=following-sibling::p[1]');
    // Hoy: «Se añade la cabecera TCP o UDP con el puerto origen y destino: la PDU pasa a ser un segmento.»
    await expect(paso).toContainText(/datagrama/i, { timeout: 2_000 });
  });

  test.fail('D · Capa 2 del emisor: su texto debe decir que añade también la cola FCS que dibuja el bloque', async ({ page }) => {
    await irAlPaso(page, 6);
    expect((await bloques(page).allTextContents()).at(-1)).toBe('FCS');
    // Hoy: «Añade la cabecera de capa 2. Direccionamiento físico (MAC)…»
    await expect(estado(page)).toContainText(/FCS|cola/i, { timeout: 2_000 });
  });

  test.fail('H · El botón Auto no puede cambiar de nombre y conservar aria-pressed (lee «Pausar, presionado» en marcha)', async ({ page }) => {
    const antes = { nombre: (await botonAuto(page).textContent())?.trim(), pulsado: await botonAuto(page).getAttribute('aria-pressed') };
    expect(antes).toEqual({ nombre: 'Auto ▶▶', pulsado: 'false' });
    await botonAuto(page).click();
    const despues = { nombre: (await botonAuto(page).textContent())?.trim(), pulsado: await botonAuto(page).getAttribute('aria-pressed') };
    // Hoy: { nombre: 'Pausar', pulsado: 'true' }
    expect(despues.nombre !== antes.nombre && despues.pulsado !== null, `nombre «${despues.nombre}» con aria-pressed=${despues.pulsado}`).toBe(false);
  });

  test.fail('I · Escritorio: al pulsar una capa, su detalle aparece en la pantalla', async ({ page }) => {
    await capa(page, 3, 'Red').first().click();
    // Hoy: el panel aparece debajo de los controles, ~700 px por debajo del botón pulsado
    await expect(page.getByRole('heading', { level: 2, name: 'Capa 3: Red' })).toBeInViewport({ timeout: 2_000 });
  });
});

test.describe('Hallazgos de contraste (ABIERTOS)', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
    await prepararParaMedir(page);
  });

  test.fail('E · Números de capa: blanco sobre el color de la capa, 4,5:1 (texto de 13,6 px)', async ({ page }) => {
    await activarTema(page, 'light');
    await page.getByRole('button', { name: /TCP\/IP:/ }).evaluateAll((bs) =>
      bs.forEach((b) => b.firstElementChild?.setAttribute('data-medir', 'num-capa')),
    );
    const m = await medirContraste(page, { selector: '[data-medir="num-capa"]', texto: ['#ffffff'] });
    expect(m.vistos).toBe(14);
    // Hoy: capa 4 (#5BAE7A) 2,70 · 5 (#48A9A6) 2,80 · 6 (#3E91A8) 3,61 · 3 (#C0653A) 4,07 · 7 (#2E86AB) 4,11
    expect(m.ratio, `peor: «${m.texto}» sobre ${m.fondo}`).toBeGreaterThanOrEqual(4.5);
  });

  test.fail('F · Botones Auto y Reiniciar: texto blanco a 4,5:1 en claro', async ({ page }) => {
    await activarTema(page, 'light');
    await botonAuto(page).evaluate((b) => b.setAttribute('data-medir', 'ctrl'));
    await reiniciar(page).evaluate((b) => b.setAttribute('data-medir', 'ctrl'));
    const m = await medirContraste(page, { selector: '[data-medir="ctrl"], [data-medir="ctrl"] span', texto: ['#ffffff'] });
    expect(m.vistos).toBeGreaterThanOrEqual(2);
    // Hoy: «Auto» 2,80 sobre rgb(72,169,166) · «Reiniciar» 3,21 sobre rgb(241,95,95)
    expect(m.ratio, `peor: «${m.texto}» sobre ${m.fondo}`).toBeGreaterThanOrEqual(4.5);
  });

  test.fail('F · Botón Auto: texto blanco a 4,5:1 en oscuro', async ({ page }) => {
    await activarTema(page, 'dark');
    await botonAuto(page).evaluate((b) => b.setAttribute('data-medir', 'ctrl'));
    const m = await medirContraste(page, { selector: '[data-medir="ctrl"], [data-medir="ctrl"] span', texto: ['#ffffff'] });
    expect(m.vistos).toBeGreaterThanOrEqual(1);
    // Hoy: 2,23 sobre rgb(90,189,185)
    expect(m.ratio, `peor: «${m.texto}» sobre ${m.fondo}`).toBeGreaterThanOrEqual(4.5);
  });

  test.fail('G · Bloque FCS de la trama: 4,5:1 en oscuro', async ({ page }) => {
    await activarTema(page, 'dark');
    await irAlPaso(page, 6);
    await bloques(page).filter({ hasText: /^FCS$/ }).evaluate((b) => b.setAttribute('data-medir', 'fcs'));
    const m = await medirContraste(page, { selector: '[data-medir="fcs"]', texto: ['#7b5ea7'] });
    expect(m.vistos).toBe(1);
    // Hoy: 2,89 sobre rgb(40,36,47)
    expect(m.ratio, `«FCS» sobre ${m.fondo}`).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Móvil (Pixel 7)', () => {
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('Nada fuera de la pantalla a 412 px y los controles responden al toque', async ({ page }) => {
    const anchos = await page.evaluate(() => ({ ventana: window.innerWidth, documento: document.documentElement.scrollWidth }));
    expect(anchos.documento).toBeLessThanOrEqual(anchos.ventana);
    await siguiente(page).tap();
    await siguiente(page).tap();
    await siguiente(page).tap();
    await expect(progreso(page)).toHaveText('Paso 4 de 15');
    await expect(tituloPdu(page)).toHaveText('Unidad de datos (PDU): Segmento');
    await expect(tituloPdu(page)).toBeInViewport();
    await reiniciar(page).tap();
    await expect(progreso(page)).toHaveText('Paso 1 de 15');
  });

  test.fail('I · Al tocar una capa, su detalle aparece en la pantalla', async ({ page }) => {
    const boton = capa(page, 3, 'Red').first();
    await boton.scrollIntoViewIfNeeded();
    await boton.tap();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    // Hoy: el panel empieza ~960 px por debajo del borde inferior (839 px de alto)
    await expect(page.getByRole('heading', { level: 2, name: 'Capa 3: Red' })).toBeInViewport({ timeout: 2_000 });
  });
});
