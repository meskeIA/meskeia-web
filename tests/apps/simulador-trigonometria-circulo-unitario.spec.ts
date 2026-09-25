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

// ═══════════════════════════════════════════════════════════════════════════════
// CASOS DE AULA · 21/09/2026
// ═══════════════════════════════════════════════════════════════════════════════

import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  toleranciaDe,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  gradosARadianes,
  radianesAGrados,
  redondear,
  signoDe,
  obtenerCuadrante,
  calcularTangente,
  anguloDeReferencia,
  anguloEquivalente,
  cuadranteNumerico,
  tangenteExiste,
} from '../../app/simulador-trigonometria-circulo-unitario/casos';

/**
 * Casos de aula — las siete invariantes de la sistemática `/casos-aula-meskeia`.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO DE ESTE BLOQUE
 * Todos calculados a mano desde la definición, NUNCA copiados de lo que devuelve la app:
 *
 *   · sen 30° = 1/2 = 0,5 exacto (el cateto opuesto al ángulo de 30° en un triángulo
 *     rectángulo es la mitad de la hipotenusa). Es el control de que nadie ha confundido
 *     grados con radianes: `Math.sin(30)` —radianes— daría −0,988.
 *   · cos 120° = −cos 60° = −0,5, porque 120° cae en el II cuadrante, donde el coseno es
 *     negativo, y su ángulo de referencia es 180° − 120° = 60°.
 *   · tan 45° = 1 (cateto opuesto = cateto contiguo).
 *   · 180° = π rad, de donde 225° = 225π/180 = 5π/4 = 3,9270 rad y 5π/6 rad = 150°.
 *   · Altura del edificio = 30 · tan 30° = 30/√3 = 17,3205 m.
 *   · Sombra del poste = 6 / tan 60° = 6/√3 = 3,4641 m.
 *   · Noria: 20 · sen 390° = 20 · sen 30° = 10 m (390° da una vuelta entera y sobran 30°).
 *   · Muelle: 8 · cos 240° = 8 · (−0,5) = −4 cm.
 *
 * El convenio que se blinda aquí salió de los hallazgos 350-352 del Inspector: el cero no
 * tiene signo, los ejes no pertenecen a ningún cuadrante, y la tangente donde no existe se
 * DICE, nunca se aproxima.
 */

/** Público mayoritariamente mexicano y colombiano: ningún caso se ancla a un país. */
const PAISES_Y_CIUDADES =
  /\b(España|Espa(ñ|n)ol|M(é|e)xico|Mexicano|Colombia|Argentina|Chile|Per(ú|u)|Venezuela|Uruguay|Ecuador|Bolivia|Paraguay|Guatemala|Cuba|Madrid|Barcelona|Sevilla|Bogot(á|a)|Buenos Aires|Santiago|Lima|Caracas|Montevideo|Quito|La Habana|Par(í|i)s|Londres|Nueva York|Estados Unidos|Francia|Italia|Roma|Alemania|Berl(í|i)n|Portugal|Lisboa)\b/i;

test.describe('Simulador del Círculo Trigonométrico · casos para clase', () => {
  test('1 · hay exactamente 12 casos, con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS).toHaveLength(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    const primera = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    const segunda = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    expect(segunda).toEqual(primera);
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', () => {
    for (const caso of CASOS) {
      const recalculada = resolverCaso(caso.datos);
      expect(recalculada.ok, `caso ${caso.id} no resuelve`).toBe(true);
      expect(recalculada.valor, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso trae enunciado, etiqueta, respuesta finita y desarrollo', () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.trim().length, `caso ${caso.id}`).toBeGreaterThan(20);
      expect(caso.etiquetaRespuesta.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.pista.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.respuestaTexto.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
    }
  });

  test('5 · ningún enunciado nombra un país ni una ciudad', () => {
    for (const caso of CASOS) {
      expect(PAISES_Y_CIUDADES.test(caso.titulo), `título del caso ${caso.id}`).toBe(false);
      expect(PAISES_Y_CIUDADES.test(caso.enunciado), `enunciado del caso ${caso.id}`).toBe(false);
      expect(PAISES_Y_CIUDADES.test(caso.pista), `pista del caso ${caso.id}`).toBe(false);
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', () => {
    // REPRODUCIBLE NO ES VARIADO: en simulador-genetica un xorshift32 sembrado con enteros
    // pequeños devolvía el MISMO ejercicio con todas las semillas y pasaba igualmente la
    // prueba de reproducibilidad. Por eso se piden varias semillas a la vez.
    for (const semilla of [1, 7, 42, 12345, 999999]) {
      const a = generarEjercicioAleatorio(semilla);
      const b = generarEjercicioAleatorio(semilla);
      expect(b.enunciado, `semilla ${semilla}`).toBe(a.enunciado);
      expect(b.respuesta, `semilla ${semilla}`).toBe(a.respuesta);
    }

    const respuestas = new Set<number>();
    const enunciados = new Set<string>();
    for (let semilla = 1; semilla <= 40; semilla++) {
      const ejercicio = generarEjercicioAleatorio(semilla);
      respuestas.add(ejercicio.respuesta);
      enunciados.add(ejercicio.enunciado);
      expect(resolverCaso(ejercicio.datos).valor, `semilla ${semilla}`).toBe(ejercicio.respuesta);
      expect(Number.isFinite(ejercicio.respuesta), `semilla ${semilla}`).toBe(true);
      // El simulador solo admite de −360° a 720°: un ejercicio fuera de rango no se podría
      // comprobar moviendo el círculo, que es justo lo que la app ofrece.
      expect(ejercicio.datos.angulo, `semilla ${semilla}`).toBeGreaterThanOrEqual(-360);
      expect(ejercicio.datos.angulo, `semilla ${semilla}`).toBeLessThanOrEqual(720);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(enunciados.size).toBeGreaterThanOrEqual(10);
  });

  test('7 · el convenio de la app queda fijado: grados, cero sin signo y tangente que no existe', () => {
    // ── Grados, no radianes ────────────────────────────────────────────────────────────
    // Un olvido aquí no revienta nada: devuelve números plausibles y equivocados.
    expect(resolverCaso({ angulo: 30, magnitud: 'seno' }).valor).toBe(0.5);
    expect(resolverCaso({ angulo: 60, magnitud: 'coseno' }).valor).toBe(0.5);
    expect(resolverCaso({ angulo: 45, magnitud: 'tangente' }).valor).toBe(1);
    expect(gradosARadianes(180)).toBeCloseTo(Math.PI, 12);
    expect(radianesAGrados(Math.PI)).toBeCloseTo(180, 12);

    // ── El cero no tiene signo ─────────────────────────────────────────────────────────
    // `Math.cos(270°)` da −1,84·10⁻¹⁶: cero a cuatro decimales, pero con el signo puesto.
    const cos270 = Math.cos(gradosARadianes(270));
    expect(cos270).toBeLessThan(0); // el residuo de coma flotante ES negativo
    expect(redondear(cos270)).toBe(0);
    expect(Object.is(redondear(cos270), -0)).toBe(false); // sumar 0 normaliza el −0
    expect(signoDe(cos270).clase).toBe('cero');
    expect(signoDe(Math.sin(gradosARadianes(360))).clase).toBe('cero');

    // ── Los ejes no pertenecen a ningún cuadrante ──────────────────────────────────────
    for (const eje of [0, 90, 180, 270, 360]) {
      expect(obtenerCuadrante(eje), `${eje}°`).toBe('—');
      expect(cuadranteNumerico(eje), `${eje}°`).toBe(0);
    }
    expect(obtenerCuadrante(45)).toBe('I');
    expect(obtenerCuadrante(120)).toBe('II');
    expect(obtenerCuadrante(200)).toBe('III');
    expect(obtenerCuadrante(300)).toBe('IV');
    expect(obtenerCuadrante(-90)).toBe('—'); // −90° equivale a 270°, que es un eje
    expect(obtenerCuadrante(-45)).toBe('IV'); // −45° equivale a 315°

    // ── La tangente que no existe se DICE, no se aproxima ──────────────────────────────
    // `Math.tan(π/2)` devuelve 1,6·10¹⁶: un número enorme pero FINITO, que `Number.isFinite`
    // dejaría pasar y se pintaría como un resultado válido.
    expect(Number.isFinite(Math.tan(Math.PI / 2))).toBe(true);
    expect(Math.abs(Math.tan(Math.PI / 2))).toBeGreaterThan(1e15);
    expect(calcularTangente(90)).toBe('∞');
    expect(calcularTangente(270)).toBe('∞');
    expect(tangenteExiste(90)).toBe(false);
    expect(tangenteExiste(45)).toBe(true);
    // Y ningún caso puede pedirla: el motor se niega en vez de devolver el número enorme.
    const imposible = resolverCaso({ angulo: 90, magnitud: 'tangente' });
    expect(imposible.ok).toBe(false);
    expect(imposible.error).toBeTruthy();
  });

  test('7.bis · ángulo de referencia y equivalente, que es de donde sale el signo', () => {
    expect(anguloEquivalente(390)).toBe(30); // una vuelta entera sobra
    expect(anguloEquivalente(-45)).toBe(315);
    expect(anguloEquivalente(720)).toBe(0);
    expect(anguloDeReferencia(210)).toBe(30); // 210 − 180
    expect(anguloDeReferencia(120)).toBe(60); // 180 − 120
    expect(anguloDeReferencia(300)).toBe(60); // 360 − 300
    expect(anguloDeReferencia(45)).toBe(45);

    // La identidad pitagórica se cumple en cualquier ángulo, que es lo que la hace útil.
    for (const angulo of [0, 17, 30, 45, 120, 210, 300, 359]) {
      const s = Math.sin(gradosARadianes(angulo));
      const c = Math.cos(gradosARadianes(angulo));
      expect(s * s + c * c, `${angulo}°`).toBeCloseTo(1, 12);
    }
  });

  test('los tres casos que piden redondeo enseñan el número que pidieron', () => {
    // Si el enunciado dice «redondea a 2 decimales» y la solución muestra 17,3205, la app
    // corrige con un formato distinto del que exigió.
    const conRedondeo = CASOS.filter((c) => c.requiereRedondeo);
    expect(conRedondeo.length).toBeGreaterThan(0);
    for (const caso of conRedondeo) {
      expect(caso.enunciado.toLowerCase(), `caso ${caso.id}`).toContain('decimales');
      // El texto empieza por el valor a 2 decimales; el exacto va detrás, entre paréntesis.
      const dosDecimales = redondear(caso.respuesta, 2).toFixed(2).replace('.', ',');
      expect(caso.respuestaTexto, `caso ${caso.id}`).toContain(dosDecimales);
    }
    // Y quien teclea el valor redondeado, como se le pidió, acierta.
    for (const caso of CASOS) {
      const tecleado = redondear(caso.respuesta, 2);
      expect(comprobarRespuesta(tecleado, caso.respuesta).correcto, `caso ${caso.id}`).toBe(true);
    }
  });

  test('la corrección tolera el redondeo y rechaza el error de signo', () => {
    // La tolerancia es el MAYOR entre 0,01 y el 1 % del valor.
    expect(toleranciaDe(100)).toBeCloseTo(1, 10);
    expect(toleranciaDe(0.5)).toBeCloseTo(0.01, 10);

    expect(comprobarRespuesta(0.5, 0.5).correcto).toBe(true);
    // Olvidar el signo en un cuadrante donde la razón es negativa es EL error del tema:
    // 0,5 en lugar de −0,5 tiene que suspender.
    expect(comprobarRespuesta(0.5, -0.5).correcto).toBe(false);
    expect(comprobarRespuesta(Number.NaN, 0.5).correcto).toBe(false);
    expect(comprobarRespuesta(Number.NaN, 0.5).motivo).toBe('no-numerico');
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 25/09/2026 · 586 usos · riesgo 3
// ═════════════════════════════════════════════════════════════════════════════════════════

import { esperarHidratacion, esperarPaginaAsentada, sembrarValor } from './_hidratacion';
import { parseSpanishNumber } from '../../lib/formatters';

/**
 * QUÉ SE HA MIRADO EN ESTA RE-INSPECCIÓN
 *
 *   1. La SOSPECHA del digest del 25/09/2026: 3 caídas a «Algo salió mal» el 24/09 con
 *      «IndexSizeError: Failed to execute 'arc' … The radius provided (-40) is negative», desde
 *      un móvil 412×915 de Perú (Chrome y navegador de Instagram). −40 es exactamente
 *      `Math.min(W, H) / 2 − 40` con el lienzo midiendo 0: `dibujar` lee el tamaño con
 *      getBoundingClientRect, y `arc()` LANZA con un radio negativo. Como `dibujar` corre dentro
 *      de un useEffect, la excepción la recoge la frontera de error y la página ENTERA se cambia
 *      por la pantalla de error.
 *      Reproducido (ver los tests H1 de abajo) con tres condiciones de carga, todas con el
 *      mensaje idéntico al de producción:
 *        · el lienzo en display:none al hidratar (CSS inyectado con addInitScript) → −40;
 *        · la vista sin tamaño al montar (viewport 1×1, luego 412×915: un WebView que monta la
 *          página antes de tener su tamaño) → −40, y la página NO se recupera al crecer;
 *        · una vista de ≤ 140 px de ancho → radio −3 (a 100 px, −23). A 160 px ya no cae.
 *      NO cae con una carga normal a 412×915 con UA de Chrome, de WebView ni de Instagram: el
 *      navegador no es la condición, lo es el TAMAÑO del lienzo en el instante del montaje. Por
 *      eso no lo ve la Ronda nocturna, que carga con viewport de escritorio.
 *
 *   2. Un mecanismo que agrava lo anterior EN MÓVIL: con ≤ 768 px, `.mainLayout` pasa a
 *      `flex-direction: column` con `align-items: flex-start`, así que el ancho de
 *      `.canvasWrapper` es el ancho INTRÍNSECO del lienzo, que es su atributo `width`… que
 *      escribe `dibujar` (`canvas.width = rect.width * dpr`). Medido: con el atributo a 0 el
 *      lienzo mide 0 px de ancho; a 100, 100 px; restaurado, 346 px. Consecuencias:
 *        · un solo dibujo con el lienzo a 0 (resize transitorio) lo deja a 0 PARA SIEMPRE,
 *          aunque la ventana vuelva a 412×915, y el siguiente cambio de ángulo tira la página;
 *        · el primer dibujo se hace para el ancho por defecto del lienzo (300 px, búfer
 *          300 × 1,75 = 525) y se estira a 346 px: búfer 525×525 donde tocaba 605×605.
 *      En escritorio el lienzo se recupera solo (826×826 tras volver del 1×1).
 *
 *   ⚠️ LO QUE ESTO DICE DE LA REPARACIÓN (la sospecha ya lo apuntaba): NO basta un
 *   `if (radio <= 0) return` a secas. Hay que (a) saltar el dibujo ANTES de escribir
 *   `canvas.width`/`canvas.height` (líneas 141-142) mientras min(W, H) ≤ 2 × margen — si se
 *   escribe el 0 primero, en móvil el lienzo ya no vuelve a crecer y ningún observador se
 *   entera—, y (b) redibujar con un ResizeObserver sobre el lienzo, que además arregla el
 *   primer dibujo a 300 px. La guarda tiene que cubrir radio ≤ 0, no solo tamaño 0: a 140 px
 *   de ancho el lienzo mide 74 px y el radio sale −3.
 *
 *   3. Los 12 casos de aula (entraron el 21-22/09 y nunca se habían inspeccionado), resueltos a
 *      mano ANTES de abrir el navegador. Los 12 aceptan la respuesta correcta y rechazan el
 *      error típico, en escritorio y en móvil. Ninguno cae en un eje (90°/180°/270°): el
 *      convenio de `casos.ts` los excluye a propósito (tangente inexistente, cuadrante
 *      inexistente), así que los ejes se comprueban contra el motor.
 *
 *   4. Dos defectos de presentación del ángulo, fuera de los casos:
 *        · H3 · la fracción de π se decide con Math.round(ángulo): cualquier ángulo a menos de
 *          medio grado de un notable se rotula con la fracción EXACTA. En radianes, 1,5708 rad
 *          sale «θ = π/2» con tan = −272241,8084 y cuadrante II; 1,565 rad sale «π/2» con
 *          tan 172,5211; 29,6° sale «π/6». Y el deslizador de radianes NUNCA cae en un notable
 *          (su rejilla arranca en −2π con paso 0,01), así que cerca de cada uno enseña una
 *          fracción falsa.
 *        · H4 · el ángulo en grados se imprime en crudo, con PUNTO decimal y hasta 14 cifras:
 *          «36.8699°» tras «Ver 36,87° en el círculo» del caso 8, «57.29577951308232°» con
 *          1 rad, «36.3°» durante la animación. Y el veredicto escribe «30 °» con espacio,
 *          cuando la propia app escribe «30°» en todo lo demás (y la RAE pega el símbolo de
 *          grado a la cifra cuando es un ángulo).
 */

/** Móvil de la sospecha: Galaxy A06 (720×1600 px físicos → 412×915 CSS a 1,75). */
const MOVIL_A06 = {
  viewport: { width: 412, height: 915 },
  userAgent:
    'Mozilla/5.0 (Linux; Android 14; SM-A065M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  deviceScaleFactor: 1.75,
  isMobile: true,
  hasTouch: true,
};

/** Recoge los IndexSizeError de arc(), lleguen por la consola (frontera de error) o sin capturar. */
function vigilarArc(page: Page): string[] {
  const errores: string[] = [];
  page.on('pageerror', (e) => {
    if (/arc|radius/i.test(e.message)) errores.push(e.message);
  });
  page.on('console', (m) => {
    if (m.type() === 'error' && /arc|radius/i.test(m.text())) errores.push(m.text());
  });
  return errores;
}

/** La app se ve (no la pantalla de error) — con timeout corto: el fallo de hoy tiene que salir rápido. */
async function laAppSeVe(page: Page, motivo: string): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Algo salió mal' }), motivo).toHaveCount(0, { timeout: 1500 });
  await expect(page.getByRole('heading', { level: 1 }), motivo).toContainText(
    'Simulador del Círculo Trigonométrico',
    { timeout: 1500 },
  );
}

/** Tamaño CSS del lienzo, su búfer y si tiene algo pintado en el centro. */
async function estadoLienzo(page: Page) {
  return page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return { existe: false, ancho: 0, alto: 0, bufer: 0, dpr: 1, pintado: false };
    const r = c.getBoundingClientRect();
    let pintado = false;
    if (c.width > 0 && c.height > 0) {
      const px = c.getContext('2d')?.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data;
      pintado = Boolean(px && px[3] > 0);
    }
    return { existe: true, ancho: r.width, alto: r.height, bufer: c.width, dpr: window.devicePixelRatio, pintado };
  });
}

/** Inyecta CSS antes de que corra ningún script de la página (y antes de hidratar). */
async function cssAntesDeHidratar(page: Page, css: string): Promise<void> {
  await page.addInitScript((regla: string) => {
    const estilo = document.createElement('style');
    estilo.id = 'css-prueba-inspector';
    estilo.textContent = regla;
    const poner = (): void => {
      if (!estilo.isConnected) (document.head ?? document.documentElement)?.appendChild(estilo);
    };
    poner();
    new MutationObserver(poner).observe(document, { childList: true, subtree: true });
  }, css);
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// Casos de aula: cada respuesta correcta aceptada y el error típico rechazado
// ─────────────────────────────────────────────────────────────────────────────────────────

/**
 * Resueltos a mano, sin mirar la app:
 *   1  sen 30° = 1/2 = 0,5                         · error: 0,866 (cos 30°, seno por coseno)
 *   2  cos 120° = −cos 60° = −0,5 (cuadrante II)   · error: 0,5 (sin el signo del cuadrante)
 *   3  tan(−45°) = (−√2/2)/(√2/2) = −1             · error: 1 (girar en sentido antihorario)
 *   4  200° está entre 180° y 270° → cuadrante 3    · error: 2
 *   5  ref(210°) = 210 − 180 = 30°                  · error: 60 (270 − 210, contra el eje vertical)
 *   6  225 · π/180 = 5π/4 = 3,92699… → 3,93 rad     · error: 12891,55 (225 · 180/π, factor al revés)
 *   7  5π/6 rad = 5 · 180°/6 = 150°                 · error: 2,62 (dejarlo en radianes)
 *   8  cos θ = +√(1 − 0,6²) = √0,64 = 0,8           · error: 0,4 (1 − 0,6 sin elevar al cuadrado)
 *   9  30 · tan 30° = 30/√3 = 10√3 = 17,3205… → 17,32 m · error: 15 (30 · sen 30°)
 *  10  6 / tan 60° = 6/√3 = 2√3 = 3,4641… → 3,46 m   · error: 10,39 (6 · tan 60°, multiplicar)
 *  11  20 · sen 390° = 20 · sen 30° = 10 m          · error: 17,32 (20 · cos 30°)
 *  12  8 · cos 240° = 8 · (−1/2) = −4 cm            · error: 4 (sin el signo)
 */
const AULA_A_MANO: ReadonlyArray<{ id: number; bien: string; mal: string; muestra: string }> = [
  { id: 1, bien: '0,5', mal: '0,866', muestra: 'Correcto: 0,5' },
  { id: 2, bien: '-0,5', mal: '0,5', muestra: 'Correcto: -0,5' },
  { id: 3, bien: '-1', mal: '1', muestra: 'Correcto: -1' },
  { id: 4, bien: '3', mal: '2', muestra: 'cuadrante 3' },
  { id: 5, bien: '30', mal: '60', muestra: 'Correcto: 30' },
  { id: 6, bien: '3,93', mal: '12891,55', muestra: '3,93' },
  { id: 7, bien: '150', mal: '2,62', muestra: 'Correcto: 150' },
  { id: 8, bien: '0,8', mal: '0,4', muestra: 'Correcto: 0,8' },
  { id: 9, bien: '17,32', mal: '15', muestra: '17,32' },
  { id: 10, bien: '3,46', mal: '10,39', muestra: '3,46' },
  { id: 11, bien: '10', mal: '17,32', muestra: '10 m' },
  { id: 12, bien: '-4', mal: '4', muestra: '-4 cm' },
];

async function recorrerCasosDeAula(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#respuesta-caso-1']);
  const panel = page.locator('#panel-casos');
  const veredicto = panel.locator('article p[role="alert"]');
  const comprobar = panel.getByRole('button', { name: 'Comprobar', exact: true });

  for (const c of AULA_A_MANO) {
    await panel.getByRole('button', { name: new RegExp(`^Caso ${c.id}:`) }).click();
    const campo = `#respuesta-caso-${c.id}`;

    await sembrarValor(page, campo, c.mal);
    await comprobar.click();
    await expect(veredicto, `caso ${c.id}: «${c.mal}» tiene que suspender`).toContainText('Todavía no');

    await sembrarValor(page, campo, c.bien);
    await comprobar.click();
    await expect(veredicto, `caso ${c.id}: «${c.bien}» tiene que aprobar`).toContainText('Correcto');
    await expect(veredicto, `caso ${c.id}: muestra la respuesta`).toContainText(c.muestra);
  }
  await expect(panel.getByText(/Has acertado/)).toContainText('Has acertado 12 de 12');
}

test.describe('Re-inspección 25/09/2026 · casos de aula en la interfaz', () => {
  test('escritorio · los 12 aprueban la respuesta correcta y suspenden el error típico', async ({ page }) => {
    await recorrerCasosDeAula(page);
  });

  test('«Ver en el círculo» lleva el caso 3 a −45° con sus razones', async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#respuesta-caso-1', '#slider-angulo']);
    await page.getByRole('button', { name: /^Caso 3:/ }).click();
    await page.getByRole('button', { name: 'Ver -45° en el círculo' }).click();
    // −45° ≡ 315°: cuadrante IV, sen −√2/2, cos +√2/2, tan −1.
    await expect(valor(page, 'θ (grados)')).toHaveText('-45°');
    expect(await razones(page)).toEqual({ sen: '-0,7071', cos: '0,7071', tan: '-1,0000' });
    await expect(valor(page, 'Cuadrante')).toHaveText('IV');
  });
});

test.describe('Re-inspección 25/09/2026 · los ejes y los radianes contra el motor', () => {
  test('en los ejes el motor da 0 sin signo y ±1, y se niega donde no hay respuesta', () => {
    // sen/cos de los ejes, de memoria: (cos, sen) = (0, 1) en 90°, (−1, 0) en 180°, (0, −1) en 270°.
    expect(resolverCaso({ angulo: 90, magnitud: 'seno' }).valor).toBe(1);
    expect(Object.is(resolverCaso({ angulo: 90, magnitud: 'coseno' }).valor, 0)).toBe(true);
    expect(resolverCaso({ angulo: 180, magnitud: 'coseno' }).valor).toBe(-1);
    expect(Object.is(resolverCaso({ angulo: 180, magnitud: 'seno' }).valor, 0)).toBe(true);
    expect(resolverCaso({ angulo: 270, magnitud: 'seno' }).valor).toBe(-1);
    // cos 270° es −1,84·10⁻¹⁶ en coma flotante: tiene que salir +0, no −0.
    expect(Object.is(resolverCaso({ angulo: 270, magnitud: 'coseno' }).valor, 0)).toBe(true);
    // tan 180° = 0/(−1) = 0.
    expect(Object.is(resolverCaso({ angulo: 180, magnitud: 'tangente' }).valor, 0)).toBe(true);
    // Donde no hay respuesta, no la hay: tangente de 90°/270° y cuadrante de un eje.
    for (const eje of [90, 270]) expect(resolverCaso({ angulo: eje, magnitud: 'tangente' }).ok).toBe(false);
    for (const eje of [0, 90, 180, 270]) expect(resolverCaso({ angulo: eje, magnitud: 'cuadrante' }).ok).toBe(false);
    // Ángulo de referencia sobre un eje: 90° → 90°, 180° → 0°, 270° → 90°.
    expect(resolverCaso({ angulo: 90, magnitud: 'angulo-referencia' }).valor).toBe(90);
    expect(resolverCaso({ angulo: 180, magnitud: 'angulo-referencia' }).valor).toBe(0);
    expect(resolverCaso({ angulo: 270, magnitud: 'angulo-referencia' }).valor).toBe(90);

    // Corrección con lo que teclearía un alumno: «0» y «-0» aprueban cos 90°; «1» suspende.
    const cos90 = resolverCaso({ angulo: 90, magnitud: 'coseno' }).valor;
    expect(comprobarRespuesta(parseSpanishNumber('0'), cos90).correcto).toBe(true);
    expect(comprobarRespuesta(parseSpanishNumber('-0'), cos90).correcto).toBe(true);
    expect(comprobarRespuesta(parseSpanishNumber('1'), cos90).correcto).toBe(false);
  });

  test('los ejes en radianes: π/2 = 1,5708 · π = 3,1416 · 3π/2 = 4,7124', () => {
    // 90 · π/180 = π/2 = 1,570796…; 180 → π = 3,141593…; 270 → 3π/2 = 4,712389…
    expect(resolverCaso({ angulo: 90, magnitud: 'radianes' }).valor).toBe(1.5708);
    expect(resolverCaso({ angulo: 180, magnitud: 'radianes' }).valor).toBe(3.1416);
    expect(resolverCaso({ angulo: 270, magnitud: 'radianes' }).valor).toBe(4.7124);
    // Casos 6 y 7, los dos de radianes: 5π/4 = 3,92699… → 3,927 · 5π/6 → 150°.
    expect(CASOS[5].respuesta).toBe(3.927);
    expect(CASOS[6].respuesta).toBe(150);

    const pi2 = resolverCaso({ angulo: 90, magnitud: 'radianes' }).valor;
    expect(comprobarRespuesta(parseSpanishNumber('1,57'), pi2).correcto, '1,57 redondeado').toBe(true);
    expect(comprobarRespuesta(parseSpanishNumber('90'), pi2).correcto, 'dejarlo en grados').toBe(false);
    expect(comprobarRespuesta(parseSpanishNumber('3,14'), pi2).correcto, 'π en vez de π/2').toBe(false);
    const tres2 = resolverCaso({ angulo: 270, magnitud: 'radianes' }).valor;
    expect(comprobarRespuesta(parseSpanishNumber('4,71'), tres2).correcto).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGO H1 (operativa, alto) — ABIERTO · la página entera cae si el lienzo mide < 80 px
// ─────────────────────────────────────────────────────────────────────────────────────────

test.describe('Re-inspección 25/09/2026 · H1 · el lienzo sin tamaño al montar tira la página', () => {
  test.fail(
    'H1 · con el lienzo en display:none al hidratar, la app se ve y lo dibuja al aparecer',
    async ({ page }) => {
      // DEBERÍA: saltarse el dibujo mientras el lienzo mida 0 y dibujarlo en cuanto tenga tamaño
      // (ResizeObserver). HOY: arc() recibe radio −40 dentro del useEffect y la frontera de error
      // sustituye la página ENTERA por «Algo salió mal», con el mismo mensaje que en producción.
      const errores = vigilarArc(page);
      await cssAntesDeHidratar(page, 'canvas { display: none !important; }');
      await page.goto(RUTA);
      await esperarPaginaAsentada(page);
      await laAppSeVe(page, 'con el lienzo oculto al hidratar');
      expect(errores, 'IndexSizeError de arc()').toEqual([]);

      await page.evaluate(() => document.getElementById('css-prueba-inspector')?.remove());
      await expect
        .poll(async () => (await estadoLienzo(page)).pintado, { timeout: 2000, message: 'el lienzo se dibuja al aparecer' })
        .toBe(true);
    },
  );

  test.describe('móvil 412×915 (Galaxy A06)', () => {
    test.use(MOVIL_A06);

    test.fail('H1 · una vista que monta sin tamaño (1×1) y luego crece a 412×915 no cae', async ({ page }) => {
      // Es lo que hace un WebView (navegador de Instagram, pestaña que se carga oculta) que
      // monta la página antes de tener su tamaño. HOY: «Algo salió mal» con radio −40, y la
      // página NO se recupera al crecer la vista.
      const errores = vigilarArc(page);
      await page.setViewportSize({ width: 1, height: 1 });
      await page.goto(RUTA);
      await esperarPaginaAsentada(page);
      await page.setViewportSize({ width: 412, height: 915 });
      await laAppSeVe(page, 'montada a 1×1 y crecida a 412×915');
      expect(errores, 'IndexSizeError de arc()').toEqual([]);
      // 412 − 2 × 16 (contenedor) − 2 × 17 (relleno del marco) ≈ 346 px de lienzo.
      await expect
        .poll(async () => (await estadoLienzo(page)).ancho, { timeout: 2000, message: 'el lienzo recupera su ancho' })
        .toBeGreaterThan(300);
    });

    test.fail('H1 · a 140 px de ancho (lienzo de 74 px, radio −3) la app no cae', async ({ page }) => {
      // La guarda tiene que cubrir radio ≤ 0, no solo tamaño 0: min(W, H) / 2 − 40 es negativo
      // con cualquier lienzo de menos de 80 px. A 160 px de ancho ya no cae.
      await page.setViewportSize({ width: 140, height: 915 });
      await page.goto(RUTA);
      await esperarPaginaAsentada(page);
      await laAppSeVe(page, 'vista de 140 px');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGO H2 (operativa, medio) — ABIERTO · en móvil el lienzo depende de su propio atributo
// ─────────────────────────────────────────────────────────────────────────────────────────

test.describe('Re-inspección 25/09/2026 · H2 · en móvil el lienzo no se recupera de un 0', () => {
  test.use(MOVIL_A06);

  test('control: una carga normal a 412×915 con UA de móvil NO cae', async ({ page }) => {
    const errores = vigilarArc(page);
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await laAppSeVe(page, 'carga normal en móvil');
    expect(errores).toEqual([]);
    const l = await estadoLienzo(page);
    // ~346 px (412 menos contenedor y marco); el defecto que vigila es un lienzo a 0.
    expect(l.ancho).toBeGreaterThan(300);
    expect(l.pintado).toBe(true);
  });

  test('escritorio se recupera solo tras un resize a 1×1 (control del mecanismo)', async ({ browser }) => {
    const contexto = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
    const page = await contexto.newPage();
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await page.setViewportSize({ width: 1, height: 1 });
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 1400, height: 1000 });
    await expect.poll(async () => (await estadoLienzo(page)).ancho, { timeout: 2000 }).toBeGreaterThan(700);
    await contexto.close();
  });

  test.fail('H2 · tras un resize transitorio a 1×1, el lienzo vuelve y un cambio de ángulo no tira la página', async ({ page }) => {
    // DEBERÍA: al volver a 412×915, el lienzo recupera sus ~346 px y sigue funcionando.
    // HOY: el resize a 1×1 dibuja con el lienzo a 0 y deja su atributo width = 0; como en móvil
    // el ancho del marco es el ancho intrínseco del lienzo, se queda a 0×0 aunque la ventana
    // vuelva a crecer, y el siguiente cambio de ángulo cae a «Algo salió mal» (radio −40).
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    await page.setViewportSize({ width: 1, height: 1 });
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: 412, height: 915 });
    await expect
      .poll(async () => (await estadoLienzo(page)).ancho, { timeout: 2000, message: 'el lienzo recupera su ancho' })
      .toBeGreaterThan(300);
    await page.getByRole('button', { name: 'Ir a 90°' }).click();
    await laAppSeVe(page, 'cambio de ángulo tras el resize');
  });

  test.fail('H2 · el primer dibujo en móvil tiene la resolución del lienzo que se ve', async ({ page }) => {
    // DEBERÍA: búfer = ancho CSS × dpr = 346 × 1,75 = 605 px. HOY: 525 = 300 × 1,75, porque
    // `dibujar` mide el lienzo con su ancho por defecto (300 px) antes de que el marco crezca
    // a 346, y nada lo vuelve a dibujar: el círculo sale estirado un 15 % hasta el primer resize.
    // Tolerancia de 2 px (truncado de 605,5) frente a un defecto de 80.
    await page.goto(RUTA);
    await esperarPaginaAsentada(page);
    const l = await estadoLienzo(page);
    expect(Math.abs(l.bufer - l.ancho * l.dpr), `búfer ${l.bufer} para ${l.ancho} px × ${l.dpr}`).toBeLessThanOrEqual(2);
  });

  test('móvil · los 12 casos de aula aprueban la correcta y suspenden el error típico', async ({ page }) => {
    await recorrerCasosDeAula(page);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGO H3 (cálculo, medio) — ABIERTO · fracción de π exacta para un ángulo que no lo es
// ─────────────────────────────────────────────────────────────────────────────────────────

test.describe('Re-inspección 25/09/2026 · H3 · la fracción de π sale de redondear el ángulo', () => {
  test.fail('H3 · 1,565 rad y 29,6° no se rotulan π/2 ni π/6', async ({ page }) => {
    // π/2 = 1,5708 rad, π/6 = 0,5236 rad. DEBERÍA: rotular la fracción solo cuando el ángulo ES
    // el notable. HOY: `fracciones[Math.round(angulo)]` pone la fracción exacta a todo lo que
    // esté a menos de medio grado: 1,565 rad (89,67°) sale «θ = π/2» con tan = 172,5211, y
    // 1,5708 rad sale «π/2» con tan = −272241,8084 — la tangente que la propia app enseña que
    // no existe en π/2.
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#slider-angulo']);
    await page.getByRole('button', { name: 'Radianes (rad)' }).click();
    await campoAngulo(page).fill('1.565');
    await expect(valor(page, 'tan(θ)')).toHaveText('172,5211'); // tan(1,565 rad), el valor es correcto
    await expect(valor(page, 'θ (radianes)'), '1,565 rad ≠ π/2').not.toHaveText('π/2', { timeout: 1500 });
    await expect(valor(page, 'θ (radianes)')).toContainText('1,565');

    // Y en grados: 29,6 · π/180 = 0,516617… rad, no π/6 = 0,523599….
    await page.getByRole('button', { name: 'Grados (°)' }).click();
    await campoAngulo(page).fill('29.6');
    await expect(valor(page, 'θ (radianes)'), '29,6° ≠ π/6').toHaveText('0,5166 rad', { timeout: 1500 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────
// HALLAZGO H4 (contenido, bajo) — ABIERTO · el ángulo en grados sale en formato de EE. UU.
// ─────────────────────────────────────────────────────────────────────────────────────────

test.describe('Re-inspección 25/09/2026 · H4 · formato del ángulo', () => {
  test.fail('H4 · «Ver 36,87° en el círculo» del caso 8 no escribe «36.8699°»', async ({ page }) => {
    // El ángulo del caso 8 es arcsen 0,6 = 36,8699°. DEBERÍA salir con coma y como mucho 4
    // decimales, igual que el resto del panel. HOY: «θ (grados) 36.8699°» y «θ = 36.8699°», con
    // punto; con 1 rad en modo radianes, «57.29577951308232°».
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#respuesta-caso-1', '#slider-angulo']);
    await page.getByRole('button', { name: /^Caso 8:/ }).click();
    await page.getByRole('button', { name: 'Ver 36,87° en el círculo' }).click();
    await expect(valor(page, 'sin(θ)')).toHaveText('0,6000'); // el círculo sí llegó al ángulo
    await expect(valor(page, 'θ (grados)')).toHaveText(/^36,\d{1,4}°$/, { timeout: 1500 });

    await page.getByRole('button', { name: 'Radianes (rad)' }).click();
    await campoAngulo(page).fill('1');
    await expect(valor(page, 'sin(θ)')).toHaveText('0,8415');
    await expect(valor(page, 'θ (grados)')).toHaveText(/^57,\d{1,4}°$/, { timeout: 1500 });
  });

  test.fail('H4 · el veredicto pega el símbolo de grado a la cifra, como el resto de la app', async ({ page }) => {
    // Caso 5: ángulo de referencia de 210° = 30°. DEBERÍA: «Correcto: 30°.» como escribe la app
    // en sus enunciados y botones («sen 30°», «Ver 30° en el círculo»). HOY: «Correcto: 30 °.»
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#respuesta-caso-1']);
    const panel = page.locator('#panel-casos');
    await panel.getByRole('button', { name: /^Caso 5:/ }).click();
    await sembrarValor(page, '#respuesta-caso-5', '30');
    await panel.getByRole('button', { name: 'Comprobar', exact: true }).click();
    const veredicto = panel.locator('article p[role="alert"]');
    await expect(veredicto).toContainText('Correcto');
    await expect(veredicto).toContainText('Correcto: 30°.', { timeout: 1500 });
  });
});
