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
 *
 * REINSPECCIÓN (25/09/2026, tras 20ecb78f y 3de61f3c): 1308 y 1309 verificados en el
 * navegador. Casos nuevos por la cadena reordenada de aFonemas y por el aviso «sin vocales»
 * en los bloques «Reinspección 25/09/2026» del final.
 *
 * REINSPECCIÓN (29/09/2026, tras 9542485e y los arreglos del logo fijo d056b066 y a1d72a9c):
 * 1308, 1309, 2163 y 2164 siguen reparados; el logo ya no pisa el título de 320 a 1.280 px.
 * Casos nuevos (aguda en vocal, esdrújula, hiato, diptongo decreciente, -agüe/-ague, seseo,
 * cada rima mostrada contrastada con un algoritmo propio) y la sospecha de Intro, en los
 * bloques «Reinspección 29/09/2026» del final.
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

// Desde la reparación de 2164 la sección del resultado ya no es región viva (anunciaba la
// lista entera): se localiza por su id, y el anuncio del recuento vive en #anuncio-resultado.
const resultado = (page: Page) => page.locator('#resultado-rimas');
// Desde la reparación de 2163 el aviso de entrada es cortés (role="status") y no asertivo.
const avisoEntrada = (page: Page) => page.locator('#aviso-entrada');

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
      .locator('#estado-diccionario, #aviso-entrada, #resultado-rimas')
      .filter({ hasText: /letra|palabra v[aá]lida|no (es|contiene) una palabra/i });
    await expect(aviso.first()).toBeVisible();
  });
});

test.describe('diccionario-rimas — regresión 1309: el aviso limpia el resultado anterior', () => {
  test('«camino» → «!!!»: desaparece la lista y sale el aviso; «camino» otra vez: vuelve y el aviso se va', async ({ page }) => {
    await abrir(page);
    const aviso = avisoEntrada(page)
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

/*
 * SOSPECHA DEL INSPECTOR (24/09/2026), CONFIRMADA Y REPARADA el mismo día:
 * una entrada con letras pero sin ninguna vocal no se podía escandir y la app lo hacía igual.
 * Ejecutado sobre el motor ANTES de la reparación:
 *   escandirPalabra('prr') → { silabas: ['prr'], acentuacion: 'aguda', nucleo: 'prr' }
 * — indiceVocalNuclear() devolvía -1 y el `iv < 0 ? 0` tomaba la palabra entera como núcleo,
 * así que la pantalla decía «1 sílaba · aguda · rima desde -prr». Lo mismo «psst», «mmm», «grr»
 * y las 13 siglas del diccionario que se leen letra a letra (dvd, sms, gps, tnt…).
 *
 * Esperado, a mano: sin vocal no hay sílaba ni núcleo → null, y la app lo dice.
 * La «y» cuenta como vocal (suena /i/): rey → «-ey», muy → «-uy», hoy → «-oy», y la conjunción
 * «y» sigue escandiéndose. Ninguna palabra del diccionario con vocal cambia de núcleo.
 */
test.describe('diccionario-rimas — sospecha: entrada con letras y sin vocales', () => {
  test('motor: «prr», «psst», «mmm», «dvd» no se escanden', () => {
    for (const w of ['prr', 'psst', 'mmm', 'dvd', 'SMS']) {
      expect(escandirPalabra(w), `${w} no tiene núcleo vocálico`).toBeNull();
    }
  });

  test('motor: la «y» cuenta como vocal — rey, muy, hoy, jersey y la conjunción «y»', () => {
    expect(escandirPalabra('rey')?.nucleo).toBe('ey');
    expect(escandirPalabra('muy')?.nucleo).toBe('uy');
    expect(escandirPalabra('hoy')?.nucleo).toBe('oy');
    expect(escandirPalabra('jersey')?.nucleo).toBe('ey');
    expect(escandirPalabra('y')).not.toBeNull();
  });

  test('app: «prr» avisa de que no tiene vocal y no pinta resultado; «rey» vuelve a rimar', async ({ page }) => {
    await abrir(page);
    const aviso = avisoEntrada(page)
      .filter({ hasText: 'ninguna vocal' });

    await buscar(page, 'prr');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('«prr» no tiene ninguna vocal');
    await expect(resultado(page)).toHaveCount(0);
    await expect(page.getByText('rima desde -prr')).toHaveCount(0);

    await buscar(page, 'rey');
    await expect(aviso).toHaveCount(0);
    await expect(resultado(page)).toContainText('rima desde -ey');
    const lista = await palabrasVisibles(page);
    expect(lista, 'rey rima con ley').toContain('ley');
  });

  test('app: una sigla sin vocales («DVD») sugiere escribirla como suena', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'DVD');
    const aviso = avisoEntrada(page)
      .filter({ hasText: 'ninguna vocal' });
    await expect(aviso).toContainText('«DVD» no tiene ninguna vocal');
    await expect(aviso).toContainText('escríbela como suena');
    await expect(resultado(page)).toHaveCount(0);
  });
});

/*
 * REINSPECCIÓN 25/09/2026 — la cadena de sustituciones de aFonemas tras el reorden de 1308.
 * El riesgo de mover una sustitución de sitio es romper OTRA grafía. Resuelto a mano ANTES de
 * ejecutar (fonología del español estándar; convención de la app: distinción c/z ≠ s por
 * defecto, con interruptor de seseo, y yeísmo siempre):
 *
 *   pingüino  pin-güi-no («üi»: dos cerradas distintas → diptongo; manda la segunda, la i),
 *             llana, núcleo «-ino» → camino, destino, vecino. río y libro solo asuenan (i-o).
 *   cigüeña   ci-güe-ña, llana, «-eña» /eɲa/ → leña, peña, dueña.
 *   La misma sílaba en tres grafías, con las palabras reales del diccionario (grep de
 *   public/data/diccionario-es.txt por -ingüe, -ingue, -inge e -inje; de la última, ninguna):
 *     /iŋgwe/ bilingüe → monolingüe, pingüe, plurilingüe, quinquelingüe, trilingüe
 *     /iŋge/  pringue  → chingue, curiquingue, fuñingue, lingue, pechelingue, pendingue,
 *                         pichelingue, pingue, potingue
 *     /iŋxe/  esfinge  → alfinge, eringe, faringe, laringe, meninge, rinofaringe, siringe, tinge
 *   averigüe  a-ve-ri-güe, llana, «-igüe» /igwe/ → las 8 del diccionario en -igüe (rigüe,
 *             tigüe, coligüe…); NO ligue (/ige/).
 *   guía      guí-a (gu dígrafo; í-a hiato), 2 sílabas, llana, «-ía» → día, vía.
 *   guion     monosílabo (Ortografía de 2010: gu dígrafo + diptongo io), aguda, «-on» →
 *             camión, avión, canción, león.
 *   aguado    a-gua-do (ante a la u SÍ suena: diptongo ua), 3 sílabas, llana, «-ado» → helado,
 *             pasado.
 *   queso     que-so, «-eso» → beso · kilo, ki-lo, «-ilo» → hilo · parque, «-arque» /aɾke/ →
 *             embarque; NO arce (/aɾθe/).
 *   examen    e-xa-men, 3 sílabas, llana (acaba en n), «-amen» → certamen, dictamen, velamen;
 *             NO amén (a-mén: aguda, «-én»). La x cae fuera del núcleo.
 *   búho      bú-ho (la h intercalada no impide el hiato), 2 sílabas, llana, «-úho» /uo/ →
 *             dúo, avalúo; mundo solo asuena (u-o). («continuo» NO: es con-ti-nuo, llana en «ti»;
 *             lo anoté mal a mano y la app acierta.)
 *   hecho     he-cho, «-echo» → pecho, derecho, techo; NO eco.
 *   carro     «-arro» /aro/ (vibrante múltiple) → barro, jarro, tarro; caro («-aro», /aɾo/) NO
 *             en consonante y SÍ en asonante (a-o). Al revés: caro → raro, claro, faro; NO carro.
 */

/** Sílabas de la ficha, con guiones («pin-güi-no»). */
async function silabeo(page: Page): Promise<string> {
  const partes = await resultado(page).locator('[class*="fichaPalabra"] span').allTextContents();
  return partes.join('-');
}

/** Todas las palabras del resultado: pide «Ver las N» si la lista viene recortada a 300. */
async function todasLasPalabras(page: Page): Promise<string[]> {
  const ver = resultado(page).getByRole('button', { name: /^Ver las / });
  if (await ver.count()) {
    const total = Number((await ver.textContent())!.replace(/\D/g, ''));
    await ver.click();
    await expect(resultado(page).locator('li')).toHaveCount(total, { timeout: 15000 });
  }
  return palabrasVisibles(page);
}

async function consultar(page: Page, palabra: string, tipo: 'consonante' | 'asonante', ficha: string): Promise<string[]> {
  await buscar(page, palabra);
  await pestana(page, tipo);
  await expect(resultado(page).locator('[class*="fichaDatos"]')).toContainText(ficha);
  await expect(resultado(page)).toContainText(`que riman en ${tipo} con`);
  return todasLasPalabras(page);
}

test.describe('diccionario-rimas — reinspección 25/09/2026: diéresis y las tres grafías de la g', () => {
  test('pingüino: pin-güi-no, llana, -ino; camino, destino, vecino en consonante', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'pingüino', 'consonante', '3 sílabas · llana · rima desde -ino');
    expect(await silabeo(page)).toBe('pin-güi-no');
    for (const w of ['camino', 'destino', 'vecino']) expect(lista, `falta ${w} (-ino)`).toContain(w);
    for (const w of ['río', 'libro']) expect(lista, `${w} solo asuena (i-o)`).not.toContain(w);
  });

  test('cigüeña: ci-güe-ña, llana, -eña; leña, peña, dueña', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'cigüeña', 'consonante', '3 sílabas · llana · rima desde -eña');
    expect(await silabeo(page)).toBe('ci-güe-ña');
    for (const w of ['leña', 'peña', 'dueña']) expect(lista, `falta ${w} (-eña)`).toContain(w);
  });

  test('/iŋgwe/, /iŋge/ y /iŋxe/ no se mezclan: bilingüe, pringue y esfinge', async ({ page }) => {
    await abrir(page);

    const bilingue = await consultar(page, 'bilingüe', 'consonante', 'rima desde -ingüe');
    for (const w of ['monolingüe', 'pingüe', 'plurilingüe', 'quinquelingüe', 'trilingüe']) {
      expect(bilingue, `falta ${w} (/iŋgwe/)`).toContain(w);
    }
    for (const w of bilingue) expect(w, `${w} no es /iŋgwe/`).toMatch(/ingüe$/);

    const pringue = await consultar(page, 'pringue', 'consonante', 'rima desde -ingue');
    for (const w of ['chingue', 'curiquingue', 'fuñingue', 'lingue', 'pechelingue', 'pendingue', 'pichelingue', 'pingue', 'potingue']) {
      expect(pringue, `falta ${w} (/iŋge/)`).toContain(w);
    }
    for (const w of pringue) expect(w, `${w} no es /iŋge/`).toMatch(/[^ü]ingue$/);

    const esfinge = await consultar(page, 'esfinge', 'consonante', 'rima desde -inge');
    for (const w of ['alfinge', 'eringe', 'faringe', 'laringe', 'meninge', 'rinofaringe', 'siringe', 'tinge']) {
      expect(esfinge, `falta ${w} (/iŋxe/)`).toContain(w);
    }
    for (const w of esfinge) expect(w, `${w} no es /iŋxe/`).toMatch(/inge$/);
  });

  test('averigüe: -igüe con rigüe, tigüe y coligüe; ligue (/ige/) no', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'averigüe', 'consonante', '4 sílabas · llana · rima desde -igüe');
    for (const w of ['rigüe', 'tigüe', 'coligüe']) expect(lista, `falta ${w} (/igwe/)`).toContain(w);
    expect(lista, 'ligue es /ige/: la u no suena').not.toContain('ligue');
    for (const w of lista) expect(w, `${w} no es /igwe/`).toMatch(/igüe$/);
  });
});

test.describe('diccionario-rimas — reinspección 25/09/2026: gu, qu, k, x, h, ch y rr', () => {
  test('guía: guí-a, 2 sílabas, llana, -ía; día y vía', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'guía', 'consonante', '2 sílabas · llana · rima desde -ía');
    expect(await silabeo(page)).toBe('guí-a');
    for (const w of ['día', 'vía']) expect(lista, `falta ${w} (-ía)`).toContain(w);
  });

  test('guion: monosílabo (Ortografía 2010), aguda, -on; camión, avión, canción, león', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'guion', 'consonante', '1 sílaba · aguda · rima desde -on');
    for (const w of ['camión', 'avión', 'canción', 'león']) expect(lista, `falta ${w} (-ón)`).toContain(w);
  });

  test('aguado: a-gua-do (la u suena ante a), llana, -ado; helado y pasado', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'aguado', 'consonante', '3 sílabas · llana · rima desde -ado');
    expect(await silabeo(page)).toBe('a-gua-do');
    for (const w of ['helado', 'pasado']) expect(lista, `falta ${w} (-ado)`).toContain(w);
  });

  test('qu, k y c: queso con beso, kilo con hilo, parque con embarque y no con arce', async ({ page }) => {
    await abrir(page);
    expect(await consultar(page, 'queso', 'consonante', 'rima desde -eso'), 'queso /eso/ = beso').toContain('beso');
    expect(await consultar(page, 'kilo', 'consonante', 'rima desde -ilo'), 'kilo /ilo/ = hilo').toContain('hilo');
    const parque = await consultar(page, 'parque', 'consonante', 'rima desde -arque');
    expect(parque, 'parque /aɾke/ = embarque').toContain('embarque');
    expect(parque, 'arce es /aɾθe/').not.toContain('arce');
  });

  test('examen: e-xa-men, llana, -amen; certamen, dictamen, velamen; amén (aguda) no', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'examen', 'consonante', '3 sílabas · llana · rima desde -amen');
    expect(await silabeo(page)).toBe('e-xa-men');
    for (const w of ['certamen', 'dictamen', 'velamen']) expect(lista, `falta ${w} (-amen)`).toContain(w);
    expect(lista, 'amén es aguda: rima en -én').not.toContain('amén');
  });

  test('búho: bú-ho (hiato con h), llana, -úho /uo/; dúo y avalúo; mundo solo asuena', async ({ page }) => {
    await abrir(page);
    const cons = await consultar(page, 'búho', 'consonante', '2 sílabas · llana · rima desde -úho');
    expect(await silabeo(page)).toBe('bú-ho');
    for (const w of ['dúo', 'avalúo']) expect(cons, `falta ${w} (/uo/)`).toContain(w);
    expect(cons, 'continuo es con-ti-nuo, llana en «ti»').not.toContain('continuo');
    const ason = await consultar(page, 'búho', 'asonante', 'rima desde -úho');
    expect(ason, 'mundo asuena u-o').toContain('mundo');
    expect(ason, 'dúo ya es consonante').not.toContain('dúo');
  });

  test('hecho: -echo con pecho, derecho y techo; eco no', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'hecho', 'consonante', 'rima desde -echo');
    for (const w of ['pecho', 'derecho', 'techo']) expect(lista, `falta ${w} (-echo)`).toContain(w);
    expect(lista, 'eco es /eko/').not.toContain('eco');
  });

  test('carro y caro: rr ≠ r en consonante, iguales en asonante', async ({ page }) => {
    await abrir(page);
    const carro = await consultar(page, 'carro', 'consonante', 'rima desde -arro');
    for (const w of ['barro', 'jarro', 'tarro']) expect(carro, `falta ${w} (/aro/, rr)`).toContain(w);
    for (const w of carro) expect(w, `${w} no lleva rr`).toMatch(/rro$/);

    const caro = await consultar(page, 'caro', 'consonante', 'rima desde -aro');
    for (const w of ['raro', 'claro', 'faro']) expect(caro, `falta ${w} (/aɾo/)`).toContain(w);
    for (const w of caro) expect(w, `${w} lleva rr: no rima en consonante con caro`).not.toMatch(/rro$/);

    const carroAson = await consultar(page, 'carro', 'asonante', 'rima desde -arro');
    expect(carroAson, 'caro asuena a-o con carro').toContain('caro');
  });
});

test.describe('diccionario-rimas — reinspección 25/09/2026: rechazo y rendimiento', () => {
  test('«psst» y «brr» (sin vocal) y «3,14» y «¿?» (sin letras) avisan y no pintan resultado', async ({ page }) => {
    await abrir(page);
    const aviso = avisoEntrada(page);
    for (const [entrada, motivo] of [
      ['psst', 'no tiene ninguna vocal'],
      ['brr', 'no tiene ninguna vocal'],
      ['3,14', 'no contiene ninguna letra'],
      ['¿?', 'no contiene ninguna letra'],
    ] as const) {
      await buscar(page, entrada);
      await expect(aviso, `«${entrada}»`).toContainText(`«${entrada}» ${motivo}`);
      await expect(resultado(page), `«${entrada}» no debe pintar resultado`).toHaveCount(0);
    }
  });

  // Medido el 25/09/2026: «cantar» da 10.114 consonantes (todo infinitivo en -ar). Se pintan
  // 300 en ~20 ms y las 10.114 con «Ver las» en ~0,4 s, con una tarea larga máxima de 254 ms.
  // Los topes de aquí son 10 veces más holgados: vigilan que la página no se congele, no la cifra.
  test('«cantar»: miles de rimas sin congelar la página (300 de golpe, el resto bajo petición)', async ({ page }) => {
    await abrir(page);
    const t0 = Date.now();
    await buscar(page, 'cantar');
    await pestana(page, 'consonante');
    await expect(resultado(page)).toContainText('que riman en consonante con cantar');
    expect(Date.now() - t0, 'hasta pintar el primer resultado').toBeLessThan(3000);
    await expect(resultado(page).locator('li')).toHaveCount(300);

    const ver = resultado(page).getByRole('button', { name: /^Ver las / });
    const total = Number((await ver.textContent())!.replace(/\D/g, ''));
    expect(total, 'cantar tiene miles de rimas en -ar').toBeGreaterThan(5000);
    const t1 = Date.now();
    await ver.click();
    await expect(resultado(page).locator('li')).toHaveCount(total, { timeout: 15000 });
    expect(Date.now() - t1, 'hasta pintar todas').toBeLessThan(5000);
  });
});

/*
 * HALLAZGOS DE LA REINSPECCIÓN (25/09/2026), REPARADOS el 26/09/2026 (9542485e) y
 * comprobados de nuevo en la reinspección del 29/09/2026
 *
 *   C. (2163) El aviso «no tiene ninguna vocal» (3de61f3c) saltaba en la región role="alert"
 *      con la PRIMERA letra de casi cualquier palabra: al teclear «tren», «t» y «tr» no tienen
 *      vocal todavía. role="alert" es asertivo: el lector de pantalla interrumpía el eco del
 *      tecleo para leer dos veces un párrafo de 40 palabras sobre siglas. A mano: una palabra
 *      que se está escribiendo no es una entrada inválida; mientras se teclea «tren» la región
 *      del aviso no debe recibir ningún texto.
 *   D. (2164) La región aria-live="polite" del resultado envolvía la lista entera (300 <li>,
 *      6.153 caracteres con «camino»; 10.114 <li> tras «Ver las» con «cantar»), y se
 *      reemplazaba a cada tecla. Lo que hay que anunciar es el recuento, no cientos de palabras.
 */
/*
 * REPARACIÓN (26/09/2026, hallazgos 2163 y 2164)
 *   C. Los avisos de entrada esperan a que la consulta lleve 800 ms quieta, y su región pasa a
 *      role="status" (cortés): una pista sobre lo escrito no debe cortar el eco del tecleo. El
 *      caso original escuchaba la región role="alert"; como ya no existe, escucha la región
 *      del aviso (#aviso-entrada), que es lo que el lector de pantalla leería. Se añade la
 *      otra mitad: si el usuario SE PARA en «tr», el aviso sí llega.
 *   D. La sección del resultado deja de ser aria-live; un <p role="status"> oculto a la vista
 *      (#anuncio-resultado) anuncia solo el recuento, también con la consulta asentada.
 */
test.describe('diccionario-rimas — reparación de la reinspección 25/09/2026 (2163 y 2164)', () => {
  test('tecleando «tren», la región del aviso no recibe «no tiene ninguna vocal»', async ({ page }) => {
    await abrir(page);
    await page.evaluate(() => {
      const w = window as unknown as { __alertas: string[] };
      w.__alertas = [];
      const regiones = document.querySelectorAll(
        '#aviso-entrada, [role="alert"]:not(#__next-route-announcer__)',
      );
      if (!regiones.length) throw new Error('no está la región del aviso de la app');
      for (const region of regiones) {
        new MutationObserver(() => {
          const t = region.textContent?.trim();
          if (t) w.__alertas.push(t);
        }).observe(region, { childList: true, subtree: true, characterData: true });
      }
    });
    // 150 ms entre teclas: un tecleo normal, por debajo de la pausa de 800 ms
    await page.locator('#palabra').pressSequentially('tren', { delay: 150 });
    await esperarValorEnReact(page, '#palabra', 'tren');
    await expect(resultado(page)).toContainText('rima desde -en');
    const alertas = await page.evaluate(() => (window as unknown as { __alertas: string[] }).__alertas);
    expect(alertas, 'avisos mientras se teclea una palabra válida').toEqual([]);
    await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toHaveCount(0);
  });

  test('si se detiene en «tr», el aviso sí llega (cortés, no asertivo)', async ({ page }) => {
    await abrir(page);
    await page.locator('#palabra').pressSequentially('tr', { delay: 100 });
    await expect(avisoEntrada(page)).toContainText('«tr» no tiene ninguna vocal');
    await expect(avisoEntrada(page)).toHaveAttribute('role', 'status');
  });

  test('la región viva del resultado anuncia el recuento, no la lista de palabras', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'camino');
    await expect(page.getByText('que riman en consonante con camino').first()).toBeVisible();
    // Fuera el contenido de <EducationalSection>: es un componente compartido (también lleva
    // aria-live, con sus 17 <li>) y no se imputa a la app.
    const enRegionViva = await page.evaluate(
      () =>
        [...document.querySelectorAll('[aria-live]:not(#__next-route-announcer__), [role="alert"], [role="status"]')]
          .filter((r) => !String(r.className).includes('EducationalSection'))
          .map((r) => r.querySelectorAll('li').length)
          .reduce((a, b) => a + b, 0),
    );
    expect(enRegionViva, 'palabras de la lista dentro de una región aria-live').toBe(0);
    await expect(page.locator('#anuncio-resultado')).toHaveText(
      /^\d[\d.]* palabras que riman en consonante con camino$/,
    );
  });
});

/*
 * REINSPECCIÓN 29/09/2026 — CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 * Sistema que la app DECLARA (metadata y bloque educativo): la rima empieza en la vocal tónica;
 * b = v, qu = c ante a/o/u = k, g ante e/i = j, h muda, ll = y (yeísmo siempre), distinción
 * c/z ≠ s por defecto con interruptor de seseo; asonante = solo vocales, en esdrújulas la
 * postónica intermedia no cuenta y la i/u átona final vale e/o; la pestaña asonante NO repite
 * las consonantes. Las palabras esperadas están comprobadas en public/data/diccionario-es.txt.
 *
 *   CASO 1 (normal) — «cielo», ejemplo de la propia app
 *     cie-lo: en «ie» manda la fuerte → tónica «cie», llana, núcleo «-elo» /elo/.
 *     Consonante: vuelo, suelo, pelo, hielo (hie-lo), anhelo (h muda), modelo, velo, celo
 *     (/θelo/ → desde la e, /elo/). NO beso ni cuento (e-o: solo asuenan).
 *     Asonante e-o: beso, cuento, verso, puerto (ue → e), negro. NO vuelo (ya es consonante).
 *
 *   CASO 2 (límites)
 *     café   ca-fé, aguda en vocal, núcleo «-é» /e/. Consonante: pie, fe, té, bebé, puré,
 *            chalé, bidé y «que» (qu + e: /ke/ → /e/). NO ley: /ei/ ≠ /e/.
 *            Asonante é (una aguda solo asuena con agudas): ley, pared, mujer, bien, ser, vez.
 *            NO leche (llana e-e).
 *     maní   ma-ní, aguda, «-í» /i/. Consonante: rubí, aquí (qu muda), así, sí, colibrí,
 *            jabalí, bisturí, frenesí, alhelí. NO país (/is/) ni feliz (/iθ/).
 *            Asonante í: feliz, vivir, abril, perfil, nariz, país.
 *     pájaro pá-ja-ro, esdrújula, «-ájaro» /axaro/. En el diccionario no hay otra palabra en
 *            «-ájaro» → 0 consonantes. Asonante á-o (la «a» intermedia no cuenta): campo,
 *            mano, cántaro (á-a-o), párpado (á-a-o), ánimo (á-i-o), caos (ca-os, hiato).
 *            NO área (á-e-a → a-a) ni lágrima (á-i-a → a-a).
 *     país   pa-ís: la tilde en la débil rompe el diptongo (hiato), aguda, «-ís» /is/.
 *            Distinción: anís, gris, lis, tris; NO maíz, raíz, feliz, nariz (/iθ/).
 *            Con seseo /iθ/ = /is/: maíz, raíz, feliz y nariz pasan a consonantes.
 *     baile  diptongo DECRECIENTE «ai»: bai-le, llana, manda la a → «-aile». Consonante: las tres
 *            del diccionario en -aile (fraile, peraile, ciquibaile). Asonante a-e (la i del
 *            diptongo no cuenta): aire, calle, madre, tarde. NO baila (a-a).
 *     desagüe de-sa-güe, llana, «-agüe» /aɣwe/ (con diéresis la u suena): camagüe, enjagüe,
 *            nicaragüe. Frente a embrague em-bra-gue, «-ague» /aɣe/ (u muda): cague, bahague
 *            (ba-ha-gue: la h no separa, a-a es hiato), enjuague, desembrague. Las dos
 *            familias asuenan entre sí (a-e).
 */

const acentuacionFicha = (page: Page) => resultado(page).locator('[class*="fichaDatos"]');

test.describe('diccionario-rimas — reinspección 29/09/2026: caso normal «cielo»', () => {
  test('cie-lo, llana, -elo; consonante vuelo, suelo, pelo, hielo, anhelo, modelo, velo, celo', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'cielo', 'consonante', '2 sílabas · llana · rima desde -elo');
    expect(await silabeo(page)).toBe('cie-lo');
    await expect(resultado(page).locator('[class*="silabaTonica"]')).toHaveText('cie');
    for (const w of ['vuelo', 'suelo', 'pelo', 'hielo', 'anhelo', 'modelo', 'velo', 'celo']) {
      expect(lista, `falta ${w} (/elo/)`).toContain(w);
    }
    for (const w of ['beso', 'cuento', 'cielo']) expect(lista, `sobra ${w}`).not.toContain(w);
  });

  test('asonante e-o: beso, cuento, verso, puerto, negro; vuelo no (ya es consonante)', async ({ page }) => {
    await abrir(page);
    const lista = await consultar(page, 'cielo', 'asonante', 'rima desde -elo');
    for (const w of ['beso', 'cuento', 'verso', 'puerto', 'negro']) expect(lista, `falta ${w} (e-o)`).toContain(w);
    expect(lista, 'vuelo rima en consonante: va en la otra pestaña').not.toContain('vuelo');
  });
});

test.describe('diccionario-rimas — reinspección 29/09/2026: límites de acento', () => {
  test('café (aguda en vocal): -é con pie, fe, té, bebé, puré, chalé, bidé y que; ley no', async ({ page }) => {
    await abrir(page);
    const cons = await consultar(page, 'café', 'consonante', '2 sílabas · aguda · rima desde -é');
    for (const w of ['pie', 'fe', 'té', 'bebé', 'puré', 'chalé', 'bidé', 'que']) expect(cons, `falta ${w} (/e/)`).toContain(w);
    expect(cons, 'ley es /ei/').not.toContain('ley');
    const ason = await consultar(page, 'café', 'asonante', 'rima desde -é');
    for (const w of ['ley', 'pared', 'mujer', 'bien', 'ser', 'vez']) expect(ason, `falta ${w} (é)`).toContain(w);
    expect(ason, 'leche es llana e-e').not.toContain('leche');
  });

  test('maní (aguda en vocal): -í con rubí, aquí, así, colibrí…; país y feliz solo asuenan', async ({ page }) => {
    await abrir(page);
    const cons = await consultar(page, 'maní', 'consonante', '2 sílabas · aguda · rima desde -í');
    for (const w of ['rubí', 'aquí', 'así', 'sí', 'colibrí', 'jabalí', 'bisturí', 'frenesí', 'alhelí']) {
      expect(cons, `falta ${w} (/i/)`).toContain(w);
    }
    for (const w of ['país', 'feliz']) expect(cons, `${w} no es /i/`).not.toContain(w);
    const ason = await consultar(page, 'maní', 'asonante', 'rima desde -í');
    for (const w of ['feliz', 'vivir', 'abril', 'perfil', 'nariz', 'país']) expect(ason, `falta ${w} (í)`).toContain(w);
  });

  test('pájaro (esdrújula): -ájaro sin consonantes; asonante á-o con campo, cántaro, párpado, ánimo, caos', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'pájaro');
    await pestana(page, 'consonante');
    expect(await silabeo(page)).toBe('pá-ja-ro');
    await expect(acentuacionFicha(page)).toContainText('3 sílabas · esdrújula · rima desde -ájaro');
    // A mano: ninguna otra palabra del diccionario acaba en «-ájaro»
    await expect(resultado(page)).toContainText('No hay ninguna palabra que rime en consonante con pájaro');
    const ason = await consultar(page, 'pájaro', 'asonante', 'rima desde -ájaro');
    for (const w of ['campo', 'mano', 'cántaro', 'párpado', 'ánimo', 'caos']) expect(ason, `falta ${w} (a-o)`).toContain(w);
    for (const w of ['área', 'lágrima', 'pájara']) expect(ason, `${w} es a-a`).not.toContain(w);
  });

  test('país (hiato): -ís con anís, gris, lis, tris; maíz, raíz, feliz y nariz solo con seseo', async ({ page }) => {
    await abrir(page);
    const dist = await consultar(page, 'país', 'consonante', '2 sílabas · aguda · rima desde -ís');
    expect(await silabeo(page)).toBe('pa-ís');
    for (const w of ['anís', 'gris', 'lis', 'tris']) expect(dist, `falta ${w} (/is/)`).toContain(w);
    for (const w of ['maíz', 'raíz', 'feliz', 'nariz']) expect(dist, `${w} es /iθ/ con distinción`).not.toContain(w);

    await page.locator('#seseo').check();
    await expect(page.locator('#seseo')).toBeChecked();
    const seseo = await consultar(page, 'país', 'consonante', 'rima desde -ís');
    for (const w of ['anís', 'gris', 'maíz', 'raíz', 'feliz', 'nariz']) expect(seseo, `con seseo falta ${w} (/is/)`).toContain(w);
  });

  test('baile (diptongo decreciente): -aile solo con fraile, peraile y ciquibaile; asonante a-e', async ({ page }) => {
    await abrir(page);
    const cons = await consultar(page, 'baile', 'consonante', '2 sílabas · llana · rima desde -aile');
    expect(await silabeo(page)).toBe('bai-le');
    expect([...cons].sort()).toEqual(['ciquibaile', 'fraile', 'peraile']);
    const ason = await consultar(page, 'baile', 'asonante', 'rima desde -aile');
    for (const w of ['aire', 'calle', 'madre', 'tarde']) expect(ason, `falta ${w} (a-e)`).toContain(w);
    expect(ason, 'baila es a-a').not.toContain('baila');
  });

  test('desagüe (/aɣwe/) frente a embrague (/aɣe/): no riman en consonante, sí asuenan', async ({ page }) => {
    await abrir(page);
    const desague = await consultar(page, 'desagüe', 'consonante', '3 sílabas · llana · rima desde -agüe');
    expect([...desague].sort()).toEqual(['camagüe', 'enjagüe', 'nicaragüe']);
    const embrague = await consultar(page, 'embrague', 'consonante', '3 sílabas · llana · rima desde -ague');
    expect([...embrague].sort()).toEqual(['bahague', 'cague', 'desembrague', 'enjuague']);
    const ason = await consultar(page, 'desagüe', 'asonante', 'rima desde -agüe');
    for (const w of ['embrague', 'enjuague', 'cague']) expect(ason, `${w} asuena a-e con desagüe`).toContain(w);
  });

  test('vaciar el campo: desaparecen el resultado, el aviso y el anuncio', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'camino');
    await expect(resultado(page)).toHaveCount(1);
    await buscar(page, '');
    await expect(resultado(page)).toHaveCount(0);
    await expect(avisoEntrada(page)).toHaveText('');
    await expect(page.locator('#anuncio-resultado')).toHaveText('');
  });
});

/*
 * ALGORITMO PROPIO DE RIMA, independiente de rimas.ts, para contrastar CADA palabra que la app
 * pinta (no solo una muestra): núcleos vocálicos con las reglas de diptongo/hiato de la OLE
 * 2010, tónica por la tilde o por la regla general (vocal, n, s → llana; resto → aguda), cola
 * desde la vocal tónica pasada a fonemas letra a letra, y clave asonante con la regla de las
 * esdrújulas y la i/u átona final. Lo escribí a mano sin mirar el código de la app; contra el
 * diccionario coincide con ella en 191/191 (cielo), 214/214 (café), 50/50 (país), 143/143
 * (país con seseo) y 3/3 (baile), y en asonante pinta las mismas miles.
 * Solo discrepa en las palabras con «y» como única vocal de sílaba (hallazgo de más abajo) y en
 * anglicismos crudos acabados en -y (party, whisky), que no se usan aquí.
 */
const VOC_P = 'aeiouáéíóúü';
const FUERTE_P = 'aeoáéó';
const TILDE_P = 'áéíóú';
const SIN_MARCA: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };
const sinMarca = (c: string): string => SIN_MARCA[c] ?? c;
const esVocalP = (c: string | undefined): boolean => c !== undefined && c !== '' && VOC_P.includes(c);
const anteEI = (c: string | undefined): boolean => c !== undefined && c !== '' && 'eiéí'.includes(c);

interface UnidadP {
  t: string;
  k: 'V' | 'C' | 'H';
  i: number;
}

function unidadesP(w: string): UnidadP[] {
  const u: UnidadP[] = [];
  for (let i = 0; i < w.length; ) {
    const c = w[i];
    const d = w[i + 1];
    if ((c === 'q' || c === 'g') && d === 'u' && anteEI(w[i + 2])) {
      u.push({ t: c + d, k: 'C', i });
      i += 2;
    } else if ((c === 'c' && d === 'h') || (c === 'l' && d === 'l') || (c === 'r' && d === 'r')) {
      u.push({ t: c + d, k: 'C', i });
      i += 2;
    } else if (c === 'h') {
      u.push({ t: 'h', k: 'H', i });
      i += 1;
    } else if (c === 'y') {
      u.push({ t: 'y', k: esVocalP(d) ? 'C' : 'V', i });
      i += 1;
    } else {
      u.push({ t: c, k: esVocalP(c) ? 'V' : 'C', i });
      i += 1;
    }
  }
  return u;
}

function diptongoP(a: string, b: string): boolean {
  const x = a === 'y' ? 'i' : a;
  const y = b === 'y' ? 'i' : b;
  const fx = FUERTE_P.includes(x);
  const fy = FUERTE_P.includes(y);
  if (fx && fy) return false;
  if (!fx && !fy) return sinMarca(x) !== sinMarca(y);
  return !('íú'.includes(x) || 'íú'.includes(y));
}

function nucleosP(w: string): UnidadP[][] {
  const u = unidadesP(w);
  const res: UnidadP[][] = [];
  for (let i = 0; i < u.length; ) {
    if (u[i].k !== 'V') {
      i++;
      continue;
    }
    const n: UnidadP[] = [u[i]];
    let j = i + 1;
    while (j < u.length) {
      const salto = u[j].k === 'H' ? 1 : 0;
      const s = u[j + salto];
      if (!s || s.k !== 'V') break;
      if (!diptongoP(n[n.length - 1].t, s.t) || n.length >= 3) break;
      n.push(s);
      j = j + salto + 1;
    }
    res.push(n);
    i = j;
  }
  return res;
}

/** La vocal que manda en un núcleo: la tildada, la fuerte o la última débil (nunca la «y»). */
function vocalNuclearP(n: UnidadP[]): UnidadP {
  const tildada = n.find((x) => TILDE_P.includes(x.t));
  if (tildada) return tildada;
  const fuerte = n.find((x) => FUERTE_P.includes(x.t));
  if (fuerte) return fuerte;
  const debiles = n.filter((x) => x.t !== 'y');
  return debiles[debiles.length - 1] ?? n[0];
}

interface AnalisisP {
  cola: string;
  ason: string;
}

function analizarP(palabra: string): AnalisisP | null {
  const w = palabra.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
  const nuc = nucleosP(w);
  if (nuc.length === 0) return null;
  let it: number;
  const conTilde = nuc.findIndex((n) => n.some((x) => TILDE_P.includes(x.t)));
  if (conTilde !== -1) it = conTilde;
  else if (nuc.length === 1) it = 0;
  else {
    const ultima = w[w.length - 1];
    it = 'aeiou'.includes(ultima) || ultima === 'n' || ultima === 's' ? nuc.length - 2 : nuc.length - 1;
  }
  const tonica = vocalNuclearP(nuc[it]);
  let vocales = nuc
    .slice(it)
    .map((n, k) => sinMarca(k === 0 ? tonica.t : vocalNuclearP(n).t))
    .map((v) => (v === 'y' ? 'i' : v));
  if (vocales.length >= 3) vocales = [vocales[0], vocales[vocales.length - 1]];
  if (vocales.length > 1) {
    const l = vocales[vocales.length - 1];
    if (l === 'i') vocales[vocales.length - 1] = 'e';
    if (l === 'u') vocales[vocales.length - 1] = 'o';
  }
  return { cola: w.slice(tonica.i), ason: vocales.join('') };
}

function fonemasP(cola: string, seseo: boolean): string {
  let o = '';
  for (let i = 0; i < cola.length; ) {
    const c = cola[i];
    const d = cola[i + 1];
    if (c === 'c' && d === 'h') { o += 'ʧ'; i += 2; continue; }
    if (c === 'l' && d === 'l') { o += 'ʝ'; i += 2; continue; }
    if (c === 'r' && d === 'r') { o += 'R'; i += 2; continue; }
    if (c === 'q' && d === 'u' && anteEI(cola[i + 2])) { o += 'k'; i += 2; continue; }
    if (c === 'g' && d === 'u' && anteEI(cola[i + 2])) { o += 'ɣ'; i += 2; continue; }
    if (c === 'g' && d === 'ü') { o += 'ɣw'; i += 2; continue; }
    if (c === 'g') o += anteEI(d) ? 'x' : 'ɣ';
    else if (c === 'j') o += 'x';
    else if (c === 'c') o += anteEI(d) ? (seseo ? 's' : 'θ') : 'k';
    else if (c === 'z') o += seseo ? 's' : 'θ';
    else if (c === 'x') o += 'ks';
    else if (c === 'h') o += '';
    else if (c === 'v' || c === 'b') o += 'b';
    else if (c === 'w') o += 'u';
    else if (c === 'y') o += esVocalP(d) ? 'ʝ' : 'i';
    else o += sinMarca(c);
    i += 1;
  }
  return o;
}

/** ¿Rima `otra` con `consulta` en el tipo pedido? En asonante, excluye las consonantes (como la app). */
function rimaP(consulta: string, otra: string, tipo: 'consonante' | 'asonante', seseo: boolean): boolean {
  const a = analizarP(consulta);
  const b = analizarP(otra);
  if (!a || !b) return false;
  const consonante = fonemasP(a.cola, seseo) === fonemasP(b.cola, seseo);
  return tipo === 'consonante' ? consonante : !consonante && a.ason === b.ason;
}

test.describe('diccionario-rimas — reinspección 29/09/2026: el algoritmo propio, contra los casos a mano', () => {
  test('cielo/vuelo, café/que, país/maíz (solo con seseo), pájaro/cántaro, desagüe ≠ embrague', () => {
    expect(rimaP('cielo', 'vuelo', 'consonante', false)).toBe(true);
    expect(rimaP('cielo', 'beso', 'asonante', false)).toBe(true);
    expect(rimaP('café', 'que', 'consonante', false)).toBe(true);
    expect(rimaP('café', 'ley', 'consonante', false)).toBe(false);
    expect(rimaP('café', 'ley', 'asonante', false)).toBe(true);
    expect(rimaP('país', 'maíz', 'consonante', false)).toBe(false);
    expect(rimaP('país', 'maíz', 'consonante', true)).toBe(true);
    expect(rimaP('pájaro', 'cántaro', 'asonante', false)).toBe(true);
    expect(rimaP('pájaro', 'área', 'asonante', false)).toBe(false);
    expect(rimaP('desagüe', 'embrague', 'consonante', false)).toBe(false);
    expect(rimaP('desagüe', 'embrague', 'asonante', false)).toBe(true);
    expect(rimaP('pyme', 'sublime', 'consonante', false)).toBe(true);
  });
});

test.describe('diccionario-rimas — reinspección 29/09/2026: cada rima mostrada cumple el tipo pedido', () => {
  // [consulta, pestaña, seseo, texto de la ficha, mínimo de palabras que debe pintar]
  const CASOS: [string, 'consonante' | 'asonante', boolean, string, number][] = [
    ['cielo', 'consonante', false, 'rima desde -elo', 150],
    ['cielo', 'asonante', false, 'rima desde -elo', 5000],
    ['café', 'consonante', false, 'rima desde -é', 150],
    ['maní', 'consonante', false, 'rima desde -í', 200],
    ['maní', 'asonante', false, 'rima desde -í', 1000],
    ['pájaro', 'asonante', false, 'rima desde -ájaro', 5000],
    ['país', 'consonante', false, 'rima desde -ís', 20],
    ['país', 'consonante', true, 'rima desde -ís', 100],
    ['baile', 'asonante', false, 'rima desde -aile', 2000],
    ['taza', 'consonante', true, 'rima desde -aza', 100],
  ];

  for (const [palabra, tipo, seseo, ficha, minimo] of CASOS) {
    test(`«${palabra}» ${tipo}${seseo ? ' con seseo' : ''}: ninguna palabra pintada deja de rimar`, async ({ page }) => {
      await abrir(page);
      if (seseo) {
        await page.locator('#seseo').check();
        await expect(page.locator('#seseo')).toBeChecked();
      }
      const lista = await consultar(page, palabra, tipo, ficha);
      expect(lista.length, `«${palabra}» pinta pocas rimas`).toBeGreaterThanOrEqual(minimo);
      const noRiman = lista.filter((w) => !rimaP(palabra, w, tipo, seseo));
      expect(noRiman, `pintadas como ${tipo} de «${palabra}» sin serlo`).toEqual([]);
      expect(new Set(lista).size, 'palabras repetidas').toBe(lista.length);
    });
  }
});

/*
 * HALLAZGO ABIERTO (29/09/2026) — la «y» como única vocal de la sílaba tónica.
 *
 * escandirPalabra() ya cuenta la «y» como vocal para aceptar la entrada (tieneNucleoVocalico),
 * pero indiceVocalNuclear() no la busca: en «pyme» la sílaba tónica «py» no tiene ninguna vocal
 * de su lista, devuelve -1, y el `iv < 0 ? 0` toma la sílaba ENTERA como inicio del núcleo.
 * A mano: pyme (DLE, «pequeña y mediana empresa») es py-me, llana, se dice /ˈpime/: núcleo
 * «-yme» /ime/, consonante con sublime, mime, anime, arrime; asonante i-e (libre, chisme).
 * La app dice «rima desde -pyme», da 0 consonantes, y en asonante la clave pierde la tónica y
 * se queda en «e»: la empareja con las AGUDAS en é (me, fe, café, pie). Y al revés: «café»
 * (aguda, é) pinta en su pestaña asonante dos llanas, pyme y byte, cuando una aguda solo asuena
 * con agudas. En el diccionario: pyme, byte, klystron y copyright, más 15 anglicismos en -y.
 */
test.describe('diccionario-rimas — reinspección 29/09/2026: la «y» como vocal de la sílaba tónica', () => {
  // ABIERTO — hallazgo de la reinspección del 29/09/2026
  test.fail('«pyme»: py-me, llana, rima desde -yme y consonante con sublime', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'pyme');
    await pestana(page, 'consonante');
    await expect(acentuacionFicha(page)).toContainText('2 sílabas · llana · rima desde -yme', { timeout: 5000 });
    const lista = await palabrasVisibles(page);
    expect(lista, 'sublime es /ime/').toContain('sublime');
  });

  // ABIERTO — mismo hallazgo, visto desde una consulta corriente
  test.fail('«café» asonante (aguda): el filtro «llana» no deja ninguna (hoy deja pyme y byte)', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'café');
    await pestana(page, 'asonante');
    await expect(resultado(page)).toContainText('que riman en asonante con café');
    await resultado(page).getByRole('button', { name: 'llana', exact: true }).click();
    // A mano: una aguda en é solo asuena con agudas → 0 llanas
    await expect(resultado(page)).toContainText('Los filtros dejan fuera', { timeout: 5000 });
  });
});

/*
 * HALLAZGO ABIERTO (29/09/2026) — una frase se pega en una palabra inventada.
 *
 * limpiarEntrada() quita TODO lo que no es letra, espacios incluidos. Con dos palabras —lo que
 * se teclea al buscar rima para un final de verso— la app no avisa ni rima con la última:
 * busca una palabra que no existe. A mano, «canción triste» acaba en «triste» (tris-te, llana,
 * asonante i-e: libre, chisme, firme). La app escande «can-ción-tris-te», la rotula
 * «4 sílabas · esdrújula · rima desde -óntriste» (la tilde de «canción» se lleva el acento) y
 * pinta 1.355 asonantes o-e —coste, poste, hombre— que no asuenan con «triste».
 * Con «corazón roto» el mismo camino da «5 sílabas · esdrújula · rima desde -ónroto» y 0
 * consonantes. Se espera que avise de que busca una sola palabra, o que rime con la última;
 * en ningún caso una lista de rimas de otra vocal.
 */
test.describe('diccionario-rimas — reinspección 29/09/2026: dos palabras en el campo', () => {
  // ABIERTO — hallazgo de la reinspección del 29/09/2026
  test.fail('«canción triste»: ni se rotula esdrújula ni pinta asonantes o-e', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'canción triste');
    await pestana(page, 'asonante');
    await page.waitForTimeout(1000); // la consulta se asienta (800 ms) antes de avisar
    await expect(page.getByText('rima desde -óntriste')).toHaveCount(0, { timeout: 3000 });
    const lista = await palabrasVisibles(page);
    for (const w of ['coste', 'poste']) expect(lista, `${w} es o-e; triste es i-e`).not.toContain(w);
  });
});

/*
 * SOSPECHA DE INTRO (SOSPECHAS.md, 27/09/2026) — medida el 29/09/2026
 *
 * La app no tiene <form>, onKeyDown ni enterKeyHint, así que Intro no hace nada. Pero la
 * búsqueda es EN VIVO: con cada tecla se recalcula, y «luna» pintó su resultado a los 252 ms
 * de la primera tecla sin pulsar nada. Intro no tiene nada que buscar y no recarga ni vacía
 * el campo: la sospecha, tal como estaba escrita, se descarta (primer bloque).
 *
 * Lo que sí queda es su EFECTO en móvil (segundo bloque, ABIERTO): el resultado se pinta debajo
 * de los ejemplos, el estado, las dos pestañas apiladas y el seseo. En un Pixel 7 (412×839) la
 * sección del resultado empieza a 921 px, el recuento a 1.243 y la primera rima a 1.417, con
 * la ventana acabando en 839 y el teclado virtual abierto encima. Tras teclear «camino» lo único
 * que cambia en pantalla es el propio texto; Intro no desplaza, no cierra el teclado ni lleva
 * al resultado (scrollY sigue en 0). Es la forma del 2278 (se teclea, Intro, no pasa nada).
 * En escritorio (1280×900) asoma el principio de la ficha (752 px) y la primera rima queda en
 * 1.082.
 */
test.describe('diccionario-rimas — reinspección 29/09/2026: Intro en escritorio', () => {
  test('la búsqueda es en vivo; Intro no recarga, no navega ni vacía el campo', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'camino');
    await expect(resultado(page)).toContainText('que riman en consonante con camino');
    const recuento = await resultado(page).locator('[class*="recuento"]').textContent();
    let navego = false;
    page.on('framenavigated', () => {
      navego = true;
    });
    await page.locator('#palabra').press('Enter');
    await page.waitForTimeout(500);
    expect(navego, 'Intro no debe recargar la página').toBe(false);
    await expect(page.locator('#palabra')).toHaveValue('camino');
    await expect(resultado(page).locator('[class*="recuento"]')).toHaveText(recuento ?? '');
  });
});

test.describe('diccionario-rimas — reinspección 29/09/2026: Intro en móvil', () => {
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  // ABIERTO — hallazgo de la reinspección del 29/09/2026
  test.fail('tras teclear «camino» y pulsar Intro, el recuento de rimas está a la vista', async ({ page }) => {
    await abrir(page);
    await buscar(page, 'camino');
    await expect(resultado(page)).toContainText('que riman en consonante con camino');
    await page.locator('#palabra').press('Enter');
    await expect(resultado(page).locator('[class*="recuento"]')).toBeInViewport({ timeout: 3000 });
  });
});

/*
 * LOGO FIJO (d056b066, a1d72a9c) — la misma medición que la Ronda (scripts/ronda.mjs,
 * tituloTapado): las cajas del TEXTO del <h1> contra las piezas de la barra fija de MeskeiaLogo.
 * Medido el 29/09/2026: a 320-768 px la barra acaba en 52 y el título empieza en 93-94; de
 * 769 a 1.023, 77 frente a 93; desde 1.024 el título sube a 53 pero, centrado, no llega a las
 * esquinas. 0 solapes a 320, 360, 390, 640, 768, 769, 800, 834, 1.000, 1.023, 1.024 y 1.280.
 */
test.describe('diccionario-rimas — reinspección 29/09/2026: el logo fijo no tapa el título', () => {
  for (const [ancho, alto] of [
    [360, 740],
    [390, 844],
    [800, 1112],
    [834, 1112],
    [1024, 768],
    [1280, 900],
  ]) {
    test(`a ${ancho} px ninguna pieza de la barra pisa las letras del <h1>`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: alto });
      await abrir(page);
      const choque = await page.evaluate(() => {
        const barra = [...document.querySelectorAll('body *')].find((e) => {
          const cs = getComputedStyle(e);
          const r = e.getBoundingClientRect();
          return (
            cs.position === 'fixed' && r.top <= 1 && r.height < 120 && r.width > 300 &&
            e.querySelector('a[href="/"], a[href="https://meskeia.com/"]') !== null
          );
        });
        const h1 = document.querySelector('h1');
        if (!barra || !h1) return 'no se encuentra la barra del logo o el <h1>';
        const rango = document.createRange();
        rango.selectNodeContents(h1);
        const letras = [...rango.getClientRects()].filter((c) => c.width > 0);
        const piezas = [...barra.children].map((c) => c.getBoundingClientRect()).filter((c) => c.width > 0);
        return piezas.some((p) =>
          letras.some((c) => !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom)),
        );
      });
      expect(choque, `a ${ancho} px`).toBe(false);
    });
  }
});
