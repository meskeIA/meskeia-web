import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
} from '../../app/simulador-ley-coulomb/casos';
import {
  K_COULOMB,
  cargaIgualParaFuerza,
  cargaParaFuerza,
  distanciaParaFuerza,
  factorDeDistanciaParaIgualFuerza,
  factorDeFuerza,
  fuerzaCoulomb,
} from '../../app/simulador-ley-coulomb/motor';
import { cientifica, cifraLegible } from '../../app/simulador-ley-coulomb/formato';
import { calcularCampoEnPunto, fuerzaSobreCarga } from '../../app/simulador-campo-electrico/motor';
import { redondearA } from '../../lib/calculadoras/correctorCasosAula';

/**
 * simulador-ley-coulomb (S0264, 10/11/2026) — el motor, los casos para clase y la página.
 *
 * ESTADO QUE TIENE LA APP (por eso hay bloque de navegador, PASO 4.bis de /nueva-app-meskeia):
 * tres incógnitas (fuerza, distancia, carga) que al cambiar rellenan el dato que pasa a pedirse
 * con el valor actual, y un deslizador que mueve el punto por la gráfica SIN cambiar su escala
 * (la escala la fija la distancia escrita a mano).
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO — a mano, con k = 8,99·10⁹ N·m²/C², nunca copiado de la app:
 *
 *   Caso 1   F = 8,99e9 · 2e-6 · 3e-6 / 0,3²        = 0,05394 / 0,09        = 0,59933 N  → 0,60
 *   Caso 2   F = 8,99e9 · 4e-6 · 5e-6 / 0,2²        = 0,1798 / 0,04         = 4,495 N    → 4,50
 *   Caso 3   r = √(8,99e9 · 9e-12 / 0,9)             = √0,0899               = 0,29983 m  → 29,98 cm
 *   Caso 4   q = 0,36 · 0,25 / (8,99e9 · 2e-6)        = 0,09 / 17.980         = 5,0056 µC  → 5,01
 *   Caso 5   F'/F = 1·1 / 2²                                                  = 0,25
 *   Caso 6   F'/F = 2·2 / 3²                          = 4/9                   = 0,4444     → 0,44
 *   Caso 7   F = 8,99e9 · (1,6e-19)² / (5,3e-11)²     = 8,99e9 · 2,56e-38 / 2,809e-21
 *                                                     = 8,19309e-8 N          = 81,93 nN
 *   Caso 8   F = 8,99e9 · 4e-12 / (2,5 · 0,01)        = 0,03596 / 0,025       = 1,4384 N   → 1,44
 *   Caso 9   F = 8,99e9 · 1,6e-15 / 0,0004            = 0,03596 N             = 35,96 mN
 *   Caso 10  r = √(8,99e9 · 2,5e-15 / (0,0005 · 9,8))  = √(2,2475e-5 / 0,0049) = 0,067725 m → 6,77 cm
 *   Caso 11  q = 1 · √(0,0899 / 8,99e9)               = √1e-11                = 3,1623 µC  → 3,16
 *   Caso 12  r'/r = √(9·1)                                                    = 3
 *
 * CONVENIO: k = 8,99·10⁹ (el de simulador-campo-electrico, del que se importa). El test de
 * coherencia de abajo calcula la misma fuerza con el motor de aquella app (F = q₀·E) y exige la
 * misma cifra: las dos apps se enlazan entre sí y no pueden dar dos fuerzas para el mismo par.
 */

const RUTA = '/simulador-ley-coulomb/';

/* ═══════════════════════════════════ Motor ═══════════════════════════════════ */

test.describe('simulador-ley-coulomb · motor', () => {
  test('la constante es la de simulador-campo-electrico: 8,99·10⁹', async () => {
    expect(K_COULOMB).toBe(8.99e9);
  });

  test('fuerza, signo y tipo resueltos a mano', async () => {
    const rep = fuerzaCoulomb(2e-6, 3e-6, 0.3);
    expect(rep.ok).toBe(true);
    expect(rep.modulo).toBeCloseTo(0.5993333, 6);
    expect(rep.fuerza).toBeGreaterThan(0);
    expect(rep.tipo).toBe('repulsion');

    const atr = fuerzaCoulomb(4e-6, -5e-6, 0.2);
    expect(atr.modulo).toBeCloseTo(4.495, 9);
    expect(atr.fuerza).toBeLessThan(0);
    expect(atr.tipo).toBe('atraccion');

    expect(fuerzaCoulomb(0, 5e-6, 1).tipo).toBe('nula');
  });

  test('en un medio la fuerza se divide entre εr', async () => {
    const vacio = fuerzaCoulomb(2e-6, -2e-6, 0.1).modulo;
    const aceite = fuerzaCoulomb(2e-6, -2e-6, 0.1, 2.5).modulo;
    expect(aceite).toBeCloseTo(1.4384, 9);
    expect(vacio / aceite).toBeCloseTo(2.5, 12);
  });

  test('datos imposibles: error con motivo, nunca excepción', async () => {
    expect(fuerzaCoulomb(1e-6, 1e-6, 0).ok).toBe(false);
    expect(fuerzaCoulomb(1e-6, 1e-6, -1).ok).toBe(false);
    expect(fuerzaCoulomb(1e-6, 1e-6, 1, 0.5).error).toContain('εr');
    expect(fuerzaCoulomb(NaN, 1e-6, 1).ok).toBe(false);
    expect(distanciaParaFuerza(0, 1e-6, 1)).toBeNaN();
    expect(distanciaParaFuerza(1e-6, 1e-6, 0)).toBeNaN();
    expect(cargaParaFuerza(0, 1, 1)).toBeNaN();
    expect(cargaIgualParaFuerza(-1, 1)).toBeNaN();
    expect(factorDeFuerza(2, 2, 0)).toBeNaN();
    expect(factorDeDistanciaParaIgualFuerza(0, 3)).toBeNaN();
  });

  test('los despejes son la inversa de la fuerza', async () => {
    const F = fuerzaCoulomb(3e-6, -7e-6, 0.42, 5).modulo;
    expect(distanciaParaFuerza(3e-6, -7e-6, F, 5)).toBeCloseTo(0.42, 12);
    expect(cargaParaFuerza(3e-6, F, 0.42, 5)).toBeCloseTo(7e-6, 15);
    const Figual = fuerzaCoulomb(4e-6, 4e-6, 0.8, 2).modulo;
    expect(cargaIgualParaFuerza(Figual, 0.8, 2)).toBeCloseTo(4e-6, 15);
  });

  test('COHERENCIA con simulador-campo-electrico: q₂·E de q₁ da la misma fuerza', async () => {
    // Aquel motor trabaja en nC y metros: +5 nC en el origen y −3 nC en (0,7; 0).
    const E = calcularCampoEnPunto(0.7, 0, [{ x: 0, y: 0, q: 5 }]);
    const fCampo = fuerzaSobreCarga(-3, E.Ex, E.Ey);
    const fAqui = fuerzaCoulomb(5e-9, -3e-9, 0.7);
    expect(fAqui.modulo / fCampo.F).toBeCloseTo(1, 12);
    // Y el sentido: atracción → la fuerza sobre q₂ apunta hacia q₁ (−x).
    expect(fCampo.Fx).toBeLessThan(0);
    expect(fAqui.fuerza).toBeLessThan(0);
  });

  test('formato: notación científica con superíndices y mantisa que no llega a 10', async () => {
    expect(cientifica(8.193e-8)).toBe('8,19 × 10⁻⁸');
    expect(cientifica(0.009996)).toBe('1,00 × 10⁻²');
    expect(cifraLegible(0.5993333)).toBe('0,599');
    expect(cifraLegible(-1234.5)).toBe('−1235');
    expect(cifraLegible(8.99e9)).toBe('8,99 × 10⁹');
  });
});

/* ═══════════════════════════════ Casos para clase ═══════════════════════════════ */

test.describe('simulador-ley-coulomb · casos para clase', () => {
  const ESPERADAS = [0.6, 4.5, 29.98, 5.01, 0.25, 0.44, 81.93, 1.44, 35.96, 6.77, 3.16, 3];

  test('1 · hay 12 casos con ids 1..12 sin huecos', async () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · deterministas: dos lecturas dan lo mismo', async () => {
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
      expect(redondearA(r.valor, 2), `caso ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('3.bis · y con la resuelta A MANO en la cabecera de este fichero', async () => {
    expect(CASOS.map((c) => c.respuesta)).toEqual(ESPERADAS);
  });

  test('4 · enunciado, etiqueta no vacía, respuesta finita, desarrollo y pista', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(60);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.respuesta, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(3);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', async () => {
    const prohibido =
      /\b(Espa[ñn]a|M[eé]xico|Colombia|Argentina|Chile|Per[uú]|Madrid|Barcelona|Bogot[aá]|Lima|Buenos Aires|euros?|d[oó]lares?)\b/i;
    for (const caso of CASOS) {
      expect(`${caso.titulo} ${caso.enunciado}`, `caso ${caso.id}`).not.toMatch(prohibido);
    }
  });

  test('5.bis · «redondea» aparece justo cuando la cifra exacta tiene más de dos decimales', async () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.includes('Redondea a dos decimales'), `caso ${caso.id}`).toBe(caso.requiereRedondeo);
      // El último paso enseña la cifra con los dos decimales que pide el enunciado.
      const ultimo = caso.pasos[caso.pasos.length - 1];
      expect(ultimo, `caso ${caso.id}`).toContain(caso.respuestaTexto);
    }
  });

  test('5.ter · los enunciados que usan k la declaran; los de proporcionalidad, no', async () => {
    for (const caso of CASOS) {
      const usaK = !caso.datos.pregunta.startsWith('factor');
      expect(caso.enunciado.includes('8,99·10⁹'), `caso ${caso.id}`).toBe(usaK);
    }
  });

  test('6 · aleatorio reproducible, VARIADO y con la misma aritmética que los fijos', async () => {
    const respuestas = new Set<number>();
    const tipos = new Set<string>();
    for (let s = 1; s <= 40; s += 1) {
      const a = generarEjercicioAleatorio(s);
      const b = generarEjercicioAleatorio(s);
      expect(b).toEqual(a);
      expect(Number.isFinite(a.respuesta)).toBe(true);
      expect(a.respuesta).toBeGreaterThanOrEqual(0.1);
      expect(a.respuesta).toBeLessThanOrEqual(1e4);
      expect(redondearA(resolverCaso(a.datos).valor, 2)).toBe(a.respuesta);
      expect(a.enunciado.includes('Redondea a dos decimales')).toBe(a.requiereRedondeo);
      respuestas.add(a.respuesta);
      tipos.add(a.datos.pregunta);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(tipos.size).toBeGreaterThanOrEqual(3);
  });

  test('7 · el convenio queda fijado: k = 8,99·10⁹, y 9·10⁹ entra en la tolerancia', async () => {
    // Caso 1 con k = 9·10⁹ da 0,6 exacto: la respuesta de libro se acepta.
    expect(comprobarRespuesta(0.6, CASOS[0].respuesta, CASOS[0].datos).correcto).toBe(true);
    // Caso 3 con k = 9·10⁹: r = √(9e9 · 9e-12 / 0,9) = 0,3 m = 30 cm.
    expect(comprobarRespuesta(30, CASOS[2].respuesta, CASOS[2].datos).correcto).toBe(true);
    // Caso 7 con la e exacta del SI (1,602…) y k = 9·10⁹: 82,25 nN, un 0,39 % más; se acepta.
    const exacto = (9e9 * 1.602176634e-19 ** 2) / 5.3e-11 ** 2 / 1e-9;
    expect(comprobarRespuesta(redondearA(exacto, 2), CASOS[6].respuesta, CASOS[6].datos).correcto).toBe(true);
  });

  test('errores con nombre propio: r sin cuadrado, centímetros, raíz olvidada, signo', async () => {
    // Caso 1 dividiendo entre r: 0,05394 / 0,3 = 0,1798 N.
    expect(comprobarRespuesta(0.18, CASOS[0].respuesta, CASOS[0].datos).motivo).toContain('r²');
    // Caso 2 con r = 20 (cm sin pasar): 0,1798 / 400 = 4,495·10⁻⁴ N.
    expect(comprobarRespuesta(0.00045, CASOS[1].respuesta, CASOS[1].datos).motivo).toContain('centímetros');
    // Caso 5 dividiendo entre 2 y no entre 4: 0,5.
    expect(comprobarRespuesta(0.5, CASOS[4].respuesta, CASOS[4].datos).motivo).toContain('CUADRADO');
    // Caso 12 sin raíz: 9.
    expect(comprobarRespuesta(9, CASOS[11].respuesta, CASOS[11].datos).motivo).toContain('raíz');
    // Un módulo con signo.
    const neg = comprobarRespuesta(-0.6, CASOS[0].respuesta, CASOS[0].datos);
    expect(neg.correcto).toBe(false);
    expect(neg.motivo).toContain('sin signo');
    // Y lo que no es número.
    expect(comprobarRespuesta(NaN, CASOS[0].respuesta, CASOS[0].datos).motivo).toContain('número');
  });

  test('8 · ningún título contiene la palabra de un botón de la página', async () => {
    const botones = /\b(Comprobar|Practicar|Calcular|Despejar|pista|soluci[oó]n|atraen|repelen)\b/i;
    for (const caso of CASOS) {
      expect(caso.titulo, `caso ${caso.id}`).not.toMatch(botones);
    }
  });

  test('guardas de texto: sin «de el» ni «a el»', async () => {
    for (const caso of CASOS) {
      const texto = `${caso.enunciado} ${caso.pasos.join(' ')}`;
      expect(texto, `caso ${caso.id}`).not.toMatch(/\b[DdAa]e? el\b(?! [a-záéíóú]+ de)/);
      expect(texto, `caso ${caso.id}`).not.toMatch(/\b[Dd]e el\b|\b[Aa] el\b/);
    }
  });
});

/* ═══════════════════════════════ En el navegador ═══════════════════════════════ */

test.describe('simulador-ley-coulomb · la página', () => {
  const resultado = (page: Page) => page.locator('section[aria-labelledby="resultado-titulo"]');
  const casos = (page: Page) => page.locator('section[aria-labelledby="casos-aula-titulo"]');

  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.locator('h1')).toHaveText('Ley de Coulomb: simulador y calculadora');
    await esperarHidratacion(page, ['#q1-valor', '#r-valor', '#casos-respuesta']);
  });

  test('arranque: +2 µC y −3 µC a 30 cm se atraen con 0,599 N', async ({ page }) => {
    await expect(resultado(page)).toContainText('0,599 N');
    await expect(resultado(page)).toContainText('Atracción');
    // 0,599 N es el peso de 0,599 / 9,8 = 0,06116 kg = 61,2 g.
    await expect(resultado(page)).toContainText('61,2 g');
  });

  test('cambiar el signo de q₂ convierte la atracción en repulsión con el mismo módulo', async ({ page }) => {
    await page.locator('#q2-valor').fill('3');
    await esperarValorEnReact(page, '#q2-valor', '3');
    await expect(resultado(page)).toContainText('Repulsión');
    await expect(resultado(page)).toContainText('0,599 N');
  });

  test('despejar la distancia rellena la fuerza actual y recupera los 30 cm', async ({ page }) => {
    await page.getByRole('button', { name: /Despejar la distancia/ }).click();
    // 0,599 N no llega a 1 N: se reescribe como 599 mN (tres cifras significativas).
    await expect(page.locator('#f-valor')).toHaveValue('599');
    // r = √(8,99e9 · 6e-12 / 0,599) = 0,30005 m → «0,300 m» y «30,0 cm».
    await expect(resultado(page)).toContainText('0,300 m');
    await expect(resultado(page)).toContainText('30,0 cm');
    await expect(page.locator('#r-valor')).toHaveCount(0);
  });

  test('despejar una carga: el signo lo decide «se atraen / se repelen»', async ({ page }) => {
    await page.getByRole('button', { name: /Despejar una carga/ }).click();
    await expect(page.getByRole('button', { name: 'Se atraen' })).toHaveAttribute('aria-pressed', 'true');
    // q₂ = −3 µC de vuelta (contraria a q₁ = +2 µC).
    await expect(resultado(page)).toContainText('−3,00 µC');
    await page.getByRole('button', { name: 'Se repelen' }).click();
    await expect(resultado(page)).toContainText('+3,00 µC');
  });

  test('el deslizador mueve la distancia sin cambiar la escala de la gráfica', async ({ page }) => {
    const grafica = page.locator('section[aria-labelledby="grafica-titulo"] svg');
    await expect(grafica).toContainText('30,0 cm');
    // Paso 100 de 200: r = 30 · (0,25 + 0,5 · 2,75) = 48,75 cm → el campo se reescribe «48,8».
    await page.locator('#deslizador-r').fill('100');
    await expect(page.locator('#r-valor')).toHaveValue('48,8');
    await expect(resultado(page)).not.toContainText('0,599 N');
    // La escala sigue anclada a los 30 cm escritos.
    await expect(grafica).toContainText('30,0 cm');
    await expect(grafica).toContainText('90,0 cm');
  });

  test('una distancia de cero se explica, no se pinta como cifra', async ({ page }) => {
    await page.locator('#r-valor').fill('0');
    await esperarValorEnReact(page, '#r-valor', '0');
    await expect(resultado(page).getByRole('alert')).toContainText('mayor que cero');
  });

  test('el medio: en agua la fuerza es 80 veces menor y se dice cuánto sería en el vacío', async ({ page }) => {
    await page.locator('#medio').selectOption('agua');
    // 0,59933 / 80 = 0,0074917 N → «0,00749 N»; en el vacío, 0,599 N.
    await expect(resultado(page)).toContainText('0,00749 N');
    await expect(resultado(page)).toContainText('80 veces más');
  });

  test('casos: el 1 se corrige, y un módulo con signo se explica', async ({ page }) => {
    await casos(page).getByRole('button', { name: /^Caso 1:/ }).click();
    await casos(page).locator('#casos-respuesta').fill('0,6');
    await casos(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(casos(page).getByRole('alert')).toContainText('Correcto');
    await casos(page).locator('#casos-respuesta').fill('-0,6');
    await casos(page).getByRole('button', { name: 'Comprobar' }).click();
    await expect(casos(page).getByRole('alert')).toContainText('sin signo');
  });
});
