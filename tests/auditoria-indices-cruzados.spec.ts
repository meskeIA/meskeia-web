import { test, expect } from '@playwright/test';

/**
 * AUDITORÍA puntual del 16/09/2026 — ¿hay otro `simulador-kmeans` suelto?
 *
 * Nace de la reparación de `a59ba434`: mover el deslizador K después de agrupar tumbaba la app,
 * porque una lista de longitud `k` indexaba otra cuya longitud la había fijado la última
 * ejecución. El análisis estático encontró 14 candidatos de esa firma y los 14 estaban
 * alineados por construcción, pero **no puede ver la forma exacta del caso de origen**: allí las
 * dos piezas vivían a 800 líneas de distancia, y eso ya no es una regex, es análisis de flujo.
 *
 * Así que esta red es de otra naturaleza: no mira el código, ejecuta la app y reproduce el
 * ORDEN que rompía kmeans —primero los botones que calculan, después los controles que cambian
 * los parámetros— escuchando `pageerror`. Ve cualquier caída, no solo la de esta firma.
 *
 * Es una auditoría, no un test de regresión: cubre las 22 apps que reúnen la condición
 * estructural (control numérico + lista de longitud variable + resultado guardado en estado).
 * Un verde aquí no demuestra que no haya bug —no explora secuencias largas ni combinaciones—,
 * solo que la secuencia que tumbó a kmeans no tumba a estas.
 */

const APPS = [
  'algebra-ecuaciones',
  'calculadora-fechas',
  'calculadora-horas',
  'generador-cartones-bingo',
  'generador-contrasenas',
  'generador-iconos',
  'metronomo',
  'planificador-turnos',
  'prueba-microfono',
  'seguimiento-habitos',
  'simulador-circuitos-electricos',
  'simulador-fotosintesis-factores',
  'simulador-kmeans',
  'simulador-monticulo-binario',
  'simulador-pathfinding',
  'simulador-programacion-dinamica',
  'simulador-regresion',
  'sonometro',
  'tirador-dados',
  'visualizador-algoritmos',
  'visualizador-estados-materia',
  'visualizador-numeros-primos',
];

/** Botones que sacarían de la app o abrirían permisos del navegador */
const NO_PULSAR =
  /volver|inicio|compartir|copiar|descargar|imprimir|cerrar|modo oscuro|modo claro|micrófono|cámara|grabar|permitir|feedback|reportar/i;

for (const slug of APPS) {
  test(`${slug} — calcular y luego mover los controles no la tumba`, async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(`${e.name}: ${e.message}`));

    await page.goto(`/${slug}/`);
    // Testigo de hidratación: el primer control interactivo de la página
    const primerControl = page.locator('input, button').first();
    await primerControl.waitFor({ state: 'attached', timeout: 15000 });
    await page.waitForTimeout(600);

    // 1) Pulsar los botones que calculan — lo que fija la longitud del resultado
    //
    // ⚠️ Los nombres se leen TODOS de golpe y antes de pulsar nada. Leerlos dentro del bucle
    // colgaba la sonda: al primer clic la página cambia (una sección se colapsa, aparece un
    // panel) y el `nth(i)` de después se queda esperando un botón que ya no existe hasta agotar
    // el test. En la primera pasada eso produjo 7 «fallos» que no eran caídas de app sino
    // timeouts de mi propio instrumento — y un instrumento que se cuelga no audita nada.
    //
    // ⚠️ Y se leen SIN lo que lleva `aria-hidden`: `getByRole` busca por nombre ACCESIBLE, y un
    // emoji envuelto en `aria-hidden` (regla §5) está en el textContent pero no en el nombre.
    // Con el textContent a secas, «▶️ Play» no casaba con el botón «Play», cada clic esperaba sus
    // 2 s y el test agotaba el tiempo (visualizador-algoritmos, 23/09/2026, al reparar el 1300).
    const nombres = await page.locator('button:visible').evaluateAll((els) =>
      els.map((el) => {
        const copia = el.cloneNode(true) as HTMLElement;
        copia.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
        return (copia.textContent || '').replace(/\s+/g, ' ').trim();
      }),
    );
    for (const nombre of nombres.slice(0, 14)) {
      if (!nombre || NO_PULSAR.test(nombre)) continue;
      await page
        .getByRole('button', { name: nombre, exact: true })
        .first()
        .click({ timeout: 2000 })
        .catch(() => {});
      await page.waitForTimeout(100);
    }

    // 2) AHORA mover cada control numérico a sus extremos, SIN recalcular
    const rangos = page.locator('input[type="range"]:visible, input[type="number"]:visible');
    const nRangos = Math.min(await rangos.count().catch(() => 0), 10);
    for (let i = 0; i < nRangos; i++) {
      await rangos
        .nth(i)
        .focus({ timeout: 2000 })
        .catch(() => {});
      for (const tecla of ['End', 'Home', 'ArrowRight', 'ArrowRight', 'ArrowLeft']) {
        await page.keyboard.press(tecla).catch(() => {});
        await page.waitForTimeout(60);
      }
    }

    // La pantalla de error global se lleva la app entera por delante
    await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toBeHidden();
    expect(errores, `caídas en /${slug}/`).toEqual([]);
  });
}
