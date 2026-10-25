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

import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';
import { activarTema, desplegarTodo, prepararParaMedir } from '../contraste-text-muted-auxiliares';
import { PUERTO } from './_puerto';
import {
  CASOS as CASOS_AULA,
  TOTAL_CASOS,
  coincideConLibro,
  comprobarRespuesta,
  decimalesDe,
  generarEjercicioAleatorio,
  resolverCaso,
  ventanaDe,
  type DatosCaso,
} from '../../app/simulador-estequiometria/casos';

/**
 * stemum.com → el servidor local, para medir la app como la sirve el portal (data-brand="stemum",
 * que cambia --primary y --secondary). Va al NIVEL DEL FICHERO porque `launchOptions` fuerza un
 * worker nuevo; al resto de tests no les afecta: solo resuelve ese host.
 */
test.use({ launchOptions: { args: [`--host-resolver-rules=MAP stemum.com 127.0.0.1:${PUERTO}`] } });

const RUTA = '/simulador-estequiometria/';

/**
 * El contenedor de la app: el `div` que tiene el hero como hijo directo. Hasta el 25/10/2026 se
 * buscaba por `[class*="SimuladorEstequiometria"][class*="container"]`, que solo casa con los
 * nombres de clase de `next dev` («SimuladorEstequiometria-module__…__container»): contra el build
 * de producción (`_8XFbKG_container`, el servidor del 3052 del Inspector) no casaba nada y siete
 * tests caían sin que la app hubiera cambiado.
 */
const CONTENEDOR = 'div:has(> header[class*="hero"])';

const tarjeta = (page: Page, rotulo: string) =>
  page.locator('[class*="resultadoCard"]').filter({ hasText: rotulo });
const barra = (page: Page, reactivo: string) =>
  page.locator('[class*="barGroup"]').filter({ hasText: reactivo });
const aviso = (page: Page) => page.locator('[class*="resultadoPanel"][role="alert"]');

/**
 * Abre la app (en meskeia.com o, con la URL de stemum.com, como la sirve el portal) y apaga las
 * transiciones: globals.css anima color y fondo 0,3 s al cambiar de tema, y medir el contraste
 * a medio camino daba cifras que no son ni las de un tema ni las del otro.
 */
async function abrir(page: Page, url = RUTA): Promise<void> {
  // Bajo stemum.com basta con que el host esté en allowedDevOrigins (e10155aa): el puente de
  // HMR que había aquí sobraba desde entonces (cabo C0227).
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
    const texto = (await page.locator(CONTENEDOR).textContent()) ?? '';
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
      // El contenedor por el hero, no por el nombre del módulo (ver CONTENEDOR arriba)
      const raiz = document.querySelector('h1')!.closest('[class*="container"]')!;
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

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CASOS PARA CLASE (16/10/2026, semilla S0199; skill /casos-aula-meskeia)
//
// Las respuestas se derivan AQUÍ con una estequiometría propia, escrita desde la definición y sin
// importar `motor.ts`: masas molares sumadas desde los pesos atómicos (IUPAC abreviados, con la
// masa molar redondeada a los decimales del elemento menos preciso, que es el convenio de la
// app), n = m ÷ M, razón n ÷ coeficiente, producto con la razón menor. Resueltas a mano
// (calculadora, 16/10/2026):
//   1  40 ÷ 16,043 = 2,4933 mol                                          → 2,493 mol
//   2  32 ÷ 16,043 = 1,99464 · × 2 = 3,98928 mol O₂ × 31,998            → 127,65 g
//   3  CH₄ 0,49866 ÷ 1 · O₂ 1,25008 ÷ 2 = 0,62504 → CH₄; × 44,009        → 21,95 g
//   4  CH₄ 1,24665 · O₂ 1,50009 ÷ 2 = 0,75005 → O₂; 0,75005 × 44,009    → 33,01 g
//   5  H₂ 2,97619 ÷ 2 = 1,48810 · O₂ 1,25008 → O₂; × 2 × 18,015         → 45,04 g
//   6  N₂ 2,49875 · H₂ 14,88095 ÷ 3 = 4,96032 → N₂; × 2 × 17,031        → 85,11 g
//   7  HCl 2,00219 · NaOH 1,50011 → NaOH; sobran 0,50208 × 36,46        → 18,31 g
//   8  CH₄ 1,49598 · O₂ 2,00013 ÷ 2 = 1,00006 → O₂; sobran 0,49592 × 16,043 → 7,96 g
//   9  Fe 5,01388 ÷ 4 · O₂ 1,50009 ÷ 3 = 0,50003 → O₂; se gastan 2,00013; sobran 3,01375 × 55,845 → 168,30 g
//  10  0,49957 × 2 × 46,069 = 46,0292 × 0,85                            → 39,12 g
//  11  N₂ 0,99950 · H₂ 5,95238 ÷ 3 → N₂; × 2 × 17,031 = 34,0450 × 0,15  → 5,11 g
//  12  HCl 1,09709 · NaOH 1,50011 → HCl; × 58,44 = 64,1141; 52 ÷ 64,1141 × 100 → 81,11 %
//
// EL CONVENIO que se fija: las masas molares. Los libros de secundaria usan pesos atómicos
// redondeados (H = 1, C = 12, N = 14, O = 16, Na = 23, Cl = 35,5, Fe = 56); el simulador, los
// de la IUPAC. Los datos se eligieron para que las dos tablas den el mismo limitante y una
// respuesta dentro de la tolerancia, con margen: la invariante 7 lo comprueba con la tabla de
// libro de este fichero, no con la de `casos.ts`.
// ─────────────────────────────────────────────────────────────────────────────────────────────

type Tabla = Record<'H' | 'C' | 'N' | 'O' | 'Na' | 'Cl' | 'Fe', number>;
const IUPAC: Tabla = { H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.99, Cl: 35.45, Fe: 55.845 };
const LIBRO: Tabla = { H: 1, C: 12, N: 14, O: 16, Na: 23, Cl: 35.5, Fe: 56 };
type Composicion = Partial<Record<keyof Tabla, number>>;

function masaMolarDe(c: Composicion, t: Tabla): number {
  const suma = Object.entries(c).reduce((s, [el, n]) => s + t[el as keyof Tabla] * (n ?? 0), 0);
  if (t === LIBRO) return suma;
  const decimales = 'Cl' in c ? 2 : 3;
  return Math.round(suma * 10 ** decimales) / 10 ** decimales;
}

interface ReaccionTest {
  A: { c: Composicion; k: number };
  B: { c: Composicion; k: number } | null;
  P: { c: Composicion; k: number };
}
const R: Record<string, ReaccionTest> = {
  'combustion-metano': { A: { c: { C: 1, H: 4 }, k: 1 }, B: { c: { O: 2 }, k: 2 }, P: { c: { C: 1, O: 2 }, k: 1 } },
  'sintesis-agua': { A: { c: { H: 2 }, k: 2 }, B: { c: { O: 2 }, k: 1 }, P: { c: { H: 2, O: 1 }, k: 2 } },
  neutralizacion: { A: { c: { H: 1, Cl: 1 }, k: 1 }, B: { c: { Na: 1, O: 1, H: 1 }, k: 1 }, P: { c: { Na: 1, Cl: 1 }, k: 1 } },
  'haber-bosch': { A: { c: { N: 2 }, k: 1 }, B: { c: { H: 2 }, k: 3 }, P: { c: { N: 1, H: 3 }, k: 2 } },
  'oxidacion-hierro': { A: { c: { Fe: 1 }, k: 4 }, B: { c: { O: 2 }, k: 3 }, P: { c: { Fe: 2, O: 3 }, k: 2 } },
  fermentacion: { A: { c: { C: 6, H: 12, O: 6 }, k: 1 }, B: null, P: { c: { C: 2, H: 6, O: 1 }, k: 2 } },
};

/** Respuesta exacta (sin redondear) y limitante, con la tabla de pesos que se le pase. */
function estequiometriaPropia(d: DatosCaso, t: Tabla): { valor: number; limitante: 'A' | 'B' } {
  const r = R[d.reaccionId];
  const MA = masaMolarDe(r.A.c, t);
  const MP = masaMolarDe(r.P.c, t);
  const nA = d.gramosA / MA;
  if (d.pregunta === 'moles' && d.reactivo !== 'B') return { valor: nA, limitante: 'A' };
  const MB = r.B ? masaMolarDe(r.B.c, t) : NaN;
  const nB = r.B ? d.gramosB / MB : NaN;
  if (d.pregunta === 'moles') return { valor: nB, limitante: 'A' };
  if (d.pregunta === 'masa-necesaria') return { valor: (nA / r.A.k) * (r.B?.k ?? NaN) * MB, limitante: 'A' };
  const ratioA = nA / r.A.k;
  const ratioB = r.B ? nB / r.B.k : Infinity;
  const limitante = ratioA <= ratioB ? 'A' : 'B';
  const ratio = Math.min(ratioA, ratioB);
  const teorica = ratio * r.P.k * MP;
  switch (d.pregunta) {
    case 'masa-teorica':
      return { valor: teorica, limitante };
    case 'masa-real':
      return { valor: (teorica * (d.rendimiento ?? 100)) / 100, limitante };
    case 'rendimiento':
      return { valor: ((d.masaObtenida ?? NaN) / teorica) * 100, limitante };
    case 'exceso':
      return limitante === 'A'
        ? { valor: (nB - ratio * (r.B?.k ?? NaN)) * MB, limitante }
        : { valor: (nA - ratio * r.A.k) * MA, limitante };
  }
}

const redondearTest = (v: number, d: number): number => Math.round(v * 10 ** d) / 10 ** d;
const RESUELTAS_A_MANO = [2.493, 127.65, 21.95, 33.01, 45.04, 85.11, 18.31, 7.96, 168.3, 39.12, 5.11, 81.11];

test.describe('casos para clase · lógica (sin navegador)', () => {
  test('1 · doce casos con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS_AULA.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · deterministas: dos resoluciones dan lo mismo', () => {
    for (const caso of CASOS_AULA) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta coincide con la resuelta a mano y con una estequiometría propia', () => {
    CASOS_AULA.forEach((caso, i) => {
      expect(caso.respuesta, `caso ${caso.id} frente a la cuenta a mano`).toBe(RESUELTAS_A_MANO[i]);
      const propia = estequiometriaPropia(caso.datos, IUPAC).valor;
      expect(caso.respuesta, `caso ${caso.id} frente a la estequiometría del test`).toBe(
        redondearTest(propia, decimalesDe(caso.datos.pregunta)),
      );
    });
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita, desarrollo y pista', () => {
    for (const caso of CASOS_AULA) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta) && caso.respuesta > 0, `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
      expect(caso.respuestaTexto, `caso ${caso.id}`).toContain(caso.unidad);
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|argentinos|chilenos))\b/i;
    for (const caso of CASOS_AULA) {
      expect(PROHIBIDO.test(`${caso.titulo} ${caso.enunciado}`), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA, y el % va con espacio duro', () => {
    for (const caso of CASOS_AULA) {
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      if (caso.requiereRedondeo) {
        const pedidos = decimalesDe(caso.datos.pregunta) === 3 ? /tres decimales/ : /dos decimales/;
        expect(caso.enunciado, `caso ${caso.id}: exige redondeo y no lo pide`).toMatch(pedidos);
      }
      for (const texto of [caso.enunciado, caso.pista, caso.respuestaTexto, ...caso.pasos]) {
        expect(texto, `caso ${caso.id}`).not.toMatch(/\d ?%/);
      }
    }
  });

  test('5.ter · cada caso se puede montar con los controles de la app y no es una mezcla estequiométrica', () => {
    for (const caso of CASOS_AULA) {
      const d = caso.datos;
      expect(Number.isInteger(d.gramosA) && Number.isInteger(d.gramosB), `caso ${caso.id}: gramos enteros`).toBe(true);
      if (d.rendimiento !== undefined) expect(Number.isInteger(d.rendimiento), `caso ${caso.id}`).toBe(true);
      const r = R[d.reaccionId];
      if (r.B && d.pregunta !== 'moles' && d.pregunta !== 'masa-necesaria') {
        const ratioA = d.gramosA / masaMolarDe(r.A.c, IUPAC) / r.A.k;
        const ratioB = d.gramosB / masaMolarDe(r.B.c, IUPAC) / r.B.k;
        expect(Math.abs(ratioA - ratioB) / Math.max(ratioA, ratioB), `caso ${caso.id}`).toBeGreaterThan(0.15);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', () => {
    const a = generarEjercicioAleatorio(12345);
    expect(generarEjercicioAleatorio(12345)).toEqual(a);
    const ejercicios = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(ejercicios.map((e) => e.respuesta)).size, 'respuestas distintas').toBeGreaterThanOrEqual(10);
    expect(new Set(ejercicios.map((e) => e.datos.pregunta)).size, 'tipos de pregunta').toBeGreaterThanOrEqual(5);
    expect(new Set(ejercicios.map((e) => e.datos.reaccionId)).size, 'reacciones').toBeGreaterThanOrEqual(5);
    for (const e of ejercicios) {
      const propia = estequiometriaPropia(e.datos, IUPAC).valor;
      expect(e.respuesta, `semilla ${e.semilla}`).toBe(redondearTest(propia, decimalesDe(e.datos.pregunta)));
      expect(comprobarRespuesta(e.respuesta, e.respuesta, e.datos).correcto, `semilla ${e.semilla}`).toBe(true);
      expect(e.enunciado, `semilla ${e.semilla}`).not.toMatch(/\d ?%/);
    }
  });

  test('7 · convenio: con las masas de LIBRO sale el mismo limitante y una respuesta que se da por buena', () => {
    const ejercicios = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    for (const { datos, respuesta, origen } of [
      ...CASOS_AULA.map((c) => ({ datos: c.datos, respuesta: c.respuesta, origen: `caso ${c.id}` })),
      ...ejercicios.map((e) => ({ datos: e.datos, respuesta: e.respuesta, origen: `semilla ${e.semilla}` })),
    ]) {
      const iupac = estequiometriaPropia(datos, IUPAC);
      const libro = estequiometriaPropia(datos, LIBRO);
      expect(libro.limitante, `${origen}: el limitante cambia con las masas de libro`).toBe(iupac.limitante);
      // Lo escrito con sus decimales por quien usa las masas de su libro se acepta.
      const delLibro = redondearTest(libro.valor, decimalesDe(datos.pregunta));
      expect(comprobarRespuesta(delLibro, respuesta, datos).correcto, `${origen}: suspende ${delLibro}, la cuenta con masas de libro`).toBe(true);
      expect(coincideConLibro(datos), origen).toBe(true);
    }
  });

  test('7.bis · el corrector: errores típicos con nombre, lo imposible y lo que no es número', () => {
    const caso = (id: number) => CASOS_AULA[id - 1];
    // caso 4 con el reactivo en exceso (el CH₄): 1,24665 mol × 44,009 = 54,86 g
    expect(comprobarRespuesta(54.86, caso(4).respuesta, caso(4).datos).motivo).toMatch(/reactivo en exceso/);
    // caso 10 sin aplicar el rendimiento: 46,03 g
    expect(comprobarRespuesta(46.03, caso(10).respuesta, caso(10).datos).motivo).toMatch(/masa teórica/);
    // caso 12 en tanto por uno
    expect(comprobarRespuesta(0.8111, caso(12).respuesta, caso(12).datos).motivo).toMatch(/tanto por uno/);
    // caso 12: un rendimiento del 101 % no existe
    expect(comprobarRespuesta(101, caso(12).respuesta, caso(12).datos).correcto).toBe(false);
    // caso 7 en moles: 0,50208 mol
    expect(comprobarRespuesta(0.502, caso(7).respuesta, caso(7).datos).motivo).toMatch(/moles que sobran/);
    // caso 1 multiplicando: 40 × 16,043 = 641,72
    expect(comprobarRespuesta(641.72, caso(1).respuesta, caso(1).datos).motivo).toMatch(/m ÷ M/);
    // lo que no es número
    expect(comprobarRespuesta(NaN, caso(3).respuesta, caso(3).datos).motivo).not.toContain('NaN');
    // un fallo cualquiera dice cuánto se ha desviado, con espacio duro antes de la unidad
    const v = comprobarRespuesta(30, caso(3).respuesta, caso(3).datos);
    expect(v.correcto).toBe(false);
    expect(v.motivo).toMatch(/desviado 8,05 g/);
  });
});

test.describe('casos para clase · en la página', () => {
  test('se corrige un caso, avisa del reactivo en exceso y «Cargar en el simulador» pone sus datos', async ({ page }) => {
    await abrir(page);
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 4:/ }).click();
    await expect(seccion.getByRole('button', { name: /^Caso 4:/ })).toHaveAttribute('aria-pressed', 'true');

    const casilla = seccion.locator('#casos-respuesta');
    await casilla.fill('54,86');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('reactivo en exceso');

    await casilla.fill('33,01');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('¡Correcto!');

    await seccion.getByRole('button', { name: 'Cargar en el simulador' }).click();
    await expect(page.locator('#inputA')).toHaveValue('20');
    await expect(page.locator('#inputB')).toHaveValue('48');
    // y el simulador da lo mismo que el caso
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Oxígeno');
    await expect(tarjeta(page, 'Masa teórica')).toContainText('33,009 g');
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 24/10/2026 — invalidada por una dependencia (3b92acef, `textoDesviacion` del
// corrector compartido). Ese día esta app NO usaba `textoDesviacion`: su `comprobarRespuesta`
// escribía la desviación con su propio `cifra`, y con la tolerancia relativa (nunca menor que 0,01)
// un fallo se desviaba siempre ≥ 0,01. Desde 301b3e3d (25/10/2026, hallazgo 3451) SÍ lo usa, porque
// la ventana ya no tiene ese suelo: lo comprueba el bloque de la re-inspección del 25/10, al final.
// Los REPARADO de arriba (2710–2723) se sostienen: el spec entero pasó en verde antes de añadir este bloque.
//
// Casos nuevos, resueltos a mano ANTES de abrir la app, con los pesos atómicos IUPAC/CIAAW 2021
// abreviados de `app/tabla-periodica/elementos-data.ts` (H 1,008 · N 14,007 · O 15,999 ·
// Na 22,990 · Cl 35,45 · Fe 55,845) y la masa molar redondeada a los decimales del elemento
// menos preciso: H₂ 2,016 · O₂ 31,998 · H₂O 18,015 · N₂ 28,014 · NH₃ 17,031 · Fe₂O₃ 159,687 ·
// HCl 36,46 · NaOH 39,997 · NaCl 58,44.
// ═════════════════════════════════════════════════════════════════════════════════════════════

// CASO NORMAL — síntesis del agua, 5 g de H₂ + 30 g de O₂, rendimiento 80 %
//   n(H₂) = 5 / 2,016 = 2,480159 mol → razón /2 = 1,240079
//   n(O₂) = 30 / 31,998 = 0,937559 mol → razón /1 = 0,937559 → O₂ LIMITANTE
//   n(H₂O) = 0,937559 × 2 = 1,875117 mol → × 18,015 = 33,780236 g → «33,780 g», «1,8751 mol»
//   real = 33,780236 × 0,80 = 27,024189 g → «27,024 g»
//   exceso H₂: 2,480159 − 0,937559 × 2 = 0,605042 mol → × 2,016 = 1,219764 g → «1,220 g», «0,6050 mol»
//   barras: H₂ 2,4802 / (0,937559 × 2 = 1,8751) = 132,3 % → «132 %» · O₂ 0,9376 / (2,480159 / 2 =
//   1,2401) = 75,6 % → «76 %», con la insignia «Limitante»
async function casoAgua(page: Page): Promise<void> {
  await abrir(page);
  await elegir(page, /Síntesis del agua/);
  await escribir(page, '#inputA', '5'); // el valor por defecto era 4
  await escribir(page, '#inputB', '30'); // y 32
  await sembrarValor(page, '#sliderRendimiento', 80);
  await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Oxígeno');
  const teorica = tarjeta(page, 'Masa teórica de Agua (H₂O)');
  await expect(teorica).toContainText('33,780 g');
  await expect(teorica).toContainText('1,8751 mol');
  await expect(tarjeta(page, 'Masa real obtenida')).toContainText('rendimiento 80 %');
  await expect(tarjeta(page, 'Masa real obtenida')).toContainText('27,024 g');
  const exceso = tarjeta(page, 'Reactivo en exceso');
  await expect(exceso).toContainText('Hidrógeno');
  await expect(exceso).toContainText('Sobran 1,220 g (0,6050 mol)');
  await expect(barra(page, 'Hidrógeno (H₂)')).toContainText('2,4802 mol disponibles / 1,8751 mol necesarios (132 %)');
  const o2 = barra(page, 'Oxígeno (O₂)');
  await expect(o2).toContainText('0,9376 mol disponibles / 1,2401 mol necesarios (76 %)');
  await expect(o2.locator('[class*="limitanteBadge"]')).toHaveCount(1);
  await expect(page.locator('[class*="limitanteResaltado"]')).toHaveText(/^O₂\s*$/);
}

test.describe('re-inspección 24/10/2026 · cálculo', () => {
  test('normal: 5 g H₂ + 30 g O₂ al 80 % → O₂ limitante, 33,780 g de agua, 27,024 g reales, sobran 1,220 g de H₂', async ({ page }) => {
    await casoAgua(page);
  });

  // LÍMITE — oxidación del hierro en proporción EXACTA y a un paso de ella
  //   223,38 g Fe = 223,38 / 55,845 = 4 mol (razón 4/4 = 1) · 95,994 g O₂ = 3 mol (razón 3/3 = 1)
  //   → mezcla estequiométrica: Fe₂O₃ = 1 × 2 = 2 mol × 159,687 = «319,374 g», «2,0000 mol»
  //   96 g O₂ → 3,000188 mol, razón 1,0000625: difiere un 0,00625 %, más que la incertidumbre de
  //   redondeo de las dos masas molares (0,0005/55,845 + 0,0005/31,998 = 0,0025 %) → Fe limitante,
  //   sobran 0,000188 mol × 31,998 = 0,006 g de O₂ → «Sobran 0,006 g (0,0002 mol)», producto igual
  //   95 g O₂ → 2,968936 mol, razón 0,989645 → O₂ limitante; Fe₂O₃ 0,989645 × 2 = 1,979290 mol ×
  //   159,687 = 316,066942 g → «316,067 g», «1,9793 mol»; sobra Fe 4 − 0,989645 × 4 = 0,041419 mol ×
  //   55,845 = 2,313058 g → «Sobran 2,313 g (0,0414 mol)»
  test('límite: 223,38 g Fe + 95,994 g O₂ es estequiométrica; con 96 g sobra 0,006 g de O₂ y con 95 g el limitante pasa a ser el O₂', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Oxidación del hierro/);
    await escribir(page, '#inputA', '223.38');
    await escribir(page, '#inputB', '95.994');
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Ninguno: se agotan los dos a la vez');
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Ninguno (estequiométrico)');
    const teorica = tarjeta(page, 'Masa teórica de Óxido de hierro (III)');
    await expect(teorica).toContainText('319,374 g');
    await expect(teorica).toContainText('2,0000 mol');

    await escribir(page, '#inputB', '96');
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Hierro');
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Sobran 0,006 g (0,0002 mol)');
    await expect(teorica).toContainText('319,374 g');

    await escribir(page, '#inputB', '95');
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Oxígeno');
    await expect(teorica).toContainText('316,067 g');
    await expect(teorica).toContainText('1,9793 mol');
    const exceso = tarjeta(page, 'Reactivo en exceso');
    await expect(exceso).toContainText('Hierro');
    await expect(exceso).toContainText('Sobran 2,313 g (0,0414 mol)');
  });

  // LÍMITE — el limitante cambia de reactivo: Haber-Bosch, 28 g N₂ con 6 y con 6,1 g de H₂
  //   n(N₂) = 28 / 28,014 = 0,999500 mol (razón 0,999500)
  //   6 g H₂ → 2,976190 mol, razón /3 = 0,992063 → H₂ limitante (el testigo del estado de partida)
  //   6,1 g H₂ → 3,025794 mol, razón 1,008598 → N₂ LIMITANTE; NH₃ = 0,999500 × 2 = 1,999000 mol ×
  //   17,031 = 34,044978 g → «34,045 g», «1,9990 mol»; sobra H₂ 3,025794 − 0,999500 × 3 = 0,027293 mol
  //   × 2,016 = 0,055022 g → «Sobran 0,055 g (0,0273 mol)»
  test('límite: 28 g N₂ + 6 g H₂ → H₂ limitante; con 6,1 g de H₂ el limitante pasa al N₂ y salen 34,045 g de NH₃', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Haber-Bosch/);
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Hidrógeno');
    await escribir(page, '#inputB', '6.1');
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Nitrógeno');
    const teorica = tarjeta(page, 'Masa teórica de Amoniaco');
    await expect(teorica).toContainText('34,045 g');
    await expect(teorica).toContainText('1,9990 mol');
    const exceso = tarjeta(page, 'Reactivo en exceso');
    await expect(exceso).toContainText('Hidrógeno');
    await expect(exceso).toContainText('Sobran 0,055 g (0,0273 mol)');
    await expect(page.locator('[class*="limitanteResaltado"]')).toHaveText(/^N₂\s*$/);
  });

  // RECHAZO — 0 g del segundo reactivo, el segundo vacío y 0 g del primero: sin resultados, y el aviso
  test('rechazo: 0 g de H₂, H₂ vacío o 0 g de N₂ no calculan y muestran el aviso', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Haber-Bosch/);
    const mensaje = 'Introduce gramos válidos y positivos para ver los resultados.';
    for (const [sel, valor] of [['#inputB', '0'], ['#inputB', ''], ['#inputA', '0']] as const) {
      if (sel === '#inputA') await escribir(page, '#inputB', '6');
      await escribir(page, sel, valor);
      await expect(aviso(page), `${sel} = «${valor}»`).toHaveText(mensaje);
      await expect(page.locator('[class*="resultadoCard"]')).toHaveCount(0);
      await expect(page.locator('[role="progressbar"]')).toHaveCount(0);
    }
    await expect(page.locator('body')).not.toContainText('NaN');
  });
});

test.describe('re-inspección 24/10/2026 · móvil 390 × 844', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('el caso normal da lo mismo en móvil', async ({ page }) => {
    await casoAgua(page);
  });

  // Firma de rotura (visitas cortas con recarga): en móvil los controles responden al TOQUE, no hay
  // ningún <form> que un botón o un Intro pueda enviar y la página no navega al usarla.
  test('al toque responden la reacción, el «+», el caso y «Cargar en el simulador», sin recargar la página', async ({ page }) => {
    let cargas = 0;
    page.on('load', () => (cargas += 1));
    await abrir(page);
    const cargasIniciales = cargas;
    await expect(page.locator('form')).toHaveCount(0);
    await page.getByRole('button', { name: /Síntesis del agua/ }).tap();
    await expect(page.locator('#inputA')).toHaveValue('4');
    await expect(page.locator('#inputB')).toHaveValue('32');
    await page.getByRole('button', { name: 'Aumentar gramos de reactivo B' }).tap();
    await expect(page.locator('#inputB')).toHaveValue('33');
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 5:/ }).tap();
    await seccion.locator('#casos-respuesta').fill('45,04');
    await seccion.locator('#casos-respuesta').press('Enter');
    await expect(seccion.getByRole('alert')).toContainText('¡Correcto!');
    await seccion.getByRole('button', { name: 'Cargar en el simulador' }).tap();
    await expect(page.locator('#inputA')).toHaveValue('6');
    await expect(page.locator('#inputB')).toHaveValue('40');
    // caso 5: H₂ 6 / 2,016 = 2,976190 (razón 1,488095) · O₂ 40 / 31,998 = 1,250078 → O₂ limitante;
    // H₂O = 1,250078 × 2 × 18,015 = 45,040313 g → «45,040 g»
    await expect(tarjeta(page, 'Masa teórica de Agua')).toContainText('45,040 g');
    expect(cargas, 'cargas de página durante el uso').toBe(cargasIniciales);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// PÁGINA TRADUCIDA (cabo C0243) — el traductor simulado de tests/apps/generador-loteria.spec.ts:
// cada nodo de texto pasa a <font><font>…</font></font>, y se apunta el nodo retirado para
// detectar el texto que se queda VIEJO (React escribe en el nodo que ya no está en pantalla).
// ─────────────────────────────────────────────────────────────────────────────────────────────
interface NodoTraducido { nodo: Text; valor: string | null; avisado: boolean }
type VentanaTraducida = Window & { __nodosTraducidos?: NodoTraducido[] };

const traducir = (page: Page) =>
  page.evaluate(() => {
    const w = window as VentanaTraducida;
    const apuntados = (w.__nodosTraducidos = w.__nodosTraducidos ?? []);
    const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const padre = n.parentElement;
        if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodos: Text[] = [];
    while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
    for (const nodo of nodos) {
      const exterior = document.createElement('font');
      const interior = document.createElement('font');
      interior.textContent = nodo.nodeValue;
      exterior.appendChild(interior);
      apuntados.push({ nodo, valor: nodo.nodeValue, avisado: false });
      nodo.parentNode?.replaceChild(exterior, nodo);
    }
  });

const textoViejo = (page: Page) =>
  page.evaluate(() => {
    const r: string[] = [];
    for (const t of (window as VentanaTraducida).__nodosTraducidos ?? []) {
      if (!t.avisado && t.nodo.nodeValue !== t.valor) {
        t.avisado = true;
        r.push(`«${t.valor}» → «${t.nodo.nodeValue}»`);
      }
    }
    return r;
  });

function erroresDeReact(page: Page): string[] {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
  });
  return errores;
}

test.describe('re-inspección 24/10/2026 · página traducida (cabo C0243)', () => {
  // REPARADO (hallazgo 3450, re-inspección del 24/10/2026, operativa; b82fadff) — con la página
  // traducida, el rótulo de cada reactivo, la ecuación, las tarjetas de masa teórica y real, el
  // «Sobran …», las barras y el «N %» del rendimiento eran VARIOS nodos de texto en un mismo elemento:
  // React escribía el valor nuevo en el nodo que el traductor ya retiró y en pantalla seguía el de antes. Medido:
  // al elegir la neutralización, el rótulo seguía «Metano (CH₄) M = 16,043 g/mol», la tarjeta
  // «Masa teórica de Dióxido de carbono (CO₂) 43,891 g 0,9973 mol» y la ecuación «CH₄ + 2 O₂ → CO₂ +»
  // (mientras «Reactivo limitante», que es el único hijo de su elemento, sí decía «Hidróxido de
  // sodio»); al bajar el rendimiento a 50 %, el rótulo seguía en «100 %». Sin traducir pasa.
  //   Neutralización por defecto (36,5 g HCl + 40 g NaOH): n(HCl) = 36,5 / 36,46 = 1,001097 ·
  //   n(NaOH) = 40 / 39,997 = 1,000075 → NaOH limitante; NaCl = 1,000075 × 58,44 = 58,444384 g →
  //   «58,444 g», «1,0001 mol»; al 50 %, 29,222192 g → «29,222 g»
  for (const traducida of [false, true]) {
    test(`elegir la neutralización y bajar el rendimiento al 50 %: rótulo, ecuación y tarjetas dicen la reacción elegida${traducida ? ', con la página traducida' : ''}`, async ({ page }) => {
      // REPARADO (hallazgo 3450, 24/10/2026): cada texto variable, una sola cadena única hija de su elemento.
      const errores = erroresDeReact(page);
      await abrir(page);
      if (traducida) await traducir(page);
      await elegir(page, /Neutralización ácido-base/);
      await expect(page.locator('label[for="inputA"]')).toContainText('Ácido clorhídrico (HCl)');
      await expect(page.locator('label[for="inputA"]')).toContainText('M = 36,46 g/mol');
      await expect(page.locator('[class*="ecuacionText"]')).toHaveText(/^HCl \+ NaOH → NaCl \+ H₂O\s*$/);
      const teorica = tarjeta(page, 'Masa teórica de Cloruro de sodio (NaCl)');
      await expect(teorica).toContainText('58,444 g');
      await expect(teorica).toContainText('1,0001 mol');
      if (traducida) await traducir(page);
      await sembrarValor(page, '#sliderRendimiento', 50);
      await expect(page.locator('label[for="sliderRendimiento"]')).toContainText('50 %');
      await expect(tarjeta(page, 'Masa real obtenida')).toContainText('rendimiento 50 %');
      await expect(tarjeta(page, 'Masa real obtenida')).toContainText('29,222 g');
      expect(await textoViejo(page), 'textos que se quedaron viejos').toEqual([]);
      expect(errores).toEqual([]);
    });
  }

  // Lo que SÍ se sostiene traducida: nada se cae (ni NotFoundError ni «Algo salió mal») al recorrer
  // las seis reacciones, el rendimiento, los ± y los casos para clase con la página traducida.
  test('traducida, recorrer reacciones, rendimiento, ± y casos para clase no tumba la app', async ({ page }) => {
    const errores = erroresDeReact(page);
    await abrir(page);
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    const pasos: [string, () => Promise<unknown>][] = [
      ['neutralización', () => elegir(page, /Neutralización ácido-base/)],
      ['rendimiento 40 %', () => sembrarValor(page, '#sliderRendimiento', 40)],
      ['HCl vacío', () => escribir(page, '#inputA', '')],
      ['HCl 36,46', () => escribir(page, '#inputA', '36.46')],
      ['fermentación', () => elegir(page, /Fermentación alcohólica/)],
      ['Haber-Bosch', () => elegir(page, /Haber-Bosch/)],
      ['+ de A', () => page.getByRole('button', { name: 'Aumentar gramos de reactivo A' }).click()],
      ['caso 4', () => seccion.getByRole('button', { name: /^Caso 4:/ }).click()],
      ['comprobar 54,86', async () => {
        await seccion.locator('#casos-respuesta').fill('54,86');
        await seccion.getByRole('button', { name: 'Comprobar' }).click();
      }],
      ['ver pista', () => seccion.getByRole('button', { name: /Ver pista/ }).click()],
      ['ver solución', () => seccion.getByRole('button', { name: /Ver solución/ }).click()],
      ['practicar', () => seccion.getByRole('button', { name: /Practicar/ }).click()],
      ['cargar en el simulador', () => seccion.getByRole('button', { name: 'Cargar en el simulador' }).click()],
    ];
    for (const [nombre, accion] of pasos) {
      await traducir(page);
      await accion();
      await page.waitForTimeout(150);
      await expect(page.getByRole('heading', { name: 'Algo salió mal' }), nombre).toHaveCount(0);
    }
    expect(errores).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CABO C0267 — la tolerancia relativa del corrector (el mayor entre 0,01 y el 1 %)
//
// Aquí SÍ tenía un uso legítimo: el alumno puede hacer las cuentas con las masas de su libro
// (H = 1, C = 12, O = 16, Na = 23, Cl = 35,5…), y la app lo decía («se acepta una desviación del
// 1 %»; desde 301b3e3d dice que se da por buena la cuenta con las masas del libro, más un 0,5 %). Medido caso a caso, el hueco IUPAC↔libro va del 0,007 % (caso 12) al 0,553 % (caso 8).
// Pero la tolerancia es la misma en los doce: en el caso 12 las DOS tablas dan 81,11 %, y los
// redondeos intermedios que puede arrastrar el alumno (n(HCl) a 1,1 / 1,096 / 1,097 mol, M(NaCl)
// 58,4–58,5, la masa teórica a 64 g) van de 80,81 % a 81,25 %; el 1 % acepta de 80,30 a 81,92 %.
// REPARADO (hallazgo 3451, 25/10/2026): `ventanaDe` en casos.ts, ver los tests de abajo.
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('re-inspección 24/10/2026 · corrector (cabo C0267)', () => {
  test('caso 12: las dos tablas de masas dan 81,11 % y las dos se aceptan', () => {
    const c12 = CASOS_AULA[11];
    expect(c12.id).toBe(12);
    expect(c12.respuesta).toBe(81.11);
    // IUPAC: 52 ÷ (1,097093 × 58,44 = 64,114098) × 100 = 81,105 · libro: 52 ÷ (40 ÷ 36,5 × 58,5 =
    // 64,109589) × 100 = 81,111
    expect(redondearTest(estequiometriaPropia(c12.datos, IUPAC).valor, 2)).toBe(81.11);
    expect(redondearTest(estequiometriaPropia(c12.datos, LIBRO).valor, 2)).toBe(81.11);
    expect(comprobarRespuesta(81.11, c12.respuesta, c12.datos).correcto).toBe(true);
    // y un redondeo intermedio corriente: n(HCl) = 1,1 mol × 58,44 = 64,284 g → 80,89 %
    expect(comprobarRespuesta(80.89, c12.respuesta, c12.datos).correcto).toBe(true);
  });

  // REPARADO (hallazgo 3451, 25/10/2026) — 81,9 % y 80,3 % no salen de ninguna tabla ni de ningún
  // redondeo intermedio (de 80,81 a 81,25 %), y el 1 % los aprobaba. Ahora se acepta el intervalo
  // entre las dos respuestas exactas (IUPAC 81,105 · libro 81,111) más un 0,5 % y media centésima:
  // de 80,70 a 81,52 %.
  test('caso 12: 81,9 % y 80,3 % no son ningún redondeo de 81,11 % y no se aprueban', () => {
    const c12 = CASOS_AULA[11];
    expect(comprobarRespuesta(81.9, c12.respuesta, c12.datos).correcto, '81,9 %').toBe(false);
    expect(comprobarRespuesta(80.3, c12.respuesta, c12.datos).correcto, '80,3 %').toBe(false);
    expect(comprobarRespuesta(81.92, c12.respuesta, c12.datos).correcto, '81,92 %').toBe(false);
    // y los redondeos intermedios que anotó el Inspector se siguen aceptando: n(HCl) = 1,1 mol ×
    // 58,5 = 64,35 g → 80,81 % · la masa teórica a 64 g → 52 ÷ 64 = 81,25 %
    expect(comprobarRespuesta(80.81, c12.respuesta, c12.datos).correcto, '80,81 %').toBe(true);
    expect(comprobarRespuesta(81.25, c12.respuesta, c12.datos).correcto, '81,25 %').toBe(true);
  });

  // Caso 9: IUPAC 3,01375 mol × 55,845 = 168,30 g · libro (5 − 1,5 × 4 ÷ 3) × 56 = 168,00 g.
  // Ventana: de 168,00 − 0,84 − 0,005 = 167,15 a 168,30 + 0,84 + 0,005 = 169,15 g.
  test('caso 9: 168,30 y 168,00 g se aceptan, 166,7 g no', () => {
    const c9 = CASOS_AULA[8];
    expect(c9.id).toBe(9);
    expect(comprobarRespuesta(168.3, c9.respuesta, c9.datos).correcto, '168,30 g').toBe(true);
    expect(comprobarRespuesta(168, c9.respuesta, c9.datos).correcto, '168,00 g').toBe(true);
    expect(comprobarRespuesta(166.7, c9.respuesta, c9.datos).correcto, '166,7 g').toBe(false);
  });

  // Testigo de la ventana en los doce casos y 80 prácticas: lo que está entre las dos tablas y un
  // 0,2 % más allá (lo más que se aleja una cuenta con los moles a tres decimales, medido el
  // 25/10/2026) se acepta; lo que está un 0,6 % y una centésima más allá de las dos, no.
  test('la ventana: las dos tablas y sus redondeos sí, un 0,6 % más allá no', () => {
    const lista = [
      ...CASOS_AULA.map((c) => ({ datos: c.datos, respuesta: c.respuesta, origen: `caso ${c.id}` })),
      ...[...Array.from({ length: 40 }, (_, i) => i + 1), ...Array.from({ length: 40 }, (_, i) => (i + 1) * 7919)]
        .map((s) => generarEjercicioAleatorio(s))
        .map((e) => ({ datos: e.datos, respuesta: e.respuesta, origen: `semilla ${e.semilla}` })),
    ];
    const problemas: string[] = [];
    for (const { datos, respuesta, origen } of lista) {
      const iupac = estequiometriaPropia(datos, IUPAC).valor;
      const libro = estequiometriaPropia(datos, LIBRO).valor;
      const menor = Math.min(iupac, libro);
      const mayor = Math.max(iupac, libro);
      const acepta = (v: number) => comprobarRespuesta(v, respuesta, datos).correcto;
      // Un rendimiento por encima del 100 % no existe: ese lo rechaza el dominio, no la ventana.
      const posibles = [menor, mayor, menor - 0.002 * iupac, mayor + 0.002 * iupac].filter((v) => datos.pregunta !== 'rendimiento' || v <= 100);
      for (const v of posibles) if (!acepta(v)) problemas.push(`${origen}: suspende ${v}`);
      const fuera = 0.006 * iupac + 0.01;
      for (const v of [menor - fuera, mayor + fuera]) if (v > 0 && acepta(v)) problemas.push(`${origen}: aprueba ${v}`);
    }
    expect(problemas).toEqual([]);
  });

  test('en la página: «81,9» para el caso 12 no dice «¡Correcto!»', async ({ page }) => {
    // REPARADO (hallazgo 3451, 25/10/2026).
    await abrir(page);
    const seccion = page.locator('section[aria-labelledby="casos-aula-titulo"]');
    await seccion.getByRole('button', { name: /^Caso 12:/ }).click();
    await seccion.locator('#casos-respuesta').fill('81,9');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toBeVisible();
    await expect(seccion.getByRole('alert')).not.toContainText('¡Correcto!');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CONTENIDO (re-inspección 24/10/2026)
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('re-inspección 24/10/2026 · contenido', () => {
  // Testigo: la propia app compara «disponibles» con «necesarios», que es multiplicar por el
  // coeficiente. N₂ + 3 H₂ con 2 mol de N₂ (2 × 28,014 = 56,028 g) y 5 mol de H₂ (5 × 2,016 = 10,08 g):
  //   H₂: 5,0000 disponibles / 2 × 3 = 6,0000 necesarios = 83,3 % → «83 %», limitante
  //   N₂: 2,0000 / 5 ÷ 3 = 1,6667 → 120 % · NH₃ = 5/3 × 2 = 3,3333 mol × 17,031 = «56,770 g»
  //   sobra N₂: 2 − 1,666667 = 0,333333 mol × 28,014 = 9,338 g → «Sobran 9,338 g (0,3333 mol)»
  test('la app decide el limitante comparando 5 mol de H₂ con los 3 × 2 = 6 que harían falta', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Haber-Bosch/);
    await escribir(page, '#inputA', '56.028');
    await escribir(page, '#inputB', '10.08');
    const h2 = barra(page, 'Hidrógeno (H₂)');
    await expect(h2).toContainText('5,0000 mol disponibles / 6,0000 mol necesarios (83 %)');
    await expect(h2.locator('[class*="limitanteBadge"]')).toHaveCount(1);
    await expect(barra(page, 'Nitrógeno (N₂)')).toContainText('2,0000 mol disponibles / 1,6667 mol necesarios (120 %)');
    await expect(tarjeta(page, 'Masa teórica de Amoniaco')).toContainText('56,770 g');
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Sobran 9,338 g (0,3333 mol)');
  });

  // REPARADO (hallazgo 3452, re-inspección del 24/10/2026, contenido) — el primer «error frecuente»
  // («Comparar moles directamente sin dividir por el coeficiente») ponía como ejemplo del error
  // «NO es limitante el H₂ por "tener menos moles que 3×2=6"… pero hay que hacer la división».
  // 5 < 3 × 2 es lo mismo que 5/3 < 2/1, y es justo lo que hacen las barras de la app (test de
  // arriba). El ejemplo no mostraba el error que nombra (2 mol < 5 mol → «el N₂ es el limitante»)
  // y tachaba de error un método correcto.
  test('los «errores frecuentes» no tachan de error comparar 5 mol de H₂ con los 3 × 2 = 6 necesarios', async ({ page }) => {
    // REPARADO (hallazgo 3452, 24/10/2026): el ejemplo muestra el error (2 < 5 → «el N₂») y da por buena la comparación 5 con 6.
    await abrir(page);
    const primero = page.locator('[class*="warningList"] li').first();
    await expect(primero).toContainText('Comparar moles directamente sin dividir por el coeficiente');
    await expect(primero).not.toContainText('NO es limitante el H₂ por');
  });

  // REPARADO (hallazgo 3453, re-inspección del 24/10/2026, contenido) — la tabla comparativa daba
  // como razón de que el H₂ sea el limitante habitual del Haber-Bosch su «mayor coeficiente (×3)».
  // El coeficiente no hace limitante a nadie (lo dice la propia página: «el que tiene menor (moles /
  // coeficiente)»), y con la alimentación 3:1 de la propia reacción ninguno sobra.
  test('la tabla no atribuye el limitante del Haber-Bosch al coeficiente', async ({ page }) => {
    // REPARADO (hallazgo 3453, 24/10/2026).
    await abrir(page);
    const fila = page.locator('[class*="tabla"] tbody tr').filter({ hasText: 'Haber-Bosch' });
    await expect(fila).toHaveCount(1);
    await expect(fila.locator('td').nth(2)).not.toContainText('mayor coeficiente');
  });

  // REPARADO (hallazgo 3454, re-inspección del 24/10/2026, contenido) — dos palabras pegadas por el
  // salto de línea de JSX después de un </strong> (JSX descarta el salto y la sangría): la FAQ decía
  // «la mezcla es estequiométricay no hay reactivo en exceso» y el quinto error frecuente «a la
  // masa del producto— El rendimiento afecta…» (los otros cuatro llevan « — » con espacios).
  test('errata: «estequiométrica y» y «producto — El» con su espacio', async ({ page }) => {
    // REPARADO (hallazgo 3454, 24/10/2026): {' '} tras el </strong>.
    await abrir(page);
    const faq = page.locator('[class*="faqItem"]').filter({ hasText: '¿Puede haber más de un reactivo limitante?' });
    await expect(faq).toHaveCount(1);
    await expect(faq).not.toContainText('estequiométricay');
    await expect(page.locator('[class*="warningList"] li').last()).not.toContainText('producto—');
  });

  /** Las preguntas del FAQPage servido (layout.tsx) y las de la FAQ visible, con su respuesta. */
  async function faqs(page: Page) {
    const jsonLd = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => JSON.parse(s.textContent ?? '{}'))
        .find((d) => d['@type'] === 'FAQPage') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] } | undefined,
    );
    const visibles = await page.locator('[class*="faqItem"]').evaluateAll((items) =>
      items.map((i) => ({
        pregunta: i.querySelector('h4')?.textContent?.trim() ?? '',
        respuesta: i.querySelector('p')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      })),
    );
    return { jsonLd: jsonLd?.mainEntity ?? [], visibles };
  }

  test('las dos preguntas duplicadas están en el FAQPage y en la FAQ visible', async ({ page }) => {
    await abrir(page);
    const { jsonLd, visibles } = await faqs(page);
    expect(jsonLd.map((q) => q.name)).toEqual(expect.arrayContaining([
      '¿Qué es el reactivo limitante en una reacción química?',
      '¿Cómo se calculan los moles a partir de gramos en estequiometría?',
    ]));
    expect(visibles.map((v) => v.pregunta)).toEqual(expect.arrayContaining([
      '¿Qué es el reactivo limitante?',
      '¿Cómo calculo los moles a partir de los gramos?',
    ]));
  });

  // REPARADO (hallazgo 3455, re-inspección del 24/10/2026, contenido) — «¿Qué es el reactivo
  // limitante?» y «¿Cómo calculo los moles…?» estaban en las dos bocas con respuestas distintas (la
  // visible avisaba de que no es el de menor masa y ponía el CH₄ como ejemplo; el FAQPage, el método
  // del cociente y el H₂O). Reparado con UNA constante en metadata.ts que importan las dos.
  test('una pregunta que está en las dos bocas tiene la misma respuesta', async ({ page }) => {
    // REPARADO (hallazgo 3455, 24/10/2026): RESPUESTA_REACTIVO_LIMITANTE y RESPUESTA_MOLES_DESDE_GRAMOS en metadata.ts.
    await abrir(page);
    const { jsonLd, visibles } = await faqs(page);
    const enJsonLd = (inicio: string) => jsonLd.find((q) => q.name.startsWith(inicio))?.acceptedAnswer.text;
    const enPantalla = (inicio: string) => visibles.find((v) => v.pregunta.startsWith(inicio))?.respuesta;
    expect(enPantalla('¿Qué es el reactivo limitante')).toBe(enJsonLd('¿Qué es el reactivo limitante'));
    expect(enPantalla('¿Cómo calculo los moles')).toBe(enJsonLd('¿Cómo se calculan los moles'));
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// RE-INSPECCIÓN 25/10/2026 — tras b82fadff (hallazgo 3450, página traducida) y 301b3e3d (hallazgo
// 3451, cabo C0267: el corrector acepta una VENTANA por caso en vez del 1 % fijo). Firma de rotura
// (cambio) en la cola: visitas cortas del 53 % al 80 % en 14 días.
//
// LAS DOS REPARACIONES SE SOSTIENEN:
//   · 3450 — la app ENTERA traducida (cada nodo de texto a <font><font>), en escritorio con clic y
//     en móvil con toques: las seis reacciones, los campos (también vacíos y en la mezcla
//     estequiométrica), el deslizador, los ±, los doce casos con pista, solución, comprobar e Intro,
//     la práctica con semilla fija y la guía educativa. Ni texto viejo (el detector de
//     generador-loteria), ni un NotFoundError, ni «Algo salió mal», y el texto de la app es idéntico
//     al de la misma secuencia sin traducir. No queda ninguna cifra como nodo de texto junto a otro
//     hijo que cambie (la forma del cabo C0243).
//   · 3451 — las ventanas, resueltas a mano abajo, coinciden con las de `ventanaDe` hasta el sexto
//     decimal, y la página aprueba y suspende justo donde dicen (76 respuestas tecleadas). En un
//     barrido de 20.000 prácticas: 0 suspensos de la cuenta con masas de libro, 0 de la cuenta con
//     los moles redondeados a tres decimales (con masas IUPAC y con las del libro), 0 respuestas por
//     encima del 100 % y 0 avisos «Te has desviado 0…». Con los moles a DOS decimales suspenden 2.063
//     de 20.000: es lo que el comentario de MARGEN_REDONDEO en casos.ts deja fuera a sabiendas.
//
// Ventana = [menor − m, mayor + m], con menor y mayor las dos respuestas exactas (IUPAC y libro) y
// m = 0,5 % de la IUPAC + media unidad del último decimal pedido. Resueltas a mano:
//   caso 1  40 g CH₄ → IUPAC 40 ÷ 16,043 = 2,4932993 · libro 40 ÷ 16 = 2,5
//           m = 0,0124665 + 0,0005 = 0,0129665 → [2,4803328 ; 2,5129665]
//   caso 3  8 g CH₄ + 40 g O₂ → CH₄ limitante; IUPAC 0,4986599 × 44,009 = 21,945521 · libro 0,5 × 44 = 22
//           m = 0,1097276 + 0,005 = 0,1147276 → [21,830793 ; 22,114728]
//   caso 7  73 g HCl + 60 g NaOH → sobra HCl; IUPAC 73 − 1,5001125 × 36,46 = 18,305898 · libro 0,5 × 36,5 = 18,25
//           m = 0,0915295 + 0,005 = 0,0965295 → [18,153471 ; 18,402428]
//   caso 9  280 g Fe + 48 g O₂ → sobra Fe; IUPAC 280 − 2,000125 × 55,845 = 168,303019 · libro 3 × 56 = 168
//           m = 0,8415151 + 0,005 = 0,8465151 → [167,153485 ; 169,149534]
//   caso 10 90 g glucosa al 85 % → IUPAC 0,9991341 × 46,069 × 0,85 = 39,124742 · libro 1 × 46 × 0,85 = 39,1
//           m = 0,1956237 + 0,005 = 0,2006237 → [38,899376 ; 39,325366]
//   caso 12 52 g de NaCl de 40 g HCl → IUPAC 52 ÷ 64,114098 = 81,10541 % · libro 52 ÷ 64,109589 = 81,11111 %
//           m = 0,4055271 + 0,005 = 0,4105271 → [80,69488 ; 81,52164]
// La desviación del aviso se mide desde la CLAVE redondeada (no desde el centro de la ventana).
// ═════════════════════════════════════════════════════════════════════════════════════════════

/** El porcentaje «(N %)» del texto de una barra, como número; NaN si no lo hay. */
function porcentajeDeBarra(texto: string | null): number {
  const m = (texto ?? '').match(/\(([\d.,]+)\s%\)/);
  return m ? Number(m[1].replace(/\./g, '').replace(',', '.')) : NaN;
}

/** «0,013 mol» → «Te has desviado 0,013 mol», con el espacio duro que escribe la app. */
const desviado = (texto: string) => `desviado ${texto.replace(' ', ' ')} de la respuesta`;

test.describe('re-inspección 25/10/2026 · cálculo', () => {
  // NORMAL — neutralización, 50 g de HCl + 30 g de NaOH, rendimiento 90 %
  //   n(HCl) = 50 / 36,46 = 1,3713659 mol · n(NaOH) = 30 / 39,997 = 0,7500563 mol → NaOH LIMITANTE
  //   NaCl = 0,7500563 mol × 58,44 = 43,833288 g → «43,833 g», «0,7501 mol»; al 90 %: 39,449959 → «39,450 g»
  //   sobra HCl: 50 − 0,7500563 × 36,46 = 22,652949 g → «22,653 g»; 1,3713659 − 0,7500563 = 0,6213096 → «0,6213 mol»
  //   barras: HCl 1,3713659 / 0,7500563 = 182,8 % → «183 %» · NaOH 0,7500563 / 1,3713659 = 54,7 % → «55 %»
  test('normal: 50 g HCl + 30 g NaOH al 90 % → NaOH limitante, 43,833 g de NaCl, 39,450 g reales, sobran 22,653 g de HCl', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Neutralización ácido-base/);
    await escribir(page, '#inputA', '50'); // por defecto 36.5
    await escribir(page, '#inputB', '30'); // y 40
    await sembrarValor(page, '#sliderRendimiento', 90);
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Hidróxido de sodio');
    const teorica = tarjeta(page, 'Masa teórica de Cloruro de sodio (NaCl)');
    await expect(teorica).toContainText('43,833 g');
    await expect(teorica).toContainText('0,7501 mol');
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('rendimiento 90 %');
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('39,450 g');
    const exceso = tarjeta(page, 'Reactivo en exceso');
    await expect(exceso).toContainText('Ácido clorhídrico');
    await expect(exceso).toContainText('Sobran 22,653 g (0,6213 mol)');
    await expect(barra(page, 'Ácido clorhídrico (HCl)')).toContainText('1,3714 mol disponibles / 0,7501 mol necesarios (183 %)');
    const naoh = barra(page, 'Hidróxido de sodio (NaOH)');
    await expect(naoh).toContainText('0,7501 mol disponibles / 1,3714 mol necesarios (55 %)');
    await expect(naoh.locator('[class*="limitanteBadge"]')).toHaveCount(1);
    await expect(page.locator('[class*="limitanteResaltado"]')).toHaveText(/^NaOH\s*$/);
  });

  // LÍMITE — el mínimo de los campos (min="0.1"): 0,1 g de Fe + 0,1 g de O₂, y el rendimiento al 1 %
  //   n(Fe) = 0,1 / 55,845 = 0,001790671 → razón /4 = 0,000447668 · n(O₂) = 0,1 / 31,998 = 0,003125195
  //   → razón /3 = 0,001041732 → Fe LIMITANTE
  //   Fe₂O₃ = 0,000447668 × 2 = 0,000895336 mol × 159,687 = 0,142974 g → «0,143 g», «0,0009 mol»
  //   sobra O₂: 0,003125195 − 0,000447668 × 3 = 0,001782192 mol × 31,998 = 0,057027 g → «0,057 g (0,0018 mol)»
  //   barras: Fe 0,0017907 / (0,003125195 × 4/3 = 0,0041669) = 43,0 % → «43 %» ·
  //           O₂ 0,0031252 / (0,001790671 × 3/4 = 0,0013430) = 232,7 % → «233 %»
  //   al 1 %: 0,142974 × 0,01 = 0,00142974 → «0,001 g»
  test('límite: 0,1 g Fe + 0,1 g O₂ → Fe limitante, 0,143 g de Fe₂O₃, sobran 0,057 g de O₂; al 1 %, 0,001 g', async ({ page }) => {
    await abrir(page);
    await elegir(page, /Oxidación del hierro/);
    await escribir(page, '#inputA', '0.1');
    await escribir(page, '#inputB', '0.1');
    await expect(tarjeta(page, 'Reactivo limitante')).toContainText('Hierro');
    const teorica = tarjeta(page, 'Masa teórica de Óxido de hierro (III)');
    await expect(teorica).toContainText('0,143 g');
    await expect(teorica).toContainText('0,0009 mol');
    await expect(tarjeta(page, 'Reactivo en exceso')).toContainText('Sobran 0,057 g (0,0018 mol)');
    await expect(barra(page, 'Hierro (Fe)')).toContainText('0,0018 mol disponibles / 0,0042 mol necesarios (43 %)');
    await expect(barra(page, 'Oxígeno (O₂)')).toContainText('0,0031 mol disponibles / 0,0013 mol necesarios (233 %)');
    await sembrarValor(page, '#sliderRendimiento', 1);
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('rendimiento 1 %');
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('0,001 g');
    // el «−» no baja de 0,1 g
    await page.getByRole('button', { name: 'Reducir gramos de reactivo A' }).click();
    await expect(page.locator('#inputA')).toHaveValue('0.1');
  });

  // ABIERTO (re-inspección del 25/10/2026, contenido) — la explicación de las barras dice «El que
  // no llega al 100 % es el limitante; el que lo pasa, sobra», pero el porcentaje va redondeado a
  // entero, y en dos de las seis reacciones con sus valores por defecto las DOS barras dicen «100 %»
  // (texto y aria-valuetext), también la del limitante:
  //   combustión 16 g CH₄ + 64 g O₂: CH₄ 0,9973197 / 1,0000625 = 99,73 % → «(100 %)», limitante ·
  //     O₂ 2,0001250 / 1,9946394 = 100,28 % → «(100 %)»
  //   neutralización 36,5 g HCl + 40 g NaOH: NaOH 1,0000750 / 1,0010971 = 99,90 % → «(100 %)»,
  //     limitante · HCl 1,0010971 / 1,0000750 = 100,10 % → «(100 %)»
  // Es lo primero que ve quien abre la app. Pasará a verde cuando el limitante se lea por debajo de
  // 100 y el exceso por encima.
  test('valores por defecto: la barra del limitante se lee por debajo del 100 % y la del exceso por encima', async ({ page }) => {
    test.fail();
    await abrir(page);
    const ch4 = barra(page, 'Metano (CH₄)');
    await expect(ch4).toContainText('0,9973 mol disponibles / 1,0001 mol necesarios');
    await expect(ch4.locator('[class*="limitanteBadge"]')).toHaveCount(1);
    expect(porcentajeDeBarra(await ch4.locator('[class*="barValor"]').textContent()), 'CH₄, limitante').toBeLessThan(100);
    expect(porcentajeDeBarra(await barra(page, 'Oxígeno (O₂)').locator('[class*="barValor"]').textContent()), 'O₂, en exceso').toBeGreaterThan(100);
    await elegir(page, /Neutralización ácido-base/);
    const naoh = barra(page, 'Hidróxido de sodio (NaOH)');
    await expect(naoh.locator('[class*="limitanteBadge"]')).toHaveCount(1);
    expect(porcentajeDeBarra(await naoh.locator('[class*="barValor"]').textContent()), 'NaOH, limitante').toBeLessThan(100);
    expect(porcentajeDeBarra(await barra(page, 'Ácido clorhídrico (HCl)').locator('[class*="barValor"]').textContent()), 'HCl, en exceso').toBeGreaterThan(100);
  });
});

test.describe('re-inspección 25/10/2026 · corrector por ventana (301b3e3d se sostiene)', () => {
  // [respuesta, desviación que dice el aviso] — los bordes, de las ventanas resueltas en la cabecera
  const VENTANAS: { caso: number; dentro: number[]; fuera: [number, string][] }[] = [
    { caso: 1, dentro: [2.493, 2.5, 2.481, 2.512], fuera: [[2.48, '0,013 mol'], [2.513, '0,020 mol']] },
    { caso: 3, dentro: [21.95, 22, 21.84, 22.11], fuera: [[21.83, '0,12 g'], [22.12, '0,17 g']] },
    { caso: 7, dentro: [18.31, 18.25, 18.16, 18.4], fuera: [[18.15, '0,16 g'], [18.41, '0,10 g']] },
    { caso: 9, dentro: [168.3, 168, 167.16, 169.14], fuera: [[167.15, '1,15 g'], [169.15, '0,85 g'], [166.7, '1,60 g']] },
    { caso: 10, dentro: [39.12, 39.1, 38.9, 39.32], fuera: [[38.89, '0,23 g'], [39.33, '0,21 g']] },
    {
      caso: 12,
      dentro: [81.11, 80.81, 81.25, 80.7, 81.52],
      fuera: [[81.9, '0,79 %'], [80.3, '0,81 %'], [81.92, '0,81 %'], [80.69, '0,42 %'], [81.53, '0,42 %']],
    },
  ];

  test('la ventana de seis casos, resuelta a mano: dentro aprueba, fuera suspende con la desviación desde la clave', () => {
    for (const { caso, dentro, fuera } of VENTANAS) {
      const c = CASOS_AULA[caso - 1];
      expect(c.id).toBe(caso);
      for (const v of dentro) expect(comprobarRespuesta(v, c.respuesta, c.datos).correcto, `caso ${caso}: ${v}`).toBe(true);
      for (const [v, texto] of fuera) {
        const r = comprobarRespuesta(v, c.respuesta, c.datos);
        expect(r.correcto, `caso ${caso}: ${v}`).toBe(false);
        expect(r.motivo, `caso ${caso}: ${v}`).toContain(desviado(texto));
      }
    }
    // y los bordes calculados a mano son los de ventanaDe. Precisión 4 (< 0,00005): un margen
    // distinto (0,6 % en vez de 0,5 %) movería el borde del caso 1, el más estrecho, 0,0025.
    const bordes: [number, number, number][] = [
      [1, 2.4803328, 2.5129665], [3, 21.830793, 22.114728], [7, 18.153471, 18.402428],
      [9, 167.153485, 169.149534], [10, 38.899376, 39.325366], [12, 80.69488, 81.52164],
    ];
    for (const [caso, menor, mayor] of bordes) {
      const w = ventanaDe(CASOS_AULA[caso - 1].datos);
      expect(w.centro - w.tolerancia, `caso ${caso}, borde inferior`).toBeCloseTo(menor, 4);
      expect(w.centro + w.tolerancia, `caso ${caso}, borde superior`).toBeCloseTo(mayor, 4);
    }
  });

  // Cinco prácticas con semilla fija, resueltas a mano a partir de su enunciado (la «cuenta de
  // alumno» redondea cada cantidad de moles a tres decimales):
  //   424242  exceso, 40 g CH₄ + 32 g O₂ → O₂ limitante; IUPAC 40 − 0,5000313 × 16,043 = 31,977998 ·
  //           alumno 1,993 × 16,043 = 31,9737 → 31,97 · libro 2 × 16 = 32 → ventana [31,813108 ; 32,16489]
  //   7       rendimiento, 45 g glucosa y 20,7 g de etanol → IUPAC 20,7 ÷ 23,014554 = 89,94308 % ·
  //           alumno 20,7 ÷ (0,500 × 46,069) = 89,865 → 89,87 · libro 20,7 ÷ 23 = 90 → [89,488369 ; 90,454715]
  //   99991   masa teórica, 8 g CH₄ + 24 g O₂ → O₂ limitante; IUPAC 0,3750234 × 44,009 = 16,504407 ·
  //           alumno 0,375 × 44,009 = 16,50 · libro 0,375 × 44 = 16,5 → [16,412478 ; 16,591929]
  //   123456  masa real, 36 g glucosa al 70 % → IUPAC 18,411643 × 0,7 = 12,888150 · alumno 0,400 ×
  //           46,069 × 0,7 = 12,8993 → 12,90 · libro 18,4 × 0,7 = 12,88 → [12,810559 ; 12,957591]
  //   2026    rendimiento, 224 g Fe + 64 g O₂ y 212,5 g de Fe₂O₃ → O₂ limitante; IUPAC 212,5 ÷
  //           212,929318 = 99,79838 % · alumno 212,5 ÷ (1,333 × 159,687) = 99,83 · libro 212,5 ÷
  //           213,3333 = 99,61 → [99,105383 ; 100,302372] (por encima de 100 manda el dominio)
  const PRACTICAS: { semilla: number; datos: string; clave: number; buenas: number[]; malas: [number, string][] }[] = [
    { semilla: 424242, datos: 'Reaccionan 40 g de metano (CH₄) y 32 g de oxígeno (O₂)', clave: 31.98, buenas: [31.97, 32, 31.82, 32.16], malas: [[31.81, '0,17 g'], [32.17, '0,19 g']] },
    { semilla: 7, datos: 'Reaccionan 45 g de glucosa (C₆H₁₂O₆) según C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂ y se recogen 20,7 g de etanol', clave: 89.94, buenas: [89.87, 90, 89.49, 90.45], malas: [[89.48, '0,46 %'], [90.46, '0,52 %']] },
    { semilla: 99991, datos: 'Reaccionan 8 g de metano (CH₄) y 24 g de oxígeno (O₂)', clave: 16.5, buenas: [16.5, 16.42, 16.59], malas: [[16.41, '0,09 g'], [16.6, '0,10 g']] },
    { semilla: 123456, datos: 'Reaccionan 36 g de glucosa (C₆H₁₂O₆) según C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂, con un rendimiento del 70', clave: 12.89, buenas: [12.9, 12.88, 12.82, 12.95], malas: [[12.81, '0,08 g'], [12.96, '0,07 g']] },
    { semilla: 2026, datos: 'Reaccionan 224 g de hierro (Fe) y 64 g de oxígeno (O₂) según 4 Fe + 3 O₂ → 2 Fe₂O₃ y se recogen 212,5 g', clave: 99.8, buenas: [99.83, 99.61, 99.11], malas: [[99.1, '0,70 %']] },
  ];

  test('práctica aleatoria: la cuenta con moles a tres decimales y la del libro aprueban; un 0,5 % más allá, no', () => {
    for (const { semilla, datos, clave, buenas, malas } of PRACTICAS) {
      const e = generarEjercicioAleatorio(semilla);
      expect(e.enunciado, `semilla ${semilla}`).toContain(datos);
      expect(e.respuesta, `semilla ${semilla}`).toBe(clave);
      for (const v of buenas) expect(comprobarRespuesta(v, e.respuesta, e.datos).correcto, `semilla ${semilla}: ${v}`).toBe(true);
      for (const [v, texto] of malas) {
        const r = comprobarRespuesta(v, e.respuesta, e.datos);
        expect(r.correcto, `semilla ${semilla}: ${v}`).toBe(false);
        expect(r.motivo, `semilla ${semilla}: ${v}`).toContain(desviado(texto));
      }
    }
  });

  /** La cuenta de un alumno con las masas de la tabla `t` y los moles redondeados a `dm` decimales. */
  function cuentaDeAlumno(d: DatosCaso, t: Tabla, dm: number): number {
    const rm = (v: number) => redondearTest(v, dm);
    const r = R[d.reaccionId];
    const MA = masaMolarDe(r.A.c, t);
    const MP = masaMolarDe(r.P.c, t);
    const nA = rm(d.gramosA / MA);
    if (d.pregunta === 'moles' && d.reactivo !== 'B') return nA;
    const MB = r.B ? masaMolarDe(r.B.c, t) : NaN;
    const nB = r.B ? rm(d.gramosB / MB) : NaN;
    if (d.pregunta === 'moles') return nB;
    if (d.pregunta === 'masa-necesaria') return rm((nA / r.A.k) * (r.B?.k ?? NaN)) * MB;
    const ratioA = nA / r.A.k;
    const ratioB = r.B ? nB / r.B.k : Infinity;
    const ratio = Math.min(ratioA, ratioB);
    const teorica = rm(ratio * r.P.k) * MP;
    if (d.pregunta === 'masa-teorica') return teorica;
    if (d.pregunta === 'masa-real') return (teorica * (d.rendimiento ?? 100)) / 100;
    if (d.pregunta === 'rendimiento') return ((d.masaObtenida ?? NaN) / teorica) * 100;
    return ratioA <= ratioB ? rm(nB - rm(ratio * (r.B?.k ?? NaN))) * MB : rm(nA - rm(ratio * r.A.k)) * MA;
  }

  test('barrido de 400 prácticas: aprueba la cuenta con moles a tres decimales (IUPAC y libro) y ningún aviso dice «desviado 0»', () => {
    const problemas: string[] = [];
    for (let s = 1; s <= 400; s++) {
      const e = generarEjercicioAleatorio(s * 104729);
      const dec = decimalesDe(e.datos.pregunta);
      if (e.datos.pregunta === 'rendimiento' && e.respuesta > 100) problemas.push(`semilla ${e.semilla}: la clave pasa del 100 % (${e.respuesta})`);
      for (const [tabla, t] of [['IUPAC', IUPAC], ['libro', LIBRO]] as const) {
        const v = redondearTest(cuentaDeAlumno(e.datos, t, 3), dec);
        const r = comprobarRespuesta(v, e.respuesta, e.datos);
        if (!r.correcto) problemas.push(`semilla ${e.semilla} (${e.datos.pregunta}, ${tabla}): suspende ${v} para ${e.respuesta} — «${r.motivo}»`);
      }
      const w = ventanaDe(e.datos);
      for (const u of [w.centro - w.tolerancia - 10 ** -dec, w.centro + w.tolerancia + 10 ** -dec]) {
        const r = comprobarRespuesta(redondearTest(u, dec), e.respuesta, e.datos);
        if (!r.correcto && /desviado 0(,0+)?\s/.test(r.motivo)) problemas.push(`semilla ${e.semilla}: «${r.motivo}»`);
      }
    }
    expect(problemas).toEqual([]);
  });
});

test.describe('re-inspección 25/10/2026 · corrector en la página', () => {
  const seccion = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');
  const veredicto = (page: Page) => seccion(page).locator('[role="alert"]');

  async function comprobar(page: Page, respuesta: string): Promise<void> {
    await seccion(page).locator('#casos-respuesta').fill(respuesta);
    await seccion(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(veredicto(page)).toBeVisible();
  }

  test('casos 12 y 9: lo que aprobaba el 1 % y no sale de ninguna tabla se suspende con su desviación', async ({ page }) => {
    await abrir(page);
    await seccion(page).getByRole('button', { name: /^Caso 12:/ }).click();
    for (const [v, texto] of [['81,9', '0,79 %'], ['80,3', '0,81 %'], ['81,92', '0,81 %']]) {
      await comprobar(page, v);
      await expect(veredicto(page), v).toContainText(desviado(texto));
    }
    for (const v of ['80,81', '81,25', '81,11']) {
      await comprobar(page, v);
      await expect(veredicto(page), v).toContainText('¡Correcto!');
    }
    await seccion(page).getByRole('button', { name: /^Caso 9:/ }).click();
    await comprobar(page, '166,7');
    await expect(veredicto(page)).toContainText(desviado('1,60 g'));
    for (const v of ['168,30', '168']) {
      await comprobar(page, v);
      await expect(veredicto(page), v).toContainText('¡Correcto!');
    }
  });

  test('práctica con la semilla 7: el rendimiento con moles a tres decimales (89,87 %) aprueba; 89,48 % no', async ({ page }) => {
    await abrir(page);
    // «Practicar» siembra con Date.now(): se fija el reloj para que salga siempre la semilla 7
    await page.clock.setFixedTime(7);
    await seccion(page).getByRole('button', { name: /Practicar/ }).click();
    await expect(seccion(page).locator('[class*="casoEnunciado"]')).toContainText(
      'Reaccionan 45 g de glucosa (C₆H₁₂O₆) según C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂ y se recogen 20,7 g de etanol (C₂H₅OH).',
    );
    await comprobar(page, '89,87');
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await comprobar(page, '90');
    await expect(veredicto(page)).toContainText('¡Correcto!');
    await comprobar(page, '89,48');
    await expect(veredicto(page)).toContainText(desviado('0,46 %'));
    await seccion(page).getByRole('button', { name: /Ver solución/ }).click();
    await expect(seccion(page).locator('[class*="casoRespuestaFinal"]')).toHaveText('Respuesta: 89,94 %');
  });
});

/** El texto visible de la app (el contenedor del hero), con los espacios normalizados. */
const textoApp = (page: Page) =>
  page.evaluate(() =>
    ((document.querySelector('h1')?.closest('[class*="container"]') as HTMLElement | null)?.innerText ?? '').replace(/\s+/g, ' ').trim(),
  );

type Paso = [string, (p: Page) => Promise<void>];

/** El recorrido de la app entera, igual para la página traducida y para la de control. */
function recorrido(toque: boolean): Paso[] {
  const pulsar = (l: Locator) => (toque ? l.tap() : l.click());
  const boton = (nombre: string | RegExp) => (p: Page) => pulsar(p.getByRole('button', { name: nombre }).first());
  const casos = (p: Page) => p.locator('section[aria-labelledby="casos-aula-titulo"]');
  const enCasos = (nombre: string | RegExp) => (p: Page) => pulsar(casos(p).getByRole('button', { name: nombre }));
  const campo = (sel: string, valor: string) => (p: Page) => escribir(p, sel, valor);
  const rendimiento = (v: number) => (p: Page) => sembrarValor(p, '#sliderRendimiento', v);
  const pasos: Paso[] = [
    ['agua', boton(/Síntesis del agua/)],
    ['agua A = 5', campo('#inputA', '5')],
    ['agua B = 30', campo('#inputB', '30')],
    ['rendimiento 80', rendimiento(80)],
    ['+ de A', boton('Aumentar gramos de reactivo A')],
    ['− de B', boton('Reducir gramos de reactivo B')],
    ['A vacío', campo('#inputA', '')],
    ['A = 4', campo('#inputA', '4')],
    ['neutralización', boton(/Neutralización ácido-base/)],
    ['HCl 36,46 (estequiométrica)', campo('#inputA', '36.46')],
    ['HCl 36,56 (NaOH limitante)', campo('#inputA', '36.56')],
    ['HCl 30 (HCl limitante)', campo('#inputA', '30')],
    ['NaOH vacío', campo('#inputB', '')],
    ['NaOH 40', campo('#inputB', '40')],
    ['rendimiento 5', rendimiento(5)],
    ['Haber-Bosch', boton(/Haber-Bosch/)],
    ['H₂ 6,1 (N₂ limitante)', campo('#inputB', '6.1')],
    ['hierro', boton(/Oxidación del hierro/)],
    ['Fe 223,38', campo('#inputA', '223.38')],
    ['O₂ 95,994 (estequiométrica)', campo('#inputB', '95.994')],
    ['O₂ 95 (O₂ limitante)', campo('#inputB', '95')],
    ['fermentación', boton(/Fermentación alcohólica/)],
    ['rendimiento 85', rendimiento(85)],
    ['− de glucosa', boton('Reducir gramos de reactivo A')],
    ['glucosa 0', campo('#inputA', '0')],
    ['glucosa 90', campo('#inputA', '90')],
    ['combustión desde fermentación', boton(/Combustión del metano/)],
  ];
  for (let i = 1; i <= 12; i++) {
    pasos.push(
      [`caso ${i}`, enCasos(new RegExp(`^Caso ${i}:`))],
      [`caso ${i} · ver pista`, enCasos(/Ver pista/)],
      [`caso ${i} · ver solución`, enCasos(/Ver solución/)],
      [`caso ${i} · comprobar 1`, async (p) => {
        await casos(p).locator('#casos-respuesta').fill('1');
        await pulsar(casos(p).getByRole('button', { name: 'Comprobar' }));
      }],
      [`caso ${i} · Intro con «abc»`, async (p) => {
        await casos(p).locator('#casos-respuesta').fill('abc');
        await casos(p).locator('#casos-respuesta').press('Enter');
      }],
      [`caso ${i} · ocultar pista y solución`, async (p) => {
        await enCasos(/Ocultar pista/)(p);
        await enCasos(/Ocultar solución/)(p);
      }],
      [`caso ${i} · cargar en el simulador`, enCasos('Cargar en el simulador')],
    );
  }
  // «Practicar» siembra con Date.now(): el reloj se fija para que las dos pestañas saquen el mismo
  // ejercicio. Dentro del AÑO EN CURSO: con un instante de 1970 el pie, que se vuelve a pintar al
  // cargar el caso, pasaba de «© 2026» a «1970» y el detector lo daba (con razón) por texto viejo.
  const base = new Date(new Date().getFullYear(), 6, 1).getTime();
  for (const semilla of [base + 424242, base + 7]) {
    pasos.push(
      [`practicar (semilla ${semilla})`, async (p) => {
        await p.clock.setFixedTime(semilla);
        await enCasos(/Practicar/)(p);
      }],
      [`practicar ${semilla} · solución y comprobar`, async (p) => {
        await enCasos(/Ver solución/)(p);
        await casos(p).locator('#casos-respuesta').fill('2');
        await pulsar(casos(p).getByRole('button', { name: 'Comprobar' }));
      }],
      [`practicar ${semilla} · cargar`, enCasos('Cargar en el simulador')],
    );
  }
  pasos.push(
    ['de la práctica al caso 3', enCasos(/^Caso 3:/)],
    ['guía educativa: abrir', boton(/Ver guía educativa/)],
    ['guía educativa: cerrar', boton(/Ocultar guía educativa/)],
  );
  return pasos;
}

/**
 * Recorre la app traducida y, en otra pestaña, sin traducir. Tras cada paso: el detector de texto
 * viejo, y que el texto de las dos coincida (si la traducida se queda con un valor viejo en un
 * nodo que el detector no apuntó, también sale aquí).
 */
async function recorrerTraducida(page: Page, toque: boolean) {
  const errores = erroresDeReact(page);
  let cargas = 0;
  page.on('load', () => (cargas += 1));
  await abrir(page);
  const control = await page.context().newPage();
  await abrir(control);
  const cargasIniciales = cargas;
  const viejos: string[] = [];
  const distintos: string[] = [];
  for (const [nombre, accion] of recorrido(toque)) {
    await traducir(page);
    await accion(page);
    await accion(control);
    for (const v of await textoViejo(page)) viejos.push(`${nombre}: ${v}`);
    let a = '';
    let b = '';
    for (let intento = 0; intento < 20; intento++) {
      [a, b] = [await textoApp(page), await textoApp(control)];
      if (a === b) break;
      await page.waitForTimeout(100);
    }
    if (a !== b) {
      let i = 0;
      while (i < a.length && a[i] === b[i]) i++;
      distintos.push(`${nombre}: traducida «${a.slice(Math.max(0, i - 40), i + 60)}» · control «${b.slice(Math.max(0, i - 40), i + 60)}»`);
    }
    await expect(page.getByRole('heading', { name: 'Algo salió mal' }), nombre).toHaveCount(0);
  }
  expect(viejos, 'textos que se quedaron viejos').toEqual([]);
  expect(distintos, 'la traducida no dice lo mismo que la de control').toEqual([]);
  expect(errores, 'errores de React').toEqual([]);
  expect(cargas, 'recargas de la página durante el uso').toBe(cargasIniciales);
  await control.close();
}

test.describe('re-inspección 25/10/2026 · página traducida, la app entera (3450 se sostiene)', () => {
  test('escritorio: seis reacciones, campos, deslizador, ±, doce casos, práctica y guía, sin texto viejo', async ({ page }) => {
    test.setTimeout(300_000);
    await recorrerTraducida(page, false);
  });
});

test.describe('re-inspección 25/10/2026 · móvil 390 × 844 (firma de rotura)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('traducida y con toques: el mismo recorrido, sin texto viejo, sin caídas y sin recargar', async ({ page }) => {
    test.setTimeout(300_000);
    await recorrerTraducida(page, true);
  });

  // El deslizador al dedo: tocar la pista al 25 % de su anchura lo lleva cerca del 25 % (el pulgar
  // de 22 px desplaza el punto: 23 % medido), y arrastrar del 99 al 50 % lo deja en 50.
  //   combustión por defecto: CO₂ teórico 16 / 16,043 × 44,009 = 43,891 g → al 50 %, 21,946 g
  test('el deslizador de rendimiento responde al toque y al arrastre', async ({ page }) => {
    await abrir(page);
    const deslizador = page.locator('#sliderRendimiento');
    await deslizador.scrollIntoViewIfNeeded();
    const b = (await deslizador.boundingBox())!;
    await page.touchscreen.tap(b.x + b.width * 0.25, b.y + b.height / 2);
    await expect.poll(async () => Number(await deslizador.inputValue())).toBeLessThan(30);
    const cdp = await page.context().newCDPSession(page);
    const y = b.y + b.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x + b.width * 0.99, y }] });
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: b.x + b.width * (0.99 - (0.49 * i) / 8), y }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('label[for="sliderRendimiento"]')).toContainText('50 %');
    await expect(tarjeta(page, 'Masa real obtenida')).toContainText('21,946 g');
  });
});

test.describe('re-inspección 25/10/2026 · contenido', () => {
  // ABIERTO (re-inspección del 25/10/2026, contenido) — el quinto «error frecuente» dice que el
  // rendimiento «No reduce los moles del reactivo que reacciona (eso es conversión, no
  // rendimiento)», pero la misma página llama rendimiento a lo que reacciona: el caso 11 («en cada
  // pasada por el reactor solo se transforma el 15 % de lo posible», pista: «El 15 % es el
  // rendimiento»), el escenario del Haber-Bosch («El rendimiento por paso es bajo (~15 %), pero el
  // gas no reaccionado se recicla») y la definición («por pérdidas, reacciones secundarias o
  // equilibrio incompleto»). Y «Cargar en el simulador» del caso 11 (28 g N₂, 12 g H₂, 15 %) pinta
  // «Reactivo limitante: Nitrógeno» y «Sobran 5,955 g (2,9539 mol)» de H₂ como si todo el N₂ hubiera
  // reaccionado, cuando con el 15 % transformado quedan 0,85 × 28 = 23,80 g de N₂ y
  // 12 − 0,15 × 2,9985 × 2,016 = 11,093 g de H₂. Pasará a verde cuando la página use una sola noción.
  test('rendimiento y conversión: la página no llama rendimiento a lo que su quinto error frecuente llama conversión', async ({ page }) => {
    test.fail();
    await abrir(page);
    const quinto = (await page.locator('[class*="warningList"] li').last().textContent()) ?? '';
    const escenario = (await page.locator('[class*="scenarioCard"]').filter({ hasText: 'Haber-Bosch' }).textContent()) ?? '';
    const caso11 = CASOS_AULA[10];
    expect(caso11.id).toBe(11);
    const separaConversion = /eso es conversión, no rendimiento/.test(quinto);
    const llamaRendimientoALoQueReacciona =
      /solo se transforma el 15/.test(caso11.enunciado) || /gas no reaccionado se recicla/.test(escenario);
    expect(separaConversion && llamaRendimientoALoQueReacciona).toBe(false);
  });
});
