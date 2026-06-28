/**
 * Fuente única del blog de Delegum.
 *
 * Cada post es una entrada de este array (no hay base de datos ni CMS: el repo
 * es el histórico). Publicar = añadir una entrada; editar = modificarla; borrar
 * = quitarla. Despliegue por git push (SSG).
 *
 * Política editorial: 2 posts/mes (días 1 y 15), cortos, basados en una noticia
 * real con su fuente. Histórico máximo ~25 posts (1 año): al añadir uno nuevo,
 * retirar el más antiguo si se supera ese tope.
 *
 * `cuerpo` es un array de párrafos (texto plano). `fichaSlug` enlaza (opcional)
 * con la ficha de Datos Fiscales relacionada.
 */

export interface Post {
  /** Ancla URL: /blog/<slug>/ — kebab-case, sin acentos. */
  slug: string;
  titulo: string;
  /** Fecha de publicación, ISO YYYY-MM-DD. */
  fecha: string;
  /** 1-2 frases: resumen para el índice, la metadescription y el JSON-LD. */
  resumen: string;
  /** Cuerpo del post, un elemento por párrafo. */
  cuerpo: string[];
  /** Nombre de la fuente/medio de la noticia (opcional). */
  fuente?: string;
  /** URL de la noticia original (opcional). */
  fuenteUrl?: string;
  /** Slug de la ficha de datos-fiscales relacionada (opcional, enlazado interno). */
  fichaSlug?: string;
  /** URL del visualizador interactivo de meskeIA para profundizar (opcional). */
  visualizadorUrl?: string;
  /** Título del visualizador, para el texto del enlace (opcional; si falta, texto genérico). */
  visualizadorTitulo?: string;
}

export const POSTS: Post[] = [
  {
    slug: 'euro-digital-paso-clave-parlamento-europeo',
    titulo: 'El euro digital da un paso clave en el Parlamento Europeo',
    fecha: '2026-07-01',
    resumen:
      'La comisión de Asuntos Económicos del Parlamento Europeo ha aprobado el texto legislativo del euro digital. Qué es, qué cambiaría para el ciudadano y por qué todavía no está aprobado del todo.',
    cuerpo: [
      'La Comisión de Asuntos Económicos y Monetarios del Parlamento Europeo aprobó el 23 de junio de 2026 el texto legislativo del euro digital. Es uno de los pasos más relevantes del proyecto: abre las negociaciones finales entre el Parlamento, el Consejo de la UE y la Comisión Europea. Conviene subrayarlo desde el principio: todavía no está aprobado. Si todo avanza según lo previsto, el marco legal podría quedar cerrado antes de finales de 2026.',
      'El euro digital sería una versión electrónica del efectivo emitida por el Banco Central Europeo (BCE). En la práctica, dispondrías de un monedero de euros digitales ofrecido por tu banco u otro intermediario autorizado para pagar en comercios, comprar por internet o enviar dinero a otra persona al instante. No sustituye a nada: seguirías usando tus cuentas, tarjetas y efectivo como hasta ahora.',
      'Las instituciones europeas han fijado varios compromisos que afectan directamente al ciudadano. El efectivo seguirá existiendo y siendo de curso legal; el euro digital será un complemento, no un sustituto; los servicios básicos serán gratuitos; y no pagará intereses, para que no se convierta en un instrumento de ahorro que compita con los depósitos bancarios. También habrá límites al saldo que cada persona —y, con más restricciones, cada empresa— podrá mantener, revisables con el tiempo, precisamente para evitar fugas masivas de dinero desde los bancos. Una de las funciones más destacadas serán los pagos sin conexión a internet, entre dispositivos, de forma parecida al efectivo.',
      'Más allá de modernizar los pagos, uno de los argumentos centrales del BCE es la autonomía estratégica: reducir la dependencia europea de redes de pago y plataformas tecnológicas extranjeras, disponiendo de una infraestructura de pago propia y pública.',
      'El calendario orientativo, si la legislación se aprueba este año, contempla cerrar el marco legal en 2026, un programa piloto con usuarios y entidades en 2027 y un posible lanzamiento al público en 2029, siempre que cada fase resulte satisfactoria. Hasta entonces, el proyecto sigue su curso pero aún depende de las negociaciones finales y de la aprobación formal de la legislación europea. Para situarlo en perspectiva, el visualizador interactivo de abajo recorre la evolución del dinero —del trueque a las criptomonedas y el euro digital— a lo largo de la historia.',
    ],
    fuente: 'Banco Central Europeo (BCE) — Euro digital',
    fuenteUrl: 'https://www.ecb.europa.eu/euro/digital_euro/html/index.en.html',
    visualizadorUrl: 'https://meskeia.com/visualizador-historia-dinero/',
    visualizadorTitulo: 'La Evolución del Dinero',
  },
  {
    slug: 'bce-sube-tipos-interes-junio-2026',
    titulo: 'El BCE sube los tipos de interés un 0,25%',
    fecha: '2026-06-21',
    resumen:
      'El Banco Central Europeo ha elevado sus tipos oficiales un 0,25%. Qué significa para hipotecas, préstamos, ahorro y euríbor, y por qué afecta a familias y empresas en España.',
    cuerpo: [
      'El Banco Central Europeo (BCE) ha subido sus tres tipos de interés oficiales en 0,25 puntos (25 puntos básicos). El Consejo de Gobierno lo decidió el 11 de junio de 2026, con efecto a partir del 17 de junio: la facilidad de depósito pasa al 2,25 %, las operaciones principales de financiación al 2,40 % y la facilidad marginal de crédito al 2,65 %.',
      'Subir o bajar estos tipos es la herramienta principal de la política monetaria del BCE: al cambiar el precio al que presta a los bancos, encarece o abarata el coste del dinero en el conjunto de la economía.',
      'Cuando los tipos suben, ese encarecimiento se traslada en cadena a préstamos, hipotecas y financiación de empresas y familias. Los efectos más habituales son: hipotecas y préstamos más caros —sobre todo los de tipo variable—; menos consumo e inversión, porque financiarse cuesta más; una inflación que tiende a moderarse al enfriarse la demanda; un ahorro algo más rentable, aunque los depósitos suelen tardar en recoger la subida; y, a corto plazo, una posible desaceleración del crecimiento.',
      'En España, el impacto más directo llega a través del euríbor, el tipo al que se prestan los bancos entre sí y la referencia de la mayoría de hipotecas variables. Cuando el BCE mueve sus tipos oficiales, el euríbor tiende a seguirlo, y con él la cuota mensual de quienes tienen una hipoteca a tipo variable o están a punto de firmarla.',
      'Si quieres ver por dentro cómo un banco capta depósitos, presta ese dinero y gana margen con estos tipos, el visualizador interactivo de abajo lo explica paso a paso.',
    ],
    fuente: 'Banco Central Europeo (BCE) — comunicado vía Banco de España',
    fuenteUrl:
      'https://www.bde.es/f/webbe/GAP/Secciones/SalaPrensa/ComunicadosBCE/DecisionesPoliticaMonetaria/26/mp260611.pdf',
    visualizadorUrl: 'https://meskeia.com/visualizador-como-funciona-banco/',
    visualizadorTitulo: 'Cómo Funciona un Banco',
  },
  {
    slug: 'delegum-ya-esta-en-marcha',
    titulo: 'Delegum ya está en marcha',
    fecha: '2026-06-20',
    resumen:
      'Presentamos Delegum: la plataforma que reúne la fiscalidad, el derecho laboral y las finanzas de España en un solo sitio, con datos verificados y herramientas gratuitas para entender qué te afecta y por qué.',
    cuerpo: [
      'La fiscalidad, el derecho laboral y las finanzas se explican casi siempre en un idioma que solo entiende quien trabaja en ello. Saber qué impuesto te toca, cuánto vas a pagar, si un dato sigue vigente o qué significa un término concreto suele costar más de lo que debería. Delegum nace para cambiar eso.',
      'Hemos reunido en un solo sitio todo lo necesario para orientarte: datos fiscales verificados con su fuente y su fecha, calculadoras para hacer el número tú mismo, guías que acompañan decisiones completas como comprar una casa o gestionar una herencia, un glosario que traduce la jerga del gremio y un asistente de IA que resuelve consultas reales conectándose a Claude, ChatGPT o Mistral.',
      'Todo con el mismo compromiso: información clara y orientativa —nunca un sustituto del profesional cuando la decisión lo exige—, gratuita, sin registro y sin recopilar tus datos personales.',
      'Y a partir de ahora, cada quince días publicaremos aquí una novedad fiscal, laboral o financiera explicada en pocas líneas. Bienvenido a Delegum.',
    ],
  },
];

/**
 * Fecha de hoy en la zona horaria de España (Europe/Madrid), en ISO YYYY-MM-DD.
 * El locale 'en-CA' produce directamente ese formato.
 */
function fechaHoyISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Un post está publicado si su fecha es hoy o anterior. Permite dejar entradas
 * redactadas con fecha futura: no aparecerán hasta que llegue su día (programación
 * editorial). La comparación es de strings ISO, que ordenan cronológicamente.
 */
export function estaPublicado(post: Post, hoy: string = fechaHoyISO()): boolean {
  return post.fecha <= hoy;
}

/**
 * Posts publicados (fecha <= hoy), ordenados del más reciente al más antiguo.
 * IMPORTANTE: llamar siempre dentro del render del componente, no a nivel de
 * módulo, para que con ISR la fecha se recalcule en cada regeneración.
 */
export function getPostsOrdenados(): Post[] {
  const hoy = fechaHoyISO();
  return POSTS.filter((p) => estaPublicado(p, hoy)).sort((a, b) =>
    b.fecha.localeCompare(a.fecha),
  );
}

/** Devuelve un post por su slug, o undefined si no existe (incluye los no publicados aún). */
export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
