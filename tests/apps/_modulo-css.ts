import type { Locator, Page } from '@playwright/test';

/**
 * Las clases de UN módulo CSS, en `next dev` y en el build (cabo C0457, 26/10/2026)
 *
 * `next dev` compila `.container` de `Foo.module.css` como «Foo-module__hash__container»; el
 * build de next 16.4.3 (117da86d), como «hash_container», sin el nombre del fichero. Un
 * localizador que busca el nombre del módulo (`[class*="Foo-module"]`) se queda ciego bajo
 * `next start` —239 rojos en la suite del 25/10/2026— y a veces, peor, deja el test en verde
 * sin medir nada. Lo que tienen en común las dos formas es el PREFIJO del módulo: todo lo que
 * va antes del nombre local («Foo-module__hash__» o «hash_»), igual en todas sus clases.
 *
 * Para casar un nombre local suelto basta con `[class$="_x"]` o `[class*="_x"]`; esto es para
 * cuando hay que quedarse con las clases de un módulo y no con las de un componente compartido
 * que use el mismo nombre local (`.container`, `.btn`).
 */

/** El prefijo del módulo de una clase compilada: «Foo-module__hash__x» → «Foo-module__hash__». */
export function prefijoDeClase(clase: string, local: string): string | null {
  return clase.endsWith(`_${local}`) ? clase.slice(0, -local.length) : null;
}

/**
 * Selector de atributo que casa con todas las clases del módulo al que pertenece la clase
 * `local` del elemento `ancla`. Se combina con el nombre local: `${mod}[class$="_resultValue"]`.
 */
export async function selectorDelModulo(ancla: Locator, local: string): Promise<string> {
  const clases = (await ancla.first().getAttribute('class')) ?? '';
  for (const clase of clases.split(/\s+/)) {
    const prefijo = prefijoDeClase(clase, local);
    if (prefijo) return `[class*="${prefijo}"]`;
  }
  throw new Error(`selectorDelModulo: el ancla no lleva ninguna clase «…_${local}» (lleva «${clases}»)`);
}

/** Los prefijos de módulo de las clases presentes en la página, para buscar una regla en las hojas. */
export async function prefijosEnLaPagina(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const prefijos = new Set<string>();
    for (const el of Array.from(document.querySelectorAll('[class]'))) {
      for (const clase of Array.from(el.classList)) {
        // Un nombre local de CSS Modules no lleva «_»: el prefijo es todo hasta el último
        const corte = clase.lastIndexOf('_');
        if (corte > 0 && corte < clase.length - 1) prefijos.add(clase.slice(0, corte + 1));
      }
    }
    return Array.from(prefijos);
  });
}
