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
 */

const PREGUNTA_ANTIGUEDAD = '¿Llevas al menos 3 meses trabajando con tu empresa actual?';
const PREGUNTA_EXPERIENCIA = '¿Tienes al menos 1 año de experiencia profesional acreditable en tu campo?';
const PREGUNTA_SITUACION = '¿Estás en situación regular en España (o vas a solicitar el visado desde el extranjero)?';
const PREGUNTA_CLIENTES = '¿La mayoría de tus clientes e ingresos provienen de fuera de España?';

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
  await expect(si).toHaveCount(8);
  for (let i = 0; i < 8; i++) await si.nth(i).click();
  for (const pregunta of caso.noEn ?? []) {
    const no = tarjeta(page, pregunta).getByRole('button', { name: 'No', exact: true });
    await no.click();
    await expect(no).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(seccionRequisitos(page).getByText('8/8 respondidos')).toBeVisible();
}

const veredicto = (page: Page): Locator =>
  page.getByRole('heading', { level: 2, name: /Cumples los requisitos|Casi cumples|No cumples algún requisito/ });

async function leerJsonLd(page: Page, tipo: string): Promise<Record<string, unknown>> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const encontrado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
  if (!encontrado) throw new Error(`No hay JSON-LD de tipo ${tipo}`);
  return encontrado;
}

test.describe('requisitos-nomada-digital — umbral de ingresos (200 % y 75 % del SMI de data/fiscal)', () => {
  test('caso normal: empleado, 3.000 €/mes, sin dependientes y 8 «Sí» → cumple', async ({ page }) => {
    await rellenar(page, { perfil: 'empleado', ingresos: '3.000' });
    // 2 × 1.221 = 2.442 €/mes; 3.000 ≥ 2.442.
    await expect(page.getByText('Mínimo requerido: 2442,00 €/mes')).toBeVisible();
    // formatCurrency pone un espacio duro (U+00A0) antes del €: en las regex va como \s.
    await expect(page.getByText(/Ingresos suficientes — 3000,00\s€\/mes ≥ mínimo de 2442,00\s€\/mes/)).toBeVisible();
    await expect(veredicto(page)).toHaveText('¡Cumples los requisitos!');
    await expect(page.getByText('8 requisitos cumplidos')).toBeVisible();
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

  test('ABIERTO — rechazo: ingresos ilegibles «2.000.50» no pueden dar «¡Cumples los requisitos!»', async ({ page }) => {
    test.fail(true, 'parseSpanishNumber da NaN, NaN < mínimo es false y el veredicto sale «Cumples» con «Ingresos: No definido/mes ✓»');
    await rellenar(page, { perfil: 'empleado', ingresos: '2.000.50' });
    // Hoy: banner «❌ Ingresos insuficientes — No definido/mes < mínimo de 2442,00 €/mes» y, debajo,
    // «¡Cumples los requisitos!» con «Ingresos: No definido/mes ✓» y la lista de documentación.
    await expect(veredicto(page)).not.toHaveText('¡Cumples los requisitos!', { timeout: 3000 });
    await expect(page.getByText('Ingresos: No definido/mes ✓')).toHaveCount(0, { timeout: 3000 });
  });
});

test.describe('requisitos-nomada-digital — requisitos de la Ley 14/2013', () => {
  test('ABIERTO — empleado con 2 meses de antigüedad: el art. 74 ter c) exige 3 → «No cumples», no «Casi»', async ({ page }) => {
    test.fail(true, 'la antigüedad no está marcada como imprescindible: un solo «No» da «Casi cumples» y la lista de documentos');
    await rellenar(page, { perfil: 'empleado', ingresos: '3.000', noEn: [PREGUNTA_ANTIGUEDAD] });
    await expect(veredicto(page)).toHaveText('No cumples algún requisito clave', { timeout: 3000 });
  });

  test('ABIERTO — empleado en situación irregular en España: el art. 62.3.a lo excluye → «No cumples»', async ({ page }) => {
    test.fail(true, 'la situación regular no está marcada como imprescindible: sale «Casi cumples»');
    await rellenar(page, { perfil: 'empleado', ingresos: '3.000', noEn: [PREGUNTA_SITUACION] });
    await expect(veredicto(page)).toHaveText('No cumples algún requisito clave', { timeout: 3000 });
  });

  test('ABIERTO — freelancer titulado con menos de 1 año de experiencia: la ley no pide ese año → cumple', async ({ page }) => {
    test.fail(true, 'la app exige al freelancer «al menos 1 año de experiencia», requisito que no está en los arts. 74 bis y 74 ter');
    await rellenar(page, { perfil: 'freelancer', ingresos: '3.000', noEn: [PREGUNTA_EXPERIENCIA] });
    await expect(veredicto(page)).toHaveText('¡Cumples los requisitos!', { timeout: 3000 });
  });

  test('ABIERTO — freelancer: la pregunta de clientes debe dar el tope legal del 20 % en España (art. 74 bis)', async ({ page }) => {
    test.fail(true, 'pregunta por «la mayoría» de clientes de fuera: con un 40 % de trabajo en España se contesta «Sí» y sale «Cumples»');
    await rellenar(page, { perfil: 'freelancer', ingresos: '3.000' });
    // Con la pregunta tal cual, quien trabaja un 40 % para España contesta «Sí»: la app dice que cumple.
    await expect(veredicto(page)).toHaveText('¡Cumples los requisitos!');
    const tarjetaClientes = tarjeta(page, PREGUNTA_CLIENTES);
    await expect(tarjetaClientes).toContainText(/20\s?%/, { timeout: 3000 });
  });
});

test.describe('requisitos-nomada-digital — JSON-LD', () => {
  test('ABIERTO — el FAQPage da el plazo del visado del art. 75.5 (10 días hábiles), como la FAQ visible', async ({ page }) => {
    test.fail(true, 'el FAQPage dice «20 días hábiles» y que «la visa inicial ... puede renovarse por periodos de dos años»');
    await abrir(page);
    const faq = await leerJsonLd(page, 'FAQPage');
    const preguntas = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    const plazo = preguntas.find((p) => /Cuánto tiempo tarda/.test(p.name));
    expect(plazo, 'pregunta del plazo en el FAQPage').toBeTruthy();
    expect(plazo!.acceptedAnswer.text).toContain('10 días hábiles');
  });

  test('ABIERTO — features del WebApplication con al menos 4 características', async ({ page }) => {
    test.fail(true, 'features: [] en app/requisitos-nomada-digital/metadata.ts');
    await abrir(page);
    const app = await leerJsonLd(page, 'WebApplication');
    const lista = (app.featureList ?? app.features ?? []) as unknown;
    const n = Array.isArray(lista) ? lista.length : typeof lista === 'string' ? lista.split(',').filter(Boolean).length : 0;
    expect(n).toBeGreaterThanOrEqual(4);
  });
});
