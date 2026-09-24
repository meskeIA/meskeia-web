/**
 * Motor de selector-seguro-hogar.
 *
 * Vive aparte, sin dependencias, para poder enumerar todas las combinaciones de respuestas sin
 * navegador: mismo patrón que `app/selector-mascota/motor.ts` (commit 934e57bc). Las preguntas,
 * sus puntos y los umbrales (básica hasta 10, estándar hasta 20, completa desde 21) son los
 * MISMOS que tenía la página.
 *
 * Aquí no hay empates que deshacer: es UNA puntuación contra dos umbrales. Lo que cambia son
 * las razones. Antes cada cobertura traía cuatro fijas, y a quien salía «completa» sin un solo
 * objeto de valor y en pleno centro urbano le decía «Tienes objetos de valor que requieren
 * cobertura específica» y «Vives en zona con riesgos específicos (inundación, incendio
 * forestal, robo)». Ahora se citan las respuestas que más han sumado, y aparte las que no han
 * sumado nada, con la puntuación y los umbrales a la vista.
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
      { valor: 'precio', etiqueta: 'El precio más bajo posible', descripcion: 'Cobertura mínima obligatoria', puntos: 0 },
      { valor: 'equilibrio', etiqueta: 'Equilibrio cobertura-precio', descripcion: 'Bien cubierto sin excesos', puntos: 1 },
      { valor: 'completo', etiqueta: 'La cobertura más amplia posible', descripcion: 'Tranquilidad total aunque cueste más', puntos: 3 },
    ],
  },
];

export const VEREDICTOS: Record<VeredictoKey, {
  icono: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  precioOrientativo: string;
  precioNota: string;
  coberturaIncluida: string[];
  coberturaRecomendada: string[];
  consejos: string[];
}> = {
  basica: {
    icono: '🛡️',
    etiqueta: 'Tipo de cobertura recomendada',
    titulo: 'Cobertura Básica',
    descripcion: 'Tu perfil no requiere una cobertura muy amplia. Una póliza básica que cubra los daños más frecuentes y la responsabilidad civil te dará tranquilidad sin gastar de más.',
    precioOrientativo: '100 – 200 €/año',
    precioNota: 'Orientativo para piso medio en España. Precio final depende de la aseguradora y características.',
    coberturaIncluida: [
      'Incendio y explosión',
      'Daños por agua (tuberías propias)',
      'Responsabilidad civil frente a terceros',
      'Robo con fuerza en el inmueble',
      'Fenómenos eléctricos',
    ],
    coberturaRecomendada: [
      'Asistencia en el hogar 24h (reparaciones urgentes)',
      'Defensa jurídica básica',
    ],
    consejos: [
      'Comprueba que el capital del continente está actualizado si eres propietario',
      'La RC a terceros es imprescindible: una fuga tuya puede causar daños cuantiosos',
      'Revisa la póliza anualmente — los precios y necesidades cambian',
      'Aunque el seguro sea básico, lee bien las exclusiones',
    ],
  },
  estandar: {
    icono: '🏠',
    etiqueta: 'Tipo de cobertura recomendada',
    titulo: 'Multirriesgo Estándar',
    descripcion: 'Tu situación aconseja una póliza multirriesgo que va más allá de lo básico. Protección completa contra los riesgos más frecuentes y algunos específicos de tu caso.',
    precioOrientativo: '200 – 400 €/año',
    precioNota: 'Orientativo para hogar medio en España. El precio varía según capitales asegurados y aseguradora.',
    coberturaIncluida: [
      'Todo lo de la cobertura básica',
      'Daños por agua de comunidad y vecinos',
      'Robo y expoliación (también fuera del hogar)',
      'Fenómenos atmosféricos (granizo, viento, nieve)',
      'Asistencia en el hogar 24h',
      'Defensa jurídica',
    ],
    coberturaRecomendada: [
      'Objetos de valor con capital específico',
      'Daños estéticos si el piso es relativamente moderno',
      'Seguro de hogar vacacional si tienes segunda residencia',
    ],
    consejos: [
      'Declara correctamente el valor del contenido — el infraseguro te perjudica',
      'Pregunta por el capital de robo: algunos básicos tienen límites muy bajos',
      'La asistencia 24h es de las coberturas más usadas — valórala bien',
      'Compara al menos 3 presupuestos antes de decidir',
    ],
  },
  completa: {
    icono: '⭐',
    etiqueta: 'Tipo de cobertura recomendada',
    titulo: 'Multirriesgo Completa',
    descripcion: 'Tu perfil justifica la cobertura más amplia disponible. Ya sea por el valor de la vivienda, el contenido, la zona de riesgo o tus prioridades, una póliza completa te dará la máxima tranquilidad.',
    precioOrientativo: '400 – 800 €/año',
    precioNota: 'Orientativo para hogar con contenido de valor en España. Puede variar significativamente según el caso.',
    coberturaIncluida: [
      'Todo lo de la cobertura estándar',
      'Daños estéticos y ornamentales',
      'Objetos de especial valor (joyería, obras de arte, colecciones)',
      'Protección jurídica amplia',
      'Responsabilidad civil ampliada',
      'Todo riesgo accidental del contenido',
    ],
    coberturaRecomendada: [
      'Valoración pericial del continente y contenido',
      'Cobertura específica de equipos electrónicos portátiles',
      'Seguro de segunda residencia o de alquiler (arriendo) si procede',
    ],
    consejos: [
      'Solicita una valoración profesional del continente para asegurarlo correctamente',
      'Los objetos de valor especial (joyas, arte) suelen necesitar tasación y declaración expresa',
      'Lee las condiciones de indemnización: valor venal vs valor nuevo hace mucha diferencia',
      'Revisa si tu póliza cubre daños durante obras o reformas',
    ],
  },
};

export interface Resultado {
  veredicto: VeredictoKey;
  puntuacion: number;
  /** Las respuestas que más han sumado, de más a menos. */
  razones: string[];
  /** Las que no han sumado nada. */
  sinPeso: string[];
}

const enLetra = (n: number) => `${n} ${n === 1 ? 'punto' : 'puntos'}`;

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

  const razones = suman
    .sort((a, b) => b.puntos - a.puntos || a.i - b.i)
    .slice(0, 3)
    .map((s) => `${s.categoria}: «${s.etiqueta}» suma ${enLetra(s.puntos)}.`);

  return { veredicto, puntuacion, razones, sinPeso: noSuman.slice(0, 3) };
}
