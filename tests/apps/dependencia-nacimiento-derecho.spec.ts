/**
 * Cuándo nace el derecho a las prestaciones de dependencia — las tres apps que lo explican.
 *
 * Ley 39/2006, disposición final primera, apartado 3 (texto consolidado del BOE,
 * BOE-A-2006-21990, leído el 26/09/2026 y otra vez el 21/10/2026): el derecho «se generará desde
 * la fecha de la resolución de reconocimiento de las prestaciones o, en su caso, cuando haya
 * transcurrido el plazo de seis meses desde la presentación de la solicitud sin haberse dictado
 * y notificado resolución expresa». No desde la solicitud.
 *
 * El hallazgo 2145 lo reparó en orientador-grado-dependencia (998a33e4); el cabo C0034 vio la
 * misma afirmación, «retroactivo desde la fecha de solicitud», en checklist-tramites-dependencia
 * (7 sitios) y estimacion-prestaciones-dependencia (4), reparada el 21/10/2026. Este spec mide
 * las tres a la vez para que la próxima no la vuelva a escribir.
 *
 * 19/11/2026: el RDL 36/2026 bajó el plazo de los apartados 2 y 3 de seis a TRES meses (en vigor
 * el 12/11/2026). Segundo caso, por app: el plazo de tres meses en la página y en el FAQPage.
 */
import { test, expect } from '@playwright/test';

const APPS = [
  'orientador-grado-dependencia',
  'checklist-tramites-dependencia',
  'estimacion-prestaciones-dependencia',
];

for (const slug of APPS) {
  test(`${slug}: el derecho no nace con la solicitud, y la app cita la disposición final primera`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    // textContent, no innerText: cuenta también lo que está en secciones plegadas.
    const texto = ((await page.locator('body').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(texto, 'la app explica de dónde sale la regla').toMatch(/disposición final primera/i);
    expect(texto).not.toMatch(/retroactiv\w* desde la (fecha de )?solicitud/i);
    expect(texto).not.toMatch(/(se devengan|son retroactivos|derechos económicos se cuentan) desde la (fecha de )?solicitud/i);
    expect(texto).not.toMatch(/fecha de (la )?solicitud[^.]{0,40}inicio de tus derechos/i);
  });

  test(`${slug}: el plazo legal es de tres meses (RDL 36/2026), en la página y en el FAQPage`, async ({ page }) => {
    // DF 1.ª.2 y 3 de la Ley 39/2006 en la redacción del RDL 36/2026, de 10 de noviembre (en vigor
    // el 12/11/2026), leída en el consolidado del BOE el 19/11/2026: «será de tres meses» y el
    // derecho nace «cuando haya transcurrido el plazo de tres meses». Las tres apps decían seis
    // (hallazgo 5190 en checklist-tramites-dependencia; medido y reparado en las otras dos el mismo día).
    await page.goto(`/${slug}/`);
    // textContent incluye los <script> del JSON-LD: el FAQPage cuenta igual que la página
    const texto = ((await page.locator('html').textContent()) ?? '').replace(/\s+/g, ' ');
    expect(texto).not.toMatch(/plazo (legal|máximo)[^.]{0,60}\b(6|seis) meses/i);
    expect(texto).not.toMatch(/\b(6|seis) meses (desde|de) (la )?(solicitud|presentación)/i);
    expect(texto).not.toMatch(/a los (6|seis) meses de la solicitud/i);
    expect(texto).toMatch(/(3|tres) meses/);
  });
}
