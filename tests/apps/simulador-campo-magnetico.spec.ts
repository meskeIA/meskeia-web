import { test, expect, Page, Locator } from '@playwright/test';
import {
  esperarHidratacion,
  esperarPaginaAsentada,
  sembrarValor,
  sembrarValorAcotado,
} from './_hidratacion';

/**
 * stemum.com → el servidor local, para ver la app como la sirve el portal (data-brand="stemum"
 * y la píldora «Stemum › Física» en la barra fija). Va al NIVEL DEL FICHERO porque
 * `launchOptions` fuerza un worker nuevo; al resto de tests no les afecta: solo resuelve ese host.
 * (Re-inspección del 04/10/2026, bloque «hero» del final.)
 */
test.use({ launchOptions: { args: ['--host-resolver-rules=MAP stemum.com 127.0.0.1:3050'] } });

/**
 * Inspector — simulador-campo-magnetico (segmento CÁLCULO / física, portal Stemum)
 *
 * Generado por /inspector el 24/09/2026 (primera inspección).
 *
 * El <h1> promete «Simulador de Campo Magnético» con el subtítulo «Fuerza de Lorentz, campo
 * de las corrientes e inducción de Faraday-Lenz», y la metadata «Calcula la fuerza magnética
 * sobre cargas y corrientes, el radio y el periodo del movimiento circular, el campo de hilos,
 * espiras y solenoides». Todo el cálculo vive en app/simulador-campo-magnetico/page.tsx:
 *   · μ₀ = 4π·10⁻⁷ T·m/A · e = 1,602176634·10⁻¹⁹ C · m_p = 1,67262192·10⁻²⁷ kg
 *   · Lorentz:   F = |q|·v·B·sen θ · r = m·v·sen θ/(|q|·B) · T = 2π·m/(|q|·B) · paso = v·cos θ·T
 *   · Corrientes: B_hilo = μ₀I/(2πr) · B_espira = μ₀I/(2R) · B_sol = μ₀·(N/L)·I
 *                 F_hilos = μ₀·I₁·|I₂|/(2π·d), atracción si I₂ ≥ 0
 *   · Presentación: formatCientifico(x, d) → notación científica con coma si x < 10⁻³ o
 *     x ≥ 10⁵; en la franja [10⁻³, 10⁵) usa formatNumber con d decimales COMO MÍNIMO, ampliados
 *     por debajo de 1 hasta 3 cifras significativas (reparado el 24/09/2026, hallazgo 1344:
 *     antes eran d decimales fijos y 1,2·10⁻³ T salía «0,001 T»).
 *
 * Los deslizadores arrancan en: v = 5·10⁶ m/s · B = 0,5 T · θ = 90° · I = 10 A · r = 5 cm ·
 * N = 500 · L = 0,30 m · I₂ = 10 A · d = 2 cm. Cada caso parte de OTRO estado, para que
 * sembrar pruebe algo.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * CASOS RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal)
 *   (a) Corrientes: I = 25 A, r = R = 2 cm, N = 800, L = 0,40 m.
 *       B_hilo   = 2·10⁻⁷ · 25 / 0,02            = 2,5·10⁻⁴ T  (250 μT) → «2,500 × 10⁻⁴ T»
 *       B_espira = 4π·10⁻⁷ · 25 / (2 · 0,02)     = 7,853982·10⁻⁴ T      → «7,854 × 10⁻⁴ T»
 *       n = 800 / 0,40 = 2000 /m                                        → «2000 /m»
 *       B_sol    = 4π·10⁻⁷ · 2000 · 25           = 0,0628319 T          → «0,0628 T»
 *       Espira / hilo = π exactamente: un 2π de más o de menos salta a la vista.
 *   (b) Lorentz: protón, v = 3·10⁶ m/s, B = 0,2 T, θ = 90°.
 *       F = 1,602176634·10⁻¹⁹ · 3·10⁶ · 0,2 = 9,613060·10⁻¹⁴ N          → «9,61 × 10⁻¹⁴ N»
 *       r = 1,67262192·10⁻²⁷ · 3·10⁶ / (1,602176634·10⁻¹⁹ · 0,2) = 0,156595 m → «0,157 m»
 *       T = 2π · 1,67262192·10⁻²⁷ / (3,204353·10⁻²⁰) = 3,279724·10⁻⁷ s  → «3,28 × 10⁻⁷ s»
 *
 *   CASO 2 (límite)
 *   (a) θ = 0° (v paralela a B), protón a 5·10⁶ m/s en 0,5 T: sen 0 = 0 → F = 0 N, r = 0 m,
 *       v⊥ = 0 m/s. Y el dibujo no debe pintar flecha F con F = 0; con fuerza, su largo es
 *       48 px · F/F_ref (F_ref = fuerza del arranque), acotado a [12, 120] px:
 *       θ = 30° → sen 30° = 0,5 → 24 px.
 *   (b) θ = 90° (arranque): cos 90° = 0 → la trayectoria es una circunferencia y el paso de la
 *       hélice es 0 m. La app lo calculaba con Math.cos(π/2) = 6,12·10⁻¹⁷ y mostraba
 *       5·10⁶ · 6,12·10⁻¹⁷ · 1,3119·10⁻⁷ = 4,017·10⁻¹⁷ m (hallazgo 1345, reparado).
 *   (c) Sentido: ω = −q·B/m. Protón con B saliente (+z) → giro HORARIO visto desde la
 *       pantalla; invertir B → ANTIHORARIO; electrón con B entrante → HORARIO otra vez.
 *   (d) Corriente del segundo hilo invertida: I₁ = 10 A, I₂ = −25 A, d = 10 cm →
 *       F = 2·10⁻⁷ · 10 · 25 / 0,10 = 5·10⁻⁴ N/m → «5,000 × 10⁻⁴ N/m», y «se repelen».
 *
 *   CASO 3 (rechazo / aviso)
 *   (a) I = −5 A y r = 0 m no tienen sentido en estos controles: el <input type="range">
 *       debe caparlos a su mínimo (I = 0,1 A, r = 0,5 cm) y el cálculo seguir finito:
 *       B_hilo = 2·10⁻⁷ · 0,1 / 0,005 = 4·10⁻⁶ T → «4,000 × 10⁻⁶ T»
 *       B_espira = 4π·10⁻⁷ · 0,1 / 0,01 = 1,256637·10⁻⁵ T → «1,257 × 10⁻⁵ T»
 *   (b) Precisión en la franja del militesla: I = 30 A, r = 0,5 cm →
 *       B_hilo = 2·10⁻⁷ · 30 / 0,005 = 1,2·10⁻³ T (1,2 mT) → «0,00120 T» en la tabla y en la
 *       etiqueta del dibujo (antes «0,001 T» y «B = 0,00 T»: hallazgo 1344, reparado).
 *       Electrón a 2·10⁶ m/s: E = ½·9,1093837·10⁻³¹·(2·10⁶)² / 1,602176634·10⁻¹⁹
 *       = 11,3712 eV = 0,0113712 keV → «0,0114 keV».
 *       I₁ = I₂ = 30 A a 4 cm: F/L = 2·10⁻⁷·30·30/0,04 = 4,5·10⁻³ N/m → «0,00450 N/m».
 *
 *   DIBUJO DEL HILO: el punto de medida está a 380 + 40 + 300·ln(r/0,005)/ln(100) px (escala
 *   logarítmica acotada a 0,5-50 cm): r = 2 cm → 510,3 · r = 40 cm → 705,5.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * REINSPECCIÓN 25/09/2026 (invalidada por 99857a6b y 0d54c8f9) — casos NUEVOS, resueltos a mano
 * antes de abrir el navegador, con las constantes de la app: e = 1,602176634·10⁻¹⁹ C,
 * mₑ = 9,1093837·10⁻³¹ kg, m_p = 1,67262192·10⁻²⁷ kg, μ₀ = 4π·10⁻⁷ T·m/A.
 *
 *   R1 · hilo recto, I = 10 A, r = 0,05 m: B = 2·10⁻⁷·10/0,05 = 4·10⁻⁵ T (40 μT) →
 *        «4,000 × 10⁻⁵ T» y en el dibujo «B = 4,00 × 10⁻⁵ T»; espira μ₀I/(2R) = 1,256637·10⁻⁴ T.
 *        Partiendo de I = 40 A, r = 0,10 m: 2·10⁻⁷·40/0,10 = 8·10⁻⁵ T → «8,000 × 10⁻⁵ T».
 *   R2 · electrón, v = 1·10⁶ m/s, B = 0,01 T, θ = 90°:
 *        F = e·v·B = 1,602177·10⁻¹⁵ N → «1,60 × 10⁻¹⁵ N»
 *        r = mₑ·v/(e·B) = 9,1093837·10⁻²⁵/1,602176634·10⁻²¹ = 5,685630·10⁻⁴ m → «5,686 × 10⁻⁴ m»
 *        T = 2π·mₑ/(e·B) = 3,572387·10⁻⁹ s → «3,57 × 10⁻⁹ s» · f = 1/T = 2,799249·10⁸ Hz
 *        E = ½·mₑ·v²/e = 2,842815 eV = 0,002842815 keV → «0,00284 keV» · paso 0 m.
 *        Carga negativa con B saliente: ω = −qB/m apunta a +z → giro ANTIHORARIO.
 *        θ = 30°: F = 8,010883·10⁻¹⁶ N · r = 2,842815·10⁻⁴ m · v⊥ = 5·10⁵ m/s ·
 *        paso = v·cos 30°·T = 10⁶·0,8660254·3,572387·10⁻⁹ = 3,093778·10⁻³ m → «0,00309 m»
 *        (rama decimal nueva de formatCientifico, 3 cifras significativas).
 *        θ = 0°: F = 0, r = 0, v⊥ = 0 y paso = v·T = 3,572387·10⁻³ m → «0,00357 m».
 *   R3 · solenoide N = 1000, L = 0,50 m, I = 10 A: n = 2000 /m; B = μ₀·n·I = 0,02513274 T → «0,0251 T».
 *   R4 · bordes de formatCientifico: v = 0,1·10⁶ m/s con θ = 90° da v⊥ = 10⁵ m/s EXACTO →
 *        «1,00 × 10⁵ m/s»; con θ = 89°, 10⁵·sen 89° = 99.984,77 m/s → «99.984,77 m/s».
 *        I = 25 A a 0,5 cm: B = 2·10⁻⁷·25/0,005 = 10⁻³ T EXACTO → «0,00100 T»; y en el arranque
 *        de Corrientes, F/L = 2·10⁻⁷·10·10/0,02 = 10⁻³ N/m → «0,00100 N/m».
 *   R5 · mantisa que redondea a 10 (hallazgo 2166, reparado el 26/09/2026): protón,
 *        v = 5,2·10⁶ m/s, B = 1,2 T, θ = 90° → F = 9,997582·10⁻¹³ N, que con 2 decimales es
 *        «1,00 × 10⁻¹² N».
 *   R6 · inducción (hallazgo 2165, reparado el 26/09/2026): barra con B = 0,2 T, L = 0,3 m,
 *        v = 2 m/s, R = 25 Ω → ε = 0,12 V · I = 4,8·10⁻³ A · F = B·I·L = 2,88·10⁻⁴ N ·
 *        P = ε·I = 5,76·10⁻⁴ W. Alternador N = 10, B = 0,1 T, A = 0,01 m², f = 1 Hz →
 *        ε_máx = N·B·A·2πf = 0,0628319 V · ε_ef = 0,0444288 V.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * REINSPECCIÓN 04/10/2026 (invalidada por 586a4d61 y a1d72a9c: CSS del hero en móvil y tableta)
 * Casos NUEVOS, resueltos a mano antes de abrir el navegador, con las constantes de la app
 * (m_α = 6,6446573·10⁻²⁷ kg, q_α = 2e = 3,204353268·10⁻¹⁹ C):
 *
 *   S1 · alfa, v = 2·10⁶ m/s, B = 1 T, θ = 90°, B saliente: m/q = 2,073634·10⁻⁸ kg/C
 *        F = 2e·v·B = 6,408707·10⁻¹³ N → «6,41 × 10⁻¹³ N» · r = (m/q)·v/B = 0,0414727 m →
 *        «0,0415 m» · T = 2π·(m/q)/B = 1,302910·10⁻⁷ s → «1,30 × 10⁻⁷ s» · f = 7,6751·10⁶ Hz →
 *        «7,68 × 10⁶ Hz» · E = ½·m·v²/e = 82.945,4 eV → «82,95 keV» · carga + con B saliente:
 *        giro horario. Al extremo (v = 20·10⁶ m/s, B = 0,01 T): r = 41,4727 m → «41,473 m» ·
 *        T = 1,302910·10⁻⁵ s · E = ½·m·(2·10⁷)²/e = 8294,54 keV (cuatro cifras: sin punto).
 *   S2 · conductor: B = 0,25 T, I = 12 A, L = 0,75 m, θ = 30° → F = 0,25·12·0,75·0,5 = 1,125 N.
 *        Extremos: I = 100 A a 0,5 cm → B_hilo = 2·10⁻⁷·100/0,005 = 4·10⁻³ T «0,00400 T» ·
 *        B_espira = 4π·10⁻⁷·100/0,01 = 0,0125664 T «0,0126 T» · N = 3000 en L = 0,05 m →
 *        n = 60.000 /m · B_sol = 4π·10⁻⁷·60.000·100 = 7,5398 T «7,540 T» · I₂ = −100 A a 0,2 cm →
 *        F/L = 2·10⁻⁷·100·100/0,002 = 1 N/m «1,000 N/m», y se repelen.
 *   S3 · I₂ = 0 A → F/L = 0: sin fuerza no hay atracción ni repulsión (HALLAZGO: dice «se atraen»).
 *   S4 · alternador N = 100, A = 0,05 m², B = 0,5 T, f = 50 Hz → N·B·A = 2,5 Wb «2,500 Wb» ·
 *        ω = 100π = 314,159 rad/s «314,16 rad/s» · ε_máx = 2,5·314,159 = 785,398 V «785,40 V» ·
 *        ε_ef = 785,398/√2 = 555,360 V «555,36 V» · T = 1/50 = 0,02 s «0,0200 s».
 *        Barra B = 1,5 T, L = 1,2 m, v = 10 m/s, R = 4 Ω → ε = B·L·v = 18 V · I = ε/R = 4,5 A ·
 *        F = B·I·L = 8,1 N · P = ε·I = 81 W.
 *   S5 · rechazo: v = 25 se capa a 20 (máx.), B = 0 a 0,01 T (mín.: con B = 0 el radio
 *        divergiría), θ = −10° a 0° y θ = 120° a 90°. Protón a 2·10⁷ m/s en 0,01 T:
 *        r = (m_p/e)·v/B = 1,0439677·10⁻⁸·2·10⁷/0,01 = 20,879 m → «20,879 m».
 *   HERO · a 360, 390, 800, 1024 y 1280 px ningún punto del <h1> cae bajo la barra fija del logo
 *        (meskeia.com). Bajo stemum.com la píldora «Stemum › Física» acaba en x = 232 y, desde
 *        1024 px (sin el hueco de 80 px), el título centrado empieza en x = 221: HALLAZGO.
 *   LIENZO 390 px · el SVG (viewBox 760 de ancho) se pinta a 308 px: escala 0,405. Rótulos de
 *        11,5-14 px quedan en unos 4,6-5,7 px efectivos, por debajo de los 9 px legibles: HALLAZGO.
 *        `touch-action` es auto en el lienzo y sus ancestros, y arrastrar el dedo sobre él
 *        desplaza la página igual que sobre un título (105 px en los dos casos).
 */

// ── utilidades ────────────────────────────────────────────────────────────────────────

const SUPER: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};

/** «7,854 × 10⁻⁴ T» → 7.854e-4 · «0,063 T» → 0.063 */
function leerCifra(texto: string): number {
  const limpio = texto.trim();
  const m = limpio.match(/^(-?[\d.]*\d(?:,\d+)?)(?:\s*×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+))?/);
  if (!m) return NaN;
  const mantisa = Number(m[1].replace(/\./g, '').replace(',', '.'));
  if (!m[2]) return mantisa;
  const exp = Number(m[2].split('').map((c) => SUPER[c] ?? c).join(''));
  return mantisa * Math.pow(10, exp);
}

/** El valor de la fila de resultados cuyo rótulo contiene `rotulo`. */
function valorDeFila(page: Page, rotulo: string): Locator {
  return page
    .locator('[class*="resultRow"]')
    .filter({ hasText: rotulo })
    .locator('[class*="resultValue"]');
}

async function abrir(page: Page): Promise<void> {
  await page.goto('/simulador-campo-magnetico/');
  await esperarHidratacion(page, ['#velocidad', '#campo', '#anguloVB']);
}

async function irACorrientes(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Corrientes y conductores' }).click();
  await esperarHidratacion(page, ['#corriente', '#distancia']);
}

test.beforeEach(async ({ page }) => {
  await abrir(page);
});

// ── CASO 1 ────────────────────────────────────────────────────────────────────────────

test('caso 1a · hilo, espira y solenoide con I = 25 A, r = 2 cm, N = 800, L = 0,40 m', async ({ page }) => {
  await irACorrientes(page);
  await sembrarValor(page, '#corriente', 25);
  await sembrarValor(page, '#distancia', 0.02);
  await sembrarValor(page, '#vueltas', 800);
  await sembrarValor(page, '#longitudSolenoide', 0.4);

  // B_hilo = μ₀·I/(2πr) = 2·10⁻⁷·25/0,02 = 2,5·10⁻⁴ T (250 μT)
  const hilo = valorDeFila(page, 'Campo de un hilo recto');
  await expect(hilo).toHaveText('2,500 × 10⁻⁴ T');
  // Precisión 2 → ±0,5 %: un factor 2π, π o un prefijo mal puesto quedan muy fuera.
  expect(leerCifra(await hilo.innerText()) / 2.5e-4).toBeCloseTo(1, 2);

  // B_espira = μ₀·I/(2R) = 4π·10⁻⁷·25/0,04 = 7,853982·10⁻⁴ T
  const espira = valorDeFila(page, 'Campo en el centro de una espira');
  await expect(espira).toHaveText('7,854 × 10⁻⁴ T');
  expect(leerCifra(await espira.innerText()) / 7.853982e-4).toBeCloseTo(1, 2);

  // n = N/L = 800/0,40 = 2000 /m (es-ES no agrupa las cifras de cuatro dígitos)
  await expect(valorDeFila(page, 'Espiras por metro')).toHaveText('2000 /m');
  // B_sol = μ₀·n·I = 4π·10⁻⁷·2000·25 = 0,0628319 T → 3 cifras significativas: «0,0628 T»
  const sol = valorDeFila(page, 'Campo del solenoide');
  await expect(sol).toHaveText('0,0628 T');
  expect(leerCifra(await sol.innerText()) / 0.0628319).toBeCloseTo(1, 2);

  // La etiqueta del dibujo repite el campo del hilo
  await expect(page.locator('svg text').filter({ hasText: /^B = / })).toHaveText('B = 2,50 × 10⁻⁴ T');
  await expect(page.locator('svg text').filter({ hasText: 'del hilo' })).toHaveText('a 2,0 cm del hilo');
});

test('caso 1b · Lorentz: protón a 3·10⁶ m/s en 0,2 T con θ = 90°', async ({ page }) => {
  await sembrarValor(page, '#velocidad', 3);
  await sembrarValor(page, '#campo', 0.2);

  // F = e·v·B = 1,602176634·10⁻¹⁹·3·10⁶·0,2 = 9,613060·10⁻¹⁴ N
  const f = valorDeFila(page, 'Fuerza F = q·v·B');
  await expect(f).toHaveText('9,61 × 10⁻¹⁴ N');
  expect(leerCifra(await f.innerText()) / 9.61306e-14).toBeCloseTo(1, 2);

  // r = m·v/(e·B) = 1,67262192·10⁻²⁷·3·10⁶/(3,204353·10⁻²⁰) = 0,156595 m
  const r = valorDeFila(page, 'Radio r =');
  await expect(r).toHaveText('0,157 m');
  expect(leerCifra(await r.innerText()) / 0.156595).toBeCloseTo(1, 2);

  // T = 2π·m/(e·B) = 3,279724·10⁻⁷ s (no depende de v)
  const periodo = valorDeFila(page, 'Periodo T =');
  await expect(periodo).toHaveText('3,28 × 10⁻⁷ s');
  expect(leerCifra(await periodo.innerText()) / 3.279724e-7).toBeCloseTo(1, 2);
});

// ── CASO 2 ────────────────────────────────────────────────────────────────────────────

test('caso 2a · θ = 0°: la fuerza, el radio y v⊥ se anulan', async ({ page }) => {
  await sembrarValor(page, '#anguloVB', 0);
  // sen 0 = 0 → F = 0, r = m·v·sen θ/(qB) = 0, v⊥ = 0
  await expect(valorDeFila(page, 'Fuerza F = q·v·B')).toHaveText('0 N');
  await expect(valorDeFila(page, 'Radio r =')).toHaveText('0 m');
  await expect(valorDeFila(page, 'Componente v perpendicular')).toHaveText('0 m/s');
  // El periodo no depende del ángulo: 2π·m/(e·0,5) = 1,311889·10⁻⁷ s
  await expect(valorDeFila(page, 'Periodo T =')).toHaveText('1,31 × 10⁻⁷ s');
});

test('caso 2c · el sentido de giro sigue a q·v×B (invertir B o la carga lo invierte)', async ({ page }) => {
  const pista = page.locator('[class*="canvasHint"]');
  // Protón con B saliente (+z): ω = −qB/m apunta a −z → horario visto desde la pantalla
  await expect(pista).toContainText('Giro horario');
  await page.getByRole('button', { name: /B sale de la pantalla/ }).click();
  // B entrante → se invierte
  await expect(pista).toContainText('Giro antihorario');
  await page.getByRole('button', { name: /Electrón/ }).click();
  // Carga negativa con B entrante → vuelve a horario
  await expect(pista).toContainText('Giro horario');
});

test('caso 2d · segundo hilo con la corriente invertida: misma fuerza, pero se repelen', async ({ page }) => {
  await irACorrientes(page);
  await expect(valorDeFila(page, 'Los hilos')).toHaveText('se atraen');
  await sembrarValor(page, '#corriente2', -25);
  await sembrarValor(page, '#separacion', 0.1);
  // F/L = μ₀·I₁·|I₂|/(2πd) = 2·10⁻⁷·10·25/0,10 = 5·10⁻⁴ N/m
  const f = valorDeFila(page, 'Fuerza entre hilos');
  await expect(f).toHaveText('5,000 × 10⁻⁴ N/m');
  expect(leerCifra(await f.innerText()) / 5e-4).toBeCloseTo(1, 2);
  await expect(valorDeFila(page, 'Los hilos')).toHaveText('se repelen');
});

test('caso 2b · con θ = 90° la trayectoria es circular: el paso de la hélice es 0', async ({ page }) => {
  // Hallazgo 1345 (reparado 24/09/2026): la app calculaba v·cos θ·T con Math.cos(π/2) =
  // 6,12·10⁻¹⁷ y en el arranque mostraba «4,017 × 10⁻¹⁷ m». Con 45° el paso sí existe:
  // 5·10⁶·cos 45°·1,311889·10⁻⁷ = 0,463826 m → «0,464 m». Luego se vuelve a 90°.
  await sembrarValor(page, '#anguloVB', 45);
  await expect(valorDeFila(page, 'Paso de la hélice')).toHaveText('0,464 m');
  await sembrarValor(page, '#anguloVB', 90);
  await expect(valorDeFila(page, 'Paso de la hélice')).toHaveText('0 m');
});

test('caso 2a-dibujo · con F = 0 el lienzo no pinta un vector fuerza', async ({ page }) => {
  // Hallazgo 1346 (reparado 24/09/2026): con θ = 0° la tabla decía «0 N» pero el SVG seguía
  // dibujando la flecha F con 48 px de largo fijo. Ahora el largo es 48 px·F/F_ref (acotado).
  const flecha = page.locator('[class*="vFuerza"] line');
  const largo = () =>
    flecha.evaluate((l) => {
      const n = (a: string) => Number(l.getAttribute(a));
      return Math.hypot(n('x2') - n('x1'), n('y2') - n('y1'));
    });
  // θ = 30° → sen 30° = 0,5 → F = 2,003·10⁻¹³ N → 24 px
  await sembrarValor(page, '#anguloVB', 30);
  await expect(valorDeFila(page, 'Fuerza F = q·v·B')).toHaveText('2,00 × 10⁻¹³ N');
  expect(await largo()).toBeCloseTo(24, 1);
  // θ = 0° → F = 0 → sin flecha
  await sembrarValor(page, '#anguloVB', 0);
  await expect(valorDeFila(page, 'Fuerza F = q·v·B')).toHaveText('0 N');
  await expect(page.locator('[class*="vFuerza"]')).toHaveCount(0);
});

test('caso 2a-dibujo-v · el lienzo dibuja v⊥ = v·sen θ, y con θ = 0° no hay flecha que girar', async ({ page }) => {
  // Sospecha del Inspector (24/09/2026), confirmada en el navegador antes de reparar: con
  // θ = 0° la trayectoria desaparecía (r = 0) pero la flecha v seguía midiendo 62 px y su
  // extremo pasaba de (339, 257) a (318, 212) en medio segundo: giraba en el plano ⊥ B sin v⊥.
  // Mismo patrón que el hallazgo 1346 con F. El lienzo es el plano perpendicular a B:
  //   θ = 90° → sen 90° = 1   → 62 px (v⊥ = v)
  //   θ = 30° → sen 30° = 0,5 → 31 px
  //   θ = 0°  → sen 0° = 0    → sin flecha (la partícula avanza a lo largo de B)
  const flecha = page.locator('[class*="vVelocidad"] line');
  const largo = () =>
    flecha.evaluate((l) => {
      const n = (a: string) => Number(l.getAttribute(a));
      return Math.hypot(n('x2') - n('x1'), n('y2') - n('y1'));
    });
  await sembrarValor(page, '#anguloVB', 30);
  await expect.poll(largo).toBeCloseTo(31, 1);
  await expect(page.locator('[class*="vVelocidad"] text')).toHaveText('v⊥');
  await sembrarValor(page, '#anguloVB', 90);
  await expect.poll(largo).toBeCloseTo(62, 1);
  await sembrarValor(page, '#anguloVB', 0);
  await expect(valorDeFila(page, 'Componente v perpendicular')).toHaveText('0 m/s');
  await expect(page.locator('[class*="vVelocidad"]')).toHaveCount(0);
});

// ── CASO 3 ────────────────────────────────────────────────────────────────────────────

test('caso 3a · I negativa y r = 0 se capan al mínimo y el campo sigue finito', async ({ page }) => {
  await irACorrientes(page);
  // −5 A no es un valor del control: el range lo satura a su mínimo, 0,1 A
  expect(await sembrarValorAcotado(page, '#corriente', -5)).toBe('0.1');
  // r = 0 haría divergir B: el range lo satura a 0,005 m
  expect(await sembrarValorAcotado(page, '#distancia', 0)).toBe('0.005');
  // B_hilo = 2·10⁻⁷·0,1/0,005 = 4·10⁻⁶ T · B_espira = 4π·10⁻⁷·0,1/0,01 = 1,256637·10⁻⁵ T
  await expect(valorDeFila(page, 'Campo de un hilo recto')).toHaveText('4,000 × 10⁻⁶ T');
  await expect(valorDeFila(page, 'Campo en el centro de una espira')).toHaveText('1,257 × 10⁻⁵ T');
  await expect(page.locator('[class*="resultBlock"]')).not.toContainText(/NaN|∞|No definido/);
});

test('caso 3b · 1,2 mT no puede presentarse como «0,001 T» ni el dibujo como «0,00 T»', async ({ page }) => {
  // Hallazgo 1344 (reparado 24/09/2026): formatCientifico usaba decimales FIJOS en
  // [10⁻³, 10⁵) y en la franja del militesla se comía las cifras significativas. I = 30 A,
  // r = 0,5 cm: B = 2·10⁻⁷·30/0,005 = 1,2·10⁻³ T; la tabla daba «0,001 T» (−17 %) y la
  // etiqueta del lienzo «B = 0,00 T». Ahora se garantizan 3 cifras significativas.
  await irACorrientes(page);
  await sembrarValor(page, '#corriente', 30);
  await sembrarValor(page, '#distancia', 0.005);
  const hilo = valorDeFila(page, 'Campo de un hilo recto');
  await expect(hilo).toHaveText('0,00120 T');
  expect(leerCifra(await hilo.innerText()) / 1.2e-3).toBeCloseTo(1, 2);
  await expect(page.locator('svg text').filter({ hasText: /^B = / })).toHaveText('B = 0,00120 T');
  // I₁ = I₂ = 30 A a 4 cm: F/L = 2·10⁻⁷·30·30/0,04 = 4,5·10⁻³ N/m
  await sembrarValor(page, '#corriente2', 30);
  await sembrarValor(page, '#separacion', 0.04);
  await expect(valorDeFila(page, 'Fuerza entre hilos')).toHaveText('0,00450 N/m');
});

test('caso 3b-energía · electrón a 2·10⁶ m/s: 11,37 eV no puede salir «0,01 keV»', async ({ page }) => {
  // E = ½·m_e·v² / e = ½·9,1093837·10⁻³¹·(2·10⁶)² / 1,602176634·10⁻¹⁹ = 11,3712 eV
  // = 0,0113712 keV → 3 cifras significativas: «0,0114 keV» (antes «0,01 keV»: hallazgo 1344)
  await page.getByRole('button', { name: /Electrón/ }).click();
  await sembrarValor(page, '#velocidad', 2);
  const energia = valorDeFila(page, 'Energía cinética');
  await expect(energia).toHaveText('0,0114 keV');
  expect(leerCifra(await energia.innerText()) / 0.0113712).toBeCloseTo(1, 2);
});

// ── Dibujo y accesibilidad ────────────────────────────────────────────────────────────

test('dibujo · el punto de medida del hilo se aleja cuando crece la distancia', async ({ page }) => {
  // Hallazgo 1347 (reparado 24/09/2026): el punto de medida estaba fijo en cx = 490 sea cual
  // sea r. Ahora cx = 420 + 300·ln(r/0,005)/ln(100): r = 2 cm → 510,3 · r = 40 cm → 705,5.
  await irACorrientes(page);
  await sembrarValor(page, '#distancia', 0.02);
  await expect(page.locator('svg text').filter({ hasText: 'del hilo' })).toHaveText('a 2,0 cm del hilo');
  const cerca = Number(await page.locator('[class*="puntoMedida"]').getAttribute('cx'));
  expect(cerca).toBeCloseTo(510.3, 0);
  await sembrarValor(page, '#distancia', 0.4);
  await expect(page.locator('svg text').filter({ hasText: 'del hilo' })).toHaveText('a 40,0 cm del hilo');
  const lejos = Number(await page.locator('[class*="puntoMedida"]').getAttribute('cx'));
  expect(lejos).toBeCloseTo(705.5, 0);
  // Sin salirse del lienzo (760 px)
  expect(lejos).toBeLessThan(760);
});

test('a11y · el botón «Pausar» no se anuncia como pulsado mientras la animación corre', async ({ page }) => {
  // Hallazgo 1348 (reparado 24/09/2026): el botón cambia de rótulo (Pausar/Reanudar) y además
  // llevaba aria-pressed={reproduciendo}: un lector decía «Pausar, pulsado» con la animación en
  // marcha. Un botón de acción con rótulo cambiante no lleva aria-pressed.
  const boton = page.getByRole('button', { name: 'Pausar' });
  await expect(boton).toBeVisible();
  await expect(boton).not.toHaveAttribute('aria-pressed');
  await boton.click();
  const reanudar = page.getByRole('button', { name: 'Reanudar' });
  await expect(reanudar).toBeVisible();
  await expect(reanudar).not.toHaveAttribute('aria-pressed');
});

// ── REINSPECCIÓN 25/09/2026 ───────────────────────────────────────────────────────────

test('R1 · hilo recto: 40 μT con I = 10 A a 5 cm, y B ∝ I/r', async ({ page }) => {
  await irACorrientes(page);
  const hilo = valorDeFila(page, 'Campo de un hilo recto');
  // Se parte de otro estado: I = 40 A, r = 0,10 m → 2·10⁻⁷·40/0,10 = 8·10⁻⁵ T
  await sembrarValor(page, '#corriente', 40);
  await sembrarValor(page, '#distancia', 0.1);
  await expect(hilo).toHaveText('8,000 × 10⁻⁵ T');
  // I = 10 A, r = 0,05 m → B = μ₀I/(2πr) = 2·10⁻⁷·10/0,05 = 4·10⁻⁵ T (40 μT)
  await sembrarValor(page, '#corriente', 10);
  await sembrarValor(page, '#distancia', 0.05);
  await expect(hilo).toHaveText('4,000 × 10⁻⁵ T');
  // ±0,5 %: un factor 2π o un prefijo mal puesto quedan muy fuera
  expect(leerCifra(await hilo.innerText()) / 4e-5).toBeCloseTo(1, 2);
  await expect(page.locator('svg text').filter({ hasText: /^B = / })).toHaveText('B = 4,00 × 10⁻⁵ T');
  // Espira μ₀I/(2R) = 4π·10⁻⁷·10/0,10 = 1,256637·10⁻⁴ T
  await expect(valorDeFila(page, 'Campo en el centro de una espira')).toHaveText('1,257 × 10⁻⁴ T');
  await expect(page.locator('[class*="resultBlock"]')).not.toContainText(/NaN|∞|Infinity|No definido/);
});

test('R2 · Lorentz: electrón a 10⁶ m/s en 0,01 T con θ = 90°, 30° y 0°', async ({ page }) => {
  await page.getByRole('button', { name: /Electrón/ }).click();
  await sembrarValor(page, '#velocidad', 1);
  await sembrarValor(page, '#campo', 0.01);
  const f = valorDeFila(page, 'Fuerza F = q·v·B');
  const r = valorDeFila(page, 'Radio r =');
  const periodo = valorDeFila(page, 'Periodo T =');
  const paso = valorDeFila(page, 'Paso de la hélice');
  const vPerp = valorDeFila(page, 'Componente v perpendicular');

  // θ = 90° (arranque). F = e·v·B = 1,602177·10⁻¹⁵ N
  await expect(f).toHaveText('1,60 × 10⁻¹⁵ N');
  // r = mₑ·v/(e·B) = 5,685630·10⁻⁴ m (precisión 3: el radio lleva 4 cifras)
  await expect(r).toHaveText('5,686 × 10⁻⁴ m');
  expect(leerCifra(await r.innerText()) / 5.68563e-4).toBeCloseTo(1, 3);
  // T = 2π·mₑ/(e·B) = 3,572387·10⁻⁹ s · f = 2,799249·10⁸ Hz
  await expect(periodo).toHaveText('3,57 × 10⁻⁹ s');
  await expect(valorDeFila(page, 'Frecuencia de ciclotrón')).toHaveText('2,80 × 10⁸ Hz');
  await expect(paso).toHaveText('0 m');
  // E = ½·mₑ·v²/e = 2,842815 eV = 0,002842815 keV → 3 cifras significativas
  await expect(valorDeFila(page, 'Energía cinética')).toHaveText('0,00284 keV');
  // Carga negativa con B saliente: ω = −qB/m apunta a +z → antihorario
  await expect(page.locator('[class*="canvasHint"]')).toContainText('Giro antihorario');

  // θ = 30°: sen = 0,5 · cos = 0,8660254
  await sembrarValor(page, '#anguloVB', 30);
  await expect(f).toHaveText('8,01 × 10⁻¹⁶ N');
  await expect(r).toHaveText('2,843 × 10⁻⁴ m');
  await expect(vPerp).toHaveText('5,00 × 10⁵ m/s');
  await expect(periodo).toHaveText('3,57 × 10⁻⁹ s');
  // paso = v·cos θ·T = 10⁶·0,8660254·3,572387·10⁻⁹ = 3,093778·10⁻³ m (rama decimal nueva)
  await expect(paso).toHaveText('0,00309 m');
  expect(leerCifra(await paso.innerText()) / 3.093778e-3).toBeCloseTo(1, 2);

  // θ = 0°: F, r y v⊥ nulos; el «paso» es v·T = 3,572387·10⁻³ m
  await sembrarValor(page, '#anguloVB', 0);
  await expect(f).toHaveText('0 N');
  await expect(r).toHaveText('0 m');
  await expect(vPerp).toHaveText('0 m/s');
  await expect(paso).toHaveText('0,00357 m');
});

test('R3 · solenoide N = 1000, L = 0,50 m, I = 10 A: B = μ₀·n·I = 0,0251 T', async ({ page }) => {
  await irACorrientes(page);
  await sembrarValor(page, '#vueltas', 1000);
  await sembrarValor(page, '#longitudSolenoide', 0.5);
  // n = 1000/0,50 = 2000 /m · B = 4π·10⁻⁷·2000·10 = 0,02513274 T
  await expect(valorDeFila(page, 'Espiras por metro')).toHaveText('2000 /m');
  const sol = valorDeFila(page, 'Campo del solenoide');
  await expect(sol).toHaveText('0,0251 T');
  expect(leerCifra(await sol.innerText()) / 0.02513274).toBeCloseTo(1, 2);
});

test('R4 · bordes de formatCientifico: 10⁵ exacto, justo por debajo y 10⁻³ exacto', async ({ page }) => {
  const vPerp = valorDeFila(page, 'Componente v perpendicular');
  // v = 0,1·10⁶ m/s con θ = 90° (arranque) → v⊥ = 10⁵ m/s EXACTO: ya es notación científica
  await sembrarValor(page, '#velocidad', 0.1);
  await expect(vPerp).toHaveText('1,00 × 10⁵ m/s');
  // θ = 89° → 10⁵·sen 89° = 99.984,77 m/s: rama decimal, con el punto de miles
  await sembrarValor(page, '#anguloVB', 89);
  await expect(vPerp).toHaveText('99.984,77 m/s');

  await irACorrientes(page);
  // Arranque de Corrientes: F/L = 2·10⁻⁷·10·10/0,02 = 10⁻³ N/m EXACTO
  await expect(valorDeFila(page, 'Fuerza entre hilos')).toHaveText('0,00100 N/m');
  // I = 25 A a 0,5 cm: B = 2·10⁻⁷·25/0,005 = 10⁻³ T EXACTO, en la tabla y en el dibujo
  await sembrarValor(page, '#corriente', 25);
  await sembrarValor(page, '#distancia', 0.005);
  await expect(valorDeFila(page, 'Campo de un hilo recto')).toHaveText('0,00100 T');
  await expect(page.locator('svg text').filter({ hasText: /^B = / })).toHaveText('B = 0,00100 T');
});

test('R5 · la mantisa de la notación científica no puede redondear a «10,00»', async ({ page }) => {
  // HALLAZGO 2166, REPARADO el 26/09/2026 (el exponente se fija tras redondear la mantisa).
  // Era: formatCientifico fijaba el exponente con Math.floor(log10) ANTES de redondear la
  // mantisa, y una mantisa ≥ 9,995 salía «10,00». La cifra valía lo mismo; la notación dejaba
  // de estar normalizada.
  const f = valorDeFila(page, 'Fuerza F = q·v·B');
  // Protón, v = 5,2·10⁶ m/s, B = 1,2 T, θ = 90° (arranque): F = e·v·B = 9,997582·10⁻¹³ N
  await sembrarValor(page, '#velocidad', 5.2);
  await sembrarValor(page, '#campo', 1.2);
  // El valor numérico es correcto (±0,5 %): lo que fallaba era cómo se escribía
  await expect.poll(async () => leerCifra(await f.innerText()) / 9.997582e-13).toBeCloseTo(1, 2);
  await expect(f).toHaveText('1,00 × 10⁻¹² N'); // antes de reparar, «10,00 × 10⁻¹³ N»
  // v = 1·10⁶ m/s, θ = 89° → v⊥ = 999.847,7 m/s → «1,00 × 10⁶ m/s» (antes «10,00 × 10⁵ m/s»)
  await sembrarValor(page, '#velocidad', 1);
  await sembrarValor(page, '#anguloVB', 89);
  await expect(valorDeFila(page, 'Componente v perpendicular')).toHaveText('1,00 × 10⁶ m/s');
  // Borde 10⁻³: v = 0,5·10⁶ m/s, B = 2,61 T, θ = 30° → r = m_p·v·sen 30°/(e·B) = 9,99970·10⁻⁴ m
  // → «0,00100 m» o «1,000 × 10⁻³ m» (antes «10,000 × 10⁻⁴ m»)
  await sembrarValor(page, '#velocidad', 0.5);
  await sembrarValor(page, '#campo', 2.61);
  await sembrarValor(page, '#anguloVB', 30);
  await expect(valorDeFila(page, 'Radio r =')).toHaveText(/^(0,00100|1,000 × 10⁻³) m$/);
});

test('R6 · inducción: fem, corriente, frenado y potencia conservan sus cifras significativas', async ({ page }) => {
  // HALLAZGO 2165, REPARADO el 26/09/2026 (Inducción pasa por formatCientifico). Era: la
  // pestaña Inducción presentaba con formatNumber y decimales FIJOS, la misma clase de defecto
  // que el 1344, en una ruta que no pasaba por formatCientifico.
  await page.getByRole('button', { name: 'Inducción', exact: true }).click();
  await page.getByRole('button', { name: 'Barra sobre raíles' }).click();
  await esperarHidratacion(page, ['#campoBarra', '#longitudBarra', '#velocidadBarra', '#resistencia']);
  // Barra: B = 0,2 T, L = 0,3 m, v = 2 m/s, R = 25 Ω
  await sembrarValor(page, '#campoBarra', 0.2);
  await sembrarValor(page, '#longitudBarra', 0.3);
  await sembrarValor(page, '#velocidadBarra', 2);
  await sembrarValor(page, '#resistencia', 25);
  // ε = B·L·v = 0,12 V (este ya salía bien: «0,120 V»)
  await expect(valorDeFila(page, 'fem inducida')).toHaveText('0,120 V');
  // I = ε/R = 4,8·10⁻³ A · F = B·I·L = 2,88·10⁻⁴ N · P = ε·I = 5,76·10⁻⁴ W.
  // Antes de reparar, «0,005 A» (+4 %), «0,0003 N» (+4 %) y «0,001 W» (+74 %). Precisión 2 (±0,5 %).
  expect(leerCifra(await valorDeFila(page, 'Potencia disipada').innerText()) / 5.76e-4).toBeCloseTo(1, 2);
  expect(leerCifra(await valorDeFila(page, 'Corriente inducida').innerText()) / 4.8e-3).toBeCloseTo(1, 2);
  expect(leerCifra(await valorDeFila(page, 'Fuerza de frenado').innerText()) / 2.88e-4).toBeCloseTo(1, 2);
  // Por debajo de 10⁻⁴ formatNumber escribía «≈0»: B = 0,05 T, L = 0,2 m, v = 2 m/s, R = 10 Ω →
  // ε = 0,02 V · I = 2·10⁻³ A · F = 0,05·0,002·0,2 = 2·10⁻⁵ N · P = 0,02·0,002 = 4·10⁻⁵ W
  await sembrarValor(page, '#campoBarra', 0.05);
  await sembrarValor(page, '#longitudBarra', 0.2);
  await sembrarValor(page, '#resistencia', 10);
  await expect(valorDeFila(page, 'Fuerza de frenado')).toHaveText('2,000 × 10⁻⁵ N');
  await expect(valorDeFila(page, 'Potencia disipada')).toHaveText('4,000 × 10⁻⁵ W');

  // Alternador: N = 10, B = 0,1 T, A = 0,01 m², f = 1 Hz
  await page.getByRole('button', { name: 'Espira giratoria' }).click();
  await esperarHidratacion(page, ['#espiras', '#area', '#campoInduccion', '#frecuencia']);
  await sembrarValor(page, '#espiras', 10);
  await sembrarValor(page, '#area', 0.01);
  await sembrarValor(page, '#campoInduccion', 0.1);
  await sembrarValor(page, '#frecuencia', 1);
  // ε_máx = N·B·A·2πf = 0,0628319 V · ε_ef = 0,0444288 V (antes «0,1 V» y «0,0 V»)
  expect(leerCifra(await valorDeFila(page, 'fem máxima').innerText()) / 0.0628319).toBeCloseTo(1, 2);
  expect(leerCifra(await valorDeFila(page, 'fem eficaz').innerText()) / 0.0444288).toBeCloseTo(1, 2);
});

test('R7 · la cota del dibujo del hilo no tacha el rótulo de la distancia', async ({ page }) => {
  // HALLAZGO 2167, REPARADO el 26/09/2026 (con el rótulo a la izquierda, la distancia va bajo la
  // cota). Era, nacido con la reparación del 1347: la cota
  // punteada va a y = 210 desde el hilo hasta el punto de medida, y cuando el rótulo pasa a la
  // izquierda del punto (r ≳ 4,3 cm, arranque incluido) su caja [201; 216] queda tachada.
  await irACorrientes(page);
  const rotulo = page.locator('svg text').filter({ hasText: 'del hilo' });
  const cotaTachaRotulo = () =>
    page.locator('svg[aria-label^="Hilo"]').evaluate((svg) => {
      const cota = svg.querySelector('[class*="cotaMedida"]');
      const texto = Array.from(svg.querySelectorAll('text')).find((t) =>
        (t.textContent ?? '').includes('del hilo'),
      );
      if (!cota || !texto) return null;
      const caja = texto.getBBox();
      const n = (a: string) => Number(cota.getAttribute(a));
      const desde = Math.min(n('x1'), n('x2'));
      const hasta = Math.max(n('x1'), n('x2'));
      const solapaX = caja.x < hasta && caja.x + caja.width > desde;
      const solapaY = n('y1') > caja.y && n('y1') < caja.y + caja.height;
      return solapaX && solapaY;
    });
  // Control: a 2 cm el rótulo va a la derecha del punto y la cota no lo toca
  await sembrarValor(page, '#distancia', 0.02);
  await expect(rotulo).toHaveText('a 2,0 cm del hilo');
  expect(await cotaTachaRotulo()).toBe(false);
  // 5 cm (el arranque): el rótulo pasa a la izquierda, encima de la cota
  await sembrarValor(page, '#distancia', 0.05);
  await expect(rotulo).toHaveText('a 5,0 cm del hilo');
  expect(await cotaTachaRotulo()).toBe(false);
});

test('R8 · con θ = 0° el texto no anuncia giro ni trayectoria circular', async ({ page }) => {
  // HALLAZGO 2168, REPARADO el 26/09/2026 (pista y aria-label según v⊥). Era: con θ = 0° la tabla da F = 0 y v⊥ = 0 y el
  // lienzo ya no dibuja circunferencia, pero la pista dice «Giro horario/antihorario · el tamaño
  // del círculo sigue al radio real» y el aria-label del SVG, «Trayectoria circular de …»
  // (page.tsx:559 y 651-656). La partícula avanza en línea recta a lo largo de B.
  const pista = page.locator('[class*="canvasHint"]');
  const lienzo = page.locator('[class*="canvasSvg"]').first();
  // Control a 90° (arranque): protón con B saliente, circunferencia en sentido horario
  await expect(pista).toContainText('Giro horario');
  await expect(lienzo).toHaveAttribute('aria-label', /circular/);
  await sembrarValor(page, '#anguloVB', 0);
  await expect(valorDeFila(page, 'Componente v perpendicular')).toHaveText('0 m/s');
  await expect(page.locator('[class*="trayectoria"]')).toHaveCount(0);
  await expect(pista).not.toContainText(/Giro (horario|antihorario)/);
  await expect(lienzo).not.toHaveAttribute('aria-label', /circular/);
});

test('a11y · 1348 también en Inducción: «Pausar» sin aria-pressed', async ({ page }) => {
  // El hallazgo 1348 citaba las pestañas Lorentz e Inducción; el test de arriba cubre Lorentz.
  await page.getByRole('button', { name: 'Inducción', exact: true }).click();
  await esperarHidratacion(page, ['#espiras']);
  const boton = page.getByRole('button', { name: 'Pausar' });
  await expect(boton).toBeVisible();
  await expect(boton).not.toHaveAttribute('aria-pressed');
  await boton.click();
  await expect(page.getByRole('button', { name: 'Reanudar' })).not.toHaveAttribute('aria-pressed');
});

// ── REINSPECCIÓN 04/10/2026 ───────────────────────────────────────────────────────────

test('S1 · Lorentz: partícula alfa a 2·10⁶ m/s en 1 T, y al extremo de los deslizadores', async ({ page }) => {
  const alfa = page.getByRole('button', { name: /Partícula alfa/ });
  await alfa.click();
  await expect(alfa).toHaveAttribute('aria-pressed', 'true');
  await sembrarValor(page, '#velocidad', 2);
  await sembrarValor(page, '#campo', 1);
  // F = 2e·v·B = 6,408707·10⁻¹³ N (con la carga de un protón saldría la mitad, 3,20·10⁻¹³ N)
  const f = valorDeFila(page, 'Fuerza F = q·v·B');
  await expect(f).toHaveText('6,41 × 10⁻¹³ N');
  expect(leerCifra(await f.innerText()) / 6.408707e-13).toBeCloseTo(1, 2);
  // r = (m/q)·v/B = 2,073634·10⁻⁸·2·10⁶/1 = 0,0414727 m
  await expect(valorDeFila(page, 'Radio r =')).toHaveText('0,0415 m');
  // T = 2π·(m/q)/B = 1,302910·10⁻⁷ s · f = 1/T = 7,6751·10⁶ Hz
  await expect(valorDeFila(page, 'Periodo T =')).toHaveText('1,30 × 10⁻⁷ s');
  await expect(valorDeFila(page, 'Frecuencia de ciclotrón')).toHaveText('7,68 × 10⁶ Hz');
  await expect(valorDeFila(page, 'Paso de la hélice')).toHaveText('0 m');
  // E = ½·m_α·v²/e = ½·6,6446573·10⁻²⁷·4·10¹²/1,602176634·10⁻¹⁹ = 82.945,4 eV
  await expect(valorDeFila(page, 'Energía cinética')).toHaveText('82,95 keV');
  // Carga positiva con B saliente: horario, como el protón
  await expect(page.locator('[class*="canvasHint"]')).toContainText('Giro horario');
  // Extremo: v = 20·10⁶ m/s, B = 0,01 T → r = 41,4727 m · T = 1,302910·10⁻⁵ s ·
  // E = ½·m_α·(2·10⁷)²/e = 8294,54 keV (cuatro cifras enteras: es-ES no agrupa)
  await sembrarValor(page, '#velocidad', 20);
  await sembrarValor(page, '#campo', 0.01);
  await expect(valorDeFila(page, 'Radio r =')).toHaveText('41,473 m');
  await expect(valorDeFila(page, 'Periodo T =')).toHaveText('1,30 × 10⁻⁵ s');
  await expect(valorDeFila(page, 'Energía cinética')).toHaveText('8294,54 keV');
});

test('S2 · fuerza sobre el conductor con θ = 30° y los extremos de hilo, espira, solenoide e hilos', async ({ page }) => {
  await irACorrientes(page);
  await sembrarValor(page, '#corriente', 12);
  await sembrarValor(page, '#longitudConductor', 0.75);
  await sembrarValor(page, '#campoExterno', 0.25);
  await sembrarValor(page, '#anguloIB', 30);
  // F = B·I·L·sen θ = 0,25·12·0,75·0,5 = 1,125 N (sin el sen θ saldría 2,250 N)
  await expect(valorDeFila(page, 'Fuerza sobre el conductor')).toHaveText('1,125 N');
  // B_hilo = 2·10⁻⁷·12/0,05 = 4,8·10⁻⁵ T
  await expect(valorDeFila(page, 'Campo de un hilo recto')).toHaveText('4,800 × 10⁻⁵ T');

  // Extremos de los deslizadores
  await sembrarValor(page, '#corriente', 100);
  await sembrarValor(page, '#distancia', 0.005);
  await sembrarValor(page, '#vueltas', 3000);
  await sembrarValor(page, '#longitudSolenoide', 0.05);
  // B_hilo = 2·10⁻⁷·100/0,005 = 4·10⁻³ T · B_espira = 4π·10⁻⁷·100/0,01 = 0,0125664 T
  await expect(valorDeFila(page, 'Campo de un hilo recto')).toHaveText('0,00400 T');
  await expect(valorDeFila(page, 'Campo en el centro de una espira')).toHaveText('0,0126 T');
  // n = 3000/0,05 = 60.000 /m · B_sol = 4π·10⁻⁷·60.000·100 = 7,539822 T
  await expect(valorDeFila(page, 'Espiras por metro')).toHaveText('60.000 /m');
  const sol = valorDeFila(page, 'Campo del solenoide');
  await expect(sol).toHaveText('7,540 T');
  expect(leerCifra(await sol.innerText()) / 7.539822).toBeCloseTo(1, 2);
  // I₂ = −100 A a 0,2 cm: F/L = 2·10⁻⁷·100·100/0,002 = 1 N/m, corrientes opuestas
  await sembrarValor(page, '#corriente2', -100);
  await sembrarValor(page, '#separacion', 0.002);
  await expect(valorDeFila(page, 'Fuerza entre hilos')).toHaveText('1,000 N/m');
  await expect(valorDeFila(page, 'Los hilos')).toHaveText('se repelen');
});

test('S4 · inducción: alternador a 50 Hz y barra de 1,2 m a 10 m/s', async ({ page }) => {
  await page.getByRole('button', { name: 'Inducción', exact: true }).click();
  await esperarHidratacion(page, ['#espiras', '#area', '#campoInduccion', '#frecuencia']);
  await sembrarValor(page, '#espiras', 100);
  await sembrarValor(page, '#area', 0.05);
  await sembrarValor(page, '#campoInduccion', 0.5);
  // La frecuencia arranca en 50 Hz: se pasa por 51 para que sembrar 50 pruebe algo
  await sembrarValor(page, '#frecuencia', 51);
  await sembrarValor(page, '#frecuencia', 50);
  // N·B·A = 100·0,5·0,05 = 2,5 Wb · ω = 2π·50 = 314,159 rad/s
  await expect(valorDeFila(page, 'Flujo máximo')).toHaveText('2,500 Wb');
  await expect(valorDeFila(page, 'Velocidad angular')).toHaveText('314,16 rad/s');
  // ε_máx = N·B·A·ω = 785,398 V (sin el 2π saldría 125 V) · ε_ef = ε_máx/√2 = 555,360 V
  const femMax = valorDeFila(page, 'fem máxima');
  await expect(femMax).toHaveText('785,40 V');
  expect(leerCifra(await femMax.innerText()) / 785.398).toBeCloseTo(1, 3);
  await expect(valorDeFila(page, 'fem eficaz')).toHaveText('555,36 V');
  // T = 1/50 = 0,02 s
  await expect(valorDeFila(page, 'Periodo')).toHaveText('0,0200 s');

  // Barra: B = 1,5 T, L = 1,2 m, v = 10 m/s, R = 4 Ω
  await page.getByRole('button', { name: 'Barra sobre raíles' }).click();
  await esperarHidratacion(page, ['#campoBarra', '#longitudBarra', '#velocidadBarra', '#resistencia']);
  await sembrarValor(page, '#campoBarra', 1.5);
  await sembrarValor(page, '#longitudBarra', 1.2);
  await sembrarValor(page, '#velocidadBarra', 10);
  await sembrarValor(page, '#resistencia', 4);
  // ε = B·L·v = 18 V · I = ε/R = 4,5 A · F = B·I·L = 8,1 N · P = ε·I = 81 W (= I²R)
  await expect(valorDeFila(page, 'fem inducida')).toHaveText('18,000 V');
  await expect(valorDeFila(page, 'Corriente inducida')).toHaveText('4,500 A');
  await expect(valorDeFila(page, 'Fuerza de frenado')).toHaveText('8,100 N');
  await expect(valorDeFila(page, 'Potencia disipada')).toHaveText('81,000 W');
});

test('S5 · fuera de rango: v, B y θ se capan a su recorrido y el cálculo sigue finito', async ({ page }) => {
  // v = 25·10⁶ m/s se capa al máximo (20) y B = 0 al mínimo (0,01 T): con B = 0 el radio divergiría
  expect(await sembrarValorAcotado(page, '#velocidad', 25)).toBe('20');
  expect(await sembrarValorAcotado(page, '#campo', 0)).toBe('0.01');
  // Protón: r = (m_p/e)·v/B = 1,0439677·10⁻⁸·2·10⁷/0,01 = 20,879 m
  await expect(valorDeFila(page, 'Radio r =')).toHaveText('20,879 m');
  expect(await sembrarValorAcotado(page, '#anguloVB', -10)).toBe('0');
  expect(await sembrarValorAcotado(page, '#anguloVB', 120)).toBe('90');
  await expect(page.locator('[class*="resultBlock"]')).not.toContainText(/NaN|∞|Infinity/);
  // Electrón al máximo: E = ½·mₑ·(2·10⁷)²/e = 1137,12 eV = 1,13712 keV
  await page.getByRole('button', { name: /Electrón/ }).click();
  await expect(valorDeFila(page, 'Energía cinética')).toHaveText('1,14 keV');
});

// HALLAZGO (contenido, bajo) — REPARADO el 04/10/2026 (era ABIERTO). `seAtraen = corriente2 >= 0`: con
// I₂ = 0 la fuerza es 0 N/m y aun así la fila dice «se atraen». Sin corriente en el segundo hilo
// no hay fuerza, ni de atracción ni de repulsión (mismo patrón que el 2168 con θ = 0°).
// Caso: Corrientes, I₂ = 0 A → esperado F/L = 0 N/m y ni «se atraen» ni «se repelen» ·
//       obtenido «0 N/m» y «se atraen».
test('HALLAZGO · con I₂ = 0 no hay fuerza entre los hilos: no pueden «atraerse»', async ({ page }) => {
  await irACorrientes(page);
  // Control: arranque I₂ = 10 A → se atraen; I₂ = −10 A → se repelen
  await expect(valorDeFila(page, 'Los hilos')).toHaveText('se atraen');
  await sembrarValor(page, '#corriente2', -10);
  await expect(valorDeFila(page, 'Los hilos')).toHaveText('se repelen');
  // I₂ = 0 → F/L = μ₀·I₁·0/(2πd) = 0 N/m
  await sembrarValor(page, '#corriente2', 0);
  await expect(valorDeFila(page, 'Fuerza entre hilos')).toHaveText('0 N/m');
  await expect(valorDeFila(page, 'Los hilos')).not.toHaveText(/atraen|repelen/);
});

// HALLAZGO (dato, medio) — REPARADO el 04/10/2026 (era ABIERTO). La FAQ «¿Qué diferencia hay entre tesla y
// gauss?» dice que un imán de nevera da «unas décimas de tesla» (0,1-0,9 T). La Wikipedia en
// español (Tesla (unidad)) da 5 mT para «un imán de nevera típico», la inglesa también, y su
// «Orders of magnitude (magnetic field)» da 10-100 G (1-10 mT) citando al National MagLab
// («A refrigerator magnet is 100 gauss»): entre 10 y 100 veces menos. La propia app avisa de que
// «un resultado en teslas suele indicar un error de escala».
// Caso: guía educativa, FAQ tesla/gauss → esperado del orden de 5 mT (milésimas de tesla) ·
//       obtenido «un imán de nevera, unas décimas de tesla».
test('HALLAZGO · el imán de nevera ronda los militeslas, no «unas décimas de tesla»', async ({ page }) => {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const faq = page
    .locator('[class*="faqItem"]')
    .filter({ hasText: '¿Qué diferencia hay entre tesla y gauss?' });
  await expect(faq).toBeVisible();
  await expect(faq).toContainText('1 T = 10.000 G');
  await expect(faq).not.toContainText(/décimas de tesla/);
});

// HALLAZGO (contenido, bajo) — REPARADO el 04/10/2026 (era ABIERTO). En el dibujo de la barra sobre
// raíles, la resistencia (rect en y = 185-235, x = 72-108) flota entre los raíles (y = 120 e
// y = 300, desde x = 90) sin ningún trazo que la una a ellos: el circuito dibujado está abierto,
// y con el circuito abierto no circularía la corriente I = ε/R que da la tabla.
// Caso: Inducción → Barra sobre raíles → esperado R unida a los dos raíles (circuito cerrado) ·
//       obtenido huecos de 65 px (y = 120-185 y 235-300) sin nada dibujado.
test('HALLAZGO · la resistencia del dibujo de la barra está unida a los dos raíles', async ({ page }) => {
  await page.getByRole('button', { name: 'Inducción', exact: true }).click();
  await page.getByRole('button', { name: 'Barra sobre raíles' }).click();
  await esperarHidratacion(page, ['#campoBarra']);
  const union = await page.locator('svg[aria-label^="Barra conductora"]').evaluate((svg) => {
    const caja = (el: Element) => (el as SVGGraphicsElement).getBBox();
    const resistencia = svg.querySelector('[class*="resistor"]');
    const railes = Array.from(svg.querySelectorAll('[class*="rail"]')).map(caja);
    if (!resistencia || railes.length < 2) return null;
    const r = caja(resistencia);
    const arriba = Math.min(...railes.map((c) => c.y));
    const abajo = Math.max(...railes.map((c) => c.y + c.height));
    // Cualquier trazo (salvo raíles, barra y flecha) que cubra en vertical el hueco entre un raíl
    // y la resistencia, a la altura de la resistencia
    const piezas = Array.from(svg.querySelectorAll('line, path, polyline, rect'))
      .filter((el) => !/rail|barra|flecha/i.test(el.getAttribute('class') ?? ''))
      .map(caja);
    const cubre = (y0: number, y1: number) =>
      y1 - y0 <= 1 ||
      piezas.some(
        (c) =>
          c.x <= r.x + r.width && c.x + c.width >= r.x && c.y <= y0 + 1 && c.y + c.height >= y1 - 1,
      );
    return { superior: cubre(arriba, r.y), inferior: cubre(r.y + r.height, abajo) };
  });
  expect(union).not.toBeNull();
  expect(union).toEqual({ superior: true, inferior: true });
});

// ── Lienzos en móvil ──────────────────────────────────────────────────────────────────

test.describe('lienzos en móvil (390×844) — re-inspección 04/10/2026', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  /** El rótulo más pequeño del lienzo visible, en px de pantalla (tamaño CSS × escala del SVG). */
  async function rotuloMasPequeno(page: Page): Promise<{ minimo: number; texto: string }> {
    return page.locator('svg[class*="canvasSvg"]').first().evaluate((svg) => {
      let minimo = Infinity;
      let texto = '';
      for (const t of Array.from(svg.querySelectorAll('text'))) {
        const ctm = (t as SVGGraphicsElement).getScreenCTM();
        if (!ctm) continue;
        const efectivo = parseFloat(getComputedStyle(t).fontSize) * Math.hypot(ctm.a, ctm.b);
        if (efectivo < minimo) {
          minimo = efectivo;
          texto = (t.textContent ?? '').trim();
        }
      }
      return { minimo: Math.round(minimo * 10) / 10, texto };
    });
  }

  test('control: el lienzo no bloquea el desplazamiento táctil de la página', async ({ page }) => {
    // Medido el 04/10/2026: arrastrar el dedo 120 px sobre el lienzo desplaza la página 105 px,
    // lo mismo que sobre un título. Lo que lo garantiza es que nadie ponga touch-action: none.
    const bloqueos = await page
      .locator('svg[class*="canvasSvg"]')
      .first()
      .evaluate((svg) => {
        const fuera: string[] = [];
        for (let el: Element | null = svg; el; el = el.parentElement) {
          const ta = getComputedStyle(el).touchAction;
          if (ta !== 'auto' && ta !== 'manipulation') fuera.push(`${el.tagName}: ${ta}`);
        }
        return fuera;
      });
    expect(bloqueos).toEqual([]);
  });

  // HALLAZGO (accesibilidad, medio) — REPARADO el 04/10/2026 (era ABIERTO). A 390 px el SVG (viewBox de
  // 760 de ancho) se pinta a 308 px, escala 0,405: los rótulos de 11,5-14 px quedan en 4,6-5,7 px.
  // Lo que solo dice el dibujo deja de leerse: la leyenda de la gráfica (qué curva es Φ y cuál ε,
  // que la nota «Fíjate en el desfase» da por sabido), la regla de la mano derecha, el rótulo
  // v⊥/F de las flechas y la distancia al hilo.
  // Caso: 390×844 → esperado rótulos ≥ 9 px · obtenido 5,2-5,3 px («v⊥», «F») en Lorentz, 4,6-4,7 px
  //       («a 5,0 cm del hilo», regla de la mano derecha) en Corrientes, 4,6-4,7 px («Flujo Φ =
  //       N·B·A·cos(ωt)», «fem ε = …») en el alternador y 4,6-4,7 px («R = 2,0 Ω») en la barra.
  test('HALLAZGO · los rótulos de los cuatro lienzos se leen (≥ 9 px) a 390 px', async ({ page }) => {
    const pequenos: string[] = [];
    const medir = async (vista: string): Promise<void> => {
      const m = await rotuloMasPequeno(page);
      expect(m.minimo, `${vista}: el lienzo no tiene rótulos`).toBeLessThan(Infinity);
      if (m.minimo < 9) pequenos.push(`${vista}: «${m.texto}» a ${m.minimo} px`);
    };
    await medir('Lorentz');
    await irACorrientes(page);
    await medir('Corrientes');
    await page.getByRole('button', { name: 'Inducción', exact: true }).click();
    await esperarHidratacion(page, ['#espiras']);
    await medir('Alternador');
    await page.getByRole('button', { name: 'Barra sobre raíles' }).click();
    await esperarHidratacion(page, ['#campoBarra']);
    await medir('Barra');
    expect(pequenos).toEqual([]);
  });
});

// ── HERO — ni el logo ni la píldora de Stemum tapan el título ─────────────────────────

/** Cuántos puntos del texto del <h1> (muestreo de 4 en 4 px) caen bajo la barra fija del logo. */
async function tituloBajoLaBarra(page: Page): Promise<{ total: number; tapados: number }> {
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  return page.locator('h1').evaluate((h1) => {
    const barra = document.querySelector('[class*="headerBar"]');
    const rango = document.createRange();
    rango.selectNodeContents(h1);
    let total = 0;
    let tapados = 0;
    for (const q of Array.from(rango.getClientRects())) {
      for (let x = q.left + 2; x < q.right - 1; x += 4) {
        for (let y = q.top + 4; y < q.bottom - 3; y += 4) {
          total++;
          const e = document.elementFromPoint(x, y);
          if (e && barra?.contains(e)) tapados++;
        }
      }
    }
    return { total, tapados };
  });
}

/**
 * Bajo stemum.com, el `next dev` local rechaza el WebSocket de HMR (`allowedDevOrigins` solo
 * admite meskeia.com) y, sin él, la página NO se hidrata: la píldora «Stemum › Física» no llega
 * a montarse. El puente reenvía el socket a localhost:3050. Copiado de
 * `visualizador-volumenes.spec.ts`. Bajo `next start` no hay HMR y no hace nada.
 */
async function puenteHmr(page: Page): Promise<void> {
  const abiertos: WebSocket[] = [];
  page.on('close', () => abiertos.forEach((s) => s.close()));
  await page.routeWebSocket(/\/_next\/(webpack-)?hmr/, (ws) => {
    const u = new URL(ws.url());
    const arriba = new WebSocket(`ws://localhost:3050${u.pathname}${u.search}`);
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
 * 586a4d61 y a1d72a9c dejan 80 px de hueco arriba hasta 1023 px. Medido el 04/10/2026 en
 * meskeia.com (localhost): 0 puntos del h1 tapados a 360, 390, 768, 769, 800, 1023, 1024 y
 * 1280 px (a 1024 el título empieza en x = 221 y el logo acaba en x = 202).
 */
test.describe('hero en meskeia.com — re-inspección 04/10/2026', () => {
  test('a 360, 390, 800, 1024 y 1280 px el logo no tapa el título', async ({ page }) => {
    for (const ancho of [360, 390, 768, 769, 800, 1023, 1024, 1280]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo el logo`).toBe(0);
    }
  });
});

test.describe('hero bajo stemum.com — re-inspección 04/10/2026', () => {
  test.beforeEach(async ({ page }) => {
    await puenteHmr(page);
    await page.goto('http://stemum.com/simulador-campo-magnetico/');
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-brand', 'stemum');
    await expect(page.locator('[class*="stemumPill"]')).toBeVisible();
    await expect(page.locator('[class*="stemumPill"]')).toContainText('Física');
  });

  test('a 360, 390, 800, 1023 y desde 1042 px la píldora «Stemum › Física» no tapa el título', async ({
    page,
  }) => {
    for (const ancho of [360, 390, 800, 1023, 1042, 1060, 1120, 1280]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      expect(m.tapados, `${ancho} px: puntos del título bajo la píldora`).toBe(0);
    }
  });

  // HALLAZGO (accesibilidad, bajo) — REPARADO el 04/10/2026 (era ABIERTO). La sospecha de las cinco apps
  // de Física (píldora hasta x ≈ 232, h1 desde x ≥ 247) NO se cumple aquí: «Simulador de Campo
  // Magnético» es más largo y, desde 1024 px (sin el hueco de 80 px de a1d72a9c), empieza en
  // x = 221. La píldora «Stemum › Física» (x = 20-232, y = 15-77) tapa media «S» (x = 221-243,
  // y = 39-90). Mismo defecto que 2651 (visualizador-volumenes) y 2589 (simulador-punnett).
  // Caso: http://stemum.com/simulador-campo-magnetico/ a 1024×900 → esperado 0 puntos del h1
  //       bajo la barra fija · obtenido 24 de 1595 a 1024 px, 17 a 1030, 8 a 1035, 7 a 1041 y
  //       0 desde 1042. En meskeia.com, 0 (el logo acaba en x = 202).
  test('HALLAZGO · de 1024 a 1041 px la píldora «Stemum › Física» pisa la «S» del título', async ({
    page,
  }) => {
    const tapados: string[] = [];
    for (const ancho of [1024, 1030, 1035, 1041]) {
      await page.setViewportSize({ width: ancho, height: 900 });
      const m = await tituloBajoLaBarra(page);
      expect(m.total).toBeGreaterThan(100);
      if (m.tapados > 0) tapados.push(`${ancho} px: ${m.tapados}/${m.total}`);
    }
    expect(tapados).toEqual([]);
  });
});
