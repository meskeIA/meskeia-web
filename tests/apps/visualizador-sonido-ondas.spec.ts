import { test, expect } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';

/**
 * visualizador-sonido-ondas — las cuatro secciones, servidas · 05/09/2026 (semilla S0119)
 *
 * Hasta hoy la app tenía cuatro pestañas y solo la activa llegaba al DOM, así que tres
 * cuartas partes de su contenido no existían para ningún índice: 150 visitas en 90 días
 * con 2 impresiones de buscador, la desproporción mayor del cuadrante STEM.
 *
 * Lo que este test protege es justamente eso, y por eso comprueba la presencia SIMULTÁNEA
 * de los cuatro encabezados: si alguien vuelve a esconder secciones tras un estado de
 * cliente, la regresión es invisible en pantalla (la app se ve igual de bien) y solo se
 * nota meses después en Search Console.
 */

const URL_APP = '/visualizador-sonido-ondas/';

const SECCIONES = [
  { ancla: 'anatomia', titulo: 'Anatomía de una onda sonora' },
  { ancla: 'frecuencia', titulo: 'Frecuencia y tono' },
  { ancla: 'decibelios', titulo: 'Escala de decibelios' },
  { ancla: 'timbre', titulo: 'Timbre y armónicos' },
];

test.describe('visualizador-sonido-ondas', () => {
  test('las cuatro secciones están en la página a la vez, con su h2 y su ancla', async ({ page }) => {
    await page.goto(URL_APP);

    for (const s of SECCIONES) {
      await expect(page.getByRole('heading', { level: 2, name: s.titulo })).toBeVisible();
      await expect(page.locator(`section#${s.ancla}`)).toHaveCount(1);
    }
  });

  test('el índice lleva a cada sección por su ancla', async ({ page }) => {
    await page.goto(URL_APP);

    const indice = page.getByRole('navigation', { name: 'Secciones del visualizador' });
    for (const s of SECCIONES) {
      await expect(indice.locator(`a[href="#${s.ancla}"]`)).toHaveCount(1);
    }

    await indice.locator('a[href="#decibelios"]').click();
    await expect(page).toHaveURL(new RegExp('#decibelios$'));
    await expect(page.getByRole('heading', { level: 2, name: 'Escala de decibelios' })).toBeInViewport();
  });

  test('el contenido de las secciones viaja en el HTML servido, no solo tras hidratar', async ({ page }) => {
    // Se lee la respuesta del servidor directamente: si el contenido volviera a depender
    // de un estado de cliente, aquí faltarían tres de los cuatro títulos.
    const respuesta = await page.request.get(URL_APP);
    expect(respuesta.ok()).toBeTruthy();
    const html = await respuesta.text();

    for (const s of SECCIONES) {
      expect(html).toContain(s.titulo);
      expect(html).toContain(`id="${s.ancla}"`);
    }
  });

  /**
   * ⚠️ Este test aparecía en rojo de forma INTERMITENTE (1 de cada 3 corridas) hasta el
   * 12/09/2026: el botón de 880 Hz no llegaba a existir. No era la app, era la carrera de
   * hidratación descrita en `_hidratacion.ts` — reproducida a voluntad estrangulando la CPU
   * (`Emulation.setCPUThrottlingRate`, factor 20), que deja el `fill` por delante de React:
   * el DOM del deslizador se queda en 880 y el estado en 200, así que el `aria-label`, que
   * se deriva del estado, sigue diciendo «Escuchar tono a 200 hercios».
   * Por eso se espera a la hidratación ANTES de tocar el deslizador.
   */
  test('la onda sigue siendo interactiva tras el cambio', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['input[aria-label="Frecuencia en hercios"]']);
    const slider = page.getByLabel('Frecuencia en hercios');
    await expect(slider).toHaveValue('200');
    await slider.fill('880');
    // El nombre accesible del botón sale de su aria-label, no del texto visible
    await expect(page.getByRole('button', { name: 'Escuchar tono a 880 hercios' })).toBeVisible();
  });
});

/**
 * ════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE — la tarea asignable (skill /casos-aula-meskeia) · 19/09/2026 (semilla S0151)
 * ════════════════════════════════════════════════════════════════════════════════════════
 *
 * Esta app es la primera de la cola del canal aula sin tarea dentro: 114 de sus 167 visitas
 * históricas llegaron en eventos-aula (el 68 %, la fracción más alta del catálogo) y todas
 * desde el mismo país. Lo que faltaba no era público, era algo que asignarle.
 *
 * Estas pruebas NO abren el navegador: importan `casos.ts` y comprueban la física. El build
 * compila la vista sin mirar si la aritmética está bien, así que si no se comprueba aquí no
 * se comprueba en ningún sitio ([[feedback_motor_calculo_aparte_y_probado]]).
 *
 * ── DE DÓNDE SALE CADA VALOR ESPERADO ───────────────────────────────────────────────────
 * Todos derivados a mano desde la definición, NUNCA copiados de lo que devuelve la app:
 *
 *   1  λ = v/f = 343/686                     = 0,5 m
 *   2  T = 1/f = 1/250 = 0,004 s             = 4 ms
 *   3  f = 1/T = 1/0,0025                    = 400 Hz
 *   4  λ = 1480/740   (agua)                 = 2 m
 *   5  λ = 5100/1700  (acero)                = 3 m
 *   6  tabla de exposición, fila de 100 dB   = 15 min
 *   7  f₄ = 4 · 220                          = 880 Hz
 *   8  f₁ = 1100/5                           = 220 Hz
 *   9  60 + 10·log₁₀(100) = 60 + 20          = 80 dB
 *  10  70 + 10·log₁₀(2) = 70 + 3,0103        = 73,01 dB   ← NO son 140
 *  11  λ = 343/20                            = 17,15 m
 *  12  λ = 343/110000 = 0,0031181 m          = 3,12 mm
 */

import {
  CASOS,
  TOTAL_CASOS,
  EXPOSICION,
  VELOCIDAD_AIRE,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  longitudDeOnda,
  nivelTrasFactor,
  periodoDe,
  resolverCaso,
  velocidadEn,
} from '../../app/visualizador-sonido-ondas/casos';

/** Las doce respuestas, calculadas a mano arriba. */
const ESPERADAS: Record<number, number> = {
  1: 0.5, 2: 4, 3: 400, 4: 2, 5: 3, 6: 15,
  7: 880, 8: 220, 9: 80, 10: 73.01, 11: 17.15, 12: 3.12,
};

test.describe('visualizador-sonido-ondas · casos para clase', () => {
  test('1 · hay doce casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan el mismo enunciado y la misma respuesta', async () => {
    const foto = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    const segunda = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    expect(segunda).toEqual(foto);
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    // Caza a quien edita un enunciado y se olvida de la solución.
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      const decimales = caso.datos.decimales ?? 2;
      const factor = 10 ** decimales;
      expect(Math.round(r.valor * factor) / factor, `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('3.bis · cada respuesta es la calculada A MANO en la cabecera', async () => {
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(ESPERADAS[caso.id]);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta no vacía, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(30);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto, `caso ${caso.id}`).not.toBe('—');
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    // El 68 % del tráfico de esta app son aulas, y el canal es 90 % latinoamericano: un
    // enunciado anclado a un sitio concreto deja fuera a la mayor parte de su público.
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos?)\b/i;
    for (const caso of CASOS) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('6 · el generador es reproducible, variado y usa la misma aritmética', async () => {
    // Reproducible: misma semilla, mismo ejercicio.
    for (const semilla of [1, 7, 99, 12345]) {
      const a = generarEjercicioAleatorio(semilla);
      const b = generarEjercicioAleatorio(semilla);
      expect(b.enunciado).toBe(a.enunciado);
      expect(b.respuesta).toBe(a.respuesta);
    }

    // Variado: reproducible NO es variado. Un xorshift32 sembrado con enteros pequeños
    // devuelve siempre el índice 0 y pasaría la prueba de arriba dando el mismo ejercicio.
    const respuestas = new Set<number>();
    const enunciados = new Set<string>();
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      respuestas.add(e.respuesta);
      enunciados.add(e.enunciado);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(enunciados.size).toBeGreaterThanOrEqual(3);

    // Misma aritmética que los fijos: su respuesta sale de `resolverCaso`, no de otra cuenta.
    for (let s = 1; s <= 20; s++) {
      const e = generarEjercicioAleatorio(s);
      const r = resolverCaso(e.datos);
      expect(r.ok, `semilla ${s}`).toBe(true);
      expect(Math.round(r.valor * 100) / 100, `semilla ${s}`).toBe(e.respuesta);
    }
  });

  test('7 · el convenio de la app queda fijado: v = 343 m/s en aire y decibelios logarítmicos', async () => {
    // Si alguien cambia la velocidad por defecto, el panel de la app y estos casos dejarían
    // de decir lo mismo. 343 m/s es aire a 20 °C, el valor con el que la app pinta su tarjeta.
    expect(VELOCIDAD_AIRE).toBe(343);
    expect(velocidadEn('Aire (20 °C)')).toBe(343);
    expect(longitudDeOnda(343)).toBe(1);
    expect(periodoDe(1000)).toBeCloseTo(0.001, 10);

    // El medio importa: el mismo tono mide casi 15 veces más dentro del acero.
    expect(longitudDeOnda(343, velocidadEn('Acero')) / longitudDeOnda(343)).toBeCloseTo(14.87, 2);

    // Los decibelios NO se suman: ×10 son +10 dB y duplicar son +3,01, nunca el doble.
    expect(nivelTrasFactor(60, 10)).toBeCloseTo(70, 10);
    expect(nivelTrasFactor(70, 2)).toBeCloseTo(73.0103, 4);
    expect(nivelTrasFactor(70, 2)).not.toBeCloseTo(140, 0);
  });

  test('8 · casos sin salida se responden con un error legible, nunca con una excepción', async () => {
    // Un throw dentro de un render tumba la página entera; un error se puede pintar.
    expect(resolverCaso({ entrada: { via: 'periodo', frecuencia: 0 } }).ok).toBe(false);
    expect(resolverCaso({ entrada: { via: 'longitud', frecuencia: 100, medio: 'Vacío' } }).ok).toBe(false);
    expect(resolverCaso({ entrada: { via: 'exposicion', db: 93 } }).ok).toBe(false);
    expect(resolverCaso({ entrada: { via: 'fundamental', frecuenciaArmonico: 440, n: 0 } }).ok).toBe(false);
  });

  test('9 · la corrección no imprime NaN y tolera el redondeo declarado', async () => {
    // El alumno escribe «73,01» y la respuesta exacta es 73,0103: tiene que valer.
    expect(comprobarRespuesta(73.01, 73.0103).correcto).toBe(true);
    // Y una respuesta de otro orden, no.
    expect(comprobarRespuesta(140, 73.0103).correcto).toBe(false);
    // Texto que no es número: veredicto con mensaje propio, sin «NaN» en pantalla.
    const v = comprobarRespuesta(Number.NaN, 0.5);
    expect(v.correcto).toBe(false);
    expect(v.motivo).not.toContain('NaN');
  });

  test('10 · la tabla de exposición que corrige es la misma que la app pinta', async () => {
    // `minutos` y `tiempo` son el mismo dato en dos formatos: si divergieran, el caso 6
    // corregiría con un número que la pantalla no dice en ninguna parte.
    const equivalencias: Record<string, number> = {
      '8 horas': 480, '4 horas': 240, '2 horas': 120, '1 hora': 60,
      '30 min': 30, '15 min': 15, '0 seg': 0,
    };
    for (const fila of EXPOSICION) {
      const esperado = equivalencias[fila.tiempo];
      if (esperado !== undefined) expect(fila.minutos, `${fila.db} dB`).toBe(esperado);
    }
  });
});

/**
 * La sección en el navegador. Las pruebas de arriba comprueban la física; esta comprueba lo
 * único que ellas no pueden: que el alumno escriba un número y la app lo corrija de verdad.
 */
test.describe('visualizador-sonido-ondas · los casos, en la página', () => {
  test('la sección se sirve y corrige la respuesta del caso 1', async ({ page }) => {
    await page.goto(URL_APP);
    await expect(page.getByRole('heading', { level: 2, name: 'Casos para clase' })).toBeVisible();

    // Se espera a la hidratación ANTES de escribir: en la ventana entre `load` y React el
    // valor entra en el DOM y no en el estado, y la corrección leería una casilla vacía.
    await esperarHidratacion(page, ['#casos-respuesta']);

    const seccion = page.locator('#casos-aula');
    const casilla = seccion.locator('#casos-respuesta');
    await casilla.fill('0,5');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    // Acotado a la sección: la app ya tiene otro role="alert" (el aviso de seguridad auditiva).
    await expect(seccion.getByRole('alert')).toContainText('Correcto');

    // Y una respuesta equivocada no se da por buena.
    await casilla.fill('2');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('No es correcto');
  });

  test('los doce casos son alcanzables y la solución se despliega', async ({ page }) => {
    await page.goto(URL_APP);
    await esperarHidratacion(page, ['#casos-respuesta']);

    const seccion = page.locator('#casos-aula');
    const navegador = seccion.getByRole('group', { name: 'Elegir caso' });
    await expect(navegador.getByRole('button')).toHaveCount(13); // 12 casos + «Practicar»

    await navegador.getByRole('button', { name: 'Caso 10: Dos máquinas iguales a la vez' }).click();
    // La app tiene 21 encabezados de nivel 3: el locator se acota, no se relaja.
    await expect(seccion.getByRole('heading', { level: 3 })).toContainText('Caso 10');

    const verSolucion = seccion.getByRole('button', { name: /Ver solución/ });
    await expect(verSolucion).toHaveAttribute('aria-expanded', 'false');
    await verSolucion.click();
    // 73,01 dB, no 140: es el error que este caso existe para corregir.
    await expect(seccion.getByText(/Respuesta:\s*73,01/)).toBeVisible();
  });
});
