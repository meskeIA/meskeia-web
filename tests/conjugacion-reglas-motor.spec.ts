import { test, expect } from '@playwright/test';
import { conjugarVerbo, esIrregular, analizarEntrada, buscarVerbos } from '../app/conjugador-verbos/motorConjugacion';

/**
 * Reglas para lo que NO está en la tabla de irregulares — casos resueltos A MANO (11/11/2026).
 *
 * De dónde sale: la inspección del 11/11/2026 (hallazgos 4418, 4419, 4420 y 4422) encontró que
 * todo verbo fuera de los 66 de la tabla se conjugaba pegando raíz y desinencia («buscé», «cogo»,
 * «volo», «manteno», «componido») y que «oír» y cualquier -ír se rechazaban. El oráculo es la
 * morfología del español, no la salida del motor:
 *
 *   ortografía   c→qu, g→gu, z→c, gu→gü ante e; g→j, c→z, gu→g ante a/o; i átona entre vocales → y
 *   hiato        envío, actúo, reúno; y los monosílabos sin tilde de la Ortografía de 2010 (crie, crio)
 *   patrones     e→ie y o→ue en las tónicas; e→i y o→u de los -ir; -zc-; -uy-; -duje
 *   derivados    mantener ← tener (mantén), prever ← ver (prevé), predecir (predice), bendecir (bendeciré)
 */

const YO = 0;
const EL = 2;
const ELLOS = 5;

function c(verbo: string) {
  const conj = conjugarVerbo(verbo);
  expect(conj, `«${verbo}» debería conjugarse`).not.toBeNull();
  return conj!;
}

test.describe('Regulares con cambio ortográfico (hallazgo 4418)', () => {
  test('c→qu, g→gu, z→c y gu→gü ante e', () => {
    expect(c('buscar').indicativo.preterito_indefinido[YO]).toBe('busqué');
    expect(c('buscar').subjuntivo.presente).toEqual(['busque', 'busques', 'busque', 'busquemos', 'busquéis', 'busquen']);
    expect(c('buscar').imperativo.afirmativo).toEqual(['-', 'busca', 'busque', 'busquemos', 'buscad', 'busquen']);
    expect(c('llegar').indicativo.preterito_indefinido[YO]).toBe('llegué');
    expect(c('cruzar').indicativo.preterito_indefinido[YO]).toBe('crucé');
    expect(c('averiguar').indicativo.preterito_indefinido[YO]).toBe('averigüé');
  });

  test('g→j, c→z, gu→g y qu→c ante a/o', () => {
    expect(c('coger').indicativo.presente[YO]).toBe('cojo');
    expect(c('coger').subjuntivo.presente[YO]).toBe('coja');
    expect(c('vencer').indicativo.presente[YO]).toBe('venzo');
    expect(c('distinguir').indicativo.presente[YO]).toBe('distingo');
    expect(c('distinguir').indicativo.presente[EL]).toBe('distingue');
    expect(c('delinquir').indicativo.presente[YO]).toBe('delinco');
  });

  test('hiato de -iar y -uar, y monosílabos sin tilde', () => {
    expect(c('enviar').indicativo.presente).toEqual(['envío', 'envías', 'envía', 'enviamos', 'enviáis', 'envían']);
    expect(c('enviar').subjuntivo.presente[YO]).toBe('envíe');
    expect(c('actuar').indicativo.presente[YO]).toBe('actúo');
    expect(c('cambiar').indicativo.presente[YO]).toBe('cambio');
    expect(c('reunir').indicativo.presente[YO]).toBe('reúno');
    // Ortografía de 2010: «crie», «crio» y «criais» son monosílabos y no llevan tilde.
    expect(c('criar').indicativo.preterito_indefinido[YO]).toBe('crie');
    expect(c('criar').indicativo.preterito_indefinido[EL]).toBe('crio');
    expect(c('criar').indicativo.presente[4]).toBe('criais');
    expect(c('criar').indicativo.presente[YO]).toBe('crío');
  });

  test('-eer: i átona entre vocales → y, i tónica con tilde', () => {
    const poseer = c('poseer');
    expect(poseer.indicativo.preterito_indefinido).toEqual(['poseí', 'poseíste', 'poseyó', 'poseímos', 'poseísteis', 'poseyeron']);
    expect(poseer.gerundio).toBe('poseyendo');
    expect(poseer.participio).toBe('poseído');
    expect(poseer.subjuntivo.preterito_imperfecto[YO]).toBe('poseyera');
  });

  test('un cambio solo ortográfico no hace irregular al verbo', () => {
    expect(esIrregular('buscar')).toBe(false);
    expect(esIrregular('enviar')).toBe(false);
  });
});

test.describe('Irregulares de patrón y derivados (hallazgo 4419)', () => {
  test('diptongación e→ie y o→ue en las formas tónicas', () => {
    expect(c('volar').indicativo.presente).toEqual(['vuelo', 'vuelas', 'vuela', 'volamos', 'voláis', 'vuelan']);
    expect(c('despertar').indicativo.presente[YO]).toBe('despierto');
    expect(c('almorzar').indicativo.presente[YO]).toBe('almuerzo');
    expect(c('almorzar').indicativo.preterito_indefinido[YO]).toBe('almorcé');
    expect(c('almorzar').subjuntivo.presente[YO]).toBe('almuerce');
    expect(c('llover').indicativo.presente[EL]).toBe('llueve');
    expect(c('oler').indicativo.presente[YO]).toBe('huelo');
    expect(c('errar').indicativo.presente[YO]).toBe('yerro');
    expect(esIrregular('volar')).toBe(true);
  });

  test('los de -ir cierran la vocal en las átonas', () => {
    const divertir = c('divertir');
    expect(divertir.indicativo.presente[YO]).toBe('divierto');
    expect(divertir.indicativo.preterito_indefinido[ELLOS]).toBe('divirtieron');
    expect(divertir.subjuntivo.presente[3]).toBe('divirtamos');
    expect(divertir.gerundio).toBe('divirtiendo');
    expect(c('corregir').indicativo.presente[YO]).toBe('corrijo');
    expect(c('conseguir').indicativo.presente[YO]).toBe('consigo');
    expect(c('conseguir').indicativo.preterito_indefinido[EL]).toBe('consiguió');
    expect(c('teñir').indicativo.preterito_indefinido[EL]).toBe('tiñó');
    expect(c('teñir').gerundio).toBe('tiñendo');
  });

  test('-zc-, -duje y -uy-', () => {
    expect(c('agradecer').indicativo.presente[YO]).toBe('agradezco');
    expect(c('agradecer').subjuntivo.presente[3]).toBe('agradezcamos');
    expect(c('deducir').indicativo.presente[YO]).toBe('deduzco');
    expect(c('deducir').indicativo.preterito_indefinido).toEqual(['deduje', 'dedujiste', 'dedujo', 'dedujimos', 'dedujisteis', 'dedujeron']);
    const contribuir = c('contribuir');
    expect(contribuir.indicativo.presente).toEqual(['contribuyo', 'contribuyes', 'contribuye', 'contribuimos', 'contribuís', 'contribuyen']);
    expect(contribuir.gerundio).toBe('contribuyendo');
    expect(contribuir.participio).toBe('contribuido');
  });

  test('derivados de un irregular de la tabla, con la tilde de la aguda', () => {
    const mantener = c('mantener');
    expect(mantener.indicativo.presente[YO]).toBe('mantengo');
    expect(mantener.indicativo.preterito_indefinido[YO]).toBe('mantuve');
    expect(mantener.indicativo.futuro[YO]).toBe('mantendré');
    expect(mantener.imperativo.afirmativo[1]).toBe('mantén');
    expect(c('suponer').indicativo.preterito_indefinido[YO]).toBe('supuse');
    expect(c('suponer').participio).toBe('supuesto');
    expect(c('componer').participio).toBe('compuesto');
    expect(c('prever').indicativo.presente).toEqual(['preveo', 'prevés', 'prevé', 'prevemos', 'prevéis', 'prevén']);
    expect(c('prever').indicativo.preterito_indefinido[EL]).toBe('previó');
    expect(c('predecir').imperativo.afirmativo[1]).toBe('predice');
    expect(c('bendecir').indicativo.futuro[YO]).toBe('bendeciré');
    expect(c('bendecir').indicativo.presente[YO]).toBe('bendigo');
    expect(c('bendecir').participio).toBe('bendecido');
    expect(esIrregular('mantener')).toBe(true);
  });

  test('los participios irregulares los heredan los derivados (lo que dice la FAQ de la página)', () => {
    expect(c('devolver').indicativo.presente[YO]).toBe('devuelvo');
    expect(c('devolver').participio).toBe('devuelto');
    expect(c('resolver').participio).toBe('resuelto');
    expect(c('describir').participio).toBe('descrito');
    expect(c('descubrir').participio).toBe('descubierto');
  });
});

test.describe('Infinitivos en -ír (hallazgo 4420)', () => {
  test('oír, reír, sonreír y freír se aceptan y conjugan', () => {
    expect(c('oír').indicativo.presente).toEqual(['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen']);
    expect(c('reír').indicativo.presente).toEqual(['río', 'ríes', 'ríe', 'reímos', 'reís', 'ríen']);
    expect(c('sonreír').indicativo.presente[YO]).toBe('sonrío');
    // «rio» es monosílabo; con el prefijo, aguda en vocal: «sonrió».
    expect(c('sonreír').indicativo.preterito_indefinido[EL]).toBe('sonrió');
    expect(c('sonreír').subjuntivo.presente[4]).toBe('sonriáis');
    expect(c('freír').participio).toBe('frito');
  });
});

test.describe('Lo que no es un verbo y los pronominales (hallazgo 4422)', () => {
  test('palabras que no son verbos aunque acaben en -ar/-er', () => {
    for (const palabra of ['mujer', 'ayer', 'xyzar', 'ar', 'mesa', 'cáncer']) {
      expect(conjugarVerbo(palabra), palabra).toBeNull();
    }
  });

  test('un pronominal se conjuga como su base y lo explica', () => {
    const r = analizarEntrada('levantarse');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.conjugacion.infinitivo).toBe('levantar');
    expect(r.nota).toContain('me levanto');
  });

  test('el buscador propone primero lo que empieza por lo tecleado', () => {
    expect(buscarVerbos('ir')[0]).toBe('ir');
    expect(buscarVerbos('ten')[0]).toBe('tener');
  });
});
