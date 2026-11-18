import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Inspector — simulador-elasticidad-precio (segmento interactiva). Primera inspección: 18/11/2026.
 *
 * El <h1> promete «Simulador de Elasticidad-Precio»; el hero, «Cambia el precio de 6 bienes reales
 * y observa cómo varía la cantidad demandada y el ingreso total según su elasticidad»; la metadata,
 * «clasifica la demanda» y los rectángulos de ingreso total.
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-elasticidad-precio/page.tsx (no importa motores ni data/)
 *   · Seis bienes con |Ed| FIJO (insulina 0,10 · sal 0,10 · gasolina 0,35 · café 0,80 ·
 *     smartphone 1,50 · vuelo 2,40), Q₀ = 100 y P₀ propio. Un deslizador ΔP de −50 a +50 (paso 1)
 *     y un conmutador demanda/oferta.
 *   · %ΔQ = ∓|Ed| × %ΔP (− en demanda, + en oferta) · P₁ = P₀(1 + ΔP) · Q₁ = máx(0, Q₀(1 + ΔQ))
 *     · IT = P × Q. Es una demanda LINEAL que pasa por (Q₀, P₀) con elasticidad PUNTUAL |Ed| en ese
 *     punto (el lienzo dibuja esa recta, y el punto nuevo cae sobre ella): a lo largo de la recta
 *     la elasticidad cambia, como dice la propia FAQ («en una curva lineal… la elasticidad varía»).
 *   · Clasificación e interpretación salen del |Ed| del punto de partida, no del cambio.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS ESPERADOS, CALCULADOS ANTES DE ABRIR LA APP: .inspector-trabajo/sep-esperados.mjs, con la
 * regla de la app y, como verdad independiente, la elasticidad ARCO (punto medio)
 *   E_arco = [(Q₁ − Q₀)/((Q₀ + Q₁)/2)] / [(P₁ − P₀)/((P₀ + P₁)/2)]
 *
 *   CASO 1 (normal) — gasolina, demanda, ΔP +20 %
 *     P₁ = 1,98 · ΔQ = −7 % · Q₁ = 93 · IT 165 → 184,14 (+19,14 €, +11,60 %) · E_arco = −0,399
 *     → inelástica en el tramo: subir el precio SUBE el ingreso.
 *   CASO 1 bis — smartphone, demanda, ΔP −10 %
 *     P₁ = 900 · ΔQ = +15 % · Q₁ = 115 · IT 100.000 → 103.500 (+3.500 €, +3,5 %) · E_arco = −1,326
 *     → elástica: BAJAR el precio sube el ingreso (y la cantidad AUMENTA).
 *   CASO 2 (límite |E| = 1) — café, demanda, ΔP +25 %
 *     P₁ = 5,625 · ΔQ = −20 % · Q₁ = 80 · IT 450 → 450 (0 €) · E_arco = −1,000 exacto: UNITARIA en
 *     el tramo, aunque |Ed| = 0,80 en el punto de partida. Con +50 %: Q₁ = 60, IT 405 (−45 €,
 *     −10 %), E_arco = −1,25 (elástica en el tramo). Smartphone −50 %: Q₁ = 175, IT 87.500
 *     (−12.500 €), E_arco = −0,818 (inelástica en el tramo).
 *   CASO 2 bis (extremo del deslizador) — vuelo, demanda, ΔP +50 %
 *     La recta corta Q = 0 en ΔP = 1/2,4 = +41,67 % (precio de cierre 283,33 €): Q₁ = 0, IT 0
 *     (−20.000 €, −100 %) y ΔQ = −100 % — una cantidad no cae más del 100 %.
 *   CASO 3 (rechazo) — ΔP +80 y −100 (precio cero): el deslizador los acota a +50 y −50
 *     vuelo +50 → P₁ 300 · vuelo −50 → P₁ 100, Q₁ 220, IT 22.000 (+2.000 €, +10 %).
 *     ΔP = 0 (sal): ΔQ «0,0» sin signo, IT 80 → 80 y el aviso de introducir una variación.
 *   OFERTA — gasolina, ΔP +20 %: ΔQ = +7 % · Q₁ = 107 · IT 211,86 (+46,86 €, +28,4 %).
 *
 * Los casos con test.fail() son hallazgos ABIERTOS de esta inspección: cuando se reparen,
 * Playwright marcará el «fallo esperado» como inesperado; entonces se quita el test.fail() y el
 * comentario pasa a REPARADO. Si la reparación cambia el MODELO (p. ej. a elasticidad constante,
 * Q = Q₀(P/P₀)^−E), las cifras de los casos 2 y 2 bis se recalculan con sep-esperados.mjs.
 *
 * Los «%» se comparan con /\s?%/: la app aún los pega a la cifra («+20%»), y la reparación del
 * formato (espacio duro, CLAUDE.md global §2) no debe tumbar los casos de cálculo.
 */

const URL_APP = '/simulador-elasticidad-precio/';
const ESPACIO_DURO = ' ';

async function abrir(page: Page): Promise<void> {
  await page.goto(URL_APP);
  await esperarHidratacion(page, ['#deltaP']);
}

const panel = (page: Page): Locator => page.getByRole('region', { name: 'Resultados' });

/** El valor (segundo hijo) de la fila del panel cuyo rótulo contiene `rotulo`. */
const fila = (page: Page, rotulo: string): Locator =>
  panel(page).locator(':scope > div').filter({ hasText: rotulo }).locator(':scope > span').nth(1);

const interpretacion = (page: Page): Locator => panel(page).locator('p');
const insignia = (page: Page): Locator => panel(page).locator(':scope > div').first();

async function elegirBien(page: Page, nombre: string): Promise<void> {
  const boton = page.getByRole('button', { name: nombre, exact: true });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function elegirTipo(page: Page, tipo: 'demanda' | 'oferta'): Promise<void> {
  const boton = page.getByRole('button', {
    name: tipo === 'demanda' ? /Elasticidad de demanda/ : /Elasticidad de oferta/,
  });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

/** «+11,6%» o «+11,6 %» (con espacio duro tras la reparación del formato). */
const pct = (cifra: string): string => `${cifra.replace(/[+.()]/g, (c) => `\\${c}`)}\\s?%`;
const re = (patron: string): RegExp => new RegExp(`^${patron}$`);

test.describe('Elasticidad-precio: casos resueltos a mano', () => {
  test('caso 1 · gasolina +20 % → ΔQ −7,0 %, IT 165 → 184 € (+19 €, +11,6 %): sube porque es inelástica', async ({ page }) => {
    await abrir(page);
    await elegirBien(page, 'Gasolina');
    await sembrarValor(page, '#deltaP', 20);
    await expect(insignia(page)).toContainText('Inelástica (|Ed| < 1)');
    await expect(insignia(page)).toContainText('|Ed| = 0,35');
    await expect(fila(page, 'Precio base')).toHaveText('1,65 €');
    await expect(fila(page, 'Precio nuevo')).toHaveText('1,98 €');
    await expect(fila(page, '→ ΔQ')).toHaveText(re(pct('-7,0')));
    await expect(fila(page, 'Ingreso total base')).toHaveText('165 €');
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('184 €'); // 1,98 × 93 = 184,14
    await expect(fila(page, 'Variación del ingreso total')).toHaveText(re(`\\+19 € \\(${pct('+11,6')}\\)`));
    await expect(interpretacion(page)).toContainText('el ingreso total aumenta porque la demanda es inelástica');
  });

  test('caso 1 bis · smartphone −10 % → ΔQ +15,0 %, IT 100.000 → 103.500 € (+3500 €, +3,5 %): bajar el precio de una elástica sube el ingreso', async ({ page }) => {
    await abrir(page);
    await elegirBien(page, 'Smartphone gama alta');
    await sembrarValor(page, '#deltaP', -10);
    await expect(insignia(page)).toContainText('Elástica (|Ed| > 1)');
    await expect(fila(page, 'Precio nuevo')).toHaveText('900,00 €');
    await expect(fila(page, '→ ΔQ')).toHaveText(re(pct('+15,0')));
    await expect(fila(page, 'Ingreso total base')).toHaveText('100.000 €');
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('103.500 €');
    // 3500: cuatro cifras sin agrupar (RAE 2010, Intl es-ES)
    await expect(fila(page, 'Variación del ingreso total')).toHaveText(re(`\\+3500 € \\(${pct('+3,5')}\\)`));
    await expect(interpretacion(page)).toContainText('Al bajar el precio');
    await expect(interpretacion(page)).toContainText('el ingreso total aumenta');
  });

  test('caso 2 · límite: café +25 % → E arco = −1,000, IT 450 → 450 € (0 €): el ingreso no varía', async ({ page }) => {
    await abrir(page);
    await elegirBien(page, 'Café de marca');
    await sembrarValor(page, '#deltaP', 25);
    await expect(fila(page, 'Precio nuevo')).toHaveText('5,63 €'); // 4,5 × 1,25 = 5,625
    await expect(fila(page, '→ ΔQ')).toHaveText(re(pct('-20,0')));
    await expect(fila(page, 'Ingreso total base')).toHaveText('450 €');
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('450 €'); // 5,625 × 80
    await expect(fila(page, 'Variación del ingreso total')).toHaveText(re(`\\+0 € \\(${pct('+0,0')}\\)`));
    await expect(interpretacion(page)).toContainText('el ingreso total no varía');
  });

  test('caso 2 bis · extremo: vuelo +50 % pasa el precio de cierre (283,33 €) → Q = 0, IT 0 € (−20.000 €, −100,0 %)', async ({ page }) => {
    await abrir(page);
    await elegirBien(page, 'Vuelo turístico');
    await sembrarValor(page, '#deltaP', 50);
    await expect(fila(page, 'Precio nuevo')).toHaveText('300,00 €');
    await expect(fila(page, 'Ingreso total base')).toHaveText('20.000 €');
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('0 €');
    await expect(fila(page, 'Variación del ingreso total')).toHaveText(re(`-20\\.000 € \\(${pct('-100,0')}\\)`));
  });

  test('caso 3 · rechazo: ΔP +80 y −100 (precio cero) se acotan a +50 y −50; ΔP 0 no pinta «-0,0»', async ({ page }) => {
    await abrir(page);
    await elegirBien(page, 'Vuelo turístico');
    expect(await sembrarValorAcotado(page, '#deltaP', 80)).toBe('50');
    await expect(page.locator('#deltaP + span')).toHaveText(re(pct('+50')));
    await expect(fila(page, 'Precio nuevo')).toHaveText('300,00 €');

    expect(await sembrarValorAcotado(page, '#deltaP', -100)).toBe('-50');
    await expect(page.locator('#deltaP + span')).toHaveText(re(pct('-50')));
    await expect(fila(page, 'Precio nuevo')).toHaveText('100,00 €');
    await expect(fila(page, '→ ΔQ')).toHaveText(re(pct('+120,0')));
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('22.000 €'); // 100 × 220
    await expect(fila(page, 'Variación del ingreso total')).toHaveText(re(`\\+2000 € \\(${pct('+10,0')}\\)`));

    await elegirBien(page, 'Sal de mesa');
    await sembrarValor(page, '#deltaP', 0);
    await expect(fila(page, 'Precio nuevo')).toHaveText('0,80 €');
    await expect(fila(page, '→ ΔQ')).toHaveText(re(pct('0,0')));
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('80 €');
    await expect(interpretacion(page)).toHaveText('Introduce una variación de precio para ver el efecto sobre el ingreso total.');
  });

  test('oferta · gasolina +20 % → ΔQ +7,0 %, IT 165 → 212 € (+47 €, +28,4 %)', async ({ page }) => {
    await abrir(page);
    await elegirTipo(page, 'oferta');
    await elegirBien(page, 'Gasolina');
    await sembrarValor(page, '#deltaP', 20);
    await expect(fila(page, '→ ΔQ')).toHaveText(re(pct('+7,0')));
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('212 €'); // 1,98 × 107 = 211,86
    await expect(fila(page, 'Variación del ingreso total')).toHaveText(re(`\\+47 € \\(${pct('+28,4')}\\)`));
  });
});

test.describe('Hallazgos abiertos de la primera inspección (18/11/2026)', () => {
  test('ABIERTO · la interpretación atribuye el cambio de IT al |Ed| de partida aunque el tramo diga lo contrario', async ({ page }) => {
    // Café +25 %: E arco = −1,000 (unitaria) y la app dice «no varía porque la demanda es
    // inelástica». Café +50 %: IT −45 € (−10 %), E arco −1,25, y dice «disminuye porque la demanda
    // es inelástica». Smartphone −50 %: IT −12.500 €, E arco −0,818, y dice «disminuye porque la
    // demanda es elástica». Las tres contradicen la regla que enseña la página.
    await abrir(page);
    const textos: string[] = [];
    await elegirBien(page, 'Café de marca');
    await sembrarValor(page, '#deltaP', 25);
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('450 €');
    textos.push((await interpretacion(page).textContent()) ?? '');
    await sembrarValor(page, '#deltaP', 50);
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('405 €');
    textos.push((await interpretacion(page).textContent()) ?? '');
    await elegirBien(page, 'Smartphone gama alta');
    await sembrarValor(page, '#deltaP', -50);
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('87.500 €');
    textos.push((await interpretacion(page).textContent()) ?? '');
    test.fail();
    expect.soft(textos[0]).not.toContain('no varía porque la demanda es inelástica');
    expect.soft(textos[1]).not.toContain('disminuye porque la demanda es inelástica');
    expect.soft(textos[2]).not.toContain('disminuye porque la demanda es elástica');
  });

  test('ABIERTO · al BAJAR el precio la interpretación dice que los compradores «reducen» la cantidad', async ({ page }) => {
    // Smartphone −10 %: ΔQ = +15 % y la app escribe «los compradores reducen mucho la cantidad».
    await abrir(page);
    await elegirBien(page, 'Smartphone gama alta');
    await sembrarValor(page, '#deltaP', -10);
    await expect(fila(page, '→ ΔQ')).toHaveText(re(pct('+15,0')));
    test.fail();
    await expect(interpretacion(page)).not.toContainText('reducen', { timeout: 2000 });
  });

  test('ABIERTO · vuelo +50 %: ΔQ «-120,0 %» con Q = 0; una cantidad no cae más del 100 %', async ({ page }) => {
    await abrir(page);
    await elegirBien(page, 'Vuelo turístico');
    await sembrarValor(page, '#deltaP', 50);
    await expect(fila(page, 'Ingreso total nuevo')).toHaveText('0 €');
    test.fail();
    await expect(fila(page, '→ ΔQ')).toHaveText(re(pct('-100,0')), { timeout: 2000 });
  });

  test('ABIERTO · en modo oferta la interpretación sigue hablando de la demanda y de compradores que reducen', async ({ page }) => {
    // Gasolina oferta +20 %: ΔQ +7,0 % y «porque la demanda es inelástica: los compradores apenas
    // reducen la cantidad»; la insignia sigue en «|Ed|» y el lienzo dibuja la recta de DEMANDA,
    // con el punto nuevo fuera de ella (.inspector-trabajo/sep-canvas.mjs).
    await abrir(page);
    await elegirTipo(page, 'oferta');
    await elegirBien(page, 'Gasolina');
    await sembrarValor(page, '#deltaP', 20);
    await expect(fila(page, '→ ΔQ')).toHaveText(re(pct('+7,0')));
    test.fail();
    await expect(interpretacion(page)).not.toContainText('compradores', { timeout: 2000 });
  });

  test('ABIERTO · la ficha del café dice «Elástica pero no unitaria» con |Ed| = 0,80 (inelástica)', async ({ page }) => {
    await abrir(page);
    await elegirBien(page, 'Café de marca');
    await expect(insignia(page)).toContainText('Inelástica (|Ed| < 1)');
    test.fail();
    await expect(page.locator('p', { hasText: 'Tiene sustitutivos (otras marcas, té)' })).not.toContainText('Elástica pero no unitaria', { timeout: 2000 });
  });

  test('ABIERTO · la tabla llama «Perfectamente inelástica» a |Ed| = 0,10; la insignia dice «Inelástica»', async ({ page }) => {
    await abrir(page);
    await elegirBien(page, 'Insulina');
    await expect(insignia(page)).toContainText('Inelástica (|Ed| < 1)');
    const filaInsulina = page.locator('table tbody tr', { hasText: 'Insulina' });
    await expect(filaInsulina.locator('td').nth(1)).toHaveText('0,10');
    test.fail();
    await expect(filaInsulina.locator('td').nth(2)).not.toHaveText('Perfectamente inelástica', { timeout: 2000 });
  });

  test('ABIERTO · features promete clasificar «perfectamente inelástica» y «unitaria», y ningún bien las da', async ({ page }) => {
    await abrir(page);
    const features = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; featureList?: string[] | string };
        if (j['@type'] === 'WebApplication') return ([] as string[]).concat(j.featureList ?? []);
      }
      return [] as string[];
    });
    expect(features.length).toBeGreaterThan(0);
    const vistas = new Set<string>();
    for (const b of ['Insulina', 'Sal de mesa', 'Gasolina', 'Café de marca', 'Smartphone gama alta', 'Vuelo turístico']) {
      await elegirBien(page, b);
      vistas.add(((await insignia(page).locator('span').first().textContent()) ?? '').trim());
    }
    expect([...vistas].sort()).toEqual(['Elástica (|Ed| > 1)', 'Inelástica (|Ed| < 1)']);
    const prometeUnitaria = features.some((f) => /unitaria/i.test(f));
    test.fail();
    expect(prometeUnitaria && ![...vistas].some((v) => /Unitaria/.test(v)), `features: ${features.join(' · ')}`).toBe(false);
  });

  test('ABIERTO · la FAQ de los factores va dos veces, con dos redacciones', async ({ page }) => {
    // FAQPage: «¿Qué factores hacen que una demanda sea más elástica?» · visible: «¿Qué factores
    // determinan la elasticidad?», con los mismos cuatro factores escritos por separado.
    await abrir(page);
    const faq = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { name: string }[] };
        if (j['@type'] !== 'FAQPage') continue;
        const q = (j.mainEntity ?? []).find((e) => /factores/.test(e.name));
        if (q) return q.name;
      }
      return null;
    });
    expect(faq).not.toBeNull();
    const visible = page.locator('strong', { hasText: /factores/ });
    await expect(visible).toHaveCount(1);
    test.fail();
    await expect(visible).toHaveText(faq ?? '', { timeout: 2000 });
  });

  test('ABIERTO · dos frases del bloque educativo: «P y Q muy pequeños» y «el adicto paga lo que sea»', async ({ page }) => {
    // |Ed| = |ΔQ/ΔP| × P/Q: lo que hace elástica una curva empinada es P/Q grande, no P y Q pequeños.
    // «Paga lo que sea» es |Ed| = 0, y la propia página da al tabaco |Ed| ≈ 0,4 (−4 % por +10 %).
    await abrir(page);
    const texto = await page.evaluate(() => (document.body.textContent ?? '').replace(/\s+/g, ' '));
    expect(texto).toContain('El tabaco tiene |Ed| ≈ 0,4');
    test.fail();
    expect.soft(texto).not.toContain('si los valores de P y Q son muy pequeños');
    expect.soft(texto).not.toContain('el adicto paga lo que sea');
  });

  test('ABIERTO · los porcentajes van pegados («+20%»); con espacio duro: «+20 %»', async ({ page }) => {
    await abrir(page);
    await elegirBien(page, 'Gasolina');
    await sembrarValor(page, '#deltaP', 20);
    await expect(fila(page, 'Precio nuevo')).toHaveText('1,98 €');
    test.fail();
    expect(await page.locator('#deltaP + span').textContent()).toBe(`+20${ESPACIO_DURO}%`);
    expect(await fila(page, '→ ΔQ').textContent()).toBe(`-7,0${ESPACIO_DURO}%`);
  });
});
