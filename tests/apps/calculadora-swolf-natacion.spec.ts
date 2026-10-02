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
 * Esa vuelta abrió 8 hallazgos (2630-2637): el tecleo real reescribe los campos y concatena
 * lo que se teclea detrás del valor anterior; la escala de 50 m suma 8 puntos donde la propia
 * guía de la app implica más del doble; los rangos que declaran los campos no se hacen
 * cumplir; contraste de textos de marca y de blanco sobre --primary; el emoji del h1; y dos
 * de contenido. REPARADOS el 02/10/2026 (bloques «REPARADO — HALLAZGO A…H»).
 *
 * QUÉ PROMETE
 *   <h1>: «Calculadora SWOLF» (el 🏊 va con aria-hidden desde el 02/10/2026)
 *   subtítulo: «Mide tu eficiencia en el agua combinando tiempo y brazadas por largo»
 *   metadata: «Calcula tu índice SWOLF para medir la eficiencia en el agua. Combina tiempo y
 *              brazadas por largo para mejorar tu técnica de natación. Compatible con piscinas
 *              de 25 m y 50 m.» (antes «25m y 50m», hallazgo 2637)
 *   bloque educativo: «SWOLF = tiempo (s) + brazadas» — cuanto más bajo, mejor.
 *
 * DÓNDE VIVE EL CÁLCULO — lib/calculadoras/deporte.ts → calcularSWOLF(tiempo_s_largo,
 * brazadas_largo, metros_largo = 25)
 *   · swolf = tiempo_s_largo + brazadas_largo                     (suma directa, sin redondeos)
 *   · ajuste = +8 en piscina de 50 m; cortes SIN ajustar: élite ≤ 25 · avanzado ≤ 30 ·
 *     intermedio ≤ 38 · el resto, principiante                     (bordes INCLUSIVOS)
 *     ⚠️ Ese +8 es el hallazgo 2631. La PÁGINA ya no lo usa (02/10/2026): pide al motor la
 *     escala de 25 m con el SWOLF equivalente por 25 m (swolf / 2 en piscina de 50 m), así
 *     que en 50 m los cortes son 50 · 60 · 76. El motor lo conservan la API de ChatGPT y la
 *     tool del MCP, fuera del ámbito de esta app.
 *   · Valida tiempo y brazadas > 0 (lanza Error): hallazgo 565, REPARADO el 31/08/2026.
 *
 * DÓNDE SE LEEN LOS CAMPOS — page.tsx (desde el 02/10/2026): `type="text"` con el TEXTO
 * tecleado como estado, leído con parseSpanishNumber y acotado POR CADA 25 m de largo
 * (tiempo 5–300 s, brazadas 1–100; en 50 m, el doble). Fuera de rango, vacío o no numérico:
 * aviso en una región viva persistente (#aviso-entradas, role=status) y ningún nivel. Admite
 * decimales (la guía pide la media de 3-5 largos) y clasifica el SWOLF a la décima que se
 * muestra. El ritmo «m:ss min/100 m» lo calcula la página redondeando el total de segundos.
 * Antes: estado NUMÉRICO + parseInt y «solo se guarda si n > 0», que concatenaba lo tecleado
 * (hallazgo A, 2630).
 *
 * NO hay botón «Calcular»: el resultado es reactivo (useMemo) sobre cada input.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 25 m · 22 s · 16 brazadas (ejemplo del bloque educativo: «Si tardas 22
 *     segundos y das 16 brazadas, tu SWOLF es 38»)
 *       swolf = 22 + 16 = 38 → 38 ≤ 38 → «Intermedio» (borde inclusivo)
 *       segundosPor100m = 100 / (25/22) = 88 → «1:28 min/100 m»
 *
 *   CASO 1b (normal, 02/10/2026) — 25 m · 30 s · 20 brazadas (ejemplo del FAQPage: «completar
 *     un largo de 25 m en 30 segundos con 20 brazadas da un SWOLF de 50»)
 *       swolf = 30 + 20 = 50 → 50 > 38 → «Principiante» · «Básica»
 *       segundosPor100m = 4 · 30 = 120 → «2:00 min/100 m»
 *
 *   CASO 2 (límite superior declarado) — 25 m · 300 s · 100 brazadas (max={300} y max={100}
 *     de los propios <input>; 02/10/2026: antes este caso usaba 500 s y afirmaba que NO había
 *     aviso, lo que fijaba como correcto el hallazgo C. Ahora usa el máximo que los campos
 *     admiten y los 500 s pasan al bloque del hallazgo C)
 *       swolf = 300 + 100 = 400 → «Principiante» · «Básica»
 *       segundosPor100m = 4 · 300 = 1200 → «20:00 min/100 m»
 *
 *   CASO 2b (límite) — 50 m · 10 s · 2 brazadas (los mínimos de 50 m: 5 s y 1 brazada por
 *     cada 25 m. 02/10/2026: antes usaba 5 s y 1 brazada, que en 50 m son 10 m/s y daban
 *     «Élite»; es la forma en 50 m del hallazgo C, y ahora reciben aviso)
 *       swolf = 12 → corte de élite de 50 m (≤ 50) → «Élite»
 *       segundosPor100m = 2 · 10 = 20 → «0:20 min/100 m»
 *
 *   CASO 3 (rechazo) — brazadas «0», tiempo «-15» y letras: nunca se calcula con ellos
 *     (con 30 s, «0» brazadas daría 30 y «-15» s daría 5). Desde el 02/10/2026 el campo es
 *     de texto: las letras se ven en el campo, pero reciben aviso y ningún SWOLF.
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
/** 0 = Eficiencia · 1 = Velocidad media (min/100 m) · 2 = Descripción del nivel. */
const detalle = (page: Page, i: number) => page.locator('[class*="detalleValor"]').nth(i);
const consejoTexto = (page: Page) => page.locator('[class*="consejoTexto"]').first();
const tiempoInput = (page: Page) => page.locator('#tiempo-input');
const brazadasInput = (page: Page) => page.locator('#brazadas-input');
/** Región viva persistente del aviso de entradas (role=status). */
const aviso = (page: Page) => page.locator('#aviso-entradas');

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
  test('SWOLF 38, nivel Intermedio (borde inclusivo) y velocidad 1:28 min/100 m', async ({
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
    await expect(detalle(page, 1)).toHaveText('1:28 min/100 m');
    await expect(detalle(page, 2)).toHaveText('Nadador con base, técnica mejorable');
    await expect(consejoTexto(page)).toContainText('catch-up');
  });
});

test.describe('CASO 1b (normal, 02/10/2026) — 25 m · 30 s · 20 brazadas, el ejemplo del FAQPage', () => {
  test('SWOLF 50, Principiante y 2:00 min/100 m', async ({ page }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '30', brazadas: '20' });

    // FAQPage: «completar un largo de 25 m en 30 segundos con 20 brazadas da un SWOLF de 50».
    await expect(swolfScore(page)).toHaveText('50');
    // 50 > 38, el corte más alto de 25 m.
    await expect(nivelBadge(page)).toContainText('Principiante');
    await expect(detalle(page, 0)).toHaveText('Básica');
    // 100 / (25/30) = 120 s → 2:00
    await expect(detalle(page, 1)).toHaveText('2:00 min/100 m');
  });
});

test.describe('CASO 2 (límite) — 25 m · 300 s · 100 brazadas, los máximos que declaran los campos', () => {
  test('SWOLF 400, Principiante, 20:00 min/100 m, sin NaN ni Infinity', async ({ page }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '300', brazadas: '100' });

    // swolf = 300 + 100 = 400
    await expect(swolfScore(page)).toHaveText('400');
    await expect(nivelBadge(page)).toContainText('Principiante');
    await expect(detalle(page, 0)).toHaveText('Básica');
    // 4 · 300 = 1200 s → 20 min 00 s
    await expect(detalle(page, 1)).toHaveText('20:00 min/100 m');

    const texto = await page.locator('main').innerText();
    expect(texto).not.toContain('NaN');
    expect(texto).not.toContain('Infinity');
  });
});

test.describe('CASO 2b (límite) — piscina de 50 m con los valores MÍNIMOS de 50 m (10 s, 2 brazadas)', () => {
  test('SWOLF 12, nivel Élite y velocidad 0:20 min/100 m', async ({ page }) => {
    // Ejercita metros_largo=50 desde la UI con los mínimos de 50 m: el doble de los de 25 m
    // (5 s y 1 brazada por cada 25 m). Un 12 es Élite con cualquier escala.
    await elegirPiscina(page, 50);
    await rellenar(page, { tiempo: '10', brazadas: '2' });

    // swolf = 10 + 2 = 12
    await expect(swolfScore(page)).toHaveText('12');
    await expect(nivelBadge(page)).toContainText('Élite');
    await expect(detalle(page, 0)).toHaveText('Excelente');
    // 100 · 10 / 50 = 20 s por 100 m → «0:20 min/100 m»
    await expect(detalle(page, 1)).toHaveText('0:20 min/100 m');
    await expect(detalle(page, 2)).toHaveText('Eficiencia de nadador avanzado o competitivo');
  });

  test('50 m · 5 s · 1 brazada (los mínimos de 25 m) ya no recibe «Élite»: aviso y sin nivel', async ({
    page,
  }) => {
    // 50 m en 5 s son 10 m/s. Hasta el 02/10/2026 la app lo daba por «Élite» (era el viejo
    // CASO 2b, que lo fijaba como correcto con los mínimos declarados para 25 m).
    await elegirPiscina(page, 50);
    await rellenar(page, { tiempo: '5', brazadas: '1' });
    await expect(aviso(page)).toContainText('entre 10 y 600 segundos');
    await expect(aviso(page)).toContainText('entre 2 y 200');
    await expect(nivelBadge(page)).toHaveCount(0);
    await expect(swolfScore(page)).toHaveText('—');
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
    // Con 0 brazadas saldría 30 + 0 = 30 («Avanzado»): no debe aparecer. Y no basta con que
    // no salga 30: tiene que haber aviso y ningún resultado (0 < mínimo de 1 brazada).
    await expect(swolfScore(page)).not.toHaveText('30');
    await expect(swolfScore(page)).toHaveText('—');
    await expect(aviso(page)).toContainText('entre 1 y 100');
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
    await expect(swolfScore(page)).toHaveText('—');
    await expect(aviso(page)).toContainText('entre 5 y 300 segundos');
    await expect(page.locator('main')).not.toContainText('NaN');
  });

  test('letras en las brazadas: aviso y ningún SWOLF (el campo es de texto desde el 02/10/2026)', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '22', brazadas: '16' });
    await expect(swolfScore(page)).toHaveText('38');

    await brazadasInput(page).click();
    await brazadasInput(page).press('Control+A');
    await brazadasInput(page).pressSequentially('abc');
    // Antes era type="number" y el navegador descartaba las letras. Ahora se ven en el campo,
    // pero parseSpanishNumber('abc') es NaN: aviso, campo marcado y ningún resultado.
    await expect(brazadasInput(page)).toHaveValue('abc');
    await expect(brazadasInput(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(aviso(page)).toContainText('Las brazadas deben ser un número');
    await expect(swolfScore(page)).toHaveText('—');
    await expect(nivelBadge(page)).toHaveCount(0);
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

// Desde el 02/10/2026 (hallazgos 2631 y 2632, reparados TAMBIÉN en el motor, que comparten la
// API de ChatGPT y la tool del MCP): el motor exige los mismos rangos que la página —5-300 s y
// 1-100 brazadas por cada 25 m— y lanza RangeError con el motivo. Los cuatro casos del 565
// siguen lanzando, ahora con el mensaje del rango.
test.describe('HALLAZGO 565 (calculo/bajo) — calcularSWOLF valida tiempo y brazadas', () => {
  test('tiempo_s_largo = 0 lanza, en vez de devolver velocidadMedia_m_s = Infinity', () => {
    expect(() => calcularSWOLF(0, 16, 25)).toThrow('el tiempo por largo debe estar entre 5 y 300 segundos');
  });

  test('tiempo_s_largo negativo lanza', () => {
    expect(() => calcularSWOLF(-5, 16, 25)).toThrow(RangeError);
  });

  test('brazadas_largo = 0 lanza', () => {
    expect(() => calcularSWOLF(22, 0, 25)).toThrow('las brazadas por largo deben estar entre 1 y 100');
  });

  test('brazadas_largo negativo lanza', () => {
    expect(() => calcularSWOLF(22, -3, 25)).toThrow(RangeError);
  });

  test('valores válidos (control): no lanza y da el mismo SWOLF de siempre', () => {
    expect(calcularSWOLF(22, 16, 25).swolf).toBe(38);
  });
});

test.describe('REPARADO EN EL MOTOR — 2631 y 2632: lo que reciben la API y el MCP', () => {
  test('en 50 m clasifica con el equivalente por 25 m: 76 es Intermedio y 77 Principiante', () => {
    // 50 m · 44 s · 32 brazadas = 76 → 76 / 2 = 38 ≤ 38 → Intermedio (antes: 76 > 46 → Principiante)
    const r = calcularSWOLF(44, 32, 50);
    expect(r.swolf).toBe(76);
    expect(r.swolfEquivalente25).toBe(38);
    expect(r.nivel).toBe('intermedio');
    expect(calcularSWOLF(45, 32, 50).nivel).toBe('principiante');
    // El mismo nadador en 25 m: mismo nivel.
    expect(calcularSWOLF(22, 16, 25).nivel).toBe('intermedio');
  });

  test('los rangos escalan con la piscina: 2 s en 25 m o 9 s en 50 m no reciben veredicto', () => {
    expect(() => calcularSWOLF(2, 1, 25)).toThrow(RangeError);
    expect(() => calcularSWOLF(9, 20, 50)).toThrow('entre 10 y 600 segundos');
    expect(() => calcularSWOLF(30, 201, 50)).toThrow('entre 2 y 200');
    expect(() => calcularSWOLF(22, 16, 33)).toThrow('25 o de 50 metros');
  });

  test('el ritmo redondea el total de segundos: 14,99 s en 25 m es «1:00», no «0:60»', () => {
    // 14,99 × 4 = 59,96 s/100 m → 60 → 1:00
    expect(calcularSWOLF(14.99, 10, 25).velocidadMedia_min100m).toBe('1:00 min/100 m');
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
 * REPARADO — 02/10/2026 · HALLAZGO A (2630, operativa/alto): teclear para cambiar un valor
 * vaciaba el campo a medias y lo que se tecleaba después se CONCATENABA al valor anterior.
 *
 * Era: handleTiempo/handleBrazadas hacían parseInt y solo guardaban si n > 0. Cuando el
 * navegador entregaba '' (campo vacío, «-», «22.») el estado no cambiaba, React reescribía el
 * input controlado con el último valor válido y el cursor quedaba al final. `fill()` no lo ve
 * porque sustituye el valor de golpe: hay que TECLEAR. Medido el 02/10/2026, antes de reparar:
 *   · tiempo «20» → Retroceso ×2 → «45»            → campo 245  · SWOLF 263 (esperado 45 · 63)
 *   · tiempo «20» → Ctrl+A, Supr → «35»            → campo 2035 · SWOLF 2053 (esperado 35 · 53)
 *   · tiempo «20» seleccionado → «-15»             → campo 2015 · SWOLF 2033 (esperado rechazo)
 *   · tiempo «20» seleccionado → «22.5» (16 braz.) → campo 225  · SWOLF 241
 *   · brazadas «18» → Retroceso ×2 → «20»          → campo 120  · SWOLF 140 (esperado 20 · 40)
 * Reparación: campos de texto con el TEXTO como estado, leídos con parseSpanishNumber. Los
 * decimales se ADMITEN (la guía pide la media de 3-5 largos): «22.5» y «22,5» son 22,5 s.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('REPARADO — HALLAZGO A (2630): el tecleo real ya no se concatena al valor anterior', () => {
  test('tiempo: borrar «20» con Retroceso y teclear «45» da 45 s y SWOLF 63', async ({ page }) => {
    await tiempoInput(page).click();
    await page.keyboard.press('End');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    // Con el campo vacío: el campo SE QUEDA vacío (antes React le devolvía el «2») y avisa.
    await expect(tiempoInput(page)).toHaveValue('');
    await expect(aviso(page)).toContainText('Escribe el tiempo');
    await tiempoInput(page).pressSequentially('45');
    // 45 + 18 (brazadas por defecto) = 63 → Principiante; 4 · 45 = 180 s → 3:00 min/100 m.
    await expect(tiempoInput(page)).toHaveValue('45');
    await expect(swolfScore(page)).toHaveText('63');
    await expect(detalle(page, 1)).toHaveText('3:00 min/100 m');
    await expect(aviso(page)).toHaveText('');
  });

  test('tiempo: Ctrl+A, Supr y teclear «35» da 35 s y SWOLF 53', async ({ page }) => {
    await tiempoInput(page).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await tiempoInput(page).pressSequentially('35');
    // 35 + 18 = 53
    await expect(tiempoInput(page)).toHaveValue('35');
    await expect(swolfScore(page)).toHaveText('53');
  });

  test('tiempo: teclear «-15» sobre el valor seleccionado se rechaza con aviso, sin 2015 s', async ({
    page,
  }) => {
    await tiempoInput(page).click();
    await page.keyboard.press('Control+A');
    await tiempoInput(page).pressSequentially('-15');
    // El campo muestra lo tecleado y el negativo se rechaza: aviso de rango y ningún SWOLF.
    // (Antes salía 2015 s y SWOLF 2033.)
    await expect(tiempoInput(page)).toHaveValue('-15');
    await expect(tiempoInput(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(aviso(page)).toContainText('entre 5 y 300 segundos');
    await expect(swolfScore(page)).toHaveText('—');
    await expect(nivelBadge(page)).toHaveCount(0);
  });

  test('tiempo: teclear «22.5» con 16 brazadas da 22,5 s y SWOLF 38,5 (Principiante)', async ({
    page,
  }) => {
    await rellenar(page, { brazadas: '16' });
    await tiempoInput(page).click();
    await page.keyboard.press('Control+A');
    await tiempoInput(page).pressSequentially('22.5');
    // Un solo punto sin grupos de tres cifras es decimal para parseSpanishNumber: 22,5 s.
    // 22,5 + 16 = 38,5 > 38 → Principiante. 4 · 22,5 = 90 s → 1:30 min/100 m.
    await expect(tiempoInput(page)).toHaveValue('22.5');
    await expect(swolfScore(page)).toHaveText('38,5');
    await expect(nivelBadge(page)).toContainText('Principiante');
    await expect(detalle(page, 1)).toHaveText('1:30 min/100 m');
  });

  test('tiempo «22,5» y brazadas «15,5» (medias de varios largos) suman 38: Intermedio, borde inclusivo', async ({
    page,
  }) => {
    // La coma decimal española. Antes, «22,5» se quedaba en 22 sin aviso (parseInt).
    await tiempoInput(page).click();
    await page.keyboard.press('Control+A');
    await tiempoInput(page).pressSequentially('22,5');
    await brazadasInput(page).click();
    await page.keyboard.press('Control+A');
    await brazadasInput(page).pressSequentially('15,5');
    // 22,5 + 15,5 = 38 exacto → Intermedio (≤ 38), y se muestra «38», sin decimales.
    await expect(swolfScore(page)).toHaveText('38');
    await expect(nivelBadge(page)).toContainText('Intermedio');
  });

  test('brazadas: borrar «18» con Retroceso y teclear «20» da 20 brazadas y SWOLF 40', async ({
    page,
  }) => {
    await brazadasInput(page).click();
    await page.keyboard.press('End');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await brazadasInput(page).pressSequentially('20');
    // 20 (tiempo por defecto) + 20 = 40 → Principiante en 25 m.
    await expect(brazadasInput(page)).toHaveValue('20');
    await expect(swolfScore(page)).toHaveText('40');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * REPARADO — 02/10/2026 · HALLAZGO B (2631, calculo/alto): la escala de 50 m sumaba 8
 * puntos, y el SWOLF de un largo de 50 m es como mínimo el DOBLE que el de uno de 25 m.
 *
 * SWOLF = segundos POR LARGO + brazadas POR LARGO. En 50 m el largo mide el doble: a igual
 * ritmo (s/m) y mismas brazadas por metro, los dos sumandos se duplican exactamente; y sin el
 * impulso del viraje de la mitad, en la práctica algo más. Con «+8» (élite ≤ 33, intermedio
 * ≤ 46) el mismo nadador bajaba de nivel solo por cambiar de piscina. Resuelto a mano:
 *   · 25 m · 22 s · 16 brazadas → 38 → Intermedio (el ejemplo de la guía, 1:28 min/100 m)
 *   · 50 m · 44 s · 32 brazadas → 76 (mismo ritmo 1:28, mismas brazadas por metro)
 *       esperado: Intermedio · antes: Principiante (76 > 46)
 *   · 25 m · 15 s · 10 brazadas → 25 → Élite
 *   · 50 m · 30 s · 20 brazadas → 50 → esperado: Élite · antes: Principiante (50 > 46)
 * Reparación: la página clasifica con el SWOLF equivalente por 25 m (swolf / 2 en 50 m), es
 * decir, cortes de 50 m = 2 × los de 25 m: 50 · 60 · 76. Es el MÍNIMO que da la geometría; el
 * «algo más» del viraje no tiene una cifra con fuente, así que no se inventa: cerca de un
 * corte, la clasificación en 50 m queda del lado conservador, y la guía lo dice.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('REPARADO — HALLAZGO B (2631): el mismo nadador conserva su nivel al pasar a 50 m', () => {
  test('22 s · 16 brazadas en 25 m y 44 s · 32 brazadas en 50 m: mismo nivel (Intermedio)', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '22', brazadas: '16' });
    await expect(swolfScore(page)).toHaveText('38');
    await expect(nivelBadge(page)).toContainText('Intermedio');

    await elegirPiscina(page, 50);
    await rellenar(page, { tiempo: '44', brazadas: '32' });
    await expect(swolfScore(page)).toHaveText('76'); // 44 + 32
    await expect(detalle(page, 1)).toHaveText('1:28 min/100 m'); // el mismo ritmo
    await expect(nivelBadge(page)).toContainText('Intermedio');
  });

  test('15 s · 10 brazadas en 25 m (Élite) y 30 s · 20 brazadas en 50 m: también Élite', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '15', brazadas: '10' });
    await expect(swolfScore(page)).toHaveText('25');
    await expect(nivelBadge(page)).toContainText('Élite');

    await elegirPiscina(page, 50);
    await rellenar(page, { tiempo: '30', brazadas: '20' });
    await expect(swolfScore(page)).toHaveText('50'); // 30 + 20
    await expect(nivelBadge(page)).toContainText('Élite');
  });

  test('bordes de 50 m: 76 es Intermedio y 77 ya es Principiante; la caja rotula 50 · 60 · 76', async ({
    page,
  }) => {
    await elegirPiscina(page, 50);
    await rellenar(page, { tiempo: '46', brazadas: '30' }); // 76
    await expect(swolfScore(page)).toHaveText('76');
    await expect(nivelBadge(page)).toContainText('Intermedio');
    await rellenar(page, { brazadas: '31' }); // 77
    await expect(swolfScore(page)).toHaveText('77');
    await expect(nivelBadge(page)).toContainText('Principiante');

    const valores = page.locator('[class*="rangoValor"]');
    await expect(valores).toHaveText(['≤ 50', '≤ 60', '≤ 76', '> 76']);
  });

  test('el FAQPage y la guía ya no dicen que en 50 m los umbrales suben 8 puntos', async ({ page }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const textos: string[] = faq.mainEntity.map(
      (q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text,
    );
    const rangos = textos.find((t) => t.includes('50 m'))!;
    expect(rangos).not.toContain('8 puntos');
    expect(rangos).toContain('hasta 50 élite');
    expect(rangos).toContain('hasta 76 intermedio');

    await abrirGuia(page);
    const guia = await page.locator('main').innerText();
    expect(guia).not.toContain('~8 puntos');
    expect(guia).not.toMatch(/≤ 33\b/);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * REPARADO — 02/10/2026 · HALLAZGO C (2632, calculo/medio): los rangos que declaraban los
 * campos (tiempo 5–300 s, brazadas 1–100) no se hacían cumplir, y lo imposible recibía
 * veredicto. Mismo defecto que el 2494 de calculadora-potencia-ciclismo.
 *   · 25 m · 2 s · 1 brazada → antes: SWOLF 3 · «Élite» · «Excelente» · 0:08 min/100 m
 *     (12,5 m/s). Ahora: aviso y ningún nivel (2 < 5).
 *   · 25 m · 500 s · 100 brazadas → antes: SWOLF 600 · «Principiante». Ahora: aviso y
 *     ningún nivel (500 > 300).
 * Los rangos van POR CADA 25 m: en 50 m son 10–600 s y 2–200 brazadas (ver CASO 2b).
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('REPARADO — HALLAZGO C (2632): fuera de los rangos declarados no hay veredicto', () => {
  test('la región del aviso existe desde la carga, vacía, para que el lector la anuncie', async ({
    page,
  }) => {
    await expect(aviso(page)).toHaveAttribute('role', 'status');
    await expect(aviso(page)).toHaveText('');
  });

  test('2 s y 1 brazada (por debajo del mínimo de 5 s) no recibe el nivel «Élite»', async ({ page }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '2', brazadas: '1' });
    await expect(aviso(page)).toContainText('entre 5 y 300 segundos');
    await expect(nivelBadge(page)).toHaveCount(0);
    await expect(swolfScore(page)).toHaveText('—');
    await expect(page.locator('main')).not.toContainText('0:08 min/100 m');
  });

  test('500 s y 100 brazadas (por encima del máximo de 300 s) no recibe nivel', async ({ page }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '500', brazadas: '100' });
    await expect(aviso(page)).toContainText('entre 5 y 300 segundos');
    await expect(nivelBadge(page)).toHaveCount(0);
    await expect(swolfScore(page)).toHaveText('—');
  });

  test('101 brazadas en 25 m: aviso de brazadas y sin nivel', async ({ page }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '30', brazadas: '101' });
    await expect(aviso(page)).toContainText('las brazadas por largo deben estar entre 1 y 100');
    await expect(nivelBadge(page)).toHaveCount(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * REPARADO — 02/10/2026 · HALLAZGO D (2633, accesibilidad/medio): en claro, textos por
 * debajo de 4,5:1. Medido antes: título «Consejo para mejorar» y consejo del FAQ con
 * var(--secondary) sobre #FAFAFA → 2,68:1; subtítulos de la guía con var(--primary) sobre
 * #F5F5F5 → 3,77:1 (17,6 px en negrita no es texto grande); insignia y rango «Principiante»
 * #6B7280 sobre #F3F4F6 → 4,39:1. Reparación: --secondary-texto / --primary-texto y #4B5563.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('REPARADO — HALLAZGO D (2633): textos de la app ≥ 4,5:1 en claro y en oscuro', async ({ page }) => {
  await rellenar(page, { tiempo: '30' }); // 30 + 18 = 48 → Principiante, para medir su insignia
  await expect(nivelBadge(page)).toContainText('Principiante');
  await abrirGuia(page);
  const medir = async () => ({
    consejoTitulo: await contraste(page, '[class*="consejoTitulo"]'),
    faqTip: await contraste(page, '[class*="faqTip"]'),
    eduSubtitle: await contraste(page, '[class*="eduSubtitle"]'),
    insigniaPrincipiante: await contraste(page, '[class*="nivelBadge"]'),
    rangoPrincipiante: await contraste(page, '[class*="rangoItem"][class*="principiante"] [class*="rangoNivel"]'),
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
 * REPARADO — 02/10/2026 · HALLAZGO E (2634, accesibilidad/medio): texto blanco sobre
 * var(--primary) en el botón de piscina activo y en los números de paso de la guía: 4,11:1
 * en claro y 2,79:1 en oscuro (allí --primary se aclara a #3FA5D1). Reparación:
 * --primary-boton, igual en los dos temas (5,47:1), como b7733c6d hizo con el <th>.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('REPARADO — HALLAZGO E (2634): blanco sobre la marca ≥ 4,5:1 en los dos temas', async ({ page }) => {
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
 * REPARADO — 02/10/2026 · HALLAZGO F (2635, accesibilidad/bajo): el emoji del <h1> iba sin
 * aria-hidden y el nombre accesible del encabezado era «🏊 Calculadora SWOLF».
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('REPARADO — HALLAZGO F (2635): el h1 se llama «Calculadora SWOLF», sin el emoji', async ({ page }) => {
  await expect(
    page.getByRole('heading', { level: 1, name: 'Calculadora SWOLF', exact: true }),
  ).toHaveCount(1);
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * REPARADO — 02/10/2026 · HALLAZGO G (2636, contenido/bajo): el consejo del FAQ decía que
 * la élite da MÁS brazadas «porque su eficiencia por ciclo es mayor»: más eficiencia por
 * ciclo es más metros por brazada, es decir MENOS brazadas por largo. Reescrito en ese
 * sentido, coherente con «un SWOLF bajo indica que nadas rápido con pocas brazadas».
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('REPARADO — HALLAZGO G (2636): el FAQ dice que el nadador eficiente da MENOS brazadas', async ({ page }) => {
  await abrirGuia(page);
  const tip = page.locator('[class*="faqTip"]');
  await expect(tip).not.toContainText('con más brazadas que los intermedios');
  await expect(tip).toContainText('menos brazadas por largo');
});

/* ═══════════════════════════════════════════════════════════════════════════════════════
 * REPARADO — 02/10/2026 · HALLAZGO H (2637, contenido/bajo): erratas y formato.
 *   · «suelen ser 1,5–3% más rápidos», sin fuente. El esperado del acta era «1,5–3 %» CON
 *     fuente; no se encontró una fuente que dé ese rango tal cual, y una cifra redonda sin
 *     fuente es justo el antipatrón 1 de neutralidad editorial. Se RETIRA la cifra y queda
 *     el hecho cualitativo (piscina corta más rápida por los virajes). El test exige que no
 *     quede ningún % pegado a su cifra en la guía.
 *   · «Trabaja la deslizamiento» → «el deslizamiento».
 *   · «exentrenado» no existe → «Nadador de competición de alto nivel, en activo o retirado».
 *   · «25m y 50m» en description, Twitter y features del JSON-LD → «25 m y 50 m»;
 *     «min/100m» → «min/100 m» (también en el ritmo que muestra la página).
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test('REPARADO — HALLAZGO H (2637): sin erratas ni % pegado en la guía y la metadata', async ({ page }) => {
  await abrirGuia(page);
  const guia = await page.locator('main').innerText();
  expect(guia).not.toMatch(/\d%/);
  expect(guia).not.toContain('1,5–3');
  expect(guia).not.toContain('la deslizamiento');
  expect(guia).toContain('Trabaja el deslizamiento');
  expect(guia).not.toContain('exentrenado');
  expect(guia).not.toContain('min/100m');

  const descripcion = await page.locator('meta[name="description"]').getAttribute('content');
  expect(descripcion).toContain('25 m y 50 m');
  const twitter = await page.locator('meta[name="twitter:description"]').getAttribute('content');
  expect(twitter).toContain('25 m y 50 m');

  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const todo = bloques.join('\n');
  expect(todo).not.toContain('25m');
  expect(todo).not.toContain('50m');
  expect(todo).not.toContain('min/100m');
});
