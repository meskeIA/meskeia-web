import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Simulador de Árbol B (B-Tree) — test de regresión del Inspector (20/09/2026)
 *
 * La app promete (h1, metadata y bloque educativo) las invariantes de un árbol B:
 * máximo m-1 claves por nodo, mínimo ceil(m/2)-1 salvo la raíz, división al desbordar
 * con la mediana subiendo al padre, préstamo entre hermanos o fusión al quedarse corto,
 * todas las hojas al mismo nivel y recorrido inorden creciente.
 *
 * Los tres árboles esperados están DIBUJADOS A MANO antes de ejecutar la app, con la
 * traza de cada operación anotada. Orden 3 (el de por defecto): máx 2 claves, mín 1.
 *
 * ⚠️ El testigo NO son píxeles: se lee el TEXTO de las claves de cada nodo del SVG y el
 * nivel se deduce ordenando las coordenadas Y distintas, no comparándolas con las
 * constantes de maquetación. Dos nodos comparten Y si y solo si están a la misma
 * profundidad, que es justo lo que el caso quiere afirmar.
 */

const RUTA = '/simulador-arboles-b/';

interface NodoLeido {
  /** 0 = raíz, 1 = sus hijos, … */
  nivel: number;
  /** Claves del nodo separadas por espacio, tal y como se dibujan */
  claves: string;
}

/**
 * Región «Última operación» de la app. Va acotada a `main` a propósito: el `Footer`
 * monta otro `role="status"` para su aviso de «enlace copiado».
 */
const mensajeEstado = (page: Page) => page.locator('main [role="status"]');

/** El árbol dibujado, de arriba abajo y de izquierda a derecha. */
async function leerArbol(page: Page): Promise<NodoLeido[]> {
  return page.evaluate(() => {
    const svg = document.querySelector('svg[aria-label="Visualización gráfica del árbol B"]');
    if (!svg) return [];
    const crudos: { y: number; x: number; claves: string }[] = [];
    svg.querySelectorAll(':scope > g').forEach((grupo) => {
      const caja = grupo.querySelector(':scope > rect');
      if (!caja) return;
      crudos.push({
        y: Number(caja.getAttribute('y')),
        x: Number(caja.getAttribute('x')),
        claves: Array.from(grupo.querySelectorAll('text'))
          .map((t) => (t.textContent ?? '').trim())
          .join(' '),
      });
    });
    const alturas = Array.from(new Set(crudos.map((n) => n.y))).sort((a, b) => a - b);
    return crudos
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((n) => ({ nivel: alturas.indexOf(n.y), claves: n.claves }));
  });
}

/** Valor de una de las tres tarjetas de abajo del dibujo, buscada por su rótulo. */
async function leerTarjeta(page: Page, rotulo: string): Promise<string> {
  return page.evaluate((texto) => {
    const etiqueta = Array.from(document.querySelectorAll('span')).find(
      (s) => (s.textContent ?? '').trim() === texto,
    );
    return (etiqueta?.nextElementSibling?.textContent ?? '').trim();
  }, rotulo);
}

/** Panel «Recorrido inorden», con los espacios normalizados. */
async function leerInorden(page: Page): Promise<string> {
  return page.evaluate(() => {
    const titulo = Array.from(document.querySelectorAll('h3')).find((h) =>
      (h.textContent ?? '').includes('Recorrido inorden'),
    );
    return (titulo?.nextElementSibling?.textContent ?? '').replace(/\s+/g, ' ').trim();
  });
}

/** Líneas del «Historial de operaciones». */
async function leerHistorial(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const titulo = Array.from(document.querySelectorAll('div')).find((d) =>
      /^Historial de operaciones \(\d+\)$/.test((d.textContent ?? '').trim()),
    );
    const lista = titulo?.nextElementSibling;
    if (!lista || lista.tagName !== 'UL') return [];
    return Array.from(lista.querySelectorAll('li')).map((li) => (li.textContent ?? '').trim());
  });
}

async function insertarClave(page: Page, valor: number | string): Promise<void> {
  await sembrarValor(page, '#ins-input', valor);
  await page.getByRole('button', { name: 'Insertar', exact: true }).click();
}

async function eliminarClave(page: Page, valor: number): Promise<void> {
  await sembrarValor(page, '#del-input', valor);
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click();
}

/**
 * Árbol de partida de los casos 2 y 3: insertar 10, 20, 30, 40, 50 en orden 3.
 * Traza a mano (máx 2 claves por nodo):
 *   10        → [10]
 *   20        → [10 20]
 *   30        → [10 20 30] DESBORDA · mediana = índice floor(3/2) = 1 → sube el 20
 *                nace la raíz [20] con hijos [10] y [30]   (el árbol gana un nivel)
 *   40        → 40 > 20 → hoja derecha [30] → [30 40]      (cabe, no desborda)
 *   50        → 50 > 20 → hoja [30 40] → [30 40 50] DESBORDA · sube el 40
 *                la raíz pasa a [20 40] con hijos [10], [30] y [50]
 */
async function construirArbolBase(page: Page): Promise<void> {
  for (const clave of [10, 20, 30, 40, 50]) await insertarClave(page, clave);
}

test.describe('Simulador de Árbol B', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Árbol B');
    await esperarHidratacion(page, ['#ins-input', '#del-input']);
  });

  test('caso normal: insertar 10 20 30 40 50 divide la raíz y deja las hojas al mismo nivel', async ({
    page,
  }) => {
    await construirArbolBase(page);

    // Árbol dibujado a mano en `construirArbolBase`:
    //            [20 40]
    //        [10]  [30]  [50]
    expect(await leerArbol(page)).toEqual([
      { nivel: 0, claves: '20 40' },
      { nivel: 1, claves: '10' },
      { nivel: 1, claves: '30' },
      { nivel: 1, claves: '50' },
    ]);

    // 5 claves, 2 niveles, y las tres hojas en el nivel 1 (la promesa «todas las hojas
    // al mismo nivel» queda comprobada por el `toEqual` de arriba, no por la altura).
    expect(await leerTarjeta(page, 'Número de claves')).toBe('5');
    expect(await leerTarjeta(page, 'Altura (niveles)')).toBe('2');
    expect(await leerTarjeta(page, 'Claves máx / mín por nodo')).toBe('2 / 1');
    expect(await leerInorden(page)).toBe('10 · 20 · 30 · 40 · 50');

    // Hubo exactamente DOS divisiones: la del 20 (que además hizo crecer la raíz) y la del 40.
    const historial = await leerHistorial(page);
    expect(historial.filter((l) => l.startsWith('División:'))).toEqual([
      'División: la clave 20 sube al nodo padre',
      'División: la clave 40 sube al nodo padre',
    ]);
    // Solo la primera fue una división DE LA RAÍZ, y por eso el árbol tiene 2 niveles y no 3.
    expect(historial.filter((l) => l.startsWith('La raíz se divide'))).toHaveLength(1);
    // El mensaje de estado cuenta divisiones REALES, no líneas del historial. Hasta el
    // 20/09/2026 usaba `log.length`, y una división de la raíz escribe dos líneas para la
    // misma partición: insertar el 30 anunciaba «2 operación(es)» habiendo habido UNA.
    await expect(mensajeEstado(page)).toContainText(
      'Insertada la clave 50. Se produjeron 1 operación(es) de división.',
    );
  });

  test('el recuento de divisiones no cuenta dos veces la que parte la raíz', async ({ page }) => {
    // El caso exacto del hallazgo del Inspector (20/09/2026). Orden 3, insertar 10, 20 y 30:
    // la hoja-raíz [10 20 30] desborda y se parte en [10] y [30] promoviendo el 20. Es UNA
    // partición, y el historial la describe con dos líneas porque además sube un nivel.
    for (const clave of [10, 20, 30]) await insertarClave(page, clave);

    await expect(mensajeEstado(page)).toContainText(
      'Insertada la clave 30. Se produjeron 1 operación(es) de división.',
    );

    const historial = await leerHistorial(page);
    expect(historial.filter((l) => l.startsWith('División:'))).toHaveLength(1);
    // La línea informativa de la raíz sigue en el historial: es cierta y explica la altura.
    expect(historial.filter((l) => l.startsWith('La raíz se divide'))).toHaveLength(1);
  });

  test('caso límite: el borrado por debajo del mínimo fuerza primero fusión y luego préstamo', async ({
    page,
  }) => {
    await construirArbolBase(page);

    // ── Borrar 10 · traza a mano ────────────────────────────────────────────
    // La hoja [10] se queda vacía (0 < mínimo 1). No tiene hermano izquierdo y el
    // derecho, [30], está JUSTO en el mínimo (1 clave), así que no puede prestar:
    // toca FUSIONAR. Bajan el separador 20 del padre y las claves del hermano:
    // [20 30]. La raíz pierde el 20 y se queda en [40] con dos hijos.
    //            [40]
    //        [20 30]  [50]
    await eliminarClave(page, 10);
    expect(await leerArbol(page)).toEqual([
      { nivel: 0, claves: '40' },
      { nivel: 1, claves: '20 30' },
      { nivel: 1, claves: '50' },
    ]);
    expect(await leerTarjeta(page, 'Número de claves')).toBe('4');
    expect(await leerTarjeta(page, 'Altura (niveles)')).toBe('2');
    expect(await leerInorden(page)).toBe('20 · 30 · 40 · 50');
    await expect(mensajeEstado(page)).toContainText(
      'Eliminada la clave 10. Se aplicaron 1 reequilibrio(s) (préstamo/fusión).',
    );
    expect(await leerHistorial(page)).toContain('Fusión con el hermano derecho');

    // ── Borrar 50 · traza a mano ────────────────────────────────────────────
    // La hoja [50] se queda vacía. Ahora SÍ hay hermano izquierdo con excedente
    // ([20 30] tiene 2 claves > mínimo 1): se PRESTA, girando a través del padre.
    // Baja el separador 40 al hijo y sube el 30 al padre.
    //            [30]
    //        [20]    [40]
    await eliminarClave(page, 50);
    expect(await leerArbol(page)).toEqual([
      { nivel: 0, claves: '30' },
      { nivel: 1, claves: '20' },
      { nivel: 1, claves: '40' },
    ]);
    expect(await leerTarjeta(page, 'Número de claves')).toBe('3');
    expect(await leerTarjeta(page, 'Altura (niveles)')).toBe('2');
    expect(await leerInorden(page)).toBe('20 · 30 · 40');
    await expect(mensajeEstado(page)).toContainText(
      'Eliminada la clave 50. Se aplicaron 1 reequilibrio(s) (préstamo/fusión).',
    );
    expect(await leerHistorial(page)).toContain('Préstamo del hermano izquierdo para reequilibrar');
  });

  test('caso a rechazar: clave duplicada y clave fuera de rango no tocan el árbol', async ({
    page,
  }) => {
    await construirArbolBase(page);

    // El árbol de partida es [20 40] con hojas [10], [30], [50]: 5 claves.
    const antes = await leerArbol(page);
    const historialAntes = (await leerHistorial(page)).length;

    // 1) Duplicada: el 30 ya está en la hoja central. Un índice no admite claves
    //    repetidas (lo dice el propio bloque educativo), así que debe rechazarse.
    await insertarClave(page, 30);
    await expect(mensajeEstado(page)).toContainText(
      'La clave 30 ya está en el árbol (no se permiten duplicados).',
    );

    // 2) Fuera de rango por arriba (el máximo admitido es 999).
    await insertarClave(page, 1000);
    await expect(mensajeEstado(page)).toContainText(
      'Introduce un número entero entre 1 y 999.',
    );

    // 3) Campo vacío: Number('') vale 0, que también queda fuera del mínimo de 1.
    //    Se siembra antes un 7 para que vaciar el campo sea un CAMBIO real de estado:
    //    el botón deja el input en '' tras cada intento, así que sembrar '' sobre un
    //    campo ya vacío daría verde aunque la app estuviera sorda.
    await sembrarValor(page, '#ins-input', 7);
    await sembrarValor(page, '#ins-input', '');
    await page.getByRole('button', { name: 'Insertar', exact: true }).click();
    await expect(mensajeEstado(page)).toContainText(
      'Introduce un número entero entre 1 y 999.',
    );

    // Ninguno de los tres rechazos ha movido el árbol ni ha ensuciado el historial.
    expect(await leerArbol(page)).toEqual(antes);
    expect(await leerTarjeta(page, 'Número de claves')).toBe('5');
    expect(await leerInorden(page)).toBe('10 · 20 · 30 · 40 · 50');
    expect(await leerHistorial(page)).toHaveLength(historialAntes);
  });
});
