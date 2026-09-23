import { test, expect, Page } from '@playwright/test';

/**
 * Inspector — simulador-ecosistema-trofico (segmento interactiva, riesgo 3, 294 usos reales)
 *
 * Primera inspección: 25/08/2026. El <h1> promete «Simulador de Ecosistema: Cadena Trófica»
 * y el subtítulo «Selecciona un ecosistema, aplica una perturbación y observa cómo la cascada
 * trófica transforma cada nivel». La metadata promete «Simula el impacto de perturbaciones en
 * un ecosistema. Observa cómo una sequía, una plaga o la caza excesiva desencadena cascadas
 * tróficas en pradera, bosque, océano y sabana».
 *
 * El modelo NO es Lotka-Volterra ni admite verdad ecológica externa: es una cascada algebraica
 * de un solo paso, inventada para la app. Lo comprobable es, por tanto, (a) que la aritmética
 * de la pantalla sea EXACTAMENTE la de la fórmula del código y (b) las invariantes: sin NaN,
 * sin poblaciones negativas, suelos respetados, e intensidad 0 % = identidad.
 *
 * DÓNDE VIVE EL CÁLCULO — app/simulador-ecosistema-trofico/motor.ts (desde el 23/09/2026;
 *   antes, dentro de page.tsx). generarExplicacion() y el render siguen en page.tsx.
 *   · const ECOSISTEMAS  → 4 ecosistemas × 4 niveles con `poblacion` de partida.
 *                          Pradera = [100, 40, 15, 5] (productores → superdepredadores).
 *   · const EVENTOS      → sequía {nivel 0, impacto −0,6} · caza-depredador {nivel 2, −0,7}
 *                          plaga-herbivoro {nivel 1, +0,8} · contaminacion {nivel 0, −0,5}
 *   · aplicarEvento()    → cambio = impacto × intensidad
 *       nivel afectado:      P[idx] = max(5, min(100, P0[idx] × (1 + cambio)))
 *       cascada HACIA ARRIBA (i = idx+1 … 3), con factorPresa = P[i−1] / P0[i−1]:
 *                            P[i]   = max(2, min(100, P0[i] × (0,3 + 0,7 × factorPresa)))
 *       cascada HACIA ABAJO  (i = idx−1 … 0), con factorDepred = P[i+1] / P0[i+1]:
 *                            P[i]   = max(5, min(100, P0[i] × (1 + 0,7 × (1 − factorDepred))))
 *                            Atenúa con el MISMO 0,7 que la de arriba desde el 25/08/2026
 *                            (hallazgo 324); antes era `2 − factorDepred` y no atenuaba.
 *   · generarExplicacion() → % = round(|nuevo − viejo| / viejo × 100); solo se nombra si > 2
 *   · Render: `Math.round(poblacion)` en la pirámide, en la barra y en aria-valuenow;
 *             el delta es `Math.round(actual − original)` y se pinta si `actual !== original`.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — Pradera + Sequía + intensidad 50 %
 *     cambio = −0,6 × 0,5 = −0,30 · idx = 0 · solo hay cascada hacia arriba
 *       P0 = max(5, min(100, 100 × 0,70))                       = 70,0      → «70»  (−30)
 *       P1: factorPresa = 70/100 = 0,70
 *           = 40 × (0,3 + 0,7 × 0,70) = 40 × 0,79               = 31,6      → «32»  (−8)
 *       P2: factorPresa = 31,6/40 = 0,79
 *           = 15 × (0,3 + 0,7 × 0,79) = 15 × 0,853              = 12,795    → «13»  (−2)
 *       P3: factorPresa = 12,795/15 = 0,853
 *           = 5 × (0,3 + 0,7 × 0,853) = 5 × 0,8971              = 4,4855    → «4»   (−1)
 *       Deltas: round(−30)=−30 · round(−8,4)=−8 · round(−2,205)=−2 · round(−0,5145)=−1
 *       Porcentajes de la explicación: 30 % · round(21,0)=21 % · round(14,7)=15 % ·
 *                                      round(10,29)=10 %, todos «reducido».
 *
 *   CASO 2 (límite: suelo de población) — Pradera + Caza excesiva del depredador + 100 %
 *     cambio = −0,7 × 1 = −0,70 · idx = 2 · hay cascada en las DOS direcciones
 *       P2 = max(5, min(100, 15 × 0,30 = 4,5))                  = 5   ← EL SUELO MUERDE
 *       arriba  P3: factorPresa = 5/15 = 0,3333
 *           = 5 × (0,3 + 0,7 × 0,3333) = 5 × 0,53333            = 2,6667   → «3»   (−2)
 *       abajo   P1: factorDepred = 5/15 = 0,3333
 *           = 40 × (1 + 0,7 × (1 − 0,3333)) = 40 × 1,46667      = 58,6667  → «59»  (+19)
 *       abajo   P0: factorDepred = 58,6667/40 = 1,46667
 *           = 100 × (1 + 0,7 × (1 − 1,46667)) = 100 × 0,67333   = 67,3333  → «67»  (−33)
 *       Invariantes: ninguna población negativa ni NaN; el suelo max(5, …) impide que un
 *       nivel se extinga (15 → 5 = 33 % de la original, nunca 0), aunque la pista de la FAQ
 *       hable de «la eliminación de un nivel». La cascada hacia ABAJO se apaga nivel a nivel:
 *       −67 % en carnívoros produce +47 % en herbívoros y −33 % en productores.
 *       (Con la fórmula anterior al 25/08 daba 67 (+27) y 33 (−67): se propagaba intacta.)
 *
 *   CASO 3 (degenerado: la perturbación que no perturba) — cualquier evento + intensidad 0 %
 *     cambio = impacto × 0 = 0 ⇒ P[idx] = P0[idx] × 1 · factorPresa = 1 ⇒ (0,3 + 0,7) = 1
 *     · factorDepred = 1 ⇒ (1 + 0,7 × 0) = 1. Y en coma flotante 0,3 + 0,7 === 1 EXACTO, así que
 *     la identidad es exacta y NO debe pintarse ningún paréntesis de delta.
 *       Pradera queda en [100, 40, 15, 5] con el evento seleccionado.
 *       Como ningún porcentaje supera el 2 %, la explicación cae en la rama sin partes:
 *       «… Con una intensidad del 0%, el impacto en las poblaciones es mínimo.»
 */

const RUTA = '/simulador-ecosistema-trofico/';

/** Lee las 4 barras: población redondeada (aria-valuenow) y el texto con su delta. */
async function leerBarras(page: Page): Promise<{ etiqueta: string; valor: number; texto: string }[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('[role="meter"]')].map((m) => {
      const grupo = m.parentElement!.parentElement!;
      const fila = grupo.children[0];
      return {
        etiqueta: m.getAttribute('aria-label') ?? '',
        valor: Number(m.getAttribute('aria-valuenow')),
        texto: (fila.children[1].textContent ?? '').trim().replace(/\s+/g, ' '),
      };
    })
  );
}

async function seleccionar(page: Page, evento: string, intensidad: string): Promise<void> {
  await page.getByRole('button', { name: evento, exact: true }).click();
  await page.locator('#slider-intensidad').fill(intensidad);
  await expect(page.locator('label[for="slider-intensidad"]')).toContainText(
    `${Math.round(parseFloat(intensidad) * 100)}%`
  );
}

test.describe('simulador-ecosistema-trofico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Cadena Trófica');
    // Estado de fábrica: Pradera [100, 40, 15, 5] y ninguna perturbación
    await expect(page.locator('[role="meter"]')).toHaveCount(4);
  });

  test('CASO 1 · Pradera + sequía al 50 % → 70 / 32 / 13 / 4 con su cascada', async ({ page }) => {
    await seleccionar(page, 'Sequía', '0.5');
    const barras = await leerBarras(page);

    // Valores del encabezado del fichero, CASO 1: 100×0,70=70 · 40×0,79=31,6 ·
    // 15×0,853=12,795 · 5×0,8971=4,4855, redondeados para pintar.
    expect(barras.map((b) => b.valor)).toEqual([70, 32, 13, 4]);
    expect(barras.map((b) => b.texto)).toEqual(['70 (-30)', '32 (-8)', '13 (-2)', '4 (-1)']);

    // La pirámide debe decir lo mismo que las barras (mismo dato, dos vistas)
    await expect(page.getByText('70 ind. rel.')).toBeVisible();
    await expect(page.getByText('32 ind. rel.')).toBeVisible();
    await expect(page.getByText('13 ind. rel.')).toBeVisible();
    // exact: por subcadena, «4 ind. rel.» también casaría con «14 ind. rel.».
    await expect(page.getByText('4 ind. rel.', { exact: true })).toBeVisible();

    // Porcentajes de generarExplicacion(): 30 · 21 · 15 · 10, todos a la baja
    const explicacion = page.locator('[role="status"]');
    await expect(explicacion).toContainText('productores han reducido un 30%');
    await expect(explicacion).toContainText('herbívoros han reducido un 21%');
    await expect(explicacion).toContainText('carnívoros han reducido un 15%');
    await expect(explicacion).toContainText('superdepredadores han reducido un 10%');
  });

  test('CASO 2 · caza del depredador al 100 % → el suelo de 5 muerde y la cascada va en ambos sentidos', async ({
    page,
  }) => {
    await seleccionar(page, 'Caza excesiva del depredador', '1');
    const barras = await leerBarras(page);

    // 15 × 0,30 = 4,5 recortado a 5 por max(5, …). Desde el 25/08/2026 la cascada atenúa en
    // los DOS sentidos con el mismo factor 0,7 (hallazgo 324): antes la de arriba atenuaba y
    // la de abajo trasladaba el cambio intacto, sin ninguna razón biológica detrás.
    //   hacia arriba  · superdepredadores: 5 × (0,3 + 0,7 × 5/15)      = 2,667 → 3
    //   hacia abajo   · herbívoros:       40 × (1 + 0,7 × (1 − 5/15))  = 58,67 → 59
    //                 · productores:     100 × (1 + 0,7 × (1 − 58,67/40)) = 67,33 → 67
    // La cascada se APAGA a cada nivel: −67 % en carnívoros, +47 % en herbívoros, −33 % en
    // productores. Antes daba −67 %, +67 %, −67 %: se propagaba intacta.
    expect(barras.map((b) => b.valor)).toEqual([67, 59, 5, 3]);
    expect(barras.map((b) => b.texto)).toEqual(['67 (-33)', '59 (+19)', '5 (-10)', '3 (-2)']);

    // El nivel cazado NO se extingue: el suelo lo deja en 5 = 33 % de los 15 originales
    expect(barras[2].valor).toBe(5);
    expect(barras[2].etiqueta).toBe('Carnívoros: 5 individuos relativos');

    // INVARIANTES: nada negativo, nada por encima de 100, ningún NaN
    for (const b of barras) {
      expect(Number.isFinite(b.valor)).toBe(true);
      expect(b.valor).toBeGreaterThan(0);
      expect(b.valor).toBeLessThanOrEqual(100);
      expect(b.texto).not.toContain('NaN');
    }

    // Sentido ecológico de la cascada: menos carnívoros ⇒ más herbívoros ⇒ menos productores
    expect(barras[1].valor).toBeGreaterThan(40); // herbívoros suben desde 40
    expect(barras[0].valor).toBeLessThan(100); // productores bajan desde 100

    // La cascada se APAGA nivel a nivel, que es lo que el bloque educativo promete: el −67 %
    // de los carnívoros llega como +47 % a los herbívoros y como −33 % a los productores.
    // Antes se propagaba intacta —67 % en los tres— y el texto del paso 3 mentía.
    const explicacion = page.locator('[role="status"]');
    await expect(explicacion).toContainText('carnívoros han reducido un 67%');
    await expect(explicacion).toContainText('herbívoros han aumentado un 47%');
    await expect(explicacion).toContainText('productores han reducido un 33%');
    await expect(explicacion).toContainText('superdepredadores han reducido un 47%');
  });

  test('CASO 3 · degenerado: intensidad 0 % deja el ecosistema idéntico y sin deltas', async ({ page }) => {
    await seleccionar(page, 'Caza excesiva del depredador', '0');
    const barras = await leerBarras(page);

    // Valores del encabezado, CASO 3: cambio = −0,7 × 0 = 0 ⇒ todos los factores valen 1
    // exactos (0,3 + 0,7 === 1 en coma flotante), así que se recupera la Pradera de fábrica.
    expect(barras.map((b) => b.valor)).toEqual([100, 40, 15, 5]);

    // Y al no haber diferencia, NO debe pintarse ningún paréntesis de cambio
    expect(barras.map((b) => b.texto)).toEqual(['100', '40', '15', '5']);
    for (const b of barras) expect(b.texto).not.toContain('(');

    // Rama sin partes de generarExplicacion(): describe el evento pero no nombra ningún nivel
    const explicacion = page.locator('[role="status"]');
    await expect(explicacion).toContainText(
      'Con una intensidad del 0%, el impacto en las poblaciones es mínimo.'
    );
    await expect(explicacion).not.toContainText('han reducido');
    await expect(explicacion).not.toContainText('han aumentado');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (23/09/2026) — tarea de tipo C: PREDICCIÓN ANTES DE MOVER.
 *
 * Primera app del catálogo con una tarea de aula enteramente de predicción (equilibrio
 * químico, 11/09, mezcla predicción y cálculo). El alumno se compromete con «sube / baja /
 * no cambia» ANTES de cargar el escenario en el simulador; sin ese compromiso, mover la
 * perturbación y mirar las barras no enseña nada porque no había hipótesis que romper.
 *
 * La regla que lo hace viable: la respuesta correcta sale de EJECUTAR el modelo de la app, no
 * de una tabla escrita a mano. Por eso el modelo se MOVIÓ de page.tsx a motor.ts (una sola
 * implementación) y casos.ts lo ejecuta:
 *   app/simulador-ecosistema-trofico/motor.ts   ← ECOSISTEMAS, EVENTOS, ATENUACION, aplicarEvento
 *   app/simulador-ecosistema-trofico/casos.ts   ← los 12 casos, el corrector y el aleatorio
 * Las cifras del acta de arriba (70/32/13/4 con sequía al 50 %) siguen saliendo: el traslado
 * no movió un número.
 *
 * LAS TRES TRAMPAS que se midieron ejecutando el modelo en 4 ecosistemas × 4 perturbaciones ×
 * 4 intensidades (256 combinaciones nivel-escenario) ANTES de escribir un caso:
 *   1 · El redondeo esconde el cambio. La app pinta Math.round(población): en 14 de 256 el
 *       modelo se mueve y la pantalla no (bosque + sequía al 50 %: superdepredadores
 *       4 → 3,59, que se pinta «4»). La respuesta se evalúa sobre lo VISIBLE, y ningún
 *       escenario donde modelo y pantalla discrepen puede ser caso ni ejercicio.
 *   2 · El suelo de población muerde con la caza al 100 % (carnívoros a 5 en los cuatro
 *       ecosistemas). Solo se usan intensidades 0,5 y 0,7.
 *   3 · El ecosistema no cambia los PORCENTAJES (poblaciones proporcionales): no hay casos
 *       que comparen ecosistemas.
 *
 * LAS REGLAS DEL MODELO que fija la invariante 7 (derivadas de aplicarEvento, no de la app):
 *   · el nivel golpeado cambia en impacto × intensidad;
 *   · HACIA ARRIBA, cada nivel va en la dirección de su presa (se queda sin comida o la gana);
 *   · HACIA ABAJO, cada nivel va en la dirección CONTRARIA a su depredador (se libera o lo
 *     cazan más);
 *   · el cambio relativo se multiplica por 0,7 a cada paso: la cascada se apaga.
 *
 * A mano (pradera, caza del depredador al 50 %, cambio = −0,7 × 0,5 = −0,35):
 *   carnívoros  15 × 0,65                               = 9,75   → «10»  baja
 *   superdep.   5 × (0,3 + 0,7 × 0,65) = 5 × 0,755     = 3,775  → «4»   baja (presa baja)
 *   herbívoros  40 × (1 + 0,7 × 0,35)  = 40 × 1,245    = 49,8   → «50»  SUBE (depredador baja)
 *   productores 100 × (1 − 0,7 × 0,245)                 = 82,85  → «83»  baja (depredador sube)
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

import { esperarHidratacion } from './_hidratacion';
import {
  CASOS as CASOS_AULA,
  TOTAL_CASOS as TOTAL_CASOS_AULA,
  OPCIONES_DIRECCION,
  resolverCaso,
  simularEscenario,
  direccionVisible,
  escenarioSinTrampaDeRedondeo,
  comprobarPrediccion,
  generarEjercicioAleatorio,
  type PerturbacionCaso,
  type IndiceNivel,
} from '../../app/simulador-ecosistema-trofico/casos';
import { ECOSISTEMAS, EVENTOS } from '../../app/simulador-ecosistema-trofico/motor';

const PERTURBACIONES: readonly PerturbacionCaso[] = ['sequia', 'caza-depredador', 'plaga-herbivoro', 'contaminacion'];

test.describe('simulador-ecosistema-trofico · casos para clase (predicción)', () => {
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

  test('3 · la respuesta declarada es la que da EJECUTAR el modelo desde `datos`', async () => {
    for (const caso of CASOS_AULA) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(r.respuesta, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, opciones cerradas que contienen la respuesta y mecanismo', async () => {
    for (const caso of CASOS_AULA) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.opciones.length, `caso ${caso.id}`).toBe(3);
      expect(caso.opciones.map((o) => o.valor), `caso ${caso.id}`).toContain(caso.respuesta);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      // Ningún caso pregunta por el nivel golpeado directamente: ahí no hay nada que predecir.
      const golpeado = EVENTOS.find((e) => e.id === caso.datos.eventoId)?.nivelAfectado;
      if (caso.datos.clase === 'direccion') {
        expect(caso.datos.nivel, `caso ${caso.id}`).not.toBe(golpeado);
        // Las opciones de dirección, siempre las mismas y en el mismo orden.
        expect(caso.opciones).toEqual(OPCIONES_DIRECCION);
      }
    }
    // Mezcla de las dos clases de pregunta.
    const clases = new Set(CASOS_AULA.map((c) => c.datos.clase));
    expect(clases).toEqual(new Set(['direccion', 'comparacion']));
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?)\b/i;
    for (const caso of CASOS_AULA) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · la explicación enseña las cifras que el alumno VE, no las del modelo', async () => {
    // El equivalente, en el tipo C, a «lo que el enunciado pide coincide con lo que la
    // solución muestra»: la pantalla pinta enteros, así que el mecanismo habla en enteros.
    for (const caso of CASOS_AULA) {
      const r = resolverCaso(caso.datos);
      for (const v of r.despues) expect(Number.isInteger(v), `caso ${caso.id}`).toBe(true);
      const texto = r.pasos.join(' ');
      expect(texto, `caso ${caso.id}: un decimal suelto en el mecanismo`).not.toMatch(/\d,\d{3,}/);
    }
  });

  test('6 · el aleatorio es reproducible, variado, sin trampa de redondeo y con el mismo motor', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    // En el tipo C casi solo hay dos respuestas posibles (sube / baja), así que la variedad
    // se mide sobre el ESCENARIO: con una sola semilla, o midiendo respuestas, un generador
    // degenerado pasaría (simulador-genetica, 14/09/2026).
    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    const ternas = new Set(muestras.map((m) => `${m.datos.ecosistemaId}|${m.datos.eventoId}|${m.datos.nivel}`));
    expect(ternas.size).toBeGreaterThanOrEqual(10);
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBe(2);
    for (const m of muestras) {
      expect(resolverCaso(m.datos).respuesta, `semilla ${m.semilla}`).toBe(m.respuesta);
      expect(
        escenarioSinTrampaDeRedondeo(m.datos.ecosistemaId, m.datos.eventoId, m.datos.intensidad),
        `semilla ${m.semilla}`,
      ).toBe(true);
    }
  });

  test('7 · la opción correcta sale de ejecutar el modelo: un caso a mano por mecanismo', async () => {
    // (a) De ABAJO ARRIBA — sequía al 50 % en la pradera: el acta de arriba, 70/32/13/4.
    const sequia = simularEscenario('pradera', 'sequia', 0.5);
    expect(sequia.visibles).toEqual([70, 32, 13, 4]);

    // (b) De ARRIBA ABAJO con alternancia — la cuenta de la cabecera: 83/50/10/4.
    const caza = simularEscenario('pradera', 'caza-depredador', 0.5);
    expect(caza.visibles).toEqual([83, 50, 10, 4]);
    expect(direccionVisible(40, caza.modelo[1])).toBe('sube');
    expect(direccionVisible(100, caza.modelo[0])).toBe('baja');

    // (c) MIXTO — plaga de herbívoros al 50 % en la sabana: 42 × 1,4 = 58,8 → «59»; arriba
    // todo sube (más comida) y abajo la vegetación baja: 100 × (1 − 0,7 × 0,4) = 72.
    const plaga = simularEscenario('sabana', 'plaga-herbivoro', 0.5);
    expect(plaga.visibles[0]).toBe(72);
    expect(plaga.visibles[1]).toBe(59);
    expect(plaga.visibles[2]).toBeGreaterThan(16);
    expect(plaga.visibles[3]).toBeGreaterThan(6);

    // (d) TRAMPA 1, el caso de origen: bosque + sequía al 50 %, superdepredadores 4 → 3,59.
    const bosque = simularEscenario('bosque', 'sequia', 0.5);
    expect(bosque.modelo[3]).toBeCloseTo(3.59, 2);
    expect(bosque.visibles[3]).toBe(4);
    expect(direccionVisible(4, bosque.modelo[3])).toBe('no-cambia');
    expect(escenarioSinTrampaDeRedondeo('bosque', 'sequia', 0.5)).toBe(false);

    // (e) TRAMPA 2: al 100 % el suelo muerde, y esa intensidad no se admite.
    const alCien = resolverCaso({ clase: 'direccion', ecosistemaId: 'pradera', eventoId: 'caza-depredador', intensidad: 1, nivel: 1 });
    expect(alCien.ok).toBe(false);
    expect(alCien.respuesta).toBeNull();

    // (f) Barrido completo de los escenarios válidos: la dirección de cada nivel no golpeado
    // es la que dictan las reglas de la cabecera, y «no cambia» nunca es la correcta.
    let comprobados = 0;
    for (const eco of ECOSISTEMAS) {
      for (const ev of PERTURBACIONES) {
        for (const intensidad of [0.5, 0.7]) {
          if (!escenarioSinTrampaDeRedondeo(eco.id, ev, intensidad)) continue;
          const evento = EVENTOS.find((e) => e.id === ev)!;
          const idx = evento.nivelAfectado;
          const signoGolpe = Math.sign(evento.impacto);
          for (let nivel = 0; nivel < 4; nivel++) {
            if (nivel === idx) continue;
            const r = resolverCaso({ clase: 'direccion', ecosistemaId: eco.id, eventoId: ev, intensidad, nivel: nivel as IndiceNivel });
            // Arriba: mismo signo que el golpe. Abajo: alterna a cada paso.
            const esperado = nivel > idx ? signoGolpe : signoGolpe * (-1) ** (idx - nivel);
            expect(r.respuesta, `${eco.id} · ${ev} · ${intensidad} · nivel ${nivel}`).toBe(esperado > 0 ? 'sube' : 'baja');
            comprobados++;
          }
        }
      }
    }
    // 32 escenarios − 5 descartados por la trampa 1, × 3 niveles no golpeados.
    expect(comprobados).toBe(27 * 3);
  });

  test('8 · corregir no lanza nunca, ni sin elección ni con un caso imposible', async () => {
    expect(comprobarPrediccion('sube', 'sube').correcto).toBe(true);
    expect(comprobarPrediccion('no-cambia', 'baja').correcto).toBe(false);
    expect(comprobarPrediccion(null, 'baja').motivo).toBe('vacia');
    expect(comprobarPrediccion('sube', null).motivo).toBe('no-disponible');
    const inexistente = resolverCaso({ clase: 'direccion', ecosistemaId: 'marte', eventoId: 'sequia', intensidad: 0.5, nivel: 1 });
    expect(inexistente.ok).toBe(false);
    // La contaminación no admite preguntas de MAGNITUD: su descripción promete golpear a los
    // herbívoros y el modelo solo golpea a los productores.
    const magnitud = resolverCaso({ clase: 'comparacion', ecosistemaId: 'pradera', eventoId: 'contaminacion', intensidad: 0.7, nivelA: 1, nivelB: 2 });
    expect(magnitud.ok).toBe(false);
  });
});

test.describe('simulador-ecosistema-trofico · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['section[aria-labelledby="aula-titulo"] input[type="radio"]']);
  });

  test('comprometerse, comprobar y SOLO entonces cargar el escenario en el simulador', async ({ page }) => {
    // Caso 3: pradera + caza al 50 %, ¿qué les pasa a los herbívoros? → suben (40 → 50).
    await seccion(page).getByRole('button', { name: /^Caso 3:/ }).click();
    await expect(seccion(page).getByRole('button', { name: /Cargar en el simulador/ })).toHaveCount(0);

    await seccion(page).getByRole('radio', { name: 'Sube' }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('Correcto');
    // La elección queda bloqueada: no se puede cambiar la predicción tras ver el veredicto.
    await expect(seccion(page).getByRole('radio', { name: 'Baja' })).toBeDisabled();

    await seccion(page).getByRole('button', { name: /Cargar en el simulador/ }).click();
    await expect(page.locator('label[for="slider-intensidad"]')).toContainText('50%');
    const barras = page.locator('[role="meter"]');
    await expect(barras.nth(1)).toHaveAttribute('aria-valuenow', '50');
    await expect(barras.nth(0)).toHaveAttribute('aria-valuenow', '83');
  });

  test('«no cambia» en un nivel no adyacente se corrige como el error típico que es', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 4:/ }).click();
    await seccion(page).getByRole('radio', { name: 'No cambia' }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('No. Predijiste');
  });
});
