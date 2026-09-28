import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  comprobarRespuesta,
  toleranciaDe,
  generarEjercicioAleatorio,
  type DatosCaso,
} from '../../app/simulador-lentes-opticas/casos';
import { calcularImagen, potenciaDioptrias } from '../../app/simulador-lentes-opticas/motor';

/**
 * Simulador de Lentes Ópticas — regresión del motor de óptica geométrica.
 *
 * CONVENIO DE SIGNOS que declara la propia app (bloque educativo y tarjeta de descripción):
 *   ecuación de Gauss para lentes delgadas   1/s + 1/s' = 1/f
 *   aumento lateral                          M = −s'/s          ·   h' = M · h
 *   s  > 0  objeto a la IZQUIERDA de la lente (siempre positivo aquí)
 *   s' > 0  imagen a la DERECHA  → real     ·   s' < 0 imagen a la izquierda → virtual
 *   f  > 0  convergente                      ·   f < 0 divergente
 *   P = 1/f con f en METROS (la app trabaja en cm, así que P = 100/f_cm)
 * NO es el convenio DIN/europeo (que toma s negativa); los valores esperados de abajo están
 * resueltos a mano con el convenio que la app declara, que es el que usa de verdad.
 *
 * Los tres controles son <input type="range">, así que no admiten texto: el clamp del propio
 * control impide f = 0 (mínimo 2 cm) y distancias negativas (mínimo 2 cm). Los valores iniciales
 * son f = 8 cm, s = 15 cm, h = 2 cm; h NO se siembra en ningún caso porque ya vale 2 y sembrar
 * el valor que un input ya tiene no probaría nada.
 */

const SLIDER_F = 'input[aria-label="Distancia focal"]';
const SLIDER_S = 'input[aria-label="Distancia objeto"]';
const SLIDER_H = 'input[aria-label="Altura del objeto"]';

/** El valor de una tarjeta de resultados, localizado por su etiqueta (no por clase CSS). */
function valorDe(page: Page, etiqueta: string) {
  return page.getByText(etiqueta, { exact: true }).locator('xpath=following-sibling::span[1]');
}

/** El banner de clasificación (role="status"): título + chips. */
function clasificacion(page: Page) {
  return page.locator('[role="status"]');
}

test.describe('simulador-lentes-opticas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-lentes-opticas/');
    await esperarHidratacion(page, [SLIDER_F, SLIDER_S, SLIDER_H]);
  });

  test('convergente con el objeto fuera del foco: imagen real, invertida y reducida', async ({ page }) => {
    // f = +10 cm, s = 30 cm, h = 2 cm
    //   1/s' = 1/f − 1/s = 1/10 − 1/30 = 1/15  →  s' = +15,00 cm (real, al otro lado)
    //   M = −s'/s = −15/30 = −0,500  (invertida, la mitad de tamaño)
    //   h' = M · h = −0,500 · 2 = −1,00 cm
    //   P = 1/0,10 m = +10,00 dioptrías
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 30);

    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('15,00 cm');
    await expect(valorDe(page, 'Aumento (M = −s\'/s)')).toHaveText('−0,500');
    await expect(valorDe(page, "Altura imagen (h')")).toHaveText('−1,00 cm');
    await expect(valorDe(page, 'Potencia P = 1/f')).toHaveText('10,00 D');

    await expect(clasificacion(page)).toContainText('Imagen real');
    await expect(clasificacion(page)).toContainText('Invertida');
    await expect(clasificacion(page)).toContainText('Reducida (×0,50)');
  });

  test('convergente con el objeto dentro del foco (lupa): imagen virtual, derecha y doble', async ({ page }) => {
    // f = +10 cm, s = 5 cm, h = 2 cm  →  el objeto está DENTRO de la distancia focal
    //   1/s' = 1/10 − 1/5 = −1/10  →  s' = −10,00 cm (virtual, al MISMO lado que el objeto)
    //   M = −s'/s = −(−10)/5 = +2,000  (derecha, el doble de tamaño)
    //   h' = +2,000 · 2 = +4,00 cm
    // Es el caso que distingue una lupa de un proyector: si aquí saliera «real», el signo de s'
    // estaría mal leído.
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 5);

    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('−10,00 cm');
    await expect(valorDe(page, 'Aumento (M = −s\'/s)')).toHaveText('2,000');
    await expect(valorDe(page, "Altura imagen (h')")).toHaveText('4,00 cm');

    await expect(clasificacion(page)).toContainText('Imagen virtual');
    await expect(clasificacion(page)).toContainText('Derecha');
    await expect(clasificacion(page)).toContainText('Aumentada (×2,00)');
  });

  test('divergente: siempre imagen virtual, derecha y menor, con potencia negativa', async ({ page }) => {
    // Lente divergente  →  f = −10 cm, s = 30 cm, h = 2 cm
    //   1/s' = 1/(−10) − 1/30 = −4/30  →  s' = −7,50 cm (virtual)
    //   M = −s'/s = 7,5/30 = +0,250  (derecha, la cuarta parte)
    //   h' = +0,250 · 2 = +0,50 cm
    //   P = 1/(−0,10 m) = −10,00 dioptrías
    // Una divergente NUNCA da imagen real con un objeto real: si apareciera «Real», sería un
    // error de signo de f.
    await page.getByRole('button', { name: /Divergente/ }).click();
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 30);

    await expect(valorDe(page, 'Distancia focal f')).toHaveText('−10,00 cm');
    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('−7,50 cm');
    await expect(valorDe(page, 'Aumento (M = −s\'/s)')).toHaveText('0,250');
    await expect(valorDe(page, "Altura imagen (h')")).toHaveText('0,50 cm');
    await expect(valorDe(page, 'Potencia P = 1/f')).toHaveText('−10,00 D');

    await expect(clasificacion(page)).toContainText('Imagen virtual');
    await expect(clasificacion(page)).toContainText('Derecha');
    await expect(clasificacion(page)).toContainText('Reducida (×0,25)');
  });

  test('objeto en el foco (s = f): imagen al infinito, sin colgar la pestaña', async ({ page }) => {
    // f = +10 cm, s = 10 cm  →  1/s' = 1/10 − 1/10 = 0: los rayos salen paralelos y NO hay
    // imagen que situar. Es la división por cero del motor; esta guarda comprueba que la app la
    // nombra, no imprime una cifra inventada y sigue respondiendo después.
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 10);

    await expect(clasificacion(page)).toContainText('Imagen al infinito');

    // Y no se califica lo que no existe: la rama de infinito devolvía M = +Infinity escrito
    // a mano, y de ahí salían «→ derecha (real)» y «derecha» justo donde no hay imagen
    // (hallazgo 961). El límite de M = −s'/s al acercarse desde s > f es −∞ y desde s < f
    // es +∞: no hay signo que escribir.
    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('—');
    await expect(valorDe(page, "Aumento (M = −s'/s)")).toHaveText('—');
    await expect(valorDe(page, "Altura imagen (h')")).toHaveText('—');
    const panel = page.locator('[class*="resultsPanel"]');
    await expect(panel).toContainText('no se forma imagen');
    await expect(panel).not.toContainText('derecha (real)');

    // La pestaña sigue viva y el simulador vuelve a calcular al mover el objeto fuera del foco.
    await sembrarValor(page, SLIDER_S, 30);
    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('15,00 cm');
  });

  test('la lupa cierra su construcción: los tres rayos pasan por la imagen virtual', async ({
    page,
  }) => {
    // f = +10 cm, s = 5 cm → s' = 1/(1/10 − 1/5) = −10 cm, M = −s'/s = +2, h' = +4 cm.
    // La imagen virtual queda en x = −10 cm, MÁS A LA IZQUIERDA que el propio objeto, así
    // que los rayos 2 y 3 necesitan su prolongación hacia atrás para llegar a ella: sin
    // ellas la construcción no se cerraba, pese a que la app promete que los tres rayos
    // «se cruzan exactamente en la imagen» (hallazgo 962).
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 5);
    await expect(valorDe(page, "Distancia imagen (s')")).toHaveText('−10,00 cm');
    await expect(valorDe(page, "Altura imagen (h')")).toHaveText('4,00 cm');

    // Se cuenta, sobre el lienzo, cuántos de los tres rayos aparecen a la izquierda del
    // objeto, que es donde vive la imagen virtual. Se compara por TONO y no por RGB exacto
    // porque las prolongaciones se dibujan atenuadas, y atenuar sobre el fondo cambia el
    // color pero conserva el tono: naranja 26°, verde 123°, azul 199°.
    const coloresALaIzquierda = await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const img = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);

      const tono = (r: number, g: number, b: number) => {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max === min) return null;
        const d = max - min;
        let h: number;
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
        return { h: h < 0 ? h + 360 : h, saturacion: d / max };
      };

      const RAYOS = [26, 123, 199]; // paralelo, central, por foco
      const vistos = new Set<number>();
      // Franja entre la imagen virtual (x = −10 cm) y el objeto (x = −5 cm): ahí solo puede
      // haber prolongaciones. El eje va de −30 a +30 cm con márgenes de 30 px.
      const plotW = rect.width - 60;
      const aPx = (cm: number) => 30 + ((cm + 30) / 60) * plotW;
      const desde = Math.round(aPx(-10) * dpr);
      const hasta = Math.round(aPx(-6) * dpr);
      for (let xp = desde; xp < hasta; xp++) {
        for (let yp = 0; yp < canvas.height; yp++) {
          const i = (yp * canvas.width + xp) * 4;
          if (img.data[i + 3] < 60) continue;
          const t = tono(img.data[i], img.data[i + 1], img.data[i + 2]);
          if (!t || t.saturacion < 0.12) continue;
          RAYOS.forEach((h, idx) => {
            if (Math.abs(t.h - h) < 14) vistos.add(idx);
          });
        }
      }
      return [...vistos].sort();
    });

    expect(coloresALaIzquierda).toEqual([0, 1, 2]);
  });

  test('el rayo central ya no usa el violeta prohibido por el CLAUDE.md', async ({ page }) => {
    const violeta = await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const img = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < img.data.length; i += 4) {
        if (
          img.data[i + 3] > 200 &&
          Math.abs(img.data[i] - 124) < 12 &&
          Math.abs(img.data[i + 1] - 58) < 12 &&
          Math.abs(img.data[i + 2] - 237) < 12
        ) {
          return true;
        }
      }
      return false;
    });
    expect(violeta).toBe(false);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * simulador-lentes-opticas · casos para clase (tarea de tipo A, 28/09/2026)
 *
 * Doce problemas de lentes delgadas. Los casos calculan con `calcularImagen` y
 * `potenciaDioptrias` de `motor.ts`, que se EXTRAJERON del `useMemo` `calculoOptico` y de la
 * tarjeta de potencia sin tocar una operación (0 diferencias en 462.108 combinaciones): lo que
 * corrige la sección y lo que pinta el panel sale de la misma función.
 *
 * ⚠️ CONVENIO: la app usa «real es positivo» (1/s + 1/s' = 1/f, s > 0 delante de la lente,
 * M = −s'/s). En España se enseña además el DIN (1/s' − 1/s = 1/f', s < 0, M = s'/s). Los casos
 * solo preguntan lo que da LO MISMO en los dos (s', M, h', P, f y una distancia sin signo), y la
 * invariante 7 lo comprueba con una implementación DIN escrita aquí, independiente de la app.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO (a mano, sin mirar la app):
 *   1 · 1/s' = 1/10 − 1/15 = 1/30                                    → s' = 30 cm
 *   2 · 1/s' = 1/10 − 1/30 = 1/15 → s' = 15; M = −15/30              = −0,5
 *   3 · s = 2f → s' = 20, M = −1; h' = −1·3                          = −3 cm
 *   4 · 1/s' = 1/12 − 1/8 = −1/24 → s' = −24; M = 24/8               = 3
 *   5 · 1/s' = 1/6 − 1/4 = −1/12                                     → s' = −12 cm
 *   6 · 1/s' = −1/10 − 1/10 = −1/5                                   → s' = −5 cm
 *   7 · 1/s' = −1/20 − 1/20 → s' = −10; M = 10/20 = 0,5; h' = 0,5·4  = 2 cm
 *   8 · P = 1/(−0,20 m)                                              = −5 D
 *   9 · P = 1/0,20 + 1/(−0,50) = 5 − 2                               = 3 D
 *  10 · 1/f = 1/10,2 + 1/510 = (50 + 1)/510 = 1/10                   → f = 10 cm
 *  11 · 1/s' = 1/5 − 1/105 = 20/105                                  → s' = 5,25 cm
 *  12 · M = +5 (virtual): s = f·(1 − 1/M) = 10·0,8 = 8; con s = 8, s' = −40 y M = 40/8 = 5
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const A_MANO_CASOS: Readonly<Record<number, number>> = {
  1: 30,
  2: -0.5,
  3: -3,
  4: 3,
  5: -12,
  6: -5,
  7: 2,
  8: -5,
  9: 3,
  10: 10,
  11: 5.25,
  12: 8,
};

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («−0,50» → 2). */
function decimalesMostrados(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

const redondeo = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

/**
 * La misma pregunta resuelta en convenio DIN, sin pasar por la app: s negativa delante de la
 * lente, 1/s' = 1/f' + 1/s y M = s'/s. Solo para las preguntas que dependen del convenio.
 */
function enDin(d: DatosCaso): number | null {
  if (d.focal === undefined || d.distanciaObjeto === undefined) return null;
  const s = -d.distanciaObjeto;
  const sImg = 1 / (1 / d.focal + 1 / s);
  const M = sImg / s;
  if (d.pregunta === 'posicionImagen') return sImg;
  if (d.pregunta === 'aumento') return M;
  if (d.pregunta === 'alturaImagen' && d.altura !== undefined) return M * d.altura;
  return null;
}

test.describe('simulador-lentes-opticas · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(redondeo(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    // La moneda por su gentilicio: «peso» suelto es una palabra de física (plano inclinado).
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|argentinos|chilenos|uruguayos)|Bachillerato|selectividad)\b/i;
    // La sigla va aparte y con mayúsculas: con /i, el pronombre «eso» la disparaba en falso.
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', async () => {
    for (const caso of CASOS) {
      const decimales = caso.datos.decimales ?? 2;
      expect(decimalesMostrados(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
      expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(!exacto);
      if (!exacto) {
        expect(caso.enunciado, `caso ${caso.id}: se redondea y el enunciado no lo pide`).toMatch(/redonde|decimal|unidades|décima/i);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.pregunta)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta)).toBe(true);
      expect(redondeo(resolverCaso(m.datos).valor, m.datos.decimales ?? 2)).toBe(m.respuesta);
      // Tampoco el aleatorio pregunta nada que dependa del convenio.
      const din = enDin(m.datos);
      if (din !== null) expect(comprobarRespuesta(din, m.respuesta).correcto).toBe(true);
    }
  });

  test('7 · el convenio queda fijado, y en DIN las respuestas son las mismas', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_CASOS[caso.id]);
    }

    // (b) El motor extraído: el estado de fábrica del acta (f = 8, s = 15, h = 2).
    const fabrica = calcularImagen(8, 15, 2);
    expect(fabrica.valido).toBe(true);
    expect(fabrica.sImg).toBeCloseTo(120 / 7, 10);
    expect(fabrica.M).toBeCloseTo(-8 / 7, 10);
    expect(calcularImagen(10, 10, 2).valido).toBe(false);
    expect(potenciaDioptrias(-20)).toBe(-5);

    // (c) Un alumno que trabaja en DIN obtiene la misma cifra en todos los casos que dependen
    //     del convenio; y al menos uno lo hace, o esta comprobación no miraría nada.
    let mirados = 0;
    for (const caso of CASOS) {
      const din = enDin(caso.datos);
      if (din === null) continue;
      mirados++;
      expect(comprobarRespuesta(din, caso.respuesta).correcto, `caso ${caso.id}`).toBe(true);
    }
    expect(mirados).toBeGreaterThanOrEqual(6);

    // (d) Los errores del tema NO entran: olvidar el signo de f en la divergente (caso 6 → 1/s' =
    //     1/10 − 1/10, sin imagen) no da −5, y el valor absoluto del aumento invertido (caso 2)
    //     tampoco vale: el signo es información.
    expect(comprobarRespuesta(5, -5).correcto).toBe(false);
    expect(comprobarRespuesta(0.5, -0.5).correcto).toBe(false);
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    expect(comprobarRespuesta(30, 30).correcto).toBe(true);
    expect(comprobarRespuesta(NaN, -12).correcto).toBe(false);
    expect(comprobarRespuesta(NaN, -12).motivo).not.toMatch(/NaN/);
    expect(toleranciaDe(0)).toBe(0.01);
    expect(toleranciaDe(-12)).toBeCloseTo(0.12, 10);
    // Borde exacto de la tolerancia, por los dos lados (hallazgo 1211 del 22/09/2026).
    expect(comprobarRespuesta(-0.49, -0.5).correcto).toBe(true);
    expect(comprobarRespuesta(-0.51, -0.5).correcto).toBe(true);
  });
});

test.describe('simulador-lentes-opticas · la sección de casos en el navegador', () => {
  const seccion = (page: Page) => page.locator('#casos-aula');

  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-lentes-opticas/');
    await esperarHidratacion(page, ['#casos-respuesta', SLIDER_F, SLIDER_S, SLIDER_H]);
  });

  test('el caso 5 acepta el signo menos tipográfico y el del teclado', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 5:/ }).click();
    for (const texto of ['−12', '-12']) {
      await seccion(page).locator('#casos-respuesta').fill(texto);
      await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
      await expect(seccion(page).getByRole('alert')).toContainText('¡Correcto!');
    }
  });

  test('el aumento sin signo en el caso 2 se rechaza y la solución enseña −0,50', async ({ page }) => {
    await seccion(page).getByRole('button', { name: /^Caso 2:/ }).click();
    await seccion(page).locator('#casos-respuesta').fill('0,5');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).getByRole('alert')).toContainText('No es correcto');
    const solucion = seccion(page).getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(seccion(page).locator('#casos-resultado')).toContainText('−0,50');
  });
});
