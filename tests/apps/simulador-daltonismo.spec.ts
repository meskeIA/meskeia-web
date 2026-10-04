import { test, expect, devices, Page, Locator } from '@playwright/test';
import zlib from 'node:zlib';
import fs from 'node:fs';
import { esperarHidratacion } from './_hidratacion';

/**
 * Inspector — simulador-daltonismo (segmento motor, riesgo 2)
 *
 * Primera inspección: 20/09/2026 (Opus 5). Re-inspección: 04/10/2026 (Opus 5.5), contra el
 * build de producción local (`next start`) con el código de 99711f32.
 *
 * QUÉ PROMETE
 *   <h1> «Simulador de Daltonismo». Ocho tarjetas (visión normal + 7 deficiencias) generadas
 *   píxel a píxel en canvas «con las matrices publicadas en Machado, Oliveira & Fernandes (2009)»,
 *   multiplicadas contra RGB LINEAL; las tres anómalas con severidad 0,6 y la acromatopsia como
 *   luminancia Rec.709. No hay deslizador de severidad ni entrada de color: la única entrada es
 *   una imagen (JPG/PNG/WEBP, hasta 10 MB, reescalada a 720 px de ancho).
 *
 * DÓNDE VIVE EL CÁLCULO
 *   `lib/calculadoras/daltonismo.ts` (MATRICES_CVD, srgbALineal, linealASrgb), compartido con
 *   simulador-baja-vision desde de1a7007 (20/09/2026). La página solo recorre los píxeles
 *   (`aplicarMatriz`) con esas tres piezas.
 *
 * CÓMO SE CALCULAN LOS ESPERADOS (04/10/2026, ANTES de abrir el navegador)
 *   Se descargó la Tabla 1 de la página de los autores
 *   (https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html), se
 *   parsearon las 11 severidades y se comparó cada coeficiente de severidad 1,0 y 0,6 con el
 *   motor: diferencia máxima 0 en los 54. Los esperados salen de un script aparte que aplica esa
 *   tabla con la curva sRGB de IEC 61966-2-1 (linealizar → matriz → comprimir → redondear y
 *   acotar a 0-255), sin importar nada del motor. Tolerancia: ±2 niveles de 255 por redondeo; un
 *   error de MODELO (otras matrices, o aplicarlas sobre sRGB con gamma) mueve decenas — el que se
 *   reparó el 20/09 movía hasta 135.
 *
 * POR QUÉ SE COMPARA RGB DIRECTO Y NO EL TONO
 *   Se sube un PNG de bloques planos OPACOS más estrecho que 720 px (no se reescala) y se lee el
 *   centro de cada bloque: no hay mezcla ni remuestreo, así que las lecturas son enteros
 *   repetibles. Comparar solo el tono ocultaría además los errores de luminancia, que fueron
 *   justo el defecto mayor del 20/09 (el rojo salía 2,44 veces MÁS claro en protanopia).
 *
 * HALLAZGOS DE LA PRIMERA INSPECCIÓN (20/09/2026) — todos REPARADOS, y re-verificados el 04/10:
 *   1038 (crítico) Las matrices no eran las de Machado (eran el juego HCIRN/Wickline) → REPARADO
 *        en de1a7007; CASOS 1 y 2.
 *   1039 (alto) Aquellas matrices eran invertibles y no fundían nunca dos colores → REPARADO;
 *        CASO 3 (el par de confusión protán sale idéntico).
 *   1040 (alto) La atribución a Machado era falsa → REPARADO al cambiar las matrices.
 *   1041 (medio) La acromatopsia aplicaba luma Rec.601 a luz lineal → REPARADO: Rec.709; CASOS 3 y 4.
 *   1042 (medio) El aviso de alcance vivía dentro de <EducationalSection> → REPARADO; CASO 3.bis.
 *   1043 (bajo) Prevalencias sin fuente → REPARADO: cita a Birch (2012).
 *   1044 (bajo) Emojis junto a texto sin aria-hidden → REPARADO.
 *
 * REPARACIONES POSTERIORES QUE ESTA RE-INSPECCIÓN VERIFICA
 *   b7733c6d (22/09) Las cabeceras de tabla dejan de poner blanco sobre --primary → CASO 8.
 *   99711f32 (03/10) La tritanopia confunde azul con verde (y amarillo con rosa), y el FAQPage
 *        pasa al 0,4 % de mujeres de Birch (2012) → CASO 10. Fuentes comprobadas el 04/10: NEI
 *        («Tritanopia makes someone unable to tell the difference between blue and green, purple
 *        and red, and yellow and pink») y el resumen de Birch en PubMed 22472762 («about 8% in
 *        men and about 0.4% in women» en europeos).
 *
 * HALLAZGOS ABIERTOS EN LA RE-INSPECCIÓN (04/10/2026), escritos con `test.fail()`:
 *   CASO 6   Una imagen que el navegador no puede decodificar se traga en silencio.
 *   CASO 7   `var(--radius-medium)` no existe: ocho reglas del módulo se quedan en esquina recta.
 *   CASO 9   «Subir imagen» (blanco sobre --primary) 4,11:1 en claro y 2,79:1 en oscuro.
 *   CASO 9.bis  «Errores frecuentes que evitar» (#dc3545 literal) 3,88:1 en claro y 2,68:1 en oscuro.
 *   CASO 11  El FAQPage atribuye el 8 % de los hombres a la protanopia y la deuteranopia.
 *   CASO 12  La guía dice que Machado es el estándar de Sim Daltonism y Color Oracle, que no lo usan.
 *   CASO 13  Los porcentajes del texto van pegados a la cifra.
 *   CASO 14  Volver a elegir el mismo fichero (re-exportado con el mismo nombre) no hace nada.
 */

const RUTA = '/simulador-daltonismo/';

type Color = [number, number, number];

/** Colores de entrada de los CASOS 1-3, un bloque de 100×100 px cada uno, en este orden. */
const ROJO = 0;
const VERDE = 1;
const AZUL = 2;
const CONFUSION_A = 3; // #006808 — verde oscuro
const CONFUSION_B = 4; // #F80800 — rojo vivo
const ENTRADA: ReadonlyArray<Color> = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [0, 104, 8],
  [248, 8, 0],
];

const ANCHO_BLOQUE = 100;
const ALTO = 100;
const ANCHO = ENTRADA.length * ANCHO_BLOQUE; // 500 px < TAMANO_MAX (720): no se reescala

// ── Codificador PNG mínimo ───────────────────────────────────────────────────
// Se genera el fichero en vez de guardarlo como fixture para que los colores de entrada estén
// escritos aquí arriba, a la vista, junto a los valores esperados que se derivan de ellos.

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = TABLA_CRC[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function trozo(tipo: string, datos: Buffer): Buffer {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length, 0);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo), 0);
  return Buffer.concat([largo, cuerpo, crc]);
}

/** PNG RGBA de bloques verticales planos y opacos, sin filtro por fila. */
function pngDeBloques(
  entrada: ReadonlyArray<Color> = ENTRADA,
  anchoBloque: number = ANCHO_BLOQUE,
  alto: number = ALTO,
): Buffer {
  const ancho = entrada.length * anchoBloque;
  const bruto = Buffer.alloc(alto * (1 + ancho * 4));
  for (let y = 0; y < alto; y++) {
    const fila = y * (1 + ancho * 4);
    bruto[fila] = 0; // filtro None
    for (let x = 0; x < ancho; x++) {
      const [r, g, b] = entrada[Math.floor(x / anchoBloque)];
      const p = fila + 1 + x * 4;
      bruto[p] = r;
      bruto[p + 1] = g;
      bruto[p + 2] = b;
      bruto[p + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; // 8 bits por canal
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', zlib.deflateSync(bruto, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

// ── Utilidades de la app ─────────────────────────────────────────────────────

/** Abre la app y espera a que React haya montado y los efectos hayan pintado las 8 tarjetas. */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[type="file"]']);
  await page.waitForFunction(() => document.querySelectorAll('article img').length === 8, null, {
    timeout: 30000,
  });
}

/** Espera a que las 8 tarjetas muestren una imagen de `ancho`×`alto` (la subida, no la demo). */
async function esperarTarjetasDe(page: Page, ancho: number, alto: number): Promise<void> {
  await page.waitForFunction(
    ({ w, h }) => {
      const imgs = [...document.querySelectorAll('article img')];
      return imgs.length === 8 && imgs.every((i) => {
        const img = i as HTMLImageElement;
        return img.naturalWidth === w && img.naturalHeight === h;
      });
    },
    { w: ancho, h: alto },
    { timeout: 30000 },
  );
}

/**
 * Abre la app, espera a que esté viva y sube la imagen de prueba.
 *
 * Dos testigos, porque uno solo no basta: `esperarHidratacion` prueba que React montó (sin su
 * rastreador de valor, el `change` del input de fichero no llegaría a `handleInputChange` y el
 * test se quedaría midiendo la imagen demo); y las 8 tarjetas con imagen prueban además que los
 * efectos corrieron. Después se exige que las 8 midan ya lo que mide la imagen subida, que es lo
 * que la distingue de la demo (720×410).
 */
async function subirImagenDePrueba(
  page: Page,
  entrada: ReadonlyArray<Color> = ENTRADA,
  anchoBloque: number = ANCHO_BLOQUE,
  alto: number = ALTO,
): Promise<void> {
  await abrir(page);
  await page.setInputFiles('input[type="file"]', {
    name: 'rgb-puros.png',
    mimeType: 'image/png',
    buffer: pngDeBloques(entrada, anchoBloque, alto),
  });
  await esperarTarjetasDe(page, entrada.length * anchoBloque, alto);
}

/**
 * Color que la app pinta para un bloque en la tarjeta de un tipo, o null si la tarjeta aún no
 * está (durante el procesado la parrilla desaparece). La tarjeta se localiza por el `alt` de su
 * imagen («Imagen vista con Protanopia»), no por su posición en la parrilla.
 */
async function colorSiHay(
  page: Page,
  tipo: string,
  bloque: number,
  anchoBloque: number = ANCHO_BLOQUE,
  alto: number = ALTO,
): Promise<Color | null> {
  return page.evaluate(
    ({ alt, x, y }) => {
      const img = [...document.querySelectorAll('article img')].find(
        (i) => (i as HTMLImageElement).alt === `Imagen vista con ${alt}`,
      ) as HTMLImageElement | undefined;
      if (!img || !img.complete || img.naturalWidth === 0) return null;
      const lienzo = document.createElement('canvas');
      lienzo.width = img.naturalWidth;
      lienzo.height = img.naturalHeight;
      const ctx = lienzo.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(x, y, 1, 1).data;
      return [d[0], d[1], d[2]] as [number, number, number];
    },
    { alt: tipo, x: bloque * anchoBloque + Math.floor(anchoBloque / 2), y: Math.floor(alto / 2) },
  );
}

async function colorPintado(
  page: Page,
  tipo: string,
  bloque: number,
  anchoBloque: number = ANCHO_BLOQUE,
  alto: number = ALTO,
): Promise<Color> {
  const c = await colorSiHay(page, tipo, bloque, anchoBloque, alto);
  if (!c) throw new Error(`No hay tarjeta con alt «Imagen vista con ${tipo}»`);
  return c;
}

/** Separación máxima por canal, en niveles de 255. */
const separacion = (a: Color, b: Color): number => Math.max(...a.map((v, i) => Math.abs(v - b[i])));

/** Desactiva transiciones: leer un color a mitad de una da un número que no existe en ningún tema. */
async function congelarTransiciones(page: Page): Promise<void> {
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
}

/** Tema oscuro con el botón REAL (sembrar `data-theme` lo pisa next-themes al hidratar). */
async function activarTemaOscuro(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

/**
 * El <button> «Subir imagen» de verdad. `getByRole('button', { name: /Subir imagen/ })` casa
 * PRIMERO con la zona de arrastre, un <div role="button"> con aria-label «Subir imagen para
 * simulación de daltonismo», que tiene otro fondo y otro radio: medía el elemento equivocado.
 */
const botonSubir = (page: Page): Locator => page.locator('button', { hasText: 'Subir imagen' });

async function abrirGuia(page: Page): Promise<void> {
  // Por el texto visible y no por el nombre accesible: el botón compartido lleva aria-label
  // «Ver guía educativa», distinto de lo que se ve (anotado en SOSPECHAS el 27/09/2026).
  await page.locator('button[aria-expanded="false"]', { hasText: 'Ver Guía Completa' }).click();
  await expect(page.locator('table th').first()).toBeVisible();
}

interface Contraste {
  ratio: number;
  color: string;
  fondo: string;
}

/**
 * Contraste WCAG del texto de un elemento contra su fondo REAL: compone las capas translúcidas
 * de los ancestros hasta la primera opaca (el blanco de la página si no hay ninguna).
 */
async function contrasteDe(loc: Locator): Promise<Contraste> {
  return loc.evaluate((el) => {
    const canal = (c: number): number => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (p: number[]): number => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const rgba = (s: string): number[] | null => {
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return n.length < 3 ? null : [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const capas: number[][] = [];
    let m: Element | null = el;
    while (m) {
      const c = rgba(getComputedStyle(m).backgroundColor);
      if (c && c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
      m = m.parentElement;
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const texto = rgba(getComputedStyle(el).color) ?? [0, 0, 0, 1];
    const l1 = lum(texto);
    const l2 = lum(fondo);
    return {
      ratio: +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2),
      color: getComputedStyle(el).color,
      fondo: `rgb(${fondo.map((v) => Math.round(v)).join(', ')})`,
    };
  });
}

/** Umbral AA de texto pequeño: todo lo medido aquí es < 18,66 px o de peso < 700. */
const UMBRAL_AA = 4.5;

// ── CASOS 1 y 2 · escritorio ─────────────────────────────────────────────────

test.describe('simulador-daltonismo', () => {
  test('CASO 1 · #FF0000 en protanopia — se aplica la matriz de Machado que la app declara', async ({
    page,
  }) => {
    await subirImagenDePrueba(page);

    const protanopia = await colorPintado(page, 'Protanopia', ROJO);

    // Machado et al. (2009), severidad 1,0, fila 1 [0.152286 1.052583 −0.204868] sobre R=1 en luz
    // LINEAL → 0,152286 → 109; fila 2 → 0,114503 → 95; fila 3 sale negativa y se acota a 0.
    // Reparado el 20/09/2026 (hallazgo 1038): antes salía rgb(198,197,0), el juego HCIRN/Wickline.
    const MACHADO_2009_PROTANOPIA_ROJO: Color = [109, 95, 0];
    expect(protanopia).toEqual(MACHADO_2009_PROTANOPIA_ROJO);

    // Y el efecto va en el sentido que la propia tarjeta de protanopia afirma.
    await expect(
      page.locator('article', { hasText: 'Protanopia' }).first(),
    ).toContainText('El rojo se percibe muy oscuro o negro');
    // Luminancia relativa WCAG: #FF0000 vale 0,2126 y el rgb(109,95,0) de Machado vale 0,1144
    // (0,54×), que SÍ es «más oscuro». Con las matrices viejas salía 0,5194: 2,44× más CLARO.
    const luminancia = (c: Color): number => {
      const lin = c.map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    };
    expect(luminancia(protanopia)).toBeLessThan(luminancia([255, 0, 0]));
  });

  test('CASO 2 · #00FF00 en deuteranopia — el verde puro sale AMARILLO, no un gris rosado', async ({
    page,
  }) => {
    await subirImagenDePrueba(page);

    const deuteranopia = await colorPintado(page, 'Deuteranopia', VERDE);
    const protanopia = await colorPintado(page, 'Protanopia', VERDE);

    // Machado (2009) deuteranopia sobre G=1: fila 1 → 0,860646 → 239; fila 2 → 0,672501 → 214;
    // fila 3 → 0,042940 → 58. Un AMARILLO saturado.
    const MACHADO_2009_DEUTERANOPIA_VERDE: Color = [239, 214, 58];
    expect(deuteranopia).toEqual(MACHADO_2009_DEUTERANOPIA_VERDE);
    // Protanopia sobre el mismo verde: 1,052583 se acota a 255; 0,786281 → 229; −0,048116 → 0.
    expect(protanopia).toEqual([255, 229, 0]);

    // Es amarillo de verdad, no un gris: R y G altos y muy por encima de B. Antes de repararlo
    // (20/09/2026) salía rgb(165,149,149), un gris rosado con un 6 % de saturación.
    expect(deuteranopia[0]).toBeGreaterThan(200);
    expect(deuteranopia[1]).toBeGreaterThan(200);
    expect(deuteranopia[2]).toBeLessThan(100);

    // Coherencia entre tipos: protanopia y deuteranopia NO pueden coincidir.
    expect(separacion(protanopia, deuteranopia)).toBeGreaterThan(2);
  });
});

// ── CASO 3 · móvil ───────────────────────────────────────────────────────────

test.describe('simulador-daltonismo · móvil', () => {
  // Se enumeran las opciones en vez de esparcir `...devices['Pixel 7']` porque el device trae
  // `defaultBrowserType` y Playwright no lo admite dentro de un describe.
  const PIXEL_7 = devices['Pixel 7'];
  test.use({
    viewport: PIXEL_7.viewport,
    userAgent: PIXEL_7.userAgent,
    deviceScaleFactor: PIXEL_7.deviceScaleFactor,
    isMobile: PIXEL_7.isMobile,
    hasTouch: PIXEL_7.hasTouch,
  });

  test('CASO 3 · en Pixel 7 — coherencia entre tipos, y dos colores que un protánope confunde', async ({
    page,
  }) => {
    await subirImagenDePrueba(page);

    // «Visión tricromática» debe devolver el original SIN TOCAR (la app ni siquiera pasa por la
    // matriz identidad: hace putImageData de los datos de origen).
    expect(await colorPintado(page, 'Visión tricromática', ROJO)).toEqual([255, 0, 0]);
    expect(await colorPintado(page, 'Visión tricromática', VERDE)).toEqual([0, 255, 0]);
    expect(await colorPintado(page, 'Visión tricromática', AZUL)).toEqual([0, 0, 255]);

    // La acromatopsia debe dar gris puro (R = G = B).
    for (const bloque of [ROJO, VERDE, AZUL]) {
      const gris = await colorPintado(page, 'Acromatopsia', bloque);
      expect(gris[0]).toBe(gris[1]);
      expect(gris[1]).toBe(gris[2]);
    }

    // Y su NIVEL es el de un convenio declarado: luminancia relativa Rec.709 (0,2126/0,7152/
    // 0,0722) sobre luz lineal, que para #FF0000 da 0,2126 → 127. Antes salía 149: luma Rec.601,
    // definida sobre señal CON GAMMA, aplicada a luz lineal (hallazgo 1041, reparado el 20/09/2026).
    expect(await colorPintado(page, 'Acromatopsia', ROJO)).toEqual([127, 127, 127]);

    // EL CASO QUE ESTA APP EXISTE PARA ENSEÑAR — el par de confusión protán.
    // #006808 (verde oscuro) y #F80800 (rojo vivo) están separados 248 niveles para quien ve los
    // tres conos, y Machado (2009) los funde en el MISMO rgb(106,93,0) (recalculado aparte el
    // 04/10/2026): un protánope no los distingue. Solo ocurre porque la matriz de protanopia es
    // SINGULAR. Con las matrices viejas, invertibles, salían rgb(69,70,53) y rgb(193,192,2)
    // (hallazgo 1039, reparado el 20/09/2026).
    const a = await colorPintado(page, 'Protanopia', CONFUSION_A);
    const b = await colorPintado(page, 'Protanopia', CONFUSION_B);
    expect(a).toEqual([106, 93, 0]);
    expect(b).toEqual([106, 93, 0]);
    expect(separacion(a, b)).toBe(0);

    // La deuteranopia también es singular y acerca ese par: Machado da rgb(97,86,23) y
    // rgb(159,141,0), separación 62 (antes 155). No tiene por qué fundirlos: la línea es la protán.
    const da = await colorPintado(page, 'Deuteranopia', CONFUSION_A);
    const db = await colorPintado(page, 'Deuteranopia', CONFUSION_B);
    expect(separacion(da, db)).toBeLessThan(155);
  });

  test('CASO 3.bis · en Pixel 7 — el aviso de alcance se lee SIN desplegar nada', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="file"]']);

    // Hasta el 20/09/2026 lo único que acotaba qué NO es esta app vivía dentro de
    // <EducationalSection>, que nace colapsada (hallazgo 1042, REPARADO). Ahora hay un aviso
    // propio bajo el hero, visible al llegar y sin abrir nada.
    const aviso = page.getByText(/no una prueba diagnóstica/i);
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('Ishihara');
  });
});

// ── Re-inspección 04/10/2026 ─────────────────────────────────────────────────

/**
 * Entrada del CASO 4: los invariantes (blanco, negro, dos grises) y los primarios que faltaban
 * por cubrir en tritanopia, tritanomalía y las dos anomalías rojo-verde. Bloques de 60 px:
 * 8 × 60 = 480 px, por debajo de 720, así que no se reescala.
 */
const LIMITE: ReadonlyArray<Color> = [
  [255, 255, 255], // 0 blanco
  [0, 0, 0], //       1 negro
  [128, 128, 128], // 2 gris medio
  [64, 64, 64], //    3 gris oscuro
  [255, 0, 0], //     4 rojo
  [0, 255, 0], //     5 verde
  [0, 0, 255], //     6 azul
  [255, 255, 0], //   7 amarillo
];
const BLOQUE_LIMITE = 60;
const ALTO_LIMITE = 60;

const TARJETAS = [
  'Visión tricromática',
  'Deuteranomalía',
  'Deuteranopia',
  'Protanomalía',
  'Protanopia',
  'Tritanomalía',
  'Tritanopia',
  'Acromatopsia',
] as const;

/** ±2 niveles de 255: el redondeo a 8 bits. Un error de modelo mueve decenas. */
const TOLERANCIA = 2;

function expectCerca(obtenido: Color, esperado: Color, contexto: string): void {
  expect(separacion(obtenido, esperado), `${contexto}: obtenido ${obtenido}, esperado ${esperado}`).toBeLessThanOrEqual(
    TOLERANCIA,
  );
}

test.describe('simulador-daltonismo · re-inspección 04/10/2026', () => {
  test('CASO 4 · límite — blanco, negro y grises no cambian en NINGUNA vista; primarios en tritán y anomalías', async ({
    page,
  }) => {
    await subirImagenDePrueba(page, LIMITE, BLOQUE_LIMITE, ALTO_LIMITE);
    const color = (tipo: string, bloque: number): Promise<Color> =>
      colorPintado(page, tipo, bloque, BLOQUE_LIMITE, ALTO_LIMITE);

    // Las 6 matrices de Machado de la Tabla 1 tienen filas que suman 1 (±0,000001) y la
    // acromatopsia usa 0,2126 + 0,7152 + 0,0722 = 1: un gris lineal x sale x en los tres canales,
    // y al volver a sRGB, el mismo nivel de 8 bits. Esperado: el gris de entrada, en las 8 tarjetas.
    for (const tipo of TARJETAS) {
      for (const bloque of [0, 1, 2, 3]) {
        expectCerca(await color(tipo, bloque), LIMITE[bloque], `${tipo}, bloque ${bloque}`);
      }
    }

    // Tritanopia (Machado severidad 1,0), calculado aparte con la Tabla 1:
    //   azul  #0000FF → columna 3 [−0,178779  0,147602  0,303900] → rgb(0, 107, 150)
    //   rojo  #FF0000 → columna 1 [ 1,255528 −0,078411  0,004733] → rgb(255, 0, 15)
    //   amarillo      → columnas 1+2                              → rgb(255, 238, 217)
    // (el amarillo sale rosado: «el amarillo con el rosa» del NEI que cita la tarjeta)
    expectCerca(await color('Tritanopia', 6), [0, 107, 150], 'Tritanopia, azul');
    expectCerca(await color('Tritanopia', 4), [255, 0, 15], 'Tritanopia, rojo');
    expectCerca(await color('Tritanopia', 7), [255, 238, 217], 'Tritanopia, amarillo');
    // Tritanomalía (severidad 0,6): verde → columna 2 [−0,046633 0,971635 0,317922] → rgb(0, 252, 153)
    expectCerca(await color('Tritanomalía', 5), [0, 252, 153], 'Tritanomalía, verde');
    // Protanomalía (0,6): rojo → columna 1 [0,385450 0,100526 −0,007442] → rgb(167, 89, 0)
    expectCerca(await color('Protanomalía', 4), [167, 89, 0], 'Protanomalía, rojo');
    // Deuteranomalía (0,6): rojo → columna 1 [0,498864 0,205199 −0,011131] → rgb(187, 125, 0)
    expectCerca(await color('Deuteranomalía', 4), [187, 125, 0], 'Deuteranomalía, rojo');
    // Acromatopsia, luminancia Rec.709 sobre lineal: verde 0,7152 → 220; azul 0,0722 → 76;
    // amarillo 0,9278 → 247.
    expectCerca(await color('Acromatopsia', 5), [220, 220, 220], 'Acromatopsia, verde');
    expectCerca(await color('Acromatopsia', 6), [76, 76, 76], 'Acromatopsia, azul');
    expectCerca(await color('Acromatopsia', 7), [247, 247, 247], 'Acromatopsia, amarillo');
  });

  test('CASO 5 · rechazo — un fichero que no es imagen, y uno de más de 10 MB, no tocan las tarjetas', async ({
    page,
  }) => {
    await subirImagenDePrueba(page);
    const dialogos: string[] = [];
    page.on('dialog', async (d) => {
      dialogos.push(d.message());
      await d.dismiss();
    });

    // `handleFile` filtra por `file.type.startsWith('image/')` y avisa con alert().
    await page.setInputFiles('input[type="file"]', {
      name: 'notas.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('esto no es una imagen'),
    });
    await expect.poll(() => dialogos.length).toBe(1);
    expect(dialogos[0]).toBe('Selecciona un archivo de imagen válido (JPG, PNG, WEBP...).');

    // Y el tope de 10 MB que anuncia la zona de subida («hasta 10 MB»).
    await page.setInputFiles('input[type="file"]', {
      name: 'enorme.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1024),
    });
    await expect.poll(() => dialogos.length).toBe(2);
    expect(dialogos[1]).toBe('La imagen supera 10 MB. Usa una de menor tamaño.');

    // Las tarjetas siguen con la imagen anterior (500×100), intactas.
    await esperarTarjetasDe(page, ANCHO, ALTO);
    expect(await colorPintado(page, 'Protanopia', ROJO)).toEqual([109, 95, 0]);
  });

  test('CASO 6 · rechazo — una imagen que el navegador no puede decodificar debe AVISAR', async ({
    page,
  }) => {
    test.fail(
      true,
      'Hallazgo ABIERTO (04/10/2026): `img.decode()` rechaza dentro de un try/finally sin catch; no ' +
        'hay aviso, la consola registra «The source image cannot be decoded.» y las tarjetas siguen ' +
        'con la imagen anterior, que «Descargar» guarda con el nombre del fichero roto ' +
        '(roto_protanopia.png con el contenido de la imagen previa).',
    );
    await subirImagenDePrueba(page);
    const dialogos: string[] = [];
    page.on('dialog', async (d) => {
      dialogos.push(d.message());
      await d.dismiss();
    });

    // Tipo image/png (pasa el filtro de handleFile) y contenido que no es un PNG.
    await page.setInputFiles('input[type="file"]', {
      name: 'roto.png',
      mimeType: 'image/png',
      buffer: Buffer.from('esto no es un png, son bytes cualquiera'.repeat(10)),
    });

    // Esperado: un aviso, sea con alert() como los otros dos rechazos o en la página. Se acota al
    // aviso de la app: el anunciador de rutas de Next también tiene role="alert".
    const avisoEnPagina = page
      .locator('[role="alert"]:not(#__next-route-announcer__), [role="status"]')
      .filter({ hasText: /imagen|archivo|fichero/i });
    await expect
      .poll(async () => dialogos.length + (await avisoEnPagina.count()), { timeout: 5000 })
      .toBeGreaterThan(0);
  });

  test('CASO 7 · --radius-medium — los botones y cajas que lo usan deben salir con esquina redondeada', async ({
    page,
  }) => {
    test.fail(
      true,
      'Hallazgo ABIERTO (04/10/2026): `--radius-medium` no se declara en ningún sitio (globals.css ' +
        'solo aliasó --radius-large y --shadow-*), y una var() sin valor de reserva anula la ' +
        'declaración: border-radius 0px en .btnPrimary, .btnSecondary, .btnDownload, .cardImage, ' +
        '.comparativaTable, .escenarioCard, .faqItem y .warningBox, en claro y en oscuro.',
    );
    await abrir(page);
    const radio = (loc: Locator): Promise<string> =>
      loc.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);

    // Testigo de que se mide bien: la tarjeta usa --radius-large, que SÍ tiene alias (16px).
    expect(await radio(page.locator('article').first())).toBe('16px');

    const subir = botonSubir(page);
    const descargar = page.getByRole('button', { name: /^Descargar simulación/ }).first();
    expect(await radio(subir)).not.toBe('0px');
    expect(await radio(descargar)).not.toBe('0px');
  });

  test('CASO 8 · contraste de las cabeceras de tabla ≥ 4,5:1 en claro y en oscuro (b7733c6d)', async ({
    page,
  }) => {
    await abrir(page);
    await congelarTransiciones(page);
    await abrirGuia(page);
    const th = page.locator('table th').first();

    // Claro: blanco sobre --primary-boton #26718F → 5,47:1 (antes, sobre --primary, 4,11).
    const claro = await contrasteDe(th);
    expect(claro.ratio, `claro: ${claro.color} sobre ${claro.fondo}`).toBeGreaterThanOrEqual(UMBRAL_AA);

    // Oscuro: blanco sobre --secondary-boton #327874 → 5,15:1 (con --secondary eran 2,80).
    await activarTemaOscuro(page);
    const oscuro = await contrasteDe(th);
    expect(oscuro.fondo, 'el fondo debe cambiar: si no, se está midiendo el tema claro dos veces').not.toBe(
      claro.fondo,
    );
    expect(oscuro.ratio, `oscuro: ${oscuro.color} sobre ${oscuro.fondo}`).toBeGreaterThanOrEqual(UMBRAL_AA);
  });

  test('CASO 9 · contraste — el color de marca como texto o como fondo de texto blanco', async ({ page }) => {
    test.fail(
      true,
      'Hallazgo ABIERTO (04/10/2026): «Subir imagen» es blanco sobre var(--primary): 4,11:1 en claro ' +
        'y 2,79:1 en oscuro (#3FA5D1), a 15,2 px y peso 600; «Descargar» es var(--primary) sobre ' +
        'blanco, 4,11:1; y los <h3> de la guía, var(--primary) sobre #F5F5F5, 3,77:1 a 18,72 px y ' +
        'peso 600 (no llega a «texto grande», que exige negrita 700). Existen --primary-boton y ' +
        '--primary-texto para esto.',
    );
    await abrir(page);
    await congelarTransiciones(page);
    await abrirGuia(page);
    const subir = botonSubir(page);
    const descargar = page.getByRole('button', { name: /^Descargar simulación/ }).first();
    const h3 = page.getByRole('heading', { name: 'Tipos de daltonismo en una tabla' });

    for (const [nombre, loc] of [
      ['Subir imagen', subir],
      ['Descargar', descargar],
      ['h3 de la guía', h3],
    ] as const) {
      const c = await contrasteDe(loc);
      expect(c.ratio, `claro · ${nombre}: ${c.color} sobre ${c.fondo}`).toBeGreaterThanOrEqual(UMBRAL_AA);
    }
    await activarTemaOscuro(page);
    const c = await contrasteDe(subir);
    expect(c.ratio, `oscuro · Subir imagen: ${c.color} sobre ${c.fondo}`).toBeGreaterThanOrEqual(UMBRAL_AA);
  });

  test('CASO 9.bis · contraste — «Errores frecuentes que evitar» en claro y en oscuro', async ({ page }) => {
    test.fail(
      true,
      'Hallazgo ABIERTO (04/10/2026): el <h4> de .warningBox es #dc3545 literal, sin variante oscura: ' +
        '3,88:1 sobre su caja rosada en claro y 2,68:1 sobre rgb(69,49,51) en oscuro, a 16 px y peso 600.',
    );
    await abrir(page);
    await congelarTransiciones(page);
    await abrirGuia(page);
    const h4 = page.getByRole('heading', { name: 'Errores frecuentes que evitar' });
    const claro = await contrasteDe(h4);
    expect(claro.ratio, `claro: ${claro.color} sobre ${claro.fondo}`).toBeGreaterThanOrEqual(UMBRAL_AA);
    await activarTemaOscuro(page);
    const oscuro = await contrasteDe(h4);
    expect(oscuro.ratio, `oscuro: ${oscuro.color} sobre ${oscuro.fondo}`).toBeGreaterThanOrEqual(UMBRAL_AA);
  });

  test('CASO 10 · tritanopia «azul con verde» y 0,4 % de mujeres, sin restos de lo anterior (99711f32)', async ({
    page,
  }) => {
    await abrir(page);

    // Fuente: NEI, «Types of color vision deficiency» (consultado el 04/10/2026): «Tritanopia makes
    // someone unable to tell the difference between blue and green, purple and red, and yellow
    // and pink». Antes la tarjeta y la tabla decían «azul y amarillo».
    const tarjeta = page.locator('article', { has: page.getByRole('heading', { name: 'Tritanopia', exact: true }) });
    await expect(tarjeta).toContainText('Se confunden el azul con el verde y el amarillo con el rosa');
    await expect(page.locator('table')).toContainText('Confusión azul-verde y amarillo-rosa');

    const faq = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => s.textContent ?? '')
        .find((t) => t.includes('"FAQPage"')) ?? '',
    );
    expect(faq).toContain('el azul se confunde con el verde y el amarillo con el rosa');
    // Birch (2012), PubMed 22472762: «about 8% in men and about 0.4% in women» (europeos).
    expect(faq).toMatch(/0,4\s%\sde las mujeres de ascendencia europea/);

    // Y que no quede nada que diga lo contrario, ni en la página ni en el JSON-LD.
    const pagina = (await page.locator('body').textContent()) ?? '';
    for (const texto of [pagina, faq]) {
      expect(texto).not.toMatch(/azul y amarillo se confunden|azules y amarillos se perciben|confusión azul-amarillo/i);
      expect(texto).not.toMatch(/0,5\s?% de las mujeres/);
    }
  });

  test('CASO 11 · el FAQPage no atribuye el 8 % de los hombres a la protanopia y la deuteranopia', async ({
    page,
  }) => {
    test.fail(
      true,
      'Hallazgo ABIERTO (04/10/2026): la 1.ª respuesta del FAQPage dice «Los tipos más frecuentes son ' +
        'la protanopia y la deuteranopia (…), que afectan a alrededor del 8 % de los hombres». El 8 % ' +
        'de Birch (2012) es TODA la deficiencia rojo-verde; la tabla de la propia página da ~1 % a ' +
        'cada dicromacia y ~5 % a la deuteranomalía, que su tarjeta llama «la forma más frecuente».',
    );
    await page.goto(RUTA);
    const faq = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => s.textContent ?? '')
        .find((t) => t.includes('"FAQPage"')) ?? '',
    );
    expect(faq).toContain('"FAQPage"');
    expect(faq).not.toMatch(/protanopia y la deuteranopia[^.]*8\s?%/);
  });

  test('CASO 12 · la guía no pone como ejemplos de Machado a herramientas que no lo usan', async ({ page }) => {
    test.fail(
      true,
      'Hallazgo ABIERTO (04/10/2026): «Es el estándar de facto en herramientas de accesibilidad como ' +
        'Sim Daltonism o Color Oracle». Color Oracle (Simulator.java) cita Viénot, Brettel & Mollon ' +
        '(1999) y Brettel et al. (1997); el README de Sim Daltonism, el `color_blind_sim` de ' +
        'Wickline/HCIRN. Ninguna de las dos usa Machado (2009).',
    );
    await page.goto(RUTA);
    const guia = (await page.locator('body').textContent()) ?? '';
    expect(guia).toContain('Machado, Oliveira');
    expect(guia).not.toMatch(/como Sim Daltonism o Color Oracle/);
  });

  test('CASO 13 · formato — los porcentajes del texto llevan espacio (duro) antes del %', async ({ page }) => {
    test.fail(
      true,
      'Hallazgo ABIERTO (04/10/2026): 25 porcentajes del texto visible van pegados a la cifra ' +
        '(«~92%», «0,4%», «<0,01%», «5% de tu audiencia»…), contra la norma del proyecto (RAE 2010, ' +
        'decidida el 25/09/2026). El FAQPage ya usa «8 %» con U+00A0.',
    );
    await abrir(page);
    // Solo el texto propio de la app: tarjetas, tabla y guía (no los componentes compartidos).
    const propio = await page.evaluate(() =>
      [...document.querySelectorAll('article, table, [class*="guideSection"]')]
        .map((e) => e.textContent ?? '')
        .join(' '),
    );
    expect(propio).toContain('Birch');
    expect(propio.match(/\d%/g) ?? []).toEqual([]);
  });

  test('CASO 14 · volver a elegir el MISMO fichero, re-exportado con otro contenido, lo vuelve a simular', async ({
    page,
  }) => {
    test.fail(
      true,
      'Hallazgo ABIERTO (04/10/2026): el <input type="file"> no se vacía tras leerlo, y el navegador ' +
        'no dispara `change` si la selección (la ruta) no cambia. Quien corrige su diseño —el paso 5 ' +
        'de la propia guía— y lo vuelve a elegir con el mismo nombre sigue viendo la versión anterior, ' +
        'sin aviso. Lo mismo tras pulsar «Usar imagen demo»: re-elegir el fichero no hace nada.',
    );
    await abrir(page);
    const ruta = test.info().outputPath('mi-diseno.png');

    // Versión 1: rojo puro, 100×100. Se elige por el selector de ficheros, como un usuario.
    fs.writeFileSync(ruta, pngDeBloques([[255, 0, 0]], 100, 100));
    let [selector] = await Promise.all([
      page.waitForEvent('filechooser'),
      botonSubir(page).click(),
    ]);
    await selector.setFiles(ruta);
    await esperarTarjetasDe(page, 100, 100);
    await expect.poll(() => colorSiHay(page, 'Visión tricromática', 0)).toEqual([255, 0, 0]);

    // Versión 2: el diseñador corrige y exporta ENCIMA, azul puro, y vuelve a elegirlo.
    fs.writeFileSync(ruta, pngDeBloques([[0, 0, 255]], 100, 100));
    [selector] = await Promise.all([
      page.waitForEvent('filechooser'),
      botonSubir(page).click(),
    ]);
    await selector.setFiles(ruta);

    // Esperado: la tarjeta normal muestra la versión nueva (azul). Obtenido: sigue en rojo.
    await expect.poll(() => colorSiHay(page, 'Visión tricromática', 0), { timeout: 5000 }).toEqual([0, 0, 255]);
  });
});
