import { test, expect, Page } from '@playwright/test';
import { calcularSWOLF } from '../../lib/calculadoras/deporte';

/**
 * Inspector — calculadora-swolf-natacion (segmento MOTOR de cálculo, riesgo 2)
 *
 * Primera inspección: 31/08/2026.
 *
 * QUÉ PROMETE
 *   <h1>: «🏊 Calculadora SWOLF»
 *   subtítulo: «Mide tu eficiencia en el agua combinando tiempo y brazadas por largo»
 *   metadata: «Calcula tu índice SWOLF para medir la eficiencia en el agua. Combina tiempo y
 *              brazadas por largo para mejorar tu técnica de natación. Compatible con piscinas
 *              de 25 m y 50 m.»
 *   bloque educativo: «SWOLF = tiempo (s) + brazadas» — cuanto más bajo, mejor.
 *
 * DÓNDE VIVE EL CÁLCULO — lib/calculadoras/deporte.ts → calcularSWOLF(tiempo_s_largo,
 * brazadas_largo, metros_largo = 25)
 *   · swolf = tiempo_s_largo + brazadas_largo                     (suma directa, sin redondeos)
 *   · ajuste = +8 en piscina de 50 m; cortes SIN ajustar: élite ≤ 25 · avanzado ≤ 30 ·
 *     intermedio ≤ 38 · el resto, principiante                     (bordes INCLUSIVOS)
 *   · velocidadMedia_m_s = metros_largo / tiempo_s_largo
 *   · velocidadMedia_min100m: se deriva de 100 / velocidadMedia_m_s, formateada m:ss
 *   · calcularSWOLF NO valida sus argumentos (a diferencia de calcularPotenciaCiclismo y
 *     calcularVatiosPorFuerzas, definidas en el MISMO fichero, que sí lanzan con peso/FTP/masa/
 *     velocidad ≤ 0): con tiempo_s_largo = 0 daría velocidadMedia_m_s = Infinity. El backstop
 *     vive solo en el componente (handleTiempo/handleBrazadas exigen n > 0) — ver CASO 3.
 *
 * NO hay botón «Calcular»: el resultado es reactivo (useMemo) sobre cada input.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — 25 m · 22 s · 16 brazadas (el propio ejemplo del bloque educativo:
 *     «Si tardas 22 segundos y das 16 brazadas, tu SWOLF es 38»)
 *       swolf = 22 + 16 = 38
 *       cortes 25 m: élite ≤ 25 · avanzado ≤ 30 · intermedio ≤ 38 → 38 ≤ 38 → «Intermedio»
 *         (borde inclusivo: 38 cae en intermedio, no en principiante)
 *       velocidadMedia_m_s = 25 / 22 = 1,136363… → redondeado a 1,14
 *       segundosPor100m = 100 / (25/22) = 2200/25 = 88,0 exacto
 *         min = floor(88/60) = 1 · seg = round(88 % 60) = 28 → «1:28 min/100m»
 *
 *   CASO 2 (límite — valor no realista que la app acepta sin aviso) — 25 m · 500 s · 100
 *     brazadas. El input declara max=300 (tiempo) y max=100 (brazadas) en el HTML, pero esos
 *     atributos son una sugerencia del navegador: handleTiempo/handleBrazadas solo exigen
 *     n > 0, sin techo. 500 s por largo (más de 8 minutos) y 100 brazadas son fisiológicamente
 *     imposibles, y aun así se calculan como si fueran un dato válido:
 *       swolf = 500 + 100 = 600
 *       600 > 38 (el corte más alto) → «Principiante», el mismo nivel que un SWOLF de 39
 *       velocidadMedia_m_s = 25 / 500 = 0,05
 *       segundosPor100m = 100 / 0,05 = 2000,0 → min = floor(2000/60) = 33 · seg = round(2000 %
 *         60) = 20 → «33:20 min/100m»
 *     No hay excepción, NaN ni Infinity: el motor no distingue esto de un dato real.
 *
 *   CASO 3 (rechazo) — entradas que no describen ningún largo nadado
 *       brazadas «0» (con tiempo > 0): handleBrazadas exige n > 0 → 0 no actualiza el estado.
 *         Al ser un input controlado, el campo revierte al último valor VÁLIDO y el panel de
 *         resultado no cambia.
 *       tiempo «-15»: mismo rechazo por el mismo guardián (n > 0).
 *       texto no numérico: un <input type="number"> ni siquiera permite teclear letras — el
 *         propio navegador descarta la pulsación antes de que React la vea.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS — REPARADOS el 31/08/2026
 *
 *   1 [dato/alto] El FAQPage de metadata.ts (lo que leen Bing Copilot, ChatGPT o Perplexity)
 *     daba para piscina de 25 m unos cortes que NO eran los de la calculadora:
 *       FAQ (antes): élite < 35 · avanzado 35–45 · intermedio 45–60 · principiante > 60
 *       app real:    élite ≤ 25 · avanzado 26–30 · intermedio 31–38 · principiante > 38
 *     Un SWOLF de 40 era «avanzado» según el FAQ y «Principiante» según la propia herramienta:
 *     dos veredictos contrarios sobre el mismo número. Reparado alineando el texto del FAQ con
 *     los cortes reales del motor (que ya coincidían con la tabla visible en la propia página).
 *
 *   2 [calculo/bajo] calcularSWOLF() no validaba sus argumentos, a diferencia de sus vecinas en
 *     el mismo fichero. NO era alcanzable desde la UI (el componente ya guarda n > 0), pero no
 *     había ningún backstop en el motor si algún día se le llamaba desde otro sitio con
 *     tiempo_s_largo = 0 o negativo (velocidadMedia_m_s = Infinity). Reparado con el mismo
 *     patrón que calcularPotenciaCiclismo/calcularVatiosPorFuerzas: lanza Error. Probado sin
 *     navegador, importando el motor directamente (ver el describe al final del fichero).
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
  await page.getByRole('button', { name: `${metros} m` }).click();
}

async function rellenar(
  page: Page,
  datos: { tiempo?: string; brazadas?: string },
): Promise<void> {
  if (datos.tiempo !== undefined) await tiempoInput(page).fill(datos.tiempo);
  if (datos.brazadas !== undefined) await brazadasInput(page).fill(datos.brazadas);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(tiempoInput(page)).toBeVisible();
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

test.describe('CASO 2 (límite) — 500 s y 100 brazadas: no realista, y la app lo acepta igual', () => {
  test('SWOLF 600 se clasifica como Principiante sin aviso ni error, con 33:20 min/100m', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '500', brazadas: '100' });

    // Los atributos max=300 / max=100 del HTML son una sugerencia del navegador: no hay techo
    // real en el manejador ni en el motor. swolf = 500 + 100 = 600.
    await expect(swolfScore(page)).toHaveText('600');
    await expect(nivelBadge(page)).toContainText('Principiante');
    await expect(detalle(page, 0)).toHaveText('Básica');
    // 25 / 500 = 0,05 m/s → 100 / 0,05 = 2000 s → 33 min 20 s
    await expect(detalle(page, 1)).toHaveText('33:20 min/100m');

    // No hay NaN, Infinity ni ningún indicio de que el dato es fisiológicamente imposible.
    const texto = await page.locator('main').innerText();
    expect(texto).not.toContain('NaN');
    expect(texto).not.toContain('Infinity');
    expect(texto).not.toMatch(/no realista|dato improbable|revisa (el|tu) (tiempo|dato)/i);
  });
});

test.describe('CASO 3 (rechazo) — entradas que no describen ningún largo nadado', () => {
  test('brazadas "0" no se acepta: el campo revierte y el resultado no cambia', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '500', brazadas: '100' });
    await expect(swolfScore(page)).toHaveText('600');

    await brazadasInput(page).fill('0');
    // handleBrazadas exige n > 0: con "0" no llama a setBrazadas, así que el estado (y por
    // tanto el input controlado) se queda en el último valor válido, 100.
    await expect(brazadasInput(page)).toHaveValue('100');
    await expect(swolfScore(page)).toHaveText('600');
    await expect(nivelBadge(page)).toContainText('Principiante');
  });

  test('tiempo negativo tampoco se acepta: mismo guardián, mismo resultado sin cambios', async ({
    page,
  }) => {
    await elegirPiscina(page, 25);
    await rellenar(page, { tiempo: '500', brazadas: '100' });
    await expect(swolfScore(page)).toHaveText('600');

    await tiempoInput(page).fill('-15');
    await expect(tiempoInput(page)).toHaveValue('500');
    await expect(swolfScore(page)).toHaveText('600');
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
 * REPARADO — HALLAZGO 1 (dato/alto): el FAQPage (JSON-LD) ya da los mismos rangos que la
 * propia calculadora en 25 m.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test(
  'el FAQPage (JSON-LD) da los mismos rangos de nivel que la propia calculadora en 25 m',
  async ({ page }) => {
    await page.goto(RUTA);

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
 * REPARADO — HALLAZGO 2 (calculo/bajo): calcularSWOLF() ya valida sus argumentos. No es
 * alcanzable desde la UI (el componente ya guarda n > 0 antes de llamar al motor), así que se
 * prueba importando el motor directamente, sin navegador — mismo patrón que
 * calcularPotenciaCiclismo/calcularVatiosPorFuerzas en el mismo fichero.
 * ═══════════════════════════════════════════════════════════════════════════════════════ */

test.describe('HALLAZGO 2 (calculo/bajo) — calcularSWOLF valida tiempo y brazadas > 0', () => {
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
