/**
 * Motor de la Calculadora de Escalas.
 *
 * Vive fuera de `page.tsx` a propósito: el build compila la vista sin comprobar si una
 * conversión está bien. Una escala invertida —multiplicar donde había que dividir— compila
 * igual de limpio que la correcta y produce números con toda la pinta de ser válidos: un
 * muro de 7,2 cm en un plano 1:50 sale 3,6 m si se hace bien y 1,44 mm si se hace al revés,
 * y las dos cifras caben en la casilla sin protestar. Aquí no hay React ni DOM: solo
 * funciones puras con entradas y salidas comprobables a mano.
 *
 * EL CONVENIO (lo que de verdad importa en esta app)
 * ─────────────────────────────────────────────────
 * 1. UNA ESCALA ES UNA RAZÓN `numerador : denominador`, y se lee «lo que mide en el dibujo
 *    frente a lo que mide en la realidad». En 1:50 el dibujo es 50 veces más pequeño; en
 *    5:1 es 5 veces más grande. El FACTOR es numerador/denominador, así que una reducción
 *    tiene factor < 1 y una ampliación, > 1.
 *
 *      medida en el dibujo = medida real × factor
 *      medida real         = medida en el dibujo ÷ factor
 *
 * 2. TODO SE CALCULA EN MILÍMETROS y se convierte al final. Mezclar unidades a mitad de una
 *    cadena de multiplicaciones es la forma más fácil de perder un factor 10 sin enterarse,
 *    y en esta app la unidad de entrada y la de salida casi nunca coinciden: se entra un
 *    plano en centímetros y se quiere el resultado en metros.
 *
 * 3. LAS SUPERFICIES ESCALAN CON EL CUADRADO DEL FACTOR, no con el factor. Es el error más
 *    repetido del tema y por eso tiene función propia, `convertirSuperficie`, en lugar de
 *    dejar que quien use el motor lo resuelva por su cuenta: un plano 1:50 reduce las
 *    longitudes 50 veces y las áreas 2.500. Los volúmenes irían con el cubo, pero esta app
 *    no los trata y no se inventa una función que nadie ha comprobado.
 *
 * 4. NADA LANZA. Una entrada imposible devuelve `{ ok: false, error }` y jamás una
 *    excepción: un `throw` dentro de un render de React tumba la app entera, mientras que un
 *    resultado no-ok se pinta como aviso. Tampoco se devuelve NaN a la vista.
 */

import { parseSpanishNumber } from '@/lib';

// ============================================================
// UNIDADES
// ============================================================

export type Unidad = 'mm' | 'cm' | 'm' | 'km';

/** Cuántos milímetros vale cada unidad. Es la única tabla de conversión del módulo. */
export const MILIMETROS_POR_UNIDAD: Record<Unidad, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  km: 1000000,
};

export const UNIDADES: readonly Unidad[] = ['mm', 'cm', 'm', 'km'];

/** Nombre largo de cada unidad, para los textos que acompañan a un número. */
export const NOMBRE_UNIDAD: Record<Unidad, string> = {
  mm: 'milímetros',
  cm: 'centímetros',
  m: 'metros',
  km: 'kilómetros',
};

export function aMilimetros(valor: number, unidad: Unidad): number {
  return valor * MILIMETROS_POR_UNIDAD[unidad];
}

export function desdeMilimetros(milimetros: number, unidad: Unidad): number {
  return milimetros / MILIMETROS_POR_UNIDAD[unidad];
}

// ============================================================
// ESCALAS
// ============================================================

export interface Escala {
  /** Lo que mide en el dibujo. */
  numerador: number;
  /** Lo que mide en la realidad. */
  denominador: number;
}

export interface ResultadoEscala {
  ok: boolean;
  escala: Escala | null;
  error: string | null;
}

/** El factor de la escala: cuánto mide el dibujo por cada unidad de realidad. */
export function factorDe(escala: Escala): number {
  return escala.numerador / escala.denominador;
}

/** Una escala de reducción encoge (1:50); una de ampliación agranda (5:1); 1:1 es natural. */
export function tipoDeEscala(escala: Escala): 'reduccion' | 'ampliacion' | 'natural' {
  const factor = factorDe(escala);
  if (Math.abs(factor - 1) < 1e-12) return 'natural';
  return factor < 1 ? 'reduccion' : 'ampliacion';
}

/** Texto canónico de una escala, siempre con dos puntos: «1:50», «5:1», «1:2,5». */
export function textoDeEscala(escala: Escala): string {
  const n = formatearNumero(escala.numerador);
  const d = formatearNumero(escala.denominador);
  return `${n}:${d}`;
}

/**
 * Lee una escala escrita a mano.
 *
 * Admite las tres formas que la gente usa —«1:50», «1/50» y «1 50»— y también un número
 * suelto, que se interpreta como el denominador de una reducción: quien escribe «50» en una
 * casilla de escala quiere 1:50, no 50:1. Devolver un error ahí sería técnicamente correcto
 * y prácticamente inútil.
 *
 * Las cantidades pasan por `parseSpanishNumber`, así que «1:2,5» se lee como uno a dos coma
 * cinco y no como uno a veinticinco.
 */
export function parsearEscala(texto: string): ResultadoEscala {
  const limpio = texto.trim();
  if (limpio === '') return { ok: false, escala: null, error: 'Escribe una escala, por ejemplo 1:50' };

  const partes = limpio.split(/[:/\s]+/).filter((p) => p !== '');

  let numerador: number;
  let denominador: number;

  if (partes.length === 1) {
    // Un número suelto es el denominador de una reducción: «50» significa 1:50.
    numerador = 1;
    denominador = parseSpanishNumber(partes[0]);
  } else if (partes.length === 2) {
    numerador = parseSpanishNumber(partes[0]);
    denominador = parseSpanishNumber(partes[1]);
  } else {
    return { ok: false, escala: null, error: 'La escala se escribe con dos números, como 1:50' };
  }

  if (!Number.isFinite(numerador) || !Number.isFinite(denominador)) {
    return { ok: false, escala: null, error: 'La escala debe llevar dos números, como 1:50' };
  }
  if (numerador <= 0 || denominador <= 0) {
    return { ok: false, escala: null, error: 'Los dos términos de una escala son positivos' };
  }

  return { ok: true, escala: { numerador, denominador }, error: null };
}

// ============================================================
// CONVERSIÓN DE LONGITUDES
// ============================================================

export interface ResultadoMedida {
  ok: boolean;
  /** El valor ya en la unidad de salida. */
  valor: number;
  /** El mismo valor en milímetros, por si hace falta encadenar. */
  milimetros: number;
  error: string | null;
}

function fallo(error: string): ResultadoMedida {
  return { ok: false, valor: NaN, milimetros: NaN, error };
}

/**
 * De la medida del dibujo a la medida real.
 *
 * En 1:50, 7,2 cm de plano son 7,2 × 50 = 360 cm = 3,6 m.
 */
export function medidaReal(
  medidaEnPlano: number,
  unidadPlano: Unidad,
  escala: Escala,
  unidadSalida: Unidad,
): ResultadoMedida {
  if (!Number.isFinite(medidaEnPlano)) return fallo('Escribe una medida válida');
  if (medidaEnPlano < 0) return fallo('Una medida no puede ser negativa');
  const factor = factorDe(escala);
  if (!Number.isFinite(factor) || factor <= 0) return fallo('La escala no es válida');

  const milimetros = aMilimetros(medidaEnPlano, unidadPlano) / factor;
  if (!Number.isFinite(milimetros)) return fallo('El resultado se sale del rango representable');
  return { ok: true, valor: desdeMilimetros(milimetros, unidadSalida), milimetros, error: null };
}

/**
 * De la medida real a la medida del dibujo.
 *
 * En 1:100, 4,5 m reales son 4,5 ÷ 100 = 0,045 m = 4,5 cm de plano.
 */
export function medidaEnPlano(
  medidaRealEntrada: number,
  unidadReal: Unidad,
  escala: Escala,
  unidadSalida: Unidad,
): ResultadoMedida {
  if (!Number.isFinite(medidaRealEntrada)) return fallo('Escribe una medida válida');
  if (medidaRealEntrada < 0) return fallo('Una medida no puede ser negativa');
  const factor = factorDe(escala);
  if (!Number.isFinite(factor) || factor <= 0) return fallo('La escala no es válida');

  const milimetros = aMilimetros(medidaRealEntrada, unidadReal) * factor;
  if (!Number.isFinite(milimetros)) return fallo('El resultado se sale del rango representable');
  return { ok: true, valor: desdeMilimetros(milimetros, unidadSalida), milimetros, error: null };
}

/**
 * Deduce la escala a partir de una medida del dibujo y su medida real.
 *
 * Se devuelve SIEMPRE normalizada a numerador 1 cuando es una reducción, porque así es como
 * se rotula un plano: nadie escribe «3:600», escribe «1:200».
 */
export function deducirEscala(
  medidaDibujo: number,
  unidadDibujo: Unidad,
  medidaRealValor: number,
  unidadReal: Unidad,
): ResultadoEscala {
  if (!Number.isFinite(medidaDibujo) || !Number.isFinite(medidaRealValor)) {
    return { ok: false, escala: null, error: 'Escribe las dos medidas' };
  }
  if (medidaDibujo <= 0 || medidaRealValor <= 0) {
    return { ok: false, escala: null, error: 'Las dos medidas tienen que ser mayores que cero' };
  }

  const dibujoMm = aMilimetros(medidaDibujo, unidadDibujo);
  const realMm = aMilimetros(medidaRealValor, unidadReal);
  const factor = dibujoMm / realMm;
  if (!Number.isFinite(factor) || factor <= 0) {
    return { ok: false, escala: null, error: 'Con esas medidas no sale una escala válida' };
  }

  if (factor <= 1) {
    // Reducción: 1 : (realMm / dibujoMm)
    return { ok: true, escala: { numerador: 1, denominador: redondear(1 / factor, 4) }, error: null };
  }
  // Ampliación: (dibujoMm / realMm) : 1
  return { ok: true, escala: { numerador: redondear(factor, 4), denominador: 1 }, error: null };
}

/**
 * Cuánto hay que multiplicar las medidas de un dibujo para redibujarlo a otra escala.
 *
 * Pasar un plano de 1:200 a 1:50 multiplica sus medidas por 4, porque 1/50 ÷ 1/200 = 4. No
 * interviene ninguna medida real: es la razón entre los dos factores.
 */
export function factorEntreEscalas(origen: Escala, destino: Escala): number {
  return factorDe(destino) / factorDe(origen);
}

/**
 * Convierte una superficie entre dibujo y realidad.
 *
 * Va aparte de las longitudes porque el factor entra AL CUADRADO, que es justo lo que más
 * se falla: en 1:50 las longitudes se dividen entre 50 y las áreas entre 2.500.
 *
 * Las unidades de superficie se derivan de las lineales elevándolas al cuadrado, así que
 * 1 m² son 1.000.000 mm² y no 1.000.
 */
export function convertirSuperficie(
  valor: number,
  unidadEntrada: Unidad,
  escala: Escala,
  unidadSalida: Unidad,
  sentido: 'plano-a-real' | 'real-a-plano',
): ResultadoMedida {
  if (!Number.isFinite(valor)) return fallo('Escribe una superficie válida');
  if (valor < 0) return fallo('Una superficie no puede ser negativa');
  const factor = factorDe(escala);
  if (!Number.isFinite(factor) || factor <= 0) return fallo('La escala no es válida');

  const mm2Entrada = valor * Math.pow(MILIMETROS_POR_UNIDAD[unidadEntrada], 2);
  const mm2Salida =
    sentido === 'plano-a-real' ? mm2Entrada / Math.pow(factor, 2) : mm2Entrada * Math.pow(factor, 2);
  if (!Number.isFinite(mm2Salida)) return fallo('El resultado se sale del rango representable');

  return {
    ok: true,
    valor: mm2Salida / Math.pow(MILIMETROS_POR_UNIDAD[unidadSalida], 2),
    milimetros: mm2Salida,
    error: null,
  };
}

// ============================================================
// ESCALA GRÁFICA
// ============================================================

export interface DivisionEscalaGrafica {
  /** Qué distancia REAL representa esta marca, en la unidad de la escala gráfica. */
  valorReal: number;
  /** A cuántos milímetros del origen hay que dibujarla sobre el papel. */
  milimetrosEnPapel: number;
}

export interface EscalaGrafica {
  ok: boolean;
  divisiones: readonly DivisionEscalaGrafica[];
  unidad: Unidad;
  /** Longitud total de la barra sobre el papel, en milímetros. */
  longitudPapelMm: number;
  /** Qué distancia real abarca la barra entera. */
  totalReal: number;
  error: string | null;
}

/**
 * Construye una escala gráfica: la reglita que se imprime junto a un plano y permite medir
 * sobre él sin calcular nada.
 *
 * Es lo único de esta app que un PDF no da, y tiene una condición que la hace útil o
 * inútil: **debe imprimirse al 100 %**. Si el navegador la ajusta a la página, las
 * distancias dejan de ser ciertas y la regla miente, así que la interfaz lo advierte.
 *
 * El paso se elige para que la barra quepa en un ancho razonable de papel y las marcas
 * caigan en cifras redondas —1, 2 o 5 por década—, que es como se rotulan las escalas
 * gráficas de verdad: una marca cada 3,7 m no la lee nadie.
 */
export function construirEscalaGrafica(
  escala: Escala,
  unidad: Unidad,
  longitudPapelMmDeseada = 100,
): EscalaGrafica {
  const vacia: EscalaGrafica = {
    ok: false,
    divisiones: [],
    unidad,
    longitudPapelMm: 0,
    totalReal: 0,
    error: null,
  };

  const factor = factorDe(escala);
  if (!Number.isFinite(factor) || factor <= 0) {
    return { ...vacia, error: 'La escala no es válida' };
  }
  if (!Number.isFinite(longitudPapelMmDeseada) || longitudPapelMmDeseada <= 0) {
    return { ...vacia, error: 'La longitud de la barra tiene que ser positiva' };
  }

  // Cuánta realidad abarca la barra deseada, en la unidad pedida.
  const realTotalMm = longitudPapelMmDeseada / factor;
  const realTotal = desdeMilimetros(realTotalMm, unidad);
  if (!Number.isFinite(realTotal) || realTotal <= 0) {
    return { ...vacia, error: 'Con esa escala la barra no representa ninguna distancia medible' };
  }

  // Paso «bonito»: 1, 2 o 5 por década, apuntando a unas 5 divisiones.
  const pasoIdeal = realTotal / 5;
  const decada = Math.pow(10, Math.floor(Math.log10(pasoIdeal)));
  const normalizado = pasoIdeal / decada;
  const paso = (normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10) * decada;
  if (!Number.isFinite(paso) || paso <= 0) {
    return { ...vacia, error: 'Con esa escala no se puede construir una barra legible' };
  }

  const divisiones: DivisionEscalaGrafica[] = [];
  const numeroDivisiones = Math.max(1, Math.floor(realTotal / paso));
  for (let i = 0; i <= numeroDivisiones; i++) {
    const valorReal = redondear(i * paso, 6);
    divisiones.push({
      valorReal,
      milimetrosEnPapel: aMilimetros(valorReal, unidad) * factor,
    });
  }

  const ultima = divisiones[divisiones.length - 1];
  return {
    ok: true,
    divisiones,
    unidad,
    longitudPapelMm: ultima.milimetrosEnPapel,
    totalReal: ultima.valorReal,
    error: null,
  };
}

// ============================================================
// LISTA DE MEDIDAS
// ============================================================

export interface MedidaDeLista {
  /** Lo que escribió la persona, tal cual, para poder señalar la línea que falla. */
  original: string;
  ok: boolean;
  entrada: number;
  salida: number;
  error: string | null;
}

/**
 * Convierte de golpe una lista de medidas pegada por quien la tenga en una tabla.
 *
 * ⚠️ Los separadores se prueban POR ORDEN —salto de línea, punto y coma, tabulador— y la
 * coma NO es uno de ellos: en español la coma es el separador decimal, así que partir por
 * comas convertiría «1,5 3 4,5» en los trozos «1», «5 3 4» y «5», y el segundo se leería
 * como 534 sin que nada avise. Si no aparece ninguno de los tres separadores admitidos, se
 * cae al espacio, que solo es ambiguo si alguien escribe «1 500» queriendo decir mil
 * quinientos, y eso ya lo resuelve `parseSpanishNumber` en cada trozo por separado.
 */
export function partirLista(texto: string): string[] {
  const limpio = texto.trim();
  if (limpio === '') return [];
  for (const separador of ['\n', ';', '\t']) {
    if (limpio.includes(separador)) {
      return limpio
        .split(separador)
        .map((t) => t.trim())
        .filter((t) => t !== '');
    }
  }
  return limpio
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t !== '');
}

export function convertirLista(
  texto: string,
  unidadEntrada: Unidad,
  escala: Escala,
  unidadSalida: Unidad,
  sentido: 'plano-a-real' | 'real-a-plano',
): MedidaDeLista[] {
  return partirLista(texto).map((original) => {
    const entrada = parseSpanishNumber(original);
    if (!Number.isFinite(entrada)) {
      return { original, ok: false, entrada: NaN, salida: NaN, error: 'No es un número' };
    }
    const resultado =
      sentido === 'plano-a-real'
        ? medidaReal(entrada, unidadEntrada, escala, unidadSalida)
        : medidaEnPlano(entrada, unidadEntrada, escala, unidadSalida);
    return {
      original,
      ok: resultado.ok,
      entrada,
      salida: resultado.valor,
      error: resultado.error,
    };
  });
}

// ============================================================
// ESCALAS HABITUALES
// ============================================================

export interface EscalaConocida {
  escala: Escala;
  etiqueta: string;
  /** Dónde se usa de verdad. Sin esto la lista es un menú de números sin significado. */
  uso: string;
  familia: 'dibujo' | 'maqueta' | 'mapa';
}

/**
 * Las escalas normalizadas que alguien va a querer con un clic.
 *
 * Las de dibujo técnico son las de la serie normalizada (múltiplos de 1, 2 y 5). Las de
 * maquetismo NO son redondas y esa es justo su gracia: 1:87 sale de que el ancho de vía H0
 * es la mitad del de la escala 1 (1:43,5), y por eso se conserva un número tan raro.
 */
export const ESCALAS_CONOCIDAS: readonly EscalaConocida[] = [
  { escala: { numerador: 1, denominador: 1 }, etiqueta: '1:1', uso: 'Tamaño natural', familia: 'dibujo' },
  { escala: { numerador: 2, denominador: 1 }, etiqueta: '2:1', uso: 'Ampliación de piezas pequeñas', familia: 'dibujo' },
  { escala: { numerador: 5, denominador: 1 }, etiqueta: '5:1', uso: 'Ampliación de detalle', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 2 }, etiqueta: '1:2', uso: 'Piezas de mecanizado', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 5 }, etiqueta: '1:5', uso: 'Piezas y detalles constructivos', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 10 }, etiqueta: '1:10', uso: 'Detalles constructivos y mobiliario', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 20 }, etiqueta: '1:20', uso: 'Secciones y detalles de obra', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 25 }, etiqueta: '1:25', uso: 'Cocinas, baños y estancias', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 50 }, etiqueta: '1:50', uso: 'Planta de vivienda (la más habitual)', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 100 }, etiqueta: '1:100', uso: 'Planta de edificio completo', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 200 }, etiqueta: '1:200', uso: 'Edificios grandes y conjuntos', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 500 }, etiqueta: '1:500', uso: 'Parcelas y urbanización', familia: 'dibujo' },
  { escala: { numerador: 1, denominador: 1000 }, etiqueta: '1:1000', uso: 'Planeamiento urbano', familia: 'mapa' },
  { escala: { numerador: 1, denominador: 5000 }, etiqueta: '1:5000', uso: 'Cartografía de detalle', familia: 'mapa' },
  { escala: { numerador: 1, denominador: 25000 }, etiqueta: '1:25000', uso: 'Mapa topográfico y senderismo', familia: 'mapa' },
  { escala: { numerador: 1, denominador: 50000 }, etiqueta: '1:50000', uso: 'Mapa topográfico general', familia: 'mapa' },
  { escala: { numerador: 1, denominador: 12 }, etiqueta: '1:12', uso: 'Casas de muñecas y dioramas', familia: 'maqueta' },
  { escala: { numerador: 1, denominador: 18 }, etiqueta: '1:18', uso: 'Automóvil de colección grande', familia: 'maqueta' },
  { escala: { numerador: 1, denominador: 24 }, etiqueta: '1:24', uso: 'Maqueta de automóvil', familia: 'maqueta' },
  { escala: { numerador: 1, denominador: 35 }, etiqueta: '1:35', uso: 'Modelismo militar', familia: 'maqueta' },
  { escala: { numerador: 1, denominador: 43 }, etiqueta: '1:43', uso: 'Automóvil en miniatura', familia: 'maqueta' },
  { escala: { numerador: 1, denominador: 72 }, etiqueta: '1:72', uso: 'Aviación', familia: 'maqueta' },
  { escala: { numerador: 1, denominador: 87 }, etiqueta: '1:87 (H0)', uso: 'Ferroviario H0, el más extendido', familia: 'maqueta' },
  { escala: { numerador: 1, denominador: 160 }, etiqueta: '1:160 (N)', uso: 'Ferroviario N', familia: 'maqueta' },
  { escala: { numerador: 1, denominador: 220 }, etiqueta: '1:220 (Z)', uso: 'Ferroviario Z', familia: 'maqueta' },
];

// ============================================================
// FORMATO
// ============================================================

export function redondear(valor: number, decimales: number): number {
  const potencia = Math.pow(10, decimales);
  return Math.round(valor * potencia) / potencia;
}

/**
 * Formato español, con los decimales que el número necesite hasta un máximo.
 *
 * No se usa `toFixed` a secas porque rellena de ceros: una escala 1:50 se rotularía «1:50,00».
 * Y no se usa `formatNumber` de `@/lib` en los denominadores porque ahí el separador de
 * millares estorba: «1:50000» es una escala, «1:50.000» parece un número con decimales.
 */
export function formatearNumero(valor: number, maxDecimales = 4): string {
  if (!Number.isFinite(valor)) return '—';
  const redondeado = redondear(valor, maxDecimales);
  if (Number.isInteger(redondeado)) return String(redondeado);
  return String(redondeado).replace('.', ',');
}
