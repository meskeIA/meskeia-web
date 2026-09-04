import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — generador-loteria (segmento interactiva, riesgo 4 informativo, 562 usos reales)
 *
 * Primera inspección: 31/08/2026. La app promete en su <h1> «Generador de Lotería» y en el
 * subtítulo «Genera combinaciones aleatorias de Primitiva, Euromillones, Bonoloto, El Gordo
 * de la Primitiva y Lototurf». La metadata añade lo mismo (title/description/FAQPage) y el
 * bloque de fichas por modalidad (una por juego, visible sin colapsar) repite las reglas de
 * cada una. Cinco motores comprobables, todos con la misma forma: N números principales sin
 * repetir en [1, mainMax] +, salvo alguna excepción, 1-2 números "extra" (Reintegro, Estrellas,
 * Clave o Caballo) en su propio rango.
 *
 * DÓNDE VIVE EL CÁLCULO — app/generador-loteria/page.tsx (no hay lib/ ni motor aparte)
 *   · generateUniqueNumbers(count, max, startFrom=1) ← bucle hasta reunir `count` valores
 *     ÚNICOS en el intervalo [startFrom, max] (los DOS extremos incluidos), orden ascendente.
 *   · Números principales: generateUniqueNumbers(config.mainNumbers, config.mainMax)
 *     → rango [1, mainMax] siempre.
 *   · Número(s) extra: startFrom = 0 si la modalidad es primitiva/bonoloto/gordo, si no 1;
 *     max = config.extraMax. Aquí está el fallo (ver HALLAZGO 1 más abajo).
 *
 * REGLAS OFICIALES de cada modalidad (Loterías y Apuestas del Estado — coinciden, además,
 * con la propia `config.description` que la app muestra en su ficha):
 *   · La Primitiva   → 6 números de 1 a 49  + Reintegro 1 dígito, 0 a 9  (10 valores)
 *   · Bonoloto       → 6 números de 1 a 49  + Reintegro 1 dígito, 0 a 9  (10 valores)
 *   · El Gordo       → 5 números de 1 a 54  + Clave     1 dígito, 0 a 9  (10 valores)
 *   · Euromillones   → 5 números de 1 a 50  + 2 Estrellas, cada una de 1 a 12, sin repetirse
 *   · Lototurf       → 6 números de 1 a 31  + Caballo ganador, 1 a 12
 *
 * CASOS DE PRUEBA resueltos a mano ANTES de abrir el navegador, para las 5 modalidades:
 *   generar 10 combinaciones de golpe (el máximo que ofrece la UI: botones 1/3/5/10, sin
 *   campo libre) y repetir varias tandas, comprobando en CADA combinación: (a) la cantidad de
 *   números principales y extra coincide exactamente con la tabla de arriba, (b) el rango de
 *   los principales es [1, mainMax], (c) ninguno se repite dentro de la misma combinación, y
 *   (d) el rango del extra es el oficial. Para el extra de primitiva/bonoloto/gordo se generan
 *   80 muestras (8 tandas de 10): con el bug activo, cada dígito tiene 1/11 de probabilidad de
 *   salir "10", así que P(ninguna de las 80 lo sea) = (10/11)^80 ≈ 0,07 % — el test.fail() de
 *   abajo es, a efectos prácticos, determinista.
 *
 * REPARADO — HALLAZGO 1 (calculo, alto) — Reintegro/Clave podía salir "10", que no existe.
 *   `config.extraMax` valía 10 para primitiva/bonoloto/gordo, pero se usaba como el VALOR
 *   máximo literal (no como "10 valores posibles"): con startFrom=0, generateUniqueNumbers
 *   calculaba floor(rand × (10−0+1)) + 0 → rango [0,10], 11 valores. El Reintegro y la Clave
 *   reales solo tienen 10 valores, 0 a 9 (una sola casilla decimal en el boleto). Comparar con
 *   Euromillones y Lototurf, donde extraMax SÍ era el valor máximo real (12) y el resultado ya
 *   era correcto. Confirmado en el navegador antes de reparar: de 30 combinaciones de
 *   Primitiva salió un "10" (combo #4); de 30 de Bonoloto, cuatro; de 30 de Gordo, dos.
 *   Reparado bajando `extraMax` a 9 en las tres modalidades (page.tsx).
 *
 * REPARADO — HALLAZGO 2 (contenido, bajo) — el botón "Generar" acentuaba mal el plural.
 *   page.tsx concatenaba: `` `Generar ${quantity} combinación${quantity > 1 ? 'es' : ''} de
 *   ${config.name}` ``. Con quantity > 1 daba "combinación" + "es" = "combinaciónes". El
 *   plural correcto de "combinación" es "combinaciones": el acento desaparece porque la
 *   sílaba tónica deja de ser la última. Reparado con la palabra completa en cada rama en vez
 *   de concatenar un sufijo.
 *
 * Sin hallazgos de accesibilidad: los botones ya llevan type="button", los toggles (selector
 * de modalidad, cantidad, favorito) llevan aria-pressed, y los emojis decorativos llevan
 * aria-hidden="true" (o van solos con aria-label, que es la excepción correcta).
 */

const RUTA = '/generador-loteria/';

type Modalidad = 'primitiva' | 'euromillones' | 'bonoloto' | 'gordo' | 'lototurf';

const NOMBRE_BOTON: Record<Modalidad, string> = {
  primitiva: 'La Primitiva',
  euromillones: 'Euromillones',
  bonoloto: 'Bonoloto',
  gordo: 'El Gordo de la Primitiva',
  lototurf: 'Lototurf',
};

/** Reglas oficiales (LAE), usadas como oráculo de cada aserción. */
const REGLA_OFICIAL: Record<Modalidad, {
  mainCount: number; mainMin: number; mainMax: number;
  extraCount: number; extraMin: number; extraMax: number; extraNombre: string;
}> = {
  primitiva:    { mainCount: 6, mainMin: 1, mainMax: 49, extraCount: 1, extraMin: 0, extraMax: 9,  extraNombre: 'Reintegro' },
  bonoloto:     { mainCount: 6, mainMin: 1, mainMax: 49, extraCount: 1, extraMin: 0, extraMax: 9,  extraNombre: 'Reintegro' },
  gordo:        { mainCount: 5, mainMin: 1, mainMax: 54, extraCount: 1, extraMin: 0, extraMax: 9,  extraNombre: 'Clave' },
  euromillones: { mainCount: 5, mainMin: 1, mainMax: 50, extraCount: 2, extraMin: 1, extraMax: 12, extraNombre: 'Estrellas' },
  lototurf:     { mainCount: 6, mainMin: 1, mainMax: 31, extraCount: 1, extraMin: 1, extraMax: 12, extraNombre: 'Caballo' },
};

type Combinacion = { main: number[]; extra: number[] };

/** Selecciona la modalidad por su nombre exacto en el selector superior (evita el "strict
 *  mode violation" de Playwright: el nombre también aparece, como subcadena, en el botón
 *  "Generar números de <juego>" de la ficha propia de cada modalidad más abajo). */
async function seleccionarLoteria(page: Page, tipo: Modalidad) {
  await page.getByRole('button', { name: NOMBRE_BOTON[tipo], exact: true }).first().click();
}

/** Vacía el historial si hay combinaciones previas, para no mezclar modalidades entre tests. */
async function limpiarHistorial(page: Page) {
  const limpiar = page.getByRole('button', { name: /Limpiar/ });
  if ((await limpiar.count()) > 0) await limpiar.click();
}

/** Pone la cantidad a generar de golpe. La UI SOLO ofrece 1, 3, 5 o 10 (sin campo libre). */
async function ponerCantidad(page: Page, n: 1 | 3 | 5 | 10) {
  await page.getByRole('button', { name: String(n), exact: true }).click();
}

/** El botón "Generar N combinaciones de <juego>" tiene texto dinámico; se localiza por su
 *  clase (evita ambigüedad con los botones "Generar números de <juego>" de las fichas). */
const botonGenerar = (page: Page) => page.locator('[class*="generateButton"]');

/** Lee las `cantidad` primeras tarjetas de resultado — las recién generadas, porque el estado
 *  las inserta al PRINCIPIO de la lista (`[...nuevas, ...anteriores]`) — y las convierte a
 *  números ya parseados. */
async function leerUltimasCombinaciones(page: Page, cantidad: number): Promise<Combinacion[]> {
  return page.evaluate((n) => {
    const tarjetas = Array.from(document.querySelectorAll('[class*="resultCard"]')).slice(0, n);
    return tarjetas.map((tarjeta) => ({
      main: Array.from(tarjeta.querySelectorAll('[class*="numberBall"]')).map((el) => Number(el.textContent!.trim())),
      extra: Array.from(tarjeta.querySelectorAll('[class*="extraBall"]')).map((el) => Number(el.textContent!.trim())),
    }));
  }, cantidad);
}

/** Genera `rondas` tandas de 10 combinaciones (el máximo de la UI) para `tipo` y devuelve
 *  TODAS las combinaciones acumuladas, leyendo tras cada tanda para no perder ninguna por el
 *  tope de 50 tarjetas que conserva el historial (`results.slice(0, 50)` en page.tsx). */
async function generarMuchas(page: Page, tipo: Modalidad, rondas: number): Promise<Combinacion[]> {
  await seleccionarLoteria(page, tipo);
  await limpiarHistorial(page);
  await ponerCantidad(page, 10);

  const todas: Combinacion[] = [];
  for (let i = 0; i < rondas; i++) {
    await botonGenerar(page).click();
    await page.waitForTimeout(400); // el propio generador espera 300ms (setTimeout interno)
    todas.push(...(await leerUltimasCombinaciones(page, 10)));
  }
  return todas;
}

/** Verifica invariantes de los números PRINCIPALES: cantidad, rango [min,max] y sin
 *  repetidos dentro de cada combinación individual. Vale para las 5 modalidades por igual. */
function verificarPrincipales(combos: Combinacion[], regla: (typeof REGLA_OFICIAL)[Modalidad]) {
  for (const combo of combos) {
    expect(combo.main).toHaveLength(regla.mainCount);
    for (const n of combo.main) {
      expect(n).toBeGreaterThanOrEqual(regla.mainMin);
      expect(n).toBeLessThanOrEqual(regla.mainMax);
    }
    expect(new Set(combo.main).size).toBe(combo.main.length); // sin repetidos
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generador de Lotería');
});

test.describe('Números principales — cantidad, rango y sin repetidos (las 5 modalidades)', () => {
  (Object.keys(NOMBRE_BOTON) as Modalidad[]).forEach((tipo) => {
    const regla = REGLA_OFICIAL[tipo];
    test(`${NOMBRE_BOTON[tipo]}: ${regla.mainCount} números en [${regla.mainMin}-${regla.mainMax}], sin repetidos (20 muestras)`, async ({ page }) => {
      const combos = await generarMuchas(page, tipo, 2); // 2 tandas de 10 = 20 muestras
      expect(combos.length).toBe(20);
      verificarPrincipales(combos, regla);
    });
  });
});

test.describe('Número(s) extra — Euromillones y Lototurf SÍ respetan su rango oficial', () => {
  test('Euromillones: 2 Estrellas en [1-12], distintas entre sí (20 muestras)', async ({ page }) => {
    const combos = await generarMuchas(page, 'euromillones', 2);
    const regla = REGLA_OFICIAL.euromillones;
    for (const combo of combos) {
      expect(combo.extra).toHaveLength(regla.extraCount);
      for (const n of combo.extra) {
        expect(n).toBeGreaterThanOrEqual(regla.extraMin);
        expect(n).toBeLessThanOrEqual(regla.extraMax);
      }
      expect(new Set(combo.extra).size).toBe(combo.extra.length); // las 2 estrellas no se repiten
    }
  });

  test('Lototurf: Caballo ganador en [1-12] (20 muestras)', async ({ page }) => {
    const combos = await generarMuchas(page, 'lototurf', 2);
    const regla = REGLA_OFICIAL.lototurf;
    for (const combo of combos) {
      expect(combo.extra).toHaveLength(regla.extraCount);
      expect(combo.extra[0]).toBeGreaterThanOrEqual(regla.extraMin);
      expect(combo.extra[0]).toBeLessThanOrEqual(regla.extraMax);
    }
  });
});

test.describe('REPARADO — HALLAZGO 1 (calculo, alto) — Reintegro/Clave ya no puede salir "10"', () => {
  // Regla oficial: Reintegro y Clave son UN dígito, 0 a 9 (10 valores). Antes de reparar,
  // extraMax=10 se usaba como valor literal con startFrom=0, así que el rango generado era
  // [0,10] (11 valores). Con 80 muestras, P(no observar ningún "10" por azar aunque el rango
  // siguiera roto) = (10/11)^80 ≈ 0,07%: estos tests son, a efectos prácticos, deterministas.

  test('Primitiva: el Reintegro nunca sale "10" (80 muestras)', async ({ page }) => {
    const combos = await generarMuchas(page, 'primitiva', 8);
    const regla = REGLA_OFICIAL.primitiva;
    for (const combo of combos) {
      expect(combo.extra[0]).toBeLessThanOrEqual(regla.extraMax); // 9
    }
  });

  test('Bonoloto: el Reintegro nunca sale "10" (80 muestras)', async ({ page }) => {
    const combos = await generarMuchas(page, 'bonoloto', 8);
    const regla = REGLA_OFICIAL.bonoloto;
    for (const combo of combos) {
      expect(combo.extra[0]).toBeLessThanOrEqual(regla.extraMax);
    }
  });

  test('El Gordo: la Clave nunca sale "10" (80 muestras)', async ({ page }) => {
    const combos = await generarMuchas(page, 'gordo', 8);
    const regla = REGLA_OFICIAL.gordo;
    for (const combo of combos) {
      expect(combo.extra[0]).toBeLessThanOrEqual(regla.extraMax);
    }
  });
});

test.describe('Caso límite — máximo de combinaciones que la UI permite de golpe', () => {
  test('el selector de cantidad solo ofrece 1, 3, 5 y 10 (sin campo libre)', async ({ page }) => {
    for (const n of [1, 3, 5, 10]) {
      await expect(page.getByRole('button', { name: String(n), exact: true })).toBeVisible();
    }
    // Ningún input numérico donde escribir una cantidad distinta.
    await expect(page.locator('input[type="number"]')).toHaveCount(0);
  });

  test('pedir 10 de golpe produce exactamente 10 combinaciones, todas válidas', async ({ page }) => {
    await seleccionarLoteria(page, 'primitiva');
    await limpiarHistorial(page);
    await ponerCantidad(page, 10);
    await botonGenerar(page).click();
    await page.waitForTimeout(400);

    const combos = await leerUltimasCombinaciones(page, 50); // techo del historial
    expect(combos).toHaveLength(10); // ni 9 ni 11: exactamente la cantidad pedida
    verificarPrincipales(combos, REGLA_OFICIAL.primitiva);
  });
});

test.describe('REPARADO — HALLAZGO 2 (contenido, bajo) — el botón "Generar" ya acentúa bien el plural', () => {
  test('con cantidad > 1 dice "combinaciones", no "combinaciónes"', async ({ page }) => {
    await seleccionarLoteria(page, 'primitiva');
    await ponerCantidad(page, 10);
    const texto = (await botonGenerar(page).textContent())!;
    expect(texto).toContain('combinaciones');
    expect(texto).not.toContain('combinaciónes');
  });

  test('con cantidad = 1 el singular "combinación" sí está bien escrito', async ({ page }) => {
    await seleccionarLoteria(page, 'primitiva');
    await ponerCantidad(page, 1);
    const texto = (await botonGenerar(page).textContent())!;
    expect(texto).toContain('Generar 1 combinación de La Primitiva');
  });
});

test.describe('REPARADO — HALLAZGO 570 (contenido, bajo) — el FAQPage ya no promete un número complementario que nadie genera ni elige', () => {
  /**
   * La FAQ de metadata.ts decía «se eligen 6 números del 1 al 49, más un número
   * complementario y el Reintegro». La app nunca genera un complementario (solo
   * mainNumbers + Reintegro), y en el juego real tampoco lo elige el jugador: lo
   * determina el sorteo entre las bolas no premiadas. Reparado: la FAQ ya no lo
   * presenta como algo que se «elige».
   */
  test('la primera respuesta del FAQPage no promete elegir un número complementario', async ({ page }) => {
    await page.goto('/generador-loteria/');
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const primeraRespuesta: string = faq.mainEntity[0].acceptedAnswer.text;
    expect(primeraRespuesta).toContain('6 números del 1 al 49 y el Reintegro');
    expect(primeraRespuesta).toContain('no lo elige el jugador');
    expect(primeraRespuesta).not.toContain('más un número complementario');
  });
});

test.describe('S0115 — las combinaciones guardadas sobreviven al cierre de la pestaña', () => {
  /**
   * Semilla S0115 (04/09/2026). Hasta esta fecha `favorites` vivía solo en `useState`: la
   * lista se vaciaba al recargar, mientras el texto de la propia app prometía «guardar las
   * que quieras conservar» y, en Bonoloto, «guardarlas para la semana» — un juego que sortea
   * de lunes a sábado, o sea que la promesa era justo lo que no se cumplía. Ahora se
   * persisten en localStorage bajo la clave `meskeia-loteria-favoritas`.
   *
   * Lo que estos tests fijan, además de la persistencia: que la lista se compara por la
   * COMBINACIÓN y no por el id. Al sobrevivir entre sesiones, una apuesta repetida llega con
   * un id nuevo, así que comparar por id la duplicaría para siempre y dejaría la estrella sin
   * marcar sobre una combinación que sí está guardada.
   */

  const CLAVE = 'meskeia-loteria-favoritas';

  /** Marca como guardada la primera combinación del historial. */
  async function guardarPrimera(page: Page) {
    await page.locator('[class*="resultCard"]').first()
      .getByRole('button', { name: /Guardar esta combinación/ }).click();
  }

  /** Lee la clave de localStorage tal cual la escribe la app. */
  async function leerAlmacen(page: Page): Promise<unknown[]> {
    const crudo = await page.evaluate((k) => window.localStorage.getItem(k), CLAVE);
    return crudo ? JSON.parse(crudo) : [];
  }

  test('una combinación guardada sigue ahí tras recargar la página', async ({ page }) => {
    await seleccionarLoteria(page, 'primitiva');
    await limpiarHistorial(page);
    await ponerCantidad(page, 1);
    await botonGenerar(page).click();
    await page.waitForTimeout(400);

    const numeros = (await leerUltimasCombinaciones(page, 1))[0].main;
    await guardarPrimera(page);
    await expect(page.getByRole('heading', { name: /Mis combinaciones guardadas/ })).toBeVisible();

    // Recargar equivale a volver otro día: el historial se pierde, las guardadas no
    await page.reload();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /Mis combinaciones guardadas/ })).toBeVisible();

    const tarjeta = page.locator('[class*="favoriteCard"]').first();
    await expect(tarjeta).toContainText(numeros.join(' - '));
    expect(await leerAlmacen(page)).toHaveLength(1);
  });

  test('la estrella es un conmutador y no deja duplicados en el almacén', async ({ page }) => {
    // La lista se compara por la COMBINACIÓN, no por el id (ver cabecera del bloque). Aquí se
    // fija lo observable sin depender del azar del generador: pulsar la estrella guarda,
    // volver a pulsarla quita, y el almacén nunca acumula dos entradas por la misma apuesta.
    await seleccionarLoteria(page, 'primitiva');
    await limpiarHistorial(page);
    await ponerCantidad(page, 1);
    await botonGenerar(page).click();
    await page.waitForTimeout(400);

    const estrella = page.locator('[class*="resultCard"]').first().locator('[aria-pressed]');
    await expect(estrella).toHaveAttribute('aria-pressed', 'false');

    await estrella.click();
    await expect(estrella).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(1);

    await estrella.click();
    await expect(estrella).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(0);
    expect(await leerAlmacen(page)).toHaveLength(0);

    await estrella.click();
    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(1);
    expect(await leerAlmacen(page)).toHaveLength(1);
  });

  test('una lista guardada de otra sesión se conserva al añadir combinaciones nuevas', async ({ page }) => {
    await page.evaluate((k) => {
      window.localStorage.setItem(k, JSON.stringify([{
        id: 'sesion-anterior',
        type: 'primitiva',
        mainNumbers: [1, 2, 3, 4, 5, 6],
        extraNumbers: [7],
        timestamp: '2026-09-01T10:00:00.000Z',
      }]));
    }, CLAVE);
    await page.reload();
    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(1);
    await expect(page.locator('[class*="favoriteCard"]').first()).toContainText('1 - 2 - 3 - 4 - 5 - 6');

    await seleccionarLoteria(page, 'primitiva');
    await limpiarHistorial(page);
    await ponerCantidad(page, 1);
    await botonGenerar(page).click();
    await page.waitForTimeout(400);
    await guardarPrimera(page);

    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(2);
    expect(await leerAlmacen(page)).toHaveLength(2);
  });

  test('un almacén corrupto o con basura no tumba la página', async ({ page }) => {
    // Tres formas de dato inválido: JSON roto, modalidad inexistente y números que no lo son.
    // La tercera es la que importa: LOTTERY_CONFIG[type] sería undefined y la página caería
    // al pintar el icono de la tarjeta.
    for (const basura of [
      '{no es json',
      JSON.stringify([{ id: 'x', type: 'quiniela', mainNumbers: [1, 2], timestamp: 'ayer' }]),
      JSON.stringify([{ id: 'y', type: 'primitiva', mainNumbers: 'muchos', timestamp: 1 }]),
    ]) {
      await page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [CLAVE, basura] as const);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generador de Lotería');
      await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(0);
    }
  });

  test('el botón Vaciar borra la lista guardada, también tras recargar', async ({ page }) => {
    await seleccionarLoteria(page, 'primitiva');
    await limpiarHistorial(page);
    await ponerCantidad(page, 1);
    await botonGenerar(page).click();
    await page.waitForTimeout(400);
    await guardarPrimera(page);
    expect(await leerAlmacen(page)).toHaveLength(1);

    await page.getByRole('button', { name: /Vaciar/ }).click();
    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(0);
    expect(await leerAlmacen(page)).toHaveLength(0);
  });
});
