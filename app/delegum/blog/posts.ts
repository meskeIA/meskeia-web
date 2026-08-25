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
    slug: 'becas-colaboracion-departamentos-universitarios-2026-2027',
    titulo:
      'Las becas de colaboración en departamentos universitarios cierran el 22 de septiembre',
    fecha: '2026-09-01',
    resumen:
      'El Real Decreto 179/2026 dio rango reglamentario propio a las becas de colaboración, y la primera convocatoria bajo ese régimen sigue abierta: 2.111 plazas de 2.000 euros para estudiantes de último curso de grado o primero de máster. Qué exige, qué se cobra y qué dedicación pide a cambio.',
    cuerpo: [
      'El Real Decreto 179/2026, de 11 de marzo (BOE núm. 63, de 12 de marzo de 2026), es la norma que cada curso fija los umbrales de renta y patrimonio familiar y las cuantías de las becas al estudio: la convocatoria general que de él dependía cerró su plazo el 19 de mayo. Pero ese real decreto hizo además algo que no es anual. Añadió un capítulo VI completo, artículos 43 a 51, al Real Decreto 1721/2007, que es el reglamento donde vive el régimen de las becas y ayudas al estudio, para regular en él las becas de colaboración de estudiantes en departamentos universitarios. El artículo 43 fija su objeto: iniciar en tareas de investigación al alumnado que termina el grado o cursa el primer año de un máster oficial, y orientarlo profesionalmente mediante una asignación económica.',
      'La convocatoria de este curso se publicó el 17 de julio y sigue abierta. Pueden pedirla quienes en 2026-2027 estén matriculados en el último curso de grado o en el primero de un máster universitario oficial y alcancen una nota media en los estudios previos de «7,25 puntos para la rama de Ingeniería y Arquitectura o Enseñanzas Técnicas; 7,70 puntos para las ramas de Ciencias o Ciencias Experimentales y para Ciencias Sociales y Jurídicas; 7,80 puntos para la rama de Ciencias de la Salud y 8,00 puntos para la rama de Artes y Humanidades». El artículo 47 exige además, en el caso del grado, haber superado al menos el 75 % de la carga lectiva del título, y presentar un proyecto de colaboración avalado por el consejo del departamento. No hay umbral de renta ni de patrimonio: a diferencia de la beca general, esta se concede por mérito académico en régimen de concurrencia competitiva.',
      'La cuantía individual es de 2.000 euros y no exime del pago de los precios públicos por servicios académicos. A cambio, el artículo 48 pide colaborar de forma presencial en el departamento a razón de al menos tres horas diarias durante siete meses y medio desde la incorporación. Conviene leer esas dos cifras juntas antes de solicitarla, porque la norma declara una finalidad formativa —la iniciación en la investigación— y no retributiva, y la dedicación que exige es la de una jornada parcial sostenida durante casi todo el curso.',
      'El plazo de solicitud va del 21 de julio de 2026 a las 8:00 al 22 de septiembre de 2026 a las 15:00, hora peninsular, por formulario telemático en la sede electrónica del Ministerio de Educación, Formación Profesional y Deportes. Se convocan 2.111 becas y las bases reguladoras están depositadas en la Base de Datos Nacional de Subvenciones con el identificador 919565. Hay un detalle que no está en la convocatoria y que conviene comprobar cuanto antes: el aval del departamento no se resuelve dentro del formulario, y cada universidad organiza por su cuenta la recogida y evaluación de los proyectos, con calendarios internos propios que pueden vencer antes del 22 de septiembre. Ese plazo se consulta en la universidad de matrícula, no en la convocatoria.',
      'No hay que confundir esta beca con la general del mismo real decreto, que sí depende de la renta y el patrimonio familiar y cuyo plazo terminó el 19 de mayo de 2026: son convocatorias distintas, con requisitos, calendarios y criterios de concesión propios. Para situar cuál corresponde a cada nivel educativo y a cada situación familiar, el orientador enlazado abajo recorre las becas y ayudas al estudio disponibles y los organismos ante los que se piden.',
    ],
    fuente:
      'BOE — Extracto de la Resolución de 15 de julio de 2026, de la Secretaría de Estado de Educación (BOE núm. 173, de 17 de julio de 2026)',
    fuenteUrl: 'https://www.boe.es/diario_boe/txt.php?id=BOE-B-2026-24454',
    visualizadorUrl: 'https://meskeia.com/orientador-becas-ayudas-estudio/',
    visualizadorTitulo: 'Orientador de Becas y Ayudas al Estudio',
  },
  {
    slug: 'jubilacion-flexible-real-decreto-416-2026',
    titulo: 'La jubilación flexible se abre al trabajo por cuenta propia el 28 de agosto',
    fecha: '2026-08-15',
    resumen:
      'El Real Decreto 416/2026 reescribe la jubilación flexible: podrá compatibilizarse con una actividad por cuenta propia, la jornada admitida pasa a estar entre el 33% y el 80%, y quien espere seis meses cobrará un porcentaje adicional. Qué cambia y qué se pierde por el camino.',
    cuerpo: [
      'El 28 de agosto de 2026 entra en vigor el Real Decreto 416/2026, de 27 de mayo, que regula de nuevo la jubilación flexible y deroga el Real Decreto 1132/2002 que la venía desarrollando. La jubilación flexible consiste en cobrar la pensión ya reconocida y trabajar a la vez, con la pensión reducida en proporción inversa a la jornada que se realiza (artículo 4.1). No hay que confundirla con la jubilación parcial, que se pide antes de retirarse, ni con la jubilación activa, que tiene sus propias reglas.',
      'El primer cambio está en la jornada admitida. El artículo 3.1 exige ahora que esté comprendida «entre un 33 y un 80 por ciento» de la de una persona trabajadora a tiempo completo comparable, tomando como referencia el artículo 12.1 del Estatuto de los Trabajadores. La norma anterior no fijaba una horquilla propia: remitía a los límites del artículo 12.6, el de la jubilación parcial. El segundo cambio es que la modalidad deja de ser exclusiva del trabajo por cuenta ajena. El artículo 3.2 permite compatibilizar la pensión con una actividad por cuenta propia, con una condición: que en los tres años inmediatamente anteriores a la fecha del hecho causante de la pensión la persona no hubiera estado de alta como trabajadora por cuenta propia. En ese supuesto la pensión que se percibe es un porcentaje fijo del 25% (artículo 4.3).',
      'El tercero es un incentivo por esperar. Si la actividad por cuenta ajena a tiempo parcial se inicia por primera vez pasados al menos seis meses desde que se causó la pensión, el importe compatible se incrementa: un 25% adicional cuando la jornada va del 55% al 80%, y un 15% adicional cuando va del 33% a menos del 55% (artículo 4.2). Ese porcentaje se calcula sobre la pensión que se venía percibiendo antes de acceder a la jubilación flexible.',
      'La letra pequeña conviene leerla antes de decidir. Las cotizaciones que se hagan durante la jubilación flexible no mejoran la pensión reconocida ni incrementan el complemento por demora (artículo 7); la excepción son las jubilaciones anticipadas por causa no imputable al trabajador, donde al cesar en la actividad se vuelve a calcular la base reguladora y se ajusta el porcentaje según el nuevo periodo cotizado. Además, la jubilación flexible es incompatible con el complemento económico del artículo 210.2 de la Ley General de la Seguridad Social: si se optó por cobrarlo como porcentaje adicional, queda suspendido mientras dure la compatibilidad; si se optó por el pago a tanto alzado o por la fórmula mixta, directamente no se puede acceder a la jubilación flexible (artículo 6.2). Durante ese periodo tampoco se tiene derecho a los complementos para pensiones inferiores a la mínima (artículo 6.4), aunque el complemento por maternidad o para la reducción de la brecha de género sí sube y baja en la misma proporción que la pensión (artículo 4.4).',
      'El real decreto se aplica a todos los regímenes de la Seguridad Social, salvo que el capítulo II queda fuera de los regímenes especiales de los funcionarios civiles del Estado, las Fuerzas Armadas y el personal al servicio de la Administración de Justicia (artículo 2). Quien ya esté en jubilación flexible no se ve afectado: la disposición transitoria única mantiene esas pensiones bajo la normativa anterior. Para quien tenga la decisión por delante, el orientador enlazado abajo recorre los trámites de la jubilación y las calculadoras de cada cuantía.',
    ],
    fuente:
      'BOE — Real Decreto 416/2026, de 27 de mayo (BOE núm. 130, de 28 de mayo de 2026)',
    fuenteUrl: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-11474',
    fichaSlug: 'pensiones-jubilacion',
    visualizadorUrl: 'https://meskeia.com/orientador-tramites-jubilacion/',
    visualizadorTitulo: 'Orientador de Trámites de Jubilación',
  },
  {
    slug: 'medidas-laborales-incendios-forestales-2026',
    titulo: 'Nuevas medidas laborales y de Seguridad Social por los incendios forestales',
    fecha: '2026-08-01',
    resumen:
      'El Real Decreto-ley 20/2026 crea una prestación extraordinaria para quienes no pueden trabajar por los incendios, abre el cese de actividad a los autónomos afectados y exonera de cuotas a las empresas con ERTE. Qué cubre cada medida y desde cuándo se aplica.',
    cuerpo: [
      'El Boletín Oficial del Estado publicó el 30 de julio de 2026 el Real Decreto-ley 20/2026, de 29 de julio, con medidas urgentes de protección laboral y social frente a los incendios forestales. Entró en vigor el 31 de julio, pero sus efectos se retrotraen al 22 de julio (disposición transitoria única). El ámbito no es una lista cerrada de municipios: el artículo 1.2 incluye «todos los municipios ubicados en las zonas afectadas por los incendios», y son las autoridades competentes las que determinan cuáles lo están en función de las medidas de protección civil adoptadas —evacuaciones, restricciones de acceso y similares—.',
      'La medida principal es una prestación extraordinaria para las personas asalariadas cuyo contrato queda en suspenso porque no pueden acceder a su domicilio, deben ocuparse de recuperarlo o tienen que atender deberes de cuidado familiar derivados de la emergencia. Consiste en el 70% de la base reguladora de los últimos 180 días cotizados, con los topes máximos y mínimos del artículo 270.3 de la Ley General de la Seguridad Social, y dura como máximo cuatro meses (artículo 3.11). No exige periodo mínimo de cotización (artículo 3.6), pero sí que la persona lo comunique a la empresa de forma expresa y con documentación que lo acredite (artículo 3.1).',
      'Los trabajadores por cuenta propia tienen su vía en el artículo 6: pueden solicitar la prestación por cese de actividad —total o parcial, definitivo o temporal— sin acreditar la fuerza mayor que se exige en el régimen ordinario, hasta un máximo de cuatro meses. Ese periodo no consume el máximo ordinario, de modo que, agotado, se puede acceder después a la prestación común si se reúnen los requisitos.',
      'Para las empresas, el artículo 7 establece la exención del 100% de la aportación empresarial a la Seguridad Social durante los meses de agosto a noviembre de 2026, aplicable a las que tengan domicilio en municipios afectados, cuenten con un expediente de regulación temporal de empleo autorizado y solo respecto de la jornada suspendida o reducida. La norma incorpora además un permiso ampliado por fallecimiento relacionado con los incendios, que se extiende desde el hecho causante hasta los cinco días hábiles siguientes al sepelio (artículo 4), y declara nula cualquier medida desfavorable que se adopte contra quien ejerza estos derechos (artículo 5).',
      'Se completa con medidas de acompañamiento: la suspensión de plazos procesales entre el 27 y el 31 de julio en los juzgados de las zonas afectadas, y asesoramiento notarial y notas de localización de patrimonio gratuitos para quien haya perdido su documentación. Como el alcance territorial depende de la declaración que hagan las autoridades, el primer paso antes de solicitar nada es comprobar si el municipio está incluido. Si buscas una visión general de qué prestaciones existen según tu situación y a qué organismo se piden, el orientador enlazado abajo las recorre una por una.',
    ],
    fuente: 'BOE — Real Decreto-ley 20/2026, de 29 de julio (BOE núm. 185, de 30 de julio de 2026)',
    fuenteUrl: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-16543',
    visualizadorUrl: 'https://meskeia.com/orientador-ayudas-personas-familias/',
    visualizadorTitulo: 'Orientador de Ayudas y Prestaciones',
  },
  {
    slug: 'interes-demora-comercial-segundo-semestre-2026',
    titulo: 'El interés de demora comercial sube al 10,40% en el segundo semestre de 2026',
    fecha: '2026-07-15',
    resumen:
      'El BOE fija el interés de demora comercial en el 10,40% para el segundo semestre de 2026, frente al 10,15% anterior. Qué es, a quién afecta y cómo se aplica al reclamar facturas impagadas entre empresas y autónomos.',
    cuerpo: [
      'El Boletín Oficial del Estado ha publicado el tipo de interés de demora comercial que rige durante el segundo semestre de 2026: el 10,40%. La cifra procede de la Resolución de 30 de junio de 2026 de la Secretaría General del Tesoro y Financiación Internacional (BOE-A-2026-14327) y se aplica a las operaciones comerciales entre el 1 de julio y el 31 de diciembre de 2026. Sube desde el 10,15% que estuvo vigente en el primer semestre.',
      'El motivo del alza está en el tipo de referencia del Banco Central Europeo. Este interés de demora se calcula, por ley, sumando 8 puntos porcentuales al tipo de las operaciones principales de financiación del BCE vigente el primer día del semestre. Como esa referencia pasó del 2,15% al 2,40%, el total sube del 10,15% al 10,40% (2,40% + 8 puntos).',
      'El interés de demora comercial regulado por la Ley 3/2004 es el que puede reclamar una empresa o un autónomo cuando otra empresa —o una Administración pública— le paga una factura fuera de plazo. No se aplica a los consumidores particulares, ni a las deudas con Hacienda, que tienen su propio interés de demora tributario, ni a las deudas civiles sin pacto expreso, a las que corresponde el interés legal del dinero (3,25%).',
      'Su efecto práctico es doble. Para quien no cobra a tiempo funciona como compensación: los intereses se devengan de forma automática desde el día siguiente al vencimiento de la factura, sin necesidad de avisar al deudor ni de haberlo pactado en el contrato. Para quien paga tarde es un coste añadido que crece cuanto más se demora el pago. El plazo legal de pago por defecto en operaciones comerciales es de 30 días y la deuda prescribe a los tres años.',
      'Como este tipo cambia cada semestre, conviene comprobar cuál estaba vigente en el periodo exacto de la mora antes de reclamar. Si tienes una factura vencida y quieres estimar a cuánto ascienden los intereses, el enlace de abajo permite calcularlos indicando el importe y las fechas.',
    ],
    fuente: 'BOE — Resolución de 30 de junio de 2026 (Tesoro), BOE-A-2026-14327',
    fuenteUrl: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-14327',
    fichaSlug: 'interes-legal-demora',
    visualizadorUrl: 'https://meskeia.com/orientador-intereses-demora/',
    visualizadorTitulo: 'Orientador de Intereses de Demora',
  },
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
