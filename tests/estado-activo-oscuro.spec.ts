import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, prepararParaMedir } from './_contraste';

/**
 * El botón ACTIVO se distingue también en oscuro — cabo C0868 (21/11/2026).
 *
 * La forma: un módulo CSS con `[data-theme='dark'] .filtroBtn { background: … }` (especificidad
 * 0,2,0) y `.filtroBtnActivo { background: var(--primary-boton); … }` (0,1,0) sin su variante
 * oscura. En oscuro gana la regla de la base y el filtro elegido pierde su relleno: queda como los
 * demás salvo por el borde, y su estado solo lo dice aria-pressed. Caso de origen:
 * visualizador-cicatrizacion (hallazgo 5384), donde el activo salía idéntico a los inactivos.
 *
 * Mide el comportamiento, no el CSS: en cada tema, el fondo del botón con aria-pressed="true" de
 * un grupo frente al de uno con aria-pressed="false". En claro tienen que diferir (control: así
 * marca el diseño el elegido) y en oscuro también.
 *
 * Familia de los filtros de las guías y calculadoras de cocina (censo estático de C0868 del
 * 21/11/2026: 18 apps con la misma pareja de reglas; calculadora-encurtidos, calculadora-mermelada,
 * descongelacion-segura, fermentados-vegetales, guia-chocolate, guia-harinas, guia-maices,
 * guia-tipos-sal y guia-tuberculos-latam la traen en el módulo pero no pintan ningún .filtroBtn, y
 * quedan fuera). Para medir otra app con la misma forma, su fila aquí con el selector del grupo.
 *
 * Segunda tanda del censo (21/11/2026): la misma pareja de reglas en botones de pestaña, de modo y
 * de elección sueltos por el catálogo. Ahí el grupo por defecto es el padre directo que tiene un
 * botón activo y uno inactivo, y una fila puede pedir aria-selected (pestañas con role="tab") o
 * pulsar antes un botón para que aparezca el grupo. Y una variante: la regla oscura de la base fija
 * también `color`, y el activo conserva su relleno pero con el texto gris de los inactivos encima
 * (guia-metrica-estrofas, #B0B0B0 sobre --primary-boton a 2,6:1). Por eso, además, el texto del
 * activo tiene que leerse sobre su propio relleno (4,5:1) en los dos temas, cuando es opaco.
 */

interface App {
  slug: string;
  /** Contenedor de los botones; por defecto, el padre directo de un activo y un inactivo */
  grupo?: string;
  /** Atributo que marca el elegido (por defecto aria-pressed) */
  atributo?: 'aria-pressed' | 'aria-selected' | 'aria-expanded';
  /** Botón que hay que pulsar antes para que aparezca el grupo o haya un elegido */
  antes?: string | RegExp;
  /** Texto del botón activo del grupo que se mide, cuando el primero de la página es otro */
  activoTexto?: string;
  /** Qué distingue al elegido: su relleno (por defecto) o su borde, en las tarjetas que se marcan con él */
  marca?: 'fondo' | 'borde';
  /** Elemento que lleva el atributo, si no es un <button> (por defecto 'button') */
  elemento?: string;
  /** Parte del botón que lleva la marca, si no es el propio botón */
  parte?: string;
  /** El texto lo pintan sus hijos con su propio color: el `color` del botón no dice nada */
  sinTinta?: boolean;
}

const GRUPO_FILTROS = "[role='group']";

const APPS: App[] = [
  ...[
    'alergenos-alimentarios',
    'calculadora-caducidad',
    'calculadora-congelacion',
    'glosario-tecnicas-cocina',
    'guia-azucares',
    'guia-chiles',
    'puntos-humo-aceites',
    'tipos-corte-cocina',
  ].map((slug) => ({ slug, grupo: GRUPO_FILTROS })),
  // Su primer grupo es el de ingredientes, que ya tenía variante oscura: se mide el de la dieta
  { slug: 'sustituciones-ingredientes', grupo: "[role='group'][aria-label='Filtro por dieta']" },
  // Segunda tanda del censo (21/11/2026)
  { slug: 'calculadora-camara-lenta' },
  { slug: 'falsos-amigos-ingles', activoTexto: 'Todas' },
  { slug: 'generador-qr', activoTexto: 'URL' },
  { slug: 'simulador-logica-secuencial' },
  { slug: 'simulador-reacciones-quimicas' },
  { slug: 'visualizador-agujeros-negros', atributo: 'aria-selected' },
  { slug: 'visualizador-cerebro-emociones', atributo: 'aria-selected' },
  { slug: 'visualizador-desempleo-tipos', atributo: 'aria-selected', activoTexto: 'Políticas Activas' },
  { slug: 'visualizador-escalas-musicales' },
  { slug: 'visualizador-geopolitica-energetica', activoTexto: 'Gas natural' },
  { slug: 'visualizador-geopolitica-energetica', activoTexto: 'Post-2022' },
  { slug: 'visualizador-insulina-glucosa', activoTexto: 'Todos' },
  // Los filtros de IG llevan relleno de su color con texto blanco: se mide cada uno elegido
  { slug: 'visualizador-insulina-glucosa', antes: 'IG Bajo (< 55)', activoTexto: 'IG Bajo' },
  { slug: 'visualizador-insulina-glucosa', antes: 'IG Medio (55-70)', activoTexto: 'IG Medio' },
  { slug: 'visualizador-insulina-glucosa', antes: 'IG Alto (> 70)', activoTexto: 'IG Alto' },
  { slug: 'visualizador-magnesio' },
  { slug: 'visualizador-mecanica-fluidos' },
  { slug: 'visualizador-oceanos-corrientes' },
  { slug: 'visualizador-silicio', activoTexto: 'Semiconductor' },
  // Los que solo aparecen al elegir uno, y las tarjetas que marcan el elegido con el borde
  { slug: 'visualizador-silicio', elemento: '[role="button"]', atributo: 'aria-expanded', marca: 'borde', antes: /Lingote Czochralski/, activoTexto: 'Lingote' },
  { slug: 'visualizador-hierro', antes: /Ferritina/, sinTinta: true },
  { slug: 'visualizador-teoria-grafos', antes: /^Origen:/, activoTexto: 'Origen' },
  { slug: 'visualizador-endorfinas', atributo: 'aria-expanded', marca: 'borde', antes: /Ver detalle de Reír/ },
  { slug: 'visualizador-adrenalina', atributo: 'aria-expanded', marca: 'borde', antes: /Parada cardíaca/ },
  { slug: 'tablero-comunicacion', grupo: 'body', elemento: 'button[aria-label$="en favoritos"]', marca: 'borde', antes: /en favoritos$/ },
  // El círculo de la reforma elegida: relleno de marca con el ✓, que en oscuro iba en --text-muted
  { slug: 'estimador-reformas-hogar', grupo: 'body', parte: 'span:last-child', antes: /Cocina completa/, activoTexto: 'Cocina completa' },
  // El activo conservaba el relleno, pero la regla oscura de la base le ponía su texto gris encima
  { slug: 'guia-metrica-estrofas', atributo: 'aria-selected' },
  { slug: 'visualizador-volumenes' },
  { slug: 'visualizador-crispr-cas9' },
  { slug: 'calculadora-filtro-nd-video' },
];

interface Lectura {
  activo: string;
  inactivo: string;
  /** Contraste del texto del activo sobre su relleno; null si el relleno no es opaco */
  contraste: number | null;
  tinta: string;
}

interface Que {
  grupo: string;
  atributo: string;
  activoTexto: string;
  marca: 'fondo' | 'borde';
  elemento: string;
  parte: string;
}

/** Fondo (o borde) calculado del botón activo y del primer inactivo del mismo grupo */
async function fondos(page: Page, que: Que): Promise<Lectura> {
  return page.evaluate(({ grupo: sel, atributo: attr, activoTexto: texto, marca, elemento, parte }) => {
    // Chrome da el resultado de un color-mix() como color(srgb r g b), con canales de 0 a 1 (C0866)
    const canales = (c: string): number[] => {
      const n = (c.match(/[\d.]+/g) ?? []).map(Number);
      return c.startsWith('color(srgb') ? n.map((v, i) => (i < 3 ? v * 255 : v)) : n;
    };
    const lum = (rgb: number[]): number => {
      const [r, g, b] = rgb.slice(0, 3).map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const propiedad = (el: Element): string => {
      const cs = getComputedStyle(el);
      return marca === 'borde' ? cs.borderTopColor : cs.backgroundColor;
    };
    for (const g of Array.from(document.querySelectorAll(sel))) {
      const activo = Array.from(g.querySelectorAll(`${elemento}[${attr}="true"]`)).find((el) =>
        (el.textContent ?? '').includes(texto),
      );
      const inactivo = Array.from(g.querySelectorAll(`${elemento}[${attr}="false"]`)).find(
        (el) => !parte || el.querySelector(parte),
      );
      const ma = parte ? activo?.querySelector(parte) : activo;
      const mi = parte ? inactivo?.querySelector(parte) : inactivo;
      if (ma && mi) {
        const ca = getComputedStyle(ma);
        const fondo = canales(ca.backgroundColor);
        const opaco = fondo.length === 3 || fondo[3] === 1;
        let contraste: number | null = null;
        if (opaco && ca.backgroundImage === 'none') {
          const a = lum(fondo);
          const b = lum(canales(ca.color));
          contraste = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        }
        return {
          activo: propiedad(ma),
          inactivo: propiedad(mi),
          contraste,
          tinta: `${ca.color} sobre ${ca.backgroundColor}`,
        };
      }
    }
    return { activo: 'sin grupo', inactivo: 'sin grupo', contraste: null, tinta: '' };
  }, que);
}

for (const fila of APPS) {
  const { slug, atributo = 'aria-pressed', antes, activoTexto = '', marca = 'fondo', elemento = 'button', parte = '', sinTinta } = fila;
  const grupo = fila.grupo ?? `:has(> ${elemento}[${atributo}="true"]):has(> ${elemento}[${atributo}="false"])`;
  const que: Que = { grupo, atributo, activoTexto, marca, elemento, parte };
  const lo = marca === 'borde' ? 'borde' : 'fondo';
  // Dos grupos de la misma app se distinguen en el título por el texto de su activo
  const cual = APPS.filter((a) => a.slug === slug).length > 1 ? ` («${activoTexto}»)` : '';
  test(`${slug}${cual}: el botón activo conserva su relleno en oscuro (C0868)`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    if (antes) {
      await page.getByRole('button', { name: antes, exact: typeof antes === 'string' }).first().click();
    }
    await expect(page.locator(`${grupo} ${elemento}[${atributo}="true"]`).first()).toBeVisible();
    const claro = await fondos(page, que);
    expect(claro.activo, 'claro: el grupo existe').not.toBe('sin grupo');
    expect(claro.activo, `claro: el activo tiene otro ${lo} (control)`).not.toBe(claro.inactivo);
    if (claro.contraste !== null && !sinTinta) {
      expect(claro.contraste, `claro: texto del activo (${claro.tinta})`).toBeGreaterThanOrEqual(4.5);
    }
    await activarTemaOscuro(page);
    const oscuro = await fondos(page, que);
    expect(oscuro.activo, `oscuro: el activo tiene otro ${lo} que el inactivo (${oscuro.inactivo})`).not.toBe(oscuro.inactivo);
    if (oscuro.contraste !== null && !sinTinta) {
      expect(oscuro.contraste, `oscuro: texto del activo (${oscuro.tinta})`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
