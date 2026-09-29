import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';
import { parseSpanishNumber } from '../../lib/formatters';
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
 * Primera inspección: 31/08/2026. Re-inspección: 29/09/2026 (tras los casos para clase,
 * 9e9c2894), al final del fichero.
 *
 * QUÉ PROMETE
 *   <h1>: «📊 Simulador de Distribución Normal»
 *   subtítulo: «Mueve la media (μ) y la desviación típica (σ) para ver la curva de Gauss en
 *     tiempo real. Calcula probabilidades, puntuaciones Z y la regla 68-95-99.7.»
 *   bloque educativo: fórmula f(x) = (1/σ√(2π))·e^(−½((x−μ)/σ)²), tipificación Z = (X−μ)/σ,
 *     regla 68-95-99,7 y cinco errores conceptuales frecuentes.
 *
 * DÓNDE VIVE EL CÁLCULO — el 31/08/2026, todo inline en page.tsx. Desde el 29/09/2026
 * (9e9c2894) pdf, erf y cdf viven en app/simulador-distribucion-normal/casos.ts, y el useMemo
 * de la probabilidad es su `probabilidadNormal`, la misma que usa la corrección de los casos:
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

/*
 * ═════════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN 29/09/2026 — tras los casos para clase (9e9c2894)
 *
 * Foco: lo nuevo (casos.ts + CasosAula.tsx) y que el panel NO haya cambiado de cifra al mover
 * erf/cdf a casos.ts. Todo resuelto a mano ANTES de abrir el navegador, con la tabla Z
 * estándar (z con dos decimales, Φ con cuatro) y contrastado con una Φ propia por Simpson.
 *
 *   PANEL (mismas cifras que antes del traslado)
 *     CI N(100, 15), a = 130 → z = 30/15 = 2,00 → Φ(2,00) = 0,9772 (tabla) →
 *       P(X > 130) = 1 − 0,9772 = 0,0228 → 2,28 % · P(X < 130) = 97,72 %
 *     Tornillos N(10; 0,2), a = 9,7 → z = −0,3/0,2 = −1,50 → 1 − Φ(1,50) = 1 − 0,9332 = 0,0668
 *       → 6,68 %
 *     Alturas N(176, 7), a = 185 → z = 9/7 = 1,2857 → interpolando Φ(1,28) = 0,8997 y
 *       Φ(1,29) = 0,9015: 0,8997 + 0,57·0,0018 = 0,9007 → 1 − 0,9007 = 0,0993 → 9,93 %
 *     Cola: N(0, 1), a = 3,06 (paso 168 del deslizador: −4,5 + 168·0,045) → Φ(3,06) = 0,9989
 *       (fila 3,0, columna 0,06) → P(X > 3,06) = 0,0011 → 0,11 % (Simpson: 0,0011067)
 *     σ pequeña: N(0; 0,1), a = 0,126 (paso 128) → z = 1,26 → Φ(1,26) = 0,8962 → 89,62 %
 *     El caso 6 del corrector (baterías N(40, 5), más de 50 h) es el MISMO P(Z > 2): 2,28 %.
 *
 *   CORRECTOR
 *     Caso 7: Φ(1,25) = 0,8944 → con la tabla 2·0,8944 − 1 = 0,7888 → 78,88 %; exacta 78,87 %
 *       (Simpson 0,788700). Es el caso del convenio: la solución debe decir que 78,88 también vale.
 *     Caso 9: z de la tabla 1,28 o 1,29 → 628 o 629 · Caso 10: z = −1,64 o −1,65 → 493,4
 *     Caso 1 escrito con punto decimal (89.44, México): 89,44 — gana el decimal, no es un millar.
 *
 *   SOSPECHAS DE SOSPECHAS.md
 *     (a) `.modeBtn:hover` sin `.modeBtnActive:hover`: aquí NO se reproduce — el hover solo
 *         cambia el borde y el desplazamiento, no el color. Medido: 14,84:1 en claro y 11,23:1 en
 *         oscuro con el ratón encima del modo activo.
 *     (b) Contraste de marca: el bloque de casos NUEVO cumple en los dos temas (usa
 *         --primary-boton / --primary-texto / --secondary-texto). Lo que NO cumple es anterior
 *         a la tarea: los botones activos de tipo de probabilidad y de problema tipo, y el
 *         número de los pasos del bloque educativo (blanco sobre var(--primary)), y los
 *         valores de los deslizadores y los títulos educativos (var(--primary) como texto).
 *     (c) toleranciaDe (1 % relativo): no rechaza ninguna lectura correcta de la tabla, pero es
 *         demasiado ancha. En el caso 10 el 1 % se aplica a x ≈ 493 mL con σ = 4 mL: 4,93 mL
 *         = 1,23σ, así que acepta cualquier z entre −2,88 y −0,41. En el caso 1 acepta 90,32
 *         (Φ(1,30), fila equivocada) para P(Z < 1,25) = 89,44.
 * ═════════════════════════════════════════════════════════════════════════════════════════
 */

const MEDIA = 'input[aria-label="Media μ"]';
const etiquetaMedia = (page: Page) =>
  page.locator('[class*="controlLabel"]').filter({ hasText: 'Media (μ)' });
const seccionCasos = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');
const casillaCasos = (page: Page) => page.locator('#casos-respuesta');
/** El aviso de la app, no el anunciador de rutas de Next, que también es role="alert". */
const avisoCasos = (page: Page) => seccionCasos(page).getByRole('alert');

async function responderCaso(page: Page, nombre: string, respuesta: string) {
  await seccionCasos(page).getByRole('button', { name: nombre }).click();
  await casillaCasos(page).fill(respuesta);
  await seccionCasos(page).getByRole('button', { name: 'Comprobar' }).click();
}

/** Contraste WCAG del texto de un elemento contra su fondo EFECTIVO (capas rgba compuestas). */
async function contraste(
  page: Page,
  selector: string,
): Promise<{ ratio: number; umbral: number; detalle: string }> {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const leer = (c: string): number[] => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return [0, 0, 0, 0];
        const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
      };
      const capas: number[][] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        capas.push(leer(getComputedStyle(n).backgroundColor));
      }
      let fondo = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) {
        const [r, g, b, a] = capas[i];
        fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
      }
      const estilo = getComputedStyle(el);
      const [r, g, b, a] = leer(estilo.color);
      const texto = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
      const lineal = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const lum = (c: number[]) => 0.2126 * lineal(c[0]) + 0.7152 * lineal(c[1]) + 0.0722 * lineal(c[2]);
      const l1 = lum(texto);
      const l2 = lum(fondo);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const px = parseFloat(estilo.fontSize);
      const grande = px >= 24 || (px >= 18.66 && parseInt(estilo.fontWeight, 10) >= 700);
      const hex = (c: number[]) =>
        '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
      return {
        ratio: Math.round(ratio * 100) / 100,
        umbral: grande ? 3 : 4.5,
        detalle: `${hex(texto)} sobre ${hex(fondo)}, ${px}px`,
      };
    });
}

/** Mide varios elementos y devuelve los que no llegan a su umbral, con su cifra. */
async function suspensos(page: Page, tema: string, selectores: Record<string, string>): Promise<string[]> {
  const fallos: string[] = [];
  for (const [nombre, sel] of Object.entries(selectores)) {
    const m = await contraste(page, sel);
    if (m.ratio < m.umbral) fallos.push(`${tema} · ${nombre}: ${m.ratio}:1 < ${m.umbral} (${m.detalle})`);
  }
  return fallos;
}

test.describe('re-inspección 29/09/2026 · el panel no cambia de cifra al mover erf/cdf', () => {
  test('CI, tornillos y alturas dan lo mismo que a mano, y el caso 6 del corrector coincide con el panel', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Problemas tipo/ }).click();

    // CI: z = 2,00 → 1 − 0,9772 = 0,0228
    await page.getByRole('button', { name: 'Coeficiente intelectual' }).click();
    await expect(probLabel(page)).toHaveText('P(X > 130,00)');
    await expect(probValueLarge(page)).toHaveText('2,28 %');
    await expect(probDecimal(page)).toHaveText('= 0,0228');
    await expect(valorZ(page, 'Z(a)')).toHaveText('2,000');
    await page.getByRole('button', { name: 'P(X < a)' }).click();
    await expect(probValueLarge(page)).toHaveText('97,72 %');
    await expect(probDecimal(page)).toHaveText('= 0,9772');

    // Tornillos: z = −1,50 → 1 − 0,9332 = 0,0668
    await page.getByRole('button', { name: 'Control de calidad' }).click();
    await expect(probLabel(page)).toHaveText('P(X < 9,700)');
    await expect(probValueLarge(page)).toHaveText('6,68 %');
    await expect(valorZ(page, 'Z(a)')).toHaveText('-1,500');

    // Alturas: z = 1,2857 → interpolado 0,9007 → 0,0993
    await page.getByRole('button', { name: 'Alturas de adultos' }).click();
    await expect(probValueLarge(page)).toHaveText('9,93 %');
    await expect(probDecimal(page)).toHaveText('= 0,0993');
    await expect(valorZ(page, 'Z(a)')).toHaveText('1,286');

    // El caso 6 (baterías N(40, 5), más de 50 h) es el mismo P(Z > 2): la corrección y el panel
    // dan la misma cifra, y la cifra del panel se acepta.
    await responderCaso(page, 'Caso 6: Baterías que duran mucho', '2,28');
    await expect(avisoCasos(page)).toContainText('¡Correcto!');
    await seccionCasos(page).getByRole('button', { name: 'Ver solución' }).click();
    await expect(seccionCasos(page).locator('#casos-solucion')).toContainText('Respuesta: 2,28 %');
  });

  test('cola (z = 3,06) y σ pequeña (0,1) sin NaN y con la cifra de la tabla', async ({ page }) => {
    // Cola: Φ(3,06) = 0,9989 → P(X > 3,06) = 0,0011 → 0,11 %
    await page.getByRole('button', { name: 'P(X > a)' }).click();
    await sembrarValor(page, A, 3.06);
    await expect(probLabel(page)).toHaveText('P(X > 3,06)');
    await expect(probValueLarge(page)).toHaveText('0,11 %');
    await expect(probDecimal(page)).toHaveText('= 0,0011');
    await expect(valorZ(page, 'Z(a)')).toHaveText('3,060');

    // σ = 0,1 (el mínimo): a = 0,126 → z = 1,26 → Φ(1,26) = 0,8962 → 89,62 %
    await sembrarValor(page, SIGMA, 0.1);
    await page.getByRole('button', { name: 'P(X < a)' }).click();
    await sembrarValor(page, A, 0.126);
    await expect(probLabel(page)).toHaveText('P(X < 0,126)');
    await expect(probValueLarge(page)).toHaveText('89,62 %');
    await expect(probDecimal(page)).toHaveText('= 0,8962');
    await expect(valorZ(page, 'Z(a)')).toHaveText('1,260');
  });
});

test.describe('re-inspección 29/09/2026 · el corrector en el navegador', () => {
  test('convenio de la tabla en el caso 7, lecturas de tabla aceptadas y rechazos con su motivo', async ({
    page,
  }) => {
    // Caso 7: con la tabla 2·0,8944 − 1 = 0,7888 → 78,88 %; exacta 78,87 %. Las dos valen y la
    // solución lo dice.
    await responderCaso(page, 'Caso 7: Estaturas en un intervalo simétrico', '78,88');
    await expect(avisoCasos(page)).toContainText('¡Correcto!');
    await seccionCasos(page).getByRole('button', { name: 'Ver solución' }).click();
    const solucion = seccionCasos(page).locator('#casos-solucion');
    await expect(solucion).toContainText('Con los valores redondeados de la tabla sale 78,88 %');
    await expect(solucion).toContainText('Respuesta: 78,87 %');

    // Caso 9 con z = 1,29 de la tabla: 500 + 129 = 629 · caso 10 con z = −1,64: 493,44 → 493,4
    await responderCaso(page, 'Caso 9: La nota de corte de una beca', '629');
    await expect(avisoCasos(page)).toContainText('¡Correcto!');
    await responderCaso(page, 'Caso 10: Las botellas con menos líquido', '493,4');
    await expect(avisoCasos(page)).toContainText('¡Correcto!');

    // Punto decimal de México: 89.44 es 89,44, no un millar
    await responderCaso(page, 'Caso 1: El área a la izquierda', '89.44');
    await expect(avisoCasos(page)).toContainText('¡Correcto!');

    // Rechazos: tanto por uno (0,0228 en vez de 2,28), texto, vacío y signo olvidado
    await responderCaso(page, 'Caso 6: Baterías que duran mucho', '0,0228');
    await expect(avisoCasos(page)).toContainText('tanto por uno');
    await expect(avisoCasos(page)).toContainText('(2,28)');
    await responderCaso(page, 'Caso 5: Paquetes que pesan de menos', 'abc');
    await expect(avisoCasos(page)).toContainText('Escribe un número');
    await responderCaso(page, 'Caso 5: Paquetes que pesan de menos', '');
    await expect(avisoCasos(page)).toContainText('Escribe un número');
    await responderCaso(page, 'Caso 4: Tipificar una puntuación', '1,5');
    await expect(avisoCasos(page)).toContainText('No es correcto');
  });

  test('las lecturas legítimas de la tabla siguen aceptadas (guarda para quien estreche la tolerancia)', () => {
    // Caso 10: z = −1,6449 → 493,42 → 493,4; quien no redondea con z = −1,64 escribe 493,44
    expect(comprobarRespuesta(493.4, CASOS[9].respuesta).correcto).toBe(true);
    expect(comprobarRespuesta(493.44, CASOS[9].respuesta).correcto).toBe(true);
    // Caso 1: Φ(1,25) = 0,8944 → 89,44 (y la exacta 0,894350, que redondea a 89,44)
    expect(comprobarRespuesta(89.44, CASOS[0].respuesta, true).correcto).toBe(true);
    // Caso 7 con la tabla: 78,88
    expect(comprobarRespuesta(78.88, CASOS[6].respuesta, true).correcto).toBe(true);
  });
});

test.describe('re-inspección 29/09/2026 · hallazgos ABIERTOS', () => {
  test('ABIERTO · caso 10: la tolerancia del 1 % de x (4,93 mL = 1,23σ) acepta cuantiles equivocados', () => {
    test.fail(true, 'ABIERTO: toleranciaDe aplica el 1 % a x ≈ 493 mL con σ = 4 mL');
    // Esperado a mano: el 5 % inferior es z = −1,6449 → 493,4 mL. Estas NO son esa respuesta:
    //   496,0 = 500 − 1·4    → z = −1, el percentil 15,87 (Φ(−1) = 1 − 0,8413)
    //   492,2 = 500 − 1,96·4 → confunde la cola del 5 % con el intervalo bilateral del 95 %
    //   492,0 = 500 − 2·4    → z = −2, el percentil 2,28
    expect(comprobarRespuesta(496, CASOS[9].respuesta).correcto, '496 (z = −1)').toBe(false);
    expect(comprobarRespuesta(492.2, CASOS[9].respuesta).correcto, '492,2 (z = −1,96)').toBe(false);
    expect(comprobarRespuesta(492, CASOS[9].respuesta).correcto, '492 (z = −2)').toBe(false);
  });

  test('ABIERTO · caso 1: la tolerancia acepta la fila equivocada de la tabla (Φ(1,30) = 90,32)', () => {
    test.fail(true, 'ABIERTO: 1 % de 89,44 = 0,89 puntos, 89 veces el redondeo de la tabla (0,01)');
    // P(Z < 1,25) = Φ(1,25) = 0,8944 → 89,44 %. Leer la fila 1,3 en vez de la 1,2 con la
    // columna 0,05 da Φ(1,30) = 0,9032 → 90,32 %: diferencia 0,88 < tolerancia 0,8944.
    expect(comprobarRespuesta(90.32, CASOS[0].respuesta, true).correcto).toBe(false);
  });

  test('ABIERTO · «Problemas tipo» marca «Alturas de adultos» pero el panel sigue en N(0,1)', async ({ page }) => {
    test.fail(true, 'ABIERTO: entrar en el modo no carga el problema que aparece activo');
    await page.getByRole('button', { name: /Problemas tipo/ }).click();
    const alturas = page.getByRole('button', { name: 'Alturas de adultos' });
    await expect(alturas).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('¿Qué % de hombres miden más de 185 cm?')).toBeVisible();
    // Lo que responde a esa pregunta: z = 9/7 → 9,93 % (ver la cabecera de esta sección).
    // Obtenido: «P(-1,00 < X < 1,00)» y 68,27 %, la respuesta a otra pregunta.
    await expect(probLabel(page)).toHaveText('P(X > 185,00)', { timeout: 3000 });
    await expect(probValueLarge(page)).toHaveText('9,93 %', { timeout: 3000 });
  });

  test('ABIERTO · volver a «Probabilidad» con un problema cargado desincroniza μ: una flecha la lleva de 100 a 4', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: misma forma que el 574, en μ y σ al cambiar de modo');
    await page.getByRole('button', { name: /Problemas tipo/ }).click();
    await page.getByRole('button', { name: 'Coeficiente intelectual' }).click();
    await expect(probLabel(page)).toHaveText('P(X > 130,00)');
    await page.getByRole('button', { name: /^Probabilidad/ }).click();
    const leerMedia = async () =>
      parseSpanishNumber(((await etiquetaMedia(page).textContent()) ?? '').split(':')[1] ?? '');
    const antes = await leerMedia();
    expect(Number.isFinite(antes)).toBe(true);
    // Con σ = 15 el paso de μ es 1: una flecha la mueve UN paso desde lo que la etiqueta enseña,
    // sea 100 (si el recorrido la admite) o el valor al que se la acote. Obtenido: 100 → 4,
    // porque el deslizador está en [−5, 5] y su DOM se quedó en 5 (σ, igual: 15 → 2,95).
    await page.locator(MEDIA).focus();
    await page.keyboard.press('ArrowLeft');
    await expect
      .poll(async () => Math.abs((await leerMedia()) - antes), { timeout: 3000 })
      .toBeLessThanOrEqual(1);
  });

  test('ABIERTO · blanco sobre var(--primary) en los botones activos y en los pasos (4,11:1 claro, 2,79:1 oscuro)', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: .tipoBtnActive, .problemaBtnActive y .stepNumber no usan --primary-boton');
    await prepararParaMedir(page);
    const fallos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await activarTema(page, tema);
      await page.getByRole('button', { name: /Problemas tipo/ }).click();
      await page.getByRole('button', { name: 'Coeficiente intelectual' }).click();
      const guia = page.getByRole('button', { name: 'Ver guía educativa' });
      if (await guia.count()) await guia.click();
      fallos.push(
        ...(await suspensos(page, tema, {
          'botón de tipo activo': '[class*="tipoBtnActive"]',
          'problema tipo activo': '[class*="problemaBtnActive"]',
          'número de paso (texto grande)': '[class*="stepNumber"]',
        })),
      );
    }
    expect(fallos).toEqual([]);
  });

  test('ABIERTO · var(--primary) como texto pequeño: valores de μ/σ/a/b y títulos educativos (4,11 y 3,93:1 en claro)', async ({
    page,
  }) => {
    test.fail(true, 'ABIERTO: .controlLabel strong, .stepContent strong, .faqItem h4 y .scenarioCard strong');
    await prepararParaMedir(page);
    await activarTema(page, 'light');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const fallos = await suspensos(page, 'claro', {
      'valor de μ en su etiqueta': '[class*="controlLabel"] strong',
      'título de paso': '[class*="stepContent"] strong',
      'pregunta frecuente': '[class*="faqItem"] h4',
      escenario: '[class*="scenarioCard"] strong',
    });
    expect(fallos).toEqual([]);
  });

  test('ABIERTO · el % del panel va con espacio normal y el bloque educativo lo pega («68%»)', async ({ page }) => {
    test.fail(true, 'ABIERTO: fmtProb concatena « %» con U+0020; regla del espacio duro del 25/09/2026');
    // Por defecto P(−1 < X < 1) = 68,27 %: el % debe ir tras un espacio DURO (U+00A0)
    const texto = (await probValueLarge(page).textContent()) ?? '';
    expect(texto).toBe('68,27 %');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // Solo el bloque educativo de ESTA app (título → cabecera → contenedor), no el pie ni las
    // tarjetas de apps relacionadas: «(95%)», «el 68%», «el 95%», «el 99,7%», «el 10%».
    const bloque = page
      .getByRole('heading', { name: /Aprende sobre la Distribución Normal/ })
      .locator('xpath=ancestor::div[2]');
    const pegados = (await bloque.innerText()).match(/\d%/g) ?? [];
    expect(pegados).toEqual([]);
  });

  test('ABIERTO · caso 11: la solución resta 0,9772 − 0,0228 y escribe 0,0455 sin avisar', async ({ page }) => {
    test.fail(true, 'ABIERTO: el paso intermedio mezcla valores de tabla con el resultado exacto');
    // Con los valores de tabla que la propia solución enseña: 1 − (0,9772 − 0,0228) = 0,0456 y
    // 2000 · 0,0456 = 91,20. La solución escribe «= 0,0455» y «= 91,00», sin la nota de redondeo.
    await seccionCasos(page).getByRole('button', { name: 'Caso 11: Tornillos rechazados en un lote' }).click();
    await seccionCasos(page).getByRole('button', { name: 'Ver solución' }).click();
    const solucion = seccionCasos(page).locator('#casos-solucion');
    await expect(solucion).toContainText('Φ(2,00) = 0,9772');
    await expect(solucion).toContainText(/0,0456|redondeados de la tabla/, { timeout: 3000 });
  });

  test('ABIERTO · los tres botones de modo no llevan type="button"', async ({ page }) => {
    test.fail(true, 'ABIERTO: regla de oro del CLAUDE.md global §5');
    for (const nombre of [/^Probabilidad/, /^Regla 68-95-99\.7/, /^Problemas tipo/]) {
      await expect(page.getByRole('button', { name: nombre })).toHaveAttribute('type', 'button', {
        timeout: 3000,
      });
    }
  });
});

test.describe('re-inspección 29/09/2026 · sospechas (a) y (b) en lo nuevo: miden bien', () => {
  test('modo activo con el ratón encima y botones del bloque de casos, en claro y en oscuro', async ({ page }) => {
    await prepararParaMedir(page);
    const fallos: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await activarTema(page, tema);
      // (a) el hover del modo activo no cambia el color del rótulo: 14,84:1 / 11,23:1
      await page.locator('[class*="modeBtnActive"]').hover();
      fallos.push(
        ...(await suspensos(page, tema, {
          'rótulo del modo activo (hover)': '[class*="modeBtnActive"] [class*="modeName"]',
        })),
      );
      await page.mouse.move(0, 0);
      // (b) el bloque nuevo: 5,47:1 sobre --primary-boton, --primary-texto y --secondary-texto
      fallos.push(
        ...(await suspensos(page, tema, {
          'título de la sección': '[class*="casosTitulo"]',
          'título del caso': '[class*="casoTitulo"]',
          'caso activo': '[class*="casoBotonActivo"]',
          Comprobar: '[class*="casoComprobar"]',
          'Ver pista': '[class*="casoAyudaBoton"]',
        })),
      );
    }
    expect(fallos).toEqual([]);
  });
});
