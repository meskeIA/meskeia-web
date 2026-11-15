import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * estimador-legitimas — Inspector, primera inspección (15/11/2026)
 *
 * Los esperados salen del texto consolidado del BOE, leído en la sesión:
 *   · Código Civil (BOE-A-1889-4763): arts. 807 (herederos forzosos, también el viudo), 808 (2/3
 *     para descendientes: 1/3 estricta + 1/3 mejora + 1/3 libre), 809 (ascendientes: 1/2, o 1/3
 *     si concurren con el viudo), 834 (viudo con descendientes: usufructo del tercio de mejora),
 *     837 (con ascendientes: usufructo de la mitad), 838 (sin ambos: usufructo de 2/3),
 *     14.1 y 14.5 (la vecindad civil decide; diez años de residencia sin declaración en contrario
 *     la cambian) y 1964.2 (acciones personales: cinco años).
 *   · Ley 5/2015 de Derecho Civil Vasco (BOE-A-2015-8273): arts. 8 y 10.1 (rige en toda la CAPV),
 *     48.2 (el causante puede elegir a uno o varios legitimarios y apartar a los demás), 49 (1/3)
 *     y 52.1 (viudo con descendientes: usufructo de la mitad).
 *   · Libro IV del Codi civil de Catalunya, Ley 10/2008 (BOE-A-2008-13533): arts. 451-3.1, 451-5
 *     (1/4, por partes iguales) y 452-1 (cuarta vidual: una CANTIDAD hasta 1/4, según necesidad).
 *
 * Los casos marcados «HALLAZGO (…, ABIERTO)» llevan test.fail(): describen lo que DEBERÍA pasar
 * y hoy no pasa. Cuando se repare cada uno, se quita su test.fail() y el título pasa a REPARADO.
 */

const RUTA = '/estimador-legitimas/';
const ENTRADA = 'input[inputmode="decimal"]';

/** Los importes «1.234,56 €» de un texto, en el orden en que aparecen. */
function euros(texto: string): number[] {
  return [...texto.matchAll(/(-?[\d.]+,\d{2})\s*€/g)].map((m) =>
    Number(m[1].replace(/\./g, '').replace(',', '.')),
  );
}

function formulario(page: Page): Locator {
  return page.getByRole('heading', { name: 'Datos de la herencia' }).locator('xpath=..');
}

function tarjetaResultado(page: Page): Locator {
  return page.getByRole('heading', { name: 'Distribución de la herencia' }).locator('xpath=..');
}

/** El bloque de la distribución cuyo rótulo es `rotulo` (su importe es el primer € del bloque). */
function bloque(page: Page, rotulo: string): Locator {
  return tarjetaResultado(page).getByText(rotulo, { exact: true }).locator('xpath=..');
}

async function importeDe(page: Page, rotulo: string): Promise<number> {
  const texto = await bloque(page, rotulo).innerText();
  return euros(texto)[0];
}

interface Datos {
  patrimonio: string;
  regimen?: string;
  hijos?: string;
  conyuge?: boolean;
}

async function rellenar(page: Page, { patrimonio, regimen = 'comun', hijos = '2', conyuge = true }: Datos) {
  await page.locator('#regimen').selectOption(regimen);
  await page.locator('#numHijos').selectOption(hijos);
  await formulario(page).getByRole('button', { name: conyuge ? 'Sí' : 'No', exact: true }).click();
  await page.locator(ENTRADA).fill(patrimonio);
  await esperarValorEnReact(page, ENTRADA, patrimonio);
}

async function calcular(page: Page, datos: Datos) {
  await rellenar(page, datos);
  await page.getByRole('button', { name: 'Calcular legítimas' }).click();
}

/** Los bloques JSON-LD que sirve la página, ya parseados. */
async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.map((t) => JSON.parse(t) as Record<string, unknown>);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [ENTRADA]);
});

test.describe('Derecho común (Código Civil)', () => {
  test('CASO 1 (normal) · 300.000 €, dos hijos y viudo: tres tercios de 100.000 € y usufructo del de mejora', async ({ page }) => {
    // Art. 808: legítima de descendientes = 2/3 × 300.000 = 200.000 €; una de las dos partes
    // puede ser mejora → estricta 100.000 € (50.000 € por hijo, a partes iguales), mejora
    // 100.000 €, libre disposición 100.000 €. Art. 834: el viudo que concurre con
    // descendientes tiene el usufructo del tercio de mejora → sobre 100.000 €.
    await calcular(page, { patrimonio: '300.000', hijos: '2', conyuge: true });
    const tarjeta = tarjetaResultado(page);
    await expect(tarjeta.getByText('Legítima estricta', { exact: true })).toBeVisible();

    expect(await importeDe(page, 'Legítima estricta')).toBeCloseTo(100000, 2);
    expect(await importeDe(page, 'Tercio de mejora')).toBeCloseTo(100000, 2);
    expect(await importeDe(page, 'Libre disposición')).toBeCloseTo(100000, 2);
    await expect(bloque(page, 'Legítima estricta')).toContainText(/50\.000,00\s*€\/hijo/);
    await expect(bloque(page, 'Legítima estricta')).toContainText('1/3');
    await expect(bloque(page, 'Tercio de mejora')).toContainText('1/3');
    await expect(bloque(page, 'Libre disposición')).toContainText('1/3');

    await expect(tarjeta).toContainText(/Usufructo estimado sobre 100\.000,00\s*€/);
    await expect(tarjeta).toContainText('CC art. 834');
  });

  test('CASO 1b (normal, redondeo) · 200.000 €, tres hijos, sin viudo: las tres partes suman el caudal al céntimo', async ({ page }) => {
    // Art. 808: cada tercio es 200.000 / 3 = 66.666,666… €; publicadas al céntimo, una de las
    // tres tiene que ser ,66 para que sumen 200.000,00 €. Por hijo: 66.666,67 / 3 = 22.222,22 €.
    // Sin viudo no hay usufructo (art. 834 exige que concurra).
    await calcular(page, { patrimonio: '200.000', hijos: '3', conyuge: false });
    const tarjeta = tarjetaResultado(page);
    await expect(tarjeta.getByText('Legítima estricta', { exact: true })).toBeVisible();

    const estricta = await importeDe(page, 'Legítima estricta');
    const mejora = await importeDe(page, 'Tercio de mejora');
    const libre = await importeDe(page, 'Libre disposición');
    // Tolerancia de un céntimo: el defecto que vigila es un tercio mal calculado, no el redondeo
    for (const parte of [estricta, mejora, libre]) expect(Math.abs(parte - 66666.67)).toBeLessThanOrEqual(0.011);
    expect(Math.round((estricta + mejora + libre) * 100)).toBe(20000000);
    await expect(bloque(page, 'Legítima estricta')).toContainText(/22\.222,22\s*€\/hijo/);
    await expect(tarjeta).not.toContainText('Usufructo estimado');
  });

  test('CASO 2 (límite) · caudal 0 €: todas las partes a 0,00 € y ningún usufructo que mostrar', async ({ page }) => {
    // 2/3 de 0 € son 0 € (art. 808); el usufructo del art. 834 sobre 0 € no se muestra.
    await calcular(page, { patrimonio: '0', hijos: '1', conyuge: true });
    const tarjeta = tarjetaResultado(page);
    await expect(tarjeta.getByText('Legítima estricta', { exact: true })).toBeVisible();
    expect(await importeDe(page, 'Legítima estricta')).toBe(0);
    expect(await importeDe(page, 'Tercio de mejora')).toBe(0);
    expect(await importeDe(page, 'Libre disposición')).toBe(0);
    await expect(tarjeta).not.toContainText('Usufructo estimado');
  });

  test('CASO 3 (rechazo) · un patrimonio negativo o un «-» suelto no se calculan', async ({ page }) => {
    // El art. 818 parte del valor líquido de los bienes: un caudal negativo no tiene legítima
    // que repartir. La app debe avisar y no publicar distribución.
    for (const valor of ['-50000', '-']) {
      await calcular(page, { patrimonio: valor });
      await expect(formulario(page).locator('[role="alert"]')).toContainText('Introduce un patrimonio neto válido');
      await expect(tarjetaResultado(page)).toContainText('Introduce los datos y pulsa el botón');
      await expect(tarjetaResultado(page).getByText('Libre disposición', { exact: true })).toHaveCount(0);
    }
  });

  test('HALLAZGO 4739 (15/11/2026, REPARADO) · tras un resultado válido, un patrimonio negativo deja la distribución vieja junto al error', async ({ page }) => {
    // 300.000 € → resultado; luego solo se cambia el patrimonio a -50000 y se pulsa Calcular.
    // Esperado: aviso y SIN distribución. Antes: el aviso convivía con la de 300.000 €.
    await calcular(page, { patrimonio: '300.000' });
    await expect(tarjetaResultado(page).getByText('Libre disposición', { exact: true })).toBeVisible();
    await page.locator(ENTRADA).fill('-50000');
    await esperarValorEnReact(page, ENTRADA, '-50000');
    await page.getByRole('button', { name: 'Calcular legítimas' }).click();
    await expect(formulario(page).locator('[role="alert"]')).toBeVisible();
    await expect(tarjetaResultado(page).getByText('Libre disposición', { exact: true })).toHaveCount(0, { timeout: 2000 });
  });

  test('HALLAZGO 4729 (15/11/2026, REPARADO) · el caso sin descendientes se puede pedir (arts. 809, 837 y 838)', async ({ page }) => {
    // Sin hijos, con padres y viudo, 200.000 €: ascendientes 1/3 = 66.666,67 € (art. 809) y
    // viudo con el usufructo de la mitad = 100.000 € (art. 837). Sin padres: ninguna legítima y
    // usufructo de los dos tercios = 133.333,33 € (art. 838). Antes el selector solo ofrecía de
    // 1 a 6 hijos y la página no preguntaba por los ascendientes.
    await calcular(page, { patrimonio: '200.000', hijos: '0', conyuge: true });
    const tarjeta = tarjetaResultado(page);
    await expect(tarjeta.getByText('Legítima de los ascendientes', { exact: true })).toBeVisible();
    expect(await importeDe(page, 'Legítima de los ascendientes')).toBeCloseTo(66666.67, 2);
    expect(await importeDe(page, 'Libre disposición')).toBeCloseTo(133333.33, 2);
    await expect(tarjeta).toContainText(/Usufructo estimado sobre 100\.000,00\s*€/);
    await expect(tarjeta).toContainText('CC art. 837');

    await formulario(page).getByRole('button', { name: 'Ascendientes: No' }).click();
    await page.getByRole('button', { name: 'Calcular legítimas' }).click();
    await expect(tarjeta.getByText('Libre disposición', { exact: true })).toBeVisible();
    expect(await importeDe(page, 'Libre disposición')).toBeCloseTo(200000, 2);
    await expect(tarjeta).toContainText(/Usufructo estimado sobre 133\.333,33\s*€/);
    await expect(tarjeta).toContainText('CC art. 838');
    // Y caben más de seis hijos, hasta los veinte que admite el motor.
    await expect(page.locator('#numHijos option[value="20"]')).toHaveCount(1);
  });

  test('HALLAZGO 4730 (15/11/2026, REPARADO) · el resultado cuenta al viudo entre los herederos forzosos (art. 807.3.º)', async ({ page }) => {
    await calcular(page, { patrimonio: '300.000', hijos: '2', conyuge: true });
    const fila = tarjetaResultado(page).getByText('Herederos forzosos', { exact: true }).locator('xpath=..');
    await expect(fila).toContainText('2 hijos + cónyuge (usufructo)');
  });
});

test.describe('Textos normativos de la página', () => {
  test('HALLAZGO 4725 (15/11/2026, REPARADO) · el escenario «Sin hijos, con cónyuge y padres» da 100.000 € a los padres y 33.333 € de usufructo', async ({ page }) => {
    // 200.000 € sin descendientes, con ascendientes y viudo: los padres tienen 1/3 por
    // concurrir con el viudo = 66.666,67 € (art. 809) y el viudo el usufructo de la MITAD =
    // 100.000 € (art. 837). La página decía «padres 100.000 € + cónyuge usufructo 1/3 libre
    // (33.333 €)»: ni la fracción ni la cifra (1/3 de 200.000 € no son 33.333 €).
    const escenario = page.getByText('Sin hijos, con cónyuge y padres').locator('xpath=../..');
    const texto = (await escenario.textContent()) ?? '';
    expect(texto).toContain('66.666');
    expect(texto).not.toContain('33.333');
  });

  test('HALLAZGO 4726 (15/11/2026, REPARADO) · el ejemplo de vecindad civil invierte el art. 14.5.2.º CC', async ({ page }) => {
    // Art. 14.5.2.º: la vecindad civil se adquiere «por residencia continuada de diez años, sin
    // declaración en contrario durante este plazo». Quien nació en Navarra y lleva 10 años en
    // Madrid SIN declarar nada ya es de vecindad común.
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).not.toContain('puede seguir siendo de vecindad civil navarra si no ha declarado cambio');
    expect(cuerpo).toContain('sin haber declarado nada ya tiene vecindad civil común');
  });

  test('HALLAZGO 4730 (15/11/2026, REPARADO) · la página dice que el viudo «no es heredero forzoso» (art. 807.3.º)', async ({ page }) => {
    // Art. 807: «Son herederos forzosos: […] 3.º El viudo o viuda en la forma y medida que
    // establece este Código». El FAQPage lo decía bien; la FAQ visible y el bloque educativo, no.
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).not.toMatch(/c[óo]nyuge (superviviente )?no es heredero forzoso/i);
    expect(cuerpo).not.toContain('reclamarian');
  });

  test('HALLAZGO 4731 (15/11/2026, REPARADO) · «Prescribe en 15 años»: ningún artículo vigente del CC fija ese plazo', async ({ page }) => {
    // El art. 815 (complemento de legítima) no tiene plazo propio; el art. 1964.2 vigente da
    // cinco años a las acciones personales y el 1963, treinta a las reales. Los 15 años eran la
    // redacción de 1964 anterior a la Ley 42/2015. Se retira la cifra, no se cambia por otra.
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).not.toContain('Prescribe en 15 años');
    expect(cuerpo).toContain('no le fija un plazo propio');
  });

  test('HALLAZGO 4736 (15/11/2026, REPARADO) · la FAQ visible y el FAQPage dicen lo mismo (una sola fuente)', async ({ page }) => {
    // La desheredación tenía dos respuestas distintas y «quiénes son herederos forzosos» se
    // contradecía entre las dos FAQ. Ahora cada pregunta del FAQPage está en la visible con la
    // MISMA respuesta.
    const faq = (await jsonLd(page)).find((b) => b['@type'] === 'FAQPage');
    const entradas = (faq?.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) ?? [];
    expect(entradas.length).toBeGreaterThanOrEqual(5);
    // La sección educativa nace plegada: se localiza por texto, no por rol (el rol omite lo oculto).
    const lista = page.locator('h3', { hasText: 'Preguntas frecuentes sobre las legítimas' }).locator('xpath=..');
    const visible = (await lista.textContent()) ?? '';
    for (const e of entradas) {
      expect(visible, e.name).toContain(e.name);
      expect(visible, e.name).toContain(e.acceptedAnswer.text);
    }
    expect(visible).not.toContain('¿Puedo desheredar a un hijo?');
  });
});

test.describe('JSON-LD (FAQPage y WebApplication)', () => {
  test('HALLAZGO 4732 (15/11/2026, REPARADO) · el FAQPage dice que manda el domicilio habitual (art. 14.1 CC: la vecindad civil)', async ({ page }) => {
    // Art. 14.1: «La sujeción al derecho civil común o al especial o foral se determina por la
    // vecindad civil». La propia página lo advierte como error frecuente.
    const faq = (await jsonLd(page)).find((b) => b['@type'] === 'FAQPage');
    expect(JSON.stringify(faq)).not.toContain('domicilio habitual');
    expect(JSON.stringify(faq)).toContain('vecindad civil del fallecido');
  });

  test('HALLAZGO 4735 (15/11/2026, REPARADO) · el FAQPage habla de «un euro simbólico» en Navarra y la página de «5 sueldos febles»', async ({ page }) => {
    // No se cambia por otra cifra sin fuente leída: el FAQPage dice ahora que es una legítima
    // formal sin contenido patrimonial efectivo, lo mismo que el resultado de la página.
    const faq = (await jsonLd(page)).find((b) => b['@type'] === 'FAQPage');
    expect(JSON.stringify(faq)).not.toContain('un euro simbólico');
    expect(JSON.stringify(faq)).toContain('legítima formal, sin contenido patrimonial efectivo');
  });

  test('HALLAZGO 4737 (15/11/2026, REPARADO) · el WebApplication sale con featureList vacía (§1.ter: 4-8)', async ({ page }) => {
    const app = (await jsonLd(page)).find((b) => b['@type'] === 'WebApplication');
    const lista = (app?.featureList as unknown[]) ?? [];
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(lista.length).toBeLessThanOrEqual(8);
  });
});

test.describe('Regímenes forales', () => {
  test('País Vasco · 300.000 €, dos hijos y viudo: legítima 100.000 € y usufructo sobre 150.000 € (arts. 49 y 52.1)', async ({ page }) => {
    // Art. 49 Ley 5/2015: 1/3 del caudal = 100.000 €; libre 200.000 €. Art. 52.1: el viudo que
    // concurre con descendientes tiene el usufructo de la mitad = 150.000 €.
    // (La legítima vasca se rotula «colectiva» desde el hallazgo 4728: art. 48.2.)
    await calcular(page, { patrimonio: '300.000', regimen: 'pais-vasco' });
    await expect(tarjetaResultado(page).getByText('Legítima colectiva', { exact: true })).toBeVisible();
    expect(await importeDe(page, 'Legítima colectiva')).toBeCloseTo(100000, 2);
    expect(await importeDe(page, 'Libre disposición')).toBeCloseTo(200000, 2);
    await expect(tarjetaResultado(page)).toContainText(/Usufructo estimado sobre 150\.000,00\s*€/);
  });

  test('HALLAZGO 4727 (15/11/2026, REPARADO) · País Vasco: «Gipuzkoa: sin legítima» (arts. 8, 10.1 y 49 Ley 5/2015)', async ({ page }) => {
    // La ley rige en toda la Comunidad Autónoma (art. 8) para quien tenga vecindad civil vasca
    // (art. 10.1), y su art. 49 fija 1/3 sin excepción guipuzcoana: lo único propio de Gipuzkoa
    // es la ordenación del caserío (arts. 96-99). La excepción real es el valle de Ayala (art. 89).
    await page.locator('#regimen').selectOption('pais-vasco');
    const pista = page.locator('#regimen').locator('xpath=following-sibling::p');
    await expect(pista).toContainText('Bizkaia, Gipuzkoa y Álava');
    await expect(pista).not.toContainText('Gipuzkoa: sin legítima');
    await calcular(page, { patrimonio: '300.000', regimen: 'pais-vasco' });
    await expect(tarjetaResultado(page)).toContainText('también en Gipuzkoa');
    await expect(tarjetaResultado(page)).not.toContainText('En Gipuzkoa no existe legítima');
  });

  test('HALLAZGO 4728 (15/11/2026, REPARADO) · País Vasco: reparte la legítima por hijo como «Obligatoria» (art. 48.2: es colectiva)', async ({ page }) => {
    // Art. 48.2 Ley 5/2015: «puede elegir entre ellos a uno o varios y apartar a los demás». No
    // hay mínimo individual: lo correcto es lo que la app ya hace con Aragón («Distribución
    // libre entre descendientes»). Antes: «50.000,00 €/hijo · Obligatoria».
    await calcular(page, { patrimonio: '300.000', regimen: 'pais-vasco' });
    await expect(bloque(page, 'Legítima colectiva')).toBeVisible();
    await expect(bloque(page, 'Legítima colectiva')).toContainText('Distribución libre entre descendientes');
    await expect(bloque(page, 'Legítima colectiva')).not.toContainText('/hijo');
    // La tabla comparativa: art. 52.1, «usufructo de la mitad de todos los bienes».
    const fila = page.locator('tr', { hasText: 'País Vasco' });
    await expect(fila).toContainText('Usufructo de la mitad de todos los bienes');
    await expect(fila).not.toContainText('haber conyugal');
  });

  test('Cataluña · 400.000 € y dos hijos: legítima 1/4 = 100.000 €, 50.000 € por hijo (arts. 451-3.1 y 451-5)', async ({ page }) => {
    await calcular(page, { patrimonio: '400.000', regimen: 'cataluna' });
    await expect(tarjetaResultado(page).getByText('Legítima total', { exact: true })).toBeVisible();
    expect(await importeDe(page, 'Legítima total')).toBeCloseTo(100000, 2);
    expect(await importeDe(page, 'Libre disposición')).toBeCloseTo(300000, 2);
    await expect(bloque(page, 'Legítima total')).toContainText(/50\.000,00\s*€\/hijo/);
  });

  test('HALLAZGO 4733 (15/11/2026, REPARADO) · Cataluña: la cuarta vidual sale como «Usufructo estimado» (art. 452-1: es una cantidad)', async ({ page }) => {
    // Art. 452-1: el viudo sin recursos suficientes obtiene «la cantidad que sea precisa para
    // atenderlas, hasta un máximo de la cuarta parte del activo hereditario líquido». No es un
    // usufructo ni depende de que no haya hijos (como decía la tabla comparativa).
    await calcular(page, { patrimonio: '400.000', regimen: 'cataluna' });
    await expect(tarjetaResultado(page).getByText('Legítima total', { exact: true })).toBeVisible();
    await expect(tarjetaResultado(page)).not.toContainText('Usufructo estimado');
    await expect(tarjetaResultado(page)).toContainText(/Cuarta viudal: hasta 100\.000,00\s*€ en propiedad/);
    const fila = page.locator('tr', { hasText: 'Cataluña' });
    await expect(fila).toContainText('haya o no hijos');
    await expect(fila).not.toContainText('Solo si no hay hijos');
    await expect(fila).not.toContainText('solo en metálico');
  });

  test('HALLAZGO 4734 (15/11/2026, REPARADO) · Navarra: con viudo, el resultado calla el usufructo de fidelidad que el motor calcula', async ({ page }) => {
    // El motor devuelve derechoConyuge = 300.000 € («Usufructo de fidelidad…») y la tabla de la
    // página lo nombra, pero la rama de Navarra no pintaba la tarjeta del cónyuge: el resultado
    // era idéntico con «Sí» y con «No».
    await calcular(page, { patrimonio: '300.000', regimen: 'navarra', conyuge: true });
    await expect(tarjetaResultado(page).getByText('Libre disposición total', { exact: true })).toBeVisible();
    await expect(tarjetaResultado(page)).toContainText('fidelidad');
    await expect(tarjetaResultado(page)).toContainText(/Usufructo estimado sobre 300\.000,00\s*€/);
    await calcular(page, { patrimonio: '300.000', regimen: 'navarra', conyuge: false });
    await expect(tarjetaResultado(page).getByText('Libre disposición total', { exact: true })).toBeVisible();
    await expect(tarjetaResultado(page)).not.toContainText('fidelidad');
  });
});

test.describe('Accesibilidad', () => {
  test('HALLAZGO 4740 (15/11/2026, REPARADO) · el ⚠️ del aviso de error no va en aria-hidden y el lector lo anuncia', async ({ page }) => {
    await calcular(page, { patrimonio: '-50000' });
    const aviso = formulario(page).locator('[role="alert"]');
    await expect(aviso).toBeVisible();
    await expect(aviso.locator('[aria-hidden="true"]')).toHaveCount(1, { timeout: 2000 });
  });
});
