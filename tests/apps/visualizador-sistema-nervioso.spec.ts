import { test, expect, type Page, type Locator } from '@playwright/test';
import { contrasteSobreFondoReal } from './_contraste';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * Inspector — visualizador-sistema-nervioso (segmento interactiva, riesgo 2). Primera inspección:
 * 08/11/2026.
 *
 * QUÉ PROMETE LA APP
 *   <h1> «El Sistema Nervioso»; subtítulo «Neuronas, sinapsis y neurotransmisores — tu red de
 *   comunicación interna». La metadata: «neurona interactiva, SNC vs SNP, sinapsis química y los
 *   6 neurotransmisores principales». Cuatro secciones con botones aria-pressed: la neurona (6
 *   partes pulsables en el SVG y en una rejilla), el árbol SNC/SNP (nodos desplegables), el
 *   potencial de acción en 5 fases y los 6 neurotransmisores (tarjetas role="button" con
 *   aria-expanded). No hay ningún input: la verdad comprobable son las cifras que pinta, que casen
 *   entre sí, con su FAQ y con el FAQPage, y que cada control haga lo que dice.
 *
 * DÓNDE VIVEN LOS DATOS
 *   Todo en app/visualizador-sistema-nervioso/page.tsx (PARTES_NEURONA, ARBOL_SN, FASES_SENAL,
 *   DATOS_SINAPSIS, NEUROTRANSMISORES, DATOS_CURIOSOS). Sin lib/ ni data/.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — pulsar «Axón» en la rejilla abre su ficha con «~1 metro» y deja
 *     aria-pressed="true" en ese botón y en el <g> «Axón: transmite la señal» del diagrama; Enter
 *     sobre el <g> de las dendritas abre «Dendritas». Cifras: 120 m/s × 3,6 = 432 km/h y
 *     120 / 2 = 60 veces (la tarjeta «Sin mielina: ~2 m/s»); la FAQ visible da 70-120 m/s para
 *     las A-alfa. SNP = 12 pares craneales + 31 espinales.
 *
 *   CASO 2 (límite) — la última fase, «Período refractario», da «~ -80 mV» y «1-2 ms»; volver a la
 *     primera da «-70 mV», y solo una fase queda pulsada. Eje del gráfico: si +40 mV está en y = 30
 *     y -70 mV en y = 150, un eje lineal pone -55 mV en y = 30 + 95·120/110 = 133,6, es decir,
 *     al 86,4 % del recorrido; la etiqueta «umbral» debe caber en el viewBox de 400. En 390 px no
 *     hay desbordamiento horizontal y las secciones responden al toque.
 *
 *   CASO 3 (rechazo) — un segundo clic en la parte abierta la cierra (aria-pressed vuelve a
 *     false); la tecla «a» sobre una parte enfocada no abre nada; Espacio la cierra sin desplazar
 *     la página. Un nodo hoja del árbol (Cerebro) no debería ser un botón que no hace nada.
 *
 * Los tres casos se ejecutaron antes con Playwright (node_modules/playwright, sin MCP) contra la
 * copia del Inspector y coincidieron con la resolución a mano en lo operativo. Los test.fail() son
 * hallazgos ABIERTOS de esta inspección: cuando se reparen, Playwright marcará el «fallo esperado»
 * como inesperado; entonces se quita el test.fail() y el comentario pasa a REPARADO.
 */

const RUTA = '/visualizador-sistema-nervioso/';

/** La app no tiene inputs: se espera a que React cuelgue sus props del primer botón de sección. */
async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('El Sistema Nervioso', { timeout: 60_000 });
  await page.waitForFunction(
    () => {
      const b = document.querySelector('nav[aria-label="Secciones del explicador"] button');
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
    },
    undefined,
    { timeout: 30_000 },
  );
}

function seccion(page: Page, nombre: string): Locator {
  return page.locator('nav[aria-label="Secciones del explicador"]').getByRole('button', { name: nombre });
}

const fichaParte = (page: Page): Locator => page.locator('[class*="parteDetalle"]');
const botonesParte = (page: Page): Locator => page.locator('button[class*="parteCard"]');
const botonesFase = (page: Page): Locator => page.locator('button[class*="faseBtn"]');
const tarjetasNt = (page: Page): Locator => page.locator('[class*="ntCard"]');
const nodoArbol = (page: Page, nombre: string): Locator =>
  page.locator('button[class*="arbolBtn"]').filter({ has: page.locator('strong').getByText(nombre, { exact: true }) });

async function textoDe(l: Locator): Promise<string> {
  return ((await l.textContent()) ?? '').replace(/\s+/g, ' ');
}

/** Contraste del texto de un SVG (su fill) contra el fondo de la caja HTML que lo contiene. */
async function contrasteSvg(texto: Locator): Promise<number> {
  return texto.evaluate((t) => {
    const rgba = (s: string): number[] => {
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const lum = ([r, g, b]: number[]): number => {
      const f = (c: number) => {
        const x = c / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: number[][] = [];
    for (let n: Element | null = t.closest('svg'); n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const A = lum(rgba(getComputedStyle(t).fill));
    const B = lum(fondo);
    return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05);
  });
}

test.describe('CASO 1 · normal', () => {
  test('«Axón» desde la rejilla abre su ficha con «~1 metro» y marca el mismo estado en el diagrama', async ({ page }) => {
    await abrir(page);
    await expect(seccion(page, 'La neurona')).toHaveAttribute('aria-pressed', 'true');
    await expect(botonesParte(page)).toHaveCount(6);
    const axon = page.getByRole('button', { name: 'Axón', exact: true });
    await axon.click();
    await expect(fichaParte(page).locator('h3')).toHaveText('Axón');
    await expect(fichaParte(page)).toContainText('El axón más largo del cuerpo mide ~1 metro');
    await expect(axon).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('g[aria-label="Axón: transmite la señal"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(botonesParte(page).and(page.locator('[aria-pressed="true"]'))).toHaveCount(1);

    // Con teclado sobre el diagrama: Enter en el <g> de las dendritas cambia la ficha.
    await page.locator('g[aria-label="Dendritas: reciben señales"]').focus();
    await page.keyboard.press('Enter');
    await expect(fichaParte(page).locator('h3')).toHaveText('Dendritas');
    await expect(axon).toHaveAttribute('aria-pressed', 'false');
  });

  test('las velocidades casan: 120 m/s × 3,6 = 432 km/h, 120 / 2 = 60 veces, FAQ 70-120 m/s', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Sinapsis y señal').click();
    const tarjetas = page.locator('[class*="datoCard"]');
    await expect(tarjetas.filter({ hasText: 'Con mielina: hasta 120 m/s' })).toContainText('Equivalente a 432 km/h');
    await expect(tarjetas.filter({ hasText: 'Sin mielina: ~2 m/s' })).toContainText('60 veces más despacio');
    await seccion(page, 'Neurotransmisores').click();
    const velocidad = page.locator('[class*="datoCard"]').filter({ hasText: 'Velocidad máxima' });
    await expect(velocidad.locator('[class*="datoValor"]')).toHaveText('120 m/s');
    await expect(velocidad).toContainText('Equivalente a 432 km/h');
    // La FAQ visible vive en la guía plegada, pero su texto está en el DOM.
    const guia = page.locator('[data-guia-educativa]');
    await expect(guia).toContainText('las fibras mielinizadas A-alfa alcanzan 70-120 m/s');
    await expect(guia).toContainText('Aproximadamente 86.000 millones (Azevedo et al., 2009)');
  });

  test('árbol: el SNP dice 12 pares craneales + 31 espinales y «Autónomo» despliega simpático y parasimpático', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Central vs periférico').click();
    await expect(nodoArbol(page, 'SNP (Periférico)')).toContainText('Craneales (12 pares) + espinales (31 pares)');
    const autonomo = nodoArbol(page, 'Autónomo (involuntario)');
    await expect(autonomo).toHaveAttribute('aria-expanded', 'false');
    await expect(nodoArbol(page, 'Simpático')).toHaveCount(0);
    await autonomo.click();
    await expect(autonomo).toHaveAttribute('aria-expanded', 'true');
    await expect(nodoArbol(page, 'Simpático')).toBeVisible();
    await expect(nodoArbol(page, 'Parasimpático')).toBeVisible();
  });

  test('los seis neurotransmisores se abren con Enter y se cierran con Espacio', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Neurotransmisores').click();
    const nombres = ['Dopamina', 'Serotonina', 'Acetilcolina', 'GABA', 'Noradrenalina', 'Glutamato'];
    await expect(tarjetasNt(page)).toHaveCount(6);
    for (const nombre of nombres) {
      const tarjeta = page.locator(`[aria-label="Ver detalles de ${nombre}"]`);
      await tarjeta.focus();
      await page.keyboard.press('Enter');
      await expect(tarjeta).toHaveAttribute('aria-expanded', 'true');
      await expect(tarjeta.locator('[class*="ntDato"]')).toBeVisible();
      await page.keyboard.press(' ');
      await expect(tarjeta).toHaveAttribute('aria-expanded', 'false');
    }
  });
});

test.describe('CASO 2 · límite', () => {
  test('fases: la última da «~ -80 mV» y 1-2 ms, la primera «-70 mV», y solo una queda pulsada', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Sinapsis y señal').click();
    await expect(botonesFase(page)).toHaveCount(5);
    await expect(botonesFase(page).first()).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Fase 5: Período refractario' }).click();
    await expect(page.locator('[class*="faseVoltaje"]')).toHaveText('~ -80 mV');
    await expect(page.locator('[class*="faseDesc"]')).toContainText('Dura 1-2 ms');
    await expect(botonesFase(page).and(page.locator('[aria-pressed="true"]'))).toHaveCount(1);
    await page.getByRole('button', { name: 'Fase 3: Despolarización' }).click();
    await expect(page.locator('[class*="faseVoltaje"]')).toHaveText('+40 mV');
    await page.getByRole('button', { name: 'Fase 1: Reposo' }).click();
    await expect(page.locator('[class*="faseVoltaje"]')).toHaveText('-70 mV');
    await expect(page.getByRole('button', { name: 'Fase 1: Reposo' })).toHaveAttribute('aria-pressed', 'true');
  });

  test.describe('móvil (390 px)', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test('sin desbordamiento horizontal; secciones, partes y fases responden al toque', async ({ page }) => {
      await abrir(page);
      const anchos = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(anchos[0]).toBeLessThanOrEqual(anchos[1]);
      await page.getByRole('button', { name: 'Nodos de Ranvier', exact: true }).tap();
      await expect(fichaParte(page).locator('h3')).toHaveText('Nodos de Ranvier');
      await seccion(page, 'Sinapsis y señal').tap();
      await expect(page.locator('h2').first()).toContainText('Sinapsis y señal');
      await page.getByRole('button', { name: 'Fase 5: Período refractario' }).tap();
      await expect(page.locator('[class*="faseVoltaje"]')).toHaveText('~ -80 mV');
    });

    test('ABIERTO · en 390 px las etiquetas del diagrama de la neurona se pintan a 9 px o más', async ({ page }) => {
      // Hallazgo de esta inspección: el SVG (viewBox 700 de ancho) se encoge a ~324 px y sus
      // etiquetas (fontSize 8-12 del viewBox) quedan entre 3,7 y 5,6 px efectivos. En escritorio
      // la menor, «(núcleo)», sale a 9,2 px: ese es el suelo que se pide aquí.
      await abrir(page);
      const tamanos = await page.locator('svg[aria-label^="Diagrama de una neurona"]').evaluate((svg) => {
        const escala = svg.getBoundingClientRect().width / (svg as SVGSVGElement).viewBox.baseVal.width;
        return Array.from(svg.querySelectorAll('text')).map((t) => ({
          texto: t.textContent ?? '',
          px: Number(t.getAttribute('font-size')) * escala,
        }));
      });
      expect(tamanos.length).toBeGreaterThanOrEqual(9);
      test.fail();
      expect(tamanos.filter((t) => t.px < 9).map((t) => `${t.texto}: ${t.px.toFixed(1)} px`)).toEqual([]);
    });
  });

  test('ABIERTO · gráfico del potencial: eje lineal (-55 mV al 86,4 % de +40 a -70) y «umbral» dentro del viewBox', async ({ page }) => {
    // Hallazgo de esta inspección: +40 mV en y = 30, -55 mV en y = 100 y -70 mV en y = 150, así
    // que el umbral queda al 58,3 % del recorrido (70/120) en vez del 86,4 % (95/110): 15 mV
    // ocupan 50 unidades y 95 mV solo 70. Y la etiqueta «umbral» (x = 385, 24,9 de ancho) termina
    // en x = 409,9 de un viewBox de 400 con overflow hidden: se lee «umb».
    await abrir(page);
    await seccion(page, 'Sinapsis y señal').click();
    const grafico = page.locator('svg[aria-label^="Gráfico del potencial"]');
    const medidas = await grafico.evaluate((svg) => {
      const y = (txt: string): number =>
        Number(Array.from(svg.querySelectorAll('text')).find((t) => t.textContent === txt)?.getAttribute('y'));
      const umbral = Array.from(svg.querySelectorAll('text')).find((t) => t.textContent === 'umbral') as SVGTextElement;
      const caja = umbral.getBBox();
      return {
        fraccion: (y('-55 mV') - y('+40 mV')) / (y('-70 mV') - y('+40 mV')),
        finUmbral: caja.x + caja.width,
        ancho: (svg as SVGSVGElement).viewBox.baseVal.width,
      };
    });
    expect(medidas.ancho).toBe(400);
    test.fail();
    expect.soft(medidas.fraccion, 'posición de -55 mV entre +40 y -70').toBeCloseTo(95 / 110, 1);
    expect.soft(medidas.finUmbral, '«umbral» cabe en el viewBox').toBeLessThanOrEqual(medidas.ancho);
  });
});

test.describe('CASO 3 · lo que debe rechazarse', () => {
  test('un segundo clic cierra la ficha; «a» no abre nada; Espacio cierra sin desplazar la página', async ({ page }) => {
    await abrir(page);
    const axon = page.getByRole('button', { name: 'Axón', exact: true });
    await axon.click();
    await expect(fichaParte(page)).toHaveCount(1);
    await axon.click();
    await expect(fichaParte(page)).toHaveCount(0);
    await expect(axon).toHaveAttribute('aria-pressed', 'false');

    const dendritas = page.locator('g[aria-label="Dendritas: reciben señales"]');
    await dendritas.focus();
    await page.keyboard.press('a');
    await expect(fichaParte(page)).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(fichaParte(page)).toHaveCount(1);
    const antes = await page.evaluate(() => window.scrollY);
    await page.keyboard.press(' ');
    await expect(fichaParte(page)).toHaveCount(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(antes);
  });

  test('ABIERTO · los nodos hoja del árbol no son botones que no hacen nada', async ({ page }) => {
    // Hallazgo de esta inspección: Cerebro, Médula espinal, Somático, Simpático y Parasimpático
    // son <button> sin aria-expanded; pulsarlos solo cambia un estado que no pinta nada.
    await abrir(page);
    await seccion(page, 'Central vs periférico').click();
    await expect(page.locator('strong', { hasText: /^Cerebro$/ })).toBeVisible();
    test.fail();
    await expect(page.getByRole('button', { name: /^Cerebro\b/ })).toHaveCount(0);
  });
});

test.describe('Contenido: cifras y afirmaciones contra la propia app', () => {
  test('ABIERTO · «Neuronas al nacer» no repite los 100.000 M populares frente a las 86.000 M del adulto', async ({ page }) => {
    // La tarjeta dice «~100.000 M» y «Nacemos con casi todas las neuronas»; la de al lado y la FAQ
    // visible dan 86.000 millones (Azevedo et al., 2009): «casi todas» de 86.000 no son 100.000.
    await abrir(page);
    await seccion(page, 'Neurotransmisores').click();
    const curiosos = page.locator('[class*="datoCard"]');
    await expect(curiosos.filter({ hasText: 'Neuronas en el cerebro' }).locator('[class*="datoValor"]')).toHaveText('86.000.000.000');
    test.fail();
    expect(await textoDe(curiosos.filter({ hasText: 'Neuronas al nacer' }))).not.toMatch(/100\.000\s*M/);
  });

  test('ABIERTO · el dato de la noradrenalina no contradice su descripción (ritmo cardíaco y presión)', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Neurotransmisores').click();
    const tarjeta = page.locator('[aria-label="Ver detalles de Noradrenalina"]');
    await tarjeta.click();
    await expect(tarjeta).toContainText('Aumenta el ritmo cardíaco y la presión arterial');
    test.fail();
    await expect(tarjeta).not.toContainText('principalmente en el cerebro, no en el cuerpo');
  });

  test('ABIERTO · el dato de la dopamina no contradice su descripción («cuando logras algo» frente a «no después»)', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Neurotransmisores').click();
    const tarjeta = page.locator('[aria-label="Ver detalles de Dopamina"]');
    await tarjeta.click();
    await expect(tarjeta.locator('[class*="ntDato"]')).toBeVisible();
    const texto = await textoDe(tarjeta);
    test.fail();
    expect(/cuando logras algo, comes algo rico/.test(texto) && /no después/.test(texto)).toBe(false);
  });

  test('ABIERTO · el árbol del SNC habla de encéfalo, como la tabla de la guía y el FAQPage', async ({ page }) => {
    // El FAQPage: «el encéfalo (cerebro, cerebelo y tronco encefálico) y la médula espinal»; la
    // tabla: «Encéfalo + Médula espinal». El árbol: «cerebro + médula espinal», hijos Cerebro y Médula.
    await abrir(page);
    await expect(page.locator('[data-guia-educativa] table')).toContainText('Encéfalo + Médula espinal');
    await seccion(page, 'Central vs periférico').click();
    // El nodo raíz también contiene el <strong> del SNC: el último que lo contiene es el del SNC.
    const snc = page.locator('[class*="arbolNodo"]').filter({ has: page.locator('strong', { hasText: 'SNC (Central)' }) }).last();
    await expect(snc.locator('button[class*="arbolBtn"]').first()).toContainText('cerebro + médula espinal');
    test.fail();
    expect(await textoDe(snc)).toMatch(/encéfalo|cerebelo/i);
  });

  test('ABIERTO · el arco reflejo no dice a la vez que la señal «no llega al cerebro» y que el cerebro registra el dolor', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Central vs periférico').click();
    const arco = page.locator('[class*="arcoReflejoDesc"]');
    await expect(arco).toContainText('Solo después tu cerebro registra el dolor');
    test.fail();
    await expect(arco).not.toContainText('no llega al cerebro');
  });

  test('ABIERTO · un solo cociente con mielina / sin mielina (hoy 60 en una tarjeta y «hasta 100» en otra)', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Nodos de Ranvier', exact: true }).click();
    const ranvier = await textoDe(fichaParte(page));
    await seccion(page, 'Sinapsis y señal').click();
    const sinMielina = await textoDe(page.locator('[class*="datoCard"]').filter({ hasText: 'Sin mielina' }));
    const veces = (t: string): string | undefined => t.match(/(\d+) veces/)?.[1];
    expect(veces(sinMielina)).toBe('60');
    test.fail();
    expect(veces(ranvier) ?? veces(sinMielina)).toBe(veces(sinMielina));
  });

  test('ABIERTO · el mito del alcohol matiza que ningún consumo está libre de riesgo (OMS, 28/06/2024)', async ({ page }) => {
    // OMS, ficha «Alcohol»: «There is no form of alcohol consumption that is risk-free». La guía
    // marca con ❌ «El alcohol mata neuronas permanentemente» y lo acota a que «no destruye neuronas
    // directamente en consumo moderado ocasional», sin ese matiz (CLAUDE.md §1.quinquies, punto 9).
    await abrir(page);
    const lista = await textoDe(page.locator('[data-guia-educativa] [class*="warningList"]'));
    expect(lista).toContain('Solo usamos el 10');
    test.fail();
    expect(!lista.includes('consumo moderado ocasional') || /libre de riesgo|sin riesgo|ningún consumo|no hay consumo seguro/i.test(lista)).toBe(true);
  });

  test('ABIERTO · porcentajes con espacio duro: «20 %», no «20%»', async ({ page }) => {
    await abrir(page);
    await seccion(page, 'Neurotransmisores').click();
    const texto = (await textoDe(page.locator('[class*="seccionContent"]'))) + (await textoDe(page.locator('[data-guia-educativa]')));
    expect(texto).toContain('El cerebro pesa el 2');
    test.fail();
    expect(texto).not.toMatch(/\d%/);
  });

  test('ABIERTO · el JSON-LD no promete una sinapsis «animada» que la app no tiene', async ({ page }) => {
    // La sección «La sinapsis — de eléctrica a química» es una lista fija de 5 pasos; ni ella ni
    // las fases del potencial tienen animación. Lo prometen la description y una de las features.
    await abrir(page);
    const webApp = await page.locator('script[type="application/ld+json"]').evaluateAll((ss) =>
      ss.map((s) => s.textContent ?? '').find((t) => t.includes('"WebApplication"')) ?? '',
    );
    expect(webApp).toContain('Neurona interactiva');
    test.fail();
    expect(webApp).not.toContain('animada');
  });
});

test.describe('Accesibilidad: contraste del texto en color de datos (C0645)', () => {
  test('ABIERTO · fases, voltaje, títulos de las partes y rótulos de los SVG llegan a 4,5:1 en claro y en oscuro', async ({ page }) => {
    // Medido el 08/11/2026 (texto < 18,66 px negrita, umbral 4,5:1). Claro: blanco sobre el color
    // de cada fase 2,19-3,82 (botón activo y píldora de voltaje), el título de la fase 2,19-3,82,
    // los títulos de Dendritas 2,87, Axón 4,11, Mielina 2,19, Ranvier 3,82 y Terminal 2,80, y en
    // los SVG «umbral» 2,19, «Repol.» 2,87, «Vaina de mielina» 2,19, «Dirección del impulso» 2,85.
    // Oscuro: el blanco de las fases igual, «Soma» 2,45, «Axón» 3,50, «Ranvier» 3,76, «Despol.» 3,76.
    test.setTimeout(90_000);
    await abrir(page);
    await prepararParaMedir(page);
    let medidos = 0;
    const medir = async (tema: string): Promise<string[]> => {
      const fuera: string[] = [];
      const anota = (texto: string, v: number): void => {
        medidos++;
        if (v < 4.5) fuera.push(`${tema} · ${texto}: ${v.toFixed(2)}:1`);
      };
      await seccion(page, 'La neurona').click();
      for (const boton of await botonesParte(page).all()) {
        await boton.click();
        const titulo = page.locator('[class*="parteTitulo"]');
        anota(`título «${await titulo.textContent()}»`, await contrasteSobreFondoReal(titulo));
        await boton.click();
      }
      for (const t of await page.locator('svg[aria-label^="Diagrama de una neurona"] text').all()) {
        const fill = await t.evaluate((e) => getComputedStyle(e).fill);
        if (fill === 'rgb(255, 255, 255)') continue; // va sobre la elipse del soma, no sobre la tarjeta
        anota(`SVG «${await t.textContent()}»`, await contrasteSvg(t));
      }
      await seccion(page, 'Sinapsis y señal').click();
      for (let i = 0; i < 5; i++) {
        await botonesFase(page).nth(i).click();
        const activo = botonesFase(page).nth(i).locator('[class*="faseBtnTexto"]');
        anota(`fase «${await activo.textContent()}» pulsada`, await contrasteSobreFondoReal(activo));
        const voltaje = page.locator('[class*="faseVoltaje"]');
        anota(`voltaje «${await voltaje.textContent()}»`, await contrasteSobreFondoReal(voltaje));
        const titulo = page.locator('[class*="faseTitulo"]');
        anota(`título «${(await titulo.textContent())?.trim()}»`, await contrasteSobreFondoReal(titulo));
      }
      for (const t of await page.locator('svg[aria-label^="Gráfico del potencial"] text').all()) {
        anota(`gráfico «${await t.textContent()}»`, await contrasteSvg(t));
      }
      return fuera;
    };
    const claro = await medir('claro');
    await activarTemaOscuro(page);
    const oscuro = await medir('oscuro');
    // 6 títulos de parte + 7 rótulos del diagrama (sin los dos blancos del soma) + 5 × 3 de las
    // fases + 8 rótulos del gráfico = 36 medidas por tema.
    expect(medidos).toBe(72);
    test.fail();
    expect([...claro, ...oscuro]).toEqual([]);
  });
});

/**
 * Cabo C0677 (09/11/2026): las nueve sospechas de contenido que la primera inspección dejó sin caso
 * por no tener fuente en red-fuentes-oficiales.txt. Seis tienen caso aquí, en cinco hallazgos: una
 * contradicción interna (la fase del sueño que consolida la memoria) y cinco afirmaciones que caen
 * en CLAUDE.md §1.quinquies (regla 1, cifra popular sin fuente ni año; regla 3, hallazgo discutido
 * dado como hecho). Estos casos NO dicen que la cifra sea falsa: piden atribuirla a una fuente con
 * año o matizarla, y la redacción la decide el usuario (neutralidad, nivel 3). Por eso aceptan como
 * reparado tanto quitar la afirmación como dejarla con un año o un matiz (MATIZ).
 * Sin caso, y por eso sin test: la acetilcolina «primer neurotransmisor descubierto (1914)», el
 * período refractario en el que «no puede disparar otro impulso» y el curare que «lo usaban
 * indígenas en flechas» (CIMA no tiene la tubocurarina: 0 resultados el 09/11/2026).
 */
const MATIZ = /\b(?:19|20)\d{2}\b|debate|discut|controvers|hipótesis|en roedores|en animales|se ha propuesto|se estima|según/i;

/** Una afirmación categórica que sigue en el texto tiene que llevar fuente con año o matiz. */
function sinAtribuir(texto: string, afirmacion: string): boolean {
  return texto.includes(afirmacion) && !MATIZ.test(texto);
}

test.describe('Contenido: cabo C0677, sospechas sin fuente de la primera inspección', () => {
  test('ABIERTO · una sola fase del sueño consolida la memoria: «sueño profundo» en una tarjeta y «sueño REM» en otra', async ({ page }) => {
    // Contradicción interna de la guía. «Neurociencia en el día a día», tarjeta «Sueño y
    // Rendimiento»: «Durante el sueño profundo, el cerebro consolida memorias…». «Mejores
    // prácticas», tarjeta «Aprende antes de dormir»: «La consolidación de memoria ocurre
    // principalmente durante el sueño REM». Cuál de las dos queda lo decide una fuente: aquí solo se
    // exige que la guía no diga las dos.
    await abrir(page);
    const guia = page.locator('[data-guia-educativa]');
    const sueno = guia.locator('[class*="escenarioCard"]').filter({ hasText: 'Sueño y Rendimiento' });
    const tip = guia.locator('[class*="tipCard"]').filter({ hasText: 'Aprende antes de dormir' });
    await expect(sueno).toHaveCount(1);
    await expect(tip).toHaveCount(1);
    const texto = `${await textoDe(sueno)} ${await textoDe(tip)}`;
    const fases = new Set([...texto.matchAll(/sueño (profundo|REM)/g)].map((m) => m[1]));
    test.fail();
    expect([...fases], 'fases del sueño a las que la guía atribuye la consolidación').toHaveLength(1);
  });

  test('ABIERTO · «El cerebro en números»: la comparación con las estrellas de la Vía Láctea y los ~150 billones de sinapsis llevan fuente y año', async ({ page }) => {
    // §1.quinquies regla 1. La FAQ visible cita a Azevedo et al. (2009) para las 86.000 millones de
    // neuronas, pero «tantas como estrellas en la Vía Láctea» y «~150 billones» de «Sinapsis
    // totales» (repetido en el texto destacado: «conectadas por ~150 billones de sinapsis») no
    // tienen fuente ni año, y los 150 billones se dan para el cerebro entero.
    await abrir(page);
    await seccion(page, 'Neurotransmisores').click();
    const curiosos = page.locator('[class*="datoCard"]');
    const neuronas = curiosos.filter({ hasText: 'Neuronas en el cerebro' });
    const sinapsis = curiosos.filter({ hasText: 'Sinapsis totales' });
    await expect(neuronas).toHaveCount(1);
    await expect(sinapsis).toHaveCount(1);
    const destacado = await textoDe(page.locator('[class*="seccionContent"] [class*="insight"]'));
    const sinFuente: string[] = [];
    if (sinAtribuir(await textoDe(neuronas.locator('[class*="datoDesc"]')), 'Vía Láctea')) sinFuente.push('Vía Láctea');
    if (sinAtribuir(await textoDe(sinapsis), '150 billones')) sinFuente.push('tarjeta 150 billones');
    if (sinAtribuir(destacado, '150 billones')) sinFuente.push('destacado 150 billones');
    test.fail();
    expect(sinFuente).toEqual([]);
  });

  test('ABIERTO · «hasta 10.000 dendritas» lleva fuente y año (es la misma cifra que la app da para las conexiones)', async ({ page }) => {
    // §1.quinquies regla 1. Ficha «Dendritas»: «Una sola neurona puede tener hasta 10.000
    // dendritas», cifra redonda sin fuente, idéntica a la de la tarjeta «Sinapsis totales»: «Cada
    // neurona puede conectarse con hasta 10.000 más». La propia ficha dice que las dendritas reciben
    // «a través de las sinapsis»: dendritas y conexiones no son la misma magnitud.
    await abrir(page);
    await page.getByRole('button', { name: 'Dendritas', exact: true }).click();
    await expect(fichaParte(page).locator('h3')).toHaveText('Dendritas');
    const ficha = await textoDe(fichaParte(page));
    test.fail();
    expect(sinAtribuir(ficha, '10.000 dendritas'), `ficha: ${ficha}`).toBe(false);
  });

  test('ABIERTO · la neurogénesis adulta humana se atribuye o se matiza, no se da como hecho (FAQ, errores comunes y ejercicio)', async ({ page }) => {
    // §1.quinquies regla 3. Tres sitios de la guía la dan por establecida en humanos: la FAQ («Sí.
    // Hay neurogénesis adulta especialmente en el hipocampo (memoria) y el bulbo olfatorio»), los
    // errores comunes («Hay neurogénesis adulta en el hipocampo y el bulbo olfatorio… pero existe y
    // puede estimularse») y la tarjeta del ejercicio («favorece la neurogénesis en el hipocampo»);
    // los pasos 2 y 4 de la guía la dan por supuesta («neurogénesis hipocampal», «reduce la
    // neurogénesis»).
    await abrir(page);
    const guia = page.locator('[data-guia-educativa]');
    const faq = guia.locator('[class*="faqItem"]').filter({ hasText: '¿Se pueden crear nuevas neuronas siendo adulto?' });
    const mito = guia.locator('[class*="warningList"] li').filter({ hasText: 'Las neuronas no se regeneran nunca' });
    const ejercicio = guia.locator('[class*="escenarioCard"]').filter({ hasText: 'Ejercicio y Neuroplasticidad' });
    await expect(faq).toHaveCount(1);
    await expect(mito).toHaveCount(1);
    await expect(ejercicio).toHaveCount(1);
    const comoHecho: string[] = [];
    if (sinAtribuir(await textoDe(faq), 'Hay neurogénesis adulta')) comoHecho.push('FAQ');
    if (sinAtribuir(await textoDe(mito), 'Hay neurogénesis adulta')) comoHecho.push('errores comunes');
    if (sinAtribuir(await textoDe(ejercicio), 'neurogénesis en el hipocampo')) comoHecho.push('ejercicio');
    test.fail();
    expect(comoHecho).toEqual([]);
  });

  test('ABIERTO · la dopamina no se presenta como «el neurotransmisor del placer» sin matiz', async ({ page }) => {
    // §1.quinquies regla 3: encuadre popular dado como hecho. La misma tarjeta la resume como
    // «Recompensa y motivación» y su dato dice que «es la anticipación lo que motiva»; el FAQPage,
    // «circuitos de recompensa y motivación». Toca el mismo texto que el hallazgo 4222.
    await abrir(page);
    await seccion(page, 'Neurotransmisores').click();
    const tarjeta = page.locator('[aria-label="Ver detalles de Dopamina"]');
    await tarjeta.click();
    await expect(tarjeta.locator('[class*="ntDesc"]')).toBeVisible();
    const descripcion = await textoDe(tarjeta.locator('[class*="ntDesc"]'));
    test.fail();
    expect(sinAtribuir(descripcion, 'neurotransmisor del placer'), `descripción: ${descripcion}`).toBe(false);
  });
});
