import { test, expect } from '@playwright/test';

/**
 * Testigo de familia — la cifra de fichas que promete una guía-directorio es la que pinta
 * (cabo C0658, defecto C).
 *
 * DE DÓNDE SALE
 * guia-frutas-exoticas (inspector 07/11/2026, hallazgo 4175): prometía 40 frutas en el hero, la
 * metadata y los registros con 39 en el array. Medido el 07/11/2026 en todas las app/guia-*
 * (.reparar-trabajo/medir-c0658-c.mjs de la copia de reparar): ocho más prometían de más
 * (cortes-carne 45 con 28, especias 65 con 55, estilos-cerveza 47 con 44, plantas-interior 40
 * con 37, quesos 55 con 52, setas 40 con 34, superalimentos 40 con 39, tipos-pan 35 con 34).
 * Receta: en la página la cifra sale de `ARRAY.length`; la metadata y los registros del
 * catálogo no la repiten, porque no pueden leer el array y envejecen solos.
 *
 * QUÉ MIDE
 * Cuenta las fichas pintadas (los elementos con la clase de ficha de su módulo) sin filtros, y
 * exige que la primera cifra del hero sea esa, y que la description, og:description,
 * twitter:description y la del JSON-LD no lleven ninguna otra cifra de dos o tres dígitos.
 * Control: con el hero de antes, cortes-carne dice 45 con 28 fichas.
 */

interface Fila {
  slug: string;
  /** Nombre local de la clase de cada ficha (`card` → «…__card» en dev, «hash_card» en el build) */
  ficha: string;
  /** La guía escribe la cifra en el hero */
  heroConCifra: boolean;
}

const FILAS: Fila[] = [
  { slug: 'guia-cortes-carne', ficha: 'card', heroConCifra: true },
  { slug: 'guia-especias', ficha: 'especiaCard', heroConCifra: false },
  { slug: 'guia-estilos-cerveza', ficha: 'card', heroConCifra: true },
  { slug: 'guia-frutas-exoticas', ficha: 'card', heroConCifra: false },
  { slug: 'guia-plantas-interior', ficha: 'card', heroConCifra: true },
  { slug: 'guia-quesos', ficha: 'card', heroConCifra: true },
  { slug: 'guia-setas', ficha: 'setaCard', heroConCifra: true },
  { slug: 'guia-superalimentos', ficha: 'card', heroConCifra: true },
  { slug: 'guia-tipos-pan', ficha: 'card', heroConCifra: true },
];

test.describe('guías-directorio · la cifra prometida es la que se pinta (C0658)', () => {
  for (const f of FILAS) {
    test(`${f.slug}: hero y metadata cuadran con las fichas`, async ({ page }) => {
      await page.goto(`/${f.slug}/`);
      const fichas = await page.evaluate((fin) => {
        // La clase compilada es «page-module__hash__card» en `next dev` y «hash_card» en el
        // build (C0457, tests/apps/_modulo-css.ts): se casa el final «_card» y se agrupa por
        // clase completa, que separa el módulo de la guía de los componentes compartidos
        // (RelatedApps, ShareCard…) que usan el mismo nombre local. Las fichas son el grupo
        // mayor: las compartidas no pasan de 4. La primera versión buscaba «__card» y en el
        // build contaba 0 (suite de la tanda de reparar del 07/11/2026).
        const grupos = new Map<string, number>();
        for (const e of document.querySelectorAll('[class]')) {
          for (const c of e.classList) {
            if (c.endsWith(`_${fin}`)) grupos.set(c, (grupos.get(c) ?? 0) + 1);
          }
        }
        return Math.max(0, ...grupos.values());
      }, f.ficha);
      expect(fichas, 'la guía pinta sus fichas').toBeGreaterThan(5);

      if (f.heroConCifra) {
        const hero = await page.locator('header, [class*="hero" i]').first().innerText();
        const cifra = Number(hero.match(/\b\d{2,3}\b/)?.[0]);
        expect(cifra, `primera cifra del hero: «${hero.slice(0, 120)}»`).toBe(fichas);
      }

      const descripciones = await page.evaluate(() => {
        const meta = (sel: string) => document.querySelector(sel)?.getAttribute('content') ?? '';
        const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
          .map((s) => {
            try {
              const j = JSON.parse(s.textContent || '{}');
              return j['@type'] === 'WebApplication' ? String(j.description ?? '') : '';
            } catch {
              return '';
            }
          })
          .join(' ');
        return [
          meta('meta[name="description"]'),
          meta('meta[property="og:description"]'),
          meta('meta[name="twitter:description"]'),
          ld,
        ];
      });
      for (const d of descripciones) {
        const otras = (d.match(/\b\d{2,3}\b/g) ?? []).map(Number).filter((n) => n !== fichas);
        expect(otras, `«${d.slice(0, 120)}»`).toEqual([]);
      }
    });
  }
});
