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

/* =====================================================================================
 * Inspección del 11/11/2026 (modo cambio, commit b6c2923b2: motor de reglas nuevo en
 * reglasConjugacion.ts, derivados por prefijo, grupos de irregularidad, rechazo de lo que no es
 * verbo y pronominales).
 *
 * Los esperados están resueltos A MANO antes de ejecutar la app, con los paradigmas de la Nueva
 * gramática (RAE-ASALE) y el DPD (la RAE devuelve 403, así que salen del paradigma, no de una
 * consulta) y la Ortografía de 2010 para las tildes. Cada caso dice de qué modelo sale cada forma.
 *
 * Lo que está en verde son candados; lo que lleva test.fail() es un hallazgo ABIERTO.
 * =================================================================================== */

/** Pulsa la pestaña del modo (si hace falta) y lee las seis formas de un tiempo. */
async function formas(page: Page, modo: 'Indicativo' | 'Subjuntivo' | 'Imperativo', tiempo: string): Promise<string[]> {
  const pestaña = page.getByRole('button', { name: modo, exact: true });
  await pestaña.click();
  await expect(pestaña).toHaveAttribute('aria-pressed', 'true');
  return leerTiempo(page, tiempo);
}

/** Envía un verbo y espera a SU cabecera, para no leer la tabla del verbo anterior. */
async function conjugarYEsperar(page: Page, texto: string, infinitivo: string = texto) {
  await enviar(page, texto);
  await expect(cabecera(page, infinitivo)).toBeVisible();
}

/** La nota del modelo, el párrafo que sigue a la cabecera del resultado. */
function notaModelo(page: Page) {
  return page.locator('h2[tabindex="-1"] + p');
}

test.describe('Inspección 11/11/2026 (cambio) — motor de reglas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await esperarHidratacion(page, [ENTRADA]);
  });

  test('derivados por prefijo: contener, prever, bendecir, maldecir, predecir, sonreír, desoír, decaer', async ({ page }) => {
    // contener ← tener (contengo, contuve, contendré; imperativo «contén», aguda en -n con tilde).
    await conjugarYEsperar(page, 'contener');
    await expect(notaModelo(page)).toHaveText('Se conjuga como «tener».');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('contenido');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['contengo', 'contienes', 'contiene', 'contenemos', 'contenéis', 'contienen']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['contuve', 'contuviste', 'contuvo', 'contuvimos', 'contuvisteis', 'contuvieron']);
    expect(await formas(page, 'Indicativo', 'Futuro Simple')).toEqual(['contendré', 'contendrás', 'contendrá', 'contendremos', 'contendréis', 'contendrán']);
    expect(await formas(page, 'Subjuntivo', 'Imperfecto de Subjuntivo')).toEqual(['contuviera', 'contuvieras', 'contuviera', 'contuviéramos', 'contuvierais', 'contuvieran']);
    expect(await formas(page, 'Imperativo', 'Imperativo Afirmativo')).toEqual(['-', 'contén', 'contenga', 'contengamos', 'contened', 'contengan']);

    // prever ← ver, NO ← proveer: preveo, prevés, prevé, prevéis, prevén (agudas con tilde);
    // preví, previó; preveré; previsto.
    await conjugarYEsperar(page, 'prever');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('previsto');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('previendo');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['preveo', 'prevés', 'prevé', 'prevemos', 'prevéis', 'prevén']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['preví', 'previste', 'previó', 'previmos', 'previsteis', 'previeron']);
    expect(await formas(page, 'Indicativo', 'Futuro Simple')).toEqual(['preveré', 'preverás', 'preverá', 'preveremos', 'preveréis', 'preverán']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['prevea', 'preveas', 'prevea', 'preveamos', 'preveáis', 'prevean']);
    expect(await formas(page, 'Imperativo', 'Imperativo Afirmativo')).toEqual(['-', 'prevé', 'prevea', 'preveamos', 'preved', 'prevean']);

    // bendecir y maldecir: como decir en presente e indefinido, pero futuro y condicional
    // regulares (bendeciré), participio regular (bendecido; «bendito» es adjetivo) e imperativo
    // «bendice» (DPD, s. v. bendecir).
    await conjugarYEsperar(page, 'bendecir');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('bendecido');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('bendiciendo');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['bendigo', 'bendices', 'bendice', 'bendecimos', 'bendecís', 'bendicen']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['bendije', 'bendijiste', 'bendijo', 'bendijimos', 'bendijisteis', 'bendijeron']);
    expect(await formas(page, 'Indicativo', 'Futuro Simple')).toEqual(['bendeciré', 'bendecirás', 'bendecirá', 'bendeciremos', 'bendeciréis', 'bendecirán']);
    expect(await formas(page, 'Indicativo', 'Condicional Simple')).toEqual(['bendeciría', 'bendecirías', 'bendeciría', 'bendeciríamos', 'bendeciríais', 'bendecirían']);
    expect(await formas(page, 'Subjuntivo', 'Imperfecto de Subjuntivo')).toEqual(['bendijera', 'bendijeras', 'bendijera', 'bendijéramos', 'bendijerais', 'bendijeran']);
    expect(await formas(page, 'Imperativo', 'Imperativo Afirmativo')).toEqual(['-', 'bendice', 'bendiga', 'bendigamos', 'bendecid', 'bendigan']);
    await conjugarYEsperar(page, 'maldecir');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('maldecido');
    expect((await formas(page, 'Indicativo', 'Futuro Simple'))[0]).toBe('maldeciré');
    expect((await formas(page, 'Imperativo', 'Imperativo Afirmativo'))[1]).toBe('maldice');

    // predecir: participio «predicho» e imperativo «predice» (DPD); el futuro preferido es «prediré».
    await conjugarYEsperar(page, 'predecir');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('predicho');
    expect((await formas(page, 'Indicativo', 'Futuro Simple'))[0]).toBe('prediré');
    expect((await formas(page, 'Imperativo', 'Imperativo Afirmativo'))[1]).toBe('predice');

    // sonreír ← reír: sonrío, sonrió (aguda bisílaba, con tilde, aunque «rio» no la lleve),
    // sonriáis (aguda en -s), sonreíd.
    await conjugarYEsperar(page, 'sonreír');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('sonriendo');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('sonreído');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['sonrío', 'sonríes', 'sonríe', 'sonreímos', 'sonreís', 'sonríen']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['sonreí', 'sonreíste', 'sonrió', 'sonreímos', 'sonreísteis', 'sonrieron']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['sonría', 'sonrías', 'sonría', 'sonriamos', 'sonriáis', 'sonrían']);
    expect(await formas(page, 'Imperativo', 'Imperativo Afirmativo')).toEqual(['-', 'sonríe', 'sonría', 'sonriamos', 'sonreíd', 'sonrían']);

    // desoír ← oír; decaer ← caer.
    await conjugarYEsperar(page, 'desoír');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['desoigo', 'desoyes', 'desoye', 'desoímos', 'desoís', 'desoyen']);
    await conjugarYEsperar(page, 'decaer');
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['decaí', 'decaíste', 'decayó', 'decaímos', 'decaísteis', 'decayeron']);
  });

  test('grupos de irregularidad: diptongación, cierre e→i, -zc-, -duje, i→ie', async ({ page }) => {
    // o→ue como contar, solo en las formas con acento en la raíz.
    await conjugarYEsperar(page, 'acostar');
    await expect(notaModelo(page)).toContainText('diptonga o→ue');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['acuesto', 'acuestas', 'acuesta', 'acostamos', 'acostáis', 'acuestan']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['acosté', 'acostaste', 'acostó', 'acostamos', 'acostasteis', 'acostaron']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['acueste', 'acuestes', 'acueste', 'acostemos', 'acostéis', 'acuesten']);
    expect(await formas(page, 'Imperativo', 'Imperativo Afirmativo')).toEqual(['-', 'acuesta', 'acueste', 'acostemos', 'acostad', 'acuesten']);
    // o→ue + g→gu ante e; o→ue con h- inicial (huelo); o→ue tras g con diéresis (avergüenzo); cocer sin -zc-.
    await conjugarYEsperar(page, 'colgar');
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['cuelgue', 'cuelgues', 'cuelgue', 'colguemos', 'colguéis', 'cuelguen']);
    await conjugarYEsperar(page, 'oler');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['huelo', 'hueles', 'huele', 'olemos', 'oléis', 'huelen']);
    expect(await formas(page, 'Imperativo', 'Imperativo Afirmativo')).toEqual(['-', 'huele', 'huela', 'olamos', 'oled', 'huelan']);
    await conjugarYEsperar(page, 'avergonzar');
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['avergüence', 'avergüences', 'avergüence', 'avergoncemos', 'avergoncéis', 'avergüencen']);
    await conjugarYEsperar(page, 'cocer');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['cuezo', 'cueces', 'cuece', 'cocemos', 'cocéis', 'cuecen']);
    // e→ie como entender; en inicial, ye- (yerro: DPD, uso de España).
    await conjugarYEsperar(page, 'defender');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['defiendo', 'defiendes', 'defiende', 'defendemos', 'defendéis', 'defienden']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['defienda', 'defiendas', 'defienda', 'defendamos', 'defendáis', 'defiendan']);
    await conjugarYEsperar(page, 'errar');
    expect((await formas(page, 'Indicativo', 'Presente'))[0]).toBe('yerro');
    // e→i como pedir: también en las átonas con -ió, -ie-, -a (midió, midiendo, midamos).
    await conjugarYEsperar(page, 'medir');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('midiendo');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['mido', 'mides', 'mide', 'medimos', 'medís', 'miden']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['medí', 'mediste', 'midió', 'medimos', 'medisteis', 'midieron']);
    expect(await formas(page, 'Subjuntivo', 'Imperfecto de Subjuntivo')).toEqual(['midiera', 'midieras', 'midiera', 'midiéramos', 'midierais', 'midieran']);
    expect(await formas(page, 'Imperativo', 'Imperativo Afirmativo')).toEqual(['-', 'mide', 'mida', 'midamos', 'medid', 'midan']);
    // e→ie / e→i como sentir.
    await conjugarYEsperar(page, 'divertir');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('divirtiendo');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['divierto', 'diviertes', 'divierte', 'divertimos', 'divertís', 'divierten']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['divertí', 'divertiste', 'divirtió', 'divertimos', 'divertisteis', 'divirtieron']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['divierta', 'diviertas', 'divierta', 'divirtamos', 'divirtáis', 'diviertan']);
    // i→ie como adquirir.
    await conjugarYEsperar(page, 'adquirir');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['adquiero', 'adquieres', 'adquiere', 'adquirimos', 'adquirís', 'adquieren']);
    // -zc- como conocer (agradezco, agradezca), indefinido regular.
    await conjugarYEsperar(page, 'agradecer');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['agradezco', 'agradeces', 'agradece', 'agradecemos', 'agradecéis', 'agradecen']);
    expect((await formas(page, 'Indicativo', 'Pretérito Indefinido'))[0]).toBe('agradecí');
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['agradezca', 'agradezcas', 'agradezca', 'agradezcamos', 'agradezcáis', 'agradezcan']);
    // -zc- y -duje como conducir; el imperfecto de subjuntivo sale de «introdujeron».
    await conjugarYEsperar(page, 'introducir');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['introduzco', 'introduces', 'introduce', 'introducimos', 'introducís', 'introducen']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['introduje', 'introdujiste', 'introdujo', 'introdujimos', 'introdujisteis', 'introdujeron']);
    expect(await formas(page, 'Subjuntivo', 'Imperfecto de Subjuntivo')).toEqual(['introdujera', 'introdujeras', 'introdujera', 'introdujéramos', 'introdujerais', 'introdujeran']);
  });

  test('-uy- como construir en todo lo que no es la 1.ª plural del imperfecto de subjuntivo', async ({ page }) => {
    // contribuyo, contribuís (aguda en -s con tilde: cons-tri-buís), contribuyó, contribuyendo.
    await conjugarYEsperar(page, 'contribuir');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('contribuyendo');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['contribuyo', 'contribuyes', 'contribuye', 'contribuimos', 'contribuís', 'contribuyen']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['contribuí', 'contribuiste', 'contribuyó', 'contribuimos', 'contribuisteis', 'contribuyeron']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['contribuya', 'contribuyas', 'contribuya', 'contribuyamos', 'contribuyáis', 'contribuyan']);
    expect(await formas(page, 'Imperativo', 'Imperativo Afirmativo')).toEqual(['-', 'contribuye', 'contribuya', 'contribuyamos', 'contribuid', 'contribuyan']);
  });

  test('hiato y ortografía de los regulares: actuar, reunir, criar, enraizar, averiguar, coger, distinguir', async ({ page }) => {
    // -uar en hiato (actúo); u en hiato con tilde (reúno); -iar en hiato con los monosílabos de
    // 2010 sin tilde (criais, crie, crio); enraizar con z→c y la tilde del hiato (enraíce).
    await conjugarYEsperar(page, 'actuar');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['actúo', 'actúas', 'actúa', 'actuamos', 'actuáis', 'actúan']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['actúe', 'actúes', 'actúe', 'actuemos', 'actuéis', 'actúen']);
    expect(await formas(page, 'Imperativo', 'Imperativo Afirmativo')).toEqual(['-', 'actúa', 'actúe', 'actuemos', 'actuad', 'actúen']);
    await conjugarYEsperar(page, 'reunir');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['reúno', 'reúnes', 'reúne', 'reunimos', 'reunís', 'reúnen']);
    await conjugarYEsperar(page, 'criar');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['crío', 'crías', 'cría', 'criamos', 'criais', 'crían']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['crie', 'criaste', 'crio', 'criamos', 'criasteis', 'criaron']);
    await conjugarYEsperar(page, 'enraizar');
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['enraíce', 'enraíces', 'enraíce', 'enraicemos', 'enraicéis', 'enraícen']);
    // -guar: gu→gü ante e (averigüé, averigüe); -ger: g→j ante a/o; -guir: gu→g ante a/o.
    await conjugarYEsperar(page, 'averiguar');
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['averigüé', 'averiguaste', 'averiguó', 'averiguamos', 'averiguasteis', 'averiguaron']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['averigüe', 'averigües', 'averigüe', 'averigüemos', 'averigüéis', 'averigüen']);
    await conjugarYEsperar(page, 'coger');
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['coja', 'cojas', 'coja', 'cojamos', 'cojáis', 'cojan']);
    await conjugarYEsperar(page, 'distinguir');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['distingo', 'distingues', 'distingue', 'distinguimos', 'distinguís', 'distinguen']);
  });

  test('rechazo y pronominal: xyzar y mujer se rechazan con su motivo; arrepentirse conjuga su base', async ({ page }) => {
    await enviar(page, 'xyzar');
    await expect(page.getByRole('alert').filter({ hasText: '«xyzar» no es un verbo del español: su raíz no tiene ninguna vocal.' })).toBeVisible();
    await expect(page.locator('h3', { hasText: /^Presente$/ })).toHaveCount(0);
    await enviar(page, 'mujer');
    await expect(page.getByRole('alert').filter({ hasText: '«mujer» no es un verbo, aunque acabe en -er.' })).toBeVisible();
    // arrepentirse ← arrepentir, como sentir: arrepiento, arrepintió, arrepintamos, arrepintiendo.
    await conjugarYEsperar(page, 'arrepentirse', 'arrepentir');
    await expect(notaModelo(page)).toContainText('«arrepentirse» es pronominal');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('arrepintiendo');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['arrepiento', 'arrepientes', 'arrepiente', 'arrepentimos', 'arrepentís', 'arrepienten']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['arrepentí', 'arrepentiste', 'arrepintió', 'arrepentimos', 'arrepentisteis', 'arrepintieron']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['arrepienta', 'arrepientas', 'arrepienta', 'arrepintamos', 'arrepintáis', 'arrepientan']);
  });

  test('HALLAZGO 4479 (11/11/2026, REPARADO) · la 1.ª plural del imperfecto de subjuntivo lleva la y (contribuyéramos) y funde la i tras ñ (tiñéramos)', async ({ page }) => {
    // Era unir(), que miraba /^i[aeoó]/ y /^i[eó]/ sin la é de «-iéramos».
    // Desinencia -iéramos: tras vocal la i átona pasa a y (contribuyéramos, poseyéramos, como
    // contribuyera y poseyera de la misma tarjeta); tras ñ o ll se funde (tiñéramos, como tiñera).
    // El futuro de subjuntivo, que sale del imperfecto en -ra, hereda el fallo (contribuiéremos).
    await conjugarYEsperar(page, 'contribuir');
    expect((await formas(page, 'Subjuntivo', 'Imperfecto de Subjuntivo'))[3]).toBe('contribuyéramos');
    expect((await formas(page, 'Subjuntivo', 'Futuro de Subjuntivo'))[3]).toBe('contribuyéremos');
    await conjugarYEsperar(page, 'poseer');
    expect((await formas(page, 'Subjuntivo', 'Imperfecto de Subjuntivo'))[3]).toBe('poseyéramos');
    await conjugarYEsperar(page, 'teñir');
    expect((await formas(page, 'Subjuntivo', 'Imperfecto de Subjuntivo'))[3]).toBe('tiñéramos');
    expect((await formas(page, 'Subjuntivo', 'Futuro de Subjuntivo'))[3]).toBe('tiñéremos');
    // Hermanos del mismo fallo: proveer (proveyéramos, como proveyera) y gruñir (gruñéramos).
    await conjugarYEsperar(page, 'proveer');
    expect((await formas(page, 'Subjuntivo', 'Imperfecto de Subjuntivo'))[3]).toBe('proveyéramos');
    await conjugarYEsperar(page, 'gruñir');
    expect((await formas(page, 'Subjuntivo', 'Imperfecto de Subjuntivo'))[3]).toBe('gruñéramos');
  });

  test('HALLAZGO 4480 (11/11/2026, REPARADO) · «oir» y «reir» sin tilde se conjugan como oír y reír, con la nota de la tilde', async ({ page }) => {
    // Antes salían como regulares («yo oo», «yo reo»). Un infinitivo en vocal abierta + ir lleva
    // siempre la tilde del hiato: se lleva a oír/reír y se avisa de cómo se escribe.
    // Las sugerencias no distinguen tildes: con «rei» sale reír, y con «oi», oír.
    const entrada = page.getByPlaceholder('Escribe un verbo en infinitivo...');
    await entrada.pressSequentially('rei');
    await expect(page.getByRole('option', { name: /^reír/ })).toBeVisible();
    await entrada.fill('');
    await entrada.pressSequentially('oi');
    await expect(page.getByRole('option', { name: /^oír/ })).toBeVisible();
    await entrada.fill('');
    // Paradigma de oír: oigo, oyes, oye, oímos, oís, oyen; de reír: río, ríes, ríe, reímos, reís, ríen.
    await conjugarYEsperar(page, 'oir', 'oír');
    await expect(notaModelo(page)).toContainText('Se escribe «oír», con tilde.');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen']);
    await conjugarYEsperar(page, 'reir', 'reír');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['río', 'ríes', 'ríe', 'reímos', 'reís', 'ríen']);
    await conjugarYEsperar(page, 'sonreir', 'sonreír');
    expect((await formas(page, 'Indicativo', 'Presente'))[0]).toBe('sonrío');
  });

  test('HALLAZGO 4481 (11/11/2026, REPARADO) · los verbos en -ír se conjugan como oír, reír o freír (sofreír, desleír, entreoír)', async ({ page }) => {
    // sofreír ← freír: sofrío, sofríes, sofríe, sofreímos, sofreís, sofríen; sofrió (aguda bisílaba).
    await conjugarYEsperar(page, 'sofreír');
    await expect(notaModelo(page)).toHaveText('Se conjuga como «freír».');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['sofrío', 'sofríes', 'sofríe', 'sofreímos', 'sofreís', 'sofríen']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['sofreí', 'sofreíste', 'sofrió', 'sofreímos', 'sofreísteis', 'sofrieron']);
    // desleír, como reír (DPD): deslío, deslíes, deslíe, desleímos, desleís, deslíen; deslió;
    // desliáis (aguda en -s); desleído; desliendo.
    await conjugarYEsperar(page, 'desleír');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['deslío', 'deslíes', 'deslíe', 'desleímos', 'desleís', 'deslíen']);
    expect((await formas(page, 'Indicativo', 'Pretérito Indefinido'))[2]).toBe('deslió');
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['deslía', 'deslías', 'deslía', 'desliamos', 'desliáis', 'deslían']);
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('desleído');
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('desliendo');
    // entreoír ← oír: entreoigo, entreoyes…
    await conjugarYEsperar(page, 'entreoír');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['entreoigo', 'entreoyes', 'entreoye', 'entreoímos', 'entreoís', 'entreoyen']);
  });

  test('HALLAZGO 4482 (11/11/2026, REPARADO) · la h intercalada no impide el hiato: rehíce, rehízo, rehúyo', async ({ page }) => {
    // Era contarSilabas(), que cortaba la secuencia de vocales en la h.
    // Ortografía de 2010: la h entre vocales no cuenta para diptongos ni hiatos (prohíbo, rehúso).
    // rehacer ← hacer: re-hí-ce, re-hí-zo; rehuir, como huir: re-hú-yo.
    await conjugarYEsperar(page, 'rehacer');
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['rehíce', 'rehiciste', 'rehízo', 'rehicimos', 'rehicisteis', 'rehicieron']);
    await conjugarYEsperar(page, 'rehuir');
    // rehuís y rehuí: agudas bisílabas (re-huís), con tilde; rehuyamos, átona, sin ella.
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['rehúyo', 'rehúyes', 'rehúye', 'rehuimos', 'rehuís', 'rehúyen']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['rehuí', 'rehuiste', 'rehuyó', 'rehuimos', 'rehuisteis', 'rehuyeron']);
    expect(await formas(page, 'Subjuntivo', 'Presente de Subjuntivo')).toEqual(['rehúya', 'rehúyas', 'rehúya', 'rehuyamos', 'rehuyáis', 'rehúyan']);
  });

  test('HALLAZGO 4483 (11/11/2026, REPARADO) · «ui» es diptongo en la Ortografía de 2010: flui y fluis, sin tilde', async ({ page }) => {
    // Era contarSilabas(), que contaba «uí» como hiato y no quitaba la tilde del monosílabo.
    // fluir: flui (monosílabo), fluiste, fluyó…; presente fluyo, fluyes, fluye, fluimos, fluis, fluyen.
    await conjugarYEsperar(page, 'fluir');
    expect((await formas(page, 'Indicativo', 'Pretérito Indefinido'))[0]).toBe('flui');
    expect((await formas(page, 'Indicativo', 'Presente'))[4]).toBe('fluis');
    // La tabla de huir, igual (hui, huis); construí y contribuís, bisílabas o más, la conservan.
    await conjugarYEsperar(page, 'huir');
    expect((await formas(page, 'Indicativo', 'Pretérito Indefinido'))[0]).toBe('hui');
    expect((await formas(page, 'Indicativo', 'Presente'))[4]).toBe('huis');
    await conjugarYEsperar(page, 'contribuir');
    expect((await formas(page, 'Indicativo', 'Pretérito Indefinido'))[0]).toBe('contribuí');
  });

  test('HALLAZGO 4484 (11/11/2026, REPARADO) · «argüir» entra en el grupo -uy-, con la diéresis solo ante i', async ({ page }) => {
    // Antes el patrón /[^gq]uir$/ no casaba con «-üir» y salía «argüo», «argüió».
    // argüir, como construir: arguyo, arguyes, arguye, argüimos, argüís, arguyen; arguyó; arguyendo.
    await conjugarYEsperar(page, 'argüir');
    expect(await formas(page, 'Indicativo', 'Presente')).toEqual(['arguyo', 'arguyes', 'arguye', 'argüimos', 'argüís', 'arguyen']);
    expect(await formas(page, 'Indicativo', 'Pretérito Indefinido')).toEqual(['argüí', 'argüiste', 'arguyó', 'argüimos', 'argüisteis', 'arguyeron']);
    await expect(formaNoPersonal(page, 'Gerundio:')).toHaveText('arguyendo');
    await expect(formaNoPersonal(page, 'Participio:')).toHaveText('argüido');
  });

  test('HALLAZGO 4485 (11/11/2026, REPARADO) · la nota del pronominal dice que en el imperativo el pronombre va detrás', async ({ page }) => {
    // Antes decía «con me, te, se… delante» para todo, y daba «te arrepiente».
    // Con imperativo afirmativo, infinitivo y gerundio el pronombre va detrás y unido:
    // arrepiéntete, arrepiéntase, arrepintámonos, arrepentíos, arrepiéntanse; arrepintiéndose.
    // Lo dice la FAQ visible de la propia página («se une al infinitivo, gerundio e imperativo»).
    await conjugarYEsperar(page, 'arrepentirse', 'arrepentir');
    await expect(notaModelo(page)).toContainText('delante de las formas conjugadas (me arrepiento, te arrepientes…)');
    await expect(notaModelo(page)).toContainText('el imperativo afirmativo el pronombre va detrás y unido (arrepentirse, arrepintiéndose, arrepentíos)');
    await conjugarYEsperar(page, 'levantarse', 'levantar');
    await expect(notaModelo(page)).toContainText('(levantarse, levantándose, levantaos)');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).filter((t) => t.includes('"FAQPage"')).join('\n');
    expect(ld).toContain('detrás y unido en el infinitivo, el gerundio y el imperativo afirmativo');
  });

  test('HALLAZGO 4486 (11/11/2026, REPARADO) · openGraph y twitter ya no dicen «Conjuga cualquier verbo» y la feature lleva «100 %»', async ({ page }) => {
    const og = await page.locator('meta[property="og:description"]').getAttribute('content');
    const tw = await page.locator('meta[name="twitter:description"]').getAttribute('content');
    expect(og ?? '').not.toContain('cualquier verbo');
    expect(tw ?? '').not.toContain('cualquier verbo');
    // Solo el WebApplication de la app (sus features), no el JSON-LD del layout raíz.
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).filter((t) => t.includes('"WebApplication"')).join('\n');
    expect(ld).toContain('WebApplication');
    expect(ld).not.toMatch(/\d%/);
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

  test('Inspección 11/11/2026 (cambio) · móvil: un verbo ESCRITO y conjugado por regla deja su cabecera y su nota a la vista', async ({ page }) => {
    // La firma de rotura (85 % de visitas cortas) se midió antes de la reparación; aquí el flujo
    // de quien escribe en vez de tocar un botón: «contribuir» → Conjugar. Medido el 11/11/2026:
    // cabecera en y = 66 px, con el foco.
    await enviar(page, 'contribuir');
    await expect(cabecera(page, 'contribuir')).toBeInViewport({ ratio: 1 });
    await expect(cabecera(page, 'contribuir')).toBeFocused();
    await expect(notaModelo(page)).toContainText('añade -y- ante a, e y o, como construir');
    await expect(notaModelo(page)).toBeInViewport();
    await expect(tarjetaDeTiempo(page, 'Presente').locator('td', { hasText: /^contribuyo$/ })).toBeAttached();
  });
});
