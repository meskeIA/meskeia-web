import { test, expect } from '@playwright/test';

/**
 * simulador-planificador-procesos — modo «corrígeme» · 05/09/2026 (semilla S0121)
 *
 * La app trae por defecto tres procesos y el algoritmo FCFS:
 *   P1 llegada 0 ráfaga 6 · P2 llegada 1 ráfaga 4 · P3 llegada 2 ráfaga 8
 *
 * LOS CASOS SE RESOLVIERON A MANO ANTES DE ABRIR EL NAVEGADOR. FCFS atiende por orden
 * de llegada, sin expulsión, así que la CPU va P1 [0,6] → P2 [6,10] → P3 [10,18]:
 *
 *   PID  fin  turnaround = fin − llegada   espera = turnaround − ráfaga
 *   P1    6      6 − 0 =  6                   6 − 6 = 0
 *   P2   10     10 − 1 =  9                   9 − 4 = 5
 *   P3   18     18 − 2 = 16                  16 − 8 = 8
 *
 * Lo que se comprueba es lo que distingue a este modo de un simple «ver la solución»:
 * que señale la PRIMERA casilla equivocada y no la última, y que las casillas vacías no
 * cuenten como error.
 */

const URL_APP = '/simulador-planificador-procesos/';

/** Los 9 valores correctos del enunciado por defecto en FCFS. */
const SOLUCION: Record<string, { fin: string; espera: string; turnaround: string }> = {
  P1: { fin: '6', espera: '0', turnaround: '6' },
  P2: { fin: '10', espera: '5', turnaround: '9' },
  P3: { fin: '18', espera: '8', turnaround: '16' },
};

test.describe('simulador-planificador-procesos · modo corrígeme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL_APP);
    await expect(page.getByRole('heading', { name: 'Comprueba tu ejercicio' })).toBeVisible();
  });

  test('caso normal: una fila correcta se marca como acierto y las vacías no penalizan', async ({ page }) => {
    await page.getByLabel('Fin del proceso P2').fill(SOLUCION.P2.fin);
    await page.getByLabel('Espera del proceso P2').fill(SOLUCION.P2.espera);
    await page.getByLabel('Turnaround del proceso P2').fill(SOLUCION.P2.turnaround);
    await page.getByRole('button', { name: 'Comprobar' }).click();

    // 3 de 9 casillas bien y ninguna mal: no debe aparecer ningún «primer error»
    await expect(page.getByText('Correcto hasta aquí: 3 de 9 casillas')).toBeVisible();
    await expect(page.getByText('quedan 6 casillas vacías')).toBeVisible();
    await expect(page.getByText('Primer error en')).toHaveCount(0);
  });

  test('señala la PRIMERA casilla equivocada, no la última', async ({ page }) => {
    // Fin mal (11 en vez de 10) pero espera y turnaround escritos con el valor correcto:
    // el fallo debe apuntar a Fin, que es de donde se derivan los otros dos.
    await page.getByLabel('Fin del proceso P2').fill('11');
    await page.getByLabel('Espera del proceso P2').fill(SOLUCION.P2.espera);
    await page.getByLabel('Turnaround del proceso P2').fill(SOLUCION.P2.turnaround);
    await page.getByLabel('Fin del proceso P3').fill('99');
    await page.getByRole('button', { name: 'Comprobar' }).click();

    // .first(): Next monta su propio route-announcer con role="alert" en cada página
    const alerta = page.getByRole('alert').first();
    await expect(alerta).toContainText('Primer error en P2, columna Fin');
    await expect(alerta).toContainText('has escrito 11 y sale 10');
    await expect(alerta).not.toContainText('P3');
  });

  test('el ejercicio completo y correcto se reconoce como tal', async ({ page }) => {
    for (const [pid, valores] of Object.entries(SOLUCION)) {
      await page.getByLabel(`Fin del proceso ${pid}`).fill(valores.fin);
      await page.getByLabel(`Espera del proceso ${pid}`).fill(valores.espera);
      await page.getByLabel(`Turnaround del proceso ${pid}`).fill(valores.turnaround);
    }
    await page.getByRole('button', { name: 'Comprobar' }).click();

    await expect(page.getByText('Ejercicio correcto.')).toBeVisible();
    await expect(page.getByText('Primer error en')).toHaveCount(0);
  });

  test('el modo práctica retira la solución de la pantalla', async ({ page }) => {
    const gantt = page.getByRole('heading', { name: 'Diagrama de Gantt' });
    await expect(gantt).toBeVisible();

    const toggle = page.getByRole('button', { name: /Modo práctica/ });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(gantt).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Métricas por proceso' })).toHaveCount(0);
    await expect(page.getByText('Solución oculta.')).toBeVisible();

    // Y la tabla para practicar sigue estando, que es donde se trabaja mientras tanto
    await expect(page.getByLabel('Fin del proceso P1')).toBeVisible();

    await toggle.click();
    await expect(gantt).toBeVisible();
  });

  test('cambiar el enunciado invalida la corrección anterior', async ({ page }) => {
    await page.getByLabel('Fin del proceso P2').fill(SOLUCION.P2.fin);
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.getByText('Correcto hasta aquí: 1 de 9 casillas')).toBeVisible();

    // Con SJF los tiempos cambian: mantener en pantalla la corrección de FCFS sería mentir
    await page.getByRole('button', { name: /SJF/ }).first().click();
    await expect(page.getByText('Correcto hasta aquí: 1 de 9 casillas')).toHaveCount(0);
  });
});

/* ════════════════════════════════════════════════════════════════════════════
 * EL MOTOR · 11/09/2026 (primera inspección del Inspector)
 *
 * Lo de arriba prueba el corrector; esto prueba lo que el corrector da por bueno.
 * Segmento de MOTOR: la verdad no sale de una fuente normativa, sale de la definición
 * del algoritmo. Los tres casos están trazados a mano ANTES de abrir la app, paso a
 * paso, y los números literales que se afirman son los de esa traza, no los que
 * devolvió la pantalla. Público de aula: un Gantt o una media mal calculados se copian
 * a un examen.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CASO 1 (normal) · SJF no apropiativo · el «Ejemplo clásico» de la propia app
 *   P1(llegada 0, ráfaga 8) · P2(1, 4) · P3(2, 9) · P4(3, 5)
 *
 *   t=0  solo ha llegado P1  → P1 ocupa [0, 8]
 *   t=8  disponibles P2(4) P3(9) P4(5) → menor ráfaga P2 → [8, 12]
 *   t=12 disponibles P3(9) P4(5)       → P4             → [12, 17]
 *   t=17 queda P3                      → P3             → [17, 26]
 *
 *   PID  llegada ráfaga inicio fin  turnaround(fin−lleg) espera(TAT−ráfaga) respuesta
 *   P1     0       8      0     8          8                   0                0
 *   P2     1       4      8    12         11                   7                7
 *   P3     2       9     17    26         24                  15               15
 *   P4     3       5     12    17         14                   9                9
 *
 *   Media espera     = (0+7+15+9)/4   = 31/4 = 7,75
 *   Media turnaround = (8+11+24+14)/4 = 57/4 = 14,25
 *   Tiempo total 26 · CPU sin huecos → utilización 100,0 %
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CASO 2 (límite) · Round Robin quantum 2 · CPU ociosa al principio Y llegadas que
 * caen EXACTAMENTE al expirar un quantum (las dos trampas clásicas a la vez)
 *   P1(llegada 2, ráfaga 5) · P2(4, 3) · P3(6, 4)
 *
 *   [0,2)  nadie ha llegado → CPU ociosa. Ese hueco NO es espera de nadie.
 *   t=2    cola [P1]             → P1 [2,4]   (le quedan 3)
 *   t=4    P2 llega JUSTO al expirar el quantum de P1. La app declara la convención en
 *          «Mejores prácticas»: el recién llegado entra en la cola ANTES que el
 *          reincorporado → cola [P2, P1]      → P2 [4,6]   (le queda 1)
 *   t=6    P3 llega justo al expirar el quantum de P2 → cola [P1, P3, P2]
 *                                              → P1 [6,8]   (le queda 1)
 *   t=8    cola [P3, P2, P1]                   → P3 [8,10]  (le quedan 2)
 *   t=10   cola [P2, P1, P3]                   → P2 [10,11] termina (solo le quedaba 1)
 *   t=11   cola [P1, P3]                       → P1 [11,12] termina
 *   t=12   cola [P3]                           → P3 [12,14] termina
 *
 *   Gantt: —[0,2] P1[2,4] P2[4,6] P1[6,8] P3[8,10] P2[10,11] P1[11,12] P3[12,14]
 *
 *   PID  llegada ráfaga inicio fin  turnaround espera respuesta
 *   P1     2       5      2    12      10        5        0   ← 5, no 7: el ocio [0,2) no cuenta
 *   P2     4       3      4    11       7        4        0
 *   P3     6       4      8    14       8        4        2
 *
 *   Media espera     = (5+4+4)/3  = 13/3 = 4,3333… → 4,33
 *   Media turnaround = (10+7+8)/3 = 25/3 = 8,3333… → 8,33
 *   Tiempo total 14 · ocupada 12 → utilización 12/14 = 85,714… → 85,7 %
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CASO 3 (rechazo) · una ráfaga de 0, negativa o vacía no es un proceso
 *   Un proceso con ráfaga ≤ 0 no existe: no hay nada que planificar y la fórmula
 *   espera = turnaround − ráfaga deja de significar nada. La app no debe simularlo.
 *   Lo que hace es forzar el campo al mínimo declarado (1) y seguir con ese 1, de modo
 *   que la ráfaga simulada NUNCA es 0 ni negativa y la casilla enseña lo que se usa.
 *
 * Nota de manejo: los botones de algoritmo y los de ejemplo comparten prefijo de nombre
 * («Round Robin» está en los dos), así que los selectores usan el nombre accesible
 * completo, que incluye la línea de descripción.
 * ════════════════════════════════════════════════════════════════════════════ */

const BTN_FCFS = 'FCFS Por orden de llegada';
const BTN_SJF = 'SJF Más corto, no apropiativo';
const BTN_RR = 'Round Robin Turnos con quantum';

/** Celdas de una fila de «Métricas por proceso»: PID, llegada, ráfaga, inicio, fin, espera, turnaround, respuesta */
async function filaMetricas(page: import('@playwright/test').Page, pid: string): Promise<string[]> {
  const fila = page
    .locator('table')
    .filter({ has: page.locator('th', { hasText: 'Turnaround' }) })
    .first()
    .locator('tbody tr')
    .filter({ has: page.locator('td', { hasText: new RegExp(`^${pid}$`) }) })
    .first();
  return (await fila.locator('td').allTextContents()).map((t) => t.trim());
}

/** El valor de una tarjeta de métrica global, por su etiqueta */
async function tarjeta(page: import('@playwright/test').Page, etiqueta: string): Promise<string> {
  return await page.evaluate((buscada) => {
    for (const tarjetaDom of Array.from(document.querySelectorAll('[class*="metricCard"]'))) {
      const label = tarjetaDom.querySelector('[class*="metricLabel"]');
      const valor = tarjetaDom.querySelector('[class*="metricValue"]');
      if (label && valor && label.textContent?.trim() === buscada) {
        return valor.textContent?.trim() ?? '';
      }
    }
    return '';
  }, etiqueta);
}

/** Las etiquetas de los bloques del Gantt, en orden («—» es la CPU ociosa) */
async function bloquesGantt(page: import('@playwright/test').Page): Promise<string[]> {
  return await page.evaluate(() => {
    const svg = document.querySelector('svg[aria-label="Diagrama de Gantt de la planificación"]');
    if (!svg) return [];
    return Array.from(svg.querySelectorAll('g'))
      .map((g) => g.querySelector('text')?.textContent?.trim() ?? '')
      .filter((t) => t.length > 0);
  });
}

/** Los cortes de tiempo rotulados bajo el Gantt, en orden */
async function marcasTiempo(page: import('@playwright/test').Page): Promise<string[]> {
  return await page.evaluate(() => {
    const svg = document.querySelector('svg[aria-label="Diagrama de Gantt de la planificación"]');
    if (!svg) return [];
    return Array.from(svg.querySelectorAll('text'))
      .filter((t) => (t.getAttribute('class') ?? '').includes('ganttTimestamp'))
      .map((t) => t.textContent?.trim() ?? '');
  });
}

async function ponerProceso(
  page: import('@playwright/test').Page,
  pid: string,
  llegada: number,
  rafaga: number,
): Promise<void> {
  await page.getByLabel(`Tiempo de llegada del proceso ${pid}`).fill(String(llegada));
  await page.getByLabel(`Ráfaga de CPU del proceso ${pid}`).fill(String(rafaga));
}

test.describe('simulador-planificador-procesos · el motor', () => {
  test('CASO 1 · A MANO: SJF sobre el ejemplo clásico da 7,75 de espera media y 14,25 de turnaround', async ({
    page,
  }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /Ejemplo clásico/ }).click();
    await page.getByRole('button', { name: BTN_SJF }).click();

    // Orden de ejecución de la traza: P1 → P2 → P4 → P3 (P4 adelanta a P3 por tener menos ráfaga)
    expect(await bloquesGantt(page)).toEqual(['P1', 'P2', 'P4', 'P3']);
    // Cortes: 0 · 8 · 12 · 17 · 26
    expect(await marcasTiempo(page)).toEqual(['0', '8', '12', '17', '26']);

    // PID, llegada, ráfaga, inicio, fin, espera, turnaround, respuesta
    expect(await filaMetricas(page, 'P1')).toEqual(['P1', '0', '8', '0', '8', '0', '8', '0']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '1', '4', '8', '12', '7', '11', '7']);
    expect(await filaMetricas(page, 'P3')).toEqual(['P3', '2', '9', '17', '26', '15', '24', '15']);
    expect(await filaMetricas(page, 'P4')).toEqual(['P4', '3', '5', '12', '17', '9', '14', '9']);

    // 31/4 y 57/4, en formato español
    expect(await tarjeta(page, 'Tiempo medio de espera')).toBe('7,75ut');
    expect(await tarjeta(page, 'Tiempo medio turnaround')).toBe('14,25ut');
    expect(await tarjeta(page, 'Tiempo total')).toBe('26ut');
    expect(await tarjeta(page, 'Utilización CPU')).toBe('100,0%');

    // El mismo enunciado con FCFS tiene que empeorar la espera media: 35/4 = 8,75
    // (P1[0,8] P2[8,12] P3[12,21] P4[21,26]; esperas 0, 7, 10, 18)
    await page.getByRole('button', { name: BTN_FCFS }).click();
    expect(await bloquesGantt(page)).toEqual(['P1', 'P2', 'P3', 'P4']);
    expect(await tarjeta(page, 'Tiempo medio de espera')).toBe('8,75ut');
  });

  test('CASO 2 · A MANO: Round Robin q=2 con CPU ociosa y llegada en el borde del quantum', async ({
    page,
  }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: BTN_RR }).click();

    // El enunciado arranca con 3 filas (P1, P2, P3), que es justo lo que hace falta
    await ponerProceso(page, 'P1', 2, 5);
    await ponerProceso(page, 'P2', 4, 3);
    await ponerProceso(page, 'P3', 6, 4);
    await page.locator('#quantum').fill('2');
    await expect(page.locator('[class*="quantumValue"]')).toHaveText('2');

    // La CPU arranca ociosa («—») porque en t=0 no ha llegado nadie; después, el recién
    // llegado entra en la cola antes que el proceso al que se le acaba el quantum.
    expect(await bloquesGantt(page)).toEqual(['—', 'P1', 'P2', 'P1', 'P3', 'P2', 'P1', 'P3']);
    expect(await marcasTiempo(page)).toEqual(['0', '2', '4', '6', '8', '10', '11', '12', '14']);

    // La espera de P1 es 5 y no 7: los dos primeros ut de CPU ociosa son ANTERIORES a su
    // llegada, así que no son espera suya.
    expect(await filaMetricas(page, 'P1')).toEqual(['P1', '2', '5', '2', '12', '5', '10', '0']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '4', '3', '4', '11', '4', '7', '0']);
    expect(await filaMetricas(page, 'P3')).toEqual(['P3', '6', '4', '8', '14', '4', '8', '2']);

    // 13/3 = 4,33 · 25/3 = 8,33 · el ocio SÍ baja la utilización: 12/14 = 85,7 %
    expect(await tarjeta(page, 'Tiempo medio de espera')).toBe('4,33ut');
    expect(await tarjeta(page, 'Tiempo medio turnaround')).toBe('8,33ut');
    expect(await tarjeta(page, 'Tiempo total')).toBe('14ut');
    expect(await tarjeta(page, 'Utilización CPU')).toBe('85,7%');
  });

  test('CASO 3 · RECHAZO: una ráfaga de 0, negativa o vacía nunca llega a simularse', async ({
    page,
  }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await page.getByRole('button', { name: BTN_FCFS }).click();

    const rafaga = page.getByLabel('Ráfaga de CPU del proceso P1');
    await page.getByLabel('Tiempo de llegada del proceso P1').fill('0');

    for (const entrada of ['0', '-3', '']) {
      await rafaga.fill(entrada);
      // El campo se corrige al mínimo declarado y enseña el 1 que realmente se usa:
      // nada de simular en silencio con un valor distinto del que se ve.
      await expect(rafaga).toHaveValue('1');
      // P1: llegada 0, ráfaga 1, inicio 0, fin 1, espera 0, turnaround 1, respuesta 0
      expect(await filaMetricas(page, 'P1')).toEqual(['P1', '0', '1', '0', '1', '0', '1', '0']);
      expect(await tarjeta(page, 'Tiempo total')).toBe('1ut');
    }

    // Una llegada negativa o vacía se corrige igual, a 0
    await rafaga.fill('4');
    const llegada = page.getByLabel('Tiempo de llegada del proceso P1');
    for (const entrada of ['-5', '']) {
      await llegada.fill(entrada);
      await expect(llegada).toHaveValue('0');
      expect(await filaMetricas(page, 'P1')).toEqual(['P1', '0', '4', '0', '4', '0', '4', '0']);
    }

    // Y el Gantt nunca se queda sin nada que dibujar: siempre hay al menos un bloque
    expect((await bloquesGantt(page)).length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// REPARACIÓN 11/09/2026 — los seis hallazgos de la inspección de esta app.
// Los casos son los del acta, resueltos a mano antes de ejecutarlos.
// ════════════════════════════════════════════════════════════════════════════

test.describe('simulador-planificador-procesos · reparación 11/09/2026', () => {
  /**
   * HALLAZGO 757 (alto) — el ejemplo «Inanición priority» no producía inanición NUNCA, y la app
   * afirmaba en dos sitios que sí: la FAQ («por eso ves procesos sin ejecutar en el ejemplo de
   * inanición») y la ficha del opositor («observa qué procesos quedan fuera»). Es estructural:
   * con un conjunto finito de procesos y prioridades estáticas los dos bucles de simularPriority
   * vacían siempre `restantes`, así que `resultado.inanicion` era [] y el aviso rojo no podía
   * encenderse jamás — la app rotulaba en verde «Sin inanición».
   *
   * Lo que el simulador sí puede enseñar es la POSTERGACIÓN, que es el síntoma: P1, con la peor
   * prioridad (10), llega en t=0 con una ráfaga de 6 ut y no termina hasta t=23.
   */
  test('757 — el ejemplo de inanición enseña la postergación, que es lo que de verdad ocurre', async ({
    page,
  }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: /Inanición priority/ }).click();

    // Los cinco terminan: es un hecho del enunciado, no un defecto que ocultar.
    for (const pid of ['P1', 'P2', 'P3', 'P4', 'P5']) {
      const fila = await filaMetricas(page, pid);
      expect(fila[4], `${pid} tiene que terminar`).not.toBe('—');
    }

    // Y el aviso habla de lo que se ve, no de procesos que queden fuera.
    const aviso = page.locator('[role="note"]').filter({ hasText: 'Postergación:' });
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('P1');
    await expect(aviso).toContainText('inanición');

    // Los dos textos que prometían lo que no pasa
    const cuerpo = await page.evaluate(() => {
      const clon = document.body.cloneNode(true) as HTMLElement;
      clon.querySelectorAll('script, style').forEach((n) => n.remove());
      return (clon.textContent ?? '').replace(/\s+/g, ' ');
    });
    expect(cuerpo).not.toContain('observa qué procesos quedan fuera');
    expect(cuerpo).not.toContain('por eso ves procesos sin ejecutar');
    expect(cuerpo).not.toContain('Sin inanición');
  });

  /**
   * HALLAZGO 758 (alto) — el motor usa «número menor = más prioritario» y no lo decía en ningún
   * sitio: ni la columna, ni el aria-label, ni el texto del conmutador. Mientras, el bloque
   * educativo avisaba de que usar la convención contraria es un error frecuente y remataba «lee
   * siempre la convención del problema», sin decir cuál usa la app. Un alumno cuyo enunciado
   * numere al revés obtenía el Gantt exactamente invertido, sin ningún aviso.
   */
  test('758 — la app declara su convención de prioridad, y es la que aplica', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: 'Priority Por prioridad' }).click();

    // Declarada en la columna y en el nombre accesible del campo
    await expect(page.getByRole('columnheader', { name: /Prioridad/ })).toContainText('1 = la más alta');
    await expect(page.getByLabel(/Prioridad del proceso P1/)).toHaveAttribute(
      'aria-label',
      /1 es la más alta/,
    );

    // Y es la que aplica: P1 con prioridad 1 se ejecuta antes que P2 con prioridad 9
    await ponerProceso(page, 'P1', 0, 4);
    await ponerProceso(page, 'P2', 0, 4);
    await page.getByLabel('Prioridad del proceso P1', { exact: false }).fill('1');
    await page.getByLabel('Prioridad del proceso P2', { exact: false }).fill('9');
    // Se compara el orden RELATIVO de los dos, sin depender de P3, que el enunciado por
    // defecto trae con su propia prioridad.
    const orden = await bloquesGantt(page);
    expect(orden.indexOf('P1')).toBeLessThan(orden.indexOf('P2'));
  });

  /**
   * HALLAZGO 759 (medio, cálculo) — el desempate no era el del libro. Con dos procesos igual de
   * buenos, el `reduce` recorría el array en el orden de la TABLA y ganaba el PID más bajo
   * aunque hubiera llegado el último; la convención de Silberschatz es que el empate lo rompe
   * FCFS, el que lleva más tiempo esperando.
   *
   * A MANO — SJF con P1(llegada 5, ráfaga 4), P2(2, 4) y P3(2, 3):
   *   t=0..2 ociosa · t=2 llegan P2 y P3, gana P3 por ráfaga menor → P3[2,5]
   *   t=5 empatan a ráfaga 4 P1 (acaba de llegar) y P2 (espera desde t=2) → gana P2 por FCFS
   *   P2[5,9] · P1[9,13]
   * Antes salía P1[5,9] y P2[9,13]: las medias coinciden, pero la tabla por proceso —que es lo
   * que se pide en el examen— salía con dos filas intercambiadas.
   */
  test('759 — el empate lo rompe FCFS, no el orden de la tabla', async ({ page }) => {
    await page.goto(URL_APP);
    await page.getByRole('button', { name: BTN_SJF }).click();
    await ponerProceso(page, 'P1', 5, 4);
    await ponerProceso(page, 'P2', 2, 4);
    await ponerProceso(page, 'P3', 2, 3);

    expect(await bloquesGantt(page)).toEqual(['—', 'P3', 'P2', 'P1']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '2', '4', '5', '9', '3', '7', '3']);
    expect(await filaMetricas(page, 'P1')).toEqual(['P1', '5', '4', '9', '13', '4', '8', '4']);
  });

  /**
   * HALLAZGO 760 (medio, cálculo) — con una ráfaga decimal, SRTF y Priority apropiativo
   * inventaban tiempo de espera: los dos avanzan tick a tick (`restantes[id] -= 1`), así que una
   * ráfaga de 2,5 consumía 3 ticks, el fin salía redondeado hacia arriba y `espera = turnaround
   * − ráfaga` fabricaba medio ut de espera para un proceso que estaba solo en el sistema y había
   * llegado en t=0. El campo aceptaba el decimal al PEGARLO, que es justo lo que hace quien
   * copia el dato de un enunciado.
   */
  test('760 — la ráfaga se trabaja en unidades enteras, que es lo que el motor sabe simular', async ({
    page,
  }) => {
    await page.goto(URL_APP);
    const rafagaP1 = page.getByLabel('Ráfaga de CPU del proceso P1');
    await rafagaP1.fill('2.5');
    await rafagaP1.blur();

    // El campo declara su paso y el valor entra redondeado: ni 2,5 en la tabla ni media
    // unidad de espera inventada.
    await expect(rafagaP1).toHaveAttribute('step', '1');
    const fila = await filaMetricas(page, 'P1');
    expect(fila[2]).toBe('3');
    expect(fila[5]).toBe('0'); // un proceso solo, llegado en t=0, no puede esperar
  });

  /**
   * HALLAZGO 761 (bajo) — la tabla «Métricas por proceso» y la tarjeta «Tiempo total» imprimían
   * el número crudo de JavaScript mientras las otras cuatro tarjetas sí pasaban por formatNumber:
   * la misma pantalla mezclaba «0,50 ut» en una tarjeta y «0.5» en la tabla que la alimenta.
   */
  test('761 — la tabla y el tiempo total van en formato español', async ({ page }) => {
    await page.goto(URL_APP);
    const tabla = await page.locator('table').filter({ hasText: 'Turnaround' }).first().innerText();
    expect(tabla).not.toMatch(/\d+\.\d/);
    expect(await tarjeta(page, 'Tiempo total')).toBe('18ut');
  });

  /**
   * HALLAZGO 762 (bajo) — el máximo declarado en los campos no se aplicaba: los manejadores solo
   * ponían suelo (`Math.max(1, …)`), así que el `max={50}` de la ráfaga era decorativo y un 999
   * entraba en la simulación y pintaba un Gantt de ~40.000 px. La asimetría engaña, porque el
   * mínimo sí se fuerza de verdad.
   */
  test('762 — el máximo declarado en la ráfaga se aplica, como ya se aplicaba el mínimo', async ({
    page,
  }) => {
    await page.goto(URL_APP);
    const rafagaP1 = page.getByLabel('Ráfaga de CPU del proceso P1');

    await rafagaP1.fill('999');
    expect((await filaMetricas(page, 'P1'))[2]).toBe('50');

    // Y el suelo sigue donde estaba
    await rafagaP1.fill('0');
    expect((await filaMetricas(page, 'P1'))[2]).toBe('1');
  });
});
