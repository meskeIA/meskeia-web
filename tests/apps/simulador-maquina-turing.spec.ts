import { test, expect, type Page } from '@playwright/test';

/**
 * Simulador de Máquina de Turing — Inspector, 25/08/2026
 *
 * Aquí la verdad es exacta: dada la cinta inicial y la tabla de transiciones, la cinta
 * final, el estado final y el NÚMERO DE PASOS están determinados. Por eso cada valor
 * esperado de este fichero está trazado A MANO sobre la tabla de reglas de
 * `app/simulador-maquina-turing/page.tsx` (constante PROGRAMAS), nunca copiado de lo
 * que devuelve la app.
 *
 * CONVENIOS DE LA APP QUE SE VERIFICAN AQUÍ
 *   · «Pasos ejecutados» cuenta transiciones aplicadas. Un intento sin regla aplicable
 *     NO cuenta: la máquina para y el contador se queda donde estaba.
 *   · «Movimientos del cabezal» no cuenta el movimiento S (quieto).
 *   · «Símbolos escritos» cuenta escrituras que CAMBIAN la celda, no todas las escrituras.
 *   · «Cinta final (limpia)» recorta los blancos de los extremos; si no queda nada,
 *     muestra «(cinta vacía)».
 *   · La cinta es ilimitada por los dos lados: al salir por un extremo se añade una
 *     celda en blanco y no se pierde ningún símbolo (caso 2).
 */

const RUTA = '/simulador-maquina-turing/';

/** Valor de una tarjeta de métrica, localizada por su etiqueta (sin clases hasheadas). */
function metrica(page: Page, etiqueta: string) {
  return page
    .getByText(etiqueta, { exact: true })
    .locator('xpath=following-sibling::span');
}

/** Insignia del estado actual de la máquina: renderiza «Estado:» + estado. */
function estadoActual(page: Page) {
  return page.getByText('Estado:', { exact: true }).locator('xpath=..');
}

/** Caja de resultado (role="status"): LISTA / ACEPTADO / RECHAZADO. */
function resultado(page: Page) {
  return page.locator('[role="status"]');
}

/**
 * Avanza `veces` transiciones con «Paso siguiente» comprobando que cada clic
 * aplica exactamente UNA. Así el conteo no depende de temporizadores.
 */
async function avanzar(page: Page, veces: number, desde = 0) {
  const boton = page.getByRole('button', { name: 'Paso siguiente' });
  for (let i = 1; i <= veces; i++) {
    await boton.click();
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText(String(desde + i));
  }
}

/** Carga una cinta distinta de la del programa y deja la máquina lista para arrancar. */
async function cargarCinta(page: Page, contenido: string) {
  await page.locator('#cinta-inicial').fill(contenido);
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  await expect(metrica(page, 'Pasos ejecutados')).toHaveText('0');
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Simulador de Máquina de Turing'
  );
});

// ============================================================
// CASO 1 — Normal: incrementador binario sobre 1011
// ============================================================
//
// TRAZA A MANO (programa «Incrementador binario», cinta 1011, q0, finales {qf}).
// Reglas: q0 0→0,R,q0 · q0 1→1,R,q0 · q0 _→_,L,q1 · q1 0→1,L,q2 · q1 1→0,L,q1 ·
//         q1 _→1,S,qf · q2 0→0,L,q2 · q2 1→1,L,q2 · q2 _→_,R,qf
//
//   #   estado  celda  cinta después        cabezal
//   1   q0      1      1011                 0→1     (avanza a la derecha)
//   2   q0      0      1011                 1→2
//   3   q0      1      1011                 2→3
//   4   q0      1      1011_                3→4     (nace un blanco por la derecha)
//   5   q0      _      1011_                4→3     vuelve, pasa a q1
//   6   q1      1      1010_                3→2     escribe 0, arrastra acarreo  (escritura 1)
//   7   q1      1      1000_                2→1     escribe 0, arrastra acarreo  (escritura 2)
//   8   q1      0      1100_                1→0     escribe 1, acarreo resuelto  (escritura 3)
//   9   q2      1      _1100_               0→0     sale por la izquierda: nace un blanco
//  10   q2      _      _1100_               0→1     regla q2 _→_,R,qf  ⇒  ACEPTADO
//
// 1011₂ = 11; 11 + 1 = 12 = 1100₂. Total: 10 pasos, 3 escrituras, 10 movimientos
// (ninguna regla usada fue S), estado final qf.
test.describe('Caso 1 · Incrementador binario 1011 → 1100', () => {
  test('paso a paso: 10 transiciones exactas y cinta 1100', async ({ page }) => {
    // Estado de partida antes de tocar nada.
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('0');
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('1011');
    await expect(estadoActual(page)).toHaveText('Estado:q0');
    await expect(resultado(page)).toContainText('LISTA');

    await avanzar(page, 10);

    // Valores de la traza de arriba, escritos literales.
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('1100');
    await expect(estadoActual(page)).toHaveText('Estado:qf');
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('10');
    await expect(metrica(page, 'Símbolos escritos')).toHaveText('3');
    await expect(metrica(page, 'Movimientos del cabezal')).toHaveText('10');
    await expect(resultado(page)).toContainText('ACEPTADO');

    // El paso 11 no existe: entrar en qf detiene la máquina.
    await expect(page.getByRole('button', { name: 'Paso siguiente' })).toBeDisabled();
  });

  test('ejecución continua: mismo resultado que paso a paso', async ({ page }) => {
    // La animación no puede cambiar el cómputo: 10 pasos y 1100 también con «Iniciar».
    await page.locator('#velocidad-slider').fill('100');
    await page.getByRole('button', { name: 'Iniciar', exact: true }).click();

    await expect(resultado(page)).toContainText('ACEPTADO', { timeout: 20000 });
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('10');
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('1100');
    await expect(estadoActual(page)).toHaveText('Estado:qf');
  });
});

// ============================================================
// CASO 2 — Límite: el cabezal sale por el extremo izquierdo, y cinta vacía
// ============================================================
//
// TRAZA A MANO (mismo incrementador, cinta 111 = 7; 7 + 1 = 8 = 1000₂).
// El acarreo se propaga por TODA la cadena, así que el cabezal se sale por la izquierda
// y la cinta tiene que crecer por ese lado: el resultado ocupa 4 celdas donde había 3.
//
//   #   estado  celda  cinta después   cabezal
//   1   q0      1      111             0→1
//   2   q0      1      111             1→2
//   3   q0      1      111_            2→3     (blanco por la derecha)
//   4   q0      _      111_            3→2     pasa a q1
//   5   q1      1      110_            2→1     (escritura 1)
//   6   q1      1      100_            1→0     (escritura 2)
//   7   q1      1      _000_           0→0     (escritura 3) sale por la IZQUIERDA:
//                                              nace un blanco, no se pierde ningún 0
//   8   q1      _      1000_           0→0     regla q1 _→1,S,qf (escritura 4, mueve S)
//                                              ⇒ ACEPTADO
//
// Total: 8 pasos, 4 escrituras y solo 7 movimientos — el paso 8 usa S y no mueve.
//
// Cinta vacía: la app la sustituye por una sola celda en blanco, así que la máquina
// arranca leyendo _ en q0:  #1 q0 _→_,L,q1 (nace blanco a la izquierda) · #2 q1 _→1,S,qf.
// Resultado 0 + 1 = 1, en 2 pasos, 1 escritura y 1 movimiento.
test.describe('Caso 2 · Límites de la cinta', () => {
  test('111 → 1000: la cinta crece por la izquierda y no pierde símbolos', async ({
    page,
  }) => {
    await cargarCinta(page, '111');
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('111');

    await avanzar(page, 8);

    // 4 dígitos donde había 3: la celda del acarreo nació a la izquierda del 111.
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('1000');
    await expect(estadoActual(page)).toHaveText('Estado:qf');
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('8');
    await expect(metrica(page, 'Símbolos escritos')).toHaveText('4');
    await expect(metrica(page, 'Movimientos del cabezal')).toHaveText('7'); // el 8.º es S
    await expect(resultado(page)).toContainText('ACEPTADO');
  });

  test('cinta vacía → 1 en 2 pasos', async ({ page }) => {
    await cargarCinta(page, '');
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('(cinta vacía)');

    await avanzar(page, 2);

    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('1');
    await expect(estadoActual(page)).toHaveText('Estado:qf');
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('2');
    await expect(metrica(page, 'Movimientos del cabezal')).toHaveText('1'); // el 2.º es S
    await expect(resultado(page)).toContainText('ACEPTADO');
  });
});

// ============================================================
// CASO 3 — Rechazo: par (estado, símbolo) sin transición definida
// ============================================================
//
// TRAZA A MANO (programa «Palíndromos binarios», cinta 10, q0, finales {qf}).
// Reglas usadas: q0 1→_,R,q2 · q2 0→0,R,q2 · q2 _→_,L,q4 · q4 1→_,L,q5 · q4 _→_,S,qf
//
//   #   estado  celda  cinta después   cabezal
//   1   q0      1      _0              0→1     borra el 1 y recuerda «espero un 1» (q2)
//   2   q2      0      _0_             1→2     (blanco por la derecha)
//   3   q2      _      _0_             2→1     retrocede a la última celda, pasa a q4
//   —   q4      0      —               —       q4 solo tiene reglas para 1 y para _:
//                                              (q4, 0) NO EXISTE ⇒ la máquina para
//
// «10» no es palíndromo, y el rechazo llega por falta de regla, no por estado de rechazo.
// La app debe: parar (no colgarse), decirlo («RECHAZADO (sin regla aplicable)»), dejar
// el estado en q4 y NO contar el intento fallido — el contador se queda en 3.
test.describe('Caso 3 · Palíndromos, entrada 10: rechazo sin regla aplicable', () => {
  test('para en q4 tras 3 pasos y avisa; el intento fallido no cuenta', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Palíndromos binarios/ }).click();
    await cargarCinta(page, '10');

    await avanzar(page, 3);
    await expect(estadoActual(page)).toHaveText('Estado:q4');
    await expect(resultado(page)).toContainText('LISTA'); // aún no ha intentado el 4.º

    // 4.º intento: no hay regla para (q4, 0).
    await page.getByRole('button', { name: 'Paso siguiente' }).click();

    await expect(resultado(page)).toContainText('RECHAZADO (sin regla aplicable)');
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('3'); // sigue en 3, no 4
    await expect(estadoActual(page)).toHaveText('Estado:q4'); // no salta a qf
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('0');
    // La máquina está detenida: no se puede seguir pulsando.
    await expect(page.getByRole('button', { name: 'Paso siguiente' })).toBeDisabled();
  });

  test('1001 sí es palíndromo: ACEPTADO en 15 pasos', async ({ page }) => {
    // Contraprueba del caso anterior con la cinta que trae el propio programa.
    // Traza a mano abreviada: se van borrando por parejas los extremos iguales
    // (1…1 y luego 0…0) y la cinta queda vacía; el paso 15 aplica q0 _→_,S,qf.
    await page.getByRole('button', { name: /Palíndromos binarios/ }).click();
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('1001');

    await avanzar(page, 15);

    await expect(resultado(page)).toContainText('ACEPTADO');
    await expect(estadoActual(page)).toHaveText('Estado:qf');
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('15');
    await expect(metrica(page, 'Símbolos escritos')).toHaveText('4'); // 4 celdas borradas
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('(cinta vacía)');
  });
});
