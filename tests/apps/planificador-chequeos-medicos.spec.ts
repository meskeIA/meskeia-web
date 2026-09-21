import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * Chequeos Médicos Preventivos — regresión del CALENDARIO DE CRIBADOS que devuelve
 * según edad y sexo. App de riesgo 1 (orientación de salud).
 *
 * QUÉ PROMETE (leído el 21/09/2026)
 *   · <h1>: «Chequeos Médicos Preventivos».
 *   · Subtítulo: «Consulta qué revisiones te corresponden según tu edad y sexo ·
 *     Guías clínicas españolas».
 *   · <title>: «Chequeos Médicos Preventivos - Qué Revisiones Hacerte según tu Edad».
 *   · En pantalla: <LegalNotice />, <DisclaimerCard variant="medical" severity="critical">
 *     (nivel 1, NO colapsable) y un <EducationalSection> que nace colapsado.
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
 * CÓMO MODELA LA EDAD ESTA APP — y de ahí salen los dos hallazgos del acta:
 *   No pide la edad exacta. Ofrece CUATRO tramos y colapsa cada uno en una sola edad
 *   representativa (`EDAD_REPR` en page.tsx): 18-39 → 30 · 40-49 → 45 · 50-64 → 55 ·
 *   65+ → 70. Todo el filtrado se hace sobre esa edad única, así que dentro de un tramo
 *   nadie recibe una respuesta distinta.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 — NORMAL: mujer en el tramo 50-64 (edad evaluada 55).
 *       Es el único perfil que está DENTRO de los tres cribados poblacionales a la vez.
 *       Deben salir los tres, en la sección «Oncológico», con su periodicidad:
 *         · Sangre oculta en heces «Cada 2 años»  (colorrectal 50-69, bienal)
 *         · Mamografía            «Cada 2 años»  (mama 50-69, bienal)
 *         · Citología / PAP       «Cada 3-5 años» (cérvix 25-65; 3 años con citología,
 *                                                  5 con prueba VPH → el rango los cubre)
 *       Y NO debe salir «Revisión de próstata», que la app marca «Solo hombres».
 *       Total contado a mano sobre los 16 chequeos del catálogo interno: 13.
 *
 *   CASO 2 — EL LÍMITE, por los dos umbrales que importan
 *       a) 49 → 50 (inicio del cribado colorrectal). Son tramos DISTINTOS (40-49 y 50-64),
 *          así que la app sí lo modela: mujer 40-49 = 12 revisiones SIN sangre oculta en
 *          heces; mujer 50-64 = 13 CON ella. Es el comportamiento correcto.
 *       b) 69 → 70 (fin de los cribados de mama y cérvix). Aquí la app NO puede distinguir:
 *          ambas edades caen en el tramo abierto «65+», que se evalúa SIEMPRE como 70.
 *          Consecuencia medida: una mujer de 66 años —que está de lleno en el programa de
 *          cribado de mama del SNS, 50-69— NO recibe la mamografía. Lo mismo con la
 *          citología para los 65 años, último año del programa de cérvix.
 *          ⚠️ Los `toHaveCount(0)` de este caso DOCUMENTAN EL HALLAZGO, no lo aprueban:
 *          si algún día la app pide la edad exacta o parte el tramo en 65-69 / 70+, este
 *          test fallará — y esa es justamente la señal de que el hallazgo quedó reparado.
 *
 *   CASO 3 — EL QUE NO ENCAJA: no hay forma de quedarse fuera, ni de no contestar
 *       No existen campos que dejar vacíos ni edades imposibles que teclear (0, 130,
 *       negativa): solo cuatro botones de tramo y tres de sexo, y ambos nacen elegidos.
 *       · Al cargar, sin que el usuario haya tocado nada, la app ya afirma «12 revisiones
 *         aplicables a tu perfil» e incluye mamografía y citología, para un perfil que
 *         nadie ha dado (el sexo está en «Sin especificar»).
 *       · Con «Sin especificar» el filtro deja pasar TODO lo exclusivo de un sexo, así que
 *         en 50-64 conviven en pantalla una tarjeta «♀ Solo mujeres» y otra «♂ Solo hombres».
 *       · Las 12 combinaciones devuelven entre 8 y 14 revisiones — ninguna devuelve 0, de
 *         modo que el mensaje «No hay revisiones para el perfil seleccionado» del código es
 *         inalcanzable. La matriz completa, contada a mano sobre `EDAD_REPR`, va literal
 *         en la tabla ESPERADO de más abajo.
 *
 * ⚠️ Las casillas «al día» son `<input type="checkbox">` a `opacity: 0; width: 0`, así que
 *    `check()` falla por invisibilidad: hay que clicar su `<label>` envolvente.
 * ⚠️ `getByRole('alert')` casaría también con el anunciador de rutas de Next, así que el
 *    aviso médico se localiza por su clase de severidad.
 */

const RUTA = '/planificador-chequeos-medicos/';

/** Un `<input type="checkbox">` de las tarjetas: React le cuelga su rastreador al montar,
 *  y sirve de testigo de hidratación para los BOTONES, que es lo que mueve esta app. */
const TESTIGO_HIDRATACION = ['input[type="checkbox"]'];

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'load' });
  await esperarHidratacion(page, TESTIGO_HIDRATACION);
}

/** Los nombres de las revisiones que la app lista ahora mismo. */
function tarjetas(page: Page) {
  return page.locator('h3[class*="tarjetaNombre"]');
}

/** La línea «N revisiones aplicables a tu perfil». */
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

async function elegirTramo(page: Page, tramo: string): Promise<void> {
  await page.getByRole('button', { name: tramo, exact: true }).click();
  await expect(page.getByRole('button', { name: tramo, exact: true })).toHaveAttribute('aria-pressed', 'true');
}

async function elegirSexo(page: Page, sexo: string): Promise<void> {
  await page.getByRole('button', { name: sexo, exact: true }).click();
  await expect(page.getByRole('button', { name: sexo, exact: true })).toHaveAttribute('aria-pressed', 'true');
}

test.describe('Planificador de Chequeos Médicos Preventivos', () => {
  test('CASO 1 — mujer de 50-64: los TRES cribados poblacionales, con su periodicidad', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    // Ambos clics CAMBIAN el estado: la app arranca en «40-49 años» + «Sin especificar».
    await elegirTramo(page, '50-64 años');
    await elegirSexo(page, '♀ Mujer');

    // 13 revisiones, contadas a mano sobre los 16 chequeos de `CHEQUEOS` con edad 55 y sexo mujer.
    await expect(resumen(page)).toHaveText('13 revisiones aplicables a tu perfil');
    await expect(tarjetas(page)).toHaveCount(13);

    // Cribado de cáncer colorrectal del SNS: 50-69 años, sangre oculta en heces BIENAL.
    await expect(revision(page, 'Sangre oculta en heces (cáncer colorrectal)')).toHaveCount(1);
    await expect(tarjetaDe(page, 'Sangre oculta en heces')).toContainText('Cada 2 años');

    // Cribado de cáncer de mama del SNS: mujeres 50-69, mamografía BIENAL.
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(1);
    await expect(tarjetaDe(page, 'Mamografía (cáncer de mama)')).toContainText('Cada 2 años');

    // Cribado de cáncer de cérvix del SNS: mujeres 25-65, citología cada 3 años (25-34)
    // o prueba VPH cada 5 (35-65) — de ahí el «Cada 3-5 años» de la tarjeta.
    await expect(revision(page, 'Citología vaginal / PAP test')).toHaveCount(1);
    await expect(tarjetaDe(page, 'Citología vaginal')).toContainText('Cada 3-5 años');

    // Los tres van juntos bajo «Oncológico», con la revisión dermatológica: cuatro tarjetas.
    const oncologico = page.locator('section').filter({ has: page.getByRole('heading', { level: 2, name: /Oncológico/ }) });
    await expect(oncologico.locator('h3[class*="tarjetaNombre"]')).toHaveCount(4);

    // La próstata es «Solo hombres»: no puede aparecer en un perfil de mujer.
    await expect(revision(page, 'Revisión de próstata')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('♂ Solo hombres');
  });

  test('CASO 2 — el límite: 49→50 sí lo distingue; 69→70 no puede, y deja a las mujeres de 65-69 sin mamografía', async ({ page }) => {
    test.setTimeout(90_000);
    await abrir(page);

    // ── a) 49 vs 50, el inicio del cribado colorrectal ───────────────────────
    // Se parte de 18-39 para que los dos clics de tramo muevan de verdad el estado.
    await elegirTramo(page, '18-39 años');
    await elegirSexo(page, '♀ Mujer');

    await elegirTramo(page, '40-49 años');          // una mujer de 49
    await expect(resumen(page)).toHaveText('12 revisiones aplicables a tu perfil');
    // El programa del SNS empieza a los 50: a los 49 NO toca sangre oculta en heces.
    await expect(revision(page, 'Sangre oculta en heces (cáncer colorrectal)')).toHaveCount(0);

    await elegirTramo(page, '50-64 años');          // una mujer de 50
    await expect(resumen(page)).toHaveText('13 revisiones aplicables a tu perfil');
    // Cruzar los 50 añade exactamente una revisión, y es la correcta.
    await expect(revision(page, 'Sangre oculta en heces (cáncer colorrectal)')).toHaveCount(1);

    // ── b) 69 vs 70, el fin de los cribados de mama y de cérvix ──────────────
    // No hay tramo que los separe: 66, 69, 70 y 95 comparten el botón «65+ años»,
    // que la app evalúa siempre como 70.
    await elegirTramo(page, '65+ años');
    await expect(resumen(page)).toHaveText('13 revisiones aplicables a tu perfil');

    // Lo que SÍ es correcto a los 70: el tramo mayor añade osteoporosis y vacuna antigripal.
    await expect(revision(page, 'Densitometría ósea (osteoporosis)')).toHaveCount(1);
    await expect(revision(page, 'Vacuna antigripal')).toHaveCount(1);

    // ⚠️ HALLAZGO (alto). El programa de cribado de mama del SNS cubre a las mujeres
    // hasta los 69 años, y el de cérvix hasta los 65. Al evaluar todo el tramo «65+»
    // como 70, la app se las niega a quien todavía está dentro. Estos dos ceros
    // RETRATAN el defecto: deben fallar el día que la app distinga 66 de 70.
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(0);
    await expect(revision(page, 'Citología vaginal / PAP test')).toHaveCount(0);

    // En cambio la sangre oculta en heces sigue apareciendo a los 70, porque la app la
    // extiende hasta los 74 (la cartera del SNS la cierra en 69: ver acta).
    await expect(revision(page, 'Sangre oculta en heces (cáncer colorrectal)')).toHaveCount(1);
  });

  test('CASO 3 — el que no encaja: contesta sin que le pregunten y nunca se queda sin respuesta', async ({ page }) => {
    test.setTimeout(120_000);
    await abrir(page);

    // ── Sin tocar NADA: la app ya afirma una cifra «de tu perfil» ────────────
    // No se pulsa ningún botón aquí a propósito: es el estado de arranque.
    await expect(page.getByRole('button', { name: '40-49 años', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Sin especificar', exact: true })).toHaveAttribute('aria-pressed', 'true');
    // ⚠️ HALLAZGO (medio): 12 revisiones «aplicables a tu perfil» sin perfil dado,
    // y entre ellas dos cribados exclusivos de mujer.
    await expect(resumen(page)).toHaveText('12 revisiones aplicables a tu perfil');
    await expect(revision(page, 'Mamografía (cáncer de mama)')).toHaveCount(1);
    await expect(revision(page, 'Citología vaginal / PAP test')).toHaveCount(1);

    // ── Las 12 combinaciones posibles: ninguna devuelve 0 ────────────────────
    // Contadas a mano sobre `EDAD_REPR` (30/45/55/70) y los 16 chequeos del catálogo.
    const ESPERADO: [string, string, number][] = [
      ['18-39 años', '♀ Mujer', 9], ['18-39 años', '♂ Hombre', 8], ['18-39 años', 'Sin especificar', 9],
      ['40-49 años', '♀ Mujer', 12], ['40-49 años', '♂ Hombre', 10], ['40-49 años', 'Sin especificar', 12],
      ['50-64 años', '♀ Mujer', 13], ['50-64 años', '♂ Hombre', 12], ['50-64 años', 'Sin especificar', 14],
      ['65+ años', '♀ Mujer', 13], ['65+ años', '♂ Hombre', 13], ['65+ años', 'Sin especificar', 14],
    ];

    let tramoAnterior = '';
    for (const [tramo, sexo, esperadas] of ESPERADO) {
      if (tramo !== tramoAnterior) {
        await elegirTramo(page, tramo);
        tramoAnterior = tramo;
      }
      await elegirSexo(page, sexo);
      await expect(resumen(page)).toHaveText(`${esperadas} revisiones aplicables a tu perfil`);
      await expect(tarjetas(page)).toHaveCount(esperadas);
      // El mensaje de «perfil sin revisiones» del código nunca llega a mostrarse.
      await expect(page.locator('body')).not.toContainText('No hay revisiones para el perfil seleccionado');
    }

    // ── «Sin especificar» mezcla los dos sexos en la misma pantalla ──────────
    // Último estado del bucle: 65+ · Sin especificar → conviven densitometría (♀) y próstata (♂).
    await expect(page.locator('body')).toContainText('♀ Solo mujeres');
    await expect(page.locator('body')).toContainText('♂ Solo hombres');
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

    // El bloque educativo nace COLAPSADO: nada de lo que hay dentro puede darse por leído.
    const verGuia = page.getByRole('button', { name: /Ver [Gg]uía/ });
    await expect(verGuia).toHaveAttribute('aria-expanded', 'false');
    // Ni el aviso médico ni el legal viven dentro de él.
    const educativa = page.locator('div').filter({ has: verGuia }).last();
    expect(await educativa.locator('[class*="severity-critical"]').count()).toBe(0);
    expect(await educativa.getByRole('link', { name: 'Política de Privacidad' }).count()).toBe(0);

    // NINGÚN dato de salud se guarda: las casillas «al día» viven solo en memoria.
    // La casilla está a opacity:0 y 0x0, así que se pulsa su <label>.
    await page.getByLabel('Analítica de sangre general: pendiente').locator('xpath=..').click();
    // El regex tolera la concordancia: hoy imprime «1 marcadas», que es un hallazgo bajo aparte.
    await expect(resumen(page)).toHaveText(/1 marcadas? como al día/);
    const guardado = await page.evaluate(() => ({
      local: Object.keys(localStorage).filter((k) => !k.startsWith('meskeia_')),
      sesion: Object.keys(sessionStorage),
    }));
    expect(guardado.local).toEqual([]);
    expect(guardado.sesion).toEqual([]);

    await page.reload({ waitUntil: 'load' });
    await esperarHidratacion(page, TESTIGO_HIDRATACION);
    await expect(resumen(page)).toHaveText('12 revisiones aplicables a tu perfil');
    await expect(resumen(page)).not.toContainText('al día');
  });
});
