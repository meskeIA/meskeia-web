import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, desplegarTodo, MARCA, medirContraste, prepararParaMedir, type Medida } from './_contraste';

/**
 * Texto de marca sobre un TINTE de marca, en los dos temas — cabo C0278 (19/10/2026).
 *
 * tests/contraste-marca-botones.spec.ts mide el texto de marca y aparta en `tinte` el que va sobre
 * un tinte translúcido de marca, solo para ANOTARLO («C0278 · texto de marca sobre tinte»). Aquí
 * se EXIGE en las apps donde se midió y se reparó: con la marca de texto ya en --primary-texto,
 * un tinte del 10-15 % la dejaba en 4,36-4,48:1 en claro y 3,73-4,06:1 en oscuro.
 * Fuera, a propósito: curso-negociacion (los cursos están congelados desde el 16/10/2026).
 */

const APPS = ['visualizador-adaptaciones-plantas', 'estimador-hipoteca'] as const;

async function peorSobreTinte(page: Page): Promise<Medida['tinte']> {
  const sinAcento = MARCA.slice(0, 6);
  const m = await medirContraste(page, { texto: sinAcento, separarTinteDe: sinAcento });
  return m.tinte;
}

/**
 * Las dos reglas de la plantilla v2.0 que la nota del 27/10/2026 de C0278 señaló por grep, medidas
 * por píxel el 06/11/2026 con la guía desplegada en los dos temas (/reparar):
 *   · `.escenarioExample code` en --primary-texto sobre el tinte blanco del 5-6 % del oscuro:
 *     comparador-vehiculos y estimador-inflacion 4,40:1, validador-regex 4,29:1, generador-facturas
 *     4,21:1. Reparado como su hermana conversor-pesetas-euros (hallazgo 3580): en oscuro el código
 *     va en --text-primary (bajar el tinte al 3 % dejaba facturas en 4,47:1).
 *   · `.comparativaTable th` en --primary-texto sobre rgba(marca, 0,1) en claro y 0,15 en oscuro:
 *     4,48:1 y 4,02:1 en ocho apps (y 4,48:1 en claro en identificador-color-camara, cuyo oscuro ya
 *     estaba en --text-primary). Receta de ec3a8adb, cambiar el FONDO: 5 % en claro (4,74:1) y sin
 *     tinte en oscuro, donde el 5 % aún daba 4,48:1.
 * Las 29 hermanas del censo sin texto de marca en esas reglas no están: no hay nada que medir.
 */
const PLANTILLA: { slug: string; sel: string }[] = [
  ...['calculadora-iban', 'comparador-vehiculos', 'conversor-pesetas-euros', 'estimador-inflacion', 'generador-citas-apa', 'generador-facturas', 'validador-regex'].map((slug) => ({ slug, sel: '[class*="escenarioExample"] code' })),
  ...['lector-texto-voz', 'visualizador-estratificacion-social', 'tablero-comunicacion', 'planificador-rutinas', 'identificador-color-camara', 'generador-tarjetas-comunicacion', 'ejercicios-vocalizacion', 'daf-retroalimentacion-auditiva', 'visualizador-logica-proposicional', 'guia-respiracion', 'conversor-numeros-letras'].map((slug) => ({ slug, sel: '[class*="comparativaTable"] th' })),
];

for (const { slug, sel } of PLANTILLA) {
  test(`${slug}: ${sel} se lee en claro y en oscuro (C0278, plantilla)`, async ({ page }) => {
    const marca = MARCA.slice(0, 6);
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await desplegarTodo(page);
    const claro = await medirContraste(page, { selector: sel, texto: marca });
    if (claro.ratio >= 0) expect(claro.ratio, `claro: «${claro.texto}» ${claro.color} sobre ${claro.fondo}`).toBeGreaterThanOrEqual(claro.umbral);

    await activarTemaOscuro(page);
    await desplegarTodo(page);
    const oscuro = await medirContraste(page, { selector: sel, texto: marca });
    if (oscuro.ratio >= 0) expect(oscuro.ratio, `oscuro: «${oscuro.texto}» ${oscuro.color} sobre ${oscuro.fondo}`).toBeGreaterThanOrEqual(oscuro.umbral);
  });
}

for (const slug of APPS) {
  test(`${slug}: el texto de marca sobre su tinte cumple en claro y en oscuro (C0278)`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    await desplegarTodo(page);
    const claro = await peorSobreTinte(page);
    if (claro) expect(claro.ratio, `claro: «${claro.texto}» sobre ${claro.fondo}`).toBeGreaterThanOrEqual(claro.umbral);

    await activarTemaOscuro(page);
    await desplegarTodo(page);
    const oscuro = await peorSobreTinte(page);
    if (oscuro) expect(oscuro.ratio, `oscuro: «${oscuro.texto}» sobre ${oscuro.fondo}`).toBeGreaterThanOrEqual(oscuro.umbral);
  });
}
