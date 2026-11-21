import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';
import { activarTemaOscuro, prepararParaMedir } from '../_contraste';

/**
 * visualizador-estructuras-cristalinas — primera inspección · 09/11/2026
 *
 * La app no calcula a partir de una entrada: dibuja celdas en CSS 3D y enseña cifras fijas. Lo
 * comprobable es si lo DIBUJADO cumple lo que la propia app dice de cada estructura, y si las
 * cifras de las tarjetas salen de la geometría. Los esperados están resueltos a mano:
 *
 *   · BCC: 8 esquinas × 1/8 + 1 centro = 2 átomos; NC 8; FE = π√3/8 = 0,6802 → 68 %
 *   · FCC: 8 × 1/8 + 6 caras × 1/2 = 4 átomos; NC 12; FE = π/(3√2) = 0,7405 → 74 %
 *   · HCP (prisma hexagonal): 12 vértices × 1/6 + 2 centros de base × 1/2 + 3 interiores = 6;
 *     NC 12; FE 0,7405 → 74 %
 *   · Tetraedro regular (SiO₄): los seis ángulos O–Si–O valen arccos(−1/3) = 109,47°
 *   · Diamante con arista a = 90 px: cada átomo interior a a√3/4 = 38,97 px de sus 4 vecinos
 *   · Grafito (sp²): cada carbono con 3 vecinos a la distancia de enlace dentro de su capa
 *
 * Las coordenadas se leen del `transform` de cada elemento con DOMMatrix, en el marco de la
 * estructura (antes del giro de la escena). No se compara el origen de transformación de las
 * aristas (0 50 %, 1 px de alto): las dos puntas comparten ese desplazamiento.
 *
 * Los `test.fail()` son hallazgos ABIERTOS de esta inspección (09/11/2026): pasarán a verde
 * cuando se reparen, y entonces se quita la marca. Reparados el 09/11/2026: 4357 (aristas),
 * 4358 (trigonal), 4359 (caras hexagonales), 4360 (grafito), 4361 (cuarzo SiO₄), 4363, 4364,
 * 4365, 4366, 4367 (contraste), 4368 (%) y 4362 (el cuarzo, solo en trigonal).
 *
 * Inspección en MODO FIRMA · 20/11/2026: los bloques «Firma» del final. Sus `test.fail()` son
 * hallazgos ABIERTOS de ese día.
 */

const RUTA = '/visualizador-estructuras-cristalinas/';
const ESCENA = '[role="img"][aria-label^="Estructura cristalina"]';

type V3 = [number, number, number];
interface Escena {
  atomos: V3[];
  colores: string[];
  aristas: { a: V3; b: V3 }[];
  caras: V3[][];
}

const resta = (p: V3, q: V3): V3 => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const prod = (p: V3, q: V3): number => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const modulo = (p: V3): number => Math.sqrt(prod(p, p));
const dist = (p: V3, q: V3): number => modulo(resta(p, q));
const anguloGrados = (p: V3, q: V3): number =>
  (Math.acos(Math.max(-1, Math.min(1, prod(p, q) / (modulo(p) * modulo(q))))) * 180) / Math.PI;
const masCercano = (p: V3, nube: V3[]): number => Math.min(...nube.map((q) => dist(p, q)));

/** Átomos, aristas y caras de la escena visible, con sus coordenadas 3D. */
async function leerEscena(page: Page): Promise<Escena> {
  return page.locator(ESCENA).evaluate((escena) => {
    const estructura = escena.firstElementChild as HTMLElement;
    const atomos: [number, number, number][] = [];
    const colores: string[] = [];
    const aristas: { a: [number, number, number]; b: [number, number, number] }[] = [];
    const caras: [number, number, number][][] = [];
    for (const nodo of Array.from(estructura.children)) {
      const el = nodo as HTMLElement;
      const t = el.style.transform;
      const m = new DOMMatrix(t);
      const punto = (x: number, y: number): [number, number, number] => {
        const p = m.transformPoint(new DOMPoint(x, y, 0));
        return [p.x, p.y, p.z];
      };
      if (/rotateZ/.test(t)) {
        const w = parseFloat(el.style.width);
        const h = parseFloat(el.style.height);
        caras.push([punto(-w / 2, -h / 2), punto(w / 2, -h / 2), punto(w / 2, h / 2), punto(-w / 2, h / 2)]);
      } else if (/rotate/.test(t)) {
        aristas.push({ a: punto(0, 0), b: punto(parseFloat(el.style.width), 0) });
      } else {
        atomos.push(punto(0, 0));
        colores.push(el.style.backgroundColor);
      }
    }
    return { atomos, colores, aristas, caras };
  });
}

/** Giro actual de la escena: «rotateX(-20deg) rotateY(30deg)» → { x: -20, y: 30 }. */
async function leerGiro(page: Page): Promise<{ x: number; y: number }> {
  const t = await page.locator(ESCENA).evaluate((e) => (e.firstElementChild as HTMLElement).style.transform);
  const x = Number(/rotateX\((-?[\d.]+)deg\)/.exec(t)?.[1]);
  const y = Number(/rotateY\((-?[\d.]+)deg\)/.exec(t)?.[1]);
  return { x, y };
}

/**
 * Aristas de un paralelepípedo de 8 átomos, sin depender del orden: de las 28 diferencias entre
 * átomos, cada vector de arista aparece 4 veces (aristas paralelas), cada diagonal de cara 2 y
 * cada diagonal del cuerpo 1. Devuelve longitudes y los tres ángulos en su forma aguda (el ángulo
 * en una esquina vale θ o 180° − θ según cuál se mire; la relación entre los tres no cambia).
 */
function celda(atomos: V3[]): { longitudes: number[]; angulos: number[] } {
  const grupos: { v: V3; n: number }[] = [];
  for (let i = 0; i < atomos.length; i++) {
    for (let j = i + 1; j < atomos.length; j++) {
      const d = resta(atomos[j], atomos[i]);
      const g = grupos.find((x) => dist(x.v, d) < 0.5 || dist(x.v, [-d[0], -d[1], -d[2]]) < 0.5);
      if (g) g.n++;
      else grupos.push({ v: d, n: 1 });
    }
  }
  const aristas = grupos.filter((g) => g.n === 4).map((g) => g.v);
  expect(aristas, 'un paralelepípedo tiene tres familias de cuatro aristas paralelas').toHaveLength(3);
  const agudo = (p: V3, q: V3) => {
    const a = anguloGrados(p, q);
    return Math.min(a, 180 - a);
  };
  return {
    longitudes: aristas.map(modulo),
    angulos: [agudo(aristas[1], aristas[2]), agudo(aristas[0], aristas[2]), agudo(aristas[0], aristas[1])],
  };
}

async function abrir(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarPaginaAsentada(page);
}

async function irASeccion(page: Page, nombre: RegExp): Promise<void> {
  const boton = page.getByRole('navigation', { name: 'Secciones del visualizador' }).getByRole('button', { name: nombre });
  await boton.click();
  await expect(boton).toHaveAttribute('aria-current', 'true');
}

async function elegir(page: Page, nombre: string | RegExp): Promise<void> {
  const boton =
    typeof nombre === 'string' ? page.getByRole('button', { name: nombre, exact: true }) : page.getByRole('button', { name: nombre });
  await boton.first().click();
  await expect(boton.first()).toHaveAttribute('aria-pressed', 'true');
}

const detalle = (page: Page) => page.locator('[role="status"]').filter({ has: page.locator('h3') }).first();

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CASO 1 (normal) · BCC, FCC y HCP: las cifras de las tarjetas y lo que hay dibujado
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('CASO 1 · estructuras metálicas', () => {
  const ESPERADO = [
    // siglas, átomos/celda, coordinación, empaquetamiento redondeado, átomos dibujados
    { s: 'BCC', n: 2, nc: 8, fe: 68, dibujados: 9 },
    { s: 'FCC', n: 4, nc: 12, fe: 74, dibujados: 14 },
    { s: 'HCP', n: 6, nc: 12, fe: 74, dibujados: 17 },
  ];

  test('átomos por celda, coordinación y empaquetamiento, y que el dibujo suma lo mismo', async ({ page }) => {
    await abrir(page);
    await irASeccion(page, /Metálicas/);
    for (const e of ESPERADO) {
      await elegir(page, new RegExp(`^${e.s}`));
      const texto = await detalle(page).innerText();
      const m = /(\d+)\s*Átomos \/ celda\s*(\d+)\s*Nº coordinación\s*(\d+)\s?%\s*Empaquetamiento/.exec(texto);
      expect(m, `tarjetas de ${e.s}`).not.toBeNull();
      expect(Number(m?.[1]), `${e.s}: átomos por celda`).toBe(e.n);
      expect(Number(m?.[2]), `${e.s}: número de coordinación`).toBe(e.nc);
      expect(Number(m?.[3]), `${e.s}: empaquetamiento`).toBe(e.fe);

      // El dibujo: cada átomo pesa según cuántas celdas lo comparten
      const { atomos } = await leerEscena(page);
      expect(atomos, `${e.s}: átomos dibujados`).toHaveLength(e.dibujados);
      let suma = 0;
      if (e.s === 'HCP') {
        const H = Math.max(...atomos.map((p) => Math.abs(p[1])));
        for (const p of atomos) {
          const enBase = Math.abs(Math.abs(p[1]) - H) < 0.5;
          const enEje = Math.hypot(p[0], p[2]) < 0.5;
          suma += !enBase ? 1 : enEje ? 1 / 2 : 1 / 6;
        }
      } else {
        const h = Math.max(...atomos.flatMap((p) => p.map(Math.abs)));
        for (const p of atomos) suma += 1 / 2 ** p.filter((c) => Math.abs(Math.abs(c) - h) < 0.5).length;
      }
      expect(suma, `${e.s}: suma de fracciones de los átomos dibujados`).toBeCloseTo(e.n, 6);
    }
  });

  test('la celda se gira arrastrando con el ratón', async ({ page }) => {
    await abrir(page);
    await page.locator(ESCENA).scrollIntoViewIfNeeded();
    const caja = await page.locator(ESCENA).boundingBox();
    expect(caja).not.toBeNull();
    const antes = await leerGiro(page);
    const cx = (caja?.x ?? 0) + (caja?.width ?? 0) / 2;
    const cy = (caja?.y ?? 0) + (caja?.height ?? 0) / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 40, cy, { steps: 8 });
    await page.mouse.up();
    const despues = await leerGiro(page);
    expect(despues.y, 'arrastrar a la derecha gira sobre el eje vertical').toBeGreaterThan(antes.y);
  });

  test('HALLAZGO (09/11/2026, REPARADO) · el porcentaje va pegado: «68%» en vez de «68 %»', async ({ page }) => {
    // Norma de la casa (CLAUDE.md global §2, RAE 2010): número, espacio duro (U+00A0) y «%».
    await abrir(page);
    await irASeccion(page, /Metálicas/);
    await elegir(page, /^BCC/);
    await expect(detalle(page)).toContainText('68 %');
    await expect(page.getByText(/es el máximo empaquetamiento posible/)).toContainText('74 %');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CASO 2 (límite) · los 7 sistemas, del más simétrico al menos: ¿cumple la celda lo que dice?
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('CASO 2 · los 7 sistemas', () => {
  const igual = (a: number, b: number, tol: number) => Math.abs(a - b) < tol;

  test('cúbico, tetragonal, ortorrómbico, monoclínico y triclínico: la celda cumple sus parámetros', async ({ page }) => {
    await abrir(page);
    // [nombre, parámetros que muestra, condición sobre la celda dibujada]
    const casos: [string, string, (l: number[], a: number[]) => boolean][] = [
      ['Cúbico', 'a = b = c', (l, a) => igual(l[0], l[1], 0.5) && igual(l[1], l[2], 0.5) && a.every((x) => igual(x, 90, 0.5))],
      ['Tetragonal', 'a = b ≠ c', (l, a) => [...l].sort((x, y) => x - y).filter((x, i, s) => i > 0 && igual(x, s[i - 1], 0.5)).length === 1 && a.every((x) => igual(x, 90, 0.5))],
      ['Ortorrómbico', 'a ≠ b ≠ c', (l, a) => !igual(l[0], l[1], 1) && !igual(l[1], l[2], 1) && !igual(l[0], l[2], 1) && a.every((x) => igual(x, 90, 0.5))],
      ['Monoclínico', 'a ≠ b ≠ c', (_l, a) => a.filter((x) => igual(x, 90, 0.5)).length === 2 && a.some((x) => x < 88)],
      ['Triclínico', 'a ≠ b ≠ c', (_l, a) => a.every((x) => x < 88) && !igual(a[0], a[1], 1) && !igual(a[1], a[2], 1) && !igual(a[0], a[2], 1)],
    ];
    for (const [nombre, parametros, cumple] of casos) {
      await elegir(page, nombre);
      await expect(detalle(page)).toContainText(`Parámetros: ${parametros}`);
      const { atomos } = await leerEscena(page);
      const { longitudes, angulos } = celda(atomos);
      expect(cumple(longitudes, angulos), `${nombre}: longitudes ${longitudes.map((x) => x.toFixed(2))} · ángulos ${angulos.map((x) => x.toFixed(2))}`).toBe(true);
    }
  });

  test('HALLAZGO (09/11/2026, REPARADO) · la celda «trigonal» dibujada es triclínica', async ({ page }) => {
    // La app dice «a = b = c» y «α = β = γ ≠ 90°» (romboedro). Resuelto a mano con las esquinas
    // del código: aristas (90, 0, 0), (−36, 90, 0) y (18, 0, 90) → 90 · 96,93 · 91,78 px y
    // ángulos 94,18° · 78,69° · 111,8°: ni iguales las aristas ni iguales los ángulos.
    await abrir(page);
    await elegir(page, 'Trigonal');
    await expect(detalle(page)).toContainText('Parámetros: a = b = c');
    const { longitudes, angulos } = celda((await leerEscena(page)).atomos);
    expect(Math.max(...longitudes) - Math.min(...longitudes), 'a = b = c').toBeLessThan(0.5);
    expect(Math.max(...angulos) - Math.min(...angulos), 'α = β = γ').toBeLessThan(0.5);
    expect(angulos[0], 'α ≠ 90°').toBeLessThan(88);
  });

  test('HALLAZGO (09/11/2026, REPARADO) · las aristas no unen átomos: ninguna sale vertical', async ({ page }) => {
    // Un cubo tiene 12 aristas que unen sus 8 esquinas, 4 de ellas verticales. calcularAristaCSS
    // orienta un elemento que nace sobre el eje X con rotateY(atan2(dx, dz)) rotateX(...): el giro
    // en X no mueve un vector del eje X y el de Y está calculado para el eje Z. Hoy en el cubo
    // 6 de 12 acaban en un átomo y 0 son verticales; en monoclínico, triclínico, trigonal,
    // hexagonal, HCP y grafito no acaba en un átomo NINGUNA.
    await abrir(page);
    for (const nombre of ['Cúbico', 'Monoclínico']) {
      await elegir(page, nombre);
      const { atomos, aristas } = await leerEscena(page);
      expect(aristas, `${nombre}: 12 aristas`).toHaveLength(12);
      const sueltas = aristas.filter((ar) => masCercano(ar.a, atomos) > 1 || masCercano(ar.b, atomos) > 1);
      expect(sueltas.length, `${nombre}: aristas con una punta fuera de los átomos`).toBe(0);
      const verticales = aristas.filter((ar) => Math.abs(ar.b[1] - ar.a[1]) > 1).length;
      expect(verticales, `${nombre}: aristas verticales`).toBe(4);
    }
  });

  test('REPARADO 4357/4359 · en todas las escenas cada arista une dos átomos y cada esquina de cara cae en un vértice', async ({ page }) => {
    // El hallazgo 4357 decía que en monoclínico, triclínico, trigonal, hexagonal, HCP y grafito
    // NINGUNA arista acababa en un átomo. Fuera, a propósito: el prisma del cuarzo, que es el
    // contorno del cristal y no une átomos (los tetraedros van dentro).
    await abrir(page);
    const escenas: [RegExp | null, string | RegExp][] = [
      [null, 'Cúbico'], [null, 'Tetragonal'], [null, 'Ortorrómbico'], [null, 'Hexagonal'],
      [null, 'Trigonal'], [null, 'Monoclínico'], [null, 'Triclínico'],
      [/Metálicas/, /^BCC/], [/Metálicas/, /^FCC/], [/Metálicas/, /^HCP/],
      [/Cristales Famosos/, /Sal \(NaCl\)/], [/Cristales Famosos/, /Diamante/], [/Cristales Famosos/, /Grafito/],
    ];
    for (const [seccion, nombre] of escenas) {
      if (seccion) await irASeccion(page, seccion);
      await elegir(page, nombre);
      const { atomos, aristas, caras } = await leerEscena(page);
      expect(aristas.length, `${nombre}: tiene aristas`).toBeGreaterThan(0);
      const sueltas = aristas.filter((ar) => masCercano(ar.a, atomos) > 1 || masCercano(ar.b, atomos) > 1);
      expect(sueltas.length, `${nombre}: aristas con una punta fuera de los átomos`).toBe(0);
      if (/Hexagonal|HCP/.test(String(nombre))) {
        for (const esquina of caras.flat()) expect(masCercano(esquina, atomos), `${nombre}: esquina de cara sobre un vértice`).toBeLessThan(1);
      }
    }
  });

  test('HALLAZGO (09/11/2026, REPARADO) · las caras del prisma hexagonal no coinciden con él', async ({ page }) => {
    // Prisma de la app: hexágono de 45 px de radio y 72 px de alto (átomos en y = ±36). Las caras
    // de hexCaras miden 144 px de alto (y = ±72) y cada una está girada 60° respecto a su arista:
    // sus esquinas quedan a 22,5 px de los vértices en planta. Lo mismo en HCP y en el cuarzo.
    await abrir(page);
    await elegir(page, 'Hexagonal');
    const { atomos, caras } = await leerEscena(page);
    expect(caras.length).toBe(6);
    const ys = atomos.map((p) => p[1]);
    const ysCaras = caras.flat().map((p) => p[1]);
    expect(Math.max(...ysCaras), 'altura de las caras = altura del prisma').toBeCloseTo(Math.max(...ys), 0);
    for (const esquina of caras.flat()) expect(masCercano(esquina, atomos), 'esquina de cara sobre un vértice').toBeLessThan(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CASO 3 (lo que debe rechazarse) · estructuras que no pueden ser, y dos de control que sí
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('CASO 3 · cristales famosos', () => {
  test('control: NaCl con 6 vecinos de signo contrario y diamante con 4 vecinos a a√3/4', async ({ page }) => {
    await abrir(page);
    await irASeccion(page, /Cristales Famosos/);

    await elegir(page, /Sal \(NaCl\)/);
    const sal = await leerEscena(page);
    const iCentro = sal.atomos.reduce((m, p, i) => (modulo(p) < modulo(sal.atomos[m]) ? i : m), 0);
    const vecinos = sal.atomos
      .map((p, i) => ({ i, d: dist(p, sal.atomos[iCentro]) }))
      .filter((x) => x.i !== iCentro)
      .sort((x, y) => x.d - y.d)
      .slice(0, 7);
    expect(vecinos.slice(0, 6).every((x) => Math.abs(x.d - vecinos[0].d) < 0.5), 'octaedro: 6 vecinos a la misma distancia').toBe(true);
    expect(vecinos[6].d - vecinos[0].d, 'el 7.º ya está más lejos').toBeGreaterThan(1);
    expect(vecinos.slice(0, 6).every((x) => sal.colores[x.i] !== sal.colores[iCentro]), 'los 6 son del ion contrario').toBe(true);

    await elegir(page, /Diamante/);
    const diamante = await leerEscena(page);
    const h = Math.max(...diamante.atomos.flatMap((p) => p.map(Math.abs)));
    const a = 2 * h; // arista de la celda dibujada: 90 px
    const interiores = diamante.atomos.filter((p) => p.every((c) => Math.abs(c) < h - 0.5));
    expect(interiores, '4 átomos en huecos tetraédricos').toHaveLength(4);
    for (const p of interiores) {
      // fracciones 1/4 o 3/4 en los tres ejes
      for (const c of p) expect([0.25, 0.75].some((f) => Math.abs(c / a + 0.5 - f) < 0.01)).toBe(true);
      const cerca = diamante.atomos.filter((q) => Math.abs(dist(p, q) - (a * Math.sqrt(3)) / 4) < 0.5);
      expect(cerca.length, 'cada interior con 4 vecinos a a√3/4 = 38,97 px').toBe(4);
    }
  });

  test('HALLAZGO (09/11/2026, REPARADO) · grafito: un carbono en el centro de cada anillo, con 6 vecinos', async ({ page }) => {
    // sp²: cada carbono se une a 3 dentro de su capa (lo dice la FAQ de la app). Hoy cada capa
    // pinta el anillo de 6 y un átomo en su centro, a 31,5 px de los seis: la misma distancia que
    // el lado del anillo, es decir, un carbono con 6 enlaces. En el panal del grafeno el centro
    // del hexágono está vacío. Además la segunda capa está girada 30°, no desplazada (ABAB).
    await abrir(page);
    await irASeccion(page, /Cristales Famosos/);
    await elegir(page, /Grafito/);
    const { atomos } = await leerEscena(page);
    const capas = new Map<number, V3[]>();
    for (const p of atomos) {
      const y = Math.round(p[1]);
      capas.set(y, [...(capas.get(y) ?? []), p]);
    }
    for (const [y, capa] of capas) {
      const enlace = Math.min(...capa.flatMap((p, i) => capa.filter((_, j) => j !== i).map((q) => dist(p, q))));
      const maxVecinos = Math.max(...capa.map((p) => capa.filter((q) => q !== p && dist(p, q) < enlace * 1.05).length));
      expect(maxVecinos, `capa y=${y}: vecinos a distancia de enlace`).toBeLessThanOrEqual(3);
    }
  });

  test('HALLAZGO (09/11/2026, REPARADO) · cuarzo: los «tetraedros SiO₄» no son tetraedros', async ({ page }) => {
    // Tetraedro regular: los seis O–Si–O valen 109,47°. Hoy van de 33,33° a 138,7° (tetraAngles
    // [0, 109,5, 219, 328,5] usa el ángulo de enlace como acimut en un plano). Tolerancia de 10°:
    // un modelo simplificado puede deformar un poco; el defecto es de 76°.
    await abrir(page);
    await irASeccion(page, /Cristales Famosos/);
    await elegir(page, /Cuarzo/);
    const { atomos, colores } = await leerEscena(page);
    const porColor = new Map<string, V3[]>();
    atomos.forEach((p, i) => porColor.set(colores[i], [...(porColor.get(colores[i]) ?? []), p]));
    const [silicios, oxigenos] = [...porColor.values()].sort((x, y) => x.length - y.length);
    expect(silicios.length).toBeGreaterThan(0);
    for (const si of silicios) {
      const cuatro = [...oxigenos].sort((p, q) => dist(p, si) - dist(q, si)).slice(0, 4);
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          const angulo = anguloGrados(resta(cuatro[i], si), resta(cuatro[j], si));
          expect(Math.abs(angulo - 109.47), `O–Si–O = ${angulo.toFixed(2)}°`).toBeLessThan(10);
        }
      }
    }
  });

  test('HALLAZGO (09/11/2026, REPARADO) · el cuarzo figura en dos de los 7 sistemas', async ({ page }) => {
    // La app dice «Todos los cristales pertenecen a uno de 7 sistemas» y ponía «Cuarzo» de ejemplo
    // en Hexagonal y en Trigonal; la FAQ (JSON-LD) decía «el cuarzo, al hexagonal».
    // REPARADO (hallazgo 4362): Handbook of Mineralogy, ficha «Quartz» (Mineral Data Publishing,
    // 2001): «Crystal Data: Hexagonal. Point Group: 32» · «Space Group: P3₁21 or P3₂21».
    // «Hexagonal» es allí la FAMILIA; el grupo puntual 32 es del SISTEMA trigonal en los 7
    // sistemas de la IUCr, que son los de la app. El cuarzo β (> 573 °C) sí es hexagonal.
    await abrir(page);
    const conCuarzo: string[] = [];
    for (const nombre of ['Cúbico', 'Tetragonal', 'Ortorrómbico', 'Hexagonal', 'Trigonal', 'Monoclínico', 'Triclínico']) {
      await elegir(page, nombre);
      const ejemplo = (await detalle(page).innerText()).split('\n').find((l) => l.startsWith('Ejemplo:')) ?? '';
      if (/cuarzo/i.test(ejemplo)) conCuarzo.push(nombre);
    }
    expect(conCuarzo, 'sistemas que dan el cuarzo de ejemplo').toEqual(['Trigonal']);
    const faq = await page.locator('script[type="application/ld+json"]').allTextContents();
    const asignado = /el cuarzo, al (\p{L}+)/iu.exec(faq.join(' '))?.[1];
    expect(asignado?.toLowerCase(), 'la FAQ dice el mismo sistema que la página').toBe('trigonal');
  });

  test('HALLAZGO (09/11/2026, REPARADO) · el grafito conduce «entre capas», y la propia app dice que en el plano', async ({ page }) => {
    // «Datos y Propiedades → Conductividad»: «El grafito conduce en el plano (electrones π
    // deslocalizados) pero no perpendicular a las capas». El «Dato clave» del grafito dice lo
    // contrario: «Conductor eléctrico (electrones libres entre capas)».
    await abrir(page);
    await irASeccion(page, /Cristales Famosos/);
    await elegir(page, /Grafito/);
    await expect(detalle(page)).not.toContainText('entre capas');
  });

  test('HALLAZGO (09/11/2026, REPARADO) · «mayor empaquetamiento = mayor densidad, por eso el oro…»', async ({ page }) => {
    // 0,7405 / 0,6802 = 1,09: el empaquetamiento explica como mucho un 9 %, y oro/hierro es 2,45.
    // Con las listas de la propia app y las densidades del NIST (X-Ray Mass Attenuation
    // Coefficients, tabla 1): wolframio BCC 19,30 g/cm³ ≈ oro FCC 19,32; aluminio FCC 2,699 <
    // hierro BCC 7,874. La densidad la marcan sobre todo la masa atómica y el radio.
    await abrir(page);
    await irASeccion(page, /Datos y Propiedades/);
    const tarjeta = page.getByRole('heading', { name: 'Empaquetamiento y densidad' }).locator('xpath=../..');
    await expect(tarjeta).not.toContainText(/Por eso el oro/);
  });

  test('HALLAZGO (09/11/2026, REPARADO) · «solo existen 7 formas de paralelepípedo que llenan el espacio»', async ({ page }) => {
    // Todo paralelepípedo de aristas a, b, c no coplanarias llena el espacio por traslación: cada
    // punto r = x·a + y·b + z·c cae en una sola copia (la de ⌊x⌋, ⌊y⌋, ⌊z⌋). Hay infinitas
    // formas (el propio triclínico de la app es una familia continua). Los 7 sistemas salen de
    // la SIMETRÍA de la red, no de que solo 7 formas teselen.
    await abrir(page);
    await expect(page.locator('[data-guia-educativa]')).not.toContainText('solo existen 7 formas fundamentales de paralelepípedo');
  });

  test('HALLAZGO (09/11/2026, REPARADO) · el JSON-LD promete «empaquetamiento … con radio atómico» y no lo hay', async ({ page }) => {
    await abrir(page);
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
    const prometeRadio = /radio atómico/i.test(ld);
    await irASeccion(page, /Metálicas/);
    const muestraRadio = (await page.locator('main, body').first().innerText()).match(/radio atómico|\br\s*=|a\s*=\s*4\s*r|a\s*=\s*2\s*√2\s*r/i) !== null;
    expect(!prometeRadio || muestraRadio, 'característica prometida = característica visible').toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Accesibilidad · los títulos coloreados con el color de cada estructura, en tema claro
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('Accesibilidad', () => {
  test.use({ colorScheme: 'light' });

  test('HALLAZGO (09/11/2026, REPARADO) · contraste en claro de los títulos coloreados', async ({ page }) => {
    // Sobre la tarjeta blanca: Tetragonal 2,80 · Ortorrómbico 2,03 · Trigonal 2,87 · Monoclínico
    // 2,19 (19,2 px negrita: texto grande, mínimo 3:1); BCC 4,11 · FCC 2,19 · HCP 2,80 (17,6 px
    // negrita: no llega a grande, mínimo 4,5:1). En oscuro cumplen todos.
    await abrir(page);
    const fallos: string[] = [];
    const medir = async (rotulo: string) => {
      const h3 = detalle(page).locator('h3');
      const r = await contrasteSobreFondoReal(h3);
      const { px, peso } = await h3.evaluate((el) => ({ px: parseFloat(getComputedStyle(el).fontSize), peso: Number(getComputedStyle(el).fontWeight) }));
      const minimo = px >= 24 || (px >= 18.66 && peso >= 700) ? 3 : 4.5;
      if (r < minimo) fallos.push(`${rotulo} ${r.toFixed(2)}:1 < ${minimo}:1`);
    };
    for (const nombre of ['Cúbico', 'Tetragonal', 'Ortorrómbico', 'Hexagonal', 'Trigonal', 'Monoclínico', 'Triclínico']) {
      await elegir(page, nombre);
      await medir(nombre);
    }
    await irASeccion(page, /Metálicas/);
    for (const s of ['BCC', 'FCC', 'HCP']) {
      await elegir(page, new RegExp(`^${s}`));
      await medir(s);
    }
    expect(fallos).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Móvil (390 px): se puede elegir, girar con el dedo y con los botones, sin desbordar
// ─────────────────────────────────────────────────────────────────────────────────────────────
test.describe('Móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('tocar un sistema, arrastrar con el dedo y los botones de giro', async ({ page, context }) => {
    await abrir(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), 'sin desbordamiento horizontal').toBeLessThanOrEqual(390);

    const mono = page.getByRole('button', { name: 'Monoclínico', exact: true });
    await mono.tap();
    await expect(mono).toHaveAttribute('aria-pressed', 'true');
    await expect(detalle(page)).toContainText('β ≠ 90°');

    const inicial = await leerGiro(page);
    await page.getByRole('button', { name: 'Rotar derecha' }).tap();
    await expect.poll(async () => (await leerGiro(page)).y, { message: '«Rotar derecha» suma 30°' }).toBe(inicial.y + 30);
    const antes = await leerGiro(page);

    // Arrastre táctil de 60 px a la derecha (eventos táctiles reales por CDP), al ritmo de un dedo:
    // un movimiento por fotograma. La caja se mide JUSTO antes: el tap de arriba desplaza la
    // página para traer el botón, y una caja medida antes deja el dedo fuera de la escena.
    const fotograma = () => page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => r())));
    const escena = page.locator(ESCENA);
    await escena.scrollIntoViewIfNeeded();
    const caja = await escena.boundingBox();
    expect(caja?.width ?? 0, 'la escena cabe en pantalla').toBeLessThanOrEqual(390);
    const cdp = await context.newCDPSession(page);
    const cx = (caja?.x ?? 0) + (caja?.width ?? 0) / 2;
    const cy = (caja?.y ?? 0) + (caja?.height ?? 0) / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
    await fotograma();
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + i * 6, y: cy }] });
      await fotograma();
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await leerGiro(page)).y, { message: 'el dedo gira la celda' }).toBeGreaterThan(antes.y);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════════════════
// INSPECCIÓN EN MODO FIRMA · 20/11/2026
// ═════════════════════════════════════════════════════════════════════════════════════════════
/*
 * La cola la sacó por la firma «64 % de visitas cortas (catálogo 55,8 %) y 5 % de recargas
 * (catálogo 2,3 %) en 100 visitas». Se buscó lo que impide USAR la app en escritorio (1280 px) y
 * en móvil. La escena es CSS 3D (divs con transform y perspective: 800px), no WebGL: no hay
 * contexto que pueda faltar en headless. Esperados resueltos a mano ANTES de ejecutar:
 *   · rotar() de page.tsx suma o resta 30° por pulsación: desde el giro inicial (y = 30°), cuatro
 *     pulsaciones de «Rotar derecha» → 150°
 *   · arrastrar dx px gira dx·0,5° en Y; dy px gira −dy·0,5° en X (handlePointerMove)
 *   · un átomo representa una esfera: mide lo mismo mirado desde cualquier lado. Un disco plano
 *     girado y° mide tamaño·|cos y|, que en y = 90° es 0
 *   · átomos / aristas / caras de cada escena, contados en los generadores de page.tsx
 *   · HCP compacta: el átomo de la capa intermedia toca los tres de debajo a la distancia a,
 *     (a/√3)² + (c/2)² = a² → c/a = 2·√(2/3) = 1,633 y 12 vecinos a la misma distancia
 *   · contraste WCAG con la luminancia relativa; 3:1 para un gráfico necesario (WCAG 1.4.11)
 */

/** Átomos de la escena: tamaño declarado y lo que miden en pantalla (caja proyectada). */
async function medidasAtomos(page: Page): Promise<{ tamano: number; ancho: number; alto: number }[]> {
  return page.locator(ESCENA).evaluate((escena) =>
    Array.from((escena.firstElementChild as HTMLElement).children)
      .filter((n) => !/rotate/.test((n as HTMLElement).style.transform))
      .map((n) => {
        const r = n.getBoundingClientRect();
        return { tamano: parseFloat((n as HTMLElement).style.width), ancho: r.width, alto: r.height };
      }),
  );
}

/**
 * Espera a que el giro termine su transición (.estructura3d lleva `transition: transform 0.05s`):
 * el transform calculado ya es el que pide el estado. Una persona no pulsa en mitad de los 50 ms;
 * un test que pulsa nada más cambiar el estado cae en el botón ANTES de que la celda girada llegue
 * a taparlo, y daba verde en el defecto de abajo (medido el 20/11/2026: 150° con la espera
 * quitada, 120° con ella).
 */
async function esperarGiroAsentado(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.locator(ESCENA).evaluate((e) => {
          const el = e.firstElementChild as HTMLElement;
          const a = new DOMMatrix(getComputedStyle(el).transform);
          const b = new DOMMatrix(el.style.transform);
          const difs = [a.m11 - b.m11, a.m12 - b.m12, a.m13 - b.m13, a.m21 - b.m21, a.m22 - b.m22, a.m23 - b.m23, a.m31 - b.m31, a.m32 - b.m32, a.m33 - b.m33];
          return Math.max(...difs.map(Math.abs));
        }),
      { message: 'el giro ha terminado su transición' },
    )
    .toBeLessThan(1e-3);
}

/** Pulsa como un usuario: con el giro ya quieto, en el centro del botón, sin esperar a que nada deje de taparlo. */
async function pulsarEnSuSitio(page: Page, nombre: string, tactil = false): Promise<void> {
  await esperarGiroAsentado(page);
  const caja = await page.getByRole('button', { name: nombre }).boundingBox();
  expect(caja, `botón «${nombre}» en pantalla`).not.toBeNull();
  const x = (caja?.x ?? 0) + (caja?.width ?? 0) / 2;
  const y = (caja?.y ?? 0) + (caja?.height ?? 0) / 2;
  if (tactil) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

/**
 * Contraste de cada color de átomo (su color declarado, sin transición de por medio) y de las
 * aristas (rgba compuesto) contra el fondo opaco que tiene la escena detrás.
 */
async function contrastesEscena(page: Page): Promise<{ fondoLum: number; atomos: number[]; arista: number }> {
  return page.locator(ESCENA).evaluate((escena) => {
    const rgba = (s: string): number[] => {
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
    const k = (a: number[], b: number[]) => {
      const x = lum(a);
      const y = lum(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    let fondo = [255, 255, 255];
    for (let n = escena.parentElement; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c[3] >= 1) {
        fondo = c;
        break;
      }
    }
    const atomos: number[] = [];
    let arista = Infinity;
    for (const nodo of Array.from((escena.firstElementChild as HTMLElement).children)) {
      const el = nodo as HTMLElement;
      const t = el.style.transform;
      if (/rotateZ/.test(t)) continue;
      if (/rotate/.test(t)) {
        const [r, g, b, a] = rgba(getComputedStyle(el).backgroundColor);
        arista = Math.min(arista, k([r * a + fondo[0] * (1 - a), g * a + fondo[1] * (1 - a), b * a + fondo[2] * (1 - a)], fondo));
        continue;
      }
      atomos.push(k(rgba(el.style.backgroundColor), fondo));
    }
    return { fondoLum: lum(fondo), atomos, arista };
  });
}

test.describe('Firma 20/11/2026 · escritorio 1280 px', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('control: las 14 escenas pintan sus átomos, aristas y caras dentro de su caja, sin errores en consola', async ({ page }) => {
    const errores: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text());
    });
    page.on('pageerror', (e) => errores.push(e.message));
    await abrir(page);
    // [sección, escena, átomos, aristas, caras] — contados en los generadores de page.tsx
    const escenas: [RegExp | null, string | RegExp, number, number, number][] = [
      [null, 'Cúbico', 8, 12, 6], [null, 'Tetragonal', 8, 12, 6], [null, 'Ortorrómbico', 8, 12, 6],
      [null, 'Hexagonal', 14, 18, 6], [null, 'Trigonal', 8, 12, 0], [null, 'Monoclínico', 8, 12, 0],
      [null, 'Triclínico', 8, 12, 0],
      [/Metálicas/, /^BCC/, 9, 12, 6], [/Metálicas/, /^FCC/, 14, 12, 6], [/Metálicas/, /^HCP/, 17, 18, 6],
      // NaCl: rejilla 3×3×3 = 27 iones y 3 direcciones × 9 filas × 2 tramos = 54 enlaces;
      // diamante 8 + 6 + 4 interiores; grafito 2 capas × 10 C y 2 × 11 enlaces; cuarzo 3 × (Si + 4 O)
      [/Cristales Famosos/, /Sal \(NaCl\)/, 27, 54, 6], [/Cristales Famosos/, /Diamante/, 18, 12, 6],
      [/Cristales Famosos/, /Grafito/, 20, 22, 0], [/Cristales Famosos/, /Cuarzo/, 15, 18, 6],
    ];
    for (const [seccion, nombre, nAt, nAr, nCa] of escenas) {
      if (seccion) await irASeccion(page, seccion);
      await elegir(page, nombre);
      const { atomos, aristas, caras } = await leerEscena(page);
      expect([atomos.length, aristas.length, caras.length], `${nombre}: átomos, aristas y caras`).toEqual([nAt, nAr, nCa]);
      const fuera = await page.locator(ESCENA).evaluate((escena) => {
        const e = escena.getBoundingClientRect();
        return Array.from((escena.firstElementChild as HTMLElement).children).filter((n) => {
          const r = n.getBoundingClientRect();
          return r.width < 1 || r.height < 1 || r.left < e.left - 2 || r.right > e.right + 2 || r.top < e.top - 2 || r.bottom > e.bottom + 2;
        }).length;
      });
      expect(fuera, `${nombre}: elementos sin tamaño o fuera de la escena en el giro inicial`).toBe(0);
    }
    expect(errores, 'errores en consola').toEqual([]);
  });

  test('REPARADO 5308 (firma 20/11/2026) · «Rotar derecha» deja de responder a la 4.ª pulsación: la celda girada tapa el botón', async ({ page }) => {
    // Desde y = 30° cada pulsación suma 30°: 60, 90, 120, 150. Obtenido: 60, 90, 120 y 120. A 120°
    // el plano de .estructura3d (100 % × 100 % de la escena, con preserve-3d y perspective 800px)
    // proyecta su esquina cercana por debajo de la escena, sobre la fila de botones, y se queda el
    // clic (elementFromPoint en el centro del botón da el div de la estructura). A 60° tapa
    // «Rotar izquierda». Igual en móvil (bloque «Firma · móvil»).
    await abrir(page);
    await page.getByRole('button', { name: 'Rotar derecha' }).scrollIntoViewIfNeeded();
    expect((await leerGiro(page)).y).toBe(30);
    for (let i = 1; i <= 4; i++) {
      await pulsarEnSuSitio(page, 'Rotar derecha');
      await expect.poll(async () => (await leerGiro(page)).y, { message: `pulsación ${i}`, timeout: 2000 }).toBe(30 + 30 * i);
    }
  });

  test('REPARADO 5309 (firma 20/11/2026) · girada 90°, la celda se queda sin átomos: son discos planos, no esferas', async ({ page }) => {
    // Dos pulsaciones de «Rotar derecha» (30° → 90°, las dos llegan). Una esfera mediría ~18 px de
    // ancho; un disco de canto mide 18·|cos 90°| = 0. Obtenido: 1,1-1,5 px los 8 átomos del cúbico
    // (8 % de su tamaño); a 60°, 120°, 240° y 300° miden el 52 %. Umbral 60 %: holgura sobre la
    // perspectiva (a 0° y 180° miden 95-103 %) y muy lejos del 8 % del defecto.
    await abrir(page);
    await page.getByRole('button', { name: 'Rotar derecha' }).scrollIntoViewIfNeeded();
    await pulsarEnSuSitio(page, 'Rotar derecha');
    await pulsarEnSuSitio(page, 'Rotar derecha');
    await expect.poll(async () => (await leerGiro(page)).y).toBe(90);
    await expect
      .poll(async () => Math.min(...(await medidasAtomos(page)).map((m) => m.ancho / m.tamano)), {
        message: 'ancho aparente del átomo más estrecho / su tamaño, a 90°',
        timeout: 2000,
      })
      .toBeGreaterThanOrEqual(0.6);
  });

  test.fail('ABIERTO (firma 20/11/2026) · la escena 3D no asoma en la primera pantalla', async ({ page }) => {
    // Lo que promete el <h1> («Estructuras Cristalinas 3D … arrastra para rotar») no está en lo que
    // se ve al entrar: a 1280×800 la escena empieza en y ≈ 1158 px (la mitad de la escena, en
    // 1308 px). Delante van el hero, el aviso legal, el banner de Stemum, las 4 secciones, la
    // cabecera, el texto de contexto, las 7 tarjetas y los parámetros. Esperado: al menos media
    // escena dentro de los 800 px iniciales.
    await abrir(page);
    const { mitad, alto } = await page.locator(ESCENA).evaluate((e) => {
      const r = e.getBoundingClientRect();
      return { mitad: r.top + window.scrollY + r.height / 2, alto: window.innerHeight };
    });
    expect(mitad, `mitad de la escena (px desde arriba) frente a ${alto} px de pantalla`).toBeLessThan(alto);
  });

  test.fail('ABIERTO (firma 20/11/2026) · HCP: la capa intermedia queda más lejos que los vecinos del plano', async ({ page }) => {
    // La tarjeta dice «Nº coordinación 12» y «74 %»: en la HCP compacta los 6 vecinos del plano y
    // los 3 + 3 de las capas contiguas están a la MISMA distancia a, y c/a = 2·√(2/3) = 1,633.
    // Dibujada: a = 40,5 px, c = 90 px (c/a = 2,22) y la capa intermedia a 50,69 px de la base.
    await abrir(page);
    await irASeccion(page, /Metálicas/);
    await elegir(page, /^HCP/);
    const { atomos } = await leerEscena(page);
    const ys = [...new Set(atomos.map((p) => Math.round(p[1])))].sort((a, b) => a - b);
    expect(ys, 'tres capas').toHaveLength(3);
    const base = atomos.filter((p) => Math.round(p[1]) === ys[0]);
    const medio = atomos.filter((p) => Math.round(p[1]) === ys[1]);
    const enPlano = Math.min(...base.flatMap((p, i) => base.filter((_, j) => j !== i).map((q) => dist(p, q))));
    const entreCapas = Math.min(...medio.flatMap((p) => base.map((q) => dist(p, q))));
    expect(Math.abs(entreCapas - enPlano), `vecino de la capa contigua ${entreCapas.toFixed(2)} px · del plano ${enPlano.toFixed(2)} px`).toBeLessThan(1);
  });

  test.fail('ABIERTO (firma 20/11/2026) · aristas a 1,45:1 en claro: el contorno de la celda apenas se ve', async ({ page }) => {
    // .arista: rgba(46, 134, 171, 0.3) sobre la tarjeta blanca = rgb(192,3; 218,7; 229,8) → 1,45:1.
    // En trigonal, monoclínico y triclínico (sin caras) son lo único que dibuja la celda, y en el
    // grafito y la sal, los enlaces. Mínimo para un gráfico necesario: 3:1 (WCAG 1.4.11).
    await abrir(page);
    await prepararParaMedir(page);
    await elegir(page, 'Monoclínico');
    const { arista } = await contrastesEscena(page);
    expect(arista, 'contraste de las aristas contra la tarjeta').toBeGreaterThanOrEqual(3);
  });
});

test.describe('Firma 20/11/2026 · movimiento reducido', () => {
  test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });

  test('REPARADO 5310 (firma 20/11/2026) · con movimiento reducido el arrastre no gira y la app sigue diciendo «Arrastra para rotar»', async ({ page }) => {
    // Reparado por la primera vía: el arrastre gira (es manipulación directa) y el cursor es «grab».
    // handlePointerDown sale sin hacer nada si prefers-reduced-motion: el arrastre es manipulación
    // directa, no una animación. Arrastrar 40 px → y = 30 + 40·0,5 = 50°. Obtenido: 30°, cursor
    // «default», y el texto bajo la escena, el aria-label y el subtítulo siguen pidiendo arrastrar.
    // Se acepta cualquiera de las dos reparaciones coherentes: que gire, o que deje de prometerlo.
    await abrir(page);
    const escena = page.locator(ESCENA);
    await escena.scrollIntoViewIfNeeded();
    const caja = await escena.boundingBox();
    const cx = (caja?.x ?? 0) + (caja?.width ?? 0) / 2;
    const cy = (caja?.y ?? 0) + (caja?.height ?? 0) / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 40, cy, { steps: 8 });
    await page.mouse.up();
    const gira = (await leerGiro(page)).y === 50;
    const prometeArrastre =
      (await page.getByText(/Arrastra para rotar/i).count()) > 0 || /Arrastra/i.test((await escena.getAttribute('aria-label')) ?? '');
    expect(gira || !prometeArrastre, `gira: ${gira} · promete arrastrar: ${prometeArrastre}`).toBe(true);
    if (gira) expect(await escena.evaluate((e) => getComputedStyle(e).cursor), 'el cursor dice que se puede agarrar').toBe('grab');
  });
});

test.describe('Firma 20/11/2026 · tema oscuro', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.fail('ABIERTO (firma 20/11/2026) · en oscuro los átomos del diamante y del grafito no se distinguen de la tarjeta', async ({ page }) => {
    // Tarjeta oscura #2A2A2A. Diamante: #555555 → 1,92:1 y los 4 interiores #1A1A1A → 1,21:1;
    // grafito: capa superior #333333 → 1,14:1 y la inferior #666666 → 2,50:1. Mínimo 3:1.
    await abrir(page);
    await prepararParaMedir(page);
    await activarTemaOscuro(page);
    await irASeccion(page, /Cristales Famosos/);
    const peores: string[] = [];
    for (const nombre of [/Diamante/, /Grafito/]) {
      await elegir(page, nombre);
      await expect.poll(async () => (await contrastesEscena(page)).fondoLum, { message: 'la tarjeta ya es oscura' }).toBeLessThan(0.05);
      const { atomos } = await contrastesEscena(page);
      const peor = Math.min(...atomos);
      if (peor < 3) peores.push(`${nombre.source} ${peor.toFixed(2)}:1`);
    }
    expect(peores, 'átomos por debajo de 3:1 contra la tarjeta oscura').toEqual([]);
  });
});

test.describe('Firma 20/11/2026 · móvil 390 px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test('control: el dedo en vertical gira la celda sin desplazar la página; fuera de la escena, la desplaza', async ({ page, context }) => {
    // Escena con touch-action: none. Dedo 60 px hacia abajo sobre ella → x = −20 − 60·0,5 = −50° y
    // scrollY igual. Fuera de la escena (margen izquierdo), 200 px hacia arriba → la página baja.
    await abrir(page);
    const escena = page.locator(ESCENA);
    await escena.scrollIntoViewIfNeeded();
    const caja = await escena.boundingBox();
    const cdp = await context.newCDPSession(page);
    const fotograma = () => page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => r())));
    const cx = (caja?.x ?? 0) + (caja?.width ?? 0) / 2;
    const cy = (caja?.y ?? 0) + (caja?.height ?? 0) / 2;
    const scroll0 = await page.evaluate(() => window.scrollY);
    expect(await leerGiro(page)).toEqual({ x: -20, y: 30 });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy - 30 }] });
    await fotograma();
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx, y: cy - 30 + i * 6 }] });
      await fotograma();
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await leerGiro(page)).x, { message: 'el dedo inclina la celda' }).toBe(-50);
    expect(await page.evaluate(() => window.scrollY), 'la página no se mueve bajo el dedo').toBe(scroll0);

    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 8, y: 600 }] });
    await fotograma();
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 8, y: 600 - i * 20 }] });
      await fotograma();
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => page.evaluate(() => window.scrollY), { message: 'fuera de la escena el dedo desplaza' }).toBeGreaterThan(scroll0);
  });

  test('REPARADO 5308 (firma 20/11/2026) · tocar 4 veces «Rotar derecha» deja la celda en 120°', async ({ page }) => {
    // Mismo defecto que en escritorio, con el dedo: esperado 60, 90, 120, 150 · obtenido 60, 90,
    // 120, 120 (el cuarto toque cae en el plano girado de la estructura, no en el botón).
    await abrir(page);
    await page.getByRole('button', { name: 'Rotar derecha' }).scrollIntoViewIfNeeded();
    for (let i = 1; i <= 4; i++) {
      await pulsarEnSuSitio(page, 'Rotar derecha', true);
      await expect.poll(async () => (await leerGiro(page)).y, { message: `toque ${i}`, timeout: 2000 }).toBe(30 + 30 * i);
    }
  });

  test.fail('ABIERTO (firma 20/11/2026) · en el móvil la escena 3D queda casi dos pantallas por debajo', async ({ page }) => {
    // A 390×844 (este bloque) la mitad de la escena cae en y ≈ 1576 px; en Pixel 7 (412×839) la
    // escena empieza en y ≈ 1466 px y hay que bajar ~850 px para verla entera. Delante: hero, aviso
    // legal, banner de Stemum, las 4 secciones en 2×2, la cabecera, el contexto, las 7 tarjetas en
    // tres filas y los parámetros. Esperado: al menos media escena dentro de la primera pantalla.
    await abrir(page);
    const { mitad, alto } = await page.locator(ESCENA).evaluate((e) => {
      const r = e.getBoundingClientRect();
      return { mitad: r.top + window.scrollY + r.height / 2, alto: window.innerHeight };
    });
    expect(mitad, `mitad de la escena (px desde arriba) frente a ${alto} px de pantalla`).toBeLessThan(alto);
  });
});
