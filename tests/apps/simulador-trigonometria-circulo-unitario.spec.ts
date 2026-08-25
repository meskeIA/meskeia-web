import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-trigonometria-circulo-unitario (segmento CÁLCULO / matemáticas)
 *
 * Primera inspección 25/08/2026 · 215 usos reales · riesgo 3.
 *
 * El <h1> promete «Simulador del Círculo Trigonométrico» y el subtítulo «Mueve el ángulo θ y
 * observa seno, coseno y tangente sobre el círculo unitario en tiempo real». La metadata añade
 * «ángulos notables», «toggle entre grados y radianes», «indicador de cuadrante» y «panel de
 * valores numéricos con 4 decimales e identidad sin²+cos²=1».
 *
 * Aquí la verdad es EXACTA y se sabe de memoria: no hay margen de tolerancia que discutir.
 * Los valores notables salen de dos triángulos que caben en una servilleta:
 *
 *   · TRIÁNGULO 30-60-90 — equilátero de lado 2 partido por su altura: catetos 1 y √3,
 *     hipotenusa 2. De ahí sen 30° = 1/2 y cos 30° = √3/2 = 0,86602540…, y al intercambiar
 *     cateto opuesto y contiguo, sen 60° = √3/2 y cos 60° = 1/2.
 *       tan 30° = (1/2)/(√3/2) = 1/√3 = √3/3 = 0,57735027… → «0,5774»
 *       tan 60° = (√3/2)/(1/2) = √3   = 1,73205081…        → «1,7321»
 *   · TRIÁNGULO 45-45-90 — cuadrado de lado 1, diagonal √2: sen 45° = cos 45° = √2/2 =
 *     0,70710678… → «0,7071», y tan 45° = 1 exacto. Es el único ángulo con sen = cos.
 *
 * Y los signos por cuadrante, que es donde falla el alumno (regla ACTS, antihoraria):
 *   I (0-90) todo +   ·   II (90-180) solo sen +   ·   III (180-270) solo tan +   ·
 *   IV (270-360) solo cos +.
 * Por eso los cuatro cuadrantes se comprueban con el MISMO ángulo de referencia 30°/45°/60°
 * reflejado: 150° y 30° tienen el mismo seno y el coseno opuesto; 210° invierte los dos;
 * 330° invierte solo el seno. Un simulador que calcule bien el primer cuadrante y se coma un
 * signo en el tercero es exactamente el error que esta app dice enseñar a evitar.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-trigonometria-circulo-unitario/page.tsx (no hay motor.ts; todo en la vista)
 *     · gradosARadianes(g) = g·π/180
 *     · formatearNumero(n, 4) = n.toFixed(4).replace('.', ',')   ← formato español
 *     · calcularTangente(a): si |cos a| < 1e-10 devuelve '∞'; si no, formatea Math.tan(rad).
 *       ESTA GUARDIA ES LA PIEZA DECISIVA de la app: sin ella, Math.tan(Math.PI/2) devuelve
 *       16331239353195370 y el simulador estaría enseñando que tan 90° es un número.
 *     · obtenerCuadrante(a): '—' en 0/90/180/270/360, y I/II/III/IV en el resto.
 *     · El lienzo (canvas 2D) sitúa el punto en px = cx + r·cos(−θ), py = cy + r·sin(−θ).
 *       Con la Y de pantalla invertida eso equivale a (cx + r·cos θ, cy − r·sin θ): giro
 *       ANTIHORARIO desde el semieje X positivo, que es la convención trigonométrica.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — LOS NOTABLES EN LOS CUATRO CUADRANTES. Cada terna es el mismo
 *   triángulo de referencia con los signos del cuadrante:
 *
 *      θ      sen        cos        tan        Q     de dónde sale
 *      30°   +0,5000    +0,8660    +0,5774     I     1/2 · √3/2 · √3/3
 *      45°   +0,7071    +0,7071    +1,0000     I     √2/2 · √2/2 · 1   (sen = cos)
 *      60°   +0,8660    +0,5000    +1,7321     I     √3/2 · 1/2 · √3
 *     120°   +0,8660    −0,5000    −1,7321     II    ref. 60°, cos y tan cambian de signo
 *     135°   +0,7071    −0,7071    −1,0000     II    ref. 45°
 *     150°   +0,5000    −0,8660    −0,5774     II    ref. 30°  (sen 150° = sen 30°)
 *     210°   −0,5000    −0,8660    +0,5774     III   ref. 30°, sen y cos negativos → tan +
 *     225°   −0,7071    −0,7071    +1,0000     III   ref. 45°
 *     240°   −0,8660    −0,5000    +1,7321     III   ref. 60°
 *     300°   −0,8660    +0,5000    −1,7321     IV    ref. 60°, solo cos positivo
 *     315°   −0,7071    +0,7071    −1,0000     IV    ref. 45°
 *     330°   −0,5000    +0,8660    −0,5774     IV    ref. 30°
 *
 *   Y el equivalente en radianes de cada uno: 30° = π/6, 45° = π/4, 60° = π/3, 90° = π/2,
 *   120° = 2π/3, 135° = 3π/4, 150° = 5π/6, 180° = π, 210° = 7π/6, 225° = 5π/4, 240° = 4π/3,
 *   270° = 3π/2, 300° = 5π/3, 315° = 7π/4, 330° = 11π/6, 360° = 2π. La fracción tiene que
 *   corresponder al decimal: 45° = 0,785398… rad y π/4 = 0,785398…, la misma cosa escrita de
 *   dos maneras.
 *
 *   CASO 2 (límite) — LOS CINCO ÁNGULOS DE LOS EJES, donde la tangente se cae:
 *       0°   sen 0      cos +1     tan 0
 *      90°   sen +1     cos 0      tan NO EXISTE  ← 0 en el denominador
 *     180°   sen 0      cos −1     tan 0
 *     270°   sen −1     cos 0      tan NO EXISTE  ← 0 en el denominador
 *     360°   sen 0      cos +1     tan 0          ← idéntico a 0°: el periodo es 360°
 *   tan θ = sen θ / cos θ, y en 90° y 270° el coseno vale CERO EXACTO, así que la división no
 *   está definida. Lo esperado es «∞» / «no existe», JAMÁS 16331239353195370 ni un número
 *   redondeado cualquiera. La app acierta de pleno aquí (guardia |cos| < 1e-10).
 *   También se comprueba la periodicidad prometida por el bloque educativo: 390° ≡ 30° y
 *   −30° ≡ 330°.
 *
 *   CASO 3 (rechazo) — texto, vacío y valores absurdos. El campo es <input type="number">
 *   con min 0 / max 360, así que el navegador ya filtra las letras. Lo que se exige es que
 *   NUNCA aparezca NaN, Infinity ni «undefined» en el panel, y que una entrada fuera de rango
 *   no se convierta CALLANDO en otro ángulo distinto.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * QUÉ SALIÓ BIEN (y por eso queda asertado arriba, para que no se rompa)
 *   · Los doce notables de los cuatro cuadrantes: los 36 números, exactos a 4 decimales.
 *   · tan 90° y tan 270° → «∞». El caso decisivo lo pasa.
 *   · Las 17 fracciones de radianes corresponden a su ángulo, y el decimal de un ángulo no
 *     notable también (1° → «0,0175 rad»).
 *   · El punto del lienzo gira ANTIHORARIO desde el eje X positivo, con error < 1 px en los
 *     cuatro cuadrantes, y los segmentos gruesos de proyección apuntan al lado correcto
 *     (cos a la derecha en I y IV, a la izquierda en II y III; sen arriba en I y II, abajo en
 *     III y IV). También en móvil de 390 px y en modo oscuro.
 *
 * HALLAZGOS ABIERTOS — al final del fichero, en tests que HOY FALLAN a propósito (convención
 * del proyecto: el test se escribe contra lo que DEBERÍA ocurrir, no contra lo que ocurre):
 *   · H1 (cálculo, medio) · Cero negativo en los ejes: tan 180° = «−0,0000», cos 270° =
 *     «−0,0000», sen 360° y tan 360° = «−0,0000». Los cuatro valen CERO EXACTO y la propia
 *     tabla del bloque educativo de la app dice «tan 180° = 0», «cos 270° = 0», «sen 360° =
 *     0». El signo es basura de coma flotante (−1,22e−16, −1,84e−16, −2,45e−16) que toFixed(4)
 *     conserva porque nadie normaliza el cero.
 *   · H2 (cálculo, medio) · El panel de signos rotula el cero como positivo o negativo: en
 *     270° dice «cos − (negativo)» valiendo cos 270° = 0, y en 360° «sen − (negativo)»
 *     valiendo sen 360° = 0. El cero no tiene signo. La app YA sabe que esos cinco ángulos son
 *     especiales, porque su propio Cuadrante los rotula «—».
 *   · H3 (operativa, medio) · Entrada fuera de rango convertida en silencio en otro ángulo:
 *     teclear 450 deja 45° (se descarta el tercer dígito, sin aviso), teclear −30 deja 30°
 *     (se pierde el signo; −30° ≡ 330°, no 30°) y vaciar el campo salta a 0°, porque
 *     Number('') === 0 pasa el guardián `v >= 0 && v <= 360`. No hay ningún role="alert".
 *   · H4 (contenido, bajo) · El bloque educativo promete un rango que el control no admite:
 *     el paso 1 dice «Si el ángulo es negativo, gira en sentido horario. Si supera 360°, da
 *     vueltas completas y continúa» y el error frecuente nº 5 pone de ejemplo sen 390° =
 *     sen 30°, pero el slider y el campo están acotados a [0, 360] y no dejan probarlo.
 *   · H5 (operativa, bajo) · El conmutador «Radianes (rad)» solo reescribe la etiqueta «θ =»:
 *     el slider sigue siendo 0-360 con aria-label «Ángulo θ en grados», el campo conserva el
 *     sufijo «°» y teclear 1 en modo radianes da 1° (0,0175 rad), no 1 rad ≈ 57,3°. La
 *     conversión que muestra sí es correcta; lo que falla es la promesa de la etiqueta.
 *   · H6 (contenido, bajo) · La fila «sin²+cos²» es la cadena literal '1,0000 ✓' escrita a
 *     mano en page.tsx (línea 477), no un cálculo: daría el visto bueno aunque el seno y el
 *     coseno estuviesen mal. El paso 5 del bloque educativo enseña justo lo contrario («Si tu
 *     resultado no satisface esta identidad, hay un error»). No es asertable desde el DOM
 *     —el valor mostrado es el correcto— y queda solo documentado aquí.
 *   · H7 (accesibilidad, bajo) · Diez botones sin type="button" (los dos de unidad y los ocho
 *     de ángulos notables; trece con los tres de velocidad cuando la animación corre), contra
 *     CLAUDE.md global §5. Y los ocho notables pintan un estado activo que no exponen con
 *     aria-pressed, así que un lector de pantalla no sabe cuál está seleccionado.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-trigonometria-circulo-unitario/';

/** Escritorio ancho: el lienzo y el panel de valores van en dos columnas. */
test.use({ viewport: { width: 1400, height: 1000 } });

/**
 * Valor de una fila del panel: se busca el <span> cuyo texto es EXACTAMENTE la etiqueta y se
 * toma su hermano inmediato. Todo el panel vive dentro del único role="status" de la página.
 */
function valor(page: Page, etiqueta: string) {
  const escapada = etiqueta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page
    .locator('[role="status"] span')
    .filter({ hasText: new RegExp(`^${escapada}$`) })
    .first()
    .locator('xpath=following-sibling::span[1]');
}

const campoAngulo = (page: Page) => page.getByLabel('Ángulo θ numérico');

/** Fija el ángulo por el campo numérico, que es el camino que usa quien busca un valor exacto. */
async function ponerAngulo(page: Page, grados: number): Promise<void> {
  await campoAngulo(page).fill(String(grados));
  await expect(valor(page, 'θ (grados)')).toHaveText(`${grados}°`);
}

/** Las tres razones tal y como las rotula el panel, ya en formato español. */
async function razones(page: Page) {
  return {
    sen: await valor(page, 'sin(θ)').innerText(),
    cos: await valor(page, 'cos(θ)').innerText(),
    tan: await valor(page, 'tan(θ)').innerText(),
  };
}

/**
 * Centroide del punto azul (#2E86AB) que está SOBRE la circunferencia, en coordenadas CSS del
 * lienzo. Se descarta todo píxel del mismo azul que no esté a distancia ≈ radio del centro
 * (el radio y la etiqueta θ comparten color).
 */
async function puntoDelLienzo(page: Page) {
  return await page.evaluate(() => {
    const lienzo = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = lienzo.getContext('2d');
    if (!ctx) throw new Error('El lienzo no tiene contexto 2D');
    const dpr = window.devicePixelRatio || 1;
    const rect = lienzo.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radio = Math.min(rect.width, rect.height) / 2 - 40; // el margen que usa la app
    const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
    let sumaX = 0;
    let sumaY = 0;
    let n = 0;
    for (let y = 0; y < lienzo.height; y++) {
      for (let x = 0; x < lienzo.width; x++) {
        const i = (y * lienzo.width + x) * 4;
        const azul =
          Math.abs(datos[i] - 46) < 12 && Math.abs(datos[i + 1] - 134) < 12 && Math.abs(datos[i + 2] - 171) < 12;
        if (!azul) continue;
        const X = x / dpr;
        const Y = y / dpr;
        if (Math.abs(Math.hypot(X - cx, Y - cy) - radio) < 7) {
          sumaX += X;
          sumaY += Y;
          n++;
        }
      }
    }
    return { x: n ? sumaX / n : NaN, y: n ? sumaY / n : NaN, n, cx, cy, radio };
  });
}

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 1 — NORMAL: los ángulos notables en los cuatro cuadrantes
// ═════════════════════════════════════════════════════════════════════════════════════════

test.describe('Caso 1 · ángulos notables en los cuatro cuadrantes', () => {
  /**
   * Los doce notables con su valor EXACTO a cuatro decimales. Nada de tolerancias: 1/2 es
   * 0,5000 y √3/2 es 0,8660 se mire como se mire.
   */
  const NOTABLES: Array<{
    grados: number;
    sen: string;
    cos: string;
    tan: string;
    cuadrante: string;
    radian: string;
    porque: string;
  }> = [
    // ── Cuadrante I: las tres razones positivas ────────────────────────────────────────
    { grados: 30, sen: '0,5000', cos: '0,8660', tan: '0,5774', cuadrante: 'I', radian: 'π/6', porque: '1/2 · √3/2 · √3/3' },
    { grados: 45, sen: '0,7071', cos: '0,7071', tan: '1,0000', cuadrante: 'I', radian: 'π/4', porque: '√2/2 · √2/2 · 1' },
    { grados: 60, sen: '0,8660', cos: '0,5000', tan: '1,7321', cuadrante: 'I', radian: 'π/3', porque: '√3/2 · 1/2 · √3' },
    // ── Cuadrante II: solo el seno positivo (cos y tan cambian de signo) ───────────────
    { grados: 120, sen: '0,8660', cos: '-0,5000', tan: '-1,7321', cuadrante: 'II', radian: '2π/3', porque: 'referencia 60°' },
    { grados: 135, sen: '0,7071', cos: '-0,7071', tan: '-1,0000', cuadrante: 'II', radian: '3π/4', porque: 'referencia 45°' },
    { grados: 150, sen: '0,5000', cos: '-0,8660', tan: '-0,5774', cuadrante: 'II', radian: '5π/6', porque: 'sen 150° = sen 30°, cos 150° = −cos 30°' },
    // ── Cuadrante III: sen y cos negativos, luego la TANGENTE vuelve a ser positiva ────
    { grados: 210, sen: '-0,5000', cos: '-0,8660', tan: '0,5774', cuadrante: 'III', radian: '7π/6', porque: 'referencia 30°, (−)/(−) = (+)' },
    { grados: 225, sen: '-0,7071', cos: '-0,7071', tan: '1,0000', cuadrante: 'III', radian: '5π/4', porque: 'referencia 45°' },
    { grados: 240, sen: '-0,8660', cos: '-0,5000', tan: '1,7321', cuadrante: 'III', radian: '4π/3', porque: 'referencia 60°' },
    // ── Cuadrante IV: solo el coseno positivo ─────────────────────────────────────────
    { grados: 300, sen: '-0,8660', cos: '0,5000', tan: '-1,7321', cuadrante: 'IV', radian: '5π/3', porque: 'referencia 60°' },
    { grados: 315, sen: '-0,7071', cos: '0,7071', tan: '-1,0000', cuadrante: 'IV', radian: '7π/4', porque: 'referencia 45°' },
    { grados: 330, sen: '-0,5000', cos: '0,8660', tan: '-0,5774', cuadrante: 'IV', radian: '11π/6', porque: 'referencia 30°' },
  ];

  test('las 36 razones de los doce notables salen exactas a cuatro decimales', async ({ page }) => {
    await page.goto(RUTA);
    for (const n of NOTABLES) {
      await ponerAngulo(page, n.grados);
      const r = await razones(page);
      expect(r, `${n.grados}° (${n.porque})`).toEqual({ sen: n.sen, cos: n.cos, tan: n.tan });
      await expect(valor(page, 'Cuadrante'), `cuadrante de ${n.grados}°`).toHaveText(n.cuadrante);
    }
  });

  test('el equivalente en radianes es la fracción de π que corresponde', async ({ page }) => {
    await page.goto(RUTA);
    for (const n of NOTABLES) {
      await ponerAngulo(page, n.grados);
      await expect(valor(page, 'θ (radianes)'), `${n.grados}° en radianes`).toHaveText(n.radian);
    }
    // Un ángulo NO notable cae al decimal: 1° · π/180 = 0,0174532… rad.
    await ponerAngulo(page, 1);
    await expect(valor(page, 'θ (radianes)')).toHaveText('0,0175 rad');
    // Y la equivalencia se sostiene: π/4 = 0,785398…, que es lo que vale 45°.
    await ponerAngulo(page, 45);
    await expect(valor(page, 'θ (radianes)')).toHaveText('π/4');
  });

  test('los signos por cuadrante siguen la regla ACTS', async ({ page }) => {
    await page.goto(RUTA);
    // El mismo ángulo de referencia (30°) reflejado en los cuatro cuadrantes: es el sitio
    // exacto donde un signo perdido se ve a simple vista.
    const ACTS = [
      { grados: 30, sen: '+ (positivo)', cos: '+ (positivo)' }, // I  · todas positivas
      { grados: 150, sen: '+ (positivo)', cos: '− (negativo)' }, // II · solo el seno
      { grados: 210, sen: '− (negativo)', cos: '− (negativo)' }, // III· solo la tangente
      { grados: 330, sen: '− (negativo)', cos: '+ (positivo)' }, // IV · solo el coseno
    ];
    for (const c of ACTS) {
      await ponerAngulo(page, c.grados);
      await expect(valor(page, 'sin'), `signo del seno en ${c.grados}°`).toHaveText(c.sen);
      await expect(valor(page, 'cos'), `signo del coseno en ${c.grados}°`).toHaveText(c.cos);
    }
  });

  test('el formato es español: coma decimal y nunca punto', async ({ page }) => {
    await page.goto(RUTA);
    await ponerAngulo(page, 60);
    const r = await razones(page);
    expect(r.sen).toBe('0,8660'); // √3/2, NUNCA «0.866»
    expect(r.cos).toBe('0,5000');
    expect(r.tan).toBe('1,7321'); // √3
    for (const v of Object.values(r)) expect(v).not.toContain('.');
  });

  test('el punto del lienzo gira ANTIHORARIO desde el semieje X positivo', async ({ page }) => {
    await page.goto(RUTA);
    // Un ángulo por cuadrante. Si el dibujo girase en sentido horario, o midiese desde el eje
    // Y, el punto caería en OTRO cuadrante y el error sería de cientos de píxeles.
    for (const grados of [30, 120, 210, 300]) {
      await ponerAngulo(page, grados);
      await page.waitForTimeout(120); // el lienzo se repinta en un effect
      const p = await puntoDelLienzo(page);
      expect(p.n, `no se localiza el punto en ${grados}°`).toBeGreaterThan(10);
      const rad = (grados * Math.PI) / 180;
      // Convención trigonométrica con la Y de pantalla invertida:
      const esperadoX = p.cx + p.radio * Math.cos(rad);
      const esperadoY = p.cy - p.radio * Math.sin(rad);
      expect(Math.hypot(p.x - esperadoX, p.y - esperadoY), `punto de ${grados}°`).toBeLessThan(6);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 2 — LÍMITE: 90° y 270°, donde la tangente NO EXISTE
// ═════════════════════════════════════════════════════════════════════════════════════════

test.describe('Caso 2 · los cinco ángulos de los ejes', () => {
  test('EL CASO DECISIVO: tan 90° y tan 270° se rotulan «∞», nunca un número', async ({ page }) => {
    await page.goto(RUTA);
    for (const grados of [90, 270]) {
      await ponerAngulo(page, grados);
      const t = await valor(page, 'tan(θ)').innerText();
      // cos 90° = 0 EXACTO, así que sen/cos es una división por cero: no hay número que dar.
      expect(t, `tan ${grados}°`).toBe('∞');
      // El fallo clásico: Math.tan(Math.PI/2) devuelve 16331239353195370 en coma flotante.
      expect(t).not.toMatch(/\d/);
      expect(t).not.toContain('16331239353195370');
    }
  });

  test('sen y cos de los ejes valen 0 y ±1', async ({ page }) => {
    await page.goto(RUTA);
    await ponerAngulo(page, 0);
    expect(await razones(page)).toEqual({ sen: '0,0000', cos: '1,0000', tan: '0,0000' });

    await ponerAngulo(page, 90); // el punto está en lo más alto del círculo: (0, 1)
    expect(await valor(page, 'sin(θ)').innerText()).toBe('1,0000');
    expect(await valor(page, 'cos(θ)').innerText()).toBe('0,0000');

    await ponerAngulo(page, 180); // media vuelta: el punto está en (−1, 0)
    expect(await valor(page, 'sin(θ)').innerText()).toBe('0,0000');
    expect(await valor(page, 'cos(θ)').innerText()).toBe('-1,0000');

    await ponerAngulo(page, 270); // tres cuartos: el punto está en (0, −1)
    expect(await valor(page, 'sin(θ)').innerText()).toBe('-1,0000');

    await ponerAngulo(page, 360); // vuelta completa: idéntico a 0°, el periodo es 360°
    expect(await valor(page, 'cos(θ)').innerText()).toBe('1,0000');
  });

  test('los cinco ángulos de los ejes no pertenecen a ningún cuadrante', async ({ page }) => {
    await page.goto(RUTA);
    for (const grados of [0, 90, 180, 270, 360]) {
      await ponerAngulo(page, grados);
      await expect(valor(page, 'Cuadrante'), `cuadrante de ${grados}°`).toHaveText('—');
    }
  });

  test('la identidad pitagórica se cumple en todo el giro', async ({ page }) => {
    await page.goto(RUTA);
    // sen²θ + cos²θ = 1 es el teorema de Pitágoras sobre un radio que mide 1: se cumple para
    // CUALQUIER ángulo, ejes incluidos. (Ojo: la app la escribe a mano, ver H6.)
    for (const grados of [0, 37, 90, 150, 233, 270, 360]) {
      await ponerAngulo(page, grados);
      await expect(valor(page, 'sin²+cos²'), `identidad en ${grados}°`).toHaveText('1,0000 ✓');
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// CASO 3 — RECHAZO: texto, campo vacío y valores absurdos
// ═════════════════════════════════════════════════════════════════════════════════════════

test.describe('Caso 3 · entradas inválidas', () => {
  test('el campo es numérico acotado a [−360, 720] y el navegador filtra las letras', async ({ page }) => {
    await page.goto(RUTA);
    const campo = campoAngulo(page);
    await expect(campo).toHaveAttribute('type', 'number');
    // El rango era [0, 360] y se amplió el 25/08/2026 a una vuelta hacia atrás y dos hacia
    // delante: el bloque educativo enseña ángulos negativos y mayores de 360°, y con el
    // control acotado a la vuelta esas lecciones no se podían comprobar (hallazgo 353).
    await expect(campo).toHaveAttribute('min', '-360');
    await expect(campo).toHaveAttribute('max', '720');
    // Un <input type="number"> no admite texto: lo que se teclee queda descartado por el
    // propio navegador antes de llegar al cálculo.
    await campo.fill('');
    await campo.pressSequentially('abc', { delay: 30 });
    expect(await campo.inputValue()).not.toContain('a');
  });

  test('ninguna entrada absurda produce NaN, Infinity ni «undefined» en el panel', async ({ page }) => {
    await page.goto(RUTA);
    const campo = campoAngulo(page);
    for (const basura of ['abc', '12abc', '1e3', '45,5', '999999', '-30', '450']) {
      await campo.fill('');
      await campo.pressSequentially(basura, { delay: 25 });
      await page.waitForTimeout(80);
      const panel = await page.locator('[role="status"]').innerText();
      expect(panel, `panel tras teclear ${JSON.stringify(basura)}`).not.toMatch(/NaN|Infinity|undefined/);
      // Y el ángulo resultante sigue dentro del rango del simulador. −30 y 450 ya NO son
      // basura: son ángulos legítimos desde que el rango se amplió, y el simulador tiene que
      // aceptarlos porque su propio bloque educativo los pone de ejemplo.
      const grados = Number((await valor(page, 'θ (grados)').innerText()).replace('°', '').replace(',', '.'));
      expect(grados, `θ tras teclear ${JSON.stringify(basura)}`).toBeGreaterThanOrEqual(-360);
      expect(grados).toBeLessThanOrEqual(720);
    }
  });

  test('el slider no deja salirse del rango del simulador', async ({ page }) => {
    await page.goto(RUTA);
    const slider = page.locator('#slider-angulo');
    await expect(slider).toHaveAttribute('min', '-360');
    await expect(slider).toHaveAttribute('max', '720');
    // Con TECLADO, que es como lo movería una persona: `Home` y `End` llevan un
    // `input[type=range]` a sus extremos con eventos nativos que React procesa siempre.
    // `locator.fill` no vale aquí — dentro de la suite el evento se perdía y el deslizador se
    // quedaba en 45° por más que se reintentara, mientras en solitario funcionaba: un test
    // que solo pasa cuando corre solo no informa de nada.
    await slider.focus();
    await page.keyboard.press('End');
    await expect(valor(page, 'θ (grados)')).toHaveText('720°');
    await page.keyboard.press('Home');
    await expect(valor(page, 'θ (grados)')).toHaveText('-360°');
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// HALLAZGOS del 25/08/2026 — REPARADOS ese mismo día. Tests de regresión.
// ═════════════════════════════════════════════════════════════════════════════════════════

test.describe('Regresión de los hallazgos (25/08/2026)', () => {
  test('350 · el cero de los ejes no lleva signo menos', async ({ page }) => {
    await page.goto(RUTA);
    // tan 180° = sen 180°/cos 180° = 0/(−1) = 0. La tabla del propio bloque educativo de la
    // app dice «180° · tan 0». El panel escribe «-0,0000» porque Math.tan(π) vale
    // −1,2246e−16 y toFixed(4) conserva el signo del residuo.
    await ponerAngulo(page, 180);
    expect(await valor(page, 'tan(θ)').innerText(), 'tan 180°').toBe('0,0000');

    // cos 270° = 0 exacto (el punto está en (0, −1)). La tabla de la app dice «270° · cos 0».
    await ponerAngulo(page, 270);
    expect(await valor(page, 'cos(θ)').innerText(), 'cos 270°').toBe('0,0000');

    // sen 360° = sen 0° = 0 exacto: es la misma posición del círculo tras una vuelta entera.
    await ponerAngulo(page, 360);
    expect(await valor(page, 'sin(θ)').innerText(), 'sen 360°').toBe('0,0000');
    expect(await valor(page, 'tan(θ)').innerText(), 'tan 360°').toBe('0,0000');
  });

  test('351 · el panel de signos no llama positivo ni negativo a un cero', async ({ page }) => {
    await page.goto(RUTA);
    // En 270° el coseno vale CERO, y cero no es negativo. La app lo rotulaba «− (negativo)».
    await ponerAngulo(page, 270);
    expect(await valor(page, 'cos').innerText(), 'signo de cos 270°').toBe('0 · sin signo');
    // En 360° el seno vale CERO, y la app lo rotulaba «− (negativo)» mientras 0° y 180°, con
    // el mismo seno nulo, lo rotulaban «+ (positivo)»: tres respuestas para el mismo 0.
    await ponerAngulo(page, 360);
    expect(await valor(page, 'sin').innerText(), 'signo de sen 360°').toBe('0 · sin signo');

    // Y los dos casos que ANTES decían «+ (positivo)» sobre un cero: mismo rasero.
    await ponerAngulo(page, 0);
    expect(await valor(page, 'sin').innerText(), 'signo de sen 0°').toBe('0 · sin signo');
    await ponerAngulo(page, 90);
    expect(await valor(page, 'cos').innerText(), 'signo de cos 90°').toBe('0 · sin signo');

    // Control: donde el valor NO es cero, el signo se sigue diciendo.
    await ponerAngulo(page, 30);
    expect(await valor(page, 'sin').innerText(), 'signo de sen 30°').toContain('positivo');
    await ponerAngulo(page, 210);
    expect(await valor(page, 'cos').innerText(), 'signo de cos 210°').toContain('negativo');
  });

  test('352 · una entrada fuera de rango se avisa, no se convierte en otro ángulo', async ({ page }) => {
    await page.goto(RUTA);
    const campo = campoAngulo(page);

    // Teclear 450 deja 45°: se descarta el tercer dígito y no se avisa de nada. 450° ≡ 90°
    // (450 − 360), cuyo seno es 1; lo que el usuario acaba viendo es sen 45° = 0,7071.
    await campo.fill('');
    await campo.pressSequentially('450', { delay: 40 });
    await page.waitForTimeout(100);
    expect(await valor(page, 'θ (grados)').innerText(), '450 tecleado').not.toBe('45°');

    // Teclear −30 deja 30°: se pierde el signo. El equivalente de −30° es 330°, cuyo seno es
    // −0,5000; la app muestra +0,5000, o sea el ángulo reflejado.
    await campo.fill('');
    await campo.pressSequentially('-30', { delay: 40 });
    await page.waitForTimeout(100);
    expect(await valor(page, 'sin(θ)').innerText(), '−30 tecleado').not.toBe('0,5000');

    // Vaciar el campo para reescribir salta a 0°, porque Number('') === 0 pasa el guardián.
    await ponerAngulo(page, 60);
    await campo.fill('');
    await page.waitForTimeout(100);
    expect(await valor(page, 'θ (grados)').innerText(), 'campo vaciado').not.toBe('0°');
  });

  test('353 · el rango que promete el bloque educativo se puede probar en el simulador', async ({ page }) => {
    await page.goto(RUTA);
    // El bloque educativo pone de ejemplo «sen 390° = sen 30°» y explica que un ángulo mayor
    // de 360° da vueltas completas. El control no admite 390, así que la lección no se puede
    // comprobar en la herramienta que la enseña. (El aserto del rango va PRIMERO para que el
    // fallo señale el hallazgo y no el despliegue del acordeón.)
    await campoAngulo(page).fill('390');
    await page.waitForTimeout(100);
    expect(await valor(page, 'sin(θ)').innerText(), '390° ≡ 30°').toBe('0,5000');

    // La promesa está en el bloque educativo, que se monta siempre pero se oculta por CSS.
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByText('sin(390°) = sin(30°)')).toBeVisible();
  });

  test('354 · el conmutador de radianes cambia la unidad de entrada, no solo la etiqueta', async ({ page }) => {
    await page.goto(RUTA);
    await page.getByRole('button', { name: 'Radianes (rad)' }).click();
    await expect(page.getByRole('button', { name: 'Radianes (rad)' })).toHaveAttribute('aria-pressed', 'true');
    // En modo radianes, teclear 1 debería dar 1 rad ≈ 57,2958°, cuyo seno es 0,8415.
    // Hoy da 1° (0,0175 rad): el campo sigue en grados y hasta conserva el sufijo «°».
    await campoAngulo(page).fill('1');
    await page.waitForTimeout(120);
    expect(await valor(page, 'sin(θ)').innerText(), 'sen(1 rad)').toBe('0,8415');
  });

  test('355 · la identidad pitagórica se CALCULA, no es una cadena fija', async ({ page }) => {
    await page.goto(RUTA);
    // La fila «sin²+cos²» era la cadena literal «1,0000 ✓» escrita a mano en el JSX: daba el
    // visto bueno pasara lo que pasara, y el paso 5 del propio bloque educativo enseña lo
    // contrario («si tu resultado no satisface esta identidad, hay un error»).
    //
    // Que ahora salga «1,0000 ✓» no demuestra por sí solo que se calcule — es el mismo texto
    // de antes. Lo que lo demuestra es que el número siga al seno y al coseno: se comprueba
    // que la fila coincide con sen² + cos² leídos del propio panel, en ángulos de los cuatro
    // cuadrantes y en los ejes.
    for (const ang of [0, 30, 45, 90, 150, 180, 233, 270, 315, 360]) {
      await ponerAngulo(page, ang);
      const sen = Number((await valor(page, 'sin(θ)').innerText()).replace(',', '.'));
      const cos = Number((await valor(page, 'cos(θ)').innerText()).replace(',', '.'));
      const fila = await valor(page, 'sin²+cos²').innerText();

      // Con tolerancia, porque el panel muestra el seno y el coseno ya redondeados a cuatro
      // decimales y sus cuadrados no suman 1 exacto: en 233° dan 0,9999. La app calcula con
      // los valores completos, así que da 1,0000 — y eso es lo correcto.
      const mostrado = Number(fila.replace('✓', '').replace('✗', '').trim().replace(',', '.'));
      expect(mostrado, `identidad en ${ang}°`).toBeCloseTo(sen * sen + cos * cos, 3);
      expect(mostrado, `la identidad vale 1 en ${ang}°`).toBeCloseTo(1, 4);
      expect(fila, `visto bueno en ${ang}°`).toContain('✓');
    }
  });

  test('356 · todos los botones llevan type="button"', async ({ page }) => {
    await page.goto(RUTA);
    const sinTipo = await page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter((b) => b.getAttribute('type') === null)
        .map((b) => b.textContent?.trim().slice(0, 20) ?? ''),
    );
    // CLAUDE.md global §5: todo <button> lleva type="button".
    expect(sinTipo, 'botones sin type').toEqual([]);
  });
});
