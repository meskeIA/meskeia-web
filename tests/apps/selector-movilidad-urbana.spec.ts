import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, COSTE_MENSUAL_MINIMO, PREGUNTAS, type TipoTransporte } from '../../app/selector-movilidad-urbana/motor';

/**
 * Selector de Movilidad Urbana (selector-movilidad-urbana) — reparado el 24/09/2026 desde una
 * sospecha del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra, en cambio, estaba BIEN: anuncia porcentaje (0-100) con valuenow = el mismo
 *     porcentaje que pinta. No se ha tocado; el caso de abajo lo fija para que siga así.
 *   · Empates: `reduce` que partía de «combinación» y solo cambiaba con `>` estricto → a
 *     igualdad ganaba la combinación multimodal y, sin ella, el coche. Enumerado: 8.673 de
 *     78.732 perfiles empatan en cabeza, y en 5.033 cambia el ganador.
 *   · Razones fijas: la descripción del transporte público decía «Vives en una ciudad bien
 *     comunicada, tus horarios son regulares…» también a quien había marcado red «Deficiente o
 *     inexistente» u horarios nocturnos (12.911 perfiles).
 *
 * EL MOTOR (app/selector-movilidad-urbana/motor.ts): las mismas preguntas y pesos (sin empate,
 * el ganador no cambia en ninguna combinación). A igualdad, primero la movilidad física
 * (pregunta 10), luego la distancia (1) y por último el menor coste mensual; el empate se
 * anuncia. Las descripciones hablan del medio y las razones citan las respuestas.
 */

async function abrirTest(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-movilidad-urbana/');
  // Sin <input> no hay rastreador que sondear (`_hidratacion.ts`); el testigo es que React
  // haya colgado sus props del primer radio. Mismo criterio que selector-smartphone.
  await page.waitForFunction(
    () => {
      const boton = document.querySelector('[role="radiogroup"] button');
      return Boolean(boton && Object.keys(boton).some((k) => k.startsWith('__reactProps$')));
    },
    null,
    { timeout: 20_000 },
  );
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver mi resultado' : 'Siguiente pregunta' }).click();
  }
  await page.locator('[class*="resultadoTitulo"]').waitFor();
  return (await page.locator('[class*="resultadoCard"]').innerText()).replace(/\s+/g, ' ');
}

// Menos de 5 km · Red muy completa · Bultos habitualmente · Horarios irregulares con frecuencia
// · Coste importante pero asumible · Aparcamiento gratuito · Seguridad: poco · Clima moderado ·
// Sostenibilidad fundamental · En buena forma física.
// (coche, transporte público, moto, bici, combinación), pregunta a pregunta:
//   P1 bici 3, TP 2, comb 1 · P2 TP 4, comb 2 · P3 coche 4 · P4 coche 3, moto 2 ·
//   P5 TP 2, moto 2, bici 1, comb 2 · P6 coche 3, moto 1 · P7 moto 2, bici 2, comb 2 ·
//   P8 comb 3, TP 1, moto 1 · P9 bici 4, TP 3, comb 1 · P10 bici 3, moto 2, comb 2, TP 1
//   = coche 10 · TP 13 · moto 10 · bici 13 · combinación 13.
// Triple empate a 13; la movilidad física da bici 3 > combinación 2 > TP 1.
// Antes: combinación multimodal, por ser el valor inicial del reduce.
const EMPATE = [0, 0, 0, 0, 1, 0, 2, 1, 0, 2] as const;

// Menos de 5 km · Red DEFICIENTE · Bultos habitualmente · Horarios irregulares con frecuencia ·
// Coste crítico · Aparcamiento con coste notable · Seguridad: mucho · Clima moderado ·
// Sostenibilidad fundamental · Buena forma.
//   coche 3+4+3+1+2 = 13 · TP 2+4+3+1+3+1 = 14 · bici 3+3+4+3 = 13. Gana el transporte
//   público, y antes se le decía «Vives en una ciudad bien comunicada, tus horarios son
//   regulares» a quien había respondido lo contrario de las dos cosas.
const TP_SIN_RED = [0, 2, 0, 0, 0, 1, 0, 1, 0, 2] as const;

test('el grupo de opciones tiene radios de verdad, y aria-checked sigue al clic', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);
  await grupo.locator('[role="radio"]').nth(2).click();
  await expect(grupo.locator('[role="radio"]').nth(2)).toHaveAttribute('aria-checked', 'true');
  await grupo.locator('[role="radio"]').nth(0).click();
  await expect(grupo.locator('[role="radio"]').nth(0)).toHaveAttribute('aria-checked', 'true');
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);
});

test('la barra de progreso anuncia lo mismo que pinta (ya lo hacía; que no se estropee)', async ({ page }) => {
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  for (let paso = 0; paso < 3; paso++) {
    const [ahora, min, max] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
    );
    const anunciado = (ahora - min) / (max - min);
    expect(anunciado, `pregunta ${paso + 1}`).toBeCloseTo((paso + 1) / 10, 6);
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

test('un empate se anuncia y lo deshace la movilidad física, no el valor inicial del reduce', async ({ page }) => {
  await abrirTest(page);
  await responder(page, EMPATE);
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Bicicleta o Patinete Eléctrico');
  await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
    'la bici o el patinete eléctrico, la combinación multimodal y el transporte público encajan exactamente igual; se muestra primero la bici o el patinete eléctrico porque responde mejor a lo que has indicado sobre tu movilidad física',
  );
});

test('las razones salen de las respuestas: con red deficiente no se lee «ciudad bien comunicada»', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, TP_SIN_RED);
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Transporte Público');
  await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
  expect(texto).not.toContain('Vives en una ciudad bien comunicada');
  expect(texto).not.toContain('tus horarios son regulares');
  expect(texto).not.toContain('Red amplia y frecuente en tu zona');
  expect(texto).toContain('Coste mensual: has respondido «Crítica, quiero el mínimo gasto posible», que suma 4 puntos al transporte público.');
  expect(texto).toContain('Seguridad vial: has respondido «Mucho, es una prioridad para mí», que suma 3 puntos al transporte público.');
  expect(texto).toContain('Sostenibilidad: has respondido «Sí, es fundamental para mí», que suma 3 puntos al transporte público.');
});

test('motor: ningún empate queda en silencio, y el criterio que se anuncia es verdad', () => {
  const DESEMPATE = [
    { indice: 9, frase: 'responde mejor a lo que has indicado sobre tu movilidad física' },
    { indice: 0, frase: 'encaja mejor con la distancia de tu trayecto' },
  ];
  const r: number[] = [];
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  const peso = (i: number, k: TipoTransporte) => PREGUNTAS[i].opciones[r[i]].pesos[k] ?? 0;
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
      const res = calcularResultado(r);
      const max = Math.max(...CLAVES.map((k) => res.puntos[k]));
      if (res.puntos[res.tipo] !== max) mal('no tiene la puntuación máxima');
      const reales = CLAVES.filter((k) => k !== res.tipo && res.puntos[k] === max);
      if (reales.length !== res.empatados.length) mal('empatados mal contados');
      if (reales.length === 0 && res.criterioDesempate !== '') mal('criterio sin empate');
      if (reales.length > 0) empates++;
      for (const k of reales) {
        const decide = DESEMPATE.find(({ indice }) => peso(indice, res.tipo) !== peso(indice, k));
        if (decide) {
          if (peso(decide.indice, res.tipo) < peso(decide.indice, k)) mal(`pierde contra ${k}`);
          if (!res.criterioDesempate.includes(decide.frase)) mal('no nombra el criterio que decide');
        } else {
          if (COSTE_MENSUAL_MINIMO[res.tipo] > COSTE_MENSUAL_MINIMO[k]) mal(`más caro que ${k}`);
          if (!res.criterioDesempate.includes('coste mensual es el más bajo')) mal('no nombra el coste');
        }
      }
      for (const razon of res.razones) {
        const citada = razon.match(/«([^»]+)»/)?.[1];
        if (!PREGUNTAS.some((p, j) => p.opciones[r[j]].texto === citada)) mal(`cita «${citada}», no respondida`);
      }
      return;
    }
    for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
      r[i] = k;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(total).toBe(78_732);
  expect(empates).toBe(8_673);
});

// ═════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN 24/09/2026 (primera inspección de la app)
// ═════════════════════════════════════════════════════════════════════════════
//
// Los perfiles van como índices de opción (0 = la primera), pregunta a pregunta, y cada
// comentario da las respuestas literales y la suma a mano, en el orden coche · transporte
// público (TP) · moto · bici · combinación. Los recuentos salen de recorrer en Node las 78.732
// combinaciones con el motor real (app/selector-movilidad-urbana/motor.ts).
//
// Lo que ya cubren los tests de arriba y no se repite: radios con aria-checked, barra de
// progreso, anuncio de empates y razones sacadas de las respuestas.
//
// Cada hallazgo abierto es un test.fail(): pasa hoy y se pone rojo cuando se repare. Para las
// restricciones declaradas, el esperado es el de la referencia de la familia (selector-mascota,
// 934e57bc): filtrar, o avisar EN PANTALLA citando lo declarado. Por eso cada aserción admite
// cualquiera de las dos salidas; hoy la respuesta declarada no aparece en la tarjeta porque da
// 0 puntos al medio recomendado, y las razones solo citan lo que suma.
test.describe('Inspección 24/09/2026 — restricciones declaradas, datos de la guía y contraste', () => {
  type Perfil = readonly number[];

  async function resultadoDe(page: Page, perfil: Perfil): Promise<{ titulo: string; texto: string }> {
    await abrirTest(page);
    const texto = await responder(page, perfil);
    const titulo = (await page.locator('[class*="resultadoTitulo"]').innerText()).trim();
    return { titulo, texto };
  }

  async function textoGuia(page: Page): Promise<string> {
    await page.getByRole('button', { name: 'Ver guía educativa' }).first().click();
    return (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  }

  async function activarOscuro(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  }

  /**
   * Contraste MÍNIMO del texto de un elemento: en cada esquina de cada línea del texto (un Range,
   * no la caja del bloque), con la opacidad acumulada del elemento y sus ancestros, sobre las capas
   * de fondo compuestas hasta la primera opaca. Un degradado lineal se evalúa en ese mismo punto.
   */
  async function contrasteMin(page: Page, selector: string): Promise<number> {
    return page.locator(selector).first().evaluate((el) => {
      type RGBA = { r: number; g: number; b: number; a: number };
      const parse = (s: string): RGBA => {
        const p = (s.match(/rgba?\(([^)]+)\)/)?.[1] ?? '0,0,0,0').split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
      };
      const lum = (c: RGBA) => {
        const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
      };
      const ratio = (x: RGBA, y: RGBA) => { const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };
      const sobre = (arriba: RGBA, abajo: RGBA): RGBA => ({
        r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
        g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
        b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
        a: 1,
      });
      const degradadoEn = (n: Element, x: number, y: number): RGBA => {
        const img = getComputedStyle(n).backgroundImage;
        const paradas = [...img.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0]));
        const ang = (Number(img.match(/(-?[\d.]+)deg/)?.[1] ?? 180) * Math.PI) / 180;
        const c = n.getBoundingClientRect();
        const L = Math.abs(c.width * Math.sin(ang)) + Math.abs(c.height * Math.cos(ang));
        const u = Math.min(1, Math.max(0, 0.5 + ((x - (c.left + c.width / 2)) * Math.sin(ang) - (y - (c.top + c.height / 2)) * Math.cos(ang)) / L));
        const [p0, p1] = [paradas[0], paradas[paradas.length - 1]];
        return { r: p0.r + (p1.r - p0.r) * u, g: p0.g + (p1.g - p0.g) * u, b: p0.b + (p1.b - p0.b) * u, a: 1 };
      };
      const fondoEn = (x: number, y: number): RGBA => {
        const capas: RGBA[] = [];
        for (let n: Element | null = el; n; n = n.parentElement) {
          if (getComputedStyle(n).backgroundImage.includes('gradient')) { capas.push(degradadoEn(n, x, y)); break; }
          const c = parse(getComputedStyle(n).backgroundColor);
          if (c.a > 0) { capas.push(c); if (c.a >= 1) break; }
        }
        let f: RGBA = { r: 255, g: 255, b: 255, a: 1 };
        for (let i = capas.length - 1; i >= 0; i--) f = sobre(capas[i], f);
        return f;
      };
      let op = 1;
      for (let n: Element | null = el; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
      const color = parse(getComputedStyle(el).color);
      const rango = document.createRange();
      rango.selectNodeContents(el);
      let min = Infinity;
      for (const t of [...rango.getClientRects()].filter((q) => q.width > 0)) {
        for (const [x, y] of [[t.left + 1, t.top + 1], [t.right - 1, t.bottom - 1], [t.left + 1, t.bottom - 1], [t.right - 1, t.top + 1]]) {
          const bg = fondoEn(x, y);
          min = Math.min(min, ratio(sobre({ ...color, a: color.a * op }, bg), bg));
        }
      }
      return min;
    });
  }

  // ── CASO NORMAL ──
  // Menos de 5 km · Sí, muy completa y frecuente · Casi nunca, solo lo básico · No, horario fijo de
  // lunes a viernes · Importante, pero puedo asumir costes razonables · No, es complicado o caro
  // aparcar · Me preocupa, pero tengo experiencia · Moderado, con algunas semanas complicadas ·
  // Me importa, pero no es el factor decisivo · No, estoy en buena forma física.
  //   coche 1 (P7) · TP 2+4+2+3+2+3+1+1+2+1 = 21 · moto 2+2+2+1+1+2 = 10 · bici 3+2+2+1+2+1+3 = 14 ·
  //   combinación 1+2+1+2+2+2+2+3+2+2 = 19. Sin empate. Razones: P2 (4), P4 (3), P6 (3).
  const NORMAL = [0, 0, 2, 2, 1, 2, 1, 1, 1, 2] as const;

  test('caso normal: transporte público 21 frente a 19, con las tres respuestas que más suman', async ({ page }) => {
    const { titulo, texto } = await resultadoDe(page, NORMAL);
    expect(titulo).toBe('Transporte Público');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    await expect(page.locator('[class*="razones"] li')).toHaveText([
      'Red de transporte público: has respondido «Sí, muy completa y frecuente», que suma 4 puntos al transporte público.',
      'Horarios: has respondido «No, horario fijo de lunes a viernes», que suma 3 puntos al transporte público.',
      'Aparcamiento en destino: has respondido «No, es complicado o caro aparcar», que suma 3 puntos al transporte público.',
    ]);
    expect(texto).toContain('Coste estimado: 20–80 €/mes');
  });

  test('caso límite: sin respuesta no se avanza, volver atrás conserva y «Repetir» deja la pregunta 1 sin marcar', async ({ page }) => {
    await abrirTest(page);
    const siguiente = page.getByRole('button', { name: 'Siguiente pregunta' });
    const anterior = page.getByRole('button', { name: 'Pregunta anterior' });
    await expect(siguiente).toBeDisabled();
    await expect(anterior).toBeDisabled();
    await page.locator('[role="radio"]').nth(2).click();
    await expect(siguiente).toBeEnabled();
    await siguiente.click();
    await expect(page.locator('[class*="preguntaTexto"]')).toHaveText(/buena red de transporte público/);
    await expect(siguiente).toBeDisabled();
    await anterior.click();
    await expect(page.locator('[role="radio"]').nth(2)).toHaveAttribute('aria-checked', 'true');
    await siguiente.click();
    for (let i = 1; i < 10; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(0).click();
      await page.getByRole('button', { name: i === 9 ? 'Ver mi resultado' : 'Siguiente pregunta' }).click();
    }
    await page.locator('[class*="btnReiniciar"]').click();
    await expect(page.locator('[class*="preguntaTexto"]')).toHaveText('¿Cuál es tu distancia habitual al trabajo o estudios?');
    await expect(page.locator('[aria-checked="true"]')).toHaveCount(0);
  });

  // Qué hero es cuál (sospecha del degradado): esta app NO tiene hero propio de resultado, a
  // diferencia de sus hermanas. El único hero es el de la intro, tras el logo, y sigue en
  // pantalla en el resultado; la tarjeta del resultado tiene fondo liso. El degradado está en ESE
  // hero (hallazgo más abajo).
  test('el único hero es el de la intro, y sigue en pantalla en el resultado; la tarjeta es de fondo liso', async ({ page }) => {
    await resultadoDe(page, NORMAL);
    await expect(page.locator('header[class*="hero"]')).toHaveCount(1);
    await expect(page.locator('header[class*="hero"] h1')).toHaveText('Selector de Movilidad Urbana');
    const fondoTarjeta = await page.locator('[class*="resultadoCard"]').evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(fondoTarjeta).toBe('none');
  });

  // ── HALLAZGO 1: red «Deficiente o inexistente» → transporte público ──
  // 15-40 km · Deficiente o inexistente en mi zona · Casi nunca · Horario fijo · Coste crítico ·
  // Complicado o caro aparcar · Seguridad: mucho · Clima adverso · Sostenibilidad fundamental ·
  // Limitaciones importantes.
  //   TP 3+2+3+4+3+3+2+3+2 = 25 · coche 2+3+2+3+4 = 14 · bici 2+2+3+2+4 = 13 · moto 8 · comb 8.
  // Sin TP (no lo hay, o casi), queda el coche con 14. Barrido: con esa respuesta sale TP en 6.289
  // de 26.244 perfiles (24,0 %), 846 de ellos por empate, y nunca se menciona la red declarada.
  // El test de arriba «las razones salen de las respuestas…» fija como correcto TP para otro
  // perfil con red deficiente (TP_SIN_RED): si se repara filtrando, habrá que revisarlo.
  const RED_INEXISTENTE = [2, 2, 2, 2, 0, 2, 0, 0, 0, 0] as const;
  test('hallazgo: a quien dice que no hay red de transporte público no se le recomienda sin avisar', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la red «Deficiente o inexistente» solo quita puntos; TP sigue ganando sin aviso
    const { titulo, texto } = await resultadoDe(page, RED_INEXISTENTE);
    expect(titulo !== 'Transporte Público' || texto.includes('Deficiente o inexistente'), `${titulo} · ${texto.slice(0, 160)}`).toBe(true);
  });

  // ── HALLAZGO 2: «Sí, tengo limitaciones importantes» → bici o patinete ──
  // Menos de 5 km · Deficiente o inexistente · Casi nunca · Horario fijo · Coste crítico ·
  // Complicado o caro aparcar · Seguridad: poco · Clima muy bueno · Sostenibilidad fundamental ·
  // Sí, tengo limitaciones importantes.
  //   bici 3+2+2+3+2+2+3+4 = 21 · TP 2+2+3+4+3+3+2 = 19 · moto 10 · comb 10 · coche 7.
  // La tarjeta lista «Ejercicio físico integrado en tu rutina». Barrido: con limitaciones
  // importantes sale bici 216 veces y moto 330 (546 de 26.244); la movilidad física solo actúa
  // como PRIMER DESEMPATE, nunca como filtro.
  const LIMITACION_BICI = [0, 2, 2, 2, 0, 2, 2, 2, 0, 0] as const;
  test('hallazgo: con limitaciones de movilidad importantes no se recomienda bici, patinete ni moto sin avisar', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la limitación declarada es un peso, no un filtro
    const { titulo, texto } = await resultadoDe(page, LIMITACION_BICI);
    const vetado = ['Bicicleta o Patinete Eléctrico', 'Moto o Escúter'].includes(titulo);
    expect(!vetado || texto.includes('Sí, tengo limitaciones importantes'), `${titulo} · ${texto.slice(0, 160)}`).toBe(true);
  });

  // ── HALLAZGO 3: «Más de 40 km» → bici o patinete ──
  // Más de 40 km · Regular, con algunas líneas útiles · Casi nunca · Horario fijo · Coste crítico ·
  // Complicado o caro aparcar · Seguridad: poco · Clima muy bueno · Sostenibilidad fundamental ·
  // Buena forma.
  //   bici 2+2+3+2+2+3+4+3 = 21 · TP 2+2+3+4+3+3+1 = 18 · comb 1+3+1+2+2+2+1+1+2 = 15 · moto 11 · coche 4.
  // La ficha dice «Rinde en distancias cortas» y la guía «menos de 10 km»; el patinete, además,
  // tiene prohibidas las vías interurbanas (DGT). Barrido: bici con más de 40 km 510 veces, MÁS que
  // con 15-40 km (164), porque «Más de 40 km» solo suma al coche y a la combinación y hunde a los
  // rivales de la bici; moto con más de 40 km, 135 (su ficha: «Ideal para distancias de 5–30 km»).
  const CUARENTA_KM_BICI = [3, 1, 2, 2, 0, 2, 2, 2, 0, 2] as const;
  test('hallazgo: a más de 40 km por trayecto no se recomienda la bici o el patinete sin avisar', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la distancia declarada es un peso, no un filtro
    const { titulo, texto } = await resultadoDe(page, CUARENTA_KM_BICI);
    expect(titulo !== 'Bicicleta o Patinete Eléctrico' || /más de 40 km/i.test(texto), `${titulo} · ${texto.slice(0, 160)}`).toBe(true);
  });

  // ── HALLAZGO 4: bultos o sillas de bebé «Sí, habitualmente» → bici o patinete ──
  // Menos de 5 km · Deficiente o inexistente · Sí, habitualmente · Horario fijo · Coste crítico ·
  // Complicado o caro aparcar · Seguridad: poco · Clima muy bueno · Sostenibilidad fundamental ·
  // Buena forma.
  //   bici 3+2+3+2+2+3+4+3 = 22 · TP 2+3+4+3+3+1 = 16 · comb 11 · moto 10 · coche 7.
  // Barrido: con «Sí, habitualmente» sale bici 1.015 veces y moto 463 (1.478 de 26.244).
  const BULTOS_BICI = [0, 2, 0, 2, 0, 2, 2, 2, 0, 2] as const;
  test('hallazgo: a quien lleva bultos o sillas de bebé a diario no se le recomienda bici o moto sin avisar', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la carga declarada es un peso, no un filtro
    const { titulo, texto } = await resultadoDe(page, BULTOS_BICI);
    const vetado = ['Bicicleta o Patinete Eléctrico', 'Moto o Escúter'].includes(titulo);
    expect(!vetado || texto.includes('Sí, habitualmente'), `${titulo} · ${texto.slice(0, 160)}`).toBe(true);
  });

  // ── HALLAZGO 5: coste «Crítica, quiero el mínimo gasto posible» → coche (400–700 €/mes) ──
  // Menos de 5 km · Sí, muy completa y frecuente · Sí, habitualmente · Sí, con frecuencia ·
  // Crítica, quiero el mínimo gasto posible · Sí, gratuito o muy asequible · Mucho, es una
  // prioridad · Sí, llueve mucho… · Poco relevante · Leve, prefiero comodidad.
  //   coche 4+3+3+2+3+2+2 = 19 · TP 2+4+4+3+2+2 = 17 · bici 6 · moto 4 · comb 4.
  // Barrido: con «Crítica» sale coche en 5.768 de 26.244 perfiles (22,0 %), sin mención del coste
  // declarado junto a «Coste estimado: 400–700 €/mes».
  const COSTE_CRITICO_COCHE = [0, 0, 0, 0, 0, 0, 0, 0, 2, 1] as const;
  test('hallazgo: el resultado dice que choca con «el mínimo gasto posible» cuando recomienda el coche', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la prioridad de coste es un peso y el desfase no se dice
    const { titulo, texto } = await resultadoDe(page, COSTE_CRITICO_COCHE);
    expect(titulo !== 'Coche Propio' || texto.includes('Crítica, quiero el mínimo gasto posible'), `${titulo} · ${texto.slice(0, 160)}`).toBe(true);
  });

  // ── HALLAZGO 6: seguridad vial «Mucho, es una prioridad para mí» → moto ──
  // Entre 5 y 15 km · Deficiente o inexistente · Casi nunca · Sí, con frecuencia (nocturno) ·
  // Importante, pero puedo asumir · Sí, pero tiene coste notable · Mucho, es una prioridad para mí ·
  // Muy bueno · Poco relevante · Buena forma.
  //   moto 3+2+2+2+2+2+2+1+2 = 18 · coche 3+3+1+2+2 = 11 · TP 10 · bici 11 · comb 10.
  // La FAQ de la propia app admite que la moto tiene «un nivel de seguridad inferior al coche»;
  // la tarjeta no lo dice. Barrido: 397 de 26.244 perfiles con esa respuesta reciben la moto.
  const SEGURIDAD_MOTO = [1, 2, 2, 0, 1, 1, 0, 2, 2, 2] as const;
  test('hallazgo: a quien prioriza la seguridad vial no se le recomienda la moto sin mencionarlo', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la prioridad de seguridad es un peso y la tarjeta no la cita
    const { titulo, texto } = await resultadoDe(page, SEGURIDAD_MOTO);
    expect(titulo !== 'Moto o Escúter' || texto.includes('Mucho, es una prioridad para mí'), `${titulo} · ${texto.slice(0, 160)}`).toBe(true);
  });

  // ── HALLAZGO 7: ficha fija de la bici «con buen clima» a quien declara clima adverso ──
  // Menos de 5 km · Deficiente o inexistente · Sí, habitualmente · Ocasionalmente · Coste crítico ·
  // Sí, pero tiene coste notable · Seguridad: poco · Sí, llueve mucho o hace mucho frío/calor ·
  // Sostenibilidad fundamental · Buena forma.
  //   bici 3+3+2+4+3 = 15 · coche 3+4+1+1+3 = 12 · TP 2+4+2+3+1 = 12 · comb 10 · moto 9.
  // Barrido: bici con clima adverso, 270 perfiles; con 15 km o más o clima adverso, 920 de las
  // 3.301 victorias de la bici leen «Rinde en distancias cortas, con buen clima».
  const CLIMA_ADVERSO_BICI = [0, 2, 0, 1, 0, 1, 2, 0, 0, 2] as const;
  test('hallazgo: la ficha de la bici no afirma «con buen clima» a quien acaba de decir que es adverso', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: descripción fija de la ficha
    const { titulo, texto } = await resultadoDe(page, CLIMA_ADVERSO_BICI);
    expect(titulo).toBe('Bicicleta o Patinete Eléctrico');
    expect(!texto.includes('con buen clima') || texto.includes('Sí, llueve mucho'), texto.slice(0, 200)).toBe(true);
  });

  // ── HALLAZGO 8: la guía y los pesos dicen lo contrario sobre las distancias largas ──
  // Todo en la primera opción: Más de 40 km · muy completa · bultos habitual · nocturno · crítica ·
  // gratuito · seguridad mucho · clima adverso · sostenibilidad fundamental · limitaciones.
  //   coche 4+4+3+3+2+3+4 = 23 · TP 4+4+3+2+3+2 = 18. Razones: P1, P3 y P10, 4 puntos cada una.
  // La tarjeta: «Más de 40 km» suma 4 al coche (y 0 al TP). La guía: «Por encima de 30 km, el
  // transporte público interurbano suele ser la mejor opción precio-tiempo».
  test('hallazgo: la guía no contradice lo que la distancia suma en el resultado', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: P1 «Más de 40 km» da coche 4 y TP 0, y la guía dice lo contrario
    const { texto } = await resultadoDe(page, [3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const guia = await textoGuia(page);
    const sumaCoche = texto.includes('«Más de 40 km», que suma 4 puntos al coche propio');
    const guiaTP = guia.includes('Por encima de 30 km, el transporte público interurbano suele ser la mejor opción');
    expect(sumaCoche && guiaTP, 'la tarjeta suma al coche lo que la guía atribuye al TP').toBe(false);
  });

  // ── HALLAZGO 9: costes distintos para lo mismo, en la misma tarjeta y en la guía ──
  // Tarjeta de TP: «El más económico: desde 20–60 €/mes con abono» y, debajo, «Coste estimado:
  // 20–80 €/mes». Guía: «entre 20 y 55 €». FAQPage: «400-700 € al año» (33–58 €/mes). Además,
  // «El más económico» choca con la bici (5–30 €/mes, «la de menor coste»). Bici: tarjeta
  // 5–30 €/mes (60–360 €/año) y guía «menos de 150 €/año».
  test('hallazgo: la tarjeta del transporte público da un solo rango de coste', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: 20–60 €/mes y 20–80 €/mes en la misma tarjeta
    const { titulo, texto } = await resultadoDe(page, NORMAL);
    expect(titulo).toBe('Transporte Público');
    const rangos = new Set([...texto.matchAll(/(\d+)–(\d+) €\/mes/g)].map((m) => m[0]));
    expect([...rangos]).toHaveLength(1);
  });

  // ── HALLAZGOS 10-14: datos de la guía desmentidos por su fuente ──
  test('hallazgo: la guía no presenta el MOVES III como vigente (terminó el 31/12/2025)', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: RACE e IDAE: el MOVES III cerró el 31/12/2025; en 2026 rige el Programa Auto+ (Plan España Auto 2030)
    await abrirTest(page);
    expect(await textoGuia(page)).not.toContain('El Plan MOVES III ofrece ayudas de hasta 7.000 €');
  });

  test('hallazgo: el abono de transporte no es una «deducción» del IRPF «desde 2023»', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: es una EXENCIÓN de retribución en especie que paga la empresa (art. 42.3.e LIRPF, art. 46 bis RIRPF), y no es de 2023
    await abrirTest(page);
    expect(await textoGuia(page)).not.toContain('deducciones en el IRPF para trabajadores (hasta 1.500 € anuales desde 2023)');
  });

  test('hallazgo: las motos eléctricas no tienen IVA reducido', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: tributan al 21 %; el tipo reducido de vehículos es solo el de movilidad reducida (art. 91.Dos.1.4.º LIVA)
    await abrirTest(page);
    expect(await textoGuia(page)).not.toContain('IVA reducido');
  });

  test('hallazgo: las ZBE no restringen el acceso en todas las ciudades de más de 50.000 habitantes desde 2023', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: la Ley 7/2021 (art. 14.3) obliga a adoptarlas; a 23/09/2026 funcionan en 68 de las 149 obligadas
    await abrirTest(page);
    expect(await textoGuia(page)).not.toContain('restringen el acceso de vehículos contaminantes en ciudades de más de 50.000 habitantes desde 2023');
  });

  test('hallazgo: el peso del transporte en el gasto de los hogares no es el 13–22 %', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: INE, EPF 2025 (25/06/2026): el transporte supuso el 11,5 % del presupuesto del hogar
    await abrirTest(page);
    expect(await textoGuia(page)).not.toMatch(/13–22\s%\sdel gasto mensual/);
  });

  test('hallazgo: la guía no afirma sin fuente que el 60 % de los municipios tiene bicicarriles', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: cifra sin fuente (§1.quinquies, regla 1); 6 de cada 10 municipios tienen menos de 1.000 habitantes (INE 2025)
    await abrirTest(page);
    expect(await textoGuia(page)).not.toContain('El 60 % de los municipios españoles tiene red de bici-carriles');
  });

  // ── HALLAZGO 15: sin aviso de ámbito geográfico (§1.bis) ──
  // Costes «en ciudad española», «grandes ciudades españolas», guía «Movilidad urbana en España»,
  // DGT, ZBE, MOVES III e IRPF. Mismo caso que el 1340 de selector-mascota.
  test('hallazgo: los datos de España declaran su ámbito con RegionBadge', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: no monta <RegionBadge variant="es-data" />
    await abrirTest(page);
    expect(await page.locator('[role="note"][aria-label*="España"]').count()).toBeGreaterThan(0);
  });

  // ── HALLAZGO 16: WebApplication sin características (§1.ter: 4-8 reales) ──
  test('hallazgo: el JSON-LD WebApplication lista las características de la app', async ({ request }) => {
    test.fail(); // HALLAZGO abierto: metadata.ts pasa `features: []` y se sirve "featureList":[]
    const html = await (await request.get('/selector-movilidad-urbana/')).text();
    const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Record<string, unknown>);
    const app = bloques.find((b) => b['@type'] === 'WebApplication');
    expect(app, 'hay un WebApplication').toBeTruthy();
    expect((app?.featureList as unknown[] | undefined)?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  // ── HALLAZGO 17: el hero de la INTRO es un degradado fijo, no var(--hero-bg) ──
  // .hero { background: linear-gradient(135deg, #2e86ab, #48a9a6) } escrito en hexadecimal, así que
  // es IGUAL en los dos temas. Subtítulo 1,1rem al 90 %: exige 4,5:1; medido hoy 2,82 en escritorio
  // y 2,70 a 390 px, en claro y en oscuro. El <h1> (texto grande, 3:1) pasa por poco: 3,16 / 3,03.
  test('hallazgo: el hero usa --hero-bg y su subtítulo llega a 4,5:1 en los dos temas', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: degradado #2e86ab→#48a9a6 en vez de var(--hero-bg)
    await abrirTest(page);
    expect(await contrasteMin(page, 'header[class*="hero"] p'), 'subtítulo, claro').toBeGreaterThanOrEqual(4.5);
    await activarOscuro(page);
    expect(await contrasteMin(page, 'header[class*="hero"] p'), 'subtítulo, oscuro').toBeGreaterThanOrEqual(4.5);
    const fondo = await page.locator('header[class*="hero"]').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(fondo).toBe('rgb(26, 82, 120)');
  });

  // ── HALLAZGO 18: textos pequeños de marca por debajo de 4,5:1 ──
  // Medido hoy: etiqueta del resultado (#48a9a6, 0,875rem) 2,68 en claro (6,22 en oscuro, pasa);
  // «Repetir el test» (#2e86ab, 1rem seminegrita) 3,93 en claro y 4,24 en oscuro; «Siguiente →» y
  // «Ver mi resultado» (blanco sobre el degradado, 1rem seminegrita) 3,04 en los dos temas.
  test('hallazgo: la etiqueta del resultado y los botones llegan a 4,5:1', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: #48a9a6 / #2e86ab como texto y blanco sobre el degradado de marca
    await abrirTest(page);
    await page.locator('[role="radio"]').first().click();
    const siguiente = page.locator('[class*="btnPrimary"]');
    await expect.poll(() => siguiente.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    const boton = await contrasteMin(page, '[class*="btnPrimary"]');
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    for (let i = 1; i < 10; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(NORMAL[i]).click();
      await page.getByRole('button', { name: i === 9 ? 'Ver mi resultado' : 'Siguiente pregunta' }).click();
    }
    await page.locator('[class*="resultadoTitulo"]').waitFor();
    expect(await contrasteMin(page, '[class*="resultadoEtiqueta"]'), 'resultadoEtiqueta, claro').toBeGreaterThanOrEqual(4.5);
    expect(await contrasteMin(page, '[class*="btnReiniciar"]'), 'btnReiniciar, claro').toBeGreaterThanOrEqual(4.5);
    expect(boton, 'btnPrimary').toBeGreaterThanOrEqual(4.5);
    await activarOscuro(page);
    expect(await contrasteMin(page, '[class*="btnReiniciar"]'), 'btnReiniciar, oscuro').toBeGreaterThanOrEqual(4.5);
  });

  // ── HALLAZGO 19: el nombre accesible de «Repetir el test» no contiene su texto visible ──
  // aria-label="Volver a hacer el test" sobre el texto «Repetir el test» (WCAG 2.5.3, nivel A):
  // quien maneja la voz dice lo que lee y el botón no responde.
  test('hallazgo: el botón «Repetir el test» se llama como se lee', async ({ page }) => {
    test.fail(); // HALLAZGO abierto: aria-label distinto del texto visible
    await resultadoDe(page, NORMAL);
    await expect(page.getByRole('button', { name: 'Repetir el test' })).toHaveCount(1, { timeout: 1000 });
  });
});
