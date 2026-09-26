import { test, expect, type Page, type Locator } from '@playwright/test';
import { crearPreguntas, recomendar, P as IDX } from '../../app/selector-vehiculo-electrico/motor';

/**
 * Selector de Vehículo Eléctrico (selector-vehiculo-electrico) — inspección del 25/09/2026
 *
 * QUÉ PROMETE LA APP
 *   <h1> «Selector de Vehículo Eléctrico», «Test de 10 preguntas para saber qué tipo de vehículo
 *   eléctrico o híbrido encaja con tu vida». La metadata enumera los cinco resultados posibles:
 *   «eléctrico puro (BEV), híbrido enchufable (PHEV), híbrido suave (HEV), moto eléctrica o
 *   esperar».
 *
 * EL MOTOR (app/selector-vehiculo-electrico/page.tsx, calcularResultado)
 *   Suma de pesos por opción (PREGUNTAS, l. 43-279) y gana el máximo con
 *   `totales[a] >= totales[b] ? a : b` en el orden bev, phev, hev, moto_electrica, esperar: en un
 *   empate gana en silencio el primero de esa lista. Ninguna respuesta descarta nada: todas SUMAN.
 *   Los casos se resolvieron a mano con esas tablas ANTES de abrir el navegador, y un barrido de
 *   las 124.416 combinaciones con las mismas tablas dio: BEV 64.603 · HEV 42.052 · PHEV 16.498 ·
 *   moto 1.263 · Esperar 0; 10.152 empates en cabeza.
 *
 * Los perfiles se escriben como el ÍNDICE de la opción en cada pregunta (0 = la primera), en el
 * orden de las 10 preguntas:
 *   P1 km/día · P2 carga en casa · P3 viajes largos · P4 presupuesto · P5 conducción ·
 *   P6 maletero · P7 otro vehículo · P8 ayudas · P9 ansiedad de autonomía · P10 moto.
 *
 * Los casos marcados con test.fail() vigilan un hallazgo ABIERTO: pasan en verde hoy porque la
 * aserción (lo correcto) falla, y avisarán («expected to fail but passed») cuando se repare.
 *
 * REPARACIÓN DEL 26/09/2026 (hallazgos 2049-2067)
 *   El motor vive en app/selector-vehiculo-electrico/motor.ts. Los PUNTOS siguen siendo la misma
 *   suma de pesos (salvo P8 «Sí», que ahora da +2 a la moto: la ayuda estatal vigente también
 *   cubre motocicletas, 2054), pero ya no gana a secas el máximo:
 *     · descartan las respuestas incompatibles: la moto con «necesito un coche», con 80 km/día o
 *       más, con maletero imprescindible o con «no como único vehículo» siendo el único; el
 *       enchufable si se aparca en la calle; el eléctrico puro si se aparca en la calle y la
 *       autonomía genera mucho estrés;
 *     · el presupuesto acota con la escala de la propia P4 (primer tramo en que cada tipo puntúa:
 *       moto <15 k€, eléctrico e híbrido 15-25 k€, enchufable 25-40 k€);
 *     · si no queda ninguno (solo con <15 k€ y la moto descartada) sale «Esperar o mirar de
 *       ocasión», que deja de ser inalcanzable;
 *     · los empates se dicen.
 *   Barrido de las 124.416 combinaciones con el motor nuevo: BEV 49.200 · HEV 34.659 · Esperar
 *   25.920 · PHEV 9.324 · moto 5.313; 5.809 empates, todos anunciados.
 *   Los casos que consagraban la forma vieja se han reescrito con su razonamiento al lado.
 */

type Perfil = readonly [number, number, number, number, number, number, number, number, number, number];

const URL_APP = '/selector-vehiculo-electrico/';

/**
 * La app no tiene ningún <input>, así que `esperarHidratacion` de `_hidratacion.ts` no tiene
 * testigo. El equivalente para una app de solo botones (el mismo del testigo de la familia
 * `tests/familias/selectores.spec.ts`): que React haya colgado sus props de la primera opción.
 */
async function abrir(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL_APP);
  await page.waitForFunction(
    () => {
      const b = document.querySelector('main button');
      return !!b && Object.keys(b).some((k) => k.startsWith('__reactProps$') || k.startsWith('__reactFiber$'));
    },
    null,
    { timeout: 20_000 },
  );
}

// Las opciones son radios desde el 2063 (antes, botones aria-pressed en un role="group").
const opciones = (page: Page): Locator => page.locator('main [role="radiogroup"] [role="radio"]');
// El enunciado de cada pregunta es ahora un <h2> (recibe el foco, 2064): el título del resultado
// se busca dentro de su tarjeta para no leer el enunciado de la pregunta 10.
const tituloResultado = (page: Page): Locator => page.locator('main [class*="resultadoCard"] h2');

async function completar(page: Page, perfil: Perfil): Promise<void> {
  for (let i = 0; i < perfil.length; i++) {
    await expect(page.getByText(`${i + 1} / 10`, { exact: true })).toBeVisible();
    await opciones(page).nth(perfil[i]).click();
    await page.getByRole('button', { name: i === perfil.length - 1 ? 'Ver resultado' : 'Siguiente →' }).click();
  }
  await tituloResultado(page).waitFor();
}

interface Resultado {
  titulo: string;
  tarjeta: string;
  puntos: Record<string, number>;
}

async function leerResultado(page: Page): Promise<Resultado> {
  const titulo = (await tituloResultado(page).innerText()).trim();
  const tarjeta = (await page.locator('main [class*="resultadoCard"]').innerText()).replace(/\s+/g, ' ');
  const filas = page.locator('main [class*="barraResultado"]');
  const puntos: Record<string, number> = {};
  for (let i = 0; i < (await filas.count()); i++) {
    const fila = filas.nth(i);
    const etiqueta = (await fila.locator('[class*="barraLabel"]').innerText()).trim();
    puntos[etiqueta] = Number((await fila.locator('[class*="barraValor"]').innerText()).trim());
  }
  return { titulo, tarjeta, puntos };
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfiles (cálculo a mano con las tablas de pesos, hoy en motor.ts)
// ─────────────────────────────────────────────────────────────────────────────

// NORMAL: <30 km · garaje propio con cargador · viajes largos raramente · 25-40 k€ · ciudad ·
// maletero a veces · único vehículo · ayudas «las tendré en cuenta» · ansiedad «un poco» ·
// «necesito un coche».
//   BEV 3+4+4+3+4+2+0+2+2+2 = 26 · PHEV 0+3+0+3+0+2+3+2+3+2 = 18 · HEV 1+0+0+2+2+2+3+2+1+2 = 15
//   moto 4+0+2+0+3 = 9 · esperar 1 (P7)
const NORMAL: Perfil = [0, 0, 0, 2, 0, 1, 1, 1, 1, 2];

// LÍMITE (el del encargo): >150 km · aparco en la calle · viajes largos cada semana · <15 k€ ·
// carretera · maletero a veces · único vehículo · ayudas «las tendré en cuenta» · ansiedad «un
// poco» · «necesito un coche».
//   HEV 3+4+3+0+4+2+3+2+1+2 = 24 · PHEV 2+0+3+0+2+2+3+2+3+2 = 19 · BEV 0+0+0+0+0+2+0+2+2+2 = 8
//   moto 2+5 = 7 · esperar 1+2+2+1 = 6
const LIMITE: Perfil = [3, 2, 2, 0, 2, 1, 1, 1, 1, 2];

// SIN GARAJE y 80-150 km/día, el resto pro-BEV: 80-150 km · calle · raramente · >40 k€ · mixto ·
// poco maletero · segundo coche · ayudas «sí» · ansiedad «nada» · «necesito un coche».
//   BEV 2+0+4+5+2+3+4+4+4+2 = 30 · PHEV 3+0+0+3+4+0+0+2+0+2 = 14 · HEV 3+4+0+0+2+0+0+0+0+2 = 11
//   moto 0+2+2+0+0+3+2+2 = 11 (P8 «Sí» suma +2 a la moto desde el 26/09/2026) · esperar 2
const CALLE_80_150: Perfil = [2, 2, 0, 3, 1, 2, 0, 0, 2, 2];

// «No, necesito un coche sí o sí» y sale la moto: <30 km · calle · raramente · <15 k€ · ciudad ·
// poco maletero · segundo coche · ayudas «no me influyen» · ansiedad «mucho» · P10 «necesito coche».
//   moto 4+2+2+5+3+3+2+0+0+0 = 21 · BEV 3+0+4+0+4+3+4+0+0+2 = 20 · HEV 1+4+0+0+2+0+0+2+4+2 = 15
//   esperar 2+2+1+1 = 6 · PHEV 3+2 = 5
const MOTO_NECESITA_COCHE: Perfil = [0, 2, 0, 0, 0, 2, 0, 2, 0, 2];

// >150 km/día y sale la moto: >150 km · calle · raramente · <15 k€ · ciudad · poco maletero ·
// segundo coche · ayudas «no me influyen» · ansiedad «un poco» · P10 «sería perfecta».
//   moto 0+2+2+5+3+3+2+0+0+4 = 21 · BEV 0+0+4+0+4+3+4+0+2+0 = 17 · HEV 3+4+0+0+2+0+0+2+1+0 = 12
//   esperar 1+2+2+1 = 6 · PHEV 2+3 = 5
const MOTO_150_KM: Perfil = [3, 2, 0, 0, 0, 2, 0, 2, 1, 0];

// PRESUPUESTO MÍNIMO y el resto pro-BEV: 30-80 km · garaje propio · raramente · <15 k€ · ciudad ·
// poco maletero · segundo coche · ayudas «sí» · ansiedad «nada» · «necesito un coche».
//   BEV 3+4+4+0+4+3+4+4+4+2 = 32 · moto 0+0+2+5+3+3+2+2 = 17 · PHEV 3+3+0+0+0+0+0+2+0+2 = 10
//   HEV 2+0+0+0+2+0+0+0+0+2 = 6 · esperar 2
const BEV_MENOS_15K: Perfil = [1, 0, 0, 0, 0, 2, 0, 0, 2, 2];

// EMPATE BEV = PHEV: 30-80 km · garaje comunitario sin cargador · viajes largos alguna vez al mes ·
// 25-40 k€ · mixto · maletero a veces · segundo coche · ayudas «las tendré en cuenta» · ansiedad
// «un poco» · «necesito un coche».
//   BEV 3+2+2+3+2+2+4+2+2+2 = 24 · PHEV 3+2+3+3+4+2+0+2+3+2 = 24 · HEV 2+1+2+2+2+2+0+2+1+2 = 16
//   moto 2 · esperar 0
const EMPATE_BEV_PHEV: Perfil = [1, 1, 1, 2, 1, 1, 0, 1, 1, 2];

// EL PERFIL QUE MÁS SUMA A «ESPERAR»: >150 km · calle · raramente · <15 k€ · rural · poco maletero
// · único vehículo · ayudas «no me influyen» · ansiedad «mucho» · P10 «sería perfecta».
//   esperar 1+2+0+2+2+0+1+1+1+0 = 10 (el máximo posible) · HEV 3+4+0+0+3+0+3+2+4+0 = 19
//   moto 0+2+2+5+0+3+0+0+0+4 = 16 · PHEV 2+3+3 = 8 · BEV 4+3 = 7
// Por las escalas de la propia app no le cabe nada: el HEV y el PHEV puntúan 0 con <15 k€ (P4) y
// la moto, según su guía, es para «menos de 50 km/día».
const MAXIMO_ESPERAR: Perfil = [3, 2, 0, 0, 3, 2, 1, 2, 0, 0];

// Añadidos en la reparación (26/09/2026), a mano con las tablas de motor.ts:

// LÍMITE con 15-25 k€ (para ver la tarjeta del híbrido): HEV 24+3 = 27 · PHEV 19 (descartado:
// calle; y 15-25 k€ está por debajo de su tramo) · BEV 8+1 = 9 · moto 7 (descartada: >150 km y
// «necesito un coche») · esperar 6+2 = 8 → Híbrido Convencional (HEV).
const LIMITE_15_25: Perfil = [3, 2, 2, 1, 2, 1, 1, 1, 1, 2];

// ENCHUFABLE: 30-80 km · garaje propio · alguna vez al mes · 25-40 k€ · mixto · maletero
// imprescindible · único vehículo · «las tendré en cuenta» · «un poco» · «necesito un coche».
//   PHEV 3+3+3+3+4+2+3+2+3+2 = 28 · BEV 3+4+2+3+2+1+0+2+2+2 = 21 · HEV 2+0+2+2+2+2+3+2+1+2 = 18
const ENCHUFABLE: Perfil = [1, 0, 1, 2, 1, 0, 1, 1, 1, 2];

// ─────────────────────────────────────────────────────────────────────────────
// 0. El motor, sin navegador (casos resueltos a mano)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('motor', () => {
  const PREG = crearPreguntas('¿Ayudas?');

  test('perfil normal: eléctrico puro 26 sin empates ni avisos; la moto, descartada por «necesito un coche»', () => {
    const r = recomendar(PREG, NORMAL);
    expect(r.ganador).toBe('bev');
    expect(r.puntos).toEqual({ bev: 26, phev: 18, hev: 15, moto_electrica: 9, esperar: 1 });
    expect(r.empateCon).toEqual([]);
    expect(r.avisos).toEqual([]);
    expect(r.exclusiones.map((x) => [x.tipo, x.clase])).toEqual([['moto_electrica', 'incompatible']]);
  });

  test('calle y ansiedad «nada»: el eléctrico puro gana con el aviso de la recarga pública; el enchufable queda fuera', () => {
    const r = recomendar(PREG, CALLE_80_150);
    expect(r.puntos.bev).toBe(30);
    expect(r.puntos.moto_electrica).toBe(11);
    expect(r.ganador).toBe('bev');
    expect(r.avisos.join(' ')).toMatch(/calle.*recarga pública/);
    expect(r.exclusiones.find((x) => x.tipo === 'phev')?.clase).toBe('incompatible');
  });

  test('calle y ansiedad «mucho»: el eléctrico puro se descarta y gana el híbrido (HEV 15)', () => {
    // Mismo perfil con P9 = «Mucho»: BEV 2+0+4+5+2+3+4+4+0+2 = 26 (descartado) · HEV 3+4+0+0+2+0+0+0+4+2 = 15.
    const r = recomendar(PREG, [2, 2, 0, 3, 1, 2, 0, 0, 0, 2]);
    expect(r.puntos.bev).toBe(26);
    expect(r.puntos.hev).toBe(15);
    expect(r.ganador).toBe('hev');
    expect(r.exclusiones.find((x) => x.tipo === 'bev')?.motivo).toMatch(/calle/);
  });

  test('<15 k€ y moto posible: gana la moto (27) aunque el eléctrico puro sume 26, que no cabe en el tramo', () => {
    // <30 km · calle · raramente · <15 k€ · ciudad · poco maletero · segundo coche · ayudas «Sí» ·
    // ansiedad «nada» · «sería perfecta». Moto 4+2+2+5+3+3+2+2+0+4 = 27 · BEV 3+0+4+0+4+3+4+4+4+0 = 26.
    const r = recomendar(PREG, [0, 2, 0, 0, 0, 2, 0, 0, 2, 0]);
    expect(r.puntos.moto_electrica).toBe(27);
    expect(r.puntos.bev).toBe(26);
    expect(r.ganador).toBe('moto_electrica');
    expect(r.mejorSinPresupuesto).toBeNull();
  });

  test('<15 k€ y moto descartada: «Esperar», y se dice que por uso encajaría el eléctrico puro (32)', () => {
    const r = recomendar(PREG, BEV_MENOS_15K);
    expect(r.puntos.bev).toBe(32);
    expect(r.puntos.moto_electrica).toBe(17);
    expect(r.ganador).toBe('esperar');
    expect(r.mejorSinPresupuesto).toBe('bev');
    expect(r.exclusiones.find((x) => x.tipo === 'bev')?.clase).toBe('presupuesto');
  });

  test('empate BEV = PHEV (24): gana el primero, pero el empate se declara', () => {
    const r = recomendar(PREG, EMPATE_BEV_PHEV);
    expect(r.ganador).toBe('bev');
    expect(r.empateCon).toEqual(['phev']);
  });

  test('«solo para algunos trayectos» siendo el único vehículo descarta la moto', () => {
    const perfil = [...NORMAL];
    perfil[IDX.moto] = 1;
    const r = recomendar(PREG, perfil);
    expect(r.exclusiones.find((x) => x.tipo === 'moto_electrica')?.motivo).toMatch(/único vehículo/);
  });

  test('un tramo de presupuesto alto nunca descarta un vehículo más barato', () => {
    // <30 km · garaje · raramente · >40 k€ · ciudad · poco maletero · segundo coche · «Sí» · «nada» · «sería perfecta»
    const r = recomendar(PREG, [0, 0, 0, 3, 0, 2, 0, 0, 2, 0]);
    expect(r.exclusiones.filter((x) => x.clase === 'presupuesto')).toEqual([]);
  });

  test('barrido de las 124.416 combinaciones: ninguna contradice una respuesta', () => {
    const tam = PREG.map((p) => p.opciones.length);
    const r = new Array<number>(10).fill(0);
    const cuenta: Record<string, number> = {};
    const errores: string[] = [];
    const recorrer = (i: number): void => {
      if (i === 10) {
        const res = recomendar(PREG, r);
        cuenta[res.ganador] = (cuenta[res.ganador] ?? 0) + 1;
        const g = res.ganador;
        if (g === 'moto_electrica' && (r[IDX.moto] === 2 || r[IDX.km] >= 2 || r[IDX.maletero] === 0)) errores.push(`moto ${r}`);
        if (g === 'phev' && r[IDX.carga] === 2) errores.push(`phev calle ${r}`);
        if (g === 'bev' && r[IDX.carga] === 2 && r[IDX.ansiedad] === 0) errores.push(`bev calle+estrés ${r}`);
        if (g !== 'esperar' && g !== 'moto_electrica' && r[IDX.presupuesto] === 0) errores.push(`coche <15k ${r}`);
        if (g === 'phev' && r[IDX.presupuesto] < 2) errores.push(`phev <25k ${r}`);
        if (g === 'esperar' && r[IDX.presupuesto] !== 0) errores.push(`esperar ≥15k ${r}`);
        if (g !== 'esperar' && res.empateCon.some((t) => res.puntos[t] !== res.puntos[g])) errores.push(`empate falso ${r}`);
        return;
      }
      for (let k = 0; k < tam[i]; k++) { r[i] = k; recorrer(i + 1); }
    };
    recorrer(0);
    expect(errores.slice(0, 5)).toEqual([]);
    expect(Object.values(cuenta).reduce((a, b) => a + b, 0)).toBe(124_416);
    // Los cinco resultados que anuncia la metadata son alcanzables (antes Esperar salía 0 veces).
    expect(cuenta).toEqual({ bev: 49_200, hev: 34_659, esperar: 25_920, phev: 9_324, moto_electrica: 5_313 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Casos que la app resuelve según sus propias reglas
// ─────────────────────────────────────────────────────────────────────────────

test('caso normal: urbano con garaje y cargador y 25-40 k€ → eléctrico puro, 26/18/15/9/1', async ({ page }) => {
  await abrir(page);
  await completar(page, NORMAL);
  const r = await leerResultado(page);
  expect(r.titulo).toBe('Eléctrico Puro (BEV)');
  expect(r.puntos).toEqual({
    'Eléctrico puro': 26,
    'Híbrido enchufable': 18,
    'Híbrido convencional': 15,
    'Moto eléctrica': 9,
    Esperar: 1,
  });
});

test('caso límite: sin garaje, >150 km de carretera y <15 k€ → NO sale el eléctrico puro (HEV 24, BEV 8)', async ({ page }) => {
  await abrir(page);
  await completar(page, LIMITE);
  const r = await leerResultado(page);
  expect(r.titulo).not.toBe('Eléctrico Puro (BEV)');
  expect(r.puntos['Híbrido convencional']).toBe(24);
  expect(r.puntos['Híbrido enchufable']).toBe(19);
  expect(r.puntos['Eléctrico puro']).toBe(8);
  expect(r.puntos['Moto eléctrica']).toBe(7);
  expect(r.puntos.Esperar).toBe(6);
  // Desde el 26/09/2026 el presupuesto acota: con <15 k€ ningún coche electrificado nuevo cabe
  // en la escala de la app y la moto está descartada (>150 km, «necesito un coche»). Antes salía
  // el HEV, que la propia escala puntúa con 0 en ese tramo (hallazgo 2051).
  expect(r.titulo).toBe('Esperar o mirar de ocasión');
  expect(r.tarjeta).toMatch(/Presupuesto: por uso, el que más encaja contigo sería el híbrido convencional \(24 puntos\)/);
});

test('la barra de progreso anuncia la misma fracción que pinta (invariante de la familia selector-*)', async ({ page }) => {
  await abrir(page);
  const barra = page.locator('main [role="progressbar"]');
  const anunciada = async (): Promise<number> => {
    const [a, mi, ma] = await Promise.all(
      ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map(async (x) => Number(await barra.getAttribute(x))),
    );
    return (a - mi) / (ma - mi);
  };
  const pintada = (): Promise<number> =>
    barra.evaluate((el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width / el.clientWidth);
  expect(await anunciada()).toBe(0);
  await expect.poll(pintada).toBeCloseTo(0, 2);
  await opciones(page).first().click();
  await page.getByRole('button', { name: 'Siguiente →' }).click();
  await expect.poll(anunciada).toBeCloseTo(0.1, 5);
  await expect.poll(pintada).toBeCloseTo(0.1, 2);
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Hallazgos del motor (reparados el 26/09/2026)
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO 2049: «aparco en la calle» no descarta ni matiza el eléctrico puro, y la tarjeta le dice que tiene carga en casa', async ({ page }) => {
  await abrir(page);
  await completar(page, CALLE_80_150);
  const r = await leerResultado(page);
  // Antes: «Eléctrico Puro (BEV)» con 30 puntos y «Tienes acceso a carga en casa, haces pocos o
  // moderados kilómetros diarios…». Lo correcto: no afirmar lo contrario de P2 y, si sale el BEV,
  // decir que depende de la recarga fuera de casa.
  expect(r.tarjeta).not.toContain('Tienes acceso a carga en casa');
  if (r.titulo === 'Eléctrico Puro (BEV)') {
    expect(r.tarjeta).toMatch(/calle|sin garaje|fuera de casa|recarga pública|punto de carga/i);
  }
  // Y el enchufable, que también necesita enchufe, sale como descartado con su motivo.
  expect(r.tarjeta).toMatch(/Híbrido enchufable: aparcas en la calle/);
});

test('HALLAZGO 2050: «No, necesito un coche sí o sí» y la app recomienda la moto eléctrica (21 frente a 20)', async ({ page }) => {
  await abrir(page);
  await completar(page, MOTO_NECESITA_COCHE);
  const r = await leerResultado(page);
  expect(r.titulo).not.toBe('Moto Eléctrica');
  expect(r.tarjeta).toMatch(/Moto eléctrica: respondiste que necesitas un coche/);
});

test('HALLAZGO 2050: con más de 150 km diarios sale la moto y la tarjeta dice «los kilómetros diarios son cortos»', async ({ page }) => {
  await abrir(page);
  await completar(page, MOTO_150_KM);
  const r = await leerResultado(page);
  // La guía de la propia app reserva la moto a los desplazamientos urbanos cortos.
  expect(r.tarjeta).not.toContain('los kilómetros diarios son cortos');
  expect(r.titulo).not.toBe('Moto Eléctrica');
});

test('HALLAZGO 2051: con «Menos de 15.000 €» gana el eléctrico puro sin una palabra sobre el presupuesto', async ({ page }) => {
  await abrir(page);
  await completar(page, BEV_MENOS_15K);
  const r = await leerResultado(page);
  // El caso original exigía «BEV + aviso»; el acta admitía también el descarte. Se ha elegido el
  // descarte, con la escala de la propia P4 (el BEV puntúa 0 con <15 k€): un tipo fuera de
  // presupuesto no puede ganar. Como la moto está descartada («necesito un coche») no queda
  // ninguno, sale «Esperar», y la tarjeta dice que por uso encajaría el eléctrico puro.
  expect(r.puntos['Eléctrico puro']).toBe(32);
  expect(r.titulo).toBe('Esperar o mirar de ocasión');
  expect(r.tarjeta).toMatch(/Presupuesto: por uso, el que más encaja contigo sería el eléctrico puro \(32 puntos\), pero con menos de 15\.000 €/);
});

test('HALLAZGO 2052: el perfil que más suma a «Esperar» no obtiene «Esperar» (0 de 124.416 combinaciones)', async ({ page }) => {
  await abrir(page);
  await completar(page, MAXIMO_ESPERAR);
  const r = await leerResultado(page);
  // Antes: «Híbrido Suave (HEV)» 19, moto 16, Esperar 10 (su máximo posible). El título pasa de
  // «Esperar 1–2 años» (un plazo sin base) a «Esperar o mirar de ocasión».
  expect(r.puntos.Esperar).toBe(10);
  expect(r.titulo).toBe('Esperar o mirar de ocasión');
});

test('HALLAZGO 2053: un empate BEV = PHEV (24 = 24) se resuelve en silencio por el orden del código', async ({ page }) => {
  await abrir(page);
  await completar(page, EMPATE_BEV_PHEV);
  const r = await leerResultado(page);
  expect(r.puntos['Eléctrico puro']).toBe(24);
  expect(r.puntos['Híbrido enchufable']).toBe(24);
  // Antes: «Eléctrico Puro (BEV)» · «Ideal para tu perfil» · «Tu perfil encaja perfectamente…».
  expect(r.tarjeta).toMatch(/empat|misma puntuación|igual de compatible/i);
  expect(r.tarjeta).not.toMatch(/Ideal para tu perfil|encaja perfectamente/);
  // Garaje de comunidad sin cargador: se le pide confirmarlo, no se le dice que ya tiene carga.
  expect(r.tarjeta).toMatch(/garaje comunitario aún no tiene cargador/);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Hallazgos de datos y contenido (reparados el 26/09/2026)
// ─────────────────────────────────────────────────────────────────────────────

async function abrirGuia(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Ver guía educativa' }).click();
  const guia = page.locator('main').getByText('Guía de vehículos electrificados en España').locator('xpath=ancestor::section[1]');
  await expect(page.getByText('¿Qué significan BEV, PHEV, HEV y MHEV?')).toBeVisible();
  return ((await guia.count()) ? await guia.innerText() : await page.locator('main').innerText()).replace(/\s+/g, ' ');
}

async function faqJsonLd(page: Page): Promise<string> {
  const html = await (await page.request.get(URL_APP)).text();
  const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]))
    .find((b) => b['@type'] === 'FAQPage');
  return JSON.stringify(faq);
}

test('HALLAZGO 2054: el MOVES III se presenta como ayuda vigente (terminó en 2025; hoy Programa Auto+, RD 609/2026)', async ({ page }) => {
  // Fuente: Real Decreto 609/2026, de 22 de julio (BOE-A-2026-16010), Programa Auto+; su
  // preámbulo dice que el MOVES «ha estado vigente entre los años 2019 y 2025».
  await abrir(page);
  for (let i = 0; i < 7; i++) {
    await opciones(page).first().click();
    await page.getByRole('button', { name: 'Siguiente →' }).click();
  }
  await expect(page.getByText('8 / 10', { exact: true })).toBeVisible();
  const p8 = await page.locator('main [class*="preguntaTexto"]').innerText();
  expect(p8).not.toContain('MOVES III');
  expect(p8).toContain('Programa Auto+');
  // Resto del recorrido: la nota del resultado y la guía solo citan el MOVES III como terminado.
  for (let i = 7; i < 10; i++) {
    await opciones(page).first().click();
    await page.getByRole('button', { name: i === 9 ? 'Ver resultado' : 'Siguiente →' }).click();
  }
  const r = await leerResultado(page);
  expect(r.tarjeta).not.toContain('MOVES');
  expect(r.tarjeta).toContain('las ayudas vigentes (hoy, el Programa Auto+)');
  const guia = await abrirGuia(page);
  expect(guia).toContain('El Programa MOVES III, que todavía citan muchas páginas, terminó el 31/12/2025');
  expect(guia).toMatch(/Máximo por vehículo: 4500\s€ en turismos y 1100\s€ en motocicletas/);
  // Y el FAQPage del JSON-LD (lo que leen los asistentes de IA).
  const faq = await faqJsonLd(page);
  expect(faq).not.toContain('prorrogado');
  expect(faq).toContain('La ayuda estatal vigente es el Programa Auto+');
});

test('HALLAZGO 2055: «Híbrido Suave (HEV)» llama «suave» (MHEV) al híbrido completo que describe', async ({ page }) => {
  // es.wikipedia.org/wiki/Híbrido_suave: los híbridos suaves (MHEV) «carecen de un modo de
  // propulsión exclusivamente eléctrico» y no logran la mejora de consumo de los híbridos.
  // El caso original usaba LÍMITE, que desde la reparación del 2051 da «Esperar» (<15 k€): se usa
  // el mismo perfil con 15-25 k€ para ver la tarjeta del híbrido.
  await abrir(page);
  await completar(page, LIMITE_15_25);
  const r = await leerResultado(page);
  expect(r.titulo).toBe('Híbrido Convencional (HEV)');
  expect(r.puntos['Híbrido convencional']).toBe(27);
});

test('HALLAZGO 2056: la guía da en presente datos fechados en 2025 y una previsión «2026–2027»', async ({ page }) => {
  await abrir(page);
  await completar(page, NORMAL);
  const guia = await abrirGuia(page);
  expect(guia).not.toContain('Subvenciones disponibles en España (2025)');
  expect(guia).not.toContain('puntos de carga públicos (2025)');
  expect(guia).not.toContain('2026–2027');
});

test('HALLAZGO 2057: el coste de cargar en casa sale con tres cifras distintas (tarjeta, guía y FAQPage)', async ({ page }) => {
  await abrir(page);
  await completar(page, NORMAL);
  const r = await leerResultado(page);
  const guia = await abrirGuia(page);
  const faq = await faqJsonLd(page);
  // Antes: tarjeta «≈ 2–3 € cada 100 km» · guía «1,5 €/100 km» · FAQPage «entre 2,5 € y 4 €/100
  // km». El encargo admitía una sola cifra derivada y con fuente, o ninguna: sin una fuente de
  // precio del kWh que no caduque, se da el MÉTODO (consumo × precio) y ninguna cifra.
  const cifra = /\d+(?:,\d+)?\s?€\s?(?:\/|cada )\s?100\s?km/;
  expect(r.tarjeta).not.toMatch(cifra);
  expect(guia).not.toMatch(cifra);
  expect(faq).not.toMatch(cifra);
  expect(guia).toContain('El coste por 100 km es consumo × precio');
});

test('HALLAZGO 2058: cifras sin fuente ni rótulo de estimación en la tarjeta, la guía y el FAQPage', async ({ page }) => {
  await abrir(page);
  await completar(page, NORMAL);
  const guia = await abrirGuia(page);
  const faq = await faqJsonLd(page);
  for (const retirada of ['8–12', '20–30', '250–600', '0,35–0,55', '30.000 puntos', '600 € y 1.500 €', '40-80 km', '400 km']) {
    expect(guia, retirada).not.toContain(retirada);
    expect(faq, retirada).not.toContain(retirada);
  }
});

test('HALLAZGO 2059: «Bonificaciones ITP/AJD» explica una rebaja del impuesto de matriculación, que es otro impuesto', async ({ page }) => {
  // El impuesto de matriculación es el Impuesto Especial sobre Determinados Medios de Transporte
  // (Ley 38/1992, de Impuestos Especiales, cap. VII), no el ITP/AJD.
  await abrir(page);
  await completar(page, NORMAL);
  await abrirGuia(page);
  await expect(page.locator('main li', { hasText: 'ITP/AJD' })).toHaveCount(0);
  await expect(page.locator('main li', { hasText: 'Impuesto de matriculación' })).toContainText('Impuesto Especial sobre Determinados Medios de Transporte');
});

test('HALLAZGO 2060: el JSON-LD WebApplication se sirve con featureList vacío (§1.ter pide 4-8)', async ({ request }) => {
  const html = await (await request.get(URL_APP)).text();
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const app = bloques.find((b) => b['@type'] === 'WebApplication');
  expect(app).toBeTruthy();
  expect(app.featureList.length).toBeGreaterThanOrEqual(4);
  expect(app.featureList.length).toBeLessThanOrEqual(8);
});

test('HALLAZGO 2061: los % van pegados («100%») o con espacio normal («20–30 %»), no con espacio duro', async ({ page }) => {
  // El caso original buscaba «20–30 %» en la tarjeta del HEV, cifra que se ha retirado por no
  // tener fuente (2058). Se comprueba la regla en todo lo que se ve: tarjeta del enchufable
  // («100 % eléctrico») y guía (porcentajes del Programa Auto+).
  await abrir(page);
  await completar(page, ENCHUFABLE);
  const r = await leerResultado(page);
  expect(r.titulo).toBe('Híbrido Enchufable (PHEV)');
  const tarjeta = await page.locator('main [class*="resultadoCard"]').textContent();
  const guia = await page.locator('main').textContent();
  const texto = `${tarjeta} ${guia}`;
  expect(texto).toContain('100 % eléctrico');
  expect(texto).toContain('50 %');
  expect(texto).not.toMatch(/\d(?:%| %)/);
});

test('HALLAZGO 2062: no monta RegionBadge aunque sus datos (ayudas, IDAE, CCAA, €) son de España', async ({ page }) => {
  await abrir(page);
  await expect(page.locator('[role="note"][aria-label^="Aviso: los datos de referencia son de España"], [role="note"][aria-label^="Aviso: esta herramienta aplica"]')).toHaveCount(1);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Hallazgos de accesibilidad (reparados el 26/09/2026)
// ─────────────────────────────────────────────────────────────────────────────

test('HALLAZGO 2063: una elección única se anuncia como conmutadores aria-pressed (y pulsar dos veces no desmarca)', async ({ page }) => {
  await abrir(page);
  const primera = opciones(page).first();
  await primera.click();
  await primera.click();
  await expect(primera).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('main [aria-pressed]')).toHaveCount(0);
  await expect(page.locator('main [role="radiogroup"] [role="radio"]')).toHaveCount(4);
  // Teclado del patrón de radios: la flecha marca la siguiente y le lleva el foco.
  await primera.focus();
  await page.keyboard.press('ArrowDown');
  await expect(opciones(page).nth(1)).toHaveAttribute('aria-checked', 'true');
  await expect(opciones(page).nth(1)).toBeFocused();
});

test('HALLAZGO 2064: tras «Siguiente →» con teclado el foco cae a <body> y el siguiente Tab sale del cuestionario', async ({ page }) => {
  await abrir(page);
  await opciones(page).first().focus();
  await page.keyboard.press('Space');
  await expect(opciones(page).first()).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Siguiente →' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('2 / 10', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  expect(await page.evaluate(() => !!document.activeElement?.closest('main'))).toBe(true);
  // El foco está en el enunciado nuevo, y el siguiente Tab entra en las opciones.
  await expect(page.locator('main [class*="preguntaTexto"]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(opciones(page).first()).toBeFocused();
  // «← Anterior» en la pregunta 2 se desmonta al volver a la 1: el foco tampoco cae a <body>.
  await page.getByRole('button', { name: '← Anterior' }).click();
  await expect(page.getByText('1 / 10', { exact: true })).toBeVisible();
  await expect(page.locator('main [class*="preguntaTexto"]')).toBeFocused();
});

test('HALLAZGO 2065: al pulsar «Ver resultado» el foco cae a <body> y no se lleva al resultado', async ({ page }) => {
  await abrir(page);
  await completar(page, NORMAL);
  await expect(tituloResultado(page)).toBeFocused();
  // «Repetir test» con teclado: el foco va al enunciado de la pregunta 1, a la vista.
  await page.getByRole('button', { name: 'Repetir test' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('1 / 10', { exact: true })).toBeVisible();
  const enunciado = page.locator('main [class*="preguntaTexto"]');
  await expect(enunciado).toBeFocused();
  expect((await enunciado.boundingBox())!.y).toBeGreaterThanOrEqual(0);
});

test('HALLAZGO 2066: el hero usa un degradado en hexadecimal en vez de var(--hero-bg), y su subtítulo no llega a 4,5:1', async ({ page }) => {
  await abrir(page);
  const hero = page.locator('header').filter({ has: page.locator('h1') }).first();
  // --hero-bg = #1a5278 (CLAUDE.md, «obligatorio en hero sections»); blanco encima: 8,33:1.
  for (const tema of ['light', 'dark']) {
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, tema);
    const fondo = await hero.evaluate((el) => ({ img: getComputedStyle(el).backgroundImage, color: getComputedStyle(el).backgroundColor }));
    expect(fondo.img).toBe('none');
    expect(fondo.color).toBe('rgb(26, 82, 120)');
    expect(await hero.locator('p').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  }
});

/**
 * Contraste del texto de `sel` contra su fondo real: su propia capa (quizá semitransparente)
 * sobre el fondo del ancestro `base` (o sobre sí misma si no se da).
 */
async function contraste(sel: Locator, base?: string): Promise<number> {
  return sel.evaluate((el, baseSel) => {
    const rgb = (s: string): number[] => (s.match(/[\d.]+/g) ?? []).map(Number);
    const lum = (c: number[]): number => {
      const f = (v: number): number => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const capa = rgb(getComputedStyle(el).backgroundColor);
    const debajo = baseSel ? el.parentElement!.closest(baseSel)! : el;
    const suelo = rgb(getComputedStyle(debajo).backgroundColor);
    const a = capa.length > 3 ? capa[3] : 1;
    const fondo = [0, 1, 2].map((i) => capa[i] * a + suelo[i] * (1 - a));
    const texto = rgb(getComputedStyle(el).color);
    const [l1, l2] = [lum(texto), lum(fondo)];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, base ?? null);
}

test('HALLAZGO 2067: en tema claro la opción marcada, «← Anterior» y «Repetir test» ponen #2e86ab a 3,93:1', async ({ page }) => {
  await abrir(page);
  await opciones(page).first().click();
  for (const tema of ['light', 'dark']) {
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, tema);
    // Con poll: el cambio de tema pasa por una transición de color, y una lectura inmediata
    // mide el color a medio camino.
    // Opción marcada: texto de 0,95rem en seminegrita, exige 4,5:1 (antes 3,93 en claro).
    await expect.poll(() => contraste(page.locator('main [class*="seleccionada"]'), '[class*="pregunta"]'), { message: `opción marcada (${tema})` })
      .toBeGreaterThanOrEqual(4.5);
    // «Siguiente →»: blanco sobre --primary-boton (antes 3,03-3,78:1 sobre el degradado).
    await expect.poll(() => contraste(page.getByRole('button', { name: 'Siguiente →' })), { message: `«Siguiente →» (${tema})` })
      .toBeGreaterThanOrEqual(4.5);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Móvil de 360 px
// ─────────────────────────────────────────────────────────────────────────────

test.describe('móvil 360 px', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test('sin desbordamiento horizontal ni en el cuestionario ni en el resultado; el título del resultado queda a la vista', async ({ page }) => {
    await abrir(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await completar(page, NORMAL);
    const r = await leerResultado(page);
    expect(r.titulo).toBe('Eléctrico Puro (BEV)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    // Antes el título quedaba ~36 px por encima del borde superior (hallazgo 2065).
    await expect(tituloResultado(page)).toBeFocused();
    const titulo = await tituloResultado(page).boundingBox();
    expect(titulo!.y).toBeGreaterThanOrEqual(0);
    expect(titulo!.y + titulo!.height).toBeLessThanOrEqual(740);
  });
});
