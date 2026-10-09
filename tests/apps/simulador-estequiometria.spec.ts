/**
 * Test de regresión — /simulador-estequiometria/ (origen: /inspector, primera inspección 03/10/2026)
 *
 * Qué promete la app (h1 + subtítulo + metadata): «Introduce la masa de cada reactivo y descubre
 * cuál es el reactivo limitante, cuánto producto se obtiene y cuánto exceso sobra», con «barras de
 * moles visuales (disponibles vs necesarios) para cada reactivo», 6 reacciones ajustadas y un
 * deslizador de rendimiento. Contra eso se mide todo lo de aquí abajo.
 *
 * MASAS MOLARES. Referencia: pesos atómicos estándar IUPAC/CIAAW 2021 (abreviados), los mismos que
 * cita `app/tabla-periodica/elementos-data.ts`: H 1,008 · C 12,011 · N 14,007 · O 15,999 ·
 * Na 22,990 · Cl 35,45 · Fe 55,845. Hasta el 03/10/2026 la app usaba sus propios redondeos
 * (CH₄ 16,04 · N₂ 28,02 · Fe 55,85…; hallazgos 2717 y 2718); desde la reparación las calcula de
 * la fórmula con esa tabla y las redondea a los decimales del elemento menos preciso (el Cl, con
 * dos, deja HCl y NaCl en dos). Resueltas a mano:
 *   CH₄ 12,011 + 4 × 1,008 = 16,043 · O₂ 2 × 15,999 = 31,998 · CO₂ 12,011 + 31,998 = 44,009
 *   H₂O 2,016 + 15,999 = 18,015 · H₂ 2,016 · HCl 1,008 + 35,45 = 36,458 → 36,46
 *   NaOH 22,990 + 15,999 + 1,008 = 39,997 · NaCl 22,990 + 35,45 = 58,44 · N₂ 28,014
 *   NH₃ 14,007 + 3,024 = 17,031 · Fe 55,845 · Fe₂O₃ 111,690 + 47,997 = 159,687
 *   glucosa 72,066 + 12,096 + 95,994 = 180,156 · etanol 24,022 + 6,048 + 15,999 = 46,069
 *
 * AJUSTE de las 6 ecuaciones, comprobado a mano átomo a átomo (todas cuadran):
 *   CH₄ + 2 O₂ → CO₂ + 2 H₂O        C 1=1 · H 4=4 · O 4=2+2
 *   2 H₂ + O₂ → 2 H₂O               H 4=4 · O 2=2
 *   HCl + NaOH → NaCl + H₂O         H 2=2 · Cl 1 · Na 1 · O 1
 *   N₂ + 3 H₂ → 2 NH₃               N 2=2 · H 6=6
 *   4 Fe + 3 O₂ → 2 Fe₂O₃           Fe 4=4 · O 6=6
 *   C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂      C 6=4+2 · H 12=12 · O 6=2+4
 *
 * Lo que fallaba el 03/10/2026 iba dentro de `test.fail()` con «ABIERTO, hallazgo (inspector 03/10/2026)»;
 * Se quitó cada `.fail` al repararlo (03/10/2026); los bloques REPARADO conservan el caso del acta.
 */

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
import { activarTema, desplegarTodo, prepararParaMedir } from '../contraste-text-muted-auxiliares';
import { PUERTO } from './_puerto';

/**
 * stemum.com → el servidor local, para medir la app como la sirve el portal (data-brand="stemum",
 * que cambia --primary y --secondary). Va al NIVEL DEL FICHERO porque `launchOptions` fuerza un
 * worker nuevo; al resto de tests no les afecta: solo resuelve ese host.
 */
test.use({ launchOptions: { args: [`--host-resolver-rules=MAP stemum.com 127.0.0.1:${PUERTO}`] } });

const RUTA = '/simulador-estequiometria/';

const tarjeta = (page: Page, rotulo: string) =>
  page.locator('[class*="resultadoCard"]').filter({ hasText: rotulo });
const barra = (page: Page, reactivo: string) =>
  page.locator('[class*="barGroup"]').filter({ hasText: reactivo });
const aviso = (page: Page) => page.locator('[class*="resultadoPanel"][role="alert"]');

/**
 * Bajo stemum.com, el `next dev` local rechaza el WebSocket de HMR (`allowedDevOrigins` solo
 * admite meskeia.com) y, sin él, la página NO se hidrata. El puente reenvía el socket a
 * localhost:3050, que sí se acepta; no toca ninguna petición HTTP. Con `next start` no hay HMR y
 * no hace nada. Copiado de tests/apps/simulador-mas-resorte.spec.ts (y este de simulador-punnett).
 */
async function puenteHmr(page: Page): Promise<void> {
  const abiertos: WebSocket[] = [];
  page.on('close', () => abiertos.forEach((s) => s.close()));
  await page.routeWebSocket(/\/_next\/(webpack-)?hmr/, (ws) => {
    const u = new URL(ws.url());
    const arriba = new WebSocket(`ws://localhost:${PUERTO}${u.pathname}${u.search}`);
    arriba.binaryType = 'arraybuffer';
    abiertos.push(arriba);
    const cola: (string | Buffer)[] = [];
    arriba.onopen = () => {
      for (const m of cola) arriba.send(m);
      cola.length = 0;
    };
    ws.onMessage((m) => {
      if (arriba.readyState === WebSocket.OPEN) arriba.send(m);
      else cola.push(m);
    });
    arriba.onmessage = (e: MessageEvent) =>
      ws.send(typeof e.data === 'string' ? e.data : Buffer.from(e.data as ArrayBuffer));
    ws.onClose(() => arriba.close());
  });
}

/**
 * Abre la app (en meskeia.com o, con la URL de stemum.com, como la sirve el portal) y apaga las
 * transiciones: globals.css anima color y fondo 0,3 s al cambiar de tema, y medir el contraste
 * a medio camino daba cifras que no son ni las de un tema ni las del otro.
 */
async function abrir(page: Page, url = RUTA): Promise<void> {
  if (url.includes('stemum.com')) await puenteHmr(page);
  await page.goto(url);
  await esperarHidratacion(page, ['#inputA', '#sliderRendimiento']);
  await prepararParaMedir(page);
}

/** Elige una reacción por su nombre. Ninguna de las usadas aquí es la inicial (combustión). */
async function elegir(page: Page, nombre: RegExp): Promise<void> {
  const boton = page.getByRole('button', { name: nombre });
  await expect(boton).toHaveAttribute('aria-pressed', 'false');
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
}

async function escribir(page: Page, sel: string, valor: string): Promise<void> {
  await page.locator(sel).fill(valor);
  await esperarValorEnReact(page, sel, valor);
}

/** Contraste WCAG del primer elemento que casa, componiendo los fondos semitransparentes. */
async function contraste(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    type C = { r: number; g: number; b: number; a: number };
    const parse = (c: string): C | null => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const mezcla = (s: C, d: C): C => ({
      r: s.r * s.a + d.r * (1 - s.a),
      g: s.g * s.a + d.g * (1 - s.a),
      b: s.b * s.a + d.b * (1 - s.a),
      a: 1,
    });
    const lum = ({ r, g, b }: C) => {
      const f = (v: number) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const el = document.querySelector(sel);
    if (!el) throw new Error(`No existe ${sel}`);
    const capas: C[] = [];
    let n: Element | null = el;
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) {
        capas.push(c);
        if (c.a === 1) break;
      }
      n = n.parentElement;
    }
    let fondo: C = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = capas.length - 1; i >= 0; i--) fondo = mezcla(capas[i], fondo);
    let opacidad = 1;
    for (let m: Element | null = el; m; m = m.parentElement) opacidad *= Number(getComputedStyle(m).opacity);
    const texto = parse(getComputedStyle(el).color)!;
    const color = mezcla({ ...texto, a: texto.a * opacidad }, fondo);
    const [l1, l2] = [lum(color), lum(fondo)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, selector);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CASO NORMAL — combustión del metano, 10 g de CH₄ + 30 g de O₂, rendimiento 75 %
//   n(CH₄) = 10 / 16,043 = 0,623325 mol → razón 0,623325 / 1 = 0,623325
//   n(O₂)  = 30 / 31,998 = 0,937559 mol → razón 0,937559 / 2 = 0,468779 → O₂ LIMITANTE
//   n(CO₂) = 0,468779 × 1 = 0,468779 mol → × 44,009 = 20,630508 g → «20,631 g», «0,4688 mol»
//   real   = 20,630508 × 0,75 = 15,472881 g → «15,473 g»
//   exceso CH₄: 0,623325 − 0,468779 = 0,154546 mol → × 16,043 = 2,479374 g → «2,479 g», «0,1545 mol»
//   (con las masas de antes de la reparación salían 20,630 / 15,472 / 2,481 g: ver la cabecera)
// ─────────────────────────────────────────────────────────────────────────────────────────────
async function sembrarCaso1(page: Page): Promise<void> {
  await abrir(page);
  await escribir(page, '#inputA', '10');
  await escribir(page, '#inputB', '30');
  await sembrarValor(page, '#sliderRendimiento', 75);
}

async function comprobarCaso1(page: Page): Promise<void> {
  await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Oxígeno');
  const teorica = tarjeta(page, 'Masa teórica de Dióxido de carbono');
  await expect(teorica).toContainText('20,631 g');
  await expect(teorica).toContainText('0,4688 mol');
  await expect(tarjeta(page, 'Masa real obtenida')).toContainText('15,473 g');
  const exceso = tarjeta(page, 'Reactivo en exceso');
  await expect(exceso).toContainText('Metano');
  await expect(exceso).toContainText('Sobran 2,479 g (0,1545 mol)');
  // la fórmula resaltada en la ecuación es la del limitante
  await expect(page.locator('[class*="limitanteResaltado"]')).toHaveText(/^O₂\s*$/);
}

test.describe('cálculo — escritorio', () => {
  test('caso normal: 10 g CH₄ + 30 g O₂ al 75 % → O₂ limitante, 20,631 g de CO₂, 15,473 g reales, sobran 2,479 g de CH₄', async ({ page }) => {
    await sembrarCaso1(page);
    await comprobarCaso1(page);
  });

  // REPARADO (hallazgos 2710 y 2716, inspector 03/10/2026) — las barras comparaban los moles de UN
  // reactivo con los «necesarios» del OTRO (barra A = molesA / molesBNecesarios, que es siempre
  // coefA/coefB: 50 % fijo en la combustión). Ahora cada fila es disponibles / necesarios de SU
  // reactivo, con «necesarios» = lo que exige la cantidad del otro (mismo caso 1):
  //   CH₄: 0,623325 disponibles · necesarios para gastar todo el O₂ = 0,937559 × 1/2 = 0,468779
  //        → «0,6233 / 0,4688», 0,623325 / 0,468779 = 132,97 % → «133 %»
  //   O₂:  0,937559 disponibles · necesarios para gastar todo el CH₄ = 0,623325 × 2 = 1,246650
  //        → «0,9376 / 1,2466», 0,937559 / 1,246650 = 75,21 % → «75 %»
  // ESCALA, decidida en la reparación: la barra se llena hasta lo necesario (lo que sobra la deja
  // llena) y el porcentaje real va en el texto. aria-valuenow dice ESE porcentaje (133, no el tope
  // 100 que proponía el acta) para que el lector oiga lo mismo que se lee, y aria-valuemax crece
  // con él (133) para que la fracción valuenow / valuemax sea la que se ve llena.
  test('barras de moles (caso 1): cada fila compara los moles de SU reactivo', async ({ page }) => {
    await sembrarCaso1(page);
    const ch4 = barra(page, 'Metano (CH₄)');
    const o2 = barra(page, 'Oxígeno (O₂)');
    await expect(ch4).toContainText('0,6233 mol disponibles / 0,4688 mol necesarios (133 %)');
    await expect(ch4.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '133');
    await expect(ch4.locator('[role="progressbar"]')).toHaveAttribute('aria-valuemax', '133');
    await expect(o2).toContainText('0,9376 mol disponibles / 1,2466 mol necesarios (75 %)');
    await expect(o2.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '75');
    await expect(o2.locator('[role="progressbar"]')).toHaveAttribute('aria-valuemax', '100');
    // el limitante (O₂) es el que NO llega: su relleno ocupa el 75 % de la pista y el del CH₄, toda
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(document.querySelectorAll('[role="progressbar"]')).map((t) => {
            const relleno = t.firstElementChild as HTMLElement;
            return Math.round((relleno.getBoundingClientRect().width / t.clientWidth) * 100);
          }),
        ),
      )
      .toEqual([100, 75]);
    await expect(o2.locator('[class*="limitanteBadge"]')).toHaveCount(1);
    await expect(ch4.locator('[class*="limitanteBadge"]')).toHaveCount(0);
  });

  // REPARADO (hallazgo 2710) — mismo defecto, visto en los valores por defecto de la oxidación del
  // hierro (100 g Fe, 50 g O₂): el limitante salía con la barra LLENA y el exceso a medias.
  //   n(Fe) = 100 / 55,845 = 1,790671 mol → razón /4 = 0,447668 → Fe LIMITANTE
  //   n(O₂) = 50 / 31,998 = 1,562598 mol  → razón /3 = 0,520866
  //   Fe necesario para gastar todo el O₂ = 1,562598 × 4/3 = 2,083464 → 1,790671 / 2,083464 = 85,9 % → 86
  //   O₂ necesario para gastar todo el Fe = 1,790671 × 3/4 = 1,343003 → 1,562598 / 1,343003 = 116,4 % → 116
  test('barras de moles (hierro por defecto): el limitante no sale con la barra llena', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Oxidación del hierro/);
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Hierro');
    const fe = barra(page, 'Hierro (Fe)');
    await expect(fe).toContainText('1,7907 mol disponibles / 2,0835 mol necesarios (86 %)');
    await expect(fe.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '86');
    const o2 = barra(page, 'Oxígeno (O₂)');
    await expect(o2).toContainText('1,5626 mol disponibles / 1,3430 mol necesarios (116 %)');
    await expect(o2.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '116');
  });

  // ─────────────────────────────────────────────────────────────────────────────────────────
  // LÍMITE — neutralización en proporción estequiométrica: 36,46 g HCl + 40 g NaOH
  //   n(HCl) = 36,46 / 36,46 = 1 mol · n(NaOH) = 40 / 39,997 = 1,000075 mol → razones 1 y 1,000075:
  //   difieren un 0,0075 %, menos que la incertidumbre de redondeo de las dos masas molares
  //   (0,005 / 36,46 + 0,0005 / 39,997 = 0,015 %) → estequiométrica (ver el test de «Ninguno»)
  //   n(NaCl) = 1 × 1/1 = 1 mol → 1 × 58,44 = «58,440 g», «1,0000 mol»
  //   rendimiento 0 % → masa real «0,000 g»
  // ─────────────────────────────────────────────────────────────────────────────────────────
  test('límite: 36,46 g HCl + 40 g NaOH → 58,440 g de NaCl (1,0000 mol); al 0 % de rendimiento, 0,000 g', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Neutralización ácido-base/);
    // testigo del estado de partida: con 36,5 g de HCl (razón 1,001097) el limitante es el NaOH
    // (razón 1,000075) y sobran 36,5 − 1,000075 × 36,46 = 0,037 g de HCl
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Sobran 0,037 g');
    await escribir(page, '#inputA', '36.46'); // el valor por defecto era 36.5
    await expect(tarjeta(page, 'Reactivo en exceso')).not.toContainText('Sobran');
    const teorica = tarjeta(page, 'Masa teórica de Cloruro de sodio');
    await expect(teorica).toContainText('58,440 g');
    await expect(teorica).toContainText('1,0000 mol');
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('58,440 g');
    await sembrarValor(page, '#sliderRendimiento', 0);
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('0,000 g');
    await expect(teorica).toContainText('58,440 g');
  });

  // REPARADO (hallazgo 2711, inspector 03/10/2026) — en la mezcla estequiométrica la app declaraba
  // limitante el reactivo A (por el `<=`) y «Reactivo en exceso: Hidróxido de sodio — Sobran 0,000 g
  // (0,0000 mol)»: la rama «Ninguno (estequiométrico)» que promete la FAQ era inalcanzable. Ahora dos
  // razones que difieren menos que la incertidumbre de redondeo de sus masas molares son iguales.
  test('límite: con razones iguales no hay reactivo en exceso («Ninguno (estequiométrico)»)', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Neutralización ácido-base/);
    await escribir(page, '#inputA', '36.46');
    await expect(tarjeta(page, 'Masa teórica de Cloruro de sodio')).toContainText('58,440 g');
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Ninguno (estequiométrico)');
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Ninguno: se agotan los dos a la vez');
    // ninguno de los dos se marca como limitante, ni en las barras ni en la ecuación
    await expect(page.locator('[class*="barsSection"] [class*="limitanteBadge"]')).toHaveCount(0);
    await expect(page.locator('[class*="ecuacionPanel"] [class*="limitanteResaltado"]')).toHaveCount(0);
    // con 39,997 g de NaOH (justo 1 mol con su M) también
    await escribir(page, '#inputB', '39.997');
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Ninguno (estequiométrico)');
    // y la tolerancia no se traga una diferencia real: 0,1 g más de HCl (0,27 %) ya tiene limitante.
    //   n(HCl) = 36,56 / 36,46 = 1,002743 · n(NaOH) = 1 → NaOH limitante;
    //   sobran 36,56 − 1 × 36,46 = 0,100 g de HCl (0,002743 mol → «0,0027 mol»)
    await escribir(page, '#inputA', '36.56');
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Hidróxido de sodio');
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Sobran 0,100 g (0,0027 mol)');
  });

  // LÍMITE — reacción con catalizador: fermentación, 90 g de glucosa (valor por defecto al elegirla)
  //   n(glucosa) = 90 / 180,16 = 0,499556 mol → etanol 2 × 0,499556 = 0,999112 mol → «0,9991 mol»
  //   masa = 0,999112 × 46,07 = 46,029 g → «46,029 g». Sin campo B ni tarjeta de exceso.
  test('límite: fermentación con 90 g de glucosa → 46,029 g de etanol, sin reactivo en exceso', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Fermentación alcohólica/);
    await expect(page.locator('#inputB')).toHaveCount(0);
    const teorica = tarjeta(page, 'Masa teórica de Etanol');
    await expect(teorica).toContainText('46,029 g');
    await expect(teorica).toContainText('0,9991 mol');
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Glucosa');
    await expect(tarjeta(page, 'Reactivo en exceso')).toHaveCount(0);
  });

  // RECHAZO — masa negativa, campo vacío y letras: ningún resultado, aviso de la app
  test('rechazo: −5 g, vacío y «abc» no calculan y muestran el aviso', async ({ page }) => {
    await abrir(page);
    const mensaje = 'Introduce gramos válidos y positivos para ver los resultados.';

    await escribir(page, '#inputA', '-5');
    await expect(aviso(page)).toHaveText(mensaje);
    await expect(page.locator('[class*="resultadoCard"]')).toHaveCount(0);
    await expect(page.locator('[role="progressbar"]')).toHaveCount(0);

    await escribir(page, '#inputA', '12');
    await expect(aviso(page)).toHaveCount(0);

    await escribir(page, '#inputA', '');
    await expect(aviso(page)).toHaveText(mensaje);

    // un input numérico no admite letras: el valor se queda vacío y el aviso sigue
    await page.locator('#inputA').pressSequentially('abc');
    await esperarValorEnReact(page, '#inputA', '');
    await expect(aviso(page)).toHaveText(mensaje);
    await expect(page.locator('body')).not.toContainText('NaN');
  });

  // REPARADO (hallazgo 2722, inspector 03/10/2026) — los botones ± redondeaban el valor a un
  // decimal (`Math.round((actual + delta) * 10) / 10`): 36,46 + 1 salía 37,5.
  test('operativa: los botones ± suman y restan 1 g sin redondear lo escrito (36,46 → 37,46 → 36,46 → 35,46)', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Neutralización ácido-base/);
    await escribir(page, '#inputA', '36.46');
    const mas = page.getByRole('button', { name: 'Aumentar gramos de reactivo A' });
    const menos = page.getByRole('button', { name: 'Reducir gramos de reactivo A' });
    await mas.click();
    await expect(page.locator('#inputA')).toHaveValue('37.46');
    await menos.click();
    await expect(page.locator('#inputA')).toHaveValue('36.46');
    await menos.click();
    await expect(page.locator('#inputA')).toHaveValue('35.46');
    // sin ruido de coma flotante: 0,3 + 1 = 1,3 (no 1,2999999…)
    await escribir(page, '#inputA', '0.3');
    await mas.click();
    await expect(page.locator('#inputA')).toHaveValue('1.3');
  });

  // REPARADO (hallazgo 2717, inspector 03/10/2026) — M(N₂) = 2 × 14,007 = 28,014 g/mol (IUPAC/CIAAW
  // 2021); la app usaba 28,02, que no es el redondeo de 28,014 ni a dos decimales (28,01).
  //   Efecto en el caso por defecto (28 g N₂ + 6 g H₂): n(N₂) = 28 / 28,014 = 0,999500 mol;
  //   n(H₂) = 6 / 2,016 = 2,976190 → razón /3 = 0,992063 → H₂ limitante; sobran
  //   (0,999500 − 0,992063) × 28,014 = 0,208 g de N₂ (con 28,02 salían 0,202 g).
  test('dato: la masa molar del N₂ es 28,014 g/mol (o su redondeo correcto)', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Haber-Bosch/);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 28.014);
    await expect(page.locator('label[for="inputA"]')).toContainText('M = 28,014 g/mol');
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Sobran 0,208 g');
  });

  // REPARADO (hallazgo 2718, inspector 03/10/2026) — el rótulo «M = … g/mol» se imprimía con TRES
  // decimales de un dato que tenía dos, y el tercero rellenado con 0 era falso: CH₄ «16,040» (IUPAC
  // 16,043) · O₂ «32,000» (31,998) · HCl «36,460» (36,458) · NaOH «40,000» (39,997) · Fe «55,850»
  // (55,845) · glucosa «180,160» (180,156). Ahora cada M lleva los decimales que tiene: tres, salvo
  // los compuestos con cloro, que se quedan en dos (Cl = 35,45 en la tabla abreviada).
  test('contenido: las masas molares mostradas son el redondeo correcto de la IUPAC', async ({ page }) => {
    await abrir(page);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 16.043); // CH₄
    await expectMasaMolarBienRedondeada(page, 'label[for="inputB"]', 31.998); // O₂
    await elegir(page, /Neutralización ácido-base/);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 36.458); // HCl
    await expectMasaMolarBienRedondeada(page, 'label[for="inputB"]', 39.997); // NaOH
    await elegir(page, /Oxidación del hierro/);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 55.845); // Fe
    await elegir(page, /Fermentación alcohólica/);
    await expectMasaMolarBienRedondeada(page, 'label[for="inputA"]', 180.156); // glucosa
    await expect(page.locator('label[for="inputA"]')).toContainText('M = 180,156 g/mol');
  });

  test('contenido: el HCl muestra los dos decimales que tiene el cloro (36,46, no 36,460)', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Neutralización ácido-base/);
    await expect(page.locator('label[for="inputA"]')).toContainText('M = 36,46 g/mol');
    await expect(page.locator('label[for="inputB"]')).toContainText('M = 39,997 g/mol');
  });

  // REPARADO (hallazgo 2723, inspector 03/10/2026) — «15 %» con espacio duro (regla del 25/09/2026).
  // Antes: «Rendimiento de la reacción: 100%», «Masa real obtenida (rendimiento 100%)» y el bloque
  // educativo entero con el % pegado. Las dos primeras aserciones llevan U+00A0 en la cadena.
  test('formato: el % va separado de la cifra con espacio duro', async ({ page }) => {
    await abrir(page);
    // en ninguna parte de la app (bloque educativo incluido: está en el DOM aunque nazca colapsado)
    // queda una cifra con el % pegado ni separada por un espacio normal
    const texto = (await page.locator('[class*="SimuladorEstequiometria"][class*="container"]').textContent()) ?? '';
    expect(texto).toContain('~21 % de O₂');
    expect(texto).not.toMatch(/\d%/);
    expect(texto).not.toMatch(/\d %/);
    await expect(page.locator('label[for="sliderRendimiento"]')).toContainText('100 %');
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('rendimiento 100 %');
  });
});

/** Que el número de «M = … g/mol» sea el redondeo de `iupac` a los decimales que muestra. */
async function expectMasaMolarBienRedondeada(page: Page, etiqueta: string, iupac: number): Promise<void> {
  const texto = (await page.locator(etiqueta).textContent()) ?? '';
  const m = texto.match(/M = ([\d.]*\d(?:,(\d+))?) g\/mol/);
  expect(m, `sin «M = … g/mol» en «${texto}»`).not.toBeNull();
  const mostrado = Number(m![1].replace(/\./g, '').replace(',', '.'));
  const decimales = m![2]?.length ?? 0;
  expect(
    Math.abs(mostrado - iupac),
    `«${m![0]}» no es el redondeo de ${iupac} a ${decimales} decimales`,
  ).toBeLessThanOrEqual(0.5 * 10 ** -decimales + 1e-9);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// MÓVIL — el mismo caso normal, y el desbordamiento (hallazgo 2712, inspector 03/10/2026). Antes de
// la reparación: la columna de `.inputsGrid` (`1fr` = minmax(auto, 1fr)) tomaba el ancho mínimo de
// su contenido, 350 px, porque el `<input type="number">` aporta su ancho intrínseco (246 px) aunque
// llevara `min-width: 80px`. La columna empezaba en x = 49, así que acababa SIEMPRE en x = 399;
// `html, body { overflow-x: hidden }` recortaba lo que sobraba sin dejar desplazarse. A 360 px los
// dos «+» (x 363–399) y el «100%» del rendimiento (x 360–399) quedaban enteros fuera de la
// pantalla; a 412 px el «+» sobresalía 11 px de la tarjeta, y a 769 px pasaba lo mismo con dos
// columnas de 350 px. Ahora `minmax(0, 1fr)` y el input con `min-width: 0; width: 100%`.
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('móvil (390 px)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('caso normal en móvil: mismos resultados que en escritorio', async ({ page }) => {
    await sembrarCaso1(page);
    await comprobarCaso1(page);
  });

  /**
   * Bordes derechos de lo que debe verse, más el de la tarjeta de entradas, y los elementos de la
   * app que se salen de la pantalla. No mira dentro de los contenedores con desplazamiento propio
   * (la tabla y las fórmulas largas del bloque educativo, `overflow-x: auto`), que es donde SÍ se
   * permite que el contenido sea más ancho que la pantalla.
   */
  async function medirDesborde(page: Page) {
    return page.evaluate(() => {
      const ancho = window.innerWidth;
      const tarjetaInputs = document.querySelector('#inputA')!.closest('[class*="inputsGrid"]')!.getBoundingClientRect();
      const mas = Array.from(document.querySelectorAll('button[aria-label^="Aumentar gramos"]')).map((b) => b.getBoundingClientRect().right);
      const valorRendimiento = document.querySelector('label[for="sliderRendimiento"] strong')!.getBoundingClientRect().right;
      const slider = document.querySelector('#sliderRendimiento')!.getBoundingClientRect().right;
      const raiz = document.querySelector('[class*="SimuladorEstequiometria"][class*="container"]')!;
      const fuera: string[] = [];
      raiz.querySelectorAll('*').forEach((el) => {
        for (let p = el.parentElement; p && p !== raiz; p = p.parentElement) {
          if (getComputedStyle(p).overflowX === 'auto' || getComputedStyle(p).overflowX === 'scroll') return;
        }
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > ancho + 0.5) fuera.push(`${el.tagName}.${el.className} → ${Math.round(r.right)}`);
      });
      return { ancho, bodyScroll: document.body.scrollWidth, borde: tarjetaInputs.right, mas, valorRendimiento, slider, fuera };
    });
  }

  // REPARADO (hallazgo 2712) — a los anchos que pide el encargo (320, 360, 390, 412 y 800 px) y al
  // 769 del acta: nada sale de la pantalla y los controles no salen de su tarjeta. Con el bloque
  // educativo desplegado también, porque sus rejillas tenían mínimos de 220–240 px.
  for (const anchoVista of [320, 360, 390, 412, 769, 800]) {
    test(`a ${anchoVista} px los controles caben en la tarjeta y nada sale de la pantalla`, async ({ page }) => {
      await page.setViewportSize({ width: anchoVista, height: 800 });
      await abrir(page);
      const d = await medirDesborde(page);
      expect(d.ancho).toBe(anchoVista);
      expect(d.bodyScroll, 'ancho del contenido de <body>').toBeLessThanOrEqual(d.ancho);
      expect(d.borde, 'borde derecho de la tarjeta de entradas').toBeLessThanOrEqual(d.ancho);
      for (const derecha of d.mas) expect(derecha, 'borde derecho del «+»').toBeLessThanOrEqual(d.borde);
      expect(d.valorRendimiento, 'borde derecho del «100 %» del rendimiento').toBeLessThanOrEqual(d.borde);
      expect(d.slider, 'borde derecho del deslizador').toBeLessThanOrEqual(d.borde);
      expect(d.fuera, 'elementos que se salen de la pantalla').toEqual([]);

      await desplegarTodo(page);
      const e = await medirDesborde(page);
      expect(e.bodyScroll, 'ancho de <body> con el bloque educativo abierto').toBeLessThanOrEqual(e.ancho);
      expect(e.fuera, 'elementos fuera, con el bloque educativo abierto').toEqual([]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// ACCESIBILIDAD
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('accesibilidad', () => {
  // REPARADO (hallazgo 2713, inspector 03/10/2026) — el rojo #c0392b del limitante no tenía variante
  // oscura: sobre la tarjeta #2D2D2D daba 2,53:1 en la insignia «Limitante» y en el VALOR de
  // «Reactivo limitante», y la fórmula resaltada 2,21:1 sobre su fondo rojizo. Ahora el token local
  // --limitante pasa a #f1948a en oscuro. El valor de la tarjeta ya no hereda el tamaño de la
  // insignia (13,6 px): va a tamaño de resultado (20,8 px negrita), pero se le sigue exigiendo 4,5.
  test('modo oscuro: el limitante se lee (≥ 4,5:1 el texto pequeño, ≥ 3:1 la fórmula grande)', async ({ page }) => {
    await abrir(page);
    await activarTema(page, 'dark');
    expect(await contraste(page, '[class*="resultadoCard"] [class*="limitanteValor"]'), 'valor «Reactivo limitante»').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="barLabel"] [class*="limitanteBadge"]'), 'insignia «Limitante»').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="limitanteResaltado"]'), 'fórmula resaltada').toBeGreaterThanOrEqual(3);
  });

  // REPARADO (hallazgo 2714, inspector 03/10/2026) — botón de reacción activo: texto blanco sobre
  // var(--primary), y el tipo además con opacidad 0,85. En meskeia.com, claro: nombre 4,11:1 y tipo
  // 2,92:1; oscuro: 2,79:1 y 2,14:1. En stemum.com oscuro (--primary #C99BF5): 2,21:1 y 1,80:1.
  // Ahora fondo --primary-boton y tipo blanco opaco. Texto pequeño (14 y 11,5 px): 4,5:1.
  test('botón de reacción activo: el texto blanco sobre la marca llega a 4,5:1 en ambos temas', async ({ page }) => {
    await abrir(page);
    const nombre = '[class*="reaccionBtnActive"] > span:nth-child(2)';
    const tipo = '[class*="reaccionBtnActive"] [class*="tipoBadge"]';
    await activarTema(page, 'light');
    expect(await contraste(page, nombre), 'claro · nombre').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, tipo), 'claro · tipo').toBeGreaterThanOrEqual(4.5);
    await activarTema(page, 'dark');
    expect(await contraste(page, nombre), 'oscuro · nombre').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, tipo), 'oscuro · tipo').toBeGreaterThanOrEqual(4.5);
  });

  // Mismo hallazgo, visto como lo sirve el portal Stemum (data-brand="stemum").
  test('stemum.com, oscuro: el botón de reacción activo llega a 4,5:1', async ({ page }) => {
    await abrir(page, `http://stemum.com${RUTA}`);
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await activarTema(page, 'dark');
    expect(await contraste(page, '[class*="reaccionBtnActive"] > span:nth-child(2)'), 'nombre').toBeGreaterThanOrEqual(4.5);
    expect(await contraste(page, '[class*="reaccionBtnActive"] [class*="tipoBadge"]'), 'tipo').toBeGreaterThanOrEqual(4.5);
  });

  /**
   * Todos los textos de color de la app, en los dos portales que la sirven y en los dos temas
   * (hallazgos 2713, 2714 y 2715). Umbral por tamaño: texto grande (≥ 24 px, o ≥ 18,66 px en
   * negrita) 3:1; el resto, 4,5:1. Valores por defecto: CH₄ limitante, O₂ en exceso.
   */
  const TEXTOS_DE_COLOR: { sel: string; que: string }[] = [
    { sel: '[class*="resultadoCard"] [class*="limitanteValor"]', que: 'valor «Reactivo limitante»' },
    { sel: '[class*="barLabel"] [class*="limitanteBadge"]', que: 'insignia «Limitante»' },
    { sel: '[class*="limitanteResaltado"]', que: 'fórmula resaltada del limitante' },
    { sel: '[class*="ecuacionText"] [class*="coeficiente"]', que: 'coeficiente de la ecuación' },
    { sel: '[class*="reaccionBtnActive"] > span:nth-child(2)', que: 'botón activo · nombre' },
    { sel: '[class*="reaccionBtnActive"] [class*="tipoBadge"]', que: 'botón activo · tipo' },
    { sel: '[class*="btnAjuste"]', que: 'botón ±' },
    { sel: '[class*="excesoBadge"]', que: 'valor «Reactivo en exceso»' },
    { sel: '[class*="resultadoValorGrande"]', que: 'masa real' },
    { sel: '[class*="faqItem"] h4', que: 'pregunta de la FAQ' },
    { sel: '[class*="scenarioCard"] strong', que: 'título de escenario' },
    { sel: '[class*="stepNumber"]', que: 'número de paso' },
    { sel: '[class*="stepContent"] strong', que: 'título de paso' },
    { sel: '[class*="tipCard"] strong', que: 'título de truco' },
  ];

  async function medirTextosDeColor(page: Page): Promise<string[]> {
    const fallos: string[] = [];
    for (const { sel, que } of TEXTOS_DE_COLOR) {
      const umbral = await page.evaluate((s) => {
        const cs = getComputedStyle(document.querySelector(s)!);
        const px = parseFloat(cs.fontSize);
        const negrita = Number(cs.fontWeight) >= 700;
        return px >= 24 || (negrita && px >= 18.66) ? 3 : 4.5;
      }, sel);
      const c = await contraste(page, sel);
      if (c < umbral) fallos.push(`${que}: ${c.toFixed(2)} < ${umbral}`);
    }
    return fallos;
  }

  for (const host of ['meskeia.com', 'stemum.com'] as const) {
    for (const tema of ['light', 'dark'] as const) {
      test(`${host}, ${tema === 'light' ? 'claro' : 'oscuro'}: los textos de color alcanzan su umbral`, async ({ page }) => {
        if (host === 'stemum.com') {
          await abrir(page, `http://stemum.com${RUTA}`);
          await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
        } else {
          await abrir(page);
        }
        await activarTema(page, tema);
        expect(await medirTextosDeColor(page)).toEqual([]);
      });
    }
  }

  // REPARADO (hallazgo 2715, inspector 03/10/2026) — color de marca como TEXTO en claro
  // (meskeia.com): el valor de «Reactivo en exceso» en var(--secondary) daba 2,80:1 (20,8 px
  // negrita: exige 3), y los títulos del bloque educativo en var(--primary) sobre #FAFAFA 3,93:1
  // (16 px: exige 4,5). Ahora --secondary-texto y --primary-texto. Cubierto también por el barrido
  // de arriba; se deja con su caso para que el acta se pueda revalidar tal cual.
  test('claro: el exceso y los títulos del bloque educativo alcanzan su umbral', async ({ page }) => {
    await abrir(page);
    await activarTema(page, 'light');
    expect(await contraste(page, '[class*="excesoBadge"]'), 'valor «Reactivo en exceso»').toBeGreaterThanOrEqual(3);
    expect(await contraste(page, '[class*="faqItem"] h4'), 'pregunta de la FAQ').toBeGreaterThanOrEqual(4.5);
  });

  // La barra es la comparación misma: un gráfico, 3:1 contra su pista, en los dos portales y temas.
  // (--secondary daba 2,68:1 sobre la pista #FAFAFA en claro; ahora --secondary-texto.)
  for (const host of ['meskeia.com', 'stemum.com'] as const) {
    test(`${host}: el relleno de las barras se distingue de la pista (≥ 3:1) en los dos temas`, async ({ page }) => {
      await abrir(page, host === 'stemum.com' ? `http://stemum.com${RUTA}` : RUTA);
      for (const tema of ['light', 'dark'] as const) {
        await activarTema(page, tema);
        const ratios = await page.evaluate(() => {
          const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
          const lum = ([r, g, b]: number[]) => {
            const f = (v: number) => {
              const x = v / 255;
              return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
            };
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
          };
          return Array.from(document.querySelectorAll('[role="progressbar"]')).map((pista) => {
            const a = lum(rgb(getComputedStyle(pista.firstElementChild!).backgroundColor));
            const b = lum(rgb(getComputedStyle(pista).backgroundColor));
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          });
        });
        expect(ratios).toHaveLength(2);
        for (const r of ratios) expect(r, `${tema}`).toBeGreaterThanOrEqual(3);
      }
    });
  }

  // REPARADO (hallazgo 2716, inspector 03/10/2026) — los dos `role="progressbar"` no tenían nombre:
  // el lector anunciaba «barra de progreso, 50» sin decir de qué reactivo era. Ahora
  // aria-labelledby apunta al rótulo del reactivo, y aria-valuetext dice lo mismo que el texto.
  test('las barras de moles tienen nombre accesible con su reactivo', async ({ page }) => {
    await abrir(page);
    await expect(page.getByRole('progressbar', { name: /Metano/ })).toHaveCount(1);
    await expect(page.getByRole('progressbar', { name: /Oxígeno/ })).toHaveCount(1);
    // por defecto (16 g CH₄ + 64 g O₂): n(CH₄) = 0,997320, n(O₂) = 2,000125; necesarios de CH₄ =
    // 2,000125 / 2 = 1,000063 → 99,73 % → «100 %» tras redondear a entero
    await expect(page.getByRole('progressbar', { name: /Metano/ })).toHaveAttribute(
      'aria-valuetext',
      '0,9973 mol disponibles de 1,0001 mol necesarios: 100 %',
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CONTENIDO del bloque educativo (está siempre en el DOM, aunque nazca colapsado)
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('contenido', () => {
  // REPARADO (hallazgo 2719, inspector 03/10/2026) — la FAQ decía «si tienes 16 g de CH₄ (1 mol) y
  // 64 g de O₂ (2 mol), ambos son exactamente estequiométricos», que son justo los valores por
  // defecto, y la app (bien) decía otra cosa. Se corrige la FAQ, no la física: con M(CH₄) = 16,043,
  //   n(CH₄) = 16 / 16,043 = 0,997320 mol · n(O₂) = 64 / 31,998 = 2,000125 mol → razón 1,000063
  //   → CH₄ limitante; O₂ consumido 2 × 0,997320 = 1,994639; sobran 2,000125 − 1,994639 =
  //   0,005486 mol × 31,998 = 0,176 g de O₂ → «Sobran 0,176 g (0,0055 mol)».
  // Ahora la cifra SÍ se afirma: las masas molares ya están reparadas (hallazgos 2717 y 2718).
  test('la FAQ no llama «exactamente estequiométricos» a 16 g CH₄ + 64 g O₂, y dice lo que la app calcula', async ({ page }) => {
    await abrir(page);
    const faq = page.locator('[class*="faqList"]');
    await expect(faq).not.toContainText(/16 g de CH₄[\s\S]{0,80}64 g de O₂[\s\S]{0,40}exactamente estequiométricos/);
    await expect(faq).toContainText('1 mol de CH₄ son 16,043 g y 2 mol de O₂');
    await expect(faq).toContainText('son 63,996 g');
    await expect(faq).toContainText('el CH₄ se queda en 0,9973 mol y es el limitante');
    // y la app, con esos valores por defecto, dice lo mismo que la FAQ
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Metano');
    const exceso = tarjeta(page, 'Reactivo en exceso');
    await expect(exceso).toContainText('Oxígeno');
    await expect(exceso).toContainText('Sobran 0,176 g (0,0055 mol)');
    // el ejemplo de masa molar ya no redondea a 16 g/mol (la app muestra 16,043)
    await expect(faq).not.toContainText('M = 12 + 4×1 = 16 g/mol');
    await expect(faq).toContainText('M = 12,011 + 4 × 1,008 = 16,043 g/mol');
  });

  // REPARADO (hallazgo 2720, inspector 03/10/2026) — la tabla comparativa daba como limitante
  // habitual de la combustión «Metano (CH₄) — en interiores con poca ventilación», y el escenario
  // «Cocina de gas» de la misma página dice lo contrario y correcto: «El reactivo limitante real en
  // un entorno mal ventilado es el oxígeno».
  test('tabla: con poca ventilación el limitante de la combustión es el O₂, no el CH₄', async ({ page }) => {
    await abrir(page);
    const fila = page.locator('[class*="tabla"] tbody tr').filter({ hasText: 'Combustión del metano' });
    await expect(fila.locator('td').nth(2)).not.toContainText('Metano (CH₄) — en interiores con poca ventilación');
    await expect(fila.locator('td').nth(2)).toContainText('Oxígeno (O₂) con poca ventilación');
  });

  // REPARADO (hallazgo 2721, inspector 03/10/2026) — errata en el truco «Verifica con la
  // conservación de masa»: «debe igual a» por «debe ser igual a».
  test('errata: «debe ser igual a» en el truco de la conservación de la masa', async ({ page }) => {
    await abrir(page);
    const truco = page.locator('[class*="tipCard"]').filter({ hasText: 'conservación de masa' });
    await expect(truco).toHaveCount(1);
    await expect(truco).not.toContainText('debe igual a');
    await expect(truco).toContainText('debe ser igual a la masa de productos');
  });
});
