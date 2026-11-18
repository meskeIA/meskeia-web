import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * visualizador-circulo-quintas — INSPECTOR · 18/11/2026 (primera inspección entera)
 *
 * DÓNDE VIVE EL «CÁLCULO» — app/visualizador-circulo-quintas/page.tsx: la tabla
 * TONALIDADES_MAYORES (12 casillas en orden de quintas, cada una con su escala, armadura,
 * relativa y acordes escritos a mano), getArmadura() con NOMBRES_SOSTENIDOS/NOMBRES_BEMOLES y
 * las vecinas por índice: dominante (i+1) % 12, subdominante (i+11) % 12. No suena (sin Web Audio).
 *
 * LOS ESPERADOS NO SE COPIAN DE LA APP: salen de la regla, que este fichero lleva en código
 * (abajo, «La regla»), y se resolvieron a mano antes de abrir la app con
 * .inspector-trabajo/cq-esperados.mjs:
 *   · escala mayor T-T-S-T-T-T-S, una letra por grado;
 *   · cada casilla a una quinta justa (7 semitonos, 4 letras) de la anterior; 12 quintas = 84
 *     semitonos = 7 octavas, así que el círculo se cierra en Do;
 *   · el sostenido nuevo de cada paso horario es el VII grado de la tonalidad nueva
 *     (Fa#, Do#, Sol#, Re#, La#, Mi#, Si#); el bemol nuevo de cada paso antihorario, su IV grado
 *     (Si♭, Mi♭, La♭, Re♭, Sol♭, Do♭, Fa♭);
 *   · relativa menor = VI grado (3 semitonos por debajo);
 *   · acordes por terceras de la escala: 4+3 mayor, 3+4 menor, 3+3 disminuido.
 *
 * CASOS:
 *   1 · normal — Re mayor: Re Mi Fa# Sol La Si Do# · 2 sostenidos: Fa#, Do# · relativa Si menor ·
 *       I Re mayor, ii Mi menor, iii Fa# menor, IV Sol mayor, V La mayor, vi Si menor,
 *       vii° Do# disminuido · subdominante Sol (2+5=7), dominante La (2+7=9) · I-IV-V
 *       Re-Sol-La, I-V-vi-IV Re-La-Si m-Sol, ii-V-I Mi m-La-Re. Y las 12 casillas contra la regla.
 *   2 · límite — Fa#/Sol♭ (6 alteraciones): Fa# Sol# La# Si Do# Re# Mi# (el VII es Mi#, no Fa),
 *       6 sostenidos hasta Mi#, vii° Mi# disminuido. Do# mayor (7 sostenidos, hasta Si#, relativa
 *       La# menor), Sol♭ mayor (6 bemoles, hasta Do♭) y Do♭ mayor (7 bemoles, relativa La♭
 *       menor) son las enarmónicas que la app NOMBRA en sus casillas 7, 6 y 5. Cierre: Fa → Do.
 *   3 · operativa — teclado (Tab, Enter, Espacio), móvil a 390 px, contraste en claro y oscuro.
 *
 * Las escalas, armaduras, relativas, acordes, vecinas y progresiones de las 12 casillas
 * CUADRAN con la regla. Lo que no cuadra va en test.fail() con «ABIERTO»: cuando se repare, el
 * test «pasará», Playwright lo marcará como fallo inesperado y habrá que quitar el test.fail().
 */

const RUTA = '/visualizador-circulo-quintas/';

// ── La regla ──────────────────────────────────────────────────────────────────────────────
const LETRAS = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
const NATURAL = [0, 2, 4, 5, 7, 9, 11];
const ESCALA_MAYOR = [0, 2, 4, 5, 7, 9, 11]; // T-T-S-T-T-T-S, acumulado en semitonos

interface Nota {
  texto: string;
  alteracion: number;
}

interface Tonalidad {
  tonica: string;
  pc: number;
  notas: string[];
  sostenidos: number;
  bemoles: number;
  relativa: string;
  acordes: string[];
}

function nota(letra: number, pc: number): Nota {
  let alteracion = (((pc - NATURAL[letra]) % 12) + 12) % 12;
  if (alteracion > 6) alteracion -= 12;
  const signo = alteracion > 0 ? '#'.repeat(alteracion) : '♭'.repeat(-alteracion);
  return { texto: LETRAS[letra] + signo, alteracion };
}

function tonalidadMayor(letra: number, pc: number): Tonalidad {
  const escala = ESCALA_MAYOR.map((s, k) => nota((letra + k) % 7, (pc + s) % 12));
  const pcs = ESCALA_MAYOR.map((s) => (pc + s) % 12);
  const acordes = pcs.map((raiz, k) => {
    const tercera = (pcs[(k + 2) % 7] - raiz + 12) % 12;
    const quinta = (pcs[(k + 4) % 7] - pcs[(k + 2) % 7] + 12) % 12;
    const tipo =
      tercera === 4 && quinta === 3 ? 'mayor' : tercera === 3 && quinta === 4 ? 'menor' : tercera === 3 && quinta === 3 ? 'disminuido' : '?';
    return `${escala[k].texto} ${tipo}`;
  });
  return {
    tonica: escala[0].texto,
    pc,
    notas: escala.map((n) => n.texto),
    sostenidos: escala.filter((n) => n.alteracion > 0).length,
    bemoles: escala.filter((n) => n.alteracion < 0).length,
    relativa: escala[5].texto,
    acordes,
  };
}

/** Ocho tonalidades desde Do, avanzando `letras` letras y `semitonos` semitonos cada vez. */
function recorrido(letras: number, semitonos: number): Tonalidad[] {
  const lista: Tonalidad[] = [];
  for (let i = 0, l = 0, p = 0; i < 8; i++, l = (l + letras) % 7, p = (p + semitonos) % 12) lista.push(tonalidadMayor(l, p));
  return lista;
}

const HORARIO = recorrido(4, 7); // Do Sol Re La Mi Si Fa# Do#  (quinta justa ascendente)
const ANTIHORARIO = recorrido(3, 5); // Do Fa Si♭ Mi♭ La♭ Re♭ Sol♭ Do♭  (quinta descendente)
const ORDEN_SOSTENIDOS = HORARIO.slice(1).map((t) => t.notas[6]);
const ORDEN_BEMOLES = ANTIHORARIO.slice(1).map((t) => t.notas[3]);

/** La app escribe con sostenidos las casillas 0-6 (Do … Fa#) y con bemoles las 7-11 (Re♭ … Fa). */
const PRIMERA_GRAFIA: Tonalidad[] = Array.from({ length: 12 }, (_, i) => (i <= 6 ? HORARIO[i] : ANTIHORARIO[12 - i]));

function armaduraEsperada(t: Tonalidad): string {
  if (t.sostenidos > 0) return `${t.sostenidos} sostenido${t.sostenidos > 1 ? 's' : ''}: ${ORDEN_SOSTENIDOS.slice(0, t.sostenidos).join(', ')}`;
  if (t.bemoles > 0) return `${t.bemoles} bemol${t.bemoles > 1 ? 'es' : ''}: ${ORDEN_BEMOLES.slice(0, t.bemoles).join(', ')}`;
  return 'Sin alteraciones';
}

/** Clase de altura del primer nombre español de un rótulo: «Fa#/Sol♭ (F#/Gb)» → 6. */
function pcDeNombre(rotulo: string): number {
  const m = /^(Do|Re|Mi|Fa|Sol|La|Si)([#♭]*)/.exec(rotulo.trim());
  if (!m) throw new Error(`rótulo sin nota española: «${rotulo}»`);
  const base = NATURAL[LETRAS.indexOf(m[1])];
  const alteracion = (m[2].match(/#/g) ?? []).length - (m[2].match(/♭/g) ?? []).length;
  return (((base + alteracion) % 12) + 12) % 12;
}

const escaparRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Página ────────────────────────────────────────────────────────────────────────────────
const segmentosMayores = (page: Page) => page.getByRole('button', { name: /^Tonalidad / });
const segmentosMenores = (page: Page) => page.getByRole('button', { name: /^Relativa menor: / });
const panel = (page: Page) => page.getByRole('status').filter({ hasText: /Selecciona una tonalidad|Relativa menor:/ });
const centroDelCirculo = (page: Page) => page.getByRole('img', { name: 'Círculo de quintas interactivo' }).locator('text').nth(24);

/** React ha enganchado los segmentos: un clic anterior a la hidratación se pierde (cabecera de _hidratacion.ts). */
async function abrir(page: Page) {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Círculo de Quintas/);
  await page.waitForFunction(() => {
    const s = document.querySelector('svg path[role="button"]');
    return !!s && Object.keys(s).some((k) => k.startsWith('__reactProps$'));
  });
}

interface Lectura {
  titulo: string;
  relativa: string;
  armadura: string;
  notas: string[];
  grados: string[];
  acordes: string[];
  vecinas: string[];
}

async function leerPanel(p: Locator): Promise<Lectura> {
  return {
    titulo: ((await p.locator('h2').textContent()) ?? '').trim(),
    relativa: ((await p.locator('strong').first().textContent()) ?? '').trim(),
    armadura: ((await p.locator('[class$="_armaduraValor"]').textContent()) ?? '').trim(),
    notas: (await p.locator('[class$="_notaBadge"]').allTextContents()).map((s) => s.trim()),
    grados: (await p.locator('[class$="_acordeGrado"]').allTextContents()).map((s) => s.trim()),
    acordes: (await p.locator('[class$="_acordeNombre"]').allTextContents()).map((s) => s.trim()),
    vecinas: (await p.locator('[class$="_vecinaValor"]').allTextContents()).map((s) => s.trim()),
  };
}

async function elegirCasilla(page: Page, i: number): Promise<Lectura> {
  await segmentosMayores(page).nth(i).click();
  await expect(panel(page).locator('h2')).toHaveText(new RegExp(`^${escaparRegex(PRIMERA_GRAFIA[i].tonica)}[ /]`));
  return leerPanel(panel(page));
}

interface PreguntaFaq {
  pregunta: string;
  respuesta: string;
}

async function leerJsonLd(page: Page): Promise<{ faq: PreguntaFaq[]; features: string[] }> {
  return page.evaluate(() => {
    const faq: { pregunta: string; respuesta: string }[] = [];
    let features: string[] = [];
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      const nodos = (j['@graph'] as Record<string, unknown>[] | undefined) ?? [j];
      for (const n of nodos) {
        if (n['@type'] === 'FAQPage') {
          for (const q of n.mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
            faq.push({ pregunta: q.name, respuesta: q.acceptedAnswer.text });
          }
        }
        if (n['@type'] === 'WebApplication' && Array.isArray(n.featureList)) features = n.featureList as string[];
      }
    }
    return { faq, features };
  });
}

async function leerFaqVisible(page: Page): Promise<PreguntaFaq[]> {
  return page.locator('[data-guia-educativa] details').evaluateAll((ds) =>
    ds.map((d) => ({
      pregunta: (d.querySelector('summary')?.textContent ?? '').trim(),
      respuesta: (d.querySelector('p')?.textContent ?? '').trim(),
    })),
  );
}

// Contraste WCAG por píxel: el relleno de las casillas es un color de marca con opacidad
// sobre el fondo, así que se mide lo que se VE, no el CSS.
const luminancia = ([r, g, b]: number[]): number => {
  const f = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contraste = (a: number[], b: number[]): number => {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const BLANCO = [255, 255, 255];

/** Color pintado de la casilla de Sol (30°) en los dos anillos, lejos de su rótulo. */
async function coloresDeCasilla(page: Page): Promise<{ mayor: number[]; menor: number[] }> {
  const svg = page.getByRole('img', { name: 'Círculo de quintas interactivo' });
  await svg.scrollIntoViewIfNeeded();
  const caja = await svg.boundingBox();
  if (!caja) throw new Error('el círculo no tiene caja');
  const png = await page.screenshot({ clip: caja });
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const lienzo = document.createElement('canvas');
    lienzo.width = img.width;
    lienzo.height = img.height;
    const ctx = lienzo.getContext('2d');
    if (!ctx) throw new Error('sin contexto 2d');
    ctx.drawImage(img, 0, 0);
    const escala = img.width / 500; // viewBox 0 0 500 500
    const punto = (r: number, grados: number): number[] => {
      const rad = ((grados - 90) * Math.PI) / 180;
      const x = Math.round((250 + r * Math.cos(rad)) * escala);
      const y = Math.round((250 + r * Math.sin(rad)) * escala);
      return Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0, 3);
    };
    // Anillo mayor 140-210 (rótulo en 178), anillo menor 85-135 (rótulo en 110)
    return { mayor: punto(200, 30), menor: punto(125, 30) };
  }, png.toString('base64'));
}

// ══════════════════════════════════════════════════════════════════════════════════════════
test.describe('Caso 1 (normal) · Re mayor y las 12 casillas contra la regla', () => {
  test.beforeEach(async ({ page }) => abrir(page));

  test('Re mayor: escala, 2 sostenidos (Fa#, Do#), relativa Si menor y sus 7 acordes', async ({ page }) => {
    const l = await elegirCasilla(page, 2);
    expect(l.titulo).toBe('Re (D)');
    expect(l.notas).toEqual(['Re', 'Mi', 'Fa#', 'Sol', 'La', 'Si', 'Do#']);
    expect(l.armadura).toBe('2 sostenidos: Fa#, Do#');
    expect(l.relativa.replace(/\s/g, '')).toMatch(/^Sim/);
    expect(l.grados).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
    expect(l.acordes).toEqual(['Re mayor', 'Mi menor', 'Fa# menor', 'Sol mayor', 'La mayor', 'Si menor', 'Do# disminuido']);
    // Subdominante Sol (2 − 7 ≡ 7) y dominante La (2 + 7 = 9)
    expect(l.vecinas).toEqual(['Sol (G)', 'La (A)']);
    await expect(centroDelCirculo(page)).toHaveText('D');
  });

  test('Re mayor: progresiones I-IV-V, I-V-vi-IV y ii-V-I con sus acordes', async ({ page }) => {
    await elegirCasilla(page, 2);
    await panel(page).getByRole('button', { name: /Ver progresiones/ }).click();
    const acordes = (await panel(page).locator('[class$="_progAcordes"]').allTextContents()).map((s) => s.trim());
    expect(acordes).toEqual([
      'Re mayor — Sol mayor — La mayor',
      'Re mayor — La mayor — Si menor — Sol mayor',
      'Mi menor — La mayor — Re mayor',
    ]);
  });

  test('las 12 casillas: escala, armadura, relativa, acordes y vecinas cuadran con la regla', async ({ page }) => {
    test.setTimeout(60_000);
    await expect(segmentosMayores(page)).toHaveCount(12);
    for (let i = 0; i < 12; i++) {
      const t = PRIMERA_GRAFIA[i];
      const l = await elegirCasilla(page, i);
      expect(l.notas, `escala de ${t.tonica}`).toEqual(t.notas);
      expect(l.armadura, `armadura de ${t.tonica}`).toContain(armaduraEsperada(t));
      expect(l.relativa.replace(/\s/g, ''), `relativa de ${t.tonica}`).toMatch(new RegExp(`^${escaparRegex(t.relativa)}m`));
      expect(l.acordes, `acordes de ${t.tonica}`).toEqual(t.acordes);
      expect(pcDeNombre(l.vecinas[0]), `subdominante de ${t.tonica}`).toBe((t.pc + 5) % 12);
      expect(pcDeNombre(l.vecinas[1]), `dominante de ${t.tonica}`).toBe((t.pc + 7) % 12);
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════
test.describe('Caso 2 (límite) · enarmónicas y cierre del círculo', () => {
  test.beforeEach(async ({ page }) => abrir(page));

  test('Fa#/Sol♭: 6 sostenidos hasta Mi#, el VII es Mi# (no Fa) y el vii° es Mi# disminuido', async ({ page }) => {
    const l = await elegirCasilla(page, 6);
    expect(l.armadura).toBe('6 sostenidos: Fa#, Do#, Sol#, Re#, La#, Mi#');
    expect(l.notas).toEqual(['Fa#', 'Sol#', 'La#', 'Si', 'Do#', 'Re#', 'Mi#']);
    expect(l.acordes[6]).toBe('Mi# disminuido');
    expect(l.relativa.replace(/\s/g, '')).toMatch(/^Re#m/);
    // Vecinas: Si (6 − 7 ≡ 11) y Do#/Re♭ (6 + 7 ≡ 1)
    expect(l.vecinas.map(pcDeNombre)).toEqual([11, 1]);
  });

  test('el círculo se cierra: cada casilla a 7 semitonos de la anterior, y Fa vuelve a Do', async ({ page }) => {
    // Ojo: pulsar dos veces seguidas la misma casilla la suelta, así que se recorren una vez
    const lecturas: Lectura[] = [];
    for (let i = 0; i < 12; i++) lecturas.push(await elegirCasilla(page, i));
    expect(lecturas.map((l) => pcDeNombre(l.titulo))).toEqual([0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]);
    // Fa (casilla 11): su dominante es Do (5 + 7 = 12 ≡ 0) …
    expect(lecturas[11].vecinas).toEqual(['Si♭ (Bb)', 'Do (C)']);
    // … y la subdominante de Do es Fa (0 − 7 ≡ 5)
    expect(lecturas[0].vecinas).toEqual(['Fa (F)', 'Sol (G)']);
    expect(lecturas[0].armadura).toContain('Sin alteraciones');
  });

  /**
   * HALLAZGO (18/11/2026, ABIERTO) · las casillas 5, 6 y 7 se titulan con DOS tonalidades
   * («Si/Do♭», «Fa#/Sol♭», «Re♭/Do#») pero la armadura, la escala, la relativa y los acordes son
   * solo los de la primera. Quien busca Do# mayor —la de más alteraciones— lee «Re♭/Do# (Db/C#)»
   * y debajo «5 bemoles». La regla: Do# mayor lleva 7 sostenidos (Fa#, Do#, Sol#, Re#, La#, Mi#,
   * Si#) y relativa La# menor; Sol♭ mayor, 6 bemoles hasta Do♭; Do♭ mayor, 7 bemoles y relativa
   * La♭ menor. El FAQPage lo dice («Sol♭ mayor tiene 6 bemoles»), pero la app no lo muestra nunca.
   * Vale cualquier reparación: dar la armadura de la segunda o dejar de nombrarla en el panel.
   */
  test.fail('ABIERTO · si el panel nombra Do#, Sol♭ o Do♭, da también su armadura (7♯, 6♭, 7♭)', async ({ page }) => {
    const casos = [
      { casilla: 7, nombre: 'Do#', armadura: `7 sostenidos: ${ORDEN_SOSTENIDOS.join(', ')}` },
      { casilla: 6, nombre: 'Sol♭', armadura: `6 bemoles: ${ORDEN_BEMOLES.slice(0, 6).join(', ')}` },
      { casilla: 5, nombre: 'Do♭', armadura: `7 bemoles: ${ORDEN_BEMOLES.join(', ')}` },
    ];
    for (const c of casos) {
      const l = await elegirCasilla(page, c.casilla);
      const texto = (await panel(page).textContent()) ?? '';
      if (l.titulo.includes(c.nombre)) expect(texto, `panel «${l.titulo}»`).toContain(c.armadura);
    }
  });

  /**
   * HALLAZGO (18/11/2026, ABIERTO) · `features` («Resaltado visual de enharmonías (F#/Gb, B/Cb,
   * C#/Db)» y «… resaltado de vecinas y enharmonías») y el FAQPage («se resaltan visualmente como
   * enharmonías») prometen un resaltado que no existe: en reposo las 12 casillas tienen el mismo
   * relleno, opacidad y borde, y la casilla 7 se rotula solo «D♭».
   */
  test.fail('ABIERTO · si se promete resaltar las enarmonías, sus casillas se distinguen en reposo', async ({ page }) => {
    const { faq, features } = await leerJsonLd(page);
    const promesas = [...features, ...faq.map((q) => q.respuesta)].filter((t) => /resalt/i.test(t) && /enh?arm[oó]n/i.test(t));
    if (promesas.length === 0) return;
    const estilos = await segmentosMayores(page).evaluateAll((ps) =>
      ps.map((p) => {
        const cs = getComputedStyle(p);
        return `${cs.fill}|${cs.opacity}|${cs.stroke}|${cs.strokeWidth}`;
      }),
    );
    for (const i of [5, 6, 7]) expect(estilos[i], `casilla ${i} frente a Do`).not.toBe(estilos[0]);
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════
test.describe('Caso 3 (operativa) · teclado', () => {
  test.beforeEach(async ({ page }) => abrir(page));

  test('Tab llega a la casilla de Do, Enter la elige y otro Enter la suelta', async ({ page }) => {
    let enfocado = '';
    for (let n = 0; n < 20 && enfocado !== 'Tonalidad Do (C)'; n++) {
      await page.keyboard.press('Tab');
      enfocado = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? '');
    }
    expect(enfocado).toBe('Tonalidad Do (C)');
    const foco = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
    expect(foco).toBe('solid');
    await page.keyboard.press('Enter');
    await expect(panel(page).locator('h2')).toHaveText('Do (C)');
    await page.keyboard.press('Enter');
    await expect(panel(page)).toContainText('Selecciona una tonalidad');
  });

  /**
   * HALLAZGO (18/11/2026, ABIERTO) · el onKeyDown de cada casilla atiende el Espacio sin
   * preventDefault(): la casilla se elige, pero el navegador además desplaza la página una
   * pantalla (scrollY 0 → 648 a 1280 × 900) y el círculo se va de la vista.
   */
  test.fail('ABIERTO · Espacio elige la casilla sin desplazar la página', async ({ page }) => {
    const sol = page.getByRole('button', { name: 'Tonalidad Sol (G)' });
    await sol.focus();
    const antes = await page.evaluate(() => window.scrollY);
    await page.keyboard.press(' ');
    await expect(panel(page).locator('h2')).toHaveText('Sol (G)');
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.scrollY)).toBe(antes);
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════
test.describe('Caso 3 (operativa) · móvil a 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  test.beforeEach(async ({ page }) => abrir(page));

  test('sin desbordamiento horizontal; tocar Re pone su panel a la vista con 2 sostenidos', async ({ page }) => {
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const re = page.getByRole('button', { name: 'Tonalidad Re (D)' });
    await re.scrollIntoViewIfNeeded();
    await re.tap();
    await expect(panel(page).locator('h2')).toHaveText('Re (D)');
    await expect(panel(page).locator('h2')).toBeInViewport();
    await expect(panel(page).locator('[class$="_armaduraValor"]')).toHaveText('2 sostenidos: Fa#, Do#');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  /**
   * HALLAZGO (18/11/2026, ABIERTO) · los rótulos del círculo llevan font-size en unidades del
   * viewBox (11, 9 y 8 sobre 500): a 390 px el SVG mide 300 px (escala 0,6) y quedan en 6,6 px
   * (mayores), 5,4 px (menores) y 4,8 px (centro). Umbral: 9 px, la letra más pequeña que la
   * propia app usa fuera del círculo en móvil (.acordeNombre, 0,58 rem = 9,28 px).
   */
  test.fail('ABIERTO · los rótulos del círculo miden al menos 9 px en pantalla', async ({ page }) => {
    const minimo = await page.getByRole('img', { name: 'Círculo de quintas interactivo' }).evaluate((svg) => {
      const escala = svg.getBoundingClientRect().width / 500;
      return Math.min(...Array.from(svg.querySelectorAll('text')).map((t) => parseFloat(getComputedStyle(t).fontSize) * escala));
    });
    expect(minimo).toBeGreaterThanOrEqual(9);
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════
test.describe('Caso 3 (operativa) · contraste de los rótulos blancos', () => {
  /**
   * HALLAZGO (18/11/2026, ABIERTO) · en claro, los rótulos blancos van sobre --primary al 75 % y
   * --secondary al 65 % mezclados con #FAFAFA: medido por píxel, rgb(97,163,190) → 2,80:1 y
   * rgb(133,197,195) → 1,95:1 (las vecinas, 2,36:1). Texto de 6-10 px: hace falta 4,5:1.
   */
  test.fail('ABIERTO · claro: blanco sobre casilla mayor y menor ≥ 4,5:1', async ({ page }) => {
    await abrir(page);
    await esperarPaginaAsentada(page);
    const { mayor, menor } = await coloresDeCasilla(page);
    expect(contraste(BLANCO, mayor), `anillo mayor rgb(${mayor})`).toBeGreaterThanOrEqual(4.5);
    expect(contraste(BLANCO, menor), `anillo menor rgb(${menor})`).toBeGreaterThanOrEqual(4.5);
  });

  test('oscuro: blanco sobre casilla mayor y menor ≥ 4,5:1 (5,93 y 5,17 medidos)', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('meskeia-theme', 'dark');
      } catch {
        /* sin almacenamiento: el test lo verá en data-theme */
      }
    });
    await abrir(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await esperarPaginaAsentada(page);
    const { mayor, menor } = await coloresDeCasilla(page);
    // Que de verdad se midió el tema oscuro: el relleno mezcla la marca con #1A1A1A, no con #FAFAFA
    expect(mayor[0]).toBeLessThan(80);
    expect(contraste(BLANCO, mayor), `anillo mayor rgb(${mayor})`).toBeGreaterThanOrEqual(4.5);
    expect(contraste(BLANCO, menor), `anillo menor rgb(${menor})`).toBeGreaterThanOrEqual(4.5);
  });
});

// ══════════════════════════════════════════════════════════════════════════════════════════
test.describe('Contenido · FAQPage, features y guía', () => {
  test.beforeEach(async ({ page }) => abrir(page));

  test('features: al menos 4 características (CLAUDE.md §1.ter)', async ({ page }) => {
    const { features } = await leerJsonLd(page);
    expect(features.length).toBeGreaterThanOrEqual(4);
  });

  test('la FAQ «¿Qué es el círculo de quintas?» es una sola respuesta en la página y en el FAQPage', async ({ page }) => {
    const { faq } = await leerJsonLd(page);
    const visible = await leerFaqVisible(page);
    const enJsonLd = faq.find((q) => q.pregunta.startsWith('¿Qué es el círculo de quintas'));
    const enPagina = visible.find((q) => q.pregunta.startsWith('¿Qué es el círculo de quintas'));
    expect(enJsonLd?.respuesta).toBeTruthy();
    expect(enPagina?.respuesta).toBe(enJsonLd?.respuesta);
  });

  test('el FAQPage de Do mayor da los 7 acordes que dice la regla', async ({ page }) => {
    const { faq } = await leerJsonLd(page);
    const doMayor = faq.find((q) => q.pregunta.includes('Do mayor'));
    // Do mayor, Re menor, Mi menor, Fa mayor, Sol mayor, La menor, Si disminuido
    for (const a of HORARIO[0].acordes) expect(doMayor?.respuesta).toContain(a);
  });

  /**
   * HALLAZGO (18/11/2026, ABIERTO) · la misma pregunta dos veces con respuestas distintas: la FAQ
   * visible «¿Qué es una enharmonía? ¿Por qué F# y Gb suenan igual?» y la del FAQPage «¿Qué son
   * las enharmonías y por qué Fa# y Sol♭ son la misma tonalidad?». La reparación es UNA constante
   * que importen las dos (check:faq-unica).
   */
  test.fail('ABIERTO · la pregunta de las enarmonías tiene una sola respuesta', async ({ page }) => {
    const { faq } = await leerJsonLd(page);
    const visible = await leerFaqVisible(page);
    const enJsonLd = faq.find((q) => /enh?armon/i.test(q.pregunta));
    const enPagina = visible.find((q) => /enh?armon/i.test(q.pregunta));
    if (enJsonLd && enPagina) expect(enPagina.respuesta).toBe(enJsonLd.respuesta);
  });

  /**
   * HALLAZGO (18/11/2026, ABIERTO) · el FAQPage atribuye a la relativa menor una «diferencia de
   * sonoridad (alegre vs. melancólico)», y la propia página lista «Creer que mayor = alegre y
   * menor = triste» entre los «Errores frecuentes al interpretar el círculo».
   */
  test.fail('ABIERTO · el FAQPage no afirma lo que la página da como error frecuente (mayor alegre, menor triste)', async ({ page }) => {
    await expect(page.locator('[data-guia-educativa]')).toContainText('Creer que mayor = alegre y menor = triste');
    const { faq } = await leerJsonLd(page);
    expect(faq.map((q) => q.respuesta).join(' ')).not.toMatch(/alegre vs\.? melanc/i);
  });

  /**
   * HALLAZGO (18/11/2026, ABIERTO) · «Cambiar de cejilla en la guitarra equivale a moverse entre
   * tonalidades adyacentes». Por la regla, dos tonalidades adyacentes están a 7 semitonos; un
   * traste es 1 semitono (de Fa a Fa#, que en el círculo están a 5 casillas). Y «el círculo
   * muestra por qué Si♭ y La# suenan igual»: La# no aparece en el círculo; sus enarmonías
   * rotuladas son B/C♭ y F#/G♭.
   */
  test.fail('ABIERTO · la guía no dice que cambiar de cejilla equivale a moverse a una tonalidad adyacente', async ({ page }) => {
    await expect(page.locator('[data-guia-educativa]').getByText('equivale a moverse entre tonalidades adyacentes')).toHaveCount(0);
  });

  /**
   * HALLAZGO (18/11/2026, ABIERTO) · «enharmonía/enharmonías» (FAQ visible, features, pregunta del
   * FAQPage) junto a «enarmónicas» en la misma respuesta del FAQPage: una sola grafía.
   */
  test.fail('ABIERTO · una sola grafía para la enarmonía en página y JSON-LD', async ({ page }) => {
    const { faq, features } = await leerJsonLd(page);
    const textoPagina = (await page.locator('body').textContent()) ?? '';
    const todo = [textoPagina, ...features, ...faq.flatMap((q) => [q.pregunta, q.respuesta])].join(' ');
    const conH = /enharm/i.test(todo);
    const sinH = /\benarm/i.test(todo);
    expect(conH && sinH).toBe(false);
  });

  /**
   * HALLAZGO (18/11/2026, ABIERTO) · «Haz clic en cualquier tonalidad para explorar sus acordes»,
   * y el anillo interior es pulsable, pero pulsar «Em» abre el panel de Sol mayor: el centro dice
   * «G mayor», el acorde I es Sol mayor y el I-IV-V es Sol-Do-Re. Por la regla, Mi menor natural
   * (Mi Fa# Sol La Si Do Re) tiene i = Mi menor, iv = La menor, v = Si menor.
   */
  test.fail('ABIERTO · pulsar una relativa menor muestra esa tonalidad menor, no la mayor', async ({ page }) => {
    await segmentosMenores(page).nth(1).click();
    await expect(panel(page).locator('h2')).toBeVisible();
    await expect(centroDelCirculo(page)).not.toHaveText('G');
    const primero = ((await panel(page).locator('[class$="_acordeNombre"]').first().textContent()) ?? '').trim();
    expect(primero).toBe('Mi menor');
  });
});
