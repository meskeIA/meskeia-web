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
