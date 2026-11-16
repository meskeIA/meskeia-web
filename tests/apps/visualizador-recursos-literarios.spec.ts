import { test, expect } from '@playwright/test';
import { figurasRetorica } from '../../data/figuras-retoricas';
import { metadata, jsonLd, faqJsonLd } from '../../app/visualizador-recursos-literarios/metadata';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Recursos Literarios — lo que dice la app de su banco, que es el de quiz-figuras-retoricas
 * (data/figuras-retoricas.ts). Nace con /reparar del 16/11/2026, al reparar en el quiz dos defectos
 * del mismo banco que esta app repetía:
 *  · 3646: «27 figuras» con 26 en el banco. La cifra sale ahora de `figurasRetorica.length`.
 *  · 3653: «ejemplos reales» / «extraídos de textos literarios reales», cuando la mayoría de los
 *    ejemplos están escritos para la guía y solo algunos citan autor.
 */

test.describe('Recursos Literarios · promesas sobre el banco', () => {
  test('la cifra de figuras es la del banco, en la página y en la metadata', async ({ page }) => {
    const n = figurasRetorica.length;
    expect(n).toBe(26);
    await page.goto('/visualizador-recursos-literarios/');
    await esperarPaginaAsentada(page);
    await expect(page.locator('h1')).toHaveText('Recursos Literarios');
    const subtitulo = page.locator('header p').first();
    await expect(subtitulo).toContainText(`${n} figuras retóricas`);
    const textos = [
      String(metadata.description),
      String(metadata.openGraph?.description),
      String(metadata.twitter?.description),
      JSON.stringify(jsonLd),
      JSON.stringify(faqJsonLd),
    ];
    expect(textos.filter((t) => /\b27 figuras/.test(t))).toEqual([]);
    expect(String(metadata.description)).toContain(`${n} figuras`);
  });

  test('no llama «reales» a ejemplos que en su mayoría están escritos para la guía', async ({ page }) => {
    await page.goto('/visualizador-recursos-literarios/');
    await esperarPaginaAsentada(page);
    const textos = [
      await page.locator('header').innerText(),
      String(metadata.description),
      String(metadata.openGraph?.description),
      JSON.stringify(jsonLd),
      JSON.stringify(faqJsonLd),
    ];
    expect(textos.filter((t) => /ejemplos reales|textos literarios reales/.test(t))).toEqual([]);
  });
});
