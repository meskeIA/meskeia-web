import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada, leerValorEnReact, sembrarValor } from './_hidratacion';

/**
 * simulador-funciones-transformaciones · casos para clase (tarea de tipo C, 28/09/2026)
 *
 * PREDICCIÓN ANTES DE MOVER: el alumno se compromete con lo que le pasará a un rasgo de la
 * gráfica («¿hacia dónde se mueve el vértice?») antes de tocar el deslizador, y solo después
 * carga el escenario y lo mueve. La app es exploración pura —cuatro deslizadores sobre
 * f(x) = a·g(b·(x − c)) + d—, así que no se le piden cifras sino el efecto de un cambio.
 *
 * La respuesta de cada caso NO está escrita a mano: sale de EJECUTAR `evaluarTransformada`,
 * la misma función con la que el lienzo pinta la curva (se MOVIÓ de page.tsx a motor.ts sin
 * tocar una operación), sobre la ventana que enseña la app: x ∈ [−10, 10], y ∈ [−8, 8].
 *
 * CÓMO SE DERIVA CADA RESPUESTA ESPERADA (a mano, desde la definición):
 *   1 · (x − 3)²: el vértice pasa de x = 0 a x = c = 3                             → derecha
 *   2 · (x + 2)² es c = −2: el vértice pasa a x = −2 (el error clásico del signo)    → izquierda
 *   3 · |x − 2| + 1 → |x − 2| − 3: el vértice (2, d) baja de y = 1 a y = −3          → baja
 *   4 · 3x²: estirar no mueve el vértice, sigue en x = 0                             → no cambia
 *   5 · x² + 2 → −x² + 2 en x = 2: 4 + 2 = 6 → −4 + 2 = −2                          → baja
 *   6 · 2,5·sin(x): el máximo pasa de 1 a |a| + d = 2,5                             → sube
 *   7 · sin(x − 2): desplazar no cambia la altura, el máximo sigue en 1             → no cambia
 *   8 · sin(2x): crestas en π/4 + kπ; entre −10 y 10: −8,64, −5,50, −2,36, 0,79,
 *       3,93, 7,07 → 6, frente a las 3 de sin(x) (−4,71, 1,57, 7,85)               → más
 *   9 · cos(x/2): crestas en 4πk; entre −10 y 10 solo x = 0 → 1, frente a las 3 de
 *       cos(x) (−6,28, 0, 6,28)                                                      → menos
 *  10 · cos(−x) = cos(x): f(1) = 0,5403 en los dos (cos es par)                     → no cambia
 *  11 · sin(−x) = −sin(x): f(1) pasa de 0,8415 a −0,8415 (sin es impar)            → baja
 *  12 · √(x − 4): el dominio empieza en x = c = 4, no en 0                           → derecha
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  medirRasgo,
  opcionesDe,
  comprobarPrediccion,
  generarEjercicioAleatorio,
  type Respuesta,
} from '../../app/simulador-funciones-transformaciones/casos';
import { evaluarTransformada, construirEcuacion } from '../../app/simulador-funciones-transformaciones/motor';

const RUTA = '/simulador-funciones-transformaciones/';

const A_MANO: Readonly<Record<number, Respuesta>> = {
  1: 'aumenta',
  2: 'disminuye',
  3: 'disminuye',
  4: 'no-cambia',
  5: 'disminuye',
  6: 'aumenta',
  7: 'no-cambia',
  8: 'aumenta',
  9: 'disminuye',
  10: 'no-cambia',
  11: 'disminuye',
  12: 'aumenta',
};

const PARTIDA = { a: 1, b: 1, c: 0, d: 0 };

test.describe('simulador-funciones-transformaciones · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.respuesta).toBe(a.respuesta);
      expect(b.explicacion).toEqual(a.explicacion);
    }
  });

  test('3 · la respuesta declarada sale de ejecutar el modelo, no de una tabla', async () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(r.respuesta, `caso ${caso.id}`).toBe(caso.respuesta);
      // Y la dirección es el signo de lo que MIDE el modelo antes y después.
      const { funcion, antes, parametro, nuevoValor, rasgo, x0 } = caso.datos;
      const m0 = medirRasgo(funcion, antes, rasgo, x0);
      const m1 = medirRasgo(funcion, { ...antes, [parametro]: nuevoValor }, rasgo, x0);
      const signo: Respuesta = Math.abs(m1 - m0) < 1e-6 ? 'no-cambia' : m1 > m0 ? 'aumenta' : 'disminuye';
      expect(signo, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, tres opciones, explicación y pista', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      const opciones = opcionesDe(caso.datos.rasgo);
      expect(opciones.map((o) => o.valor).sort(), `caso ${caso.id}`).toEqual(['aumenta', 'disminuye', 'no-cambia']);
      for (const o of opciones) expect(o.etiqueta.trim()).not.toBe('');
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.enunciado, `caso ${caso.id}`).not.toMatch(/NaN|undefined/);
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?|Bachillerato|selectividad)\b/i;
    // La sigla va aparte y con mayúsculas: con /i, el pronombre «eso» la disparaba en falso.
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto), `caso ${caso.id}`).toBe(false);
    }
  });

  test('6 · el modo práctica es reproducible, variado en ESCENARIO y usa el mismo modelo', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    // Con tres respuestas posibles, «≥3 distintas» sería casi gratis: la variedad se mide
    // sobre el escenario (función + parámetro + rasgo), como en simulador-ecosistema-trofico.
    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    const escenarios = new Set(muestras.map((m) => `${m.datos.funcion}|${m.datos.parametro}|${m.datos.rasgo}`));
    expect(escenarios.size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.respuesta))).toEqual(new Set(['aumenta', 'disminuye', 'no-cambia']));
    for (const m of muestras) {
      const r = resolverCaso(m.datos);
      expect(r.ok, m.enunciado).toBe(true);
      expect(r.respuesta).toBe(m.respuesta);
    }
  });

  test('7 · un caso a mano por mecanismo: el modelo es el de la fórmula de la app', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO[caso.id]);
    }

    // (b) c desplaza a la DERECHA: el vértice de (x − 3)² está en x = 3.
    expect(evaluarTransformada('cuadratica', 1, 1, 3, 0, 3)).toBe(0);
    expect(medirRasgo('cuadratica', { ...PARTIDA, c: 3 }, 'x-vertice')).toBeCloseTo(3, 9);
    expect(construirEcuacion('cuadratica', 1, 1, -2, 0)).toContain('(x + 2)');

    // (c) b comprime: sin(x) enseña 3 crestas entre −10 y 10 y sin(2x) enseña 6;
    //     cos(x) enseña 3 y cos(x/2) solo 1.
    expect(medirRasgo('sin', PARTIDA, 'crestas')).toBe(3);
    expect(medirRasgo('sin', { ...PARTIDA, b: 2 }, 'crestas')).toBe(6);
    expect(medirRasgo('cos', PARTIDA, 'crestas')).toBe(3);
    expect(medirRasgo('cos', { ...PARTIDA, b: 0.5 }, 'crestas')).toBe(1);

    // (d) Paridad: cos(−1) = cos(1) y sin(−1) = −sin(1).
    expect(evaluarTransformada('cos', 1, -1, 0, 0, 1)).toBeCloseTo(Math.cos(1), 12);
    expect(evaluarTransformada('sin', 1, -1, 0, 0, 1)).toBeCloseTo(-Math.sin(1), 12);

    // (e) a estira el máximo y c no lo mueve: |a| + d.
    expect(medirRasgo('sin', { ...PARTIDA, a: 2.5 }, 'maximo')).toBeCloseTo(2.5, 4);
    expect(medirRasgo('sin', { ...PARTIDA, c: 2 }, 'maximo')).toBeCloseTo(1, 4);

    // (f) El dominio de √(x − 4) empieza en 4.
    expect(medirRasgo('raiz', { ...PARTIDA, c: 4 }, 'x-inicio')).toBeCloseTo(4, 9);
  });

  test('8 · lo que la pantalla no enseña no se pregunta, y corregir no lanza', async () => {
    // Un vértice fuera de la ventana (y > 8) no se puede observar: se rechaza.
    const fuera = resolverCaso({ funcion: 'cuadratica', antes: PARTIDA, parametro: 'd', nuevoValor: 9, rasgo: 'y-vertice' });
    expect(fuera.ok).toBe(false);
    // Un valor que no cae en la rejilla del deslizador (paso 0,1) tampoco.
    const rejilla = resolverCaso({ funcion: 'cuadratica', antes: PARTIDA, parametro: 'c', nuevoValor: 2.25, rasgo: 'x-vertice' });
    expect(rejilla.ok).toBe(false);
    // b = 0 no existe en la app.
    const bCero = resolverCaso({ funcion: 'sin', antes: PARTIDA, parametro: 'b', nuevoValor: 0, rasgo: 'crestas' });
    expect(bCero.ok).toBe(false);

    expect(comprobarPrediccion('aumenta', 'aumenta').correcto).toBe(true);
    expect(comprobarPrediccion('no-cambia', 'aumenta').correcto).toBe(false);
    expect(comprobarPrediccion(null, 'aumenta').correcto).toBe(false);
    expect(comprobarPrediccion('aumenta', null).correcto).toBe(false);
  });
});

test.describe('simulador-funciones-transformaciones · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#slider-c', 'section[aria-labelledby="casos-aula-titulo"] input[type="radio"]']);
  });

  test('predecir, comprobar, cargar y mover: el caso 1 de principio a fin', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 1:/ }).click();

    const comprobar = seccion(page).getByRole('button', { name: 'Comprobar' });
    await expect(comprobar).toBeDisabled(); // sin predicción no se comprueba
    await seccion(page).getByRole('radio', { name: 'Se desplaza a la derecha' }).check();
    await comprobar.click();
    await expect(seccion(page).getByRole('alert')).toContainText('Correcto');
    await expect(seccion(page)).toContainText('Por qué pasa');

    // Cambiamos antes la app para comprobar que cargar la devuelve a la partida del caso.
    await page.getByRole('button', { name: 'sin(x)', exact: true }).click();
    await seccion(page).getByRole('button', { name: /Cargar el escenario/ }).click();
    await expect(page.locator('#slider-c')).toHaveValue('0');

    // Y mover el deslizador c a 3 da la fórmula del enunciado.
    await sembrarValor(page, '#slider-c', '3');
    await expect(page.getByText('f(x) = (x − 3)²', { exact: true }).first()).toBeVisible();
  });

  test('una predicción equivocada se corrige con la opción buena y la explicación', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 4:/ }).click();
    await seccion(page).getByRole('radio', { name: 'Se desplaza a la derecha' }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    const veredicto = seccion(page).getByRole('alert');
    await expect(veredicto).not.toContainText('Correcto');
    await expect(veredicto).toContainText('No se mueve');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR 28/09/2026 — primera inspección (segmento cálculo, riesgo 3)
 *
 * QUÉ PROMETE
 *   <h1>: «📐 Simulador de Transformaciones de Funciones»; subtítulo: a, b, c y d transforman
 *   cualquier función base mediante f(x) = a · g(b·(x − c)) + d. Metadata: «Etiqueta dinámica
 *   con la ecuación completa en el canvas» y «Panel descriptivo con el efecto de cada parámetro
 *   en lenguaje natural». El bloque educativo explica traslación (c, d), dilatación (a, b) y
 *   reflexión (a < 0, b < 0).
 *
 * QUÉ SE COMPRUEBA EN EL LIENZO
 *   Ventana x ∈ [−10, 10], y ∈ [−8, 8], relleno {arriba 30, derecha 30, abajo 40, izquierda 50}
 *   (`dibujar` en page.tsx). La curva transformada es #2E86AB y el punto (c, d), #48A9A6.
 *   «Hay curva» en (x, y) = algún píxel a distancia de color < 20 en un radio de 2 px: la línea
 *   mide 2,5 px y su centro sale puro (distancia 0, medida); el teal está a 44 del azul, así que
 *   < 20 los separa. «No hay curva» = > 60, en puntos elegidos a ≥ 1 unidad (≈ 19 px en
 *   vertical) de la curva correcta: el defecto que vigilan es una curva desplazada una unidad o
 *   más, no el antialias de un borde.
 *
 * CASOS RESUELTOS A MANO (antes de ejecutar la app)
 *   N1 · x², a = 2, c = 3, d = −1 → 2(x − 3)² − 1: vértice (3, −1) = el punto (c, d);
 *        f(2) = f(4) = 2·1 − 1 = 1; f(1) = f(5) = 2·4 − 1 = 7. En (3, 1) no hay curva.
 *   N2 · sin, a = 2, b = 2, c = 1, d = 1: máximo 2 + 1 = 3 donde 2(x − 1) = π/2, x = 1 + π/4
 *        ≈ 1,7854; mínimo −2 + 1 = −1 en x = 1 + 3π/4 ≈ 3,3562; f(1) = 1. Con a = 1 el máximo
 *        estaría en y = 2, y ahí no debe haber curva.
 *   L1 · √, b = −1, c = 2, d = 1 → √(−(x − 2)) + 1 = √(2 − x) + 1, dominio x ≤ 2: f(1) = 2,
 *        f(−2) = √4 + 1 = 3, f(−7) = √9 + 1 = 4; la columna x = 4 no tiene ni un píxel azul.
 *   L2 · b = 0 no existe en la app: el deslizador lo cambia por 0,1 → f(x) = sin(0,1·x).
 *   L3 · x² con b = 2: (2·1)² = 4 en x = 1 (y no 2·1² = 2, que es lo de a = 2); con b = −1,
 *        (−2)² = 4 en x = 2: la parábola sigue abriéndose hacia ARRIBA.
 *   L4 · sin con b = −1: sin(−π/2) = −1 en x = π/2; la curva NO pasa por (π/2, 1).
 *   L5 · cos, c = 2, d = 1: el punto (c, d) = (2, 1) queda FUERA de la curva, que en x = 2 vale
 *        cos 0 + 1 = 2 y corta y = 1 en 2 ± π/2.
 *
 * CONTRASTE — los colores son literales en el código, así que se recalculan a mano (WCAG 2.x):
 *   luminancias: blanco 1 · #2E86AB 0,2057 · #48A9A6 0,3250 · #7FB3D3 0,4146 · #1A5278 0,0761
 *   · #2D2D2D (--bg-card oscuro) 0,0262.
 *   Blanco sobre #2E86AB 4,11 · #48A9A6 2,80 · #7FB3D3 2,26 · #1A5278 8,33.
 *   Sobre #2D2D2D: #2E86AB 3,35 · #48A9A6 4,92 · #7FB3D3 6,09 · #1A5278 1,65.
 *   Umbral: 3:1 si el texto mide ≥ 24 px, o ≥ 18,66 px en negrita (≥ 700); si no, 4,5:1. Se
 *   calcula en el navegador con el tamaño y el peso COMPUTADOS de cada elemento.
 *
 * HALLAZGOS ABIERTOS: marcados con `test.fail()`. Afirman lo que DEBERÍA pasar, así que hoy
 * fallan a propósito; al repararlos se les quita la marca y quedan como regresión.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Inspector 28/09/2026 — ecuación, lienzo, textos y contraste', () => {
  type Id = 'a' | 'b' | 'c' | 'd';
  type Rgb = readonly [number, number, number];
  interface Valores {
    a: number;
    b: number;
    c: number;
    d: number;
  }
  interface Medida {
    ratio: number;
    umbral: number;
  }

  const AZUL: Rgb = [46, 134, 171]; // #2E86AB, `colorTransf` de dibujar()
  const TEAL: Rgb = [72, 169, 166]; // #48A9A6, el punto (c, d)
  const ES_CURVA = 20;
  const NO_ES_CURVA = 60;

  const formula = (page: Page) => page.locator('[class*="ecuacionFormula"]');
  const lienzo = (page: Page) => page.locator('[class*="canvasWrapper"] canvas');
  const descripcion = (page: Page, id: Id) => page.locator('[class*="parametroItem"]').nth('abcd'.indexOf(id));

  async function abrir(page: Page, tema?: 'light' | 'dark'): Promise<void> {
    if (tema) {
      await page.addInitScript((t) => {
        try {
          localStorage.setItem('meskeia-theme', t);
        } catch {
          /* sin almacenamiento el tema no se puede fijar */
        }
      }, tema);
    }
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#slider-a', '#slider-b', '#slider-c', '#slider-d']);
    if (tema) {
      await esperarPaginaAsentada(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
    }
  }

  /** Mueve un deslizador solo si no está ya en `valor`: sembrar lo que ya hay no prueba nada. */
  async function fijar(page: Page, id: Id, valor: number): Promise<void> {
    const selector = `#slider-${id}`;
    if ((await leerValorEnReact(page, selector)) === String(valor)) return;
    await sembrarValor(page, selector, String(valor));
  }

  async function escenario(page: Page, funcion: string, v: Valores): Promise<void> {
    const boton = page.getByRole('button', { name: funcion, exact: true });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    for (const id of ['a', 'b', 'c', 'd'] as const) await fijar(page, id, v[id]);
  }

  async function textoDe(loc: Locator): Promise<string> {
    return ((await loc.textContent()) ?? '').replace(/\s+/g, ' ').trim();
  }

  /** Menor distancia de color a `rgb` en un radio de 2 px alrededor del punto matemático (x, y). */
  async function distanciaColor(page: Page, x: number, y: number, rgb: Rgb): Promise<number> {
    return lienzo(page).evaluate(
      (el, args) => {
        const cv = el as HTMLCanvasElement;
        const rect = cv.getBoundingClientRect();
        const dpr = cv.width / rect.width;
        const plotW = rect.width - 50 - 30;
        const plotH = rect.height - 30 - 40;
        const px = 50 + ((args.x + 10) / 20) * plotW;
        const py = 30 + ((8 - args.y) / 16) * plotH;
        const ctx = cv.getContext('2d');
        if (!ctx) return Infinity;
        let mejor = Infinity;
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            const d = ctx.getImageData(Math.round((px + dx) * dpr), Math.round((py + dy) * dpr), 1, 1).data;
            mejor = Math.min(mejor, Math.hypot(d[0] - args.rgb[0], d[1] - args.rgb[1], d[2] - args.rgb[2]));
          }
        }
        return mejor;
      },
      { x, y, rgb: [...rgb] },
    );
  }

  /** Píxeles del azul de la curva en toda la columna de la x matemática dada. */
  async function azulesEnColumna(page: Page, x: number): Promise<number> {
    return lienzo(page).evaluate(
      (el, args) => {
        const cv = el as HTMLCanvasElement;
        const rect = cv.getBoundingClientRect();
        const dpr = cv.width / rect.width;
        const px = Math.round((50 + ((args.x + 10) / 20) * (rect.width - 80)) * dpr);
        const ctx = cv.getContext('2d');
        if (!ctx) return -1;
        let n = 0;
        for (let py = 30; py < rect.height - 40; py++) {
          const d = ctx.getImageData(px, Math.round(py * dpr), 1, 1).data;
          if (Math.hypot(d[0] - args.azul[0], d[1] - args.azul[1], d[2] - args.azul[2]) < args.umbral) n++;
        }
        return n;
      },
      { x, azul: [...AZUL], umbral: NO_ES_CURVA },
    );
  }

  /** Contraste WCAG del texto contra su fondo REAL compuesto, y el umbral por tamaño computado. */
  async function medirContraste(elemento: Locator): Promise<Medida> {
    return elemento.evaluate((el) => {
      const aRgba = (c: string): number[] => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return [255, 255, 255, 1];
        const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
      };
      const mezclar = (arriba: number[], abajo: number[]): number[] => [
        arriba[0] * arriba[3] + abajo[0] * (1 - arriba[3]),
        arriba[1] * arriba[3] + abajo[1] * (1 - arriba[3]),
        arriba[2] * arriba[3] + abajo[2] * (1 - arriba[3]),
        1,
      ];
      const capas: number[][] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        const c = aRgba(getComputedStyle(n).backgroundColor);
        if (c[3] > 0) {
          capas.push(c);
          if (c[3] >= 1) break;
        }
      }
      let fondo = [255, 255, 255, 1];
      for (let i = capas.length - 1; i >= 0; i--) fondo = mezclar(capas[i], fondo);
      const estilo = getComputedStyle(el);
      const texto = mezclar(aRgba(estilo.color), fondo);
      const lum = (c: number[]): number => {
        const f = (x: number): number => {
          const s = x / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
      };
      const l1 = lum(texto);
      const l2 = lum(fondo);
      const px = parseFloat(estilo.fontSize);
      const peso = parseInt(estilo.fontWeight, 10);
      const grande = px >= 24 || (px >= 18.66 && peso >= 700);
      return { ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05), umbral: grande ? 3 : 4.5 };
    });
  }

  async function exigirContraste(nombre: string, elemento: Locator): Promise<void> {
    const m = await medirContraste(elemento);
    const cifra = (v: number) => v.toLocaleString('es-ES', { maximumFractionDigits: 2 });
    expect(m.ratio, `${nombre}: ${cifra(m.ratio)}:1 frente a ${cifra(m.umbral)}:1`).toBeGreaterThanOrEqual(m.umbral);
  }

  // ─────────────────────────────────────────────────────────── lo que está bien (candados)

  test('N1 · x² con a = 2, c = 3, d = −1: fórmula, vértice (3, −1) y puntos de la parábola', async ({ page }) => {
    await abrir(page);
    await escenario(page, 'x²', { a: 2, b: 1, c: 3, d: -1 });
    // aStr «2·», c > 0 → «(x − 3)», d < 0 → « − 1» (los dos con U+2212)
    await expect(formula(page)).toHaveText('f(x) = 2·(x − 3)² − 1');
    await expect(lienzo(page)).toHaveAttribute('aria-label', /f\(x\) = 2·\(x − 3\)² − 1$/);
    await expect.poll(() => distanciaColor(page, 3, -1, TEAL)).toBeLessThan(ES_CURVA); // (c, d) = vértice
    for (const [x, y] of [[2, 1], [4, 1], [1, 7], [5, 7]]) {
      expect(await distanciaColor(page, x, y, AZUL), `curva en (${x}, ${y})`).toBeLessThan(ES_CURVA);
    }
    expect(await distanciaColor(page, 3, 1, AZUL), 'el vértice no está en y = 1').toBeGreaterThan(NO_ES_CURVA);
    expect(await textoDe(descripcion(page, 'a'))).toContain('se estira verticalmente');
    expect(await textoDe(descripcion(page, 'c'))).toContain('3 unidades a la derecha');
    expect(await textoDe(descripcion(page, 'd'))).toContain('hacia abajo');
  });

  test('N2 · sin con a = 2, b = 2, c = 1, d = 1: máximo 3 en x = 1 + π/4 y mínimo −1 en x = 1 + 3π/4', async ({ page }) => {
    await abrir(page);
    await escenario(page, 'sin(x)', { a: 2, b: 2, c: 1, d: 1 });
    await expect(formula(page)).toHaveText('f(x) = 2·sin(2·(x − 1)) + 1');
    await expect.poll(() => distanciaColor(page, 1, 1, TEAL)).toBeLessThan(ES_CURVA); // f(1) = 1 = d
    expect(await distanciaColor(page, 1 + Math.PI / 4, 3, AZUL), 'máximo (1,7854; 3)').toBeLessThan(ES_CURVA);
    expect(await distanciaColor(page, 1 + (3 * Math.PI) / 4, -1, AZUL), 'mínimo (3,3562; −1)').toBeLessThan(ES_CURVA);
    expect(await distanciaColor(page, 1 + Math.PI / 4, 2, AZUL), 'con a = 2 el máximo no es 2').toBeGreaterThan(NO_ES_CURVA);
    expect(await textoDe(descripcion(page, 'b'))).toContain('se comprime horizontalmente');
  });

  test('L1 · √ con b = −1, c = 2, d = 1: √(2 − x) + 1, dominio x ≤ 2', async ({ page }) => {
    await abrir(page);
    await escenario(page, '√x', { a: 1, b: -1, c: 2, d: 1 });
    // El signo de b = −1 sale hoy como guion (U+002D); se admiten los dos para no atar este
    // candado a la tipografía.
    await expect(formula(page)).toHaveText(/^f\(x\) = √\([-−]\(x − 2\)\) \+ 1$/);
    await expect.poll(() => distanciaColor(page, 2, 1, TEAL)).toBeLessThan(ES_CURVA); // arranque (2, 1)
    for (const [x, y] of [[1, 2], [-2, 3], [-7, 4]]) {
      expect(await distanciaColor(page, x, y, AZUL), `curva en (${x}, ${y})`).toBeLessThan(ES_CURVA);
    }
    expect(await azulesEnColumna(page, 4), 'a la derecha de x = 2 no hay función').toBe(0);
    expect(await azulesEnColumna(page, -4), 'a la izquierda sí').toBeGreaterThan(0);
  });

  test('L2 · b = 0 no existe: el deslizador lo cambia por 0,1', async ({ page }) => {
    await abrir(page);
    await sembrarValor(page, '#slider-b', '0', { esperado: '0.1' });
    await expect(formula(page)).toHaveText('f(x) = sin(0,1·x)');
    await expect(page.locator('[class*="paramTag"]').nth(1)).toHaveText('b = 0,1');
  });

  test('L3 · el lienzo dibuja (b·x)² con b y a·x² con a: son curvas distintas', async ({ page }) => {
    await abrir(page);
    await escenario(page, 'x²', { a: 1, b: 2, c: 0, d: 0 });
    await expect.poll(() => distanciaColor(page, 1, 4, AZUL)).toBeLessThan(ES_CURVA); // (2·1)² = 4
    expect(await distanciaColor(page, 1, 2, AZUL)).toBeGreaterThan(NO_ES_CURVA);
    await escenario(page, 'x²', { a: 2, b: 1, c: 0, d: 0 });
    await expect.poll(() => distanciaColor(page, 1, 2, AZUL)).toBeLessThan(ES_CURVA); // 2·1² = 2
    expect(await distanciaColor(page, 1, 4, AZUL)).toBeGreaterThan(NO_ES_CURVA);
    await escenario(page, 'x²', { a: 1, b: -1, c: 0, d: 0 });
    await expect.poll(() => distanciaColor(page, 2, 4, AZUL)).toBeLessThan(ES_CURVA); // (−2)² = 4
    expect(await distanciaColor(page, 2, -4, AZUL), 'b = −1 no voltea x²').toBeGreaterThan(NO_ES_CURVA);
  });

  test('L4 · sin con b = −1 dibuja −sin(x): en x = π/2 la curva está en −1', async ({ page }) => {
    await abrir(page);
    await escenario(page, 'sin(x)', { a: 1, b: -1, c: 0, d: 0 });
    await expect.poll(() => distanciaColor(page, Math.PI / 2, -1, AZUL)).toBeLessThan(ES_CURVA);
    expect(await distanciaColor(page, Math.PI / 2, 1, AZUL)).toBeGreaterThan(NO_ES_CURVA);
  });

  test('L5 · cos con c = 2, d = 1: el punto (2, 1) y la curva en (2, 2) y (2 + π/2, 1)', async ({ page }) => {
    await abrir(page);
    await escenario(page, 'cos(x)', { a: 1, b: 1, c: 2, d: 1 });
    await expect.poll(() => distanciaColor(page, 2, 1, TEAL)).toBeLessThan(ES_CURVA);
    expect(await distanciaColor(page, 2, 2, AZUL), 'f(2) = cos 0 + 1 = 2').toBeLessThan(ES_CURVA);
    expect(await distanciaColor(page, 2 + Math.PI / 2, 1, AZUL), 'cruce con y = d').toBeLessThan(ES_CURVA);
  });

  test('x² con b = 1 y c = 2 se escribe (x − 2)², sin paréntesis de más', async ({ page }) => {
    await abrir(page);
    await escenario(page, 'x²', { a: 1, b: 1, c: 2, d: 0 });
    await expect(formula(page)).toHaveText('f(x) = (x − 2)²');
  });

  // ─────────────────────────────────────────────────────────── hallazgos abiertos

  test('HALLAZGO · la ecuación de x² con b ≠ 1 y c = 0 describe otra función', async ({ page }) => {
    test.fail();
    // HALLAZGO ABIERTO (inspector 28/09/2026): `construirEcuacion` escribe el argumento de x² sin
    // paréntesis cuando c = 0, así que «b·x» elevado al cuadrado se lee b·x². Caso:
    //   x², b = 2 → dibuja (2x)² = 4x² (L3) · escribe «f(x) = 2·x²», IGUAL que con a = 2
    //   x², b = −1 → dibuja (−x)² = x², hacia arriba (L3) · escribe «f(x) = -x²», IGUAL que a = −1
    // Dos curvas distintas no pueden compartir fórmula.
    await abrir(page);
    await escenario(page, 'x²', { a: 1, b: 2, c: 0, d: 0 });
    const conB2 = await textoDe(formula(page));
    await escenario(page, 'x²', { a: 2, b: 1, c: 0, d: 0 });
    const conA2 = await textoDe(formula(page));
    await escenario(page, 'x²', { a: 1, b: -1, c: 0, d: 0 });
    const conBmenos1 = await textoDe(formula(page));
    await escenario(page, 'x²', { a: -1, b: 1, c: 0, d: 0 });
    const conAmenos1 = await textoDe(formula(page));
    expect(conB2, '(2x)² = 4x² frente a 2x²').not.toBe(conA2);
    expect(conBmenos1, '(−x)² = x² frente a −x²').not.toBe(conAmenos1);
  });

  test('HALLAZGO · paréntesis dobles en sin, cos, √ y |x| con b = 1 y c ≠ 0', async ({ page }) => {
    test.fail();
    // HALLAZGO ABIERTO (inspector 28/09/2026): con b = 1 el argumento ya trae su paréntesis
    // «(x − 2)» y el símbolo añade otro. Caso: sin, c = 2 → esperado «f(x) = sin(x − 2)» ·
    // obtenido «f(x) = sin((x − 2))»; √ → «√((x − 2))»; |x| → «|(x − 2)|». Los enunciados de
    // los casos 3, 7 y 12 de aula lo heredan (se construyen con la misma función).
    await abrir(page);
    for (const funcion of ['sin(x)', 'cos(x)', '√x']) {
      await escenario(page, funcion, { a: 1, b: 1, c: 2, d: 0 });
      expect(await textoDe(formula(page)), funcion).not.toContain('((');
    }
    await escenario(page, '|x|', { a: 1, b: 1, c: 2, d: 0 });
    expect(await textoDe(formula(page)), '|x|').not.toMatch(/\|\(/);
    for (const caso of CASOS) expect(caso.enunciado, `caso ${caso.id}`).not.toMatch(/\(\(|\|\(/);
  });

  test('HALLAZGO · el panel describe mal a con 0 < a < 1, a = 0 y a = −1', async ({ page }) => {
    test.fail();
    // HALLAZGO ABIERTO (inspector 28/09/2026): `descripcionA` trata todo a > 0 como estiramiento
    // y todo lo que no cae en (−1, 0) como «se estira y voltea». La tabla de la propia app dice
    // «comprime (0<|a|<1)». Casos:
    //   a = 0,5 → 0,5·sin(x) va de −0,5 a 0,5: se comprime · obtenido «…se estira verticalmente»
    //   a = 0   → 0·sin(x) = 0, recta y = d · obtenido «Amplitud ×0 con reflexión — se estira y voltea»
    //   a = −1  → |a| = 1, solo se voltea · obtenido «…se estira y voltea verticalmente»
    await abrir(page);
    await escenario(page, 'sin(x)', { a: 0.5, b: 1, c: 0, d: 0 });
    expect(await textoDe(descripcion(page, 'a')), 'a = 0,5').not.toContain('se estira');
    await escenario(page, 'sin(x)', { a: 0, b: 1, c: 0, d: 0 });
    expect(await textoDe(descripcion(page, 'a')), 'a = 0').not.toContain('reflexión');
    await escenario(page, 'sin(x)', { a: -1, b: 1, c: 0, d: 0 });
    expect(await textoDe(descripcion(page, 'a')), 'a = −1').not.toContain('se estira');
  });

  test('HALLAZGO · el panel dice que b = −1 estira, y «1 unidades»', async ({ page }) => {
    test.fail();
    // HALLAZGO ABIERTO (inspector 28/09/2026): con |b| = 1 `descripcionB` cae en la rama de
    // |b| < 1. Caso: b = −1 → esperado solo la reflexión · obtenido «Período ×1 — la gráfica se
    // estira horizontalmente con reflexión horizontal». Y c = 1 → «se desplaza 1 unidades».
    await abrir(page);
    await escenario(page, 'sin(x)', { a: 1, b: -1, c: 1, d: 0 });
    expect(await textoDe(descripcion(page, 'b')), 'b = −1').not.toContain('se estira');
    expect(await textoDe(descripcion(page, 'c')), 'c = 1').not.toContain('1 unidades');
  });

  for (const tema of ['light', 'dark'] as const) {
    const nombreTema = tema === 'light' ? 'claro' : 'oscuro';

    test(`HALLAZGO · contraste de las etiquetas «a = …», «b = …», «c = …» del panel (${nombreTema})`, async ({ page }) => {
      test.fail();
      // HALLAZGO ABIERTO (inspector 28/09/2026): `paramTag` pone texto blanco de 13,6 px en
      // negrita (umbral 4,5:1) sobre el fondo en línea de cada parámetro, igual en los dos
      // temas. Cabecera: a 4,11 · b 2,80 · c 2,26 · d 8,33 (este sí cumple).
      await abrir(page, tema);
      const etiquetas = page.locator('[class*="paramTag"]');
      await expect(etiquetas).toHaveCount(4);
      for (let i = 0; i < 4; i++) await exigirContraste(`etiqueta ${'abcd'[i]}`, etiquetas.nth(i));
    });

    test(`HALLAZGO · contraste de las letras de color de a, b, c, d (${nombreTema})`, async ({ page }) => {
      test.fail();
      // HALLAZGO ABIERTO (inspector 28/09/2026): las letras de los deslizadores (19,2 px, peso
      // 800 → texto grande, 3:1) y las de la tabla educativa (14,4 px → 4,5:1) llevan el color
      // en línea. Claro: deslizador b 2,80 y c 2,26; tabla a 4,11, b 2,80, c 2,26.
      // Oscuro (sobre #2D2D2D): deslizador d 1,65; tabla a 3,35 y d 1,65.
      await abrir(page, tema);
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      const letras = page.locator('[class*="paramName"]');
      await expect(letras).toHaveCount(4);
      const tabla = page.locator('table[class*="tabla"] tbody td strong');
      for (let i = 0; i < 4; i++) {
        await exigirContraste(`deslizador ${'abcd'[i]}`, letras.nth(i));
        await exigirContraste(`tabla ${'abcd'[i]}`, tabla.nth(i));
      }
    });

    test(`HALLAZGO · texto pequeño en var(--primary) por debajo de 4,5:1 (${nombreTema})`, async ({ page }) => {
      test.fail();
      // HALLAZGO ABIERTO (inspector 28/09/2026): el color de marca como TEXTO pequeño. Medido en
      // claro: valor del deslizador (16 px) 4,11 · botón de función activo (14,4 px) 3,42 ·
      // «Restablecer todo» 4,11 · «— Función transformada f(x)» 3,93 · preguntas del FAQ 3,93.
      // En oscuro solo la leyenda: 4,36.
      await abrir(page, tema);
      await page.getByRole('button', { name: 'Ver guía educativa' }).click();
      await exigirContraste('valor del deslizador a', page.locator('[class*="sliderValue"]').first());
      await exigirContraste(
        'botón activo sin(x)',
        page.getByRole('button', { name: 'sin(x)', exact: true }).locator('[class*="funcLabel"]'),
      );
      await exigirContraste('Restablecer todo', page.getByRole('button', { name: 'Restablecer todos los parámetros' }));
      await exigirContraste('leyenda de la transformada', page.locator('[class*="leyendaTransf"]'));
      await exigirContraste('pregunta del FAQ', page.locator('[class*="faqItem"] h4').first());
    });
  }

  test('HALLAZGO · las cinco 💡 de los trucos del FAQ no llevan aria-hidden', async ({ page }) => {
    test.fail();
    // HALLAZGO ABIERTO (inspector 28/09/2026): los cinco <p> de `faqTip` empiezan con «💡» como
    // texto suelto, junto a texto; el lector de pantalla lee «bombilla» delante de cada truco.
    await abrir(page);
    const trucos = page.locator('p[class*="faqTip"]');
    await expect(trucos).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      expect(await trucos.nth(i).locator('[aria-hidden="true"]', { hasText: '💡' }).count(), `truco ${i + 1}`).toBe(1);
    }
  });

  test('HALLAZGO · el FAQ «¿Y si b es negativo?» contradice lo que se dibuja', async ({ page }) => {
    test.fail();
    // HALLAZGO ABIERTO (inspector 28/09/2026): dice que con sin y cos «la reflexión no cambia la
    // forma visual» y que en «la parábola asimétrica sí se aprecia el cambio». Caso: sin, b = −1
    // → la curva pasa por (π/2, −1) y no por (π/2, 1) (L4): sí cambia; y x² es simétrica, como
    // dice el propio truco de debajo («b=−1 no cambia la gráfica»). El recuadro de errores
    // frecuentes y el caso 11 de aula dicen lo contrario que este párrafo.
    await abrir(page);
    await escenario(page, 'sin(x)', { a: 1, b: -1, c: 0, d: 0 });
    await expect.poll(() => distanciaColor(page, Math.PI / 2, -1, AZUL)).toBeLessThan(ES_CURVA);
    const faq = page.locator('[class*="faqItem"]').filter({ hasText: '¿Y si b es negativo?' });
    const texto = await textoDe(faq);
    expect(texto).not.toContain('parábola asimétrica');
    expect(texto).not.toMatch(/sin y cos, la reflexión no cambia la forma visual/);
  });

  test('HALLAZGO · «el signo que ves en la fórmula es la dirección» enseña el error clásico', async ({ page }) => {
    test.fail();
    // HALLAZGO ABIERTO (inspector 28/09/2026): el truco «El signo de c…» pide leer la dirección
    // en el signo que se ve. Caso: c = −2 → la app escribe «(x + 2)²» (se ve «+») y el vértice
    // se dibuja en x = −2, a la IZQUIERDA. La pista del caso 2 de aula dice justo lo contrario.
    await abrir(page);
    await escenario(page, 'x²', { a: 1, b: 1, c: -2, d: 0 });
    await expect(formula(page)).toHaveText('f(x) = (x + 2)²');
    await expect.poll(() => distanciaColor(page, -2, 0, TEAL)).toBeLessThan(ES_CURVA);
    const truco = page.locator('[class*="tipCard"]').filter({ hasText: 'El signo de c' });
    expect(await textoDe(truco)).not.toContain('el signo que ves en la fórmula es la dirección');
  });

  test('HALLAZGO · el paso 2 toma (c, d) como el cruce central también en cos', async ({ page }) => {
    test.fail();
    // HALLAZGO ABIERTO (inspector 28/09/2026): «…o el punto de cruce central (sin/cos). Ese punto
    // es (c, d)». En cos no: caso cos, c = 2, d = 1 → en x = c la curva está en su MÁXIMO
    // a + d = 2 (L5) y corta y = d en 2 ± π/2; quien siga el paso lee c desfasado π/2.
    await abrir(page);
    await escenario(page, 'cos(x)', { a: 1, b: 1, c: 2, d: 1 });
    await expect.poll(() => distanciaColor(page, 2, 2, AZUL)).toBeLessThan(ES_CURVA);
    const paso = page.locator('[class*="stepContent"]').filter({ hasText: 'Localiza el punto de referencia' });
    expect(await textoDe(paso)).not.toMatch(/cruce central \(sin\/cos\)/);
  });

  test('HALLAZGO · con las flechas, b no pasa de 0,1 a negativo', async ({ page }) => {
    test.fail();
    // HALLAZGO ABIERTO (inspector 28/09/2026): el deslizador cambia b = 0 por 0,1. Desde 0,1,
    // «←» pide 0 y la app lo devuelve a 0,1: por teclado no se cruza a −0,1 (solo con Re Pág o
    // Inicio, que saltan a −0,5 o −3). De −0,1 hacia la derecha sí salta a 0,1.
    // Caso: b = 0,2, «←» dos veces → esperado −0,1 · obtenido 0,1.
    await abrir(page);
    await sembrarValor(page, '#slider-b', '0.2');
    await page.locator('#slider-b').focus();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => leerValorEnReact(page, '#slider-b')).toBe('0.1');
    await page.keyboard.press('ArrowLeft');
    await expect
      .poll(async () => Number(await leerValorEnReact(page, '#slider-b')), { timeout: 2000 })
      .toBeLessThan(0);
  });
});
