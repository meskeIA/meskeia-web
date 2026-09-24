import { test, expect, type Page } from '@playwright/test';
import {
  calcularResultado, PREGUNTAS, ORDEN_GAMAS, TOPE_POR_PRESUPUESTO, PESOS_MAC, PESOS_LINUX, PESOS_CHROME, FORMATOS,
} from '../../app/selector-portatil/motor';
import { activarTema } from '../contraste-text-muted-auxiliares';

/**
 * Asesor de Portátil (selector-portatil) — reparado el 24/09/2026 desde una sospecha del
 * Inspector sobre la familia de los selectores (selector-smartphone 950/951 y
 * selector-mascota 1341/1342, repetidos aquí).
 *
 * LO QUE SE CONFIRMÓ EN EL NAVEGADOR ANTES DE TOCAR NADA
 *   · Las opciones eran <button aria-pressed> dentro de role="radiogroup": 4 botones, 0 radios.
 *   · La barra decía aria-valuenow = paso + 1 con mínimo 1, y pintaba paso / 10: en la
 *     pregunta 2 anunciaba 0,111 y pintaba 0,100.
 *   · Empate de formato: con «A veces» fuera de casa y pantalla «Grande», portátil y
 *     sobremesa empatan a 2 y ganaba el portátil por ir primero en el array, sin decirlo
 *     (27.648 de los 331.776 perfiles).
 *   · Razones fijas por resultado: en 5.184 perfiles salía Mac a quien había respondido «No,
 *     ninguno» dispositivo Apple (por «Suite Adobe» + «Programación»), y la app le decía «Con
 *     tu ecosistema Apple ya establecido…»; y a cualquier gama alta o pro, «Tu uso intensivo o
 *     creativo justifica…», aunque la hubiera subido solo el presupuesto.
 *
 * EL MOTOR (app/selector-portatil/motor.ts), en aquella reparación: las mismas preguntas, pesos
 * y reglas de formato, sistema y gama. Lo que cambió: el empate de formato se anuncia y lo decide
 * la pregunta de movilidad; las razones citan lo respondido y dicen cuándo manda el presupuesto.
 * La reparación de los hallazgos 1405-1419 (bloque del final) SÍ cambia reglas: el presupuesto
 * pasa a ser un tope, hay restricciones de sistema, Linux y el mini PC son alcanzables, el 2 en 1
 * deja de ser un resultado y las fichas de modelos son ahora un perfil técnico. Los seis tests de
 * arriba siguen valiendo tal cual: sus perfiles no dependen de nada de eso.
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
  await page.goto('/selector-portatil/');
  await esperarHidratacionBotones(page);
  await page.getByRole('button', { name: /Empezar el test/ }).click();
  await page.getByText('Pregunta 1 de 10').first().waitFor();
}

async function responder(page: Page, indices: readonly number[]): Promise<string> {
  for (let i = 0; i < indices.length; i++) {
    await page.locator('[role="radiogroup"] [role="radio"]').nth(indices[i]).click();
    await page.getByRole('button', { name: i === indices.length - 1 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await page.getByRole('heading', { name: 'Tu ordenador ideal' }).waitFor();
  return (await page.locator('[class*="resultadosContainer"]').innerText()).replace(/\s+/g, ' ');
}

// Uso básico · No juego · A VECES fuera de casa · Pantalla GRANDE · Ecosistema Apple ·
// Solo Windows · < 3 h · 2 – 3 años · Hasta 600 € · Reacondicionado sí.
//   Formato: «A veces» portátil +2 · «Grande» sobremesa +2 → empate a 2; la pregunta de
//   movilidad da 2 al portátil y 0 al sobremesa. Sistema: Apple +3, solo Windows −3 → Windows.
//   Gama: solo el presupuesto, −3 → de entrada.
const EMPATE_FORMATO = [0, 0, 1, 2, 0, 0, 0, 0, 0, 0] as const;

// Programación · No juego · A diario · Compacto · NINGÚN dispositivo Apple · Suite Adobe ·
// < 3 h · 2 – 3 años · 600 – 1.100 € · Reacondicionado sí.
//   Mac: Adobe +2, programación +1 = 3 → macOS. Antes: «Con tu ecosistema Apple ya
//   establecido…». Gama: programación +2 → media.
const MAC_SIN_APPLE = [3, 0, 0, 0, 2, 1, 0, 0, 1, 0] as const;

// Uso básico · No juego · Siempre en casa · Me da igual · Ningún Apple · Sin requisitos ·
// < 3 h · 2 – 3 años · MÁS DE 1.800 € · Prefiero nuevo.
//   Gama por uso: 0 → de entrada; el tramo «Más de 1.800 €» la sube a pro. Antes: «Tu uso
//   intensivo o creativo justifica invertir…», a quien acababa de responder uso básico.
const PRO_POR_PRESUPUESTO = [0, 0, 2, 3, 2, 3, 0, 0, 3, 2] as const;

test('el grupo de opciones tiene radios de verdad, y aria-checked sigue al clic', async ({ page }) => {
  await abrirTest(page);
  const grupo = page.locator('[role="radiogroup"]').first();
  await expect(grupo.locator('[role="radio"]')).toHaveCount(4);
  await expect(grupo.locator('[aria-pressed]')).toHaveCount(0);
  await expect(grupo.locator('[aria-checked="true"]')).toHaveCount(0);
  await grupo.locator('[role="radio"]').nth(3).click();
  await expect(grupo.locator('[role="radio"]').nth(3)).toHaveAttribute('aria-checked', 'true');
  await grupo.locator('[role="radio"]').nth(1).click();
  await expect(grupo.locator('[role="radio"]').nth(1)).toHaveAttribute('aria-checked', 'true');
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

test('el empate de formato se anuncia y lo decide la pregunta de movilidad', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, EMPATE_FORMATO);
  await expect(page.locator('[class*="recomendacionValor"]').first()).toHaveText('Portátil');
  await expect(page.locator('[class*="avisoEmpate"]')).toContainText(
    'el portátil y el sobremesa con monitor encajan exactamente igual; se muestra primero el portátil porque encaja mejor con lo que has dicho sobre llevarte el ordenador fuera de casa',
  );
  expect(texto).toContain('Formato — Portátil, por lo que has respondido: movilidad, «A veces» (+2).');
  expect(texto).toContain('Sistema — Windows: necesitas software que solo existe para Windows.');
});

test('las razones salen de las respuestas: sin un solo Apple no se habla de «tu ecosistema Apple»', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, MAC_SIN_APPLE);
  await expect(page.locator('[class*="recomendacionValor"]').nth(1)).toHaveText('macOS (Apple)');
  expect(texto).not.toContain('ecosistema Apple ya establecido');
  expect(texto).toContain(
    'Sistema — macOS, por lo que has respondido: software que necesitas, «Suite Adobe principalmente» (+2); uso principal, «Programación o ciencia de datos» (+1).',
  );
  expect(texto).toContain('Gama — media, por lo que has respondido: uso principal, «Programación o ciencia de datos» (+2).');
});

test('si la gama la sube el presupuesto, se dice: no se atribuye un uso intensivo', async ({ page }) => {
  await abrirTest(page);
  const texto = await responder(page, PRO_POR_PRESUPUESTO);
  await expect(page.locator('[class*="recomendacionValor"]').nth(2)).toHaveText('Workstation / Pro');
  expect(texto).not.toContain('Tu uso intensivo o creativo justifica');
  expect(texto).toContain('Gama — workstation o pro: con tu uso bastaría la gama de entrada; el salto responde a tu presupuesto de más de 1.800 €');
});

test('motor: ningún empate de formato en silencio, y ninguna razón cita algo no respondido', () => {
  test.setTimeout(120_000);
  const ops = PREGUNTAS.map((p) => p.opciones);
  const r: Record<number, string> = {};
  const fallos: string[] = [];
  const mal = (msg: string) => { if (fallos.length < 10) fallos.push(`${JSON.stringify(r)} → ${msg}`); };
  let total = 0;
  let empates = 0;
  const recorrer = (i: number): void => {
    if (i === ops.length) {
      total++;
      const res = calcularResultado(r);
      if (res.formatosEmpatados.length > 0) {
        empates++;
        if (!res.criterioDesempate.includes('encaja mejor con')) mal(`empate sin criterio: ${res.criterioDesempate}`);
      } else if (res.criterioDesempate !== '') {
        mal('criterio sin empate');
      }
      if (res.os === 'mac' && r[5] === 'no' && res.razones.some((x) => x.includes('ecosistema'))) mal('habla de ecosistema sin Apple');
      for (const razon of res.razones) {
        for (const m of razon.matchAll(/«([^»]+)»/g)) {
          if (!PREGUNTAS.some((p) => p.opciones.some((o) => o.etiqueta === m[1] && r[p.id] === o.valor))) mal(`cita «${m[1]}», no respondida`);
        }
      }
      return;
    }
    for (const o of ops[i]) {
      r[PREGUNTAS[i].id] = o.valor;
      recorrer(i + 1);
    }
  };
  recorrer(0);
  expect(fallos).toEqual([]);
  expect(total).toBe(331_776);
  expect(empates).toBe(27_648);
});


// ═════════════════════════════════════════════════════════════════════════════
// REPARACIÓN 24/09/2026 — hallazgos 1405-1419 de la inspección del mismo día
// ═════════════════════════════════════════════════════════════════════════════
//
// La inspección dejó aquí 18 test.fail(), uno por hallazgo. Se han reescrito como tests en verde
// que reproducen el caso de su ficha y exigen el comportamiento reparado; los barridos del motor
// cuentan 0 perfiles en falta donde antes contaban miles. Cada test dice de qué hallazgo sale y,
// cuando la reparación no es la que el «esperado» de la ficha suponía, por qué.
//
// Índices de opción por pregunta (0 = la primera), para leer los recorridos:
//   P1 uso: básico 0 · ofimática 1 · diseño 2 · programación 3
//   P2 juegos: no 0 · ligeros 1 · bastante 2 · exigente 3
//   P3 fuera de casa: a diario 0 · a veces 1 · siempre en casa 2
//   P4 pantalla: compacto 0 · estándar 1 · grande 2 · me da igual 3
//   P5 Apple: ecosistema 0 · alguno 1 · ninguno 2
//   P6 software: solo Windows 0 · Adobe 1 · web y Google 2 · sin requisitos 3
//   P7 horas: <3 0 · 3-6 1 · 6-10 2 · >10 3        P8 años: 2-3 0 · 4-5 1 · 6+ 2
//   P9 presupuesto: hasta 600 0 · 600-1.100 1 · 1.100-1.800 2 · más de 1.800 3
//   P10 reacondicionado: sí 0 · depende 1 · prefiero nuevo 2

// Ofimática · No juego · A diario · Compacto · Alguno · Sin requisitos · 3–6 h · 4–5 años ·
// 600–1.100 € · Dependería. A mano: portátil 4+1 = 5 frente a 0 del escritorio · Mac 1 (Alguno),
// Linux 0 (no programa), ChromeOS 0 → Windows · uso 0 puntos → gama de entrada 300 – 600 €, con
// margen en el tramo de 600 a 1.100 €.
const INSP_NORMAL = [1, 0, 0, 0, 1, 3, 1, 1, 1, 1] as const;

// Diseño · Gaming exigente · A diario · Estándar · Ninguno · Sin requisitos · 6–10 h · 6 años o
// más · 600–1.100 € · Prefiero nuevo. Uso 3 + 3 + 2 + 2 = 10 → pro; el tope del tramo 600–1.100 €
// es la gama media.
const INSP_MEDIO_A_PRO = [2, 3, 0, 1, 2, 3, 2, 2, 1, 2] as const;

// Igual pero < 3 h · 2–3 años · 1.100–1.800 €. Uso 3 + 3 = 6 → alta, que cabe en su tramo. Antes
// el tramo sumaba +2 y la llevaba a 8 → pro, por encima del tramo que la había subido.
const INSP_ALTO_A_PRO = [2, 3, 0, 1, 2, 3, 0, 0, 2, 2] as const;

// Ofimática · No juego · A diario · Compacto · Ecosistema Apple · Sin requisitos · < 3 h ·
// 2–3 años · 600–1.100 € · PREFIERO NUEVO SIEMPRE. Mac 3 → macOS · uso 0 → entrada, pero no hay
// Mac nuevo por debajo de 600 € → gama media, que cabe en el tramo. Antes: única ficha «MacBook
// Air M2 (reacondicionado) · ~900 €».
const INSP_REACOND_A_NUEVO = [1, 0, 0, 0, 0, 3, 0, 0, 1, 2] as const;

// Ofimática · Juego bastante · A diario · Compacto · Ecosistema Apple · Sin requisitos · 3–6 h ·
// 4–5 años · 600–1.100 € · Dependería. Mac 3 · uso 1 → media 600 – 1.100 €. Antes sus dos fichas
// costaban ~1.299 € y ~1.499 €.
const INSP_MAC_MEDIA = [1, 2, 0, 0, 0, 3, 1, 1, 1, 1] as const;

// Ofimática · No juego · Siempre en casa · Grande · Ninguno · Sin requisitos · 6–10 h · 4–5 años ·
// 1.100–1.800 € · Prefiero nuevo. Escritorio 3 + 2 = 5 · Windows · uso 2 → media. Sin juegos, sin
// edición y sin gama alta → mini PC (antes: «Sobremesa + Monitor» con tres portátiles de ficha).
const INSP_SOBREMESA = [1, 0, 2, 2, 2, 3, 2, 1, 2, 2] as const;

// Uso básico · Gaming exigente · A diario · Compacto · Ninguno · Solo web y Google · < 3 h ·
// 2–3 años · 600–1.100 € · Sí. ChromeOS 3 + 2 = 5 con uso básico, pero el gaming exigente lo
// aparta → Windows, y la razón lo dice.
const INSP_CHROME_GAMING = [0, 3, 0, 0, 2, 2, 0, 0, 1, 0] as const;

// Programación · No juego · A diario · Compacto · Ninguno · Sin requisitos · < 3 h · 2–3 años ·
// 600–1.100 € · Sí. Linux 2 (programación) sin requisitos de software → Linux; Mac 1.
const INSP_LINUX_MEJOR = [3, 0, 0, 0, 2, 3, 0, 0, 1, 0] as const;

// Diseño · No juego · A diario · Compacto · Ninguno · Sin requisitos · < 3 h · 2–3 años ·
// 600–1.100 € · Sí: el perfil que la ficha del 2 en 1 describía («creativos en movimiento»).
const INSP_CREATIVO_MOVIL = [2, 0, 0, 0, 2, 3, 0, 0, 1, 0] as const;

// Ofimática · No juego · Siempre en casa · Me da igual · Ninguno · Sin requisitos · < 3 h ·
// 2–3 años · 600–1.100 € · Sí: el mejor perfil para el mini PC según la ficha 1410.
const INSP_MINI_PC = [1, 0, 2, 3, 2, 3, 0, 0, 1, 0] as const;

const MARCAS = /Lenovo|Dell|ASUS|Acer|HP 15s|MacBook|Mac mini|Chromebook|System76|Framework|ThinkPad|Amazon|Back Market|Notebookcheck|Beelink|Intel NUC/;

interface RecuentoReparacion {
  total: number;
  formatos: Record<string, number>;
  sistemas: Record<string, number>;
  gamaSobreTramo: number;
  perfilConPrecio: number;
  reacondicionadoANuevo: number;
  macEnEntrada: number;
  chromeSobreMedia: number;
  perfilContraFormato: number;
  gamingFueraDeWindows: number;
  bastanteConChromeOS: number;
  ningunaInclinaFalsa: number;
  conMarcas: number;
}

let recuentoReparacion: RecuentoReparacion | null = null;
/** Las 331.776 combinaciones, una sola vez por worker. */
function barridoReparacion(): RecuentoReparacion {
  if (recuentoReparacion) return recuentoReparacion;
  const sumaA = (tabla: Record<number, Record<string, number>>, r: Record<number, string>) =>
    Object.entries(tabla).some(([id, pesos]) => (pesos[r[Number(id)]] ?? 0) > 0);
  const c: RecuentoReparacion = {
    total: 0, formatos: {}, sistemas: {}, gamaSobreTramo: 0, perfilConPrecio: 0, reacondicionadoANuevo: 0,
    macEnEntrada: 0, chromeSobreMedia: 0, perfilContraFormato: 0, gamingFueraDeWindows: 0,
    bastanteConChromeOS: 0, ningunaInclinaFalsa: 0, conMarcas: 0,
  };
  const ops = PREGUNTAS.map((p) => p.opciones);
  const r: Record<number, string> = {};
  const recorrer = (i: number): void => {
    if (i < ops.length) {
      for (const o of ops[i]) { r[PREGUNTAS[i].id] = o.valor; recorrer(i + 1); }
      return;
    }
    c.total++;
    const res = calcularResultado(r);
    c.formatos[res.formato] = (c.formatos[res.formato] ?? 0) + 1;
    c.sistemas[res.os] = (c.sistemas[res.os] ?? 0) + 1;
    if (ORDEN_GAMAS.indexOf(res.gama) > ORDEN_GAMAS.indexOf(TOPE_POR_PRESUPUESTO[r[9]])) c.gamaSobreTramo++;
    const perfil = res.perfil.map((l) => l.texto);
    if (perfil.some((t) => /€/.test(t))) c.perfilConPrecio++;
    if (r[10] === 'no' && [...perfil, ...res.consejos.map((l) => l.texto)].some((t) => /reacondicionad/i.test(t))) c.reacondicionadoANuevo++;
    if (res.os === 'mac' && res.gama === 'basica') c.macEnEntrada++;
    if (res.os === 'chromeos' && ORDEN_GAMAS.indexOf(res.gama) > ORDEN_GAMAS.indexOf('media')) c.chromeSobreMedia++;
    const dePortatil = perfil.some((t) => /^Pantalla de|^Peso de|pesará más/.test(t));
    const deEscritorio = perfil.some((t) => /^Monitor aparte|^Mini PC con|^Torre con/.test(t));
    if (res.formato === 'portatil' ? deEscritorio || !dePortatil : dePortatil || !deEscritorio) c.perfilContraFormato++;
    if (res.formato === 'mini-pc' && !perfil.some((t) => t.startsWith('Mini PC con'))) c.perfilContraFormato++;
    if (res.formato === 'sobremesa' && !perfil.some((t) => t.startsWith('Torre con'))) c.perfilContraFormato++;
    if (r[2] === 'alto' && res.os !== 'windows') c.gamingFueraDeWindows++;
    if (r[2] === 'medio' && res.os === 'chromeos') c.bastanteConChromeOS++;
    const razonSistema = res.razones.find((x) => x.startsWith('Sistema')) ?? '';
    if (razonSistema.includes('ninguna de tus respuestas inclina') && (sumaA(PESOS_MAC, r) || sumaA(PESOS_LINUX, r) || sumaA(PESOS_CHROME, r))) c.ningunaInclinaFalsa++;
    if (MARCAS.test(JSON.stringify(res))) c.conMarcas++;
  };
  recorrer(0);
  recuentoReparacion = c;
  return c;
}

/** Contraste WCAG del texto contra su fondo real: capas compuestas y, con degradado, la PEOR parada. */
async function contrasteReal(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const nums = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: number[][] = [];
    let paradas: number[][] | null = null;
    for (let n: Element | null = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage.includes('gradient')) { paradas = (s.backgroundImage.match(/rgba?\([^)]+\)/g) ?? []).map(nums); break; }
      const [r, g, b, a = 1] = nums(s.backgroundColor);
      if (a > 0) capas.push([r, g, b, a]);
      if (a >= 1) break;
    }
    const cs = getComputedStyle(el);
    const [tr, tg, tb, ta = 1] = nums(cs.color);
    const alfa = ta * Number(cs.opacity);
    const fondos = paradas ?? [[255, 255, 255]];
    return Math.min(...fondos.map((base) => {
      let f = base.slice(0, 3);
      if (!paradas) for (const [r, g, b, a] of [...capas].reverse()) f = [r * a + f[0] * (1 - a), g * a + f[1] * (1 - a), b * a + f[2] * (1 - a)];
      const t = [tr * alfa + f[0] * (1 - alfa), tg * alfa + f[1] * (1 - alfa), tb * alfa + f[2] * (1 - alfa)];
      const [l1, l2] = [lum(t), lum(f)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    }));
  });
}

const tarjeta = (page: Page, i: number) => page.locator('[class*="recomendacionValor"]').nth(i);
const lineasPerfil = (page: Page) => page.locator('[class*="perfilItem"]').allInnerTexts();
const razonDe = async (page: Page, prefijo: string) =>
  (await page.locator('[class*="razonItem"]').allInnerTexts()).find((x) => x.startsWith(prefijo)) ?? '';

test.describe('Reparación 24/09/2026 — presupuesto, sistemas y formatos alcanzables, perfil técnico y contenido', () => {
  test('caso normal: ofimática a diario con 600–1.100 € → portátil, Windows, gama de entrada', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, INSP_NORMAL);
    // Esperado resuelto a mano (cabecera de INSP_NORMAL).
    await expect(tarjeta(page, 0)).toHaveText('Portátil');
    await expect(tarjeta(page, 1)).toHaveText('Windows');
    await expect(tarjeta(page, 2)).toHaveText('Gama de entrada');
    await expect(page.locator('[class*="avisoEmpate"]')).toHaveCount(0);
    expect(texto).toContain('300 – 600 €');
    expect(texto).toContain('Formato — Portátil, por lo que has respondido: movilidad, «Sí, a diario» (+4); tamaño de pantalla, «Compacto (13-14")» (+1).');
    expect(texto).toContain('Gama — de entrada: ninguna de tus respuestas pide más potencia que la de un equipo de entrada. Cabe con margen en tu presupuesto de 600 a 1.100 €.');
  });

  test('1405: con 600–1.100 € o 1.100–1.800 € la gama no pasa del tramo declarado, y se dice', async ({ page }) => {
    test.setTimeout(60_000);
    await abrirTest(page);
    const texto = await responder(page, INSP_MEDIO_A_PRO);
    // Uso 10 puntos → pro; tope del tramo 600–1.100 € → gama media (TOPE_POR_PRESUPUESTO).
    await expect(tarjeta(page, 2)).toHaveText('Gama media');
    expect(texto).toContain('Gama — media: tus respuestas de uso apuntaban a la gama workstation o pro (1.800 – 4.000+ €), pero has declarado un presupuesto de 600 a 1.100 €. Manda el presupuesto.');
    await expect(page.locator('[class*="avisoPresupuesto"]')).toContainText('la recomendación se ajusta al presupuesto que has declarado');
    // Con gaming exigente en un tramo medio, el perfil avisa de que la gráfica será de entrada.
    expect((await lineasPerfil(page)).join(' ')).toContain('Gráfica dedicada: en esta gama será de entrada');
    await abrirTest(page);
    const texto2 = await responder(page, INSP_ALTO_A_PRO);
    // Uso 6 → alta, que cabe en 1.100–1.800 €: el tramo ya no suma puntos ni se cita como motivo.
    await expect(tarjeta(page, 2)).toHaveText('Gama alta');
    expect(texto2).not.toContain('presupuesto, «1.100 – 1.800 €» (+2)');
    expect(texto2).toContain('Gama — alta, por lo que has respondido: uso principal, «Diseño, foto o vídeo» (+3); videojuegos, «Gaming exigente» (+3).');
  });

  test('1405: barrido — ningún perfil recibe una gama por encima de su tramo', () => {
    test.setTimeout(120_000);
    // Antes de la reparación: 79.488 (32.832 medio→alta, 12.096 medio→pro, 34.560 alto→pro).
    expect(barridoReparacion().gamaSobreTramo).toBe(0);
  });

  test('1406: el perfil técnico no da precios propios: solo la horquilla de su gama', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INSP_MAC_MEDIA);
    await expect(tarjeta(page, 1)).toHaveText('macOS (Apple)');
    await expect(tarjeta(page, 2)).toHaveText('Gama media');
    // Toda cifra en euros del bloque es la horquilla de la gama media, 600 – 1.100 €.
    const bloque = await page.locator('[class*="perfilSection"]').innerText();
    const euros = [...bloque.matchAll(/([\d.]+)\s*(?:–\s*([\d.]+)\s*)?€/g)].flatMap((m) => [m[1], m[2]]).filter(Boolean).map((s) => Number(s.replace(/\./g, '')));
    expect(euros).toEqual([600, 1100]);
    // «Juego bastante» con macOS: la razón avisa del catálogo (hallazgo 1408, forma blanda).
    expect(await razonDe(page, 'Sistema')).toContain('Juegas bastante: comprueba antes que tus juegos existen para este sistema');
    expect(barridoReparacion().perfilConPrecio).toBe(0);
  });

  test('1407: a quien prefiere nuevo no se le propone un reacondicionado, y un Mac no sale en la gama de entrada', async ({ page }) => {
    await abrirTest(page);
    const texto = await responder(page, INSP_REACOND_A_NUEVO);
    await expect(tarjeta(page, 1)).toHaveText('macOS (Apple)');
    // Uso 0 → entrada, pero no hay Mac nuevo por debajo de 600 € (MAC_GAMA_MINIMA, Apple Newsroom
    // España, 11/03/2026) → gama media, que cabe en 600–1.100 €.
    await expect(tarjeta(page, 2)).toHaveText('Gama media');
    expect(texto).toContain('Gama — media: con tu uso bastaría la gama de entrada, pero no hay ningún Mac nuevo por debajo de 600 € a precio general; la gama media (600 – 1.100 €) cabe en tu presupuesto.');
    expect(texto).not.toMatch(/reacondicionad/i);
    const b = barridoReparacion();
    expect(b.reacondicionadoANuevo).toBe(0);
    expect(b.macEnEntrada).toBe(0);
  });

  test('1411: el perfil técnico sigue al formato: a quien sale escritorio no se le describe un portátil', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INSP_SOBREMESA);
    // Ofimática sin juegos y gama media → mini PC (ver 1410); antes, «Sobremesa + Monitor» con
    // tres portátiles de ficha.
    await expect(tarjeta(page, 0)).toHaveText('Mini PC + Monitor');
    const perfil = (await lineasPerfil(page)).join(' · ');
    expect(perfil).toContain('Monitor aparte de 27" o más con panel IPS');
    expect(perfil).toContain('Mini PC con las salidas de vídeo');
    expect(perfil).not.toMatch(/Pantalla de|Peso de/);
    // Barrido: portátil ⇔ pantalla/peso; escritorio ⇔ monitor aparte y su mini PC o su torre.
    expect(barridoReparacion().perfilContraFormato).toBe(0);
  });

  test('1412: el resultado no lista marcas ni modelos comerciales', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INSP_NORMAL);
    // textContent: incluye la guía educativa plegada, que citaba marcas de mini PC y un sitio de pruebas.
    const bloque = await page.locator('[class*="resultadosContainer"]').textContent();
    expect(bloque).not.toMatch(MARCAS);
    await expect(page.locator('[class*="modeloNombre"]')).toHaveCount(0);
    await expect(page.locator('[class*="perfilItem"]').first()).toBeVisible();
    expect(barridoReparacion().conMarcas).toBe(0);
  });

  test('1408: «Gaming exigente» aparta ChromeOS (y macOS y Linux), y la razón lo dice', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INSP_CHROME_GAMING);
    await expect(tarjeta(page, 1)).toHaveText('Windows');
    expect(await razonDe(page, 'Sistema')).toBe(
      'Sistema — Windows. Por lo que has respondido (software que necesitas, «Solo herramientas web y Google» (+3); uso principal, «Uso básico» (+2)) encajaría ChromeOS, pero juegas a títulos exigentes («Gaming exigente»), y Windows es la plataforma con más catálogo y compatibilidad para ellos: mandan los juegos.',
    );
    const b = barridoReparacion();
    // Antes: 25.488 perfiles con gaming exigente en macOS o ChromeOS.
    expect(b.gamingFueraDeWindows).toBe(0);
    // «Juego bastante» también aparta ChromeOS, que no instala software de escritorio (su ficha).
    expect(b.bastanteConChromeOS).toBe(0);
  });

  test('1409: Linux, que la app anuncia, sale para programación sin requisitos de software', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INSP_LINUX_MEJOR);
    await expect(tarjeta(page, 1)).toHaveText('Linux');
    expect(await razonDe(page, 'Sistema')).toContain('Sistema — Linux, por lo que has respondido: uso principal, «Programación o ciencia de datos» (+2), y sin requisitos de software que lo impidan.');
    expect((await lineasPerfil(page)).join(' ')).toContain('Compatibilidad con Linux comprobada');
    // Recuento del motor tras la reparación (antes: 0 de 331.776).
    expect(barridoReparacion().sistemas.linux).toBe(11_664);
  });

  test('1410: el mini PC sale cuando el uso no pide torre; el 2 en 1 deja de prometerse y queda como consejo', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INSP_MINI_PC);
    await expect(tarjeta(page, 0)).toHaveText('Mini PC + Monitor');
    expect(await razonDe(page, 'Formato')).toContain('un mini PC lo cubre en mucho menos espacio que una torre');
    // El 2 en 1 no tenía ninguna pregunta que lo distinguiera (lápiz, pantalla táctil): ya no es un
    // resultado, sino un consejo para el perfil que su ficha describía.
    await abrirTest(page);
    await responder(page, INSP_CREATIVO_MOVIL);
    await expect(tarjeta(page, 0)).toHaveText('Portátil');
    await expect(page.locator('[class*="consejoItem"]').filter({ hasText: 'convertibles 2 en 1' })).toHaveCount(1);
    const b = barridoReparacion();
    expect(b.formatos['mini-pc']).toBe(28_320);
    expect(b.formatos['dos-en-uno'] ?? 0).toBe(0);
    expect(Object.keys(FORMATOS)).toEqual(['portatil', 'sobremesa', 'mini-pc']);
    // Nada de lo que se sirve promete el 2 en 1 como resultado del test.
    await page.goto('/selector-portatil/');
    await esperarHidratacionBotones(page);
    await expect(page.getByText('Formato recomendado (portátil, sobremesa o mini PC)')).toBeVisible();
    const jsonld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    expect(jsonld).not.toMatch(/Recomendación de formato[^"]*2 en 1/);
    expect(jsonld).toContain('Recomendación de sistema operativo: Windows, macOS, Linux o ChromeOS');
  });

  test('1415: «ninguna de tus respuestas inclina hacia otro sistema» solo cuando es verdad', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INSP_NORMAL);
    await expect(tarjeta(page, 1)).toHaveText('Windows');
    // «Alguno» sumó +1 a macOS sin llegar al umbral de 3.
    expect(await razonDe(page, 'Sistema')).toBe(
      'Sistema — Windows: alguna respuesta sumaba a otro sistema (macOS: dispositivos Apple, «Alguno» (+1)), pero no lo bastante para recomendarlo; Windows es el de mayor compatibilidad de software.',
    );
    expect(barridoReparacion().ningunaInclinaFalsa).toBe(0);
  });

  test('1416: el aviso de responsabilidad se dirige al público general', async ({ page }) => {
    await page.goto('/selector-portatil/');
    await esperarHidratacionBotones(page);
    await expect(page.getByText(/profesionales del dominio/)).toHaveCount(0);
    await expect(page.getByText(/carácter orientativo/).first()).toBeVisible();
  });

  test('1417: los precios en euros declaran su ámbito (RegionBadge es-data)', async ({ page }) => {
    await page.goto('/selector-portatil/');
    await esperarHidratacionBotones(page);
    await expect(page.getByText(/Datos de referencia: España/)).toBeVisible();
  });

  test('1413: nada fechado en 2025 presentado en presente', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INSP_NORMAL);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).not.toContain('2025');
    expect(await page.locator('meta[name="keywords"]').getAttribute('content')).not.toContain('2025');
    expect(await page.locator('[class*="resultadosContainer"]').textContent()).not.toContain('2025');
    // En el JSON-LD, salvo `datePublished` (2025-01-22): la fecha de publicación es un hecho, no
    // contenido presentado en presente.
    const jsonld = (await page.locator('script[type="application/ld+json"]').allTextContents())
      .map((b) => JSON.stringify({ ...(JSON.parse(b) as Record<string, unknown>), datePublished: undefined }));
    expect(jsonld.join(' ')).not.toContain('2025');
  });

  test('1418: el truco de compra no confunde Core Ultra con la 13.ª-14.ª generación', async ({ page }) => {
    // Intel ARK: el Core Ultra 5 125H es «Intel Core Ultra processors (Series 1)», Meteor Lake.
    await abrirTest(page);
    await responder(page, INSP_NORMAL);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    const truco = page.locator('[class*="warningBox"]');
    await expect(truco).toContainText('Truco de compra');
    await expect(truco).not.toContainText('13ª-14ª gen');
    await expect(truco).toContainText('los Intel Core Ultra (Series 1, Series 2…) son una familia distinta de los Core i de 13.ª y 14.ª generación');
  });

  test('1419: textos pequeños de marca a 4,5:1 en claro, y el perfil técnico en oscuro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await abrirTest(page);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    expect.soft(await contrasteReal(page, '[class*="progresoPaso"]'), 'progresoPaso').toBeGreaterThanOrEqual(4.5);
    await responder(page, INSP_NORMAL);
    for (const clase of ['recomendacionValor', 'razonesTitulo', 'btnRepetir', 'perfilItem', 'perfilNota']) {
      expect.soft(await contrasteReal(page, `[class*="${clase}"]`), clase).toBeGreaterThanOrEqual(4.5);
    }
    // Oscuro: la nota de cada ficha (modeloDesc, 4,39:1) ya no existe; se mide su relevo.
    await page.goto('/selector-portatil/');
    await esperarHidratacionBotones(page);
    await activarTema(page, 'dark');
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    expect.soft(await contrasteReal(page, '[class*="progresoPaso"]'), 'progresoPaso (oscuro)').toBeGreaterThanOrEqual(4.5);
    await responder(page, INSP_NORMAL);
    for (const clase of ['recomendacionValor', 'razonesTitulo', 'btnRepetir', 'perfilItem', 'perfilNota']) {
      expect.soft(await contrasteReal(page, `[class*="${clase}"]`), `${clase} (oscuro)`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('1414: el hero de resultados y los botones de avance llegan a su umbral en los dos temas', async ({ page }) => {
    for (const tema of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/selector-portatil/');
      await esperarHidratacionBotones(page);
      if (tema === 'dark') await activarTema(page, 'dark');
      // Botones con fondo de marca y texto blanco (0,9 y 1,05 rem): texto normal, umbral 4,5:1.
      expect.soft(await contrasteReal(page, '[class*="btnStart"]'), `btnStart (${tema})`).toBeGreaterThanOrEqual(4.5);
      await page.getByRole('button', { name: /Empezar el test/ }).click();
      await page.getByText('Pregunta 1 de 10').first().waitFor();
      await page.locator('[role="radio"]').nth(INSP_NORMAL[0]).click();
      expect.soft(await contrasteReal(page, '[class*="btnSiguiente"]'), `btnSiguiente (${tema})`).toBeGreaterThanOrEqual(4.5);
      await page.getByRole('button', { name: 'Siguiente pregunta' }).click();
      await page.getByText('Pregunta 2 de 10').first().waitFor();
      await responder(page, INSP_NORMAL.slice(1));
      // «Tu ordenador ideal»: 32 px en negrita = texto grande, 3:1; el subtítulo (16 px), 4,5:1.
      expect.soft(await contrasteReal(page, '[class*="heroTitleSm"]'), `heroTitleSm (${tema})`).toBeGreaterThanOrEqual(3);
      expect.soft(await contrasteReal(page, '[class*="heroSubtitleSm"]'), `heroSubtitleSm (${tema})`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('familia (forma g): tras «Ver resultado» el foco va al encabezado del resultado', async ({ page }) => {
    await abrirTest(page);
    await responder(page, INSP_NORMAL);
    await expect.poll(() => page.evaluate(() => document.activeElement?.textContent ?? '')).toBe('Tu ordenador ideal');
  });
});
