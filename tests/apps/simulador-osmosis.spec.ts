import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Simulador de Ósmosis y Presión Osmótica — PASO 4.bis de /nueva-app-meskeia
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador de Ósmosis y Presión Osmótica». Una temperatura común y dos
 *   secciones, cada una con su región role="status": 1) dos disoluciones separadas por una
 *   membrana semipermeable (lado A y lado B, cada uno un role="group" con su soluto, su unidad y
 *   su concentración); 2) una célula animal o vegetal en un medio, con medios de referencia en
 *   botones y el mismo selector de disolución. Los tres selectores repiten los mismos botones y
 *   la misma etiqueta «Concentración», así que todo se busca dentro de su grupo.
 *
 * LA VERDAD, CALCULADA A MANO (R = 0,0820573661 atm·L/(mol·K); a 25 °C, R·T = 24,4654037)
 *   1) Inicial: A sacarosa 0,3 M, B glucosa 0,1 M, 25 °C
 *        osm A = 0,3 → «0,300 osmol/L» · π A = 0,3 · 24,4654 = 7,3396 → «7,34 atm»
 *        osm B = 0,1 → π B = 2,4465 → «2,45 atm»
 *        el agua va de B a A · Δπ = 0,2 · 24,4654 = 4,8931 atm → «4,89 atm»
 *        en kPa: 4,8931 · 101,325 = 495,79 → «495,8 kPa»
 *        columna: 0,2 · 1000 · 8,314462618 · 298,15 / 9810 = 50,539 m → «50,54 m»
 *   2) B con NaCl 0,15 M: osm 2 · 0,15 = 0,3 = A → «Ninguno»
 *   3) A con NaCl al 0,9 % m/v: 9/58,44 = 0,15400 M → osm 0,30801 → «0,308 osmol/L»
 *   4) Célula inicial: glóbulo rojo de 0,30 en suero fisiológico (0,308): +2,67 % → isotónico,
 *      «+2,7 %» y «La célula conserva su forma» · Δπ = 0,0080082 · 24,4654 = 0,19592 → «0,196 atm»
 *   5) Agua destilada: hipotónico; animal «se hincha», vegetal «turgente»
 *   6) Agua con sal al 3 %: 30/58,44 · 2 = 1,02669 → «1,027 osmol/L»; vegetal «plasmólisis»
 *   7) Rechazo: concentración del lado A vacía → «Falta un dato» y dice cuál, sin cifra de Δπ;
 *      temperatura vacía → las dos secciones lo piden.
 */

/** El valor de una tarjeta, localizado por su etiqueta (las clases del módulo van con hash). */
async function leerTarjeta(zona: Locator, etiqueta: string): Promise<string> {
  return zona.evaluate((raiz, lab) => {
    for (const d of raiz.querySelectorAll('div')) {
      const sp = d.querySelectorAll(':scope > span');
      if (sp.length === 2 && sp[0].textContent?.trim() === lab) {
        return sp[1].textContent?.trim() ?? '';
      }
    }
    return '';
  }, etiqueta);
}

function seccion(page: Page, titulo: RegExp): Locator {
  return page.locator('section', { has: page.getByRole('heading', { level: 2, name: titulo }) });
}

function estado(page: Page, titulo: RegExp): Locator {
  return seccion(page, titulo).locator('[role="status"]');
}

function grupo(page: Page, nombre: string): Locator {
  return page.getByRole('group', { name: nombre, exact: true });
}

async function escribir(caja: Locator, page: Page, valor: string): Promise<void> {
  await caja.fill(valor);
  await esperarValorEnReact(page, caja, valor);
}

function concentracion(page: Page, nombreGrupo: string): Locator {
  return grupo(page, nombreGrupo).getByRole('textbox', { name: 'Concentración', exact: true });
}

const MEMBRANA = /^1\. Dos disoluciones/;
const CELULA = /^2\. Una célula/;

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-osmosis/');
  await esperarHidratacion(page, ['input']);
});

test.describe('Simulador de Ósmosis', () => {
  test('1 · sacarosa 0,3 M frente a glucosa 0,1 M: el agua va de B a A con Δπ 4,89 atm', async ({ page }) => {
    const zona = estado(page, MEMBRANA);
    await expect(zona).toContainText('De B hacia A');
    await expect(zona).toContainText('4,89 atm');
    await expect(zona).toContainText('495,8 kPa');
    await expect(zona).toContainText('50,54 m');
    expect(await leerTarjeta(zona, 'Osmolaridad A (i·M)')).toBe('0,300 osmol/L');
    expect(await leerTarjeta(zona, 'Presión osmótica A')).toBe('7,34 atm');
    expect(await leerTarjeta(zona, 'Presión osmótica B')).toBe('2,45 atm');
    await expect(seccion(page, MEMBRANA).getByRole('img')).toHaveAttribute('aria-label', /del lado B al lado A/);
  });

  test('2 · NaCl 0,15 M frente a sacarosa 0,3 M: misma osmolaridad, sin paso neto', async ({ page }) => {
    await grupo(page, 'Lado B').getByRole('button', { name: /^Cloruro de sodio/ }).click();
    await escribir(concentracion(page, 'Lado B'), page, '0,15');
    const zona = estado(page, MEMBRANA);
    await expect(zona).toContainText('Ninguno');
    await expect(zona).toContainText('misma osmolaridad');
    await expect(grupo(page, 'Lado B').getByRole('button', { name: /^Cloruro de sodio/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(grupo(page, 'Lado B').getByRole('button', { name: /^Glucosa/ })).toHaveAttribute('aria-pressed', 'false');
  });

  test('3 · NaCl al 0,9 % m/v en el lado A: 0,308 osmol/L', async ({ page }) => {
    await grupo(page, 'Lado A').getByRole('button', { name: /^Cloruro de sodio/ }).click();
    await grupo(page, 'Lado A').getByRole('button', { name: /% masa\/volumen/ }).click();
    await escribir(concentracion(page, 'Lado A'), page, '0,9');
    expect(await leerTarjeta(estado(page, MEMBRANA), 'Osmolaridad A (i·M)')).toBe('0,308 osmol/L');
  });

  test('4 · glóbulo rojo en suero fisiológico: isotónico, conserva su forma', async ({ page }) => {
    const zona = estado(page, CELULA);
    await expect(zona).toContainText('Medio isotónico');
    await expect(zona).toContainText('La célula conserva su forma');
    expect(await leerTarjeta(zona, 'Medio frente al interior')).toBe('+2,7 %');
    expect(await leerTarjeta(zona, 'Diferencia de presión osmótica')).toBe('0,196 atm');
    await expect(
      grupo(page, 'Medios de referencia').getByRole('button', { name: /^Suero fisiológico/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('5 · agua destilada: la animal se hincha y la vegetal queda turgente', async ({ page }) => {
    await grupo(page, 'Medios de referencia').getByRole('button', { name: 'Agua destilada' }).click();
    const zona = estado(page, CELULA);
    await expect(zona).toContainText('Medio hipotónico');
    await expect(zona).toContainText('La célula se hincha');
    await expect(zona).toContainText('El agua entra en la célula');

    await grupo(page, 'Tipo de célula').getByRole('button', { name: /^Vegetal/ }).click();
    await expect(zona).toContainText('La célula queda turgente');
    await expect(seccion(page, CELULA).getByRole('img')).toHaveAttribute('aria-label', /Célula vegetal/);
  });

  test('6 · agua con sal al 3 %: plasmólisis en la célula vegetal', async ({ page }) => {
    await grupo(page, 'Tipo de célula').getByRole('button', { name: /^Vegetal/ }).click();
    await grupo(page, 'Medios de referencia').getByRole('button', { name: /^Agua con sal/ }).click();
    const zona = estado(page, CELULA);
    await expect(zona).toContainText('Medio hipertónico');
    await expect(zona).toContainText('plasmólisis');
    await expect(zona).toContainText('El agua sale de la célula');
    expect(await leerTarjeta(zona, 'Osmolaridad del medio')).toBe('1,027 osmol/L');
  });

  test('7 · sin concentración o sin temperatura no hay cifra: dice qué falta', async ({ page }) => {
    await escribir(concentracion(page, 'Lado A'), page, '');
    const zona = estado(page, MEMBRANA);
    await expect(zona).toContainText('Falta un dato');
    await expect(zona).toContainText('la concentración del lado A');
    await expect(zona).not.toContainText('atm');

    await escribir(page.getByRole('textbox', { name: 'Temperatura de las disoluciones', exact: true }), page, '');
    await expect(estado(page, CELULA)).toContainText('una temperatura válida');
  });
});

/**
 * INSPECTOR, primera inspección (15/11/2026) — casos resueltos a mano ANTES de ejecutar la app.
 *
 * Constantes cotejadas con su fuente: R = 8,314462618 J/(mol·K) exacta (CODATA, physics.nist.gov),
 * 1 atm = 101.325 Pa exacta (NIST); g = 9,81 m/s² es el convenio de clase declarado en
 * simulador-principio-pascal/motor.ts (g_n = 9,80665, un 0,035 % menos). Masas molares con los
 * pesos atómicos abreviados de la CIAAW (H 1,0080 · C 12,011 · N 14,007 · O 15,999 · Na 22,990 ·
 * Cl 35,45 · K 39,098 · Ca 40,078): glucosa 180,16 · sacarosa 342,30 · urea 60,06 · NaCl 58,44 ·
 * KCl 74,55 · CaCl₂ 110,98, las de SOLUTOS.
 *
 *   R = 8,314462618 / 101,325 = 0,0820573661 atm·L/(mol·K)
 *   R·T: 0 °C → 22,41397 · 25 °C → 24,46540 · 37 °C → 25,45009 · 100 °C → 30,61971
 *
 *   8)  A NaCl 0,15 M (i = 2) | B glucosa 0,1 M, 37 °C
 *       osm A 0,300 · osm B 0,100 → el agua va de B a A
 *       π A = 0,3 · 25,45009 = 7,635 → «7,64 atm» · π B = 2,545009 → «2,55 atm»
 *       Δπ = 0,2 · 25,45009 = 5,0900 atm → «5,09 atm» · ×101,325 = 515,746 → «515,7 kPa»
 *       h = 0,2·1000·8,314462618·310,15 / 9810 = 515.746 Pa / 9810 = 52,574 → «52,57 m»
 *   9)  A CaCl₂ 0,1 M (i = 3) | B NaCl 0,15 M (i = 2): 0,3 = 0,3 → «Ninguno» (con 3 · 0,1 =
 *       0,30000000000000004 en coma flotante) · agua | agua: 0 = 0 → «Ninguno», «0 atm»
 *   10) Iniciales (sacarosa 0,3 | glucosa 0,1) a 100 °C: Δπ 0,2 · 30,61971 = 6,1239 → «6,12 atm»,
 *       620,508 → «620,5 kPa», π A 9,186 → «9,19 atm», π B 3,062 → «3,06 atm», h 63,253 → «63,25 m»
 *       a 0 °C: Δπ 4,4828 → «4,48 atm», 454,22 → «454,2 kPa», h 46,302 → «46,30 m»
 *       a −273,15 °C: T = 0 K → no hay cálculo, «una temperatura válida»
 *   11) Célula animal, interior 0,30: KCl 0,2 M → 0,4 osmol/L, +33,3 % → hipertónico, crenación,
 *       Δπ 0,1 · 24,4654 = 2,4465 → «2,45 atm» · glucosa 0,315 M → +5,0 % justo en el borde de la
 *       banda (incluido) → isotónico, Δπ 0,015 · 24,4654 = 0,367 → «0,367 atm» · glucosa 0,316 M
 *       → +5,3 % → hipertónico
 *   12) Rechazo con el foco puesto: «−0,2» de concentración y «−300 °C» → «Falta un dato»
 *   13) Caso de aula 10 (NaCl 3,5 % a 20 °C): 35/58,44 = 0,598905 M · 2 = 1,197810 osmol/L ·
 *       24,05512 = 28,8135 → «28,81 atm» (clase: 1,19781 · 0,082 · 293 = 28,78, dentro del 1 %);
 *       «14,41» es el de i = 1 y se nombra; «50» no vale
 *
 * HALLAZGOS ABIERTOS de esta inspección (llevan test.fail(); al repararlos, se quita):
 *   A) Urea en la sección de la célula: es un soluto que ATRAVIESA la membrana (lo dice casos.ts y
 *      por eso la excluye de los casos de aula), así que no cuenta para la tonicidad: un glóbulo
 *      rojo en urea 0,30 M acaba en hemólisis. El panel dice «Medio isotónico · La célula conserva
 *      su forma», y con urea 0,6 M «crenación».
 *   B) Al salir del campo, NumberInput acota lo imposible al límite: «−0,2» pasa a «0» (agua
 *      pura) y «−300 °C» a «0 °C», y la app publica un cálculo que el usuario no pidió.
 *   C) features del JSON-LD promete la presión osmótica «en atm, kPa y mmHg»: mmHg no aparece en
 *      la página (el motor lo calcula y nadie lo pinta).
 *   D) La FAQ «¿Cómo se calcula la presión osmótica?» escribe «0,1 · 0,082 · 298 ≈ 2,45 atm»; ese
 *      producto es 2,4436 → 2,44 (el 2,45 sale de R exacta y 298,15 K).
 *   E) (sin test: es redacción) Con glucosa 0,315 M frente a 0,30 el panel enseña Δπ = 0,367 atm y
 *      a la vez «Entra y sale la misma cantidad de agua, así que el volumen no cambia», y la nota
 *      presenta la banda del 5 % como la definición («Se llama isotónico a…»), no como convenio.
 */
test.describe('Inspector 15/11/2026 · casos a mano', () => {
  const temperatura = (page: Page) =>
    page.getByRole('textbox', { name: 'Temperatura de las disoluciones', exact: true });

  test('8 · NaCl 0,15 M frente a glucosa 0,1 M a 37 °C: Δπ 5,09 atm, 515,7 kPa y 52,57 m', async ({ page }) => {
    await grupo(page, 'Lado A').getByRole('button', { name: /^Cloruro de sodio/ }).click();
    await escribir(concentracion(page, 'Lado A'), page, '0,15');
    await escribir(temperatura(page), page, '37');
    const zona = estado(page, MEMBRANA);
    await expect(zona).toContainText('De B hacia A');
    await expect(zona).toContainText('Δπ = 5,09 atm · 515,7 kPa');
    await expect(zona).toContainText('52,57 m');
    expect(await leerTarjeta(zona, 'Osmolaridad A (i·M)')).toBe('0,300 osmol/L');
    expect(await leerTarjeta(zona, 'Osmolaridad B (i·M)')).toBe('0,100 osmol/L');
    expect(await leerTarjeta(zona, 'Presión osmótica A')).toBe('7,64 atm');
    expect(await leerTarjeta(zona, 'Presión osmótica B')).toBe('2,55 atm');
    // La fórmula enseña el factor i = 2 del NaCl y T en kelvin
    await expect(seccion(page, MEMBRANA)).toContainText('T = 310,15 K');
    await expect(seccion(page, MEMBRANA)).toContainText('Lado A: π = 2 · 0,1500');
  });

  test('9 · CaCl₂ 0,1 M frente a NaCl 0,15 M: 0,300 = 0,300, sin paso neto; agua frente a agua, igual', async ({ page }) => {
    await grupo(page, 'Lado A').getByRole('button', { name: /^Cloruro de calcio/ }).click();
    await escribir(concentracion(page, 'Lado A'), page, '0,1');
    await grupo(page, 'Lado B').getByRole('button', { name: /^Cloruro de sodio/ }).click();
    await escribir(concentracion(page, 'Lado B'), page, '0,15');
    const zona = estado(page, MEMBRANA);
    await expect(zona).toContainText('Ninguno');
    expect(await leerTarjeta(zona, 'Osmolaridad A (i·M)')).toBe('0,300 osmol/L');
    expect(await leerTarjeta(zona, 'Osmolaridad B (i·M)')).toBe('0,300 osmol/L');
    await expect(seccion(page, MEMBRANA).getByRole('img')).toHaveAttribute('aria-label', /no pasa en neto/);

    await escribir(concentracion(page, 'Lado A'), page, '0');
    await escribir(concentracion(page, 'Lado B'), page, '0');
    await expect(zona).toContainText('Ninguno');
    expect(await leerTarjeta(zona, 'Presión osmótica A')).toBe('0 atm');
    expect(await leerTarjeta(zona, 'Presión osmótica B')).toBe('0 atm');
  });

  test('10 · temperatura en los extremos: 100 °C, 0 °C y el cero absoluto', async ({ page }) => {
    const zona = estado(page, MEMBRANA);
    await escribir(temperatura(page), page, '100');
    await expect(zona).toContainText('Δπ = 6,12 atm · 620,5 kPa');
    await expect(zona).toContainText('63,25 m');
    expect(await leerTarjeta(zona, 'Presión osmótica A')).toBe('9,19 atm');
    expect(await leerTarjeta(zona, 'Presión osmótica B')).toBe('3,06 atm');

    await escribir(temperatura(page), page, '0');
    await expect(zona).toContainText('Δπ = 4,48 atm · 454,2 kPa');
    await expect(zona).toContainText('46,30 m');

    await escribir(temperatura(page), page, '-273,15');
    await expect(zona).toContainText('una temperatura válida');
    await expect(zona).not.toContainText('atm');
  });

  test('11 · glóbulo rojo de 0,30: KCl 0,2 M lo arruga; glucosa 0,315 M es el borde isotónico', async ({ page }) => {
    const medio = 'O el medio que quieras';
    await grupo(page, medio).getByRole('button', { name: /^Cloruro de potasio/ }).click();
    await grupo(page, medio).getByRole('button', { name: /^mol\/L/ }).click();
    await escribir(concentracion(page, medio), page, '0,2');
    const zona = estado(page, CELULA);
    await expect(zona).toContainText('Medio hipertónico');
    await expect(zona).toContainText('La célula se arruga (crenación)');
    await expect(zona).toContainText('El agua sale de la célula');
    expect(await leerTarjeta(zona, 'Osmolaridad del medio')).toBe('0,400 osmol/L');
    expect(await leerTarjeta(zona, 'Medio frente al interior')).toMatch(/^\+33,3\s%$/);
    expect(await leerTarjeta(zona, 'Diferencia de presión osmótica')).toBe('2,45 atm');

    await grupo(page, medio).getByRole('button', { name: /^Glucosa/ }).click();
    await escribir(concentracion(page, medio), page, '0,315');
    await expect(zona).toContainText('Medio isotónico');
    expect(await leerTarjeta(zona, 'Medio frente al interior')).toMatch(/^\+5,0\s%$/);
    expect(await leerTarjeta(zona, 'Diferencia de presión osmótica')).toBe('0,367 atm');
    await escribir(concentracion(page, medio), page, '0,316');
    await expect(zona).toContainText('Medio hipertónico');
  });

  test('12 · con el foco puesto, una concentración negativa y −300 °C no dan cifra', async ({ page }) => {
    await escribir(concentracion(page, 'Lado A'), page, '-0,2');
    const zona = estado(page, MEMBRANA);
    await expect(zona).toContainText('Falta un dato');
    await expect(zona).toContainText('la concentración del lado A');
    await expect(zona).not.toContainText('atm');

    await escribir(concentracion(page, 'Lado A'), page, '0,3');
    await escribir(temperatura(page), page, '-300');
    await expect(zona).toContainText('una temperatura válida');
    await expect(estado(page, CELULA)).toContainText('una temperatura válida');
    await expect(zona).not.toContainText('atm');
  });

  test('13 · caso de aula 10: «28,81» y la de clase «28,78» valen; «14,41» es i = 1; «50» no', async ({ page }) => {
    await page.getByRole('button', { name: /^Caso 10: / }).click();
    const caja = page.locator('#casos-respuesta');
    const veredicto = page.locator('#casos-veredicto');
    const responder = async (texto: string) => {
      await caja.fill(texto);
      await esperarValorEnReact(page, caja, texto);
      await page.locator('#casos-comprobar').click();
    };
    await responder('28,81');
    await expect(veredicto).toContainText('¡Correcto!');
    await responder('28,78');
    await expect(veredicto).toContainText('¡Correcto!');
    await responder('14,41');
    await expect(veredicto).toContainText('Has tomado i = 1');
    await responder('50');
    await expect(veredicto).toContainText('No es correcto');
  });

  test('HALLAZGO A · 4741 (15/11/2026, REPARADO) · la urea atraviesa la membrana: no se ofrece frente a la célula', async ({ page }) => {
    // casos.ts: «La urea no entra en los casos de célula: atraviesa la membrana, y un medio de
    // urea iso-osmolar se comporta como hipotónico». El panel la ofrecía y la contaba como un
    // soluto que no cruza («conserva su forma» con 0,30 M y «crenación» con 0,6 M). Ahora la
    // sección 2 no la ofrece y dice por qué; la sección 1 (membrana ideal) la sigue ofreciendo.
    const medio = 'O el medio que quieras';
    await expect(grupo(page, medio).getByRole('button', { name: /^Glucosa/ })).toBeVisible();
    await expect(grupo(page, medio).getByRole('button', { name: /^Urea/ })).toHaveCount(0);
    await expect(grupo(page, medio)).toContainText('La urea no se ofrece aquí');
    await expect(grupo(page, 'Lado A').getByRole('button', { name: /^Urea/ })).toHaveCount(1);
  });

  test('HALLAZGO B · 4742 (15/11/2026, REPARADO) · al salir del campo, «−0,2» no se convierte en agua pura ni −300 °C en 0 °C', async ({ page }) => {
    // Antes: con el foco, «Falta un dato»; tras Tab, el campo pasaba a «0» y la sección publicaba
    // agua pura frente a glucosa 0,1 M (De A hacia B, Δπ 2,45 atm), o el cálculo a 0 °C (4,48 atm).
    const caja = concentracion(page, 'Lado A');
    await escribir(caja, page, '-0,2');
    await caja.press('Tab');
    await expect(caja).toHaveValue('-0,2');
    await expect(estado(page, MEMBRANA)).toContainText('la concentración del lado A');
    await expect(estado(page, MEMBRANA)).not.toContainText('Δπ');

    await escribir(caja, page, '0,3');
    const t = temperatura(page);
    await escribir(t, page, '-300');
    await t.press('Tab');
    await expect(t).toHaveValue('-300');
    await expect(estado(page, MEMBRANA)).not.toContainText('atm');

    // −10 y 150 °C quedan fuera de 0-100 °C: sin cifra, con el foco y sin él (antes 4,32 atm con
    // el foco y 4,48 tras Tab; 6,94 y 6,12).
    for (const valor of ['-10', '150']) {
      await escribir(t, page, valor);
      await expect(estado(page, MEMBRANA)).toContainText('entre 0 y 100 °C');
      await t.press('Tab');
      await expect(t).toHaveValue(valor);
      await expect(estado(page, MEMBRANA)).not.toContainText('atm');
    }
  });

  test('HALLAZGO C · 4743 (15/11/2026, REPARADO) · features promete la presión en mmHg y la página no la enseña', async ({ page }) => {
    // Se bajó la promesa a lo que la página enseña (tipo promesa): sin mmHg.
    const bloquesJson = await page.locator('script[type="application/ld+json"]').allTextContents();
    const webApp = bloquesJson.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'WebApplication');
    expect((webApp?.featureList as string[]).some((f) => /van 't Hoff/.test(f))).toBe(true);
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'WebApplication');
    const features: string[] = app?.featureList ?? app?.features ?? [];
    const prometeMmHg = features.some((f) => /mmHg/.test(f));
    expect(prometeMmHg).toBe(false);
    if (prometeMmHg) {
      // innerText: el textContent incluiría el propio JSON-LD si estuviera dentro
      await expect(page.locator('main').first()).toContainText('mmHg', { useInnerText: true });
    }
  });

  test('HALLAZGO D · 4744 (15/11/2026, REPARADO) · la cuenta de la FAQ cuadra con su resultado', async ({ page }) => {
    // Antes: «π = 0,1 · 0,082 · 298 ≈ 2,45 atm», y 0,1 · 0,082 · 298 = 2,4436 → 2,44. Ahora la
    // cuenta va con las constantes que dan la cifra: 0,1 · 0,08206 · 298,15 = 2,4466 → 2,45.
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = bloques.map((b) => JSON.parse(b)).find((j) => j['@type'] === 'FAQPage');
    const respuesta: string = faq.mainEntity.find((q: { name: string }) => /calcula la presión osmótica/.test(q.name))
      .acceptedAnswer.text;
    const m = respuesta.match(/π = ([\d,]+) · ([\d,]+) · ([\d,]+) ≈ ([\d,]+) atm/);
    expect(m).not.toBeNull();
    const n = (s: string) => Number(s.replace(',', '.'));
    const producto = n(m![1]) * n(m![2]) * n(m![3]);
    expect(Math.abs(producto - n(m![4]))).toBeLessThanOrEqual(0.005 + 1e-9);
  });

  test('HALLAZGO E · 4745 (15/11/2026, REPARADO) · la banda isotónica sale como convenio y el texto no niega la Δπ', async ({ page }) => {
    // Glucosa 0,315 M frente a 0,30: isotónico por la banda del 5 % (convenio de motor.ts), con
    // Δπ = 0,367 atm. Antes: «Entra y sale la misma cantidad de agua, así que el volumen no
    // cambia» y «Se llama isotónico a…», como si fuera la definición.
    const medio = 'O el medio que quieras';
    await grupo(page, medio).getByRole('button', { name: /^Glucosa/ }).click();
    await grupo(page, medio).getByRole('button', { name: /^mol\/L/ }).click();
    await escribir(concentracion(page, medio), page, '0,315');
    const zona = estado(page, CELULA);
    await expect(zona).toContainText('Medio isotónico');
    expect(await leerTarjeta(zona, 'Diferencia de presión osmótica')).toBe('0,367 atm');
    await expect(zona).toContainText('el volumen apenas cambia');
    await expect(zona).not.toContainText('el volumen no cambia');
    await expect(zona).toContainText('En este simulador se llama isotónico');
    await expect(zona).toContainText('Es un convenio');
  });
});
