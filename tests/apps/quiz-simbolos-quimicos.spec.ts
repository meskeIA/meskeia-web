import { test, expect, type Page } from '@playwright/test';

/**
 * Quiz Símbolos Químicos — test de regresión del Inspector (24/08/2026)
 *
 * Los datos salen de `data/elementos-quimicos.ts` (88 elementos; los 26 de
 * categoría 'comun' son los que entran en el nivel Fácil).
 *
 * La app baraja con `Math.random`, así que fijamos la aleatoriedad con un
 * mulberry32 de semilla 42 inyectado antes de la hidratación y RE-SEMBRADO
 * justo antes de pulsar «¡Empezar quiz!» (React consume dos números durante
 * la hidratación y desplazaría la secuencia).
 *
 * Con esa semilla, `generarPreguntas('simbolo-nombre', 'facil')` produce
 * siempre esta tanda — obtenida replicando la función en Node y contrastada
 * después contra el navegador:
 *
 *   Q1  He (Z=2)   → Helio      opciones: Bromo, Cloro, Helio, Magnesio
 *   Q2  Al (Z=13)  → Aluminio
 *   Q3  O  (Z=8)   → Oxígeno
 *   Q4  Cu (Z=29)  → Cobre
 *   Q5  Na (Z=11)  → Sodio
 *   Q6  Ca (Z=20)  → Calcio
 *   Q7  S  (Z=16)  → Azufre
 *   Q8  H  (Z=1)   → Hidrógeno
 *   Q9  Ar (Z=18)  → Argón
 *   Q10 Ne (Z=10)  → Neón
 *
 * Los pares elemento↔símbolo son los oficiales de la IUPAC (He=Helio,
 * Na=Sodio, K=Potasio, Fe=Hierro, Ag=Plata, Au=Oro, Pb=Plomo…).
 */

const RUTA = '/quiz-simbolos-quimicos/';

// mulberry32: PRNG determinista para que la tanda de preguntas sea reproducible
const SEMILLA_DETERMINISTA = `
  (() => {
    let a = 0;
    window.__semilla = (s) => { a = s >>> 0; };
    window.__semilla(42);
    Math.random = function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
`;

/** Texto de las 4 opciones de la pregunta visible, en orden. */
async function opcionesVisibles(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter((b) => b.querySelector('[class*="opcionLetra"]'))
      .map((b) => b.querySelector('[class*="opcionTexto"]')?.textContent ?? '')
  );
}

/** El feedback de la app, sin el route-announcer de Next (que también es role="alert"). */
function feedback(page: Page) {
  return page.locator('[class*="feedbackMensaje"]');
}

/** Arranca una partida con la aleatoriedad fijada en la semilla 42. */
async function arrancarPartida(page: Page, modo: RegExp, dificultad: RegExp) {
  await page.getByRole('button', { name: modo }).click();
  await page.getByRole('button', { name: dificultad }).click();
  // Re-sembrar AQUÍ: `generarPreguntas` se ejecuta dentro del onClick siguiente.
  await page.evaluate(() => (window as unknown as { __semilla: (s: number) => void }).__semilla(42));
  await page.getByRole('button', { name: '¡Empezar quiz!' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(SEMILLA_DETERMINISTA);
});

test.describe('Quiz Símbolos Químicos', () => {
  test('caso normal: acertar puntúa, muestra el símbolo y avanza de pregunta', async ({ page }) => {
    await page.goto(RUTA);

    // La página hidrata: los controles existen y responden.
    expect(
      await page.evaluate(() => document.querySelectorAll('button, input, select').length)
    ).toBeGreaterThan(5);

    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);

    // Q1 con semilla 42 = Helio (He, Z=2), según data/elementos-quimicos.ts
    await expect(page.locator('[class*="elementoTexto"]')).toHaveText('He');
    await expect(page.locator('[class*="elementoZ"]')).toHaveText('Z = 2');
    // Fácil = 10 preguntas (DIFICULTAD_CONFIG de page.tsx)
    await expect(page.getByText('Pregunta 1 / 10')).toBeVisible();
    expect(await opcionesVisibles(page)).toEqual(['Bromo', 'Cloro', 'Helio', 'Magnesio']);

    await page.getByRole('button', { name: 'Helio', exact: true }).click();

    // He = Helio es el par correcto IUPAC → acierto
    await expect(feedback(page)).toContainText('✅ ¡Correcto!');
    await expect(feedback(page)).toContainText('Helio');
    await expect(feedback(page)).toContainText('Z=2');
    // marcador: 1 acierto, racha 1
    await expect(page.getByText('✅ 1 · 🔥 Racha: 1')).toBeVisible();

    await page.getByRole('button', { name: /Siguiente pregunta/ }).click();

    // Q2 con semilla 42 = Aluminio (Al, Z=13)
    await expect(page.getByText('Pregunta 2 / 10')).toBeVisible();
    await expect(page.locator('[class*="elementoTexto"]')).toHaveText('Al');
    await expect(page.locator('[class*="elementoZ"]')).toHaveText('Z = 13');
  });

  test('caso límite: fallar marca el error y enseña la correcta; el marcador final cuadra (3 de 10)', async ({ page }) => {
    await page.goto(RUTA);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);

    // Plan de respuestas: fallo en Q1, aciertos en Q2-Q3-Q4, fallos en Q5-Q10.
    // Total esperado: 3 aciertos, 7 errores, racha máxima 3, 30 % de precisión.
    const plan = ['Bromo', 'Aluminio', 'Oxígeno', 'Cobre', 'Helio', 'Bromo', 'Plata', 'Sodio', 'Cloro', 'Calcio'];
    const simbolosPreguntados: string[] = [];

    for (let i = 0; i < plan.length; i++) {
      const simbolo = await page.locator('[class*="elementoTexto"]').textContent();
      simbolosPreguntados.push(simbolo ?? '');

      // Los distractores no pueden repetir la respuesta correcta: siempre 4 opciones distintas.
      const opciones = await opcionesVisibles(page);
      expect(new Set(opciones).size, `Q${i + 1} tiene opciones repetidas: ${opciones.join(', ')}`).toBe(4);

      await page.getByRole('button', { name: plan[i], exact: true }).click();

      if (i === 0) {
        // Q1 = He. Respondemos «Bromo» → debe decir que la correcta era Helio.
        await expect(feedback(page)).toContainText('❌ La respuesta correcta era:');
        await expect(feedback(page)).toContainText('Helio');
        await expect(feedback(page)).toContainText('símbolo He');
        // La opción correcta queda resaltada aunque el usuario no la eligiera.
        await expect(page.getByRole('button', { name: 'Helio', exact: true })).toHaveClass(/opcion-correcta/);
        await expect(page.getByRole('button', { name: 'Bromo', exact: true })).toHaveClass(/seleccionada-mal/);
        // Un fallo NO puntúa y corta la racha.
        await expect(page.getByText('✅ 0 · 🔥 Racha: 0')).toBeVisible();
      }

      await page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ }).click();
    }

    // Ningún elemento se repite dentro de la misma partida (mezclar + slice, sin reposición).
    expect(new Set(simbolosPreguntados).size).toBe(10);
    expect(simbolosPreguntados).toEqual(['He', 'Al', 'O', 'Cu', 'Na', 'Ca', 'S', 'H', 'Ar', 'Ne']);

    // 3 aciertos de 10 → 30 %. La medalla de <40 % es «Sigue practicando» (calcularMedalla).
    await expect(page.getByText('Sigue practicando')).toBeVisible();
    await expect(page.getByText(/Has acertado/)).toContainText('3');
    await expect(page.getByText(/Has acertado/)).toContainText('10');
    await expect(page.getByText(/Has acertado/)).toContainText('30%');
    // 7 fallos → 7 elementos a repasar, y son exactamente los fallados.
    await expect(page.getByText('Elementos a repasar (7)')).toBeVisible();
    for (const fallado of ['Helio', 'Sodio', 'Calcio', 'Azufre', 'Hidrógeno', 'Argón', 'Neón']) {
      await expect(page.locator('[class*="erroresGrid"]')).toContainText(fallado);
    }
  });

  test('caso de operativa: «Repetir quiz» reinicia marcador y progreso, y el modo inverso pregunta el símbolo', async ({ page }) => {
    await page.goto(RUTA);
    await arrancarPartida(page, /Símbolo → Nombre/, /^Fácil/);

    // Partida exprés hasta el final: contestamos siempre la primera opción.
    for (let i = 0; i < 10; i++) {
      const opciones = await opcionesVisibles(page);
      await page.getByRole('button', { name: opciones[0], exact: true }).click();
      await page.getByRole('button', { name: /Siguiente pregunta|Ver resultados/ }).click();
    }
    await expect(page.getByText(/Has acertado/)).toBeVisible();

    await page.getByRole('button', { name: /Repetir quiz/ }).click();

    // Reinicio limpio: vuelve a la pregunta 1, con 0 aciertos y 0 de racha, sin feedback residual.
    await expect(page.getByText('Pregunta 1 / 10')).toBeVisible();
    await expect(page.getByText('✅ 0 · 🔥 Racha: 0')).toBeVisible();
    await expect(feedback(page)).toHaveCount(0);

    // Modo inverso: pregunta el NOMBRE y ofrece SÍMBOLOS, sin chivar la Z.
    await page.goto(RUTA);
    await arrancarPartida(page, /Nombre → Símbolo/, /^Fácil/);
    await expect(page.locator('[class*="elementoTexto"]')).toHaveText('Helio');
    await expect(page.locator('[class*="elementoZ"]')).toHaveCount(0);
    expect(await opcionesVisibles(page)).toEqual(['Br', 'Cl', 'He', 'Mg']);

    await page.getByRole('button', { name: 'He', exact: true }).click();
    // Símbolo del helio = He (IUPAC): mayúscula inicial y segunda letra minúscula.
    await expect(feedback(page)).toContainText('✅ ¡Correcto!');
    await expect(feedback(page)).toContainText('símbolo He');
  });
});
