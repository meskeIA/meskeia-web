import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

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
