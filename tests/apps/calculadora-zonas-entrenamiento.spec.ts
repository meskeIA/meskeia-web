import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { selectorDelModulo } from './_modulo-css';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — calculadora-zonas-entrenamiento (segmento CÁLCULO, riesgo 2: salud y ejercicio)
 *
 * Primera inspección: 15/11/2026.
 *
 * QUÉ PROMETE
 *   <h1>: «❤️ Zonas de Entrenamiento» · subtítulo «Calcula tus 5 zonas de frecuencia cardíaca y
 *   entrena con precisión» · metadata: 5 zonas por edad y FC en reposo, «Fórmula simple
 *   (220−edad) y fórmula de Karvonen».
 *
 * QUÉ HACE DE VERDAD (page.tsx L91-108, sin motor aparte)
 *   FCmáx = 220 − edad (Fox, la única estimación que calcula; Tanaka y «Gulati» solo se citan)
 *   Simple:   límite = Math.round(p/100 · FCmáx)
 *   Karvonen: límite = Math.round(FCrep + p/100 · (FCmáx − FCrep))
 *   p = 50 · 60 · 70 · 80 · 90 · 100; cada zona va de su p mínimo a su p máximo, así que el
 *   límite superior de una zona es EL MISMO número que el inferior de la siguiente.
 *   Campos (CampoNumerico): edad 15-80, FC reposo 40-100, enteros. Por encima del máximo se topa
 *   en el acto; por debajo del mínimo se aplica el mínimo, se marca aria-invalid mientras se
 *   teclea y al salir el campo enseña el valor usado. Con esos rangos la FC de reposo (≤ 100)
 *   nunca alcanza la FCmáx (≥ 140): no hay caso «reposo ≥ máxima» que rechazar.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 * (redondeo: mitad hacia arriba, que es lo que pretende Math.round; comprobados además con
 *  aritmética entera en .inspector-trabajo/esperados-zonas.mjs)
 *
 *   CASO 1 (normal) — 40 años, FC reposo 60
 *     FCmáx = 220 − 40 = 180
 *     Simple:   0,5·180 = 90 · 0,6·180 = 108 · 0,7·180 = 126 · 0,8·180 = 144 · 0,9·180 = 162 · 180
 *               → Z1 90–108 · Z2 108–126 · Z3 126–144 · Z4 144–162 · Z5 162–180
 *     Karvonen: FCR = 180 − 60 = 120 → 60 + 60 = 120 · 60 + 72 = 132 · 60 + 84 = 144 ·
 *               60 + 96 = 156 · 60 + 108 = 168 · 180
 *               → Z1 120–132 · Z2 132–144 · Z3 144–156 · Z4 156–168 · Z5 168–180
 *               y la nota «60 + % × 120»
 *
 *   CASO 2 (límite) — los extremos que admiten los campos
 *     80 años, reposo 100, Karvonen: FCmáx 140, FCR 40 → 120 · 124 · 128 · 132 · 136 · 140
 *     15 años, reposo 40, Karvonen:  FCmáx 205, FCR 165 → 40 + 82,5 = 122,5 → 123 ·
 *               40 + 99 = 139 · 40 + 115,5 = 155,5 → 156 · 40 + 132 = 172 ·
 *               40 + 148,5 = 188,5 → 189 · 205
 *     15 años, simple: 102,5 → 103 · 123 · 143,5 → 144 · 164 · 184,5 → 185 · 205
 *     45 años, simple: FCmáx 175 → 87,5 → 88 · 105 · 122,5 → 123 · 140 · 157,5 → 158 · 175
 *     55 años, simple: FCmáx 165 → 82,5 → 83 · 99 · 115,5 → 116 · 132 · 148,5 → 149 · 165
 *
 *   CASO 3 (rechazo) — lo que no es una edad o una FC válida
 *     edad «0» → el campo se marca aria-invalid; al calcular se usa 15 y se ENSEÑA (campo «15»,
 *       «Fórmula: 220 − 15 años», FCmáx 205). No hay mensaje propio, pero el valor usado está a
 *       la vista: es el comportamiento documentado de CampoNumerico, no un hallazgo.
 *     edad «200» → topada a 80 en el acto (FCmáx 140) · «12abc» → las letras no entran
 *     FC reposo «150» → topada a 100 en el acto
 *
 * RESULTADO: los tres casos cuadran con la app salvo el redondeo del 70 % a los 45 y 55 años
 * (HALLAZGO 1). Las zonas comparten su límite (HALLAZGO 2).
 *
 * HALLAZGOS (15/11/2026) — los doce REPARADOS el mismo día por /reparar (hallazgos 4794-4805).
 * Desde el 2 cada zona empieza un latido después del límite de la anterior, así que los casos
 * 1-3 de arriba llevan ya los mínimos con +1. El 4 se resolvió retirando la fórmula mal
 * atribuida (la fuente de Gulati no se pudo consultar en la sesión).
 *   1. 0,7 en coma flotante: a los 45 años el 70 % de 175 (122,5) sale 122, y a los 55 el de 165
 *      (115,5) sale 115, mientras a los 35 el 70 % de 185 (129,5) sí sube a 130.
 *   2. El límite superior de cada zona es el inferior de la siguiente: 108 ppm está en Z1 y en Z2.
 *   3. La guía dice que con FC de reposo baja (atleta) salen zonas MÁS ALTAS; la propia app da
 *      zonas más bajas (Karvonen sube con la FC de reposo).
 *   4. «211 − 0,64 × edad (Gulati, mujeres)»: la de Gulati para mujeres es 206 − 0,88 × edad;
 *      211 − 0,64 × edad es la de Nes y cols. (HUNT), para ambos sexos.
 *   5. «Subestima la FCmáx en personas muy entrenadas y la sobreestima en sedentarios»: Tanaka
 *      (2001), que la app cita, atribuye el sesgo a la edad, no al entrenamiento.
 *   6. Ningún aviso para quien toma medicación que baja la frecuencia cardíaca (betabloqueantes)
 *      o tiene una cardiopatía.
 *   7. El FAQPage dice que la FC de reposo de un sedentario ronda 60-80 ppm; la página, 80–100.
 *   8. features del jsonLd: «Tabla de aplicación por objetivo: pérdida de peso, resistencia,
 *      rendimiento», y no hay tal tabla.
 *   9. Neutralidad (§1.quinquies, puntos 2 y 3): «ha demostrado ser más eficaz» (polarizado) y
 *      entrenar sin pulsómetro de pecho presentado como «error».
 *  10. El % pegado al número («50–60%»).
 *  11. Contraste: texto blanco sobre el color de cada zona (2,2-3,8:1) y la cifra de la zona en
 *      su color sobre blanco (2,2-3,0:1 en Z1-Z4).
 *  12. Los deslizadores llevan aria-hidden pero siguen en el orden de tabulación, y el resultado
 *      aparece sin anunciarse ni recibir el foco.
 */

const RUTA = '/calculadora-zonas-entrenamiento/';
const CIFRA_ZONA = /^\d+ – \d+ ppm$/;

async function escribir(page: Page, selector: string, texto: string, esperadoEnCampo = texto) {
  const campo = page.locator(selector);
  await campo.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(texto);
  await esperarValorEnReact(page, selector, esperadoEnCampo);
}

async function elegirMetodo(page: Page, metodo: 'simple' | 'karvonen') {
  const nombre = metodo === 'karvonen' ? /Fórmula de Karvonen/ : /Fórmula simple/;
  const boton = page.getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function calcular(page: Page) {
  await page.getByRole('button', { name: /Calcular mis zonas/ }).click();
  await expect(page.getByText('Tu FCmáx estimada')).toBeVisible();
}

/** Las cinco zonas como pares [mínimo, máximo], en el orden de la pantalla. */
async function leerZonas(page: Page): Promise<[number, number][]> {
  const cifras = page.getByText(CIFRA_ZONA);
  await expect(cifras).toHaveCount(5);
  const textos = await cifras.allTextContents();
  return textos.map((t) => {
    const [a, b] = t.match(/\d+/g)!.map(Number);
    return [a, b] as [number, number];
  });
}

async function calcularZonas(page: Page, edad: string, reposo: string, metodo: 'simple' | 'karvonen') {
  await escribir(page, '#edad', edad);
  await escribir(page, '#fcrep', reposo);
  await elegirMetodo(page, metodo);
  await calcular(page);
  return leerZonas(page);
}

/**
 * El texto de la app (calculadora, aviso y guía, también plegada), sin los <script> del body ni
 * las relacionadas o el pie: un «medicamento» en la ficha de otra app no debe aprobar el caso 6.
 */
async function textoDePagina(page: Page): Promise<string> {
  const principal = page.locator('main', { has: page.getByRole('button', { name: /Calcular mis zonas/ }) }).last();
  return (await principal.textContent()) ?? '';
}

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
  return bloques.map((b) => JSON.parse(b) as Record<string, unknown>);
}

test.describe('calculadora-zonas-entrenamiento — FCmáx, zonas y contenido', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#edad', '#fcrep']);
  });

  test('CASO 1 (normal) — 40 años y reposo 60: fórmula simple y Karvonen', async ({ page }) => {
    const simple = await calcularZonas(page, '40', '60', 'simple');
    await expect(page.getByText('180 ppm', { exact: true })).toBeVisible();
    await expect(page.getByText(/^Fórmula: 220 − 40 años$/)).toBeVisible();
    // Desde el hallazgo 4795 cada zona empieza un latido después del límite de la anterior
    expect(simple).toEqual([[90, 108], [109, 126], [127, 144], [145, 162], [163, 180]]);

    await elegirMetodo(page, 'karvonen');
    await calcular(page);
    expect(await leerZonas(page)).toEqual([[120, 132], [133, 144], [145, 156], [157, 168], [169, 180]]);
    await expect(page.getByText(/= 60 \+ % × 120$/)).toBeVisible();
  });

  test('CASO 2 (límite) — 80 años con reposo 100 y 15 años con reposo 40', async ({ page }) => {
    expect(await calcularZonas(page, '80', '100', 'karvonen')).toEqual([
      [120, 124], [125, 128], [129, 132], [133, 136], [137, 140],
    ]);
    await expect(page.getByText('140 ppm', { exact: true })).toBeVisible();

    // 122,5 · 155,5 · 188,5: las medias suben
    expect(await calcularZonas(page, '15', '40', 'karvonen')).toEqual([
      [123, 139], [140, 156], [157, 172], [173, 189], [190, 205],
    ]);
    await elegirMetodo(page, 'simple');
    await calcular(page);
    // 102,5 · 143,5 · 184,5
    expect(await leerZonas(page)).toEqual([[103, 123], [124, 144], [145, 164], [165, 185], [186, 205]]);
  });

  test('CASO 3 (rechazo) — edad 0, edad 200, letras y FC de reposo 150', async ({ page }) => {
    // Edad 0: aria-invalid mientras se teclea; al calcular se usa 15 y se ENSEÑA
    await escribir(page, '#edad', '0');
    await expect(page.locator('#edad')).toHaveAttribute('aria-invalid', 'true');
    await calcular(page);
    await expect(page.locator('#edad')).toHaveValue('15');
    await expect(page.getByText(/^Fórmula: 220 − 15 años$/)).toBeVisible();
    await expect(page.getByText('205 ppm', { exact: true })).toBeVisible();

    // Edad 200: se topa a 80 en el acto
    await escribir(page, '#edad', '200', '80');
    await calcular(page);
    await expect(page.getByText('140 ppm', { exact: true })).toBeVisible();

    // Letras: no entran (queda «12», que se aplica como 15)
    await escribir(page, '#edad', '12abc', '12');
    await calcular(page);
    await expect(page.locator('#edad')).toHaveValue('15');

    // FC de reposo 150: se topa a 100
    await escribir(page, '#edad', '40');
    await escribir(page, '#fcrep', '150', '100');
    await elegirMetodo(page, 'karvonen');
    await calcular(page);
    await expect(page.getByText(/= 100 \+ % × 80$/)).toBeVisible();
    expect(await leerZonas(page)).toEqual([[140, 148], [149, 156], [157, 164], [165, 172], [173, 180]]);
  });

  test('aviso médico de nivel 2 visible al cargar, fuera de la guía plegada', async ({ page }) => {
    const titulo = page.getByText('Aviso Médico Importante');
    await expect(titulo).toBeVisible();
    await expect(page.getByText(/no constituye diagnóstico médico/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Ver guía educativa/ })).toHaveAttribute('aria-expanded', 'false');
  });

  test('HALLAZGO 1 (4794, REPARADO 15/11/2026) — el 70 % de 175 (122,5) sube a 123 y el de 165 (115,5) a 116', async ({ page }) => {
    // (70/100)·175 = 122,49999999999999 en coma flotante → Math.round daba 122. Ahora se calcula
    // 70·175/100 = 122,5 exacto, que sube como sube a los 35 años el 70 % de 185 (129,5 → 130).
    const z45 = await calcularZonas(page, '45', '60', 'simple');
    expect(z45[2][0]).toBeGreaterThanOrEqual(123);
    expect(z45[1][1]).toBeLessThanOrEqual(123);
    expect(z45).toEqual([[88, 105], [106, 123], [124, 140], [141, 158], [159, 175]]);
    const z55 = await calcularZonas(page, '55', '60', 'simple');
    expect(z55[2][0]).toBeGreaterThanOrEqual(116);
    expect(z55).toEqual([[83, 99], [100, 116], [117, 132], [133, 149], [150, 165]]);
  });

  test('HALLAZGO 2 (4795, REPARADO 15/11/2026) — ningún límite está en dos zonas (Z2 empieza en 109)', async ({ page }) => {
    const zonas = await calcularZonas(page, '40', '60', 'simple');
    for (let i = 1; i < zonas.length; i++) {
      expect(zonas[i][0] - zonas[i - 1][1], `Z${i + 1} empieza un lpm después de donde acaba Z${i}`).toBe(1);
    }
  });

  test('HALLAZGO 3 (4796, REPARADO 15/11/2026) — la guía ya no dice que la FC de reposo baja da zonas más altas', async ({ page }) => {
    // Karvonen: límite = p·FCmáx + (1 − p)·FCrep, que CRECE con la FC de reposo.
    const atleta = await calcularZonas(page, '40', '45', 'karvonen');
    expect(atleta[1]).toEqual([127, 140]); // 45 + 0,6·135 = 126 (+1, empieza tras Z1) · 45 + 94,5 → 140
    const sedentario = await calcularZonas(page, '40', '75', 'karvonen');
    expect(sedentario[1]).toEqual([139, 149]); // 75 + 0,6·105 = 138 (+1) · 75 + 73,5 → 149
    const texto = await textoDePagina(page);
    const afirma = /FC reposo baja \(atleta\) obtendrá zonas más altas/.test(texto);
    expect(!afirma || atleta[1][0] > sedentario[1][0], 'la guía afirma lo contrario de lo que calcula').toBe(true);
    expect(texto).toContain('quien tiene la FC en reposo más baja obtiene zonas algo más bajas');
  });

  test('HALLAZGO 4 (4797, REPARADO 15/11/2026) — ya no atribuye «211 − 0,64 × edad» a Gulati', async ({ page }) => {
    // No se pudo cotejar la fuente en la sesión: se retira la fórmula mal atribuida y queda Tanaka.
    const texto = await textoDePagina(page);
    expect(texto).not.toMatch(/211\s*−\s*0,64\s*×\s*edad\s*\(Gulati/);
    expect(texto).toContain('Alternativa más precisa: FCmáx = 208 − 0,7 × edad (Tanaka, 2001)');
  });

  test('HALLAZGO 5 (4798, REPARADO 15/11/2026) — el sesgo de 220 − edad se atribuye a la edad, con su origen', async ({ page }) => {
    const texto = await textoDePagina(page);
    expect(texto).not.toMatch(/Subestima la FCmáx en personas muy entrenadas y la sobreestima en sedentarios/);
    expect(texto).toContain('Su error depende sobre todo de la edad');
    expect(texto).toContain('Fox, Naughton y Haskell');
  });

  test('HALLAZGO 6 (4799, REPARADO 15/11/2026) — aviso visible para quien toma betabloqueantes o tiene una cardiopatía', async ({ page }) => {
    expect(await textoDePagina(page)).toMatch(/betabloque|medicaci[oó]n|medicamento|f[aá]rmaco/i);
    // Fuera de la guía plegada: visible al cargar
    await expect(page.getByRole('note').filter({ hasText: 'betabloqueantes' })).toBeVisible();
  });

  test('HALLAZGO 7 (4800, REPARADO 15/11/2026) — la misma FC de reposo en el FAQPage y en la página', async ({ page }) => {
    const faq = JSON.stringify((await jsonLd(page)).find((b) => b['@type'] === 'FAQPage'));
    const texto = await textoDePagina(page);
    expect(faq).toContain('En la mayoría de adultos la FCr está entre 60 y 80 ppm');
    expect(texto).toContain('En la mayoría de adultos: 60–80 ppm');
    expect(faq).not.toMatch(/sedentarios ronda/);
    expect(texto).not.toMatch(/Sedentario: 80–100/);
  });

  test('HALLAZGO 8 (4801, REPARADO 15/11/2026) — features ya no promete una tabla por objetivo con «pérdida de peso»', async ({ page }) => {
    const app = (await jsonLd(page)).find((b) => b['@type'] === 'WebApplication');
    const features = JSON.stringify(app?.featureList ?? app?.features ?? '');
    const tablas = (await page.locator('table').allTextContents()).join(' ');
    expect(!/pérdida de peso/.test(features) || /pérdida de peso/i.test(tablas)).toBe(true);
    expect(features).toContain('Tabla resumen de las 5 zonas con sensación y objetivo');
  });

  test('HALLAZGO 9 (4802, REPARADO 15/11/2026) — sin «ha demostrado» y sin el pulsómetro de pecho como obligación', async ({ page }) => {
    const texto = await textoDePagina(page);
    expect(texto).not.toMatch(/ha demostrado ser más eficaz/);
    expect(texto).not.toMatch(/Confiar solo en la sensación sin pulsómetro/);
    expect(texto).toContain('varios autores proponen una distribución polarizada');
  });

  test('HALLAZGO 10 (4803, REPARADO 15/11/2026) — el % va separado del número, también en la guía y el FAQPage', async ({ page }) => {
    expect(await textoDePagina(page)).not.toMatch(/\d%/);
    expect(JSON.stringify((await jsonLd(page)).find((b) => b['@type'] === 'FAQPage'))).not.toMatch(/\d%/);
    await calcularZonas(page, '40', '60', 'simple');
    const mod = await selectorDelModulo(page.getByText('Recuperación Activa', { exact: true }), 'zonaNombre');
    const porcentajes = await page.locator(`${mod}[class$="_zonaPct"]`).allTextContents();
    expect(porcentajes).toHaveLength(5);
    for (const p of porcentajes) expect(p).toMatch(/^\d+–\d+ %$/);
  });

  test('HALLAZGO 11 (4804, REPARADO 15/11/2026) — contraste de la cabecera y de la cifra de cada zona (tema claro)', async ({ page }) => {
    await calcularZonas(page, '40', '60', 'simple');
    const nombres = ['Recuperación Activa', 'Resistencia Base', 'Aeróbico Medio', 'Umbral Anaeróbico', 'Máximo / VO₂max'];
    const cifras = page.getByText(CIFRA_ZONA);
    const medidas: string[] = [];
    let peor = Infinity;
    for (let i = 0; i < 5; i++) {
      // Nombre: 14,4 px en negrita, blanco sobre el color de la zona → 4,5:1
      const cab = await contrasteSobreFondoReal(page.getByText(nombres[i], { exact: true }));
      // Cifra: 22,4 px en negrita (texto grande) en el color de la zona → 3:1
      const cif = await contrasteSobreFondoReal(cifras.nth(i));
      medidas.push(`Z${i + 1} cabecera ${cab.toFixed(2)} · cifra ${cif.toFixed(2)}`);
      peor = Math.min(peor, cab / 4.5, cif / 3);
    }
    expect(peor, medidas.join(' | ')).toBeGreaterThanOrEqual(1);
  });

  test('HALLAZGO 12 (4805, REPARADO 15/11/2026) — deslizadores fuera del tabulador; el foco va al resultado', async ({ page }) => {
    const deslizadores = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input[type="range"]')).map((r) => ({
        ariaHidden: r.getAttribute('aria-hidden'),
        tabIndex: (r as HTMLInputElement).tabIndex,
      })),
    );
    expect(deslizadores).toHaveLength(2);
    for (const d of deslizadores) {
      expect(d.ariaHidden !== 'true' || d.tabIndex < 0, 'aria-hidden en un control enfocable').toBe(true);
    }
    await calcularZonas(page, '40', '60', 'simple');
    // Se sube desde el resultado solo hasta el bloque que ya contiene el botón «Calcular»: más
    // arriba, «contiene el foco» sería cierto por el propio botón.
    const anunciado = await page.getByText('Tu FCmáx estimada').evaluate((el) => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) => /Calcular mis zonas/.test(b.textContent ?? ''));
      for (let n: Element | null = el; n && !(boton && n.contains(boton)); n = n.parentElement) {
        if (n.getAttribute('aria-live') || n.getAttribute('role') === 'status') return true;
        if (n.contains(document.activeElement)) return true;
      }
      return false;
    });
    expect(anunciado, 'el resultado aparece sin región viva y sin mover el foco').toBe(true);
  });
});
