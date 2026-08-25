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
 * DÓNDE VIVE EL CÁLCULO — app/simulador-ecosistema-trofico/page.tsx
 *   · const ECOSISTEMAS  → 4 ecosistemas × 4 niveles con `poblacion` de partida.
 *                          Pradera = [100, 40, 15, 5] (productores → superdepredadores).
 *   · const EVENTOS      → sequía {nivel 0, impacto −0,6} · caza-depredador {nivel 2, −0,7}
 *                          plaga-herbivoro {nivel 1, +0,8} · contaminacion {nivel 0, −0,5}
 *   · aplicarEvento()    → cambio = impacto × intensidad
 *       nivel afectado:      P[idx] = max(5, min(100, P0[idx] × (1 + cambio)))
 *       cascada HACIA ARRIBA (i = idx+1 … 3), con factorPresa = P[i−1] / P0[i−1]:
 *                            P[i]   = max(2, min(100, P0[i] × (0,3 + 0,7 × factorPresa)))
 *       cascada HACIA ABAJO  (i = idx−1 … 0), con factorDepred = P[i+1] / P0[i+1]:
 *                            P[i]   = max(5, min(100, P0[i] × (2 − factorDepred)))
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
 *           = 40 × (2 − 0,3333) = 40 × 1,66667                  = 66,6667  → «67»  (+27)
 *       abajo   P0: factorDepred = 66,6667/40 = 1,66667
 *           = 100 × (2 − 1,66667)                               = 33,3333  → «33»  (−67)
 *       Invariantes: ninguna población negativa ni NaN; el suelo max(5, …) impide que un
 *       nivel se extinga (15 → 5 = 33 % de la original, nunca 0), aunque la pista de la FAQ
 *       hable de «la eliminación de un nivel». La cascada hacia ABAJO no atenúa: −67 % en
 *       carnívoros produce +67 % en herbívoros y −67 % en productores.
 *
 *   CASO 3 (degenerado: la perturbación que no perturba) — cualquier evento + intensidad 0 %
 *     cambio = impacto × 0 = 0 ⇒ P[idx] = P0[idx] × 1 · factorPresa = 1 ⇒ (0,3 + 0,7) = 1
 *     · factorDepred = 1 ⇒ (2 − 1) = 1. Y en coma flotante 0,3 + 0,7 === 1 EXACTO, así que
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
    await expect(page.getByText('4 ind. rel.')).toBeVisible();

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
