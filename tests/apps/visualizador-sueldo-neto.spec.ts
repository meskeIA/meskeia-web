import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValorAcotado } from './_hidratacion';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

/**
 * visualizador-sueldo-neto — regresión del mínimo personal (art. 63.1.2.º LIRPF)
 * Escrita el 12/09/2026, tras reparar el defecto.
 *
 * QUÉ DEFECTO VIGILA
 * ──────────────────
 * La app calculaba `baseGravable = baseImponible − minimoPersonal` y aplicaba la escala a ese
 * resto, que valora el mínimo al tipo marginal. El art. 63.1.2.º dice que el mínimo no reduce
 * la renta: forma parte de la base liquidable general y se grava a TIPO CERO, aplicando la
 * escala a la base COMPLETA y restando de la cuota la misma escala aplicada al mínimo.
 * Subestimaba la cuota en 610,50 €/año con 30.000 € de bruto y en 1.443 € desde 80.000 €.
 *
 * Norma verificada en sesión el 12/09/2026 contra la AEAT (manual de ayuda de Renta 2025,
 * «8.4.3.1 Cuota íntegra estatal» y «8.4.3.2 Cuota íntegra autonómica»).
 *
 * El caso se resolvió a mano ANTES de ejecutar la app; la aritmética va en el test.
 *
 * SEGUNDO DEFECTO, REPARADO EL MISMO DÍA — el tope de la base de cotización
 * ────────────────────────────────────────────────────────────────────────
 * `calcularSueldo` usaba `pagas = 14` también para la Seguridad Social: base mensual =
 * bruto/14, y luego multiplicaba por 14. Mientras la base no llega al tope da lo mismo que
 * dividir entre 12 —bruto/14 × 14 es bruto—, y por eso el defecto estuvo invisible; por
 * ENCIMA del tope, no. La app topaba la cotización en 71.416,80 € de bruto en vez de en
 * 61.214,40 €, y cobraba hasta 663,16 €/año de más: con 150.000 € publicaba 4.642,09 € donde
 * el tope de 5.101,20 €/mes sobre doce liquidaciones da 3.978,94 €. Como esa SS de más
 * rebajaba además la base del IRPF, el neto publicado salía unos 365 €/año por debajo del real.
 *
 * La norma se verificó en sesión el 12/09/2026 en la Seguridad Social («Bases y tipos de
 * cotización», art. 147 LGSS): la base mensual incluye «la parte proporcional de las pagas
 * extraordinarias», la liquidación es MENSUAL —doce al año— y los topes (1.424,40 € /
 * 5.101,20 € en 2026) se aplican a esa base mensual. No hay lectura en la que dividir entre
 * 14 sea correcto: la prorrata entra en la base tanto si las extras se pagan aparte como si no.
 *
 * Era el único sitio del catálogo que dividía entre 14. El barrido de los doce consumidores de
 * `BASES_SS_2026` dejó ver que `estimador-sueldo-neto`, `simulador-desglose-nomina`,
 * `estimador-smi`, `estimador-irpf` y `lib/calculadoras/sueldoNeto.ts` ya usaban 12, y que
 * `bajaMedica`, `costeEmpleado` y `simulador-jubilacion-publica` reciben ya un salario mensual
 * y no dividen nada. Un valor atípico, no una política.
 *
 * ⚠️ El bruto es un `input[type=range]` controlado por React: ni `fill()` ni asignar el valor
 * disparan su `onChange`, así que el slider se mueve con el teclado (ver `ponerBruto`).
 */

const RUTA = '/visualizador-sueldo-neto/';

const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

/**
 * Mueve el slider del bruto. `fill()` no sirve sobre un `input[type=range]` controlado por
 * React —cambia el atributo pero no dispara el `onChange`, y la página se queda en su valor
 * inicial de 30.000 € haciendo pasar el test por accidente—, así que se usa el teclado, que es
 * además lo que haría una persona navegando sin ratón. `End` lleva al máximo (150.000 €) y
 * cada `ArrowLeft` baja un paso de 1.000 €.
 */
async function ponerBruto(page: Page, euros: number): Promise<void> {
  const slider = page.getByRole('slider').first();
  await slider.focus();
  await page.keyboard.press('End');
  for (let v = 150000; v > euros; v -= 1000) await page.keyboard.press('ArrowLeft');
}

/** Valor de un ítem de la cascada, localizado por su etiqueta exacta. */
async function cascada(page: Page, etiqueta: string): Promise<string> {
  const info = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
  return limpiar(await info.locator('span').nth(1).innerText());
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tu Sueldo Bruto a Neto, Paso a Paso');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 0 · DA 61.ª de 2026: con 19.000 € la deducción es 209,69 € y el IRPF 1.354,50 €', async ({ page }) => {
  // SS 2026: 19.000 / 12 = 1.583,33 €/mes × 6,50 % × 12 = 1.235,00 €
  // Reducción art. 20, medida sobre 19.000 − 1.235 = 17.765,00 € (art. 20: SIN restar antes los
  //   2.000 € de la letra f); hallazgo 1687) → segundo tramo: 2.364,34 − 1,14 × 91,48 = 2.260,05 €
  // Rendimiento neto = 17.765 − 2.000 = 15.765 € → base = 15.765 − 2.260,05 = 13.504,95 €
  // cuota = escala(13.504,95) 2.618,69 − escala(5.550) 1.054,50 = 1.564,19 €
  // Deducción DA 61.ª de 2026 (art. 28 RDL 5/2026) sobre los ÍNTEGROS:
  //   590,89 − 0,2 × (19.000 − 17.094) = 209,69 € → IRPF = 1.354,50 €
  // Hasta el 24/09/2026: la de 2025 sobre el neto, 249,34 € → 607,70 € de IRPF. Hasta el
  // 25/09/2026, con la reducción medida sobre 15.765 € (5.704,25 €): 647,35 € de IRPF.
  await ponerBruto(page, 19000);
  await expect(page.locator('css=div:has(> span:text-is("Sueldo bruto anual"))').first()).toContainText('19.000,00');
  expect(await cascada(page, 'Retención IRPF')).toBe('− 1354,50 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 · 30.000 € brutos (valor por defecto)', async ({ page }) => {
  // SS: base 2.500 €/mes × 6,50 % × 12 = 1.950,00 €
  // RNT = 30.000 − 1.950 − 2.000 = 26.050,00 € → reducción art. 20 = 0 € (supera 19.747,5 €)
  // Base liquidable general = 26.050,00 €, CON el mínimo de 5.550 € dentro.
  //   escala(26.050) = 12.450×19 % + 7.750×24 % + 5.850×30 % = 5.980,50 €
  //   escala(5.550)  = 5.550×19 %                            = 1.054,50 €
  //   cuota íntegra  = 5.980,50 − 1.054,50                   = 4.926,00 €
  // Deducción DA 61.ª: 0 € (30.000 € íntegros > 20.048,45 €)
  // Neto anual = 30.000 − 1.950 − 4.926 = 23.124,00 € → 1.927,00 €/mes
  //
  // El método defectuoso daba escala(26.050 − 5.550) = 4.315,50 €: 610,50 € menos, y un neto
  // de 23.734,50 € que la app publicaba como el sueldo que se cobra.
  expect(await cascada(page, 'Sueldo bruto anual')).toBe('30.000,00 €');
  expect(await cascada(page, 'Seguridad Social')).toBe('− 1950,00 €');
  expect(await cascada(page, 'Retención IRPF')).toBe('− 4926,00 €');
  expect(await cascada(page, 'Tu sueldo neto anual')).toBe('23.124,00 €');

  // El desglose por tramos es el de la PRIMERA aplicación de la escala, sobre la base entera,
  // así que suma 5.980,50 € y no la cuota final. La nota lo dice y lo cuadra.
  const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
  await expect(nota).toContainText('5980,50');   // lo que suman los tramos
  await expect(nota).toContainText('5550,00');   // el mínimo personal
  await expect(nota).toContainText('1054,50');   // la escala aplicada al mínimo
  await expect(nota).toContainText('4926,00');   // la cuota íntegra
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 · el tramo del 30 % aparece porque la base lleva el mínimo dentro', async ({ page }) => {
  // Invariante estructural del art. 63.1.2.º: los tramos se aplican a la base ENTERA.
  // Con 30.000 € de bruto la base es 26.050 €, que entra en el tercer tramo (20.200-35.200 €)
  // por 5.850 €. Con el método defectuoso la base era 20.500 € y ese tramo solo recibía 300 €.
  // Si algún día vuelve a aparecer 300,00 € en la última fila, el mínimo se restó de la base.
  const tramos = page.locator('css=div:has(> p:text-is("Desglose por tramos IRPF"))').first();
  await expect(tramos).toBeVisible();

  const filas = tramos.locator('css=div[class*="tramoItem"]');
  await expect(filas).toHaveCount(3);
  await expect(filas.nth(0)).toContainText('12.450,00');
  await expect(filas.nth(1)).toContainText('7750,00');
  await expect(filas.nth(2)).toContainText('al 30%');
  await expect(filas.nth(2)).toContainText('5850,00');
  await expect(filas.nth(2)).toContainText('1755,00');   // 5.850 × 30 %
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 · 71.000 € brutos: el mínimo cae entero en el tramo del 45 % y la base SS se topa', async ({ page }) => {
  // Los dos defectos a la vez, que es lo que hace útil este caso.
  //
  // Seguridad Social: 71.000 / 12 = 5.916,67 €/mes, POR ENCIMA de la máxima de 5.101,20 €,
  // así que la base se clava en el tope → SS = 5.101,20 × 6,50 % × 12 = 3.978,936 → 3.978,94 €.
  //   Con el divisor viejo la base era 71.000/14 = 5.071,43 €/mes, aún por debajo del tope, de
  //   modo que ni siquiera llegaba a topar: 4.615,00 €, que son 636,06 € de más.
  // RNT = 71.000 − 3.978,936 − 2.000 = 65.021,064 € → reducción art. 20 = 0 €
  //   escala(65.021,06) = 17.901,50 (acumulado hasta 60.000) + 5.021,064×45 %
  //                     = 17.901,50 + 2.259,4788 = 20.160,9788 €
  //   escala(5.550)     = 1.054,50 €   ← y NO 5.550 × 45 % = 2.497,50 €, que es lo que valía
  //                                      el método viejo del mínimo: 1.443,00 €/año de error
  //   cuota íntegra     = 19.106,4788 → 19.106,48 €
  // Neto anual = 71.000 − 3.978,936 − 19.106,4788 = 47.914,5852 → 47.914,59 €
  await ponerBruto(page, 71000);

  expect(await cascada(page, 'Sueldo bruto anual')).toBe('71.000,00 €');
  expect(await cascada(page, 'Seguridad Social')).toBe('− 3978,94 €');
  expect(await cascada(page, 'Retención IRPF')).toBe('− 19.106,48 €');
  expect(await cascada(page, 'Tu sueldo neto anual')).toBe('47.914,59 €');

  // Y la nota deja a la vista la diferencia entre los dos métodos del mínimo: los tramos suman
  // 20.160,98 € y de ahí se resta 1.054,50 €, no 2.497,50 €.
  const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
  await expect(nota).toContainText('20.160,98');
  await expect(nota).toContainText('1054,50');
  await expect(nota).toContainText('19.106,48');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 4 (límite) · 150.000 €: la SS no crece, el IRPF sí', async ({ page }) => {
  // El invariante del tope, que es lo que el divisor 14 rompía: pasados 61.214,40 € de bruto
  // (5.101,20 × 12) la cotización del trabajador SE CONGELA en 3.978,94 €/año, gane lo que
  // gane. Con el divisor viejo seguía creciendo hasta 71.416,80 € y se congelaba en 4.642,09 €.
  //
  // RNT = 150.000 − 3.978,936 − 2.000 = 144.021,064 € → reducción art. 20 = 0 €
  //   escala(144.021,06) = 17.901,50 + 84.021,064×45 % = 17.901,50 + 37.809,4788 = 55.710,9788 €
  //   escala(5.550)      = 1.054,50 €  →  cuota íntegra = 54.656,4788 → 54.656,48 €
  // Neto anual = 150.000 − 3.978,936 − 54.656,4788 = 91.364,5852 → 91.364,59 €
  await ponerBruto(page, 150000);

  expect(await cascada(page, 'Sueldo bruto anual')).toBe('150.000,00 €');
  expect(await cascada(page, 'Seguridad Social')).toBe('− 3978,94 €');   // la misma que con 71.000 €
  expect(await cascada(page, 'Retención IRPF')).toBe('− 54.656,48 €');
  expect(await cascada(page, 'Tu sueldo neto anual')).toBe('91.364,59 €');

  // Y el texto que acompaña a los sueldos altos nombra el tope ANUAL correcto: 61.214,40 €,
  // no los 71.416,80 € que publicaba antes (5.101,20 × 14).
  const insight = page.locator('css=p:has-text("deja de crecer")').first();
  await expect(insight).toContainText('61.214,40');
  await expect(insight).toContainText('5101,20');
});

// ═════════════════════════════════════════════════════════════════════════════
// Inspector 25/09/2026 — primera inspección en la base
// ═════════════════════════════════════════════════════════════════════════════
/**
 * Qué promete: <h1> «Tu Sueldo Bruto a Neto, Paso a Paso», subtítulo «cada euro, paso a paso»,
 * description «Cascada interactiva con cotizaciones SS, IRPF por tramos y deducciones».
 *
 * De dónde sale cada cifra esperada — TODO de `data/fiscal/irpf.ts`, nunca de memoria:
 *   · COTIZACIONES_SS_2026 — 4,70 + 1,55 + 0,10 + 0,15 (MEI) = 6,50 % (Orden PJC/297/2026)
 *   · BASES_SS_2026.maxima — 5.101,20 €/mes, doce liquidaciones (art. 147 LGSS)
 *   · calcularRendimientoNetoTrabajo — reducción del art. 20 sobre bruto − SS (sin los 2.000 €
 *     de la letra f); REDUCCION_RENDIMIENTOS_TRABAJO_2025: 7.302 € hasta 14.852 €, luego
 *     7.302 − 1,75 × (r − 14.852) hasta 17.673,52 €, y 0 desde 19.747,5 €
 *   · TRAMOS_IRPF_2025 — 19/24/30/37/45/47 % con cortes en 12.450, 20.200, 35.200, 60.000 y 300.000
 *   · MINIMOS_IRPF_2025.personal — 5.550 €, gravado a tipo cero (calcularCuotaIntegraGeneral)
 *   · DEDUCCION_RENDIMIENTOS_TRABAJO_2026 — 590,89 € con íntegros ≤ 17.094 €; 0 desde 20.048,45 €;
 *     entre medias 590,89 − 0,2 × (íntegros − 17.094); topada en la cuota íntegra
 *
 * Los tres casos propios se resolvieron a mano ANTES de ejecutar la app; la aritmética va en
 * cada test. El bruto se siembra con `sembrarValorAcotado`, que espera a que el estado de React
 * recoja el valor y devuelve lo que el deslizador ACEPTÓ (un range capa a [min, max]).
 */
test.describe('Inspector 25/09/2026', () => {
  const SLIDER = 'input[type="range"]';
  const CAMPO_HERMANA = 'input[placeholder="30000"]';

  /** Tercer <span> de un ítem de la cascada: el porcentaje y, en el neto, el mensual. */
  async function pieCascada(page: Page, etiqueta: string): Promise<string> {
    const info = page.locator(`css=div:has(> span:text-is("${etiqueta}"))`).first();
    return limpiar(await info.locator('span').nth(2).innerText());
  }

  /** El JSON-LD del FAQPage, tal y como lo sirve el layout. */
  async function faqJsonLd(page: Page): Promise<string> {
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faq = scripts.find((s) => s.includes('"FAQPage"'));
    if (!faq) throw new Error('La página no sirve ningún JSON-LD de tipo FAQPage');
    return faq;
  }

  /** Contraste WCAG del primer elemento que casa, contra el primer fondo opaco de sus ancestros. */
  async function contraste(el: ReturnType<Page['locator']>): Promise<{ ratio: number; texto: string; color: string; fondo: string }> {
    await expect(el).toBeVisible();
    return el.evaluate((nodo) => {
      const rgb = (c: string): number[] | null => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        return p.length === 3 ? [...p, 1] : p;
      };
      const lum = ([r, g, b]: number[]): number => {
        const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      let fondo: number[] = [255, 255, 255, 1];
      for (let e: Element | null = nodo; e; e = e.parentElement) {
        const bg = rgb(getComputedStyle(e).backgroundColor);
        if (bg && bg[3] > 0.5) { fondo = bg; break; }
      }
      const color = rgb(getComputedStyle(nodo).color) ?? [0, 0, 0, 1];
      const [a, b] = [lum(color), lum(fondo)];
      return {
        ratio: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100,
        texto: (nodo.textContent ?? '').trim(),
        color: `rgb(${color.slice(0, 3).join(', ')})`,
        fondo: `rgb(${fondo.slice(0, 3).join(', ')})`,
      };
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  test('CASO I-1 (normal) · 45.000 € brutos, soltero sin hijos', async ({ page }) => {
    // SS: 45.000 / 12 = 3.750 €/mes, por debajo del tope de 5.101,20 → 45.000 × 6,50 % = 2.925,00 €
    //   (4,70 % → 2.115,00 · 1,55 % → 697,50 · 0,10 % → 45,00 · 0,15 % MEI → 67,50)
    // Art. 20: bruto − SS = 42.075 € ≥ 19.747,5 → reducción 0 €. Menos 2.000 € (art. 19.2.f):
    //   base liquidable general = 40.075,00 €, con el mínimo dentro
    // escala(40.075) = 12.450×19 % + 7.750×24 % + 15.000×30 % + 4.875×37 %
    //                = 2.365,50 + 1.860,00 + 4.500,00 + 1.803,75 = 10.529,25 €
    // escala(5.550)  = 1.054,50 € → cuota íntegra = 9.474,75 €
    // DA 61.ª 2026: 45.000 ≥ 20.048,45 → 0 € → IRPF = 9.474,75 € → 21,055 % del bruto → «21,1»
    // Neto = 45.000 − 2.925 − 9.474,75 = 32.600,25 € (72,445 % → «72,4») → /12 = 2.716,6875 → 2716,69
    expect(await sembrarValorAcotado(page, SLIDER, 45000)).toBe('45000');

    expect(await cascada(page, 'Sueldo bruto anual')).toBe('45.000,00 €');
    expect(await cascada(page, 'Seguridad Social')).toBe('− 2925,00 €');
    const filasSS = page.locator('css=div[class*="desgloseItem"]');
    await expect(filasSS).toHaveCount(4);
    await expect(filasSS.nth(0)).toContainText('2115,00');
    await expect(filasSS.nth(1)).toContainText('697,50');
    await expect(filasSS.nth(2)).toContainText('45,00');
    await expect(filasSS.nth(3)).toContainText('67,50');

    expect(await cascada(page, 'Retención IRPF')).toBe('− 9474,75 €');
    expect(await pieCascada(page, 'Retención IRPF')).toMatch(/^Tipo efectivo: 21,1\s?%$/);
    expect(await cascada(page, 'Tu sueldo neto anual')).toBe('32.600,25 €');
    expect(await pieCascada(page, 'Tu sueldo neto anual')).toMatch(/^72,4\s?% del bruto → 2716,69 €\/mes/);

    // Cuatro tramos; el cuarto, 35.200 → 60.000 al 37 %, recibe 4.875 € y aporta 1.803,75 €
    const filas = page.locator('css=div[class*="tramoItem"]');
    await expect(filas).toHaveCount(4);
    await expect(filas.nth(3)).toContainText(/al 37\s?%/);
    await expect(filas.nth(3)).toContainText('4875,00');
    await expect(filas.nth(3)).toContainText('1803,75');
    const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
    await expect(nota).toContainText('10.529,25');
    await expect(nota).toContainText('1054,50');
    await expect(nota).toContainText('9474,75');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('CASO I-1b · la hermana estimador-sueldo-neto da el mismo neto con 45.000 €', async ({ page }) => {
    // Mismas entradas (45.000 €, soltero, sin hijos), mismo motor de data/fiscal: el neto que la
    // hermana publica tiene que ser el de CASO I-1, 32.600,25 €. Si un día divergen, una de las
    // dos se ha separado del motor común.
    await page.goto('/estimador-sueldo-neto/');
    await esperarHidratacion(page, [CAMPO_HERMANA]);
    await page.locator(CAMPO_HERMANA).fill('45000');
    await esperarValorEnReact(page, CAMPO_HERMANA, '45000');
    await page.getByRole('button', { name: 'Calcular', exact: true }).click();
    const h3 = page.getByRole('heading', { level: 3, name: 'Salario Neto Anual', exact: true });
    await expect(h3).toBeVisible();
    expect(limpiar(await h3.locator('xpath=../following-sibling::div[1]//p').innerText())).toBe('32.600,25€');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('CASO I-2 (límite) · 17.000 €, zona del SMI: la DA 61.ª se come toda la cuota', async ({ page }) => {
    // SS: 17.000 × 6,50 % = 1.105,00 € (sin suelo en la base mínima: por debajo del SMI se cotiza
    //   por lo cobrado, comentario de calcularSueldo)
    // Art. 20: bruto − SS = 15.895 € → primer tramo decreciente:
    //   7.302 − 1,75 × (15.895 − 14.852) = 7.302 − 1.825,25 = 5.476,75 €
    // Base = 15.895 − 2.000 − 5.476,75 = 8.418,25 € → escala = 8.418,25 × 19 % = 1.599,4675 €
    // Cuota íntegra = 1.599,4675 − 1.054,50 = 544,9675 → «544,97»
    // DA 61.ª 2026: 17.000 ≤ 17.094 → 590,89 €, topada en la cuota → 544,97 € → IRPF = 0,00 €
    // Neto = 17.000 − 1.105 = 15.895,00 € (93,5 %) → /12 = 1.324,583 → 1324,58
    expect(await sembrarValorAcotado(page, SLIDER, 17000)).toBe('17000');

    expect(await cascada(page, 'Seguridad Social')).toBe('− 1105,00 €');
    const filas = page.locator('css=div[class*="tramoItem"]');
    await expect(filas).toHaveCount(1);
    await expect(filas.nth(0)).toContainText('8418,25');
    await expect(filas.nth(0)).toContainText('1599,47');
    const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
    await expect(nota).toContainText('544,97');

    expect(await cascada(page, 'Retención IRPF')).toBe('− 0,00 €');
    expect(await pieCascada(page, 'Retención IRPF')).toMatch(/^Tipo efectivo: 0,0\s?%$/);
    expect(await cascada(page, 'Tu sueldo neto anual')).toBe('15.895,00 €');
    expect(await pieCascada(page, 'Tu sueldo neto anual')).toMatch(/^93,5\s?% del bruto → 1324,58 €\/mes/);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('CASO I-3 (rechazo) · fuera de [15.000, 150.000] el deslizador no acepta la cifra', async ({ page }) => {
    // El bruto solo entra por un <input type="range" min=15000 max=150000>: una cifra fuera de
    // rango no se puede teclear, y la que se le impone se capa al extremo. Lo que se vigila es
    // que la página no calcule con la cifra rechazada (ni 0, ni negativa, ni NaN).
    // 15.000 €: SS = 975,00 €; bruto − SS = 14.025 ≤ 14.852 → reducción art. 20 = 7.302 €
    //   base = 14.025 − 2.000 − 7.302 = 4.723 € < 5.550 → el mínimo se capa a la base → cuota 0
    //   Neto = 15.000 − 975 = 14.025,00 €
    expect(await sembrarValorAcotado(page, SLIDER, 1000000)).toBe('150000');
    expect(await cascada(page, 'Sueldo bruto anual')).toBe('150.000,00 €');
    expect(await sembrarValorAcotado(page, SLIDER, -5000)).toBe('15000');
    expect(await cascada(page, 'Sueldo bruto anual')).toBe('15.000,00 €');

    // Y con el teclado, por debajo del mínimo: se queda en 15.000
    const slider = page.getByRole('slider').first();
    await slider.focus();
    await page.keyboard.press('PageDown');
    await page.keyboard.press('ArrowLeft');
    await expect(slider).toHaveValue('15000');

    expect(await cascada(page, 'Seguridad Social')).toBe('− 975,00 €');
    expect(await cascada(page, 'Retención IRPF')).toBe('− 0,00 €');
    expect(await cascada(page, 'Tu sueldo neto anual')).toBe('14.025,00 €');
    expect(await page.locator('body').innerText()).not.toContain('NaN');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · el FAQPage da la cotización del trabajador «entre un 6,35 % y 6,50 %»', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026) — la forma del 1655 de estimador-sueldo-neto
    // La app aplica COTIZACIONES_SS_2026 = 6,50 % a todo bruto por debajo del tope: con 30.000 €,
    // 1.950,00 €. El 6,35 % es la suma SIN el MEI (4,70 + 1,55 + 0,10), que no paga nadie en
    // 2026; y por encima del tope la cotización ni siquiera cae en esa horquilla (85.000 € →
    // 3.978,94 €, un 4,7 %).
    expect(await cascada(page, 'Seguridad Social')).toBe('− 1950,00 €');
    expect(await pieCascada(page, 'Seguridad Social')).toMatch(/^6,5\s?% del bruto$/);
    const faq = await faqJsonLd(page);
    expect(faq).toContain('Qué diferencia hay entre sueldo bruto y sueldo neto');
    expect(faq).not.toMatch(/6,35/);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · la app declara datos de 2025 y calcula con los de 2026, citando solo la LIRPF', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026) — la forma del 1653 de estimador-sueldo-neto
    // Lo que se aplica es de 2026: MEI 0,15 % (COTIZACIONES_SS_2026; el de 2025 es 0,12 %), tope
    // de 5.101,20 €/mes (BASES_SS_2026; el de 2025 es 4.909,50 €) y la DA 61.ª de 2026. El
    // DataReference dice «IRPF + Seguridad Social 2025» y solo cita la Ley 35/2006, arts. 57 a 66.
    await expect(page.locator('css=div[class*="desgloseItem"]').nth(3)).toContainText(/MEI \(0,15\s?%\)/);
    const refs = page.getByRole('note', { name: 'Datos de referencia normativos' });
    await expect(refs.first()).toBeVisible();
    const texto = limpiar((await refs.allInnerTexts()).join(' | '));
    expect(texto).not.toContain('Seguridad Social 2025');
    expect(texto).toContain('PJC/297/2026');
    const descripcion = await page.locator('meta[name="description"]').getAttribute('content');
    expect(descripcion).not.toContain('Datos 2025');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · la prosa compara SS e IRPF con cifras de antes de las reparaciones', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026)
    const insight = page.locator('css=div[class*="insight"]').first();

    // 30.000 € (valor por defecto): SS 1.950,00 € frente a IRPF 4.926,00 € (2,5 veces más);
    // el texto dice que «se reparten el peso casi a partes iguales».
    expect(await cascada(page, 'Seguridad Social')).toBe('− 1950,00 €');
    expect(await cascada(page, 'Retención IRPF')).toBe('− 4926,00 €');
    expect(limpiar(await insight.innerText())).not.toContain('partes iguales');

    // 20.000 €: SS = 1.300,00 €. IRPF: bruto − SS = 18.700 → reducción 2.364,34 − 1,14 ×
    // (18.700 − 17.673,52) = 1.194,15 €; base = 16.700 − 1.194,15 = 15.505,85 € → escala
    // 2.365,50 + 3.055,85 × 24 % = 3.098,904 − 1.054,50 = 2.044,404; DA 61.ª: 590,89 − 0,2 ×
    // 2.906 = 9,69 → IRPF 2.034,71 €, MAYOR que la SS. El texto dice lo contrario.
    expect(await sembrarValorAcotado(page, SLIDER, 20000)).toBe('20000');
    expect(await cascada(page, 'Seguridad Social')).toBe('− 1300,00 €');
    expect(await cascada(page, 'Retención IRPF')).toBe('− 2034,71 €');
    expect(limpiar(await insight.innerText())).not.toContain('la Seguridad Social pesa más que el IRPF');

    // 35.000 €: la app da un tipo efectivo del 18,1 % (IRPF 6.328,50 €); la guía dice «~15%».
    expect(await sembrarValorAcotado(page, SLIDER, 35000)).toBe('35000');
    expect(await pieCascada(page, 'Retención IRPF')).toMatch(/^Tipo efectivo: 18,1\s?%$/);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const guia = page.locator('css=p:has-text("tipo efectivo")').first();
    await expect(guia).toContainText('35.000');
    expect(limpiar(await guia.innerText())).not.toMatch(/~\s?15\s?%/);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · «te llevas menos del X %» redondea X y lo contradice', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    // 85.000 €: SS topada = 5.101,20 × 6,50 % × 12 = 3.978,936 €; base = 85.000 − 3.978,936 −
    // 2.000 = 79.021,064 € → escala 17.901,50 + 19.021,064 × 45 % = 26.460,9788 − 1.054,50 =
    // 25.406,4788 €; neto = 55.614,5852 € = 65,43 % del bruto. El texto dice «menos del 65 %»
    // porque redondea 65,43 a 65 con formatNumber(…, 0).
    expect(await sembrarValorAcotado(page, SLIDER, 85000)).toBe('85000');
    expect(await pieCascada(page, 'Tu sueldo neto anual')).toMatch(/^65,4\s?% del bruto/);
    const insight = page.locator('css=div[class*="insight"]').first();
    await expect(insight).toContainText('menos del');
    expect(limpiar(await insight.innerText())).not.toMatch(/menos del 65\s?%/);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · el «paso a paso» se salta los gastos, la reducción del art. 20 y la DA 61.ª', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026)
    // 19.000 €: la cascada enseña SS 1.235,00 € y unos tramos sobre una base de 13.504,95 €,
    // pero bruto − SS son 17.765 €. Faltan los 2.000 € del art. 19.2.f y la reducción del
    // art. 20 (2.364,34 − 1,14 × (17.765 − 17.673,52) = 2.260,05 €). Y de la cuota íntegra
    // (1.564,19 €) a la retención (1.354,50 €) median 209,69 € de deducción DA 61.ª
    // (590,89 − 0,2 × (19.000 − 17.094)) que la página no nombra. La hermana los enseña.
    expect(await sembrarValorAcotado(page, SLIDER, 19000)).toBe('19000');
    expect(await cascada(page, 'Seguridad Social')).toBe('− 1235,00 €');
    expect(await cascada(page, 'Retención IRPF')).toBe('− 1354,50 €');
    const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
    await expect(nota).toContainText('1564,19');
    const cascadaTexto = limpiar(await page.locator('css=div[class*="cascada"]').first().innerText());
    expect(cascadaTexto).toContain('209,69');
    expect(cascadaTexto).toContain('2260,05');
    expect(cascadaTexto).toContain('2000,00');
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · el supuesto «soltero sin hijos, un pagador» solo vive en la guía colapsada', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026)
    // La app no pregunta la situación familiar: aplica siempre MINIMOS_IRPF_2025.personal
    // (5.550 €) y la escala combinada estatal + autonómica media. Lo avisa solo el warningBox
    // de dentro de <EducationalSection>, que nace colapsada (display: none).
    const boton = page.getByRole('button', { name: 'Ver guía educativa' });
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    const nota = page.locator('css=p:has-text("art. 63.1.2.º LIRPF")').first();
    await expect(nota).toContainText('5550,00');
    const visible = limpiar(await page.locator('body').innerText());
    expect(visible).toMatch(/soltero|sin hijos/i);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · el FAQPage pone el tipo estatal máximo «a partir de 60.000 €»', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    // TRAMOS_IRPF_2025 tiene un tramo de 60.000 a 300.000 € (45 %) y otro desde 300.000 € (47 %),
    // el que añadió la Ley 11/2020 (cabecera de data/fiscal/irpf.ts). La app lo enseña: con
    // 85.000 € el último tramo del desglose es «60.000,00 € → 300.000,00 €». El FAQPage dice que
    // los tramos estatales llegan «al 24,5% (a partir de 60.000 €)».
    expect(await sembrarValorAcotado(page, SLIDER, 85000)).toBe('85000');
    const filas = page.locator('css=div[class*="tramoItem"]');
    await expect(filas).toHaveCount(5);
    await expect(filas.nth(4)).toContainText('60.000,00 € → 300.000,00 €');
    const faq = await faqJsonLd(page);
    expect(faq).toContain('9,5');
    expect(faq).not.toMatch(/24,5\s?%\s?\(a partir de 60\.000/);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · el % va pegado a la cifra (desde el 25/09/2026, con espacio duro)', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    // Sin `limpiar`: aquí importa justo el carácter entre la cifra y el %. 30.000 € → 16,4 %.
    const info = page.locator('css=div:has(> span:text-is("Retención IRPF"))').first();
    const crudo = await info.locator('span').nth(2).innerText();
    expect(crudo).toContain('16,4');
    expect(crudo).toMatch(/16,4 %/);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · importes en rojo y rótulos de la barra por debajo de 4,5:1', async ({ page }) => {
    test.fail(); // HALLAZGO medio (Inspector 25/09/2026)
    // Texto pequeño (13,6 px y 12,5 px, peso 600): WCAG AA pide 4,5:1. Medido: #e74c3c sobre
    // blanco 3,82:1 (3,76:1 en oscuro); blanco sobre el naranja #e67e22 de la barra 2,85:1.
    await prepararParaMedir(page);
    await activarTema(page, 'light');
    const importeSS = await contraste(page.locator('css=div[class*="desgloseItem"]').first().locator('span').last());
    expect(importeSS.texto).toContain('1410,00');
    expect(importeSS.ratio).toBeGreaterThanOrEqual(4.5);
    const barraSS = await contraste(page.locator('css=div[class*="barraSS"] span').first());
    expect(barraSS.ratio).toBeGreaterThanOrEqual(4.5);
    const enlace = await contraste(page.locator('css=div[class*="enlaceApp"] a').first());
    expect(enlace.ratio).toBeGreaterThanOrEqual(4.5);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · en oscuro, el gráfico escribe en #666 y el módulo fija --primary sin variante', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    // Chart.js pinta ejes y leyenda con su color por defecto (#666) sobre la tarjeta #2A2A2A:
    // 2,50:1. Y `.container` redeclara --primary: #2E86AB sin variante oscura, tapando el
    // #3FA5D1 de globals: el enlace a las apps hermanas queda en 3,08:1 sobre #333.
    await prepararParaMedir(page);
    await activarTema(page, 'dark');
    await page.reload();   // el gráfico se construye al montar: que lo haga ya en oscuro
    await prepararParaMedir(page);
    await activarTema(page, 'dark');
    await expect(page.locator('css=div[class*="chartContainer"]')).toHaveCSS('background-color', 'rgb(42, 42, 42)');
    await page.waitForTimeout(1200);   // fin de la animación de entrada de Chart.js
    const pixelesGris666 = await page.locator('canvas').first().evaluate((c) => {
      const lienzo = c as HTMLCanvasElement;
      const d = lienzo.getContext('2d')!.getImageData(0, 0, lienzo.width, lienzo.height).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] === 102 && d[i + 1] === 102 && d[i + 2] === 102 && d[i + 3] > 250) n++;
      return n;
    });
    expect(pixelesGris666).toBe(0);
    const enlace = await contraste(page.locator('css=div[class*="enlaceApp"] a').first());
    expect(enlace.ratio).toBeGreaterThanOrEqual(4.5);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · el deslizador se anuncia como «30000» y el gráfico no tiene nombre accesible', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026)
    // Sin aria-valuetext, un lector de pantalla lee el valor crudo del range («30000»), y el
    // <canvas> lleva aria-label sin role, así que no se expone (su ariaSnapshot sale vacío).
    const slider = page.getByRole('slider').first();
    await expect(slider).toHaveValue('30000');
    expect(await slider.getAttribute('aria-valuetext')).toMatch(/30\.000/);
    await expect(page.getByRole('img', { name: /Gráfico/ })).toHaveCount(1);
  });

  // ───────────────────────────────────────────────────────────────────────────
  test('HALLAZGO · «No es dinero perdido — es contribución al sistema»', async ({ page }) => {
    test.fail(); // HALLAZGO bajo (Inspector 25/09/2026) — neutralidad editorial (§1.quinquies)
    // Describir a qué se destinan cotizaciones e impuestos es informativo; valorar si son
    // «dinero perdido» es una opinión sobre la carga fiscal que la herramienta no necesita.
    const visible = limpiar(await page.locator('body').innerText());
    expect(visible).toContain('financian pensiones');
    expect(visible).not.toContain('No es dinero perdido');
  });
});
