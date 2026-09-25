/**
 * Casos de aula del Simulador del Círculo Trigonométrico.
 *
 * Vive fuera de `page.tsx` a propósito: el build compila la vista sin comprobar si la
 * matemática está bien. Una página que sostenga que cos 120° = +0,5 compila exactamente
 * igual de limpia que la que dice −0,5, y el error solo se ve leyendo el número en
 * pantalla. Aquí no hay React, ni DOM, ni estado: solo funciones puras con entradas y
 * salidas que se comprueban a mano (sen 30° = 0,5 exacto, cos 120° = −0,5, tan(−45°) = −1,
 * 5π/6 rad = 150°), que es como se verifican.
 *
 * ============================================================================
 * EL CONVENIO DE ESTA APP — cinco decisiones que el Inspector ya dejó cerradas
 * ============================================================================
 *
 * Este módulo es la ÚNICA implementación de la aritmética de la página: `page.tsx`
 * importa de aquí `gradosARadianes`, `radianesAGrados`, `redondear`, `formatearNumero`,
 * `signoDe`, `obtenerCuadrante` y `calcularTangente`, que antes vivían dentro del
 * componente. Con dos copias, los casos podrían corregir con un convenio y el panel de
 * valores mostrar otro: la app suspendería una respuesta que ella misma produce. Es el
 * peor fallo posible aquí, y solo se evita teniendo una sola cuenta.
 *
 * 1. GRADOS. Todo lo público de este módulo habla en grados, porque en grados están los
 *    enunciados de secundaria y en grados está el ángulo interno del simulador. La
 *    conversión a radianes —que es lo que esperan `Math.sin` y compañía— es explícita y
 *    está en un solo sitio: `gradosARadianes`. El error clásico, pasarle 30 a `Math.sin`
 *    y obtener −0,988, no se ve leyendo el código, sino comprobando que sen 30° = 0,5.
 *
 * 2. REDONDEO A 4 DECIMALES, SUMANDO 0. `Math.cos(270°)` no da 0 sino −1,84·10⁻¹⁶, y
 *    `Math.sin(360°)` da −2,45·10⁻¹⁶. A cuatro decimales son cero, pero conservan el
 *    signo: el panel escribía «−0,0000» donde su propia tabla dice 0 (hallazgos 350 y
 *    351). Sumar 0 normaliza el −0 de JavaScript, que es lo único que distingue
 *    «−0,0000» de «0,0000». Por eso `resolverCaso` devuelve SIEMPRE el valor ya pasado
 *    por `redondear`: la respuesta que se corrige es la misma cifra que el panel enseña.
 *
 * 3. EL CERO NO TIENE SIGNO. `signoDe` devuelve «0 · sin signo», no «+» ni «−». Hay
 *    cinco ángulos notables donde una razón vale cero exacto, y decidirlo con
 *    `valor >= 0` sobre el residuo binario daba tres respuestas distintas para el mismo
 *    cero (hallazgo 351).
 *
 * 4. LOS EJES NO PERTENECEN A NINGÚN CUADRANTE. `obtenerCuadrante` rotula «—» en 0, 90,
 *    180, 270 y 360, y `cuadranteNumerico` —que es la que corrige el caso 4— devuelve 0
 *    ahí, derivándolo de la misma función para que no puedan discrepar. Ningún caso
 *    numerado pregunta por el cuadrante de un ángulo sobre un eje: no tendría respuesta.
 *
 * 5. LA TANGENTE INDEFINIDA SE DICE, NO SE APROXIMA. Si |cos θ| < 1e-10,
 *    `calcularTangente` devuelve «∞» y `resolverCaso` devuelve `ok: false`. NUNCA un
 *    número: `Math.tan(π/2)` da 1,6·10¹⁶, que es finito y al que `Number.isFinite`
 *    dejaría pasar como resultado válido. Por eso no hay ningún caso que pida la
 *    tangente de 90° ni de 270°.
 *
 * Y una regla de forma: NADA lanza excepciones. Un dato imposible devuelve NaN o
 * `{ ok: false, error }` con el motivo redactado para quien lo lee; un `throw` dentro de
 * un render de React tumba la página entera.
 *
 * Los 12 casos se CALCULAN a partir de sus datos: ninguna respuesta está tecleada a
 * mano. Un caso con la solución escrita puede contradecir a la fórmula sin que nada se
 * queje, y eso rompería justo lo que hace útil el modo de aula: que «resuelve el 3, el 7
 * y el 11» signifique lo mismo para toda la clase.
 */

import { formatNumber } from '@/lib';

// ============================================================
// TIPOS
// ============================================================

/**
 * Qué se pregunta en un caso, y con ello qué significan sus `datos`:
 *
 * - `seno` · `coseno` · `tangente`   → razón del ángulo (sin unidad)
 * - `radianes`                        → el ángulo, expresado en radianes
 * - `grados`                          → el ángulo que el enunciado da en radianes, en grados
 * - `cuadrante`                       → número de cuadrante, 1 a 4 (nunca sobre un eje)
 * - `angulo-referencia`               → ángulo agudo con el eje horizontal, en grados
 * - `coseno-por-identidad`            → cos θ a partir de sen θ (`longitud`) con sen²+cos²=1
 * - `altura-tangente`                 → `longitud` (distancia) · tan θ
 * - `sombra-tangente`                 → `longitud` (altura) / tan θ
 * - `proyeccion-seno`                 → `longitud` (radio) · sen θ
 * - `proyeccion-coseno`               → `longitud` (amplitud) · cos θ
 */
export type MagnitudCaso =
  | 'seno'
  | 'coseno'
  | 'tangente'
  | 'radianes'
  | 'grados'
  | 'cuadrante'
  | 'angulo-referencia'
  | 'coseno-por-identidad'
  | 'altura-tangente'
  | 'sombra-tangente'
  | 'proyeccion-seno'
  | 'proyeccion-coseno';

/**
 * Datos de un caso. Una sola forma para todas las magnitudes, a propósito: una unión
 * discriminada obliga a un `switch` que, si se queda corto, devuelve `undefined` en
 * pantalla y compila igual.
 */
export interface DatosCaso {
  /** Ángulo SIEMPRE en grados (convenio 1). El simulador admite de −360° a 720°. */
  angulo: number;
  /** Qué se pide. */
  magnitud: MagnitudCaso;
  /** Longitud auxiliar en las magnitudes que la necesitan (distancia, radio, amplitud, seno dado). */
  longitud?: number;
}

/** Resultado de resolver un caso, con el razonamiento ya redactado. */
export interface SolucionCaso {
  ok: boolean;
  /** Valor YA redondeado al convenio de la app (4 decimales, sin −0). NaN si `ok` es false. */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Un caso numerado, con su solución calculada desde `datos`. */
export interface Caso {
  /** 1..12, sin huecos: es el número que el profesor dicta en clase. */
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  /** Qué se escribe en la casilla. NUNCA vacía: las razones llevan «sin unidad». */
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  /** true si el valor exacto tiene más de 2 decimales, para avisar del redondeo. */
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** Ejercicio del modo práctica: misma forma que un caso, pero sin número fijo. */
export interface EjercicioAleatorio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** Veredicto de comprobar lo que alguien ha tecleado. */
export interface Comprobacion {
  correcto: boolean;
  motivo: 'acertado' | 'fallado' | 'no-numerico';
  diferencia: number;
  tolerancia: number;
}

// ============================================================
// NÚCLEO COMPARTIDO CON LA VISTA
// Estas siete funciones vivían dentro de `page.tsx`. Se mudaron aquí SIN cambiarlas,
// y la página las importa: una sola implementación para el panel y para los casos.
// ============================================================

export function gradosARadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

export function radianesAGrados(radianes: number): number {
  // Sin redondear: 1 rad son 57,2958°, y quedarse en 57° cambia el seno de 0,8415 a 0,8387.
  // El ángulo interno de la app está en grados, así que este es el único punto donde la
  // conversión puede perder precisión.
  return (radianes * 180) / Math.PI;
}

/**
 * Redondea a la precisión que la app muestra y mata el residuo de coma flotante.
 *
 * `Math.cos(270°)` no da 0 sino −1,84·10⁻¹⁶, y `Math.sin(360°)` da −2,45·10⁻¹⁶. Esos
 * residuos son CERO a cuatro decimales, pero conservan el signo: el panel escribía
 * «−0,0000» donde la tabla del propio bloque educativo dice «270 · cos 0» (hallazgo 350), y
 * el panel de signos los calificaba de negativos (hallazgo 351). Sumar 0 normaliza el −0 de
 * JavaScript, que es lo único que distingue «−0,0000» de «0,0000».
 */
export function redondear(n: number, decimales = 4): number {
  const factor = Math.pow(10, decimales);
  return Math.round(n * factor) / factor + 0;
}

/**
 * Número con los decimales fijos del panel, en formato español COMPLETO: coma decimal y
 * punto de millares. Con `toFixed().replace()` una tangente grande salía «-272241,8084», sin
 * separador de millares (hallazgo 1619). `redondear` va antes para no enseñar «-0,0000».
 */
export function formatearNumero(n: number, decimales = 4): string {
  return formatNumber(redondear(n, decimales), decimales);
}

/**
 * Un ángulo en grados, con coma, como mucho 4 decimales y el símbolo PEGADO a la cifra.
 *
 * Se imprimía en crudo (`${angulo}°`): «36.8699°» tras «Ver 36,87° en el círculo»,
 * «57.29577951308232°» con 1 rad, «36.3°» durante la animación (hallazgo 1619).
 */
export function formatearGrados(anguloGrados: number): string {
  return `${formatearRespuesta(anguloGrados)}°`;
}

/**
 * Signo de una razón trigonométrica A LA PRECISIÓN QUE SE MUESTRA.
 *
 * Cero no es positivo ni negativo, y hay cinco ángulos notables donde una de las razones
 * vale cero exacto. Decidirlo con `valor >= 0` sobre el residuo de coma flotante daba tres
 * respuestas distintas para el mismo 0: «−» en cos 270 y en sen 360, «+» en 0, 90 y 180
 * (hallazgo 351). La app ya sabe que esos ángulos son especiales — su indicador de Cuadrante
 * los rotula «—» — así que aquí se dice lo mismo: cero, sin signo.
 */
export function signoDe(valor: number): { texto: string; clase: 'pos' | 'neg' | 'cero' } {
  const v = redondear(valor);
  if (v === 0) return { texto: '0 · sin signo', clase: 'cero' };
  return v > 0 ? { texto: '+ (positivo)', clase: 'pos' } : { texto: '− (negativo)', clase: 'neg' };
}

export function obtenerCuadrante(angulo: number): string {
  const a = ((angulo % 360) + 360) % 360;
  if (a === 0 || a === 90 || a === 180 || a === 270 || a === 360) return '—';
  if (a < 90) return 'I';
  if (a < 180) return 'II';
  if (a < 270) return 'III';
  return 'IV';
}

export function calcularTangente(angulo: number): string {
  const rad = gradosARadianes(angulo);
  const cosVal = Math.cos(rad);
  if (Math.abs(cosVal) < 1e-10) return '∞';
  const tanVal = Math.tan(rad);
  return formatearNumero(tanVal);
}

// ============================================================
// AUXILIARES DE LOS CASOS
// ============================================================

/** Etiqueta de las razones trigonométricas: un cociente de dos longitudes no tiene unidad. */
export const UNIDAD_RAZON = 'sin unidad';

/** Etiqueta del caso de cuadrante: la respuesta es el número, no el romano. */
export const UNIDAD_CUADRANTE = 'número de cuadrante, de 1 a 4';

/**
 * Formatea un resultado con los decimales que de verdad necesita, hasta un máximo.
 * Así sen 30° se escribe «0,5» y no «0,5000», pero 17,3205 conserva su precisión.
 */
export function formatearRespuesta(valor: number, maxDecimales = 4): string {
  if (!Number.isFinite(valor)) return 'no definido';
  for (let d = 0; d < maxDecimales; d++) {
    if (Math.abs(valor - redondear(valor, d)) < 1e-9) return formatNumber(valor, d);
  }
  return formatNumber(valor, maxDecimales);
}

/** Une un número con su unidad, sin dejar «0,5 sin unidad» dentro de una frase. */
export function conUnidad(texto: string, etiqueta: string): string {
  if (etiqueta === UNIDAD_RAZON) return texto;
  if (etiqueta === UNIDAD_CUADRANTE) return `cuadrante ${texto}`;
  // El símbolo de grado de un ángulo va pegado a la cifra (RAE), como en el resto de la app:
  // el veredicto escribía «Correcto: 30 °.» junto a enunciados que dicen «30°» (hallazgo 1619).
  if (etiqueta === '°') return `${texto}°`;
  return `${texto} ${etiqueta}`;
}

/** El ángulo equivalente dentro de [0°, 360°): lo que queda tras quitar las vueltas enteras. */
export function anguloEquivalente(anguloGrados: number): number {
  if (!Number.isFinite(anguloGrados)) return NaN;
  return redondear(((anguloGrados % 360) + 360) % 360);
}

/**
 * Cuadrante como NÚMERO (1 a 4), o 0 si el ángulo cae sobre un eje.
 *
 * Se deriva de `obtenerCuadrante`, la misma función que rotula el panel, para que la
 * corrección del caso 4 y lo que la app muestra no puedan decir cosas distintas.
 */
export function cuadranteNumerico(anguloGrados: number): number {
  const romanos: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4 };
  return romanos[obtenerCuadrante(anguloGrados)] ?? 0;
}

/**
 * Ángulo de referencia: el ángulo AGUDO que el lado terminal forma con el eje horizontal.
 * Es lo que permite reducir cualquier ángulo al primer cuadrante y ponerle luego el signo.
 */
export function anguloDeReferencia(anguloGrados: number): number {
  const a = anguloEquivalente(anguloGrados);
  if (!Number.isFinite(a)) return NaN;
  if (a <= 90) return redondear(a);
  if (a <= 180) return redondear(180 - a);
  if (a <= 270) return redondear(a - 180);
  return redondear(360 - a);
}

/** ¿Existe la tangente en este ángulo? Falso en 90° + k·180°, donde el coseno se anula. */
export function tangenteExiste(anguloGrados: number): boolean {
  if (!Number.isFinite(anguloGrados)) return false;
  return Math.abs(Math.cos(gradosARadianes(anguloGrados))) >= 1e-10;
}

// ============================================================
// MOTOR: RESOLVER UN CASO
// ============================================================

const ERROR_DATOS =
  'Faltan datos o no son números. Un caso necesita un ángulo en grados y, si es una situación real, su longitud.';
const ERROR_LONGITUD =
  'La longitud del enunciado (distancia, radio o amplitud) tiene que ser un número mayor que cero.';
const ERROR_TANGENTE =
  'La tangente no existe en 90° ni en 270°: el coseno vale cero y no se puede dividir entre cero. En esos ángulos el simulador escribe ∞.';
const ERROR_EJE =
  'Ese ángulo cae sobre un eje (0°, 90°, 180°, 270° o 360°) y no pertenece a ningún cuadrante: el simulador lo rotula «—».';
const ERROR_SOMBRA =
  'Con el sol en el horizonte o en la vertical la sombra no se puede calcular: haría falta dividir entre cero.';
const ERROR_SENO_DADO =
  'El seno de un ángulo está siempre entre −1 y 1: con un valor fuera de ese rango la identidad no tiene solución.';

/** Una longitud real: número finito y positivo. */
function longitudValida(valor: number | undefined): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0;
}

/**
 * Resuelve un caso desde sus `datos` y devuelve TAMBIÉN el razonamiento.
 *
 * Es la única puerta de entrada: el número que se corrige y el número que se explica
 * salen de la misma cuenta, así que no pueden discrepar. El valor sale ya redondeado al
 * convenio de la app (4 decimales, sin −0).
 */
export function resolverCaso(datos: DatosCaso): SolucionCaso {
  const fallo = (error: string): SolucionCaso => ({ ok: false, valor: NaN, pasos: [], error });

  // Se lee con `?.` a propósito: los tipos garantizan que `datos` existe, pero este
  // módulo no puede lanzar una excepción dentro de un render, y un objeto a medias
  // llegado por cualquier vía tiene que salir por `ok: false`, no por una pantalla rota.
  const angulo = datos?.angulo ?? NaN;
  const magnitud = datos?.magnitud;
  const longitud = datos?.longitud;
  if (!Number.isFinite(angulo)) return fallo(ERROR_DATOS);

  const rad = gradosARadianes(angulo);
  const equivalente = anguloEquivalente(angulo);
  const anguloTexto = formatearRespuesta(angulo);
  const equivalenteTexto = formatearRespuesta(equivalente);
  const cuadranteTexto = obtenerCuadrante(angulo);

  /** Frase que explica la reducción cuando el ángulo se sale de la primera vuelta. */
  const pasoVuelta =
    angulo < 0
      ? `${anguloTexto}° es negativo: se gira en sentido HORARIO, y el lado terminal cae donde el de ${equivalenteTexto}°. Las razones de los dos ángulos son idénticas.`
      : angulo >= 360
        ? `${anguloTexto}° pasa de una vuelta completa: ${anguloTexto}° − 360° = ${equivalenteTexto}°. Cada vuelta entera devuelve el radio al mismo sitio, así que las razones se repiten.`
        : '';

  switch (magnitud) {
    case 'seno':
    case 'coseno': {
      const esSeno = magnitud === 'seno';
      const nombre = esSeno ? 'sen' : 'cos';
      const valor = redondear(esSeno ? Math.sin(rad) : Math.cos(rad));
      const coordenada = esSeno ? 'vertical (la Y)' : 'horizontal (la X)';
      const pasos = [
        `Sitúa ${anguloTexto}° en el círculo unitario: se mide desde el semieje X positivo y en sentido antihorario.`,
        `El punto donde el radio corta la circunferencia tiene coordenadas (cos θ, sen θ), y el radio siempre mide 1.`,
        `${nombre} θ es la coordenada ${coordenada} de ese punto.`,
        cuadranteTexto === '—'
          ? `${equivalenteTexto}° cae sobre un eje, así que una de las dos coordenadas vale 0 exacto.`
          : `${equivalenteTexto}° está en el cuadrante ${cuadranteTexto}, y ahí ${nombre} es ${signoDe(valor).clase === 'neg' ? 'NEGATIVO' : 'positivo'}.`,
        `${nombre} ${anguloTexto}° = ${formatearRespuesta(valor)}`,
      ];
      if (pasoVuelta) pasos.splice(1, 0, pasoVuelta);
      return { ok: true, valor, pasos };
    }

    case 'tangente': {
      if (!tangenteExiste(angulo)) return fallo(ERROR_TANGENTE);
      const valor = redondear(Math.tan(rad));
      const sen = redondear(Math.sin(rad));
      const cos = redondear(Math.cos(rad));
      const pasos = [
        'La tangente no es una coordenada del punto: es el cociente de las dos, tan θ = sen θ / cos θ.',
        `sen ${anguloTexto}° = ${formatearRespuesta(sen)} y cos ${anguloTexto}° = ${formatearRespuesta(cos)}.`,
        `tan ${anguloTexto}° = ${formatearRespuesta(sen)} / ${formatearRespuesta(cos)} = ${formatearRespuesta(valor)}`,
        'Comprobación de signo: la tangente es positiva en los cuadrantes I y III (seno y coseno con el mismo signo) y negativa en el II y el IV.',
      ];
      if (pasoVuelta) pasos.splice(1, 0, pasoVuelta);
      return { ok: true, valor, pasos };
    }

    case 'radianes': {
      const valor = redondear(gradosARadianes(angulo));
      return {
        ok: true,
        valor,
        pasos: [
          'Una vuelta completa son 360° y también 2π radianes, así que 180° = π rad.',
          'De ahí sale el factor de conversión: multiplicar por π/180 pasa de grados a radianes.',
          `${anguloTexto}° · π / 180 = ${formatearRespuesta(valor)} rad`,
          `Como referencia, π vale ${formatearRespuesta(Math.PI)} y 1 rad son ${formatearRespuesta(radianesAGrados(1), 2)}°.`,
        ],
      };
    }

    case 'grados': {
      // El enunciado da el ángulo en radianes y pide los grados. Aquí el dato llega en
      // grados (convenio 1), así que el valor recorre las DOS conversiones: si una dejara
      // de ser la inversa de la otra, el resultado dejaría de cuadrar con el enunciado.
      const enRadianes = gradosARadianes(angulo);
      const valor = redondear(radianesAGrados(enRadianes));
      return {
        ok: true,
        valor,
        pasos: [
          'Si 180° = π rad, para volver a grados se multiplica por 180/π.',
          `El ángulo del enunciado vale ${formatearRespuesta(enRadianes)} rad.`,
          `${formatearRespuesta(enRadianes)} rad · 180 / π = ${formatearRespuesta(valor)}°`,
          'Atajo para comprobarlo de cabeza: en una fracción de π, basta sustituir π por 180°.',
        ],
      };
    }

    case 'cuadrante': {
      const numero = cuadranteNumerico(angulo);
      if (numero === 0) return fallo(ERROR_EJE);
      const pasos = [
        `Primero se reduce el ángulo a la primera vuelta: ${anguloTexto}° equivale a ${equivalenteTexto}°.`,
        'Los cuadrantes se cuentan en sentido antihorario: I de 0° a 90°, II de 90° a 180°, III de 180° a 270° y IV de 270° a 360°.',
        `${equivalenteTexto}° cae en el cuadrante ${cuadranteTexto}, es decir, el número ${numero}.`,
        'Los ejes (0°, 90°, 180°, 270° y 360°) no pertenecen a ningún cuadrante: el simulador los rotula «—».',
      ];
      return { ok: true, valor: numero, pasos };
    }

    case 'angulo-referencia': {
      const valor = anguloDeReferencia(angulo);
      if (!Number.isFinite(valor)) return fallo(ERROR_DATOS);
      const numero = cuadranteNumerico(angulo);
      const regla =
        numero === 1
          ? 'En el cuadrante I el ángulo de referencia es el propio ángulo.'
          : numero === 2
            ? `En el cuadrante II se resta de 180°: 180° − ${equivalenteTexto}°.`
            : numero === 3
              ? `En el cuadrante III se le resta 180°: ${equivalenteTexto}° − 180°.`
              : numero === 4
                ? `En el cuadrante IV se resta de 360°: 360° − ${equivalenteTexto}°.`
                : 'Sobre un eje el ángulo de referencia es 0° o 90°, según el eje.';
      return {
        ok: true,
        valor,
        pasos: [
          `Se reduce a la primera vuelta: ${anguloTexto}° equivale a ${equivalenteTexto}°, en el cuadrante ${cuadranteTexto}.`,
          'El ángulo de referencia es el ángulo AGUDO que el lado terminal forma con el eje horizontal, nunca con el vertical.',
          regla,
          `Ángulo de referencia = ${formatearRespuesta(valor)}°`,
          'Con él, la razón del ángulo grande es la del pequeño con el signo que le toque al cuadrante.',
        ],
      };
    }

    case 'coseno-por-identidad': {
      if (longitud === undefined || !Number.isFinite(longitud)) return fallo(ERROR_DATOS);
      if (Math.abs(longitud) > 1) return fallo(ERROR_SENO_DADO);
      const senoDado = longitud;
      // El signo lo decide el cuadrante del ángulo: la identidad sola da el valor absoluto.
      const signo = Math.cos(rad) >= 0 ? 1 : -1;
      const valor = redondear(signo * Math.sqrt(1 - senoDado * senoDado));
      return {
        ok: true,
        valor,
        pasos: [
          'El punto (cos θ, sen θ) está sobre una circunferencia de radio 1, y Pitágoras da la identidad fundamental: sen²θ + cos²θ = 1.',
          `Sustituimos el dato: ${formatearRespuesta(senoDado)}² + cos²θ = 1`,
          `cos²θ = 1 − ${formatearRespuesta(senoDado * senoDado)} = ${formatearRespuesta(1 - senoDado * senoDado)}`,
          `cos θ = ${signo < 0 ? '−' : ''}√${formatearRespuesta(1 - senoDado * senoDado)} = ${formatearRespuesta(valor)}`,
          `La raíz tiene dos signos; lo decide el cuadrante: en el ${cuadranteTexto === '—' ? 'eje' : cuadranteTexto} el coseno es ${signo < 0 ? 'negativo' : 'positivo'}.`,
        ],
      };
    }

    case 'altura-tangente': {
      if (!longitudValida(longitud)) return fallo(ERROR_LONGITUD);
      if (!tangenteExiste(angulo)) return fallo(ERROR_TANGENTE);
      const tan = redondear(Math.tan(rad));
      const valor = redondear(longitud * Math.tan(rad));
      return {
        ok: true,
        valor,
        pasos: [
          'La distancia en el suelo y la altura son los dos catetos de un triángulo rectángulo, y la razón que los une es la tangente.',
          `tan θ = altura / distancia, así que altura = distancia · tan θ.`,
          `tan ${anguloTexto}° = ${formatearRespuesta(tan)}`,
          `altura = ${formatearRespuesta(longitud)} · ${formatearRespuesta(tan)} = ${formatearRespuesta(valor)}`,
        ],
      };
    }

    case 'sombra-tangente': {
      if (!longitudValida(longitud)) return fallo(ERROR_LONGITUD);
      if (!tangenteExiste(angulo)) return fallo(ERROR_TANGENTE);
      const tan = redondear(Math.tan(rad));
      if (tan === 0) return fallo(ERROR_SOMBRA);
      const valor = redondear(longitud / Math.tan(rad));
      return {
        ok: true,
        valor,
        pasos: [
          'La altura del objeto y su sombra son los dos catetos: la altura es el cateto opuesto al ángulo del sol y la sombra, el adyacente.',
          'tan θ = altura / sombra, y despejando: sombra = altura / tan θ.',
          `tan ${anguloTexto}° = ${formatearRespuesta(tan)}`,
          `sombra = ${formatearRespuesta(longitud)} / ${formatearRespuesta(tan)} = ${formatearRespuesta(valor)}`,
          'Cuanto más alto está el sol, mayor es la tangente y más corta sale la sombra.',
        ],
      };
    }

    case 'proyeccion-seno': {
      if (!longitudValida(longitud)) return fallo(ERROR_LONGITUD);
      const sen = redondear(Math.sin(rad));
      const valor = redondear(longitud * Math.sin(rad));
      const pasos = [
        'Un punto que gira sobre una circunferencia de radio r tiene coordenadas (r · cos θ, r · sen θ): son las del círculo unitario multiplicadas por el radio.',
        `La altura sobre el centro es la coordenada vertical: altura = r · sen θ.`,
        `sen ${anguloTexto}° = ${formatearRespuesta(sen)}`,
        `altura = ${formatearRespuesta(longitud)} · ${formatearRespuesta(sen)} = ${formatearRespuesta(valor)}`,
      ];
      if (pasoVuelta) pasos.splice(1, 0, pasoVuelta);
      return { ok: true, valor, pasos };
    }

    case 'proyeccion-coseno': {
      if (!longitudValida(longitud)) return fallo(ERROR_LONGITUD);
      const cos = redondear(Math.cos(rad));
      const valor = redondear(longitud * Math.cos(rad));
      const pasos = [
        'La proyección horizontal de un giro de amplitud A vale A · cos θ: es exactamente el coseno del círculo unitario, estirado hasta A.',
        `cos ${anguloTexto}° = ${formatearRespuesta(cos)}`,
        `valor = ${formatearRespuesta(longitud)} · ${formatearRespuesta(cos)} = ${formatearRespuesta(valor)}`,
        'El signo indica el lado: negativo significa que está al otro lado del punto de equilibrio, no que la magnitud sea menor.',
      ];
      if (pasoVuelta) pasos.splice(1, 0, pasoVuelta);
      return { ok: true, valor, pasos };
    }

    default:
      return fallo(ERROR_DATOS);
  }
}

// ============================================================
// COMPROBACIÓN DE RESPUESTAS
// ============================================================

/**
 * Tolerancia de corrección: la MAYOR entre ±0,01 y el 1 % del valor esperado.
 *
 * El mínimo absoluto evita castigar el redondeo en respuestas pequeñas (0,71 frente a
 * 0,7071) y el porcentaje evita ser absurdamente estricto en las grandes.
 */
export function toleranciaDe(valorEsperado: number): number {
  return Math.max(0.01, Math.abs(valorEsperado) * 0.01);
}

/**
 * Compara lo tecleado con lo esperado. Lo que no es un número NO se corrige: se
 * distingue con el motivo `no-numerico`, para que la vista pueda decirlo con sus
 * palabras en vez de escribir «NaN» en pantalla.
 */
export function comprobarRespuesta(valorUsuario: number, valorEsperado: number): Comprobacion {
  const tolerancia = toleranciaDe(valorEsperado);
  if (!Number.isFinite(valorUsuario) || !Number.isFinite(valorEsperado)) {
    return { correcto: false, motivo: 'no-numerico', diferencia: NaN, tolerancia };
  }
  const diferencia = Math.abs(valorUsuario - valorEsperado);
  /**
   * ⚠️ 22/09/2026 (hallazgo 1211, medido en simulador-movimiento-circular) — la comparación en
   * el borde EXACTO decidía por el ±1 ulp de la resta en binario, así que la misma desviación
   * se aceptaba por arriba y se rechazaba por abajo: con esperado 0,1 y tolerancia 0,01, «0,11»
   * daba 0,009999999999999995 (dentro) y «0,09» daba 0,010000000000000009 (fuera). El margen de
   * 1e-9 absorbe el ruido sin cambiar ninguna decisión real: está nueve órdenes por encima del
   * ulp de estas cifras y siete por debajo de la tolerancia más pequeña (0,01).
   */
  const RUIDO_BINARIO = 1e-9;
  const correcto = diferencia <= tolerancia + RUIDO_BINARIO;
  return { correcto, motivo: correcto ? 'acertado' : 'fallado', diferencia, tolerancia };
}

/** Redacta el veredicto. Vive aquí porque es texto derivado del cálculo, no maquetación. */
export function textoVeredicto(
  veredicto: Comprobacion,
  respuestaTexto: string,
  etiquetaRespuesta: string,
): string {
  if (veredicto.motivo === 'no-numerico') {
    return 'Escribe un número en la casilla (se admite la coma decimal, y el signo menos delante si la respuesta es negativa).';
  }
  if (veredicto.correcto) {
    return `Correcto: ${conUnidad(respuestaTexto, etiquetaRespuesta)}.`;
  }
  return `Todavía no. La respuesta es ${conUnidad(respuestaTexto, etiquetaRespuesta)}; te has quedado a ${formatNumber(veredicto.diferencia, 4)} y se admite hasta ${formatNumber(veredicto.tolerancia, 4)}. Despliega la solución para ver dónde se tuerce.`;
}

// ============================================================
// LOS 12 CASOS NUMERADOS
// ============================================================

/** Definición de un caso: solo los DATOS. La respuesta y los pasos los pone el motor. */
interface DefinicionCaso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  pista: string;
}

/**
 * Ángulo cuyo seno vale 0,6, en el primer cuadrante. Se CALCULA en vez de teclear
 * 36,8699: así el caso 8 sigue cuadrando aunque se cambie el seno del enunciado.
 */
const ANGULO_SENO_06 = radianesAGrados(Math.asin(0.6));

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    id: 1,
    titulo: 'La razón que sale exacta',
    enunciado:
      '¿Cuánto vale sen 30°? Escribe el resultado como número decimal, no como fracción.',
    categoria: 'abstracto',
    datos: { angulo: 30, magnitud: 'seno' },
    etiquetaRespuesta: UNIDAD_RAZON,
    pista:
      'El seno es la coordenada VERTICAL del punto. Lleva el simulador a 30° y lee la altura a la que queda el punto sobre el eje horizontal.',
  },
  {
    id: 2,
    titulo: 'El signo lo pone el cuadrante',
    enunciado:
      '¿Cuánto vale cos 120°? Mira en qué cuadrante cae el ángulo antes de decidir el signo.',
    categoria: 'abstracto',
    datos: { angulo: 120, magnitud: 'coseno' },
    etiquetaRespuesta: UNIDAD_RAZON,
    pista:
      'El coseno es la coordenada horizontal. En el segundo cuadrante el punto está a la IZQUIERDA del eje vertical, así que esa coordenada es negativa.',
  },
  {
    id: 3,
    titulo: 'Un ángulo que gira al revés',
    enunciado:
      '¿Cuánto vale tan(−45°)? Un ángulo negativo se mide girando en sentido horario.',
    categoria: 'abstracto',
    datos: { angulo: -45, magnitud: 'tangente' },
    etiquetaRespuesta: UNIDAD_RAZON,
    pista:
      'tan θ = sen θ / cos θ. En −45° el punto está por debajo del eje horizontal y a su derecha: una coordenada negativa dividida entre una positiva.',
  },
  {
    id: 4,
    titulo: 'Dónde cae el lado terminal',
    enunciado:
      '¿En qué cuadrante está el lado terminal de un ángulo de 200°? Escribe el NÚMERO del cuadrante (1, 2, 3 o 4), no el número romano.',
    categoria: 'abstracto',
    datos: { angulo: 200, magnitud: 'cuadrante' },
    etiquetaRespuesta: UNIDAD_CUADRANTE,
    pista:
      'Los cuadrantes se numeran en sentido antihorario y cada uno abarca 90°. 200° ya ha pasado de 180°, pero no llega a 270°.',
  },
  {
    id: 5,
    titulo: 'El ángulo pequeño que lo resuelve todo',
    enunciado:
      '¿Cuál es el ángulo de referencia de 210°? Es el ángulo agudo que su lado terminal forma con el eje horizontal.',
    categoria: 'abstracto',
    datos: { angulo: 210, magnitud: 'angulo-referencia' },
    etiquetaRespuesta: '°',
    pista:
      '210° está en el tercer cuadrante, justo 30° pasado el eje horizontal negativo. Con el eje HORIZONTAL, nunca con el vertical.',
  },
  {
    id: 6,
    titulo: 'De grados a radianes',
    enunciado:
      'Expresa 225° en radianes. Escribe el valor decimal redondeado a 2 decimales, no la fracción con π.',
    categoria: 'abstracto',
    datos: { angulo: 225, magnitud: 'radianes' },
    etiquetaRespuesta: 'rad',
    pista:
      'Media vuelta son 180° y también π rad. El factor es π/180, y π vale aproximadamente 3,1416.',
  },
  {
    id: 7,
    titulo: 'De radianes a grados',
    enunciado:
      'Un ángulo mide 5π/6 radianes. ¿Cuántos grados son? Escribe el resultado en grados.',
    categoria: 'abstracto',
    datos: { angulo: 150, magnitud: 'grados' },
    etiquetaRespuesta: '°',
    pista:
      'En una fracción con π, sustituye π por 180°: 5 · 180° / 6. Se puede hacer de cabeza, sin calculadora.',
  },
  {
    id: 8,
    titulo: 'La identidad que rescata el coseno',
    enunciado:
      'Un ángulo del primer cuadrante cumple sen θ = 0,6. Usando sen²θ + cos²θ = 1, ¿cuánto vale cos θ?',
    categoria: 'abstracto',
    datos: { angulo: ANGULO_SENO_06, magnitud: 'coseno-por-identidad', longitud: 0.6 },
    etiquetaRespuesta: UNIDAD_RAZON,
    pista:
      'Despeja cos²θ = 1 − sen²θ y saca la raíz. La raíz tiene dos signos, pero en el primer cuadrante las dos coordenadas del punto son positivas.',
  },
  {
    id: 9,
    titulo: 'La altura de un edificio sin subir',
    enunciado:
      'Desde un punto del suelo situado a 30 m de la base de un edificio, su parte más alta se ve con un ángulo de elevación de 30°. ¿Qué altura tiene el edificio? Redondea a 2 decimales.',
    categoria: 'aplicado',
    datos: { angulo: 30, magnitud: 'altura-tangente', longitud: 30 },
    etiquetaRespuesta: 'm',
    pista:
      'Distancia y altura son los dos catetos del triángulo rectángulo, y la razón que relaciona dos catetos es la tangente.',
  },
  {
    id: 10,
    titulo: 'La sombra del poste',
    enunciado:
      'Un poste vertical de 6 m proyecta su sombra sobre el suelo horizontal cuando el sol está a 60° de elevación. ¿Cuánto mide la sombra? Redondea a 2 decimales.',
    categoria: 'aplicado',
    datos: { angulo: 60, magnitud: 'sombra-tangente', longitud: 6 },
    etiquetaRespuesta: 'm',
    pista:
      'Aquí la incógnita es el cateto de abajo: tan θ = altura / sombra, así que hay que DIVIDIR la altura entre la tangente.',
  },
  {
    id: 11,
    titulo: 'La cabina que ya dio una vuelta',
    enunciado:
      'Una noria (rueda de la fortuna) de 20 m de radio gira en sentido antihorario. Una cabina que arrancó en el extremo derecho del radio horizontal ha girado 390°. ¿A qué altura está por encima del eje de la noria?',
    categoria: 'aplicado',
    datos: { angulo: 390, magnitud: 'proyeccion-seno', longitud: 20 },
    etiquetaRespuesta: 'm',
    pista:
      '390° son una vuelta completa y 30° más: quita los 360° antes de calcular. La altura sobre el eje es el radio por el seno.',
  },
  {
    id: 12,
    titulo: 'El muelle al otro lado',
    enunciado:
      'Un muelle oscila con movimiento armónico simple de amplitud 8 cm: su elongación vale x = A · cos θ, donde θ es la fase. ¿Cuánto vale la elongación cuando la fase es 240°? La respuesta puede ser negativa.',
    categoria: 'aplicado',
    datos: { angulo: 240, magnitud: 'proyeccion-coseno', longitud: 8 },
    etiquetaRespuesta: 'cm',
    pista:
      'Es el coseno del círculo unitario estirado hasta 8 cm. En 240° el punto está a la izquierda del centro, así que el coseno es negativo.',
  },
];

/** Construye un caso resolviéndolo. Ninguna respuesta se teclea a mano. */
/**
 * Cómo se ENSEÑA una respuesta, que no es lo mismo que cómo se calcula.
 *
 * Cuando el enunciado pide «redondea a 2 decimales», la solución tiene que enseñar ESE
 * número y no otro: si el alumno escribe 17,32 porque se lo han pedido y al desplegar la
 * solución lee 17,3205, la app le está corrigiendo con un formato distinto del que exigió.
 * El valor con más cifras va detrás, entre paréntesis, porque saber que la cuenta no termina
 * ahí también forma parte de lo que se enseña.
 *
 * Vive aquí, en una sola función, porque la usan los doce casos fijos Y el ejercicio
 * aleatorio: si divergieran, el alumno entrenaría con un formato y sería corregido con otro.
 */
function presentarRespuesta(respuesta: number): {
  requiereRedondeo: boolean;
  respuestaTexto: string;
} {
  const requiereRedondeo =
    Number.isFinite(respuesta) && Math.abs(respuesta - redondear(respuesta, 2)) > 1e-9;
  return {
    requiereRedondeo,
    respuestaTexto: requiereRedondeo
      ? `${formatNumber(redondear(respuesta, 2), 2)} (sin redondear, ${formatearRespuesta(respuesta)})`
      : formatearRespuesta(respuesta),
  };
}

function construirCaso(def: DefinicionCaso): Caso {
  const solucion = resolverCaso(def.datos);
  const respuesta = solucion.valor;
  const { requiereRedondeo, respuestaTexto } = presentarRespuesta(respuesta);
  return {
    id: def.id,
    titulo: def.titulo,
    enunciado: def.enunciado,
    categoria: def.categoria,
    datos: def.datos,
    etiquetaRespuesta: def.etiquetaRespuesta,
    respuesta,
    respuestaTexto,
    requiereRedondeo,
    pasos: solucion.ok
      ? solucion.pasos
      : [solucion.error ?? 'Este caso no se ha podido resolver con los datos dados.'],
    pista: def.pista,
  };
}

/**
 * Los 12 casos, FIJOS y deterministas: el caso 3 es el mismo para cualquiera que abra
 * esta página, hoy y dentro de un año. Es lo único que hace que «resuelve los casos 3, 7
 * y 11» signifique lo mismo para toda la clase.
 */
export const CASOS: readonly Caso[] = DEFINICIONES.map(construirCaso);

/** Cuántos casos hay. Se deriva del array para que nunca discrepe del contador de la vista. */
export const TOTAL_CASOS = CASOS.length;

// ============================================================
// MODO PRÁCTICA: EJERCICIOS ALEATORIOS REPRODUCIBLES
// ============================================================

/**
 * Mezcla la semilla antes de usarla (splitmix32).
 *
 * REPRODUCIBLE NO ES VARIADO. Un xorshift32 sembrado con enteros pequeños y consecutivos
 * (1, 2, 3…) devuelve las primeras salidas casi idénticas, porque su estado apenas tiene
 * bits encendidos: se obtiene el MISMO ejercicio con todas las semillas y la prueba de
 * reproducibilidad pasa igual, porque comprueba que repetir la semilla repite el
 * ejercicio, no que semillas distintas den ejercicios distintos. Este paso enciende bits
 * en todo el ancho de la palabra antes de que el generador empiece.
 */
function mezclarSemilla(semilla: number): number {
  let x = (semilla + 0x9e3779b9) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  x = x ^ (x >>> 15);
  return x >>> 0;
}

/** Generador determinista (xorshift32) sobre la semilla YA mezclada. */
function creadorAleatorio(semilla: number): () => number {
  let estado = mezclarSemilla(semilla) || 0x9e3779b9;
  return () => {
    estado ^= estado << 13;
    estado >>>= 0;
    estado ^= estado >>> 17;
    estado ^= estado << 5;
    estado >>>= 0;
    return estado / 4294967296;
  };
}

/** Elige un elemento del array con el generador dado. */
function elegir<T>(lista: readonly T[], aleatorio: () => number): T {
  return lista[Math.floor(aleatorio() * lista.length)] ?? lista[0];
}

const NOTABLES_PRACTICA: readonly number[] = [
  30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330,
];

/** Vueltas enteras que se suman para practicar ángulos negativos y de más de 360°. */
const VUELTAS: readonly number[] = [0, 0, 360, -360];

/** Una plantilla sabe qué preguntar; el número lo pone siempre `resolverCaso`. */
interface PlantillaPractica {
  construir: (aleatorio: () => number) => {
    enunciado: string;
    datos: DatosCaso;
    etiquetaRespuesta: string;
    pista: string;
  };
}

const PLANTILLAS: readonly PlantillaPractica[] = [
  {
    // Razón de un ángulo notable, a veces con vuelta de más o en negativo.
    construir: (aleatorio) => {
      const magnitud: MagnitudCaso = aleatorio() < 0.5 ? 'seno' : 'coseno';
      const base = elegir(NOTABLES_PRACTICA, aleatorio);
      const angulo = base + elegir(VUELTAS, aleatorio);
      const nombre = magnitud === 'seno' ? 'sen' : 'cos';
      return {
        enunciado: `¿Cuánto vale ${nombre} ${formatearRespuesta(angulo)}°? Redondea a 2 decimales y no olvides el signo.`,
        datos: { angulo, magnitud },
        etiquetaRespuesta: UNIDAD_RAZON,
        pista:
          magnitud === 'seno'
            ? 'El seno es la coordenada vertical del punto: positivo por encima del eje horizontal, negativo por debajo.'
            : 'El coseno es la coordenada horizontal del punto: positivo a la derecha del eje vertical, negativo a la izquierda.',
      };
    },
  },
  {
    // Cuadrante de un ángulo que nunca cae sobre un eje.
    construir: (aleatorio) => {
      const cuadrante = Math.floor(aleatorio() * 4);
      const dentro = 5 + Math.floor(aleatorio() * 81); // de 5° a 85°, lejos de los ejes
      const angulo = cuadrante * 90 + dentro + elegir(VUELTAS, aleatorio);
      return {
        enunciado: `¿En qué cuadrante cae el lado terminal de ${formatearRespuesta(angulo)}°? Escribe el número del cuadrante (1, 2, 3 o 4).`,
        datos: { angulo, magnitud: 'cuadrante' },
        etiquetaRespuesta: UNIDAD_CUADRANTE,
        pista:
          'Quita primero las vueltas enteras para dejar el ángulo entre 0° y 360°, y luego cuenta de 90° en 90° en sentido antihorario.',
      };
    },
  },
  {
    // Ángulo de referencia, también lejos de los ejes.
    construir: (aleatorio) => {
      const cuadrante = Math.floor(aleatorio() * 4);
      const dentro = 5 + Math.floor(aleatorio() * 81);
      const angulo = cuadrante * 90 + dentro;
      return {
        enunciado: `¿Cuál es el ángulo de referencia de ${formatearRespuesta(angulo)}°? Es el ángulo agudo con el eje horizontal.`,
        datos: { angulo, magnitud: 'angulo-referencia' },
        etiquetaRespuesta: '°',
        pista:
          'Según el cuadrante: el propio ángulo (I), 180° menos el ángulo (II), el ángulo menos 180° (III) o 360° menos el ángulo (IV).',
      };
    },
  },
  {
    // Conversión a radianes.
    construir: (aleatorio) => {
      const angulo = elegir(NOTABLES_PRACTICA, aleatorio);
      return {
        enunciado: `Expresa ${formatearRespuesta(angulo)}° en radianes. Escribe el valor decimal redondeado a 2 decimales.`,
        datos: { angulo, magnitud: 'radianes' },
        etiquetaRespuesta: 'rad',
        pista: 'Multiplica por π/180. Con π ≈ 3,1416, 180° son 3,14 rad y 90°, 1,57 rad.',
      };
    },
  },
  {
    // Aplicado: altura por el ángulo de elevación (tangente).
    construir: (aleatorio) => {
      const distancia = 10 + Math.floor(aleatorio() * 41); // de 10 a 50
      const elevacion = 20 + Math.floor(aleatorio() * 51); // de 20° a 70°
      return {
        enunciado: `Desde un punto del suelo situado a ${formatearRespuesta(distancia)} m de la base de una torre, su punto más alto se ve con un ángulo de elevación de ${formatearRespuesta(elevacion)}°. ¿Qué altura tiene la torre? Redondea a 2 decimales.`,
        datos: { angulo: elevacion, magnitud: 'altura-tangente', longitud: distancia },
        etiquetaRespuesta: 'm',
        pista: 'Los dos datos son catetos del triángulo rectángulo: altura = distancia · tan θ.',
      };
    },
  },
  {
    // Aplicado: altura de una cabina de noria (proyección del seno).
    construir: (aleatorio) => {
      const radio = 10 + Math.floor(aleatorio() * 26); // de 10 a 35 m
      const base = elegir(NOTABLES_PRACTICA, aleatorio);
      const angulo = base + elegir(VUELTAS, aleatorio);
      return {
        enunciado: `Una noria (rueda de la fortuna) de ${formatearRespuesta(radio)} m de radio gira en sentido antihorario. Una cabina que arrancó en el extremo derecho del radio horizontal ha girado ${formatearRespuesta(angulo)}°. ¿A qué altura está por encima del eje? Redondea a 2 decimales; si queda por debajo del eje, la respuesta es negativa.`,
        datos: { angulo, magnitud: 'proyeccion-seno', longitud: radio },
        etiquetaRespuesta: 'm',
        pista: 'La altura sobre el eje es el radio por el seno del ángulo girado: r · sen θ.',
      };
    },
  },
];

/**
 * Genera un ejercicio. Con la misma `semilla` sale exactamente el mismo, así que se
 * puede dictar («haz el ejercicio con semilla 4021») y comprobar.
 *
 * Sin semilla se toma una del reloj, así que NO debe llamarse durante el render: el
 * servidor y el navegador producirían ejercicios distintos y React avisaría de la
 * discrepancia de hidratación.
 */
export function generarEjercicioAleatorio(semilla?: number): EjercicioAleatorio {
  const semillaReal =
    semilla !== undefined && Number.isFinite(semilla)
      ? Math.floor(Math.abs(semilla))
      : Math.floor(Date.now() % 2147483647);

  const aleatorio = creadorAleatorio(semillaReal);
  const plantilla = elegir(PLANTILLAS, aleatorio);
  const preparado = plantilla.construir(aleatorio);
  const solucion = resolverCaso(preparado.datos);
  const respuesta = solucion.valor;

  return {
    semilla: semillaReal,
    enunciado: preparado.enunciado,
    datos: preparado.datos,
    etiquetaRespuesta: preparado.etiquetaRespuesta,
    respuesta,
    ...presentarRespuesta(respuesta),
    pasos: solucion.ok
      ? solucion.pasos
      : [solucion.error ?? 'Este ejercicio no se ha podido resolver; genera otro.'],
    pista: preparado.pista,
  };
}
