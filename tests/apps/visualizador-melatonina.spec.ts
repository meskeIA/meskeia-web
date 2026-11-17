import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';
import { comprobarFaqPageUnico } from './_faqpage-unico';

/**
 * visualizador-melatonina — PRIMERA INSPECCIÓN (Inspector, 17/11/2026)
 *
 * La app no tiene campos: una curva de 24 h (melatonina frente a cortisol), un simulador de luz de
 * tres botones con una barra de «Nivel de melatonina», dos gráficos de barras (edad y estación),
 * cuatro tarjetas desplegables (jet lag, trabajo nocturno, pantallas) y una guía educativa. Lo
 * comprobable es si lo que PINTA cuadra con lo que DICE (su texto, su FAQPage) y con la fuente
 * oficial. Los esperados se resolvieron a mano ANTES de abrir la app.
 *
 * Fuente oficial (CIMA de la AEMPS, consultada el 17/11/2026):
 *   · Ficha técnica de Melatonina Aurovitas 2 mg LP (nreg. 86265, rev. junio 2021), 5.1: «la
 *     secreción de melatonina aumenta poco después del anochecer, alcanza su pico máximo entre las
 *     2 y las 4 de la madrugada y disminuye durante la segunda mitad de la noche». 4.2: «2 mg una
 *     vez al día, 1 o 2 horas antes de acostarse», trece semanas como máximo, insomnio primario en
 *     55 años o más. 5.1 cita un estudio pediátrico «con dosis de 2, 5 o 10 mg».
 *   · Ficha técnica de Melatonina Noxarem 3 mg (nreg. 88821, rev. febrero 2023): jet lag en
 *     adultos, «un comprimido diario de 3 mg a la hora local de acostarse», máximo 5 mg, «no se
 *     debe tomar antes de las 20:00 ni después de las 04:00», máximo 4 días. 5.1: «la secreción de
 *     melatonina aumenta poco después de que empieza a oscurecer», pico «entre las 2 y las 4 a.m.».
 *   · API de CIMA (`/cima/rest/medicamentos?nombre=melatonina`): Noxarem 3 mg (88821) y 5 mg
 *     (88822) figuran «Sin Receta» y comercializados; las de 2 mg LP, «Sujeto A Prescripción Médica».
 *
 *   CASO 1 (normal) — el pico de la curva. CIMA: entre las 2 y las 4 → el máximo (100 %) debe caer
 *     en las horas 2, 3 o 4. Código: 95 · 100 · 95 → hora 3. Coincide. Pero a las 20:00, el inicio
 *     de la «Noche (20:00–8:00)» de la propia leyenda, la secreción aún no ha empezado: la FAQ dice
 *     «empezando hacia las 21:00-22:00 h» y CIMA «poco después del anochecer» → nivel basal, como
 *     las horas de día (2-5 %); un margen de 10 % basta. Obtenido: 18 h = 20 %, 19 h = 35 %,
 *     20 h = 55 %, 21 h = 70 % (sube desde las 16-17 h). HALLAZGO.
 *   CASO 2 (límite: medianoche) — de la subida al pico (CIMA: pico 2-4 h) la curva no puede bajar al
 *     cruzar las 0:00: 21 → 22 → 23 → 0 → 1 → 2 → 3 h debe ser no decreciente. Obtenido: 70 · 75 ·
 *     65 · 60 · 80 · 95 · 100 → cae 15 puntos entre las 22:00 y las 0:00. HALLAZGO. Límite del
 *     simulador: «Oscuridad total» (el valor más alto) → 100 % y la barra llena: coincide.
 *   CASO 3 (se rechaza) — tarjeta «Vuelo hacia el Este (Madrid → Tokio, +8h)»: «a las 3:00 AM hora
 *     japonesa (que equivale a las 11:00 PM española)». Con +8 h, 3:00 en Tokio = 3 − 8 = −5 →
 *     19:00 del día anterior en España; 23:00 está a 4 h, no a 8. La equivalencia debe rechazarse.
 *     HALLAZGO.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y
 * habrá que quitarles el test.fail() (y cambiar ABIERTO por REPARADO). Cada uno afirma lo CORRECTO.
 */

const RUTA = '/visualizador-melatonina/';

const H2_CURVA = 'La Curva Circadiana: Melatonina vs Cortisol';
const H2_LUZ = 'Cómo la Luz Controla la Melatonina';
const H2_EDAD = 'Melatonina a lo Largo de la Vida y las Estaciones';
const H2_JET = 'Jet Lag y Melatonina: El Mecanismo';

const Q_SUPLEMENTOS = '¿Qué dice la ciencia sobre los suplementos de melatonina para dormir?';
const Q_PANTALLAS = '¿Por qué la luz azul de las pantallas afecta al sueño?';

async function abrir(page: Page, tema: 'light' | 'dark' = 'light'): Promise<void> {
  if (tema === 'dark') {
    // La preferencia se guarda ANTES de cargar: sembrar data-theme tras el goto es una carrera.
    await page.addInitScript(() => window.localStorage.setItem('meskeia-theme', 'dark'));
  }
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', tema);
}

function seccion(page: Page, titulo: string): Locator {
  return page.locator('section').filter({ has: page.getByRole('heading', { level: 2, name: titulo }) });
}

interface Grafico {
  role: string | null;
  labels: string[];
  series: { label: string; data: number[] }[];
  colorLeyenda: string | null;
  colorTicksX: string | null;
  tituloY: string | null;
}

/**
 * Los datos y opciones que recibe cada gráfico de react-chartjs-2: se sube por la fibra de React
 * del <canvas> hasta el componente que lleva `data.datasets` en sus props. Lo pintado sale de ahí.
 */
async function leerGraficos(page: Page): Promise<Grafico[]> {
  return page.evaluate(() => {
    interface Fibra {
      memoizedProps: Record<string, unknown> | null;
      return: Fibra | null;
    }
    interface Opciones {
      plugins?: { legend?: { labels?: { color?: string } } };
      scales?: { x?: { ticks?: { color?: string } }; y?: { title?: { text?: string } } };
    }
    interface Props {
      data: { labels: string[]; datasets: { label: string; data: number[] }[] };
      options?: Opciones;
    }
    return Array.from(document.querySelectorAll('canvas')).map((c) => {
      const bruto = c as unknown as Record<string, unknown>;
      const clave = Object.keys(bruto).find((k) => k.startsWith('__reactFiber$'));
      let f = (clave ? bruto[clave] : null) as Fibra | null;
      let props: Props | null = null;
      while (f) {
        const p = f.memoizedProps as Partial<Props> | null;
        if (p && p.data && Array.isArray(p.data.datasets)) {
          props = p as Props;
          break;
        }
        f = f.return;
      }
      if (!props) throw new Error('No se encontraron las props del gráfico en la fibra del canvas');
      return {
        role: c.getAttribute('role'),
        labels: [...props.data.labels],
        series: props.data.datasets.map((d) => ({ label: d.label, data: [...d.data] })),
        colorLeyenda: props.options?.plugins?.legend?.labels?.color ?? null,
        colorTicksX: props.options?.scales?.x?.ticks?.color ?? null,
        tituloY: props.options?.scales?.y?.title?.text ?? null,
      };
    });
  });
}

async function curva(page: Page): Promise<{ horas: string[]; melatonina: number[]; cortisol: number[] }> {
  const [g] = await leerGraficos(page);
  const mel = g.series.find((s) => s.label === 'Melatonina');
  const cor = g.series.find((s) => s.label === 'Cortisol');
  expect(mel, 'serie Melatonina').toBeTruthy();
  expect(cor, 'serie Cortisol').toBeTruthy();
  return { horas: g.labels, melatonina: mel?.data ?? [], cortisol: cor?.data ?? [] };
}

/** Contraste WCAG de un color de texto de Chart.js contra el fondo que se ve tras el canvas. */
async function contrasteTextoCanvas(lienzo: Locator, colorTexto: string): Promise<number> {
  return lienzo.evaluate((el, color) => {
    const rgba = (s: string): number[] => {
      if (s.startsWith('#')) {
        const h = s.length === 4 ? s.slice(1).split('').map((x) => x + x).join('') : s.slice(1, 7);
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
      }
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
    };
    const lum = ([r, g, b]: number[]): number => {
      const f = (c: number) => {
        const x = c / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const capas: number[][] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let fondo = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) {
      const [r, g, b, a] = capas[i];
      fondo = [r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)];
    }
    const t = rgba(color);
    const a = lum(t);
    const b = lum(fondo);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, colorTexto);
}

interface NodoLd {
  '@type'?: string;
  featureList?: unknown[];
  features?: unknown[];
  mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
}

async function jsonLd(page: Page): Promise<NodoLd[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap((s) => {
      const j = JSON.parse(s.textContent ?? '{}') as Record<string, unknown>;
      return ((j['@graph'] as Record<string, unknown>[] | undefined) ?? [j]) as unknown as NodoLd[];
    }),
  );
}

async function respuestaFaq(page: Page, pregunta: string): Promise<string> {
  const faq = (await jsonLd(page)).find((n) => n['@type'] === 'FAQPage');
  const r = faq?.mainEntity?.find((q) => q.name === pregunta)?.acceptedAnswer.text ?? '';
  expect(r.length, `respuesta del FAQPage a «${pregunta}»`).toBeGreaterThan(0);
  return r;
}

/** El texto de la guía educativa, aunque esté plegada (se oculta por CSS, sigue en el DOM). */
async function textoGuia(page: Page): Promise<string> {
  return ((await page.locator('[data-guia-educativa]').textContent()) ?? '').replace(/\s+/g, ' ');
}

function botonLuz(page: Page, nombre: string): Locator {
  return seccion(page, H2_LUZ).getByRole('button', { name: nombre, exact: true });
}

function barraNivel(page: Page): Locator {
  return page.getByRole('progressbar', { name: /Nivel de melatonina/ });
}

function valorNivel(page: Page): Locator {
  return seccion(page, H2_LUZ).locator('[class*="_barraMetaValor"]');
}

/**
 * La cifra cambia de color con `transition: color 0.3s`: medida justo tras el clic da un color
 * intermedio (el del escenario anterior mezclado) y el contraste sale de más. Se espera a que
 * terminen sus transiciones antes de medir.
 */
async function esperarTransiciones(elemento: Locator): Promise<void> {
  await elemento.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)).then(() => undefined));
}

/** 12 h → 24 h: «3:00 AM» → 3; «11:00 PM» → 23; sin AM/PM se toma tal cual. */
function hora24(h: string, ampm: string | undefined): number {
  const n = Number(h) % 12;
  if (!ampm) return Number(h);
  return ampm.toUpperCase() === 'PM' ? n + 12 : n;
}

test.describe('visualizador-melatonina', () => {
  test.beforeEach(async ({ page }) => {
    await abrir(page);
  });

  test('estructura: h1 y aviso médico de nivel alto sin plegar', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Melatonina');
    const aviso = page.getByRole('note').filter({ hasText: 'Aviso Médico Importante' });
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('TÚ ERES RESPONSABLE');
    await expect(aviso.getByRole('button', { name: /Ocultar aviso|Mostrar aviso/ })).toHaveCount(0);
  });

  test('CASO 1 (normal): el pico de melatonina cae entre las 2 y las 4 (CIMA, ficha técnica 5.1)', async ({ page }) => {
    const { horas, melatonina, cortisol } = await curva(page);
    expect(horas).toEqual(Array.from({ length: 24 }, (_, i) => String(i)));
    expect(melatonina).toHaveLength(24);
    const maximo = Math.max(...melatonina);
    expect(maximo).toBe(100);
    // CIMA: «alcanza su pico máximo entre las 2 y las 4 de la madrugada» → hora 2, 3 o 4.
    expect([2, 3, 4]).toContain(melatonina.indexOf(maximo));
    // Las horas de día (10-14 h) quedan en el nivel basal: «disminuye durante la segunda mitad de la noche».
    for (let h = 10; h <= 14; h++) expect(melatonina[h], `${h}:00`).toBeLessThanOrEqual(5);
    // El cortisol: pico a primera hora («~30 minutos después de despertar», dice la app) → 6-8 h.
    expect([6, 7, 8]).toContain(cortisol.indexOf(Math.max(...cortisol)));
    await expect(seccion(page, H2_CURVA)).toContainText('Noche (20:00–8:00)');
  });

  test('CASO 2 bis (límite y operativa): el simulador de luz cambia la barra; «Oscuridad total» la llena', async ({ page }) => {
    // Por defecto, «Oscuridad total»: el valor más alto del control → 100 % y la barra llena.
    await expect(botonLuz(page, 'Oscuridad total')).toHaveAttribute('aria-pressed', 'true');
    await expect(barraNivel(page)).toHaveAttribute('aria-valuenow', '100');
    await expect(valorNivel(page)).toHaveText(/^100\s*%$/);
    const llena = await barraNivel(page).evaluate((e) => e.getBoundingClientRect().height / (e.parentElement?.getBoundingClientRect().height ?? 1));
    expect(llena).toBeCloseTo(1, 1);

    await botonLuz(page, 'Luz solar (día)').click();
    await expect(botonLuz(page, 'Luz solar (día)')).toHaveAttribute('aria-pressed', 'true');
    await expect(botonLuz(page, 'Oscuridad total')).toHaveAttribute('aria-pressed', 'false');
    await expect(barraNivel(page)).toHaveAttribute('aria-valuenow', '5');
    await expect(seccion(page, H2_LUZ)).toContainText('células ganglionares retinianas (ipRGC)');

    await botonLuz(page, 'Luz artificial nocturna (pantallas, LED)').click();
    await expect(barraNivel(page)).toHaveAttribute('aria-valuenow', '30');
    await expect(seccion(page, H2_LUZ)).toContainText('La luz azul de pantallas');
  });

  test('operativa: las tarjetas de jet lag se despliegan de una en una', async ({ page }) => {
    const tarjetas = seccion(page, H2_JET).getByRole('button');
    await expect(tarjetas).toHaveCount(4);
    const este = seccion(page, H2_JET).getByRole('button', { name: /Vuelo hacia el Este/ });
    const oeste = seccion(page, H2_JET).getByRole('button', { name: /Vuelo hacia el Oeste/ });
    await expect(este).toHaveAttribute('aria-expanded', 'false');
    await este.click();
    await expect(este).toHaveAttribute('aria-expanded', 'true');
    await expect(este.locator('..')).toContainText('Adaptación estimada');
    await oeste.click();
    await expect(oeste).toHaveAttribute('aria-expanded', 'true');
    await expect(este).toHaveAttribute('aria-expanded', 'false');
    await expect(oeste.locator('..')).toContainText('3-5 días');
  });

  test('HALLAZGO [calculo/alto] CASO 1: la curva sube desde las 16-17 h y a las 20:00 ya va por el 55 %', async ({ page }) => {
    // REPARADO (hallazgo 4955). ENTRADA  la curva de 24 h, horas 18, 19 y 20 (la «Noche» de la leyenda
    //          empieza a las 20:00)
    // ESPERADO nivel basal (≤ 10 % del pico): la FAQ dice «empezando hacia las 21:00-22:00 h», el
    //          recuadro «~2 horas antes de la hora habitual de dormir» y CIMA (5.1) «aumenta poco
    //          después del anochecer»
    // OBTENIDO 18 h = 20 %, 19 h = 35 %, 20 h = 55 % (y 21 h = 70 %): la subida empezaba a las 16-17 h
    const { melatonina } = await curva(page);
    for (const h of [16, 17, 18, 19, 20]) expect(melatonina[h], `melatonina a las ${h}:00`).toBeLessThanOrEqual(10);
    // …y sí sube tras el anochecer: a las 22 h ya está claramente por encima del basal
    expect(melatonina[22], 'melatonina a las 22:00').toBeGreaterThan(20);
  });

  test('HALLAZGO [calculo/medio] CASO 2 (medianoche): la curva baja entre las 22:00 y las 0:00 antes del pico', async ({ page }) => {
    // REPARADO (hallazgo 4956). ENTRADA  la curva, de las 21:00 a las 3:00 cruzando la medianoche
    // ESPERADO no decreciente hasta el pico de las 2-4 h (CIMA 5.1: aumenta tras el anochecer y
    //          alcanza el máximo entre las 2 y las 4)
    // OBTENIDO 21 h 70 · 22 h 75 · 23 h 65 · 0 h 60 · 1 h 80 · 2 h 95 · 3 h 100: un valle de 15 puntos
    const { melatonina } = await curva(page);
    const tramo = [21, 22, 23, 0, 1, 2, 3].map((h) => melatonina[h]);
    for (let i = 1; i < tramo.length; i++) {
      expect(tramo[i], `tramo 21→3 h: ${tramo.join(' · ')}`).toBeGreaterThanOrEqual(tramo[i - 1]);
    }
  });

  test('HALLAZGO [calculo/medio] CASO 3 (rechazo): «3:00 AM hora japonesa equivale a las 11:00 PM española» con +8 h', async ({ page }) => {
    // ABIERTO. ENTRADA  tarjeta «Vuelo hacia el Este (Madrid → Tokio, +8h)»
    // ESPERADO 3:00 en Tokio − 8 h = 19:00 (del día anterior) en España; o, al revés, 23:00 en
    //          España = 7:00 en Tokio. Toda equivalencia Tokio/España que dé debe distar 8 h
    // OBTENIDO «3:00 AM hora japonesa (que equivale a las 11:00 PM española)»: 4 h de diferencia
    test.fail();
    const tarjeta = seccion(page, H2_JET).getByRole('button', { name: /Vuelo hacia el Este/ }).locator('..');
    await expect(tarjeta).toContainText('+8h');
    const texto = (await tarjeta.innerText()).replace(/\s+/g, ' ');
    const par = texto.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*hora japonesa \(que equivale a las (\d{1,2}):(\d{2})\s*(AM|PM)?\s*española\)/);
    if (par) {
      const tokio = hora24(par[1], par[3]);
      const espana = hora24(par[4], par[6]);
      expect((tokio - espana + 24) % 24, `${par[0]}`).toBe(8);
    }
    expect(texto).not.toContain('que equivale a las 11:00 PM española');
  });

  test('HALLAZGO [contenido/medio]: la barra de «Luz artificial» marca 30 % y su propio dato dice que suprime ~50 %', async ({ page }) => {
    // ABIERTO. ENTRADA  botón «Luz artificial nocturna (pantallas, LED)», y luego «Luz solar (día)»
    // ESPERADO si suprime ~50 %, queda ~50 % (100 − 50, ± 5); si «la supresión es completa», 0 %
    // OBTENIDO artificial: barra 30 % junto a «suprime la melatonina ~50% durante 2 horas»;
    //          solar: barra 5 % junto a «La supresión de melatonina es completa durante el día»
    test.fail();
    await botonLuz(page, 'Luz artificial nocturna (pantallas, LED)').click();
    await expect(barraNivel(page)).toHaveAttribute('aria-valuenow', /\d+/);
    const datoArtificial = (await seccion(page, H2_LUZ).innerText()).replace(/\s+/g, ' ');
    const supresion = datoArtificial.match(/suprime la melatonina ~(\d+)\s*%/);
    const nivelArtificial = Number(await barraNivel(page).getAttribute('aria-valuenow'));
    if (supresion) {
      expect(Math.abs(nivelArtificial - (100 - Number(supresion[1]))), `barra ${nivelArtificial} % con ~${supresion[1]} % de supresión`).toBeLessThanOrEqual(5);
    }
    await botonLuz(page, 'Luz solar (día)').click();
    await expect(barraNivel(page)).toHaveAttribute('aria-valuenow', /\d+/);
    const datoSolar = (await seccion(page, H2_LUZ).innerText()).replace(/\s+/g, ' ');
    if (/supresión de melatonina es completa/.test(datoSolar)) {
      expect(Number(await barraNivel(page).getAttribute('aria-valuenow')), 'supresión «completa»').toBe(0);
    }
  });

  test('HALLAZGO [dato/medio]: el FAQPage dice que por encima de 1,9 mg la melatonina «requiere prescripción»', async ({ page }) => {
    // ABIERTO. ENTRADA  FAQPage, «¿Qué dice la ciencia sobre los suplementos de melatonina para dormir?»
    // ESPERADO CIMA (API de la AEMPS, 17/11/2026): Melatonina Noxarem 3 mg (88821) y 5 mg (88822)
    //          son medicamentos «Sin Receta» y comercializados; solo las de 2 mg de liberación
    //          prolongada están sujetas a prescripción médica
    // OBTENIDO «En España, la melatonina en dosis superiores a 1,9 mg está clasificada como
    //          medicamento y requiere prescripción»
    test.fail();
    const r = await respuestaFaq(page, Q_SUPLEMENTOS);
    expect(r).not.toMatch(/superiores a 1,9 mg está clasificada como medicamento y requiere prescripción/);
    if (/prescripción|receta/i.test(r)) expect(r).toMatch(/sin receta/i);
  });

  test('HALLAZGO [dato/medio]: la guía dice que la eficacia está en 0,1-1 mg y «no en 5-10 mg»; CIMA autoriza 2, 3 y 5 mg', async ({ page }) => {
    // ABIERTO. ENTRADA  guía, «¿Qué dice la ciencia sobre los suplementos de melatonina?» → «Dosis»
    // ESPERADO CIMA: jet lag, 3 mg a la hora de acostarse y máximo 5 mg (Noxarem, 4.2); insomnio
    //          en 55 años o más, 2 mg LP 1-2 h antes de acostarse (4.2) con eficacia probada a 2 mg
    //          (5.1); estudio pediátrico con 2, 5 o 10 mg (5.1)
    // OBTENIDO «los estudios que muestran eficacia usan dosis bajas (0,1-1 mg), no las de 5-10 mg
    //          típicas en muchos suplementos comerciales» (en España un suplemento no pasa de 1,9 mg,
    //          según el propio FAQPage: los «5-10 mg típicos» son de otro mercado)
    test.fail();
    const guia = await textoGuia(page);
    expect(guia).toContain('Insomnio circadiano');
    expect(guia).not.toMatch(/los estudios que muestran eficacia usan dosis bajas \(0,1-1 mg\)/);
    expect(guia).not.toMatch(/no las de 5-10 mg/);
  });

  test('HALLAZGO [contenido/medio]: da pautas de dosis (mg) con el aviso en «high» y la directiva @disclaimer: exempt', async ({ page }) => {
    // ABIERTO. ENTRADA  guía («Tomar dosis bajas (0,5-1 mg) en el momento adecuado») y FAQPage
    //          («la toma de melatonina en la nueva hora de dormir (0,5-1 mg, 30 minutos antes)»)
    // ESPERADO política de disclaimers, suite salud: «Orientación sobre medicamentos (dosis,
    //          interacciones, pauta)» → Nivel 1, severity="critical" (aria-label «Aviso importante»);
    //          o sin pautas, como pide su propia «Nota editorial» («no prescribe intervenciones»).
    //          Y sin `// @disclaimer: exempt` si monta DisclaimerCard: audit-disclaimers salta las
    //          apps exentas y nunca mira su severity
    // OBTENIDO severity="high" y `// @disclaimer: exempt` en la línea 2 de page.tsx
    test.fail();
    const faq = (await jsonLd(page)).find((n) => n['@type'] === 'FAQPage');
    const textoFaq = (faq?.mainEntity ?? []).map((q) => q.acceptedAnswer.text).join(' ');
    const pauta = /\d+(?:,\d+)?\s*-\s*\d+(?:,\d+)?\s*mg/;
    const conPauta = pauta.test(await textoGuia(page)) || pauta.test(textoFaq);
    if (conPauta) {
      await expect(page.getByRole('note', { name: 'Aviso importante' }), 'aviso crítico').toHaveCount(1);
    }
    const fuente = readFileSync(join(process.cwd(), 'app/visualizador-melatonina/page.tsx'), 'utf8');
    if (fuente.includes('<DisclaimerCard')) expect(fuente).not.toMatch(/@disclaimer:\s*exempt/);
  });

  test('HALLAZGO [contenido/medio]: el FAQPage no está en la página y repite con otra respuesta la pregunta de los suplementos', async ({ page }) => {
    // ABIERTO. ENTRADA  los dos bloques JSON-LD y el texto de la página (guía incluida)
    // ESPERADO cada pregunta del FAQPage pintada en una FAQ visible, las dos de UNA constante
    //          (PREGUNTAS_FRECUENTES; CLAUDE.md §1.ter, check:faq-unica)
    // OBTENIDO 0 de 5 preguntas en la página; la guía responde «¿Qué dice la ciencia sobre los
    //          suplementos de melatonina?» con «Insomnio circadiano: evidencia moderada» y «0,1-1 mg»,
    //          y el FAQPage, a la misma pregunta, con evidencia «sólida» en el trastorno de fase de
    //          sueño retrasada y en trabajadores nocturnos y «0,5-1 mg»
    test.fail();
    await comprobarFaqPageUnico(page);
  });

  test('HALLAZGO [contenido/medio]: el retraso por pantallas es 30-90 min en la página y 90-120 min en el FAQPage', async ({ page }) => {
    // ABIERTO. ENTRADA  simulador «Luz artificial», tarjeta «Pantallas antes de dormir» y FAQPage
    //          «¿Por qué la luz azul de las pantallas afecta al sueño?»
    // ESPERADO la misma horquilla en los tres sitios (y con fuente, o retirada: criterio C0203)
    // OBTENIDO página «30-90 minutos» (dos veces); FAQPage «entre 90 y 120 minutos»
    test.fail();
    await botonLuz(page, 'Luz artificial nocturna (pantallas, LED)').click();
    await expect(barraNivel(page)).toHaveAttribute('aria-valuenow', /\d+/);
    const pagina = [
      (await seccion(page, H2_LUZ).innerText()).replace(/\s+/g, ' '),
      ((await seccion(page, H2_JET).textContent()) ?? '').replace(/\s+/g, ' '),
    ].join(' ');
    const enPagina = [...pagina.matchAll(/(\d+)-(\d+) minutos/g)].map((m) => `${m[1]}-${m[2]}`);
    const r = await respuestaFaq(page, Q_PANTALLAS);
    const enFaq = r.match(/entre (\d+) y (\d+) minutos/);
    if (enFaq) for (const h of enPagina) expect(h, 'horquilla de la página frente a la del FAQPage').toBe(`${enFaq[1]}-${enFaq[2]}`);
  });

  test('HALLAZGO [contenido/medio]: cifras sin fuente (C0203) y «~2 horas después del inicio de la oscuridad» frente a CIMA', async ({ page }) => {
    // ABIERTO. ENTRADA  simulador «Oscuridad total» y gráficos «Por edad» y «Por estación»
    // ESPERADO CIMA 5.1: la secreción «aumenta poco después del anochecer»; las cifras del gráfico
    //          por edad (en «pg/mL (aprox.)») y por estación (horas), con su fuente o retiradas
    // OBTENIDO «La producción de melatonina comienza ~2 horas después del inicio de la oscuridad»;
    //          edad 5 · 125 · 100 · 80 · 40 · 20 «pg/mL (aprox.)» (el título dice «relativo»);
    //          estación 9 · 7 · 5 horas; ninguna fuente citada
    test.fail();
    const texto = (await seccion(page, H2_LUZ).innerText()).replace(/\s+/g, ' ');
    expect(texto).not.toContain('comienza ~2 horas después del inicio de la oscuridad');
    const [, edad, estacion] = await leerGraficos(page);
    expect(edad.series[0].data).toHaveLength(6);
    expect(estacion.series[0].data).toHaveLength(3);
    const textoSeccion = await seccion(page, H2_EDAD).innerText();
    if ((edad.tituloY ?? '').includes('pg/mL')) expect(textoSeccion, 'fuente de los pg/mL').toMatch(/Fuente/);
    expect(textoSeccion, 'fuente de las horas por estación').toMatch(/Fuente/);
  });

  test('HALLAZGO [contenido/bajo]: el JSON-LD no declara características (featureList vacía)', async ({ page }) => {
    // ABIERTO. ENTRADA  el bloque JSON-LD WebApplication
    // ESPERADO 4-8 características reales (CLAUDE.md §1.ter)
    // OBTENIDO «featureList»: []
    test.fail();
    const app = (await jsonLd(page)).find((n) => n['@type'] === 'WebApplication');
    const n = (app?.featureList ?? app?.features ?? []).length;
    expect(n).toBeGreaterThanOrEqual(4);
    expect(n).toBeLessThanOrEqual(8);
  });

  test('HALLAZGO [contenido/bajo]: horas en formato de 12 h («3:00 AM», «11:00 PM») y «%» pegado a la cifra', async ({ page }) => {
    // ABIERTO. ENTRADA  tarjeta «Vuelo hacia el Este», simulador «Oscuridad total» y la barra
    // ESPERADO 24 h («03:00», «23:00», «entre las 2:00 y las 4:00») y «100 %» con espacio duro
    //          (CLAUDE.md global §2), también en el aria-label de la barra
    // OBTENIDO «3:00 AM», «11:00 PM», «entre las 2:00 y las 4:00 AM»; «100%», «~50%»,
    //          aria-label «Nivel de melatonina: 100%»
    test.fail();
    const textos = await Promise.all([H2_CURVA, H2_LUZ, H2_EDAD, H2_JET].map(async (t) => (await seccion(page, t).textContent()) ?? ''));
    const todo = textos.join(' ') + ' ' + (await textoGuia(page));
    expect(todo).not.toMatch(/\d{1,2}:\d{2}\s*(AM|PM)\b/);
    expect(todo).not.toMatch(/\d%/);
    expect(await barraNivel(page).getAttribute('aria-label')).not.toMatch(/\d%/);
  });

  test('HALLAZGO [contenido/bajo]: erratas «que desincronización el reloj» y el trastorno solo con su nombre inglés', async ({ page }) => {
    // ABIERTO. ENTRADA  descripción de «Jet Lag y Melatonina» y guía «Cronotipos»
    // ESPERADO «Cuatro escenarios que desincronizan el reloj interno»; el nombre en español del
    //          trastorno (el FAQPage ya dice «trastorno de fase de sueño retrasada»)
    // OBTENIDO «Cuatro escenarios que desincronización el reloj interno»; «Delayed Sleep Phase
    //          Disorder (DSPD)»
    test.fail();
    await expect(seccion(page, H2_JET)).toContainText('Cuatro escenarios');
    await expect(seccion(page, H2_JET)).not.toContainText('que desincronización el reloj', { timeout: 2000 });
    expect(await textoGuia(page)).toMatch(/fase\s+(de\s+sueño\s+retrasad|retrasada\s+del\s+sueño)/i);
  });
});

test.describe('Hallazgos de accesibilidad', () => {
  // Umbral WCAG 1.4.3: 4,5:1 para texto normal. La cifra de la barra es 16 px en negrita (no llega a
  // «texto grande», 18,66 px en negrita); los rótulos de Chart.js, 11-12 px.

  test('HALLAZGO [accesibilidad/medio]: en claro, la cifra de la barra en naranja no llega a 4,5:1', async ({ page }) => {
    // ABIERTO. El color llega por style={{ color }} desde ESCENARIOS_LUZ: check:semanticos-claro solo mira .module.css
    // ESPERADO ≥ 4,5:1 contra el fondo #FAFAFA
    // OBTENIDO «5%» #F5A623 → 1,94:1 · «30%» #E67E22 → 2,73:1 (calculado a mano: 1,94 y 2,73)
    test.fail();
    await abrir(page);
    for (const nombre of ['Luz solar (día)', 'Luz artificial nocturna (pantallas, LED)', 'Oscuridad total']) {
      await botonLuz(page, nombre).click();
      await expect(botonLuz(page, nombre)).toHaveAttribute('aria-pressed', 'true');
      await esperarTransiciones(valorNivel(page));
      expect(await contrasteSobreFondoReal(valorNivel(page)), nombre).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('HALLAZGO [accesibilidad/medio]: en oscuro, la cifra «100%» en #4A4E8A no llega a 4,5:1', async ({ page }) => {
    // ABIERTO. ESPERADO ≥ 4,5:1 contra el fondo #1A1A1A
    // OBTENIDO «100%» #4A4E8A → 2,28:1 (a mano: 2,27)
    test.fail();
    await abrir(page, 'dark');
    for (const nombre of ['Luz solar (día)', 'Luz artificial nocturna (pantallas, LED)', 'Oscuridad total']) {
      await botonLuz(page, nombre).click();
      await expect(botonLuz(page, nombre)).toHaveAttribute('aria-pressed', 'true');
      await esperarTransiciones(valorNivel(page));
      expect(await contrasteSobreFondoReal(valorNivel(page)), nombre).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('HALLAZGO [accesibilidad/medio]: los rótulos de la curva (leyenda #666 en oscuro, ejes #888 en claro) no llegan a 4,5:1', async ({ page }) => {
    // ABIERTO. Los colores van fijos en las opciones de Chart.js; ningún candado mira el canvas.
    // ESPERADO ≥ 4,5:1 en los dos temas
    // OBTENIDO leyenda #666 sobre #1A1A1A → 3,03:1 · marcas del eje #888 sobre #FAFAFA → 3,40:1
    test.fail();
    await abrir(page, 'dark');
    const [g] = await leerGraficos(page);
    const lienzo = seccion(page, H2_CURVA).locator('canvas');
    expect(await contrasteTextoCanvas(lienzo, g.colorLeyenda ?? '#666'), `leyenda ${g.colorLeyenda} en oscuro`).toBeGreaterThanOrEqual(4.5);
    await page.evaluate(() => window.localStorage.setItem('meskeia-theme', 'light'));
    await page.reload();
    await esperarPaginaAsentada(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const [g2] = await leerGraficos(page);
    expect(await contrasteTextoCanvas(lienzo, g2.colorTicksX ?? '#888'), `ejes ${g2.colorTicksX} en claro`).toBeGreaterThanOrEqual(4.5);
  });

  test('HALLAZGO [accesibilidad/medio]: los tres gráficos son role="img" sin nombre ni alternativa en texto', async ({ page }) => {
    // ABIERTO. ENTRADA  los tres <canvas> (curva de 24 h, por edad, por estación)
    // ESPERADO un nombre accesible que diga lo que muestra (o los datos en una tabla): WCAG 1.1.1
    // OBTENIDO role="img", sin aria-label ni contenido alternativo: los 24 valores de la curva y las
    //          cifras por edad y estación solo están en el lienzo
    test.fail();
    await abrir(page);
    const lienzos = page.locator('canvas');
    await expect(lienzos).toHaveCount(3);
    for (let i = 0; i < 3; i++) await expect(lienzos.nth(i)).toHaveAccessibleName(/\S/, { timeout: 2000 });
  });
});
