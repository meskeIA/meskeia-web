import { test, expect, Page, Locator } from '@playwright/test';
import { esperarValorEnReact } from './_hidratacion';

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
 *   salir "10", así que P(ninguna de las 80 lo sea) = (10/11)^80 ≈ 0,07 % — el test.fail() que
 *   llevaba abajo hasta su reparación (31/08/2026) era, a efectos prácticos, determinista.
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
   * que quieras conservar» y, en Bonoloto, «guardarlas para la semana» — un juego con sorteo
   * a diario, o sea que la promesa era justo lo que no se cumplía. Ahora se
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

  /**
   * Siembra el almacén sin carrera con la hidratación: la app reescribe la clave al montar,
   * así que sembrar antes de que eso ocurra pierde el valor sembrado de forma no determinista.
   * Que la clave exista prueba que su efecto de guardado ya corrió.
   */
  async function sembrarAlmacen(page: Page, valor: string) {
    await page.waitForFunction((k) => window.localStorage.getItem(k) !== null, CLAVE);
    await page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [CLAVE, valor] as const);
    await page.reload();
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
    await sembrarAlmacen(page, JSON.stringify([{
      id: 'sesion-anterior',
      type: 'primitiva',
      mainNumbers: [1, 2, 3, 4, 5, 6],
      extraNumbers: [7],
      timestamp: '2026-09-01T10:00:00.000Z',
    }]));
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
      await sembrarAlmacen(page, basura);
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * SEGUNDA INSPECCIÓN — 25/09/2026 · vuelve a la cola por FIRMA DE ROTURA
 *
 * Analytics marcó un CAMBIO: visitas cortas del 58 % al 68,8 % en 14 días (z 3,5). Las
 * recargas en la misma sesión, que son la otra mitad de la firma, se quedan en 2,9 %, por
 * DEBAJO del catálogo (3,1 %). Medido sobre el dump del 25/09 antes de abrir el navegador:
 *   · 99 de las 385 visitas recientes (26 %) salen de UN solo dispositivo Android (384×857,
 *     la misma red), con 80 % de visitas cortas y una sesión nueva en cada visita: no recarga,
 *     vuelve a abrir la app, hasta 37 veces en un día. Sin él, la app pasa del 58,1 % al
 *     65,0 % (286 visitas, z ≈ 2,0): por debajo de los dos umbrales (10 puntos y z 3).
 *   · Las búsquedas de Search Console que traen tráfico son de GENERADOR («generador
 *     primitiva», «generador bonoloto»…), no de resultados: el h1, el title y la intención
 *     casan.
 * Aun así se buscó lo que impide USAR la app, en escritorio y en móvil (412×915 y 360×800,
 * isMobile + hasTouch): primera visita sin nada guardado, visita con guardadas y almacén
 * mal formado. No hay errores de consola, ni caída, ni desbordamiento horizontal, y la
 * distribución de los números es uniforme (200 combinaciones por modalidad, χ² dentro de lo
 * esperable). Lo que sí sale son fallos de USO, sobre todo de la persistencia nueva del
 * 04/09 (S0115), que nunca se había inspeccionado. Fueron abajo con `test.fail()` hasta su
 * reparación el 25/09/2026.
 *
 * CASOS RESUELTOS A MANO ANTES DE EJECUTAR (reglas de Loterías y Apuestas del Estado):
 *   1. Normal — Euromillones, 3 combinaciones: tres tarjetas, cada una con 5 números
 *      distintos del 1 al 50 y 2 estrellas distintas del 1 al 12, en orden ascendente. Al
 *      guardar la primera y recargar, la lista muestra «a - b - c - d - e | Estrellas: x, y»
 *      y «Euromillones · guardada el DD/MM/AAAA» con la fecha de hoy.
 *   2. Límite — 20 combinaciones guardadas (el tope, MAX_FAVORITAS) y se guarda una más.
 *      La lista es [nueva, ...previas].slice(0, 20): la vigésima previa, la más antigua,
 *      sale de la lista. No hay en la página ningún aviso de ese tope.
 *   3. Rechazo / estrés de la persistencia — almacén con «null», un objeto, basura dentro del
 *      array, y una combinación válida mezclada con dos inválidas: la página carga y solo
 *      pinta la válida, «7 - 14 - 21 - 28 - 35 - 42 | Reintegro: 3», «La Primitiva · guardada
 *      el 01/09/2026». Y dos pestañas abiertas a la vez: la que se abrió antes no se entera de
 *      lo que guarda la otra, y su siguiente guardado reescribe la clave entera.
 *
 * HALLAZGOS del acta del 25/09/2026 (el número es su orden en ella): los ocho se REPARARON el
 * mismo 25/09/2026 (49134ac3 y, el aviso de transparencia, 6f6feb50) y la base no tiene
 * ninguno abierto (re-inspección del 03/10/2026). Los tests afirman lo que debe pasar y ya
 * pasan, sin `test.fail()`; donde un comentario dice «ANTES», describe el fallo de entonces.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const CLAVE_FAVORITAS = 'meskeia-loteria-favoritas';
/** Clave con la que `components/TransparencyBanner.tsx` recuerda que el aviso se cerró. */
const CLAVE_AVISO_TRANSPARENCIA = 'meskeia_transparency_banner_dismissed';
const UA_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

interface FavoritaGuardada {
  id: string;
  type: string;
  mainNumbers: number[];
  extraNumbers?: number[];
  timestamp: string;
}

/**
 * Espera a que React haya enganchado el botón Generar y a que el efecto de guardado haya
 * corrido (la clave existe). Un toque anterior se perdería, y sembrar el almacén antes de ese
 * efecto lo dejaría pisado por la lista vacía del primer render.
 */
async function esperarInteractiva(page: Page) {
  await page.waitForFunction(
    (clave) => {
      const boton = document.querySelector('[class*="generateButton"]');
      return (
        !!boton &&
        Object.keys(boton).some((k) => k.startsWith('__reactProps$')) &&
        window.localStorage.getItem(clave) !== null
      );
    },
    CLAVE_FAVORITAS,
    { timeout: 15_000 },
  );
}

/** Escribe en `localStorage` y recarga, sin carrera con el efecto de guardado de la app. */
async function sembrarYRecargar(page: Page, entradas: Record<string, string>) {
  await esperarInteractiva(page);
  await page.evaluate((e) => {
    for (const [k, v] of Object.entries(e)) window.localStorage.setItem(k, v);
  }, entradas);
  await page.reload();
  await esperarInteractiva(page);
}

async function leerFavoritas(page: Page): Promise<FavoritaGuardada[]> {
  const crudo = await page.evaluate((k) => window.localStorage.getItem(k), CLAVE_FAVORITAS);
  return crudo ? (JSON.parse(crudo) as FavoritaGuardada[]) : [];
}

/** Genera UNA combinación de la modalidad indicada y la guarda con la estrella. */
async function generarYGuardarUna(page: Page, tipo: Modalidad): Promise<number[]> {
  await seleccionarLoteria(page, tipo);
  await limpiarHistorial(page);
  await ponerCantidad(page, 1);
  await botonGenerar(page).click();
  await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
  const [combo] = await leerUltimasCombinaciones(page, 1);
  await page.locator('[class*="resultCard"]').first()
    .getByRole('button', { name: /Guardar esta combinación/ }).click();
  return combo.main;
}

const hoyEnEspanol = () =>
  new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

test.describe('25/09 · móvil 412×915 — caso normal de principio a fin', () => {
  test.use({
    viewport: { width: 412, height: 915 },
    userAgent: UA_ANDROID,
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('primera visita sin nada guardado: Euromillones ×3 se genera, se guarda y sigue tras recargar', async ({ page }) => {
    // Primera visita de verdad: se vacía el almacén y se vuelve a cargar con la escucha puesta
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await esperarInteractiva(page);
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await esperarInteractiva(page);

    await expect(page.getByRole('heading', { name: /Mis combinaciones guardadas/ })).toHaveCount(0);
    const anchoPagina = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(anchoPagina).toBeLessThanOrEqual(412); // sin desplazamiento horizontal

    await page.getByRole('button', { name: 'Euromillones', exact: true }).tap();
    await page.getByRole('button', { name: '3', exact: true }).tap();
    await botonGenerar(page).tap();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(3);

    // Caso 1 resuelto a mano: 5 distintos en [1, 50] + 2 estrellas distintas en [1, 12], ascendentes
    const combos = await leerUltimasCombinaciones(page, 3);
    for (const c of combos) {
      expect(c.main).toHaveLength(5);
      expect(new Set(c.main).size).toBe(5);
      expect(c.main.every((n) => n >= 1 && n <= 50)).toBe(true);
      expect([...c.main].sort((a, b) => a - b)).toEqual(c.main);
      expect(c.extra).toHaveLength(2);
      expect(new Set(c.extra).size).toBe(2);
      expect(c.extra.every((n) => n >= 1 && n <= 12)).toBe(true);
      expect([...c.extra].sort((a, b) => a - b)).toEqual(c.extra);
    }

    await page.locator('[class*="resultCard"]').first()
      .getByRole('button', { name: /Guardar esta combinación/ }).tap();
    await expect.poll(async () => (await leerFavoritas(page)).length).toBe(1);

    await page.reload();
    await esperarInteractiva(page);
    const tarjeta = page.locator('[class*="favoriteCard"]');
    await expect(tarjeta).toHaveCount(1);
    await expect(tarjeta).toContainText(combos[0].main.join(' - '));
    await expect(tarjeta).toContainText(`| Estrellas: ${combos[0].extra.join(', ')}`);
    await expect(tarjeta).toContainText(`Euromillones · guardada el ${hoyEnEspanol()}`);
    expect(errores).toEqual([]);
  });

  test('una combinación guardada en otra sesión se pinta con sus datos exactos', async ({ page }) => {
    await sembrarYRecargar(page, {
      [CLAVE_FAVORITAS]: JSON.stringify([{
        id: 'sesion-01-09', type: 'primitiva', mainNumbers: [7, 14, 21, 28, 35, 42],
        extraNumbers: [3], timestamp: '2026-09-01T10:00:00.000Z',
      }]),
    });
    const tarjeta = page.locator('[class*="favoriteCard"]');
    await expect(tarjeta).toHaveCount(1);
    await expect(tarjeta).toContainText('7 - 14 - 21 - 28 - 35 - 42');
    await expect(tarjeta).toContainText('| Reintegro: 3');
    // 10:00 UTC del 01/09 es el 01/09 en cualquier huso de España o Latinoamérica
    await expect(tarjeta).toContainText('La Primitiva · guardada el 01/09/2026');
  });
});

test.describe('25/09 · móvil 360×800 — límites y persistencia', () => {
  test.use({
    viewport: { width: 360, height: 800 },
    userAgent: UA_ANDROID,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('un almacén mal formado no tumba la página y de una lista mixta solo queda la válida', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));

    for (const basura of ['null', '{"a":1}', '[null,5,"x",[]]']) {
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: basura });
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Generador de Lotería');
      await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(0);
      await expect.poll(() => leerFavoritas(page)).toEqual([]); // la app reescribe la clave saneada
    }

    await sembrarYRecargar(page, {
      [CLAVE_FAVORITAS]: JSON.stringify([
        { id: 'mala-1', type: 'quiniela', mainNumbers: [1, 2, 3], timestamp: '2026-09-01T10:00:00.000Z' },
        { id: 'buena', type: 'primitiva', mainNumbers: [7, 14, 21, 28, 35, 42], extraNumbers: [3], timestamp: '2026-09-01T10:00:00.000Z' },
        { id: 'mala-2', type: 'bonoloto', mainNumbers: [1, 'dos', 3], timestamp: '2026-09-01T10:00:00.000Z' },
      ]),
    });
    const tarjeta = page.locator('[class*="favoriteCard"]');
    await expect(tarjeta).toHaveCount(1);
    await expect(tarjeta).toContainText('7 - 14 - 21 - 28 - 35 - 42');
    await expect(tarjeta).toContainText('La Primitiva · guardada el 01/09/2026');
    await expect.poll(async () => (await leerFavoritas(page)).map((f) => f.id)).toEqual(['buena']);
    expect(errores).toEqual([]);
  });

  test('hallazgo 3 · al guardar la combinación nº 21 no se pierde en silencio la más antigua', async ({ page }) => {
    // REPARADO (25/09/2026). Antes la lista era [nueva, ...previas].slice(0, 20): la más
    // antigua (g19) desaparecía del almacén sin ningún aviso en pantalla.
    //
    // El test original exigía a la vez «la nueva entra primera», «siguen siendo 20» y «g19 se
    // conserva», que no caben juntas (serían 21). Se eligió la otra rama del acta, «avisar
    // del tope»: con la lista llena la nueva NO entra, ninguna guardada se toca, la tarjeta
    // dice por qué, y el tope se enseña en la lista antes de alcanzarlo. Descartar en silencio
    // una combinación que el usuario guardó para jugarla es lo que no debe pasar; subir el tope
    // solo aplazaría el mismo borrado.
    const veinte = Array.from({ length: 20 }, (_, i) => ({
      id: `g${i}`, type: 'primitiva', mainNumbers: [1, 2, 3, 4, 5, 10 + i], extraNumbers: [i % 10],
      timestamp: `2026-09-${String(20 - i).padStart(2, '0')}T10:00:00.000Z`, // g0 la más reciente
    }));
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(veinte) });
    const favoritas = page.locator('[class*="favoriteCard"]');
    await expect(favoritas).toHaveCount(20);
    // El tope se ve ANTES de llegar a él
    await expect(page.locator('[class*="favoritesNota"]')).toContainText('Caben hasta 20: llevas 20.');

    await generarYGuardarUna(page, 'primitiva');

    // La tarjeta de la nº 21 explica que no se ha guardado y por qué
    const tarjeta = page.locator('[class*="resultCard"]').first();
    await expect(tarjeta.locator('[class*="avisoTope"]')).toContainText('No se ha guardado');
    await expect(tarjeta.locator('[class*="avisoTope"]')).toContainText('20 combinaciones guardadas, el máximo');
    await expect(tarjeta.getByRole('button', { name: /Guardar esta combinación/ })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('status').filter({ hasText: 'No se ha guardado' })).toHaveCount(1);

    // Ninguna guardada se ha perdido: las 20 siguen, en su orden, en pantalla y en el almacén
    await expect(favoritas).toHaveCount(20);
    expect((await leerFavoritas(page)).map((f) => f.id)).toEqual(veinte.map((g) => g.id));

    // Al quitar una, la nueva ya cabe
    await page.getByRole('button', { name: 'Quitar la combinación 1, 2, 3, 4, 5, 29 de las guardadas' }).tap();
    await expect(tarjeta.locator('[class*="avisoTope"]')).toHaveCount(0);
    await tarjeta.getByRole('button', { name: /Guardar esta combinación/ }).tap();
    await expect.poll(async () => (await leerFavoritas(page)).length).toBe(20);
    const ids = (await leerFavoritas(page)).map((f) => f.id);
    expect(ids).not.toContain('g19');
    expect(ids.slice(1)).toEqual(veinte.slice(0, 19).map((g) => g.id));
  });

  test('hallazgo 4 · al tocar Generar con el botón al pie de la pantalla, el resultado se ve', async ({ page }) => {
    // DEBE: llevar la vista al resultado (o anunciarlo) al generar. ANTES (hasta el 25/09/2026):
    // los resultados se pintaban DEBAJO del botón y la vista no se movía; con el botón en los
    // últimos ~130 px de la pantalla no se veía ni una bola, y el único cambio visible era el
    // texto «Generando...» durante 300 ms. Medido a 360×800: botón en 682-784 px, primera
    // tarjeta en 913 px.
    await sembrarYRecargar(page, { [CLAVE_AVISO_TRANSPARENCIA]: 'true' }); // sin el aviso delante
    await page.evaluate(() => {
      const r = document.querySelector('[class*="generateButton"]')!.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.bottom - window.innerHeight + 16);
    });
    const caja = (await botonGenerar(page).boundingBox())!;
    expect(caja.y + caja.height).toBeLessThanOrEqual(800); // precondición: el botón se ve entero
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);

    // REPARADO (25/09/2026): al generar, la vista baja hasta la tarjeta nueva. El
    // desplazamiento es suave (salvo prefers-reduced-motion), así que se sondea en vez de
    // medir una sola vez justo al pintarse.
    await expect.poll(() => page.evaluate(() => {
      const r = document.querySelector('[class*="resultCard"]')!.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight + 1; // la tarjeta ENTERA a la vista (1 px de redondeo subpíxel)
    }), { timeout: 3_000 }).toBe(true);
    // Y se anuncia a quien no ve la pantalla
    await expect(page.getByRole('status').filter({ hasText: 'Combinación generada. La Primitiva:' })).toHaveCount(1);
  });

  test('hallazgo 8 · en la primera visita el aviso de transparencia no tapa el botón Generar', async ({ page }) => {
    // Componente COMPARTIDO (components/TransparencyBanner.tsx, en app/layout.tsx), no código
    // de la app. REPARADO el 25/09/2026 (hallazgo 1636, commit 6f6feb50): fijo abajo con
    // z-index 1000 ocupaba el 24 % de la vista a 360×800 (591-784 px), justo donde queda el
    // botón al bajar hasta él. Hasta 640 px va ahora en el flujo, al final de la página.
    await esperarInteractiva(page);
    await expect(page.getByRole('complementary', { name: 'Aviso de transparencia sobre datos locales' })).toBeVisible();
    const recibeElBoton = await page.evaluate(() => {
      const boton = document.querySelector('[class*="generateButton"]')!;
      boton.scrollIntoView({ block: 'end' });
      window.scrollBy(0, 16);
      const r = boton.getBoundingClientRect();
      const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!encima && boton.contains(encima);
    });
    expect(recibeElBoton).toBe(true);
  });
});

test.describe('25/09 · escritorio — persistencia entre pestañas, copiar y contenido', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('hallazgo 2 · con dos pestañas abiertas, guardar en una no borra lo guardado en la otra', async ({ page }) => {
    // DEBE: el almacén acaba con las DOS combinaciones (X de la pestaña nueva, Y de la vieja).
    // ANTES (REPARADO el 25/09/2026): la pestaña vieja cargaba la lista antes de que X existiera
    // y no escuchaba el evento `storage`; al guardar Y reescribía la clave entera con [Y] y X
    // se perdía para siempre.
    const vieja = page; // cargada en el beforeEach, con la lista vacía
    await esperarInteractiva(vieja);

    const nueva = await page.context().newPage();
    await nueva.goto(RUTA);
    await esperarInteractiva(nueva);
    const x = await generarYGuardarUna(nueva, 'primitiva');
    await expect.poll(async () => (await leerFavoritas(nueva)).length).toBe(1); // precondición: X está guardada

    await vieja.bringToFront();
    const y = await generarYGuardarUna(vieja, 'primitiva');

    await expect.poll(async () => (await leerFavoritas(vieja)).map((f) => f.mainNumbers.join('-'))).toContain(y.join('-'));
    const guardadas = (await leerFavoritas(vieja)).map((f) => f.mainNumbers.join('-'));
    expect(guardadas).toContain(x.join('-')); // antes del 25/09 fallaba: X desaparecía
  });

  test('copiar deja en el portapapeles la combinación exacta', async ({ page }) => {
    await esperarInteractiva(page);
    await seleccionarLoteria(page, 'euromillones');
    await limpiarHistorial(page);
    await ponerCantidad(page, 1);
    await botonGenerar(page).click();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
    const [c] = await leerUltimasCombinaciones(page, 1);

    await page.getByRole('button', { name: 'Copiar combinación' }).click();
    // Formato de copyToClipboard: «<juego>: a - b - c - d - e | Estrellas: x, y»
    const esperado = `Euromillones: ${c.main.join(' - ')} | Estrellas: ${c.extra.join(', ')}`;
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(esperado);
  });

  test('hallazgo 5 · el botón Copiar confirma que ha copiado', async ({ page }) => {
    // DEBE: un «Copiada» visible y anunciado (aria-live). ANTES (REPARADO el 25/09/2026): la
    // combinación llegaba al portapapeles pero la pantalla no cambiaba nada y el botón parecía
    // no responder; la promesa de clipboard.writeText no se capturaba y un fallo se perdía.
    await esperarInteractiva(page);
    await ponerCantidad(page, 1);
    await botonGenerar(page).click();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Copiar combinación' }).click();
    await expect(page.locator('main').getByText(/copiad[ao]/i)).toBeVisible({ timeout: 2_000 });
    // REPARADO (25/09/2026): además de verse en el botón, se anuncia
    await expect(page.getByRole('status').filter({ hasText: 'Combinación copiada al portapapeles' })).toHaveCount(1);
  });

  test('hallazgo 5 · si el portapapeles falla, el botón Copiar lo dice en vez de callar', async ({ page }) => {
    await esperarInteractiva(page);
    await page.evaluate(() => {
      navigator.clipboard.writeText = () => Promise.reject(new DOMException('denegado', 'NotAllowedError'));
    });
    await ponerCantidad(page, 1);
    await botonGenerar(page).click();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Copiar combinación' }).click();
    await expect(page.locator('main').getByText('No copiada')).toBeVisible({ timeout: 2_000 });
    await expect(page.getByRole('status').filter({ hasText: 'No se ha podido copiar' })).toHaveCount(1);
  });

  test('hallazgo 5 · las combinaciones guardadas también se pueden copiar', async ({ page }) => {
    await sembrarYRecargar(page, {
      [CLAVE_FAVORITAS]: JSON.stringify([{
        id: 'sesion-01-09', type: 'primitiva', mainNumbers: [7, 14, 21, 28, 35, 42],
        extraNumbers: [3], timestamp: '2026-09-01T10:00:00.000Z',
      }]),
    });
    await page.getByRole('button', { name: 'Copiar la combinación guardada 7, 14, 21, 28, 35, 42' }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe('La Primitiva: 7 - 14 - 21 - 28 - 35 - 42 | Reintegro: 3');
    await expect(page.locator('[class*="favoriteCard"]').getByText('Copiada')).toBeVisible();
  });

  test('hallazgo 1 · los días de sorteo de La Primitiva y Bonoloto son los vigentes', async ({ page }) => {
    // Fuente: Loterías y Apuestas del Estado. La Primitiva: «Semanalmente se celebran sorteos
    // los lunes, jueves y sábados». Bonoloto: sorteo de lunes a domingo (el domingo se añadió
    // el 25/09/2022). ANTES (REPARADO el 25/09/2026) la app decía «Jueves y Sábados» y «Lunes a
    // Sábado» en el panel, en las fichas, en la tabla, en los textos de cada modalidad y en el
    // FAQPage.
    await esperarInteractiva(page);
    await seleccionarLoteria(page, 'primitiva');
    await expect(page.locator('[class*="lotteryInfo"]')).toContainText(/lunes, jueves y s[áa]bados/i);
    await seleccionarLoteria(page, 'bonoloto');
    await expect(page.locator('[class*="lotteryInfo"]')).toContainText(/lunes a domingo/i);
    // Ni un rastro de los días viejos en la página (fichas, textos, tabla)
    await expect(page.getByText(/Jueves y S[áa]bados|Lunes a S[áa]bado|de lunes a s[áa]bado/)).toHaveCount(0);

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const texto = JSON.stringify(faq);
    expect(texto).not.toContain('de lunes a sábado');
    expect(texto).not.toContain('se sortea jueves y sábados');
  });

  test('hallazgo 6 · la metadata no promete estadísticas que la página no tiene', async ({ page }) => {
    // DEBE: o la página ofrece estadísticas de los números, o la descripción y las `features`
    // del JSON-LD dejan de prometerlas. ANTES (REPARADO el 25/09/2026): description «…historial
    // y estadísticas» y feature «Estadísticas básicas de los números generados»; tras generar
    // 10 combinaciones no aparecía ninguna estadística ni frecuencia en la herramienta.
    await esperarInteractiva(page);
    const descripcion = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'WebApplication');
    const promete = /estad[íi]stica/i.test(descripcion) || /estad[íi]stica/i.test(JSON.stringify(app ?? {}));

    await ponerCantidad(page, 10);
    await botonGenerar(page).click();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(10);
    const ofrece = (await page.locator('main').getByText(/estad[íi]stica|frecuencia/i).count()) > 0;

    expect({ promete, ofrece }).not.toEqual({ promete: true, ofrece: false });
  });

  test('hallazgo 7 · el bloque educativo no tiene la errata «Jugas» ni atribuye estas loterías a la ONCE', async ({ page }) => {
    // DEBE: «Jugáis en grupo y necesitáis…» (la frase sigue en vosotros) y «Las principales
    // loterías de Loterías y Apuestas del Estado»: ninguna de las cuatro de la tabla es de la
    // ONCE. ANTES (REPARADO el 25/09/2026): «Jugas en grupo» y «Las principales loterías de la
    // ONCE y LAE».
    // El bloque educativo nace colapsado pero su texto está en el DOM
    await expect(page.getByText(/Jugas en grupo/)).toHaveCount(0);
    await expect(page.getByText(/loterías de la ONCE y LAE/)).toHaveCount(0);
    // REPARADO (25/09/2026): texto corregido, y Lototurf (que la app genera) entra en la tabla
    // y en el paso 1 de la guía. Odds: C(31,6) × 12 caballos = 736.281 × 12 = 8.835.372.
    await expect(page.getByText(/Jugáis en grupo y necesitáis/)).toHaveCount(1);
    const filaLototurf = page.locator('[class*="comparativaTable"] tr').filter({ hasText: 'Lototurf' });
    await expect(filaLototurf).toHaveCount(1);
    await expect(filaLototurf).toContainText('1 entre 8.835.372');
    await expect(page.getByText(/Euromillones, El Gordo o Lototurf/)).toHaveCount(1);
  });
});

/**
 * S0176 (03/10/2026) — comprobar las combinaciones guardadas con el resultado del sorteo.
 *
 * El cálculo está probado aparte, caso a caso, en tests/comprobar-loteria-motor.spec.ts.
 * Aquí se mira lo que solo se ve en el navegador: que lo tecleado llega al motor, que cada
 * combinación guardada sale con SU veredicto, y que un resultado no sobrevive a cambiar las
 * casillas (se leería el veredicto de otro sorteo).
 *
 * Sorteo inventado de La Primitiva: 3 12 25 33 41 48 · complementario 7 · reintegro 5.
 *   A  3 12 25 33 41 48 · R5 → 6 aciertos + reintegro      → Categoría especial
 *   B  3  7 12 25 33 41 · R0 → 5 aciertos, el 6.º es el 7  → 2.ª categoría
 *   C  1  2  4  6  8 10 · R9 → nada                        → Sin premio (0 aciertos)
 *   → «2 de tus 3 combinaciones de La Primitiva tienen premio de categoría; 1 acierta el reintegro.»
 * Euromillones: 5 14 23 37 44 · estrellas 3 11; guardada 5 14 23 37 44 + 3 7 → 5 + 1 → 2.ª.
 */
test.describe('S0176 · comprobar las combinaciones guardadas con el sorteo', () => {
  const GUARDADAS = [
    { id: 'a', type: 'primitiva', mainNumbers: [3, 12, 25, 33, 41, 48], extraNumbers: [5], timestamp: '2026-10-01T10:00:00.000Z' },
    { id: 'b', type: 'primitiva', mainNumbers: [3, 7, 12, 25, 33, 41], extraNumbers: [0], timestamp: '2026-10-01T10:00:00.000Z' },
    { id: 'c', type: 'primitiva', mainNumbers: [1, 2, 4, 6, 8, 10], extraNumbers: [9], timestamp: '2026-10-01T10:00:00.000Z' },
    { id: 'e', type: 'euromillones', mainNumbers: [5, 14, 23, 37, 44], extraNumbers: [3, 7], timestamp: '2026-10-01T10:00:00.000Z' },
  ];

  const comprobador = (page: Page) => page.getByRole('region', { name: /Comprobar con el resultado del sorteo/ });

  /** `fill()` y espera a que el valor haya llegado al estado de React. */
  async function teclear(page: Page, casilla: Locator, valor: string) {
    await casilla.fill(valor);
    await esperarValorEnReact(page, casilla, valor);
  }

  async function teclearPrimitiva(page: Page, numeros: string[], complementario: string, reintegro: string) {
    const zona = comprobador(page);
    for (let i = 0; i < numeros.length; i++) {
      await teclear(page, zona.getByLabel(`Número ${i + 1} de la combinación ganadora`), numeros[i]);
    }
    await teclear(page, zona.getByLabel('Complementario'), complementario);
    await teclear(page, zona.getByLabel('Reintegro'), reintegro);
  }

  test('sin combinaciones guardadas no hay comprobador', async ({ page }) => {
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: '[]' });
    await expect(comprobador(page)).toHaveCount(0);
  });

  test('La Primitiva: cada combinación guardada sale con su categoría', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GUARDADAS) });

    const zona = comprobador(page);
    // Hay dos loterías guardadas: sale el selector, con La Primitiva marcada de entrada
    await expect(zona.getByRole('button', { name: 'La Primitiva', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await teclearPrimitiva(page, ['3', '12', '25', '33', '41', '48'], '7', '5');
    await zona.getByRole('button', { name: 'Comprobar mis combinaciones de La Primitiva' }).click();

    await expect(zona).toContainText('2 de tus 3 combinaciones de La Primitiva tienen premio de categoría; 1 acierta el reintegro.');
    const filas = zona.locator('ul li');
    await expect(filas).toHaveCount(3);
    await expect(filas.nth(0).locator('[class*="comprobadaVeredicto"]')).toHaveText('Categoría especial (6 aciertos + reintegro)');
    await expect(filas.nth(1).locator('[class*="comprobadaVeredicto"]')).toHaveText('2.ª categoría (5 aciertos + complementario)');
    await expect(filas.nth(2).locator('[class*="comprobadaVeredicto"]')).toHaveText('Sin premio (0 aciertos)');

    // B: cinco bolas acertadas y el 7 marcado como complementario, también para lectores de pantalla
    await expect(filas.nth(1).locator('[class*="bolaAcertada"]')).toHaveCount(5);
    await expect(filas.nth(1).locator('[class*="bolaComplementario"]')).toHaveText('7 complementario');
    // A: las seis y el reintegro
    await expect(filas.nth(0).locator('[class*="bolaAcertada"]')).toHaveCount(7);
    // C: ninguna
    await expect(filas.nth(2).locator('[class*="bolaAcertada"]')).toHaveCount(0);

    // Lo que dice la pantalla también se anuncia
    await expect(page.getByRole('status').filter({ hasText: '2 de tus 3 combinaciones de La Primitiva' })).toHaveCount(1);
    expect(errores).toEqual([]);
  });

  test('cambiar una casilla retira el veredicto anterior; un sorteo imposible se explica', async ({ page }) => {
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GUARDADAS) });
    const zona = comprobador(page);
    const boton = zona.getByRole('button', { name: 'Comprobar mis combinaciones de La Primitiva' });

    await teclearPrimitiva(page, ['3', '12', '25', '33', '41', '48'], '7', '5');
    await boton.click();
    await expect(zona.locator('[class*="comprobadaVeredicto"]')).toHaveCount(3);

    // El complementario sale del mismo bombo, después: no puede ser uno de los seis
    await teclear(page, zona.getByLabel('Complementario'), '12');
    await expect(zona.locator('[class*="comprobadaVeredicto"]')).toHaveCount(0);
    await boton.click();
    await expect(zona.getByRole('alert')).toContainText('El complementario (12) no puede ser uno de los seis');
    await expect(zona.locator('[class*="comprobadaVeredicto"]')).toHaveCount(0);
  });

  test('Euromillones: se cambia de lotería y se comprueba con las estrellas', async ({ page }) => {
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GUARDADAS) });
    const zona = comprobador(page);
    await zona.getByRole('button', { name: 'Euromillones', exact: true }).click();
    await expect(zona.getByRole('button', { name: 'Euromillones', exact: true })).toHaveAttribute('aria-pressed', 'true');

    // Euromillones: 5 casillas, dos estrellas, sin complementario ni reintegro
    await expect(zona.getByLabel(/Número \d de la combinación ganadora/)).toHaveCount(5);
    await expect(zona.getByLabel('Complementario')).toHaveCount(0);
    const numeros = ['5', '14', '23', '37', '44'];
    for (let i = 0; i < numeros.length; i++) {
      await teclear(page, zona.getByLabel(`Número ${i + 1} de la combinación ganadora`), numeros[i]);
    }
    await teclear(page, zona.getByLabel('Estrella 1'), '3');
    await teclear(page, zona.getByLabel('Estrella 2'), '11');
    await zona.getByRole('button', { name: 'Comprobar mis combinaciones de Euromillones' }).click();

    await expect(zona).toContainText('Tu combinación de Euromillones tiene premio de categoría.');
    await expect(zona.locator('[class*="comprobadaVeredicto"]')).toHaveText(['2.ª categoría (5 aciertos + 1 estrella)']);
    await expect(zona).not.toContainText('El reintegro que cuenta');
  });

  test('móvil 360 px: el comprobador con resultado no desborda la pantalla', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GUARDADAS) });
    await teclearPrimitiva(page, ['3', '12', '25', '33', '41', '48'], '7', '5');
    await comprobador(page).getByRole('button', { name: 'Comprobar mis combinaciones de La Primitiva' }).click();
    await expect(comprobador(page).locator('[class*="comprobadaVeredicto"]')).toHaveCount(3);
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho).toBeLessThanOrEqual(360);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * TERCERA INSPECCIÓN — 03/10/2026 · re-inspección con FIRMA DE ROTURA y la función nueva S0176
 *
 * FIRMA (Analytics, 30 días hasta el 02/10): 852 visitas, 68,2 % cortas, 2,6 % recargas (por
 * debajo del catálogo), y CAMBIO: cortas del 59,3 % al 73,3 % en 14 días (z 5). Medido sobre
 * el dump del 03/10, ventana 19/09-02/10 frente a 08/08-18/09, ANTES de abrir el navegador:
 *   · El alza es entera de visitas RECURRENTES: pasan del 60 % al 83 % de las visitas y del
 *     62,7 % (282/450) al 79,2 % (304/384) de cortas. Las NUEVAS bajan: 54,2 % → 45,0 % (36/80).
 *   · Un bloque de IP 79.116.x.x con 384×857 (Android) suma 113 de las 464 visitas recientes
 *     (93 cortas), con una sesión distinta en cada visita: vuelve a abrir la app, no recarga.
 *   · Lectura: gente que vuelve unos segundos a mirar sus combinaciones guardadas (S0115,
 *     04/09). En móvil (360×800, 390×844, 412×915, hasTouch) no hay nada que impida usarla:
 *     sin errores de consola, sin desbordamiento, el generador, la estrella, Copiar y el
 *     comprobador responden. La tarjeta nueva tras Generar se ve. Lo único que se cruza en
 *     móvil es el comprobador con el botón al pie (hallazgo B, bajo), que es de hoy.
 *
 * SOSPECHA DEL 30/09 (scrollIntoView frente a la barra fija del logo), MEDIDA Y DESCARTADA en lo
 * que la app desplaza. La barra ocupa 0-62 px en móvil y 0-92 px a 800 y 1280 px.
 *   · Generar: `block: 'nearest'` sobre una tarjeta que nace DEBAJO del botón alinea su borde
 *     INFERIOR. Tarjeta en 604-800 (360×800), 648-844 (390×844), 749-900 (800×900).
 *   · Ficha → «Generar números de…»: `block: 'center'`. Panel del generador en 287-560 (360),
 *     286-558 (390), 336-565 (800). El panel de la modalidad, que va ENCIMA del destino, sí
 *     asoma por debajo de la barra a 360 px (su borde superior a 27 px), pero no es el destino
 *     y el botón ya dice qué modalidad se ha elegido.
 *   · El comprobador no desplaza nada (eso es el hallazgo B).
 * Pero alinear el borde INFERIOR choca con la otra pieza fija del layout, la píldora del Footer
 * (más de 768 px): hallazgo A.
 *
 * CASOS RESUELTOS A MANO ANTES DE EJECUTAR (fuente de las categorías de El Gordo: Resolución de
 * 20/01/2005 de LAE, BOE n.º 25 de 29/01/2005, BOE-A-2005-1507, normas 63.ª a 68.ª: 5 de 54 +
 * número clave del 0 al 9; 1.ª 5+clave · 2.ª 5 · 3.ª 4+clave · 4.ª 4 · 5.ª 3+clave · 6.ª 3 ·
 * 7.ª 2+clave · 8.ª 2; «todas las apuestas que tengan acertado el número clave obtendrán el
 * reintegro…, sin perjuicio de los premios» de la primera matriz). loteriasyapuestas.es
 * respondió 403 el 03/10/2026, así que los casos de categoría se anclan en El Gordo, que es la
 * modalidad con norma en el BOE.
 *   Sorteo 4 18 27 39 52 · clave 6, contra diez guardadas (una por casilla de la tabla):
 *     a 4 18 27 39 52 · 6 → 5 + clave → 1.ª y reintegro          (6 bolas marcadas)
 *     b 4 18 30 41 53 · 2 → 2         → 8.ª                       (2)
 *     c 1  2  3  5  7 · 6 → 0 + clave → solo reintegro            (1)
 *     d 4 18 27 39 50 · 1 → 4         → 4.ª                       (4)
 *     e 4 10 11 18 27 · 6 → 3 + clave → 5.ª y reintegro           (4)
 *     f 1  2  3  5 52 · 0 → 1         → sin premio                (1)
 *     g 1  2  3  4 18 · 6 → 2 + clave → 7.ª y reintegro           (3)
 *     h 1  2  4 18 27 · 0 → 3         → 6.ª                       (3)
 *     i 4 18 27 39 52 · 0 → 5         → 2.ª                       (5)
 *     j 1  4 18 27 39 · 6 → 4 + clave → 3.ª y reintegro           (5)
 *   → con categoría: a b d e g h i j = 8 de 10 · con reintegro: a c e g j = 5.
 *   Rechazos (rango 1-54, sin repetir, clave 0-9): 55 en la 3.ª casilla, el 18 dos veces, la
 *   5.ª casilla vacía, clave 10 y clave vacía → un aviso cada uno y ningún veredicto.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const T_0310 = '2026-10-01T10:00:00.000Z';
const gordo0310 = (id: string, mainNumbers: number[], clave: number) =>
  ({ id, type: 'gordo', mainNumbers, extraNumbers: [clave], timestamp: T_0310 });
const GORDO_0310 = [
  gordo0310('a', [4, 18, 27, 39, 52], 6),
  gordo0310('b', [4, 18, 30, 41, 53], 2),
  gordo0310('c', [1, 2, 3, 5, 7], 6),
  gordo0310('d', [4, 18, 27, 39, 50], 1),
  gordo0310('e', [4, 10, 11, 18, 27], 6),
  gordo0310('f', [1, 2, 3, 5, 52], 0),
  gordo0310('g', [1, 2, 3, 4, 18], 6),
  gordo0310('h', [1, 2, 4, 18, 27], 0),
  gordo0310('i', [4, 18, 27, 39, 52], 0),
  gordo0310('j', [1, 4, 18, 27, 39], 6),
];

const zonaComprobador = (page: Page) => page.getByRole('region', { name: /Comprobar con el resultado del sorteo/ });

/** `fill()` en una casilla del comprobador y espera a que el valor haya llegado a React. */
async function escribirCasilla(page: Page, casilla: Locator, valor: string) {
  await casilla.fill(valor);
  await esperarValorEnReact(page, casilla, valor);
}

/** Teclea un sorteo de El Gordo: cinco números y la clave. */
async function teclearGordo(page: Page, numeros: string[], clave: string) {
  const zona = zonaComprobador(page);
  for (let i = 0; i < 5; i++) {
    await escribirCasilla(page, zona.getByLabel(`Número ${i + 1} de la combinación ganadora`), numeros[i]);
  }
  await escribirCasilla(page, zona.getByLabel('Clave'), clave);
}

/** Espera a que acabe un desplazamiento suave: dos lecturas seguidas de scrollY iguales. */
async function esperarDesplazamientoQuieto(page: Page) {
  let anterior = Number.NaN;
  await expect.poll(async () => {
    const y = await page.evaluate(() => window.scrollY);
    const quieto = y === anterior;
    anterior = y;
    return quieto;
  }, { intervals: [150], timeout: 5_000 }).toBe(true);
}

/** Lleva la vista hasta que el borde inferior de `selector` quede a `margen` px del pie. */
async function botonAlPie(page: Page, selector: string, margen: number) {
  await page.evaluate(([sel, m]) => {
    const r = document.querySelector(sel)!.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.bottom - window.innerHeight + m);
  }, [selector, margen] as const);
}

test.describe('03/10 · comprobador con El Gordo de la Primitiva (BOE-A-2005-1507)', () => {
  test('las ocho categorías, el reintegro solo y el sin premio, cada uno en su fila', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GORDO_0310) });
    const zona = zonaComprobador(page);
    // Solo hay una lotería guardada: sin selector, El Gordo directamente, con su casilla «Clave»
    await expect(zona.locator('legend')).toHaveText('Combinación ganadora de El Gordo de la Primitiva');
    await expect(zona.getByRole('group', { name: 'Lotería que quieres comprobar' })).toHaveCount(0);
    await expect(zona.getByLabel(/Número \d de la combinación ganadora/)).toHaveCount(5);
    await expect(zona.getByLabel('Complementario')).toHaveCount(0);

    await teclearGordo(page, ['4', '18', '27', '39', '52'], '6');
    await zona.getByRole('button', { name: 'Comprobar mis combinaciones de El Gordo de la Primitiva' }).click();

    const resumen = '8 de tus 10 combinaciones de El Gordo de la Primitiva tienen premio de categoría; 5 aciertan el reintegro.';
    await expect(zona.locator('[class*="comprobadorResumen"]')).toHaveText(resumen);
    await expect(zona.locator('[class*="comprobadaVeredicto"]')).toHaveText([
      '1.ª categoría (5 aciertos + clave) y reintegro',
      '8.ª categoría (2 aciertos)',
      'Reintegro (0 aciertos + clave, sin premio de categoría)',
      '4.ª categoría (4 aciertos)',
      '5.ª categoría (3 aciertos + clave) y reintegro',
      'Sin premio (1 acierto)',
      '7.ª categoría (2 aciertos + clave) y reintegro',
      '6.ª categoría (3 aciertos)',
      '2.ª categoría (5 aciertos)',
      '3.ª categoría (4 aciertos + clave) y reintegro',
    ]);
    // Bolas marcadas por fila (números acertados + la clave si coincide)
    const marcadas = await zona.locator('ul li').evaluateAll((lis) =>
      lis.map((li) => li.querySelectorAll('[class*="bolaAcertada"]').length));
    expect(marcadas).toEqual([6, 2, 1, 4, 4, 1, 3, 3, 5, 5]);
    // Solo f queda sin premio de ninguna clase
    const conPremio = await zona.locator('ul li').evaluateAll((lis) =>
      lis.map((li) => /comprobadaPremio/.test(li.className)));
    expect(conPremio).toEqual([true, true, true, true, true, false, true, true, true, true]);
    await expect(page.getByRole('status').filter({ hasText: resumen })).toHaveCount(1);
    expect(errores).toEqual([]);
  });

  test('un sorteo imposible se rechaza con su motivo y sin veredicto', async ({ page }) => {
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GORDO_0310) });
    const zona = zonaComprobador(page);
    const boton = zona.getByRole('button', { name: 'Comprobar mis combinaciones de El Gordo de la Primitiva' });
    const casos: Array<[string[], string, string]> = [
      [['4', '18', '55', '39', '52'], '6', 'El número 3 (55) está fuera de rango: va del 1 al 54.'],
      [['4', '18', '18', '39', '52'], '6', 'El 18 está repetido en la combinación ganadora: en un sorteo no sale dos veces.'],
      [['4', '18', '27', '39', ''], '6', 'Falta el número 5 de la combinación ganadora, o no es un número entero.'],
      [['4', '18', '27', '39', '52'], '10', 'Clave: 10 está fuera de rango, va del 0 al 9.'],
      [['4', '18', '27', '39', '52'], '', 'Falta el número clave, o no es un número entero.'],
    ];
    for (const [numeros, clave, aviso] of casos) {
      await teclearGordo(page, numeros, clave);
      await boton.click();
      await expect(zona.getByRole('alert')).toHaveText(aviso);
      await expect(zona.locator('[class*="comprobadaVeredicto"]')).toHaveCount(0);
    }
    // Con la clave corregida, el mismo formulario ya da los diez veredictos
    await escribirCasilla(page, zona.getByLabel('Clave'), '6');
    await boton.click();
    await expect(zona.getByRole('alert')).toHaveCount(0);
    await expect(zona.locator('[class*="comprobadaVeredicto"]')).toHaveCount(10);
  });
});

test.describe('03/10 · escritorio 1280×800 — la tarjeta recién generada y la píldora fija del Footer', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.fail('hallazgo A · tras Generar, la estrella de la tarjeta nueva recibe el clic', async ({ page }) => {
    // ABIERTO, hallazgo (inspector 03/10/2026). Por encima de 768 px el Footer compartido es
    // una píldora FIJA abajo a la derecha (components/Footer.module.css: bottom 10 px, right
    // 20 px, z-index 1000). Desde la reparación del 25/09 (hallazgo 1632), Generar lleva la
    // tarjeta nueva a la vista con `block: 'nearest'`, que la deja con su borde inferior pegado
    // al pie de la ventana: justo debajo de la píldora quedan Copiar y Guardar. Medido con la
    // vista bajada 150-400 px: la estrella en (1062, 746) y la píldora en 990-1260 × 745-790;
    // igual a 1024×768, 1366×768 y 800×900 (a 1920×1080, no). Un clic en la estrella no guarda
    // nada; a 1024×768 cae en «Compartir» y deja en el portapapeles la URL de la página.
    // DEBE: la estrella (y Copiar) de la tarjeta recién generada reciben el clic.
    await esperarInteractiva(page);
    await page.evaluate(() => window.scrollTo(0, 300));
    const caja = (await botonGenerar(page).boundingBox())!;
    expect(caja.y >= 0 && caja.y + caja.height <= 800).toBe(true); // precondición: botón a la vista
    await botonGenerar(page).click();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => {
      const r = document.querySelector('[class*="resultCard"]')!.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight + 1;
    }), { timeout: 3_000 }).toBe(true);
    await esperarDesplazamientoQuieto(page);

    const estrella = page.locator('[class*="resultCard"]').first().getByRole('button', { name: /Guardar esta combinación/ });
    const recibe = await estrella.evaluate((b) => {
      const r = b.getBoundingClientRect();
      const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!encima && b.contains(encima);
    });
    expect(recibe).toBe(true); // HOY: lo recibe la píldora del Footer
    const e = (await estrella.boundingBox())!;
    await page.mouse.click(e.x + e.width / 2, e.y + e.height / 2);
    await expect.poll(async () => (await leerFavoritas(page)).length).toBe(1);
  });
});

test.describe('03/10 · móvil 360×800 — barra fija del logo y comprobador', () => {
  test.use({
    viewport: { width: 360, height: 800 },
    userAgent: UA_ANDROID,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /** Borde inferior de la barra fija del logo (62 px en móvil). */
  const bordeBarra = (page: Page) => page.evaluate(() =>
    document.querySelector('[class*="headerBar"]')!.getBoundingClientRect().bottom);

  test('Generar con el botón al pie: la tarjeta nueva queda entera y por debajo de la barra fija', async ({ page }) => {
    // Sospecha del 30/09 DESCARTADA: `block: 'nearest'` alinea el borde inferior de la tarjeta
    // (nace debajo del botón), así que su borde superior queda lejos de la barra (604 px).
    await esperarInteractiva(page);
    await botonAlPie(page, '[class*="generateButton"]', 16);
    const caja = (await botonGenerar(page).boundingBox())!;
    expect(caja.y + caja.height).toBeLessThanOrEqual(800);
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => {
      const r = document.querySelector('[class*="resultCard"]')!.getBoundingClientRect();
      return r.bottom <= window.innerHeight + 1;
    }), { timeout: 3_000 }).toBe(true);
    await esperarDesplazamientoQuieto(page);
    const barra = await bordeBarra(page);
    expect(barra).toBeGreaterThan(0);
    const tarjeta = (await page.locator('[class*="resultCard"]').first().boundingBox())!;
    expect(tarjeta.y).toBeGreaterThanOrEqual(barra);
  });

  test('desde la ficha de Euromillones: el panel del generador queda entero y por debajo de la barra', async ({ page }) => {
    // `block: 'center'`: panel en 287-560 px. Lo que asoma bajo la barra es el panel de la
    // modalidad, que está ENCIMA del destino; el botón ya nombra la modalidad elegida.
    await esperarInteractiva(page);
    await page.getByRole('button', { name: 'Generar números de Euromillones' }).tap();
    await expect(botonGenerar(page)).toContainText('Generar 1 combinación de Euromillones');
    await expect.poll(() => page.evaluate(() => {
      const r = document.querySelector('[class*="generatorPanel"]')!.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= window.innerHeight;
    }), { timeout: 4_000 }).toBe(true);
    await esperarDesplazamientoQuieto(page);
    const barra = await bordeBarra(page);
    const panel = (await page.locator('[class*="generatorPanel"]').boundingBox())!;
    expect(panel.y).toBeGreaterThanOrEqual(barra);
  });

  test.fail('hallazgo B · Comprobar con el botón al pie: el resumen del resultado se ve', async ({ page }) => {
    // ABIERTO, hallazgo (inspector 03/10/2026). El resultado del comprobador se pinta DEBAJO del
    // botón y la vista no se mueve: con el botón al pie (borde inferior a 792 px) el resumen
    // empieza en 808 px y la primera fila en 892. Es lo mismo que el hallazgo 1632 reparó en el
    // generador. Lo atenúa el teclado del móvil (al cerrarse deja ver lo que hay debajo), por
    // eso es bajo. El resumen sí se anuncia por la región aria-live.
    // DEBE: tras pulsar, el resumen (o la vista desplazada hasta él) a la vista.
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GORDO_0310) });
    await teclearGordo(page, ['4', '18', '27', '39', '52'], '6');
    await botonAlPie(page, '[class*="comprobadorBoton"]', 8);
    const zona = zonaComprobador(page);
    const caja = (await zona.getByRole('button', { name: /Comprobar mis combinaciones/ }).boundingBox())!;
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(zona.locator('[class*="comprobadorResumen"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() =>
      document.querySelector('[class*="comprobadorResumen"]')!.getBoundingClientRect().bottom <= window.innerHeight,
    ), { timeout: 3_000 }).toBe(true);
  });

  test.fail('hallazgo B · un sorteo imposible con el botón al pie: el aviso se ve', async ({ page }) => {
    // ABIERTO, hallazgo (inspector 03/10/2026). El aviso (role="alert") nace justo debajo del
    // botón: con el botón al pie queda en 800-847 px, fuera de la pantalla; a la vista no cambia
    // nada y el botón parece no responder.
    // DEBE: el aviso entero a la vista.
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GORDO_0310) });
    await teclearGordo(page, ['4', '18', '27', '39', '52'], '10');
    await botonAlPie(page, '[class*="comprobadorBoton"]', 8);
    const zona = zonaComprobador(page);
    const caja = (await zona.getByRole('button', { name: /Comprobar mis combinaciones/ }).boundingBox())!;
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(zona.getByRole('alert')).toHaveText('Clave: 10 está fuera de rango, va del 0 al 9.');
    await expect.poll(() => page.evaluate(() =>
      document.querySelector('[class*="comprobadorError"]')!.getBoundingClientRect().bottom <= window.innerHeight,
    ), { timeout: 3_000 }).toBe(true);
  });
});

test.describe('03/10 · contenido y accesibilidad', () => {
  test.fail('hallazgo C · la información fiscal no contradice la disposición adicional 33.ª de la LIRPF', async ({ page }) => {
    // ABIERTO, hallazgo (inspector 03/10/2026). Fuente: Ley 35/2006, DA 33.ª (texto consolidado
    // del BOE, BOE-A-2006-20764). Apartado 6: el premio sufre una retención del 20 % sobre lo
    // que excede de 40.000 €. Apartado 7: «no existirá obligación de presentar la citada
    // autoliquidación cuando … se hubiera practicado retención». Apartado 8: el premio no se
    // integra en la base del IRPF. La DA 33.ª la añadió la Ley 13/2011 (DF 9.ª), la reescribió
    // el ARTÍCULO 2 de la Ley 16/2012 y los 40.000 € son de la Ley 6/2018 (art. 67.1); el
    // artículo 13 de la Ley 16/2012 modifica el ITP-AJD.
    // HOY: «No declarar premios a Hacienda (obligatorio si superan 40.000 €)… No declararlos
    // constituye una infracción tributaria grave», y «Referencia legal: artículo 13 de la Ley
    // 16/2012». DEBE: ni la obligación de declarar un premio ya retenido ni el artículo 13.
    await expect(page.getByText(/obligatorio si superan 40\.000/)).toHaveCount(0);
    await expect(page.getByText(/infracción tributaria grave/)).toHaveCount(0);
    await expect(page.getByText(/artículo 13 de la Ley 16\/2012/)).toHaveCount(0);
  });

  test.fail('hallazgo D · Loterías y Apuestas del Estado no se presenta como el regulador', async ({ page }) => {
    // ABIERTO, hallazgo (inspector 03/10/2026). Ley 13/2011, de regulación del juego, DA 1.ª,
    // apartado Uno (BOE-A-2011-9280): SELAE y la ONCE «son los operadores designados para la
    // comercialización de los juegos de loterías». HOY la FAQ dice que los sorteos «están
    // supervisados por el organismo regulador español (Loterías y Apuestas del Estado)».
    await expect(page.getByText(/organismo regulador español \(Loterías y Apuestas del Estado\)/)).toHaveCount(0);
  });

  test.fail('hallazgo E · porcentajes con espacio y días de la semana en minúscula', async ({ page }) => {
    // ABIERTO, hallazgo (inspector 03/10/2026). «15 %» con espacio duro (CLAUDE.md global §2,
    // 25/09/2026) y los días de la semana en minúscula (RAE), como ya hace La Primitiva
    // («Lunes, jueves y sábados»). HOY: «50%» y «20%» (tres veces) en el bloque educativo, y
    // «Martes y Viernes» en el panel de Euromillones, en su ficha y en la tabla comparativa.
    const educativo = (await page.locator('[class*="guideSection"]').allTextContents()).join(' ');
    expect(educativo.match(/\d+%/g) ?? []).toEqual([]);
    await expect(page.locator('[class*="modalidadesSection"]')).not.toContainText('Martes y Viernes');
    await expect(page.locator('[class*="comparativaTable"]')).not.toContainText('Martes y Viernes');
  });

  test.fail('hallazgo F · las casillas del comprobador se distinguen del fondo (3:1)', async ({ page }) => {
    // ABIERTO, hallazgo (inspector 03/10/2026). WCAG 1.4.11 (contraste de lo que no es texto):
    // el borde de un campo es lo que lo identifica, y las casillas de los números no llevan
    // etiqueta visible propia. Borde 2 px var(--border) sobre var(--bg-card), con la sección
    // del mismo fondo: #E5E5E5 sobre #FFFFFF = 1,26:1 en claro; #404040 sobre #2A2A2A = 1,38:1
    // en oscuro (medido en navegador). DEBE: al menos 3:1.
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GORDO_0310.slice(0, 1)) });
    const ratio = await zonaComprobador(page).getByLabel('Número 1 de la combinación ganadora').evaluate((el) => {
      const rgb = (c: string) => (c.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
      const lum = (c: string) => {
        const [r, g, b] = rgb(c).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const borde = lum(getComputedStyle(el).borderTopColor);
      const fondo = lum(getComputedStyle(el).backgroundColor);
      return (Math.max(borde, fondo) + 0.05) / (Math.min(borde, fondo) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});
