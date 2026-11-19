import { test, expect, Locator, Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';

/**
 * Inspector — visualizador-arquitectura-computador (segmento INTERACTIVA, riesgo 3)
 * Primera inspección: 16/11/2026, con el cabo C0673. Banco: `next start` de la copia del Inspector.
 *
 * QUÉ PROMETE LA APP
 *   · <h1> «Arquitectura del Computador»: Von Neumann, CPU, ciclo fetch-decode-execute y jerarquía
 *     de memoria «explicados de forma visual». Cuatro pestañas: diagrama Von Neumann con bloques
 *     que abren su descripción, tarjetas de la CPU, un mini-programa de 12 pasos
 *     (LOAD A,5 → LOAD B,3 → ADD A,B → STORE C,A) y una tabla de 8 niveles de memoria.
 *   · No tiene entradas: lo comprobable es la TRAZA del mini-programa (qué valen PC, MAR, MDR, IR y
 *     ACC en cada fase), la navegación entre pasos y la coherencia de las cifras que publica.
 *
 * LOS CASOS, RESUELTOS A MANO ANTES DE ABRIR EL NAVEGADOR
 *   CASO 1 (normal) — traza del mini-programa, cada instrucción en una palabra desde la dirección 100:
 *       Fetch:   MAR ← PC; PC ← PC + 1; MDR ← M[MAR]; IR ← MDR
 *       I1 (100) LOAD A,5  → PC 100→101, MAR 100, IR «LOAD A,5»; Execute: A = 5 (inmediato, sin RAM)
 *       I2 (101) LOAD B,3  → PC 101→102, MAR 101, IR «LOAD B,3»; Execute: B = 3, A sigue en 5
 *       I3 (102) ADD A,B   → PC 102→103, MAR 102, IR «ADD A,B»;  Execute: ALU 5 + 3 = 8 → A = 8,
 *                            flag Z = 0 (resultado distinto de cero)
 *       I4 (103) STORE C,A → PC 103→104, MAR 103, IR «STORE C,A»; Execute: MAR ← dir(C), MDR ← 8,
 *                            RAM[C] = 8
 *       4 instrucciones × 3 fases = 12 pasos, en el orden F, D, E.
 *   CASO 2 (límite) — en el paso 1 «Anterior» no hace nada (deshabilitado); 11 «Siguiente» llevan a
 *       «Paso 12 / 12» y ahí «Siguiente» se deshabilita; el punto «Paso 7: Fetch» salta a I3;
 *       «Reiniciar» vuelve a 1 / 12. Un bloque del diagrama se abre con un clic y se cierra con otro.
 *       La tabla de memoria crece en latencia nivel a nivel: 300 ps < 1 ns < 4 ns < 10 ns < 100 ns
 *       < 100 µs < 10 ms < segundos.
 *   CASO 3 (debe avisar bien) — la caja «¿Por qué existe la jerarquía de memoria?» dice que la RAM
 *       (~100 ns) cuesta «miles de ciclos de espera». A la frecuencia de ejemplo de la propia app
 *       (tarjeta CLK: 3,5 GHz) son 100 ns × 3,5 GHz = 350 ciclos: CIENTOS. Para «miles» (≥ 2.000)
 *       harían falta 20 GHz. La FAQ de la propia app dice «200+ ciclos».
 *
 * LO QUE ESTÁ SANO (16/11/2026): los 12 pasos cuadran con la traza a mano registro a registro; los
 * límites de la navegación; el clic en los 8 bloques; la tabla de memoria, monótona.
 *
 * HALLAZGOS ABIERTOS (inspector 16/11/2026): los test.fail() de abajo. Cada uno afirma lo que la app
 * DEBERÍA hacer, así que hoy falla «como se espera»; al repararse, se quita el test.fail().
 */

const RUTA = '/visualizador-arquitectura-computador/';

const BLOQUES = ['CPU', 'ALU', 'UC', 'Registros', 'Memoria RAM', 'ROM / Flash', 'Bus del sistema', 'E/S'];

function pestana(page: Page, nombre: RegExp): Locator {
  return page.getByRole('navigation', { name: 'Secciones del visualizador' }).getByRole('button', { name: nombre });
}

function contador(page: Page): Locator {
  return page.getByText(/^Paso \d+ \/ 12$/);
}

/** Paso visible del ciclo FDE: insignia de fase, título y registros (nombre → valor). */
async function leerPaso(page: Page): Promise<{ fase: string; titulo: string; registros: Record<string, string> }> {
  const titulo = page.getByRole('heading', { level: 3, name: /^(Fetch|Decode|Execute) —/ });
  const fase = ((await titulo.locator('xpath=preceding-sibling::div[1]').textContent()) ?? '').trim();
  const filas = page.getByRole('heading', { level: 4, name: 'Estado de los registros:' }).locator('xpath=following-sibling::div[1]/div');
  const registros: Record<string, string> = {};
  for (const fila of await filas.all()) {
    const partes = await fila.locator('span').allTextContents();
    registros[partes[0]] = partes[1];
  }
  return { fase, titulo: ((await titulo.textContent()) ?? '').trim(), registros };
}

/** Filas de la tabla de memoria, leídas a partir del párrafo de introducción de la pestaña. */
async function leerMemoria(page: Page): Promise<{ filas: string[][]; caja: string }> {
  return page.evaluate(() => {
    const intro = Array.from(document.querySelectorAll('p')).find((p) => /Cuanto más rápida la memoria/.test(p.textContent ?? ''));
    const piramide = intro?.nextElementSibling;
    const filas = piramide
      ? Array.from(piramide.children).map((f) => (f as HTMLElement).innerText.split('\n').map((s) => s.trim()).filter(Boolean))
      : [];
    const caja = Array.from(document.querySelectorAll('h3')).find((h) => /Por qué existe la jerarquía/.test(h.textContent ?? ''))?.nextElementSibling?.textContent ?? '';
    return { filas, caja: caja.replace(/\s+/g, ' ') };
  });
}

/** Latencia de la tabla en segundos: «~300 ps» → 3e-10; «segundos – min» → 1. */
function aSegundos(texto: string): number {
  if (/^segundos/.test(texto)) return 1;
  const m = texto.match(/([\d,]+)\s*(ps|ns|μs|µs|ms|s)\b/);
  if (!m) throw new Error(`Latencia que no se entiende: «${texto}»`);
  const factor: Record<string, number> = { ps: 1e-12, ns: 1e-9, 'μs': 1e-6, 'µs': 1e-6, ms: 1e-3, s: 1 };
  return Number(m[1].replace(',', '.')) * factor[m[2]];
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  // Sin inputs que sondear: la página entera hidratada y quieta antes del primer clic o tecla
  await esperarPaginaAsentada(page);
});

// ─── CASO 1 ────────────────────────────────────────────────────────────────────────────────

test('CASO 1 (normal) — los 12 pasos del ciclo FDE cuadran con la traza a mano', async ({ page }) => {
  await pestana(page, /Ciclo FDE/).click();
  await expect(contador(page)).toHaveText('Paso 1 / 12');

  const traza: { fase: string; titulo: RegExp; registros: Record<string, string | RegExp> }[] = [
    { fase: 'Fetch', titulo: /Instrucción 1: LOAD A, 5$/, registros: { PC: '100 → 101', MAR: '100', MDR: 'LOAD A,5', IR: 'LOAD A,5' } },
    { fase: 'Decode', titulo: /LOAD A, 5$/, registros: { IR: 'LOAD A,5', UC: /op=LOAD.*dest=A.*val=5/ } },
    { fase: 'Execute', titulo: /Cargar 5 en registro A$/, registros: { 'ACC (A)': '5' } },
    { fase: 'Fetch', titulo: /Instrucción 2: LOAD B, 3$/, registros: { PC: '101 → 102', MAR: '101', MDR: 'LOAD B,3', IR: 'LOAD B,3' } },
    { fase: 'Decode', titulo: /LOAD B, 3$/, registros: { IR: 'LOAD B,3', UC: /op=LOAD.*dest=B.*val=3/ } },
    { fase: 'Execute', titulo: /Cargar 3 en registro B$/, registros: { 'ACC (A)': '5', 'Reg B': '3' } },
    { fase: 'Fetch', titulo: /Instrucción 3: ADD A, B$/, registros: { PC: '102 → 103', MAR: '102', MDR: 'ADD A,B', IR: 'ADD A,B' } },
    { fase: 'Decode', titulo: /ADD A, B$/, registros: { IR: 'ADD A,B', UC: /op=ADD.*src1=A.*src2=B.*dest=A/ } },
    { fase: 'Execute', titulo: /ALU suma A \+ B$/, registros: { ALU: '5 + 3 = 8', 'ACC (A)': '8', 'Flag Zero': '0' } },
    { fase: 'Fetch', titulo: /Instrucción 4: STORE C, A$/, registros: { PC: '103 → 104', MAR: '103', MDR: 'STORE C,A', IR: 'STORE C,A' } },
    { fase: 'Decode', titulo: /STORE C, A$/, registros: { IR: 'STORE C,A', UC: /op=STORE.*src=A.*dest=mem\[C\]/ } },
    // RAM[C] se compara por la cifra: el «✅» que la acompaña es el hallazgo de los emojis
    { fase: 'Execute', titulo: /Escribir resultado en memoria$/, registros: { MAR: 'dir(C)', MDR: '8', 'RAM[C]': /^8\b/ } },
  ];

  for (let i = 0; i < traza.length; i++) {
    if (i > 0) await page.getByRole('button', { name: 'Paso siguiente' }).click();
    await expect(contador(page)).toHaveText(`Paso ${i + 1} / 12`);
    const paso = await leerPaso(page);
    const esperado = traza[i];
    expect(paso.fase, `paso ${i + 1}`).toBe(esperado.fase);
    expect(paso.titulo, `paso ${i + 1}`).toMatch(esperado.titulo);
    expect(Object.keys(paso.registros).sort(), `registros del paso ${i + 1}`).toEqual(Object.keys(esperado.registros).sort());
    for (const [nombre, valor] of Object.entries(esperado.registros)) {
      if (typeof valor === 'string') expect(paso.registros[nombre], `${nombre} en el paso ${i + 1}`).toBe(valor);
      else expect(paso.registros[nombre], `${nombre} en el paso ${i + 1}`).toMatch(valor);
    }
    // Invariante de todo Fetch: MAR = PC de partida, PC + 1 y la instrucción pasa de MDR a IR
    if (esperado.fase === 'Fetch') {
      const [antes, despues] = paso.registros.PC.split(' → ').map(Number);
      expect({ mar: Number(paso.registros.MAR), incremento: despues - antes, irIgualMdr: paso.registros.IR === paso.registros.MDR })
        .toEqual({ mar: antes, incremento: 1, irIgualMdr: true });
    }
  }
});

// ─── CASO 2 ────────────────────────────────────────────────────────────────────────────────

test.describe('CASO 2 (límite)', () => {
  test('primer y último paso, salto por punto y reinicio', async ({ page }) => {
    await pestana(page, /Ciclo FDE/).click();
    const anterior = page.getByRole('button', { name: 'Paso anterior' });
    const siguiente = page.getByRole('button', { name: 'Paso siguiente' });
    await expect(contador(page)).toHaveText('Paso 1 / 12');
    await expect(anterior).toBeDisabled();
    for (let i = 0; i < 11; i++) await siguiente.click();
    await expect(contador(page)).toHaveText('Paso 12 / 12');
    await expect(siguiente).toBeDisabled();
    await expect(anterior).toBeEnabled();
    // El punto 7 es el Fetch de la tercera instrucción (7 = 2 × 3 + 1)
    await page.getByRole('button', { name: 'Paso 7: Fetch' }).click();
    await expect(contador(page)).toHaveText('Paso 7 / 12');
    expect((await leerPaso(page)).titulo).toBe('Fetch — Instrucción 3: ADD A, B');
    await page.getByRole('button', { name: /Reiniciar/ }).click();
    await expect(contador(page)).toHaveText('Paso 1 / 12');
    await expect(anterior).toBeDisabled();
  });

  test('cada bloque del diagrama se abre con un clic y se cierra con otro', async ({ page }) => {
    const panel = page.getByText('Selecciona un bloque del diagrama para ver su descripción');
    for (const nombre of BLOQUES) {
      const bloque = page.getByRole('button', { name: nombre, exact: true });
      // force: ALU, UC y Registros se dibujan encima del bloque CPU
      await bloque.click({ force: true });
      await expect(page.getByRole('heading', { level: 2, name: nombre, exact: true })).toBeVisible();
      await bloque.click({ force: true });
      await expect(panel).toBeVisible();
    }
    // La RAM, con su latencia: la misma que la tabla de memoria (~100 ns)
    await page.getByRole('button', { name: 'Memoria RAM', exact: true }).click();
    await expect(page.getByText('Acceso en ~100 ns (más lenta que caché)')).toBeVisible();
  });

  test('la tabla de memoria crece en latencia nivel a nivel, de los registros a la cinta', async ({ page }) => {
    await pestana(page, /Jerarquía Memoria/).click();
    const { filas } = await leerMemoria(page);
    // fila = [icono, nombre, latencia, tamaño, coste]
    expect(filas.map((f) => f[1])).toEqual(['Registros CPU', 'Caché L1', 'Caché L2', 'Caché L3', 'RAM (DRAM)', 'SSD (NVMe)', 'HDD', 'Cinta magnética']);
    const latencias = filas.map((f) => aSegundos(f[2]));
    for (let i = 1; i < latencias.length; i++) {
      expect(latencias[i], `${filas[i][1]} más lenta que ${filas[i - 1][1]}`).toBeGreaterThan(latencias[i - 1]);
    }
    // RAM / L1 = 100 ns / 1 ns = 100 (dos órdenes de magnitud)
    expect(Math.round(latencias[4] / latencias[1])).toBe(100);
  });
});

// ─── CASO 3 ────────────────────────────────────────────────────────────────────────────────

test('HALLAZGO 4836 REPARADO 19/11/2026 [contenido/medio]: la RAM a ~100 ns son CIENTOS de ciclos, no «miles»', async ({ page }) => {
  // REPARADO: la caja dice ahora «cientos de ciclos de espera (a 3,5 GHz, unos 350)»
  // ENTRADA  pestaña «Jerarquía Memoria», caja «¿Por qué existe la jerarquía de memoria?»
  // ESPERADO 100 ns × 3,5 GHz (la frecuencia de ejemplo de la tarjeta CLK de la propia app) = 350
  //          ciclos; la FAQ de la app dice «200+ ciclos». Para «miles» harían falta ≥ 20 GHz
  // OBTENIDO «acceder a la RAM tarda ~100 ns — miles de ciclos de espera»
  await pestana(page, /Jerarquía Memoria/).click();
  const { filas, caja } = await leerMemoria(page);
  const ram = filas.find((f) => f[1] === 'RAM (DRAM)');
  const ciclos = Math.round(aSegundos(ram?.[2] ?? '') * 3.5e9);
  expect(ciclos).toBe(350);
  expect(caja).toContain('~100 ns');
  expect(caja).not.toContain('miles de ciclos');
  expect(caja).toContain('cientos de ciclos de espera (a 3,5 GHz, unos 350)');
});

// ─── CABO C0673: el diagrama Von Neumann con el teclado ─────────────────────────────────────

test('CABO C0673 · HALLAZGO 4835 REPARADO 19/11/2026 [accesibilidad/medio]: los bloques del diagrama se alcanzan con Tab y se abren con Enter o Espacio', async ({ page }) => {
  // REPARADO: los <g role="button"> llevan tabIndex={0}, onKeyDown (Enter y Espacio) y aria-pressed,
  // y el panel de detalle es aria-live
  // ENTRADA  foco en la pestaña «Von Neumann» y 15 pulsaciones de Tab; Enter sobre «Memoria RAM» y
  //          Espacio sobre «E/S»
  // ESPERADO los 8 bloques (role="button") en el orden de tabulación, y Enter/Espacio abren su
  //          descripción, como los pasos del ciclo FDE (WCAG 2.1.1 Teclado, nivel A)
  // OBTENIDO de «Jerarquía Memoria» el foco salta a «Ver guía educativa» y a las relacionadas: los
  //          <g role="button"> no tienen tabIndex (tabIndex -1) ni onKeyDown, y g.focus() no mueve el foco
  await pestana(page, /Von Neumann/).focus();
  const enfocados: string[] = [];
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    enfocados.push(
      await page.evaluate(() => {
        const a = document.activeElement;
        return a?.getAttribute('aria-label') ?? (a?.textContent ?? '').trim().slice(0, 30);
      }),
    );
  }
  expect(BLOQUES.filter((b) => !enfocados.includes(b)), `foco recorrido: ${enfocados.join(' · ')}`).toEqual([]);

  await page.getByRole('button', { name: 'Memoria RAM', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 2, name: 'Memoria RAM', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'E/S', exact: true }).focus();
  await page.keyboard.press(' ');
  await expect(page.getByRole('heading', { level: 2, name: 'E/S', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'E/S', exact: true })).toHaveAttribute('aria-pressed', 'true');
  // Espacio otra vez lo cierra, como el segundo clic
  await page.keyboard.press(' ');
  await expect(page.getByText('Selecciona un bloque del diagrama para ver su descripción')).toBeVisible();
});

// ─── Otros hallazgos abiertos ───────────────────────────────────────────────────────────────

test('HALLAZGO ABIERTO [contenido/bajo]: «todos, desde microcontroladores de 8 bits, siguen Von Neumann» contradice su propia FAQ', async ({ page }) => {
  test.fail(); // HALLAZGO ABIERTO (inspector 16/11/2026) [contenido/bajo]
  // ENTRADA  guía educativa abierta: consejo «Von Neumann sigue vigente»
  // ESPERADO coherente con la FAQ visible («La arquitectura Harvard (usada en microcontroladores…)»)
  //          y con el FAQPage («Los microcontroladores y DSP suelen usar Harvard pura o modificada»)
  // OBTENIDO «Todos los computadores actuales — desde microcontroladores de 8 bits hasta
  //          supercomputadores — siguen el modelo de Von Neumann de 1945.»
  await page.getByRole('button', { name: /Ver guía educativa/ }).click();
  const texto = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('\n');
  expect(texto).toContain('La arquitectura Harvard (usada en microcontroladores');
  expect(ld).toContain('Los microcontroladores y procesadores de señal digital (DSP) suelen usar Harvard');
  expect(texto).not.toMatch(/desde microcontroladores de 8 bits hasta supercomputadores — siguen el modelo de Von Neumann/);
});

test('HALLAZGO ABIERTO [contenido/bajo]: el FAQPage da a la RAM 10-100 ns y a las cachés «megabytes», contra la tabla de la página', async ({ page }) => {
  test.fail(); // HALLAZGO ABIERTO (inspector 16/11/2026) [contenido/bajo]
  // ENTRADA  faqJsonLd, «¿Cómo funciona la jerarquía de memoria en un computador?»
  // ESPERADO lo que publica la tabla: L3 ~10 ns, RAM ~100 ns; L1 32–64 KB y L2 256–512 KB (kilobytes)
  // OBTENIDO «caché L1/L2/L3 (nanosegundos, megabytes), RAM (10-100 ns, gigabytes)»: la RAM tan
  //          rápida como la L3 de la tabla, y las cachés en megabytes
  await pestana(page, /Jerarquía Memoria/).click();
  const { filas } = await leerMemoria(page);
  expect(filas.find((f) => f[1] === 'Caché L3')?.[2]).toBe('~10 ns');
  expect(filas.find((f) => f[1] === 'RAM (DRAM)')?.[2]).toBe('~100 ns');
  expect(filas.find((f) => f[1] === 'Caché L1')?.[3]).toBe('32–64 KB');
  const respuesta = await page.evaluate(() => {
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"]'))) {
      const j = JSON.parse(s.textContent ?? '{}') as { '@type'?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
      if (j['@type'] !== 'FAQPage') continue;
      return j.mainEntity?.find((q) => /jerarquía de memoria/.test(q.name))?.acceptedAnswer.text ?? '';
    }
    return '';
  });
  expect(respuesta).not.toBe('');
  expect({ ramDesde10ns: respuesta.includes('RAM (10-100 ns'), cachesEnMegabytes: respuesta.includes('caché L1/L2/L3 (nanosegundos, megabytes)') })
    .toEqual({ ramDesde10ns: false, cachesEnMegabytes: false });
});

test('HALLAZGO ABIERTO [contenido/bajo]: metadata y JSON-LD prometen un ciclo FDE «animado» y es un paso a paso manual', async ({ page }) => {
  test.fail(); // HALLAZGO ABIERTO (inspector 16/11/2026) [contenido/bajo]
  // ENTRADA  pestaña «Ciclo FDE», 2,5 s sin tocar nada
  // ESPERADO si la app no anima ni reproduce sola, la promesa no dice «animado»
  // OBTENIDO sigue en «Paso 1 / 12», sin botón de reproducir; featureList «Ciclo fetch-decode-execute
  //          animado paso a paso», description de la página y og:description: «animado»
  await pestana(page, /Ciclo FDE/).click();
  await expect(contador(page)).toHaveText('Paso 1 / 12');
  await page.waitForTimeout(2500); // comprobación negativa: que NO avanza solo
  await expect(contador(page)).toHaveText('Paso 1 / 12');
  const reproduce = (await page.getByRole('button', { name: /reproduc|play|autom/i }).count()) > 0;
  const promesa = [
    ...(await page.locator('script[type="application/ld+json"]').allTextContents()),
    (await page.locator('meta[name="description"]').getAttribute('content')) ?? '',
    (await page.locator('meta[property="og:description"]').getAttribute('content')) ?? '',
  ].join('\n');
  expect(reproduce || !/animado/.test(promesa)).toBe(true);
});

test('HALLAZGO ABIERTO [accesibilidad/bajo]: el lector lee los emojis de las pestañas, del aviso «👆» y del «✅»', async ({ page }) => {
  test.fail(); // HALLAZGO ABIERTO (inspector 16/11/2026) [accesibilidad/bajo]
  // ENTRADA  árbol de accesibilidad de las pestañas, del panel vacío y del registro RAM[C] del paso 12
  // ESPERADO nombres «Von Neumann», «Dentro de la CPU», «Ciclo FDE», «Jerarquía Memoria»; el emoji
  //          decorativo junto a texto con aria-hidden (CLAUDE.md global §5)
  // OBTENIDO «🏗️ Von Neumann», «⚙️ Dentro de la CPU», «🔄 Ciclo FDE», «🗄️ Jerarquía Memoria» (la
  //          etiqueta es una cadena de un array de objetos y check:a11y-jsx no la ve); «text: 👆»;
  //          «8 ✅»
  const nombres = ['Von Neumann', 'Dentro de la CPU', 'Ciclo FDE', 'Jerarquía Memoria'];
  const nav = page.getByRole('navigation', { name: 'Secciones del visualizador' });
  const pestanasSinEmoji: string[] = [];
  for (const n of nombres) if ((await nav.getByRole('button', { name: n, exact: true }).count()) === 1) pestanasSinEmoji.push(n);
  const panelVacio = await page.getByText('Selecciona un bloque del diagrama para ver su descripción').locator('xpath=..').ariaSnapshot();
  await pestana(page, /Ciclo FDE/).click();
  await page.getByRole('button', { name: 'Paso 12: Execute' }).click();
  await expect(contador(page)).toHaveText('Paso 12 / 12');
  const registros = await page.getByRole('heading', { level: 4, name: 'Estado de los registros:' }).locator('xpath=following-sibling::div[1]').ariaSnapshot();
  expect({ pestanasSinEmoji, manoEnElPanel: panelVacio.includes('👆'), checkEnRegistros: registros.includes('✅') })
    .toEqual({ pestanasSinEmoji: nombres, manoEnElPanel: false, checkEnRegistros: false });
});

test('HALLAZGO ABIERTO [accesibilidad/bajo]: el cambio de paso del ciclo FDE no se anuncia y el foco cae al <body> en el paso 12', async ({ page }) => {
  test.fail(); // HALLAZGO ABIERTO (inspector 16/11/2026) [accesibilidad/bajo]
  // ENTRADA  foco en «Paso siguiente» y 11 pulsaciones de Enter
  // ESPERADO cada paso nuevo se anuncia (región aria-live o role="status" en el panel o en el
  //          contador) y el foco sigue en un control al deshabilitarse «Siguiente»
  // OBTENIDO ningún aria-live ni role="status" en la pestaña; tras el paso 12 el foco está en <body>
  //          (Chromium recuerda el punto de partida y el siguiente Tab llega a «Reiniciar»)
  await pestana(page, /Ciclo FDE/).click();
  await page.getByRole('button', { name: 'Paso siguiente' }).focus();
  for (let i = 0; i < 11; i++) await page.keyboard.press('Enter');
  await expect(contador(page)).toHaveText('Paso 12 / 12');
  // Chromium retira el foco del botón que se deshabilita en el siguiente fotograma, no en el render
  // de React: leerlo en el mismo instante daba el botón todavía enfocado
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
  const r = await page.evaluate(() => {
    const titulo = Array.from(document.querySelectorAll('h3')).find((h) => /^(Fetch|Decode|Execute) —/.test(h.textContent ?? ''));
    const cuenta = Array.from(document.querySelectorAll('span')).find((s) => /^Paso \d+ \/ \d+$/.test((s.textContent ?? '').trim()));
    return {
      focoEnBody: document.activeElement === document.body,
      anunciado: Boolean(titulo?.closest('[aria-live], [role="status"]') || cuenta?.closest('[aria-live], [role="status"]')),
    };
  });
  expect(r).toEqual({ focoEnBody: false, anunciado: true });
});
