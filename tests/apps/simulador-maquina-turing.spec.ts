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

// ─────────────────────────────────────────────────────────────────────────────
// INSPECTOR 12/11/2026 — modo cambio (diff ac76770d..HEAD)
// ─────────────────────────────────────────────────────────────────────────────
//
// Lo que cambió el diff y se comprueba aquí:
//   · `origenCinta` (hallazgo 341): los índices que se dibujan bajo cada celda ya no se
//     renumeran cuando la cinta crece por la izquierda; el cabezal pasa a −1.
//   · VELOCIDAD_MIN = 10 ms («Sin pausa», hallazgo 342).
//   · La etiqueta «Símbolos escritos» pasa a «Celdas modificadas» (hallazgo 340).
//
// Todas las trazas están hechas A MANO sobre la constante PROGRAMAS de page.tsx antes de
// mirar la app. Comprobado también por script, y NO incluido aquí por su duración (81,5 s a
// CPU normal): la máquina «q0 _→_,R,q0» a «Sin pausa» para en «RECHAZADO (límite de pasos
// alcanzado)» con Pasos 5000, Movimientos 5000, Celdas 0 y el cabezal en el índice 5000.

/** Las 21 celdas que dibuja el SVG de la cinta: símbolo, índice real y si lleva el destello. */
async function leerCinta(page: Page) {
  return page.evaluate(() => {
    const svg = document.querySelector('svg[aria-label="Cinta de la máquina de Turing"]');
    if (!svg) return [];
    return Array.from(svg.querySelectorAll('g')).map((g) => {
      const textos = g.querySelectorAll('text');
      const clase = g.querySelector('rect')?.getAttribute('class') ?? '';
      return {
        simbolo: textos[0]?.textContent ?? '',
        indice: textos[1]?.textContent ?? '',
        // Nombre local del módulo: «hash_celdaEscrita» en el build, «…__celdaEscrita» en dev.
        escrita: /_celdaEscrita$/.test(clase),
      };
    });
  });
}

type Celda = { simbolo: string; indice: string; escrita: boolean };

/** Símbolo dibujado en la celda de índice real `indice` (la ventana es de 21 celdas). */
function simboloEn(cinta: Celda[], indice: number): string | undefined {
  return cinta.find((c) => c.indice === String(indice))?.simbolo;
}

/**
 * Prueba que React ya responde antes de tocar controles que no se reintentan (el deslizador,
 * los selectores de la tabla): cambiar de programa solo actualiza aria-pressed tras hidratar.
 */
async function esperarHidratada(page: Page) {
  const palindromos = page.getByRole('button', { name: /Palíndromos binarios/ });
  await expect(async () => {
    await palindromos.click();
    await expect(palindromos).toHaveAttribute('aria-pressed', 'true', { timeout: 500 });
  }).toPass({ timeout: 10_000 });
}

async function cargarProgramaHidratado(page: Page, nombre: RegExp) {
  await esperarHidratada(page);
  const boton = page.getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** Lleva el deslizador al mínimo (10 ms), que la app rotula «Sin pausa». */
async function ponerSinPausa(page: Page) {
  const slider = page.locator('#velocidad-slider');
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(slider).toHaveValue('10');
  await expect(page.locator('#velocidad-slider + span')).toHaveText('Sin pausa');
}

test.describe('Inspector 12/11/2026 · lo cambiado desde el 25/08', () => {
  // TRAZA A MANO: es la del CASO 2 de este fichero (incrementador, cinta 111), mirando ahora
  // los índices REALES que se dibujan bajo cada celda. Paso 7: q1 lee el 1 del índice 0,
  // escribe 0 y mueve L → el cabezal sale por la izquierda al índice −1 (celda nueva, blanca).
  // Lo escrito conserva su índice: 0, 1 y 2 valen 0, y el destello marca la celda 0, la
  // escrita en ese paso. La ventana va de −1 − 10 = −11 a −1 + 10 = 9.
  // Paso 8: q1 _→1,S,qf escribe 1 en el −1 sin moverse. Antes del arreglo del hallazgo 341
  // el cabezal mostraba el índice 0 y el 000 aparecía en 1, 2 y 3.
  test('341 · el cabezal que sale por la izquierda pasa al índice −1 y lo escrito conserva el suyo', async ({
    page,
  }) => {
    await cargarCinta(page, '111');
    await avanzar(page, 7);

    let cinta = await leerCinta(page);
    expect(cinta).toHaveLength(21);
    expect(cinta[10]).toMatchObject({ simbolo: '_', indice: '-1' }); // la celda central es el cabezal
    expect([0, 1, 2].map((i) => simboloEn(cinta, i))).toEqual(['0', '0', '0']);
    expect(cinta.filter((c) => c.escrita).map((c) => c.indice)).toEqual(['0']);
    expect(cinta[0].indice).toBe('-11');
    expect(cinta[20].indice).toBe('9');

    await avanzar(page, 1, 7);
    cinta = await leerCinta(page);
    expect(cinta[10]).toMatchObject({ simbolo: '1', indice: '-1' });
    expect([0, 1, 2].map((i) => simboloEn(cinta, i))).toEqual(['0', '0', '0']);
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('1000');
    await expect(resultado(page)).toContainText('ACEPTADO');

    // Reiniciar devuelve el origen a cero: el 1 inicial vuelve a estar en el índice 0.
    await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('0');
    cinta = await leerCinta(page);
    expect(cinta[10]).toMatchObject({ simbolo: '1', indice: '0' });
    expect(cinta[0].indice).toBe('-10');
  });

  // TRAZA A MANO (incrementador, cinta 1011 del programa; la tabla está en el CASO 1).
  // Paso 9: q2 lee el 1 del índice 0 y mueve L → cabezal en −1, destello en 0.
  // Paso 10: q2 _→_,R,qf → cabezal vuelve al 0 (símbolo 1), destello en −1 (escribió _ allí).
  test('341 bis · el destello de la celda escrita sigue en su índice tras crecer la cinta', async ({
    page,
  }) => {
    await avanzar(page, 9);
    let cinta = await leerCinta(page);
    expect(cinta[10]).toMatchObject({ simbolo: '_', indice: '-1' });
    expect(cinta.filter((c) => c.escrita).map((c) => c.indice)).toEqual(['0']);

    await avanzar(page, 1, 9);
    cinta = await leerCinta(page);
    expect(cinta[10]).toMatchObject({ simbolo: '1', indice: '0' });
    expect(cinta.filter((c) => c.escrita).map((c) => c.indice)).toEqual(['-1']);
    expect([0, 1, 2, 3].map((i) => simboloEn(cinta, i))).toEqual(['1', '1', '0', '0']);
  });

  // TRAZA A MANO («Duplicar cadena unaria», cinta 111, q0, finales {qf}).
  //   Ronda 1, pasos 1-7:   X en 0, Z en 3, vuelta a la X        → X11Z
  //   Ronda 2, pasos 8-14:  X en 1, Z en 4                        → XX1ZZ
  //   Ronda 3, pasos 15-21: X en 2, Z en 5                        → XXXZZZ
  //   22: q0 lee Z → L, q5 · 23-25: q5 X→L ×3; el 25 sale al índice −1 (celda nueva)
  //   26: q5 _→_,R,q4 · 27-32: q4 X→1 ×3 y Z→1 ×3, cabezal de 0 a 6 · 33: q4 _→_,S,qf
  // Celdas modificadas: 3 X + 3 Z + 6 unos = 12 (6 tras el paso 25). Movimientos: 32, todos
  // menos el 33 (S). Cinta final 111111, cabezal en el índice 6, sobre un blanco.
  test('duplicar 111 paso a paso: 33 transiciones, 111111 y el cabezal pasa por −1', async ({
    page,
  }) => {
    await cargarProgramaHidratado(page, /Duplicar cadena unaria/);
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('111');

    await avanzar(page, 25);
    await expect(estadoActual(page)).toHaveText('Estado:q5');
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('XXXZZZ');
    await expect(metrica(page, 'Celdas modificadas')).toHaveText('6');
    await expect(metrica(page, 'Movimientos del cabezal')).toHaveText('25');
    let cinta = await leerCinta(page);
    expect(cinta[10]).toMatchObject({ simbolo: '_', indice: '-1' });

    await avanzar(page, 8, 25);
    await expect(resultado(page)).toContainText('ACEPTADO');
    await expect(estadoActual(page)).toHaveText('Estado:qf');
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('33');
    await expect(metrica(page, 'Celdas modificadas')).toHaveText('12');
    await expect(metrica(page, 'Movimientos del cabezal')).toHaveText('32');
    await expect(metrica(page, 'Cinta final (limpia)')).toHaveText('111111');
    cinta = await leerCinta(page);
    expect(cinta[10]).toMatchObject({ simbolo: '_', indice: '6' });
    expect([0, 1, 2, 3, 4, 5].map((i) => simboloEn(cinta, i))).toEqual(['1', '1', '1', '1', '1', '1']);
    expect(simboloEn(cinta, -1)).toBe('_');
  });

  /**
   * HALLAZGO (12/11/2026, ABIERTO) · «Acelerar» desde «Sin pausa» RALENTIZA.
   *
   * El diff bajó el mínimo del deslizador a VELOCIDAD_MIN = 10 ms, pero el botón sigue con
   * `Math.max(100, v - 200)`: desde 10 ms lo lleva a 100 ms (diez veces más lento), y desde
   * 600 ms se queda en 100 sin llegar nunca a «Sin pausa». Esperado: acelerar no aumenta
   * nunca la pausa; desde el mínimo se queda en el mínimo.
   */
  test('HALLAZGO (12/11/2026, ABIERTO) · «Acelerar» desde «Sin pausa» no aumenta la pausa', async ({
    page,
  }) => {
    test.fail();
    await esperarHidratada(page);
    await ponerSinPausa(page);
    await page.getByRole('button', { name: 'Acelerar', exact: true }).click();
    await expect(page.locator('#velocidad-slider')).toHaveValue('10', { timeout: 2000 });
    await expect(page.locator('#velocidad-slider + span')).toHaveText('Sin pausa', { timeout: 1000 });
  });

  /**
   * HALLAZGO (12/11/2026, ABIERTO) · a «Sin pausa» con la CPU frenada, los contadores cuentan
   * transiciones de más y los índices de la cinta se corren.
   *
   * El intervalo se vuelve a crear en cada paso (el efecto depende de `paso`, que cambia con
   * cada estado) y el viejo solo se limpia en el efecto pasivo, después del commit. Con 10 ms
   * entre pasos, si el render tarda, el intervalo VIEJO dispara otra vez con el cierre viejo:
   * repite la transición ya aplicada; cinta, cabezal y estado salen iguales, pero los contadores
   * (`setPasos(p => p + 1)`, celdas, movimientos) y `setOrigenCinta(o => o + 1)` suman dos veces.
   * Medido por script: duplicar 111 a ×10 dio 35 y 49 pasos (esperado 33), y en el de 49 el
   * cabezal pintaba el índice 5 en vez del 6; a ×6, 34 en una de tres; el bucle de abajo a ×4,
   * 1013 pasos con el cabezal en el 1012. A 100 ms (el mínimo anterior) no se alcanzaba.
   */
  test('HALLAZGO (12/11/2026, ABIERTO) · «Sin pausa» con la CPU frenada no cuenta pasos de más', async ({
    page,
  }) => {
    test.fail();
    test.setTimeout(150_000);
    const cdp = await page.context().newCDPSession(page);

    // 1) Duplicar 111: la traza a mano del test anterior (33 / 12 / 32, cabezal en el 6).
    await cargarProgramaHidratado(page, /Duplicar cadena unaria/);
    await ponerSinPausa(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 10 });
    await page.getByRole('button', { name: 'Iniciar', exact: true }).click();
    await expect(resultado(page)).toContainText('ACEPTADO', { timeout: 60_000 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await expect(metrica(page, 'Pasos ejecutados')).toHaveText('33', { timeout: 1000 });
    await expect(metrica(page, 'Celdas modificadas')).toHaveText('12', { timeout: 1000 });
    await expect(metrica(page, 'Movimientos del cabezal')).toHaveText('32', { timeout: 1000 });
    expect((await leerCinta(page))[10].indice).toBe('6');

    // 2) Máquina que no para: incrementador con la regla 3 cambiada a  q0 _→_,R,q0. Empieza en
    // el índice 0 y SIEMPRE mueve a la derecha, así que tras N transiciones reales el cabezal
    // está en el índice N: Pasos y Movimientos tienen que valer exactamente ese índice.
    await page.goto(RUTA);
    await cargarProgramaHidratado(page, /Incrementador binario/);
    await page.getByRole('combobox', { name: 'Regla 3: hacia dónde mueve el cabezal' }).selectOption('R');
    const destino = page.getByRole('textbox', { name: 'Regla 3: estado al que pasa' });
    await destino.fill('q0');
    await expect(destino).toHaveValue('q0');
    await ponerSinPausa(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 10 });
    await page.getByRole('button', { name: 'Iniciar', exact: true }).click();
    await expect
      .poll(async () => Number(await metrica(page, 'Pasos ejecutados').textContent()), { timeout: 90_000 })
      .toBeGreaterThanOrEqual(250);
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await expect(resultado(page)).toContainText('EN PAUSA');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const pasos = await metrica(page, 'Pasos ejecutados').textContent();
    const movimientos = await metrica(page, 'Movimientos del cabezal').textContent();
    const indiceCabezal = (await leerCinta(page))[10].indice;
    expect(pasos).toBe(indiceCabezal);
    expect(movimientos).toBe(indiceCabezal);
    await expect(metrica(page, 'Celdas modificadas')).toHaveText('0', { timeout: 1000 });
  });

  /**
   * HALLAZGO (12/11/2026, ABIERTO) · el JSON-LD sigue anunciando «símbolos escritos».
   *
   * El hallazgo 340 renombró en la página la métrica «Símbolos escritos» a «Celdas modificadas»
   * porque solo cuenta las escrituras que CAMBIAN la celda; `features` del jsonLd
   * (metadata.ts) conserva «Métricas: pasos, símbolos escritos, ACEPTADO/RECHAZADO».
   */
  test('HALLAZGO (12/11/2026, ABIERTO) · el JSON-LD nombra las métricas como la página', async ({
    page,
  }) => {
    test.fail();
    await expect(page.getByText('Celdas modificadas', { exact: true })).toBeVisible();
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques
      .map((b) => JSON.parse(b) as { '@type'?: string; featureList?: string[] })
      .find((j) => j['@type'] === 'WebApplication');
    const caracteristicas = (app?.featureList ?? []).join(' · ');
    expect(caracteristicas).toContain('Métricas');
    expect(caracteristicas).not.toMatch(/símbolos escritos/i);
  });
});
