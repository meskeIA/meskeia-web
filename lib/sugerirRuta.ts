/**
 * Motor de la página 404: dada una ruta que no existe, propone la app del catálogo más parecida.
 *
 * Nació con la semilla S0278 (16/11/2026). De las 1.132 páginas de meskeia.com con impresiones en
 * Google en 90 días, 118 daban 404 y ninguna había existido nunca en el repositorio: unos 30 clics
 * que acababan en la página de error vacía de Next. Las dos formas sistemáticas —el dominio
 * repetido (`/meskeia.com/<slug>/`) y los acentos (`/luxómetro/`)— las redirige `proxy.ts`
 * (`rutaCanonica`, aquí mismo). Lo que queda son ERRATAS y nombres inventados
 * (`/simulador-gastso-compraventa-solar/`, `/simulador-compraventa-garaje/`), distintos cada vez:
 * ninguna lista de redirecciones escrita a mano los alcanza, así que se calcula el parecido.
 *
 * Sin dependencias, para que lo pruebe `tests/sugerir-ruta-motor.spec.ts` en Node.
 */

/** Prefijos de dominio que se cuelan delante del slug: `/meskeia.com/`, `/meskeia/`, `/meskeia-com/`. */
const PREFIJO_DOMINIO = /^\/(?:www\.)?meskeia(?:\.com|-com)?(?=\/)/i;
/** Prefijo de idioma que se inventan algunos enlaces: `/es/`. */
const PREFIJO_IDIOMA = /^\/es(?=\/)/i;

function decodificar(ruta: string): string {
  try {
    return decodeURIComponent(ruta);
  } catch {
    return ruta;
  }
}

function sinDiacriticos(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * La ruta canónica a la que redirigir, o null si la ruta ya es canónica.
 *
 * Solo corrige lo que es inequívoco: el dominio repetido delante del slug, un `/es/` detrás de él
 * y los acentos y mayúsculas del slug. Ningún slug del catálogo lleva acentos ni mayúsculas, así
 * que quitarlos no puede llevar de una ruta que existe a otra.
 */
export function rutaCanonica(ruta: string): string | null {
  const decodificada = decodificar(ruta);
  let r = decodificada;
  if (PREFIJO_DOMINIO.test(r)) r = r.replace(PREFIJO_DOMINIO, '').replace(PREFIJO_IDIOMA, '');
  r = sinDiacriticos(r).toLowerCase();
  // Se compara con la ruta DECODIFICADA, no con la que llega (`/lux%C3%B3metro/`): comparar con
  // la codificada redirigiría `/a%20b/` a `/a b/`, que el navegador vuelve a pedir como
  // `/a%20b/`, en bucle. La barra final sola no se toca: eso lo resuelve Next con su propio 308
  // (trailingSlash: true).
  if (r === decodificada) return null;
  if (r === '') return '/';
  return r.endsWith('/') ? r : `${r}/`;
}

/** Bigramas de caracteres (multiconjunto) de un slug, con los guiones como separador. */
function bigramas(texto: string): Map<string, number> {
  const t = ` ${texto.replace(/[-/]+/g, ' ')} `;
  const m = new Map<string, number>();
  for (let i = 0; i < t.length - 1; i++) {
    const b = t.slice(i, i + 2);
    m.set(b, (m.get(b) ?? 0) + 1);
  }
  return m;
}

function totalBigramas(m: Map<string, number>): number {
  let n = 0;
  for (const v of m.values()) n += v;
  return n;
}

/** Coeficiente de Dice sobre bigramas: 1 = iguales, 0 = nada en común. */
function parecido(a: Map<string, number>, b: Map<string, number>): number {
  let comunes = 0;
  for (const [k, v] of a) comunes += Math.min(v, b.get(k) ?? 0);
  const total = totalBigramas(a) + totalBigramas(b);
  return total === 0 ? 0 : (2 * comunes) / total;
}

/** Distancia de edición entre dos palabras, con tope: por encima de `tope` devuelve `tope + 1`. */
function distancia(a: string, b: string, tope: number): number {
  if (Math.abs(a.length - b.length) > tope) return tope + 1;
  let previa = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    let minimoFila = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(previa[j] + 1, actual[j - 1] + 1, previa[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      actual.push(v);
      if (v < minimoFila) minimoFila = v;
    }
    if (minimoFila > tope) return tope + 1;
    previa = actual;
  }
  return previa[b.length];
}

/** Dos palabras son la misma con una errata: `gastso`/`gastos`, `arvoles`/`arboles`. */
function mismaPalabra(a: string, b: string): boolean {
  if (a === b) return true;
  const corta = Math.min(a.length, b.length);
  if (corta < 4) return false;
  return distancia(a, b, corta >= 8 ? 2 : 1) <= (corta >= 8 ? 2 : 1);
}

const palabras = (slug: string): string[] => slug.split(/[-/]+/).filter(Boolean);

/**
 * Peso de cada palabra según lo rara que es en el catálogo (IDF). Sin él, «simulador» —que está
 * en más de cien slugs— pesaba lo mismo que «energía», y `/simulador-energia-mecanica/` proponía
 * el simulador de genética por el parecido de «mecanica» con «genetica».
 */
function pesosDelCatalogo(slugs: readonly string[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const s of slugs) for (const p of new Set(palabras(s))) df.set(p, (df.get(p) ?? 0) + 1);
  const pesos = new Map<string, number>();
  for (const [p, n] of df) pesos.set(p, Math.log((slugs.length + 1) / n));
  return pesos;
}

/**
 * Parecido por palabras, ponderado por rareza: la suma de los pesos de las palabras que casan
 * (con errata o sin ella), sobre la suma de los pesos de las dos. Una palabra que no está en el
 * catálogo (una errata) pesa como la palabra con la que case o, si no casa con ninguna, como la
 * más rara.
 */
function parecidoPalabras(a: string[], b: string[], pesos: Map<string, number>, pesoMax: number): number {
  const usadas = new Set<number>();
  let comun = 0;
  let totalA = 0;
  for (const pa of a) {
    let peso = pesos.get(pa);
    const j = b.findIndex((pb, k) => !usadas.has(k) && mismaPalabra(pa, pb));
    if (j >= 0) {
      usadas.add(j);
      peso ??= pesos.get(b[j]) ?? pesoMax;
      comun += Math.min(peso, pesos.get(b[j]) ?? pesoMax);
    }
    totalA += peso ?? pesoMax;
  }
  let totalB = 0;
  for (const pb of b) totalB += pesos.get(pb) ?? pesoMax;
  const total = totalA + totalB;
  return total === 0 ? 0 : (2 * comun) / total;
}

/** Parecido mínimo para proponer una app. Por debajo, la página 404 no sugiere nada. */
export const UMBRAL_SUGERENCIA = 0.6;

/** El slug normalizado de una ruta: sin prefijos, sin acentos, sin `.html` y sin barras. */
export function slugDeRuta(ruta: string): string {
  const canonica = rutaCanonica(ruta) ?? decodificar(ruta);
  return sinDiacriticos(canonica)
    .toLowerCase()
    .replace(/\.html?$/, '')
    .replace(/^\/+|\/+$/g, '');
}

/**
 * La URL del catálogo más parecida a `ruta` (con sus barras, tal como está en `urls`), o null si
 * ninguna llega a `UMBRAL_SUGERENCIA`.
 */
export function sugerirRuta(ruta: string, urls: readonly string[]): string | null {
  const slug = slugDeRuta(ruta);
  if (slug === '') return null;
  const candidatos = urls.map((u) => u.replace(/^\/+|\/+$/g, ''));
  const pesos = pesosDelCatalogo(candidatos);
  let pesoMax = 0;
  for (const v of pesos.values()) if (v > pesoMax) pesoMax = v;
  const bSlug = bigramas(slug);
  const pSlug = palabras(slug);
  let mejor: string | null = null;
  let mejorParecido = 0;
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const candidato = candidatos[i];
    if (candidato === slug) return url;
    // Mitad letras (cubre las erratas dentro de una palabra y las palabras pegadas), mitad
    // palabras ponderadas (cubre que «simulador» o «calculadora» no decidan nada).
    const p =
      0.5 * parecido(bSlug, bigramas(candidato)) +
      0.5 * parecidoPalabras(pSlug, palabras(candidato), pesos, pesoMax);
    if (p > mejorParecido) {
      mejorParecido = p;
      mejor = url;
    }
  }
  return mejorParecido >= UMBRAL_SUGERENCIA ? mejor : null;
}
