// Motor del sorteo del amigo invisible (S0239, 31/10/2026). Sin dependencias: lo prueban
// tests/amigo-invisible-motor.spec.ts con casos resueltos a mano, antes que la vista.
//
// El reparto es una PERMUTACIÓN de los participantes en la que nadie se regala a sí mismo ni
// a quien tiene excluido. Sin la opción de «nada de regalos mutuos», que exista un reparto es
// exactamente que exista un emparejamiento perfecto en el grafo regalador → destinatario, y eso
// se comprueba sin azar (caminos de aumento, n ≤ 100). Con esa opción ya no es un
// emparejamiento —prohíbe ciclos de longitud 2— y se busca con vuelta atrás acotada.

export interface Exclusion {
  /** Índice de quien regala */
  de: number;
  /** Índice de quien no puede recibir de él */
  a: number;
}

export interface OpcionesSorteo {
  /** Prohíbe que A regale a B y B a A a la vez */
  sinMutuos: boolean;
}

export type ResultadoSorteo =
  | { ok: true; asignacion: number[] }
  | { ok: false; motivo: 'pocos' | 'sin-opciones' | 'sin-regalador' | 'imposible' | 'agotado'; indice?: number };

export const MIN_PARTICIPANTES = 3;
export const MAX_PARTICIPANTES = 100;

/** Matriz permitido[de][a]: nadie a sí mismo ni a sus excluidos. */
export function matrizPermitidos(n: number, exclusiones: Exclusion[]): boolean[][] {
  const m = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i !== j));
  for (const e of exclusiones) {
    if (e.de >= 0 && e.de < n && e.a >= 0 && e.a < n) m[e.de][e.a] = false;
  }
  return m;
}

/** ¿Hay un emparejamiento perfecto? Algoritmo de Kuhn: O(n³), sobrado para 100 personas. */
export function existeReparto(permitido: boolean[][]): boolean {
  const n = permitido.length;
  const receptorDe: number[] = new Array(n).fill(-1);
  const aumentar = (i: number, visto: boolean[]): boolean => {
    for (let j = 0; j < n; j++) {
      if (!permitido[i][j] || visto[j]) continue;
      visto[j] = true;
      if (receptorDe[j] === -1 || aumentar(receptorDe[j], visto)) {
        receptorDe[j] = i;
        return true;
      }
    }
    return false;
  };
  for (let i = 0; i < n; i++) {
    if (!aumentar(i, new Array(n).fill(false))) return false;
  }
  return true;
}

/** Valida un reparto contra las reglas (lo usan el motor y los tests). */
export function repartoValido(asignacion: number[], permitido: boolean[][], opciones: OpcionesSorteo): boolean {
  const n = permitido.length;
  if (asignacion.length !== n) return false;
  const recibe = new Set(asignacion);
  if (recibe.size !== n) return false;
  for (let i = 0; i < n; i++) {
    const j = asignacion[i];
    if (!Number.isInteger(j) || j < 0 || j >= n || !permitido[i][j]) return false;
    if (opciones.sinMutuos && asignacion[j] === i) return false;
  }
  return true;
}

function barajar<T>(xs: T[], aleatorio: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(aleatorio() * (i + 1));
    [a[i], a[k]] = [a[k], a[i]];
  }
  return a;
}

// Intentos de permutación al azar antes de pasar a la vuelta atrás. Con pocas exclusiones casi
// siempre acierta en los primeros (un desarreglo sale ~1 de cada e ≈ 2,7 permutaciones), y
// rechazar hasta acertar reparte por igual entre TODOS los repartos válidos.
const INTENTOS_AL_AZAR = 5000;
// Tope de nodos de la vuelta atrás: solo se alcanza con «sin mutuos» y exclusiones muy densas.
const TOPE_NODOS = 200_000;

export function sortear(
  n: number,
  exclusiones: Exclusion[],
  opciones: OpcionesSorteo,
  aleatorio: () => number,
): ResultadoSorteo {
  if (n < MIN_PARTICIPANTES) return { ok: false, motivo: 'pocos' };
  const permitido = matrizPermitidos(n, exclusiones);

  // Diagnóstico con nombre propio, antes del caso general: es lo que el organizador puede arreglar.
  for (let i = 0; i < n; i++) {
    if (!permitido[i].some(Boolean)) return { ok: false, motivo: 'sin-opciones', indice: i };
  }
  for (let j = 0; j < n; j++) {
    if (!permitido.some((fila) => fila[j])) return { ok: false, motivo: 'sin-regalador', indice: j };
  }
  if (!existeReparto(permitido)) return { ok: false, motivo: 'imposible' };

  const indices = Array.from({ length: n }, (_, i) => i);
  for (let t = 0; t < INTENTOS_AL_AZAR; t++) {
    const p = barajar(indices, aleatorio);
    if (repartoValido(p, permitido, opciones)) return { ok: true, asignacion: p };
  }

  // Vuelta atrás con orden aleatorio, empezando por quien menos opciones tiene.
  const asignacion: number[] = new Array(n).fill(-1);
  const usado: boolean[] = new Array(n).fill(false);
  const orden = barajar(indices, aleatorio)
    .sort((x, y) => permitido[x].filter(Boolean).length - permitido[y].filter(Boolean).length);
  let nodos = 0;
  const colocar = (k: number): boolean | null => {
    if (k === n) return true;
    if (++nodos > TOPE_NODOS) return null;
    const i = orden[k];
    for (const j of barajar(indices, aleatorio)) {
      if (usado[j] || !permitido[i][j]) continue;
      if (opciones.sinMutuos && asignacion[j] === i) continue;
      asignacion[i] = j;
      usado[j] = true;
      const r = colocar(k + 1);
      if (r !== false) return r;
      asignacion[i] = -1;
      usado[j] = false;
    }
    return false;
  };
  const r = colocar(0);
  if (r === true) return { ok: true, asignacion: [...asignacion] };
  return { ok: false, motivo: r === null ? 'agotado' : 'imposible' };
}

// ── Participantes ────────────────────────────────────────────────────────────────────────

/** Clave para comparar nombres: sin mayúsculas, acentos ni espacios repetidos. */
export function claveNombre(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export interface ListaParticipantes {
  nombres: string[];
  /** Nombres repetidos (tal como se escribieron la segunda vez) */
  repetidos: string[];
}

/** Una persona por línea; se ignoran las vacías y se quitan las repetidas. */
export function leerParticipantes(texto: string): ListaParticipantes {
  const nombres: string[] = [];
  const repetidos: string[] = [];
  const vistos = new Set<string>();
  for (const linea of texto.split(/\r?\n/)) {
    const nombre = linea.replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!nombre) continue;
    const k = claveNombre(nombre);
    if (vistos.has(k)) { repetidos.push(nombre); continue; }
    vistos.add(k);
    nombres.push(nombre);
  }
  return { nombres, repetidos };
}

// ── Enlace privado ───────────────────────────────────────────────────────────────────────
// El resultado de cada persona viaja en el FRAGMENTO de la URL (#r=…), que el navegador no
// envía al servidor. Va en base64url, que no se lee de un vistazo, pero NO está cifrado:
// quien abra el enlace ve el resultado, y así lo dice la página.

export interface DatosEnlace {
  /** Quien regala (el dueño del enlace) */
  de: string;
  /** A quien le regala */
  a: string;
  evento?: string;
  presupuesto?: string;
  /** AAAA-MM-DD */
  fecha?: string;
}

const PREFIJO = 'r=';

function aBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(b64: string): string | null {
  try {
    const normal = b64.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(normal + '='.repeat((4 - (normal.length % 4)) % 4));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

/** Fragmento sin la almohadilla: `r=eyJ2Ijox…` */
export function codificarEnlace(d: DatosEnlace): string {
  const carga: Record<string, string | number> = { v: 1, de: d.de, a: d.a };
  if (d.evento) carga.e = d.evento;
  if (d.presupuesto) carga.p = d.presupuesto;
  if (d.fecha) carga.f = d.fecha;
  return PREFIJO + aBase64Url(JSON.stringify(carga));
}

const texto = (v: unknown, max: number): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;

/** Lee `#r=…` (con o sin almohadilla). Devuelve null si no es un enlace válido. */
export function decodificarEnlace(fragmento: string): DatosEnlace | null {
  const f = fragmento.replace(/^#/, '');
  if (!f.startsWith(PREFIJO)) return null;
  const json = deBase64Url(f.slice(PREFIJO.length));
  if (!json) return null;
  let carga: unknown;
  try { carga = JSON.parse(json); } catch { return null; }
  if (!carga || typeof carga !== 'object') return null;
  const o = carga as Record<string, unknown>;
  const de = texto(o.de, 40);
  const a = texto(o.a, 40);
  if (o.v !== 1 || !de || !a) return null;
  const fecha = typeof o.f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.f) ? o.f : undefined;
  return { de, a, evento: texto(o.e, 60), presupuesto: texto(o.p, 30), fecha };
}

/** AAAA-MM-DD → DD/MM/AAAA, sin pasar por Date (que movería el día con la zona horaria). */
export function fechaEspanola(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}
