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
 *   · «Celdas modificadas» cuenta las escrituras que CAMBIAN la celda. Hasta el 25/08/2026 esa
 *     misma métrica se llamaba «Símbolos escritos», y en el formalismo TODA transición escribe un
 *     símbolo aunque sea el mismo: con el bucle q0 1→1,S,q0 la app marcaba 0 tras 36 transiciones.
 *     Se renombró la etiqueta a lo que de verdad mide (hallazgo 340).
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

/**
 * Carga una cinta distinta de la del programa y deja la máquina lista para arrancar.
 *
 * El `fill` se reintenta comprobando el VALOR del campo: si llega antes de que React haya
 * hidratado el input, el evento se pierde y lo tecleado se concatena con lo que ya había
 * («111» sobre «1011» dejaba «1111011»). Se declara el reintento en vez de meter una espera
 * fija, que unos días llegaría y otros no.
 */
async function cargarCinta(page: Page, contenido: string) {
  const campo = page.locator('#cinta-inicial');
  await expect(async () => {
    await campo.fill('');
    if (contenido) await campo.fill(contenido);
    await expect(campo).toHaveValue(contenido, { timeout: 500 });
  }).toPass({ timeout: 10_000 });
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
    await expect(metrica(page, 'Celdas modificadas')).toHaveText('3');
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
    await expect(metrica(page, 'Celdas modificadas')).toHaveText('4');
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
    await expect(metrica(page, 'Celdas modificadas')).toHaveText('4'); // 4 celdas borradas
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('(cinta vacía)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HALLAZGOS del 25/08/2026 — REPARADOS ese mismo día. Tests de regresión.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Regresión de los hallazgos del Inspector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
  });

  /**
   * 334 · Editar la cinta a mitad de una ejecución paso a paso reiniciaba cinta, cabezal y
   * estado, pero NO los contadores: la app pasaba a informar de un número de pasos que no
   * correspondía a nada de lo que había en pantalla, y el clic siguiente marcaba 6 habiéndose
   * ejecutado 1. El efecto solo se disparaba con `estadoEjecucion === 'detenida'`, y el modo
   * paso a paso nunca sale de ese valor, así que la guarda tampoco protegía del caso inverso:
   * con la máquina ya en «aceptada», teclear una cinta nueva no cambiaba nada hasta Reiniciar.
   */
  test('334 · cambiar la cinta a mitad de una ejecución reinicia también los contadores', async ({ page }) => {
    await avanzar(page, 5);
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('5');

    // Se cambia la cinta SIN pulsar Reiniciar, que es lo que hace cualquiera.
    await page.locator('#cinta-inicial').fill('0');

    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('0');
    await expect(metrica(page, 'Movimientos del cabezal')).toHaveText('0');
    await expect(metrica(page, 'Celdas modificadas')).toHaveText('0');
    await expect(estadoActual(page)).toHaveText('Estado:q0');

    // Y el paso siguiente cuenta 1, no 6.
    await page.getByRole('button', { name: 'Paso siguiente' }).click();
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('1');
  });

  test('334 bis · con la máquina ya parada, teclear una cinta nueva se ve al momento', async ({ page }) => {
    // El simétrico: llevar el incrementador hasta el final y cambiar la cinta. Son 10 pasos
    // con la cinta 1011 que trae el programa (la traza está en el CASO 1 de este fichero).
    await avanzar(page, 10);
    await expect(resultado(page)).toContainText('ACEPTADO');

    await page.locator('#cinta-inicial').fill('111');

    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('111');
    await expect(resultado(page)).toContainText('LISTA');
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('0');
  });

  /**
   * 335 · Los 36 campos de la tabla de transiciones —el núcleo editable de la app— no tenían
   * ningún nombre accesible: ni aria-label, ni id+label, ni label envolvente. Las cabeceras de
   * columna no nombran a los controles que hay dentro de las celdas, así que un lector de
   * pantalla anunciaba 36 «cuadro de edición» sin identificar.
   */
  test('335 · todos los campos de la tabla de reglas tienen nombre accesible', async ({ page }) => {
    const sinNombre = await page.evaluate(() => {
      const tabla = document.querySelector('table');
      if (!tabla) return ['no hay tabla de reglas'];
      return [...tabla.querySelectorAll('input, select')]
        .filter((c) => {
          const etiqueta = c.getAttribute('aria-label');
          if (etiqueta && etiqueta.trim()) return false;
          const id = c.getAttribute('id');
          if (id && document.querySelector(`label[for="${id}"]`)) return false;
          return !c.closest('label');
        })
        .map((c) => `${c.tagName.toLowerCase()} en ${(c as HTMLInputElement).value || '(vacío)'}`);
    });
    expect(sinNombre, `campos sin nombre accesible: ${sinNombre.join(' · ')}`).toEqual([]);
  });

  test('335 bis · el campo de estados finales también tiene su etiqueta', async ({ page }) => {
    // Se apoyaba solo en el placeholder «+ qf», que desaparece al escribir y no es un nombre.
    const campo = page.locator('#estado-final-nuevo');
    await expect(campo).toHaveCount(1);
    const etiquetado = await page.evaluate(
      () => document.querySelector('label[for="estado-final-nuevo"]') !== null,
    );
    expect(etiquetado, 'el campo de estados finales no tiene <label for>').toBe(true);
  });

  /**
   * 336 · Los 4 botones de programa predefinido marcaban la selección solo con la clase CSS,
   * sin aria-pressed ni aria-current: un lector de pantalla no podía saber cuál estaba cargado.
   */
  test('336 · el programa cargado se anuncia con aria-pressed', async ({ page }) => {
    const incrementador = page.getByRole('button', { name: /Incrementador binario/ });
    const palindromos = page.getByRole('button', { name: /Palíndromos binarios/ });

    await expect(incrementador).toHaveAttribute('aria-pressed', 'true');
    await expect(palindromos).toHaveAttribute('aria-pressed', 'false');

    await palindromos.click();
    await expect(palindromos).toHaveAttribute('aria-pressed', 'true');
    await expect(incrementador).toHaveAttribute('aria-pressed', 'false');
  });

  /**
   * 337 · La tarjeta del profesor afirmaba que «el aprendizaje activo cuadruplica la
   * retención»: un multiplicador redondo sin fuente ni año, del mismo género que la pirámide
   * del aprendizaje o el cono de Dale, cuyos porcentajes están desacreditados.
   */
  test('337 · el bloque educativo no promete multiplicadores de retención sin fuente', async ({ page }) => {
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).not.toMatch(/cuadruplica la\s+retención/i);
    expect(cuerpo, 'sigue habiendo un multiplicador de retención sin fuente')
      .not.toMatch(/(duplica|triplica|cuadruplica)\s+la\s+retención/i);
  });

  /**
   * 338 · La FAQ decía que «un PC es un autómata linealmente acotado». Un LBA usa cinta
   * acotada por una función lineal DE LA ENTRADA, o sea que crece con ella; un ordenador real
   * tiene memoria fija. El modelo formal estricto es un autómata finito, enorme pero finito.
   */
  test('338 · la FAQ no llama autómata linealmente acotado a un ordenador', async ({ page }) => {
    // `textContent`, no `innerText`: el bloque educativo se monta siempre pero va oculto por
    // CSS, e `innerText` no ve lo que no se pinta.
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).not.toMatch(/un PC es un autómata\s+linealmente acotado/i);
    expect(cuerpo, 'la FAQ debería nombrar el modelo correcto').toMatch(/autómata finito/i);
  });

  /**
   * 339 · El programa aⁿbⁿ rechaza la cadena vacía por falta de regla para (q0, blanco), pero
   * su descripción no acotaba n, y con el convenio habitual n ≥ 0 la cadena vacía pertenece al
   * lenguaje. La propia guía de la app manda probar ese caso límite.
   */
  test('339 · la descripción de aⁿbⁿ acota n, que es lo que el programa hace', async ({ page }) => {
    await page.getByRole('button', { name: /Reconocer/ }).click();
    await expect(page.getByText(/n ≥ 1/)).toBeVisible();

    // Y el comportamiento que la descripción ahora explica: la cadena vacía se rechaza.
    await cargarCinta(page, '');
    await page.getByRole('button', { name: 'Paso siguiente' }).click();
    await expect(resultado(page)).toContainText('RECHAZADO');
  });

  /**
   * 342 · El cortafuegos de no terminación existe (5.000 pasos) y la ejecución es asíncrona,
   * así que un bucle infinito no cuelga el navegador. Pero el tope de velocidad era 100 ms por
   * paso —unos 9 pasos por segundo reales—, de modo que llegar a ese aviso tardaba unos NUEVE
   * MINUTOS. Ahora la pausa mínima es de 10 ms.
   */
  test('342 · se puede ejecutar sin pausa apreciable para llegar al tope de pasos', async ({ page }) => {
    const slider = page.locator('#velocidad-slider');
    await expect(slider).toHaveAttribute('min', '10');

    await slider.focus();
    await page.keyboard.press('Home');
    await expect(page.locator('[class*="velocidadValue"]')).toHaveText('Sin pausa');
    // Y se explica para qué sirve, para que la cinta borrosa no parezca un fallo de dibujo.
    await expect(page.locator('[class*="velocidadNota"]')).toContainText('sin esperar');
  });
});
