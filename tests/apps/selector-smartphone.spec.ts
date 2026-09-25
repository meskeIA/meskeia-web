import { test, expect, Page, devices } from '@playwright/test';

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

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 25/09/2026
// ═════════════════════════════════════════════════════════════════════════════
//
// El motor ya no vive en page.tsx: está en `app/selector-smartphone/motor.ts` desde 4fe972a2.
// Sus reglas, que es de donde sale cada valor esperado de abajo:
//
//   puntosiOS       P4 «Sí, varios» +3 · «Alguno» +1 · P5 macOS +2 · Windows −1 → iOS si ≥ 3
//   puntosGamaAlta  P1 foto +2 · trabajo +1 · P2 intenso +2 · «Con frecuencia» +1
//                   P3 >7 h +2 · 4-7 h +1 · P6 cámara +2 · rendimiento +1 · P7 «4 años o más» +2
//                   ≥ 7 pro · ≥ 4 alta · ≥ 1 media · resto básica   (el presupuesto YA NO suma)
//   TOPE            «Hasta 250 €» básica · «250 – 500 €» media · «500 – 900 €» alta · «Más de 900 €» pro
//                   recorta si la del perfil es MAYOR que el tope (igual no es recorte)
//   AMPLÍA          solo «Más de 900 €» con un perfil que no llega a pro
//
// Todos los valores esperados se resolvieron a mano ANTES de abrir el navegador.

/** Recorre el test tocando (móvil) en vez de pulsar. */
async function responderTocando(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < perfil.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]', { hasText: perfil[i] }).first().tap();
    await page
      .getByRole('button', { name: i === perfil.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' })
      .tap();
  }
}

/** Los textos de un bloque de la pantalla de resultado, en orden. */
async function textos(page: Page, clase: string): Promise<string[]> {
  return page
    .locator(`[class*="${clase}"]`)
    .evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()));
}

// P1 trabajo +1 · P2 casual 0 · P3 4-7 h +1 · P6 rendimiento +1 · P7 4 años o más +2 = 5 → alta.
// P4 «No, ninguno» y P5 Linux: puntosiOS 0 → Android. Tope de «500 – 900 €» = alta: sin recorte.
const INTERMEDIO: Perfil = [
  'Trabajo y productividad', 'Casual', '4 – 7 horas', 'No, ninguno', 'Linux',
  'Rendimiento fluido', '4 años o más', 'Compacto', 'Dispuesto a pagar por calidad', 'Tal vez',
];
// P1 foto +2 · P2 intenso +2 · P3 4-7 h +1 · P6 cámara +2 · P7 2-3 años 0 = 7 → pro (umbral justo).
// P4 «Sí, varios» +3 · P5 macOS +2 = 5 → iOS. Tope de «Hasta 250 €» = básica: recorta de pro a básica.
const EXIGENTE_APPLE_250: Perfil = [
  'Fotografía y vídeo', 'Gaming intenso', '4 – 7 horas', 'Sí, varios', 'macOS',
  'Cámara de calidad', '2 – 3 años', 'Pantalla grande', 'Precio mínimo', 'No, prefiero nuevo',
];
// Frontera alta/media. P1 foto +2 · P6 cámara +2 = 4 → alta (el umbral es ≥ 4)…
const FRONTERA_4: Perfil = [
  'Fotografía y vídeo', 'No juego o muy poco', 'Menos de 2 horas', 'No, ninguno', 'Linux',
  'Cámara de calidad', '1 – 2 años', 'Me da igual', 'Dispuesto a pagar por calidad', 'Sí, con garantía',
];
// …y cambiando SOLO P1 a trabajo (+1): 3 → media.
const FRONTERA_3: Perfil = ['Trabajo y productividad', ...FRONTERA_4.slice(1)] as unknown as Perfil;

test.describe('re-inspección 25/09/2026 · casos resueltos a mano', () => {
  test('caso normal: perfil intermedio con 500 – 900 € → Android, gama alta, sin aviso y el pliego de su perfil', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INTERMEDIO);
    await leerResultado(page);

    expect(await textos(page, 'recomendacionValor')).toEqual(['Android', 'Gama alta']);
    await expect(page.locator('[class*="recomendacionDesc"] strong')).toHaveText('Precio orientativo: 500 – 900 €');
    // alta = tope de alta: no es recorte, y no se amplía (el tramo no es «Más de 900 €").
    await expect(page.locator('[class*="avisoPresupuesto"]')).toHaveCount(0);
    expect(await textos(page, 'razonItem')).toEqual([
      'Android ofrece más variedad de modelos, marcas y precios que se adaptan a cualquier necesidad.',
      'Mayor libertad de personalización y compatibilidad con ecosistemas no Apple (Google, Microsoft…).',
      'La gama alta te ofrece cámaras con teleobjetivo, pantallas de 120 Hz y rendimiento sólido sin llegar al precio máximo.',
      'Buscar modelos con varios años de actualizaciones garantizadas prolonga la vida útil del dispositivo.',
    ]);
    // Consejos: «Tal vez» → reacondicionado · «4 años o más» → ficha técnica · batería siempre.
    // Sin 🛒 (solo tramos bajo y medio) ni 📷 (no pidió cámara).
    const consejos = await textos(page, 'consejoItem');
    expect(consejos.map((c) => c.split(' ')[0])).toEqual(['💡', '📅', '🔋']);
    expect(await textos(page, 'caracteristicaItem')).toEqual([
      '🔄 Actualizaciones del sistema operativo garantizadas: mínimo 5 años desde la compra', // largo y no es entrada
      '🔋 Batería ≥ 4.500 mAh con carga rápida ≥ 30 W', // 4-7 h
      '⚡ Procesador de gama alta de la generación más reciente disponible', // «Rendimiento fluido»
      '🖥️ Pantalla con tasa de refresco ≥ 120 Hz',
      '💾 RAM ≥ 8 GB',
      "📐 Formato compacto: pantalla ≤ 6,2'' (evita las variantes «Plus», «XL» o «Ultra»)",
      '📡 NFC para pagos sin contacto (verifica disponibilidad en tu región)',
      '📶 Conectividad 5G',
      '💾 Almacenamiento interno ≥ 256 GB (o ≥ 128 GB con ranura microSD)',
    ]);
  });

  test('caso límite: exigente (7 puntos, pro) con «Hasta 250 €» → manda el presupuesto, y lo dice', async ({ page }) => {
    await abrirTest(page);
    await responder(page, EXIGENTE_APPLE_250);
    await leerResultado(page);

    expect(await textos(page, 'recomendacionValor')).toEqual(['iPhone (iOS)', 'Gama básica']);
    await expect(page.locator('[class*="recomendacionDesc"] strong')).toHaveText('Precio orientativo: 100 – 250 €');
    await expect(page.locator('[class*="avisoPresupuesto"]')).toHaveText(
      '💶 Tu uso apuntaba a la gama pro / flagship (900 – 1.500+ €), pero la recomendación se ajusta al presupuesto que has declarado. Lo que sigue es lo mejor que cabe en tu tramo.',
    );
    const razones = await textos(page, 'razonItem');
    expect(razones[2]).toBe(
      'Tus respuestas sobre uso apuntaban a la gama pro o flagship, pero has declarado un presupuesto hasta 250 €: manda el presupuesto, así que la recomendación se ajusta a lo que cabe en ese tramo.',
    );
    // «No, prefiero nuevo» + recorte → ♻️ · tramo bajo → 🛒 · cámara → 📷 · batería siempre.
    expect((await textos(page, 'consejoItem')).map((c) => c.split(' ')[0])).toEqual(['♻️', '🛒', '📷', '🔋']);
    // El pliego, escrito para la gama FINAL (básica), no para la del perfil.
    expect(await textos(page, 'caracteristicaItem')).toEqual([
      '🔄 Actualizaciones del sistema operativo garantizadas: mínimo 3 años',
      '🔋 Batería ≥ 4.500 mAh con carga rápida ≥ 30 W',
      '📷 Cámara principal con estabilización óptica si la encuentras: en este tramo no hay teleobjetivo, y el zoom será digital',
      '⚡ El procesador más potente que encuentres en este tramo; para juegos exigentes tendrás que bajar la calidad gráfica',
      '🖥️ Pantalla de 90 Hz si la hay: los 120 Hz empiezan en la gama media',
      "📐 Pantalla ≥ 6,5'' con tecnología AMOLED o equivalente",
      '📡 NFC para pagos sin contacto (verifica disponibilidad en tu región)',
      '📶 Conectividad 5G: en este tramo no está en todos los modelos, compruébalo en la ficha',
      '💾 Almacenamiento interno ≥ 128 GB',
    ]);
  });

  test('caso frontera: 4 puntos es gama alta y 3 es media, y un tope igual a la gama no es recorte', async ({ page }) => {
    test.setTimeout(60_000);
    await abrirTest(page);
    await responder(page, FRONTERA_4);
    await leerResultado(page);
    expect(await textos(page, 'recomendacionValor')).toEqual(['Android', 'Gama alta']);
    await expect(page.locator('[class*="recomendacionDesc"] strong')).toHaveText('Precio orientativo: 500 – 900 €');
    await expect(page.locator('[class*="avisoPresupuesto"]')).toHaveCount(0);
    expect((await textos(page, 'razonItem'))[2]).toBe(
      'La gama alta te ofrece cámaras con teleobjetivo, pantallas de 120 Hz y rendimiento sólido sin llegar al precio máximo.',
    );

    await abrirTest(page);
    await responder(page, FRONTERA_3);
    await leerResultado(page);
    expect(await textos(page, 'recomendacionValor')).toEqual(['Android', 'Gama media']);
    await expect(page.locator('[class*="recomendacionDesc"] strong')).toHaveText('Precio orientativo: 250 – 500 €');
    // Con 500 – 900 € y un perfil de media no hay aviso: solo «Más de 900 €» amplía.
    await expect(page.locator('[class*="avisoPresupuesto"]')).toHaveCount(0);
    expect((await textos(page, 'razonItem'))[2]).toBe(
      'La gama media actual es notable: procesadores rápidos, cámaras decentes y autonomía de todo el día.',
    );
  });

  test('robustez: volver de la 10 a la 9 y bajar el presupuesto recalcula con la respuesta NUEVA', async ({ page }) => {
    // FRONTERA_4 (alta por perfil) hasta la pregunta 10, y desde ahí «Anterior» y «250 – 500 €».
    // Esperado: 4 puntos → alta > tope media → recorte a media, con el aviso que cita la alta.
    await abrirTest(page);
    for (let i = 0; i < 10; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]', { hasText: FRONTERA_4[i] }).first().click();
      if (i < 9) await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    await page.getByRole('button', { name: 'Pregunta anterior' }).click();
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveText(/500 – 900 €/);
    await page.locator('[role="radiogroup"] [role="radio"]', { hasText: 'Relación calidad-precio óptima' }).click();
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    // La 10 conserva lo que ya se había contestado.
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveText(/Sí, con garantía/);
    await page.getByRole('button', { name: 'Ver resultado' }).click();
    await leerResultado(page);

    expect(await textos(page, 'recomendacionValor')).toEqual(['Android', 'Gama media']);
    await expect(page.locator('[class*="recomendacionDesc"] strong')).toHaveText('Precio orientativo: 250 – 500 €');
    await expect(page.locator('[class*="avisoPresupuesto"]')).toContainText('Tu uso apuntaba a la gama alta (500 – 900 €)');
    expect((await textos(page, 'razonItem'))[2]).toContain('has declarado un presupuesto de 250 a 500 €');
    // «Sí, con garantía» → 💡 · tramo medio → 🛒 (no estaba con 500 – 900 €) · cámara → 📷 · 🔋.
    expect((await textos(page, 'consejoItem')).map((c) => c.split(' ')[0])).toEqual(['💡', '🛒', '📷', '🔋']);
    expect(await textos(page, 'caracteristicaItem')).toContain('📷 Cámara principal con apertura ≤ f/1,9 y modo noche incluido');
  });

  test('robustez: «Repetir el test» sin recargar vuelve a cero y no arrastra el aviso anterior', async ({ page }) => {
    test.setTimeout(60_000);
    await abrirTest(page);
    await responder(page, EXIGENTE_APPLE_250); // deja un aviso de recorte en pantalla
    await leerResultado(page);
    await expect(page.locator('[class*="avisoPresupuesto"]')).toHaveCount(1);

    await page.getByRole('button', { name: 'Repetir el test' }).click();
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '0');
    // Ninguna pregunta llega con una respuesta de la vuelta anterior.
    for (let i = 0; i < 10; i++) {
      await expect(page.locator('[role="radio"][aria-checked="true"]'), `pregunta ${i + 1}`).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: i === 9 ? 'Ver resultado' : 'Siguiente pregunta' }),
      ).toBeDisabled();
      await page.locator('[role="radiogroup"] [role="radio"]', { hasText: FRONTERA_3[i] }).first().click();
      await page.getByRole('button', { name: i === 9 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
    }
    await leerResultado(page);
    // FRONTERA_3: 3 puntos → media, 500 – 900 € → sin recorte. Nada de iPhone ni del aviso de antes.
    expect(await textos(page, 'recomendacionValor')).toEqual(['Android', 'Gama media']);
    await expect(page.locator('[class*="avisoPresupuesto"]')).toHaveCount(0);
  });

  test('iPhone con presupuesto de gama básica: no hay iPhone nuevo en ese tramo, y la app lo dice', async ({ page }) => {
    // HALLAZGO 1678, reparado. El sistema operativo se decide solo con P4 y P5; el presupuesto no lo
    // mira nunca. Resultado: «iPhone (iOS)» junto a «Gama básica · 100 – 250 €» a quien acaba de
    // responder «No, prefiero nuevo», y el iPhone nuevo más barato de apple.com/es es el iPhone 17e,
    // «Desde 859,00 €» (consultado el 25/09/2026). Barrido del motor: 91.392 de los 147.456
    // perfiles que salen iOS (62 %) reciben gama básica o media, 30.464 de ellos con «prefiero
    // nuevo». Debería: o avisar de que en ese tramo solo hay iPhone reacondicionado / ninguno
    // nuevo, o no proponer iPhone nuevo donde no existe.
    await abrirTest(page);
    await responder(page, EXIGENTE_APPLE_250);
    const texto = await leerResultado(page);
    expect(texto).toContain('iPhone (iOS)');
    expect(texto).toContain('Precio orientativo: 100 – 250 €');
    expect(texto, 'la pantalla dice algo del precio real del iPhone en ese tramo').toMatch(
      /iPhone[^.]{0,160}(nuevo|reacondicionad)/i,
    );
    // Reparación: la gama se queda en el tramo declarado (manda el presupuesto) y un aviso dice
    // que ahí no hay iPhone nuevo. Con «No, prefiero nuevo» ofrece subir de tramo o Android nuevo.
    await expect(page.locator('[class*="avisoSistema"]')).toHaveText(
      '🍎 Apple no vende ningún iPhone nuevo en este tramo: el más barato de su tienda supera los 500 €. Como prefieres comprar nuevo, las salidas son subir de tramo o elegir un Android nuevo de esta gama; si lo reconsideras, un iPhone reacondicionado certificado sí puede caber en tu presupuesto.',
    );
  });

  test('iPhone con uso modesto y 500 – 900 €: la gama sube a la del iPhone nuevo más barato, y lo dice', async ({ page }) => {
    // Segundo caso del 1678. P1 básico · P2 no juego · P3 < 2 h · P6 batería · P7 1-2 años = 0
    // puntos → básica por uso. P4 «Sí, varios» +3 · P5 macOS +2 = 5 → iOS. Tope de 500 – 900 € =
    // alta. Antes: «iPhone (iOS)» + «Gama básica · 100 – 250 €», cuando el iPhone nuevo más
    // barato de apple.com/es sale «Desde 859,00 €» (25/09/2026) y el presupuesto sí lo alcanza.
    // Esperado: gama alta (500 – 900 €), con el porqué en el aviso y en las razones.
    await abrirTest(page);
    await responder(page, [
      'Uso básico', 'No juego o muy poco', 'Menos de 2 horas', 'Sí, varios', 'macOS',
      'Batería larga', '1 – 2 años', 'Me da igual', 'Dispuesto a pagar por calidad', 'Sí, con garantía',
    ]);
    await leerResultado(page);
    expect(await textos(page, 'recomendacionValor')).toEqual(['iPhone (iOS)', 'Gama alta']);
    await expect(page.locator('[class*="recomendacionDesc"] strong')).toHaveText('Precio orientativo: 500 – 900 €');
    await expect(page.locator('[class*="avisoPresupuesto"]')).toHaveCount(0);
    await expect(page.locator('[class*="avisoSistema"]')).toHaveText(
      '🍎 Con tu uso bastaría la gama básica, pero Apple no vende ningún iPhone nuevo en ese tramo: la recomendación sube a la gama alta, que es donde empieza el iPhone nuevo y que tu presupuesto cubre.',
    );
    expect((await textos(page, 'razonItem'))[2]).toContain('un Android de gama básica cubriría tu uso por menos');
  });

  test('Android con el mismo uso modesto y 500 – 900 €: sin aviso de sistema, se queda en básica', async ({ page }) => {
    // Contraste del anterior: la subida es SOLO por el iPhone. P4 «No, ninguno» → Android.
    await abrirTest(page);
    await responder(page, [
      'Uso básico', 'No juego o muy poco', 'Menos de 2 horas', 'No, ninguno', 'macOS',
      'Batería larga', '1 – 2 años', 'Me da igual', 'Dispuesto a pagar por calidad', 'Sí, con garantía',
    ]);
    await leerResultado(page);
    expect(await textos(page, 'recomendacionValor')).toEqual(['Android', 'Gama básica']);
    await expect(page.locator('[class*="avisoSistema"]')).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Invariante de la familia, con TECLADO (el testigo de familia solo hace clic)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('re-inspección 25/09/2026 · teclado', () => {
  test('Espacio marca el radio con el foco, la flecha pasa al siguiente, y sigue habiendo uno solo marcado', async ({ page }) => {
    // Antes decía «Tab pasa al siguiente»: eso consagraba el defecto 1681 (cada opción era una
    // parada de Tab). En el patrón de radios el grupo es UNA parada y se recorre con flechas;
    // el fondo del test —Espacio marca, uno solo marcado, Enter avanza— se conserva.
    await abrirTest(page);
    const radios = page.locator('[role="radiogroup"] [role="radio"]');
    await radios.nth(0).focus();
    await page.keyboard.press('Space');
    await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(radios.nth(1)).toBeFocused();
    await page.keyboard.press('Space');
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('[role="radiogroup"] [aria-checked="true"]')).toHaveCount(1);
    // Y Enter en «Siguiente» avanza con la respuesta dada por teclado.
    await page.getByRole('button', { name: 'Siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible();
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '1');
  });

  test('las flechas mueven la selección dentro del radiogroup, y el grupo es una sola parada de Tab', async ({ page }) => {
    // HALLAZGO 1681 (bajo), reparado. Un role="radio" promete el teclado del patrón de radios (WAI-ARIA
    // APG): flecha abajo/derecha lleva el foco a la opción siguiente y la marca, y el grupo es UNA
    // parada de Tab. Aquí son <button> sueltos: las flechas no hacen nada y cada opción es una
    // parada de Tab. Medido: ArrowDown y ArrowRight sobre «Uso básico» → el foco no se mueve y no
    // se marca nada. Mismo armazón en las 11 hermanas.
    await abrirTest(page);
    const radios = page.locator('[role="radiogroup"] [role="radio"]');
    await radios.nth(0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(radios.nth(1)).toBeFocused({ timeout: 1_000 });
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true', { timeout: 1_000 });
    // ArrowRight sigue avanzando; Inicio va a la primera y ArrowUp desde ella da la vuelta a la última.
    await page.keyboard.press('ArrowRight');
    await expect(radios.nth(2)).toBeFocused();
    await expect(radios.nth(2)).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowUp');
    await expect(radios.nth(3)).toBeFocused();
    await expect(page.locator('[role="radiogroup"] [aria-checked="true"]')).toHaveCount(1);
    // Tabindex itinerante: solo la marcada es parada de Tab, así que Tab sale del grupo (en la
    // pregunta 1 «Anterior» está desactivado: la siguiente parada es «Siguiente»).
    expect(await radios.evaluateAll((els) => els.map((e) => (e as HTMLElement).tabIndex))).toEqual([-1, -1, -1, 0]);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeFocused();
  });

  test('tras «Siguiente» el foco queda en la pregunta nueva, y el Tab va a sus opciones', async ({ page }) => {
    // HALLAZGO 1680 (medio), reparado: el foco va al enunciado de la pregunta nueva. «Siguiente» se desactiva en cuanto llega la pregunta nueva (aún
    // sin responder) y el foco, que estaba en él, cae a <body>. El siguiente Tab sale DESPUÉS del
    // cuestionario: primera tarjeta de «Apps relacionadas». Medido: 18 Tab para volver a la
    // primera opción, en cada una de las 9 transiciones. Debería quedar dentro de la pregunta
    // nueva (su enunciado o su primera opción). Mismo armazón en las 11 hermanas.
    await abrirTest(page);
    await page.locator('[role="radiogroup"] [role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Pregunta 2 de 10').first()).toBeVisible();
    const dentro = await page.evaluate(() => !!document.activeElement?.closest('[class*="testContainer"]'));
    expect(dentro, 'el foco sigue dentro del cuestionario').toBe(true);
    await expect(page.getByRole('heading', { name: '¿Juegas habitualmente a videojuegos en el móvil?' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('[role="radiogroup"] [role="radio"]').first()).toBeFocused();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Móvil: invariante de familia con toques y la pantalla a la que se llega
// ─────────────────────────────────────────────────────────────────────────────

test.describe('re-inspección 25/09/2026 · móvil (Pixel 7)', () => {
  test.use({
    viewport: { width: 412, height: 839 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('con toques: un solo radio marcado y la barra pinta en píxeles lo que anuncia, en las 10 preguntas', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-smartphone/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    const barra = page.locator('[role="progressbar"]');
    for (let i = 0; i < 10; i++) {
      await expect(page.getByText(`Pregunta ${i + 1} de 10`).first()).toBeVisible();
      // Anunciado: (valuenow − valuemin) / (valuemax − valuemin) = i / 10.
      const [ahora, min, max] = await Promise.all(
        ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
      );
      expect((ahora - min) / (max - min), `anunciado en la pregunta ${i + 1}`).toBeCloseTo(i / 10, 6);
      await expect
        .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
        .toBeCloseTo(i / 10, 2);
      const radios = page.locator('[role="radiogroup"] [role="radio"]');
      await radios.nth(1).tap();
      await radios.nth(0).tap();
      await expect(page.locator('[role="radiogroup"] [aria-checked="true"]')).toHaveCount(1);
      await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await page.getByRole('button', { name: i === 9 ? 'Ver resultado' : 'Siguiente pregunta' }).tap();
    }
    await page.getByRole('heading', { name: 'Tu smartphone ideal' }).waitFor();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test('al tocar «Ver resultado» se ve el encabezado del resultado y tiene el foco', async ({ page }) => {
    // HALLAZGO 1679 (medio), reparado con la forma de las hermanas (foco al encabezado). El resultado sustituye al cuestionario en el sitio y la página
    // se queda desplazada: en un Pixel 7 se aterriza en scrollY 2.576, viendo el final de los
    // consejos, «Repetir el test», la guía y «Apps relacionadas»; las tarjetas de sistema y gama
    // quedan 1.912 px por ENCIMA del borde superior. El foco cae a <body>. Las otras diez hermanas
    // llevan el foco al encabezado del resultado (tituloResultado.current?.focus()); la app de
    // referencia no. Debería verse el encabezado «Tu smartphone ideal» al llegar.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-smartphone/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    await responderTocando(page, FRONTERA_4);
    const titulo = page.getByRole('heading', { name: 'Tu smartphone ideal' });
    await titulo.waitFor();
    await expect(titulo).toBeInViewport({ timeout: 2_000 });
    await expect(titulo).toBeFocused();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contraste fuera del hero, y lo que se sirve a buscadores
// ─────────────────────────────────────────────────────────────────────────────

test('botones de marca y textos pequeños llegan a 4,5:1 (--primary-boton / --primary-texto)', async ({ page }) => {
  // HALLAZGO 1682 (medio), reparado. Medido sobre el fondo computado, con la función de arriba:
  //   «Empezar el test →» (16,8 px/600, blanco sobre el degradado --primary→--secondary)
  //       3,21:1 en claro · 2,42:1 en oscuro
  //   «Siguiente →» (14,4 px/600, mismo degradado)            3,26:1 claro · 2,45:1 oscuro
  //   «Pregunta N de 10» (13,6 px/600, --primary sobre #FAFAFA)   3,93:1 claro
  //   «Por qué esta recomendación» (14,4 px/700, --primary)       3,67:1 claro
  //   «← Repetir el test» (15,2 px/600, --primary)                3,93:1 claro
  // Ninguno es texto grande: todos exigen 4,5:1. Es la forma que se reparó en las hermanas con
  // --primary-boton / --primary-texto (mascota 1343, portátil 1414 y 1419); en la app de
  // referencia sigue igual.
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/selector-smartphone/');
  await esperarHidratacionBotones(page);
  const medidas: Record<string, number> = {};
  medidas['Empezar, claro'] = await contrasteMinimo(page, '[class*="btnStart"]');
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.locator('[role="radio"]').first().click();
  medidas['Pregunta N de 10, claro'] = await contrasteMinimo(page, '[class*="progresoPaso"]');
  medidas['Siguiente, claro'] = await contrasteMinimo(page, '[class*="btnSiguiente"]');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
  medidas['Siguiente, oscuro'] = await contrasteMinimo(page, '[class*="btnSiguiente"]');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  // Preguntas 2 a 10 (la 1 ya está respondida): 0 puntos → básica con «Hasta 250 €», sin aviso.
  const resto: string[] = ['No juego o muy poco', 'Menos de 2 horas', 'No, ninguno', 'Linux', 'Batería larga',
    '1 – 2 años', 'Me da igual', 'Precio mínimo', 'Sí, con garantía'];
  for (let i = 0; i < resto.length; i++) {
    await page.locator('[role="radiogroup"] button', { hasText: resto[i] }).first().click();
    await page.getByRole('button', { name: i === 8 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await leerResultado(page);
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'));
  medidas['Por qué esta recomendación, claro'] = await contrasteMinimo(page, '[class*="razonesTitulo"]');
  medidas['Repetir el test, claro'] = await contrasteMinimo(page, '[class*="btnRepetir"]');
  const bajos = Object.entries(medidas).filter(([, r]) => r < 4.5).map(([k, r]) => `${k}: ${r.toFixed(2)}:1`);
  expect(bajos, 'textos por debajo de 4,5:1').toEqual([]);
});

test('el HTML servido no promete «modelos de referencia» en ninguna capitalización (hallazgo 946)', async ({ page }) => {
  // HALLAZGO 1683 (medio), reparado. El test de arriba busca 'Modelos de referencia' con mayúscula y
  // pasa; en minúscula sigue en DOS de los cuatro sitios del acta del 20/09: og:description
  // («sistema operativo, gama y modelos de referencia») y la meta schema:WebApplication
  // («Incluye modelos de referencia actualizados»). La app no da ningún modelo. Debería: 0.
  const html = (await (await page.request.get('/selector-smartphone/')).text()).toLowerCase();
  expect(html).not.toContain('modelos de referencia');
});

test('el JSON-LD WebApplication lleva entre 4 y 8 featureList', async ({ page }) => {
  // HALLAZGO 1686 (bajo), reparado. §1.ter del CLAUDE.md del proyecto: `features` con 4-8
  // características reales. El `jsonLd` que inyecta layout.tsx lleva `features: []`; las ocho
  // que hay en metadata.ts viven solo en la meta no estándar schema:WebApplication.
  const html = await (await page.request.get('/selector-smartphone/')).text();
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]) as Record<string, unknown>,
  );
  const app = bloques.find((b) => b['@type'] === 'WebApplication');
  expect(app, 'hay un WebApplication').toBeTruthy();
  expect(((app?.featureList ?? []) as unknown[]).length).toBeGreaterThanOrEqual(4);
  expect(((app?.featureList ?? []) as unknown[]).length).toBeLessThanOrEqual(8);
});

test('la banda de Delegum dice «Esta herramienta aplica a España» justo bajo «La metodología es universal»', async ({ page }) => {
  // REPARADO el 25/09/2026 (hallazgo 1685, commit d5e27a43): es-data solo lleva banda en las
  // suites de Delegum, y allí sin declarar ámbito. Antes: Efecto colateral del arreglo del 949: scripts/generate-delegum-es.mjs
  // toma CUALQUIER RegionBadge es-data como «autodeclaración fiscal-España» (d087d679, 20/09), y
  // components/DescubreVertical.tsx pinta entonces «⚖️ Esta herramienta aplica a España. Delegum
  // reúne más herramientas de fiscalidad, derecho laboral y finanzas». En un selector de móvil,
  // debajo de un aviso que dice lo contrario. Debería: una sola declaración de ámbito, la del badge.
  await page.goto('/selector-smartphone/');
  await esperarHidratacionBotones(page);
  const cuerpo = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  expect(cuerpo).toContain('La metodología es universal');
  expect(cuerpo).not.toContain('Esta herramienta aplica a España');
});

test('pliego de gama básica: pide 5 años de actualizaciones, que existen en el tramo', async ({ page }) => {
  // HALLAZGO 1684 (medio), reparado. Matiz sobre el acta: el Reglamento (UE) 2023/1670 (anexo II)
  // no obliga sin condición a dar 5 años; obliga a que, SI el fabricante publica actualizaciones,
  // las ofrezca gratis a todas las unidades hasta al menos 5 años tras el fin de la
  // comercialización. Por eso el pliego pide 5 años y remite a la cifra declarada del modelo. Con «4 años o más» y «Hasta 250 €» el pliego dice «pide al menos
  // 3 años, que es lo máximo habitual en este tramo (si necesitas 5, no los encontrarás aquí)».
  // El Galaxy A17 5G se vende en España desde 229 € (4/128 GB) con 6 actualizaciones de sistema y
  // 6 años de parches (Xataka Móvil; samsung.com/es), y el Reglamento (UE) 2023/1670, aplicable
  // desde el 20/06/2025, exige al menos 5 años de actualizaciones del sistema operativo desde el
  // fin de comercialización del modelo. Sale en 49.152 perfiles del barrido. Debería no afirmar
  // que 5 años no existen en el tramo.
  //   P1-P6 SOLO_LLAMAR (0 puntos) + P7 «4 años o más» (+2) = 2 → media, tope básica → básica.
  const perfil: Perfil = [
    'Uso básico', 'No juego o muy poco', 'Menos de 2 horas', 'No, ninguno', 'Windows',
    'Batería larga', '4 años o más', 'Me da igual', 'Precio mínimo', 'Sí, con garantía',
  ];
  await abrirTest(page);
  await responder(page, perfil);
  const texto = await leerResultado(page);
  expect(texto).toContain('Gama básica');
  expect(texto).not.toContain('no los encontrarás aquí');
  expect(await textos(page, 'caracteristicaItem')).toContain(
    '🔄 Actualizaciones del sistema operativo: pide 5 años o más. En este tramo ya hay modelos que los declaran, pero no todos: compruébalo en la ficha del modelo concreto',
  );
  // La guía y el FAQPage tampoco sostienen ya la premisa antigua («3-4», «2-4 años en la mayoría»).
  const html = await (await page.request.get('/selector-smartphone/')).text();
  expect(html).not.toContain('suelen ofrecer 3-4');
  expect(html).not.toContain('2-4 años en la mayoría');
});
