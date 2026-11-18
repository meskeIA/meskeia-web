import { test, expect, devices, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ORIGEN } from './_puerto';

/**
 * Inspector — checklist-tramites-dependencia (segmento interactiva, riesgo 1)
 *
 * Primera inspección: 18/11/2026. La app promete en su <h1> «Checklist de Trámites de
 * Dependencia» y en su subtítulo una «guía paso a paso para solicitar la valoración de dependencia
 * en España»: 25 casillas en seis fases (5 + 5 + 5 + 3 + 3 + 4), un contador global, un contador
 * por fase y el progreso guardado en este navegador (localStorage, clave
 * «meskeia-checklist-dependencia»). No importa nada de data/fiscal: los plazos, grados y
 * requisitos están escritos a mano en page.tsx y metadata.ts.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   Porcentaje = round(marcadas / 25 × 100) = 4 × marcadas, exacto: no hay redondeo que vigilar.
 *
 *   CASO 1 (normal, escritorio) · marcar «Recopilar DNI/NIE», «Solicitar informe médico» y
 *     «Guardar copia sellada»
 *     → «3 de 25 pasos completados», 3 × 4 = 12 (aria-valuenow), Preparación previa 2/5,
 *       Solicitud formal 1/5 · tras recargar, lo mismo · desmarcar el DNI → 2 de 25, 8 ·
 *       Espacio sobre una casilla → 3 de 25; Intro → 2 de 25.
 *
 *   CASO 2 (límite, móvil Pixel 7) · tocar las 25
 *     → «¡Has completado todos los pasos!», 100, aviso «¡Todos los pasos completados!», 5/5, 5/5,
 *       5/5, 3/3, 3/3, 4/4 · plegar «Preparación previa» no cambia la cuenta (25 de 25: lo plegado
 *       sigue contando) · desmarcar «Firmar el PIA» → 24 de 25, 96, PIA 2/3 y sin aviso ·
 *       Reiniciar aceptando → 0 de 25, 0, botón deshabilitado, y sigue a cero tras recargar.
 *
 *   CASO 3 (sin resultado / rechazo, escritorio)
 *     · sin casillas → «0 de 25 pasos completados», 0, Reiniciar deshabilitado, sin aviso.
 *     · Reiniciar con dos marcadas y CANCELAR el confirm → no borra nada: 2 de 25, 8.
 *     · un almacén con una clave que no es de ninguna casilla ({"inventado":true,"f1-dni":true})
 *       → solo cuenta la del DNI: 1 de 25, 4; uno que no es JSON → 0 de 25, sin caerse.
 *
 * DATOS NORMATIVOS (HALLAZGOS) — fuente: texto consolidado de la Ley 39/2006 en el BOE
 * (BOE-A-2006-21990), leído el 18/11/2026, y data/fiscal/dependencia.ts:
 *   · Disposición final primera, apartados 2 y 3, en la redacción del Real Decreto-ley 36/2026,
 *     de 10 de noviembre (BOE-A-2026-23605, en vigor el 12/11/2026): «el plazo máximo, entre la
 *     fecha de entrada de la solicitud y la de resolución de reconocimiento de la prestación de
 *     dependencia será de tres meses, independientemente de que la Administración Competente haya
 *     establecido un procedimiento diferenciado para el reconocimiento de la situación de
 *     dependencia y el de prestaciones», y el derecho «se generará desde la fecha de la
 *     resolución de reconocimiento de las prestaciones o, en su caso, cuando haya transcurrido el
 *     plazo de tres meses desde la presentación de la solicitud sin haberse dictado y notificado
 *     resolución expresa». El art. 28.1 ya decía «plazo máximo de 3 meses» desde la Ley 4/2026,
 *     de 1 de octubre (BOE-A-2026-20528, en vigor el 23/10/2026). La app sigue con seis meses.
 *   · Art. 5.1.c: residir en España cinco años, «de los cuales dos deberán ser inmediatamente
 *     anteriores a la fecha de presentación de la solicitud», también para los españoles.
 *     Art. 5.1.b y disposición adicional 13.ª: menores de 6 años (antes 3).
 *   · Art. 33.2: «La capacidad económica de la persona beneficiaria se tendrá también en cuenta
 *     para la determinación de la cuantía de las prestaciones económicas».
 *   · Disposición adicional 17.ª: «Se crea un nuevo Grado III+ de dependencia extrema»
 *     (GRADO_III_PLUS de data/fiscal). La ley no contiene ninguna cláusula de silencio.
 *   · BVD (BVD_ACTIVIDADES_18_MAS de data/fiscal, RD 174/2011): la escala general tiene 10
 *     actividades y 51 tareas (4+4+5+4+5+5+8+6+6+4), no 47.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 * habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const RUTA = '/checklist-tramites-dependencia/';
const CLAVE = 'meskeia-checklist-dependencia';

/** Carga la app y espera a que las casillas tengan React enganchado (un clic antes se pierde). */
async function cargar(page: Page): Promise<void> {
  // ORIGEN y no la ruta relativa: el caso del almacén abre contextos propios (browser.newContext)
  await page.goto(`${ORIGEN}${RUTA}`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Checklist de Trámites de Dependencia');
  await page.waitForFunction(() => {
    const li = document.querySelector('li[role="checkbox"]');
    return Boolean(li && Object.keys(li).some((k) => k.startsWith('__reactProps$')));
  });
}

function barra(page: Page) {
  return page.getByRole('progressbar');
}

function fase(page: Page, titulo: string) {
  return page.getByRole('button', { name: new RegExp(`^${titulo.replace(/[()]/g, '\\$&')}`) });
}

function avisoCompleto(page: Page) {
  // getByRole('alert') casa también con el anunciador de rutas de Next: se acota por el texto
  return page.getByRole('alert').filter({ hasText: '¡Todos los pasos completados!' });
}

/** Texto de la página sin los <script> (el JSON-LD y la carga de RSC repetirían todo). */
async function textoPagina(page: Page): Promise<string> {
  return page.evaluate(() => {
    const copia = document.body.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('script, style, template').forEach((n) => n.remove());
    return (copia.textContent ?? '').replace(/\s+/g, ' ');
  });
}

/** Las respuestas del FAQPage, tal como las leen buscadores y asistentes. */
async function textoFaqPage(page: Page): Promise<string> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const partes: string[] = [];
  for (const b of bloques) {
    const dato = JSON.parse(b) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
    if (dato['@type'] === 'FAQPage') {
      for (const q of dato.mainEntity ?? []) partes.push(`${q.name} ${q.acceptedAnswer.text}`);
    }
  }
  return partes.join(' ');
}

test.describe('escritorio', () => {
  test('CASO 1 · tres casillas: 3 de 25 y 12, el contador por fase cuadra y el progreso sobrevive a la recarga', async ({ page }) => {
    await cargar(page);
    await page.getByRole('checkbox', { name: /Recopilar DNI\/NIE/ }).click();
    await page.getByRole('checkbox', { name: /Solicitar informe médico/ }).click();
    await page.getByRole('checkbox', { name: /Guardar copia sellada/ }).click();

    await expect(page.getByText('3 de 25 pasos completados', { exact: true })).toBeVisible();
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '12');
    await expect(fase(page, 'Preparación previa')).toContainText('2/5');
    await expect(fase(page, 'Solicitud formal')).toContainText('1/5');
    await expect(fase(page, 'Valoración presencial')).toContainText('0/5');
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(3);
    await expect(page.getByRole('button', { name: /Reiniciar checklist/ })).toBeEnabled();

    // Marcado en la página real y recargado (sembrar el almacén antes de cargar no prueba esto)
    await page.reload();
    await cargar(page);
    await expect(page.getByText('3 de 25 pasos completados', { exact: true })).toBeVisible();
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '12');
    await expect(page.getByRole('checkbox', { name: /Guardar copia sellada/ })).toHaveAttribute('aria-checked', 'true');

    await page.getByRole('checkbox', { name: /Recopilar DNI\/NIE/ }).click();
    await expect(page.getByText('2 de 25 pasos completados', { exact: true })).toBeVisible();
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '8');
    await expect(fase(page, 'Preparación previa')).toContainText('1/5');

    // Teclado: Espacio marca, Intro desmarca
    const cuidador = page.getByRole('checkbox', { name: /Anotar datos de contacto/ });
    await cuidador.focus();
    await page.keyboard.press('Space');
    await expect(cuidador).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText('3 de 25 pasos completados', { exact: true })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(cuidador).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByText('2 de 25 pasos completados', { exact: true })).toBeVisible();
  });

  test('CASO 3 · sin casillas no hay resultado, y cancelar «Reiniciar» no borra nada', async ({ page }) => {
    await cargar(page);
    await expect(page.getByText('0 de 25 pasos completados', { exact: true })).toBeVisible();
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '0');
    await expect(page.getByRole('button', { name: /Reiniciar checklist/ })).toBeDisabled();
    await expect(avisoCompleto(page)).toHaveCount(0);

    await page.getByRole('checkbox', { name: /Obtener certificado de empadronamiento/ }).click();
    await page.getByRole('checkbox', { name: /Firmar el PIA/ }).click();
    await expect(page.getByText('2 de 25 pasos completados', { exact: true })).toBeVisible();

    page.once('dialog', (d) => d.dismiss());
    await page.getByRole('button', { name: /Reiniciar checklist/ }).click();
    await expect(page.getByText('2 de 25 pasos completados', { exact: true })).toBeVisible();
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '8');
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(2);
  });

  test('CASO 3 · un almacén con claves ajenas solo cuenta las casillas que existen; uno roto, cero', async ({ browser }) => {
    // Se siembra antes de cargar: si la siembra fallara, saldría 0 y el caso del DNI daría rojo,
    // no un verde en falso.
    const casos: { sembrado: string; texto: string; valor: string }[] = [
      { sembrado: JSON.stringify({ inventado: true, 'f1-dni': true }), texto: '1 de 25 pasos completados', valor: '4' },
      { sembrado: 'no-es-json', texto: '0 de 25 pasos completados', valor: '0' },
    ];
    for (const c of casos) {
      const ctx = await browser.newContext();
      await ctx.addInitScript(([clave, v]) => { localStorage.setItem(clave, v); }, [CLAVE, c.sembrado]);
      const page = await ctx.newPage();
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(String(e)));
      await cargar(page);
      await expect(page.getByText(c.texto, { exact: true }), c.sembrado).toBeVisible();
      await expect(barra(page), c.sembrado).toHaveAttribute('aria-valuenow', c.valor);
      expect(errores, c.sembrado).toEqual([]);
      await ctx.close();
    }
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el plazo legal sigue en seis meses; desde el 12/11/2026 son tres', async ({ page }) => {
    // ABIERTO: DF 1.ª.2 y 3 de la Ley 39/2006 (RDL 36/2026, BOE-A-2026-23605) y art. 28.1 (Ley
    // 4/2026): tres meses de la solicitud a la resolución de la prestación, y el derecho nace a los
    // tres si no hay resolución. La app dice seis en la fase 4, la nota de «Verificar el importe»,
    // la tabla, el bloque educativo, la FAQ visible y dos respuestas del FAQPage.
    test.fail();
    await cargar(page);
    const texto = `${await textoPagina(page)} ${await textoFaqPage(page)}`;
    expect(texto).not.toMatch(/plazo (legal|máximo)[^.]{0,40}\b(6|seis) meses/i);
    expect(texto).not.toMatch(/\b(6|seis) meses desde (la )?(solicitud|presentación)/i);
    expect(texto).not.toMatch(/\b(6|seis) meses sin resolución/i);
    expect(texto).not.toMatch(/nace a los 6 meses/i);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · la casilla «Crítico» da los derechos económicos por contados desde el registro', async ({ page }) => {
    // ABIERTO: la nota de «Guardar copia sellada con fecha de registro» dice «CRÍTICO: los derechos
    // económicos cuentan desde esta fecha», y la Fase 2 del bloque educativo «es tu prueba de cuándo
    // empezaron a contar los derechos económicos». DF 1.ª.3: nacen con la resolución o al vencer el
    // plazo sin ella, no con la solicitud. La propia fase 6 de la app lo dice bien. El regex de
    // dependencia-nacimiento-derecho.spec.ts («derechos económicos se cuentan») no casa con esta forma.
    test.fail();
    await cargar(page);
    const texto = await textoPagina(page);
    expect(texto).not.toMatch(/derechos económicos cuentan desde esta fecha/i);
    expect(texto).not.toMatch(/cuándo empezaron a contar los derechos económicos/i);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · la página dice silencio positivo y el FAQPage silencio negativo', async ({ page }) => {
    // ABIERTO: tarjeta «La administración no responde en plazo»: «hay silencio administrativo
    // positivo»; FAQPage («¿Cuánto tiempo tarda…?»): «se produce silencio administrativo negativo».
    // La Ley 39/2006 no contiene ninguna cláusula de silencio (texto consolidado, 18/11/2026).
    test.fail();
    await cargar(page);
    const pagina = await textoPagina(page);
    const faq = await textoFaqPage(page);
    const positivo = /silencio administrativo positivo/i.test(pagina) || /silencio administrativo positivo/i.test(faq);
    const negativo = /silencio administrativo negativo/i.test(pagina) || /silencio administrativo negativo/i.test(faq);
    expect(positivo && negativo, 'la app afirma los dos sentidos del silencio a la vez').toBe(false);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el plazo legal se pone a la resolución del grado y el PIA queda fuera', async ({ page }) => {
    // ABIERTO: la DF 1.ª.2 cuenta el plazo hasta la resolución de reconocimiento de la PRESTACIÓN,
    // «independientemente» de que la comunidad separe grado y prestación. La app pone «Plazo legal»
    // en la fase 4, deja el PIA en «Variable según CCAA» y la FAQ dice que «Tras la resolución, el
    // PIA se elabora en semanas o meses adicionales».
    test.fail();
    await cargar(page);
    await expect(fase(page, 'Plan Individualizado de Atención (PIA)')).not.toContainText('Variable según CCAA');
    expect(await textoPagina(page)).not.toMatch(/Tras la resolución, el PIA se elabora en semanas o meses adicionales/);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · «Las prestaciones económicas no tienen copago»', async ({ page }) => {
    // ABIERTO: art. 33.2 de la Ley 39/2006: la capacidad económica «se tendrá también en cuenta
    // para la determinación de la cuantía de las prestaciones económicas»; data/fiscal
    // (FISCAL_DEPENDENCIA_META.nota): «El copago reduce la prestación según capacidad económica».
    test.fail();
    await cargar(page);
    expect(await textoPagina(page)).not.toMatch(/prestaciones económicas no tienen copago/i);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · quién puede solicitar: residencia de los españoles y menores de 6 años', async ({ page }) => {
    // ABIERTO: «Cualquier persona de nacionalidad española (o con residencia legal en España durante
    // al menos 5 años)… menores de 3 años». Art. 5.1.c: cinco años de residencia, dos
    // inmediatamente anteriores, exigidos a los españoles; art. 5.1.b y DA 13.ª: menores de 6 años.
    test.fail();
    await cargar(page);
    const texto = await textoPagina(page);
    expect(texto).not.toMatch(/nacionalidad española \(o con residencia legal/i);
    expect(texto).not.toMatch(/menores de 3 años/i);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el BVD no tiene 47 tareas y falta el Grado III+', async ({ page }) => {
    // ABIERTO: BVD_ACTIVIDADES_18_MAS (data/fiscal, RD 174/2011): 51 tareas en las 10 actividades
    // de la escala general. GRADO_III_PLUS (data/fiscal) y DA 17.ª de la Ley 39/2006: existe el
    // Grado III+ de dependencia extrema; la app dice «Los grados son: Grado I, II y III».
    test.fail();
    await cargar(page);
    const texto = await textoPagina(page);
    expect(texto).not.toMatch(/\b47 tareas\b/);
    expect(texto).toMatch(/III\+|dependencia extrema/i);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el porcentaje pega el % a la cifra', async ({ page }) => {
    // ABIERTO: CLAUDE.md §2 (decidido el 25/09/2026): «15 %» con espacio duro. Sale «12%».
    test.fail();
    await cargar(page);
    await page.getByRole('checkbox', { name: /Recopilar DNI\/NIE/ }).click();
    await page.getByRole('checkbox', { name: /Solicitar informe médico/ }).click();
    await page.getByRole('checkbox', { name: /Guardar copia sellada/ }).click();
    await expect(page.locator('[class*="_progresoPorcentaje"]')).toHaveText('12 %');
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · las casillas rompen la lista (li con role="checkbox")', async ({ page }) => {
    // ABIERTO: axe-core: «list» (serious) en las 6 listas — «List element has direct children that
    // are not allowed: [role=checkbox]» — y «aria-allowed-role» en las 25 casillas.
    test.fail();
    await cargar(page);
    const axe = await new AxeBuilder({ page })
      .include('[class*="_checklist"]')
      .withRules(['list', 'aria-allowed-role'])
      .analyze();
    expect(axe.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.html.slice(0, 60)}`))).toEqual([]);
  });

  test('HALLAZGO (18/11/2026, ABIERTO) · el contador de cada fase no llega a 4,5:1 en ningún tema', async ({ page }) => {
    // ABIERTO: «1/5» en #6E6E6E sobre #E5E5E5 = 4,04:1 en claro; #9B9B9B sobre #404040 = 3,73:1 en
    // oscuro (13,6 px, no es texto grande). Medido con axe-core el 18/11/2026.
    test.fail();
    await cargar(page);
    for (const tema of ['claro', 'oscuro']) {
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      const axe = await new AxeBuilder({ page })
        .include('[class*="_faseProgreso"]')
        .withRules(['color-contrast'])
        .analyze();
      expect(axe.violations.flatMap((v) => v.nodes.map((n) => n.html)), `tema ${tema}`).toEqual([]);
    }
  });
});

test.describe('móvil (Pixel 7)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test('CASO 2 · las 25 tocadas: 100 y aviso; plegar no descuenta; desmarcar una, 24 y 96; reiniciar, cero', async ({ page }) => {
    test.setTimeout(60_000);
    await cargar(page);
    const casillas = page.getByRole('checkbox');
    await expect(casillas).toHaveCount(25);
    for (let i = 0; i < 25; i++) await casillas.nth(i).tap();

    await expect(page.getByText('¡Has completado todos los pasos!')).toBeVisible();
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '100');
    await expect(avisoCompleto(page)).toBeVisible();
    await expect(fase(page, 'Preparación previa')).toContainText('5/5');
    await expect(fase(page, 'Solicitud formal')).toContainText('5/5');
    await expect(fase(page, 'Valoración presencial')).toContainText('5/5');
    await expect(fase(page, 'Resolución del grado')).toContainText('3/3');
    await expect(fase(page, 'Plan Individualizado de Atención (PIA)')).toContainText('3/3');
    await expect(fase(page, 'Inicio de la prestación')).toContainText('4/4');

    // Plegar una fase desmonta sus casillas, pero siguen contando
    await fase(page, 'Preparación previa').tap();
    await expect(fase(page, 'Preparación previa')).toHaveAttribute('aria-expanded', 'false');
    await expect(casillas).toHaveCount(20);
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '100');
    await fase(page, 'Preparación previa').tap();
    await expect(casillas).toHaveCount(25);

    await page.getByRole('checkbox', { name: /Firmar el PIA/ }).tap();
    await expect(page.getByText('24 de 25 pasos completados', { exact: true })).toBeVisible();
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '96');
    await expect(fase(page, 'Plan Individualizado de Atención (PIA)')).toContainText('2/3');
    await expect(avisoCompleto(page)).toHaveCount(0);

    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /Reiniciar checklist/ }).tap();
    await expect(page.getByText('0 de 25 pasos completados', { exact: true })).toBeVisible();
    await expect(barra(page)).toHaveAttribute('aria-valuenow', '0');
    await expect(page.getByRole('button', { name: /Reiniciar checklist/ })).toBeDisabled();

    await page.reload();
    await cargar(page);
    await expect(page.getByText('0 de 25 pasos completados', { exact: true })).toBeVisible();
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0);

    // Sin desbordamiento horizontal en 412 px
    const anchos = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(anchos.sw).toBeLessThanOrEqual(anchos.cw);
  });
});
