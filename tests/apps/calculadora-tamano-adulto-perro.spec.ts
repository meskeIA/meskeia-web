import { test, expect, Page } from '@playwright/test';

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
    await expect(detalle(page, 0)).toHaveText('55%');
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
    await expect(detalle(page, 0)).toHaveText('15%');
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
    await expect(referencia).toContainText('nunca para decidir dosis, dietas ni tratamientos');

    // (c) Techo de peso: 120 kg es el máximo admitido y se calcula. Antes el tope eran 50 kg,
    //     que dejaba inservible la categoría gigante entera (la propia app da 45-90 kg de
    //     adulto al Gran Danés). 144 semanas es el último nodo gigante → pct = 1,0.
    await page.locator('input[type="text"]').nth(0).fill('120');
    await page.locator('input[type="text"]').nth(1).fill('144');
    await page.getByRole('button', { name: 'Calcular Peso Adulto' }).click();
    await expect(valorPrincipal(page)).toHaveText('120,0 kg');
    await expect(rangoProbable(page)).toHaveText('102,0 - 138,0 kg');
    await expect(detalle(page, 0)).toHaveText('100%');
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
 * HALLAZGOS ABIERTOS del 20/08/2026. Todos fallan HOY a propósito.
 */
// REGRESIONES — los seis hallazgos del 20/08/2026, reparados el 21/08/2026.
test.describe('Calculadora de tamaño adulto del perro — regresiones', () => {
  test('la FAQ estructurada publica la clasificación por peso ANTERIOR a la derivación', async ({
    page,
  }) => {
    await page.goto(RUTA);
    const jsonLd = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).join(' ');
    // La app enseña grande 16-40, gigante 35-90, mediano 8-20 y pequeño 4-15 kg (derivados de
    // sus razas). El FAQPage que se sirve a Google y a las IAs sigue diciendo lo de antes.
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
