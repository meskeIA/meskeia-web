import { test, expect, Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact, sembrarValor } from './_hidratacion';

/**
 * Inspector — buscador-palabras-patron (segmento interactiva, riesgo 3, 116 usos reales)
 *
 * Primera inspección: 29/09/2026.
 *
 * QUÉ PROMETE
 *   <h1> «Buscador de Palabras por Patrón» · subtítulo «Encuentra palabras que encajan en huecos.
 *   Usa _ como comodín». Sintaxis que DECLARA (subtítulo y FAQ del bloque educativo): cada «_»
 *   es una letra cualquiera, también se acepta «?», las letras van fijas en su posición, la
 *   longitud del patrón ES la de la palabra, y se compara «en minúsculas y sin tildes». Dos
 *   filtros opcionales: «Debe contener» y «No debe contener» (letras sueltas, sin posición).
 *   Longitud máxima declarada en la FAQ: 20 caracteres.
 *
 * LA VERDAD COMPROBABLE ES DOBLE
 *   (a) todo resultado mostrado cumple el patrón, y (b) no falta ninguna palabra de la lista de
 *   la propia app que lo cumpla. La lista es public/data/diccionario-es.txt (Lemario de Olea):
 *   86.973 líneas no vacías, sin duplicados, en NFC, todo minúsculas y solo [a-z] más
 *   á é í ó ú ü ñ. La UI anuncia «86.973 palabras», la cifra del fichero.
 *
 * EL ORÁCULO — escrito y ejecutado ANTES de abrir el navegador
 *   Filtro propio en Node sobre ese fichero, sin importar nada de la app y sin NFD: una tabla
 *   explícita á→a é→e í→i ó→o ú→u ü→u, y la ñ como letra PROPIA del alfabeto (la RAE la cuenta
 *   como letra, no como n con tilde; el propio page.tsx valida «solo letras a-z, ñ y _», y la
 *   app hermana generador-anagramas la trata así desde su reparación: su CASO 2d, «la ñ NO es
 *   una n»). Todas las cifras literales de este fichero salen de ese oráculo.
 *
 * DÓNDE VIVE EL CÁLCULO — todo en app/buscador-palabras-patron/page.tsx
 *   normalizar()      ← toLowerCase + NFD + quitar U+0300–U+036F. Ese rango INCLUYE U+0303
 *                        (la tilde de la ñ), así que la ñ sale convertida en n: en el patrón,
 *                        en el diccionario y en los dos filtros. La validación /^[a-zñ_]+$/ nunca
 *                        llega a ver una ñ.
 *   buscar()          ← índice por longitud + RegExp `^…$` con «.» por cada comodín.
 *
 * LA SOSPECHA DE INTRO (SOSPECHAS.md, 27/09/2026) — CONFIRMADA
 *   No hay <form>, ni onKeyDown, ni enterKeyHint, y la búsqueda NO es en vivo: solo busca el
 *   botón «Buscar palabras». Intro no hace nada, en escritorio y en móvil. En un Pixel 7
 *   (393×851) el botón empieza 335 px por debajo del borde inferior del campo (y = 917 de 851,
 *   bajo el pliegue aun con el teclado cerrado), con los ejemplos y los dos filtros en medio.
 *   Es la forma del hallazgo 2278 de generador-anagramas.
 */

const URL_APP = '/buscador-palabras-patron/';

const CAMPO = '#pattern-input';
const CONTIENE = '#must-contain';
const NO_CONTIENE = '#must-not-contain';

/** Oráculo mínimo para comprobar la verdad (a) sobre lo que pinta la app: la ñ es letra propia. */
const SIN_TILDE: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };
const plano = (s: string): string =>
  [...s.toLowerCase()].map((c) => SIN_TILDE[c] ?? c).join('');
function cumplePatron(patron: string, palabra: string): boolean {
  const p = [...plano(patron)];
  const q = [...plano(palabra)];
  if (p.length !== q.length) return false;
  return p.every((c, i) => c === '_' || c === '?' || c === q[i]);
}

async function abrir(page: Page): Promise<void> {
  await page.goto(URL_APP);
  await esperarHidratacion(page, [CAMPO, CONTIENE, NO_CONTIENE]);
  // Sin diccionario el botón está deshabilitado: se espera a que cargue la lista entera
  await expect(page.getByText('Diccionario cargado: 86.973 palabras del español')).toBeVisible({
    timeout: 15000,
  });
}

const cabecera = (page: Page) => page.locator('[class*="resultsHeader"] h3');
const chips = (page: Page) => page.locator('[class*="wordChip"]');
const sinResultados = (page: Page) => page.locator('[class*="noResults"]');
const botonBuscar = (page: Page) => page.getByRole('button', { name: 'Buscar palabras' });

interface Filtros {
  contiene?: string;
  noContiene?: string;
}

/** Siembra el patrón (y los filtros) y pulsa «Buscar palabras». */
async function buscar(page: Page, patron: string, filtros: Filtros = {}): Promise<void> {
  await sembrarValor(page, CAMPO, patron);
  if (filtros.contiene) await sembrarValor(page, CONTIENE, filtros.contiene);
  if (filtros.noContiene) await sembrarValor(page, NO_CONTIENE, filtros.noContiene);
  await botonBuscar(page).click();
  await expect(cabecera(page).or(sinResultados(page))).toBeVisible();
}

async function palabras(page: Page): Promise<string[]> {
  return chips(page).allTextContents();
}

test.describe('buscador-palabras-patron', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  // ---------------------------------------------------------------------------------------
  // CASO 1 — normal: un comodín de una letra en medio
  // ---------------------------------------------------------------------------------------
  test.describe('CASO 1 · normal', () => {
    test('«c?sa» → casa y cosa, ni una más ni una menos', async ({ page }) => {
      // Oráculo: 4 letras, c · cualquiera · s · a → casa, cosa. Ninguna forma con tilde
      // encaja (cesa, cusa no están en el lemario).
      await buscar(page, 'c?sa');
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 2');
      expect(await palabras(page)).toEqual(['casa', 'cosa']);
    });

    test('«C_R_E_O», el patrón del caso de uso de crucigramas → los 25 del oráculo', async ({
      page,
    }) => {
      // Oráculo: 7 letras con C, R, E, O en 1.ª, 3.ª, 5.ª y 7.ª. Comprueba (a) y (b) a la vez
      // con la lista entera, en el orden alfabético español que aplica la app.
      await buscar(page, 'C_R_E_O');
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 25');
      const obtenidas = await palabras(page);
      expect([...obtenidas].sort()).toEqual(
        [
          'cardero', 'carnero', 'carpelo', 'carpeño', 'carrejo', 'carrero', 'carreto',
          'cartero', 'cerbelo', 'cerbero', 'cermeño', 'cerrero', 'cerreño', 'certero',
          'ciruelo', 'cordero', 'cornejo', 'cornero', 'corneto', 'cortejo', 'cortero',
          'cortezo', 'corveño', 'cárdeno', 'cérceno',
        ].sort(),
      );
    });

    test('ejemplo «_a_a_o» del propio botón → 166, todas cumplen el patrón', async ({ page }) => {
      // Oráculo: 166 palabras de 6 letras con A en 2.ª y 4.ª y O en 6.ª. Entre ellas casado y
      // bañado (que la metadata cita); narrado NO (tiene 7 letras y no está en el lemario).
      await page.getByRole('button', { name: '_a_a_o', exact: true }).click();
      await esperarValorEnReact(page, CAMPO, '_A_A_O');
      await botonBuscar(page).click();
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 166');
      const obtenidas = await palabras(page);
      expect(obtenidas).toHaveLength(166);
      expect(obtenidas.filter((w) => !cumplePatron('_a_a_o', w))).toEqual([]);
      expect(obtenidas).toContain('casado');
      expect(obtenidas).toContain('bañado');
      expect(obtenidas).not.toContain('narrado');
    });
  });

  // ---------------------------------------------------------------------------------------
  // CASO 2 — límites: tildes, mayúsculas, ñ, muchos resultados, longitud máxima, cero
  // ---------------------------------------------------------------------------------------
  test.describe('CASO 2 · límites', () => {
    test('tildes y mayúsculas: «cancion» y «CANCIÓN» encuentran «canción»', async ({ page }) => {
      // Promesa de la FAQ: «todo se compara en minúsculas y sin tildes». Oráculo: 1 palabra.
      await buscar(page, 'cancion');
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 1');
      expect(await palabras(page)).toEqual(['canción']);
      await buscar(page, 'CANCIÓN');
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 1');
      expect(await palabras(page)).toEqual(['canción']);
    });

    test('«C?SA» en mayúsculas da lo mismo que «c?sa»', async ({ page }) => {
      await buscar(page, 'C?SA');
      expect(await palabras(page)).toEqual(['casa', 'cosa']);
    });

    test('muchos resultados: «________» (8) pinta las 14.103, sin truncar', async ({ page }) => {
      // Oráculo: 14.103 lemas de 8 letras. La app no trunca ni pagina: los pinta todos.
      await buscar(page, '________');
      await expect(chips(page)).toHaveCount(14103);
    });

    test('recuento de cuatro cifras sin agrupar: «_____» → «5094» (RAE, 2010)', async ({ page }) => {
      // Oráculo: 5.094 lemas de 5 letras. Con cuatro cifras enteras no se agrupa.
      await buscar(page, '_____');
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 5094');
    });

    test(
      'ABIERTO · el recuento de cinco cifras lleva punto de miles: «14.103»',
      async ({ page }) => {
        // ABIERTO: la cabecera pinta `{results.length}` a pelo y sale «14103». El tamaño del
        // diccionario, dos líneas más arriba, sí usa toLocaleString('es-ES') («86.973»).
        test.fail();
        await buscar(page, '________');
        await expect(cabecera(page)).toHaveText('Palabras encontradas: 14.103');
      },
    );

    test('longitud máxima: 21 comodines tecleados se quedan en 20 → las 23 de 20 letras', async ({
      page,
    }) => {
      // La FAQ declara 20 caracteres. Oráculo: 23 lemas de exactamente 20 letras.
      await page.locator(CAMPO).pressSequentially('_'.repeat(21));
      await esperarValorEnReact(page, CAMPO, '_'.repeat(20));
      await expect(page.locator('[class*="helpText"]')).toContainText('Longitud: 20 letras');
      await botonBuscar(page).click();
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 23');
      const obtenidas = await palabras(page);
      expect(obtenidas).toContain('electroencefalograma');
      expect(obtenidas.every((w) => [...w].length === 20)).toBe(true);
    });

    test(
      'ABIERTO · pegar una palabra del lemario de 21 letras no la recorta en silencio',
      async ({ page }) => {
        // ABIERTO: maxLength={20} recorta lo pegado sin avisar. «electroencefalografía» (21
        // letras) está en el lemario; el campo se queda en «electroencefalografí», el contador
        // dice «20 letras» y la búsqueda responde «No se encontraron palabras». Esperado: la
        // palabra entera y encontrada, o un aviso del límite. Es la forma del 2279.
        test.fail();
        await page.locator(CAMPO).focus();
        await page.keyboard.insertText('electroencefalografía'); // como un pegado
        // Lo que recorta es el propio DOM (maxLength), así que basta mirar el campo
        await expect(page.locator(CAMPO)).toHaveValue('electroencefalografía', { timeout: 2000 });
      },
    );

    test('sin resultados: «zzzz» lo dice en vez de quedarse en blanco', async ({ page }) => {
      // Oráculo: 0 lemas de 4 letras con zzzz.
      await buscar(page, 'zzzz');
      await expect(chips(page)).toHaveCount(0);
      await expect(sinResultados(page)).toContainText(
        'No se encontraron palabras que coincidan con ese patrón.',
      );
    });

    test('ABIERTO · la ñ fija del patrón no admite la n: «_año» → 9 palabras', async ({ page }) => {
      // ABIERTO: normalizar() convierte la ñ en n, y «_año» busca en realidad «_ano».
      // Oráculo (ñ letra propia): baño, caño, daño, jaño, maño, paño, raño, taño, ñaño → 9.
      // Obtenido: 17, con cano, fano, mano, pano, rano, sano, tano y vano, que no encajan.
      test.fail();
      await buscar(page, '_año');
      expect([...(await palabras(page))].sort()).toEqual(
        ['baño', 'caño', 'daño', 'jaño', 'maño', 'paño', 'raño', 'taño', 'ñaño'].sort(),
      );
    });

    test('ABIERTO · «Debe contener: ñ» exige la ñ: «_____» → 123', async ({ page }) => {
      // ABIERTO: el filtro «ñ» se normaliza a «n». Oráculo: 123 lemas de 5 letras con ñ.
      // Obtenido: 1233 (también los 1.110 que solo llevan n, como «abano» o «ación»).
      test.fail();
      await buscar(page, '_____', { contiene: 'ñ' });
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 123');
    });

    test(
      'ABIERTO · Wordle con la N gris: «sue_o» sin «n» mantiene «sueño»',
      async ({ page }) => {
        // ABIERTO: el flujo que enseña la propia app para Wordle («las grises en "no debe
        // contener"»). Con la N gris, «no debe contener n» borra también toda palabra con ñ.
        // Oráculo: sue_o → sueco, suelo, sueno, suero, suevo, sueño; sin n → sueco, suelo,
        // suero, suevo, sueño (5). Obtenido: 4, sin «sueño», que podría ser la solución.
        test.fail();
        await buscar(page, 'sue_o', { noContiene: 'n' });
        expect([...(await palabras(page))].sort()).toEqual(
          ['sueco', 'suelo', 'suero', 'suevo', 'sueño'].sort(),
        );
      },
    );

    test('ABIERTO · «No debe contener: ñ» no descarta las palabras con n: «_____» → 4971', async ({
      page,
    }) => {
      // ABIERTO: el veto de «ñ» se normaliza a «n». Oráculo: 5.094 − 123 con ñ = 4.971.
      // Obtenido: 3861; faltan los 1.110 que llevan n y no ñ (p. ej. «mundo», «ajeno»).
      test.fail();
      await buscar(page, '_____', { noContiene: 'ñ' });
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 4971');
    });
  });

  // ---------------------------------------------------------------------------------------
  // CASO 3 — rechazo
  // ---------------------------------------------------------------------------------------
  test.describe('CASO 3 · rechazo', () => {
    test('patrón vacío o de un solo carácter: el botón no deja buscar', async ({ page }) => {
      await expect(botonBuscar(page)).toBeDisabled();
      await sembrarValor(page, CAMPO, 'a');
      await expect(botonBuscar(page)).toBeDisabled();
    });

    test('cifras y signos no declarados («c4sa», «c*sa») no buscan y lo dicen', async ({ page }) => {
      // «*» no forma parte de la sintaxis declarada (solo «_» y «?»).
      for (const patron of ['c4sa', 'c*sa']) {
        await buscar(page, patron);
        await expect(chips(page)).toHaveCount(0);
        await expect(sinResultados(page)).toContainText(
          'Comprueba que el patrón solo contiene letras y guiones bajos',
        );
      }
    });

    test('solo comodines NO se rechaza: «____» son las 1936 de 4 letras y «??» las 95 de 2', async ({
      page,
    }) => {
      // Es legítimo: el propio caso de uso de Wordle pide «filtrar a 5 letras». Oráculo: 1.936
      // lemas de 4 letras y 95 de 2.
      await buscar(page, '____');
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 1936');
      await buscar(page, '??');
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 95');
    });

    test(
      'ABIERTO · un espacio al final se descarta, como promete el bloque educativo',
      async ({ page }) => {
        // ABIERTO: «Errores frecuentes» dice «Espacios, números o signos de puntuación se
        // descartan automáticamente». No se descartan: «casa » (pegado con espacio final)
        // rechaza el patrón entero con «No se encontraron palabras que coincidan», y
        // «casa» está en el lemario. Esperado según la promesa: casa.
        test.fail();
        await buscar(page, 'casa ');
        expect(await palabras(page)).toEqual(['casa']);
      },
    );
  });

  // ---------------------------------------------------------------------------------------
  // INTRO Y ESTADO — la sospecha del 27/09/2026
  // ---------------------------------------------------------------------------------------
  test.describe('Intro y estado de los resultados', () => {
    test('ABIERTO · en escritorio, Intro en el campo busca como el botón', async ({ page }) => {
      // ABIERTO: sin <form>, onKeyDown ni búsqueda en vivo. Con el botón, «c?sa» da 2.
      test.fail();
      await sembrarValor(page, CAMPO, 'c?sa');
      await page.locator(CAMPO).press('Enter');
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 2', { timeout: 3000 });
    });

    test(
      'ABIERTO · editar el patrón tras una búsqueda vacía retira el «No se encontraron»',
      async ({ page }) => {
        // ABIERTO: tras buscar «zzzz», teclear «c?sa» deja en pantalla «No se encontraron
        // palabras que coincidan con ese patrón.» bajo un patrón que tiene 2. Con Intro sin
        // efecto, es lo que ve quien teclea y pulsa Intro. Es la forma del hallazgo 194.
        test.fail();
        await buscar(page, 'zzzz');
        await sembrarValor(page, CAMPO, 'c?sa');
        await expect(sinResultados(page)).toHaveCount(0);
      },
    );
  });

  // ---------------------------------------------------------------------------------------
  // ACCESIBILIDAD
  // ---------------------------------------------------------------------------------------
  test.describe('accesibilidad', () => {
    test('todos los botones llevan type="button"', async ({ page }) => {
      await expect(page.locator('button:not([type="button"])')).toHaveCount(0);
    });

    test('ABIERTO · la región viva anuncia el recuento, no la lista de palabras', async ({
      page,
    }) => {
      // ABIERTO: role="status" aria-live="polite" aria-atomic="true" envuelve la cabecera Y
      // la rejilla de chips. Con «________» la región lleva 14.103 palabras (112.851
      // caracteres) que el lector leería enteras. Se acota a la app: el anunciador de rutas de
      // Next y el aria-live del bloque educativo quedan fuera.
      test.fail();
      await buscar(page, 'c?sa');
      const regiones = page.locator('[class*="mainContent"] :is([aria-live], [role="status"])');
      await expect(regiones.locator('[class*="wordChip"]')).toHaveCount(0);
    });

    test('ABIERTO · «No se encontraron palabras» se anuncia en una región viva', async ({
      page,
    }) => {
      // ABIERTO: el aviso de cero resultados es un <div> sin role ni aria-live, y la única
      // región viva de resultados se desmonta cuando no hay ninguno.
      test.fail();
      await buscar(page, 'zzzz');
      const anunciado = page
        .locator('[class*="mainContent"] :is([aria-live], [role="status"], [role="alert"])')
        .filter({ hasText: 'No se encontraron palabras' });
      expect(await anunciado.count()).toBeGreaterThan(0);
    });

    test('ABIERTO · los emojis de los <h3> del bloque educativo llevan aria-hidden', async ({
      page,
    }) => {
      // ABIERTO: 📊 🎯 ❓ 📋 💡 van pegados al texto de cinco <h3> (page.tsx L281, 323, 366,
      // 424, 491) sin <span aria-hidden="true">.
      test.fail();
      const titulos = page.locator('h3', {
        hasText: /Comparativa con otras|Casos de uso reales|Preguntas frecuentes|Cómo sacar el máximo|Mejores prácticas/,
      });
      await expect(titulos).toHaveCount(5);
      const expuestos = await titulos.evaluateAll((els) =>
        els
          .filter((h) =>
            Array.from(h.childNodes).some(
              (n) => n.nodeType === Node.TEXT_NODE && /\p{Extended_Pictographic}/u.test(n.nodeValue ?? ''),
            ),
          )
          .map((h) => h.textContent?.trim() ?? ''),
      );
      expect(expuestos).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------------------
  // CONTENIDO — ejemplos que la app no puede devolver
  // ---------------------------------------------------------------------------------------
  test.describe('contenido', () => {
    test('ABIERTO · la metadata no cita NARRADO como resultado de «_A_A_O»', async ({ page }) => {
      // ABIERTO: description y og:description prometen «"_A_A_O" → CASADO, NARRADO». NARRADO
      // tiene 7 letras (no cabe en 6) y no está en el lemario; el CASO 1 lo confirma: 166
      // resultados sin «narrado».
      test.fail();
      const descripcion = await page.locator('meta[name="description"]').getAttribute('content');
      expect(descripcion ?? '').not.toContain('NARRADO');
    });

    test('ABIERTO · la FAQ no promete CAÍDA ni CASÉ para «c_s_»', async ({ page }) => {
      // ABIERTO: «un patrón c_s_ encontrará también palabras con tildes como CAÍDA o CASÉ» (y
      // la tarjeta «No te preocupes por las tildes» repite CASÉ). Oráculo: c_s_ → casa, casi,
      // caso, cese, cosa, coso (6), ninguna con tilde; CAÍDA tiene 5 letras y ninguna S, y
      // CASÉ no está en el lemario.
      test.fail();
      await buscar(page, 'c_s_');
      expect(await palabras(page)).toEqual(['casa', 'casi', 'caso', 'cese', 'cosa', 'coso']);
      await expect(page.locator('body')).not.toContainText('CAÍDA o CASÉ');
    });

    test('ABIERTO · el caso de crucigramas no cita CORREO para «C_R_E_O»', async ({ page }) => {
      // ABIERTO: «tienes C_R_E_O … verás CORREO, CARTERO, CIRUELO». CORREO tiene 6 letras;
      // los 25 del oráculo (CASO 1) no la incluyen.
      test.fail();
      await expect(page.locator('body')).not.toContainText('verás CORREO');
    });

    test('ABIERTO · la FAQ no remite a un filtro de longitud mínima que no existe', async ({
      page,
    }) => {
      // ABIERTO: «Si necesitas explorar palabras muy largas, baja la longitud mínima en
      // filtros». Los únicos campos son el patrón, «Debe contener» y «No debe contener».
      test.fail();
      await expect(page.locator('[class*="mainContent"] input')).toHaveCount(3);
      await expect(page.locator('body')).not.toContainText('baja la longitud mínima en filtros');
    });
  });

  // ---------------------------------------------------------------------------------------
  // MÓVIL — Pixel 7 (393×851, táctil). Medido el 29/09/2026: el campo acaba en y≈582 y el
  // botón «Buscar palabras» empieza en y≈917 de 851, bajo el pliegue aun sin teclado.
  // ---------------------------------------------------------------------------------------
  test.describe('móvil · Pixel 7', () => {
    test.use({
      viewport: { width: 393, height: 851 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 2.75,
      isMobile: true,
      hasTouch: true,
    });

    test('MÓVIL · con el botón, «c?sa» da casa y cosa sin desbordar en horizontal', async ({
      page,
    }) => {
      await page.locator(CAMPO).tap();
      await sembrarValor(page, CAMPO, 'c?sa');
      await botonBuscar(page).tap();
      await expect(cabecera(page)).toHaveText('Palabras encontradas: 2');
      expect(await palabras(page)).toEqual(['casa', 'cosa']);
      const [ancho, visible] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
      ]);
      expect(ancho).toBeLessThanOrEqual(visible);
    });

    test(
      'ABIERTO · la tecla de acción del teclado busca («search»/Intro)',
      async ({ page }) => {
        // ABIERTO: enterKeyHint vacío, sin <form>: el teclado ofrece la tecla genérica y al
        // pulsarla no pasa nada. Con el botón, «c?sa» da 2 (test anterior).
        test.fail();
        await page.locator(CAMPO).tap();
        await sembrarValor(page, CAMPO, 'c?sa');
        await page.locator(CAMPO).press('Enter');
        await expect(cabecera(page)).toHaveText('Palabras encontradas: 2', { timeout: 3000 });
        await expect(page.locator(CAMPO)).toHaveAttribute('enterkeyhint', 'search');
      },
    );
  });
});
