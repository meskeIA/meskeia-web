import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
} from '../../app/simulador-principio-pascal/casos';
import { G, P_ATM } from '../../app/simulador-principio-pascal/motor';
import { LIQUIDOS } from '../../app/simulador-flotabilidad/materiales';

/**
 * Simulador del Principio de Pascal y la Presión Hidrostática — PASO 4.bis de /nueva-app-meskeia
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador del Principio de Pascal y la Presión Hidrostática». Tres secciones
 *   independientes, cada una con su región role="status": 1) presión a una profundidad con seis
 *   líquidos en botones con aria-pressed; 2) prensa hidráulica, con diámetros o áreas; 3) tubo en
 *   U con dos líquidos. Los tres selectores de líquido repiten los mismos botones, así que cada
 *   botón se busca dentro de su grupo (role="group" con el nombre de su h3).
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO (g = 9,81 m/s², P₀ = 101.325 Pa)
 *   1) Inicial: agua dulce a 10 m
 *        ρgh = 1000 · 9,81 · 10 = 98.100 Pa → «98.100 Pa» · 98.100/101.325 = 0,968 → «0,968 atm»
 *        P = 199.425 Pa → «199.425 Pa» · 199.425/101.325 = 1,968 → «1,968 atm»
 *        1 atm de agua: 101.325/9810 = 10,33 m → «10,33 m»
 *   2) Mercurio a 0,76 m: ρgh = 13.534 · 9,81 · 0,76 = 100.904,09 Pa → «100.904 Pa» · «0,996 atm»
 *   3) Prensa inicial: 100 N, diámetros 2 y 20 cm, x₁ = 10 cm
 *        A₁ = π cm² → «3,142 cm²» · A₂ = 100π → «314,2 cm²» · ventaja «×100»
 *        F₂ = 10.000 N → «10.000 N» · m = 10.000/9,81 = 1019,37 kg → «sostiene 1019 kg»
 *        x₂ = 10/100 cm = 1 mm → «1 mm» · W = 100 · 0,1 = 10 J → «10 J»
 *        P = 100/(π·10⁻⁴) = 318.309,9 Pa → «318.310 Pa»
 *   4) Prensa con áreas 10 y 500 cm² y 50 N: ventaja «×50» · F₂ = 2500 N → «2500 N» (cuatro
 *      cifras: sin punto de millar, como hace Intl en es-ES)
 *   5) Tubo inicial: agua en el fondo, aceite 920 añadido, 10 cm
 *        h_A = 920 · 10/1000 = 9,2 cm → «9,2 cm» · desnivel «0,8 cm» · P = 902,52 → «903 Pa»
 *   6) Tubo con el mismo líquido en las dos ramas → «Es el mismo líquido»; con mercurio añadido
 *      sobre agua → «más denso que el del fondo». En ninguno de los dos se publica una altura.
 *   7) Rechazo: profundidad vacía o de 20.000 m (más que la fosa de las Marianas, el tope de la
 *      app) → «Faltan datos» y dice qué falta, sin cifra en Pa.
 */

/** El valor de una tarjeta, localizado por su etiqueta (las clases del módulo van con hash). */
async function leerTarjeta(page: Page, etiqueta: string): Promise<string> {
  return page.evaluate((lab) => {
    for (const d of document.querySelectorAll('div')) {
      const sp = d.querySelectorAll(':scope > span');
      if (sp.length === 2 && sp[0].textContent?.trim() === lab) {
        return sp[1].textContent?.trim() ?? '';
      }
    }
    return '';
  }, etiqueta);
}

function seccion(page: Page, titulo: RegExp): Locator {
  return page.locator('section', { has: page.getByRole('heading', { level: 2, name: titulo }) });
}

function estado(page: Page, titulo: RegExp): Locator {
  return seccion(page, titulo).locator('[role="status"]');
}

function boton(page: Page, grupo: string, nombre: RegExp): Locator {
  return page.getByRole('group', { name: grupo, exact: true }).getByRole('button', { name: nombre });
}

async function escribir(page: Page, etiqueta: string, valor: string): Promise<void> {
  const caja = page.getByRole('textbox', { name: etiqueta, exact: true });
  await caja.fill(valor);
  await esperarValorEnReact(page, caja, valor);
}

const PROFUNDIDAD = /^1\. Presión a una profundidad/;
const PRENSA = /^2\. Prensa hidráulica/;
const TUBO = /^3\. Tubo en U/;

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-principio-pascal/');
  await esperarHidratacion(page, ['#deslizador-profundidad']);
});

test.describe('Simulador del Principio de Pascal', () => {
  test('1 · agua dulce a 10 m: 98.100 Pa del agua y 199.425 Pa absolutos', async ({ page }) => {
    const zona = estado(page, PROFUNDIDAD);
    await expect(zona).toContainText('199.425 Pa');
    await expect(zona).toContainText('1,968 atm');
    expect(await leerTarjeta(page, 'Del líquido ρ·g·h (manométrica)')).toBe('98.100 Pa');
    expect(await leerTarjeta(page, 'Atmósferas que añade el líquido')).toBe('0,968 atm');
    expect(await leerTarjeta(page, 'Profundidad que añade 1 atm')).toBe('10,33 m');
  });

  test('2 · mercurio a 0,76 m: casi una atmósfera', async ({ page }) => {
    await boton(page, 'Líquido (ρ)', /^Mercurio/).click();
    await escribir(page, 'Profundidad bajo la superficie', '0,76');

    expect(await leerTarjeta(page, 'Del líquido ρ·g·h (manométrica)')).toBe('100.904 Pa');
    expect(await leerTarjeta(page, 'Atmósferas que añade el líquido')).toBe('0,996 atm');
    await expect(boton(page, 'Líquido (ρ)', /^Mercurio/)).toHaveAttribute('aria-pressed', 'true');
    await expect(boton(page, 'Líquido (ρ)', /^Agua dulce/)).toHaveAttribute('aria-pressed', 'false');
  });

  test('3 · prensa inicial: 100 N con 2 y 20 cm de diámetro dan 10.000 N', async ({ page }) => {
    const zona = estado(page, PRENSA);
    await expect(zona).toContainText('10.000 N');
    await expect(zona).toContainText('sostiene 1019 kg');
    expect(await leerTarjeta(page, 'Multiplica la fuerza (A₂/A₁)')).toBe('×100');
    expect(await leerTarjeta(page, 'Presión transmitida P = F₁/A₁')).toBe('318.310 Pa');
    expect(await leerTarjeta(page, 'Área del émbolo 1')).toBe('3,142 cm²');
    expect(await leerTarjeta(page, 'Área del émbolo 2')).toBe('314,2 cm²');
    expect(await leerTarjeta(page, 'Sube el émbolo 2, x₂ = x₁·A₁/A₂')).toBe('1 mm');
    expect(await leerTarjeta(page, 'Trabajo F₁·x₁ = F₂·x₂')).toBe('10 J');
  });

  test('4 · prensa con áreas: 50 N, 10 y 500 cm² → ×50 y 2500 N', async ({ page }) => {
    const modoArea = page.getByRole('button', { name: 'Área (cm²)' });
    await modoArea.click();
    await expect(modoArea).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Diámetro (cm)' })).toHaveAttribute('aria-pressed', 'false');

    await escribir(page, 'Fuerza sobre el émbolo 1 (F₁)', '50');
    await escribir(page, 'Área del émbolo 1', '10');
    await escribir(page, 'Área del émbolo 2', '500');

    await expect(estado(page, PRENSA)).toContainText('2500 N');
    expect(await leerTarjeta(page, 'Multiplica la fuerza (A₂/A₁)')).toBe('×50');
  });

  test('5 · tubo en U: 10 cm de aceite equilibran 9,2 cm de agua', async ({ page }) => {
    const zona = estado(page, TUBO);
    await expect(zona).toContainText('9,2 cm');
    expect(await leerTarjeta(page, 'Desnivel entre superficies h_B − h_A')).toBe('0,8 cm');
    expect(await leerTarjeta(page, 'Presión de cada columna en la separación')).toBe('903 Pa');
  });

  test('6 · tubo en U sin equilibrio que calcular: mismo líquido o añadido más denso', async ({ page }) => {
    const zona = estado(page, TUBO);

    await boton(page, 'Líquido añadido en la rama derecha (B)', /^Agua dulce/).click();
    await expect(zona).toContainText('Es el mismo líquido');
    await expect(zona).not.toContainText(/\d\s*cm/);

    await boton(page, 'Líquido añadido en la rama derecha (B)', /^Mercurio/).click();
    await expect(zona).toContainText('más denso que el del fondo');
    await expect(zona).not.toContainText(/\d\s*cm/);
  });

  for (const valor of ['', '20000']) {
    test(`7 · rechazo: profundidad «${valor || 'vacía'}» → dice qué falta y no publica presión`, async ({ page }) => {
      await escribir(page, 'Profundidad bajo la superficie', valor);
      const zona = estado(page, PROFUNDIDAD);
      await expect(zona).toContainText('Faltan datos para calcular');
      await expect(zona).toContainText('la profundidad');
      const texto = (await zona.textContent()) ?? '';
      expect(texto).not.toMatch(/\d\s*(Pa|atm)\b/);
      expect(texto).not.toMatch(/NaN|∞|Infinity/);
    });
  }

  test('8 · RelatedApps pinta 4 tarjetas', async ({ page }) => {
    const relacionadas = page.locator('section[aria-label="Aplicaciones relacionadas"]');
    await expect(relacionadas.locator('a')).toHaveCount(4);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (skill /casos-aula-meskeia, 07/10/2026) — `casos.ts` sin navegador
 *
 * Cada clave, resuelta a mano desde la definición ANTES de leer lo que devuelve la app
 * (g = 9,81 m/s², P₀ = 101.325 Pa, densidades de simulador-flotabilidad/materiales.ts):
 *    1 · ρgh = 1000·9,81·3 = 29.430 Pa                       · g = 10: 30.000 · + P₀: 130.755
 *    2 · 101.325 + 1025·9,81·20 = 302.430 Pa                 · sin P₀: 201.105 · agua dulce: 297.525
 *    3 · (101.325 + 1025·9,81·30)/101.325 = 3,9771 → 3,98    · regla de los 10 m: 4,00 · sin P₀: 2,98
 *    4 · 13.534·9,81·0,76 = 100.904,09 → 100.904 Pa          · con 13.600: 101.396
 *    5 · (150.000 − 101.325)/9810 = 4,9618 → 4,96 m          · sin restar P₀: 15,29
 *    6 · 200·(30/5)² = 7200 N                                · cociente de diámetros: 1200
 *    7 · 1200·9,81·10/400 = 294,3 N                          · sin g: 30 · g = 10: 300
 *    8 · 20·10/400 = 0,5 cm                                  · ×40: 800
 *    9 · 1025·9,81·50·0,25 = 125.690,6 → 125.691 N           · con la absoluta: 151.022
 *   10 · 15 − 920·15/1000 = 15 − 13,8 = 1,2 cm               · h_agua: 13,8
 *   11 · 1000·16/20 = 800 kg/m³                              · al revés: 1250 · con el desnivel: 200
 *   12 · 1000·27,2/13.534 = 2,0098 → 2,01 cm                 · con 13.600: 2,00
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const A_MANO_AULA: Record<number, number> = {
  1: 29430,
  2: 302430,
  3: 3.98,
  4: 100904,
  5: 4.96,
  6: 7200,
  7: 294.3,
  8: 0.5,
  9: 125691,
  10: 1.2,
  11: 800,
  12: 2.01,
};

const redondeoAula = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

function casoAula(id: number) {
  const caso = CASOS.find((c) => c.id === id);
  if (!caso) throw new Error(`No existe el caso ${id}`);
  return caso;
}

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («3,98 atm» → 2). */
function decimalesMostradosAula(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

test.describe('simulador-principio-pascal · casos para clase', () => {
  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan lo mismo', async () => {
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(a.ok, `caso ${caso.id}: ${a.error ?? ''}`).toBe(true);
      expect(b.valor).toBe(a.valor);
      expect(b.pasos).toEqual(a.pasos);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', async () => {
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `caso ${caso.id}: ${r.error ?? ''}`).toBe(true);
      expect(redondeoAula(r.valor, caso.datos.decimales ?? 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta finita y desarrollo', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(40);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(2);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
    expect(new Set(CASOS.map((c) => c.categoria))).toEqual(new Set(['abstracto', 'aplicado']));
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const PROHIBIDO =
      /\b(España|Espana|México|Mexico|Colombia|Argentina|Perú|Peru|Chile|Uruguay|Ecuador|Madrid|Barcelona|Bogotá|Lima|euros?|dólares?|pesos (mexicanos|colombianos|chilenos|argentinos)|Bachillerato|selectividad)\b/i;
    // La sigla va aparte y con mayúsculas: con /i, el pronombre «eso» la disparaba en falso.
    const SIGLA_ESO = /\bESO\b/;
    for (const caso of CASOS) {
      const texto = `${caso.titulo} ${caso.enunciado}`;
      expect(PROHIBIDO.test(texto) || SIGLA_ESO.test(texto), `caso ${caso.id}`).toBe(false);
    }
  });

  test('5.bis · lo que el enunciado PIDE coincide con lo que la solución MUESTRA', async () => {
    for (const caso of CASOS) {
      const decimales = caso.datos.decimales ?? 2;
      expect(decimalesMostradosAula(caso.respuestaTexto), `caso ${caso.id}`).toBeLessThanOrEqual(decimales);
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}: el último paso enseña la cifra de la casilla`).toContain(caso.respuestaTexto);
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9 * Math.max(1, caso.respuesta);
      expect(caso.requiereRedondeo, `caso ${caso.id}`).toBe(!exacto);
      if (!exacto) {
        expect(caso.enunciado, `caso ${caso.id}: se redondea y el enunciado no lo pide`).toMatch(/redonde|decimal|unidades|décima/i);
      }
    }
  });

  test('6 · el generador aleatorio es reproducible, variado y usa la misma aritmética', async () => {
    const a = generarEjercicioAleatorio(12345);
    const b = generarEjercicioAleatorio(12345);
    expect(b.enunciado).toBe(a.enunciado);
    expect(b.respuesta).toBe(a.respuesta);

    const muestras = Array.from({ length: 40 }, (_, i) => generarEjercicioAleatorio(i + 1));
    expect(new Set(muestras.map((m) => m.respuesta)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(muestras.map((m) => m.datos.magnitud)).size).toBeGreaterThanOrEqual(3);
    for (const m of muestras) {
      expect(Number.isFinite(m.respuesta)).toBe(true);
      expect(redondeoAula(resolverCaso(m.datos).valor, m.datos.decimales ?? 2)).toBe(m.respuesta);
    }
  });

  test('7 · el convenio queda fijado: claves a mano, g y P₀ declaradas donde cuentan', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera de este bloque.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_AULA[caso.id]);
    }

    // (b) La g se prueba EJECUTANDO con otra g: el enunciado dice «g = 9,81» si y solo si con
    // g = 10 la respuesta sale de la tolerancia.
    for (const caso of CASOS) {
      const con10 = resolverCaso(caso.datos, 10);
      expect(con10.ok, `caso ${caso.id}`).toBe(true);
      const depende = !comprobarRespuesta(con10.valor, caso.respuesta, caso.datos).correcto;
      expect(/g = 9,81/.test(caso.enunciado), `caso ${caso.id}: ¿depende de g? ${depende}`).toBe(depende);
    }

    // (c) La atmósfera igual, con una P₀ absurda (el doble) para detectar si se USA, porque con
    // la de libro (101.300) el redondeo puede esconderla: «P₀ = 101.325 Pa» si y solo si se usa.
    for (const caso of CASOS) {
      const otra = resolverCaso(caso.datos, G, 2 * P_ATM);
      const usa = !otra.ok || Math.abs(otra.valor - resolverCaso(caso.datos).valor) > 1e-9;
      expect(/P₀ = 101\.325 Pa/.test(caso.enunciado), `caso ${caso.id}: ¿usa P₀? ${usa}`).toBe(usa);
    }

    // (d) Un caso que nombra un líquido escribe la densidad de la MISMA lista que los botones.
    const fmt = (n: number) => new Intl.NumberFormat('es-ES').format(n);
    for (const caso of CASOS) {
      for (const id of [caso.datos.liquido, caso.datos.fondo, caso.datos.anadido]) {
        if (!id) continue;
        const liquido = LIQUIDOS.find((l) => l.id === id);
        expect(liquido, `caso ${caso.id}: líquido ${id}`).toBeDefined();
        expect(caso.enunciado, `caso ${caso.id}`).toContain(`${fmt(liquido!.densidad)} kg/m³`);
      }
    }
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    const r = comprobarRespuesta(NaN, 3.98, casoAula(3).datos);
    expect(r.correcto).toBe(false);
    expect(r.motivo).not.toMatch(/NaN/);
    // 3,9771 → 3,98: media centésima de margen, por los dos lados.
    expect(r.tolerancia).toBeCloseTo(0.005, 12);
    expect(comprobarRespuesta(3.98 + r.tolerancia, 3.98, casoAula(3).datos).correcto).toBe(true);
    expect(comprobarRespuesta(3.98 - r.tolerancia, 3.98, casoAula(3).datos).correcto).toBe(true);
    // 302.430 Pa exactos: no hay redondeo que tolerar.
    expect(comprobarRespuesta(302430, 302430, casoAula(2).datos).tolerancia).toBe(0);
  });

  test('9 · el corrector separa el redondeo del error de concepto', async () => {
    // [caso, respuesta, ¿entra?, de dónde sale]. Cada cifra, a mano (cabecera del bloque).
    const tabla: ReadonlyArray<readonly [number, number, boolean, string]> = [
      [1, 29430, true, 'la clave'],
      [1, 30000, false, 'g = 10'],
      [1, 130755, false, 'sumar la atmósfera'],
      [2, 302430, true, 'la clave'],
      [2, 201105, false, 'sin la atmósfera'],
      [2, 297525, false, 'agua dulce'],
      [2, 302405, false, 'P₀ de libro, 101.300'],
      [3, 3.98, true, 'la clave'],
      [3, 3.9771, true, 'sin redondear'],
      [3, 4, false, 'la regla de una atmósfera cada 10 m'],
      [3, 2.98, false, 'sin la atmósfera'],
      [4, 100904, true, 'la clave'],
      [4, 100904.09, true, 'sin redondear'],
      [4, 101396, false, 'densidad de libro, 13.600'],
      [5, 4.96, true, 'la clave'],
      [5, 15.29, false, 'sin restar la atmósfera'],
      [6, 7200, true, 'la clave'],
      [6, 1200, false, 'cociente de diámetros'],
      [7, 294.3, true, 'la clave'],
      [7, 30, false, 'la masa sin g'],
      [7, 300, false, 'g = 10'],
      [8, 0.5, true, 'la clave'],
      [8, 800, false, 'multiplicar por la ventaja'],
      [9, 125691, true, 'la clave'],
      [9, 125690.6, true, 'sin redondear'],
      [9, 151022, false, 'con la presión absoluta'],
      [9, 502763, false, 'olvidar el área'],
      [10, 1.2, true, 'la clave'],
      [10, 13.8, false, 'la altura del agua'],
      [11, 800, true, 'la clave'],
      [11, 1250, false, 'al revés'],
      [11, 200, false, 'con el desnivel'],
      [12, 2.01, true, 'la clave'],
      [12, 2.0098, true, 'sin redondear'],
      [12, 2, false, 'densidad de libro, 13.600'],
    ];
    const mal: string[] = [];
    for (const [id, r, entra, porque] of tabla) {
      const caso = casoAula(id);
      const v = comprobarRespuesta(r, caso.respuesta, caso.datos).correcto;
      if (v !== entra) mal.push(`caso ${id}: ${r} (${porque}) ${entra ? 'no entra' : 'entra'}`);
    }
    expect(mal).toEqual([]);
  });
});

/** Teclea una respuesta en el caso `id` y devuelve si el corrector la dio por buena. */
async function corregirAula(page: Page, id: number, respuesta: string): Promise<boolean> {
  await page.locator('#casos-aula').getByRole('button', { name: new RegExp(`^Caso ${id}:`) }).click();
  await expect(page.locator('#casos-titulo-caso')).toHaveText(new RegExp(`^Caso ${id} ·`));
  await page.locator('#casos-respuesta').fill(respuesta);
  await page.locator('#casos-comprobar').click();
  // Por su id y no por getByRole('alert'), que casa también con el anunciador de rutas de Next.
  const veredicto = page.locator('#casos-veredicto');
  await expect(veredicto).toBeVisible();
  return (await veredicto.innerText()).includes('¡Correcto!');
}

test.describe('simulador-principio-pascal · la sección de casos en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-principio-pascal/');
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('el caso 2 se corrige con el punto de millar español: «302.430»', async ({ page }) => {
    expect(await corregirAula(page, 2, '302.430')).toBe(true);
  });

  test('el caso 3 acepta la coma decimal y rechaza la regla de los 10 metros', async ({ page }) => {
    expect(await corregirAula(page, 3, '3,98')).toBe(true);
    expect(await corregirAula(page, 3, '4')).toBe(false);
  });

  test('el cociente de diámetros en el caso 6 se rechaza y la solución enseña 7200 N', async ({ page }) => {
    expect(await corregirAula(page, 6, '1200')).toBe(false);
    const solucion = page.locator('#casos-aula').getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(page.locator('#casos-resultado')).toContainText('7200 N');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * INSPECTOR · primera inspección (14/11/2026)
 *
 * Cada esperado, resuelto a mano ANTES de ejecutar la app (g = 9,81 m/s², P₀ = 101.325 Pa,
 * densidades de simulador-flotabilidad/materiales.ts: alcohol 789, mar 1025, glicerina 1260):
 *
 *   N1 · prensa: F₁ = 200 N, d₁ = 5 cm, d₂ = 30 cm, x₁ = 18 cm
 *        A₁ = π·5²/4 = 19,635 cm² → «19,63 cm²» · A₂ = π·30²/4 = 706,86 cm² → «706,9 cm²»
 *        A₂/A₁ = (30/5)² = 36 → «×36» · F₂ = 200·36 = 7200 N → «7200 N»
 *        m = 7200/9,81 = 733,94 kg → «sostiene 733,9 kg»
 *        P = 200/(19,635·10⁻⁴ m²) = 101.859,2 Pa → «101.859 Pa»
 *        x₂ = 18/36 = 0,5 cm = 5 mm → «5 mm» (A₁·x₁ = 353,4 cm³ = A₂·x₂)
 *        W = 200·0,18 = 36 J = 7200·0,005 → «36 J»
 *   N2 · alcohol etílico a 25 m: ρgh = 789·9,81·25 = 193.502,25 Pa → «193.502 Pa»
 *        P = 294.827,25 Pa → «294.827 Pa» · 294.827,25/101.325 = 2,90972 → «2,910 atm»
 *        193.502,25/101.325 = 1,90972 → «1,910 atm» · 101.325/(789·9,81) = 13,091 → «13,09 m»
 *   L1 · agua de mar a 11.000 m (el tope del control): ρgh = 1025·9,81·11.000 = 110.607.750 Pa
 *        P = 110.709.075 Pa · /101.325 = 1092,6136 → «1092,614 atm» (cuatro cifras: sin punto)
 *        añade 1091,6136 → «1091,614 atm» · 101.325/(1025·9,81) = 10,077 → «10,08 m»
 *        11.000,5 m queda fuera del tope → «Faltan datos»
 *   L2 · agua dulce a 0 m: P = P₀ = «101.325 Pa», «1,000 atm» · ρgh = «0,00 Pa», «0,000 atm»
 *   L3 · prensa inicial con x₁ = 0: x₂ = «0 m», W = «0 J», F₂ sigue en «10.000 N»
 *        prensa invertida d₁ = 20, d₂ = 2: A₂/A₁ = 0,01 → «×0,01» · F₂ = 100·0,01 = «1 N»
 *        m = 1/9,81 = 0,10194 → «sostiene 0,1019 kg» · x₂ = 10 cm/0,01 = 1000 cm → «10 m»
 *   R  · diámetro 0, fuerza −50 o altura del tubo 0 → «Faltan datos» y nombra el dato, sin cifra
 *   N3 · tubo: glicerina en el fondo, alcohol añadido, h_B = 15 cm
 *        h_A = 789·15/1260 = 9,3929 → «9,393 cm» · desnivel 15 − 9,3929 = 5,6071 → «5,607 cm»
 *        P = 789·9,81·0,15 = 1161,01 → «1161 Pa»
 *   N4 · «Otra densidad» 998,2 kg/m³ a 10 m: ρgh = 998,2·98,1 = 97.923,42 → «97.923 Pa»
 *        P = 199.248,42 → «199.248 Pa» · /101.325 = 1,96643 → «1,966 atm»
 *
 * HALLAZGOS ABIERTOS de esta inspección (llevan test.fail()):
 *   · la fórmula escribe la densidad redondeada a unidades: «998 · 9,81 · 10 = 97.923 Pa»
 *     (998·9,81·10 = 97.903,8) y, con 1,03, «1 · 9,81 · 10 = 101 Pa»; igual en el tubo en U.
 *   · el caso 8 de aula dice que la tarjeta «Sube el émbolo 2» «marca la cifra» (0,5 cm), y la
 *     tarjeta marca «5 mm»: quien teclea 5 suspende.
 *   · tres preguntas del FAQPage están también en la FAQ visible, con otra redacción.
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

/** Escribe en un campo dentro de un ámbito (dos «Densidad del líquido» pueden convivir). */
async function escribirEn(page: Page, ambito: Locator, etiqueta: string, valor: string): Promise<void> {
  const caja = ambito.getByRole('textbox', { name: etiqueta, exact: true });
  await caja.fill(valor);
  await esperarValorEnReact(page, caja, valor);
}

/** Las líneas de fórmula (`<code>`) de una sección, ya pintadas. */
async function formulasDe(page: Page, titulo: RegExp): Promise<string[]> {
  return (await seccion(page, titulo).locator('code').allTextContents()).map((t) => t.replace(/\s+/g, ' ').trim());
}

interface PreguntaLd {
  name: string;
  acceptedAnswer: { text: string };
}

test.describe('simulador-principio-pascal · Inspector 14/11/2026', () => {
  test('N1 · prensa: 200 N con émbolos de 5 y 30 cm → ×36, 7200 N, 5 mm y 36 J', async ({ page }) => {
    await escribir(page, 'Fuerza sobre el émbolo 1 (F₁)', '200');
    await escribir(page, 'Diámetro del émbolo 1', '5');
    await escribir(page, 'Diámetro del émbolo 2', '30');
    await escribir(page, 'Cuánto baja el émbolo 1 (x₁)', '18');

    const zona = estado(page, PRENSA);
    await expect(zona).toContainText('7200 N');
    await expect(zona).toContainText('sostiene 733,9 kg');
    expect(await leerTarjeta(page, 'Multiplica la fuerza (A₂/A₁)')).toBe('×36');
    expect(await leerTarjeta(page, 'Presión transmitida P = F₁/A₁')).toBe('101.859 Pa');
    expect(await leerTarjeta(page, 'Área del émbolo 1')).toBe('19,63 cm²');
    expect(await leerTarjeta(page, 'Área del émbolo 2')).toBe('706,9 cm²');
    expect(await leerTarjeta(page, 'Sube el émbolo 2, x₂ = x₁·A₁/A₂')).toBe('5 mm');
    expect(await leerTarjeta(page, 'Trabajo F₁·x₁ = F₂·x₂')).toBe('36 J');
  });

  test('N2 · alcohol etílico a 25 m: 193.502 Pa del líquido y 294.827 Pa absolutos', async ({ page }) => {
    await boton(page, 'Líquido (ρ)', /^Alcohol etílico/).click();
    await escribir(page, 'Profundidad bajo la superficie', '25');

    const zona = estado(page, PROFUNDIDAD);
    await expect(zona).toContainText('294.827 Pa');
    await expect(zona).toContainText('2,910 atm');
    expect(await leerTarjeta(page, 'Del líquido ρ·g·h (manométrica)')).toBe('193.502 Pa');
    expect(await leerTarjeta(page, 'Atmósferas que añade el líquido')).toBe('1,910 atm');
    expect(await leerTarjeta(page, 'Profundidad que añade 1 atm')).toBe('13,09 m');
  });

  test('L1 · tope del control: agua de mar a 11.000 m → 110.709.075 Pa y 1092,614 atm; 11.000,5 se rechaza', async ({ page }) => {
    await boton(page, 'Líquido (ρ)', /^Agua de mar/).click();
    await escribir(page, 'Profundidad bajo la superficie', '11000');

    const zona = estado(page, PROFUNDIDAD);
    await expect(zona).toContainText('110.709.075 Pa');
    await expect(zona).toContainText('1092,614 atm');
    expect(await leerTarjeta(page, 'Del líquido ρ·g·h (manométrica)')).toBe('110.607.750 Pa');
    expect(await leerTarjeta(page, 'Atmósferas que añade el líquido')).toBe('1091,614 atm');
    expect(await leerTarjeta(page, 'Profundidad que añade 1 atm')).toBe('10,08 m');
    await expect(page.locator('#deslizador-profundidad')).toHaveAttribute('aria-valuetext', '11.000 metros');

    // Con el punto de millar español es el mismo dato
    await escribir(page, 'Profundidad bajo la superficie', '11.000');
    await expect(zona).toContainText('110.709.075 Pa');

    // Medio metro por encima del tope: se rechaza y no publica presión
    await escribir(page, 'Profundidad bajo la superficie', '11000,5');
    await expect(zona).toContainText('Faltan datos para calcular');
    await expect(zona).toContainText('de 0 a 11.000');
    expect((await zona.textContent()) ?? '').not.toMatch(/\d\s*(Pa|atm)\b/);
  });

  test('L2 · agua dulce a 0 m: solo la atmósfera, 101.325 Pa y 1,000 atm', async ({ page }) => {
    await escribir(page, 'Profundidad bajo la superficie', '0');
    const zona = estado(page, PROFUNDIDAD);
    await expect(zona).toContainText('101.325 Pa');
    await expect(zona).toContainText('1,000 atm');
    expect(await leerTarjeta(page, 'Del líquido ρ·g·h (manométrica)')).toBe('0,00 Pa');
    expect(await leerTarjeta(page, 'Atmósferas que añade el líquido')).toBe('0,000 atm');
  });

  test('L3 · prensa con x₁ = 0 (sin trabajo) y prensa invertida (×0,01, 1 N, 10 m)', async ({ page }) => {
    await escribir(page, 'Cuánto baja el émbolo 1 (x₁)', '0');
    const zona = estado(page, PRENSA);
    await expect(zona).toContainText('10.000 N');
    expect(await leerTarjeta(page, 'Sube el émbolo 2, x₂ = x₁·A₁/A₂')).toBe('0 m');
    expect(await leerTarjeta(page, 'Trabajo F₁·x₁ = F₂·x₂')).toBe('0 J');

    await escribir(page, 'Cuánto baja el émbolo 1 (x₁)', '10');
    await escribir(page, 'Diámetro del émbolo 1', '20');
    await escribir(page, 'Diámetro del émbolo 2', '2');
    await expect(zona).toContainText('sostiene 0,1019 kg');
    await expect(zona).toContainText('El émbolo 2 es el pequeño');
    expect(await leerTarjeta(page, 'Multiplica la fuerza (A₂/A₁)')).toBe('×0,01');
    expect(await leerTarjeta(page, 'Sube el émbolo 2, x₂ = x₁·A₁/A₂')).toBe('10 m');
    expect(await leerTarjeta(page, 'Trabajo F₁·x₁ = F₂·x₂')).toBe('10 J');
    await expect(zona.locator('span').filter({ hasText: /^1 N$/ })).toHaveCount(1);
  });

  test('R · diámetro 0, fuerza negativa o altura 0: dice qué falta y no publica cifra', async ({ page }) => {
    const prensa = estado(page, PRENSA);
    await escribir(page, 'Diámetro del émbolo 1', '0');
    await expect(prensa).toContainText('Faltan datos para calcular');
    await expect(prensa).toContainText('el diámetro del émbolo 1 (en cm, mayor que 0)');
    let texto = (await prensa.textContent()) ?? '';
    expect(texto).not.toMatch(/\d\s*(N|kg|Pa)\b/);
    expect(texto).not.toMatch(/NaN|∞|Infinity/);

    await escribir(page, 'Diámetro del émbolo 1', '2');
    await escribir(page, 'Fuerza sobre el émbolo 1 (F₁)', '-50');
    await expect(prensa).toContainText('la fuerza sobre el émbolo 1 (en N, mayor que 0)');
    texto = (await prensa.textContent()) ?? '';
    expect(texto).not.toMatch(/\d\s*(N|kg|Pa)\b/);

    const tubo = estado(page, TUBO);
    await escribir(page, 'Altura de la columna de B (h_B)', '0');
    await expect(tubo).toContainText('la altura del líquido añadido (en cm, mayor que 0)');
    expect((await tubo.textContent()) ?? '').not.toMatch(/\d\s*(cm|Pa)\b/);
  });

  test('N3 · tubo en U: 15 cm de alcohol sobre glicerina equilibran 9,393 cm', async ({ page }) => {
    await boton(page, 'Líquido del fondo del tubo (A)', /^Glicerina/).click();
    await boton(page, 'Líquido añadido en la rama derecha (B)', /^Alcohol etílico/).click();
    await escribir(page, 'Altura de la columna de B (h_B)', '15');

    await expect(estado(page, TUBO)).toContainText('9,393 cm');
    expect(await leerTarjeta(page, 'Desnivel entre superficies h_B − h_A')).toBe('5,607 cm');
    expect(await leerTarjeta(page, 'Presión de cada columna en la separación')).toBe('1161 Pa');
  });

  test('N4 · «Otra densidad» 998,2 kg/m³ a 10 m: 97.923 Pa del líquido y 1,966 atm', async ({ page }) => {
    await boton(page, 'Líquido (ρ)', /^Otra densidad/).click();
    await escribirEn(page, seccion(page, PROFUNDIDAD), 'Densidad del líquido', '998,2');
    const zona = estado(page, PROFUNDIDAD);
    await expect(zona).toContainText('199.248 Pa');
    await expect(zona).toContainText('1,966 atm');
    expect(await leerTarjeta(page, 'Del líquido ρ·g·h (manométrica)')).toBe('97.923 Pa');
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · la fórmula escribe la densidad redondeada y su cuenta no cuadra', async ({ page }) => {
    // formatNumber(densidad, 0) en las líneas de fórmula de las secciones 1 y 3: con 998,2 kg/m³
    // la línea dice «998 · 9,81 · 10 = 97.923 Pa», y 998·9,81·10 = 97.903,8; con 1,03 dice
    // «1 · 9,81 · 10 = 101 Pa». En el tubo, B = 850,6 y h_B = 10 cm: h_A = 850,6·10/1000 = 8,506,
    // y la línea dice «851 · 10/1000 = 8,506 cm».
    test.fail();
    await boton(page, 'Líquido (ρ)', /^Otra densidad/).click();
    await escribirEn(page, seccion(page, PROFUNDIDAD), 'Densidad del líquido', '998,2');
    await expect(estado(page, PROFUNDIDAD)).toContainText('199.248 Pa');
    const linea1 = (await formulasDe(page, PROFUNDIDAD))[0];

    await boton(page, 'Líquido añadido en la rama derecha (B)', /^Otra densidad/).click();
    await escribirEn(page, seccion(page, TUBO), 'Densidad del líquido', '850,6');
    await expect(estado(page, TUBO)).toContainText('8,506 cm');
    const linea3 = (await formulasDe(page, TUBO))[1];

    expect([linea1, linea3]).toEqual([
      'ρ·g·h = 998,2 · 9,81 · 10 = 97.923 Pa',
      'h_A = 850,6 · 10/1000 = 8,506 cm',
    ]);
  });

  test('caso 8 de aula: con áreas 10 y 400 y x₁ = 20 la tarjeta enseña la clave, 0,5 cm', async ({ page }) => {
    // x₂ = 20·10/400 = 0,5 cm = 5 mm: vale cualquiera de las dos escrituras.
    await page.getByRole('button', { name: 'Área (cm²)' }).click();
    await escribir(page, 'Área del émbolo 1', '10');
    await escribir(page, 'Área del émbolo 2', '400');
    await escribir(page, 'Cuánto baja el émbolo 1 (x₁)', '20');
    await expect(estado(page, PRENSA)).toContainText('4000 N');
    expect(['5 mm', '0,5 cm']).toContain(await leerTarjeta(page, 'Sube el émbolo 2, x₂ = x₁·A₁/A₂'));
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · el caso 8 dice que la tarjeta «marca la cifra» y marca 5 mm, no 0,5 cm', async ({ page }) => {
    // «Verlo en el simulador» del caso 8: «la tarjeta «Sube el émbolo 2» marca la cifra». La
    // clave es 0,5 cm y la tarjeta escribe «5 mm» (textoLongitud pasa a mm por debajo de 1 cm);
    // quien teclea el 5 que ve suspende con «Te has desviado 4,5». Se cierra si la tarjeta dice
    // 0,5 cm o si el texto avisa de los milímetros.
    test.fail();
    await page.getByRole('button', { name: 'Área (cm²)' }).click();
    await escribir(page, 'Área del émbolo 1', '10');
    await escribir(page, 'Área del émbolo 2', '400');
    await escribir(page, 'Cuánto baja el émbolo 1 (x₁)', '20');
    await expect(estado(page, PRENSA)).toContainText('4000 N');
    const tarjeta = await leerTarjeta(page, 'Sube el émbolo 2, x₂ = x₁·A₁/A₂');

    const aula = page.locator('#casos-aula');
    await aula.getByRole('button', { name: /^Caso 8:/ }).click();
    await aula.getByRole('button', { name: /Verlo en el simulador/ }).click();
    const comoComprobar = (await page.locator('#casos-como-comprobar').textContent()) ?? '';

    expect(tarjeta === '0,5 cm' || /\bmm\b|milímetro/.test(comoComprobar), `tarjeta «${tarjeta}» · texto «${comoComprobar}»`).toBe(true);
  });

  test('el FAQPage del HTML servido tiene sus 5 preguntas y la FAQ visible también 5', async ({ page }) => {
    const ld = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        try {
          const j = JSON.parse(s.textContent ?? '');
          if (j['@type'] === 'FAQPage') return (j.mainEntity as { name: string }[]).length;
        } catch {
          /* otro bloque */
        }
      }
      return 0;
    });
    expect(ld).toBe(5);
    const visibles = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find((h) => h.textContent?.trim() === 'Preguntas frecuentes');
      return h3?.nextElementSibling?.children.length ?? 0;
    });
    expect(visibles).toBe(5);
  });

  test('HALLAZGO (14/11/2026, ABIERTO) · tres preguntas del FAQPage están en la FAQ visible con otra respuesta', async ({ page }) => {
    // «¿Una/La prensa hidráulica crea energía?», «¿La presión (del agua) depende de la forma del
    // recipiente?» y la del tubo en U con dos líquidos: misma pregunta, dos redacciones. Se cierra
    // con UNA constante (PREGUNTAS_FRECUENTES) que lean las dos FAQ: entonces cada respuesta del
    // FAQPage aparece literal en la visible.
    test.fail();
    const ld = await page.evaluate(() => {
      for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
        try {
          const j = JSON.parse(s.textContent ?? '');
          if (j['@type'] === 'FAQPage') return j.mainEntity as PreguntaLd[];
        } catch {
          /* otro bloque */
        }
      }
      return [] as PreguntaLd[];
    });
    const visibles = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find((h) => h.textContent?.trim() === 'Preguntas frecuentes');
      const lista = h3?.nextElementSibling;
      return lista ? Array.from(lista.children).map((item) => (item.textContent ?? '').replace(/\s+/g, ' ')) : [];
    });
    const repetidas = ld.filter((p) => /crea energía|forma del recipiente|tubo en U/.test(p.name));
    expect(repetidas).toHaveLength(3);
    const sinCopia = repetidas
      .filter((p) => !visibles.some((v) => v.includes(p.acceptedAnswer.text.replace(/\s+/g, ' '))))
      .map((p) => p.name);
    expect(sinCopia).toEqual([]);
  });
});
