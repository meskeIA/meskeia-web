import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion } from './_hidratacion';
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
    // El 4 y el 25 entraron el 20/09/2026: los casos 2 y 5 los piden por su nombre y no
    // existían en el simulador, así que su cierre («compruébalo en el simulador de arriba»)
    // mandaba hacer algo imposible.
    expect([...N_DISPONIBLES]).toEqual([1, 2, 4, 5, 10, 25, 30, 100]);
  });

  test('todo n que pida un caso o un ejercicio EXISTE en el simulador', () => {
    // La propiedad general de la que aquel hallazgo era un caso particular. Cubre los 12
    // casos fijos y los ejercicios generados, que antes salían de una lista de pares escrita
    // a mano donde solo 1 de los 6 era reproducible.
    const disponibles = new Set(N_DISPONIBLES);
    for (const caso of CASOS) {
      for (const clave of ['n', 'n1', 'n2'] as const) {
        const valor = (caso.datos as Record<string, unknown>)[clave];
        if (typeof valor === 'number') {
          expect(disponibles.has(valor), `caso ${caso.id} pide n = ${valor}`).toBe(true);
        }
      }
    }
    // En los ejercicios generados se comprueba lo que el alumno LEE: todo «n = X» del
    // enunciado tiene que ser un tamaño que el simulador ofrezca.
    for (let semilla = 0; semilla < 40; semilla++) {
      const ej = generarEjercicioAleatorio(semilla);
      for (const m of ej.enunciado.matchAll(/n\s*=\s*(\d+)/g)) {
        const valor = Number(m[1]);
        expect(disponibles.has(valor), `semilla ${semilla} pide n = ${valor}`).toBe(true);
      }
    }
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

/* ══════════════════════════════════════════════════════════════════════════════════════════
   EL SIMULADOR EN EL NAVEGADOR — inspección del 20/09/2026
   ══════════════════════════════════════════════════════════════════════════════════════════

   Lo de arriba comprueba `casos.ts`, que es aritmética pura y determinista. Esto comprueba lo
   que la app ENSEÑA: que el histograma que genera con `Math.random` cumple de verdad las tres
   leyes que prometen su <h1>, su metadata y su bloque educativo — centro en μ, anchura σ/√n y
   forma cada vez más normal al crecer n, sea cual sea la población de partida.

   ── POR QUÉ NINGUNA CIFRA SIMULADA SE EXIGE EXACTA ─────────────────────────────────────────
   La app es Monte Carlo: con N = 1.000 medias, la media empírica que imprime tiene error típico
   σ/√(n·N) y la σ empírica, ≈ σ(X̄)·√((κ−1)/4N). Un test que exigiera un valor exacto fallaría
   cada pocas corridas, y un test que falla 1 de cada 20 es peor que ninguno.

   Las bandas se fijaron ANTES de abrir la app, reimplementando el modelo TEÓRICO en Node (no la
   app) y midiendo el recorrido real de cada estadístico sobre miles de réplicas de 1.000 medias.
   Cada banda vale ≈5-6 desviaciones típicas y además deja fuera el mínimo y el máximo observados:

     uniforme [0,10] n=30, N=1000 · 2.000 réplicas      banda del test
       media     [4,9391 ; 5,0579]                      5 ± 0,09
       σ         [0,4858 ; 0,5707]                      0,5270 ± 0,07
       asimetría [−0,2425 ; 0,2626]                     |asimetría| ≤ 0,45
       curtosis  [2,5438 ; 3,4925]                      2,96 ± 0,86

     exponencial λ=1 n=1, N=1000 · 3.000 réplicas
       media     [0,9046 ; 1,1109]                      1 ± 0,18
       σ         [0,8562 ; 1,1629]                      1 ± 0,26
       asimetría [1,3753 ; 3,8432]                      > 0,9  ← solo cota INFERIOR
       curtosis  [4,6667 ; 35,3028]                     > 4,0  ← solo cota INFERIOR

     exponencial λ=1 n=100, N=1000 · 1.000 réplicas
       media     [0,9909 ; 1,0084]                      1 ± 0,03
       σ         [0,0924 ; 0,1084]                      0,1 ± 0,02

   ⚠️ En el caso n = 1 la asimetría y la curtosis llevan SOLO cota inferior, a propósito: su
   distribución muestral tiene una cola derecha larguísima (la curtosis llegó a 35 en 3.000
   réplicas), así que cualquier cota superior «razonable» fallaría de vez en cuando. Y la cota
   inferior es la que discrimina: lo que hay que demostrar es que con n = 1 la rareza de la
   población SOBREVIVE entera, porque una normal daría asimetría 0 y curtosis 3.

   Las que sí se exigen EXACTAS son las etiquetas teóricas («μ teórica», «σ/√n teórica»): no son
   simulación sino la fórmula, y son justo donde se vería una σ/n escrita en lugar de una σ/√n.

   ── LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR LA APP ─────────────────────────────────
     A · normal   uniforme [0,10] con n = 30 y 1.000 muestras.
                  μ = (0+10)/2 = 5 · σ = (10−0)/√12 = 2,886751 · σ/√30 = 2,886751/5,477226 =
                  0,527046 → la app debe rotular «0,5270». Curtosis de X̄ = 3 + exceso/n =
                  3 − 1,2/30 = 2,96.
     B · límite   exponencial λ=1 con n = 1. Es el que más delata una fórmula mal puesta: con
                  n = 1 la «distribución de medias» ES la población, así que el error estándar
                  tiene que valer σ = 1 EXACTAMENTE (ni σ/√N ni σ/N) y la asimetría de la
                  población (2) tiene que aparecer entera. Se contrasta en el mismo test con
                  n = 100: σ(X̄) debe caer a 0,1 —dividida por 10, no por 100— y la asimetría
                  a ≈ 2/√100 = 0,2.
     C · rechazo  aquí no hay ningún campo libre que rechazar: n y el número de muestras son
                  botones de una lista cerrada, de modo que n = 0, negativo o «texto» no se
                  pueden ni teclear. El borde equivalente es el ESTADO INVÁLIDO: sin simulación
                  no puede haber cifras, y cambiar n después de una simulación tiene que
                  invalidarla. Si no lo hiciera, el panel enseñaría la σ empírica de n = 30
                  (≈0,53) bajo la etiqueta «σ/√n teórica» de n = 1 (2,8868), que difieren por 5,5.
   ══════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/simulador-teorema-central-limite/';

/** La tarjeta de resultados que lleva esa etiqueta (las clases van hasheadas por CSS Modules). */
const tarjeta = (page: Page, etiqueta: string) =>
  page.getByText(etiqueta, { exact: true }).locator('xpath=..');

/** La cifra grande de una tarjeta: «Media empírica X̄» → «5,0141». */
const valorDe = (page: Page, etiqueta: string) => tarjeta(page, etiqueta).locator('span').nth(1);

/** La línea pequeña de referencia: «Media empírica X̄» → «μ teórica = 5,000». */
const referenciaDe = (page: Page, etiqueta: string) => tarjeta(page, etiqueta).locator('span').nth(2);

/** Lee una cifra que la app ya ha formateado en español. No es entrada de usuario: es su salida. */
// No hay ambigüedad de separadores que resolver: el formato lo fija la propia app con `fmt()`.
// parser-ok: se lee un rótulo que la app acaba de imprimir, no un campo de entrada del usuario.
const cifra = (texto: string): number => Number(texto.trim().replace(/\./g, '').replace(',', '.'));

async function leerCifra(page: Page, etiqueta: string): Promise<number> {
  return cifra(await valorDe(page, etiqueta).innerText());
}

/**
 * ⚠️ El nombre de la distribución se ancla al PRINCIPIO del nombre accesible. Buscarlo como
 * subcadena resuelve a dos botones y rompe el modo estricto: el caso 5 de la sección de aula
 * lleva `aria-label="Caso 5: La asimetría de la exponencial"`.
 */
async function configurar(page: Page, distribucion: string, n: number, muestras: number): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^${distribucion}`) }).click();
  await page
    .getByRole('group', { name: 'Tamaño muestral' })
    .getByRole('button', { name: String(n), exact: true })
    .click();
  await page
    .getByRole('group', { name: 'Número de muestras' })
    .getByRole('button', { name: String(muestras), exact: true })
    .click();
}

/** Lanza y espera a la barra de estado, que solo aparece con las N medias ya acumuladas. */
async function lanzar(page: Page, n: number): Promise<void> {
  await page.getByRole('button', { name: 'Lanzar simulación' }).click();
  await expect(page.getByText(new RegExp(`Simulación completa con n = ${n}\\.`))).toBeVisible({
    timeout: 60_000,
  });
}

test.describe('el simulador en el navegador — las tres leyes del TCL', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(RUTA);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Simulador del Teorema Central del Límite',
    );
    // El único input de la página sirve de testigo de hidratación: un clic anterior a ella
    // también se perdería, y aquí todos los controles son botones.
    await esperarHidratacion(page, ['input[type="checkbox"]']);
  });

  test('CASO A (normal) · uniforme [0,10] con n = 30: centro en 5 y anchura 2,886751/√30 = 0,5270', async ({
    page,
  }) => {
    await configurar(page, 'Uniforme', 30, 1000);

    // Las dos etiquetas teóricas son fórmula, no simulación: se exigen exactas.
    await expect(referenciaDe(page, 'Media empírica X̄')).toHaveText('μ teórica = 5,000');
    await expect(referenciaDe(page, 'σ empírica')).toHaveText('σ/√n teórica = 0,5270');

    await lanzar(page, 30);
    await expect(valorDe(page, 'Muestras generadas')).toHaveText('1000');

    // Media de las 1.000 medias: μ = 5, error típico σ/√(30·1000) = 0,0167. Banda 5 ± 0,09.
    const media = await leerCifra(page, 'Media empírica X̄');
    expect(media).toBeGreaterThan(4.91);
    expect(media).toBeLessThan(5.09);

    // σ de las medias: σ/√n = 0,527046. Banda ±0,07 (≈6 desviaciones típicas).
    const sigma = await leerCifra(page, 'σ empírica');
    expect(sigma).toBeGreaterThan(0.457);
    expect(sigma).toBeLessThan(0.597);

    // La forma ya es normal: la uniforme es simétrica, así que la asimetría de X̄ es 0...
    expect(Math.abs(await leerCifra(page, 'Asimetría (skew)'))).toBeLessThan(0.45);

    // ...y la curtosis vale 3 + exceso/n = 3 − 1,2/30 = 2,96 (la de una normal es 3).
    const curtosis = await leerCifra(page, 'Curtosis');
    expect(curtosis).toBeGreaterThan(2.1);
    expect(curtosis).toBeLessThan(3.82);
  });

  test('CASO B (límite) · con n = 1 la distribución de medias ES la población, y con n = 100 se estrecha por 10', async ({
    page,
  }) => {
    await configurar(page, 'Exponencial', 1, 1000);

    // El delator: con n = 1 el error estándar es σ/√1 = σ = 1, no σ/√N ni σ/N.
    await expect(referenciaDe(page, 'σ empírica')).toHaveText('σ/√n teórica = 1,0000');
    await expect(referenciaDe(page, 'Media empírica X̄')).toHaveText('μ teórica = 1,000');

    await lanzar(page, 1);
    const media1 = await leerCifra(page, 'Media empírica X̄'); // 1 ± 0,18
    expect(media1).toBeGreaterThan(0.82);
    expect(media1).toBeLessThan(1.18);
    const sigma1 = await leerCifra(page, 'σ empírica'); // 1 ± 0,26
    expect(sigma1).toBeGreaterThan(0.74);
    expect(sigma1).toBeLessThan(1.26);

    // Con n = 1 no se ha promediado nada: la exponencial sigue entera, con su asimetría 2 y su
    // curtosis 9. Solo cota inferior (ver la cabecera); una normal daría 0 y 3.
    expect(await leerCifra(page, 'Asimetría (skew)')).toBeGreaterThan(0.9);
    expect(await leerCifra(page, 'Curtosis')).toBeGreaterThan(4);

    // El mismo experimento con n = 100: la anchura se divide por √100 = 10, no por 100.
    await configurar(page, 'Exponencial', 100, 1000);
    await expect(referenciaDe(page, 'σ empírica')).toHaveText('σ/√n teórica = 0,1000');

    await lanzar(page, 100);
    const media100 = await leerCifra(page, 'Media empírica X̄'); // el centro NO se mueve con n
    expect(media100).toBeGreaterThan(0.97);
    expect(media100).toBeLessThan(1.03);
    const sigma100 = await leerCifra(page, 'σ empírica'); // 0,1 ± 0,02
    expect(sigma100).toBeGreaterThan(0.08);
    expect(sigma100).toBeLessThan(0.12);
  });

  test('CASO C (rechazo) · sin simulación no hay cifras, y cambiar n invalida la que hubiera', async ({
    page,
  }) => {
    const ETIQUETAS = ['Media empírica X̄', 'σ empírica', 'Asimetría (skew)', 'Curtosis'];

    // Estado inicial: ninguna cifra inventada mientras no se haya lanzado nada.
    await expect(valorDe(page, 'Muestras generadas')).toHaveText('0');
    for (const etiqueta of ETIQUETAS) {
      await expect(valorDe(page, etiqueta)).toHaveText('—');
    }

    await configurar(page, 'Uniforme', 30, 1000);
    await lanzar(page, 30);
    expect(await leerCifra(page, 'σ empírica')).toBeGreaterThan(0.457); // ya hay cifras de n = 30

    // Cambiar n tiene que INVALIDAR la simulación. Si no, la σ empírica de n = 30 (≈0,53) se
    // quedaría bajo la etiqueta «σ/√n teórica» de n = 1 (2,8868): un factor 5,5 de diferencia
    // presentado como una simulación terminada.
    await page
      .getByRole('group', { name: 'Tamaño muestral' })
      .getByRole('button', { name: '1', exact: true })
      .click();
    await expect(referenciaDe(page, 'σ empírica')).toHaveText('σ/√n teórica = 2,8868');
    await expect(valorDe(page, 'Muestras generadas')).toHaveText('0');
    for (const etiqueta of ETIQUETAS) {
      await expect(valorDe(page, etiqueta)).toHaveText('—');
    }
    await expect(page.getByText(/Simulación completa/)).toHaveCount(0);

    // Y «Reiniciar» deja el panel igual de vacío tras una simulación completa.
    await lanzar(page, 1);
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await expect(valorDe(page, 'Muestras generadas')).toHaveText('0');
    for (const etiqueta of ETIQUETAS) {
      await expect(valorDe(page, etiqueta)).toHaveText('—');
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
   RE-INSPECCIÓN DEL 28/09/2026 — tras los cambios del 20 y el 22/09, y con FIRMA DE ROTURA
   ══════════════════════════════════════════════════════════════════════════════════════════

   Los cinco hallazgos del 20/09 (1052-1056) se dieron por reparados. Aquí se deja un candado
   en el NAVEGADOR para los que solo se ven dibujando (los ejes de n = 1) y para los tamaños
   nuevos, que hasta hoy solo se comprobaban en `casos.ts`:
     1052 · moneda sesgada, n = 1: el eje es el soporte [−0,3 ; 1,3] ... REPARADO, candado abajo
     1053 · exponencial, n = 1: el eje es [0 ; 6] ...................... REPARADO, candado abajo
     1054 · los n = 4 y n = 25 existen como botones .................... REPARADO, candado abajo
            («mueve el deslizador» sigue en la sección: ver HALLAZGO ABIERTO 3)
     1055 · el bloque educativo ya no dice «indistinguible» a n = 30 .... REPARADO, candado abajo
     1056 · la barra de estado es role="status" .......................... REPARADO, candado abajo

   Para leer lo que la app DIBUJA se instrumenta el lienzo antes de cargar la página: cada
   `clearRect` abre un dibujo nuevo, y se guardan sus textos (las marcas del eje), las barras
   del histograma (los `fillRect` con transparencia) y la curva normal (los `lineTo` naranjas).

   ── CASOS RESUELTOS A MANO ANTES DE EJECUTAR ──────────────────────────────────────────────
     NORMAL   moneda justa (μ = 0,5; σ = 0,5), n = 10, 5.000 muestras.
              σ/√n = 0,5/√10 = 0,158114 → «σ/√n teórica = 0,1581». Eje: 0,5 ± 4·0,158114 =
              [−0,1325 ; 1,1325] → marcas −0,13 · 0,08 · 0,29 · 0,50 · 0,71 · 0,92 · 1,13.
              La media de 10 lanzamientos solo toma los valores k/10 (paso h = 0,1). La barra
              del 0,5 tiene masa P(k = 5) = C(10,5)/2¹⁰ = 0,24609; dibujada como densidad sobre
              su paso, 0,24609/0,1 = 2,4609, frente al pico de la normal superpuesta
              1/(0,158114·√(2π)) = 2,5231 → cociente 0,975. La app la divide por el ancho de
              su casilla, 1,26491/40 = 0,031623 → 7,78, y el cociente sale 3,08 (medido: 3,11).
     LÍMITE   moneda sesgada (p = 0,9), n = 1: eje = soporte [−0,3 ; 1,3], marcas −0,30 ·
              −0,03 · 0,23 · 0,50 · 0,77 · 1,03 · 1,30, exactamente DOS barras (en 0 y en 1)
              y ninguna media fuera del rango. Exponencial, n = 1: marcas 0,00 … 6,00.
              Uniforme, n = 4 → σ/√4 = 2,886751/2 = 1,4434 (el caso 2: la mitad de 2,8868);
              n = 25 → 2,886751/5 = 0,5774.
     RECHAZO  «Comprobar predicción» deshabilitado sin elegir, y el caso 8 con «n = 30»
              suspendido: (2,886751/0,5)² = 33,33, así que n = 30 da 0,5270 > 0,5.
     MÓVIL    moneda sesgada, n = 10, 5.000 muestras (el caso 7). μ = 0,9 con error típico
              0,3/√(10·5.000) = 0,00134 → banda ±4 ET = [0,8946 ; 0,9054]. σ(X̄) = 0,3/√10 =
              0,094868 → «0,0949»; la σ empírica tiene error ≈ σ(X̄)·√((κ−1)/4N) con
              κ = 3 + 5,1111/10 = 3,511 → 0,00106 → banda ±5 = [0,0896 ; 0,1002]. Asimetría
              teórica −2,6667/√10 = −0,843: lo que se vigila es el SIGNO (cola a la izquierda).

   ── LA FIRMA DE ROTURA (cortas 57,5 % → 90 % en 14 días) ──────────────────────────────────
   No se ha encontrado nada que IMPIDA usar la app, ni en escritorio ni en móvil: hidrata,
   simula (0,9 s con 5.000 medias, también con la CPU a 1/4), pinta los dos lienzos, no
   desborda a 390 px y el Footer está UNA vez en el árbol (el tracker corre una sola vez en
   todo el flujo, candado abajo). En el dump, las 30 visitas recientes son todas de
   escritorio, con 0 % de recargas, y la subida empieza el 17/09 (6 visitas cortas), antes de
   los cambios del 20 y el 22/09.
   ══════════════════════════════════════════════════════════════════════════════════════════ */

const HISTOGRAMA = 'Histograma de las medias muestrales';

interface Dibujo {
  textos: string[];
  barras: number[][];
  curva: number[];
}

/** Registra lo que se pinta en cada lienzo (por su aria-label). Llamar ANTES del `goto`. */
async function instrumentarLienzos(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const registro: Record<string, { textos: string[]; barras: number[][]; curva: number[] }> = {};
    (window as unknown as { __lienzos: typeof registro }).__lienzos = registro;
    const proto = CanvasRenderingContext2D.prototype;
    const clave = (c: CanvasRenderingContext2D): string => c.canvas.getAttribute('aria-label') ?? 'sin-etiqueta';
    const de = (c: CanvasRenderingContext2D) => {
      const k = clave(c);
      if (!registro[k]) registro[k] = { textos: [], barras: [], curva: [] };
      return registro[k];
    };
    const clearRect = proto.clearRect;
    proto.clearRect = function (this: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
      registro[clave(this)] = { textos: [], barras: [], curva: [] };
      clearRect.call(this, x, y, w, h);
    };
    const fillText = proto.fillText;
    proto.fillText = function (this: CanvasRenderingContext2D, t: string, x: number, y: number, m?: number) {
      de(this).textos.push(String(t));
      if (m === undefined) fillText.call(this, t, x, y);
      else fillText.call(this, t, x, y, m);
    };
    const fillRect = proto.fillRect;
    proto.fillRect = function (this: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
      // Las barras del histograma son las únicas que se pintan con transparencia (0,7).
      if (this.globalAlpha < 1) de(this).barras.push([x, y, w, h]);
      fillRect.call(this, x, y, w, h);
    };
    const lineTo = proto.lineTo;
    proto.lineTo = function (this: CanvasRenderingContext2D, x: number, y: number) {
      // La normal teórica superpuesta es el único trazo naranja (#E07A1F) del histograma.
      if (String(this.strokeStyle).toLowerCase() === '#e07a1f') de(this).curva.push(y);
      lineTo.call(this, x, y);
    };
  });
}

/** El último dibujo de un lienzo, tras dejar que React vacíe sus efectos (dos fotogramas). */
async function leerDibujo(page: Page, etiqueta: string): Promise<Dibujo> {
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  return page.evaluate((e) => {
    const r = (window as unknown as { __lienzos?: Record<string, Dibujo> }).__lienzos?.[e];
    return r ?? { textos: [], barras: [], curva: [] };
  }, etiqueta);
}

/** Cociente entre la barra más alta y el pico de la normal superpuesta, medido en píxeles. */
function cocienteBarraCurva(d: Dibujo): number {
  const base = d.barras[0][1] + d.barras[0][3]; // todas las barras apoyan en el eje X
  const topeBarra = Math.min(...d.barras.map((b) => b[1]));
  const topeCurva = Math.min(...d.curva);
  return (base - topeBarra) / (base - topeCurva);
}

test.describe('Inspector 28/09/2026 — candados de lo reparado el 20/09, en el navegador', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120_000);
    await instrumentarLienzos(page);
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="checkbox"]']);
  });

  test('1052 · moneda sesgada con n = 1: el eje es el soporte y la barra del 0 se dibuja', async ({ page }) => {
    await configurar(page, 'Moneda sesgada', 1, 1000);
    await lanzar(page, 1);
    const d = await leerDibujo(page, HISTOGRAMA);
    // [−0,3 ; 1,3] en 6 tramos de 0,26667 (a mano, en la cabecera del bloque).
    expect(d.textos.slice(0, 7)).toEqual(['-0,30', '-0,03', '0,23', '0,50', '0,77', '1,03', '1,30']);
    // Dos valores posibles, dos barras: la del 0 (≈10 % de la masa) ya no se queda fuera.
    expect(d.barras).toHaveLength(2);
    expect(d.textos.some((t) => t.includes('fuera del rango'))).toBe(false);
  });

  test('1053 · exponencial con n = 1: el eje empieza en 0 y no en −2', async ({ page }) => {
    await configurar(page, 'Exponencial', 1, 1000);
    await lanzar(page, 1);
    const d = await leerDibujo(page, HISTOGRAMA);
    expect(d.textos.slice(0, 7)).toEqual(['0,00', '1,00', '2,00', '3,00', '4,00', '5,00', '6,00']);
  });

  test('1054 · los tamaños que piden los casos 2 y 5 existen, y el caso 2 se ve en el panel', async ({ page }) => {
    const grupo = page.getByRole('group', { name: 'Tamaño muestral' });
    const botones = await grupo.getByRole('button').allInnerTexts();
    expect(botones.map((t) => t.trim())).toEqual(['1', '2', '4', '5', '10', '25', '30', '100']);

    await configurar(page, 'Uniforme', 1, 1000);
    await expect(referenciaDe(page, 'σ empírica')).toHaveText('σ/√n teórica = 2,8868');
    await grupo.getByRole('button', { name: '4', exact: true }).click();
    // 2,886751/√4 = 1,443376: la mitad, que es lo que el caso 2 da por bueno.
    await expect(referenciaDe(page, 'σ empírica')).toHaveText('σ/√n teórica = 1,4434');
    await grupo.getByRole('button', { name: '25', exact: true }).click();
    await expect(referenciaDe(page, 'σ empírica')).toHaveText('σ/√n teórica = 0,5774');
  });

  test('1055 y 1056 · el texto no promete una normal a n = 30, y el final se anuncia', async ({ page }) => {
    const cuerpo = (await page.locator('body').textContent()) ?? '';
    expect(cuerpo).not.toContain('indistinguible');
    expect(cuerpo).toContain('todavía no del todo');

    await configurar(page, 'Uniforme', 5, 100);
    await lanzar(page, 5);
    await expect(
      page.getByRole('status').filter({ hasText: 'Simulación completa con n = 5.' }),
    ).toHaveAttribute('aria-live', 'polite');
  });

  test('uniforme con n = 30: la normal superpuesta y el histograma tienen la misma altura', async ({ page }) => {
    // Población CONTINUA: casilla de 0,2·σ(X̄) con μ en su borde; la densidad media de las dos
    // casillas centrales es 0,993 veces el pico de la normal. Con 5.000 medias la casilla
    // central lleva ≈399 ± 20, y la más alta de las centrales sube un poco: banda [0,85 ; 1,35].
    await configurar(page, 'Uniforme', 30, 5000);
    await lanzar(page, 30);
    const d = await leerDibujo(page, HISTOGRAMA);
    const cociente = cocienteBarraCurva(d);
    expect(cociente).toBeGreaterThan(0.85);
    expect(cociente).toBeLessThan(1.35);
  });

  test('casos de aula en la app: el 2, el 8 y el 11 se aceptan; el 8 con n = 30 se suspende', async ({ page }) => {
    const veredicto = page.locator('[role="alert"]').filter({ hasText: /Correcto|No es esa/ });
    for (const [caso, opcion] of [
      [2, 'Se reducirá a la mitad'], // √(1/4) = 1/2
      [8, 'n = 100'], // (2,886751/0,5)² = 33,33 → el primero de la lista que llega es 100
      [11, 'Por 9'], // √n × 3 ⇒ n × 9
    ] as const) {
      await page.getByRole('button', { name: new RegExp(`^Caso ${caso}:`) }).click();
      await expect(page.getByRole('button', { name: 'Comprobar predicción' })).toBeDisabled();
      await page.getByRole('radio', { name: opcion, exact: true }).click();
      await page.getByRole('button', { name: 'Comprobar predicción' }).click();
      await expect(veredicto).toContainText('Correcto');
    }
    await page.getByRole('button', { name: /^Caso 8:/ }).click();
    await page.getByRole('radio', { name: 'n = 30', exact: true }).click();
    await page.getByRole('button', { name: 'Comprobar predicción' }).click();
    await expect(veredicto).toContainText('No es esa. La respuesta correcta es: n = 100.');
  });
});

test.describe('Inspector 28/09/2026 — en móvil (390 × 844, táctil)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test('el caso 7 se ejecuta con el dedo, las cifras cuadran y el tracker corre UNA vez', async ({ page }) => {
    test.setTimeout(120_000);
    // En localhost el tracker no envía nada, pero deja este aviso cada vez que su efecto
    // corre: es el mismo número de POST a /api/analytics/track/ que habría en producción. Una
    // página que montara el Footer en dos ramas del árbol lo haría correr más de una vez.
    let arranquesTracker = 0;
    page.on('console', (m) => {
      if (m.text().includes('[Analytics]')) arranquesTracker++;
    });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="checkbox"]']);

    await page.getByRole('button', { name: /^Moneda sesgada/ }).tap();
    await page.getByRole('group', { name: 'Tamaño muestral' }).getByRole('button', { name: '10', exact: true }).tap();
    await page.getByRole('group', { name: 'Número de muestras' }).getByRole('button', { name: '5000', exact: true }).tap();
    await expect(referenciaDe(page, 'Media empírica X̄')).toHaveText('μ teórica = 0,900');
    await expect(referenciaDe(page, 'σ empírica')).toHaveText('σ/√n teórica = 0,0949');

    await page.getByRole('button', { name: 'Lanzar simulación' }).tap();
    await expect(page.getByText(/Simulación completa con n = 10\./)).toBeVisible({ timeout: 60_000 });
    await expect(valorDe(page, 'Muestras generadas')).toHaveText('5000');

    const media = await leerCifra(page, 'Media empírica X̄'); // 0,9 ± 4·0,00134
    expect(media).toBeGreaterThan(0.8946);
    expect(media).toBeLessThan(0.9054);
    const sigma = await leerCifra(page, 'σ empírica'); // 0,094868 ± 5·0,00106
    expect(sigma).toBeGreaterThan(0.0896);
    expect(sigma).toBeLessThan(0.1002);
    const asimetria = await leerCifra(page, 'Asimetría (skew)'); // −0,843: cola a la IZQUIERDA
    expect(asimetria).toBeLessThan(-0.4);
    expect(asimetria).toBeGreaterThan(-1.3);

    // La predicción del caso 7 coincide con lo que se acaba de ver.
    await page.getByRole('button', { name: /^Caso 7:/ }).tap();
    await page.getByRole('radio', { name: 'Hacia la izquierda' }).tap();
    await page.getByRole('button', { name: 'Comprobar predicción' }).tap();
    await expect(page.locator('[role="alert"]').filter({ hasText: /Correcto|No es esa/ })).toContainText(
      'Correcto: hacia la izquierda.',
    );
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /Practicar/ }).tap();
    await page.getByRole('checkbox').tap();

    // Nada desborda a lo ancho, y el histograma tiene tamaño real.
    const anchos = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(anchos[0]).toBeLessThanOrEqual(anchos[1]);
    const lienzo = await page.locator(`canvas[aria-label="${HISTOGRAMA}"]`).boundingBox();
    expect(lienzo?.width ?? 0).toBeGreaterThan(200);
    expect(lienzo?.height ?? 0).toBeGreaterThan(200);

    expect(arranquesTracker).toBe(1);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════════════════
   HALLAZGOS ABIERTOS (inspector 28/09/2026). Afirman lo que DEBERÍA pasar y hoy fallan a
   propósito: cuando se reparen, se les quita el `test.fail()` y quedan como regresión.
   ══════════════════════════════════════════════════════════════════════════════════════════ */

test.describe('Inspector 28/09/2026 — hallazgos abiertos', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120_000);
    await instrumentarLienzos(page);
  });

  test('HALLAZGO ABIERTO 1 · moneda justa, n = 10: las barras no pueden triplicar la normal superpuesta', async ({
    page,
  }) => {
    // HALLAZGO ABIERTO (inspector 28/09/2026): con las dos monedas, la media de n tiradas solo
    // toma los valores k/n, pero `dibujarMedias` reparte las medias en 40 casillas de ancho
    // 8·σ(X̄)/40 —más estrechas que el paso 1/n— y divide cada recuento por ESE ancho. Salen
    // púas separadas por huecos cuya altura multiplica la de la N(μ, σ/√n) que la casilla
    // «Superponer … para comparar» pinta encima: el TCL parece NO cumplirse justo donde los
    // casos 7, 9 y 12 mandan mirar.
    // ENTRADA moneda justa · n = 10 · 5.000 muestras
    // ESPERADO barra del 0,5 / pico de la normal ≈ 0,975 (P(k=5)/h = 2,4609 frente a 2,5231)
    // OBTENIDO ≈ 3,1 (7,78 frente a 2,52), 11 púas en 40 casillas.
    test.fail();
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="checkbox"]']);
    await configurar(page, 'Moneda justa', 10, 5000);
    await expect(referenciaDe(page, 'σ empírica')).toHaveText('σ/√n teórica = 0,1581');
    await lanzar(page, 10);
    const d = await leerDibujo(page, HISTOGRAMA);
    expect(d.textos.slice(0, 7)).toEqual(['-0,13', '0,08', '0,29', '0,50', '0,71', '0,92', '1,13']);
    expect(d.barras.length).toBeGreaterThan(0);
    const cociente = cocienteBarraCurva(d);
    expect(cociente).toBeGreaterThan(0.7);
    expect(cociente).toBeLessThan(1.3);
  });

  test('HALLAZGO ABIERTO 2 · la explicación de una población simétrica no dice que la asimetría «todavía se nota»', () => {
    // HALLAZGO ABIERTO (inspector 28/09/2026): en «Practicar», la variante «¿hacia qué lado
    // caerá la cola?» sale con la uniforme, la moneda justa o la bimodal (1/3 × 3/5 = el 20 %
    // de los ejercicios). La respuesta correcta es «simétrica» y el primer paso lo calcula
    // bien (0/√n = 0), pero el tercero es la frase fija del caso asimétrico.
    // ENTRADA Practicar → «Población moneda justa (mitad y mitad), con n = 25. ¿Hacia qué lado
    //         caerá la cola…?» → «Hacia ninguno: será simétrica» → Comprobar
    // ESPERADO una explicación coherente con asimetría 0
    // OBTENIDO «Con n = 25 la asimetría ya se ha reducido respecto a la población (0), pero
    //          todavía se nota: no basta con que n sea «grande» en abstracto.»
    test.fail();
    for (const poblacion of ['uniforme', 'bernoulli_05', 'bimodal'] as const) {
      const r = resolverCaso({ tipo: 'lado-cola', poblacion, n: 25 });
      expect(r.clave).toBe('simetrica');
      expect(r.pasos.join(' '), poblacion).not.toMatch(/todavía se nota/);
    }
  });

  test('HALLAZGO ABIERTO 3 · la sección de casos no manda mover un deslizador que no existe', async ({ page }) => {
    // HALLAZGO ABIERTO (inspector 28/09/2026): reparación incompleta del 1054, que ya lo
    // señalaba como «añadido menor»: n y el número de muestras son BOTONES, y la sección dice
    // «deslizador» en cuatro sitios — su introducción, el cierre de cada solución, el
    // enunciado del caso 8 («De los tamaños que ofrece el deslizador (1, 2, 4, …)») y su
    // explicación («De los valores que ofrece el deslizador…»).
    // ENTRADA abrir la página → Caso 8 → elegir «n = 100» → Comprobar
    // ESPERADO ninguna mención a un deslizador · OBTENIDO «mueve el deslizador y mira si ocurre…»
    test.fail();
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="checkbox"]']);
    await expect(page.locator('input[type="range"]')).toHaveCount(0);
    await page.getByRole('button', { name: /^Caso 8:/ }).click();
    await page.getByRole('radio', { name: 'n = 100', exact: true }).click();
    await page.getByRole('button', { name: 'Comprobar predicción' }).click();
    const seccion = page.getByRole('heading', { name: 'Casos para clase' }).locator('xpath=../..');
    await expect(seccion).not.toContainText(/deslizador/i);
  });

  test('HALLAZGO ABIERTO 4 · al pulsar «Lanzar simulación» el histograma queda a la vista', async ({ page }) => {
    // HALLAZGO ABIERTO (inspector 28/09/2026): el histograma de medias está 354 px por debajo
    // del botón, y la app no desplaza nada al lanzar. En las resoluciones de escritorio de
    // las visitas recientes (1366×768, 1536×864…) quien baja hasta ver el botón y lo pulsa
    // solo ve el rótulo cambiar a «Generando muestras...» durante ~0,9 s: el resultado se
    // pinta fuera de la pantalla. En móvil (390×844), igual: empieza en y = 947.
    // ENTRADA ventana 1366×640 · desplazar hasta que el botón quede 20 px sobre el borde
    //         inferior · pulsar «Lanzar simulación»
    // ESPERADO alguna parte del histograma dentro de la ventana
    // OBTENIDO su borde superior en y ≈ 919, por debajo de los 640 px de la ventana
    test.fail();
    await page.setViewportSize({ width: 1366, height: 640 });
    await page.goto(RUTA);
    await esperarHidratacion(page, ['input[type="checkbox"]']);
    const boton = page.getByRole('button', { name: 'Lanzar simulación' });
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent?.includes('Lanzar simulación'));
      if (b) window.scrollTo(0, b.getBoundingClientRect().bottom + window.scrollY + 20 - window.innerHeight);
    });
    await boton.click();
    await expect(page.getByText(/Simulación completa con n = 30\./)).toBeAttached({ timeout: 60_000 });
    const arriba = await page.evaluate(
      (e) => document.querySelector(`canvas[aria-label="${e}"]`)?.getBoundingClientRect().top ?? Infinity,
      HISTOGRAMA,
    );
    expect(arriba).toBeLessThan(640);
  });
});
