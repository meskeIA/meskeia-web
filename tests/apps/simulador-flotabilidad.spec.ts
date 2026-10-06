import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
  type DatosCaso,
} from '../../app/simulador-flotabilidad/casos';
import { LIQUIDOS, MATERIALES } from '../../app/simulador-flotabilidad/materiales';

/**
 * Simulador de Flotabilidad (principio de Arquímedes) — PASO 4.bis de /nueva-app-meskeia
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador de Flotabilidad» y el subtítulo «Principio de Arquímedes y densidad:
 *   elige el cuerpo y el líquido y comprueba si flota, cuánto se sumerge y cuánto empuje recibe».
 *   Seis materiales y seis líquidos en botones con aria-pressed, un volumen en cm³, y debajo el
 *   veredicto (Flota / Se hunde / Equilibrio indiferente), las tarjetas de P, E, % sumergido o
 *   peso aparente, y un dibujo SVG cuyo aria-label repite el veredicto.
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO ANTES DE ABRIR EL NAVEGADOR (g = 9,81 m/s²)
 *   P = ρc·V·g · E_max = ρl·V·g · flota si ρc < ρl con f = ρc/ρl · si se hunde, P − E_max.
 *   Las fuerzas salen con 4 cifras significativas (Intl es-ES, sin ceros a la derecha) y los
 *   porcentajes con un decimal y espacio duro antes del %.
 *
 *   1) Estado inicial: pino 500 kg/m³ · 1000 cm³ = 0,001 m³ · agua dulce 1000 kg/m³
 *        P = 500 · 0,001 · 9,81 = 4,905 N        → «4,905 N»
 *        ρc < ρl → FLOTA · f = 500/1000 = 0,5    → «50,0 %» sumergido, «50,0 %» sobresale
 *   2) Hierro 7870 kg/m³ · 100 cm³ = 0,0001 m³ · agua dulce
 *        P = 7870 · 0,0001 · 9,81 = 7,72047 N    → «7,72 N» (4 cifras: 7,720 sin el cero)
 *        E = 1000 · 0,0001 · 9,81 = 0,981 N      → «0,981 N»
 *        ρc > ρl → SE HUNDE · peso aparente = 7,72047 − 0,981 = 6,73947 N → «6,739 N»
 *   3) Hielo 917 kg/m³ en agua de mar 1025 kg/m³ (volumen cualquiera: f no depende de V)
 *        f = 917/1025 = 0,894634 → «89,5 %» sumergido · 1 − f = 0,105366 → «10,5 %» fuera
 *   4) Rechazo: volumen 0 o vacío → el motor devuelve null. Sin veredicto, sin ninguna cifra
 *      en newtons, y el mensaje dice qué falta: «el volumen del cuerpo».
 *   5) Al pulsar Hierro, su botón pasa a aria-pressed="true" y el de Madera de pino a "false";
 *      el aria-label del SVG pasa de «…: flota.» a «…: se hunde.».
 *   6) RelatedApps: data/app-relations.ts declara 4 relaciones para la app → 4 tarjetas.
 */

/** Espacio normal o duro (U+00A0) antes del %: la app usa el duro, el test admite los dos. */
const ESP = '[\\s\\u00A0]';

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

/** La región de resultados (role="status"), tanto con veredicto como con «Faltan datos». */
function resultados(page: Page): Locator {
  return page.locator('[role="status"]', { hasText: /Masa m = ρc·V|Faltan datos para calcular/ });
}

function dibujo(page: Page): Locator {
  return page.locator('svg[role="img"][aria-label^="Recipiente"]');
}

function cajaVolumen(page: Page): Locator {
  return page.getByRole('textbox', { name: 'Volumen', exact: true });
}

async function escribirVolumen(page: Page, valor: string): Promise<void> {
  const caja = cajaVolumen(page);
  await caja.fill(valor);
  // Sin blur: el NumberInput acota al mínimo (1 cm³) al salir, y el caso 4 quiere ver el 0 tal cual
  await esperarValorEnReact(page, caja, valor);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-flotabilidad/');
  // El deslizador del volumen es el testigo: con él montado, botones e inputs ya escuchan
  await esperarHidratacion(page, ['#deslizador-volumen']);
});

test.describe('Simulador de Flotabilidad', () => {
  test('1 · estado inicial: pino, 1000 cm³, agua dulce → flota, 50 %, P = 4,905 N', async ({ page }) => {
    await expect(resultados(page)).toContainText('Flota');
    expect(await leerTarjeta(page, 'Peso P = ρc·V·g')).toBe('4,905 N');
    expect(await leerTarjeta(page, 'Empuje en equilibrio (E = P)')).toBe('4,905 N');
    expect(await leerTarjeta(page, 'Sumergido f = ρc/ρl')).toMatch(new RegExp(`^50,0${ESP}%$`));
    expect(await leerTarjeta(page, 'Sobresale 1 − f')).toMatch(new RegExp(`^50,0${ESP}%$`));
  });

  test('2 · hierro, 100 cm³, agua dulce → se hunde, peso aparente 6,739 N', async ({ page }) => {
    await page.getByRole('button', { name: /^Hierro/ }).click();
    await escribirVolumen(page, '100');

    await expect(resultados(page)).toContainText('Se hunde');
    expect(await leerTarjeta(page, 'Peso P = ρc·V·g')).toBe('7,72 N');
    expect(await leerTarjeta(page, 'Empuje E = ρl·V·g')).toBe('0,981 N');
    expect(await leerTarjeta(page, 'Peso aparente P − E (dinamómetro)')).toBe('6,739 N');
  });

  test('3 · hielo en agua de mar → 89,5 % sumergido y 10,5 % fuera', async ({ page }) => {
    await page.getByRole('button', { name: /^Hielo/ }).click();
    await page.getByRole('button', { name: /^Agua de mar/ }).click();

    await expect(resultados(page)).toContainText('Flota');
    expect(await leerTarjeta(page, 'Sumergido f = ρc/ρl')).toMatch(new RegExp(`^89,5${ESP}%$`));
    expect(await leerTarjeta(page, 'Sobresale 1 − f')).toMatch(new RegExp(`^10,5${ESP}%$`));
  });

  for (const valor of ['0', '']) {
    test(`4 · rechazo: volumen «${valor || 'vacío'}» → sin veredicto ni cifras, y dice qué falta`, async ({ page }) => {
      await escribirVolumen(page, valor);

      const zona = resultados(page);
      await expect(zona).toContainText('Faltan datos para calcular');
      await expect(zona).toContainText('el volumen del cuerpo');
      const texto = (await zona.textContent()) ?? '';
      expect(texto).not.toMatch(/Flota|Se hunde|Equilibrio indiferente/);
      // Ninguna fuerza publicada: ni «4,905 N» ni «NaN N» ni «∞ N»
      expect(texto).not.toMatch(/(\d|NaN|∞)\s*N\b/);
      expect(texto).not.toMatch(/NaN|∞|Infinity/);
      await expect(dibujo(page)).toHaveAttribute('aria-label', /faltan datos/);
    });
  }

  test('5 · los aria-pressed siguen al preset y el aria-label del SVG al veredicto', async ({ page }) => {
    const pino = page.getByRole('button', { name: /^Madera de pino/ });
    const hierro = page.getByRole('button', { name: /^Hierro/ });

    await expect(pino).toHaveAttribute('aria-pressed', 'true');
    await expect(hierro).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /^Agua dulce/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(dibujo(page)).toHaveAttribute('aria-label', /madera de pino: flota\./);

    await hierro.click();

    await expect(hierro).toHaveAttribute('aria-pressed', 'true');
    await expect(pino).toHaveAttribute('aria-pressed', 'false');
    await expect(dibujo(page)).toHaveAttribute('aria-label', /hierro: se hunde\./);
  });

  test('6 · RelatedApps pinta 4 tarjetas', async ({ page }) => {
    const relacionadas = page.locator('section[aria-label="Aplicaciones relacionadas"]');
    await expect(relacionadas.locator('a')).toHaveCount(4);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (skill /casos-aula-meskeia, 06/10/2026) — `casos.ts` sin navegador
 *
 * Cada clave, resuelta a mano desde la definición ANTES de leer lo que devuelve la app
 * (g = 9,81 m/s², densidades de materiales.ts, 1 m³ = 1.000.000 cm³):
 *    1 · P = 2700·0,01·9,81 = 264,87 N                    · masa en vez de peso: 27 · g = 10: 270
 *    2 · f = 917/1000 = 91,7 %                            · ρl/ρc: 109,1 · lo que asoma: 8,3
 *    3 · hielo 917 > alcohol 789 → se hunde: 100 %        · dividir sin comparar: 116
 *    4 · 1 − 917/1025 = 0,10537 → 10,5 %                  · lo sumergido: 89,5 · agua dulce: 8,3
 *    5 · flota: E = P = 500·0,008·9,81 = 39,24 N          · empuje máximo: 78,48
 *    6 · se hunde: E = 1000·0,002·9,81 = 19,62 N          · E = P: 154,41
 *    7 · hierro en mercurio flota: E = P = 154,4094 N     · empuje máximo 13534·0,002·9,81 = 265,54
 *    8 · P_ap = (2700 − 1000)·0,0005·9,81 = 8,3385 N      · P: 13,24 · E: 4,91 · P + E: 18,15
 *    9 · F = (1025 − 240)·0,005·9,81 = 38,504 N           · agua dulce: 37,28 · P: 11,77
 *   10 · ρ = 0,6·1025 = 615 kg/m³                         · con lo que asoma: 410 · agua dulce: 600
 *   11 · ρ = 1000·15/(15 − 14) = 15.000 kg/m³             · el aparente arriba: 14.000
 *   12 · V_s = 410/1025 m³ = 0,4 m³ = 400 L               · «1 kg desaloja 1 L»: 410
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const A_MANO_AULA: Record<number, number> = {
  1: 264.87,
  2: 91.7,
  3: 100,
  4: 10.5,
  5: 39.24,
  6: 19.62,
  7: 154.41,
  8: 8.34,
  9: 38.5,
  10: 615,
  11: 15000,
  12: 400,
};

const redondeoAula = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

function casoAula(id: number) {
  const caso = CASOS.find((c) => c.id === id);
  if (!caso) throw new Error(`No existe el caso ${id}`);
  return caso;
}

/** Cuántos decimales lleva el número que se ENSEÑA en la solución («91,7 %» → 1). */
function decimalesMostradosAula(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

test.describe('simulador-flotabilidad · casos para clase', () => {
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
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9;
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

  test('7 · el convenio queda fijado: las doce claves a mano y g = 9,81 declarada donde cuenta', async () => {
    // (a) Las doce respuestas, contra la tabla resuelta a mano de la cabecera de este bloque.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_AULA[caso.id]);
    }

    // (b) La g se prueba EJECUTANDO con otra g, no buscando una cadena: el enunciado dice
    // «g = 9,81» si y solo si con g = 10 la respuesta sale de la tolerancia.
    for (const caso of CASOS) {
      const con10 = resolverCaso(caso.datos, 10);
      expect(con10.ok, `caso ${caso.id}`).toBe(true);
      const depende = !comprobarRespuesta(con10.valor, caso.respuesta, caso.datos).correcto;
      expect(/g = 9,81/.test(caso.enunciado), `caso ${caso.id}: ¿depende de g? ${depende}`).toBe(depende);
    }

    // (c) Un caso que nombra una sustancia escribe la densidad de la MISMA lista que los botones.
    const fmt = (n: number) => new Intl.NumberFormat('es-ES').format(n);
    for (const caso of CASOS) {
      const d: DatosCaso = caso.datos;
      const cuerpo = MATERIALES.find((m) => m.id === d.cuerpo);
      const liquido = LIQUIDOS.find((l) => l.id === d.liquido);
      if (d.cuerpo) expect(cuerpo, `caso ${caso.id}: cuerpo ${d.cuerpo}`).toBeDefined();
      if (d.liquido) expect(liquido, `caso ${caso.id}: líquido ${d.liquido}`).toBeDefined();
      if (cuerpo) expect(caso.enunciado, `caso ${caso.id}`).toContain(`${fmt(cuerpo.densidad)} kg/m³`);
      // El caso 1 (peso) no pone líquido en el enunciado: el motor lo necesita, el peso no.
      if (liquido && caso.datos.magnitud !== 'peso') {
        expect(caso.enunciado, `caso ${caso.id}`).toContain(`${fmt(liquido.densidad)} kg/m³`);
      }
    }
  });

  test('8 · corregir no lanza nunca, ni con entradas que no son números', async () => {
    const r = comprobarRespuesta(NaN, 10.5, casoAula(4).datos);
    expect(r.correcto).toBe(false);
    expect(r.motivo).not.toMatch(/NaN/);
    // 10,537 → 10,5: media décima de margen, por los dos lados.
    const borde = r.tolerancia;
    expect(borde).toBeCloseTo(0.05, 12);
    expect(comprobarRespuesta(10.5 + borde, 10.5, casoAula(4).datos).correcto).toBe(true);
    expect(comprobarRespuesta(10.5 - borde, 10.5, casoAula(4).datos).correcto).toBe(true);
    // 615 kg/m³ exactos: no hay redondeo que tolerar.
    expect(comprobarRespuesta(615, 615, casoAula(10).datos).tolerancia).toBe(0);
  });

  test('9 · el corrector separa el redondeo del error de concepto', async () => {
    // [caso, respuesta, ¿entra?, de dónde sale]. Cada cifra, a mano (cabecera del bloque).
    const tabla: ReadonlyArray<readonly [number, number, boolean, string]> = [
      [1, 264.87, true, 'la clave'],
      [1, 270, false, 'g = 10'],
      [1, 27, false, 'la masa en vez del peso'],
      [2, 91.7, true, 'la clave'],
      [2, 109.1, false, 'ρl/ρc'],
      [2, 8.3, false, 'lo que asoma'],
      [2, 89.5, false, 'agua de mar'],
      [3, 100, true, 'se hunde: entero bajo el líquido'],
      [3, 116, false, '917/789 sin comparar'],
      [4, 10.5, true, 'la clave'],
      [4, 10.54, true, 'sin redondear'],
      [4, 89.5, false, 'lo sumergido'],
      [4, 8.3, false, 'agua dulce'],
      [5, 39.24, true, 'la clave'],
      [5, 78.48, false, 'empuje máximo en un cuerpo que flota'],
      [6, 19.62, true, 'la clave'],
      [6, 154.41, false, 'E = P en un cuerpo que se hunde'],
      [7, 154.41, true, 'la clave'],
      [7, 154.4094, true, 'sin redondear'],
      [7, 265.54, false, 'empuje máximo: el hierro FLOTA en mercurio'],
      [7, 19.62, false, 'copiar el caso 6'],
      [8, 8.34, true, 'la clave'],
      [8, 8.3385, true, 'sin redondear'],
      [8, 13.24, false, 'el peso'],
      [8, 4.91, false, 'el empuje'],
      [8, 18.15, false, 'P + E'],
      [9, 38.5, true, 'la clave'],
      [9, 37.28, false, 'agua dulce'],
      [9, 11.77, false, 'el peso'],
      [9, 50.27, false, 'el empuje máximo'],
      [10, 615, true, 'la clave'],
      [10, 410, false, 'con la fracción que asoma'],
      [10, 600, false, 'agua dulce'],
      [11, 15000, true, 'la clave'],
      [11, 14000, false, 'el peso aparente arriba'],
      [12, 400, true, 'la clave'],
      [12, 410, false, '1 kg desaloja 1 L'],
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

test.describe('simulador-flotabilidad · la sección de casos en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-flotabilidad/');
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('el caso 4 se corrige con la cifra de la solución, con coma decimal', async ({ page }) => {
    expect(await corregirAula(page, 4, '10,5')).toBe(true);
  });

  test('el peso real en el caso 8 se rechaza y la solución enseña 8,34 N', async ({ page }) => {
    expect(await corregirAula(page, 8, '13,24')).toBe(false);
    const solucion = page.locator('#casos-aula').getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(page.locator('#casos-resultado')).toContainText('8,34 N');
  });

  test('la sección vive fuera de EducationalSection y no toca los botones del simulador', async ({ page }) => {
    await expect(page.locator('#casos-aula')).toBeVisible();
    // Los botones de material siguen siendo únicos por su nombre (el acta los busca con ^).
    await expect(page.getByRole('button', { name: /^Hielo/ })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /^Agua de mar/ })).toHaveCount(1);
  });
});
