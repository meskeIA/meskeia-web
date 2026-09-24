/**
 * Auxiliares compartidos por los dos specs de contraste de `--text-muted`
 * (`contraste-text-muted-oscuro.spec.ts` y `contraste-text-muted-claro.spec.ts`).
 *
 * Están aquí y no duplicados en cada spec porque lo que contienen son trampas ya
 * pagadas: si una se corrige, debe corregirse para los dos temas a la vez. Cada una
 * está documentada en la función que la cubre — `activarTema`, `prepararParaMedir`
 * y, dentro de `medirMuted`, `valorARgb` y `fondoDe`.
 *
 * No es un spec: sin sufijo `.spec`, Playwright no lo recoge como fichero de tests.
 */
import { expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './apps/_hidratacion';

/** Umbral AA para texto pequeño: por debajo de 24px, o de 18,66px en negrita. */
export const UMBRAL = 4.5;

/** Sin overlay de Dev Tools (no existe en producción) y sin transiciones a medio camino. */
export async function prepararParaMedir(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      nextjs-portal { display: none !important; }
      *, *::before, *::after { animation: none !important; transition: none !important; }
    `,
  });
}

/**
 * Pone la página en el tema pedido pulsando el botón REAL, y solo si hace falta.
 *
 * Dos trampas, las dos ya pagadas:
 *   · `setAttribute('data-theme', …)` no vale: el gestor de tema lo pisa al hidratar
 *     y se acaba midiendo el tema contrario (documentado el 09/09/2026 en el spec de
 *     nave-industrial).
 *   · El tema persiste en localStorage (`meskeia-theme`), así que a partir de la
 *     segunda página el botón ya dice lo contrario que en la primera: pulsarlo a
 *     ciegas devuelve al tema anterior. Por eso se comprueba el atributo ANTES de
 *     pulsar.
 *
 * Y espera a que React haya hidratado, que es lo que hace medible la página. Cuando el
 * tema ya es el pedido no hay nada que pulsar y esto volvía al instante, con apps que
 * aún no habían pintado nada: `visualizador-desigualdad-riqueza` hace
 * `if (!montado) return null` y en claro se medía con el body a altura 0 (23/09/2026).
 * En oscuro no se veía porque pulsar el botón ya daba ese tiempo. Si una app solo
 * retrasa una PARTE, la medida saldría corta sin ningún aviso. El testigo NO es el botón
 * de tema: la home no tiene, y allí el oscuro lo pone `prefers-color-scheme`.
 *
 * Hasta el 24/09/2026 el testigo era «algún nodo del body con `__reactFiber$`» más dos
 * fotogramas, y no bastaba: esa clave aparece ANTES del commit, y el `useEffect` que monta
 * el contenido corre después. Con la máquina cargada, `visualizador-desigualdad-riqueza`
 * seguía con el body a altura 0 en 1 de 3 cargas (6 de 6 con la CPU a 1/6). Ahora espera a
 * la hidratación CONFIRMADA y a que el DOM se aquiete: `esperarPaginaAsentada`, en
 * `tests/apps/_hidratacion.ts`, donde está medido.
 */
export async function activarTema(page: Page, tema: 'dark' | 'light'): Promise<void> {
  await esperarPaginaAsentada(page);
  await page.emulateMedia({ colorScheme: tema });
  const etiqueta = tema === 'dark' ? /Cambiar a modo oscuro/i : /Cambiar a modo claro/i;
  const html = page.locator('html');
  for (let intento = 0; intento < 20; intento++) {
    if ((await html.getAttribute('data-theme')) === tema) break;
    const boton = page.getByRole('button', { name: etiqueta }).first();
    if (await boton.isVisible().catch(() => false)) await boton.click().catch(() => {});
    await page.waitForTimeout(150);
  }
  await expect(html).toHaveAttribute('data-theme', tema);
}

/**
 * Abre lo colapsado: media app vive dentro de <EducationalSection>.
 *
 * Con presupuesto de tiempo, porque el coste no lo pone esta función sino la app:
 * un clic que no llega a abrir nada agota su propio timeout, y 40 botones × 2 vueltas
 * bastan para pasar de los 90s del test. `simulador-ciclo-explotacion` se colgaba así
 * —la app respondía en 6ms, era este bucle— y el fallo aparecía en la llamada
 * SIGUIENTE, acusando a `prepararParaMedir` de algo que no había hecho.
 *
 * Los `<details>` se abren todos de una vez dentro de la página, y no recorriendo
 * `locator('details:not([open])').all()`. Aquello devolvía localizadores `nth(i)`
 * VIVOS sobre una lista que encoge al abrir cada uno: a mitad del bucle los índices
 * apuntaban más allá del final, y `evaluate` esperaba sin plazo propio a un elemento
 * que no iba a aparecer, fuera del presupuesto de arriba. Colgaba el test hasta su
 * timeout en toda app con dos o más `<details>` cerrados — `calculadora-huella-carbono`
 * (16), `selector-tarifa-electrica` (6), `simulador-ciclo-explotacion` (5) — mientras
 * la página respondía en milisegundos. Medido el 23/09/2026: era el instrumento, no
 * la app ni el navegador.
 *
 * Los `[aria-expanded="false"]` tenían la misma forma —`nth(i)` sobre una lista que
 * encoge al abrir—, sin colgarse porque `isVisible` no espera: se SALTABAN secciones.
 * Al abrir el primero, el que era el segundo pasa a ser el primero e `i` ya va por el
 * segundo, así que se abría uno de cada dos y el texto de los otros no se medía. Ahora
 * se busca cada vez el primero visible que siga cerrado, y se cuentan los intentos
 * sobre cada elemento: dos como mucho, para que un botón que no abre nada, o un
 * acordeón que cierra el anterior al abrir el siguiente, no se reintente en bucle. El
 * segundo intento es el que hacía la segunda vuelta de antes: un clic que llega antes
 * de que React hidrate no abre nada.
 */
export async function desplegarTodo(page: Page, presupuestoMs = 20_000): Promise<void> {
  const limite = Date.now() + presupuestoMs;
  for (let clic = 0; clic < 80 && Date.now() < limite; clic++) {
    const hay = await page.evaluate(() => {
      document.querySelector('[data-desplegar-ahora]')?.removeAttribute('data-desplegar-ahora');
      const siguiente = Array.from(document.querySelectorAll('[aria-expanded="false"]')).find((el) => {
        if (Number(el.getAttribute('data-desplegar-intentos') ?? 0) >= 2) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      });
      if (!siguiente) return false;
      siguiente.setAttribute('data-desplegar-intentos', String(Number(siguiente.getAttribute('data-desplegar-intentos') ?? 0) + 1));
      siguiente.setAttribute('data-desplegar-ahora', '');
      return true;
    });
    if (!hay) break;
    await page.locator('[data-desplegar-ahora]').click({ timeout: 1500 }).catch(() => {});
  }
  await page.evaluate(() => {
    document.querySelectorAll('details:not([open])').forEach((d) => d.setAttribute('open', ''));
  });
}

export type Medida = {
  color: string;
  fondo: string;
  ratio: number;
  px: number;
  peso: string;
  texto: string;
  donde: string;
};

/** `muted-mas-claro` / `muted-mas-oscuro`: dónde queda muted respecto de secondary. */
export type Jerarquia = 'muted-mas-claro' | 'muted-mas-oscuro' | 'iguales' | null;

/**
 * Elementos cuyo color lo pone `--text-muted`, con su fondo real y su contraste.
 *
 * Se mide en navegador y no con aritmética sobre el valor declarado por dos razones
 * que ya costaron una reparación cada una:
 *
 *   1. El token no gobierna solo desde `:root`. Cientos de módulos lo redeclaran en
 *      su `.container`, y los componentes compartidos van DENTRO de ese contenedor:
 *      el «© 2026 meskeIA» de LegalNotice hereda el valor de la app, no el de
 *      globals. Leer globals.css daría por reparadas apps que siguen rotas.
 *   2. El fondo real tampoco es el declarado. Hay superficies locales que ninguna
 *      variable global nombra. Es el error que se cometió con este mismo token el
 *      21/08/2026: #757575 se eligió midiendo contra blanco puro (4,60) y sobre la
 *      tarjeta real #FAFAFA se quedaba en 4,41.
 */
export async function medirMuted(page: Page): Promise<{ medidas: Medida[]; jerarquia: Jerarquia }> {
  return page.evaluate(() => {
    const canal = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = (p: number[]) => 0.2126 * canal(p[0]) + 0.7152 * canal(p[1]) + 0.0722 * canal(p[2]);
    const contraste = (a: number[], b: number[]) => {
      const l1 = lum(a), l2 = lum(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    /**
     * Cualquier sintaxis de color CSS a rgba, pintando un píxel con el motor del
     * navegador en vez de leer la cadena con una regex.
     *
     * Sacar los números con `match(/[\d.]+/g)` funciona con `rgb(…)` y `rgba(…)` y
     * miente con todo lo demás. Chrome sirve `color(srgb 0.934 0.962 0.974)` —el
     * azul clarísimo del botón activo de `calculadora-fov-video`— y esa regex lo lee
     * como rgb(1, 1, 1): un fondo NEGRO donde hay uno casi blanco. Daba 7,33:1 en vez
     * de 4,63, o sea el único sitio del catálogo donde esta reparación parecía
     * empeorar las cosas, y era falso. Se vio mirando la captura, no el número.
     */
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 1;
    const ctx = lienzo.getContext('2d', { willReadFrequently: true })!;
    const cacheColor = new Map<string, { r: number; g: number; b: number; a: number } | null>();
    const rgba = (s: string) => {
      if (!s) return null;
      if (cacheColor.has(s)) return cacheColor.get(s)!;
      let r: { r: number; g: number; b: number; a: number } | null = null;
      // `transparent` y los inválidos deben dar alfa 0 / null, no negro opaco
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000000';
      ctx.fillStyle = s;
      const aceptado = ctx.fillStyle;
      if (aceptado !== '#000000' || /^(#0{3,8}|black|rgba?\(\s*0\s*,\s*0\s*,\s*0\b)/i.test(s.trim())) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        // `getImageData` devuelve el color SIN premultiplicar: dividir por el alfa
        // aquí daba rgb(380, 380, 380) para un blanco al 67 %.
        r = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
      }
      cacheColor.set(s, r);
      return r;
    };

    /**
     * Resuelve el valor DECLARADO del token a rgb con el propio motor CSS.
     *
     * Comparar su texto no vale: Chrome devuelve `gray` para #808080 y `#888` tal cual
     * se escribió. Un matcher hexadecimal de 6 dígitos no casa con ninguno de los dos
     * y el barrido devuelve CERO elementos sin dar ningún error — pasó al escribir esto.
     */
    const sonda = document.createElement('span');
    sonda.style.display = 'none';
    document.body.appendChild(sonda);
    const cache = new Map<string, number[] | null>();
    const valorARgb = (v: string): number[] | null => {
      if (cache.has(v)) return cache.get(v)!;
      sonda.style.color = '';
      sonda.style.color = v;
      const leido = rgba(getComputedStyle(sonda).color);
      const r = leido && sonda.style.color !== '' ? [leido.r, leido.g, leido.b] : null;
      cache.set(v, r);
      return r;
    };

    /**
     * Fondo real: compone las capas translúcidas empezando por la caja DEL PROPIO
     * elemento. Saltársela es lo que hizo acusar dos veces a MeskeiaLogo de 1,58:1
     * cuando en pantalla se lee perfectamente: el barrido aterrizaba en el fondo de
     * página sin ver la caja blanca de en medio.
     */
    type Capa = { r: number; g: number; b: number; a: number };
    /** `arriba` pintado sobre `abajo`, con el alfa de `arriba`. */
    const sobre = (arriba: Capa, abajo: number[]) => [
      arriba.r * arriba.a + abajo[0] * (1 - arriba.a),
      arriba.g * arriba.a + abajo[1] * (1 - arriba.a),
      arriba.b * arriba.a + abajo[2] * (1 - arriba.a),
    ];

    /**
     * Lo que pinta UN elemento: su `background-color` y, encima, la primera parada
     * de su gradiente si tiene uno.
     *
     * El gradiente hay que COMPONERLO, no leerlo: los de este catálogo suelen ser un
     * tono de marca al 6-8 % de alfa, y tomar `rgba(46, 134, 171, 0.06)` como si
     * fuese el color de fondo da 1,44:1 en sitios donde se lee perfectamente. El
     * color se aproxima por la primera parada porque el texto puede caer en
     * cualquier punto del degradado; cuando el gradiente es de verdad contrastado,
     * eso se ve en el propio informe y se mira la captura.
     *
     * La mezcla pondera también el alfa de la BASE. Mezclar el gradiente sobre el rgb
     * de un `background-color` transparente —que es negro con alfa 0— premultiplica
     * la capa por negro: el 6 % de azul de `visualizador-metamorfosis` salía gris
     * rgb(240, 240, 241) y 4,48:1 donde la captura enseña un azul casi blanco y hay
     * 4,75. Cuatro apps acusadas en falso el 23/09/2026; el caso de la prueba del
     * instrumento no lo veía porque allí la base era blanca y opaca.
     */
    const capaDe = (cs: CSSStyleDeclaration): { capa: Capa; gradiente: boolean } => {
      const base = rgba(cs.backgroundColor) ?? { r: 0, g: 0, b: 0, a: 0 };
      if (cs.backgroundImage === 'none' || !/gradient/i.test(cs.backgroundImage)) {
        return { capa: base, gradiente: false };
      }
      const trozos = cs.backgroundImage.match(
        /(?:rgba?|color|hsla?|oklch|oklab|lab|lch)\([^)]*\)|#[0-9a-fA-F]{3,8}\b/g,
      ) ?? [];
      const g = trozos.map(rgba).find((c): c is Capa => !!c && c.a > 0);
      if (!g) return { capa: base, gradiente: false };
      // Porter-Duff «source over»: el gradiente se pinta ENCIMA del background-color
      const a = g.a + base.a * (1 - g.a);
      const canalMezcla = (arriba: number, abajo: number) => (arriba * g.a + abajo * base.a * (1 - g.a)) / a;
      return {
        capa: { r: canalMezcla(g.r, base.r), g: canalMezcla(g.g, base.g), b: canalMezcla(g.b, base.b), a },
        gradiente: true,
      };
    };

    /**
     * Fondo real: apila las capas hasta la primera opaca, empezando por la caja DEL
     * PROPIO elemento. Saltársela es lo que hizo acusar dos veces a MeskeiaLogo de
     * 1,58:1 cuando en pantalla se lee perfectamente: el barrido aterrizaba en el
     * fondo de página sin ver la caja blanca de en medio.
     *
     * Y al revés: un antepasado solo cuenta si su caja está DEBAJO del texto. Un
     * elemento con `position: absolute` puede pintarse fuera de la caja de su padre,
     * y el fondo del padre no llega hasta allí. Las etiquetas de la barra de
     * temperatura de `visualizador-capas-tierra` van a 28px de una barra de 20px,
     * sobre la página #FAFAFA, y se midieron a 2,94:1 contra el amarillo de la barra
     * (23/09/2026). Se comprueba con el CENTRO del texto y no con su caja entera,
     * porque un texto que desborda unos píxeles su contenedor sigue estando encima.
     */
    const fondoDe = (el: Element): { rgb: number[]; desc: string } => {
      const capas: Capa[] = [];
      let hayGradiente = false;
      const caja = el.getBoundingClientRect();
      const cx = caja.left + caja.width / 2, cy = caja.top + caja.height / 2;
      let n: Element | null = el;
      while (n) {
        const r = n.getBoundingClientRect();
        if (n !== el && (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom)) {
          n = n.parentElement;
          continue;
        }
        const { capa, gradiente } = capaDe(getComputedStyle(n));
        if (capa.a > 0) {
          capas.push(capa);
          hayGradiente = hayGradiente || gradiente;
          if (capa.a >= 1) break;
        }
        n = n.parentElement;
      }
      let base = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) base = sobre(capas[i], base);
      const red = base.map((v) => Math.round(v));
      return { rgb: red, desc: `rgb(${red.join(', ')})${hayGradiente ? ' (con gradiente)' : ''}` };
    };

    const ruta = (el: Element) => {
      const partes: string[] = [];
      let n: Element | null = el;
      for (let i = 0; n && i < 2; i++) {
        const cls = typeof n.className === 'string' ? n.className.split(/\s+/)[0] : '';
        partes.unshift(n.tagName.toLowerCase() + (cls ? '.' + cls : ''));
        n = n.parentElement;
      }
      return partes.join(' > ');
    };

    const medidas: {
      color: string; fondo: string; ratio: number; px: number; peso: string; texto: string; donde: string;
    }[] = [];
    let jerarquia: 'muted-mas-claro' | 'muted-mas-oscuro' | 'iguales' | null = null;
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const propio = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => (n.textContent ?? '').trim())
        .join(' ')
        .trim();
      if (propio.length < 2) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
      const r = (el as HTMLElement).getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const fg = rgba(cs.color);
      if (!fg || fg.a < 0.99) continue;

      const tk = valorARgb(cs.getPropertyValue('--text-muted').trim());
      if (!tk || tk[0] !== fg.r || tk[1] !== fg.g || tk[2] !== fg.b) continue;

      // texto grande (≥24px, o ≥18,66px en negrita) solo exige 3:1; aquí se mide el pequeño
      const px = parseFloat(cs.fontSize);
      if (px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700)) continue;

      if (jerarquia === null) {
        const sec = valorARgb(cs.getPropertyValue('--text-secondary').trim());
        if (sec) {
          const dif = lum(tk) - lum(sec);
          jerarquia = Math.abs(dif) < 1e-9 ? 'iguales' : dif > 0 ? 'muted-mas-claro' : 'muted-mas-oscuro';
        }
      }

      const f = fondoDe(el);
      medidas.push({
        color: `rgb(${fg.r}, ${fg.g}, ${fg.b})`,
        fondo: f.desc,
        ratio: +contraste([fg.r, fg.g, fg.b], f.rgb).toFixed(2),
        px: +px.toFixed(1),
        peso: cs.fontWeight,
        texto: propio.slice(0, 40),
        donde: ruta(el),
      });
    }
    sonda.remove();
    return { medidas, jerarquia };
  });
}

/** Un fondo que el token no cubre, en la ruta donde se midió y con su razón. */
export type Exclusion = { fondo: string; ruta: string; razon: string };

/**
 * ¿Cae esta medida en uno de los fondos excluidos DE ESTA RUTA? Devuelve su razón, o null.
 *
 * Compara los canales con tolerancia en vez de la cadena, porque el fondo compuesto
 * se cuantiza: la cabecera desplegable de `tabla-derivadas` da rgb(45, 58, 63) donde
 * antes se anotó rgb(45, 57, 63), y una comparación literal convertía ese punto de
 * redondeo en un fallo del test que no señalaba ningún defecto real.
 *
 * Y cada exclusión vale solo en su ruta, porque la tolerancia hace que un color se
 * parezca a otros: el «al mes» de `planificador-vacaciones-autonomo` en oscuro, sobre
 * rgb(43, 56, 61) a 4,35:1, pasaba en verde excusado por la cabecera de
 * `tabla-derivadas` (23/09/2026). Una excepción escrita para una app tapaba en
 * silencio un defecto real de otra.
 */
export function razonDeExclusion(
  fondo: string,
  ruta: string,
  excluidos: readonly Exclusion[],
  tolerancia = 2,
): string | null {
  const canales = (s: string) => (s.match(/\d+/g) ?? []).map(Number).slice(0, 3);
  const [r, g, b] = canales(fondo);
  for (const e of excluidos) {
    if (e.ruta !== ruta) continue;
    const [r2, g2, b2] = canales(e.fondo);
    if (Math.abs(r - r2) <= tolerancia && Math.abs(g - g2) <= tolerancia && Math.abs(b - b2) <= tolerancia) {
      return e.razon;
    }
  }
  return null;
}
