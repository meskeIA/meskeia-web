import { test, expect, Page } from '@playwright/test';
import { sembrarValor, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — calculadora-suscripciones (segmento cálculo, riesgo 2, 44 usos reales)
 *
 * Primera inspección: 21/09/2026.
 *
 * LO QUE LA APP PROMETE
 *   <h1>      «Calculadora de Suscripciones»
 *   subtítulo «Controla tus gastos recurrentes y descubre cuánto pagas realmente»
 *   metadata  «Calcula el gasto mensual y anual total»
 *   JSON-LD   «Registra suscripciones mensual, anual o semanal y convierte todo a base
 *              mensual y anual» · «Desglose del gasto por categorías»
 *   educativo «Introdúcelos en esta calculadora […] El total anual suele sorprender»
 *   Hay, por tanto, verdad comprobable: la conversión entre periodicidades y la suma.
 *
 * DÓNDE VIVE EL CÁLCULO — todo en app/calculadora-suscripciones/page.tsx, sin motor aparte,
 * sin data/fiscal y sin lib/calculadoras:
 *   · `totales` (useMemo, líneas 82-106) — mensualiza cada suscripción ACTIVA:
 *         mensual → precio            anual → precio / 12            semanal → precio × 4,33
 *     y luego  anual = mensual × 12   ·   diario = mensual / 30
 *   · `porCategoria` — la misma mensualización, agrupada por categoría
 *   · `agregarSuscripcion` (línea 115) — precio = parseFloat(precio.replace(',', '.'))
 *   · lib/formatters.ts → formatCurrency (salida es-ES; devuelve «No definido» ante NaN)
 *
 * ⚠️ DOS CONSTANTES QUE LA INTERFAZ NO DECLARA EN NINGUNA PARTE y que fijan los valores
 *    esperados de abajo: la semana se mensualiza con **4,33** (no con 52/12 = 4,3333…) y el
 *    día se saca dividiendo el mes entre **30** (no el año entre 365). Los casos 1 y 2 usan
 *    la constante de la app cuando el valor esperado depende de ella, y el acta recoge las
 *    dos desviaciones como hallazgos aparte.
 *
 * ══ LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR ══
 *
 *   CASO 1 (normal) — los tres ciclos a la vez, que es lo que la app promete convertir
 *       Revista  12,99 €  mensual (Noticias/Medios) → 12,99 €/mes
 *       Seguro  120,00 €  anual   (Productividad)   → 120 / 12      = 10,00 €/mes
 *       Prensa    5,00 €  semanal (Otros)           → 5 × 4,33      = 21,65 €/mes
 *       Gasto mensual = 12,99 + 10,00 + 21,65                       = 44,64 €
 *       Gasto anual   = 44,64 × 12                                  = 535,68 €
 *       Por día       = 44,64 / 30 = 1,488                          → 1,49 €
 *       Activas       = 3
 *       Desglose, de mayor a menor: Otros 21,65 · Noticias 12,99 · Productividad 10,00
 *       Al PAUSAR «Seguro» quedan 12,99 + 21,65 = 34,64 €/mes → 415,68 €/año y 2 activas.
 *
 *   CASO 2 (límite) — el precio escrito en FORMATO ESPAÑOL, que es el que la app pide
 *       El campo lleva placeholder «0,00», así que la coma decimal es la entrada esperada,
 *       y el separador de miles español es el punto (CLAUDE.md global §2).
 *       «1.234,56» con ciclo anual son MIL doscientos treinta y cuatro con cincuenta y seis:
 *           Gasto anual   = 1.234,56 €
 *           Gasto mensual = 1234,56 / 12 = 102,88 €  (exacto, sin redondeo)
 *           Por día       = 102,88 / 30  = 3,4293…   → 3,43 €
 *       «1.500» con ciclo mensual son MIL QUINIENTOS:
 *           Gasto mensual = 1.500,00 €   ·   Gasto anual = 18.000,00 €
 *       ⚠️ HALLAZGO ABIERTO: la app hace `parseFloat(precio.replace(',', '.'))`, que sustituye
 *       solo la PRIMERA coma y deja el punto de millar como decimal: «1.234,56» → «1.234.56»
 *       → parseFloat = 1,234 · «1.500» → parseFloat = 1,5. Tres órdenes de magnitud menos, en
 *       silencio. El parser canónico del proyecto es `parseSpanishNumber` de `@/lib`.
 *
 *   CASO 3 (debe rechazarse) — entrada que no es un número
 *       Campo Precio vacío  → el botón «Añadir» debe estar DESHABILITADO. Lo está: correcto.
 *       Precio «abc»        → debe rechazarse: no es un importe. La app lo acepta, guarda
 *       precio = NaN y arrastra el NaN a los tres totales, que pasan a «No definido» —
 *       incluso los de las suscripciones VÁLIDAS que ya hubiera en la lista. Lo mismo con un
 *       precio negativo («-10» → «-10,00 €/mes», «-120,00 €/año»), que como gasto no existe.
 *
 * Los tests marcados con `test.fail()` afirman lo que DEBERÍA ocurrir, así que hoy fallan a
 * propósito; cuando se reparen, se les quita la marca y quedan como candado de regresión.
 */

test.use({ viewport: { width: 1280, height: 1000 } });

/** Etiquetas de las cuatro tarjetas del panel de resumen, tal como las escribe la app. */
const MENSUAL = 'Gasto mensual';
const ANUAL = 'Gasto anual';
const DIARIO = 'Por día';
const ACTIVAS = 'Suscripciones activas';

/**
 * El valor de una tarjeta del resumen. Se localiza por la ETIQUETA visible y no por la clase
 * CSS, porque los CSS Modules le añaden un hash que cambia en cada build.
 */
const valorDe = (page: Page, etiqueta: string) =>
  page.getByText(etiqueta, { exact: true }).locator('xpath=following-sibling::span[1]');

/**
 * Espera a que React haya montado la página.
 *
 * No se usa `esperarHidratacion` de `_hidratacion.ts` porque sondea el rastreador de valor de
 * un INPUT, y aquí no hay ninguno hasta que el modal se abre: el primer acto del test es
 * pulsar «+ Añadir», y ese clic se perdería igual que se pierde una siembra temprana. El
 * testigo equivalente para un botón es el objeto de props que React le cuelga al montarlo.
 */
async function esperarAppInteractiva(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const b = document.querySelector('button');
      return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
    },
    null,
    { timeout: 15000 },
  );
}

interface Alta {
  nombre: string;
  precio: string;
  /** Se omite cuando el caso quiere el valor inicial: sembrar lo que ya hay no prueba nada. */
  ciclo?: 'anual' | 'semanal';
  categoria?: string;
}

/** Abre el modal, rellena el formulario y pulsa «Añadir». Devuelve el localizador del botón. */
async function abrirYRellenar(page: Page, { nombre, precio, ciclo, categoria }: Alta) {
  await page.getByRole('button', { name: '+ Añadir' }).click();
  // El modal se monta ahora: `sembrarValor` espera por su cuenta a que cada input hidrate.
  await sembrarValor(page, '#nombre', nombre);
  if (precio !== '') await sembrarValor(page, '#precio', precio);
  if (ciclo) {
    await page.selectOption('#ciclo', ciclo);
    await esperarValorEnReact(page, '#ciclo', ciclo);
  }
  if (categoria) {
    await page.selectOption('#categoria', categoria);
    await esperarValorEnReact(page, '#categoria', categoria);
  }
  return page.getByRole('button', { name: 'Añadir', exact: true });
}

async function anadirSuscripcion(page: Page, alta: Alta): Promise<void> {
  const guardar = await abrirYRellenar(page, alta);
  await guardar.click();
  await expect(page.locator('#precio')).toHaveCount(0); // el modal se cierra al guardar
}

/**
 * Como `anadirSuscripcion`, pero para las entradas que DEBEN rechazarse: acepta las dos
 * formas válidas de rechazo —inhabilitar «Añadir» o aceptar el clic y no crear nada—, de
 * modo que el test siga midiendo el resultado cuando el defecto se repare por cualquiera
 * de las dos vías. Cierra el modal en ambos casos.
 */
async function intentarAlta(page: Page, alta: Alta): Promise<void> {
  const guardar = await abrirYRellenar(page, alta);
  if (await guardar.isEnabled()) await guardar.click();
  if ((await page.locator('#precio').count()) > 0) {
    await page.getByRole('button', { name: 'Cancelar' }).click();
  }
  await expect(page.locator('#precio')).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  // El aviso de transparencia es un banner fijo del sitio que tapa el botón «Añadir» del
  // modal. No es objeto de esta inspección: se da por leído antes de cargar.
  await page.addInitScript(() => {
    try {
      localStorage.setItem('meskeia_transparency_banner_dismissed', 'true');
      localStorage.removeItem('meskeia_suscripciones');
    } catch {
      // Un contexto sin almacenamiento no invalida el test: la app parte vacía igualmente.
    }
  });
  await page.goto('/calculadora-suscripciones/');
  await esperarAppInteractiva(page);
});

test('CASO 1 · los tres ciclos se mensualizan y se suman', async ({ page }) => {
  // Punto de partida: sin nada registrado, los cuatro indicadores están a cero.
  await expect(valorDe(page, MENSUAL)).toHaveText('0,00 €');
  await expect(valorDe(page, ACTIVAS)).toHaveText('0');

  await anadirSuscripcion(page, { nombre: 'Revista', precio: '12,99', categoria: 'noticias' });
  await anadirSuscripcion(page, {
    nombre: 'Seguro',
    precio: '120',
    ciclo: 'anual',
    categoria: 'productividad',
  });
  await anadirSuscripcion(page, {
    nombre: 'Prensa',
    precio: '5',
    ciclo: 'semanal',
    categoria: 'otros',
  });

  // 12,99 + 120/12 + 5×4,33 = 12,99 + 10,00 + 21,65 — cabecera del fichero, CASO 1.
  await expect(valorDe(page, MENSUAL)).toHaveText('44,64 €');
  await expect(valorDe(page, ANUAL)).toHaveText('535,68 €'); // 44,64 × 12
  await expect(valorDe(page, DIARIO)).toHaveText('1,49 €'); // 44,64 / 30 = 1,488
  await expect(valorDe(page, ACTIVAS)).toHaveText('3');

  // El mismo total leído como número, para que un error de magnitud (una periodicidad
  // convertida al revés daría 6.432 €/año) no pueda esconderse tras un cambio de formato.
  const anualLeido = Number(
    (await valorDe(page, ANUAL).innerText()).replace(/[^\d,-]/g, '').replace(',', '.'),
  );
  expect(anualLeido).toBeCloseTo(535.68, 2);

  // Desglose por categoría, ordenado de mayor a menor gasto mensualizado.
  const montos = page.locator('[class*="categoriaMonto"]');
  await expect(montos).toHaveText(['21,65 €/mes', '12,99 €/mes', '10,00 €/mes']);

  // La ficha de cada suscripción conserva su importe y su ciclo originales, sin mensualizar.
  const fichaSeguro = page.locator('[class*="suscripcionItem"]').filter({ hasText: 'Seguro' });
  await expect(fichaSeguro).toContainText('120,00');
  await expect(fichaSeguro).toContainText('Anual');

  // Pausar una la saca del cómputo sin borrarla: 12,99 + 21,65 = 34,64 → 415,68 €/año.
  await page.getByRole('button', { name: 'Pausar Seguro' }).click();
  await expect(valorDe(page, MENSUAL)).toHaveText('34,64 €');
  await expect(valorDe(page, ANUAL)).toHaveText('415,68 €');
  await expect(valorDe(page, ACTIVAS)).toHaveText('2');
});

test('CASO 2 · un precio en formato español con separador de miles', async ({ page }) => {
  test.fail(); // HALLAZGO ABIERTO: parseFloat('1.234,56'.replace(',','.')) = 1,234

  await anadirSuscripcion(page, {
    nombre: 'Software',
    precio: '1.234,56',
    ciclo: 'anual',
    categoria: 'productividad',
  });

  // 1.234,56 € al año son 1234,56 / 12 = 102,88 €/mes exactos — cabecera, CASO 2.
  await expect(valorDe(page, ANUAL)).toHaveText('1.234,56 €');
  await expect(valorDe(page, MENSUAL)).toHaveText('102,88 €');
  await expect(valorDe(page, DIARIO)).toHaveText('3,43 €'); // 102,88 / 30 = 3,4293…

  // Lo que la app muestra hoy: «1,23 €» de gasto anual y «0,10 €» de gasto mensual.
  const mensualLeido = Number(
    (await valorDe(page, MENSUAL).innerText()).replace(/[^\d,-]/g, '').replace(',', '.'),
  );
  // Dos decimales: el defecto que vigila es de tres órdenes de magnitud, pero la precisión
  // tiene que ser fina para que un futuro redondeo mal hecho tampoco pase.
  expect(mensualLeido).toBeCloseTo(102.88, 2);
});

test('CASO 2.bis · «1.500» es mil quinientos, no uno con cinco', async ({ page }) => {
  test.fail(); // HALLAZGO ABIERTO: parseFloat('1.500') = 1,5

  await anadirSuscripcion(page, {
    nombre: 'Coworking',
    precio: '1.500',
    ciclo: undefined, // mensual, que es el valor inicial del selector
    categoria: 'productividad',
  });

  await expect(valorDe(page, MENSUAL)).toHaveText('1.500,00 €');
  await expect(valorDe(page, ANUAL)).toHaveText('18.000,00 €'); // 1.500 × 12
});

test('CASO 3 · el campo Precio vacío bloquea el alta', async ({ page }) => {
  // Este sí lo hace bien hoy: `agregarSuscripcion` corta con `!precio`, y además el botón
  // «Añadir» del modal nace deshabilitado mientras falte el nombre o el precio.
  const guardar = await abrirYRellenar(page, { nombre: 'Sin importe', precio: '' });
  await expect(guardar).toBeDisabled();

  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(valorDe(page, ACTIVAS)).toHaveText('0');
  await expect(valorDe(page, MENSUAL)).toHaveText('0,00 €');
});

test('CASO 3.bis · un precio que no es un número debe rechazarse', async ({ page }) => {
  test.fail(); // HALLAZGO ABIERTO: «abc» se acepta y el NaN contamina todos los totales

  // Primero una suscripción válida, para comprobar que lo ya calculado no se pierde.
  await anadirSuscripcion(page, { nombre: 'Revista', precio: '12,99' });
  await expect(valorDe(page, MENSUAL)).toHaveText('12,99 €');

  await intentarAlta(page, { nombre: 'Rota', precio: 'abc', categoria: 'otros' });

  // «abc» no es un importe: no debería crearse nada y el total válido debe seguir en pie.
  await expect(valorDe(page, ACTIVAS)).toHaveText('1');
  await expect(valorDe(page, MENSUAL)).toHaveText('12,99 €');
  await expect(valorDe(page, ANUAL)).toHaveText('155,88 €'); // 12,99 × 12
  // Hoy las tres tarjetas dicen «No definido», porque formatCurrency(NaN) lo escribe así.
});

test('CASO 3.ter · un precio negativo debe rechazarse', async ({ page }) => {
  test.fail(); // HALLAZGO ABIERTO: «-10» se acepta y produce un gasto negativo

  await intentarAlta(page, { nombre: 'Negativa', precio: '-10', categoria: 'otros' });

  // Un gasto de suscripción no puede ser negativo. Hoy: «-10,00 €» y «-120,00 €».
  await expect(valorDe(page, ACTIVAS)).toHaveText('0');
  await expect(valorDe(page, MENSUAL)).toHaveText('0,00 €');
});
