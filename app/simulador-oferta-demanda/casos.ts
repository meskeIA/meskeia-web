/**
 * Casos para clase — la tarea asignable de `simulador-oferta-demanda`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la economía está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y se prueba sin navegador (tests/apps/simulador-oferta-demanda.spec.ts).
 *
 * DOS TIPOS DE TAREA (skill /casos-aula-meskeia), como en `simulador-equilibrio-quimico`:
 *   · A · casos 1-6: CALCULAR el equilibrio o el desajuste con curvas lineales dadas.
 *   · C · casos 7-12: PREDECIR, antes de mover un desplazador, si P* o Q* sube o baja. Se
 *     comprueba moviéndolo en el simulador.
 *
 * ── EL MOTOR ES EL DE LA APP ─────────────────────────────────────────────────
 *
 * `calcularCurvas` y `calcularEquilibrio` (con sus tipos y constantes) se MOVIERON aquí desde
 * `page.tsx`, tal cual, y la página los importa. `cantidadesAPrecio` es el cuerpo de los dos
 * `useMemo` de la página (Qd y Qo a un precio fijado), EXTRAÍDO con sus variables como
 * parámetros. Una sola implementación: si la corrección y el panel calcularan distinto, la app
 * suspendería una respuesta que ella misma imprime.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **Curvas lineales con la cantidad despejada**: Qd = a − b·P y Qo = c + d·P, la forma en
 *    que las escribe la app. Hay libros que despejan el precio (P = … − …·Q) y dan otras
 *    pendientes; los enunciados escriben siempre las dos curvas completas, así que no hay que
 *    convertir nada.
 *
 * ⚠️ **Solo se pregunta por el equilibrio y por el desajuste a un precio dado** (cuántas
 *    unidades faltan o sobran). El excedente del consumidor y del productor, el bienestar y los
 *    controles de precio son de bachillerato y universidad, y quedan FUERA de los casos: el canal
 *    de aula es de 13-16 años (decidido el 06/10/2026 al aceptar esta app en la cola).
 *
 * ⚠️ **La predicción se evalúa sobre lo que ENSEÑA el panel**, no sobre el modelo: el panel
 *    pinta P* y Q* con un decimal, y la respuesta es la dirección de esa cifra. Los casos C parten
 *    SIEMPRE del estado inicial (todos los desplazadores en 0, botón «Restablecer todo») y mueven
 *    un solo desplazador: con dos a la vez, la dirección de una de las variables es la que el
 *    libro llama «indeterminada», y el modelo daría una respuesta que el libro no.
 *
 * ⚠️ **El precio va en «unidades monetarias»**: el panel de la app escribe «€», pero el canal es
 *    sobre todo latinoamericano y los enunciados no anclan una moneda.
 */

import { formatNumber } from '@/lib';

/* ─────────────────────────── El motor de la app (movido de page.tsx) ─────────────────────────── */

export interface Sliders {
  renta: number;
  sustitutivos: number;
  preferencias: number;
  costes: number;
  tecnologia: number;
  productores: number;
}

export interface Curvas {
  a: number; // intercepto demanda (base 100, ajustado por desplazadores)
  b: number; // pendiente demanda (fija = 2)
  c: number; // intercepto oferta (base -20, ajustado por desplazadores)
  d: number; // pendiente oferta (fija = 1.5)
}

export interface Equilibrio {
  P: number;
  Q: number;
}

export const A_BASE = 100;
export const C_BASE = -20;
export const B_FIJA = 2;
export const D_FIJA = 1.5;
const DESPLAZADOR_PASO = 4; // unidades por unidad de slider para demanda
const DESPLAZADOR_PASO_O = 3; // unidades por unidad de slider para oferta

/** Todos los desplazadores en 0: el estado inicial de la app y el de «Restablecer todo». */
export const SLIDERS_INICIALES: Sliders = {
  renta: 0,
  sustitutivos: 0,
  preferencias: 0,
  costes: 0,
  tecnologia: 0,
  productores: 0,
};

export function calcularCurvas(sliders: Sliders): Curvas {
  // Desplazadores de demanda: renta (positivo), sustitutivos (positivo), preferencias (positivo)
  const deltaD =
    (sliders.renta + sliders.sustitutivos + sliders.preferencias) * DESPLAZADOR_PASO;
  // Desplazadores de oferta: costes (negativo), tecnologia (positivo), productores (positivo)
  const deltaO =
    (-sliders.costes + sliders.tecnologia + sliders.productores) * DESPLAZADOR_PASO_O;

  return {
    a: A_BASE + deltaD,
    b: B_FIJA,
    c: C_BASE + deltaO,
    d: D_FIJA,
  };
}

export function calcularEquilibrio(curvas: Curvas): Equilibrio {
  const P = (curvas.a - curvas.c) / (curvas.b + curvas.d);
  const Q = curvas.a - curvas.b * P;
  return { P: Math.max(0, P), Q: Math.max(0, Q) };
}

/**
 * Cantidad demandada y ofrecida a un precio fijado, sin dejar que ninguna sea negativa. Es el
 * cuerpo de los dos `useMemo` de la página (`qDemandaControlada` y `qOfertaControlada`).
 */
export function cantidadesAPrecio(curvas: Curvas, P: number): { qd: number; qo: number } {
  return {
    qd: Math.max(0, curvas.a - curvas.b * P),
    qo: Math.max(0, curvas.c + curvas.d * P),
  };
}

/* ─────────────────────────── Tipos de los casos ─────────────────────────── */

export type Direccion = 'sube' | 'baja' | 'no-cambia';
export type Respuesta = number | Direccion;
export type Desplazador = keyof Sliders;

export const OPCIONES_DIRECCION: ReadonlyArray<{ valor: Direccion; texto: string }> = [
  { valor: 'sube', texto: 'Sube' },
  { valor: 'baja', texto: 'Baja' },
  { valor: 'no-cambia', texto: 'No cambia' },
];

/**
 * Unión discriminada por `tipo`, con literales en los tres miembros: sin eso TypeScript no
 * estrecha y `datos.precio` compilaría en una rama que no lo tiene.
 */
export type DatosCaso =
  | { tipo: 'equilibrio'; curvas: Curvas; pide: 'precio' | 'cantidad' }
  | { tipo: 'desajuste'; curvas: Curvas; precio: number }
  | { tipo: 'prediccion'; desplazador: Desplazador; movimiento: number; variable: 'precio' | 'cantidad' };

export interface Resolucion {
  ok: boolean;
  valor: Respuesta;
  pasos: string[];
  error?: string;
}

/** ¿Se responde eligiendo una dirección (tipo C) o tecleando un número (tipo A)? */
export function esPrediccion(datos: DatosCaso): boolean {
  return datos.tipo === 'prediccion';
}

/* ─────────────────────────── Utilidades de presentación ─────────────────────────── */

/** Cifra en formato español con los decimales justos: «20», «34,3», «1.000». */
function numero(n: number, decimales = 2): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

/** Como lo pinta el panel de la app: un decimal fijo («34,3»). */
function comoElPanel(n: number): string {
  return formatNumber(Math.abs(n) < 1e-9 ? 0 : n, 1);
}

/** «+2», «−3»: con el menos tipográfico, como en los enunciados. */
function conSigno(n: number): string {
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

/** «2P», «P», «1,5P»: el coeficiente 1 no se escribe. */
function termino(coef: number): string {
  return coef === 1 ? 'P' : `${numero(coef)}P`;
}

/** «Qd = 100 − 2P» */
export function textoDemanda(c: Curvas): string {
  return `Qd = ${numero(c.a)} − ${termino(c.b)}`;
}

/** «Qo = 4P − 20» o «Qo = 60 + 3P» */
export function textoOferta(c: Curvas): string {
  if (c.c < 0) return `Qo = ${termino(c.d)} − ${numero(-c.c)}`;
  if (c.c === 0) return `Qo = ${termino(c.d)}`;
  return `Qo = ${numero(c.c)} + ${termino(c.d)}`;
}

const NOMBRES_DESPLAZADOR: Record<Desplazador, string> = {
  renta: 'Renta disponible',
  sustitutivos: 'Precio bienes sustitutivos',
  preferencias: 'Preferencias / moda',
  costes: 'Coste de producción',
  tecnologia: 'Tecnología',
  productores: 'Número de productores',
};

/** Por qué se mueve la curva, en una frase de libro. */
const MECANISMO: Record<Desplazador, string> = {
  renta: 'con más renta, los consumidores compran más de un bien normal a cualquier precio',
  sustitutivos: 'si el bien sustitutivo se encarece, parte de sus compradores se pasan a este bien',
  preferencias: 'el bien gusta más o menos, y eso cambia lo que se quiere comprar a cualquier precio',
  costes: 'producir cada unidad cuesta más, así que a cada precio se ofrece menos',
  tecnologia: 'con mejor tecnología se produce más con los mismos recursos, así que a cada precio se ofrece más',
  productores: 'más empresas vendiendo significa más cantidad ofrecida a cada precio',
};

const ES_DE_DEMANDA: Record<Desplazador, boolean> = {
  renta: true,
  sustitutivos: true,
  preferencias: true,
  costes: false,
  tecnologia: false,
  productores: false,
};

export function nombreDesplazador(d: Desplazador): string {
  return NOMBRES_DESPLAZADOR[d];
}

/** Dirección de una cifra tal como cambia EN EL PANEL (un decimal). */
export function direccionVisible(antes: number, despues: number): Direccion {
  const a = Math.round(antes * 10);
  const d = Math.round(despues * 10);
  if (d > a) return 'sube';
  if (d < a) return 'baja';
  return 'no-cambia';
}

/* ─────────────────────────── Resolver un caso ─────────────────────────── */

/**
 * Recalcula la respuesta de un caso desde sus datos, con el MISMO motor que pinta el panel, y
 * explica cómo se llega a ella. No mira `respuesta`. Nunca lanza: un dato fuera de lugar
 * devuelve `{ ok: false }`.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const fallo = (error: string): Resolucion => ({ ok: false, valor: NaN, pasos: [], error });

  if (datos.tipo === 'prediccion') {
    const m = datos.movimiento;
    if (!(Number.isInteger(m) && m !== 0 && Math.abs(m) <= 5)) return fallo('Movimiento fuera de los desplazadores (−5 a +5).');
    if (!(datos.desplazador in NOMBRES_DESPLAZADOR)) return fallo('Desplazador desconocido.');
    const antes = calcularEquilibrio(calcularCurvas(SLIDERS_INICIALES));
    const curvas = calcularCurvas({ ...SLIDERS_INICIALES, [datos.desplazador]: m });
    const despues = calcularEquilibrio(curvas);
    // El suelo en 0 de calcularEquilibrio no debe morder: si mordiera, el panel enseñaría un 0
    // que no es el corte de las curvas (skill, tipo C: «dónde muerde un suelo»).
    const bruto = (curvas.a - curvas.c) / (curvas.b + curvas.d);
    if (bruto <= 0 || curvas.a - curvas.b * bruto <= 0) return fallo('El equilibrio sale del primer cuadrante.');

    const deDemanda = ES_DE_DEMANDA[datos.desplazador];
    const curva = deDemanda ? 'demanda' : 'oferta';
    const deltaCurva = deDemanda ? curvas.a - A_BASE : curvas.c - C_BASE;
    const lado = deltaCurva > 0 ? 'derecha' : 'izquierda';
    const valor =
      datos.variable === 'precio' ? direccionVisible(antes.P, despues.P) : direccionVisible(antes.Q, despues.Q);
    return {
      ok: true,
      valor,
      pasos: [
        `«${NOMBRES_DESPLAZADOR[datos.desplazador]}» es un desplazador de la ${curva}: ${MECANISMO[datos.desplazador]}.`,
        `Moverlo a ${conSigno(m)} desplaza la curva de ${curva} hacia la ${lado}.`,
        `El nuevo corte con la otra curva: P* pasa de ${comoElPanel(antes.P)} a ${comoElPanel(despues.P)} y Q* de ${comoElPanel(antes.Q)} a ${comoElPanel(despues.Q)}.`,
        deDemanda
          ? `Cuando se mueve la demanda, precio y cantidad van en el MISMO sentido.`
          : `Cuando se mueve la oferta, precio y cantidad van en sentidos CONTRARIOS.`,
      ],
    };
  }

  const { a, b, c, d } = datos.curvas;
  if (![a, b, c, d].every(Number.isFinite) || b <= 0 || d <= 0) return fallo('Curvas no válidas.');
  const ecuaciones = `${textoDemanda(datos.curvas)} y ${textoOferta(datos.curvas)}.`;

  if (datos.tipo === 'equilibrio') {
    const P = (a - c) / (b + d);
    const Q = a - b * P;
    // Sin cortes fuera del primer cuadrante: calcularEquilibrio los recortaría a 0 en silencio.
    if (!(P > 0 && Q > 0)) return fallo('El equilibrio sale del primer cuadrante.');
    const eq = calcularEquilibrio(datos.curvas);
    const pasos = [
      `En el equilibrio la cantidad demandada es igual a la ofrecida: ${ecuaciones}`,
      `${numero(a)} − ${termino(b)} = ${textoOferta(datos.curvas).slice(5)} → ${numero(a)} ${c < 0 ? '+' : '−'} ${numero(Math.abs(c))} = ${termino(b)} + ${termino(d)} →${numero(a - c)} = ${numero(b + d)}P.`,
      `P* = ${numero(a - c)} / ${numero(b + d)} = ${numero(eq.P)} unidades monetarias.`,
      `Q* = ${numero(a)} − ${numero(b)} · ${numero(eq.P)} = ${numero(eq.Q)} unidades (comprueba en la oferta: ${numero(d)} · ${numero(eq.P)} ${c < 0 ? '−' : '+'} ${numero(Math.abs(c))} = ${numero(c + d * eq.P)}).`,
    ];
    return { ok: true, valor: datos.pide === 'precio' ? eq.P : eq.Q, pasos };
  }

  // Desajuste: a un precio distinto del de equilibrio, falta o sobra.
  const P = datos.precio;
  const Peq = (a - c) / (b + d);
  if (!(Number.isFinite(P) && P > 0) || Math.abs(P - Peq) < 1e-9) return fallo('Precio no válido.');
  // Las cantidades del enunciado deben ser positivas: con el recorte a 0 de cantidadesAPrecio,
  // la diferencia ya no sería la de las dos curvas.
  if (!(a - b * P > 0 && c + d * P > 0)) return fallo('A ese precio una de las cantidades sale negativa.');
  const { qd, qo } = cantidadesAPrecio(datos.curvas, P);
  const falta = P < Peq;
  return {
    ok: true,
    valor: Math.abs(qd - qo),
    pasos: [
      `Al precio ${numero(P)}: Qd = ${numero(a)} − ${numero(b)} · ${numero(P)} = ${numero(qd)} unidades.`,
      `Qo = ${numero(d)} · ${numero(P)} ${c < 0 ? '−' : '+'} ${numero(Math.abs(c))} = ${numero(qo)} unidades.`,
      falta
        ? `Se quiere comprar más de lo que se ofrece: hay EXCESO DE DEMANDA (escasez) de ${numero(qd)} − ${numero(qo)} = ${numero(qd - qo)} unidades. El precio está por debajo del de equilibrio (${numero(Peq)}).`
        : `Se ofrece más de lo que se quiere comprar: hay EXCESO DE OFERTA de ${numero(qo)} − ${numero(qd)} = ${numero(qo - qd)} unidades. El precio está por encima del de equilibrio (${numero(Peq)}).`,
    ],
  };
}

/* ─────────────────────────── Corregir ─────────────────────────── */

/** El mayor entre 0,01 y el 1 % del valor (skill /casos-aula-meskeia, tipo A). */
export function toleranciaDe(v: number): number {
  return Math.max(0.01, Math.abs(v) * 0.01);
}

/**
 * Margen de ruido binario (hallazgo 1211 de `simulador-conservacion-energia`): en el borde EXACTO
 * de la tolerancia la resta en coma flotante decide por ±1 ulp.
 */
const RUIDO_BINARIO = 1e-9;

export interface Veredicto {
  correcto: boolean;
  motivo: string;
}

/**
 * Corrige la respuesta del alumno. En los casos de predicción, `usuario` es la opción elegida
 * (o null si no eligió ninguna); en los numéricos, el número que tecleó (NaN si no se lee).
 * Nunca lanza.
 */
export function comprobarRespuesta(usuario: Respuesta | null, esperado: Respuesta, datos: DatosCaso): Veredicto {
  if (esPrediccion(datos)) {
    if (usuario === null || typeof usuario === 'number') {
      return { correcto: false, motivo: 'Elige una de las tres opciones antes de comprobar.' };
    }
    return usuario === esperado
      ? { correcto: true, motivo: '¡Correcto! Compruébalo moviendo el desplazador en el simulador.' }
      : { correcto: false, motivo: 'No es eso. Mueve el desplazador y mira hacia dónde va el punto de equilibrio.' };
  }

  if (typeof usuario !== 'number' || !Number.isFinite(usuario) || typeof esperado !== 'number') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal).' };
  }
  const diferencia = Math.abs(usuario - esperado);
  if (diferencia <= toleranciaDe(esperado) + RUIDO_BINARIO) return { correcto: true, motivo: '¡Correcto!' };

  // Exceso de demanda u oferta escrito en negativo: el signo es el de «Qd − Qo» al revés.
  if (datos.tipo === 'desajuste' && Math.abs(-usuario - esperado) <= toleranciaDe(esperado) + RUIDO_BINARIO) {
    return {
      correcto: false,
      motivo: 'Casi: la cantidad que falta o sobra se da en positivo. Resta la cantidad menor de la mayor.',
    };
  }
  return { correcto: false, motivo: 'No es correcto. Revisa el planteamiento y las operaciones.' };
}

/** Formatea una respuesta: «20 u. m.», «60 unidades», «Sube». */
export function textoRespuesta(valor: Respuesta, datos: DatosCaso): string {
  if (typeof valor === 'string') return OPCIONES_DIRECCION.find((o) => o.valor === valor)?.texto ?? '—';
  if (!Number.isFinite(valor)) return '—';
  if (datos.tipo === 'equilibrio' && datos.pide === 'precio') return `${numero(valor)} u. m.`;
  return `${numero(valor)} unidades`;
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: Respuesta;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

const PARTIDA =
  'Pulsa «Restablecer todo» para dejar los desplazadores en 0 y, ANTES de mover nada, predice:';

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas nacionales: el canal de aula es sobre todo latinoamericano.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'El precio de equilibrio',
    enunciado:
      'En un mercado, la demanda es Qd = 100 − 2P y la oferta es Qo = 4P − 20 (P en unidades monetarias). ¿Cuál es el precio de equilibrio?',
    categoria: 'abstracto',
    datos: { tipo: 'equilibrio', curvas: { a: 100, b: 2, c: -20, d: 4 }, pide: 'precio' },
    etiquetaRespuesta: 'P* (unidades monetarias)',
    pista: 'En el equilibrio Qd = Qo. Iguala las dos expresiones y despeja P.',
  },
  {
    id: 2,
    titulo: 'La cantidad de equilibrio',
    enunciado:
      'En el mismo mercado (Qd = 100 − 2P y Qo = 4P − 20), ¿qué cantidad se compra y se vende en el equilibrio?',
    categoria: 'abstracto',
    datos: { tipo: 'equilibrio', curvas: { a: 100, b: 2, c: -20, d: 4 }, pide: 'cantidad' },
    etiquetaRespuesta: 'Q* (unidades)',
    pista: 'Primero el precio de equilibrio; después sustitúyelo en cualquiera de las dos curvas. Las dos deben dar lo mismo.',
  },
  {
    id: 3,
    titulo: 'Cuadernos al empezar el curso',
    enunciado:
      'La demanda de cuadernos en una papelería es Qd = 300 − 5P y la oferta es Qo = 60 + 3P (P en unidades monetarias por cuaderno). ¿A qué precio se vacía el mercado?',
    categoria: 'aplicado',
    datos: { tipo: 'equilibrio', curvas: { a: 300, b: 5, c: 60, d: 3 }, pide: 'precio' },
    etiquetaRespuesta: 'P* (unidades monetarias)',
    pista: '«Se vacía el mercado» quiere decir que no sobra ni falta nada: Qd = Qo.',
  },
  {
    id: 4,
    titulo: 'Helados en verano',
    enunciado:
      'La demanda diaria de helados en una playa es Qd = 200 − 4P y la oferta es Qo = 6P − 100 (P en unidades monetarias por helado). ¿Cuántos helados se venden al día en el equilibrio?',
    categoria: 'aplicado',
    datos: { tipo: 'equilibrio', curvas: { a: 200, b: 4, c: -100, d: 6 }, pide: 'cantidad' },
    etiquetaRespuesta: 'Q* (helados)',
    pista: 'Calcula P* igualando las curvas y luego sustituye en la demanda.',
  },
  {
    id: 5,
    titulo: 'Pan a un precio demasiado bajo',
    enunciado:
      'En un barrio, la demanda diaria de barras de pan es Qd = 120 − 3P y la oferta es Qo = 20 + 2P. Si el precio se queda en 10 unidades monetarias, ¿cuántas barras faltan para atender a todos los compradores?',
    categoria: 'aplicado',
    datos: { tipo: 'desajuste', curvas: { a: 120, b: 3, c: 20, d: 2 }, precio: 10 },
    etiquetaRespuesta: 'Barras que faltan',
    pista: 'Calcula cuánto se quiere comprar y cuánto se ofrece A ESE PRECIO, y réstalos.',
  },
  {
    id: 6,
    titulo: 'Un precio por encima del equilibrio',
    enunciado:
      'Con la demanda Qd = 100 − 2P y la oferta Qo = 4P − 20, el precio se fija en 30 unidades monetarias. ¿Cuántas unidades sobran (exceso de oferta)?',
    categoria: 'abstracto',
    datos: { tipo: 'desajuste', curvas: { a: 100, b: 2, c: -20, d: 4 }, precio: 30 },
    etiquetaRespuesta: 'Unidades que sobran',
    pista: 'A un precio alto se ofrece mucho y se compra poco. Calcula Qo y Qd a P = 30.',
  },
  {
    id: 7,
    titulo: 'Las familias ganan más',
    enunciado: `${PARTIDA} si sube la renta disponible (desplazador «Renta disponible» a +2) y el bien es normal, ¿qué pasa con el precio de equilibrio P*?`,
    categoria: 'aplicado',
    datos: { tipo: 'prediccion', desplazador: 'renta', movimiento: 2, variable: 'precio' },
    etiquetaRespuesta: 'El precio de equilibrio P*…',
    pista: 'La renta afecta a los compradores, no a los vendedores. ¿Qué curva se mueve, y hacia dónde?',
  },
  {
    id: 8,
    titulo: 'Una máquina nueva',
    enunciado: `${PARTIDA} si mejora la tecnología (desplazador «Tecnología» a +2), ¿qué pasa con el precio de equilibrio P*?`,
    categoria: 'aplicado',
    datos: { tipo: 'prediccion', desplazador: 'tecnologia', movimiento: 2, variable: 'precio' },
    etiquetaRespuesta: 'El precio de equilibrio P*…',
    pista: 'La tecnología afecta a quien produce. Con la oferta más a la derecha, ¿el corte queda más arriba o más abajo?',
  },
  {
    id: 9,
    titulo: 'Sube el precio de la materia prima',
    enunciado: `${PARTIDA} si suben los costes de producción (desplazador «Coste de producción» a +2), ¿qué pasa con la cantidad de equilibrio Q*?`,
    categoria: 'aplicado',
    datos: { tipo: 'prediccion', desplazador: 'costes', movimiento: 2, variable: 'cantidad' },
    etiquetaRespuesta: 'La cantidad de equilibrio Q*…',
    pista: 'Si producir cuesta más, a cada precio se ofrece menos. La oferta se mueve hacia la izquierda.',
  },
  {
    id: 10,
    titulo: 'Se encarece el bien sustitutivo',
    enunciado: `${PARTIDA} si sube el precio de un bien sustitutivo (desplazador «Precio bienes sustitutivos» a +2), ¿qué pasa con la cantidad de equilibrio Q* de ESTE bien?`,
    categoria: 'aplicado',
    datos: { tipo: 'prediccion', desplazador: 'sustitutivos', movimiento: 2, variable: 'cantidad' },
    etiquetaRespuesta: 'La cantidad de equilibrio Q*…',
    pista: 'Piensa en dos bienes que se pueden usar uno por otro. Si uno se encarece, ¿qué hacen sus compradores?',
  },
  {
    id: 11,
    titulo: 'Llegan más vendedores',
    enunciado: `${PARTIDA} si entran más empresas en el mercado (desplazador «Número de productores» a +3), ¿qué pasa con el precio de equilibrio P*?`,
    categoria: 'aplicado',
    datos: { tipo: 'prediccion', desplazador: 'productores', movimiento: 3, variable: 'precio' },
    etiquetaRespuesta: 'El precio de equilibrio P*…',
    pista: 'Más vendedores, más cantidad ofrecida a cada precio. ¿Hacia dónde va la oferta?',
  },
  {
    id: 12,
    titulo: 'Pasa de moda',
    enunciado: `${PARTIDA} si el producto pasa de moda (desplazador «Preferencias / moda» a −2), ¿qué pasa con la cantidad de equilibrio Q*?`,
    categoria: 'aplicado',
    datos: { tipo: 'prediccion', desplazador: 'preferencias', movimiento: -2, variable: 'cantidad' },
    etiquetaRespuesta: 'La cantidad de equilibrio Q*…',
    pista: 'Las preferencias son de los compradores. Si el bien gusta menos, ¿la demanda va a la derecha o a la izquierda?',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const valor: Respuesta = r.ok ? r.valor : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.datos),
    pasos: r.pasos,
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * enteros pequeños, los primeros valores salen diminutos y parecidos, y `Math.floor(rnd()*n)`
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio y
 * aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
 */
function aleatorioCon(semilla: number): () => number {
  let estado = (semilla >>> 0) || 1;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 0x100000000;
  };
}

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

export interface Ejercicio {
  enunciado: string;
  datos: DatosCaso;
  respuesta: Respuesta;
  etiquetaRespuesta: string;
  pasos: string[];
}

/**
 * Las curvas se construyen AL REVÉS, desde un equilibrio entero (P*, Q*) y dos pendientes
 * enteras: a = Q* + b·P*, c = Q* − d·P*. Así la respuesta sale siempre exacta.
 */
const PRECIOS = [10, 15, 20, 25, 30, 40] as const;
const CANTIDADES = [40, 50, 60, 80, 100, 120] as const;
const PENDIENTES_D = [1, 2, 3, 4, 5] as const;
const PENDIENTES_O = [1, 2, 3, 4] as const;
const DESPLAZADORES: readonly Desplazador[] = ['renta', 'sustitutivos', 'preferencias', 'costes', 'tecnologia', 'productores'];
const MOVIMIENTOS = [-3, -2, -1, 1, 2, 3] as const;
const TIPOS_PRACTICA = ['precio', 'cantidad', 'desajuste', 'prediccion'] as const;

/**
 * Ejercicio aleatorio: un equilibrio, un desajuste o una predicción. Usa EL MISMO `resolverCaso`
 * que los doce fijos, y por tanto el mismo motor que el panel: si divergieran, el alumno
 * entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const tipo = elegir(TIPOS_PRACTICA, rnd);
  const Peq = elegir(PRECIOS, rnd);
  const Qeq = elegir(CANTIDADES, rnd);
  const b = elegir(PENDIENTES_D, rnd);
  const d = elegir(PENDIENTES_O, rnd);
  const curvas: Curvas = { a: Qeq + b * Peq, b, c: Qeq - d * Peq, d };
  const presentacion = `En un mercado, la demanda es ${textoDemanda(curvas)} y la oferta es ${textoOferta(curvas)} (P en unidades monetarias).`;

  let datos: DatosCaso;
  let enunciado: string;
  let etiqueta: string;
  if (tipo === 'prediccion') {
    const desplazador = elegir(DESPLAZADORES, rnd);
    const movimiento = elegir(MOVIMIENTOS, rnd);
    const variable = rnd() < 0.5 ? 'precio' : 'cantidad';
    datos = { tipo: 'prediccion', desplazador, movimiento, variable };
    enunciado = `${PARTIDA} si el desplazador «${NOMBRES_DESPLAZADOR[desplazador]}» pasa a ${conSigno(movimiento)}, ¿qué pasa con ${variable === 'precio' ? 'el precio de equilibrio P*' : 'la cantidad de equilibrio Q*'}?`;
    etiqueta = variable === 'precio' ? 'El precio de equilibrio P*…' : 'La cantidad de equilibrio Q*…';
  } else if (tipo === 'desajuste') {
    // 5 por debajo o por encima del equilibrio; los dos lados quedan con cantidades positivas
    // porque Q* ≥ 40 y las pendientes no pasan de 5 (5 · 5 = 25 < 40).
    const precio = rnd() < 0.5 ? Peq - 5 : Peq + 5;
    datos = { tipo: 'desajuste', curvas, precio };
    enunciado = `${presentacion} Si el precio se fija en ${numero(precio)}, ¿cuántas unidades ${precio < Peq ? 'faltan (exceso de demanda)' : 'sobran (exceso de oferta)'}?`;
    etiqueta = precio < Peq ? 'Unidades que faltan' : 'Unidades que sobran';
  } else {
    datos = { tipo: 'equilibrio', curvas, pide: tipo };
    enunciado = `${presentacion} ¿Cuál es ${tipo === 'precio' ? 'el precio' : 'la cantidad'} de equilibrio?`;
    etiqueta = tipo === 'precio' ? 'P* (unidades monetarias)' : 'Q* (unidades)';
  }

  const r = resolverCaso(datos);
  return { enunciado, datos, respuesta: r.ok ? r.valor : NaN, etiquetaRespuesta: etiqueta, pasos: r.pasos };
}
