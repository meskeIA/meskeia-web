import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * Inspector — calculadora-edad-mascotas (segmento interactiva, riesgo 2, 22 usos reales)
 *
 * Primera inspección: 07/10/2026, sobre el build de 19865f19.
 *
 * QUÉ PROMETE: <h1> «Calculadora de Edad de Mascotas» · «Descubre la edad de tu perro o gato en
 * años humanos». La metadata añade «según su tamaño y raza» y «Fórmula científica actualizada, más
 * precisa que la regla de los 7 años», y la nota bajo la tabla comparativa atribuye los valores al
 * «modelo científico de Dog Aging Project (Cell Systems, 2020)».
 *
 * DÓNDE VIVE EL CÁLCULO: inline en app/calculadora-edad-mascotas/page.tsx (sin motor aparte ni
 * módulo en data/). Lo que de verdad calcula, y lo que describe la FAQ VISIBLE («el primer año
 * equivale a 15», «el segundo año supone 9 años adicionales», «a partir del tercero divergen»):
 *
 *   perro:  edad ≤ 0 → 0 · edad ≤ 1 → 15 · edad ≤ 2 → 24 · si no → 24 + (edad − 2) × factor
 *           factor = 4 (pequeño <10 kg) · 5 (mediano 10-25) · 6 (grande 25-45) · 7 (gigante >45)
 *   gato:   igual, con factor 4
 *   entrada: parseFloat(texto.replace(',', '.')); se descarta en silencio si NaN, < 0 o > 30
 *   salida: formatNumber(edadHumana, 0) + « años humanos»
 *   etapa (perro, sin mirar el tamaño): <0,5 Cachorro · <2 Perro joven · <7 Adulto · <10 Maduro ·
 *          resto Senior. (gato): <0,5 Gatito · <2 Gato joven · <7 Adulto · <11 Maduro ·
 *          <15 Senior · resto Geriátrico
 *
 * Esa NO es la fórmula de Cell Systems 2020 (Wang et al., «Quantitative translation of
 * dog-to-human aging by conserved remodeling of the DNA methylation landscape»), que es
 * edad humana = 16 · ln(edad del perro) + 31, sin tamaño: 1 año → 31, 2 → 42,1, 5 → 56,75.
 * El FAQPage de metadata.ts sí cita esas cifras (31 y 42); el motor da 15 y 24.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (con la regla que la página describe)
 *   CASO 1 (normal) — perro mediano 5 años: 24 + 3 × 5 = 39 · etapa Adulto
 *                     gato 4 años: 24 + 2 × 4 = 32 · etapa Adulto
 *   CASO 2 (límite) — 1 año → 15 · 2 años → 24 · gigante 10 → 24 + 8 × 7 = 80 · 0 → 0 (Cachorro)
 *                     30 (máximo admitido), mediano → 24 + 28 × 5 = 164
 *                     «2,5» y «2.5» → 24 + 0,5 × 5 = 26,5 → Intl es-ES redondea a 27
 *   CASO 3 (rechazo) — vacío, −3, 60 y 30,5 no deben dar resultado
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()` — afirman lo que debería pasar y hoy
 * fallan a propósito. El día que se reparen se ponen en verde: quitar entonces la línea
 * `test.fail()` y quedan como regresión.
 */

const RUTA = '/calculadora-edad-mascotas/';
const SEL_EDAD = '[class*="inputConUnidad"] input';

const resultado = (page: Page) => page.locator('[class*="resultadoValor"]');
const etapa = (page: Page) => page.locator('[class*="etapaTitulo"]');
const comparacion = (page: Page) => page.locator('[class*="comparacionEdad"]');
const calcularBtn = (page: Page) => page.getByRole('button', { name: 'Calcular Edad Humana' });
const botonTamano = (page: Page, nombre: string) =>
  page.locator('[class*="tamanoGrid"] button', { hasText: nombre });

/** Aviso PROPIO de la app: excluye el anunciador de rutas de Next y lo que esté oculto. */
const avisoApp = (page: Page) =>
  page.locator(
    '[role="alert"]:visible:not(#__next-route-announcer__), [role="status"]:visible:not(#__next-route-announcer__)',
  );

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [SEL_EDAD]);
}

async function escribirEdad(page: Page, texto: string): Promise<void> {
  await page.locator(SEL_EDAD).fill(texto);
  await esperarValorEnReact(page, SEL_EDAD, texto);
}

async function calcularCon(
  page: Page,
  datos: { mascota: 'Perro' | 'Gato'; tamano?: string; edad: string },
): Promise<void> {
  await page.getByRole('button', { name: datos.mascota, exact: true }).click();
  if (datos.tamano) await botonTamano(page, datos.tamano).click();
  await escribirEdad(page, datos.edad);
  await calcularBtn(page).click();
}

/** Respuestas del FAQPage que sirve el layout (lo que leen buscadores y asistentes de IA). */
async function faqJsonLd(page: Page): Promise<Map<string, string>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const mapa = new Map<string, string>();
  for (const b of bloques) {
    const datos = JSON.parse(b) as {
      '@type'?: string;
      mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
    };
    if (datos['@type'] !== 'FAQPage') continue;
    for (const q of datos.mainEntity ?? []) mapa.set(q.name, q.acceptedAnswer.text);
  }
  return mapa;
}

const normaliza = (t: string): string => t.replace(/\s+/g, ' ').trim();

/** Primer número entero de «39 años humanos». */
const cifra = (t: string): string => (t.match(/\d+/) ?? [''])[0];

/** Contraste WCAG del texto de un elemento contra su fondo compuesto; los degradados, en su punto medio. */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const parse = (s: string): number[] | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p[3] ?? 1];
    };
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        const stops = [...cs.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map((x) => parse(x[0])!);
        if (stops.length) {
          const a = stops[0];
          const b = stops[stops.length - 1];
          capas.push(a.map((v, i) => (v + b[i]) / 2));
        }
      }
      const bg = parse(cs.backgroundColor);
      if (bg && bg[3] > 0) capas.push(bg);
      if (bg && bg[3] === 1) break;
    }
    let base = [255, 255, 255];
    for (const c of capas.reverse()) base = base.map((v, i) => c[i] * c[3] + v * (1 - c[3]));
    const fgA = parse(getComputedStyle(el).color)!;
    const fg = fgA.slice(0, 3).map((v, i) => v * fgA[3] + base[i] * (1 - fgA[3]));
    const lum = (rgb: number[]): number => {
      const c = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const [l1, l2] = [lum(fg), lum(base)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  });
}

test.describe('Calculadora de edad de mascotas — escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('CASO 1 (normal) — perro mediano de 5 años y gato de 4', async ({ page }) => {
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '5' });
    // 24 + (5 − 2) × 5 = 39
    await expect(resultado(page)).toHaveText('39 años humanos');
    await expect(etapa(page)).toContainText('Etapa: Adulto');
    await expect(comparacion(page)).toHaveText(['5 años', '39 años']);

    await calcularCon(page, { mascota: 'Gato', edad: '4' });
    // 24 + (4 − 2) × 4 = 32
    await expect(resultado(page)).toHaveText('32 años humanos');
    await expect(etapa(page)).toContainText('Etapa: Adulto');
  });

  test('CASO 2 (límite) — años 1 y 2, gigante de 10, cero, máximo admitido y decimales', async ({
    page,
  }) => {
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '1' });
    await expect(resultado(page)).toHaveText('15 años humanos'); // primer año = 15
    await escribirEdad(page, '2');
    await calcularBtn(page).click();
    await expect(resultado(page)).toHaveText('24 años humanos'); // 15 + 9

    await calcularCon(page, { mascota: 'Perro', tamano: 'Gigante', edad: '10' });
    await expect(resultado(page)).toHaveText('80 años humanos'); // 24 + 8 × 7
    await expect(etapa(page)).toContainText('Etapa: Senior');

    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '0' });
    await expect(resultado(page)).toHaveText('0 años humanos');
    await expect(etapa(page)).toContainText('Etapa: Cachorro');

    // 30 es el máximo que admite (edad > 30 se descarta): 24 + 28 × 5 = 164
    await escribirEdad(page, '30');
    await calcularBtn(page).click();
    await expect(resultado(page)).toHaveText('164 años humanos');

    // Coma y punto decimal dan lo mismo: 24 + 0,5 × 5 = 26,5 → es-ES redondea a 27
    await escribirEdad(page, '2,5');
    await calcularBtn(page).click();
    await expect(resultado(page)).toHaveText('27 años humanos');
    await escribirEdad(page, '2.5');
    await calcularBtn(page).click();
    await expect(resultado(page)).toHaveText('27 años humanos');
  });

  test('CASO 2 bis — teclear «2,5» pulsación a pulsación no reescribe el campo', async ({ page }) => {
    const campo = page.locator(SEL_EDAD);
    await campo.click();
    await campo.pressSequentially('2,5', { delay: 40 });
    await esperarValorEnReact(page, SEL_EDAD, '2,5');
    await expect(campo).toHaveValue('2,5');
    await calcularBtn(page).click();
    await expect(resultado(page)).toHaveText('27 años humanos');
  });

  test('CASO 3 (rechazo) — vacío, negativo, 60 y 30,5 no dan resultado', async ({ page }) => {
    for (const entrada of ['', '-3', '60', '30,5']) {
      await escribirEdad(page, entrada);
      await calcularBtn(page).click();
      await expect(resultado(page), `«${entrada}» no debería dar resultado`).toHaveCount(0);
    }
  });

  test('La tabla comparativa del bloque educativo concuerda con el motor', async ({ page }) => {
    // [columna, fila, valor a mano]: pequeño 7 → 24 + 5 × 4 = 44 · grande 15 → 24 + 13 × 6 = 102
    // · gigante 12 → 24 + 10 × 7 = 94 · gato 12 → 24 + 10 × 4 = 64
    const celdas: [string, number, string, string][] = [
      ['Pequeño', 1, '7', '44'],
      ['Grande', 3, '15', '102'],
      ['Gigante', 4, '12', '94'],
      ['Gato', 5, '12', '64'],
    ];
    for (const [col, idx, edad, esperado] of celdas) {
      const fila = page
        .locator('[class*="comparativaTable"] tbody tr')
        .filter({ has: page.locator('td:first-child', { hasText: new RegExp(`^${edad} años$`) }) });
      await expect(fila.locator('td').nth(idx)).toHaveText(`${esperado} años`);
      if (col === 'Gato') await calcularCon(page, { mascota: 'Gato', edad });
      else await calcularCon(page, { mascota: 'Perro', tamano: col, edad });
      await expect(resultado(page)).toHaveText(`${esperado} años humanos`);
    }
  });

  // ─────────────────────────── HALLAZGOS ABIERTOS (07/10/2026) ───────────────────────────

  test('HALLAZGO calculo — el primer y el segundo año son un escalón: 3 meses = 15 años humanos', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: edad ≤ 1 → 15 y edad ≤ 2 → 24 sin interpolar; por encima de 2 sí interpola');
    // Con los anclajes de la propia app (0 → 0, 1 → 15, 2 → 24) y la interpolación lineal que
    // ya aplica por encima de 2 años: 0,25 → 3,75 → «4»; 1,5 → 15 + 0,5 × 9 = 19,5 → «20».
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '0,25' });
    await expect(resultado(page)).toHaveText('4 años humanos', { timeout: 2000 });
    await escribirEdad(page, '1,5');
    await calcularBtn(page).click();
    await expect(resultado(page)).toHaveText('20 años humanos', { timeout: 2000 });
  });

  test('HALLAZGO contenido — atribuye a Cell Systems 2020 valores que no son de ese modelo', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: la nota cita Cell Systems 2020 (16·ln(edad)+31) y el motor da 15 al año');
    const citaCellSystems =
      (await page.locator('[class*="faqTip"]', { hasText: 'Cell Systems' }).count()) > 0;
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '1' });
    const valor = await resultado(page).innerText();
    // Wang et al. 2020: 16 · ln(1) + 31 = 31. O se cita y se usa, o no se cita.
    expect(
      !citaCellSystems || valor === '31 años humanos',
      `cita Cell Systems = ${citaCellSystems}; perro de 1 año = «${valor}»`,
    ).toBe(true);
  });

  test('HALLAZGO contenido — el FAQPage da 31 y 42 años al perro de 1 y 2 años; el motor, 15 y 24', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: faqJsonLd de metadata.ts cita las cifras de Cell Systems, no las del motor');
    const faq = await faqJsonLd(page);
    const respuesta = faq.get('¿Cuántos años humanos equivalen a 1 año de perro?') ?? '';
    expect(respuesta).not.toBe('');
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '1' });
    const n1 = cifra(await resultado(page).innerText());
    await escribirEdad(page, '2');
    await calcularBtn(page).click();
    const n2 = cifra(await resultado(page).innerText());
    expect(respuesta).toContain(`${n1} años humanos`);
    expect(respuesta).toMatch(new RegExp(`\\b${n2}\\b`));
  });

  test('HALLAZGO contenido — «¿Los gatos envejecen igual que los perros?» responde distinto en el FAQPage y en pantalla', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: FAQPage 12-18 años de vida; FAQ visible 15-20 interior y 10-12 exterior');
    const pregunta = '¿Los gatos envejecen igual que los perros?';
    const enJsonLd = (await faqJsonLd(page)).get(pregunta) ?? '';
    const visible =
      (await page
        .locator('[class*="faqItem"]', { has: page.locator('dt', { hasText: pregunta }) })
        .locator('dd')
        .textContent()) ?? '';
    expect(enJsonLd).not.toBe('');
    expect(normaliza(enJsonLd)).toBe(normaliza(visible));
  });

  test('HALLAZGO calculo — la etapa vital ignora el tamaño: un gigante de 8 años sale «Maduro»', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: la propia página dice que un gigante es senior desde 5-6 (FAQ) o 7 (FAQPage)');
    await calcularCon(page, { mascota: 'Perro', tamano: 'Gigante', edad: '8' });
    await expect(resultado(page)).toHaveText('66 años humanos'); // 24 + 6 × 7: el número está bien
    await expect(etapa(page)).toContainText('Senior', { timeout: 2000 });
  });

  test('HALLAZGO operativa — cambiar el tamaño o la edad no invalida el resultado mostrado', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: setTamanoPerro no limpia el resultado y la comparación lee el campo en vivo');
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '5' });
    await expect(resultado(page)).toHaveText('39 años humanos');
    await botonTamano(page, 'Gigante').click();
    await expect(botonTamano(page, 'Gigante')).toHaveAttribute('aria-pressed', 'true');
    // Con «Gigante» marcado, o se recalcula (24 + 3 × 7 = 45) o se retira: nunca 39.
    await expect(page.getByText('39 años humanos')).toHaveCount(0, { timeout: 2000 });
  });

  test('HALLAZGO operativa — una edad fuera de rango se descarta en silencio y deja el resultado anterior', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: calcular() hace return sin aviso ni setResultado(null)');
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '5' });
    await expect(resultado(page)).toHaveText('39 años humanos');
    await escribirEdad(page, '60');
    await calcularBtn(page).click();
    // Hoy queda «39 años humanos» y la comparación pasa a «60 años = 39 años».
    await expect(avisoApp(page)).not.toHaveCount(0, { timeout: 2000 });
    await expect(page.getByText('39 años humanos')).toHaveCount(0, { timeout: 2000 });
  });

  test('HALLAZGO calculo — el parser casero acepta «3 meses» como 3 años y «12abc» como 12', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: parseFloat(texto.replace(",", ".")) en vez de parseSpanishNumber');
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '3 meses' });
    // Hoy: «29 años humanos» (24 + 1 × 5) para un cachorro de tres meses.
    await expect(resultado(page)).toHaveCount(0, { timeout: 2000 });
    await escribirEdad(page, '12abc');
    await calcularBtn(page).click();
    await expect(resultado(page)).toHaveCount(0, { timeout: 2000 });
  });

  test('HALLAZGO accesibilidad — el campo de edad no tiene nombre accesible (su <label> no está asociada)', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: <label> sin htmlFor/id; el lector de pantalla lo anuncia como «5» (el placeholder)');
    await expect(page.getByLabel(/Edad de tu perro/)).toHaveCount(1, { timeout: 2000 });
  });

  test('HALLAZGO accesibilidad — el resultado no está en una región viva', async ({ page }) => {
    test.fail(true, 'ABIERTO: ni aria-live ni role="status" en el panel de resultados');
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '5' });
    await expect(resultado(page)).toHaveText('39 años humanos');
    const enRegionViva = await resultado(page).evaluate((el) =>
      Boolean(el.closest('[aria-live], [role="status"], [role="alert"]')),
    );
    expect(enRegionViva).toBe(true);
  });

  test('HALLAZGO accesibilidad — contraste del botón principal y del texto de marca', async ({ page }) => {
    test.fail(true, 'ABIERTO: blanco sobre degradado #2E86AB→#48A9A6 (3,38:1 en el centro) y #2E86AB sobre tinte (3,65:1)');
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '5' });
    // Texto de 16 px/600 y 17,6 px/600: no es «grande», exige 4,5:1.
    expect(await contraste(page, '[class*="btnPrimary"]')).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="mascotaBtn"][class*="active"]')).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="infoAdicional"] h4')).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO accesibilidad — en oscuro la cifra del resultado baja de 3:1', async ({ page }) => {
    test.fail(true, 'ABIERTO: #2E86AB fijo sobre el panel oscuro ≈ 2,9:1 (texto grande, exige 3:1)');
    await activarTema(page, 'dark');
    await esperarHidratacion(page, [SEL_EDAD]);
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '5' });
    await expect(resultado(page)).toHaveText('39 años humanos');
    expect(await contraste(page, '[class*="resultadoValor"]')).toBeGreaterThanOrEqual(3);
  });

  test('HALLAZGO contenido — los ejemplos del texto dan cifras que el motor no produce', async ({ page }) => {
    test.fail(true, 'ABIERTO: «Golden Retriever de 8 años = 64» y «Pastor Alemán de 8 = 64»; grande 8 → 60');
    await calcularCon(page, { mascota: 'Perro', tamano: 'Grande', edad: '8' });
    const n = cifra(await resultado(page).innerText()); // 24 + 6 × 6 = 60
    expect(n).toBe('60');
    const golden =
      (await page.locator('[class*="escenarioExample"]', { hasText: 'Golden Retriever' }).textContent()) ?? '';
    const pastor = (await page.locator('li', { hasText: 'Pastor' }).textContent()) ?? '';
    expect(normaliza(golden)).toContain(`${n} años humanos`);
    expect(normaliza(pastor)).toContain(`(${n} años equivalentes)`);
  });

  test('HALLAZGO contenido — la comparación repite el texto crudo: «1 años», «2.5 años»', async ({ page }) => {
    test.fail(true, 'ABIERTO: {edadMascota} años, sin singular ni formato es-ES');
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '1' });
    await expect(comparacion(page).first()).toHaveText('1 año', { timeout: 2000 });
    await escribirEdad(page, '2.5');
    await calcularBtn(page).click();
    await expect(comparacion(page).first()).toHaveText('2,5 años', { timeout: 2000 });
  });
});

test.describe('Calculadora de edad de mascotas — móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('CASO 1 en móvil — perro mediano de 5 años, sin desbordar en horizontal', async ({ page }) => {
    await calcularCon(page, { mascota: 'Perro', tamano: 'Mediano', edad: '5' });
    await expect(resultado(page)).toHaveText('39 años humanos');
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);
  });

  test('HALLAZGO operativa — en móvil el campo de edad abre el teclado alfabético', async ({ page }) => {
    test.fail(true, 'ABIERTO: type="text" sin inputMode="decimal"');
    await expect(page.locator(SEL_EDAD)).toHaveAttribute('inputmode', 'decimal', { timeout: 2000 });
  });
});
