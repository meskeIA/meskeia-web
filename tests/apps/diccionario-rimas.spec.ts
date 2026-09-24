import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { aFonemas, escandirPalabra } from '../../app/diccionario-rimas/rimas';

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
 * HALLAZGOS (24/09/2026), REPARADOS el mismo día (hallazgos 1308 y 1309 del Inspector):
 *   A. aFonemas() convierte primero «gue/gui» en «ge/gi» y DESPUÉS aplica «g ante e/i = jota»,
 *      así que la «u» muda se pierde dos veces: «pliegue» sale /plieXe/ y rima en consonante
 *      con hereje, eje, fleje, deje, esqueje… (15 de sus 24 consonantes son falsas), y esas
 *      desaparecen de su pestaña asonante. Afecta a las 83 entradas del índice con «gue/gui»
 *      tras la vocal tónica (albergue → conserje, merengue → alquequenje, águila → 0 rimas).
 *   B. «123» (o cualquier entrada sin letras) no produce ningún aviso: la búsqueda devuelve
 *      null y la pantalla se queda como si no se hubiera escrito nada.
 *
 * REPARACIÓN
 *   A. aFonemas() resuelve «ge/gi = jota» ANTES de quitar la u muda de «gue/gui», y «güe/güi»
 *      (la u suena) conserva su marca propia. Casos resueltos a mano en el bloque «Regresión
 *      1308» del final.
 *   B. Región role="alert" siempre montada bajo el buscador: con texto sin letras pinta un
 *      aviso, y como la búsqueda devuelve null, el resultado anterior desaparece.
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

  // HALLAZGO A (1308, reparado 24/09/2026): antes aFonemas() aplicaba «gue → ge» y luego
  // «ge → xe» (jota): hereje, eje, fleje y esqueje salían como CONSONANTES de pliegue
  // (24 consonantes, 15 con jota).
  test('pliegue: hereje, eje, fleje y esqueje NO riman en consonante (jota ≠ g suave)', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'pliegue');
    await pestana(page, 'consonante');
    const lista = await palabrasVisibles(page);
    for (const w of ['hereje', 'eje', 'fleje', 'esqueje']) {
      expect(lista, `${w} (/exe/) no rima en consonante con pliegue (/eɣe/)`).not.toContain(w);
    }
  });

  // HALLAZGO A, cara asonante: cuando el motor las creía consonantes, las excluía de la
  // pestaña asonante, que es donde van (e-e).
  test('pliegue: hereje y eje salen en la pestaña ASONANTE (e-e)', async ({ page }) => {
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

  // HALLAZGO B (1309, reparado 24/09/2026): «123» no contiene ninguna letra; escandirPalabra()
  // devuelve null y antes la app no decía nada.
  test('«123» avisa de que no hay ninguna palabra que buscar', async ({ page }) => {
    await abrir(page);
    await buscar(page, '123');
    const aviso = page
      .locator('#estado-diccionario, [role="alert"]:not(#__next-route-announcer__), section[aria-live="polite"]')
      .filter({ hasText: /letra|palabra v[aá]lida|no (es|contiene) una palabra/i });
    await expect(aviso.first()).toBeVisible();
  });
});

test.describe('diccionario-rimas — regresión 1309: el aviso limpia el resultado anterior', () => {
  test('«camino» → «!!!»: desaparece la lista y sale el aviso; «camino» otra vez: vuelve y el aviso se va', async ({ page }) => {
    await abrir(page);
    const aviso = page
      .locator('[role="alert"]:not(#__next-route-announcer__)')
      .filter({ hasText: 'ninguna letra' });

    await buscar(page, 'camino');
    await expect(resultado(page)).toHaveCount(1);
    await expect(aviso).toHaveCount(0);

    // «!!!»: sin ninguna letra → no hay palabra que escandir
    await buscar(page, '!!!');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('«!!!» no contiene ninguna letra');
    await expect(resultado(page)).toHaveCount(0);

    await buscar(page, 'camino');
    await expect(resultado(page)).toContainText('rima desde -ino');
    await expect(aviso).toHaveCount(0);
  });
});

/*
 * REGRESIÓN 1308 — la g suave de «gue/gui» frente a la jota de «ge/gi», resuelta a mano.
 * Clave con distinción (seseo = false); x = jota, g = g suave, U = u que suena (güe).
 *
 *   sigue    si-gue, llana, tónica «si»          → núcleo «igue»  → u muda   → /ige/
 *   elige    e-li-ge, llana, tónica «li»         → núcleo «ige»   → g+e=jota → /ixe/   ≠ sigue
 *   guerra   gue-rra, llana; en «ue» manda la e  → «erra»         → rr = R   → /eRa/
 *   tierra   tie-rra, llana; en «ie» manda la e  → «erra»         → /eRa/             = guerra
 *   pliegue  → «egue» → /ege/ · hereje → «eje» → /exe/                                ≠
 *   albergue al-ber-gue → «ergue» → /erge/ · desvergue, envergue → /erge/             =
 *            alberge «erge» → /erxe/ · conserje «erje» → /erxe/                       ≠ albergue
 *   bilingüe bi-lin-güe, llana → «ingüe» → la u SÍ suena → /ingUe/
 *            lingue lin-gue → «ingue» → /inge/ · laringe → «inge» → /inxe/          los tres ≠
 *   águila   á-gui-la, esdrújula → «águila» → /agila/ (antes /axila/, como «axila»)
 *
 * Ninguna otra app importa rimas.ts (grep de «diccionario-rimas/rimas» en app/ y lib/: solo
 * page.tsx y tests/rimas.spec.ts), así que la reparación no alcanza a nadie más.
 */
test.describe('diccionario-rimas — regresión 1308: g suave de «gue/gui» ≠ jota', () => {
  const fon = (p: string): string => aFonemas(escandirPalabra(p)!.nucleo, false);

  test('motor: «sigue» NO rima en consonante con «elige»', () => {
    expect(fon('sigue')).toBe('ige');
    expect(fon('elige')).toBe('ixe');
  });

  test('motor: «guerra» SÍ rima en consonante con «tierra»', () => {
    expect(fon('guerra')).toBe('eRa');
    expect(fon('guerra')).toBe(fon('tierra'));
  });

  test('motor: «pliegue» ≠ «hereje»; «albergue» = «envergue» ≠ «conserje»', () => {
    expect(fon('pliegue')).toBe('ege');
    expect(fon('hereje')).toBe('exe');
    expect(fon('albergue')).toBe(fon('envergue'));
    expect(fon('albergue')).not.toBe(fon('conserje'));
    expect(fon('alberge')).toBe(fon('conserje'));
  });

  test('motor: con diéresis la u suena — «bilingüe» ≠ «lingue» ≠ «laringe»', () => {
    expect(escandirPalabra('bilingüe')!.nucleo).toBe('ingüe');
    expect(fon('bilingüe')).toBe('ingUe');
    expect(fon('lingue')).toBe('inge');
    expect(fon('laringe')).toBe('inxe');
  });

  test('motor: «águila» deja de sonar como «axila»', () => {
    expect(fon('águila')).toBe('agila');
    expect(fon('águila')).not.toBe(fon('axila'));
  });

  test('app: «albergue» consonante con desvergue y envergue, sin alberge ni conserje', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'albergue');
    await pestana(page, 'consonante');
    await expect(resultado(page)).toContainText('rima desde -ergue');
    const lista = await palabrasVisibles(page);
    for (const w of ['desvergue', 'envergue']) expect(lista, `falta ${w} (/erge/)`).toContain(w);
    for (const w of ['alberge', 'conserje']) expect(lista, `sobra ${w} (/erxe/, jota)`).not.toContain(w);
  });

  test('app: «guerra» consonante con tierra y sierra', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'guerra');
    await pestana(page, 'consonante');
    // A mano: gue-rra, en «ue» manda la e → núcleo «-erra»
    await expect(resultado(page)).toContainText('2 sílabas · llana · rima desde -erra');
    const lista = await palabrasVisibles(page);
    for (const w of ['tierra', 'sierra']) expect(lista, `falta ${w} (-erra)`).toContain(w);
  });
});
