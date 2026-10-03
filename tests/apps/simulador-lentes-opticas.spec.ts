import { test, expect, Page, devices } from '@playwright/test';
import { esperarHidratacion, sembrarValor, sembrarValorAcotado } from './_hidratacion';
import { activarTema } from '../contraste-text-muted-auxiliares';
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
    // REESCRITO en la re-inspección del 03/10/2026. Aquí se fijaban como CORRECTOS
    // `toleranciaDe(0) = 0,01`, `toleranciaDe(−12) = 0,12` y que −0,49 y −0,51 valieran por
    // −0,5: es decir, el margen del 1 % que la re-inspección registra como defecto (los doce
    // casos tienen datos exactos, y la tolerancia la da la pregunta, no la cifra). Esas
    // aserciones pasan, con el criterio correcto, al test.fail «ABIERTO» del final del fichero.
    // Lo que sí se conserva del hallazgo 1211 (22/09/2026) es su intención: el ruido binario
    // de la resta en coma flotante no decide nunca un veredicto, sea cual sea la tolerancia.
    expect(comprobarRespuesta(-0.5 + 1e-12, -0.5).correcto).toBe(true);
    expect(comprobarRespuesta(5.25 - 1e-12, 5.25).correcto).toBe(true);
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * RE-INSPECCIÓN DEL 03/10/2026
 *
 * Los cinco hallazgos del 20/09/2026 (961-965) siguen cerrados: con el objeto en el foco las
 * tarjetas dicen «—», la lupa cierra su construcción, las dos reglas unívocas de a11y están en
 * orden, la FAQ del proyector dice «entre f y 2f» y el rayo central ya no es violeta.
 *
 * Todos los valores esperados están resueltos a mano con el convenio que la app declara
 * («real es positivo»): 1/s + 1/s' = 1/f, s > 0 delante de la lente, M = −s'/s, h' = M·h y
 * P = 100/f con f en cm. El panel escribe s', h' y P con dos decimales y M con tres.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const AUMENTO = "Aumento (M = −s'/s)";
const IMAGEN = "Distancia imagen (s')";
const ALTURA = "Altura imagen (h')";
const POTENCIA = 'Potencia P = 1/f';

test.describe('simulador-lentes-opticas · re-inspección 03/10/2026 · el simulador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-lentes-opticas/');
    await esperarHidratacion(page, [SLIDER_F, SLIDER_S, SLIDER_H]);
  });

  test('estado de fábrica (f = +8, s = 15, h = 2): real, invertida y aumentada', async ({ page }) => {
    // 1/s' = 1/8 − 1/15 = 7/120 → s' = 120/7 = 17,1429 → «17,14 cm»
    // M = −(120/7)/15 = −8/7 = −1,142857 → «−1,143» · h' = −16/7 = −2,2857 → «−2,29 cm»
    // P = 100/8 = 12,5 → «12,50 D» · |M| = 1,14 → «Aumentada (×1,14)»
    await expect(valorDe(page, IMAGEN)).toHaveText('17,14 cm');
    await expect(valorDe(page, AUMENTO)).toHaveText('−1,143');
    await expect(valorDe(page, ALTURA)).toHaveText('−2,29 cm');
    await expect(valorDe(page, POTENCIA)).toHaveText('12,50 D');
    await expect(clasificacion(page)).toContainText('Imagen real');
    await expect(clasificacion(page)).toContainText('Invertida');
    await expect(clasificacion(page)).toContainText('Aumentada (×1,14)');
  });

  test('f = +10, s = 25, h = 3: real, invertida y reducida', async ({ page }) => {
    // 1/s' = 1/10 − 1/25 = 3/50 → s' = 16,667 → «16,67 cm»
    // M = −16,667/25 = −2/3 → «−0,667» · h' = −2/3 · 3 = −2 → «−2,00 cm»
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 25);
    await sembrarValor(page, SLIDER_H, 3);
    await expect(valorDe(page, IMAGEN)).toHaveText('16,67 cm');
    await expect(valorDe(page, AUMENTO)).toHaveText('−0,667');
    await expect(valorDe(page, ALTURA)).toHaveText('−2,00 cm');
    await expect(clasificacion(page)).toContainText('Reducida (×0,67)');
  });

  test('objeto en 2f (f = 10, s = 20): M = −1 exacto y «Mismo tamaño», como dice la tabla', async ({
    page,
  }) => {
    // 1/s' = 1/10 − 1/20 = 1/20 → s' = 20 · M = −1 · h' = −2. En toda la diagonal s = 2f de los
    // deslizadores |M| sale 1 exacto en coma flotante (barrido de las 37 parejas): ninguna da
    // «Aumentada (×1,00)».
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 20);
    await expect(valorDe(page, IMAGEN)).toHaveText('20,00 cm');
    await expect(valorDe(page, AUMENTO)).toHaveText('−1,000');
    await expect(valorDe(page, ALTURA)).toHaveText('−2,00 cm');
    await expect(clasificacion(page)).toContainText('Mismo tamaño');
  });

  test('objeto entre el foco y la lente (f = 10, s = 4): virtual, derecha y aumentada', async ({
    page,
  }) => {
    // 1/s' = 1/10 − 1/4 = −3/20 → s' = −6,667 → «−6,67 cm» (virtual, a la izquierda)
    // M = 6,667/4 = 5/3 → «1,667» · h' = 10/3 = 3,333 → «3,33 cm»
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 4);
    await expect(valorDe(page, IMAGEN)).toHaveText('−6,67 cm');
    await expect(page.locator('[class*="resultsPanel"]')).toContainText('← izquierda (virtual)');
    await expect(valorDe(page, AUMENTO)).toHaveText('1,667');
    await expect(valorDe(page, ALTURA)).toHaveText('3,33 cm');
    await expect(clasificacion(page)).toContainText('Virtual');
    await expect(clasificacion(page)).toContainText('Derecha');
    await expect(clasificacion(page)).toContainText('Aumentada (×1,67)');
  });

  test('divergente de focal 20 con el objeto a 30: s′ = −12, M = 0,4 y −5 dioptrías', async ({
    page,
  }) => {
    // f = −20 · 1/s' = −1/20 − 1/30 = −1/12 → s' = −12 · M = 12/30 = 0,4 · h' = 0,8 · P = −5
    await page.getByRole('button', { name: /Divergente/ }).click();
    await sembrarValor(page, SLIDER_F, 20);
    await sembrarValor(page, SLIDER_S, 30);
    await expect(valorDe(page, 'Distancia focal f')).toHaveText('−20,00 cm');
    await expect(valorDe(page, IMAGEN)).toHaveText('−12,00 cm');
    await expect(valorDe(page, AUMENTO)).toHaveText('0,400');
    await expect(valorDe(page, ALTURA)).toHaveText('0,80 cm');
    await expect(valorDe(page, POTENCIA)).toHaveText('−5,00 D');
    await expect(clasificacion(page)).toContainText('Reducida (×0,40)');
  });

  test('extremos de los deslizadores: s′ = 820 cm con f = 20 y s = 20,5; 50 D con f = 2', async ({
    page,
  }) => {
    // f = 20, s = 20,5: s' = 20·20,5/0,5 = 820 · M = −820/20,5 = −40 · h' = −40·5 = −200
    await sembrarValor(page, SLIDER_F, 20);
    await sembrarValor(page, SLIDER_S, 20.5);
    await sembrarValor(page, SLIDER_H, 5);
    await expect(valorDe(page, IMAGEN)).toHaveText('820,00 cm');
    await expect(valorDe(page, AUMENTO)).toHaveText('−40,000');
    await expect(valorDe(page, ALTURA)).toHaveText('−200,00 cm');
    await expect(valorDe(page, POTENCIA)).toHaveText('5,00 D');
    // f = 2: P = 100/2 = 50 · s' = 2·20,5/18,5 = 2,216 → «2,22 cm»
    await sembrarValor(page, SLIDER_F, 2);
    await expect(valorDe(page, POTENCIA)).toHaveText('50,00 D');
    await expect(valorDe(page, IMAGEN)).toHaveText('2,22 cm');
  });

  test('lo que no se admite (focal 0, distancia 0 o negativa, altura 0) lo capa el control', async ({
    page,
  }) => {
    // Los tres son deslizadores: no hay campo donde escribir 0 o −5. Se capan a su mínimo
    // (f = 2, s = 2, h = 0,5); con f = s = 2 el objeto queda en el foco y no hay imagen.
    expect(await sembrarValorAcotado(page, SLIDER_F, 0)).toBe('2');
    expect(await sembrarValorAcotado(page, SLIDER_S, -5)).toBe('2');
    expect(await sembrarValorAcotado(page, SLIDER_H, 0)).toBe('0.5');
    await expect(clasificacion(page)).toContainText('Imagen al infinito');
    await expect(valorDe(page, IMAGEN)).toHaveText('—');
    await expect(valorDe(page, AUMENTO)).toHaveText('—');
    await expect(valorDe(page, POTENCIA)).toHaveText('50,00 D');
    await expect(page.getByText('h = 0,5 cm')).toBeVisible();
  });

  test('«Verlo en el simulador» de los casos 1, 4 y 7 dice lo que imprime el panel', async ({
    page,
  }) => {
    // Caso 1: f = 10, s = 15 → s' = 30 · Caso 4: f = 12, s = 8 → s' = −24, M = 3
    // Caso 7: divergente f = 20, s = 20, h = 4 → s' = −10, M = 0,5, h' = 2
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 15);
    await expect(valorDe(page, IMAGEN)).toHaveText('30,00 cm');
    expect(CASOS[0].comoComprobar).toContain('30,00 cm');

    await sembrarValor(page, SLIDER_F, 12);
    await sembrarValor(page, SLIDER_S, 8);
    await expect(valorDe(page, AUMENTO)).toHaveText('3,000');
    expect(CASOS[3].comoComprobar).toContain('3,000');

    await page.getByRole('button', { name: /Divergente/ }).click();
    await sembrarValor(page, SLIDER_F, 20);
    await sembrarValor(page, SLIDER_S, 20);
    await sembrarValor(page, SLIDER_H, 4);
    await expect(valorDe(page, ALTURA)).toHaveText('2,00 cm');
    expect(CASOS[6].comoComprobar).toContain('2,00 cm');
  });
});

/* ─────────────── Casos para clase: lo que el corrector rechaza y lo que no ─────────────── */

/**
 * Errores conceptuales típicos, resueltos a mano para cada caso. NINGUNO debe colar, ni hoy
 * con el 1 % ni después de ajustar la tolerancia: es la guarda de que el ajuste no afloje.
 */
const ERRORES_CONCEPTUALES: Readonly<Record<number, readonly (readonly [number, string])[]>> = {
  1: [[-30, '1/f = 1/s − 1/s′ (1/15 − 1/10)'], [6, 'DIN sin negar s (1/10 + 1/15)']],
  2: [[0.5, 'aumento sin signo'], [-2, 'M = −s/s′ (30/15)']],
  3: [[3, 'altura sin signo']],
  4: [[-3, 'M = s′/s con s positiva'], [1 / 3, 'M = −s/s′ (8/24)']],
  5: [[12, '1/f = 1/s − 1/s′ (1/4 − 1/6)'], [2.4, 'DIN sin negar s (1/6 + 1/4)']],
  6: [[5, '1/f = 1/s − 1/s′ (1/10 + 1/10)']],
  7: [[-2, 'M = s′/s con s positiva'], [8, 'M = −s/s′ (20/10)·4']],
  8: [[5, 'dioptrías sin signo'], [-0.05, 'focal en cm, no en m']],
  9: [[-10 / 3, 'sumar focales (100/(20 − 50))'], [0.03, 'focales en cm'], [7, 'olvidar el signo de la divergente']],
  10: [[510 / 49, '1/f = 1/s − 1/s′ (1/10,2 − 1/510)'], [3.4, 'sin pasar 5,1 m a cm'], [10.2, 'f ≈ s, pantalla «lejos»']],
  11: [[5, 'imagen en el foco (objeto «lejano»)'], [-5.25, 'signo de la imagen'], [105 / 22, 'DIN sin negar s (1/5 + 1/105)']],
  12: [[12, 'M = −5 (invertida)'], [2, 's = f/M']],
};

/**
 * Vecinos de la respuesta que NO son la respuesta: ±1 en la segunda cifra decimal (la que
 * enseña la solución, «30,00 cm»), la respuesta redondeada de más y el truncamiento. Los doce
 * casos tienen datos EXACTOS (no se lee nada de una tabla ni de una gráfica) y respuesta
 * exacta, así que la pregunta no da margen: como mucho media unidad de la segunda decimal.
 */
const VECINOS: Readonly<Record<number, readonly number[]>> = {
  1: [30.01, 29.99, 30.3, 29.7],
  2: [-0.49, -0.51],
  3: [-2.99, -3.03],
  4: [2.99, 3.03],
  5: [-11.99, -11.9, -12.1],
  6: [-4.99, -5.05],
  7: [1.99, 2.02],
  8: [-4.99, -5.05],
  9: [2.99, 3.03],
  10: [9.99, 9.9, 10.1],
  11: [5.24, 5.26, 5.2, 5.3],
  12: [7.99, 7.92, 8.08],
};

test.describe('simulador-lentes-opticas · re-inspección 03/10/2026 · el corrector', () => {
  test('los errores conceptuales típicos se rechazan en los doce casos', async () => {
    const cuelan: string[] = [];
    for (const caso of CASOS) {
      for (const [valor, error] of ERRORES_CONCEPTUALES[caso.id]) {
        if (comprobarRespuesta(valor, caso.respuesta).correcto) cuelan.push(`caso ${caso.id}: ${valor} (${error})`);
      }
    }
    expect(cuelan).toEqual([]);
  });

  test('ABIERTO · el 1 % da por buenos vecinos y redondeos que no son la respuesta', async () => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): toleranciaDe = máx(0,01; 1 %) con datos y respuestas exactos',
    );
    const cuelan: string[] = [];
    for (const caso of CASOS) {
      for (const v of VECINOS[caso.id]) {
        if (comprobarRespuesta(v, caso.respuesta).correcto) cuelan.push(`caso ${caso.id}: ${v} por ${caso.respuesta}`);
      }
    }
    // Hoy cuelan todos: p. ej. 5,3 y 5,2 por 5,25 (caso 11), −0,49 y −0,51 por −0,5 (caso 2),
    // 30,3 y 29,7 por 30 (caso 1). Con datos exactos la tolerancia es, como mucho, media unidad
    // de la segunda decimal (0,005), y la del caso 1 hoy es 0,30.
    expect(toleranciaDe(30)).toBeLessThanOrEqual(0.005);
    expect(cuelan).toEqual([]);
  });
});

test.describe('simulador-lentes-opticas · re-inspección 03/10/2026 · el corrector en el navegador', () => {
  const seccion = (page: Page) => page.locator('#casos-aula');

  async function responder(page: Page, texto: string): Promise<string> {
    await seccion(page).locator('#casos-respuesta').fill(texto);
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    return (await seccion(page).locator('#casos-veredicto').textContent()) ?? '';
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-lentes-opticas/');
    await esperarHidratacion(page, ['#casos-respuesta', SLIDER_F]);
  });

  test('caso 11: la respuesta exacta (5,25) vale escrita de varias formas; 5 (imagen en el foco) no', async ({
    page,
  }) => {
    // 1/s' = 1/5 − 1/105 = 20/105 → s' = 5,25 cm exactos
    await seccion(page).getByRole('button', { name: /^Caso 11:/ }).click();
    for (const texto of ['5,25', '5.25', '5,2500', ' 5,25 ']) {
      expect(await responder(page, texto), texto).toContain('¡Correcto!');
    }
    expect(await responder(page, '5')).toContain('No es correcto');
    expect(await responder(page, '5,25 cm')).toContain('Escribe un número');
  });

  test('teclear «-» suelto no rompe nada: avisa, y al completar «-12» el caso 5 es correcto', async ({
    page,
  }) => {
    // Caso 5: 1/s' = 1/6 − 1/4 = −1/12 → s' = −12
    await seccion(page).getByRole('button', { name: /^Caso 5:/ }).click();
    const campo = seccion(page).locator('#casos-respuesta');
    await campo.pressSequentially('-');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).locator('#casos-veredicto')).toContainText('Escribe un número');
    // El clic en «Comprobar» se llevó el foco; al volver, el cursor de Playwright queda al
    // principio del campo (una persona pulsaría detrás del «-»): se lleva al final.
    await campo.click();
    await campo.press('End');
    await campo.pressSequentially('12,');
    await expect(campo).toHaveValue('-12,');
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion(page).locator('#casos-veredicto')).toContainText('¡Correcto!');
  });

  test('practicar con Date.now() = 1791000000163 da el ejercicio de la lupa de 15 cm', async ({
    page,
  }) => {
    // Guarda del caso ABIERTO de abajo: si el generador cambia, este falla en vez de dejar al
    // test.fail «pasar» por otro motivo. Objeto a 8 cm de una convergente de 15 cm:
    // s' = 15·8/(8 − 15) = −120/7 = −17,142857 → a dos decimales −17,14.
    await page.clock.setFixedTime(new Date(1791000000163));
    await seccion(page).locator('#casos-practicar').click();
    const enunciado = seccion(page).locator('#casos-enunciado');
    await expect(enunciado).toContainText('a 8 cm delante de una lente convergente de 15 cm de focal');
    await expect(enunciado).toContainText('redondea a dos decimales');
    expect(await responder(page, '-17,14')).toContain('¡Correcto!');
  });

  test('ABIERTO · 5,3 por 5,25, −0,49 por −0,5 y «−17» cuando se piden dos decimales cuelan', async ({
    page,
  }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): el corrector acepta un 1 % con datos exactos',
    );
    const cuelan: string[] = [];
    await seccion(page).getByRole('button', { name: /^Caso 11:/ }).click();
    if ((await responder(page, '5,3')).includes('¡Correcto!')) cuelan.push('caso 11: 5,3');
    await seccion(page).getByRole('button', { name: /^Caso 2:/ }).click();
    if ((await responder(page, '-0,49')).includes('¡Correcto!')) cuelan.push('caso 2: −0,49');
    await page.clock.setFixedTime(new Date(1791000000163));
    await seccion(page).locator('#casos-practicar').click();
    if ((await responder(page, '-17')).includes('¡Correcto!')) cuelan.push('práctica −17,14: −17');
    expect(cuelan).toEqual([]);
  });

  test('practicar con Date.now() = 1791000000313: divergente de 15 cm con el objeto a 25', async ({
    page,
  }) => {
    // Guarda del caso ABIERTO de abajo. s' = 1/(−1/15 − 1/25) = −75/8 = −9,375 cm exactos.
    await page.clock.setFixedTime(new Date(1791000000313));
    await seccion(page).locator('#casos-practicar').click();
    await expect(seccion(page).locator('#casos-enunciado')).toContainText(
      'a 25 cm delante de una lente divergente de focal 15 cm',
    );
  });

  test('ABIERTO · la práctica redondea −9,375 a −9,37 mientras el panel imprime −9,38', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): redondear() usa Math.round, que lleva los empates negativos hacia cero',
    );
    // −9,375 a dos decimales es −9,38 (redondeo simétrico, el de formatNumber y el del panel
    // con divergente 15 y objeto a 25); la misma práctica lleva +0,375 a 0,38
    // (Date.now() = 1791000000005).
    await page.clock.setFixedTime(new Date(1791000000313));
    await seccion(page).locator('#casos-practicar').click();
    await seccion(page).getByRole('button', { name: /Ver solución/ }).click();
    await expect(seccion(page).locator('#casos-resultado')).toContainText('−9,38 cm', { timeout: 2000 });
  });
});

test.describe('simulador-lentes-opticas · re-inspección 03/10/2026 · redondeo del panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-lentes-opticas/');
    await esperarHidratacion(page, [SLIDER_F, SLIDER_S]);
  });

  test('el empate 2,125 (f = 2, s = 34) se redondea hacia arriba: «2,13 cm»', async ({ page }) => {
    // s' = 2·34/32 = 2,125 exactos
    await sembrarValor(page, SLIDER_F, 2);
    await sembrarValor(page, SLIDER_S, 34);
    await expect(valorDe(page, IMAGEN)).toHaveText('2,13 cm');
  });

  test('ABIERTO · el empate 5,625 (f = 2,5, s = 4,5) sale «5,62 cm»', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): 1/(1/f − 1/s) deja 5,624999999999999 y toFixed lo baja',
    );
    // s' = 2,5·4,5/2 = 5,625 exactos → «5,63 cm», como el panel hace con 2,125 → «2,13 cm».
    await sembrarValor(page, SLIDER_F, 2.5);
    await sembrarValor(page, SLIDER_S, 4.5);
    await expect(valorDe(page, IMAGEN)).toHaveText('5,63 cm', { timeout: 2000 });
  });
});

/* ─────────────── El lienzo: la punta de la flecha de la imagen y el contraste ─────────────── */

interface LienzoRegistrado {
  textos: { t: string; c: string }[];
  trazos: { c: string; ancho: number; alfa: number }[];
  triangulos: { c: string; pts: number[][] }[];
}

/** Se inyecta ANTES del goto: anota lo que pinta cada redibujado (clearRect lo reinicia). */
function instrumentarLienzo(): void {
  const w = window as unknown as { __lienzo: LienzoRegistrado };
  w.__lienzo = { textos: [], trazos: [], triangulos: [] };
  const P = CanvasRenderingContext2D.prototype;
  let puntos: number[][] = [];
  const clearRect = P.clearRect;
  P.clearRect = function (this: CanvasRenderingContext2D, x: number, y: number, an: number, al: number) {
    w.__lienzo = { textos: [], trazos: [], triangulos: [] };
    return clearRect.call(this, x, y, an, al);
  };
  const beginPath = P.beginPath;
  P.beginPath = function (this: CanvasRenderingContext2D) {
    puntos = [];
    return beginPath.call(this);
  };
  const moveTo = P.moveTo;
  P.moveTo = function (this: CanvasRenderingContext2D, x: number, y: number) {
    puntos.push([x, y]);
    return moveTo.call(this, x, y);
  };
  const lineTo = P.lineTo;
  P.lineTo = function (this: CanvasRenderingContext2D, x: number, y: number) {
    puntos.push([x, y]);
    return lineTo.call(this, x, y);
  };
  // fill y stroke están sobrecargados: sin el cast, .call() elige la firma con Path2D.
  const fill = P.fill as (this: CanvasRenderingContext2D) => void;
  P.fill = function (this: CanvasRenderingContext2D) {
    if (puntos.length === 3) w.__lienzo.triangulos.push({ c: String(this.fillStyle), pts: puntos.map((p) => [...p]) });
    return fill.call(this);
  } as typeof P.fill;
  const stroke = P.stroke as (this: CanvasRenderingContext2D) => void;
  P.stroke = function (this: CanvasRenderingContext2D) {
    w.__lienzo.trazos.push({ c: String(this.strokeStyle), ancho: this.lineWidth, alfa: this.globalAlpha });
    return stroke.call(this);
  } as typeof P.stroke;
  const fillText = P.fillText;
  P.fillText = function (this: CanvasRenderingContext2D, texto: string, x: number, y: number) {
    w.__lienzo.textos.push({ t: String(texto), c: String(this.fillStyle) });
    return fillText.call(this, texto, x, y);
  } as typeof P.fillText;
}

async function leerLienzo(page: Page): Promise<LienzoRegistrado> {
  // Dos fotogramas: el redibujado lo dispara un efecto o el MutationObserver del tema.
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
  return page.evaluate(() => (window as unknown as { __lienzo: LienzoRegistrado }).__lienzo);
}

/**
 * Espera a que el ÚLTIMO redibujado lleve una flecha de `colorFlecha` y, si se pide, un rótulo
 * de `colorTexto`: sembrar un deslizador confirma el estado de React, pero el lienzo se pinta
 * después, en un efecto, y leerlo antes mediría el dibujo anterior.
 */
async function esperarLienzo(page: Page, colorFlecha: string, colorTexto?: string): Promise<void> {
  await page.waitForFunction(
    ({ flecha, texto }) => {
      const l = (window as unknown as { __lienzo: LienzoRegistrado }).__lienzo;
      return l.triangulos.some((t) => t.c === flecha) && (!texto || l.textos.some((t) => t.c === texto));
    },
    { flecha: colorFlecha, texto: colorTexto ?? '' },
  );
}

type Rgb = [number, number, number];

/** «#rrggbb», «rgb(r, g, b)» o «rgba(r, g, b, a)» → color y alfa. */
function colorDe(css: string): { rgb: Rgb; a: number } {
  const t = css.trim();
  if (t.startsWith('#')) {
    return { rgb: [1, 3, 5].map((i) => parseInt(t.slice(i, i + 2), 16)) as Rgb, a: 1 };
  }
  const n = (t.match(/[\d.]+/g) ?? []).map(Number);
  return { rgb: [n[0], n[1], n[2]], a: n.length > 3 ? n[3] : 1 };
}

function luminancia([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contraste(a: Rgb, b: Rgb): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Compone de dentro afuera los fondos de los antepasados (el primero es el del propio nodo). */
function fondoCompuesto(capas: string[]): Rgb {
  const pila: { rgb: Rgb; a: number }[] = [];
  for (const capa of capas) {
    const c = colorDe(capa);
    if (c.a > 0) pila.push(c);
    if (c.a >= 1) break;
  }
  let base: Rgb = [255, 255, 255];
  for (let i = pila.length - 1; i >= 0; i--) {
    const { rgb, a } = pila[i];
    base = [0, 1, 2].map((k) => rgb[k] * a + base[k] * (1 - a)) as Rgb;
  }
  return base;
}

/** Fondo real bajo el lienzo (es transparente: se ve el del contenedor). */
async function fondoDelLienzo(page: Page): Promise<Rgb> {
  const capas = await page.locator('canvas').evaluate((cv) => {
    const out: string[] = [];
    for (let e: Element | null = cv; e; e = e.parentElement) out.push(getComputedStyle(e).backgroundColor);
    return out;
  });
  return fondoCompuesto(capas);
}

/** Lo que el lienzo pinta por debajo de su umbral: 4,5:1 los rótulos y 3:1 los trazos. */
function bajoUmbral(lienzo: LienzoRegistrado, fondo: Rgb): string[] {
  const fuera = new Set<string>();
  for (const { t, c } of lienzo.textos) {
    const r = contraste(colorDe(c).rgb, fondo);
    if (r < 4.5) fuera.add(`texto «${t.replace(/[−-]?\d+(,\d+)?/g, '#')}» ${c} ${r.toFixed(2)}:1`);
  }
  // Rejilla (1 px) y prolongaciones atenuadas (alfa 0,35) son decorativas a propósito.
  for (const { c, ancho, alfa } of lienzo.trazos) {
    if (ancho < 1.5 || alfa < 1) continue;
    const r = contraste(colorDe(c).rgb, fondo);
    if (r < 3) fuera.add(`trazo ${c} ${r.toFixed(2)}:1`);
  }
  return [...fuera].sort();
}

test.describe('simulador-lentes-opticas · re-inspección 03/10/2026 · el lienzo', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(instrumentarLienzo);
    await page.goto('/simulador-lentes-opticas/');
    await esperarHidratacion(page, [SLIDER_F, SLIDER_S, SLIDER_H]);
  });

  test('la flecha del objeto apunta hacia arriba (h > 0)', async ({ page }) => {
    await esperarLienzo(page, '#48a9a6');
    const { triangulos } = await leerLienzo(page);
    expect(triangulos.length).toBe(2); // objeto e imagen
    const [vertice, base] = triangulos[0].pts;
    expect(vertice[1]).toBeLessThan(base[1]);
  });

  test('ABIERTO · la punta de la flecha de la imagen apunta al revés que la imagen', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): baseDir = hImg > 0 ? -1 : 1 dibuja la punta hacia el eje',
    );
    const mal: string[] = [];
    // Fábrica (f = 8, s = 15): h' = −2,29, invertida → la punta debe mirar ABAJO (el vértice
    // más abajo que la base: y mayor en píxeles).
    await esperarLienzo(page, '#48a9a6');
    let { triangulos } = await leerLienzo(page);
    let [vertice, base] = triangulos[1].pts;
    if (!(vertice[1] > base[1])) mal.push('imagen real invertida con la punta hacia arriba');
    // Lupa (f = 10, s = 5): h' = +4, derecha → la punta debe mirar ARRIBA.
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 5);
    await esperarLienzo(page, '#a82e68'); // la imagen virtual va en #A82E68
    ({ triangulos } = await leerLienzo(page));
    [vertice, base] = triangulos[1].pts;
    if (!(vertice[1] < base[1])) mal.push('imagen virtual derecha con la punta hacia abajo');
    expect(mal).toEqual([]);
  });

  test('ABIERTO · en claro, rótulos y trazos del lienzo bajo 4,5:1 y 3:1', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): #48A9A6, #2E86AB, #0EA5E9 y #E07A1F fijos sobre #FAFAFA',
    );
    await activarTema(page, 'light');
    const fuera = bajoUmbral(await leerLienzo(page), await fondoDelLienzo(page));
    // Hoy: «Objeto» e «Imagen real» (#48A9A6) 2,68:1, «Lente (f = 8,0 cm)» (#2E86AB) 3,93:1;
    // la flecha del objeto 2,68:1, el rayo 3 (#0EA5E9) 2,66:1 y el rayo 1 (#E07A1F) 2,89:1.
    expect(fuera).toEqual([]);
  });

  test('ABIERTO · en oscuro, rótulos y trazos del lienzo bajo 4,5:1 y 3:1', async ({ page }) => {
    test.fail(true, 'ABIERTO, hallazgo (inspector 03/10/2026): #A82E68 y #2E86AB fijos sobre #1A1A1A');
    await activarTema(page, 'dark');
    await sembrarValor(page, SLIDER_F, 10);
    await sembrarValor(page, SLIDER_S, 5);
    await esperarLienzo(page, '#a82e68', '#e5e5e5'); // imagen virtual y rótulos del eje en oscuro
    const fuera = bajoUmbral(await leerLienzo(page), await fondoDelLienzo(page));
    // Hoy: «F», «F'», «2F», «2F'» e «Imagen virtual» (#A82E68) 2,70:1, «Lente (f = 10,0 cm)»
    // 4,24:1 y la flecha discontinua de la imagen virtual 2,70:1.
    expect(fuera).toEqual([]);
  });
});

/* ─────────────── Color de marca como texto, y el emoji del botón divergente ─────────────── */

async function contrasteDeTexto(
  page: Page,
  selector: string,
): Promise<{ texto: string; ratio: number; grande: boolean }[]> {
  const datos = await page.locator(selector).evaluateAll((els) =>
    els.map((el) => {
      const capas: string[] = [];
      let opacidad = 1;
      for (let e: Element | null = el; e; e = e.parentElement) {
        const estilo = getComputedStyle(e);
        capas.push(estilo.backgroundColor);
        opacidad *= Number(estilo.opacity);
      }
      const cs = getComputedStyle(el);
      return {
        texto: (el.textContent ?? '').trim().slice(0, 40),
        color: cs.color,
        capas,
        opacidad,
        tam: parseFloat(cs.fontSize),
        peso: Number(cs.fontWeight),
      };
    }),
  );
  return datos.map((d) => {
    const fondo = fondoCompuesto(d.capas);
    const c = colorDe(d.color);
    const a = c.a * d.opacidad;
    const texto = [0, 1, 2].map((k) => c.rgb[k] * a + fondo[k] * (1 - a)) as Rgb;
    return { texto: d.texto, ratio: contraste(texto, fondo), grande: d.tam >= 24 || (d.tam >= 18.66 && d.peso >= 700) };
  });
}

test.describe('simulador-lentes-opticas · re-inspección 03/10/2026 · contraste y nombres', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-lentes-opticas/');
    await esperarHidratacion(page, [SLIDER_F]);
  });

  test('ABIERTO · en claro, --primary como texto: chips de la clasificación y valores de los deslizadores', async ({
    page,
  }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): color: var(--primary) sobre fondo claro en vez de --primary-texto',
    );
    await activarTema(page, 'light');
    const fuera: string[] = [];
    for (const sel of ['[class*="classChip"]', '[class*="controlLabel"] strong', '[class*="faqItem"] h4']) {
      for (const m of await contrasteDeTexto(page, sel)) {
        if (m.ratio < (m.grande ? 3 : 4.5)) fuera.push(`${sel} «${m.texto}» ${m.ratio.toFixed(2)}:1`);
      }
    }
    // Hoy: chips «Real», «Invertida», «Aumentada (×1,14)» 3,42:1 (13,6 px), «8,0 cm» de los
    // deslizadores 4,11:1 y los títulos de la FAQ 3,93:1.
    expect(fuera).toEqual([]);
  });

  test('ABIERTO · en oscuro, los números de los pasos son blanco sobre --primary', async ({ page }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): .stepNumber blanco sobre var(--primary) (#3FA5D1 en oscuro)',
    );
    await activarTema(page, 'dark');
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const medidas = await contrasteDeTexto(page, '[class*="stepNumber"]');
    expect(medidas.length).toBe(5);
    // 19,2 px en negrita es texto grande: pide 3:1. Hoy 2,79:1 (y 2,21:1 bajo stemum.com).
    expect(medidas.filter((m) => m.ratio < 3).map((m) => `${m.texto} ${m.ratio.toFixed(2)}:1`)).toEqual([]);
  });

  test('ABIERTO · el lector de pantalla anuncia «espejo» en el botón de la lente divergente', async ({
    page,
  }) => {
    test.fail(
      true,
      'ABIERTO, hallazgo (inspector 03/10/2026): el 🪞 no lleva aria-hidden (el 🔍 de su gemelo sí)',
    );
    const divergente = page.getByRole('button', { name: /Divergente \(bicóncava\)/ });
    await expect(divergente).toHaveAccessibleName(/^Divergente/, { timeout: 2000 });
  });
});

test.describe('simulador-lentes-opticas · re-inspección 03/10/2026 · móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('sin desbordamiento horizontal; el lienzo, los casos y la lente se usan con el dedo', async ({
    page,
  }) => {
    await page.goto('/simulador-lentes-opticas/');
    await esperarHidratacion(page, ['#casos-respuesta', SLIDER_F]);
    const anchos = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, vw: window.innerWidth }));
    expect(anchos.doc).toBeLessThanOrEqual(anchos.vw);
    const lienzo = await page.locator('canvas').boundingBox();
    expect(lienzo?.width ?? 0).toBeGreaterThan(240);

    // Divergente con f = 8 y s = 15 (los de fábrica): 1/s' = −1/8 − 1/15 = −23/120
    // → s' = −5,217 → «−5,22 cm»
    await page.getByRole('button', { name: /Divergente/ }).tap();
    await expect(valorDe(page, IMAGEN)).toHaveText('−5,22 cm');

    // Caso 11 a dedo: 5,25 exactos
    const seccion = page.locator('#casos-aula');
    await seccion.getByRole('button', { name: /^Caso 11:/ }).tap();
    await seccion.locator('#casos-respuesta').fill('5,25');
    await seccion.locator('#casos-comprobar').tap();
    await expect(seccion.locator('#casos-veredicto')).toContainText('¡Correcto!');
    const comprobar = await seccion.locator('#casos-comprobar').boundingBox();
    expect(comprobar?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});
