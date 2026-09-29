import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  cdf,
  comprobarRespuesta,
  cuantilNormal,
  generarEjercicioAleatorio,
  probabilidadNormal,
  resolverCaso,
  toleranciaDe,
} from '../../app/simulador-distribucion-normal/casos';

/**
 * Inspector — simulador-distribucion-normal (segmento cálculo, riesgo 3)
 *
 * Primera inspección: 31/08/2026.
 *
 * QUÉ PROMETE
 *   <h1>: «📊 Simulador de Distribución Normal»
 *   subtítulo: «Mueve la media (μ) y la desviación típica (σ) para ver la curva de Gauss en
 *     tiempo real. Calcula probabilidades, puntuaciones Z y la regla 68-95-99.7.»
 *   bloque educativo: fórmula f(x) = (1/σ√(2π))·e^(−½((x−μ)/σ)²), tipificación Z = (X−μ)/σ,
 *     regla 68-95-99,7 y cinco errores conceptuales frecuentes.
 *
 * DÓNDE VIVE EL CÁLCULO — todo inline en app/simulador-distribucion-normal/page.tsx (no hay
 * módulo de motor aparte, todo son funciones puras en el mismo fichero):
 *   · pdf(x, mu, sigma) — densidad N(μ,σ)
 *   · erf(x) — aproximación de Abramowitz & Stegun 7.1.26 (precisión declarada 1,5·10⁻⁷)
 *   · cdf(x, mu, sigma) = 0,5·(1 + erf((x−μ)/(σ√2))) — función de distribución acumulada
 *   · probabilidad (useMemo): menor → cdf(a) · mayor → 1−cdf(a) · entre → cdf(hi)−cdf(lo)
 *   · zA = (a−mu)/sigma, zB = (b−mu)/sigma
 *   · σ nunca debería poder ser ≤ 0 (la normal no tiene densidad definida ahí): el slider
 *     declara min="0.1" (o problema.sigma·0,2 en modo Problemas tipo).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — estado por defecto al cargar: N(0,1), P(−1 < X < 1)
 *     Φ(1) = 0,8413 (valor tabulado) → P(−1<X<1) = 2·Φ(1)−1 = 2·0,8413−1 = 0,6826 ≈ 68,27 %
 *     z(a) = (−1−0)/1 = −1,000 · z(b) = (1−0)/1 = 1,000
 *
 *   CASO 2 (límite — σ muy pequeña tras haber fijado a/b para una σ mayor) — se reduce σ de 1
 *     a su mínimo (0,1) SIN tocar a/b (que quedan en −1 y 1, es decir ±10σ de la nueva σ).
 *     El rango de los sliders a/b se recalcula a [−0,45, 0,45] (σ·4,5). Tras la reparación del
 *     hallazgo 574 (02/09/2026), un `useEffect` reclampa a/b al nuevo rango en cuanto cambia,
 *     así que a y b pasan de −1/1 a −0,45/0,45 — YA NO se quedan ancladas fuera del recorrido.
 *       z(a) = (−0,45−0)/0,1 = −4,500 · z(b) = (0,45−0)/0,1 = 4,500
 *       P(−4,5<Z<4,5) = 0,999993… → redondea a 100,00 % / decimal 1,0000 (para z≥4, Φ(z) ya
 *       está a varios nueves de 1, así que el redondeo a 2/4 decimales no distingue este caso
 *       del ±10σ que daba la versión rota).
 *     Consecuencia observable: la etiqueta de "a" y el valor DOM del slider ya coinciden
 *     (−0,45 los dos), así que una flecha de teclado avanza un solo paso —(0,45−(−0,45))/200 =
 *     0,0045— en vez de saltar más de 5σ de golpe.
 *
 *   CASO 3 (rechazo) — intentar fijar σ = 0 o σ negativa
 *     La normal exige σ > 0. El slider declara min="0.1": escribir "0" o "-5" directamente en
 *     el <input type="range"> debe clampar al mínimo (0,1), nunca aceptar el valor inválido.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * ── Reparado 02/09/2026 (hallazgo 574) ───────────────────────────────────────────────────
 *   Antes: al reducir σ después de haber fijado a/b para una σ mayor, el slider de "a" (o "b")
 *   se desincronizaba — el navegador clampaba su valor DOM al nuevo extremo del recorrido
 *   mientras React seguía mostrando el valor anterior, que ya no cabía en ese recorrido. La
 *   siguiente interacción (incluida una sola flecha de teclado) producía entonces un salto
 *   brusco en a/b, en vez de un cambio gradual de un paso.
 *   Ahora: un `useEffect` que depende de `rango` (a su vez de `mu`/`sigma`) reclampa `a` y `b`
 *   al nuevo `[rango.xMin, rango.xMax]` en cuanto el rango cambia, así que el estado de React
 *   nunca queda por detrás de lo que el propio slider puede mostrar. Ver CASO 2.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 */

const RUTA = '/simulador-distribucion-normal/';

const resultsPanel = (page: Page) => page.locator('[role="status"]');
const probLabel = (page: Page) =>
  page.locator('[class$="__resultCardMain"] [class$="__resultLabel"]');
const probValueLarge = (page: Page) => page.locator('[class$="__resultValueLarge"]');
const probDecimal = (page: Page) => page.locator('[class$="__resultDecimal"]');

/** Tarjeta .resultCard (Z(a) o Z(b), nunca la .resultCardMain — el sufijo $= las distingue). */
function tarjetaZ(page: Page, cual: 'Z(a)' | 'Z(b)'): Locator {
  return page.locator('[class$="__resultCard"]').filter({ hasText: cual });
}
function valorZ(page: Page, cual: 'Z(a)' | 'Z(b)'): Locator {
  return tarjetaZ(page, cual).locator('[class$="__resultValue"]');
}

/** Los cuatro deslizadores, por su etiqueta accesible: el marcado no les pone id. */
const SIGMA = 'input[aria-label="Desviación típica σ"]';
const A = 'input[aria-label="Valor a"]';
const DESLIZADORES = ['input[aria-label="Media μ"]', SIGMA, A, 'input[aria-label="Valor b"]'];

const sigmaInput = (page: Page) => page.getByLabel('Desviación típica σ');
const aInput = (page: Page) => page.getByLabel('Valor a');

/**
 * Mueve un slider con el setter nativo. Un <input type="range"> no acepta fill() (lanza
 * "Malformed value: 3"), y arrastrar con el ratón no da un valor exacto — mismo patrón que
 * simulador-movimiento-circular.spec.ts. El propio navegador clampa a [min,max]: es justo lo
 * que el CASO 3 quiere observar, y por eso hay que decirle a `sembrarValor` en qué valor va
 * a quedarse el estado cuando no es el pedido.
 */
async function mover(page: Page, selector: string, valor: number | string, esperado = valor) {
  await sembrarValor(page, selector, valor, { esperado });
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.locator('canvas')).toBeVisible();
  // El <canvas> lo pinta un efecto, pero los deslizadores viajan en el HTML servido: hay que
  // esperar a que React los haya montado o el primer evento se pierde (ver _hidratacion.ts).
  await esperarHidratacion(page, DESLIZADORES);
});

test.describe('CASO 1 (normal) — estado por defecto, N(0,1), P(−1<X<1)', () => {
  test('68,27 %, decimal 0,6827 y z(a)=−1,000 / z(b)=1,000', async ({ page }) => {
    await expect(probLabel(page)).toHaveText('P(-1,00 < X < 1,00)');
    await expect(probValueLarge(page)).toHaveText('68,27 %');
    // Φ(1) tabulado = 0,8413 → 2·0,8413−1 = 0,6826 ≈ 0,6827 (diferencia de redondeo de tabla).
    await expect(probDecimal(page)).toHaveText('= 0,6827');
    await expect(valorZ(page, 'Z(a)')).toHaveText('-1,000');
    await expect(valorZ(page, 'Z(b)')).toHaveText('1,000');
  });
});

test.describe('CASO 2 (límite, reparado) — σ muy pequeña con a/b heredados de una σ mayor', () => {
  test('a/b se reclampan al nuevo rango: el slider "a" y el estado de React quedan sincronizados', async ({
    page,
  }) => {
    // Reduce σ de 1 a su mínimo (0,1) sin tocar a (-1) ni b (1) directamente.
    await mover(page, SIGMA, 0.1);

    // REPARADO (574): el useEffect reclampa a/b al nuevo rango [-0,45, 0,45] — ya no
    // se quedan ancladas en -1/1, fuera del recorrido visible del slider.
    await expect(aInput(page)).toHaveAttribute('min', '-0.45');
    await expect(aInput(page)).toHaveValue('-0.45');
    await expect(probLabel(page)).toContainText('-0,45');
    await expect(probLabel(page)).not.toContainText('-1,00');

    // z(a)=-4,500 y z(b)=4,500 (antes ±10): la probabilidad sigue redondeando a 100,00 %/1,0000,
    // porque para z≥4 la cola ya está a varios nueves de 1.
    await expect(probValueLarge(page)).toHaveText('100,00 %');
    await expect(probDecimal(page)).toHaveText('= 1,0000');
    await expect(valorZ(page, 'Z(a)')).toHaveText('-4,500');
    await expect(valorZ(page, 'Z(b)')).toHaveText('4,500');

    // Consecuencia: una flecha de teclado ahora avanza UN SOLO paso del slider
    // ((0,45-(-0,45))/200 = 0,0045), no un salto de más de 5σ de golpe.
    await aInput(page).focus();
    await aInput(page).press('ArrowRight');
    await expect(aInput(page)).toHaveValue('-0.4455');
    await expect(valorZ(page, 'Z(a)')).toHaveText('-4,455');
    await expect(probLabel(page)).toContainText('-0,446');
  });
});

test.describe('CASO 3 (rechazo) — σ = 0 o σ negativa nunca se aceptan', () => {
  test('el slider clampa cualquier intento de σ ≤ 0 al mínimo declarado (0,1)', async ({ page }) => {
    await expect(sigmaInput(page)).toHaveAttribute('min', '0.1');

    // σ parte de 1: pedir 0 es un cambio real que el navegador capa a 0,1.
    await mover(page, SIGMA, 0, 0.1);
    await expect(sigmaInput(page)).toHaveValue('0.1');

    // Subir a 2 ANTES del intento negativo no es adorno: sin esto σ ya valdría 0,1, el DOM la
    // dejaría en 0,1 al capar el −5 y React descartaría el evento por duplicado, de modo que
    // la comprobación pasaría sin que nada se hubiera movido (ver _hidratacion.ts).
    await mover(page, SIGMA, 2);
    await expect(sigmaInput(page)).toHaveValue('2');

    await mover(page, SIGMA, -5, 0.1);
    await expect(sigmaInput(page)).toHaveValue('0.1');

    // Con σ=0,1 (el mínimo válido) el panel sigue dando números finitos, sin NaN ni Infinity.
    const texto = await resultsPanel(page).innerText();
    expect(texto).not.toContain('NaN');
    expect(texto).not.toContain('Infinity');
  });
});

/*
 * ═════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (skill /casos-aula-meskeia, 29/09/2026) — tipo A, doce casos numerados.
 *
 * Van DETRÁS del acta del Inspector y la dejan intacta. El `beforeEach` de arriba abre la página
 * también para estas pruebas; las que no la necesitan simplemente no la usan.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO — con la tabla Z (Φ a cuatro decimales), a mano:
 *    1. P(Z < 1,25) = Φ(1,25) = 0,8944 → 89,44 %
 *    2. P(Z > −0,75) = Φ(0,75) por simetría = 0,7734 → 77,34 %
 *    3. Φ(1,5) − Φ(−0,5) = 0,9332 − 0,3085 = 0,6247 → 62,47 %
 *    4. z = (58 − 70) / 8 = −1,50
 *    5. z = (990 − 1000) / 8 = −1,25 → 1 − 0,8944 = 0,1056 → 10,56 %
 *    6. z = (50 − 40) / 5 = 2 → 1 − 0,9772 = 0,0228 → 2,28 %
 *    7. z = ±1,25 → 2·0,8944 − 1 = 0,7888 con la tabla; con Φ exacta 0,788700 → 78,87 %
 *    8. z = −1 y 1,25 → 0,8944 − 0,1587 = 0,7357 → 73,57 %
 *    9. 90 % por debajo → z = 1,2816 (tabla 1,28) → 500 + 128,16 = 628
 *   10. 5 % por debajo → z = −1,6449 (tabla −1,64/−1,65) → 500 − 6,58 = 493,4 mL
 *   11. z = ±2 → fuera = 2·(1 − 0,9772) = 0,0456 (exacta 0,0455) → 2000·0,0455 = 91 tornillos
 *   12. Φ(z) = 0,8413 → z = 1,00 → σ = (78 − 62) / 1 = 16,0
 *
 * La Φ del test (`phiIndependiente`) integra la densidad por Simpson, sin pasar por la `erf` de
 * Abramowitz & Stegun de la app: así la comparación no es la app contra sí misma.
 * ═════════════════════════════════════════════════════════════════════════════════════════
 */

/** Φ(z) = 0,5 + ∫₀ᶻ φ(t) dt por Simpson con 2.000 subintervalos (error < 1e-12). */
function phiIndependiente(z: number): number {
  const n = 2000;
  const h = z / n;
  const f = (t: number) => Math.exp(-0.5 * t * t) / Math.sqrt(2 * Math.PI);
  let s = f(0) + f(z);
  for (let i = 1; i < n; i++) s += (i % 2 === 0 ? 2 : 4) * f(i * h);
  return 0.5 + (s * h) / 3;
}
const r2 = (x: number) => Math.round(x * 100) / 100;
const r4 = (x: number) => Math.round(x * 10000) / 10000;
/** Φ como la lee un alumno en la tabla: z con dos decimales, Φ con cuatro. */
const phiTablaTest = (z: number) => r4(phiIndependiente(r2(z)));

const ESPERADOS: Record<number, number> = {
  1: 89.44, 2: 77.34, 3: 62.47, 4: -1.5, 5: 10.56, 6: 2.28,
  7: 78.87, 8: 73.57, 9: 628, 10: 493.4, 11: 91, 12: 16,
};

test.describe('simulador-distribucion-normal · casos para clase', () => {
  test('1-4 · doce casos, ids 1..12, deterministas, completos y recalculables desde sus datos', () => {
    expect(CASOS).toHaveLength(12);
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id}`).toBeGreaterThan(40);
      expect(c.etiquetaRespuesta.trim(), `caso ${c.id}`).not.toBe('');
      expect(Number.isFinite(c.respuesta), `caso ${c.id}`).toBe(true);
      expect(c.pasos.length, `caso ${c.id}`).toBeGreaterThanOrEqual(2);
      expect(c.pista.trim(), `caso ${c.id}`).not.toBe('');
      // 3 · la respuesta declarada es la que sale de recalcular desde `datos`
      const r = resolverCaso(c.datos);
      expect(r.ok, `caso ${c.id}`).toBe(true);
      const dec = c.datos.decimales ?? 2;
      expect(Math.round(r.valor * 10 ** dec) / 10 ** dec, `caso ${c.id}`).toBe(c.respuesta);
      // 2 · determinista: recalcular otra vez da exactamente lo mismo
      expect(resolverCaso(c.datos)).toEqual(r);
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
  });

  test('las doce respuestas coinciden con las resueltas a mano con la tabla Z', () => {
    for (const c of CASOS) {
      expect(c.respuesta, `caso ${c.id}`).toBeCloseTo(ESPERADOS[c.id], 6);
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda nacional', () => {
    const lugares =
      /españ|méxic|mexic|colombi|argentin|chile|perú|peru|venezuel|ecuador|guatemal|bolivi|uruguay|paraguay|cuba|honduras|salvador|nicaragu|costa rica|panam|dominican|madrid|barcelona|bogotá|lima|santiago|buenos aires|euro|dólar|dolar|pesos (mexicanos|colombianos|argentinos|chilenos)|selectividad|bachillerato/i;
    for (const c of CASOS) {
      expect(`${c.titulo} ${c.enunciado}`, `caso ${c.id}`).not.toMatch(lugares);
      expect(`${c.titulo} ${c.enunciado}`, `caso ${c.id}`).not.toMatch(/\bESO\b/);
    }
  });

  test('5.bis · los decimales que pide el enunciado son los que enseña la solución', () => {
    const pedidos = (e: string) =>
      /dos decimales/.test(e) ? 2 : /una décima/.test(e) ? 1 : /a unidades/.test(e) ? 0 : null;
    for (const c of CASOS) {
      const dec = c.datos.decimales ?? 2;
      expect(pedidos(c.enunciado), `caso ${c.id}`).toBe(dec);
      const cifra = c.respuestaTexto.split(' ')[0];
      const mostrados = cifra.includes(',') ? cifra.split(',')[1].length : 0;
      expect(mostrados, `caso ${c.id}: ${c.respuestaTexto}`).toBe(dec);
    }
    // El % va separado con espacio duro, nunca pegado ni con espacio normal
    expect(CASOS[0].respuestaTexto).toBe('89,44 %');
  });

  test('la tabla Z da la misma respuesta: z exactas y cuantiles dentro de la tolerancia', () => {
    for (const c of CASOS) {
      const d = c.datos;
      if (d.pregunta === 'probabilidad' || d.pregunta === 'fuera' || d.pregunta === 'recuento') {
        const zA = (d.a! - d.mu) / d.sigma!;
        const zB = d.b === undefined ? zA : (d.b - d.mu) / d.sigma!;
        // z exacta con dos decimales: es lo que hace que la tabla sirva sin interpolar
        expect(Math.abs(zA - r2(zA)), `caso ${c.id}`).toBeLessThan(1e-9);
        expect(Math.abs(zB - r2(zB)), `caso ${c.id}`).toBeLessThan(1e-9);
        const [lo, hi] = zA < zB ? [zA, zB] : [zB, zA];
        const dentro = phiTablaTest(hi) - phiTablaTest(lo);
        let conTabla: number;
        if (d.pregunta === 'probabilidad') {
          conTabla =
            d.tipo === 'menor'
              ? phiTablaTest(zA) * 100
              : d.tipo === 'mayor'
                ? (1 - phiTablaTest(zA)) * 100
                : dentro * 100;
        } else if (d.pregunta === 'fuera') {
          conTabla = (1 - dentro) * 100;
        } else {
          conTabla = d.n! * (1 - dentro);
        }
        const dec = d.decimales ?? 2;
        const alumno = Math.round(conTabla * 10 ** dec) / 10 ** dec;
        expect(comprobarRespuesta(alumno, c.respuesta).correcto, `caso ${c.id}: tabla ${alumno}`).toBe(true);
      } else if (d.pregunta === 'cuantil') {
        const exacto = cuantilNormal(d.p!);
        // Los dos z de la tabla que rodean al exacto: cualquiera de los dos debe valer
        for (const z of [Math.floor(exacto * 100) / 100, Math.ceil(exacto * 100) / 100]) {
          const dec = d.decimales ?? 2;
          const x = Math.round((d.mu + z * d.sigma!) * 10 ** dec) / 10 ** dec;
          expect(comprobarRespuesta(x, c.respuesta).correcto, `caso ${c.id}: z ${z} → ${x}`).toBe(true);
        }
      } else if (d.pregunta === 'sigma') {
        const sigmaTabla = (d.a! - d.mu) / r2(cuantilNormal(d.p!));
        expect(comprobarRespuesta(Math.round(sigmaTabla * 10) / 10, c.respuesta).correcto).toBe(true);
      }
    }
  });

  test('7 · convenio: la cdf de la app es Φ, N(μ, σ) va con la desviación y el panel usa la misma función', () => {
    // La erf de Abramowitz & Stegun frente a la Φ independiente del test
    for (let z = -4; z <= 4; z += 0.05) {
      expect(Math.abs(cdf(z, 0, 1) - phiIndependiente(z)), `z = ${z}`).toBeLessThan(2e-7);
    }
    // Valores de tabla conocidos
    expect(r4(cdf(1, 0, 1))).toBe(0.8413);
    expect(r4(cdf(1.96, 0, 1))).toBe(0.975);
    // probabilidadNormal es lo que pinta el panel: P(−1 < X < 1) en N(0,1) = 68,27 % (acta, CASO 1)
    expect(r4(probabilidadNormal('entre', 1, -1, 0, 1))).toBe(0.6827);
    // Ningún enunciado usa la notación N(·,·), que unos libros leen con σ y otros con σ²
    for (const c of CASOS) expect(c.enunciado, `caso ${c.id}`).not.toMatch(/N\(/);
    // Si σ se leyera como varianza (σ² = 64), el caso 4 daría −0,1875: no se acepta
    expect(comprobarRespuesta(-12 / 64, CASOS[3].respuesta).correcto).toBe(false);
    // La inversa sale de la MISMA cdf
    expect(cdf(cuantilNormal(0.9), 0, 1)).toBeCloseTo(0.9, 10);
    expect(Number.isNaN(cuantilNormal(0))).toBe(true);
    expect(Number.isNaN(cuantilNormal(1))).toBe(true);
  });

  test('corrección: tolerancia, tanto por uno, texto ilegible y datos imposibles', () => {
    expect(toleranciaDe(89.44)).toBeCloseTo(0.8944, 10);
    expect(toleranciaDe(2.28)).toBeCloseTo(0.0228, 10);
    expect(toleranciaDe(0.5)).toBe(0.01);
    expect(comprobarRespuesta(10.56, 10.56, true).correcto).toBe(true);
    const tantoPorUno = comprobarRespuesta(0.1056, 10.56, true);
    expect(tantoPorUno.correcto).toBe(false);
    expect(tantoPorUno.motivo).toContain('tanto por uno');
    expect(comprobarRespuesta(0.1056, 10.56, false).motivo).not.toContain('tanto por uno');
    expect(comprobarRespuesta(NaN, 10.56, true).motivo).toContain('Escribe un número');
    expect(comprobarRespuesta(12, 10.56, true).correcto).toBe(false);
    // Nada lanza: datos incompletos o imposibles devuelven ok: false
    expect(resolverCaso({ pregunta: 'probabilidad', mu: 0, sigma: 0, a: 1 }).ok).toBe(false);
    expect(resolverCaso({ pregunta: 'cuantil', mu: 0, sigma: 1, p: 1 }).ok).toBe(false);
    expect(resolverCaso({ pregunta: 'sigma', mu: 10, a: 12, p: 0.5 }).ok).toBe(false);
    expect(resolverCaso({ pregunta: 'sigma', mu: 10, a: 8, p: 0.9 }).ok).toBe(false);
  });

  test('6 · la práctica es reproducible, variada y corrige con el mismo resolverCaso', () => {
    expect(generarEjercicioAleatorio(42)).toEqual(generarEjercicioAleatorio(42));
    const respuestas = new Set<number>();
    const escenarios = new Set<string>();
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      respuestas.add(e.respuesta);
      escenarios.add(JSON.stringify(e.datos));
      expect(Number.isFinite(e.respuesta), `semilla ${s}`).toBe(true);
      const r = resolverCaso(e.datos);
      expect(Math.round(r.valor * 100) / 100, `semilla ${s}`).toBe(e.respuesta);
      // Sus z también salen exactas con dos decimales
      const z = (e.datos.a! - e.datos.mu) / e.datos.sigma!;
      expect(Math.abs(z - r2(z)), `semilla ${s}`).toBeLessThan(1e-9);
      expect(e.enunciado, `semilla ${s}`).not.toContain('NaN');
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(escenarios.size).toBeGreaterThanOrEqual(20);
  });
});

test.describe('simulador-distribucion-normal · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');
  const casilla = (page: Page) => page.locator('#casos-respuesta');

  test('se corrige un caso, avisa del tanto por uno y acepta el menos tipográfico', async ({ page }) => {
    await expect(seccion(page)).toBeVisible();
    await expect(seccion(page).getByRole('button', { name: /^Caso \d+:/ })).toHaveCount(12);

    await seccion(page).getByRole('button', { name: 'Caso 5: Paquetes que pesan de menos' }).click();
    await expect(seccion(page).getByText(/menos de 990 g/)).toBeVisible();
    await casilla(page).fill('0,1056');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('tanto por uno');
    await casilla(page).fill('10,56 %');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto!');

    await seccion(page).getByRole('button', { name: 'Ver solución' }).click();
    await expect(seccion(page).locator('#casos-solucion')).toContainText('10,56 %');

    await seccion(page).getByRole('button', { name: 'Caso 4: Tipificar una puntuación' }).click();
    await casilla(page).fill('−1,5');
    await casilla(page).press('Enter');
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto!');
  });

  test('la sección no duplica el role="status" del panel ni añade deslizadores', async ({ page }) => {
    await expect(page.locator('[role="status"]')).toHaveCount(1);
    await expect(seccion(page).locator('input[type="range"], canvas')).toHaveCount(0);
  });
});
