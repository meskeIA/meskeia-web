import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Generador de Sopas de Letras — los dos defectos de la familia imprimible medidos el 17/11/2026
 * al reparar generador-laberintos (hallazgos 4948 y 4949, los mismos que 4273 y 4272 de
 * generador-fichas-calculo):
 *   · «Otra distinta» tomaba el n.º escrito como «Generar» y repetía la misma sopa.
 *   · La hoja (pie, resumen y título de la tabla) leía el nivel y el tamaño SELECCIONADOS, no los
 *     de la sopa generada: cambiados sin regenerar, la hoja daba datos con los que no se puede
 *     reconstruir lo impreso.
 * El oráculo es la propia cuadrícula: su texto, letra a letra, es la huella de la sopa.
 *
 * Primera inspección del Inspector (20/11/2026), a partir de «Inspector · la verdad de la
 * cuadrícula». El oráculo es un buscador INDEPENDIENTE (`buscarPalabra`) que recorre las 8
 * direcciones de la rejilla pintada y cuenta cada aparición por su conjunto de casillas (un
 * palíndromo como OSO, leído en los dos sentidos, es UNA aparición). No se fía de la lista ni del
 * motor: lo que se compara es lo que sale en pantalla.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: afirman lo CORRECTO; el día que se reparen,
 * fallarán por pasar y habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

// La transición global de 0,3 s del fondo (globals.css, `* { transition: background-color … }`)
// deja la casilla marcada a medio pintar si se mide justo después del clic: sin movimiento, al
// instante.
test.use({ reducedMotion: 'reduce' });

/** La tabla de la hoja: la que lleva el título «Cuadrícula de…» (la guía tiene otra tabla) */
const cuadricula = (page: Page) => page.locator('table', { has: page.locator('caption', { hasText: 'Cuadrícula de' }) });

const filas = (page: Page) => cuadricula(page).locator('tbody tr');

const huella = async (page: Page): Promise<string> =>
  (await cuadricula(page).locator('tbody').innerText()).replace(/\s+/g, '');

const numeroDeSopa = (page: Page) => page.locator('p', { hasText: 'Número de sopa:' }).locator('strong').last();

const pieDeHoja = (page: Page) => page.locator('p', { hasText: 'Sopa n.º' });

async function generar(page: Page, semilla?: string): Promise<void> {
  if (semilla !== undefined) {
    const caja = page.getByPlaceholder('Al azar');
    await caja.fill(semilla);
    await esperarValorEnReact(page, caja, semilla);
  }
  await page.getByRole('button', { name: /Generar sopa de letras/ }).click();
  await expect(filas(page).first()).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/generador-sopa-letras/');
  await esperarHidratacion(page, ['input[placeholder="Al azar"]']);
});

test('«Otra distinta» da otra sopa aunque haya un n.º escrito, y ese n.º nuevo la reconstruye', async ({ page }) => {
  await generar(page, '12345');
  await expect(numeroDeSopa(page)).toHaveText('12345');
  const antes = await huella(page);
  // Control: el mismo n.º reproduce la misma sopa
  await generar(page);
  expect(await huella(page), 'el 12345 escrito vuelve a dar la misma').toBe(antes);

  await page.getByRole('button', { name: /Otra distinta/ }).click();
  await expect(numeroDeSopa(page)).not.toHaveText('12345');
  await expect(numeroDeSopa(page)).toHaveText(/^[1-9]\d{5}$/);
  expect(await huella(page)).not.toBe(antes);
  await expect(page.getByPlaceholder('Al azar')).toHaveValue('');

  const n = (await numeroDeSopa(page).innerText()).trim();
  const otra = await huella(page);
  await generar(page, '1');
  await generar(page, n);
  expect(await huella(page), `n.º ${n}`).toBe(otra);
});

test('tras cambiar nivel y tamaño sin regenerar, la hoja sigue diciendo con qué se generó', async ({ page }) => {
  await page.getByLabel('Tamaño').selectOption('12');
  await page.getByRole('button', { name: /^Medio/ }).click();
  await generar(page, '12345');
  await expect(pieDeHoja(page)).toHaveText('Sopa n.º 12345 · Medio · con diagonales · meskeia.com');
  await expect(filas(page)).toHaveCount(12);

  await page.getByRole('button', { name: /^Difícil/ }).click();
  await expect(page.getByRole('button', { name: /^Difícil/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Tamaño').selectOption('20');

  // La cuadrícula no ha cambiado: la hoja tiene que seguir describiéndola
  await expect(filas(page)).toHaveCount(12);
  await expect(pieDeHoja(page)).toHaveText('Sopa n.º 12345 · Medio · con diagonales · meskeia.com');
  await expect(page.locator('p', { hasText: 'Número de sopa:' })).toContainText('12 × 12');
  await expect(cuadricula(page).locator('caption')).toContainText('Cuadrícula de 12 por 12 letras');
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Inspector 20/11/2026 · la verdad de la cuadrícula
// ─────────────────────────────────────────────────────────────────────────────────────────────

type Nivel = 'facil' | 'medio' | 'dificil';

const BOTON_NIVEL: Record<Nivel, RegExp> = { facil: /^Fácil/, medio: /^Medio/, dificil: /^Difícil/ };

/** Lo que promete cada botón de nivel (su etiqueta y la FAQ): fácil → y ↓; medio + ↘ ↙; difícil, las 8 */
const DIRECCIONES_NIVEL: Record<Nivel, readonly string[]> = {
  facil: ['0,1', '1,0'],
  medio: ['0,1', '1,0', '1,1', '1,-1'],
  dificil: ['0,1', '1,0', '1,1', '1,-1', '0,-1', '-1,0', '-1,-1', '-1,1'],
};

const ETIQUETA_NIVEL: Record<Nivel, string> = {
  facil: 'Fácil · derecha y abajo',
  medio: 'Medio · con diagonales',
  dificil: 'Difícil · las 8 direcciones',
};

interface Aparicion {
  celdas: string[];
  direcciones: string[];
}

/** Buscador independiente: cada aparición de `palabra` en las 8 direcciones, una por conjunto de casillas */
function buscarPalabra(rejilla: string[][], palabra: string): Aparicion[] {
  const letras = Array.from(palabra);
  const lado = rejilla.length;
  const porCasillas = new Map<string, Aparicion>();
  for (let f = 0; f < lado; f++) {
    for (let c = 0; c < lado; c++) {
      for (const direccion of DIRECCIONES_NIVEL.dificil) {
        const [df, dc] = direccion.split(',').map(Number);
        const celdas: string[] = [];
        for (let i = 0; i < letras.length; i++) {
          const ff = f + df * i;
          const cc = c + dc * i;
          if (ff < 0 || cc < 0 || ff >= lado || cc >= lado || rejilla[ff][cc] !== letras[i]) break;
          celdas.push(`${ff}-${cc}`);
        }
        if (celdas.length !== letras.length) continue;
        const clave = [...celdas].sort().join('|');
        const previa = porCasillas.get(clave);
        if (previa) previa.direcciones.push(direccion);
        else porCasillas.set(clave, { celdas, direcciones: [direccion] });
      }
    }
  }
  return [...porCasillas.values()];
}

/** Apariciones que se pueden leer en una dirección que el nivel admite */
const enElNivel = (rejilla: string[][], palabra: string, nivel: Nivel): Aparicion[] =>
  buscarPalabra(rejilla, palabra).filter((a) => a.direcciones.some((d) => DIRECCIONES_NIVEL[nivel].includes(d)));

const leerRejilla = (page: Page): Promise<string[][]> =>
  filas(page).evaluateAll((trs) => trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent ?? '')));

const leerLista = (page: Page): Promise<string[]> =>
  page.getByRole('heading', { name: 'Palabras a buscar' }).locator('xpath=following-sibling::ul[1]/li').allInnerTexts();

/** Casillas con fondo propio: las que el solucionario pinta (el resto es transparente) */
const celdasPintadas = (page: Page): Promise<string[]> =>
  filas(page).evaluateAll((trs) =>
    trs.flatMap((tr, f) =>
      Array.from(tr.querySelectorAll('td')).flatMap((td, c) => {
        const fondo = getComputedStyle(td).backgroundColor;
        return fondo === 'rgba(0, 0, 0, 0)' || fondo === 'transparent' ? [] : [`${f}-${c}`];
      }),
    ),
  );

/** El aviso de la app (no el anunciador de rutas de Next, que también es role="alert") */
const aviso = (page: Page) => page.locator('p[role="alert"]');

interface Ajustes {
  palabras?: string;
  lado?: number;
  nivel?: Nivel;
  semilla?: string;
}

async function generarCon(page: Page, ajustes: Ajustes): Promise<void> {
  if (ajustes.palabras !== undefined) {
    const caja = page.locator('textarea');
    await caja.fill(ajustes.palabras);
    await esperarValorEnReact(page, caja, ajustes.palabras);
  }
  if (ajustes.lado !== undefined) await page.getByLabel('Tamaño').selectOption(String(ajustes.lado));
  if (ajustes.nivel !== undefined) {
    const boton = page.getByRole('button', { name: BOTON_NIVEL[ajustes.nivel] });
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
  }
  if (ajustes.semilla !== undefined) {
    const caja = page.getByPlaceholder('Al azar');
    await caja.fill(ajustes.semilla);
    await esperarValorEnReact(page, caja, ajustes.semilla);
  }
  await page.getByRole('button', { name: /Generar sopa de letras/ }).click();
}

/** Ocho palabras propias, una con tilde (RATÓN → RATON). La lista se ordena de la más larga a la más corta */
const PROPIAS = 'GATO\nPERRO\nCABALLO\nTORTUGA\nCONEJO\nRATÓN\nOVEJA\nVACA';
const LISTA_PROPIAS = ['CABALLO', 'TORTUGA', 'CONEJO', 'PERRO', 'RATON', 'OVEJA', 'GATO', 'VACA'];

for (const nivel of ['facil', 'medio', 'dificil'] as const) {
  test(`CASO 1 (${nivel}) · cada palabra propia está UNA vez, en una dirección del nivel; la solución marca justo sus casillas; el n.º 4242 la reproduce`, async ({
    page,
  }) => {
    await generarCon(page, { palabras: PROPIAS, lado: 12, nivel, semilla: '4242' });
    await expect(numeroDeSopa(page)).toHaveText('4242');
    await expect(pieDeHoja(page)).toHaveText(`Sopa n.º 4242 · ${ETIQUETA_NIVEL[nivel]} · meskeia.com`);
    await expect(page.locator('p', { hasText: 'Número de sopa:' })).toContainText('8 palabras colocadas en una cuadrícula de 12 × 12');
    await expect(aviso(page)).toHaveCount(0);

    // El lado prometido y una letra en cada casilla (A-Z o Ñ: las tildes se quitan, la ñ se queda)
    const rejilla = await leerRejilla(page);
    expect(rejilla).toHaveLength(12);
    for (const fila of rejilla) {
      expect(fila).toHaveLength(12);
      for (const letra of fila) expect(letra).toMatch(/^[A-ZÑ]$/);
    }
    expect(await leerLista(page)).toEqual(LISTA_PROPIAS);

    // Cada palabra, exactamente una vez en una dirección que el nivel admite
    const solucion = new Set<string>();
    for (const palabra of LISTA_PROPIAS) {
      const apariciones = enElNivel(rejilla, palabra, nivel);
      expect(apariciones, `${palabra} en ${nivel}: ${JSON.stringify(buscarPalabra(rejilla, palabra))}`).toHaveLength(1);
      apariciones[0].celdas.forEach((celda) => solucion.add(celda));
    }

    // El solucionario pinta exactamente esas casillas (ni una más ni una menos)
    await expect.poll(() => celdasPintadas(page)).toEqual([]);
    await page.getByRole('button', { name: /Ver solución/ }).click();
    await expect.poll(async () => (await celdasPintadas(page)).sort()).toEqual([...solucion].sort());

    // El mismo n.º con la misma lista y ajustes reproduce la misma cuadrícula
    const antes = rejilla.flat().join('');
    await generarCon(page, { semilla: '1' });
    await expect(numeroDeSopa(page)).toHaveText('1');
    expect((await leerRejilla(page)).flat().join('')).not.toBe(antes);
    await generarCon(page, { semilla: '4242' });
    await expect(numeroDeSopa(page)).toHaveText('4242');
    expect((await leerRejilla(page)).flat().join('')).toBe(antes);
  });
}

test('CASO 2 (límite) · MARIPOSA llena el lado de 8; ELEFANTES (9) no cabe y se avisa por su nombre, sin colarla en la lista', async ({
  page,
}) => {
  await generarCon(page, { palabras: 'MARIPOSA', lado: 8, nivel: 'facil', semilla: '55' });
  await expect(numeroDeSopa(page)).toHaveText('55');
  let rejilla = await leerRejilla(page);
  expect(rejilla).toHaveLength(8);
  expect(enElNivel(rejilla, 'MARIPOSA', 'facil')).toHaveLength(1);
  await expect(aviso(page)).toHaveCount(0);

  await generarCon(page, { palabras: 'MARIPOSA\nELEFANTES', semilla: '55' });
  // Texto literal de generar() en page.tsx: 9 letras > 8 de lado
  await expect(aviso(page)).toHaveText(
    'No han cabido 1 palabra(s): ELEFANTES. Prueba con una cuadrícula mayor o quita alguna palabra.',
  );
  expect(await leerLista(page)).toEqual(['MARIPOSA']);
  rejilla = await leerRejilla(page);
  expect(buscarPalabra(rejilla, 'ELEFANTES')).toHaveLength(0);
});

test('CASO 2 (límite) · tildes fuera y ñ dentro, igual en la lista que en la rejilla; las repetidas cuentan una vez', async ({
  page,
}) => {
  // Promesa de la FAQ visible: «Las tildes se eliminan… La ñ sí se conserva»
  await generarCon(page, { palabras: 'CAMIÓN\nmuñeca\nPingüino\nÁRBOL\nACCIÓN', lado: 12, nivel: 'medio', semilla: '777' });
  await expect(numeroDeSopa(page)).toHaveText('777');
  expect(await leerLista(page)).toEqual(['PINGUINO', 'CAMION', 'MUÑECA', 'ACCION', 'ARBOL']);
  const rejilla = await leerRejilla(page);
  for (const palabra of ['PINGUINO', 'CAMION', 'MUÑECA', 'ACCION', 'ARBOL']) {
    expect(enElNivel(rejilla, palabra, 'medio'), palabra).toHaveLength(1);
  }

  await generarCon(page, { palabras: 'GATO\ngato\nGató\n GATO ', semilla: '9' });
  await expect(numeroDeSopa(page)).toHaveText('9');
  expect(await leerLista(page)).toEqual(['GATO']);
});

test('CASO 3 (rechazo) · lista vacía, o solo cifras, signos y espacios: aviso y ninguna sopa', async ({ page }) => {
  for (const entrada of ['', '123\n!!!\n   \n-\n¿?']) {
    await generarCon(page, { palabras: entrada, lado: 12, nivel: 'medio', semilla: '5' });
    await expect(aviso(page)).toHaveText('Escribe al menos una palabra de dos letras o más.');
    await expect(cuadricula(page)).toHaveCount(0);
  }
});

test('CASO 3 (rechazo) · 30 palabras en 8 × 8: las 20 que no caben se nombran en el aviso y las 10 de la lista están todas', async ({
  page,
}) => {
  const treinta = [
    'CABALLO', 'TORTUGA', 'CONEJO', 'PERRO', 'RATON', 'OVEJA', 'GATO', 'VACA', 'CERDO', 'GALLINA',
    'PATO', 'BURRO', 'CABRA', 'TORO', 'LEON', 'TIGRE', 'OSO', 'ZORRO', 'LOBO', 'CIERVO',
    'JIRAFA', 'CEBRA', 'MONO', 'PUMA', 'FOCA', 'BALLENA', 'DELFIN', 'PULPO', 'CANGREJO', 'MEDUSA',
  ];
  await generarCon(page, { palabras: treinta.join('\n'), lado: 8, nivel: 'facil', semilla: '5' });
  await expect(aviso(page)).toContainText('No han cabido 20 palabra(s): ');
  const texto = (await aviso(page).innerText()).trim();
  const descartadas = texto.replace(/^No han cabido \d+ palabra\(s\): /, '').replace(/\. Prueba con.*$/, '').split(', ');
  const lista = await leerLista(page);
  expect(lista).toHaveLength(10);
  expect([...lista, ...descartadas].sort()).toEqual([...treinta].sort());
  const rejilla = await leerRejilla(page);
  for (const palabra of lista) expect(enElNivel(rejilla, palabra, 'facil'), palabra).toHaveLength(1);
});

test('la hoja impresa basta para reconstruir la sopa: su lista en su orden, su n.º, su nivel y su lado', async ({ page }) => {
  // Lo que promete la pista: «si lo vuelves a introducir con la misma lista y los mismos ajustes…»
  const original = 'lobo\nMariposa\nDelfín\nJIRAFA\nCocodrilo\nTORTUGA\nCaballo\nArdilla\nPingüino\nElefante';
  await generarCon(page, { palabras: original, lado: 15, nivel: 'dificil', semilla: '2468' });
  await expect(pieDeHoja(page)).toHaveText('Sopa n.º 2468 · Difícil · las 8 direcciones · meskeia.com');
  const impresa = await leerLista(page);
  expect(impresa).toEqual(['COCODRILO', 'MARIPOSA', 'PINGUINO', 'ELEFANTE', 'TORTUGA', 'CABALLO', 'ARDILLA', 'DELFIN', 'JIRAFA', 'LOBO']);
  const antes = (await leerRejilla(page)).flat().join('');

  await generarCon(page, { palabras: 'SOL', lado: 8, nivel: 'facil', semilla: '1' });
  await expect(filas(page)).toHaveCount(8);
  await generarCon(page, { palabras: impresa.join('\n'), lado: 15, nivel: 'dificil', semilla: '2468' });
  await expect(filas(page)).toHaveCount(15);
  expect((await leerRejilla(page)).flat().join('')).toBe(antes);
});

test('impresión: solo la hoja (título, cuadrícula, lista y pie), y la solución sale pintada si está activa', async ({ page }) => {
  await generarCon(page, { palabras: PROPIAS, lado: 12, nivel: 'medio', semilla: '4242' });
  await expect(numeroDeSopa(page)).toHaveText('4242');
  const rejilla = await leerRejilla(page);
  const solucion = LISTA_PROPIAS.flatMap((p) => enElNivel(rejilla, p, 'medio').flatMap((a) => a.celdas));

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('h1')).toBeHidden();
  await expect(page.locator('textarea')).toBeHidden();
  await expect(page.getByRole('button', { name: /Generar sopa de letras/ })).toBeHidden();
  await expect(page.getByRole('button', { name: /Ver solución/ })).toBeHidden();
  await expect(cuadricula(page)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sopa de letras', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Palabras a buscar' })).toBeVisible();
  await expect(pieDeHoja(page)).toBeVisible();
  await expect.poll(() => celdasPintadas(page)).toEqual([]);
  await expect(cuadricula(page).locator('td').first()).toHaveCSS('color', 'rgb(0, 0, 0)');

  // «Se imprime lo que ves»: con la solución activada, el papel lleva las casillas marcadas
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('button', { name: /Ver solución/ }).click();
  await page.emulateMedia({ media: 'print' });
  await expect.poll(async () => (await celdasPintadas(page)).sort()).toEqual([...new Set(solucion)].sort());
});

test.describe('móvil (Pixel 7)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: devices['Pixel 7'].isMobile,
    hasTouch: devices['Pixel 7'].hasTouch,
  });

  test('la cuadrícula de 20 × 20 se ve entera, sin desbordar la pantalla', async ({ page }) => {
    await generarCon(page, { lado: 20, nivel: 'dificil', semilla: '4242' });
    await expect(numeroDeSopa(page)).toHaveText('4242');
    await expect(filas(page)).toHaveCount(20);
    await expect(cuadricula(page).locator('td')).toHaveCount(400);
    await cuadricula(page).scrollIntoViewIfNeeded();
    const caja = await cuadricula(page).boundingBox();
    const ancho = devices['Pixel 7'].viewport.width;
    if (!caja) throw new Error('la cuadrícula no tiene caja: no se ha pintado');
    expect(caja.x).toBeGreaterThanOrEqual(0);
    expect(caja.x + caja.width).toBeLessThanOrEqual(ancho);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(ancho);
  });
});

// ─────────────────────────────── Hallazgos abiertos (20/11/2026) ───────────────────────────────

test('HALLAZGO (20/11/2026, ABIERTO) · una palabra corta sale DOS veces y el solucionario solo marca una', async ({
  page,
}) => {
  // Ni el relleno al azar ni los cruces comprueban que no se forme otra copia de una palabra de la
  // lista. Barrido de 40 n.º por nivel en 12 × 12: con SOL, MAR, RIO, PAN, LUZ, OSO, AVE, TEA, 16
  // sopas de 40 en fácil, 23 en medio y 34 en difícil tienen alguna repetida; con EL y LA, todas.
  //   · n.º 1009, fácil: SOL → (5,6)-(5,8) y, hacia abajo, (7,10)-(9,10) con la S y la O de OSO y
  //     una L de relleno; la solución solo pinta la primera.
  //   · La lista «Animales» de la propia app, fácil, n.º 1028: LOBO → bajando por (8,9)-(11,9) y
  //     en la fila 10, (10,7)-(10,10), formada por el cruce de COCODRILO y MARIPOSA.
  test.fail();
  const casos: { palabras: string; semilla: string; palabra: string }[] = [
    { palabras: 'SOL\nMAR\nRIO\nPAN\nLUZ\nOSO\nAVE\nTEA', semilla: '1009', palabra: 'SOL' },
    {
      palabras: 'ELEFANTE\nJIRAFA\nTORTUGA\nDELFIN\nCABALLO\nARDILLA\nPINGUINO\nCOCODRILO\nMARIPOSA\nLOBO',
      semilla: '1028',
      palabra: 'LOBO',
    },
  ];
  for (const caso of casos) {
    await generarCon(page, { palabras: caso.palabras, lado: 12, nivel: 'facil', semilla: caso.semilla });
    await expect(numeroDeSopa(page)).toHaveText(caso.semilla);
    const rejilla = await leerRejilla(page);
    expect(enElNivel(rejilla, caso.palabra, 'facil'), `${caso.palabra} en el n.º ${caso.semilla}`).toHaveLength(1);
  }
});

test('HALLAZGO (20/11/2026, ABIERTO) · SOL junto a GIRASOL sale dos veces y no se avisa', async ({ page }) => {
  // La propia guía lo da por error que arruina la sopa («si están MAR y MARIPOSA, quien resuelve
  // marcará MAR dentro de MARIPOSA…»), pero el generador ni lo evita ni lo avisa: en los n.º 10 a
  // 14 (12 × 12, medio) SOL aparece 2 veces en las cinco. Vale cualquiera de las dos salidas:
  // colocar SOL dentro de GIRASOL (una sola aparición) o avisar nombrando SOL.
  test.fail();
  await generarCon(page, { palabras: 'GIRASOL\nSOL', lado: 12, nivel: 'medio', semilla: '10' });
  await expect(numeroDeSopa(page)).toHaveText('10');
  const rejilla = await leerRejilla(page);
  const veces = enElNivel(rejilla, 'SOL', 'medio').length;
  const avisaDeSol = (await aviso(page).count()) > 0 && (await aviso(page).innerText()).includes('SOL');
  expect(veces === 1 || avisaDeSol, `SOL aparece ${veces} veces y el aviso no lo nombra`).toBe(true);
});

test('HALLAZGO (20/11/2026, ABIERTO) · las listas rápidas escriben MUNECA, ALBANIL y MONTANA, sin la ñ que la app dice conservar', async ({
  page,
}) => {
  // LISTAS_TEMATICAS de page.tsx. La FAQ visible: «La ñ sí se conserva, porque es una letra
  // distinta de la n y suprimirla cambiaría la palabra».
  test.fail();
  const esperadas: [string, string][] = [
    ['Cuerpo humano', 'MUÑECA'],
    ['Oficios', 'ALBAÑIL'],
    ['Geografía', 'MONTAÑA'],
  ];
  for (const [lista, palabra] of esperadas) {
    await page.getByRole('button', { name: lista }).click();
    await expect(page.locator('textarea')).toHaveValue(new RegExp(`(^|\\n)${palabra}(\\n|$)`));
  }
});

test('HALLAZGO (20/11/2026, ABIERTO) · una ñ pegada en forma descompuesta (N + tilde combinante) se convierte en N', async ({
  page,
}) => {
  // normalizar() no pasa a NFC antes de filtrar: «N» + U+0303 pierde la tilde combinante con
  // replace(/[^A-ZÑ]/g, ''). Así llega el texto copiado de algunos PDF o de macOS.
  test.fail();
  await generarCon(page, { palabras: 'MUÑECA', lado: 12, nivel: 'medio', semilla: '777' });
  await expect(numeroDeSopa(page)).toHaveText('777');
  expect(await leerLista(page)).toEqual(['MUÑECA']);
});

test('HALLAZGO (20/11/2026, ABIERTO) · las palabras de una letra y las cifras se pierden o se cambian sin avisar', async ({
  page,
}) => {
  // «A\nSOL\nLUNA» → la A desaparece; «R2D2\nMP3\nSOL» → la lista dice RD y MP. Ningún aviso:
  // solo el contador «(… N válidas)» baja. La app avisa de lo que no cabe; de esto, no.
  test.fail();
  const avisoVisible = page.locator('[role="alert"], [role="status"]').filter({ hasText: /\S/ });
  for (const entrada of ['A\nSOL\nLUNA', 'R2D2\nMP3\nSOL']) {
    await generarCon(page, { palabras: entrada, lado: 12, nivel: 'medio', semilla: '5' });
    await expect(filas(page)).toHaveCount(12);
    await expect(avisoVisible, entrada).not.toHaveCount(0);
  }
});

test('HALLAZGO (20/11/2026, ABIERTO) · «1 palabras colocadas», «con 1 palabras escondidas» y «1 válidas»', async ({ page }) => {
  test.fail();
  await generarCon(page, { palabras: 'SOL', lado: 8, nivel: 'facil', semilla: '3' });
  await expect(numeroDeSopa(page)).toHaveText('3');
  await expect(page.locator('p', { hasText: 'Número de sopa:' })).not.toContainText('1 palabras');
  await expect(cuadricula(page).locator('caption')).not.toContainText('1 palabras');
  await expect(page.locator('label', { has: page.locator('textarea') })).not.toContainText('1 válidas');
});

test('HALLAZGO (20/11/2026, ABIERTO) · las mismas palabras en otro orden dan otra sopa con el mismo n.º', async ({ page }) => {
  // El orden de colocación es «de la más larga a la más corta» y, a igual longitud, el de la
  // entrada: la FAQ, la pista y la guía («con el mismo número de sopa, todas las hojas son
  // idénticas») no dicen que el orden cuente. Las 10 de «Animales», 15 × 15, difícil, n.º 2468.
  test.fail();
  const original = 'lobo\nMariposa\nDelfín\nJIRAFA\nCocodrilo\nTORTUGA\nCaballo\nArdilla\nPingüino\nElefante';
  await generarCon(page, { palabras: original, lado: 15, nivel: 'dificil', semilla: '2468' });
  await expect(filas(page)).toHaveCount(15);
  const antes = (await leerRejilla(page)).flat().join('');
  await generarCon(page, { palabras: 'SOL', lado: 8, nivel: 'facil', semilla: '1' });
  await expect(filas(page)).toHaveCount(8);
  await generarCon(page, { palabras: original.split('\n').reverse().join('\n'), lado: 15, nivel: 'dificil', semilla: '2468' });
  await expect(filas(page)).toHaveCount(15);
  expect((await leerRejilla(page)).flat().join('')).toBe(antes);
});

/** Respuesta del FAQPage (faqJsonLd de metadata.ts) a la pregunta que contiene `pregunta` */
async function respuestaFaqPage(page: Page, pregunta: string): Promise<string> {
  return page.evaluate((buscada) => {
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as {
        '@type'?: string;
        mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
      };
      if (j['@type'] !== 'FAQPage') continue;
      const q = (j.mainEntity ?? []).find((x) => x.name.includes(buscada));
      if (q) return q.acceptedAnswer.text;
    }
    return '';
  }, pregunta);
}

test('HALLAZGO (20/11/2026, ABIERTO) · el FAQPage promete que 12 × 12 admite «con holgura» 10-14 palabras de hasta 10 letras', async ({
  page,
}) => {
  // Diez palabras de 10 letras en 12 × 12, medio, n.º 501: no caben 3. Con catorce, en los n.º
  // 21-23 y los tres niveles, no caben entre 3 y 7. La FAQ visible da otra regla: ~70 letras
  // (la mitad de 144 casillas) en 10 o 12 palabras.
  test.fail();
  const diez = 'CARPINTERO\nPERIODISTA\nBALONCESTO\nESTUDIANTE\nBIBLIOTECA\nFONTANEROS\nMANDARINAS\nTELEVISION\nCHOCOLATES\nVENTANILLA';
  await generarCon(page, { palabras: diez, lado: 12, nivel: 'medio', semilla: '501' });
  await expect(aviso(page)).toContainText('No han cabido 3 palabra(s)');
  expect(await respuestaFaqPage(page, '¿Qué tamaño de cuadrícula necesito')).not.toContain('entre 10 y 14 palabras de hasta 10 letras');
});

test('HALLAZGO (20/11/2026, ABIERTO) · el FAQPage dice que el nivel difícil «multiplica por ocho» las direcciones', async ({ page }) => {
  // DIRECCIONES de page.tsx: fácil 2, medio 4, difícil 8. Difícil dobla las de medio y cuadruplica
  // las de fácil; «ocho» es el total, no el factor.
  test.fail();
  expect(await respuestaFaqPage(page, '¿Cuál es la diferencia entre los tres niveles')).not.toContain('multiplica por ocho');
});

test('HALLAZGO (20/11/2026, ABIERTO) · la FAQ visible pone de ejemplo de tilde quitada «MONTAÑA se escribe MONTAÑA»', async ({
  page,
}) => {
  // MONTAÑA no lleva tilde: el ejemplo no ilustra nada (debería ser algo como CAMIÓN → CAMION).
  test.fail();
  // El texto de la guía está en el DOM aunque nazca plegada; fuera los <script> (la carga de RSC)
  const texto = await page.evaluate(() => {
    const clon = document.body.cloneNode(true) as HTMLElement;
    clon.querySelectorAll('script, style').forEach((n) => n.remove());
    return (clon.textContent ?? '').replace(/\s+/g, ' ');
  });
  expect(texto).toContain('¿Qué pasa con las tildes y la ñ?');
  expect(texto).not.toContain('MONTAÑA se escribe MONTAÑA');
});

test('HALLAZGO (20/11/2026, ABIERTO) · la description promete «descárgalas» y elegir la «dirección de las palabras»', async ({
  page,
}) => {
  // No hay descarga (se imprime, o «Guardar como PDF» del diálogo del navegador) ni un control de
  // dirección: las direcciones las fija el nivel.
  test.fail();
  const descripcion = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
  expect(descripcion).not.toContain('descárgalas');
  expect(descripcion).not.toContain('dirección de las palabras');
});

test('HALLAZGO (20/11/2026, ABIERTO) · el botón de la solución cambia su nombre Y su aria-pressed a la vez', async ({ page }) => {
  // Pulsado se anuncia «Ocultar solución, botón conmutador, pulsado»: el estado va dos veces y se
  // contradice. Un conmutador mantiene el nombre (WAI-ARIA APG, patrón Button) o, si el nombre
  // cambia, no lleva aria-pressed.
  test.fail();
  await generarCon(page, { palabras: 'SOL\nLUNA', lado: 8, nivel: 'facil', semilla: '3' });
  const boton = page.getByRole('button', { name: /solución/ });
  const nombre = () =>
    boton.evaluate((el) =>
      Array.from(el.childNodes)
        .filter((n) => !(n instanceof HTMLElement && n.getAttribute('aria-hidden') === 'true'))
        .map((n) => n.textContent ?? '')
        .join('')
        .trim(),
    );
  const antes = await nombre();
  await boton.click();
  // Tras el clic la solución está puesta (control: la hoja tiene casillas pintadas)
  await expect.poll(async () => (await celdasPintadas(page)).length).toBeGreaterThan(0);
  const pulsado = await boton.getAttribute('aria-pressed');
  const despues = await nombre();
  expect(pulsado === null || despues === antes, `aria-pressed=${pulsado} · «${antes}» → «${despues}»`).toBe(true);
});
