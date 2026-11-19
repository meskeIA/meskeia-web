import { test, expect, devices, type Page, type Locator } from '@playwright/test';
import { activarTema, prepararParaMedir } from '../contraste-text-muted-auxiliares';

/**
 * enchufes-por-pais — PRIMERA INSPECCIÓN (Inspector, 19/11/2026)
 *
 * La app promete en su <h1> «Enchufes por País» y en su subtítulo «¿Qué adaptador necesitas?
 * Voltaje y tipos de enchufe en todo el mundo»; su metadata, «Más de 100 países». Todo vive en
 * app/enchufes-por-pais/page.tsx: un <select> con BASE_PAISES (62 países agrupados por continente)
 * y, al elegir uno, una ficha con voltaje, frecuencia, tipos de enchufe (con la descripción de
 * TIPOS_ENCHUFE) y una nota escrita a mano para quien sale de España. No hay buscador, ni país de
 * origen, ni regla de compatibilidad calculada: la «verdad comprobable» son los datos de cada ficha
 * y su coherencia con el resto de la página (guía, tabla y FAQPage).
 *
 * De dónde salen los esperados: la referencia que trae el encargo del Inspector (España C/F
 * 230 V 50 Hz · Japón 100 V con 50 y 60 Hz según la región · Brasil 127/220 V con tipo N ·
 * Reino Unido tipo G · EE. UU. 120 V 60 Hz · Suiza tipo J · Italia tipo L · Sudáfrica M/N) y,
 * para lo demás, la propia página (dos partes suyas que deben decir lo mismo). La tabla «World
 * Plugs» de la IEC (www.iec.ch) NO se ha podido cotejar: el dominio no está en la red de fuentes
 * oficiales de la tarea. La app cita en un comentario «IEC 60083, World Standards, Wikipedia».
 *
 * LOS TRES CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *
 *   CASO 1 (normal) — España → «230 V», «50 Hz», «C / F», chips «Tipo C» y «Tipo F».
 *     Coincide.
 *
 *   CASO 2 (límite: los países conflictivos) — Reino Unido «G» 230 V 50 Hz · Estados Unidos
 *     «120 V» «60 Hz» · Japón «100 V» con 50 y 60 Hz · Brasil 127 y 220 V con tipo N · Suiza con J ·
 *     Italia con L · Sudáfrica con M y N. Coinciden. Pero:
 *       · Japón sale «50-60 Hz», el mismo formato con el que la guía explica un cargador que admite
 *         las dos («100-240V, 50-60Hz»), y nada dice que es 50 Hz en una zona y 60 Hz en otra
 *         (el FAQPage sí: «100 V a 50/60 Hz según la zona»). HALLAZGO.
 *       · La guía dice «Tipo G para Reino Unido, Irlanda, India, Hong Kong, Malasia, Singapur» y la
 *         ficha de India da «C / D / M», sin G. HALLAZGO.
 *       · Seis notas dicen que un tipo es «exclusivo» de un país que el propio catálogo desmiente
 *         (el D de India lo tienen además Sri Lanka, Nepal, Jordania, Tanzania, Ghana y Nigeria…).
 *         HALLAZGO.
 *
 *   CASO 3 (se rechaza) — sin país elegido, o volviendo a «— Elige un país —»: ninguna ficha, solo
 *     «Selecciona un país para ver qué enchufe y adaptador necesitas». Coincide. España contra sí
 *     misma da la nota «Referencia de origen». Al buscar con el teclado (la única búsqueda que hay):
 *     con el combo enfocado, pulsar «J» debía llevar a Japón y no mueve nada, porque cada opción
 *     empieza por la bandera («🇯🇵 Japón»); el mismo select sin banderas sí salta (control). HALLAZGO.
 *
 * Además: el combo sin orden alfabético (África la última), su nombre accesible «País de destino»
 * que no contiene la etiqueta visible «Selecciona tu destino», el foco de teclado invisible en
 * oscuro (en claro sí se ve: control), «Más de 100 países» con 62, el FAQPage que contradice a la
 * página (más de 15 tipos, tipo B, Perú a 110-120 V), las notas que comparan con España sin decirlo,
 * el WebApplication sin características y «10€»/«95%» sin espacio. En móvil (Pixel 7) la ficha
 * cabe sin desbordar: correcto.
 *
 * Los test con test.fail() son HALLAZGOS ABIERTOS: el día que se reparen, fallarán por pasar y habrá
 * que quitarles el test.fail() (y cambiar ABIERTO por REPARADO). Cada uno afirma lo CORRECTO.
 *
 * REPARADOS (/reparar, 19/11/2026): los trece. La IEC no se pudo consultar tampoco al reparar, así que
 * ninguna ficha cambió de voltaje ni de tipos: se alineó el resto de la página con las fichas
 * (FAQPage sin Perú en el grupo de 110-120 V, guía del G sin India), Japón dice «50 o 60 Hz según la
 * zona» como ya decía el FAQPage, las notas dejan de llamar «exclusivo» a un tipo que el catálogo
 * comparte (queda el H de Israel), el combo va sin banderas y en orden alfabético, sin aria-label,
 * con el foco visible en oscuro, la promesa baja a «Más de 60 países» y el origen España se dice.
 */

const RUTA = '/enchufes-por-pais/';
const SELECTOR = '#selector-pais';
const AVISO_SIN_PAIS = 'Selecciona un país para ver qué enchufe y adaptador necesitas';

/** El <select> no tiene rastreador de valor de React: se espera a que React le cuelgue sus props. */
async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await page.waitForFunction(
    (sel) => {
      const nodo = document.querySelector(sel);
      return Boolean(nodo) && Object.keys(nodo as Element).some((k) => k.startsWith('__reactProps$'));
    },
    SELECTOR,
    { timeout: 15000 },
  );
}

/** La tarjeta del selector: el combo, la ficha del país y el aviso cuando no hay ninguno. */
function tarjeta(page: Page): Locator {
  return page.locator(`section:has(> div > ${SELECTOR})`);
}

/** Elige un país y espera a que la ficha sea la suya (si el evento se pierde, no llega el <h2>). */
async function elegir(page: Page, pais: string): Promise<void> {
  await page.selectOption(SELECTOR, pais);
  await expect(tarjeta(page).getByRole('heading', { level: 2, name: pais, exact: true })).toBeVisible();
}

/** El valor que la ficha pinta encima de su rótulo («230 V» sobre «Voltaje»). */
async function dato(page: Page, rotulo: 'Voltaje' | 'Frecuencia' | 'Tipos'): Promise<string> {
  const etiqueta = tarjeta(page).getByText(rotulo, { exact: true });
  return ((await etiqueta.locator('xpath=preceding-sibling::span[1]').textContent()) ?? '').trim();
}

async function chips(page: Page): Promise<string[]> {
  return tarjeta(page).getByText(/^Tipo [A-N]$/).allTextContents();
}

async function nota(page: Page): Promise<string> {
  return ((await tarjeta(page).getByRole('note').textContent()) ?? '').trim();
}

/** Los países del combo, en el orden en que salen. */
async function paisesDelCombo(page: Page): Promise<string[]> {
  return page
    .locator(`${SELECTOR} option`)
    .evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value).filter((v) => v !== ''));
}

type EntradaFaq = { name: string; acceptedAnswer: { text: string } };
interface BloqueLd {
  '@type'?: string;
  mainEntity?: EntradaFaq[];
  featureList?: unknown;
  features?: unknown;
}

async function bloquesLd(page: Page): Promise<BloqueLd[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.map((t) => JSON.parse(t) as BloqueLd);
}

test.describe('enchufes-por-pais · escritorio', () => {
  test.beforeEach(async ({ page }) => {
    await cargar(page);
  });

  test('CASO 1 · España: 230 V, 50 Hz y tipos C / F', async ({ page }) => {
    await elegir(page, 'España');
    expect(await dato(page, 'Voltaje')).toBe('230 V');
    expect(await dato(page, 'Frecuencia')).toBe('50 Hz');
    expect(await dato(page, 'Tipos')).toBe('C / F');
    expect(await chips(page)).toEqual(['Tipo C', 'Tipo F']);
    // Origen y destino iguales: la nota lo reconoce como el país de referencia
    expect(await nota(page)).toContain('Referencia de origen');
  });

  test('CASO 2 · los países conflictivos dan el voltaje, la frecuencia y los tipos de la referencia', async ({
    page,
  }) => {
    // Referencia del encargo del Inspector (19/11/2026); sin cotejar con la IEC (ver la cabecera)
    await elegir(page, 'Reino Unido');
    expect(await dato(page, 'Tipos')).toBe('G');
    expect(await dato(page, 'Voltaje')).toBe('230 V');
    expect(await dato(page, 'Frecuencia')).toBe('50 Hz');

    await elegir(page, 'Estados Unidos');
    expect(await dato(page, 'Voltaje')).toBe('120 V');
    expect(await dato(page, 'Frecuencia')).toBe('60 Hz');
    expect(await dato(page, 'Tipos')).toBe('A / B');

    await elegir(page, 'Japón');
    expect(await dato(page, 'Voltaje')).toBe('100 V');
    const frecuenciaJapon = await dato(page, 'Frecuencia');
    expect(frecuenciaJapon).toContain('50');
    expect(frecuenciaJapon).toContain('60');

    await elegir(page, 'Brasil');
    const voltajeBrasil = await dato(page, 'Voltaje');
    expect(voltajeBrasil).toContain('127');
    expect(voltajeBrasil).toContain('220');
    expect((await dato(page, 'Tipos')).split(' / ')).toContain('N');

    await elegir(page, 'Suiza');
    expect((await dato(page, 'Tipos')).split(' / ')).toContain('J');

    await elegir(page, 'Italia');
    expect((await dato(page, 'Tipos')).split(' / ')).toContain('L');

    await elegir(page, 'Sudáfrica');
    const tiposSudafrica = (await dato(page, 'Tipos')).split(' / ');
    expect(tiposSudafrica).toContain('M');
    expect(tiposSudafrica).toContain('N');
  });

  test('CASO 3 · sin país no hay ficha, y volver a «— Elige un país —» la retira', async ({ page }) => {
    const t = tarjeta(page);
    await expect(t.getByText(AVISO_SIN_PAIS)).toBeVisible();
    await expect(t.getByRole('heading', { level: 2 })).toHaveCount(0);

    await elegir(page, 'Australia');
    await expect(t.getByText(AVISO_SIN_PAIS)).toHaveCount(0);

    await page.selectOption(SELECTOR, '');
    await expect(t.getByText(AVISO_SIN_PAIS)).toBeVisible();
    await expect(t.getByRole('heading', { level: 2 })).toHaveCount(0);
    await expect(t.getByRole('note')).toHaveCount(0);
  });

  test('el combo no pierde países (62 a 19/11/2026)', async ({ page }) => {
    expect((await paisesDelCombo(page)).length).toBeGreaterThanOrEqual(62);
  });

  test('control · el mismo combo SIN banderas sí salta a Japón con la tecla «J»', async ({ page }) => {
    // Prueba que el navegador del test hace la búsqueda por letra: el hallazgo de abajo no es del entorno
    await page.evaluate((sel) => {
      const original = document.querySelector(sel) as HTMLSelectElement;
      const copia = original.cloneNode(true) as HTMLSelectElement;
      copia.id = 'control-sin-bandera';
      for (const o of Array.from(copia.querySelectorAll('option'))) if (o.value) o.textContent = o.value;
      copia.value = '';
      original.parentElement!.appendChild(copia);
    }, SELECTOR);
    await page.locator('#control-sin-bandera').focus();
    await page.keyboard.press('J');
    await expect(page.locator('#control-sin-bandera')).toHaveValue('Japón');
  });

  test('HALLAZGO (19/11/2026, REPARADO) · con el combo enfocado, «J» lleva a Japón: las opciones ya no empiezan por la bandera', async ({
    page,
  }) => {
    await page.locator(SELECTOR).focus();
    await page.keyboard.press('J');
    // Primer país que empieza por J en el orden del combo; hoy el valor se queda en «»
    await expect(page.locator(SELECTOR)).toHaveValue('Japón');
  });

  test('HALLAZGO (19/11/2026, REPARADO) · continentes y países van en orden alfabético (África, la primera)', async ({
    page,
  }) => {
    const grupos = await page.locator(`${SELECTOR} optgroup`).evaluateAll((gs) =>
      gs.map((g) => ({
        etiqueta: (g as HTMLOptGroupElement).label,
        paises: Array.from(g.querySelectorAll('option')).map((o) => o.value),
      })),
    );
    // Hoy: América, Asia, Europa, Europa/Asia, Oceanía, África (`.sort()` sin localeCompare deja la Á al final)
    expect(grupos.map((g) => g.etiqueta)).toEqual(['África', 'América', 'Asia', 'Europa', 'Europa/Asia', 'Oceanía']);
    for (const g of grupos) {
      // Hoy Europa empieza «España, Francia, Alemania, Italia…»
      expect(g.paises, g.etiqueta).toEqual([...g.paises].sort((a, b) => a.localeCompare(b, 'es')));
    }
  });

  test('HALLAZGO (19/11/2026, REPARADO) · el nombre accesible del combo contiene su etiqueta visible', async ({
    page,
  }) => {
    // Etiqueta visible «Selecciona tu destino»; el aria-label la sustituye por «País de destino» (WCAG 2.5.3)
    await expect(page.getByRole('combobox', { name: /Selecciona tu destino/i })).toHaveCount(1);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · cada país al que la guía manda el adaptador G tiene G en su ficha', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Ver guía educativa/ }).click();
    const item = page.getByRole('listitem').filter({ hasText: /^Tipo G para / });
    const texto = (await item.innerText()).trim();
    // Antes «Tipo G para Reino Unido, Irlanda, India, Hong Kong, Malasia, Singapur»; India (C / D / M) sale
    const paisesGuia = texto.replace(/^Tipo G para\s*/, '').split(/,\s*/);
    expect(paisesGuia.length).toBeGreaterThan(0);
    const sinG: string[] = [];
    for (const pais of paisesGuia) {
      await elegir(page, pais);
      const tipos = await dato(page, 'Tipos');
      if (!tipos.split(' / ').includes('G')) sinG.push(`${pais}: ${tipos}`);
    }
    // Hoy: ['India: C / D / M']
    expect(sinG).toEqual([]);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · ninguna nota «exclusivo de…» la desmiente el propio catálogo', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const ALIAS: Record<string, string[]> = { UK: ['Reino Unido'], 'Australia/NZ': ['Australia', 'Nueva Zelanda'] };
    const tiposDe = new Map<string, string[]>();
    const exclusivos: { tipo: string; de: string[]; nota: string }[] = [];
    for (const pais of await paisesDelCombo(page)) {
      await elegir(page, pais);
      tiposDe.set(pais, (await dato(page, 'Tipos')).split(' / '));
      const texto = await nota(page);
      const m = texto.match(/tipo ([A-N]) \([^)]*\) es exclusivo de ([^.]+)\./);
      if (m) exclusivos.push({ tipo: m[1], de: ALIAS[m[2].trim()] ?? [m[2].trim()], nota: pais });
    }
    expect(exclusivos.length).toBeGreaterThan(0);
    const desmentidos: string[] = [];
    for (const { tipo, de, nota: dondeLoDice } of exclusivos) {
      const otros = [...tiposDe].filter(([p, ts]) => ts.includes(tipo) && !de.includes(p)).map(([p]) => p);
      if (otros.length) desmentidos.push(`${tipo} (nota de ${dondeLoDice}): también ${otros.join(', ')}`);
    }
    // Hoy: G, L, J, D, M e I (el H de Israel es el único «exclusivo» que el catálogo sostiene)
    expect(desmentidos).toEqual([]);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · Japón dice que la frecuencia va por zonas', async ({
    page,
  }) => {
    await elegir(page, 'Japón');
    const texto = `${await dato(page, 'Frecuencia')} ${await nota(page)}`;
    // El FAQPage de la propia app: «Japón tiene 100 V a 50/60 Hz según la zona»
    expect(texto).toMatch(/\b(este|oeste|región|regiones|zona|zonas)\b/i);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · la ficha dice que el origen de la comparación es España', async ({
    page,
  }) => {
    await elegir(page, 'Estados Unidos');
    // La ficha (sin el combo) debe decir desde dónde se compara: hoy «Voltaje diferente (120V vs 230V)…»
    const textoFicha = await tarjeta(page).evaluate((s) => {
      const copia = s.cloneNode(true) as HTMLElement;
      copia.querySelector('select')?.remove();
      return copia.textContent ?? '';
    });
    expect(textoFicha).toMatch(/España|español/i);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · la metadata no promete más países de los que tiene el combo', async ({
    page,
  }) => {
    const descripcion = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    const total = (await paisesDelCombo(page)).length;
    const promesa = descripcion.match(/más de (\d+) países/i);
    if (promesa) expect(total).toBeGreaterThan(Number(promesa[1]));
    // Antes «Más de 100 países» con 62; ahora «Más de 60 países»
    expect(descripcion).not.toMatch(/más de 100 países/i);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · el FAQPage dice lo mismo que la página (14 tipos, el tipo B, Perú y EE. UU.)', async ({
    page,
  }) => {
    const faq = (await bloquesLd(page)).find((b) => b['@type'] === 'FAQPage');
    expect(faq?.mainEntity?.length).toBeGreaterThan(0);
    const respuestas = faq!.mainEntity!.map((e) => e.acceptedAnswer.text).join(' ');

    // La guía «Ver guía de todos los tipos de enchufe (A–N)» pinta 14 tipos; el FAQPage dice «más de 15»
    const tiposGuia = await page.locator('details').getByText(/^Tipo [A-N]$/).count();
    expect(tiposGuia).toBe(14);
    expect(respuestas).not.toMatch(/más de 15 tipos/i);

    // Tipo B en la página: «Dos clavijas planas + tierra redonda»; el FAQPage: «tres clavijas planas»
    expect(respuestas).not.toMatch(/Tipo B \(tres clavijas planas/i);

    // Perú en la ficha: 220 V; el FAQPage: «Colombia o Perú usan 110-120 V»
    await elegir(page, 'Perú');
    expect(await dato(page, 'Voltaje')).toBe('220 V');
    expect(respuestas).not.toMatch(/Perú usan 110-120 V/i);

    // EE. UU. en la ficha: «A / B»; el FAQPage decía solo «usa el Tipo A»
    expect(respuestas).not.toMatch(/Estados Unidos \(y Canadá\) usa el Tipo A \(/);
    expect(respuestas).toMatch(/Tipos A \(dos clavijas planas paralelas\) y B/);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · el JSON-LD WebApplication declara sus características', async ({ page }) => {
    const app = (await bloquesLd(page)).find((b) => b['@type'] === 'WebApplication');
    const lista = app?.featureList ?? app?.features;
    expect(Array.isArray(lista) ? lista.length : 0).toBeGreaterThanOrEqual(4);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · formato: «10 €» y «30 €» con espacio en la guía, «95 %» separado en el FAQPage', async ({
    page,
  }) => {
    // CLAUDE.md §2: «1.234,56 €» con espacio antes del símbolo y «15 %» separado (U+00A0)
    const consejo = page.getByText(/^Si viajas frecuentemente, invierte/);
    const paso6 = page.getByText(/^Si son varios países con tipos distintos/);
    const textos = [await consejo.textContent(), await paso6.textContent()].join(' ');
    // Hoy: «Presupuesto: entre 10€ y 30€.» y «Presupuesto: 10-30€»
    expect(textos).not.toMatch(/\d€/);
    const faq = (await bloquesLd(page)).find((b) => b['@type'] === 'FAQPage');
    const respuestas = (faq?.mainEntity ?? []).map((e) => e.acceptedAnswer.text).join(' ');
    // Antes: «más del 95% de los países»; ahora con espacio duro (U+00A0)
    expect(respuestas).not.toMatch(/\d%/);
    expect(respuestas).toContain('95 %');
    // Las notas: «120 V» separado, como la ficha (antes «120V vs 230V»)
    await elegir(page, 'Estados Unidos');
    expect(await nota(page)).not.toMatch(/\dV\b/);
  });
});

/** Luminancia relativa WCAG de un color rgb. */
function luminancia([r, g, b]: number[]): number {
  const canal = (c: number): number => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(a: number[], b: number[]): number {
  const [l1, l2] = [luminancia(a), luminancia(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Pone el foco de TECLADO en el combo (Tab, para que case también el :focus-visible de globals.css)
 * y devuelve el mejor contraste, contra el fondo de la tarjeta, de lo que lo señala: borde, contorno
 * o anillo (este, translúcido, compuesto sobre el fondo). WCAG 2.4.7 / 1.4.11: 3:1.
 */
async function contrasteDelFoco(page: Page): Promise<number> {
  await prepararParaMedir(page);
  await page.locator(SELECTOR).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator(SELECTOR)).toBeFocused();
  const m = await page.locator(SELECTOR).evaluate((s) => {
    const rgba = (txt: string): number[] | null => {
      const p = txt.match(/rgba?\(([^)]+)\)/);
      return p ? p[1].split(/[\s,/]+/).filter(Boolean).map(Number) : null;
    };
    const cs = getComputedStyle(s);
    return {
      fondo: rgba(getComputedStyle(s.closest('section') as Element).backgroundColor),
      borde: rgba(cs.borderTopColor),
      contorno: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? rgba(cs.outlineColor) : null,
      anillo: cs.boxShadow === 'none' ? null : rgba(cs.boxShadow),
    };
  });
  expect(m.fondo, 'fondo de la tarjeta').not.toBeNull();
  const fondo = m.fondo!.slice(0, 3);
  const candidatos: number[][] = [];
  if (m.borde) candidatos.push(m.borde.slice(0, 3));
  if (m.contorno) candidatos.push(m.contorno.slice(0, 3));
  if (m.anillo) {
    // El anillo es translúcido: se compone sobre el fondo de la tarjeta
    const a = m.anillo[3] ?? 1;
    candidatos.push(m.anillo.slice(0, 3).map((c, i) => c * a + fondo[i] * (1 - a)));
  }
  return Math.max(...candidatos.map((c) => contraste(c, fondo)));
}

test.describe('enchufes-por-pais · foco del combo en los dos temas', () => {
  test('control · en claro el foco del combo se ve (borde #2E86AB sobre blanco, unos 4,1:1)', async ({ page }) => {
    await cargar(page);
    await activarTema(page, 'light');
    expect(await contrasteDelFoco(page)).toBeGreaterThanOrEqual(3);
  });

  test('HALLAZGO (19/11/2026, REPARADO) · en oscuro el foco de teclado del combo se ve (3:1 o más)', async ({
    page,
  }) => {
    await cargar(page);
    await activarTema(page, 'dark');
    // Antes: borde #3a3a3a (lo fija [data-theme='dark'] .selectPais, que pisa a .selectPais:focus),
    // contorno «none» y anillo rgba(63,165,209,0,15): el mejor da ~1,26:1 sobre #2d2d2d
    expect(await contrasteDelFoco(page)).toBeGreaterThanOrEqual(3);
  });
});

test.describe('enchufes-por-pais · móvil (Pixel 7)', () => {
  const pixel = devices['Pixel 7'];
  test.use({
    viewport: pixel.viewport,
    userAgent: pixel.userAgent,
    deviceScaleFactor: pixel.deviceScaleFactor,
    isMobile: pixel.isMobile,
    hasTouch: pixel.hasTouch,
  });

  test('la ficha con más datos cabe sin desbordar a lo ancho y el combo se puede tocar', async ({ page }) => {
    await cargar(page);
    const caja = await page.locator(SELECTOR).boundingBox();
    expect(caja?.height ?? 0).toBeGreaterThanOrEqual(44);

    for (const pais of ['Jordania', 'Emiratos Árabes Unidos', 'Brasil']) {
      await elegir(page, pais);
      const anchos = await page.evaluate(() => ({
        documento: document.documentElement.scrollWidth,
        ventana: document.documentElement.clientWidth,
      }));
      expect(anchos.documento, pais).toBeLessThanOrEqual(anchos.ventana);
    }
    // La última del bucle es Brasil; Jordania lleva seis tipos en la tercera casilla
    expect(await dato(page, 'Tipos')).toBe('C / N');
    await elegir(page, 'Jordania');
    expect(await dato(page, 'Tipos')).toBe('B / C / D / F / G / J');
  });
});
