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
  await expect(grupo.locator('[role="radio"]')).toHaveCount(3);
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

test('motor: el veredicto sigue los umbrales y las razones citan lo respondido', () => {
  const r: Record<string, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  let total = 0;
  const recorrer = (i: number): void => {
    if (i === PREGUNTAS.length) {
      total++;
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
      return;
    }
    for (const o of PREGUNTAS[i].opciones) {
      r[PREGUNTAS[i].id] = o.valor;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(total).toBe(414_720);
});

/**
 * Primera inspección del Inspector (24/09/2026). Los esperados se calcularon a mano con los
 * puntos de motor.ts antes de abrir la app; los recuentos salen de enumerar las 414.720
 * combinaciones con calcularResultado (scratch del Inspector, barrido.mjs).
 *
 * Los índices de cada perfil son la posición de la opción en cada una de las 10 preguntas,
 * en el orden de la pantalla (0 = la primera).
 */
test.describe('Inspección 24/09/2026 — restricciones declaradas, FAQ, guía y contraste', () => {
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
  // prioridad, «Lo que no ha sumado» se corta en tres y la prioridad declarada desaparece.
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

  /** Contraste del color computado contra el fondo compuesto real (capas semitransparentes incluidas). */
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
        const c = leer(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) { if (c.a >= 1) { base = c; break; } capas.push(c); }
      }
      let fondo = base;
      for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
      const tinta = sobre(leer(getComputedStyle(el).color) as C, fondo);
      const [a, b] = [lum(tinta), lum(fondo)].sort((p, q) => q - p);
      return (a + 0.05) / (b + 0.05);
    });
  }

  // ── Lo que funciona (pasan hoy) ───────────────────────────────────────────

  test('la frontera de los umbrales cae donde dice la pantalla: 10 → básica, 11 → estándar, 3 → básica', async ({ page }) => {
    await verResultado(page, BASICA_10);
    let texto = (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('Cobertura Básica');
    expect(texto).toContain('100 – 200 €/año');
    expect(texto).toContain('Tu puntuación es 10:');
    // Tres ceros exactos (objetos, siniestros, prioridad): caben enteros en «Lo que no ha sumado».
    expect(texto).toContain('Prioridad al Contratar: «El precio más bajo posible» no suma puntos.');

    await verResultado(page, ESTANDAR_11);
    texto = (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('Multirriesgo Estándar');
    expect(texto).toContain('200 – 400 €/año');
    expect(texto).toContain('Tu puntuación es 11:');
    // Empate a 2 puntos: se citan por orden de pregunta.
    expect(texto).toContain('Régimen de Tenencia: «Propietario/a sin hipoteca» suma 2 puntos. Valor del Contenido: «Entre 10.000 y 30.000 €» suma 2 puntos. Zona Geográfica: «Centro urbano consolidado» suma 2 puntos.');

    await verResultado(page, MINIMO_3);
    texto = (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
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

  // ── Hallazgos abiertos (test.fail: se pondrán rojos cuando se reparen) ─────

  test('inquilino/a: el resultado no le manda valorar ni asegurar el continente', async ({ page }) => {
    // HALLAZGO abierto: la opción dice «Inquilino/a — Solo necesitas asegurar el contenido y RC», y la
    // ficha fija de «completa» le aconseja «Solicita una valoración profesional del continente para
    // asegurarlo correctamente» y le recomienda «Valoración pericial del continente y contenido».
    // Barrido: los 13.886 perfiles de inquilino con resultado «completa» (de 138.240 inquilinos).
    test.fail();
    await verResultado(page, INQUILINO_PRECIO_24);
    const texto = (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('Multirriesgo Completa');
    expect(texto).not.toMatch(/valoraci[oó]n (profesional|pericial) del continente/i);
  });

  test('«El precio más bajo posible» no acaba en la cobertura más amplia sin decirlo', async ({ page }) => {
    // HALLAZGO abierto: la opción se describe como «Cobertura mínima obligatoria», suma 0 y no acota:
    // de 138.240 perfiles que la eligen, 16.288 reciben «Multirriesgo Completa — la cobertura más
    // amplia disponible … o tus prioridades», 400 – 800 €/año, y 114.494 la estándar (200 – 400);
    // solo 7.458 la básica. La única huella es «no suma puntos», y en 12 perfiles de «completa» (este
    // es uno) ni eso: la lista se corta en tres. Esperado (referencia de la familia): acotar o avisar.
    test.fail();
    for (const perfil of [INQUILINO_PRECIO_24, INQUILINO_PRECIO_21]) {
      await verResultado(page, perfil);
      const texto = (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
      const resto = texto.replace('Prioridad al Contratar: «El precio más bajo posible» no suma puntos.', '');
      const acota = !texto.includes('Multirriesgo Completa');
      const avisa = /precio más bajo|presupuesto/i.test(resto);
      expect(acota || avisa, `perfil ${perfil.join(',')}: completa sin aviso del precio declarado`).toBe(true);
    }
  });

  test('objetos de valor declarados con cobertura básica: el resultado los menciona', async ({ page }) => {
    // HALLAZGO abierto: la opción dice «Requiere cobertura específica o valoración» y sale «Cobertura
    // Básica», cuyas coberturas, recomendaciones y consejos no mencionan los objetos de valor; su única
    // aparición es como razón n.º 1 de «Por qué esta cobertura». Barrido: 389 perfiles con «bastante
    // valor» y 2.438 con «algunos artículos» salen en básica.
    test.fail();
    await verResultado(page, OBJETOS_BASICA_7);
    const texto = (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('Cobertura Básica');
    const sinRazon = texto.replace(/Objetos de Alto Valor: «[^»]+» suma \d+ puntos\./, '');
    expect(sinRazon).toMatch(/objetos de (especial |alto )?valor|joyas|tasaci[oó]n/i);
  });

  test('el FAQPage describe los niveles y precios que da la pantalla', async ({ page }) => {
    // HALLAZGO abierto: el FAQPage dice que el básico «cubre únicamente el continente» y deja la RC y el
    // robo al estándar; la pantalla da a la básica «Responsabilidad civil frente a terceros» y «Robo con
    // fuerza en el inmueble» (y se la recomienda a inquilinos, que no aseguran continente). Dice que la
    // diferencia entre niveles «suele ser de 50-150 € anuales»; la pantalla da 100 – 200 / 200 – 400 /
    // 400 – 800 €/año (saltos de 100 a 400 €).
    test.fail();
    await verResultado(page, BASICA_10);
    const texto = (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
    expect(texto).toContain('Responsabilidad civil frente a terceros');
    const faq = await jsonLd(page, 'FAQPage');
    const primera = JSON.stringify((faq.mainEntity as unknown[])[0]);
    expect(primera).not.toContain('cubre únicamente el continente');
    expect(primera).not.toContain('50-150 € anuales');
  });

  test('la guía no publica frecuencias de siniestro que contradicen a ICEA', async ({ page }) => {
    // HALLAZGO abierto: «Los 5 siniestros más frecuentes»: agua 45 %, robo 20 %, incendio 15 %,
    // fenómenos 12 %, RC 8 % (suman 100, sin fuente). ICEA (datos 2021, por número): agua 37,1 %,
    // cristales 14,7 %, asistencia 11,2 %, daños eléctricos 9,6 %, fenómenos atmosféricos 7,6 %,
    // robos 3,4 %; en 2024, agua 38,2 % y asistencia 15,2 %.
    test.fail();
    await verResultado(page, BASICA_10);
    const guia = await textoGuia(page);
    expect(guia).toContain('siniestros más frecuentes');
    expect(guia).not.toContain('Robo (20%)');
  });

  test('el ejemplo de infraseguro compara con el valor de reconstrucción, no con lo que «vale» el piso', async ({ page }) => {
    // HALLAZGO abierto: «Si tu piso vale 200.000 € pero lo tienes asegurado por 120.000 € … solo
    // recibirás 24.000 €». La regla proporcional (art. 30 LCS) compara con el valor del interés
    // asegurado; el continente se asegura por reconstrucción sin suelo, como dice la propia FAQ.
    test.fail();
    await verResultado(page, BASICA_10);
    const guia = await textoGuia(page);
    // Hasta la cifra indemnizada (los puntos de millar impiden cortar por la primera frase).
    const inicio = guia.indexOf('Ejemplo práctico:');
    expect(inicio).toBeGreaterThanOrEqual(0);
    const ejemplo = guia.slice(inicio, inicio + 200);
    expect(ejemplo).toContain('200.000 €');
    expect(ejemplo).toMatch(/reconstru/i);
  });

  test('la guía no recomienda aseguradoras ni comparadores por su marca', async ({ page }) => {
    // HALLAZGO abierto: «Mutua Madrileña, Mapfre, Allianz, Generali y AXA son las más grandes, pero
    // comparadores como RACC o Acierto pueden ofrecerte mejores condiciones», sin fuente, en una app
    // que promete orientar «sin sesgos comerciales».
    test.fail();
    await verResultado(page, BASICA_10);
    const guia = await textoGuia(page);
    expect(guia).toContain('Cómo comparar seguros');
    expect(guia).not.toMatch(/Mapfre|Allianz|Generali|AXA|Mutua Madrileña|RACC|Acierto/);
  });

  test('la opción de precio no presenta como obligatoria una cobertura que no lo es', async ({ page }) => {
    // HALLAZGO abierto: pregunta 10, «El precio más bajo posible — Cobertura mínima obligatoria», también
    // a quien acaba de marcar «Inquilino/a» o «Propietario/a sin hipoteca». El seguro de daños solo es
    // exigible sobre el inmueble hipotecado (RD 716/2009, art. 10); la propia FAQ dice que para el
    // inquilino no es legalmente obligatorio.
    test.fail();
    await abrirTest(page);
    const perfil = [2, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const i of perfil) {
      await page.locator('[role="radiogroup"] [role="radio"]').nth(i).click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    const precio = page.locator('[role="radio"]').first();
    await expect(precio).toContainText('El precio más bajo posible');
    await expect(precio).not.toContainText('obligatoria');
  });

  test('la normativa y los precios de España llevan el aviso de región', async ({ page }) => {
    // HALLAZGO abierto: Consorcio de Compensación de Seguros, seguro exigido con hipoteca, precios «en
    // España» en euros… y ningún RegionBadge (§1.bis). Mismo caso que el 1340 de mascota.
    test.fail();
    await page.goto('/selector-seguro-hogar/');
    await esperarHidratacionBotones(page);
    await expect(page.getByRole('note', { name: /España/ })).toHaveCount(1, { timeout: 2_000 });
  });

  test('el JSON-LD WebApplication lista las funciones', async ({ page }) => {
    // HALLAZGO abierto: metadata.ts exporta jsonLd con features: [] y el layout lo inyecta con
    // "featureList":[] (§1.ter pide 4-8). Las 8 funciones solo están en la meta schema:WebApplication.
    test.fail();
    await page.goto('/selector-seguro-hogar/');
    const app = await jsonLd(page, 'WebApplication');
    expect((app.featureList as unknown[]).length).toBeGreaterThanOrEqual(4);
  });

  test('se puede declarar una segunda residencia, una vivienda vacía o un piso que se alquila a otros', async ({ page }) => {
    // HALLAZGO abierto: ni la pregunta 1 (régimen) ni la 6 (quién vive) lo admiten, aunque la FAQ da la
    // «vivienda vacacional o no habitual» como uno de los factores que más encarecen. El arrendador
    // (continente + RC, sin el contenido del inquilino) tampoco tiene opción.
    test.fail();
    await abrirTest(page);
    const opciones: string[] = [];
    for (let i = 0; i < 6; i++) {
      opciones.push(...(await page.locator('[role="radio"]').allInnerTexts()));
      await page.locator('[role="radio"]').first().click();
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    expect(opciones.length).toBeGreaterThan(15);
    expect(opciones.join(' | ')).toMatch(/segunda residencia|vac[ií]a|alquilo|arrendador|no habitual/i);
  });

  test('tema claro: el título del veredicto se lee (texto grande, 3:1)', async ({ page }) => {
    // HALLAZGO abierto: «Multirriesgo Completa» en #e8a020 escrito a mano da 2,22:1 (92.491 de 414.720
    // perfiles) y «Cobertura Básica» en --secondary 2,80:1 (12.261). 24 px en negrita → mínimo 3:1.
    test.fail();
    await verResultado(page, INQUILINO_PRECIO_24);
    expect(await contraste(page, '[class*="veredictoValor"]')).toBeGreaterThanOrEqual(3);
    await verResultado(page, BASICA_10);
    expect(await contraste(page, '[class*="veredictoValor"]')).toBeGreaterThanOrEqual(3);
  });

  test('tema claro: los textos pequeños de marca llegan a 4,5:1', async ({ page }) => {
    // HALLAZGO abierto: «Pregunta N de 10» (progresoPaso) 3,93:1, «Por qué esta cobertura» y «Lo que no
    // ha sumado» (razonesTitulo) 3,67:1, «← Repetir el test» 3,93:1. En oscuro pasan (6,23 / 5,60 / 6,23).
    test.fail();
    await abrirTest(page);
    expect(await contraste(page, '[class*="progresoPaso"]')).toBeGreaterThanOrEqual(4.5);
    await verResultado(page, ESTANDAR_11);
    expect(await contraste(page, '[class*="razonesTitulo"]')).toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="btnRepetir"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('el hero del resultado usa --hero-bg, como el de la intro (de familia)', async ({ page }) => {
    // HALLAZGO abierto: .heroResultados pinta linear-gradient(135deg, --primary, --secondary). Bajo la
    // caja real del texto, el subtítulo (16 px, opacidad 0,88) baja a 2,90:1 en claro y 2,22:1 en oscuro.
    test.fail();
    await verResultado(page, ESTANDAR_11);
    const fondo = await page.locator('[class*="heroResultados"]').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { imagen: cs.backgroundImage, color: cs.backgroundColor };
    });
    expect(fondo.imagen).toBe('none');
    expect(fondo.color).toBe('rgb(26, 82, 120)');
  });

  test('al pulsar «Ver resultado» el foco no se pierde en <body> (de familia)', async ({ page }) => {
    // HALLAZGO abierto: la sección del test se desmonta con el botón enfocado y el foco cae a <body>;
    // el resultado no está en ninguna región viva, así que un lector de pantalla no anuncia nada.
    test.fail();
    await abrirTest(page);
    for (let i = 0; i < 10; i++) {
      await page.locator('[role="radiogroup"] [role="radio"]').first().click();
      if (i < 9) await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
    }
    await page.getByRole('button', { name: 'Ver resultado' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: 'Tu cobertura recomendada' }).waitFor();
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  });
});
