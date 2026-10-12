import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';

/**
 * Inspector — tabla-grupos-funcionales (segmento interactiva, riesgo 3, 189 usos · Stemum/Química)
 *
 * Primera inspección: 20/09/2026. La app promete en su <h1> «Tabla de Grupos Funcionales» y en
 * su subtítulo «31 grupos funcionales de química orgánica con su fórmula, su sufijo y su prefijo
 * IUPAC […]. Ordena la tabla por prioridad y descubre qué grupo manda cuando hay varios en la
 * misma molécula». La metadata repite la promesa y el bloque educativo afirma que «la
 * nomenclatura recogida sigue las recomendaciones IUPAC de 2013, que son las vigentes».
 *
 * Aquí la verdad comprobable NO es un número sino el DATO QUÍMICO: el sufijo, el prefijo y el
 * puesto de cada grupo en la escalera de prioridad. Todo eso está fijado sin ambigüedad por las
 * recomendaciones IUPAC 2013, regla P-41 (tabla de seniority de clases), así que se puede
 * resolver con lápiz antes de abrir el navegador.
 *
 * DÓNDE VIVEN LOS DATOS
 *   app/tabla-grupos-funcionales/page.tsx → el array `GRUPOS` (líneas 343-1559) está hardcodeado
 *   en el propio componente, no en `data/`. Cada entrada lleva `sufijo`, `prefijo`, `prioridad`
 *   (número o null para los que solo pueden ser prefijo), ejemplo, diagrama y propiedades. El
 *   buscador (`resultados`, línea 1581) normaliza con `normalizar()` —minúsculas + NFD sin
 *   diacríticos— y busca por subcadena sobre nombre + fórmula + sufijo + prefijo + ejemplo +
 *   campo `busqueda` (sinónimos). No hay motor de cálculo separado porque no hay cálculo.
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (dato) — sufijo, prefijo y orden de prioridad IUPAC
 *     Fuente: IUPAC 2013, P-41 (orden decreciente de seniority de las clases). De mayor a menor:
 *     ácido carboxílico > ácido sulfónico > anhídrido > éster > haluro de acilo > amida >
 *     nitrilo > aldehído > cetona > alcohol y fenol > tiol > hidroperóxido > amina > imina >
 *     éter > insaturaciones > alcano. Y los cuatro puntos donde estas tablas suelen fallar:
 *       · Cetona  → sufijo «-ona», prefijo «oxo-» (NO «-al» ni «carbonil-»).
 *       · Aldehído→ sufijo «-al», prefijo «oxo-» / «formil-». Manda sobre la cetona.
 *       · Nitrilo → sufijo «-nitrilo», prefijo «ciano-». Va POR ENCIMA del aldehído.
 *       · Éter    → NO tiene sufijo en la nomenclatura sustitutiva; solo prefijo «alcoxi-».
 *
 *   CASO 2 (buscador) — «cetona» encuentra la cetona; escrito en mayúsculas («CETONA») y sin
 *     tilde («eter» frente a «Éter») tiene que encontrar lo mismo, porque `normalizar()` aplana
 *     mayúsculas y acentos en los DOS lados. Y debe buscar también por sufijo («-ona») y por el
 *     ejemplo de la ficha («acetona» → Propanona/acetona), no solo por el nombre del grupo.
 *
 *   CASO 3 (rechazo y filtro) — «zzzz» no es ningún grupo: se espera 0 resultados CON mensaje
 *     de estado vacío explícito, no una tabla en blanco. Y el filtro de categoría debe combinar
 *     con el buscador: «Nitrogenados» + «amina» deja las tres aminas y la imina —que entra
 *     con razón, porque su campo `busqueda` cita la condensación «aldehido amina» de la que
 *     procede—, mientras que «Nitrogenados» + «alcohol» tiene que dar 0 con mensaje, porque
 *     el alcohol es oxigenado y el filtro manda sobre el buscador.
 *
 * Los tres se ejecutaron contra http://localhost:3050/tabla-grupos-funcionales/ con Playwright
 * vía `node_modules/playwright` (no MCP) y coincidieron con lo resuelto a mano: los 31 grupos
 * salen en el orden IUPAC correcto, los cuatro sufijos/prefijos son los que dicta P-41, el
 * buscador normaliza mayúsculas y acentos y el estado vacío existe y nombra la consulta.
 */

const RUTA = '/tabla-grupos-funcionales/';
const BUSCADOR = '#buscador-grupos';

/** Los ids de las filas visibles, en el orden en que la app las pinta. */
async function idsVisibles(page: Page): Promise<string[]> {
  const botones = page.locator('li button[aria-controls^="detalle-"]');
  const total = await botones.count();
  const ids: string[] = [];
  for (let i = 0; i < total; i += 1) {
    const control = await botones.nth(i).getAttribute('aria-controls');
    ids.push((control ?? '').replace('detalle-', ''));
  }
  return ids;
}

/** Escribe en el buscador y espera a que el ESTADO de React recoja el valor. */
async function buscar(page: Page, termino: string): Promise<void> {
  await page.fill(BUSCADOR, termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await esperarHidratacion(page, [BUSCADOR]);
});

test('CASO 1 · dato: sufijo, prefijo y escalera de prioridad IUPAC 2013', async ({ page }) => {
  // La app arranca con los 31 grupos y el orden por categoría
  await expect(page.getByRole('status')).toHaveText('31 de 31 grupos funcionales');

  // ── Sufijo y prefijo de los cuatro grupos donde estas tablas suelen fallar ──
  // IUPAC 2013 P-66.6: la cetona es «-ona» como sufijo y «oxo-» como prefijo.
  const cetona = page.locator('li button[aria-controls="detalle-cetona"]');
  await expect(cetona).toContainText('-ona');
  await expect(cetona).toContainText('oxo-');

  // IUPAC 2013 P-66.6.1: el aldehído es «-al»; como prefijo, «oxo-» (o «formil-» si el
  // carbono del CHO queda fuera de la cadena principal).
  const aldehido = page.locator('li button[aria-controls="detalle-aldehido"]');
  await expect(aldehido).toContainText('-al');
  await expect(aldehido).toContainText('formil-');

  // IUPAC 2013 P-66.5: el nitrilo es «-nitrilo» como sufijo y «ciano-» como prefijo.
  const nitrilo = page.locator('li button[aria-controls="detalle-nitrilo"]');
  await expect(nitrilo).toContainText('-nitrilo');
  await expect(nitrilo).toContainText('ciano-');

  // IUPAC 2013 P-63.2.4: el éter NO tiene sufijo en la nomenclatura sustitutiva; solo el
  // prefijo «alcoxi-» (metoxi-, etoxi-…).
  const eter = page.locator('li button[aria-controls="detalle-eter"]');
  await expect(eter).toContainText('alcoxi-');
  await expect(eter).toContainText('nunca es sufijo');

  // ── Orden de prioridad (IUPAC 2013, P-41: seniority de clases) ──
  await page.getByRole('button', { name: 'Prioridad IUPAC' }).click();
  const orden = await idsVisibles(page);

  // Los once puestos que fija la regla, de mayor a menor mando
  const escalera = [
    'acido-carboxilico', // 1 · si está, siempre da el sufijo
    'acido-sulfonico', //   2
    'anhidrido', //         3
    'ester', //             4
    'haluro-acilo', //      5
    'amida', //             6
    'nitrilo', //           7 · por ENCIMA del aldehído
    'aldehido', //          8 · por ENCIMA de la cetona
    'cetona', //            9
    'alcohol', //          10
    'tiol', //             11
    'amina-primaria', //   13 (el 12 es el hidroperóxido, sin fila propia)
    'imina', //            14
    'eter', //             15 · el último con heteroátomo
  ];
  const posicion = (id: string) => orden.indexOf(id);
  for (let i = 1; i < escalera.length; i += 1) {
    expect(
      posicion(escalera[i - 1]),
      `${escalera[i - 1]} debe salir antes que ${escalera[i]}`,
    ).toBeLessThan(posicion(escalera[i]));
  }

  // El primero de la lista es el ácido carboxílico y el último bloque son los «solo prefijo»
  expect(orden[0]).toBe('acido-carboxilico');
  await expect(page.locator('li button[aria-controls="detalle-nitro"]')).toContainText(
    'Solo prefijo',
  );
  await expect(page.locator('li button[aria-controls="detalle-haluro-alquilo"]')).toContainText(
    'Solo prefijo',
  );

  // Y el badge numérico coincide con la escalera escrita arriba
  await expect(cetona).toContainText('Prioridad 9');
  await expect(aldehido).toContainText('Prioridad 8');
  await expect(nitrilo).toContainText('Prioridad 7');
  await expect(eter).toContainText('Prioridad 15');
});

test('CASO 2 · buscador: normaliza mayúsculas y acentos, y busca por sufijo y por ejemplo', async ({
  page,
}) => {
  // Por nombre del grupo
  await buscar(page, 'cetona');
  expect(await idsVisibles(page)).toEqual(['cetona']);
  await expect(page.getByRole('status')).toHaveText('1 de 31 grupos funcionales');

  // En MAYÚSCULAS: `normalizar()` pasa a minúsculas los dos lados → mismo resultado
  await buscar(page, 'CETONA');
  expect(await idsVisibles(page)).toEqual(['cetona']);

  // Sin tilde: «eter» tiene que encontrar «Éter» (NFD + borrado de diacríticos)
  await buscar(page, 'eter');
  expect(await idsVisibles(page)).toContain('eter');

  // Y con tilde y en mayúsculas, exactamente lo mismo
  const conTilde = await (async () => {
    await buscar(page, 'ÉTER');
    return idsVisibles(page);
  })();
  expect(conTilde).toContain('eter');

  // Por SUFIJO: «-ona» es el sufijo de la cetona, está en el campo `sufijo` de la ficha
  await buscar(page, '-ona');
  expect(await idsVisibles(page)).toEqual(['cetona']);

  // Por EJEMPLO: la ficha de la cetona trae «Propanona (acetona)» como ejemplo resuelto
  await buscar(page, 'acetona');
  expect(await idsVisibles(page)).toEqual(['cetona']);

  // Por fórmula y por sinónimo regional, que es lo que promete el texto de ayuda
  await buscar(page, 'COOH');
  expect(await idsVisibles(page)).toEqual(['acido-carboxilico']);
  await buscar(page, 'mercaptano');
  expect(await idsVisibles(page)).toEqual(['tiol']);
  await buscar(page, 'CHO');
  expect(await idsVisibles(page)).toEqual(['aldehido']);
});

test('CASO 2.bis · «NH2» devuelve el grupo amino, no los hidrocarburos', async ({ page }) => {
  // El texto de ayuda promete literalmente «NH2 la amina». Con búsqueda por subcadena se
  // colaban Alcano, Alqueno y Alquino por delante, porque sus fórmulas generales
  // —CnH2n+2, CnH2n, CnH2n−2— contienen «nh2» (hallazgo 991).
  await buscar(page, 'NH2');
  const ids = await idsVisibles(page);
  expect(ids).toContain('amina-primaria');
  expect(ids).not.toContain('alcano');
  expect(ids).not.toContain('alqueno');
  expect(ids).not.toContain('alquino');
  // La amida es legítima: lleva –CONH₂.
  expect(ids.every((id) => id.includes('amina') || id.includes('amida'))).toBe(true);

  // Y la fórmula general se sigue encontrando si es ELLA lo que se busca.
  await buscar(page, 'CnH2n');
  expect(await idsVisibles(page)).toContain('alcano');
});

test('la ficha del peróxido no confunde bencilo con benzoílo', async ({ page }) => {
  // El peróxido de dibenzoílo es (C₆H₅–CO–O–)₂, con restos benzoílo (acilo). Con restos
  // bencilo (C₆H₅–CH₂–) sería peróxido de dibencilo, y la propia app define «bencil-» bien
  // en la fila del areno (hallazgo 990).
  await buscar(page, 'peroxido');
  await page.locator('li button[aria-controls="detalle-peroxido"]').first().click();
  const ficha = page.locator('#detalle-peroxido');
  await expect(ficha).toContainText('si los restos son benzoílo');
  await expect(ficha).not.toContainText('dibenzoílo, si los restos son bencílicos');
});

test('CASO 3 · rechazo y filtro: estado vacío explícito y combinación con el buscador', async ({
  page,
}) => {
  // Una consulta que no es ningún grupo: 0 resultados CON mensaje, no una tabla en blanco
  await buscar(page, 'zzzz');
  await expect(page.getByRole('status')).toHaveText('0 de 31 grupos funcionales');
  expect(await idsVisibles(page)).toEqual([]);
  await expect(page.getByText('Ningún grupo funcional coincide con «zzzz»')).toBeVisible();

  // Filtro por categoría + buscador a la vez: los nitrogenados que casan con «amina»
  await page.getByRole('button', { name: 'Limpiar' }).click();
  await buscar(page, 'amina');
  await page.getByRole('button', { name: 'Nitrogenados', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Nitrogenados', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await idsVisibles(page)).toEqual([
    'amina-primaria',
    'amina-secundaria',
    'amina-terciaria',
    'imina',
  ]);

  // El filtro manda sobre el buscador: el alcohol es oxigenado, así que con el filtro de
  // nitrogenados puesto no puede salir, y el estado vacío tiene que aparecer igualmente
  await buscar(page, 'alcohol');
  await expect(page.getByRole('status')).toHaveText('0 de 31 grupos funcionales');
  await expect(page.getByText('Ningún grupo funcional coincide con «alcohol»')).toBeVisible();

  // «Limpiar» devuelve consulta y filtro a su estado inicial
  await page.getByRole('button', { name: 'Limpiar' }).click();
  await expect(page.getByRole('status')).toHaveText('31 de 31 grupos funcionales');
  await expect(page.getByRole('button', { name: 'Todas', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator(BUSCADOR)).toHaveValue('');
});

// ═══════════════════════════════════════════════════════════════════════════════
// FICHA DE BÚSQUEDA PARA EL AULA · 12/10/2026
// ═══════════════════════════════════════════════════════════════════════════════

import {
  CASOS,
  TOTAL_CASOS,
  resolverCaso,
  normalizarRespuesta,
  comprobarRespuesta,
  generarPreguntaAleatoria,
} from '../../app/tabla-grupos-funcionales/casos';
import { GRUPOS, coincideConLaBusqueda, normalizar } from '../../app/tabla-grupos-funcionales/datos';

/**
 * Ficha de búsqueda de aula — invariantes de la sistemática `/casos-aula-meskeia`, tipo B.
 *
 * Esta app es una TABLA DE CONSULTA: la tarea no es resolver sino LOCALIZAR, así que las
 * respuestas son texto y no hay tolerancia numérica. Lo que sustituye a la tolerancia es la
 * normalización (minúsculas, tildes fuera, guiones de los extremos fuera, sin artículo) más una
 * lista de sinónimos que `casos.ts` genera desde la propia tabla.
 *
 * CÓMO SE DERIVA CADA VALOR ESPERADO DE ESTE BLOQUE
 * Resuelto con la IUPAC 2013 delante, no con lo que devuelve la app:
 *
 *   1 · Cetona como grupo principal → sufijo «-ona» (propanona). P-64.
 *   2 · Alcohol cuando cede el sufijo → prefijo «hidroxi-». P-63.1.
 *   3 · El sufijo «-al» es el del aldehído (metanal, etanal). P-66.6.
 *   4 · Escalera de ESTA tabla: ácido 1, sulfónico 2, anhídrido 3, éster 4, haluro de acilo 5,
 *       amida 6. Es el orden de P-41; el número es el puesto en la tabla (convenio 2).
 *   5 · CH₃–COO–CH₂–CH₃: ácido de 2 C (etanoico → etanoato) + resto etilo → etanoato de etilo.
 *   6 · Aldehído (8) por encima de cetona (9). P-41.
 *   7 · Nitrilo (7) por encima de aldehído (8). P-41: es la que la intuición falla.
 *   8 · El grupo nitro nunca es sufijo, solo prefijo «nitro-» (P-61.5); el nitrilo sí lo es.
 *   9 · Ácido láctico CH₃–CH(OH)–COOH = ácido 2-hidroxipropanoico: manda el ácido carboxílico.
 *  10 · Ácido pirúvico CH₃–CO–COOH = ácido 2-oxopropanoico: la cetona va como «oxo-».
 *  11 · El tolueno es el metilbenceno: un areno (hidrocarburo aromático).
 *  12 · CH₃–COOH: 2 carbonos → ácido etanoico (el tradicional es ácido acético).
 *
 * EL CONVENIO QUE SE BLINDA AQUÍ es doble: (a) cuando se pide un nombre, el SISTEMÁTICO, y el
 * tradicional se rechaza con su propio aviso; (b) una comparación sin respuesta única —dos
 * grupos empatados, dos hidrocarburos, un sufijo que comparten dos grupos— no se pregunta.
 */

const PAISES_Y_CIUDADES_GF =
  /\b(España|Espa(ñ|n)ol|M(é|e)xico|Mexicano|Colombia|Argentina|Chile|Per(ú|u)|Venezuela|Uruguay|Bolivia|Paraguay|Guatemala|Cuba|Madrid|Barcelona|Sevilla|Bogot(á|a)|Buenos Aires|Caracas|Montevideo|Quito|La Habana|Par(í|i)s|Londres|Nueva York|Estados Unidos|Francia|Italia|Roma|Alemania|Berl(í|i)n|Portugal|Lisboa|euros?|d(ó|o)lar(es)?)\b/i;

/** Las respuestas resueltas a mano, en la grafía más llana que escribiría un alumno */
const A_MANO = [
  'ona',
  'hidroxi',
  'aldehido',
  '6',
  'etanoato de etilo',
  'aldehido',
  'nitrilo',
  'nitro',
  'acido carboxilico',
  'oxo',
  'areno',
  'acido etanoico',
];

test.describe('Tabla de Grupos Funcionales · ficha de búsqueda para el aula', () => {
  test('1 · hay exactamente 12 preguntas, con ids 1..12 sin huecos', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS).toHaveLength(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · son deterministas: dos lecturas dan el mismo enunciado y la misma respuesta', () => {
    const primera = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    const segunda = CASOS.map((c) => `${c.id}|${c.enunciado}|${c.respuesta}`);
    expect(segunda).toEqual(primera);
  });

  test('3 · la respuesta declarada coincide con releerla de la tabla', () => {
    for (const caso of CASOS) {
      const releida = resolverCaso(caso.datos);
      expect(releida.ok, `pregunta ${caso.id} no resuelve: ${releida.error}`).toBe(true);
      expect(releida.valor, `pregunta ${caso.id}`).toBe(caso.respuesta);
    }
  });

  test('3.bis · las respuestas son las resueltas a mano con la IUPAC delante', () => {
    CASOS.forEach((caso, i) => {
      expect(
        comprobarRespuesta(A_MANO[i], caso).correcto,
        `pregunta ${caso.id}: «${A_MANO[i]}» debería valer y la tabla dice «${caso.respuesta}»`,
      ).toBe(true);
    });
  });

  test('4 · cada pregunta trae enunciado, etiqueta, respuesta no vacía y dónde mirar', () => {
    for (const caso of CASOS) {
      expect(caso.enunciado.trim().length, `pregunta ${caso.id}`).toBeGreaterThan(20);
      expect(caso.etiquetaRespuesta.trim().length, `pregunta ${caso.id}`).toBeGreaterThan(0);
      expect(caso.respuesta.trim().length, `pregunta ${caso.id}`).toBeGreaterThan(0);
      expect(caso.pasos.length, `pregunta ${caso.id}`).toBeGreaterThan(1);
      expect(caso.pista.trim().length, `pregunta ${caso.id}`).toBeGreaterThan(0);
    }
  });

  test('5 · ningún enunciado nombra un país, una ciudad ni una moneda', () => {
    for (const caso of CASOS) {
      expect(PAISES_Y_CIUDADES_GF.test(caso.titulo), `título de la ${caso.id}`).toBe(false);
      expect(PAISES_Y_CIUDADES_GF.test(caso.enunciado), `enunciado de la ${caso.id}`).toBe(false);
      expect(PAISES_Y_CIUDADES_GF.test(caso.pista), `pista de la ${caso.id}`).toBe(false);
    }
  });

  test('6 · la práctica al azar es reproducible, variada y saca los datos de la propia tabla', () => {
    for (const semilla of [1, 7, 42, 12345, 999999]) {
      const a = generarPreguntaAleatoria(semilla);
      const b = generarPreguntaAleatoria(semilla);
      expect(b.enunciado, `semilla ${semilla}`).toBe(a.enunciado);
      expect(b.respuesta, `semilla ${semilla}`).toBe(a.respuesta);
    }

    const enunciados = new Set<string>();
    const respuestas = new Set<string>();
    const campos = new Set<string>();
    for (let semilla = 1; semilla <= 40; semilla++) {
      const pregunta = generarPreguntaAleatoria(semilla);
      enunciados.add(pregunta.enunciado);
      respuestas.add(pregunta.respuesta);
      campos.add(pregunta.campo);
      expect(pregunta.enunciado.trim().length, `semilla ${semilla}`).toBeGreaterThan(20);
      // Su propia respuesta tiene que aceptarse: si divergieran, el alumno entrenaría con
      // una regla y sería corregido con otra.
      expect(comprobarRespuesta(pregunta.respuesta, pregunta).correcto, `semilla ${semilla}`).toBe(true);
    }
    // REPRODUCIBLE NO ES VARIADO (simulador-genetica, 14/09/2026).
    expect(enunciados.size).toBeGreaterThanOrEqual(20);
    expect(respuestas.size).toBeGreaterThanOrEqual(10);
    expect(campos.size).toBeGreaterThanOrEqual(4);
  });

  test('6.bis · «quién manda» en la práctica obedece a la escalera y nunca cae en un empate', () => {
    let vistas = 0;
    for (let semilla = 1; semilla <= 400; semilla++) {
      const p = generarPreguntaAleatoria(semilla);
      if (p.campo !== 'manda-de-dos') continue;
      vistas += 1;
      const nombres = [...p.enunciado.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
      expect(nombres, `semilla ${semilla}`).toHaveLength(2);
      const grupos = nombres.map((n) =>
        GRUPOS.find((g) => g.nombre.replace(/\s*\([^)]*\)\s*/g, ' ').trim() === n),
      );
      expect(grupos.every(Boolean), `semilla ${semilla}: ${nombres.join(' / ')}`).toBe(true);
      const [a, b] = grupos as NonNullable<(typeof grupos)[number]>[];
      // Los dos tienen puesto, distinto, y no son los dos hidrocarburos.
      expect(a.prioridad, `semilla ${semilla}`).not.toBeNull();
      expect(b.prioridad, `semilla ${semilla}`).not.toBeNull();
      expect(a.prioridad, `semilla ${semilla}`).not.toBe(b.prioridad);
      expect(a.categoria === 'hidrocarburos' && b.categoria === 'hidrocarburos').toBe(false);
      const manda = (a.prioridad as number) < (b.prioridad as number) ? a : b;
      expect(p.respuesta, `semilla ${semilla}`).toBe(manda.nombre);
    }
    expect(vistas, 'la práctica nunca pregunta quién manda').toBeGreaterThan(10);
  });

  test('7 · comparar normalizado acepta los sinónimos declarados y rechaza lo demás', () => {
    // Lo que la normalización SÍ perdona: mayúsculas, tildes, guiones de los extremos,
    // subíndices, artículo y la palabra «grupo» delante.
    expect(normalizarRespuesta('  -ONA ')).toBe(normalizarRespuesta('ona'));
    expect(normalizarRespuesta('oxo-')).toBe(normalizarRespuesta('oxo'));
    expect(normalizarRespuesta('El grupo NITRO')).toBe(normalizarRespuesta('nitro'));
    expect(normalizarRespuesta('–NO₂')).toBe(normalizarRespuesta('no2'));
    expect(normalizarRespuesta('Ácido Etanoico.')).toBe(normalizarRespuesta('acido etanoico'));
    // …y lo que NO: un guion interior es parte del nombre.
    expect(normalizarRespuesta('4-metilfenol')).toBe('4-metilfenol');

    for (const caso of CASOS) {
      expect(comprobarRespuesta(caso.respuesta, caso).correcto, `pregunta ${caso.id}`).toBe(true);
      for (const sinonimo of caso.sinonimos) {
        expect(comprobarRespuesta(sinonimo, caso).correcto, `pregunta ${caso.id}, «${sinonimo}»`).toBe(true);
      }
      // Ninguna trampa coincide con una respuesta aceptada…
      for (const trampa of caso.trampas) {
        for (const grafia of trampa.grafias) {
          expect(comprobarRespuesta(grafia, caso).correcto, `pregunta ${caso.id}, trampa «${grafia}»`).toBe(false);
        }
      }
      // …y la cadena vacía no es un aprobado gratis.
      expect(comprobarRespuesta('', caso).correcto, `pregunta ${caso.id}`).toBe(false);
      expect(comprobarRespuesta('   ', caso).correcto, `pregunta ${caso.id}`).toBe(false);
      expect(comprobarRespuesta('zzzz', caso).correcto, `pregunta ${caso.id}`).toBe(false);
    }
  });

  test('7.bis · el convenio: se pide el nombre sistemático, y el tradicional recibe su aviso', () => {
    const vinagre = CASOS[11];
    const acetico = comprobarRespuesta('ácido acético', vinagre);
    expect(acetico.correcto).toBe(false);
    expect(acetico.motivo).toContain('tradicional');

    const ester = CASOS[4];
    expect(comprobarRespuesta('acetato de etilo', ester).correcto).toBe(false);
    expect(comprobarRespuesta('acetato de etilo', ester).motivo).toContain('tradicional');

    // Confundir sufijo y prefijo, o dar el grupo que cede, tiene nombre propio.
    expect(comprobarRespuesta('oxo-', CASOS[0]).motivo).toContain('PREFIJO');
    expect(comprobarRespuesta('-ol', CASOS[1]).motivo).toContain('SUFIJO');
    expect(comprobarRespuesta('aldehído', CASOS[6]).motivo).toContain('CEDE');
    expect(comprobarRespuesta('carboxi-', CASOS[9]).motivo).toContain('manda');
  });

  test('7.ter · lo que no tiene una sola respuesta no se pregunta', () => {
    // Empates de la escalera: alcohol y fenol comparten el 10.
    expect(resolverCaso({ campo: 'manda-de-dos', grupos: ['alcohol', 'fenol'] }).ok).toBe(false);
    // Dos hidrocarburos: decide la cadena principal, no la escalera (estireno = etenilbenceno).
    expect(resolverCaso({ campo: 'manda-de-dos', grupos: ['alqueno', 'areno'] }).ok).toBe(false);
    // Un sufijo compartido no identifica un grupo: «-ol» es de alcohol y de fenol, y «-amina»
    // de las tres aminas aunque solo la primaria lo escriba a secas.
    expect(resolverCaso({ campo: 'grupo-desde-sufijo', sufijo: '-ol' }).ok).toBe(false);
    expect(resolverCaso({ campo: 'grupo-desde-sufijo', sufijo: '-amina' }).ok).toBe(false);
    // Un afijo compuesto admitiría varias grafías.
    expect(resolverCaso({ campo: 'sufijo', grupo: 'acido-carboxilico' }).ok).toBe(false);
    expect(resolverCaso({ campo: 'prefijo', grupo: 'eter' }).ok).toBe(false);
    // Un término del buscador que deja varias filas.
    expect(resolverCaso({ campo: 'grupo-desde-busqueda', termino: 'amina' }).ok).toBe(false);
    // Y nada de esto lanza: devuelve un error que la vista puede pintar.
    const inventado = resolverCaso({ campo: 'sufijo', grupo: 'no-existe' });
    expect(inventado.ok).toBe(false);
    expect(inventado.error).toBeTruthy();
  });

  test('7.quater · la pregunta del buscador usa el MISMO buscador que la página', () => {
    // El caso 11 se resuelve tecleando «tolueno». Si el buscador de la página y el que lee
    // la ficha fueran dos, uno podría dejar una fila y el otro ninguna.
    const filas = GRUPOS.filter((g) => coincideConLaBusqueda(g, normalizar('tolueno')));
    expect(filas.map((g) => g.id)).toEqual(['areno']);
    expect(GRUPOS).toHaveLength(31);
  });

  test('en la página: la pregunta 7 corrige, avisa de la trampa y no estorba al buscador', async ({ page }) => {
    // La sección nueva no añade ningún role="status": el contador del buscador sigue solo.
    await expect(page.getByRole('status')).toHaveCount(1);
    await expect(page.locator(BUSCADOR)).toBeFocused();

    const seccion = page.locator('#casos-aula');
    await seccion.getByRole('button', { name: /^Pregunta 7:/ }).click();
    await expect(seccion.getByRole('button', { name: /^Pregunta 7:/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(seccion).toContainText('Nitrilo contra aldehído');

    const casilla = '#aula-respuesta';
    await page.fill(casilla, 'Aldehído');
    await esperarValorEnReact(page, casilla, 'Aldehído');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('CEDE');

    await page.fill(casilla, 'nitrilo');
    await esperarValorEnReact(page, casilla, 'nitrilo');
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('Correcto');

    // «Dónde mirar» enseña el recorrido y la respuesta que da la tabla.
    await seccion.getByRole('button', { name: 'Dónde mirar' }).click();
    await expect(page.locator('#aula-pasos')).toContainText('Prioridad 7');
    await expect(page.locator('#aula-pasos')).toContainText('Prioridad 8');

    // Lo que el caso 11 manda teclear deja de verdad una sola fila en la tabla.
    await buscar(page, 'tolueno');
    expect(await idsVisibles(page)).toEqual(['areno']);
  });

  test('en la página: la práctica arranca en la semilla 1 y «Otra pregunta» la cambia', async ({ page }) => {
    const seccion = page.locator('#casos-aula');
    await seccion.getByRole('tab', { name: 'Práctica al azar' }).click();
    const esperada = generarPreguntaAleatoria(1);
    await expect(seccion).toContainText('semilla 1');
    await expect(seccion).toContainText(esperada.enunciado);

    await page.fill('#aula-respuesta-practica', esperada.respuesta);
    await esperarValorEnReact(page, '#aula-respuesta-practica', esperada.respuesta);
    await seccion.getByRole('button', { name: 'Comprobar' }).click();
    await expect(seccion.getByRole('alert')).toContainText('Correcto');

    await seccion.getByRole('button', { name: 'Otra pregunta' }).click();
    await expect(seccion.getByRole('alert')).toHaveCount(0);
    await expect(page.locator('#aula-respuesta-practica')).toHaveValue('');
  });
});
