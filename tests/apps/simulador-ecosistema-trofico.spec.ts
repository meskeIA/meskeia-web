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
 *       «… Con una intensidad del 0 %, el impacto en las poblaciones es mínimo.»
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
  // Con espacio de no separación entre la cifra y el signo (sospecha del Inspector, 24/09/2026).
  await expect(page.locator('label[for="slider-intensidad"]')).toContainText(
    `${Math.round(parseFloat(intensidad) * 100)}\u00A0%`
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

    // Porcentajes de generarExplicacion(): 30 · 21 · 15 · 10, todos a la baja. Se aserta la
    // frase entera porque el verbo solo se escribe una vez: el sentido de los tres últimos lo
    // da la elipsis, y un trozo suelto («herbívoros un 21 %») ya no lo comprobaría.
    const explicacion = page.locator('[role="status"]');
    await expect(explicacion).toContainText(
      'Los productores se han reducido un 30 %, los herbívoros un 21 %, los carnívoros un 15 % y los superdepredadores un 10 %.'
    );
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
    await expect(explicacion).toContainText(
      'Los productores se han reducido un 33 %, los herbívoros han aumentado un 47 %, los carnívoros se han reducido un 67 % y los superdepredadores un 47 %.'
    );
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
      'Con una intensidad del 0 %, el impacto en las poblaciones es mínimo.'
    );
    await expect(explicacion).not.toContainText('han reducido');
    await expect(explicacion).not.toContainText('han aumentado');
  });

  // Sospecha del Inspector (24/09/2026): unos 15 «N%» pegados, contra la norma española
  // «N %». Entrada: caza del depredador al 71 %. Esperado: la etiqueta dice «71 %» con
  // espacio de no separación, la leyenda «10 %» / «1 %», y en ningún texto de la página
  // —bloque educativo colapsado incluido, por eso textContent y no innerText— queda una
  // cifra pegada al signo. Los anchos de la pirámide ('30%'…'100%') son CSS y no salen aquí.
  test('SOSPECHA · ningún porcentaje visible va pegado a la cifra: «71 %», no «71%»', async ({ page }) => {
    await seleccionar(page, 'Caza excesiva del depredador', '0.71');
    const etiqueta = await page.locator('label[for="slider-intensidad"]').textContent();
    expect(etiqueta).toContain('71\u00A0%');

    const textos = await page.evaluate(() => {
      const main = document.querySelector('main') ?? document.body;
      const copia = main.cloneNode(true) as HTMLElement;
      // Fuera también las tarjetas de apps relacionadas: su texto sale de data/app-relations.ts
      // y es de OTRAS apps («Pirámide trófica, regla del 10% y ciclos…» es de visualizador-ecosistema).
      copia
        .querySelectorAll('script, style, section[aria-label="Aplicaciones relacionadas"]')
        .forEach((n) => n.remove());
      return copia.textContent ?? '';
    });
    expect(textos).toContain('solo el 10\u00A0% de la energía sube');
    expect(textos).toContain('regla del 10\u00A0%');
    expect(textos.match(/\d%/g) ?? []).toEqual([]);
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
import {
  ECOSISTEMAS,
  EVENTOS,
  aplicarEvento,
  perturbacionAplicable,
} from '../../app/simulador-ecosistema-trofico/motor';

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
        // Desde el 24/09/2026 la sequía no se aplica en el océano (hallazgo 1608): no es un
        // escenario válido y resolverCaso lo rechaza.
        if (!perturbacionAplicable(eco, ev)) continue;
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
    // 32 escenarios − 5 descartados por la trampa 1 − 2 sin sentido (océano + sequía al 50 y al
    // 70 %, hallazgo 1608), × 3 niveles no golpeados. Hasta el 24/09/2026 eran 27 × 3.
    expect(comprobados).toBe(25 * 3);
  });

  test('8 · corregir no lanza nunca, ni sin elección ni con un caso imposible', async () => {
    expect(comprobarPrediccion('sube', 'sube').correcto).toBe(true);
    expect(comprobarPrediccion('no-cambia', 'baja').correcto).toBe(false);
    expect(comprobarPrediccion(null, 'baja').motivo).toBe('vacia');
    expect(comprobarPrediccion('sube', null).motivo).toBe('no-disponible');
    const inexistente = resolverCaso({ clase: 'direccion', ecosistemaId: 'marte', eventoId: 'sequia', intensidad: 0.5, nivel: 1 });
    expect(inexistente.ok).toBe(false);
    // La contaminación no admite preguntas de MAGNITUD: el modelo deja fuera la
    // biomagnificación, así que su orden de magnitudes no es el real (hallazgo 1607).
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
    await expect(page.locator('label[for="slider-intensidad"]')).toContainText('50\u00A0%');
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * Inspección 24/09/2026 — RE-inspección tras los casos para clase (edac3d0f), la descripción de
 * la contaminación (9b4e29f9), la explicación en español correcto (f6b0c79d) y los porcentajes
 * con espacio (0d54c8f9).
 *
 * Todo se resolvió A MANO con las fórmulas de motor.ts antes de abrir el navegador. Los factores
 * relativos no dependen del ecosistema (poblaciones de partida proporcionales):
 *   arriba  f_i = 0,3 + 0,7 × f_{i−1}      abajo  f_i = 1 + 0,7 × (1 − f_{i+1})
 *
 *   A · Océano [100,38,14,5] + Contaminación 50 %: cambio −0,25
 *       f = 0,75 · 0,825 · 0,8775 · 0,91425 → 75 · 31,35 · 12,285 · 4,571 → «75 · 31 · 12 · 5»
 *       panel 25 % · 17,5 % → «18 %» · 12,25 % → «12 %» · 8,575 % → «9 %»
 *   B1 · Bosque [100,35,12,4] + Caza 100 %: 12 × 0,3 = 3,6 → SUELO 5
 *       super 4 × (0,3 + 0,7 × 5/12) = 2,367 → «2» · herb 35 × (1 + 0,7 × 7/12) = 49,29 → «49»
 *       prod 100 × (1 + 0,7 × (1 − 1,40833)) = 71,42 → «71»
 *   B2 · Sabana [100,42,16,6] + Plaga 100 %: herb 42 × 1,8 = 75,6 → «76» · carn 16 × 1,56 = 24,96
 *       → «25» · super 6 × 1,392 = 8,352 → «8» · prod 100 × (1 − 0,56) = 44 (nadie toca el techo)
 *   C · el deslizador no pasa de 100 % ni baja de 0 % con el teclado; «Comprobar» sin elegir no
 *       corrige; «Cargar en el simulador» no existe hasta haber comprobado.
 *
 *   LOS 12 CASOS, cada uno con la respuesta que da el modelo y las barras que el alumno VE al
 *   mover él mismo los controles (no con «Cargar», que ya cubre el describe anterior):
 *     1 Sabana sequía 50 %   carnívoros 16 → 13,65 «14» BAJA         [70,33,14,5]
 *       (hasta el 24/09/2026 era Océano + sequía, 14 → 11,94 «12»: sin sentido ecológico, 1608)
 *     2 Pradera contam. 70 % super 5 → 4,40 «4» BAJA                 [65,30,12,4]
 *     3 Pradera caza 50 %    herbívoros 40 → 49,8 «50» SUBE          [83,50,10,4]
 *     4 Océano caza 50 %     productores 100 → 82,85 «83» BAJA       [83,47,9,4]
 *     5 Bosque caza 70 %     super 4 → 2,63 «3» BAJA                 [76,47,6,3]
 *     6 Sabana plaga 50 %    super 6 → 7,18 «7» SUBE                 [72,59,20,7]
 *     7 Sabana plaga 70 %    productores 100 → 60,8 «61» BAJA        [61,66,22,8]
 *     8 Océano plaga 70 %    carnívoros 14 → 19,49 «19» SUBE         [61,59,19,6]
 *     9 Pradera sequía 50 %  herb 21 % vs carn 15 %  → los herbívoros [70,32,13,4]
 *    10 Océano caza 70 %     prod 24 % vs herb 34 %  → los herbívoros [76,51,7,3]
 *    11 Sabana plaga 50 %    carn 28 % vs super 20 % → los carnívoros [72,59,20,7]
 *    12 Bosque plaga 70 %    super 27 % vs prod 39 % → los productores [61,55,17,5]
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

async function ponerEscenario(page: Page, ecosistema: string, evento: string, intensidad: string): Promise<void> {
  await page
    .getByRole('group', { name: 'Seleccionar ecosistema' })
    .getByRole('button', { name: ecosistema, exact: true })
    .click();
  await seleccionar(page, evento, intensidad);
}

/** Contraste WCAG entre el color computado del elemento y su primer fondo opaco hacia arriba. */
async function contrasteDe(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const rgb = (c: string): number[] => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = (c: number[]): number => {
      const f = (v: number): number => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    let fondo: number[] = [255, 255, 255];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const c = rgb(getComputedStyle(e).backgroundColor);
      if (c.length === 3 || (c.length >= 4 && c[3] >= 1)) {
        fondo = c;
        break;
      }
    }
    const a = lum(rgb(getComputedStyle(el).color));
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

test.describe('Inspección 24/09/2026 — casos para clase contra el modelo, límites y hallazgos abiertos', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['section[aria-labelledby="aula-titulo"] input[type="radio"]']);
    // Las transiciones de 0,2 s del fondo de los botones falsean cualquier medida de contraste
    // tomada justo después de un clic (se midió 1,15:1 a mitad de transición).
    await page.addStyleTag({ content: '*{transition:none !important}' });
  });

  test('los 12 casos: la respuesta que la app da por buena es la que el alumno VE al mover él los controles', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const CASOS_A_MANO = [
      // Caso 1 en la sabana desde el 24/09/2026 (hallazgo 1608). A mano: sequía 50 % → cambio −0,30;
      // herbívoros 42 × 0,79 = 33,18 «33»; carnívoros 16 × (0,3 + 0,7 × 0,79) = 13,648 «14»;
      // superdepredadores 6 × 0,8971 = 5,38 «5».
      { id: 1, eco: 'Sabana', ev: 'Sequía', i: '0.5', resp: 'Baja', vis: [70, 33, 14, 5] },
      { id: 2, eco: 'Pradera', ev: 'Contaminación del agua', i: '0.7', resp: 'Baja', vis: [65, 30, 12, 4] },
      { id: 3, eco: 'Pradera', ev: 'Caza excesiva del depredador', i: '0.5', resp: 'Sube', vis: [83, 50, 10, 4] },
      { id: 4, eco: 'Océano', ev: 'Caza excesiva del depredador', i: '0.5', resp: 'Baja', vis: [83, 47, 9, 4] },
      { id: 5, eco: 'Bosque Templado', ev: 'Caza excesiva del depredador', i: '0.7', resp: 'Baja', vis: [76, 47, 6, 3] },
      { id: 6, eco: 'Sabana', ev: 'Plaga de herbívoros', i: '0.5', resp: 'Sube', vis: [72, 59, 20, 7] },
      { id: 7, eco: 'Sabana', ev: 'Plaga de herbívoros', i: '0.7', resp: 'Baja', vis: [61, 66, 22, 8] },
      { id: 8, eco: 'Océano', ev: 'Plaga de herbívoros', i: '0.7', resp: 'Sube', vis: [61, 59, 19, 6] },
      { id: 9, eco: 'Pradera', ev: 'Sequía', i: '0.5', resp: 'Los herbívoros', vis: [70, 32, 13, 4] },
      { id: 10, eco: 'Océano', ev: 'Caza excesiva del depredador', i: '0.7', resp: 'Los herbívoros', vis: [76, 51, 7, 3] },
      { id: 11, eco: 'Sabana', ev: 'Plaga de herbívoros', i: '0.5', resp: 'Los carnívoros', vis: [72, 59, 20, 7] },
      { id: 12, eco: 'Bosque Templado', ev: 'Plaga de herbívoros', i: '0.7', resp: 'Los productores', vis: [61, 55, 17, 5] },
    ];
    for (const c of CASOS_A_MANO) {
      await seccion(page).getByRole('button', { name: new RegExp(`^Caso ${c.id}:`) }).click();
      await seccion(page).getByRole('radio', { name: c.resp, exact: true }).check();
      await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
      await expect(seccion(page).getByRole('alert'), `caso ${c.id}`).toContainText(
        `¡Correcto! La respuesta es «${c.resp}»`
      );
      // El alumno mueve él mismo ecosistema, perturbación e intensidad y ve lo que el caso dio por bueno.
      await ponerEscenario(page, c.eco, c.ev, c.i);
      expect((await leerBarras(page)).map((b) => b.valor), `caso ${c.id}`).toEqual(c.vis);
    }
    await expect(page.locator('p', { hasText: 'Casos comprobados:' })).toContainText('12 de 12 · aciertos: 12');
  });

  test('una predicción equivocada de comparación se corrige como fallo, con la respuesta del modelo', async ({ page }) => {
    // Caso 12: bosque + plaga al 70 %; superdepredadores 27 % frente a productores 39 %.
    await seccion(page).getByRole('button', { name: /^Caso 12:/ }).click();
    await seccion(page).getByRole('radio', { name: 'Cambian lo mismo' }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText(
      'No. Predijiste «Cambian lo mismo» y la respuesta es «Los productores».'
    );
  });

  test('A · Océano + contaminación al 50 %: 75 / 31 / 12 / 4,6 y la descripción nueva (9b4e29f9)', async ({ page }) => {
    await ponerEscenario(page, 'Océano', 'Contaminación del agua', '0.5');
    // REESCRITO el 24/09/2026: esperaba «5» sin delta para los superdepredadores junto a un panel
    // que dice «un 9 %», que es exactamente el hallazgo 1609 (la ficha cita este escenario).
    // 5 × 0,91425 = 4,571: entero sería «5»; con el decimal, «4,6 (-0,4)».
    expect((await leerBarras(page)).map((b) => b.texto)).toEqual(['75 (-25)', '31 (-7)', '12 (-2)', '4,6 (-0,4)']);
    await expect(page.locator('[role="status"]')).toContainText(
      'Pesticidas diezman a los productores. Los productores se han reducido un 25 %, los herbívoros un 18 %, los carnívoros un 12 % y los superdepredadores un 9 %.'
    );
  });

  test('B1 · Bosque + caza al 100 %: el suelo de 5 muerde (3,6 → 5) y la cascada sigue', async ({ page }) => {
    await ponerEscenario(page, 'Bosque Templado', 'Caza excesiva del depredador', '1');
    expect((await leerBarras(page)).map((b) => b.texto)).toEqual(['71 (-29)', '49 (+14)', '5 (-7)', '2 (-2)']);
  });

  test('B2 · Sabana + plaga al 100 %: 44 / 76 / 25 / 8, ningún nivel pasa de 100', async ({ page }) => {
    await ponerEscenario(page, 'Sabana', 'Plaga de herbívoros', '1');
    expect((await leerBarras(page)).map((b) => b.texto)).toEqual(['44 (-56)', '76 (+34)', '25 (+9)', '8 (+2)']);
  });

  test('C · el deslizador se acota a 0–100 % con el teclado y el corrector no corrige sin elección', async ({ page }) => {
    await ponerEscenario(page, 'Sabana', 'Plaga de herbívoros', '0.5');
    await page.locator('#slider-intensidad').focus();
    await page.keyboard.press('End');
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
    await expect(page.locator('label[for="slider-intensidad"]')).toContainText('100 %');
    await page.keyboard.press('Home');
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowLeft');
    await expect(page.locator('label[for="slider-intensidad"]')).toContainText('0 %');
    expect((await leerBarras(page)).map((b) => b.texto)).toEqual(['100', '42', '16', '6']);

    await seccion(page).getByRole('button', { name: /^Caso 5:/ }).click();
    await expect(seccion(page).getByRole('button', { name: /Cargar en el simulador/ })).toHaveCount(0);
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('Elige una de las tres opciones antes de comprobar.');
    await expect(seccion(page).getByRole('button', { name: /Cargar en el simulador/ })).toHaveCount(0);
    await expect(page.locator('p', { hasText: 'Casos comprobados:' })).toContainText('0 de 12');
  });

  test('cerrados 323 · 324: la pista de la FAQ y el ejemplo del paso 3 salen en el simulador', async ({ page }) => {
    expect(await page.evaluate(() => document.body.textContent ?? '')).toContain('los carnívoros caen a un tercio');
    // Paso 3: «caza … al 71 % en la pradera y verás −50 % en carnívoros, +35 % en herbívoros y
    // −24 % en productores». A mano: cambio −0,497 → f = 0,75647 · 1,3479 · 0,503 · 0,6521.
    await ponerEscenario(page, 'Pradera', 'Caza excesiva del depredador', '0.71');
    await expect(page.locator('[role="status"]')).toContainText(
      'Los productores se han reducido un 24 %, los herbívoros han aumentado un 35 %, los carnívoros se han reducido un 50 % y los superdepredadores un 35 %.'
    );
  });

  test('cerrados 325 · 326 · 327 · 328 · 329 siguen cerrados', async ({ page }) => {
    // 325: tres flechas hacia ARRIBA
    const flechas = await page.evaluate(() =>
      [...document.querySelectorAll('[aria-hidden="true"]')]
        .map((e) => (e.textContent ?? '').trim())
        .filter((t) => t.includes('energía sube'))
    );
    expect(flechas).toEqual(Array(3).fill('↑ solo el 10 % de la energía sube a este nivel'));
    // 326: botones del simulador y de los casos, todos con type="button"
    expect(
      await page
        .locator('[role="group"] button:not([type="button"]), section[aria-labelledby="aula-titulo"] button:not([type="button"])')
        .count()
    ).toBe(0);
    // 327: ningún listitem huérfano
    expect(
      await page
        .locator('[role="listitem"]')
        .evaluateAll((els) => els.filter((e) => !e.closest('[role="list"], ul, ol')).length)
    ).toBe(0);
    // 329: la leyenda lee energiaPorcentaje
    await expect(page.getByText('Superdepredadores: 0,1 %')).toBeVisible();
    // 328: sequía al 1 % → 99,4 / 39,83 / 14,96 / 4,99: solo los productores pintan delta
    await ponerEscenario(page, 'Pradera', 'Sequía', '0.01');
    expect((await leerBarras(page)).map((b) => b.texto)).toEqual(['99 (-1)', '40', '15', '5']);
  });

  // ── HALLAZGOS 1607-1613, REPARADOS el 24/09/2026 ───────────────────────────────────────────
  // Eran test.fail() que documentaban cada defecto; se reescriben como regresión en verde.

  test('1607 · con pesticidas en el agua, el panel, el caso 2 y la guía avisan de la biomagnificación', async ({
    page,
  }) => {
    // Pradera + contaminación 70 % → −35 / −25 / −17 / −12 %: la cascada del modelo se apaga al
    // subir y la cúspide sale como el nivel MENOS afectado, lo contrario de la biomagnificación
    // del DDT (Woodwell, Wurster e Isaacson, Science 156:821, 1967: 0,04 ppm en el plancton,
    // 75 ppm en una gaviota). El modelo no se cambia (no hay dato de toxicidad que convertir en
    // población); se AVISA en los tres sitios donde sale la contaminación.
    await ponerEscenario(page, 'Pradera', 'Contaminación del agua', '0.7');
    const panel = page.locator('[role="status"]');
    await expect(panel).toContainText(
      'los herbívoros un 25 %, los carnívoros un 17 % y los superdepredadores un 12 %.'
    );
    await expect(panel).toContainText('deja fuera la biomagnificación');
    await expect(panel).toContainText('los superdepredadores suelen acumular las dosis más altas');
    // Sin contaminación, el panel no lo menciona (no es un aviso genérico).
    await ponerEscenario(page, 'Pradera', 'Sequía', '0.7');
    await expect(panel).not.toContainText('biomagnificación');

    // Caso 2 (pradera + contaminación 70 %, superdepredadores → baja): la explicación termina con el aviso.
    await seccion(page).getByRole('button', { name: /^Caso 2:/ }).click();
    await seccion(page).getByRole('radio', { name: 'Baja' }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto! La respuesta es «Baja»');
    await seccion(page).getByRole('button', { name: /Ver por qué pasa/ }).click();
    await expect(seccion(page).locator('ol li').last()).toContainText('deja fuera la biomagnificación');

    // La guía lo explica con la fuente y la cifra del abstract del artículo.
    const texto = await page.evaluate(() => document.body.textContent ?? '');
    expect(texto).toContain('desde 0,04 partes por millón en el plancton hasta 75 en una gaviota');
    expect(texto).toContain('Woodwell, Wurster e Isaacson');
  });

  test('1608 · el caso 1 ya no es una sequía en el océano, el simulador no la ofrece y la práctica no la genera', async ({
    page,
  }) => {
    // El fitoplancton no depende de la lluvia (luz y nutrientes). El caso 1 conserva número,
    // título, pregunta y respuesta en la sabana: carnívoros 16 → 13,65 «14», baja.
    await seccion(page).getByRole('button', { name: /^Caso 1: La sequía llega a los carnívoros/ }).click();
    const enunciado = seccion(page).locator('p[aria-live="polite"][aria-atomic="true"]');
    await expect(enunciado).toContainText('En el ecosistema Sabana se aplica la perturbación «Sequía» con una intensidad del 50 %');
    await expect(enunciado).toContainText('¿qué les pasa a los carnívoros?');
    await seccion(page).getByRole('radio', { name: 'Baja' }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto! La respuesta es «Baja»');

    // En el océano no hay botón «Sequía» y se dice por qué; en la sabana, sí.
    const perturbaciones = page.getByRole('group', { name: 'Seleccionar perturbación' });
    await page.getByRole('group', { name: 'Seleccionar ecosistema' }).getByRole('button', { name: 'Océano', exact: true }).click();
    await expect(perturbaciones.getByRole('button', { name: 'Sequía', exact: true })).toHaveCount(0);
    await expect(perturbaciones.getByRole('button')).toHaveCount(4);
    await expect(page.getByText('En el océano no hay «Sequía»')).toBeVisible();
    await page.getByRole('group', { name: 'Seleccionar ecosistema' }).getByRole('button', { name: 'Sabana', exact: true }).click();
    await expect(perturbaciones.getByRole('button', { name: 'Sequía', exact: true })).toHaveCount(1);
    await expect(page.getByText('En el océano no hay «Sequía»')).toHaveCount(0);

    // Práctica: en 500 semillas (antes salía en 2 de cada 25) ninguna sequía en el océano, y el
    // caso válido sigue existiendo en los ecosistemas terrestres.
    const oceanoSequia = Array.from({ length: 500 }, (_, i) => generarEjercicioAleatorio(i + 1)).filter(
      (e) => e.datos.ecosistemaId === 'oceano' && e.datos.eventoId === 'sequia'
    );
    expect(oceanoSequia).toHaveLength(0);
    expect(resolverCaso({ clase: 'direccion', ecosistemaId: 'oceano', eventoId: 'sequia', intensidad: 0.5, nivel: 2 }).ok).toBe(false);
    for (const caso of CASOS_AULA) {
      const eco = ECOSISTEMAS.find((e) => e.id === caso.datos.ecosistemaId)!;
      expect(perturbacionAplicable(eco, caso.datos.eventoId), `caso ${caso.id}`).toBe(true);
    }
  });

  test('1609 · barra, pirámide y panel dicen lo mismo aunque el cambio sea de menos de un individuo', async ({ page }) => {
    // Bosque + sequía 50 %: superdepredadores 4 × 0,8971 = 3,588. Entero se pintaba «4» sin
    // delta mientras el panel decía «un 10 %». Ahora «3,6 (-0,4)»: 0,41 / 4 = 10 %.
    await ponerEscenario(page, 'Bosque Templado', 'Sequía', '0.5');
    const barras = await leerBarras(page);
    expect(barras.map((b) => b.texto)).toEqual(['70 (-30)', '28 (-7)', '10 (-2)', '3,6 (-0,4)']);
    expect(barras[3].valor).toBe(3.6);
    expect(barras[3].etiqueta).toBe('Superdepredadores: 3,6 individuos relativos');
    await expect(page.getByText('3,6 ind. rel.', { exact: true })).toBeVisible();
    await expect(page.locator('[role="status"]')).toContainText('los superdepredadores un 10 %');

    // Los cinco escenarios de intensidad 0,5/0,7 donde el entero escondía el cambio (barrido del
    // motor, 24/09/2026). A mano, superdepredadores: pradera 5 → 4,571; bosque 4 → 3,657 (50 %)
    // y 4 → 3,520 (70 %); océano 5 → 4,571. En los cinco, cada nivel que el panel nombra tiene delta.
    const ESCENARIOS: [string, string, string, string[]][] = [
      ['Pradera', 'Contaminación del agua', '0.5', ['75 (-25)', '33 (-7)', '13 (-2)', '4,6 (-0,4)']],
      ['Bosque Templado', 'Contaminación del agua', '0.5', ['75 (-25)', '29 (-6)', '11 (-1)', '3,7 (-0,3)']],
      ['Bosque Templado', 'Contaminación del agua', '0.7', ['65 (-35)', '26 (-9)', '10 (-2)', '3,5 (-0,5)']],
      ['Océano', 'Contaminación del agua', '0.5', ['75 (-25)', '31 (-7)', '12 (-2)', '4,6 (-0,4)']],
    ];
    for (const [eco, ev, i, esperado] of ESCENARIOS) {
      await ponerEscenario(page, eco, ev, i);
      expect((await leerBarras(page)).map((b) => b.texto), `${eco} · ${ev} · ${i}`).toEqual(esperado);
    }
    // Y lo que el panel calla sigue sin delta (hallazgo 328): sequía al 1 %, herbívoros 39,83 → «40».
    await ponerEscenario(page, 'Pradera', 'Sequía', '0.01');
    expect((await leerBarras(page)).map((b) => b.texto)).toEqual(['99 (-1)', '40', '15', '5']);
  });

  test('1610 · la regla del 10 % sale como media aproximada, no como ley exacta', async ({ page }) => {
    // Fuente: Wikipedia, «Ecological efficiency»: «Lindeman did not call it a "law" and cited
    // ecological efficiencies ranging from 0.1% to 37.5%».
    const texto = await page.evaluate(() => document.body.textContent ?? '');
    expect(texto).not.toContain('matemáticamente imposible');
    expect(texto).not.toContain('ley de Lindeman');
    expect(texto).not.toContain('Solo el 10 % pasa al nivel siguiente');
    expect(texto).not.toContain('Solo el 10 % queda en tejidos consumibles');
    expect(texto).toContain('no la llamó ley y citó eficiencias desde el 0,1 % hasta el 37,5 %');
    // La FAQ de los eslabones ya no se contradice: «no es una imposibilidad matemática».
    expect(texto).toContain('No es una imposibilidad matemática');
    // El FAQPage (JSON-LD) dice lo mismo que la página.
    const faq = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' ')
    );
    expect(faq).toContain('Es una aproximación, no una ley exacta');
    expect(faq).not.toContain('Propuesta por Raymond Lindeman en 1942, esta regla explica');
  });

  test('1611 · el paso 3 da el 35 % exacto que transmite el modelo, no «algo más»', async ({ page }) => {
    // Con ATENUACION = 0,7: carnívoros −50 % (caza a 5/7 de intensidad: −0,7 × 5/7 = −0,5) →
    // herbívoros 1 + 0,7 × 0,5 = 1,35 (+35 % exacto) → productores 1 − 0,7 × 0,35 = 0,755 (−24,5 %).
    const pradera = ECOSISTEMAS.find((e) => e.id === 'pradera')!;
    const caza = EVENTOS.find((e) => e.id === 'caza-depredador')!;
    const r = aplicarEvento(pradera.niveles, caza, 5 / 7).map((n) => n.poblacion);
    expect(r[2] / 15).toBeCloseTo(0.5, 10);
    expect(r[1] / 40).toBeCloseTo(1.35, 10);
    expect(r[0] / 100).toBeCloseTo(0.755, 10);
    const texto = await page.evaluate(() => document.body.textContent ?? '');
    expect(texto).not.toContain('algo más de un 35');
    expect(texto).toContain('se traduce en un 35 % en el nivel de al lado y en un 24,5 % en el siguiente');
  });

  test('1612 · contraste ≥ 4,5:1 en los botones activos, la pirámide, las cifras y el título, en claro', async ({ page }) => {
    await page.getByRole('button', { name: 'Sequía', exact: true }).click();
    // Fuera del botón: con el ratón encima se mediría el :hover, que ahora es el mismo color.
    await page.mouse.move(0, 0);
    // Medido antes: 2,80:1 (perturbación, blanco sobre #48A9A6) y 4,11:1 (ecosistema, sobre #2E86AB).
    expect(await contrasteDe(page, '[aria-label="Seleccionar perturbación"] button[aria-pressed="true"]')).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteDe(page, '[aria-label="Seleccionar ecosistema"] button[aria-pressed="true"]')).toBeGreaterThanOrEqual(4.5);
    // Pirámide (antes: «Herbívoros» 2,38:1, sus ejemplos 2,10:1, «Carnívoros» 3,77:1). Sin opacity,
    // que aclaraba el blanco: se comprueba aparte porque contrasteDe no la compone.
    for (const sel of [
      '[role="listitem"] span:text-is("Herbívoros")',
      '[role="listitem"] span:text-is("Conejos, ratones, insectos")',
      '[role="listitem"] span:text-is("32 ind. rel.")',
      '[role="listitem"] span:text-is("Carnívoros")',
      '[role="listitem"] span:text-is("Zorros, serpientes")',
      '[role="listitem"] span:text-is("Gramíneas, hierbas")',
      '[role="listitem"] span:text-is("Águilas, halcones")',
    ]) {
      expect(await contrasteDe(page, sel), sel).toBeGreaterThanOrEqual(4.5);
      expect(await page.locator(sel).first().evaluate((el) => getComputedStyle(el).opacity), sel).toBe('1');
    }
    // Cifra y delta de la barra de herbívoros (antes 2,38:1 y 1,98:1): pradera + contaminación 70 % → «30 (-10)».
    await ponerEscenario(page, 'Pradera', 'Contaminación del agua', '0.7');
    expect(await contrasteDe(page, 'span[style*="color"]:has-text("30")')).toBeGreaterThanOrEqual(4.5);
    expect(await page.locator('span[style*="color"]:has-text("30") > span').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    // Título del panel (antes 4,11:1 con var(--primary) como texto).
    expect(await contrasteDe(page, 'h2:text-is("¿Qué está pasando?")')).toBeGreaterThanOrEqual(4.5);
  });

  test('1612 · en oscuro, las cifras de las barras y el título del panel también pasan de 4,5:1', async ({ page }) => {
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await ponerEscenario(page, 'Pradera', 'Sequía', '0.5');
    // Barras 70 · 32 · 13 · 4 (CASO 1). Antes, en oscuro: productores 2,87:1 y superdepredadores 2,64:1.
    const cifras = page.locator('[class*="barraValor"]');
    await expect(cifras).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const ratio = await cifras.nth(i).evaluate((el) => {
        const rgb = (c: string): number[] => (c.match(/[\d.]+/g) ?? []).map(Number);
        const lum = (c: number[]): number => {
          const f = (v: number): number => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
        };
        let fondo: number[] = [255, 255, 255];
        for (let e: Element | null = el; e; e = e.parentElement) {
          const c = rgb(getComputedStyle(e).backgroundColor);
          if (c.length === 3 || (c.length >= 4 && c[3] >= 1)) {
            fondo = c;
            break;
          }
        }
        const a = lum(rgb(getComputedStyle(el).color));
        const b = lum(fondo);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
      expect(ratio, `barra ${i}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(await contrasteDe(page, 'h2:text-is("¿Qué está pasando?")')).toBeGreaterThanOrEqual(4.5);
  });

  test('1613 · al comprobar con el teclado, el foco pasa a «Cargar en el simulador», no al <body>', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 5:/ }).click();
    await seccion(page).getByRole('radio', { name: 'Baja' }).check();
    await seccion(page).getByRole('button', { name: 'Comprobar' }).focus();
    await page.keyboard.press('Enter');
    await expect(seccion(page).getByRole('alert')).toContainText('Correcto');
    await expect(seccion(page).getByRole('button', { name: /Cargar en el simulador/ })).toBeFocused();
    // El siguiente Tab sigue el orden natural: «Ver por qué pasa».
    await page.keyboard.press('Tab');
    await expect(seccion(page).getByRole('button', { name: /Ver por qué pasa/ })).toBeFocused();

    // Sin elegir, «Comprobar» sigue ahí y conserva el foco (no hay nada que cargar).
    await seccion(page).getByRole('button', { name: /^Caso 6:/ }).click();
    await seccion(page).getByRole('button', { name: 'Comprobar' }).focus();
    await page.keyboard.press('Enter');
    await expect(seccion(page).getByRole('alert')).toContainText('Elige una de las tres opciones');
    await expect(seccion(page).getByRole('button', { name: 'Comprobar' })).toBeFocused();

    // Volver con la botonera a un caso ya comprobado no roba el foco: se queda en la botonera.
    await seccion(page).getByRole('button', { name: /^Caso 5:/ }).focus();
    await page.keyboard.press('Enter');
    await expect(seccion(page).getByRole('button', { name: /^Caso 5:/ })).toBeFocused();
  });
});
