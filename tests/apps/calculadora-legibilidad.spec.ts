import { test, expect, devices, type Locator, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Calculadora de Legibilidad — test de regresión (cabo C0276, 17/10/2026)
 *
 * QUÉ SE REPARÓ
 *   · El índice Flesch-Szigriszt llevaba 1,02 como coeficiente de palabras/frase. La fórmula
 *     publicada (Barrio-Cantalejo y otros, An. Sist. Sanit. Navar. 2008;31(2):135-152, apdo.
 *     «Material y métodos») es IFSZ = 206,835 − 62,3 × (sílabas/palabra) − palabras/frases.
 *   · «INFLESZ» se pintaba como un tercer índice con el MISMO número que Flesch-Szigriszt y se
 *     leía con una escala inventada de seis tramos (80/65/50/35/20). INFLESZ es la escala de
 *     cinco tramos del mismo artículo: Muy difícil <40 · Algo difícil 40-55 · Normal 55-65 ·
 *     Bastante fácil 65-80 · Muy fácil >80, con 55 como umbral para textos de salud.
 *
 * DE DÓNDE SALE CADA VALOR ESPERADO (calculado antes de abrir el navegador)
 *   CASO 1 — 20 palabras en UNA frase: 15 de dos sílabas sin diptongo (casa, perro, mesa, gato,
 *   libro, verde, lado, mano, pelo, rojo, sopa, cama, taza, vaso, nube) y 5 de tres (camino,
 *   pelota, ventana, zapato, cabeza) → 45 sílabas · sílabas/palabra = 2,25 · palabras/frase = 20
 *       IFSZ = 206,835 − 62,3 × 2,25 − 20 = 206,835 − 140,175 − 20 = 46,66 → «46,7»
 *       (con el 1,02 de antes: 46,26 → «46,3»)
 *       Fernández Huerta = 206,84 − 60 × 2,25 − 1,02 × 20 = 51,44 → «51,4»
 *       INFLESZ: 46,66 cae en 40-55 → «Algo difícil», por debajo del umbral de 55
 *   CASO 2 — las 10 primeras palabras de dos sílabas en UNA frase → 20 sílabas · 2 · 10
 *       IFSZ = 206,835 − 124,6 − 10 = 72,235 → «72,2» (antes: 72,035 → «72,0»)
 *       Fernández Huerta = 206,84 − 120 − 10,2 = 76,64 → «76,6»
 *       INFLESZ: 72,235 cae en 65-80 → «Bastante fácil» (la escala vieja decía «Fácil»)
 *
 * INSPECTOR 28/10/2026 — CASOS 6 a 9, resueltos a mano antes de abrir el navegador. Las
 * fórmulas son las que la propia app escribe en su bloque educativo y aplica motor.ts:
 *   IFSZ = 206,835 − 62,3 × (sílabas/palabras) − palabras/frases (Barrio-Cantalejo 2008)
 *   Fernández Huerta = 206,84 − 60 × (sílabas/palabras) − 1,02 × (palabras/frases); la app no
 *   cita la publicación de Fernández Huerta, así que solo se comprueba que aplica su fórmula.
 * Los que llevaban test.fail() eran hallazgos ABIERTOS de esta inspección; REPARADOS el
 * 28/10/2026 (3592-3608), ya sin test.fail(). El título conserva «ABIERTO» como rastro del caso:
 * cada uno sigue diciendo qué mide, y ahora pasa.
 */

const AREA = 'textarea';

const CASO_1 =
  'Casa perro mesa gato libro verde lado mano pelo rojo sopa cama taza vaso nube camino pelota ventana zapato cabeza.';
const CASO_2 = 'Casa perro mesa gato libro verde lado mano pelo rojo.';

async function analizar(page: Page, texto: string) {
  await page.locator(AREA).fill(texto);
  await esperarValorEnReact(page, AREA, texto);
  // El panel de resultados es el bloque más interno que contiene su encabezado
  return page
    .locator('div', { has: page.getByRole('heading', { name: 'Análisis de legibilidad' }) })
    .last();
}

test.describe('calculadora-legibilidad', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-legibilidad/');
    await esperarHidratacion(page, [AREA]);
  });

  test('CASO 1: Flesch-Szigriszt con coeficiente 1 y grado INFLESZ «Algo difícil»', async ({ page }) => {
    const panel = await analizar(page, CASO_1);
    await expect(panel).toContainText('20'); // palabras
    await expect(panel).toContainText('45'); // sílabas
    await expect(panel).toContainText('46,7');
    await expect(panel).not.toContainText('46,3');
    await expect(panel).toContainText('51,4');
    await expect(panel).toContainText('Algo difícil');
    await expect(panel).toContainText('Por debajo de 55');
  });

  test('CASO 2: escala INFLESZ de cinco tramos («Bastante fácil», no «Fácil»)', async ({ page }) => {
    const panel = await analizar(page, CASO_2);
    await expect(panel).toContainText('72,2');
    await expect(panel).not.toContainText('72,0');
    await expect(panel).toContainText('76,6');
    await expect(panel).toContainText('Bastante fácil');
    await expect(panel).toContainText('Supera 55');
  });

  /*
   * S0218 (21/10/2026) — la app SEÑALA dónde está la dificultad y compara dos versiones.
   *   Texto: una frase de 30 palabras de dos sílabas + «Casa perro mesa gato maravilla.»
   *   (maravilla = 4 sílabas) → P = 35 · F = 2 · S = 72
   *     IFSZ = 206,835 − 62,3 × 72/35 − 35/2 = 61,175 → «61,2»
   *     partida la de 30 en 2: F = 3 → 206,835 − 128,16 − 11,667 = 67,008 → «67,0», «+5,8»
   *   Al reescribirla de verdad en dos de 15, la comparación debe dar lo mismo que predijo.
   */
  const DIEZ = 'casa perro mesa gato libro verde lado mano pelo rojo'.split(' ');
  const trozo = (desde: number, n: number) =>
    Array.from({ length: n }, (_, i) => DIEZ[(desde + i) % 10]).join(' ');
  const frase = (desde: number, n: number) => {
    const t = trozo(desde, n);
    return t.charAt(0).toUpperCase() + t.slice(1) + '.';
  };
  const CORTA = 'Casa perro mesa gato maravilla.';
  const ORIGINAL = `${frase(0, 30)} ${CORTA}`;
  const REESCRITO = `${frase(0, 15)} ${frase(15, 15)} ${CORTA}`;

  test('CASO 4 (S0218): señala la frase de 30 palabras, lo que ganaría al partirla y «maravilla»', async ({ page }) => {
    const panel = await analizar(page, ORIGINAL);
    await expect(panel).toContainText('61,2');
    const seccion = page.locator('section', { has: page.getByRole('heading', { name: 'Dónde está la dificultad' }) });
    await expect(seccion).toContainText('1 frase de más de 25 palabras');
    await expect(seccion).toContainText('30 palabras. Partida en 2 frases de 20 palabras como mucho');
    await expect(seccion).toContainText('pasaría de 61,2 a 67,0 (+5,8)');
    await expect(seccion).toContainText('1 palabra de 4 sílabas o más: maravilla');
    // El texto resaltado es el texto entero, y la frase larga va en su propia marca
    const marcado = page.getByTestId('texto-marcado');
    await expect(marcado).toHaveText(ORIGINAL);
    await expect(marcado.locator('span', { hasText: frase(0, 30) })).toHaveCount(1);
  });

  test('CASO 5 (S0218): guardar, reescribir y comparar da lo que se había predicho', async ({ page }) => {
    await analizar(page, ORIGINAL);
    await page.getByRole('button', { name: 'Guardar esta versión para comparar' }).click();
    await analizar(page, REESCRITO);
    const tabla = page.locator('table', { has: page.getByRole('columnheader', { name: 'Guardada' }) });
    await expect(tabla.getByRole('row', { name: /Flesch-Szigriszt/ })).toContainText('61,267,0+5,8');
    await expect(tabla.getByRole('row', { name: /Frases de más de 25/ })).toContainText('10−1');
    await expect(tabla.getByRole('row', { name: /Palabras por frase/ })).toContainText('17,511,7−5,8');
    await expect(tabla.getByRole('row', { name: /Grado INFLESZ/ })).toContainText('NormalBastante fácilcambia');
    // Ya no queda frase larga que señalar
    const seccion = page.locator('section', { has: page.getByRole('heading', { name: 'Dónde está la dificultad' }) });
    await expect(seccion).not.toContainText('frase de más de 25 palabras');
    await page.getByRole('button', { name: 'Olvidar la guardada' }).click();
    await expect(tabla).toHaveCount(0);
  });

  test('CASO 3: la guía muestra los cinco tramos INFLESZ', async ({ page }) => {
    const guia = page
      .locator('div', { has: page.getByRole('heading', { name: /escala INFLESZ/ }) })
      .last();
    for (const tramo of ['80-100', '65-79', '55-64', '40-54', '0-39']) {
      await expect(guia).toContainText(tramo);
    }
    await expect(guia).not.toContainText('20-34');
  });
});

/* ─────────────────────────── Inspector 28/10/2026 ─────────────────────────── */

/*
 * CASO 6 (normal) — tres frases contadas a mano:
 *   «La legibilidad depende de la longitud de las frases y de las palabras.»
 *     La(1) le-gi-bi-li-dad(5) de-pen-de(3) de(1) la(1) lon-gi-tud(3) de(1) las(1) fra-ses(2)
 *     y(1) de(1) las(1) pa-la-bras(3) → 13 palabras, 24 sílabas
 *   «Los textos administrativos suelen emplear construcciones complicadas que dificultan la
 *   comprensión.» → Los(1) tex-tos(2) ad-mi-nis-tra-ti-vos(6) sue-len(2) em-ple-ar(3)
 *     cons-truc-cio-nes(4) com-pli-ca-das(4) que(1) di-fi-cul-tan(4) la(1) com-pren-sión(3)
 *     → 11 palabras, 31 sílabas
 *   «Conviene revisar cada párrafo antes de publicarlo.» → con-vie-ne(3) re-vi-sar(3) ca-da(2)
 *     pá-rra-fo(3) an-tes(2) de(1) pu-bli-car-lo(4) → 7 palabras, 18 sílabas
 *   Total: P = 31 · F = 3 · S = 73 → 73/31 = 2,354839 · 31/3 = 10,333
 *     IFSZ = 206,835 − 146,70645 − 10,33333 = 49,795 → «49,8», «Algo difícil» (40-55)
 *     FH   = 206,84 − 141,29032 − 10,54 = 55,0097 → «55,0»
 *   Palabras de 3+ sílabas: 14 de 31 = 45,16 % → «14 (45,2»
 *   Palabras de 4+ sílabas: legibilidad, administrativos, construcciones, complicadas,
 *   dificultan, publicarlo (6). Ninguna frase pasa de 25 palabras.
 */
const CASO_6 =
  'La legibilidad depende de la longitud de las frases y de las palabras. ' +
  'Los textos administrativos suelen emplear construcciones complicadas que dificultan la comprensión. ' +
  'Conviene revisar cada párrafo antes de publicarlo.';

/*
 * La misma idea reescrita (frase del medio partida y con palabras más cortas):
 *   «Muchos textos usan frases enredadas.» → 5 palabras, 2+2+2+2+4 = 12 sílabas
 *   «Cuesta entenderlos.» → 2 palabras, cues-ta(2) en-ten-der-los(4) = 6 sílabas
 *   P = 13 + 5 + 2 + 7 = 27 · F = 4 · S = 24 + 12 + 6 + 18 = 60
 *     IFSZ = 206,835 − 62,3 × 60/27 − 27/4 = 206,835 − 138,4444 − 6,75 = 61,6406 → «61,6»
 *     cambio = 61,6406 − 49,7952 = 11,8454 → «+11,8»
 */
const CASO_6_REESCRITO = CASO_6.replace(
  'Los textos administrativos suelen emplear construcciones complicadas que dificultan la comprensión.',
  'Muchos textos usan frases enredadas. Cuesta entenderlos.',
);

const DIEZ_PALABRAS = 'casa perro mesa gato libro verde lado mano pelo rojo'.split(' ');
/** n palabras de DOS sílabas sin diptongo, empezando en la posición «desde» de la lista. */
const relleno = (desde: number, n: number) =>
  Array.from({ length: n }, (_, i) => DIEZ_PALABRAS[(desde + i) % 10]).join(' ');
const conMayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const fraseDe = (desde: number, n: number) => `${conMayuscula(relleno(desde, n))}.`;

const metrica = (page: Page, rotulo: string) =>
  page.locator('[class*="metricCard"]', { hasText: new RegExp(`^\\d[\\d.,]*${rotulo}$`) });
/** La fila de un índice por su nombre exacto (la de INFLESZ también menciona «Flesch-Szigriszt»). */
const indice = (page: Page, nombre: string) =>
  page
    .locator('[class*="indiceItem"]')
    .filter({ has: page.locator('[class*="indiceName"]', { hasText: new RegExp(`^${nombre}$`) }) });

/** Contraste WCAG del texto de un elemento contra su fondo compuesto sobre sus ancestros. */
async function contraste(el: Locator): Promise<number> {
  // globals.css anima el fondo al cambiar de clase: se mide con la transición acabada
  await el.evaluate((n) => Promise.all(n.getAnimations().map((a) => a.finished)).then(() => true));
  return el.evaluate((n) => {
    const leer = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const capas: { r: number; g: number; b: number; a: number }[] = [];
    for (let x: Element | null = n; x; x = x.parentElement) {
      const c = leer(getComputedStyle(x).backgroundColor);
      if (c && c.a > 0) capas.push(c);
      if (c && c.a === 1) break;
    }
    let f = { r: 255, g: 255, b: 255 };
    for (let i = capas.length - 1; i >= 0; i--) {
      const c = capas[i];
      f = { r: c.r * c.a + f.r * (1 - c.a), g: c.g * c.a + f.g * (1 - c.a), b: c.b * c.a + f.b * (1 - c.a) };
    }
    const t = leer(getComputedStyle(n).color)!;
    const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const k = (v: number) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
    };
    const [a, b] = [lum(t), lum(f)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

test.describe('calculadora-legibilidad · Inspector 28/10/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-legibilidad/');
    await esperarHidratacion(page, [AREA]);
  });

  test('CASO 6 (normal): párrafo de tres frases contado a mano', async ({ page }) => {
    const panel = await analizar(page, CASO_6);
    await expect(metrica(page, 'Palabras')).toHaveText('31Palabras');
    await expect(metrica(page, 'Oraciones')).toHaveText('3Oraciones');
    await expect(metrica(page, 'Sílabas')).toHaveText('73Sílabas');
    await expect(metrica(page, 'Palabras/Oración')).toHaveText('10,3Palabras/Oración');
    await expect(indice(page, 'Flesch-Szigriszt')).toContainText('49,8');
    await expect(indice(page, 'Fernández Huerta')).toContainText('55,0');
    await expect(indice(page, 'Escala INFLESZ')).toContainText('Algo difícil');
    await expect(panel).toContainText('Por debajo de 55');
    await expect(panel).toContainText('2,35');
    await expect(panel).toContainText('14 (45,2');
    const seccion = page.locator('section[aria-labelledby="titulo-dificultad"]');
    await expect(seccion).toContainText(
      '6 palabras de 4 sílabas o más: legibilidad, administrativos, construcciones, complicadas, dificultan, publicarlo.',
    );
    await expect(seccion).not.toContainText('frase de más de 25 palabras');
  });

  test('CASO 7 (límite): una frase sin punto final cuenta como una frase', async ({ page }) => {
    // 6 palabras de dos sílabas, 1 frase → IFSZ = 206,835 − 124,6 − 6 = 76,235 → «76,2»
    // FH = 206,84 − 120 − 6,12 = 80,72 → «80,7» · INFLESZ 65-80 → «Bastante fácil»
    await analizar(page, 'Casa perro mesa gato libro verde');
    await expect(metrica(page, 'Palabras')).toHaveText('6Palabras');
    await expect(metrica(page, 'Oraciones')).toHaveText('1Oraciones');
    await expect(metrica(page, 'Sílabas')).toHaveText('12Sílabas');
    await expect(indice(page, 'Flesch-Szigriszt')).toContainText('76,2');
    await expect(indice(page, 'Fernández Huerta')).toContainText('80,7');
    await expect(indice(page, 'Escala INFLESZ')).toContainText('Bastante fácil');
  });

  test('CASO 7b (límite) ABIERTO: con 20 caracteres no analiza y pide «al menos 20»', async ({ page }) => {
    // «Casa perro mesa gato» = 20 caracteres. El aviso promete el análisis desde 20 y el
    // motor lo da desde 21 (texto.trim().length > 20). Pasa si se analiza o si el aviso
    // deja de decir «al menos 20».
    const panel = await analizar(page, 'Casa perro mesa gato');
    await expect(page.locator('[class*="charInfo"]')).toContainText('20 caracteres');
    await expect(panel).not.toContainText('al menos 20 caracteres');
  });

  test('CASO 7c (límite) ABIERTO: el círculo redondea a 55 una puntuación «por debajo de 55»', async ({ page }) => {
    // Frases de 27 y 28 palabras de dos sílabas: P = 55 · F = 2 · S = 110
    //   IFSZ = 206,835 − 124,6 − 27,5 = 54,735 → «Algo difícil», «Por debajo de 55»
    // El círculo pinta Math.round(54,735) = «55» al lado de «Por debajo de 55».
    await analizar(page, `${fraseDe(0, 27)} ${fraseDe(7, 28)}`);
    await expect(indice(page, 'Flesch-Szigriszt')).toContainText('54,7');
    await expect(page.locator('[class*="scoreNivel"]')).toContainText('Por debajo de 55');
    await expect(page.locator('[class*="scoreValue"]')).not.toHaveText('55');
  });

  test('CASO 7d (límite) ABIERTO: el punto de millar de «3.500» parte la frase en dos', async ({ page }) => {
    // 24 palabras de dos sílabas y la cifra «3.500», en UNA frase: P = 25 · F = 1 · S = 48
    // (la cifra cuenta como palabra sin sílabas, el criterio declarado del motor)
    //   IFSZ = 206,835 − 62,3 × 1,92 − 25 = 62,219 → «62,2», igual que con «3500»
    // La app corta en el punto del millar: F = 2 → 74,719 → «74,7».
    await analizar(page, `${conMayuscula(relleno(0, 12))} 3.500 ${relleno(2, 12)}.`);
    await expect(metrica(page, 'Oraciones')).toHaveText('1Oraciones');
    await expect(indice(page, 'Flesch-Szigriszt')).toContainText('62,2');
  });

  test('CASO 7e (límite) ABIERTO: la raya de un inciso cuenta como palabra sin sílabas', async ({ page }) => {
    // «Casa perro — mesa gato — libro verde — lado mano.» tiene 8 palabras, como su versión
    // con comas: S = 16 · F = 1 → IFSZ = 206,835 − 124,6 − 8 = 74,235 → «74,2».
    // La app cuenta las 3 rayas como palabras: P = 11 → 100,0 «Muy fácil».
    await analizar(page, 'Casa perro — mesa gato — libro verde — lado mano.');
    await expect(metrica(page, 'Palabras')).toHaveText('8Palabras');
    await expect(indice(page, 'Flesch-Szigriszt')).toContainText('74,2');
  });

  test('CASO 7f (límite) ABIERTO: la «u» muda de qu/gu se cuenta como vocal', async ({ page }) => {
    // quie-ro(2) que(1) ven-gas(2) a-quí(2) con(1) quien(1) quie-ras(2) = 11 sílabas.
    // La app da quiero 3, aquí 3, quien 2, quieras 3 → 15.
    await analizar(page, 'Quiero que vengas aquí con quien quieras.');
    await expect(metrica(page, 'Sílabas')).toHaveText('11Sílabas');
  });

  test('CASO 7g (S0218) ABIERTO: el resaltado señala como de 4 sílabas palabras que tienen 3', async ({ page }) => {
    // si-guien-tes, a-lum-nos, re-quie-ren, quí-mi-ca: ninguna llega a 4 sílabas.
    // La app marca siguientes, requieren y química (mismo defecto que el CASO 7f).
    await analizar(page, 'Los siguientes alumnos requieren química.');
    const seccion = page.locator('section[aria-labelledby="titulo-dificultad"]');
    await expect(seccion).toContainText('no hay palabras de 4 sílabas o más');
  });

  test('CASO 8 (rechazo) ABIERTO: un texto sin una sola letra sale «Muy fácil»', async ({ page }) => {
    // «2024 2025 2026 2027 2028»: 0 sílabas, nada que leer. La app da 100,0, «Muy fácil» y
    // «Excelente legibilidad». Debe rechazarlo o avisar, no puntuarlo.
    const panel = await analizar(page, '2024 2025 2026 2027 2028');
    await expect(panel).not.toContainText('Excelente legibilidad');
    await expect(panel).not.toContainText('Muy fácil');
  });

  test('CASO 9 ABIERTO: «Cargar ejemplo» sustituye el texto escrito sin preguntar', async ({ page }) => {
    // Con texto propio en la caja, el botón lo borra sin confirmación y Ctrl+Z no lo devuelve.
    // Pasa si pregunta (aquí se cancela) o si no pisa el texto.
    page.on('dialog', (d) => void d.dismiss());
    const propio = 'Este es mi texto propio, escrito con calma durante un buen rato.';
    await analizar(page, propio);
    await page.getByRole('button', { name: 'Cargar ejemplo' }).click();
    await expect(page.locator(AREA)).toHaveValue(propio);
  });

  test('ABIERTO: las insignias de los índices no llegan a 4,5:1 en claro', async ({ page }) => {
    // Texto de 14,4 px en negrita (no es «texto grande»): exige 4,5:1. Con el CASO 6, la
    // insignia naranja de Flesch-Szigriszt («49,8») da 1,84:1 (#f59e0b sobre su tinte al 20 %).
    await analizar(page, CASO_6);
    const insignia = indice(page, 'Flesch-Szigriszt').locator('[class*="indiceScore"]');
    expect(await contraste(insignia)).toBeGreaterThanOrEqual(4.5);
  });

  test('ABIERTO: «Recomendaciones» sale vacío en el tramo «Normal»', async ({ page }) => {
    // Una frase de 25 palabras de dos sílabas: IFSZ = 206,835 − 124,6 − 25 = 57,235 → «Normal»;
    // ni frases de más de 25 de media, ni más del 30 % de palabras largas, ni < 55 ni ≥ 65:
    // ninguna de las cuatro recomendaciones aplica y la caja queda con el título y nada debajo.
    await analizar(page, fraseDe(0, 25));
    await expect(indice(page, 'Flesch-Szigriszt')).toContainText('57,2');
    const caja = page.locator('[class*="sugerencias"]');
    await expect(caja).toBeVisible();
    await expect(caja.locator('li')).not.toHaveCount(0);
  });

  test('ABIERTO: el área de texto no tiene etiqueta, solo el placeholder', async ({ page }) => {
    const etiquetada = await page
      .locator(AREA)
      .evaluate((el: HTMLTextAreaElement) =>
        (el.labels?.length ?? 0) > 0 || !!el.getAttribute('aria-label') || !!el.getAttribute('aria-labelledby'),
      );
    expect(etiquetada).toBe(true);
  });

  test('ABIERTO: el porcentaje de palabras largas va pegado al «%»', async ({ page }) => {
    // 14 de 31 = 45,16 % → «45,2 %» con espacio (CLAUDE.md global §2, 25/09/2026)
    const panel = await analizar(page, CASO_6);
    await expect(panel).toContainText(/45,2\s%/);
  });
});

/*
 * Móvil: el mismo CASO 6 y la comparación con la versión reescrita, con el pulgar. Se
 * enumeran las opciones del Pixel 7 sin su defaultBrowserType (que forzaría otro worker).
 */
test.describe('calculadora-legibilidad · móvil (Inspector 28/10/2026)', () => {
  test.use({
    viewport: devices['Pixel 7'].viewport,
    userAgent: devices['Pixel 7'].userAgent,
    deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-legibilidad/');
    await esperarHidratacion(page, [AREA]);
  });

  test('CASO 6 en móvil: resultado, comparación y sin desbordar el ancho', async ({ page }) => {
    await analizar(page, CASO_6);
    await expect(indice(page, 'Flesch-Szigriszt')).toContainText('49,8');
    await page.getByRole('button', { name: 'Guardar esta versión para comparar' }).tap();
    await analizar(page, CASO_6_REESCRITO);
    const tabla = page.locator('table', { has: page.getByRole('columnheader', { name: 'Guardada' }) });
    await expect(tabla.getByRole('row', { name: /Flesch-Szigriszt/ })).toContainText('49,861,6+11,8');
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde).toBeLessThanOrEqual(0);
  });
});

/*
 * REPARADOS el 28/10/2026 — los hallazgos de contenido y de presentación sin caso en el navegador
 * de la tanda (3592-3608). Cada aserción nombra su hallazgo.
 */
test.describe('calculadora-legibilidad · reparación 28/10/2026', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-legibilidad/');
    await esperarHidratacion(page, [AREA]);
  });

  test('3592: abreviaturas, millar y «…» — frases contadas como se leen', async ({ page }) => {
    // «El Sr. García y la Dra. Pérez llegaron a la casa de campo.» es UNA frase
    await analizar(page, 'El Sr. García y la Dra. Pérez llegaron a la casa de campo.');
    await expect(metrica(page, 'Oraciones')).toHaveText('1Oraciones');
    // «…» seguido de mayúscula cierra frase, como «...»
    await analizar(page, 'Llegó tarde… Nadie lo esperaba en la casa.');
    await expect(metrica(page, 'Oraciones')).toHaveText('2Oraciones');
    // «…» seguido de minúscula no cierra (el caso del hallazgo): 25 palabras en UNA frase
    await analizar(page, `${conMayuscula(relleno(0, 2))} … ${relleno(0, 2)} 3.500 ${relleno(2, 2)} … ${relleno(2, 18)}.`);
    await expect(metrica(page, 'Oraciones')).toHaveText('1Oraciones');
  });

  test('3605: la FAQ visible y el FAQPage son el mismo texto', async ({ page }) => {
    const faq = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        const o = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
        if (o['@type'] === 'FAQPage') return o.mainEntity ?? [];
      }
      return [];
    });
    const visibles = await page.locator('[class*="faqQuestion"]').allTextContents();
    const respuestas = await page.locator('[class*="faqAnswer"]').allTextContents();
    expect(faq.map((q) => q.name)).toEqual(visibles);
    expect(faq.map((q) => q.acceptedAnswer.text)).toEqual(respuestas);
  });

  test('3602, 3603 y 3606: sin las cifras que no tenían fuente', async ({ page }) => {
    const html = await page.content();
    for (const sinFuente of [
      'Nielsen Norman',
      'mínima de 60',
      'Legal / Médico',
      'superior a 65 generalmente cumple',
      'el 65% del tráfico',
      '3 de cada 4 usuarios',
      'Libro de Estilo del País',
      'un 20% respecto al desktop',
    ]) {
      expect(html, `sigue «${sinFuente}»`).not.toContain(sinFuente);
    }
  });

  test('3604 y 3608: Fernández Huerta sin los colores de INFLESZ y el círculo redondo', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await analizar(page, CASO_6);
    const fh = indice(page, 'Fernández Huerta').locator('[class*="indiceScore"]');
    await expect(fh).not.toHaveClass(/normal|facil|dificil/);
    const caja = (await page.locator('[class*="scoreCircle"]').boundingBox())!;
    expect(Math.round(caja.width)).toBe(Math.round(caja.height));
  });
});
