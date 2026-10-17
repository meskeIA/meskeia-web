import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/**
 * Inspector — calculadora-tamano-adulto-perro (segmento cálculo, riesgo 2, 776 usos reales)
 *
 * Reinspección del 20/08/2026, POSTERIOR a la reparación del commit 44a5dc7d. Los tres casos
 * de abajo se resolvieron a mano ANTES de ejecutar la app, con las constantes que la propia
 * app usa. Toda la lógica vive en `app/calculadora-tamano-adulto-perro/page.tsx`: no hay motor
 * en `lib/` ni módulo en `data/`, las curvas están inline en el componente.
 *
 *    pct          = obtenerPorcentajeCrecimiento(edad, tamaño)   ← interpolación lineal sobre
 *                   `curvasCrecimiento[tamaño]`; en el primer nodo o por debajo devuelve ese
 *                   nodo, en el último o por encima devuelve 1,0
 *    pesoEstimado = pesoActual / pct
 *    rango        = pesoEstimado × 0,85  …  pesoEstimado × 1,15   (±15 %)
 *    % mostrado   = pct × 100
 *    hitos        = meses × 4,33 semanas, filtrados a [8, semana de madurez]
 *
 *  Curva grande:  8:0,20 · 12:0,30 · 16:0,40 · 20:0,48 · 24:0,55 · 28:0,62 · 32:0,68
 *                 40:0,78 · 52:0,88 · 72:0,96 · 96:1,0
 *  Curva gigante: 8:0,15 · 12:0,22 · 16:0,30 · 20:0,37 · 24:0,43 · 28:0,50 · 32:0,55
 *                 40:0,65 · 52:0,75 · 72:0,85 · 96:0,95 · 144:1,0
 *  Curva mediano: 8:0,25 · 12:0,38 · 16:0,50 · 20:0,60 · 24:0,70 · 28:0,78 · 32:0,85
 *                 40:0,92 · 52:0,98 · 60:1,0
 *
 *  Límites de entrada: PESO_MAXIMO = 120 kg · EDAD_MINIMA = 8 semanas · EDAD_MAXIMA = 150.
 *
 *  `rangosTipicos` ya NO es una tabla a mano: se deriva de `razasReferencia` (mínimo de los
 *  mínimos y máximo de los máximos de cada categoría), y da mini 1,5-4 · pequeño 4-15 ·
 *  mediano 8-20 · grande 16-40 · gigante 35-90 kg. Ese es el rango contra el que la app
 *  contrasta la proyección, y el que enseña en los botones y en la tabla comparativa.
 *
 *  Las 51 constantes de crecimiento siguen sin fuente publicada — es una decisión consciente
 *  documentada en el propio código y declarada en pantalla con <DataReference>. Lo que aquí
 *  se ancla es la ARITMÉTICA de la app sobre sus propias curvas, no su verdad veterinaria.
 *
 * HALLAZGOS ABIERTOS: al final, marcados con `test.fail()` — afirman lo que debería pasar y
 * hoy fallan a propósito. El día que se reparen se ponen en verde: quitar entonces la línea
 * `test.fail()` y quedan como regresión.
 */

const RUTA = '/calculadora-tamano-adulto-perro/';

/** Los nombres de clase de CSS Modules van con hash: se localiza por subcadena. */
const valorPrincipal = (page: Page) => page.locator('[class*="resultadoValor"]').first();
const rangoProbable = (page: Page) => page.locator('[class*="rangoValor"]').first();
/** 0 = «Crecimiento actual» (%), 1 = «Maduración». */
const detalle = (page: Page, i: number) => page.locator('[class*="detalleValor"]').nth(i);
const avisoCoherencia = (page: Page) => page.locator('[class*="coherenciaAviso"]');
const okCoherencia = (page: Page) => page.locator('[class*="coherenciaOk"]');

/** Botón de tamaño de raza: se localiza por la etiqueta, no por el rango, para no atarse a él. */
const botonTamano = (page: Page, etiqueta: string) =>
  page.locator('[class*="tamanoGrid"] button', { hasText: new RegExp(`^${etiqueta}`) }).first();

const limpiaEspacios = (t: string): string => t.replace(/ /g, ' ').trim();

/** Celdas de una fila de la tabla de hitos: [peso esperado, % del adulto]. */
async function filaHito(page: Page, edad: string): Promise<string[]> {
  const fila = page
    .locator('tr', { has: page.locator('th', { hasText: new RegExp(`^${edad}$`) }) })
    .first();
  return (await fila.locator('td').allInnerTexts()).map(limpiaEspacios);
}

async function calcular(
  page: Page,
  datos: { peso: string; edad: string; tamano: string },
): Promise<void> {
  const campos = page.locator('input[type="text"]');
  await campos.nth(0).fill(datos.peso);
  await campos.nth(1).fill(datos.edad);
  await botonTamano(page, datos.tamano).click();
  await page.getByRole('button', { name: 'Calcular Peso Adulto' }).click();
}

test.describe('Calculadora de tamaño adulto del perro', () => {
  test('CASO 1 (normal) — grande, 10 kg a las 24 semanas', async ({ page }) => {
    await page.goto(RUTA);
    await calcular(page, { peso: '10', edad: '24', tamano: 'Grande' });

    // 24 semanas es nodo exacto de la curva grande → pct = 0,55
    // pesoEstimado = 10 / 0,55 = 18,181818… kg
    await expect(valorPrincipal(page)).toHaveText('18,2 kg');

    // Rango ±15 %: 18,181818 × 0,85 = 15,45454… · × 1,15 = 20,90909…
    await expect(rangoProbable(page)).toHaveText('15,5 - 20,9 kg');

    // pct × 100 = 55 · maduración fija de la categoría grande
    // con espacio duro antes del % (RAE 2010; hallazgo 3333, que comprueba el carácter exacto)
    await expect(detalle(page, 0)).toHaveText('55 %');
    await expect(detalle(page, 1)).toHaveText('18-24 meses');

    // Hito 12 meses = 51,96 semanas → interpola 40:0,78 y 52:0,88
    //   0,78 + 0,10 × (11,96 / 12) = 0,8796666… → 18,181818 × 0,8796666 = 15,99393… kg
    expect(await filaHito(page, '12 meses')).toEqual(['16,0 kg', '88 %']);

    // Hito 6 meses = 25,98 semanas → interpola 24:0,55 y 28:0,62
    //   0,55 + 0,07 × (1,98 / 4) = 0,584650 → 18,181818 × 0,584650 = 10,63000 kg
    expect(await filaHito(page, '6 meses')).toEqual(['10,6 kg', '58 %']);

    // ESTE es el caso que la reparación del 20/08 tenía que arreglar: un Husky Siberiano
    // (16-27 kg de adulto en la tabla de la propia app) es «grande», y su proyección de
    // 18,2 kg salía marcada como «por debajo de lo habitual» porque `rangosTipicos.grande`
    // estaba escrito a mano como 25-45. Derivado de las razas, grande = 16-40 y encaja.
    await expect(okCoherencia(page)).toHaveText(
      '✅ La proyección encaja con la categoría grande, cuyo peso adulto habitual es 16-40 kg.',
    );
    await expect(avisoCoherencia(page)).toHaveCount(0);
  });

  test('CASO 2 (límite) — 8 semanas exactas, gigante por encima de 40 kg y techo de 120 kg', async ({
    page,
  }) => {
    await page.goto(RUTA);

    // (a) 8 semanas es EXACTAMENTE la edad mínima: se acepta, y es el primer nodo de la curva.
    //     Antes de la reparación se admitía desde la 4, donde la app afirmaba que el cachorro
    //     no crecía durante el mes de crecimiento más rápido.
    await calcular(page, { peso: '8', edad: '8', tamano: 'Gigante' });

    // pct = 0,15 → pesoEstimado = 8 / 0,15 = 53,33333… kg
    await expect(valorPrincipal(page)).toHaveText('53,3 kg');
    // ±15 %: 53,33333 × 0,85 = 45,33333 · × 1,15 = 61,33333
    await expect(rangoProbable(page)).toHaveText('45,3 - 61,3 kg');
    await expect(detalle(page, 0)).toHaveText('15 %');
    await expect(detalle(page, 1)).toHaveText('24-36 meses');
    await expect(page.locator('p[role="alert"]')).toHaveCount(0);

    // Hito 24 meses = 103,92 semanas → interpola 96:0,95 y 144:1,0
    //   0,95 + 0,05 × (7,92 / 48) = 0,95825 → 53,33333 × 0,95825 = 51,10666… kg
    expect(await filaHito(page, '24 meses')).toEqual(['51,1 kg', '96 %']);

    // 53,3 kg está dentro del gigante derivado (Pastor Bernés y Rottweiler desde 35 kg,
    // Gran Danés y San Bernardo hasta 90).
    await expect(okCoherencia(page)).toContainText(
      'encaja con la categoría gigante, cuyo peso adulto habitual es 35-90 kg',
    );

    // (b) Por encima de 40 kg el estándar veterinario de contraste NO cubre al perro, y la
    //     app tiene que decirlo en pantalla. Es la razón por la que las 51 constantes no se
    //     sustituyeron: no hay tabla publicada con la que hacerlo.
    const referencia = page.locator('[role="note"][aria-label="Datos de referencia normativos"]');
    await expect(referencia).toHaveCount(1);
    await expect(referencia).toContainText('no es un estándar veterinario');
    await expect(referencia).toContainText('no cubre perros de más de 40 kg de adulto');
    // Desde el 16/10/2026 (S0207) la app da una ración orientativa, así que «dietas» salió de la
    // lista: lo que se sigue exigiendo es que la estimación no decida dosis ni tratamientos y que
    // la ración se presente como punto de partida, no como dieta.
    await expect(referencia).toContainText('nunca para decidir dosis ni tratamientos');
    await expect(referencia).toContainText('punto de partida que se ajusta con el peso real');

    // (c) Techo de peso: 120 kg es el máximo admitido y se calcula. Antes el tope eran 50 kg,
    //     que dejaba inservible la categoría gigante entera (la propia app da 45-90 kg de
    //     adulto al Gran Danés). 144 semanas es el último nodo gigante → pct = 1,0.
    await page.locator('input[type="text"]').nth(0).fill('120');
    await page.locator('input[type="text"]').nth(1).fill('144');
    await page.getByRole('button', { name: 'Calcular Peso Adulto' }).click();
    await expect(valorPrincipal(page)).toHaveText('120,0 kg');
    await expect(rangoProbable(page)).toHaveText('102,0 - 138,0 kg');
    await expect(detalle(page, 0)).toHaveText('100 %');
    await expect(page.locator('p[role="alert"]')).toHaveCount(0);
    // 120 > 90 (techo del gigante derivado) → el contraste avisa en vez de callar
    await expect(avisoCoherencia(page)).toContainText('queda por encima del peso adulto habitual');
  });

  test('CASO 3 (debe rechazarse) — 7 semanas, 121 kg, 0 kg y peso negativo', async ({ page }) => {
    await page.goto(RUTA);

    // (a) 7 semanas: un día por debajo del primer nodo de la curva. No hay dato, y extrapolar
    //     sería inventarlo. El mensaje nombra el intervalo REAL que admite.
    await calcular(page, { peso: '5', edad: '7', tamano: 'Mediano' });
    await expect(page.locator('p[role="alert"]')).toContainText(
      'Introduce una edad válida, entre 8 y 150 semanas.',
    );
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);
    await expect(
      page.getByText('Introduce los datos de tu cachorro para predecir su tamaño adulto'),
    ).toBeVisible();

    // (b) 121 kg: un kilo por encima del techo.
    await calcular(page, { peso: '121', edad: '16', tamano: 'Mediano' });
    await expect(page.locator('p[role="alert"]')).toContainText(
      'Introduce un peso actual válido, mayor que 0 y hasta 120 kg.',
    );
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);

    // (c) 0 kg: la guarda `peso <= 0` corta antes de dividir; sin ella 0 / 0,50 daría «0,0 kg»
    //     como si fuera una predicción. El mensaje ya no ofrece un 0 que luego no se acepta.
    await calcular(page, { peso: '0', edad: '16', tamano: 'Mediano' });
    await expect(page.locator('p[role="alert"]')).toContainText(
      'Introduce un peso actual válido, mayor que 0 y hasta 120 kg.',
    );
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);

    // (d) Peso negativo, mismo tratamiento.
    await calcular(page, { peso: '-5', edad: '16', tamano: 'Mediano' });
    await expect(page.locator('p[role="alert"]')).toContainText(
      'Introduce un peso actual válido, mayor que 0 y hasta 120 kg.',
    );
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);
  });
});

/**
 * Verificación de la reparación 44a5dc7d (20/08/2026), punto por punto.
 */
test.describe('Calculadora de tamaño adulto del perro — la reparación del 20/08/2026', () => {
  test('los cinco botones muestran el rango DERIVADO de las razas de la tabla', async ({ page }) => {
    await page.goto(RUTA);
    // mínimo de los mínimos y máximo de los máximos de `razasReferencia` en cada categoría:
    //   mini    Chihuahua/Pomerania 1,5 … Maltés 4
    //   pequeño Shih Tzu 4 … Teckel 15
    //   mediano Bulldog Francés 8 … Border Collie/Schnauzer 20
    //   grande  Husky 16 … Pastor Alemán 40
    //   gigante Pastor Bernés/Rottweiler 35 … Gran Danés/San Bernardo 90
    const esperado = [
      ['Mini', '1,5-4 kg'],
      ['Pequeño', '4-15 kg'],
      ['Mediano', '8-20 kg'],
      ['Grande', '16-40 kg'],
      ['Gigante', '35-90 kg'],
    ];
    for (const [etiqueta, rango] of esperado) {
      await expect(botonTamano(page, etiqueta)).toContainText(rango);
    }
  });

  test('ninguna raza de la tabla cae fuera del rango de su propia categoría', async ({ page }) => {
    await page.goto(RUTA);
    // El fallo original: el Husky (16-27 kg) era «grande» mientras «grande» decía 25-45 kg,
    // así que el aviso de coherencia corregía a quien acertaba con la categoría. Aquí se
    // recorren las 27 razas leyendo la ficha que la app pinta, y se comprueba contra el
    // rango que la app anuncia en el botón de esa misma categoría.
    const categorias: Array<[string, number, number]> = [
      ['Mini', 1.5, 4],
      ['Pequeño', 4, 15],
      ['Mediano', 8, 20],
      ['Grande', 16, 40],
      ['Gigante', 35, 90],
    ];
    let vistas = 0;
    for (const [etiqueta, min, max] of categorias) {
      await page
        .locator('[class*="filtrosRaza"] button', { hasText: new RegExp(`^${etiqueta}$`) })
        .first()
        .click();
      const fichas = await page.locator('[class*="razaCard"]').allInnerTexts();
      expect(fichas.length).toBeGreaterThan(0);
      for (const ficha of fichas) {
        const m = limpiaEspacios(ficha).match(/([\d.,]+)-([\d.,]+) kg/);
        expect(m, `sin peso legible en la ficha: ${ficha}`).not.toBeNull();
        const num = (s: string): number => parseFloat(s.replace(/\./g, '').replace(',', '.'));
        expect(num(m![1]), `${ficha} por debajo del mínimo de ${etiqueta}`).toBeGreaterThanOrEqual(min);
        expect(num(m![2]), `${ficha} por encima del máximo de ${etiqueta}`).toBeLessThanOrEqual(max);
        vistas++;
      }
    }
    expect(vistas).toBe(27);
  });

  test('la app no promete más precisión de la que puede dar por encima de 40 kg', async ({ page }) => {
    await page.goto(RUTA);
    const referencia = page.locator('[role="note"][aria-label="Datos de referencia normativos"]');
    await expect(referencia).toContainText('aproximación propia, no una tabla publicada');
    await expect(referencia).toContainText('Salt et al. (2017)');
    // El caso de uso «veterinario que ajusta dosis sobre el peso adulto estimado» se retiró:
    // en el contenido propio de la app la única mención a dosis es la que lo desaconseja.
    // (La banda de apps relacionadas enlaza a «Medicamentos Mascotas», que dosifica sobre el
    // peso REAL de hoy; por eso se excluye del recuento en vez de contarse como promesa.)
    const cuerpo = await page.evaluate(() => {
      const clon = document.body.cloneNode(true) as HTMLElement;
      clon.querySelectorAll('[class*="RelatedApps"], script, nextjs-portal').forEach((e) => e.remove());
      return clon.textContent || '';
    });
    const menciones = limpiaEspacios(cuerpo).match(/dosis/gi) ?? [];
    expect(menciones.length).toBe(1);
    // Y el disclaimer sigue siendo no colapsable y de severidad alta (riesgo 2).
    await expect(page.getByText('Solo orientativo. Consulta con tu veterinario')).toBeVisible();
  });
});

/**
 * HALLAZGOS del 20/08/2026 — REPARADOS el 21/08/2026 (a716b338). Ya no llevan `test.fail()`:
 * quedan como regresión, y los comentarios en presente de cada test describen el defecto de entonces.
 */
// REGRESIONES — los seis hallazgos del 20/08/2026, reparados el 21/08/2026.
test.describe('Calculadora de tamaño adulto del perro — regresiones', () => {
  test('la FAQ estructurada publica la clasificación por peso ANTERIOR a la derivación', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).join(' ');
    // La app enseña grande 16-40, gigante 35-90, mediano 8-20 y pequeño 4-15 kg (derivados de
    // sus razas). El FAQPage que se sirve a Google y a las IAs decía lo de antes (REPARADO el
    // 21/08/2026 en la pregunta 2; la 4 lo sigue diciendo con otras palabras, «entre 25 y 45 kg»,
    // que estos patrones no ven: ver el bloque «Inspector 16/10/2026» al final).
    expect(jsonLd).not.toContain('25-45 kg');
    expect(jsonLd).not.toContain('más de 45 kg');
    expect(jsonLd).not.toContain('10-25 kg');
    expect(jsonLd).not.toContain('menos de 10 kg');
  });

  test('el ejemplo que la propia FAQ publica dispara el aviso de categoría equivocada', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // El ejemplo canónico de la FAQ era «16 kg a las 14 semanas → 45,7 kg», y disparaba el
    // aviso de la propia app: al derivarse de las razas, el techo de «grande» bajó de 45 a
    // 40 kg (Pastor Alemán), así que la proyección se salía de su categoría. Se cambió el
    // ejemplo por uno que la calculadora confirma, en vez de tocar unos rangos que salen de
    // pesos reales.
    // 14 semanas interpola 12:0,30 y 16:0,40 → 0,35 · 12 / 0,35 = 34,285… → «34,3 kg»
    await calcular(page, { peso: '12', edad: '14', tamano: 'Grande' });
    await expect(valorPrincipal(page)).toHaveText('34,3 kg');
    await expect(avisoCoherencia(page)).toHaveCount(0);

    // Y el ejemplo que publica el JSON-LD es exactamente ese.
    // El FAQPage es el segundo script: el primero es el WebApplication.
    const jsonLd = (
      await page.locator('script[type="application/ld+json"]').allInnerTexts()
    ).join(' ');
    expect(jsonLd).toContain('12 kg a esa edad proyectan unos 34,3 kg');
  });

  test('la tabla no promete una clasificación excluyente que sus rangos no pueden dar', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // Los rangos se derivan de los pesos reales de las razas, así que se solapan: 4 kg es
    // Mini y Pequeño, 15 kg es Pequeño y Mediano, 38 kg es Grande y Gigante. Los solapes
    // son CIERTOS —un perro de 15 kg puede ser de raza pequeña o mediana según cuál sea—,
    // así que el defecto no estaba en el dato sino en titularlo «Clasificación de Perros
    // por Tamaño Adulto», que promete asignar una categoría a cada peso. Forzar tramos
    // disjuntos habría exigido inventar cortes que contradicen a las propias razas.
    const solapes: Array<[number, number]> = [];
    const tramos: Array<[number, number]> = [];
    for (const etiqueta of ['Mini', 'Pequeño', 'Mediano', 'Grande', 'Gigante']) {
      const texto = limpiaEspacios(await botonTamano(page, etiqueta).innerText());
      const m = texto.match(/([\d.,]+)-([\d.,]+) kg/);
      expect(m, `sin rango legible en el botón ${etiqueta}`).not.toBeNull();
      const num = (s: string): number => parseFloat(s.replace(/\./g, '').replace(',', '.'));
      tramos.push([num(m![1]), num(m![2])]);
    }
    for (let i = 0; i < tramos.length - 1; i++) {
      if (tramos[i + 1][0] <= tramos[i][1]) solapes.push(tramos[i]);
    }

    // Si de verdad se solapan, la página tiene que decirlo donde están los rangos.
    if (solapes.length > 0) {
      await page.getByRole('button', { name: /Ver guía educativa/i }).click();
      const seccion = page.locator('section', { hasText: 'Peso adulto típico de cada categoría' });
      await expect(seccion.first()).toContainText('se solapan');
      await expect(page.getByRole('heading', { name: /Clasificación de Perros/ })).toHaveCount(0);
    }
  });

  test('la edad no admite el decimal español y lo trunca en silencio', async ({ page }) => {
    await page.goto(RUTA);
    // El campo de peso hace `.replace(',', '.')`; el de edad no, y `parseFloat('8,5')` = 8.
    // 8,5 semanas en la curva mediano interpola 8:0,25 y 12:0,38
    //   0,25 + 0,13 × (0,5 / 4) = 0,26625 → 5 / 0,26625 = 18,779… kg
    await calcular(page, { peso: '5', edad: '8,5', tamano: 'Mediano' });
    await expect(valorPrincipal(page)).toHaveText('18,8 kg');
    // Hoy devuelve 20,0 kg (el 25 % de las 8 semanas) sin avisar de nada, y la ayuda bajo el
    // campo confirma la truncatura: dice «≈ 1,8 meses» (8 / 4,33) en vez de «≈ 2,0 meses».
    await expect(page.locator('[class*="hint"]').first()).toHaveText('≈ 2,0 meses');
  });

  test('los emojis decorativos de la app no llevan aria-hidden', async ({ page }) => {
    await page.goto(RUTA);
    // Regla obligatoria de CLAUDE.md: todo emoji junto a texto va en <span aria-hidden="true">.
    // Hoy salen 57 en el marcado propio de la app (h1, los h2/h4 de las secciones, el 🐾 del
    // placeholder y los ⚖️/📅 de las 27 fichas de raza), más 15 en el bloque educativo.
    const sinOcultar = await page.evaluate(() => {
      const re = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
      const ajenos =
        '[class*="ShareCard"],[class*="Footer"],[class*="LegalNotice"],[class*="MeskeiaLogo"],' +
        '[class*="DisclaimerCard"],[class*="DataReference"],[class*="RelatedApps"],[class*="EducationalSection"]';
      let total = 0;
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let nodo: Node | null;
      while ((nodo = w.nextNode())) {
        if (!re.test(nodo.textContent || '')) continue;
        const el = nodo.parentElement;
        if (!el) continue;
        if (el.closest('[aria-hidden="true"]') || el.closest('[aria-label]')) continue;
        // Desde el 08/10/2026 (99e1ee7e) las tarjetas de relacionadas viajan del servidor en el payload
        // de React, un <script> con sus iconos: no es texto que lea un lector de pantalla.
        if (el.closest('script, style')) continue;
        if (el.closest('nextjs-portal') || el.closest(ajenos)) continue;
        total++;
      }
      return total;
    });
    expect(sinOcultar).toBe(0);
    // Los dos sitios más visibles, por si el recuento cambia con el contenido:
    await expect(page.locator('h1 [aria-hidden="true"]')).toHaveCount(1);
    await expect(page.locator('[class*="razaPeso"] [aria-hidden="true"]')).toHaveCount(27);
  });

  test('el eje X del gráfico sigue anclado a la semana 4 y deja hueco a la izquierda', async ({
    page,
  }) => {
    await page.goto(RUTA);
    // `escalaX` conserva el `s - 4` de cuando la edad mínima eran 4 semanas. Como la curva
    // empieza en la 8, el trazo arranca DENTRO del área de dibujo en vez de en su borde
    // izquierdo (M.left = 52). En mini, con fin a las 40 semanas, el hueco es del 11 %.
    await calcular(page, { peso: '1', edad: '8', tamano: 'Mini' });
    const d = await page.locator('[class*="lineaCurva"]').first().getAttribute('d');
    expect(d).not.toBeNull();
    const x0 = parseFloat((d as string).match(/^M([\d.]+),/)![1]);
    expect(x0, `la curva empieza en x=${x0} y el área de dibujo en x=52`).toBeLessThan(53);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// RACIÓN DIARIA ORIENTATIVA (16/10/2026, semilla S0207) — `motor.ts` y su sección.
//
// Ecuación de crecimiento del NRC (2006), reproducida en Bradley et al. (2021), Animals
// 11(5):1380: EM (kcal/día) = 130 × PV^0,75 × 3,2 × (e^(−0,87·p) − 0,1), p = peso actual ÷
// peso adulto. Casos resueltos a mano, término a término (16/10/2026):
//   A  10 kg, p = 0,5:  10^0,75 = 5,62341 · e^(−0,435) = 0,64726 · (0,64726 − 0,1) × 3,2 × 130
//      = 227,662 kcal/kg^0,75 → × 5,62341 = 1.280,24 kcal/día. Con 3.800 kcal/kg: 336,91 g.
//   B  2 kg, p = 0,25:  2^0,75 = 1,68179 · e^(−0,2175) = 0,80453 → 293,083 × 1,68179 = 492,91
//   C  30 kg, p = 1:    30^0,75 = 12,81861 · e^(−0,87) = 0,41895 → 132,684 × 12,81861 = 1.700,82
//   Página: grande, 10 kg, 24 semanas → la curva da p = 0,55 (razas.ts). 5,62341 ·
//      e^(−0,4785) = 0,61972 → 216,20 × 5,62341 = 1215,8 kcal → «≈ 1220 kcal» (a la decena; con cuatro cifras no se agrupa, RAE 2010);
//      con 3800 kcal/kg, 319,9 g → «≈ 320 g» (a 5 g). Se teclea «3.800» a propósito: también vale.
// ─────────────────────────────────────────────────────────────────────────────────────────────

test.describe('ración diaria orientativa · motor', () => {
  test('la ecuación de crecimiento del NRC, en tres casos a mano', async () => {
    const { energiaCrecimientoKcal, gramosDePienso } = await import('../../app/calculadora-tamano-adulto-perro/motor');
    expect(energiaCrecimientoKcal(10, 0.5)).toBeCloseTo(1280.24, 1);
    expect(energiaCrecimientoKcal(2, 0.25)).toBeCloseTo(492.91, 1);
    expect(energiaCrecimientoKcal(30, 1)).toBeCloseTo(1700.82, 1);
    expect(gramosDePienso(1280.24, 3800)).toBeCloseTo(336.91, 1);
  });

  test('más lejos del peso adulto, más energía por kilo metabólico', async () => {
    const { energiaCrecimientoKcal } = await import('../../app/calculadora-tamano-adulto-perro/motor');
    const porKilo = (p: number) => energiaCrecimientoKcal(10, p) / Math.pow(10, 0.75);
    expect(porKilo(0.2)).toBeGreaterThan(porKilo(0.5));
    expect(porKilo(0.5)).toBeGreaterThan(porKilo(0.9));
  });

  test('lo imposible da NaN, no una cifra', async () => {
    const { energiaCrecimientoKcal, gramosDePienso } = await import('../../app/calculadora-tamano-adulto-perro/motor');
    for (const [pv, p] of [[0, 0.5], [-3, 0.5], [10, 0], [10, 1.2], [NaN, 0.5], [10, NaN]]) {
      expect(energiaCrecimientoKcal(pv, p), `${pv} kg, p = ${p}`).toBeNaN();
    }
    // 380 es la energía en kcal/100 g escrita como si fuera por kilo: fuera de rango, sin gramos
    expect(gramosDePienso(1000, 380)).toBeNaN();
    expect(gramosDePienso(1000, 7000)).toBeNaN();
    expect(gramosDePienso(NaN, 3800)).toBeNaN();
  });
});

test.describe('ración diaria orientativa · en la página', () => {
  test('grande, 10 kg con 24 semanas: ≈ 1220 kcal, y con su pienso ≈ 320 g', async ({ page }) => {
    await page.goto(RUTA);
    await calcular(page, { peso: '10', edad: '24', tamano: 'Grande' });
    const seccion = page.locator('section[aria-labelledby="tituloRacion"]');
    await expect(seccion).toContainText('el 55 % de su');
    await expect(seccion.locator('[class*="racionNumero"]')).toHaveText('≈ 1220 kcal');
    await expect(seccion.locator('[class*="racionGramos"]')).toHaveCount(0);

    await seccion.locator('#kcal-pienso').fill('3.800');
    await expect(seccion.locator('[class*="racionGramos"]')).toContainText('320 g de pienso al día');

    // kcal/100 g escritas como kcal/kg: aviso y ninguna cifra de gramos
    await seccion.locator('#kcal-pienso').fill('380');
    await expect(seccion.getByRole('alert')).toContainText('kcal por kilo');
    await expect(seccion.locator('[class*="racionGramos"]')).toHaveCount(0);

    // el aviso de que es un punto de partida está siempre a la vista, no plegado
    await expect(seccion.locator('[class*="racionAviso"]')).toBeVisible();
  });

  test('si ya terminó de crecer, no da ración de cachorro: remite a la de adultos', async ({ page }) => {
    await page.goto(RUTA);
    await calcular(page, { peso: '30', edad: '100', tamano: 'Grande' });
    const seccion = page.locator('section[aria-labelledby="tituloRacion"]');
    await expect(seccion.locator('[class*="racionNumero"]')).toHaveCount(0);
    await expect(seccion.getByRole('link', { name: 'calculadora de alimentación de mascotas' })).toHaveAttribute(
      'href',
      '/calculadora-alimentacion-mascotas/',
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Inspector 16/10/2026 — RE-inspección tras 5846e30c (ración diaria orientativa, semilla S0207).
//
// Valores esperados calculados APARTE, en un script propio que no importa motor.ts, con la
// ecuación tal como la cita el commit: EM (kcal/día) = 130 × PV^0,75 × 3,2 × (e^(−0,87·p) − 0,1),
// PV = peso ACTUAL en kg, p = peso actual ÷ peso adulto estimado = el porcentaje de la curva de
// razas.ts (porque peso adulto = peso actual ÷ ese porcentaje). PV^0,75 = exp(0,75 · ln PV).
//
//   R1 mediano, 7,5 kg, 18 sem: p = 0,50 + 0,10 × 2/4 = 0,55 → adulto 13,636 → «13,6 kg»
//      7,5^0,75 = 4,532063 · e^(−0,4785) = 0,619712 → 416 × 0,519712 = 216,2003 kcal/kg^0,75
//      → 979,83 kcal → «≈ 980 kcal» (a la decena)
//      3800 kcal/kg → 257,85 g → «260 g» · 500 → 1959,67 → «1960 g» (cuatro cifras: sin punto,
//      RAE 2010) · 6000 → 163,31 → «165 g» (a 5 g)
//   R2 grande, 12 kg, 14 sem (el ejemplo que publica el FAQPage): p = 0,30 + 0,10 × 2/4 = 0,35
//      → «34,3 kg» · 12^0,75 = 6,447420 · e^(−0,3045) = 0,737492 → 265,1967 → 1709,83
//      → «≈ 1710 kcal» · 3800 → 449,96 g → «450 g»
//   L1 mini, 1,2 kg, 12 sem (raza pequeña antes de las 20 semanas): p = 0,50 → «2,4 kg»
//      1,2^0,75 = 1,146531 · e^(−0,435) = 0,647265 → 227,6621 → 261,02 → «≈ 260 kcal»
//      4000 → 65,26 g → «65 g»
//   L2 mini, 3,5 kg, 40 sem: último nodo de la curva → p = 1 → sin ración de cachorro
//   L3 mini, 3,5 kg, 39 sem: p = 0,98 + 0,02 × 7/8 = 0,9975, por debajo del umbral 0,999 → hay
//      ración: 3,5^0,75 = 2,558887 · e^(−0,867825) = 0,419864 → 133,0633 → 340,49 → «≈ 340 kcal»
//      ... pero 99,75 % se pinta «100 %» (HALLAZGO, abajo)
//   Rechazos del pienso: el motor admite 500-6000 kcal/kg ambos incluidos; 499, 6001, 380
//      (kcal/100 g), 3,8, «3800 kcal», 0, −3800 y texto dan aviso y ninguna cifra de gramos.
// ─────────────────────────────────────────────────────────────────────────────────────────────

const NBSP = ' ';
const seccionRacion = (page: Page) => page.locator('section[aria-labelledby="tituloRacion"]');
const racionNumero = (page: Page) => seccionRacion(page).locator('[class*="racionNumero"]');
const racionGramos = (page: Page) => seccionRacion(page).locator('[class*="racionGramos"]');
/** El aviso del pienso, acotado a la sección: no casa con el anunciador de rutas de Next. */
const avisoPienso = (page: Page) => seccionRacion(page).locator('p[role="alert"]');

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, ['#peso-actual', '#edad-cachorro']);
}

async function escribirPienso(page: Page, valor: string): Promise<void> {
  await seccionRacion(page).locator('#kcal-pienso').fill(valor);
  await esperarValorEnReact(page, '#kcal-pienso', valor);
}

/** Las preguntas del FAQPage tal como se sirven (el JSON-LD que leen buscadores e IAs). */
async function preguntasFaqPage(page: Page): Promise<Array<{ name: string; text: string }>> {
  const bloques = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((e) => e.textContent ?? ''));
  for (const b of bloques) {
    const j = JSON.parse(b) as {
      '@type'?: string;
      mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }>;
    };
    if (j['@type'] === 'FAQPage' && j.mainEntity) {
      return j.mainEntity.map((q) => ({ name: q.name, text: q.acceptedAnswer.text }));
    }
  }
  throw new Error('La página no sirve ningún FAQPage');
}

test.describe('Inspector 16/10/2026 — ración diaria orientativa', () => {
  test('R1 (normal) — mediano, 7,5 kg a las 18 semanas: ≈ 980 kcal; 260 g con 3800, 1960 g con 500 y 165 g con 6000', async ({
    page,
  }) => {
    await abrir(page);
    await calcular(page, { peso: '7,5', edad: '18', tamano: 'Mediano' });
    await expect(valorPrincipal(page)).toHaveText('13,6 kg');
    // toContainText normaliza el espacio duro: el U+00A0 se comprueba sobre el texto crudo
    const intro = (await seccionRacion(page).locator('p').first().textContent()) ?? '';
    expect(intro).toContain(`Con 7,5 kg y el 55${NBSP}% de su peso adulto ya alcanzado`);
    await expect(racionNumero(page)).toHaveText('≈ 980 kcal');
    await expect(racionGramos(page)).toHaveCount(0);

    // «3.800» con punto de millar: parseSpanishNumber lo lee 3800
    await escribirPienso(page, '3.800');
    await expect(racionGramos(page)).toContainText('≈ 260 g de pienso al día');
    // los dos extremos del rango admitido dan gramos, no aviso
    await escribirPienso(page, '500');
    await expect(racionGramos(page)).toContainText('≈ 1960 g de pienso al día');
    await expect(avisoPienso(page)).toHaveCount(0);
    await escribirPienso(page, '6.000');
    await expect(racionGramos(page)).toContainText('≈ 165 g de pienso al día');
    await expect(avisoPienso(page)).toHaveCount(0);
  });

  test('R2 (normal) — el ejemplo del FAQPage, grande 12 kg a las 14 semanas: ≈ 1710 kcal y 450 g con 3800', async ({
    page,
  }) => {
    await abrir(page);
    await calcular(page, { peso: '12', edad: '14', tamano: 'Grande' });
    await expect(valorPrincipal(page)).toHaveText('34,3 kg');
    await expect(racionNumero(page)).toHaveText('≈ 1710 kcal');
    await escribirPienso(page, '3800');
    await expect(racionGramos(page)).toContainText('≈ 450 g de pienso al día');
  });

  test('L1 (límite) — mini, 1,2 kg a las 12 semanas: ≈ 260 kcal, 65 g con 4000 y el aviso de razas pequeñas a la vista', async ({
    page,
  }) => {
    await abrir(page);
    await calcular(page, { peso: '1,2', edad: '12', tamano: 'Mini' });
    await expect(valorPrincipal(page)).toHaveText('2,4 kg');
    await expect(racionNumero(page)).toHaveText('≈ 260 kcal');
    await escribirPienso(page, '4000');
    await expect(racionGramos(page)).toContainText('≈ 65 g de pienso al día');
    const aviso = seccionRacion(page).locator('[class*="racionAviso"]');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('Es un punto de partida, no una dieta');
    await expect(aviso).toContainText('comieron menos de lo que da esta ecuación, sobre todo antes de las 20 semanas');
  });

  test('L2 (límite) — mini, 3,5 kg a las 40 semanas (p = 1): sin ración de cachorro, remite a la de adultos', async ({
    page,
  }) => {
    await abrir(page);
    await calcular(page, { peso: '3,5', edad: '40', tamano: 'Mini' });
    await expect(racionNumero(page)).toHaveCount(0);
    await expect(seccionRacion(page).locator('#kcal-pienso')).toHaveCount(0);
    await expect(seccionRacion(page)).toContainText('con 40 semanas ya ha terminado de crecer');
    await expect(
      seccionRacion(page).getByRole('link', { name: 'calculadora de alimentación de mascotas' }),
    ).toHaveAttribute('href', '/calculadora-alimentacion-mascotas/');
  });

  test('rechazo — energía del pienso fuera de 500-6000 kcal/kg, en otra unidad o no numérica: aviso y sin gramos', async ({
    page,
  }) => {
    await abrir(page);
    await calcular(page, { peso: '7,5', edad: '18', tamano: 'Mediano' });
    for (const v of ['499', '499,9', '6001', '6000,1', '380', '3,8', '3800 kcal', '0', '-3800', 'abc']) {
      await escribirPienso(page, v);
      await expect(avisoPienso(page), `«${v}»`).toContainText('Escribe la energía en kcal por kilo, entre 500 y 6000');
      await expect(racionGramos(page), `«${v}»`).toHaveCount(0);
    }
    // vaciar el campo retira el aviso: el pienso es opcional
    await escribirPienso(page, '');
    await expect(avisoPienso(page)).toHaveCount(0);
    await expect(racionGramos(page)).toHaveCount(0);
    // y la cifra en kcal no depende del pienso
    await expect(racionNumero(page)).toHaveText('≈ 980 kcal');
  });

  // ── HALLAZGOS del 16/10/2026 (3329-3335) — REPARADOS el 17/10/2026: quedan como regresión ────

  // REPARADO (hallazgo 3331): solo se escribe 100 a partir del umbral que lo da por adulto (0,999);
  // en la franja que redondearía a 100 el porcentaje lleva un decimal.
  test('3331 (regresión) — con p = 0,9975 la página no dice «el 100 % … ya alcanzado» si da ración de crecimiento', async ({
    page,
  }) => {
    await abrir(page);
    // L3 de la cabecera: mini, 3,5 kg, 39 semanas → p = 0,9975 < 0,999 → ración ≈ 340 kcal
    await calcular(page, { peso: '3,5', edad: '39', tamano: 'Mini' });
    await expect(racionNumero(page)).toHaveText('≈ 340 kcal');
    // Esperado: o no afirma el 100 % (99,8 %), o lo trata como adulto. Hoy: formatNumber(99,75, 0)
    // = «100» junto a «Un cachorro necesita más energía…» y una ración de crecimiento.
    const intro = ((await seccionRacion(page).locator('p').first().textContent()) ?? '').replace(/ /g, ' ');
    expect(intro).not.toContain('el 100 % de su peso adulto ya alcanzado');
    // 0,98 + 0,02 × 7/8 = 0,9975 → 99,75 → un decimal: «99,8» (o «99,7» si el double queda por debajo)
    expect(intro).toMatch(/el 99,[78][\s ]%[\s ]de su peso adulto ya alcanzado/);
    // la tarjeta «Crecimiento actual» dice lo mismo
    await expect(detalle(page, 0)).toHaveText(/^99,[78] ?%$/);
    // y la misma franja en gigante: 60 kg a las 143 semanas, p = 0,95 + 0,05 × 47/48 = 0,99896 < 0,999
    await calcular(page, { peso: '60', edad: '143', tamano: 'Gigante' });
    await expect(racionNumero(page)).toHaveCount(1);
    await expect(detalle(page, 0)).toHaveText(/^99,9 ?%$/);
    // a partir del umbral, adulto: 100 y sin ración de cachorro (L2 de la cabecera)
    await calcular(page, { peso: '3,5', edad: '40', tamano: 'Mini' });
    await expect(detalle(page, 0)).toHaveText(/^100 ?%$/);
    await expect(racionNumero(page)).toHaveCount(0);
  });

  // REPARADO (hallazgo 3333): todos los % de la app y del JSON-LD llevan U+00A0 delante.
  test('3333 (regresión) — el % va con espacio duro, ni pegado a la cifra ni con espacio normal (RAE 2010)', async ({
    page,
  }) => {
    await abrir(page);
    await calcular(page, { peso: '10', edad: '24', tamano: 'Grande' });
    // «Crecimiento actual»: antes «55%», pegado
    expect(await detalle(page, 0).textContent()).toBe(`55${NBSP}%`);
    // tabla de hitos: hoy «88 %» con U+0020
    const celda = page
      .locator('tr', { has: page.locator('th', { hasText: /^12 meses$/ }) })
      .first()
      .locator('td')
      .nth(1);
    expect(await celda.textContent()).toBe(`88${NBSP}%`);
    // bloque educativo: hoy «20%», «80-90%», «±15%», «30-40%», «10-15%» y varios « %» con U+0020
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const guia = (await page.locator('[class*="guideSection"]').allTextContents()).join(' ');
    expect(guia.match(/\d%/g) ?? []).toEqual([]);
    expect(guia.match(/\d %/g) ?? []).toEqual([]);
    // y lo que leen buscadores e IAs (features «±15%» y la FAQ 1, «el 35 %» con U+0020)
    const jsonLd = (
      await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => e.textContent ?? ''))
    ).join(' ');
    expect(jsonLd.match(/\d%/g) ?? []).toEqual([]);
    expect(jsonLd.match(/\d %/g) ?? []).toEqual([]);
  });

  // REPARADO (hallazgo 3329): la 4 se deriva ahora de rangosTipicos, como la 2.
  test('3329 (regresión) — la pregunta 4 del FAQPage publica la misma clasificación por peso que la 2 y la página', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const faq = await preguntasFaqPage(page);
    const q2 = faq.find((q) => q.name.includes('A qué edad dejan de crecer'))?.text ?? '';
    const q4 = faq.find((q) => q.name.includes('Qué diferencia hay entre un perro de raza'))?.text ?? '';
    // La 2 ya usa los rangos derivados de las razas (los del selector: grande 16-40 kg)...
    expect(q2).toContain('Las razas grandes (16-40 kg)');
    // ...y la 4, en el mismo FAQPage, publica los de antes de la reparación del 21/08/2026 con otra
    // redacción, que los patrones «25-45 kg» / «10-25 kg» de la regresión de arriba no ven.
    expect(q4).not.toContain('entre 25 y 45 kg');
    expect(q4).not.toContain('entre 10 y 25 kg');
    expect(q4).not.toContain('por encima de 45 kg');
    expect(q4).not.toMatch(/menos de 5 kg|entre 5 y 10 kg/);
    // Y en positivo: los cinco rangos del selector, los mismos que la 2
    for (const r of ['1,5-4 kg', '4-15 kg', '8-20 kg', '16-40 kg', '35-90 kg']) expect(q4).toContain(r);
    // El Husky (16-27 kg) y el Rottweiler (35-60 kg) están en la categoría donde los pone la app
    expect(q4).toMatch(/16-40 kg \([^)]*Husky/);
    expect(q4).toMatch(/35-90 kg \([^)]*Rottweiler/);
  });

  // REPARADO (hallazgo 3330): una constante por pregunta en metadata.ts, que importan las dos bocas.
  test('3330 (regresión) — las preguntas del FAQPage que están en la FAQ visible dan la misma respuesta', async ({
    page,
  }) => {
    await abrir(page);
    const faq = await preguntasFaqPage(page);
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const pares: Array<[RegExp, string]> = [
      [/¿Influye la alimentación en el tamaño final/, 'Influye la alimentación en el tamaño final'],
      [/¿A qué edad deja/, 'A qué edad deja'],
    ];
    for (const [visible, enJsonLd] of pares) {
      const item = page.locator('li[class*="faqItem"]', { has: page.locator('strong', { hasText: visible }) }).first();
      const respuestaVisible = ((await item.locator('p').first().textContent()) ?? '').trim();
      const respuestaJsonLd = faq.find((q) => q.name.includes(enJsonLd))?.text ?? '';
      expect(respuestaVisible.length, `${visible}: no está en la FAQ visible`).toBeGreaterThan(0);
      expect(respuestaJsonLd.length, `${enJsonLd}: no está en el FAQPage`).toBeGreaterThan(0);
      // Esperado: la misma respuesta en las dos bocas (una constante en metadata.ts)
      expect(respuestaVisible, String(visible)).toBe(respuestaJsonLd);
    }
  });

  // REPARADO (hallazgo 3334): peso y edad pasan por parseSpanishNumber.
  test('3334 (regresión) — «12abc» como peso y «16abc» como edad se rechazan con su aviso', async ({
    page,
  }) => {
    await abrir(page);
    // Hoy: parseFloat('12abc') = 12 → «21,8 kg» (12 ÷ 0,55) y «≈ 1390 kcal», sin aviso
    await calcular(page, { peso: '12abc', edad: '24', tamano: 'Grande' });
    await expect(page.locator('p[role="alert"]')).toContainText('Introduce un peso actual válido');
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);
    await expect(racionNumero(page)).toHaveCount(0);
    // Hoy: parseFloat('16abc') = 16 → «25,0 kg» (10 ÷ 0,40)
    await calcular(page, { peso: '10', edad: '16abc', tamano: 'Grande' });
    await expect(page.locator('p[role="alert"]')).toContainText('Introduce una edad válida');
    await expect(page.locator('[class*="resultadoValor"]')).toHaveCount(0);
  });

  // REPARADO (hallazgo 3335): los gramos viven en una región aria-live siempre montada y el aviso de
  // fuera de rango espera a que el valor lleve 800 ms sin cambiar.
  test('3335 (regresión) — los gramos se anuncian y el role="alert" no salta a mitad de teclear 3800', async ({
    page,
  }) => {
    await abrir(page);
    await calcular(page, { peso: '7,5', edad: '18', tamano: 'Mediano' });
    const campo = seccionRacion(page).locator('#kcal-pienso');
    await campo.click();
    const alertasAMitad: string[] = [];
    for (const tecla of '3800') {
      await page.keyboard.type(tecla);
      await page.waitForTimeout(150);
      if ((await avisoPienso(page).count()) > 0) alertasAMitad.push(await campo.inputValue());
    }
    await expect(racionGramos(page)).toContainText('≈ 260 g de pienso al día');
    const enRegionViva = await racionGramos(page).evaluate((el) =>
      Boolean(el.closest('[aria-live], [role="status"], [role="alert"], [role="log"]')),
    );
    expect(enRegionViva, 'los gramos aparecen sin anunciarse').toBe(true);
    // Hoy: ['3', '38', '380'] — un error asertivo para un valor válido a medio escribir
    expect(alertasAMitad, 'role="alert" con el valor a medio escribir').toEqual([]);
  });

  // REPARADO (hallazgo 3332): la tarjeta y el escenario se reescribieron con el criterio del paso 5.
  test('3332 (regresión) — la guía ya no dice que usar el peso actual para la ración es un error, que es lo que usa la ración', async ({
    page,
  }) => {
    await abrir(page);
    await calcular(page, { peso: '7,5', edad: '18', tamano: 'Mediano' });
    // La ración de la app parte del peso ACTUAL (PV = 7,5 kg) y de p; no del adulto (13,6 kg)
    await expect(seccionRacion(page).locator('p').first()).toContainText('Con 7,5 kg');
    await expect(racionNumero(page)).toHaveText('≈ 980 kcal');
    await page.getByRole('button', { name: /Ver guía educativa/i }).click();
    const guia = (await page.locator('[class*="guideSection"]').allTextContents()).join(' ');
    // El paso 5 se reescribió en 5846e30c por esto mismo; estos dos textos no.
    expect(guia).not.toContain('Usar el peso actual lleva a subalimentación o sobrealimentación');
    expect(guia).not.toContain('el consumo de alimento se estima sobre ese mismo peso');
  });
});

test.describe('Inspector 16/10/2026 — ración en móvil (390 px) y tema oscuro', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('sin desborde horizontal y con contraste suficiente en la sección nueva', async ({ page }) => {
    await abrir(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await calcular(page, { peso: '7,5', edad: '18', tamano: 'Mediano' });
    // el oscuro se pintó de verdad (fondo de la tarjeta medido el 16/10/2026), no solo el atributo
    await expect
      .poll(() => seccionRacion(page).evaluate((e) => getComputedStyle(e).backgroundColor))
      .toBe('rgb(45, 45, 45)');
    await escribirPienso(page, '3800');
    await expect(racionGramos(page)).toContainText('≈ 260 g de pienso al día');

    const [ancho, visible] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(ancho, 'la página desborda en horizontal').toBeLessThanOrEqual(visible);

    // Texto normal ≥ 4,5:1; la cifra (25,6 px en negrita) es texto grande, ≥ 3:1.
    // Medido el 16/10/2026: intro 6,35 · cifra 4,93 · ayuda 4,96 · gramos 8,98 · aviso 4,52.
    const medidas: Array<[string, ReturnType<Page['locator']>, number]> = [
      ['intro', seccionRacion(page).locator('p').first(), 4.5],
      ['cifra kcal', racionNumero(page), 3],
      ['ayuda del pienso', seccionRacion(page).locator('[class*="hint"]'), 4.5],
      ['gramos', racionGramos(page), 4.5],
      ['aviso fijo', seccionRacion(page).locator('[class*="racionAviso"]'), 4.5],
    ];
    for (const [nombre, loc, minimo] of medidas) {
      expect(await contrasteSobreFondoReal(loc), nombre).toBeGreaterThanOrEqual(minimo);
    }
    await escribirPienso(page, '380');
    await expect(avisoPienso(page)).toBeVisible();
    expect(await contrasteSobreFondoReal(avisoPienso(page)), 'aviso del pienso').toBeGreaterThanOrEqual(4.5);
  });
});
