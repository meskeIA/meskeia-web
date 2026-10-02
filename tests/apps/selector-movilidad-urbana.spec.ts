import { test, expect, devices, type Page } from '@playwright/test';
import { calcularResultado, CLAVES, COSTE_MENSUAL_MINIMO, PREGUNTAS, TRANSPORTES, rangoMensual, type TipoTransporte } from '../../app/selector-movilidad-urbana/motor';

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
 *
 * REPARACIÓN DE LOS HALLAZGOS 1488-1507 (24/09/2026): lo declarado como imposibilidad DESCARTA
 * (sin red de transporte público, limitaciones de movilidad importantes, más de 40 km en bici;
 * y la combinación cuando no quedan dos medios que combinar) y se dice si ha cambiado algo; las
 * preferencias siguen siendo pesos, pero cuando juegan en contra se citan. Los costes salen de
 * una sola tabla (COSTE_MENSUAL). Dos tests de este bloque cambian por eso y lo dicen en su
 * comentario: el de TP_SIN_RED y el recuento del barrido del motor.
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

// Menos de 5 km · NO HAY red (hasta el 02/10/2026, «Deficiente o inexistente»; hallazgo 2700) ·
// Bultos habitualmente · Horarios irregulares con frecuencia ·
// Coste crítico · Aparcamiento con coste notable · Seguridad: mucho · Clima moderado ·
// Sostenibilidad fundamental · Buena forma.
//   coche 3+4+3+1+2 = 13 · TP 2+4+3+1+3+1 = 14 · bici 3+3+4+3 = 13 · moto 2+2+2+1+2 = 9 ·
//   combinación 1+2+3+1+2 = 9. Antes ganaba el transporte público y se le decía «Vives en una
//   ciudad bien comunicada, tus horarios son regulares» a quien había respondido lo contrario
//   de las dos cosas. La reparación de 99acf1e0 quitó la frase, pero este test seguía dando por
//   BUENO recomendar el transporte público con la red «Deficiente o inexistente» (hallazgo 1488).
//   Ahora el transporte público se descarta y se dice: quedan bici 13 = coche 13, y el empate lo
//   deshace la movilidad física (bici 3, coche 0) → Bicicleta o Patinete Eléctrico.
const TP_SIN_RED = [0, 3, 0, 0, 0, 1, 0, 1, 0, 2] as const;

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

test('las razones salen de las respuestas, y sin red de transporte público se descarta y se dice', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, TP_SIN_RED);
  await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Bicicleta o Patinete Eléctrico');
  expect(texto).not.toContain('Vives en una ciudad bien comunicada');
  expect(texto).not.toContain('tus horarios son regulares');
  expect(texto).not.toContain('Red amplia y frecuente en tu zona');
  await expect(page.locator('[class*="avisoDescarte"]')).toContainText(
    'el transporte público (14 puntos), porque sobre la red de transporte público has respondido «No hay transporte público en mi zona»',
  );
  await expect(page.locator('[class*="avisoEmpate"]')).toContainText('la bici o el patinete eléctrico y el coche propio encajan exactamente igual');
  // Las tres que más suman a la bici: P9 (4), P1 (3) y P5 (3; empata con P10 y va antes por número)
  await expect(page.locator('[class*="razones"] li')).toHaveText([
    'Sostenibilidad: has respondido «Sí, es fundamental para mí», que suma 4 puntos a la bici o el patinete eléctrico.',
    'Distancia: has respondido «Menos de 5 km», que suma 3 puntos a la bici o el patinete eléctrico.',
    'Coste mensual: has respondido «Crítica, quiero el mínimo gasto posible», que suma 3 puntos a la bici o el patinete eléctrico.',
  ]);
});

// Reescrito el 24/09/2026 al reparar 1488-1490: antes el recomendado debía tener la puntuación
// MÁXIMA de los cinco; ahora la máxima de los ADMITIDOS (los descartados pueden sumar más, y
// entonces se avisa). El recuento de empates pasa de 8.673 a 7.483 porque ya no cuentan los
// empates con un medio descartado. Y el criterio de coste solo se anuncia en superlativo
// («el más bajo») cuando es verdad frente a todos los empatados: con el motor anterior era
// falso en 26 perfiles (mismo defecto que selector-mascota, hallazgo 1442).
test('motor: ningún empate queda en silencio, y el criterio que se anuncia es verdad', () => {
  const DESEMPATE = [
    { indice: 9, frase: 'responde mejor a lo que has indicado sobre tu movilidad física', frente: 'a lo que has indicado sobre tu movilidad física' },
    { indice: 0, frase: 'encaja mejor con la distancia de tu trayecto', frente: 'con la distancia de tu trayecto' },
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
      const admitidos = CLAVES.filter((k) => !res.descartes[k]);
      if (res.descartes[res.tipo]) mal('recomienda un medio descartado');
      const max = Math.max(...admitidos.map((k) => res.puntos[k]));
      if (res.puntos[res.tipo] !== max) mal('no tiene la puntuación máxima de los admitidos');
      const reales = admitidos.filter((k) => k !== res.tipo && res.puntos[k] === max);
      if (reales.length !== res.empatados.length) mal('empatados mal contados');
      if (reales.length === 0 && res.criterioDesempate !== '') mal('criterio sin empate');
      if (reales.length > 0) empates++;
      const decisivo = (k: TipoTransporte) => DESEMPATE.find(({ indice }) => peso(indice, res.tipo) !== peso(indice, k));
      const unSoloCriterio = new Set(reales.map((k) => decisivo(k)?.indice ?? 'coste')).size === 1;
      for (const k of reales) {
        const decide = decisivo(k);
        if (decide) {
          if (peso(decide.indice, res.tipo) < peso(decide.indice, k)) mal(`pierde contra ${k}`);
          if (unSoloCriterio ? !res.criterioDesempate.includes(decide.frase) : !res.criterioDesempate.includes(decide.frente)) mal('no nombra el criterio que decide');
        } else {
          if (COSTE_MENSUAL_MINIMO[res.tipo] > COSTE_MENSUAL_MINIMO[k]) mal(`más caro que ${k}`);
          if (unSoloCriterio ? !res.criterioDesempate.includes('coste mensual es el más bajo') : !res.criterioDesempate.includes('cuesta menos al mes que')) mal('no nombra el coste');
        }
      }
      // El superlativo, solo si es verdad frente a TODOS los empatados
      if (res.criterioDesempate.includes('el más bajo') && reales.some((k) => COSTE_MENSUAL_MINIMO[k] < COSTE_MENSUAL_MINIMO[res.tipo])) mal('superlativo falso');
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
  // 02/10/2026 (hallazgos 2699 y 2700): la pregunta 2 tiene ahora cuatro opciones («Deficiente»
  // y «No hay transporte público» por separado), así que el total pasa de 78.732 a 104.976
  // (78.732 × 4 / 3); los empates, de 7.483 a 10.122.
  expect(total).toBe(104_976);
  expect(empates).toBe(10_122);
});

// Uno de los 26 perfiles del superlativo falso, a mano:
// 15-40 km · red muy completa · bultos habitualmente · nocturno con frecuencia · coste secundario ·
// complicado aparcar · seguridad: poco · clima muy bueno · sostenibilidad: me importa · buena forma.
//   coche 2+4+3+3 = 12 · TP 3+4+3+2+1 = 13 · moto 2+2+1+2+2+2+2 = 13 · bici 2+2+3+1+3 = 11 ·
//   combinación 2+2+2+2+1+2+2 = 13. Empate a 13 entre TP, moto y combinación. Movilidad física
//   (P10): combinación 2 = moto 2 > TP 1, así que el TP queda detrás por ese criterio; entre
//   combinación y moto decide el coste (80 € < 100 €). El TP (20 €) cuesta menos que la
//   combinación: decir «su coste mensual es el más bajo» era falso.
test('motor: con dos criterios de desempate, cada uno nombra a quien deja detrás', () => {
  const res = calcularResultado([2, 0, 0, 0, 2, 2, 2, 2, 1, 2]);
  expect(res.tipo).toBe('combinacion');
  expect(res.empatados).toEqual(['moto_escuter', 'transporte_publico']);
  expect(res.criterioDesempate).toBe(
    'se muestra primero la combinación multimodal porque responde mejor que el transporte público a lo que has indicado sobre tu movilidad física y cuesta menos al mes que la moto o el escúter',
  );
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
// REPARADOS el 24/09/2026 (hallazgos 1488-1507): los test.fail() se han retirado y cada test
// fija ahora la salida reparada, con el esperado recalculado a mano para su perfil. Para las
// restricciones declaradas, lo que la propia ficha describe como imposibilidad DESCARTA (sin
// red, limitaciones importantes, más de 40 km en bici) y el aviso lo dice; lo que es una
// preferencia (bultos, coste crítico, seguridad, clima) sigue siendo un peso y se cita en «Lo
// que juega en contra». Cada test de restricción cierra con el barrido del motor: 0 perfiles
// que la violen de las 78.732.
test.describe('Inspección 24/09/2026 — restricciones declaradas, datos de la guía y contraste', () => {
  /** Recorre todas las combinaciones (104.976 desde el 02/10/2026) y devuelve cuántas cumplen `cond`. */
  function contar(cond: (r: readonly number[], res: ReturnType<typeof calcularResultado>) => boolean): number {
    const r: number[] = [];
    let n = 0;
    const rec = (i: number): void => {
      if (i === PREGUNTAS.length) {
        if (cond(r, calcularResultado(r))) n++;
        return;
      }
      for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) {
        r[i] = k;
        rec(i + 1);
      }
    };
    rec(0);
    return n;
  }

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

  /**
   * Espera a que no quede ninguna transición CSS en marcha. Aun con movimiento reducido
   * (0,01 ms), justo después del cambio de tema `getComputedStyle` devuelve el fondo ANTERIOR de
   * la tarjeta hasta el siguiente fotograma: medido así, la etiqueta en oscuro salía contra un
   * fondo blanco (2,23:1) que en pantalla no existe. Mismo ayudante que selector-mascota.
   */
  async function esperarSinTransiciones(page: Page): Promise<void> {
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
  }

  async function activarOscuro(page: Page): Promise<void> {
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await esperarSinTransiciones(page);
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
  // 15-40 km · No hay transporte público en mi zona (antes «Deficiente o inexistente») · Casi nunca · Horario fijo · Coste crítico ·
  // Complicado o caro aparcar · Seguridad: mucho · Clima adverso · Sostenibilidad fundamental ·
  // Limitaciones importantes.
  //   TP 3+2+3+4+3+3+2+3+2 = 25 · coche 2+3+2+3+4 = 14 · bici 2+2+3+2+4 = 13 · moto 8 · comb 8.
  // Antes: TP en 6.289 de 26.244 perfiles con esa respuesta, sin mencionar la red declarada.
  // REPARADO (1488): el TP se descarta. Con «Sí, tengo limitaciones importantes» también caen
  // la bici y la moto (8, 13), y sin TP ni bici ni moto no queda nada que combinar: gana el coche
  // con 14, y el aviso nombra al TP (25), el único descartado que le superaba.
  const RED_INEXISTENTE = [2, 3, 2, 2, 0, 2, 0, 0, 0, 0] as const;
  test('1488: a quien dice que no hay red de transporte público no se le recomienda, y se le dice', async ({ page }) => {
    const { titulo } = await resultadoDe(page, RED_INEXISTENTE);
    expect(titulo).toBe('Coche Propio');
    await expect(page.locator('[class*="avisoDescarte"]')).toContainText(
      'Se ha descartado una opción que sumaba tantos puntos o más que el coche propio (14 puntos): el transporte público (25 puntos), porque sobre la red de transporte público has respondido «No hay transporte público en mi zona».',
    );
    expect(contar((r, res) => r[1] === 3 && res.tipo === 'transporte_publico')).toBe(0);
    // Y la red DEFICIENTE (que existe) ya no descarta el transporte público (hallazgo 2700).
    expect(contar((r, res) => r[1] === 2 && Boolean(res.descartes.transporte_publico))).toBe(0);
  });

  // ── HALLAZGO 2: «Sí, tengo limitaciones importantes» → bici o patinete ──
  // Menos de 5 km · No hay transporte público · Casi nunca · Horario fijo · Coste crítico ·
  // Complicado o caro aparcar · Seguridad: poco · Clima muy bueno · Sostenibilidad fundamental ·
  // Sí, tengo limitaciones importantes.
  //   bici 3+2+2+3+2+2+3+4 = 21 · TP 2+2+3+4+3+3+2 = 19 · moto 10 · comb 10 · coche 7.
  // Antes: bici 216 veces y moto 330 con limitaciones importantes, con «Ejercicio físico
  // integrado en tu rutina». REPARADO (1489): la limitación descarta bici y moto (es un riesgo
  // de seguridad, no una preferencia). Aquí además no hay red: fuera el TP (19), y sin
  // TP, bici ni moto no hay combinación (10; desde el 2699, el motivo dice en qué se apoya una
  // combinación, el transporte público o la bici, y que los dos están fuera). Queda el coche con 7, y el aviso nombra a los
  // cuatro descartados que le superaban, por puntos (combinación y moto empatan a 10; la
  // distancia, P1, da 1 a la combinación y 0 a la moto).
  const LIMITACION_BICI = [0, 3, 2, 2, 0, 2, 2, 2, 0, 0] as const;
  test('1489: con limitaciones de movilidad importantes no se recomienda bici, patinete ni moto, y se dice', async ({ page }) => {
    const { titulo, texto } = await resultadoDe(page, LIMITACION_BICI);
    expect(titulo).toBe('Coche Propio');
    expect(texto).not.toContain('Ejercicio físico integrado en tu rutina');
    await expect(page.locator('[class*="avisoDescarte"]')).toContainText(
      'Se han descartado opciones que sumaban tantos puntos o más que el coche propio (7 puntos): la bici o el patinete eléctrico (21 puntos), porque has respondido «Sí, tengo limitaciones importantes» sobre tu movilidad física; el transporte público (19 puntos), porque sobre la red de transporte público has respondido «No hay transporte público en mi zona»; la combinación multimodal (10 puntos), porque se apoya en el transporte público o en la bici o el patinete, y tus respuestas descartan los dos; la moto o el escúter (10 puntos), porque has respondido «Sí, tengo limitaciones importantes» sobre tu movilidad física.',
    );
    expect(contar((r, res) => r[9] === 0 && (res.tipo === 'bici_patinete' || res.tipo === 'moto_escuter'))).toBe(0);
  });

  // ── HALLAZGO 3: «Más de 40 km» → bici o patinete ──
  // Más de 40 km · Regular, con algunas líneas útiles · Casi nunca · Horario fijo · Coste crítico ·
  // Complicado o caro aparcar · Seguridad: poco · Clima muy bueno · Sostenibilidad fundamental ·
  // Buena forma.
  //   bici 2+2+3+2+2+3+4+3 = 21 · TP 2+2+3+4+3+3+1 = 18 · comb 1+3+1+2+2+2+1+1+2 = 15 · moto 11 · coche 4.
  // Antes: bici con más de 40 km 510 veces, MÁS que con 15-40 km (164). REPARADO (1490): con más
  // de 40 km la bici se descarta (su ficha: «rinde en trayectos cortos») → transporte público 18,
  // como a mano, y el aviso cita «Más de 40 km». La moto a más de 40 km y la bici a 15-40 km NO
  // se descartan (son trayectos posibles, con un coste), pero se citan en «Lo que juega en contra».
  const CUARENTA_KM_BICI = [3, 1, 2, 2, 0, 2, 2, 2, 0, 2] as const;
  test('1490: a más de 40 km por trayecto no se recomienda la bici o el patinete, y se dice', async ({ page }) => {
    const { titulo } = await resultadoDe(page, CUARENTA_KM_BICI);
    expect(titulo).toBe('Transporte Público');
    await expect(page.locator('[class*="avisoDescarte"]')).toContainText(
      'la bici o el patinete eléctrico (21 puntos), porque tu trayecto es de «Más de 40 km» y la bici o el patinete rinden en trayectos cortos.',
    );
    expect(contar((r, res) => r[0] === 3 && res.tipo === 'bici_patinete')).toBe(0);
    // 15-40 km en bici, y más de 40 km en moto: nunca en silencio
    expect(contar((r, res) => r[0] === 2 && res.tipo === 'bici_patinete' && !res.enContra.some((t) => t.includes('«Entre 15 y 40 km»')))).toBe(0);
    expect(contar((r, res) => r[0] === 3 && res.tipo === 'moto_escuter' && !res.enContra.some((t) => t.includes('«Más de 40 km»')))).toBe(0);
  });

  // ── HALLAZGO 4: bultos o sillas de bebé «Sí, habitualmente» → bici o patinete ──
  // Menos de 5 km · No hay transporte público · Sí, habitualmente · Horario fijo · Coste crítico ·
  // Complicado o caro aparcar · Seguridad: poco · Clima muy bueno · Sostenibilidad fundamental ·
  // Buena forma.
  //   bici 3+2+3+2+2+3+4+3 = 22 · TP 2+3+4+3+3+1 = 16 · comb 11 · moto 10 · coche 7.
  // Antes: con «Sí, habitualmente» salía bici 1.015 veces y moto 463 sin mención de la carga.
  // REPARADO (1491) como AVISO, no como descarte: llevar bultos es un compromiso posible en bici
  // (portabultos, remolque), no una imposibilidad. Sin red se descarta el TP (16), que no
  // competía: sin aviso de descarte. Gana la bici con 22 y «Lo que juega en contra» cita la
  // respuesta. En moto, el aviso añade que no puede llevar de pasajero a un menor de 7 años
  // (Reglamento General de Circulación, art. 12.1 y 12.2, BOE-A-2003-23514).
  const BULTOS_BICI = [0, 3, 0, 2, 0, 2, 2, 2, 0, 2] as const;
  test('1491: a quien lleva bultos o sillas de bebé a diario, la bici o la moto se le recomienda citando la carga', async ({ page }) => {
    const { titulo } = await resultadoDe(page, BULTOS_BICI);
    expect(titulo).toBe('Bicicleta o Patinete Eléctrico');
    await expect(page.locator('[class*="avisoDescarte"]')).toHaveCount(0);
    await expect(page.locator('[class*="enContra"] li')).toHaveText([
      'Carga y bultos: has respondido «Sí, habitualmente». En bici hace falta portabultos, alforjas o remolque, y el patinete apenas admite carga.',
    ]);
    expect(contar((r, res) => r[2] === 0 && (res.tipo === 'bici_patinete' || res.tipo === 'moto_escuter')
      && !res.enContra.some((t) => t.startsWith('Carga y bultos: has respondido «Sí, habitualmente»')))).toBe(0);
    expect(contar((r, res) => r[2] === 0 && res.tipo === 'moto_escuter' && !res.enContra.some((t) => t.includes('menor de 7 años')))).toBe(0);
  });

  // ── HALLAZGO 5: coste «Crítica, quiero el mínimo gasto posible» → coche (400–700 €/mes) ──
  // Menos de 5 km · Sí, muy completa y frecuente · Sí, habitualmente · Sí, con frecuencia ·
  // Crítica, quiero el mínimo gasto posible · Sí, gratuito o muy asequible · Mucho, es una
  // prioridad · Sí, llueve mucho… · Poco relevante · Leve, prefiero comodidad.
  //   coche 4+3+3+2+3+2+2 = 19 · TP 2+4+4+3+2+2 = 17 · bici 6 · moto 4 · comb 4.
  // Antes: con «Crítica» salía el coche en 5.768 perfiles sin mención del coste declarado.
  // REPARADO (1492) como AVISO: la pregunta mide la IMPORTANCIA del coste, no un tope, y sin red
  // y con limitaciones el coche puede ser lo único que queda. «Lo que juega en contra»
  // cita la respuesta, el coste del coche y lo más barato que no descartan las respuestas: aquí
  // nada se descarta, así que la bici (5–30 €/mes).
  const COSTE_CRITICO_COCHE = [0, 0, 0, 0, 0, 0, 0, 0, 2, 1] as const;
  test('1492: el resultado dice que el coche choca con «el mínimo gasto posible»', async ({ page }) => {
    const { titulo } = await resultadoDe(page, COSTE_CRITICO_COCHE);
    expect(titulo).toBe('Coche Propio');
    await expect(page.locator('[class*="enContra"] li')).toHaveText([
      'Coste mensual: has respondido «Crítica, quiero el mínimo gasto posible», y el coche propio cuesta 400–700 €/mes en la estimación de este test; lo más barato que no descartan tus respuestas es la bici o el patinete eléctrico (5–30 €/mes).',
    ]);
    expect(contar((r, res) => r[4] === 0 && ['coche_propio', 'moto_escuter', 'combinacion'].includes(res.tipo)
      && !res.enContra.some((t) => t.includes('«Crítica, quiero el mínimo gasto posible»')))).toBe(0);
  });

  // ── HALLAZGO 6: seguridad vial «Mucho, es una prioridad para mí» → moto ──
  // Entre 5 y 15 km · No hay transporte público · Casi nunca · Sí, con frecuencia (nocturno) ·
  // Importante, pero puedo asumir · Sí, pero tiene coste notable · Mucho, es una prioridad para mí ·
  // Muy bueno · Poco relevante · Buena forma.
  //   moto 3+2+2+2+2+2+2+1+2 = 18 · coche 3+3+1+2+2 = 11 · TP 10 · bici 11 · comb 10.
  // Antes: 397 perfiles con esa respuesta recibían la moto sin mención. REPARADO (1493) como
  // AVISO (es una prioridad, no una imposibilidad): la moto gana con 18 (el TP, descartado por la
  // red, solo sumaba 10) y «Lo que juega en contra» cita la respuesta. Vale igual para la bici.
  const SEGURIDAD_MOTO = [1, 3, 2, 0, 1, 1, 0, 2, 2, 2] as const;
  test('1493: a quien prioriza la seguridad vial, la moto se le recomienda citando esa prioridad', async ({ page }) => {
    const { titulo } = await resultadoDe(page, SEGURIDAD_MOTO);
    expect(titulo).toBe('Moto o Escúter');
    await expect(page.locator('[class*="enContra"] li')).toHaveText([
      'Seguridad vial: has respondido «Mucho, es una prioridad para mí». En moto o escúter vas sin carrocería que te proteja en caso de choque: la protección depende del casco, de la ropa y de la vía (carriles separados, calles de velocidad reducida).',
    ]);
    expect(contar((r, res) => r[6] === 0 && (res.tipo === 'moto_escuter' || res.tipo === 'bici_patinete')
      && !res.enContra.some((t) => t.includes('«Mucho, es una prioridad para mí»')))).toBe(0);
  });

  // ── HALLAZGO 7: ficha fija de la bici «con buen clima» a quien declara clima adverso ──
  // Menos de 5 km · No hay transporte público · Sí, habitualmente · Ocasionalmente · Coste crítico ·
  // Sí, pero tiene coste notable · Seguridad: poco · Sí, llueve mucho o hace mucho frío/calor ·
  // Sostenibilidad fundamental · Buena forma.
  //   bici 3+3+2+4+3 = 15 · coche 3+4+1+1+3 = 12 · TP 2+4+2+3+1 = 12 · comb 10 · moto 9.
  // Antes: 920 de las 3.301 victorias de la bici leían «Rinde en distancias cortas, con buen
  // clima» con clima adverso o 15 km o más. REPARADO (1494): la descripción habla del medio
  // («la lluvia, el frío o el calor fuerte le restan comodidad») y el clima declarado se cita en
  // «Lo que juega en contra», junto con la carga, que este perfil también declara.
  const CLIMA_ADVERSO_BICI = [0, 3, 0, 1, 0, 1, 2, 0, 0, 2] as const;
  test('1494: la ficha de la bici no afirma «con buen clima», y el clima adverso declarado se cita', async ({ page }) => {
    const { titulo, texto } = await resultadoDe(page, CLIMA_ADVERSO_BICI);
    expect(titulo).toBe('Bicicleta o Patinete Eléctrico');
    expect(texto).not.toContain('con buen clima');
    await expect(page.locator('[class*="enContra"] li')).toHaveText([
      'Carga y bultos: has respondido «Sí, habitualmente». En bici hace falta portabultos, alforjas o remolque, y el patinete apenas admite carga.',
      'Clima: has respondido «Sí, llueve mucho o hace mucho frío/calor». En bici o patinete vas a la intemperie: prevé ropa impermeable o de abrigo y una alternativa para los peores días.',
    ]);
    expect(TRANSPORTES.bici_patinete.descripcion).not.toContain('buen clima');
    expect(contar((r, res) => r[7] === 0 && (res.tipo === 'bici_patinete' || res.tipo === 'moto_escuter')
      && !res.enContra.some((t) => t.startsWith('Clima: has respondido «Sí, llueve mucho')))).toBe(0);
  });

  // ── HALLAZGO 8: la guía y los pesos dicen lo contrario sobre las distancias largas ──
  // Todo en la primera opción: Más de 40 km · muy completa · bultos habitual · nocturno · crítica ·
  // gratuito · seguridad mucho · clima adverso · sostenibilidad fundamental · limitaciones.
  //   coche 4+4+3+3+2+3+4 = 23 · TP 4+4+3+2+3+2 = 18. Razones: P1, P3 y P10, 4 puntos cada una.
  // La tarjeta: «Más de 40 km» suma 4 al coche (y 0 al TP). La guía: «Por encima de 30 km, el
  // transporte público interurbano suele ser la mejor opción precio-tiempo».
  // REPARADO (1495): la frase de la guía no tenía fuente, y se ha retirado. La nueva no atribuye
  // a la distancia lo que el test no suma: la bici rinde en trayectos cortos y, en los largos,
  // hay que comparar el coche con el transporte interurbano si lo hay (que es lo que mide P2).
  test('1495: la guía no contradice lo que la distancia suma en el resultado', async ({ page }) => {
    const { texto } = await resultadoDe(page, [3, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(texto).toContain('«Más de 40 km», que suma 4 puntos al coche propio');
    const guia = await textoGuia(page);
    expect(guia).not.toContain('Por encima de 30 km, el transporte público interurbano suele ser la mejor opción');
    expect(guia).toContain('En los largos, el coche gana flexibilidad; si hay transporte público interurbano (cercanías, autobús) que una tu origen y tu destino, compara los dos en tiempo y en coste.');
  });

  // ── HALLAZGO 9: costes distintos para lo mismo, en la misma tarjeta y en la guía ──
  // Tarjeta de TP: «El más económico: desde 20–60 €/mes con abono» y, debajo, «Coste estimado:
  // 20–80 €/mes». Guía: «entre 20 y 55 €». FAQPage: «400-700 € al año» (33–58 €/mes). Además,
  // «El más económico» choca con la bici (5–30 €/mes, «la de menor coste»). Bici: tarjeta
  // 5–30 €/mes (60–360 €/año) y guía «menos de 150 €/año».
  // REPARADO (1496): una sola tabla de costes (COSTE_MENSUAL de motor.ts) para la tarjeta, la
  // guía y el FAQPage. La ventaja «El más económico: desde 20–60 €/mes» se ha quitado (chocaba con
  // el coste de la misma tarjeta y con la bici, más barata).
  test('1496: el coste de cada medio es el mismo en la tarjeta, la guía y el FAQPage', async ({ page, request }) => {
    const { titulo, texto } = await resultadoDe(page, NORMAL);
    expect(titulo).toBe('Transporte Público');
    const rangos = new Set([...texto.matchAll(/(\d+)–(\d+) €\/mes/g)].map((m) => m[0]));
    expect([...rangos]).toEqual(['20–80 €/mes']);
    expect(texto).not.toContain('El más económico');
    const guia = await textoGuia(page);
    for (const k of CLAVES) expect(guia, k).toContain(rangoMensual(k));
    expect(guia).toContain('un coche cuesta 4.800–8.400 € al año');
    expect(guia).toContain('una bici o un patinete, 60–360 € al año');
    expect(guia).not.toContain('entre 20 y 55 €');
    expect(guia).not.toContain('menos de 150 €/año');
    expect(guia).not.toContain('más de 7.000 €/año');
    const html = await (await request.get('/selector-movilidad-urbana/')).text();
    const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]) as { '@type': string; mainEntity?: { acceptedAnswer: { text: string } }[] })
      .find((b) => b['@type'] === 'FAQPage');
    const respuesta = faq?.mainEntity?.[0].acceptedAnswer.text ?? '';
    for (const k of ['bici_patinete', 'transporte_publico', 'moto_escuter', 'coche_propio'] as const) expect(respuesta, k).toContain(rangoMensual(k));
    expect(respuesta).toContain('unos 4.800–8.400 € al año');
    expect(respuesta).not.toContain('400-700 € al año');
    expect(respuesta).not.toContain('5.000-8.000 €');
  });

  // ── HALLAZGOS 1497-1502: datos de la guía, contrastados con su fuente ──
  // BOE-A-2025-6596 (RDL 3/2025), art. 1: «El período de vigencia de este programa se extiende
  // desde el 1 de enero al 31 de diciembre de 2025». BOE-A-2026-16010 (RD 609/2026, Programa
  // Auto+): vigente hasta el 31/12/2030 (art. 2.2), solo vehículos con etiqueta CERO (art. 1.1),
  // turismos M1, furgonetas N1 y motos L3e-L5e; particulares en la Línea 1 (art. 4.1.a).
  test('1497: la guía no presenta el MOVES III como vigente y nombra el programa que lo sigue', async ({ page }) => {
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toContain('El Plan MOVES III ofrece ayudas de hasta 7.000 €');
    expect(guia).toContain('El Plan MOVES III, que ayudaba a comprar vehículos eléctricos, terminó el 31 de diciembre de 2025 (Real Decreto-ley 3/2025).');
    expect(guia).toContain('Programa Auto+ (Real Decreto 609/2026, de 22 de julio, vigente hasta 2030)');
  });

  // AEAT, Manual práctico de Renta 2025, «Cantidades satisfechas por la empresa para el transporte
  // colectivo de sus empleados…»: exentas «con el límite de 1.500 euros anuales para cada
  // trabajador» (art. 46 bis RIRPF). Es una exención de retribución en especie, no una deducción.
  test('1498: el abono pagado por la empresa es una exención, no una «deducción» «desde 2023»', async ({ page }) => {
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toContain('deducciones en el IRPF para trabajadores (hasta 1.500 € anuales desde 2023)');
    expect(guia).not.toContain('desde 2023');
    // Reescrito el 02/10/2026 con el 2701: los 1.500 € anuales los fija la Ley del IRPF, art.
    // 42.3.e) (BOE-A-2006-20764), y el art. 46 bis del Reglamento añade el tope mensual de la
    // tarjeta; el test de abajo comprueba que el 46 bis se sigue citando y con su cifra.
    expect(guia).toContain('esa retribución en especie está exenta de IRPF hasta 1.500 € al año por trabajador (Ley del IRPF, art. 42.3.e)');
    expect(guia).toContain('Reglamento del IRPF (art. 46 bis)');
    expect(guia).toContain('no una deducción que el trabajador se aplique en su declaración');
  });

  // Ninguna fuente sostiene un IVA reducido para las motos eléctricas: la frase se retira. Lo que
  // queda es verificable: el distintivo CERO (exigido por el RD 609/2026 a las motos L3e-L5e que
  // reciben el Programa Auto+).
  test('1499: las motos eléctricas no tienen «IVA reducido»', async ({ page }) => {
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toContain('IVA reducido');
    expect(guia).toContain('Las motos eléctricas pueden llevar el distintivo ambiental CERO de la DGT');
  });

  // BOE-A-2021-8447 (Ley 7/2021), art. 14.3: los municipios de más de 50.000 habitantes y los
  // territorios insulares «adoptarán antes de 2023 planes de movilidad urbana sostenible» que
  // incluyan «a) El establecimiento de zonas de bajas emisiones antes de 2023»; y se aplica a los
  // de más de 20.000 «cuando se superen los valores límite de los contaminantes regulados».
  test('1500: las ZBE se describen como obligación de establecerlas, no como restricción vigente en todas', async ({ page }) => {
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toContain('restringen el acceso de vehículos contaminantes en ciudades de más de 50.000 habitantes desde 2023');
    expect(guia).not.toContain('Desde enero de 2023 son obligatorias');
    expect(guia).toContain('la Ley 7/2021 de cambio climático (art. 14.3) obliga a los municipios de más de 50.000 habitantes y a los territorios insulares');
    expect(guia).toContain('lo decide la ordenanza de cada municipio');
  });

  // INE, EPF 2025, nota de prensa del 25/06/2026: «Transporte, cuyo gasto supuso el 11,5% del
  // presupuesto total del hogar».
  test('1501: el peso del transporte en el gasto de los hogares sale del INE (11,5 %, EPF 2025)', async ({ page }) => {
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toMatch(/13–22\s%\sdel gasto mensual/);
    expect(guia).toContain('el transporte supuso el 11,5 % del presupuesto de los hogares en 2025, según la Encuesta de Presupuestos Familiares del INE');
  });

  test('1502: la guía no afirma sin fuente que el 60 % de los municipios tiene bicicarriles', async ({ page }) => {
    await abrirTest(page);
    const guia = await textoGuia(page);
    expect(guia).not.toContain('El 60 % de los municipios españoles tiene red de bici-carriles');
    expect(guia).not.toContain('bici-carriles en expansión');
  });

  // ── 1503: aviso de ámbito geográfico (§1.bis) ──
  // Costes de una ciudad española, guía con DGT, ZBE, Programa Auto+ e IRPF; el test en sí vale
  // en cualquier país. REPARADO: <RegionBadge variant="es-data" /> justo después del hero, como
  // el 1340 de selector-mascota.
  test('1503: los datos de España declaran su ámbito con RegionBadge, justo después del hero', async ({ page }) => {
    await abrirTest(page);
    const aviso = page.locator('[role="note"][aria-label*="España"]');
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toContainText('Datos de referencia: España');
    const trasHero = await page.locator('header[class*="hero"]').evaluate((el) => el.nextElementSibling?.getAttribute('aria-label') ?? '');
    expect(trasHero).toBe('Aviso: los datos de referencia son de España');
  });

  // ── 1504: WebApplication con características (§1.ter: 4-8 reales) ──
  test('1504: el JSON-LD WebApplication lista entre 4 y 8 características de la app', async ({ request }) => {
    const html = await (await request.get('/selector-movilidad-urbana/')).text();
    const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Record<string, unknown>);
    const app = bloques.find((b) => b['@type'] === 'WebApplication');
    expect(app, 'hay un WebApplication').toBeTruthy();
    const lista = (app?.featureList as string[] | undefined) ?? [];
    expect(lista.length).toBeGreaterThanOrEqual(4);
    expect(lista.length).toBeLessThanOrEqual(8);
    expect(lista).toContain('Anuncia los empates y el criterio que los deshace');
  });

  // ── 1505: el hero usa var(--hero-bg) ──
  // Antes: degradado #2e86ab→#48a9a6 en hexadecimal, igual en los dos temas; subtítulo 2,82:1.
  // Ahora #1a5278 en los dos temas: blanco al 90 % sobre él da más de 7:1, y el <h1>, más de 8.
  test('1505: el hero usa --hero-bg y su subtítulo llega a 4,5:1 en los dos temas', async ({ page }) => {
    await abrirTest(page);
    const fondo = () => page.locator('header[class*="hero"]').evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).backgroundImage]);
    expect(await fondo()).toEqual(['rgb(26, 82, 120)', 'none']);
    expect(await contrasteMin(page, 'header[class*="hero"] p'), 'subtítulo, claro').toBeGreaterThanOrEqual(4.5);
    expect(await contrasteMin(page, 'header[class*="hero"] h1'), 'h1, claro').toBeGreaterThanOrEqual(4.5);
    await activarOscuro(page);
    expect(await fondo()).toEqual(['rgb(26, 82, 120)', 'none']);
    expect(await contrasteMin(page, 'header[class*="hero"] p'), 'subtítulo, oscuro').toBeGreaterThanOrEqual(4.5);
    expect(await contrasteMin(page, 'header[class*="hero"] h1'), 'h1, oscuro').toBeGreaterThanOrEqual(4.5);
  });

  // ── 1506: textos pequeños de marca y botones, a 4,5:1 en los dos temas ──
  // Antes: etiqueta 2,68 en claro; «Repetir el test» 3,93 / 4,24; «Siguiente →» 3,05. Ahora:
  // etiqueta --secondary-texto, «Repetir el test» --primary-texto y «Siguiente →» sobre
  // --primary-boton (#26718F, 5,47:1 con blanco en los dos temas).
  test('1506: la etiqueta del resultado y los botones llegan a 4,5:1 en los dos temas', async ({ page }) => {
    await abrirTest(page);
    await page.locator('[role="radio"]').first().click();
    const siguiente = page.locator('[class*="btnPrimary"]');
    await expect.poll(() => siguiente.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    expect(await contrasteMin(page, '[class*="btnPrimary"]'), 'btnPrimary, claro').toBeGreaterThanOrEqual(4.5);
    await activarOscuro(page);
    expect(await contrasteMin(page, '[class*="btnPrimary"]'), 'btnPrimary, oscuro').toBeGreaterThanOrEqual(4.5);
    await page.getByRole('button', { name: 'Cambiar a modo claro' }).first().click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    for (let i = 1; i < 10; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(NORMAL[i]).click();
      await page.getByRole('button', { name: i === 9 ? 'Ver mi resultado' : 'Siguiente pregunta' }).click();
    }
    await page.locator('[class*="resultadoTitulo"]').waitFor();
    await esperarSinTransiciones(page);
    // La tarjeta es opaca y blanca en claro: si el fondo no se hubiera asentado, la medida sería
    // contra el fondo por defecto del ayudante y no contra el real.
    await expect.poll(() => page.locator('[class*="resultadoCard"]').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
    for (const tema of ['claro', 'oscuro'] as const) {
      if (tema === 'oscuro') {
        await activarOscuro(page);
        await expect.poll(() => page.locator('[class*="resultadoCard"]').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(42, 42, 42)');
      }
      expect(await contrasteMin(page, '[class*="resultadoEtiqueta"]'), `resultadoEtiqueta, ${tema}`).toBeGreaterThanOrEqual(4.5);
      expect(await contrasteMin(page, '[class*="btnReiniciar"]'), `btnReiniciar, ${tema}`).toBeGreaterThanOrEqual(4.5);
      // 1,6rem en negrita es texto grande: 3:1
      expect(await contrasteMin(page, '[class*="resultadoTitulo"]'), `resultadoTitulo, ${tema}`).toBeGreaterThanOrEqual(3);
    }
  });

  // ── 1507: el nombre accesible de «Repetir el test» es su texto visible (WCAG 2.5.3) ──
  test('1507: el botón «Repetir el test» se llama como se lee', async ({ page }) => {
    await resultadoDe(page, NORMAL);
    await expect(page.getByRole('button', { name: 'Repetir el test', exact: true })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Volver a hacer el test' })).toHaveCount(0);
  });

  // ── Familia (regla g): al pulsar «Ver mi resultado» el foco no cae a <body> ──
  // El botón se desmonta con el test; el foco va al título del resultado (tabIndex −1).
  test('familia g: tras «Ver mi resultado» el foco está en el título del resultado', async ({ page }) => {
    await resultadoDe(page, NORMAL);
    await expect(page.locator('[class*="resultadoTitulo"]')).toBeFocused();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 02/10/2026 (invalidada por los lotes de CSS d056b066 y a1d72a9c)
// ═════════════════════════════════════════════════════════════════════════════
//
// Los hallazgos 1488-1507 de la primera inspección están REPARADOS y sus tests de arriba los
// fijan. El desempate que enuncia el texto se ha vuelto a barrer en Node con las 78.732
// combinaciones: 7.483 empates, 0 criterios falsos, 0 superlativos falsos y 0 avisos de
// descarte incompletos (lo fija también el test «motor: ningún empate queda en silencio…»).
//
// Familia de los selectores, referencia selector-smartphone. Lo que esta hermana NO tiene de la
// referencia, medido en el navegador: el teclado del patrón de radios, el foco en el enunciado
// tras «Siguiente»/«Anterior» y una barra de progreso con nombre. Lo que solo existe aquí (el
// punto ciego del grupo): la «Combinación multimodal», un resultado hecho de los OTROS medios,
// que se admite con que queden dos aunque sean el coche y la moto.
//
// Perfiles como índices de opción (0 = la primera), en el orden coche · transporte público (TP) ·
// moto · bici · combinación.

/** Píxeles de las líneas de texto de `selector` que quedan bajo las cajas de la barra fija del logo. */
async function tapadoPorLogo(page: Page, selector: string): Promise<{ px: number; top: number; bottom: number; barra: number; alto: number }> {
  return page.locator(selector).first().evaluate((el) => {
    const cajas = [...document.querySelectorAll('[class*="headerBar"] > *')].map((c) => c.getBoundingClientRect());
    const rango = document.createRange();
    rango.selectNodeContents(el);
    let px = 0;
    for (const l of [...rango.getClientRects()].filter((q) => q.width > 0)) {
      for (const c of cajas) {
        const w = Math.min(l.right, c.right) - Math.max(l.left, c.left);
        const h = Math.min(l.bottom, c.bottom) - Math.max(l.top, c.top);
        if (w > 0 && h > 0) px = Math.max(px, w * h);
      }
    }
    const r = el.getBoundingClientRect();
    return { px, top: r.top, bottom: r.bottom, barra: Math.max(...cajas.map((c) => c.bottom)), alto: innerHeight };
  });
}

async function ponerOscuro(page: Page): Promise<void> {
  if ((await page.locator('html').getAttribute('data-theme')) !== 'dark') {
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).first().click();
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
}

test.describe('Re-inspección 02/10/2026 — casos del motor en el navegador', () => {
  // ── CASO NORMAL: todas las respuestas intermedias (la segunda opción de cada pregunta) ──
  // 5-15 km · Regular · A veces · Ocasionalmente · Importante, pero puedo asumir · Sí, pero tiene
  // coste notable · Me preocupa, pero tengo experiencia · Moderado · Me importa · Leve.
  //   coche 2+1+1+1+2 = 7 · TP 2+2+1+2+1+1+2+2 = 13 · moto 3+1+1+2+2+1+1 = 11 · bici 2+1+1 = 4 ·
  //   combinación 2+3+2+2+2+2+2+3+2+1 = 21. Nada se descarta, sin empate. Razones: P2 (3) y P8 (3),
  //   y de las de 2 puntos la de número más bajo, P1.
  test('caso normal: las respuestas intermedias dan la combinación multimodal con 21 puntos', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Combinación Multimodal');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    await expect(page.locator('[class*="avisoDescarte"]')).toHaveCount(0);
    await expect(page.locator('[class*="enContra"]')).toHaveCount(0);
    await expect(page.locator('[class*="razones"] li')).toHaveText([
      'Red de transporte público: has respondido «Regular, con algunas líneas útiles», que suma 3 puntos a la combinación multimodal.',
      'Clima: has respondido «Moderado, con algunas semanas complicadas», que suma 3 puntos a la combinación multimodal.',
      'Distancia: has respondido «Entre 5 y 15 km», que suma 2 puntos a la combinación multimodal.',
    ]);
    expect(texto).toContain('Coste estimado: 80–250 €/mes');
  });

  // ── CASO LÍMITE: empate que deshace la DISTANCIA (el segundo criterio) ──
  // 5-15 km · Regular · Casi nunca · Ocasionalmente · Importante · Coste notable · Seguridad: poco ·
  // Clima adverso · Sostenibilidad poco relevante · Buena forma.
  //   coche 1+1+3+2 = 7 · TP 2+2+2+2+2+1 = 11 · moto 3+1+2+1+2+2+2+1+2 = 16 · bici 2+2+1+2+3 = 10 ·
  //   combinación 2+3+1+2+2+2+2+2 = 16. Empate moto = combinación a 16. Movilidad física (P10):
  //   moto 2 = combinación 2, no decide; distancia (P1): moto 3 > combinación 2 → la moto, «porque
  //   encaja mejor con la distancia de tu trayecto». En contra: el clima adverso declarado.
  test('caso límite: un empate a 16 lo deshace la distancia, y se dice', async ({ page }) => {
    await abrirTest(page);
    await responder(page, [1, 1, 2, 1, 1, 1, 2, 0, 2, 2]);
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Moto o Escúter');
    // toContainText: el párrafo empieza por el «⚖️» decorativo (aria-hidden), que también es texto.
    await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
      'Empate: con tus respuestas, la moto o el escúter y la combinación multimodal encajan exactamente igual; se muestra primero la moto o el escúter porque encaja mejor con la distancia de tu trayecto.',
    );
    await expect(page.locator('[class*="razones"] li')).toHaveText([
      'Distancia: has respondido «Entre 5 y 15 km», que suma 3 puntos a la moto o el escúter.',
      'Carga y bultos: has respondido «Casi nunca, solo lo básico», que suma 2 puntos a la moto o el escúter.',
      'Coste mensual: has respondido «Importante, pero puedo asumir costes razonables», que suma 2 puntos a la moto o el escúter.',
    ]);
    await expect(page.locator('[class*="enContra"] li')).toHaveText([
      'Clima: has respondido «Sí, llueve mucho o hace mucho frío/calor». En moto o escúter vas a la intemperie: prevé ropa impermeable o de abrigo y una alternativa para los peores días.',
    ]);
  });

  // Sospechas de SOSPECHAS.md, DESCARTADAS el 02/10/2026: «Tarjeta Joven 50 %» se retiró en
  // c9b48a08 (24/09) y no queda en la página; el MOVES III se da por terminado y el programa
  // vigente es el Auto+ (lo fija el test 1497 de arriba; cotejado con data/fiscal/ayudas-vehiculo.ts).
  test('sospechas descartadas: ni «Tarjeta Joven» ni el MOVES III como ayuda vigente', async ({ page }) => {
    await abrirTest(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).first().click();
    const guia = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(guia).not.toContain('Tarjeta Joven');
    expect(guia).not.toMatch(/MOVES III (ofrece|da|concede)/);
    expect(guia).toContain('El Plan MOVES III, que ayudaba a comprar vehículos eléctricos, terminó el 31 de diciembre de 2025');
  });

  // ── 2699 (02/10/2026, REPARADO): la combinación multimodal con solo el coche y la moto ──
  // Más de 40 km · No hay transporte público (en la inspección, «Deficiente o inexistente») · A
  // veces · Ocasionalmente · Importante · Complicado o caro aparcar · Seguridad: poco · Moderado ·
  // Me importa · Buena forma.
  //   coche 4+3+2+1 = 10 · TP 1+2+3+1+2+1 = 10 (descartado: sin red) · moto 2+1+2+2+2+1+2 = 12 ·
  //   bici 1+2+2+1+3 = 9 (descartada: más de 40 km) · combinación 1+2+2+2+2+2+3+2+2 = 18.
  // Antes ganaba la combinación con «Tu combinación tendrá que apoyarse en el coche propio y la
  // moto o el escúter» y, en la misma tarjeta, «80–250 €/mes (abono más bici o patinete…)»: el
  // abono y la bici eran justo lo descartado (649 perfiles en el barrido, 226 con coste «Crítica»).
  // REPARADO: una combinación se apoya en el transporte público o en la bici; con los dos fuera,
  // se DESCARTA (dos vehículos propios no son lo que la ficha describe ni lo que cotiza). Queda la
  // moto con 12 frente al coche 10, el aviso nombra a la combinación (18) con el porqué, y «Lo que
  // juega en contra» cita los más de 40 km en moto.
  test('2699: sin transporte público ni bici no se recomienda la combinación, y se dice', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, [3, 3, 1, 1, 1, 2, 2, 1, 1, 2]);
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Moto o Escúter');
    await expect(page.locator('[class*="avisoDescarte"]')).toContainText(
      'Se ha descartado una opción que sumaba tantos puntos o más que la moto o el escúter (12 puntos): la combinación multimodal (18 puntos), porque se apoya en el transporte público o en la bici o el patinete, y tus respuestas descartan los dos.',
    );
    await expect(page.locator('[class*="enContra"] li')).toHaveText([
      'Distancia: has respondido «Más de 40 km». La moto rinde en trayectos medios; a esa distancia pasarás buena parte del recorrido en vías interurbanas y a la intemperie.',
    ]);
    expect(texto).not.toContain('abono más bici o patinete');
    // Barrido: ninguna combinación recomendada sin su base (antes, 649), y cuando sale con el
    // transporte público descartado, la bici sigue entre los medios en que se apoya.
    const r: number[] = [];
    let sinBase = 0;
    let total = 0;
    const recorrer = (i: number): void => {
      if (i === PREGUNTAS.length) {
        total++;
        const res = calcularResultado(r);
        if (res.tipo === 'combinacion' && res.descartes.transporte_publico && res.descartes.bici_patinete) sinBase++;
        if (res.tipo === 'combinacion' && res.descartes.transporte_publico
          && !res.enContra.some((t) => t.includes('la bici o el patinete eléctrico'))) sinBase++;
        return;
      }
      for (let k = 0; k < PREGUNTAS[i].opciones.length; k++) { r[i] = k; recorrer(i + 1); }
    };
    recorrer(0);
    expect(total).toBe(104_976);
    expect(sinBase).toBe(0);
  });

  // ── 2700 (02/10/2026, REPARADO): «Deficiente o inexistente» juntaba dos respuestas y un filtro ──
  // La opción metía en el mismo radio una red que EXISTE pero es mala y una que no existe, y el
  // motor descartaba el transporte público con las dos. Perfil de quien tiene una red pobre pero
  // la usa: menos de 5 km · Deficiente · Casi nunca · Horario fijo · Coste crítico · Complicado o
  // caro aparcar · Seguridad: mucho · Moderado · Sostenibilidad fundamental · Leve.
  //   TP 2+2+3+4+3+3+1+3+2 = 23 · bici 3+2+2+3+2+4 = 16 · combinación 11 · coche 3+2+2 = 7 · moto 7.
  // Antes: la bici (16) a quien prioriza la seguridad vial, y «se ha descartado… el transporte
  // público (23 puntos)». REPARADO: son dos opciones. «Deficiente: pasa poco o no cubre bien mis
  // trayectos» conserva los pesos de antes y es una preferencia: no descarta, y si gana el
  // transporte público «Lo que juega en contra» la cita. «No hay transporte público en mi zona»
  // descarta, como antes (lo fija el 1488 de arriba). (Forma del 2666 de selector-mascota.)
  test('2700: con la red «deficiente» (que existe) el transporte público no se descarta, y se cita', async ({ page }) => {
    const deficiente = PREGUNTAS[1].opciones.findIndex((o) => /^Deficiente/.test(o.texto));
    const sinRed = PREGUNTAS[1].opciones.findIndex((o) => o.texto === 'No hay transporte público en mi zona');
    expect([deficiente, sinRed]).toEqual([2, 3]);
    await abrirTest(page);
    await responder(page, [0, deficiente, 2, 2, 0, 2, 0, 1, 0, 1]);
    await expect(page.locator('[class*="avisoDescarte"]')).toHaveCount(0);
    await expect(page.locator('[class*="resultadoTitulo"]')).toHaveText('Transporte Público');
    await expect(page.locator('[class*="enContra"] li')).toHaveText([
      'Red de transporte público: has respondido «Deficiente: pasa poco o no cubre bien mis trayectos». Antes de decidir, comprueba que alguna línea une tu origen y tu destino a las horas a las que viajas.',
    ]);
  });

  // ── 2701 (02/10/2026, REPARADO): la tarjeta de transporte tiene también un tope mensual ──
  // La guía citaba el art. 46 bis del Reglamento del IRPF para «una tarjeta o un vale de
  // transporte», pero solo daba el límite anual. El 46 bis.1.2.º (BOE-A-2007-6820, texto
  // consolidado leído el 02/10/2026): «no podrá exceder de 136,36 euros mensuales por
  // trabajador, con el límite de 1.500 euros anuales»; y el 46 bis.2, retribución en especie
  // por el exceso. Una empresa que carga 200 € al mes en la tarjeta durante 7 meses (1.400 €):
  // según la guía, exento entero; según el 46 bis, 445,48 € de exceso ((200 − 136,36) × 7).
  // REPARADO: el anual se atribuye a la Ley (art. 42.3.e, BOE-A-2006-20764, «con el límite de
  // 1.500 euros anuales para cada trabajador»), y la tarjeta lleva su tope mensual y la
  // tributación del exceso. El «vale» se retira: el 46 bis habla de «tarjetas o cualquier otro
  // medio electrónico de pago».
  test('2701: si la guía habla de la tarjeta de transporte, da también su tope de 136,36 € al mes', async ({ page }) => {
    await abrirTest(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).first().click();
    const parrafo = (await page.locator('p', { hasText: '1.500 € al año por trabajador' }).first().innerText()).replace(/\s+/g, ' ');
    expect(parrafo).toContain('art. 46 bis');
    expect(!/tarjeta/.test(parrafo) || /136,36/.test(parrafo), parrafo).toBe(true);
    expect(parrafo).toContain('136,36 € al mes');
    expect(parrafo).toContain('lo que exceda de esos límites tributa como retribución en especie');
    expect(parrafo).not.toContain('vale');
  });
});

test.describe('Re-inspección 02/10/2026 — teclado, foco y lectores de pantalla (escritorio)', () => {
  // ── 2696 (02/10/2026, REPARADO; sospecha de SOSPECHAS.md, page.tsx:115) ──
  // role="radio" sin el teclado del patrón (WAI-ARIA APG), que la referencia selector-smartphone
  // ya tiene (1681): medido, cuatro paradas de Tab en un grupo de cuatro radios (todos con
  // tabIndex 0), y ArrowDown, End o Inicio no mueven el foco ni la marca. REPARADO con la receta
  // de la referencia (`teclaEnOpcion` y tabindex itinerante).
  test('2696: el grupo de radios es una sola parada de Tab y las flechas, Inicio y Fin mueven y marcan', async ({ page }) => {
    await abrirTest(page);
    const radios = page.locator('[role="radiogroup"] [role="radio"]');
    const tabindex = () => radios.evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex));
    expect(await tabindex()).toEqual([0, -1, -1, -1]);
    await radios.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(radios.nth(1)).toBeFocused();
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true');
    expect(await tabindex()).toEqual([-1, 0, -1, -1]);
    await page.keyboard.press('End');
    await expect(radios.nth(3)).toBeFocused();
    await expect(radios.nth(3)).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowDown'); // vuelta al principio
    await expect(radios.nth(0)).toBeFocused();
    await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowUp'); // y al final
    await expect(radios.nth(3)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(radios.nth(0)).toBeFocused();
    await expect(page.locator('[role="radiogroup"] [aria-checked="true"]')).toHaveCount(1);
    // Una sola parada: el Tab siguiente sale del grupo, a «Siguiente pregunta» (ya activo).
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeFocused();
  });

  // ── 2695 (02/10/2026, REPARADO): el foco caía a <body> al avanzar o retroceder ──
  // «Siguiente» se desactiva en la pregunta nueva (sin respuesta) y «Anterior» en la 1: el foco
  // que tenían caía a <body>, y el Tab siguiente iba a «Ver guía educativa», saltándose las
  // opciones de la pregunta nueva. REPARADO como la referencia (1680): el enunciado es un
  // <h2 tabIndex=-1> y recibe el foco tras cada cambio de pregunta.
  test('2695: tras «Siguiente» y «Anterior» con el teclado, el foco va al enunciado y el Tab entra en sus opciones', async ({ page }) => {
    await abrirTest(page);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="preguntaTexto"]')).toHaveText(/buena red de transporte público/);
    await expect(page.locator('h2[class*="preguntaTexto"]')).toBeFocused();
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('radio');
    await expect(page.locator('[role="radiogroup"] [role="radio"]').first()).toBeFocused();
    // Y al volver de la 2 a la 1, con «Anterior» desactivándose en la 1.
    await page.getByRole('button', { name: 'Pregunta anterior' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[class*="preguntaTexto"]')).toHaveText('¿Cuál es tu distancia habitual al trabajo o estudios?');
    await expect(page.getByRole('button', { name: 'Pregunta anterior' })).toBeDisabled();
    await expect(page.locator('h2[class*="preguntaTexto"]')).toBeFocused();
    await page.keyboard.press('Tab');
    // La 1 está contestada: la parada del grupo es la opción marcada.
    await expect(page.locator('[role="radiogroup"] [aria-checked="true"]')).toBeFocused();
  });

  // Al cargar la página el foco NO se mueve al enunciado (solo tras una navegación): moverlo
  // desplazaría la vista lejos del hero y del aviso legal.
  test('2695: al abrir la app el foco no salta al enunciado', async ({ page }) => {
    await abrirTest(page);
    await expect(page.locator('h2[class*="preguntaTexto"]')).not.toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  // ── 2697 (02/10/2026, REPARADO): la barra de progreso no tenía nombre ──
  // role="progressbar" sin aria-label (en el árbol de accesibilidad, nombre ""; axe:
  // aria-progressbar-name): el «Pregunta 1 de 10» estaba en el <div> que la envuelve, que es
  // genérico y no lo expone. Sin aria-valuetext se anunciaba «10 %» en la pregunta 1 sin
  // contestar. REPARADO: nombre y texto en la propia barra; la escala no cambia (la fracción
  // cuadra con lo pintado, lo fija el test de la barra de arriba). El «10 %» visible, con espacio
  // duro.
  test('2697: la barra de progreso se llama «Pregunta 1 de 10»', async ({ page }) => {
    await abrirTest(page);
    const barra = page.getByRole('progressbar');
    await expect(barra).toHaveAccessibleName('Pregunta 1 de 10');
    await expect(barra).toHaveAttribute('aria-valuetext', 'Pregunta 1 de 10');
    await expect(page.locator('[class*="progreso"] > span').last()).toHaveText('10 %');
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    await expect(barra).toHaveAccessibleName('Pregunta 2 de 10');
  });
});

test.describe('Re-inspección 02/10/2026 — móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 780 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Lotes d056b066 (móvil) y a1d72a9c (769-1023 px): el hero lleva 80 px arriba hasta 1023 px.
  // Medido el 02/10/2026 en claro y oscuro: el <h1> empieza en y 80 (la barra acaba en 52 en
  // móvil y en 77 desde 769 px); a 1024 px empieza en 48, pero centrado no alcanza ni la píldora
  // del logo ni el conmutador (0 px tapados). La pregunta en curso tras «Siguiente», con el
  // botón a media pantalla, queda visible y por debajo de la barra.
  test('la barra fija del logo no tapa el <h1> ni la pregunta en curso a 360, 390, 800, 1000 y 1024 px, en claro y oscuro', async ({ page }) => {
    test.setTimeout(120_000);
    for (const tema of ['claro', 'oscuro'] as const) {
      for (const [ancho, alto] of [[360, 780], [390, 844], [800, 900], [1000, 900], [1024, 900]]) {
        await page.setViewportSize({ width: ancho, height: alto });
        await abrirTest(page);
        if (tema === 'oscuro') await ponerOscuro(page);
        const h1 = await tapadoPorLogo(page, 'header[class*="hero"] h1');
        expect(h1.px, `<h1>, ${ancho} px, ${tema}`).toBe(0);
        await page.locator('[role="radio"]').first().tap();
        const siguiente = page.getByRole('button', { name: 'Siguiente pregunta' });
        await siguiente.evaluate((e) => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.top - innerHeight * 0.6); });
        await siguiente.tap();
        await expect(page.locator('[class*="preguntaTexto"]')).toHaveText(/buena red de transporte público/);
        const p = await tapadoPorLogo(page, '[class*="preguntaTexto"]');
        expect(p.px, `pregunta 2, ${ancho} px, ${tema}`).toBe(0);
        expect(p.top, `pregunta 2 por debajo de la barra, ${ancho} px, ${tema}`).toBeGreaterThanOrEqual(p.barra);
        expect(p.bottom, `pregunta 2 dentro de la pantalla, ${ancho} px, ${tema}`).toBeLessThanOrEqual(p.alto);
      }
    }
  });

  // ── HALLAZGO (02/10/2026, ABIERTO): «Repetir el test» deja la pregunta 1 fuera de la pantalla ──
  // El resultado (unos 1.300 px a 360) se sustituye por el cuestionario en su sitio sin desplazar
  // la vista, y el botón pulsado se desmonta: foco en <body>. Medido: el enunciado de la 1 queda
  // 694 px POR ENCIMA de la pantalla a 360 px (622 a 390, 318 en escritorio), y lo que se ve es
  // la guía educativa y las apps relacionadas. Forma del 1679 de la referencia, en el reinicio.
  test('2694: tras «Repetir el test» se ve la pregunta 1 y el foco no cae a <body>', async ({ page }) => {
    await abrirTest(page);
    // Medio segundo entre un toque que cambia de pantalla y el siguiente: es lo que tarda una
    // persona en leer, y sin la pausa el guard de doble toque (2698) trata el toque siguiente como
    // el 2.º de una ráfaga y lo ignora, que es lo correcto. Bajo next dev pasaba sin ella porque
    // la página tardaba más; contra next start falló 5 de 5 en «Repetir» (suite del 02/10/2026).
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);
      await page.locator('[role="radiogroup"] [role="radio"]').first().tap();
      await page.getByRole('button', { name: i === 9 ? 'Ver mi resultado' : 'Siguiente pregunta' }).tap();
    }
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Repetir el test' }).tap();
    await expect(page.locator('[class*="preguntaTexto"]')).toHaveText('¿Cuál es tu distancia habitual al trabajo o estudios?');
    const p = await tapadoPorLogo(page, '[class*="preguntaTexto"]');
    expect(p.top, 'el enunciado de la 1, por debajo de la barra del logo').toBeGreaterThanOrEqual(p.barra);
    expect(p.bottom, 'el enunciado de la 1, dentro de la pantalla').toBeLessThanOrEqual(p.alto);
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  });
});

test.describe('Re-inspección 02/10/2026 — móvil 412 px (Pixel 7)', () => {
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  // ── 2698 (02/10/2026, REPARADO): un doble toque en «Siguiente» devolvía a la pregunta anterior ──
  // A 480 px o menos la navegación va en columna invertida: «Siguiente» arriba y «Anterior»
  // debajo. Al pasar a una pregunta con menos opciones (o con textos más cortos) la tarjeta
  // encoge, sube la navegación y el segundo toque caía en «Anterior», ya activo. En la
  // inspección, de la 1 (cuatro opciones) a la 2 (tres), 8 de 8 veces a 412 y 390 px; a 360 px,
  // de la 2 a la 3 y de la 8 a la 9. REPARADO con el guard de la familia (`clicDeMas`): el 2.º
  // toque de una ráfaga se ignora si el anterior cambió de pantalla.
  //
  // Reescrito al reparar: con el 2700 la pregunta 2 tiene ya cuatro opciones, y de la 1 a la 2
  // la tarjeta ya no encoge, así que el caso de la inspección pasaba en verde SIN el guard (no
  // probaba nada). Ahora se recorren las nueve transiciones con el doble toque, y el test exige
  // que en alguna el punto del segundo toque caiga, tras el primero, sobre «Pregunta anterior»
  // activo: es ahí donde, sin el guard, se volvería atrás.
  test('2698: un doble toque en «Siguiente» avanza una sola pregunta, también cuando el 2.º toque cae en «Anterior»', async ({ page }) => {
    test.setTimeout(90_000);
    await abrirTest(page);
    const caidasEnAnterior: number[] = [];
    for (let i = 0; i < PREGUNTAS.length - 1; i++) {
      // Lee la pregunta antes de tocar: sin esta pausa, el toque en la opción llega a menos de
      // 300 ms del toque en «Siguiente» y Chrome lo cuenta como el 2.º de la misma ráfaga, que es
      // justo el toque de más que la app ignora ahora (mismo criterio que selector-smartphone).
      await page.waitForTimeout(500);
      await page.locator('[role="radiogroup"] [role="radio"]').first().tap();
      const boton = page.getByRole('button', { name: 'Siguiente pregunta' });
      await boton.evaluate((e) => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - 480); });
      const caja = (await boton.boundingBox())!;
      const x = caja.x + caja.width / 2;
      const y = caja.y + caja.height / 2;
      await page.touchscreen.tap(x, y);
      await expect(page.getByText(`${i + 2}/10`, { exact: true })).toBeVisible();
      const debajo = await page.evaluate(([px, py]) => {
        const el = document.elementFromPoint(px, py)?.closest('button');
        return el ? { nombre: el.getAttribute('aria-label') ?? el.textContent ?? '', activo: !el.disabled } : null;
      }, [x, y]);
      if (debajo?.nombre === 'Pregunta anterior' && debajo.activo) caidasEnAnterior.push(i + 1);
      await page.waitForTimeout(150);
      await page.touchscreen.tap(x, y);
      await page.waitForTimeout(300);
      await expect(page.getByText(`${i + 2}/10`, { exact: true }), `doble toque de la ${i + 1} a la ${i + 2}`).toBeVisible();
      await expect(page.locator('[role="radiogroup"] [aria-checked="true"]')).toHaveCount(0);
    }
    expect(caidasEnAnterior.length, 'alguna transición pone «Anterior» bajo el 2.º toque').toBeGreaterThan(0);
  });
});
