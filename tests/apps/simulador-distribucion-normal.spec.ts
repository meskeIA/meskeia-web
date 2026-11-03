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
import { PUERTO } from './_puerto';

/**
 * stemum.com → el servidor local, para ver la app como la sirve el portal (el script del layout
 * pone data-brand="stemum" según el host). Lo usa el cabo C0367, al final del fichero. Va al
 * NIVEL DEL FICHERO porque `launchOptions` fuerza un worker nuevo (mismo patrón que
 * simulador-mas-resorte.spec.ts); al resto de tests no les afecta: solo resuelve ese host.
 */
test.use({ launchOptions: { args: [`--host-resolver-rules=MAP stemum.com 127.0.0.1:${PUERTO}`] } });

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
  page.locator('[class$="_resultCardMain"] [class$="_resultLabel"]');
const probValueLarge = (page: Page) => page.locator('[class$="_resultValueLarge"]');
const probDecimal = (page: Page) => page.locator('[class$="_resultDecimal"]');

/** Tarjeta .resultCard (Z(a) o Z(b), nunca la .resultCardMain — el sufijo $= las distingue). */
function tarjetaZ(page: Page, cual: 'Z(a)' | 'Z(b)'): Locator {
  return page.locator('[class$="_resultCard"]').filter({ hasText: cual });
}
function valorZ(page: Page, cual: 'Z(a)' | 'Z(b)'): Locator {
  return tarjetaZ(page, cual).locator('[class$="_resultValue"]');
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
        expect(comprobarRespuesta(alumno, c.respuesta, c.datos).correcto, `caso ${c.id}: tabla ${alumno}`).toBe(true);
      } else if (d.pregunta === 'cuantil') {
        const exacto = cuantilNormal(d.p!);
        // Los dos z de la tabla que rodean al exacto: cualquiera de los dos debe valer
        for (const z of [Math.floor(exacto * 100) / 100, Math.ceil(exacto * 100) / 100]) {
          const dec = d.decimales ?? 2;
          const x = Math.round((d.mu + z * d.sigma!) * 10 ** dec) / 10 ** dec;
          expect(comprobarRespuesta(x, c.respuesta, c.datos).correcto, `caso ${c.id}: z ${z} → ${x}`).toBe(true);
        }
      } else if (d.pregunta === 'sigma') {
        const sigmaTabla = (d.a! - d.mu) / r2(cuantilNormal(d.p!));
        expect(comprobarRespuesta(Math.round(sigmaTabla * 10) / 10, c.respuesta, c.datos).correcto).toBe(true);
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
    expect(comprobarRespuesta(-12 / 64, CASOS[3].respuesta, CASOS[3].datos).correcto).toBe(false);
    // La inversa sale de la MISMA cdf
    expect(cdf(cuantilNormal(0.9), 0, 1)).toBeCloseTo(0.9, 10);
    expect(Number.isNaN(cuantilNormal(0))).toBe(true);
    expect(Number.isNaN(cuantilNormal(1))).toBe(true);
  });

  test('corrección: tolerancia, tanto por uno, texto ilegible y datos imposibles', () => {
    // REESCRITO el 29/09/2026 (hallazgos 2420 y 2421). Antes estas líneas afirmaban el 1 % del
    // valor (toleranciaDe(89,44) = 0,8944), que es justo el defecto: consagraban que se aceptara
    // Φ(1,30) = 90,32 para P(Z < 1,25). Ahora la tolerancia es la escala del error de la TABLA,
    // y depende de la pregunta, no del tamaño de la cifra (derivación en la cabecera de
    // toleranciaDe, casos.ts):
    //   probabilidad en %, dos decimales → 100·0,0001 + 0,005 = 0,015 puntos
    expect(toleranciaDe(CASOS[0].datos)).toBeCloseTo(0.015, 10);
    expect(toleranciaDe(CASOS[5].datos)).toBeCloseTo(0.015, 10); // 2,28 %: la misma, no 0,0228
    //   z → una centésima
    expect(toleranciaDe(CASOS[3].datos)).toBeCloseTo(0.01, 10);
    //   cuantil → σ·0,01 + media unidad: caso 9 (σ = 100, a unidades) 1,5 · caso 10 (σ = 4, décimas) 0,09
    expect(toleranciaDe(CASOS[8].datos)).toBeCloseTo(1.5, 10);
    expect(toleranciaDe(CASOS[9].datos)).toBeCloseTo(0.09, 10);
    //   recuento → n·0,0001 + media unidad: 2000·0,0001 + 0,5 = 0,7 tornillos
    expect(toleranciaDe(CASOS[10].datos)).toBeCloseTo(0.7, 10);
    //   σ = (x − μ)/z → |x − μ|·0,01/z² + 0,05; con z = Φ⁻¹(0,8413) ≈ 0,99982: 16·0,01/0,99964 + 0,05 ≈ 0,21
    expect(toleranciaDe(CASOS[11].datos)).toBeCloseTo(0.21, 2);

    const caso5 = CASOS[4].datos; // 10,56 %
    expect(comprobarRespuesta(10.56, 10.56, caso5).correcto).toBe(true);
    const tantoPorUno = comprobarRespuesta(0.1056, 10.56, caso5);
    expect(tantoPorUno.correcto).toBe(false);
    expect(tantoPorUno.motivo).toContain('tanto por uno');
    // En una pregunta que no es un porcentaje (la z del caso 4) no hay aviso de unidad
    expect(comprobarRespuesta(0.1056, 10.56, CASOS[3].datos).motivo).not.toContain('tanto por uno');
    expect(comprobarRespuesta(NaN, 10.56, caso5).motivo).toContain('Escribe un número');
    expect(comprobarRespuesta(12, 10.56, caso5).correcto).toBe(false);
    // Sospecha confirmada y reparada (29/09/2026): el tanto por uno REDONDEADO a dos decimales
    // (0,02 para el 2,28 % del caso 6) recibía «No es correcto. Te has desviado 2,26» sin aviso
    // de unidad. Ahora lleva el aviso, sin darle una cifra que no es la pedida.
    const redondeado = comprobarRespuesta(0.02, CASOS[5].respuesta, CASOS[5].datos);
    expect(redondeado.correcto).toBe(false);
    expect(redondeado.motivo).toContain('tanto por uno');
    expect(redondeado.motivo).not.toContain('(2,00)');
    // …y un porcentaje de verdad equivocado (2 en vez de 2,28) no recibe el aviso de unidad
    expect(comprobarRespuesta(2, CASOS[5].respuesta, CASOS[5].datos).motivo).not.toContain('tanto por uno');
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
    expect(comprobarRespuesta(493.4, CASOS[9].respuesta, CASOS[9].datos).correcto).toBe(true);
    expect(comprobarRespuesta(493.44, CASOS[9].respuesta, CASOS[9].datos).correcto).toBe(true);
    // Caso 1: Φ(1,25) = 0,8944 → 89,44 (y la exacta 0,894350, que redondea a 89,44)
    expect(comprobarRespuesta(89.44, CASOS[0].respuesta, CASOS[0].datos).correcto).toBe(true);
    // Caso 7 con la tabla: 78,88
    expect(comprobarRespuesta(78.88, CASOS[6].respuesta, CASOS[6].datos).correcto).toBe(true);
  });
});

test.describe('re-inspección 29/09/2026 · hallazgos REPARADOS el 29/09/2026', () => {
  test('REPARADO (2420) · caso 10: la tolerancia ya no acepta cuantiles equivocados', () => {
    // REPARADO el 29/09/2026: la tolerancia del cuantil es σ·0,01 + media décima = 0,09 mL (antes
    // el 1 % de x, 4,93 mL = 1,23σ). Las lecturas de tabla −1,64 y −1,65 siguen entrando (test
    // «la tabla Z da la misma respuesta» y la guarda de más arriba).
    // Esperado a mano: el 5 % inferior es z = −1,6449 → 493,4 mL. Estas NO son esa respuesta:
    //   496,0 = 500 − 1·4    → z = −1, el percentil 15,87 (Φ(−1) = 1 − 0,8413)
    //   492,2 = 500 − 1,96·4 → confunde la cola del 5 % con el intervalo bilateral del 95 %
    //   492,0 = 500 − 2·4    → z = −2, el percentil 2,28
    expect(comprobarRespuesta(496, CASOS[9].respuesta, CASOS[9].datos).correcto, '496 (z = −1)').toBe(false);
    expect(comprobarRespuesta(492.2, CASOS[9].respuesta, CASOS[9].datos).correcto, '492,2 (z = −1,96)').toBe(false);
    expect(comprobarRespuesta(492, CASOS[9].respuesta, CASOS[9].datos).correcto, '492 (z = −2)').toBe(false);
  });

  test('REPARADO (2421) · caso 1: la tolerancia ya no acepta la fila equivocada de la tabla (Φ(1,30) = 90,32)', () => {
    // REPARADO el 29/09/2026: tolerancia de 0,015 puntos (dos Φ de tabla a cuatro decimales y el
    // redondeo a dos), antes el 1 % de 89,44 = 0,89 puntos.
    // P(Z < 1,25) = Φ(1,25) = 0,8944 → 89,44 %. Leer la fila 1,3 en vez de la 1,2 con la
    // columna 0,05 da Φ(1,30) = 0,9032 → 90,32 %: diferencia 0,88 < tolerancia 0,8944.
    expect(comprobarRespuesta(90.32, CASOS[0].respuesta, CASOS[0].datos).correcto).toBe(false);
    // Caso 2 con la columna vecina: Φ(0,76) = 0,7764 → 77,64 en vez de Φ(0,75) = 77,34
    expect(comprobarRespuesta(77.64, CASOS[1].respuesta, CASOS[1].datos).correcto).toBe(false);
    // …y la columna vecina en el caso 1: Φ(1,26) = 0,8962 → 89,62
    expect(comprobarRespuesta(89.62, CASOS[0].respuesta, CASOS[0].datos).correcto).toBe(false);
  });

  test('REPARADO (2422) · al entrar en «Problemas tipo» se carga «Alturas de adultos», el problema marcado', async ({ page }) => {
    // REPARADO el 29/09/2026: cambiarModo('problema') carga el problema activo.
    await page.getByRole('button', { name: /Problemas tipo/ }).click();
    const alturas = page.getByRole('button', { name: 'Alturas de adultos' });
    await expect(alturas).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('¿Qué % de hombres miden más de 185 cm?')).toBeVisible();
    // Lo que responde a esa pregunta: z = 9/7 → 9,93 % (ver la cabecera de esta sección).
    // Obtenido: «P(-1,00 < X < 1,00)» y 68,27 %, la respuesta a otra pregunta.
    await expect(probLabel(page)).toHaveText('P(X > 185,00)', { timeout: 3000 });
    await expect(probValueLarge(page)).toHaveText('9,93 %', { timeout: 3000 });
    // La etiqueta de μ y el deslizador cuentan lo mismo (antes: «0,0» con el deslizador en 141)
    await expect(etiquetaMedia(page)).toContainText('176,0');
    await expect(page.locator(MEDIA)).toHaveValue('176');
  });

  test('REPARADO (2423) · volver a «Probabilidad» con un problema cargado ya no desincroniza μ', async ({
    page,
  }) => {
    // REPARADO el 29/09/2026: el recorrido de μ y σ sale del problema CARGADO, no del modo, así
    // que μ = 100 y σ = 15 caben al volver a «Probabilidad» y DOM y estado coinciden.
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
    // Más estricto que «a lo sumo un paso» (que también pasa si la flecha no hace nada): μ = 100
    // cabía, así que la flecha da EXACTAMENTE 99, y el DOM y la etiqueta coinciden.
    expect(antes).toBe(100);
    await expect(page.locator(MEDIA)).toHaveValue('99');
    await expect(etiquetaMedia(page)).toContainText('99,0');
    // El caso gemelo de σ: 15 → una flecha → 14,95 (paso 0,05), no 2,95.
    await page.locator(SIGMA).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(sigmaInput(page)).toHaveValue('14.95');
    await expect(page.locator('[class*="controlLabel"]').filter({ hasText: 'Desviación típica' })).toContainText(
      '14,95',
    );
    // En la regla 68-95-99,7 el recorrido es el mismo: μ = 99 sigue dentro y sin acotar.
    await page.getByRole('button', { name: /^Regla 68-95-99\.7/ }).click();
    await expect(page.locator(MEDIA)).toHaveValue('99');
    await expect(page.locator(MEDIA)).toHaveAttribute('min', '25');
    await expect(page.locator(MEDIA)).toHaveAttribute('max', '175');
    // Y se puede volver a la N(0, 1) con su recorrido de partida, sin salto.
    await page.getByRole('button', { name: 'Volver a la normal estándar N(0, 1)' }).click();
    await expect(page.locator(MEDIA)).toHaveAttribute('min', '-5');
    await expect(page.locator(MEDIA)).toHaveValue('0');
    await expect(sigmaInput(page)).toHaveValue('1');
    await expect(page.getByRole('button', { name: 'Volver a la normal estándar N(0, 1)' })).toHaveCount(0);
  });

  test('REPARADO (2424) · botones activos y números de paso sobre --primary-boton (claro y oscuro)', async ({
    page,
  }) => {
    // REPARADO el 29/09/2026: .tipoBtnActive, .problemaBtnActive y .stepNumber usan --primary-boton.
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
    // Bajo la marca Stemum (la app es de su parrilla): el acta midió 2,21:1 en oscuro (#fff sobre
    // #c99bf5). El layout del portal pone data-brand en <html>; aquí se simula igual, y se mide
    // en los dos temas porque --primary-boton de Stemum no cambia con el tema.
    await page.evaluate(() => document.documentElement.setAttribute('data-brand', 'stemum'));
    for (const tema of ['light', 'dark'] as const) {
      await activarTema(page, tema);
      fallos.push(
        ...(await suspensos(page, `stemum ${tema}`, {
          'botón de tipo activo': '[class*="tipoBtnActive"]',
          'problema tipo activo': '[class*="problemaBtnActive"]',
          'número de paso (texto grande)': '[class*="stepNumber"]',
          'valor de μ en su etiqueta': '[class*="controlLabel"] strong',
          'título de paso': '[class*="stepContent"] strong',
        })),
      );
    }
    expect(fallos).toEqual([]);
  });

  test('REPARADO (2425) · texto de marca con --primary-texto: valores de μ/σ/a/b y títulos educativos', async ({
    page,
  }) => {
    // REPARADO el 29/09/2026: .controlLabel strong, .stepContent strong, .faqItem h4,
    // .scenarioCard strong, .tipCard strong y los valores del panel usan --primary-texto.
    await prepararParaMedir(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const fallos: string[] = [];
    // En los dos temas: al drenar un token en uno hay que medir el otro.
    for (const tema of ['light', 'dark'] as const) {
      await activarTema(page, tema);
      fallos.push(
        ...(await suspensos(page, tema, {
          'valor de μ en su etiqueta': '[class*="controlLabel"] strong',
          'título de paso': '[class*="stepContent"] strong',
          'pregunta frecuente': '[class*="faqItem"] h4',
          escenario: '[class*="scenarioCard"] strong',
          'buena práctica': '[class*="tipCard"] strong',
        })),
      );
    }
    expect(fallos).toEqual([]);
  });

  test('REPARADO (2426) · el % del panel y del bloque educativo va tras un espacio duro', async ({ page }) => {
    // REPARADO el 29/09/2026: fmtProb usa formatPercentage (U+00A0) y el bloque educativo también.
    // Por defecto P(−1 < X < 1) = 68,27 %: el % debe ir tras un espacio DURO (U+00A0)
    const texto = (await probValueLarge(page).textContent()) ?? '';
    expect(texto).toBe('68,27 %');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    // Solo el bloque educativo de ESTA app (título → cabecera → contenedor), no el pie ni las
    // tarjetas de apps relacionadas: «(95%)», «el 68%», «el 95%», «el 99,7%», «el 10%».
    const bloque = page
      .getByRole('heading', { name: /Aprende sobre la Distribución Normal/ })
      .locator('xpath=ancestor::div[2]');
    const textoBloque = await bloque.innerText();
    const pegados = textoBloque.match(/\d%/g) ?? [];
    expect(pegados).toEqual([]);
    // Ni con espacio normal: todo número seguido de % lleva U+00A0
    expect(textoBloque.match(/\d %/g) ?? []).toEqual([]);
  });

  test('REPARADO (2427) · caso 11: la solución dice lo que da la resta con los valores de la tabla', async ({ page }) => {
    // REPARADO el 29/09/2026: tras «= 0,0455» exacto, un paso con 1 − (0,9772 − 0,0228) = 0,0456 y
    // 2000 · 0,0456 = 91,20, que redondeado a unidades también da 91.
    // Con los valores de tabla que la propia solución enseña: 1 − (0,9772 − 0,0228) = 0,0456 y
    // 2000 · 0,0456 = 91,20. La solución escribe «= 0,0455» y «= 91,00», sin la nota de redondeo.
    await seccionCasos(page).getByRole('button', { name: 'Caso 11: Tornillos rechazados en un lote' }).click();
    await seccionCasos(page).getByRole('button', { name: 'Ver solución' }).click();
    const solucion = seccionCasos(page).locator('#casos-solucion');
    await expect(solucion).toContainText('Φ(2,00) = 0,9772');
    await expect(solucion).toContainText(/0,0456|redondeados de la tabla/, { timeout: 3000 });
    await expect(solucion).toContainText('1 − (0,9772 − 0,0228) = 0,0456');
    await expect(solucion).toContainText('2000 · 0,0456 = 91,20');
    await expect(solucion).toContainText('Respuesta: 91');
  });

  test('REPARADO (2428) · los tres botones de modo llevan type="button"', async ({ page }) => {
    // REPARADO el 29/09/2026.
    for (const nombre of [/^Probabilidad/, /^Regla 68-95-99\.7/, /^Problemas tipo/]) {
      await expect(page.getByRole('button', { name: nombre })).toHaveAttribute('type', 'button', {
        timeout: 3000,
      });
    }
  });
});

test.describe('reparación 29/09/2026 · sospechas del bloque educativo confirmadas', () => {
  test('el consejo de la cola de 197 cm y el ejemplo del paso 5 cuadran con la tabla', async ({ page }) => {
    // N(176, 7): 197 = μ + 3σ → 1 − Φ(3) = 1 − 0,99865 = 0,00135 → 0,13 % (Simpson), no el 0,15 %
    // que sale de redondear la regla 99,7. Y 0,1587 = 1 − Φ(1) es la cola de 183 = μ + σ, no de
    // 185 (que es 9,93 %, el problema tipo «Alturas de adultos» de la propia app).
    expect(r4(1 - phiIndependiente(3))).toBe(0.0013);
    expect(r4(1 - phiIndependiente(1))).toBe(0.1587);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const bloque = page
      .getByRole('heading', { name: /Aprende sobre la Distribución Normal/ })
      .locator('xpath=ancestor::div[2]');
    await expect(bloque).toContainText('0,13 % mide más de 197 cm');
    await expect(bloque).toContainText('15,87 % de los hombres mide más de 183 cm');
    await expect(bloque).not.toContainText('15,87 % de los hombres mide más de 185 cm');
    // La tabla comparativa con coma decimal
    await expect(bloque).toContainText('[−0,02; 0,02]');
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

/*
 * ═════════════════════════════════════════════════════════════════════════════════════════
 * CABO C0367 (03/11/2026) — los rgba(46, 134, 171, …) y el #2E86AB fijos, medidos en
 * meskeia.com y bajo stemum.com, en claro y en oscuro, contra el fondo compuesto real.
 *
 * INVENTARIO (page.tsx y el .module.css; CasosAula.tsx no tiene ninguno)
 *   lienzo · #2E86AB, trazo de la curva (2,5 px) · rgba(…, 0,35), área de la probabilidad ·
 *            rgba(…, 0,15 / 0,30 / 0,50), las tres zonas de la regla 68-95-99,7. El color del
 *            lienzo no depende de la marca: se pinta igual en los dos dominios.
 *   CSS    · fondo de .modeBtnActive (0,1; 0,2 en oscuro), .problemaCard (0,08; 0,15),
 *            .resultCardMain (0,1; 0,18) y de la fila de .tabla con el ratón (0,05; 0,12).
 *
 * MEDIDO
 *   Texto sobre los tintes: el peor es la descripción del modo activo en claro, #666666 sobre
 *     #E6EEF2 = 4,90:1. El valor grande del resultado (40 px/800, umbral 3): 4,85 claro y 4,04
 *     oscuro en meskeia; 7,74 y 5,11 en stemum. El resto, de 5,10 a 16,40. Todo cumple.
 *   Curva #2E86AB sobre el lienzo (#FAFAFA claro, #1A1A1A oscuro): 3,93:1 y 4,24:1 (≥ 3).
 *   Área sombreada 1,53 / 1,58:1 y zonas de la regla 1,19-1,59:1 frente a su vecina: bajo 3:1,
 *     pero no son objeto NECESARIO (1.4.11): la región la delimitan la curva y las líneas a/b
 *     (o las de ±kσ), y lo que dice va en texto en el panel (P(−1,00 < X < 1,00) = 68,27 %; en
 *     la regla, los tres porcentajes con su intervalo). No es hallazgo de contraste.
 *   Fuera de marca bajo stemum.com: la curva (tono 198°), el área, las zonas y los cuatro
 *     tintes (tono 194-200°) siguen en el azul de meskeIA, mientras los deslizadores, el botón
 *     de tipo activo, los valores y el BORDE de esas mismas tarjetas van en violeta (#6B21A8
 *     claro, #C99BF5 oscuro, tono 271-273°): una tarjeta azul con marco violeta y una gráfica
 *     azul en una página violeta. Hallazgo contenido/bajo.
 * ═════════════════════════════════════════════════════════════════════════════════════════
 */

const PORTALES_C0367 = [
  ['meskeia.com', RUTA],
  ['stemum.com', `http://stemum.com${RUTA}`],
] as const;

/** Abre la app en el portal y el tema pedidos, hidratada y con el lienzo ya repintado. */
async function abrirC0367(page: Page, url: string, tema: 'light' | 'dark'): Promise<void> {
  await page.goto(url);
  await expect(page.locator('canvas')).toBeVisible();
  await esperarHidratacion(page, DESLIZADORES);
  await prepararParaMedir(page);
  await activarTema(page, tema);
  // El lienzo se repinta al cambiar data-theme (MutationObserver): dos fotogramas bastan.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** Fondo compuesto (capas rgba de la caja y sus antepasados, hasta la primera opaca). */
async function fondoC0367(page: Page, selector: string): Promise<number[]> {
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
        const k = leer(getComputedStyle(n).backgroundColor);
        if (k[3] > 0) {
          capas.push(k);
          if (k[3] >= 1) break;
        }
      }
      let fondo = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) {
        const [r, g, b, a] = capas[i];
        fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
      }
      return fondo;
    });
}

/**
 * Tres muestras del lienzo con N(0, 1), el estado de partida, compuestas sobre su fondo real
 * (el <canvas> es transparente). Geometría de `dibujar()`: márgenes 20/20/20/40 y rango
 * μ ± 4,5σ = [−4,5; 4,5].
 *   curva · el píxel más opaco de la columna x = −2,5 (lejos de a, b, μ y de las marcas del eje)
 *   área  · x = −0,5, 10 px sobre el eje: dentro de P(−1 < X < 1), o de la zona ±1σ en la regla
 */
async function lienzoC0367(page: Page): Promise<{ fondo: number[]; curva: number[]; area: number[] }> {
  return page.locator('canvas[aria-label="Gráfica de la distribución normal"]').evaluate((nodo) => {
    const c = nodo as HTMLCanvasElement;
    const leer = (s: string): number[] => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0, 0];
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    };
    const capas: number[][] = [];
    for (let n: Element | null = c; n; n = n.parentElement) {
      const k = leer(getComputedStyle(n).backgroundColor);
      if (k[3] > 0) {
        capas.push(k);
        if (k[3] >= 1) break;
      }
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const ctx = c.getContext('2d');
    if (!ctx) return { fondo, curva: fondo, area: fondo };
    const caja = c.getBoundingClientRect();
    const k = c.width / caja.width;
    const xPx = (x: number) => 20 + ((x + 4.5) / 9) * (caja.width - 40);
    // getImageData devuelve el color SIN premultiplicar: se compone con su alfa sobre el fondo
    const sobreFondo = (d: Uint8ClampedArray, i: number) => {
      const a = d[i + 3] / 255;
      return [d[i] * a + fondo[0] * (1 - a), d[i + 1] * a + fondo[1] * (1 - a), d[i + 2] * a + fondo[2] * (1 - a)];
    };
    const columna = ctx.getImageData(Math.round(xPx(-2.5) * k), 0, 1, Math.floor((caja.height - 45) * k)).data;
    let mejor = 0;
    for (let i = 0; i < columna.length; i += 4) if (columna[i + 3] > columna[mejor + 3]) mejor = i;
    const punto = ctx.getImageData(Math.round(xPx(-0.5) * k), Math.round((caja.height - 50) * k), 1, 1).data;
    return { fondo, curva: sobreFondo(columna, mejor), area: sobreFondo(punto, 0) };
  });
}

function ratioC0367(x: number[], y: number[]): number {
  const lineal = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = (c: number[]) => 0.2126 * lineal(c[0]) + 0.7152 * lineal(c[1]) + 0.0722 * lineal(c[2]);
  const l1 = lum(x);
  const l2 = lum(y);
  return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
}

/** Tono HSL en grados; null si el color es un gris (no lleva marca ninguna). */
function tonoC0367(c: number[]): number | null {
  const [r, g, b] = c.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if ((max - min) * 255 < 6) return null;
  const d = max - min;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}

/** El azul de meskeIA (#2E86AB, tono 198°) y sus tintes compuestos, que salen a 194-200°. */
const esAzulMeskeia = (c: number[]) => {
  const t = tonoC0367(c);
  return t !== null && t >= 186 && t <= 210;
};
const hexC0367 = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

test.describe('cabo C0367 · los azules fijos, en meskeia.com y bajo stemum.com', () => {
  test('ningún texto sobre los tintes ni la curva quedan por debajo de su umbral (dos dominios, dos temas)', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const fallos: string[] = [];
    for (const [portal, url] of PORTALES_C0367) {
      for (const tema of ['light', 'dark'] as const) {
        await abrirC0367(page, url, tema);
        // Guarda del test de abajo (test.fail no distingue por qué falla): aquí se comprueba que
        // bajo stemum.com manda de verdad la marca, y que en meskeia.com no hay ninguna.
        expect(await page.locator('html').getAttribute('data-brand'), portal).toBe(
          portal === 'stemum.com' ? 'stemum' : null,
        );
        fallos.push(
          ...(await suspensos(page, `${portal} ${tema}`, {
            'nombre del modo activo': '[class*="modeBtnActive"] [class*="modeName"]',
            'descripción del modo activo': '[class*="modeBtnActive"] [class*="modeDesc"]',
            'enunciado de la probabilidad': '[class*="resultCardMain"] [class*="resultLabel"]',
            'probabilidad (texto grande)': '[class*="resultValueLarge"]',
            'probabilidad decimal': '[class*="resultDecimal"]',
          })),
        );
        // La curva es el objeto gráfico necesario: 3:1 contra el fondo real del lienzo
        // (medido 3,93:1 en claro y 4,24:1 en oscuro, igual en los dos portales).
        const l = await lienzoC0367(page);
        const r = ratioC0367(l.curva, l.fondo);
        if (r < 3) fallos.push(`${portal} ${tema} · curva: ${hexC0367(l.curva)} sobre ${hexC0367(l.fondo)} = ${r}:1 < 3`);
        await page.getByRole('button', { name: /^Problemas tipo/ }).click();
        fallos.push(
          ...(await suspensos(page, `${portal} ${tema}`, {
            'contexto del problema': '[class*="problemaContexto"]',
          })),
        );
      }
    }
    expect(fallos).toEqual([]);
  });

  test('bajo stemum.com la curva, el área, las zonas y los tintes ya no van en el azul de meskeIA', async ({
    page,
  }) => {
    test.fail(); // HALLAZGO ABIERTO (cabo C0367, 03/11/2026) [contenido/bajo]
    // ENTRADA stemum.com/simulador-distribucion-normal/, claro y oscuro: estado de partida
    //         P(−1 < X < 1), luego «Regla 68-95-99.7» y luego «Problemas tipo»
    // ESPERADO la curva, el área sombreada, las zonas de la regla y los fondos tintados en la
    //          marca de la página (violeta: --primary #6B21A8 en claro, #C99BF5 en oscuro, el
    //          mismo del borde de esas tarjetas) o neutros; ninguno en el azul de meskeIA
    // OBTENIDO (claro / oscuro) curva #2E86AB · área #B3D2DF / #21404D · zona ±1σ #6BA7C3 /
    //          #286480 · tarjeta del resultado #EAF3F7 / #2D3D44 · modo activo #E6EEF2 / #1E3037 ·
    //          tarjeta del problema #EEF5F8 / #2D3A40: las doce muestras a tono 198-199°, con el
    //          borde de esas tarjetas en violeta (tono 271-273°)
    test.setTimeout(90_000);
    const azules: string[] = [];
    for (const tema of ['light', 'dark'] as const) {
      await abrirC0367(page, `http://stemum.com${RUTA}`, tema);
      const l = await lienzoC0367(page);
      const muestras: Record<string, number[]> = {
        curva: l.curva,
        'área sombreada': l.area,
        'tarjeta del resultado': await fondoC0367(page, '[class*="resultCardMain"]'),
        'modo activo': await fondoC0367(page, '[class*="modeBtnActive"]'),
      };
      await page.getByRole('button', { name: /^Regla 68-95-99\.7/ }).click();
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      muestras['zona ±1σ de la regla'] = (await lienzoC0367(page)).area;
      await page.getByRole('button', { name: /^Problemas tipo/ }).click();
      muestras['tarjeta del problema'] = await fondoC0367(page, '[class*="problemaCard"]');
      for (const [nombre, c] of Object.entries(muestras)) {
        if (esAzulMeskeia(c)) azules.push(`${tema} · ${nombre}: ${hexC0367(c)} (tono ${tonoC0367(c)}°)`);
      }
    }
    expect(azules).toEqual([]);
  });
});
