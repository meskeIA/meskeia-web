import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

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
