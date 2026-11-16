import { test, expect, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * calculadora-alimentacion-mascotas — Inspector, primera inspección (16/11/2026)
 *
 * La app no cita fuente para su fórmula. La que aplica (comentarios del propio page.tsx):
 *   · RER = 70 · peso^0,75 kcal/día, sobre el PESO DE REFERENCIA, que es
 *     peso / (1 + 0,1 · (BCS − 5)) con la condición corporal de 9 puntos (en cachorros, el peso actual).
 *   · ración = RER · actividad (baja 1,2 · normal 1,4 · alta 1,6 · muy alta 2,0)
 *                  · etapa (perro: cachorro 2,0 · adulto 1,0 · senior 0,8; gato: cachorro 2,5 · …)
 *                  · 0,8 si está esterilizado.
 *   · gramos = kcal / 375 · 100 (rango: kcal/400 y kcal/350 · 100); 2 raciones, 3 o 4 en cachorros.
 *   · pauta de pérdida (BCS > 5): RER(peso de referencia) · 1,0 en perros, · 0,8 en gatos;
 *     semanas = exceso / (peso · ritmo), ritmo 1-2 % semanal en perros.
 * Las guías de referencia (WSAVA, FEDIAF, NRC 2006, AAHA) están fuera de la red de fuentes que
 * puede leer el Inspector: los factores NO se han cotejado con ellas, solo la coherencia de la app
 * consigo misma. Los esperados están calculados a mano con esa fórmula ANTES de abrir el navegador.
 *
 * Los casos marcados «HALLAZGO (…, ABIERTO)» llevan test.fail(): describen lo que DEBERÍA pasar y
 * hoy no pasa. Al reparar cada uno se quita su test.fail() —comprobando antes que lo que afirma
 * sigue siendo lo correcto— y el título pasa a REPARADO.
 */

const RUTA = '/calculadora-alimentacion-mascotas/';
const PESO = '#peso-mascota';

interface Datos {
  especie?: 'Perro' | 'Gato';
  peso: string;
  edad?: 'Cachorro' | 'Adulto' | 'Senior';
  condicion?: 'Muy delgado' | 'Delgado' | 'Ideal' | 'Sobrepeso' | 'Obesidad';
  actividad?: 'Baja' | 'Normal' | 'Alta' | 'Muy alta';
  esterilizado?: boolean;
  tamano?: 'Mini' | 'Pequeño' | 'Mediano' | 'Grande' | 'Gigante';
}

async function rellenar(
  page: Page,
  { especie = 'Perro', peso, edad = 'Adulto', condicion = 'Ideal', actividad = 'Normal', esterilizado = false, tamano }: Datos,
) {
  await page.getByRole('button', { name: especie, exact: true }).click();
  if (tamano) {
    await page.getByRole('group', { name: 'Tamaño de raza' }).getByRole('button', { name: new RegExp(`^${tamano}`) }).click();
  }
  await page.getByRole('group', { name: 'Etapa de vida' }).getByRole('button', { name: edad, exact: true }).click();
  if (edad !== 'Cachorro') {
    await page.getByRole('group', { name: 'Condición corporal' }).getByRole('button', { name: new RegExp(`^${condicion}\\s*\\d/9$`) }).click();
  }
  await page.getByRole('group', { name: 'Nivel de actividad' }).getByRole('button', { name: actividad, exact: true }).click();
  const casilla = page.getByLabel('Esterilizado/a');
  if (esterilizado) await casilla.check();
  else await casilla.uncheck();
  await page.locator(PESO).fill(peso);
  await esperarValorEnReact(page, PESO, peso);
}

async function calcular(page: Page, datos: Datos) {
  await rellenar(page, datos);
  await page.getByRole('button', { name: 'Calcular Ración', exact: true }).click();
}

/** El panel de resultados (sube desde el rótulo de la cifra principal). */
function panel(page: Page): Locator {
  return page.getByText('Ración diaria de pienso', { exact: true }).locator('xpath=../..');
}

const PLACEHOLDER = 'Introduce los datos de tu mascota para calcular su ración diaria';

interface Resultado {
  gramos: number;
  kcal: number;
  raciones: number;
  porRacion: number;
  rangoMin: number;
  rangoMax: number;
  perdidaGramos: number | null;
  perdidaKcal: number | null;
  texto: string;
}

const entero = (s: string) => Number(s.replace(/\./g, ''));

async function leer(page: Page): Promise<Resultado> {
  await expect(page.getByText('Ración diaria de pienso', { exact: true })).toBeVisible();
  const texto = (await panel(page).innerText()).replace(/\s+/g, ' ');
  const m = (re: RegExp) => {
    const r = texto.match(re);
    if (!r) throw new Error(`No encuentro ${re} en «${texto}»`);
    return r;
  };
  const rango = m(/([\d.]+) - ([\d.]+) g\/día/);
  const perdida = texto.match(/Si quieres que baje de peso ([\d.]+) g\/día \(([\d.]+) kcal\)/);
  return {
    gramos: entero(m(/([\d.]+) g\/día Ración diaria de pienso/)[1]),
    kcal: entero(m(/([\d.]+) kcal\/día/)[1]),
    raciones: entero(m(/(\d+) raciones\/día/)[1]),
    porRacion: entero(m(/([\d.]+) g por ración/)[1]),
    rangoMin: entero(rango[1]),
    rangoMax: entero(rango[2]),
    perdidaGramos: perdida ? entero(perdida[1]) : null,
    perdidaKcal: perdida ? entero(perdida[2]) : null,
    texto,
  };
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [PESO]);
});

test.describe('Cálculo de la ración', () => {
  test('CASO 1 (normal) · perro adulto de 20 kg, condición ideal, actividad normal, entero: 927 kcal y 247 g/día', async ({ page }) => {
    // RER = 70 · 20^0,75 = 70 · 9,45742 = 662,02 kcal. Ración = 662,02 · 1,4 · 1,0 = 926,83 → 927 kcal.
    // Gramos = 926,83 / 375 · 100 = 247,15 → 247 g; rango 926,83/4 = 231,7 → 232 y 926,83/3,5 = 264,8 → 265.
    // 2 raciones de 247 / 2 = 123,5 → 124 g. Con BCS 5 el peso de referencia es el actual: no hay
    // bloque de peso de referencia ni pauta de pérdida.
    await calcular(page, { peso: '20' });
    const r = await leer(page);
    expect(r.kcal).toBe(927);
    expect(r.gramos).toBe(247);
    expect([r.rangoMin, r.rangoMax]).toEqual([232, 265]);
    expect(r.raciones).toBe(2);
    expect(r.porRacion).toBe(124);
    expect(r.texto).not.toContain('Peso de referencia');
    expect(r.perdidaGramos).toBeNull();
  });

  test('CASO 1b · el mismo perro esterilizado: −20 % → 741 kcal y 198 g/día', async ({ page }) => {
    // 926,83 · 0,8 = 741,46 → 741 kcal; 741,46 / 3,75 = 197,72 → 198 g; rango 185 - 212.
    await calcular(page, { peso: '20', esterilizado: true });
    const r = await leer(page);
    expect(r.kcal).toBe(741);
    expect(r.gramos).toBe(198);
    expect([r.rangoMin, r.rangoMax]).toEqual([185, 212]);
  });

  test('CASO 2 (límite) · perro senior de 30 kg con sobrepeso 7/9, actividad baja, esterilizado: referencia 25 kg, 601 kcal y 160 g/día', async ({ page }) => {
    // Peso de referencia = 30 / (1 + 0,1 · 2) = 25 kg (desviación del 20 %).
    // RER(25) = 70 · 25^0,75 = 70 · 11,18034 = 782,62 kcal.
    // Ración = 782,62 · 1,2 (baja) · 0,8 (senior) · 0,8 (esterilizado) = 601,06 → 601 kcal;
    // 601,06 / 3,75 = 160,28 → 160 g; rango 150,3 → 150 y 171,7 → 172; 2 raciones de 80 g.
    // Pauta de pérdida (perro): el ajuste clínico RER(25) · 1,0 = 782,62 kcal supera la ración de
    // mantenimiento (601), así que la pauta se queda en la ración: 601 kcal y 160 g (hallazgo 4842,
    // REPARADO; antes daba 783 kcal y 209 g, más que para mantener).
    // Exceso 5 kg; semanas = ⌈5 / (30 · 0,02)⌉ = 9 y ⌈5 / (30 · 0,01)⌉ = 17.
    await calcular(page, { peso: '30', edad: 'Senior', condicion: 'Sobrepeso', actividad: 'Baja', esterilizado: true });
    const r = await leer(page);
    expect(r.texto).toContain('30,0 kg ahora → 25,0 kg de referencia');
    expect(r.texto).toContain('condición corporal de 7/9');
    expect(r.kcal).toBe(601);
    expect(r.gramos).toBe(160);
    expect([r.rangoMin, r.rangoMax]).toEqual([150, 172]);
    expect(r.porRacion).toBe(80);
    expect(r.perdidaKcal).toBe(601);
    expect(r.perdidaGramos).toBe(160);
    expect(r.texto).toContain('Sobran unos 5,0 kg');
    expect(r.texto).toContain('entre 9 y 17 semanas');
  });

  test('CASO 2b (límite) · gatito de 1 kg con actividad muy alta: 350 kcal, 93 g/día en 4 raciones', async ({ page }) => {
    // RER(1) = 70 kcal. Ración = 70 · 2,0 (muy alta) · 2,5 (gatito) = 350 kcal; 350 / 3,75 = 93,3 → 93 g;
    // rango 87,5 → 88 y 100; cachorro de menos de 5 kg → 4 raciones de 93 / 4 = 23,25 → 23 g.
    // En cachorros no se pregunta la condición corporal.
    await rellenar(page, { especie: 'Gato', peso: '1', edad: 'Cachorro', actividad: 'Muy alta' });
    await expect(page.getByRole('group', { name: 'Condición corporal' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Calcular Ración', exact: true }).click();
    const r = await leer(page);
    expect(r.kcal).toBe(350);
    expect(r.gramos).toBe(93);
    expect([r.rangoMin, r.rangoMax]).toEqual([88, 100]);
    expect(r.raciones).toBe(4);
    expect(r.porRacion).toBe(23);
  });

  test('CASO 2c (límite) · 100 kg es el máximo admitido: perro adulto normal → 3099 kcal y 826 g/día', async ({ page }) => {
    // RER(100) = 70 · 100^0,75 = 70 · 31,6228 = 2213,59; · 1,4 = 3099,03 → 3099 kcal; / 3,75 = 826,4 → 826 g.
    await calcular(page, { peso: '100' });
    const r = await leer(page);
    expect(r.kcal).toBe(3099);
    expect(r.gramos).toBe(826);
  });
});

test.describe('Entradas que deben rechazarse', () => {
  for (const peso of ['0', '-5', 'abc', '100,5']) {
    test(`CASO 3 (rechazo) · peso «${peso}» no da ninguna ración`, async ({ page }) => {
      // La app solo admite 0 < peso ≤ 100 kg: sin resultado, se queda el texto de espera.
      await calcular(page, { peso });
      await expect(page.getByText(PLACEHOLDER)).toBeVisible();
      await expect(page.getByText('Ración diaria de pienso', { exact: true })).toHaveCount(0);
    });
  }

  // ── HALLAZGO rechazo mudo (medio, REPARADO) ──────────────────────────────────────────────────
  // calcular() hacía «return» sin más con un peso no válido: no avisaba de nada y, si ya había un
  // resultado, lo dejaba en pantalla junto al peso nuevo. Ahora retira el resultado y avisa.
  test('HALLAZGO rechazo mudo (medio, REPARADO) · tras 20 kg (247 g/día), poner 0 y calcular no debe dejar la ración vieja', async ({ page }) => {
    await calcular(page, { peso: '20' });
    expect((await leer(page)).gramos).toBe(247);
    await page.locator(PESO).fill('0');
    await esperarValorEnReact(page, PESO, '0');
    await page.getByRole('button', { name: 'Calcular Ración', exact: true }).click();
    await expect(page.getByText('Ración diaria de pienso', { exact: true })).toHaveCount(0);
  });

  test('HALLAZGO rechazo mudo (medio, REPARADO) · con peso 0 la app debe decir por qué no calcula', async ({ page }) => {
    await calcular(page, { peso: '0' });
    // Acotado al aviso de la app: el anunciador de rutas de Next también es role="alert".
    await expect(page.getByRole('alert').filter({ hasText: /peso/i })).toBeVisible({ timeout: 3000 });
  });

  // ── HALLAZGO parser casero (bajo, REPARADO) ──────────────────────────────────────────────────
  // parseFloat(peso.replace(',', '.')) leía «15abc» como 15 kg y calculaba (199 g/día); ahora
  // parseSpanishNumber devuelve NaN.
  test('HALLAZGO parser casero (bajo, REPARADO) · «15abc» no es un peso y no debe dar ración', async ({ page }) => {
    await calcular(page, { peso: '15abc' });
    await expect(page.getByText('Ración diaria de pienso', { exact: true })).toHaveCount(0, { timeout: 3000 });
  });
});

test.describe('Coherencia de la app consigo misma', () => {
  // ── HALLAZGO pauta de pérdida mayor que la ración (alto, REPARADO) ────────────────────────────
  // La ración principal ya está calculada sobre el peso de referencia con los factores de
  // actividad, etapa y esterilización; la pauta «Si quieres que baje de peso» usaba RER · 1,0
  // (perro) sin ellos. Con actividad baja y esterilizado (0,96 · RER), o senior, la pauta para
  // adelgazar daba MÁS comida que la ración de mantenimiento.
  // Esperado corregido respecto al acta («por debajo de la ración»): la ración de mantenimiento
  // ya está calculada sobre el peso de referencia, así que mantener ese peso YA adelgaza; lo que
  // no puede pasar es que la pauta la supere. Sin fuente cotejable (WSAVA y FEDIAF fuera de la red)
  // para fijar un recorte adicional, la pauta es min(ajuste clínico, ración) y, cuando coinciden,
  // la app lo dice.
  test('HALLAZGO pauta de pérdida (alto, REPARADO) · perro adulto 30 kg, sobrepeso 7/9, baja, esterilizado: la pauta de pérdida no supera la ración (200 g)', async ({ page }) => {
    // Ración = RER(25) · 1,2 · 0,8 = 751,3 kcal → 200 g. Ajuste clínico = RER(25) · 1,0 = 782,6 kcal
    // → por encima de la ración, así que la pauta es la ración: 751 kcal y 200 g.
    await calcular(page, { peso: '30', condicion: 'Sobrepeso', actividad: 'Baja', esterilizado: true });
    const r = await leer(page);
    expect(r.gramos).toBe(200);
    expect(r.perdidaGramos).toBe(200);
    expect(r.perdidaKcal).toBe(751);
    expect(r.texto).toContain('Es la misma ración de arriba');
  });

  test('HALLAZGO pauta de pérdida (alto, REPARADO) · el mismo perro senior: la pauta no pasa de la ración de 160 g', async ({ page }) => {
    await calcular(page, { peso: '30', edad: 'Senior', condicion: 'Sobrepeso', actividad: 'Baja', esterilizado: true });
    const r = await leer(page);
    expect(r.perdidaGramos).not.toBeNull();
    expect(r.perdidaGramos!).toBeLessThanOrEqual(r.gramos);
  });

  test('control · perro adulto 30 kg con sobrepeso, actividad normal y entero: la pauta clínica (209 g) queda por debajo de la ración (292 g) y se aplica tal cual', async ({ page }) => {
    // Ración = RER(25) · 1,4 = 1095,7 kcal → 292 g. Pauta = RER(25) · 1,0 = 782,6 → 783 kcal y 209 g.
    await calcular(page, { peso: '30', condicion: 'Sobrepeso' });
    const r = await leer(page);
    expect(r.gramos).toBe(292);
    expect(r.perdidaKcal).toBe(783);
    expect(r.perdidaGramos).toBe(209);
    expect(r.texto).not.toContain('Es la misma ración de arriba');
  });

  // ── HALLAZGO tamaño de raza sin efecto (medio, REPARADO) ─────────────────────────────────────
  // El selector «Tamaño de raza» se guardaba en el estado (tamanoPerro) y no entraba en ningún
  // cálculo. Se retiró: la ración depende del peso, no del tamaño declarado.
  test('HALLAZGO tamaño de raza (medio, REPARADO) · si la app pregunta el tamaño, Mini y Gigante no pueden dar la misma ración', async ({ page }) => {
    const grupo = page.getByRole('group', { name: 'Tamaño de raza' });
    if ((await grupo.count()) === 0) return; // reparado retirando el selector
    await calcular(page, { peso: '20', tamano: 'Mini' });
    const mini = await leer(page);
    await calcular(page, { peso: '20', tamano: 'Gigante' });
    const gigante = await leer(page);
    expect(gigante.texto).not.toBe(mini.texto);
  });

  // ── HALLAZGO resultado que no sigue a los datos (bajo, REPARADO) ──────────────────────────────
  // Cambiar de especie borraba el resultado; cambiar la esterilización, la etapa o la actividad lo
  // dejaba como estaba. Ahora cualquier dato del cálculo lo retira.
  test('HALLAZGO resultado desfasado (bajo, REPARADO) · tras 20 kg (247 g), marcar «Esterilizado/a» no debe seguir mostrando 247 g', async ({ page }) => {
    await calcular(page, { peso: '20' });
    expect((await leer(page)).gramos).toBe(247);
    await page.getByLabel('Esterilizado/a').check();
    await expect(page.getByText('247 g/día', { exact: true })).toHaveCount(0, { timeout: 3000 });
  });

  // ── HALLAZGO FAQPage contra el motor (medio, REPARADO) ────────────────────────────────────────
  // El FAQPage (solo lo leen buscadores y asistentes) daba cifras que la calculadora no da:
  //   · perro adulto de 10 kg, actividad moderada: «entre 150 y 200 g». La app: RER(10) = 393,64;
  //     · 1,4 = 551,1 kcal → 147 g (rango 138 - 157).
  //   · gato adulto de 4-5 kg, actividad normal (entero: la FAQ resta aparte el 20-30 % del
  //     esterilizado): «50-70 g». La app: 4 kg → 277,2 kcal → 74 g; 5 kg → 327,7 kcal → 87 g.
  async function faq(page: Page): Promise<string> {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const pagina = bloques
      .map((t) => JSON.parse(t) as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] })
      .find((b) => b['@type'] === 'FAQPage');
    return (pagina?.mainEntity ?? []).map((q) => `${q.name} ${q.acceptedAnswer.text}`).join(' ');
  }

  test('HALLAZGO FAQPage (medio, REPARADO) · la cifra del perro de 10 kg del FAQPage debe casar con la calculadora', async ({ page }) => {
    const texto = await faq(page);
    const cifra = texto.match(/perro adulto de 10 kg[^.]*?entre (\d+) y (\d+) g/);
    expect(cifra).not.toBeNull();
    await calcular(page, { peso: '10' });
    const r = await leer(page);
    expect(r.gramos).toBe(147);
    if (cifra) {
      expect(r.gramos).toBeGreaterThanOrEqual(Number(cifra[1]));
      expect(r.gramos).toBeLessThanOrEqual(Number(cifra[2]));
    }
  });

  test('HALLAZGO FAQPage (medio, REPARADO) · la cifra del gato de 4-5 kg del FAQPage debe casar con la calculadora', async ({ page }) => {
    const texto = await faq(page);
    const cifra = texto.match(/gato adulto[^.]*?4-5 kg[^.]*?(\d+)-(\d+) g de pienso/);
    expect(cifra).not.toBeNull();
    await calcular(page, { especie: 'Gato', peso: '4' });
    const cuatro = await leer(page);
    expect(cuatro.gramos).toBe(74);
    await calcular(page, { especie: 'Gato', peso: '5' });
    const cinco = await leer(page);
    expect(cinco.gramos).toBe(87);
    if (cifra) {
      expect(cuatro.gramos).toBeGreaterThanOrEqual(Number(cifra[1]));
      expect(cinco.gramos).toBeLessThanOrEqual(Number(cifra[2]));
    }
  });
});

test.describe('Avisos, metadatos y formato', () => {
  test('el aviso de responsabilidad está desplegado al cargar, fuera de la sección educativa', async ({ page }) => {
    const aviso = page.getByRole('note').filter({ hasText: /orientativo/ });
    await expect(aviso).toBeVisible();
    expect(await aviso.evaluate((el) => Boolean(el.closest('details')))).toBe(false);
  });

  // ── HALLAZGO aviso de salud humana (medio, REPARADO) ─────────────────────────────────────────
  // DisclaimerCard variant="medical" sin children pintaba el texto de salud HUMANA: «tu salud»,
  // «un médico o profesional sanitario» y «EMERGENCIAS MÉDICAS … 112». Ahora lleva su propio texto.
  test('HALLAZGO aviso de salud humana (medio, REPARADO) · el aviso fijo debe remitir al veterinario, no al médico ni al 112', async ({ page }) => {
    const aviso = page.getByRole('note').filter({ hasText: /orientativo/ });
    await expect(aviso).toContainText(/veterinari/i);
    await expect(aviso).not.toContainText('112');
  });

  // ── HALLAZGO características vacías (bajo, REPARADO) ─────────────────────────────────────────
  test('HALLAZGO features (bajo, REPARADO) · el WebApplication debe declarar al menos 4 características', async ({ page }) => {
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const app = bloques
      .map((t) => JSON.parse(t) as { '@type'?: string; featureList?: string[] })
      .find((b) => b['@type'] === 'WebApplication');
    expect(app?.featureList?.length ?? 0).toBeGreaterThanOrEqual(4);
  });

  // ── HALLAZGO promesa (bajo, REPARADO) ─────────────────────────────────────────────────────────
  // La description prometía un «detector de alimentos tóxicos» y la pestaña es una lista fija de 12
  // alimentos, sin nada que consultar. Ahora dice «lista»; y el paso 3 de la guía ya no pide un
  // «tipo de alimento» que no existe.
  test('HALLAZGO promesa (bajo, REPARADO) · la guía no pide un tipo de alimento que la app no pregunta', async ({ page }) => {
    // La sección educativa está siempre en el DOM (colapsada por CSS).
    const html = await page.content();
    expect(html).not.toContain('y el tipo de alimento');
  });

  test('HALLAZGO promesa (bajo, REPARADO) · si la description dice «detector», la pestaña de tóxicos debe dejar consultar un alimento', async ({ page }) => {
    const descripcion = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    await page.getByRole('button', { name: 'Alimentos Tóxicos', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Alimentos Peligrosos/ })).toBeVisible();
    if (/detector/i.test(descripcion)) {
      expect(await page.getByRole('textbox').or(page.getByRole('searchbox')).count()).toBeGreaterThan(0);
    }
  });

  // ── HALLAZGO porcentaje (bajo, REPARADO) ──────────────────────────────────────────────────────
  // Formato del proyecto (25/09/2026): «20 %» con espacio duro U+00A0. Llevaba espacio normal en
  // los resultados e iba pegado en la pestaña de cambio de pienso y en la sección educativa.
  test('HALLAZGO porcentaje (bajo, REPARADO) · la pestaña de cambio de pienso separa el % con espacio duro', async ({ page }) => {
    await page.getByRole('button', { name: 'Cambio de Pienso', exact: true }).click();
    await expect(page.getByText('75 % antiguo', { exact: true })).toBeVisible();
    await expect(page.getByText('100 % nuevo', { exact: true })).toBeVisible();
  });

  test('HALLAZGO porcentaje (bajo, REPARADO) · «del 20 %» del peso de referencia lleva espacio duro', async ({ page }) => {
    await calcular(page, { peso: '30', condicion: 'Sobrepeso' });
    await expect(page.getByRole('heading', { name: 'Peso de referencia' })).toBeVisible();
    const texto = (await panel(page).textContent()) ?? '';
    expect(texto).toMatch(/del 20\s%/); // la frase está; lo que falla es el tipo de espacio
    expect(texto).toContain('del 20\u00a0%');
  });

  // ── HALLAZGO teclado y anuncio (bajo, REPARADO) ───────────────────────────────────────────────
  test('HALLAZGO teclado y anuncio (bajo, REPARADO) · el peso pide teclado decimal y el resultado se anuncia', async ({ page }) => {
    await expect(page.locator(PESO)).toHaveAttribute('inputmode', 'decimal', { timeout: 2000 });
    await calcular(page, { peso: '20' });
    const anunciado = await page
      .getByText('Ración diaria de pienso', { exact: true })
      .evaluate((el) => Boolean(el.closest('[aria-live]')));
    expect(anunciado).toBe(true);
  });
});
