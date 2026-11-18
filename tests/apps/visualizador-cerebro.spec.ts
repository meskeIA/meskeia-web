import { test, expect, devices, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — visualizador-cerebro (segmento interactiva · suites salud, cultura y estudiantes)
 *
 * Primera inspección: 18/11/2026. La app promete en su <h1> «Cómo Piensa tu Cerebro» y en el
 * subtítulo «Neuronas, memoria, neuroplasticidad e ilusiones»; la metadata, «86.000 millones de
 * neuronas, formación de recuerdos, neuroplasticidad y las ilusiones que te engañan». Cuatro
 * pestañas (La máquina, Recuerdos, Neuroplasticidad, Ilusiones) con datos escritos a mano en
 * page.tsx; no hay entradas ni motor de cálculo. Lo comprobable es: qué enseña cada control, si
 * las demos de ilusiones son lo que dicen ser y si las cifras cuadran entre sí.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (.inspector-trabajo/vc-esperados.mjs)
 *   CASO 1 (normal) — mapa de lóbulos: pulsar «Lóbulo temporal» muestra sus 4 funciones (Audición,
 *     Comprensión del lenguaje (Wernicke), Memoria a largo plazo, Reconocimiento facial) y el dato
 *     del hipocampo, con aria-pressed solo en él; pulsarlo otra vez lo cierra. Cifras: 2 % del peso
 *     con ~1,4 kg → cuerpo de 1,4 / 0,02 = 70 kg; 20 W = 20 % → 100 W ≈ 2.065 kcal/día: cuadran.
 *     El FAQPage deriva las sinapsis de «otras 10.000» por neurona: 86.000 millones × 10.000 =
 *     8,6 × 10^14 = 860 billones, no los 150 billones que da (ni 430 contando cada una dos veces).
 *   CASO 2 (límite: el estado revelado de las ilusiones) — Müller-Lyer: las dos barras miden 200 px
 *     en el CSS → iguales. Tablero de Adelson: la respuesta dice «Son exactamente del mismo color»,
 *     así que A y B deben verse IGUALES antes de revelar y revelar no debe repintarlas. Del código:
 *     A (fila 1, col 1) es casilla clara fuera de la sombra = #c8c8c8 (200); B (fila 2, col 2),
 *     clara en sombra = #969696 (150); al revelar las dos pasan a #787878 (120).
 *   CASO 3 (operativa; la app no tiene entrada que rechazar) — teclado: Espacio y Enter abren el
 *     lóbulo enfocado y Tab pasa al siguiente; Pixel 7: las cuatro pestañas y las cinco ilusiones
 *     reveladas sin desborde horizontal, y el lóbulo responde al dedo.
 *
 * FUENTES: ninguna de las cifras de la app (neuronas, sinapsis, 35.000 decisiones, Ebbinghaus,
 * 2,5 PB…) está en la red de fuentes oficiales de la tarea; se juzgan por su coherencia interna y
 * por si dicen fuente y año (neutralidad editorial, regla 1 del CLAUDE.md).
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS (18/11/2026): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y «ABIERTO» pasa a «REPARADO».
 */

test.use({ locale: 'es-ES', reducedMotion: 'reduce' });

const RUTA = '/visualizador-cerebro/';
const LOBULOS = ['frontal', 'parietal', 'temporal', 'occipital'] as const;

const botonLobulo = (page: Page, n: string) => page.getByRole('button', { name: `Lóbulo ${n}: toca para ver funciones` });
// Con «$=»: «*=» casaría también con «_lobuloDetalleTitulo», «_cerebroMapaTitulo» y «_faseDetalleTexto».
const detalle = (page: Page) => page.locator('[class$="_lobuloDetalle"]');
const faseDetalle = (page: Page) => page.locator('[class$="_faseDetalle"]');
const revelar = (page: Page) => page.getByRole('button', { name: 'Revelar', exact: true });
const pestanasIlusion = (page: Page) => page.locator('[class*="_ilusionesTabs"] button');
const celda = (page: Page, letra: 'A' | 'B') => page.locator('[class*="_checkerCell"]').filter({ hasText: new RegExp(`^${letra}$`) });

async function seccion(page: Page, nombre: string): Promise<void> {
  const boton = page.getByRole('navigation', { name: 'Secciones del explicador' }).getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function ilusion(page: Page, n: number): Promise<void> {
  const tab = pestanasIlusion(page).nth(n - 1);
  await tab.click();
  await expect(tab).toHaveAttribute('aria-pressed', 'true');
}

// ── Contraste WCAG 2.x ────────────────────────────────────────────────────
const rgb = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
const sobre = (c: number[], fondo: number[]): number[] => {
  const a = c.length > 3 ? c[3] : 1;
  return [0, 1, 2].map((i) => a * c[i] + (1 - a) * fondo[i]);
};
function contraste(a: number[], b: number[]): number {
  const lin = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum = (c: number[]): number => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
const estilo = (page: Page, sel: Locator, prop: 'color' | 'backgroundColor'): Promise<string> =>
  sel.evaluate((e, p) => getComputedStyle(e)[p], prop);

/** El color ya asentado: el botón lleva `transition: all 0.2s` y leerlo nada más pulsar da el de antes. */
async function estiloAsentado(page: Page, sel: Locator, prop: 'color' | 'backgroundColor'): Promise<string> {
  let previo = '';
  await expect
    .poll(async () => {
      const ahora = await estilo(page, sel, prop);
      const quieto = ahora === previo;
      previo = ahora;
      return quieto;
    }, { intervals: [100, 100, 200, 300] })
    .toBe(true);
  return previo;
}

/** Color pintado (píxel de la captura) en un punto de cada caja, relativo al elemento capturado. */
async function pixeles(page: Page, ancla: Locator, cajas: Locator[]): Promise<number[][]> {
  const base = await ancla.boundingBox();
  if (!base) throw new Error('El ancla no tiene caja');
  const puntos: number[][] = [];
  for (const c of cajas) {
    const b = await c.boundingBox();
    if (!b) throw new Error('Una casilla no tiene caja');
    // Esquina inferior izquierda, a 8 px de los bordes: lejos de la letra y del contorno
    puntos.push([b.x - base.x + 8, b.y - base.y + b.height - 8]);
  }
  const png = (await ancla.screenshot()).toString('base64');
  const lector = await page.context().newPage();
  try {
    await lector.goto('about:blank');
    return await lector.evaluate(
      async ({ png, puntos, ancho }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${png}`;
        await img.decode();
        const lienzo = document.createElement('canvas');
        lienzo.width = img.width;
        lienzo.height = img.height;
        const g = lienzo.getContext('2d')!;
        g.drawImage(img, 0, 0);
        const escala = img.width / ancho;
        return puntos.map(([x, y]) => Array.from(g.getImageData(Math.round(x * escala), Math.round(y * escala), 1, 1).data).slice(0, 3));
      },
      { png, puntos, ancho: base.width },
    );
  } finally {
    await lector.close();
  }
}

interface NodoJsonLd {
  '@type'?: string;
  featureList?: string[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function respuestaFaqPage(page: Page, pregunta: RegExp): Promise<string> {
  for (const b of await page.locator('script[type="application/ld+json"]').allTextContents()) {
    const d = JSON.parse(b) as NodoJsonLd & { '@graph'?: NodoJsonLd[] };
    for (const n of d['@graph'] ?? [d]) {
      if (n['@type'] !== 'FAQPage') continue;
      const q = (n.mainEntity ?? []).find((e) => pregunta.test(e.name));
      if (q) return q.acceptedAnswer.text;
    }
  }
  throw new Error(`El FAQPage no tiene la pregunta ${pregunta}`);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  // Ningún input que sirva de testigo de hidratación: se espera a la página entera.
  await esperarPaginaAsentada(page);
});

test.describe('CASO 1 — La máquina: mapa de lóbulos y cifras', () => {
  test('pulsar «Lóbulo temporal» muestra sus 4 funciones y el hipocampo; pulsarlo otra vez lo cierra', async ({ page }) => {
    const temporal = botonLobulo(page, 'temporal');
    await temporal.click();
    await expect(temporal).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[class*="_cerebroSilueta"] button[aria-pressed="true"]')).toHaveCount(1);
    await expect(detalle(page).locator('h4')).toHaveText('Lóbulo temporal');
    await expect(detalle(page).locator('li')).toHaveText([
      'Audición',
      'Comprensión del lenguaje (Wernicke)',
      'Memoria a largo plazo',
      'Reconocimiento facial',
    ]);
    await expect(detalle(page).locator('p')).toHaveText('Contiene el hipocampo, esencial para formar nuevos recuerdos.');
    await temporal.click();
    await expect(temporal).toHaveAttribute('aria-pressed', 'false');
    await expect(detalle(page)).toHaveCount(0);
  });

  test('Broca en el frontal y Wernicke en el temporal; cambiar de lóbulo cambia el detalle', async ({ page }) => {
    await botonLobulo(page, 'frontal').click();
    await expect(detalle(page).locator('li')).toContainText(['Habla (área de Broca)']);
    await botonLobulo(page, 'occipital').click();
    await expect(botonLobulo(page, 'frontal')).toHaveAttribute('aria-pressed', 'false');
    await expect(detalle(page).locator('h4')).toHaveText('Lóbulo occipital');
    await expect(detalle(page).locator('li').first()).toHaveText('Visión');
  });

  test('cifras clave: 86.000 millones de neuronas, 150 billones de sinapsis; 2 % y ~1,4 kg cuadran (70 kg)', async ({ page }) => {
    const tarjetas = page.locator('[class*="_cifraCard"]');
    await expect(tarjetas).toHaveCount(4);
    await expect(tarjetas.nth(0)).toContainText('86.000');
    await expect(tarjetas.nth(0)).toContainText('millones');
    await expect(tarjetas.nth(1)).toContainText('150');
    await expect(tarjetas.nth(1)).toContainText('billones');
    await expect(tarjetas.nth(2)).toContainText('~1,4 kg');
    // 1,4 kg / 0,02 = 70 kg de peso corporal implícito; 20 W / 0,20 = 100 W ≈ 2.065 kcal/día
    expect(1.4 / 0.02).toBeCloseTo(70, 6);
    await expect(page.locator('[class*="_comparacionItem"]').nth(1)).toContainText('20 vatios');
  });
});

test.describe('CASO 2 — Ilusiones: lo que cada demo dice que muestra', () => {
  test.beforeEach(async ({ page }) => {
    await seccion(page, 'Ilusiones');
  });

  test('Müller-Lyer: las dos barras miden lo mismo (200 px) y al revelar las dos dicen «100%»', async ({ page }) => {
    const barras = page.locator('[class*="_mullerBarra"]');
    await expect(barras).toHaveCount(2);
    const [a, b] = await Promise.all([barras.nth(0).boundingBox(), barras.nth(1).boundingBox()]);
    expect(a?.width).toBe(200);
    expect(b?.width).toBe(200);
    await revelar(page).click();
    await expect(page.locator('[class*="_mullerMedida"]')).toHaveText(['100%', '100%']);
  });

  test('tablero de Adelson: la respuesta afirma «Son exactamente del mismo color» (premisa del caso siguiente)', async ({ page }) => {
    await ilusion(page, 2);
    await expect(celda(page, 'A')).toHaveCount(1);
    await expect(celda(page, 'B')).toHaveCount(1);
    await expect(page.locator('[class*="_ilusionPregunta"]')).toHaveText('¿Qué cuadrado es más oscuro, A o B?');
    await revelar(page).click();
    await expect(page.locator('[class*="_ilusionRespuesta"]')).toContainText('Son exactamente del mismo color');
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · tablero de Adelson: A se pinta a 200 y B a 150, y «Revelar» repinta las dos a 120', async ({ page }) => {
    // ABIERTO: la demo no reproduce la ilusión, la contradice. A (fila 1, col 1) es casilla CLARA
    // fuera de la sombra (#c8c8c8) y B (fila 2, col 2) casilla clara en sombra (#969696): B es de
    // verdad más oscura y quien lo dice acierta, pero la app le contesta que son iguales. «Revelar»
    // no muestra que lo eran: las repinta a #787878. En la ilusión de Adelson, A es casilla OSCURA a
    // la luz y B clara en sombra, con el mismo gris. Además A y B llevan z-index: 1 (checkerHighlight)
    // y la capa de sombra no pasa por encima de B. Pasa a verde cuando A y B salen con el mismo
    // píxel antes de revelar y revelar no lo cambia.
    test.fail();
    await ilusion(page, 2);
    const tablero = page.locator('[class*="_checkerBoard"]');
    const [a, b] = await pixeles(page, tablero, [celda(page, 'A'), celda(page, 'B')]);
    expect(a, 'A y B, mismo gris antes de revelar').toEqual(b);
    await revelar(page).click();
    await expect(page.locator('[class*="_ilusionRespuesta"]')).toBeVisible();
    const [a2] = await pixeles(page, tablero, [celda(page, 'A')]);
    expect(a2, 'revelar no repinta A').toEqual(a);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · «Ceguera al cambio» se ilustra con el gorila de Simons y Chabris, que es otra cosa', async ({ page }) => {
    // ABIERTO: la respuesta define la ceguera al cambio como no ver un cambio que ocurre «durante
    // una interrupción (parpadeo, movimiento de cámara)»; la explicación pone de ejemplo el gorila
    // que cruza la escena mientras se atiende a otra tarea, sin interrupción ni cambio: el estudio
    // que cita (Simons y Chabris, 1999, «Gorillas in our midst: sustained inattentional blindness
    // for dynamic events») trata de la ceguera por falta de atención. Y la demo anuncia el cambio
    // («¿Puedes ver qué cambiará cuando pulses "Revelar"?») y lo hace sin interrupción: no se puede
    // dejar de verlo.
    test.fail();
    await ilusion(page, 5);
    await revelar(page).click();
    const titulo = (await page.locator('[class*="_ilusionTitulo"]').textContent()) ?? '';
    const explicacion = (await page.locator('[class*="_explicacionTexto"]').textContent()) ?? '';
    expect(titulo).toBe('Ceguera al cambio');
    expect(/gorila/i.test(explicacion), `la explicación de «${titulo}» es: ${explicacion}`).toBe(false);
  });

  test('las cinco ilusiones abren su respuesta y «Revelar» alterna con «Ocultar respuesta»', async ({ page }) => {
    const titulos = ['Ilusión de Müller-Lyer', 'Sombra del tablero de ajedrez', 'Efecto McGurk', 'Miembro fantasma', 'Ceguera al cambio'];
    for (const [i, t] of titulos.entries()) {
      await ilusion(page, i + 1);
      await expect(page.locator('[class*="_ilusionTitulo"]')).toHaveText(t);
      await expect(page.locator('[class*="_ilusionRespuesta"]')).toHaveCount(0);
      await revelar(page).click();
      await expect(page.locator('[class*="_ilusionRespuesta"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Ocultar respuesta' })).toBeVisible();
      if (t === 'Efecto McGurk') await expect(page.locator('[class*="_mcgurkValor"]').last()).toHaveText('"da" (¡inventado!)');
    }
  });
});

test.describe('CASO 3 — Operativa con teclado', () => {
  test('Espacio abre el lóbulo enfocado, Tab pasa al siguiente y Enter lo abre', async ({ page }) => {
    await botonLobulo(page, 'frontal').focus();
    await page.keyboard.press('Space');
    await expect(detalle(page).locator('h4')).toHaveText('Lóbulo frontal');
    await page.keyboard.press('Tab');
    await expect(botonLobulo(page, 'parietal')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(detalle(page).locator('h4')).toHaveText('Lóbulo parietal');
    await expect(botonLobulo(page, 'frontal')).toHaveAttribute('aria-pressed', 'false');
  });

  test('Recuerdos: las tres fases se eligen con Enter y cambian el detalle', async ({ page }) => {
    await seccion(page, 'Recuerdos');
    for (const fase of ['Almacenamiento', 'Recuperación', 'Codificación']) {
      const b = page.getByRole('button', { name: fase });
      await b.focus();
      await page.keyboard.press('Enter');
      await expect(b).toHaveAttribute('aria-pressed', 'true');
      await expect(faseDetalle(page).locator('h3')).toHaveText(fase);
    }
  });
});

test.describe('Hallazgos de contenido (18/11/2026)', () => {
  test('HALLAZGO (18/11/2026, ABIERTO) · FAQPage: «86.000 millones» × «otras 10.000» no da «unos 150 billones» de sinapsis', async ({ page }) => {
    // ABIERTO: 86.000 millones × 10.000 = 8,6 × 10^14 = 860 billones (430 aunque cada sinapsis se
    // contara dos veces); el «lo que genera unos 150 billones» no sale de sus propios números. La
    // misma respuesta dice «el neurocientífico Suzana Herculano-Houzel» (la neurocientífica).
    test.fail();
    const faq = await respuestaFaqPage(page, /¿Cuántas neuronas tiene el cerebro humano/);
    const m = faq.match(/otras ([\d.]+), lo que genera unos ([\d.]+) billones/);
    if (m) {
      const derivadas = 86000e6 * Number(m[1].replace(/\./g, ''));
      const declaradas = Number(m[2].replace(/\./g, '')) * 1e12;
      expect(Math.abs(derivadas - declaradas) / declaradas, `${derivadas / 1e12} billones frente a ${m[2]}`).toBeLessThan(0.2);
    }
    expect(faq).not.toContain('el neurocientífico Suzana');
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · cifras populares sin fuente ni año (35.000 decisiones, 70 % en 24 h, 2,5 PB…)', async ({ page }) => {
    // ABIERTO: §1.quinquies, regla 1 («atribuye fuente y año»). La nota de la guía dice que «los
    // datos presentados reflejan el consenso científico actual», pero ninguna de estas frases dice
    // de dónde sale su cifra. Pasa a verde cuando cada una desaparece o lleva su año.
    test.fail();
    const textos: string[] = [];
    await botonLobulo(page, 'frontal').click();
    textos.push(await page.locator('[class*="_seccionContent"]').innerText());
    for (const s of ['Recuerdos', 'Neuroplasticidad', 'Ilusiones']) {
      await seccion(page, s);
      textos.push(await page.locator('[class*="_seccionContent"]').innerText());
    }
    await ilusion(page, 4);
    await revelar(page).click();
    textos.push(await page.locator('[class*="_ilusionCard"]').innerText());
    // Párrafo a párrafo: el textContent de la guía pega el <h3> anterior a la frase sin espacio
    textos.push(...(await page.locator('[data-guia-educativa] p').allTextContents()));
    const frases = textos.join('\n').split(/[.!?]\s+|\n+/);
    const cifras = [/35\.000 decisiones/, /el 99\s?% del tiempo/, /olvidas el 70\s?%/, /2,5 petabytes/, /hacia los 25 años/, /[Hh]asta el 80\s?%/, /hasta un 15\s?%/];
    const sinFuente = cifras
      .map((c) => frases.find((f) => c.test(f)))
      .filter((f): f is string => f !== undefined && !/\b(1[89]|20)\d{2}\b/.test(f));
    expect(sinFuente).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · formato: el «%» va pegado a la cifra («2%», «20%», «99%»)', async ({ page }) => {
    // ABIERTO: CLAUDE.md global §2 (decidido el 25/09/2026): «15 %» con espacio duro. También
    // «70%», «15%», «80%», «50%» y las medidas «100%» del Müller-Lyer.
    test.fail();
    const visibles = [await page.locator('[class*="_seccionContent"]').innerText()];
    await seccion(page, 'Ilusiones');
    visibles.push(await page.locator('[class*="_seccionContent"]').innerText());
    expect(visibles.join('\n').match(/.{0,12}\d%.{0,8}/g) ?? []).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · suite salud con «@disclaimer: exempt»: su única nota va en la guía plegada', async ({ page }) => {
    // ABIERTO: suites ['salud', 'cultura', 'estudiantes']; la regla multi-suite de la política de
    // disclaimers aplica el nivel de salud (1 o 2, no plegable). La nota «este explicador simplifica
    // conceptos de neurociencia…» está dentro de <EducationalSection>, que nace colapsada.
    test.fail();
    await expect(page.getByText('este explicador simplifica conceptos')).toBeHidden();
    const aviso = page.locator('[role="note"]');
    const hayAviso = (await aviso.count()) > 0 && (await aviso.first().isVisible());
    expect(hayAviso || (await page.getByText('este explicador simplifica conceptos').isVisible())).toBe(true);
  });
});

test.describe('Hallazgos de accesibilidad (18/11/2026)', () => {
  test('HALLAZGO (18/11/2026, ABIERTO) · los nombres del mapa de lóbulos: blanco sobre su tinte, de 1,31:1 a 1,42:1 (pulsados, de 2,87 a 3,82)', async ({ page }) => {
    // ABIERTO: el botón sin pulsar lleva de fondo `${color}44` (27 % de opacidad) sobre la tarjeta
    // blanca y el nombre en blanco de 11,2 px: frontal 1,42, parietal 1,33, temporal 1,31,
    // occipital 1,42. Pulsado, el color pleno: frontal 3,82, parietal 3,15, temporal 2,87 (solo el
    // occipital, 4,67, llega a 4,5:1). El text-shadow no cuenta para WCAG.
    test.fail();
    const fondoMapa = rgb(await estilo(page, page.locator('[class$="_cerebroMapa"]'), 'backgroundColor'));
    const fallos: string[] = [];
    for (const n of LOBULOS) {
      const b = botonLobulo(page, n);
      const nombre = b.locator('span');
      for (const estado of ['sin pulsar', 'pulsado'] as const) {
        if (estado === 'pulsado') {
          await b.click();
          await expect(b).toHaveAttribute('aria-pressed', 'true');
        }
        const fondo = sobre(rgb(await estiloAsentado(page, b, 'backgroundColor')), fondoMapa);
        const r = contraste(rgb(await estilo(page, nombre, 'color')), fondo);
        if (r < 4.5) fallos.push(`${n} ${estado}: ${r.toFixed(2)}:1`);
      }
      await b.click();
    }
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · títulos y fases pintados con el color de su dato, por debajo de 4,5:1', async ({ page }) => {
    // ABIERTO: el título del lóbulo (16 px negrita) va en el color del lóbulo: frontal 3,82, parietal
    // 3,15, temporal 2,87 sobre blanco; en oscuro, frontal 3,76 y occipital 3,07 sobre #2A2A2A. La
    // fase activa pone blanco sobre su color (13,1 px negrita): Codificación 3,82, Almacenamiento
    // 4,11, Recuperación 2,80, y su <h3> (16,8 px negrita) los mismos valores sobre blanco.
    // check:contraste-marca no lo ve: el hexadecimal va en el array de datos, no en el style={{…}}.
    test.fail();
    const fallos: string[] = [];
    for (const n of LOBULOS) {
      await botonLobulo(page, n).click();
      const h4 = detalle(page).locator('h4');
      const r = contraste(rgb(await estilo(page, h4, 'color')), rgb(await estilo(page, detalle(page), 'backgroundColor')));
      if (r < 4.5) fallos.push(`título ${n}: ${r.toFixed(2)}:1`);
    }
    await seccion(page, 'Recuerdos');
    for (const fase of ['Codificación', 'Almacenamiento', 'Recuperación']) {
      const b = page.getByRole('button', { name: fase });
      await b.click();
      await expect(b).toHaveAttribute('aria-pressed', 'true');
      const rb = contraste(rgb(await estiloAsentado(page, b, 'color')), rgb(await estiloAsentado(page, b, 'backgroundColor')));
      if (rb < 4.5) fallos.push(`fase ${fase}: ${rb.toFixed(2)}:1`);
      const h3 = faseDetalle(page).locator('h3');
      const rh = contraste(rgb(await estilo(page, h3, 'color')), rgb(await estilo(page, faseDetalle(page), 'backgroundColor')));
      if (rh < 4.5) fallos.push(`h3 ${fase}: ${rh.toFixed(2)}:1`);
    }
    expect(fallos).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · las pestañas de ilusiones se llaman «1»…«5» y el Müller-Lyer se lee «<» «>»', async ({ page }) => {
    // ABIERTO: el lector anuncia «1, botón, presionado» sin decir qué ilusión es, y los extremos de
    // las líneas son caracteres sin aria-hidden.
    test.fail();
    await seccion(page, 'Ilusiones');
    await expect(pestanasIlusion(page).first()).toHaveAccessibleName(/Müller-Lyer/, { timeout: 1000 });
    const arbol = await page.locator('[class*="_demoArea"]').ariaSnapshot();
    expect(arbol).not.toMatch(/[<>]/);
  });
});

test.describe('Móvil (Pixel 7)', () => {
  const pixel = devices['Pixel 7'];
  test.use({
    viewport: pixel.viewport,
    userAgent: pixel.userAgent,
    deviceScaleFactor: pixel.deviceScaleFactor,
    isMobile: pixel.isMobile,
    hasTouch: pixel.hasTouch,
  });

  test('con el dedo: el lóbulo responde y ninguna pestaña ni ilusión revelada desborda en horizontal', async ({ page }) => {
    const desborde = () =>
      page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const temporal = botonLobulo(page, 'temporal');
    await temporal.tap();
    await expect(temporal).toHaveAttribute('aria-pressed', 'true');
    await expect(detalle(page).locator('h4')).toHaveText('Lóbulo temporal');
    expect(await desborde(), 'La máquina').toBeLessThanOrEqual(0);
    for (const s of ['Recuerdos', 'Neuroplasticidad', 'Ilusiones']) {
      const b = page.getByRole('navigation', { name: 'Secciones del explicador' }).getByRole('button', { name: s });
      await b.tap();
      await expect(b).toHaveAttribute('aria-pressed', 'true');
      expect(await desborde(), s).toBeLessThanOrEqual(0);
    }
    for (let i = 0; i < 5; i++) {
      const tab = pestanasIlusion(page).nth(i);
      await tab.tap();
      await expect(tab).toHaveAttribute('aria-pressed', 'true');
      await revelar(page).tap();
      await expect(page.locator('[class*="_ilusionRespuesta"]')).toBeVisible();
      expect(await desborde(), `ilusión ${i + 1} revelada`).toBeLessThanOrEqual(0);
    }
  });
});
