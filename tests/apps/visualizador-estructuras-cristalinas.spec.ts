import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

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
 * cuando se reparen, y entonces se quita la marca.
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

  test('HALLAZGO (09/11/2026, ABIERTO) · el porcentaje va pegado: «68%» en vez de «68 %»', async ({ page }) => {
    // Norma de la casa (CLAUDE.md global §2, RAE 2010): número, espacio duro (U+00A0) y «%».
    test.fail();
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

  test('HALLAZGO (09/11/2026, ABIERTO) · la celda «trigonal» dibujada es triclínica', async ({ page }) => {
    // La app dice «a = b = c» y «α = β = γ ≠ 90°» (romboedro). Resuelto a mano con las esquinas
    // del código: aristas (90, 0, 0), (−36, 90, 0) y (18, 0, 90) → 90 · 96,93 · 91,78 px y
    // ángulos 94,18° · 78,69° · 111,8°: ni iguales las aristas ni iguales los ángulos.
    test.fail();
    await abrir(page);
    await elegir(page, 'Trigonal');
    await expect(detalle(page)).toContainText('Parámetros: a = b = c');
    const { longitudes, angulos } = celda((await leerEscena(page)).atomos);
    expect(Math.max(...longitudes) - Math.min(...longitudes), 'a = b = c').toBeLessThan(0.5);
    expect(Math.max(...angulos) - Math.min(...angulos), 'α = β = γ').toBeLessThan(0.5);
    expect(angulos[0], 'α ≠ 90°').toBeLessThan(88);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · las aristas no unen átomos: ninguna sale vertical', async ({ page }) => {
    // Un cubo tiene 12 aristas que unen sus 8 esquinas, 4 de ellas verticales. calcularAristaCSS
    // orienta un elemento que nace sobre el eje X con rotateY(atan2(dx, dz)) rotateX(...): el giro
    // en X no mueve un vector del eje X y el de Y está calculado para el eje Z. Hoy en el cubo
    // 6 de 12 acaban en un átomo y 0 son verticales; en monoclínico, triclínico, trigonal,
    // hexagonal, HCP y grafito no acaba en un átomo NINGUNA.
    test.fail();
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

  test('HALLAZGO (09/11/2026, ABIERTO) · las caras del prisma hexagonal no coinciden con él', async ({ page }) => {
    // Prisma de la app: hexágono de 45 px de radio y 72 px de alto (átomos en y = ±36). Las caras
    // de hexCaras miden 144 px de alto (y = ±72) y cada una está girada 60° respecto a su arista:
    // sus esquinas quedan a 22,5 px de los vértices en planta. Lo mismo en HCP y en el cuarzo.
    test.fail();
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

  test('HALLAZGO (09/11/2026, ABIERTO) · grafito: un carbono en el centro de cada anillo, con 6 vecinos', async ({ page }) => {
    // sp²: cada carbono se une a 3 dentro de su capa (lo dice la FAQ de la app). Hoy cada capa
    // pinta el anillo de 6 y un átomo en su centro, a 31,5 px de los seis: la misma distancia que
    // el lado del anillo, es decir, un carbono con 6 enlaces. En el panal del grafeno el centro
    // del hexágono está vacío. Además la segunda capa está girada 30°, no desplazada (ABAB).
    test.fail();
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

  test('HALLAZGO (09/11/2026, ABIERTO) · cuarzo: los «tetraedros SiO₄» no son tetraedros', async ({ page }) => {
    // Tetraedro regular: los seis O–Si–O valen 109,47°. Hoy van de 33,33° a 138,7° (tetraAngles
    // [0, 109,5, 219, 328,5] usa el ángulo de enlace como acimut en un plano). Tolerancia de 10°:
    // un modelo simplificado puede deformar un poco; el defecto es de 76°.
    test.fail();
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

  test('HALLAZGO (09/11/2026, ABIERTO) · el cuarzo figura en dos de los 7 sistemas', async ({ page }) => {
    // La app dice «Todos los cristales pertenecen a uno de 7 sistemas» y pone «Cuarzo» de ejemplo
    // en Hexagonal y en Trigonal; la FAQ (JSON-LD) dice «el cuarzo, al hexagonal».
    test.fail();
    await abrir(page);
    const conCuarzo: string[] = [];
    for (const nombre of ['Cúbico', 'Tetragonal', 'Ortorrómbico', 'Hexagonal', 'Trigonal', 'Monoclínico', 'Triclínico']) {
      await elegir(page, nombre);
      const ejemplo = (await detalle(page).innerText()).split('\n').find((l) => l.startsWith('Ejemplo:')) ?? '';
      if (/cuarzo/i.test(ejemplo)) conCuarzo.push(nombre);
    }
    expect(conCuarzo, 'sistemas que dan el cuarzo de ejemplo').toHaveLength(1);
    const faq = await page.locator('script[type="application/ld+json"]').allTextContents();
    const asignado = /el cuarzo, al (\p{L}+)/iu.exec(faq.join(' '))?.[1];
    if (asignado) expect(asignado.toLowerCase(), 'la FAQ dice el mismo sistema que la página').toBe(conCuarzo[0]?.toLowerCase());
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el grafito conduce «entre capas», y la propia app dice que en el plano', async ({ page }) => {
    // «Datos y Propiedades → Conductividad»: «El grafito conduce en el plano (electrones π
    // deslocalizados) pero no perpendicular a las capas». El «Dato clave» del grafito dice lo
    // contrario: «Conductor eléctrico (electrones libres entre capas)».
    test.fail();
    await abrir(page);
    await irASeccion(page, /Cristales Famosos/);
    await elegir(page, /Grafito/);
    await expect(detalle(page)).not.toContainText('entre capas');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · «mayor empaquetamiento = mayor densidad, por eso el oro…»', async ({ page }) => {
    // 0,7405 / 0,6802 = 1,09: el empaquetamiento explica como mucho un 9 %, y oro/hierro es 2,45.
    // Con las listas de la propia app y las densidades del NIST (X-Ray Mass Attenuation
    // Coefficients, tabla 1): wolframio BCC 19,30 g/cm³ ≈ oro FCC 19,32; aluminio FCC 2,699 <
    // hierro BCC 7,874. La densidad la marcan sobre todo la masa atómica y el radio.
    test.fail();
    await abrir(page);
    await irASeccion(page, /Datos y Propiedades/);
    const tarjeta = page.getByRole('heading', { name: 'Empaquetamiento y densidad' }).locator('xpath=../..');
    await expect(tarjeta).not.toContainText(/Por eso el oro/);
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · «solo existen 7 formas de paralelepípedo que llenan el espacio»', async ({ page }) => {
    // Todo paralelepípedo de aristas a, b, c no coplanarias llena el espacio por traslación: cada
    // punto r = x·a + y·b + z·c cae en una sola copia (la de ⌊x⌋, ⌊y⌋, ⌊z⌋). Hay infinitas
    // formas (el propio triclínico de la app es una familia continua). Los 7 sistemas salen de
    // la SIMETRÍA de la red, no de que solo 7 formas teselen.
    test.fail();
    await abrir(page);
    await expect(page.locator('[data-guia-educativa]')).not.toContainText('solo existen 7 formas fundamentales de paralelepípedo');
  });

  test('HALLAZGO (09/11/2026, ABIERTO) · el JSON-LD promete «empaquetamiento … con radio atómico» y no lo hay', async ({ page }) => {
    test.fail();
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

  test('HALLAZGO (09/11/2026, ABIERTO) · contraste en claro de los títulos coloreados', async ({ page }) => {
    // Sobre la tarjeta blanca: Tetragonal 2,80 · Ortorrómbico 2,03 · Trigonal 2,87 · Monoclínico
    // 2,19 (19,2 px negrita: texto grande, mínimo 3:1); BCC 4,11 · FCC 2,19 · HCP 2,80 (17,6 px
    // negrita: no llega a grande, mínimo 4,5:1). En oscuro cumplen todos.
    test.fail();
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
