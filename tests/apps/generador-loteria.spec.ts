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
 * 04/09 (S0115), que nunca se había inspeccionado. Van abajo con `test.fail()`.
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
 * HALLAZGOS ABIERTOS (el número es su orden en el acta del 25/09/2026): afirman lo que
 * DEBERÍA pasar, así que hoy fallan a propósito; al repararlos se quita el `test.fail()`.
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

  test.fail('hallazgo 3 · al guardar la combinación nº 21 no se pierde en silencio la más antigua', async ({ page }) => {
    // DEBERÍA: o conservar todas, o avisar del tope de 20 ANTES de descartar una guardada.
    // HOY: la lista es [nueva, ...previas].slice(0, 20) — la más antigua (g19) desaparece
    // del almacén sin ningún aviso en pantalla. Resuelto a mano: 20 previas + 1 = 21 → cae g19.
    const veinte = Array.from({ length: 20 }, (_, i) => ({
      id: `g${i}`, type: 'primitiva', mainNumbers: [1, 2, 3, 4, 5, 10 + i], extraNumbers: [i % 10],
      timestamp: `2026-09-${String(20 - i).padStart(2, '0')}T10:00:00.000Z`, // g0 la más reciente
    }));
    await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(veinte) });
    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(20);

    await generarYGuardarUna(page, 'primitiva');
    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(20); // precondición: el tope actúa

    // Espera a que el guardado llegue al almacén: la nueva pasa a ser la primera
    await expect.poll(async () => (await leerFavoritas(page))[0]?.id).not.toBe('g0');
    const ids = (await leerFavoritas(page)).map((f) => f.id);
    expect(ids).toContain('g19'); // HOY falla: g19 ya no está
  });

  test.fail('hallazgo 4 · al tocar Generar con el botón al pie de la pantalla, el resultado se ve', async ({ page }) => {
    // DEBERÍA: llevar la vista al resultado (o anunciarlo) al generar. HOY: los resultados se
    // pintan DEBAJO del botón y la vista no se mueve; con el botón en los últimos ~130 px de
    // la pantalla no se ve ni una bola, y el único cambio visible es el texto «Generando...»
    // durante 300 ms. Medido a 360×800: botón en 682-784 px, primera tarjeta en 913 px.
    await sembrarYRecargar(page, { [CLAVE_AVISO_TRANSPARENCIA]: 'true' }); // sin el aviso delante
    await page.evaluate(() => {
      const r = document.querySelector('[class*="generateButton"]')!.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.bottom - window.innerHeight + 16);
    });
    const caja = (await botonGenerar(page).boundingBox())!;
    expect(caja.y + caja.height).toBeLessThanOrEqual(800); // precondición: el botón se ve entero
    await page.touchscreen.tap(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);

    const tarjetaVisible = await page.evaluate(() => {
      const r = document.querySelector('[class*="resultCard"]')!.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    });
    expect(tarjetaVisible).toBe(true); // HOY false
  });

  test.fail('hallazgo 8 · en la primera visita el aviso de transparencia no tapa el botón Generar', async ({ page }) => {
    // Componente COMPARTIDO (components/TransparencyBanner.tsx, en app/layout.tsx), no código
    // de la app. DEBERÍA: el botón principal recibe el toque cuando se ve al pie de la pantalla.
    // HOY: el aviso, fijo abajo con z-index 1000, ocupa el 24 % de la vista a 360×800
    // (591-784 px) y justo ahí queda el botón al bajar hasta él: el toque se lo lleva el aviso.
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
    expect(recibeElBoton).toBe(true); // HOY false: lo recibe el aviso
  });
});

test.describe('25/09 · escritorio — persistencia entre pestañas, copiar y contenido', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test.fail('hallazgo 2 · con dos pestañas abiertas, guardar en una no borra lo guardado en la otra', async ({ page }) => {
    // DEBERÍA: el almacén acaba con las DOS combinaciones (X de la pestaña nueva, Y de la vieja).
    // HOY: la pestaña vieja cargó la lista antes de que X existiera y no escucha el evento
    // `storage`; al guardar Y reescribe la clave entera con [Y] y X se pierde para siempre.
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
    expect(guardadas).toContain(x.join('-')); // HOY falla: X ha desaparecido
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

  test.fail('hallazgo 5 · el botón Copiar confirma que ha copiado', async ({ page }) => {
    // DEBERÍA: un «Copiada» visible y anunciado (aria-live). HOY: la combinación llega al
    // portapapeles pero la pantalla no cambia nada: el botón parece no responder. Además la
    // promesa de clipboard.writeText no se captura: si falla, falla en silencio.
    await esperarInteractiva(page);
    await ponerCantidad(page, 1);
    await botonGenerar(page).click();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Copiar combinación' }).click();
    await expect(page.locator('main').getByText(/copiad[ao]/i)).toBeVisible({ timeout: 2_000 });
  });

  test.fail('hallazgo 1 · los días de sorteo de La Primitiva y Bonoloto son los vigentes', async ({ page }) => {
    // Fuente: Loterías y Apuestas del Estado. La Primitiva: «Semanalmente se celebran sorteos
    // los lunes, jueves y sábados». Bonoloto: sorteo de lunes a domingo (el domingo se añadió
    // el 25/09/2022). HOY la app dice «Jueves y Sábados» y «Lunes a Sábado» en el panel, en
    // las fichas, en la tabla, en los textos de cada modalidad y en el FAQPage.
    await esperarInteractiva(page);
    await seleccionarLoteria(page, 'primitiva');
    await expect(page.locator('[class*="lotteryInfo"]')).toContainText(/lunes, jueves y s[áa]bados/i);
    await seleccionarLoteria(page, 'bonoloto');
    await expect(page.locator('[class*="lotteryInfo"]')).toContainText(/lunes a domingo/i);

    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const texto = JSON.stringify(faq);
    expect(texto).not.toContain('de lunes a sábado');
    expect(texto).not.toContain('se sortea jueves y sábados');
  });

  test.fail('hallazgo 6 · la metadata no promete estadísticas que la página no tiene', async ({ page }) => {
    // DEBERÍA: o la página ofrece estadísticas de los números, o la descripción y las
    // `features` del JSON-LD dejan de prometerlas. HOY: description «…historial y
    // estadísticas» y feature «Estadísticas básicas de los números generados»; tras generar
    // 10 combinaciones no aparece ninguna estadística ni frecuencia en la herramienta.
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

  test.fail('hallazgo 7 · el bloque educativo no tiene la errata «Jugas» ni atribuye estas loterías a la ONCE', async ({ page }) => {
    // DEBERÍA: «Jugáis en grupo y necesitáis…» (la frase sigue en vosotros) y «Las principales
    // loterías de Loterías y Apuestas del Estado»: ninguna de las cuatro de la tabla es de la
    // ONCE. HOY: «Jugas en grupo» y «Las principales loterías de la ONCE y LAE».
    // El bloque educativo nace colapsado pero su texto está en el DOM
    await expect(page.getByText(/Jugas en grupo/)).toHaveCount(0);
    await expect(page.getByText(/loterías de la ONCE y LAE/)).toHaveCount(0);
  });
});
