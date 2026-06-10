/**
 * Datos: Ayudas, subvenciones y financiación pública
 * para autónomos, emprendedores y pymes
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No es un listado de convocatorias activas.
 * Describe TIPOS de ayuda estables (programas marco gestionados por organismos
 * públicos), no convocatorias concretas: estas abren y cierran varias veces al
 * año y su presupuesto se agota. Para ver qué está abierto ahora mismo, usa el
 * buscador oficial BDNS (infosubvenciones.es).
 *
 * Fuente: elaboración propia a partir de organismos oficiales (Seguridad Social,
 * SEPE, ICO, ENISA, CDTI, Red.es/Acelera Pyme, ICEX, IDAE, Cámara de Comercio,
 * Fundación ONCE, AEAT, BDNS)
 * Verificado: 2026-06-10
 * URL oficial de referencia: https://www.infosubvenciones.es/
 */

export const FISCAL_AYUDAS_PUBLICAS_META = {
  fuente: 'Seguridad Social, SEPE, ICO, ENISA, CDTI, Red.es, ICEX, IDAE, Cámara de Comercio, Fundación ONCE, AEAT, BDNS',
  descripcion: 'Catálogo de tipos de ayuda y financiación pública (estatal y UE) para autónomos, emprendedores y pymes en España',
  verificado: '2026-06-10',
  vigencia: '2025-2026',
  urlOficial: 'https://www.infosubvenciones.es/',
  nota: 'Describe categorías estables de ayuda (programas marco), no convocatorias concretas. Las convocatorias cambian varias veces al año: consulta siempre BDNS para ver qué está activo ahora mismo.',
};

export type FiguraNegocio = 'nueva' | 'autonomo' | 'pyme' | 'startup';

export type ObjetivoAyuda =
  | 'empezar'
  | 'financiacion'
  | 'contratar'
  | 'digitalizar'
  | 'innovar'
  | 'sostenibilidad'
  | 'exportar'
  | 'formacion';

export type PerfilAyuda = 'mujer' | 'joven' | 'mayor45' | 'discapacidad' | 'rural';

export interface CategoriaAyuda {
  id: string;
  icono: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  comoFunciona: string;
  organismo: string;
  enlace?: { texto: string; url: string };
  figuras: FiguraNegocio[];
  objetivos: ObjetivoAyuda[];
  perfiles: PerfilAyuda[];
  /** Se muestra siempre en los resultados, independientemente del perfil seleccionado */
  siempre?: boolean;
}

export const CATEGORIAS_AYUDAS: CategoriaAyuda[] = [
  {
    id: 'tarifa-plana-autonomos',
    icono: '🎟️',
    nombre: 'Tarifa plana y bonificaciones en la cuota de autónomos',
    tipo: 'Bonificación Seguridad Social',
    descripcion:
      'Reducción de la cuota mensual a la Seguridad Social durante los primeros meses o años de actividad, con extensiones para determinados colectivos.',
    comoFunciona:
      'Se aplica al darte de alta como autónomo (RETA) o la solicitas si cambia tu situación. La cuantía y duración varían según tu caso: hay extensiones para mujeres que se reincorporan tras la maternidad, personas con discapacidad, víctimas de violencia de género o residentes en municipios de baja densidad demográfica.',
    organismo: 'Tesorería General de la Seguridad Social (TGSS)',
    enlace: { texto: 'seg-social.es', url: 'https://www.seg-social.es' },
    figuras: ['nueva', 'autonomo'],
    objetivos: ['empezar'],
    perfiles: ['mujer', 'joven', 'mayor45', 'discapacidad', 'rural'],
  },
  {
    id: 'capitalizacion-paro',
    icono: '💶',
    nombre: 'Capitalización de la prestación por desempleo (pago único)',
    tipo: 'Pago único',
    descripcion:
      'Si tienes derecho a prestación por desempleo, puedes cobrar de una sola vez todo o parte de lo que te queda para invertirlo en montar tu negocio.',
    comoFunciona:
      'Se solicita antes de darte de alta como autónomo o socio de una cooperativa o sociedad laboral. El SEPE puede abonar el importe pendiente en un único pago o usarlo para bonificar tu cuota de autónomo durante varios meses.',
    organismo: 'Servicio Público de Empleo Estatal (SEPE)',
    enlace: { texto: 'sepe.es', url: 'https://www.sepe.es' },
    figuras: ['nueva', 'autonomo'],
    objetivos: ['empezar', 'financiacion'],
    perfiles: [],
  },
  {
    id: 'avales-ico',
    icono: '🏦',
    nombre: 'Avales y líneas de financiación ICO',
    tipo: 'Aval / financiación',
    descripcion:
      'Líneas de préstamo a través de bancos privados con condiciones favorables y, en algunos casos, aval público que facilita el acceso al crédito.',
    comoFunciona:
      'No es dinero a fondo perdido: es un préstamo bancario que devuelves con intereses, en el que el ICO aporta fondos o avala una parte para que el banco asuma menos riesgo. Se solicita directamente en una entidad financiera adherida.',
    organismo: 'Instituto de Crédito Oficial (ICO)',
    enlace: { texto: 'ico.es', url: 'https://www.ico.es' },
    figuras: ['nueva', 'autonomo', 'pyme', 'startup'],
    objetivos: ['financiacion'],
    perfiles: [],
  },
  {
    id: 'enisa',
    icono: '🚀',
    nombre: 'Préstamos participativos ENISA',
    tipo: 'Préstamo participativo',
    descripcion:
      'Financiación a medio plazo sin garantías ni avales para proyectos de empresas innovadoras o emprendedores jóvenes, con condiciones ligadas a la marcha del negocio.',
    comoFunciona:
      'Es un préstamo (hay que devolverlo), pero sin pedirte garantías personales y con un tipo de interés que depende en parte de los resultados de tu empresa. Se solicita online directamente a ENISA.',
    organismo: 'Empresa Nacional de Innovación (ENISA)',
    enlace: { texto: 'enisa.es', url: 'https://www.enisa.es' },
    figuras: ['startup', 'pyme'],
    objetivos: ['financiacion', 'innovar'],
    perfiles: ['joven'],
  },
  {
    id: 'cdti-idi',
    icono: '🔬',
    nombre: 'Financiación CDTI para I+D+i',
    tipo: 'Subvención y préstamo I+D+i',
    descripcion:
      'Ayudas y préstamos para empresas que desarrollan proyectos de investigación, desarrollo tecnológico e innovación.',
    comoFunciona:
      'Combina líneas de subvención parcial con préstamos en condiciones ventajosas según el tipo de proyecto. Requiere presentar una memoria técnica que describa el proyecto de I+D+i.',
    organismo: 'Centro para el Desarrollo Tecnológico Industrial (CDTI)',
    enlace: { texto: 'cdti.es', url: 'https://www.cdti.es' },
    figuras: ['pyme', 'startup'],
    objetivos: ['innovar'],
    perfiles: [],
  },
  {
    id: 'kit-digital',
    icono: '💻',
    nombre: 'Kit Digital',
    tipo: 'Bono de digitalización',
    descripcion:
      'Bono que cubre el coste de soluciones de digitalización (web, ecommerce, gestión, ciberseguridad, redes sociales...) para autónomos y pymes.',
    comoFunciona:
      'Solicitas el bono online; una vez concedido, lo canjeas con un "agente digitalizador" autorizado que te implementa la solución. El importe lo recibe directamente el agente, no tú.',
    organismo: 'Red.es (Programa Acelera Pyme)',
    enlace: { texto: 'acelerapyme.gob.es', url: 'https://www.acelerapyme.gob.es' },
    figuras: ['autonomo', 'pyme'],
    objetivos: ['digitalizar'],
    perfiles: [],
  },
  {
    id: 'bonificaciones-contratacion',
    icono: '🤝',
    nombre: 'Bonificaciones a la contratación',
    tipo: 'Bonificación cuota empresa',
    descripcion:
      'Reducciones en la cuota empresarial a la Seguridad Social cuando contratas a personas de determinados colectivos (jóvenes, mayores de 45, mujeres, personas con discapacidad, parados de larga duración).',
    comoFunciona:
      'La aplica directamente la empresa al formalizar el contrato indefinido (o ciertos contratos formativos), siempre que la persona contratada cumpla los requisitos del colectivo bonificado. La reducción se refleja en los seguros sociales.',
    organismo: 'SEPE / Seguridad Social',
    enlace: { texto: 'sepe.es', url: 'https://www.sepe.es' },
    figuras: ['autonomo', 'pyme'],
    objetivos: ['contratar'],
    perfiles: ['joven', 'mayor45', 'discapacidad', 'mujer'],
  },
  {
    id: 'icex-internacionalizacion',
    icono: '🌍',
    nombre: 'Programas ICEX de apoyo a la internacionalización',
    tipo: 'Programa de apoyo',
    descripcion:
      'Programas de formación, acompañamiento y ayudas económicas para empresas que quieren empezar a exportar o consolidar su presencia en otros países.',
    comoFunciona:
      'Incluye desde programas formativos gratuitos hasta ayudas económicas para ferias internacionales o estudios de mercado, según el programa concreto al que accedas.',
    organismo: 'ICEX España Exportación e Inversiones',
    enlace: { texto: 'icex.es', url: 'https://www.icex.es' },
    figuras: ['pyme', 'startup'],
    objetivos: ['exportar'],
    perfiles: [],
  },
  {
    id: 'idae-eficiencia',
    icono: '🌱',
    nombre: 'Ayudas IDAE a la eficiencia energética y sostenibilidad',
    tipo: 'Subvención',
    descripcion:
      'Ayudas para que pymes y autónomos mejoren la eficiencia energética de sus instalaciones, vehículos o procesos (renovables, autoconsumo, movilidad eléctrica).',
    comoFunciona:
      'Suele ser una subvención parcial sobre la inversión realizada (un porcentaje del coste de la instalación o equipo), tramitada a menudo a través de las CCAA con fondos del IDAE.',
    organismo: 'Instituto para la Diversificación y Ahorro de la Energía (IDAE)',
    enlace: { texto: 'idae.es', url: 'https://www.idae.es' },
    figuras: ['autonomo', 'pyme'],
    objetivos: ['sostenibilidad'],
    perfiles: [],
  },
  {
    id: 'deducciones-fiscales-empresa',
    icono: '🧾',
    nombre: 'Deducciones fiscales por I+D+i, contratación e inversión',
    tipo: 'Deducción fiscal',
    descripcion:
      'Reducciones en el Impuesto sobre Sociedades o en el IRPF (estimación directa) por invertir en investigación y desarrollo, crear empleo o realizar determinadas inversiones.',
    comoFunciona:
      'No es dinero que recibes: es un menor pago de impuestos al presentar tu declaración. Se aplica en el modelo correspondiente (IS o IRPF) acreditando los gastos o inversiones que dan derecho a la deducción.',
    organismo: 'Agencia Tributaria (AEAT)',
    enlace: { texto: 'agenciatributaria.es', url: 'https://www.agenciatributaria.es' },
    figuras: ['autonomo', 'pyme', 'startup'],
    objetivos: ['innovar', 'contratar'],
    perfiles: [],
  },
  {
    id: 'paem-mujer',
    icono: '👩‍💼',
    nombre: 'Programas para mujeres emprendedoras (PAEM y líneas específicas)',
    tipo: 'Asesoramiento y financiación',
    descripcion:
      'Asesoramiento gratuito, formación y líneas de microcréditos específicas para mujeres que quieren emprender o consolidar su negocio.',
    comoFunciona:
      'El asesoramiento (PAEM) es gratuito y se presta en las Cámaras de Comercio. Las líneas de microcréditos asociadas son préstamos que se devuelven, con condiciones más accesibles que la financiación bancaria estándar.',
    organismo: 'Cámaras de Comercio / ICO',
    enlace: { texto: 'camara.es', url: 'https://www.camara.es' },
    figuras: ['nueva', 'autonomo', 'pyme'],
    objetivos: ['empezar', 'financiacion', 'formacion'],
    perfiles: ['mujer'],
  },
  {
    id: 'fundacion-once',
    icono: '♿',
    nombre: 'Financiación Fundación ONCE para emprendedores con discapacidad',
    tipo: 'Préstamo / subvención',
    descripcion:
      'Líneas de financiación y apoyo específicas para personas con discapacidad que quieren poner en marcha su propio negocio.',
    comoFunciona:
      'Combina microcréditos en condiciones favorables con asesoramiento técnico durante la puesta en marcha del proyecto. Se solicita directamente a través de Fundación ONCE o sus entidades colaboradoras.',
    organismo: 'Fundación ONCE',
    enlace: { texto: 'fundaciononce.es', url: 'https://www.fundaciononce.es' },
    figuras: ['nueva', 'autonomo'],
    objetivos: ['empezar', 'financiacion'],
    perfiles: ['discapacidad'],
  },
  {
    id: 'camara-comercio',
    icono: '🏛️',
    nombre: 'Programas de la Cámara de Comercio',
    tipo: 'Asesoramiento y formación',
    descripcion:
      'Asesoramiento gratuito, formación y programas de acompañamiento (como InnoCámaras para innovación) disponibles para cualquier autónomo, emprendedor o pyme.',
    comoFunciona:
      'La mayoría de servicios de asesoramiento básico son gratuitos. Algunos programas específicos (digitalización, innovación, internacionalización) tienen convocatorias propias con plazas limitadas.',
    organismo: 'Cámaras de Comercio de España',
    enlace: { texto: 'camara.es', url: 'https://www.camara.es' },
    figuras: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
  {
    id: 'ayudas-autonomicas',
    icono: '🗺️',
    nombre: 'Ayudas autonómicas para autónomos y pymes',
    tipo: 'Variable según comunidad',
    descripcion:
      'Cada Comunidad Autónoma gestiona sus propias líneas de ayuda al emprendimiento, la digitalización, la contratación o la actividad en zonas rurales, con requisitos y plazos propios.',
    comoFunciona:
      'Estas ayudas se suman a las estatales y europeas, y normalmente son compatibles con ellas (revisa siempre las bases de cada convocatoria). Consulta el portal de empleo, economía o industria de tu comunidad autónoma para ver qué líneas tiene abiertas.',
    organismo: 'Consejería de Empleo, Economía o Industria de tu Comunidad Autónoma',
    figuras: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
  {
    id: 'bdns-buscador',
    icono: '🔍',
    nombre: 'BDNS — Base de Datos Nacional de Subvenciones',
    tipo: 'Buscador oficial',
    descripcion:
      'El registro oficial donde se publican todas las convocatorias de ayudas y subvenciones públicas activas en España: estatales, autonómicas y locales.',
    comoFunciona:
      'Es un buscador, no una ayuda en sí misma. Permite filtrar por administración convocante, sector, tipo de beneficiario y fecha para ver qué convocatorias están abiertas ahora mismo. Es la fuente más fiable para no perderte ninguna ayuda a la que podrías optar.',
    organismo: 'Ministerio de Hacienda',
    enlace: { texto: 'infosubvenciones.es', url: 'https://www.infosubvenciones.es' },
    figuras: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
];
