/**
 * Casos para clase — la tarea asignable de `simulador-conservacion-energia`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y las doce respuestas se verifican a mano en
 * `tests/apps/simulador-conservacion-energia.spec.ts`.
 *
 * ── EL CONVENIO DE ESTA APP ───────────────────────────────────────────────────
 *
 * Las tres fórmulas NO se replican aquí: se importan de `./motor.ts`, que es donde vive la
 * física de la simulación. Así el panel de la app y la corrección de los casos no pueden
 * divergir, que es el peor fallo posible en algo que corrige a un alumno.
 *
 *     E_p = m · g · h              (energía potencial gravitatoria, J)
 *     E_c = ½ · m · v²             (energía cinética, J)
 *     E_m = E_c + E_p              (energía mecánica, J)
 *
 * ⚠️ **g = 9,8 m/s², que es el valor por defecto de la app.** No 9,81 ni 10. Es el convenio
 * que puede hacer que un alumno «falle» un caso que ha resuelto bien, así que TODOS los
 * enunciados lo declaran y la invariante 7 del test lo fija.
 *
 * ⚠️ **La altura se mide desde el suelo de la pista** (y = 0), que es el origen de la energía
 * potencial. La app no ofrece otro origen, así que no hay ambigüedad posible.
 *
 * ⚠️ **La energía disipada es el TRABAJO del rozamiento, no una resta de energías.** Es la
 * corrección de los hallazgos 357 y 360 del Inspector y el motivo de que el motor lleve la
 * energía como variable de estado. Los casos 8, 9, 10 y 11 dan ese trabajo como dato o lo
 * calculan con W = µ·m·g·d, nunca restando dos energías medidas.
 */

import { G_POR_DEFECTO, energiaCinetica, energiaPotencial, velocidadDesdeEnergiaCinetica } from './motor';

export { G_POR_DEFECTO } from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  | 'energiaPotencial'
  | 'energiaCinetica'
  | 'energiaMecanica'
  | 'velocidad'
  | 'alturaDeSuelta'
  | 'alturaFinal'
  | 'trabajoRozamiento';

export interface DatosCaso {
  magnitud: Magnitud;
  /** Masa del objeto, en kg. */
  masa?: number;
  /** Gravedad, en m/s². Por defecto la de la app (9,8). */
  g?: number;
  /** Altura de partida, en metros, medida desde el suelo de la pista. */
  alturaInicial?: number;
  /** Altura del punto por el que se pregunta, en metros. Por defecto 0 (el suelo). */
  altura?: number;
  /** Velocidad conocida en el punto por el que se pregunta, en m/s. */
  velocidad?: number;
  /** Velocidad en el punto de partida, en m/s. Por defecto 0: el objeto se suelta. */
  velocidadInicial?: number;
  /** Energía perdida por rozamiento entre la partida y el punto preguntado, en julios. */
  disipada?: number;
  /** Coeficiente de rozamiento cinético, adimensional. */
  mu?: number;
  /** Recorrido horizontal sobre el que actúa el rozamiento, en metros. */
  distancia?: number;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

function numero(n: number, decimales = 2): string {
  return n.toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** Falta un dato obligatorio: se responde con un error legible, nunca con una excepción. */
function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const g = datos.g ?? G_POR_DEFECTO;
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];

  if (!Number.isFinite(g) || g <= 0) return falta('la gravedad', pasos);

  const masa = datos.masa;
  const necesitaMasa = datos.magnitud !== 'alturaDeSuelta';
  if (necesitaMasa && (!Number.isFinite(masa) || (masa ?? 0) <= 0)) return falta('la masa', pasos);
  const m = masa as number;

  const h0 = datos.alturaInicial;
  const h = datos.altura ?? 0;
  const v0 = datos.velocidadInicial ?? 0;
  const disipada = datos.disipada ?? 0;

  let valor: number;

  switch (datos.magnitud) {
    case 'energiaPotencial': {
      const alturaEp = datos.altura ?? datos.alturaInicial;
      if (!Number.isFinite(alturaEp)) return falta('la altura', pasos);
      pasos.push(
        'La energía potencial gravitatoria es el trabajo que costó subir el objeto hasta ahí: E_p = m·g·h.',
      );
      valor = energiaPotencial(m, g, alturaEp as number);
      pasos.push(
        `E_p = m·g·h = ${numero(m)}·${numero(g)}·${numero(alturaEp as number)} = ${numero(valor, 4)} J.`,
      );
      pasos.push('La altura se mide desde el suelo de la pista, que es el origen de la energía potencial.');
      break;
    }

    case 'energiaCinetica': {
      if (Number.isFinite(datos.velocidad)) {
        // Camino directo: se conoce la velocidad en ese punto.
        pasos.push('La energía cinética depende solo de la masa y del MÓDULO de la velocidad: E_c = ½·m·v².');
        valor = energiaCinetica(m, datos.velocidad as number);
        pasos.push(
          `E_c = ½·m·v² = 0,5·${numero(m)}·${numero(datos.velocidad as number)}² = ${numero(valor, 4)} J.`,
        );
        pasos.push('Ojo a los dos sitios donde se falla: el ½ de delante y el cuadrado de la velocidad.');
        break;
      }
      // Camino por conservación: la energía que ha perdido de altura se ha vuelto cinética.
      if (!Number.isFinite(h0)) return falta('la altura de partida', pasos);
      const ecInicial = energiaCinetica(m, v0);
      const eMecInicial = energiaPotencial(m, g, h0 as number) + ecInicial;
      pasos.push(
        `Energía mecánica de partida: E_m = m·g·h₀ + ½·m·v₀² = ${numero(energiaPotencial(m, g, h0 as number), 4)} + ${numero(ecInicial, 4)} = ${numero(eMecInicial, 4)} J.`,
      );
      const epAqui = energiaPotencial(m, g, h);
      pasos.push(`En el punto pedido queda E_p = m·g·h = ${numero(epAqui, 4)} J.`);
      if (disipada > 0) {
        pasos.push(`El rozamiento se ha llevado ${numero(disipada, 4)} J, que ya no están disponibles.`);
      }
      valor = eMecInicial - epAqui - disipada;
      pasos.push(
        `E_c = E_m − E_p − E_disipada = ${numero(eMecInicial, 4)} − ${numero(epAqui, 4)} − ${numero(disipada, 4)} = ${numero(valor, 4)} J.`,
      );
      if (valor < 0) {
        return { ok: false, valor: NaN, pasos, error: 'No hay energía suficiente para llegar a esa altura.' };
      }
      break;
    }

    case 'energiaMecanica': {
      if (!Number.isFinite(h0)) return falta('la altura de partida', pasos);
      const ep = energiaPotencial(m, g, h0 as number);
      const ec = energiaCinetica(m, v0);
      valor = ep + ec;
      pasos.push(`E_p = m·g·h = ${numero(m)}·${numero(g)}·${numero(h0 as number)} = ${numero(ep, 4)} J.`);
      pasos.push(`E_c = ½·m·v² = 0,5·${numero(m)}·${numero(v0)}² = ${numero(ec, 4)} J.`);
      pasos.push(`E_m = E_p + E_c = ${numero(valor, 4)} J. Sin rozamiento, este número no cambia en todo el recorrido.`);
      break;
    }

    case 'velocidad': {
      const ec = resolverCaso({ ...datos, magnitud: 'energiaCinetica' });
      if (!ec.ok) return ec;
      pasos.push(...ec.pasos);
      valor = velocidadDesdeEnergiaCinetica(m, ec.valor);
      pasos.push(
        `De E_c = ½·m·v² se despeja v = √(2·E_c/m) = √(2·${numero(ec.valor, 4)}/${numero(m)}) = ${numero(valor, 4)} m/s.`,
      );
      break;
    }

    case 'alturaDeSuelta': {
      // ¿Desde qué altura hay que soltarlo para llegar abajo con esta velocidad?
      if (!Number.isFinite(datos.velocidad)) return falta('la velocidad', pasos);
      const v = datos.velocidad as number;
      pasos.push('Al soltarlo desde el reposo, toda la energía potencial se convierte en cinética: m·g·h = ½·m·v².');
      pasos.push('La masa aparece en los dos lados y se simplifica: por eso el resultado NO depende de ella.');
      valor = (v * v) / (2 * g);
      pasos.push(`h = v²/(2·g) = ${numero(v)}²/(2·${numero(g)}) = ${numero(valor, 4)} m.`);
      break;
    }

    case 'alturaFinal': {
      // ¿Hasta qué altura vuelve a subir tras perder `disipada` julios?
      if (!Number.isFinite(h0)) return falta('la altura de partida', pasos);
      const eMecInicial = energiaPotencial(m, g, h0 as number) + energiaCinetica(m, v0);
      pasos.push(`Energía mecánica de partida: E_m = ${numero(eMecInicial, 4)} J.`);
      pasos.push(`El rozamiento disipa ${numero(disipada, 4)} J, así que le quedan ${numero(eMecInicial - disipada, 4)} J.`);
      pasos.push('En el punto más alto vuelve a estar parado, así que toda esa energía es de nuevo potencial.');
      valor = (eMecInicial - disipada) / (m * g);
      pasos.push(
        `h = (E_m − E_disipada)/(m·g) = ${numero(eMecInicial - disipada, 4)}/(${numero(m)}·${numero(g)}) = ${numero(valor, 4)} m.`,
      );
      if (valor < 0) {
        return { ok: false, valor: NaN, pasos, error: 'El rozamiento se lleva más energía de la que había.' };
      }
      break;
    }

    case 'trabajoRozamiento': {
      if (!Number.isFinite(datos.mu) || !Number.isFinite(datos.distancia)) {
        return falta('el coeficiente de rozamiento y la distancia', pasos);
      }
      const mu = datos.mu as number;
      const d = datos.distancia as number;
      pasos.push('En un tramo horizontal la normal es N = m·g, así que la fuerza de rozamiento vale F = µ·m·g.');
      valor = mu * m * g * d;
      pasos.push(
        `W = F·d = µ·m·g·d = ${numero(mu)}·${numero(m)}·${numero(g)}·${numero(d)} = ${numero(valor, 4)} J.`,
      );
      pasos.push('Esa energía no desaparece: se ha convertido en calor, y por eso la mecánica ya no se conserva.');
      break;
    }

    default:
      return { ok: false, valor: NaN, pasos, error: 'Magnitud desconocida.' };
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }

  pasos.push(`Redondeando a ${decimales} decimales: ${numero(redondear(valor, decimales), decimales)}.`);
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** Corrige la respuesta del alumno. Nunca lanza. */
export function comprobarRespuesta(usuario: number, esperado: number): Veredicto {
  const tolerancia = toleranciaDe(esperado);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número (puedes usar la coma decimal).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  /**
   * ⚠️ 22/09/2026 (hallazgo 1211) — la comparación en el borde EXACTO decidía por el ±1 ulp de
   * la resta en binario, así que la misma desviación se aceptaba por arriba y se rechazaba por
   * abajo: con esperado 0,1 y tolerancia 0,01, «0,11» daba 0,009999999999999995 (dentro) y
   * «0,09» daba 0,010000000000000009 (fuera), y el mensaje de rechazo cifraba la desviación
   * igual que la tolerancia —«te has desviado 0,01»—, que es la forma más desconcertante de
   * suspender a alguien.
   *
   * El margen es 1e-9: nueve órdenes de magnitud por encima del ulp de las cifras que maneja
   * esta app y siete por debajo de la tolerancia más pequeña (0,01), así que absorbe el ruido
   * sin cambiar ninguna decisión real.
   */
  const RUIDO_BINARIO = 1e-9;
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia)} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el 91 % de este canal es de fuera de España.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'Energía potencial de partida',
    enunciado:
      'Un objeto de 2 kg está sujeto a 5 m de altura sobre el suelo. Tomando g = 9,8 m/s², ¿cuál es su energía potencial gravitatoria?',
    categoria: 'abstracto',
    datos: { magnitud: 'energiaPotencial', masa: 2, altura: 5 },
    etiquetaRespuesta: 'E_p en julios (J)',
    pista: 'Tres factores multiplicados: masa, gravedad y altura. Nada más.',
  },
  {
    id: 2,
    titulo: 'Energía cinética a partir de la velocidad',
    enunciado:
      'Un carrito de 0,5 kg se mueve por un tramo horizontal a 4 m/s. ¿Cuál es su energía cinética?',
    categoria: 'abstracto',
    datos: { magnitud: 'energiaCinetica', masa: 0.5, velocidad: 4 },
    etiquetaRespuesta: 'E_c en julios (J)',
    pista: 'No olvides el ½ delante ni elevar la velocidad al cuadrado. Si te sale 8, falta el medio.',
  },
  {
    id: 3,
    titulo: 'Velocidad al llegar abajo',
    enunciado:
      'Se suelta desde el reposo un objeto de 2 kg situado a 5 m de altura, por una pista sin rozamiento. Con g = 9,8 m/s², ¿con qué velocidad llega al suelo? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'velocidad', masa: 2, alturaInicial: 5, altura: 0 },
    etiquetaRespuesta: 'v en m/s',
    pista: 'Toda la energía potencial de arriba se ha convertido en cinética abajo. Iguala las dos y despeja v.',
  },
  {
    id: 4,
    titulo: 'La energía mecánica, que no cambia',
    enunciado:
      'Un objeto de 3 kg se suelta desde el reposo a 10 m de altura en una pista sin rozamiento. Con g = 9,8 m/s², ¿cuál es su energía mecánica total en ese instante inicial?',
    categoria: 'abstracto',
    datos: { magnitud: 'energiaMecanica', masa: 3, alturaInicial: 10, velocidadInicial: 0 },
    etiquetaRespuesta: 'E_m en julios (J)',
    pista: 'La mecánica es la suma de la potencial y la cinética. Si está parado, una de las dos vale cero.',
  },
  {
    id: 5,
    titulo: 'Energía cinética a media caída',
    enunciado:
      'Una pelota de 0,2 kg se suelta desde 2 m de altura. Sin rozamiento y con g = 9,8 m/s², ¿cuánta energía cinética tiene cuando pasa por los 0,5 m de altura?',
    categoria: 'aplicado',
    datos: { magnitud: 'energiaCinetica', masa: 0.2, alturaInicial: 2, altura: 0.5 },
    etiquetaRespuesta: 'E_c en julios (J)',
    pista: 'Solo se ha convertido en cinética la energía correspondiente a la altura PERDIDA, que no son los 2 m enteros.',
  },
  {
    id: 6,
    titulo: 'Velocidad en ese mismo punto',
    enunciado:
      'Con los datos del caso anterior (pelota de 0,2 kg soltada desde 2 m, g = 9,8 m/s², sin rozamiento), ¿a qué velocidad pasa por los 0,5 m de altura? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'velocidad', masa: 0.2, alturaInicial: 2, altura: 0.5 },
    etiquetaRespuesta: 'v en m/s',
    pista: 'Ya tienes la energía cinética del caso 5. Despeja la velocidad de E_c = ½·m·v².',
  },
  {
    id: 7,
    titulo: 'Desde qué altura soltarlo',
    enunciado:
      '¿Desde qué altura hay que soltar un objeto, sin rozamiento y con g = 9,8 m/s², para que llegue al suelo a 7 m/s?',
    categoria: 'abstracto',
    datos: { magnitud: 'alturaDeSuelta', velocidad: 7 },
    etiquetaRespuesta: 'h en metros',
    pista: 'Iguala m·g·h con ½·m·v² y fíjate en que la masa se simplifica: el resultado es el mismo para cualquier objeto.',
  },
  {
    id: 8,
    titulo: 'Cuando el rozamiento se lleva una parte',
    enunciado:
      'Un carrito de 4 kg baja desde 3 m de altura partiendo del reposo. El rozamiento disipa 20 J durante el descenso. Con g = 9,8 m/s², ¿con cuánta energía cinética llega al suelo?',
    categoria: 'aplicado',
    datos: { magnitud: 'energiaCinetica', masa: 4, alturaInicial: 3, altura: 0, disipada: 20 },
    etiquetaRespuesta: 'E_c en julios (J)',
    pista: 'La energía no desaparece: calcula la mecánica inicial y réstale lo que se ha convertido en calor.',
  },
  {
    id: 9,
    titulo: 'Y la velocidad con la que llega',
    enunciado:
      'Con los datos del caso anterior (carrito de 4 kg desde 3 m, 20 J disipados, g = 9,8 m/s²), ¿a qué velocidad llega al suelo? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'velocidad', masa: 4, alturaInicial: 3, altura: 0, disipada: 20 },
    etiquetaRespuesta: 'v en m/s',
    pista: 'Parte de la energía cinética del caso 8, no de la mecánica inicial: si usas los 117,6 J te saldrá de más.',
  },
  {
    id: 10,
    titulo: 'El trabajo de la fuerza de rozamiento',
    enunciado:
      'Un bloque de 5 kg recorre 3 m por un tramo horizontal con un coeficiente de rozamiento de 0,2. Con g = 9,8 m/s², ¿cuánta energía disipa el rozamiento en ese recorrido?',
    categoria: 'abstracto',
    datos: { magnitud: 'trabajoRozamiento', masa: 5, mu: 0.2, distancia: 3 },
    etiquetaRespuesta: 'W del rozamiento en julios (J)',
    pista: 'En horizontal la fuerza normal es simplemente el peso. El trabajo es esa fuerza de rozamiento por la distancia recorrida.',
  },
  {
    id: 11,
    titulo: 'Hasta dónde vuelve a subir',
    enunciado:
      'Un objeto de 1 kg se suelta desde 4 m de altura y, al subir por el otro lado de la pista, el rozamiento le ha quitado 9,8 J en total. Con g = 9,8 m/s², ¿hasta qué altura llega?',
    categoria: 'aplicado',
    datos: { magnitud: 'alturaFinal', masa: 1, alturaInicial: 4, disipada: 9.8 },
    etiquetaRespuesta: 'h en metros',
    pista: 'En el punto más alto vuelve a estar parado, así que toda la energía que le queda es potencial otra vez.',
  },
  {
    id: 12,
    titulo: 'El reparto en un punto intermedio',
    enunciado:
      'Un objeto de 2 kg se suelta desde 6 m de altura por una pista sin rozamiento. Con g = 9,8 m/s², ¿cuánta energía cinética tiene al pasar por los 2 m de altura?',
    categoria: 'abstracto',
    datos: { magnitud: 'energiaCinetica', masa: 2, alturaInicial: 6, altura: 2 },
    etiquetaRespuesta: 'E_c en julios (J)',
    pista: 'La mecánica total sigue siendo la misma; lo único que ha cambiado es cómo se reparte entre las dos formas.',
  },
];

/**
 * La unidad sola, a partir de una etiqueta del tipo «E_p en julios (J)» → «julios (J)».
 * Evita que la vista recorte la etiqueta por su cuenta y acabe imprimiendo un número suelto
 * junto a media frase (hallazgo 830 de `simulador-genetica`).
 */
export function unidadDe(etiqueta: string): string {
  const corte = etiqueta.indexOf(' en ');
  return corte === -1 ? etiqueta : etiqueta.slice(corte + 4);
}

/** Formatea el resultado con su unidad: «98 julios (J)». */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  return `${numero(valor, decimales)} ${unidadDe(etiqueta)}`;
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta, decimales),
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
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio
 * y aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
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

export interface Ejercicio {
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

const MASAS = [0.5, 1, 2, 3, 4, 5] as const;
const ALTURAS = [2, 3, 4, 5, 6, 8, 10] as const;
const PREGUNTAS = ['energiaPotencial', 'energiaCinetica', 'velocidad'] as const;

/**
 * Ejercicio aleatorio de conservación de la energía, siempre sin rozamiento para que la
 * cuenta quepa en un paso. Usa EL MISMO `resolverCaso` que los doce fijos: si divergieran,
 * el alumno entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const masa = MASAS[Math.floor(rnd() * MASAS.length)] ?? 2;
  const alturaInicial = ALTURAS[Math.floor(rnd() * ALTURAS.length)] ?? 5;
  const magnitud = PREGUNTAS[Math.floor(rnd() * PREGUNTAS.length)] ?? 'energiaPotencial';

  const datos: DatosCaso =
    magnitud === 'energiaPotencial'
      ? { magnitud, masa, altura: alturaInicial }
      : { magnitud, masa, alturaInicial, altura: 0 };

  const r = resolverCaso(datos);

  const TEXTO: Record<(typeof PREGUNTAS)[number], { pregunta: string; etiqueta: string }> = {
    energiaPotencial: {
      pregunta: `¿Cuál es su energía potencial gravitatoria a ${numero(alturaInicial)} m de altura?`,
      etiqueta: 'E_p en julios (J)',
    },
    energiaCinetica: {
      pregunta: `Se suelta desde el reposo a ${numero(alturaInicial)} m de altura, sin rozamiento. ¿Con cuánta energía cinética llega al suelo?`,
      etiqueta: 'E_c en julios (J)',
    },
    velocidad: {
      pregunta: `Se suelta desde el reposo a ${numero(alturaInicial)} m de altura, sin rozamiento. ¿A qué velocidad llega al suelo? Redondea a dos decimales.`,
      etiqueta: 'v en m/s',
    },
  };

  return {
    enunciado: `Un objeto de ${numero(masa)} kg y g = 9,8 m/s². ${TEXTO[magnitud].pregunta}`,
    datos,
    respuesta: r.ok ? redondear(r.valor, 2) : NaN,
    etiquetaRespuesta: TEXTO[magnitud].etiqueta,
    pasos: r.pasos,
  };
}
