import { test, expect, devices, Page, Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — calculadora-porciones (segmento interactiva, riesgo 2).
 *
 * Primera inspección: 11/11/2026.
 *
 * La app NO calcula: no tiene ni un campo de entrada. Es una guía estática del «método de la
 * mano» (6 tarjetas de método que se pueden marcar, 6 pestañas de categoría con 6 alimentos cada
 * una, un plato 50/25/25 y una guía educativa plegada). Lo que tiene verdad comprobable son sus
 * cifras de ración, y se cotejan con la fuente oficial española:
 *
 *   AESAN · Ministerio de Consumo, «Recomendaciones dietéticas saludables y sostenibles
 *   complementadas con recomendaciones de actividad física para la población española»,
 *   diciembre de 2022 (NIPO 069-22-008-2), leído el 11/11/2026 en
 *   https://www.aesan.gob.es/AECOSAN/docs/documentos/nutricion/RECOMENDACIONES_DIETETICAS.pdf
 *     p. 4  hortalizas 150-200 g («un plato llano de tamaño normal de ensalada variada») ·
 *           frutas 120-200 g («una pieza mediana … dos rodajas de melón o sandía») ·
 *           patatas 150-200 g
 *     p. 5  pan 40-60 g · pasta o arroz 60-80 g en seco
 *     p. 6  legumbres 50-60 g en seco o unos 170 g ya preparadas
 *     p. 7  frutos secos 20-30 g («1 puñado … 15-20 unidades de frutos pequeños como avellanas
 *           o almendras») · «Evita el consumo de frutos secos por niñas y niños menores de 5 años
 *           debido al riesgo de asfixia»
 *     p. 8  pescado 125-150 g
 *     p. 10 leche 200-250 ml · queso fresco 85-125 g · queso curado 40-60 g · yogur 125 g ·
 *           carne 100-125 g
 *     p. 11 aceite de oliva: «Una ración equivale a 10 ml. Ejemplo: 1 cucharada sopera»
 *     p. 17 plato saludable: «50 % de frutas y verduras, un 25 % de cereales integrales y un
 *           25 % de proteínas saludables»
 *
 * Los rangos de AESAN se apuntaron ANTES de leer la tabla de la app en el navegador. Un rango de
 * la app «dentro» de AESAN es el que cumple mínimo ≥ mínimo de AESAN y máximo ≤ máximo de AESAN.
 *
 * Contraste: WCAG 2.x, 4,5:1 para texto normal y 3:1 para texto grande (≥ 18,66 px en negrita).
 * Calculado a mano con la luminancia relativa, blanco sobre: #E74C3C 3,82 · #F39C12 2,19 ·
 * #27AE60 2,87 · #9B59B6 4,67 · #2E86AB 4,11 · #48A9A6 2,80.
 */

const RUTA = '/calculadora-porciones/';

test.use({ reducedMotion: 'reduce' });

async function abrir(page: Page, tema?: 'light' | 'dark'): Promise<void> {
  if (tema) await page.addInitScript((t) => window.localStorage.setItem('meskeia-theme', t), tema);
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
  if (tema) await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
}

const tarjeta = (page: Page, nombre: string): Locator =>
  page.locator('[class*="methodCard"]').filter({ hasText: nombre });
const detalle = (page: Page): Locator => page.getByRole('status').filter({ hasText: 'Equivale a:' });
const pestanas = (page: Page): Locator => page.locator('button[class*="categoryTab"]');
const fila = (page: Page, alimento: string): Locator =>
  page.locator('[class*="foodItem"]').filter({ hasText: alimento });

/** «80-100g» → [80, 100] · «125g» → [125, 125] · «200-250ml» → [200, 250] */
function rango(texto: string): [number, number] {
  const m = texto.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(?:g|ml)/);
  if (!m) throw new Error(`rango: no hay cantidad en «${texto}»`);
  const a = Number(m[1].replace(',', '.'));
  const b = m[2] ? Number(m[2].replace(',', '.')) : a;
  return [a, b];
}

interface Pregunta {
  name: string;
  acceptedAnswer: { text: string };
}
interface BloqueJsonLd {
  '@type'?: string;
  mainEntity?: Pregunta[];
  featureList?: string[];
}

async function jsonLd(page: Page, tipo: string): Promise<BloqueJsonLd> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  const bloque = textos.map((t) => JSON.parse(t) as BloqueJsonLd).find((b) => b['@type'] === tipo);
  if (!bloque) throw new Error(`No hay bloque JSON-LD «${tipo}»`);
  return bloque;
}

// ─────────────────────────────────────────────────────────────────────────────
// CASO 1 · normal: el método del puño y la tabla de grasas
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 1 · normal', () => {
  test('«Puño cerrado» abre su detalle con la misma equivalencia de la tarjeta y otro clic lo cierra', async ({ page }) => {
    await abrir(page);
    // La tarjeta dice «≈ 1 taza (240ml) o 150-200g»; el detalle repite esa equivalencia
    await tarjeta(page, 'Puño cerrado').click();
    await expect(detalle(page)).toContainText('Equivale a: ≈ 1 taza (240ml) o 150-200g');
    await expect(detalle(page)).toContainText('Usar para: Para carbohidratos y frutas');
    await tarjeta(page, 'Puño cerrado').click();
    await expect(detalle(page)).toHaveCount(0);
  });

  test('las pestañas llevan type="button" y aria-pressed, y solo una queda pulsada', async ({ page }) => {
    await abrir(page);
    await expect(pestanas(page)).toHaveCount(6);
    await page.getByRole('button', { name: 'Grasas' }).click();
    const pulsadas = await pestanas(page).evaluateAll((els) => els.map((e) => e.getAttribute('aria-pressed')));
    expect(pulsadas).toEqual(['false', 'false', 'false', 'false', 'true', 'false']);
    const sinType = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter((b) => !b.hasAttribute('type')).length);
    expect(sinType).toBe(0);
  });

  test('Grasas · frutos secos: 25-30 g y 15-20 almendras, dentro de AESAN (20-30 g; 15-20 unidades, p. 7)', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grasas' }).click();
    const f = fila(page, 'Frutos secos');
    await expect(f).toContainText('1 puñado');
    await expect(f).toContainText('15-20 almendras');
    const [a, b] = rango((await f.locator('[class*="foodGrams"]').textContent()) ?? '');
    expect(a).toBeGreaterThanOrEqual(20);
    expect(b).toBeLessThanOrEqual(30);
  });

  test('Grasas · aceite de oliva: 1 pulgar = 1 cucharada sopera, el ejemplo de la ración de AESAN (p. 11)', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Grasas' }).click();
    const f = fila(page, 'Aceite de oliva');
    await expect(f).toContainText('1 pulgar');
    await expect(f).toContainText('1 cucharada sopera');
    // La ración de AESAN (10 ml) cae dentro del rango que da la app
    const [a, b] = rango((await f.locator('[class*="foodGrams"]').textContent()) ?? '');
    expect(a).toBeLessThanOrEqual(10);
    expect(b).toBeGreaterThanOrEqual(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 2 · límite: cada ración de la tabla frente al rango de AESAN 2022
// ─────────────────────────────────────────────────────────────────────────────
interface Racion {
  categoria: string;
  alimento: string;
  aesan: [number, number];
  pagina: number;
  /** El rango de la app se sale del de AESAN (hallazgo abierto) */
  fuera?: string;
}

const RACIONES: Racion[] = [
  { categoria: 'Proteínas', alimento: 'Pechuga de pollo', aesan: [100, 125], pagina: 10 },
  { categoria: 'Proteínas', alimento: 'Filete de ternera', aesan: [100, 125], pagina: 10 },
  { categoria: 'Proteínas', alimento: 'Pescado (filete)', aesan: [125, 150], pagina: 8, fuera: 'la app da 100-150 g' },
  { categoria: 'Carbohidratos', alimento: 'Patata', aesan: [150, 200], pagina: 4 },
  { categoria: 'Carbohidratos', alimento: 'Pan', aesan: [40, 60], pagina: 5 },
  { categoria: 'Verduras', alimento: 'Ensalada de hojas', aesan: [150, 200], pagina: 4, fuera: 'la app da 80-100 g, la mitad' },
  { categoria: 'Verduras', alimento: 'Verduras cocidas', aesan: [150, 200], pagina: 4 },
  { categoria: 'Verduras', alimento: 'Verduras crudas', aesan: [150, 200], pagina: 4, fuera: 'la app da 100-150 g' },
  { categoria: 'Verduras', alimento: 'Brócoli/Coliflor', aesan: [150, 200], pagina: 4 },
  { categoria: 'Verduras', alimento: 'Zanahorias', aesan: [150, 200], pagina: 4, fuera: 'la app da 100-120 g' },
  { categoria: 'Verduras', alimento: 'Tomate', aesan: [150, 200], pagina: 4 },
  { categoria: 'Frutas', alimento: 'Manzana/Pera', aesan: [120, 200], pagina: 4 },
  { categoria: 'Frutas', alimento: 'Plátano', aesan: [120, 200], pagina: 4, fuera: 'la app da 100-120 g' },
  { categoria: 'Frutas', alimento: 'Frutos rojos', aesan: [120, 200], pagina: 4, fuera: 'la app da 100-150 g' },
  { categoria: 'Frutas', alimento: 'Uvas', aesan: [120, 200], pagina: 4, fuera: 'la app da 100-120 g' },
  { categoria: 'Frutas', alimento: 'Naranja', aesan: [120, 200], pagina: 4 },
  { categoria: 'Frutas', alimento: 'Sandía/Melón', aesan: [120, 200], pagina: 4, fuera: 'la app da 200-250 g («2 puños»)' },
  { categoria: 'Grasas', alimento: 'Queso curado', aesan: [40, 60], pagina: 10, fuera: 'la app da 30-40 g' },
  { categoria: 'Lácteos', alimento: 'Leche', aesan: [200, 250], pagina: 10 },
  { categoria: 'Lácteos', alimento: 'Yogur', aesan: [125, 125], pagina: 10 },
  { categoria: 'Lácteos', alimento: 'Queso fresco', aesan: [85, 125], pagina: 10, fuera: 'la app da 80-100 g' },
];

test.describe('Caso 2 · límite: raciones frente a AESAN 2022', () => {
  for (const r of RACIONES) {
    const titulo = `${r.categoria} · ${r.alimento}: dentro de ${r.aesan[0]}-${r.aesan[1]} (AESAN, p. ${r.pagina})`;
    const cuerpo = async ({ page }: { page: Page }): Promise<void> => {
      await abrir(page);
      await page.getByRole('button', { name: r.categoria }).click();
      const gramos = fila(page, r.alimento).locator('[class*="foodGrams"]');
      await expect(gramos).toHaveCount(1);
      const [a, b] = rango((await gramos.textContent()) ?? '');
      expect(a, `mínimo de la app frente a ${r.aesan[0]}`).toBeGreaterThanOrEqual(r.aesan[0]);
      expect(b, `máximo de la app frente a ${r.aesan[1]}`).toBeLessThanOrEqual(r.aesan[1]);
    };
    if (r.fuera) {
      // ABIERTO: ración sin fuente y fuera del rango de AESAN 2022 (hallazgo de datos) — ${r.fuera}
      test.fail(`${titulo} — ABIERTO: ${r.fuera}`, cuerpo);
    } else {
      test(titulo, cuerpo);
    }
  }

  // ABIERTO: el aviso dice «basada en recomendaciones nutricionales generales» sin nombrar
  // ninguna, y no hay DataReference. La reparación cita AESAN 2022.
  test.fail('la página cita la fuente de sus raciones (AESAN)', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    await expect(page.locator('body')).toContainText(/AESAN|Agencia Española de Seguridad Alimentaria/, { timeout: 2000 });
  });

  // ABIERTO: AESAN p. 7 avisa de no dar frutos secos a menores de 5 años (asfixia); la app da
  // «Frutos secos: 1 puñado» y en «Alimentación infantil» dice que la mano de los niños ajusta
  // sus porciones automáticamente, sin el aviso.
  test.fail('la página avisa de no dar frutos secos a menores de 5 años (AESAN, p. 7)', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    await expect(page.locator('body')).toContainText('Alimentación infantil');
    await expect(page.locator('body')).toContainText(/asfixia/i, { timeout: 2000 });
  });

  // ABIERTO: el plato dice «1 palma de carne, pescado o legumbres» y la tabla «Legumbres cocidas:
  // 1 puño (150-180g)»: dos medidas para el mismo alimento.
  test.fail('legumbres: el plato y la tabla dan la misma medida', async ({ page }) => {
    await abrir(page);
    const tablaPuno = await fila(page, 'Legumbres cocidas').locator('[class*="portionText"]').textContent();
    expect(tablaPuno).toBe('1 puño');
    await expect(page.locator('[class*="plateDescription"]')).not.toContainText('palma de carne, pescado o legumbres', { timeout: 2000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CASO 3 · lo que debe rechazarse o no puede quedarse fuera
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Caso 3 · teclado, promesa y FAQPage', () => {
  // ABIERTO: las tarjetas de método son <div onClick> sin role, tabindex ni aria-pressed: el
  // teclado no las alcanza y el lector no las anuncia como conmutador.
  test.fail('las tarjetas de método se alcanzan con Tab y se abren con Enter', async ({ page }) => {
    await abrir(page);
    let enTarjeta = false;
    for (let i = 0; i < 30 && !enTarjeta; i++) {
      await page.keyboard.press('Tab');
      enTarjeta = await page.evaluate(() => Boolean(document.activeElement?.closest('[class*="methodCard"]')));
    }
    expect(enTarjeta, 'ninguna tarjeta recibe el foco en 30 tabulaciones').toBe(true);
    await page.keyboard.press('Enter');
    await expect(detalle(page)).toBeVisible({ timeout: 2000 });
  });

  test('la app no tiene ningún campo de entrada: no calcula nada', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('h1')).toContainText('Calculadora de Porciones');
    await expect(page.locator('input, select, textarea')).toHaveCount(0);
  });

  // ABIERTO: la tarjeta de relacionadas de las apps de cocina anuncia «Ajusta recetas» y la app
  // no ajusta recetas (ni tiene un campo donde escribirlas).
  test.fail('la tarjeta de relacionadas de lista-compras no promete «Ajusta recetas»', async ({ page }) => {
    await page.goto('/lista-compras/');
    await esperarPaginaAsentada(page);
    const enlace = page.locator('a[href^="/calculadora-porciones/"]').first();
    await expect(enlace).toContainText('Porciones');
    await expect(enlace).not.toContainText('Ajusta recetas', { timeout: 2000 });
  });

  // ABIERTO: el FAQPage dice que «la punta del pulgar equivale a una cucharadita de aceite o
  // mantequilla» y «1-2 pulgares de grasas saludables por comida»; la página da «Pulgar ≈ 1
  // cucharada (15ml/15g)», «Aceite de oliva: 1 pulgar, 10-15ml, 1 cucharada sopera» y en el
  // plato «+ Grasa: 1 pulgar». AESAN (p. 11): ración de aceite 10 ml, 1 cucharada sopera.
  test.fail('FAQPage: la grasa de cada comida es la de la página (1 pulgar = 1 cucharada)', async ({ page }) => {
    await abrir(page);
    const faq = await jsonLd(page, 'FAQPage');
    const texto = (faq.mainEntity ?? []).map((p) => p.acceptedAnswer.text).join(' ');
    expect(texto).not.toMatch(/punta del pulgar equivale a una cucharadita de aceite/);
    expect(texto).not.toMatch(/1-2 pulgares/);
  });

  // ABIERTO: featureList habla de «Cuatro métodos … cupped hand (grasas)»; la página enseña seis
  // métodos, el puñado es para frutos secos y las grasas van con el pulgar; dice cuatro grupos y
  // hay seis, y el último punto repite el segundo.
  test.fail('features describe lo que hace la app (seis métodos, seis categorías)', async ({ page }) => {
    await abrir(page);
    const app = await jsonLd(page, 'WebApplication');
    const lista = app.featureList ?? [];
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(lista.length).toBeLessThanOrEqual(8);
    expect(lista.join(' ')).not.toMatch(/Cuatro métodos|cupped hand/);
  });

  // ABIERTO: «referencia personalizada perfecta» frente a su propia tabla («Mano (visual) ±20–30%»)
  // y al FAQPage («No son medidas exactas en gramos»).
  test.fail('la portada no llama «perfecta» a una referencia que la propia app da por ±20–30 %', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('body')).not.toContainText('referencia personalizada perfecta', { timeout: 2000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contraste, modo oscuro, formato y emojis
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIAS: { nombre: string; esperado: number }[] = [
  { nombre: 'Proteínas', esperado: 3.82 },
  { nombre: 'Carbohidratos', esperado: 2.19 },
  { nombre: 'Verduras', esperado: 2.87 },
  { nombre: 'Frutas', esperado: 4.67 },
  { nombre: 'Grasas', esperado: 4.11 },
  { nombre: 'Lácteos', esperado: 2.8 },
];

test.describe('Contraste del texto blanco sobre el color de cada categoría', () => {
  for (const c of CATEGORIAS) {
    const titulo = `${c.nombre}: pestaña activa y cabecera de la tabla ≥ 4,5:1 (blanco sobre su color: ${String(c.esperado).replace('.', ',')}:1)`;
    const cuerpo = async ({ page }: { page: Page }): Promise<void> => {
      await abrir(page);
      const boton = page.getByRole('button', { name: c.nombre });
      await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
      const nombrePestana = boton.locator('[class*="categoryName"]');
      const cabecera = page.locator('[class*="tableHeader"] span').first();
      await expect(cabecera).toContainText(c.nombre);
      await expect.poll(() => contrasteSobreFondoReal(nombrePestana), { timeout: 3000 }).toBeGreaterThanOrEqual(4.5);
      await expect.poll(() => contrasteSobreFondoReal(cabecera), { timeout: 3000 }).toBeGreaterThanOrEqual(4.5);
    };
    if (c.esperado < 4.5) {
      // ABIERTO: blanco sobre el color de la categoría por debajo de 4,5:1
      test.fail(`${titulo} — ABIERTO`, cuerpo);
    } else {
      test(titulo, cuerpo);
    }
  }

  // ABIERTO: rótulos de 12 px en blanco (opacidad 0,9) sobre verde 2,87, rojo 3,82 y naranja 2,19;
  // y «50%»/«25%» (19,2 px negrita, texto grande, 3:1) sobre verde y naranja.
  test.fail('plato: rótulos ≥ 4,5:1 y porcentajes ≥ 3:1', async ({ page }) => {
    await abrir(page);
    const sectores = page.locator('[class*="plateHalf"], [class*="plateQuarter"]');
    await expect(sectores).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect.poll(() => contrasteSobreFondoReal(sectores.nth(i).locator('small')), { timeout: 2000 }).toBeGreaterThanOrEqual(4.5);
      await expect.poll(() => contrasteSobreFondoReal(sectores.nth(i).locator('p')), { timeout: 2000 }).toBeGreaterThanOrEqual(3);
    }
  });
});

test.describe('Modo oscuro', () => {
  test('tema claro: las pestañas inactivas se leen (≥ 4,5:1)', async ({ page }) => {
    await abrir(page, 'light');
    for (const nombre of ['Carbohidratos', 'Verduras', 'Frutas', 'Grasas', 'Lácteos']) {
      const n = page.getByRole('button', { name: nombre }).locator('[class*="categoryName"]');
      await expect.poll(() => contrasteSobreFondoReal(n), { timeout: 3000 }).toBeGreaterThanOrEqual(4.5);
    }
  });

  // .categoryTab no fija `color`: el texto es el del navegador, y lo salva el `color-scheme: dark`
  // que pone el tema (blanco sobre rgb 45,45,45). Poner a mano solo `data-theme="dark"`, sin
  // color-scheme, lo deja negro (1,52:1): ese escenario no existe en la app, por eso este test
  // carga el tema por localStorage, como el botón.
  test('tema oscuro: las pestañas inactivas se leen (≥ 4,5:1)', async ({ page }) => {
    await abrir(page, 'dark');
    for (const nombre of ['Carbohidratos', 'Verduras', 'Frutas', 'Grasas', 'Lácteos']) {
      const n = page.getByRole('button', { name: nombre }).locator('[class*="categoryName"]');
      await expect.poll(() => contrasteSobreFondoReal(n), { timeout: 2000, message: nombre }).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe('Plato, formato y emojis', () => {
  // ABIERTO: el círculo (overflow hidden, border-radius 50 %) recorta «Proteína» («teína») y
  // «Carbos» («Carb»): sus esquinas inferiores caen fuera del círculo.
  test.fail('plato: los tres rótulos caben enteros dentro del círculo', async ({ page }) => {
    await abrir(page);
    const fuera = await page.locator('[class*="plateCircle"] small').evaluateAll((els) =>
      els
        .map((s) => {
          const c = (s.closest('[class*="plateCircle"]') as HTMLElement).getBoundingClientRect();
          const r = s.getBoundingClientRect();
          const cx = c.left + c.width / 2;
          const cy = c.top + c.height / 2;
          const radio = c.width / 2 - 4; // 4 px de borde
          const dentro = (x: number, y: number): boolean => Math.hypot(x - cx, y - cy) <= radio;
          const ok = [dentro(r.left, r.top), dentro(r.right, r.top), dentro(r.left, r.bottom), dentro(r.right, r.bottom)].every(Boolean);
          return ok ? null : s.textContent;
        })
        .filter((t): t is string => t !== null),
    );
    expect(fuera).toEqual([]);
  });

  // ABIERTO: «50%», «25%», «±20–30%»… pegan el % (formato español: «50 %» con espacio duro).
  test.fail('plato: el porcentaje va con espacio duro («50 %»)', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('[class*="plateHalf"] p')).toHaveText('50 %', { timeout: 2000 });
  });

  // ABIERTO: la cabecera de la tabla pinta «🥩 Proteínas» en un solo nodo; el plato (🥗 🍗 🍚 🫒)
  // y las situaciones de uso (📉 🎉 👶 🏋️) llevan el emoji en un span sin aria-hidden.
  test.fail('los emojis junto a texto llevan aria-hidden', async ({ page }) => {
    await abrir(page);
    await expect(page.locator('[class*="tableHeader"] [aria-hidden="true"]')).toHaveCount(1, { timeout: 2000 });
    const sinOcultar = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[class*="plateCircle"] span, [class*="plateFat"] span, [class*="escenarioIcon"]')).filter(
        (e) => e.getAttribute('aria-hidden') !== 'true',
      ).length,
    );
    expect(sinOcultar).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Móvil (Pixel 7)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Móvil (Pixel 7)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  // ABIERTO: por debajo de 600 px `.categoryName { display: none }` y el icono es aria-hidden:
  // los seis botones se quedan sin nombre accesible («botón, pulsado»).
  test.fail('las seis pestañas conservan su nombre accesible', async ({ page }) => {
    await abrir(page);
    for (const c of CATEGORIAS) {
      await expect(page.getByRole('button', { name: c.nombre })).toHaveCount(1, { timeout: 1500 });
    }
  });

  // ABIERTO: el detalle se pinta debajo de las seis tarjetas (y ≈ 1.278 px con 839 px de pantalla)
  // y la página no se desplaza.
  test.fail('tras tocar «Puño cerrado», el detalle queda a la vista', async ({ page }) => {
    await abrir(page);
    await tarjeta(page, 'Puño cerrado').tap();
    await expect(detalle(page)).toBeVisible();
    await expect(detalle(page)).toBeInViewport({ timeout: 2000 });
  });

  test('tras tocar la pestaña de grasas, su tabla queda a la vista', async ({ page }) => {
    await abrir(page);
    await pestanas(page).nth(4).tap();
    const cabecera = page.locator('[class*="tableHeader"]');
    await expect(cabecera).toContainText('Grasas');
    await expect(cabecera).toBeInViewport();
  });
});
