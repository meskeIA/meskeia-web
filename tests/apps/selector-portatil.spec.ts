import { test, expect, type Page } from '@playwright/test';
import { calcularResultado, PREGUNTAS } from '../../app/selector-portatil/motor';
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
 * EL MOTOR (app/selector-portatil/motor.ts): las mismas preguntas, pesos y reglas de formato,
 * sistema y gama (comprobado sobre las 331.776 combinaciones: formato, sistema, gama y modelos
 * idénticos a los de antes). Lo que cambia: el empate de formato se anuncia y lo decide la
 * pregunta de movilidad; las razones citan lo respondido y dicen cuándo manda el presupuesto.
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
// INSPECCIÓN 24/09/2026 — la reparación en lote del 99acf1e0, vista desde fuera
// ═════════════════════════════════════════════════════════════════════════════
//
// Lo que ya cubren los tests de arriba (radios, barra, empate de formato, razones de Mac sin
// Apple y gama ampliada por «Más de 1.800 €») NO se repite: se comprobó y está bien.
// Lo de aquí son los hallazgos ABIERTOS de esta inspección, cada uno con su test.fail(): pasa
// hoy y se pondrá ROJO el día que se repare (entonces se quita el test.fail).
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
// 600–1.100 € · Dependería. Resuelto a mano: portátil 4+1 = 5 frente al 2 en 1 2+1 = 3 (sin
// empate) · Mac 1, Linux 0, ChromeOS 0 → Windows · gama 0 puntos → de entrada 300 – 600 €.
const INSP_NORMAL = [1, 0, 0, 0, 1, 3, 1, 1, 1, 1] as const;

// Diseño · Gaming exigente · A diario · Estándar · Ninguno · Sin requisitos · 6–10 h · 6 años o
// más · 600–1.100 € · Prefiero nuevo. Gama: 3 + 3 + 2 + 2 = 10 → pro, y el tramo 600–1.100 € no
// la acota (solo lo hacen «Hasta 600 €» y «Más de 1.800 €»).
const INSP_MEDIO_A_PRO = [2, 3, 0, 1, 2, 3, 2, 2, 1, 2] as const;

// Igual pero < 3 h · 2–3 años · 1.100–1.800 €. Uso 3 + 3 = 6 (alta); el propio tramo suma +2
// y la lleva a 8 → pro, POR ENCIMA del tramo que la ha subido.
const INSP_ALTO_A_PRO = [2, 3, 0, 1, 2, 3, 0, 0, 2, 2] as const;

// Ofimática · No juego · A diario · Compacto · Ecosistema Apple · Sin requisitos · < 3 h ·
// 2–3 años · 600–1.100 € · PREFIERO NUEVO SIEMPRE. Mac 3 → macOS · gama 0 → de entrada, cuya
// única ficha es «MacBook Air M2 (reacondicionado) · ~900 €».
const INSP_REACOND_A_NUEVO = [1, 0, 0, 0, 0, 3, 0, 0, 1, 2] as const;

// Ofimática · Juego bastante · A diario · Compacto · Ecosistema Apple · Sin requisitos · 3–6 h ·
// 4–5 años · 600–1.100 € · Dependería. Mac 3 · gama 1 → media 600 – 1.100 € (dentro del tramo),
// pero sus dos fichas cuestan ~1.299 € y ~1.499 €.
const INSP_MAC_MEDIA = [1, 2, 0, 0, 0, 3, 1, 1, 1, 1] as const;

// Ofimática · No juego · Siempre en casa · Grande · Ninguno · Sin requisitos · 6–10 h · 4–5 años ·
// 1.100–1.800 € · Prefiero nuevo. Sobremesa 3 + 2 = 5 · Windows · gama 2 + 2 = 4 → alta: las
// tres fichas de Windows · alta son portátiles.
const INSP_SOBREMESA = [1, 0, 2, 2, 2, 3, 2, 1, 2, 2] as const;

// Uso básico · Gaming exigente · A diario · Compacto · Ninguno · Solo web y Google · < 3 h ·
// 2–3 años · 600–1.100 € · Sí. ChromeOS 3 + 2 = 5 con uso básico → ChromeOS · gama 3 → media.
const INSP_CHROME_GAMING = [0, 3, 0, 0, 2, 2, 0, 0, 1, 0] as const;

// Programación · No juego · A diario · Compacto · Ninguno · Sin requisitos · < 3 h · 2–3 años ·
// 600–1.100 € · Sí. El mejor perfil posible para Linux: 2 puntos (el umbral es 3) → Windows.
const INSP_LINUX_MEJOR = [3, 0, 0, 0, 2, 3, 0, 0, 1, 0] as const;

/** Gama máxima de cada tramo: la app publica las MISMAS horquillas en P9 y en GAMAS. */
const TOPE_TRAMO: Record<string, string> = { bajo: 'basica', medio: 'media', alto: 'alta', premium: 'pro' };
const MAX_TRAMO: Record<string, number> = { bajo: 600, medio: 1100, alto: 1800, premium: Infinity };
const ORDEN_GAMA = ['basica', 'media', 'alta', 'pro'];
/** Fichas que NO son portátiles (por su nombre y nota en motor.ts). */
const FICHAS_SOBREMESA = new Set(['Mac mini M4', 'Mac Studio M4 Max', 'System76 Thelio (sobremesa)', 'Lenovo ThinkStation P360 Ultra']);
const euros = (s: string) => Number(s.replace(/[^\d]/g, ''));

interface RecuentoInspeccion {
  total: number;
  formatos: Record<string, number>;
  sistemas: Record<string, number>;
  gamaSobreTramo: number;
  fichasSobreTramoDentroDeGama: number;
  reacondicionadoANuevo: number;
  fichasContraFormato: number;
  gamingSinAviso: number;
  ningunaInclinaFalsa: number;
}

let recuentoInspeccion: RecuentoInspeccion | null = null;
/** Las 331.776 combinaciones, una sola vez por worker (~1,5 s). */
function barridoInspeccion(): RecuentoInspeccion {
  if (recuentoInspeccion) return recuentoInspeccion;
  // Pesos de sistema copiados de motor.ts (PESOS_MAC/LINUX/CHROME no se exportan): solo para
  // saber si ALGUNA respuesta sumó a favor de otro sistema.
  const sumaAMac = (r: Record<number, string>) => r[5] === 'si_muchos' || r[5] === 'alguno' || r[6] === 'adobe' || r[1] === 'dev';
  const sumaALinux = (r: Record<number, string>) => r[1] === 'dev';
  const sumaAChrome = (r: Record<number, string>) => r[6] === 'google' || r[1] === 'basico';
  const c: RecuentoInspeccion = {
    total: 0, formatos: {}, sistemas: {}, gamaSobreTramo: 0, fichasSobreTramoDentroDeGama: 0,
    reacondicionadoANuevo: 0, fichasContraFormato: 0, gamingSinAviso: 0, ningunaInclinaFalsa: 0,
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
    const sobreTramo = ORDEN_GAMA.indexOf(res.gama) > ORDEN_GAMA.indexOf(TOPE_TRAMO[r[9]]);
    if (sobreTramo) c.gamaSobreTramo++;
    if (!sobreTramo && res.modelos.length > 0 && res.modelos.every((m) => euros(m.precio) > MAX_TRAMO[r[9]])) c.fichasSobreTramoDentroDeGama++;
    if (r[10] === 'no' && res.modelos.some((m) => /reacondicionado/i.test(m.nombre))) c.reacondicionadoANuevo++;
    const sobremesaSinSobremesa = res.formato === 'sobremesa' && res.modelos.length > 0 && res.modelos.every((m) => !FICHAS_SOBREMESA.has(m.nombre));
    const portatilConSobremesa = res.formato === 'portatil' && res.modelos.some((m) => FICHAS_SOBREMESA.has(m.nombre));
    if (sobremesaSinSobremesa || portatilConSobremesa) c.fichasContraFormato++;
    const razonSistema = res.razones.find((x) => x.startsWith('Sistema')) ?? '';
    if (r[2] === 'alto' && (res.os === 'chromeos' || res.os === 'mac') && !/jueg|gaming/i.test(razonSistema)) c.gamingSinAviso++;
    if (razonSistema.includes('ninguna de tus respuestas inclina') && (sumaAMac(r) || sumaALinux(r) || sumaAChrome(r))) c.ningunaInclinaFalsa++;
  };
  recorrer(0);
  recuentoInspeccion = c;
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
const fichas = (page: Page) => page.locator('[class*="modeloNombre"]').allInnerTexts();

test.describe('Inspección 24/09/2026 — presupuesto, resultados inalcanzables, fichas de modelos y contenido', () => {
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
  });

  test('HALLAZGO abierto: con 600–1.100 € o 1.100–1.800 € la gama no se acota al tramo declarado', async ({ page }) => {
    // HALLAZGO abierto: el presupuesto es un PESO en los tramos intermedios (79.488 perfiles), como el 943 de smartphone.
    test.fail();
    test.setTimeout(60_000);
    await abrirTest(page);
    await responder(page, INSP_MEDIO_A_PRO);
    // Esperado (lo que hace la referencia, TOPE_POR_PRESUPUESTO de selector-smartphone): gama media.
    // Hoy: «Workstation / Pro · 1.800 – 4.000+ €» con fichas de ~2.200 € y ~2.500 €.
    await expect(tarjeta(page, 2)).toHaveText('Gama media');
    await abrirTest(page);
    const texto = await responder(page, INSP_ALTO_A_PRO);
    // Esperado: gama alta (tope de 1.100–1.800 €). Hoy: pro, y la razón cita «presupuesto,
    // «1.100 – 1.800 €» (+2)» como motivo para salirse de ese mismo tramo.
    await expect(tarjeta(page, 2)).toHaveText('Gama alta');
    expect(texto).not.toContain('presupuesto, «1.100 – 1.800 €» (+2)');
  });

  test('HALLAZGO abierto: barrido — ningún perfil recibe una gama por encima de su tramo', () => {
    // HALLAZGO abierto: hoy 79.488 (32.832 medio→alta, 12.096 medio→pro, 34.560 alto→pro).
    test.fail();
    expect(barridoInspeccion().gamaSobreTramo).toBe(0);
  });

  test('HALLAZGO abierto: en la gama media de macOS las dos fichas se salen del tramo 600–1.100 €', async ({ page }) => {
    // HALLAZGO abierto: MacBook Air M3 13" ~1.299 € y 15" ~1.499 € bajo «Gama media 600 – 1.100 €» (10.800 perfiles).
    test.fail();
    await abrirTest(page);
    await responder(page, INSP_MAC_MEDIA);
    await expect(tarjeta(page, 2)).toHaveText('Gama media');
    for (const f of await fichas(page)) expect(euros(f.split('·').pop() ?? ''), f).toBeLessThanOrEqual(1100);
    expect(barridoInspeccion().fichasSobreTramoDentroDeGama).toBe(0);
  });

  test('HALLAZGO abierto: a quien responde «Prefiero nuevo siempre» no se le propone un reacondicionado', async ({ page }) => {
    // HALLAZGO abierto: «MacBook Air M2 (reacondicionado) · ~900 €» con P10 = «Prefiero nuevo siempre» (768 perfiles).
    test.fail();
    await abrirTest(page);
    await responder(page, INSP_REACOND_A_NUEVO);
    await expect(tarjeta(page, 1)).toHaveText('macOS (Apple)');
    for (const f of await fichas(page)) expect(f).not.toMatch(/reacondicionado/i);
    expect(barridoInspeccion().reacondicionadoANuevo).toBe(0);
  });

  test('HALLAZGO abierto: las fichas de modelos no contradicen el formato recomendado', async ({ page }) => {
    // HALLAZGO abierto: las fichas dependen solo de sistema × gama; 134.448 perfiles (sobremesa con
    // solo portátiles, o portátil con Mac mini / Mac Studio / ThinkStation).
    test.fail();
    await abrirTest(page);
    await responder(page, INSP_SOBREMESA);
    await expect(tarjeta(page, 0)).toHaveText('Sobremesa + Monitor');
    // Hoy: Dell XPS 15, Lenovo ThinkPad X1 Carbon y ASUS ProArt Studiobook, los tres portátiles.
    for (const f of await fichas(page)) expect(f).not.toMatch(/XPS 15|X1 Carbon|ProArt Studiobook/);
    expect(barridoInspeccion().fichasContraFormato).toBe(0);
  });

  test('HALLAZGO abierto: el resultado no lista marcas ni modelos comerciales (política 81fd4bea)', async ({ page }) => {
    // HALLAZGO abierto: fichas «Lenovo IdeaPad 3 · ~400 €»… y un consejo de marcas; smartphone los retiró el 18/05/2026.
    test.fail();
    await abrirTest(page);
    await responder(page, INSP_NORMAL);
    const bloque = await page.locator('[class*="resultadosContainer"]').innerText();
    expect(bloque).not.toMatch(/Lenovo|Dell|ASUS|Acer|HP 15s|MacBook|Mac mini|Chromebook|System76|Framework|ThinkPad/);
    await expect(page.locator('[class*="modeloNombre"]')).toHaveCount(0);
  });

  test('HALLAZGO abierto: a quien declara «Gaming exigente» no se le da ChromeOS sin avisar', async ({ page }) => {
    // HALLAZGO abierto: 25.488 perfiles con gaming exigente salen en macOS o ChromeOS, y el bloque
    // educativo de la propia app dice que Windows es «obligatorio si … quieres gaming serio».
    test.fail();
    await abrirTest(page);
    await responder(page, INSP_CHROME_GAMING);
    const sistema = (await tarjeta(page, 1).innerText()).trim();
    const razonSistema = (await page.locator('[class*="razonItem"]').allInnerTexts()).find((x) => x.startsWith('Sistema')) ?? '';
    // Esperado: Windows, o una razón de sistema que reconozca el desfase con los juegos.
    expect(sistema === 'Windows' || /jueg|gaming/i.test(razonSistema), `${sistema} · ${razonSistema}`).toBe(true);
    expect(barridoInspeccion().gamingSinAviso).toBe(0);
  });

  test('HALLAZGO abierto: barrido — Linux, que la app anuncia, sale en algún perfil', () => {
    // HALLAZGO abierto: PESOS_LINUX suma como mucho 2 («Programación») y la regla exige 3 → 0 de 331.776.
    test.fail();
    expect(barridoInspeccion().sistemas.linux ?? 0).toBeGreaterThan(0);
  });

  test('HALLAZGO abierto: barrido — el 2 en 1, que la app anuncia, sale en algún perfil', () => {
    // HALLAZGO abierto: máximo 4 (a diario + compacto + diseño) y entonces el portátil tiene 5 → 0 de 331.776.
    test.fail();
    expect(barridoInspeccion().formatos['dos-en-uno'] ?? 0).toBeGreaterThan(0);
  });

  test('HALLAZGO abierto: barrido — el mini PC, que la app describe, sale en algún perfil', () => {
    // HALLAZGO abierto: solo suma con «Siempre en casa» (+2), donde el sobremesa ya tiene +3 → 0 de 331.776.
    test.fail();
    expect(barridoInspeccion().formatos['mini-pc'] ?? 0).toBeGreaterThan(0);
  });

  test('HALLAZGO abierto: «ninguna de tus respuestas inclina hacia otro sistema» solo cuando es verdad', async ({ page }) => {
    // HALLAZGO abierto: 103.680 de los 117.504 perfiles con esa frase tienen respuestas que SÍ sumaron a otro sistema.
    test.fail();
    await abrirTest(page);
    const texto = await responder(page, INSP_LINUX_MEJOR);
    await expect(tarjeta(page, 1)).toHaveText('Windows');
    // «Programación» sumó +2 a Linux (su máximo posible) y +1 a Mac.
    expect(texto).not.toContain('ninguna de tus respuestas inclina hacia otro sistema');
    expect(barridoInspeccion().ningunaInclinaFalsa).toBe(0);
  });

  test('HALLAZGO abierto: el aviso de responsabilidad se dirige al público general', async ({ page }) => {
    // HALLAZGO abierto: variant="technical" → «dirigida a profesionales del dominio», como el 952 de smartphone.
    test.fail();
    await page.goto('/selector-portatil/');
    await esperarHidratacionBotones(page);
    await expect(page.getByText(/profesionales del dominio/)).toHaveCount(0);
  });

  test('HALLAZGO abierto: los precios en euros y los canales de compra declaran su ámbito (RegionBadge)', async ({ page }) => {
    // HALLAZGO abierto: sin <RegionBadge variant="es-data" />, como el 949 de smartphone.
    test.fail();
    await page.goto('/selector-portatil/');
    await esperarHidratacionBotones(page);
    await expect(page.getByText(/Datos de referencia: España/)).toBeVisible();
  });

  test('HALLAZGO abierto: nada fechado en 2025 presentado en presente', async ({ page }) => {
    // HALLAZGO abierto: «Guía completa: cómo elegir ordenador en 2025», «8 GB es el mínimo para 2025»
    // y «modelos de referencia actualizados para 2025» en la meta description.
    test.fail();
    await abrirTest(page);
    await responder(page, INSP_NORMAL);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).not.toContain('2025');
    expect(await page.locator('[class*="resultadosContainer"]').textContent()).not.toContain('2025');
  });

  test('HALLAZGO abierto: el truco de compra no confunde Core Ultra con la 13.ª-14.ª generación', async ({ page }) => {
    // HALLAZGO abierto: Intel ARK: el Core Ultra 5 125H es «Intel Core Ultra Processors (Series 1)»,
    // Meteor Lake; la 13.ª-14.ª generación son los Core i de Raptor Lake.
    test.fail();
    await abrirTest(page);
    await responder(page, INSP_NORMAL);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    await expect(page.getByText(/Truco de compra/)).toBeVisible();
    await expect(page.getByText(/Core Ultra 5 \(13ª-14ª gen\)/)).toHaveCount(0);
  });

  test('HALLAZGO abierto: textos pequeños de marca a 4,5:1 en tema claro', async ({ page }) => {
    // HALLAZGO abierto: medido el 24/09 — progresoPaso 3,93 · recomendacionValor 4,11 · razonesTitulo 3,67 ·
    // btnRepetir 3,93 (var(--primary) sobre fondo claro).
    test.fail();
    await page.emulateMedia({ colorScheme: 'light' });
    await abrirTest(page);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    expect.soft(await contrasteReal(page, '[class*="progresoPaso"]'), 'progresoPaso').toBeGreaterThanOrEqual(4.5);
    await responder(page, INSP_NORMAL);
    for (const clase of ['recomendacionValor', 'razonesTitulo', 'btnRepetir']) {
      expect.soft(await contrasteReal(page, `[class*="${clase}"]`), clase).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('HALLAZGO abierto: la nota de cada ficha a 4,5:1 en tema oscuro', async ({ page }) => {
    // HALLAZGO abierto: modeloDesc #9B9B9B sobre la ficha oscura (blanco al 4 % sobre #2D2D2D) = 4,39:1.
    test.fail();
    await page.goto('/selector-portatil/');
    await esperarHidratacionBotones(page);
    await activarTema(page, 'dark');
    await page.getByRole('button', { name: /Empezar el test/ }).click();
    await page.getByText('Pregunta 1 de 10').first().waitFor();
    await responder(page, INSP_NORMAL);
    expect(await contrasteReal(page, '[class*="modeloDesc"]')).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO abierto: el hero de resultados (texto blanco sobre degradado de marca) llega a 3:1', async ({ page }) => {
    // HALLAZGO abierto: «Tu ordenador ideal» 2,80:1 en claro y 2,23:1 en oscuro sobre
    // var(--primary)→var(--secondary), en vez de var(--hero-bg).
    test.fail();
    await page.emulateMedia({ colorScheme: 'light' });
    await abrirTest(page);
    await responder(page, INSP_NORMAL);
    // 32 px en negrita = texto grande: umbral 3:1.
    expect(await contrasteReal(page, '[class*="heroTitleSm"]')).toBeGreaterThanOrEqual(3);
  });
});
