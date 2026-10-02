import { test, expect, Page, devices } from '@playwright/test';
import { calcularResultado, ORDEN_GAMAS, TOPE_POR_PRESUPUESTO } from '../../app/selector-smartphone/motor';

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
 *   Ese ajuste final era el nudo de la inspección: SOLO existía en los dos extremos. Con los
 *   tramos intermedios («250 – 500 €» y «500 – 900 €») el presupuesto declarado no acotaba
 *   nada, y la gama la fijaba el recuento de puntos sin tope de ningún tipo.
 *   (Así era el 20/09/2026. REPARADO en 4fe972a2: el motor vive en motor.ts, el presupuesto
 *   ya no suma puntos y cada tramo tiene su TOPE; las reglas vigentes, en el bloque del 25/09.)
 *
 * LO QUE ESTOS CASOS FIJABAN el 20/09, y lo que afirman desde la reparación
 *   1) coherente — necesidades inequívocas y mínimas: la recomendación baja, como debe.
 *   2) contradictorio con presupuesto MÍNIMO: el tope funcionaba en silencio y la razón
 *      describía un perfil no declarado. Hoy afirma que recorta Y LO DICE.
 *   3) contradictorio con presupuesto MEDIO: no había tope (900 – 1.500+ € a quien declaró
 *      250 – 500 €). Hoy afirma que la gama se queda en el tramo y que el desfase se nombra.
 *   4) estabilidad — repetir da el mismo resultado; cambiar UNA respuesta saltaba los cuatro
 *      escalones con una razón inventada. Hoy afirma que la razón es el presupuesto.
 *
 * Los casos 2, 3 y 4 fijaban entonces el comportamiento OBSERVADO; desde 4fe972a2 afirman el
 * reparado (hallazgos 943-945, REPARADOS).
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
    // HALLAZGO 1678, REPARADO en b0f31109. El sistema operativo se decidía solo con P4 y P5, sin
    // mirar el presupuesto: «iPhone (iOS)» junto a «Gama básica · 100 – 250 €» a quien acababa de
    // responder «No, prefiero nuevo», sin una palabra sobre el precio; el iPhone nuevo más barato
    // de apple.com/es sale «Desde 859,00 €» (consultado el 25/09/2026 y de nuevo el 02/10/2026).
    // Barrido de entonces: 91.392 de los 147.456 perfiles iOS (62 %) en gama básica o media. Hoy
    // la gama sigue en el tramo y un aviso lo explica (lo residual, en el bloque del 02/10/2026).
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
    // HALLAZGO 1681 (bajo), REPARADO en b0f31109. Un role="radio" promete el teclado del patrón de
    // radios (WAI-ARIA APG): flecha abajo/derecha lleva el foco a la opción siguiente y la marca, y
    // el grupo es UNA parada de Tab. Antes eran <button> sueltos: las flechas no hacían nada y cada
    // opción era una parada de Tab (ArrowDown y ArrowRight sobre «Uso básico» no movían el foco ni
    // marcaban nada). Mismo armazón en las 11 hermanas.
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
    // HALLAZGO 1680 (medio), REPARADO en b0f31109: el foco va al enunciado de la pregunta nueva.
    // Antes, «Siguiente» se desactivaba al llegar la pregunta nueva (aún sin responder) y el foco,
    // que estaba en él, caía a <body>; el siguiente Tab salía DESPUÉS del cuestionario (18 Tab
    // para volver a la primera opción, en cada una de las 9 transiciones). Mismo armazón en las
    // 11 hermanas. Ojo: ese foco desplaza la página, y en móvil deja el enunciado bajo la barra
    // del logo (hallazgo del 02/10/2026, más abajo).
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
    // HALLAZGO 1679 (medio), REPARADO en b0f31109 con la forma de las hermanas (foco al
    // encabezado). Antes, el resultado sustituía al cuestionario en el sitio y la página se
    // quedaba desplazada: en un Pixel 7 se aterrizaba en scrollY 2.576, con las tarjetas de
    // sistema y gama 1.912 px por ENCIMA del borde superior y el foco en <body>.
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
  // HALLAZGO 1682 (medio), REPARADO en b0f31109. Medido antes sobre el fondo computado:
  //   «Empezar el test →» (16,8 px/600, blanco sobre el degradado --primary→--secondary)
  //       3,21:1 en claro · 2,42:1 en oscuro
  //   «Siguiente →» (14,4 px/600, mismo degradado)            3,26:1 claro · 2,45:1 oscuro
  //   «Pregunta N de 10» (13,6 px/600, --primary sobre #FAFAFA)   3,93:1 claro
  //   «Por qué esta recomendación» (14,4 px/700, --primary)       3,67:1 claro
  //   «← Repetir el test» (15,2 px/600, --primary)                3,93:1 claro
  // Ninguno es texto grande: todos exigen 4,5:1. Se reparó como en las hermanas, con
  // --primary-boton / --primary-texto (mascota 1343, portátil 1414 y 1419).
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
  // HALLAZGO 1683 (medio), REPARADO en b0f31109. El test de arriba busca 'Modelos de referencia'
  // con mayúscula y pasaba; en minúscula seguía en DOS de los cuatro sitios del acta del 20/09:
  // og:description y la meta schema:WebApplication. La app no da ningún modelo: 0.
  const html = (await (await page.request.get('/selector-smartphone/')).text()).toLowerCase();
  expect(html).not.toContain('modelos de referencia');
});

test('el JSON-LD WebApplication lleva entre 4 y 8 featureList', async ({ page }) => {
  // HALLAZGO 1686 (bajo), REPARADO en b0f31109. §1.ter del CLAUDE.md del proyecto: `features` con
  // 4-8 características reales. El `jsonLd` que inyectaba layout.tsx llevaba `features: []`; hoy
  // una sola lista FEATURES (7) alimenta el JSON-LD y la meta schema:WebApplication.
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
  // HALLAZGO 1684 (medio), REPARADO en b0f31109. Matiz sobre el acta: el Reglamento (UE) 2023/1670
  // (anexo II) no obliga sin condición a dar 5 años; obliga a que, SI el fabricante publica
  // actualizaciones, las ofrezca gratis a todas las unidades hasta al menos 5 años tras el fin de
  // la comercialización. Por eso el pliego pide 5 años y remite a la cifra declarada del modelo.
  // Antes, con «4 años o más» y «Hasta 250 €» el pliego decía «pide al menos 3 años, que es lo
  // máximo habitual en este tramo (si necesitas 5, no los encontrarás aquí)».
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

// ═════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN DEL 02/10/2026 — app de REFERENCIA de la familia «selectores»
// ═════════════════════════════════════════════════════════════════════════════
//
// Invalidada por los lotes de CSS 586a4d61 (27/09) y a1d72a9c (28/09), que dieron 80 px arriba
// al `.hero` para que la barra fija de MeskeiaLogo no tapara el título. Reglas del motor, las de
// motor.ts (sin cambios desde b0f31109), resumidas en el bloque del 25/09. Cada valor esperado de
// abajo se resolvió a mano ANTES de abrir el navegador, para el flujo de su propio test.
//
// Hallazgos ABIERTOS que fija este bloque (con test.fail, afirman lo correcto):
//   · el foco al enunciado (reparación 1680) lo alinea con el borde superior y queda bajo la
//     barra del logo en móvil;
//   · el <h1> del RESULTADO queda bajo el logo a 360 y 390 px (el lote solo tocó `.hero`);
//   · doble toque en «Empezar el test» contesta la pregunta 1;
//   · la tarjeta «Sistema operativo» dice «iPhone (iOS)» sin más a quien declara «Hasta 250 €» y
//     «No, prefiero nuevo» (el conflicto solo va en el aviso de debajo);
//   · porcentajes sin espacio duro; años de actualizaciones de iOS distintos en FAQPage y
//     pantalla; la guía educativa no está en el HTML servido.

/** ¿Pisa alguna pieza de la barra fija del logo las letras del elemento? (función de la Ronda) */
async function bajoLaBarra(page: Page, selector: string): Promise<{ tapado: boolean; top: number; barra: number }> {
  return page.evaluate((sel) => {
    const barra = [...document.querySelectorAll('body *')].find((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return cs.position === 'fixed' && r.top <= 1 && r.height < 120 && r.width > 300
        && !!e.querySelector('a[href="/"], a[href="https://meskeia.com/"]');
    });
    const el = document.querySelector(sel);
    if (!barra || !el) throw new Error(`sin barra (${!!barra}) o sin ${sel} (${!!el})`);
    const rango = document.createRange();
    rango.selectNodeContents(el);
    const letras = [...rango.getClientRects()].filter((c) => c.width > 0);
    const piezas = [...barra.children].map((c) => c.getBoundingClientRect()).filter((c) => c.width > 0);
    return {
      tapado: piezas.some((p) => letras.some((c) =>
        !(p.right <= c.left || p.left >= c.right || p.bottom <= c.top || p.top >= c.bottom))),
      top: Math.round(el.getBoundingClientRect().top),
      barra: Math.round(barra.getBoundingClientRect().bottom),
    };
  }, selector);
}

/** Toca el centro de un elemento después de dejarlo a media pantalla. */
async function tocarCentrado(page: Page, nombre: string | RegExp): Promise<{ x: number; y: number }> {
  const boton = page.getByRole('button', { name: nombre });
  await boton.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const caja = (await boton.boundingBox())!;
  const punto = { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };
  await page.touchscreen.tap(punto.x, punto.y);
  return punto;
}

// P1 redes 0 · P2 «Con frecuencia» +1 · P3 2-4 h 0 · P6 batería 0 · P7 2-3 años 0 = 1 → media.
// P4 «Alguno» +1 · P5 macOS +2 = 3 → iOS (umbral ≥ 3). Tope de «250 – 500 €» = media: sin
// recorte. iOS con gama media < alta y tope media < alta → aviso; «Tal vez» → variante del
// reacondicionado.
const APPLE_MEDIO: Perfil = [
  'Redes sociales', 'Con frecuencia', '2 – 4 horas', 'Alguno', 'macOS',
  'Batería larga', '2 – 3 años', 'Pantalla grande', 'Relación calidad-precio óptima', 'Tal vez',
];
// P1 foto +2 · P2 intenso +2 · P3 >7 h +2 · P6 rendimiento +1 · P7 4 años o más +2 = 9 → pro.
// P4 «No, ninguno» 0 · P5 Windows −1 → Android. Tope de «Hasta 250 €» = básica: recorte a básica.
const EXIGENTE_ANDROID_250: Perfil = [
  'Fotografía y vídeo', 'Gaming intenso', 'Más de 7 horas', 'No, ninguno', 'Windows',
  'Rendimiento fluido', '4 años o más', 'Resistente', 'Precio mínimo', 'No, prefiero nuevo',
];
// Uso 0 puntos → básica. P4 «Sí, varios» +3 · P5 macOS +2 = 5 → iOS. Tope básica < alta, así que
// la gama no puede subir al iPhone nuevo: aviso, variante «prefieres nuevo».
const APPLE_250_NUEVO: Perfil = [
  'Uso básico', 'No juego o muy poco', 'Menos de 2 horas', 'Sí, varios', 'macOS',
  'Precio ajustado', '1 – 2 años', 'Me da igual', 'Precio mínimo', 'No, prefiero nuevo',
];

test.describe('re-inspección 02/10/2026 · casos resueltos a mano', () => {
  test('caso normal: Apple «Alguno» + macOS con 250 – 500 € → iPhone en gama media, con el aviso del reacondicionado', async ({ page }) => {
    test.setTimeout(60_000);
    await abrirTest(page);
    await responder(page, APPLE_MEDIO);
    await leerResultado(page);

    expect(await textos(page, 'recomendacionValor')).toEqual(['iPhone (iOS)', 'Gama media']);
    await expect(page.locator('[class*="recomendacionDesc"] strong')).toHaveText('Precio orientativo: 250 – 500 €');
    await expect(page.locator('[class*="avisoPresupuesto"]')).toHaveCount(0); // media = tope media
    await expect(page.locator('[class*="avisoSistema"]')).toHaveText(
      '🍎 Apple no vende ningún iPhone nuevo en este tramo: el más barato de su tienda supera los 500 €. Aquí la vía es un iPhone reacondicionado certificado de una generación anterior; antes de comprarlo, comprueba cuántos años de actualizaciones le quedan.',
    );
    expect(await textos(page, 'razonItem')).toEqual([
      'Tienes otros dispositivos Apple: el ecosistema integrado (AirDrop, iMessage, Handoff) te aporta valor real.',
      'iOS recibe actualizaciones durante 6-7 años, lo que protege tu inversión a largo plazo.',
      'La gama media actual es notable: procesadores rápidos, cámaras decentes y autonomía de todo el día.',
    ]);
    // «Tal vez» → 💡 · tramo medio → 🛒 · batería siempre. Sin ♻️ (no hay recorte), 📅, 💧 ni 📷.
    expect((await textos(page, 'consejoItem')).map((c) => c.split(' ')[0])).toEqual(['💡', '🛒', '🔋']);
    expect(await textos(page, 'caracteristicaItem')).toEqual([
      '🔄 Actualizaciones del sistema operativo garantizadas: mínimo 3 años', // 2-3 años, gama media
      '🔋 Batería ≥ 5.000 mAh con carga rápida ≥ 45 W', // prioridad «Batería larga»
      '⚡ Procesador de gama media-alta con pantalla a ≥ 90 Hz', // juega «Con frecuencia»
      "📐 Pantalla ≥ 6,5'' con tecnología AMOLED o equivalente",
      '📡 NFC para pagos sin contacto (verifica disponibilidad en tu región)',
      '📶 Conectividad 5G',
      '💾 Almacenamiento interno ≥ 128 GB',
    ]);
    await expect(page.getByRole('heading', { name: 'Tu smartphone ideal' })).toBeFocused();

    // «Repetir el test» con teclado: el foco cae a <body>, pero el siguiente Tab llega a
    // «Empezar el test», que queda a la vista. Se anota como comportamiento vigente.
    await page.getByRole('button', { name: 'Repetir el test' }).focus();
    await page.keyboard.press('Enter');
    const empezar = page.getByRole('button', { name: /Empezar el test/ });
    await expect(empezar).toBeInViewport();
    await page.keyboard.press('Tab');
    await expect(empezar).toBeFocused();
  });

  test('barrido del motor (589.824 perfiles): la gama nunca supera el tope y todo iPhone sin modelo nuevo en su tramo lleva aviso', () => {
    // Lo que la referencia hace bien y deben copiar las hermanas: el presupuesto DESCARTA (es un
    // tope), no suma puntos. Cuentas del 02/10/2026: 0 perfiles por encima del tope; 229.056
    // recortados, todos con su razón; 136.512 ampliados a pro con «Más de 900 €», todos con su
    // razón; 17.664 elevados a alta por el iPhone; 0 iOS por debajo de alta sin aviso. Y 24.576
    // perfiles iOS con «No, prefiero nuevo» en un tramo sin iPhone nuevo (12.288 con «Hasta
    // 250 €»): llevan aviso, pero la tarjeta dice «iPhone (iOS)» (test.fail de abajo).
    // No hay empates que deshacer: los dos ejes son umbrales (iOS si ≥ 3; pro ≥ 7, alta ≥ 4,
    // media ≥ 1), no candidatas compitiendo por el máximo.
    const OPC: Record<number, string[]> = {
      1: ['basico', 'redes', 'trabajo', 'foto'], 2: ['no', 'casual', 'medio', 'intenso'],
      3: ['poco', 'medio', 'mucho', 'extremo'], 4: ['si_muchos', 'si_alguno', 'no', 'otro'],
      5: ['mac', 'windows', 'linux', 'nopc'], 6: ['bateria', 'camara', 'rendimiento', 'precio'],
      7: ['corto', 'medio', 'largo'], 8: ['pequeno', 'grande', 'resistente', 'indiferente'],
      9: ['bajo', 'medio', 'alto', 'premium'], 10: ['si', 'quizas', 'no'],
    };
    const idx = (g: string) => ORDEN_GAMAS.indexOf(g as (typeof ORDEN_GAMAS)[number]);
    const cuenta = { total: 0, porEncima: 0, iosSinAviso: 0, recorteSinRazon: 0, premiumBajoPro: 0, iosNuevoImposible: 0 };
    const r: Record<number, string> = {};
    const recorrer = (q: number): void => {
      if (q > 10) {
        cuenta.total++;
        const res = calcularResultado(r);
        if (idx(res.gama) > idx(TOPE_POR_PRESUPUESTO[r[9]])) cuenta.porEncima++;
        if (res.os === 'ios' && idx(res.gama) < idx('alta') && !res.avisoSistema) cuenta.iosSinAviso++;
        if (res.recortadaPorPresupuesto && !res.razones.some((x) => x.includes('has declarado un presupuesto'))) cuenta.recorteSinRazon++;
        if (r[9] === 'premium' && res.gama !== 'pro') cuenta.premiumBajoPro++;
        if (res.os === 'ios' && idx(res.gama) < idx('alta') && r[10] === 'no') cuenta.iosNuevoImposible++;
        return;
      }
      for (const v of OPC[q]) { r[q] = v; recorrer(q + 1); }
    };
    recorrer(1);
    expect(cuenta.total).toBe(589_824); // 4^8 · 3^2
    expect(cuenta.porEncima).toBe(0);
    expect(cuenta.iosSinAviso).toBe(0);
    expect(cuenta.recorteSinRazon).toBe(0);
    expect(cuenta.premiumBajoPro).toBe(0);
    // 4 combinaciones P4×P5 salen iOS (36.864 c/u) · P9 bajo o medio (½) · P10 «no» (⅓) ·
    // gama < alta: con bajo y medio el tope ya lo garantiza → 147.456 · ½ · ⅓ = 24.576.
    expect(cuenta.iosNuevoImposible).toBe(24_576);
  });

  test('HALLAZGO: con «Hasta 250 €» y «No, prefiero nuevo», la tarjeta de sistema no puede decir «iPhone (iOS)» sin más', async ({ page }) => {
    // ABIERTO (02/10/2026). Forma del 1678, residual tras b0f31109: el presupuesto DESCARTA en la
    // gama pero no en el sistema. A quien declara «Hasta 250 €» y «No, prefiero nuevo», la tarjeta
    // principal dice «iPhone (iOS)» con «Gama básica · 100 – 250 €», y solo el aviso de debajo
    // explica que no hay iPhone nuevo en ese tramo (apple.com/es: el más barato «Desde 859,00 €»,
    // consultado el 02/10/2026). Lo que el usuario se lleva es la tarjeta.
    // Correcto: la propia tarjeta de sistema recomienda Android o dice que el iPhone no cabe.
    test.fail();
    await abrirTest(page);
    await responder(page, APPLE_250_NUEVO);
    await leerResultado(page);
    // La gama sí la descarta el presupuesto (y debe seguir así con cualquier arreglo).
    await expect(page.locator('[class*="recomendacionDesc"] strong')).toHaveText('Precio orientativo: 100 – 250 €');
    // Hoy la tarjeta dice «iPhone (iOS) · El ecosistema Apple integrado, actualizaciones
    // garantizadas 6-7 años…», sin una palabra del conflicto.
    const tarjetaSistema = (await textos(page, 'recomendacionCard'))[0];
    expect(tarjetaSistema).toMatch(/Android|reacondicionad|no hay iPhone nuevo|no vende|no cabe/i);
  });

  test('HALLAZGO: los porcentajes llevan espacio duro antes del «%» (CLAUDE.md §2)', async ({ page }) => {
    // ABIERTO (02/10/2026). «ahorro del 20-30%» (guía, page.tsx) va pegado y «un 30-40 %» (consejo
    // 💡, motor.ts) lleva un espacio normal. La norma del 25/09/2026: separado con U+00A0, y lo
    // viejo se corrige cuando pasa el Inspector. SOLO_LLAMAR acaba en «Sí, con garantía» → 💡.
    test.fail();
    await abrirTest(page);
    await responder(page, SOLO_LLAMAR);
    await leerResultado(page);
    // textContent, no innerText: así se ve el carácter real que separa la cifra del «%».
    const texto = (await page.locator('[class*="resultadosContainer"]').textContent()) ?? '';
    // Hoy: ['espacio normal' (30-40 %), 'pegado' (20-30%)]. Correcto: ninguno distinto de U+00A0.
    const separadores = [...texto.matchAll(/\d([\s ]?)%/g)].map((m) => (m[1] === ' ' ? 'U+00A0' : m[1] === '' ? 'pegado' : 'espacio normal'));
    expect(separadores.filter((s) => s !== 'U+00A0')).toEqual([]);
  });

  test('HALLAZGO: los años de actualizaciones de iOS son los mismos en el FAQPage y en pantalla', async ({ page }) => {
    // ABIERTO (02/10/2026). Forma del 947/1395: al buscador y a las IA el FAQPage les dice
    // «actualizaciones garantizadas durante 5-7 años»; al visitante, la tarjeta dice
    // «actualizaciones garantizadas 6-7 años» y la razón «iOS recibe actualizaciones durante 6-7
    // años». (Y la tercera respuesta del mismo FAQPage dice que Apple «suele mantener» el soporte.)
    test.fail();
    const html = await (await page.request.get('/selector-smartphone/')).text();
    const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]) as { '@type': string; mainEntity?: { acceptedAnswer: { text: string } }[] })
      .find((b) => b['@type'] === 'FAQPage');
    const enFaq = faq?.mainEntity?.[0].acceptedAnswer.text.match(/(\d-\d) años/)?.[1];
    await abrirTest(page);
    await responder(page, APPLE_MEDIO);
    await leerResultado(page);
    // Hoy: FAQPage «5-7», tarjeta «6-7». Correcto: la misma cifra en los dos sitios.
    const enPantalla = (await textos(page, 'recomendacionCard'))[0].match(/(\d-\d) años/)?.[1];
    expect(enPantalla).toBeTruthy();
    expect(enFaq).toBe(enPantalla);
  });

  test('HALLAZGO: la guía educativa está en el HTML servido', async ({ page }) => {
    // ABIERTO (02/10/2026). EducationalSection monta SIEMPRE su contenido «porque Googlebot no
    // hace clic»; aquí el componente entero va dentro de `pantalla === 'resultado'`, así que el
    // HTML servido no lleva ni una línea de la guía, y quien no termina las 10 preguntas tampoco
    // la ve. Medido en el HTML servido el 02/10/2026: 3 de las 11 hermanas sí la llevan.
    test.fail();
    const html = await (await page.request.get('/selector-smartphone/')).text();
    expect(html).toContain('iOS vs Android: diferencias clave');
  });

  test('«2025» solo aparece como la fecha del Reglamento (UE) 2023/1670, no como año en curso', async ({ page }) => {
    await abrirTest(page);
    const intro = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    await responder(page, SOLO_LLAMAR);
    await leerResultado(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const resultado = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    // Del HTML, solo las respuestas del FAQPage: el resto lleva fechas ISO legítimas
    // (datePublished «2025-01-22» del WebApplication).
    const html = await (await page.request.get('/selector-smartphone/')).text();
    const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]) as { '@type': string; mainEntity?: { acceptedAnswer: { text: string } }[] })
      .find((b) => b['@type'] === 'FAQPage');
    const respuestas = (faq?.mainEntity ?? []).map((q) => q.acceptedAnswer.text).join(' ');
    expect(respuestas.length).toBeGreaterThan(0);
    for (const [donde, texto] of [['intro', intro], ['resultado y guía', resultado], ['FAQPage', respuestas]] as const) {
      const contextos = [...texto.matchAll(/.{0,12}\b2025\b/g)].map((m) => m[0]);
      for (const c of contextos) expect(c, `${donde}: ${c}`).toMatch(/20\/06\/2025$/);
    }
  });

  test('la barra del logo no tapa el <h1> de la intro (360-1024 px, claro y oscuro) ni el del resultado desde 800 px', async ({ page }) => {
    test.setTimeout(60_000);
    // Lo que arregló el lote a1d72a9c en `.hero` (80 px arriba hasta 1.023 px), medido con la
    // función de la Ronda en los cinco anchos del encargo y en los dos temas.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-smartphone/');
    await esperarHidratacionBotones(page);
    for (const tema of ['claro', 'oscuro'] as const) {
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      for (const [ancho, alto] of [[360, 740], [390, 844], [800, 1112], [1000, 800], [1024, 768]]) {
        await page.setViewportSize({ width: ancho, height: alto });
        await page.evaluate(() => window.scrollTo(0, 0));
        expect((await bajoLaBarra(page, 'h1')).tapado, `intro, ${ancho} px, ${tema}`).toBe(false);
      }
    }
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await responder(page, SOLO_LLAMAR);
    await leerResultado(page);
    for (const [ancho, alto] of [[800, 1112], [1000, 800], [1024, 768]]) {
      await page.setViewportSize({ width: ancho, height: alto });
      await page.evaluate(() => window.scrollTo(0, 0));
      expect((await bajoLaBarra(page, 'h1')).tapado, `resultado, ${ancho} px`).toBe(false);
    }
  });
});

test.describe('re-inspección 02/10/2026 · móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('caso límite con toques: exigente (9 puntos, pro) con «Hasta 250 €» → Android básica, recortada y dicha', async ({ page }) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-smartphone/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    await responderTocando(page, EXIGENTE_ANDROID_250);
    await leerResultado(page);

    expect(await textos(page, 'recomendacionValor')).toEqual(['Android', 'Gama básica']);
    await expect(page.locator('[class*="recomendacionDesc"] strong')).toHaveText('Precio orientativo: 100 – 250 €');
    await expect(page.locator('[class*="avisoPresupuesto"]')).toHaveText(
      '💶 Tu uso apuntaba a la gama pro / flagship (900 – 1.500+ €), pero la recomendación se ajusta al presupuesto que has declarado. Lo que sigue es lo mejor que cabe en tu tramo.',
    );
    await expect(page.locator('[class*="avisoSistema"]')).toHaveCount(0); // Android
    expect(await textos(page, 'razonItem')).toEqual([
      'Android ofrece más variedad de modelos, marcas y precios que se adaptan a cualquier necesidad.',
      'Mayor libertad de personalización y compatibilidad con ecosistemas no Apple (Google, Microsoft…).',
      'Tus respuestas sobre uso apuntaban a la gama pro o flagship, pero has declarado un presupuesto hasta 250 €: manda el presupuesto, así que la recomendación se ajusta a lo que cabe en ese tramo.',
      'Si alguna de esas exigencias es innegociable, subir de tramo es la única forma de cubrirla; si no, aquí van las mejores opciones dentro de tu presupuesto.',
      'Buscar modelos con varios años de actualizaciones garantizadas prolonga la vida útil del dispositivo.',
    ]);
    // recorte + «No, prefiero nuevo» → ♻️ · 4 años o más → 📅 · resistente → 💧 · tramo bajo → 🛒 · 🔋
    expect((await textos(page, 'consejoItem')).map((c) => c.split(' ')[0])).toEqual(['♻️', '📅', '💧', '🛒', '🔋']);
    expect(await textos(page, 'caracteristicaItem')).toEqual([
      '🔄 Actualizaciones del sistema operativo: pide 5 años o más. En este tramo ya hay modelos que los declaran, pero no todos: compruébalo en la ficha del modelo concreto',
      '🔋 Batería ≥ 5.000 mAh con carga rápida ≥ 45 W', // más de 7 h
      '📷 Cámara principal con estabilización óptica si la encuentras: en este tramo no hay teleobjetivo, y el zoom será digital',
      '⚡ El procesador más potente que encuentres en este tramo; para juegos exigentes tendrás que bajar la calidad gráfica',
      '🖥️ Pantalla de 90 Hz si la hay: los 120 Hz empiezan en la gama media',
      '💧 Certificación IP67 como mínimo: en este tramo es lo que se encuentra, y muchos modelos solo declaran IP54',
      '📡 NFC para pagos sin contacto (verifica disponibilidad en tu región)',
      '📶 Conectividad 5G: en este tramo no está en todos los modelos, compruébalo en la ficha',
      '💾 Almacenamiento interno ≥ 128 GB',
    ]);
    await expect(page.getByRole('heading', { name: 'Tu smartphone ideal' })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test('HALLAZGO: el <h1> del resultado no queda bajo la barra del logo a 360 ni a 390 px', async ({ page }) => {
    // ABIERTO (02/10/2026). Los lotes 586a4d61 y a1d72a9c dieron 80 px arriba a `.hero`, pero el
    // hero del resultado es `.heroResultados` (2rem arriba). Al llegar al resultado la página está
    // en scrollY 0 y el <h1> «Tu smartphone ideal» ocupa y 31-61 px; la píldora del logo, y 10-52.
    // Medido: a 360 px, logo [15, 10, 141, 52] sobre las letras [72, 31, 288, 61] («Tu sm» tapado).
    // La Ronda no lo ve: solo mide el <h1> con el que carga la página, que es el de la intro.
    test.fail();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-smartphone/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    await responderTocando(page, SOLO_LLAMAR);
    await expect(page.getByRole('heading', { name: 'Tu smartphone ideal' })).toBeFocused();
    const a360 = await bajoLaBarra(page, 'h1');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const a390 = await bajoLaBarra(page, 'h1');
    expect({ a360: a360.tapado, a390: a390.tapado }).toEqual({ a360: false, a390: false });
  });
});

test.describe('re-inspección 02/10/2026 · móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('HALLAZGO: tras «Empezar» y «Siguiente», el enunciado enfocado no queda bajo la barra del logo', async ({ page }) => {
    // ABIERTO (02/10/2026). La reparación del 1680 lleva el foco al enunciado (bien), pero
    // focus() desplaza la página al borde más cercano: si el enunciado estaba cortado por arriba,
    // queda en y 0 y la barra fija (hasta y 62) tapa sus primeras letras; la barra de progreso y
    // «Pregunta N de 10» quedan fuera, por encima. Medido a 390 px tocando el botón a media
    // pantalla: P1 en y 20-73 y las preguntas 2-7, 9 y 10 en y 0-53, todas tapadas (en la
    // captura, «¿Jueg» y «vide» bajo la píldora del logo). Con el botón abajo o arriba no pasa.
    // Correcto: el enunciado enfocado empieza por debajo de la barra (p. ej., scroll-margin-top).
    test.fail();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-smartphone/');
    await esperarHidratacionBotones(page);
    const medidas: string[] = [];
    await tocarCentrado(page, /Empezar el test/);
    for (let i = 1; i <= 4; i++) {
      await expect(page.getByText(`Pregunta ${i} de 10`).first()).toBeVisible();
      await expect(page.locator('h2[tabindex="-1"]')).toBeFocused();
      await page.waitForTimeout(150); // el desplazamiento del foco, ya asentado
      const m = await bajoLaBarra(page, 'h2[tabindex="-1"]');
      if (m.tapado || m.top < m.barra) medidas.push(`P${i}: enunciado en y ${m.top}, barra hasta ${m.barra}`);
      await page.locator('[role="radiogroup"] [role="radio"]').first().tap();
      await tocarCentrado(page, 'Siguiente pregunta');
    }
    expect(medidas, 'enunciados bajo la barra del logo').toEqual([]);
  });

  test('HALLAZGO: un doble toque en «Empezar el test» no contesta la pregunta 1', async ({ page }) => {
    // ABIERTO (02/10/2026). La forma de los quizzes: el primer toque cambia de pantalla y el foco
    // desplaza la página; el segundo, en el mismo punto, cae en la cuarta opción. Medido con el
    // botón centrado en y 360 a 360, 390 y 412 px, con 60, 150 y 300 ms entre toques: queda
    // marcada «Fotografía y vídeo» (+2 a la gama). En las otras alturas barridas (120-840 px, de
    // 60 en 60) no pasa; tampoco en 81 dobles toques a «Siguiente» ni en 9 a «Ver resultado».
    test.fail();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-smartphone/');
    await esperarHidratacionBotones(page);
    const empezar = page.getByRole('button', { name: /Empezar el test/ });
    await empezar.evaluate((e) => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - 360); });
    const caja = (await empezar.boundingBox())!;
    const x = caja.x + caja.width / 2;
    const y = caja.y + caja.height / 2;
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(150);
    await page.touchscreen.tap(x, y);
    await expect(page.getByText('Pregunta 1 de 10').first()).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(0, { timeout: 1_000 });
  });

  test('un doble toque en «Siguiente» o «Ver resultado» no contesta la pregunta siguiente ni saca de la app', async ({ page }) => {
    test.setTimeout(60_000);
    // Rechazo: el segundo toque cae en «Siguiente», ya desactivado (la pregunta nueva no tiene
    // respuesta), o en texto sin acción. Se responde con la ÚLTIMA opción para distinguirla de la
    // que pudiera dejar marcada el segundo toque.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-smartphone/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: /Empezar el test/ }).tap();
    for (let i = 0; i < 10; i++) {
      await expect(page.getByText(`Pregunta ${i + 1} de 10`).first()).toBeVisible();
      await expect(page.locator('[role="radio"][aria-checked="true"]'), `pregunta ${i + 1}`).toHaveCount(0);
      await page.locator('[role="radio"]').last().tap();
      const nombre = i === 9 ? 'Ver resultado' : 'Siguiente pregunta';
      const punto = await tocarCentrado(page, nombre);
      await page.waitForTimeout(150);
      await page.touchscreen.tap(punto.x, punto.y);
      await page.waitForTimeout(250);
    }
    await expect(page.getByRole('heading', { name: 'Tu smartphone ideal' })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/selector-smartphone/');
  });
});
