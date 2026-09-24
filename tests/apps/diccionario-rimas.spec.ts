import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — diccionario-rimas (segmento interactiva, riesgo 3)
 *
 * Generado por /inspector el 24/09/2026. Primera inspección.
 *
 * La app promete en su <h1> «Diccionario de Rimas» y en su subtítulo «Rima consonante y
 * asonante calculadas por sonido, no por letras, sobre 87.000 palabras del español». Su
 * metadata añade «comparación fonética: b=v, c=qu, g=j, ll=y, h muda» y su bloque educativo
 * fija las reglas: la rima empieza en la vocal tónica; consonante = todos los sonidos desde
 * ella; asonante = solo las vocales (las consonantes van en su pestaña, no en esta).
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/diccionario-rimas/rimas.ts          → escandirPalabra (núcleo desde la tónica),
 *                                             aFonemas (clave consonante), claveAsonante
 *   app/contador-silabas/silabeo.ts         → separarSilabas (diptongos, hiatos)
 *   app/contador-silabas/metrica.ts         → acentuacionDe (aguda/llana/esdrújula)
 *   app/diccionario-rimas/page.tsx          → solo pinta; filtra y ordena lo del motor
 *   Tests unitarios del motor: tests/rimas.spec.ts
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — «camino»
 *       ca-mi-no: acaba en vocal y no lleva tilde → llana, tónica «mi».
 *       Núcleo desde la vocal tónica: «-ino». Consonante /ino/, asonante i-o.
 *       Consonante: DEBEN salir destino, vecino, molino (todas -ino); NO camina (-ina) ni
 *       caminó (aguda, -ó).
 *       Asonante: DEBEN salir río (rí-o, hiato, i-o), libro (i-o); NO destino (ya es
 *       consonante: la app la manda a la otra pestaña) ni camisa (i-a).
 *
 *   CASO 2 (límite) — la «u» muda de «gue» y el hiato de «día»
 *       pliegue → plie-gue, llana; en el diptongo «ie» manda la fuerte → tónica «e».
 *           Núcleo «-egue», que suena /eɣe/: la «u» de «gue» NO suena y la «g» ante esa
 *           «e» es la «g» suave, NO la jota. Consonante con despliegue, repliegue, llegue
 *           (/eɣe/); NO con hereje, eje, fleje, esqueje (/exe/: jota). Esas cuatro son
 *           asonantes (e-e) y deben salir en la pestaña ASONANTE.
 *       día  → dí-a: la tilde sobre la débil rompe el diptongo (hiato), llana, tónica «dí»,
 *           núcleo «-ía». Consonante con vía, guía, fría.
 *
 *   CASO 3 (entrada sucia / rechazo) — «CAMIÓN », «123» y «   »
 *       «CAMIÓN » → la app baja a minúsculas y recorta: ca-mión, aguda (tilde en la última),
 *           núcleo «-ón»; consonante con avión y canción, y sin repetir la propia camión.
 *       «123» → no hay ni una letra: no hay palabra que escandir. Esperado: un aviso que lo
 *           diga, no una pantalla que se queda igual que antes de escribir.
 *       «   » → nada que buscar, y sin inventar resultado.
 *
 * HALLAZGOS (24/09/2026), documentados con test.fail() para que se pongan en verde al
 * repararlos:
 *   A. aFonemas() convierte primero «gue/gui» en «ge/gi» y DESPUÉS aplica «g ante e/i = jota»,
 *      así que la «u» muda se pierde dos veces: «pliegue» sale /plieXe/ y rima en consonante
 *      con hereje, eje, fleje, deje, esqueje… (15 de sus 24 consonantes son falsas), y esas
 *      desaparecen de su pestaña asonante. Afecta a las 83 entradas del índice con «gue/gui»
 *      tras la vocal tónica (albergue → conserje, merengue → alquequenje, águila → 0 rimas).
 *   B. «123» (o cualquier entrada sin letras) no produce ningún aviso: la búsqueda devuelve
 *      null y la pantalla se queda como si no se hubiera escrito nada.
 */

const RUTA = '/diccionario-rimas/';

/** Carga la página y espera a que el diccionario esté indexado (el input está deshabilitado hasta entonces). */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#palabra']);
  await expect(page.locator('#estado-diccionario')).toContainText('Listo', { timeout: 60000 });
  await expect(page.locator('#palabra')).toBeEnabled();
}

async function buscar(page: Page, palabra: string): Promise<void> {
  await page.locator('#palabra').fill(palabra);
  await esperarValorEnReact(page, '#palabra', palabra);
}

async function pestana(page: Page, tipo: 'consonante' | 'asonante'): Promise<void> {
  const tab = page.getByRole('tab', { name: new RegExp(`Rima ${tipo}`) });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
}

const resultado = (page: Page) => page.locator('section[aria-live="polite"]');

/** Las palabras pintadas en la lista (inicio + núcleo resaltado, sin el contador de sílabas). */
async function palabrasVisibles(page: Page): Promise<string[]> {
  return resultado(page)
    .locator('li')
    .evaluateAll((lis) =>
      lis.map((li) => `${li.children[0]?.textContent ?? ''}${li.children[1]?.textContent ?? ''}`),
    );
}

test.describe('diccionario-rimas — caso 1: palabra llana «camino»', () => {
  test('escande ca-mi-no, llana, rima desde -ino', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'camino');
    // A mano: ca-mi-no, llana, tónica «mi», núcleo «-ino»
    await expect(resultado(page).locator('[class*="silabaTonica"]')).toHaveText('mi');
    await expect(resultado(page)).toContainText('3 sílabas · llana · rima desde -ino');
  });

  test('consonante: destino, vecino y molino sí; camina y caminó no', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'camino');
    await pestana(page, 'consonante');
    const lista = await palabrasVisibles(page);
    for (const w of ['destino', 'vecino', 'molino']) expect(lista, `falta ${w} (-ino)`).toContain(w);
    for (const w of ['camina', 'caminó', 'camino']) expect(lista, `sobra ${w}`).not.toContain(w);
  });

  test('asonante: río y libro (i-o) sí; destino (consonante) y camisa (i-a) no', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'camino');
    await pestana(page, 'asonante');
    const lista = await palabrasVisibles(page);
    // río: rí-o es hiato, llana → i-o; libro → i-o
    for (const w of ['río', 'libro']) expect(lista, `falta ${w} (i-o)`).toContain(w);
    // destino rima en consonante: la app declara que esas van en la otra pestaña
    for (const w of ['destino', 'camisa']) expect(lista, `sobra ${w}`).not.toContain(w);
  });
});

test.describe('diccionario-rimas — caso 2: «u» muda de «gue» e hiato de «día»', () => {
  test('pliegue: escande plie-gue, llana, desde -egue, y rima con despliegue, repliegue, llegue', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'pliegue');
    await pestana(page, 'consonante');
    // A mano: diptongo «ie», manda la fuerte → tónica «plie», núcleo «-egue»
    await expect(resultado(page).locator('[class*="silabaTonica"]')).toHaveText('plie');
    await expect(resultado(page)).toContainText('2 sílabas · llana · rima desde -egue');
    const lista = await palabrasVisibles(page);
    for (const w of ['despliegue', 'repliegue', 'llegue']) expect(lista, `falta ${w} (/eɣe/)`).toContain(w);
  });

  // HALLAZGO A (24/09/2026): aFonemas() aplica «gue → ge» y luego «ge → xe» (jota), y la
  // «u» muda desaparece: hereje, eje, fleje y esqueje salen como CONSONANTES de pliegue.
  // Hoy: 24 consonantes, 15 con jota. Quitar test.fail() al reparar aFonemas().
  test.fail('pliegue: hereje, eje, fleje y esqueje NO riman en consonante (jota ≠ g suave)', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'pliegue');
    await pestana(page, 'consonante');
    const lista = await palabrasVisibles(page);
    for (const w of ['hereje', 'eje', 'fleje', 'esqueje']) {
      expect(lista, `${w} (/exe/) no rima en consonante con pliegue (/eɣe/)`).not.toContain(w);
    }
  });

  // HALLAZGO A, cara asonante: como el motor las cree consonantes, las excluye de la pestaña
  // asonante, que es donde van (e-e). Quitar test.fail() al reparar aFonemas().
  test.fail('pliegue: hereje y eje salen en la pestaña ASONANTE (e-e)', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'pliegue');
    await pestana(page, 'asonante');
    await expect(resultado(page)).toContainText('que riman en asonante con');
    // Asonantes de pliegue: ~3.850, más que las 300 que se pintan de golpe; se piden todas
    await resultado(page).getByRole('button', { name: /^Ver las / }).click();
    const lista = await palabrasVisibles(page);
    for (const w of ['hereje', 'eje', 'fleje']) expect(lista, `falta ${w} (e-e)`).toContain(w);
  });

  test('día: hiato dí-a, llana, desde -ía; rima con vía, guía y fría', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'día');
    await pestana(page, 'consonante');
    // A mano: la tilde en la débil rompe el diptongo → dí-a, tónica «dí», núcleo «-ía»
    await expect(resultado(page).locator('[class*="silabaTonica"]')).toHaveText('dí');
    await expect(resultado(page)).toContainText('2 sílabas · llana · rima desde -ía');
    const lista = await palabrasVisibles(page);
    for (const w of ['vía', 'guía', 'fría']) expect(lista, `falta ${w} (-ía)`).toContain(w);
  });
});

test.describe('diccionario-rimas — caso 3: entrada sucia o sin letras', () => {
  test('«CAMIÓN » se normaliza: ca-mión, aguda, -ón, sin rimar consigo misma', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'CAMIÓN ');
    await pestana(page, 'consonante');
    await expect(resultado(page).locator('[class*="silabaTonica"]')).toHaveText('mión');
    await expect(resultado(page)).toContainText('2 sílabas · aguda · rima desde -ón');
    await expect(resultado(page)).toContainText('que riman en consonante con camión');
    const lista = await palabrasVisibles(page);
    for (const w of ['avión', 'canción']) expect(lista, `falta ${w} (-ón)`).toContain(w);
    expect(lista).not.toContain('camión');
  });

  test('solo espacios: no se inventa ningún resultado', async ({ page }) => {
    await abrir(page);
    await buscar(page, '   ');
    await expect(resultado(page)).toHaveCount(0);
    await expect(page.getByText(/\bNaN\b/)).toHaveCount(0);
  });

  // HALLAZGO B (24/09/2026): «123» no contiene ninguna letra; escandirPalabra() devuelve null
  // y la app no dice nada — la pantalla queda igual que antes de escribir. Esperado: un aviso
  // que diga que la entrada no es una palabra. Quitar test.fail() al añadirlo.
  test.fail('«123» avisa de que no hay ninguna palabra que buscar', async ({ page }) => {
    await abrir(page);
    await buscar(page, '123');
    const aviso = page
      .locator('#estado-diccionario, [role="alert"]:not(#__next-route-announcer__), section[aria-live="polite"]')
      .filter({ hasText: /letra|palabra v[aá]lida|no (es|contiene) una palabra/i });
    await expect(aviso.first()).toBeVisible();
  });
});
