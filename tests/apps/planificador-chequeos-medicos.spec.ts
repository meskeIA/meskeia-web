import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

/**
 * Chequeos Médicos Preventivos — regresión del CALENDARIO DE CRIBADOS que devuelve
 * según edad y sexo. App de riesgo 1 (orientación de salud).
 * Inspeccionada el 21/09/2026 · REPARADA el mismo día (hallazgos 1141-1150).
 *
 * QUÉ PROMETE (leído el 21/09/2026)
 *   · <h1>: «Chequeos Médicos Preventivos».
 *   · Subtítulo: «Consulta qué revisiones te corresponden según tu edad y sexo ·
 *     Guías clínicas españolas».
 *   · <title>: «Chequeos Médicos Preventivos - Qué Revisiones Hacerte según tu Edad».
 *   · En pantalla: <LegalNotice />, <DisclaimerCard variant="medical" severity="critical">
 *     (nivel 1, NO colapsable), el aviso de síntomas de alarma SIEMPRE visible y un
 *     <EducationalSection> que nace colapsado.
 *   · No hay ningún dato de salud en localStorage: las casillas «al día» viven en
 *     `useState` y se pierden al recargar (así lo describe también applications.ts).
 *
 * CONTRA QUÉ SE CONTRASTA — los tres cribados POBLACIONALES de la cartera común del SNS
 * (RD 1030/2006, Anexo II, en la redacción de la Orden SSI/2065/2014) y el PAPPS/semFYC:
 *   · Cáncer colorrectal — hombres y mujeres de 50 a 69 años · sangre oculta en heces BIENAL.
 *   · Cáncer de mama    — mujeres de 50 a 69 años · mamografía BIENAL.
 *   · Cáncer de cérvix  — mujeres de 25 a 65 años · citología cada 3 años (25-34) y prueba
 *     VPH cada 5 años (35-65).
 *   · PSA de próstata — NO es cribado poblacional en España; el PAPPS recomienda EN CONTRA
 *     de ofrecerlo de forma sistemática a varones asintomáticos.
 *
 * CÓMO MODELA LA EDAD ESTA APP
 *   Pide la EDAD EXACTA y filtra con ella. Hasta el 21/09/2026 ofrecía cuatro tramos y
 *   colapsaba cada uno en su punto medio (`EDAD_REPR`: 18-39 → 30 · 40-49 → 45 · 50-64 → 55
 *   · 65+ → 70), de modo que dentro de un tramo nadie recibía una respuesta distinta. Eso
 *   producía falsos negativos sobre cribados poblacionales —una mujer de 66, de lleno en el
 *   programa de mama, no recibía la mamografía— y falsos positivos por el otro lado —a los
 *   40 se ofrecía mamografía, que el propio catálogo arranca a los 50—.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   El catálogo interno son 16 revisiones. Las que no dependen ni de la edad adulta ni del
 *   sexo son 10 a partir de los 45 años: analítica, revisión general, tensión, dental,
 *   visión, colesterol (20+), glucosa (45+), tensión ocular (40+), dermatología y tétanos.
 *   Sobre esa base se suman las de edad y sexo.
 *
 *   CASO 1 — NORMAL: mujer de 55 años.
 *       Único perfil que está DENTRO de los tres cribados a la vez.
 *       10 comunes − glucosa… no: a los 55 las 10 comunes están todas.
 *       Menos densitometría (65+) y gripe (65+), que aún no tocan → quedan 10.
 *       + citología (25-65) + mamografía (50-69) + colorrectal (50-69) = 13.
 *
 *   CASO 2 — LOS UMBRALES, uno a uno (hallazgos 1141 y 1142)
 *       · 49 → 50: entra el colorrectal Y entra la mamografía (el programa empieza a los
 *         50, no a los 45). Mujer de 49 = 11 · mujer de 50 = 13.
 *       · 65 → 66: sale la citología (el programa de cérvix termina a los 65) pero la
 *         mamografía SIGUE, porque el de mama llega hasta los 69. Mujer de 65 = 15 ·
 *         mujer de 66 = 14. Con tramos, las dos daban 13 y sin mamografía ninguna.
 *       · 69 → 70: salen mamografía y colorrectal a la vez. Mujer de 70 = 12.
 *
 *   CASO 3 — EL QUE NO ENCAJA: la app no contesta hasta que le preguntan (hallazgo 1145)
 *       Al cargar no hay edad ni sexo, así que no hay cifra ni tarjetas: solo la petición
 *       de los dos datos. Antes arrancaba con «40-49» y «Sin especificar» ya pulsados y
 *       afirmaba «12 revisiones aplicables a tu perfil», mamografía y citología incluidas,
 *       para un perfil que nadie había dado. Y «Sin especificar» dejaba pasar todo lo
 *       exclusivo de un sexo, con una tarjeta «Solo mujeres» y otra «Solo hombres» juntas.
 *       Una edad imposible (5, 130, «abc») se rechaza con aviso y sin resultados.
 *
 * ⚠️ Las casillas «al día» son `<input type="checkbox">` a `opacity: 0; width: 0`, así que
 *    `check()` falla por invisibilidad: hay que clicar su `<label>` envolvente.
 * ⚠️ `getByRole('alert')` casaría también con el anunciador de rutas de Next, así que el
 *    aviso médico se localiza por su clase de severidad.
 */

const RUTA = '/planificador-chequeos-medicos/';
const SEL_EDAD = '#edad';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'load' });
  await esperarHidratacion(page, [SEL_EDAD]);
}

/** Los nombres de las revisiones que la app lista ahora mismo. */
function tarjetas(page: Page) {
  return page.locator('h3[class*="tarjetaNombre"]');
}

/** La línea «N revisiones aplicables a los X años». */
function resumen(page: Page) {
  return page.locator('[class*="resumenTexto"]');
}

/** Una revisión concreta, por su nombre exacto tal y como la imprime la tarjeta. */
function revision(page: Page, nombre: string) {
  return tarjetas(page).filter({ hasText: nombre });
}

/** La tarjeta entera (para leer su periodicidad), a partir del <h3> del nombre. */
function tarjetaDe(page: Page, nombre: string) {
  return page.locator('div[class*="tarjeta"]').filter({ has: page.locator('h3', { hasText: nombre }) }).first();
}

async function elegirSexo(page: Page, sexo: string): Promise<void> {
  await page.getByRole('button', { name: sexo, exact: true }).click();
  await expect(page.getByRole('button', { name: sexo, exact: true })).toHaveAttribute('aria-pressed', 'true');
}

/** Fija el perfil completo y espera a que el resumen cuente lo esperado. */
async function perfil(page: Page, edad: number, sexo: string, esperadas: number): Promise<void> {
  await sembrarValor(page, SEL_EDAD, String(edad));
  await elegirSexo(page, sexo);
  await expect(resumen(page)).toContainText(`${esperadas} revisiones aplicables a los ${edad} años`);
  await expect(tarjetas(page)).toHaveCount(esperadas);
}

test.describe('Planificador de Chequeos Médicos Preventivos', () => {
  test('CASO 1 — mujer de 55 años: los TRES cribados poblacionales, con su periodicidad', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    await perfil(page, 55, '♀ Mujer', 13);

    // Cribado de cáncer colorrectal del SNS: 50-69 años, sangre oculta en heces BIENAL.
    await expect(revision(page, 'Sangre oculta en heces (cáncer colorrectal)')).toHaveCount(1);
    await expect(tarjetaDe(page, 'Sangre oculta en heces')).toContainText('Cada 2 años');
    await expect(tarjetaDe(page, 'Sangre oculta en heces')).toContainText('50 a 69 años');

    // Cribado de cáncer de mama del SNS: mujeres 50-69, mamografía BIENAL.
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(1);
    await expect(tarjetaDe(page, 'Mamografía (cáncer de mama)')).toContainText('Cada 2 años');
    // Hallazgo 1143: la nota decía «Incluida en el Programa del SNS» con el rango en 45,
    // y el programa es 50-69. La extensión a 45 solo la han iniciado algunas CCAA.
    await expect(tarjetaDe(page, 'Mamografía (cáncer de mama)')).toContainText('50 a 69 años');
    await expect(tarjetaDe(page, 'Mamografía (cáncer de mama)')).toContainText('comunidades');

    // Cribado de cáncer de cérvix del SNS: mujeres 25-65.
    await expect(revision(page, 'Citología vaginal / PAP test')).toHaveCount(1);
    await expect(tarjetaDe(page, 'Citología vaginal')).toContainText('Cada 3-5 años');

    // Los tres van juntos bajo «Oncológico», con la revisión dermatológica: cuatro tarjetas.
    const oncologico = page.locator('section').filter({ has: page.getByRole('heading', { level: 2, name: /Oncológico/ }) });
    await expect(oncologico.locator('h3[class*="tarjetaNombre"]')).toHaveCount(4);

    // La próstata es «Solo hombres»: no puede aparecer en un perfil de mujer.
    await expect(revision(page, 'Próstata')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('♂ Solo hombres');
  });

  test('CASO 2 — los umbrales de los cribados, uno a uno', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);

    // ── 49 vs 50: entran a la vez el colorrectal y la mamografía ─────────────
    await perfil(page, 49, '♀ Mujer', 11);
    await expect(revision(page, 'Sangre oculta en heces (cáncer colorrectal)')).toHaveCount(0);
    // Hallazgo 1142: con tramos, a los 40-49 se ofrecía mamografía (edadDesde 45).
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(0);

    await sembrarValor(page, SEL_EDAD, '50');
    await expect(resumen(page)).toContainText('13 revisiones aplicables a los 50 años');
    await expect(revision(page, 'Sangre oculta en heces (cáncer colorrectal)')).toHaveCount(1);
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(1);

    // ── 65 vs 66: sale la citología, la mamografía SIGUE ─────────────────────
    // Hallazgo 1141: el tramo «65+» valía siempre 70, así que a los 66 la app negaba
    // la mamografía a quien está de lleno en el programa, y a los 65 la citología.
    await sembrarValor(page, SEL_EDAD, '65');
    await expect(resumen(page)).toContainText('15 revisiones aplicables a los 65 años');
    await expect(revision(page, 'Citología vaginal / PAP test')).toHaveCount(1);
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(1);
    // A los 65 entran además la densitometría y la vacuna antigripal.
    await expect(revision(page, 'Densitometría ósea (osteoporosis)')).toHaveCount(1);
    await expect(revision(page, 'Vacuna antigripal')).toHaveCount(1);

    await sembrarValor(page, SEL_EDAD, '66');
    await expect(resumen(page)).toContainText('14 revisiones aplicables a los 66 años');
    await expect(revision(page, 'Citología vaginal / PAP test')).toHaveCount(0);
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(1);

    // ── 69 vs 70: salen mamografía y colorrectal ─────────────────────────────
    await sembrarValor(page, SEL_EDAD, '69');
    await expect(resumen(page)).toContainText('14 revisiones aplicables a los 69 años');
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(1);
    await expect(revision(page, 'Sangre oculta en heces (cáncer colorrectal)')).toHaveCount(1);

    await sembrarValor(page, SEL_EDAD, '70');
    await expect(resumen(page)).toContainText('12 revisiones aplicables a los 70 años');
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(0);
    // Hallazgo 1143: la app extendía el colorrectal hasta los 74 diciendo que era el
    // programa del SNS, y el programa se cierra en 69.
    await expect(revision(page, 'Sangre oculta en heces (cáncer colorrectal)')).toHaveCount(0);
  });

  test('CASO 3 — no contesta sin perfil, y una edad imposible se rechaza', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    // ── Sin tocar NADA: ninguna cifra, ninguna tarjeta ───────────────────────
    await expect(page.locator(SEL_EDAD)).toHaveValue('');
    await expect(page.getByRole('button', { name: '♀ Mujer', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: '♂ Hombre', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(tarjetas(page)).toHaveCount(0);
    await expect(resumen(page)).toContainText('Escribe tu edad y elige el sexo biológico');
    await expect(page.locator('body')).not.toContainText('revisiones aplicables');

    // Con solo la edad tampoco: el sexo decide tres de los cribados.
    await sembrarValor(page, SEL_EDAD, '55');
    await expect(tarjetas(page)).toHaveCount(0);
    await expect(resumen(page)).toContainText('Escribe tu edad y elige el sexo biológico');

    // ── Edad fuera de rango: aviso y sin resultados ──────────────────────────
    await elegirSexo(page, '♀ Mujer');
    await expect(tarjetas(page)).toHaveCount(13);

    for (const imposible of ['5', '130', 'abc']) {
      await sembrarValor(page, SEL_EDAD, imposible);
      await expect(page.getByRole('alert').filter({ hasText: 'Escribe una edad entre' })).toHaveCount(1);
      await expect(tarjetas(page)).toHaveCount(0);
    }

    // ── «Sin especificar» ya no existe: no pueden convivir los dos sexos ─────
    await expect(page.getByRole('button', { name: 'Sin especificar' })).toHaveCount(0);
    await sembrarValor(page, SEL_EDAD, '55');
    await expect(page.locator('body')).toContainText('♀ Solo mujeres');
    await expect(page.locator('body')).not.toContainText('♂ Solo hombres');

    await elegirSexo(page, '♂ Hombre');
    await expect(resumen(page)).toContainText('12 revisiones aplicables a los 55 años');
    await expect(page.locator('body')).toContainText('♂ Solo hombres');
    await expect(page.locator('body')).not.toContainText('♀ Solo mujeres');
  });

  test('CASO 4 — el PSA no se presenta como un cribado más (hallazgo 1144)', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    await perfil(page, 55, '♂ Hombre', 12);

    // La tarjeta existe, pero dice en el propio título que no hay cribado poblacional…
    const prostata = tarjetaDe(page, 'Próstata');
    await expect(prostata).toContainText('NO hay cribado poblacional');
    await expect(prostata).toContainText('recomienda EN CONTRA');
    // …y su fuente ya no es «SEF», que es la Sociedad Española de Fertilidad.
    await expect(prostata).toContainText('PAPPS-semFYC');
    await expect(page.locator('body')).not.toContainText('EAU / SEF');

    // Y la tabla del bloque educativo ya no lo lista entre los «chequeos prioritarios».
    await page.getByRole('button', { name: /Ver [Gg]uía/ }).click();
    const tabla = page.locator('table[class*="tablaComparativa"]');
    await expect(tabla).not.toContainText('PSA (hombres)');
    // Hallazgo 1148: un solo rango por cribado, coherente con las tarjetas.
    await expect(tabla).not.toContainText('45+');
    await expect(tabla).not.toContainText('50-74');
    await expect(tabla).not.toContainText('hasta 70');
    await expect(tabla).toContainText('50-69');

    // Hallazgo 1147: el TC de baja dosis no se narra como una prestación a la que uno se apunta.
    await expect(page.locator('body')).toContainText('en España no es un programa poblacional');
    await expect(page.locator('body')).not.toContainText('se apunta al cribado de cáncer de pulmón');
  });

  test('las piezas obligatorias de una app de salud de riesgo 1', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    await expect(page.locator('h1')).toHaveText('Chequeos Médicos Preventivos');

    // DisclaimerCard nivel 1 CRÍTICO: role="alert", variante médica y NUNCA colapsable.
    // Se localiza por la clase de severidad: `getByRole('alert')` casaría también con el
    // anunciador de rutas de Next (#__next-route-announcer__).
    const aviso = page.locator('[class*="severity-critical"]').first();
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveAttribute('role', 'alert');
    await expect(aviso).toHaveClass(/variant-medical/);
    await expect(aviso).toContainText('no sustituye');
    await expect(aviso).toContainText('médico de cabecera');
    expect(await aviso.locator('button, details, summary').count()).toBe(0);

    // LegalNotice montado, y fuera del bloque educativo colapsable.
    await expect(page.getByRole('link', { name: 'Política de Privacidad' }).first()).toBeVisible();

    // Hallazgo 1146 · los síntomas de alarma están VISIBLES sin desplegar nada: en una app
    // cuyo mensaje es «espera a tu próxima revisión», la lista de lo que NO debe esperar es
    // la pieza que más necesita verse, y vivía dentro del plegable.
    const alarma = page.getByRole('note').filter({ hasText: 'Síntomas que no deben esperar' });
    await expect(alarma).toBeVisible();
    await expect(alarma).toContainText('Dolor torácico');
    await expect(alarma).toContainText('Bulto o nódulo nuevo');

    // El bloque educativo nace COLAPSADO: nada de lo que hay dentro puede darse por leído.
    const verGuia = page.getByRole('button', { name: /Ver [Gg]uía/ });
    await expect(verGuia).toHaveAttribute('aria-expanded', 'false');
    // Ni el aviso médico, ni el legal, ni el de síntomas viven dentro de él.
    const educativa = page.locator('div').filter({ has: verGuia }).last();
    expect(await educativa.locator('[class*="severity-critical"]').count()).toBe(0);
    expect(await educativa.getByRole('link', { name: 'Política de Privacidad' }).count()).toBe(0);
    expect(await educativa.getByText('Síntomas que no deben esperar').count()).toBe(0);

    // NINGÚN dato de salud se guarda: las casillas «al día» viven solo en memoria.
    await perfil(page, 55, '♀ Mujer', 13);
    // La casilla está a opacity:0 y 0x0, así que se pulsa su <label>.
    await page.getByLabel('Analítica de sangre general: pendiente').locator('xpath=..').click();
    // Hallazgo 1149 · concordancia: una sola marca es «1 marcada», no «1 marcadas».
    await expect(resumen(page)).toContainText('1 marcada como al día');
    await expect(resumen(page)).not.toContainText('1 marcadas');

    const guardado = await page.evaluate(() => ({
      local: Object.keys(localStorage).filter((k) => !k.startsWith('meskeia_')),
      sesion: Object.keys(sessionStorage),
    }));
    expect(guardado.local).toEqual([]);
    expect(guardado.sesion).toEqual([]);

    await page.reload({ waitUntil: 'load' });
    await esperarHidratacion(page, [SEL_EDAD]);
    // Y al recargar no queda ni el perfil: la app vuelve a no contestar sin que le pregunten.
    await expect(page.locator(SEL_EDAD)).toHaveValue('');
    await expect(resumen(page)).toContainText('Escribe tu edad y elige el sexo biológico');
  });
});
