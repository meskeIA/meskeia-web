import { test, expect, type Page } from '@playwright/test';
import { activarTemaOscuro, desplegarTodo, MARCA, prepararParaMedir } from './_contraste';

/**
 * El color que llega por DATOS — cabo C0645 (06/11/2026).
 *
 * `style={{ color: x.color }}` o `style={{ background: item.color }}` con el color en un array
 * del mismo fichero: check:contraste-marca no lo ve (el literal no está en el style) y su
 * ampliación encendía 251 literales en 92 apps sin distinguir cuál llega a un texto. Aquí se mide
 * lo que se VE, por píxel y en los dos temas, recorriendo las secciones de la app: cada texto
 * pintado en un color de la marca (acento incluido) y cada texto BLANCO, contra su fondo compuesto.
 *
 * Lo que NO mide: texto de otros colores de datos (el amarillo de una base nitrogenada), salvo en
 * las filas con `todo`, el texto de un SVG o de un lienzo (tests/contraste-lienzo.spec.ts) ni un
 * fondo con degradado.
 */

interface App {
  slug: string;
  /** Botones que cambian de sección; sin él, solo la carga */
  secciones?: string;
  /**
   * Mide TODO el texto, de cualquier color, contra su fondo compuesto (y se salta el que tiene un
   * degradado o una imagen detrás, que no se compone). Para las apps que pintan como texto
   * colores de datos que no son la marca (/reparar 07/11/2026).
   */
  todo?: boolean;
}

const APPS: App[] = [
  // Estado del reactor en la marca que elige el factor k (4,11:1 en claro, 3,35 en oscuro),
  // blanco sobre la marca y sobre la paleta INES (2,03-3,91), «Baja actividad» en el teal (2,67)
  // y «U-235» sobre el tinte del núcleo en oscuro (4,32)
  { slug: 'visualizador-energia-nuclear', secciones: 'nav[aria-label*="ecciones"] button' },
  // El nombre de la vía ganadora del veredicto en el color de su barra: «Préstamo bancario» en la
  // marca (4,11:1 en claro, 3,50 en oscuro) y «Ampliación de capital» en #C0392B (2,64 en oscuro)
  { slug: 'simulador-financiacion-empresarial', todo: true },
  // El nombre, la fórmula y la «sorpresa» de cada fuerza en su color de datos: 2,54-4,11:1 en
  // claro (tensión superficial, gravedad, fricción, presión) y 3,07-4,40 en oscuro (inercia,
  // gravedad, tensión). Las cinco fuerzas del acordeón, abiertas una a una
  { slug: 'visualizador-fuerzas-invisibles', todo: true, secciones: "button[class*='fuerzaCabecera']" },
  // Reservorios, balance, destinos y potencial de cada solución en su color de datos (2,19-4,20:1
  // en claro, 2,39-3,96 en oscuro), el «Punto crítico» en #C0392B (2,88 en oscuro) y las
  // «Limitaciones» en --text-muted sobre su velo oscuro (4,40). Las cuatro pestañas
  { slug: 'visualizador-ciclo-carbono-completo', todo: true, secciones: "[role='tab']" },
  // Blanco sobre el color del estado activo (2,0-4,0:1), cabeceras de la tabla, nombres de las
  // transiciones, estado del agua y cifras de la escala en su color de datos (1,08-4,35:1 en los
  // dos temas). Las cuatro secciones
  { slug: 'visualizador-estados-materia', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Nombre de cada signo y de cada célula, campos y títulos de la comparativa y tiempos de la
  // cronología en su color de datos (2,45-3,93:1), y blanco sobre el verde, el rojo, el naranja y
  // el gris de los botones activos y la cabecera (2,85-3,82). Las secciones
  { slug: 'visualizador-inflamacion', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Título de la zona, rótulo de cada barra de la tonotopía y nota de cada frecuencia en su color
  // de datos: 1,52-4,11:1 en claro (el amarillo f1c40f, 1,52) y 3,08-4,44 en oscuro
  { slug: 'visualizador-oido-equilibrio', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Títulos de función, órgano, paso y patología y el dato del órgano en su color de datos
  // (2,19-4,11:1), blanco sobre la marca y el rojo de insignias y pasos (3,82-4,11) y el botón del
  // órgano activo con texto blanco sobre la tarjeta blanca (1,00)
  { slug: 'visualizador-sistema-linfatico', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // El régimen de cada resultado, las tarjetas de la sustentación y los cuatro regímenes de Mach en
  // su color de datos (2,06-4,11:1 en claro, 1,84-3,81 en oscuro) y el blanco del Modo Realidad
  // sobre el verde (2,87). Las cuatro pestañas
  { slug: 'visualizador-mecanica-fluidos', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // La pestaña activa con el ratón encima (el :hover pintaba el texto en su propio fondo, 1,00:1),
  // siglas de la CPU y latencias en su color de datos (1,59-4,11:1 en claro, 1,99-3,60 en oscuro)
  // y blanco sobre las barras de memoria y la insignia de fase (1,66-4,11)
  { slug: 'visualizador-arquitectura-computador', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Blanco sobre el número de cada paso (2,15-4,23:1), y las temperaturas, las fórmulas y el GWP
  // de cada gas, el porcentaje de cada fuente y los grados de cada escenario en su color de datos
  // (2,15-4,23 en claro, 1,73-3,90 en oscuro)
  { slug: 'visualizador-efecto-invernadero', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Blanco sobre el ámbar y el rojo de las flechas del balance (2,15-3,76:1), y temperaturas,
  // corrientes, el nivel del deslizador y la escala de grados en su color de datos (2,06-3,90 en
  // claro, 2,09-3,90 en oscuro)
  { slug: 'visualizador-clima', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // El precio y el nombre de cada asistente en su color de marca (2,81-4,49:1 en claro, 3,17-4,49
  // en oscuro), y la empresa y las etiquetas «mejor para» sobre el tinte de la fila desplegada
  // (4,47-4,49, forma de C0278). Las pestañas de la recomendación
  { slug: 'comparador-asistentes-codigo', todo: true, secciones: "[role='tab']" },
  { slug: 'visualizador-terremotos-tsunamis', todo: true, secciones: "[role='tablist'][aria-label*='ecciones'] [role='tab']" },
  // Hallazgo 4339: las cifras de los bloques de Estructura y de las barras de Sistemas en el color
  // de cada dato, igual en los dos temas («206» en #E8D8C4 a 1,40:1, «78» en el teal 2,80, saliva
  // 2,10, pensamientos 2,19 en claro; latidos 3,76, sangre 2,64, parpadeos 3,07 en oscuro), y los
  // porcentajes de la composición por peso en negro al 70 % sobre cada segmento (3,97-4,49)
  { slug: 'visualizador-cuerpo-numeros', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del resto del censo de C0645 (10/11/2026): la cifra de cada tarjeta de fidelidad en su color de
  // datos, igual en los dos temas, y el blanco sobre las barras naranja, teal y verde de las tres
  // capas de protección. Los cinco pasos de la horquilla, como secciones
  { slug: 'visualizador-adn-polimerasa', todo: true, secciones: "button[class*='indicadorPunto']" },
  // Del resto del censo de C0645 (10/11/2026): el blanco sobre los números de paso en su color de
  // datos (2,80-4,11:1), el nombre de la complicación abierta en su color sobre su tinte (3,65 en
  // claro, 3,99 en oscuro), y en oscuro la insignia «Glucosa elevada» (4,32) y los títulos de la
  // guía (4,19). Los dos estados del páncreas y los tres tipos, como secciones
  { slug: 'visualizador-diabetes-mecanismo', todo: true, secciones: "button[class*='toggleBtn'], [role='tab']" },
  // Del resto del censo de C0645 (10/11/2026): «Cátodo — Reducción» en #3B82F6 sobre su tinte (3,36:1
  // en claro, 3,57 en oscuro), y en oscuro los potenciales positivos en #2563EB (2,44-2,56) y la
  // reserva de la receta -texto en #EF4444 y #16A34A (3,36-3,82)
  { slug: 'visualizador-electroquimica', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del resto del censo de C0645 (10/11/2026): el blanco sobre la etiqueta de cada grupo en su color
  // puro (−NH₂ 1,96:1, −COO− 2,13, −CHO 2,57) y el título del detalle en el color del grupo
  // («Alcoholes» 3,06 en oscuro). Las ocho tarjetas de grupo, como secciones (la pestaña de grupos
  // es la de carga)
  { slug: 'visualizador-quimica-organica', todo: true, secciones: "button[class*='grupoCard']" },
  // Del resto del censo de C0645 (10/11/2026): en oscuro, el texto claro del tema sobre el pastel
  // de cada parte bacteriana (1,04-1,18:1), los nombres de dominio y tipos de la comparativa en el
  // color del dato con style (1,21-2,25), las marcas ✓ ± ✗ (2,25-3,39) y los valores de los
  // deslizadores (4,29)
  { slug: 'visualizador-microbiologia', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del resto del censo de C0645 (10/11/2026): títulos de tarjeta, de la comparativa y del detalle
  // en el color puro del dato con style (verde 2,87:1 y rojo 3,82 en claro, violetas 2,03-2,45 en
  // oscuro) y el blanco sobre los botones activos en verde y rojo (2,87-3,82)
  { slug: 'visualizador-alzheimer-parkinson', todo: true, secciones: "nav[aria-label*='nfermedad'] button, button[aria-pressed]:not(nav button)" },
  // Del censo de C0297 (10/11/2026): las insignias de estado en teal sobre su tinte teal (3,80-4,32:1
  // en claro, 3,66-4,25 en oscuro), «Silenciado ahora» en gris sobre su tinte (4,19 y 3,16-3,36), las
  // de evidencia en #e74c3c sobre su tinte en oscuro (3,25) y los avisos en #777 en oscuro (3,08)
  { slug: 'visualizador-epigenetica', todo: true, secciones: 'button[aria-pressed]' },
  // Del censo de C0297 (10/11/2026): «Orden 0, 1, 2» de la comparativa de vidas medias en
  // --text-muted sobre su tinte (4,48:1 en claro) y la vida media del orden 2 en #E67E22 con style
  { slug: 'visualizador-cinetica-quimica', todo: true, secciones: 'button[aria-pressed]' },
  // Del censo de C0297 (10/11/2026): el nombre de cada color del hidrógeno en su color puro con style
  // sobre su tinte (amarillo 1,94:1, verde 2,03, gris 2,29, azul 3,15 en claro), el CO₂ en verde y
  // rojo puros (2,28 y 3,76), el blanco sobre la insignia verde (2,28) y, en oscuro, el texto claro
  // del tema sobre el botón activo de la densidad (4,46)
  { slug: 'visualizador-hidrogeno', todo: true, secciones: 'button[aria-pressed]' },
  // Del censo de C0297 (10/11/2026): «Mecanismo político» en --primary-texto sobre el tinte de marca
  // al 10 % en oscuro (4,40:1)
  { slug: 'visualizador-regimenes-politicos', todo: true },
  // Del censo de C0297 (10/11/2026): el borde activo en su color puro con style (verde 2,28:1), el
  // blanco sobre las barras de Richter (1,98-3,76) y las magnitudes históricas en su color (naranja
  // 2,67 en claro, granate 1,73 en oscuro)
  { slug: 'visualizador-tectonica-placas', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del censo de C0297 (10/11/2026): el nivel del glucagón en el naranja #e67e22 de su barra con
  // style (2,85:1 en claro)
  { slug: 'visualizador-sistema-endocrino', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del censo de C0297 (10/11/2026): el nombre y la tasa de cada tipo de inflación en su color con
  // style (verde 2,28:1, ámbar 2,15, rojo 3,76, índigo 4,47 en claro; la hiperinflación #7f1d1d
  // 1,43 y el índigo 3,21 en oscuro) y «↑ Por encima» en la reserva roja de la receta en oscuro (3,76)
  { slug: 'visualizador-inflacion', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del censo de C0297 (10/11/2026): el blanco de «Par EV» sobre la marca (4,11:1 en claro, 2,79 en
  // oscuro) y el de «Par ICE» sobre --text-muted en oscuro (2,78), y en oscuro los títulos de los
  // recuadros y los rótulos del eje sobre el tinte de marca al 10 % (4,24-4,26, forma de C0278)
  { slug: 'visualizador-motor-electrico', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
  // Del censo de C0297 (10/11/2026): la cantidad y las pistas de la FAQ en #2e8a87 sobre su tinte
  // teal (3,58-3,74:1 en claro), y en oscuro la pestaña activa con el ratón encima en el acento sobre
  // --primary-boton (2,42), el precio y los pagos en #f06090 sobre su tinte rosa (4,07) y la cifra
  // de Nash en --primary-texto sobre el tinte al 10 % (4,40)
  { slug: 'visualizador-estructuras-mercado', todo: true, secciones: "nav[aria-label*='ecciones'] button" },
];

async function suspensos(page: Page, todo = false): Promise<string[]> {
  return page.evaluate(({ marca, todo }) => {
    const lz = document.createElement('canvas');
    lz.width = lz.height = 1;
    const ctx = lz.getContext('2d', { willReadFrequently: true })!;
    const norm = (css: string): number[] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const can = (c: number) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (p: number[]) => 0.2126 * can(p[0]) + 0.7152 * can(p[1]) + 0.0722 * can(p[2]);
    const ratio = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const M = marca.map(norm);
    const deMarca = (p: number[]) => M.some((m) => Math.abs(m[0] - p[0]) + Math.abs(m[1] - p[1]) + Math.abs(m[2] - p[2]) < 24);
    const fondo = (el: Element): number[] | null => {
      const capas: number[][] = [];
      for (let e: Element | null = el; e; e = e.parentElement) {
        if (todo && getComputedStyle(e).backgroundImage !== 'none') return null;
        const c = norm(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) capas.push(c);
        if (c[3] >= 1) break;
      }
      let b = [255, 255, 255];
      for (let i = capas.length - 1; i >= 0; i--) b = [0, 1, 2].map((k) => capas[i][k] * capas[i][3] + b[k] * (1 - capas[i][3]));
      return b;
    };
    const fuera: string[] = [];
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      if (el.closest('nextjs-portal, canvas, svg')) continue;
      if (!Array.from(el.childNodes).some((x) => x.nodeType === 3 && (x.textContent ?? '').trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
      const r = (el as HTMLElement).getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const fg = norm(cs.color);
      const blanco = fg[0] > 249 && fg[1] > 249 && fg[2] > 249;
      if (fg[3] < 1 || !(todo || deMarca(fg) || blanco)) continue;
      if (todo && el.closest('[aria-hidden="true"], input, textarea, select, [disabled]')) continue;
      const px = parseFloat(cs.fontSize);
      const umbral = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700) ? 3 : 4.5;
      const f = fondo(el);
      if (!f) continue;
      const v = ratio(fg, f);
      if (v < umbral) fuera.push(`«${(el.textContent ?? '').trim().slice(0, 40)}» rgb(${fg.slice(0, 3)}) sobre rgb(${f.map(Math.round)}): ${v.toFixed(2)}:1`);
    }
    return Array.from(new Set(fuera));
  }, { marca: MARCA, todo });
}

async function recorrer(page: Page, secciones?: string, todoElTexto = false): Promise<string[]> {
  const todo: string[] = [];
  const botones = secciones ? page.locator(secciones) : null;
  const n = botones ? await botones.count() : 0;
  if (!n) {
    await desplegarTodo(page);
    return suspensos(page, todoElTexto);
  }
  await desplegarTodo(page);
  for (let i = 0; i < n; i++) {
    const boton = botones!.nth(i);
    // Un acordeón (aria-expanded) se abre sección a sección sin volver a desplegarlo todo, que
    // cerraría la que se mide; un botón de sección sin aria-expanded, como antes
    if ((await boton.getAttribute('aria-expanded')) !== 'true') await boton.click();
    if ((await boton.getAttribute('aria-expanded')) === null) await desplegarTodo(page);
    else await expect(boton).toHaveAttribute('aria-expanded', 'true');
    todo.push(...(await suspensos(page, todoElTexto)).map((s) => `sección ${i + 1}: ${s}`));
  }
  return todo;
}

for (const { slug, secciones, todo } of APPS) {
  test(`${slug}: el texto de marca y el blanco sobre colores de datos se leen en claro y en oscuro (C0645)`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(`/${slug}/`);
    await prepararParaMedir(page);
    if (secciones) await expect(page.locator(secciones).first()).toBeVisible();
    expect.soft(await recorrer(page, secciones, todo), 'claro').toEqual([]);
    await activarTemaOscuro(page);
    expect.soft(await recorrer(page, secciones, todo), 'oscuro').toEqual([]);
  });
}
