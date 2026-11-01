import { test, expect, type Page, type Locator } from '@playwright/test';
import { asentarAntesDeTraducir } from './_hidratacion';

/**
 * Testigo de familia — elemento condicional con un TEXTO hermano detrás, con la página traducida.
 *
 * DE DÓNDE SALE (cabo C0548, 31/10/2026; vecino de C0312 y de C0243)
 * `{x && <span>…</span>}{texto}`: al pasar x a true, React inserta el <span> con insertBefore
 * delante del nodo de texto, que el traductor del navegador ya ha cambiado por un <font>, y la
 * app cae con NotFoundError. Primer caso: generador-gitignore en la campaña de C0312; luego
 * conversor-cnae-iae (1dca0ec3). Censo con el AST del 01/11/2026: 17 apariciones en 13 ficheros.
 *
 * Al repasarlas una a una (reparar 01/11/2026), solo importan las que CAMBIAN en vida de la
 * página. Fuera, porque la condición es fija para cada fila o es una prop constante:
 * analizador-ratios-financieros (signo del campo), golden-hour 693 y 714 (la fila destacada va
 * con su clave), verificador-complemento-brecha-genero (icono de la opción), los dos motores
 * (tablas constantes), components/legal/InfoBox (icono por prop) y curso-emprendimiento
 * (cursos congelados).
 *
 * Los casos de abajo son las que sí cambian. Además de la caída, se mira el TEXTO VIEJO de
 * C0243: un texto variable con hermanos se escribe en el nodo que el traductor retiró y en
 * pantalla sigue el de antes. Receta en todas: el texto variable como hijo ÚNICO de su propio
 * elemento (React lo cambia con textContent y retira el <font>), y lo condicional dentro de un
 * elemento siempre montado o delante de un elemento, nunca delante de un texto.
 */

test.use({ locale: 'es-ES', timezoneId: 'Europe/Madrid', serviceWorkers: 'block' });

// Traductor simulado (receta de texto-condicional-traducido-familia.spec.ts)
const traducir = async (page: Page) => {
  await asentarAntesDeTraducir(page);
  await page.evaluate(() => {
    const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const padre = n.parentElement;
        if (!padre || !(n.nodeValue ?? '').trim()) return NodeFilter.FILTER_REJECT;
        if (/^(SCRIPT|STYLE|OPTION|NOSCRIPT|FONT)$/.test(padre.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodos: Text[] = [];
    while (caminante.nextNode()) nodos.push(caminante.currentNode as Text);
    for (const nodo of nodos) {
      const exterior = document.createElement('font');
      const interior = document.createElement('font');
      interior.textContent = nodo.nodeValue;
      exterior.appendChild(interior);
      nodo.parentNode?.replaceChild(exterior, nodo);
    }
  });
};

const hidratado = (loc: Locator) =>
  expect
    .poll(() => loc.evaluate((b) => Object.keys(b).some((k) => k.startsWith('__reactProps$'))))
    .toBe(true);

const textoDe = (loc: Locator) => loc.evaluate((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim());

interface Caso {
  slug: string;
  descripcion: string;
  /** Deja la app en el estado de partida (sin traducir) y devuelve lo que se hace ya traducida. */
  preparar: (page: Page) => Promise<() => Promise<void>>;
}

const CASOS: Caso[] = [
  {
    slug: 'analizador-densidad-seo',
    descripcion: 'la keyword pasa de óptima a sobreoptimizada: cambia el icono y la recomendación',
    preparar: async (page) => {
      const keyword = page.getByPlaceholder('ej: marketing digital');
      await hidratado(keyword);
      // 59 «casa» y un «gato»: gato = 1/60 = 1,7 % (óptimo); casa = 98 % (alto)
      await page.getByPlaceholder(/Pega aquí el contenido/).fill(`${'casa '.repeat(59)}gato`);
      await keyword.fill('gato');
      const recomendacion = page.locator('[class*="keywordRecommendation"]');
      await expect(recomendacion).toContainText('Densidad óptima');
      return async () => {
        await keyword.fill('casa');
        await expect.poll(() => textoDe(recomendacion)).toContain('sobreoptimización');
        expect(await textoDe(recomendacion)).not.toContain('Densidad óptima');
      };
    },
  },
  {
    slug: 'comparador-vehiculos',
    descripcion: 'al quitar la opción más barata, la etiqueta «Mejor» pasa a otra fila',
    preparar: async (page) => {
      const precio = page.getByLabel('Precio de venta (PVP)');
      await hidratado(precio);
      await precio.fill('30000');
      // Financiación y renting solo entran en la tabla con su cuota (y la entrada)
      await page.getByLabel('Entrada inicial').fill('5000');
      await page.getByLabel('Cuota mensual').first().fill('350');
      await page.getByLabel('Cuota mensual').nth(1).fill('399');
      await expect(
        page.locator('table').filter({ has: page.locator('th', { hasText: 'Coste Total' }) }).locator('tbody tr'),
      ).toHaveCount(3);
      // La tabla del resultado (la guía tiene otra más abajo)
      const primera = page
        .locator('table')
        .filter({ has: page.locator('th', { hasText: 'Coste Total' }) })
        .locator('tbody tr')
        .first()
        .locator('td')
        .first();
      await expect(primera).toContainText('Mejor');
      const mejor = (await textoDe(primera)).replace('Mejor', '').trim();
      return async () => {
        await page.locator('label').filter({ hasText: mejor }).locator('input[type="checkbox"]').uncheck();
        await expect.poll(() => textoDe(primera)).not.toContain(mejor);
        await expect(primera).toContainText('Mejor');
      };
    },
  },
  {
    slug: 'golden-hour',
    descripcion: 'volver a elegir un lugar sin huso conocido saca el aviso con su ⚠️',
    preparar: async (page) => {
      // Nominatim simulado (receta de golden-hour.spec.ts): Buenos Aires sin país → huso desconocido
      await page.route('https://nominatim.openstreetmap.org/**', (ruta) =>
        ruta.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' },
          body: JSON.stringify([{ display_name: 'Buenos Aires, Argentina', lat: '-34.6037', lon: '-58.3816' }]),
        }),
      );
      const buscar = page.getByPlaceholder(/Buscar ciudad/);
      await hidratado(buscar);
      const elegir = async () => {
        await buscar.fill('Buenos Aires');
        await page.getByRole('button', { name: /Buenos Aires/ }).click();
      };
      await elegir();
      const nota = page.locator('[class*="zonaNota"]');
      await expect(nota).toContainText('No sabemos el huso de este lugar');
      // A mano: la nota cambia y el ⚠️ se va
      const selector = page.getByLabel('Horas en el huso:');
      const valor = await selector.locator('option', { hasText: 'Buenos_Aires' }).first().getAttribute('value');
      await selector.selectOption(valor!);
      await expect(nota).not.toContainText('No sabemos el huso de este lugar');
      return async () => {
        await elegir();
        await expect.poll(() => textoDe(nota)).toContain('No sabemos el huso de este lugar');
      };
    },
  },
  {
    slug: 'ruleta-aleatoria',
    descripcion: 'tras otra tirada, el primero del historial es el resultado nuevo',
    preparar: async (page) => {
      const girar = page.getByRole('button', { name: /¡Girar!/ });
      await hidratado(girar);
      await girar.click();
      const ganador = page.locator('h2[class*="resultText"]');
      await expect(ganador).toBeVisible({ timeout: 10_000 });
      const primero = (await textoDe(ganador)).trim();
      const historial = page.locator('[class*="historyItem"]');
      return async () => {
        // Hasta que salga otro resultado (1 entre el número de opciones de repetir cada vez)
        for (let i = 0; i < 6; i++) {
          await page.getByRole('button', { name: /Girar otra vez/ }).click();
          await expect(ganador).toBeVisible({ timeout: 10_000 });
          const nuevo = await textoDe(ganador);
          await expect(historial).toHaveCount(i + 2);
          expect((await textoDe(historial.first())).replace('🏆', '').trim()).toBe(nuevo);
          if (nuevo !== primero) return;
        }
        throw new Error('seis tiradas con el mismo resultado: el caso no ha medido nada');
      };
    },
  },
  {
    slug: 'simulador-git-ramas',
    descripcion: 'al hacer checkout de otra rama, «HEAD →» se mueve a su botón',
    preparar: async (page) => {
      const nombre = page.getByPlaceholder('nombre-rama');
      await hidratado(nombre);
      await nombre.fill('rama-prueba');
      await page.getByRole('button', { name: 'Crear rama' }).click();
      const chips = page.locator('button[aria-pressed]').filter({ hasText: /^(HEAD → )?\s*(main|rama-prueba)$/ });
      await expect(chips).toHaveCount(2);
      return async () => {
        const otra = page.locator('button[aria-pressed="false"]').filter({ hasText: /(main|rama-prueba)$/ }).first();
        const nombreOtra = (await textoDe(otra)).trim();
        await otra.click();
        const activa = page.locator('button[aria-pressed="true"]').filter({ hasText: nombreOtra });
        await expect.poll(() => textoDe(activa)).toBe(`HEAD → ${nombreOtra}`);
      };
    },
  },
  {
    slug: 'visualizador-volumenes',
    descripcion: 'de un número largo con cortes a uno corto: retira los trozos y cambia la cifra',
    preparar: async (page) => {
      const radio = page.getByLabel('Radio (r), medida exacta');
      await hidratado(radio);
      await radio.fill('100000');
      const valor = page.locator('[aria-label="Resultado del volumen"] [class*="resultValor"]');
      await expect(valor).toHaveText('4.188.790.204.786.391');
      return async () => {
        await radio.fill('10');
        // (4/3)·π·10³ = 4.188,79 → «4188,8» (cuatro cifras enteras, sin punto)
        await expect.poll(() => textoDe(valor)).toBe('4188,8');
      };
    },
  },
];

test.describe('elemento condicional delante de un texto, con la página traducida (C0548)', () => {
  for (const c of CASOS) {
    test(`${c.slug}: ${c.descripcion}, sin caer ni dejar texto viejo`, async ({ page }) => {
      test.setTimeout(90_000);
      const errores: string[] = [];
      page.on('pageerror', (e) => errores.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error' && /NotFoundError|insertBefore|removeChild/.test(m.text())) errores.push(m.text());
      });

      await page.goto(`/${c.slug}/`);
      const actuar = await c.preparar(page);
      await traducir(page);
      await actuar();
      await page.waitForTimeout(300);

      await expect(page.getByText('Algo salió mal')).toHaveCount(0);
      expect(errores).toEqual([]);
    });
  }
});
