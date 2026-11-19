import { test, expect, Page, Locator } from '@playwright/test';
import { esperarValorEnReact } from './_hidratacion';

/**
 * Orientador Visa Nómada Digital (requisitos-nomada-digital) — inspección del 18/11/2026
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Visa Nómada Digital»: «Comprueba si cumples los requisitos para trabajar en remoto
 *   desde España». Title «Orientador Visa Nómada Digital 2026 — ¿Cumples los Requisitos?».
 *   Dos perfiles (empleado / freelancer), un campo de ingresos mensuales, un contador de
 *   familiares dependientes y 8 preguntas Sí/No por perfil. Veredicto: «¡Cumples los
 *   requisitos!», «Casi cumples los requisitos» o «No cumples algún requisito clave».
 *
 * EL MOTOR (app/requisitos-nomada-digital/page.tsx:139-184)
 *   mínimo = MINIMO_INGRESOS_TITULAR_NOMADA + dependientes × MINIMO_INGRESOS_DEPENDIENTE_NOMADA
 *   ingresos insuficientes o un «No» en un requisito «Imprescindible» → «No cumples»;
 *   0 «No» → «Cumples»; 1 «No» no imprescindible → «Casi»; 2 o más → «No cumples».
 *
 * DE DÓNDE SALE CADA ESPERADO (resuelto a mano ANTES de abrir el navegador)
 *   · SMI 2026 = 1.221 €/mes en 14 pagas: data/fiscal/smi.ts (SMI_2026.mensual14, RD 126/2026).
 *   · Titular 200 % SMI = 2 × 1.221 = 2.442 €/mes; cada dependiente 75 % SMI = 0,75 × 1.221 =
 *     915,75 €/mes: data/fiscal/nomada-digital.ts (el módulo redondea ese 75 % a 916).
 *   · Ley 14/2013 consolidada (BOE-A-2013-10074), leída el 18/11/2026:
 *       art. 62.3.a «No encontrarse irregularmente en territorio español»;
 *       art. 62.3.e seguro de enfermedad público o privado;
 *       art. 74 bis: por cuenta ajena «solo podrá trabajar para empresas radicadas fuera del
 *         territorio nacional»; el profesional puede «trabajar para una empresa ubicada en España
 *         siempre y cuando el porcentaje de dicho trabajo no sea superior al 20 % del total de su
 *         actividad profesional»; cualificación: graduados o postgraduados «o bien con una
 *         experiencia profesional mínima de tres años»;
 *       art. 74 ter c) y d): relación laboral o mercantil «durante al menos, los últimos tres
 *         meses anteriores a la presentación de la solicitud» (ningún año de experiencia propia);
 *       art. 75.5: «Las solicitudes de visado se resolverán y notificarán en el plazo de 10 días
 *         hábiles»; art. 76: autorización, «veinte días» y silencio estimatorio.
 *
 * Los casos que demuestran un hallazgo ABIERTO van con test.fail().
 *
 * REPARACIÓN DEL 19/11/2026 (/reparar, hallazgos 5168-5171, 5173, 5174 y 5176-5180): los arts.
 * citados se releyeron en el BOE ese día, y el art. 93 LIRPF en la Ley 28/2022 (BOE-A-2022-21739).
 * Cada perfil tiene ahora 9 requisitos, todos legales: un «No» en cualquiera da «No cumples» (ya
 * no hay «Casi cumples»). El freelancer pierde «1 año de experiencia» (no está en la ley) y gana
 * la relación mercantil de 3 meses (74 ter d); los dos perfiles, el año de actividad de la empresa
 * (74 ter a). Sigue ABIERTO el 5172 (redondeo del 75 % en data/fiscal, decisión del usuario).
 */

const PREGUNTA_ANTIGUEDAD = '¿Llevas al menos 3 meses trabajando con tu empresa actual?';
const PREGUNTA_SITUACION = '¿Estás en situación regular en España (o vas a solicitar el visado desde el extranjero)?';
const PREGUNTA_CLIENTES = '¿Tu trabajo para empresas ubicadas en España es, como mucho, el 20 % de tu actividad profesional?';
const PREGUNTA_RELACION = '¿Llevas al menos 3 meses trabajando para una o varias empresas no localizadas en España?';
const N_REQUISITOS = 9;

type Perfil = 'empleado' | 'freelancer';

interface Caso {
  perfil: Perfil;
  ingresos: string;
  dependientes?: number;
  /** Preguntas (texto literal) que se contestan «No»; el resto, «Sí». */
  noEn?: readonly string[];
}

/** La app no tiene inputs hasta elegir perfil: el testigo es que React cuelgue sus props del botón. */
async function abrir(page: Page): Promise<void> {
  await page.goto('/requisitos-nomada-digital/');
  await page.waitForFunction(
    () => {
      const b = document.querySelector('button[aria-pressed]');
      return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps$'));
    },
    null,
    { timeout: 20_000 },
  );
}

function seccionRequisitos(page: Page): Locator {
  return page.locator('section').filter({ has: page.getByRole('heading', { name: /Requisitos legales/ }) });
}

function tarjeta(page: Page, pregunta: string): Locator {
  return seccionRequisitos(page)
    .getByText(pregunta, { exact: true })
    .locator('xpath=ancestor::div[.//button[@aria-pressed]][1]');
}

async function rellenar(page: Page, caso: Caso): Promise<void> {
  await abrir(page);
  await page
    .getByRole('button', { name: caso.perfil === 'empleado' ? /Empleado por cuenta ajena/ : /Freelancer/ })
    .click();
  for (let i = 0; i < (caso.dependientes ?? 0); i++) {
    await page.getByRole('button', { name: 'Añadir dependiente' }).click();
  }
  const ingresos = page.getByLabel('Ingresos mensuales netos');
  await ingresos.fill(caso.ingresos);
  await esperarValorEnReact(page, ingresos, caso.ingresos);
  await ingresos.blur();

  const si = seccionRequisitos(page).getByRole('button', { name: 'Sí', exact: true });
  await expect(si).toHaveCount(N_REQUISITOS);
  for (let i = 0; i < N_REQUISITOS; i++) await si.nth(i).click();
  for (const pregunta of caso.noEn ?? []) {
    const no = tarjeta(page, pregunta).getByRole('button', { name: 'No', exact: true });
    await no.click();
    await expect(no).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(seccionRequisitos(page).getByText(`${N_REQUISITOS}/${N_REQUISITOS} respondidos`)).toBeVisible();
}

const veredicto = (page: Page): Locator =>
  page.getByRole('heading', { level: 2, name: /Cumples los requisitos|Casi cumples|No cumples algún requisito/ });

async function textoFaqVisible(page: Page): Promise<string> {
  // Por CSS y no por rol: la guía nace plegada y lo plegado no está en el árbol de accesibilidad
  return ((await page.locator('section', { has: page.locator('h2', { hasText: 'Preguntas frecuentes' }) }).textContent()) ?? '').replace(/\s+/g, ' ');
}

/** Fila de la tabla de la guía (plegada: por CSS, no por rol) */
const filaGuia = (page: Page, rotulo: string): Locator => page.locator('tr', { hasText: rotulo });

async function leerJsonLd(page: Page, tipo: string): Promise<Record<string, unknown>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const encontrado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
  if (!encontrado) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return encontrado;
}

test.describe('requisitos-nomada-digital — umbral de ingresos (200 % y 75 % del SMI de data/fiscal)', () => {
  test('caso normal: empleado, 3.000 €/mes, sin dependientes y 9 «Sí» → cumple', async ({ page }) => {
    await rellenar(page, { perfil: 'empleado', ingresos: '3.000' });
    // 2 × 1.221 = 2.442 €/mes; 3.000 ≥ 2.442.
    await expect(page.getByText('Mínimo requerido: 2442,00 €/mes')).toBeVisible();
    // formatCurrency pone un espacio duro (U+00A0) antes del €: en las regex va como \s.
    await expect(page.getByText(/Ingresos suficientes — 3000,00\s€\/mes ≥ mínimo de 2442,00\s€\/mes/)).toBeVisible();
    await expect(veredicto(page)).toHaveText('¡Cumples los requisitos!');
    await expect(page.getByText('9 requisitos cumplidos')).toBeVisible();
    await expect(page.getByText('Ingresos: 3000,00 €/mes ✓')).toBeVisible();
  });

  test('límite: exactamente 2.442 €/mes sin dependientes → suficiente (el umbral se alcanza con ≥)', async ({ page }) => {
    await rellenar(page, { perfil: 'empleado', ingresos: '2.442' });
    await expect(page.getByText(/Ingresos suficientes — 2442,00\s€\/mes ≥ mínimo de 2442,00\s€\/mes/)).toBeVisible();
    await expect(veredicto(page)).toHaveText('¡Cumples los requisitos!');
  });

  test('límite: 0 €/mes → insuficiente y «No cumples»', async ({ page }) => {
    await rellenar(page, { perfil: 'empleado', ingresos: '0' });
    await expect(page.getByText(/Ingresos insuficientes — 0,00\s€\/mes < mínimo de 2442,00\s€\/mes/)).toBeVisible();
    await expect(veredicto(page)).toHaveText('No cumples algún requisito clave');
  });

  test('ABIERTO — límite con 1 dependiente: 2.442 + 0,75 × 1.221 = 3.357,75 €/mes debe bastar', async ({ page }) => {
    test.fail(true, 'MINIMO_INGRESOS_DEPENDIENTE_NOMADA redondea 915,75 a 916: pide 3.358,00 €/mes y rechaza 3.357,75');
    await rellenar(page, { perfil: 'empleado', ingresos: '3.357,75', dependientes: 1 });
    await expect(page.getByText('Mínimo requerido: 3357,75 €/mes')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/Ingresos suficientes — 3357,75\s€\/mes/)).toBeVisible({ timeout: 3000 });
    await expect(veredicto(page)).toHaveText('¡Cumples los requisitos!', { timeout: 3000 });
  });

  test('REPARADO (5168) — rechazo: ingresos ilegibles «2.000.50» no dan veredicto y avisan', async ({ page }) => {
    // Era: parseSpanishNumber da NaN, NaN < mínimo es false y salía «Cumples» con «Ingresos: No definido/mes ✓».
    await rellenar(page, { perfil: 'empleado', ingresos: '2.000.50' });
    await expect(page.getByText(/No se puede leer la cifra de ingresos/)).toBeVisible();
    await expect(veredicto(page)).toHaveCount(0);
    await expect(page.getByText(/No definido/)).toHaveCount(0);
    // Corregida la cifra (2.000,50 < 2.442), sale el veredicto que toca
    const ingresos = page.getByLabel('Ingresos mensuales netos');
    await ingresos.fill('2.000,50');
    await esperarValorEnReact(page, ingresos, '2.000,50');
    await expect(veredicto(page)).toHaveText('No cumples algún requisito clave');
  });

  test('REPARADO (5180) — el veredicto y el banner de ingresos están en regiones vivas', async ({ page }) => {
    await rellenar(page, { perfil: 'empleado', ingresos: '3.000' });
    const enRegionViva = (l: Locator) =>
      l.evaluate((el) => !!el.closest('[aria-live="polite"], [role="status"]'));
    expect(await enRegionViva(veredicto(page))).toBe(true);
    expect(await enRegionViva(page.getByText(/Ingresos suficientes/))).toBe(true);
  });
});

test.describe('requisitos-nomada-digital — requisitos de la Ley 14/2013', () => {
  test('REPARADO (5170) — empleado con 2 meses de antigüedad: el art. 74 ter c) exige 3 → «No cumples», no «Casi»', async ({ page }) => {
    await rellenar(page, { perfil: 'empleado', ingresos: '3.000', noEn: [PREGUNTA_ANTIGUEDAD] });
    await expect(veredicto(page)).toHaveText('No cumples algún requisito clave', { timeout: 3000 });
  });

  test('REPARADO (5170) — empleado en situación irregular en España: el art. 62.3.a lo excluye → «No cumples»', async ({ page }) => {
    await rellenar(page, { perfil: 'empleado', ingresos: '3.000', noEn: [PREGUNTA_SITUACION] });
    await expect(veredicto(page)).toHaveText('No cumples algún requisito clave', { timeout: 3000 });
  });

  test('REPARADO (5171) — freelancer titulado con menos de 1 año de experiencia: la ley no pide ese año → cumple', async ({ page }) => {
    // Era: «¿Tienes al menos 1 año de experiencia profesional acreditable en tu campo?», que no
    // está en los arts. 74 bis ni 74 ter; ahora se pregunta la relación mercantil de 3 meses (74 ter d).
    await rellenar(page, { perfil: 'freelancer', ingresos: '3.000' });
    await expect(seccionRequisitos(page)).not.toContainText('1 año de experiencia');
    await expect(tarjeta(page, PREGUNTA_RELACION)).toBeVisible();
    await expect(veredicto(page)).toHaveText('¡Cumples los requisitos!', { timeout: 3000 });
    // Sin esos 3 meses con empresas de fuera, no cumple
    await tarjeta(page, PREGUNTA_RELACION).getByRole('button', { name: 'No', exact: true }).click();
    await expect(veredicto(page)).toHaveText('No cumples algún requisito clave');
  });

  test('REPARADO (5169) — freelancer: la pregunta de clientes da el tope legal del 20 % en España (art. 74 bis)', async ({ page }) => {
    // Era: «¿La mayoría de tus clientes e ingresos provienen de fuera de España?»: con un 40 % de
    // trabajo para España se contestaba «Sí» y salía «Cumples». Ahora quien trabaja un 40 % para
    // España contesta «No» a la pregunta del 20 % y no cumple.
    await rellenar(page, { perfil: 'freelancer', ingresos: '3.000', noEn: [PREGUNTA_CLIENTES] });
    await expect(veredicto(page)).toHaveText('No cumples algún requisito clave');
    // Y al empleado no se le aplica ningún porcentaje: su empresa tiene que estar radicada fuera
    await abrir(page);
    await page.getByRole('button', { name: /Empleado por cuenta ajena/ }).click();
    await expect(seccionRequisitos(page)).not.toContainText(/20\s?%/);
    await expect(seccionRequisitos(page)).toContainText('radicada fuera de España');
  });

  test('REPARADO (5176) — cualificación con «al menos» 3 años y antecedentes de los 2 últimos años (arts. 74 bis y 62.3.c)', async ({ page }) => {
    await rellenar(page, { perfil: 'empleado', ingresos: '3.000' });
    await expect(seccionRequisitos(page)).toContainText('¿Tienes titulación universitaria o acreditas al menos 3 años de experiencia profesional?');
    await expect(seccionRequisitos(page)).toContainText('países donde has residido los últimos 2 años');
    await expect(page.getByText(/países de residencia de los últimos 2 años, y declaración responsable de no tenerlos en los últimos 5/)).toBeVisible();
  });

  test('REPARADO (5179) — el % va separado con espacio duro en documentos y tabla', async ({ page }) => {
    await rellenar(page, { perfil: 'empleado', ingresos: '3.000' });
    // 2442 sin punto: con cuatro cifras enteras es-ES no agrupa (CLAUDE.md §2)
    await expect(page.getByText('Últimas 3 nóminas que acrediten ingresos ≥ 200 % SMI (2442 €/mes)')).toBeVisible();
    await expect(filaGuia(page, 'Residencia fiscal')).toContainText('24 % de la base liquidable');
    const guia = (await textoFaqVisible(page)) + ((await page.locator('table').first().textContent()) ?? '');
    expect(guia).not.toMatch(/\d%/);
  });
});

test.describe('requisitos-nomada-digital — JSON-LD', () => {
  test('REPARADO (5173) — el FAQPage da el plazo del visado del art. 75.5 (10 días hábiles), como la FAQ visible', async ({ page }) => {
    // Era: el FAQPage decía «20 días hábiles» y que «la visa inicial ... puede renovarse por periodos de dos años».
    await abrir(page);
    const faq = await leerJsonLd(page, 'FAQPage');
    const preguntas = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    const plazo = preguntas.find((p) => /Cuánto tiempo tarda/.test(p.name));
    expect(plazo, 'pregunta del plazo en el FAQPage').toBeTruthy();
    expect(plazo!.acceptedAnswer.text).toContain('10 días hábiles');
    expect(plazo!.acceptedAnswer.text).toContain('veinte días');
    expect(plazo!.acceptedAnswer.text).not.toContain('20 días hábiles');
    // Una sola respuesta: la FAQ visible dice exactamente lo mismo
    expect(await textoFaqVisible(page)).toContain(plazo!.acceptedAnswer.text);
    // Tabla: la autorización no se resuelve en 10 días, sino en veinte con silencio estimatorio
    await expect(filaGuia(page, 'Plazo de resolución')).toContainText('Veinte días; sin respuesta, concedida por silencio (art. 76)');
  });

  test('REPARADO (5174) — el art. 93 LIRPF: el año del cambio y los cinco siguientes, base liquidable y perfiles', async ({ page }) => {
    // Era: «durante 5 años» (visible) y «durante los primeros 5 años … sobre los rendimientos del
    // trabajo» (FAQPage), sin distinguir el freelancer, que solo entra por el art. 93.1.b) 3.º o 4.º.
    await abrir(page);
    const faq = await leerJsonLd(page, 'FAQPage');
    const preguntas = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    const fiscal = preguntas.find((p) => /ventaja fiscal/.test(p.name));
    expect(fiscal, 'pregunta fiscal en el FAQPage').toBeTruthy();
    const t = fiscal!.acceptedAnswer.text;
    expect(t).toContain('el año del cambio de residencia y los cinco siguientes');
    expect(t).toContain('la base liquidable hasta 600.000 €');
    expect(t).toContain('un freelancer solo entra si');
    expect(t).not.toMatch(/durante (los primeros )?5 años/);
    // textoFaqVisible pliega los espacios (también el duro del «24 %»): se compara igual plegado
    expect(await textoFaqVisible(page)).toContain(t.replace(/\s+/g, ' '));
  });

  test('REPARADO (5177) — duraciones y cifras del FAQPage salen de data/fiscal', async ({ page }) => {
    await abrir(page);
    await expect(filaGuia(page, 'Duración')).toContainText('Hasta 3 años, renovable por períodos de 2 años');
    const faq = await leerJsonLd(page, 'FAQPage');
    const preguntas = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    const ingreso = preguntas.find((p) => /ingreso mínimo/.test(p.name));
    expect(ingreso!.acceptedAnswer.text).toContain('con un SMI de 1221 € mensuales, el umbral se sitúa en 2442 € al mes');
  });

  test('REPARADO (5178) — features del WebApplication con al menos 4 características', async ({ page }) => {
    await abrir(page);
    const app = await leerJsonLd(page, 'WebApplication');
    const lista = (app.featureList ?? app.features ?? []) as unknown;
    const n = Array.isArray(lista) ? lista.length : typeof lista === 'string' ? lista.split(',').filter(Boolean).length : 0;
    expect(n).toBeGreaterThanOrEqual(4);
  });
});
