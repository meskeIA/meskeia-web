import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-campo-electrico (segmento CÁLCULO / física)
 *
 * Primera inspección 24/08/2026 · SEGUNDA inspección 24/08/2026 (tras la reparación).
 *
 * El <h1> promete «Simulador de Campo Eléctrico» y el subtítulo «Coloca cargas, observa
 * líneas de campo y mide fuerza sobre una carga de prueba». La metadata añade «Calcula E, V,
 * F y U sobre una carga de prueba». Hay, por tanto, verdad física comprobable: el build no ve
 * la física mal, así que aquí se comprueban NÚMEROS contra la ley de Coulomb y el principio
 * de superposición resueltos a mano, y también el SENTIDO de los vectores, que un módulo
 * correcto no garantiza.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-campo-electrico/page.tsx  (no hay motor.ts; todo está en el componente)
 *     · K_COULOMB = 8.99e9 N·m²/C²   ·   NC_TO_C = 1e-9   (las cargas se meten en nC)
 *     · calcularCampoEnPunto(x, y, cargas) → { Ex, Ey, V, singular }
 *         para cada carga:  dx = x − c.x ; dy = y − c.y ; r² = dx² + dy²
 *         si r < RADIO_SINGULARIDAD (0,05 m) → singular = true y se salta el término
 *         factor = k·q/r³ ;  Ex += factor·dx ;  Ey += factor·dy ;  V += k·q/r
 *         El vector sale de restar POSICIÓN DEL PUNTO menos POSICIÓN DE LA CARGA, así que
 *         con q > 0 el campo se ALEJA de la carga y con q < 0 se dirige HACIA ella.
 *     · datosPrueba: q₀ = +1 nC fija · E = raíz(Ex²+Ey²) · F = q₀·E · U = q₀·V
 *     · sufijoNotacion(n): notación científica (con superíndices Unicode) si |n| >= 1e6 o
 *       |n| < 1e-3; en otro caso formatNumber(n, 2)
 *   lib/formatters.ts con formatNumber(n, d), que usa toLocaleString es-ES
 *
 * UNIDADES QUE DECLARA (comprobadas): E en N/C (la tabla educativa dice «N/C o V/m», que es
 * la equivalencia correcta), V en voltios, F en newtons, U en julios, posiciones y distancias
 * en metros, cargas en nC. La constante del código (8,99 × 10⁹) coincide con la que enuncian
 * el FAQPage de metadata.ts y —desde la reparación— el bloque educativo visible. Desvío
 * frente al valor CODATA 8,9875518 × 10⁹: +0,027 %, invisible a dos decimales.
 *
 * NOTA DE FORMATO: es-ES (CLDR minimumGroupingDigits = 2) NO agrupa los números de cuatro
 * cifras, pero sí los de cinco: por eso 12536,98 se escribe «12.536,98». Coma decimal en todo
 * el panel.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   k·q = 8,99×10⁹ · 5×10⁻⁹ = 44,95 N·m²/C  (una carga de 5 nC)
 *   k·q = 8,99×10⁹ · 4×10⁻⁹ = 35,96 N·m²/C  (una carga de 4 nC, la del preset «+++»)
 *
 *   CASO 1 (normal) — DIPOLO SIMÉTRICO medido en su MEDIATRIZ, que es el punto donde el
 *   módulo y la dirección se comprueban a la vez. Preset «Dipolo»: +5 nC en (−0,50; 0) y
 *   −5 nC en (+0,50; 0); sonda en (0,00; 0,50).
 *       cada carga:  dx = ±0,50 · dy = +0,50 · r² = 0,50 · r = 0,70710678 · r³ = 0,35355339
 *       |E₁| = |E₂| = 44,95/0,50 = 89,90 N/C
 *       la de la carga + se ALEJA de ella:      E₁ = (+63,568900; +63,568900)
 *       la de la carga − se dirige HACIA ella:  E₂ = (+63,568900; −63,568900)
 *       Ex = +127,137799 → «127,14 N/C»   ·   Ey = 0 EXACTO → «0 N/C»
 *       |E| = 127,137799 → «127,14 N/C»
 *         (control con la fórmula del dipolo en la mediatriz, E = k·p/(z²+a²)^{3/2}:
 *          8,99e9 · 5e-9 / 0,5^1,5 = 44,95/0,3535534 = 127,1378 ✔)
 *       V = +63,568900 − 63,568900 = 0 EXACTO → «0 V»   ·   U = q₀·V = «0 J»
 *       F = q₀·|E| = 1e-9 · 127,137799 = 1,27137799e-7 → «1,27 × 10⁻⁷ N»
 *       Un signo invertido aquí saldría solo: el campo APUNTA DE LA + A LA −, o sea +x.
 *
 *   CASO 1.bis (una sola carga y su espejo) — preset «Carga puntual aislada» (+5 nC en el
 *   origen) con la sonda en su posición de arranque (1,50; 0,70):
 *       r² = 2,25 + 0,49 = 2,74 · r = 1,6552946 · r³ = 4,5355072
 *       |E| = 44,95/2,74 = 16,405109 → «16,41 N/C»
 *       Ex = 44,95·1,5/4,5355072 = 14,866033 → «14,87» · Ey = 31,465/4,5355072 = 6,937483 → «6,94»
 *       V = 44,95/1,6552946 = 27,155288 → «27,16 V»
 *       F = 1,6405109e-8 → «1,64 × 10⁻⁸ N» · U = 2,7155288e-8 → «2,72 × 10⁻⁸ J»
 *       Con −5 nC en el mismo sitio: mismos módulos, componentes y potencial CAMBIADOS DE
 *       SIGNO (el campo apunta HACIA la carga negativa).
 *
 *   CASO 1.ter (superposición asimétrica) — el dipolo de arranque medido en (1,50; 0,70):
 *       carga +: dx = 2,00 · dy = 0,70 · r² = 4,49 · r = 2,1189620 · r³ = 9,5141394
 *                factor = +4,724548 → Ex₁ = +9,449096 · Ey₁ = +3,307184 · V₁ = +21,213219
 *       carga −: dx = 1,00 · dy = 0,70 · r² = 1,49 · r = 1,2206556 · r³ = 1,8187768
 *                factor = −24,714405 → Ex₂ = −24,714405 · Ey₂ = −17,300084 · V₂ = −36,824477
 *       Ex = −15,265309 → «-15,27» · Ey = −13,992900 → «-13,99»
 *       |E| = raíz(233,0297 + 195,8013) = 20,708235 → «20,71 N/C» · V = −15,611258 → «-15,61 V»
 *
 *   CASO 2 (límite) — tres puntos donde algo se anula y algo no, que es donde se confunden E y V:
 *     (a) preset «3 cargas en línea (+++)» (+4 nC en (−1;0), (0;0) y (+1;0)), sonda en
 *         (0,00; 0,50): la componente x se cancela EXACTAMENTE y el potencial no.
 *           central: r = 0,50 · r³ = 0,125 → factor 35,96/0,125 = 287,68
 *                    Ex += 0 · Ey += 143,84 · V += 35,96/0,50 = 71,92
 *           (∓1;0): r² = 1,25 · r = 1,1180340 · r³ = 1,3975425 → factor = 25,730881
 *                    Ex += ±25,730881 (se cancelan) · Ey += +12,865441 cada una
 *                    V += 35,96/1,1180340 = 32,163602 cada una
 *           Ex = 0 → «0 N/C» · Ey = |E| = 169,570881 → «169,57 N/C» · V = 136,247204 → «136,25 V»
 *           F = 1,695708814e-7 → «1,70 × 10⁻⁷ N» · U = 1,362472036e-7 → «1,36 × 10⁻⁷ J»
 *           Un condensador tendría V = 0 en su plano medio y E uniforme: ni una cosa ni otra.
 *     (b) punto medio del dipolo (0,00; 0,00): ahí E se DUPLICA y V se anula.
 *           cada carga aporta 44,95/0,25 = 179,80 N/C y las DOS apuntan de + a −, o sea +x
 *           Ex = |E| = 359,60 N/C · Ey = 0 · V = +89,90 − 89,90 = 0 V · F = 3,596e-7 → «3,60 × 10⁻⁷ N»
 *     (c) centro del cuadrupolo: las cuatro cargas a la misma distancia se cancelan dos a
 *           dos → E = 0 Y V = 0, que es justo lo que afirma la FAQ de la propia app.
 *
 *   CASO 3 (aviso / rechazo) — r → 0 y sistema vacío:
 *     (a) A UN PELO de la carga pero FUERA de la guardia de 5 cm: dipolo, sonda en
 *         (−0,44; 0,00), o sea r = 0,06 m de la carga +5 nC. Aquí SÍ hay cifra y tiene que
 *         seguir siendo la correcta (es la comprobación de que rotular la singularidad no
 *         estropeó el caso normal):
 *           carga +: r² = 0,0036 · r³ = 0,000216 → 44,95/0,000216 = 208.101,852
 *                    Ex += 208101,852·0,06 = 12.486,1111 · V += 44,95/0,06 = 749,166667
 *           carga −: dx = −0,94 · r³ = 0,830584 → factor = −54,118548
 *                    Ex += +50,871435 · V += −44,95/0,94 = −47,819149
 *           Ex = |E| = 12.536,982546 → «12.536,98 N/C» · V = 701,347518 → «701,35 V»
 *           F = 1,2536982546e-5 → «1,25 × 10⁻⁵ N» · U = 7,013475e-7 → «7,01 × 10⁻⁷ J»
 *     (b) DENTRO de la guardia (la sonda exactamente encima de la carga): E y V divergen y no
 *         hay cifra que dar. Esperado: aviso explícito y «—», nunca una cifra plausible.
 *     (c) sistema sin cargas: todo a cero, sin NaN, Infinity ni «No definido».
 *     (d) el <input type="range"> declara min 0,1 y max 10: el navegador satura solo, así que
 *         no llega al cálculo una carga nula ni una «magnitud» negativa.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS SEIS HALLAZGOS DE LA PRIMERA INSPECCIÓN — verificados uno a uno el 24/08/2026, TODOS
 * REPARADOS. Cada uno tiene su aserción abajo, para que no vuelva:
 *   · 215 · Singularidad silenciosa (cálculo). Dentro de 5 cm de una carga se descartaba el
 *     término y se presentaba el campo de LAS DEMÁS como si fuese el del punto: encima de la
 *     carga +5 nC del dipolo el panel rotulaba «44,95 N/C» y «-44,95 V», potencial NEGATIVO
 *     donde está la carga POSITIVA. Hoy: aviso + «—» en las seis magnitudes. → CASO 3
 *   · 216 · La sonda se perdía fuera del lienzo. Hoy: acotada a |x| ≤ 4,00 m y |y| ≤ 2,50 m.
 *   · 217 · «3 cargas en línea aproximan un condensador» (son tres cargas del MISMO signo).
 *     Hoy: «un hilo cargado», y la tarjeta explica por qué no es un condensador. → CASO 2a
 *   · 218 · Los cuatro botones de «Modo de edición» sin aria-pressed. Hoy: siguen al estado.
 *   · 219 · El valor de k solo vivía en el JSON-LD. Hoy: en el bloque educativo visible.
 *   · 220 · El panel escribía «10^-8» con circunflejo ASCII. Hoy: superíndices reales.
 *
 * HALLAZGOS ABIERTOS de esta segunda inspección: al final del fichero, en tests que HOY
 * FALLAN a propósito (convención del proyecto: el test se escribe contra lo que debería
 * ocurrir, no contra lo que ocurre).
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
 * 400/250 y 100 px por metro). Se traduce con la matriz de pantalla del propio SVG, que es la
 * misma que usa la app en pointerASvg, así que el aterrizaje es exacto: 400/250 da (0, 0).
 */
async function arrastrarSonda(page: Page, sx: number, sy: number): Promise<void> {
  await lienzo(page).scrollIntoViewIfNeeded();
  const p = await lienzo(page).evaluate(
    (svg: SVGSVGElement, destino: { x: number; y: number }) => {
      const m = svg.getScreenCTM();
      if (!m) throw new Error('El SVG no tiene matriz de pantalla');
      const sonda = svg.querySelector('circle[data-tipo="prueba"]');
      if (!sonda) throw new Error('No se encuentra la carga de prueba');
      return {
        desdeX: m.a * Number(sonda.getAttribute('cx')) + m.e,
        desdeY: m.d * Number(sonda.getAttribute('cy')) + m.f,
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
// CASO 1 — normal: dipolo simétrico medido en su mediatriz (módulo Y dirección a la vez)
// ═══════════════════════════════════════════════════════════════════════════════════════
test('CASO 1 · dipolo en la mediatriz (0,00; 0,50): E = 127,14 N/C hacia +x y V = 0 exacto', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Dipolo' }).click();
  await arrastrarSonda(page, 400, 200); // viewBox 400/200 → mundo (0,00; 0,50)

  await expect(valor(page, 'Posición x')).toHaveText('0,00 m');
  await expect(valor(page, 'Posición y')).toHaveText('0,50 m');

  // Cada carga aporta 44,95/0,50 = 89,90 N/C a 45°; las componentes y se cancelan y las x
  // se suman: Ex = 2 · 89,90 · cos45° = 127,137799. Control por la fórmula del dipolo en la
  // mediatriz: k·p/(z²+a²)^{3/2} = 44,95/0,5^1,5 = 127,1378.
  await expect(valor(page, '|E| (campo)')).toHaveText('127,14 N/C');
  // POSITIVO: el campo va DE la carga + A la carga −, o sea hacia +x. Un signo al revés aquí
  // sería un fallo de física aunque el módulo cuadrase.
  await expect(valor(page, 'Eₓ')).toHaveText('127,14 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
  // En la mediatriz de un dipolo el potencial es CERO EXACTO: +44,95/0,7071 − 44,95/0,7071.
  // Es el punto que enseña que E máxima y V = 0 conviven, que es lo que la app quiere mostrar.
  await expect(valor(page, 'V (potencial)')).toHaveText('0 V');
  await expect(valor(page, 'U (energía)')).toHaveText('0 J');
  // F = q₀·|E| = 1e-9 · 127,137799 = 1,27137799e-7 N
  await expect(valor(page, '|F| sobre q₀')).toHaveText('1,27 × 10⁻⁷ N');
});

test('CASO 1.bis · carga puntual +5 nC y su espejo −5 nC: mismo módulo, sentido opuesto', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Carga puntual aislada' }).click();
  // La sonda no se ha tocado: sigue en su posición de arranque (1,50; 0,70).
  await expect(valor(page, 'Posición x')).toHaveText('1,50 m');
  await expect(valor(page, 'Posición y')).toHaveText('0,70 m');

  // r² = 1,5² + 0,7² = 2,74 m² · |E| = 44,95/2,74 = 16,405109 N/C
  await expect(valor(page, '|E| (campo)')).toHaveText('16,41 N/C');
  // Ex = 44,95·1,5/4,5355072 = 14,866033 · Ey = 44,95·0,7/4,5355072 = 6,937483
  // Las DOS positivas: el campo de una carga + se aleja de ella.
  await expect(valor(page, 'Eₓ')).toHaveText('14,87 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('6,94 N/C');
  await expect(valor(page, 'V (potencial)')).toHaveText('27,16 V'); // 44,95/1,6552946
  await expect(valor(page, '|F| sobre q₀')).toHaveText('1,64 × 10⁻⁸ N'); // 1e-9 · 16,405109
  await expect(valor(page, 'U (energía)')).toHaveText('2,72 × 10⁻⁸ J'); // 1e-9 · 27,155288

  // El espejo: la misma carga con signo −, colocada con un clic en el origen del mundo.
  await page.getByRole('button', { name: 'Limpiar todo' }).click();
  await page.getByRole('button', { name: 'Añadir −' }).click();
  await clicEnLienzo(page, 400, 250);

  await expect(valor(page, '|E| (campo)')).toHaveText('16,41 N/C'); // el módulo no ve el signo
  await expect(valor(page, 'Eₓ')).toHaveText('-14,87 N/C'); // pero el campo apunta HACIA ella
  await expect(valor(page, 'Eᵧ')).toHaveText('-6,94 N/C');
  await expect(valor(page, 'V (potencial)')).toHaveText('-27,16 V');
  await expect(valor(page, 'U (energía)')).toHaveText('-2,72 × 10⁻⁸ J');
  await expect(valor(page, '|F| sobre q₀')).toHaveText('1,64 × 10⁻⁸ N');
});

test('CASO 1.ter · superposición asimétrica: el dipolo de arranque medido en (1,50; 0,70)', async ({
  page,
}) => {
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
// CASO 2 — límite: los puntos donde algo se anula y algo NO
// ═══════════════════════════════════════════════════════════════════════════════════════
test('CASO 2a · «+++» en (0,00; 0,50): Eₓ = 0 exacto pero V = 136,25 V (no es un condensador)', async ({
  page,
}) => {
  await page.getByRole('button', { name: '3 cargas en línea' }).click();
  await arrastrarSonda(page, 400, 200); // (0,00; 0,50)

  await expect(valor(page, 'Posición x')).toHaveText('0,00 m');
  await expect(valor(page, 'Posición y')).toHaveText('0,50 m');

  // Las dos cargas laterales están a ∓1 m y aportan ±25,730881 en x: se cancelan EXACTAMENTE.
  await expect(valor(page, 'Eₓ')).toHaveText('0 N/C');
  // Ey = 143,84 (la central, 35,96/0,125·0,5) + 2 · 12,865441 (las laterales) = 169,570881
  await expect(valor(page, 'Eᵧ')).toHaveText('169,57 N/C');
  await expect(valor(page, '|E| (campo)')).toHaveText('169,57 N/C');
  // V = 71,92 + 2 · 32,163602 = 136,247204 V. HALLAZGO 217: en el plano medio de un
  // condensador el potencial sería CERO y el campo uniforme. Tres cargas del mismo signo en
  // línea son un hilo cargado, y este número es la prueba.
  await expect(valor(page, 'V (potencial)')).toHaveText('136,25 V');
  await expect(valor(page, '|F| sobre q₀')).toHaveText('1,70 × 10⁻⁷ N'); // 1e-9 · 169,570881
  await expect(valor(page, 'U (energía)')).toHaveText('1,36 × 10⁻⁷ J'); // 1e-9 · 136,247204
});

test('CASO 2b · punto medio del dipolo: E se DUPLICA (359,60 N/C) mientras V se anula', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Dipolo' }).click();
  await arrastrarSonda(page, 400, 250); // viewBox 400/250 = origen del mundo

  await expect(valor(page, 'Posición x')).toHaveText('0,00 m');
  await expect(valor(page, 'Posición y')).toHaveText('0,00 m');

  // Cada carga aporta 44,95/0,5² = 179,80 N/C y las DOS apuntan de + hacia −, es decir +x.
  await expect(valor(page, 'Eₓ')).toHaveText('359,60 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
  await expect(valor(page, '|E| (campo)')).toHaveText('359,60 N/C');
  // V = +89,90 − 89,90 = 0 exactos. Campo máximo con potencial nulo: si el panel diese
  // |E| = 0 aquí estaría anulando vectores que se SUMAN, que es el error clásico.
  await expect(valor(page, 'V (potencial)')).toHaveText('0 V');
  await expect(valor(page, 'U (energía)')).toHaveText('0 J');
  await expect(valor(page, '|F| sobre q₀')).toHaveText('3,60 × 10⁻⁷ N'); // 1e-9 · 359,60
});

test('CASO 2c · centro del cuadrupolo: ahí SÍ se anula todo (E = 0 y V = 0)', async ({ page }) => {
  await page.getByRole('button', { name: 'Cuadrupolo' }).click();
  await arrastrarSonda(page, 400, 250);

  await expect(valor(page, 'Posición x')).toHaveText('0,00 m');
  await expect(valor(page, 'Posición y')).toHaveText('0,00 m');
  // Las cuatro cargas están a raíz(0,6²+0,6²) = 0,8485 m y se cancelan dos a dos.
  await expect(valor(page, '|E| (campo)')).toHaveText('0 N/C');
  await expect(valor(page, 'Eₓ')).toHaveText('0 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
  // Suma de cargas = +5 +5 −5 −5 = 0 a la misma distancia → V = 0. Es lo que dice su FAQ.
  await expect(valor(page, 'V (potencial)')).toHaveText('0 V');
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// CASO 3 — la singularidad rotulada, y que rotularla no estropeó el caso normal
// ═══════════════════════════════════════════════════════════════════════════════════════
test('CASO 3 · r → 0: a 6 cm la cifra correcta, encima de la carga un aviso y «—»', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Dipolo' }).click();

  // (a) JUSTO FUERA de la guardia de 5 cm: r = 0,06 m de la carga +5 nC. Aquí tiene que
  //     haber cifra y ser la correcta — es la comprobación de que la reparación no se llevó
  //     por delante el caso normal.
  //     Ex = 44,95/0,0036 + 44,95·0,94/0,830584 = 12.486,1111 + 50,8714 = 12.536,982546
  await arrastrarSonda(page, 356, 250);
  await expect(valor(page, 'Posición x')).toHaveText('-0,44 m');
  await expect(valor(page, 'Posición y')).toHaveText('0,00 m');
  await expect(valor(page, '|E| (campo)')).toHaveText('12.536,98 N/C');
  await expect(valor(page, 'Eₓ')).toHaveText('12.536,98 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
  // V = 44,95/0,06 − 44,95/0,94 = 749,166667 − 47,819149 = 701,347518
  await expect(valor(page, 'V (potencial)')).toHaveText('701,35 V');
  await expect(valor(page, '|F| sobre q₀')).toHaveText('1,25 × 10⁻⁵ N'); // 1e-9 · 12.536,98
  await expect(valor(page, 'U (energía)')).toHaveText('7,01 × 10⁻⁷ J'); // 1e-9 · 701,347518
  await expect(page.locator('[role="status"] p')).toHaveCount(0); // aquí NO hay aviso

  // (b) DENTRO de la guardia: la sonda exactamente sobre la carga +5 nC. HALLAZGO 215:
  //     antes el panel rotulaba «44,95 N/C» y «-44,95 V» —el campo de la OTRA carga, con un
  //     potencial NEGATIVO justo donde está la carga POSITIVA— con el mismo formato y sin
  //     ninguna marca. Un centímetro de diferencia y tres órdenes de magnitud de salto.
  await arrastrarSonda(page, 350, 250);
  await expect(valor(page, 'Posición x')).toHaveText('-0,50 m');
  const aviso = page.locator('[role="status"] p');
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText('sobre una carga');
  await expect(aviso).toContainText('divergen');
  for (const fila of ['|E| (campo)', 'Eₓ', 'Eᵧ', 'V (potencial)', '|F| sobre q₀', 'U (energía)']) {
    await expect(valor(page, fila)).toHaveText('—');
  }
  const panelEncima = (await page.locator('[role="status"]').textContent()) ?? '';
  expect(panelEncima).not.toMatch(/NaN|Infinity|undefined|No definido/);
  expect(panelEncima).not.toContain('44,95'); // la cifra falsa de antes, que no debe volver

  // (c) Y sobre la carga NEGATIVA, que es el caso simétrico: mismo aviso.
  await arrastrarSonda(page, 450, 250);
  await expect(valor(page, 'Posición x')).toHaveText('0,50 m');
  await expect(page.locator('[role="status"] p')).toContainText('sobre una carga');
  await expect(valor(page, 'V (potencial)')).toHaveText('—');

  // (d) Al salir de la singularidad vuelven las cifras de siempre, sin rastro del aviso.
  await arrastrarSonda(page, 356, 250);
  await expect(page.locator('[role="status"] p')).toHaveCount(0);
  await expect(valor(page, '|E| (campo)')).toHaveText('12.536,98 N/C');
});

test('CASO 3.bis · sistema vacío y magnitudes fuera de rango', async ({ page }) => {
  // Sistema sin cargas: todo a cero, y ni un NaN, Infinity o «No definido» en el panel.
  await page.getByRole('button', { name: 'Limpiar todo' }).click();
  await expect(valor(page, '|E| (campo)')).toHaveText('0 N/C');
  await expect(valor(page, 'Eₓ')).toHaveText('0 N/C');
  await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
  await expect(valor(page, 'V (potencial)')).toHaveText('0 V');
  await expect(valor(page, '|F| sobre q₀')).toHaveText('0 N');
  await expect(valor(page, 'U (energía)')).toHaveText('0 J');
  const panelVacio = (await page.locator('[role="status"]').textContent()) ?? '';
  expect(panelVacio).not.toMatch(/NaN|Infinity|∞|No definido|undefined/);

  // El <input type="range"> declara min 0,1 y max 10: el navegador satura solo, así que
  // nunca entra al cálculo una carga de 0 nC ni una «magnitud» negativa.
  await ponerMagnitud(page, 0);
  await expect(page.locator('#magnitud')).toHaveValue('0.1');
  await ponerMagnitud(page, -7);
  await expect(page.locator('#magnitud')).toHaveValue('0.1');
  await ponerMagnitud(page, 999);
  await expect(page.locator('#magnitud')).toHaveValue('10');
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// CASO 4 — el sentido de los vectores DIBUJADOS (un módulo correcto no lo garantiza)
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
        return { dx: Number(l.getAttribute('x2')) - sx, dy: Number(l.getAttribute('y2')) - sy };
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
  await clicEnLienzo(page, 400, 250); // la sonda sigue en (1,50; 0,70) y no estorba
  const negativa = await flechas();
  // Carga NEGATIVA en el mismo sitio: exactamente las mismas flechas al revés.
  expect(negativa.derecha!.dx).toBeLessThan(0);
  expect(negativa.izquierda!.dx).toBeGreaterThan(0);
  expect(negativa.arriba!.dy).toBeGreaterThan(0);
  expect(negativa.abajo!.dy).toBeLessThan(0);
  expect(negativa.derecha!.dx).toBeCloseTo(-positiva.derecha!.dx, 5);
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// Blindaje de los hallazgos 216, 218, 219 y 220 (el 215 vive en el CASO 3 y el 217 en el 2a)
// ═══════════════════════════════════════════════════════════════════════════════════════
test('HALLAZGO 216 · la sonda no puede perderse fuera del lienzo', async ({ page }) => {
  // setPointerCapture mantiene el arrastre más allá del borde del SVG. Antes setPruebaPos no
  // acotaba nada: q₀ quedaba fuera del viewBox, dejaba de dibujarse y el panel seguía dando
  // cifras de un punto invisible, sin más salida que recargar la página.
  await lienzo(page).scrollIntoViewIfNeeded();
  const origen = await lienzo(page).evaluate((svg: SVGSVGElement) => {
    const m = svg.getScreenCTM()!;
    const s = svg.querySelector('circle[data-tipo="prueba"]')!;
    return { x: m.a * Number(s.getAttribute('cx')) + m.e, y: m.d * Number(s.getAttribute('cy')) + m.f };
  });
  await page.mouse.move(origen.x, origen.y);
  await page.mouse.down();
  await page.mouse.move(origen.x + 900, origen.y + 500, { steps: 25 });
  await page.mouse.up();

  // LIMITE_X = 800/2/100 = 4,00 m · LIMITE_Y = 500/2/100 = 2,50 m
  await expect(valor(page, 'Posición x')).toHaveText('4,00 m');
  await expect(valor(page, 'Posición y')).toHaveText('-2,50 m');
  // Y sigue dibujada dentro del viewBox (800 × 500).
  const centro = await lienzo(page).evaluate((svg: SVGSVGElement) => {
    const s = svg.querySelector('circle[data-tipo="prueba"]')!;
    return { cx: Number(s.getAttribute('cx')), cy: Number(s.getAttribute('cy')) };
  });
  expect(centro.cx).toBeLessThanOrEqual(800);
  expect(centro.cy).toBeLessThanOrEqual(500);
});

test('HALLAZGO 218 · aria-pressed de los cuatro modos sigue al estado visual', async ({ page }) => {
  const leerModos = () =>
    page.locator('[aria-label="Modo de edición"] button').evaluateAll((bs) =>
      bs.map((b) => ({
        texto: (b.textContent ?? '').trim(),
        tipo: b.getAttribute('type'),
        pressed: b.getAttribute('aria-pressed'),
        activo: b.className.includes('toolActive'),
      })),
    );

  const iniciales = await leerModos();
  expect(iniciales).toHaveLength(4);
  expect(iniciales.filter((m) => m.activo)).toHaveLength(1); // siempre hay un modo activo
  for (const m of iniciales) {
    expect(m.tipo, `«${m.texto}» debe llevar type="button"`).toBe('button');
    // El modo decide qué hace un clic en el lienzo: añadir +, añadir −, mover o ELIMINAR.
    // Sin aria-pressed un lector de pantalla no puede saber en cuál está antes de pulsar.
    expect(m.pressed, `«${m.texto}»: aria-pressed debe seguir al estado visual`).toBe(
      String(m.activo),
    );
  }

  // Y tiene que MOVERSE con el estado, no quedarse escrito de una vez.
  await page.getByRole('button', { name: 'Eliminar' }).click();
  const trasEliminar = await leerModos();
  for (const m of trasEliminar) {
    expect(m.pressed, `«${m.texto}» tras cambiar de modo`).toBe(String(m.activo));
  }
  expect(trasEliminar.find((m) => m.texto.includes('Eliminar'))!.pressed).toBe('true');
  expect(trasEliminar.find((m) => m.texto.includes('Añadir +'))!.pressed).toBe('false');
});

test('HALLAZGOS 217 y 219 · el bloque educativo dice cuánto vale k y qué NO es un condensador', async ({
  page,
}) => {
  // La guía manda «aplica E = kq/r²» y comparar el resultado con el panel; sin la constante a
  // la vista esa comprobación es imposible. Antes k solo vivía en el FAQPage del JSON-LD.
  // El botón de EducationalSection lleva aria-label, que gana al texto visible («⬇️ Ver Guía
  // Completa»), así que se localiza por su nombre accesible.
  const guia = page.getByRole('button', { name: 'Ver guía educativa' });
  await expect(guia).toHaveAttribute('aria-expanded', 'false'); // arranca colapsado
  await guia.click();
  // useInnerText a propósito: EducationalSection monta SIEMPRE los hijos en el DOM y los
  // oculta por CSS (por el rastreo de Google), de modo que un toContainText sobre textContent
  // pasaría aunque el usuario no viera nada. Aquí se exige texto renderizado.
  const cuerpo = page.locator('main');
  await expect(cuerpo).toContainText('constante de Coulomb', { useInnerText: true });
  await expect(cuerpo).toContainText('8,99 × 10⁹', { useInnerText: true });
  // El preset son tres cargas POSITIVAS: aproximan un hilo cargado, no un condensador (que
  // exige dos placas de signo OPUESTO y da campo uniforme entre ellas).
  await expect(cuerpo).toContainText('hilo cargado', { useInnerText: true });
  await expect(cuerpo).toContainText('Un condensador es otra cosa', { useInnerText: true });
});

test('HALLAZGO 220 y formato español · superíndices reales y coma decimal en todo el panel', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Carga puntual aislada' }).click();
  await expect(valor(page, '|E| (campo)')).toHaveText(/^\d{1,3}(\.\d{3})*,\d{2} N\/C$/);
  await expect(valor(page, 'V (potencial)')).toHaveText(/^\d{1,3}(\.\d{3})*,\d{2} V$/);
  const panel = (await page.locator('[role="status"]').textContent()) ?? '';
  expect(panel).not.toMatch(/\d\.\d{2} [NVJ]/); // ni un punto decimal a la anglosajona
  // La potencia de diez se escribía con circunflejo ASCII (10^-8) mientras el bloque
  // educativo de la MISMA página usa superíndices reales (10⁻⁹, r², C·m).
  expect(panel).toMatch(/× 10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/);
  expect(panel).not.toContain('10^');
  const pagina = (await page.locator('body').textContent()) ?? '';
  expect(pagina).not.toContain('10^');
});

// ═══════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS ABIERTOS (Inspector, 24/08/2026 — segunda pasada, sobre la app ya reparada)
// Estos cuatro tests FALLAN hoy a propósito: describen lo que debería ocurrir.
// ═══════════════════════════════════════════════════════════════════════════════════════

// HALLAZGO 271 (contenido) · REPARADO el 24/08/2026. El aviso de singularidad terminaba diciendo «Lo que se lee
// abajo es lo que aportan las demás cargas», que es la frase de cuando el panel SÍ enseñaba
// esas cifras. La reparación las sustituyó por «—» en las seis filas, así que el aviso
// promete una lectura que ya no existe y se contradice con lo que hay debajo, en la misma
// pantalla y a dos centímetros.
// Caso: preset «Dipolo», sonda arrastrada a (−0,50; 0,00) → esperado un aviso coherente con
//       el panel · obtenido «Lo que se lee abajo es lo que aportan las demás cargas» encima
//       de seis filas que ponen «—».
test('REGRESIÓN 271 (contenido) — el aviso de singularidad no promete cifras que el panel no da', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Dipolo' }).click();
  await arrastrarSonda(page, 350, 250);
  await expect(valor(page, '|E| (campo)')).toHaveText('—');
  await expect(page.locator('[role="status"] p')).not.toContainText('Lo que se lee abajo');
  // Y dice lo que de verdad pasa: que ni el panel ni el lienzo dan nada ahí
  await expect(page.locator('[role="status"] p')).toContainText('no dibuja la flecha de fuerza');
});

// HALLAZGO 272 (operativa) · REPARADO el 24/08/2026. Sobre el punto singular el panel decía «—»
// pero el lienzo SEGUÍA dibujando la flecha verde de fuerza sobre q₀, calculada con las cargas que quedan.
// El vector no es decorativo: su longitud codifica el módulo (lenF = 14 + 30·log10(1+F·1e8)),
// de modo que los 36,20 px medidos son exactamente |F| = 4,50 × 10⁻⁸ N, o sea los 44,95 N/C
// de la otra carga — la misma cifra que la reparación retiró del panel por engañosa.
// Caso: preset «Dipolo», sonda en (−0,50; 0,00) sobre la carga +5 nC → esperado ninguna
//       flecha de fuerza (o marcada como no válida) · obtenido <line stroke="#16a34a"> de
//       (350; 250) a (386,20; 250).
test('REGRESIÓN 272 (operativa) — sobre la singularidad tampoco se dibuja el vector fuerza', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Dipolo' }).click();
  await arrastrarSonda(page, 350, 250);
  await expect(valor(page, '|F| sobre q₀')).toHaveText('—');
  await expect(lienzo(page).locator('line[stroke="#16a34a"]')).toHaveCount(0);
  // Control: apartada de la carga, la flecha vuelve — no se ha eliminado, se ha condicionado
  await arrastrarSonda(page, 500, 250);
  await expect(valor(page, '|F| sobre q₀')).not.toHaveText('—');
  await expect(lienzo(page).locator('line[stroke="#16a34a"]')).toHaveCount(1);
});

// HALLAZGO 269 (operativa) · REPARADO el 24/08/2026. La reparación del 216 acotó la SONDA pero no las
// CARGAS, que se arrastran con el mismo mecanismo (setPointerCapture + setCargas sin acotar).
// Una carga arrastrada fuera del viewBox queda recortada por el SVG: invisible, pero sigue
// contada en «Cargas en el sistema» y sigue alterando el campo. No hay ningún control para
// recuperarla; la única salida es «Limpiar todo», que destruye la configuración entera — es
// decir, exactamente la trampa del hallazgo 216, movida de la sonda a las cargas.
// Caso: preset «Dipolo», arrastrar la carga +5 nC 900 px a la derecha y 420 hacia abajo →
//       esperado que quede acotada al área visible (|x| ≤ 4,00 m) · obtenido x = 10,49 m,
//       cx = 1448,69 en un viewBox que acaba en 800, círculo no visible, contador «2» y el
//       potencial en (0,00; 1,00) pasando de 0 V a −36,50 V.
test('REGRESIÓN 269 (operativa) — las cargas tampoco pueden perderse fuera del lienzo', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Dipolo' }).click();
  await lienzo(page).scrollIntoViewIfNeeded();
  const p = await lienzo(page).evaluate((svg: SVGSVGElement) => {
    const m = svg.getScreenCTM()!;
    return { x: m.a * 350 + m.e, y: m.d * 250 + m.f }; // la carga +5 nC, en (−0,50; 0)
  });
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 900, p.y + 420, { steps: 30 });
  await page.mouse.up();

  const centros = await lienzo(page).evaluate((svg: SVGSVGElement) =>
    Array.from(svg.querySelectorAll('circle[data-tipo="carga"]')).map((c) => ({
      cx: Number(c.getAttribute('cx')),
      cy: Number(c.getAttribute('cy')),
    })),
  );
  for (const c of centros) {
    expect(c.cx, 'ninguna carga debe quedar fuera del viewBox').toBeLessThanOrEqual(800);
    expect(c.cy, 'ninguna carga debe quedar fuera del viewBox').toBeLessThanOrEqual(500);
  }
});

// HALLAZGO 270 (accesibilidad) · REPARADO el 24/08/2026. El lienzo no era operable con el teclado: dentro del
// <svg> no hay ni un elemento focalizable, el propio <svg> no tiene tabindex ni role, y no
// existe ninguna entrada numérica alternativa para la posición de la sonda ni para colocar
// cargas. Sin ratón, la configuración se queda en los cuatro presets y la sonda, clavada en
// (1,50; 0,70), no se puede mover — con lo que la promesa del subtítulo («mide fuerza sobre
// una carga de prueba») queda fuera del alcance de un usuario de teclado o lector de
// pantalla. El <svg> tampoco lleva <title>/<desc>, así que su aria-label es todo lo que se
// anuncia de una configuración que puede tener diez cargas.
// Caso: cargar la app y contar elementos focalizables dentro del lienzo → esperado al menos
//       uno (o controles numéricos equivalentes) · obtenido 0, con tabindex = null y
//       role = null en el <svg>.
test('REGRESIÓN 270 (accesibilidad) — el lienzo se maneja con el teclado', async ({ page }) => {
  const focalizables = await lienzo(page).evaluate((svg: SVGSVGElement) => {
    const dentro = svg.querySelectorAll('[tabindex], button, a[href], input, [contenteditable]');
    return dentro.length + (svg.hasAttribute('tabindex') ? 1 : 0);
  });
  expect(focalizables, 'ni un elemento focalizable dentro del lienzo').toBeGreaterThan(0);

  // Y la vía existe de verdad: las flechas mueven la sonda, con paso fino con Mayús
  await page.getByRole('button', { name: 'Dipolo' }).click();
  const leerX = async () => (await valor(page, 'Posición x').innerText()).trim();
  await lienzo(page).focus();
  const partida = await leerX();
  await page.keyboard.press('ArrowRight');
  const trasFlecha = await leerX();
  expect(trasFlecha, 'la flecha derecha no movió la sonda').not.toBe(partida);
  await page.keyboard.press('Shift+ArrowLeft');
  expect(await leerX(), 'Mayús debe dar un paso más corto').not.toBe(partida);

  // «+» coloca una carga donde está la sonda, «Supr» retira la más cercana
  const cuantasCargas = () => lienzo(page).locator('circle[data-tipo="carga"]').count();
  const antes = await cuantasCargas();
  await page.keyboard.press('+');
  expect(await cuantasCargas()).toBe(antes + 1);
  await page.keyboard.press('Delete');
  expect(await cuantasCargas()).toBe(antes);

  // Y la posición exacta se puede escribir, que es lo que arrastrando no se puede
  await page.locator('#sonda-x').fill('2');
  await page.locator('#sonda-y').fill('-1');
  await expect(valor(page, 'Posición x')).toHaveText('2,00 m');
  await expect(valor(page, 'Posición y')).toHaveText('-1,00 m');
});
