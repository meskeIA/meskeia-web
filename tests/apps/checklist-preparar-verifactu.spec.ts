/**
 * Checklist VeriFactu — testigos del cabo C0318 (reparar, 22/10/2026)
 *
 * La app no tenía spec. Lo que el cabo dejó anclado, contrastado en sesión con las fuentes:
 *   · RD 1007/2023 (BOE-A-2023-24840, consolidado): art. 3.1.b obliga a los contribuyentes del
 *     IRPF «que desarrollen actividades económicas», sin distinguir el método de estimación; el
 *     art. 3.3 excluye a quien lleva los libros por el SII. El FAQPage decía que los de módulos
 *     quedaban EXCLUIDOS, y la FAQ visible, que no: se contradecían.
 *   · Art. 16.3: los sistemas VERI*FACTU «no tendrán la obligación de realizar la firma
 *     electrónica de los registros»; la firma del art. 12 es de la modalidad sin remisión. Y la
 *     modalidad VERI*FACTU es voluntaria (FAQ de la AEAT, «Sistemas VERI*FACTU»): la app decía
 *     que el reglamento OBLIGA a remitir en tiempo real y que el certificado era para firmar.
 *   · Art. 201 bis LGT (FAQ de la AEAT, «Cuestiones generales: objeto»): «multa pecuniaria fija
 *     de 50.000 euros por cada ejercicio» a quien tenga un sistema no conforme o alterado, y
 *     150.000 € a productores. La app decía «hasta 50.000 €» y «sanción por cada factura no
 *     reportada», que la ley no tiene.
 */
import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

const RUTA = '/checklist-preparar-verifactu/';

async function abrir(page: Page) {
  await page.goto(RUTA);
  // Mira el rastreador de valor que React monta en los inputs: las casillas del checklist.
  await esperarHidratacion(page, ['input[type="checkbox"]']);
}

/** El texto del panel de información de un punto, desplegándolo. */
async function info(page: Page, titulo: RegExp): Promise<string> {
  const boton = page.getByRole('button', { name: titulo });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-expanded', 'true');
  const texto = await boton.locator('xpath=ancestor::li[1]').locator('[class*="infoPanel"]').innerText();
  return texto.replace(/ /g, ' ');
}

async function faqJsonLd(page: Page): Promise<string> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  return bloques.filter((b) => b.includes('FAQPage')).join(' ');
}

test.describe('Checklist VeriFactu — C0318', () => {
  test('el FAQPage no excluye a los de módulos: el art. 3.1.b no distingue el método de estimación', async ({ page }) => {
    await abrir(page);
    const faq = await faqJsonLd(page);
    expect(faq).not.toMatch(/excluidos quienes tributan en módulos/i);
    expect(faq).toMatch(/también en estimación objetiva \(módulos\)/);
    expect(faq).toMatch(/SII/);
  });

  test('la sanción es una multa fija de 50.000 € por ejercicio, no «hasta», y no hay una por factura', async ({ page }) => {
    await abrir(page);
    const texto = await info(page, /Más información sobre: Conozco las sanciones/);
    expect(texto).toMatch(/multa fija de 50\.000 € por cada ejercicio/);
    expect(texto).not.toMatch(/hasta 50\.000/);
    expect(texto).not.toMatch(/por cada factura/);
    const faq = await faqJsonLd(page);
    expect(faq).toMatch(/multa fija de 50\.000 € por cada ejercicio/);
    expect(faq).not.toMatch(/hasta 50\.000/);
  });

  test('con VERI*FACTU los registros no se firman, y remitir es voluntario', async ({ page }) => {
    await abrir(page);
    const certificado = await info(page, /Más información sobre: Tengo certificado digital/);
    expect(certificado).toMatch(/no se firman/);
    expect(certificado).not.toMatch(/Necesario para la firma electrónica de los registros/);
    const queEs = await info(page, /Más información sobre: Sé qué es VeriFactu/);
    expect(queEs).toMatch(/voluntaria/);
    expect(queEs).not.toMatch(/en tiempo real/);
    expect(await faqJsonLd(page)).not.toMatch(/obliga a enviar registros de facturas a la AEAT en tiempo real/);
  });
});
