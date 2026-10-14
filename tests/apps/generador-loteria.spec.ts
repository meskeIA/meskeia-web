import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

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

/**
 * Comprueba que el centro de `boton` lo recibe el propio botón y no algo pintado encima (la
 * píldora fija del Footer, la barra del logo). Es la prueba de lo que ve y toca el usuario.
 */
async function recibeElClic(boton: Locator): Promise<boolean> {
  return boton.evaluate((b) => {
    const r = b.getBoundingClientRect();
    const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!encima && b.contains(encima);
  });
}

test.describe('03/10 · escritorio — la tarjeta recién generada y la píldora fija del Footer', () => {
  // REPARADO, hallazgo 2732 (inspector 03/10/2026). Por encima de 768 px el Footer compartido
  // es una píldora FIJA abajo a la derecha (components/Footer.module.css: bottom 10 px, right
  // 20 px, z-index 1000, 45 px de alto). Generar lleva la tarjeta nueva a la vista con
  // `block: 'nearest'` (hallazgo 1632), que la dejaba con el borde inferior pegado al pie:
  // Copiar y Guardar, debajo de la píldora. ANTES, a 1280×800 la estrella en (1062, 746) y la
  // píldora en 990-1260 × 745-790: el clic caía en «¿Te resultó útil?»; a 1024×768, en
  // «Compartir». AHORA la tarjeta lleva `scroll-margin-bottom: 80px` (y `scroll-margin-top`
  // para la barra del logo) y queda por encima de la píldora. El Footer no se toca: es compartido.
  const VISTAS: Array<{ width: number; height: number }> = [
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 1366, height: 768 },
    { width: 800, height: 900 },
  ];

  for (const vista of VISTAS) {
    test(`${vista.width}×${vista.height} · tras Generar, la estrella y Copiar de la tarjeta nueva reciben el clic`, async ({ page }) => {
      await page.setViewportSize(vista);
      await esperarInteractiva(page);
      if (vista.width === 1280) {
        // El caso de la ficha: vista bajada 300 px, botón Generar en 601-659
        await page.evaluate(() => window.scrollTo(0, 300));
      } else {
        // El botón a la vista pero cerca del pie: la tarjeta nace por debajo de la pantalla
        await botonAlPie(page, '[class*="generateButton"]', 60);
      }
      const caja = (await botonGenerar(page).boundingBox())!;
      expect(caja.y >= 0 && caja.y + caja.height <= vista.height).toBe(true); // precondición
      await botonGenerar(page).click();
      await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
      await expect.poll(() => page.evaluate(() => {
        const r = document.querySelector('[class*="resultCard"]')!.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight + 1;
      }), { timeout: 3_000 }).toBe(true);
      await esperarDesplazamientoQuieto(page);

      // Precondición: la píldora sigue fija en este ancho (si no, el caso no probaría nada)
      const estado = await page.evaluate(() => {
        const pie = [...document.querySelectorAll('footer, [class*="footer"]')]
          .find((f) => getComputedStyle(f).position === 'fixed');
        return { pildoraFija: !!pie };
      });
      expect(estado.pildoraFija).toBe(true);

      const tarjeta = page.locator('[class*="resultCard"]').first();
      const estrella = tarjeta.getByRole('button', { name: /Guardar esta combinación/ });
      expect(await recibeElClic(estrella)).toBe(true); // ANTES: lo recibía la píldora del Footer
      expect(await recibeElClic(tarjeta.getByRole('button', { name: 'Copiar combinación' }))).toBe(true);
      const e = (await estrella.boundingBox())!;
      await page.mouse.click(e.x + e.width / 2, e.y + e.height / 2);
      await expect.poll(async () => (await leerFavoritas(page)).length).toBe(1);
    });
  }
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

});

// REPARADO, hallazgo 2733 (inspector 03/10/2026). El resultado del comprobador y su aviso se
// pintan DEBAJO del botón y la vista no se movía: con el botón al pie, ANTES, a 360×800 el
// resumen empezaba en 808 px y el aviso de «clave 10» quedaba en 800-847; a 390×844, resumen en
// 852 y aviso en 844-891. AHORA «Comprobar» lleva a la vista el resumen o el aviso
// (`scrollIntoView` 'nearest', con los mismos `scroll-margin` que la tarjeta del generador).
for (const vista of [{ width: 360, height: 800 }, { width: 390, height: 844 }]) {
  test.describe(`03/10 · móvil ${vista.width}×${vista.height} — el comprobador lleva a la vista lo que sale`, () => {
    test.use({
      viewport: vista,
      userAgent: UA_ANDROID,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    /** Rectángulo del primer elemento que casa con `selector`, en coordenadas de la vista. */
    const caja = (page: Page, selector: string) => page.evaluate((sel) => {
      const r = document.querySelector(sel)!.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, alto: window.innerHeight };
    }, selector);

    test('Comprobar con el botón al pie: el resumen del resultado se ve entero', async ({ page }) => {
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GORDO_0310) });
      await teclearGordo(page, ['4', '18', '27', '39', '52'], '6');
      await botonAlPie(page, '[class*="comprobadorBoton"]', 8);
      const zona = zonaComprobador(page);
      const boton = (await zona.getByRole('button', { name: /Comprobar mis combinaciones/ }).boundingBox())!;
      expect(boton.y + boton.height).toBeLessThanOrEqual(vista.height); // precondición: botón a la vista
      await page.touchscreen.tap(boton.x + boton.width / 2, boton.y + boton.height / 2);
      await expect(zona.locator('[class*="comprobadorResumen"]')).toHaveText(
        '8 de tus 10 combinaciones de El Gordo de la Primitiva tienen premio de categoría; 5 aciertan el reintegro.');
      await expect.poll(async () => {
        const r = await caja(page, '[class*="comprobadorResumen"]');
        return r.top >= 0 && r.bottom <= r.alto;
      }, { timeout: 3_000 }).toBe(true);
      await esperarDesplazamientoQuieto(page);
      // Entero y por debajo de la barra fija del logo
      const r = await caja(page, '[class*="comprobadorResumen"]');
      const barra = await page.evaluate(() =>
        document.querySelector('[class*="headerBar"]')!.getBoundingClientRect().bottom);
      expect(r.top).toBeGreaterThanOrEqual(barra);
      expect(r.bottom).toBeLessThanOrEqual(r.alto);
    });

    test('un sorteo imposible con el botón al pie: el aviso se ve entero', async ({ page }) => {
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(GORDO_0310) });
      await teclearGordo(page, ['4', '18', '27', '39', '52'], '10');
      await botonAlPie(page, '[class*="comprobadorBoton"]', 8);
      const zona = zonaComprobador(page);
      const boton = (await zona.getByRole('button', { name: /Comprobar mis combinaciones/ }).boundingBox())!;
      expect(boton.y + boton.height).toBeLessThanOrEqual(vista.height);
      await page.touchscreen.tap(boton.x + boton.width / 2, boton.y + boton.height / 2);
      await expect(zona.getByRole('alert')).toHaveText('Clave: 10 está fuera de rango, va del 0 al 9.');
      await expect.poll(async () => {
        const r = await caja(page, '[class*="comprobadorError"]');
        return r.top >= 0 && r.bottom <= r.alto;
      }, { timeout: 3_000 }).toBe(true);
      await esperarDesplazamientoQuieto(page);
      const r = await caja(page, '[class*="comprobadorError"]');
      expect(r.bottom).toBeLessThanOrEqual(r.alto);
      // Y el botón sigue a la vista: se corrige la clave y se vuelve a pulsar sin buscarlo
      const b = (await zona.getByRole('button', { name: /Comprobar mis combinaciones/ }).boundingBox())!;
      expect(b.y).toBeGreaterThanOrEqual(0);
    });
  });
}

test.describe('03/10 · contenido y accesibilidad', () => {
  test('hallazgo 2734 · la información fiscal sigue la disposición adicional 33.ª de la LIRPF', async ({ page }) => {
    // REPARADO, hallazgo 2734 (inspector 03/10/2026). Fuente: Ley 35/2006, DA 33.ª (texto
    // consolidado del BOE, BOE-A-2006-20764, leído el 03/10/2026). Ap. 2: exentos hasta 40.000 €
    // (redacción del art. 67.1 de la Ley 6/2018); ap. 4: 20 % sobre el exceso; ap. 6: retención
    // del 20 %; ap. 7: «no existirá obligación de presentar la citada autoliquidación cuando …
    // se hubiera practicado retención»; ap. 8: el premio no se integra en la base del IRPF.
    // ANTES: «No declarar premios a Hacienda (obligatorio si superan 40.000 €)… infracción
    // tributaria grave», y «Referencia legal: artículo 13 de la Ley 16/2012» (que modifica el
    // ITP-AJD; el gravamen lo reescribió su artículo 2).
    const educativo = page.locator('[class*="guideSection"]');
    await expect(educativo).toHaveCount(6);
    await expect(educativo.getByText(/obligatorio si superan 40\.000/)).toHaveCount(0);
    await expect(educativo.getByText(/infracción tributaria grave/)).toHaveCount(0);
    await expect(educativo.getByText(/artículo 13 de la Ley 16\/2012/)).toHaveCount(0);
    const texto = (await educativo.allTextContents()).join(' ').replace(/\s+/g, ' ');
    expect(texto).toContain('disposición adicional 33.ª de la Ley 35/2006');
    expect(texto).toContain('no hay que presentar autoliquidación');
    expect(texto).toContain('tampoco se suma a la base del IRPF');
    // La cuenta del ejemplo: (1.000.000 − 40.000) × 20 % = 192.000; se cobran 808.000
    // Desde S0180 las cifras salen de data/fiscal/premios-loterias.ts con espacio duro ante el €
    expect(texto).toMatch(/192\.000[ \u00A0]€ de impuesto/);
    expect(texto).toMatch(/de 1\.000\.000[ \u00A0]€ se cobran 808\.000[ \u00A0]€/);
  });

  test('hallazgo 2735 · Loterías y Apuestas del Estado figura como operador, no como regulador', async ({ page }) => {
    // REPARADO, hallazgo 2735 (inspector 03/10/2026). Ley 13/2011, de regulación del juego,
    // DA 1.ª, apartado Uno (BOE-A-2011-9280): SELAE y la ONCE «son los operadores designados
    // para la comercialización de los juegos de loterías». Las competencias de la Comisión
    // Nacional del Juego las ejerce la Dirección General de Ordenación del Juego (DT 1.ª de esa
    // ley). ANTES la FAQ decía «supervisados por el organismo regulador español (Loterías y
    // Apuestas del Estado)».
    const faq = page.locator('[class*="faqList"]');
    await expect(faq).toHaveCount(1);
    await expect(faq.getByText(/organismo regulador español \(Loterías y Apuestas del Estado\)/)).toHaveCount(0);
    const texto = (await faq.allTextContents()).join(' ').replace(/\s+/g, ' ');
    expect(texto).toContain('operador designado por la Ley 13/2011');
    expect(texto).toContain('el regulador del juego en España es la Dirección General de Ordenación del Juego');
  });

  test('hallazgo 2736 · porcentajes con espacio duro y días de la semana en minúscula', async ({ page }) => {
    // REPARADO, hallazgo 2736 (inspector 03/10/2026). «15 %» con espacio duro U+00A0 (CLAUDE.md
    // global §2, 25/09/2026) y los días de la semana en minúscula, como La Primitiva («Lunes,
    // jueves y sábados»). ANTES: «50%» y «20%» (tres veces) en el bloque educativo, y «Martes y
    // Viernes» en el panel de Euromillones, en su ficha y en la tabla comparativa.
    const educativo = (await page.locator('[class*="guideSection"]').allTextContents()).join(' ');
    expect(educativo.match(/\d+%/g) ?? []).toEqual([]);
    expect(educativo.match(/\d+ %/g) ?? []).toEqual([]); // espacio normal: el % saltaría solo de línea
    expect((educativo.match(/\d+ %/g) ?? []).length).toBeGreaterThanOrEqual(4);
    await expect(page.locator('[class*="modalidadesSection"]')).not.toContainText('Martes y Viernes');
    await expect(page.locator('[class*="comparativaTable"]')).not.toContainText('Martes y Viernes');
    await expect(page.locator('#generador-euromillones')).toContainText('Martes y viernes');
    await expect(page.locator('[class*="comparativaTable"]')).toContainText('Martes y viernes');
    await seleccionarLoteria(page, 'euromillones');
    await expect(page.locator('[class*="lotteryInfo"]')).toContainText('Martes y viernes');
  });

  // REPARADO, hallazgo 2737 (inspector 03/10/2026). WCAG 1.4.11 (contraste de lo que no es
  // texto): el borde de un campo es lo que lo identifica, y las casillas de los números no
  // llevan etiqueta visible propia. ANTES: borde 2 px var(--border) sobre var(--bg-card), con
  // la sección del mismo fondo: 1,26:1 en claro (#E5E5E5/#FFFFFF) y 1,38:1 en oscuro
  // (#404040/#2A2A2A). AHORA var(--borde-campo): #858585 en claro y #808080 en oscuro. Se mide
  // contra el fondo de DENTRO de la casilla y contra el de FUERA (la sección que la contiene),
  // subiendo hasta el primer fondo opaco, en los dos temas, con el tema aplicado de verdad.
  for (const tema of ['light', 'dark'] as const) {
    test(`hallazgo 2737 · las casillas del comprobador se distinguen del fondo (3:1), tema ${tema}`, async ({ page }) => {
      await sembrarYRecargar(page, {
        [CLAVE_FAVORITAS]: JSON.stringify(GORDO_0310.slice(0, 1)),
        'meskeia-theme': tema,
      });
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
      const medida = await zonaComprobador(page).getByLabel('Número 1 de la combinación ganadora').evaluate((el) => {
        const rgba = (c: string) => (c.match(/\d+(\.\d+)?/g) ?? []).map(Number);
        const lum = (c: string) => {
          const [r, g, b] = rgba(c).slice(0, 3).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const ratio = (a: string, b: string) => {
          const la = lum(a);
          const lb = lum(b);
          return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
        };
        /** Primer fondo opaco subiendo desde `n` (una capa translúcida no cuenta como fondo). */
        const fondoOpaco = (n: Element | null): string => {
          for (let e = n; e; e = e.parentElement) {
            const c = getComputedStyle(e).backgroundColor;
            const a = rgba(c)[3];
            if (c !== 'transparent' && (a === undefined || a === 1)) return c;
          }
          return 'rgb(255, 255, 255)';
        };
        const borde = getComputedStyle(el).borderTopColor;
        const alfaBorde = rgba(borde)[3];
        return {
          borde,
          bordeOpaco: alfaBorde === undefined || alfaBorde === 1,
          dentro: ratio(borde, fondoOpaco(el)),
          fuera: ratio(borde, fondoOpaco(el.parentElement)),
        };
      });
      expect(medida.bordeOpaco).toBe(true);
      expect(medida.dentro).toBeGreaterThanOrEqual(3);
      expect(medida.fuera).toBeGreaterThanOrEqual(3);
    });
  }
});

/**
 * S0180 (05/10/2026) · reparto del premio de una peña. Las cuentas están resueltas a mano en
 * tests/reparto-pena-motor.spec.ts; aquí se comprueba que la pantalla dice lo mismo.
 * La peña de partida trae tres personas que ponen 10, 5 y 5 € (cuotas 50 / 25 / 25 %).
 */
test.describe('S0180 · reparto del premio de una peña', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="pena-titulo"]');
  const campoPremio = (page: Page, n = 0) => seccion(page).getByLabel(/Premio del décimo o apuesta/).nth(n);

  async function escribir(page: Page, campo: Locator, valor: string) {
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
  }

  test('un décimo de 125.000 € entre 10, 5 y 5 €: 17.000 € de retención, 54.000 / 27.000 / 27.000 € netos', async ({ page }) => {
    // Exento 40.000 · base 85.000 · retención 17.000 · neto 108.000
    await escribir(page, campoPremio(page), '125.000');
    const totales = seccion(page).locator('[class*="penaTotales"]');
    await expect(totales).toContainText('Retención del 20\u00A0%');
    await expect(totales).toContainText('17.000,00\u00A0€');
    await expect(totales).toContainText('108.000,00\u00A0€');
    const filas = seccion(page).locator('tbody tr');
    await expect(filas).toHaveCount(3);
    await expect(filas.nth(0)).toContainText('Persona 1');
    await expect(filas.nth(0).locator('td').nth(1)).toHaveText('54.000,00\u00A0€');
    await expect(filas.nth(1).locator('td').nth(1)).toHaveText('27.000,00\u00A0€');
    await expect(filas.nth(2).locator('td').nth(1)).toHaveText('27.000,00\u00A0€');
  });

  test('dos décimos premiados: la exención se aplica a cada uno (retención 19.000 €, no 27.000 €)', async ({ page }) => {
    await escribir(page, campoPremio(page, 0), '125.000');
    await seccion(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
    await escribir(page, campoPremio(page, 1), '50.000');
    const totales = seccion(page).locator('[class*="penaTotales"]');
    await expect(totales).toContainText('19.000,00\u00A0€');
    await expect(totales).toContainText('156.000,00\u00A0€');
  });

  test('el nombre escrito sale en la tabla y quitar a alguien rehace el reparto', async ({ page }) => {
    await escribir(page, seccion(page).getByLabel('Nombre').first(), 'Ana');
    await escribir(page, campoPremio(page), '400.000');
    await expect(seccion(page).locator('tbody tr').first()).toContainText('Ana');
    await seccion(page).getByRole('button', { name: 'Quitar a Persona 3 de la peña' }).click();
    // Ahora 10 y 5 €: neto 328.000 → 218.666,67 + 109.333,33
    const filas = seccion(page).locator('tbody tr');
    await expect(filas).toHaveCount(2);
    await expect(filas.nth(0).locator('td').nth(1)).toHaveText('218.666,67\u00A0€');
    await expect(filas.nth(1).locator('td').nth(1)).toHaveText('109.333,33\u00A0€');
  });

  test('una persona sin aportación avisa en vez de repartir', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /Añadir persona/ }).click();
    await escribir(page, campoPremio(page), '125.000');
    await expect(seccion(page).locator('[class*="comprobadorError"]')).toContainText('Revisa las aportaciones');
    await expect(seccion(page).locator('tbody tr')).toHaveCount(0);
  });

  test('sin premio escrito no hay reparto ni error', async ({ page }) => {
    await expect(seccion(page).locator('[class*="comprobadorError"]')).toHaveCount(0);
    await expect(seccion(page).locator('[class*="penaTotales"]')).toHaveCount(0);
  });

  test('aviso crítico no plegable y referencia a la DA 33.ª', async ({ page }) => {
    await expect(page.getByRole('note', { name: 'Aviso importante' }).filter({ hasText: 'carácter exclusivamente orientativo' })).toBeVisible();
    const ref = page.getByRole('note', { name: 'Datos de referencia normativos' });
    await expect(ref).toContainText('disposición adicional 33.ª');
    await expect(ref).toContainText('05/10/2026');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 06/10/2026 — re-inspección (segmento fiscal, riesgo 1) tras el reparto de la peña
 * (S0180, e885f6e5) y la reparación de los hallazgos 2732-2737 (1b6dd902).
 *
 * NORMA, leída en el BOE el 06/10/2026 (BOE-A-2006-20764, DA 33.ª, redacción vigente desde el
 * 05/07/2018) y coincidente con data/fiscal/premios-loterias.ts:
 *   · ap. 1 — el gravamen se exige «de forma independiente respecto de cada décimo, fracción o
 *     cupón de lotería o apuesta premiados».
 *   · ap. 2 — exentos los premios de importe íntegro «igual o inferior a 40.000 euros»; por
 *     encima, tributa la parte que exceda. Si el décimo o la apuesta cuesta menos de 0,50 €, la
 *     cuantía exenta «se reducirá de forma proporcional». En titularidad compartida, la exención
 *     «se prorrateará entre los cotitulares en función de la cuota que les corresponda».
 *   · ap. 3 y 4 — base = exceso, prorrateada igual; tipo del 20 por ciento. Ap. 6: retención 20 %.
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (el reparto va en céntimos por el método
 * del mayor resto, como declara reparto.ts: el céntimo sobrante va al mayor decimal):
 *   1. Normal — Ana 7 €, Bea 5 €, Carlos 3 € (cuotas 7/15, 5/15, 3/15) y un décimo de 125.000 €.
 *      Exento 40.000 · base 85.000 · retención 17.000 · se cobra 108.000.
 *      Bruto: 12.500.000 c × 7/15 = 5.833.333,33 → 5.833.333; × 5/15 = 4.166.666,67 → 4.166.666;
 *      × 3/15 = 2.500.000. Sobra 1 c → Bea (resto ,67): 58.333,33 / 41.666,67 / 25.000,00 €.
 *      Retención: 1.700.000 c → 793.333 / 566.666 (+1 → 566.667) / 340.000: 7933,33 / 5666,67 /
 *      3400,00 €. Le llega: 50.400,00 / 36.000,00 / 21.600,00 € (= 108.000 × 7/15, 5/15, 3/15).
 *      Parte: 46,67 / 33,33 / 20,00 %.
 *   1b. Lo mismo con un segundo décimo de 50.000 € (exento 40.000, retención 2.000): totales
 *      175.000 / 80.000 / 19.000 / 156.000. Bruto 81.666,67 / 58.333,33 / 35.000,00 (el céntimo,
 *      a Ana: resto ,67); retención 8866,67 / 6333,33 / 3800,00; le llega 72.800 / 52.000 / 31.200.
 *   2. Límites — (a) 40.000 € justos con la peña de partida 10/5/5: exento entero, retención
 *      0,00 €, 20.000 / 10.000 / 10.000 €. (b) Precio 0,25 €: exención 40.000 × 0,25 / 0,50 =
 *      20.000 €; premio 30.000 → retención 2000,00, se cobran 28.000 (14.000 / 7000 / 7000).
 *      (c) Precio 0,50 € («al menos 0,50»): exención entera, retención 0,00 €. (d) Una sola
 *      persona: parte 100,00 %, le llegan 108.000,00 € de 125.000.
 *   3. Rechazo — premio «-5.000», «12abc» o «0»; aportaciones 0/0/0; precio «0»: aviso y sin tabla.
 * Los once casos dieron en el navegador exactamente lo calculado, en escritorio y a 390×844.
 *
 * FIRMA DE ROTURA (cortas 62,1 % → 73,6 % en 14 días, z 4): NO la explica un fallo. Recargas
 * 2,5 %, por debajo del catálogo (3,1 %). Medido sobre el dump del 06/10: seis dispositivos con
 * 15 visitas o más suman 158 de las 405 recientes (85 % cortas); el primero, un Android 384×832,
 * 50 visitas en 10 días, todas cortas y 45 sin duración, cada una en una sesión nueva y a
 * cualquier hora, sin visitar ninguna otra app. Sin esos seis, 60,8 % → 66,4 % (z ≈ 1,6). En
 * móvil (390×844, isMobile + hasTouch) generar, guardar, copiar, comprobar y repartir funcionan
 * con toques, sin recarga ni desbordamiento horizontal ni nada tapado.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('06/10 · reparto de la peña — casos resueltos a mano', () => {
  const pena = (page: Page) => page.locator('section[aria-labelledby="pena-titulo"]');
  const campoPremio = (page: Page, n = 0) => pena(page).getByLabel(/Premio del décimo o apuesta/).nth(n);
  const campoPone = (page: Page, n: number) => pena(page).getByLabel('Pone (€)').nth(n);
  const campoNombre = (page: Page, n: number) => pena(page).getByLabel('Nombre').nth(n);
  const campoPrecio = (page: Page) => pena(page).getByLabel('Precio de cada décimo o apuesta (€)');
  const totales = (page: Page) => pena(page).locator('[class*="penaTotales"]');
  const filas = (page: Page) => pena(page).locator('tbody tr');
  const aviso = (page: Page) => pena(page).locator('[class*="comprobadorError"]');
  const eur = (s: string) => `${s} €`;
  const pct = (s: string) => `${s} %`;

  async function escribir(page: Page, campo: Locator, valor: string) {
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
  }

  /** Celdas de una fila: Pone, Le llega, Parte, Premio, Retención (la persona va en el <th>). */
  async function celdas(page: Page, fila: number) {
    return filas(page).nth(fila).locator('td').allTextContents();
  }

  test.beforeEach(async ({ page }) => {
    await esperarHidratacion(page, ['section[aria-labelledby="pena-titulo"] input']);
  });

  test('caso 1 · 7/5/3 € y un décimo de 125.000 €: céntimos por mayor resto y 50.400 / 36.000 / 21.600 €', async ({ page }) => {
    await escribir(page, campoNombre(page, 0), 'Ana');
    await escribir(page, campoNombre(page, 1), 'Bea');
    await escribir(page, campoNombre(page, 2), 'Carlos');
    await escribir(page, campoPone(page, 0), '7');
    await escribir(page, campoPone(page, 2), '3'); // la 2.ª ya pone 5
    await escribir(page, campoPremio(page), '125.000');
    await expect(totales(page)).toContainText(eur('125.000,00'));
    await expect(totales(page)).toContainText(eur('40.000,00'));
    await expect(totales(page)).toContainText(eur('17.000,00'));
    await expect(totales(page)).toContainText(eur('108.000,00'));
    await expect(filas(page)).toHaveCount(3);
    await expect(filas(page).nth(0).locator('th')).toHaveText('Ana');
    expect(await celdas(page, 0)).toEqual([eur('7,00'), eur('50.400,00'), pct('46,67'), eur('58.333,33'), eur('7933,33')]);
    expect(await celdas(page, 1)).toEqual([eur('5,00'), eur('36.000,00'), pct('33,33'), eur('41.666,67'), eur('5666,67')]);
    expect(await celdas(page, 2)).toEqual([eur('3,00'), eur('21.600,00'), pct('20,00'), eur('25.000,00'), eur('3400,00')]);
  });

  test('caso 1b · 7/5/3 € con décimos de 125.000 y 50.000 €: exención por décimo y 72.800 / 52.000 / 31.200 €', async ({ page }) => {
    await escribir(page, campoPone(page, 0), '7');
    await escribir(page, campoPone(page, 2), '3');
    await escribir(page, campoPremio(page, 0), '125.000');
    await pena(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
    await escribir(page, campoPremio(page, 1), '50.000');
    await expect(totales(page)).toContainText(eur('175.000,00'));
    await expect(totales(page)).toContainText(eur('80.000,00'));
    await expect(totales(page)).toContainText(eur('19.000,00'));
    await expect(totales(page)).toContainText(eur('156.000,00'));
    expect(await celdas(page, 0)).toEqual([eur('7,00'), eur('72.800,00'), pct('46,67'), eur('81.666,67'), eur('8866,67')]);
    expect(await celdas(page, 1)).toEqual([eur('5,00'), eur('52.000,00'), pct('33,33'), eur('58.333,33'), eur('6333,33')]);
    expect(await celdas(page, 2)).toEqual([eur('3,00'), eur('31.200,00'), pct('20,00'), eur('35.000,00'), eur('3800,00')]);
  });

  test('caso 2a · 40.000 € justos: «igual o inferior» → exento entero y retención 0,00 €', async ({ page }) => {
    await escribir(page, campoPremio(page), '40.000');
    await expect(totales(page)).toContainText(`Retención del ${pct('20')}${eur('0,00')}`);
    await expect(totales(page)).toContainText(`Exento${eur('40.000,00')}`);
    await expect(totales(page)).toContainText(`Lo que se cobra${eur('40.000,00')}`);
    expect(await celdas(page, 0)).toEqual([eur('10,00'), eur('20.000,00'), pct('50,00'), eur('20.000,00'), eur('0,00')]);
    expect(await celdas(page, 1)).toEqual([eur('5,00'), eur('10.000,00'), pct('25,00'), eur('10.000,00'), eur('0,00')]);
  });

  test('caso 2b · precio de 0,25 €: exención reducida a 20.000 € y retención 2000,00 € de 30.000', async ({ page }) => {
    await escribir(page, campoPrecio(page), '0,25');
    await expect(pena(page).locator('#pena-precio-ayuda')).toContainText('cada décimo o apuesta tiene 20.000,00 € exentos');
    await escribir(page, campoPremio(page), '30.000');
    await expect(totales(page)).toContainText(`Exento${eur('20.000,00')}`);
    await expect(totales(page)).toContainText(`Retención del ${pct('20')}${eur('2000,00')}`);
    await expect(totales(page)).toContainText(`Lo que se cobra${eur('28.000,00')}`);
    expect(await celdas(page, 0)).toEqual([eur('10,00'), eur('14.000,00'), pct('50,00'), eur('15.000,00'), eur('1000,00')]);
    expect(await celdas(page, 2)).toEqual([eur('5,00'), eur('7000,00'), pct('25,00'), eur('7500,00'), eur('500,00')]);
  });

  test('caso 2c · precio de 0,50 € («al menos 0,50»): exención entera, sin retención de 30.000', async ({ page }) => {
    await escribir(page, campoPrecio(page), '0,50');
    await expect(pena(page).locator('#pena-precio-ayuda')).not.toContainText('Con este precio');
    await escribir(page, campoPremio(page), '30.000');
    await expect(totales(page)).toContainText(`Exento${eur('30.000,00')}`);
    await expect(totales(page)).toContainText(`Retención del ${pct('20')}${eur('0,00')}`);
  });

  test('caso 2d · una sola persona: parte del 100,00 % y le llegan 108.000,00 € de 125.000', async ({ page }) => {
    await pena(page).getByRole('button', { name: 'Quitar a Persona 3 de la peña' }).click();
    await pena(page).getByRole('button', { name: 'Quitar a Persona 2 de la peña' }).click();
    await expect(pena(page).getByRole('button', { name: 'Quitar a Persona 1 de la peña' })).toBeDisabled();
    await escribir(page, campoPremio(page), '125.000');
    await expect(filas(page)).toHaveCount(1);
    expect(await celdas(page, 0)).toEqual([eur('10,00'), eur('108.000,00'), pct('100,00'), eur('125.000,00'), eur('17.000,00')]);
  });

  const RECHAZOS: Array<{ titulo: string; precio?: string; pones?: string[]; premio: string; aviso: string }> = [
    { titulo: 'premio negativo «-5.000»', premio: '-5.000', aviso: 'Indica el premio de cada décimo o apuesta premiados, mayor que 0 €.' },
    { titulo: 'premio ilegible «12abc»', premio: '12abc', aviso: 'Indica el premio de cada décimo o apuesta premiados, mayor que 0 €.' },
    { titulo: 'premio «0»', premio: '0', aviso: 'Indica el premio de cada décimo o apuesta premiados, mayor que 0 €.' },
    { titulo: 'aportaciones 0/0/0', pones: ['0', '0', '0'], premio: '125.000', aviso: 'Indica lo que puso cada persona: ahora la peña suma 0 €.' },
    { titulo: 'aportación negativa «-5»', pones: ['10', '5', '-5'], premio: '125.000', aviso: 'Revisa las aportaciones' },
    { titulo: 'precio «0»', precio: '0', premio: '125.000', aviso: 'Indica lo que costó cada décimo o apuesta, mayor que 0 €.' },
  ];
  for (const r of RECHAZOS) {
    test(`caso 3 · se rechaza: ${r.titulo}`, async ({ page }) => {
      if (r.precio !== undefined) await escribir(page, campoPrecio(page), r.precio);
      if (r.pones) {
        const iniciales = ['10', '5', '5'];
        for (let i = 0; i < r.pones.length; i++) {
          if (r.pones[i] !== iniciales[i]) await escribir(page, campoPone(page, i), r.pones[i]);
        }
      }
      await escribir(page, campoPremio(page), r.premio);
      await expect(aviso(page)).toContainText(r.aviso);
      await expect(filas(page)).toHaveCount(0);
      await expect(totales(page)).toHaveCount(0);
    });
  }

  test('el aviso de error del reparto dice QUÉ campo falla (WCAG 3.3.1)', async ({ page }) => {
    // REPARADO el 06/10/2026 (hallazgo 2898): el aviso nombra a la persona o el décimo y el campo
    // lleva aria-invalid y aria-describedby hacia el aviso. Era así (inspector 06/10/2026, accesibilidad). WCAG 3.3.1 (A): si se detecta un error de
    // entrada, «el elemento erróneo se identifica». Con una cuarta persona sin aportación, el
    // aviso es «Revisa las aportaciones: tienen que ser cantidades de 0 € o más.»: no nombra a
    // Persona 4, ningún campo lleva aria-invalid y la tabla entera desaparece. En una peña de
    // 20 o 30 personas hay que revisar todas. Lo mismo con un 2.º décimo negativo: «Indica el
    // premio de cada décimo…» sin decir cuál. El comprobador de la misma página sí lo hace
    // («Falta el número 3 de la combinación ganadora…»).
    await pena(page).getByRole('button', { name: /Añadir persona/ }).click();
    await escribir(page, campoPremio(page), '125.000');
    await expect(aviso(page)).toBeVisible();
    await expect(aviso(page)).toContainText('Revisa lo que pone Persona 4.');
    const marcados = pena(page).locator('input[aria-invalid="true"]');
    await expect(marcados).toHaveCount(1);
    await expect(marcados).toHaveAttribute('aria-describedby', 'pena-error');
    await expect(campoPone(page, 3)).toHaveAttribute('aria-invalid', 'true');

    // Con la aportación arreglada y un 2.º décimo negativo, el aviso dice cuál
    await escribir(page, campoPone(page, 3), '5');
    await pena(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
    await escribir(page, pena(page).getByLabel('Premio del décimo o apuesta 2 (€)'), '-50');
    await expect(aviso(page)).toContainText('Revisa el premio del décimo o apuesta 2.');
    await expect(marcados).toHaveCount(1);
    await expect(pena(page).getByLabel('Premio del décimo o apuesta 2 (€)')).toHaveAttribute('aria-invalid', 'true');
  });
});

test.describe('06/10 · móvil 390×844 — la firma de rotura: el flujo entero con toques', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: UA_ANDROID,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('generar tres veces, guardar y repartir: sin recarga, sin desbordar y con «Le llega» a la vista', async ({ page }) => {
    // C0172 (diagnosticado el 12/10/2026): el fallo intermitente «navegaciones = 1» era del TEST,
    // no de la app. Contaba `framenavigated`, que Playwright emite también en una navegación DENTRO
    // del mismo documento, y el router de Next hace una al hidratar: history.replaceState con las
    // claves __NA y __PRIVATE_NEXTJS_INTERNALS_TREE, sobre la misma URL, desde la fase de commit
    // de React. Si la hidratación terminaba después de poner la escucha (bajo next dev, 1 de cada
    // 2), contaba 1 sin que ningún toque hiciera nada. Medido: con la CPU a ×1, ×4 y ×8, ese
    // replaceState cae tras resolver `goto` en 9 de 9 cargas sin tocar nada, y en el flujo entero
    // (5 vueltas) no hay ninguna otra navegación y la marca puesta en `window` sobrevive.
    // Ahora se cuenta lo que SÍ es recargar o navegar: un documento nuevo (`domcontentloaded`),
    // una marca en `window` que un documento nuevo no conservaría, y la ruta (un #ancla la cambia).
    let documentosNuevos = 0;
    page.on('domcontentloaded', () => { documentosNuevos++; });
    await esperarInteractiva(page);
    await esperarHidratacion(page, ['section[aria-labelledby="pena-titulo"] input']);
    await page.evaluate(() => { (window as unknown as { __sinRecarga?: boolean }).__sinRecarga = true; });
    await page.getByRole('button', { name: '3', exact: true }).tap();
    for (let i = 1; i <= 3; i++) {
      await botonGenerar(page).scrollIntoViewIfNeeded();
      await botonGenerar(page).tap();
      await expect(page.locator('[class*="resultCard"]')).toHaveCount(3 * i);
    }
    await page.locator('[class*="resultCard"]').first()
      .getByRole('button', { name: /Guardar esta combinación/ }).tap();
    await expect.poll(async () => (await leerFavoritas(page)).length).toBe(1);

    const pena = page.locator('section[aria-labelledby="pena-titulo"]');
    const premio = pena.getByLabel(/Premio del décimo o apuesta/).first();
    await premio.scrollIntoViewIfNeeded();
    await premio.tap();
    await premio.fill('125.000');
    await esperarValorEnReact(page, premio, '125.000');
    const leLlega = pena.locator('tbody tr').first().locator('td').nth(1);
    await expect(leLlega).toHaveText('54.000,00 €');
    await leLlega.scrollIntoViewIfNeeded();
    expect(await recibeElClic(leLlega)).toBe(true); // ni la barra del logo ni nada encima
    // La tabla (6 columnas) se desliza dentro de su envoltorio; la página no desborda
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    // Ningún toque recargó la página ni navegó a otra parte
    expect(documentosNuevos).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __sinRecarga?: boolean }).__sinRecarga)).toBe(true);
    const url = new URL(page.url());
    expect(url.pathname + url.hash).toBe(RUTA);
  });

  test('elegir lotería en la primera vista deja el botón Generar a la vista', async ({ page }) => {
    // REPARADO el 06/10/2026 (hallazgo 2899): elegir lotería desplaza la vista hasta el botón
    // Generar si no se ve (`elegirLoteria`, `block: 'center'`). Era así (inspector 06/10/2026, operativa). A 390×844 la primera vista es el hero, el aviso
    // legal y las cinco loterías en columna (472-844 px); el panel de la modalidad empieza en
    // 876 px y el botón Generar en 1251-1353 px. Tocar «Euromillones» solo cambia el color del
    // botón: la vista no se mueve y lo que cambia (ficha y texto de Generar) queda fuera de la
    // pantalla. El botón «Generar números de Euromillones» de la ficha SÍ lleva al generador
    // (irAlGenerador). La maquetación es la misma desde agosto: no explica el CAMBIO de la firma.
    await esperarInteractiva(page);
    await page.getByRole('button', { name: 'Euromillones', exact: true }).first().tap();
    await expect(botonGenerar(page)).toContainText('Euromillones');
    await esperarDesplazamientoQuieto(page);
    const caja = (await botonGenerar(page).boundingBox())!;
    expect(caja.y + caja.height).toBeLessThanOrEqual(844);
  });
});

test.describe('06/10 · contenido', () => {
  test('dos boletos iguales no suben NADA la probabilidad: sobra «de manera significativa»', async ({ page }) => {
    // REPARADO el 06/10/2026 (hallazgo 2900). Era así (inspector 06/10/2026, contenido). Paso 3 de «Cómo usar el generador»: «Dos
    // boletos iguales no aumentan las probabilidades de manera significativa». La probabilidad
    // de que salga una combinación es 1 entre 13.983.816 (C(49,6)) la juegues una vez o dos:
    // el segundo boleto idéntico suma CERO, no «poco». Lo que duplica es la parte del premio.
    const pasos = (await page.locator('[class*="stepGuide"]').allTextContents()).join(' ');
    expect(pasos).toContain('Dos boletos iguales');
    expect(pasos).not.toMatch(/no aumentan las probabilidades de manera significativa/);
    expect(pasos).toMatch(/no aumentan nada la probabilidad/);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 12/10/2026 — re-inspección (segmento fiscal, riesgo 1; vuelve INVALIDADA) tras
 * 05020a07 (comprobador, S0176), 1b6dd902, e885f6e5 (reparto de la peña, S0180), 77981798 y
 * f3cdeb6d (nivel 1 de disclaimer).
 *
 * NORMA — data/fiscal/premios-loterias.ts (DA 33.ª LIRPF, cotejada el 05/10/2026): exentos
 * 40.000 € por décimo o apuesta; 20 % sobre el exceso; si el décimo o la apuesta cuesta menos de
 * 0,50 €, la exención se reduce en proporción (40.000 × precio / 0,50); en un premio compartido,
 * exención y base se prorratean por cuotas.
 * CATEGORÍAS — las que declara app/generador-loteria/comprobar.ts: Bonoloto 1.ª 6 · 2.ª 5 +
 * complementario · 3.ª 5 · 4.ª 4 · 5.ª 3 · reintegro aparte, SIN categoría especial;
 * Euromillones 1.ª 5+2 … 6.ª 3+2 · 7.ª 4+0 … 11.ª 1+2 · 12.ª 2+1 · 13.ª 2+0; Lototurf
 * 1.ª 6+caballo · 2.ª 6 · 3.ª 5+caballo · 4.ª 5 · 5.ª 4+caballo · 6.ª 4 · 7.ª 3+caballo.
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (céntimos por el mayor resto, reparto.ts):
 *   1. Normal — Ana 12 €, Bea 8 €, Carlos 4 € (cuotas 1/2, 1/3, 1/6), décimos de 60.000 y
 *      125.000 € a 20 €. Décimo 1: exento 40.000, retención 4000; décimo 2: 40.000 y 17.000.
 *      Totales 185.000 / 80.000 / 21.000 / se cobran 164.000. Bruto 18.500.000 c → 9.250.000 /
 *      6.166.666,67 / 3.083.333,33: el céntimo que sobra va a Bea (resto ,67) → 92.500,00 /
 *      61.666,67 / 30.833,33. Retención 10.500 / 7000 / 3500. Le llega 82.000,00 / 54.666,67 /
 *      27.333,33 (suman 164.000,00). Parte 50,00 / 33,33 / 16,67 %.
 *      Bonoloto 5 11 19 26 38 44 · complementario 30 · reintegro 2, contra siete guardadas:
 *        b1  5 11 19 26 38 44 · R2 → 6 + R      → 1.ª y reintegro (no hay especial)  7 bolas
 *        b2  5 11 19 26 30 38 · R7 → 5 + el 30  → 2.ª                               5 + compl.
 *        b3  5 11 19 26 38 49 · R2 → 5 + R      → 3.ª y reintegro                    6
 *        b4  1  5 11 19 30 47 · R0 → 3          → 5.ª (el 30 no cuenta con 3)        3
 *        b5  2  3  4  6  7  8 · R2 → 0 + R      → solo reintegro                     1
 *        b6  5 11 20 27 30 40 · R9 → 2          → sin premio                         2
 *        b7  1  2  5 11 19 26 · R5 → 4          → 4.ª                                4
 *      → «5 de tus 7 combinaciones de Bonoloto tienen premio de categoría; 3 aciertan el reintegro.»
 *   2. Límite — precio 0,49 €, justo por debajo de 0,50: exención 40.000 × 0,49 / 0,50 = 39.200;
 *      un premio de 40.000 € (exento entero a 0,50) deja base 800, retención 160 y se cobran
 *      39.840 (peña de partida 10/5/5: 19.920 / 9960 / 9960). Con 0,50 €, retención 0,00 €.
 *      Euromillones 7 15 23 34 46 · estrellas 4 9: e1 5+2 → 1.ª · e2 2+0 → 13.ª (la última) ·
 *      e3 1+1 → sin premio · e4 0+2 → sin premio · e5 1+2 → 11.ª · e6 3+2 → 6.ª · e7 4+0 → 7.ª
 *      → «5 de tus 7 combinaciones de Euromillones tienen premio de categoría.»
 *   3. Rechazo — aportación «diez» (el aviso nombra a Persona 2), premio «1e6» (no es un importe)
 *      y precio «0,00»: aviso y sin tabla. Lototurf con caballo 13 o con un 32: aviso y ningún
 *      veredicto; corregido (3 8 12 19 25 31 · caballo 7): 1.ª, 4.ª, 7.ª y sin premio.
 * Los tres casos dieron en el navegador exactamente lo calculado (29 de 29 comprobaciones).
 *
 * HALLAZGOS ABIERTOS de esta inspección, con `test.fail()` al final del bloque: afirman lo que
 * DEBE pasar. Al repararlos empezarán a pasar y Playwright avisará: entonces se quita el
 * `test.fail()` y su comentario pasa a «REPARADO».
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Inspector 12/10/2026', () => {
  const T_1210 = '2026-10-10T10:00:00.000Z';
  const guardada = (id: string, type: Modalidad, mainNumbers: number[], extraNumbers: number[]) =>
    ({ id, type, mainNumbers, extraNumbers, timestamp: T_1210 });
  const eur = (s: string) => `${s} €`;
  const pct = (s: string) => `${s} %`;
  const SELECTOR_PENA = 'section[aria-labelledby="pena-titulo"]';

  const pena = (page: Page) => page.locator(SELECTOR_PENA);
  const campoPremio = (page: Page, n = 0) => pena(page).getByLabel(/Premio del décimo o apuesta/).nth(n);
  const campoPone = (page: Page, n: number) => pena(page).getByLabel('Pone (€)').nth(n);
  const campoPrecio = (page: Page) => pena(page).getByLabel('Precio de cada décimo o apuesta (€)');
  const avisoPena = (page: Page) => pena(page).locator('[class*="comprobadorError"]');
  const desglose = (page: Page) => pena(page).locator('[class*="penaResultado"] > p');

  async function escribir(page: Page, campo: Locator, valor: string) {
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
  }

  /** Totales del reparto como pares [rótulo, cifra]. */
  const totalesPena = (page: Page) => pena(page).locator('[class*="penaTotales"] > div').evaluateAll((divs) =>
    divs.map((d) => [d.querySelector('dt')?.textContent ?? '', d.querySelector('dd')?.textContent ?? '']));

  /** Filas de la tabla: persona y sus cinco celdas (Pone, Le llega, Parte, Premio, Retención). */
  const filasPena = (page: Page) => pena(page).locator('tbody tr').evaluateAll((trs) =>
    trs.map((tr) => [
      tr.querySelector('th')?.textContent ?? '',
      ...Array.from(tr.querySelectorAll('td')).map((td) => td.textContent ?? ''),
    ]));

  const veredictos = (page: Page) => zonaComprobador(page).locator('[class*="comprobadaVeredicto"]');
  const bolasMarcadas = (page: Page) => zonaComprobador(page).locator('ul li').evaluateAll((lis) =>
    lis.map((li) => li.querySelectorAll('[class*="bolaAcertada"]').length));

  /** Teclea un sorteo: los números principales y luego cada casilla aparte por su etiqueta. */
  async function teclearSorteo(page: Page, numeros: string[], otras: Array<[string, string]>) {
    const zona = zonaComprobador(page);
    for (let i = 0; i < numeros.length; i++) {
      await escribirCasilla(page, zona.getByLabel(`Número ${i + 1} de la combinación ganadora`), numeros[i]);
    }
    for (const [etiqueta, valor] of otras) {
      await escribirCasilla(page, zona.getByLabel(etiqueta, { exact: true }), valor);
    }
  }

  test.describe('caso 1 (normal) — peña 12/8/4 € con dos décimos, y Bonoloto en el comprobador', () => {
    test('reparto: 164.000 € netos → 82.000,00 / 54.666,67 / 27.333,33 €, y el céntimo que sobra a Bea', async ({ page }) => {
      await esperarHidratacion(page, [`${SELECTOR_PENA} input`]);
      const nombres = pena(page).getByLabel('Nombre');
      await escribir(page, nombres.nth(0), 'Ana');
      await escribir(page, nombres.nth(1), 'Bea');
      await escribir(page, nombres.nth(2), 'Carlos');
      await escribir(page, campoPone(page, 0), '12');
      await escribir(page, campoPone(page, 1), '8');
      await escribir(page, campoPone(page, 2), '4');
      await escribir(page, campoPremio(page, 0), '60.000');
      await pena(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
      await escribir(page, campoPremio(page, 1), '125.000');

      // Exención por décimo (DA 33.ª.1): 2 × 40.000; retención (20.000 + 85.000) × 20 %
      await expect.poll(() => totalesPena(page)).toEqual([
        ['Premio íntegro', eur('185.000,00')],
        ['Exento', eur('80.000,00')],
        [`Retención del ${pct('20')}`, eur('21.000,00')],
        ['Lo que se cobra', eur('164.000,00')],
      ]);
      await expect(desglose(page)).toHaveText(
        new RegExp(`60\\.000,00 €, retención 4000,00 € · .*125\\.000,00 €, retención 17\\.000,00 €`));
      expect(await filasPena(page)).toEqual([
        ['Ana', eur('12,00'), eur('82.000,00'), pct('50,00'), eur('92.500,00'), eur('10.500,00')],
        ['Bea', eur('8,00'), eur('54.666,67'), pct('33,33'), eur('61.666,67'), eur('7000,00')],
        ['Carlos', eur('4,00'), eur('27.333,33'), pct('16,67'), eur('30.833,33'), eur('3500,00')],
      ]);
    });

    test('comprobador de Bonoloto: siete guardadas, siete veredictos y ninguna «categoría especial»', async ({ page }) => {
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(e.message));
      await sembrarYRecargar(page, {
        [CLAVE_FAVORITAS]: JSON.stringify([
          guardada('b1', 'bonoloto', [5, 11, 19, 26, 38, 44], [2]),
          guardada('b2', 'bonoloto', [5, 11, 19, 26, 30, 38], [7]),
          guardada('b3', 'bonoloto', [5, 11, 19, 26, 38, 49], [2]),
          guardada('b4', 'bonoloto', [1, 5, 11, 19, 30, 47], [0]),
          guardada('b5', 'bonoloto', [2, 3, 4, 6, 7, 8], [2]),
          guardada('b6', 'bonoloto', [5, 11, 20, 27, 30, 40], [9]),
          guardada('b7', 'bonoloto', [1, 2, 5, 11, 19, 26], [5]),
        ]),
      });
      const zona = zonaComprobador(page);
      await expect(zona.locator('legend')).toHaveText('Combinación ganadora de Bonoloto');
      await teclearSorteo(page, ['5', '11', '19', '26', '38', '44'], [['Complementario', '30'], ['Reintegro', '2']]);
      await zona.getByRole('button', { name: 'Comprobar mis combinaciones de Bonoloto' }).click();

      await expect(zona.locator('[class*="comprobadorResumen"]')).toHaveText(
        '5 de tus 7 combinaciones de Bonoloto tienen premio de categoría; 3 aciertan el reintegro.');
      await expect(veredictos(page)).toHaveText([
        '1.ª categoría (6 aciertos) y reintegro',
        '2.ª categoría (5 aciertos + complementario)',
        '3.ª categoría (5 aciertos) y reintegro',
        '5.ª categoría (3 aciertos)',
        'Reintegro (0 aciertos, sin premio de categoría)',
        'Sin premio (2 aciertos)',
        '4.ª categoría (4 aciertos)',
      ]);
      expect(await bolasMarcadas(page)).toEqual([7, 5, 6, 3, 1, 2, 4]);
      // El complementario solo se marca donde decide algo: en b2, con 5 aciertos (no en b4 ni b6)
      await expect(zona.locator('[class*="bolaComplementario"]')).toHaveText(['30 complementario']);
      await expect(zona).not.toContainText('Categoría especial');
      expect(errores).toEqual([]);
    });
  });

  test.describe('caso 2 (límite) — décimo de 0,49 € frente a 0,50 €, y el borde de las categorías de Euromillones', () => {
    test('precio 0,49 €: exentos 39.200 € y 160,00 € de retención sobre 40.000; con 0,50 €, nada', async ({ page }) => {
      await esperarHidratacion(page, [`${SELECTOR_PENA} input`]);
      await escribir(page, campoPrecio(page), '0,49');
      // DA 33.ª.2: «inferior a 0,50» → exención reducida en proporción: 40.000 × 0,49 / 0,50
      await expect(pena(page).locator('#pena-precio-ayuda')).toContainText(
        `cada décimo o apuesta tiene ${eur('39.200,00')} exentos`);
      await escribir(page, campoPremio(page), '40.000');
      await expect.poll(() => totalesPena(page)).toEqual([
        ['Premio íntegro', eur('40.000,00')],
        ['Exento', eur('39.200,00')],
        [`Retención del ${pct('20')}`, eur('160,00')],
        ['Lo que se cobra', eur('39.840,00')],
      ]);
      expect(await filasPena(page)).toEqual([
        ['Persona 1', eur('10,00'), eur('19.920,00'), pct('50,00'), eur('20.000,00'), eur('80,00')],
        ['Persona 2', eur('5,00'), eur('9960,00'), pct('25,00'), eur('10.000,00'), eur('40,00')],
        ['Persona 3', eur('5,00'), eur('9960,00'), pct('25,00'), eur('10.000,00'), eur('40,00')],
      ]);
      // Un céntimo más y ya no es «inferior a 0,50»: exento entero
      await escribir(page, campoPrecio(page), '0,50');
      await expect.poll(() => totalesPena(page)).toEqual([
        ['Premio íntegro', eur('40.000,00')],
        ['Exento', eur('40.000,00')],
        [`Retención del ${pct('20')}`, eur('0,00')],
        ['Lo que se cobra', eur('40.000,00')],
      ]);
      await expect(pena(page).locator('#pena-precio-ayuda')).not.toContainText('Con este precio');
    });

    test('Euromillones: 2+0 es la 13.ª y última; 1+1 y 0+2 sin premio; 1+2 la 11.ª; 3+2 (6.ª) antes que 4+0 (7.ª)', async ({ page }) => {
      await sembrarYRecargar(page, {
        [CLAVE_FAVORITAS]: JSON.stringify([
          guardada('e1', 'euromillones', [7, 15, 23, 34, 46], [4, 9]),
          guardada('e2', 'euromillones', [1, 2, 3, 7, 15], [1, 2]),
          guardada('e3', 'euromillones', [1, 2, 3, 5, 7], [4, 10]),
          guardada('e4', 'euromillones', [1, 2, 3, 5, 6], [4, 9]),
          guardada('e5', 'euromillones', [1, 2, 3, 5, 7], [4, 9]),
          guardada('e6', 'euromillones', [1, 2, 7, 15, 23], [4, 9]),
          guardada('e7', 'euromillones', [1, 7, 15, 23, 34], [1, 2]),
        ]),
      });
      const zona = zonaComprobador(page);
      await teclearSorteo(page, ['7', '15', '23', '34', '46'], [['Estrella 1', '4'], ['Estrella 2', '9']]);
      await zona.getByRole('button', { name: 'Comprobar mis combinaciones de Euromillones' }).click();
      await expect(zona.locator('[class*="comprobadorResumen"]')).toHaveText(
        '5 de tus 7 combinaciones de Euromillones tienen premio de categoría.');
      await expect(veredictos(page)).toHaveText([
        '1.ª categoría (5 aciertos + 2 estrellas)',
        '13.ª categoría (2 aciertos)',
        'Sin premio (1 acierto + 1 estrella)',
        'Sin premio (0 aciertos + 2 estrellas)',
        '11.ª categoría (1 acierto + 2 estrellas)',
        '6.ª categoría (3 aciertos + 2 estrellas)',
        '7.ª categoría (4 aciertos)',
      ]);
      expect(await bolasMarcadas(page)).toEqual([7, 2, 2, 2, 3, 5, 4]);
      // Las que no tienen premio no se resaltan aunque lleven bolas acertadas
      const conPremio = await zona.locator('ul li').evaluateAll((lis) => lis.map((li) => /comprobadaPremio/.test(li.className)));
      expect(conPremio).toEqual([true, true, false, false, true, true, true]);
    });
  });

  test.describe('caso 3 (rechazo) — lo que no es un importe ni un sorteo posible', () => {
    test('reparto: aportación «diez», premio «1e6» y precio «0,00» avisan y no reparten', async ({ page }) => {
      await esperarHidratacion(page, [`${SELECTOR_PENA} input`]);
      await escribir(page, campoPone(page, 1), 'diez');
      await escribir(page, campoPremio(page), '125.000');
      await expect(avisoPena(page)).toHaveText(
        'Revisa las aportaciones: tienen que ser cantidades de 0 € o más. Revisa lo que pone Persona 2.');
      await expect(pena(page).locator('input[aria-invalid="true"]')).toHaveCount(1);
      await expect(campoPone(page, 1)).toHaveAttribute('aria-invalid', 'true');
      await expect(pena(page).locator('tbody tr')).toHaveCount(0);

      await escribir(page, campoPone(page, 1), '5');
      // parseSpanishNumber no admite notación científica: «1e6» no es un millón
      await escribir(page, campoPremio(page), '1e6');
      await expect(avisoPena(page)).toHaveText('Indica el premio de cada décimo o apuesta premiados, mayor que 0 €.');
      await expect(campoPremio(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(pena(page).locator('tbody tr')).toHaveCount(0);

      await escribir(page, campoPremio(page), '125.000');
      await escribir(page, campoPrecio(page), '0,00');
      await expect(avisoPena(page)).toHaveText('Indica lo que costó cada décimo o apuesta, mayor que 0 €.');
      await expect(campoPrecio(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(pena(page).locator('[class*="penaTotales"]')).toHaveCount(0);
    });

    test('Lototurf: caballo 13 y un 32 se rechazan sin veredicto; corregido, 1.ª, 4.ª, 7.ª y sin premio', async ({ page }) => {
      await sembrarYRecargar(page, {
        [CLAVE_FAVORITAS]: JSON.stringify([
          guardada('l1', 'lototurf', [3, 8, 12, 19, 25, 31], [7]),
          guardada('l2', 'lototurf', [3, 8, 12, 19, 25, 30], [2]),
          guardada('l3', 'lototurf', [1, 2, 3, 4, 8, 12], [7]),
          guardada('l4', 'lototurf', [1, 2, 3, 4, 8, 12], [5]),
        ]),
      });
      const zona = zonaComprobador(page);
      const boton = zona.getByRole('button', { name: 'Comprobar mis combinaciones de Lototurf' });
      await teclearSorteo(page, ['3', '8', '12', '19', '25', '31'], [['Caballo', '13']]);
      await boton.click();
      await expect(zona.getByRole('alert')).toHaveText('Caballo: 13 está fuera de rango, va del 1 al 12.');
      await expect(veredictos(page)).toHaveCount(0);

      await escribirCasilla(page, zona.getByLabel('Caballo', { exact: true }), '7');
      await escribirCasilla(page, zona.getByLabel('Número 6 de la combinación ganadora'), '32');
      await boton.click();
      await expect(zona.getByRole('alert')).toHaveText('El número 6 (32) está fuera de rango: va del 1 al 31.');
      await expect(veredictos(page)).toHaveCount(0);

      await escribirCasilla(page, zona.getByLabel('Número 6 de la combinación ganadora'), '31');
      await boton.click();
      await expect(zona.getByRole('alert')).toHaveCount(0);
      await expect(zona.locator('[class*="comprobadorResumen"]')).toHaveText(
        '3 de tus 4 combinaciones de Lototurf tienen premio de categoría.');
      await expect(veredictos(page)).toHaveText([
        '1.ª categoría (6 aciertos + caballo)',
        '4.ª categoría (5 aciertos)',
        '7.ª categoría (3 aciertos + caballo)',
        'Sin premio (3 aciertos)',
      ]);
      await expect(zona).toContainText('El reintegro de Lototurf va impreso en tu resguardo');
    });
  });

  test.describe('hallazgos ABIERTOS (inspector 12/10/2026)', () => {
    // En la base, por orden: 3234 (desglose), 3235 (botones 1/3/5/10), 3236 (gravamen español) y
    // 3237 (FAQ duplicada). Siguen abiertos en la re-inspección del 14/10/2026: los cuatro
    // `test.fail()` fallan como se espera.
    test('ABIERTO (contenido, bajo) · el desglose por décimo numera los décimos como el formulario', async ({ page }) => {
      // Con el campo 1 vacío y premios en los campos 2 y 3 («Premio del décimo o apuesta 2/3 (€)»),
      // el desglose decía «Décimo 1: 60.000,00 €… · Décimo 2: 125.000,00 €…»: numera solo los
      // campos escritos, así que la retención de 17.000 € se atribuye al «décimo 2», que en el
      // formulario es el de 60.000 €. Los avisos de error sí usan la numeración del formulario.
      test.fail();
      await esperarHidratacion(page, [`${SELECTOR_PENA} input`]);
      await pena(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
      await pena(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
      await expect(pena(page).getByLabel('Premio del décimo o apuesta 3 (€)')).toHaveCount(1);
      await escribir(page, campoPremio(page, 1), '60.000');
      await escribir(page, campoPremio(page, 2), '125.000');
      await expect(desglose(page)).toContainText(`retención ${eur('17.000,00')}`); // hay desglose
      await expect(desglose(page)).toHaveText(new RegExp(`\\b2: 60\\.000,00 €.*\\b3: 125\\.000,00 €`));
    });

    test('ABIERTO (accesibilidad, bajo) · los botones 1/3/5/10 dicen de qué son (WCAG 1.3.1)', async ({ page }) => {
      // «Combinaciones a generar:» es un <label> sin control (ni htmlFor ni input dentro): no
      // nombra nada. Los botones se anuncian «1», «3», «5», «10», conmutadores sin grupo ni
      // descripción, y al tabular hasta ellos un lector de pantalla no dice qué cuentan.
      test.fail();
      const botones = page.locator('[class*="quantityButtons"] button');
      await expect(botones).toHaveCount(4);
      const enGrupo = await page.getByRole('group', { name: /combinaciones a generar/i }).getByRole('button').count();
      const contexto = await botones.nth(1).evaluate((b) => {
        const textos = (ids: string | null) => (ids ?? '').split(/\s+/).filter(Boolean)
          .map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
        return `${b.getAttribute('aria-label') ?? ''} ${textos(b.getAttribute('aria-labelledby'))} ${textos(b.getAttribute('aria-describedby'))}`;
      });
      expect(enGrupo === 4 || /combinaci/i.test(contexto)).toBe(true);
    });

    test('ABIERTO (contenido, bajo) · el reparto dice que su gravamen es el español', async ({ page }) => {
      // La sección calcula el gravamen de la DA 33.ª de la LIRPF (40.000 € exentos, 20 %) y no dice
      // en ningún sitio que es el de España; tampoco hay RegionBadge «es-only», que CLAUDE.md
      // (1.bis) exige a las apps fiscales-España. Con media audiencia en Latinoamérica, una peña
      // de otro país leería como suyas la exención y la retención españolas.
      test.fail();
      const texto = ((await pena(page).textContent()) ?? '').replace(/\s+/g, ' ');
      expect(texto).toContain('Hacienda'); // la sección habla de impuestos
      const insignia = await page.getByRole('note', { name: /únicamente a España/ }).count();
      expect(/Españ/.test(texto) || insignia > 0).toBe(true);
    });

    test('ABIERTO (contenido, bajo) · la pregunta del generador aleatorio tiene UNA respuesta', async ({ page }) => {
      // El FAQPage pregunta «¿Usar un generador aleatorio mejora mis probabilidades en la lotería?»
      // y la FAQ visible «¿Los números generados aleatoriamente tienen más probabilidad de ganar?»:
      // la misma pregunta con dos respuestas redactadas aparte. La reparación es UNA constante en
      // metadata.ts que importen las dos (como app/simulador-gastos-compraventa-garaje).
      test.fail();
      interface PreguntaFaq { name: string; acceptedAnswer: { text: string } }
      interface BloqueLd { '@type'?: string; mainEntity?: PreguntaFaq[] }
      const normal = (s: string) => s.replace(/\s+/g, ' ').trim();
      const visible = page.locator('[class*="faqList"] details')
        .filter({ has: page.locator('summary', { hasText: 'generados aleatoriamente tienen más probabilidad' }) });
      await expect(visible).toHaveCount(1);
      const textoVisible = normal((await visible.textContent()) ?? '');
      const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
      const faq = bloques.map((b) => JSON.parse(b) as BloqueLd).find((j) => j['@type'] === 'FAQPage');
      const gemela = (faq?.mainEntity ?? []).find((q) =>
        /generador aleatorio mejora|aleatoriamente tienen más probabilidad/i.test(q.name));
      if (gemela) expect(textoVisible).toContain(normal(gemela.acceptedAnswer.text));
    });
  });
});

/**
 * Página traducida por el navegador (cabo C0233, 13/10/2026). El dump de errores reunía en
 * esta app 5 NotFoundError. Un traductor sustituye cada nodo de texto por
 * <font><font>…</font></font>, y React cae cuando RETIRA un nodo de texto suelto que ya no
 * está: (1) el botón Generar pasaba de «🎯 Generar…» (dos textos) a «🎲 Generando...» (uno),
 * (2) Copiar pasaba de «📋» a «✓ Copiada» y vuelta, (3) la frase de la exención reducida del
 * precio era un texto condicional pegado al de la ayuda. REPARADO (13/10/2026): cada estado en
 * su propio <span> con su key, que React cambia entero.
 */
test.describe('13/10 · página traducida por el navegador', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('generar, copiar, guardar y bajar el precio con la página traducida no tumba la app', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
    });
    /** Imita al traductor: cada nodo de texto visible pasa a <font><font>texto</font></font>. */
    const traducir = () =>
      page.evaluate(() => {
        const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) => {
            const padre = n.parentElement;
            if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
            if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });
        const nodos: Text[] = [];
        while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
        for (const nodo of nodos) {
          const exterior = document.createElement('font');
          const interior = document.createElement('font');
          interior.textContent = nodo.nodeValue;
          exterior.appendChild(interior);
          nodo.parentNode?.replaceChild(exterior, nodo);
        }
      });
    const enPie = async () => {
      await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toHaveCount(0);
      await expect(botonGenerar(page)).toBeVisible();
    };

    await esperarInteractiva(page);
    await esperarHidratacion(page, ['section[aria-labelledby="pena-titulo"] input']);
    await traducir();

    // (1) Generar: el botón pasa por «Generando...» y vuelve.
    await botonGenerar(page).click();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
    await expect(botonGenerar(page)).toContainText('Generar 1');
    await enPie();

    // (2) Copiar: «📋» → «✓ Copiada» → «📋».
    await traducir();
    await page.getByRole('button', { name: 'Copiar combinación' }).click();
    await expect(page.locator('[class*="resultCard"]').getByText('Copiada')).toBeVisible();
    await traducir();
    await expect(page.locator('[class*="resultCard"]').getByText('Copiada')).toHaveCount(0, { timeout: 8000 });
    await enPie();

    // Y generar otra vez sobre el botón ya traducido.
    await traducir();
    await botonGenerar(page).click();
    await expect(page.locator('[class*="resultCard"]')).toHaveCount(2);
    await enPie();

    // Guardar la primera: aparece la sección de guardadas y su comprobador.
    await traducir();
    await page.getByRole('button', { name: 'Guardar esta combinación en este navegador' }).first().click();
    await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(1);
    await enPie();

    // (3) El precio por debajo del mínimo añade la frase de la exención reducida, y quitarla.
    const pena = page.locator('section[aria-labelledby="pena-titulo"]');
    const precio = pena.getByLabel('Precio de cada décimo o apuesta (€)');
    await precio.fill('0,25');
    await esperarValorEnReact(page, precio, '0,25');
    await expect(pena.locator('#pena-precio-ayuda')).toContainText('20.000,00 € exentos');
    await traducir();
    await precio.fill('5');
    await esperarValorEnReact(page, precio, '5');
    await expect(pena.locator('#pena-precio-ayuda')).not.toContainText('exentos');
    await enPie();

    expect(errores).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspector 14/10/2026 — re-inspección (segmento fiscal, riesgo 1; vuelve INVALIDADA) tras
 * 26e70898 (página traducida: Generar, Copiar y la frase del precio, cada estado en su <span>
 * con key; cabo C0233) y cd462414 (cromo fijo: el scroll-padding de app/globals.css sustituye a
 * los scroll-margin de la app; cabos C0090 y C0116).
 *
 * NORMA — data/fiscal/premios-loterias.ts (DA 33.ª LIRPF): 40.000 € exentos por décimo o apuesta
 * (reducidos en proporción si cuesta menos de 0,50 €), 20 % sobre el exceso, prorrateo por cuotas.
 * CATEGORÍAS de La Primitiva — las que declara comprobar.ts: especial 6 + reintegro · 1.ª 6 ·
 * 2.ª 5 + complementario · 3.ª 5 · 4.ª 4 · 5.ª 3 · reintegro aparte.
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (céntimos por el mayor resto, reparto.ts):
 *   1. Normal — sorteo de La Primitiva 2 9 17 28 36 45 · complementario 11 · reintegro 4:
 *        p1  2  9 17 28 36 45 · R4 → 6 + R               → categoría especial     7 bolas
 *        p2  2  9 17 28 36 45 · R3 → 6                   → 1.ª                    6
 *        p3  2  9 11 17 28 36 · R1 → 5, el 6.º es el 11  → 2.ª                    5 + compl.
 *        p4  1  2  9 17 28 36 · R4 → 5 + R               → 3.ª y reintegro        6
 *        p5  1  3  5  7 11 13 · R0 → 0 (el 11 no cuenta) → sin premio             0
 *      → «4 de tus 5 combinaciones de La Primitiva tienen premio de categoría; 2 aciertan el
 *      reintegro.» Peña de cuatro que ponen 8, 6, 4 y 2 € (40/30/20/10 %) y un décimo de
 *      250.000 € a 20 €: exento 40.000 · base 210.000 · retención 42.000 · se cobran 208.000. Por
 *      persona, exacto: premio 100.000 / 75.000 / 50.000 / 25.000; retención 16.800 / 12.600 /
 *      8400 / 4200; le llega 83.200 / 62.400 / 41.600 / 20.800.
 *   2. Límite — 40.000,05 €, el primer importe por encima de la exención que deja retención:
 *      base 0,05 €, retención 0,05 × 20 % = 0,01 €, se cobran 40.000,04 €. Peña de partida
 *      10/5/5 €: bruto 4.000.005 c → 2.000.002,5 / 1.000.001,25 / 1.000.001,25, y el céntimo que
 *      sobra va a Persona 1 (resto ,5): 20.000,03 / 10.000,01 / 10.000,01; retención 1 c → 0,5 /
 *      0,25 / 0,25 → 0,01 / 0,00 / 0,00; le llega 20.000,02 / 10.000,01 / 10.000,01.
 *      Una sola guardada, 2 9 40 41 42 43 · R4, contra el mismo sorteo: 2 aciertos + reintegro →
 *      «Reintegro (2 aciertos, sin premio de categoría)», 3 bolas marcadas, la fila resaltada y el
 *      resumen en singular: «Tu combinación de La Primitiva no tiene premio de categoría, pero
 *      acierta el reintegro.»
 *   3. Rechazo — comprobador: complementario 0 (fuera de 1-49), complementario 45 (uno de los
 *      seis), reintegro vacío y «-3» en la 1.ª casilla: un aviso cada uno y ningún veredicto.
 *      Reparto: Persona 1 pone «-3» (el aviso la nombra y su campo va aria-invalid) y, arreglada,
 *      precio «-1» (aviso del precio, sin tabla ni totales).
 * Los tres casos dieron en el navegador exactamente lo calculado.
 *
 * PÁGINA TRADUCIDA (el mismo traductor simulado que el bloque del 13/10): Generar, Copiar y el
 * precio ya no caen. Tampoco el comprobador (comprobar, cambiar una casilla, avisos, cambiar de
 * lotería), las guardadas (estrella, quitar, vaciar), la cantidad, el selector, la guía educativa
 * ni el reparto (añadir y quitar personas y décimos). SÍ cae el aviso del reparto cuando pierde
 * su detalle sin desaparecer: «{resultado.error}{detalleError}» son dos textos sueltos y React
 * retira el segundo, que el traductor ya cambió por <font> (hallazgo nuevo, abajo). Y el texto
 * que cambia DENTRO del mismo nodo no cae pero se queda viejo: React escribe en el nodo que el
 * traductor retiró (hallazgo nuevo, abajo).
 *
 * CROMO FIJO (scroll-padding del documento): medido a 1280×800, 1024×768, 360×800 y 390×844. La
 * tarjeta nueva, el resumen y el aviso del comprobador acaban 8 px por encima de la píldora del
 * pie en escritorio (737 frente a 745; 705 frente a 713) y a 8 px del borde en móvil; el ancla
 * #generador-lototurf deja su título por debajo de la barra (155 frente a 92; 125 frente a 62).
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Inspector 14/10/2026', () => {
  const T_1410 = '2026-10-12T10:00:00.000Z';
  const g = (id: string, type: Modalidad, mainNumbers: number[], extraNumbers: number[]) =>
    ({ id, type, mainNumbers, extraNumbers, timestamp: T_1410 });
  const PRIMITIVA_1410 = [
    g('p1', 'primitiva', [2, 9, 17, 28, 36, 45], [4]),
    g('p2', 'primitiva', [2, 9, 17, 28, 36, 45], [3]),
    g('p3', 'primitiva', [2, 9, 11, 17, 28, 36], [1]),
    g('p4', 'primitiva', [1, 2, 9, 17, 28, 36], [4]),
    g('p5', 'primitiva', [1, 3, 5, 7, 11, 13], [0]),
    g('e1', 'euromillones', [5, 14, 23, 37, 44], [3, 7]),
  ];
  /** Sorteo inventado de La Primitiva: los seis, el complementario y el reintegro. */
  const SORTEO_1410: [string[], string, string] = [['2', '9', '17', '28', '36', '45'], '11', '4'];

  const SELECTOR_PENA = 'section[aria-labelledby="pena-titulo"]';
  const pena = (page: Page) => page.locator(SELECTOR_PENA);
  const campoPremio = (page: Page, n = 0) => pena(page).getByLabel(/Premio del décimo o apuesta/).nth(n);
  const campoPone = (page: Page, n: number) => pena(page).getByLabel('Pone (€)').nth(n);
  const campoPrecio = (page: Page) => pena(page).getByLabel('Precio de cada décimo o apuesta (€)');
  const avisoPena = (page: Page) => pena(page).locator('[class*="comprobadorError"]');
  // formatCurrency y formatPercentage ponen espacio duro (U+00A0) delante del símbolo
  const eur = (s: string) => `${s} €`;
  const pct = (s: string) => `${s} %`;

  async function escribir(page: Page, campo: Locator, valor: string) {
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
  }

  const totalesPena = (page: Page) => pena(page).locator('[class*="penaTotales"] > div').evaluateAll((divs) =>
    divs.map((d) => [d.querySelector('dt')?.textContent ?? '', d.querySelector('dd')?.textContent ?? '']));
  const filasPena = (page: Page) => pena(page).locator('tbody tr').evaluateAll((trs) =>
    trs.map((tr) => [
      tr.querySelector('th')?.textContent ?? '',
      ...Array.from(tr.querySelectorAll('td')).map((td) => td.textContent ?? ''),
    ]));

  const veredictos = (page: Page) => zonaComprobador(page).locator('[class*="comprobadaVeredicto"]');
  const bolasMarcadas = (page: Page) => zonaComprobador(page).locator('ul li').evaluateAll((lis) =>
    lis.map((li) => li.querySelectorAll('[class*="bolaAcertada"]').length));
  const avisoComprobador = (page: Page) => zonaComprobador(page).locator('[class*="comprobadorError"]');

  async function teclearSorteo(page: Page, [numeros, complementario, reintegro]: [string[], string, string]) {
    const zona = zonaComprobador(page);
    for (let i = 0; i < 6; i++) {
      await escribirCasilla(page, zona.getByLabel(`Número ${i + 1} de la combinación ganadora`), numeros[i]);
    }
    await escribirCasilla(page, zona.getByLabel('Complementario'), complementario);
    await escribirCasilla(page, zona.getByLabel('Reintegro'), reintegro);
  }

  /** El traductor del navegador, como en el bloque del 13/10: cada texto pasa a <font><font>…. */
  const traducir = (page: Page) =>
    page.evaluate(() => {
      const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const padre = n.parentElement;
          if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
          if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodos: Text[] = [];
      while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
      for (const nodo of nodos) {
        const exterior = document.createElement('font');
        const interior = document.createElement('font');
        interior.textContent = nodo.nodeValue;
        exterior.appendChild(interior);
        nodo.parentNode?.replaceChild(exterior, nodo);
      }
    });

  /** Errores de React al tocar nodos que el traductor ya cambió. */
  function vigilarErrores(page: Page): string[] {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
    });
    return errores;
  }

  const sinCaida = async (page: Page) => {
    await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toHaveCount(0);
    await expect(botonGenerar(page)).toBeVisible();
  };

  test.describe('caso 1 (normal)', () => {
    test('comprobador de La Primitiva: categoría especial, 1.ª, 2.ª, 3.ª con reintegro y sin premio', async ({ page }) => {
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(PRIMITIVA_1410) });
      const zona = zonaComprobador(page);
      await expect(zona.getByRole('button', { name: 'La Primitiva', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await teclearSorteo(page, SORTEO_1410);
      await zona.getByRole('button', { name: 'Comprobar mis combinaciones de La Primitiva' }).click();

      await expect(zona.locator('[class*="comprobadorResumen"]')).toHaveText(
        '4 de tus 5 combinaciones de La Primitiva tienen premio de categoría; 2 aciertan el reintegro.');
      await expect(veredictos(page)).toHaveText([
        'Categoría especial (6 aciertos + reintegro)',
        '1.ª categoría (6 aciertos)',
        '2.ª categoría (5 aciertos + complementario)',
        '3.ª categoría (5 aciertos) y reintegro',
        'Sin premio (0 aciertos)',
      ]);
      expect(await bolasMarcadas(page)).toEqual([7, 6, 5, 6, 0]);
      // El 11 solo se marca como complementario en p3 (5 aciertos); en p5 no decide nada
      await expect(zona.locator('[class*="bolaComplementario"]')).toHaveText(['11 complementario']);
    });

    test('peña de cuatro que pone 8, 6, 4 y 2 € con un décimo de 250.000 €: 83.200 / 62.400 / 41.600 / 20.800 €', async ({ page }) => {
      await esperarHidratacion(page, [`${SELECTOR_PENA} input`]);
      await escribir(page, campoPone(page, 0), '8');
      await escribir(page, campoPone(page, 1), '6');
      await escribir(page, campoPone(page, 2), '4');
      await pena(page).getByRole('button', { name: /Añadir persona/ }).click();
      await escribir(page, campoPone(page, 3), '2');
      await escribir(page, campoPremio(page), '250.000');
      // DA 33.ª: exentos 40.000; (250.000 − 40.000) × 20 % = 42.000 de retención
      await expect.poll(() => totalesPena(page)).toEqual([
        ['Premio íntegro', eur('250.000,00')],
        ['Exento', eur('40.000,00')],
        [`Retención del ${pct('20')}`, eur('42.000,00')],
        ['Lo que se cobra', eur('208.000,00')],
      ]);
      expect(await filasPena(page)).toEqual([
        ['Persona 1', eur('8,00'), eur('83.200,00'), pct('40,00'), eur('100.000,00'), eur('16.800,00')],
        ['Persona 2', eur('6,00'), eur('62.400,00'), pct('30,00'), eur('75.000,00'), eur('12.600,00')],
        ['Persona 3', eur('4,00'), eur('41.600,00'), pct('20,00'), eur('50.000,00'), eur('8400,00')],
        ['Persona 4', eur('2,00'), eur('20.800,00'), pct('10,00'), eur('25.000,00'), eur('4200,00')],
      ]);
    });
  });

  test.describe('caso 2 (límite)', () => {
    test('40.000,05 €: 0,01 € de retención, y el céntimo que sobra va a quien más puso', async ({ page }) => {
      await esperarHidratacion(page, [`${SELECTOR_PENA} input`]);
      await escribir(page, campoPremio(page), '40.000,05');
      // base 0,05 € → retención 0,01 €; peña de partida 10/5/5 €
      await expect.poll(() => totalesPena(page)).toEqual([
        ['Premio íntegro', eur('40.000,05')],
        ['Exento', eur('40.000,00')],
        [`Retención del ${pct('20')}`, eur('0,01')],
        ['Lo que se cobra', eur('40.000,04')],
      ]);
      expect(await filasPena(page)).toEqual([
        ['Persona 1', eur('10,00'), eur('20.000,02'), pct('50,00'), eur('20.000,03'), eur('0,01')],
        ['Persona 2', eur('5,00'), eur('10.000,01'), pct('25,00'), eur('10.000,01'), eur('0,00')],
        ['Persona 3', eur('5,00'), eur('10.000,01'), pct('25,00'), eur('10.000,01'), eur('0,00')],
      ]);
    });

    test('una sola guardada con 2 aciertos y el reintegro: solo reintegro, y el resumen en singular', async ({ page }) => {
      await sembrarYRecargar(page, {
        [CLAVE_FAVORITAS]: JSON.stringify([g('s1', 'primitiva', [2, 9, 40, 41, 42, 43], [4])]),
      });
      const zona = zonaComprobador(page);
      await expect(zona.getByRole('group', { name: 'Lotería que quieres comprobar' })).toHaveCount(0);
      await teclearSorteo(page, SORTEO_1410);
      await zona.getByRole('button', { name: 'Comprobar mis combinaciones de La Primitiva' }).click();
      const resumen = 'Tu combinación de La Primitiva no tiene premio de categoría, pero acierta el reintegro.';
      await expect(zona.locator('[class*="comprobadorResumen"]')).toHaveText(resumen);
      await expect(veredictos(page)).toHaveText(['Reintegro (2 aciertos, sin premio de categoría)']);
      expect(await bolasMarcadas(page)).toEqual([3]);
      await expect(zona.locator('ul li')).toHaveClass(/comprobadaPremio/);
      await expect(page.getByRole('status').filter({ hasText: resumen })).toHaveCount(1);
    });
  });

  test.describe('caso 3 (rechazo)', () => {
    test('comprobador: complementario 0 o repetido, reintegro vacío y «-3» se rechazan sin veredicto', async ({ page }) => {
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(PRIMITIVA_1410.slice(0, 1)) });
      const boton = zonaComprobador(page).getByRole('button', { name: 'Comprobar mis combinaciones de La Primitiva' });
      const seis = ['2', '9', '17', '28', '36', '45'];
      const casos: Array<[[string[], string, string], string]> = [
        [[seis, '0', '4'], 'El complementario (0) está fuera de rango: va del 1 al 49.'],
        [[seis, '45', '4'], 'El complementario (45) no puede ser uno de los seis de la combinación ganadora: sale del mismo bombo, después.'],
        [[seis, '11', ''], 'Falta el reintegro: es una sola cifra, del 0 al 9.'],
        [[['-3', ...seis.slice(1)], '11', '4'], 'Falta el número 1 de la combinación ganadora, o no es un número entero.'],
      ];
      for (const [sorteo, aviso] of casos) {
        await teclearSorteo(page, sorteo);
        await boton.click();
        await expect(avisoComprobador(page)).toHaveText(aviso);
        await expect(veredictos(page)).toHaveCount(0);
      }
    });

    test('reparto: una aportación negativa y un precio negativo avisan y no reparten', async ({ page }) => {
      await esperarHidratacion(page, [`${SELECTOR_PENA} input`]);
      await escribir(page, campoPone(page, 0), '-3');
      await escribir(page, campoPremio(page), '125.000');
      await expect(avisoPena(page)).toHaveText(
        'Revisa las aportaciones: tienen que ser cantidades de 0 € o más. Revisa lo que pone Persona 1.');
      await expect(pena(page).locator('input[aria-invalid="true"]')).toHaveCount(1);
      await expect(campoPone(page, 0)).toHaveAttribute('aria-invalid', 'true');
      await expect(pena(page).locator('tbody tr')).toHaveCount(0);

      await escribir(page, campoPone(page, 0), '10');
      await escribir(page, campoPrecio(page), '-1');
      await expect(avisoPena(page)).toHaveText('Indica lo que costó cada décimo o apuesta, mayor que 0 €.');
      await expect(campoPrecio(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(pena(page).locator('tbody tr')).toHaveCount(0);
      await expect(pena(page).locator('[class*="penaTotales"]')).toHaveCount(0);
    });
  });

  test.describe('página traducida — los controles que 26e70898 no tocó', () => {
    test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

    test('comprobador: comprobar, cambiar una casilla, los avisos y cambiar de lotería no tumban la app', async ({ page }) => {
      const errores = vigilarErrores(page);
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(PRIMITIVA_1410) });
      const zona = zonaComprobador(page);
      const boton = zona.getByRole('button', { name: /Comprobar mis combinaciones/ });
      await traducir(page);
      await teclearSorteo(page, SORTEO_1410);
      await boton.click();
      await expect(veredictos(page)).toHaveCount(5);
      await traducir(page);
      await escribirCasilla(page, zona.getByLabel('Complementario'), '12'); // retira el veredicto
      await expect(veredictos(page)).toHaveCount(0);
      await traducir(page);
      await escribirCasilla(page, zona.getByLabel('Número 3 de la combinación ganadora'), '9');
      await boton.click();
      await expect(avisoComprobador(page)).toContainText('El 9 está repetido');
      await traducir(page);
      await escribirCasilla(page, zona.getByLabel('Número 3 de la combinación ganadora'), '17');
      await expect(avisoComprobador(page)).toHaveCount(0);
      await boton.click();
      await expect(veredictos(page)).toHaveCount(5);
      await traducir(page);
      await zona.getByRole('button', { name: 'Euromillones', exact: true }).click();
      await expect(zona.getByLabel('Estrella 2')).toHaveCount(1);
      await traducir(page);
      await zona.getByRole('button', { name: 'La Primitiva', exact: true }).click();
      await expect(zona.getByLabel('Complementario')).toHaveCount(1);
      await sinCaida(page);
      expect(errores).toEqual([]);
    });

    test('guardadas, cantidad, selector, guía educativa, Limpiar y Vaciar no tumban la app', async ({ page }) => {
      const errores = vigilarErrores(page);
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(PRIMITIVA_1410.slice(0, 2)) });
      await traducir(page);
      await page.getByRole('button', { name: '3', exact: true }).click();
      await seleccionarLoteria(page, 'euromillones');
      await traducir(page);
      await botonGenerar(page).click();
      await expect(page.locator('[class*="resultCard"]')).toHaveCount(3);
      await traducir(page);
      const estrella = page.locator('[class*="resultCard"]').first().locator('[aria-pressed]');
      await estrella.click();
      await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(3);
      await traducir(page);
      await estrella.click();
      await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(2);
      await traducir(page);
      await page.getByRole('button', { name: /^Quitar la combinación/ }).first().click();
      await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(1);
      await traducir(page);
      const guia = page.getByRole('button', { name: /guía educativa/ });
      await guia.click();
      await traducir(page);
      await guia.click();
      await traducir(page);
      await page.getByRole('button', { name: /Limpiar/ }).click();
      await expect(page.locator('[class*="resultCard"]')).toHaveCount(0);
      await traducir(page);
      await page.getByRole('button', { name: /Vaciar/ }).click();
      await expect(page.locator('[class*="favoriteCard"]')).toHaveCount(0);
      await traducir(page);
      await page.getByRole('button', { name: 'Generar números de Lototurf' }).click();
      await sinCaida(page);
      expect(errores).toEqual([]);
    });

    test('reparto: añadir a alguien sin aportación, arreglarlo y añadir y quitar décimos no tumba la app', async ({ page }) => {
      const errores = vigilarErrores(page);
      await esperarInteractiva(page);
      await esperarHidratacion(page, [`${SELECTOR_PENA} input`]);
      await traducir(page);
      await escribir(page, campoPremio(page), '125.000');
      await expect(pena(page).locator('tbody tr')).toHaveCount(3);
      await traducir(page);
      await pena(page).getByRole('button', { name: /Añadir persona/ }).click();
      await expect(avisoPena(page)).toContainText('Revisa lo que pone Persona 4.');
      await traducir(page);
      await escribir(page, campoPone(page, 3), '5'); // el aviso desaparece entero: no cae
      await expect(pena(page).locator('tbody tr')).toHaveCount(4);
      await traducir(page);
      await pena(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
      await escribir(page, campoPremio(page, 1), '50.000');
      await traducir(page);
      await pena(page).getByRole('button', { name: 'Quitar el premio 2' }).click();
      await traducir(page);
      await pena(page).getByRole('button', { name: 'Quitar a Persona 4 de la peña' }).click();
      await expect(pena(page).locator('tbody tr')).toHaveCount(3);
      await sinCaida(page);
      expect(errores).toEqual([]);
    });
  });

  test.describe('cromo fijo — lo que la app lleva a la vista', () => {
    test('1280×800: el resumen y el aviso del comprobador acaban por encima de la píldora fija del pie', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(PRIMITIVA_1410) });
      const cromo = () => page.evaluate(() => {
        const pie = document.querySelector('[data-pildora-pie]')!;
        return {
          barra: document.querySelector('[data-barra-logo]')!.getBoundingClientRect().bottom,
          pildora: pie.getBoundingClientRect().top,
          pildoraFija: getComputedStyle(pie).position === 'fixed',
        };
      });
      const caja = (sel: string) => page.evaluate((s) => {
        const r = document.querySelector(s)!.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom };
      }, sel);
      const zona = zonaComprobador(page);
      await teclearSorteo(page, SORTEO_1410);

      // Acotado al comprobador: el aviso del reparto de la peña usa la misma clase
      const dentro = 'section[aria-labelledby="titulo-comprobador"]';
      for (const [complementario, selector] of [
        ['11', `${dentro} [class*="comprobadorResumen"]`],
        ['45', `${dentro} [class*="comprobadorError"]`],
      ] as const) {
        await escribirCasilla(page, zona.getByLabel('Complementario'), complementario);
        await botonAlPie(page, '[class*="comprobadorBoton"]', 70);
        const b = (await zona.getByRole('button', { name: /Comprobar mis combinaciones/ }).boundingBox())!;
        expect(b.y + b.height).toBeLessThanOrEqual(800); // precondición: el botón se ve
        await zona.getByRole('button', { name: /Comprobar mis combinaciones/ }).click();
        await expect(page.locator(selector)).toHaveCount(1);
        await esperarDesplazamientoQuieto(page);
        const c = await cromo();
        expect(c.pildoraFija).toBe(true); // si no, el caso no probaría nada
        const r = await caja(selector);
        expect(r.top).toBeGreaterThanOrEqual(c.barra);
        expect(r.bottom).toBeLessThanOrEqual(c.pildora); // medido: 737 frente a 745
      }
    });

    for (const vista of [{ width: 1280, height: 800 }, { width: 360, height: 800 }]) {
      test(`${vista.width}×${vista.height}: el ancla #generador-lototurf deja su título por debajo de la barra del logo`, async ({ page }) => {
        await page.setViewportSize(vista);
        // Carga nueva con el ancla, como quien llega por un enlace de fuera
        await page.goto('about:blank');
        await page.goto(`${RUTA}#generador-lototurf`);
        await esperarInteractiva(page);
        await esperarDesplazamientoQuieto(page);
        const medida = await page.evaluate(() => ({
          barra: document.querySelector('[data-barra-logo]')!.getBoundingClientRect().bottom,
          titulo: document.querySelector('#generador-lototurf h2')!.getBoundingClientRect().top,
          alto: window.innerHeight,
        }));
        expect(medida.titulo).toBeGreaterThanOrEqual(medida.barra); // medido: 155 / 92 y 125 / 62
        expect(medida.titulo).toBeLessThan(medida.alto);
      });
    }
  });

  test.describe('hallazgos nuevos de la tanda del 14/10/2026', () => {
    test('REPARADO 3288 (operativa, medio) · con la página traducida, el aviso del reparto que pierde su detalle no tumba la app', async ({ page }) => {
      // Hallazgo 3288. El aviso era <p>{resultado.error}{detalleError}</p>: dos textos sueltos, y
      // el segundo («Revisa lo que pone Persona 4.») desaparecía cuando el error que queda no
      // nombra a nadie. React lo retiraba con removeChild, pero el traductor ya lo había cambiado
      // por <font>: NotFoundError y la pantalla «Algo salió mal». REPARADO: el aviso es una sola
      // cadena, único hijo del <p>, y React la sustituye entera.
      const errores = vigilarErrores(page);
      await esperarInteractiva(page);
      await esperarHidratacion(page, [`${SELECTOR_PENA} input`]);
      await pena(page).getByRole('button', { name: /Añadir persona/ }).click();
      await escribir(page, campoPremio(page), '-5');
      await expect(avisoPena(page)).toHaveText(
        'Revisa las aportaciones: tienen que ser cantidades de 0 € o más. Revisa lo que pone Persona 4.');
      await traducir(page);
      await campoPone(page, 3).fill('5');
      await expect(avisoPena(page)).toHaveText('Indica el premio de cada décimo o apuesta premiados, mayor que 0 €.');
      await sinCaida(page);
      expect(errores).toEqual([]);
    });

    test('REPARADO 3289 (operativa, bajo) · con la página traducida, el botón Generar y la ficha dicen la lotería y la cantidad elegidas', async ({ page }) => {
      // Hallazgo 3289. No caía: se quedaba viejo. El texto que cambia dentro del mismo nodo
      // («Generar {n} … de {lotería}», la descripción, los días y el precio de la ficha) React lo
      // escribía en el nodo que el traductor retiró, y en pantalla seguía el de antes. Medido
      // entonces: elegir Euromillones y 3 dejaba «Generar 1 combinación de La Primitiva» y la
      // ficha de La Primitiva. REPARADO: cada texto variable es el único hijo de su elemento, y
      // React lo sustituye entero (setTextContent) en vez de escribir en un nodo retirado.
      await esperarInteractiva(page);
      await traducir(page);
      await seleccionarLoteria(page, 'euromillones');
      await page.getByRole('button', { name: '3', exact: true }).click();
      await expect(page.locator('[class*="lotteryInfo"] h2')).toHaveText('Euromillones'); // el título sí cambia
      await expect(botonGenerar(page)).toContainText('Generar 3 combinaciones de Euromillones');
      await expect(page.locator('[class*="lotteryInfo"]')).toContainText('5 números del 1 al 50 + 2 Estrellas (1-12)');
      await expect(page.locator('[class*="lotteryInfo"]')).toContainText('Martes y viernes');
      await expect(page.locator('[class*="lotteryInfo"]')).toContainText('2,50 € / apuesta');
      await expect(page.locator('[class*="lotteryInfo"]')).not.toContainText('6 números del 1 al 49');
    });

    test('REPARADO 3289 (operativa, bajo) · con la página traducida, el comprobador y el cupo de guardadas no se quedan viejos', async ({ page }) => {
      // Las otras rutas del hallazgo 3289: la leyenda y el botón del comprobador al cambiar de
      // lotería, y el «llevas N» de las guardadas al quitar una.
      const errores = vigilarErrores(page);
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(PRIMITIVA_1410) });
      const zona = zonaComprobador(page);
      await expect(page.locator('[class*="favoritesCupo"]')).toContainText('llevas 6.');
      await traducir(page);
      await zona.getByRole('button', { name: 'Euromillones', exact: true }).click();
      await expect(zona.locator('legend')).toHaveText('Combinación ganadora de Euromillones');
      await expect(zona.locator('[class*="comprobadorBoton"]')).toHaveText('Comprobar mis combinaciones de Euromillones');
      await traducir(page);
      await page.getByRole('button', { name: /^Quitar la combinación/ }).first().click();
      await expect(page.locator('[class*="favoritesCupo"]')).toContainText('llevas 5.');
      await sinCaida(page);
      expect(errores).toEqual([]);
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Re-inspección 14/10/2026 (tarde) — tras 0293f6ec (hallazgos 3288 y 3289, página traducida:
 * cada texto variable, único hijo de su elemento) y 26e70898. Segmento fiscal, riesgo 1.
 *
 * NORMA — data/fiscal/premios-loterias.ts (DA 33.ª LIRPF, BOE-A-2006-20764): 40.000 € exentos
 * POR décimo o apuesta (ap. 1 y 2), 20 % sobre el exceso (ap. 4 y 6), prorrateo por cuotas. La
 * app lo importa de ahí en page.tsx, RepartoPena.tsx, reparto.ts y metadata.ts (cabo C0124).
 *
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (céntimos por el mayor resto, reparto.ts):
 *   1. Normal — Ana, Bea y Carlos ponen 3 € cada uno; décimos de 35.000 € y 100.000,01 € a 20 €.
 *      Décimo 1: exento 35.000 (todo), retención 0. Décimo 2: exento 40.000, base 60.000,01,
 *      retención 12.000,002 → 12.000,00. Los 5.000 € de exención que el décimo 1 no usa NO pasan
 *      al 2 (si pasaran, la retención sería 11.000). Totales 135.000,01 / 75.000,00 / 12.000,00 /
 *      se cobran 123.000,01. Bruto 13.500.001 c / 3 = 4.500.000,33 c para cada uno: los tres
 *      restos empatan y el céntimo va al primero de la lista → 45.000,01 / 45.000,00 / 45.000,00.
 *      Retención 1.200.000 c / 3 = 4000,00 justos. Le llega 41.000,01 / 41.000,00 / 41.000,00.
 *   2. Límite — (a) el máximo de décimos, 20, de 40.001 € cada uno (peña de partida 10/5/5): base
 *      1 € y retención 0,20 € por décimo; totales 800.020,00 / 800.000,00 / 4,00 / 800.016,00 (con
 *      la exención aplicada una sola vez al total serían 152.004 € de retención). Por persona:
 *      premio 400.010 / 200.005 / 200.005, retención 2,00 / 1,00 / 1,00, le llega 400.008 /
 *      200.004 / 200.004. «Añadir otro décimo» queda deshabilitado en el 20.º.
 *      (b) Comprobador de Euromillones tecleado como lo publica el sorteo, con ceros delante y en
 *      los topes de rango: 03 07 15 49 50 · estrellas 01 y 12. Guardadas 3 7 15 49 50 + 1 12 →
 *      5 + 2 → 1.ª (7 bolas) y 3 7 15 49 50 + 2 11 → 5 + 0 → 3.ª (5 bolas) → «2 de tus 2
 *      combinaciones de Euromillones tienen premio de categoría.»
 *   3. Rechazo — Euromillones: un 51 (va del 1 al 50), «4.» (no es entero), estrella 0 y estrella
 *      13 (van del 1 al 12) y las dos estrellas iguales: un aviso cada uno y ningún veredicto.
 *      Reparto: el precio vacío avisa, marca su campo y no reparte.
 * Los tres casos dieron en el navegador exactamente lo calculado.
 *
 * PÁGINA TRADUCIDA (cabo C0243, la app ENTERA con el traductor simulado): 3288 y 3289 se
 * SOSTIENEN — ni NotFoundError ni textos viejos en el botón Generar (5 loterías × 1/3/5/10), la
 * ficha, «Generar números de…», las tarjetas, la estrella, Copiar (resultados y guardadas), el
 * tope de 20 y su aviso, el cupo, el comprobador (con aciertos, sin ellos, de un aviso a otro,
 * cambiando de lotería y quitando guardadas con el resultado a la vista), los totales, la tabla,
 * el desglose y todas las transiciones del aviso del reparto. SÍ se queda viejo un nodo hermano
 * que la reparación no tocó: el rótulo de cada campo de premio, «{texto}<input>» en el mismo
 * <label> (hallazgo nuevo, abajo con test.fail()).
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('re-inspección 14/10/2026 (tarde)', () => {
  const SEL_PENA = 'section[aria-labelledby="pena-titulo"]';
  const penaT = (page: Page) => page.locator(SEL_PENA);
  const premioT = (page: Page, n = 0) => penaT(page).getByLabel(/Premio del décimo o apuesta/).nth(n);
  const poneT = (page: Page, n: number) => penaT(page).getByLabel('Pone (€)').nth(n);
  const nombreT = (page: Page, n: number) => penaT(page).getByLabel('Nombre').nth(n);
  const precioT = (page: Page) => penaT(page).getByLabel('Precio de cada décimo o apuesta (€)');
  const avisoPenaT = (page: Page) => penaT(page).locator('[class*="comprobadorError"]');
  const eurT = (s: string) => `${s} €`;
  const pctT = (s: string) => `${s} %`;
  const T_TARDE = '2026-10-12T10:00:00.000Z';
  const gT = (id: string, type: Modalidad, mainNumbers: number[], extraNumbers: number[]) =>
    ({ id, type, mainNumbers, extraNumbers, timestamp: T_TARDE });

  async function escribirT(page: Page, campo: Locator, valor: string) {
    await campo.fill(valor);
    await esperarValorEnReact(page, campo, valor);
  }
  const totalesT = (page: Page) => penaT(page).locator('[class*="penaTotales"] > div').evaluateAll((divs) =>
    divs.map((d) => [d.querySelector('dt')?.textContent ?? '', d.querySelector('dd')?.textContent ?? '']));
  const filasT = (page: Page) => penaT(page).locator('tbody tr').evaluateAll((trs) =>
    trs.map((tr) => [
      tr.querySelector('th')?.textContent ?? '',
      ...Array.from(tr.querySelectorAll('td')).map((td) => td.textContent ?? ''),
    ]));
  /** Texto del <label> de cada campo de premio (el rótulo visible y el nombre accesible del input). */
  const rotulosPremio = (page: Page) => penaT(page).getByLabel(/Premio del décimo o apuesta/).evaluateAll((ins) =>
    ins.map((i) => ((i as HTMLInputElement).labels?.[0]?.textContent ?? '').replace(/\s+/g, ' ').trim()));

  /** El traductor del navegador, como en los bloques del 13/10 y del 14/10: cada texto a <font><font>…. */
  const traducirT = (page: Page) =>
    page.evaluate(() => {
      const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const padre = n.parentElement;
          if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
          if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodos: Text[] = [];
      while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
      for (const nodo of nodos) {
        const exterior = document.createElement('font');
        const interior = document.createElement('font');
        interior.textContent = nodo.nodeValue;
        exterior.appendChild(interior);
        nodo.parentNode?.replaceChild(exterior, nodo);
      }
    });
  function erroresT(page: Page): string[] {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
    });
    return errores;
  }
  const enPieT = async (page: Page) => {
    await expect(page.getByRole('heading', { name: 'Algo salió mal' })).toHaveCount(0);
    await expect(botonGenerar(page)).toBeVisible();
  };

  test.describe('caso 1 (normal)', () => {
    test('peña 3/3/3 con décimos de 35.000 y 100.000,01 €: la exención que sobra no pasa al otro décimo, y el céntimo empatado va al primero', async ({ page }) => {
      await esperarHidratacion(page, [`${SEL_PENA} input`]);
      await escribirT(page, nombreT(page, 0), 'Ana');
      await escribirT(page, nombreT(page, 1), 'Bea');
      await escribirT(page, nombreT(page, 2), 'Carlos');
      for (let i = 0; i < 3; i++) await escribirT(page, poneT(page, i), '3');
      await escribirT(page, premioT(page, 0), '35.000');
      await penaT(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
      await escribirT(page, premioT(page, 1), '100.000,01');
      // DA 33.ª.1 y .2: exención POR décimo → 35.000 + 40.000; retención (100.000,01 − 40.000) × 20 %
      await expect.poll(() => totalesT(page)).toEqual([
        ['Premio íntegro', eurT('135.000,01')],
        ['Exento', eurT('75.000,00')],
        [`Retención del ${pctT('20')}`, eurT('12.000,00')],
        ['Lo que se cobra', eurT('123.000,01')],
      ]);
      await expect(penaT(page).locator('[class*="penaResultado"] > p')).toHaveText(
        `Décimo 1: ${eurT('35.000,00')}, retención ${eurT('0,00')} · Décimo 2: ${eurT('100.000,01')}, retención ${eurT('12.000,00')}`);
      // 13.500.001 c entre tres restos iguales: el céntimo, al primero de la lista (Ana)
      expect(await filasT(page)).toEqual([
        ['Ana', eurT('3,00'), eurT('41.000,01'), pctT('33,33'), eurT('45.000,01'), eurT('4000,00')],
        ['Bea', eurT('3,00'), eurT('41.000,00'), pctT('33,33'), eurT('45.000,00'), eurT('4000,00')],
        ['Carlos', eurT('3,00'), eurT('41.000,00'), pctT('33,33'), eurT('45.000,00'), eurT('4000,00')],
      ]);
    });
  });

  test.describe('caso 2 (límite)', () => {
    test('el máximo de 20 décimos de 40.001 €: 0,20 € de retención cada uno, 4,00 € en total, y no deja añadir un 21.º', async ({ page }) => {
      await esperarHidratacion(page, [`${SEL_PENA} input`]);
      const anadir = penaT(page).getByRole('button', { name: /Añadir otro décimo/ });
      for (let i = 1; i < 20; i++) await anadir.click();
      await expect(penaT(page).getByLabel(/Premio del décimo o apuesta/)).toHaveCount(20);
      await expect(anadir).toBeDisabled(); // MAX_PREMIOS = 20
      for (let i = 0; i < 20; i++) await escribirT(page, premioT(page, i), '40.001');
      // 20 × (40.001 − 40.000) × 20 % = 4,00 € (con la exención una sola vez al total: 152.004 €)
      await expect.poll(() => totalesT(page)).toEqual([
        ['Premio íntegro', eurT('800.020,00')],
        ['Exento', eurT('800.000,00')],
        [`Retención del ${pctT('20')}`, eurT('4,00')],
        ['Lo que se cobra', eurT('800.016,00')],
      ]);
      expect(await filasT(page)).toEqual([
        ['Persona 1', eurT('10,00'), eurT('400.008,00'), pctT('50,00'), eurT('400.010,00'), eurT('2,00')],
        ['Persona 2', eurT('5,00'), eurT('200.004,00'), pctT('25,00'), eurT('200.005,00'), eurT('1,00')],
        ['Persona 3', eurT('5,00'), eurT('200.004,00'), pctT('25,00'), eurT('200.005,00'), eurT('1,00')],
      ]);
      const desglose = penaT(page).locator('[class*="penaResultado"] > p span');
      await expect(desglose).toHaveCount(20);
      await expect(desglose).toHaveText(Array.from({ length: 20 }, (_, i) =>
        `${i > 0 ? '· ' : ''}Décimo ${i + 1}: ${eurT('40.001,00')}, retención ${eurT('0,20')}`));
    });

    test('Euromillones tecleado con ceros delante y en los topes (50 y estrella 12): 1.ª y 3.ª', async ({ page }) => {
      await sembrarYRecargar(page, {
        [CLAVE_FAVORITAS]: JSON.stringify([
          gT('x1', 'euromillones', [3, 7, 15, 49, 50], [1, 12]),
          gT('x2', 'euromillones', [3, 7, 15, 49, 50], [2, 11]),
        ]),
      });
      const zona = zonaComprobador(page);
      const numeros = ['03', '07', '15', '49', '50'];
      for (let i = 0; i < 5; i++) await escribirCasilla(page, zona.getByLabel(`Número ${i + 1} de la combinación ganadora`), numeros[i]);
      await escribirCasilla(page, zona.getByLabel('Estrella 1'), '01');
      await escribirCasilla(page, zona.getByLabel('Estrella 2'), '12');
      await zona.getByRole('button', { name: 'Comprobar mis combinaciones de Euromillones' }).click();
      await expect(zona.locator('[class*="comprobadorError"]')).toHaveCount(0);
      await expect(zona.locator('[class*="comprobadorResumen"]')).toHaveText(
        '2 de tus 2 combinaciones de Euromillones tienen premio de categoría.');
      await expect(zona.locator('[class*="comprobadaVeredicto"]')).toHaveText([
        '1.ª categoría (5 aciertos + 2 estrellas)',
        '3.ª categoría (5 aciertos)',
      ]);
      expect(await zona.locator('ul li').evaluateAll((lis) =>
        lis.map((li) => li.querySelectorAll('[class*="bolaAcertada"]').length))).toEqual([7, 5]);
    });
  });

  test.describe('caso 3 (rechazo)', () => {
    test('Euromillones: un 51, «4.», estrella 0 o 13 y dos estrellas iguales avisan sin veredicto', async ({ page }) => {
      await sembrarYRecargar(page, {
        [CLAVE_FAVORITAS]: JSON.stringify([gT('x1', 'euromillones', [3, 7, 15, 49, 50], [1, 12])]),
      });
      const zona = zonaComprobador(page);
      const boton = zona.getByRole('button', { name: 'Comprobar mis combinaciones de Euromillones' });
      // Mensajes de validarSorteo (comprobar.ts): rango 1-50, estrellas 1-12, sin repetir
      const casos: Array<[string[], [string, string], string]> = [
        [['51', '07', '15', '49', '50'], ['01', '12'], 'El número 1 (51) está fuera de rango: va del 1 al 50.'],
        [['03', '4.', '15', '49', '50'], ['01', '12'], 'Falta el número 2 de la combinación ganadora, o no es un número entero.'],
        [['03', '07', '15', '49', '50'], ['0', '12'], 'Estrellas: 0 está fuera de rango, va del 1 al 12.'],
        [['03', '07', '15', '49', '50'], ['5', '5'], 'Las dos estrellas no pueden ser la misma: el 5 está repetido.'],
        [['03', '07', '15', '49', '50'], ['1', '13'], 'Estrellas: 13 está fuera de rango, va del 1 al 12.'],
      ];
      for (const [numeros, [e1, e2], aviso] of casos) {
        for (let i = 0; i < 5; i++) await escribirCasilla(page, zona.getByLabel(`Número ${i + 1} de la combinación ganadora`), numeros[i]);
        await escribirCasilla(page, zona.getByLabel('Estrella 1'), e1);
        await escribirCasilla(page, zona.getByLabel('Estrella 2'), e2);
        await boton.click();
        await expect(zona.locator('[class*="comprobadorError"]')).toHaveText(aviso);
        await expect(zona.locator('[class*="comprobadaVeredicto"]')).toHaveCount(0);
      }
    });

    test('reparto: el precio vacío avisa, marca su campo y no reparte', async ({ page }) => {
      await esperarHidratacion(page, [`${SEL_PENA} input`]);
      await escribirT(page, premioT(page), '125.000');
      await expect(penaT(page).locator('tbody tr')).toHaveCount(3); // precondición: con 20 € reparte
      await escribirT(page, precioT(page), '');
      await expect(avisoPenaT(page)).toHaveText('Indica lo que costó cada décimo o apuesta, mayor que 0 €.');
      await expect(precioT(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(precioT(page)).toHaveAttribute('aria-describedby', 'pena-error pena-precio-ayuda');
      await expect(penaT(page).locator('tbody tr')).toHaveCount(0);
      await expect(penaT(page).locator('[class*="penaTotales"]')).toHaveCount(0);
    });
  });

  test.describe('página traducida — la app entera (cabo C0243): 3288 y 3289 se sostienen', () => {
    test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

    test('traducida UNA vez: las cinco loterías × 1/3/5/10, la ficha y «Generar números de…» dicen lo elegido', async ({ page }) => {
      const errores = erroresT(page);
      await esperarInteractiva(page);
      await traducirT(page);
      const datos: Record<Modalidad, string[]> = {
        euromillones: ['5 números del 1 al 50 + 2 Estrellas (1-12)', 'Martes y viernes', '2,50 € / apuesta'],
        bonoloto: ['6 números del 1 al 49 + Reintegro (0-9)', 'Lunes a domingo (todos los días)', '0,50 € / apuesta'],
        gordo: ['5 números del 1 al 54 + Clave (0-9)', 'Domingos', '1,50 € / apuesta'],
        lototurf: ['6 números del 1 al 31 + Caballo ganador (1-12)', 'Domingos', '1,00 € / apuesta'],
        primitiva: ['6 números del 1 al 49 + Reintegro (0-9)', 'Lunes, jueves y sábados', '1,00 € / apuesta'],
      };
      const fichaDatos = page.locator('[class*="lotteryInfo"] [class*="infoItem"] > span:not([aria-hidden])');
      for (const tipo of ['euromillones', 'bonoloto', 'gordo', 'lototurf', 'primitiva'] as Modalidad[]) {
        await seleccionarLoteria(page, tipo);
        for (const n of [3, 5, 10, 1] as const) {
          await ponerCantidad(page, n);
          await expect(botonGenerar(page)).toContainText(
            `Generar ${n} ${n > 1 ? 'combinaciones' : 'combinación'} de ${NOMBRE_BOTON[tipo]}`);
        }
        await expect(page.locator('[class*="lotteryInfo"] h2')).toHaveText(NOMBRE_BOTON[tipo]);
        await expect(fichaDatos).toHaveText(datos[tipo]);
      }
      for (const tipo of ['lototurf', 'bonoloto'] as Modalidad[]) {
        await traducirT(page);
        await page.getByRole('button', { name: `Generar números de ${NOMBRE_BOTON[tipo]}` }).click();
        await expect(botonGenerar(page)).toContainText(`Generar 1 combinación de ${NOMBRE_BOTON[tipo]}`);
        await expect(fichaDatos).toHaveText(datos[tipo]);
      }
      await enPieT(page);
      expect(errores).toEqual([]);
    });

    test('guardadas traducidas: el tope de 20 y su aviso, quitar, el cupo y copiar una guardada', async ({ page }) => {
      const errores = erroresT(page);
      const veinte = Array.from({ length: 20 }, (_, i) => gT(`g${i}`, 'primitiva', [1, 2, 3, 4, 5, 10 + i], [i % 10]));
      await sembrarYRecargar(page, { [CLAVE_FAVORITAS]: JSON.stringify(veinte) });
      await traducirT(page);
      await botonGenerar(page).click();
      await expect(page.locator('[class*="resultCard"]')).toHaveCount(1);
      await traducirT(page);
      const estrella = page.locator('[class*="resultCard"]').first().locator('[aria-pressed]');
      await estrella.click();
      await expect(page.locator('[class*="avisoTope"]')).toHaveCount(1); // lista llena: no entra
      await traducirT(page);
      await page.getByRole('button', { name: /^Quitar la combinación/ }).first().click();
      await expect(page.locator('[class*="avisoTope"]')).toHaveCount(0);
      await expect(page.locator('[class*="favoritesCupo"]')).toHaveText('Caben hasta 20: llevas 19.');
      await traducirT(page);
      await estrella.click();
      await expect(estrella).toHaveText('⭐');
      await expect(page.locator('[class*="favoritesCupo"]')).toHaveText('Caben hasta 20: llevas 20.');
      await traducirT(page);
      const guardada = page.locator('[class*="favoriteCard"]').first();
      await guardada.getByRole('button', { name: /^Copiar la combinación guardada/ }).click();
      await expect(guardada.getByText('Copiada')).toBeVisible();
      await traducirT(page);
      await expect(guardada.getByText('Copiada')).toHaveCount(0, { timeout: 8000 });
      await enPieT(page);
      expect(errores).toEqual([]);
    });

    test('comprobador traducido: quitar guardadas con el resultado a la vista, sin aciertos y de un aviso a otro', async ({ page }) => {
      const errores = erroresT(page);
      await sembrarYRecargar(page, {
        [CLAVE_FAVORITAS]: JSON.stringify([
          gT('p1', 'primitiva', [2, 9, 17, 28, 36, 45], [4]),
          gT('p2', 'primitiva', [1, 3, 5, 7, 11, 13], [0]),
          gT('p3', 'primitiva', [2, 9, 17, 40, 41, 42], [7]),
          gT('l1', 'lototurf', [3, 8, 12, 19, 25, 31], [7]),
        ]),
      });
      const zona = zonaComprobador(page);
      const casilla = (n: number) => zona.getByLabel(`Número ${n} de la combinación ganadora`);
      const boton = zona.getByRole('button', { name: /Comprobar mis combinaciones/ });
      const resumen = zona.locator('[class*="comprobadorResumen"]');
      async function primitiva(seis: string[], comp: string, rein: string) {
        for (let i = 0; i < 6; i++) await escribirCasilla(page, casilla(i + 1), seis[i]);
        await escribirCasilla(page, zona.getByLabel('Complementario'), comp);
        await escribirCasilla(page, zona.getByLabel('Reintegro'), rein);
      }
      await traducirT(page);
      // p1 6 + R → especial · p2 0 (el 11 no cuenta) → sin premio · p3 3 → 5.ª
      await primitiva(['2', '9', '17', '28', '36', '45'], '11', '4');
      await boton.click();
      await expect(resumen).toHaveText('2 de tus 3 combinaciones de La Primitiva tienen premio de categoría; 1 acierta el reintegro.');
      await traducirT(page);
      await page.getByRole('button', { name: 'Quitar la combinación 1, 3, 5, 7, 11, 13 de las guardadas' }).click();
      await expect(resumen).toHaveText('2 de tus 2 combinaciones de La Primitiva tienen premio de categoría; 1 acierta el reintegro.');
      await traducirT(page);
      await primitiva(['20', '21', '22', '23', '24', '25'], '26', '5');
      await boton.click();
      await expect(resumen).toHaveText('Ninguna de tus 2 combinaciones de La Primitiva tiene premio de categoría.');
      await traducirT(page);
      await escribirCasilla(page, casilla(2), '20');
      await boton.click();
      await expect(zona.locator('[class*="comprobadorError"]')).toHaveText('El 20 está repetido en la combinación ganadora: en un sorteo no sale dos veces.');
      await traducirT(page);
      await escribirCasilla(page, casilla(2), '50');
      await boton.click();
      await expect(zona.locator('[class*="comprobadorError"]')).toHaveText('El número 2 (50) está fuera de rango: va del 1 al 49.');
      await traducirT(page);
      // Con Lototurf elegida, quitar su única guardada: vuelve a La Primitiva, sin selector
      await zona.getByRole('button', { name: 'Lototurf', exact: true }).click();
      await expect(zona.locator('legend')).toHaveText('Combinación ganadora de Lototurf');
      await traducirT(page);
      await page.getByRole('button', { name: 'Quitar la combinación 3, 8, 12, 19, 25, 31 de las guardadas' }).click();
      await expect(zona.locator('legend')).toHaveText('Combinación ganadora de La Primitiva');
      await expect(boton).toHaveText('Comprobar mis combinaciones de La Primitiva');
      await expect(zona.getByRole('group', { name: 'Lotería que quieres comprobar' })).toHaveCount(0);
      await enPieT(page);
      expect(errores).toEqual([]);
    });

    test('reparto traducido: el aviso pasa por persona, premio sin detalle, precio, suma 0 y nombre sin caer ni quedarse viejo', async ({ page }) => {
      const errores = erroresT(page);
      await esperarInteractiva(page);
      await esperarHidratacion(page, [`${SEL_PENA} input`]);
      await traducirT(page);
      await escribirT(page, premioT(page), '30.000');
      await expect.poll(() => totalesT(page)).toContainEqual([`Retención del ${pctT('20')}`, eurT('0,00')]);
      await traducirT(page);
      await escribirT(page, premioT(page), '125.000');
      await expect.poll(() => totalesT(page)).toContainEqual([`Retención del ${pctT('20')}`, eurT('17.000,00')]);
      await traducirT(page);
      await penaT(page).getByRole('button', { name: /Añadir persona/ }).click();
      await expect(avisoPenaT(page)).toHaveText('Revisa las aportaciones: tienen que ser cantidades de 0 € o más. Revisa lo que pone Persona 4.');
      await traducirT(page);
      await escribirT(page, premioT(page), 'abc');
      await escribirT(page, poneT(page, 3), '0');
      await expect(avisoPenaT(page)).toHaveText('Indica el premio de cada décimo o apuesta premiados, mayor que 0 €.');
      await traducirT(page);
      await escribirT(page, premioT(page), '125.000');
      await escribirT(page, precioT(page), '0');
      await expect(avisoPenaT(page)).toHaveText('Indica lo que costó cada décimo o apuesta, mayor que 0 €.');
      await traducirT(page);
      await escribirT(page, precioT(page), '20');
      for (let i = 0; i < 4; i++) await escribirT(page, poneT(page, i), '0');
      await expect(avisoPenaT(page)).toHaveText('Indica lo que puso cada persona: ahora la peña suma 0 €.');
      await traducirT(page);
      await escribirT(page, poneT(page, 0), '-2');
      await expect(avisoPenaT(page)).toHaveText('Revisa las aportaciones: tienen que ser cantidades de 0 € o más. Revisa lo que pone Persona 1.');
      await traducirT(page);
      await escribirT(page, nombreT(page, 0), 'Ana');
      await expect(avisoPenaT(page)).toHaveText('Revisa las aportaciones: tienen que ser cantidades de 0 € o más. Revisa lo que pone Ana.');
      await traducirT(page);
      await escribirT(page, poneT(page, 0), '10');
      await expect(avisoPenaT(page)).toHaveCount(0);
      await expect(penaT(page).locator('tbody tr th').first()).toHaveText('Ana');
      // La ayuda del precio: 0,25 → 20.000 € exentos; 0,3 → 40.000 × 0,3 / 0,50 = 24.000
      await traducirT(page);
      await escribirT(page, precioT(page), '0,25');
      await expect(penaT(page).locator('#pena-precio-ayuda')).toContainText('tiene 20.000,00 € exentos');
      await traducirT(page);
      await escribirT(page, precioT(page), '0,3');
      await expect(penaT(page).locator('#pena-precio-ayuda')).toContainText('tiene 24.000,00 € exentos');
      await expect(penaT(page).locator('#pena-precio-ayuda')).not.toContainText('20.000,00');
      await enPieT(page);
      expect(errores).toEqual([]);
    });

    test('ABIERTO 3303 (operativa, bajo) · traducida, el rótulo de cada campo de premio sigue la numeración al añadir y quitar décimos', async ({ page }) => {
      // Hallazgo nuevo de esta re-inspección. El rótulo del campo es «{texto}<input>» dentro del
      // mismo <label> (RepartoPena.tsx): el texto no es el único hijo, así que con la página
      // traducida React escribe el número nuevo en el nodo que el traductor retiró y el rótulo
      // (que es también el nombre accesible del campo) se queda con el de antes. Medido: al añadir
      // un 2.º décimo el 1.º sigue «Premio del décimo o apuesta (€)»; con tres y quitado el 1.º,
      // los dos que quedan dicen «2» y «3», y el aviso «Revisa el premio del décimo o apuesta 2.»
      // marca el campo rotulado «3». Sin traducir, el mismo flujo numera bien.
      test.fail();
      await esperarInteractiva(page);
      await esperarHidratacion(page, [`${SEL_PENA} input`]);
      await escribirT(page, premioT(page, 0), '125.000');
      await traducirT(page);
      await penaT(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
      await expect(penaT(page).getByLabel(/Premio del décimo o apuesta/)).toHaveCount(2);
      expect(await rotulosPremio(page)).toEqual(['Premio del décimo o apuesta 1 (€)', 'Premio del décimo o apuesta 2 (€)']);
      await escribirT(page, premioT(page, 1), '50.000');
      await penaT(page).getByRole('button', { name: /Añadir otro décimo/ }).click();
      await escribirT(page, premioT(page, 2), '-1');
      await traducirT(page);
      await penaT(page).getByRole('button', { name: 'Quitar el premio 1' }).click();
      await expect(avisoPenaT(page)).toHaveText(
        'Indica el premio de cada décimo o apuesta premiados, mayor que 0 €. Revisa el premio del décimo o apuesta 2.');
      expect(await rotulosPremio(page)).toEqual(['Premio del décimo o apuesta 1 (€)', 'Premio del décimo o apuesta 2 (€)']);
      // El campo que el aviso señala (aria-invalid) es el que se rotula «2»
      expect(await penaT(page).locator('input[aria-invalid="true"]').evaluateAll((ins) =>
        ins.map((i) => ((i as HTMLInputElement).labels?.[0]?.textContent ?? '').replace(/\s+/g, ' ').trim())))
        .toEqual(['Premio del décimo o apuesta 2 (€)']);
    });
  });
});
