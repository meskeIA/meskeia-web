/**
 * Motor de «Los Números de la Música»: física y teoría musical sin dependencias, para que cada
 * cifra que la vista rotula o dibuja salga de una fórmula comprobable a mano.
 *
 * Casos resueltos a mano (se comprueban en tests/apps/visualizador-matematicas-musica.spec.ts):
 *   - Temperamento igual con La4 = 440 Hz (ISO 16:1975): f(n) = 440·2^(n/12).
 *     Do4 (n = −9) = 261,6256 Hz · Do5 (n = +3) = 523,2511 Hz · Sol4 (n = −2) = 391,9954 Hz.
 *   - Cents de una razón r: 1200·log₂(r). Quinta justa 3:2 = 701,955 · quinta temperada = 700.
 *     Sexta mayor justa 5:3 = 884,359 frente a La4/Do4 = 440/261,63 → 900,0: 15,6 cents.
 *   - Coma pitagórica: 12 quintas justas − 7 octavas = 1200·log₂(3¹²/2¹⁹) = 23,460 cents.
 *   - Ciclos en una ventana común de T segundos: f·T. Con T = 2/110 s (18,18 ms), 110 Hz da 2
 *     ciclos, 440 Hz da 8 y 880 Hz da 16: la proporción 1 : 4 : 8 de las frecuencias.
 */

/** Frecuencia temperada de la nota a `n` semitonos del La4 de referencia. */
export function frecuenciaTemperada(n: number, la4 = 440): number {
  return la4 * 2 ** (n / 12);
}

/** Distancia en cents entre dos frecuencias (o de una razón, con f1 = 1). */
export function cents(f2: number, f1 = 1): number {
  return 1200 * Math.log2(f2 / f1);
}

/** Una razón «p:q» como número (p/q). Devuelve NaN si el texto no es una razón. */
export function razonANumero(razon: string): number {
  const m = razon.match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
  if (!m) return NaN;
  const p = Number(m[1]);
  const q = Number(m[2]);
  return q === 0 ? NaN : p / q;
}

/**
 * ¿La razón justa `razon` describe EXACTAMENTE el intervalo entre f1 y f2? Con las frecuencias
 * redondeadas a centésimas, un intervalo exacto (unísono, octava) queda a menos de 0,1 cents;
 * las razones justas que el temperamento igual solo aproxima quedan a 2-16 cents.
 */
export function razonEsExacta(razon: string, f2: number, f1: number, toleranciaCents = 0.5): boolean {
  const r = razonANumero(razon);
  if (!Number.isFinite(r)) return false;
  return Math.abs(cents(f2, f1) - cents(r)) <= toleranciaCents;
}

/** Ventana de tiempo común para dibujar las ondas: dos periodos de 110 Hz. */
export const VENTANA_ONDAS_S = 2 / 110;

/** Ciclos completos que caben en la ventana común. */
export function ciclosEnVentana(frecuencia: number, ventana = VENTANA_ONDAS_S): number {
  return frecuencia * ventana;
}

/**
 * Trazo SVG de una senoide con `ciclos` ciclos en un lienzo de `ancho` × `alto`, empezando en el
 * centro y subiendo. Se muestrea a 24 puntos por ciclo (y nunca menos de 96 en total).
 */
export function trazoSenoide(ciclos: number, ancho: number, alto: number, margen = 3): string {
  const puntos = Math.max(96, Math.ceil(ciclos * 24));
  const medio = alto / 2;
  const amplitud = medio - margen;
  const partes: string[] = [];
  for (let i = 0; i <= puntos; i++) {
    const x = (i / puntos) * ancho;
    const y = medio - amplitud * Math.sin((2 * Math.PI * ciclos * i) / puntos);
    // Coordenadas del trazo SVG (sintaxis con punto decimal): no es una cifra que se presente.
    partes.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return partes.join(' ');
}
