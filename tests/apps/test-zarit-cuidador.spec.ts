import { test, expect, type Page } from '@playwright/test';

/**
 * Inspector — test-zarit-cuidador (segmento fiscal, suite salud)
 *
 * Primera inspección: 18/11/2026. La app promete en su <h1> «Test de Zarit — Sobrecarga del
 * Cuidador» y en su subtítulo «Escala Zarit validada en español (22 ítems) · Evaluación
 * orientativa del nivel de sobrecarga». Hay verdad comprobable con lápiz: la suma de los 22 ítems
 * y su clasificación en los tres niveles que declara.
 *
 * DÓNDE VIVE EL CÁLCULO
 *   data/fiscal/dependencia.ts
 *     · PREGUNTAS_ZARIT: 22 ítems
 *     · ESCALA_ZARIT_NIVELES (versión española de Martín et al., 1996, puntuación 1-5 → 22-110):
 *         Sin sobrecarga 22-46 · Sobrecarga leve 47-55 · Sobrecarga intensa 56-110
 *   app/test-zarit-cuidador/page.tsx → opciones 1-5 (Nunca … Casi siempre), suma directa,
 *     getNivelZarit busca el tramo [desde, hasta]; barra = (total − 22) / 88.
 *   La app declara la misma versión en el disclaimer, el subtítulo, la guía («de 1 (nunca) a 5
 *   (casi siempre), con una puntuación total entre 22 y 110») y la tabla comparativa (22-46,
 *   47-55, 56-110). El artículo de Martín et al. (Rev Gerontol 1996) no está en ningún dominio de
 *   la red de fuentes oficiales: los cortes se anclan en el módulo, que es la fuente que cita la app.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) · respuestas cíclicas 1,2,3,4,5,1,2,… (ítem i → (i mod 5) + 1)
 *     20 primeros ítems = 4 × (1+2+3+4+5) = 60 · ítems 21 y 22 = 1 + 2 = 3 → 63
 *     63 ≥ 56 → «Sobrecarga intensa», «Puntuación total: 63 / 110»
 *
 *   CASO 2 (límite)
 *     todo 1  → 22 × 1 = 22                    → Sin sobrecarga (mínimo)
 *     12 × 3 + 10 × 1 = 36 + 10 = 46            → Sin sobrecarga (último del tramo)
 *     12 × 3 + 1 × 2 + 9 × 1 = 36 + 2 + 9 = 47  → Sobrecarga leve (primero del tramo)
 *     11 × 2 + 11 × 3 = 22 + 33 = 55            → Sobrecarga leve (último del tramo)
 *     10 × 2 + 12 × 3 = 20 + 36 = 56            → Sobrecarga intensa (primero del tramo)
 *     todo 5  → 22 × 5 = 110                   → Sobrecarga intensa (máximo)
 *
 *   CASO 3 (rechazo) · 21 de 22 respondidas
 *     sin resultado: el botón dice «Responde 1 pregunta más» y está deshabilitado; ni forzando el
 *     clic aparece la sección de resultados.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 * habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO).
 */

const RUTA = '/test-zarit-cuidador/';
const ETIQUETAS: Record<number, string> = {
  1: 'Nunca',
  2: 'Casi nunca',
  3: 'A veces',
  4: 'Bastantes veces',
  5: 'Casi siempre',
};

/**
 * Un recorrido completo son 22 respuestas con el avance automático de 400 ms: ~10 s en reposo y
 * ~20 s medidos con tres inspectores a la vez (18/11/2026). Margen holgado sobre eso.
 */
const TIEMPO_RECORRIDO = 90_000;

function opcion(page: Page, valor: number) {
  return page.getByRole('button', { name: new RegExp(`^${valor}\\s*${ETIQUETAS[valor]}$`) });
}

/** Carga la app y espera a que los botones tengan React enganchado (un clic antes se pierde). */
async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Test de Zarit');
  await page.waitForFunction(() => {
    const b = document.querySelector('button[aria-label="Ir a pregunta 1"]');
    return Boolean(b && Object.keys(b).some((k) => k.startsWith('__reactProps$')));
  });
}

/** Responde en orden, como el usuario: un clic por pregunta y espera al avance automático. */
async function responder(page: Page, valores: number[]): Promise<void> {
  for (let i = 0; i < valores.length; i++) {
    await expect(page.getByText(`Pregunta ${i + 1} de 22`, { exact: true })).toBeVisible();
    await opcion(page, valores[i]).click();
    if (i < 21) await expect(page.getByText(`Pregunta ${i + 2} de 22`, { exact: true })).toBeVisible();
  }
}

async function verResultado(page: Page): Promise<{ nivel: string; puntuacion: string }> {
  await page.getByRole('button', { name: 'Ver resultado' }).click();
  const seccion = page.locator('#resultados');
  await expect(seccion).toBeVisible();
  return {
    nivel: ((await seccion.locator('h3').first().textContent()) ?? '').trim(),
    puntuacion: ((await seccion.locator('p', { hasText: 'Puntuación total' }).textContent()) ?? '').trim(),
  };
}

type Pregunta = { name: string; acceptedAnswer: { text: string } };

async function bloquesJsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.map((t) => JSON.parse(t) as Record<string, unknown>);
}

async function faqJsonLd(page: Page): Promise<Pregunta[]> {
  for (const b of await bloquesJsonLd(page)) {
    if (b['@type'] === 'FAQPage') return b.mainEntity as Pregunta[];
  }
  throw new Error('La página no lleva FAQPage en su JSON-LD');
}

const CICLICO = Array.from({ length: 22 }, (_, i) => (i % 5) + 1);

test.describe('Test de Zarit — la puntuación y su nivel', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('CASO 1 (normal) · respuestas cíclicas 1-5 = 63 → «Sobrecarga intensa», presentado como orientación', async ({ page }) => {
    test.setTimeout(TIEMPO_RECORRIDO);
    // 4 × 15 + 1 + 2 = 63 ≥ 56 (ESCALA_ZARIT_NIVELES: intensa 56-110)
    await responder(page, CICLICO);
    const r = await verResultado(page);
    expect(r.nivel).toBe('Sobrecarga intensa');
    expect(r.puntuacion).toBe('Puntuación total: 63 / 110');
    // No se presenta como diagnóstico: el resultado lo dice junto a la cifra.
    await expect(page.locator('#resultados')).toContainText(
      'Solo un profesional de salud mental puede realizar un diagnóstico.',
    );
  });

  const LIMITES: { nombre: string; valores: number[]; total: number; nivel: string }[] = [
    { nombre: 'todo «Nunca» = 22 (mínimo)', valores: Array(22).fill(1), total: 22, nivel: 'Sin sobrecarga' },
    { nombre: '12 × 3 + 10 × 1 = 46 (último sin sobrecarga)', valores: [...Array(12).fill(3), ...Array(10).fill(1)], total: 46, nivel: 'Sin sobrecarga' },
    { nombre: '12 × 3 + 2 + 9 × 1 = 47 (primero leve)', valores: [...Array(12).fill(3), 2, ...Array(9).fill(1)], total: 47, nivel: 'Sobrecarga leve' },
    { nombre: '11 × 2 + 11 × 3 = 55 (último leve)', valores: [...Array(11).fill(2), ...Array(11).fill(3)], total: 55, nivel: 'Sobrecarga leve' },
    { nombre: '10 × 2 + 12 × 3 = 56 (primero intensa)', valores: [...Array(10).fill(2), ...Array(12).fill(3)], total: 56, nivel: 'Sobrecarga intensa' },
    { nombre: 'todo «Casi siempre» = 110 (máximo)', valores: Array(22).fill(5), total: 110, nivel: 'Sobrecarga intensa' },
  ];

  for (const c of LIMITES) {
    test(`CASO 2 (límite) · ${c.nombre} → «${c.nivel}»`, async ({ page }) => {
      test.setTimeout(TIEMPO_RECORRIDO);
      expect(c.valores.reduce((a, b) => a + b, 0), 'la suma del caso').toBe(c.total);
      await responder(page, c.valores);
      const r = await verResultado(page);
      expect(r.nivel).toBe(c.nivel);
      expect(r.puntuacion).toBe(`Puntuación total: ${c.total} / 110`);
    });
  }

  test('CASO 3 (rechazo) · con 21 de 22 respondidas no hay resultado', async ({ page }) => {
    test.setTimeout(TIEMPO_RECORRIDO);
    await responder(page, Array(21).fill(3));
    await expect(page.getByText('Pregunta 22 de 22', { exact: true })).toBeVisible();
    const boton = page.getByRole('button', { name: 'Responde 1 pregunta más' });
    await expect(boton).toBeDisabled();
    await expect(page.getByText('21 de 22 respondidas', { exact: true })).toBeVisible();
    await boton.click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(300);
    await expect(page.locator('#resultados')).toHaveCount(0);
  });

  test('el aviso de que NO es diagnóstico se ve al entrar, fuera de la guía plegada', async ({ page }) => {
    await expect(page.getByText('NO constituye diagnóstico clínico')).toBeVisible();
  });

  test('HALLAZGO 5181 (REPARADO 19/11/2026) · el FAQPage da los cortes de la versión que usa la app (22-110: 46 / 47-55 / 56)', async ({ page }) => {
    // REPARADO; los cortes salen ahora de ESCALA_ZARIT_NIVELES. Era: la respuesta a «¿Qué puntuación indica sobrecarga intensa en el test de Zarit?» dice
    // «En la versión de 22 ítems con puntuación de 0 a 88, una puntuación igual o superior a 47
    // indica sobrecarga intensa. Entre 46 y 47 se considera sobrecarga leve o moderada, y por
    // debajo de 46 se interpreta como ausencia de sobrecarga». La app puntúa 1-5 (22-110) y su
    // módulo y su tabla dicen intensa 56-110 y leve 47-55. En la escala 0-88 que declara el FAQ
    // (cada ítem una unidad menos: total − 22), un 40 equivale a 62 → intensa para la app, y el
    // FAQ lo da por «ausencia de sobrecarga».
    const p = (await faqJsonLd(page)).find((q) => q.name.includes('sobrecarga intensa'));
    expect(p, 'la pregunta de los cortes').toBeDefined();
    const texto = p!.acceptedAnswer.text;
    expect(texto).not.toContain('0 a 88');
    expect(texto).toMatch(/56/);
    expect(texto).toMatch(/47\s*(?:y|a|-|–)\s*55/);
    expect(texto).toContain('Sobrecarga intensa: de 56 a 110');
    expect(texto).toContain('Sin sobrecarga: de 22 a 46');
  });

  test('HALLAZGO 5182 (REPARADO 19/11/2026) · la FAQ visible da bien la protección del convenio especial del cuidador', async ({ page }) => {
    // REPARADO; era: «Desde 2023, el Estado cubre el 100% de la cotización mediante convenio especial.
    // El cuidador queda protegido por jubilación, incapacidad temporal y muerte/supervivencia.»
    // RD 615/2007, art. 3 (BOE, texto consolidado): la asimilación al alta «será a efectos de las
    // prestaciones de jubilación y de incapacidad permanente y muerte y supervivencia»; la
    // incapacidad temporal no aparece. RDL 6/2019, disp. adic. 14.ª: «A partir del 1 de abril de
    // 2019, los convenios especiales que se suscriban…», con las cuotas abonadas «conjunta y
    // directamente por el Instituto de Mayores y Servicios Sociales (IMSERSO)»: no desde 2023.
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const item = page.locator('h3', { hasText: '¿El cuidador no profesional cotiza a la Seguridad Social?' }).locator('xpath=..');
    await expect(item).toBeVisible();
    const texto = (await item.textContent()) ?? '';
    // La IT puede nombrarse para decir que NO está; lo que no puede es contarse entre lo que protege
    expect(texto).not.toMatch(/proteg\w*[^.;]*incapacidad temporal/);
    expect(texto).toContain('incapacidad permanente');
    expect(texto).not.toContain('Desde 2023');
    expect(texto).toContain('Desde el 1 de abril de 2019 las cuotas las abona el IMSERSO');
    expect(texto).toContain('no cubre la incapacidad temporal');
  });

  test('la FAQ visible da bien la excedencia y la reducción de jornada (ET arts. 46.3 y 37.6)', async ({ page }) => {
    // ET art. 46.3: excedencia «de duración no superior a dos años» … «Durante el primer año
    // tendrá derecho a la reserva de su puesto de trabajo.» · art. 37.6: «Tendrá el mismo derecho
    // quien precise encargarse del cuidado directo … de un familiar hasta el segundo grado».
    const item = page.locator('h3', { hasText: '¿Puedo solicitar baja laboral por cuidado de familiar?' }).locator('xpath=..');
    const texto = (await item.textContent()) ?? '';
    expect(texto).toContain('art. 46.3 ET');
    expect(texto).toContain('2 años, con reserva de puesto el primer año');
    expect(texto).toContain('art. 37.6 ET');
  });

  test('HALLAZGO 5183 (REPARADO 19/11/2026) · un doble clic en una respuesta no se salta la pregunta siguiente', async ({ page }) => {
    // REPARADO: el avance solo se da si sigue en la pregunta contestada. Era: cada clic en una opción programa un setTimeout(400 ms) que hace «actual + 1»; dos
    // clics (doble clic, o corregir la respuesta antes de 400 ms, o «Siguiente →» justo después de
    // responder) programan dos avances. Medido: doble clic en «3 A veces» de la pregunta 1 →
    // «Pregunta 3 de 22» con «1 de 22 respondidas»: la 2 se salta sin aviso.
    await opcion(page, 3).dblclick();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/^Pregunta \d+ de 22$/)).toHaveText('Pregunta 2 de 22');
    // Responder y pulsar «Siguiente →» enseguida tampoco salta: de la 2 a la 3, no a la 4
    await opcion(page, 2).click();
    await page.getByRole('button', { name: 'Siguiente →' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/^Pregunta \d+ de 22$/)).toHaveText('Pregunta 3 de 22');
  });

  test('HALLAZGO 5184 (REPARADO 19/11/2026) · al ver el resultado el foco va al resultado, no a <body>', async ({ page }) => {
    // REPARADO: el foco va al título «Tu resultado» y, al repetir, a la pregunta 1; la caja del
    // 024/112 ya no lleva rol de alerta. Era: «Ver resultado» desmonta el cuestionario (con el botón pulsado dentro) y monta
    // #resultados sin mover el foco ni anunciar la cifra: document.activeElement = BODY. Lo único
    // que anuncia el lector es la caja role="alert" de «Si necesitas ayuda urgente: 024 … 112»,
    // que es contenido estático. Igual con «Repetir el test»: el foco vuelve a <body>.
    test.setTimeout(TIEMPO_RECORRIDO);
    await responder(page, CICLICO);
    await verResultado(page);
    await page.waitForTimeout(500);
    const dentro = await page.evaluate(
      () => document.getElementById('resultados')?.contains(document.activeElement) ?? false,
    );
    expect(dentro, 'el foco está dentro de #resultados').toBe(true);
    await expect(page.locator('#resultados [role="alert"]')).toHaveCount(0);
    await page.getByRole('button', { name: /Repetir el test/ }).click();
    await expect(page.getByText(/^Pregunta \d+ de 22$/)).toHaveText('Pregunta 1 de 22');
    const tag = await page.evaluate(() => document.activeElement?.tagName ?? 'NADA');
    expect(tag, 'tras repetir, el foco no cae a <body>').not.toBe('BODY');
  });

  test('HALLAZGO · las marcas «46» y «55» de la barra están en su punto de corte', async ({ page }) => {
    // ABIERTO: las cuatro marcas (22, 46, 55, 110) van con justify-content: space-between, así que
    // «46» cae al 33 % de la barra y «55» al 66 %, cuando sus cortes están en (46 − 22) / 88 =
    // 27,3 % y (55 − 22) / 88 = 37,5 %. Con 63 puntos el marcador (46,6 %) queda entre «46» y «55»
    // aunque el nivel es intenso (las zonas de color debajo sí están bien: 25:9:55).
    test.fail();
    test.setTimeout(TIEMPO_RECORRIDO);
    await responder(page, CICLICO);
    await verResultado(page);
    const pos = await page.evaluate(() => {
      const sec = document.getElementById('resultados')!;
      const marcador = sec.querySelector('div[style*="left"]') as HTMLElement;
      const pista = marcador.parentElement!.getBoundingClientRect();
      const fila = marcador.parentElement!.nextElementSibling!;
      const centro = (t: string) => {
        const s = Array.from(fila.querySelectorAll('span')).find((x) => x.textContent === t)!;
        const r = s.getBoundingClientRect();
        return (((r.left + r.right) / 2 - pista.left) / pista.width) * 100;
      };
      return { m46: centro('46'), m55: centro('55') };
    });
    // Tolerancia de 3 puntos: el defecto mide 6 (46) y 28 (55).
    expect(Math.abs(pos.m46 - 27.3), `«46» al ${pos.m46.toFixed(1)} %`).toBeLessThan(3);
    expect(Math.abs(pos.m55 - 37.5), `«55» al ${pos.m55.toFixed(1)} %`).toBeLessThan(3);
  });

  test('HALLAZGO · con una pregunta pendiente el aviso concuerda en número («Te falta 1 pregunta»)', async ({ page }) => {
    // ABIERTO: con 21 de 22 respondidas sale «Te faltan 1 pregunta por responder.»
    test.fail();
    test.setTimeout(TIEMPO_RECORRIDO);
    await responder(page, Array(21).fill(2));
    await expect(page.getByText(/Te falta/)).toContainText('Te falta 1 pregunta por responder.');
  });

  test('HALLAZGO · el mapa de preguntas dice cuáles están respondidas y la barra de progreso tiene nombre', async ({ page }) => {
    // ABIERTO: tras responder la 1, su burbuja sigue llamándose «Ir a pregunta 1», igual que las
    // pendientes: lo respondido solo se distingue por el color (la clase). El role="progressbar"
    // no tiene nombre accesible.
    test.fail();
    await opcion(page, 2).click();
    await expect(page.getByText('Pregunta 2 de 22', { exact: true })).toBeVisible();
    const burbuja = page.locator('button[aria-label^="Ir a pregunta 1"]').first();
    const nombre = (await burbuja.getAttribute('aria-label')) ?? '';
    expect(nombre).toMatch(/respondid/i);
    await expect(page.getByRole('progressbar')).toHaveAccessibleName(/.+/);
  });

  test('HALLAZGO · features del JSON-LD con al menos 4 características (CLAUDE.md §1.ter)', async ({ page }) => {
    // ABIERTO: tres características.
    test.fail();
    const app = (await bloquesJsonLd(page)).find((b) => b['@type'] === 'WebApplication');
    const lista = (app?.featureList ?? app?.features ?? []) as string[];
    expect(lista.length).toBeGreaterThanOrEqual(4);
  });

  test('HALLAZGO · la referencia de datos no atribuye la escala de Zarit a la ley de dependencia', async ({ page }) => {
    // ABIERTO: el DataReference dice «Escala Zarit — Dependencia y cuidadores — Ley 39/2006 LAPAD +
    // LPGE 2025 + RD 1051/2013 (anexo IV …) + Orden ISM/835/2023 + RDL 17/2026»: la app no usa
    // ninguna cuantía ni el copago de esas normas, y la escala es de Martín et al. (1996).
    test.fail();
    const ref = page.getByText('Escala Zarit — Dependencia y cuidadores').first().locator('xpath=..');
    await expect(ref).not.toContainText('RD 1051/2013');
  });

  test('CABO C0832 (1) · el resultado pinta los teléfonos de RECURSOS_CUIDADORES, cada uno con su organismo (SIN ANCLAR)', async ({ page }) => {
    // SIN ANCLAR (19/11/2026): 901 109 899 y 900 123 700 salen de RECURSOS_CUIDADORES
    // (data/fiscal/dependencia.ts), que no lleva fuente ni fecha de verificación propias; la fuente
    // del META del módulo son normas (Ley 39/2006, LPGE 2025, RD 1051/2013…) y ninguna da teléfonos.
    // imserso.es no está en la red de fuentes y el buscador del BOE no admitió la consulta por
    // WebFetch: los números los comprueba el usuario a mano. Este caso NO los da por buenos: fija lo
    // que pinta la app y a quién se lo atribuye, para que un cambio de número o de organismo
    // obligue a volver a cotejarlo. Esperado literal: los valores del módulo.
    test.setTimeout(TIEMPO_RECORRIDO);
    await responder(page, CICLICO);
    await verResultado(page);
    const recursos = page
      .locator('#resultados')
      .getByRole('heading', { name: 'Recursos de ayuda' })
      .locator('xpath=..');
    const tarjeta = (organismo: string) =>
      recursos.locator('strong', { hasText: organismo }).locator('xpath=..');
    await expect(tarjeta('IMSERSO')).toContainText('901 109 899');
    await expect(tarjeta('Atención a la Dependencia')).toContainText('900 123 700');
    // Con 63 puntos (sobrecarga intensa) la recomendación repite el 900 con otro nombre de servicio
    await expect(page.locator('#resultados li', { hasText: '900 123 700' })).toHaveText(
      'Teléfono de atención al cuidador: 900 123 700 (Línea de Atención a la Dependencia)',
    );
  });

  test('CABO C0832 (2) · la cifra de cuidadores de la guía cita fuente y año, o no está', async ({ page }) => {
    // ABIERTO: la guía dice «En España, se estima que hay más de 1,5 millones de cuidadores no
    // profesionales, mayoritariamente mujeres (83%), con una dedicación media superior a 10 horas
    // diarias.» sin fuente ni año (CLAUDE.md §1.quinquies, señal 1). Ni metadata.ts ni la FAQ visible
    // la repiten. La encuesta oficial de la red que trata a los cuidadores, la EDAD 2020 del INE
    // (nota de prensa del 19/04/2022, p. 11), no da ninguna de las tres: «El 63,7% de estos
    // cuidadores eran mujeres» (cuidadores principales de las personas de seis y más años con
    // discapacidad que viven en hogares) y «El 49,7% de las personas que recibían cuidados
    // señalaron ser atendidos durante ocho o más horas diarias»; ningún total de cuidadores.
    // Esperado: el párrafo que lleve esas cifras cita fuente y año, o las cifras se retiran.
    test.fail();
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const parrafos = page.locator('p').filter({ hasText: /1,5 millones|83\s?%|10 horas diarias/ });
    for (const texto of await parrafos.allTextContents()) {
      expect(texto, 'la cifra de cuidadores cita fuente y año').toMatch(
        /(INE|IMSERSO|Encuesta|EDAD|Ministerio|[Ff]uente|[Ss]egún)[^.]*\b(19|20)\d{2}\b|\b(19|20)\d{2}\b[^.]*(INE|IMSERSO|Encuesta|EDAD)/,
      );
    }
  });
});
