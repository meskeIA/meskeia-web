import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-fluidos-bernoulli (segmento cálculo/física, riesgo 3, 182 usos)
 *
 * Primera inspección: 26/08/2026. El <h1> promete «Simulador de Fluidos: Ecuación de
 * Bernoulli» y el subtítulo «Visualiza por qué más velocidad implica menos presión. Tubería
 * con manómetros y partículas animadas». La tarjeta de descripción es la promesa exacta que
 * se prueba aquí: «Aplicamos la ecuación de continuidad A·v = Q (constante) y la ecuación de
 * Bernoulli P + ½ρv² + ρgh = constante en un fluido ideal estacionario».
 *
 * Hay, por tanto, verdad física externa y comprobable: continuidad A₁v₁ = A₂v₂ = Q y
 * Bernoulli P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂. El build no ve la física mal, así que
 * todo lo de abajo se calculó A MANO con ρ y g explícitos ANTES de abrir el navegador.
 *
 * LA ρ QUE USA LA APP, Y SÍ LA DECLARA: se elige con cuatro botones y se imprime en el
 * rótulo del control y en una tarjeta del panel — Agua 1000, Aceite 920, Sangre 1060 y Aire
 * 1,225 kg/m³. Coincide con la tabla del bloque educativo salvo en el formato del aire
 * (HALLAZGO G) y en su temperatura (HALLAZGO H). La g NO se declara en ninguna parte de la
 * interfaz: está fija en el código (G = 9,81 m/s²) y solo interviene en la geometría con
 * desnivel; se verifica indirectamente en el HALLAZGO B (ρ·g·Δh = 1000·9,81·0,5 = 4905 Pa).
 * El diámetro nominal tampoco se declara ni se puede tocar: D₀ = 0,10 m fijo en las tres
 * geometrías, y solo se ajusta la razón D₂/D₁.
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-fluidos-bernoulli/page.tsx (no hay motor.ts)
 *   · getSecciones(geom, ratio, Δh): tres secciones por geometría, con D₀ = 0,10 m
 *       venturi     Entrada(D₀, h=0) · Garganta(D₀·ratio, h=0) · Salida(D₀, h=0)
 *       desnivel    Inferior(D₀, h=0) · Subida(D₀, h=Δh/2) · Superior(D₀, h=Δh)  ← sin
 *                   estrechamiento: el deslizador de razón ni siquiera se muestra
 *       estenosis   igual que venturi, con la transición más brusca en el dibujo
 *   · datos: A = π·(D/2)² · v = Q/A · P = P₁ + ½ρ(v₁²−v²) + ρg(h₁−h). Es Bernoulli despejado,
 *       y está bien despejado: los signos y el orden de los subíndices son los correctos.
 *   · fmt(n,d) = n.toFixed(d).replace('.', ',') — coma decimal y SIN separador de millares.
 *       fmtPresion(P) = kPa con 2 decimales si |P| ≥ 10000 Pa, si no Pa con 0 decimales.
 *       No usa lib/formatters, pero en el rango alcanzable ninguna cifra llega a los cinco
 *       dígitos que es-ES agruparía, salvo las ρ, que se imprimen CRUDAS: ahí sí falla (G).
 *   · Manómetro del canvas: columna de altura (|P| / máx|P|)·70 + 8 px.  ← origen del
 *       HALLAZGO A: normaliza al máximo absoluto y usa el VALOR ABSOLUTO.
 *   · updateParticulas: vNorm = (v_local / v_ref)·0,15, con v_local = Q/A_local y
 *       v_ref = Q/A₀. Q se cancela.  ← origen del HALLAZGO D.
 *   · Dibujo del desnivel: escalaY = (plotH·0,5) / máx(1, Δh).  ← origen del HALLAZGO C.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — Venturi horizontal con los valores de fábrica:
 *                     agua ρ = 1000 kg/m³ · Q = 2 L/s · D₂/D₁ = 0,50 · P₁ = 101325 Pa (1 atm)
 *       Q  = 2 L/s = 0,002 m³/s
 *       A₁ = π·(0,10/2)² = π·0,0025 = 7,853982·10⁻³ m² = 78,54 cm²
 *       A₂ = π·(0,05/2)² = π·0,000625 = 1,963495·10⁻³ m² = 19,63 cm²   (A₁/A₂ = 4 = 1/0,5²)
 *       CONTINUIDAD  v = Q/A:
 *         v₁ = 0,002 / 7,853982·10⁻³ = 0,254648 m/s      → «0,25 m/s»
 *         v₂ = 0,002 / 1,963495·10⁻³ = 1,018592 m/s      → «1,02 m/s»   (exactamente 4·v₁ ✔)
 *       BERNOULLI, tubo horizontal (h₁ = h₂ = 0, se cae el término ρgh):
 *         P₂ = P₁ + ½ρ(v₁² − v₂²)
 *            = 101325 + ½·1000·(0,254648² − 1,018592²)
 *            = 101325 + 500·(0,0648456 − 1,0375296)
 *            = 101325 + 500·(−0,972684)
 *            = 101325 − 486,342 = 100838,66 Pa           → «100,84 kPa»
 *         ΔP = P₂ − P₁ = −486,342 Pa                     → «−486 Pa»
 *       Y la salida vuelve a D₀, así que v₃ = v₁ y P₃ = P₁ = 101325 Pa → «101,33 kPa».
 *         Eso es CORRECTO en fluido ideal: sin viscosidad no hay pérdida que contabilizar.
 *         (Se comprueba a propósito: es la forma del fallo que sí tenía la app hermana
 *          simulador-conservacion-energia, donde el borde de la pista se comía la energía y
 *          la llamaba «disipada» con μ = 0. Aquí NO se reproduce: no hay ningún término de
 *          disipación, y el bloque educativo declara el modelo ideal en tres sitios.)
 *       Caudal másico = ρ·Q = 1000·0,002 = 2 kg/s        → «2,000 kg/s»
 *
 *   CASO 2 (límite) — los dos extremos que más aprietan, a la vez:
 *                     Q = 10 L/s (tope del deslizador) y D₂/D₁ = 0,25 (mínimo), agua
 *       A₂ = π·(0,025/2)² = π·1,5625·10⁻⁴ = 4,908739·10⁻⁴ m² = 4,91 cm²
 *       v₁ = 0,01 / 7,853982·10⁻³ =  1,273240 m/s        → «1,27 m/s»
 *       v₂ = 0,01 / 4,908739·10⁻⁴ = 20,371833 m/s        → «20,37 m/s»   (16·v₁ = 1/0,25² ✔)
 *       P₂ = 101325 + 500·(1,621139 − 415,011580)
 *          = 101325 + 500·(−413,390441)
 *          = 101325 − 206695,22 = −105370,22 Pa          → «-105,37 kPa»
 *       ΔP = −206695,22 Pa                               → «−206,70 kPa»
 *       La velocidad NO tiende a infinito: la razón mínima es 0,25, así que A₂ nunca es cero
 *       y v₂ topa en 20,37 m/s. Pero la presión ABSOLUTA sale negativa, que es físicamente
 *       imposible (el agua cavita hacia los 2,3 kPa a 20 °C) → HALLAZGO E, y de rebote
 *       HALLAZGO A, porque el manómetro dibuja |P|.
 *
 *   CASO 3 (rechazo) — la app no tiene ni un solo campo de texto: todo son deslizadores con
 *       min/max/step y botones. Lo que se comprueba es que esa barandilla existe de verdad y
 *       que ninguna entrada imposible se cuela:
 *         caudal negativo   Q = −5   → el control acepta 0,1 L/s (su mínimo)
 *         caudal nulo       Q =  0   → 0,1 L/s
 *         sección nula      D₂/D₁ = 0 → 0,25 (A₂ = 0 es INALCANZABLE, no hay Q/0)
 *         sección negativa  D₂/D₁ = −1 → 0,25
 *         presión nula      P₁ =  0  → 50 kPa
 *       y en ningún caso aparece NaN, Infinity ni ∞ en la tabla ni en el panel.
 *       El extremo alto también se comprueba, y ahí está el HALLAZGO F: D₂/D₁ = 1,00 es
 *       alcanzable y significa «sin estrechamiento» → ΔP = 0 exacto, que la app rotula
 *       «La presión sube».
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS ABIERTOS (Inspector, 26/08/2026). Los tests del bloque final FALLAN hoy a
 * propósito: describen lo que debería ocurrir, no lo que ocurre.
 *   A · alto  (cálculo)       el manómetro dibuja |P| normalizado: no ve la caída de fábrica
 *                             y, en el límite, hace la garganta la columna MÁS alta
 *   B · alto  (contenido)     en la tubería con desnivel, donde no hay estrechamiento, la
 *                             caída ρgΔh se rotula «CAE en el estrechamiento (paradoja
 *                             Bernoulli)» — mecanismo equivocado, y contra su propia tarjeta
 *   C · medio (operativa)     el dibujo del desnivel es IDÉNTICO de 1 a 10 m: nueve décimas
 *                             del deslizador no mueven un píxel del tubo
 *   D · medio (operativa)     la animación de partículas es independiente del caudal, y la
 *                             metadata la anuncia «fluyendo a velocidad real»
 *   E · medio (contenido)     presión absoluta negativa sin una palabra sobre cavitación
 *   F · medio (cálculo)       ΔP = 0 exacto se muestra «+0 Pa · La presión sube»
 *   G · medio (dato)          ρ del aire impresa «1.225 kg/m³» (formato US), que en español
 *                             se lee 1225 — y su propia tabla educativa escribe «1,225»
 *   H · bajo  (dato)          1,225 kg/m³ es el aire a 15 °C, no a 20 °C (que da 1,204)
 *   I · bajo  (operativa)     el deslizador de P₁ nace fuera de su propia rejilla: el estado
 *                             vale 101325 y el control 101000, y 1 atm no se puede recuperar
 *   J · bajo  (accesibilidad) cuatro <label> sin asociar y seis emojis sin aria-hidden
 * Sin test, porque la corrección es editorial y no hay cifra que fijar:
 *   K · bajo  (contenido)     «Vena con estenosis» hereda el D₀ = 0,10 m de la tubería
 *                             industrial (una aorta mide ~2,5 cm) y arranca con 2 L/s =
 *                             120 L/min, unas 24 veces el gasto cardíaco entero, mientras la
 *                             tarjeta la ofrece como «útil para entender Doppler vascular».
 */

const RUTA = '/simulador-fluidos-bernoulli/';

// ── Utilidades ───────────────────────────────────────────────────────────────────────────

/** Las tres filas de la tabla de secciones: [nombre, D(cm), A(cm²), v(m/s), P, h(m)]. */
async function tabla(page: Page): Promise<string[][]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('table tbody tr'))
      .slice(0, 3)
      .map((f) => Array.from(f.querySelectorAll('td')).map((td) => td.textContent!.trim())),
  );
}

/** Las cinco tarjetas del panel de resultados, cada una como [rótulo, valor, nota]. */
async function panel(page: Page): Promise<string[][]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="status"] > div')).map((t) =>
      Array.from(t.querySelectorAll('span')).map((s) => s.textContent!.trim()),
    ),
  );
}

/** Los rótulos visibles de los deslizadores, que llevan el valor en curso. */
async function rotulos(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('label'))
      .map((l) => l.textContent!.trim())
      .filter((t) => t.length < 120),
  );
}

/**
 * Mueve un deslizador. Playwright no puede escribir en un input[type=range], así que se usa
 * el setter nativo + evento input, que es lo que React escucha. Devuelve lo que el control
 * ACEPTA tras sanearlo el navegador, que no tiene por qué ser lo pedido: ahí está el caso 3.
 */
async function poner(page: Page, etiqueta: string, valor: number): Promise<string> {
  const aceptado = await page.evaluate(
    ([et, v]) => {
      const el = document.querySelector(`input[aria-label="${et}"]`) as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!
        .set!;
      setter.call(el, String(v));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return el.value;
    },
    [etiqueta, valor] as [string, number],
  );
  await page.waitForTimeout(250);
  return aceptado;
}

/**
 * Mide en el canvas la altura en píxeles de la columna del manómetro de cada sección.
 *
 * El manómetro se traza en #A82E68 (rgb 168,46,104) en la columna x de la sección, con el
 * mapeo del propio componente: xPx = 24 + xn·(ancho − 48). Se empieza a mirar en y = 41 para
 * dejar fuera la etiqueta de texto, que va del mismo color justo encima de la columna.
 */
async function manometros(page: Page, xs: number[]): Promise<number[]> {
  return page.evaluate((xn: number[]) => {
    const c = document.querySelector('canvas') as HTMLCanvasElement;
    const rect = c.getBoundingClientRect();
    const dpr = c.width / rect.width;
    const img = c.getContext('2d')!.getImageData(0, 0, c.width, c.height);
    const plotW = rect.width - 48; // pad.left + pad.right = 24 + 24
    return xn.map((x) => {
      const centro = 24 + x * plotW;
      let arriba = Number.MAX_SAFE_INTEGER;
      let abajo = -1;
      for (let dx = -3; dx <= 3; dx++) {
        const px = Math.round((centro + dx) * dpr);
        if (px < 0 || px >= c.width) continue;
        for (let py = Math.round(41 * dpr); py < c.height; py++) {
          const i = (py * c.width + px) * 4;
          const r = img.data[i];
          const g = img.data[i + 1];
          const b = img.data[i + 2];
          const a = img.data[i + 3];
          if (a > 100 && Math.abs(r - 168) < 40 && Math.abs(g - 46) < 40 && Math.abs(b - 104) < 40) {
            if (py < arriba) arriba = py;
            if (py > abajo) abajo = py;
          }
        }
      }
      return abajo < 0 ? 0 : Math.round((abajo - arriba) / dpr);
    });
  }, xs);
}

/**
 * Perfil horizontal de las partículas (#2E86AB = rgb 46,134,171): cuántas hay en cada columna
 * de píxeles, mirando solo por debajo de y = 150 para no contar los manómetros ni sus textos.
 */
async function perfilParticulas(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement;
    const dpr = c.width / c.getBoundingClientRect().width;
    const img = c.getContext('2d')!.getImageData(0, 0, c.width, c.height);
    const cols = new Array<number>(c.width).fill(0);
    for (let x = 0; x < c.width; x++) {
      for (let y = Math.round(150 * dpr); y < c.height; y++) {
        const i = (y * c.width + x) * 4;
        if (
          Math.abs(img.data[i] - 46) < 25 &&
          Math.abs(img.data[i + 1] - 134) < 25 &&
          Math.abs(img.data[i + 2] - 171) < 25
        ) {
          cols[x]++;
        }
      }
    }
    return cols;
  });
}

/** Desplazamiento en px que mejor alinea dos perfiles de partículas (correlación cruzada). */
function desplazamiento(a: number[], b: number[]): number {
  let mejor = 0;
  let maximo = -1;
  for (let s = 0; s <= 150; s++) {
    let acc = 0;
    for (let x = 0; x + s < a.length; x++) acc += a[x] * b[x + s];
    if (acc > maximo) {
      maximo = acc;
      mejor = s;
    }
  }
  return mejor;
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Simulador de Fluidos: Ecuación de Bernoulli',
  );
  // La tubería ya está calculada antes de tocar nada: la tabla no arranca vacía.
  await expect(page.locator('table tbody tr').first()).toContainText('Entrada');
  await page.waitForTimeout(400);
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 1 (normal) — Venturi de fábrica: continuidad da v₂ = 4·v₁ y Bernoulli, ΔP = −486 Pa
// ═════════════════════════════════════════════════════════════════════════════════════════

test('CASO 1 · Venturi de fábrica: v₂ = 1,02 m/s por continuidad y P₂ = 100,84 kPa por Bernoulli', async ({
  page,
}) => {
  // Los valores de fábrica son los que suponen las cuentas de la cabecera, y están declarados.
  const rots = await rotulos(page);
  expect(rots).toContain('Caudal (Q = 2,0 L/s)');
  expect(rots).toContain('Ratio de estrechamiento (D₂/D₁ = 0,50)');
  expect(rots).toContain('Presión entrada (P₁ = 101,3 kPa)');
  expect(rots.some((r) => r.startsWith('Fluido (ρ = 1000'))).toBe(true); // agua, ρ = 1000 kg/m³

  const filas = await tabla(page);

  // ENTRADA — A₁ = π·(0,10/2)² = 78,54 cm², v₁ = 0,002/7,853982·10⁻³ = 0,254648 m/s
  expect(filas[0]).toEqual(['Entrada', '10,0', '78,54', '0,25', '101,33 kPa', '0,00']);

  // GARGANTA — A₂ = π·(0,05/2)² = 19,63 cm², v₂ = 0,002/1,963495·10⁻³ = 1,018592 m/s = 4·v₁
  //            P₂ = 101325 + 500·(0,254648² − 1,018592²) = 101325 − 486,342 = 100838,66 Pa
  expect(filas[1]).toEqual(['Garganta', '5,0', '19,63', '1,02', '100,84 kPa', '0,00']);

  // SALIDA — vuelve a D₀, así que v₃ = v₁ y P₃ = P₁ EXACTAMENTE. En fluido ideal es correcto:
  // no hay viscosidad, luego no hay nada que disipar y la presión se recupera entera.
  expect(filas[2]).toEqual(['Salida', '10,0', '78,54', '0,25', '101,33 kPa', '0,00']);

  const tarjetas = await panel(page);
  expect(tarjetas[0][0]).toBe('Diferencia de presión P₂ − P₁ (de Entrada a Garganta)');
  expect(tarjetas[0][1]).toBe('−486 Pa'); // ½·1000·(v₁² − v₂²) = 500·(−0,972684)
  expect(tarjetas[0][2]).toContain('La presión CAE en el estrechamiento');
  expect(tarjetas[1][1]).toBe('2,000 kg/s'); // ρ·Q = 1000 · 0,002
  expect(tarjetas[2][1]).toBe('2,00 L/s');
  expect(tarjetas[2][2]).toBe('0,00200 m³/s'); // 2 L/s = 0,002 m³/s
  expect(tarjetas[3][1]).toBe('1,02 m/s'); // v máxima = Q/A_mín = la de la garganta
  expect(tarjetas[4][2]).toBe('Agua');

  // La continuidad se conserva de verdad: A·v es el mismo caudal en las tres secciones.
  for (const f of filas) {
    const A = parseFloat(f[2].replace(',', '.')) / 10000; // cm² → m²
    const v = parseFloat(f[3].replace(',', '.'));
    expect(Math.abs(A * v - 0.002)).toBeLessThan(0.00005); // Q = 0,002 m³/s
  }
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 2 (límite) — Q = 10 L/s y D₂/D₁ = 0,25, los dos extremos que más aprietan
// ═════════════════════════════════════════════════════════════════════════════════════════

test('CASO 2 · en el límite v₂ = 20,37 m/s y la presión absoluta se va a −105,37 kPa', async ({
  page,
}) => {
  // Los dos extremos son alcanzables de verdad, y el rótulo sigue al valor aceptado.
  expect(await poner(page, 'Caudal', 10)).toBe('10');
  expect(await poner(page, 'Ratio de estrechamiento', 0.25)).toBe('0.25');
  const rots = await rotulos(page);
  expect(rots).toContain('Caudal (Q = 10,0 L/s)');
  expect(rots).toContain('Ratio de estrechamiento (D₂/D₁ = 0,25)');

  const filas = await tabla(page);

  // v₁ = 0,01/7,853982·10⁻³ = 1,273240 m/s
  expect(filas[0]).toEqual(['Entrada', '10,0', '78,54', '1,27', '101,33 kPa', '0,00']);

  // A₂ = π·(0,025/2)² = 4,908739·10⁻⁴ m² = 4,91 cm²
  // v₂ = 0,01/4,908739·10⁻⁴ = 20,371833 m/s = 16·v₁ (= 1/0,25², la continuidad al cuadrado)
  // P₂ = 101325 + 500·(1,621139 − 415,011580) = 101325 − 206695,22 = −105370,22 Pa
  expect(filas[1]).toEqual(['Garganta', '2,5', '4,91', '20,37', '-105,37 kPa', '0,00']);
  expect(filas[2]).toEqual(['Salida', '10,0', '78,54', '1,27', '101,33 kPa', '0,00']);

  const tarjetas = await panel(page);
  expect(tarjetas[0][1]).toBe('−206,70 kPa'); // ΔP = −206695,22 Pa
  expect(tarjetas[3][1]).toBe('20,37 m/s');

  // La velocidad NO se dispara a infinito: A₂ está acotada por el mínimo del deslizador.
  const panelTexto = await page.locator('[role="status"]').innerText();
  expect(panelTexto).not.toContain('∞');
  expect(panelTexto).not.toContain('NaN');
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 3 (rechazo) — sección cero o negativa, caudal negativo y presión nula
// ═════════════════════════════════════════════════════════════════════════════════════════

test('CASO 3 · los imposibles se rechazan y quedan en el mínimo legal, sin NaN ni infinitos', async ({
  page,
}) => {
  // No hay ni un campo de texto: la barandilla es el min/max de cada deslizador.
  expect(await page.locator('input[type="text"], input[type="number"]').count()).toBe(0);

  expect(await poner(page, 'Caudal', -5)).toBe('0.1'); // caudal negativo
  expect(await poner(page, 'Caudal', 0)).toBe('0.1'); // caudal nulo → Q/A = 0, no divide mal
  expect(await poner(page, 'Ratio de estrechamiento', 0)).toBe('0.25'); // sección nula → Q/0
  expect(await poner(page, 'Ratio de estrechamiento', -1)).toBe('0.25'); // sección negativa
  expect(await poner(page, 'Presión de entrada', 0)).toBe('50000'); // presión nula

  const rots = await rotulos(page);
  expect(rots).toContain('Caudal (Q = 0,1 L/s)');
  expect(rots).toContain('Ratio de estrechamiento (D₂/D₁ = 0,25)');
  expect(rots).toContain('Presión entrada (P₁ = 50,0 kPa)');

  // Con Q = 0,1 L/s: v₁ = 0,0001/7,853982·10⁻³ = 0,012732 m/s → «0,01»
  //                  v₂ = 0,0001/4,908739·10⁻⁴ = 0,203718 m/s → «0,20»
  //                  P₂ = 50000 + 500·(0,00016210 − 0,04150116) = 50000 − 20,67 = 49979,33 Pa
  const filas = await tabla(page);
  expect(filas[0]).toEqual(['Entrada', '10,0', '78,54', '0,01', '50,00 kPa', '0,00']);
  expect(filas[1]).toEqual(['Garganta', '2,5', '4,91', '0,20', '49,98 kPa', '0,00']);

  const todo =
    (await page.locator('table').first().innerText()) +
    (await page.locator('[role="status"]').innerText());
  expect(todo).not.toContain('NaN');
  expect(todo).not.toContain('Infinity');
  expect(todo).not.toContain('∞');

  // Y por arriba tampoco se cuela nada: se topa en el máximo declarado.
  expect(await poner(page, 'Caudal', 999)).toBe('10');
  expect(await poner(page, 'Ratio de estrechamiento', 2)).toBe('1');
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS — estos tests FALLAN hoy. Describen lo que debería ocurrir.
// ═════════════════════════════════════════════════════════════════════════════════════════

// HALLAZGO A (cálculo, alto) · El manómetro se dibuja con altura (|P| / máx|P|)·70 + 8 px.
// Normalizar al máximo ABSOLUTO tiene dos consecuencias medidas, y la segunda invierte el
// mensaje entero de la app:
//   1. Con los valores de fábrica las presiones absolutas se diferencian en un 0,5 % (101325
//      frente a 100838,66 Pa), así que las tres columnas salen de la MISMA altura en píxeles.
//      El manómetro —la pieza que la leyenda llama «presión local» y la tarjeta de
//      descripción «manómetro diferencial»— no muestra la caída de 486 Pa que el panel
//      destaca en grande dos bloques más abajo.
//   2. Con Q = 10 L/s y D₂/D₁ = 0,25 la garganta cae a −105370 Pa, cuyo VALOR ABSOLUTO
//      (105370) supera al de la entrada (101325). La columna de la garganta pasa a ser la más
//      alta de las tres: el canvas afirma que donde menos presión hay es donde más marca el
//      manómetro. El paso 5 del propio bloque educativo pide comprobar justo lo contrario.
// Caso: por defecto → esperado columna de la garganta más corta · obtenido las tres iguales
//       (75 px) · Q=10 L/s + ratio 0,25 → esperado la más corta · obtenido la más ALTA (75 px
//       frente a 72 px de entrada y salida).
test('HALLAZGO A · el manómetro de la garganta es más corto que el de la entrada', async ({
  page,
}) => {
  // Las secciones del Venturi están en x normalizado 0,05 · 0,50 · 0,95.
  const fabrica = await manometros(page, [0.05, 0.5, 0.95]);
  expect(fabrica[1], 'con los valores de fábrica, ΔP = −486 Pa').toBeLessThan(fabrica[0]);

  await poner(page, 'Caudal', 10);
  await poner(page, 'Ratio de estrechamiento', 0.25);
  const limite = await manometros(page, [0.05, 0.5, 0.95]);
  expect(limite[1], 'en el límite, ΔP = −206,70 kPa').toBeLessThan(limite[0]);
});

// HALLAZGO B (contenido, alto) · En «Tubería con desnivel» el diámetro es constante y el
// deslizador de estrechamiento ni siquiera se muestra: la caída es ρ·g·Δh, energía potencial
// gravitatoria pura. Con Δh = 1 m son 1000·9,81·0,5 = 4905 Pa hasta la sección intermedia, y
// la app los rotula «⚠️ La presión CAE en el estrechamiento (paradoja Bernoulli)». No hay
// estrechamiento y no es la paradoja: es peso. La tarjeta de descripción de esa misma
// geometría, cuatro bloques más arriba, lo explica BIEN («Subir altura cuesta presión: parte
// del trabajo se transforma en energía potencial gravitatoria»), así que la app se contradice
// consigo misma y enseña el mecanismo equivocado en la cifra que muestra en grande.
// Caso: desnivel Δh = 1 m → esperado que la nota hable de altura o de ρgh · obtenido
//       «La presión CAE en el estrechamiento (paradoja Bernoulli)» con ΔP = −4905 Pa.
test('HALLAZGO B · con desnivel, la caída no se atribuye a un estrechamiento que no existe', async ({
  page,
}) => {
  await page.getByRole('button', { name: /Tubería con desnivel/ }).click();
  await poner(page, 'Desnivel', 1);

  // Que la cifra es ρgΔh/2 = 1000·9,81·0,5 = 4905 Pa lo confirma la propia tabla.
  const filas = await tabla(page);
  expect(filas.map((f) => f[5])).toEqual(['0,00', '0,50', '1,00']); // alturas
  const tarjetas = await panel(page);
  expect(tarjetas[0][1]).toBe('−4905 Pa');

  expect(await page.locator('input[aria-label="Ratio de estrechamiento"]').count()).toBe(0);
  expect(tarjetas[0][2]).not.toContain('estrechamiento');
});

// HALLAZGO C (operativa, medio) · El dibujo del desnivel escala con
// escalaY = (plotH·0,5) / máx(1, Δh), o sea que para cualquier Δh ≥ 1 m la subida ocupa
// SIEMPRE la misma mitad del canvas. Medido sobre el contorno del tubo en la franja x ∈
// [0,60 · 0,75] —elegida porque ahí no hay marcadores de sección ni manómetros— la firma de
// píxeles es idéntica para Δh = 1, 2, 5 y 10 m. Nueve décimas del recorrido del deslizador no
// mueven un solo píxel del tubo, y no hay escala ni cota que avise de la normalización: quien
// arrastre el control ve un canvas inerte aunque las cifras de la tabla sí cambien.
// Caso: Δh = 1 m vs Δh = 10 m → esperado dibujos distintos · obtenido idénticos (contorno del
//       tubo en [46,127] · [43,125] · [40,121] · [37,119] en los dos).
test('HALLAZGO C · el dibujo del tubo distingue un desnivel de 1 m de uno de 10 m', async ({
  page,
}) => {
  await page.getByRole('button', { name: /Tubería con desnivel/ }).click();
  await page.getByLabel(/Animación de partículas/).uncheck(); // el canvas ha de ser estable
  await page.waitForTimeout(300);

  const contorno = () =>
    page.evaluate(() => {
      const c = document.querySelector('canvas') as HTMLCanvasElement;
      const rect = c.getBoundingClientRect();
      const dpr = c.width / rect.width;
      const plotW = rect.width - 48;
      const x0 = Math.round((24 + 0.6 * plotW) * dpr);
      const x1 = Math.round((24 + 0.75 * plotW) * dpr);
      const img = c.getContext('2d')!.getImageData(x0, 0, x1 - x0, c.height);
      const cols: number[][] = [];
      for (let x = 0; x < img.width; x += 8) {
        let arriba = -1;
        let abajo = -1;
        for (let y = 0; y < c.height; y++) {
          if (img.data[(y * img.width + x) * 4 + 3] > 60) {
            if (arriba < 0) arriba = y;
            abajo = y;
          }
        }
        cols.push([Math.round(arriba / dpr), Math.round(abajo / dpr)]);
      }
      return cols;
    });

  await poner(page, 'Desnivel', 1);
  const unMetro = await contorno();
  await poner(page, 'Desnivel', 10);
  const diezMetros = await contorno();

  // Las cifras sí cambian: es solo el dibujo el que se queda quieto.
  expect((await tabla(page))[2][5]).toBe('10,00');
  expect(diezMetros).not.toEqual(unMetro);
});

// HALLAZGO D (operativa, medio) · updateParticulas calcula
// vNorm = (v_local / v_ref)·0,15, con v_local = Q/A_local y v_ref = Q/A₀: Q se cancela y solo
// queda A₀/A_local, que es pura geometría. La animación es, por tanto, exactamente la misma
// con 0,1 L/s que con 10 L/s — cien veces más caudal, cero diferencia. Medido por correlación
// cruzada del patrón de partículas, el desplazamiento es de ~25 px en ~0,16 s en los dos
// extremos. El rótulo de la casilla («más rápidas en zonas estrechas») sí es cierto, pero la
// metadata y el JSON-LD prometen «Animación de partículas fluyendo a velocidad real».
// Caso: Q = 0,1 L/s (v₁ = 0,013 m/s) y Q = 10 L/s (v₁ = 1,273 m/s) → esperado que el patrón
//       se mueva ~100 veces más deprisa en el segundo · obtenido 25 px en los dos.
test('HALLAZGO D · las partículas se mueven más deprisa cuando sube el caudal', async ({
  page,
}) => {
  const medir = async (q: number): Promise<number> => {
    await poner(page, 'Caudal', q);
    await page.waitForTimeout(700);
    const a = await perfilParticulas(page);
    await page.waitForTimeout(150);
    return desplazamiento(a, await perfilParticulas(page));
  };
  const lento = await medir(0.1); // v₁ = 0,0127 m/s
  const rapido = await medir(10); // v₁ = 1,2732 m/s, cien veces más

  expect(rapido).toBeGreaterThan(lento * 2);
});

// HALLAZGO E (contenido, medio) · Con Q = 10 L/s y D₂/D₁ = 0,25 la garganta sale a
// −105,37 kPa, y en «Tubería con desnivel» de 10 m con sangre la sección superior sale a
// −2661 Pa. Son presiones ABSOLUTAS negativas: físicamente imposibles. Mucho antes de llegar
// ahí el agua cavita (~2,3 kPa a 20 °C), que es justo el fenómeno que hace interesante un
// Venturi extremo. La página no dice «cavitación» en ninguna de sus 900 líneas, no avisa de
// que el resultado ha dejado de ser físico, y el paso 5 de su propio bloque educativo se
// titula «Verifica consistencia física». El número es correcto PARA EL MODELO ideal que la
// app declara; lo que falta es el aviso de que el modelo se ha salido de su dominio.
// Caso: Q = 10 L/s + ratio 0,25 → esperado un aviso de cavitación o de presión imposible ·
//       obtenido «-105,37 kPa» presentado como un resultado más.
test('HALLAZGO E · una presión absoluta negativa viene con su aviso de cavitación', async ({
  page,
}) => {
  await poner(page, 'Caudal', 10);
  await poner(page, 'Ratio de estrechamiento', 0.25);

  expect((await tabla(page))[1][4]).toBe('-105,37 kPa'); // P₂ = 101325 − 206695,22
  await expect(page.locator('body')).toContainText(/cavitaci[oó]n/i);
});

// HALLAZGO F (cálculo, medio) · La tarjeta de ΔP decide el texto con `dP < 0`, así que el
// caso ΔP = 0 cae en la rama del «sube». Y ΔP = 0 no es rebuscado: es el extremo alto de un
// deslizador (D₂/D₁ = 1,00, tubo recto) y el extremo bajo de otro (Δh = 0 m, tubo horizontal),
// los dos alcanzables de un tirón. La app muestra entonces «+0 Pa» junto a «La presión sube»
// mientras su propia tabla da las tres secciones a 101,33 kPa exactas. No sube: es la misma.
// Caso: D₂/D₁ = 1,00 → esperado «se mantiene» o equivalente · obtenido «+0 Pa · La presión
//       sube» (y lo mismo con Δh = 0 m en la geometría con desnivel).
test('HALLAZGO F · sin estrechamiento, ΔP = 0 no se anuncia como una subida de presión', async ({
  page,
}) => {
  expect(await poner(page, 'Ratio de estrechamiento', 1)).toBe('1');

  const filas = await tabla(page);
  expect(filas.map((f) => f[4])).toEqual(['101,33 kPa', '101,33 kPa', '101,33 kPa']);

  const tarjetas = await panel(page);
  expect(tarjetas[0][1]).toBe('+0 Pa');
  expect(tarjetas[0][2]).not.toContain('sube');
});

// HALLAZGO G (dato, medio) · La densidad se imprime cruda, `{rho} kg/m³`, sin pasar por fmt
// ni por lib/formatters, en el rótulo del selector de fluido y en la tarjeta «Densidad del
// fluido». Con Aire seleccionado eso da «1.225 kg/m³», que en español se lee mil doscientos
// veinticinco: el aire pasaría a ser más denso que el agua, que la misma pantalla muestra
// como «1000». Y la tabla del bloque educativo escribe el MISMO dato bien, «1,225», junto a
// la nota «Casi 1000 veces menos denso que el agua», así que la app se contradice en dos
// pantallazos. De paso, ninguna de las dos cifras lleva el separador de millares del español
// («1000» debería ser «1.000»).
// Caso: botón «Aire» → esperado «ρ = 1,225 kg/m³» · obtenido «ρ = 1.225 kg/m³», mientras la
//       tabla educativa de la misma página escribe «1,225».
test('HALLAZGO G · la densidad del aire se escribe en formato español', async ({ page }) => {
  await page.getByRole('button', { name: 'Aire', exact: true }).click();
  await page.waitForTimeout(300);

  // La tabla educativa lo escribe bien; el control, no.
  await expect(page.getByRole('row').filter({ hasText: 'Aire (a 20 °C)' })).toContainText('1,225');

  const rots = await rotulos(page);
  expect(rots.some((r) => r.includes('ρ = 1.225'))).toBe(false);
  expect((await panel(page))[4][1]).toBe('1,225 kg/m³');
});

// HALLAZGO H (dato, bajo) · La tabla de densidades del bloque educativo dice «Aire (a 20 °C)
// → 1,225 kg/m³». 1,225 kg/m³ es el valor de la Atmósfera Estándar Internacional a 15 °C y
// 1013,25 hPa; a 20 °C el aire seco vale 1,204 kg/m³, por ρ = P/(R·T) = 101325/(287,05·293,15).
// Es la misma ρ que usa el simulador, así que o la tabla dice 15 °C o el número es 1,204.
// Caso: fila «Aire» de la tabla educativa → esperado «1,204» a 20 °C (o «1,225» a 15 °C) ·
//       obtenido «Aire (a 20 °C) · 1,225».
test('HALLAZGO H · la temperatura de la densidad del aire cuadra con el valor tabulado', async ({
  page,
}) => {
  const fila = page.getByRole('row').filter({ hasText: /^Aire/ });
  const texto = (await fila.innerText()).replace(/\s+/g, ' ');
  expect(texto.includes('20 °C') && texto.includes('1,225')).toBe(false);
});

// HALLAZGO I (operativa, bajo) · El estado arranca en P0 = 101325 Pa (1 atm), pero el
// deslizador declara min=50000 y step=1000: su rejilla de valores válidos es 50000 + n·1000,
// donde 101325 no cae. El navegador sanea el atributo y el control nace en 101000 mientras el
// estado, el rótulo y todo el cálculo siguen en 101325 — pulgar y cifra discrepan desde la
// carga. Peor: en cuanto se toca el control, 1 atm deja de ser alcanzable, y es el único valor
// de referencia que el bloque educativo cita («1 atm = 101325 Pa»).
// Caso: al cargar → esperado que el DOM del deslizador valga 101325 · obtenido 101000, con el
//       rótulo diciendo «P₁ = 101,3 kPa» y la tabla calculando con 101325.
test('HALLAZGO I · el deslizador de presión nace en el mismo valor que el cálculo', async ({
  page,
}) => {
  const control = page.locator('input[aria-label="Presión de entrada"]');
  expect(await rotulos(page)).toContain('Presión entrada (P₁ = 101,3 kPa)');
  expect((await tabla(page))[0][4]).toBe('101,33 kPa'); // 101325 Pa, la que se usa de verdad
  expect(await control.inputValue()).toBe('101325');
});

// HALLAZGO J (accesibilidad, bajo, PASIVO anterior al candado) · Dos cosas:
//   1. Los cuatro <label> de los deslizadores no están asociados a su control: no llevan
//      htmlFor y no envuelven al input. Un lector de pantalla anuncia solo el aria-label
//      («Caudal»), nunca el valor con unidades que el rótulo visible sí lleva («Caudal
//      (Q = 2,0 L/s)»), y el clic en el texto no enfoca el deslizador.
//   2. Seis emojis van pegados al texto sin <span aria-hidden="true">: el ⚠️ de la tarjeta de
//      ΔP —que además vive dentro de una región role="status" aria-live="polite", así que se
//      relee entero en cada movimiento de deslizador— y los cinco 💡 de la FAQ.
//   Los <button> sí llevan todos type="button" y los aria-pressed están bien puestos.
// Caso: los cuatro deslizadores → esperado label asociado · obtenido cuatro <label> sueltos;
//       la tarjeta de ΔP → esperado el ⚠️ en un span aria-hidden · obtenido texto plano.
test('HALLAZGO J · los rótulos están asociados a su deslizador y los emojis van ocultos', async ({
  page,
}) => {
  const sueltos = await page.evaluate(() =>
    Array.from(document.querySelectorAll('label'))
      .filter((l) => !l.htmlFor && !l.querySelector('input,select,textarea'))
      .map((l) => l.textContent!.trim().slice(0, 40)),
  );
  expect(sueltos, 'rótulos sin asociar a su control').toEqual([]);

  const emojisSueltos = await page.evaluate(() => {
    const fuera: string[] = [];
    document.querySelectorAll('p,span,li,h4').forEach((el) => {
      el.childNodes.forEach((n) => {
        if (
          n.nodeType === Node.TEXT_NODE &&
          /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(n.nodeValue ?? '') &&
          (n.nodeValue ?? '').trim().length > 3
        ) {
          fuera.push((n.nodeValue ?? '').trim().slice(0, 40));
        }
      });
    });
    return [...new Set(fuera)];
  });
  expect(emojisSueltos, 'emojis junto a texto sin aria-hidden').toEqual([]);
});
