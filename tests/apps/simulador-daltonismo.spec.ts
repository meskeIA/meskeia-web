import { test, expect, devices, Page } from '@playwright/test';
import zlib from 'node:zlib';
import { esperarHidratacion } from './_hidratacion';

/**
 * Inspector — simulador-daltonismo (segmento interactiva, riesgo 2, 47 usos, 126 s de estancia)
 *
 * Primera inspección: 20/09/2026 (Opus 5), contra producción y contra el código del repositorio,
 * que el deploy de las 11:25 deja idénticos. Las cifras de abajo salieron iguales en los dos.
 *
 * QUÉ PROMETE
 *   <h1> «🌈 Simulador de Daltonismo». El subtítulo: «Sube una imagen o usa la paleta de prueba y
 *   verás al instante 8 simulaciones generadas con MATRICES OFICIALES». El bloque educativo lo
 *   concreta en una pregunta que se responde a sí misma:
 *       «¿Las matrices que usas son las correctas? — Sí. Son las matrices publicadas en Machado,
 *        Oliveira & Fernandes (2009), "A Physiologically-based Model for Simulation of Color
 *        Vision Deficiency", IEEE TVCG.»
 *   La misma atribución aparece en otros seis sitios: el comentario del código (L86 y L138), dos
 *   párrafos más del bloque educativo, `metadata.ts` (descripción del jsonLd y la característica
 *   «Matrices oficiales Machado et al. (2009)»), el FAQPage y `data/applications.ts`.
 *   Es una app de FIDELIDAD, no de decoración: su público declarado son diseñadores que van a
 *   DECIDIR si cambian su paleta a partir de lo que aquí vean.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-daltonismo/page.tsx, líneas 86-165. No hay motor aparte ni se importa nada:
 *   `MATRICES` (8 matrices 3×3), `srgbToLinear`, `linearToSrgb` y `aplicarMatriz` viven en el
 *   propio componente. La cadena es: sRGB 8 bits → linealizar (curva sRGB por tramos, exponente
 *   2,4) → matriz 3×3 → volver a comprimir. La linealización EXISTE y está comentada a propósito.
 *
 * EL PARENTESCO CON simulador-baja-vision (reparada esta misma mañana en 2aa674b3)
 *   No comparten motor ni fichero: la hermana aplica sus filtros con <feColorMatrix> de SVG y
 *   ésta lo hace píxel a píxel en canvas. Pero las matrices están DUPLICADAS LITERALMENTE — los
 *   tres daltonismos de la hermana son bit a bit los de aquí ([0.567 0.433 0 / 0.558 0.442 0 /
 *   0 0.242 0.758] para protanopia, etc.). Y ahí está lo que importa: esta mañana la hermana se
 *   reparó forzando `color-interpolation-filters="sRGB"`, es decir declarando que esas matrices
 *   se multiplican contra sRGB de 8 bits. Ésta hace lo CONTRARIO con las mismas cifras: lineariza
 *   antes. Las dos no pueden tener razón, y hoy pintan colores distintos para la misma condición:
 *       #DC2626 en protanopia → hermana rgb(141,140,38)   ·   ésta rgb(172,171,38)
 *   (los dos valores están escritos en el propio mensaje del commit 2aa674b3, y mi cálculo a mano
 *   los reproduce exactos, lo que valida el modelo de las dos cadenas).
 *   La cabecera de la spec de la hermana daba por bueno este vecino: «el vecino
 *   simulador-daltonismo sí lo resuelve a propósito, en canvas y con un comentario que lo
 *   explica». El comentario explica bien una cadena que se aplica a las matrices equivocadas.
 *
 * LA RAÍZ: LAS MATRICES NO SON LAS DE MACHADO
 *   Machado, Oliveira & Fernandes (2009) publican, para dicromacia completa (severidad 1,0):
 *       protanopia    [ 0.152286  1.052583 -0.204868 / 0.114503  0.786281 0.099216 /
 *                      -0.003882 -0.048116  1.051998 ]
 *       deuteranopia  [ 0.367322  0.860646 -0.227968 / 0.280085  0.672501 0.047413 /
 *                      -0.011820  0.042940  0.968881 ]
 *   Las del código son [0.567 0.433 0 / …]: el juego HCIRN/Wickline que circula copiado en los
 *   filtros SVG y CSS de daltonismo de media web — el mismo, letra por letra, que la app hermana.
 *   Dos comprobaciones estructurales que no dependen de creerme las cifras:
 *     · Machado: las tres filas suman 1,000000 (el blanco se conserva) Y el determinante es
 *       −0,000000 y 0,000001. Una DICROMACIA colapsa el espacio de color de 3 a 2 dimensiones,
 *       así que su matriz TIENE que ser singular. Lo es.
 *     · El código: las filas también suman 1, pero el determinante vale 0,006822 (protanopia) y
 *       −0,052500 (deuteranopia). Son INVERTIBLES. Una transformación invertible no funde nunca
 *       dos colores en uno, de modo que esta app no puede enseñar jamás una confusión — que es
 *       exactamente para lo que dice servir («comprueba si tu paleta se sigue distinguiendo bajo
 *       deuteranopia o protanopia»). De ahí sale el CASO 3.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Método: linealizar cada canal con la curva sRGB, multiplicar por la matriz, volver a sRGB.
 *   Ej. #FF0000 con la matriz DEL CÓDIGO en lineal: R=1, G=B=0 →
 *       R' = 0,567 → 1,055·0,567^(1/2,4) − 0,055 = 0,7765 → 198
 *       G' = 0,558 → 0,7716 → 197        B' = 0 → 0
 *   y con la matriz PUBLICADA de Machado, misma cadena → rgb(109, 95, 0).
 *
 *   CASO 1 — #FF0000 en protanopia          app 198,197,0   ·   Machado 109,95,0   (Δ 102 niveles)
 *   CASO 2 — #00FF00 en deuteranopia        app 165,149,149 ·   Machado 239,214,58 (Δ  91 niveles)
 *            (y en protanopia               app 176,177,135 ·   Machado 255,229,0  (Δ 135 niveles))
 *   CASO 3 — coherencia entre tipos, EN MÓVIL (Pixel 7), sobre el par de confusión protán
 *            #006808 y #F80800: Machado funde los dos en el MISMO rgb(106,93,0); la app los deja
 *            en 69,70,53 y 193,192,2, separados 124 niveles.
 *
 *   Tolerancia fijada de antemano: ±2 niveles de 255 por redondeo. Lo medido salió EXACTO, al
 *   nivel, en escritorio y en Pixel 7, así que los `expect` van sin margen.
 *
 * POR QUÉ SE COMPARA RGB DIRECTO Y NO EL TONO
 *   La regla del tono es para dibujos atenuados o compuestos sobre un fondo. Aquí no hay nada de
 *   eso: se sube un PNG de bloques planos OPACOS de 500 px de ancho (por debajo del TAMANO_MAX de
 *   720, así que `drawImage` no reescala) y se lee el centro de cada bloque. No hay mezcla ni
 *   remuestreo, y por eso las lecturas son enteros exactos y repetibles. Comparar solo el tono
 *   OCULTARÍA además el defecto mayor: que el rojo salga 2,44 veces MÁS LUMINOSO que el original
 *   es un error de luminancia, justo lo que el tono descarta.
 *
 * QUÉ OTRA COSA PRODUCIRÍA LA MISMA MEDIDA (antes de fiarse del testigo de píxeles)
 *   Que la tarjeta leída no fuera la que creo, que la imagen se hubiera reescalado, o que ni
 *   siquiera se hubiera cargado. Los tres quedan cerrados: la tarjeta se busca por el `alt` de su
 *   imagen y no por su posición; se exige naturalWidth === 500 y naturalHeight === 100 antes de
 *   leer; y se muestrea el centro de un bloque de 100 px, lejos de cualquier borde.
 *
 * HALLAZGOS ABIERTOS, escritos como TESTIGO (documentan lo que la app hace HOY; cuando se
 * reparen, estos bloques fallarán y habrá que invertirlos hacia los valores de Machado que
 * quedan anotados al lado). NO se corrigen desde el test:
 *   A. Las matrices no son las de Machado pese a declararlo en siete sitios, y además se aplican
 *      en RGB lineal. Desviación de hasta 135 niveles de 255 sobre el modelo prometido, y el
 *      efecto sale INVERTIDO respecto al texto de la propia tarjeta de protanopia («el rojo se
 *      percibe muy oscuro o negro»): la luminancia relativa del rojo puro pasa de 0,2126 a 0,5194,
 *      es decir 2,44× MÁS CLARO. Con Machado sería 0,1144, la mitad de oscuro, que es lo que la
 *      tarjeta promete.
 *   B. Las matrices de las dos dicromacias son invertibles, así que ningún par de colores se funde
 *      nunca (CASO 3). Un diseñador que traiga el par del CASO 3 se va con la conclusión contraria
 *      a la correcta: que su rojo y su verde se distinguen bien en protanopia.
 *   C. La acromatopsia usa 0,299/0,587/0,114 — los coeficientes de LUMA Rec.601, definidos sobre
 *      señal con gamma — aplicados a luz LINEAL. #FF0000 sale 149; el convenio de esos
 *      coeficientes da 76 y la luminancia Rec.709 sobre lineal da 127. No es ninguno de los dos.
 *   D. El único aviso que acota el alcance («¿Esta herramienta sirve para diagnóstico? No.») vive
 *      dentro de <EducationalSection>, que nace colapsada: mide 0×0 px hasta que se pulsa «Ver
 *      Guía Completa». Es la prohibición expresa del CLAUDE.md, y el mismo hallazgo que se le
 *      reparó a la hermana esta mañana.
 *   E. Ninguna cifra de prevalencia cita fuente, ni en las ocho tarjetas ni en la tabla ni en el
 *      párrafo del 8 % / 0,5 %. Los valores son correctos y coherentes entre sí (5+1+1+1 = 8 % en
 *      hombres; 0,4+0,01+0,03+0,02 ≈ 0,5 % en mujeres), pero se afirman sin respaldo — en una app
 *      que sí cita fuente para las matrices.
 *   F. Cuatro emojis junto a texto sin <span aria-hidden="true">: el <h1> (L361), «📁 Subir
 *      imagen» (L393), «🔄 Usar imagen demo» (L403) y «⬇ Descargar» (L450). Comprobado en el
 *      árbol de accesibilidad de Chromium, que expone name="📁 Subir imagen". Es pasivo anterior
 *      al candado, y `node scripts/check-a11y-jsx.mjs app/simulador-daltonismo/page.tsx` los
 *      nombra uno a uno.
 */

const RUTA = '/simulador-daltonismo/';

/** Colores de entrada, un bloque de 100×100 px cada uno, en este orden. */
const ROJO = 0;
const VERDE = 1;
const AZUL = 2;
const CONFUSION_A = 3; // #006808 — verde oscuro
const CONFUSION_B = 4; // #F80800 — rojo vivo
const ENTRADA: ReadonlyArray<readonly [number, number, number]> = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [0, 104, 8],
  [248, 8, 0],
];

const ANCHO_BLOQUE = 100;
const ALTO = 100;
const ANCHO = ENTRADA.length * ANCHO_BLOQUE; // 500 px < TAMANO_MAX (720): no se reescala

type Color = [number, number, number];

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
function pngDeBloques(): Buffer {
  const bruto = Buffer.alloc(ALTO * (1 + ANCHO * 4));
  for (let y = 0; y < ALTO; y++) {
    const fila = y * (1 + ANCHO * 4);
    bruto[fila] = 0; // filtro None
    for (let x = 0; x < ANCHO; x++) {
      const [r, g, b] = ENTRADA[Math.floor(x / ANCHO_BLOQUE)];
      const p = fila + 1 + x * 4;
      bruto[p] = r;
      bruto[p + 1] = g;
      bruto[p + 2] = b;
      bruto[p + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ANCHO, 0);
  ihdr.writeUInt32BE(ALTO, 4);
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

/**
 * Abre la app, espera a que esté viva y sube la imagen de prueba.
 *
 * Dos testigos, porque uno solo no basta: `esperarHidratacion` prueba que React montó (sin su
 * rastreador de valor, el `change` del input de fichero no llegaría a `handleInputChange` y el
 * test se quedaría midiendo la imagen demo); y las 8 tarjetas con imagen prueban además que los
 * efectos corrieron. Después se exige que las 8 midan ya 500×100, que es lo que distingue la
 * imagen subida de la demo (720×410).
 */
async function subirImagenDePrueba(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['input[type="file"]']);
  await page.waitForFunction(() => document.querySelectorAll('article img').length === 8, null, {
    timeout: 30000,
  });

  await page.setInputFiles('input[type="file"]', {
    name: 'rgb-puros.png',
    mimeType: 'image/png',
    buffer: pngDeBloques(),
  });

  await page.waitForFunction(
    ({ w, h }) => {
      const imgs = [...document.querySelectorAll('article img')];
      return imgs.length === 8 && imgs.every((i) => {
        const img = i as HTMLImageElement;
        return img.naturalWidth === w && img.naturalHeight === h;
      });
    },
    { w: ANCHO, h: ALTO },
    { timeout: 30000 },
  );
}

/**
 * Color que la app pinta para un bloque en la tarjeta de un tipo. La tarjeta se localiza por el
 * `alt` de su imagen («Imagen vista con Protanopia»), no por su posición en la parrilla, para que
 * reordenar las tarjetas no haga pasar el test midiendo otra cosa.
 */
async function colorPintado(page: Page, tipo: string, bloque: number): Promise<Color> {
  return page.evaluate(
    ({ alt, x, y }) => {
      const img = [...document.querySelectorAll('article img')].find(
        (i) => (i as HTMLImageElement).alt === `Imagen vista con ${alt}`,
      ) as HTMLImageElement | undefined;
      if (!img) throw new Error(`No hay tarjeta con alt «Imagen vista con ${alt}»`);
      const lienzo = document.createElement('canvas');
      lienzo.width = img.naturalWidth;
      lienzo.height = img.naturalHeight;
      const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(x, y, 1, 1).data;
      return [d[0], d[1], d[2]] as [number, number, number];
    },
    { alt: tipo, x: bloque * ANCHO_BLOQUE + ANCHO_BLOQUE / 2, y: ALTO / 2 },
  );
}

/** Separación máxima por canal, en niveles de 255. */
const separacion = (a: Color, b: Color): number => Math.max(...a.map((v, i) => Math.abs(v - b[i])));

// ── CASOS 1 y 2 · escritorio ─────────────────────────────────────────────────

test.describe('simulador-daltonismo', () => {
  test('CASO 1 · #FF0000 en protanopia — la matriz aplicada no es la de Machado que se declara', async ({
    page,
  }) => {
    await subirImagenDePrueba(page);

    const protanopia = await colorPintado(page, 'Protanopia', ROJO);

    // TESTIGO del hallazgo A. Lo que sale hoy: matriz HCIRN/Wickline [0.567 0.433 0 / …]
    // linealizada → 0,567 y 0,558 en luz lineal → 198 y 197 al volver a sRGB.
    expect(protanopia).toEqual([198, 197, 0]);

    // Lo CORRECTO según lo que la app promete siete veces: Machado et al. (2009), severidad 1,0,
    // fila 1 [0.152286 1.052583 −0.204868] sobre R=1 → 0,152286 → 109; fila 2 → 0,114503 → 95.
    // Cuando se repare, este expect pasa a ser el de arriba y el testigo se retira.
    const MACHADO_2009_PROTANOPIA_ROJO: Color = [109, 95, 0];
    expect(separacion(protanopia, MACHADO_2009_PROTANOPIA_ROJO)).toBe(102);

    // Y el efecto sale INVERTIDO respecto a lo que la propia tarjeta de protanopia afirma.
    await expect(
      page.locator('article', { hasText: 'Protanopia' }).first(),
    ).toContainText('El rojo se percibe muy oscuro o negro');
    // Luminancia relativa WCAG: #FF0000 vale 0,2126; rgb(198,197,0) vale 0,5194 (2,44× MÁS claro);
    // el rgb(109,95,0) de Machado vale 0,1144 (0,54×, que sí es «más oscuro»).
    const luminancia = (c: Color): number => {
      const lin = c.map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
    };
    expect(luminancia(protanopia)).toBeGreaterThan(luminancia([255, 0, 0]));
  });

  test('CASO 2 · #00FF00 en deuteranopia — sale un gris rosado donde el modelo da amarillo', async ({
    page,
  }) => {
    await subirImagenDePrueba(page);

    const deuteranopia = await colorPintado(page, 'Deuteranopia', VERDE);
    const protanopia = await colorPintado(page, 'Protanopia', VERDE);

    // TESTIGO del hallazgo A. Matriz del código en lineal: G=1 → 0,375 / 0,300 / 0,300.
    expect(deuteranopia).toEqual([165, 149, 149]);
    expect(protanopia).toEqual([176, 177, 135]);

    // Machado (2009) deuteranopia sobre G=1: fila 1 → 0,860646 → 239; fila 2 → 0,672501 → 214;
    // fila 3 → 0,042940 → 58. Es decir un AMARILLO saturado, que es como se describe siempre la
    // apariencia del verde puro para un deuteránope. Protanopia daría rgb(255,229,0).
    const MACHADO_2009_DEUTERANOPIA_VERDE: Color = [239, 214, 58];
    expect(separacion(deuteranopia, MACHADO_2009_DEUTERANOPIA_VERDE)).toBe(91);

    // El error no es de nivel sino de TONO: lo pintado tiene R > G = B, o sea un gris rosado con
    // un 6 % de saturación, mientras el modelo da un amarillo al 76 %.
    expect(deuteranopia[0]).toBeGreaterThan(deuteranopia[1]);
    expect(deuteranopia[1]).toBe(deuteranopia[2]);

    // Coherencia entre tipos: protanopia y deuteranopia NO pueden coincidir. Aquí sí se cumple.
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
    // matriz identidad: hace putImageData de los datos de origen). Se cumple.
    expect(await colorPintado(page, 'Visión tricromática', ROJO)).toEqual([255, 0, 0]);
    expect(await colorPintado(page, 'Visión tricromática', VERDE)).toEqual([0, 255, 0]);
    expect(await colorPintado(page, 'Visión tricromática', AZUL)).toEqual([0, 0, 255]);

    // La acromatopsia debe dar gris puro (R = G = B). Se cumple en los tres.
    for (const bloque of [ROJO, VERDE, AZUL]) {
      const gris = await colorPintado(page, 'Acromatopsia', bloque);
      expect(gris[0]).toBe(gris[1]);
      expect(gris[1]).toBe(gris[2]);
    }

    // TESTIGO del hallazgo C: el nivel de ese gris no es de ningún convenio. Para #FF0000 la app
    // da 149 porque aplica los coeficientes de luma Rec.601 (0,299/0,587/0,114), que están
    // definidos sobre señal CON GAMMA, a luz LINEAL. Ese convenio daría 76; la luminancia
    // Rec.709 sobre lineal (0,2126/0,7152/0,0722) daría 127.
    expect(await colorPintado(page, 'Acromatopsia', ROJO)).toEqual([149, 149, 149]);

    // TESTIGO del hallazgo B — el par de confusión protán.
    // #006808 (verde oscuro) y #F80800 (rojo vivo) están separados 248 niveles para quien ve los
    // tres conos, y Machado (2009) los funde en el MISMO rgb(106,93,0): un protánope no los
    // distingue. Es el caso que esta app existe para enseñar.
    const a = await colorPintado(page, 'Protanopia', CONFUSION_A);
    const b = await colorPintado(page, 'Protanopia', CONFUSION_B);
    expect(a).toEqual([69, 70, 53]);
    expect(b).toEqual([193, 192, 2]);
    // Lo que se le enseña hoy al diseñador: que se distinguen de sobra. Exactamente al revés.
    expect(separacion(a, b)).toBe(124);
    // Cuando se repare a Machado, los dos valdrán rgb(106,93,0) y esta separación será 0:
    //   expect(separacion(a, b)).toBeLessThanOrEqual(2);

    // La deuteranopia los separa aún más (155 niveles), y su matriz tiene determinante −0,0525:
    // ninguna de las dos dicromacias puede fundir nunca dos colores en uno.
    const da = await colorPintado(page, 'Deuteranopia', CONFUSION_A);
    const db = await colorPintado(page, 'Deuteranopia', CONFUSION_B);
    expect(separacion(da, db)).toBe(155);
  });

  test('CASO 3.bis · en Pixel 7 — el único aviso de alcance nace colapsado', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="file"]']);

    // TESTIGO del hallazgo D. «¿Esta herramienta sirve para diagnóstico? No. El daltonismo se
    // diagnostica con tests específicos (Ishihara, Farnsworth-Munsell)…» es lo único que acota
    // qué NO es esta app, y vive dentro de <EducationalSection>, que nace colapsada.
    const aviso = page.locator('h4', { hasText: '¿Esta herramienta sirve para diagnóstico?' });
    await expect(aviso).toHaveCount(1); // está en el DOM (se monta siempre, por SEO)
    expect(await aviso.boundingBox()).toBeNull(); // …pero mide 0×0: no se ve

    // Se ve solo tras pulsar el desplegable.
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    await expect(aviso).toBeVisible();
  });
});
