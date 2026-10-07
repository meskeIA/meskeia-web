import { test, expect, Page, Locator } from '@playwright/test';
import { esperarHidratacion, esperarPaginaAsentada } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
  type DatosCaso,
} from '../../app/simulador-modelo-bohr/casos';

/**
 * Simulador del Modelo Atómico de Bohr — PASO 4.bis de /nueva-app-meskeia
 *
 * QUÉ PROMETE LA APP
 *   El <h1> dice «Simulador del Modelo Atómico de Bohr». Dos grupos de botones con aria-pressed
 *   eligen el nivel de partida y el de llegada (1 a 7 y ∞), cinco atajos fijan líneas conocidas,
 *   y una región role="status" da el fotón: emitido o absorbido, serie, λ y su color, más las
 *   tarjetas de energía, frecuencia y radios. Debajo, la tira del espectro visible y la tabla de
 *   la serie del salto.
 *
 * LA VERDAD FÍSICA, CALCULADA A MANO (E_ion = h·c·R_H = 13,598 eV, R_H = 1,096776·10⁷ m⁻¹)
 *   1) Inicial 3 → 2 (Hα): ΔE = 13,598·(1/4 − 1/9) = 13,598·5/36 = 1,8887 → «1,889 eV»
 *      λ = 36/(5·R_H) = 656,47 nm → «λ = 656,47 nm» · «Visible, rojo» · serie de Balmer
 *      E₃ = −13,598/9 = −1,511 → «−1,511 eV» · E₂ = −3,3996 → «−3,400 eV»
 *      r₃ = 9·0,052918 = 0,47626 → «0,4763 nm»
 *      Con R = 1,097·10⁷ del libro: 36/(5·1,097·10⁷) = 656,3 nm
 *   2) Atajo Lyman α (2 → 1): λ = 4/(3·R_H) = 121,57 nm → «λ = 121,57 nm», ultravioleta
 *   3) 1 → ∞ (ionizar): absorbido, límite de Lyman, ΔE = 13,598 → «13,598 eV»
 *   4) Mismo nivel en los dos grupos → «No hay salto», sin λ.
 *   5) Al pulsar Lyman α, su atajo pasa a aria-pressed="true" y el de Hα a "false".
 */

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

function resultados(page: Page): Locator {
  return page.locator('[role="status"]', { hasText: /Fotón emitido|Fotón absorbido|No hay salto/ });
}

function nivel(page: Page, grupo: RegExp, nombre: string): Locator {
  return page.getByRole('group', { name: grupo }).getByRole('button', { name: nombre, exact: true });
}

const PARTIDA = /^Nivel de partida/;
const LLEGADA = /^Nivel de llegada/;

test.beforeEach(async ({ page }) => {
  await page.goto('/simulador-modelo-bohr/');
  // Sin inputs que sirvan de testigo: se espera a que la raíz de React termine de hidratar
  await esperarPaginaAsentada(page);
});

test.describe('Simulador del Modelo Atómico de Bohr', () => {
  test('1 · inicial 3 → 2: Hα de 656,47 nm, roja, 1,889 eV', async ({ page }) => {
    const zona = resultados(page);
    await expect(zona).toContainText('Fotón emitido');
    await expect(zona).toContainText('serie de Balmer');
    await expect(zona).toContainText('λ = 656,47 nm');
    await expect(zona).toContainText('Visible, rojo');
    expect(await leerTarjeta(page, 'Energía del fotón ΔE')).toBe('1,889 eV');
    expect(await leerTarjeta(page, 'Energía del nivel 3')).toBe('−1,511 eV');
    expect(await leerTarjeta(page, 'Energía del nivel 2')).toBe('−3,400 eV');
    expect(await leerTarjeta(page, 'Radio de la órbita 3 (n²·a₀)')).toBe('0,4763 nm');
    await expect(page.getByText('del libro sale 656,3 nm')).toBeVisible();
  });

  test('2 · atajo Lyman α: 121,57 nm, ultravioleta', async ({ page }) => {
    const hAlfa = page.getByRole('button', { name: /^Hα/ });
    const lyman = page.getByRole('button', { name: /^Lyman α/ });
    await expect(hAlfa).toHaveAttribute('aria-pressed', 'true');

    await lyman.click();

    await expect(lyman).toHaveAttribute('aria-pressed', 'true');
    await expect(hAlfa).toHaveAttribute('aria-pressed', 'false');
    const zona = resultados(page);
    await expect(zona).toContainText('serie de Lyman');
    await expect(zona).toContainText('λ = 121,57 nm');
    await expect(zona).toContainText('Ultravioleta: no lo ve el ojo');
    await expect(nivel(page, PARTIDA, 'Nivel 2')).toHaveAttribute('aria-pressed', 'true');
    await expect(nivel(page, LLEGADA, 'Nivel 1')).toHaveAttribute('aria-pressed', 'true');
  });

  test('3 · de 1 a ∞: se absorbe la energía de ionización, 13,598 eV', async ({ page }) => {
    await nivel(page, PARTIDA, 'Nivel 1').click();
    await nivel(page, LLEGADA, 'Nivel infinito: electrón libre').click();

    const zona = resultados(page);
    await expect(zona).toContainText('Fotón absorbido');
    await expect(zona).toContainText('límite de la serie');
    expect(await leerTarjeta(page, 'Energía del fotón ΔE')).toBe('13,598 eV');
    await expect(zona).toContainText('energía de ionización desde el nivel 1');
    // Absorción: la tira del espectro pasa a ser de absorción
    await expect(page.getByRole('heading', { level: 2, name: /Espectro visible del hidrógeno \(absorción\)/ })).toBeVisible();
  });

  test('4 · mismo nivel de partida y llegada: no hay salto ni longitud de onda', async ({ page }) => {
    await nivel(page, PARTIDA, 'Nivel 2').click();

    const zona = resultados(page);
    await expect(zona).toContainText('No hay salto');
    const texto = (await zona.textContent()) ?? '';
    expect(texto).not.toMatch(/λ =|\d\s*eV|NaN|∞ nm|Infinity/);
  });

  test('5 · la tabla de la serie marca el salto elegido', async ({ page }) => {
    const fila = page.locator('tr', { hasText: 'el elegido' });
    await expect(fila).toHaveCount(1);
    await expect(fila).toContainText('3 ↔ 2');
    await expect(fila).toContainText('656,47');
  });

  test('6 · RelatedApps pinta 4 tarjetas', async ({ page }) => {
    const relacionadas = page.locator('section[aria-label="Aplicaciones relacionadas"]');
    await expect(relacionadas.locator('a')).toHaveCount(4);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════════════════
 * CASOS PARA CLASE (skill /casos-aula-meskeia, 07/10/2026) — `casos.ts` sin navegador
 *
 * Cada clave, resuelta a mano con las constantes de LIBRO que declara el enunciado (13,6 eV,
 * R = 1,097·10⁷ m⁻¹, c = 3,00·10⁸ m/s, e = 1,602·10⁻¹⁹ C, a₀ = 0,0529 nm) y comprobada contra
 * lo que da el motor (13,598 eV, R_H con masa reducida): los dos redondean a la misma cifra.
 *    1 · E₃ = −13,6/9 = −1,511 (motor −1,5109) → −1,51 eV       · sin signo: 1,51 · con 1/n: −4,53
 *    2 · E₅ = −13,6/25 = −0,544 (motor −0,5439) → −0,54 eV      · con 1/n: −2,72
 *    3 · ΔE(3→2) = 13,6·5/36 = 1,8889 (motor 1,8887) → 1,89 eV  · E₃: 1,51 · E₂: 3,40 · suma: 4,91
 *    4 · λ(3→2) = 36/(5·1,097·10⁷) = 656,34 nm (motor 656,47) → 656 nm
 *    5 · λ(2→1) = 4/(3·1,097·10⁷) = 121,54 nm (motor 121,57) → 122 nm   · con 1/n: 182
 *    6 · λ(5→3) = 225/(16·1,097·10⁷) = 1281,9 nm (motor 1282,2) → 1282  · 5 → 2: 434
 *    7 · ionizar desde 2 = 13,6/4 = 3,40 (motor 3,3996) → 3,40 eV       · desde 1: 13,6 · 2 → 1: 10,2
 *    8 · f(4→2) = 3·10⁸·1,097·10⁷·3/16 = 6,1706·10¹⁴ (motor 6,1651) → 6,17 · Hα: 4,57
 *    9 · ΔE(2→1) = 10,2 eV · 1,602 = 16,340·10⁻¹⁹ J (motor 16,340) → 16,34 · en eV: 10,2
 *   10 · r₃ = 9·0,0529 = 0,4761 nm (motor 0,4763) → 0,476 nm            · con n: 0,159 · con n³: 1,428
 *   11 · 1/n² = 1/4 − 1/(1,097·10⁷·486·10⁻⁹) = 0,06243 → n = 4,00 → 4  · el siguiente: 5
 *   12 · −13,6 + 12,09 = −1,51 → n² = 9,01 → n = 3                      · n² sin raíz: 9
 * ═══════════════════════════════════════════════════════════════════════════════════════════ */

const A_MANO_AULA: Record<number, number> = {
  1: -1.51,
  2: -0.54,
  3: 1.89,
  4: 656,
  5: 122,
  6: 1282,
  7: 3.4,
  8: 6.17,
  9: 16.34,
  10: 0.476,
  11: 4,
  12: 3,
};

const redondeoAula = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

function casoAula(id: number) {
  const caso = CASOS.find((c) => c.id === id);
  if (!caso) throw new Error(`No existe el caso ${id}`);
  return caso;
}

function decimalesMostradosAula(texto: string): number {
  const m = texto.match(/[-−]?\d[\d.]*(?:,(\d+))?/);
  return m?.[1]?.length ?? 0;
}

/**
 * La cuenta que hace un alumno con las constantes de LIBRO, escrita aquí y no importada: si
 * casos.ts cambiara sus constantes de libro o su motor, este oráculo no se movería con ellos.
 */
function cuentaDeLibro(datos: DatosCaso): number {
  const E = 13.6;
  const R = 1.097e7;
  const inv2 = (n: number) => (n === Infinity ? 0 : 1 / (n * n));
  const salto = () => {
    const a = Math.min(datos.nInicial ?? NaN, datos.nFinal ?? NaN);
    const b = Math.max(datos.nInicial ?? NaN, datos.nFinal ?? NaN);
    return inv2(a) - inv2(b);
  };
  switch (datos.magnitud) {
    case 'energiaNivel':
      return -E * inv2(datos.n ?? NaN);
    case 'energiaIonizacion':
      return E * inv2(datos.n ?? NaN);
    case 'radioOrbita':
      return (datos.n ?? NaN) ** 2 * 0.0529;
    case 'energiaFoton':
      return E * salto();
    case 'energiaFotonJulios':
      return E * salto() * 1.602;
    case 'longitudOnda':
      return 1e9 / (R * salto());
    case 'frecuencia':
      return (3e8 * R * salto()) / 1e14;
    case 'nivelDesdeLongitud':
      return Math.round(1 / Math.sqrt(inv2(datos.nFinal ?? NaN) - 1 / (R * (datos.lambdaNm ?? NaN) * 1e-9)));
    case 'nivelDesdeEnergia':
      return Math.round(Math.sqrt(E / (E * inv2(datos.nInicial ?? NaN) - (datos.energiaEV ?? NaN))));
    default:
      return NaN;
  }
}

test.describe('simulador-modelo-bohr · casos para clase', () => {
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
      const exacto = Math.abs(resolverCaso(caso.datos).valor - caso.respuesta) < 1e-9 * Math.max(1, Math.abs(caso.respuesta));
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
      // Y el aleatorio tampoco castiga la cuenta de libro que pide su enunciado.
      expect(redondeoAula(cuentaDeLibro(m.datos), m.datos.decimales ?? 2), m.enunciado).toBe(m.respuesta);
    }
  });

  test('7 · el convenio: las doce claves a mano, y la cuenta de LIBRO da la misma cifra', async () => {
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id} · ${caso.titulo}`).toBe(A_MANO_AULA[caso.id]);
      const libro = cuentaDeLibro(caso.datos);
      const d = caso.datos.decimales ?? 2;
      expect(redondeoAula(libro, d), `caso ${caso.id}: libro ${libro}`).toBe(caso.respuesta);
      expect(comprobarRespuesta(redondeoAula(libro, d), caso.respuesta, caso.datos).correcto, `caso ${caso.id}`).toBe(true);
    }
    // Los enunciados declaran la constante de libro que usan.
    for (const caso of CASOS) {
      const m = caso.datos.magnitud;
      if (m === 'longitudOnda' || m === 'frecuencia' || m === 'nivelDesdeLongitud') {
        expect(caso.enunciado, `caso ${caso.id}`).toContain('R = 1,097·10⁷ m⁻¹');
      }
      if (m === 'energiaNivel' || m === 'energiaFoton' || m === 'energiaFotonJulios' || m === 'energiaIonizacion' || m === 'nivelDesdeEnergia') {
        expect(caso.enunciado, `caso ${caso.id}`).toContain('13,6');
      }
    }
  });

  test('8 · corregir no lanza nunca, y el signo olvidado tiene su propio aviso', async () => {
    const r = comprobarRespuesta(NaN, -1.51, casoAula(1).datos);
    expect(r.correcto).toBe(false);
    expect(r.motivo).not.toMatch(/NaN/);
    expect(r.tolerancia).toBeCloseTo(0.005, 12);
    const sinSigno = comprobarRespuesta(1.51, -1.51, casoAula(1).datos);
    expect(sinSigno.correcto).toBe(false);
    expect(sinSigno.motivo).toMatch(/signo/);
    // Un nivel es un entero: sin margen.
    expect(comprobarRespuesta(4, 4, casoAula(11).datos).tolerancia).toBe(0);
  });

  test('9 · el corrector separa el redondeo del error de concepto', async () => {
    const tabla: ReadonlyArray<readonly [number, number, boolean, string]> = [
      [1, -1.51, true, 'la clave'],
      [1, -1.5111, true, 'libro sin redondear'],
      [1, 1.51, false, 'sin el signo'],
      [1, -4.53, false, 'con 1/n'],
      [2, -0.54, true, 'la clave'],
      [2, -2.72, false, 'con 1/n'],
      [3, 1.89, true, 'la clave'],
      [3, 1.8887, true, 'motor sin redondear'],
      [3, 1.51, false, 'solo E₃'],
      [3, 3.4, false, 'solo E₂'],
      [3, 4.91, false, 'sumar las energías'],
      [4, 656, true, 'la clave'],
      [4, 656.34, true, 'libro sin redondear'],
      [4, 656.47, true, 'motor sin redondear'],
      [4, 657, false, 'una unidad de más'],
      [4, 434, false, 'otra línea'],
      [5, 122, true, 'la clave'],
      [5, 121.54, true, 'libro sin redondear'],
      [5, 182, false, 'con 1/n'],
      [6, 1282, true, 'la clave'],
      [6, 434, false, 'el salto 5 → 2'],
      [7, 3.4, true, 'la clave'],
      [7, 13.6, false, 'desde el fundamental'],
      [7, 10.2, false, 'el salto 2 → 1'],
      [8, 6.17, true, 'la clave'],
      [8, 4.57, false, 'la de Hα'],
      [9, 16.34, true, 'la clave'],
      [9, 10.2, false, 'en eV'],
      [9, 6.37, false, 'dividir entre 1,602'],
      [10, 0.476, true, 'la clave'],
      [10, 0.159, false, 'con n'],
      [10, 1.428, false, 'con n³'],
      [11, 4, true, 'la clave'],
      [11, 5, false, 'el siguiente nivel'],
      [12, 3, true, 'la clave'],
      [12, 9, false, 'n² sin la raíz'],
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

/** Teclea una respuesta en el caso `id` y devuelve el texto del veredicto. */
async function corregirAula(page: Page, id: number, respuesta: string): Promise<string> {
  await page.locator('#casos-aula').getByRole('button', { name: new RegExp(`^Caso ${id}:`) }).click();
  await expect(page.locator('#casos-titulo-caso')).toHaveText(new RegExp(`^Caso ${id} ·`));
  await page.locator('#casos-respuesta').fill(respuesta);
  await page.locator('#casos-comprobar').click();
  const veredicto = page.locator('#casos-veredicto');
  await expect(veredicto).toBeVisible();
  return veredicto.innerText();
}

test.describe('simulador-modelo-bohr · la sección de casos en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/simulador-modelo-bohr/');
    await esperarHidratacion(page, ['#casos-respuesta']);
  });

  test('el caso 1 acepta el menos tipográfico y avisa del signo olvidado', async ({ page }) => {
    expect(await corregirAula(page, 1, '−1,51')).toContain('¡Correcto!');
    expect(await corregirAula(page, 1, '1,51')).toContain('falta el signo');
  });

  test('el caso 4 se corrige con la cifra de libro y la solución enseña 656 nm', async ({ page }) => {
    expect(await corregirAula(page, 4, '656')).toContain('¡Correcto!');
    const solucion = page.locator('#casos-aula').getByRole('button', { name: /Ver solución/ });
    await expect(solucion).toHaveAttribute('aria-expanded', 'false');
    await solucion.click();
    await expect(page.locator('#casos-resultado')).toContainText('656 nm');
  });

  test('la sección no duplica los atajos del simulador', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Hα/ })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /^Lyman α/ })).toHaveCount(1);
  });
});
