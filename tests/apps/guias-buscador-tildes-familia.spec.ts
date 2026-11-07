import { test, expect, type Page } from '@playwright/test';

/**
 * Testigo de familia — el buscador de las guías-directorio encuentra SIN tilde (cabo C0658).
 *
 * DE DÓNDE SALE
 * guia-tipos-arroz y guia-frutas-exoticas (inspector 07/11/2026, hallazgo B de su spec): el
 * filtro hacía `nombre.toLowerCase().includes(busqueda.toLowerCase())`, así que «rambutan» no
 * encontraba el Rambután. Medido el 07/11/2026 en todas las app/guia-* con buscador
 * (.reparar-trabajo/medir-c0658.mjs de la copia de reparar): fallaban 19 más. Receta: las dos
 * partes de la comparación por `normalizarBusqueda` de lib/buscadorTablas (minúsculas y sin
 * diacríticos), solo en las líneas del filtro.
 *
 * QUÉ MIDE
 * Escribe la palabra sin tilde y exige que la ficha salga: la palabra (sin tildes) aparece en
 * la página más veces que con una búsqueda que no casa con nada. Lo estático (guía, FAQ) es
 * igual en las dos lecturas, así que la diferencia es la ficha que el buscador deja ver.
 * Control: con el filtro de antes, «niscalo» en guia-setas da lo mismo que «zzqxw».
 * Una guía nueva con buscador: su fila aquí.
 */

interface Fila {
  slug: string;
  /** Nombre de una ficha, tal como lo escribe la guía (con su tilde) */
  palabra: string;
}

const FILAS: Fila[] = [
  { slug: 'guia-aceite-oliva', palabra: 'Huévar' },
  { slug: 'guia-aves-comunes', palabra: 'Gorrión' },
  { slug: 'guia-cafe', palabra: 'Tarrazú' },
  { slug: 'guia-cortes-carne', palabra: 'Chuletón' },
  { slug: 'guia-especias', palabra: 'Pimentón' },
  { slug: 'guia-frutas-exoticas', palabra: 'Mangostán' },
  { slug: 'guia-frutos-secos', palabra: 'Piñón' },
  { slug: 'guia-hierbas-aromaticas', palabra: 'Orégano' },
  { slug: 'guia-insectos-jardin', palabra: 'Sírfido' },
  { slug: 'guia-maderas', palabra: 'Álamo' },
  { slug: 'guia-plantas-interior', palabra: 'Crotón' },
  { slug: 'guia-quesos', palabra: 'Idiazábal' },
  { slug: 'guia-razas-gatos', palabra: 'Común' },
  { slug: 'guia-setas', palabra: 'Níscalo' },
  { slug: 'guia-superalimentos', palabra: 'Arándanos' },
  { slug: 'guia-te', palabra: 'Clásico' },
  { slug: 'guia-tejidos-fibras', palabra: 'Algodón' },
  { slug: 'guia-tipos-arroz', palabra: 'Jazmín' },
  { slug: 'guia-tipos-pan', palabra: 'Bánh' },
  { slug: 'guia-varietales-vino', palabra: 'Mencía' },
  { slug: 'guia-vinagres-mundo', palabra: 'Balsámico' },
  // Fuera de las guías, el mismo filtro y la misma receta (hallazgo 4189, /reparar 07/11/2026)
  { slug: 'calculadora-caducidad', palabra: 'Plátano' },
];

const SELECTOR = 'input[type="search"], input[placeholder*="usca" i], input[aria-label*="usca" i]';
const sinTilde = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

async function apariciones(page: Page, consulta: string, objetivo: string): Promise<number> {
  const input = page.locator(SELECTOR).first();
  await input.fill(consulta);
  await expect(input).toHaveValue(consulta);
  // El filtro corre en el render: basta con que React haya repintado
  await page.waitForTimeout(300);
  const texto = sinTilde((await page.locator('body').innerText()).toLowerCase());
  return texto.split(objetivo).length - 1;
}

test.describe('guías-directorio · el buscador encuentra sin tilde (C0658)', () => {
  for (const f of FILAS) {
    test(`${f.slug}: «${sinTilde(f.palabra).toLowerCase()}» encuentra «${f.palabra}»`, async ({ page }) => {
      await page.goto(`/${f.slug}/`);
      const input = page.locator(SELECTOR).first();
      await expect(input).toBeVisible();
      await expect
        .poll(() => input.evaluate((i) => Object.keys(i).some((k) => k.startsWith('__reactProps$'))))
        .toBe(true);

      const objetivo = sinTilde(f.palabra.toLowerCase());
      const nada = await apariciones(page, 'zzqxw', objetivo);
      const conTilde = await apariciones(page, f.palabra.toLowerCase(), objetivo);
      const sinLaTilde = await apariciones(page, objetivo, objetivo);
      expect(conTilde, 'con tilde la ficha sale (si no, la fila no mide nada)').toBeGreaterThan(nada);
      expect(sinLaTilde, 'sin tilde sale lo mismo que con tilde').toBe(conTilde);
    });
  }
});
