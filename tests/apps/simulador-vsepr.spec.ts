import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

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
 *
 * LA CARRERA DE HIDRATACIÓN (12/09/2026) — por qué se reparó este fichero, no la app
 *   Los dos casos «vía deslizadores» de X≠4 aparecieron en rojo en la suite del 11/09 sin que
 *   la app ni el spec se hubieran tocado desde agosto. Pidiendo X=2,E=2 salía AX₄E₂ y pidiendo
 *   X=6,E=0 salía AX₄: en ambos el deslizador de ENLACES se quedaba en su valor inicial (4) y
 *   el de pares libres sí obedecía. No era un fallo de la app: con teclado real (ArrowRight),
 *   con `fill()` y con el propio setter sintético una vez cargada la página, los dos
 *   deslizadores responden y la tabla VSEPR sale correcta.
 *
 *   El `beforeEach` solo esperaba al <h1>, que viaja en el HTML servido. Medido: en ese instante
 *   los inputs todavía NO están hidratados (React aún no ha instalado su `_valueTracker`), así
 *   que el primer evento sintético de cada test —siempre el de enlaces— se perdía; el segundo,
 *   32 ms más tarde, ya llegaba. Agravante que lo volvía indepurable: el intento perdido deja el
 *   rastreador de valor de React apuntando al valor que no llegó a aplicarse, de modo que
 *   reintentar CON EL MISMO VALOR no lo arregla nunca (React descarta el evento por duplicado) y
 *   solo un valor distinto desatasca. Por eso fallaba igual reintentando 20 s.
 *
 *   Reparación: esperar la hidratación antes de tocar nada, y que `ponerSlider` COMPRUEBE que el
 *   estado de React recogió el valor en vez de seguir midiendo otra molécula en silencio. Al
 *   hacerlo salió a la luz que dos casos daban verde sin mover nada, porque su combinación era
 *   la del estado inicial (X=4,E=0); ahora los tres parten de H₂O y el movimiento es real.
 */

const RUTA = '/simulador-vsepr/';

/** Carga una molécula famosa por su fórmula (ASCII, tal y como la declara MOLECULAS_PRESET). */
async function cargarPreset(page: Page, formula: string): Promise<void> {
  await page.getByRole('button', { name: `Cargar configuración de ${formula}` }).click();
}

/** El eco del valor en la etiqueta: lo pinta React desde su estado, no el DOM del propio input. */
const ecoDeSlider = (page: Page, id: string) => page.locator(`label[for="${id}"] strong`);

const DESLIZADORES = ['#slider-enlaces', '#slider-libres'];

/**
 * Mueve un deslizador (range) como lo haría un usuario arrastrándolo, y comprueba que el ESTADO
 * de React lo ha recogido. La comprobación no es decorativa: sin ella un evento perdido deja el
 * deslizador en su valor anterior y el test sigue adelante midiendo otra molécula.
 */
async function ponerSlider(page: Page, id: string, valor: number): Promise<void> {
  await sembrarValor(page, `#${id}`, valor);
  // Doble testigo a propósito: `sembrarValor` mira el estado con el que React ha renderizado el
  // INPUT, y esto mira el eco que React pinta en la ETIQUETA. Que los dos coincidan es lo que
  // descarta que la página quede descuadrada consigo misma, que es como se vio el fallo.
  await expect(
    ecoDeSlider(page, id),
    `el deslizador #${id} no llegó a ${valor}: el evento no alcanzó al estado de React`,
  ).toHaveText(String(valor));
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
    // El <h1> es HTML servido: está mucho antes de que la página responda a nada.
    await esperarHidratacion(page, DESLIZADORES);
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
    // Se parte de H₂O (X=2,E=2) y no del estado inicial, que ya ES X=4,E=0: desde ahí el test
    // daba verde sin haber movido nada (ver «LA CARRERA DE HIDRATACIÓN» en la cabecera).
    await cargarPreset(page, 'H2O');
    await ponerSlider(page, 'slider-enlaces', 4); // 4+2 = 6, dentro del tope: no recorta libres
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
    // También desde H₂O: con el estado inicial (E ya vale 0) el deslizador de pares libres no
    // llegaba a moverse y solo se estaba comprobando medio caso.
    await cargarPreset(page, 'H2O');
    await ponerSlider(page, 'slider-libres', 0); // primero E, para no chocar con el tope X+E ≤ 6
    await ponerSlider(page, 'slider-enlaces', 6);
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (26/09/2026) — la tarea asignable de esta app (tipo C, predicción antes de
 * mover).
 *
 * Salió de la semilla S0165: 431 visitas en 90 días, un 9 % de aula (Panamá y Colombia) y sin
 * tarea dentro. El alumno parte de una molécula real, se le propone UN cambio (un par más o
 * menos, u otra molécula) y se compromete con una predicción antes de mover el deslizador.
 *   app/simulador-vsepr/motor.ts   ← TABLA_VSEPR (MOVIDA de page.tsx, no replicada) y el tope
 *                                    X + E ≤ 6 de los deslizadores, como funciones puras
 *   app/simulador-vsepr/casos.ts   ← los 12 casos, la rejilla de escenarios y el aleatorio
 * La respuesta sale de EJECUTAR el motor sobre el estado final, nunca de una tabla de casos.
 *
 * LA RESPUESTA DE CADA CASO, A MANO (teoría VSEPR: electrónica = X + E; molecular = solo átomos):
 *   1 · CH₄ (4,0) → NH₃ (3,1)          4 dominios, 3 átomos                 → Pirámide trigonal
 *   2 · NH₃ (3,1) → H₂O (2,2)          ¿cambia la electrónica? 4 → 4        → No cambia
 *   3 · NH₃ (3,1), E − 1 → (3,0)       3 dominios, los 3 átomos             → Trigonal plana
 *   4 · BF₃ (3,0), X + 1 → (4,0)       4 dominios, los 4 átomos             → Tetraédrica
 *   5 · CO₂ (2,0), E + 1 → (2,1)       electrónica de 3 dominios            → Trigonal plana
 *   6 · H₂O (2,2), E − 1 → (2,1)       3 dominios, 2 átomos                 → Angular (la trampa:
 *                                      la molecular NO cambia aunque cambie la electrónica)
 *   7 · SiCl₄ (4,0), E + 1 → (4,1)     5 dominios, par libre ecuatorial     → Balancín (sube y baja)
 *   8 · PCl₃ (3,1), E + 1 → (3,2)      5 dominios, 2 pares ecuatoriales     → Forma T
 *   9 · H₂S (2,2), E + 1 → (2,3)       5 dominios, 3 pares ecuatoriales     → Lineal (XeF₂)
 *  10 · SF₄ (4,1), E + 1 → (4,2)       6 dominios, pares opuestos           → Cuadrada plana (XeF₄)
 *  11 · SF₄ (4,1), X + 1 → (5,1)       6 dominios, 1 par libre              → Pirámide cuadrada (BrF₅)
 *  12 · SF₆ (6,0) → XeF₄ (4,2)         ¿cambia la electrónica? 6 → 6        → No cambia
 *
 * Lo que se EXCLUYE (regla de la skill para el tipo C): los cambios en los que el tope X + E ≤ 6
 * mueve también el OTRO deslizador —el alumno vería algo distinto de lo que se le pidió—, los
 * estados que la app pinta como «Combinación poco común» y cualquier pregunta sobre el átomo
 * central, que no interviene en la geometría.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import {
  CASOS as CASOS_AULA,
  TOTAL_CASOS as TOTAL_CASOS_AULA,
  SIN_CAMBIO,
  resolverCaso,
  estadoTrasCambio,
  comprobarPrediccion,
  recorrerRejilla,
  generarEjercicioAleatorio,
} from '../../app/simulador-vsepr/casos';
import { geometriaDe, aplicarCambioEnlaces, aplicarCambioLibres } from '../../app/simulador-vsepr/motor';

const A_MANO_AULA: Readonly<Record<number, string>> = {
  1: 'Pirámide trigonal',
  2: SIN_CAMBIO,
  3: 'Trigonal plana',
  4: 'Tetraédrica',
  5: 'Trigonal plana',
  6: 'Angular',
  7: 'Balancín (sube y baja)',
  8: 'Forma T',
  9: 'Lineal',
  10: 'Cuadrada plana',
  11: 'Pirámide cuadrada',
  12: SIN_CAMBIO,
};

test.describe('simulador-vsepr · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS_AULA).toBe(12);
    expect(CASOS_AULA.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS_AULA) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.respuesta).toBe(a.respuesta);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada sale de ejecutar el motor y está entre las opciones', async () => {
    for (const caso of CASOS_AULA) {
      const r = resolverCaso(caso.datos);
      expect(r.respuesta, `caso ${caso.id}`).toBe(caso.respuesta);
      const valores = caso.opciones.map((o) => o.valor);
      expect(valores, `caso ${caso.id}`).toContain(caso.respuesta);
      expect(new Set(valores).size, `caso ${caso.id}: opciones repetidas`).toBe(valores.length);
      expect(valores.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(3);
      expect(valores.length, `caso ${caso.id}`).toBeLessThanOrEqual(4);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, explicación, instrucción y pista', async () => {
    for (const caso of CASOS_AULA) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.instruccion.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.filaQueMirar.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      // El título no puede regalar la respuesta.
      expect(caso.titulo.toLowerCase(), `caso ${caso.id}`).not.toContain(caso.respuestaTexto.toLowerCase());
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Panamá|Panama|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?)\b/i;
    for (const caso of CASOS_AULA) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('6 · el aleatorio es reproducible, variado EN ESCENARIOS y usa la misma resolución', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    // Con respuestas cerradas la variedad se mide sobre el escenario (regla de la skill).
    const escenarios = new Set(muestras.map((m) => JSON.stringify([m.datos.inicio, m.datos.cambio])));
    expect(escenarios.size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      const r = resolverCaso(m.datos);
      expect(r.ok, `semilla ${m.semilla}: ${r.error ?? ''}`).toBe(true);
      expect(r.respuesta, `semilla ${m.semilla}`).toBe(m.respuesta);
      expect(m.opciones.map((o) => o.valor), `semilla ${m.semilla}`).toContain(m.respuesta);
    }
  });

  test('7 · las respuestas a mano, y la teoría fijada contra el motor', async () => {
    // (a) Las doce, contra la tabla de la cabecera.
    for (const caso of CASOS_AULA) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_AULA[caso.id]);
    }
    // (b) Un mecanismo por fila: la electrónica depende solo de X + E…
    expect(geometriaDe(4, 0)?.geomElectronica).toBe('Tetraédrica');
    expect(geometriaDe(3, 1)?.geomElectronica).toBe('Tetraédrica');
    expect(geometriaDe(2, 2)?.geomElectronica).toBe('Tetraédrica');
    // …y los pares libres van a posiciones ecuatoriales de la bipirámide: con 3, lineal.
    expect(geometriaDe(2, 3)?.geomMolecular).toBe('Lineal');
    // En el octaedro, dos pares libres se oponen: cuadrada plana.
    expect(geometriaDe(4, 2)?.geomMolecular).toBe('Cuadrada plana');
    // (c) El átomo central no interviene: el caso 9 con otro átomo da lo mismo.
    const caso9 = CASOS_AULA[8];
    const otroAtomo = resolverCaso({ ...caso9.datos, inicio: { ...caso9.datos.inicio, atomo: 'Xe' } });
    expect(otroAtomo.respuesta).toBe(caso9.respuesta);
    // (d) El tope de la app, movido a funciones puras: subir E en el SF₆ recorta X.
    expect(aplicarCambioLibres(6, 0, 1)).toEqual({ enlaces: 5, libres: 1 });
    expect(aplicarCambioEnlaces(4, 2, 5)).toEqual({ enlaces: 5, libres: 1 });
    expect(aplicarCambioEnlaces(2, 2, 4)).toEqual({ enlaces: 4, libres: 2 });
  });

  test('7.bis · ningún caso ni escenario de práctica mueve el otro deslizador ni sale de la tabla', async () => {
    const rejilla = recorrerRejilla();
    expect(rejilla.validos.length).toBeGreaterThan(12);
    const todos = [...CASOS_AULA.map((c) => c.datos), ...rejilla.validos];
    for (const e of todos) {
      const tras = estadoTrasCambio(e.inicio, e.cambio);
      expect(tras.ok, JSON.stringify(e)).toBe(true);
      const f = tras.final!;
      expect(geometriaDe(e.inicio.enlaces, e.inicio.libres), JSON.stringify(e)).not.toBeNull();
      expect(geometriaDe(f.enlaces, f.libres), JSON.stringify(e)).not.toBeNull();
      if (e.cambio.tipo === 'enlaces') {
        expect(f.libres, `el tope tocó los libres: ${JSON.stringify(e)}`).toBe(e.inicio.libres);
        expect(f.enlaces).toBe(e.inicio.enlaces + e.cambio.delta);
      } else if (e.cambio.tipo === 'libres') {
        expect(f.enlaces, `el tope tocó los enlaces: ${JSON.stringify(e)}`).toBe(e.inicio.enlaces);
        expect(f.libres).toBe(e.inicio.libres + e.cambio.delta);
      }
    }
    // Y el filtro del tope existe de verdad: el SF₆ con un par libre más queda excluido.
    const sf6 = estadoTrasCambio({ molecula: 'SF₆', atomo: 'S', enlaces: 6, libres: 0 }, { tipo: 'libres', delta: 1 });
    expect(sf6.ok).toBe(false);
    expect(sf6.motivo).toBe('tope');
  });

  test('8 · corregir no lanza nunca', async () => {
    expect(comprobarPrediccion('Lineal', 'Lineal').correcto).toBe(true);
    expect(comprobarPrediccion('Angular', 'Lineal')).toEqual({ correcto: false, motivo: 'fallo' });
    expect(comprobarPrediccion(null, 'Lineal').motivo).toBe('vacia');
    expect(comprobarPrediccion('Lineal', null).correcto).toBe(false);
  });
});

test.describe('simulador-vsepr · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  test('caso 9: se predice, se carga el punto de partida y el simulador lo confirma', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 9:/ }).click();
    await seccion(page).getByRole('radio', { name: 'Lineal', exact: true }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar', exact: true }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto!');

    // H₂S: X = 2, E = 2. El alumno añade él el tercer par libre y lee la fila de la tabla.
    await seccion(page).getByRole('button', { name: /Cargar el punto de partida/ }).click();
    await expect(ecoDeSlider(page, 'slider-enlaces')).toHaveText('2');
    await expect(ecoDeSlider(page, 'slider-libres')).toHaveText('2');
    await ponerSlider(page, 'slider-libres', 3);
    expect((await leerResultado(page)).geomMolecular).toBe('Lineal');
  });

  test('caso 6: la trampa (cambia la electrónica, no la molecular) se corrige como fallo', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 6:/ }).click();
    await seccion(page).getByRole('radio', { name: 'Trigonal plana', exact: true }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar', exact: true }).click();
    await expect(seccion(page).getByRole('alert')).not.toContainText('¡Correcto!');
    await expect(seccion(page).getByRole('alert')).toContainText('Angular');
  });
});
