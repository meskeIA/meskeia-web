/**
 * Tests unitarios del motor de escansión — `app/contador-silabas/metrica.ts`
 *
 * El build no puede ver una métrica mal, así que el motor se prueba aparte de la vista y
 * contra POEMAS ENTEROS de métrica conocida y publicada: si una regla nueva arregla un verso
 * y rompe otro, aquí se ve en el acto. Ninguna cuenta sale del código: todas están resueltas
 * a mano, y las que exigen criterio llevan escrito el porqué.
 *
 * De dónde salen los textos (todos de dominio público):
 *   · Quevedo, «A una nariz» — soneto, 14 endecasílabos
 *   · Fray Luis de León, «Vida retirada» — lira: 7a 11B 7a 7b 11B
 *   · Garcilaso, soneto XXIII — endecasílabos; la propia app lo propone como banco de pruebas
 *   · Romance del prisionero — serie de octosílabos (grafía antigua: «faze», no «hace»)
 *   · Sor Juana, «Hombres necios» — redondilla de octosílabos
 *
 * Ejecutar con: npx playwright test tests/metrica-verso.spec.ts
 */
import { test, expect } from '@playwright/test';
import { analizarVerso, contarSilabasTexto } from '../app/contador-silabas/metrica';

/** Sílabas métricas de un verso, o −1 si la línea no tiene palabras. */
const medir = (verso: string): number => analizarVerso(verso)?.silabasMetricas ?? -1;

/** Las sinalefas detectadas, en el formato «vocal_vocal» que la app enseña. */
const sinalefasDe = (verso: string): string[] =>
  (analizarVerso(verso)?.sinalefas ?? []).map((s) => s.texto);

test.describe('Soneto de Quevedo — catorce endecasílabos', () => {
  const SONETO = [
    'Érase un hombre a una nariz pegado,',
    'érase una nariz superlativa,',
    'érase una nariz sayón y escriba,',
    'érase un peje espada muy barbado.',
    'Era un reloj de sol mal encarado,',
    'érase una alquitara pensativa,',
    'érase un elefante boca arriba,',
    'era Ovidio Nasón más narizado.',
    'Érase el espolón de una galera,',
    'érase una pirámide de Egipto,',
    'las doce tribus de narices era.',
    'Érase un naricísimo infinito,',
    'frisón archinariz, caratulera,',
    'sabañón garrafal, morado y frito.',
  ];

  test('los catorce versos miden 11', () => {
    for (const verso of SONETO) expect({ verso, n: medir(verso) }).toEqual({ verso, n: 11 });
  });

  /**
   * HALLAZGO 260 — la sinalefa TRIPLE. «hom-bre a u-na»: tres vocales en contacto que se
   * funden en una sola sílaba métrica. 14 fonéticas − 3 contactos (se_un, bre_a, a_u) = 11.
   * El motor saltaba la palabra siguiente entera para no encadenar, daba 12 y rotulaba
   * dodecasílabo el primer verso del soneto que la propia app ofrece como ejemplo.
   */
  test('el primer verso encadena tres vocales y sigue siendo endecasílabo', () => {
    const a = analizarVerso(SONETO[0])!;
    expect(a.silabasFoneticas).toBe(14);
    expect(sinalefasDe(SONETO[0])).toEqual(['e_u', 'e_a', 'a_u']);
    expect(a.silabasMetricas).toBe(11);
  });

  /**
   * HALLAZGO 257 — dos sinalefas INDEPENDIENTES separadas por una palabra bisílaba. En
   * «érase una alquitara», la «u» de «u-na» funde hacia atrás y su «a» final hacia delante:
   * son vocales distintas y dos fusiones distintas. 13 − 2 = 11.
   */
  test('dos sinalefas seguidas e independientes cuentan las dos', () => {
    const a = analizarVerso(SONETO[5])!;
    expect(a.silabasFoneticas).toBe(13);
    expect(sinalefasDe(SONETO[5])).toEqual(['e_u', 'a_a']);
    expect(a.silabasMetricas).toBe(11);
  });

  /**
   * La conjunción «y» SIN vocal a la izquierda («sayón» acaba en n) sí funde por la derecha:
   * se consonantiza en [j] y deja de ser sílaba. 13 fonéticas − 2 = 11.
   */
  test('la conjunción «y» funde por la derecha cuando no ha fundido por la izquierda', () => {
    expect(sinalefasDe(SONETO[2])).toEqual(['e_u', 'y_e']);
    expect(medir(SONETO[2])).toBe(11);
  });
});

test.describe('Lira de Fray Luis — 7a 11B 7a 7b 11B', () => {
  const LIRA: [string, number][] = [
    ['Qué descansada vida', 7],
    ['la del que huye del mundanal ruido,', 11],
    ['y sigue la escondida', 7],
    ['senda por donde han ido', 7],
    ['los pocos sabios que en el mundo han sido', 11],
  ];

  test('cada verso mide lo que la estrofa exige', () => {
    for (const [verso, n] of LIRA) expect({ verso, n: medir(verso) }).toEqual({ verso, n });
  });

  /**
   * HALLAZGO 258 — «huy-» suena [j] igual que «hue-», «hui-» y «hie-», así que bloquea la
   * sinalefa: «que huye» NO funde. Con la fusión salían 10 y la lira exige ahí un 11B.
   */
  test('«huy-» bloquea la sinalefa, como el resto de haches consonánticas', () => {
    expect(sinalefasDe('la del que huye del mundanal ruido')).toEqual([]);
    expect(medir('que huyeron los soldados')).toBe(8);
    // Y la h muda sigue fundiendo, que es lo que hace correcta la excepción
    expect(sinalefasDe('la del que hierve del mundanal ruido')).toEqual([]);
    expect(sinalefasDe('senda por donde han ido')).toEqual(['e_h']);
  });
});

test.describe('Octosílabos', () => {
  const ROMANCE: [string, number][] = [
    ['Que por mayo era por mayo', 8],
    ['cuando faze la calor', 8],
    ['cuando los trigos encañan', 8],
    ['y están los campos en flor', 8],
    ['cuando canta la calandria', 8],
    ['y responde el ruiseñor', 8],
  ];

  test('el romance del prisionero es una serie de octosílabos', () => {
    for (const [verso, n] of ROMANCE) expect({ verso, n: medir(verso) }).toEqual({ verso, n });
  });

  /**
   * HALLAZGO 262 — con la grafía modernizada «cuando hace la calor», la h es muda, hay
   * sinalefa y el verso sale heptasílabo. El motor acierta en los dos casos: lo que estaba
   * mal era el texto del ejemplo, no la cuenta.
   */
  test('la grafía moderna del mismo verso sí funde, y por eso da 7', () => {
    expect(sinalefasDe('cuando hace la calor')).toEqual(['o_h']);
    expect(medir('cuando hace la calor')).toBe(7);
  });

  test('la redondilla de Sor Juana también son octosílabos', () => {
    for (const verso of [
      'Hombres necios que acusáis',
      'a la mujer sin razón,',
      'sin ver que sois la ocasión',
      'de lo mismo que culpáis',
    ]) {
      expect({ verso, n: medir(verso) }).toEqual({ verso, n: 8 });
    }
  });
});

/**
 * El caso que fija el límite del encadenamiento, y que la propia app propone como banco de
 * pruebas en su bloque educativo: el soneto XXIII de Garcilaso es endecasílabo. Entre dos
 * vocales, la conjunción «y» ahorra UNA sílaba, no dos, porque se lee [ro-sa-ja-θu-θe-na].
 * Si el motor encadenara también aquí, el verso saldría decasílabo.
 */
test('«En tanto que de rosa y azucena» es endecasílabo, no decasílabo', () => {
  const a = analizarVerso('En tanto que de rosa y azucena')!;
  expect(a.silabasFoneticas).toBe(12);
  expect(sinalefasDe('En tanto que de rosa y azucena')).toEqual(['a_y']);
  expect(a.silabasMetricas).toBe(11);
});

test('la «y» final de «hoy» o «rey» sí es semivocal plena y funde', () => {
  expect(sinalefasDe('hoy es lunes')).toEqual(['y_e']);
  expect(sinalefasDe('el rey ha muerto')).toEqual(['y_h']);
});

test('el ajuste por acento final se aplica sobre el recuento ya fundido', () => {
  // «¿Qué es la vida? Un frenesí» — 8 fonéticas − 2 sinalefas (e_e, a_u) + 1 (aguda) = 7...
  // no: qué(1) es(1) la(1) vi-da(2) un(1) fre-ne-sí(3) = 9 − 2 + 1 = 8, octosílabo agudo.
  const a = analizarVerso('¿Qué es la vida? Un frenesí')!;
  expect(a.silabasFoneticas).toBe(9);
  expect(a.sinalefas).toHaveLength(2);
  expect(a.acentuacion).toBe('aguda');
  expect(a.silabasMetricas).toBe(8);
});

// ═══════════════════════════════════════════════════════════════════════════
// Inspector 10/09/2026 — hallazgos 702 y 703, reparados
// ═══════════════════════════════════════════════════════════════════════════

/**
 * HALLAZGO 702 — la h final es MUDA, igual que la inicial.
 *
 * `terminaEnVocal()` miraba el último CARÁCTER y veía una «h», mientras `empiezaPorVocal()`
 * sí la saltaba: la misma regla de la OLE 2010 aplicada por un solo lado. El universo
 * práctico son las interjecciones (oh, ah, eh), donde el poeta deshace a menudo la fusión,
 * pero la app declara detectar «toda sinalefa posible» y marcar las deshacibles: no verla
 * siquiera le quitaba al usuario la decisión.
 *
 * A mano: oh‿al-ma mí-a → 5 fonéticas − 1 sinalefa = 4 métricas, palabra llana, sin ajuste.
 */
test('la h FINAL no bloquea la sinalefa: es muda por los dos lados', () => {
  const a = analizarVerso('oh alma mía')!;
  expect(a.silabasFoneticas).toBe(5);
  expect(sinalefasDe('oh alma mía')).toEqual(['h_a']);
  expect(a.silabasMetricas).toBe(4);

  // La h inicial ya funcionaba, y tiene que seguir funcionando igual
  expect(sinalefasDe('la hoja alta')).toEqual(['a_h', 'a_a']);
  // Y la h consonántica de «hue-/hui-/hie-/huy-» sigue bloqueando
  expect(sinalefasDe('la huella')).toEqual([]);
});

/**
 * HALLAZGO 703 — la diéresis poética no puede partir la palabra en dos.
 *
 * El extractor era una lista cerrada de caracteres sin la «ï», así que «vïuda» salía como
 * dos palabras inventadas, «v» y «uda», la primera con una «sílaba» que no tiene ninguna
 * vocal. Ahora las palabras son rachas de letras (`\p{L}+`), y de paso la diéresis hace lo
 * que se escribe para hacer: deshacer el diptongo y ganar una sílaba.
 *
 * A mano: la vï-u-da del rey → 1 + 3 + 1 + 1 = 6 fonéticas − 1 sinalefa (a‿u de «la vïuda»
 * no existe: son «la» y «vïuda», que empieza por consonante) = 6, aguda por «rey» → 7.
 */
test('la diéresis poética se lee como una palabra, y deshace el diptongo', () => {
  const palabras = contarSilabasTexto('la vïuda del rey');
  expect(palabras.map((p) => p.palabra)).toEqual(['la', 'vïuda', 'del', 'rey']);
  // vï-u-da: la diéresis rompe el diptongo «iu», que es para lo único que se escribe
  expect(palabras[1].silabas).toEqual(['vï', 'u', 'da']);
  // Ninguna sílaba puede quedarse sin vocal, que es lo que producía el extractor viejo
  for (const p of palabras) {
    for (const s of p.silabas) {
      expect(s, `sílaba sin vocal en «${p.palabra}»`).toMatch(/[aeiouáéíóúüïy]/i);
    }
  }
  // Sin diéresis, «viuda» es bisílaba: es justo la sílaba que la diéresis gana
  expect(contarSilabasTexto('viuda')[0].silabas).toEqual(['viu', 'da']);
});

test('las letras fuera del español tampoco parten la palabra', () => {
  // ç, à, è, ã de nombres propios y grafías antiguas: antes cada una partía la palabra en dos
  for (const palabra of ['Barça', 'Montserrat', 'Gonçalves', 'Bragança']) {
    expect(contarSilabasTexto(palabra).map((p) => p.palabra)).toEqual([palabra]);
  }
});
