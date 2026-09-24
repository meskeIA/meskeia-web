/**
 * Motor de selector-seguro-hogar.
 *
 * Vive aparte, sin dependencias, para poder enumerar todas las combinaciones de respuestas sin
 * navegador: mismo patrón que `app/selector-mascota/motor.ts` (commit 934e57bc). Los umbrales
 * (básica hasta 10, estándar hasta 20, completa desde 21) son los MISMOS que tenía la página.
 *
 * Es UNA puntuación contra dos umbrales. La reparación del 24/09/2026 (hallazgos 1513-1527)
 * separa lo que el usuario DECLARA como situación de lo que es una preferencia:
 *
 *   · FILTRO: ser inquilino/a. La propia opción dice «Solo necesitas asegurar el contenido y RC»:
 *     el continente es del propietario y el inquilino no tiene interés asegurable en él (art. 25
 *     de la Ley 50/1980 de Contrato de Seguro). Las fichas ya no le mandan valorar ni asegurar el
 *     continente, y el precio se lo dice (1513).
 *   · PESO CON AVISO: «El precio más bajo posible» es una PRIORIDAD entre tres, no un tope: la app
 *     no pregunta cuánto se puede pagar, y bajar de nivel a quien tiene hipoteca, zona de riesgo y
 *     objetos de valor lo dejaría sin cubrir lo que acaba de declarar. Se mantiene como peso, pero
 *     si la orientación no es la básica se dice a la cara, con lo que costaría cada nivel (1514).
 *   · AVISOS de lo declarado que la ficha no cubre: objetos de valor con la básica (1515), y las
 *     dos situaciones que antes no se podían declarar: vivienda que se alquila a otros y vivienda
 *     no habitual (segunda residencia o vacía) (1521).
 */

export type VeredictoKey = 'basica' | 'estandar' | 'completa';

export interface Pregunta {
  id: string;
  categoria: string;
  icono: string;
  texto: string;
  opciones: { valor: string; etiqueta: string; descripcion: string; puntos: number }[];
}

/** Hasta este total, cobertura básica; hasta el siguiente, estándar; por encima, completa. */
export const UMBRAL_BASICA = 10;
export const UMBRAL_ESTANDAR = 20;

export const PREGUNTAS: Pregunta[] = [
  {
    id: 'regimen',
    categoria: 'Régimen de Tenencia',
    icono: '🏠',
    texto: '¿Eres propietario/a o inquilino/a?',
    opciones: [
      { valor: 'propietario_hipoteca', etiqueta: 'Propietario/a con hipoteca vigente', descripcion: 'El banco suele exigir un seguro mínimo', puntos: 3 },
      { valor: 'propietario_libre', etiqueta: 'Propietario/a sin hipoteca', descripcion: 'Libre de elegir la cobertura', puntos: 2 },
      { valor: 'inquilino', etiqueta: 'Inquilino/a', descripcion: 'Solo necesitas asegurar el contenido y RC', puntos: 0 },
      // Antes no se podía declarar (hallazgo 1521): el arrendador asegura el continente y su RC,
      // no las pertenencias de quien vive en la vivienda.
      { valor: 'arrendador', etiqueta: 'Propietario/a de una vivienda que alquilo a otros', descripcion: 'Aseguras el continente y tu RC; el contenido es de quien vive en ella', puntos: 2 },
    ],
  },
  {
    id: 'tipo_vivienda',
    categoria: 'Tipo de Vivienda',
    icono: '🏡',
    texto: '¿Qué tipo de vivienda tienes?',
    opciones: [
      { valor: 'piso', etiqueta: 'Piso en edificio de varios vecinos', descripcion: 'Riesgo compartido con comunidad', puntos: 1 },
      { valor: 'unifamiliar', etiqueta: 'Casa unifamiliar o adosado', descripcion: 'Mayor exposición perimetral', puntos: 3 },
      { valor: 'atico_bajo', etiqueta: 'Ático o planta baja', descripcion: 'Más expuesto a filtraciones, robos y clima', puntos: 2 },
      { valor: 'estudio', etiqueta: 'Estudio pequeño o local', descripcion: 'Necesidades más limitadas', puntos: 0 },
    ],
  },
  {
    id: 'antiguedad',
    categoria: 'Antigüedad del Edificio',
    icono: '🏗️',
    texto: '¿Cuántos años tiene aproximadamente el edificio?',
    opciones: [
      { valor: 'nuevo', etiqueta: 'Menos de 10 años', descripcion: 'Instalaciones en buen estado, menos riesgo', puntos: 0 },
      { valor: 'reciente', etiqueta: 'Entre 10 y 30 años', descripcion: 'Buen estado general', puntos: 1 },
      { valor: 'maduro', etiqueta: 'Entre 30 y 50 años', descripcion: 'Puede haber instalaciones antiguas', puntos: 2 },
      { valor: 'antiguo', etiqueta: 'Más de 50 años', descripcion: 'Mayor riesgo de daños estructurales o instalaciones', puntos: 3 },
    ],
  },
  {
    id: 'contenido',
    categoria: 'Valor del Contenido',
    icono: '🛋️',
    texto: '¿Cuánto vale el contenido de tu hogar? (muebles, electrónica, ropa, equipos...)',
    opciones: [
      { valor: 'bajo', etiqueta: 'Menos de 10.000 €', descripcion: 'Contenido básico', puntos: 0 },
      { valor: 'medio', etiqueta: 'Entre 10.000 y 30.000 €', descripcion: 'Hogar equipado con normalidad', puntos: 2 },
      { valor: 'alto', etiqueta: 'Entre 30.000 y 60.000 €', descripcion: 'Buen equipamiento y electrónica', puntos: 3 },
      { valor: 'muy_alto', etiqueta: 'Más de 60.000 €', descripcion: 'Equipamiento premium o colecciones', puntos: 4 },
    ],
  },
  {
    id: 'zona',
    categoria: 'Zona Geográfica',
    icono: '📍',
    texto: '¿En qué tipo de zona está tu vivienda?',
    opciones: [
      { valor: 'urbano', etiqueta: 'Centro urbano consolidado', descripcion: 'Riesgo de robo moderado-alto', puntos: 2 },
      { valor: 'extrarradio', etiqueta: 'Extrarradio o urbanización', descripcion: 'Menor densidad, posible mayor riesgo de robo', puntos: 2 },
      { valor: 'rural_costa', etiqueta: 'Zona rural o costa', descripcion: 'Riesgos climáticos y de aislamiento', puntos: 3 },
      { valor: 'riesgo', etiqueta: 'Zona con riesgo de inundación o incendio forestal', descripcion: 'Riesgo natural significativo', puntos: 4 },
    ],
  },
  {
    id: 'convivientes',
    categoria: 'Unidad Familiar',
    icono: '👨‍👩‍👧',
    texto: '¿Cuántas personas viven habitualmente en la vivienda?',
    opciones: [
      { valor: 'solo', etiqueta: 'Vivo solo/a', descripcion: 'Menor riesgo de daños internos', puntos: 0 },
      { valor: 'pareja', etiqueta: 'Dos personas (pareja, compañeros...)', descripcion: 'Uso normal del hogar', puntos: 1 },
      { valor: 'familia', etiqueta: 'Familia con hijos menores', descripcion: 'Más actividad, más probabilidad de accidentes domésticos', puntos: 2 },
      { valor: 'compartido', etiqueta: 'Piso compartido con varias personas', descripcion: 'Mayor rotación y uso del espacio', puntos: 2 },
      // Antes no se podía declarar (hallazgo 1521), aunque el FAQ da la «vivienda vacacional o no
      // habitual» como uno de los factores que más encarecen la prima.
      { valor: 'nadie', etiqueta: 'Nadie de forma habitual (segunda residencia o vivienda vacía)', descripcion: 'Sin nadie dentro, un siniestro puede tardar en descubrirse', puntos: 2 },
    ],
  },
  {
    id: 'objetos_valor',
    categoria: 'Objetos de Alto Valor',
    icono: '💎',
    texto: '¿Tienes objetos de especial valor en casa?',
    opciones: [
      { valor: 'no', etiqueta: 'No, nada especialmente valioso', descripcion: 'Sin artículos fuera de lo habitual', puntos: 0 },
      { valor: 'algo', etiqueta: 'Sí, algunos artículos de valor (joyas, equipo fotográfico...)', descripcion: 'Conviene asegurarlos específicamente', puntos: 2 },
      { valor: 'mucho', etiqueta: 'Sí, bastante valor acumulado (arte, instrumentos, colecciones...)', descripcion: 'Requiere cobertura específica o valoración', puntos: 4 },
    ],
  },
  {
    id: 'preocupacion',
    categoria: 'Principal Preocupación',
    icono: '⚠️',
    texto: '¿Qué te preocupa más respecto a tu vivienda?',
    opciones: [
      { valor: 'agua', etiqueta: 'Daños por agua (tuberías, filtraciones, comunidad)', descripcion: 'El siniestro más frecuente en España', puntos: 1 },
      { valor: 'robo', etiqueta: 'Robo o vandalismo', descripcion: 'Especialmente si sales mucho o es una zona activa', puntos: 2 },
      { valor: 'incendio', etiqueta: 'Incendio, explosión o fenómenos climáticos', descripcion: 'Daños catastróficos que requieren cobertura sólida', puntos: 3 },
      { valor: 'rc', etiqueta: 'Responsabilidad civil (dañar a vecinos)', descripcion: 'Una fuga mía que cause daños al piso de abajo', puntos: 1 },
      { valor: 'todo', etiqueta: 'Todo por igual, quiero estar tranquilo/a', descripcion: 'Cobertura amplia como prioridad', puntos: 3 },
    ],
  },
  {
    id: 'siniestros',
    categoria: 'Historial de Siniestros',
    icono: '📋',
    texto: '¿Has tenido siniestros en tu vivienda en los últimos 5 años?',
    opciones: [
      { valor: 'ninguno', etiqueta: 'No, ninguno', descripcion: 'Historial limpio', puntos: 0 },
      { valor: 'menor', etiqueta: 'Sí, uno menor (pequeña fuga, cristal roto...)', descripcion: 'Incidentes menores son frecuentes', puntos: 1 },
      { valor: 'significativo', etiqueta: 'Sí, uno o más importantes', descripcion: 'La experiencia de siniestro eleva la percepción del riesgo', puntos: 3 },
    ],
  },
  {
    id: 'prioridad',
    categoria: 'Prioridad al Contratar',
    icono: '🎯',
    texto: '¿Qué priorizas al elegir un seguro de hogar?',
    opciones: [
      // Antes: «Cobertura mínima obligatoria», también a inquilinos y a propietarios sin hipoteca.
      // El seguro de daños solo es exigible sobre el inmueble hipotecado (RD 716/2009, art. 10.1),
      // y el FAQ de la misma página dice que para el inquilino no es obligatorio (hallazgo 1520).
      { valor: 'precio', etiqueta: 'El precio más bajo posible', descripcion: 'Pagar lo menos posible, aunque cubra menos', puntos: 0 },
      { valor: 'equilibrio', etiqueta: 'Equilibrio cobertura-precio', descripcion: 'Bien cubierto sin excesos', puntos: 1 },
      { valor: 'completo', etiqueta: 'La cobertura más amplia posible', descripcion: 'Tranquilidad total aunque cueste más', puntos: 3 },
    ],
  },
];

/** Un elemento de ficha. `continente`: solo tiene sentido para quien asegura el inmueble (no el
 *  inquilino). `inquilino`: lo que se dice en su lugar al inquilino, si hay algo que decir. */
interface ItemFicha { texto: string; continente?: true; inquilino?: string }

interface Ficha {
  icono: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  precioOrientativo: string;
  precioNota: string;
  coberturaIncluida: ItemFicha[];
  coberturaRecomendada: ItemFicha[];
  consejos: ItemFicha[];
}

const NOTA_ESTIMACION = 'Horquilla orientativa (estimación de meskeIA) para una vivienda media en España: el precio final depende del capital asegurado, la zona, la vivienda y la aseguradora.';

export const VEREDICTOS: Record<VeredictoKey, Ficha> = {
  basica: {
    icono: '🛡️',
    etiqueta: 'Tipo de cobertura recomendada',
    titulo: 'Cobertura Básica',
    descripcion: 'Tu perfil no requiere una cobertura muy amplia. Una póliza básica que cubra los daños más frecuentes y la responsabilidad civil te dará tranquilidad sin gastar de más.',
    precioOrientativo: '100 – 200 €/año',
    precioNota: NOTA_ESTIMACION,
    coberturaIncluida: [
      { texto: 'Incendio y explosión' },
      { texto: 'Daños por agua (tuberías propias)' },
      { texto: 'Responsabilidad civil frente a terceros' },
      { texto: 'Robo con fuerza en el inmueble' },
      { texto: 'Fenómenos eléctricos' },
    ],
    coberturaRecomendada: [
      { texto: 'Asistencia en el hogar 24h (reparaciones urgentes)' },
      { texto: 'Defensa jurídica básica' },
    ],
    consejos: [
      { texto: 'Comprueba que el capital del continente está actualizado: es el coste de reconstruir la vivienda, sin el suelo', continente: true },
      { texto: 'La RC a terceros es imprescindible: una fuga tuya puede causar daños cuantiosos' },
      { texto: 'Revisa la póliza anualmente — los precios y necesidades cambian' },
      { texto: 'Aunque el seguro sea básico, lee bien las exclusiones' },
    ],
  },
  estandar: {
    icono: '🏠',
    etiqueta: 'Tipo de cobertura recomendada',
    titulo: 'Multirriesgo Estándar',
    descripcion: 'Tu situación aconseja una póliza multirriesgo que va más allá de lo básico. Protección completa contra los riesgos más frecuentes y algunos específicos de tu caso.',
    precioOrientativo: '200 – 400 €/año',
    precioNota: NOTA_ESTIMACION,
    coberturaIncluida: [
      { texto: 'Todo lo de la cobertura básica' },
      { texto: 'Daños por agua de comunidad y vecinos' },
      { texto: 'Robo y expoliación (también fuera del hogar)' },
      { texto: 'Fenómenos atmosféricos (granizo, viento, nieve)' },
      { texto: 'Asistencia en el hogar 24h' },
      { texto: 'Defensa jurídica' },
    ],
    coberturaRecomendada: [
      { texto: 'Objetos de valor con capital específico' },
      { texto: 'Daños estéticos si el piso es relativamente moderno', continente: true },
      { texto: 'Seguro de hogar vacacional si tienes segunda residencia' },
    ],
    consejos: [
      { texto: 'Declara correctamente el valor del contenido — el infraseguro te perjudica' },
      { texto: 'Pregunta por el capital de robo: algunos básicos tienen límites muy bajos' },
      { texto: 'La asistencia 24h es de las coberturas más usadas — valórala bien' },
      { texto: 'Compara al menos 3 presupuestos antes de decidir' },
    ],
  },
  completa: {
    icono: '⭐',
    etiqueta: 'Tipo de cobertura recomendada',
    titulo: 'Multirriesgo Completa',
    // Antes: «Ya sea por el valor de la vivienda [que la app no pregunta], el contenido, la zona de
    // riesgo o tus prioridades», también a quien había elegido el precio más bajo (1513, 1514).
    // La descripción de la pantalla la compone calcularResultado con lo que ha pesado.
    descripcion: 'Tu perfil justifica la cobertura más amplia disponible.',
    precioOrientativo: '400 – 800 €/año',
    precioNota: NOTA_ESTIMACION,
    coberturaIncluida: [
      { texto: 'Todo lo de la cobertura estándar' },
      { texto: 'Daños estéticos y ornamentales', continente: true },
      { texto: 'Objetos de especial valor (joyería, obras de arte, colecciones)' },
      { texto: 'Protección jurídica amplia' },
      { texto: 'Responsabilidad civil ampliada' },
      { texto: 'Todo riesgo accidental del contenido' },
    ],
    coberturaRecomendada: [
      { texto: 'Valoración pericial del continente y contenido', continente: true, inquilino: 'Tasación del contenido y de los objetos de valor' },
      { texto: 'Cobertura específica de equipos electrónicos portátiles' },
      { texto: 'Seguro de segunda residencia o de alquiler (arriendo) si procede' },
    ],
    consejos: [
      { texto: 'Solicita una valoración profesional del continente para asegurarlo correctamente', continente: true, inquilino: 'Haz un inventario del contenido y, si tienes objetos de valor, pide su tasación para fijar bien el capital' },
      { texto: 'Los objetos de valor especial (joyas, arte) suelen necesitar tasación y declaración expresa' },
      { texto: 'Lee las condiciones de indemnización: valor venal vs valor nuevo hace mucha diferencia' },
      { texto: 'Revisa si tu póliza cubre daños durante obras o reformas', continente: true },
    ],
  },
};

/** La ficha que ve ESTE perfil, ya filtrada por lo que ha declarado. */
export interface FichaResuelta {
  descripcion: string;
  precioNota: string;
  coberturaIncluida: string[];
  coberturaRecomendada: string[];
  consejos: string[];
}

export interface Resultado {
  veredicto: VeredictoKey;
  puntuacion: number;
  /** Las respuestas que más han sumado, de más a menos. */
  razones: string[];
  /** Las que no han sumado nada: TODAS (antes se cortaban en tres y la prioridad desaparecía, 1514). */
  sinPeso: string[];
  ficha: FichaResuelta;
  /** Lo declarado que la cobertura recomendada no recoge, dicho a la cara (role="note"). */
  avisos: string[];
}

const enLetra = (n: number) => `${n} ${n === 1 ? 'punto' : 'puntos'}`;
const enumerar = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);

/** Resuelve una lista de la ficha para el régimen declarado. */
function resolver(items: ItemFicha[], inquilino: boolean): string[] {
  return items.flatMap((it) => (it.continente && inquilino ? (it.inquilino ? [it.inquilino] : []) : [it.texto]));
}

export function calcularResultado(respuestas: Record<string, string>): Resultado {
  let puntuacion = 0;
  const suman: { categoria: string; etiqueta: string; puntos: number; i: number }[] = [];
  const noSuman: string[] = [];
  PREGUNTAS.forEach((p, i) => {
    const op = p.opciones.find((o) => o.valor === respuestas[p.id]);
    if (!op) return;
    puntuacion += op.puntos;
    if (op.puntos > 0) suman.push({ categoria: p.categoria, etiqueta: op.etiqueta, puntos: op.puntos, i });
    else noSuman.push(`${p.categoria}: «${op.etiqueta}» no suma puntos.`);
  });

  let veredicto: VeredictoKey;
  if (puntuacion <= UMBRAL_BASICA) veredicto = 'basica';
  else if (puntuacion <= UMBRAL_ESTANDAR) veredicto = 'estandar';
  else veredicto = 'completa';

  const ordenadas = [...suman].sort((a, b) => b.puntos - a.puntos || a.i - b.i);
  const razones = ordenadas.slice(0, 3).map((s) => `${s.categoria}: «${s.etiqueta}» suma ${enLetra(s.puntos)}.`);

  // ─ La ficha de ESTE perfil ─
  const base = VEREDICTOS[veredicto];
  const inquilino = respuestas.regimen === 'inquilino';
  // Las categorías van en mayúsculas de título («Valor del Contenido»): en la frase, en minúscula.
  const pesa = enumerar(ordenadas.slice(0, 2).map((s) => s.categoria.toLowerCase()));
  const descripcion = veredicto === 'completa' && pesa ? `${base.descripcion} Lo que más ha pesado: ${pesa}.` : base.descripcion;
  const precioNota = inquilino
    ? `${base.precioNota} Las horquillas son de pólizas con continente: una de inquilino, solo con contenido y responsabilidad civil, asegura menos capital y su prima es menor.`
    : base.precioNota;
  const ficha: FichaResuelta = {
    descripcion,
    precioNota,
    coberturaIncluida: resolver(base.coberturaIncluida, inquilino),
    coberturaRecomendada: resolver(base.coberturaRecomendada, inquilino),
    consejos: resolver(base.consejos, inquilino),
  };

  // ─ Avisos ─
  const avisos: string[] = [];
  if (respuestas.prioridad === 'precio' && veredicto !== 'basica') {
    avisos.push(
      `Has dicho que priorizas el precio más bajo posible, pero por tus respuestas la orientación es la ${base.titulo.toLowerCase()} (${base.precioOrientativo}, estimación de meskeIA). Si contratas solo la cobertura básica (${VEREDICTOS.basica.precioOrientativo}), revisa en «Coberturas incluidas» lo que dejarías fuera, sobre todo lo que tiene que ver con lo que más ha sumado: ${pesa}.`,
    );
  }
  if ((respuestas.objetos_valor === 'algo' || respuestas.objetos_valor === 'mucho') && veredicto === 'basica') {
    avisos.push(
      'Has declarado objetos de especial valor, pero la cobertura básica no los incluye: pide que se declaren en la póliza con su capital (a menudo con tasación) o valora una multirriesgo que los cubra.',
    );
  }
  if (respuestas.regimen === 'arrendador') {
    avisos.push(
      'Si alquilas la vivienda a otros, tú aseguras el continente, tu responsabilidad civil como propietario/a y, si la alquilas amueblada, tu mobiliario; las pertenencias de quien vive en ella las asegura esa persona. Díselo a la aseguradora al contratar: que la vivienda esté alquilada influye en la valoración del riesgo y hay que declararlo (art. 10 de la Ley 50/1980 de Contrato de Seguro).',
    );
  }
  if (respuestas.convivientes === 'nadie') {
    avisos.push(
      'Si no es tu vivienda habitual (segunda residencia o vivienda vacía), díselo a la aseguradora al contratar: influye en la valoración del riesgo y hay que declararlo (art. 10 de la Ley 50/1980 de Contrato de Seguro). Revisa además qué coberturas limita la póliza mientras la vivienda está deshabitada.',
    );
  }

  return { veredicto, puntuacion, razones, sinPeso: noSuman, ficha, avisos };
}
