import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValorAcotado } from './_hidratacion';

/**
 * Inspector — simulador-campo-electrico (segmento CÁLCULO / física)
 *
 * Primera inspección 24/08/2026 · SEGUNDA inspección 24/08/2026 (tras la reparación) ·
 * TERCERA 28/09/2026 (re-inspección tras el motor aparte, las equipotenciales que usan su
 * potencial y la regla móvil del hero): bloque «Inspector 28/09/2026», al final del fichero.
 *
 * El <h1> promete «Simulador de Campo Eléctrico» y el subtítulo «Coloca cargas, observa
 * líneas de campo y mide fuerza sobre una carga de prueba». La metadata añade «Calcula E, V,
 * F y U sobre una carga de prueba». Hay, por tanto, verdad física comprobable: el build no ve
 * la física mal, así que aquí se comprueban NÚMEROS contra la ley de Coulomb y el principio
 * de superposición resueltos a mano, y también el SENTIDO de los vectores, que un módulo
 * correcto no garantiza.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-campo-electrico/motor.ts  (desde el 23/09/2026; en las dos inspecciones
 *     todo estaba en page.tsx y se MOVIÓ sin cambiar una operación). La vista, sufijoNotacion
 *     y el dibujo del lienzo siguen en page.tsx.
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
 * Los cuatro HALLAZGOS de la segunda inspección (269-272) se REPARARON el 24/08/2026: sus
 * tests, al final del fichero, nacieron fallando a propósito y hoy son candados de regresión.
 * Los cinco de la tercera (28/09/2026, 2383-2387) van en el bloque «Inspector 28/09/2026»:
 * nacieron con test.fail() (convención del proyecto: el test se escribe contra lo que debería
 * ocurrir, no contra lo que ocurre) y se repararon el mismo día.
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

/**
 * Escribe un valor en el slider de magnitud (un range no acepta fill()) y comprueba que el
 * estado de React lo recogió. El navegador satura fuera de [0,1 · 10], que es justo lo que el
 * CASO 3.bis quiere observar, así que el testigo es el valor que el control ACEPTA.
 */
async function ponerMagnitud(page: Page, v: number | string): Promise<void> {
  await sembrarValorAcotado(page, '#magnitud', v);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.locator('h1')).toHaveText('Simulador de Campo Eléctrico');
  await expect(lienzo(page)).toBeVisible();
  // Ni el <h1> ni el lienzo dicen que la app responda: los dos viajan en el HTML servido. Un
  // arrastre, un clic en el SVG o un movimiento de slider anteriores a la hidratación se
  // perderían sin dejar rastro (ver tests/apps/_hidratacion.ts).
  await esperarHidratacion(page, ['#magnitud']);
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
  // Subir a 5 antes del intento negativo no es adorno: el slider ya estaría en 0,1, el
  // navegador dejaría ahí el −7 igualmente y React descartaría el evento por duplicado, así que
  // la comprobación pasaría sin que nada se hubiera movido (ver tests/apps/_hidratacion.ts).
  await ponerMagnitud(page, 5);
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
// HALLAZGOS DE LA SEGUNDA PASADA (Inspector, 24/08/2026, sobre la app ya reparada) — REPARADOS
// el mismo día. Estos cuatro tests nacieron fallando a propósito; hoy son candados de regresión.
// ═══════════════════════════════════════════════════════════════════════════════════════

// HALLAZGO 271 (contenido) · REPARADO el 24/08/2026. El aviso de singularidad terminaba diciendo «Lo que se lee
// abajo es lo que aportan las demás cargas», que es la frase de cuando el panel SÍ enseñaba
// esas cifras. La reparación las sustituyó por «—» en las seis filas, así que el aviso
// prometía una lectura que ya no existía y se contradecía con lo que había debajo, en la
// misma pantalla y a dos centímetros.
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
// Una carga arrastrada fuera del viewBox quedaba recortada por el SVG: invisible, pero seguía
// contada en «Cargas en el sistema» y seguía alterando el campo. No había ningún control para
// recuperarla; la única salida era «Limpiar todo», que destruía la configuración entera — es
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
// <svg> no había ni un elemento focalizable, el propio <svg> no tenía tabindex ni role, y no
// existía ninguna entrada numérica alternativa para la posición de la sonda ni para colocar
// cargas. Sin ratón, la configuración se quedaba en los cuatro presets y la sonda, clavada en
// (1,50; 0,70), no se podía mover — con lo que la promesa del subtítulo («mide fuerza sobre
// una carga de prueba») quedaba fuera del alcance de un usuario de teclado o lector de
// pantalla. El <svg> tampoco llevaba <title>/<desc>, así que su aria-label era todo lo que se
// anunciaba de una configuración que podía tener diez cargas.
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

  // Y la posición exacta se puede escribir, que es lo que arrastrando no se puede.
  // TECLEADA carácter a carácter (28/09/2026): hasta ese día este bloque usaba fill(), que pega
  // el valor entero de golpe, y por eso pasaba en verde mientras un «-1» tecleado acababa en
  // 1,00 m (hallazgo 2383). La «y» negativa es justo la que se perdía.
  for (const [campo, texto] of [
    ['#sonda-x', '2'],
    ['#sonda-y', '-1'],
  ] as const) {
    await page.locator(campo).click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(texto, { delay: 30 });
  }
  await expect(valor(page, 'Posición x')).toHaveText('2,00 m');
  await expect(valor(page, 'Posición y')).toHaveText('-1,00 m');
});

// REGRESIÓN (23/09/2026, observación de los casos para clase) — el rótulo «q₀» iba con
// fill="#1f2937" fijo: sobre el lienzo oscuro (#0f172a) daba 1,22:1 y desaparecía. Ahora sigue
// a --text-primary: 16,63:1 en claro y 14,57:1 en oscuro, medidos en navegador.
// El tema se pone con el BOTÓN real: poner `data-theme` a mano no sirve, el gestor de tema lo
// pisa al hidratar. Y se lee hasta que dos lecturas coinciden, que la transición de color
// devuelve valores intermedios justo después de cambiar.
test('REGRESIÓN q₀ (contraste) — el rótulo de la sonda se lee en los dos temas', async ({ page }) => {
  const contrasteRotulo = () =>
    page.evaluate(() => {
      const canal = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
      const rgb = (s: string): number[] => {
        const m = s.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
        if (!m) throw new Error(`color que no es rgb(): ${s}`);
        return [Number(m[1]), Number(m[2]), Number(m[3])];
      };
      const svg = document.querySelector('svg[aria-label="Lienzo del campo eléctrico"]');
      if (!svg) throw new Error('no hay lienzo');
      const rotulo = [...svg.querySelectorAll('text')].find((t) => t.textContent?.trim() === 'q₀');
      if (!rotulo) throw new Error('no hay rótulo q₀');
      const l1 = lum(rgb(getComputedStyle(rotulo).fill));
      const l2 = lum(rgb(getComputedStyle(svg).backgroundColor));
      return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
    });
  const estable = async (): Promise<number> => {
    let anterior = await contrasteRotulo();
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(100);
      const actual = await contrasteRotulo();
      if (actual === anterior) return actual;
      anterior = actual;
    }
    return anterior;
  };

  expect(await estable(), 'q₀ en claro').toBeGreaterThanOrEqual(4.5);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await estable(), 'q₀ en oscuro (antes 1,22:1)').toBeGreaterThanOrEqual(4.5);
});

// REGRESIÓN (23/09/2026) — el HTML servido y el hidratado no daban las mismas flechas. Node
// (V8 13.6) y Chromium 151 no coinciden en el último bit de Math.sin/cos/atan2, así que 4 de
// las 161 flechas del dipolo de arranque salían con `points` distintos en la 15.ª cifra
// (…265487 en el servidor, …265483 en el cliente) y React avisaba del desajuste. Ya pasaba
// antes del commit 94623f2a: el código de las flechas no cambió. Se arregla redondeando las
// coordenadas a la centésima de píxel.
test('REGRESIÓN hidratación — las flechas del lienzo salen iguales del servidor y del cliente', async ({
  page,
}) => {
  const avisos: string[] = [];
  page.on('console', (m) => {
    if (/hydrat|didn.t match|did not match/i.test(m.text())) avisos.push(m.text().slice(0, 300));
  });
  await page.goto(RUTA, { waitUntil: 'networkidle' });
  await esperarHidratacion(page, ['#magnitud']);
  // El aviso lo emite React DESPUÉS de dar la hidratación por buena (va por la cola de errores
  // recuperables), así que el testigo de hidratación llega antes que él: sin esta espera el
  // test pasaba en verde también con el código sin reparar. Comprobado quitando la reparación.
  await page.waitForTimeout(1500);
  expect(avisos, 'avisos de hidratación en la consola').toEqual([]);
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (23/09/2026) — la tarea asignable de esta app (tipo A, casos numerados).
 *
 * Salió del canal aula: 70 visitas de aula, la nº 1 de física sin tarea dentro. La física
 * vive ahora en dos módulos sin React:
 *   app/simulador-campo-electrico/motor.ts   ← calcularCampoEnPunto, F = q₀·E, U = q₀·V
 *   app/simulador-campo-electrico/casos.ts   ← los 12 casos, el corrector y el aleatorio
 * y el panel de la sonda usa el MISMO motor que la corrección (regla de oro: se MOVIÓ, no se
 * replicó). Las cifras del acta de arriba (16,41 N/C con +5 nC a r² = 2,74) lo confirman: el
 * traslado no movió un número.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO — a mano, con k = 8,99·10⁹ y q en nC (k·1 nC = 8,99):
 *   1 · +5 nC, r = 1        → E = 8,99·5/1²                         = 44,95 N/C
 *   2 · +5 nC, r = 2        → E = 8,99·5/4 = 11,2375 → redondeo     = 11,24 N/C
 *   3 · −4 nC, P = (2; 0)   → |E| = 8,99·4/4 = 8,99, apunta a la carga (−x) → Eₓ = −8,99 N/C
 *   4 · −3 nC, r = 1,5      → V = 8,99·(−3)/1,5                     = −17,98 V
 *   5 · +2 en (−1;0), −2 en (1;0), P = origen: las dos empujan a +x → 17,98 + 17,98 = 35,96 N/C
 *   6 · +6 en (−1;0) → Eₓ = 53,94; +8 en (0;−1) → Eᵧ = 71,92; |E| = 8,99·√(36+64) = 89,90 N/C
 *   7 · +4 nC a 0,5 m → E = 8,99·4/0,25 = 143,84; F = 3 nC · 143,84      = 431,52 nN
 *   8 · +6 nC a 3 m   → V = 17,98; U = −2 nC · 17,98                     = −35,96 nJ
 *   9 · +4 en −1,5 y +1 en 1,5: 4/d₁² = 1/d₂², d₁ = 2d₂, d₁ + d₂ = 3 → d₁ = 2 → x = 0,50 m
 *  10 · +6 en origen, −5 en (1,5; 0), P = (0; 2): r₂ = 2,5 (terna 1,5-2-2,5)
 *                          → V = 8,99·(6/2 − 5/2,5) = 8,99·1           = 8,99 V
 *  11 · −6 nC, bolita +2 nC a 1 m: Eₓ = −53,94 → Fₓ = 2·(−53,94)        = −107,88 nN
 *  12 · +5 nC en (0; 0,5), gota −2 nC en origen: Eᵧ = −179,8 (hacia abajo)
 *                          → Fᵧ = −2·(−179,8), hacia arriba: la atrae  = 359,60 nN
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import {
  CASOS as CASOS_AULA,
  TOTAL_CASOS as TOTAL_CASOS_AULA,
  resolverCaso,
  comprobarRespuesta,
  toleranciaDe,
  generarEjercicioAleatorio,
} from '../../app/simulador-campo-electrico/casos';
import { calcularCampoEnPunto, modulo } from '../../app/simulador-campo-electrico/motor';
import {
  alCentimetro,
  leerCoordenada,
  textoCoordenada,
} from '../../app/simulador-campo-electrico/coordenada';

const A_MANO_AULA: Readonly<Record<number, number>> = {
  1: 44.95,
  2: 11.24,
  3: -8.99,
  4: -17.98,
  5: 35.96,
  6: 89.9,
  7: 431.52,
  8: -35.96,
  9: 0.5,
  10: 8.99,
  11: -107.88,
  12: 359.6,
};

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («11,24 N/C» → 2). */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/-?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

test.describe('simulador-campo-electrico · casos para clase', () => {
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
      expect(Math.round(r.valor * 100) / 100, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita, desarrollo y unidad', async () => {
    for (const caso of CASOS_AULA) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto, `caso ${caso.id}`).toContain(caso.unidad);
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
    // Lección de simulador-trigonometria-circulo-unitario (21/09/2026): tres casos pedían
    // «redondea a 2 decimales» y la solución enseñaba cuatro, así que el alumno escribía lo
    // pedido y leía otra cifra al comprobar.
    for (const caso of CASOS_AULA) {
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(2);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(
        caso.respuestaTexto,
      );
      if (caso.requiereRedondeo) {
        expect(caso.enunciado, `caso ${caso.id}: exige redondeo y no lo pide`).toMatch(/redonde/i);
      } else {
        // Si no se pide redondear, la cifra mostrada ES la exacta.
        expect(Math.abs(resolverCaso(caso.datos).valor - caso.respuesta), `caso ${caso.id}`).toBeLessThan(1e-9);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);
    expect(Math.round(resolverCaso(a.datos).valor * 100) / 100).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.magnitud)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta), `semilla ${m.semilla}`).toBe(true);
      expect(Math.round(resolverCaso(m.datos).valor * 100) / 100, `semilla ${m.semilla}`).toBe(m.respuesta);
    }
  });

  test('7 · el convenio queda fijado: k = 8,99·10⁹, q en nC, E vector y V escalar con signo', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS_AULA) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_AULA[caso.id]);
    }

    // (b) k·1 nC a 1 m = 8,99 N/C exactos: la constante es la de la app, no 9·10⁹.
    const unidad = calcularCampoEnPunto(1, 0, [{ x: 0, y: 0, q: 1 }]);
    expect(unidad.Ex).toBeCloseTo(8.99, 10);
    expect(unidad.V).toBeCloseTo(8.99, 10);
    // …pero quien use el 9·10⁹ del libro no suspende: 45 frente a 44,95 es un 0,11 %.
    expect(comprobarRespuesta(45, 44.95).correcto).toBe(true);

    // (c) E es un vector: en el punto medio de dos cargas iguales se anula, V no.
    const medio = calcularCampoEnPunto(0, 0, [
      { x: -1, y: 0, q: 3 },
      { x: 1, y: 0, q: 3 },
    ]);
    expect(modulo(medio.Ex, medio.Ey)).toBeCloseTo(0, 10);
    expect(medio.V).toBeCloseTo(2 * 8.99 * 3, 10);

    // (d) El punto de la sonda del acta de arriba, con el motor movido: 44,95/2,74.
    const sonda = calcularCampoEnPunto(1.5, 0.7, [{ x: 0, y: 0, q: 5 }]);
    expect(modulo(sonda.Ex, sonda.Ey)).toBeCloseTo(16.405109, 5);
  });

  test('8 · corregir no lanza nunca y nombra el error de signo', async () => {
    expect(comprobarRespuesta(44.95, 44.95).correcto).toBe(true);
    expect(comprobarRespuesta(NaN, 44.95).correcto).toBe(false);
    expect(comprobarRespuesta(NaN, 44.95).motivo).toContain('número');
    // El error típico del tema: el valor bien y el sentido al revés.
    const signo = comprobarRespuesta(8.99, -8.99);
    expect(signo.correcto).toBe(false);
    expect(signo.motivo).toContain('SIGNO');
    expect(toleranciaDe(0)).toBe(0.01);
    expect(toleranciaDe(431.52)).toBeCloseTo(4.3152, 10);

    // Un punto encima de la carga no da «Infinity»: se rechaza con un error legible.
    const encima = resolverCaso({ cargas: [{ x: 0, y: 0, q: 5 }], punto: { x: 0.01, y: 0 }, magnitud: 'modulo-E' });
    expect(encima.ok).toBe(false);
    expect(Number.isNaN(encima.valor)).toBe(true);
    // Ni una lista de cargas vacía.
    expect(resolverCaso({ cargas: [], punto: { x: 1, y: 0 }, magnitud: 'V' }).ok).toBe(false);
  });
});

test.describe('simulador-campo-electrico · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  test('el caso 7 se carga en el simulador y el panel da el E que usa la solución', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 7:/ }).click();
    await seccion(page).getByRole('button', { name: 'Cargar en el simulador' }).click();
    // +4 nC en el origen y la sonda en (0,5; 0): E = 8,99·4/0,25 = 143,84 N/C.
    await expect(valor(page, 'Posición x')).toHaveText('0,50 m');
    await expect(valor(page, '|E| (campo)')).toHaveText('143,84 N/C');

    await seccion(page).locator('#casos-respuesta').fill('431,52');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('Correcto');
  });

  test('una respuesta con el signo cambiado se nombra como tal', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 3:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('8,99');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('SIGNO');
    // Y el menos tipográfico «−» vale igual que el guion.
    await seccion(page).locator('#casos-respuesta').fill('−8,99');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('Correcto');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 28/09/2026 — TERCERA PASADA (re-inspección)
 *
 * Qué cambió desde la segunda: el 23/09 el cálculo se MOVIÓ a motor.ts y las equipotenciales
 * dejaron su copia de V = Σk·q/r para llamar a calcularCampoEnPunto con un corte de 0,08 m
 * (96a4e1d2); las flechas se redondean a la centésima de píxel (92c9490c); el rótulo q₀ sigue al
 * tema (f9c622c8). El 27/09 (586a4d61) el hero gana 80 px arriba HASTA 768 px para que el logo
 * fijo no tape el <h1>.
 *
 * Los 10 hallazgos reparados (215-220 y 269-272) se han vuelto a comprobar con sus tests de
 * arriba: los 30 pasan contra el build de producción de HEAD. Ninguno ha vuelto.
 *
 * CASOS NUEVOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (k = 8,99·10⁹, el de la app; con
 * el CODATA 8,9875·10⁹ el |E| del caso A daría 10,45 en vez de 10,46: −0,027 %, ya documentado)
 *
 *   CASO A (normal) — dos cargas colocadas CON EL TECLADO (la vía que abrió el hallazgo 270), en
 *   una configuración que no es ningún preset: +3 nC en (−1; 0) y −2 nC en (1; 1,5); sonda en (1; 0).
 *       carga +3: dx = 2, dy = 0, r = 2 → |E₁| = 8,99·3/4 = 6,7425 N/C, SE ALEJA → (+6,7425; 0)
 *                 V₁ = 8,99·3/2 = 13,485 V
 *       carga −2: dx = 0, dy = −1,5, r = 1,5 → |E₂| = 8,99·2/2,25 = 7,991111 N/C, apunta HACIA
 *                 ella (arriba) → (0; +7,991111) · V₂ = −8,99·2/1,5 = −11,986667 V
 *       Eₓ = 6,7425 → «6,74 N/C» · Eᵧ = 7,991111 → «7,99 N/C»
 *       |E| = √(45,461306 + 63,857857) = √109,319163 = 10,455580 → «10,46 N/C»
 *       V = 13,485 − 11,986667 = 1,498333 → «1,50 V»
 *       F = 1e-9 · 10,455580 = 1,0455580e-8 → «1,05 × 10⁻⁸ N» · U = 1,498333e-9 → «1,50 × 10⁻⁹ J»
 *       Flecha de fuerza (q₀ > 0, va con E): en el SVG, Δy/Δx = −7,991111/6,7425 = −1,1852
 *
 *   CASO B (límite) — dos cargas IGUALES de +5 nC en (∓0,5; 0), sonda en el centro: los dos
 *   campos (179,80 N/C cada uno) se anulan EXACTAMENTE → |E| = «0 N/C», |F| = «0 N» y ninguna
 *   flecha de fuerza; el potencial NO: V = 2 · 44,95/0,5 = 179,80 → «179,80 V»,
 *   U = 1,798e-7 → «1,80 × 10⁻⁷ J». Es el simétrico del punto medio del dipolo (CASO 2b).
 *   (Los otros dos límites que pide el acta —punto medio del dipolo y sonda sobre una carga—
 *   son los CASOS 2b y 3 de arriba, y siguen en verde.)
 *
 *   CASO C (rechazo / entrada) — la posición exacta de la sonda, ESCRITA:
 *       «99» → acotada a «4,00 m», el borde del lienzo: bien, lo cubre el 216.
 *       «-1» TECLEADO → esperado «-1,00 m» · obtenido «1,00 m»                    → H1
 *       «2.75» TECLEADO → esperado «2,75 m» · obtenido «4,00 m»                   → H1
 *       «1,234» (llega entero, como un pegado: el navegador entrega «1.234»)
 *                     → esperado «1,23 m» · obtenido «4,00 m»                    → H2
 *
 *   EQUIPOTENCIALES — el refactor cambió DE DÓNDE sale su V, así que se comprueba que cada
 *   curva dibujada es de potencial constante recalculando V = Σk·q/r a mano en sus vértices:
 *       carga puntual +5 nC: ref = k·Σ|q|/1 m = 44,95 V → niveles positivos 44,95 · 22,475 · 8,99
 *         → circunferencias de r = kq/V = 1,00 · 2,00 · 5,00 m (la última, fuera del lienzo).
 *         Medido: r = 0,998–1,002 y 1,999–2,001 m.
 *       dipolo ±5 nC: ref = 89,90 V → niveles −89,90 · −44,95 · −17,98 · +17,98 · +44,95 · +89,90.
 *         Medido: desvío máximo 3,1 % en los vértices pegados a las cargas (interpolación lineal
 *         de 1/r en una rejilla de 0,1 m: en posición es < 1 px). Con V ∝ 1/r² el desvío sería
 *         del 28 al 146 %, y con el signo cambiado, del 200 %: la tolerancia del 5 % los caza.
 *
 *   CASOS DE AULA — 6 (|E| = 8,99·√(6² + 8²) = 89,90 N/C), 12 (Fᵧ = −2 · (−179,80) = +359,60 nN)
 *   y 9 (d = 3·√4/(√4 + √1) = 2 m desde la de −1,5 → x = 0,50 m; allí E = 0 y
 *   V = 8,99·4/2 + 8,99·1/1 = 26,97 V), cargados en el simulador y corregidos por la interfaz.
 *
 * HALLAZGOS de esta pasada — REPARADOS el 28/09/2026 (sus tests nacieron con test.fail(); hoy
 * son candados de regresión, al final del bloque):
 *   H1 medio · 2383 · el campo «Posición exacta» no admitía lo que se TECLEA: «-» y «1.» son
 *              estados intermedios vacíos, parseSpanishNumberOr('') daba 0, la sonda saltaba a
 *              x = 0 y React reescribía el campo a «0» debajo del cursor.
 *   H2 bajo  · 2384 · con tres decimales el parser español leía el «1.234» del navegador como mil
 *              doscientos treinta y cuatro y la sonda saltaba al borde, 4,00 m.
 *   H3 bajo  · 2385 · las flechas acumulaban error de coma flotante (1,5 − 15 × 0,1 =
 *              −1,94·10⁻¹⁶): en la mediatriz del dipolo el panel daba V = «2,84 × 10⁻¹⁴ V».
 *   H4 bajo  · 2386 · entre 769 y ~930 px (iPad vertical, 810-834) el logo fijo tapaba el
 *              principio del <h1>: la regla del 27/09 solo daba los 80 px hasta 768.
 *   H5 bajo  · 2387 · «0,11 %» de la intro de los casos, con espacio normal y no con espacio duro.
 * Cómo se repararon: H1 y H2 con un campo de TEXTO que conserva lo tecleado y solo mueve la
 * sonda cuando ya es un número (app/simulador-campo-electrico/coordenada.ts); H3 redondeando cada
 * paso al centímetro; H4 con el bloque del hero hasta 1023 px (a1d72a9c, en las 187 apps del
 * lote); H5 con &nbsp;.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Inspector 28/09/2026 — motor, equipotenciales, sonda escrita y hero', () => {
  /** N·m²/C²: el de la app (bloque educativo y motor.ts). */
  const K = 8.99e9;

  interface CargaMano {
    x: number;
    y: number;
    /** nC */
    q: number;
  }

  /** V = Σ k·q/r calculado AQUÍ, sin el motor de la app: es la comprobación, no el comprobado. */
  const potencialAMano = (x: number, y: number, cargas: readonly CargaMano[]): number =>
    cargas.reduce((s, c) => s + (K * c.q * 1e-9) / Math.hypot(x - c.x, y - c.y), 0);

  /**
   * Los vértices de cada nivel de equipotencial, en metros del mundo, en el orden en que se
   * dibujan (de −ref a +ref). Los niveles sin ningún trazo no aparecen.
   */
  const verticesEquipotenciales = (page: Page) =>
    lienzo(page).evaluate((svg: SVGSVGElement) =>
      Array.from(svg.querySelectorAll('g'))
        .map((g) =>
          Array.from(g.children)
            .filter(
              (l) => l.tagName === 'line' && (l.getAttribute('class') ?? '').includes('equipotencial'),
            )
            .flatMap((l) => [
              [Number(l.getAttribute('x1')), Number(l.getAttribute('y1'))],
              [Number(l.getAttribute('x2')), Number(l.getAttribute('y2'))],
            ])
            // viewBox → mundo: origen en 400/250, 100 px por metro y la y del SVG hacia abajo
            .map(([sx, sy]) => [(sx - 400) / 100, (250 - sy) / 100]),
        )
        .filter((vertices) => vertices.length > 0),
    );

  /** Coloca la sonda escribiendo la posición ENTERA de golpe (fill), como un pegado. */
  async function sondaEn(page: Page, x: string, y: string): Promise<void> {
    for (const [campo, v] of [
      ['#sonda-x', x],
      ['#sonda-y', y],
    ] as const) {
      await page.locator(campo).fill(v);
      await esperarValorEnReact(page, campo, v);
    }
  }

  /** Pone una carga donde está la sonda, con el teclado (+ o −, la magnitud del deslizador). */
  async function cargaEnLaSonda(page: Page, tecla: '+' | '-'): Promise<void> {
    const circulos = lienzo(page).locator('circle[data-tipo="carga"]');
    const antes = await circulos.count();
    await lienzo(page).focus();
    await page.keyboard.press(tecla);
    await expect(circulos).toHaveCount(antes + 1);
  }

  test('CASO A · +3 nC en (−1; 0) y −2 nC en (1; 1,5) puestas con el teclado; sonda en (1; 0)', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Limpiar todo' }).click();
    await ponerMagnitud(page, 3);
    await sondaEn(page, '-1', '0');
    await cargaEnLaSonda(page, '+');
    await ponerMagnitud(page, 2);
    await sondaEn(page, '1', '1.5');
    await cargaEnLaSonda(page, '-');

    // Las dos, donde se pidieron: (−1; 0) → viewBox (300; 250) · (1; 1,5) → (500; 100)
    const centros = await lienzo(page)
      .locator('circle[data-tipo="carga"]')
      .evaluateAll((cs) => cs.map((c) => [Number(c.getAttribute('cx')), Number(c.getAttribute('cy'))]));
    expect(centros).toEqual([
      [300, 250],
      [500, 100],
    ]);
    await expect(lienzo(page).locator('text').filter({ hasText: /^\+3,0$/ })).toHaveCount(1);
    await expect(lienzo(page).locator('text').filter({ hasText: /^−2,0$/ })).toHaveCount(1);

    await sondaEn(page, '1', '0');
    await expect(valor(page, 'Posición x')).toHaveText('1,00 m');
    await expect(valor(page, 'Posición y')).toHaveText('0,00 m');
    // E₁ = 8,99·3/2² = 6,7425 hacia +x (se aleja de la +) · E₂ = 8,99·2/1,5² = 7,991111 hacia
    // +y (va hacia la −). Cada componente viene de UNA carga: un signo mal puesto se ve solo.
    await expect(valor(page, 'Eₓ')).toHaveText('6,74 N/C');
    await expect(valor(page, 'Eᵧ')).toHaveText('7,99 N/C');
    await expect(valor(page, '|E| (campo)')).toHaveText('10,46 N/C'); // √109,319163 = 10,455580
    await expect(valor(page, 'V (potencial)')).toHaveText('1,50 V'); // 13,485 − 11,986667
    await expect(valor(page, '|F| sobre q₀')).toHaveText('1,05 × 10⁻⁸ N'); // 1e-9 · 10,455580
    await expect(valor(page, 'U (energía)')).toHaveText('1,50 × 10⁻⁹ J'); // 1e-9 · 1,498333

    // La flecha de fuerza apunta hacia donde va E (q₀ > 0): arriba a la derecha, con la
    // pendiente del vector. En el SVG la y crece hacia abajo: Δy/Δx = −7,991111/6,7425 = −1,1852.
    // Las coordenadas van redondeadas a la centésima de píxel en una flecha de ~23 px, así que la
    // pendiente es fiable a ±0,002; dos decimales bastan para separar cualquier otro sentido.
    const flecha = lienzo(page).locator('line[stroke="#16a34a"]');
    await expect(flecha).toHaveCount(1);
    const d = await flecha.evaluate((l) => ({
      dx: Number(l.getAttribute('x2')) - Number(l.getAttribute('x1')),
      dy: Number(l.getAttribute('y2')) - Number(l.getAttribute('y1')),
    }));
    expect(d.dx).toBeGreaterThan(0);
    expect(d.dy).toBeLessThan(0);
    expect(d.dy / d.dx).toBeCloseTo(-1.1852, 2);
  });

  test('CASO B · dos cargas iguales de +5 nC: en el centro E = 0 exacto y V = 179,80 V', async ({ page }) => {
    await page.getByRole('button', { name: 'Limpiar todo' }).click();
    await expect(page.locator('#magnitud')).toHaveValue('5'); // la magnitud de arranque
    await sondaEn(page, '-0.5', '0');
    await cargaEnLaSonda(page, '+');
    await sondaEn(page, '0.5', '0');
    await cargaEnLaSonda(page, '+');
    await sondaEn(page, '0', '0');

    await expect(valor(page, 'Posición x')).toHaveText('0,00 m');
    await expect(valor(page, 'Posición y')).toHaveText('0,00 m');
    // Cada carga aporta 44,95/0,5² = 179,80 N/C, en sentidos OPUESTOS: se anulan exactos.
    await expect(valor(page, '|E| (campo)')).toHaveText('0 N/C');
    await expect(valor(page, 'Eₓ')).toHaveText('0 N/C');
    await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
    // El potencial es un escalar con el mismo signo en las dos: NO se anula. 2 · 44,95/0,5
    await expect(valor(page, 'V (potencial)')).toHaveText('179,80 V');
    await expect(valor(page, '|F| sobre q₀')).toHaveText('0 N');
    await expect(valor(page, 'U (energía)')).toHaveText('1,80 × 10⁻⁷ J'); // 1e-9 · 179,80
    // Sin fuerza no hay flecha que dibujar, y no es una singularidad: ni aviso ni «—».
    await expect(lienzo(page).locator('line[stroke="#16a34a"]')).toHaveCount(0);
    await expect(page.locator('[role="status"] p')).toHaveCount(0);
  });

  test('EQUIPOTENCIALES · cada curva dibujada es de V constante (V = Σk·q/r recalculado a mano)', async ({
    page,
  }) => {
    await page.getByLabel('Equipotenciales').check();

    // (a) Carga puntual +5 nC en el origen: V = kq/r, así que las equipotenciales son
    // circunferencias de r = kq/V. ref = 44,95 V; los niveles positivos 44,95 · 22,475 · 8,99 V
    // dan r = 1,00 · 2,00 · 5,00 m, y la de 5 m cae fuera del lienzo (±4 × ±2,5 m). Los
    // negativos no existen. Se dibujan en el orden de los niveles: primero r = 2, luego r = 1.
    await page.getByRole('button', { name: 'Carga puntual aislada' }).click();
    const puntual = await verticesEquipotenciales(page);
    expect(puntual).toHaveLength(2);
    for (const [i, radio] of [
      [0, 2],
      [1, 1],
    ] as const) {
      const desvio = Math.max(...puntual[i].map(([x, y]) => Math.abs(Math.hypot(x, y) - radio)));
      // Medido 0,0021 m como mucho. Con V ∝ 1/r², la de 22,475 V caería en r = √2 = 1,41 m.
      expect(desvio, `circunferencia de r = ${radio} m`).toBeLessThan(0.005);
    }

    // (b) Dipolo ±5 nC: ref = k·10 nC/1 m = 89,90 V → seis niveles, todos dentro del lienzo.
    await page.getByRole('button', { name: 'Dipolo' }).click();
    const dipolo = await verticesEquipotenciales(page);
    const NIVELES = [-89.9, -44.95, -17.98, 17.98, 44.95, 89.9];
    const DIPOLO: CargaMano[] = [
      { x: -0.5, y: 0, q: 5 },
      { x: 0.5, y: 0, q: -5 },
    ];
    expect(dipolo).toHaveLength(NIVELES.length);
    NIVELES.forEach((nivel, i) => {
      const peor = Math.max(
        ...dipolo[i].map(([x, y]) => Math.abs(potencialAMano(x, y, DIPOLO) - nivel) / Math.abs(nivel)),
      );
      // Medido ≤ 3,1 % (interpolación lineal de 1/r en una rejilla de 0,1 m; < 1 px en posición).
      // Un signo cambiado lo llevaría al nivel opuesto (200 %) y V ∝ 1/r², a entre el 28 y el 146 %.
      expect(peor, `equipotencial de ${nivel} V`).toBeLessThan(0.05);
    });
  });

  test('CASOS DE AULA 6, 12 y 9 · el panel da lo que usa la solución y se corrige lo resuelto a mano', async ({
    page,
  }) => {
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    const corregir = async (respuesta: string) => {
      await seccion.locator('#casos-respuesta').fill(respuesta);
      await seccion.getByRole('button', { name: 'Comprobar' }).click();
      return seccion.getByRole('alert');
    };

    // Caso 6: +6 nC en (−1; 0) y +8 nC en (0; −1), punto (0; 0).
    // E₁ = 8,99·6/1² = 53,94 hacia +x · E₂ = 8,99·8/1² = 71,92 hacia +y · |E| = 8,99·√100 = 89,90
    await seccion.getByRole('button', { name: /^Caso 6:/ }).click();
    await seccion.getByRole('button', { name: 'Cargar en el simulador' }).click();
    await expect(valor(page, 'Eₓ')).toHaveText('53,94 N/C');
    await expect(valor(page, 'Eᵧ')).toHaveText('71,92 N/C');
    await expect(valor(page, '|E| (campo)')).toHaveText('89,90 N/C');
    await expect(await corregir('89,9')).toContainText('Correcto');
    // Sumar los módulos (53,94 + 71,92 = 125,86) es justo el error que el caso quiere cazar.
    await expect(await corregir('125,86')).toContainText('No es correcto');

    // Caso 12: +5 nC en (0; 0,5) y una gota de −2 nC en el origen.
    // Eᵧ = −8,99·5/0,5² = −179,80 N/C (se aleja de la +: abajo) → Fᵧ = −2 · (−179,80) = +359,60 nN
    await seccion.getByRole('button', { name: /^Caso 12:/ }).click();
    await seccion.getByRole('button', { name: 'Cargar en el simulador' }).click();
    await expect(valor(page, 'Eᵧ')).toHaveText('-179,80 N/C');
    await expect(await corregir('359,6')).toContainText('Correcto');
    await expect(await corregir('-359,6')).toContainText('SIGNO');

    // Caso 9: +4 nC en (−1,5; 0) y +1 nC en (1,5; 0). d = 3·√4/(√4 + √1) = 2 m desde la de −1,5
    // → x = 0,50 m. El caso no fija la sonda, y lo dice.
    await seccion.getByRole('button', { name: /^Caso 9:/ }).click();
    await seccion.getByRole('button', { name: 'Cargar en el simulador' }).click();
    await expect(seccion.getByText('Este caso no fija la sonda')).toBeVisible();
    await expect(await corregir('0,5')).toContainText('Correcto');
    // Y el simulador lo confirma: en x = 0,50 m, E = 0 y V = 8,99·4/2 + 8,99·1/1 = 26,97 V.
    await sondaEn(page, '0.5', '0');
    await expect(valor(page, '|E| (campo)')).toHaveText('0 N/C');
    await expect(valor(page, 'V (potencial)')).toHaveText('26,97 V');
  });

  /**
   * Teclea en un campo de la posición exacta CARÁCTER A CARÁCTER, como una persona. `fill()`
   * pega el valor entero de golpe, sin pasar por los estados intermedios («-», «2.»), y por eso
   * el test del 270 no vio el hallazgo 2383.
   */
  async function teclear(page: Page, campo: string, texto: string): Promise<void> {
    await page.locator(campo).click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type(texto, { delay: 30 });
  }

  // HALLAZGO 2383 (H1, medio, operativa) · REPARADO (28/09/2026).
  // El campo «Posición exacta de la sonda» (la vía sin ratón que abrió el hallazgo 270) era un
  // <input type="number"> controlado cuyo onChange hacía parseSpanishNumberOr(e.target.value). Al
  // teclear, «-» y «1.» son estados intermedios que el navegador entrega como «»;
  // parseSpanishNumberOr('') daba 0, la sonda saltaba a x = 0 y React reescribía el campo a «0»
  // debajo del cursor: «-1» → «01» → 1,00 m y «2.75» → «0» → «07» → 4,00 m. Pegado de golpe
  // (fill) funcionaba, por eso el test del 270 pasaba.
  // Reparación: campo de TEXTO que conserva lo tecleado mientras tiene el foco y solo mueve la
  // sonda cuando lo escrito ya es un número. Con type="text" la configuración regional del
  // navegador ya no interviene; se prueba en las tres que citaba la ficha para que conste.
  // Caso: foco en x, seleccionar todo y teclear «-1» → «-1,00 m» (antes 1,00 m); «2.75» →
  //       «2,75 m» (antes 4,00 m); «-0,5» → «-0,50 m» (antes 0,50 m).
  for (const locale of ['es-ES', 'es-MX', 'en-US'] as const) {
    test.describe(`tecleado con el navegador en ${locale}`, () => {
      test.use({ locale });

      test(`HALLAZGO 2383 (H1) · la posición exacta admite lo que se TECLEA: negativos y punto decimal (${locale})`, async ({
        page,
      }) => {
        const campoX = page.locator('#sonda-x');
        // A medio escribir, la sonda NO se mueve y el campo NO se reescribe: era la raíz del defecto.
        await teclear(page, '#sonda-x', '-');
        await expect(campoX).toHaveValue('-');
        await expect(valor(page, 'Posición x')).toHaveText('1,50 m'); // la de arranque
        await page.keyboard.type('1', { delay: 30 });
        await expect(valor(page, 'Posición x')).toHaveText('-1,00 m');
        await expect(campoX).toHaveValue('-1');

        await teclear(page, '#sonda-x', '2.');
        await expect(campoX).toHaveValue('2.');
        await expect(valor(page, 'Posición x')).toHaveText('2,00 m');
        await page.keyboard.type('75', { delay: 30 });
        await expect(valor(page, 'Posición x')).toHaveText('2,75 m');
        await expect(campoX).toHaveValue('2.75');

        await teclear(page, '#sonda-x', '-0,5');
        await expect(valor(page, 'Posición x')).toHaveText('-0,50 m');

        // La y tiene su propio borde (±2,50 m) y el mismo comportamiento.
        await teclear(page, '#sonda-y', '-2.25');
        await expect(valor(page, 'Posición y')).toHaveText('-2,25 m');

        // Fuera del campo, cada uno enseña dónde está la sonda, en formato español.
        await lienzo(page).focus();
        await expect(campoX).toHaveValue('-0,5');
        await expect(page.locator('#sonda-y')).toHaveValue('-2,25');
      });
    });
  }

  // Lo que el <input type="number"> daba y el campo de texto tenía que conservar: ↑/↓ con paso
  // de 10 cm (1 cm con Mayús), el borde del lienzo y que no se cuelen letras.
  test('HALLAZGO 2383 (H1) · el campo de texto conserva las flechas, el borde y el filtro del type="number"', async ({
    page,
  }) => {
    const campoX = page.locator('#sonda-x');
    await campoX.click();
    await page.keyboard.press('ArrowUp'); // 1,50 → 1,60
    await expect(valor(page, 'Posición x')).toHaveText('1,60 m');
    await expect(campoX).toHaveValue('1,6');
    await page.keyboard.press('Shift+ArrowDown'); // 1,60 → 1,59
    await expect(valor(page, 'Posición x')).toHaveText('1,59 m');
    await expect(campoX).toHaveValue('1,59');
    // Nombre accesible y semántica de control numérico, como el type="number" de antes.
    await expect(page.getByRole('spinbutton', { name: 'x (m)' })).toHaveAttribute('aria-valuenow', '1.59');

    // Fuera del lienzo se acota al borde (lo pedía el 216) e Intro lo deja escrito en el campo.
    await teclear(page, '#sonda-x', '99');
    await expect(valor(page, 'Posición x')).toHaveText('4,00 m');
    await page.keyboard.press('Enter');
    await expect(campoX).toHaveValue('4');

    // Ni letras ni exponentes: la «e» se rechaza en la pulsación, como en el type="number".
    await teclear(page, '#sonda-x', '-1e3');
    await expect(campoX).toHaveValue('-13');
    await expect(valor(page, 'Posición x')).toHaveText('-4,00 m'); // −13 → acotado al borde
    // Lo que tiene forma de número pero no lo es se marca y no mueve la sonda.
    await teclear(page, '#sonda-x', '1,2,3');
    await expect(campoX).toHaveAttribute('aria-invalid', 'true');
    await expect(valor(page, 'Posición x')).toHaveText('1,20 m'); // el «1,2» que sí era número
    await lienzo(page).focus();
    await expect(campoX).toHaveValue('1,2');
    await expect(campoX).toHaveAttribute('aria-invalid', 'false');
  });

  // HALLAZGO 2384 (H2, bajo, operativa) · REPARADO (28/09/2026).
  // Un <input type="number"> entrega SIEMPRE su valor con punto decimal («1,234» tecleado o pegado
  // en es-ES llegaba como «1.234»), y la app lo pasaba por parseSpanishNumberOr, que con un solo
  // separador resuelve a favor del español: «1.234» = mil doscientos treinta y cuatro. Acotado al
  // lienzo, la sonda saltaba a 4,00 m.
  // Reparación: el campo es de texto, así que «1,234» llega con su coma; y un punto SOLO se lee
  // como decimal, porque en un campo acotado a ±4 m ningún millar cabe (la regla del millar del
  // parser salió de los importes, donde «1.500» sí son mil quinientos). Así «1.234» tecleado en
  // México o en Estados Unidos también es 1,234 m.
  // Caso: x = «1,234» escrito de golpe → «1,23 m» (antes 4,00 m); «-2.375» → «-2,38 m» (antes
  //       -4,00 m).
  test('HALLAZGO 2384 (H2) · una posición con tres decimales no se lee como millares', async ({ page }) => {
    const campoX = page.locator('#sonda-x');
    await campoX.fill('1,234');
    await esperarValorEnReact(page, '#sonda-x', '1,234');
    await expect(valor(page, 'Posición x')).toHaveText('1,23 m');
    await campoX.fill('-2.375');
    await esperarValorEnReact(page, '#sonda-x', '-2.375');
    await expect(valor(page, 'Posición x')).toHaveText('-2,38 m');
    // Y tecleado con punto, carácter a carácter, como en es-MX o en-US.
    await teclear(page, '#sonda-x', '1.234');
    await expect(valor(page, 'Posición x')).toHaveText('1,23 m');
    await teclear(page, '#sonda-x', '1.000');
    await expect(valor(page, 'Posición x')).toHaveText('1,00 m'); // un metro, no mil
    // Fuera del campo se enseña con todos sus decimales y con coma.
    await teclear(page, '#sonda-x', '1.234');
    await lienzo(page).focus();
    await expect(campoX).toHaveValue('1,234');
  });

  // Lo que el campo lee, cómo lo enseña y el paso del teclado, sin navegador: ./coordenada.ts.
  test('HALLAZGOS 2383-2385 · coordenada.ts lee lo tecleado, lo enseña en español y redondea el paso', async () => {
    // A medio escribir no hay número: la sonda se queda donde estaba.
    for (const t of ['', '-', '+', '−', ',', '.', '1,2,3', '1.2.3']) {
      expect(leerCoordenada(t), `«${t}»`).toBeNaN();
    }
    expect(leerCoordenada('1.')).toBe(1); // «1.» camino de «1.5»: la sonda va a 1
    expect(leerCoordenada('-1')).toBe(-1);
    expect(leerCoordenada('−0,5')).toBe(-0.5); // el menos tipográfico
    expect(leerCoordenada('2.75')).toBe(2.75);
    expect(leerCoordenada('.5')).toBe(0.5);
    // El punto solo es decimal (en ±4 m no cabe un millar); la coma, como siempre.
    expect(leerCoordenada('1.234')).toBe(1.234);
    expect(leerCoordenada('1,234')).toBe(1.234);
    expect(leerCoordenada('1.000')).toBe(1);
    // Con los dos separadores manda el parser del proyecto, sin cambios.
    expect(leerCoordenada('1.234,5')).toBe(1234.5);

    expect(textoCoordenada(-1.942890293094024e-16)).toBe('0');
    expect(textoCoordenada(-0)).toBe('0');
    expect(textoCoordenada(1.7000000000000002)).toBe('1,7');
    expect(textoCoordenada(0.29)).toBe('0,29'); // 0,29 · 100 = 28,999999999999996
    expect(textoCoordenada(-2.375)).toBe('-2,375');
    expect(textoCoordenada(4)).toBe('4');

    // 15 pasos de −0,1 desde 1,5: sin redondear, −1,94·10⁻¹⁶; al centímetro, 0 (y no −0).
    let x = 1.5;
    for (let i = 0; i < 15; i++) x = alCentimetro(x - 0.1);
    expect(Object.is(x, 0)).toBe(true);
  });

  // HALLAZGO 2385 (H3, bajo, cálculo) · REPARADO (28/09/2026).
  // Las flechas sumaban ±0,1 m sin redondear, y el error de coma flotante se acumulaba: 1,5 −
  // 15 × 0,1 = −1,94·10⁻¹⁶. El panel escribía la posición como «≈0 m», pero las filas de física
  // pasan por sufijoNotacion, que da notación científica a todo |n| < 10⁻³: en la mediatriz del
  // dipolo, donde el CASO 1 (arrastrando) da «0 V», por teclado salía «2,84 × 10⁻¹⁴ V», y en el
  // centro del cuadrupolo |E| = «8,53 × 10⁻¹⁴ N/C» donde la FAQ de la propia app dice E = 0. El
  // campo «Posición exacta» mostraba además «-1.942890293094024e-16» (y «1.7000000000000002» tras
  // dos → desde el arranque).
  // Reparación: cada paso de las flechas se redondea al centímetro, y el campo enseña la
  // coordenada en formato español con los decimales que tiene.
  // Caso: preset «Dipolo», foco en el lienzo, 15 × ← y 2 × ↓ → (0,00; 0,50) → V = «0 V»,
  //       Eᵧ = «0 N/C», x = «0,00 m» (antes «2,84 × 10⁻¹⁴ V», «9,24 × 10⁻¹⁴ N/C», «≈0 m»).
  test('HALLAZGO 2385 (H3) · con las flechas del teclado, la mediatriz del dipolo da V = 0, como arrastrando', async ({
    page,
  }) => {
    // Dos → desde el arranque: 1,5 + 0,1 + 0,1 daba «1.7000000000000002» en el campo.
    await lienzo(page).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(valor(page, 'Posición x')).toHaveText('1,70 m');
    await expect(page.locator('#sonda-x')).toHaveValue('1,7');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft'); // de vuelta a 1,50, el punto de partida de la ficha

    await page.getByRole('button', { name: 'Dipolo' }).click();
    await lienzo(page).focus();
    for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowLeft'); // x: 1,50 → 0,00
    for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowDown'); // y: 0,70 → 0,50
    await expect(valor(page, 'Posición y')).toHaveText('0,50 m');
    // Lo que no depende del ruido sale como en el CASO 1: la mediatriz está bien alcanzada.
    await expect(valor(page, 'Eₓ')).toHaveText('127,14 N/C');
    // Y lo que es CERO por simetría sale cero, como arrastrando.
    await expect(valor(page, 'Posición x')).toHaveText('0,00 m');
    await expect(valor(page, 'V (potencial)')).toHaveText('0 V');
    await expect(valor(page, 'Eᵧ')).toHaveText('0 N/C');
    await expect(valor(page, 'U (energía)')).toHaveText('0 J');
    await expect(page.locator('#sonda-x')).toHaveValue('0');

    // El segundo caso de la ficha: el centro del cuadrupolo, 5 × ↓ desde (0; 0,5).
    await page.getByRole('button', { name: 'Cuadrupolo' }).click();
    await lienzo(page).focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowDown'); // y: 0,50 → 0,00
    await expect(valor(page, 'Posición y')).toHaveText('0,00 m');
    await expect(valor(page, '|E| (campo)')).toHaveText('0 N/C');
    await expect(valor(page, 'V (potencial)')).toHaveText('0 V');
    await expect(page.locator('#sonda-y')).toHaveValue('0');
  });

  // HALLAZGO 2387 (H5, bajo, contenido) · REPARADO (28/09/2026).
  // CLAUDE.md global §2 (regla del 25/09/2026): el % va separado de la cifra con espacio DURO
  // (U+00A0), para que no salte solo de línea. La intro de «Casos para clase» (CasosAula.tsx,
  // escrita el 23/09) lo separaba con un espacio normal. Es el único porcentaje visible de la app.
  // Caso: texto de la intro → «0,11 %» con U+00A0 (antes con U+0020).
  test('HALLAZGO 2387 (H5) · el «0,11 %» de la intro de los casos lleva espacio duro', async ({ page }) => {
    const intro = page
      .locator('section[aria-labelledby="casos-aula-titulo"] p')
      .filter({ hasText: /0,11/ });
    await expect(intro).toHaveCount(1);
    const texto = (await intro.textContent()) ?? '';
    expect(texto).toContain('0,11 %');
    expect(texto).not.toContain('0,11 %');
  });

  test.describe('hero y logo fijo, de móvil a tableta vertical', () => {
    test.use({
      viewport: { width: 834, height: 1112 },
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    /** Letras del <h1> cuya caja se cruza con la del logo fijo, a scroll 0. */
    const letrasTapadas = (page: Page): Promise<string> =>
      page.evaluate(() => {
        const logo = document.querySelector('[class*="logoContainer"]');
        const texto = document.querySelector('h1')?.firstChild;
        if (!logo || !texto || texto.nodeType !== Node.TEXT_NODE) throw new Error('sin logo o sin <h1>');
        const l = logo.getBoundingClientRect();
        const nodo = texto as Text;
        let tapadas = '';
        for (let i = 0; i < nodo.length; i++) {
          const r = document.createRange();
          r.setStart(nodo, i);
          r.setEnd(nodo, i + 1);
          const c = r.getBoundingClientRect();
          const ancho = Math.min(l.right, c.right) - Math.max(l.left, c.left);
          const alto = Math.min(l.bottom, c.bottom) - Math.max(l.top, c.top);
          if (c.width > 0 && ancho > 0.5 && alto > 0.5) tapadas += nodo.data[i];
        }
        return tapadas;
      });

    /** Lee hasta que dos lecturas coinciden: tras cambiar de ancho la maquetación se asienta. */
    async function estable(page: Page): Promise<string> {
      let anterior = await letrasTapadas(page);
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(100);
        const actual = await letrasTapadas(page);
        if (actual === anterior) return actual;
        anterior = actual;
      }
      return anterior;
    }

    test('REGRESIÓN 586a4d61 · hasta 768 px el logo fijo no tapa ninguna letra del <h1>', async ({ page }) => {
      // Antes de 586a4d61 el hero iba con 40 px arriba y el logo (10-52 px) tapaba «Simu» a 390.
      for (const ancho of [360, 390, 768]) {
        await page.setViewportSize({ width: ancho, height: 900 });
        expect(await estable(page), `a ${ancho} px`).toBe('');
      }
    });

    // HALLAZGO 2386 (H4, bajo, accesibilidad) · REPARADO (28/09/2026, a1d72a9c).
    // La regla del 27/09 (586a4d61) daba 80 px al hero solo hasta 768 px. Por encima, el hero
    // volvía a 40 px arriba mientras el logo fijo crece a [20, 15, 203, 77] (no a [15, 10, 141, 52]
    // como en móvil), y el <h1>, centrado y a 4vw, empezaba a la izquierda de x = 203 hasta ~930 px
    // de ancho. Medido a scroll 0:
    //   769 px → «Si» · 800 px → «Sim» · 810-834 px → «Si» · 900 px → «S» · 1023 px → nada.
    // Se leía «mulador de Campo Eléctrico» a 800 px e «imulador…» a 834 (iPad vertical).
    // Reparación: el bloque de 80 px llega hasta 1023 px (a1d72a9c, en los 187 módulos del lote).
    // Caso: 834 × 1112 → ninguna letra del <h1> bajo el logo (antes «Si»); 800 px → ninguna
    //       (antes «Sim»). Se miden también los otros anchos del acta.
    test('HALLAZGO 2386 (H4) · en tableta vertical (769-1023 px) el logo fijo tampoco tapa el <h1>', async ({ page }) => {
      for (const ancho of [834, 800, 769, 810, 900, 1023]) {
        await page.setViewportSize({ width: ancho, height: 1112 });
        expect(await estable(page), `a ${ancho} px`).toBe('');
      }
    });
  });
});
