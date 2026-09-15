import { test, expect } from '@playwright/test';
import {
  CASOS,
  TOTAL_CASOS,
  POBLACIONES,
  N_DISPONIBLES,
  resolverCaso,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  mediaDeMedias,
  sigmaDeMedias,
  asimetriaDeMedias,
  excesoDeMedias,
  distanciaANormal,
} from '../../app/simulador-teorema-central-limite/casos';

/**
 * Casos para clase — `simulador-teorema-central-limite` (tipo C: predicción antes de mover).
 *
 * Es el primer módulo de casos del catálogo que NO pide un número, sino una predicción entre
 * opciones cerradas. Lo que hace viable ese tipo de tarea es que la respuesta correcta se
 * obtenga EJECUTANDO el modelo; si no se puede, la pregunta es ambigua y no se puede corregir.
 * Por eso la invariante central de este fichero (la 8) es que la clave que devuelve
 * `resolverCaso` esté siempre entre las opciones del caso.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * DÓNDE VIVE EL CÁLCULO — app/simulador-teorema-central-limite/casos.ts
 *   · POBLACIONES          → μ, σ, asimetría y exceso de curtosis de las cinco poblaciones.
 *                            `page.tsx` importa de aquí μ y σ: una sola fuente, de modo que el
 *                            panel del simulador no puede contradecir a la corrección.
 *   · mediaDeMedias        → μ(X̄) = μ                 (no depende de n)
 *   · sigmaDeMedias        → σ(X̄) = σ/√n
 *   · asimetriaDeMedias    → asimetría(X̄) = asimetría/√n
 *   · excesoDeMedias       → exceso(X̄) = exceso/n
 *   · resolverCaso         → ejecuta esas leyes y devuelve la CLAVE de la opción correcta
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LOS MOMENTOS DE LAS POBLACIONES, DERIVADOS A MANO
 *
 * Ninguno está copiado de lo que devuelve la app. Los cuatro primeros son de manual; el quinto
 * se derivó aquí. Todos se contrastaron además por Monte Carlo con 4.000.000 de extracciones
 * (columna «simulación») antes de escribir el módulo:
 *
 *   uniforme [0,10]   μ=5      σ=√(100/12)=2,8868   asim=0        exceso=−6/5=−1,2
 *                     simulación: 5,0007 · 2,8875 · 0,000 · −1,200
 *   exponencial λ=1   μ=1      σ=1                  asim=2        exceso=6
 *                     simulación: 0,9997 · 1,0003 · 2,005 · 6,057
 *   Bernoulli p=0,5   μ=0,5    σ=0,5                asim=0        exceso=(1−6pq)/pq=−2
 *                     simulación: 0,5000 · 0,5000 · 0,000 · −2,000
 *   Bernoulli p=0,9   μ=0,9    σ=√0,09=0,3          asim=(1−2p)/√(pq)=−2,6667
 *                                                   exceso=(1−6·0,09)/0,09=5,1111
 *                     simulación: 0,8999 · 0,3002 · −2,664 · 5,098
 *   bimodal ½N(−2;0,6)+½N(2;0,6)
 *                     μ=0
 *                     σ² = E[X²] = 0,5(4+0,36)·2 = 4,36        → σ=2,0881
 *                     asim = 0 (simétrica respecto a 0)
 *                     E[X⁴] = m⁴+6m²s²+3s⁴ = 16+8,64+0,3888 = 25,0288
 *                     curtosis = 25,0288/4,36² = 25,0288/19,0096 = 1,316640
 *                     exceso = 1,316640 − 3 = −1,683360
 *                     simulación: 0,0005 · 2,0876 · −0,000 · −1,683
 *
 * LAS TRES LEYES, CONTRASTADAS CON 600.000 MEDIAS POR CONFIGURACIÓN
 *
 *   exponencial n=25 → σ 0,2000 (sim. 0,1998) · asim 0,400 (sim. 0,403) · exceso 0,240 (sim. 0,234)
 *   exponencial n=100→ σ 0,1000 (sim. 0,1000) · asim 0,200 (sim. 0,203) · exceso 0,060 (sim. 0,056)
 *   Bernoulli 0,9 n=10→σ 0,0949 (sim. 0,0949) · asim −0,843 (sim. −0,844) · exceso 0,511 (sim. 0,515)
 *   Bernoulli 0,9 n=30→σ 0,0548 (sim. 0,0548) · asim −0,487 (sim. −0,485) · exceso 0,170 (sim. 0,168)
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * LAS 12 RESPUESTAS, RESUELTAS A MANO ANTES DE EJECUTAR NADA
 *
 *   1  centro, uniforme, n 1→30      → «se queda en el mismo sitio». μ(X̄)=μ=5 y n no aparece.
 *   2  anchura, uniforme, n 1→4      → «a la mitad». σ(X̄) pasa de 2,8868 a 1,4434; √(1/4)=1/2.
 *   3  anchura, uniforme, n 1→100    → «por 10». √(1/100)=0,1: 2,8868 → 0,28868.
 *   4  anchura, exponencial, n=10 fijo, muestras 100→5.000
 *                                    → «no cambiará». σ(X̄)=1/√10=0,3162 en los dos casos: el
 *                                      número de medias dibujadas NO entra en la fórmula.
 *   5  asimetría, exponencial, n 1→25→ «a la quinta parte, sin llegar a cero». 2/√25 = 0,4.
 *   6  ¿más normal a n=10?           → «la uniforme». asim 0 y exceso −0,12 frente a 0,6325 y
 *                                      0,6 de la exponencial: gana por las DOS métricas.
 *   7  cola, Bernoulli 0,9, n=10     → «hacia la izquierda». asim(X̄) = −2,6667/√10 = −0,843,
 *                                      y en el convenio de Fisher negativo = cola izquierda.
 *   8  umbral σ(X̄)≤0,5, uniforme     → «n = 100». n ≥ (2,8868/0,5)² = 33,33; de la lista
 *                                      (1,2,5,10,30,100) el menor que llega es 100.
 *                                      ⚠️ n=30 da 0,5271 y NO cumple: es el caso que desmonta
 *                                      la regla de memorieta «con n ≥ 30 ya vale».
 *   9  más estrecho a n=10           → «la moneda justa». 0,5/√10=0,1581 < 1/√10=0,3162.
 *   10 centro de la bimodal, n=30    → «en 0, aunque la población casi nunca dé valores ahí».
 *   11 dividir el error típico por 3 → «por 9». √n×3 ⇒ n×9.
 *   12 menos asimétrico, Bernoulli 0,9, n=10 vs 30
 *                                    → «con n = 30». |−0,487| < |−0,843|.
 */

const TOLERANCIA = 1e-9;

test.describe('casos.ts — estructura (invariantes 1 a 5)', () => {
  test('1 · hay exactamente 12 casos con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS).toHaveLength(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    const primera = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}|${c.respuestaTexto}`);
    const segunda = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}|${c.respuestaTexto}`);
    expect(segunda).toEqual(primera);

    // Y resolver dos veces los mismos datos devuelve la misma clave.
    for (const caso of CASOS) {
      const a = resolverCaso(caso.datos);
      const b = resolverCaso(caso.datos);
      expect(b.clave).toBe(a.clave);
    }
  });

  test('3 · la respuesta declarada coincide con recalcularla desde `datos`', () => {
    // Es la invariante que caza a quien edita un enunciado y olvida ajustar la solución.
    for (const caso of CASOS) {
      const r = resolverCaso(caso.datos);
      expect(r.ok, `el caso ${caso.id} no se resuelve: ${r.error ?? ''}`).toBe(true);
      const indice = caso.opciones.findIndex((o) => o.clave === r.clave);
      expect(indice, `caso ${caso.id}`).toBe(caso.respuesta);
      expect(caso.respuestaTexto).toBe(caso.opciones[indice].texto);
    }
  });

  test('4 · cada caso tiene enunciado, etiqueta no vacía, opciones y explicación', () => {
    for (const caso of CASOS) {
      expect(caso.titulo.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.enunciado.trim().length, `caso ${caso.id}`).toBeGreaterThan(20);
      expect(caso.etiquetaRespuesta.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.pista.trim().length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThan(1);
      // Entre 3 y 4 opciones: menos no obliga a pensar y más convierte la predicción en lotería.
      expect(caso.opciones.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(3);
      expect(caso.opciones.length, `caso ${caso.id}`).toBeLessThanOrEqual(4);
      // Las claves de un caso no se repiten: si lo hicieran, findIndex elegiría la primera
      // y la corrección podría señalar una opción distinta de la que resolvió el motor.
      const claves = caso.opciones.map((o) => o.clave);
      expect(new Set(claves).size, `caso ${caso.id}`).toBe(claves.length);
    }
  });

  test('5 · ningún enunciado nombra un país ni una ciudad', () => {
    // El 91 % de este canal es de fuera de España: un enunciado anclado excluye a la mayoría.
    const PROHIBIDO =
      /\b(España|español|española|Madrid|Barcelona|México|Ciudad de México|Colombia|Bogotá|Perú|Lima|Argentina|Buenos Aires|Chile|Santiago|euro|euros|peso|pesos|dólar|dólares|€|\$)\b/i;
    for (const caso of CASOS) {
      expect(PROHIBIDO.test(caso.titulo), `título del caso ${caso.id}`).toBe(false);
      expect(PROHIBIDO.test(caso.enunciado), `enunciado del caso ${caso.id}`).toBe(false);
      for (const o of caso.opciones) {
        expect(PROHIBIDO.test(o.texto), `opción de ${caso.id}`).toBe(false);
      }
    }
  });
});

test.describe('casos.ts — el generador de práctica (invariante 6)', () => {
  test('6a · es reproducible por semilla', () => {
    for (const semilla of [1, 7, 12345, 99999]) {
      const a = generarEjercicioAleatorio(semilla);
      const b = generarEjercicioAleatorio(semilla);
      expect(b.enunciado).toBe(a.enunciado);
      expect(b.respuesta).toBe(a.respuesta);
    }
  });

  test('6b · es VARIADO: ≥3 enunciados y ≥3 respuestas distintas en 40 semillas', () => {
    // Reproducible no es variado, y la prueba obvia solo mira lo primero: en
    // `simulador-genetica` un xorshift32 mal sembrado devolvía el MISMO ejercicio con todas
    // las semillas y aun así pasaba la comprobación de reproducibilidad.
    const enunciados = new Set<string>();
    const respuestas = new Set<string>();
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      enunciados.add(e.enunciado);
      respuestas.add(`${e.opciones[e.respuesta]?.clave ?? 'nulo'}`);
    }
    expect(enunciados.size).toBeGreaterThanOrEqual(3);
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
  });

  test('6c · usa la MISMA aritmética que los casos fijos y siempre resuelve', () => {
    // Si divergieran, el alumno entrenaría con una regla y sería corregido con otra.
    for (let s = 1; s <= 60; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(e.respuesta, `semilla ${s}: la clave resuelta no está entre las opciones`).toBeGreaterThanOrEqual(0);
      expect(e.respuesta).toBeLessThan(e.opciones.length);
      expect(e.etiquetaRespuesta.trim().length).toBeGreaterThan(0);
      expect(e.pasos.length).toBeGreaterThan(1);
    }
  });
});

test.describe('casos.ts — los convenios de esta app (invariante 7)', () => {
  test('7a · σ(X̄) = σ/√n, no σ/n', () => {
    const uni = POBLACIONES.uniforme;
    expect(sigmaDeMedias(uni, 1)).toBeCloseTo(2.886751, 5);
    expect(sigmaDeMedias(uni, 4)).toBeCloseTo(1.443376, 5);
    expect(sigmaDeMedias(uni, 100)).toBeCloseTo(0.2886751, 6);
    // El error clásico daría 2,8868/4 = 0,7217 en el segundo caso.
    expect(sigmaDeMedias(uni, 4)).not.toBeCloseTo(uni.sigma / 4, 4);
  });

  test('7b · el centro NO depende de n', () => {
    for (const id of ['uniforme', 'exponencial', 'bernoulli_09', 'bimodal'] as const) {
      const p = POBLACIONES[id];
      for (const n of N_DISPONIBLES) {
        expect(mediaDeMedias(p)).toBeCloseTo(p.mu, 12);
        expect(sigmaDeMedias(p, n)).toBeGreaterThan(0);
      }
    }
  });

  test('7c · asimetría de Fisher: negativa = cola a la izquierda', () => {
    const b9 = POBLACIONES.bernoulli_09;
    expect(b9.asimetria).toBeCloseTo(-2.666667, 5);
    expect(asimetriaDeMedias(b9, 10)).toBeCloseTo(-0.843274, 5);
    expect(resolverCaso({ tipo: 'lado-cola', poblacion: 'bernoulli_09', n: 10 }).clave).toBe('izquierda');
    // Y la exponencial, que es su espejo: cola a la derecha.
    expect(resolverCaso({ tipo: 'lado-cola', poblacion: 'exponencial', n: 10 }).clave).toBe('derecha');
    // Una simétrica no cae en ninguno de los dos lados.
    expect(resolverCaso({ tipo: 'lado-cola', poblacion: 'uniforme', n: 10 }).clave).toBe('simetrica');
  });

  test('7d · la asimetría se divide por √n y el exceso por n (convergen a distinta velocidad)', () => {
    const exp = POBLACIONES.exponencial;
    expect(asimetriaDeMedias(exp, 25)).toBeCloseTo(0.4, 10);
    expect(asimetriaDeMedias(exp, 100)).toBeCloseTo(0.2, 10);
    expect(excesoDeMedias(exp, 25)).toBeCloseTo(0.24, 10);
    expect(excesoDeMedias(exp, 100)).toBeCloseTo(0.06, 10);
    // A n = 100 el exceso ya se ha reducido 100 veces y la asimetría solo 10.
    expect(excesoDeMedias(exp, 100) / exp.exceso).toBeCloseTo(0.01, 10);
    expect(asimetriaDeMedias(exp, 100) / exp.asimetria).toBeCloseTo(0.1, 10);
  });

  test('7e · los momentos declarados son los derivados a mano', () => {
    expect(POBLACIONES.uniforme.sigma).toBeCloseTo(2.886751, 5);
    expect(POBLACIONES.uniforme.exceso).toBeCloseTo(-1.2, 10);
    expect(POBLACIONES.exponencial.asimetria).toBeCloseTo(2, 10);
    expect(POBLACIONES.bernoulli_05.exceso).toBeCloseTo(-2, 10);
    expect(POBLACIONES.bernoulli_09.exceso).toBeCloseTo(5.111111, 5);
    expect(POBLACIONES.bimodal.sigma).toBeCloseTo(2.088061, 5);
    expect(POBLACIONES.bimodal.exceso).toBeCloseTo(-1.68336, 5);
  });
});

test.describe('casos.ts — lo propio del TIPO C (invariante 8)', () => {
  test('8a · la opción correcta SALE de ejecutar el modelo, en los 12 casos', () => {
    // La regla que hace viable este tipo de tarea: si la clave que devuelve el motor no está
    // entre las opciones, la pregunta no tiene respuesta única y el caso no vale.
    for (const caso of CASOS) {
      expect(caso.respuesta, `caso ${caso.id}: la clave resuelta no está entre sus opciones`).toBeGreaterThanOrEqual(0);
      expect(caso.respuesta).toBeLessThan(caso.opciones.length);
    }
  });

  test('8b · un mecanismo por caso, resuelto a mano en la cabecera', () => {
    const ESPERADO: Record<number, string> = {
      1: 'Se quedará en el mismo sitio',
      2: 'Se reducirá a la mitad',
      3: 'Por 10',
      4: 'No cambiará: solo se dibujará con menos ruido',
      5: 'Bajará a la quinta parte, pero seguirá sin ser cero',
      6: 'La uniforme',
      7: 'Hacia la izquierda',
      8: 'n = 100',
      9: 'La moneda justa',
      10: 'En 0, aunque la población casi nunca dé valores cercanos a 0',
      11: 'Por 9',
      12: 'Con n = 30',
    };
    for (const caso of CASOS) {
      expect(caso.respuestaTexto, `caso ${caso.id}`).toBe(ESPERADO[caso.id]);
    }
  });

  test('8c · el caso 8 desmonta la regla «con n ≥ 30 ya vale»', () => {
    // Si alguien cambiara el umbral o la lista de n y n = 30 pasara a cumplir, este caso
    // dejaría de enseñar lo que pretende y hay que replantearlo, no ajustar el test.
    const uni = POBLACIONES.uniforme;
    expect(sigmaDeMedias(uni, 30)).toBeGreaterThan(0.5);
    expect(sigmaDeMedias(uni, 30)).toBeCloseTo(0.527046, 5);
    expect(sigmaDeMedias(uni, 100)).toBeLessThanOrEqual(0.5);
    expect(resolverCaso({ tipo: 'umbral-n', poblacion: 'uniforme', umbral: 0.5 }).clave).toBe('n-100');
  });

  test('8d · el caso 4 separa n del número de muestras', () => {
    // El error más repetido del tema. Subir las repeticiones no estrecha nada.
    const r = resolverCaso({
      tipo: 'anchura-repeticiones',
      poblacion: 'exponencial',
      n: 10,
      muestras1: 100,
      muestras2: 5000,
    });
    expect(r.clave).toBe('no-cambia');
    // Y la prueba de que es así: σ(X̄) solo depende de n.
    expect(sigmaDeMedias(POBLACIONES.exponencial, 10)).toBeCloseTo(0.316228, 5);
  });

  test('8e · en los casos 6 y 12 las dos métricas apuntan al mismo lado', () => {
    // `distanciaANormal` combina asimetría y exceso con una ponderación elegida a ojo. Si el
    // resultado de un caso dependiera de esa ponderación, la pregunta no sería inequívoca.
    const uni = POBLACIONES.uniforme;
    const exp = POBLACIONES.exponencial;
    // Caso 6: la uniforme gana por asimetría Y por exceso, no solo por la combinación.
    expect(Math.abs(asimetriaDeMedias(uni, 10))).toBeLessThan(Math.abs(asimetriaDeMedias(exp, 10)));
    expect(Math.abs(excesoDeMedias(uni, 10))).toBeLessThan(Math.abs(excesoDeMedias(exp, 10)));
    expect(distanciaANormal(uni, 10)).toBeLessThan(distanciaANormal(exp, 10));

    // Caso 12: n = 30 gana por asimetría Y por exceso.
    const b9 = POBLACIONES.bernoulli_09;
    expect(Math.abs(asimetriaDeMedias(b9, 30))).toBeLessThan(Math.abs(asimetriaDeMedias(b9, 10)));
    expect(Math.abs(excesoDeMedias(b9, 30))).toBeLessThan(Math.abs(excesoDeMedias(b9, 10)));
  });

  test('8f · resolverCaso nunca lanza, ni con datos imposibles', () => {
    // Un throw dentro de un render de React tumbaría la app entera; un { ok: false } se pinta.
    const malos = [
      { tipo: 'anchura-n', poblacion: 'uniforme', n1: 0, n2: 10 },
      { tipo: 'anchura-n', poblacion: 'uniforme', n1: 10, n2: -5 },
      { tipo: 'asimetria-n', poblacion: 'exponencial', n1: 0, n2: 4 },
      { tipo: 'factor-n', divisor: 0 },
      { tipo: 'lado-cola', poblacion: 'exponencial', n: 0 },
    ] as const;
    for (const datos of malos) {
      let r: ReturnType<typeof resolverCaso> | null = null;
      expect(() => {
        r = resolverCaso(datos);
      }).not.toThrow();
      expect(r).not.toBeNull();
      expect((r as unknown as { ok: boolean }).ok).toBe(false);
    }
  });
});

test.describe('casos.ts — la corrección', () => {
  test('acierta, falla y rechaza lo que no es una opción, sin lanzar', () => {
    const caso = CASOS[0];
    const ok = comprobarRespuesta(caso.respuesta, caso.respuesta, caso.opciones);
    expect(ok.correcto).toBe(true);

    const otro = (caso.respuesta + 1) % caso.opciones.length;
    const ko = comprobarRespuesta(otro, caso.respuesta, caso.opciones);
    expect(ko.correcto).toBe(false);
    // El veredicto dice cuál era la correcta: en el tipo C, saber que has fallado sin saber
    // qué pasa de verdad no enseña el mecanismo.
    expect(ko.motivo.toLowerCase()).toContain(caso.opciones[caso.respuesta].texto.toLowerCase());

    for (const invalido of [-1, 99, NaN, 1.5]) {
      const r = comprobarRespuesta(invalido, caso.respuesta, caso.opciones);
      expect(r.correcto).toBe(false);
      expect(r.motivo).not.toContain('NaN');
    }
  });

  test('los 12 casos se corrigen correctamente eligiendo su propia respuesta', () => {
    for (const caso of CASOS) {
      const r = comprobarRespuesta(caso.respuesta, caso.respuesta, caso.opciones);
      expect(r.correcto, `caso ${caso.id}`).toBe(true);
    }
  });
});

test.describe('casos.ts — coherencia con la vista', () => {
  test('μ y σ de POBLACIONES son los que el simulador muestra en su panel', () => {
    // `page.tsx` importa estos valores de `casos.ts`, así que este test fija el contrato: si
    // alguien los cambiara aquí, cambiarían también en el panel, y al revés es imposible.
    expect(POBLACIONES.uniforme.mu).toBe(5);
    expect(POBLACIONES.exponencial.mu).toBe(1);
    expect(POBLACIONES.exponencial.sigma).toBe(1);
    expect(POBLACIONES.bernoulli_05.mu).toBe(0.5);
    expect(POBLACIONES.bernoulli_05.sigma).toBe(0.5);
    expect(POBLACIONES.bernoulli_09.mu).toBe(0.9);
    expect(POBLACIONES.bernoulli_09.sigma).toBeCloseTo(0.3, 10);
    expect(POBLACIONES.bimodal.mu).toBe(0);
  });

  test('N_DISPONIBLES coincide con los tamaños del deslizador', () => {
    expect([...N_DISPONIBLES]).toEqual([1, 2, 5, 10, 30, 100]);
  });

  test('las leyes son coherentes entre sí en toda la rejilla', () => {
    for (const id of Object.keys(POBLACIONES) as Array<keyof typeof POBLACIONES>) {
      const p = POBLACIONES[id];
      for (const n of N_DISPONIBLES) {
        // σ(X̄) nunca crece con n, y es exactamente σ/√n.
        expect(sigmaDeMedias(p, n)).toBeCloseTo(p.sigma / Math.sqrt(n), 12);
        expect(Math.abs(asimetriaDeMedias(p, n))).toBeLessThanOrEqual(Math.abs(p.asimetria) + TOLERANCIA);
        expect(Math.abs(excesoDeMedias(p, n))).toBeLessThanOrEqual(Math.abs(p.exceso) + TOLERANCIA);
      }
    }
  });
});
