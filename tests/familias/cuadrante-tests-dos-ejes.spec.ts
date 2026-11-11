import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from '../apps/_hidratacion';

/**
 * Testigo de familia · tests de autoconocimiento con un mapa de dos ejes y cuatro cuadrantes
 * (cabo C0712, 11/11/2026).
 *
 * DE DÓNDE SALE: dos altos de test-estilo-parental (hallazgos 4490 y 4491, reparados en b0ec0b913):
 * el punto caía en un cuadrante rotulado con OTRO estilo, y el punto medio contaba como «bajo», así
 * que contestar lo mismo a todo llevaba al cuadrante más estigmatizante.
 *
 * LAS SEIS HERMANAS (misma plantilla): 10 preguntas Likert 1-5 alternas A, B, A, B…; cada
 * dimensión suma de 5 a 25; ≥ 18 alto, < 14 bajo; entre medias, «Tendencia a <A>» si A ≥ B y
 * «Tendencia a <B>» si no. Medido el 11/11/2026 al escribir este testigo:
 *   · INVARIANTE 1, el punto cae en el cuadrante rotulado con el perfil que dice el encabezado:
 *     se cumple en las seis con las respuestas extremas a cada polo (A y B a 5 o a 1).
 *   · INVARIANTE 2, contestar lo mismo a las diez (todo 3: A = B = 15, zona media) no atribuye
 *     tendencia: FALLABA en las seis. El desempate A ≥ B daba siempre «Tendencia a <A>», cuyo
 *     texto dice que A «supera» a B (siendo iguales) y que en cuatro apps era el polo más cargado:
 *     «Tendencia al Impostor», «Tendencia al Groupthink», «Tendencia a la Aceleración», «Tendencia
 *     a Asumir». Receta de test-estilo-parental: con A = B en la zona media, «Sin tendencia
 *     predominante».
 *
 * Para añadir una hermana: una fila en APPS. `a` y `b` son el nombre del perfil con A y B a los
 * valores indicados; `cuadrante`, el rótulo pintado en el mapa para ese perfil.
 */

interface Polo {
  /** Respuesta (1-5) a las preguntas impares (dimensión A) y a las pares (dimensión B) */
  a: number;
  b: number;
  perfil: string;
  cuadrante: string;
}

interface AppCuadrante {
  slug: string;
  polos: Polo[];
}

const APPS: AppCuadrante[] = [
  {
    slug: 'test-delegacion-efectiva', // A acompañamiento (eje Y) · B autonomía (eje X)
    polos: [
      { a: 5, b: 5, perfil: 'Delegación Efectiva', cuadrante: 'Delegación Efectiva' },
      { a: 5, b: 1, perfil: 'Microgestión con Cariño', cuadrante: 'Microgestión con Cariño' },
      { a: 1, b: 5, perfil: 'Soltar y Rezar', cuadrante: 'Soltar y Rezar' },
      { a: 1, b: 1, perfil: 'Retención Total', cuadrante: 'Retención Total' },
    ],
  },
  {
    slug: 'test-dependencia-tecnologica', // A autonomía (eje Y) · B adaptabilidad (eje X)
    polos: [
      { a: 5, b: 5, perfil: 'Profesional Antifrágil', cuadrante: 'Profesional Antifrágil' },
      { a: 5, b: 1, perfil: 'Artesano Tradicional', cuadrante: 'Artesano Tradicional' },
      { a: 1, b: 5, perfil: 'Surfista Digital', cuadrante: 'Surfista Digital' },
      { a: 1, b: 1, perfil: 'Dependencia Silenciosa', cuadrante: 'Dependencia Silenciosa' },
    ],
  },
  {
    slug: 'test-sindrome-impostor', // A autoexigencia (eje X) · B reconocimiento (eje Y)
    polos: [
      { a: 5, b: 5, perfil: 'Perfeccionista Consciente', cuadrante: 'Perfeccionista Consciente' },
      { a: 5, b: 1, perfil: 'Síndrome del Impostor Activo', cuadrante: 'Impostor Activo' },
      { a: 1, b: 5, perfil: 'Confianza Estable', cuadrante: 'Confianza Estable' },
      { a: 1, b: 1, perfil: 'Desconexión Profesional', cuadrante: 'Desconexión' },
    ],
  },
  {
    slug: 'test-ritmo-vital', // A urgencia (eje X) · B presencia (eje Y)
    polos: [
      { a: 5, b: 5, perfil: 'Intensidad Consciente', cuadrante: 'Intensidad Consciente' },
      { a: 5, b: 1, perfil: 'Modo Urgencia Permanente', cuadrante: 'Urgencia Permanente' },
      { a: 1, b: 5, perfil: 'Ritmo Sostenible', cuadrante: 'Ritmo Sostenible' },
      { a: 1, b: 1, perfil: 'Desconexión', cuadrante: 'Desconexión' },
    ],
  },
  {
    slug: 'test-validacion-idea', // A asunción (eje X) · B validación (eje Y)
    polos: [
      { a: 5, b: 5, perfil: 'Emprendedor en Conflicto', cuadrante: 'En Conflicto' },
      { a: 5, b: 1, perfil: 'Enamorado de la Idea', cuadrante: 'Enamorado de la Idea' },
      { a: 1, b: 5, perfil: 'Emprendedor Metódico', cuadrante: 'Emprendedor Metódico' },
      { a: 1, b: 1, perfil: 'Fase de Exploración', cuadrante: 'Fase Exploración' },
    ],
  },
  {
    slug: 'test-pensamiento-grupo', // A conformidad (eje X) · B disidencia (eje Y)
    polos: [
      { a: 5, b: 5, perfil: 'Tensión Productiva', cuadrante: 'Tensión Productiva' },
      { a: 5, b: 1, perfil: 'Groupthink Activo', cuadrante: 'Groupthink Activo' },
      { a: 1, b: 5, perfil: 'Debate Saludable', cuadrante: 'Debate Saludable' },
      { a: 1, b: 1, perfil: 'Grupo Indiferente', cuadrante: 'Grupo Indiferente' },
    ],
  },
];

const encabezado = (page: Page) => page.locator('[class*="profileName"]');

/** Contesta las diez: `a` a las impares y `b` a las pares, y pide el resultado. */
async function contestar(page: Page, a: number, b: number): Promise<void> {
  const grupos = page.getByRole('radiogroup');
  await expect(grupos).toHaveCount(10);
  for (let i = 0; i < 10; i++) {
    const valor = i % 2 === 0 ? a : b;
    await grupos.nth(i).getByRole('radio', { name: new RegExp(`\\(${valor} de 5\\)`) }).click();
  }
  await page.locator('button[class*="btnPrimary"]').click();
  await expect(encabezado(page)).toBeVisible();
}

/** Rótulos de los cuadrantes que contienen el centro del punto «Tú». */
async function cuadranteDelPunto(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const punto = document.querySelector('[class*="mapDot"]');
    if (!punto) return [];
    const d = punto.getBoundingClientRect();
    const cx = d.left + d.width / 2;
    const cy = d.top + d.height / 2;
    return Array.from(document.querySelectorAll('[class*="quadrant"]'))
      .filter((q) => {
        const c = q.getBoundingClientRect();
        return cx > c.left && cx < c.right && cy > c.top && cy < c.bottom;
      })
      .map((q) => (q.textContent ?? '').replace(/\s+/g, ' ').trim());
  });
}

/**
 * Dónde caen los rótulos de los ejes y el punto respecto al mapa. Medido el 11/11/2026 en
 * test-delegacion-efectiva a 1280 px, antes de repararlo: «Bajo acompañamiento» ENCIMA del mapa
 * (y 160-179, el mapa empieza en 189), pegado a «Alto»; los laterales en los bordes de la sección
 * (x 209 y 1033, el mapa va de 440 a 840) y cortados; y con A y B a 5 el punto centrado en la
 * esquina del mapa, que lo recortaba (overflow: hidden) junto con su etiqueta «Tú».
 */
async function geometriaDelMapa(page: Page) {
  return page.evaluate(() => {
    const caja = (sel: string) => document.querySelector(sel)?.getBoundingClientRect() ?? null;
    const punto = document.querySelector('[class*="mapDot"]');
    const mapa = punto?.parentElement ?? null;
    const m = mapa?.getBoundingClientRect() ?? null;
    const p = punto?.getBoundingClientRect() ?? null;
    const t = caja('[class*="mapLabelTop"]');
    const b = caja('[class*="mapLabelBottom"]');
    const l = caja('[class*="mapLabelLeft"]');
    const r = caja('[class*="mapLabelRight"]');
    const recorta = mapa ? getComputedStyle(mapa).overflow !== 'visible' : true;
    if (!m || !p || !t || !b || !l || !r) return { falta: true } as const;
    return {
      falta: false,
      arriba: t.bottom <= m.top + 1,
      abajo: b.top >= m.bottom - 1,
      izquierda: l.right <= m.left + 1,
      derecha: r.left >= m.right - 1,
      laterales: l.left >= 0 && r.right <= document.documentElement.clientWidth,
      puntoDentro: p.left >= m.left - 1 && p.right <= m.right + 1 && p.top >= m.top - 1 && p.bottom <= m.bottom + 1,
      recorta,
    } as const;
  });
}

for (const app of APPS) {
  test.describe(`${app.slug} · cuadrante`, () => {
    for (const ancho of [1280, 390]) {
      test(`a ${ancho} px los rótulos de los ejes rodean el mapa y el punto de un extremo se ve entero`, async ({ page }) => {
        await page.setViewportSize({ width: ancho, height: 900 });
        for (const polo of app.polos) {
          await page.goto(`/${app.slug}/`);
          await esperarPaginaAsentada(page);
          await contestar(page, polo.a, polo.b);
          const g = await geometriaDelMapa(page);
          expect(g, `A=${polo.a}, B=${polo.b}`).toEqual({
            falta: false,
            arriba: true,
            abajo: true,
            izquierda: true,
            derecha: true,
            laterales: true,
            puntoDentro: true,
            recorta: false,
          });
        }
      });
    }

    test('con las respuestas extremas a cada polo, el punto cae en el cuadrante del perfil que dice el encabezado', async ({
      page,
    }) => {
      for (const polo of app.polos) {
        await page.goto(`/${app.slug}/`);
        await esperarPaginaAsentada(page);
        await contestar(page, polo.a, polo.b);
        await expect(encabezado(page)).toHaveText(polo.perfil);
        const rotulos = await cuadranteDelPunto(page);
        expect(rotulos.length, `A=${polo.a}, B=${polo.b}: el punto cae en un cuadrante`).toBe(1);
        expect(rotulos[0], `A=${polo.a}, B=${polo.b}`).toContain(polo.cuadrante);
      }
    });

    test('contestar lo mismo a las diez (todo 3, las dos dimensiones a 15) no atribuye tendencia', async ({ page }) => {
      await page.goto(`/${app.slug}/`);
      await esperarPaginaAsentada(page);
      await contestar(page, 3, 3);
      await expect(encabezado(page)).toHaveText('Sin tendencia predominante');
    });
  });
}
