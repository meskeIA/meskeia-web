import { test, expect, devices, Page } from '@playwright/test';
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN (29/09/2026) — 438 usos. Foco: lo nuevo desde el 31/08, los 12 casos de aula
 * (e9af3e88), y la sospecha del `touch-action: none` del lienzo en móvil (SOSPECHAS.md, 28/09).
 *
 * Nota de lectura: desde el 26/09/2026 la tabla VSEPR y el tope X + E ≤ 6 viven en
 * `app/simulador-vsepr/motor.ts`; las referencias de línea de `page.tsx` de la cabecera son de la
 * primera inspección.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR (electrones de valencia del átomo
 * central → pares; electrónica = X + E; molecular = solo átomos):
 *
 *   CASO A (normal) · caso 8 «Hacia el ClF₃»
 *     PCl₃: P tiene 5 e⁻ de valencia; 3 enlaces P–Cl gastan 3 → quedan 2 = 1 par libre → AX₃E. ✓
 *     Añadir un par libre → AX₃E₂: 5 dominios → bipirámide trigonal. Los 2 pares libres van al
 *     ECUADOR (en el polo tendrían 3 vecinos a 90°, en el ecuador solo 2), así que quedan 2
 *     átomos en los polos y 1 en el ecuador → FORMA T, ángulo ~90° (ClF₃ real: 87,5°), sp³d.
 *     Comprobación del ejemplo de la app: ClF₃ → Cl 7 e⁻, 3 enlaces → 4 e⁻ = 2 pares libres ✓.
 *     Predicción «Forma T» → debe aceptarse.
 *
 *   CASO B (límite: X + E = 6, el tope) · caso 10 «Del SF₄ al XeF₄»
 *     SF₄: S 6 e⁻; 4 enlaces S–F gastan 4 → quedan 2 = 1 par libre → AX₄E (balancín) ✓.
 *     Añadir un par libre → AX₄E₂ = 6 dominios, justo en el tope: octaédrica. Los 2 pares libres
 *     se ponen OPUESTOS (180°) → los 4 F en un plano → CUADRADA PLANA, 90°, sp³d².
 *     XeF₄: Xe 8 e⁻, 4 enlaces → 4 e⁻ = 2 pares libres ✓. Predicción «Pirámide cuadrada» (la
 *     de UN solo par libre, AX₅E) → debe RECHAZARSE con «Cuadrada plana».
 *     Y el caso 11, desde el mismo SF₄ pero con un ENLACE más → AX₅E: pirámide cuadrada, <90°
 *     (BrF₅ real: ~84,8°). BrF₅ → Br 7 e⁻, 5 enlaces → 2 e⁻ = 1 par libre ✓.
 *
 *   CASO C (a rechazar) · caso 12 «Del SF₆ al XeF₄», pregunta «¿cambia la electrónica?»
 *     SF₆: 6 + 0 = 6 dominios; XeF₄: 4 + 2 = 6 dominios → la electrónica NO cambia (octaédrica).
 *     «Sí: pasa a bipirámide trigonal» (5 dominios) → debe corregirse como fallo con «No cambia».
 *     Y comprobar sin elegir → debe pedir una opción, sin fijar la predicción.
 *
 *   EN MÓVIL (390 × 844) · caso 7 «Hacia el SF₄»
 *     SiCl₄: Si 4 e⁻, 4 enlaces → 0 pares libres → AX₄ ✓. Un par libre más → AX₄E: 5 dominios,
 *     el par libre al ecuador → BALANCÍN (sube y baja), sp³d. Ejemplos de la app para AX₄E:
 *     SF₄ ✓; IF₄⁺ (I 7 − 1 = 6 e⁻, 4 enlaces → 1 par) ✓; IO₂F₂⁻ (I 7 + 1 = 8 e⁻; 2 dobles I=O
 *     y 2 I–F gastan 6 → 1 par) ✓.
 *
 *   Revisados a mano además los otros 8 casos (1-6, 9 y 12 ya en la tabla `A_MANO_AULA`) y los
 *   ejemplos de las 13 filas de `TABLA_VSEPR` por recuento de electrones de valencia: todos los
 *   de grupos principales cuadran (SO₂, O₃ y NO₂⁻ AX₂E; H₃O⁺ AX₃E; XeOF₄ AX₅E; I₃⁻ e ICl₂⁻
 *   AX₂E₃; ICl₄⁻ y BrF₄⁻ AX₄E₂…). La excepción es el complejo de cobalto: ver hallazgos.
 *
 * LA SOSPECHA DEL `touch-action: none` (medida, no descartada por grep)
 *   Medido con Chromium móvil y `Input.dispatchTouchEvent`: un deslizamiento vertical que EMPIEZA
 *   sobre el lienzo NO desplaza la página (Δ = 0) y rota la molécula, que es lo que la app
 *   promete («arrastra con el ratón o el dedo para rotar»; el eje vertical del arrastre es la
 *   rotación en X, así que `pan-y` la mataría). Pero NO atrapa: el lienzo ocupa 274 × 274 px a
 *   390 × 844 (70 % del ancho, 32,5 % del alto), 244 × 244 a 360 × 640 (68 % / 38 %) y 360 × 360 a
 *   844 × 390 apaisado (43 % / 92 %), y siempre deja ≥ 58 px a cada lado por los que el mismo
 *   gesto desplaza la página (Δ ≈ 235 px). Sin hallazgo; lo fija el test de móvil de abajo.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Color de los ligandos X en el lienzo (COLOR_LIGANDO de page.tsx). */
const COLOR_LIGANDO = '#7FB3D3';

interface Punto {
  x: number;
  y: number;
}

/** Lo que pinta el lienzo: centros de los átomos X y de los lóbulos de pares libres. */
async function dibujo(page: Page): Promise<{ ligandos: Punto[]; lobulos: Punto[] }> {
  return page.locator('svg[role="img"]').evaluate((svg, color) => {
    const centro = (el: Element, a: string, b: string) => ({
      x: Number(el.getAttribute(a)),
      y: Number(el.getAttribute(b)),
    });
    return {
      ligandos: Array.from(svg.querySelectorAll('circle'))
        .filter((c) => (c.getAttribute('fill') ?? '').toLowerCase() === color.toLowerCase())
        .map((c) => centro(c, 'cx', 'cy')),
      lobulos: Array.from(svg.querySelectorAll('ellipse')).map((e) => centro(e, 'cx', 'cy')),
    };
  }, COLOR_LIGANDO);
}

/** Dos puntos del lienzo (360 × 360, centro en 180,180) diametralmente opuestos. */
const opuestos = (a: Punto, b: Punto) => Math.abs(a.x + b.x - 360) < 0.5 && Math.abs(a.y + b.y - 360) < 0.5;

/** Cuántas parejas de puntos opuestas hay en la lista (180° entre ellos, vistos desde el centro). */
function parejasOpuestas(puntos: Punto[]): number {
  let n = 0;
  for (let i = 0; i < puntos.length; i++) {
    for (let j = i + 1; j < puntos.length; j++) if (opuestos(puntos[i], puntos[j])) n++;
  }
  return n;
}

/** El valor de una fila del bloque de resultado, por su etiqueta. */
async function filaResultado(page: Page, etiqueta: string): Promise<string> {
  const filas = await page.locator('section', { hasText: 'Resultado:' }).first().locator('[class*="resultRow"]').allInnerTexts();
  const fila = filas.find((f) => f.startsWith(etiqueta));
  if (!fila) throw new Error(`Fila «${etiqueta}» no encontrada en el resultado`);
  return fila.slice(etiqueta.length).trim();
}

test.describe('simulador-vsepr · re-inspección 29/09/2026 · los casos de aula, de punta a punta', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="aula-titulo"]');
  const veredicto = (page: Page) => seccion(page).locator('p[role="alert"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  test('CASO A (normal) · caso 8: «Forma T» se acepta, y el simulador pinta 3 átomos con 2 en los polos', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 8:/ }).click();
    // El enunciado parte del PCl₃ con X = 3, E = 1 (P: 5 e⁻, 3 enlaces → 1 par libre).
    await expect(seccion(page).locator('[class*="aulaEnunciado"]')).toContainText(
      'El PCl₃ tiene 3 pares enlazantes y 1 par libre en su átomo central, el fósforo.',
    );
    await seccion(page).getByRole('radio', { name: 'Forma T', exact: true }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar', exact: true }).click();
    await expect(veredicto(page)).toHaveText('✅ ¡Correcto! La respuesta es «Forma T».');
    // La predicción queda FIJADA: el fieldset se deshabilita y ya no se puede cambiar.
    await expect(seccion(page).getByRole('radio', { name: 'Trigonal plana', exact: true })).toBeDisabled();
    await expect(seccion(page).getByRole('button', { name: /Cargar el punto de partida/ })).toBeFocused();

    await seccion(page).getByRole('button', { name: /Cargar el punto de partida/ }).click();
    await expect(ecoDeSlider(page, 'slider-enlaces')).toHaveText('3');
    await expect(ecoDeSlider(page, 'slider-libres')).toHaveText('1');
    await expect(page.locator('section', { hasText: 'Resultado:' }).locator('h2')).toHaveText(
      'Resultado: AX₃E con átomo central P',
    );
    await ponerSlider(page, 'slider-libres', 2);
    // A mano: AX₃E₂ → bipirámide trigonal, forma T, ~90°, sp³d.
    expect(await leerResultado(page)).toEqual({
      notacion: 'AX₃E₂',
      geomElectronica: 'Bipirámide trigonal',
      geomMolecular: 'Forma T',
      angulo: '~90°',
      hibridacion: 'sp³d',
    });
    // Y el dibujo: 3 átomos X y 2 lóbulos, con DOS átomos opuestos (los polos) y ningún lóbulo
    // opuesto a otro (los dos van al ecuador, a 120°).
    const d = await dibujo(page);
    expect(d.ligandos).toHaveLength(3);
    expect(d.lobulos).toHaveLength(2);
    expect(parejasOpuestas(d.ligandos)).toBe(1);
    expect(parejasOpuestas(d.lobulos)).toBe(0);
  });

  test('CASO B (límite X + E = 6) · caso 10: «Pirámide cuadrada» se rechaza; AX₄E₂ es cuadrada plana con los pares opuestos', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 10:/ }).click();
    await seccion(page).getByRole('radio', { name: 'Pirámide cuadrada', exact: true }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar', exact: true }).click();
    await expect(veredicto(page)).toHaveText(
      '❌ No. Predijiste «Pirámide cuadrada» y la respuesta es «Cuadrada plana». Carga el punto de partida, haz el cambio y mira por qué.',
    );
    await expect(seccion(page).getByRole('button', { name: /^Caso 10:/ })).toHaveAttribute(
      'aria-label',
      'Caso 10: Del SF₄ al XeF₄ (fallado)',
    );

    await seccion(page).getByRole('button', { name: /Cargar el punto de partida/ }).click();
    await expect(ecoDeSlider(page, 'slider-enlaces')).toHaveText('4');
    await expect(ecoDeSlider(page, 'slider-libres')).toHaveText('1');
    await ponerSlider(page, 'slider-libres', 2); // 4 + 2 = 6: en el tope, no recorta X
    await expect(ecoDeSlider(page, 'slider-enlaces')).toHaveText('4');
    // A mano: AX₄E₂ → octaédrica, cuadrada plana, 90°, sp³d².
    expect(await leerResultado(page)).toEqual({
      notacion: 'AX₄E₂',
      geomElectronica: 'Octaédrica',
      geomMolecular: 'Cuadrada plana',
      angulo: '90°',
      hibridacion: 'sp³d²',
    });
    // Los dos pares libres, en vértices OPUESTOS del octaedro; los 4 F, dos parejas opuestas.
    const d = await dibujo(page);
    expect(d.ligandos).toHaveLength(4);
    expect(d.lobulos).toHaveLength(2);
    expect(opuestos(d.lobulos[0], d.lobulos[1])).toBe(true);
    expect(parejasOpuestas(d.ligandos)).toBe(2);
  });

  test('CASO B bis · caso 11: desde el SF₄, un ENLACE más da pirámide cuadrada (<90°) y se acepta', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 11:/ }).click();
    await seccion(page).getByRole('radio', { name: 'Pirámide cuadrada', exact: true }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar', exact: true }).click();
    await expect(veredicto(page)).toHaveText('✅ ¡Correcto! La respuesta es «Pirámide cuadrada».');
    await seccion(page).getByRole('button', { name: /Cargar el punto de partida/ }).click();
    await expect(ecoDeSlider(page, 'slider-enlaces')).toHaveText('4');
    await ponerSlider(page, 'slider-enlaces', 5); // 5 + 1 = 6: en el tope, no recorta E
    await expect(ecoDeSlider(page, 'slider-libres')).toHaveText('1');
    // A mano: AX₅E → octaédrica, pirámide cuadrada, <90° (BrF₅ ~84,8°), sp³d².
    expect(await leerResultado(page)).toEqual({
      notacion: 'AX₅E',
      geomElectronica: 'Octaédrica',
      geomMolecular: 'Pirámide cuadrada',
      angulo: '<90°',
      hibridacion: 'sp³d²',
    });
    const d = await dibujo(page);
    expect(d.ligandos).toHaveLength(5);
    expect(d.lobulos).toHaveLength(1);
  });

  test('CASO C (a rechazar) · caso 12: vacío pide opción; «Sí: pasa a bipirámide trigonal» se corrige con «No cambia»', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 12:/ }).click();
    // Comprobar sin elegir: pide una opción y NO fija la predicción.
    await seccion(page).getByRole('button', { name: 'Comprobar', exact: true }).click();
    await expect(veredicto(page)).toHaveText('✏️ Elige una de las opciones antes de comprobar.');
    await expect(seccion(page).getByRole('radio', { name: 'No cambia', exact: true })).toBeEnabled();
    await seccion(page).getByRole('radio', { name: 'Sí: pasa a bipirámide trigonal', exact: true }).check();
    await expect(veredicto(page)).toHaveCount(0); // elegir retira el aviso de «elige una opción»
    await seccion(page).getByRole('button', { name: 'Comprobar', exact: true }).click();
    await expect(veredicto(page)).toHaveText(
      '❌ No. Predijiste «Sí: pasa a bipirámide trigonal» y la respuesta es «No cambia». Carga el punto de partida, haz el cambio y mira por qué.',
    );
    await expect(seccion(page).locator('[class*="aulaMarcador"]')).toHaveText('Casos comprobados: 1 de 12 · aciertos: 0');

    // Y el simulador lo confirma: SF₆ (6 + 0) → XeF₄ (4 + 2), la electrónica sigue octaédrica.
    await seccion(page).getByRole('button', { name: /Cargar el punto de partida/ }).click();
    await expect(ecoDeSlider(page, 'slider-enlaces')).toHaveText('6');
    expect(await filaResultado(page, 'Geometría electrónica')).toBe('Octaédrica');
    await cargarPreset(page, 'XeF4');
    await expect(ecoDeSlider(page, 'slider-enlaces')).toHaveText('4');
    expect(await filaResultado(page, 'Geometría electrónica')).toBe('Octaédrica');
    expect(await filaResultado(page, 'Geometría molecular')).toBe('Cuadrada plana');
  });
});

test.describe('simulador-vsepr · re-inspección 29/09/2026 · en móvil (390 × 844, táctil)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  const seccion = (page: Page) => page.locator('section[aria-labelledby="aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  test('caso 7 en móvil: «Balancín» se acepta y «Cargar» deja el deslizador a la vista, bajo el logo fijo', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 7:/ }).click();
    await expect(seccion(page).locator('h3')).toHaveText('Caso 7 · Hacia el SF₄');
    await seccion(page).getByRole('radio', { name: 'Balancín (sube y baja)', exact: true }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar', exact: true }).click();
    await expect(seccion(page).locator('p[role="alert"]')).toHaveText(
      '✅ ¡Correcto! La respuesta es «Balancín (sube y baja)».',
    );
    await seccion(page).getByRole('button', { name: /Cargar el punto de partida/ }).click();
    await expect(ecoDeSlider(page, 'slider-enlaces')).toHaveText('4');
    await expect(ecoDeSlider(page, 'slider-libres')).toHaveText('0');
    // El desplazamiento es suave: se espera a que el deslizador quede entre el logo fijo y el pie.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const r = document.getElementById('slider-enlaces')!.getBoundingClientRect();
            const techo = Math.max(
              0,
              ...Array.from(document.querySelectorAll('body *'))
                .filter((n) => getComputedStyle(n).position === 'fixed')
                .map((n) => n.getBoundingClientRect())
                .filter((f) => f.height > 0 && f.top <= 0)
                .map((f) => f.bottom),
            );
            return r.top >= techo && r.bottom <= window.innerHeight;
          }),
        { timeout: 5000 },
      )
      .toBe(true);
    await ponerSlider(page, 'slider-libres', 1);
    // A mano: AX₄E → bipirámide trigonal, balancín, sp³d; con el par libre en el ecuador quedan
    // 2 átomos opuestos (los polos).
    expect(await leerResultado(page)).toEqual({
      notacion: 'AX₄E',
      geomElectronica: 'Bipirámide trigonal',
      geomMolecular: 'Balancín (sube y baja)',
      angulo: '~90° y ~120°',
      hibridacion: 'sp³d',
    });
    const d = await dibujo(page);
    expect(d.ligandos).toHaveLength(4);
    expect(parejasOpuestas(d.ligandos)).toBe(1);
    // Sin desbordamiento horizontal a 390 px.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('SOSPECHA touch-action (medida): el gesto sobre el lienzo rota la molécula, pero el lienzo no atrapa', async ({ page }) => {
    const svg = page.locator('svg[role="img"]');
    await page.evaluate(() => {
      const r = document.querySelector('svg[role="img"]')!.getBoundingClientRect();
      window.scrollBy(0, r.top + r.height / 2 - window.innerHeight / 2);
    });
    await expect.poll(async () => (await svg.boundingBox())?.y ?? -1).toBeGreaterThan(0);
    const caja = (await svg.boundingBox())!;
    // Medido el 29/09/2026: 274 × 274 px → 70 % del ancho y 32,5 % del alto, 58 px libres por lado.
    expect(caja.width / 390).toBeLessThan(0.8);
    expect(caja.height / 844).toBeLessThan(0.5);
    expect(caja.x).toBeGreaterThanOrEqual(48); // un dedo cabe en el margen izquierdo

    const cdp = await page.context().newCDPSession(page);
    const deslizar = async (x: number, y0: number, y1: number): Promise<void> => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
      for (let i = 1; i <= 12; i++) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x, y: y0 + ((y1 - y0) * i) / 12 }],
        });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const huella = () =>
      svg.evaluate((s) => Array.from(s.querySelectorAll('circle')).map((c) => `${c.getAttribute('cx')},${c.getAttribute('cy')}`).join(' '));
    const scrollY = () => page.evaluate(() => window.scrollY);

    const cx = Math.round(caja.x + caja.width / 2);
    const cy = Math.round(caja.y + caja.height / 2);

    // 1) Empezando en el lienzo: rota la molécula (la función prometida: «arrastra con el dedo»).
    const antesHuella = await huella();
    const antesScroll = await scrollY();
    await deslizar(cx, cy + 100, cy - 100);
    await expect.poll(huella).not.toBe(antesHuella);
    await page.waitForTimeout(500);
    test.info().annotations.push({
      type: 'medida',
      description: `Δscroll con el gesto iniciado en el lienzo: ${(await scrollY()) - antesScroll} px (29/09/2026: 0)`,
    });

    // 2) El mismo gesto por el margen lateral SÍ desplaza la página: no queda atrapado.
    const antesMargen = await scrollY();
    await deslizar(Math.round(caja.x / 2), cy + 100, cy - 100);
    await expect.poll(async () => (await scrollY()) - antesMargen).toBeGreaterThan(100);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * HALLAZGOS ABIERTOS de la re-inspección del 29/09/2026. Cada uno con `test.fail()`: pasa en
 * verde MIENTRAS el defecto siga ahí; cuando se repare, se quita `test.fail()` y el comentario
 * pasa a «REPARADO».
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */
test.describe('simulador-vsepr · hallazgos de la re-inspección del 29/09/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, DESLIZADORES);
  });

  // ABIERTO (operativa, medio): con X = 3 y E = 3 el lienzo pinta un OCTAEDRO de 6 átomos X y
  // ningún lóbulo. `asignarVertices` (page.tsx), rama total === 6, solo reparte pares libres para
  // E = 1 y E = 2; con E = 3 el conjunto queda vacío y los 6 vértices salen como enlaces. Se llega
  // sin rebuscar: cargar SF₆ y subir «Pares libres» al máximo (el tope recorta X a 3).
  test.fail('X = 3, E = 3 (SF₆ + pares libres al máximo): el lienzo debe pintar 3 átomos X, no 6', async ({ page }) => {
    await cargarPreset(page, 'SF6');
    await ponerSlider(page, 'slider-libres', 3);
    await expect(ecoDeSlider(page, 'slider-enlaces')).toHaveText('3');
    await expect(page.getByText('Combinación poco común')).toBeVisible();
    const d = await dibujo(page);
    // Esperado: tantos átomos X como pares enlazantes (3). Obtenido el 29/09/2026: 6, y 0 lóbulos.
    expect(d.ligandos).toHaveLength(3);
  });

  // ABIERTO (contenido, bajo): la ficha «Pares libres en bipirámide» dice «En geometría AX₅E
  // variantes, los pares libres se sitúan en posiciones ECUATORIALES». AX₅E es, en la propia
  // tabla de la app, OCTAÉDRICA (pirámide cuadrada); las variantes de la bipirámide son AX₄E,
  // AX₃E₂ y AX₂E₃ (las de AX₅).
  test.fail('la ficha de la bipirámide no puede atribuirle AX₅E, que la tabla da como octaédrica', async ({ page }) => {
    expect(geometriaDe(5, 1)?.geomElectronica).toBe('Octaédrica');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const ficha = page.locator('[class*="tipCard"]', { hasText: 'Pares libres en bipirámide' });
    await expect(ficha).toBeVisible();
    await expect(ficha).not.toContainText('AX₅E');
  });

  // ABIERTO (dato, bajo): la fila AX₆ da como ejemplo [Co(NH₃)₆]³⁺ junto a «Hibridación: sp³d²».
  // Es un complejo de un metal de transición —la propia app avisa en «Errores frecuentes» de no
  // aplicarles VSEPR— y en enlace de valencia es un complejo de orbital INTERNO, d²sp³ (bajo
  // espín, diamagnético), no sp³d² (que es el de [CoF₆]³⁻).
  test.fail('los ejemplos de AX₆ (sp³d²) no incluyen un complejo de cobalto d²sp³', async ({ page }) => {
    await cargarPreset(page, 'SF6');
    expect(await filaResultado(page, 'Hibridación')).toBe('sp³d²');
    expect(await filaResultado(page, 'Ejemplos reales')).not.toContain('[Co(NH₃)₆]³⁺');
  });

  // ABIERTO (contenido, bajo): «Pares totales» concuerda en plural con 1: «4 (3 enlazantes +
  // 1 libres)» en el NH₃, y «1 enlazantes» con X = 1.
  test.fail('«Pares totales» del NH₃ concuerda en singular: «1 libre»', async ({ page }) => {
    await cargarPreset(page, 'NH3');
    expect(await filaResultado(page, 'Pares totales')).toBe('4 (3 enlazantes + 1 libre)');
  });

  // ABIERTO (accesibilidad, bajo): fuera de la tabla, el nombre accesible del lienzo se queda en
  // «Molécula : » (notación y geometría vacías): el lector de pantalla no dice qué se dibuja.
  test.fail('fuera de la tabla (X = 1, E = 0), el lienzo conserva un nombre accesible con contenido', async ({ page }) => {
    await ponerSlider(page, 'slider-enlaces', 1);
    await expect(page.getByText('Combinación poco común')).toBeVisible();
    await expect(page.locator('svg[role="img"]')).not.toHaveAttribute('aria-label', 'Molécula : ');
  });
});
