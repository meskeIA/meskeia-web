/**
 * Corrector de «Casos para clase» — la parte que comparten todas las apps con tarea de aula.
 *
 * Usada por: el `casos.ts` o `motor.ts` de cada app con casos numerados de aula. La lista viva
 * es `npm run check:motores -- --lista`.
 *
 * QUÉ VIVE AQUÍ Y QUÉ NO
 * ──────────────────────
 * Aquí, lo que es igual en todas: el margen de ruido binario, las dos políticas de tolerancia
 * que conviven en el catálogo y el dominio de la magnitud. En cada app, lo que es del tema: el
 * aviso de «el signo va al revés» en lentes, el «lo has escrito en tanto por uno» de Punnett o
 * el «eso son litros, se piden mililitros» de la titulación. Esos diagnósticos se construyen
 * ENCIMA de `corregirNumero` y comparan con `dentroDeTolerancia`, no con su propia resta.
 *
 * DE DÓNDE SALE (15/10/2026, hito `casos-aula-motor-corrector` de la Agenda)
 * ─────────────────────────────────────────────────────────────────────────
 * El corrector estaba copiado en 33 apps. Dos reparaciones lo pagaron:
 *
 *   · Hallazgo 1211 (22/09/2026): en el borde EXACTO de la tolerancia la resta en binario
 *     decidía por ±1 ulp, así que la misma desviación se aceptaba por arriba y se rechazaba por
 *     abajo. Se aplicó a mano en 16 copias, y tres que nacieron sin él (progresiones, Pitágoras
 *     y Tales) siguieron sin él hasta este motor.
 *   · Hallazgo 1207 (22/09/2026): la tolerancia del 1 % daba por bueno un «101 %» de la
 *     descendencia en simulador-genetica. Se reparó allí y quedó latente en las demás, porque el
 *     dominio no se propaga copiando: medido el 15/10/2026, nueve apps aceptaban un imposible
 *     (un cuadrante 3,03, 8.072,5 bacterias, un coseno de 1,009…).
 *
 * Por eso `magnitud` es OBLIGATORIA: una respuesta no se puede juzgar sin saber qué cosa se
 * está contando. Dejarla opcional es volver al estado del que salió el 1207.
 *
 * Nada lanza: una entrada que no es número da un estado, no una excepción que tumbe el render.
 *
 * Las firmas de abajo son la huella de una copia del corrector. `check:motores` rompe el build
 * si reaparecen fuera de este fichero; el escape es `copia-ok: <razón>` en esa línea o la
 * anterior.
 *
 * huella-de-copia: \bRUIDO_BINARIO\s*=
 * huella-de-copia: Math\.max\(\s*0\.01\s*,\s*Math\.abs\(
 * huella-de-copia: function\s+exigeRedondeo\s*\(
 * huella-de-copia: Math\.round\(valor \* factor\) / factor
 */

/**
 * Margen sobre la tolerancia para absorber el ±1 ulp de la resta (hallazgo 1211). Con esperado
 * 0,1 y tolerancia 0,01, «0,11» daba 0,009999999999999995 (dentro) y «0,09» daba
 * 0,010000000000000009 (fuera). 1e-9 queda nueve órdenes por encima del ulp de las cifras de
 * aula y cinco por debajo de la menor tolerancia no nula del catálogo (0,0005); con tolerancia
 * 0 es lo único que separa 0,3 de 0,30000000000000004.
 */
export const RUIDO_BINARIO = 1e-9;

/** ¿Está `valor` a no más de `tolerancia` de `objetivo`? Con el margen de ruido binario. */
export function dentroDeTolerancia(valor: number, objetivo: number, tolerancia: number): boolean {
  return Math.abs(valor - objetivo) <= tolerancia + RUIDO_BINARIO;
}

/* ─────────────────────── Las dos políticas de tolerancia ─────────────────────── */

/**
 * Política RELATIVA, la de las apps del 06/09 al 28/09/2026: el mayor entre 0,01 y el 1 % del
 * valor. Admite que el alumno arrastre un redondeo intermedio, también en respuestas exactas.
 */
export function toleranciaRelativa(esperado: number): number {
  return Math.max(0.01, Math.abs(esperado) * 0.01);
}

/**
 * Redondeo al decimal pedido: el de la clave, la solución y los pasos de los casos de aula.
 *
 * Dos decisiones, las dos sobre empates exactos (una cifra terminada en 5 justo después del
 * último decimal pedido), tomadas de `redondearCifra` de simulador-lentes-opticas (hallazgo
 * 2751, 03/10/2026):
 *   · se redondea **alejándose de cero**, el redondeo escolar y el de `formatNumber`: −9,375 da
 *     −9,38 igual que 9,375 da 9,38. `Math.round` a secas lleva los negativos hacia cero
 *     (−9,375 → −9,37), así que la clave podía decir una cifra y el panel imprimir otra;
 *   · antes de redondear se limpia el error de coma flotante con 12 cifras significativas:
 *     1/(1/2,5 − 1/4,5) deja 5,624999999999999 donde el valor exacto es 5,625, y 2,675 · 100 da
 *     267,49999999999997. La escala se limpia con 15, no con 12, para que un valor grande con
 *     decimales (un campo de 10⁹ N/C a dos decimales) no pierda unidades.
 *
 * DE DÓNDE SALE (cabo C0126, 19/10/2026): este cuerpo estaba copiado con `Math.round` a secas en
 * 24 `casos.ts` y `motor.ts` de apps con «Casos para clase». La huella de la copia está en la
 * cabecera del fichero.
 */
export function redondearA(valor: number, decimales: number): number {
  if (!Number.isFinite(valor)) return valor;
  const limpio = Number(valor.toPrecision(12));
  const factor = 10 ** decimales;
  const escalado = Number((Math.abs(limpio) * factor).toPrecision(15));
  const redondeado = Math.round(escalado) / factor;
  // `+ 0` convierte el −0 de un valor que redondea a cero en 0: nunca «−0,00».
  return (limpio < 0 ? -redondeado : redondeado) + 0;
}

/**
 * ¿Hay que redondear `valor` para escribirlo con `decimales`? Decide a la vez dos cosas que
 * deben ir juntas: si el enunciado pide «redondea» y si el corrector da media unidad de margen.
 * `redondear` es para la app que tiene su propio convenio de redondeo (lentes y plano inclinado
 * usan el `redondearCifra` de su motor).
 */
export function exigeRedondeo(
  valor: number,
  decimales: number,
  redondear: (v: number, d: number) => number = redondearA,
): boolean {
  if (!Number.isFinite(valor)) return false;
  return Math.abs(redondear(valor, decimales) - valor) > 1e-9 * Math.max(1, Math.abs(valor));
}

/**
 * Política de REDONDEO, la de las apps desde el 28/09/2026: media unidad del último decimal
 * pedido si la respuesta exige redondear, y 0 si es exacta. Un 6 para un 6,25 % exacto no es un
 * redondeo aceptable (hallazgo 751 de simulador-punnett).
 */
export function toleranciaDeRedondeo(
  valor: number,
  decimales: number,
  redondear: (v: number, d: number) => number = redondearA,
): number {
  return exigeRedondeo(valor, decimales, redondear) ? 10 ** -decimales / 2 : 0;
}

/**
 * La desviación que se ENSEÑA al suspender, con los decimales que hagan falta para que no se lea
 * como 0 (hallazgo 3369, 18/10/2026). Con la política de redondeo una respuesta exacta tiene
 * tolerancia 0 y suspende a cualquier distancia: «8,004» para 8 se desvía 0,004, y escrito con
 * dos decimales decía a la vez «No es correcto» y «Te has desviado 0». `formatear` es el de la
 * app, para no cambiar su formato; solo recibe más decimales si los pedidos redondean a 0.
 */
export function textoDesviacion(
  diferencia: number,
  decimales: number,
  formatear: (n: number, decimales: number) => string,
): string {
  let d = decimales;
  while (diferencia > 0 && d < 12 && redondearA(diferencia, d) === 0) d += 1;
  // ⚠️ 23/10/2026 (hallazgo 3445) — se formatea la diferencia YA redondeada con `redondearA`, la
  // misma que ha elegido los decimales. Antes se pasaba en bruto: |25,005 − 25| = 0,004999999999999005
  // se limpiaba a 0,005 y se quedaba en 2 decimales, pero el formateador recibía el valor sucio y
  // lo redondeaba a «0,00»: otra vez «No es correcto. Te has desviado 0,00».
  return formatear(Number.isFinite(diferencia) ? redondearA(diferencia, d) : diferencia, d);
}

/* ─────────────────────────────── Dominio ─────────────────────────────── */

/**
 * Qué cosa es la respuesta. Decide qué valores son IMPOSIBLES, no solo imprecisos:
 *
 *   'real'         sin restricción: longitudes, energías, términos de una sucesión, tan θ…
 *   'entero'       un entero con signo: la raíz entera de un polinomio, Δn con coeficientes enteros
 *   'recuento'     un entero ≥ 0: individuos, bacterias, butacas, gametos, el número de semana
 *   'porcentaje'   de 0 a 100: la parte de una descendencia, una probabilidad en %
 *   'seno-coseno'  de −1 a 1
 *   { entero, minimo, maximo, que }   un intervalo propio, como el cuadrante (entero de 1 a 4)
 *
 * La elige quien escribe el caso leyendo el enunciado, no la etiqueta: «Mediana, en libros»
 * es 'real' (con n par sale 6,5) y «Moda, en libros» es 'recuento' (es uno de los datos).
 */
export type Magnitud =
  | 'real'
  | 'entero'
  | 'recuento'
  | 'porcentaje'
  | 'seno-coseno'
  | MagnitudAcotada;

export interface MagnitudAcotada {
  entero: boolean;
  minimo: number;
  maximo: number;
  /** Cómo se nombra en el aviso: «el número de cuadrante». */
  que: string;
}

/**
 * El motivo por el que `valor` no puede ser la respuesta, o null si es posible. Se mira ANTES
 * que la tolerancia: un «101 %» no está cerca de 100, está fuera de lo que existe.
 */
export function fueraDeDominio(valor: number, magnitud: Magnitud): string | null {
  if (!Number.isFinite(valor)) return null;
  switch (magnitud) {
    case 'real':
      return null;
    case 'entero':
      return Number.isInteger(valor) ? null : 'La respuesta es un número entero: no lleva decimales.';
    case 'recuento':
      if (valor < 0) return 'Es un recuento: no puede ser negativo.';
      return Number.isInteger(valor) ? null : 'Es un recuento: la respuesta es un número entero, sin decimales.';
    case 'porcentaje':
      if (valor < 0) return 'Un porcentaje no puede ser negativo.';
      // Espacio duro antes del %, para que no salte solo de línea (CLAUDE.md global §2).
      return valor > 100 ? 'Un porcentaje no puede pasar del 100 %: repasa la cuenta.' : null;
    case 'seno-coseno':
      return Math.abs(valor) > 1 ? 'Un seno o un coseno nunca vale más de 1 ni menos de −1.' : null;
    default: {
      const { entero, minimo, maximo, que } = magnitud;
      if (entero && !Number.isInteger(valor)) return `${mayuscula(que)} es un número entero.`;
      if (valor < minimo || valor > maximo) return `${mayuscula(que)} va de ${minimo} a ${maximo}.`;
      return null;
    }
  }
}

function mayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* ─────────────────────────────── Corrector ─────────────────────────────── */

export type EstadoCorreccion = 'no-numerico' | 'imposible' | 'acierto' | 'fallo';

export interface Correccion {
  estado: EstadoCorreccion;
  /** |usuario − esperado|; NaN si no se pudo leer un número. */
  diferencia: number;
  tolerancia: number;
  /** El porqué de 'imposible', listo para enseñar; null en los demás estados. */
  motivoImposible: string | null;
}

export interface OpcionesCorreccion {
  tolerancia: number;
  /** Obligatoria a propósito: ver la cabecera (hallazgo 1207). */
  magnitud: Magnitud;
}

/**
 * El núcleo de cualquier `comprobarRespuesta` numérica: lee, descarta lo imposible y compara
 * con margen de ruido. La app traduce el estado a sus propios textos y añade sus diagnósticos.
 */
export function corregirNumero(usuario: number, esperado: number, opciones: OpcionesCorreccion): Correccion {
  const { tolerancia, magnitud } = opciones;
  if (!Number.isFinite(usuario)) {
    return { estado: 'no-numerico', diferencia: NaN, tolerancia, motivoImposible: null };
  }
  const diferencia = Math.abs(usuario - esperado);
  const imposible = fueraDeDominio(usuario, magnitud);
  if (imposible) return { estado: 'imposible', diferencia, tolerancia, motivoImposible: imposible };
  return {
    estado: dentroDeTolerancia(usuario, esperado, tolerancia) ? 'acierto' : 'fallo',
    diferencia,
    tolerancia,
    motivoImposible: null,
  };
}
