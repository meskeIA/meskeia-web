import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { jsonLd } from '../../app/calculadora-escalas/metadata';
import {
  ESCALAS_CONOCIDAS,
  construirEscalaGrafica,
  convertirLista,
  convertirSuperficie,
  deducirEscala,
  factorDe,
  factorEntreEscalas,
  formatearNumero,
  medidaEnPlano,
  medidaReal,
  parsearEscala,
  partirLista,
  textoDeEscala,
  tipoDeEscala,
  type Escala,
} from '../../app/calculadora-escalas/motor';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  resolverCaso,
  toleranciaDe,
} from '../../app/calculadora-escalas/casos';

/**
 * Calculadora de Escalas — motor y casos para clase (11/09/2026)
 *
 * El motor se prueba aquí sin navegador porque el build no ve una escala invertida: un muro
 * de 7,2 cm en un plano 1:50 son 3,6 m si se multiplica y 1,44 mm si se divide, y las dos
 * cifras compilan y se pintan igual de bien. Y los 12 casos CORRIGEN respuestas de alumnos,
 * así que un error aquí no se ve: la app seguiría funcionando y suspendería a quien acierta.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO
 *   Todos calculados a mano desde la definición de escala, NUNCA copiados de la app.
 *
 *   Una escala es la razón dibujo : realidad, y su factor es numerador/denominador:
 *     dibujo = real × factor        real = dibujo ÷ factor
 *
 *   · Caso 1  · 7,2 cm × 50 = 360 cm = 3,6 m
 *   · Caso 2  · 4,5 m = 450 cm; 450 ÷ 100 = 4,5 cm
 *   · Caso 3  · 6 m = 600 cm; 3 : 600 = 1 : 200 → denominador 200
 *   · Caso 4  · 2,4 mm × 5 = 12 mm (ampliación: el dibujo crece)
 *   · Caso 5  · 26,1 m = 2.610 cm; 2.610 ÷ 87 = 30 cm
 *   · Caso 6  · (1/50) ÷ (1/200) = 200/50 = 4
 *   · Caso 7  · 24 cm² × 50² = 24 × 2.500 = 60.000 cm² = 6 m²   ← el CUADRADO, no el factor
 *   · Caso 8  · 210 ÷ 25 = 8,4 cm
 *   · Caso 9  · 1 km = 100.000 cm; 2 : 100.000 = 1 : 50.000 → denominador 50.000
 *   · Caso 10 · 12,5 cm × 1.000 = 12.500 cm = 125 m
 *   · Caso 11 · 4,3 m = 430 cm; 430 ÷ 43 = 10 cm
 *   · Caso 12 · 600 m² = 6.000.000 cm²; ÷ 500² = ÷ 250.000 = 24 cm²
 *
 *   Los casos 7 y 12 son el mismo cálculo en los dos sentidos y por eso se comprueban el uno
 *   con el otro: en 1:50, 24 cm² de papel son 6 m² reales; en 1:500, 600 m² reales son 24 cm².
 */

const E = (numerador: number, denominador: number): Escala => ({ numerador, denominador });

test.describe('Calculadora de Escalas · el motor', () => {
  // ----------------------------------------------------------------
  // El convenio: qué es el factor y en qué sentido se aplica
  // ----------------------------------------------------------------
  test('el factor de una reducción es menor que 1 y el de una ampliación, mayor', () => {
    expect(factorDe(E(1, 50))).toBeCloseTo(0.02, 12);
    expect(factorDe(E(5, 1))).toBe(5);
    expect(factorDe(E(1, 1))).toBe(1);
    expect(tipoDeEscala(E(1, 50))).toBe('reduccion');
    expect(tipoDeEscala(E(5, 1))).toBe('ampliacion');
    expect(tipoDeEscala(E(1, 1))).toBe('natural');
  });

  test('del plano a la realidad se agranda, y de la realidad al plano se reduce', () => {
    // 7,2 cm de plano en 1:50 son 360 cm = 3,6 m.
    expect(medidaReal(7.2, 'cm', E(1, 50), 'm').valor).toBeCloseTo(3.6, 10);
    // Y el camino de vuelta devuelve el punto de partida.
    expect(medidaEnPlano(3.6, 'm', E(1, 50), 'cm').valor).toBeCloseTo(7.2, 10);
  });

  test('ida y vuelta devuelven siempre el valor original', () => {
    for (const escala of [E(1, 20), E(1, 87), E(1, 1000), E(5, 1), E(1, 1)]) {
      for (const valor of [1, 2.5, 12.5, 300]) {
        const ida = medidaEnPlano(valor, 'm', escala, 'mm');
        const vuelta = medidaReal(ida.valor, 'mm', escala, 'm');
        expect(vuelta.valor, `${textoDeEscala(escala)} con ${valor} m`).toBeCloseTo(valor, 8);
      }
    }
  });

  test('la unidad de salida no cambia la medida, solo cómo se escribe', () => {
    const enMetros = medidaReal(7.2, 'cm', E(1, 50), 'm').valor;
    const enCentimetros = medidaReal(7.2, 'cm', E(1, 50), 'cm').valor;
    const enMilimetros = medidaReal(7.2, 'cm', E(1, 50), 'mm').valor;
    expect(enCentimetros).toBeCloseTo(enMetros * 100, 8);
    expect(enMilimetros).toBeCloseTo(enMetros * 1000, 8);
  });

  // ----------------------------------------------------------------
  // Deducir una escala
  // ----------------------------------------------------------------
  test('deducir la escala normaliza a numerador 1 en las reducciones', () => {
    // 3 cm ↔ 6 m = 600 cm → 3:600 → 1:200
    const r = deducirEscala(3, 'cm', 6, 'm');
    expect(r.ok).toBe(true);
    expect(r.escala).toEqual({ numerador: 1, denominador: 200 });
    expect(textoDeEscala(r.escala!)).toBe('1:200');
  });

  test('deducir la escala de un mapa: 2 cm ↔ 1 km es 1:50.000', () => {
    const r = deducirEscala(2, 'cm', 1, 'km');
    expect(r.escala).toEqual({ numerador: 1, denominador: 50000 });
  });

  test('deducir una ampliación deja el 1 en el denominador', () => {
    // 12 mm de dibujo ↔ 2,4 mm reales → 5:1
    const r = deducirEscala(12, 'mm', 2.4, 'mm');
    expect(r.escala).toEqual({ numerador: 5, denominador: 1 });
    expect(textoDeEscala(r.escala!)).toBe('5:1');
  });

  test('deducir una escala rechaza lo que no es una escala', () => {
    expect(deducirEscala(0, 'cm', 6, 'm').ok).toBe(false);
    expect(deducirEscala(3, 'cm', 0, 'm').ok).toBe(false);
    expect(deducirEscala(-3, 'cm', 6, 'm').ok).toBe(false);
    expect(deducirEscala(NaN, 'cm', 6, 'm').ok).toBe(false);
  });

  // ----------------------------------------------------------------
  // Entre escalas
  // ----------------------------------------------------------------
  test('pasar de 1:200 a 1:50 multiplica las medidas por 4', () => {
    expect(factorEntreEscalas(E(1, 200), E(1, 50))).toBeCloseTo(4, 12);
    // Y al revés, las divide entre 4.
    expect(factorEntreEscalas(E(1, 50), E(1, 200))).toBeCloseTo(0.25, 12);
    // Entre la misma escala no cambia nada.
    expect(factorEntreEscalas(E(1, 50), E(1, 50))).toBeCloseTo(1, 12);
  });

  // ----------------------------------------------------------------
  // Superficies: el cuadrado
  // ----------------------------------------------------------------
  test('las superficies escalan con el CUADRADO del factor, no con el factor', () => {
    // 24 cm² en 1:50 → 24 × 2.500 = 60.000 cm² = 6 m²
    const real = convertirSuperficie(24, 'cm', E(1, 50), 'm', 'plano-a-real');
    expect(real.valor).toBeCloseTo(6, 8);
    // Aplicar el factor lineal habría dado 0,12 m²: el error clásico del tema.
    expect(real.valor).not.toBeCloseTo(0.12, 3);
  });

  test('los casos 7 y 12 se comprueban el uno con el otro', () => {
    const deCasoSiete = convertirSuperficie(24, 'cm', E(1, 50), 'm', 'plano-a-real');
    expect(deCasoSiete.valor).toBeCloseTo(6, 8);
    const deCasoDoce = convertirSuperficie(600, 'm', E(1, 500), 'cm', 'real-a-plano');
    expect(deCasoDoce.valor).toBeCloseTo(24, 8);
  });

  test('ida y vuelta de una superficie devuelve el valor original', () => {
    const ida = convertirSuperficie(85, 'm', E(1, 100), 'cm', 'real-a-plano');
    const vuelta = convertirSuperficie(ida.valor, 'cm', E(1, 100), 'm', 'plano-a-real');
    expect(vuelta.valor).toBeCloseTo(85, 8);
  });

  // ----------------------------------------------------------------
  // Lectura de escalas escritas a mano
  // ----------------------------------------------------------------
  test('una escala se puede escribir con dos puntos, con barra o con espacio', () => {
    for (const texto of ['1:50', '1/50', '1 50']) {
      const r = parsearEscala(texto);
      expect(r.ok, `«${texto}»`).toBe(true);
      expect(r.escala, `«${texto}»`).toEqual({ numerador: 1, denominador: 50 });
    }
  });

  test('un número suelto se entiende como el denominador de una reducción', () => {
    // Quien escribe «50» en una casilla de escala quiere 1:50, no 50:1.
    expect(parsearEscala('50').escala).toEqual({ numerador: 1, denominador: 50 });
  });

  test('la coma decimal de una escala es decimal, no separador', () => {
    // «1:2,5» es uno a dos coma cinco. Con parseFloat sobre la cadena entera daría otra cosa.
    const r = parsearEscala('1:2,5');
    expect(r.ok).toBe(true);
    expect(r.escala).toEqual({ numerador: 1, denominador: 2.5 });
  });

  test('una escala imposible se rechaza con un motivo, no con una excepción', () => {
    for (const texto of ['', 'abc', '1:0', '0:50', '-1:50', '1:2:3']) {
      const r = parsearEscala(texto);
      expect(r.ok, `«${texto}»`).toBe(false);
      expect(r.error, `«${texto}»`).not.toBeNull();
    }
  });

  test('una medida negativa o no numérica no produce un resultado', () => {
    expect(medidaReal(-5, 'cm', E(1, 50), 'm').ok).toBe(false);
    expect(medidaReal(NaN, 'cm', E(1, 50), 'm').ok).toBe(false);
    expect(medidaEnPlano(-1, 'm', E(1, 50), 'cm').ok).toBe(false);
    expect(convertirSuperficie(-1, 'm', E(1, 50), 'cm', 'real-a-plano').ok).toBe(false);
  });

  // ----------------------------------------------------------------
  // Listas de medidas — el gotcha del separador
  // ----------------------------------------------------------------
  test('partir una lista NO usa la coma, que en español es el separador decimal', () => {
    // Si se partiera por comas, «1,5 3 4,5» daría los trozos «1», «5 3 4» y «5», y el de en
    // medio se leería como 534 sin que nada avisara.
    expect(partirLista('1,5 3 4,5')).toEqual(['1,5', '3', '4,5']);
    expect(partirLista('1,5\n3\n4,5')).toEqual(['1,5', '3', '4,5']);
    expect(partirLista('1,5;3;4,5')).toEqual(['1,5', '3', '4,5']);
    expect(partirLista('   ')).toEqual([]);
  });

  test('una lista se convierte entera y señala solo la línea que falla', () => {
    const filas = convertirLista('7,2\n3\nabc', 'cm', E(1, 50), 'm', 'plano-a-real');
    expect(filas).toHaveLength(3);
    expect(filas[0].ok).toBe(true);
    expect(filas[0].salida).toBeCloseTo(3.6, 10);
    expect(filas[1].salida).toBeCloseTo(1.5, 10);
    expect(filas[2].ok).toBe(false);
    expect(filas[2].error).not.toBeNull();
    // La entrada original se conserva para poder señalarla en pantalla.
    expect(filas[2].original).toBe('abc');
  });

  // ----------------------------------------------------------------
  // Escala gráfica
  // ----------------------------------------------------------------
  test('la escala gráfica tiene marcas en cifras redondas', () => {
    const grafica = construirEscalaGrafica(E(1, 100), 'm', 100);
    expect(grafica.ok).toBe(true);
    expect(grafica.divisiones.length).toBeGreaterThanOrEqual(2);
    // La primera marca es el cero y está en el origen del papel.
    expect(grafica.divisiones[0].valorReal).toBe(0);
    expect(grafica.divisiones[0].milimetrosEnPapel).toBe(0);
    // Todas las marcas son múltiplos del paso, y el paso es 1, 2 o 5 por década.
    const paso = grafica.divisiones[1].valorReal;
    const mantisa = paso / Math.pow(10, Math.floor(Math.log10(paso)));
    expect([1, 2, 5, 10]).toContain(Math.round(mantisa * 1000) / 1000);
  });

  test('la escala gráfica dice la verdad: cada marca cae donde le toca sobre el papel', () => {
    // En 1:100, 10 m reales son 100 mm de papel. Es lo que hace útil la regla impresa.
    const grafica = construirEscalaGrafica(E(1, 100), 'm', 100);
    for (const division of grafica.divisiones) {
      const esperadoMm = division.valorReal * 1000 * factorDe(E(1, 100));
      expect(division.milimetrosEnPapel, `marca de ${division.valorReal} m`).toBeCloseTo(
        esperadoMm,
        8,
      );
    }
    expect(grafica.longitudPapelMm).toBeLessThanOrEqual(100.0001);
  });

  test('la escala gráfica no se pasa del ancho de papel pedido', () => {
    for (const escala of [E(1, 20), E(1, 50), E(1, 87), E(1, 500), E(1, 50000)]) {
      for (const unidad of ['m', 'km'] as const) {
        const grafica = construirEscalaGrafica(escala, unidad, 120);
        if (!grafica.ok) continue;
        expect(grafica.longitudPapelMm, `${textoDeEscala(escala)} en ${unidad}`).toBeLessThanOrEqual(
          120.0001,
        );
      }
    }
  });

  test('la escala gráfica rechaza lo imposible sin lanzar', () => {
    expect(construirEscalaGrafica(E(1, 50), 'm', 0).ok).toBe(false);
    expect(construirEscalaGrafica(E(1, 50), 'm', -10).ok).toBe(false);
    expect(construirEscalaGrafica(E(1, 50), 'm', NaN).ok).toBe(false);
  });

  // ----------------------------------------------------------------
  // Catálogo de escalas
  // ----------------------------------------------------------------
  test('las escalas conocidas están bien formadas y sin repetir', () => {
    const vistas = new Set<string>();
    for (const conocida of ESCALAS_CONOCIDAS) {
      expect(conocida.escala.numerador, conocida.etiqueta).toBeGreaterThan(0);
      expect(conocida.escala.denominador, conocida.etiqueta).toBeGreaterThan(0);
      expect(conocida.uso.trim(), conocida.etiqueta).not.toBe('');
      const clave = `${conocida.escala.numerador}:${conocida.escala.denominador}`;
      expect(vistas.has(clave), `${conocida.etiqueta} está repetida`).toBe(false);
      vistas.add(clave);
    }
    // Las tres familias están representadas.
    for (const familia of ['dibujo', 'maqueta', 'mapa'] as const) {
      expect(ESCALAS_CONOCIDAS.some((c) => c.familia === familia), familia).toBe(true);
    }
  });

  test('el formato es español y no rellena de ceros', () => {
    expect(formatearNumero(3.6)).toBe('3,6');
    expect(formatearNumero(50)).toBe('50');
    expect(formatearNumero(50000)).toBe('50000'); // una escala no lleva separador de millares
    expect(formatearNumero(8.4)).toBe('8,4');
    expect(formatearNumero(NaN)).toBe('—');
  });
});

test.describe('Calculadora de Escalas · casos para clase', () => {
  // ----------------------------------------------------------------
  // Invariante 1 — 12 casos con ids 1..12 sin huecos
  // ----------------------------------------------------------------
  test('hay exactamente 12 casos con ids consecutivos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  // ----------------------------------------------------------------
  // Invariante 2 — deterministas
  // ----------------------------------------------------------------
  test('dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    const huella = () => CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuestaTexto}`);
    expect(huella()).toEqual(huella());
  });

  // ----------------------------------------------------------------
  // Invariante 3 — la respuesta declarada coincide con recalcularla
  // ----------------------------------------------------------------
  test('recalcular cada caso desde sus datos devuelve la respuesta declarada', () => {
    for (const caso of CASOS) {
      const recalculado = resolverCaso(caso.datos);
      expect(recalculado.ok, `caso ${caso.id}`).toBe(true);
      expect(recalculado.valor, `caso ${caso.id}`).toBeCloseTo(caso.respuesta, 9);
    }
  });

  // ----------------------------------------------------------------
  // Invariante 4 — cada caso está completo
  // ----------------------------------------------------------------
  test('cada caso tiene enunciado, etiqueta no vacía, respuesta finita y desarrollo', () => {
    for (const caso of CASOS) {
      expect(caso.titulo.length, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.enunciado.length, `caso ${caso.id}`).toBeGreaterThan(30);
      expect(caso.etiquetaRespuesta.trim(), `caso ${caso.id}`).not.toBe('');
      expect(Number.isFinite(caso.respuesta), `caso ${caso.id}`).toBe(true);
      expect(caso.respuesta, `caso ${caso.id}`).toBeGreaterThan(0);
      expect(caso.pasos.length, `caso ${caso.id}`).toBeGreaterThanOrEqual(3);
      expect(caso.pista.trim(), `caso ${caso.id}`).not.toBe('');
    }
  });

  test('las respuestas salen limpias: ninguna pasa de dos decimales', () => {
    // Regla de diseño: si un caso exigiera redondeo, tendría que decirlo en el enunciado.
    for (const caso of CASOS) {
      if (caso.requiereRedondeo) continue;
      const decimales = (caso.respuestaTexto.split(',')[1] ?? '').length;
      expect(decimales, `caso ${caso.id} devuelve ${caso.respuestaTexto}`).toBeLessThanOrEqual(2);
    }
  });

  // ----------------------------------------------------------------
  // Invariante 5 — enunciados universales
  // ----------------------------------------------------------------
  test('ningún enunciado nombra un país ni una ciudad', () => {
    const prohibido =
      /\b(españa|espana|madrid|barcelona|méxico|mexico|colombia|argentina|perú|peru|chile|bogotá|bogota|lima|buenos aires|euros?|pesos?)\b/i;
    for (const caso of CASOS) {
      expect(prohibido.test(caso.titulo), `título del caso ${caso.id}`).toBe(false);
      expect(prohibido.test(caso.enunciado), `enunciado del caso ${caso.id}`).toBe(false);
      for (const paso of caso.pasos) {
        expect(prohibido.test(paso), `paso del caso ${caso.id}`).toBe(false);
      }
    }
  });

  // ----------------------------------------------------------------
  // Invariante 6 — el generador aleatorio usa la misma aritmética
  // ----------------------------------------------------------------
  test('el ejercicio aleatorio es reproducible por semilla', () => {
    const primero = generarEjercicioAleatorio(2468);
    const segundo = generarEjercicioAleatorio(2468);
    expect(segundo.enunciado).toBe(primero.enunciado);
    expect(segundo.respuesta).toBe(primero.respuesta);
    expect(generarEjercicioAleatorio(13579).enunciado).not.toBe(primero.enunciado);
  });

  test('el ejercicio aleatorio siempre sale resuelto y con respuesta positiva', () => {
    for (let semilla = 1; semilla <= 80; semilla++) {
      const ejercicio = generarEjercicioAleatorio(semilla);
      expect(Number.isFinite(ejercicio.respuesta), `semilla ${semilla}`).toBe(true);
      expect(ejercicio.respuesta, `semilla ${semilla}`).toBeGreaterThan(0);
      expect(ejercicio.etiquetaRespuesta.trim(), `semilla ${semilla}`).not.toBe('');
      expect(ejercicio.pasos.length, `semilla ${semilla}`).toBeGreaterThanOrEqual(3);
    }
  });

  // ----------------------------------------------------------------
  // Invariante 7 — el convenio, fijado con un caso a mano
  // ----------------------------------------------------------------
  test('convenio · del plano a la realidad se MULTIPLICA por el denominador', () => {
    expect(CASOS[0].respuesta).toBeCloseTo(3.6, 10);
    expect(CASOS[0].respuestaTexto).toBe('3,6');
    expect(CASOS[0].unidad).toBe('m');
  });

  test('convenio · las superficies van con el CUADRADO del factor', () => {
    expect(CASOS[6].respuesta).toBeCloseTo(6, 10);
    // Y no con el factor lineal, que habría dado 0,48 m².
    expect(CASOS[6].respuesta).not.toBeCloseTo(0.48, 2);
  });

  // ----------------------------------------------------------------
  // Los doce valores, derivados a mano
  // ----------------------------------------------------------------
  test('los 12 casos dan exactamente los valores calculados a mano', () => {
    const esperados = [3.6, 4.5, 200, 12, 30, 4, 6, 8.4, 50000, 125, 10, 24];
    for (let i = 0; i < esperados.length; i++) {
      expect(CASOS[i].respuesta, `caso ${i + 1} (${CASOS[i].titulo})`).toBeCloseTo(esperados[i], 8);
    }
  });

  // ----------------------------------------------------------------
  // Comprobación de respuestas
  // ----------------------------------------------------------------
  test('la tolerancia es el mayor entre 0,01 y el 1 %', () => {
    // `toBeCloseTo` y no `toBe`: el 1 % de 3,6 en coma flotante es 0,036000000000000004.
    expect(toleranciaDe(3.6)).toBeCloseTo(0.036, 12);
    expect(toleranciaDe(0.5)).toBe(0.01); // aquí manda el suelo, que es exacto
    expect(toleranciaDe(50000)).toBeCloseTo(500, 9);
  });

  test('la coma decimal española se acepta, y «3,6» no se lee como 3', () => {
    expect(comprobarRespuesta('3,6', 3.6).correcto).toBe(true);
    expect(comprobarRespuesta('3.6', 3.6).correcto).toBe(true);
    expect(comprobarRespuesta('3', 3.6).correcto).toBe(false);
  });

  test('un punto con tres cifras detrás se lee con la lectura más cercana a la respuesta (C0569)', () => {
    // Antes, con parseSpanishNumber a secas, «2.125» era 2125 y se suspendía la respuesta 2,125.
    expect(comprobarRespuesta('2.125', 2.125).correcto).toBe(true);
    // Y donde la respuesta es de miles, el mismo texto sigue siendo millares.
    expect(comprobarRespuesta('2.125', 2125).correcto).toBe(true);
    expect(comprobarRespuesta('3.125', 2.125).correcto).toBe(false);
  });

  test('C0267: una respuesta exacta no tiene margen; la que exige redondear conserva el 1 %', () => {
    // Los 12 son exactos (test de arriba). Con el 1 % aprobaban 49.500 para 50.000 y 3,57 para 3,6.
    expect(comprobarRespuesta('49.500', CASOS[8].respuesta).correcto).toBe(false);
    expect(comprobarRespuesta('3,57', CASOS[0].respuesta).correcto).toBe(false);
    expect(comprobarRespuesta('50.000', CASOS[8].respuesta).correcto).toBe(true);
    // 2,125 exige redondear a dos decimales: 2,13 y 2,12 entran.
    expect(comprobarRespuesta('2,13', 2.125).correcto).toBe(true);
    expect(comprobarRespuesta('2,12', 2.125).correcto).toBe(true);
    // Lo que enseña la app como respuesta aprueba en los 12 casos y en 500 prácticas.
    for (const c of CASOS) expect(comprobarRespuesta(c.respuestaTexto, c.respuesta).correcto, `caso ${c.id}`).toBe(true);
    for (let s = 1; s <= 500; s++) {
      const e = generarEjercicioAleatorio(s);
      expect(comprobarRespuesta(e.respuestaTexto, e.respuesta).correcto, `semilla ${s}: ${e.respuestaTexto}`).toBe(true);
    }
  });

  test('una respuesta vacía o no numérica se distingue de un fallo', () => {
    expect(comprobarRespuesta('', 3.6).motivo).toBe('vacia');
    expect(comprobarRespuesta('  ', 3.6).motivo).toBe('vacia');
    expect(comprobarRespuesta('tres coma seis', 3.6).motivo).toBe('no-numerico');
    expect(comprobarRespuesta('12abc', 3.6).motivo).toBe('no-numerico');
    expect(comprobarRespuesta('9', 3.6).motivo).toBe('fallo');
  });

  test('el error clásico del caso 7 se marca como fallo, no se cuela por tolerancia', () => {
    // Aplicar el factor lineal a una superficie da 0,48 m² en vez de 6 m².
    expect(comprobarRespuesta('0,48', CASOS[6].respuesta).correcto).toBe(false);
  });

  // ----------------------------------------------------------------
  // Mezcla de categorías
  // ----------------------------------------------------------------
  test('hay casos de cálculo directo y casos de situación real', () => {
    const abstractos = CASOS.filter((c) => c.categoria === 'abstracto').length;
    const aplicados = CASOS.filter((c) => c.categoria === 'aplicado').length;
    expect(abstractos).toBeGreaterThanOrEqual(2);
    expect(aplicados).toBeGreaterThanOrEqual(6);
    expect(abstractos + aplicados).toBe(12);
  });
});

/**
 * Inspector (03/11/2026, primera inspección) — la app en el navegador.
 *
 * Hasta aquí el spec probaba el motor y los casos sin abrir la página. Esto la abre y mide
 * lo que se PINTA. Cada esperado está calculado a mano antes de ejecutar la app, con la
 * definición de escala (dibujo = real × n/d) y nada más:
 *
 *   CASO 1 (normal)
 *     · 1:200, plano→real, 4,35 cm → 4,35 × 200 = 870 cm = 8,7 m
 *     · deducir 4 cm ↔ 10 m: 10 m = 1.000 cm; 4 : 1.000 = 1 : 250
 *     · cambiar de 1:200 a 1:50: (1/50) ÷ (1/200) = 4
 *     · superficie a 1:200, 15 cm² de plano: 15 × 200² = 600.000 cm² = 60 m²
 *     · lista a 1:200 (cm → m): 2,5 → 500 cm = 5 m · 10 → 2.000 cm = 20 m · 0,75 → 150 cm = 1,5 m
 *     · ampliación 5:1, real→plano, 2,4 mm → 2,4 × 5 = 12 mm (el detalle dice «÷ 0,2»)
 *   CASO 2 (límite)
 *     · medida 0 a 1:50 → 0 m (cero es una medida válida, no un error)
 *     · escala gráfica 1:25000 en metros, barra de 100 mm: 100 mm × 25.000 = 2.500 m; paso
 *       2.500 / 5 = 500 m → marcas 0, 500, 1000, 1500, 2000 y 2500 a 20 mm unas de otras
 *     · aula, caso 5: 26,1 m = 2.610 cm; 2.610 ÷ 87 = 30 → «30» aprueba y «29,9» no (es exacta)
 *     · aula, caso 7: «0,12» (el factor lineal: 24 × 50 = 1.200 cm²) es el error clásico y suspende
 *   CASO 3 (rechazo)
 *     · medida −5 → «Una medida no puede ser negativa» · «12abc» → «Escribe una medida…»
 *     · escala 1:0 → «Los dos términos de una escala son positivos»
 *     · deducir con 0 en el dibujo → «Las dos medidas tienen que ser mayores que cero»
 *     · escala de destino «abc» → «La escala debe llevar dos números, como 1:50»
 *
 * Los HALLAZGO (ABIERTO) llevan test.fail(): pasan mientras el defecto siga ahí.
 */

const PANEL_CONVERTIR = '#panel-convertir';

async function escribir(page: Page, selector: string, valor: string) {
  await page.locator(selector).fill(valor);
  await esperarValorEnReact(page, selector, valor);
}

async function abrirPestana(page: Page, nombre: string) {
  await page.getByRole('tab', { name: nombre }).click();
  await expect(page.getByRole('tab', { name: nombre })).toHaveAttribute('aria-selected', 'true');
}

function casoDeAula(page: Page, id: number) {
  return page.locator('article', { has: page.locator(`#respuesta-caso-${id}`) });
}

/**
 * El texto de la página SIN los <script>: el JSON-LD va dentro del <body> y su texto contaría
 * como «visible» (la FAQ del FAQPage aparecería en la página aunque no se pinte). El bloque
 * educativo sí cuenta: nace plegado, pero está en el DOM.
 */
async function textoDePagina(page: Page): Promise<string> {
  return page.evaluate(() => {
    const copia = document.body.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('script, style').forEach((n) => n.remove());
    return (copia.textContent ?? '').replace(/\s+/g, ' ');
  });
}

async function comprobarCaso(page: Page, id: number, respuesta: string) {
  await escribir(page, `#respuesta-caso-${id}`, respuesta);
  const caso = casoDeAula(page, id);
  await caso.getByRole('button', { name: 'Comprobar' }).click();
  return caso.getByRole('alert');
}

test.describe('Calculadora de Escalas · en el navegador (inspector 03/11/2026)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculadora-escalas/');
    await esperarHidratacion(page, [
      '#escala',
      '#medida',
      '#medida-dibujo',
      '#escala-destino',
      '#superficie',
      '#respuesta-caso-5',
    ]);
  });

  test('CASO 1 (normal) · 1:200 en las seis herramientas, y una ampliación 5:1', async ({ page }) => {
    const panel = page.locator(PANEL_CONVERTIR);
    await escribir(page, '#escala', '1:200');
    await expect(page.getByText('1:200 · el dibujo es 200 veces más pequeño que la realidad')).toBeVisible();

    // 4,35 cm × 200 = 870 cm = 8,7 m
    await escribir(page, '#medida', '4,35');
    await expect(panel).toContainText('8,7 m');
    await expect(panel).toContainText('4,35 cm de plano × 200 = 8,7 m');

    // 4 cm ↔ 10 m = 1.000 cm → 1:250
    await abrirPestana(page, 'Deducir la escala');
    await escribir(page, '#medida-dibujo', '4');
    await escribir(page, '#medida-real-deducir', '10');
    await expect(page.locator('#panel-deducir').getByText('1:250', { exact: true })).toBeVisible();

    // De 1:200 a 1:50 → × 4
    await abrirPestana(page, 'Cambiar de escala');
    await escribir(page, '#escala-destino', '1:50');
    await expect(page.locator('#panel-cambiar')).toContainText('× 4');
    await expect(page.locator('#panel-cambiar')).toContainText(
      'El dibujo nuevo es más grande: todas las medidas se multiplican por 4.',
    );

    // 15 cm² × 200² = 600.000 cm² = 60 m²
    await abrirPestana(page, 'Superficies');
    await escribir(page, '#superficie', '15');
    await expect(page.locator('#panel-superficie')).toContainText('60 m²');
    await expect(page.locator('#panel-superficie')).toContainText('Factor aplicado: 200²');

    // 2,5 → 5 m · 10 → 20 m · 0,75 → 1,5 m
    await abrirPestana(page, 'Lista de medidas');
    await page.locator('#lista-medidas').fill('2,5\n10\n0,75');
    await esperarValorEnReact(page, '#lista-medidas', '2,5\n10\n0,75');
    const tabla = page.locator('#panel-lista table');
    await expect(tabla.locator('caption')).toHaveText('3 medidas convertidas a escala 1:200');
    await expect(tabla.locator('tbody td:nth-child(1)')).toHaveText(['2,5', '10', '0,75']);
    await expect(tabla.locator('tbody td:nth-child(2)')).toHaveText(['5', '20', '1,5']);

    // 5:1, de la realidad al plano, 2,4 mm → 12 mm
    await abrirPestana(page, 'Convertir medidas');
    await escribir(page, '#escala', '5:1');
    await panel.getByRole('button', { name: 'De la realidad al plano' }).click();
    await escribir(page, '#medida', '2,4');
    await page.selectOption('#unidad-entrada', 'mm');
    await page.selectOption('#unidad-salida', 'mm');
    await expect(panel).toContainText('12 mm');
    await expect(panel).toContainText('2,4 mm reales ÷ 0,2 = 12 mm');
  });

  test('CASO 2 (límite) · medida cero, escala gráfica de mapa y casos 5 y 7 de aula', async ({ page }) => {
    // 0 cm de plano son 0 m: cero no es un error
    await escribir(page, '#medida', '0');
    await expect(page.locator(PANEL_CONVERTIR)).toContainText('0 cm de plano × 50 = 0 m');

    // 1:25000 en metros con barra de 100 mm: 2.500 m, marcas cada 500 m
    await escribir(page, '#escala', '1:25000');
    await abrirPestana(page, 'Escala gráfica');
    const rotulos = await page.locator('#panel-grafica svg text').allTextContents();
    expect(rotulos.slice(0, 6)).toEqual(['0', '500', '1000', '1500', '2000', '2500']);
    await expect(page.locator('#panel-grafica')).toContainText(
      'La barra entera representa 2500 m y mide 100 mm sobre el papel.',
    );

    // Caso 5: 2.610 cm ÷ 87 = 30 exacto
    await expect(await comprobarCaso(page, 5, '30')).toContainText('¡Correcto!');
    await expect(await comprobarCaso(page, 5, '29,9')).toContainText('Todavía no');
    // Caso 7: 0,12 m² es aplicar el factor lineal a la superficie
    await expect(await comprobarCaso(page, 7, '0,12')).toContainText('Todavía no');
    await expect(await comprobarCaso(page, 7, '6')).toContainText('¡Correcto!');
  });

  test('CASO 3 (rechazo) · medidas y escalas imposibles avisan sin dar cifra', async ({ page }) => {
    const panel = page.locator(PANEL_CONVERTIR);
    await escribir(page, '#medida', '-5');
    await expect(panel.getByRole('alert')).toContainText('Una medida no puede ser negativa');
    await expect(panel).not.toContainText('de plano ×');

    await escribir(page, '#medida', '12abc');
    await expect(panel.getByRole('alert')).toContainText('Escribe una medida, por ejemplo 7,2');

    await escribir(page, '#escala', '1:0');
    await expect(
      page.locator('section[aria-labelledby="escala-activa"]').getByRole('alert'),
    ).toContainText('Los dos términos de una escala son positivos');

    await abrirPestana(page, 'Deducir la escala');
    await escribir(page, '#medida-dibujo', '0');
    await expect(page.locator('#panel-deducir').getByRole('alert')).toContainText(
      'Las dos medidas tienen que ser mayores que cero',
    );

    await abrirPestana(page, 'Cambiar de escala');
    await escribir(page, '#escala-destino', 'abc');
    await expect(page.locator('#panel-cambiar').getByRole('alert')).toContainText(
      'La escala debe llevar dos números, como 1:50',
    );
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · con una escala inválida arriba, las herramientas calculan con 1:50 sin decirlo', async ({
    page,
  }) => {
    // `escala = lecturaEscala.escala ?? { 1, 50 }` (page.tsx): si la casilla no se lee, todo
    // sigue calculando con 1:50. «1:25 000» (millar con espacio) da el aviso arriba y, debajo,
    // «10 cm de plano × 50 = 5 m» (a 1:25.000 serían 2.500 m); con «1:0», «7,2 cm … = 3,6 m»,
    // y el chip «1:50» sale pulsado. Esperado: ninguna cifra mientras la escala no sea válida.
    test.fail();
    const panel = page.locator(PANEL_CONVERTIR);
    await escribir(page, '#medida', '10');
    await escribir(page, '#escala', '1:25 000');
    await expect(
      page.locator('section[aria-labelledby="escala-activa"]').getByRole('alert'),
    ).toBeVisible();
    await expect(panel).not.toContainText('de plano ×', { timeout: 2000 });
    await escribir(page, '#escala', '1:0');
    await expect(panel).not.toContainText('de plano ×', { timeout: 2000 });
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · un bloque de dos columnas pegado en la lista funde cada fila en un número', async ({
    page,
  }) => {
    // partirLista parte por salto de línea y parseSpanishNumber quita los espacios y tabuladores
    // de cada trozo: «420⇥310» se lee 420310. A 1:50 (cm → m): 420 → 210 m, 310 → 155 m,
    // 250 → 125 m, 180 → 90 m. Hoy salen dos filas: 210155 m y 125090 m, sin aviso. La misma fila
    // sola («420⇥310⇥250⇥180», sin salto de línea) sí da las cuatro medidas.
    test.fail();
    await abrirPestana(page, 'Lista de medidas');
    await page.locator('#lista-medidas').fill('420\t310\n250\t180');
    await esperarValorEnReact(page, '#lista-medidas', '420\t310\n250\t180');
    const tabla = page.locator('#panel-lista table');
    await expect(tabla.locator('caption')).toContainText('a escala 1:50');
    await expect(tabla).not.toContainText('210155', { timeout: 2000 });
    await expect(tabla).not.toContainText('125090', { timeout: 2000 });
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · la escala gráfica redondea los rótulos a 4 decimales y repite marcas', async ({
    page,
  }) => {
    // 1:2 en kilómetros, barra de 100 mm: 200 mm = 0,0002 km, paso 0,00005 km. Esperado:
    // 0 · 0,00005 · 0,0001 · 0,00015 · 0,0002. Hoy: 0 · 0,0001 · 0,0001 · 0,0001 · 0,0002
    // (formatearNumero con 4 decimales): tres marcas distintas con el mismo rótulo.
    test.fail();
    await escribir(page, '#escala', '1:2');
    await abrirPestana(page, 'Escala gráfica');
    await page.selectOption('#unidad-grafica', 'km');
    await expect(page.locator('#panel-grafica')).toContainText('escala 1:2');
    const rotulos = (await page.locator('#panel-grafica svg text').allTextContents()).slice(0, -1);
    expect(rotulos.length).toBe(5);
    expect(new Set(rotulos).size).toBe(rotulos.length);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · formato: «1:50000», «250000 cm» y «Resultado: 50000» sin punto de millar', async ({
    page,
  }) => {
    // CLAUDE.md §2: a partir de cinco cifras se agrupa (50.000). El IGN rotula «1:25.000» y
    // «1:50.000», y la propia app escribe «1:25.000» en la FAQ y «1 : 50.000» en los pasos del
    // caso 9, cuyo «Resultado» dice «50000». formatearNumero no agrupa nunca.
    // 2 cm ↔ 1 km = 100.000 cm → 1:50.000 · 10 cm a 1:25.000 = 250.000 cm.
    test.fail();
    await abrirPestana(page, 'Deducir la escala');
    await escribir(page, '#medida-dibujo', '2');
    await escribir(page, '#medida-real-deducir', '1');
    await page.selectOption('#unidad-real-deducir', 'km');
    await expect(page.locator('#panel-deducir')).toContainText('1:50.000', { timeout: 2000 });

    await abrirPestana(page, 'Convertir medidas');
    await escribir(page, '#escala', '1:25.000');
    await escribir(page, '#medida', '10');
    await page.selectOption('#unidad-salida', 'cm');
    await expect(page.locator(PANEL_CONVERTIR)).toContainText('250.000 cm', { timeout: 2000 });

    await casoDeAula(page, 9).getByRole('button', { name: 'Ver solución' }).click();
    await expect(page.locator('#solucion-caso-9')).toContainText('Resultado: 50.000', { timeout: 2000 });
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · la FAQ da 0,48 m² como el error del factor lineal, y es 0,12 m²', async ({
    page,
  }) => {
    // 24 cm² × 50 (factor lineal) = 1.200 cm² = 0,12 m², como dice el paso 4 del caso 7. Las dos
    // FAQ (la visible y la del FAQPage) dicen «6 m² reales, no 0,48». 0,48 no sale de ningún
    // camino del error clásico. (Los comentarios de los tests «convenio · las superficies…» y
    // «el error clásico del caso 7…» de arriba repiten el 0,48.)
    test.fail();
    const cuerpo = await textoDePagina(page);
    expect(cuerpo).not.toContain('no 0,48');
    expect(JSON.stringify(jsonLd)).not.toContain('0,48');
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · H0: «la mitad de 43,5 es 87» y la escala 1 no es 1:43,5', async ({
    page,
  }) => {
    // 43,5 ÷ 2 = 21,75. Un modelo a la MITAD de tamaño tiene el denominador DOBLE: 2 × 43,5 = 87.
    // Y H0 es «medio 0»: la mitad de la escala 0, no de la escala 1. Está en la FAQ visible, en el
    // FAQPage y en el paso 4 del caso 5 de aula.
    test.fail();
    const cuerpo = await textoDePagina(page);
    expect(cuerpo).not.toContain('la mitad de 43,5 es 87');
    expect(cuerpo).not.toContain('escala 1, que es 1:43,5');
    expect(JSON.stringify(jsonLd)).not.toContain('escala 1, que es 1:43,5');
    expect(CASOS[4].pasos.join(' ')).not.toContain('escala 1, que es 1:43,5');
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · «36 m o 3,6 cm = has invertido la operación», y invertir da 1,44 mm', async ({
    page,
  }) => {
    // A 1:50, 7,2 cm de plano son 3,6 m. Invertir (÷ 50 en vez de × 50) da 0,144 cm = 1,44 mm,
    // como dice la propia lista de «Los errores más frecuentes». 36 m (×10) y 3,6 cm (÷100) son
    // errores de unidad, no de sentido.
    test.fail();
    const cuerpo = await textoDePagina(page);
    expect(cuerpo).toContain('un muro de 3,6 m sale de 1,44 mm');
    expect(cuerpo).not.toContain('te sale de 36 metros o de 3,6 centímetros, has invertido la operación');
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · cuatro preguntas están en las dos FAQ con respuestas distintas', async ({
    page,
  }) => {
    // FAQPage «¿Qué significa la escala 1:50 de un plano?» ↔ visible «¿Qué significa exactamente
    // la escala 1:50?», y lo mismo con la escala de un plano sin indicar, las superficies y H0.
    // La reparación es UNA constante que importen las dos (check:faq-unica): entonces cada
    // pregunta del FAQPage aparece, con su respuesta, en la página.
    test.fail();
    const cuerpo = await textoDePagina(page);
    interface NodoFaq {
      '@type': string;
      mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
    }
    const grafo = (jsonLd as unknown as { '@graph': NodoFaq[] })['@graph'];
    const faq = grafo.find((n) => n['@type'] === 'FAQPage');
    expect(faq?.mainEntity?.length ?? 0).toBeGreaterThan(0);
    for (const p of faq?.mainEntity ?? []) {
      expect(cuerpo, p.name).toContain(p.name);
      expect(cuerpo, p.name).toContain(p.acceptedAnswer.text);
    }
  });
});
