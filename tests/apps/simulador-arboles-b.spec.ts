import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

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
 *
 * ── Inspección de CAMBIO (14/11/2026) ──────────────────────────────────────────────────
 * Diff b3b316cc..HEAD: 242a8070e (el recuento de divisiones cuenta líneas «División:», no
 * `log.length`), 148867460 (botones a --secondary-boton y #dc2626, hallazgo 3898 de la
 * hermana), ecf193648 (flex-wrap en la fila de operaciones y en el control de velocidad),
 * 7f04b0f92 («safe center» en el panel del árbol), tandas de contraste de C0070 y
 * relacionadas. Regla del motor, leída en page.tsx ANTES de calcular: inserción de abajo
 * arriba (se inserta en la hoja y se divide al DESBORDAR, con m claves), mediana en el
 * índice floor(m/2): orden 3 → sube la 2.ª de 3; orden 4 → sube la 3.ª de 4 (quedan 2 a la
 * izquierda y 1 a la derecha); orden 5 → sube la 3.ª de 5. Cada división de la raíz escribe
 * DOS líneas en el historial («División: …» y «La raíz se divide…»): el recuento viejo,
 * `log.length`, sumaba una de más por cada vez que el árbol ganaba altura.
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

// ═══════════════════ INSPECCIÓN DE CAMBIO — 14/11/2026 ═══════════════════

/** Escribe en el textarea de «Insertar varias» y comprueba que React lo recogió. */
async function escribirVarias(page: Page, texto: string): Promise<void> {
  await page.locator('#multi-input').fill(texto);
  await esperarValorEnReact(page, '#multi-input', texto);
}

const botonExacto = (page: Page, nombre: string) => page.getByRole('button', { name: nombre, exact: true });

/**
 * La secuencia 10, 20, 5, 6, 12, 30, 7, 17 en orden 3, resuelta a mano (máx 2 claves):
 *   10, 20      → [10 20]
 *   5           → [5 10 20] DESBORDA → sube el 10 · raíz [10], hojas [5] [20]     (div. 1, raíz)
 *   6           → [5 6]
 *   12          → [12 20]
 *   30          → [12 20 30] DESBORDA → sube el 20 · raíz [10 20]                 (div. 2)
 *                 hojas [5 6] [12] [30]
 *   7           → [5 6 7] DESBORDA → sube el 6 · raíz [6 10 20] DESBORDA          (div. 3)
 *                 → sube el 10 · raíz [10], internos [6] y [20]                    (div. 4, raíz)
 *   17          → [12 17]
 * Total: 4 divisiones (el recuento viejo, `log.length`, daba 6: dos de la raíz) y altura 3.
 */
const ARBOL_SECUENCIA_ORDEN_3 = [
  { nivel: 0, claves: '10' },
  { nivel: 1, claves: '6' },
  { nivel: 1, claves: '20' },
  { nivel: 2, claves: '5' },
  { nivel: 2, claves: '7' },
  { nivel: 2, claves: '12 17' },
  { nivel: 2, claves: '30' },
];

test.describe('Inspección de cambio 14/11/2026 · recuento de divisiones (242a8070e)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Árbol B');
    await esperarHidratacion(page, ['#ins-input', '#del-input', '#multi-input']);
  });

  test('los cuatro ejemplos anuncian las divisiones reales y dibujan el árbol resuelto a mano', async ({
    page,
  }) => {
    // Trazas a mano con la regla de la cabecera (división al desbordar, mediana floor(m/2)):
    //  · Secuencial 1-10, orden 3: dividen 3 (sube 2, raíz), 5 (sube 4), 7 (sube 6 y la raíz
    //    [2 4 6] sube el 4), 9 (sube 8) → 5 divisiones, dos de la raíz (el viejo decía 7).
    //  · División de la raíz, orden 3: solo el 30 divide (sube 20, raíz) → 1 (el viejo, 2).
    //  · Índice BD, orden 5: dividen el 40 ([20 30 40 50 70] sube 40, raíz) y el 90
    //    ([50 60 70 80 90] sube 70) → 2 (el viejo, 3).
    //  · Tres niveles, orden 4: dividen 35 (sube 25, raíz), 65 (sube 55), 95 (sube 85), 20
    //    ([5 10 15 20] sube 15, y la raíz [15 25 55 85] sube 55) y 40 ([30 35 40 45] sube 40)
    //    → 6, dos de la raíz (el viejo, 8).
    const casos = [
      {
        boton: /^Inserción secuencial 1-10/,
        mensaje: 'Cargado el ejemplo "Inserción secuencial 1-10" en orden 3. Claves: 10. Divisiones: 5.',
        altura: '3',
        arbol: [
          { nivel: 0, claves: '4' },
          { nivel: 1, claves: '2' },
          { nivel: 1, claves: '6 8' },
          { nivel: 2, claves: '1' },
          { nivel: 2, claves: '3' },
          { nivel: 2, claves: '5' },
          { nivel: 2, claves: '7' },
          { nivel: 2, claves: '9 10' },
        ],
        divisiones: 5,
        raiz: 2,
      },
      {
        boton: /^División de la raíz/,
        mensaje: 'Cargado el ejemplo "División de la raíz" en orden 3. Claves: 4. Divisiones: 1.',
        altura: '2',
        arbol: [
          { nivel: 0, claves: '20' },
          { nivel: 1, claves: '10' },
          { nivel: 1, claves: '30 40' },
        ],
        divisiones: 1,
        raiz: 1,
      },
      {
        boton: /^Índice de base de datos/,
        mensaje: 'Cargado el ejemplo "Índice de base de datos" en orden 5. Claves: 12. Divisiones: 2.',
        altura: '2',
        arbol: [
          { nivel: 0, claves: '40 70' },
          { nivel: 1, claves: '10 20 25 30' },
          { nivel: 1, claves: '50 55 60' },
          { nivel: 1, claves: '75 80 90' },
        ],
        divisiones: 2,
        raiz: 1,
      },
      {
        boton: /^Árbol de tres niveles/,
        mensaje: 'Cargado el ejemplo "Árbol de tres niveles" en orden 4. Claves: 15. Divisiones: 6.',
        altura: '3',
        arbol: [
          { nivel: 0, claves: '55' },
          { nivel: 1, claves: '15 25 40' },
          { nivel: 1, claves: '85' },
          { nivel: 2, claves: '5 10' },
          { nivel: 2, claves: '20' },
          { nivel: 2, claves: '30 35' },
          { nivel: 2, claves: '45 50' },
          { nivel: 2, claves: '65 75' },
          { nivel: 2, claves: '95' },
        ],
        divisiones: 6,
        raiz: 2,
      },
    ];
    for (const caso of casos) {
      await page.getByRole('button', { name: caso.boton }).click();
      await expect(mensajeEstado(page)).toContainText(caso.mensaje);
      expect(await leerArbol(page), caso.mensaje).toEqual(caso.arbol);
      expect(await leerTarjeta(page, 'Altura (niveles)')).toBe(caso.altura);
      // El historial y la cifra destacada cuentan lo mismo: una línea «División:» por partición
      const historial = await leerHistorial(page);
      expect(historial.filter((l) => l.startsWith('División:'))).toHaveLength(caso.divisiones);
      expect(historial.filter((l) => l.startsWith('La raíz se divide'))).toHaveLength(caso.raiz);
    }
  });

  test('«Insertar varias» y el cambio de orden cuentan las divisiones sin duplicar las de la raíz', async ({
    page,
  }) => {
    await escribirVarias(page, '10, 20, 5, 6, 12, 30, 7, 17');
    await botonExacto(page, 'Insertar varias').click();
    // Traza en ARBOL_SECUENCIA_ORDEN_3: 4 divisiones (el viejo, 6)
    await expect(mensajeEstado(page)).toContainText('Insertadas 8 de 8 claves. Divisiones: 4.');
    expect(await leerArbol(page)).toEqual(ARBOL_SECUENCIA_ORDEN_3);
    expect(await leerTarjeta(page, 'Altura (niveles)')).toBe('3');
    expect(await leerInorden(page)).toBe('5 · 6 · 7 · 10 · 12 · 17 · 20 · 30');

    // Pasar a orden 4 reconstruye desde el INORDEN (5, 6, 7, 10, 12, 17, 20, 30), a mano:
    //   5, 6, 7 → [5 6 7] · 10 → [5 6 7 10] DESBORDA → sube el 7 (índice 2) · raíz [7],
    //   hojas [5 6] [10] · 12, 17 → [10 12 17] · 20 → [10 12 17 20] DESBORDA → sube el 17 ·
    //   raíz [7 17], hojas [5 6] [10 12] [20] · 30 → [20 30]. Total: 2 (el viejo, 3).
    await page.getByRole('button', { name: /^Orden 4/ }).click();
    await expect(mensajeEstado(page)).toContainText(
      'Cambiado a orden 4. Árbol reconstruido con 8 claves y 2 división(es).',
    );
    expect(await leerArbol(page)).toEqual([
      { nivel: 0, claves: '7 17' },
      { nivel: 1, claves: '5 6' },
      { nivel: 1, claves: '10 12' },
      { nivel: 1, claves: '20 30' },
    ]);
    expect(await leerTarjeta(page, 'Claves máx / mín por nodo')).toBe('3 / 1');
  });

  test('caso límite: una sola clave que parte la hoja Y la raíz anuncia 2 divisiones, no 3', async ({
    page,
  }) => {
    for (const clave of [10, 20, 5, 6, 12, 30]) await insertarClave(page, clave);
    // Árbol intermedio (traza en ARBOL_SECUENCIA_ORDEN_3): raíz [10 20] llena, hojas [5 6] [12] [30]
    expect(await leerArbol(page)).toEqual([
      { nivel: 0, claves: '10 20' },
      { nivel: 1, claves: '5 6' },
      { nivel: 1, claves: '12' },
      { nivel: 1, claves: '30' },
    ]);
    expect(await leerTarjeta(page, 'Altura (niveles)')).toBe('2');

    // El 7 desborda la hoja [5 6 7] (sube el 6) y eso desborda la raíz [6 10 20] (sube el 10):
    // dos particiones y el árbol gana un nivel. El historial escribe TRES líneas.
    await insertarClave(page, 7);
    await expect(mensajeEstado(page)).toContainText(
      'Insertada la clave 7. Se produjeron 2 operación(es) de división.',
    );
    expect((await leerHistorial(page)).slice(-4)).toEqual([
      'Insertar 7',
      'División: la clave 6 sube al nodo padre',
      'División: la clave 10 sube al nodo padre',
      'La raíz se divide: el árbol gana un nivel de altura',
    ]);
    expect(await leerTarjeta(page, 'Altura (niveles)')).toBe('3');

    // El 17 cabe en la hoja [12]: ninguna división
    await insertarClave(page, 17);
    await expect(mensajeEstado(page)).toContainText('Insertada la clave 17 sin divisiones.');
    expect(await leerArbol(page)).toEqual(ARBOL_SECUENCIA_ORDEN_3);
  });

  test('«Aleatorias (8)» cuenta igual: con el azar fijado a la secuencia conocida salen 4', async ({
    page,
  }) => {
    // Math.random se fija DESPUÉS de hidratar para que el botón saque, en este orden,
    // 10, 20, 5, 6, 12, 30, 7, 17 (la app hace floor(r · 99) + 1).
    await page.evaluate(() => {
      const objetivo = [10, 20, 5, 6, 12, 30, 7, 17];
      let i = 0;
      Math.random = () => {
        const v = objetivo[i % objetivo.length];
        i += 1;
        return (v - 1) / 99 + 0.001;
      };
    });
    await botonExacto(page, 'Aleatorias (8)').click();
    await expect(mensajeEstado(page)).toContainText('Insertadas 8 claves aleatorias. Divisiones: 4.');
    expect(await leerArbol(page)).toEqual(ARBOL_SECUENCIA_ORDEN_3);
  });

  test('caso a rechazar en «Insertar varias»: texto, fuera de rango y duplicado no cuentan', async ({
    page,
  }) => {
    await escribirVarias(page, 'abc, xyz');
    await botonExacto(page, 'Insertar varias').click();
    await expect(mensajeEstado(page)).toContainText('No se encontraron números válidos en el texto.');
    expect(await leerArbol(page)).toEqual([]);
    expect(await leerTarjeta(page, 'Número de claves')).toBe('0');

    // Cinco números leídos; solo el primer 5 entra: 1000 > 999, el segundo 5 es duplicado,
    // 0 y −3 < 1. Una hoja con una clave: 0 divisiones.
    await escribirVarias(page, '5, 1000, 5, 0, -3');
    await botonExacto(page, 'Insertar varias').click();
    await expect(mensajeEstado(page)).toContainText('Insertadas 1 de 5 claves. Divisiones: 0.');
    expect(await leerArbol(page)).toEqual([{ nivel: 0, claves: '5' }]);
  });

  test('148867460 y C0070 · el texto de los botones y de la marca llega a 4,5:1 en claro y oscuro', async ({
    page,
  }) => {
    // Esperado a mano (WCAG, blanco encima): --primary-boton #26718F 5,47:1 · --secondary-boton
    // #327874 5,15:1 · #dc2626 4,83:1; en hover #246d8c 5,77:1 · #2a6663 6,60:1 · #b91c1c 6,47:1.
    // Los tokens -boton y el rojo literal son iguales en los dos temas. Medido el 14/11/2026: lo
    // más justo es el «600 ms» y el «Última operación:» en oscuro (#3FA5D1 sobre el tinte del
    // panel, 4,52:1).
    await prepararParaMedir(page);
    for (const tema of ['light', 'dark'] as const) {
      await activarTema(page, tema);
      await page.getByRole('button', { name: /^División de la raíz/ }).click(); // da el <strong>
      const guia = page.getByRole('button', { name: /Ver guía educativa/ });
      if (await guia.isVisible()) await guia.click();

      for (const nombre of ['Insertar', 'Eliminar', 'Buscar', 'Insertar varias', 'Aleatorias (8)', 'Limpiar todo']) {
        const boton = botonExacto(page, nombre);
        expect(await contrasteSobreFondoReal(boton), `${tema} · ${nombre}`).toBeGreaterThanOrEqual(4.5);
        await boton.hover();
        expect(await contrasteSobreFondoReal(boton), `${tema} · ${nombre} (hover)`).toBeGreaterThanOrEqual(4.5);
        await page.mouse.move(0, 0);
      }
      for (const [rotulo, selector] of [
        ['velocidad', 'main [class*="_speedValue"]'],
        ['tarjetas', 'main [class*="_infoValue"]'],
        ['Última operación', 'main [role="status"] strong'],
        ['cabecera de tabla', '[class*="_comparativaTable"] th'],
        ['número de paso', '[class*="_stepNumber"]'],
        ['pregunta', '[class*="_faqItem"] h4'],
        ['consejo de escenario', '[class*="_escenarioTip"]'],
        ['consejo de la FAQ', '[class*="_faqTip"]'],
      ]) {
        const elementos = page.locator(selector);
        const cuantos = await elementos.count();
        expect(cuantos, `${tema} · ${rotulo}: el selector no encontró nada`).toBeGreaterThan(0);
        for (let i = 0; i < cuantos; i++) {
          expect(await contrasteSobreFondoReal(elementos.nth(i)), `${tema} · ${rotulo} ${i}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  test('7f04b0f92 · en escritorio, un árbol que cabe sigue centrado con «safe center»', async ({ page }) => {
    // Medido el 14/11/2026 a 1280 px: «División de la raíz» (viewBox de 256 px) en un panel de
    // 1.040 px deja 368 px a cada lado.
    await page.getByRole('button', { name: /^División de la raíz/ }).click();
    const m = await page.evaluate(() => {
      const svg = document.querySelector('svg[aria-label="Visualización gráfica del árbol B"]') as SVGSVGElement;
      const c = svg.parentElement as HTMLElement;
      const rs = svg.getBoundingClientRect();
      const rc = c.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(c).paddingLeft);
      return { izq: rs.left - (rc.left + pad), der: rc.right - pad - rs.right };
    });
    expect(m.izq).toBeGreaterThan(0);
    expect(Math.abs(m.izq - m.der)).toBeLessThanOrEqual(1);
  });

  test.describe('móvil 390 px', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('ecf193648 · sin desborde horizontal; «Limpiar todo» y el control de velocidad caben y responden', async ({
      page,
    }) => {
      // Medido el 14/11/2026: filas de operación de x = 89 a 301; «Limpiar todo» baja a su propia
      // línea (89-201); control de velocidad 48-342 con «600 ms» de 266 a 326; documento de 390.
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      for (const nombre of ['Insertar', 'Eliminar', 'Buscar', 'Insertar varias', 'Aleatorias (8)', 'Limpiar todo']) {
        const boton = botonExacto(page, nombre);
        const caja = (await boton.boundingBox())!;
        const fila = await boton.evaluate((b) => {
          const r = (b.parentElement as HTMLElement).getBoundingClientRect();
          return { izq: r.left, der: r.right };
        });
        expect(caja.x, nombre).toBeGreaterThanOrEqual(0);
        expect(caja.x + caja.width, nombre).toBeLessThanOrEqual(390);
        // Dentro de SU fila, que es lo que se rompía (C0417: 61 px fuera)
        expect(caja.x, nombre).toBeGreaterThanOrEqual(fila.izq - 0.5);
        expect(caja.x + caja.width, nombre).toBeLessThanOrEqual(fila.der + 0.5);
      }
      const control = page.locator('#vel-input').locator('..');
      for (const parte of [control.locator('label'), page.locator('#vel-input'), control.locator('span')]) {
        const caja = (await parte.boundingBox())!;
        expect(caja.x).toBeGreaterThanOrEqual(0);
        expect(caja.x + caja.width).toBeLessThanOrEqual(390);
      }
      await expect(control.locator('span')).toHaveText('600 ms');

      // «Limpiar todo» responde al toque, y con el árbol más ancho la página no desborda
      await page.getByRole('button', { name: /^Árbol de tres niveles/ }).tap();
      await expect(mensajeEstado(page)).toContainText('Claves: 15. Divisiones: 6.');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      await botonExacto(page, 'Limpiar todo').tap();
      await expect(mensajeEstado(page)).toContainText('Árbol vaciado.');
      expect(await leerArbol(page)).toEqual([]);
    });

    // HALLAZGO 4606 (14/11/2026, REPARADO el mismo día: `.arbolSvg` con `max-width: none` y
    // `flex-shrink: 0`, como la hermana) · operativa/medio — 7f04b0f92 añadió `justify-content:
    // safe center` para que, si el árbol desborda, su borde izquierdo se alcance con el scroll
    // (cabo C0060, hallazgo 2298 de la hermana). Aquí no llega a actuar: `.arbolSvg` sigue con
    // `max-width: 100%` (la hermana simulador-arboles-bst-avl lo quitó en su hallazgo [3]), así que
    // el panel nunca desborda y el SVG se ENCOGE al ancho del panel. Medido a 390 px: el panel deja
    // 198 px de dibujo; «Inserción secuencial 1-10» (viewBox 568) se pinta al 35 %, «Índice de base
    // de datos» (552) al 36 % y «Árbol de tres niveles» (864) al 23 %: las claves de 14 px salen a
    // unos 3-5 px, ilegibles, y el panel no se desplaza (scrollWidth 246 = clientWidth 246).
    // Esperado: el árbol a tamaño real (ancho pintado ≥ viewBox) con desplazamiento en su panel.
    test('HALLAZGO 4606 · el «Árbol de tres niveles» se dibuja a tamaño real y se desplaza en su panel', async ({
      page,
    }) => {
      await page.getByRole('button', { name: /^Árbol de tres niveles/ }).tap();
      await expect(mensajeEstado(page)).toContainText('Claves: 15. Divisiones: 6.');
      const lienzo = await page.evaluate(() => {
        const svg = document.querySelector('svg[aria-label="Visualización gráfica del árbol B"]') as SVGSVGElement;
        const c = svg.parentElement as HTMLElement;
        return {
          pintado: svg.getBoundingClientRect().width,
          viewBox: Number((svg.getAttribute('viewBox') ?? '0 0 0 0').split(' ')[2]),
          scroll: c.scrollWidth,
          cliente: c.clientWidth,
        };
      });
      // Orden 4: hueco por hoja 3 · 32 + 40 = 136 px, 6 hojas, márgenes 2 · 24 → viewBox 864
      expect(lienzo.viewBox).toBe(864);
      expect(lienzo.pintado).toBeGreaterThanOrEqual(lienzo.viewBox);
      expect(lienzo.scroll).toBeGreaterThan(lienzo.cliente);
    });
  });
});
