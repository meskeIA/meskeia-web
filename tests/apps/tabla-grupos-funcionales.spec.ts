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
