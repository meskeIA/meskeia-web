import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada, sembrarValor, sembrarValorAcotado } from './_hidratacion';

/**
 * Inspector — visualizador-computacion-cuantica (segmento cálculo, riesgo 3)
 *
 * Primera inspección: 25/09/2026. La app promete en su <h1> «Computación Cuántica» y en la
 * metadata «qubits vs bits, superposición, puertas cuánticas, paralelismo cuántico y por qué
 * amenaza el cifrado RSA». NO es un compositor de circuitos: no aplica puertas a un estado, así que
 * los casos de Bell, H·H = I o CNOT con control = objetivo no tienen dónde ejecutarse. Lo que
 * calcula es:
 *   · la regla de Born sobre la esfera de Bloch: estado cos(θ/2)|0⟩ + sin(θ/2)|1⟩ →
 *     P(0) = cos²(θ/2), P(1) = sin²(θ/2), con θ en un deslizador de 0° a 180° (page.tsx:240-242);
 *   · la medición: colapsa a 0 con probabilidad P(0) (page.tsx:224-229);
 *   · 2ⁿ estados con n de 1 a 20 (page.tsx:142-148) y una comparativa con barras;
 *   · las tablas de verdad de X, H, CNOT y Z (page.tsx:39-90);
 *   · un «byte cuántico» de 8 bits con su valor decimal (page.tsx:235-238).
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   (script propio con matrices 2×2 y 4×4, no el código de la app)
 *   Normal   · θ = 90° → P(0) = cos²45° = 0,5 → 50,0 % / 50,0 %
 *              θ = 60° → cos²30° = 0,75 → 75,0 % / 25,0 % · θ = 120° → 25,0 % / 75,0 %
 *              X|0⟩ = |1⟩ · H|0⟩ = (|0⟩+|1⟩)/√2 · H|1⟩ = (|0⟩−|1⟩)/√2 · Z|1⟩ = −|1⟩
 *              CNOT (control a la izquierda): |10⟩ → |11⟩, |11⟩ → |10⟩, |00⟩ y |01⟩ fijos
 *              2¹⁰ = 1024 (cuatro cifras: sin punto) · 2¹⁴ = 16.384 · 2²⁰ = 1.048.576
 *   Límite   · θ = 0° → 100,0 % / 0,0 % y la medición da |0⟩ siempre; θ = 180° → 0,0 % / 100,0 %
 *              (cos²90° = 3,7·10⁻³³) y da |1⟩ siempre · n = 1 → 2 estados
 *              2⁵⁰ = 1.125.899.906.842.624 ≈ 1,126·10¹⁵ = «~1.126 billones» (escala larga)
 *              tras medir, el estado ES |k⟩: P(|k⟩) = 100 %
 *   Rechazo  · θ = 270° o −30° y n = 64 no existen: el deslizador los capa a 180°, 0° y 20
 *              · un byte cuya cadena binaria no case con su decimal no debe ocurrir nunca
 *
 * FUENTES DE LAS CIFRAS DIVULGATIVAS (consultadas el 25/09/2026)
 *   · Gidney y Ekerå (2019), arXiv:1905.09749: RSA-2048 en 8 horas con 20 millones de qubits
 *     ruidosos y 3n + 0,002·n·lg n ≈ 6.189 qubits lógicos.
 *   · Gidney (21/05/2025), arXiv:2505.15917: menos de un millón de qubits ruidosos, menos de una
 *     semana, ~1.400 qubits lógicos (tabla 5).
 *   · Beauregard (2003), arXiv:quant-ph/0205095: circuito de 2n + 3 = 4.099 qubits, sin tiempo.
 *   · NIST, 13/08/2024: FIPS 203 (ML-KEM, Kyber), 204 (ML-DSA, Dilithium) y 205 (SLH-DSA,
 *     SPHINCS+) finales; FALCON (FIPS 206, FN-DSA) solo «planned» como borrador.
 *   · IBM, 22/10/2019 (Pednault et al.): la tarea de Sycamore en 2,5 días, no 10.000 años;
 *     Pan, Chen y Zhang, PRL 129, 090502 (2022): simulada en ~15 h con 512 GPU.
 *   · Bennett, Bernstein, Brassard y Vazirani, SIAM J. Comput. 26(5) (1997): una búsqueda no
 *     estructurada no baja de ~√N consultas en un ordenador cuántico.
 *   · RSA-155 (512 bits) factorizado con ordenadores clásicos el 22/08/1999.
 *
 * HALLAZGOS REPARADOS el 26/09/2026 (fichas 2083-2100; antes con test.fail)
 *   CASO 10 alto   · 2⁵⁰ se daba como «~1.125 billones de billones» (1,1·10²⁷): son ~1.126 billones.
 *   CASO 11 medio  · las barras de la comparativa medían todas lo mismo (flex: 1 pisaba el width).
 *   CASO 12 medio  · tras medir, P(|0⟩) y P(|1⟩) seguían en 50/50 junto a «Colapsado a |k⟩».
 *   CASO 13 medio  · formato: «50.0%» (toFixed) en vez de «50,0 %».
 *   CASO 14 bajo   · «1 bits clásicos», «1 qubits → 2 estados».
 *   CASO 15 medio  · #dc2626 en línea y sin variante oscura.
 *   CASO 16 medio  · #16a34a por debajo de 4,5:1.
 *   CASO 17 medio  · texto en var(--secondary) por debajo de 3:1.
 *   CASO 18 bajo   · botón «Medir qubit» sobre var(--primary) y kets en var(--primary).
 *   CASO 19 medio  · «probando TODOS los caminos a la vez»: el mito que el propio campo desmiente.
 *   CASO 20 medio  · «4.000 qubits lógicos → ~8 horas» no salía de ninguna fuente única.
 *   CASO 21 bajo   · FALCON como «estandarizada por NIST 2024».
 *   CASO 22 bajo   · «Sycamore … demostró supremacía cuántica en 2019».
 *   CASO 23 bajo   · «Claves RSA-512» en riesgo cuántico a partir de 2029 (rotas en 1999).
 *   CASO 24 bajo   · la bombilla (role="button") no respondía a la barra espaciadora.
 *   CASO 25 bajo   · emoji ⚛️ del hero sin aria-hidden.
 *   CASO 26 bajo   · «el único generador de aleatoriedad perfecta del universo» con Math.random.
 *   CASO 27 bajo   · «El error de corrección cuántica (QEC)».
 *
 * La reparación de 2093 retiró la tabla de «qubits lógicos estimados» por año (sin fuente): el
 * deslizador del año muestra ahora el calendario del borrador NIST IR 8547 (12/11/2024, tablas 2 y 4):
 * 112 bits de seguridad (RSA-2048, ECC de 224 bits) «deprecated after 2030», todo RSA/ECC
 * «disallowed after 2035». Por eso los casos 15, 16 y 23 buscan esas etiquetas y no «En riesgo:».
 */

const RUTA = '/visualizador-computacion-cuantica/';

const THETA = 'input[aria-label="Ángulo de superposición del qubit en grados"]';
const QUBITS = 'input[aria-label="Número de qubits para calcular los estados de la superposición"]';
const ANO = 'input[aria-label="Selecciona el año para ver el calendario de retirada de RSA y ECC"]';

const MEDIR = 'button[aria-label="Medir el qubit y colapsar su estado"]';
const RESTAURAR = 'button[aria-label="Restaurar el qubit a superposición"]';
const BYTE = 'button[aria-label="Simular un byte cuántico aleatorio"]';

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [THETA, QUBITS, ANO]);
}

/** Texto crudo de P(|0⟩) y P(|1⟩), en ese orden. */
async function probabilidadesTexto(page: Page): Promise<[string, string]> {
  const t = await page.locator('[class*="probValor"]').allTextContents();
  return [t[0].trim(), t[1].trim()];
}

/** Las dos probabilidades como número, acepten coma o punto (el formato se vigila aparte). */
async function probabilidades(page: Page): Promise<[number, number]> {
  const [a, b] = await probabilidadesTexto(page);
  const num = (s: string): number => Number(s.replace(/[\s %]/g, '').replace(',', '.'));
  return [num(a), num(b)];
}

const estadoMedicion = (page: Page): Locator => page.locator('p[class*="colapsado"]');

/**
 * Filas de la comparativa: etiqueta, valor y la anchura PINTADA de la barra. Desde la reparación de
 * 2084 la barra vive dentro de una pista (`pistaBarra`) que ocupa el hueco de la fila: se mide la
 * barra, no la pista.
 */
async function filasComparativa(page: Page): Promise<{ etiqueta: string; valor: string; ancho: number }[]> {
  return page.locator('[class*="comparativaQubits"] > div').evaluateAll((filas) =>
    filas.map((f) => ({
      etiqueta: (f.querySelector('[class*="filaQubitsEtiqueta"]')?.textContent ?? '').trim(),
      valor: (f.querySelector('[class*="filaQubitsValor"]')?.textContent ?? '').trim(),
      ancho: f.querySelector('[class*="barraQubits"]')?.getBoundingClientRect().width ?? -1,
    })),
  );
}

/** Lee una medida hasta que deja de moverse (el color transiciona al cambiar de tema). */
async function esperarEstable<T>(leer: () => Promise<T>): Promise<T> {
  let anterior = await leer();
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 100));
    const actual = await leer();
    if (JSON.stringify(actual) === JSON.stringify(anterior)) return actual;
    anterior = actual;
  }
  return anterior;
}

/**
 * Contraste WCAG del texto contra su fondo EFECTIVO (translúcidos compuestos sobre el primer
 * opaco). En un <text> de SVG el color del texto es su `fill`.
 */
async function contrasteEfectivo(el: Locator): Promise<number> {
  return el.evaluate((nodo) => {
    const rgba = (c: string): number[] => {
      const n = (c.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const capas: number[][] = [];
    for (let e: Element | null = nodo; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let fondo = [255, 255, 255];
    for (const c of capas.reverse()) fondo = fondo.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
    const lum = ([r, g, b]: number[]): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const cs = getComputedStyle(nodo);
    const texto = nodo instanceof SVGElement ? cs.fill : cs.color;
    const a = lum(rgba(texto));
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

async function pasarAOscuro(page: Page): Promise<void> {
  await esperarPaginaAsentada(page);
  await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

/** El menor contraste de una lista de elementos, en el tema que esté activo. */
async function peorContraste(elementos: Locator[]): Promise<number> {
  let peor = Infinity;
  for (const el of elementos) {
    await expect(el).toBeVisible();
    peor = Math.min(peor, await esperarEstable(() => contrasteEfectivo(el)));
  }
  return peor;
}

test.describe('visualizador-computacion-cuantica — lo que calcula', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // ───────────────────────── Casos que hoy se cumplen ─────────────────────────

  test('CASO 1 · θ = 90° → P(|0⟩) = P(|1⟩) = 50 % (cos²45° = 0,5), en superposición', async ({ page }) => {
    await sembrarValor(page, THETA, 45);
    await sembrarValor(page, THETA, 90);
    const [p0, p1] = await probabilidades(page);
    expect(p0).toBeCloseTo(50.0, 5);
    expect(p1).toBeCloseTo(50.0, 5);
    await expect(estadoMedicion(page)).toHaveText('En superposición — aún no medido');
    await expect(page.locator('svg[role="img"][aria-label^="Esfera de Bloch"]')).toHaveAttribute('aria-label', 'Esfera de Bloch con ángulo θ = 90°');
  });

  test('CASO 2 · θ = 60° → 75 % / 25 % y θ = 120° → 25 % / 75 % (cos²30° = 0,75); suman 100 %', async ({ page }) => {
    await sembrarValor(page, THETA, 60);
    let [p0, p1] = await probabilidades(page);
    expect(p0).toBeCloseTo(75.0, 5);
    expect(p1).toBeCloseTo(25.0, 5);
    expect(p0 + p1).toBeCloseTo(100, 5);
    await sembrarValor(page, THETA, 120);
    [p0, p1] = await probabilidades(page);
    expect(p0).toBeCloseTo(25.0, 5);
    expect(p1).toBeCloseTo(75.0, 5);
  });

  test('CASO 3 · límites: θ = 0° → 100/0 y mide |0⟩; θ = 180° → 0/100 y mide |1⟩ (deterministas)', async ({ page }) => {
    await sembrarValor(page, THETA, 0);
    expect(await probabilidades(page)).toEqual([100, 0]);
    await page.locator(MEDIR).click();
    await expect(estadoMedicion(page)).toHaveText('Colapsado a |0⟩ tras la medición');
    await page.locator(RESTAURAR).click();
    await expect(estadoMedicion(page)).toHaveText('En superposición — aún no medido');

    await sembrarValor(page, THETA, 180);
    expect(await probabilidades(page)).toEqual([0, 100]);
    await page.locator(MEDIR).click();
    await expect(estadoMedicion(page)).toHaveText('Colapsado a |1⟩ tras la medición');
  });

  test('CASO 4 · rechazo: θ = 270° y −30° se capan a 180° y 0°; n = 64 se capa a 20', async ({ page }) => {
    expect(await sembrarValorAcotado(page, THETA, 270)).toBe('180');
    expect(await probabilidades(page)).toEqual([0, 100]);
    expect(await sembrarValorAcotado(page, THETA, -30)).toBe('0');
    expect(await probabilidades(page)).toEqual([100, 0]);
    expect(await sembrarValorAcotado(page, QUBITS, 64)).toBe('20');
    await expect(page.locator('[class*="estadosNumero"]')).toHaveText('1.048.576');
  });

  test('CASO 5 · 2ⁿ: n = 1 → 2, n = 10 → 1024 (cuatro cifras, sin punto), 14 → 16.384, 20 → 1.048.576', async ({ page }) => {
    const numero = page.locator('[class*="estadosNumero"]');
    await sembrarValor(page, QUBITS, 1);
    await expect(numero).toHaveText('2');
    await sembrarValor(page, QUBITS, 10);
    await expect(numero).toHaveText('1024');
    await sembrarValor(page, QUBITS, 14);
    await expect(numero).toHaveText('16.384');
    await sembrarValor(page, QUBITS, 20);
    await expect(numero).toHaveText('1.048.576');
  });

  test('CASO 6 · tablas de X, H, CNOT y Z = las matrices (X|0⟩=|1⟩, H|1⟩=(|0⟩−|1⟩)/√2, CNOT|10⟩=|11⟩, Z|1⟩=−|1⟩)', async ({ page }) => {
    const esperado: Record<string, string[][]> = {
      'NOT Cuántico': [['|0⟩', '|1⟩'], ['|1⟩', '|0⟩']],
      Hadamard: [['|0⟩', '(|0⟩+|1⟩)/√2'], ['|1⟩', '(|0⟩−|1⟩)/√2']],
      'CNOT (Controlled-NOT)': [['|00⟩', '|00⟩'], ['|01⟩', '|01⟩'], ['|10⟩', '|11⟩'], ['|11⟩', '|10⟩']],
      'Puerta de Fase': [['|0⟩', '|0⟩'], ['|1⟩', '−|1⟩']],
    };
    for (const [nombre, filas] of Object.entries(esperado)) {
      const boton = page.getByRole('button', { name: new RegExp(`^Puerta cuántica ${nombre.replace(/[()]/g, '\\$&')}\\.`) });
      if ((await boton.getAttribute('aria-pressed')) !== 'true') await boton.click();
      await expect(boton).toHaveAttribute('aria-pressed', 'true');
      const tabla = page.getByRole('region', { name: `Detalle de la puerta ${nombre}` }).locator('tbody tr');
      const leidas = await tabla.evaluateAll((trs) => trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => (td.textContent ?? '').trim())));
      expect(leidas, nombre).toEqual(filas);
    }
  });

  test('CASO 7 · el byte: 8 bits y su decimal casan siempre (40 generaciones, 0-255)', async ({ page }) => {
    const salida = page.locator('[class*="circuitoNumeroAleatorio"]');
    for (let i = 0; i < 40; i++) {
      await page.locator(BYTE).click();
      const t = (await salida.textContent()) ?? '';
      const m = t.match(/^0b([01]{8}) = (\d+)$/);
      expect(m, t).not.toBeNull();
      const valor = Number(m![2]);
      expect(valor).toBe(parseInt(m![1], 2));
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThanOrEqual(255);
    }
  });

  test('CASO 8 · la medición a θ = 60° sigue la regla de Born (P(0) = 0,75; 200 medidas, ±5σ)', async ({ page }) => {
    await sembrarValor(page, THETA, 60);
    let ceros = 0;
    for (let i = 0; i < 200; i++) {
      await page.locator(MEDIR).click();
      const t = (await estadoMedicion(page).textContent()) ?? '';
      if (t.includes('|0⟩')) ceros++;
      await page.locator(RESTAURAR).click();
    }
    // media 150, σ = √(200·0,75·0,25) = 6,12 → [119, 181] a ±5σ (un fallo espurio cada ~3 millones)
    expect(ceros).toBeGreaterThanOrEqual(119);
    expect(ceros).toBeLessThanOrEqual(181);
  });

  // ───────────────────────── Hallazgos abiertos ─────────────────────────

  /**
   * CASO 10 (alto, cálculo) — page.tsx:435 y :442. 2⁵⁰ = 1.125.899.906.842.624 ≈ 1,126·10¹⁵, que en
   * la escala larga del español son ~1.126 billones. «~1.125 billones de billones» son
   * 1.125·10²⁴ = 1,125·10²⁷: un billón de veces más (probable traducción de «1.125 quadrillion»).
   */
  test('CASO 10 · 50 qubits → ~1.126 billones de estados (2⁵⁰ ≈ 1,126·10¹⁵), no «billones de billones»', async ({ page }) => {
    const filas = await filasComparativa(page);
    const cincuenta = filas.find((f) => f.etiqueta === '50 qubits');
    expect(cincuenta).toBeDefined();
    expect(cincuenta!.valor).not.toMatch(/billones de billones/);
    // «1126 billones»: con cuatro cifras enteras el español no agrupa (RAE 2010; Intl es-ES),
    // así que no se exige el punto de «1.126» que proponía el acta.
    expect(cincuenta!.valor).toMatch(/~112[56] billones/);
    await expect(page.locator('[class*="analogia"]')).not.toContainText('billones de billones');
  });

  /**
   * CASO 11 (medio, cálculo) — la comparativa (page.tsx:245-249, 425, 434) pinta cada barra con un
   * `width` en línea, pero `.barraQubits` lleva `flex: 1` (CSS:335-342), que la estira a todo el
   * hueco: todas miden 470 px en escritorio y 4 px a 360 px. Aunque el width mandara, sería 50 % fijo
   * para 1 estado, n/20 lineal para 2ⁿ y 100 % para 20 y para 50 qubits.
   */
  test('CASO 11 · la barra de 1 estado es más corta que la de 1.048.576, y la de 20 qubits que la de 50', async ({ page }) => {
    await sembrarValor(page, QUBITS, 1);
    await expect(page.locator('[class*="estadosNumero"]')).toHaveText('2');
    const filas = await filasComparativa(page);
    // filas: [1 bit clásico → 1 estado, 1 qubit → 2, 20 qubits → 1.048.576, 50 qubits → 2⁵⁰]
    expect(filas[0].ancho).toBeLessThan(filas[2].ancho);
    expect(filas[2].ancho).toBeLessThan(filas[3].ancho);
    // Escala logarítmica: 20 qubits = 20/50 de la barra de 50 (±2 px de redondeo y del mínimo de 4 px)
    expect(Math.abs(filas[2].ancho - 0.4 * filas[3].ancho)).toBeLessThanOrEqual(2);
  });

  test('CASO 11b · a 360 px las barras también se distinguen (antes, 4 px las cuatro)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await sembrarValor(page, QUBITS, 10);
    const filas = await filasComparativa(page);
    expect(filas[3].ancho).toBeGreaterThan(150);
    expect(filas[1].ancho).toBeGreaterThan(filas[0].ancho);
    expect(filas[2].ancho).toBeGreaterThan(filas[1].ancho);
    expect(filas[3].ancho).toBeGreaterThan(filas[2].ancho);
    // Y sin desbordar la página
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde).toBeLessThanOrEqual(0);
  });

  /**
   * CASO 12 (medio, cálculo) — page.tsx:240-242 y 323-329 calculan P(|0⟩) y P(|1⟩) solo con θ, sin
   * mirar `resultadoMedicion`: tras medir a 90°, la esfera apunta a |k⟩ y el estado dice «Colapsado a
   * |k⟩», pero las probabilidades siguen en 50/50. Después de medir, el estado ES |k⟩: P(|k⟩) = 100 %.
   */
  test('CASO 12 · tras medir a θ = 90° y colapsar a |k⟩, P(|k⟩) = 100 %', async ({ page }) => {
    await page.locator(MEDIR).click();
    const t = (await estadoMedicion(page).textContent()) ?? '';
    const k = t.includes('|0⟩') ? 0 : 1;
    const p = await probabilidades(page);
    expect(p[k]).toBeCloseTo(100, 5);
    expect(p[1 - k]).toBeCloseTo(0, 5);
  });

  /**
   * CASO 13 (medio, contenido) — page.tsx:241-242 formatea con `toFixed(1)` y pega el signo: «50.0%»,
   * con punto decimal. En español: «50,0 %» con espacio duro (U+00A0). En la misma pantalla,
   * page.tsx:588-589 escribe «4000» (toLocaleString) al lado de «~4.000».
   */
  test('CASO 13 · θ = 60° → «75,0 %» y «25,0 %» (coma decimal y espacio duro)', async ({ page }) => {
    await sembrarValor(page, THETA, 60);
    expect(await probabilidadesTexto(page)).toEqual(['75,0 %', '25,0 %']);
  });

  /** CASO 14 (bajo, contenido) — page.tsx:246-247 y 396 no concuerdan el plural con n = 1. */
  test('CASO 14 · n = 1 → «1 bit clásico» y «1 qubit», no «1 bits» ni «1 qubits»', async ({ page }) => {
    await sembrarValor(page, QUBITS, 1);
    const filas = await filasComparativa(page);
    expect(filas[0].etiqueta).toBe('1 bit clásico');
    expect(filas[1].etiqueta).toBe('1 qubit');
    await expect(page.locator('[class*="sliderLabel"] strong').nth(1)).not.toContainText('1 qubits');
  });

  /**
   * CASO 15 (medio, accesibilidad) — #dc2626 en línea sin variante oscura en «No» y en la etiqueta de
   * riesgo, más .riesgoChip y .timelineTiempoRojo. Texto de 12,8-17,6 px: exige 4,5:1.
   * Medido antes: claro «No» 4,22 · «En riesgo:» 4,08 · chip 3,52; oscuro 2,33 · 3,03 · 2,90.
   * Tras la reparación de 2093 la etiqueta roja es «Desaconsejados desde 2031:» (año 2033).
   */
  test('CASO 15 · «No», la etiqueta de retirada, sus chips y el récord clásico alcanzan 4,5:1 en ambos temas', async ({ page }) => {
    await sembrarValor(page, ANO, 2033);
    const rojos = [
      page.locator('[class*="probFila"] span', { hasText: /^No$/ }),
      page.locator('p', { hasText: /^Desaconsejados desde 2031:$/ }),
      page.locator('[class*="riesgoChip"]:not([class*="riesgoChipOk"]):not([class*="riesgoChipNeutro"])').first(),
      page.locator('[class*="timelineTiempoRojo"]'),
    ];
    await esperarPaginaAsentada(page);
    expect(await peorContraste(rojos), 'en claro').toBeGreaterThanOrEqual(4.5);
    await pasarAOscuro(page);
    expect(await peorContraste(rojos), 'en oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * CASO 16 (medio, accesibilidad) — #16a34a en «~8 horas…» (CSS:588-590; 17,6 px en negrita, que no
   * llega a texto grande), «Seguros / post-cuánticos:» (page.tsx:605) y .riesgoChipOk (CSS:632-640).
   * Medido en claro: 3,16 · 2,79 · 2,52; en oscuro: 4,44 · 4,44 · 3,89.
   */
  test('CASO 16 · los verdes (estimaciones cuánticas, «Estándares post-cuánticos…», chips) alcanzan 4,5:1', async ({ page }) => {
    await sembrarValor(page, ANO, 2030);
    const verdes = [
      page.locator('[class*="timelineTiempoVerde"]').first(),
      page.locator('p', { hasText: /^Estándares post-cuánticos ya publicados:$/ }),
      page.locator('[class*="riesgoChipOk"]').first(),
    ];
    await esperarPaginaAsentada(page);
    expect(await peorContraste(verdes), 'en claro').toBeGreaterThanOrEqual(4.5);
    await pasarAOscuro(page);
    expect(await peorContraste(verdes), 'en oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * CASO 17 (medio, accesibilidad) — var(--secondary) como color de texto en claro: el estado de la
   * medición (.colapsado, CSS:275-281, role="status"), la analogía de la puerta (CSS:462-466) y el
   * título de la criptografía post-cuántica (CSS:650-657). Medido: 2,68 · 2,61 · 2,39.
   */
  test('CASO 17 · el estado de la medición y los textos en teal alcanzan 4,5:1 en claro y en oscuro', async ({ page }) => {
    const teal: [string, Locator][] = [
      ['estado de la medición', estadoMedicion(page)],
      ['analogía de la puerta', page.locator('p[class*="puertaAnalogia"]')],
      ['título post-cuántico', page.locator('p[class*="postQuantumTitle"]')],
    ];
    await esperarPaginaAsentada(page);
    for (const [nombre, el] of teal) expect(await peorContraste([el]), `${nombre}, en claro`).toBeGreaterThanOrEqual(4.5);
    await pasarAOscuro(page);
    for (const [nombre, el] of teal) expect(await peorContraste([el]), `${nombre}, en oscuro`).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * CASO 18 (bajo, accesibilidad) — .btnPrimario (CSS:112-125) es blanco sobre var(--primary), que en
   * oscuro vale #3FA5D1: 2,79:1 (en claro, 4,11:1). Los kets P(|0⟩)/P(|1⟩) (CSS:264-268) dan 3,59:1
   * en claro. Es el pasivo conocido del color de marca: existe --primary-boton para los fondos.
   */
  test('CASO 18 · «Medir qubit» en oscuro y los kets en claro alcanzan 4,5:1', async ({ page }) => {
    await esperarPaginaAsentada(page);
    expect(await peorContraste([page.locator('[class*="probKet"]').first()]), 'ket en claro').toBeGreaterThanOrEqual(4.5);
    await pasarAOscuro(page);
    expect(await peorContraste([page.locator(MEDIR)]), 'botón en oscuro').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * CASO 19 (medio, contenido) — page.tsx:389 y 440-442: «probando TODOS los caminos a la vez» es el
   * malentendido más citado de la divulgación cuántica. Bennett, Bernstein, Brassard y Vazirani
   * (1997) probaron que una búsqueda sin estructura no baja de ~√N consultas: medir da UN resultado y
   * la ventaja sale de la interferencia, no de probar las rutas en paralelo.
   */
  test('CASO 19 · la analogía no dice que 50 qubits prueban todas las rutas a la vez', async ({ page }) => {
    const analogia = page.locator('[class*="analogia"]');
    await expect(analogia).not.toContainText('TODOS los caminos a la vez');
    await expect(analogia).not.toContainText('rutas simultáneamente');
  });

  /**
   * CASO 20 (medio, dato) — page.tsx:557-558 empareja «4.000 qubits lógicos» con «~8 horas». Las
   * 8 horas son de Gidney y Ekerå (2019) con 20 millones de qubits físicos y ≈ 6.189 lógicos; los
   * ~4.000 (2n+3 = 4.099) son el circuito de Beauregard (2003), que no da tiempo; y la estimación
   * vigente (Gidney, 2025) es < 1 millón de físicos, ~1.400 lógicos, < 1 semana. Tampoco tienen
   * fuente los «~300 billones de años» (l. 551) ni la tabla de qubits lógicos por año (l. 92-140).
   */
  test('CASO 20 · la fila cuántica de RSA-2048 no empareja «4.000 qubits lógicos» con «~8 horas»', async ({ page }) => {
    const linea = page.locator('[class*="timelineRSA"]');
    await expect(linea).toContainText('RSA-2048');
    const texto = (await linea.textContent()) ?? '';
    expect(texto).not.toMatch(/4\.000 qubits lógicos[\s\S]*~8 horas/);
    expect(texto).not.toContain('300 billones de años');
    // Cada cifra, con su fuente: 8 h con 20 millones (Gidney y Ekerå 2019); < 1 semana con < 1 millón (Gidney 2025)
    expect(texto).toMatch(/20 millones de qubits físicos[\s\S]*8 horas[\s\S]*Gidney y Ekerå \(2019\)/);
    expect(texto).toMatch(/Menos de 1 millón[\s\S]*menos de una semana[\s\S]*Gidney \(21\/05\/2025\)/);
    // La tabla de «qubits lógicos estimados» por año (sin fuente) ya no existe
    await expect(page.locator('main')).not.toContainText('Qubits lógicos estimados');
  });

  /**
   * CASO 21 (bajo, dato) — page.tsx:618-623: el NIST publicó el 13/08/2024 FIPS 203, 204 y 205 (Kyber,
   * Dilithium, SPHINCS+); FALCON (FIPS 206, FN-DSA) quedó como borrador pendiente.
   */
  test('CASO 21 · la lista de estándares del NIST del 13/08/2024 no incluye FALCON (sigue en proceso)', async ({ page }) => {
    const bloque = page.locator('[class*="postQuantum"]').filter({ has: page.locator('ul') });
    await expect(bloque).toContainText('13/08/2024');
    const items = await bloque.locator('li').allTextContents();
    expect(items).toHaveLength(3);
    expect(items.join(' ')).not.toContain('FALCON');
    expect(items.join(' ')).toMatch(/FIPS 203[\s\S]*FIPS 204[\s\S]*FIPS 205/);
    await expect(bloque).toContainText('En proceso de estandarización: FN-DSA (FALCON)');
  });

  /**
   * CASO 22 (bajo, contenido) — page.tsx:663: «demostró supremacía cuántica» para un resultado
   * contestado: IBM (22/10/2019) lo rebajó de 10.000 años a 2,5 días, y Pan, Chen y Zhang (PRL 2022)
   * lo simularon en ~15 h con 512 GPU. Antipatrón 3 de neutralidad: «anunció», «afirmó».
   */
  test('CASO 22 · la guía no dice que Sycamore «demostró» la supremacía cuántica', async ({ page }) => {
    const texto = (await page.locator('main').textContent()) ?? '';
    expect(texto).toContain('Sycamore');
    expect(texto).not.toMatch(/demostró supremacía cuántica/);
  });

  /**
   * CASO 23 (bajo, dato) — page.tsx:117 pone «Claves RSA-512» en riesgo a partir de 2029, como amenaza
   * cuántica futura; RSA-155 (512 bits) se factorizó con ordenadores clásicos el 22/08/1999.
   */
  test('CASO 23 · en 2029 «RSA-512» no aparece como riesgo cuántico nuevo; el calendario sigue al NIST IR 8547', async ({ page }) => {
    const chipsRojos = page.locator('[class*="riesgoChip"]:not([class*="riesgoChipOk"]):not([class*="riesgoChipNeutro"])');
    await sembrarValor(page, ANO, 2029);
    const region = page.getByRole('region', { name: 'Calendario para el año 2029' });
    await expect(region).toContainText('NIST IR 8547');
    await expect(region).not.toContainText('RSA-512');
    expect(await chipsRojos.count()).toBe(0);
    // 2030 todavía admitido («deprecated after 2030»); 2031, desaconsejado; 2036, no admitido
    await sembrarValor(page, ANO, 2030);
    expect(await chipsRojos.count()).toBe(0);
    await sembrarValor(page, ANO, 2031);
    expect(await chipsRojos.allTextContents()).toEqual(['RSA-2048', 'ECC de 224 bits']);
    await sembrarValor(page, ANO, 2036);
    await expect(page.getByRole('region', { name: 'Calendario para el año 2036' })).toContainText('No admitidos desde 2036:');
    expect(await chipsRojos.allTextContents()).toContain('RSA-3072 o mayor');
  });

  /**
   * CASO 24 (bajo, accesibilidad) — page.tsx:291-298: la bombilla es un <span role="button"> que solo
   * escucha Enter; con la barra espaciadora no cambia y la página se desplaza.
   */
  test('CASO 24 · la barra espaciadora conmuta el bit clásico', async ({ page }) => {
    const bombilla = page.locator('[aria-label^="Bit clásico:"]');
    await expect(bombilla).toHaveAttribute('aria-label', 'Bit clásico: 0. Haz clic para cambiar');
    await bombilla.focus();
    await page.keyboard.press('Space');
    await expect(bombilla).toHaveAttribute('aria-label', 'Bit clásico: 1. Haz clic para cambiar', { timeout: 1500 });
  });

  /** CASO 25 (bajo, accesibilidad) — page.tsx:261, lo señala `node scripts/check-a11y-jsx.mjs`. */
  test('CASO 25 · el emoji ⚛️ del hero va en un aria-hidden', async ({ page }) => {
    const oculto = await page.locator('[class*="heroBadge"]').evaluate((badge) => {
      const nodos: Node[] = [];
      const w = document.createTreeWalker(badge, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) if ((n.textContent ?? '').includes('⚛')) nodos.push(n);
      return nodos.length > 0 && nodos.every((n) => Boolean(n.parentElement?.closest('[aria-hidden="true"]')));
    });
    expect(oculto).toBe(true);
  });

  /**
   * CASO 26 (bajo, contenido) — page.tsx:508-509 llama al circuito «el único generador de aleatoriedad
   * perfecta del universo», y el botón «Generar byte cuántico» (l. 235-238) sale de Math.random, el
   * generador pseudoaleatorio del navegador: con Math.random fijado a 0,9 el byte es 0b11111111 = 255.
   */
  test('CASO 26 · no presenta el byte de Math.random como aleatoriedad perfecta y única del universo', async ({ page }) => {
    const bloque = page.locator('[class*="circuitoResultado"]');
    await expect(bloque).not.toContainText('único generador de aleatoriedad perfecta del universo');
    await expect(bloque).toContainText('Aquí se simula');
  });

  /** CASO 27 (bajo, contenido) — page.tsx:656: es «la corrección de errores cuánticos (QEC)». */
  test('CASO 27 · la guía nombra bien la corrección de errores cuánticos (QEC)', async ({ page }) => {
    const texto = (await page.locator('main').textContent()) ?? '';
    expect(texto).not.toContain('error de corrección cuántica');
  });
});
