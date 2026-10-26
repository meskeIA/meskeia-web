/**
 * Cabo C0060 (12/10/2026) — un contenedor que desplaza en horizontal no puede centrar con
 * `justify-content: center`.
 *
 * La forma del hallazgo 2298 (simulador-arboles-bst-avl): con `overflow-x: auto` y
 * `justify-content: center` en la misma regla, cuando el hijo es más ancho que el contenedor el
 * centrado reparte el desborde a los dos lados, y el IZQUIERDO queda fuera del alcance del
 * scroll (scrollLeft no baja de 0). En un árbol, la raíz de un BST degenerado; en un crucigrama
 * o un nonograma, la primera columna.
 *
 * La reparación: `justify-content: safe center`, que centra mientras cabe y alinea al principio
 * cuando desborda (precedida de `center`, que es lo que se queda un navegador que no conozca
 * `safe`).
 *
 * El testigo mide la REGLA y no el estado de cada app: varios de estos contenedores solo
 * existen tras generar algo. Se busca en las hojas de estilo de la página la clase compilada del
 * módulo, se monta un contenedor con esa clase y un hijo de 2.000 px, y se comprueba que con
 * scrollLeft = 0 el borde izquierdo del hijo no queda a la izquierda del contenedor.
 *
 * La clase se busca anclada a un módulo que la página PINTA: en el build de producción una
 * página carga también hojas de otras apps, y el 17/10/2026, contra `next start`,
 * /generador-codigos-barras/ midió el `.canvasContainer` de SortingCanvas (visualizador-algoritmos)
 * en vez del suyo. Hasta el 26/10/2026 el ancla era el nombre del módulo en la clase compilada,
 * que el build de next 16.4.3 ya no pone («hash_clase» en vez de «Modulo-module__hash__clase»), y
 * el testigo salía «no se encontró la clase» bajo `next start` (cabo C0457). Ahora se toman los
 * prefijos de módulo de las clases que hay en el DOM (`prefijosEnLaPagina`) y vale el que declara
 * `.<prefijo><clase>` en una hoja; el nombre del módulo solo desempata, y en `next dev`.
 */
import { test, expect } from '@playwright/test';
import { prefijosEnLaPagina } from './_modulo-css';

const CASOS: [ruta: string, modulo: string, clase: string][] = [
  ['/calculadora-algebra-booleana/', 'CalculadoraAlgebraBooleana', 'karnaughContainer'],
  ['/generador-codigos-barras/', 'GeneradorCodigosBarras', 'canvasContainer'],
  ['/generador-crucigramas/', 'GeneradorCrucigramas', 'envoltorioRejilla'],
  ['/generador-nonogramas/', 'GeneradorNonogramas', 'envoltorioPuzzle'],
  ['/simulador-arboles-b/', 'SimuladorArbolesB', 'arbolContainer'],
  ['/simulador-arboles-bst-avl/', 'SimuladorArbolesBstAvl', 'arbolContainer'], // la del 2298, reparada con márgenes
  ['/simulador-monticulo-binario/', 'SimuladorMonticuloBinario', 'arbolContainer'],
  ['/visualizador-ecuaciones-diferenciales/', 'EcuacionesDiferenciales', 'svgWrapper'],
  ['/visualizador-internet-60-segundos/', 'VisualizadorInternet60Segundos', 'timeline'],
  ['/visualizador-numeros-complejos/', 'NumerosComplejos', 'argandWrapper'],
  ['/visualizador-proteinas-plegamiento/', 'ProteinasPlegamiento', 'nivelSvgWrap'],
];

for (const [ruta, modulo, clase] of CASOS) {
  test(`${ruta} · .${clase}: el borde izquierdo de lo que desborda se alcanza`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ruta);
    const prefijos = await prefijosEnLaPagina(page);
    const medida = await page.evaluate(({ modulo, clase, prefijos }) => {
      // La clase compilada es «<prefijo><clase>»: «Modulo-module__hash__clase» en next dev y
      // «hash_clase» en el build. Solo valen los prefijos de módulos que la página pinta.
      const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
      const encontradas = new Set<string>();
      for (const hoja of Array.from(document.styleSheets)) {
        let reglas: CSSRuleList;
        try {
          reglas = hoja.cssRules;
        } catch {
          continue;
        }
        for (const regla of Array.from(reglas)) {
          if (!(regla instanceof CSSStyleRule)) continue;
          for (const prefijo of prefijos) {
            // CSS.escape: un hash que empieza por cifra sale escapado en selectorText («\31 …»)
            if (new RegExp(`\\.${escapar(CSS.escape(prefijo + clase))}(?![\\w-])`).test(regla.selectorText)) {
              encontradas.add(prefijo + clase);
            }
          }
        }
      }
      const lista = Array.from(encontradas);
      // Dos módulos pintados que declaran la misma clase: en next dev desempata el nombre
      const compilada = lista.length === 1 ? lista[0] : (lista.find((c) => c.startsWith(`${modulo}-`)) ?? null);
      if (!compilada) return lista.length ? { ambigua: lista } : null;
      const caja = document.createElement('div');
      caja.className = compilada;
      caja.style.width = '300px';
      const hijo = document.createElement('div');
      hijo.style.cssText = 'width: 2000px; min-width: 2000px; height: 20px; flex-shrink: 0;';
      caja.appendChild(hijo);
      document.body.appendChild(caja);
      caja.scrollLeft = 0;
      const izquierdaCaja = caja.getBoundingClientRect().left + caja.clientLeft;
      const izquierdaHijo = hijo.getBoundingClientRect().left;
      const resultado = { compilada, desborde: caja.scrollWidth > caja.clientWidth, perdido: izquierdaCaja - izquierdaHijo };
      caja.remove();
      return resultado;
    }, { modulo, clase, prefijos });
    expect(medida, `no se encontró la clase .${clase} en las hojas de estilo de ${ruta}`).not.toBeNull();
    if (medida && 'ambigua' in medida) {
      throw new Error(`.${clase} la declaran varios módulos pintados en ${ruta}: ${medida.ambigua.join(', ')}`);
    }
    expect(medida!.desborde, 'el hijo de 2.000 px tiene que desbordar').toBe(true);
    expect(medida!.perdido, `px del hijo a la izquierda del contenedor (.${medida!.compilada})`).toBeLessThanOrEqual(0.5);
  });
}
