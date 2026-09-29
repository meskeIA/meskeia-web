/**
 * Vértices del lienzo 3D del Simulador VSEPR — geometría pura, sin React ni DOM.
 *
 * MOVIDO de `page.tsx` el 29/09/2026 (hallazgo 2415) para poder barrer con un test TODAS las
 * combinaciones que admiten los deslizadores: la rama del octaedro solo repartía pares libres para
 * E = 1 y E = 2, y con X = 3, E = 3 (SF₆ + «Pares libres» al máximo) pintaba 6 átomos X y ningún
 * lóbulo, en contra de lo que decían los deslizadores. La invariante que ahora se exige: el dibujo
 * tiene EXACTAMENTE X vértices «enlace» y E vértices «libre», sea cual sea la combinación.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vertice extends Vec3 {
  tipo: 'enlace' | 'libre';
  indice: number;
}

/** Las direcciones de la geometría ELECTRÓNICA de `total` dominios (vectores unitarios). */
export function getVerticesElectronicos(total: number): Vec3[] {
  switch (total) {
    case 1:
      return [{ x: 1, y: 0, z: 0 }];
    case 2:
      // Lineal
      return [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
      ];
    case 3: {
      // Trigonal plana — 120° en plano xy
      const verts: Vec3[] = [];
      for (let i = 0; i < 3; i++) {
        const ang = (i * 2 * Math.PI) / 3;
        verts.push({ x: Math.cos(ang), y: Math.sin(ang), z: 0 });
      }
      return verts;
    }
    case 4: {
      // Tetraédrica — 4 vértices del tetraedro normalizados
      const k = 1 / Math.sqrt(3);
      return [
        { x: k, y: k, z: k },
        { x: -k, y: -k, z: k },
        { x: -k, y: k, z: -k },
        { x: k, y: -k, z: -k },
      ];
    }
    case 5: {
      // Bipirámide trigonal: 3 ecuatoriales (120° en xy) + 2 axiales (±z)
      const verts: Vec3[] = [];
      for (let i = 0; i < 3; i++) {
        const ang = (i * 2 * Math.PI) / 3;
        verts.push({ x: Math.cos(ang), y: Math.sin(ang), z: 0 });
      }
      verts.push({ x: 0, y: 0, z: 1 });
      verts.push({ x: 0, y: 0, z: -1 });
      return verts;
    }
    case 6:
      // Octaédrica: ±x, ±y, ±z
      return [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
      ];
    default:
      return [];
  }
}

/**
 * Orden en que los pares libres ocupan los vértices de cada geometría electrónica. Se toman los
 * E primeros; el resto son enlaces. Así el número de lóbulos es E por construcción, para
 * cualquier E, y no solo para los que tenían rama propia.
 *
 * - Bipirámide (5): primero las 3 posiciones ECUATORIALES (0, 1, 2): allí un par libre solo tiene
 *   2 vecinos a 90°; en un polo tendría 3.
 * - Octaedro (6): el primero en un polo (+z → pirámide cuadrada, AX₅E); el segundo en el polo
 *   OPUESTO (−z → cuadrada plana, AX₄E₂); el tercero (AX₃E₃, fuera de la tabla de la app) en el
 *   ecuador: con los tres en «mer» hay dos repulsiones par libre–par libre a 90°, frente a tres
 *   si se agrupasen en una cara («fac»). Los 3 átomos quedan en forma de T.
 * - Resto (1-4 dominios): todos los vértices son equivalentes; los libres van al final.
 */
function ordenDeLibres(total: number): number[] {
  if (total === 5) return [0, 1, 2, 3, 4];
  if (total === 6) return [5, 4, 1, 0, 3, 2];
  return Array.from({ length: total }, (_, i) => total - 1 - i);
}

/**
 * Los vértices que pinta el lienzo para X pares enlazantes y E pares libres. Devuelve `[]` si el
 * total no tiene geometría electrónica dibujable (0 o más de 6 dominios); si devuelve algo, trae
 * exactamente `enlaces` vértices «enlace» y `libres` vértices «libre».
 */
export function asignarVertices(enlaces: number, libres: number): Vertice[] {
  const total = enlaces + libres;
  if (!Number.isInteger(enlaces) || !Number.isInteger(libres) || enlaces < 0 || libres < 0) return [];
  const posiciones = getVerticesElectronicos(total);
  if (posiciones.length === 0) return [];

  const indicesLibres = new Set<number>(ordenDeLibres(total).slice(0, libres));
  return posiciones.map((p, i) => ({
    ...p,
    tipo: indicesLibres.has(i) ? 'libre' : 'enlace',
    indice: i,
  }));
}
