import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from './_hidratacion';

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
