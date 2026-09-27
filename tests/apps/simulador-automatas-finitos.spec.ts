import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
} from '../../app/simulador-automatas-finitos/casos';

/**
 * Simulador de Autómatas Finitos — Inspector, 31/08/2026 (ampliado el 27/09/2026)
 *
 * Motor bajo prueba: `generarPasosValidacion` / `epsilonClausura`, que desde el 15/09/2026
 * viven en `app/simulador-automatas-finitos/motor-conversiones.ts` (antes estaban inline en
 * `page.tsx`). Los casos 1 a 4 usan el ejemplo preconfigurado
 * «DFA — Pares de 0» (número par de 0s sobre el alfabeto {0, 1}):
 *
 *   Estados: q0 (inicial, FINAL) · q1
 *   Transiciones: q0 -0-> q1 · q1 -0-> q0 · q0 -1-> q0 · q1 -1-> q1
 *
 * Es un DFA total (hay transición definida para los 2 símbolos desde cada estado), así
 * que nunca cae en «sin transición»: solo puede terminar ACEPTADA o RECHAZADA según la
 * paridad de 0s leídos.
 *
 * ACTUALIZADO 05/09/2026: los botones de la animación llevaban su emoji suelto dentro del
 * nombre accesible («name: '▶ Validar'»). Al envolverlo en <span aria-hidden="true"> —regla
 * obligatoria del CLAUDE.md §5, que un lector de pantalla agradece— el nombre pasó a ser
 * «Validar» a secas y estos selectores dejaron de encontrar nada. Lo que el test comprueba
 * no ha cambiado: solo cómo se localiza el botón.
 *
 * Los 3 casos de este fichero se trazaron A MANO antes de tocar el navegador, y se
 * verifican por DOS vías independientes que comparten el mismo motor:
 *   1. Modo batch (`resultadosBatch`, síncrono) — sin depender de temporizadores.
 *   2. Validación animada paso a paso, con «Paso siguiente» (no con el play automático,
 *      para no depender de la velocidad del slider).
 */

/**
 * El anunciador del paso de la animación, que es `.pasoDescripcion` en `page.tsx`.
 *
 * ⚠️ 22/09/2026 — estos cinco localizadores buscaban `[aria-live="polite"][aria-atomic="true"]`
 * a secas, y eso es un atributo genérico: en cuanto otra región viva de la página lo lleva, el
 * modo estricto de Playwright rechaza el localizador por encontrar dos. Pasó al reparar el
 * hallazgo 1212, que dio región viva al enunciado de «Casos para clase» para que el ejercicio
 * nuevo se anuncie —dos regiones vivas en una página son perfectamente válidas en ARIA, y el
 * cambio de enunciado tiene que anunciarse—. Se acota a la clase del elemento que estos casos
 * quieren medir de verdad.
 */
const anunciadorDelPaso = (page: Page) => page.locator('[class*="pasoDescripcion"]');

const RUTA = '/simulador-automatas-finitos/';

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Simulador de Autómatas Finitos',
  );
  // 27/09/2026 — el <h1> viaja en el HTML servido y está en pantalla antes de que React
  // responda: un clic anterior a la hidratación se pierde. Se espera a los dos inputs
  // controlados de la página (la cadena y la respuesta de «Casos para clase»).
  await esperarHidratacion(page, ['#cadena', '#casos-respuesta']);
  // Carga el ejemplo «DFA — Pares de 0» sobre el que están trazados los 3 casos.
  await page.getByRole('button', { name: /Pares de 0/ }).click();
});

/** Filas de la tabla de validación en lote (no la tabla comparativa DFA/NFA de la guía). */
function filasBatch(page: import('@playwright/test').Page) {
  return page.locator('[class*="batchTableWrapper"] table tbody tr');
}

async function resultadoDeFila(fila: ReturnType<typeof filasBatch> extends infer T
  ? T extends import('@playwright/test').Locator
    ? import('@playwright/test').Locator
    : never
  : never) {
  return (await fila.locator('td').nth(1).innerText()).trim();
}

// ============================================================
// CASO 1 — Normal: "1001" tiene DOS 0s (par) → debe ACEPTARSE
// ============================================================
//
// TRAZA A MANO desde q0:
//   leer '1': q0 -1-> q0
//   leer '0': q0 -0-> q1
//   leer '0': q1 -0-> q0
//   leer '1': q0 -1-> q0
// Estado final activo: q0, que ES final ⇒ ACEPTADA.
test.describe('Caso 1 · "1001" (dos 0s, número par) → ACEPTADA', () => {
  test('modo batch', async ({ page }) => {
    const textarea = page.getByLabel('Cadenas a validar (una por línea)');
    await textarea.fill('1001');

    await expect(filasBatch(page)).toHaveCount(1);
    await expect(resultadoDeFila(filasBatch(page).first())).resolves.toContain('Aceptada');
  });

  test('validación animada paso a paso', async ({ page }) => {
    await page.locator('#cadena').fill('1001');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    // Se pausa de inmediato para no depender del temporizador de la animación:
    // el cómputo debe ser el mismo avanzando manualmente.
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();

    const pasoSiguiente = page.getByRole('button', { name: 'Paso siguiente', exact: true });
    for (let i = 0; i < 4; i++) {
      await pasoSiguiente.click();
    }

    // 4 símbolos leídos + estado inicial = 5 pasos (posiciones 0..4).
    await expect(anunciadorDelPaso(page)).toContainText(
      'Paso 5 / 5',
    );
    // Traza a mano: el último símbolo leído es '1' y el estado activo queda en q0.
    await expect(anunciadorDelPaso(page)).toContainText(
      'Lee "1" → q0',
    );
    await expect(page.locator('[role="alert"]', { hasText: 'ACEPTADA' })).toBeVisible();
    // El paso 6 no existe: se llegó al final de la cadena.
    await expect(pasoSiguiente).toBeDisabled();
  });
});

// ============================================================
// CASO 2 — Límite: cadena VACÍA (0 ceros, que también es par) → debe ACEPTARSE
// ============================================================
//
// TRAZA A MANO: sin símbolos que leer, el único estado activo es el inicial, q0.
// q0 es FINAL ⇒ ACEPTADA. Es el caso que demuestra por qué el ejemplo marca q0 como
// final: si no lo fuera, la cadena vacía (paridad 0 = par) se rechazaría mal.
//
// El campo único de validación deshabilita «Validar» con cadena vacía (no hay nada que
// animar paso a paso), así que este caso solo puede verificarse por el modo batch —
// que sí acepta líneas vacías y las etiqueta «(vacía)».
test.describe('Caso 2 · cadena vacía (0 ceros, número par) → ACEPTADA', () => {
  test('el campo de validación única deshabilita "Validar" con cadena vacía', async ({
    page,
  }) => {
    await page.locator('#cadena').fill('');
    await expect(page.getByRole('button', { name: 'Validar', exact: true })).toBeDisabled();
  });

  test('modo batch acepta la cadena vacía', async ({ page }) => {
    const textarea = page.getByLabel('Cadenas a validar (una por línea)');
    await textarea.fill('');

    await expect(filasBatch(page)).toHaveCount(1);
    await expect(filasBatch(page).first().locator('td').first()).toContainText('(vacía)');
    await expect(resultadoDeFila(filasBatch(page).first())).resolves.toContain('Aceptada');
  });
});

// ============================================================
// CASO 3 — Rechazo: "0" tiene UN 0 (impar) → debe RECHAZARSE
// ============================================================
//
// TRAZA A MANO desde q0:
//   leer '0': q0 -0-> q1
// Estado final activo: q1, que NO es final ⇒ RECHAZADA (no «sin transición»: el DFA
// tiene regla definida para (q1, cualquier símbolo), así que si se sigue leyendo nunca
// cae en el caso «sin-transicion»).
test.describe('Caso 3 · "0" (un 0, número impar) → RECHAZADA', () => {
  test('modo batch', async ({ page }) => {
    const textarea = page.getByLabel('Cadenas a validar (una por línea)');
    await textarea.fill('0');

    await expect(filasBatch(page)).toHaveCount(1);
    await expect(resultadoDeFila(filasBatch(page).first())).resolves.toContain('Rechazada');
  });

  test('validación animada paso a paso', async ({ page }) => {
    await page.locator('#cadena').fill('0');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await page.getByRole('button', { name: 'Paso siguiente', exact: true }).click();

    await expect(anunciadorDelPaso(page)).toContainText(
      'Lee "0" → q1',
    );
    await expect(page.locator('[role="alert"]', { hasText: 'RECHAZADA' })).toBeVisible();
  });
});

// ============================================================
// CASO 4 — REGRESIÓN: editar el autómata a media animación no debe tumbar la app
// ============================================================
//
// Bug real, detectado en el digest del 03/09/2026: 4 caídas a la pantalla de error en
// un día, todas con `TypeError: Cannot read properties of undefined (reading 'posicion')`.
//
// Mecanismo: `validacion` se recalcula con [cadena, tipo, estados, transiciones], pero
// `pasoActual` solo se reseteaba al cambiar la cadena, cargar un ejemplo, limpiar el
// lienzo, reiniciar o cambiar de tipo. Editando el AUTÓMATA a media animación, los pasos
// se regeneran más cortos y el índice se queda fuera de rango: la cinta de la cadena leía
// `validacion.pasos[pasoActual].posicion` sin guarda y reventaba durante el render.
//
// TRAZA A MANO — «Pares de 0» con la cadena "0101": 4 símbolos + inicial = 5 pasos, se
// avanza hasta el 5/5. Al borrar q1 se van con él sus tres transiciones (q0-0->q1,
// q1-0->q0, q1-1->q1) y solo queda q0-1->q0, así que "0101" ya no pasa del primer
// símbolo: pasos = [inicial, «sin transición desde q0 con 0»] = 2. El índice 4 apunta
// a un paso que ya no existe.
test.describe('Caso 4 · regresión: borrar un estado a media animación', () => {
  test('la app sobrevive y reencaja el paso en el último válido', async ({ page }) => {
    const erroresDePagina: string[] = [];
    page.on('pageerror', (err) => erroresDePagina.push(err.message));

    // 1. Animación avanzada hasta el último paso de "0101" (5 de 5).
    await page.locator('#cadena').fill('0101');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    const pasoSiguiente = page.getByRole('button', { name: 'Paso siguiente', exact: true });
    for (let i = 0; i < 4; i++) {
      await pasoSiguiente.click();
    }
    await expect(anunciadorDelPaso(page)).toContainText(
      'Paso 5 / 5',
    );

    // 2. Se borra q1 con la herramienta «Eliminar» mientras la animación sigue en el 5.
    await page.getByRole('button', { name: 'Eliminar' }).click();
    // El círculo es lo que recibe el clic (la etiqueta <text> queda debajo de él); las
    // coordenadas son las que el ejemplo «Pares de 0» le da a q1 en EJEMPLOS.
    await page.locator('svg circle[cx="520"][cy="250"]').click();

    // 3. La app sigue en pie: antes del arreglo, aquí quedaba la pantalla de error.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Simulador de Autómatas Finitos',
    );
    expect(erroresDePagina).toEqual([]);

    // 4. Y el paso se reencaja en el último válido, mostrando el efecto de la edición.
    await expect(anunciadorDelPaso(page)).toContainText(
      'Paso 2 / 2',
    );
    await expect(page.locator('[role="alert"]', { hasText: 'SIN TRANSICIÓN' })).toBeVisible();
  });
});

// ════════════════════════════════════════════════════════════════════════════════════════
// INSPECTOR 27/09/2026 — casos nuevos
// ════════════════════════════════════════════════════════════════════════════════════════
//
// Todos resueltos A MANO antes de abrir el navegador, sobre los ejemplos de `EJEMPLOS`
// (page.tsx):
//   «Termina en "ab"»  AFD: q0 (inicial) · q1 · q2 (final)
//                      q0-a→q1 · q0-b→q0 · q1-a→q1 · q1-b→q2 · q2-a→q1 · q2-b→q0
//   «Contiene "01"»    AFND: q0-0→q0 · q0-1→q0 · q0-0→q1 · q1-1→q2 · q2-0→q2 · q2-1→q2 (q2 final)
//   «a*b*c*»           AFND-ε: q0-a→q0 · q0-ε→q1 · q1-b→q1 · q1-ε→q2 · q2-c→q2 (q2 final)
//
// El `beforeEach` de arriba deja cargado «Pares de 0»; los casos que usan otro ejemplo lo
// cargan encima.

/** El veredicto de cada fila del lote, en orden (segunda columna de la tabla). */
const veredictosDelLote = (page: Page) =>
  page.locator('[class*="batchTableWrapper"] table tbody tr td:nth-child(2)');

async function escribirLote(page: Page, texto: string): Promise<void> {
  await page.getByLabel('Cadenas a validar (una por línea)').fill(texto);
}

/** El lienzo del editor (no el SVG del logotipo, que es el primero de la página). */
const lienzo = (page: Page) => page.locator('svg[class*="editorSvg"]');

/** El círculo principal de un estado, localizado por su etiqueta (el de un final va detrás del anillo). */
const circuloDe = (page: Page, etiqueta: string) =>
  lienzo(page)
    .locator('g', { has: page.locator('text', { hasText: new RegExp(`^${etiqueta}$`) }) })
    .last()
    .locator('circle')
    .last();

/**
 * Dónde se DIBUJA en pantalla el punto (x, y) del viewBox 800×500 del lienzo. Usa la matriz
 * real del SVG (`getScreenCTM`), que incluye el encaje `xMidYMid meet` del viewBox: es el
 * punto que el usuario ve y pulsa.
 */
async function aPantalla(page: Page, x: number, y: number): Promise<{ x: number; y: number }> {
  await lienzo(page).scrollIntoViewIfNeeded();
  return lienzo(page).evaluate(
    (el, [px, py]) => {
      const svg = el as SVGSVGElement;
      const punto = svg.createSVGPoint();
      punto.x = px;
      punto.y = py;
      const m = svg.getScreenCTM();
      if (!m) throw new Error('El lienzo no tiene matriz de pantalla');
      const q = punto.matrixTransform(m);
      return { x: q.x, y: q.y };
    },
    [x, y] as [number, number],
  );
}

test.describe('Inspector 27/09/2026 · caso normal', () => {
  // TRAZA A MANO «Termina en "ab"»:
  //   bab : q0 -b→ q0 -a→ q1 -b→ q2 (final) ⇒ ACEPTADA; 3 símbolos + inicial = 4 pasos
  //   abba: q0 -a→ q1 -b→ q2 -b→ q0 -a→ q1 (no final) ⇒ RECHAZADA
  //   ε   : se queda en q0, que NO es final ⇒ RECHAZADA
  test('«Termina en ab»: bab ACEPTADA con la traza q0→q0→q1→q2; abba y ε RECHAZADAS', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Termina en "ab"/ }).click();
    await escribirLote(page, 'bab\nabba\n');
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/, /Rechazada/, /Rechazada/]);
    await expect(filasBatch(page).nth(2).locator('td').first()).toHaveText('(vacía)');

    await page.locator('#cadena').fill('bab');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    const pasoSiguiente = page.getByRole('button', { name: 'Paso siguiente', exact: true });
    for (let i = 0; i < 3; i++) {
      await pasoSiguiente.click();
    }
    await expect(anunciadorDelPaso(page)).toContainText('Paso 4 / 4');
    await expect(anunciadorDelPaso(page)).toContainText('Lee "b" → q2');
    await expect(page.locator('[role="alert"]', { hasText: 'ACEPTADA' })).toBeVisible();
    // La traza entera, recorrida hacia atrás.
    const pasoAnterior = page.getByRole('button', { name: 'Paso anterior', exact: true });
    await pasoAnterior.click();
    await expect(anunciadorDelPaso(page)).toContainText('Paso 3 / 4: Lee "a" → q1');
    await pasoAnterior.click();
    await expect(anunciadorDelPaso(page)).toContainText('Paso 2 / 4: Lee "b" → q0');
  });

  // TRAZA A MANO «Contiene "01"» (AFND: se siguen TODAS las ramas a la vez):
  //   1101: {q0} -1→ {q0} -1→ {q0} -0→ {q0,q1} -1→ {q0,q2} ∋ q2 (final) ⇒ ACEPTADA
  //   110 : ... -0→ {q0,q1}, sin ningún final ⇒ RECHAZADA
  test('AFND «Contiene 01»: 1101 ACEPTADA acabando en {q0, q2}; 110 RECHAZADA', async ({ page }) => {
    await page.getByRole('button', { name: /Contiene "01"/ }).click();
    await escribirLote(page, '1101\n110');
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/, /Rechazada/]);

    await page.locator('#cadena').fill('1101');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    const pasoSiguiente = page.getByRole('button', { name: 'Paso siguiente', exact: true });
    for (let i = 0; i < 4; i++) {
      await pasoSiguiente.click();
    }
    await expect(anunciadorDelPaso(page)).toContainText('Paso 5 / 5');
    await expect(anunciadorDelPaso(page)).toContainText(/Lee "1" → (q0, q2|q2, q0)$/);
    await expect(page.locator('[role="alert"]', { hasText: 'ACEPTADA' })).toBeVisible();
  });

  // TRAZA A MANO «a*b*c*» (AFND-ε):
  //   ε     : ε-clausura(q0) = {q0,q1,q2} ∋ q2 ⇒ ACEPTADA aunque q0 NO sea final
  //   aabbcc: {q0,q1,q2} -a→ clausura{q0} = {q0,q1,q2} (dos veces) -b→ {q1,q2} (dos veces)
  //           -c→ {q2} (dos veces) ⇒ ACEPTADA
  //   ba    : {q0,q1,q2} -b→ {q1,q2} -a→ ∅ ⇒ SIN TRANSICIÓN
  test('AFND-ε «a*b*c*»: la cadena vacía se ACEPTA por la ε-clausura; aabbcc ACEPTADA; ba sin transición', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /a\*b\*c\*/ }).click();
    await escribirLote(page, '\naabbcc\nba');
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/, /Aceptada/, /Sin transición/]);
    await expect(filasBatch(page).first().locator('td').first()).toHaveText('(vacía)');
  });
});

test.describe('Inspector 27/09/2026 · casos límite', () => {
  // «Pares de 0» (del beforeEach). 1.000 ceros es par ⇒ ACEPTADA; 999 ceros y un 1 ⇒ 999
  // ceros, impar ⇒ RECHAZADA. Mide que la cadena larga no cambia el veredicto.
  test('cadena larga: 1.000 ceros ACEPTADA y 999 ceros + un 1 RECHAZADA', async ({ page }) => {
    await escribirLote(page, `${'0'.repeat(1000)}\n${'0'.repeat(999)}1`);
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/, /Rechazada/]);
  });

  // «Pares de 0» es total sobre {0, 1}.
  // ACTUALIZADO 27/09/2026 (hallazgo 2296): este caso decía «0a1 se queda SIN TRANSICIÓN». Era
  // lo que pasaba cuando el alfabeto declarado no intervenía; ahora Σ = {0, 1} manda y «0a1» no
  // es una entrada del autómata: FUERA DEL ALFABETO, sin recorrer nada. «Sin transición» sigue
  // existiendo y se mide aparte: declarado Σ = {0, 1, a}, «0a1» lee el 0 (q0→q1) y con «a» no
  // hay flecha.
  test('símbolo fuera del alfabeto: «0a1» es FUERA DEL ALFABETO con Σ = {0, 1}, y SIN TRANSICIÓN con Σ = {0, 1, a}', async ({
    page,
  }) => {
    await escribirLote(page, '0a1');
    await expect(veredictosDelLote(page)).toHaveText([/Fuera del alfabeto/]);
    await page.locator('#alfabeto').fill('0,1,a');
    await expect(veredictosDelLote(page)).toHaveText([/Sin transición/]);
  });

  // Sin estados finales el lenguaje es ∅: se rechaza todo, también ε. Minimizado, los dos
  // estados son equivalentes (ninguno acepta nada) ⇒ una sola clase {q0,q1}, 1 estado.
  test('autómata sin estados finales: rechaza todo, también ε, y minimiza a una sola clase', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Alternar estado final' }).click();
    await circuloDe(page, 'q0').click();
    await expect(page.locator('[class*="estadoResumen"]')).toContainText('Finales: 0');
    await escribirLote(page, '\n00\n1');
    await expect(veredictosDelLote(page)).toHaveText([/Rechazada/, /Rechazada/, /Rechazada/]);

    await page.getByRole('button', { name: 'Minimizar el AFD', exact: true }).click();
    const resultado = page.locator('[class*="convResultado"]');
    await expect(resultado).toContainText('Se fusionan');
    await expect(resultado).toContainText('{q0,q1}');
  });

  // REPARADO 27/09/2026 (hallazgo 2297): el resumen de la minimización decía «El autómata mínimo
  // tiene 1 estados.» porque `page.tsx` escribía «estados» fijo detrás de la cifra. Ahora la
  // palabra concuerda con la cifra (`contar`), aquí y en la determinización.
  test('con un único estado mínimo, el resumen dice «tiene 1 estado.»', async ({ page }) => {
    await page.getByRole('button', { name: 'Alternar estado final' }).click();
    await circuloDe(page, 'q0').click();
    await page.getByRole('button', { name: 'Minimizar el AFD', exact: true }).click();
    await expect(page.locator('[class*="convResultado"]')).toContainText(/tiene 1 estado\./);
  });

  // REPARADO 27/09/2026 (hallazgo 2296): el campo «Alfabeto» no intervenía en nada —`alfabeto`
  // solo se leía para pintar el propio input—. Declarado Σ = {a, b}, «1» no pertenece a Σ* y no
  // puede aceptarse; la app lo ACEPTABA porque solo miraba las transiciones dibujadas. Ahora la
  // cadena sale FUERA DEL ALFABETO, y las transiciones con 0 y 1 se avisan.
  test('con el alfabeto declarado {a, b}, la cadena «1» sale FUERA DEL ALFABETO y se avisa de las transiciones', async ({
    page,
  }) => {
    await page.locator('#alfabeto').fill('a,b');
    await escribirLote(page, '1');
    await expect(veredictosDelLote(page)).toHaveText([/Fuera del alfabeto/]);
    await expect(page.locator('[class*="avisosAutomata"]')).toContainText('no están en el alfabeto declarado');
    await expect(page.locator('[class*="avisosAutomata"]')).toContainText('«0», «1»');

    // La validación animada dice lo mismo y señala el símbolo.
    await page.locator('#cadena').fill('1');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    await expect(page.locator('[role="alert"]', { hasText: 'FUERA DEL ALFABETO' })).toBeVisible();
    await expect(anunciadorDelPaso(page)).toContainText('"1" no pertenece al alfabeto declarado {a, b}');

    // Con el alfabeto coherente, ni aviso ni rechazo: «1» (cero ceros, par) vuelve a ACEPTARSE.
    await page.locator('#alfabeto').fill('0,1');
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/]);
    await expect(page.locator('[class*="avisosAutomata"]')).toHaveText('');
  });

  // Los cuatro ejemplos traen un alfabeto coherente con sus transiciones: ninguno avisa al cargarse
  // (antes «a*b*c*» declaraba «a,b,c,ε», y ε no es un símbolo: es la cadena vacía).
  test('ningún ejemplo precargado avisa de símbolos fuera del alfabeto', async ({ page }) => {
    for (const nombre of [/Pares de 0/, /Termina en "ab"/, /Contiene "01"/, /a\*b\*c\*/]) {
      await page.getByRole('button', { name: nombre }).click();
      await expect(page.locator('[class*="avisosAutomata"]'), String(nombre)).not.toContainText('alfabeto');
    }
    await expect(page.locator('#alfabeto')).toHaveValue('a,b,c');
  });
});

test.describe('Inspector 27/09/2026 · lo que debe rechazarse o avisarse', () => {
  // REPARADO 27/09/2026 (hallazgo 2291): un AFND validado en modo DFA no avisaba de nada.
  // `generarPasosValidacion` tomaba con `find` la PRIMERA transición que casaba, así que el
  // veredicto dependía del orden en que se dibujaron las flechas: en «Contiene 01», q0-0→q0 va
  // antes que q0-0→q1 y el recorrido no salía nunca de q0, de modo que «01», que el lenguaje
  // contiene, salía RECHAZADA sin explicación. Ahora el panel «Validar cadena» avisa de qué lo
  // hace no determinista y, mientras sea así, se recorre como AFND (todas las ramas), así que el
  // veredicto es el del lenguaje: 01, 001 y 1101 contienen «01» ⇒ ACEPTADAS; 110 no ⇒ RECHAZADA.
  test('el AFND «Contiene 01» en modo DFA avisa del no determinismo y no da un veredicto engañoso', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Contiene "01"/ }).click();
    await page.getByRole('button', { name: 'DFA Determinista' }).click();
    await escribirLote(page, '01\n001\n1101\n110');
    const aviso = page
      .locator('main [role="alert"], main [role="status"]')
      .filter({ hasText: /determinista|AFND|más de una transición/i });
    await expect(aviso).not.toHaveCount(0);
    await expect(page.locator('[class*="avisosAutomata"]')).toContainText(
      'Desde q0 hay más de una transición con «0» (a q0 y a q1)',
    );
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/, /Aceptada/, /Aceptada/, /Rechazada/]);

    // Con ε pasa lo mismo: «a*b*c*» en modo DFA avisa de las dos transiciones vacías.
    await page.getByRole('button', { name: /a\*b\*c\*/ }).click();
    await page.getByRole('button', { name: 'DFA Determinista' }).click();
    await expect(page.locator('[class*="avisosAutomata"]')).toContainText('q0 tiene una transición ε');
    // Y en modo NFA, que es lo que es, no hay nada que avisar.
    await page.getByRole('button', { name: /^NFA No determinista/ }).click();
    await expect(page.locator('[class*="avisosAutomata"]')).toHaveText('');
  });

  // REPARADO 27/09/2026 (hallazgo 2290): la minimización no reconocía como equivalentes una
  // transición AUSENTE y una que lleva a un estado trampa explícito, que son el mismo lenguaje (∅).
  //
  // AFD PARCIAL construido sobre el autómata por defecto (q0 inicial, q0-a→q1, q1 final):
  //   + q2 (final) y q3 (no final y sin salidas: un estado trampa), + q0-b→q2 y q2-a→q3.
  //   Lenguaje: {a, b}. Desde q1 solo se acepta ε (no tiene salidas). Desde q2 también solo ε
  //   (con a cae en la trampa q3; con b no hay transición). q1 ≡ q2 ⇒ se fusionan.
  //   Mínimo: 3 estados ({q0}, {q1,q2}, {q3}) contando la trampa, o 2 si se omite como hace el
  //   convenio de AFD parcial de la app. Nunca 4.
  // La app firmaba la transición ausente como «-» y la que va a q3 como «la clase de q3», separaba
  // q1 de q2 en la primera ronda y concluía «ya era mínimo con sus 4 estados».
  //
  // Ahora el AFD se completa con un estado trampa implícito ∅ antes de particionar. A MANO:
  //   P0: finales {q1,q2} | no finales {q0,q3,∅}
  //   R1 (firma con a, b): q1 → (∅, ∅) = (N, N); q2 → (q3, ∅) = (N, N) ⇒ juntos.
  //       q0 → (q1, q2) = (F, F); q3 → (∅, ∅) = (N, N); ∅ → (N, N) ⇒ {q0} | {q3,∅}
  //   R2: nada se parte. Clases: {q0}, {q1,q2}, {q3,∅}. Como la clase de ∅ contiene un estado
  //   dibujado (q3, la trampa), se conserva: 3 estados, y las transiciones que faltaban van a {q3}.
  test('minimizar un AFD parcial con un estado trampa fusiona q1 ≡ q2 (3 estados)', async ({
    page,
  }) => {
    await page.reload();
    await esperarHidratacion(page, ['#cadena', '#casos-respuesta']);

    await page.getByRole('button', { name: 'Añadir estado' }).click();
    for (const [x, y] of [
      [220, 420],
      [520, 420],
    ]) {
      const p = await aPantalla(page, x, y);
      await page.mouse.click(p.x, p.y);
    }
    await expect(page.locator('[class*="estadoResumen"]')).toContainText('4 estados');

    await page.getByRole('button', { name: 'Alternar estado final' }).click();
    await circuloDe(page, 'q2').click();

    const simbolos = ['b', 'a'];
    page.on('dialog', (d) => d.accept(simbolos.shift() ?? ''));
    await page.getByRole('button', { name: 'Añadir transición' }).click();
    await circuloDe(page, 'q0').click();
    await circuloDe(page, 'q2').click();
    await circuloDe(page, 'q2').click();
    await circuloDe(page, 'q3').click();
    await expect(page.locator('[class*="estadoResumen"]')).toContainText('3 transiciones');

    // El lenguaje es {a, b}: lo confirma el propio simulador.
    await escribirLote(page, '\na\nb\nba\nbb\naa');
    await expect(veredictosDelLote(page)).toHaveText([
      /Rechazada/,
      /Aceptada/,
      /Aceptada/,
      /Rechazada/,
      /Sin transición/,
      /Sin transición/,
    ]);

    await page.getByRole('button', { name: 'Minimizar el AFD', exact: true }).click();
    const resultado = page.locator('[class*="convResultado"]');
    await expect(resultado).toContainText('Se fusionan');
    await expect(resultado).toContainText('{q1,q2}');
    await expect(resultado).toContainText('El autómata mínimo tiene 3 estados.');
    await expect(resultado).not.toContainText('ya era mínimo');
    await expect(resultado).toContainText('q3 resulta equivalente');

    // Cargado en el lienzo, el mínimo reconoce el mismo lenguaje {a, b}.
    await page.getByRole('button', { name: 'Cargar el autómata mínimo en el lienzo' }).click();
    await expect(page.locator('[class*="estadoResumen"]')).toContainText('3 estados');
    await expect(veredictosDelLote(page)).toHaveText([
      /Rechazada/,
      /Aceptada/,
      /Aceptada/,
      /Rechazada/,
      /Rechazada/,
      /Rechazada/,
    ]);
  });

  // REPARADO 27/09/2026 (hallazgo 2292): `obtenerCoordenadasSvg` escalaba el clic con el ancho y
  // el alto de la CAJA del SVG (1.038 × 500 px en escritorio), pero el viewBox 800×500 se dibuja
  // encajado (`xMidYMid meet`) a escala 1 y centrado, con ~119 px vacíos a cada lado. Pulsar sobre
  // el punto (220, 420) del dibujo colocaba el estado en x ≈ 261: 41 unidades a la derecha, y
  // arrastrar arrastraba el mismo desfase. Ahora convierte con la inversa de `getScreenCTM`.
  test('«Añadir estado» coloca el estado en el punto pulsado, y arrastrar lo deja bajo el puntero (escritorio)', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Añadir estado' }).click();
    const p = await aPantalla(page, 220, 420);
    await page.mouse.click(p.x, p.y);
    // «Pares de 0»: q0 final (anillo + círculo) y q1 = 3 círculos; el nuevo es el cuarto.
    await expect(lienzo(page).locator('circle')).toHaveCount(4);
    const nuevo = lienzo(page).locator('circle').last();
    expect(Math.abs(Number(await nuevo.getAttribute('cx')) - 220)).toBeLessThanOrEqual(5);
    expect(Math.abs(Number(await nuevo.getAttribute('cy')) - 420)).toBeLessThanOrEqual(5);

    // Arrastre: q1 (520, 250) hasta el punto (650, 120) del dibujo.
    await page.getByRole('button', { name: 'Mover estados' }).click();
    const desde = await aPantalla(page, 520, 250);
    const hasta = await aPantalla(page, 650, 120);
    await page.mouse.move(desde.x, desde.y);
    await page.mouse.down();
    await page.mouse.move(hasta.x, hasta.y, { steps: 8 });
    await page.mouse.up();
    const q1 = circuloDe(page, 'q1');
    expect(Math.abs(Number(await q1.getAttribute('cx')) - 650)).toBeLessThanOrEqual(5);
    expect(Math.abs(Number(await q1.getAttribute('cy')) - 120)).toBeLessThanOrEqual(5);
  });
});

test.describe('Inspector 27/09/2026 · S1 — tolerancia del 1 % frente a respuestas que son recuentos', () => {
  const campo = (page: Page) => page.locator('#casos-respuesta');
  const veredicto = (page: Page) => page.locator('[class*="casoVeredicto"]');

  async function responder(page: Page, texto: string): Promise<void> {
    await campo(page).fill(texto);
    await esperarValorEnReact(page, '#casos-respuesta', texto);
    await page.getByRole('button', { name: 'Comprobar', exact: true }).click();
  }

  // Caso 1 (a mano, cabecera de simulador-automatas-finitos-casos.spec.ts): de 1, 00, 010,
  // 0110, 101 y 0001 tienen un número par de ceros las cuatro primeras ⇒ 4 cadenas aceptadas.
  // Tolerancia = máx(0,01; 1 % de 4) = 0,04 < 1: el entero vecino no puede colarse.
  test('el entero vecino NO cuela: el caso 1 (4 cadenas) acepta 4 y rechaza 3 y 5', async ({ page }) => {
    await page.getByRole('button', { name: /^Caso 1:/ }).click();
    await responder(page, '4');
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await responder(page, '5');
    await expect(veredicto(page)).toContainText('No es correcto');
    await responder(page, '3');
    await expect(veredicto(page)).toContainText('No es correcto');
  });

  // S1 REPARADO 27/09/2026 (hallazgo 2294): la respuesta es un RECUENTO —el propio mensaje de
  // error lo dice: «aquí todas las respuestas son cuentas de algo»—, pero «4,04 cadenas» estaba a
  // 0,04 de 4, justo en la tolerancia del 1 %, y se daba por buena. Pasaba igual con «3,96» y, en
  // el caso 9 (2 estados), con «2,02». Ahora solo vale el entero exacto; «4,0» es 4.
  test('S1: un decimal no pasa por recuento: «4,04» y «3,96» cadenas se rechazan pidiendo un entero', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /^Caso 1:/ }).click();
    for (const casi of ['4,04', '3,96']) {
      await responder(page, casi);
      await expect(veredicto(page)).not.toContainText('¡Correcto!');
      await expect(veredicto(page)).toContainText('número entero');
    }
    await responder(page, '4,0');
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await page.getByRole('button', { name: /^Caso 9:/ }).click();
    await responder(page, '2,02');
    await expect(veredicto(page)).toContainText('No es correcto');
    await responder(page, '2');
    await expect(veredicto(page)).toContainText('¡Correcto!');
  });

  // REPARADO 27/09/2026 (hallazgo 2295): «4,05» quedaba a 0,05 de 4, fuera de la tolerancia, y el
  // rechazo cifraba la desviación con `numero(diferencia)`, que no admite decimales: «Te has
  // desviado 0 de la respuesta». Suspender diciendo que la desviación es cero es el mismo
  // desconcierto que cerró el hallazgo 1211. Ahora un decimal se rechaza por no ser un entero, y
  // la desviación solo se cifra entre enteros, donde nunca es 0.
  test('«4,05» se rechaza pidiendo un entero, nunca «Te has desviado 0»', async ({ page }) => {
    await page.getByRole('button', { name: /^Caso 1:/ }).click();
    await responder(page, '4,05');
    await expect(veredicto(page)).toContainText('No es correcto');
    await expect(veredicto(page)).not.toContainText(/desviado 0 de/);
    await expect(veredicto(page)).toContainText('número entero');
    await page.getByRole('button', { name: /^Caso 9:/ }).click();
    await responder(page, '2,03');
    await expect(veredicto(page)).not.toContainText(/desviado 0 de/);
  });

  // Práctica con Date.now fijado en 1790500000000 (la semilla del generador): sale el AFND
  // «antepenúltimo símbolo es un 1» (k = 3). A mano: el AFD recuerda los tres últimos
  // símbolos, q0 está en todos los subconjuntos y nunca se llega a ∅ ⇒ {q0} ∪ cualquier
  // subconjunto de {q1,q2,q3} = 2³ = 8 estados. Es la respuesta más alta que da la práctica.
  test('práctica con semilla fija (8 estados): acepta 8 y rechaza 7 y 9', async ({ page }) => {
    await page.clock.setFixedTime(new Date(1790500000000));
    await page.reload();
    await esperarHidratacion(page, ['#cadena', '#casos-respuesta']);
    await page.getByRole('button', { name: /Practicar/ }).click();
    await expect(page.locator('[class*="casoEnunciado"]')).toContainText('antepenúltimo');
    await responder(page, '8');
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await responder(page, '9');
    await expect(veredicto(page)).toContainText('No es correcto');
    await responder(page, '7');
    await expect(veredicto(page)).toContainText('No es correcto');
  });

  // Sin navegador: las respuestas de los 12 casos van de 2 a 4, y en 200.000 semillas de la
  // práctica salieron 1, 2, 3, 4, 5, 6 y 8 (medido el 27/09/2026). Ninguna llega a 100, que es
  // donde el 1 % empezaría a admitir X±1: esa mitad de S1 no se da en esta app.
  test('ninguna respuesta de la app llega a 100: X±1 no entra nunca en la tolerancia', () => {
    const valores = new Set<number>(CASOS.map((c) => c.respuesta));
    for (let s = 1; s <= 20000; s++) valores.add(generarEjercicioAleatorio(s).respuesta);
    expect(Math.max(...valores)).toBe(8);
    for (const v of valores) {
      expect(comprobarRespuesta(v + 1, v).correcto, `${v} + 1`).toBe(false);
      expect(comprobarRespuesta(v - 1, v).correcto, `${v} − 1`).toBe(false);
    }
  });
});

test.describe('Inspector 27/09/2026 · móvil 393×851', () => {
  test.use({
    viewport: { width: 393, height: 851 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
  });

  test('sin scroll horizontal y «Termina en ab» da lo mismo que en escritorio', async ({ page }) => {
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);
    await page.getByRole('button', { name: /Termina en "ab"/ }).click();
    await escribirLote(page, 'bab\nabba');
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/, /Rechazada/]);
  });

  // REPARADO 27/09/2026 (hallazgo 2293): el lienzo medía 247 × 500 px a 393 px de ancho y el
  // viewBox 800×500 se encajaba a escala 0,309: el dibujo ocupaba 154 px de alto en medio de 500 y
  // las etiquetas de 13 px («q0», los símbolos de las flechas) se pintaban a 4 px, ilegibles.
  // Ahora el lienzo guarda el aspecto 8/5 del viewBox (el dibujo llena la caja y se ve entero) y
  // la letra del lienzo crece en unidades del viewBox según la escala medida, para no bajar de
  // ~10,5 px en pantalla. Se miden TODAS las etiquetas, no solo la primera, y con un ejemplo de
  // tres estados para que haya símbolos de flecha y autobucles.
  test('en móvil las etiquetas del lienzo se leen (≥ 10 px) y la caja no deja franjas vacías', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Termina en "ab"/ }).click();
    const medida = await lienzo(page).evaluate((el) => {
      const svg = el as SVGSVGElement;
      const m = svg.getScreenCTM();
      const caja = svg.getBoundingClientRect();
      const textos = [...svg.querySelectorAll('text')];
      const min = Math.min(
        ...textos.map((t) => parseFloat(getComputedStyle(t).fontSize) * (m ? m.a : 0)),
      );
      return { min, n: textos.length, alto: caja.height, ancho: caja.width, escalaY: m ? m.d : 0 };
    });
    expect(medida.n).toBeGreaterThan(0);
    expect(medida.min).toBeGreaterThanOrEqual(10);
    // El dibujo ocupa la caja entera: 500 unidades a la escala del encaje = alto de la caja.
    expect(Math.abs(medida.escalaY * 500 - medida.alto)).toBeLessThanOrEqual(2);
    // Y la página no se desplaza en horizontal por culpa del lienzo.
    const anchos = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(anchos.scroll).toBeLessThanOrEqual(anchos.cliente);
  });

  // REPARADO 27/09/2026 (hallazgo 2292, móvil): el mismo desfase del clic que en escritorio, aquí
  // en vertical y mayor. El dibujo empezaba 173 px por debajo del borde del SVG; tocar sobre el
  // punto (400, 400) del dibujo (173 + 400 × 0,309 = 296 px bajo el borde) se convertía en
  // y = 296 del viewBox: el estado aparecía unas 103 unidades —32 px de pantalla— por encima del
  // dedo. Con la inversa de `getScreenCTM` cuenta también el desplazamiento de la caja del lienzo.
  test('en móvil un toque en «Añadir estado» deja el estado bajo el dedo', async ({ page }) => {
    await page.getByRole('button', { name: 'Añadir estado' }).click();
    const p = await aPantalla(page, 400, 400);
    await page.touchscreen.tap(p.x, p.y);
    await expect(lienzo(page).locator('circle')).toHaveCount(4);
    const nuevo = lienzo(page).locator('circle').last();
    expect(Math.abs(Number(await nuevo.getAttribute('cx')) - 400)).toBeLessThanOrEqual(5);
    expect(Math.abs(Number(await nuevo.getAttribute('cy')) - 400)).toBeLessThanOrEqual(5);
  });
});
