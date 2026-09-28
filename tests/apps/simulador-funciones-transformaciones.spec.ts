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
import { evaluarTransformada, construirEcuacion, ajustarB, type FuncionBase } from '../../app/simulador-funciones-transformaciones/motor';

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
 * HALLAZGOS: nacieron marcados con `test.fail()` (afirmaban lo que DEBERÍA pasar). REPARADOS el
 * 28/09/2026 los doce: se les quitó la marca y quedan como regresión, con aserciones positivas
 * añadidas donde la ficha solo decía lo que NO debía salir.
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
    // El signo de b = −1 salía como guion (U+002D) hasta el 28/09/2026 y hoy es «−» (U+2212);
    // este candado admite los dos para no atarse a la tipografía (eso lo vigila el de 2340).
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

  // ─────────────────────────────────────────────────────────── hallazgos reparados (28/09/2026)

  /**
   * Evalúa la fórmula tal y como la ESCRIBE la app («f(x) = −2·(3·x)² + 1»), para compararla con
   * lo que DIBUJA el lienzo (`evaluarTransformada`). Es un analizador de la notación de la app, no
   * un traductor a JavaScript: lee lo que lee el alumno.
   *   suma      := producto ((« + » | « − ») producto)*      — el menos BINARIO va entre espacios
   *   producto  := unario («·» unario)*
   *   unario    := «−» unario | potencia                      — el menos UNARIO va pegado
   *   potencia  := primario «²»?                              — así «−x²» es −(x²) y «(−x)²» no
   *   primario  := número | x | ( suma ) | |suma| | sin( suma ) | cos( suma ) | √primario
   * Un guion (U+002D) o cualquier signo fuera de esta notación LANZA: también se vigila.
   */
  function evaluarFormulaEscrita(formula: string, x: number): number {
    type Token = { tipo: 'num'; valor: number } | { tipo: 'op'; valor: string };
    const fuente = formula.replace(/^f\(x\) = /, '');
    const tokens: Token[] = [];
    for (let i = 0; i < fuente.length; ) {
      if (fuente.startsWith(' − ', i)) {
        tokens.push({ tipo: 'op', valor: 'resta' });
        i += 3;
      } else if (fuente.startsWith(' + ', i)) {
        tokens.push({ tipo: 'op', valor: 'suma' });
        i += 3;
      } else if (fuente.startsWith('sin', i) || fuente.startsWith('cos', i)) {
        tokens.push({ tipo: 'op', valor: fuente.slice(i, i + 3) });
        i += 3;
      } else if (/[0-9]/.test(fuente[i])) {
        const m = fuente.slice(i).match(/^[0-9]+(,[0-9]+)?/);
        if (!m) throw new Error(`número ilegible en «${formula}»`);
        tokens.push({ tipo: 'num', valor: Number(m[0].replace(',', '.')) });
        i += m[0].length;
      } else if ('x()|·²√−'.includes(fuente[i])) {
        tokens.push({ tipo: 'op', valor: fuente[i] });
        i += 1;
      } else {
        throw new Error(`signo «${fuente[i]}» (U+${fuente.charCodeAt(i).toString(16).toUpperCase()}) fuera de la notación en «${formula}»`);
      }
    }
    let p = 0;
    const es = (valor: string): boolean => {
      const t = tokens[p];
      return t !== undefined && t.tipo === 'op' && t.valor === valor;
    };
    const exigir = (valor: string): void => {
      if (!es(valor)) throw new Error(`se esperaba «${valor}» en «${formula}»`);
      p++;
    };
    const suma = (): number => {
      let v = producto();
      while (es('suma') || es('resta')) {
        const signo = es('suma') ? 1 : -1;
        p++;
        v += signo * producto();
      }
      return v;
    };
    const producto = (): number => {
      let v = unario();
      while (es('·')) {
        p++;
        v *= unario();
      }
      return v;
    };
    const unario = (): number => {
      if (es('−')) {
        p++;
        return -unario();
      }
      return potencia();
    };
    const potencia = (): number => {
      const v = primario();
      if (es('²')) {
        p++;
        return v * v;
      }
      return v;
    };
    const primario = (): number => {
      const t = tokens[p];
      if (t === undefined) throw new Error(`fórmula incompleta: «${formula}»`);
      if (t.tipo === 'num') {
        p++;
        return t.valor;
      }
      p++;
      switch (t.valor) {
        case 'x':
          return x;
        case '(': {
          const v = suma();
          exigir(')');
          return v;
        }
        case '|': {
          const v = suma();
          exigir('|');
          return Math.abs(v);
        }
        case 'sin':
        case 'cos': {
          exigir('(');
          const v = suma();
          exigir(')');
          return t.valor === 'sin' ? Math.sin(v) : Math.cos(v);
        }
        case '√': {
          const v = primario();
          return v >= 0 ? Math.sqrt(v) : Number.NaN;
        }
        default:
          throw new Error(`«${t.valor}» fuera de lugar en «${formula}»`);
      }
    };
    const resultado = suma();
    if (p !== tokens.length) throw new Error(`sobra texto en «${formula}»`);
    return resultado;
  }

  function mismaCurva(formula: string, funcion: FuncionBase, v: Valores, xs: readonly number[]): void {
    for (const x of xs) {
      const dibujada = evaluarTransformada(funcion, v.a, v.b, v.c, v.d, x);
      const escrita = evaluarFormulaEscrita(formula, x);
      if (Number.isNaN(dibujada)) {
        expect(escrita, `${formula} en x = ${x}: el lienzo no dibuja nada`).toBeNaN();
      } else {
        expect(escrita, `${formula} en x = ${x}`).toBeCloseTo(dibujada, 9);
      }
    }
  }

  test('REPARADO (2340) · la fórmula escrita es la curva que se dibuja, para las cinco funciones', async () => {
    // REPARADO (28/09/2026): `construirEcuacion` escribía el argumento de x² sin paréntesis con
    // c = 0: b = 2 salía «2·x²» (igual que a = 2) y b = −1 «-x²» (igual que a = −1). Ahora el
    // argumento b·(x − c) se escribe una vez y la potencia lo envuelve. Se comprueba evaluando la
    // fórmula escrita contra `evaluarTransformada`, la función con la que pinta el lienzo, en una
    // rejilla que cruza las cinco funciones con a, b, c y d de ambos signos, 0 y decimales.
    // El analizador, primero contra valores resueltos a mano: si leyera mal, la rejilla no diría nada.
    expect(evaluarFormulaEscrita('f(x) = 2·(3·x)²', 1)).toBe(18);
    expect(evaluarFormulaEscrita('f(x) = −x² + 1', 2)).toBe(-3);
    expect(evaluarFormulaEscrita('f(x) = (−x)²', 2)).toBe(4);
    expect(evaluarFormulaEscrita('f(x) = −0,5·|−2·(x + 1)| − 3', 1)).toBe(-5);
    expect(evaluarFormulaEscrita('f(x) = √(−(x − 2)) + 1', -7)).toBe(4);
    expect(evaluarFormulaEscrita('f(x) = √x', -1)).toBeNaN();
    expect(() => evaluarFormulaEscrita('f(x) = -x²', 1), 'un guion no es un signo menos').toThrow();

    const FUNCIONES: readonly FuncionBase[] = ['sin', 'cos', 'cuadratica', 'absoluto', 'raiz'];
    const XS = [-3.7, -1, 0, 0.4, 2, 5.3];
    let formulas = 0;
    for (const funcion of FUNCIONES) {
      for (const a of [-2, -1, -0.5, 0, 0.5, 1, 2.5]) {
        for (const b of [-2, -1, -0.5, 0.3, 1, 2]) {
          for (const c of [-2.5, 0, 1, 3]) {
            for (const d of [-1, 0, 1.5]) {
              const f = construirEcuacion(funcion, a, b, c, d);
              expect(f, 'sin paréntesis dobles').not.toMatch(/\(\(|\|\(|\)\)\)/);
              mismaCurva(f, funcion, { a, b, c, d }, XS);
              formulas++;
            }
          }
        }
      }
    }
    expect(formulas).toBe(5 * 7 * 6 * 4 * 3);

    // Los casos de la ficha, uno a uno (resueltos a mano):
    expect(construirEcuacion('cuadratica', 1, 2, 0, 0)).toBe('f(x) = (2·x)²'); //    = 4x², pasa por (1, 4)
    expect(construirEcuacion('cuadratica', 2, 1, 0, 0)).toBe('f(x) = 2·x²'); //       pasa por (1, 2)
    expect(construirEcuacion('cuadratica', 1, -1, 0, 0)).toBe('f(x) = (−x)²'); //     = x², hacia arriba
    expect(construirEcuacion('cuadratica', -1, 1, 0, 0)).toBe('f(x) = −x²'); //       hacia abajo
    expect(construirEcuacion('cuadratica', 2, 3, 0, 0)).toBe('f(x) = 2·(3·x)²'); //   = 18x², no 6x²

    // El modo práctica y los enunciados de aula heredan el generador: cada fórmula que citan
    // (la de partida y la de después de mover) tiene que ser la curva que se carga en el lienzo.
    const ejercicios = [
      ...CASOS.map((caso) => ({ enunciado: caso.enunciado, datos: caso.datos })),
      ...Array.from({ length: 60 }, (_, i) => generarEjercicioAleatorio(i + 1)),
    ];
    for (const { enunciado, datos } of ejercicios) {
      const partida = enunciado.match(/parte de (f\(x\) = .+?) \(a = /);
      const cambio = enunciado.match(/pasa a ser (f\(x\) = .+?)\. Antes de moverlo/);
      expect(partida, enunciado).not.toBeNull();
      expect(cambio, enunciado).not.toBeNull();
      const despues = { ...datos.antes, [datos.parametro]: datos.nuevoValor };
      mismaCurva(partida?.[1] ?? '', datos.funcion, datos.antes, XS);
      mismaCurva(cambio?.[1] ?? '', datos.funcion, despues, XS);
    }
  });

  test('REPARADO (2340) · en pantalla, x² con b = 2 o b = −1 ya no comparte fórmula con a = 2 o a = −1', async ({ page }) => {
    // REPARADO (28/09/2026): el caso de la ficha en el panel y en el aria-label del lienzo.
    await abrir(page);
    await escenario(page, 'x²', { a: 1, b: 2, c: 0, d: 0 });
    await expect(formula(page)).toHaveText('f(x) = (2·x)²');
    await expect(lienzo(page)).toHaveAttribute('aria-label', /f\(x\) = \(2·x\)²$/);
    await expect.poll(() => distanciaColor(page, 1, 4, AZUL)).toBeLessThan(ES_CURVA); // (2·1)² = 4
    const conB2 = await textoDe(formula(page));
    await escenario(page, 'x²', { a: 2, b: 1, c: 0, d: 0 });
    const conA2 = await textoDe(formula(page));
    await escenario(page, 'x²', { a: 1, b: -1, c: 0, d: 0 });
    await expect(formula(page)).toHaveText('f(x) = (−x)²');
    await expect.poll(() => distanciaColor(page, 2, 4, AZUL)).toBeLessThan(ES_CURVA); // (−2)² = 4
    const conBmenos1 = await textoDe(formula(page));
    await escenario(page, 'x²', { a: -1, b: 1, c: 0, d: 0 });
    const conAmenos1 = await textoDe(formula(page));
    expect(conB2, '(2x)² = 4x² frente a 2x²').not.toBe(conA2);
    expect(conBmenos1, '(−x)² = x² frente a −x²').not.toBe(conAmenos1);
  });

  test('REPARADO (2341) · sin paréntesis dobles en sin, cos, √ y |x| con b = 1 y c ≠ 0', async ({ page }) => {
    // REPARADO (28/09/2026): con b = 1 el argumento ya traía su paréntesis «(x − 2)» y el
    // símbolo añadía otro: «sin((x − 2))», «√((x − 2))», «|(x − 2)|». Los enunciados de los
    // casos 3, 7 y 12 de aula lo heredaban.
    await abrir(page);
    const esperado: Readonly<Record<string, string>> = {
      'sin(x)': 'f(x) = sin(x − 2)',
      'cos(x)': 'f(x) = cos(x − 2)',
      '√x': 'f(x) = √(x − 2)',
      '|x|': 'f(x) = |x − 2|',
    };
    for (const [funcion, texto] of Object.entries(esperado)) {
      await escenario(page, funcion, { a: 1, b: 1, c: 2, d: 0 });
      await expect(formula(page), funcion).toHaveText(texto);
    }
    for (const caso of CASOS) expect(caso.enunciado, `caso ${caso.id}`).not.toMatch(/\(\(|\|\(/);
    expect(CASOS[6].enunciado).toContain('la fórmula pasa a ser f(x) = sin(x − 2).');
  });

  test('REPARADO (2342) · el panel distingue estirar, comprimir, aplanar y voltear con a', async ({ page }) => {
    // REPARADO (28/09/2026): `descripcionA` trataba todo a > 0 como estiramiento y todo lo que no
    // caía en (−1, 0) como «se estira y voltea». Casos:
    //   a = 0,5 → 0,5·sin(x) va de −0,5 a 0,5: se comprime
    //   a = 0   → 0·sin(x) + d = d: la recta y = d, sin reflexión
    //   a = −1  → |a| = 1: solo se voltea
    await abrir(page);
    await escenario(page, 'sin(x)', { a: 0.5, b: 1, c: 0, d: 0 });
    const medio = await textoDe(descripcion(page, 'a'));
    expect(medio, 'a = 0,5').not.toContain('se estira');
    expect(medio, 'a = 0,5').toContain('se comprime verticalmente');
    await escenario(page, 'sin(x)', { a: 0, b: 1, c: 0, d: 0 });
    const cero = await textoDe(descripcion(page, 'a'));
    expect(cero, 'a = 0').not.toContain('reflexión');
    expect(cero, 'a = 0').toContain('recta horizontal y = 0');
    await escenario(page, 'sin(x)', { a: -1, b: 1, c: 0, d: 0 });
    const menosUno = await textoDe(descripcion(page, 'a'));
    expect(menosUno, 'a = −1').not.toContain('se estira');
    expect(menosUno, 'a = −1').toContain('Reflexión vertical');
    await escenario(page, 'sin(x)', { a: -2, b: 1, c: 0, d: 0 });
    expect(await textoDe(descripcion(page, 'a')), 'a = −2').toContain('se estira verticalmente y se voltea');
  });

  test('REPARADO (2343) · b = −1 solo refleja, «1 unidad», y sin período en funciones no periódicas', async ({ page }) => {
    // REPARADO (28/09/2026): con |b| = 1 `descripcionB` caía en la rama de |b| < 1 («Período ×1 —
    // se estira»); c = 1 daba «1 unidades»; y x² con b = 0,5 hablaba de «Período ×2».
    await abrir(page);
    await escenario(page, 'sin(x)', { a: 1, b: -1, c: 1, d: 0 });
    const bMenos1 = await textoDe(descripcion(page, 'b'));
    expect(bMenos1, 'b = −1').not.toContain('se estira');
    expect(bMenos1, 'b = −1').toContain('Reflexión horizontal');
    const c1 = await textoDe(descripcion(page, 'c'));
    expect(c1, 'c = 1').not.toContain('1 unidades');
    expect(c1, 'c = 1').toContain('1 unidad a la derecha');
    await escenario(page, 'x²', { a: 1, b: 0.5, c: 0, d: 0 });
    const parabola = await textoDe(descripcion(page, 'b'));
    expect(parabola, 'x², b = 0,5').not.toMatch(/Período|Frecuencia/);
    expect(parabola, 'x², b = 0,5').toContain('se estira horizontalmente');
    await escenario(page, 'sin(x)', { a: 1, b: 0.5, c: 0, d: 0 });
    expect(await textoDe(descripcion(page, 'b')), 'sin, b = 0,5').toContain('Período ×2');
  });

  for (const tema of ['light', 'dark'] as const) {
    const nombreTema = tema === 'light' ? 'claro' : 'oscuro';

    test(`REPARADO (2344) · contraste de las etiquetas «a = …», «b = …», «c = …», «d = …» del panel (${nombreTema})`, async ({ page }) => {
      // REPARADO (28/09/2026): `paramTag` ponía texto blanco de 13,6 px sobre el color en línea de
      // cada parámetro (a 4,11 · b 2,80 · c 2,26). Ahora el fondo es --primary-boton,
      // --secondary-boton, --param-c-fondo (#3A67A8) y --hero-bg: 5,47 · 5,15 · 5,70 · 8,33.
      await abrir(page, tema);
      const etiquetas = page.locator('[class*="paramTag"]');
      await expect(etiquetas).toHaveCount(4);
      for (let i = 0; i < 4; i++) await exigirContraste(`etiqueta ${'abcd'[i]}`, etiquetas.nth(i));
    });

    test(`REPARADO (2345) · contraste de las letras de color de a, b, c, d (${nombreTema})`, async ({ page }) => {
      // REPARADO (28/09/2026): las letras de los deslizadores (19,2 px, peso 800 → 3:1) y las de
      // la tabla educativa (14,4 px → 4,5:1) llevaban el color en línea, sin variante oscura.
      // Ahora a y b van con --primary-texto y --secondary-texto, y c y d con variables del
      // módulo que se redeclaran en [data-theme='dark'].
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

    test(`REPARADO (2346) · el texto de marca pequeño llega a 4,5:1 (${nombreTema})`, async ({ page }) => {
      // REPARADO (28/09/2026): el color de marca como TEXTO pequeño iba en var(--primary).
      // Medido en claro: valor del deslizador 4,11 · botón de función activo 3,42 · «Restablecer
      // todo» 4,11 · leyenda de la transformada 3,93 · preguntas del FAQ 3,93; en oscuro la
      // leyenda, 4,36 (sobre un gris #353535). Ahora van con --primary-texto y la leyenda, en
      // oscuro, sobre --bg-primary. Al repararlo salieron más con el mismo defecto en el bloque
      // educativo, y se miden aquí también: los títulos de escenarios, pasos y trucos (3,93 en
      // claro), el número de cada paso (blanco sobre --primary: 2,79 en oscuro) y el naranja de
      // «errores frecuentes» (#E07A1F: 2,56 en claro y 3,72 en oscuro).
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
      await exigirContraste('título de escenario', page.locator('[class*="scenarioCard"] strong').first());
      await exigirContraste('título de paso', page.locator('[class*="stepContent"] strong').first());
      await exigirContraste('número de paso', page.locator('[class*="stepNumber"]').first());
      await exigirContraste('título de truco', page.locator('[class*="tipCard"] strong').first());
      await exigirContraste('cabecera de errores frecuentes', page.locator('[class*="warningHeader"] strong'));
      await exigirContraste('error frecuente', page.locator('[class*="warningList"] li strong').first());
    });

    test(`REPARADO (sospecha) · la etiqueta de la ecuación dentro del lienzo llega a 4,5:1 (${nombreTema})`, async ({ page }) => {
      // REPARADO (28/09/2026), sospecha del acta confirmada: la etiqueta se pintaba en #2E86AB,
      // negrita de 13 px, sobre su caja (blanca al 90 % en claro, #1E1E1E al 85 % en oscuro):
      // ≈ 4:1 en los dos temas. Ahora el texto va en la variante de texto del mismo azul
      // (#26718F / #3FA5D1); la curva sigue en #2E86AB. Se mide en los píxeles del lienzo: el
      // color más frecuente del tramo final de la etiqueta es su caja, y el más alejado de él
      // entre los frecuentes, el núcleo del trazo de las letras.
      await abrir(page, tema);
      await expect(formula(page)).toHaveText('f(x) = sin(x)');
      const ratio = await lienzo(page).evaluate((el) => {
        const cv = el as HTMLCanvasElement;
        const rect = cv.getBoundingClientRect();
        const dpr = cv.width / rect.width;
        const derecha = rect.width - 30 - 10; // labelX de dibujar()
        const arriba = 30 + 10; //                labelY
        const ctx = cv.getContext('2d');
        if (!ctx) return 0;
        const x0 = Math.round((derecha - 60) * dpr);
        const y0 = Math.round((arriba + 2) * dpr);
        const datos = ctx.getImageData(x0, y0, Math.round(60 * dpr), Math.round(16 * dpr)).data;
        const cuenta = new Map<string, number>();
        for (let i = 0; i < datos.length; i += 4) {
          const k = `${datos[i]},${datos[i + 1]},${datos[i + 2]}`;
          cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
        }
        const orden = [...cuenta.entries()].sort((p, q) => q[1] - p[1]);
        const caja = orden[0][0].split(',').map(Number);
        let texto = caja;
        let lejos = -1;
        for (const [k, n] of orden) {
          if (n < 4) continue;
          const c = k.split(',').map(Number);
          const dist = Math.hypot(c[0] - caja[0], c[1] - caja[1], c[2] - caja[2]);
          if (dist > lejos) {
            lejos = dist;
            texto = c;
          }
        }
        const lum = (c: number[]): number => {
          const f = (v: number): number => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
        };
        const l1 = lum(caja);
        const l2 = lum(texto);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      });
      expect(ratio, `etiqueta del lienzo: ${ratio.toLocaleString('es-ES', { maximumFractionDigits: 2 })}:1`).toBeGreaterThanOrEqual(4.5);
    });
  }

  test('REPARADO (2347) · las cinco 💡 de los trucos del FAQ llevan aria-hidden', async ({ page }) => {
    // REPARADO (28/09/2026): los cinco <p> de `faqTip` empezaban con «💡» como texto suelto junto a
    // texto; el lector de pantalla leía «bombilla» delante de cada truco.
    await abrir(page);
    const trucos = page.locator('p[class*="faqTip"]');
    await expect(trucos).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      expect(await trucos.nth(i).locator('[aria-hidden="true"]', { hasText: '💡' }).count(), `truco ${i + 1}`).toBe(1);
    }
  });

  test('REPARADO (2348) · el FAQ «¿Y si b es negativo?» dice lo que se dibuja', async ({ page }) => {
    // REPARADO (28/09/2026): decía que con sin y cos «la reflexión no cambia la forma visual» y
    // que en «la parábola asimétrica sí se aprecia el cambio». Caso: sin, b = −1 → la curva pasa
    // por (π/2, −1) y no por (π/2, 1) (L4): sí cambia, porque sin es impar; x² es par y no cambia.
    await abrir(page);
    await escenario(page, 'sin(x)', { a: 1, b: -1, c: 0, d: 0 });
    await expect.poll(() => distanciaColor(page, Math.PI / 2, -1, AZUL)).toBeLessThan(ES_CURVA);
    const faq = page.locator('[class*="faqItem"]').filter({ hasText: '¿Y si b es negativo?' });
    const texto = await textoDe(faq);
    expect(texto).not.toContain('parábola asimétrica');
    expect(texto).not.toMatch(/sin y cos, la reflexión no cambia la forma visual/);
    expect(texto).toContain('sin(−u) = −sin(u)');
    expect(texto).toContain('(π/2, −1) en lugar de (π/2, 1)');
    expect(texto).toMatch(/pares —cos, x² y \|x\|—/);
  });

  test('REPARADO (2349) · el truco del signo de c ya no enseña el error clásico', async ({ page }) => {
    // REPARADO (28/09/2026): el truco pedía leer la dirección en «el signo que ves en la
    // fórmula». Caso: c = −2 → la app escribe «(x + 2)²» (se ve «+») y el vértice se dibuja en
    // x = −2, a la IZQUIERDA. Ahora dice que el signo que se ve es el CONTRARIO de la dirección.
    await abrir(page);
    await escenario(page, 'x²', { a: 1, b: 1, c: -2, d: 0 });
    await expect(formula(page)).toHaveText('f(x) = (x + 2)²');
    await expect.poll(() => distanciaColor(page, -2, 0, TEAL)).toBeLessThan(ES_CURVA);
    const truco = page.locator('[class*="tipCard"]').filter({ hasText: 'El signo de c' });
    const texto = await textoDe(truco);
    expect(texto).not.toContain('el signo que ves en la fórmula es la dirección');
    expect(texto).toContain('(x + 2) es c = −2 → 2 unidades a la izquierda');
  });

  test('REPARADO (2350) · el paso 2 ya no toma (c, d) como un cruce en cos', async ({ page }) => {
    // REPARADO (28/09/2026): «…o el punto de cruce central (sin/cos). Ese punto es (c, d)». En
    // cos no: caso cos, c = 2, d = 1 → en x = c la curva está en su MÁXIMO a + d = 2 (L5) y
    // corta y = d en 2 ± π/2.
    await abrir(page);
    await escenario(page, 'cos(x)', { a: 1, b: 1, c: 2, d: 1 });
    await expect.poll(() => distanciaColor(page, 2, 2, AZUL)).toBeLessThan(ES_CURVA);
    const paso = page.locator('[class*="stepContent"]').filter({ hasText: 'Localiza el punto de referencia' });
    const texto = await textoDe(paso);
    expect(texto).not.toMatch(/cruce central \(sin\/cos\)/);
    expect(texto).toContain('en x = c está una cresta, a la altura a + d');
  });

  test('REPARADO (2351) · b cruza el cero con las flechas en los dos sentidos', async ({ page }) => {
    // REPARADO (28/09/2026): el deslizador cambiaba SIEMPRE b = 0 por 0,1, así que desde 0,1 «←»
    // pedía 0, volvía a 0,1 y por teclado no se cruzaba a negativo. Ahora (`ajustarB`) un paso
    // desde ±0,1 cruza al otro lado. Caso: b = 0,2, «←» dos veces → −0,1; y «→» vuelve a 0,1.
    await abrir(page);
    await sembrarValor(page, '#slider-b', '0.2');
    await page.locator('#slider-b').focus();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => leerValorEnReact(page, '#slider-b')).toBe('0.1');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => leerValorEnReact(page, '#slider-b')).toBe('-0.1');
    await expect(formula(page)).toHaveText('f(x) = sin(−0,1·x)');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => leerValorEnReact(page, '#slider-b')).toBe('-0.2');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => leerValorEnReact(page, '#slider-b')).toBe('0.1');
  });

  test('REPARADO (2351) · ajustarB: el paso cruza, el arrastre y el salto se quedan en su lado', async () => {
    expect(ajustarB(0.5, 1, false)).toBe(0.5); //   lo que no es 0 pasa tal cual
    expect(ajustarB(0, 0.1, false)).toBe(-0.1); //  flecha «←» desde 0,1
    expect(ajustarB(0, -0.1, false)).toBe(0.1); //  flecha «→» desde −0,1
    expect(ajustarB(0, 0.1, true)).toBe(0.1); //    arrastrando: no parpadea en el centro
    expect(ajustarB(0, -0.1, true)).toBe(-0.1);
    expect(ajustarB(0, 1, false)).toBe(0.1); //     salto a 0 desde lejos (L2): se queda en su lado
    expect(ajustarB(0, -2, false)).toBe(-0.1);
  });
});
