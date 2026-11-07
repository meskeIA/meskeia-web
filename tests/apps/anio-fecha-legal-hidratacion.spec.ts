import { test, expect, type Browser } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

// ─────────────────────────────────────────────────────────────────────────────────────────
// CABO C0666 (Inspector, 07/11/2026, de golden-hour al descartar C0538) — REPARADO.
// LegalNotice (lo monta toda app) y los cuatro pies de portal pintaban «© {new Date().getFullYear()}»
// en el render de un componente cliente: con el reloj del visitante en otro año que el del build,
// React daba el error de hidratación 418 y regeneraba el árbol en el cliente.
// Visto al repararlo, y peor: el «Última actualización» de LegalNotice (72 apps) hacía
// new Date('2026-02-02'), medianoche UTC; en un huso de América (medio público) salía el día
// ANTERIOR y, otra vez, error 418. Ahora el año lo pone components/AnioActual.tsx tras hidratar
// y la fecha sale de parseISODateLocal (el gotcha del hallazgo 482).
// Control (07/11/2026, next dev): con el código de antes, golden-hour con el reloj en 2027 y
// calculadora-iva en America/Mexico_City dan «Hydration failed…»; con Madrid y el año en curso, nada.
// ─────────────────────────────────────────────────────────────────────────────────────────

async function medir(browser: Browser, ruta: string, opciones: { timezoneId: string; anio?: number }) {
  const contexto = await browser.newContext({
    timezoneId: opciones.timezoneId,
    locale: 'es-ES',
    serviceWorkers: 'block',
  });
  try {
    const page = await contexto.newPage();
    if (opciones.anio) await page.clock.setFixedTime(new Date(`${opciones.anio}-06-21T10:00:00Z`));
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(String(e).slice(0, 200)));
    page.on('console', (m) => {
      if (m.type() === 'error' && /Hydration failed|error #4(18|19|22|23|25)\b/.test(m.text())) {
        errores.push(m.text().slice(0, 200));
      }
    });
    await page.goto(ruta);
    // Hidratación confirmada y DOM quieto, NO 'networkidle': en producción (next start) los
    // <Link> de las portadas de portal prefetchean /?_rsc=, /fisica/?_rsc=… y alguno queda
    // colgado en localhost, así que 'networkidle' no llega nunca y el test se agotaba a los 30 s
    // en las cuatro portadas (suite de la tanda de /reparar del 07/11/2026, 0 de 3 aislado). En
    // next dev no hay prefetch y pasaba. El error 418 sale durante la hidratación: esta espera lo ve.
    await esperarPaginaAsentada(page);
    const copyright = (await page.locator('[class*="copyright"]').allTextContents()).join(' | ');
    const actualizado = (await page.locator('[class*="lastUpdatedFull"]').allTextContents()).join(' | ');
    return { errores, copyright, actualizado };
  } finally {
    await contexto.close();
  }
}

// El año siguiente al de hoy: el del build (next dev pinta con el reloj del servidor) no lo es.
const ANIO_FUTURO = new Date().getFullYear() + 1;

for (const ruta of ['/golden-hour/', '/stemum/', '/coquinum/', '/cronicum/', '/delegum/']) {
  test(`${ruta}: con el reloj en otro año no hay error de hidratación y el © dice ese año (C0666)`, async ({
    browser,
  }) => {
    const r = await medir(browser, ruta, { timezoneId: 'Europe/Madrid', anio: ANIO_FUTURO });
    expect(r.errores, 'sin error de hidratación').toEqual([]);
    expect(r.copyright).toContain(`© ${ANIO_FUTURO}`);
    expect(r.copyright).not.toContain(`© ${ANIO_FUTURO - 1}`);
  });
}

for (const timezoneId of ['America/Mexico_City', 'America/Argentina/Buenos_Aires', 'Pacific/Auckland']) {
  test(`calculadora-iva en ${timezoneId}: «Última actualización» es el día que declara la app y no hay error de hidratación (C0666)`, async ({
    browser,
  }) => {
    // calculadora-iva declara <LegalNotice lastUpdated="2026-02-02" />.
    const r = await medir(browser, '/calculadora-iva/', { timezoneId });
    expect(r.errores, 'sin error de hidratación').toEqual([]);
    expect(r.actualizado).toContain('2 de febrero de 2026');
  });
}
