import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValorAcotado } from './_hidratacion';

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
 * DÓNDE VIVE EL CÁLCULO — app/simulador-fluidos-bernoulli/motor.ts desde el 23/09/2026 (en la
 *   inspección estaba en page.tsx; se MOVIÓ sin tocar una operación). Formato y dibujo, en page.tsx.
 *   · getSecciones(geom, ratio, Δh): tres secciones por geometría, con D₀ = 0,10 m
 *       venturi     Entrada(D₀, h=0) · Garganta(D₀·ratio, h=0) · Salida(D₀, h=0)
 *       desnivel    Inferior(D₀, h=0) · Subida(D₀, h=Δh/2) · Superior(D₀, h=Δh)  ← sin
 *                   estrechamiento: el deslizador de razón ni siquiera se muestra
 *       estenosis   igual que venturi, con la transición más brusca en el dibujo
 *   · datos: A = π·(D/2)² · v = Q/A · P = P₁ + ½ρ(v₁²−v²) + ρg(h₁−h). Es Bernoulli despejado,
 *       y está bien despejado: los signos y el orden de los subíndices son los correctos.
 *   · fmt(n,d) = formatNumber(n, d) con el menos tipográfico «−» (desde el 23/09/2026; en
 *       la inspección era n.toFixed(d).replace('.', ',') y la tabla salía con «-»). Lo que
 *       redondea a cero se da como 0, no como el «≈0» de formatNumber.
 *       fmtPresion(P) = kPa con 2 decimales si |P| ≥ 10000 Pa, si no Pa con 0 decimales.
 *       es-ES no agrupa los números de cuatro cifras («4905 Pa») y en el rango alcanzable
 *       ninguna cifra de fmt llega a cinco, salvo las ρ, que se imprimían CRUDAS (G).
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
 *          = 101325 − 206695,22 = −105370,22 Pa          → «−105,37 kPa»
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
 * HALLAZGOS del Inspector (26/08/2026), REPARADOS ese mismo día. Los tests del bloque
 * final se escribieron afirmando lo que DEBÍA ocurrir, así que la reparación los puso en
 * verde sin reescribirlos: son ya el contrato de que ninguno de los once vuelve.
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

/**
 * Los rótulos visibles de los controles, que llevan el valor en curso.
 *
 * Se leen los `<label>` Y los `span.controlLabel`: desde la reparación del hallazgo J el
 * rótulo del selector de fluido es un `<span>`, porque gobierna cuatro botones y no hay
 * ningún input al que apuntar con `htmlFor`. Un `<label>` sin `for` es texto suelto.
 */
async function rotulos(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('label, span[class*="controlLabel"]'))
      .map((l) => l.textContent!.trim())
      .filter((t) => t.length < 120),
  );
}

/**
 * Los cuatro deslizadores se localizan por `id`, no por `aria-label`.
 *
 * Desde la reparación del hallazgo J (26/08/2026) cada rótulo lleva `htmlFor` y su input el
 * `id` correspondiente, así que el nombre accesible del control es el texto VISIBLE —con su
 * valor y sus unidades, «Caudal (Q = 2,0 L/s)»— y ya no un `aria-label` fijo que se comía
 * esa información. Un `aria-label` residual habría vuelto a ganarle al rótulo.
 */
const CONTROL: Record<string, string> = {
  Caudal: 'ctrl-caudal',
  'Ratio de estrechamiento': 'ctrl-estrechamiento',
  Desnivel: 'ctrl-desnivel',
  'Presión de entrada': 'ctrl-presion-entrada',
};

/**
 * Mueve un deslizador y NO devuelve hasta comprobar que el valor llegó al ESTADO de React.
 * Devuelve lo que el control ACEPTA tras sanearlo el navegador, que no tiene por qué ser lo
 * pedido: ahí está el caso 3.
 *
 * El setter nativo + dispatchEvent alcanza a React siempre que React ya haya hidratado; si
 * llega antes, el evento se pierde y el DOM queda con un valor que el estado no tiene.
 *
 * ⚠️ Hasta el 12/09/2026 esto lo «resolvía» un bucle de hasta 20 reintentos cada 120 ms que
 * comparaba siempre el DOM CONSIGO MISMO (leía `el.value` y lo cotejaba con el `el.value` que
 * acababa de devolver la propia escritura), así que salía a la primera vuelta pasara lo que
 * pasara; y aunque hubiera mirado a React, reintentar con el MISMO valor nunca desatasca un
 * rastreador envenenado. Ahora se espera a la hidratación antes de sembrar y el testigo es el
 * valor con el que React ha renderizado el input (ver tests/apps/_hidratacion.ts).
 *
 * El respiro del final es lo ÚNICO que se conserva de aquel bucle, y responde a otra cosa: la
 * tabla y el panel los pinta React en el mismo render, pero el canvas —manómetros y partículas—
 * lo redibuja un efecto posterior, así que leerlo inmediatamente devuelve el dibujo anterior.
 */
async function poner(page: Page, etiqueta: string, valor: number): Promise<string> {
  const aceptado = await sembrarValorAcotado(page, `#${CONTROL[etiqueta] ?? etiqueta}`, valor);
  await page.waitForTimeout(120);
  return aceptado;
}

/**
 * Mide en el canvas la altura en píxeles de la columna del manómetro de cada sección.
 *
 * El manómetro se traza en #A82E68 (rgb 168,46,104) en la columna x de la sección, con el
 * mapeo del propio componente: xPx = 24 + xn·(ancho − 48). Se empieza a mirar en y = 41 para
 * dejar fuera la etiqueta de texto, que va del mismo color justo encima de la columna.
 * ⚠️ Solo en TEMA CLARO: desde el 28/09/2026 (hallazgo 2364) el tema oscuro lo pinta en
 * #F08CB4, y este detector no lo vería. Los tests que lo usan no cambian de tema.
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
  // Pero la tabla viaja en el HTML servido: que esté no dice que la app responda. Hay que
  // esperar a que React haya montado los deslizadores (ver tests/apps/_hidratacion.ts).
  // Solo los dos que existen con cualquier geometría: el de estrechamiento desaparece en
  // «desnivel» y el de desnivel solo aparece en ella, y basta con uno como testigo.
  await esperarHidratacion(page, [`#${CONTROL.Caudal}`, `#${CONTROL['Presión de entrada']}`]);
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
  // El español NO agrupa los millares de un número de cuatro cifras, así que el agua se
  // escribe «1000» y está bien. Lo que el formateador arregla es el aire: «1,225» y no
  // «1.225», que en español se leería mil doscientos veinticinco.
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
  expect(filas[1]).toEqual(['Garganta', '2,5', '4,91', '20,37', '−105,37 kPa', '0,00']);
  expect(filas[2]).toEqual(['Salida', '10,0', '78,54', '1,27', '101,33 kPa', '0,00']);

  const tarjetas = await panel(page);
  expect(tarjetas[0][1]).toBe('−206,70 kPa'); // ΔP = −206695,22 Pa
  const vMaxima = tarjetas.find((t) => t[0].startsWith('v máxima'));
  expect(vMaxima, 'tarjeta «v máxima»').toBeDefined();
  expect(vMaxima![1]).toBe('20,37 m/s');

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
  // Acotado a los CONTROLES del simulador el 23/09/2026: la sección «Casos para clase» trae
  // su casilla de respuesta (#casos-respuesta), que no gobierna la tubería.
  expect(
    await page.locator('input[type="text"]:not(#casos-respuesta), input[type="number"]').count(),
  ).toBe(0);

  // Entre los dos intentos de cada deslizador se vuelve a un valor legal A PROPÓSITO: si no, el
  // control ya estaría en su mínimo, el navegador dejaría ahí el segundo imposible igualmente y
  // React descartaría el evento por duplicado — la comprobación pasaría sin que nada se hubiera
  // movido (ver tests/apps/_hidratacion.ts).
  expect(await poner(page, 'Caudal', -5)).toBe('0.1'); // caudal negativo
  expect(await poner(page, 'Caudal', 2)).toBe('2'); // de vuelta al caudal de fábrica
  expect(await poner(page, 'Caudal', 0)).toBe('0.1'); // caudal nulo → Q/A = 0, no divide mal
  expect(await poner(page, 'Ratio de estrechamiento', 0)).toBe('0.25'); // sección nula → Q/0
  expect(await poner(page, 'Ratio de estrechamiento', 0.5)).toBe('0.5'); // el de fábrica
  expect(await poner(page, 'Ratio de estrechamiento', -1)).toBe('0.25'); // sección negativa
  // 50.325 Pa: la rejilla se construye desde 1 atm hacia abajo, de 1 kPa en 1 kPa, para que
  // 101.325 sea alcanzable (hallazgo I). El mínimo es el que resulta de esa rejilla.
  expect(await poner(page, 'Presión de entrada', 0)).toBe('50325'); // presión nula

  const rots = await rotulos(page);
  expect(rots).toContain('Caudal (Q = 0,1 L/s)');
  expect(rots).toContain('Ratio de estrechamiento (D₂/D₁ = 0,25)');
  expect(rots).toContain('Presión entrada (P₁ = 50,3 kPa)'); // 50.325 Pa, el suelo de la rejilla

  // Con Q = 0,1 L/s: v₁ = 0,0001/7,853982·10⁻³ = 0,012732 m/s → «0,01»
  //                  v₂ = 0,0001/4,908739·10⁻⁴ = 0,203718 m/s → «0,20»
  //                  P₂ = 50325 + 500·(0,00016210 − 0,04150116) = 50325 − 20,67 = 50304,33 Pa
  const filas = await tabla(page);
  expect(filas[0]).toEqual(['Entrada', '10,0', '78,54', '0,01', '50,33 kPa', '0,00']);
  expect(filas[1]).toEqual(['Garganta', '2,5', '4,91', '0,20', '50,30 kPa', '0,00']);

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
// REGRESIÓN de los hallazgos 397-407, reparados el 26/08/2026. Se escribieron afirmando lo
// que DEBÍA ocurrir, así que la reparación los puso en verde sin reescribirlos: son ya el
// contrato de que ninguno de los once vuelve.
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

  expect(await page.locator('#ctrl-estrechamiento').count()).toBe(0);
  expect(tarjetas[0][2]).not.toContain('estrechamiento');
  // Y la fórmula de la nota es la de la cifra: la tarjeta compara con la sección INTERMEDIA
  // (h₂ = Δh/2), así que «ρ·g·Δh» con el Δh del deslizador daba el doble, 9.810 Pa (23/09/2026).
  expect(tarjetas[0][2]).toContain('ρ·g·(h₂ − h₁)');
  expect(tarjetas[0][2]).not.toContain('ρ·g·Δh');
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

  expect((await tabla(page))[1][4]).toBe('−105,37 kPa'); // P₂ = 101325 − 206695,22
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
  // Sin signo: «+0 Pa» era la mitad del hallazgo, porque el cero no sube ni baja.
  expect(tarjetas[0][1]).toBe('0 Pa');
  expect(tarjetas[0][2]).not.toContain('sube');
  expect(tarjetas[0][2]).toContain('Sin estrechamiento no hay caída');
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
  const tablaEducativa = (await page.locator('body').textContent()) ?? '';
  expect(tablaEducativa).toContain('Aire (a 15 °C, atmósfera estándar)');
  expect(tablaEducativa).not.toContain('Aire (a 20 °C)');

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
  // El bloque educativo llega plegado dentro de un <details>, así que sus filas no exponen
  // role="row" y hay que leerlas por textContent.
  const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
  // 1,225 kg/m³ es el valor de la Atmósfera Estándar Internacional a 15 °C; a 20 °C el aire
  // seco vale 1,204 (ρ = P/(R·T) = 101325/(287,05·293,15)). Como el simulador calcula con
  // 1,225, la tabla dice 15 °C.
  expect(cuerpo).toContain('Aire (a 15 °C, atmósfera estándar)');
  expect(cuerpo.includes('Aire (a 20 °C)')).toBe(false);
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
  const control = page.locator('#ctrl-presion-entrada');
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (23/09/2026) — la tarea asignable de esta app (tipo A, casos numerados).
 *
 * El cálculo vivía dentro de un useMemo que leía el estado de React. Se EXTRAJO a una función
 * pura y el useMemo la llama; getSecciones, FLUIDOS, G y P_ATMOSFERICA se MOVIERON:
 *   app/simulador-fluidos-bernoulli/motor.ts   ← calcularSecciones, presionBernoulli, …
 *   app/simulador-fluidos-bernoulli/casos.ts   ← los 12 casos, el corrector y el aleatorio
 * La tabla del acta de arriba (100,84 kPa en la garganta de fábrica) sigue saliendo igual: el
 * traslado no movió un número.
 *
 * CONVENIO DE ESTA APP (el que más confunde en el tema):
 *   · presiones ABSOLUTAS (P₁ = 101.325 Pa de fábrica); los casos que piden una presión, y no
 *     una diferencia, dicen «absoluta» en el enunciado;
 *   · g = 9,81 m/s² — solo lo declaran los casos cuya respuesta cambia con g = 10 (8 y 9);
 *   · caudal en L/s (1 L/s = 0,001 m³/s), diámetro nominal 10 cm.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (a mano; A = π·D²/4):
 *   1 · A = 78,54 cm², v = 0,002/0,0078540 = 0,2546 → dos decimales         = 0,25 m/s
 *   2 · A₁/A₂ = (10/5)² = 4 → v₂ = 1,5·4                                      = 6 m/s
 *   3 · D₂ = D₁·√(v₁/v₂) = 2·√(1,5/6) = 2·0,5                                 = 1 cm
 *   4 · v₁ = 0,254648, v₂ = 4·v₁ = 1,018592; ΔP = 500·(v₁² − v₂²) = −486,34  → −486 Pa
 *   5 · v₁ = 0,01/0,0078540 = 1,27324, v₂ = v₁/0,4² = 7,95775
 *       P₂ = 101.325 + 500·(1,62114 − 63,32574) = 70.472,7 Pa                → 70,47 kPa
 *   6 · el mismo Venturi con aire: 0,6125·(1,62114 − 63,32574) = −37,79      → −38 Pa
 *   7 · ṁ = ρ·Q = 920·0,0025                                                  = 2,3 kg/s
 *   8 · diámetro constante, sube 3 m: ΔP = −ρ·g·Δh = −1000·9,81·3 = −29.430  → −29,43 kPa
 *   9 · aceite, sube 5 m: 101.325 − 920·9,81·5 = 101.325 − 45.126 = 56.199   → 56,20 kPa
 *  10 · v₂/v₁ = (D₁/D₂)² = 1/0,4²                                             = 6,25
 *  11 · sangre, 10→5 cm, 2 L/s: 530·(0,064846 − 1,037530) = −515,52         → −516 Pa
 *  12 · 7500 = ½·1000·(16 − 1)·v₁² → v₁ = 1 m/s → Q = 0,0078540 m³/s        → 7,85 L/s
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import {
  CASOS as CASOS_AULA,
  TOTAL_CASOS as TOTAL_CASOS_AULA,
  resolverCaso,
  comprobarRespuesta,
  toleranciaDe,
  generarEjercicioAleatorio,
  configuracionSimulador,
} from '../../app/simulador-fluidos-bernoulli/casos';
import {
  G,
  P_ATMOSFERICA,
  calcularSecciones,
  getSecciones,
  presionBernoulli,
} from '../../app/simulador-fluidos-bernoulli/motor';

const A_MANO_AULA: Readonly<Record<number, number>> = {
  1: 0.25,
  2: 6,
  3: 1,
  4: -486,
  5: 70.47,
  6: -38,
  7: 2.3,
  8: -29.43,
  9: 56.2,
  10: 6.25,
  11: -516,
  12: 7.85,
};

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («70,47 kPa» → 2). */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

const redondeo = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

test.describe('simulador-fluidos-bernoulli · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS_AULA).toBe(12);
    expect(CASOS_AULA.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS_AULA) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS_AULA) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(redondeo(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS_AULA) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?)\b/i;
    for (const caso of CASOS_AULA) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', async () => {
    // Lección de simulador-trigonometria-circulo-unitario (21/09/2026): «redondea a 2
    // decimales» en el enunciado y cuatro en la solución.
    for (const caso of CASOS_AULA) {
      const decimales = caso.datos.decimales ?? 2;
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
      if (!exacto) {
        expect(caso.enunciado, `caso ${caso.id}: se redondea y el enunciado no lo pide`).toMatch(/redonde|decimal|unidades/i);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.magnitud)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta)).toBe(true);
      expect(redondeo(resolverCaso(m.datos).valor, m.datos.decimales ?? 2)).toBe(m.respuesta);
      // Todos se pueden cargar en el simulador: si no, el alumno no podría comprobarlos.
      expect(configuracionSimulador(m.datos)).not.toBeNull();
    }
  });

  test('7 · el convenio queda fijado: presión ABSOLUTA, g = 9,81 y la tabla de la app', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS_AULA) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_AULA[caso.id]);
    }

    // (b) Las constantes del convenio.
    expect(G).toBe(9.81);
    expect(P_ATMOSFERICA).toBe(101325);

    // (c) La garganta del Venturi de fábrica con el motor movido: la MISMA cifra que la tabla
    // del acta de arriba (100,84 kPa), y absoluta: parte de 1 atm, no de cero.
    const fabrica = calcularSecciones(getSecciones('venturi', 0.5, 2), 0.002, 1000, P_ATMOSFERICA);
    expect(fabrica[1].P).toBeCloseTo(100838.66, 1);
    expect(fabrica[1].v / fabrica[0].v).toBeCloseTo(4, 10);

    // (d) g solo pesa donde hay desnivel: con g = 10 el caso 8 daría −30,00 kPa y suspende.
    expect(presionBernoulli(0, 1000, 0.25, 0, 0.25, 3, 10)).toBeCloseTo(-30000, 6);
    expect(comprobarRespuesta(-30, -29.43).correcto).toBe(false);

    // (e) El olvido clásico del caso 5: restar solo ½ρv₂² sin el v₁² de la entrada.
    const olvido = (101325 - 500 * 7.95775 ** 2) / 1000; // 69,66 kPa
    expect(comprobarRespuesta(olvido, 70.47).correcto).toBe(false);
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    expect(comprobarRespuesta(-486, -486).correcto).toBe(true);
    expect(comprobarRespuesta(NaN, 6).correcto).toBe(false);
    expect(comprobarRespuesta(486, -486).motivo).toMatch(/signo/i);
    // Hallazgo 3424: la relativa (el mayor entre 0,01 y el 1 %) solo donde hay que redondear;
    // una respuesta exacta a los decimales pedidos tiene tolerancia 0.
    expect(toleranciaDe(-486.34, 0)).toBeCloseTo(4.8634, 10); // caso 4: −486,34 → −486
    expect(toleranciaDe(0.2546, 2)).toBe(0.01); // caso 1: el 1 % no llega a 0,01
    expect(toleranciaDe(2.3, 1)).toBe(0); // caso 7: 920·0,0025, exacto
    expect(toleranciaDe(6.25, 2, true)).toBeCloseTo(0.0625, 10); // caso 10: manda arrastrar
  });
});

test.describe('simulador-fluidos-bernoulli · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  test('el caso 5 se carga en el simulador y la garganta da la cifra de la solución', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 5:/ }).click();
    await seccion(page).getByRole('button', { name: /Cargar en el simulador/ }).click();
    // 10 L/s, D₂/D₁ = 0,4, agua: P₂ = 70.472,7 Pa absolutos → «70,47 kPa» en la tabla.
    const filas = await tabla(page);
    expect(filas[1][0]).toBe('Garganta');
    expect(filas[1][4]).toBe('70,47 kPa');

    await seccion(page).locator('#casos-respuesta').fill('70,47');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('Correcto');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 28/09/2026 — RE-INSPECCIÓN tras los cambios del 23/09 (casos para clase, motor.ts,
 * `fmt` con formatNumber, `fluidoPorId`, la nota ρ·g·(h₂ − h₁) del desnivel). 746 usos en 30 días.
 *
 * Los once hallazgos del 26/08 (397-407) siguen reparados: los tests A-J de arriba pasan en
 * verde contra el build de HEAD, y el aviso de escala de la estenosis (K) sigue en el bloque
 * educativo. Ninguno ha vuelto.
 *
 * CASOS NUEVOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (A = π·D²/4, g = 9,81 m/s²):
 *
 *   N (normal) · Venturi, ACEITE ρ = 920 kg/m³, Q = 4 L/s, D₂/D₁ = 0,6, P₁ = 101.325 Pa
 *       A₁ = π·0,05² = 7,853982·10⁻³ m² (78,54 cm²) → v₁ = 0,004/A₁ = 0,509296 m/s → «0,51»
 *       A₂ = π·0,03² = 2,827433·10⁻³ m² (28,27 cm²) → v₂ = v₁/0,6² = 1,414711 m/s → «1,41»
 *       ΔP = ½·920·(0,259382 − 2,001407) = 460·(−1,742025) = −801,33 Pa → «−801 Pa»
 *       P₂ = 101.325 − 801,33 = 100.523,67 Pa → «100,52 kPa» · ṁ = 920·0,004 = 3,68 → «3,680 kg/s»
 *       (ρ del aceite: 910-930 kg/m³ para aceites vegetales a 20 °C, la horquilla que da la
 *        propia tabla educativa y la habitual en tablas de propiedades de fluidos.)
 *
 *   L1 (límite, la frontera del aviso de cavitación) · desnivel 10 m, agua
 *       P₁ = 101.325 → P₃ = 101.325 − 1000·9,81·10 = 101.325 − 98.100 = 3.225 Pa → «3225 Pa»,
 *                     por ENCIMA de la presión de vapor (2.339 Pa a 20 °C): sin aviso
 *       P₁ = 100.325 (un paso menos) → P₃ = 2.225 Pa → «2225 Pa», por DEBAJO: «Zona de
 *                     cavitación», sin llamarla «presión absoluta negativa»
 *
 *   L2 (límite, presión absoluta negativa) · Venturi agua, Q = 10 L/s, D₂/D₁ = 0,35, P₁ = 50.325
 *       A₂ = π·0,0175² = 9,621128·10⁻⁴ m² → v₂ = 10,393787 m/s, v₂² = 108,0308
 *       ΔP = 500·(1,621139 − 108,0308) = −53.204,9 Pa → «−53,20 kPa»
 *       P₂ = 50.325 − 53.204,9 = −2.879,9 Pa → «−2880 Pa» + «Cavitación segura»
 *
 *   R (rechazo) · Δh = −3 m → el deslizador lo deja en 0 y ΔP = 0 («Sin desnivel no hay
 *       caída») · P₁ = 1.000.000 Pa → tope de la rejilla, 101.325 + 198·1000 = 299.325 Pa ·
 *       «12abc» en la casilla de un caso → «Escribe un número», sin NaN.
 *
 *   Casos de aula resueltos a mano (superficie nueva del 23/09):
 *     9 · P₃ = 101.325 − 920·9,81·5 = 101.325 − 45.126 = 56.199 Pa → 56,20 kPa. Con la ρ del
 *         agua saldría 101.325 − 49.050 = 52.275 → 52,28, fuera del 1 % (0,56 kPa): suspende.
 *    12 · 7.500 = ½·1000·(4² − 1)·v₁² → v₁² = 1 → v₁ = 1 m/s → Q = A₁·v₁ = 7,854 L/s → 7,85.
 *         Olvidar el cuadrado del diámetro (v₂ = 2·v₁): v₁ = √(2·7500/(1000·3)) = 2,2361 →
 *         Q = 17,56 L/s, que debe suspender.
 *
 * HALLAZGOS de esta inspección (2363-2369): nacieron como `test.fail()` «ABIERTO» y se
 * REPARARON el 28/09/2026 (el 2367, en la raíz: globals.css). Los tests del final afirman ya
 * lo correcto, en los dos temas donde el acta miraba uno solo.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import { esperarValorEnReact } from './_hidratacion';

/**
 * Contraste WCAG del texto de `selector` contra su fondo REAL: compone los fondos
 * semitransparentes de los antecesores hasta dar con uno opaco (la tarjeta de ΔP es un teal
 * al 15 % sobre la tarjeta del panel).
 */
async function contrasteDe(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    type Rgba = { r: number; g: number; b: number; a: number };
    const leer = (s: string): Rgba | null => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (fg: Rgba, bg: Rgba): Rgba => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });
    const lum = (c: Rgba) => {
      const f = (v: number) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const el = document.querySelector(sel) as HTMLElement;
    const capas: Rgba[] = [];
    let n: HTMLElement | null = el;
    while (n) {
      const c = leer(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) capas.push(c);
      if (c && c.a === 1) break;
      n = n.parentElement;
    }
    let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    const texto = sobre(leer(getComputedStyle(el).color)!, fondo);
    const [a, b] = [lum(texto), lum(fondo)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, selector);
}

test.describe('Inspector 28/09/2026 — re-inspección tras los casos de aula', () => {
  const seccionCasos = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  /** Escribe en la casilla del caso, espera a que React lo tenga y pulsa «Comprobar». */
  async function responder(page: Page, texto: string): Promise<string> {
    const casilla = seccionCasos(page).locator('#casos-respuesta');
    await casilla.fill(texto);
    await esperarValorEnReact(page, casilla, texto);
    await seccionCasos(page).getByRole('button', { name: 'Comprobar' }).click();
    // Acotado a la sección: getByRole('alert') a secas casaría con el anunciador de rutas de Next.
    const veredicto = seccionCasos(page).getByRole('alert');
    await expect(veredicto).toBeVisible();
    return ((await veredicto.textContent()) ?? '').trim();
  }

  test('N · Venturi con aceite, 4 L/s y D₂/D₁ = 0,6: v₂ = 1,41 m/s y ΔP = −801 Pa', async ({ page }) => {
    await page.getByRole('button', { name: 'Aceite', exact: true }).click();
    expect(await poner(page, 'Caudal', 4)).toBe('4');
    expect(await poner(page, 'Ratio de estrechamiento', 0.6)).toBe('0.6');

    const filas = await tabla(page);
    // v₁ = 0,004/7,853982·10⁻³ = 0,509296 m/s
    expect(filas[0]).toEqual(['Entrada', '10,0', '78,54', '0,51', '101,33 kPa', '0,00']);
    // A₂ = π·0,03² = 28,27 cm² · v₂ = 1,414711 m/s · P₂ = 101.325 − 801,33 = 100.523,67 Pa
    expect(filas[1]).toEqual(['Garganta', '6,0', '28,27', '1,41', '100,52 kPa', '0,00']);
    expect(filas[2]).toEqual(['Salida', '10,0', '78,54', '0,51', '101,33 kPa', '0,00']);

    const tarjetas = await panel(page);
    expect(tarjetas[0][1]).toBe('−801 Pa'); // ½·920·(0,259382 − 2,001407) = −801,33 Pa
    expect(tarjetas[1][1]).toBe('3,680 kg/s'); // ρ·Q = 920 · 0,004
    expect(tarjetas[4][1]).toBe('920 kg/m³');
    expect(tarjetas[4][2]).toBe('Aceite');
  });

  test('L1 · el aviso de cavitación salta entre 3225 Pa y 2225 Pa, la presión de vapor en medio', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Tubería con desnivel/ }).click();
    expect(await poner(page, 'Desnivel', 10)).toBe('10');
    const aviso = page.locator('[role="status"] [role="note"]');

    // P₃ = 101.325 − 1000·9,81·10 = 3.225 Pa: por encima de los 2.339 Pa de vapor → sin aviso
    expect((await tabla(page))[2][4]).toBe('3225 Pa');
    await expect(aviso).toHaveCount(0);

    // Un paso de la rejilla menos: P₁ = 100.325 → P₃ = 2.225 Pa, ya por debajo
    expect(await poner(page, 'Presión de entrada', 100325)).toBe('100325');
    expect((await tabla(page))[2][4]).toBe('2225 Pa');
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toContainText('Zona de cavitación');
    await expect(aviso).toContainText('2225 Pa');
    // Es positiva: no puede anunciarse como presión absoluta negativa.
    await expect(aviso).not.toContainText('negativa');
  });

  test('L2 · Venturi a 10 L/s, D₂/D₁ = 0,35 y P₁ = 50.325 Pa: la garganta cae a −2880 Pa', async ({
    page,
  }) => {
    expect(await poner(page, 'Caudal', 10)).toBe('10');
    expect(await poner(page, 'Ratio de estrechamiento', 0.35)).toBe('0.35');
    expect(await poner(page, 'Presión de entrada', 50325)).toBe('50325');

    const filas = await tabla(page);
    // A₂ = π·0,0175² = 9,62 cm² · v₂ = 0,01/9,621128·10⁻⁴ = 10,393787 m/s
    // P₂ = 50.325 + 500·(1,621139 − 108,0308) = 50.325 − 53.204,9 = −2.879,9 Pa
    expect(filas[1]).toEqual(['Garganta', '3,5', '9,62', '10,39', '−2880 Pa', '0,00']);
    expect((await panel(page))[0][1]).toBe('−53,20 kPa'); // ΔP = −53.204,9 Pa

    const aviso = page.locator('[role="status"] [role="note"]');
    await expect(aviso).toContainText('Cavitación segura');
    await expect(aviso).toContainText('presión absoluta negativa');
    await expect(aviso).toContainText('−2880 Pa');
  });

  test('R · desnivel negativo, presión desbocada y basura en la casilla se rechazan sin NaN', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Tubería con desnivel/ }).click();
    // De 2 m (fábrica) a −3: el control lo deja en su mínimo, 0 m → tubo horizontal
    expect(await poner(page, 'Desnivel', -3)).toBe('0');
    const tarjetas = await panel(page);
    expect(tarjetas[0][1]).toBe('0 Pa');
    expect(tarjetas[0][2]).toContain('Sin desnivel no hay caída');
    expect((await tabla(page)).map((f) => f[4])).toEqual(['101,33 kPa', '101,33 kPa', '101,33 kPa']);

    // 1.000.000 Pa → tope de la rejilla: 101.325 + 198·1000 = 299.325 Pa
    expect(await poner(page, 'Presión de entrada', 1000000)).toBe('299325');

    const basura = await responder(page, '12abc');
    expect(basura).toContain('Escribe un número');
    expect(basura).not.toContain('NaN');
  });

  test('Casos 9 y 12 de aula, resueltos a mano: 56,20 kPa y 7,85 L/s', async ({ page }) => {
    // CASO 9 — aceite, 3 L/s, sube 5 m: P₃ = 101.325 − 920·9,81·5 = 56.199 Pa → 56,20 kPa
    await seccionCasos(page).getByRole('button', { name: /^Caso 9:/ }).click();
    await seccionCasos(page).getByRole('button', { name: /Cargar en el simulador/ }).click();
    const filas = await tabla(page);
    expect(filas[2][0]).toBe('Superior');
    expect(filas[2][4]).toBe('56,20 kPa');
    expect(filas[2][5]).toBe('5,00');
    expect(await responder(page, '56,2')).toContain('Correcto');
    // Con la ρ del AGUA: 101.325 − 49.050 = 52.275 Pa → 52,28, a 3,92 del valor (tolerancia 0,56)
    expect(await responder(page, '52,28')).not.toContain('Correcto');

    // CASO 12 — 7500 = ½·1000·15·v₁² → v₁ = 1 m/s → Q = π·0,05²·1 = 7,854 L/s → 7,85
    await seccionCasos(page).getByRole('button', { name: /^Caso 12:/ }).click();
    expect(await responder(page, '7,85')).toContain('Correcto');
    // Sin el cuadrado del diámetro (v₂ = 2·v₁): v₁ = √5 = 2,2361 m/s → Q = 17,56 L/s
    expect(await responder(page, '17,56')).not.toContain('Correcto');
  });

  test('Los once reparados del 26/08: el aviso de escala de la estenosis (K) sigue en su sitio', async ({
    page,
  }) => {
    const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(cuerpo).toContain('La escala de esta geometría no es fisiológica.');
  });

  // ── HALLAZGOS 2363-2369 — REPARADOS (28/09/2026) ──────────────────────────────────────────
  // Los siete nacieron como `test.fail()` «ABIERTO». La reparación les quitó la marca y, donde
  // el acta solo miraba un tema o un elemento, amplió la aserción al otro tema y a los
  // elementos hermanos con el mismo defecto (título de la caja de avisos, etiquetas del canvas).

  test('HALLAZGO 2367 · las cuatro cajas con --radius-large y --shadow-md tienen radio y sombra', async ({
    page,
  }) => {
    // REPARADO (28/09/2026), en la raíz: SimuladorFluidosBernoulli.module.css usa
    // `var(--radius-large)` (4 veces) y `var(--shadow-md)` (2) sin valor de reserva, y NINGUNA
    // de las dos existía en globals.css (que define --radius y --shadow-medium): una var() sin
    // definir anula la declaración entera, y el hero, los tres botones de geometría, la tarjeta
    // principal y la sección de casos salían con esquinas a 0 px y sin sombra. globals.css
    // declara ahora --radius-large: 16px y --shadow-sm/md/lg como alias de las existentes, que
    // heredan su variante oscura (commit d608b1ac; 115 módulos usaban esas variables).
    // En la app se retiró además `[data-theme='dark'] .casosSection { box-shadow: none }`,
    // escrito cuando la sombra no existía: la sección de casos se comporta ya como la tarjeta
    // principal en los dos temas. Caso: carga en claro y en oscuro → border-radius > 0 en las
    // cuatro cajas y box-shadow distinto de «none» en mainContent y casosSection.
    const medir = () =>
      page.evaluate(() =>
        [
          'header[class*="hero"]',
          'button[class*="geomBtn"]',
          'div[class*="mainContent"]',
          'section[class*="casosSection"]',
        ].map((s) => {
          const cs = getComputedStyle(document.querySelector(s) as HTMLElement);
          return { s, radio: parseFloat(cs.borderTopLeftRadius), sombra: cs.boxShadow };
        }),
      );
    for (const tema of ['claro', 'oscuro'] as const) {
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      const medidas = await medir();
      for (const m of medidas) expect(m.radio, `${tema} · ${m.s}: border-radius`).toBeGreaterThan(0);
      expect(medidas[2].sombra, `${tema} · mainContent: box-shadow`).not.toBe('none');
      expect(medidas[3].sombra, `${tema} · casosSection: box-shadow`).not.toBe('none');
    }
  });

  test('HALLAZGO 2364 · en oscuro, la cifra grande de ΔP y las etiquetas del manómetro se leen', async ({
    page,
  }) => {
    // REPARADO (28/09/2026): el magenta de las presiones (#A82E68) no tenía variante oscura.
    //   · La cifra de ΔP lo llevaba EN LÍNEA: sobre la tarjeta teal al 15 % del tema oscuro
    //     —rgb(49,64,63)— daba 1,69:1, y es texto grande (25,6 px, peso 800), que exige 3:1. Es
    //     la cifra que la app destaca y la que sale siempre (ΔP ≤ 0 en las tres geometrías).
    //     Ahora va por clase (.valorCae): #A82E68 en claro (5,99:1) y #F08CB4 en oscuro (4,73:1).
    //   · Las etiquetas «101,33 kPa» del canvas (11 px en negrita) salían fijas en #A82E68 sobre
    //     el #1A1A1A de .canvasWrapper: 2,70:1, cuando son texto pequeño y exigen 4,5:1. El
    //     dibujo lee ahora el tema en cada fotograma: #F08CB4 en oscuro (7,55:1).
    // Caso: tema oscuro, valores de fábrica → «−486 Pa» a ≥ 3:1 y etiquetas del canvas a ≥ 4,5:1;
    // y al volver al claro, las etiquetas vuelven al magenta de siempre (redibuja con el tema).
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.waitForTimeout(400);
    expect((await panel(page))[0][1]).toBe('−486 Pa');
    expect(await contrasteDe(page, 'span[class*="resultValueLarge"]')).toBeGreaterThanOrEqual(3);

    const oscuro = await etiquetasPresionCanvas(page);
    expect(oscuro.color, 'color de las etiquetas en oscuro').toEqual([240, 140, 180]);
    expect(contrasteRgb(oscuro.color, oscuro.fondo), 'etiquetas del canvas en oscuro').toBeGreaterThanOrEqual(4.5);

    await page.getByRole('button', { name: 'Cambiar a modo claro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.waitForTimeout(400);
    const claro = await etiquetasPresionCanvas(page);
    expect(claro.color, 'color de las etiquetas en claro').toEqual([168, 46, 104]);
    expect(contrasteRgb(claro.color, claro.fondo), 'etiquetas del canvas en claro').toBeGreaterThanOrEqual(4.5);
    expect(await contrasteDe(page, 'span[class*="resultValueLarge"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO 2365 · la nota de la tarjeta de ΔP se lee en los dos temas (≥ 4,5:1)', async ({ page }) => {
    // REPARADO (28/09/2026), misma tarjeta: la nota («La presión CAE en el estrechamiento…», y
    // con desnivel la de ρ·g·(h₂ − h₁) del 23/09) usaba --text-muted, que en oscuro (#9B9B9B)
    // está medido contra la tarjeta gris, no contra el teal al 15 %: 3,92:1 a 12,5 px, que
    // exige 4,5:1. Ahora usa --text-secondary dentro de .resultCardOk: claro 5,34:1 · oscuro
    // 5,02:1. Caso: valores de fábrica en claro y en oscuro → ≥ 4,5:1 en los dos.
    const nota = 'div[class*="resultCardOk"] span[class*="resultRange"]';
    expect(await contrasteDe(page, nota), 'claro').toBeGreaterThanOrEqual(4.5);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.waitForTimeout(400);
    expect(await contrasteDe(page, nota), 'oscuro').toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO 2366 · los títulos de «5 errores frecuentes» se leen en los dos temas (≥ 4,5:1)', async ({
    page,
  }) => {
    // REPARADO (28/09/2026): `.warningList li strong` pintaba el título de cada error en
    // #E07A1F sobre el naranja al 8 % de la caja de avisos: 2,56:1 en claro y 3,72:1 en oscuro.
    // Es texto de 16 px en negrita —no llega a «grande», que en negrita empieza en 18,66 px— y
    // exige 4,5:1. El título de la caja («5 errores frecuentes con Bernoulli», 17,6 px en
    // negrita) tenía el mismo color y el mismo defecto: se repara y se mide con él. El naranja
    // se queda en el borde; el texto va en #9A4A0C en claro (5,31:1) y #F5A05A en oscuro (5,36:1).
    const selectores = ['ul[class*="warningList"] li strong', 'div[class*="warningHeader"] strong'];
    for (const s of selectores) expect(await contrasteDe(page, s), `claro · ${s}`).toBeGreaterThanOrEqual(4.5);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.waitForTimeout(400);
    for (const s of selectores) expect(await contrasteDe(page, s), `oscuro · ${s}`).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO 2368 · las cifras de cinco o más dígitos del bloque educativo van agrupadas', async ({
    page,
  }) => {
    // REPARADO (28/09/2026): el formato español agrupa con punto desde las cinco cifras
    // (CLAUDE.md §2: con cuatro no se agrupa, y por eso «1000» está bien). El bloque educativo
    // escribía a mano «13534» (mercurio), «1 atm = 101325 Pa», «1 bar = 100000 Pa», «120 mmHg
    // = 16000 Pa» y «hay que sumar 101325 Pa», mientras el botón de la misma página dice
    // «101,325 kPa» y los casos «101.325 Pa». Caso: texto de la página → ninguna cifra de cinco
    // o más dígitos sin punto, y las cinco escritas como manda el formato.
    const sinAgrupar = await page.evaluate(() => {
      const fuera: string[] = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = w.nextNode())) {
        if ((n.parentElement as HTMLElement | null)?.closest('script,style')) continue;
        for (const m of (n.nodeValue ?? '').matchAll(/(?<![\d.,])\d{5,}(?!\d)/g)) fuera.push(m[0]);
      }
      return fuera;
    });
    expect(sinAgrupar).toEqual([]);
    const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    for (const cifra of [
      '13.534',
      '1 atm = 101.325 Pa',
      '1 bar = 100.000 Pa',
      '120 mmHg = 16.000 Pa',
      'hay que sumar 101.325 Pa',
    ]) {
      expect(cuerpo).toContain(cifra);
    }
  });

  test('HALLAZGO 2369 · la FAQ del JSON-LD no explica la sustentación por el «mayor recorrido»', async ({
    page,
  }) => {
    // REPARADO (28/09/2026): la respuesta del FAQPage «¿Por qué un avión vuela gracias a
    // Bernoulli?» decía que la curvatura «obliga al aire a recorrer más distancia y a fluir más
    // rápido por encima del ala». Es la teoría del mayor recorrido / tiempo de tránsito igual,
    // que la NASA (Glenn Research Center, «Incorrect Lift Theory #1») da por errónea: el aire de
    // arriba llega ANTES al borde de salida, no a la vez. La FAQ visible de la página lo matiza
    // bien; el JSON-LD es lo que leen los asistentes de IA. Ahora la pregunta es «¿Por qué vuela
    // un avión? ¿Es solo por Bernoulli?» y la respuesta dice lo mismo que la FAQ visible:
    // Bernoulli es una parte, la desviación del aire (Newton) la otra cara de la misma fuerza, y
    // por eso un avión vuela invertido. Caso: HTML servido → sin atribuir la velocidad a un
    // recorrido más largo, y con Newton y el ángulo de ataque en la respuesta.
    const faq = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .filter((t) => t.includes('FAQPage'))
        .join(' '),
    );
    expect(faq).toContain('FAQPage');
    expect(faq).not.toMatch(/recorrer más distancia|más distancia|camino más largo|recorrido más largo/i);
    const datos = JSON.parse(faq) as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    const avion = datos.mainEntity.find((q) => /avión/i.test(q.name));
    expect(avion, 'la pregunta del avión sigue en el FAQPage').toBeDefined();
    expect(avion!.acceptedAnswer.text).toContain('Newton');
    expect(avion!.acceptedAnswer.text).toContain('ángulo de ataque');
    expect(avion!.acceptedAnswer.text).not.toMatch(/recorr/i);
  });

  // ── SOSPECHAS del acta, confirmadas con su caso y REPARADAS (28/09/2026) ─────────────────

  test('SOSPECHA · caso 10: la cuenta hecha con la tabla de la app se acepta', async ({ page }) => {
    // Confirmada: con la tabla (velocidades a dos decimales, 0,13 y 0,80 m/s) el cociente da
    // 0,80/0,13 = 6,15, a 0,10 de 6,25 con una tolerancia de 0,0625 → «No es correcto»: la app
    // suspendía una cuenta hecha con las cifras que ella misma imprime. Reparada en el
    // enunciado, que pide ahora las ÁREAS (su columna de la tabla da 78,54/12,57 = 6,248) y
    // advierte de que las velocidades van redondeadas. La respuesta sigue siendo 6,25.
    await seccionCasos(page).getByRole('button', { name: /^Caso 10:/ }).click();
    await expect(seccionCasos(page)).toContainText('Resuélvelo con las áreas');
    await seccionCasos(page).getByRole('button', { name: /Cargar en el simulador/ }).click();
    const filas = await tabla(page);
    expect([filas[0][3], filas[1][3]]).toEqual(['0,13', '0,80']);
    // A mano: 78,54 / 12,57 = 6,2482 → «6,25», a 0,0018 del valor (tolerancia 0,0625).
    expect([filas[0][2], filas[1][2]]).toEqual(['78,54', '12,57']);
    expect(await responder(page, '6,25')).toContain('Correcto');
    // Y la cuenta del acta, con las velocidades redondeadas de la misma tabla, sigue fuera:
    // por eso el enunciado dice ahora que no se usen.
    expect(await responder(page, '6,15')).not.toContain('Correcto');
  });

  test('SOSPECHA · las soluciones escriben el menos como la tabla («−», no «-»)', async () => {
    // Confirmada: la solución del caso 8 decía «-29.430 Pa … -29,43 kPa» y la del 4 «-486 Pa»
    // mientras la tabla y la tarjeta de ΔP escriben «−». Reparada en `casos.ts` (conMenos).
    const conGuion = /(^|[\s(=:])-\d/;
    for (const caso of CASOS_AULA) {
      expect(caso.respuestaTexto, `caso ${caso.id}`).not.toMatch(conGuion);
      for (const paso of caso.pasos) expect(paso, `caso ${caso.id}`).not.toMatch(conGuion);
    }
    expect(CASOS_AULA.find((c) => c.id === 8)!.respuestaTexto).toBe('−29,43 kPa');
    expect(CASOS_AULA.find((c) => c.id === 4)!.respuestaTexto).toBe('−486 Pa');
  });

  test('SOSPECHA · el aviso de escala de la estenosis también se ve fuera del bloque plegado', async ({
    page,
  }) => {
    // Confirmada: el aviso «La escala de esta geometría no es fisiológica» solo vivía dentro de
    // <EducationalSection>, que nace plegado, mientras la tarjeta visible de la geometría decía
    // «Útil para entender Doppler vascular». Ahora la tarjeta lo dice también.
    await page.getByRole('button', { name: /Vena con estenosis/ }).click();
    const tarjeta = page.locator('p[class*="descriptionCard"]');
    await expect(tarjeta).toContainText('La escala no es fisiológica');
    await expect(tarjeta).toBeVisible();
  });
});

/**
 * Color dominante de las etiquetas de presión del canvas y el fondo sobre el que se leen.
 *
 * Las etiquetas «101,33 kPa» se escriben con la línea base en y = pad.top − 4 = 36 px, así que
 * ocupan la franja y ∈ [24, 37): ahí no hay otra cosa dibujada (la columna del manómetro empieza
 * en y = 44). Se cuentan solo los píxeles OPACOS, para no mezclar el suavizado de los bordes.
 * El canvas es transparente: el fondo real es el de .canvasWrapper.
 */
async function etiquetasPresionCanvas(page: Page): Promise<{ color: number[]; fondo: number[] }> {
  return page.evaluate(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement;
    const dpr = c.width / c.getBoundingClientRect().width;
    const img = c.getContext('2d')!.getImageData(0, 0, c.width, c.height);
    const cuenta = new Map<string, number>();
    for (let y = Math.round(24 * dpr); y < Math.round(37 * dpr); y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        if (img.data[i + 3] < 250) continue;
        const k = `${img.data[i]},${img.data[i + 1]},${img.data[i + 2]}`;
        cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
      }
    }
    const [dominante] = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['0,0,0'];
    const fondo = getComputedStyle(c.parentElement as HTMLElement).backgroundColor.match(/\d+/g)!.map(Number);
    return { color: dominante.split(',').map(Number), fondo: fondo.slice(0, 3) };
  });
}

/** Contraste WCAG entre dos colores opacos [r, g, b]. */
function contrasteRgb(a: number[], b: number[]): number {
  const lum = (c: number[]) => {
    const f = (v: number) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

test.describe('Inspector 28/09/2026 — móvil de 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('las velocidades de la tabla de secciones caben en pantalla', async ({ page }) => {
    // Lo que SÍ se ve a 390 px (candado): Sección, Diámetro, Área y v.
    const ancho = await page.evaluate(() => window.innerWidth);
    const derechaV = await page.evaluate(() => {
      const th = Array.from(document.querySelectorAll('table[class*="seccionesTable"] th')).find(
        (t) => t.textContent?.trim() === 'v (m/s)',
      ) as HTMLElement;
      return th.getBoundingClientRect().right;
    });
    expect(derechaV).toBeLessThanOrEqual(ancho);
  });

  test('HALLAZGO 2363 · las columnas Presión y Altura de la tabla se pueden ver en el móvil', async ({ page }) => {
    // REPARADO (28/09/2026): la tabla de secciones no iba envuelta en un contenedor con
    // desplazamiento (la tabla educativa sí, `.tablaWrapper`) y medía 501 px dentro de una
    // tarjeta de 278. html y body llevan overflow-x: hidden, así que el sobrante no se podía
    // desplazar: se cortaba. A 390 px «Presión» empezaba justo en x = 390 y «Altura (m)» acababa
    // en 557, fuera de la pantalla y sin forma de llegar a ellas. Son las presiones absolutas por
    // sección —las que los casos 5, 8 y 9 mandan comparar con la TABLA— y la altura de la
    // geometría con desnivel. Ahora va dentro de .seccionesWrapper (overflow-x: auto), que es
    // región con nombre y enfocable para desplazarla también con el teclado, y en móvil las
    // celdas llevan menos relleno (la tabla pasa a ~400 px y asoma «101…» de la columna Presión).
    // Caso: 390 px, valores de fábrica → hay un ancestro desplazable y, al llevarlo hasta el
    // final con las flechas del teclado, «Presión» y «Altura (m)» quedan enteras a la vista.
    const r = await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('table[class*="seccionesTable"] th')) as HTMLElement[];
      let desplazable = false;
      let n: HTMLElement | null = ths[0]?.closest('table')?.parentElement ?? null;
      while (n && n !== document.body) {
        const ox = getComputedStyle(n).overflowX;
        if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth) desplazable = true;
        n = n.parentElement;
      }
      return {
        ancho: window.innerWidth,
        derechas: ths.map((t) => [t.textContent?.trim(), Math.round(t.getBoundingClientRect().right)] as const),
        desplazable,
      };
    });
    const fuera = r.derechas.filter(([, der]) => der > r.ancho);
    expect(r.desplazable || fuera.length === 0, `fuera de pantalla: ${JSON.stringify(fuera)}`).toBe(true);

    // Accesible por teclado: región con nombre, en el orden de tabulación.
    const region = page.getByRole('region', { name: /Tabla de secciones/ });
    await expect(region).toHaveAttribute('tabindex', '0');
    await region.focus();
    for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    const visibles = await page.evaluate(() => {
      const w = document.querySelector('div[class*="seccionesWrapper"]') as HTMLElement;
      const caja = w.getBoundingClientRect();
      return Array.from(w.querySelectorAll('th'))
        .filter((th) => ['Presión', 'Altura (m)'].includes(th.textContent?.trim() ?? ''))
        .map((th) => {
          const b = th.getBoundingClientRect();
          return {
            th: th.textContent?.trim(),
            dentro: b.left >= caja.left - 1 && b.right <= caja.right + 1 && b.right <= window.innerWidth,
          };
        });
    });
    expect(visibles).toEqual([
      { th: 'Presión', dentro: true },
      { th: 'Altura (m)', dentro: true },
    ]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 13/10/2026 — RE-INSPECCIÓN (app INVALIDADA, 1.088 usos) con FIRMA DE ROTURA de tipo
 * «cambio»: las visitas cortas pasaron del 53,8 % al 67,1 % en los 14 días hasta el 12/10/2026.
 * Se buscó sobre todo lo que impide USAR la app en móvil. La base no tenía ningún hallazgo
 * abierto; los 18 reparados (397-407 y 2363-2369) se comprueban con los tests de arriba.
 *
 * CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (A = π·D²/4, g = 9,81 m/s², presión
 * ABSOLUTA, D₁ = 10 cm; la app no tiene ninguna geometría que cambie a la vez sección y altura,
 * así que el término de velocidad y el de altura se prueban en dos casos):
 *
 *   1 (normal) · Venturi, SANGRE ρ = 1060 kg/m³, Q = 6 L/s, D₂/D₁ = 0,45, P₁ = 120.325 Pa
 *       A₁ = π·0,05²   = 7,853982·10⁻³ m² → 78,54 cm² · v₁ = 0,006/A₁ = 0,763944 m/s → «0,76»
 *       A₂ = π·0,0225² = 1,590431·10⁻³ m² → 15,90 cm² · v₂ = 0,006/A₂ = 3,772562 m/s → «3,77»
 *       continuidad: v₂/v₁ = 1/0,45² = 4,938 ✔ · A₁·v₁ = A₂·v₂ = 0,006 m³/s
 *       ΔP = ½·1060·(0,583610 − 14,232221) = 530·(−13,648611) = −7.233,76 Pa → «−7234 Pa»
 *       P₂ = 120.325 − 7.233,76 = 113.091,24 Pa → «113,09 kPa» · ṁ = 1060·0,006 = 6,36 kg/s
 *
 *   2 (límite) · tope del deslizador de desnivel, 10 m, SANGRE, Q = 2 L/s, P₁ = 101.325 Pa
 *       diámetro constante → v igual en las tres secciones (0,254648 m/s → «0,25»)
 *       P₂ (h = 5 m)  = 101.325 − 1060·9,81·5  = 101.325 − 51.993  = 49.332 Pa → «49,33 kPa»
 *       P₃ (h = 10 m) = 101.325 − 1060·9,81·10 = 101.325 − 103.986 = −2.661 Pa → «−2661 Pa»
 *       tarjeta: P₂ − P₁ = −51.993 Pa → «−51,99 kPa» · presión absoluta NEGATIVA → aviso
 *       Dibujo (page.tsx, lienzo de 380 px): yBase = 40 + 0,55·300 = 205 px, escala FIJA
 *       0,6·300/10 = 18 px/m, medio tubo = 0,10·800/2 = 40 px → borde superior en la meseta
 *       = 205 − 18·Δh − 40: con 9 m queda en y = 3 px (dentro); con 10 m, en y = −15 px (FUERA).
 *
 *   3 (aviso, OPERATIVA EN MÓVIL de 390 px con pantalla táctil) · arrastrar con el dedo el
 *       caudal hasta el tope (10 L/s) y el estrechamiento hasta el mínimo (0,25):
 *       v₁ = 0,01/7,853982·10⁻³ = 1,273240 m/s · v₂ = 0,01/4,908739·10⁻⁴ = 20,371833 m/s
 *       ΔP = 500·(1,621139 − 415,011580) = −206.695,21 Pa → «−206,70 kPa»
 *       P₂ = 101.325 − 206.695,21 = −105.370,21 Pa → «−105,37 kPa» → «Cavitación segura»
 *       y el arrastre horizontal no debe desplazar la página.
 *
 * RESULTADO: los tres casos cuadraron con la app al céntimo, en escritorio y en móvil. Los
 * deslizadores responden al dedo (el pulgar de 22 px es tocable aunque el carril mida 6 px) y no
 * arrastran la página. Hallazgos NUEVOS (3242-3246), que nacieron con `test.fail()` afirmando lo
 * que DEBÍA pasar y se REPARARON el 19/10/2026 (2d1610a9); los tests de abajo ya afirman lo
 * correcto sin la marca:
 *   · el tubo del desnivel se salía del lienzo en el tope del deslizador (nacía de la reparación
 *     del 399, que fijó la escala sin dejar sitio arriba) — 3242;
 *   · «Cargar en el simulador» en el móvil dejaba la vista en los botones de geometría, sin la
 *     tubería ni la tabla a la vista — 3243;
 *   · el bucle de dibujo reasignaba canvas.width 60 veces por segundo con la animación apagada
 *     — 3244;
 *   · dos preguntas del FAQPage estaban también en la FAQ visible con OTRA respuesta — 3245;
 *   · el bloque educativo llamaba «presión hidrostática» a P y a ρgh a la vez — 3246.
 * Re-inspección del 22/10/2026 (bloque del final): los cinco siguen reparados, también a 360 px.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Primer píxel opaco de la columna x normalizada del lienzo, de arriba abajo: y en px CSS y color. */
async function primerPixelOpaco(page: Page, xn: number): Promise<{ y: number; rgb: number[] } | null> {
  return page.evaluate((x: number) => {
    const c = document.querySelector('canvas') as HTMLCanvasElement;
    const rect = c.getBoundingClientRect();
    const dpr = c.width / rect.width;
    const px = Math.round((24 + x * (rect.width - 48)) * dpr);
    const d = c.getContext('2d')!.getImageData(px, 0, 1, c.height).data;
    for (let y = 0; y < c.height; y++) {
      if (d[y * 4 + 3] > 200) return { y: Math.round(y / dpr), rgb: [d[y * 4], d[y * 4 + 1], d[y * 4 + 2]] };
    }
    return null;
  }, xn);
}

test.describe('Inspector 13/10/2026 — re-inspección con firma de rotura', () => {
  test('CASO 1 · Venturi con sangre, 6 L/s, D₂/D₁ = 0,45 y P₁ = 120,3 kPa: ΔP = −7234 Pa', async ({ page }) => {
    await page.getByRole('button', { name: 'Sangre', exact: true }).click();
    expect(await poner(page, 'Caudal', 6)).toBe('6');
    expect(await poner(page, 'Ratio de estrechamiento', 0.45)).toBe('0.45');
    // 101.325 + 19 pasos de 1 kPa: un punto de la rejilla del deslizador
    expect(await poner(page, 'Presión de entrada', 120325)).toBe('120325');

    const rots = await rotulos(page);
    expect(rots).toContain('Caudal (Q = 6,0 L/s)');
    expect(rots).toContain('Ratio de estrechamiento (D₂/D₁ = 0,45)');
    expect(rots).toContain('Presión entrada (P₁ = 120,3 kPa)');
    expect(rots).toContain('Fluido (ρ = 1060 kg/m³)');

    const filas = await tabla(page);
    // v₁ = 0,006/7,853982·10⁻³ = 0,763944 m/s
    expect(filas[0]).toEqual(['Entrada', '10,0', '78,54', '0,76', '120,33 kPa', '0,00']);
    // A₂ = π·0,0225² = 15,90 cm² · v₂ = 3,772562 m/s · P₂ = 120.325 − 7.233,76 = 113.091,24 Pa
    expect(filas[1]).toEqual(['Garganta', '4,5', '15,90', '3,77', '113,09 kPa', '0,00']);
    expect(filas[2]).toEqual(['Salida', '10,0', '78,54', '0,76', '120,33 kPa', '0,00']);

    // Continuidad con las cifras de la propia tabla: A·v = 0,006 m³/s en las tres secciones. Un
    // fallo de continuidad (olvidar el cuadrado del diámetro: v₂ = v₁/0,45 = 1,70 m/s) daría
    // 0,0027 m³/s en la garganta; el redondeo de la tabla mueve como mucho 0,00004.
    for (const f of filas) {
      const A = parseFloat(f[2].replace(',', '.')) / 10000; // cm² → m²
      const v = parseFloat(f[3].replace(',', '.'));
      expect(Math.abs(A * v - 0.006)).toBeLessThan(0.0001);
    }

    const tarjetas = await panel(page);
    expect(tarjetas[0][1]).toBe('−7234 Pa'); // ½·1060·(v₁² − v₂²) = 530·(−13,648611)
    expect(tarjetas[0][2]).toContain('La presión CAE en el estrechamiento');
    expect(tarjetas[1][1]).toBe('6,360 kg/s'); // ρ·Q = 1060 · 0,006
    expect(tarjetas[3][1]).toBe('3,77 m/s');
    expect(tarjetas[4][1]).toBe('1060 kg/m³');
    expect(tarjetas[4][2]).toBe('Sangre');
  });

  test('CASO 2 · desnivel de 10 m con sangre: P₃ = −2661 Pa absolutos y aviso de cavitación', async ({ page }) => {
    await page.getByRole('button', { name: /Tubería con desnivel/ }).click();
    await page.getByRole('button', { name: 'Sangre', exact: true }).click();
    expect(await poner(page, 'Desnivel', 10)).toBe('10');

    const filas = await tabla(page);
    expect(filas.map((f) => f[3])).toEqual(['0,25', '0,25', '0,25']); // diámetro constante: v₁ = v₂ = v₃
    expect(filas.map((f) => f[5])).toEqual(['0,00', '5,00', '10,00']);
    // 101.325 − 1060·9,81·5 = 49.332 Pa · 101.325 − 1060·9,81·10 = −2.661 Pa
    expect(filas.map((f) => f[4])).toEqual(['101,33 kPa', '49,33 kPa', '−2661 Pa']);

    const tarjetas = await panel(page);
    expect(tarjetas[0][1]).toBe('−51,99 kPa'); // P₂ − P₁ = −1060·9,81·5 = −51.993 Pa
    expect(tarjetas[0][2]).toContain('ρ·g·(h₂ − h₁)');
    const aviso = page.locator('[role="status"] [role="note"]');
    await expect(aviso).toContainText('Cavitación segura');
    await expect(aviso).toContainText('−2661 Pa');

    // Testigo del dibujo un paso por debajo del tope: con 9 m el borde superior del tubo queda
    // en y = 205 − 18·9 − 40 = 3 px, todavía dentro del lienzo (es la línea gris #555 del borde).
    await page.getByLabel(/Animación de partículas/).uncheck();
    expect(await poner(page, 'Desnivel', 9)).toBe('9');
    await page.waitForTimeout(200);
    const nueve = await primerPixelOpaco(page, 0.85);
    expect(nueve, 'algo dibujado en la columna x = 0,85').not.toBeNull();
    expect(nueve!.rgb[0], 'con 9 m lo primero es el BORDE oscuro del tubo').toBeLessThan(150);
  });

  // HALLAZGO 3242 REPARADO (19/10/2026): en el desnivel la base baja y la escala se calcula para
  // que a 10 m el eje del tubo quede 10 px por debajo de los rótulos de los manómetros.
  // Lo que había (operativa, bajo) · El tubo del desnivel se salía del lienzo en el tope del
  // deslizador. La reparación del 399 (26/08/2026) cambió la escala a una FIJA de 0,6·plotH para
  // los 10 m del recorrido, pero la base del tubo está en el 55 % de plotH y el medio tubo mide
  // 40 px: el borde superior de la meseta queda en 205 − 18·Δh − 40 px, negativo desde 9,5 m. Con
  // 10 m el tubo sale cortado por arriba (−15 px), atraviesa la banda de los manómetros y la flecha
  // de velocidad de «Superior» se pinta encima de su rótulo «−2661 Pa», justo la cifra que avisa
  // de la presión negativa; en el móvil el borde del tubo cruza además el rótulo «49,33 kPa».
  // Caso: desnivel 10 m (lienzo de 380 px) → esperado el borde oscuro del tubo dentro del lienzo,
  // como con 9 m · obtenido el primer píxel de la columna x = 0,85 en y = 0 y es el RELLENO
  // (229, 241, 248): el borde está fuera, en y = −15 px.
  test('HALLAZGO 3242 · con 10 m de desnivel el tubo entero cabe en el lienzo', async ({ page }) => {
    await page.getByRole('button', { name: /Tubería con desnivel/ }).click();
    await page.getByLabel(/Animación de partículas/).uncheck();
    expect(await poner(page, 'Desnivel', 10)).toBe('10');
    await page.waitForTimeout(200);
    const diez = await primerPixelOpaco(page, 0.85);
    expect(diez, 'algo dibujado en la columna x = 0,85').not.toBeNull();
    // Lo correcto: el primer píxel opaco es el borde oscuro (#555), por debajo de y = 0.
    expect(diez!.rgb[0], 'lo primero que se ve es el borde del tubo, no su relleno cortado').toBeLessThan(150);
    expect(diez!.y, 'el borde superior queda dentro del lienzo').toBeGreaterThan(0);
  });

  // HALLAZGO 3244 REPARADO (19/10/2026): sin animación se dibuja una vez por cambio (con ella el
  // bucle sigue, también fuera de pantalla: es lo que el caso no pedía).
  // Lo que había (operativa, bajo) · El bucle de requestAnimationFrame llamaba a dibujar() en
  // CADA fotograma aunque la casilla «Animación de partículas» esté desmarcada y aunque el lienzo
  // esté fuera de pantalla, y dibujar() reasigna canvas.width (borra y realoja el lienzo, 640×840
  // píxeles en un Pixel 7) y fuerza un getBoundingClientRect. Desmarcar la animación para el
  // movimiento pero no el trabajo: 60 redibujos por segundo de una imagen que no cambia, mientras
  // se lee el bloque educativo o se resuelven los casos. Con la CPU ×4 no llega a producir tareas
  // largas, así que no bloquea: es batería y calor en el móvil.
  // Caso: animación desmarcada, sin tocar nada, 2 s → esperado ≤ 2 redibujos (no cambia nada) ·
  // obtenido ~120 asignaciones de canvas.width (181 en 3 s medidas en el móvil, una por fotograma).
  test('HALLAZGO 3244 · con la animación apagada y nada que cambie, el lienzo no se redibuja en bucle', async ({ page }) => {
    await page.getByLabel(/Animación de partículas/).uncheck();
    await page.waitForTimeout(300);
    const asignaciones = await page.evaluate(async () => {
      const c = document.querySelector('canvas') as HTMLCanvasElement;
      const desc = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width')!;
      let n = 0;
      Object.defineProperty(c, 'width', {
        configurable: true,
        get() { return desc.get!.call(this); },
        set(v: number) { n++; desc.set!.call(this, v); },
      });
      await new Promise((r) => setTimeout(r, 2000));
      return n;
    });
    expect(asignaciones).toBeLessThanOrEqual(2);
  });

  // HALLAZGO 3245 REPARADO (19/10/2026): PREGUNTA_/RESPUESTA_AVION y _LIMITACIONES en metadata.ts,
  // que leen las dos bocas; en el avión manda la versión del FAQPage (la diferencia de presión ES
  // la sustentación). Lo que había (contenido, medio) · Dos preguntas del FAQPage (metadata.ts, lo
  // que leen los buscadores y los asistentes de IA) estaban también en la FAQ visible con OTRA respuesta:
  //   · «¿Por qué vuela un avión? ¿Es solo por Bernoulli?» (JSON-LD) dice que «la diferencia de
  //     presión entre las dos caras ES la sustentación, así que ambos enfoques describen la misma
  //     fuerza»; «¿De verdad los aviones vuelan por Bernoulli?» (visible) dice que «se debe sobre
  //     todo a la desviación del aire hacia abajo» y que Bernoulli «contribuye a la fuerza neta»:
  //     dos aportaciones que se suman, no dos descripciones de la misma fuerza. El comentario de
  //     la reparación del 2369 dice «ahora dice lo mismo que la FAQ visible», y no lo dice.
  //   · «¿Cuáles son las limitaciones reales…?» (JSON-LD: la densidad varía «a velocidades
  //     próximas a la del sonido») frente a «¿Cuándo NO se cumple Bernoulli?» (visible: «gases a
  //     velocidades supersónicas»).
  // La reparación es UNA constante en metadata.ts que importen las dos bocas (como
  // app/simulador-gastos-compraventa-garaje). Caso: HTML servido → esperado la misma pregunta y
  // la misma respuesta en el FAQPage y en la FAQ visible · obtenido dos textos distintos.
  test('HALLAZGO 3245 · las preguntas del FAQPage que también salen en la FAQ visible dan la misma respuesta', async ({
    page,
  }) => {
    const faq = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .find((t) => t.includes('FAQPage')) ?? '',
    );
    const datos = JSON.parse(faq) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    const visibles = await page.evaluate(() =>
      Array.from(document.querySelectorAll('div[class*="faqItem"]')).map((d) => ({
        pregunta: d.querySelector('h4')?.textContent?.trim() ?? '',
        respuesta: d.querySelector('p')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      })),
    );
    // Los dos temas que están en las dos bocas
    for (const tema of [/avi[oó]n/i, /limitaciones|no se cumple/i]) {
      const ld = datos.mainEntity.find((q) => tema.test(q.name));
      const vis = visibles.find((v) => tema.test(v.pregunta));
      expect(ld, `FAQPage: ${tema}`).toBeDefined();
      expect(vis, `FAQ visible: ${tema}`).toBeDefined();
      expect(vis!.pregunta, `misma pregunta (${tema})`).toBe(ld!.name);
      expect(vis!.respuesta, `misma respuesta (${tema})`).toBe(ld!.acceptedAnswer.text);
    }
  });

  // HALLAZGO 3246 REPARADO (19/10/2026): «P: presión estática (Pa)».
  // Lo que había (contenido, bajo) · «¿Qué es la ecuación de Bernoulli?» definía los términos
  // con «P: presión hidrostática (Pa)» y, una línea más abajo, «ρgh: presión hidrostática debida
  // a la altura»: dos términos distintos de la misma ecuación con el mismo nombre. P es la presión
  // ESTÁTICA, como dice la propia página en el escenario del tubo de Pitot («presión total
  // (P + ½ρv²) y estática (P)») y el FAQPage («la presión estática P»).
  // Caso: bloque educativo → esperado «P: presión estática» · obtenido «P: presión hidrostática».
  test('HALLAZGO 3246 · el bloque educativo llama «estática» a P, no «hidrostática» como a ρgh', async ({ page }) => {
    const definicionP = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('ul[class*="bulletList"] li'))
          .map((li) => li.textContent?.replace(/\s+/g, ' ').trim() ?? '')
          .find((t) => t.startsWith('P:')) ?? '',
    );
    expect(definicionP).toContain('presión estática');
    expect(definicionP).not.toMatch(/hidrost[aá]tica/);
  });
});

test.describe('Inspector 13/10/2026 — operativa en móvil táctil de 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  /**
   * Arrastra con el DEDO el pulgar de un deslizador `dx` px en horizontal (eventos táctiles de
   * verdad por CDP, no el setter del input) y devuelve el desplazamiento vertical de la página
   * antes y después: un deslizador que arrastra la página en vez de moverse se delata ahí.
   */
  async function arrastrarConElDedo(page: Page, id: string, dx: number): Promise<{ antes: number; despues: number }> {
    await page.evaluate((i) => document.getElementById(i)!.scrollIntoView({ block: 'center' }), id);
    await page.waitForTimeout(300);
    const p = await page.evaluate((i) => {
      const el = document.getElementById(i) as HTMLInputElement;
      const b = el.getBoundingClientRect();
      const frac = (+el.value - +el.min) / (+el.max - +el.min);
      // El pulgar mide 22 px: su centro recorre el carril menos 11 px por cada lado.
      return { x: b.left + 11 + frac * (b.width - 22), y: b.top + b.height / 2, scroll: scrollY };
    }, id);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y }] });
    for (let i = 1; i <= 15; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x + (dx * i) / 15, y: p.y }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
    await page.waitForTimeout(400);
    return { antes: p.scroll, despues: await page.evaluate(() => scrollY) };
  }

  test('CASO 3 · con el dedo, caudal al tope y estrechamiento al mínimo: −105,37 kPa y aviso de cavitación', async ({
    page,
  }) => {
    // Arrastres de 400 px, más largos que el carril (278 px): el pulgar topa en el extremo.
    const caudal = await arrastrarConElDedo(page, CONTROL.Caudal, 400);
    expect(caudal.despues, 'el arrastre del caudal no desplaza la página').toBe(caudal.antes);
    const ratio = await arrastrarConElDedo(page, CONTROL['Ratio de estrechamiento'], -400);
    expect(ratio.despues, 'el arrastre del estrechamiento no desplaza la página').toBe(ratio.antes);

    const rots = await rotulos(page);
    expect(rots).toContain('Caudal (Q = 10,0 L/s)');
    expect(rots).toContain('Ratio de estrechamiento (D₂/D₁ = 0,25)');

    const filas = await tabla(page);
    // v₁ = 0,01/7,853982·10⁻³ = 1,273240 · v₂ = 0,01/4,908739·10⁻⁴ = 20,371833
    // P₂ = 101.325 + 500·(1,621139 − 415,011580) = −105.370,21 Pa
    expect(filas[1]).toEqual(['Garganta', '2,5', '4,91', '20,37', '−105,37 kPa', '0,00']);
    expect((await panel(page))[0][1]).toBe('−206,70 kPa'); // ΔP = −206.695,21 Pa
    const aviso = page.locator('[role="status"] [role="note"]');
    await expect(aviso).toContainText('Cavitación segura');
    await expect(aviso).toContainText('−105,37 kPa');
  });

  // HALLAZGO 3243 REPARADO (19/10/2026): la carga lleva la vista al lienzo, centrado.
  // Lo que había (operativa, bajo) · En el móvil, «Cargar en el simulador» llevaba la vista a
  // los tres botones de geometría (scrollY ≈ 671), que en una columna ocupan 360 px; la tubería
  // empieza en y ≈ 1.807 y la tabla en y ≈ 2.265, así que tras cargar no se ve ni una cifra ni el
  // dibujo, y el aviso «El caso 5 está cargado en el simulador…» se queda en la sección de casos,
  // 2.500 px más abajo y fuera de pantalla: el alumno ve un salto y tres botones. Los casos le
  // piden comparar con la TABLA (pista del 8, enunciado del 10). En escritorio la misma carga
  // deja el lienzo a la vista. De paso, el logotipo fijo tapa el icono del botón «Venturi».
  // Caso: 390×844, caso 5 → «Cargar en el simulador» → esperado la tubería o la tabla cargada
  // en pantalla · obtenido solo los botones de geometría y la tarjeta de descripción (lienzo a
  // 1.136 px y tabla a 1.594 px por debajo del borde superior de la vista).
  test('HALLAZGO 3243 · tras «Cargar en el simulador» en el móvil se ve la tubería o la tabla cargada', async ({
    page,
  }) => {
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 5:/ }).click();
    await seccion.getByRole('button', { name: /Cargar en el simulador/ }).click();
    await page.waitForTimeout(1500); // el desplazamiento suave termina antes
    // La carga sí llega al simulador: P₂ = 70.472,7 Pa absolutos (caso 5 de aula).
    expect((await tabla(page))[1][4]).toBe('70,47 kPa');
    const enPantalla = await page.evaluate(() => {
      const ve = (sel: string) => {
        const b = document.querySelector(sel)!.getBoundingClientRect();
        return b.top < innerHeight && b.bottom > 0;
      };
      return ve('canvas') || ve('div[class*="seccionesWrapper"]');
    });
    expect(enPantalla).toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 22/10/2026 — 2.ª RE-INSPECCIÓN CON FIRMA DE ROTURA (1.201 usos). Visitas cortas del
 * 56,4 % al 69,1 % en los 14 días hasta el 21/10/2026 y 8,4 % de recargas tras visita corta
 * (catálogo: 2,8 %). Se buscó lo que impide USAR la app, en escritorio y a 360 px táctil, y se
 * comprobó que las reparaciones de 2d1610a9 (3242-3246, 19/10/2026) se sostienen: los 48 tests
 * de arriba pasan en verde contra el build de HEAD.
 *
 * CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (A = π·D²/4, D₁ = 10 cm, g = 9,81 m/s²,
 * presión ABSOLUTA; ρ de la tabla de la app: aceite 920, agua 1000, aire 1,225 kg/m³):
 *
 *   N (normal) · Vena con estenosis, ACEITE, Q = 3 L/s, D₂/D₁ = 0,70, P₁ = 101.325 Pa
 *       A₁ = π·0,05²  = 7,853982·10⁻³ m² → 78,54 cm² · v₁ = 0,003/A₁ = 0,381972 m/s → «0,38»
 *       A₂ = π·0,035² = 3,848451·10⁻³ m² → 38,48 cm² · v₂ = 0,003/A₂ = 0,779534 m/s → «0,78»
 *       continuidad: v₂/v₁ = 1/0,7² = 2,0408 ✔
 *       ΔP = ½·920·(0,145903 − 0,607674) = 460·(−0,461771) = −212,41 Pa → «−212 Pa»
 *       P₂ = 101.325 − 212,41 = 101.112,59 Pa → «101,11 kPa» · ṁ = 920·0,003 = 2,76 → «2,760 kg/s»
 *
 *   L (límite: la frontera de la cavitación y la presión de entrada mínima) · Venturi, AGUA,
 *       Q = 10 L/s (tope), D₂/D₁ = 0,30
 *       v₁ = 0,01/7,853982·10⁻³ = 1,273240 m/s, v₁² = 1,621139
 *       A₂ = π·0,015² = 7,068583·10⁻⁴ m² → 7,07 cm² · v₂ = 14,147106 m/s, v₂² = v₁²/0,3⁴ = 200,140610
 *       ΔP = 500·(1,621139 − 200,140610) = −99.259,74 Pa → «−99,26 kPa» (no depende de P₁)
 *       P₁ = 101.325 → P₂ = 2.065,26 Pa → «2065 Pa»: POSITIVA pero bajo la presión de vapor
 *                     (2.339 Pa) → «Zona de cavitación», sin llamarla negativa
 *       P₁ = 50.325 (el suelo de la rejilla) → P₂ = −48.934,74 Pa → «−48,93 kPa» → «Cavitación
 *                     segura: presión absoluta negativa»
 *
 *   R (rechazo y aviso) · casilla del caso 4 de aula, cuya clave es −486 Pa
 *       (ΔP = 500·(0,254648² − 1,018592²) = −486,34 → −486) y tolerancia el 1 % = 4,86 Pa:
 *       «486»     → valor bueno con el signo cambiado → aviso del signo, no «correcto»
 *       «−486»    → con el menos tipográfico que escribe la propia tabla → «¡Correcto!»
 *       «-490»    → a 4 Pa de la clave, dentro de 4,86 → «¡Correcto!»
 *       «-491»    → a 5 Pa, fuera → «No es correcto»
 *       «-486 Pa» → con la unidad pegada no es un número → «Escribe un número», sin NaN
 *
 *   M (operativa en móvil, 360 × 740 táctil) · con el DEDO: «Tubería con desnivel» y «Aire»
 *       (desnivel de fábrica 2 m, Q = 2 L/s → v = 0,254648 m/s en las tres secciones)
 *       P₂ (h = 1 m) = 101.325 − 1,225·9,81·1 = 101.312,98 Pa → «101,31 kPa» · ΔP → «−12 Pa»
 *       P₃ (h = 2 m) = 101.325 − 24,03 = 101.300,97 Pa → «101,30 kPa»
 *       y el caso 9 (aceite, 3 L/s, 5 m) cargado con el dedo deja el lienzo a la vista con
 *       P₂ = 101.325 − 920·9,81·2,5 = 78.762 → «78,76 kPa» y P₃ = 56.199 → «56,20 kPa».
 *
 * RESULTADO: los cuatro casos cuadran con la app. A 360 px no hay desbordamiento horizontal, los
 * botones y la casilla responden al dedo, la carga de un caso enseña el lienzo (3243) y con 10 m
 * el tubo cabe en el lienzo de 320 px (3242). Hallazgos NUEVOS (3407-3409), que nacieron con
 * `test.fail()` y se REPARARON el 22/10/2026 en 6ada809e (los tests de abajo ya afirman lo
 * correcto sin la marca):
 *   · con la página TRADUCIDA por el navegador, cambiar de geometría (o cargar los casos 8-11, o
 *     llevar D₂/D₁ a 1) tumbaba la app en «Algo salió mal» — familia C0312 (3407);
 *   · el lienzo —lo que la app promete «visualizar»— empezaba por debajo de la primera pantalla:
 *     a 987 px en un portátil de 1366 × 768 y a 1.902 px (2,6 pantallas) a 360 × 740 (3408);
 *   · el featureList del JSON-LD prometía un deslizador de densidad que no existe, una
 *     «verificación de la conservación» que no se muestra y llamaba «líquido» al aire (3409).
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/**
 * Simula la traducción automática del navegador: cada nodo de texto con contenido pasa a ser
 * <font><font>texto</font></font> y el nodo original sale del DOM. Es el `traducir()` de
 * tests/apps/texto-condicional-traducido-familia.spec.ts (C0312) y del testigo del 3314.
 */
const traducirPagina = (page: Page) =>
  page.evaluate(() => {
    const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const padre = n.parentElement;
        if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodos: Text[] = [];
    while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
    for (const nodo of nodos) {
      const exterior = document.createElement('font');
      const interior = document.createElement('font');
      interior.textContent = nodo.nodeValue;
      exterior.appendChild(interior);
      nodo.parentNode?.replaceChild(exterior, nodo);
    }
  });

/** Errores de la caída por la página traducida (NotFoundError en removeChild / insertBefore). */
function vigilarCaida(page: Page): string[] {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
  });
  return errores;
}

test.describe('Inspector 22/10/2026 — 2.ª re-inspección con firma de rotura', () => {
  const seccionCasos = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  /** Escribe en la casilla del caso, espera a que React lo tenga, pulsa «Comprobar» y lee el veredicto. */
  async function responder(page: Page, texto: string): Promise<string> {
    const casilla = seccionCasos(page).locator('#casos-respuesta');
    await casilla.fill(texto);
    await esperarValorEnReact(page, casilla, texto);
    await seccionCasos(page).getByRole('button', { name: 'Comprobar' }).click();
    // Acotado a la sección: getByRole('alert') a secas casaría con el anunciador de rutas de Next.
    const veredicto = seccionCasos(page).getByRole('alert');
    await expect(veredicto).toBeVisible();
    return ((await veredicto.textContent()) ?? '').trim();
  }

  test('N · estenosis con aceite, 3 L/s y D₂/D₁ = 0,70: v₂ = 0,78 m/s y ΔP = −212 Pa', async ({ page }) => {
    await page.getByRole('button', { name: /Vena con estenosis/ }).click();
    await page.getByRole('button', { name: 'Aceite', exact: true }).click();
    expect(await poner(page, 'Caudal', 3)).toBe('3');
    expect(await poner(page, 'Ratio de estrechamiento', 0.7)).toBe('0.7');

    const rots = await rotulos(page);
    expect(rots).toContain('Caudal (Q = 3,0 L/s)');
    expect(rots).toContain('Ratio de estrechamiento (D₂/D₁ = 0,70)');
    expect(rots).toContain('Fluido (ρ = 920 kg/m³)');

    const filas = await tabla(page);
    // v₁ = 0,003/7,853982·10⁻³ = 0,381972 m/s
    expect(filas[0]).toEqual(['Pre-estenosis', '10,0', '78,54', '0,38', '101,33 kPa', '0,00']);
    // A₂ = π·0,035² = 38,48 cm² · v₂ = 0,779534 m/s · P₂ = 101.325 − 212,41 = 101.112,59 Pa
    expect(filas[1]).toEqual(['Estenosis', '7,0', '38,48', '0,78', '101,11 kPa', '0,00']);
    // Fluido ideal: la sección vuelve a 10 cm y la presión se recupera entera
    expect(filas[2]).toEqual(['Post-estenosis', '10,0', '78,54', '0,38', '101,33 kPa', '0,00']);

    // Continuidad con las cifras de la tabla: A·v = 0,003 m³/s. El redondeo de v a centésimas
    // mueve como mucho 0,005·78,54·10⁻⁴ = 0,00004; olvidar el cuadrado del diámetro
    // (v₂ = v₁/0,7 = 0,55 m/s) daría 0,0021 en la estenosis, 0,0009 fuera.
    for (const f of filas) {
      const A = parseFloat(f[2].replace(',', '.')) / 10000; // cm² → m²
      const v = parseFloat(f[3].replace(',', '.'));
      expect(Math.abs(A * v - 0.003)).toBeLessThan(0.00005);
    }

    const tarjetas = await panel(page);
    expect(tarjetas[0][0]).toBe('Diferencia de presión P₂ − P₁ (de Pre-estenosis a Estenosis)');
    expect(tarjetas[0][1]).toBe('−212 Pa'); // ½·920·(v₁² − v₂²) = 460·(−0,461771)
    expect(tarjetas[0][2]).toContain('La presión CAE en el estrechamiento');
    expect(tarjetas[1][1]).toBe('2,760 kg/s'); // ρ·Q = 920 · 0,003
    expect(tarjetas[2][2]).toBe('0,00300 m³/s');
    expect(tarjetas[3][1]).toBe('0,78 m/s');
    expect(tarjetas[4][1]).toBe('920 kg/m³');
  });

  test('L · Venturi con agua a 10 L/s y D₂/D₁ = 0,30: 2065 Pa en zona de cavitación y −48,93 kPa con P₁ mínima', async ({
    page,
  }) => {
    expect(await poner(page, 'Caudal', 10)).toBe('10');
    expect(await poner(page, 'Ratio de estrechamiento', 0.3)).toBe('0.3');
    const aviso = page.locator('[role="status"] [role="note"]');

    // P₁ = 101.325 Pa: P₂ = 101.325 − 99.259,74 = 2.065,26 Pa, positiva y bajo los 2.339 de vapor
    let filas = await tabla(page);
    expect(filas[0]).toEqual(['Entrada', '10,0', '78,54', '1,27', '101,33 kPa', '0,00']);
    expect(filas[1]).toEqual(['Garganta', '3,0', '7,07', '14,15', '2065 Pa', '0,00']);
    expect((await panel(page))[0][1]).toBe('−99,26 kPa'); // ΔP = 500·(1,621139 − 200,140610)
    await expect(aviso).toContainText('Zona de cavitación');
    await expect(aviso).toContainText('2065 Pa');
    await expect(aviso).not.toContainText('negativa');

    // El suelo de la rejilla, 101.325 − 51·1000: P₂ = 50.325 − 99.259,74 = −48.934,74 Pa
    expect(await poner(page, 'Presión de entrada', 50325)).toBe('50325');
    filas = await tabla(page);
    expect(filas[0][4]).toBe('50,33 kPa');
    expect(filas[1][4]).toBe('−48,93 kPa');
    expect((await panel(page))[0][1]).toBe('−99,26 kPa'); // la diferencia no depende de P₁
    await expect(aviso).toContainText('Cavitación segura');
    await expect(aviso).toContainText('presión absoluta negativa');
    await expect(aviso).toContainText('−48,93 kPa');
  });

  test('R · la casilla del caso 4 (−486 Pa): signo cambiado, menos tipográfico, tolerancia y unidad pegada', async ({
    page,
  }) => {
    await seccionCasos(page).getByRole('button', { name: /^Caso 4:/ }).click();
    // Clave −486 (ΔP = −486,34 Pa) y tolerancia el 1 %: 4,86 Pa
    expect(await responder(page, '486')).toContain('el signo no');
    expect(await responder(page, '−486')).toContain('Correcto'); // el «−» que escribe la tabla
    expect(await responder(page, '-490')).toContain('Correcto'); // a 4 Pa, dentro de 4,86
    expect(await responder(page, '-491')).toContain('No es correcto'); // a 5 Pa, fuera
    const conUnidad = await responder(page, '-486 Pa');
    expect(conUnidad).toContain('Escribe un número');
    expect(conUnidad).not.toContain('NaN');
  });

  // REPARADO (22/10/2026, hallazgo 3407): cada frase de la tarjeta va en su <span key>.
  // Era: hallazgo «con la página traducida, cambiar de geometría tumba la app» (Inspector
  // 22/10/2026, familia C0312). (operativa, alto) · La tarjeta de descripción escribe la frase de
  // cada geometría como texto suelto condicional junto a sus hermanos,
  //   {geom === 'venturi' && ' En la garganta del Venturi…'}  (y las de 'desnivel' y 'estenosis'),
  // dentro del mismo <p> que «Aplicamos la ecuación de continuidad <strong>…». Con la página
  // traducida (el traductor del navegador cambia cada nodo de texto por <font>), al cambiar de
  // geometría React intenta retirar ese nodo, que ya no es hijo del <p>, y cae con NotFoundError
  // en removeChild: la pantalla entera pasa a «Algo salió mal» y solo una recarga la devuelve. Es
  // el PRIMER control de la app, y también lo disparan los casos 8-11 de aula al cargarse (cambian
  // la geometría). Existe desde la creación (10/05/2026). Receta de la familia: cada frase en su
  // propio <span> (React retira el elemento, no el texto).
  // Caso: página traducida → «Tubería con desnivel» → esperado la tubería con desnivel · obtenido
  // «Algo salió mal» y «NotFoundError: Failed to execute 'removeChild' on 'Node'».
  test('HALLAZGO 3407 · con la página traducida, cambiar de geometría no tumba la app', async ({ page }) => {
    const errores = vigilarCaida(page);
    await traducirPagina(page);
    await page.getByRole('button', { name: /Tubería con desnivel/ }).click();
    await page.waitForTimeout(400);
    await expect(page.getByText('Algo salió mal')).toHaveCount(0);
    expect(errores).toEqual([]);
    await expect(page.locator('#ctrl-desnivel')).toBeVisible();
    // Y las otras dos bocas del mismo mecanismo: la estenosis y un caso de aula que cambia la geometría
    await page.getByRole('button', { name: /Vena con estenosis/ }).click();
    await page.getByRole('button', { name: /Venturi horizontal/ }).click();
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 9:/ }).click();
    await seccion.getByRole('button', { name: /Cargar en el simulador/ }).click();
    await page.waitForTimeout(400);
    await expect(page.getByText('Algo salió mal')).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  // REPARADO (22/10/2026, hallazgo 3407): signo y cifra en un solo nodo de texto.
  // Era: el mismo hallazgo, segunda boca. La cifra grande de ΔP escribe el signo como un nodo
  // de texto aparte, {dP < 0 ? '−' : dP > 0 ? '+' : ''}, delante de «486 Pa»: al llegar ΔP a 0
  // (D₂/D₁ = 1, el tope del deslizador, o Δh = 0) la rama vacía retira el nodo «−» y, traducido,
  // cae igual. Medido aislándolo: traduciendo todo MENOS esa cifra, llevar D₂/D₁ a 1 ya no cae.
  // Caso: página traducida → D₂/D₁ = 1 con el teclado (tecla Fin) → esperado «0 Pa · Sin
  // estrechamiento no hay caída» · obtenido «Algo salió mal».
  test('HALLAZGO 3407 · con la página traducida, llevar ΔP a cero no tumba la app', async ({ page }) => {
    const errores = vigilarCaida(page);
    await traducirPagina(page);
    // Con el teclado y no con el setter: el deslizador sale de su tope con un evento real
    await page.locator(`#${CONTROL['Ratio de estrechamiento']}`).focus();
    await page.keyboard.press('End');
    await page.waitForTimeout(400);
    await expect(page.getByText('Algo salió mal')).toHaveCount(0);
    expect(errores).toEqual([]);
    // Y de vuelta: del cero a una caída (la rama vacía pasa a «−»)
    await page.keyboard.press('Home');
    await page.waitForTimeout(400);
    await expect(page.getByText('Algo salió mal')).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  // REPARADO (22/10/2026, hallazgo 3409): las siete características son las que propuso el
  // Inspector con lo que vio en la app. Era: hallazgo «el featureList del JSON-LD promete lo que la app no hace» (contenido, bajo;
  // Inspector 22/10/2026). De las siete características, tres no describen la app: «Sliders para
  // caudal, densidad, ratio de estrechamiento y altura» (la densidad son cuatro botones de fluido,
  // y falta el deslizador de presión de entrada), «Cálculo de velocidad, presión y verificación de
  // la conservación» (no se muestra ninguna verificación: ni Q por sección ni la suma
  // P + ½ρv² + ρgh) y «Comparación con líquidos reales (agua, aceite, sangre, aire)» (el aire es un
  // gas). Y calla los 12 casos para clase con corrección y el aviso de cavitación, que sí hace.
  // Caso: JSON-LD WebApplication → esperado características que la app cumple · obtenido las tres.
  test('HALLAZGO 3409 · el featureList del JSON-LD no promete lo que la app no hace', async ({ page }) => {
    const web = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? '')
        .find((t) => t.includes('"WebApplication"')) ?? '{}',
    );
    const lista = (JSON.parse(web) as { featureList?: string[] }).featureList ?? [];
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(lista.filter((f) => /sliders?|deslizador/i.test(f) && /densidad/i.test(f))).toEqual([]);
    expect(lista.filter((f) => /verificaci[oó]n de la conservaci[oó]n/i.test(f))).toEqual([]);
    expect(lista.filter((f) => /l[ií]quidos/i.test(f) && /aire/i.test(f))).toEqual([]);
  });
});

test.describe('Inspector 22/10/2026 — el lienzo en la primera pantalla de un portátil', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  // REPARADO (22/10/2026, hallazgo 3408): el lienzo va lo primero del bloque principal, con los
  // controles debajo, y en el móvil los botones de geometría van en fila. Medido tras la
  // reparación: 658 px a 1366 × 768, 820 px a 390 × 844 y 867 px a 360 × 740.
  // Era: hallazgo «el lienzo empieza por debajo de la primera pantalla» (operativa, bajo;
  // Inspector 22/10/2026). La app promete «Visualiza por qué más velocidad implica menos presión»,
  // pero antes del lienzo van el hero, el aviso legal, la banda de Stemum, los tres botones de
  // geometría, la tarjeta de descripción y los cuatro controles. Medido: el lienzo empieza a
  // 987 px con cualquier ancho de escritorio (1366 × 768: 1,29 pantallas; 1280 × 720: 1,37) y, con
  // los botones en columna, a 1.807 px a 390 × 844 y a 1.902 px a 360 × 740 (2,6 pantallas); la
  // primera cifra (la tabla) a 1.430 y 2.360 px. Nada de la tubería se ve sin desplazarse.
  // Caso: 1366 × 768, carga → esperado que el lienzo asome en la primera pantalla · obtenido su
  // borde superior a 987 px.
  test('HALLAZGO 3408 · el lienzo de la tubería asoma en la primera pantalla de un portátil de 1366 × 768', async ({
    page,
  }) => {
    const arriba = await page.evaluate(() => document.querySelector('canvas')!.getBoundingClientRect().top + scrollY);
    // Con margen: que asome lo bastante para ver los manómetros, no un píxel
    expect(arriba).toBeLessThan(768 - 80);
    // El deslizador de caudal y el lienzo caben juntos en una pantalla (lo que se arrastra y lo
    // que cambia), que es lo que había antes con los controles encima
    const juntos = await page.evaluate(() => {
      const lienzo = document.querySelector('canvas')!.getBoundingClientRect();
      const caudal = document.querySelector('#ctrl-caudal')!.getBoundingClientRect();
      return caudal.bottom - lienzo.top;
    });
    expect(juntos).toBeLessThan(768);
  });
});

test.describe('Inspector 22/10/2026 — operativa con el dedo a 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('M · sin desbordamiento, desnivel y aire con el dedo, caso 9 cargado a la vista y 10 m dentro del lienzo', async ({
    page,
  }) => {
    // Nada se sale por la derecha fuera de un contenedor desplazable (html y body cortan en x)
    const fuera = await page.evaluate(() => {
      const malos: string[] = [];
      for (const el of Array.from(document.querySelectorAll('body *'))) {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.right <= innerWidth + 1) continue;
        let n = el.parentElement;
        let contenido = false;
        while (n && n !== document.body) {
          const ox = getComputedStyle(n).overflowX;
          if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') {
            contenido = true;
            break;
          }
          n = n.parentElement;
        }
        if (!contenido) malos.push(`${el.tagName} → ${Math.round(b.right)}`);
      }
      return malos;
    });
    expect(fuera).toEqual([]);

    // Con el dedo: geometría y fluido
    await page.getByRole('button', { name: /Tubería con desnivel/ }).tap();
    await expect(page.getByRole('button', { name: /Tubería con desnivel/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(`#${CONTROL.Desnivel}`)).toBeVisible();
    await page.getByRole('button', { name: 'Aire', exact: true }).tap();
    await expect(page.locator('table tbody tr').nth(2)).toContainText('101,30 kPa');
    // Aire, 2 m de fábrica: ρ·g·h = 1,225·9,81·1 = 12,02 Pa y 24,03 Pa
    expect(await tabla(page)).toEqual([
      ['Inferior', '10,0', '78,54', '0,25', '101,33 kPa', '0,00'],
      ['Subida', '10,0', '78,54', '0,25', '101,31 kPa', '1,00'],
      ['Superior', '10,0', '78,54', '0,25', '101,30 kPa', '2,00'],
    ]);
    expect((await panel(page))[0][1]).toBe('−12 Pa');

    // La casilla de la animación responde al dedo
    const casilla = page.getByLabel(/Animación de partículas/);
    await casilla.tap();
    await expect(casilla).not.toBeChecked();

    // Caso 9 cargado con el dedo: el lienzo queda a la vista (3243) con las cifras del caso
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 9:/ }).tap();
    await seccion.getByRole('button', { name: /Cargar en el simulador/ }).tap();
    await page.waitForTimeout(1500); // el desplazamiento suave termina antes
    const filas = await tabla(page);
    expect(filas[1][4]).toBe('78,76 kPa'); // 101.325 − 920·9,81·2,5 = 78.762 Pa
    expect(filas[2][4]).toBe('56,20 kPa'); // 101.325 − 920·9,81·5 = 56.199 Pa
    const lienzoVisible = await page.evaluate(() => {
      const b = document.querySelector('canvas')!.getBoundingClientRect();
      return b.top >= 0 && b.bottom <= innerHeight;
    });
    expect(lienzoVisible).toBe(true);

    // 3242 en el lienzo de 320 px del móvil: con 10 m lo primero de la columna x = 0,85 es el
    // borde oscuro del tubo (#555), dentro del lienzo (la base está en 320 − 40 − 40 − 20 = 220 px
    // y la escala la deja a 10 m con el eje en y = 50 y el borde en y = 10)
    expect(await poner(page, 'Desnivel', 10)).toBe('10');
    await page.waitForTimeout(200);
    const diez = await primerPixelOpaco(page, 0.85);
    expect(diez, 'algo dibujado en la columna x = 0,85').not.toBeNull();
    expect(diez!.rgb[0], 'lo primero es el borde del tubo, no su relleno cortado').toBeLessThan(150);
    expect(diez!.y, 'el borde superior queda dentro del lienzo').toBeGreaterThan(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 23/10/2026 — 3.ª RE-INSPECCIÓN CON FIRMA DE ROTURA (1.232 usos). Visitas cortas del
 * 56,6 % al 69,9 % en 14 días (z 3,2). Se comprobó que las reparaciones de 6ada809e (3407-3409,
 * 22/10/2026) se sostienen y se buscó lo que impide USAR la app, en escritorio (1366 × 768) y en
 * móvil táctil (390 × 844 y 360 × 740).
 *
 * LO QUE SE SOSTIENE
 *   · 3407: la página traducida (el traductor simulado de arriba, re-traduciendo tras CADA acción,
 *     como hace el del navegador con lo que React escribe) aguantó 206 pasos en escritorio y otros
 *     206 en móvil sin «Algo salió mal» ni un error: las tres geometrías, los cuatro fluidos, cada
 *     deslizador con Inicio/Fin/flechas, «Volver a 1 atm», la animación, las tres zonas del aviso
 *     de cavitación, el tema, los doce casos (cargar, responder, pista, solución) y «Practicar».
 *     Lo que NO se sostiene con la página traducida es otra forma, la del 3297 (d): los rótulos
 *     se quedan en el valor de antes (HALLAZGO de abajo).
 *   · 3408: el lienzo empieza a 658 px en 1366 × 768. En el móvil, no (HALLAZGO de abajo).
 *   · 3409: las siete características del featureList son las que se ven hacer a la app.
 *
 * FIRMA: nada de lo medido impide usar la app. Los deslizadores responden al dedo sin arrastrar la
 * página, no hay desbordamiento horizontal a 390 ni a 360 px, el lienzo se pinta y se anima, no hay
 * errores de consola ni recargas (el segundo `framenavigated` de la carga es el replaceState de
 * Next, sin petición). 6ada809e no puede ser la causa: la firma ya estaba en las inspecciones del
 * 13/10 y del 22/10, medida antes de ese commit, y lo que cambió (span con key, el lienzo antes de
 * los controles, los botones de geometría en fila en el móvil) solo acercó la tubería.
 *
 * CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (A = π·D²/4, D₁ = 10 cm, presión ABSOLUTA,
 * ρ del aire 1,225 kg/m³ y del aceite 920, como la tabla de fluidos de la app):
 *
 *   N (normal) · Venturi, AIRE, Q = 8 L/s, D₂/D₁ = 0,40, P₁ = 101.325 Pa
 *       A₁ = π·0,05² = 7,853982·10⁻³ m² → 78,54 cm² · v₁ = 0,008/A₁ = 1,018592 m/s → «1,02»
 *       A₂ = π·0,02² = 1,256637·10⁻³ m² → 12,57 cm² · v₂ = 0,008/A₂ = 6,366198 m/s → «6,37»
 *       continuidad: v₂/v₁ = 1/0,4² = 6,25 ✔ (olvidar el cuadrado daría v₂ = 2,55)
 *       ΔP = ½·1,225·(1,037530 − 40,528473) = 0,6125·(−39,490943) = −24,19 Pa → «−24 Pa»
 *       P₂ = 101.325 − 24,19 = 101.300,81 Pa → «101,30 kPa» · ṁ = 1,225·0,008 = 0,0098 → «0,010 kg/s»
 *
 *   L (límite: los dos mínimos a la vez) · Venturi, AIRE, Q = 0,1 L/s, D₂/D₁ = 0,25
 *       v₁ = 0,0001/7,853982·10⁻³ = 0,012732 m/s → «0,01» · v₂ = 16·v₁ = 0,203718 → «0,20»
 *       ΔP = 0,6125·(0,000162 − 0,041501) = −0,0253 Pa · P₂ = 101.324,97 Pa → «101,32 kPa»
 *       ṁ = 1,225·0,0001 = 0,0001225 kg/s
 *       La tabla cuadra; la tarjeta escribe «−0 Pa» y el caudal másico «0,000 kg/s» (HALLAZGO).
 *
 *   R (rechazo) · caso 7 de aula: ṁ = ρ·Q = 920·0,0025 = 2,3 kg/s EXACTO, sin constantes
 *       «2,3» y «2,30» → correcto · «2,4» → «No es correcto. Te has desviado 0,1» · «2,3 kg/s» →
 *       «Escribe un número» · «2,28» → DEBE suspender (no es ningún redondeo de 2,3) y hoy aprueba
 *       con la tolerancia del 1 % (0,023): cabo C0267, HALLAZGO.
 *
 * HALLAZGOS de esta inspección, ABIERTOS con `test.fail()` afirmando lo correcto:
 *   · C0267 — la tolerancia relativa aprueba respuestas EXACTAS mal redondeadas (2,28 por 2,3);
 *   · el aviso del signo habla de presión en un diámetro, una velocidad o un caudal;
 *   · con aire y caudal bajo, la tarjeta escribe «−0 Pa» y el caudal másico «0,000 kg/s»;
 *   · con la página traducida, los rótulos de Q, ρ, Δh y P₁ y las tarjetas pequeñas se congelan;
 *   · en el móvil el lienzo sigue fuera de la primera pantalla (820 px a 390 × 844);
 *   · C0362 — «Diferencias de presión > 50 mmHg indican estenosis severa», sin fuente ni año;
 *   · C0362 — el FAQPage atribuye al efecto Venturi los inyectores de combustible y la
 *     predicción de trombosis en arterias artificiales, que nada de la página respalda.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Inspector 23/10/2026 — 3.ª re-inspección con firma de rotura', () => {
  const seccionCasos = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  /** Escribe en la casilla del caso, espera a que React lo tenga, pulsa «Comprobar» y lee el veredicto. */
  async function responder(page: Page, texto: string): Promise<string> {
    const casilla = seccionCasos(page).locator('#casos-respuesta');
    await casilla.fill(texto);
    await esperarValorEnReact(page, casilla, texto);
    await seccionCasos(page).getByRole('button', { name: 'Comprobar' }).click();
    // Acotado a la sección: getByRole('alert') a secas casaría con el anunciador de rutas de Next.
    const veredicto = seccionCasos(page).getByRole('alert');
    await expect(veredicto).toBeVisible();
    return ((await veredicto.textContent()) ?? '').trim();
  }

  test('N · Venturi con aire, 8 L/s y D₂/D₁ = 0,40: v₂ = 6,37 m/s, ΔP = −24 Pa y P₂ = 101,30 kPa', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Aire', exact: true }).click();
    expect(await poner(page, 'Caudal', 8)).toBe('8');
    expect(await poner(page, 'Ratio de estrechamiento', 0.4)).toBe('0.4');

    const rots = await rotulos(page);
    expect(rots).toContain('Caudal (Q = 8,0 L/s)');
    expect(rots).toContain('Ratio de estrechamiento (D₂/D₁ = 0,40)');
    expect(rots).toContain('Fluido (ρ = 1,225 kg/m³)');

    const filas = await tabla(page);
    // v₁ = 0,008/7,853982·10⁻³ = 1,018592 m/s
    expect(filas[0]).toEqual(['Entrada', '10,0', '78,54', '1,02', '101,33 kPa', '0,00']);
    // A₂ = π·0,02² = 12,57 cm² · v₂ = v₁/0,4² = 6,366198 m/s (sin el cuadrado saldría 2,55)
    // P₂ = 101.325 + 0,6125·(1,037530 − 40,528473) = 101.325 − 24,19 = 101.300,81 Pa
    expect(filas[1]).toEqual(['Garganta', '4,0', '12,57', '6,37', '101,30 kPa', '0,00']);
    expect(filas[2]).toEqual(['Salida', '10,0', '78,54', '1,02', '101,33 kPa', '0,00']);

    const tarjetas = await panel(page);
    expect(tarjetas[0][1]).toBe('−24 Pa'); // ½·1,225·(v₁² − v₂²) = 0,6125·(−39,490943) = −24,19 Pa
    expect(tarjetas[0][2]).toContain('La presión CAE en el estrechamiento');
    expect(tarjetas[1][1]).toBe('0,010 kg/s'); // ρ·Q = 1,225·0,008 = 0,0098 kg/s, a tres decimales
    expect(tarjetas[2][1]).toBe('8,00 L/s');
    expect(tarjetas[2][2]).toBe('0,00800 m³/s');
    expect(tarjetas[3][1]).toBe('6,37 m/s');
    expect(tarjetas[4][1]).toBe('1,225 kg/m³');
    expect(tarjetas[4][2]).toBe('Aire');
    // 101,30 kPa queda muy por encima de la presión de vapor (2,3 kPa): sin aviso de cavitación
    await expect(page.locator('[role="status"] [role="note"]')).toHaveCount(0);
  });

  test('L · aire en los dos mínimos (0,1 L/s y D₂/D₁ = 0,25): v₂ = 0,20 m/s y P₂ = 101,32 kPa', async ({ page }) => {
    await page.getByRole('button', { name: 'Aire', exact: true }).click();
    expect(await poner(page, 'Caudal', 0.1)).toBe('0.1');
    expect(await poner(page, 'Ratio de estrechamiento', 0.25)).toBe('0.25');

    const filas = await tabla(page);
    // v₁ = 0,0001/7,853982·10⁻³ = 0,012732 m/s · v₂ = 16·v₁ = 0,203718 m/s
    // P₂ = 101.325 + 0,6125·(0,000162 − 0,041501) = 101.325 − 0,0253 = 101.324,97 Pa
    expect(filas[0]).toEqual(['Entrada', '10,0', '78,54', '0,01', '101,33 kPa', '0,00']);
    expect(filas[1]).toEqual(['Garganta', '2,5', '4,91', '0,20', '101,32 kPa', '0,00']);
    const tarjetas = await panel(page);
    expect(tarjetas[0][2]).toContain('La presión CAE en el estrechamiento');
    expect(tarjetas[2][1]).toBe('0,10 L/s');
    expect(tarjetas[2][2]).toBe('0,00010 m³/s'); // 0,1 L/s = 0,0001 m³/s
    expect(tarjetas[3][1]).toBe('0,20 m/s');
  });

  // HALLAZGO (cálculo, bajo) — ABIERTO (Inspector 23/10/2026). La tarjeta de ΔP antepone el signo
  // a `fmtPresion(|ΔP|)`, y `fmt` da 0 a lo que no llega a media unidad: con aire, toda caída de
  // menos de 0,5 Pa sale «−0 Pa» junto a «La presión CAE en el estrechamiento» (con D₂/D₁ = 0,5,
  // cualquier caudal por debajo de 1,8 L/s). El catálogo ya decidió que el cero no lleva signo
  // (formatNumber y redondearA, hallazgo 346: «pH −0,00»). Y el caudal másico va a tres decimales
  // fijos: con aire y Q ≤ 0,4 L/s, ṁ = 1,225·Q·10⁻³ < 0,0005 kg/s se escribe «0,000 kg/s», un
  // caudal másico nulo con el aire en movimiento.
  // Caso: aire, Q = 0,1 L/s, D₂/D₁ = 0,25 → esperado ΔP = −0,025 Pa y ṁ = 0,0001225 kg/s (cifras
  // distintas de cero, o un «≈0» sin signo) · obtenido «−0 Pa» y «0,000 kg/s».
  test('HALLAZGO · con aire y caudal bajo, la tarjeta no escribe «−0 Pa» ni un caudal másico de 0,000 kg/s', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: «−0 Pa» y «0,000 kg/s» con aire a 0,1 L/s');
    await page.getByRole('button', { name: 'Aire', exact: true }).click();
    expect(await poner(page, 'Caudal', 0.1)).toBe('0.1');
    expect(await poner(page, 'Ratio de estrechamiento', 0.25)).toBe('0.25');
    const tarjetas = await panel(page);
    // ΔP = 0,6125·(0,000162 − 0,041501) = −0,0253 Pa: una caída, no un cero con signo
    expect(tarjetas[0][1]).not.toMatch(/^[−-]0 Pa$/);
    // ṁ = 1,225·0,0001 = 0,0001225 kg/s: el aire se mueve, su caudal másico no es cero
    expect(tarjetas[1][1]).not.toBe('0,000 kg/s');
  });

  test('R · caso 7 de aula (ṁ = 2,3 kg/s exacto): acierto, fallo con su desviación y unidad pegada', async ({
    page,
  }) => {
    await seccionCasos(page).getByRole('button', { name: /^Caso 7:/ }).click();
    // ṁ = ρ·Q = 920 · 0,0025 = 2,3 kg/s: sin constantes ni redondeos intermedios
    expect(await responder(page, '2,3')).toContain('¡Correcto!');
    expect(await responder(page, '2,30')).toContain('¡Correcto!');
    const lejos = await responder(page, '2,4');
    expect(lejos).toContain('No es correcto');
    expect(lejos).toContain('Te has desviado 0,1 de la respuesta'); // |2,4 − 2,3| = 0,1
    const conUnidad = await responder(page, '2,3 kg/s');
    expect(conUnidad).toContain('Escribe un número');
    expect(conUnidad).not.toContain('NaN');
  });

  // HALLAZGO (cálculo, medio) — ABIERTO (Inspector 23/10/2026, cabo C0267). `comprobarRespuesta`
  // corrige con `toleranciaRelativa` (el mayor entre 0,01 y el 1 %) también cuando la respuesta es
  // EXACTA, y aprueba cifras que no son ningún redondeo de ella. Caso 7: ṁ = 920·0,0025 = 2,3 kg/s
  // sin una sola constante → aprueba 2,28 y 2,32. Caso 2: v₂ = 1,5·(10/5)² = 6 m/s (π se cancela)
  // → aprueba 5,94 y 6,05. Caso 3: D₂ = 2·√(1,5/6) = 1 cm → aprueba 0,99 y 1,01. Precedentes
  // reparados pasando a la política de redondeo: 3342 (movimiento-circular), 3363 (tabla-periódica),
  // 3322 (genética). El caso 10 (6,25 exacto) SÍ arrastra un redondeo legítimo —su enunciado manda
  // usar las áreas de la tabla, 78,54/12,57 = 6,248—, y la reparación debe seguir aceptándolo.
  // Caso: caso 7 → «2,28» → esperado «No es correcto» · obtenido «✅ ¡Correcto!».
  // REPARADO (hallazgo 3424): `toleranciaDe` da 0 a la respuesta exacta y deja la relativa para la
  // que exige redondear y para el caso 10, cuyo enunciado manda arrastrar el redondeo de la tabla.
  test('REPARADO (3424) · C0267: una respuesta exacta no aprueba lo que no es ningún redondeo de ella', async ({ page }) => {
    const caso7 = CASOS_AULA.find((c) => c.id === 7)!;
    expect(caso7.respuesta).toBe(2.3); // 920 · 0,0025
    // En el motor: |2,28 − 2,3| = 0,02, y la tolerancia de un 2,3 exacto es 0
    expect(comprobarRespuesta(2.28, caso7.respuesta, { exacto: caso7.exacto, decimales: 1 }).correcto).toBe(false);
    await seccionCasos(page).getByRole('button', { name: /^Caso 7:/ }).click();
    expect(await responder(page, '2,28')).toContain('No es correcto');
    expect(await responder(page, '2,32')).toContain('No es correcto');
    // Con tolerancia 0 la desviación de milésimas no se escribe «0»: |2,301 − 2,3| = 0,001
    expect(await responder(page, '2,301')).toContain('Te has desviado 0,001 de la respuesta');
    // Caso 2: 6 m/s exacto (π se cancela); 5,94 está a 0,06, justo el 1 %
    await seccionCasos(page).getByRole('button', { name: /^Caso 2:/ }).click();
    expect(await responder(page, '5,94')).toContain('No es correcto');
    expect(await responder(page, '6')).toContain('¡Correcto!');
    // Caso 3: D₂ = 2·√(1,5/6) = 1 cm exacto
    await seccionCasos(page).getByRole('button', { name: /^Caso 3:/ }).click();
    expect(await responder(page, '0,99')).toContain('No es correcto');
    // Caso 10: 6,25 exacto, pero 78,54/12,57 = 6,248 con las áreas de la tabla sigue valiendo
    await seccionCasos(page).getByRole('button', { name: /^Caso 10:/ }).click();
    expect(await responder(page, '6,248')).toContain('¡Correcto!');
    expect(await responder(page, '6,25')).toContain('¡Correcto!');
    // Caso 4 (−486,34 Pa → «−486»): exige redondear, la relativa sigue (±4,86 Pa)
    await seccionCasos(page).getByRole('button', { name: /^Caso 4:/ }).click();
    expect(await responder(page, '−489')).toContain('¡Correcto!');
  });

  // HALLAZGO (contenido, bajo) — ABIERTO (Inspector 23/10/2026). `comprobarRespuesta` da el aviso
  // del signo —«El valor es correcto pero el signo no: ¿la presión sube o baja entre esas dos
  // secciones?»— a CUALQUIER respuesta con el signo cambiado, también donde no hay presión ni
  // secciones: la velocidad del caso 1, la del 2, el diámetro del 3, el caudal másico del 7 y el
  // caudal del 12 (y la velocidad y el caudal másico del modo práctica). A quien escribe un
  // diámetro negativo le dice que «el valor es correcto» y le pregunta por la presión.
  // Caso: caso 3 (D₂ = 1 cm) → «−1» → esperado un rechazo que no hable de presión (un diámetro no
  // es negativo) · obtenido «❌ El valor es correcto pero el signo no: ¿la presión sube o baja
  // entre esas dos secciones?».
  // REPARADO (hallazgo 3425): el aviso del signo solo en las diferencias de presión; en las demás
  // magnitudes un negativo es imposible y se dice por qué.
  test('REPARADO (3425) · el aviso del signo no habla de presión en un diámetro, una velocidad o un caudal', async ({
    page,
  }) => {
    await seccionCasos(page).getByRole('button', { name: /^Caso 3:/ }).click();
    const diametro = await responder(page, '−1'); // D₂ = 2·√(1,5/6) = 1 cm
    expect(diametro).not.toContain('¡Correcto!');
    expect(diametro).not.toMatch(/presión/);
    expect(diametro).toContain('Un diámetro no puede ser negativo');
    await seccionCasos(page).getByRole('button', { name: /^Caso 7:/ }).click();
    const masico = await responder(page, '−2,3'); // ṁ = 2,3 kg/s
    expect(masico).not.toMatch(/presión/);
    expect(masico).toContain('Un caudal másico no puede ser negativo');
    // En una diferencia de presión el aviso del signo sigue: caso 4, P₂ − P₁ = −486 Pa
    await seccionCasos(page).getByRole('button', { name: /^Caso 4:/ }).click();
    expect(await responder(page, '486')).toContain('el signo no');
  });

  // REGRESIÓN del 3407 (reparado el 22/10/2026), con el recorrido entero y no solo el cambio de
  // geometría: se re-traduce tras cada acción, porque el traductor del navegador también traduce
  // lo que React acaba de escribir.
  test('3407 se sostiene · traducida, geometrías, fluidos, deslizadores, cavitación y casos no tumban la app', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const errores = vigilarCaida(page);
    const sigueViva = async (que: string): Promise<void> => {
      await page.waitForTimeout(100);
      await traducirPagina(page);
      await expect(page.getByText('Algo salió mal'), que).toHaveCount(0);
      expect(errores, que).toEqual([]);
      await expect(page.locator(`#${CONTROL.Caudal}`), que).toHaveCount(1);
    };
    const teclas = async (id: string, lista: string[]): Promise<void> => {
      await page.locator(`#${id}`).focus();
      for (const k of lista) {
        await page.keyboard.press(k);
        await sigueViva(`${id} · ${k}`);
      }
    };

    await traducirPagina(page);
    for (const [geometria, segundo] of [
      [/Tubería con desnivel/, CONTROL.Desnivel],
      [/Vena con estenosis/, CONTROL['Ratio de estrechamiento']],
      [/Venturi horizontal/, CONTROL['Ratio de estrechamiento']],
    ] as const) {
      await page.getByRole('button', { name: geometria }).click();
      await sigueViva(`geometría ${geometria.source}`);
      for (const f of ['Aire', 'Sangre', 'Aceite', 'Agua']) {
        await page.getByRole('button', { name: f, exact: true }).click();
        await sigueViva(`fluido ${f}`);
      }
      await teclas(CONTROL.Caudal, ['End', 'Home', 'ArrowRight']);
      await teclas(segundo, ['Home', 'End', 'ArrowLeft']);
      await teclas(CONTROL['Presión de entrada'], ['Home', 'End']);
      await page.getByRole('button', { name: /Volver a 1 atm/ }).click();
      await sigueViva('Volver a 1 atm');
      await page.getByLabel(/Animación de partículas/).click();
      await sigueViva('animación apagada');
      await page.getByLabel(/Animación de partículas/).click();
      await sigueViva('animación encendida');
    }

    // Venturi con agua y 10 L/s, las tres zonas del aviso (P₁ = 1 atm):
    //   D₂/D₁ = 0,25 → P₂ = −105,37 kPa (negativa) · 0,30 → 2065 Pa (zona) · 0,40 → 70,47 kPa (sin
    //   aviso) · 1 → ΔP = 0 (la rama sin signo de la tarjeta)
    await teclas(CONTROL.Caudal, ['End']);
    await teclas(CONTROL['Ratio de estrechamiento'], ['Home', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'End', 'Home']);

    // Los casos que cambian la geometría al cargarse, y el modo práctica
    for (const n of [8, 9, 10, 11]) {
      await seccionCasos(page).getByRole('button', { name: new RegExp(`^Caso ${n}:`) }).click();
      await sigueViva(`caso ${n}`);
      await seccionCasos(page).getByRole('button', { name: /Cargar en el simulador/ }).click();
      await sigueViva(`caso ${n} · cargar`);
    }
    for (let i = 0; i < 2; i++) {
      await seccionCasos(page).getByRole('button', { name: /Practicar/ }).click();
      await sigueViva('practicar');
      await seccionCasos(page).getByRole('button', { name: /Cargar en el simulador/ }).click();
      await sigueViva('practicar · cargar');
    }
  });

  // HALLAZGO (operativa, medio) — ABIERTO (Inspector 23/10/2026). Con la página traducida no cae
  // (3407), pero los rótulos de los controles y las tarjetas pequeñas se quedan en el valor que
  // tenían al traducir. Escriben la cifra como un nodo de texto JUNTO a su unidad
  // (`{fmt(Q, 1)} L/s`, `{fmtDensidad(rho)} kg/m³`, `{fmt(alturaDesnivel, 1)} m`, `{fmt(P0/1000, 1)}
  // kPa`, las tarjetas de ṁ, caudal, v máxima y densidad, y el «(de Entrada a Garganta)» del
  // rótulo de ΔP): el traductor cambia ese nodo por <font> y React sigue escribiendo en el que ya
  // no está en la página. Es la forma del hallazgo 3297 (d) de simulador-genetica, que se reparó
  // dejando cada texto variable como ÚNICO hijo de su elemento; la tabla y la cifra de ΔP, que ya
  // lo son, sí siguen al control. Medido: caudal a 10 L/s y «Aire» → el rótulo dice «Caudal (Q =
  // 2,0 L/s)» y «Fluido (ρ = 1000 kg/m³)», y la tarjeta «Densidad del fluido · 1000 kg/m³ · Aire»;
  // con desnivel de 10 m, «Desnivel (Δh = 2,0 m)» y «(de Entrada a Garganta)».
  // Caso: página traducida → caudal al tope (10 L/s) y «Aire» → esperado «Caudal (Q = 10,0 L/s)»
  // y «1,225 kg/m³» · obtenido «Caudal (Q = 2,0 L/s)» y «1000 kg/m³» junto a «Aire».
  test('HALLAZGO · traducida, los rótulos de los deslizadores y las tarjetas siguen al valor', async ({ page }) => {
    test.fail(true, 'ABIERTO: con la página traducida, Q, ρ, Δh, P₁ y las tarjetas pequeñas se congelan');
    await traducirPagina(page);
    await page.locator(`#${CONTROL.Caudal}`).focus();
    await page.keyboard.press('End'); // 10 L/s
    await page.getByRole('button', { name: 'Aire', exact: true }).click();
    await page.waitForTimeout(300);
    await traducirPagina(page);
    // La tabla sí sigue: v₂ = 0,01/1,963495·10⁻³ = 5,09 m/s en la garganta
    expect((await tabla(page))[1][3]).toBe('5,09');
    expect(((await page.locator(`label[for="${CONTROL.Caudal}"]`).textContent()) ?? '').trim()).toBe(
      'Caudal (Q = 10,0 L/s)',
    );
    expect(((await page.locator('#rotulo-fluido').textContent()) ?? '').trim()).toBe('Fluido (ρ = 1,225 kg/m³)');
    const tarjetas = await panel(page);
    expect(tarjetas[2][1]).toBe('10,00 L/s');
    expect(tarjetas[4][1]).toBe('1,225 kg/m³');
  });

  // HALLAZGO (contenido, medio) — ABIERTO (Inspector 23/10/2026, cabo C0362). La tarjeta
  // «Circulación sanguínea y estenosis» del bloque educativo dice: «Una arteria parcialmente
  // bloqueada (estenosis) acelera la sangre en la zona estrecha. La presión local cae, lo que el
  // ecocardiograma Doppler detecta y cuantifica. Diferencias de presión > 50 mmHg indican estenosis
  // severa.» Es una cifra clínica sin fuente ni año (neutralidad, regla 1), sin decir si es el
  // gradiente medio o el máximo ni de qué válvula o vaso (habla de «una arteria» y del
  // «ecocardiograma»), y la misma tarjeta advierte justo debajo que la geometría no sirve «para
  // interpretar un Doppler». Un Bernoulli ideal en un tubo de 10 cm no puede respaldar un umbral
  // diagnóstico. El cabo la señala como el umbral antiguo de la estenosis aórtica; no se coteja con
  // una guía clínica (no hay fuente oficial a mano), y no hace falta: sin fuente no debe estar.
  // Caso: bloque educativo → esperado sin umbral clínico, o con fuente, año y qué gradiente mide ·
  // obtenido «Diferencias de presión > 50 mmHg indican estenosis severa».
  test('HALLAZGO · C0362: el bloque educativo no da un umbral clínico sin fuente', async ({ page }) => {
    test.fail(true, 'ABIERTO: «Diferencias de presión > 50 mmHg indican estenosis severa», sin fuente ni año');
    const cuerpo = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(cuerpo).toContain('La escala de esta geometría no es fisiológica.'); // la misma tarjeta
    expect(cuerpo).not.toContain('Diferencias de presión > 50 mmHg indican estenosis severa');
  });

  // HALLAZGO (contenido, bajo) — ABIERTO (Inspector 23/10/2026, cabo C0362). La respuesta del
  // FAQPage «¿Qué es el efecto Venturi y dónde se aplica?» termina: «Se aplica en carburadores de
  // motores, inyectores de combustible, venturímetros de medición de caudal, nebulizadores médicos
  // y en el diseño de arterias artificiales para predecir zonas de trombosis.» Las zonas de
  // trombosis son de recirculación y de esfuerzo cortante en la pared, fenómenos viscosos que el
  // modelo ideal no contiene —lo dice la respuesta de limitaciones de ese mismo FAQPage: Bernoulli
  // «no se aplica directamente a fluidos viscosos… ni al flujo turbulento»—; y un inyector
  // pulveriza por la presión de su bomba, no por la depresión del estrechamiento (eso es el
  // carburador, que la lista ya nombra). La página visible no menciona ninguna de las dos: sus
  // aplicaciones del Venturi son «plantas químicas, motores y conductos de aire acondicionado».
  // Caso: FAQPage → esperado aplicaciones que la página y el modelo respaldan · obtenido
  // «inyectores de combustible» y «arterias artificiales para predecir zonas de trombosis».
  test('HALLAZGO · C0362: el FAQPage no atribuye al efecto Venturi lo que la página no respalda', async ({ page }) => {
    test.fail(true, 'ABIERTO: «inyectores de combustible» y «predecir zonas de trombosis» en el FAQPage');
    const faq = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
          .map((s) => s.textContent ?? '')
          .find((t) => t.includes('FAQPage')) ?? '',
    );
    const datos = JSON.parse(faq) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    const venturi = datos.mainEntity.find((q) => /efecto Venturi/i.test(q.name));
    expect(venturi, 'la pregunta del efecto Venturi sigue en el FAQPage').toBeDefined();
    expect(venturi!.acceptedAnswer.text).not.toMatch(/trombosis/i);
    expect(venturi!.acceptedAnswer.text).not.toMatch(/inyectores de combustible/i);
  });
});

test.describe('Inspector 23/10/2026 — la primera pantalla del móvil', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // HALLAZGO (operativa, bajo) — ABIERTO (Inspector 23/10/2026). La reparación del 3408 llevó el
  // lienzo a la primera pantalla del portátil (658 px en 1366 × 768), pero el hallazgo medía
  // también el móvil, y ahí sigue fuera: antes del lienzo van el logotipo fijo, el hero (316 px:
  // el título en tres líneas a 1,9 rem, que no se reduce en el móvil, y 80 px de margen), el aviso
  // legal, la banda de Stemum (121 px) y los botones de geometría. Medido: el lienzo empieza a 820
  // px en 390 × 844 (asoman 24 px, por encima de los rótulos de los manómetros, que van a 24-36 px
  // de su borde) y a 867 px en 360 × 740 (fuera del todo). Quien llega desde el móvil ve el título,
  // los enlaces legales y tres botones, no la tubería que la app promete «visualizar».
  // Caso: 390 × 844, carga → esperado el lienzo asomando con sus manómetros (como en el portátil,
  // al menos 80 px) · obtenido su borde superior a 820 px.
  test('HALLAZGO · en un móvil de 390 × 844 el lienzo asoma en la primera pantalla, como en el portátil (3408)', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: el lienzo empieza a 820 px en 390 × 844 y a 867 px en 360 × 740');
    const arriba = await page.evaluate(() => document.querySelector('canvas')!.getBoundingClientRect().top + scrollY);
    expect(arriba).toBeLessThan(844 - 80);
  });
});
