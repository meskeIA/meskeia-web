import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, PREGUNTAS, UMBRAL_BASICA, UMBRAL_ESTANDAR } from '../../app/selector-seguro-hogar/motor';

/**
 * Asesor de Seguro de Hogar (selector-seguro-hogar) — reparado el 24/09/2026 desde una sospecha
 * del Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 3 botones, 0 radios.
 *   · La barra decía aria-valuenow = paso + 1 con mínimo 1, y pintaba paso / 10: en la
 *     pregunta 2 anunciaba 0,111 y pintaba 0,100.
 *   · No hay empates que deshacer: es UNA puntuación contra dos umbrales (10 y 20).
 *   · Razones fijas por cobertura: en 10.226 perfiles salía «completa» sin un solo objeto de
 *     valor, y la app decía «Tienes objetos de valor que requieren cobertura específica»; en
 *     1.424 de ellos, además en centro urbano, «Vives en zona con riesgos específicos
 *     (inundación, incendio forestal, robo)».
 *
 * EL MOTOR (app/selector-seguro-hogar/motor.ts): mismas preguntas, puntos y umbrales (el
 * veredicto no cambia en ninguna de las 414.720 combinaciones). Las razones citan las
 * respuestas que más han sumado y, aparte, las que no han sumado nada.
 *
 * Después, el 24/09/2026, la reparación de los hallazgos 1513-1527 añadió dos opciones (1521),
 * filtró la ficha del inquilino y añadió avisos: el test «motor» de abajo se reescribió.
 */

async function esperarHidratacionBotones(page: Page): Promise<void> {
  // Sin <input> no hay rastreador que sondear (`_hidratacion.ts`): el testigo es que React
  // haya colgado sus props del botón de inicio. Mismo criterio que selector-smartphone.
  await page.waitForFunction(
    () => {
      const boton = Array.from(document.querySelectorAll('button')).find((b) => /Empezar el test/.test(b.textContent ?? ''));
      if (!boton) return false;
      return Object.keys(boton).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

async function abrirTest(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/selector-seguro-hogar/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu cobertura recomendada' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// Propietario con hipoteca (3) · Unifamiliar (3) · Más de 50 años (3) · Contenido de más de
// 60.000 € (4) · CENTRO URBANO (2) · Familia con hijos (2) · NADA especialmente valioso (0) ·
// Incendio (3) · Siniestro importante (3) · La cobertura más amplia (3) = 26 → completa.
// Antes: «Tienes objetos de valor…» y «Vives en zona con riesgos específicos…».
const COMPLETA_SIN_OBJETOS = [0, 1, 3, 3, 0, 2, 0, 2, 2, 2] as const;

test('el grupo de opciones tiene radios de verdad, y aria-checked sigue al clic', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  // 4 desde el 24/09/2026: la pregunta 1 admite «vivienda que alquilo a otros» (hallazgo 1521).
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);
  await grupo.locator('[role="radio"]').nth(2).click();
  await expect(grupo.locator('[role="radio"]').nth(2)).toHaveAttribute('aria-checked', 'true');
  await grupo.locator('[role="radio"]').nth(0).click();
  await expect(grupo.locator('[role="radio"]').nth(0)).toHaveAttribute('aria-checked', 'true');
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(1);
});

test('la barra de progreso anuncia lo mismo que pinta', async ({ page }) => {
  await abrirTest(page);
  const barra = page.locator('[role="progressbar"]');
  for (let paso = 0; paso < 3; paso++) {
    const [ahora, min, max] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (a) => Number(await barra.getAttribute(a))),
    );
    const anunciado = (ahora - min) / (max - min);
    const pedido = Number(await page.locator('[class*="progresoRelleno"]').getAttribute('data-progreso')) / 100;
    expect(anunciado, `pregunta ${paso + 1}`).toBeCloseTo(pedido, 6);
    await expect
      .poll(() => barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth))
      .toBeCloseTo(anunciado, 2);
    await expect(barra).toHaveAttribute('aria-valuetext', `Pregunta ${paso + 1} de 10`);
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
  }
});

test('las razones salen de las respuestas: sin objetos de valor no se afirma que los tengas', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, COMPLETA_SIN_OBJETOS);
  expect(texto).toContain('Multirriesgo Completa');
  expect(texto).not.toContain('Tienes objetos de valor que requieren cobertura específica');
  expect(texto).not.toContain('Vives en zona con riesgos específicos');
  expect(texto).toContain('Tu puntuación es 26: hasta 10, cobertura básica; hasta 20, multirriesgo estándar; por encima, multirriesgo completa.');
  // Las tres que más suman: el contenido (4) y los dos primeros 3 por orden de pregunta.
  expect(texto).toContain('Valor del Contenido: «Más de 60.000 €» suma 4 puntos.');
  expect(texto).toContain('Régimen de Tenencia: «Propietario/a con hipoteca vigente» suma 3 puntos.');
  expect(texto).toContain('Tipo de Vivienda: «Casa unifamiliar o adosado» suma 3 puntos.');
  // Y lo que no ha sumado, dicho.
  expect(texto).toContain('Objetos de Alto Valor: «No, nada especialmente valioso» no suma puntos.');
});

test('motor: el veredicto sigue los umbrales, las razones citan lo respondido y la ficha respeta lo declarado', () => {
  // Reescrito el 24/09/2026 (reparación de 1513-1527): la pregunta 1 admite ahora «vivienda que
  // alquilo a otros» y la 6 «nadie de forma habitual» (1521), así que son 4·4·4·4·4·5·3·5·3·3 =
  // 691.200 combinaciones (antes 414.720). Además de lo de antes, exige lo reparado en TODAS.
  test.setTimeout(180_000);
  const r: Record<string, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  const cuenta = { total: 0, inquilinos: 0, precioSinBasica: 0, objetosEnBasica: 0 };
  // Lo que se le mandaba al inquilino sobre un continente que no es suyo (1513).
  const CONTINENTE = /valoraci[oó]n (profesional|pericial) del continente|capital del continente|Daños estéticos|obras o reformas/i;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      cuenta.total++;
      const res = calcularResultado(r);
      const esperado = res.puntuacion <= UMBRAL_BASICA ? 'basica' : res.puntuacion <= UMBRAL_ESTANDAR ? 'estandar' : 'completa';
      if (res.veredicto !== esperado) mal('veredicto fuera de umbral');
      if (res.razones.length === 0) mal('sin razones');
      for (const x of [...res.razones, ...res.sinPeso]) {
        const citada = x.match(/«([^»]+)»/)?.[1];
        const op = PREGUNTAS.flatMap((p) => p.opciones.filter((o) => o.etiqueta === citada && r[p.id] === o.valor))[0];
        if (!op) mal(`cita «${citada}», no respondida`);
        else if (res.razones.includes(x) !== op.puntos > 0) mal(`«${citada}» en la lista equivocada`);
      }
      // 1514: la prioridad declarada nunca desaparece de «Lo que no ha sumado».
      if (r.prioridad === 'precio' && !res.sinPeso.some((x) => x.includes('El precio más bajo posible'))) mal('la prioridad «precio» no aparece');
      const ficha = [res.ficha.descripcion, ...res.ficha.coberturaIncluida, ...res.ficha.coberturaRecomendada, ...res.ficha.consejos].join(' | ');
      // 1513: al inquilino no se le manda valorar ni asegurar el continente, y el precio se lo dice.
      if (r.regimen === 'inquilino') {
        cuenta.inquilinos++;
        if (CONTINENTE.test(ficha)) mal('continente en la ficha del inquilino');
        if (!res.ficha.precioNota.includes('una de inquilino')) mal('precio de propietario sin aviso al inquilino');
      }
      // La completa ya no se justifica «por el valor de la vivienda», que la app no pregunta.
      if (ficha.includes('valor de la vivienda')) mal('valor de la vivienda');
      // 1514: «El precio más bajo posible» fuera de la básica lleva SIEMPRE el aviso.
      if (r.prioridad === 'precio' && res.veredicto !== 'basica') {
        cuenta.precioSinBasica++;
        if (!res.avisos.some((a) => a.startsWith('Has dicho que priorizas el precio más bajo posible'))) mal('precio sin aviso');
      }
      // 1515: objetos de valor declarados con la básica, avisados.
      if ((r.objetos_valor === 'algo' || r.objetos_valor === 'mucho') && res.veredicto === 'basica') {
        cuenta.objetosEnBasica++;
        if (!res.avisos.some((a) => a.includes('la cobertura básica no los incluye'))) mal('objetos de valor sin aviso');
      }
      // 1521: arrendador y vivienda no habitual, avisados.
      if (r.regimen === 'arrendador' && !res.avisos.some((a) => a.startsWith('Si alquilas la vivienda a otros'))) mal('arrendador sin aviso');
      if (r.convivientes === 'nadie' && !res.avisos.some((a) => a.startsWith('Si no es tu vivienda habitual'))) mal('vivienda no habitual sin aviso');
      return;
    }
    for (const o of PREGUNTAS[i].opciones) {
      r[PREGUNTAS[i].id] = o.valor;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(cuenta.total).toBe(691_200);
  // Que las comprobaciones no pasen en vacío (antes de reparar: 13.886 inquilinos en completa con
  // continente, 16.288 + 114.494 «precio» fuera de la básica, 2.827 con objetos de valor en básica).
  expect(cuenta.inquilinos).toBe(172_800);
  expect(cuenta.precioSinBasica).toBeGreaterThan(0);
  expect(cuenta.objetosEnBasica).toBeGreaterThan(0);
});

// Fuera del acta: al medir la reparación de la forma g (el foco va al h1 del resultado) se vio
// que la barra fija de MeskeiaLogo (0-62 px en móvil) tapaba ENTERO ese h1 (32-61 px a 390 px) y
// el principio del de la intro (48-117 px): el foco caía en un título oculto. El hero deja ahora
// 80 px arriba en todos los anchos, el hueco de la plantilla (en hogar, a 1024 px el logo de
// escritorio, hasta 77 px, tapaba también el título de la intro). Se mide la caja real del
// TEXTO del h1 contra la del logo y la del botón de tema, en cinco anchos y en las dos pantallas.
test('móvil y escritorio: el logo fijo y el botón de tema no tapan el título, ni en la intro ni en el resultado', async ({ page }) => {
  const solapes: string[] = [];
  const medir = (momento: string) => page.evaluate((m) => {
    window.scrollTo(0, 0);
    const h1 = document.querySelector('h1');
    if (!h1) return [`${m}: sin h1`];
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    const texto = Array.from(rango.getClientRects());
    const fijos = Array.from(document.querySelectorAll('[class*="headerBar"] > *')).map((e) => e.getBoundingClientRect());
    const fuera: string[] = [];
    for (const t of texto) for (const f of fijos) {
      if (t.left < f.right && f.left < t.right && t.top < f.bottom && f.top < t.bottom) fuera.push(`${m}: texto ${Math.round(t.top)}-${Math.round(t.bottom)} bajo ${Math.round(f.top)}-${Math.round(f.bottom)}`);
    }
    return fuera;
  }, momento);
  for (const ancho of [360, 390, 768, 1024, 1280]) {
    await page.setViewportSize({ width: ancho, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-seguro-hogar/');
    await esperarHidratacionBotones(page);
    solapes.push(...(await medir(`${ancho}px intro`)));
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    await responder(page, Array(10).fill(0));
    solapes.push(...(await medir(`${ancho}px resultado`)));
  }
  expect(solapes).toEqual([]);
});

/**
 * REPARACIÓN DEL 24/09/2026 de los hallazgos 1513-1527 (primera inspección del Inspector). Los que
 * eran `test.fail()` pasan a exigir lo reparado. Los esperados se calcularon a mano con los puntos
 * de motor.ts; los índices de cada perfil son la posición de la opción en cada una de las 10
 * preguntas, en el orden de la pantalla (0 = la primera). Las opciones nuevas van al FINAL de su
 * pregunta (la 1 y la 6), así que los índices de los perfiles de la inspección no cambian.
 */
test.describe('Reparación 24/09/2026 — restricciones declaradas, FAQ, guía y contraste', () => {
  // Propietario/a sin hipoteca (2) · Piso (1) · Entre 10 y 30 años (1) · 10.000-30.000 € (2) ·
  // Centro urbano (2) · Dos personas (1) · Nada valioso (0) · Daños por agua (1) · Ninguno (0) ·
  // Equilibrio (1) = 11 → estándar. El mismo con «El precio más bajo posible» (0) = 10 → básica.
  const ESTANDAR_11 = [1, 0, 1, 1, 0, 1, 0, 0, 0, 1] as const;
  const BASICA_10 = [1, 0, 1, 1, 0, 1, 0, 0, 0, 0] as const;
  // Inquilino/a (0) · Estudio (0) · Menos de 10 años (0) · Menos de 10.000 € (0) · Centro urbano (2) ·
  // Solo/a (0) · Nada valioso (0) · Agua (1) · Ninguno (0) · Precio (0) = 3, el mínimo posible.
  const MINIMO_3 = [2, 3, 0, 0, 0, 0, 0, 0, 0, 0] as const;
  // INQUILINO/A (0) · Unifamiliar (3) · Más de 50 años (3) · Más de 60.000 € (4) · Zona de riesgo (4) ·
  // Solo/a (0) · Bastante valor (4) · Todo por igual (3) · Uno o más importantes (3) ·
  // «EL PRECIO MÁS BAJO POSIBLE» (0) = 24 → completa.
  const INQUILINO_PRECIO_24 = [2, 1, 3, 3, 3, 0, 2, 4, 2, 0] as const;
  // El mismo con «Menos de 10 años» (0) = 21 → completa. Con cuatro respuestas a cero antes de la
  // prioridad, «Lo que no ha sumado» se cortaba en tres y la prioridad declarada desaparecía.
  const INQUILINO_PRECIO_21 = [2, 1, 0, 3, 3, 0, 2, 4, 2, 0] as const;
  // Inquilino/a (0) · Estudio (0) · Menos de 10 años (0) · Menos de 10.000 € (0) · Centro urbano (2) ·
  // Solo/a (0) · «SÍ, BASTANTE VALOR ACUMULADO» (4) · Agua (1) · Ninguno (0) · Precio (0) = 7 → básica.
  const OBJETOS_BASICA_7 = [2, 3, 0, 0, 0, 0, 2, 0, 0, 0] as const;

  async function verResultado(page: Page, indices: readonly number[]): Promise<void> {
    await abrirTest(page);
    for (let i = 0; i < indices.length; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
      await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
    }
    await page.getByRole('heading', { name: 'Tu cobertura recomendada' }).waitFor();
  }

  const textoResultado = async (page: Page) => (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
  const avisos = async (page: Page) =>
    (await page.locator('p[role="note"][class*="aviso"]').allInnerTexts()).join(' ').replace(/\s+/g, ' ');

  /** La guía está en el DOM aunque plegada (display: none): textContent la lee entera. Sin
   *  getByRole, que no ve lo oculto. */
  async function textoGuia(page: Page): Promise<string> {
    const titulo = page.locator('[class*="resultadosContainer"] h3').filter({ hasText: 'Diferencia entre seguro de continente y contenido' });
    await expect(titulo).toHaveCount(1);
    return ((await titulo.locator('xpath=..').textContent()) ?? '').replace(/\s+/g, ' ');
  }

  async function jsonLd(page: Page, tipo: string): Promise<Record<string, unknown>> {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hallado = bloques.map((b) => JSON.parse(b) as Record<string, unknown>).find((j) => j['@type'] === tipo);
    if (!hallado) throw new Error(`sin JSON-LD ${tipo}`);
    return hallado;
  }

  /** Contraste del color computado contra el fondo compuesto real (capas semitransparentes y la
   *  opacidad del propio texto incluidas). */
  async function contraste(page: Page, selector: string): Promise<number> {
    return page.locator(selector).first().evaluate((el) => {
      const leer = (s: string) => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 };
      };
      type C = { r: number; g: number; b: number; a: number };
      const sobre = (f: C, b: C): C => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
      const lum = (c: C) => {
        const k = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * k(c.r) + 0.7152 * k(c.g) + 0.0722 * k(c.b);
      };
      const capas: C[] = [];
      let base: C = { r: 255, g: 255, b: 255, a: 1 };
      for (let n: Element | null = el; n; n = n.parentElement) {
        const estilo = getComputedStyle(n);
        if (estilo.backgroundImage.includes('gradient')) return 0; // un degradado bajo el texto: se da por fallido
        const c = leer(estilo.backgroundColor);
        if (c && c.a > 0) { if (c.a >= 1) { base = c; break; } capas.push(c); }
      }
      let fondo = base;
      for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
      const color = leer(getComputedStyle(el).color) as C;
      color.a *= Number(getComputedStyle(el).opacity);
      const tinta = sobre(color, fondo);
      const [a, b] = [lum(tinta), lum(fondo)].sort((p, q) => q - p);
      return (a + 0.05) / (b + 0.05);
    });
  }

  // ── Lo que ya funcionaba ───────────────────────────────────────────────────

  test('la frontera de los umbrales cae donde dice la pantalla: 10 → básica, 11 → estándar, 3 → básica', async ({ page }) => {
    await verResultado(page, BASICA_10);
    let texto = await textoResultado(page);
    expect(texto).toContain('Cobertura Básica');
    expect(texto).toContain('100 – 200 €/año');
    expect(texto).toContain('Tu puntuación es 10:');
    expect(texto).toContain('Prioridad al Contratar: «El precio más bajo posible» no suma puntos.');

    await verResultado(page, ESTANDAR_11);
    texto = await textoResultado(page);
    expect(texto).toContain('Multirriesgo Estándar');
    expect(texto).toContain('200 – 400 €/año');
    expect(texto).toContain('Tu puntuación es 11:');
    // Empate a 2 puntos: se citan por orden de pregunta.
    expect(texto).toContain('Régimen de Tenencia: «Propietario/a sin hipoteca» suma 2 puntos. Valor del Contenido: «Entre 10.000 y 30.000 €» suma 2 puntos. Zona Geográfica: «Centro urbano consolidado» suma 2 puntos.');

    await verResultado(page, MINIMO_3);
    texto = await textoResultado(page);
    expect(texto).toContain('Cobertura Básica');
    expect(texto).toContain('Tu puntuación es 3:');
  });

  test('sin respuesta no se avanza, y «Anterior» conserva lo marcado', async ({ page }) => {
    await abrirTest(page);
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Pregunta anterior' })).toBeDisabled();
    await page.locator('[role="radio"]').nth(2).click();
    await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    await page.getByText('Pregunta 2 de 10').first().waitFor();
    await expect(page.getByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled();
    await page.getByRole('button', { name: 'Pregunta anterior' }).click();
    await expect(page.locator('[role="radio"]').nth(2)).toHaveAttribute('aria-checked', 'true');
  });

  test('el aviso de responsabilidad es crítico y no se puede plegar (suite inmobiliaria = nivel 1)', async ({ page }) => {
    await page.goto('/selector-seguro-hogar/');
    await esperarHidratacionBotones(page);
    const aviso = page.locator('[class*="disclaimerCard"]');
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toHaveClass(/severity-critical/);
    await expect(aviso.getByRole('button', { name: /Ocultar aviso|Mostrar aviso/ })).toHaveCount(0);
    await expect(aviso).toContainText('asesoramiento');
  });

  // ── Hallazgos reparados ────────────────────────────────────────────────────

  test('1513: al inquilino/a el resultado no le manda valorar ni asegurar el continente', async ({ page }) => {
    // La opción dice «Inquilino/a — Solo necesitas asegurar el contenido y RC»; el inquilino no tiene
    // interés asegurable en el continente (art. 25 de la Ley 50/1980). La ficha de «completa» le
    // decía «Solicita una valoración profesional del continente…» y «Valoración pericial del
    // continente y contenido». Ahora, en su lugar, inventario y tasación del contenido.
    await verResultado(page, INQUILINO_PRECIO_24);
    const texto = await textoResultado(page);
    expect(texto).toContain('Multirriesgo Completa');
    expect(texto).not.toMatch(/valoraci[oó]n (profesional|pericial) del continente/i);
    expect(texto).not.toContain('valor de la vivienda');
    // La descripción dice lo que ha pesado (contenido y zona, 4 puntos cada una, por orden de pregunta).
    expect(texto).toContain('Tu perfil justifica la cobertura más amplia disponible. Lo que más ha pesado: valor del contenido y zona geográfica.');
    expect(texto).toContain('Tasación del contenido y de los objetos de valor');
    expect(texto).toContain('una de inquilino, solo con contenido y responsabilidad civil, asegura menos capital y su prima es menor');
  });

  test('1514: «El precio más bajo posible» fuera de la básica se dice, y la prioridad no desaparece', async ({ page }) => {
    // Es una PRIORIDAD, no un tope (la app no pregunta cuánto se puede pagar): sigue siendo un peso,
    // pero el aviso lo dice con los precios de los dos niveles (estimación de meskeIA).
    for (const perfil of [INQUILINO_PRECIO_24, INQUILINO_PRECIO_21]) {
      await verResultado(page, perfil);
      const texto = await textoResultado(page);
      expect(texto).toContain('Multirriesgo Completa');
      expect(texto, `perfil ${perfil.join(',')}`).toContain('Prioridad al Contratar: «El precio más bajo posible» no suma puntos.');
      expect(await avisos(page)).toContain('Has dicho que priorizas el precio más bajo posible, pero por tus respuestas la orientación es la multirriesgo completa (400 – 800 €/año, estimación de meskeIA). Si contratas solo la cobertura básica (100 – 200 €/año)');
    }
  });

  test('1515: objetos de valor declarados con la cobertura básica, avisados', async ({ page }) => {
    await verResultado(page, OBJETOS_BASICA_7);
    expect(await textoResultado(page)).toContain('Cobertura Básica');
    expect(await avisos(page)).toContain('Has declarado objetos de especial valor, pero la cobertura básica no los incluye');
  });

  test('1516: el FAQPage describe los niveles y precios que da la pantalla', async ({ page }) => {
    // Antes: «Un seguro básico cubre únicamente el continente…» (la pantalla da a la básica la RC y el
    // robo) y «la diferencia entre niveles suele ser de 50-150 € anuales» (la pantalla, saltos de 100
    // a 400 €). Ahora la respuesta se compone con las mismas constantes de motor.ts.
    await verResultado(page, BASICA_10);
    expect(await textoResultado(page)).toContain('Responsabilidad civil frente a terceros');
    const faq = await jsonLd(page, 'FAQPage');
    const primera = JSON.stringify((faq.mainEntity as unknown[])[0]);
    expect(primera).not.toContain('cubre únicamente el continente');
    expect(primera).not.toContain('50-150 € anuales');
    expect(primera).toContain('la cobertura básica incluye incendio y explosión, daños por agua (tuberías propias), responsabilidad civil frente a terceros, robo con fuerza en el inmueble y fenómenos eléctricos');
    expect(primera).toContain('100 – 200 €/año la básica, 200 – 400 €/año la estándar y 400 – 800 €/año la completa');
  });

  test('1517: la guía da las frecuencias de siniestro de ICEA, con su año', async ({ page }) => {
    // ICEA, nota del 25/06/2025 (estadística del año 2024): agua 38,2 % y asistencia 15,2 % por número;
    // por importe, agua 42,4 %, cristales 10,8 % y fenómenos atmosféricos 9,3 %; coste medio por
    // siniestro 3.719 € el incendio y 718 € el robo. Antes: «Robo (20%)», en segundo lugar.
    await verResultado(page, BASICA_10);
    const guia = await textoGuia(page);
    expect(guia).not.toContain('Robo (20%)');
    expect(guia).toContain('el 38,2 % de los siniestros de hogar fueron daños por agua, seguidos de los de asistencia, con un 15,2 %');
    expect(guia).toContain('estadística del año 2024');
  });

  test('1518: el ejemplo de infraseguro compara con el valor de reconstrucción, no con el precio del piso', async ({ page }) => {
    // Art. 30 de la Ley 50/1980: la proporción es suma asegurada / valor del interés. Reconstruir
    // (sin suelo) 150.000 €, asegurado 90.000 € → 60 %; daño 40.000 € → 24.000 €. Asegurado por
    // 150.000 €, sin infraseguro: los 40.000 €. El precio de venta (200.000 €) no entra en la cuenta.
    await verResultado(page, BASICA_10);
    const guia = await textoGuia(page);
    const inicio = guia.indexOf('Ejemplo práctico:');
    expect(inicio).toBeGreaterThanOrEqual(0);
    const ejemplo = guia.slice(inicio, inicio + 600);
    expect(ejemplo).toContain('reconstruirlo (sin el suelo, que no se quema) costaría 150.000 €');
    expect(ejemplo).toContain('Si lo tienes asegurado por 90.000 €, cubres el 60 % del valor de reconstrucción');
    expect(ejemplo).toContain('la aseguradora pagará 24.000 € (el 60 %)');
    expect(ejemplo).toContain('Si lo aseguras por 150.000 €, no hay infraseguro y cobras los 40.000 €');
    expect(guia).not.toContain('Si tu piso vale 200.000 € pero lo tienes asegurado por 120.000 €');
  });

  test('1519: la guía no recomienda aseguradoras ni comparadores por su marca', async ({ page }) => {
    await verResultado(page, BASICA_10);
    const guia = await textoGuia(page);
    expect(guia).toContain('Cómo comparar seguros');
    expect(guia).not.toMatch(/Mapfre|Allianz|Generali|AXA|Mutua Madrileña|RACC|Acierto/);
  });

  test('1520: la opción de precio no presenta como obligatoria una cobertura que no lo es', async ({ page }) => {
    await abrirTest(page);
    const perfil = [2, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const i of perfil) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(i).click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    const precio = page.locator('[role="radio"]').first();
    await expect(precio).toContainText('El precio más bajo posible');
    await expect(precio).not.toContainText('obligatoria');
    await expect(precio).toContainText('Pagar lo menos posible, aunque cubra menos');
  });

  test('1522: la normativa y los precios de España llevan el aviso de región', async ({ page }) => {
    await page.goto('/selector-seguro-hogar/');
    await esperarHidratacionBotones(page);
    await expect(page.getByRole('note', { name: 'Aviso: esta herramienta aplica únicamente a España' })).toHaveCount(1);
    await expect(page.locator('text=/Solo España: coberturas, precios y normativa de los seguros de hogar españoles/')).toHaveCount(1);
    // Aplica solo a España por una ley que no es fiscal: Delegum no es la fuente de nada de lo
    // que dice la app, así que el aviso no lo enlaza (RegionBadge fuenteDelegum={false}).
    await expect(page.getByText('Fuente de los datos: Delegum')).toHaveCount(0);
  });

  test('1523: el JSON-LD WebApplication lista las funciones', async ({ page }) => {
    await page.goto('/selector-seguro-hogar/');
    const app = await jsonLd(page, 'WebApplication');
    const funciones = app.featureList as unknown[];
    expect(funciones.length).toBeGreaterThanOrEqual(4);
    expect(funciones.length).toBeLessThanOrEqual(8);
  });

  test('1521: se puede declarar una segunda residencia, una vivienda vacía o un piso que se alquila a otros', async ({ page }) => {
    await abrirTest(page);
    const opciones: string[] = [];
    for (let i = 0; i < 6; i++) {
      opciones.push(...(await page.locator('[role="radio"]').allInnerTexts()));
      await page.locator('[role="radio"]').first().click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    const todas = opciones.join(' | ');
    expect(todas).toContain('Propietario/a de una vivienda que alquilo a otros');
    expect(todas).toContain('Nadie de forma habitual (segunda residencia o vivienda vacía)');
    // Y el resultado lo recoge: propietario que alquila (2) · piso (1) · 10-30 años (1) · 10.000-30.000 € (2) ·
    // centro urbano (2) · NADIE de forma habitual (2) · nada valioso (0) · agua (1) · ninguno (0) ·
    // equilibrio (1) = 12 → estándar, con los dos avisos (art. 10 de la Ley 50/1980: declarar el riesgo).
    await verResultado(page, [3, 0, 1, 1, 0, 4, 0, 0, 0, 1]);
    const texto = await textoResultado(page);
    expect(texto).toContain('Multirriesgo Estándar');
    expect(texto).toContain('Tu puntuación es 12:');
    const aviso = await avisos(page);
    expect(aviso).toContain('Si alquilas la vivienda a otros, tú aseguras el continente');
    expect(aviso).toContain('Si no es tu vivienda habitual (segunda residencia o vivienda vacía), díselo a la aseguradora');
  });

  test('1524: tema claro, el título del veredicto se lee (texto grande, 3:1)', async ({ page }) => {
    // Antes: «Multirriesgo Completa» en #e8a020 2,22:1 y «Cobertura Básica» en --secondary 2,80:1.
    // Ahora #b45309 en claro (5,02:1 sobre blanco) y --secondary-texto (5,15:1).
    await verResultado(page, INQUILINO_PRECIO_24);
    expect(await contraste(page, '[class*="veredictoValor"]')).toBeGreaterThanOrEqual(3);
    await verResultado(page, BASICA_10);
    expect(await contraste(page, '[class*="veredictoValor"]')).toBeGreaterThanOrEqual(3);
    await verResultado(page, ESTANDAR_11);
    expect(await contraste(page, '[class*="veredictoValor"]')).toBeGreaterThanOrEqual(3);
  });

  test('1525: tema claro, los textos pequeños de marca llegan a 4,5:1', async ({ page }) => {
    // Antes: progresoPaso 3,93 · razonesTitulo 3,67 · btnRepetir 3,93. Ahora --primary-texto.
    await abrirTest(page);
    expect(await contraste(page, '[class*="progresoPaso"]')).toBeGreaterThanOrEqual(4.5);
    await verResultado(page, ESTANDAR_11);
    expect(await contraste(page, '[class*="razonesTitulo"]')).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="btnRepetir"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('1524/1525/1526: en tema oscuro los mismos textos, el hero y los botones siguen llegando', async ({ page }) => {
    // Guarda del oscuro: en la inspección pasaban los textos (6,22 · 6,17 · 4,93 · 6,23 · 5,60) y
    // fallaba el hero sobre el degradado (subtítulo 2,22, título 2,42, botones 2,42-2,44).
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/selector-seguro-hogar/');
    await esperarHidratacionBotones(page);
    await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const m: Record<string, [number, number]> = {};
    await abrirTest(page);
    m.progresoPaso = [await contraste(page, '[class*="progresoPaso"]'), 4.5];
    await page.locator('[role="radio"]').first().click(); // habilitado: un botón deshabilitado está exento
    m.btnSiguiente = [await contraste(page, '[class*="btnSiguiente"]'), 4.5];
    await verResultado(page, INQUILINO_PRECIO_24);
    m.completa = [await contraste(page, '[class*="veredictoValor"]'), 3];
    m.heroSubtitulo = [await contraste(page, '[class*="heroSubtitleSm"]'), 4.5];
    m.aviso = [await contraste(page, 'p[role="note"][class*="aviso"]'), 4.5];
    await verResultado(page, BASICA_10);
    m.basica = [await contraste(page, '[class*="veredictoValor"]'), 3];
    m.razonesTitulo = [await contraste(page, '[class*="razonesTitulo"]'), 4.5];
    m.btnRepetir = [await contraste(page, '[class*="btnRepetir"]'), 4.5];
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(Object.entries(m).filter(([, [v, min]]) => v < min).map(([k, [v]]) => `${k} ${v.toFixed(2)}`)).toEqual([]);
  });

  test('1526: el hero del resultado usa --hero-bg, como el de la intro, y los botones --primary-boton', async ({ page }) => {
    await abrirTest(page);
    await page.locator('[role="radio"]').first().click();
    expect(await contraste(page, '[class*="btnSiguiente"]')).toBeGreaterThanOrEqual(4.5);
    await verResultado(page, ESTANDAR_11);
    const fondo = await page.locator('[class*="heroResultados"]').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { imagen: cs.backgroundImage, color: cs.backgroundColor };
    });
    expect(fondo).toEqual({ imagen: 'none', color: 'rgb(26, 82, 120)' });
    expect(await contraste(page, '[class*="heroSubtitleSm"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('1527: al pulsar «Ver resultado» con el teclado el foco va al encabezado del resultado', async ({ page }) => {
    await abrirTest(page);
    for (let i = 0; i < 10; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]').first().click();
      if (i < 9) await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    await page.getByRole('button', { name: 'Ver resultado' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: 'Tu cobertura recomendada' }).waitFor();
    await expect(page.getByRole('heading', { name: 'Tu cobertura recomendada' })).toBeFocused();
  });
});
