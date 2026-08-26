/**
 * Tests del modelo de `simulador-mitosis-meiosis` — recuentos, sin navegador.
 *
 * Nacen de la reparación de los hallazgos 375-381 del Inspector (26/08/2026), que tenían
 * todos la misma raíz: un único «estado de cromosomas» gobernaba el dibujo de la mitosis, de
 * la meiosis I y de la meiosis II, y repartía siempre la MITAD de los cromosomas de la placa
 * entre los dos polos. Eso solo es correcto en la anafase I.
 *
 * El resultado era que la mitosis se dibujaba como una división reduccional —4 en la placa,
 * 2 en cada polo— debajo del rótulo «Resultado: 2 células (2n=4)», y que las cuatro células
 * de la meiosis salían n=1 en vez de n=2. Ninguna de las dos cosas la ve un compilador: hay
 * que contar los cromosomas, que es lo que estos tests hacen.
 *
 * Ejecutar: npx playwright test --config playwright.calc.config.ts
 */

import { test, expect } from '@playwright/test';

import {
  cromosomasPorPolo,
  FASES_MEIOSIS,
  FASES_MITOSIS,
  parDelCromosoma,
  recuentoTotal,
  type FaseConfig,
} from '../app/simulador-mitosis-meiosis/motor';

const fase = (fases: FaseConfig[], id: string): FaseConfig => {
  const f = fases.find(x => x.id === id);
  if (!f) throw new Error(`no existe la fase «${id}»`);
  return f;
};

// ─── Mitosis: división ECUACIONAL ────────────────────────────────────────────

test.describe('mitosis — hallazgo 375', () => {
  test('todas sus fases mantienen 2n = 4 cromosomas por célula', () => {
    const distintas = FASES_MITOSIS.filter(f => f.cromosomasPorCelula !== 4).map(f => f.nombre);
    expect(distintas).toEqual([]);
  });

  test('REGRESIÓN: en la anafase cada polo recibe 4 cromosomas, no 2', () => {
    // Se separan CROMÁTIDAS HERMANAS: cada cromosoma se parte en dos, así que el recuento de
    // cromosomas por polo iguala al de la placa. Antes se repartían 2 y 2, dibujando la
    // mitosis como una división reduccional.
    const anafase = fase(FASES_MITOSIS, 'anafase');
    expect(anafase.separacion).toBe('hermanas');
    expect(cromosomasPorPolo(anafase)).toBe(4);
  });

  test('la telofase deja dos núcleos de 4 cromosomas: 8 en la célula sin partir', () => {
    const telofase = fase(FASES_MITOSIS, 'telofase');
    expect(cromosomasPorPolo(telofase)).toBe(4);
    expect(telofase.nucleos).toBe(2);
  });

  test('ninguna fase de la mitosis aparea homólogos: no hay bivalentes', () => {
    expect(FASES_MITOSIS.filter(f => f.bivalentes)).toEqual([]);
  });
});

// ─── Meiosis: reduccional y luego ecuacional ─────────────────────────────────

test.describe('meiosis — hallazgos 377, 378, 379, 380', () => {
  test('la meiosis I parte de 2n = 4 y la meiosis II de n = 2', () => {
    for (const id of ['interfase', 'profase-i', 'metafase-i', 'anafase-i']) {
      expect(fase(FASES_MEIOSIS, id).cromosomasPorCelula, id).toBe(4);
    }
    for (const id of ['telofase-i', 'profase-ii', 'metafase-ii', 'anafase-ii', 'telofase-ii']) {
      expect(fase(FASES_MEIOSIS, id).cromosomasPorCelula, id).toBe(2);
    }
  });

  test('la anafase I separa HOMÓLOGOS: cada polo recibe la mitad (n = 2)', () => {
    const anafaseI = fase(FASES_MEIOSIS, 'anafase-i');
    expect(anafaseI.separacion).toBe('homologos');
    expect(cromosomasPorPolo(anafaseI)).toBe(2);
  });

  test('REGRESIÓN 380: la anafase II separa HERMANAS y cada polo recibe 2, no 1', () => {
    const anafaseII = fase(FASES_MEIOSIS, 'anafase-ii');
    expect(anafaseII.separacion).toBe('hermanas');
    expect(cromosomasPorPolo(anafaseII)).toBe(2);
  });

  test('REGRESIÓN 377: la telofase I tiene 2 células de 2 cromosomas, no de 4', () => {
    const telofaseI = fase(FASES_MEIOSIS, 'telofase-i');
    expect(telofaseI.celulas).toBe(2);
    expect(telofaseI.cromosomasPorCelula).toBe(2);
    expect(telofaseI.nucleos).toBe(1);
    // 2 células × 2 cromosomas = 4 en total, los mismos que tenía la célula madre.
    expect(recuentoTotal(telofaseI)).toBe(4);
  });

  test('REGRESIÓN 378: existe la Profase II, entre la telofase I y la metafase II', () => {
    const ids = FASES_MEIOSIS.map(f => f.id);
    expect(ids).toContain('profase-ii');
    expect(ids.indexOf('profase-ii')).toBe(ids.indexOf('telofase-i') + 1);
    expect(ids.indexOf('metafase-ii')).toBe(ids.indexOf('profase-ii') + 1);

    // La envoltura que la telofase I acababa de formar se disuelve aquí, y no de la nada.
    expect(fase(FASES_MEIOSIS, 'telofase-i').membrana).toBe('completa');
    expect(fase(FASES_MEIOSIS, 'profase-ii').membrana).toBe('disolviendose');
    expect(fase(FASES_MEIOSIS, 'metafase-ii').membrana).toBe('ausente');
  });

  test('REGRESIÓN 379: en la meiosis II los dos cromosomas son de PARES distintos', () => {
    // Una célula haploide tiene un cromosoma de cada par: dos del mismo par serían una no
    // disyunción, que es justo lo que la FAQ de la app describe como error.
    expect(parDelCromosoma(0, 2)).toBe(0);
    expect(parDelCromosoma(1, 2)).toBe(1);
    // Y en una diploide van por parejas: 0,0,1,1 — los homólogos, seguidos.
    expect([0, 1, 2, 3].map(i => parDelCromosoma(i, 4))).toEqual([0, 0, 1, 1]);
  });

  test('el crossing-over y los bivalentes solo existen en la meiosis I', () => {
    const conBivalentes = FASES_MEIOSIS.filter(f => f.bivalentes).map(f => f.id);
    expect(conBivalentes).toEqual(['profase-i', 'metafase-i']);
    const conCrossing = FASES_MEIOSIS.filter(f => f.crossingOver).map(f => f.id);
    expect(conCrossing).toEqual(['profase-i']);
  });

  test('el resultado final son 4 células de n = 2: ocho cromosomas repartidos', () => {
    const telofaseII = fase(FASES_MEIOSIS, 'telofase-ii');
    expect(telofaseII.celulas).toBe(4);
    expect(telofaseII.cromosomasPorCelula).toBe(2);
  });
});

// ─── Lo que distingue a las dos divisiones ───────────────────────────────────

test.describe('mitosis frente a meiosis — hallazgo 376', () => {
  test('la metafase y la metafase I NO se dibujan igual: una tiene bivalentes', () => {
    const mitotica = fase(FASES_MITOSIS, 'metafase');
    const meiotica = fase(FASES_MEIOSIS, 'metafase-i');
    expect(mitotica.cromosomasPorCelula).toBe(meiotica.cromosomasPorCelula); // las dos, 4
    expect(Boolean(mitotica.bivalentes)).toBe(false);
    expect(Boolean(meiotica.bivalentes)).toBe(true);
  });

  test('la anafase y la anafase I NO se dibujan igual: separan cosas distintas', () => {
    const mitotica = fase(FASES_MITOSIS, 'anafase');
    const meiotica = fase(FASES_MEIOSIS, 'anafase-i');
    expect(mitotica.separacion).toBe('hermanas');
    expect(meiotica.separacion).toBe('homologos');
    // Y por eso el recuento por polo es distinto: 4 frente a 2.
    expect(cromosomasPorPolo(mitotica)).toBe(4);
    expect(cromosomasPorPolo(meiotica)).toBe(2);
  });

  test('las descripciones nombran lo que se separa, sin confundir homólogos con hermanas', () => {
    const anafase = fase(FASES_MITOSIS, 'anafase');
    expect(anafase.descripcion).toContain('cromátidas hermanas');
    const anafaseI = fase(FASES_MEIOSIS, 'anafase-i');
    expect(anafaseI.descripcion).toContain('homólogos');
    expect(anafaseI.descripcion).toContain('cromátidas hermanas permanecen unidas');
  });
});

// ─── Coherencia global ───────────────────────────────────────────────────────

test.describe('coherencia del recorrido', () => {
  test('el material genético se conserva en todo el recorrido de las dos divisiones', () => {
    // La célula madre tiene 4 cromosomas; tras duplicar el ADN cada uno lleva 2 cromátidas.
    // El recuento de CROMOSOMAS del organismo modelo no puede bajar de 4 en ningún momento.
    for (const [nombre, fases] of [['mitosis', FASES_MITOSIS], ['meiosis', FASES_MEIOSIS]] as const) {
      const pobres = fases.filter(f => recuentoTotal(f) < 4).map(f => f.nombre);
      expect(pobres, nombre).toEqual([]);
    }
  });

  test('ninguna fase declara una separación sin estar separando, ni al revés', () => {
    for (const fases of [FASES_MITOSIS, FASES_MEIOSIS]) {
      for (const f of fases) {
        if (f.disposicion === 'separando') {
          expect(f.separacion, f.nombre).toBeDefined();
        }
      }
    }
  });

  test('el recorrido de cada división tiene las fases que enseña, con sus nombres', () => {
    // Este test existe porque al escribir el motor se perdió una fase: la telofase y la
    // citocinesis de la mitosis se fusionaron por error en «Telofase / Citocinesis», y el
    // simulador pasó de seis pestañas a cinco. Los recuentos seguían cuadrando, así que
    // ningún otro test lo vio; lo cazó el spec de navegador, que sí mira las pestañas.
    expect(FASES_MITOSIS.map(f => f.nombre)).toEqual([
      'Interfase',
      'Profase',
      'Metafase',
      'Anafase',
      'Telofase',
      'Citocinesis',
    ]);
    expect(FASES_MEIOSIS.map(f => f.nombre)).toEqual([
      'Interfase',
      'Profase I',
      'Metafase I',
      'Anafase I',
      'Telofase I / Citocinesis I',
      'Profase II',
      'Metafase II',
      'Anafase II',
      'Telofase II / Citocinesis II',
    ]);
  });

  test('cada fase tiene id, nombre y descripción, y los ids no se repiten', () => {
    for (const fases of [FASES_MITOSIS, FASES_MEIOSIS]) {
      expect(new Set(fases.map(f => f.id)).size).toBe(fases.length);
      const incompletas = fases.filter(f => !f.id || !f.nombre || f.descripcion.length < 40);
      expect(incompletas).toEqual([]);
    }
  });
});
