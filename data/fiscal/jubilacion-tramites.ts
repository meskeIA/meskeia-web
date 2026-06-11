/**
 * Datos: Trámites y recursos al llegar a la jubilación en España
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No calcula pensiones ni cuantías.
 * Describe TIPOS de trámite, complemento o servicio relacionados con la
 * jubilación (marcos normativos generales) y enlaza, cuando existe, a la
 * calculadora meskeIA específica que sí estima importes con tus datos.
 * No sustituye la información personalizada de la Seguridad Social ni de
 * los Servicios Sociales de tu Comunidad Autónoma.
 *
 * Fuente: elaboración propia a partir de organismos oficiales (Seguridad
 * Social/INSS, Agencia Tributaria, IMSERSO, Servicios Sociales autonómicos
 * y municipales)
 * Verificado: 2026-06-11
 * URL oficial de referencia: https://www.seg-social.es
 */

export const FISCAL_JUBILACION_TRAMITES_META = {
  fuente: 'Instituto Nacional de la Seguridad Social (INSS); Agencia Tributaria; IMSERSO; Servicios Sociales autonómicos y municipales',
  descripcion: 'Catálogo de trámites, complementos y servicios habituales al llegar a la jubilación en España',
  verificado: '2026-06-11',
  vigencia: '2026',
  urlOficial: 'https://www.seg-social.es',
  nota: 'Describe categorías estables de trámite, complemento y servicio (marcos normativos generales), no calcula cuantías ni fechas concretas. Para una estimación con tus datos reales, usa las calculadoras enlazadas o el simulador "Tu Seguridad Social".',
};

export type SituacionJubilacion =
  | 'proximo-jubilarme'
  | 'ya-jubilado'
  | 'cuido-familiar-mayor';

export type NecesidadJubilacion =
  | 'solicitar-pension'
  | 'conocer-cuantia'
  | 'ahorro-privado'
  | 'complemento-minimos'
  | 'complemento-brecha-genero'
  | 'fiscalidad-pension'
  | 'servicios-mayores'
  | 'ocio-mayores';

export type PerfilJubilacion =
  | 'autonomo'
  | 'viudo'
  | 'dependencia'
  | 'bajos-ingresos'
  | 'vivo-solo'
  | 'cuidador';

export interface CategoriaTramiteJubilacion {
  id: string;
  icono: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  comoFunciona: string;
  organismo: string;
  /** URL absoluta (organismo oficial) o ruta interna ('/...') a otra app meskeIA */
  enlace?: { texto: string; url: string };
  situaciones: SituacionJubilacion[];
  objetivos: NecesidadJubilacion[];
  perfiles: PerfilJubilacion[];
  /** Se muestra siempre en los resultados, independientemente de la situación seleccionada */
  siempre?: boolean;
}

export const CATEGORIAS_JUBILACION_TRAMITES: CategoriaTramiteJubilacion[] = [
  {
    id: 'solicitud-pension-jubilacion',
    icono: '📝',
    nombre: 'Solicitud de la pensión de jubilación',
    tipo: 'Trámite estatal (Seguridad Social)',
    descripcion:
      'La pensión de jubilación no se concede de forma automática: hay que solicitarla ante la Seguridad Social, normalmente unos meses antes de la fecha en la que quieres dejar de trabajar.',
    comoFunciona:
      'La solicitud se presenta de forma telemática a través de la Sede Electrónica de la Seguridad Social (con certificado digital, Cl@ve o usuario y contraseña) o, si lo prefieres, mediante cita previa presencial. Se recomienda iniciar el trámite con cierta antelación (en torno a 1-3 meses antes de la fecha deseada), ya que los efectos económicos retroactivos suelen estar limitados a los meses previos a la solicitud. Si quieres seguir trabajando después de jubilarte, infórmate sobre la jubilación activa, que permite compatibilizar un porcentaje de la pensión con un trabajo por cuenta propia o ajena.',
    organismo: 'Instituto Nacional de la Seguridad Social (INSS)',
    enlace: { texto: 'sede.seg-social.gob.es', url: 'https://sede.seg-social.gob.es' },
    situaciones: ['proximo-jubilarme'],
    objetivos: ['solicitar-pension'],
    perfiles: [],
  },
  {
    id: 'simulador-cuantia-pension',
    icono: '🧮',
    nombre: 'Cuánto vas a cobrar de pensión',
    tipo: 'Herramienta meskeIA',
    descripcion:
      'Antes o después de solicitar la pensión, conviene tener una estimación de cuánto vas a cobrar: depende de tu edad, los años cotizados y tu base reguladora.',
    comoFunciona:
      'Esta calculadora estima tu edad de jubilación según el año de nacimiento y los años cotizados, calcula tu pensión aproximada según el sistema vigente, y simula los coeficientes reductores si te jubilas anticipadamente o los de la jubilación parcial con contrato de relevo. Es una estimación orientativa: para una cifra oficial con tus datos reales, usa el simulador "Tu Seguridad Social".',
    organismo: 'meskeIA (datos: Seguridad Social)',
    enlace: { texto: 'Simulador de Jubilación Pública', url: '/simulador-jubilacion-publica/' },
    situaciones: ['proximo-jubilarme', 'ya-jubilado'],
    objetivos: ['conocer-cuantia'],
    perfiles: [],
  },
  {
    id: 'planificador-ahorro-jubilacion',
    icono: '💹',
    nombre: 'Ahorro privado para complementar la pensión',
    tipo: 'Herramienta meskeIA',
    descripcion:
      'Si tu pensión pública estimada va a ser inferior a tu sueldo actual, puede interesarte planificar un ahorro complementario mientras sigues trabajando.',
    comoFunciona:
      'Esta herramienta calcula la diferencia entre tu sueldo actual y la pensión estimada, te orienta sobre cuánto ahorro mensual necesitarías para cubrir esa diferencia y proyecta el capital acumulado en distintos escenarios, incluyendo la ventaja fiscal de aportar a un plan de pensiones.',
    organismo: 'meskeIA',
    enlace: { texto: 'Planificador de Ahorro para la Jubilación', url: '/planificador-ahorro-jubilacion/' },
    situaciones: ['proximo-jubilarme'],
    objetivos: ['ahorro-privado'],
    perfiles: ['autonomo'],
  },
  {
    id: 'complemento-minimos',
    icono: '🏛️',
    nombre: 'Complemento a mínimos',
    tipo: 'Complemento estatal a la pensión',
    descripcion:
      'Si tu pensión calculada queda por debajo del importe mínimo garantizado para tu tipo de pensión, edad y situación familiar, la Seguridad Social puede completarla hasta ese mínimo.',
    comoFunciona:
      'El complemento a mínimos depende del tipo de pensión (jubilación, viudedad, incapacidad), de si tienes cónyuge a cargo, y de que el conjunto de tus rentas no supere determinados límites anuales, que se revisan cada año. Esta herramienta te ayuda a comprobar si tu pensión podría tener derecho a este complemento.',
    organismo: 'Instituto Nacional de la Seguridad Social (INSS)',
    enlace: { texto: 'Estimador de Complemento a Mínimos', url: '/estimador-complemento-minimos/' },
    situaciones: ['proximo-jubilarme', 'ya-jubilado'],
    objetivos: ['complemento-minimos'],
    perfiles: ['bajos-ingresos', 'viudo'],
  },
  {
    id: 'complemento-brecha-genero',
    icono: '⚖️',
    nombre: 'Complemento por brecha de género',
    tipo: 'Complemento estatal a la pensión',
    descripcion:
      'Quienes han tenido hijos o hijas pueden tener derecho a un complemento adicional en su pensión de jubilación, viudedad o incapacidad permanente, destinado a compensar el impacto de la maternidad o paternidad en la carrera de cotización.',
    comoFunciona:
      'El complemento se reconoce por cada hijo o hija (hasta un máximo), con un importe fijo que se actualiza cada año. Tras la sentencia del TJUE de 2025, puede solicitarlo tanto la madre como el padre según las reglas vigentes. Esta herramienta te ayuda a comprobar en pocas preguntas si podrías tener derecho a él.',
    organismo: 'Instituto Nacional de la Seguridad Social (INSS)',
    enlace: { texto: 'Verificador del Complemento por Brecha de Género', url: '/verificador-complemento-brecha-genero/' },
    situaciones: ['proximo-jubilarme', 'ya-jubilado'],
    objetivos: ['complemento-brecha-genero'],
    perfiles: [],
  },
  {
    id: 'fiscalidad-pension-irpf',
    icono: '📊',
    nombre: 'Cómo tributa tu pensión en el IRPF',
    tipo: 'Fiscalidad (IRPF)',
    descripcion:
      'Las pensiones públicas tributan como rendimientos del trabajo en el IRPF, pero existen reducciones y mínimos personales específicos para mayores de 65 y 75 años que reducen el impuesto a pagar.',
    comoFunciona:
      'Esta herramienta estima la retención y el IRPF anual de tu pensión, aplicando la reducción por rendimientos del trabajo y el mínimo personal incrementado por edad, para que conozcas aproximadamente tu pensión neta mensual. Si además tienes rentas de un plan de pensiones o de ahorro, conviene planificar el orden de los rescates.',
    organismo: 'meskeIA (normativa: Agencia Tributaria)',
    enlace: { texto: 'Estimador IRPF Pensionista', url: '/estimador-irpf-pensionista/' },
    situaciones: ['proximo-jubilarme', 'ya-jubilado'],
    objetivos: ['fiscalidad-pension'],
    perfiles: [],
  },
  {
    id: 'pension-viudedad',
    icono: '💍',
    nombre: 'Pensión de viudedad',
    tipo: 'Prestación estatal (Seguridad Social)',
    descripcion:
      'Si tu cónyuge o pareja de hecho fallece, puedes tener derecho a una pensión de viudedad, cuyo porcentaje depende de tu situación (general, con cargas familiares o víctima de violencia de género) y de la base reguladora de la persona fallecida.',
    comoFunciona:
      'Esta herramienta estima el porcentaje aplicable (52%, 60% o 70%), calcula la base reguladora y comprueba la pensión mínima garantizada, para que tengas una primera referencia antes de iniciar el trámite con la Seguridad Social.',
    organismo: 'Instituto Nacional de la Seguridad Social (INSS)',
    enlace: { texto: 'Estimador de Pensión de Viudedad', url: '/estimador-pension-viudedad/' },
    situaciones: ['ya-jubilado', 'cuido-familiar-mayor'],
    objetivos: [],
    perfiles: ['viudo'],
  },
  {
    id: 'servicios-mayores-dependencia',
    icono: '🤲',
    nombre: 'Teleasistencia, ayuda a domicilio y dependencia',
    tipo: 'Servicio autonómico (Sistema de Dependencia, SAAD)',
    descripcion:
      'A partir de cierta edad, o si aparecen limitaciones para las actividades diarias, existen servicios públicos como la teleasistencia, la ayuda a domicilio, los centros de día o las prestaciones del Sistema para la Autonomía y Atención a la Dependencia (SAAD).',
    comoFunciona:
      'El acceso a la mayoría de estos servicios requiere el reconocimiento de un grado de dependencia, valorado por tu Comunidad Autónoma a partir del Baremo de Valoración de la Dependencia (BVD). Una vez reconocido el grado, se elabora un Programa Individual de Atención (PIA) que determina qué servicios o prestaciones económicas te corresponden. La teleasistencia y algunos servicios de ayuda a domicilio pueden solicitarse en algunos municipios sin necesidad de un grado reconocido.',
    organismo: 'Consejería de Servicios Sociales de tu Comunidad Autónoma / tu Ayuntamiento',
    enlace: { texto: 'Orientador de Grado de Dependencia', url: '/orientador-grado-dependencia/' },
    situaciones: ['ya-jubilado', 'cuido-familiar-mayor'],
    objetivos: ['servicios-mayores'],
    perfiles: ['dependencia', 'vivo-solo', 'cuidador'],
  },
  {
    id: 'ocio-descuentos-mayores',
    icono: '🎟️',
    nombre: 'Ocio, turismo y descuentos para mayores',
    tipo: 'Programas estatales y autonómicos',
    descripcion:
      'Ser pensionista da acceso a programas de turismo social a precios reducidos, descuentos en transporte público y entrada gratuita o reducida a museos y espacios culturales.',
    comoFunciona:
      'El Programa de Turismo del IMSERSO ofrece viajes y estancias a precio reducido para personas mayores, con plazas limitadas y convocatoria anual. La Tarjeta Dorada de Renfe da descuentos en billetes de tren para mayores de 60 años. Muchos museos estatales y autonómicos tienen entrada gratuita o reducida para mayores de 65 años o pensionistas, y algunos transportes urbanos ofrecen tarifas reducidas o tarjetas específicas para mayores. Las condiciones exactas varían según el organismo y tu Comunidad Autónoma.',
    organismo: 'IMSERSO / Renfe / Comunidad Autónoma',
    enlace: { texto: 'imserso.es', url: 'https://www.imserso.es' },
    situaciones: ['ya-jubilado'],
    objetivos: ['ocio-mayores'],
    perfiles: [],
  },
  {
    id: 'portal-tu-seguridad-social',
    icono: '🔐',
    nombre: 'Tu Seguridad Social (sede electrónica)',
    tipo: 'Portal oficial',
    descripcion:
      'El portal personal de la Seguridad Social te permite consultar tu vida laboral, simular tu jubilación con tus datos reales, solicitar prestaciones y hacer un seguimiento de tus trámites.',
    comoFunciona:
      'Accede con certificado digital, Cl@ve o usuario y contraseña. Desde "Tu Seguridad Social" puedes consultar tu informe de vida laboral (años y bases de cotización), usar el simulador de jubilación con tus datos reales, y presentar solicitudes de pensión, complementos o prestaciones de forma telemática.',
    organismo: 'Seguridad Social',
    enlace: { texto: 'sede.seg-social.gob.es', url: 'https://sede.seg-social.gob.es' },
    situaciones: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
  {
    id: 'servicios-sociales-ayuntamiento-mayores',
    icono: '🆘',
    nombre: 'Servicios Sociales de tu Ayuntamiento',
    tipo: 'Punto de información y ayudas locales',
    descripcion:
      'Si tienes dudas sobre qué ayudas o servicios para mayores existen en tu municipio, o tu situación requiere apoyo más inmediato (comedor social, acompañamiento, emergencias), los Servicios Sociales municipales son el punto de partida.',
    comoFunciona:
      'Pueden informarte sobre el conjunto de recursos disponibles para personas mayores en tu zona —teleasistencia, ayuda a domicilio, centros de día, comedores sociales, programas de acompañamiento— y orientarte sobre cómo solicitarlos, además de derivarte a otros organismos si tu caso lo requiere.',
    organismo: 'Servicios Sociales de tu Ayuntamiento / Comunidad Autónoma',
    situaciones: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
];
