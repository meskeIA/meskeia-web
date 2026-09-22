/**
 * Contraste de `--text-muted` en TEMA OSCURO, medido en navegador.
 *
 * Acompaña al drenaje del 22/09/2026, que llevó el token a #9B9B9B en el bloque dark
 * de `app/globals.css` y en los 359 módulos que lo redefinían por su cuenta (#808080,
 * #888888, #777777, #8A8A8A). Antes de eso, 483 de 500 elementos de texto pequeño
 * estaban por debajo de 4,5:1 — el pie, el copyright del aviso legal y las
 * descripciones de RelatedApps de las 1.001 apps a la vez.
 *
 * Por qué se mide en navegador y no con aritmética sobre el valor declarado:
 *
 *   1. El token no gobierna solo desde `:root`. 359 módulos lo redeclaran en su
 *      `.container`, y los componentes compartidos van DENTRO de ese contenedor: el
 *      «© 2026 meskeIA» de LegalNotice heredaba #777777, no el #808080 de globals.
 *      Leer globals.css habría dado por reparadas 360 apps que seguían rotas.
 *   2. El fondo real tampoco es el declarado. 462 módulos redefinen `--bg-card` a
 *      #2A2A2A, y hay superficies locales (#333333) que ninguna variable global
 *      nombra. Es el error que ya se cometió con este mismo token el 21/08/2026:
 *      #757575 se eligió midiendo contra blanco puro (4,60) y sobre la tarjeta real
 *      #FAFAFA se quedaba en 4,41.
 *
 * Las trampas de medir color con navegador están cubiertas (ver `activarTemaOscuro`,
 * `prepararParaMedir` y `fondoDe`).
 */
import { test, expect, type Page } from '@playwright/test';

/** Umbral AA para texto pequeño: por debajo de 24px, o de 18,66px en negrita. */
const UMBRAL = 4.5;

/**
 * Rutas que cubren los cuatro fondos de superficie reales y los dos regímenes del
 * token (el de globals y el redefinido por el módulo).
 */
const RUTAS = [
  { ruta: '/quiz-tabla-periodica/', que: 'token de globals · tarjeta #2D2D2D' },
  { ruta: '/aditivos-e-alimentarios/', que: 'token de globals · 92 elementos' },
  { ruta: '/tabla-derivadas/', que: 'tabla de consulta · 124 elementos' },
  { ruta: '/calculadora-receta-pan/', que: 'app de Coquinum' },
  { ruta: '/estimador-irpf/', que: 'token local · tarjeta #2A2A2A' },
  { ruta: '/arbol-decision-ia/', que: 'token local, antes #888888' },
  { ruta: '/checklist-declaracion-renta/', que: 'token local, antes #777777' },
  { ruta: '/visualizador-algoritmos/', que: 'simulador de Stemum · widget #333333' },
  { ruta: '/visualizador-historia-dinero/', que: 'cronología de Cronicum' },
  { ruta: '/', que: 'home' },
] as const;

/**
 * Fondos que este token NO cubre, con la razón. No son superficies: son píldoras y
 * cajas de widget que pintan su fondo con un token de otra cosa. Cumplir sobre
 * `--border` exigiría #ABABAB, indistinguible de `--text-secondary` (#B0B0B0), así
 * que el defecto se repara en esas apps, no subiendo el token.
 *
 * Un fondo que NO esté aquí y falle SÍ rompe el test: es lo que detecta que alguien
 * ha añadido una superficie nueva sin medirla.
 */
const FONDOS_EXCLUIDOS: Record<string, string> = {
  'rgb(64, 64, 64)': '--border como fondo de píldora (checklist-declaracion-renta)',
  'rgb(56, 56, 56)': '--hover como fondo de aviso (estimador-actualizacion-alquiler)',
  'rgb(45, 57, 63)': 'cabecera de fila desplegable (tabla-derivadas)',
  'rgb(26, 58, 74)': 'caja del flujo DuPont (analizador-ratios-financieros)',
};

/** Sin overlay de Dev Tools (no existe en producción) y sin transiciones a medio camino. */
async function prepararParaMedir(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      nextjs-portal { display: none !important; }
      *, *::before, *::after { animation: none !important; transition: none !important; }
    `,
  });
}

/**
 * Pone la página en oscuro pulsando el botón REAL, y solo si hace falta.
 *
 * Dos trampas, las dos ya pagadas:
 *   · `setAttribute('data-theme', 'dark')` no vale: el gestor de tema lo pisa al
 *     hidratar y se acaba midiendo el tema claro creyendo medir el oscuro
 *     (documentado el 09/09/2026 en el spec de nave-industrial).
 *   · El tema persiste en localStorage, así que a partir de la segunda página el
 *     botón ya dice «Cambiar a modo claro»: pulsarlo a ciegas la devuelve al claro.
 *     Por eso se comprueba el atributo ANTES de pulsar.
 */
async function activarTemaOscuro(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'dark' });
  const html = page.locator('html');
  for (let intento = 0; intento < 20; intento++) {
    if ((await html.getAttribute('data-theme')) === 'dark') break;
    const boton = page.getByRole('button', { name: /Cambiar a modo oscuro/i }).first();
    if (await boton.isVisible().catch(() => false)) await boton.click().catch(() => {});
    await page.waitForTimeout(150);
  }
  await expect(html).toHaveAttribute('data-theme', 'dark');
}

/** Abre lo colapsado: media app vive dentro de <EducationalSection>. */
async function desplegarTodo(page: Page): Promise<void> {
  for (let vuelta = 0; vuelta < 2; vuelta++) {
    const cerrados = page.locator('[aria-expanded="false"]');
    const n = Math.min(await cerrados.count(), 40);
    for (let i = 0; i < n; i++) {
      const b = cerrados.nth(i);
      if (await b.isVisible().catch(() => false)) await b.click({ timeout: 1500 }).catch(() => {});
    }
  }
  for (const d of await page.locator('details:not([open])').all()) {
    await d.evaluate((el) => el.setAttribute('open', '')).catch(() => {});
  }
}

type Medida = {
  color: string;
  fondo: string;
  ratio: number;
  px: number;
  texto: string;
  donde: string;
};

/** Elementos cuyo color lo pone `--text-muted`, con su fondo real y su contraste. */
async function medirMuted(page: Page): Promise<{ medidas: Medida[]; jerarquia: number }> {
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
    const rgba = (s: string) => {
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return n.length < 3 ? null : { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
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
    const fondoDe = (el: Element): { rgb: number[]; desc: string } => {
      let n: Element | null = el;
      while (n) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage !== 'none' && /gradient/i.test(cs.backgroundImage)) {
          const primera = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) ?? [])[0];
          const c = primera ? rgba(primera) : null;
          if (c) return { rgb: [c.r, c.g, c.b], desc: `gradiente ${primera}` };
        }
        const propio = rgba(cs.backgroundColor);
        if (propio && propio.a >= 1) break;
        n = n.parentElement;
      }
      const capas: { r: number; g: number; b: number; a: number }[] = [];
      let m: Element | null = el;
      while (m) {
        const c = rgba(getComputedStyle(m).backgroundColor);
        if (c && c.a > 0) {
          capas.push(c);
          if (c.a >= 1) break;
        }
        m = m.parentElement;
      }
      let base = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) {
        const c = capas[i];
        base = [
          c.r * c.a + base[0] * (1 - c.a),
          c.g * c.a + base[1] * (1 - c.a),
          c.b * c.a + base[2] * (1 - c.a),
        ];
      }
      const red = base.map((v) => Math.round(v));
      return { rgb: red, desc: `rgb(${red.join(', ')})` };
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

    const medidas: Medida[] = [];
    let jerarquia = -1;
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

      if (jerarquia < 0) {
        const sec = valorARgb(cs.getPropertyValue('--text-secondary').trim());
        if (sec) jerarquia = lum(sec) > lum(tk) ? 1 : 0;
      }

      const f = fondoDe(el);
      medidas.push({
        color: `rgb(${fg.r}, ${fg.g}, ${fg.b})`,
        fondo: f.desc,
        ratio: +contraste([fg.r, fg.g, fg.b], f.rgb).toFixed(2),
        px: +px.toFixed(1),
        texto: propio.slice(0, 40),
        donde: ruta(el),
      });
    }
    sonda.remove();
    return { medidas, jerarquia };
  });
}

for (const { ruta, que } of RUTAS) {
  test(`${ruta} · --text-muted cumple 4,5:1 en oscuro (${que})`, async ({ page }) => {
    await page.goto(ruta, { waitUntil: 'domcontentloaded' });
    await activarTemaOscuro(page);
    await prepararParaMedir(page);
    await desplegarTodo(page);
    await prepararParaMedir(page);

    const { medidas, jerarquia } = await medirMuted(page);
    expect(medidas.length, `no se ha medido ningún elemento con --text-muted en ${ruta}`).toBeGreaterThan(0);

    // `--text-muted` no puede quedar igual o más claro que `--text-secondary`:
    // sería legible, pero los dos niveles tipográficos dejarían de serlo.
    expect(jerarquia, `--text-muted no queda por debajo de --text-secondary en ${ruta}`).not.toBe(0);

    const fallan = medidas.filter((m) => m.ratio < UMBRAL && !(m.fondo in FONDOS_EXCLUIDOS));
    const peor = fallan.sort((a, b) => a.ratio - b.ratio)[0];
    expect(
      fallan.length,
      peor
        ? `${fallan.length} elemento(s) por debajo de ${UMBRAL}. El peor: «${peor.texto}» ${peor.color} sobre ${peor.fondo} = ${peor.ratio}:1 (${peor.px}px, ${peor.donde})`
        : '',
    ).toBe(0);

    const excluidos = medidas.filter((m) => m.ratio < UMBRAL && m.fondo in FONDOS_EXCLUIDOS);
    const peorOk = Math.min(...medidas.map((m) => m.ratio).filter((r) => r >= UMBRAL));
    console.log(
      `   ${ruta}: ${medidas.length} elementos · peor cumpliendo ${peorOk}:1` +
        (excluidos.length ? ` · ${excluidos.length} en fondo excluido (${excluidos[0].fondo})` : ''),
    );
  });
}
