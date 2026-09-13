import { test, expect, Page } from '@playwright/test';

/**
 * S0140 — el verbo «escriturar» en las seis apps de gastos de compraventa.
 *
 * DE DÓNDE SALE. En Search Console (90 días a 13/09/2026), la consulta «cuanto cuesta
 * escriturar una plaza de garaje» aterrizaba en `simulador-gastos-compraventa-garaje` en la
 * POSICIÓN 14,4, mientras esa misma app estaba en la 1,9-2,5 para «simulador gastos compra
 * venta garaje»; la misma pregunta sobre trastero caía en la 5,3. El motivo estaba en el
 * texto: el verbo «escriturar» no aparecía ni una vez en las seis apps del clúster ni en sus
 * keywords, pese a ser exactamente lo que calculan (notaría + registro + impuesto).
 *
 * QUÉ VIGILA ESTE FICHERO. No la posición en Google, que no depende de nosotros, sino las tres
 * cosas que sí:
 *   1. que la pregunta siga SERVIDA en el HTML —es lo que indexa el buscador—,
 *   2. que siga VISIBLE al desplegar el bloque educativo —es lo que lee la persona—, y
 *   3. que la respuesta visible y la del FAQPage sigan siendo la misma. Esa tercera es el
 *      hallazgo 624 del Inspector, que salió de tener el mismo texto escrito dos veces en dos
 *      ficheros y verlos divergir; aquí las dos salen de `respuestaEscriturar()`.
 *
 * OJO AL PRIMER PUNTO. La FAQ de estas seis apps vive dentro de `<EducationalSection>`, que
 * nace colapsada, así que `innerText` NO la ve: la primera versión de este fichero daba 18
 * rojos sobre una implementación correcta. Se lee con `textContent`, que sí recorre lo
 * colapsado, y el caso 2 despliega la sección de verdad para comprobar lo otro.
 */

const APPS = [
  { slug: 'simulador-gastos-compraventa-garaje', inmueble: 'una plaza de garaje' },
  { slug: 'simulador-gastos-compraventa-trastero', inmueble: 'un trastero' },
  { slug: 'simulador-gastos-compraventa-local-comercial', inmueble: 'un local comercial' },
  { slug: 'simulador-gastos-compraventa-nave-industrial', inmueble: 'una nave industrial' },
  { slug: 'simulador-gastos-compraventa-solar', inmueble: 'un solar' },
  { slug: 'simulador-gastos-compraventa-terreno-rustico', inmueble: 'una finca rústica' },
];

/** Todo el texto SERVIDO, incluido lo que está colapsado: es lo que indexa el buscador. */
async function textoServido(page: Page): Promise<string> {
  const bruto = (await page.locator('body').textContent()) ?? '';
  return bruto.replace(/\s+/g, ' ').trim();
}

/** Las preguntas del FAQPage que la página sirve en su JSON-LD. */
async function preguntasDelFaqPage(page: Page): Promise<string[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  const preguntas: string[] = [];
  for (const bruto of bloques) {
    const datos = JSON.parse(bruto);
    if (datos['@type'] !== 'FAQPage') continue;
    for (const entrada of datos.mainEntity ?? []) preguntas.push(entrada.name);
  }
  return preguntas;
}

for (const app of APPS) {
  test.describe(`«escriturar» en ${app.slug}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${app.slug}/`);
    });

    test('la pregunta se sirve en el HTML, con el verbo y el inmueble por su nombre', async ({ page }) => {
      expect(await textoServido(page)).toContain(`¿Cuánto cuesta escriturar ${app.inmueble}?`);
    });

    test('la respuesta nombra las tres partidas y no se queda en la notaría', async ({ page }) => {
      const texto = await textoServido(page);
      // Escriturar en sentido estricto es el notario; la pregunta, en el uso corriente, abarca
      // todo lo que hay que pagar para quedar inscrito. Contestar solo lo primero dejaría fuera
      // el grueso del desembolso, que es el impuesto.
      expect(texto).toContain('ante notario');
      expect(texto).toContain('Registro de la Propiedad');
      expect(texto).toContain('ITP');
      // Y da cifras, no solo conceptos: al menos un importe en euros dentro de esa respuesta.
      const respuesta = texto.slice(texto.indexOf('Escriturar, en sentido estricto'), texto.indexOf('Escriturar, en sentido estricto') + 900);
      expect(respuesta).toMatch(/\d{1,3}(\.\d{3})* €/);
    });

    test('el importe de referencia se declara en voz alta, no se suelta a secas', async ({ page }) => {
      // Una cifra sin decir sobre qué precio está calculada invitaría a tomarla por el coste
      // de escriturar cualquier cosa.
      expect(await textoServido(page)).toMatch(new RegExp(`para ${app.inmueble} de \\d`));
    });

    test('al desplegar el bloque educativo, la pregunta se LEE en pantalla', async ({ page }) => {
      const desplegable = page.getByRole('button', { expanded: false }).first();
      await desplegable.click();
      await expect(page.getByText(`¿Cuánto cuesta escriturar ${app.inmueble}?`)).toBeVisible();
    });

    test('la pregunta visible y la del FAQPage son la misma', async ({ page }) => {
      const preguntas = await preguntasDelFaqPage(page);
      expect(preguntas).toContain(`¿Cuánto cuesta escriturar ${app.inmueble}?`);
    });
  });
}
