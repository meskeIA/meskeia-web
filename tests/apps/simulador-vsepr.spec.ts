import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-vsepr (segmento interactiva, riesgo 3, 170 usos reales · Stemum/Química)
 *
 * Primera inspección: 31/08/2026. La app promete en su <h1> «Simulador VSEPR — Geometría
 * Molecular» y en su subtítulo «Construye moléculas, ajusta pares enlazantes y libres, y observa
 * la geometría 3D rotable». La metadata repite la promesa (geometría 3D según pares enlazantes y
 * libres del átomo central). Hay, por tanto, verdad comprobable con lápiz: para cada combinación
 * de pares enlazantes (X) y pares libres (E), la teoría VSEPR fija sin ambigüedad la notación
 * (AXₙEₘ), la geometría electrónica, la geometría molecular, el ángulo ideal y la hibridación.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   app/simulador-vsepr/page.tsx → NO hay motor separado en lib/: la tabla `TABLA_VSEPR` (líneas
 *   84-189) y la asignación geométrica `asignarVertices`/`getVerticesElectronicos` (líneas
 *   194-301) viven enteras en el propio componente. Los presets de `MOLECULAS_PRESET` fijan
 *   átomo + enlaces + libres con un clic; los deslizadores #slider-enlaces (1-6) y #slider-libres
 *   (0-3) permiten cualquier combinación, con un tope de X+E ≤ 6 aplicado en `handleEnlaces`/
 *   `handleLibres`.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal, sin pares libres) — CH₄, átomo C, 4 enlaces, 0 libres
 *     Total de dominios = 4 → geometría electrónica tetraédrica. Sin pares libres, la geometría
 *     molecular coincide: tetraédrica. Ángulo ideal del tetraedro regular: 109,5°.
 *     Hibridación sp³ (4 orbitales: 1s + 3p). Notación AX₄.
 *
 *   CASO 2 (con pares libres que distorsionan el ángulo) — H₂O, átomo O, 2 enlaces, 2 libres
 *     Total de dominios = 2+2 = 4 → geometría electrónica tetraédrica (igual que CH₄), pero la
 *     geometría MOLECULAR solo cuenta los átomos: con 2 pares libres queda angular/bent. Los
 *     pares libres, más próximos al núcleo que un par enlazante, repelen más y comprimen el
 *     ángulo H-O-H del ideal tetraédrico (109,5°) al valor experimental conocido: 104,5°.
 *     Notación AX₂E₂, hibridación sp³ (el par libre también ocupa un orbital híbrido).
 *
 *   CASO 3 (límite — máximo de pares que admite la app) — SF₆, átomo S, 6 enlaces, 0 libres
 *     El deslizador de enlaces tiene tope 6 y la app capa X+E ≤ 6, así que 6 enlaces sin pares
 *     libres es el extremo superior soportado. Total de dominios = 6 → geometría electrónica
 *     octaédrica; sin pares libres, la molecular coincide: octaédrica. Todos los ángulos entre
 *     enlaces adyacentes son 90° (los seis vértices están a 90° unos de otros: ±x, ±y, ±z).
 *     Hibridación sp³d² (se necesitan 2 orbitales d para los 6 dominios). Notación AX₆.
 *
 * Los tres se ejecutaron contra http://localhost:3050/simulador-vsepr/ con Playwright vía
 * `node_modules/playwright` (no MCP) y el bloque de resultado coincidió con el cálculo a mano
 * en los cinco campos (notación, geometría electrónica, geometría molecular, ángulo, hibridación)
 * en las dos vías de entrada (preset de un clic Y deslizadores manuales). Ningún hallazgo de
 * cálculo: la tabla VSEPR embebida y la asignación de vértices (pares libres en posiciones
 * ecuatoriales en bipirámide trigonal, en posiciones opuestas en octaédrica) coinciden con la
 * teoría en los ocho presets y en los tres casos aquí fijados como regresión.
 */

const RUTA = '/simulador-vsepr/';

/** Carga una molécula famosa por su fórmula (ASCII, tal y como la declara MOLECULAS_PRESET). */
async function cargarPreset(page: Page, formula: string): Promise<void> {
  await page.getByRole('button', { name: `Cargar configuración de ${formula}` }).click();
}

/** Mueve un deslizador (range) como lo haría un usuario arrastrándolo. */
async function ponerSlider(page: Page, id: string, valor: number): Promise<void> {
  await page.evaluate(
    ({ id, valor }) => {
      const el = document.getElementById(id) as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )!.set!;
      setter.call(el, String(valor));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    { id, valor },
  );
}

interface ResultadoVsepr {
  notacion: string;
  geomElectronica: string;
  geomMolecular: string;
  angulo: string;
  hibridacion: string;
}

/** Lee los cinco campos del bloque de resultado. Falla si el bloque no está (combinación fuera de tabla). */
async function leerResultado(page: Page): Promise<ResultadoVsepr> {
  const bloque = page.locator('section', { hasText: 'Resultado:' }).first();
  const filas = await bloque.locator('[class*="resultRow"]').allInnerTexts();
  const valor = (etiqueta: string): string => {
    const fila = filas.find((f) => f.startsWith(etiqueta));
    if (!fila) throw new Error(`Fila «${etiqueta}» no encontrada en el resultado`);
    return fila.slice(etiqueta.length).trim();
  };
  return {
    notacion: valor('Notación VSEPR'),
    geomElectronica: valor('Geometría electrónica'),
    geomMolecular: valor('Geometría molecular'),
    angulo: valor('Ángulo de enlace ideal'),
    hibridacion: valor('Hibridación'),
  };
}

test.describe('Simulador VSEPR — geometría molecular contra la teoría, en las dos vías de entrada', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Simulador VSEPR — Geometría Molecular',
    );
  });

  test('CASO 1 (normal) · CH₄ vía preset — AX₄, tetraédrica, 109,5°, sp³', async ({ page }) => {
    // C con 4 enlaces y 0 pares libres: geometría electrónica y molecular coinciden (tetraédrica).
    await cargarPreset(page, 'CH4');
    const r = await leerResultado(page);
    expect(r).toEqual({
      notacion: 'AX₄',
      geomElectronica: 'Tetraédrica',
      geomMolecular: 'Tetraédrica',
      angulo: '109,5°',
      hibridacion: 'sp³',
    });
  });

  test('CASO 1 (normal) · X=4,E=0 vía deslizadores — mismo resultado que el preset CH₄', async ({ page }) => {
    // Verificación independiente: la misma combinación alcanzada moviendo los deslizadores a
    // mano (sin usar el atajo de preset) debe dar la tabla VSEPR idéntica.
    await ponerSlider(page, 'slider-enlaces', 4);
    await ponerSlider(page, 'slider-libres', 0);
    const r = await leerResultado(page);
    expect(r).toEqual({
      notacion: 'AX₄',
      geomElectronica: 'Tetraédrica',
      geomMolecular: 'Tetraédrica',
      angulo: '109,5°',
      hibridacion: 'sp³',
    });
  });

  test('CASO 2 (pares libres distorsionan el ángulo) · H₂O vía preset — AX₂E₂, angular, ~104,5°', async ({ page }) => {
    // O con 2 enlaces y 2 pares libres: geometría electrónica tetraédrica (4 dominios) pero
    // molecular angular, y el ángulo baja del ideal 109,5° al experimental 104,5° por la mayor
    // repulsión de los pares libres.
    await cargarPreset(page, 'H2O');
    const r = await leerResultado(page);
    expect(r).toEqual({
      notacion: 'AX₂E₂',
      geomElectronica: 'Tetraédrica',
      geomMolecular: 'Angular',
      angulo: '<109,5° (~104,5°)',
      hibridacion: 'sp³',
    });
  });

  test('CASO 2 (pares libres distorsionan el ángulo) · X=2,E=2 vía deslizadores — mismo resultado que H₂O', async ({ page }) => {
    await ponerSlider(page, 'slider-enlaces', 2);
    await ponerSlider(page, 'slider-libres', 2);
    const r = await leerResultado(page);
    expect(r).toEqual({
      notacion: 'AX₂E₂',
      geomElectronica: 'Tetraédrica',
      geomMolecular: 'Angular',
      angulo: '<109,5° (~104,5°)',
      hibridacion: 'sp³',
    });
  });

  test('CASO 3 (límite, máximo soportado) · SF₆ vía preset — AX₆, octaédrica, 90°, sp³d²', async ({ page }) => {
    // S con 6 enlaces y 0 pares libres: el tope del deslizador de enlaces (max=6) sin pares
    // libres es el extremo superior que admite la app. Octaedro regular: los 6 vértices
    // (±x,±y,±z) quedan todos a 90° entre sí.
    await cargarPreset(page, 'SF6');
    const r = await leerResultado(page);
    expect(r).toEqual({
      notacion: 'AX₆',
      geomElectronica: 'Octaédrica',
      geomMolecular: 'Octaédrica',
      angulo: '90°',
      hibridacion: 'sp³d²',
    });
    // El aria-label del SVG (accesibilidad) debe reflejar la misma geometría que el texto.
    await expect(page.locator('svg[role="img"]')).toHaveAttribute(
      'aria-label',
      'Molécula AX₆: Octaédrica',
    );
  });

  test('CASO 3 (límite, máximo soportado) · X=6,E=0 vía deslizadores — mismo resultado que SF₆', async ({ page }) => {
    await ponerSlider(page, 'slider-enlaces', 6);
    await ponerSlider(page, 'slider-libres', 0);
    const r = await leerResultado(page);
    expect(r).toEqual({
      notacion: 'AX₆',
      geomElectronica: 'Octaédrica',
      geomMolecular: 'Octaédrica',
      angulo: '90°',
      hibridacion: 'sp³d²',
    });
  });

  test('LÍMITE del tope combinado · subir libres a 3 estando en X=6 recorta enlaces a 3 (X+E ≤ 6)', async ({ page }) => {
    // Comportamiento deliberado (comentario del propio código, línea 401: «Limitar total a 6,
    // máximo VSEPR común»): al superar 6 pares totales, handleLibres recorta ENLACES para
    // mantener el tope, no rechaza el cambio. 6 enlaces + 3 libres → se ajusta a 3 enlaces + 3
    // libres (total 6). La combinación AX₃E₃ no está en la tabla VSEPR de la app (no es un caso
    // curricular estándar: para 6 dominios solo cubre 0, 1 y 2 pares libres), así que debe
    // mostrar el mensaje pedagógico de "combinación poco común", no un resultado inventado.
    await cargarPreset(page, 'SF6'); // enlaces=6, libres=0
    await expect(page.locator('#slider-enlaces')).toHaveValue('6');

    await ponerSlider(page, 'slider-libres', 3);

    await expect(page.locator('#slider-enlaces')).toHaveValue('3');
    await expect(page.locator('#slider-libres')).toHaveValue('3');
    await expect(page.locator('section', { hasText: 'Resultado:' })).toHaveCount(0);
    await expect(page.getByText('Combinación poco común')).toBeVisible();
  });
});
