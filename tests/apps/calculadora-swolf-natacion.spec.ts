import { test, expect, Page } from '@playwright/test';
import { calcularSWOLF } from '../../lib/calculadoras/deporte';
import { esperarHidratacion } from './_hidratacion';

/**
 * Inspector — calculadora-swolf-natacion (segmento MOTOR de cálculo, riesgo 2)
 *
 * Primera inspección: 31/08/2026 (hallazgos 564 y 565, reparados el mismo día en b833b716).
 * Re-inspección: 31/08/2026 — misma tarde, tras la reparación. Los 2 hallazgos anteriores
 * (FAQPage desalineado y calcularSWOLF sin validar) se comprobaron desde cero y siguen
 * reparados. Se añadió el CASO 2b para ejercitar metros_largo=50 desde el navegador.
 *
 * Re-inspección: 02/10/2026 — invalidada por 18411e51 (30/09/2026), que tocó
 * lib/calculadoras/deporte.ts para reparar calculadora-potencia-ciclismo. Ese commit solo
 * cambia calcularPotenciaCiclismo, calcularVatiosPorFuerzas y añade constantes de rango:
 * calcularSWOLF queda byte a byte igual que tras b833b716 (`git diff b833b716 HEAD` no toca
 * ninguna línea de la sección 6), y los casos de cálculo de abajo dan lo resuelto a mano.
 * También le llegaron tres lotes de CSS: b7733c6d (cabeceras de tabla con --primary-boton)
 * y 586a4d61 + a1d72a9c (padding-top de 80 px en el hero hasta 1023 px para que la barra
 * fija del logo no tape el h1). Medido a 360, 800 y 1024 px, en claro y en oscuro: el logo
 * no toca el h1 (a 800 px queda a 2 px: barra hasta y=77, h1 desde y=79) y la cabecera de la
 * tabla da 5,47:1 en los dos temas. Ver los bloques «LOTES DE CSS».
 *
 * Esa vuelta abrió 8 hallazgos (bloques «ABIERTO — 02/10/2026», con `test.fail()`, que
 * afirman lo CORRECTO): el tecleo real reescribe los campos y concatena lo que se teclea
 * detrás del valor anterior; la escala de 50 m suma 8 puntos donde la propia guía de la app
 * implica más del doble; los rangos que declaran los campos no se hacen cumplir; contraste
 * de textos de marca y de blanco sobre --primary; el emoji del h1; y dos de contenido.
 *
 * QUÉ PROMETE
 *   <h1>: «🏊 Calculadora SWOLF»
 *   subtítulo: «Mide tu eficiencia en el agua combinando tiempo y brazadas por largo»
 *   metadata: «Calcula tu índice SWOLF para medir la eficiencia en el agua. Combina tiempo y
 *              brazadas por largo para mejorar tu técnica de natación. Compatible con piscinas
 *              de 25m y 50m.»
 *   bloque educativo: «SWOLF = tiempo (s) + brazadas» — cuanto más bajo, mejor.
 *
 * DÓNDE VIVE EL CÁLCULO — lib/calculadoras/deporte.ts → calcularSWOLF(tiempo_s_largo,
 * brazadas_largo, metros_largo = 25)
 *   · swolf = tiempo_s_largo + brazadas_largo                     (suma directa, sin redondeos)
 *   · ajuste = +8 en piscina de 50 m; cortes SIN ajustar: élite ≤ 25 · avanzado ≤ 30 ·
 *     intermedio ≤ 38 · el resto, principiante                     (bordes INCLUSIVOS)
 *   · velocidadMedia_m_s = metros_largo / tiempo_s_largo
 *   · velocidadMedia_min100m: 100 / velocidadMedia_m_s, formateada m:ss. Con tiempo entero
 *     es 4·t (25 m) o 2·t (50 m) segundos exactos, así que el «1:60» del redondeo no se alcanza.
 *   · Valida tiempo y brazadas > 0 (lanza Error): hallazgo 565, REPARADO el 31/08/2026.
 *
 * DÓNDE SE LEEN LOS CAMPOS — page.tsx: estado NUMÉRICO + `parseInt(val, 10)` y solo se
 * guarda si `n > 0`. Lo demás (el '' que entrega el navegador con «-», «22.», campo vacío…)
 * se ignora, y como el input es controlado React le vuelve a escribir el último valor válido
 * con el cursor al final: lo siguiente que se teclea se CONCATENA. Ver hallazgo A.
 *
 * NO hay botón «Calcular»: el resultado es reactivo (useMemo) sobre cada input.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 25 m · 22 s · 16 brazadas (ejemplo del bloque educativo: «Si tardas 22
 *     segundos y das 16 brazadas, tu SWOLF es 38»)
 *       swolf = 22 + 16 = 38 → 38 ≤ 38 → «Intermedio» (borde inclusivo)
 *       segundosPor100m = 100 / (25/22) = 88 → «1:28 min/100m»
 *
 *   CASO 1b (normal, 02/10/2026) — 25 m · 30 s · 20 brazadas (ejemplo del FAQPage: «completar
 *     un largo de 25 m en 30 segundos con 20 brazadas da un SWOLF de 50»)
 *       swolf = 30 + 20 = 50 → 50 > 38 → «Principiante» · «Básica»
 *       segundosPor100m = 4 · 30 = 120 → «2:00 min/100m»
 *
 *   CASO 2 (límite superior declarado) — 25 m · 300 s · 100 brazadas (max={300} y max={100}
 *     de los propios <input>; 02/10/2026: antes este caso usaba 500 s y afirmaba que NO había
 *     aviso, lo que fijaba como correcto el hallazgo C. Ahora usa el máximo que los campos
 *     admiten y los 500 s pasan al bloque del hallazgo C)
 *       swolf = 300 + 100 = 400 → «Principiante» · «Básica»
 *       segundosPor100m = 4 · 300 = 1200 → «20:00 min/100m»
 *
 *   CASO 2b (límite) — 50 m · 5 s · 1 brazada (los mínimos declarados)
 *       swolf = 6 → con el corte de élite de 50 m (≤ 33) → «Élite»
 *       segundosPor100m = 2 · 5 = 10 → «0:10 min/100m»
 *
 *   CASO 3 (rechazo) — brazadas «0» y tiempo «-15» con fill(): nunca se calcula con ellos
 *     (con 30 s, «0» brazadas daría 30 y «-15» s daría 5). Letras: el input type=number las
 *     descarta antes de que React las vea.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS — REPARADOS el 31/08/2026
 *
 *   564 [dato/alto] El FAQPage de metadata.ts daba para 25 m unos cortes (élite < 35 …
 *     principiante > 60) que NO eran los de la calculadora: un SWOLF de 40 era «avanzado»
 *     según el FAQ y «Principiante» según la herramienta. Reparado alineando el FAQ.
 *
 *   565 [calculo/bajo] calcularSWOLF() no validaba sus argumentos. Reparado: lanza Error con
 *     tiempo/brazadas ≤ 0 (describe al final, sin navegador).
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/calculadora-swolf-natacion/';

// OJO: [class*="swolfScore"] también casaría con el contenedor "swolfScoreWrapper" (que
// engloba etiqueta + puntuación + badge de nivel), así que se ancla con $= al sufijo exacto
// que generan CSS Modules ("<hash>__swolfScore"), que "…Wrapper" no cumple.
const swolfScore = (page: Page) => page.locator('[class$="__swolfScore"]').first();
const nivelBadge = (page: Page) => page.locator('[class*="nivelBadge"]').first();
/** 0 = Eficiencia · 1 = Velocidad media (min/100m) · 2 = Descripción del nivel. */
const detalle = (page: Page, i: number) => page.locator('[class*="detalleValor"]').nth(i);
const consejoTexto = (page: Page) => page.locator('[class*="consejoTexto"]').first();
const tiempoInput = (page: Page) => page.locator('#tiempo-input');
const brazadasInput = (page: Page) => page.locator('#brazadas-input');

async function elegirPiscina(page: Page, metros: 25 | 50): Promise<void> {
  await page.getByRole('button', { name: `${metros} m`, exact: true }).click();
}

async function rellenar(
  page: Page,
  datos: { tiempo?: string; brazadas?: string },
): Promise<void> {
  if (datos.tiempo !== undefined) await tiempoInput(page).fill(datos.tiempo);
  if (datos.brazadas !== undefined) await brazadasInput(page).fill(datos.brazadas);
}

/** Abre la guía colapsable (EducationalSection nace cerrada). */
async function abrirGuia(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  await expect(page.locator('[class*="comparativaTable"]')).toBeVisible();
}

/** Pasa a modo oscuro con el botón real del logo y comprueba que el fondo CAMBIÓ de verdad. */
async function ponerOscuro(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // Un data-theme sembrado sin efecto daría verde en falso: se exige el fondo oscuro pintado.
  await expect
    .poll(() =>
      page.evaluate(() => getComputedStyle(document.querySelector('[class*="resultadoPanel"]')!).backgroundColor),
    )
    .toBe('rgb(45, 45, 45)');
}

/**
 * Contraste WCAG del primer elemento que casa con `selector`, contra su fondo efectivo (el
 * primer antepasado con fondo opaco, componiendo los semitransparentes por el camino).
 */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const parse = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c: { r: number; g: number; b: number }) =>
      0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    const el = document.querySelector(sel);
    if (!el) throw new Error(`No existe ${sel}`);
    const capas: { r: number; g: number; b: number; a: number }[] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) {
        capas.push(c);
        if (c.a >= 1) break;
      }
    }
    let fondo = { r: 255, g: 255, b: 255 };
    for (let i = capas.length - 1; i >= 0; i--) {
      const c = capas[i];
      fondo = {
        r: c.r * c.a + fondo.r * (1 - c.a),
        g: c.g * c.a + fondo.g * (1 - c.a),
        b: c.b * c.a + fondo.b * (1 - c.a),
      };
    }
    const texto = parse(getComputedStyle(el).color)!;
    const l1 = lum(texto);
    const l2 = lum(fondo);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, selector);
}

/** Cuántas cajas de la barra fija del logo se cruzan con las líneas de texto del h1. */
async function solapesLogoTitulo(page: Page): Promise<number> {
  return page.evaluate(() => {
    const h1 = document.querySelector('h1')!;
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    const lineas = Array.from(rango.getClientRects());
    const barra = document.querySelector('[class*="headerBar"]');
    if (!barra) throw new Error('No existe la barra fija del logo');
    const piezas = Array.from(barra.children).map((c) => c.getBoundingClientRect());
    let n = 0;
    for (const p of piezas)
      for (const t of lineas)
        if (p.left < t.right && t.left < p.right && p.top < t.bottom && t.top < p.bottom) n++;
    return n;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(tiempoInput(page)).toBeVisible();
  // Antes de tocar nada: un fill() o un clic previo a la hidratación se pierde.
  await esperarHidratacion(page, ['#tiempo-input', '#brazadas-input']);
});

test.describe('CASO 1 (normal) — 25 m · 22 s · 16 brazadas', () => {
  test('SWOLF 38, nivel Intermedio (borde inclusivo) y velocidad 1:28 min/100m', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '22', brazadas: '16' });

    // swolf = 22 + 16 = 38, coincide con el ejemplo del propio bloque educativo de la página.
    await expect(swolfScore(page)).toHaveText('38');
    // 38 ≤ 38 (corte de intermedio en 25 m): cae en Intermedio, no en Principiante.
    await expect(nivelBadge(page)).toContainText('Intermedio');
    await expect(detalle(page, 0)).toHaveText('En desarrollo');
    // 25 / 22 → 88,0 s por 100 m exactos → 1:28
    await expect(detalle(page, 1)).toHaveText('1:28 min/100m');
    await expect(detalle(page, 2)).toHaveText('Nadador con base, técnica mejorable');
    await expect(consejoTexto(page)).toContainText('catch-up');
  });
});

test.describe('CASO 1b (normal, 02/10/2026) — 25 m · 30 s · 20 brazadas, el ejemplo del FAQPage', () => {
  test('SWOLF 50, Principiante y 2:00 min/100m', async ({ page }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '30', brazadas: '20' });

    // FAQPage: «completar un largo de 25 m en 30 segundos con 20 brazadas da un SWOLF de 50».
    await expect(swolfScore(page)).toHaveText('50');
    // 50 > 38, el corte más alto de 25 m.
    await expect(nivelBadge(page)).toContainText('Principiante');
    await expect(detalle(page, 0)).toHaveText('Básica');
    // 100 / (25/30) = 120 s → 2:00
    await expect(detalle(page, 1)).toHaveText('2:00 min/100m');
  });
});

test.describe('CASO 2 (límite) — 25 m · 300 s · 100 brazadas, los máximos que declaran los campos', () => {
  test('SWOLF 400, Principiante, 20:00 min/100m, sin NaN ni Infinity', async ({ page }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '300', brazadas: '100' });

    // swolf = 300 + 100 = 400
    await expect(swolfScore(page)).toHaveText('400');
    await expect(nivelBadge(page)).toContainText('Principiante');
    await expect(detalle(page, 0)).toHaveText('Básica');
    // 4 · 300 = 1200 s → 20 min 00 s
    await expect(detalle(page, 1)).toHaveText('20:00 min/100m');

    const texto = await page.locator('main').innerText();
    expect(texto).not.toContain('NaN');
    expect(texto).not.toContain('Infinity');
  });
});

test.describe('CASO 2b (límite) — piscina de 50 m con los valores MÍNIMOS del input (5 s, 1 brazada)', () => {
  test('SWOLF 6, nivel Élite (con el ajuste +8 de 50 m) y velocidad 0:10 min/100m', async ({
    page,
  }) => {
    // Re-inspección 31/08/2026: ejercita metros_largo=50 desde la UI con los mínimos
    // declarados en los <input> (min={5} y min={1}). Un 6 es Élite con cualquier escala.
    await elegirPiscina(page, 50);
    await rellenar(page, { tiempo: '5', brazadas: '1' });

    // swolf = 5 + 1 = 6
    await expect(swolfScore(page)).toHaveText('6');
    await expect(nivelBadge(page)).toContainText('Élite');
    await expect(detalle(page, 0)).toHaveText('Excelente');
    // velocidadMedia_m_s = 50/5 = 10 exacto → 100/10 = 10 s por 100 m → «0:10 min/100m»
    await expect(detalle(page, 1)).toHaveText('0:10 min/100m');
    await expect(detalle(page, 2)).toHaveText('Eficiencia de nadador avanzado o competitivo');
  });
});

test.describe('CASO 3 (rechazo) — entradas que no describen ningún largo nadado', () => {
  // 02/10/2026: parten de 30 s · 20 brazadas (SWOLF 50), dentro de rango. Antes partían de
  // 500 s, que es justo lo que el hallazgo C pide rechazar. Y ya no exigen que el campo
  // «revierta» al valor anterior: esa reescritura es el mecanismo del hallazgo A, y una
  // reparación legítima (guardar el texto tecleado y avisar) la quitaría. Lo que se exige es
  // lo que importa: que nunca se calcule con el valor inválido.
  test('brazadas "0" no se acepta: nunca sale un SWOLF calculado con 0 brazadas', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '30', brazadas: '20' });
    await expect(swolfScore(page)).toHaveText('50');

    await brazadasInput(page).fill('0');
    // Con 0 brazadas saldría 30 + 0 = 30 («Avanzado»): no debe aparecer.
    await expect(swolfScore(page)).not.toHaveText('30');
    await expect(page.locator('main')).not.toContainText('NaN');
  });

  test('tiempo negativo tampoco se acepta: nunca sale un SWOLF calculado con -15 s', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '30', brazadas: '20' });
    await expect(swolfScore(page)).toHaveText('50');

    await tiempoInput(page).fill('-15');
    // Con -15 s saldría -15 + 20 = 5 («Élite»): no debe aparecer.
    await expect(swolfScore(page)).not.toHaveText('5');
    await expect(page.locator('main')).not.toContainText('NaN');
  });

  test('un input type=number no admite letras: el navegador descarta la pulsación', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '22', brazadas: '16' });
    await expect(swolfScore(page)).toHaveText('38');

    await brazadasInput(page).click();
    await brazadasInput(page).press('Control+A');
    await brazadasInput(page).pressSequentially('abc');
    // El navegador nunca deja escribir letras en type="number": el valor no cambia.
    await expect(brazadasInput(page)).toHaveValue('16');
    await expect(swolfScore(page)).toHaveText('38');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * REPARADO — HALLAZGO 564 (dato/alto): el FAQPage (JSON-LD) ya da los mismos rangos que la
 * propia calculadora en 25 m.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test(
  'el FAQPage (JSON-LD) da los mismos rangos de nivel que la propia calculadora en 25 m',
  async ({ page }) => {
    // La app real, en piscina de 25 m: élite ≤ 25 · avanzado 26–30 · intermedio 31–38 ·
    // principiante > 38. Compruébalo con un SWOLF de 40: la app lo clasifica Principiante.
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '25', brazadas: '15' }); // swolf = 40
    await expect(swolfScore(page)).toHaveText('40');
    await expect(nivelBadge(page)).toContainText('Principiante');

    // El FAQPage (lo que leen Bing Copilot, ChatGPT o Perplexity) ahora dice lo mismo que la
    // calculadora: un SWOLF de 40 en 25 m es Principiante (> 38), no «avanzado».
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const textos: string[] = faq.mainEntity.map(
      (q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text,
    );
    const rangos = textos.find((t) => t.includes('élite') && t.includes('25 m'))!;

    expect(rangos).toContain('25');
    expect(rangos).toContain('38');
    expect(rangos).not.toContain('por debajo de 35');
    expect(rangos).not.toContain('entre 35 y 45');
  },
);

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * REPARADO — HALLAZGO 565 (calculo/bajo): calcularSWOLF() ya valida sus argumentos. No es
 * alcanzable desde la UI (el componente ya guarda n > 0 antes de llamar al motor), así que se
 * prueba importando el motor directamente, sin navegador — mismo patrón que
 * calcularPotenciaCiclismo/calcularVatiosPorFuerzas en el mismo fichero.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('HALLAZGO 565 (calculo/bajo) — calcularSWOLF valida tiempo y brazadas > 0', () => {
  test('tiempo_s_largo = 0 lanza, en vez de devolver velocidadMedia_m_s = Infinity', () => {
    expect(() => calcularSWOLF(0, 16, 25)).toThrow('El tiempo del largo debe ser un número mayor que 0 segundos.');
  });

  test('tiempo_s_largo negativo lanza', () => {
    expect(() => calcularSWOLF(-5, 16, 25)).toThrow('El tiempo del largo debe ser un número mayor que 0 segundos.');
  });

  test('brazadas_largo = 0 lanza', () => {
    expect(() => calcularSWOLF(22, 0, 25)).toThrow('Las brazadas por largo deben ser un número mayor que 0.');
  });

  test('brazadas_largo negativo lanza', () => {
    expect(() => calcularSWOLF(22, -3, 25)).toThrow('Las brazadas por largo deben ser un número mayor que 0.');
  });

  test('valores válidos (control): no lanza y da el mismo SWOLF de siempre', () => {
    expect(calcularSWOLF(22, 16, 25).swolf).toBe(38);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * LOTES DE CSS (02/10/2026) — lo que trajeron b7733c6d, 586a4d61 y a1d72a9c, medido.
 * Pasan hoy: son la vigilancia de que el lote sigue haciendo su trabajo en esta app.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('LOTE del logo · 360 px (móvil)', () => {
  test.use({
    viewport: { width: 360, height: 800 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('la barra fija del logo no tapa el h1, en claro y en oscuro', async ({ page }) => {
    // Medido: barra hasta y=52, h1 desde y=79.
    expect(await solapesLogoTitulo(page)).toBe(0);
    await ponerOscuro(page);
    expect(await solapesLogoTitulo(page)).toBe(0);
  });
});

for (const ancho of [800, 1024]) {
  test.describe(`LOTE del logo · ${ancho} px`, () => {
    test.use({ viewport: { width: ancho, height: 900 } });

    test('la barra fija del logo no tapa el h1, en claro y en oscuro', async ({ page }) => {
      // Medido: a 800 px la barra acaba en y=77 y el h1 empieza en y=79 (el padding de 80 px
      // de a1d72a9c); a 1024 px el h1 centrado empieza en x=348 y el logo acaba en x=203.
      expect(await solapesLogoTitulo(page)).toBe(0);
      await ponerOscuro(page);
      expect(await solapesLogoTitulo(page)).toBe(0);
    });
  });
}

test('LOTE de cabeceras de tabla — el <th> pasa de 4,5:1 en claro y en oscuro', async ({ page }) => {
  // b7733c6d: background var(--primary-boton) = #26718F con texto blanco → 5,47:1 en los
  // dos temas (--primary-boton es igual en ambos). Con var(--primary) era 4,11:1.
  await abrirGuia(page);
  expect(await contraste(page, '[class*="comparativaTable"] th')).toBeGreaterThanOrEqual(4.5);
  await ponerOscuro(page);
  expect(await contraste(page, '[class*="comparativaTable"] th')).toBeGreaterThanOrEqual(4.5);
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * ABIERTO — 02/10/2026 · HALLAZGO A (operativa/alto): teclear para cambiar un valor no
 * puede vaciar el campo, y lo que se teclea después se CONCATENA al valor anterior.
 *
 * handleTiempo/handleBrazadas hacen parseInt y solo guardan si n > 0. Cuando el navegador
 * entrega '' (campo vacío, «-», «22.») el estado no cambia, React reescribe el input
 * controlado con el último valor válido y el cursor queda al final. `fill()` no lo ve porque
 * sustituye el valor de golpe: hay que TECLEAR. Medido el 02/10/2026:
 *   · tiempo «20» → Retroceso ×2 → «45»            → campo 245  · SWOLF 263 (esperado 45 · 63)
 *   · tiempo «20» → Ctrl+A, Supr → «35»            → campo 2035 · SWOLF 2053 (esperado 35 · 53)
 *   · tiempo «20» seleccionado → «-15»             → campo 2015 · SWOLF 2033 (esperado rechazo)
 *   · tiempo «20» seleccionado → «22.5» (16 braz.) → campo 225  · SWOLF 241
 *   · brazadas «18» → Retroceso ×2 → «20»          → campo 120  · SWOLF 140 (esperado 20 · 40)
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('ABIERTO — HALLAZGO A (operativa/alto): el tecleo real se concatena al valor anterior', () => {
  test('tiempo: borrar «20» con Retroceso y teclear «45» da 45 s y SWOLF 63', async ({ page }) => {
    test.fail(); // ABIERTO 02/10/2026: el campo se queda en «2» y acaba en «245» (SWOLF 263).
    await tiempoInput(page).click();
    await page.keyboard.press('End');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await tiempoInput(page).pressSequentially('45');
    // 45 + 18 (brazadas por defecto) = 63 → Principiante; 4 · 45 = 180 s → 3:00 min/100m.
    await expect(tiempoInput(page)).toHaveValue('45', { timeout: 2000 });
    await expect(swolfScore(page)).toHaveText('63', { timeout: 2000 });
    await expect(detalle(page, 1)).toHaveText('3:00 min/100m', { timeout: 2000 });
  });

  test('tiempo: Ctrl+A, Supr y teclear «35» da 35 s y SWOLF 53', async ({ page }) => {
    test.fail(); // ABIERTO 02/10/2026: el campo vuelve a «20» y acaba en «2035» (SWOLF 2053).
    await tiempoInput(page).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await tiempoInput(page).pressSequentially('35');
    // 35 + 18 = 53
    await expect(tiempoInput(page)).toHaveValue('35', { timeout: 2000 });
    await expect(swolfScore(page)).toHaveText('53', { timeout: 2000 });
  });

  test('tiempo: teclear «-15» sobre el valor seleccionado no produce un tiempo de 2015 s', async ({
    page,
  }) => {
    test.fail(); // ABIERTO 02/10/2026: «-» se rechaza reescribiendo «20» y «15» se le pega: 2015.
    await tiempoInput(page).click();
    await page.keyboard.press('Control+A');
    await tiempoInput(page).pressSequentially('-15');
    // Lo correcto es rechazar el negativo; nunca convertirlo en otro número válido.
    // 2015 + 18 = 2033 es la cifra que hoy sale.
    await expect(tiempoInput(page)).not.toHaveValue('2015', { timeout: 2000 });
    await expect(swolfScore(page)).not.toHaveText('2033', { timeout: 2000 });
  });

  test('tiempo: teclear «22.5» no se convierte en 225 s', async ({ page }) => {
    test.fail(); // ABIERTO 02/10/2026: el punto se pierde y queda «225» (SWOLF 241).
    await rellenar(page, { brazadas: '16' });
    await tiempoInput(page).click();
    await page.keyboard.press('Control+A');
    await tiempoInput(page).pressSequentially('22.5');
    // Correcto: 22,5 + 16 = 38,5, o un rechazo explícito. Nunca 225 + 16 = 241.
    // (Mismo resultado medido con locale en-US y es-ES.)
    await expect(tiempoInput(page)).not.toHaveValue('225', { timeout: 2000 });
    await expect(swolfScore(page)).not.toHaveText('241', { timeout: 2000 });
  });

  test('brazadas: borrar «18» con Retroceso y teclear «20» da 20 brazadas y SWOLF 40', async ({
    page,
  }) => {
    test.fail(); // ABIERTO 02/10/2026: el campo se queda en «1» y acaba en «120» (SWOLF 140).
    await brazadasInput(page).click();
    await page.keyboard.press('End');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await brazadasInput(page).pressSequentially('20');
    // 20 (tiempo por defecto) + 20 = 40 → Principiante en 25 m.
    await expect(brazadasInput(page)).toHaveValue('20', { timeout: 2000 });
    await expect(swolfScore(page)).toHaveText('40', { timeout: 2000 });
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * ABIERTO — 02/10/2026 · HALLAZGO B (calculo/alto): la escala de 50 m suma 8 puntos, y el
 * SWOLF de un largo de 50 m es como mínimo el DOBLE que el de uno de 25 m.
 *
 * SWOLF = segundos POR LARGO + brazadas POR LARGO. En 50 m el largo mide el doble, y la propia
 * guía de la app dice que en piscina larga «un largo de 50 m exige más ciclos de brazada que
 * dos largos de 25 m juntos» y que «el tiempo por metro es ligeramente mayor»: los dos
 * sumandos más que se duplican. Con «+8» (élite ≤ 33, intermedio ≤ 46) el mismo nadador baja
 * de nivel solo por cambiar de piscina. Resuelto a mano:
 *   · 25 m · 22 s · 16 brazadas → 38 → Intermedio (el ejemplo de la guía, 1:28 min/100m)
 *   · 50 m · 44 s · 32 brazadas → 76 (mismo ritmo 1:28, mismas brazadas por metro)
 *       esperado: Intermedio · la app: Principiante (76 > 46)
 *   · 25 m · 15 s · 10 brazadas → 25 → Élite
 *   · 50 m · 30 s · 20 brazadas → 50 → esperado: Élite · la app: Principiante (50 > 46)
 * El test compara el nivel en 50 m con el que la MISMA app da en 25 m, para no fijar una
 * escala concreta: cualquier escala proporcional a la longitud del largo lo cumple.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('ABIERTO — HALLAZGO B (calculo/alto): el mismo nadador cambia de nivel al pasar a 50 m', () => {
  test('22 s · 16 brazadas en 25 m y 44 s · 32 brazadas en 50 m: mismo nivel (Intermedio)', async ({
    page,
  }) => {
    test.fail(); // ABIERTO 02/10/2026: en 50 m sale Principiante.
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '22', brazadas: '16' });
    await expect(swolfScore(page)).toHaveText('38');
    await expect(nivelBadge(page)).toContainText('Intermedio');

    await elegirPiscina(page, 50);
    await rellenar(page, { tiempo: '44', brazadas: '32' });
    await expect(swolfScore(page)).toHaveText('76'); // 44 + 32
    await expect(detalle(page, 1)).toHaveText('1:28 min/100m'); // el mismo ritmo
    await expect(nivelBadge(page)).toContainText('Intermedio', { timeout: 2000 });
  });

  test('15 s · 10 brazadas en 25 m (Élite) y 30 s · 20 brazadas en 50 m: también Élite', async ({
    page,
  }) => {
    test.fail(); // ABIERTO 02/10/2026: en 50 m sale Principiante.
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '15', brazadas: '10' });
    await expect(swolfScore(page)).toHaveText('25');
    await expect(nivelBadge(page)).toContainText('Élite');

    await elegirPiscina(page, 50);
    await rellenar(page, { tiempo: '30', brazadas: '20' });
    await expect(swolfScore(page)).toHaveText('50'); // 30 + 20
    await expect(nivelBadge(page)).toContainText('Élite', { timeout: 2000 });
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * ABIERTO — 02/10/2026 · HALLAZGO C (calculo/medio): los rangos que declaran los campos
 * (tiempo 5–300 s, brazadas 1–100) no se hacen cumplir, y lo imposible recibe veredicto.
 * Mismo defecto que el 2494 de calculadora-potencia-ciclismo, en el MISMO motor.
 *   · 25 m · 2 s · 1 brazada → la app: SWOLF 3 · «Élite» · «Excelente» · 0:08 min/100m
 *     (12,5 m/s). Esperado: aviso y ningún nivel (2 < min=5).
 *   · 25 m · 500 s · 100 brazadas → la app: SWOLF 600 · «Principiante». Esperado: aviso y
 *     ningún nivel (500 > max=300).
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('ABIERTO — HALLAZGO C (calculo/medio): fuera de los rangos declarados no hay veredicto', () => {
  test('2 s y 1 brazada (por debajo de min=5) no recibe el nivel «Élite»', async ({ page }) => {
    test.fail(); // ABIERTO 02/10/2026: sale «Élite · Excelente · 0:08 min/100m».
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '2', brazadas: '1' });
    await expect(page.locator('[class*="nivelBadge"]', { hasText: 'Élite' })).toHaveCount(0, {
      timeout: 2000,
    });
    await expect(page.locator('main')).not.toContainText('0:08 min/100m', { timeout: 2000 });
  });

  test('500 s y 100 brazadas (por encima de max=300) no recibe nivel', async ({ page }) => {
    test.fail(); // ABIERTO 02/10/2026: sale «600 · Principiante · 33:20 min/100m».
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '500', brazadas: '100' });
    await expect(page.locator('[class*="nivelBadge"]', { hasText: 'Principiante' })).toHaveCount(0, {
      timeout: 2000,
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * ABIERTO — 02/10/2026 · HALLAZGO D (accesibilidad/medio): en claro, textos por debajo de
 * 4,5:1. Medido: título «Consejo para mejorar» y consejo del FAQ con var(--secondary) sobre
 * #FAFAFA → 2,68:1; subtítulos de la guía con var(--primary) sobre #F5F5F5 → 3,77:1 (17,6 px
 * en negrita no es texto grande); insignia y rango «Principiante» #6B7280 sobre #F3F4F6 →
 * 4,39:1. En oscuro los cuatro pasan.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('ABIERTO — HALLAZGO D (accesibilidad/medio): textos de la app ≥ 4,5:1 en tema claro', async ({
  page,
}) => {
  test.fail(); // ABIERTO 02/10/2026: 2,68 · 2,68 · 3,77 · 4,39.
  await rellenar(page, { tiempo: '30' }); // 30 + 18 = 48 → Principiante, para medir su insignia
  await expect(nivelBadge(page)).toContainText('Principiante');
  await abrirGuia(page);
  const medidas = {
    consejoTitulo: await contraste(page, '[class*="consejoTitulo"]'),
    faqTip: await contraste(page, '[class*="faqTip"]'),
    eduSubtitle: await contraste(page, '[class*="eduSubtitle"]'),
    insigniaPrincipiante: await contraste(page, '[class*="nivelBadge"]'),
  };
  for (const [nombre, ratio] of Object.entries(medidas)) {
    expect(ratio, `${nombre}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  }
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * ABIERTO — 02/10/2026 · HALLAZGO E (accesibilidad/medio): texto blanco sobre var(--primary)
 * en el botón de piscina activo y en los números de paso de la guía: 4,11:1 en claro y
 * 2,79:1 en oscuro (allí --primary se aclara a #3FA5D1). Es el mismo defecto que b7733c6d
 * reparó en el <th>, fuera de su alcance (botones e insignias, «campaña aparte»).
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('ABIERTO — HALLAZGO E (accesibilidad/medio): blanco sobre la marca ≥ 4,5:1 en los dos temas', async ({
  page,
}) => {
  test.fail(); // ABIERTO 02/10/2026: 4,11 en claro y 2,79 en oscuro.
  await abrirGuia(page);
  const medir = async () => ({
    botonActivo: await contraste(page, '[class*="piscinaBtnActive"]'),
    numeroPaso: await contraste(page, '[class*="stepNumber"]'),
  });
  const claro = await medir();
  await ponerOscuro(page);
  const oscuro = await medir();
  for (const [tema, m] of Object.entries({ claro, oscuro })) {
    for (const [nombre, ratio] of Object.entries(m)) {
      expect(ratio, `${tema} · ${nombre}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * ABIERTO — 02/10/2026 · HALLAZGO F (accesibilidad/bajo): el emoji del <h1> va sin
 * aria-hidden, así que el nombre accesible del encabezado es «🏊 Calculadora SWOLF» y el
 * lector de pantalla lo verbaliza antes del título (CLAUDE.md global §5, regla de oro).
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('ABIERTO — HALLAZGO F (accesibilidad/bajo): el h1 se llama «Calculadora SWOLF», sin el emoji', async ({
  page,
}) => {
  test.fail(); // ABIERTO 02/10/2026: nombre accesible «🏊 Calculadora SWOLF».
  await expect(
    page.getByRole('heading', { level: 1, name: 'Calculadora SWOLF', exact: true }),
  ).toHaveCount(1, { timeout: 2000 });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * ABIERTO — 02/10/2026 · HALLAZGO G (contenido/bajo): el consejo del FAQ se contradice.
 * «Los nadadores de élite suelen nadar con más brazadas que los intermedios porque su
 * eficiencia por ciclo es mayor»: más eficiencia por ciclo es más metros por brazada, es
 * decir MENOS brazadas por largo — lo que la propia guía afirma arriba («un SWOLF bajo indica
 * que nadas rápido con pocas brazadas»).
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('ABIERTO — HALLAZGO G (contenido/bajo): el FAQ no dice que la élite da más brazadas por ser más eficiente', async ({
  page,
}) => {
  test.fail(); // ABIERTO 02/10/2026: la frase sigue en la guía.
  await abrirGuia(page);
  await expect(page.locator('main')).not.toContainText(
    'suelen nadar con más brazadas que los intermedios porque su eficiencia por ciclo es mayor',
    { timeout: 2000 },
  );
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * ABIERTO — 02/10/2026 · HALLAZGO H (contenido/bajo): erratas y formato.
 *   · «1,5–3%» → «1,5–3 %» (espacio duro, regla del catálogo del 25/09/2026), y sin fuente.
 *   · «Trabaja la deslizamiento» → «el deslizamiento».
 *   · «exentrenado» no existe.
 *   · «25m y 50m» en la description, Twitter y JSON-LD → «25 m y 50 m»; «min/100m» → «min/100 m».
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('ABIERTO — HALLAZGO H (contenido/bajo): sin erratas ni % pegado en la guía y la metadata', async ({
  page,
}) => {
  test.fail(); // ABIERTO 02/10/2026: «3%», «la deslizamiento», «exentrenado», «25m y 50m».
  await abrirGuia(page);
  const guia = await page.locator('main').innerText();
  expect(guia).toContain('1,5–3 %');
  expect(guia).not.toContain('la deslizamiento');
  expect(guia).not.toContain('exentrenado');
  const descripcion = await page.locator('meta[name="description"]').getAttribute('content');
  expect(descripcion).not.toContain('25m y 50m');
});
