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

// ════════════════════════════════════════════════════════════════════════════════════════
// INSPECTOR 30/09/2026 — la sospecha del editor táctil y de teclado, y tres casos nuevos
// ════════════════════════════════════════════════════════════════════════════════════════
//
// Entró por la sospecha del 27/09/2026 (SOSPECHAS.md): «el editor no admite arrastre táctil (no
// tiene manejadores touch) ni se puede usar con teclado (el SVG es role=img)». Medido en
// navegador, 390×844 con isMobile y hasTouch:
//   · CREAR, CONECTAR, MARCAR y BORRAR con el dedo SÍ funcionan: son toques, y el navegador los
//     convierte en clics. El autómata del caso normal móvil se construye entero así.
//   · ARRASTRAR un estado con el dedo NO lo mueve: la app solo escucha mousedown/mousemove, que
//     un gesto de arrastre táctil no produce; el dedo desplaza la página (37 px medidos).
//   · Con TECLADO no hay ninguna ruta al lienzo: 0 elementos enfocables dentro del editor.
//   · El lienzo NO atrapa el desplazamiento (touch-action: auto, y 49 px libres a cada lado).
// Todos los valores esperados se calcularon a mano antes de abrir el navegador.

/** Nombre del panel «Editor visual» (el lienzo, su barra y su resumen). */
const panelDelEditor = (page: Page) =>
  page.locator('div', { has: page.getByRole('heading', { level: 2, name: 'Editor visual' }) }).last();

/**
 * Contraste WCAG del texto de un elemento contra su fondo real: compone los fondos
 * semitransparentes de los antepasados hasta el primero opaco (blanco si no hay ninguno). Medir
 * el color con una expresión regular sobre el CSS miente: estos fondos son rgba al 12-15 %.
 */
async function contrasteDe(loc: import('@playwright/test').Locator): Promise<number> {
  return loc.evaluate((el) => {
    type Rgba = { r: number; g: number; b: number; a: number };
    const parse = (c: string): Rgba => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return { r: 0, g: 0, b: 0, a: 0 };
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const sobre = (arriba: Rgba, abajo: Rgba): Rgba => ({
      r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
      g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
      b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
      a: 1,
    });
    const lum = ({ r, g, b }: Rgba): number => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const pila: Rgba[] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c.a > 0) pila.push(c);
      if (c.a === 1) break;
    }
    let fondo: Rgba = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = pila.length - 1; i >= 0; i--) fondo = sobre(pila[i], fondo);
    const texto = sobre(parse(getComputedStyle(el).color), fondo);
    const [l1, l2] = [lum(texto), lum(fondo)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  });
}

test.describe('Inspector 30/09/2026 · casos resueltos a mano (escritorio)', () => {
  // CASO LÍMITE — AFND-ε «a*b*c*» → AFD → mínimo. A MANO, construcción de subconjuntos desde
  // ε-clausura(q0) = {q0,q1,q2} y con el alfabeto de las transiciones {a, b, c}:
  //   {q0,q1,q2}  a → cl{q0} = {q0,q1,q2}   b → cl{q1} = {q1,q2} (nuevo)   c → {q2} (nuevo)
  //   {q1,q2}     a → ∅                     b → {q1,q2}                    c → {q2}
  //   {q2}        a → ∅                     b → ∅                          c → {q2}
  // 9 filas, 3 con ∅; 3 estados y los TRES finales (todos contienen q2); 6 transiciones.
  // Lenguaje del AFD cargado (DFA parcial): ε, abc, aabbcc ACEPTADAS; «cb» ({q2} sin b) y «ba»
  // ({q1,q2} sin a) SIN TRANSICIÓN.
  // Minimizado: P0 = {A,B,C} | {∅ implícito}. Firmas (a,b,c): A → (F,F,F) · B → (∅,F,F) ·
  // C → (∅,∅,F): se separan los tres en la ronda 1 y nada más ⇒ «ya era mínimo con sus 3
  // estados», y ningún estado dibujado es equivalente a ∅.
  test('determinizar «a*b*c*» da la tabla de 9 filas y 3 estados finales, y el AFD ya es mínimo', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /a\*b\*c\*/ }).click();
    await page.getByRole('button', { name: 'Determinizar (AFND → AFD)', exact: true }).click();
    const resultado = page.locator('[class*="convResultado"]');
    const filas = await resultado
      .locator('table tbody tr')
      .evaluateAll((trs) => trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => (td.textContent ?? '').trim())));
    expect(filas).toEqual([
      ['{q0,q1,q2}', 'a', '{q0,q1,q2}'],
      ['{q0,q1,q2}', 'b', '{q1,q2}nuevo'],
      ['{q0,q1,q2}', 'c', '{q2}nuevo'],
      ['{q1,q2}', 'a', '∅'],
      ['{q1,q2}', 'b', '{q1,q2}'],
      ['{q1,q2}', 'c', '{q2}'],
      ['{q2}', 'a', '∅'],
      ['{q2}', 'b', '∅'],
      ['{q2}', 'c', '{q2}'],
    ]);
    await expect(resultado.locator('[class*="convResumen"]')).toHaveText(
      'El AFD resultante tiene 3 estados sobre el alfabeto {a, b, c}. Son finales los conjuntos que contienen algún estado final del original: {q0,q1,q2}, {q1,q2}, {q2}.',
    );

    await page.getByRole('button', { name: 'Cargar el AFD en el lienzo' }).click();
    const resumen = page.locator('[class*="estadoResumen"]');
    await expect(resumen).toContainText('3 estados');
    await expect(resumen).toContainText('6 transiciones');
    await expect(resumen).toContainText('Finales: 3');
    await expect(page.getByRole('button', { name: 'DFA Determinista' })).toHaveAttribute('aria-pressed', 'true');
    await escribirLote(page, '\nabc\ncb\nba\naabbcc');
    await expect(veredictosDelLote(page)).toHaveText([
      /Aceptada/,
      /Aceptada/,
      /Sin transición/,
      /Sin transición/,
      /Aceptada/,
    ]);

    await page.getByRole('button', { name: 'Minimizar el AFD', exact: true }).click();
    await expect(resultado).toContainText('ya era mínimo con sus 3 estados');
    await expect(resultado).toContainText('Ningún estado dibujado es equivalente a él');
  });

  // LO QUE DEBE RECHAZARSE, a mano: minimizar exige un AFD sin ε y sin dos flechas con el mismo
  // origen y símbolo hacia destinos distintos («Contiene 01»: q0-0→q0 y q0-0→q1); sin estado
  // inicial no hay por dónde empezar; y «abc» no es una entrada de «Termina en ab» (c ∉ {a, b}).
  test('minimizar un AFND o un AFND-ε, determinizar sin inicial y validar «abc» sobre {a, b} se rechazan diciendo por qué', async ({
    page,
  }) => {
    const error = page.locator('[class*="convError"]');
    await page.getByRole('button', { name: /Contiene "01"/ }).click();
    await page.getByRole('button', { name: 'Minimizar el AFD', exact: true }).click();
    await expect(error).toHaveAttribute('role', 'alert');
    await expect(error).toContainText(
      'Hay más de una transición con el mismo origen y símbolo: esto es un AFND. Determinízalo primero.',
    );
    await page.getByRole('button', { name: /a\*b\*c\*/ }).click();
    await page.getByRole('button', { name: 'Minimizar el AFD', exact: true }).click();
    await expect(error).toContainText('Solo se minimiza un AFD, y este tiene transiciones ε. Determinízalo primero.');
    await page.getByRole('button', { name: 'Limpiar lienzo' }).click();
    await page.getByRole('button', { name: 'Determinizar (AFND → AFD)', exact: true }).click();
    await expect(error).toContainText('El autómata no tiene estado inicial: no hay por dónde empezar.');

    await page.getByRole('button', { name: /Termina en "ab"/ }).click();
    await page.locator('#cadena').fill('abc');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    await expect(page.locator('[role="alert"]', { hasText: 'FUERA DEL ALFABETO' })).toBeVisible();
    await expect(anunciadorDelPaso(page)).toContainText(
      '"c" no pertenece al alfabeto declarado {a, b}: la cadena no es una entrada válida',
    );
  });

  // ABIERTO (Inspector 30/09/2026): una flecha repetida idéntica no hace no determinista un AFD
  // —el propio motor lo dice en `conflictosDeterminismo`: «Dos flechas iguales (mismo origen,
  // símbolo y destino) no son no determinismo: son una»—, y la validación lo trata así (sin
  // aviso). Pero `minimizar` mira solo origen|símbolo y lo rechaza como AFND.
  // A MANO, «Pares de 0» + otra q0-0→q1: δ no cambia, así que 00 ACEPTADA, 0 RECHAZADA, y
  // minimizado P0 = {q0} | {q1}, firmas (0,1): q0 → (N,F), q1 → (F,N); nada que fusionar ⇒
  // «ya era mínimo con sus 2 estados».
  test('una flecha repetida idéntica no convierte el AFD en AFND al minimizar', async ({ page }) => {
    test.fail(); // ABIERTO (Inspector 30/09/2026)
    page.once('dialog', (d) => d.accept('0'));
    await page.getByRole('button', { name: 'Añadir transición' }).click();
    await circuloDe(page, 'q0').click();
    await circuloDe(page, 'q1').click();
    await expect(page.locator('[class*="estadoResumen"]')).toContainText('5 transiciones');
    await expect(page.locator('[class*="avisosAutomata"]')).toHaveText('');
    await escribirLote(page, '00\n0');
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/, /Rechazada/]);

    await page.getByRole('button', { name: 'Minimizar el AFD', exact: true }).click();
    await expect(page.locator('[class*="convResultado"]')).toContainText('ya era mínimo con sus 2 estados');
    await expect(page.locator('[class*="convError"]')).toHaveCount(0);
  });

  // ABIERTO (Inspector 30/09/2026): `cargarEnLienzo` da a los estados cargados el id s0, s1… y
  // la etiqueta del conjunto; la traza de la validación escribe el ID. A MANO, sobre el AFD de
  // «a*b*c*» cargado en el lienzo, «ab»: {q0,q1,q2} -a→ {q0,q1,q2} -b→ {q1,q2} (final) ⇒
  // ACEPTADA. La app dice «Estado(s) inicial(es): s0», «Lee "a" → s0», «Lee "b" → s1»: nombres
  // que no aparecen en ninguna parte de la pantalla (el lienzo resalta bien {q1,q2}). El
  // anunciador es aria-live: para quien no ve el lienzo, la traza es lo único que hay.
  test('tras cargar el AFD en el lienzo, la traza nombra los estados como el lienzo', async ({ page }) => {
    test.fail(); // ABIERTO (Inspector 30/09/2026)
    await page.getByRole('button', { name: /a\*b\*c\*/ }).click();
    await page.getByRole('button', { name: 'Determinizar (AFND → AFD)', exact: true }).click();
    await page.getByRole('button', { name: 'Cargar el AFD en el lienzo' }).click();
    await page.locator('#cadena').fill('ab');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await expect(anunciadorDelPaso(page)).toContainText('Paso 1 / 3: Estado(s) inicial(es): {q0,q1,q2}');
    const pasoSiguiente = page.getByRole('button', { name: 'Paso siguiente', exact: true });
    await pasoSiguiente.click();
    await pasoSiguiente.click();
    await expect(anunciadorDelPaso(page)).toContainText('Paso 3 / 3: Lee "b" → {q1,q2}');
    await expect(page.locator('[role="alert"]', { hasText: 'ACEPTADA' })).toBeVisible();
  });

  // ABIERTO (Inspector 30/09/2026): con el lienzo vacío, el mensaje «Activa «Añadir estado» y
  // haz clic en el lienzo» ocupa el centro y NO lleva `pointer-events: none` (las etiquetas de
  // estado y de flecha sí): el clic cae en el <text>, `handleClickLienzo` solo acepta svg o
  // rect, y no se crea nada. Mide 315 × 21 unidades en escritorio y 574 × 38 en móvil (el 72 %
  // del ancho). A MANO: «Limpiar todo», «Añadir estado» y clic en el centro (400, 250) ⇒ un
  // estado q0, inicial por ser el primero, en (400, 250).
  test('con el lienzo vacío, un clic sobre el mensaje del centro crea el estado', async ({ page }) => {
    test.fail(); // ABIERTO (Inspector 30/09/2026)
    await page.getByRole('button', { name: 'Limpiar lienzo' }).click();
    await page.getByRole('button', { name: 'Añadir estado' }).click();
    const p = await aPantalla(page, 400, 250);
    await page.mouse.click(p.x, p.y);
    await expect(page.locator('[class*="estadoResumen"]')).toContainText('1 estado');
    await expect(page.locator('[class*="estadoResumen"]')).toContainText('Iniciales: 1');
  });

  // ABIERTO (Inspector 30/09/2026): sin ratón no se puede editar el autómata. Todo lo que hace
  // el editor (añadir estado, transición, marcar inicial o final, borrar) exige pulsar dentro
  // del <svg role="img">, que no tiene ni un elemento enfocable: con «Añadir estado» activado
  // por teclado, el Tab salta de «Limpiar todo» a «Determinizar (AFND → AFD)», en otro panel.
  // WCAG 2.1.1 (nivel A). Se exige lo mínimo que cualquier reparación deja: algo enfocable en
  // el panel del editor fuera de la barra de herramientas.
  test('el panel del editor tiene, fuera de la barra, algo alcanzable con el teclado', async ({ page }) => {
    test.fail(); // ABIERTO (Inspector 30/09/2026)
    const enfocables = await panelDelEditor(page).evaluate(
      (panel) =>
        [...panel.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter(
          (el) => !el.closest('[role="toolbar"]') && (el as HTMLElement).tabIndex >= 0,
        ).length,
    );
    expect(enfocables).toBeGreaterThan(0);
  });

  // ABIERTO (Inspector 30/09/2026): el veredicto es EL resultado de la app y se pinta en verde,
  // rojo y naranja claros sobre un fondo del mismo color al 12-15 %. Texto de 16,8 px en negrita
  // (13,6 px en el lote): no es «texto grande» (< 18,66 px en negrita), así que WCAG 1.4.3 pide
  // 4,5:1. Medido en tema claro: ACEPTADA 2,20:1 · RECHAZADA 3,09:1 (lote 3,22:1) · SIN
  // TRANSICIÓN 2,13:1. «Pares de 0»: «00» ACEPTADA y «0» RECHAZADA (trazas del caso 1 y 3).
  test('el veredicto se lee: 4,5:1 en la validación y en el lote (tema claro)', async ({ page }) => {
    test.fail(); // ABIERTO (Inspector 30/09/2026)
    await escribirLote(page, '00\n0');
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/, /Rechazada/]);
    expect(await contrasteDe(page.locator('[class*="badgeAceptada"]').first())).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteDe(page.locator('[class*="badgeRechazada"]').first())).toBeGreaterThanOrEqual(4.5);
    await page.locator('#cadena').fill('00');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    const alerta = page.locator('[role="alert"]', { hasText: 'ACEPTADA' });
    await expect(alerta).toBeVisible();
    expect(await contrasteDe(alerta)).toBeGreaterThanOrEqual(4.5);
  });

  // ABIERTO (Inspector 30/09/2026) — la sospecha del 28/09 (contraste de marca en botones y en
  // «Casos para clase», sin medir en esta app): texto blanco sobre var(--primary) da 4,11:1 en
  // claro y 2,79:1 en oscuro («Validar», «Cargar el AFD en el lienzo», «Comprobar», el caso
  // activo), y el título del caso en var(--secondary) 2,68:1. Todo es texto de 15-17,6 px ⇒ 4,5:1.
  test('los botones de marca y el título del caso se leen (4,5:1, tema claro)', async ({ page }) => {
    test.fail(); // ABIERTO (Inspector 30/09/2026)
    await page.getByRole('button', { name: /^Caso 1:/ }).click();
    expect(await contrasteDe(page.getByRole('button', { name: 'Validar', exact: true }))).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteDe(page.getByRole('button', { name: 'Comprobar', exact: true }))).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteDe(page.locator('[class*="casoTitulo"]'))).toBeGreaterThanOrEqual(4.5);
  });

  // ABIERTO (Inspector 30/09/2026): tres botones de la barra se anuncian con un nombre que no
  // contiene lo que pone en ellos (WCAG 2.5.3, nivel A): quien los maneja por voz y dice lo que
  // lee («pulsa Toggle final», «pulsa Limpiar todo») no los activa. «Toggle final» es además un
  // anglicismo en una interfaz en español.
  test('cada botón de la barra se anuncia con un nombre que contiene su texto visible', async ({ page }) => {
    test.fail(); // ABIERTO (Inspector 30/09/2026)
    const botones = await page.locator('[role="toolbar"] button').evaluateAll((bs) =>
      bs.map((b) => ({
        visible: [...b.childNodes]
          .filter((n) => !(n instanceof Element && n.getAttribute('aria-hidden') === 'true'))
          .map((n) => n.textContent ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim(),
        nombre: b.getAttribute('aria-label') ?? (b.textContent ?? '').trim(),
      })),
    );
    const discordantes = botones
      .filter((b) => !b.nombre.toLowerCase().includes(b.visible.toLowerCase()))
      .map((b) => `«${b.visible}» se anuncia «${b.nombre}»`);
    expect(discordantes).toEqual([]);
  });
});

test.describe('Inspector 30/09/2026 · móvil 390×844 con el dedo', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /** Toca el punto (x, y) del viewBox con el lienzo centrado en pantalla. */
  async function tocarEnLienzo(page: Page, x: number, y: number): Promise<void> {
    await lienzo(page).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const p = await aPantalla(page, x, y);
    await page.touchscreen.tap(p.x, p.y);
  }

  // CASO NORMAL construido ENTERO con toques: AFD «número IMPAR de aes» sobre {a, b}.
  //   q0 (inicial) -a→ q1 · q1 -a→ q0 · q0 -b→ q0 · q1 -b→ q1 · q1 final
  // A MANO: bab → q0 -b→ q0 -a→ q1 -b→ q1 (final) ⇒ ACEPTADA (4 pasos, el último «Lee "b" → q1»)
  //         aab → q0 -a→ q1 -a→ q0 -b→ q0 ⇒ RECHAZADA · ε → q0 ⇒ RECHAZADA
  //         abc → «c» ∉ {a, b} ⇒ FUERA DEL ALFABETO
  // Los estados se ponen en y = 380, lejos del mensaje del lienzo vacío (ver el ABIERTO de arriba).
  // El `beforeEach` carga «Pares de 0», que declara Σ = {0, 1}, y «Limpiar todo» no toca el
  // alfabeto: se declara {a, b} a mano, o bab y aab saldrían FUERA DEL ALFABETO (y con razón).
  test('crear, conectar y marcar final con el dedo: el AFD «impar de aes» valida lo calculado a mano', async ({
    page,
  }) => {
    const simbolos = ['a', 'a', 'b', 'b'];
    page.on('dialog', (d) => d.accept(simbolos.shift() ?? ''));
    await page.locator('#alfabeto').fill('a,b');
    await esperarValorEnReact(page, '#alfabeto', 'a,b');
    await page.getByRole('button', { name: 'Limpiar lienzo' }).click();
    await page.getByRole('button', { name: 'Añadir estado' }).click();
    await tocarEnLienzo(page, 200, 380);
    await tocarEnLienzo(page, 550, 380);
    await expect(page.locator('[class*="estadoResumen"]')).toContainText('2 estados');

    await page.getByRole('button', { name: 'Añadir transición' }).click();
    for (const [de, a] of [
      [200, 550],
      [550, 200],
      [200, 200],
      [550, 550],
    ]) {
      await tocarEnLienzo(page, de, 380);
      await tocarEnLienzo(page, a, 380);
    }
    await page.getByRole('button', { name: 'Alternar estado final' }).click();
    await tocarEnLienzo(page, 550, 380);
    const resumen = page.locator('[class*="estadoResumen"]');
    await expect(resumen).toContainText('4 transiciones');
    await expect(resumen).toContainText('Iniciales: 1');
    await expect(resumen).toContainText('Finales: 1');
    // Determinista y con el alfabeto coherente: nada que avisar.
    await expect(page.locator('[class*="avisosAutomata"]')).toHaveText('');

    await escribirLote(page, 'bab\naab\n\nabc');
    await expect(veredictosDelLote(page)).toHaveText([/Aceptada/, /Rechazada/, /Rechazada/, /Fuera del alfabeto/]);
    await page.locator('#cadena').fill('bab');
    await page.getByRole('button', { name: 'Validar', exact: true }).click();
    await expect(page.locator('[role="alert"]', { hasText: 'ACEPTADA' })).toBeVisible();
    await expect(anunciadorDelPaso(page)).toContainText('Paso 4 / 4: Lee "b" → q1');
  });

  // ABIERTO (Inspector 30/09/2026) — la sospecha del 27/09, con caso: en «Mover» (el modo de
  // entrada, «Arrastra los estados para reorganizarlos») el dedo no mueve nada. La app solo
  // escucha mousedown/mousemove/mouseup, y un arrastre táctil no los genera: el navegador lo
  // toma como desplazamiento de la página. El gesto se envía como toques reales (CDP
  // Input.dispatchTouchEvent), no como ratón. A MANO: arrastrar q1 de (520, 250) a (650, 120)
  // lo deja en (650, 120) ±5, como hace el ratón en escritorio (caso del 27/09); y mientras se
  // arrastra un estado la página no se desplaza. Medido: q1 sigue en (520, 250) y la página
  // baja 37 px.
  test('arrastrar un estado con el dedo lo deja bajo el dedo y no desplaza la página', async ({ page }) => {
    test.fail(); // ABIERTO (Inspector 30/09/2026)
    await lienzo(page).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const desde = await aPantalla(page, 520, 250);
    const hasta = await aPantalla(page, 650, 120);
    const scrollAntes = await page.evaluate(() => window.scrollY);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: desde.x, y: desde.y }] });
    for (let i = 1; i <= 12; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: desde.x + ((hasta.x - desde.x) * i) / 12, y: desde.y + ((hasta.y - desde.y) * i) / 12 }],
      });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();

    const q1 = circuloDe(page, 'q1');
    await expect
      .poll(async () => Math.abs(Number(await q1.getAttribute('cx')) - 650), { timeout: 2000 })
      .toBeLessThanOrEqual(5);
    expect(Math.abs(Number(await q1.getAttribute('cy')) - 120)).toBeLessThanOrEqual(5);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - scrollAntes)).toBeLessThanOrEqual(2);
  });

  // CANDADO (pasa hoy): el lienzo no atrapa el desplazamiento. A 390 px deja 49 px libres a cada
  // lado y un deslizamiento vertical por ese margen desplaza la página. Si una reparación del
  // arrastre táctil pone `touch-action: none` en el lienzo, este margen es lo que mantiene la
  // página desplazable (la receta de simulador-grafos, 28/09/2026: manipulation y preventDefault
  // solo mientras se arrastra).
  test('el lienzo deja margen libre y deslizar por él desplaza la página', async ({ page }) => {
    await lienzo(page).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const margen = await lienzo(page).evaluate((el) => {
      const caja = el.getBoundingClientRect();
      return { izquierda: caja.left, derecha: document.documentElement.clientWidth - caja.right, centroY: caja.top + caja.height / 2 };
    });
    expect(Math.min(margen.izquierda, margen.derecha)).toBeGreaterThanOrEqual(40);
    const scrollAntes = await page.evaluate(() => window.scrollY);
    const cdp = await page.context().newCDPSession(page);
    const x = margen.izquierda / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: margen.centroY }] });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: margen.centroY - 15 * i }] });
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 2000 }).toBeGreaterThan(scrollAntes + 50);
  });
});
