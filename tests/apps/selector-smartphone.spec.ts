import { test, expect, Page } from '@playwright/test';

/**
 * Asesor de Smartphone (selector-smartphone) — inspección del 20/09/2026
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Asesor de Smartphone» y el subtítulo «10 preguntas para saber qué móvil te
 *   conviene de verdad». La pantalla de intro enumera lo que va a entregar: sistema operativo
 *   (iOS o Android), «gama recomendada con precio orientativo», características técnicas a
 *   buscar y consejos de compra. NO nombra modelos comerciales — el commit 2026-05-18
 *   («sustituir modelos hardcodeados por características técnicas») los retiró, y así sigue.
 *
 * LA VERDAD COMPROBABLE DE UN RECOMENDADOR
 *   No hay fórmula física que contrastar, pero sí hay una propiedad que se verifica: la
 *   COHERENCIA entre lo que el usuario responde y lo que se le recomienda. El motor está en
 *   `calcularResultado()` de `app/selector-smartphone/page.tsx` y es una suma de pesos que
 *   se puede calcular a mano ANTES de abrir el navegador:
 *
 *     puntosiOS      P4 «Sí, varios» +3 · «Alguno» +1     P5 macOS +2 · Windows −1
 *                    os = puntosiOS >= 3 ? iOS : Android
 *
 *     puntosGamaAlta P1 foto +2 · trabajo +1              P2 intenso +2 · frecuente +1
 *                    P3 >7 h +2 · 4-7 h +1                P6 cámara +2 · rendimiento +1
 *                    P7 «4 años o más» +2                 P9 500-900 € +2 · >900 € +4 · ≤250 € −3
 *                    gama = >=7 pro · >=4 alta · >=1 media · resto básica
 *
 *     AJUSTE FINAL   P9 «Hasta 250 €» → básica          P9 «Más de 900 €» → pro
 *
 *   Ese ajuste final es el nudo de la inspección: SOLO existe en los dos extremos. Con los
 *   tramos intermedios («250 – 500 €» y «500 – 900 €») el presupuesto declarado no acota
 *   nada, y la gama la fija el recuento de puntos sin tope de ningún tipo.
 *
 * LO QUE ESTOS CASOS FIJAN
 *   1) coherente — necesidades inequívocas y mínimas: la recomendación baja, como debe.
 *   2) contradictorio con presupuesto MÍNIMO: el tope funciona, pero en silencio, y la
 *      justificación que imprime describe un perfil que el usuario no declaró.
 *   3) contradictorio con presupuesto MEDIO: no hay tope, y la app recomienda una gama de
 *      900 – 1.500+ € a quien acaba de declarar 250 – 500 €, sin mencionar el conflicto.
 *   4) estabilidad — repetir el mismo perfil da el mismo resultado (correcto), pero cambiar
 *      UNA sola respuesta salta los cuatro escalones de la escala con una razón inventada.
 *
 * ⚠️ Los casos 2, 3 y 4 fijan el comportamiento OBSERVADO, no el deseable: si algún día se
 *    repara el motor, estas comprobaciones fallarán, y ese fallo es precisamente el aviso.
 *    Cada una lleva anotado al lado qué debería pasar cuando se repare.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ayudantes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * La app no tiene ningún <input>, así que el ayudante de `_hidratacion.ts` (que sondea el
 * rastreador de valor de React sobre un input) no sirve aquí. El testigo equivalente para
 * una app de solo botones es que React haya colgado sus props del nodo: hasta que eso no
 * ocurre, un clic cambia el DOM y no llega al estado, que es el mismo fallo silencioso.
 */
async function esperarHidratacionBotones(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) =>
        /Empezar el test/.test(b.textContent ?? ''),
      );
      if (!boton) return false;
      return Object.keys(boton).some(
        (k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'),
      );
    },
    null,
    { timeout: 20_000 },
  );
}

/** Las 10 respuestas de un perfil, cada una identificada por un trozo único de su texto. */
type Perfil = readonly [string, string, string, string, string, string, string, string, string, string];

async function abrirTest(page: Page): Promise<void> {
  await page.goto('/selector-smartphone/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

/** Marca una opción de la pregunta en pantalla y avanza. */
async function responder(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < perfil.length; i++) {
    await page.locator('[role="radiogroup"] button', { hasText: perfil[i] }).first().click();
    await page
      .getByRole('button', { name: i === perfil.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' })
      .click();
  }
}

/** El texto completo de la pantalla de resultado, ya normalizado. */
async function leerResultado(page: Page): Promise<string> {
  await page.getByRole('heading', { name: 'Tu smartphone ideal' }).waitFor();
  const texto = await page.locator('body').innerText();
  return texto.replace(/\s+/g, ' ');
}

// Perfiles usados. Los tramos de presupuesto se identifican por su descripción, porque las
// etiquetas comparten cifras entre sí («250 – 500 €» y «500 – 900 €»).
const SOLO_LLAMAR: Perfil = [
  'Uso básico', 'No juego o muy poco', 'Menos de 2 horas', 'No, ninguno', 'Windows',
  'Batería larga', '3 años', 'Me da igual', 'Precio mínimo', 'Sí, con garantía',
];
const EXIGENTE_SIN_DINERO: Perfil = [
  'Fotografía y vídeo', 'Gaming intenso', 'Más de 7 horas', 'No, ninguno', 'Windows',
  'Cámara de calidad', '4 años o más', 'Resistente', 'Precio mínimo', 'No, prefiero nuevo',
];
const EXIGENTE_PRESUPUESTO_MEDIO: Perfil = [
  'Fotografía y vídeo', 'Gaming intenso', 'Más de 7 horas', 'No, ninguno', 'Windows',
  'Cámara de calidad', '4 años o más', 'Resistente', 'Relación calidad-precio óptima', 'No, prefiero nuevo',
];
const SOLO_LLAMAR_CON_DINERO: Perfil = [
  'Uso básico', 'No juego o muy poco', 'Menos de 2 horas', 'No, ninguno', 'Windows',
  'Batería larga', '3 años', 'Me da igual', 'Quiero lo mejor disponible', 'Sí, con garantía',
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. CASO COHERENTE — el perfil mínimo debe bajar la recomendación, y la baja
// ─────────────────────────────────────────────────────────────────────────────

test('caso coherente: quien solo quiere llamar y que dure la batería recibe gama básica Android', async ({ page }) => {
  // Calculado a mano antes de ejecutar:
  //   puntosiOS      = −1 (Windows)                    → Android
  //   puntosGamaAlta = −3 (solo el tramo «Hasta 250 €») → básica, y el ajuste la confirma
  // Esperado: «Android» · «Gama básica» · «100 – 250 €».
  await abrirTest(page);
  await responder(page, SOLO_LLAMAR);
  const texto = await leerResultado(page);

  expect(texto).toContain('Android');
  expect(texto).toContain('Gama básica');
  expect(texto).toContain('100 – 250 €');
  expect(texto).not.toContain('iPhone (iOS)');
  expect(texto).not.toContain('Gama pro / flagship');

  // El pliego de características que corresponde a este perfil, íntegro y sin sobras.
  expect(texto).toContain('Actualizaciones del sistema operativo garantizadas: mínimo 3 años');
  expect(texto).toContain('Batería ≥ 5.000 mAh con carga rápida ≥ 45 W'); // pidió «Batería larga»
  expect(texto).toContain('Almacenamiento interno ≥ 128 GB');
  expect(texto).not.toContain('Procesador de gama alta'); // no juega: no debe pedirlo, y no lo pide

  // Y la razón que imprime SÍ describe lo que el usuario contestó.
  expect(texto).toContain('Tu uso declarado —llamadas, mensajería y navegación— se cubre sin problema');
  // Sin conflicto entre uso y presupuesto, no se inventa ningún aviso de recorte.
  expect(texto).not.toContain('pero la recomendación se ajusta al presupuesto');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CASO CONTRADICTORIO (presupuesto mínimo) — el tope actúa, pero en silencio
// ─────────────────────────────────────────────────────────────────────────────

test('caso contradictorio: con 250 € y exigencias máximas la app recorta Y LO DICE', async ({
  page,
}) => {
  // Calculado a mano: foto +2, gaming intenso +2, >7 h +2, cámara +2, 4 años o más +2 =
  // 10 puntos = «pro» por perfil, y el tope del tramo «Hasta 250 €» lo baja a «básica».
  //
  // Antes recortaba igual pero sin mencionar el conflicto, y la razón que imprimía («uso
  // básico») contradecía punto por punto lo que el usuario acababa de responder.
  await abrirTest(page);
  await responder(page, EXIGENTE_SIN_DINERO);
  const texto = await leerResultado(page);

  expect(texto).toContain('Gama básica');
  expect(texto).toContain('100 – 250 €');

  // La razón ya no atribuye un perfil que no se declaró, y el recorte se explica.
  expect(texto).not.toContain('Para un uso básico, la gama de entrada cubre perfectamente');
  expect(texto).toMatch(/presupuesto/i);
  expect(texto).toContain('hasta 250 €');

  // El pliego cuadra con la gama: nada que no quepa en 100 – 250 €.
  expect(texto).not.toContain('Procesador de gama alta de la generación más reciente disponible');
  expect(texto).not.toContain('Pantalla con tasa de refresco ≥ 120 Hz');
  expect(texto).not.toContain('mínimo 5 años');

  // Y no se le quita lo que sí necesita: estaban condicionados a `gama !== 'basica'`, así
  // que desaparecían justo en el perfil de gaming intenso con más de 7 h diarias.
  expect(texto).toContain('5G');
  expect(texto).toContain('NFC para pagos sin contacto');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CASO LÍMITE (presupuesto medio) — el tope existe en los cuatro tramos
// ─────────────────────────────────────────────────────────────────────────────

test('caso límite: con un presupuesto de 250 – 500 € la recomendación se queda en ese tramo', async ({
  page,
}) => {
  // Mismo perfil exigente que el caso 2, cambiando SOLO el tramo al intermedio: 10 puntos
  // → «pro» por perfil. El ajuste solo contemplaba «Hasta 250 €» y «Más de 900 €», así que
  // aquí no intervenía nadie y se recomendaba «Gama pro / flagship — 900 – 1.500+ €»,
  // entre dos y seis veces el presupuesto declarado, sin una línea sobre el desfase.
  await abrirTest(page);
  await responder(page, EXIGENTE_PRESUPUESTO_MEDIO);
  const texto = await leerResultado(page);

  expect(texto).toContain('Gama media');
  expect(texto).toContain('250 – 500 €');
  expect(texto).not.toContain('Gama pro / flagship');
  // Y el desfase se nombra, con la gama que pedía el uso.
  expect(texto).toMatch(/presupuesto/i);
  expect(texto).toContain('900 – 1.500+ €'); // la que pedía el perfil, citada en el aviso
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. CASO DE ESTABILIDAD — repetir es estable; cambiar una respuesta, no
// ─────────────────────────────────────────────────────────────────────────────

test('caso de estabilidad: el mismo perfil repite resultado, pero una sola respuesta distinta salta los cuatro escalones', async ({ page }) => {
  test.setTimeout(90_000); // recorre el cuestionario de diez preguntas tres veces

  // 4.a — Sin responder nada no se puede avanzar ni llegar al resultado.
  await abrirTest(page);
  const siguiente = page.getByRole('button', { name: 'Siguiente pregunta' });
  const anterior = page.getByRole('button', { name: 'Pregunta anterior' });
  await expect(siguiente).toBeDisabled();
  await expect(anterior).toBeDisabled();
  await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();

  // 4.b — Volver atrás conserva la respuesta marcada y permite cambiarla.
  await page.locator('[role="radiogroup"] button', { hasText: 'Uso básico' }).first().click();
  await siguiente.click();
  await page.locator('[role="radiogroup"] button', { hasText: 'No juego o muy poco' }).first().click();
  await anterior.click();
  // Los botones son role="radio" con aria-checked: la elección es ÚNICA entre cuatro, no
  // un conmutador, y el contenedor declaraba radiogroup sin un solo radio dentro.
  await expect(page.locator('[role="radiogroup"] [role="radio"][aria-checked="true"]')).toHaveText(
    /Uso básico/,
  );

  // 4.c — El mismo perfil, dos veces seguidas, da exactamente el mismo resultado.
  await page.goto('/selector-smartphone/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
  await responder(page, SOLO_LLAMAR);
  const primera = await leerResultado(page);

  await page.getByRole('button', { name: 'Repetir el test' }).click();
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
  await responder(page, SOLO_LLAMAR);
  const segunda = await leerResultado(page);

  expect(segunda).toContain('Gama básica');
  expect(segunda).toContain('100 – 250 €');
  expect(primera.includes('Gama básica')).toBe(segunda.includes('Gama básica'));

  // 4.d — Desde ese mismo perfil se cambia UNA sola respuesta: el tramo de presupuesto pasa
  // de «Hasta 250 €» a «Más de 900 €». Todo lo demás sigue diciendo uso básico, sin juegos,
  // menos de dos horas al día.
  //
  // Sigue subiendo a flagship —el usuario ha dicho que quiere gastar eso— pero ahora lo
  // justifica por el presupuesto, que es lo único que ha cambiado, y dice expresamente que
  // su uso se cubriría con menos. Antes inventaba el motivo, porque la razón se generaba a
  // partir de la gama de salida y no de las respuestas.
  await page.getByRole('button', { name: 'Repetir el test' }).click();
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
  await responder(page, SOLO_LLAMAR_CON_DINERO);
  const tercera = await leerResultado(page);

  expect(tercera).toContain('Gama pro / flagship');
  expect(tercera).toContain('900 – 1.500+ €');

  // Este usuario respondió «Uso básico», «No juego o muy poco» y «Menos de 2 horas»: no se
  // le puede atribuir un perfil intenso.
  expect(tercera).not.toContain('Tu perfil de uso intenso o de fotografía avanzada');
  expect(tercera).toMatch(/presupuesto/i);
  expect(tercera).toContain('no te dejaría corto');
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Los hallazgos de forma: accesibilidad, ámbito y promesas del metadata
// ─────────────────────────────────────────────────────────────────────────────

test('la barra de progreso anuncia lo mismo que pinta', async ({ page }) => {
  await abrirTest(page);

  // aria-valuenow era el número de pregunta (paso + 1) mientras el relleno visible es
  // paso / total: las dos lecturas iban desfasadas un paso entero (hallazgo 951).
  const barra = page.locator('[role="progressbar"]');
  const relleno = page.locator('[class*="progresoRelleno"]');

  const leer = async () => ({
    anunciado: Number(await barra.getAttribute('aria-valuenow')),
    maximo: Number(await barra.getAttribute('aria-valuemax')),
    pintado: Number(await relleno.getAttribute('data-progreso')),
  });

  const inicio = await leer();
  expect(inicio.anunciado / inicio.maximo).toBeCloseTo(inicio.pintado / 100, 6);
  // Y el texto para lectores sigue diciendo en qué pregunta se está.
  await expect(barra).toHaveAttribute('aria-valuetext', 'Pregunta 1 de 10');

  await page.locator('[role="radio"]').first().click();
  await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  const segunda = await leer();
  expect(segunda.anunciado / segunda.maximo).toBeCloseTo(segunda.pintado / 100, 6);
  expect(segunda.anunciado).toBeGreaterThan(inicio.anunciado);
});

test('el grupo de opciones tiene radios de verdad dentro', async ({ page }) => {
  await abrirTest(page);

  // Declaraba role="radiogroup" y ninguno de sus hijos era un radio: eran <button> con
  // aria-pressed, que comunica un conmutador allí donde la semántica es elección única
  // entre cuatro (hallazgo 950).
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);

  await grupo.locator('[role="radio"]').first().click();
  await expect(grupo.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);
});

test('el ámbito geográfico se declara, y el aviso se dirige al público general', async ({
  page,
}) => {
  await page.goto('/selector-smartphone/');
  await esperarHidratacionBotones(page);

  // Las cuatro horquillas están en euros y el bloque educativo cita campañas y normativa
  // de la UE, en una app NO fiscal que no montaba RegionBadge (hallazgo 949).
  await expect(page.getByText(/Datos de referencia: España/)).toBeVisible();

  // El aviso usaba variant="technical", cuyo texto declara un público que no es el de un
  // test de consumo sobre qué móvil comprar (hallazgo 952).
  const cuerpo = await page.locator('body').innerText();
  expect(cuerpo).not.toContain('dirigida a profesionales del dominio');
  expect(cuerpo).toContain('tiene carácter orientativo');
});

test('el HTML servido no promete modelos concretos que la app no da', async ({ page }) => {
  // «Modelos de referencia actualizados» seguía en la meta description, en openGraph, en
  // la description del schema y como feature, mientras el FAQPage de la misma página lo
  // desmentía. Es lo que ven Google, Bing y los modelos que leen el JSON-LD (hallazgo 946).
  const respuesta = await page.request.get('/selector-smartphone/');
  const html = await respuesta.text();
  expect(html).not.toContain('Modelos de referencia');

  // Y las horquillas del FAQPage son las mismas que la app muestra en pantalla (947).
  expect(html).toContain('250-500 €');
  expect(html).toContain('500-900 €');
  expect(html).not.toContain('250-600 €');
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Hero de la pantalla de resultado (defecto de familia, 24/09/2026)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contraste MÍNIMO del texto de un elemento contra su fondo real: en cada esquina de cada línea
 * del texto (un Range, no la caja del bloque), con la opacidad acumulada del elemento y sus
 * ancestros, sobre las capas de fondo compuestas hasta la primera opaca. Si una capa es un
 * degradado lineal, se evalúa en ese mismo punto (así se mide también el defecto de antes).
 */
async function contrasteMinimo(page: Page, selector: string): Promise<number> {
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

test('el hero del resultado usa --hero-bg y su texto llega al contraste mínimo en los dos temas', async ({ page }) => {
  // Antes: linear-gradient(135deg, var(--primary), var(--secondary)) con texto blanco. En el
  // extremo teal, el subtítulo (1rem, opacidad 0,88) quedaba en 2,82:1 en claro y 2,19 en oscuro,
  // y el <h1> (texto grande, exige 3:1) en 2,45 en oscuro. Es el hallazgo 1444 de
  // selector-mascota, defecto de familia (regla b): el hero de resultado lleva var(--hero-bg),
  // #1a5278 en los dos temas, igual que el de la intro.
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await abrirTest(page);
  await responder(page, SOLO_LLAMAR);
  await leerResultado(page);
  const hero = page.locator('[class*="heroResultados"]');
  for (const tema of ['claro', 'oscuro'] as const) {
    if (tema === 'oscuro') {
      await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    }
    // Sin transiciones en marcha: justo tras cambiar de tema, getComputedStyle aún da el fondo anterior
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
    expect(await hero.evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).backgroundImage]), tema)
      .toEqual(['rgb(26, 82, 120)', 'none']);
    expect(await contrasteMinimo(page, '[class*="heroResultados"] p'), `subtítulo, ${tema}`).toBeGreaterThanOrEqual(4.5);
    expect(await contrasteMinimo(page, '[class*="heroResultados"] h1'), `h1, ${tema}`).toBeGreaterThanOrEqual(3);
  }
});
