import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
} from '../../app/calculadora-fracciones/casos';
import { analizar, textoFraccion, type Fraccion } from '../../lib/calculadoras/fracciones';

/**
 * Calculadora de Fracciones — casos de aula (skill /casos-aula-meskeia, tipo A con respuesta en
 * fracción) y comprobación en el navegador (PASO 4.bis de /nueva-app-meskeia).
 *
 * LAS 12 RESPUESTAS, CALCULADAS A MANO (nunca copiadas de la app):
 *    1  2/3 + 1/4                    m.c.m. 12 → 8/12 + 3/12                         = 11/12
 *    2  5/6 − 3/8                    m.c.m. 24 → 20/24 − 9/24                        = 11/24
 *    3  4/9 × 3/8                    12/72                                           = 1/6
 *    4  6/7 ÷ 3/14                   6/7 × 14/3 = 84/21                              = 4
 *    5  84/126                       m.c.d. 42                                       = 2/3
 *    6  1/6 − 3/4                    2/12 − 9/12                                     = −7/12
 *    7  1/3 + 2/5 × 5/6              1/3 + 1/3                                       = 2/3
 *    8  (3/4 − 1/2) ÷ 5/8            1/4 × 8/5 = 8/20                                = 2/5
 *    9  (2/3)² − 1/9                 4/9 − 1/9 = 3/9                                 = 1/3
 *   10  pizza: 1 − 3/8 − 1/4         8/8 − 3/8 − 2/8                                 = 3/8
 *   11  tandas: 4 ÷ 2/3              4 × 3/2 = 12/2                                  = 6
 *   12  camino: 1 − 2/5 − 1/3·(3/5)  3/5 − 1/5                                       = 2/5
 *
 * CONVENIO FIJADO (invariante 7): la jerarquía. En el caso 7, sumar antes de multiplicar da
 * 11/18; el corrector debe suspenderlo. Y el corrector exige la IRREDUCIBLE: 2/6 en el caso 9 es
 * equivalente pero no vale, con su propio motivo.
 */

const A_MANO: Record<number, Fraccion> = {
  1: { num: 11, den: 12 },
  2: { num: 11, den: 24 },
  3: { num: 1, den: 6 },
  4: { num: 4, den: 1 },
  5: { num: 2, den: 3 },
  6: { num: -7, den: 12 },
  7: { num: 2, den: 3 },
  8: { num: 2, den: 5 },
  9: { num: 1, den: 3 },
  10: { num: 3, den: 8 },
  11: { num: 6, den: 1 },
  12: { num: 2, den: 5 },
};

/** Las fracciones escritas en una expresión, como se leerían en el enunciado. */
function literales(expresion: string): string[] {
  const a = analizar(expresion);
  if (!a.ok) return [];
  const r: string[] = [];
  const recorrer = (n: unknown) => {
    const nodo = n as { t: string; f?: Fraccion; a?: unknown; b?: unknown; x?: unknown; base?: unknown };
    if (nodo.t === 'num' && nodo.f) r.push(textoFraccion(nodo.f));
    for (const hijo of [nodo.a, nodo.b, nodo.x, nodo.base]) if (hijo) recorrer(hijo);
  };
  recorrer(a.arbol);
  return r;
}

test.describe('Casos para clase — invariantes (sin navegador)', () => {
  test('1 · hay exactamente 12 casos, con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · deterministas: dos lecturas dan lo mismo', async () => {
    const otra = await import('../../app/calculadora-fracciones/casos');
    expect(otra.CASOS.map((c) => [c.enunciado, c.respuestaTexto])).toEqual(CASOS.map((c) => [c.enunciado, c.respuestaTexto]));
  });

  test('3 · la respuesta declarada coincide con recalcularla desde los datos y con la cuenta a mano', () => {
    for (const c of CASOS) {
      const r = resolverCaso(c.datos, c.categoria);
      expect(r.ok, `caso ${c.id}`).toBe(true);
      if (!r.ok) continue;
      expect(r.valor, `caso ${c.id}`).toEqual(c.respuesta);
      expect(c.respuesta, `caso ${c.id} frente a la cuenta a mano`).toEqual(A_MANO[c.id]);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita, pista y desarrollo', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length, `caso ${c.id}`).toBeGreaterThan(20);
      expect(c.etiquetaRespuesta.trim(), `caso ${c.id}`).not.toBe('');
      expect(Number.isSafeInteger(c.respuesta.num) && Number.isSafeInteger(c.respuesta.den)).toBe(true);
      expect(c.pista.trim(), `caso ${c.id}`).not.toBe('');
      expect(c.pasos.length, `caso ${c.id}`).toBeGreaterThan(1);
      expect(c.pasos.join(' '), `caso ${c.id}`).not.toMatch(/Error|NaN|undefined/);
    }
  });

  test('4.bis · en los aplicados, cada fracción del planteamiento aparece en el enunciado', () => {
    for (const c of CASOS.filter((x) => x.categoria === 'aplicado')) {
      for (const lit of literales(c.datos.expresion)) {
        if (lit === '1') continue; // «la pizza entera», «el camino total»
        expect(c.enunciado, `caso ${c.id}: falta ${lit}`).toContain(lit);
      }
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad o una moneda', () => {
    const prohibido =
      /España|México|Colombia|Argentina|Chile|Perú|Madrid|Barcelona|Bogotá|Lima|euros?\b|dólar|pesos (mexicanos|colombianos|argentinos|chilenos)/i;
    for (const c of CASOS) {
      expect(`${c.titulo} ${c.enunciado}`, `caso ${c.id}`).not.toMatch(prohibido);
      expect(`${c.titulo} ${c.enunciado}`, `caso ${c.id}`).not.toMatch(/\bESO\b/);
    }
  });

  test('6 · el aleatorio es reproducible, variado y usa la misma aritmética', () => {
    expect(generarEjercicioAleatorio(7)).toEqual(generarEjercicioAleatorio(7));
    const respuestas = new Set<string>();
    const expresiones = new Set<string>();
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      respuestas.add(e.respuestaTexto);
      expresiones.add(e.datos.expresion);
      const r = resolverCaso(e.datos);
      expect(r.ok && r.valor).toEqual(e.respuesta);
      expect(e.respuesta.num).not.toBe(0);
      expect(Math.abs(e.respuesta.num)).toBeLessThanOrEqual(150);
      expect(e.respuesta.den).toBeLessThanOrEqual(144);
      expect(comprobarRespuesta(e.respuestaTexto, e.respuesta).correcto).toBe(true);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(expresiones.size).toBeGreaterThanOrEqual(30);
  });

  test('7 · convenio: la jerarquía manda y se exige la irreducible', () => {
    const c7 = CASOS[6];
    expect(comprobarRespuesta('11/18', c7.respuesta).correcto).toBe(false);
    expect(comprobarRespuesta('2/3', c7.respuesta).correcto).toBe(true);
    const c9 = CASOS[8];
    const sinSimplificar = comprobarRespuesta('3/9', c9.respuesta);
    expect(sinSimplificar.estado).toBe('sin-simplificar');
    expect(sinSimplificar.motivo).toContain('dividir entre 3');
  });
});

test.describe('Casos para clase — corrector', () => {
  const tres4: Fraccion = { num: 3, den: 4 };
  const menos7_12: Fraccion = { num: -7, den: 12 };
  const siete4: Fraccion = { num: 7, den: 4 };
  const cuatro: Fraccion = { num: 4, den: 1 };

  const TABLA: [string, Fraccion, string, boolean][] = [
    ['3/4', tres4, 'acierto', true],
    [' 3 / 4 ', tres4, 'acierto', true],
    ['6/8', tres4, 'sin-simplificar', false],
    ['0,75', tres4, 'decimal', false],
    ['0.75', tres4, 'decimal', false],
    ['0,7', tres4, 'fallo', false],
    ['−3/4', tres4, 'signo', false],
    ['4/3', tres4, 'inversa', false],
    ['2/4', tres4, 'fallo', false],
    ['', tres4, 'vacio', false],
    ['tres cuartos', tres4, 'no-valido', false],
    ['-7/12', menos7_12, 'acierto', true],
    ['−7/12', menos7_12, 'acierto', true],
    ['7/-12', menos7_12, 'acierto', true],
    ['7/12', menos7_12, 'signo', false],
    ['1 3/4', siete4, 'acierto', true],
    ['7/4', siete4, 'acierto', true],
    ['1 6/8', siete4, 'sin-simplificar', false],
    ['4', cuatro, 'acierto', true],
    ['4/1', cuatro, 'acierto', true],
    ['8/2', cuatro, 'sin-simplificar', false],
  ];
  for (const [texto, esperado, estado, correcto] of TABLA) {
    test(`«${texto}» frente a ${textoFraccion(esperado)} → ${estado}`, () => {
      const r = comprobarRespuesta(texto, esperado);
      expect(r.estado).toBe(estado);
      expect(r.correcto).toBe(correcto);
      expect(r.motivo).not.toMatch(/NaN|undefined/);
    });
  }
});

test.describe('Calculadora de Fracciones — en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-fracciones/');
    await esperarHidratacion(page, ['#fr-expresion']);
  });

  test('A · estado inicial: 2/3 + 1/4 × (5/6 − 1/2) = 3/4, con su paso a paso', async ({ page }) => {
    // A mano: 5/6 − 1/2 = 5/6 − 3/6 = 2/6 = 1/3 → 1/4 × 1/3 = 1/12 → 2/3 + 1/12 = 8/12 + 1/12 = 9/12 = 3/4
    const panel = page.locator('#panel-operar');
    await expect(panel.locator('dd').first()).toHaveText('3/4');
    await expect(panel).toContainText('= 2/3 + 1/4 × 1/3');
    await expect(panel).toContainText('= 2/3 + 1/12');
    await expect(panel).toContainText('= 3/4');
    await expect(panel).toContainText('0,75');
  });

  test('B · escribir una operación con un error muestra el motivo y ninguna cifra', async ({ page }) => {
    const caja = page.locator('#fr-expresion');
    await caja.fill('2/3^2');
    await esperarValorEnReact(page, caja, '2/3^2');
    const panel = page.locator('#panel-operar');
    await expect(panel.getByRole('alert')).toContainText('ambiguo');
    await expect(panel.locator('dd')).toHaveCount(0);
  });

  test('C · los botones de símbolos insertan en el cursor', async ({ page }) => {
    const caja = page.locator('#fr-expresion');
    await caja.fill('1');
    await esperarValorEnReact(page, caja, '1');
    await page.getByRole('button', { name: 'Insertar barra de fracción' }).click();
    await caja.press('End');
    await caja.pressSequentially('2');
    await page.getByRole('button', { name: 'Insertar suma' }).click();
    await caja.press('End');
    await caja.pressSequentially('1/3');
    await expect(caja).toHaveValue('1/2 + 1/3');
    await expect(page.locator('#panel-operar dd').first()).toHaveText('5/6');
  });

  test('C.bis · con los fotogramas lentos (carga), el cursor ya está en su sitio al teclear tras el botón', async ({ page }) => {
    // Cabo C0336: «C» falló en la suite entera con 4 workers y pasaba aislado. insertar()
    // colocaba el cursor en un requestAnimationFrame; si el fotograma llegaba después de que se
    // tecleara, el cursor volvía atrás y lo tecleado quedaba detrás. Aquí cada fotograma se
    // retrasa 300 ms, que es la carga hecha determinista: con la versión vieja daba «1/ + 21/3».
    await page.evaluate(() => {
      const original = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb: FrameRequestCallback) => {
        setTimeout(() => original(cb), 300);
        return 0;
      };
    });
    const caja = page.locator('#fr-expresion');
    await caja.fill('1');
    await esperarValorEnReact(page, caja, '1');
    await page.getByRole('button', { name: 'Insertar barra de fracción' }).click();
    await caja.pressSequentially('2');
    await page.getByRole('button', { name: 'Insertar suma' }).click();
    await caja.pressSequentially('1/3');
    await expect(caja).toHaveValue('1/2 + 1/3');
    await page.waitForTimeout(400); // ningún fotograma atrasado mueve ya nada
    await expect(caja).toHaveValue('1/2 + 1/3');
    await expect(page.locator('#panel-operar dd').first()).toHaveText('5/6');
  });

  test('D · simplificar 84/126 explica el m.c.d. 42 y da 2/3', async ({ page }) => {
    await page.getByRole('tab', { name: 'Simplificar' }).click();
    const panel = page.locator('#panel-simplificar');
    await expect(panel.locator('dd').first()).toHaveText('2/3');
    await expect(panel).toContainText('2 · 3 · 7 = 42');
  });

  test('E · caso 7: 11/18 se suspende y 2/3 se aprueba', async ({ page }) => {
    await page.getByRole('button', { name: /^Caso 7:/ }).click();
    const respuesta = page.locator('#casos-respuesta');
    await respuesta.fill('11/18');
    await esperarValorEnReact(page, respuesta, '11/18');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('Incorrecto');
    await respuesta.fill('2/3');
    await esperarValorEnReact(page, respuesta, '2/3');
    await page.locator('#casos-comprobar').click();
    await expect(page.locator('#casos-veredicto')).toContainText('¡Correcto!');
  });

  test('F · RelatedApps pinta 4 tarjetas', async ({ page }) => {
    const relacionadas = page.locator('section[aria-label="Aplicaciones relacionadas"]');
    await expect(relacionadas.locator('a')).toHaveCount(4);
    await expect(relacionadas.locator('a[href*="calculadora-mcd-mcm"]')).toHaveCount(1);
    await expect(relacionadas.locator('a[href*="generador-fichas-calculo"]')).toHaveCount(1);
  });
});
