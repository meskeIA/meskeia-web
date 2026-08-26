import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — estimador-costas-judiciales (segmento cálculo, RIESGO 1 CRÍTICO)
 * Inspeccionada el 26/08/2026.
 *
 * Qué promete la app
 * ──────────────────
 *   <h1>  «Estimador de Costas Judiciales»
 *   sub.  «Cuánto puede costar un procedimiento judicial en España: abogado, procurador,
 *          tasas y peritos»
 *   <title> y JSON-LD la fechan en «2026».
 *   Bloque educativo: honorarios de abogado (libres, «criterios orientadores» de los
 *   Colegios), aranceles de procurador «regulados por RD 1373/2003», tasas judiciales
 *   («desde 2015 las personas físicas están exentas») y peritos. Cita el art. 394 LEC
 *   como fundamento del principio de vencimiento.
 *
 * De dónde sale cada cifra esperada
 * ─────────────────────────────────
 *   TODAS las escalas viven escritas a mano en `app/estimador-costas-judiciales/page.tsx`
 *   (`estimarHonorariosAbogado`, `estimarArancelesProcurador`, `estimarTasas` y el bloque
 *   de perito dentro de `calcular`). NO hay módulo en `data/fiscal/` para costas, aranceles
 *   de procurador ni tasas judiciales — ver HALLAZGO 4. Por eso los valores esperados de
 *   los tres casos se resuelven a mano contra esas escalas, que son la única fuente que la
 *   app declara, y NO contra ningún arancel oficial: el propio comentario del código admite
 *   que las cifras de procurador son «orientativos, tarifas reducidas habituales».
 *
 *   El único dato con anclaje normativo real usado aquí es el 21 % de IVA:
 *   `data/fiscal/iva.ts` → PORCENTAJES_IVA.general = 21, con «Servicios profesionales»
 *   entre los ejemplos del tipo general (Ley 37/1992 del IVA). Se usa en el HALLAZGO 1.
 *
 * Nota de formato: `formatCurrency` usa es-ES, que NO agrupa los millares de un número de
 * cuatro cifras (2.200 → «2200,00 €») y sí los de cinco o más (23.000 → «23.000,00 €»),
 * y separa la cifra del € con un espacio duro (U+00A0), que aquí se normaliza.
 *
 * CASOS (resueltos a mano ANTES de ejecutar la app)
 * ────────────────────────────────────────────────
 *   CASO 1 (normal) — ordinario · persona física · 30.000 € · sin perito y con perito
 *       abogado    30000 ≤ 30000 → 1.500 – 4.500
 *       procurador 30000 ≤ 30000 → 700   (ordinario: requiereProcurador = true)
 *       tasas      persona física → 0 → «Exento»
 *       total      1500+700 = 2.200  ·  4500+700 = 5.200
 *       con perito 30000 ≤ 60000 → 1.200 → 3.400 – 6.400
 *
 *   CASO 2 (límite) — los bordes exactos de las escalas
 *       2.000 € verbal: tramo `cuantia <= 2000` → 400 – 900; y `cuantia > 2000` es FALSO
 *                       en 2.000 clavados, así que procurador = «No requerido».
 *       2.001 € verbal: salta los dos umbrales a la vez → 600 – 1.500 + procurador 250.
 *       600.000 € ordinario (tope del penúltimo tramo) → 6.000+3.000 = 9.000 – 23.000
 *       600.001 € ordinario (tramo más alto de la escala) → 10.000+4.500 = 14.500 – 39.500
 *       El límite del tercio del art. 394.3 LEC se comprueba aquí: ver HALLAZGO 2.
 *
 *   CASO 3 (rechazo) — «0», «-5000», «15000abc» y «10,500.00» no deben producir estimación
 *       (los dos primeros por no ser cuantías; los dos últimos por no ser números que la
 *       app pueda leer con seguridad). Ver HALLAZGO 3.
 *
 * HALLAZGOS del 26/08/2026 — documentados como TESTIGO: los bloques marcados así afirman
 * el comportamiento DEFECTUOSO, de modo que repararlo pone el test en rojo y obliga a
 * volver aquí. NO se reparó nada en esta inspección.
 *
 *   1. (cálculo, alto) EL IVA NO EXISTE EN NINGUNA PARTE DE LA APP. Ni se suma, ni se
 *      menciona, ni se advierte de que el total va sin él: la cadena «IVA» no aparece en
 *      todo el HTML renderizado. Honorarios de abogado y aranceles de procurador son
 *      servicios profesionales al tipo general del 21 % (`data/fiscal/iva.ts`), y para una
 *      persona física —el valor por defecto del formulario— el IVA es coste real y no
 *      recuperable. En el CASO 1 el «Coste total estimado» de 2.200 – 5.200 € debería ser
 *      2.662 – 6.292 € (2200 × 1,21 y 5200 × 1,21): entre 462 y 1.092 € menos de lo que el
 *      usuario va a pagar. Las tasas judiciales NO llevan IVA, así que la corrección no es
 *      multiplicar el total: es el 21 % sobre abogado + procurador + perito.
 *
 *   2. (contenido, alto) NO APARECE EL LÍMITE DEL TERCIO DEL ART. 394.3 LEC. La app cita
 *      el art. 394 LEC y avisa dos veces de que quien pierde puede pagar las costas de la
 *      contraria (tarjeta de resultados y FAQ «¿Qué pasa si pierdo el juicio?»), pero
 *      nunca dice que ese mismo artículo, en su apartado 3, limita lo que la parte
 *      condenada abona por abogado y demás profesionales no sujetos a arancel a un tercio
 *      de la cuantía del proceso. Ni las cadenas «tercio» ni «394.3» están en la página.
 *      En el CASO 2 se ve por qué importa: en un verbal de 2.000 € el tercio son 666,67 €,
 *      por debajo de los 900 € que la propia app estima como máximo del abogado. La app
 *      exagera la exposición del perdedor justo en los pleitos pequeños, que son los de
 *      sus tramos bajos. Tampoco ofrece «cuantía indeterminada», que es el supuesto que
 *      ese mismo apartado resuelve expresamente.
 *
 *   3. (cálculo, alto) EL PARSEO ES CASERO Y NO `parseSpanishNumber`. La línea 164 hace
 *      `parseFloat(cuantia.replace(/\./g, '').replace(',', '.')) || 0`, que es justo el
 *      patrón que `npm run check:parser` señala en este fichero. Dos consecuencias medidas:
 *        · «15000abc» cuela como 15.000 € y devuelve 1.450 – 3.450 € en vez de rechazarse.
 *        · «10,500.00» (diez mil quinientos: con los dos separadores el último es el
 *          decimal, CLAUDE.md §1.bis, en vigor desde el 24/08/2026) se lee 10,5 y devuelve
 *          550 – 1.050 € en vez de los 1.450 – 3.450 € que da al teclear «10500». Un
 *          factor 2,6 de diferencia, sin ningún aviso.
 *
 *   4. (dato, alto) DATOS NORMATIVOS ESCRITOS A MANO, SIN MÓDULO EN `data/fiscal/` Y SIN
 *      `<DataReference>`. La app fija las cuotas fijas de tasas judiciales (150/300/100/
 *      150/200 €), el tipo variable (0,10 % con tope 10.000 €), los ocho escalones de
 *      procurador que atribuye al RD 1373/2003, y los umbrales procesales de 6.000 €
 *      (verbal/ordinario) y 2.000 € (abogado y procurador). Ninguno está en `data/fiscal/`
 *      —25 módulos, ninguno de costas— ni lleva fecha de verificación en pantalla, pese a
 *      que el <title>, el OpenGraph y el JSON-LD se anuncian como «2026». El único dato
 *      que SÍ existe en `data/fiscal` (el 21 % de IVA) es precisamente el que falta.
 *      A verificar en la reparación: el umbral de 6.000 € entre verbal y ordinario es el
 *      candidato más probable a estar caducado; no se puede afirmar aquí porque la app no
 *      cita ninguna fuente, que es exactamente el hallazgo.
 *
 *   5. (cálculo, medio) `requiereAbogado` SE DECLARA Y NUNCA SE LEE. Está en la interfaz
 *      `ProcedimientoInfo` y relleno en los seis procedimientos, pero `calcular()` solo
 *      consulta `requiereProcurador`: los honorarios de abogado se suman SIEMPRE. Así, un
 *      monitorio de 1.500 € sale por «200,00 € – 500,00 €» con su fila de abogado, mientras
 *      el FAQ de esa misma página dice que en monitorios y verbales de hasta 2.000 € el
 *      abogado no es obligatorio. El mínimo de la horquilla no puede ser el coste de quien
 *      va sin abogado, que es 0 €.
 *
 *   6. (cálculo, bajo) SALTO DE TRAMO. Las escalas son escalones planos, no una escala
 *      progresiva, así que el error clásico —aplicar el tipo del tramo alto a toda la
 *      base— no puede darse aquí. Lo que sí se da es la discontinuidad: 600.000 € da
 *      9.000 – 23.000 € y 600.001 € da 14.500 – 39.500 €. Un euro más de cuantía sube el
 *      mínimo un 61 % y el máximo un 72 %.
 *
 *   7. (operativa, medio) EL RECHAZO ES MUDO. `if (val <= 0) return;` no avisa de nada:
 *      con «0» o «-5000» la tarjeta de resultados sigue diciendo «Completa los datos y
 *      pulsa Estimar costas», indistinguible de no haber pulsado. No se añade ningún
 *      `role="alert"` nuevo ni región `aria-live` con el motivo.
 *
 *   8. (accesibilidad, bajo) TRES GRUPOS DE BOTONES SIN NOMBRE ACCESIBLE. «Tipo de
 *      procedimiento», «¿Quién eres?» y «¿Necesitarás perito?» son `<label>` sin `for` y
 *      sin control dentro, y no hay ni un `<fieldset><legend>` ni un `role="group"` con
 *      `aria-labelledby` en toda la página. Quien navega con lector de pantalla oye
 *      «Persona física, botón, no pulsado» sin saber de qué pregunta es respuesta.
 *      Lo correcto según las reglas —`type="button"` y `aria-pressed` en los quince
 *      botones, `aria-hidden` en los emojis— sí está, y se comprueba en el CASO 1.
 */

const RUTA = '/estimador-costas-judiciales/';

/** El formato de moneda es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');
const limpiar = (s: string) => s.replace(ESPACIO_DURO, ' ').replace(/\s+/g, ' ').trim();

async function elegirProcedimiento(page: Page, etiqueta: RegExp): Promise<void> {
  await page.getByRole('button', { name: etiqueta }).first().click();
}

async function elegirPersona(page: Page, etiqueta: string): Promise<void> {
  await page.getByRole('button', { name: etiqueta, exact: true }).click();
}

async function elegirPerito(page: Page, necesita: boolean): Promise<void> {
  const grupo = page.locator('div').filter({ hasText: /^¿Necesitarás perito\?/ }).last();
  await grupo.getByRole('button', { name: necesita ? 'Sí' : 'No', exact: true }).click();
}

async function estimar(page: Page, cuantia: string): Promise<void> {
  await page.locator('#cuantia').fill(cuantia);
  await page.getByRole('button', { name: 'Estimar costas' }).click();
}

/** «Coste total estimado» — la horquilla que preside la tarjeta de resultados. */
async function totalEstimado(page: Page): Promise<string> {
  const total = page.locator('xpath=//*[text()="Coste total estimado"]/following-sibling::div[1]');
  await expect(total).toBeVisible();
  return limpiar(await total.innerText());
}

/** Importe de una fila del desglose («Abogado», «Procurador», «Tasas judiciales», «Perito»). */
async function partida(page: Page, nombre: string): Promise<string> {
  const fila = page
    .locator('h3', { hasText: 'Desglose' })
    .locator('xpath=following-sibling::div')
    .filter({ hasText: nombre });
  return limpiar(await fila.locator('strong').innerText());
}

async function notas(page: Page): Promise<string[]> {
  const parrafos = page.locator('h3', { hasText: 'Notas' }).locator('xpath=following-sibling::p');
  const salida: string[] = [];
  for (let i = 0; i < (await parrafos.count()); i++) {
    salida.push(limpiar(await parrafos.nth(i).innerText()));
  }
  return salida;
}

async function hayEstimacion(page: Page): Promise<boolean> {
  return (await page.locator('h3', { hasText: 'Desglose' }).count()) > 0;
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estimador de Costas Judiciales');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 1 (normal) · ordinario, persona física, 30.000 €: el desglose suma el total', async ({ page }) => {
  // Riesgo 1: el disclaimer crítico va SIEMPRE desplegado y con role="alert".
  const disclaimer = page.locator('[role="alert"]').first();
  await expect(disclaimer).toContainText('carácter exclusivamente orientativo');
  await expect(disclaimer).toContainText('no constituye asesoramiento financiero, fiscal ni jurídico');
  expect(await disclaimer.locator('button').count()).toBe(0); // no colapsable

  // El titular es una estimación, no una cifra vinculante.
  await expect(page.locator('header p').first()).toContainText('Cuánto puede costar');

  await elegirProcedimiento(page, /Juicio ordinario/);
  await elegirPersona(page, 'Persona física');
  await estimar(page, '30000');

  // abogado 30000 ≤ 30000 → 1.500 – 4.500 · procurador 30000 ≤ 30000 → 700 · tasas 0
  expect(await partida(page, 'Abogado')).toBe('1500,00 € – 4500,00 €');
  expect(await partida(page, 'Procurador')).toBe('700,00 €');
  expect(await partida(page, 'Tasas judiciales')).toBe('Exento');
  // 1500 + 700 = 2.200 · 4500 + 700 = 5.200 → las partidas suman el total mostrado
  expect(await totalEstimado(page)).toBe('2200,00 € – 5200,00 €');
  expect(await notas(page)).toContain('ℹ️ Las personas físicas están exentas de tasas judiciales desde 2015');

  // Con perito: 30000 ≤ 60000 → 1.200 · total 1500+700+1200 = 3.400 · 4500+700+1200 = 6.400
  await elegirPerito(page, true);
  expect(await hayEstimacion(page)).toBe(false); // cambiar un dato limpia el resultado anterior
  await estimar(page, '30000');
  expect(await partida(page, 'Perito')).toBe('1200,00 €');
  expect(await totalEstimado(page)).toBe('3400,00 € – 6400,00 €');

  // HALLAZGO 1 (TESTIGO) — el IVA no aparece por ninguna parte. Con el 21 % del tipo
  // general de `data/fiscal/iva.ts` sobre abogado + procurador + perito, el total del
  // primer supuesto (2.200 – 5.200) debería ser 2.662 – 6.292 €.
  await expect(page.locator('body')).not.toContainText('IVA');

  // HALLAZGO 8 (parcial) — lo que las reglas SÍ exigen y la app cumple:
  const botones = page.locator('button');
  for (let i = 0; i < (await botones.count()); i++) {
    expect(await botones.nth(i).getAttribute('type')).toBe('button');
  }
  // ...pero ningún grupo de botones tiene nombre accesible (TESTIGO).
  expect(await page.locator('[role="group"],[role="radiogroup"],fieldset').count()).toBe(0);
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 2 (límite) · bordes de la escala y el tercio del art. 394.3 LEC', async ({ page }) => {
  // ── 2.000 € clavados en juicio verbal ──────────────────────────────────────
  // abogado: tramo `cuantia <= 2000` → 400 – 900
  // procurador: `tipo === 'verbal' && cuantia > 2000` es FALSO en 2.000 → «No requerido»
  await elegirProcedimiento(page, /Juicio verbal/);
  await elegirPersona(page, 'Persona física');
  await estimar(page, '2000');
  expect(await partida(page, 'Abogado')).toBe('400,00 € – 900,00 €');
  expect(await partida(page, 'Procurador')).toBe('No requerido');
  expect(await totalEstimado(page)).toBe('400,00 € – 900,00 €');
  expect(await notas(page)).toContain('ℹ️ Abogado y procurador obligatorios si la cuantía supera 2.000 €');

  // HALLAZGO 2 (TESTIGO) — con 2.000 € de cuantía, el art. 394.3 LEC limitaría a
  // 2000/3 = 666,67 € lo que el condenado en costas paga por el abogado del contrario,
  // por debajo de los 900 € que la app da como máximo. La página avisa del riesgo de
  // pagar las costas de la contraria y no menciona nunca ese tope.
  await expect(page.locator('body')).toContainText('podrías ser condenado a pagar también las costas de la parte contraria');
  await expect(page.locator('body')).not.toContainText('tercio');
  await expect(page.locator('body')).not.toContainText('394.3');
  // Tampoco existe la opción de cuantía indeterminada, que es la que ese apartado resuelve.
  await expect(page.locator('body')).not.toContainText('indeterminada');

  // ── 2.001 €: un euro más cruza los dos umbrales a la vez ───────────────────
  // abogado 2001 ≤ 6000 → 600 – 1.500 · procurador 2001 ≤ 6000 → 250 · total 850 – 1.750
  await estimar(page, '2001');
  expect(await partida(page, 'Abogado')).toBe('600,00 € – 1500,00 €');
  expect(await partida(page, 'Procurador')).toBe('250,00 €');
  expect(await totalEstimado(page)).toBe('850,00 € – 1750,00 €');
  expect(await notas(page)).toContain('ℹ️ Cuantía > 2.000 €: procurador obligatorio en juicio verbal');

  // ── Tope del penúltimo tramo y tramo más alto de la escala ─────────────────
  await elegirProcedimiento(page, /Juicio ordinario/);
  // 600.000 → abogado 6.000 – 20.000 · procurador 3.000 · total 9.000 – 23.000
  await estimar(page, '600000');
  expect(await partida(page, 'Abogado')).toBe('6000,00 € – 20.000,00 €');
  expect(await partida(page, 'Procurador')).toBe('3000,00 €');
  expect(await totalEstimado(page)).toBe('9000,00 € – 23.000,00 €');

  // 600.001 → tramo más alto: abogado 10.000 – 35.000 · procurador 4.500 → 14.500 – 39.500
  // HALLAZGO 6 (TESTIGO): un euro de cuantía sube el mínimo un 61 % y el máximo un 72 %.
  await estimar(page, '600001');
  expect(await partida(page, 'Abogado')).toBe('10.000,00 € – 35.000,00 €');
  expect(await partida(page, 'Procurador')).toBe('4500,00 €');
  expect(await totalEstimado(page)).toBe('14.500,00 € – 39.500,00 €');
});

// ─────────────────────────────────────────────────────────────────────────────
test('CASO 3 (rechazo) · lo que no es una cuantía no debe producir estimación', async ({ page }) => {
  await elegirProcedimiento(page, /Juicio ordinario/);
  await elegirPersona(page, 'Persona física');

  // ── Cero y negativo: la app NO estima (correcto) pero tampoco explica por qué ──
  // HALLAZGO 7 (TESTIGO): el rechazo es mudo; la tarjeta sigue en su texto de reposo.
  for (const invalida of ['0', '-5000']) {
    await estimar(page, invalida);
    expect(await hayEstimacion(page)).toBe(false);
    await expect(page.getByText('Completa los datos y pulsa')).toBeVisible();
    // Los dos role="alert" de la página son el disclaimer y el aviso legal: no hay uno nuevo.
    expect(await page.locator('[role="alert"]').count()).toBe(2);
    expect(await page.locator('[aria-live]').count()).toBe(2);
  }

  // ── Basura con prefijo numérico: DEBERÍA rechazarse y no se rechaza ──────────
  // HALLAZGO 3 (TESTIGO): parseFloat('15000abc') = 15000, así que la app estima como si
  // fueran 15.000 € (abogado 1.000 – 3.000 · procurador 450). `parseSpanishNumber`
  // devolvería NaN y el rechazo sería el correcto.
  await estimar(page, '15000abc');
  expect(await hayEstimacion(page)).toBe(true);
  expect(await totalEstimado(page)).toBe('1450,00 € – 3450,00 €');

  // ── Número con los dos separadores: se lee 2,6 veces más pequeño ────────────
  // HALLAZGO 3 (TESTIGO): «10,500.00» son diez mil quinientos (con ambos separadores el
  // último es el decimal — CLAUDE.md §1.bis, `parseSpanishNumber` desde el 24/08/2026).
  // La app hace replace(/\./g,'').replace(',','.') → «10.50000» → 10,5 y cae al tramo de
  // 2.000 €. Tecleado como «10500» la misma app devuelve 1.450,00 € – 3.450,00 €.
  await estimar(page, '10,500.00');
  expect(await partida(page, 'Abogado')).toBe('400,00 € – 900,00 €');
  expect(await partida(page, 'Procurador')).toBe('150,00 €');
  expect(await totalEstimado(page)).toBe('550,00 € – 1050,00 €');

  await estimar(page, '10500');
  expect(await totalEstimado(page)).toBe('1450,00 € – 3450,00 €');
});
