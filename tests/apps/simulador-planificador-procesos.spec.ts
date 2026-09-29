import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

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
      // Desde el 29/09/2026 (hallazgo 2399) la corrección se enseña al SALIR del campo, no bajo
      // el cursor: reescribir «1» mientras se teclea era justo lo que convertía un 3 en 13.
      // Mientras tiene el foco, un número bajo el mínimo marca el campo como inválido; y el
      // vacío no se aplica (el enunciado conserva el valor anterior, que aquí ya es 1).
      if (entrada !== '') await expect(rafaga).toHaveAttribute('aria-invalid', 'true');
      await rafaga.blur();
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
      await llegada.blur();
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

    // El campo declara que es entero y el valor entra redondeado: ni 2,5 en la tabla ni media
    // unidad de espera inventada. Desde el 29/09/2026 es un campo de texto (hallazgo 2399), así
    // que ya no lleva `step`: lo declara su title y, al salir, enseña el 3 que se usa.
    await expect(rafagaP1).toHaveAttribute('title', 'Unidades de tiempo enteras');
    await expect(rafagaP1).toHaveValue('3');
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

/* ════════════════════════════════════════════════════════════════════════════
 * INSPECCIÓN 29/09/2026 (segunda del Inspector)
 *
 * Entra por dos sospechas de SOSPECHAS.md del 28/09:
 *   (a) el respaldo `Number(v) || 1` de la ráfaga y de la prioridad (page.tsx:856 y :868);
 *   (b) `<input type="number">` y parseSpanishNumber en el mismo page.tsx.
 *
 * Convenciones que se aplican, las de la app:
 *   · Prioridad: 1 = la más alta (declarada en la cabecera de la columna, hallazgo 758).
 *   · Desempate: FCFS, gana el que llegó antes. La app NO lo declaraba en pantalla: vivía solo
 *     en el comentario de `mejorPorRafaga` (page.tsx) y en el test 759 (desde el 29/09/2026 lo
 *     dice bajo el selector de algoritmo, hallazgo 2398). Es la de Silberschatz,
 *     que en SRTF añade que un empate NO expulsa al que está en CPU (solo expulsa un tiempo
 *     restante ESTRICTAMENTE menor). En los dos empates de abajo ambas reglas señalan al mismo
 *     proceso, así que el esperado no depende de cuál se tome.
 *   · Round Robin: el recién llegado entra en la cola antes que el reincorporado (declarada
 *     en «Mejores prácticas»).
 *
 * TODOS LOS CASOS SE RESOLVIERON A MANO, CON SU GANTT, ANTES DE ABRIR LA APP.
 * ════════════════════════════════════════════════════════════════════════════ */

const SEL_RAFAGA_P1 = 'input[aria-label="Ráfaga de CPU del proceso P1"]';
const BTN_SRTF = 'SRTF Más corto, apropiativo';
const BTN_PRIORITY = 'Priority Por prioridad';

async function abrirHidratada(page: Page): Promise<void> {
  await page.goto(URL_APP);
  await esperarHidratacion(page, [SEL_RAFAGA_P1]);
}

/** Rellena llegada y ráfaga de una vez (como un pegado) y espera a que el ESTADO de React las recoja. */
async function fijarProceso(page: Page, pid: string, llegada: string, rafaga: string): Promise<void> {
  const campoLlegada = page.getByLabel(`Tiempo de llegada del proceso ${pid}`);
  const campoRafaga = page.getByLabel(`Ráfaga de CPU del proceso ${pid}`);
  await campoLlegada.fill(llegada);
  await esperarValorEnReact(page, campoLlegada, llegada);
  await campoRafaga.fill(rafaga);
  await esperarValorEnReact(page, campoRafaga, rafaga);
}

/** Una celda de la tabla en formato español («7,6», «11») a número. Solo cifras sin millares. */
function celdaANumero(celda: string): number {
  const [entera, decimal] = celda.split(',');
  return Number(decimal === undefined ? entera : `${entera}.${decimal}`);
}

test.describe('simulador-planificador-procesos · inspección 29/09/2026', () => {
  /**
   * CASO A (normal, apropiativo) · SRTF sobre el «Ejemplo clásico» de la app
   *   P1(llegada 0, ráfaga 8) · P2(1, 4) · P3(2, 9) · P4(3, 5)
   *
   *   t=0  solo P1                          → P1 [0,1]
   *   t=1  llega P2 (4) < resto de P1 (7)   → expulsa: P2 [1,5]
   *        (t=2 P3=9 y t=3 P4=5 no bajan del resto de P2: 3 y 2)
   *   t=5  restos P1=7 · P3=9 · P4=5        → P4 [5,10]
   *   t=10 restos P1=7 · P3=9               → P1 [10,17]
   *   t=17                                  → P3 [17,26]
   *   Ningún empate en todo el recorrido.
   *
   *   PID lleg ráf inicio fin  TAT=fin−lleg  espera=TAT−ráf  respuesta=inicio−lleg
   *   P1   0    8    0    17      17            9               0
   *   P2   1    4    1     5       4            0               0
   *   P3   2    9   17    26      24           15              15
   *   P4   3    5    5    10       7            2               2
   *   Media espera 26/4 = 6,50 · media TAT 52/4 = 13,00 · throughput 4/26 = 0,1538… → 0,154
   *   (6,50 es el valor de libro de este ejemplo, Silberschatz §5.3.2)
   */
  test('CASO A · A MANO: SRTF expulsa en t=1 y da 6,50 de espera media y 13,00 de turnaround', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /Ejemplo clásico/ }).click();
    await page.getByRole('button', { name: BTN_SRTF }).click();

    await expect.poll(() => bloquesGantt(page)).toEqual(['P1', 'P2', 'P4', 'P1', 'P3']);
    expect(await marcasTiempo(page)).toEqual(['0', '1', '5', '10', '17', '26']);

    expect(await filaMetricas(page, 'P1')).toEqual(['P1', '0', '8', '0', '17', '9', '17', '0']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '1', '4', '1', '5', '0', '4', '0']);
    expect(await filaMetricas(page, 'P3')).toEqual(['P3', '2', '9', '17', '26', '15', '24', '15']);
    expect(await filaMetricas(page, 'P4')).toEqual(['P4', '3', '5', '5', '10', '2', '7', '2']);

    expect(await tarjeta(page, 'Tiempo medio de espera')).toBe('6,50ut');
    expect(await tarjeta(page, 'Tiempo medio turnaround')).toBe('13,00ut');
    expect(await tarjeta(page, 'Throughput')).toBe('0,154p/ut');
    expect(await tarjeta(page, 'Tiempo total')).toBe('26ut');
  });

  /**
   * CASO A2 (normal, apropiativo) · Round Robin quantum 2 con 4 procesos de llegadas distintas
   *   P1(0, 5) · P2(1, 3) · P3(2, 1) · P4(3, 4)
   *
   *   t=0  cola [P1]                       → P1 [0,2]  resto 3; llegan P2(1) y P3(2) → [P2,P3,P1]
   *   t=2                                  → P2 [2,4]  resto 1; llega P4(3)         → [P3,P1,P4,P2]
   *   t=4                                  → P3 [4,5]  termina                      → [P1,P4,P2]
   *   t=5                                  → P1 [5,7]  resto 1                      → [P4,P2,P1]
   *   t=7                                  → P4 [7,9]  resto 2                      → [P2,P1,P4]
   *   t=9                                  → P2 [9,10] termina
   *   t=10                                 → P1 [10,11] termina
   *   t=11                                 → P4 [11,13] termina
   *
   *   PID lleg ráf inicio fin TAT espera respuesta
   *   P1   0    5    0    11  11    6       0
   *   P2   1    3    2    10   9    6       1
   *   P3   2    1    4     5   3    2       2
   *   P4   3    4    7    13  10    6       4
   *   Media espera 20/4 = 5,00 · media TAT 33/4 = 8,25 · throughput 4/13 = 0,3077… → 0,308
   */
  test('CASO A2 · A MANO: Round Robin q=2 con 4 procesos da 5,00 de espera media y 8,25 de turnaround', async ({
    page,
  }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: BTN_RR }).click();
    await page.getByRole('button', { name: '+ Añadir proceso' }).click();
    await fijarProceso(page, 'P1', '0', '5');
    await fijarProceso(page, 'P2', '1', '3');
    await fijarProceso(page, 'P3', '2', '1');
    await fijarProceso(page, 'P4', '3', '4');
    await expect(page.locator('[class*="quantumValue"]')).toHaveText('2');

    await expect
      .poll(() => bloquesGantt(page))
      .toEqual(['P1', 'P2', 'P3', 'P1', 'P4', 'P2', 'P1', 'P4']);
    expect(await marcasTiempo(page)).toEqual(['0', '2', '4', '5', '7', '9', '10', '11', '13']);

    expect(await filaMetricas(page, 'P1')).toEqual(['P1', '0', '5', '0', '11', '6', '11', '0']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '1', '3', '2', '10', '6', '9', '1']);
    expect(await filaMetricas(page, 'P3')).toEqual(['P3', '2', '1', '4', '5', '2', '3', '2']);
    expect(await filaMetricas(page, 'P4')).toEqual(['P4', '3', '4', '7', '13', '6', '10', '4']);

    expect(await tarjeta(page, 'Tiempo medio de espera')).toBe('5,00ut');
    expect(await tarjeta(page, 'Tiempo medio turnaround')).toBe('8,25ut');
    expect(await tarjeta(page, 'Throughput')).toBe('0,308p/ut');
    expect(await tarjeta(page, 'Utilización CPU')).toBe('100,0%');
  });

  /**
   * CASO B (límite) · quantum mayor que todas las ráfagas: Round Robin DEBE coincidir con FCFS
   *   «Ejemplo clásico» (ráfagas 8, 4, 9, 5) con q = 10: nadie agota nunca su quantum.
   *   P1 [0,8] · P2 [8,12] · P3 [12,21] · P4 [21,26]
   *   esperas 0, 7, 10, 18 → 35/4 = 8,75 · TAT 8, 11, 19, 23 → 61/4 = 15,25
   */
  test('CASO B · LÍMITE: con quantum 10 Round Robin degenera en FCFS, como dice la FAQ', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: /Ejemplo clásico/ }).click();
    await page.getByRole('button', { name: BTN_RR }).click();
    await sembrarValor(page, '#quantum', 10);

    const esperado = {
      bloques: ['P1', 'P2', 'P3', 'P4'],
      marcas: ['0', '8', '12', '21', '26'],
      P3: ['P3', '2', '9', '12', '21', '10', '19', '10'],
      P4: ['P4', '3', '5', '21', '26', '18', '23', '18'],
    };

    for (const algoritmo of [BTN_RR, BTN_FCFS]) {
      await page.getByRole('button', { name: algoritmo }).click();
      await expect.poll(() => bloquesGantt(page), { message: algoritmo }).toEqual(esperado.bloques);
      expect(await marcasTiempo(page)).toEqual(esperado.marcas);
      expect(await filaMetricas(page, 'P3')).toEqual(esperado.P3);
      expect(await filaMetricas(page, 'P4')).toEqual(esperado.P4);
      expect(await tarjeta(page, 'Tiempo medio de espera')).toBe('8,75ut');
      expect(await tarjeta(page, 'Tiempo medio turnaround')).toBe('15,25ut');
    }
  });

  /**
   * CASO C (control de la sospecha a) · la LLEGADA sí se puede vaciar y reteclear
   *   Su respaldo era `|| 0`, y 0 es una llegada legítima: vaciarla dejaba 0, no un valor ajeno,
   *   y lo tecleado después se leía bien (el campo enseñaba «03», pero el estado era 3). Desde el
   *   29/09/2026 el campo es de texto con borrador (hallazgos 2399-2400): vacío no aplica nada y
   *   el campo enseña «3», lo tecleado.
   *   Por defecto P1(0, 6) · P2(1, 4) · P3(2, 8), FCFS. Con P2 en t=3:
   *   P1 [0,6] · P3 [6,14] · P2 [14,18] → P2: inicio 14, fin 18, TAT 15, espera 11, respuesta 11
   */
  test('CASO C · la llegada se vacía y se reteclea sin perder el valor (su respaldo es 0, que es legítimo)', async ({
    page,
  }) => {
    await abrirHidratada(page);
    const llegadaP2 = page.getByLabel('Tiempo de llegada del proceso P2');
    await llegadaP2.click();
    await llegadaP2.press('End');
    await llegadaP2.press('Backspace');
    await llegadaP2.pressSequentially('3');
    await esperarValorEnReact(page, llegadaP2, 3);
    await expect(llegadaP2).toHaveValue('3');

    await expect.poll(() => filaMetricas(page, 'P2')).toEqual(['P2', '3', '4', '14', '18', '11', '15', '11']);
  });

  /**
   * HALLAZGO 2398 (calculo, medio) · REPARADO el 29/09/2026 — SRTF desempataba por el ORDEN DE
   * LA TABLA.
   *
   * El 759 se dio por reparado, pero la reparación (`mejorPorRafaga` / `mejorPorPrioridad`)
   * solo llegó a SJF y a Priority: `simularSRTF` conservaba
   * `disponibles.reduce((min, p) => (restantes[p.id] < restantes[min.id] ? p : min))`, que en
   * un empate se quedaba con el primero de la tabla. Y el 759 nombraba SRTF expresamente.
   * Reparación: SRTF y Priority apropiativo comparten motor (`simularApropiativo`), con el
   * desempate de SJF (llegó antes; luego la fila) y la regla del libro para los apropiativos:
   * un empate NO expulsa al que está en CPU. La app lo dice en pantalla bajo el selector.
   *
   * A MANO — P1(llegada 2, ráfaga 3) · P2(llegada 0, ráfaga 5):
   *   t=0 solo P2 → P2 · t=2 llega P1 con 3 y a P2 le quedan 3: EMPATE.
   *   Desempate FCFS (P2 llegó en 0) y regla de libro (un empate no expulsa) → sigue P2.
   *   P2 [0,5] · P1 [5,8]
   *   P1: inicio 5, fin 8, TAT 6, espera 3, respuesta 3 · P2: inicio 0, fin 5, TAT 5, espera 0
   * Obtenido antes: P2 [0,2] · P1 [2,5] · P2 [5,8] — un cambio de contexto que no existe y las
   * dos filas cambiadas (P1 fin 5 espera 0; P2 fin 8 espera 3). Las medias (1,50 y 5,50)
   * coinciden, que es justo por lo que no se ve sin mirar la tabla por proceso.
   */
  test('2398 · SRTF: un empate con el proceso en CPU no lo expulsa (desempate FCFS)', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await page.getByRole('button', { name: '+ Añadir proceso' }).click();
    await fijarProceso(page, 'P1', '2', '3');
    await fijarProceso(page, 'P2', '0', '5');
    await page.getByRole('button', { name: BTN_SRTF }).click();

    await expect.poll(() => bloquesGantt(page)).toEqual(['P2', 'P1']);
    expect(await marcasTiempo(page)).toEqual(['0', '5', '8']);
    expect(await filaMetricas(page, 'P1')).toEqual(['P1', '2', '3', '5', '8', '3', '6', '3']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '0', '5', '0', '5', '0', '5', '0']);

    // Y la regla está dicha en pantalla, donde se elige el algoritmo
    await expect(page.getByText(/Empates:.*gana el proceso que llegó antes/)).toBeVisible();
    await expect(page.getByText(/un empate no expulsa al que ya está en la CPU/)).toBeVisible();
  });

  /**
   * El mismo hallazgo, con el empate entre dos procesos EN ESPERA (la forma exacta del 759).
   *
   * A MANO — P1(2, 5) · P2(1, 5) · P3(0, 4):
   *   t=0 P3 · t=1 llega P2 (5) > resto de P3 (3) · t=2 llega P1 (5) > resto de P3 (2) → P3 [0,4]
   *   t=4 empatan P1 y P2 a 5; P2 espera desde t=1 → P2 [4,9] · P1 [9,14]
   *   P2: inicio 4, fin 9, TAT 8, espera 3 · P1: inicio 9, fin 14, TAT 12, espera 7
   * Es lo mismo que da SJF con este enunciado, porque ninguna llegada expulsa a P3.
   * Obtenido antes en SRTF: P3 [0,4] · P1 [4,9] · P2 [9,14] (filas de P1 y P2 intercambiadas).
   */
  test('2398 · SRTF: el empate entre dos en espera lo gana el que llegó antes, como en SJF', async ({ page }) => {
    await abrirHidratada(page);
    await fijarProceso(page, 'P1', '2', '5');
    await fijarProceso(page, 'P2', '1', '5');
    await fijarProceso(page, 'P3', '0', '4');

    // Control: SJF (ya reparado en el 759) resuelve este empate por FCFS
    await page.getByRole('button', { name: BTN_SJF }).click();
    await expect.poll(() => bloquesGantt(page)).toEqual(['P3', 'P2', 'P1']);

    await page.getByRole('button', { name: BTN_SRTF }).click();
    await expect.poll(() => bloquesGantt(page)).toEqual(['P3', 'P2', 'P1']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '1', '5', '4', '9', '3', '8', '3']);
    expect(await filaMetricas(page, 'P1')).toEqual(['P1', '2', '5', '9', '14', '7', '12', '7']);
  });

  /**
   * El mismo desempate en Priority apropiativo, que comparte motor con SRTF desde la reparación.
   *
   * A MANO — P1(0; 4; prio 2) · P2(1; 3; prio 2) · P3(2; 2; prio 1):
   *   t=0 P1 · t=1 llega P2 con la MISMA prioridad → no expulsa, sigue P1
   *   t=2 llega P3 (prio 1) < P1 (2) → expulsa: P3 [2,4]
   *   t=4 quedan P1 (prio 2, llegó en 0) y P2 (prio 2, llegó en 1) → P1 [4,6] · P2 [6,9]
   *   P1: inicio 0, fin 6, TAT 6, espera 2 · P2: inicio 6, fin 9, TAT 8, espera 5, respuesta 5
   *   P3: inicio 2, fin 4, TAT 2, espera 0
   */
  test('2398 · Priority apropiativo: una llegada con la misma prioridad no expulsa', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: BTN_PRIORITY }).click();
    await fijarProceso(page, 'P1', '0', '4');
    await fijarProceso(page, 'P2', '1', '3');
    await fijarProceso(page, 'P3', '2', '2');
    const prioridades: [string, string][] = [['P1', '2'], ['P2', '2'], ['P3', '1']];
    for (const [pid, prio] of prioridades) {
      const campo = page.getByLabel(`Prioridad del proceso ${pid}`, { exact: false });
      await campo.fill(prio);
      await esperarValorEnReact(page, campo, prio);
    }

    await expect.poll(() => bloquesGantt(page)).toEqual(['P1', 'P3', 'P1', 'P2']);
    expect(await marcasTiempo(page)).toEqual(['0', '2', '4', '6', '9']);
    expect(await filaMetricas(page, 'P1')).toEqual(['P1', '0', '4', '0', '6', '2', '6', '0']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '1', '3', '6', '9', '5', '8', '5']);
    expect(await filaMetricas(page, 'P3')).toEqual(['P3', '2', '2', '2', '4', '0', '2', '0']);
  });

  /**
   * HALLAZGO 2399 (operativa, medio) · REPARADO el 29/09/2026 — sospecha (a) confirmada: vaciar
   * la ráfaga o la prioridad con Retroceso las rellenaba con «1», y lo tecleado quedaba DETRÁS.
   *
   * `acotar(Math.round(Number(v) || 1), 1, MAX)`: al quedar vacío, el estado saltaba a 1, React
   * reescribía el campo a «1» bajo el cursor, y la cifra tecleada se le añadía.
   *   · ráfaga P1 = 6 → Retroceso → «3»   → esperado 3  · obtenido 13
   *   · ráfaga P3 = 8 → Retroceso → «12»  → esperado 12 · obtenido 50 («112» topado al máximo)
   *   · prioridad P1 = 2 → Retroceso → «5» → esperado 5 · obtenido 10 («15» topado al máximo:
   *     el proceso pasaba a la prioridad MÁS BAJA)
   * Reparación: campo de texto con borrador (`CampoTiempo`): vacío no aplica nada y el campo
   * enseña lo tecleado.
   */
  test('2399 · vaciar la ráfaga con Retroceso y teclear otra cifra deja la cifra tecleada', async ({ page }) => {
    await abrirHidratada(page);

    const rafagaP1 = page.getByLabel('Ráfaga de CPU del proceso P1');
    await rafagaP1.click();
    await rafagaP1.press('End');
    await rafagaP1.press('Backspace');
    await rafagaP1.pressSequentially('3');
    await expect.soft(rafagaP1).toHaveValue('3');

    const rafagaP3 = page.getByLabel('Ráfaga de CPU del proceso P3');
    await rafagaP3.click();
    await rafagaP3.press('End');
    await rafagaP3.press('Backspace');
    await rafagaP3.pressSequentially('12');
    await expect.soft(rafagaP3).toHaveValue('12');

    // FCFS por defecto: P1[0,3] P2[3,7] P3[7,19] → P3 fin 19, TAT 17, espera 5
    await expect.poll(() => filaMetricas(page, 'P3')).toEqual(['P3', '2', '12', '7', '19', '5', '17', '5']);
  });

  test('2399 · vaciar la prioridad con Retroceso y teclear 5 deja prioridad 5, no 10', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: BTN_PRIORITY }).click();

    const prioridadP1 = page.getByLabel('Prioridad del proceso P1', { exact: false });
    await prioridadP1.click();
    await prioridadP1.press('End');
    await prioridadP1.press('Backspace');
    await prioridadP1.pressSequentially('5');
    await expect(prioridadP1).toHaveValue('5');
    await prioridadP1.blur();
    await expect(prioridadP1).toHaveValue('5');
  });

  /**
   * HALLAZGO 2400 (operativa, medio) · REPARADO el 29/09/2026 — sospecha (b), en su forma de ESTA
   * app.
   *
   * La llegada era un `type="number"` con `Number(v) || 0`, y el navegador entrega VACÍO el
   * estado intermedio «2.». Ese vacío se leía 0, React reescribía «0» bajo el cursor y el «5» se
   * añadía detrás: se tecleaba 2.5 y entraba 5 (y 0.4 entraba 4). Medido igual con locale es-ES,
   * es-MX y en-US; con coma («2,5») sí entraba 2,5. El punto es el separador decimal en México y
   * en buena parte de Latinoamérica, y el de la tecla decimal del teclado numérico.
   *
   * La app decide trabajar con llegadas DECIMALES (hasta la centésima), porque sus motores ya
   * trabajan por eventos (hallazgo 2401): «2.5» y «2,5» son 2,5.
   */
  test('2400 · teclear «2.5» en la llegada deja una llegada de 2,5, no de 5', async ({ page }) => {
    await abrirHidratada(page);
    const llegadaP2 = page.getByLabel('Tiempo de llegada del proceso P2');
    await llegadaP2.click();
    await llegadaP2.press('Control+A');
    await llegadaP2.pressSequentially('2.5');
    await expect(llegadaP2).toHaveValue('2.5');

    await expect.poll(async () => (await filaMetricas(page, 'P2'))[1]).toBe('2,5');
    // Al salir, el campo enseña el valor aplicado en formato español
    await llegadaP2.blur();
    await expect(llegadaP2).toHaveValue('2,5');

    // Con «0.4» igual (antes entraba 4)
    await llegadaP2.click();
    await llegadaP2.press('Control+A');
    await llegadaP2.pressSequentially('0.4');
    await expect.poll(async () => (await filaMetricas(page, 'P2'))[1]).toBe('0,4');
  });

  /**
   * HALLAZGO 2401 (calculo, medio) · REPARADO el 29/09/2026 — con una LLEGADA decimal, SRTF (y
   * Priority apropiativo) retrasaban la llegada al siguiente entero. Era el 760 por la otra
   * puerta: aquel se cerró forzando la RÁFAGA a enteros, pero la llegada seguía aceptando
   * decimales y los dos motores apropiativos solo miraban `llegada <= t` en t enteros.
   * Reparación: los dos trabajan por EVENTOS (llegadas y finales), en centésimas enteras.
   *
   * A MANO — el ejercicio de Silberschatz con llegadas decimales: P1(0,0; 8) · P2(0,4; 4) · P3(1,0; 1)
   *   t=0   P1
   *   t=0,4 llega P2 (4) < resto de P1 (7,6) → expulsa: P2 [0,4; 1]
   *   t=1   llega P3 (1) < resto de P2 (3,4) → expulsa: P3 [1; 2]
   *   t=2   P2 (3,4) < P1 (7,6)              → P2 [2; 5,4]
   *   t=5,4                                  → P1 [5,4; 13]
   *   TAT: P1 13, P2 5,4 − 0,4 = 5, P3 1 → 19/3 = 6,33 · espera: 5, 1, 0 → 6/3 = 2,00
   *   respuesta: P1 0, P2 0 (entra en cuanto llega), P3 0
   * Obtenido antes: P2 no entraba hasta t=2 (P1 [0,1] P3 [1,2] P2 [2,6] P1 [6,13]) → 2,20 y 6,53.
   *
   * (El bloque P1 [0; 0,4] mide menos de 25 px y no lleva rótulo, así que el orden se comprueba
   * con los cortes de tiempo y la tabla, no con los rótulos del Gantt.)
   */
  test('2401 · SRTF con una llegada de 0,4 expulsa en t=0,4 y da 2,00 de espera media', async ({ page }) => {
    await abrirHidratada(page);
    await fijarProceso(page, 'P1', '0', '8');
    await fijarProceso(page, 'P2', '0.4', '4');
    await fijarProceso(page, 'P3', '1', '1');
    await page.getByRole('button', { name: BTN_SRTF }).click();

    await expect.poll(() => tarjeta(page, 'Tiempo medio de espera')).toBe('2,00ut');
    expect(await tarjeta(page, 'Tiempo medio turnaround')).toBe('6,33ut');
    expect(await marcasTiempo(page)).toEqual(['0', '0,4', '1', '2', '5,4', '13']);
    expect(await filaMetricas(page, 'P1')).toEqual(['P1', '0', '8', '0', '13', '5', '13', '0']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '0,4', '4', '0,4', '5,4', '1', '5', '0']);
    expect(await filaMetricas(page, 'P3')).toEqual(['P3', '1', '1', '1', '2', '0', '1', '0']);
  });

  /**
   * El mismo hallazgo en Priority apropiativo.
   *
   * A MANO — P1(0; 8; prio 3) · P2(0,4; 4; prio 1):
   *   t=0 P1 · t=0,4 llega P2 (prio 1) < P1 (3) → expulsa: P2 [0,4; 4,4] · P1 [4,4; 12]
   *   P1: fin 12, TAT 12, espera 4 · P2: fin 4,4, TAT 4, espera 0
   *   espera media 4/2 = 2,00 · turnaround medio 16/2 = 8,00
   * Obtenido antes: P2 empezaba en 1 y no en 0,4 → 2,30 y 8,30.
   */
  test('2401 · Priority apropiativo con una llegada de 0,4 expulsa en t=0,4', async ({ page }) => {
    await abrirHidratada(page);
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await page.getByRole('button', { name: '+ Añadir proceso' }).click();
    await page.getByRole('button', { name: BTN_PRIORITY }).click();
    await fijarProceso(page, 'P1', '0', '8');
    await fijarProceso(page, 'P2', '0,4', '4');
    for (const [pid, prio] of [['P1', '3'], ['P2', '1']] as [string, string][]) {
      const campo = page.getByLabel(`Prioridad del proceso ${pid}`, { exact: false });
      await campo.fill(prio);
      await esperarValorEnReact(page, campo, prio);
    }

    await expect.poll(() => tarjeta(page, 'Tiempo medio de espera')).toBe('2,00ut');
    expect(await tarjeta(page, 'Tiempo medio turnaround')).toBe('8,00ut');
    expect(await marcasTiempo(page)).toEqual(['0', '0,4', '4,4', '12']);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '0,4', '4', '0,4', '4,4', '0', '4', '0']);
  });

  /**
   * HALLAZGO 2402 (contenido, bajo) · REPARADO el 29/09/2026 — con una llegada decimal la tabla
   * por proceso dejaba de cuadrar con la tarjeta: la llegada salía con PUNTO («0.4», se imprimía
   * cruda) y la espera y el turnaround se redondeaban a entero (`formatNumber(x, 0)`, puesto en
   * la reparación del 761). Ahora cada tiempo sale en formato español con los decimales que de
   * verdad tiene (`formatTiempo`).
   *
   * A MANO — FCFS (aquí el motor acertaba) con P1(0; 8) · P2(0,4; 4) · P3(1; 1):
   *   P1 [0,8] · P2 [8,12] · P3 [12,13]
   *   esperas 0 · 7,6 · 11 → 18,6/3 = 6,20 (la tarjeta lo daba bien)
   *   TAT 8 · 11,6 · 12 → 31,6/3 = 10,53 (el valor de libro)
   * Obtenido antes en la tabla: P2 llegada «0.4», espera «8», turnaround «12»: la columna sumaba
   * 19 → media 6,33, y la tarjeta de encima decía 6,20.
   * Se comprueba lo que el alumno puede juzgar sin intérprete: que la tabla cuadre con la tarjeta.
   */
  test('2402 · con una llegada decimal la tabla por proceso cuadra con la tarjeta y va en formato español', async ({
    page,
  }) => {
    await abrirHidratada(page);
    await fijarProceso(page, 'P1', '0', '8');
    await fijarProceso(page, 'P2', '0.4', '4');
    await fijarProceso(page, 'P3', '1', '1');
    await page.getByRole('button', { name: BTN_FCFS }).click();
    await expect.poll(() => bloquesGantt(page)).toEqual(['P1', 'P2', 'P3']);

    const tabla = await page.locator('table').filter({ hasText: 'Turnaround' }).first().innerText();
    expect.soft(tabla).not.toMatch(/\d\.\d/);
    expect(await filaMetricas(page, 'P2')).toEqual(['P2', '0,4', '4', '8', '12', '7,6', '11,6', '7,6']);

    const esperas: number[] = [];
    for (const pid of ['P1', 'P2', 'P3']) esperas.push(celdaANumero((await filaMetricas(page, pid))[5]));
    const mediaTabla = esperas.reduce((s, x) => s + x, 0) / esperas.length;
    const mediaTarjeta = celdaANumero((await tarjeta(page, 'Tiempo medio de espera')).replace('ut', ''));
    // El defecto movía la media en 0,13 ut (6,33 frente a 6,20): basta una centésima.
    expect.soft(mediaTabla).toBeCloseTo(mediaTarjeta, 2);
    expect(await tarjeta(page, 'Tiempo medio turnaround')).toBe('10,53ut');

    // El corrector acepta la espera decimal tecleada con coma
    await page.getByLabel('Espera del proceso P2').fill('7,6');
    await page.getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.getByText('Correcto hasta aquí: 1 de 9 casillas')).toBeVisible();
  });
});
