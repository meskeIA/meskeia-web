import { test, expect, devices, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Conjugador de Verbos — test de regresión de los tiempos compuestos (21/09/2026)
 *
 * La app prometía en su título «Todos los tiempos verbales» y entregaba ocho paradigmas,
 * ninguno compuesto: quien entraba buscando «he cantado» no lo encontraba. Este fichero
 * vigila que lo que el motor calcula LLEGUE A LA PANTALLA, que es lo que el test de motor
 * (tests/conjugacion-compuestos-motor.spec.ts) no puede ver.
 *
 * Los valores esperados están resueltos a mano y no copiados de la app: son paradigmas
 * que cualquier hablante reconoce (he cantado, he dicho, hubiera vuelto) más el futuro de
 * subjuntivo del refrán («adonde fueres, haz lo que vieres»).
 *
 * Los tiempos se piden por su tarjeta, no por texto suelto en la página: «he cantado»
 * aparecería igual si estuviera en un ejemplo del bloque educativo, y eso no probaría que
 * el paradigma se conjuga.
 */

const URL = '/conjugador-verbos/';

/** El buscador de verbos es el testigo de hidratación: sin él, el clic en «Conjugar» se perdería. */
const ENTRADA = 'input[type="text"]';

/** Localiza la tarjeta de un tiempo por su encabezado y devuelve su tabla. */
function tarjetaDeTiempo(page: import('@playwright/test').Page, nombre: string) {
  return page.locator('h3', { hasText: new RegExp(`^${nombre}$`) }).locator('..');
}

async function conjugar(page: import('@playwright/test').Page, verbo: string) {
  const entrada = page.getByPlaceholder('Escribe un verbo en infinitivo...');
  await entrada.fill(verbo);
  await esperarValorEnReact(page, entrada, verbo);
  await page.getByRole('button', { name: 'Conjugar' }).click();
  await expect(page.getByRole('heading', { name: new RegExp(verbo, 'i') }).first()).toBeVisible();
}

test.describe('Los tiempos compuestos llegan a la pantalla', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await esperarHidratacion(page, [ENTRADA]);
  });

  test('cantar: el pretérito perfecto compuesto sale entero y en orden', async ({ page }) => {
    await conjugar(page, 'cantar');
    const tarjeta = tarjetaDeTiempo(page, 'Pretérito Perfecto Compuesto');
    await expect(tarjeta).toBeVisible();
    for (const forma of ['he cantado', 'has cantado', 'ha cantado', 'hemos cantado', 'habéis cantado', 'han cantado']) {
      await expect(tarjeta).toContainText(forma);
    }
  });

  test('cantar: los otros cuatro compuestos de indicativo tienen su tarjeta', async ({ page }) => {
    await conjugar(page, 'cantar');
    await expect(tarjetaDeTiempo(page, 'Pretérito Pluscuamperfecto')).toContainText('había cantado');
    await expect(tarjetaDeTiempo(page, 'Pretérito Anterior')).toContainText('hubo cantado');
    await expect(tarjetaDeTiempo(page, 'Futuro Perfecto')).toContainText('habremos cantado');
    await expect(tarjetaDeTiempo(page, 'Condicional Perfecto')).toContainText('habrían cantado');
  });

  test('el pretérito anterior avisa de que está en desuso', async ({ page }) => {
    await conjugar(page, 'cantar');
    await expect(tarjetaDeTiempo(page, 'Pretérito Anterior')).toContainText('En desuso');
    // Y el aviso NO contamina a un tiempo corriente que comparte raíz de clave.
    await expect(tarjetaDeTiempo(page, 'Futuro Simple')).not.toContainText('Arcaico');
  });

  test('decir: el participio irregular viaja al compuesto', async ({ page }) => {
    await conjugar(page, 'decir');
    await expect(tarjetaDeTiempo(page, 'Pretérito Perfecto Compuesto')).toContainText('he dicho');
  });

  test('subjuntivo: los dos compuestos y el futuro del refrán', async ({ page }) => {
    await conjugar(page, 'ir');
    await page.getByRole('button', { name: 'Subjuntivo' }).click();
    await expect(tarjetaDeTiempo(page, 'Pretérito Perfecto de Subjuntivo')).toContainText('haya ido');
    await expect(tarjetaDeTiempo(page, 'Pluscuamperfecto de Subjuntivo')).toContainText('hubiera ido');
    const futuro = tarjetaDeTiempo(page, 'Futuro de Subjuntivo');
    await expect(futuro).toContainText('fueres');
    await expect(futuro).toContainText('Arcaico');
    await expect(tarjetaDeTiempo(page, 'Futuro Perfecto de Subjuntivo')).toContainText('hubiere ido');
  });

  test('el imperativo sigue intacto tras la ampliación', async ({ page }) => {
    await conjugar(page, 'cantar');
    await page.getByRole('button', { name: 'Imperativo' }).click();
    await expect(tarjetaDeTiempo(page, 'Imperativo Afirmativo')).toContainText('canta');
    await expect(tarjetaDeTiempo(page, 'Imperativo Negativo')).toContainText('no cantes');
  });
});

/* =====================================================================================
 * Inspección del 11/11/2026 (primera, con firma de rotura: 85 % de visitas cortas y 11,7 %
 * de recargas en 60 visitas).
 *
 * Los esperados están resueltos A MANO antes de mirar la app, con la morfología del español:
 * las desinencias regulares de las tres conjugaciones (-ar: hablo, hablé, hablaba…; -er: como,
 * comí…; -ir: vivo, viví…), los cambios ortográficos que la Ortografía exige para conservar el
 * sonido de la raíz (c→qu y g→gu ante e, z→c ante e, g→j y c→z ante a/o) y los paradigmas
 * irregulares de uso común. Además se cotejaron, fuera de este fichero, los 65 irregulares
 * alcanzables de la lista con siete reglas de derivación (condicional desde el futuro,
 * imperfecto y futuro de subjuntivo desde la 3.ª plural del indefinido, imperativo desde el
 * presente de subjuntivo…): todos cuadran. El fallo no está en la tabla de irregulares, sino
 * en lo que el motor hace con todo lo que NO está en ella.
 *
 * Lo que está en verde son candados; lo que lleva test.fail() es un hallazgo ABIERTO.
 * =================================================================================== */

const AVISO_NO_VALIDO = 'Por favor, introduce un verbo válido en infinitivo';

/** Escribe en el buscador (esperando a que React tenga el valor) y pulsa «Conjugar». */
async function enviar(page: Page, texto: string) {
  const entrada = page.getByPlaceholder('Escribe un verbo en infinitivo...');
  await entrada.fill(texto);
  await esperarValorEnReact(page, entrada, texto);
  await page.getByRole('button', { name: 'Conjugar', exact: true }).click();
}

/** La cabecera del resultado: el <h2> con el infinitivo y, si es de la lista, la insignia «Irregular». */
function cabecera(page: Page, infinitivo: string) {
  return page.getByRole('heading', { level: 2, name: new RegExp(`^${infinitivo}( ?Irregular)?$`) });
}

/** Las seis formas de una tarjeta de tiempo, en orden (yo … ellos). */
async function leerTiempo(page: Page, nombre: string): Promise<string[]> {
  const tarjeta = tarjetaDeTiempo(page, nombre);
  await expect(tarjeta).toBeVisible();
  return (await tarjeta.locator('td:nth-child(2)').allTextContents()).map((s) => s.trim());
}

/** Gerundio o participio de la cabecera. */
function formaNoPersonal(page: Page, rotulo: 'Gerundio:' | 'Participio:') {
  return page.getByText(rotulo, { exact: true }).locator('xpath=following-sibling::span[1]');
}

/** El aviso de entrada no válida de la app (no el anunciador de rutas de Next). */
function avisoNoValido(page: Page) {
  return page.locator('p', { hasText: AVISO_NO_VALIDO });
}

test.describe('Inspección 11/11/2026 — conjugación en escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await esperarHidratacion(page, [ENTRADA]);
  });

  test('CASO 1 (normal) · hablar: el paradigma regular de la 1.ª conjugación, entero', async ({ page }) => {
    // Raíz «habl-» + desinencias de -ar; futuro y condicional sobre el infinitivo entero;
    // compuestos con haber + participio invariable; futuro de subjuntivo = imperfecto en -re.
    await enviar(page, 'hablar');
    await expect(cabecera(page, 'hablar')).toBeVisible();
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('hablando');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('hablado');
    expect(await leerTiempo(page, 'Presente')).toEqual(['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan']);
    expect(await leerTiempo(page, 'Pretérito Imperfecto')).toEqual(['hablaba', 'hablabas', 'hablaba', 'hablábamos', 'hablabais', 'hablaban']);
    expect(await leerTiempo(page, 'Pretérito Indefinido')).toEqual(['hablé', 'hablaste', 'habló', 'hablamos', 'hablasteis', 'hablaron']);
    expect(await leerTiempo(page, 'Futuro Simple')).toEqual(['hablaré', 'hablarás', 'hablará', 'hablaremos', 'hablaréis', 'hablarán']);
    expect(await leerTiempo(page, 'Condicional Simple')).toEqual(['hablaría', 'hablarías', 'hablaría', 'hablaríamos', 'hablaríais', 'hablarían']);
    expect(await leerTiempo(page, 'Pretérito Pluscuamperfecto')).toEqual(['había hablado', 'habías hablado', 'había hablado', 'habíamos hablado', 'habíais hablado', 'habían hablado']);
    await page.getByRole('button', { name: 'Subjuntivo', exact: true }).click();
    expect(await leerTiempo(page, 'Presente de Subjuntivo')).toEqual(['hable', 'hables', 'hable', 'hablemos', 'habléis', 'hablen']);
    expect(await leerTiempo(page, 'Imperfecto de Subjuntivo')).toEqual(['hablara', 'hablaras', 'hablara', 'habláramos', 'hablarais', 'hablaran']);
    expect(await leerTiempo(page, 'Futuro de Subjuntivo')).toEqual(['hablare', 'hablares', 'hablare', 'habláremos', 'hablareis', 'hablaren']);
    expect(await leerTiempo(page, 'Pretérito Perfecto de Subjuntivo')).toEqual(['haya hablado', 'hayas hablado', 'haya hablado', 'hayamos hablado', 'hayáis hablado', 'hayan hablado']);
    await page.getByRole('button', { name: 'Imperativo', exact: true }).click();
    // La fila de «yo» no tiene imperativo: la app pinta un guion.
    expect(await leerTiempo(page, 'Imperativo Afirmativo')).toEqual(['-', 'habla', 'hable', 'hablemos', 'hablad', 'hablen']);
    expect(await leerTiempo(page, 'Imperativo Negativo')).toEqual(['-', 'no hables', 'no hable', 'no hablemos', 'no habléis', 'no hablen']);
  });

  test('CASO 1 (normal) · comer y vivir: las desinencias de la 2.ª y la 3.ª conjugación', async ({ page }) => {
    await enviar(page, 'comer');
    await expect(cabecera(page, 'comer')).toBeVisible();
    expect(await leerTiempo(page, 'Presente')).toEqual(['como', 'comes', 'come', 'comemos', 'coméis', 'comen']);
    expect(await leerTiempo(page, 'Pretérito Indefinido')).toEqual(['comí', 'comiste', 'comió', 'comimos', 'comisteis', 'comieron']);
    expect(await leerTiempo(page, 'Pretérito Imperfecto')).toEqual(['comía', 'comías', 'comía', 'comíamos', 'comíais', 'comían']);
    await page.getByRole('button', { name: 'Subjuntivo', exact: true }).click();
    expect(await leerTiempo(page, 'Imperfecto de Subjuntivo')).toEqual(['comiera', 'comieras', 'comiera', 'comiéramos', 'comierais', 'comieran']);

    await enviar(page, 'vivir');
    await expect(cabecera(page, 'vivir')).toBeVisible();
    await page.getByRole('button', { name: 'Indicativo', exact: true }).click();
    // -ir se aparta de -er solo en nosotros y vosotros del presente (vivimos, vivís) y en el imperativo de vosotros (vivid).
    expect(await leerTiempo(page, 'Presente')).toEqual(['vivo', 'vives', 'vive', 'vivimos', 'vivís', 'viven']);
    await page.getByRole('button', { name: 'Subjuntivo', exact: true }).click();
    expect(await leerTiempo(page, 'Presente de Subjuntivo')).toEqual(['viva', 'vivas', 'viva', 'vivamos', 'viváis', 'vivan']);
    await page.getByRole('button', { name: 'Imperativo', exact: true }).click();
    expect(await leerTiempo(page, 'Imperativo Afirmativo')).toEqual(['-', 'vive', 'viva', 'vivamos', 'vivid', 'vivan']);
  });

  test('CASO 2 (límite) · tener: irregular frecuente en todos los tiempos simples y su pretérito anterior', async ({ page }) => {
    await enviar(page, 'tener');
    await expect(cabecera(page, 'tener')).toBeVisible();
    expect(await leerTiempo(page, 'Presente')).toEqual(['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen']);
    expect(await leerTiempo(page, 'Pretérito Indefinido')).toEqual(['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron']);
    expect(await leerTiempo(page, 'Futuro Simple')).toEqual(['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán']);
    expect(await leerTiempo(page, 'Condicional Simple')).toEqual(['tendría', 'tendrías', 'tendría', 'tendríamos', 'tendríais', 'tendrían']);
    expect(await leerTiempo(page, 'Pretérito Anterior')).toEqual(['hube tenido', 'hubiste tenido', 'hubo tenido', 'hubimos tenido', 'hubisteis tenido', 'hubieron tenido']);
    await page.getByRole('button', { name: 'Subjuntivo', exact: true }).click();
    expect(await leerTiempo(page, 'Presente de Subjuntivo')).toEqual(['tenga', 'tengas', 'tenga', 'tengamos', 'tengáis', 'tengan']);
    expect(await leerTiempo(page, 'Imperfecto de Subjuntivo')).toEqual(['tuviera', 'tuvieras', 'tuviera', 'tuviéramos', 'tuvierais', 'tuvieran']);
    expect(await leerTiempo(page, 'Futuro de Subjuntivo')).toEqual(['tuviere', 'tuvieres', 'tuviere', 'tuviéremos', 'tuviereis', 'tuvieren']);
    await page.getByRole('button', { name: 'Imperativo', exact: true }).click();
    expect(await leerTiempo(page, 'Imperativo Afirmativo')).toEqual(['-', 'ten', 'tenga', 'tengamos', 'tened', 'tengan']);
    expect(await leerTiempo(page, 'Imperativo Negativo')).toEqual(['-', 'no tengas', 'no tenga', 'no tengamos', 'no tengáis', 'no tengan']);
  });

  test('CASO 2 (límite) · muestra de la lista de irregulares: caber, satisfacer, conducir, pedir, dormir, ir', async ({ page }) => {
    await enviar(page, 'caber');
    await expect(cabecera(page, 'caber')).toBeVisible();
    expect((await leerTiempo(page, 'Presente'))[0]).toBe('quepo');
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[0]).toBe('cupe');
    expect((await leerTiempo(page, 'Futuro Simple'))[0]).toBe('cabré');

    await enviar(page, 'satisfacer');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('satisfecho');
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[2]).toBe('satisfizo');

    await enviar(page, 'conducir');
    expect((await leerTiempo(page, 'Presente'))[0]).toBe('conduzco');
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[0]).toBe('conduje');

    await enviar(page, 'pedir');
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[2]).toBe('pidió');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('pidiendo');

    await enviar(page, 'dormir');
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[5]).toBe('durmieron');

    await enviar(page, 'ir');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('yendo');
    await page.getByRole('button', { name: 'Imperativo', exact: true }).click();
    // Nosotros afirmativo de ir: «vamos» es la exhortación corriente y «vayamos» la forma de
    // subjuntivo, también válida («vayamos por partes»); se admiten las dos. El negativo, solo «no vayamos».
    expect(['vamos', 'vayamos']).toContain((await leerTiempo(page, 'Imperativo Afirmativo'))[3]);
    expect((await leerTiempo(page, 'Imperativo Negativo'))[3]).toBe('no vayamos');
  });

  test('CASO 2 (límite) · mayúsculas y espacios: «HABLAR» y «  Comer  » conjugan como hablar y comer', async ({ page }) => {
    await enviar(page, 'HABLAR');
    await expect(cabecera(page, 'hablar')).toBeVisible();
    expect((await leerTiempo(page, 'Presente'))[0]).toBe('hablo');
    await enviar(page, '  Comer  ');
    await expect(cabecera(page, 'comer')).toBeVisible();
    expect((await leerTiempo(page, 'Presente'))[0]).toBe('como');
  });

  test('CASO 3 (rechazo) · vacío y una palabra sin terminación verbal: avisa y no conjuga', async ({ page }) => {
    await enviar(page, '');
    await expect(avisoNoValido(page)).toBeVisible();
    await expect(page.locator('h3', { hasText: /^Presente$/ })).toHaveCount(0);
    await enviar(page, 'mesa');
    await expect(avisoNoValido(page)).toBeVisible();
    await expect(page.locator('h3', { hasText: /^Presente$/ })).toHaveCount(0);
  });

  test('HALLAZGO 4422 (11/11/2026, REPARADO) · CASO 3 · una palabra que no es un verbo y acaba en -ar/-er ya no se conjuga', async ({ page }) => {
    // Antes esVerboValido() solo miraba la terminación: «mujer» salía «yo mujo, tú mujes…», «xyzar»
    // salía «xyzo» y «ar» a secas «o, as, a…». Ahora se rechaza la raíz sin vocal y las palabras
    // corrientes que no son verbos (la app no tiene diccionario, y lo dice en sus limitaciones).
    await enviar(page, 'mujer');
    await expect(page.locator('h3', { hasText: /^Presente$/ })).toHaveCount(0);
    await expect(page.getByRole('alert').filter({ hasText: '«mujer» no es un verbo' })).toBeVisible();
    await enviar(page, 'xyzar');
    await expect(page.locator('h3', { hasText: /^Presente$/ })).toHaveCount(0);
    // Un pronominal real se conjuga como su base y lo explica, en vez de rechazarse.
    await enviar(page, 'levantarse');
    await expect(cabecera(page, 'levantar')).toBeVisible();
    await expect(page.getByText(/es pronominal: se conjuga como «levantar»/)).toBeVisible();
    expect((await leerTiempo(page, 'Presente'))[0]).toBe('levanto');
  });

  test('HALLAZGO 4420 (11/11/2026, REPARADO) · «oír», de la propia lista, y los verbos en -ír se conjugan', async ({ page }) => {
    // esVerboValido() comprobaba endsWith('ir') y «oír» acaba en «ír» (con tilde): el botón «oír»
    // de la lista daba «Por favor, introduce un verbo válido…». Lo mismo «reír», «sonreír» y «freír».
    // Paradigma de oír: oigo, oyes, oye, oímos, oís, oyen; de reír: río, ríes, ríe, reímos, reís, ríen.
    const boton = page.getByRole('button', { name: 'oír', exact: true });
    await expect(boton).toBeVisible();
    await boton.click();
    await expect(cabecera(page, 'oír')).toBeVisible();
    expect(await leerTiempo(page, 'Presente')).toEqual(['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen']);
    await enviar(page, 'reír');
    await expect(avisoNoValido(page)).toHaveCount(0);
    await expect(cabecera(page, 'reír')).toBeVisible();
    expect(await leerTiempo(page, 'Presente')).toEqual(['río', 'ríes', 'ríe', 'reímos', 'reís', 'ríen']);
  });

  test('HALLAZGO 4418 (11/11/2026, REPARADO) · los regulares con cambio ortográfico conservan el sonido de la raíz', async ({ page }) => {
    // conjugarRegular() pegaba raíz + desinencia sin ajustar la grafía: «buscé», «busce»,
    // «llegé», «cruzé», «cogo», «envio» (sin tilde). Son verbos REGULARES para la gramática:
    // la ortografía solo conserva el sonido (c→qu y g→gu ante e, z→c ante e, g→j ante a/o)
    // y marca el hiato de -iar (envío). El motor, caso a caso: tests/conjugacion-reglas-motor.spec.ts.
    await enviar(page, 'buscar');
    await expect(cabecera(page, 'buscar')).toBeVisible();
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[0]).toBe('busqué');
    await page.getByRole('button', { name: 'Subjuntivo', exact: true }).click();
    expect(await leerTiempo(page, 'Presente de Subjuntivo')).toEqual(['busque', 'busques', 'busque', 'busquemos', 'busquéis', 'busquen']);
    await page.getByRole('button', { name: 'Indicativo', exact: true }).click();
    await enviar(page, 'llegar');
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[0]).toBe('llegué');
    await enviar(page, 'cruzar');
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[0]).toBe('crucé');
    await enviar(page, 'coger');
    expect((await leerTiempo(page, 'Presente'))[0]).toBe('cojo');
    await enviar(page, 'enviar');
    expect((await leerTiempo(page, 'Presente'))[0]).toBe('envío');
  });

  test('HALLAZGO 4419 (11/11/2026, REPARADO) · un irregular fuera de la lista, o derivado de uno de ella, ya no sale como regular', async ({ page }) => {
    // Lo que no estaba entre los 66 irregulares se conjugaba como regular, sin aviso ni distintivo:
    // «volo», «manteno / mantení / manteneré», «componido», «devolvido», «describido».
    // La FAQ de la propia página dice que los compuestos heredan el participio irregular
    // («describir→descrito, componer→compuesto, devolver→devuelto»).
    await enviar(page, 'volar');
    await expect(cabecera(page, 'volar')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /^volar ?Irregular$/ })).toBeVisible();
    await expect(page.getByText(/Conjugado por regla: diptonga o→ue/)).toBeVisible();
    expect((await leerTiempo(page, 'Presente'))[0]).toBe('vuelo');
    await enviar(page, 'mantener');
    expect((await leerTiempo(page, 'Presente'))[0]).toBe('mantengo');
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[0]).toBe('mantuve');
    await enviar(page, 'componer');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('compuesto');
    await enviar(page, 'devolver');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('devuelto');
    await enviar(page, 'describir');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('descrito');
  });

  test('el aviso de entrada no válida se lee en claro (#dc2626 sobre la tarjeta: 4,83:1)', async ({ page }) => {
    await enviar(page, 'xyz');
    await expect(avisoNoValido(page)).toBeVisible();
    expect(await contrasteSobreFondoReal(avisoNoValido(page))).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO 4425 (11/11/2026, REPARADO) · el aviso de error se anuncia y en oscuro llega a 4,5:1', async ({ page }) => {
    // El <p> del error no llevaba role="alert" ni aria-live, y su color #dc2626 no tenía variante
    // oscura: sobre la tarjeta #2A2A2A daba 2,97:1 (WCAG 1.4.3 pide 4,5:1 para texto normal).
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await enviar(page, 'xyz');
    const aviso = avisoNoValido(page);
    await expect(aviso).toBeVisible();
    // Se mide con poll: el fondo de la tarjeta tiene transición al cambiar de tema, y la primera
    // lectura caía a mitad de camino entre el blanco y el #2A2A2A (1,76:1 con el rojo nuevo).
    await expect.poll(() => contrasteSobreFondoReal(aviso), { timeout: 3000 }).toBeGreaterThanOrEqual(4.5);
    const anunciado = await aviso.evaluate((el) => el.getAttribute('role') === 'alert' || !!el.getAttribute('aria-live') || !!el.closest('[aria-live],[role="alert"]'));
    expect(anunciado).toBe(true);
  });

  test('HALLAZGO 4426 (11/11/2026, REPARADO) · las sugerencias se eligen con el teclado y ponen primero lo tecleado', async ({ page }) => {
    // Las sugerencias eran <li onClick> sin role ni tabindex: con «ten» + Flecha abajo + Intro se
    // enviaba «ten» y salía el aviso de no válido. E iban por orden alfabético con «contiene»:
    // «ten» proponía primero «entender», e «ir» diez verbos sin «ir» entre ellos.
    const entrada = page.getByPlaceholder('Escribe un verbo en infinitivo...');
    await entrada.pressSequentially('ir');
    const sugerencias = page.locator('form li');
    await expect(sugerencias.first()).toBeVisible();
    await expect(sugerencias.first()).toHaveText(/^ir(irregular)?$/);
    await expect(page.getByRole('listbox')).toBeVisible();
    await entrada.fill('');
    await entrada.pressSequentially('ten');
    await expect(sugerencias).toHaveCount(2);
    await entrada.press('ArrowDown');
    await expect(page.getByRole('option', { name: /^tener/ })).toHaveAttribute('aria-selected', 'true');
    await entrada.press('Enter');
    await expect(avisoNoValido(page)).toHaveCount(0);
    await expect(cabecera(page, 'tener')).toBeVisible();
  });

  test('HALLAZGO 4423 (11/11/2026, REPARADO) · la guía ya no enseña reglas que la propia conjugación desmiente', async ({ page }) => {
    // Lo que la app conjuga (verde, candado):
    await enviar(page, 'tener');
    expect((await leerTiempo(page, 'Pretérito Indefinido'))[0]).toBe('tuve');
    await page.getByRole('button', { name: 'Subjuntivo', exact: true }).click();
    expect((await leerTiempo(page, 'Presente de Subjuntivo'))[0]).toBe('tenga');
    await enviar(page, 'leer');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('leyendo');
    // Lo que la guía afirma: que el indefinido y el presente de subjuntivo comparten raíz (tuve /
    // tenga: no; la comparte el IMPERFECTO de subjuntivo, tuvieron → tuviera) y que el gerundio
    // «siempre» acaba en -ando o -iendo (leyendo, yendo, trayendo).
    const html = await page.content();
    expect(html).not.toContain('El pretérito indefinido y el presente de subjuntivo suelen compartir la misma raíz irregular');
    expect(html).not.toContain('El gerundio siempre termina en -ando');
    expect(html).toContain('El pretérito indefinido y el imperfecto de subjuntivo comparten siempre la raíz');
    expect(html).not.toContain('Afectan solo a formas tónicas (yo, tú, él, ellos) en presente');
    expect(html).not.toContain('Solo tiene formas de tú, vosotros, usted, ustedes');
  });

  test('HALLAZGO 4424 (11/11/2026, REPARADO) · el FAQPage y las features ya no prometen lo que la app no hace', async ({ page }) => {
    const subtitulo = await page.getByText(/verbos irregulares con conjugación verificada/).textContent();
    const enLista = parseInt(subtitulo ?? '', 10);
    expect(enLista).toBeGreaterThan(0);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
    // features: «Más de 70 verbos irregulares» con 66 en la lista (65 alcanzables: «oír» falla).
    const promesa = ld.match(/Más de (\d+) verbos irregulares/);
    expect(Number(promesa?.[1] ?? 0)).toBeLessThanOrEqual(enLista);
    // FAQPage: reflexivos (levantarse da el aviso de no válido) y defectivos (llover → «llove»).
    expect(ld).not.toContain('reflexivos y defectivos');
    // FAQPage: «-e/-a para la primera conjugación y -a/-e para la segunda y tercera»; la 1.ª
    // lleva solo -e (hable) y la 2.ª y 3.ª solo -a (coma, viva), como conjuga la propia app.
    expect(ld).not.toContain('-e/-a para la primera conjugación');
  });
});

/* -------------------------------------------------------------------------------------
 * Firma de rotura en móvil (Pixel 7). Las opciones van enumeradas: un viewport móvil dentro
 * de un describe necesita las cinco para no heredar el userAgent de escritorio.
 * ----------------------------------------------------------------------------------- */
test.describe('Inspección 11/11/2026 — móvil (Pixel 7)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await esperarHidratacion(page, [ENTRADA]);
  });

  test('móvil: el resultado no desborda en horizontal y las tres pestañas responden al toque', async ({ page }) => {
    // «tener» está en «Verbos populares» y en la lista de irregulares: el primero es el popular.
    await page.getByRole('button', { name: 'tener', exact: true }).first().tap();
    await expect(cabecera(page, 'tener')).toBeAttached();
    for (const modo of ['Subjuntivo', 'Imperativo', 'Indicativo']) {
      const pestaña = page.getByRole('button', { name: modo, exact: true });
      await pestaña.tap();
      await expect(pestaña).toHaveAttribute('aria-pressed', 'true');
    }
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(desborde).toBeLessThanOrEqual(0);
  });

  test('HALLAZGO 4421 (11/11/2026, REPARADO) · móvil: tras pulsar un verbo el resultado se trae a la pantalla', async ({ page }) => {
    // Nada llevaba el resultado a la vista: con «ser» la cabecera empezaba en y = 838 px de una
    // pantalla de 839 px (se veía el buscador y el borde vacío de la tarjeta), y con «volver», el
    // último de la lista, la pantalla se quedaba en «Condicional Perfecto» y la cabecera a −3.696 px.
    // Ahora la cabecera recibe el foco y, si no se ve entera, sube bajo la barra (enfocarALaVista).
    await page.getByRole('button', { name: 'ser', exact: true }).first().tap();
    await expect(cabecera(page, 'ser')).toBeAttached();
    await expect(cabecera(page, 'ser')).toBeInViewport({ ratio: 1 });
    await expect(cabecera(page, 'ser')).toBeFocused();
    await expect(tarjetaDeTiempo(page, 'Presente').locator('td', { hasText: /^soy$/ })).toBeInViewport();
  });

  test('HALLAZGO 4421 (11/11/2026, REPARADO) · móvil: un verbo del final de la lista lleva a su cabecera', async ({ page }) => {
    const volver = page.getByRole('button', { name: 'volver', exact: true });
    await volver.scrollIntoViewIfNeeded();
    await volver.tap();
    await expect(cabecera(page, 'volver')).toBeAttached();
    await expect(cabecera(page, 'volver')).toBeInViewport();
  });

  test('HALLAZGO 4421 (11/11/2026, REPARADO) · móvil: «Buscar otro verbo» lleva al buscador', async ({ page }) => {
    // Al volver al estado inicial la pantalla se quedaba en la rejilla de irregulares y el
    // buscador, sin foco, a −591 px.
    await page.getByRole('button', { name: 'ser', exact: true }).first().tap();
    const otro = page.getByRole('button', { name: 'Buscar otro verbo' });
    await otro.scrollIntoViewIfNeeded();
    await otro.tap();
    await expect(page.getByRole('button', { name: 'volver', exact: true })).toBeAttached();
    const entrada = page.getByPlaceholder('Escribe un verbo en infinitivo...');
    await expect(entrada).toBeInViewport({ ratio: 1 });
    await expect(entrada).toBeFocused();
  });
});
