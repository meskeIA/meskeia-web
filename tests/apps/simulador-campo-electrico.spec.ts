import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-campo-electrico (segmento CÁLCULO / física, riesgo 3, 415 usos)
 *
 * Primera inspección: 24/08/2026. El <h1> promete «Simulador de Campo Eléctrico» y el
 * subtítulo «Coloca cargas, observa líneas de campo y mide fuerza sobre una carga de
 * prueba». La metadata añade «Calcula E, V, F y U sobre una carga de prueba». Hay, por
 * tanto, verdad física comprobable: el build no ve la física mal, así que aquí se comprueban
 * NÚMEROS contra la ley de Coulomb y el principio de superposición resueltos a mano, y
 * también el SENTIDO de los vectores dibujados, que una magnitud correcta no garantiza.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-campo-electrico/page.tsx  (no hay motor.ts; todo está en el componente)
 *     · K_COULOMB = 8.99e9 N·m²/C²   ·   NC_TO_C = 1e-9   (las cargas se meten en nC)
 *     · calcularCampoEnPunto(x, y, cargas) devuelve { Ex, Ey, V }
 *         para cada carga:  dx = x − c.x ; dy = y − c.y ; r² = dx² + dy²
 *         si r < 0,05 m se DESCARTA esa carga (guardia de singularidad, ver CASO 3c)
 *         factor = k·q/r³ ;  Ex += factor·dx ;  Ey += factor·dy ;  V += k·q/r
 *         El vector sale de restar POSICIÓN DEL PUNTO menos POSICIÓN DE LA CARGA, así que
 *         con q > 0 el campo se ALEJA de la carga y con q < 0 se dirige HACIA ella.
 *     · datosPrueba: q₀ = +1 nC fija · E = raíz(Ex²+Ey²) · F = q₀·E · U = q₀·V
 *     · sufijoNotacion(n): notación científica solo si |n| >= 1e6 o |n| < 1e-3
 *   lib/formatters.ts con formatNumber(n, d), que usa toLocaleString es-ES
 *
 * UNIDADES QUE DECLARA (comprobadas): E en N/C (la tabla educativa dice «N/C o V/m», que es
 * la equivalencia correcta), V en voltios, F en newtons, U en julios, posiciones y distancias
 * en metros, cargas en nC. La constante del código (8,99 × 10⁹) COINCIDE con la que enuncia
 * el FAQPage de metadata.ts («k ≈ 8,99 × 10⁹ N·m²/C²»): no hay divergencia texto-motor.
 * (Desvío frente al valor CODATA 8,9875518 × 10⁹: +0,027 %, invisible a dos decimales.)
 *
 * NOTA DE FORMATO: es-ES (CLDR minimumGroupingDigits = 2) NO agrupa los números de cuatro
 * cifras, pero sí los de cinco: por eso 12536,98 se escribe «12.536,98». Coma decimal en
 * todo el panel. No hay ni un toFixed() de presentación en page.tsx (los dos que aparecen
 * son para coordenadas del path SVG y para normalizar la mantisa).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   Constante común:  k·q = 8,99×10⁹ · 5×10⁻⁹ = 44,95 N·m²/C   (una carga de 5 nC)
 *
 *   CASO 1 (normal) — UNA carga puntual +5 nC en (0, 0); la sonda q₀ = +1 nC arranca en
 *   (1,50; 0,70) m, que es su posición por defecto: no hace falta arrastrar nada.
 *       r²  = 1,5² + 0,7² = 2,25 + 0,49 = 2,74 m²
 *       r   = raíz(2,74)  = 1,6552946 m         r³ = 2,74 · 1,6552946 = 4,5355072 m³
 *       |E| = k·|q|/r²    = 44,95 / 2,74        = 16,405109 N/C    → «16,41 N/C»
 *       Ex  = k·q·dx/r³   = 44,95·1,5 / 4,5355072 = 67,425/4,5355072 = 14,866033 → «14,87 N/C»
 *       Ey  = k·q·dy/r³   = 44,95·0,7 / 4,5355072 = 31,465/4,5355072 =  6,937483 → «6,94 N/C»
 *         (control: raíz(14,866033² + 6,937483²) = raíz(220,9989 + 48,1287) = 16,4051 ✔)
 *         SENTIDO: la carga es POSITIVA y la sonda está arriba-derecha, así que el campo se
 *         aleja de ella y las DOS componentes salen positivas. Un signo invertido aquí sería
 *         un fallo de física aunque el módulo cuadrase.
 *       V   = k·q/r       = 44,95 / 1,6552946   = 27,155288 V      → «27,16 V»
 *       F   = q₀·|E|      = 1×10⁻⁹ · 16,405109  = 1,6405109×10⁻⁸ N → «1,64 × 10⁻⁸ N»
 *       U   = q₀·V        = 1×10⁻⁹ · 27,155288  = 2,7155288×10⁻⁸ J → «2,72 × 10⁻⁸ J»
 *
 *   CASO 1.bis (el espejo, que es lo que caza un signo invertido) — la MISMA carga con signo
 *   −5 nC en (0, 0) y la sonda en el mismo sitio: los módulos no cambian (|E| = 16,41 N/C,
 *   |F| = 1,64 × 10⁻⁸ N) pero el campo apunta HACIA la carga y el potencial es negativo:
 *       Ex = −14,87 N/C · Ey = −6,94 N/C · V = −27,16 V · U = −2,72 × 10⁻⁸ J
 *
 *   CASO 1.ter (superposición, sin tocar nada) — el estado de arranque es el dipolo
 *   +5 nC en (−0,50; 0) y −5 nC en (0,50; 0), con la sonda en (1,50; 0,70):
 *       carga +:  dx = 2,00 · dy = 0,70 · r² = 4,49 · r = 2,1189620 · r³ = 9,5141395
 *                 factor = +44,95/9,5141395 = +4,724548
 *                 Ex1 = +9,449096   Ey1 = +3,307184   V1 = +44,95/2,1189620 = +21,213219
 *       carga −:  dx = 1,00 · dy = 0,70 · r² = 1,49 · r = 1,2206556 · r³ = 1,8187768
 *                 factor = −44,95/1,8187768 = −24,714405
 *                 Ex2 = −24,714405  Ey2 = −17,300084  V2 = −44,95/1,2206556 = −36,824477
 *       Ex = 9,449096 − 24,714405 = −15,265309 → «-15,27 N/C»
 *       Ey = 3,307184 − 17,300084 = −13,992900 → «-13,99 N/C»
 *       |E| = raíz(233,0297 + 195,8013) = raíz(428,8310) = 20,708235 → «20,71 N/C»
 *       V  = 21,213219 − 36,824477 = −15,611258 → «-15,61 V»
 *
 *   CASO 2 (límite) — dipolo y sonda en el PUNTO MEDIO (0, 0): el sitio donde el campo NO se
 *   anula sino que se DUPLICA, mientras el potencial sí se anula. Es justo el par que se
 *   confunde, así que se comprueban los dos a la vez.
 *       de la carga +5 nC de (−0,50; 0):  r = 0,50 m → E1 = 44,95/0,25 = 179,8 N/C hacia +x
 *                                         (se ALEJA de la carga positiva)
 *       de la carga −5 nC de (+0,50; 0):  r = 0,50 m → E2 = 44,95/0,25 = 179,8 N/C hacia +x
 *                                         (se dirige HACIA la carga negativa)
 *       Los dos apuntan al MISMO lado (de + hacia −), así que se suman:
 *       Ex = 179,8 + 179,8 = 359,6 N/C → «359,60 N/C»   ·   Ey = 0 → «0 N/C»
 *       |E| = 359,60 N/C   ·   F = 1×10⁻⁹ · 359,6 = 3,596×10⁻⁷ N → «3,60 × 10⁻⁷ N»
 *       V   = +44,95/0,5 − 44,95/0,5 = +89,9 − 89,9 = 0 V exactos → «0 V» (y U = «0 J»)
 *       Si el panel diese |E| = 0 aquí, estaría anulando vectores que se suman: fallo grave.
 *
 *   CASO 2.bis (el simétrico, el que SÍ se anula) — cuadrupolo (+5 en (−0,6;−0,6) y (0,6;0,6),
 *   −5 en (−0,6;0,6) y (0,6;−0,6)) con la sonda en el centro (0, 0): las cuatro contribuciones
 *   están a la misma distancia y se cancelan dos a dos, de modo que E = 0 Y V = 0. Es
 *   literalmente lo que la propia FAQ de la app afirma («en un cuadrupolo simétrico, el
 *   centro tiene E = 0»), así que aquí el texto y el motor tienen que coincidir.
 *
 *   CASO 3 (rechazo / degradación) — tres maneras de romperlo:
 *     (a) sistema SIN cargas («Limpiar todo»): E, Ex, Ey, V, F y U valen «0», sin NaN,
 *         sin «Infinity», sin infinito y sin «No definido».
 *     (b) magnitud de la carga nueva fuera de rango: el <input type="range"> declara
 *         min = 0,1 y max = 10, así que el navegador satura solo — 0 → 0,1 · −7 → 0,1 ·
 *         999 → 10. Nunca llega al cálculo una carga nula ni una «magnitud» negativa.
 *     (c) r → 0: la sonda EXACTAMENTE encima de una carga. La guardia `if (r < 0,05) continue`
 *         evita el infinito, pero lo hace descartando la carga entera:
 *           a r = 0,06 m de la carga + (sonda en x = −0,44), todavía fuera de la guardia:
 *             de la carga +5:  44,95/0,06² = 44,95/0,0036 = 12.486,111 N/C hacia +x
 *             de la carga −5:  dx = −0,94 · r = 0,94 · r³ = 0,830584
 *                              factor = −44,95/0,830584 = −54,1189 → Ex = +50,872
 *             Ex = 12.486,111 + 50,872 = 12.536,98 N/C → «12.536,98 N/C» ✔ correcto
 *           a r = 0 (sonda en x = −0,50, sobre la carga), ya dentro de la guardia:
 *             la carga +5 desaparece del sumatorio y solo queda la −5 a 1 m:
 *             Ex = 44,95/1² = 44,95 N/C y V = −44,95 V.
 *         El salto de 12.536,98 a 44,95 N/C (×279) ocurre en un centímetro y sin ningún
 *         aviso: es el HALLAZGO ABIERTO de más abajo. El CASO 3 fotografía lo que hace hoy.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * HALLAZGOS DEL INSPECTOR (24/08/2026) — REPARADOS el 24/08/2026, y este fichero los blinda
 *   · 215 · Singularidad silenciosa. Dentro de 5 cm de una carga, calcularCampoEnPunto la
 *     descartaba y devolvía el campo de LAS DEMÁS como si aquélla no existiera, con el mismo
 *     formato y sin marca alguna: encima de la carga +5 nC del dipolo el panel rotulaba
 *     |E| = 44,95 N/C y V = −44,95 V, potencial NEGATIVO donde está la carga POSITIVA. Ahora
 *     se dice que ahí el campo diverge y las magnitudes salen con un guion. Ver CASO 3c.
 *   · 216 · La sonda se perdía fuera del lienzo (setPointerCapture mantiene el arrastre más
 *     allá del borde y setPruebaPos no acotaba nada): el círculo dejaba de dibujarse y el
 *     panel seguía dando cifras de un punto invisible, sin más salida que recargar. Acotada.
 *   · 217 · La tarjeta «Universitario de ingeniería» afirmaba que «3 cargas en línea aproximan
 *     un condensador». El preset son tres cargas POSITIVAS: eso aproxima un hilo cargado, y la
 *     propia app lo desmentía (en el centro E = 0 pero V = 71,92 V).
 *   · 218 · Los cuatro botones de «Modo de edición» no declaraban aria-pressed pese a tener
 *     estado visual activo y decidir qué hace un clic en el lienzo (añadir + / añadir − /
 *     mover / ELIMINAR). Regla 2 del CLAUDE.md §5.
 *   · 219 · El bloque educativo visible nunca decía cuánto vale k, pese a que su guía manda
 *     «aplica E = kq/r²» y comparar el resultado con el panel. Estaba solo en el JSON-LD.
 *   · 220 · El panel escribía la potencia de diez con circunflejo ASCII (10^-8) mientras el
 *     bloque educativo de la misma página usa superíndices reales (10⁻⁹, r², C·m).
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-campo-electrico/';

/** Escritorio ancho: por debajo de 900 px el lienzo pasa a una columna y el arrastre cambia. */
test.use({ viewport: { width: 1400, height: 1000 } });

/**
 * Valor de una fila del panel de resultados: se busca el <span> cuyo texto es EXACTAMENTE la
 * etiqueta y se toma su hermano inmediato. El anclaje ^…$ evita colisionar con la leyenda de
 * colores, que vive en el mismo bloque role="status".
 */
function valor(page: Page, etiqueta: string) {
  const escapada = etiqueta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page
    .locator('[role="status"] span')
    .filter({ hasText: new RegExp(`^${escapada}$`) })
    .first()
    .locator('xpath=following-sibling::span[1]');
}

const lienzo = (page: Page) => page.locator('svg[aria-label="Lienzo del campo eléctrico"]');

/**
 * Arrastra la sonda q₀ hasta unas coordenadas del viewBox (800 × 500, origen del mundo en
 * 400/250 y 100 px por metro). Se traduce con la matriz de pantalla del propio SVG, que es
 * la misma que usa la app en pointerASvg, así que el aterrizaje es exacto: 400/250 da (0, 0).
 */
async function arrastrarSonda(page: Page, sx: number, sy: number): Promise<void> {
  await lienzo(page).scrollIntoViewIfNeeded();
  const p = await lienzo(page).evaluate(
    (svg: SVGSVGElement, destino: { x: number; y: number }) => {
      const m = svg.getScreenCTM();
      if (!m) throw new Error('El SVG no tiene matriz de pantalla');
      const sonda = svg.querySelector('circle[data-tipo="prueba"]');
      if (!sonda) throw new Error('No se encuentra la carga de prueba');
      const cx = Number(sonda.getAttribute('cx'));
      const cy = Number(sonda.getAttribute('cy'));
      return {
        desdeX: m.a * cx + m.e,
        desdeY: m.d * cy + m.f,
        hastaX: m.a * destino.x + m.e,
        hastaY: m.d * destino.y + m.f,
      };
    },
    { x: sx, y: sy },
  );
  await page.mouse.move(p.desdeX, p.desdeY);
  await page.mouse.down();
  await page.mouse.move(p.hastaX, p.hastaY, { steps: 12 });
  await page.mouse.up();
}

/** Clic en unas coordenadas del viewBox (para colocar una carga en un punto exacto). */
async function clicEnLienzo(page: Page, sx: number, sy: number): Promise<void> {
  await lienzo(page).scrollIntoViewIfNeeded();
  const p = await lienzo(page).evaluate(
    (svg: SVGSVGElement, destino: { x: number; y: number }) => {
      const m = svg.getScreenCTM();
      if (!m) throw new Error('El SVG no tiene matriz de pantalla');
      return { x: m.a * destino.x + m.e, y: m.d * destino.y + m.f };
    },
    { x: sx, y: sy },
  );
  await page.mouse.click(p.x, p.y);
}

/** Escribe un valor en el slider de magnitud (un range no acepta fill()). */
async function ponerMagnitud(page: Page, v: number | string): Promise<void> {
  await page.locator('#magnitud').evaluate((el: HTMLInputElement, texto: string) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (!setter) throw new Error('No se puede escribir en el input');
    setter.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, String(v));
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Simulador de Campo Eléctrico');
  await expect(lienzo(page)).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// CASO 1 — normal: una sola carga puntual, magnitud, componentes, potencial y SENTIDO
// ═══════════════════════════════════════════════════════════════════════════════════════
test('CASO 1 · carga puntual +5 nC en (0,0) y sonda en (1,50; 0,70): E = k|q|/r² = 44,95/2,74', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Carga puntual aislada' }).click();

  // La sonda no se ha tocado: sigue en su posición de arranque.
  await expect(valor(page, 'Posición x')).toHaveText('1,50 m');
  await expect(valor(page, 'Posición y')).toHaveText('0,70 m');

  // r² = 1,5² + 0,7² = 2,74 m² · |E| = 8,99e9 · 5e-9 / 2,74 = 44,95/2,74 = 16,405109 N/C
  await expect(valor(page, '|E| (campo)')).toHaveText('16,41 N/C');
  // Ex = 44,95 · 1,5 / r³ = 67,425 / 4,5355072 = 14,866033 → positivo: se ALEJA de la carga +
  await expect(valor(page, 'Eₓ')).toHaveText('14,87 N/C');
  // Ey = 44,95 · 0,7 / r³ = 31,465 / 4,5355072 = 6,937483 → positivo por el mismo motivo
  await expect(valor(page, 'Eᵧ')).toHaveText('6,94 N/C');
  // V = k·q/r = 44,95 / 1,6552946 = 27,155288 V (positivo: carga positiva)
  await expect(valor(page, 'V (potencial)')).toHaveText('27,16 V');
  // F = q₀·|E| = 1e-9 · 16,405109 = 1,6405109e-8 N
  await expect(valor(page, '|F| sobre q₀')).toHaveText('1,64 × 10⁻⁸ N');
  // U = q₀·V = 1e-9 · 27,155288 = 2,7155288e-8 J
  await expect(valor(page, 'U (energía)')).toHaveText('2,72 × 10⁻⁸ J');
});

test('CASO 1.bis · la misma carga en −5 nC: mismo módulo, campo HACIA la carga y V negativo', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Limpiar todo' }).click();
  await page.getByRole('button', { name: 'Añadir −' }).click();
  await clicEnLienzo(page, 400, 250); // origen del mundo: (0, 0)

  await expect(valor(page, 'Posición x')).toHaveText('1,50 m');
  // El módulo no depende del signo: 44,95/2,74 = 16,405109 N/C
  await expect(valor(page, '|E| (campo)')).toHaveText('16,41 N/C');
  // Pero las dos componentes cambian de signo: el campo apunta HACIA la carga negativa
  await expect(valor(page, 'Eₓ')).toHaveText('-14,87 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('-6,94 N/C');
  // V = −44,95/1,6552946 = −27,155288 V · U = q₀·V = −2,7155288e-8 J
  await expect(valor(page, 'V (potencial)')).toHaveText('-27,16 V');
  await expect(valor(page, 'U (energía)')).toHaveText('-2,72 × 10⁻⁸ J');
  // El módulo de la fuerza tampoco cambia
  await expect(valor(page, '|F| sobre q₀')).toHaveText('1,64 × 10⁻⁸ N');
});

test('CASO 1.ter · superposición: el dipolo de arranque medido en (1,50; 0,70)', async ({ page }) => {
  // Estado inicial de la app, sin tocar nada: +5 nC en (−0,50; 0) y −5 nC en (0,50; 0).
  // Ex = +9,449096 − 24,714405 = −15,265309 · Ey = +3,307184 − 17,300084 = −13,992900
  await expect(valor(page, 'Eₓ')).toHaveText('-15,27 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('-13,99 N/C');
  // |E| = raíz(15,265309² + 13,992900²) = raíz(428,8310) = 20,708235 N/C
  await expect(valor(page, '|E| (campo)')).toHaveText('20,71 N/C');
  // V = +21,213219 − 36,824477 = −15,611258 V (los potenciales se suman como números)
  await expect(valor(page, 'V (potencial)')).toHaveText('-15,61 V');
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// CASO 2 — límite: el punto medio del dipolo, donde E se SUMA y V se anula
// ═══════════════════════════════════════════════════════════════════════════════════════
test('CASO 2 · punto medio del dipolo: E se DUPLICA (359,60 N/C) mientras V se anula', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Dipolo' }).click();
  await arrastrarSonda(page, 400, 250); // viewBox 400/250 = origen del mundo

  await expect(valor(page, 'Posición x')).toHaveText('0,00 m');
  await expect(valor(page, 'Posición y')).toHaveText('0,00 m');

  // Cada carga aporta 44,95/0,5² = 179,8 N/C y las DOS apuntan de + hacia −, es decir +x.
  // Ex = 179,8 + 179,8 = 359,6 N/C · Ey = 0 por simetría
  await expect(valor(page, 'Eₓ')).toHaveText('359,60 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
  await expect(valor(page, '|E| (campo)')).toHaveText('359,60 N/C');
  // V = +44,95/0,5 − 44,95/0,5 = +89,9 − 89,9 = 0 exactos. Campo máximo con potencial nulo.
  await expect(valor(page, 'V (potencial)')).toHaveText('0 V');
  await expect(valor(page, 'U (energía)')).toHaveText('0 J');
  // F = q₀·E = 1e-9 · 359,6 = 3,596e-7 N
  await expect(valor(page, '|F| sobre q₀')).toHaveText('3,60 × 10⁻⁷ N');
});

test('CASO 2.bis · centro del cuadrupolo: ahí SÍ se anula todo (E = 0 y V = 0)', async ({ page }) => {
  await page.getByRole('button', { name: 'Cuadrupolo' }).click();
  await arrastrarSonda(page, 400, 250);

  await expect(valor(page, 'Posición x')).toHaveText('0,00 m');
  await expect(valor(page, 'Posición y')).toHaveText('0,00 m');
  // Las cuatro cargas están a raíz(0,6²+0,6²) = 0,8485 m y se cancelan dos a dos.
  await expect(valor(page, '|E| (campo)')).toHaveText('0 N/C');
  await expect(valor(page, 'Eₓ')).toHaveText('0 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
  // Suma de cargas = +5 +5 −5 −5 = 0 a la misma distancia, luego V = 0. Es lo que dice su FAQ.
  await expect(valor(page, 'V (potencial)')).toHaveText('0 V');

  // Contraprueba de que ese cero significa algo (y hallazgo 217: tres cargas del mismo signo
  // en línea NO son un condensador). En el preset «3 cargas en línea» (+4 nC ×3) el centro es
  // una de las cargas, así que la app avisa de la singularidad; medido 30 cm por encima:
  //   carga (0,0):   r = 0,30 → Ey = 35,96/0,09 = 399,556 ·  V = 35,96/0,30 = 119,867
  //   cargas (∓1,0): r² = 1,09 · r = 1,0440307 · r³ = 1,1379422 → factor = 31,600
  //                  Ex se cancela entre las dos · Ey = 2 · 31,600·0,3 = 18,960
  //                  V = 2 · 35,96/1,0440307 = 68,887
  //   Ey = 399,556 + 18,960 = 418,52 N/C  ·  V = 119,867 + 68,887 = 188,75 V
  // En el plano medio de un condensador V valdría 0 y el campo sería uniforme: ni una cosa
  // ni la otra.
  await page.getByRole('button', { name: '3 cargas en línea' }).click();
  await expect(valor(page, '|E| (campo)')).toHaveText('—'); // la sonda está sobre la carga central
  await arrastrarSonda(page, 400, 220); // (0,00; 0,30)
  await expect(valor(page, 'Posición y')).toHaveText('0,30 m');
  await expect(valor(page, 'Eₓ')).toHaveText('0 N/C');
  await expect(valor(page, 'V (potencial)')).toHaveText('188,75 V');
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// CASO 3 — rechazo y degradación: sin cargas, magnitudes fuera de rango y r → 0
// ═══════════════════════════════════════════════════════════════════════════════════════
test('CASO 3 · sin cargas, magnitud fuera de rango y sonda sobre la carga (r → 0)', async ({
  page,
}) => {
  // (a) Sistema vacío: todo a cero, y ni un NaN, Infinity o «No definido» en el panel.
  await page.getByRole('button', { name: 'Limpiar todo' }).click();
  await expect(valor(page, '|E| (campo)')).toHaveText('0 N/C');
  await expect(valor(page, 'Eₓ')).toHaveText('0 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
  await expect(valor(page, 'V (potencial)')).toHaveText('0 V');
  await expect(valor(page, '|F| sobre q₀')).toHaveText('0 N');
  await expect(valor(page, 'U (energía)')).toHaveText('0 J');
  const panelVacio = (await page.locator('[role="status"]').textContent()) ?? '';
  expect(panelVacio).not.toMatch(/NaN|Infinity|∞|No definido|undefined/);

  // (b) El <input type="range"> declara min 0,1 y max 10: el navegador satura solo, así que
  //     nunca entra al cálculo una carga de 0 nC ni una magnitud negativa.
  await ponerMagnitud(page, 0);
  await expect(page.locator('#magnitud')).toHaveValue('0.1');
  await ponerMagnitud(page, -7);
  await expect(page.locator('#magnitud')).toHaveValue('0.1');
  await ponerMagnitud(page, 999);
  await expect(page.locator('#magnitud')).toHaveValue('10');

  // (c) r → 0. Primero JUSTO FUERA de la guardia de 5 cm, donde el cálculo sí es correcto:
  //     sonda en x = −0,44, o sea r = 0,06 m de la carga +5 nC de (−0,50; 0)
  //     Ex = 44,95/0,0036 + 44,95·0,94/0,830584 = 12.486,111 + 50,872 = 12.536,98 N/C
  await page.getByRole('button', { name: 'Dipolo' }).click();
  await arrastrarSonda(page, 356, 250);
  await expect(valor(page, 'Posición x')).toHaveText('-0,44 m');
  await expect(valor(page, '|E| (campo)')).toHaveText('12.536,98 N/C');
  await expect(valor(page, 'Eₓ')).toHaveText('12.536,98 N/C');

  //     Y ahora ENCIMA de la carga. HALLAZGO 215, reparado el 24/08/2026: antes la guardia
  //     `if (r < 0,05) continue` descartaba la carga en silencio y presentaba el campo de la
  //     OTRA como si fuese el del punto —|E| = 44,95 N/C y V = −44,95 V, o sea un potencial
  //     NEGATIVO justo donde está la carga POSITIVA—. Ahora se dice que ahí no hay cifra.
  await arrastrarSonda(page, 350, 250);
  await expect(valor(page, 'Posición x')).toHaveText('-0,50 m');
  const panelEncima = (await page.locator('[role="status"]').textContent()) ?? '';
  expect(panelEncima).not.toMatch(/NaN|Infinity|undefined/);
  expect(panelEncima).toContain('sobre una carga');
  await expect(valor(page, '|E| (campo)')).toHaveText('—');
  await expect(valor(page, 'V (potencial)')).toHaveText('—');

  //     Y al salir de la singularidad vuelven las cifras de siempre
  await arrastrarSonda(page, 356, 250);
  await expect(valor(page, '|E| (campo)')).toHaveText('12.536,98 N/C');
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// CASO 4 — el sentido de los vectores DIBUJADOS (una magnitud correcta no lo garantiza)
// ═══════════════════════════════════════════════════════════════════════════════════════
test('CASO 4 · las flechas del lienzo salen de la carga + y entran en la carga −', async ({ page }) => {
  // Muestreo de la rejilla de vectores (paso 50 px, primer nodo en 25/25) alrededor del
  // origen. En SVG el eje Y va hacia abajo, así que «arriba» es dy < 0.
  const flechas = async () =>
    lienzo(page).evaluate((svg: SVGSVGElement) => {
      const lineas = Array.from(svg.querySelectorAll('line')).filter((l) =>
        (l.getAttribute('class') ?? '').includes('fieldVector'),
      );
      const en = (sx: number, sy: number) => {
        const l = lineas.find(
          (c) => Number(c.getAttribute('x1')) === sx && Number(c.getAttribute('y1')) === sy,
        );
        if (!l) return null;
        return {
          dx: Number(l.getAttribute('x2')) - sx,
          dy: Number(l.getAttribute('y2')) - sy,
        };
      };
      return {
        derecha: en(525, 275),
        izquierda: en(275, 275),
        arriba: en(425, 125),
        abajo: en(425, 375),
      };
    });

  await page.getByRole('button', { name: 'Carga puntual aislada' }).click();
  const positiva = await flechas();
  // Carga POSITIVA en el centro: las flechas se alejan en las cuatro direcciones.
  expect(positiva.derecha).not.toBeNull();
  expect(positiva.derecha!.dx).toBeGreaterThan(0);
  expect(positiva.izquierda!.dx).toBeLessThan(0);
  expect(positiva.arriba!.dy).toBeLessThan(0);
  expect(positiva.abajo!.dy).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Limpiar todo' }).click();
  await page.getByRole('button', { name: 'Añadir −' }).click();
  await clicEnLienzo(page, 400, 250);
  const negativa = await flechas();
  // Carga NEGATIVA en el mismo sitio: exactamente las mismas flechas al revés.
  expect(negativa.derecha!.dx).toBeLessThan(0);
  expect(negativa.izquierda!.dx).toBeGreaterThan(0);
  expect(negativa.arriba!.dy).toBeGreaterThan(0);
  expect(negativa.abajo!.dy).toBeLessThan(0);
  expect(negativa.derecha!.dx).toBeCloseTo(-positiva.derecha!.dx, 5);
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// Accesibilidad y formato español (soft donde hay hallazgo abierto: no bloquean)
// ═══════════════════════════════════════════════════════════════════════════════════════
test('accesibilidad y formato: type="button", aria-pressed y coma decimal', async ({ page }) => {
  const modos = await page.locator('[aria-label="Modo de edición"] button').evaluateAll((bs) =>
    bs.map((b) => ({
      texto: (b.textContent ?? '').trim(),
      tipo: b.getAttribute('type'),
      pressed: b.getAttribute('aria-pressed'),
      activo: b.className.includes('toolActive'),
    })),
  );
  expect(modos).toHaveLength(4);
  expect(modos.filter((m) => m.activo)).toHaveLength(1); // siempre hay un modo activo
  for (const m of modos) {
    expect(m.tipo, `«${m.texto}» debe llevar type="button"`).toBe('button');
    // HALLAZGO 218, reparado el 24/08/2026: los cuatro devolvían aria-pressed = null pese a
    // tener estado visual activo, y el modo decide qué hace un clic en el lienzo (añadir +,
    // añadir −, mover o ELIMINAR). Tiene que seguir al estado visual, no ir al tuntún.
    expect(m.pressed, `«${m.texto}»: aria-pressed debe seguir al estado visual`).toBe(
      String(m.activo),
    );
  }

  // Formato español en todo el panel: coma decimal y punto de millar (12.536,98).
  await page.getByRole('button', { name: 'Carga puntual aislada' }).click();
  await expect(valor(page, '|E| (campo)')).toHaveText(/^\d{1,3}(\.\d{3})*,\d{2} N\/C$/);
  await expect(valor(page, 'V (potencial)')).toHaveText(/^\d{1,3}(\.\d{3})*,\d{2} V$/);
  const panel = (await page.locator('[role="status"]').textContent()) ?? '';
  expect(panel).not.toMatch(/\d\.\d{2} [NVJ]/); // ni un punto decimal a la anglosajona

  // HALLAZGO 220, reparado el 24/08/2026: la potencia de diez se escribía con circunflejo
  // ASCII (10^-8) mientras el bloque educativo de la MISMA página usa superíndices reales
  // (10⁻⁹, r², C·m). Ahora el panel también.
  await page.getByRole('button', { name: 'Dipolo' }).click();
  const conPotencia = (await page.locator('[role="status"]').textContent()) ?? '';
  expect(conPotencia).toMatch(/× 10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/);
  expect(conPotencia).not.toContain('10^');
});
