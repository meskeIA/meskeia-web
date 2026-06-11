/**
 * Datos: Ayudas y prestaciones sociales
 * para personas y familias en España
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No es un cálculo de elegibilidad ni de cuantía.
 * Describe TIPOS de ayuda y prestación estables (marcos normativos generales),
 * no garantiza que una persona concreta tenga derecho a percibirlas: el acceso
 * y el importe dependen de una valoración individual del organismo competente
 * (renta, patrimonio, composición del hogar, cotizaciones...). Para una
 * estimación con datos reales, usa siempre los simuladores oficiales enlazados.
 *
 * Fuente: elaboración propia a partir de organismos oficiales (Seguridad
 * Social/INSS, SEPE, AEAT, IMSERSO, Ministerio para la Transición Ecológica,
 * Servicios Sociales, BDNS)
 * Verificado: 2026-06-11
 * URL oficial de referencia: https://www.seg-social.es
 */

export const FISCAL_AYUDAS_PERSONAS_META = {
  fuente: 'Seguridad Social/INSS, SEPE, AEAT, IMSERSO, Ministerio para la Transición Ecológica, Servicios Sociales, BDNS',
  descripcion: 'Catálogo de tipos de ayuda y prestación social (estatal) para personas y familias en España',
  verificado: '2026-06-11',
  vigencia: '2025-2026',
  urlOficial: 'https://www.seg-social.es',
  nota: 'Describe categorías estables de ayuda (marcos normativos generales), no calcula elegibilidad ni cuantías. Las cifras y umbrales cambian cada año: usa siempre los simuladores oficiales enlazados para tu caso concreto.',
};

export type SituacionPersonal =
  | 'desempleo'
  | 'bajos-ingresos'
  | 'familia-hijos'
  | 'jubilado'
  | 'joven-emancipacion'
  | 'dependencia-discapacidad';

export type NecesidadPersonal =
  | 'ingresos-minimos'
  | 'prestacion-paro'
  | 'ayuda-vivienda'
  | 'ayuda-energia'
  | 'deducciones-familia'
  | 'reconocimiento-discapacidad'
  | 'cuidado-dependiente'
  | 'formacion-empleo';

export type PerfilPersonal =
  | 'familia-numerosa'
  | 'monoparental'
  | 'joven'
  | 'mayor45'
  | 'discapacidad'
  | 'rural'
  | 'violencia-genero';

export interface CategoriaAyudaPersonal {
  id: string;
  icono: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  comoFunciona: string;
  organismo: string;
  /** URL absoluta (organismo oficial) o ruta interna ('/...') a otra app meskeIA */
  enlace?: { texto: string; url: string };
  figuras: SituacionPersonal[];
  objetivos: NecesidadPersonal[];
  perfiles: PerfilPersonal[];
  /** Se muestra siempre en los resultados, independientemente del perfil seleccionado */
  siempre?: boolean;
}

export const CATEGORIAS_AYUDAS_PERSONAS: CategoriaAyudaPersonal[] = [
  {
    id: 'ingreso-minimo-vital',
    icono: '💶',
    nombre: 'Ingreso Mínimo Vital (IMV)',
    tipo: 'Prestación económica mensual',
    descripcion:
      'Prestación dirigida a hogares en situación de vulnerabilidad económica para garantizar un nivel mínimo de ingresos.',
    comoFunciona:
      'El acceso y la cuantía dependen de los ingresos y el patrimonio de todas las personas que conviven en el hogar durante el año anterior, así como de la composición familiar (número de adultos y menores, monoparentalidad, discapacidad...). Es el INSS quien valora cada solicitud de forma individual con la documentación aportada. El simulador oficial permite hacer una primera estimación introduciendo tus datos reales antes de presentar la solicitud.',
    organismo: 'Instituto Nacional de la Seguridad Social (INSS)',
    enlace: { texto: 'imv.seg-social.es', url: 'https://imv.seg-social.es' },
    figuras: ['bajos-ingresos', 'familia-hijos', 'desempleo'],
    objetivos: ['ingresos-minimos'],
    perfiles: ['familia-numerosa', 'monoparental', 'violencia-genero'],
  },
  {
    id: 'prestaciones-desempleo',
    icono: '🔍',
    nombre: 'Prestación y subsidio por desempleo',
    tipo: 'Prestación SEPE',
    descripcion:
      'Ayuda económica para personas que pierden su empleo de forma involuntaria: la prestación contributiva (si has cotizado lo suficiente) o los subsidios asistenciales (si no cumples esos requisitos).',
    comoFunciona:
      'La prestación contributiva exige un periodo mínimo de cotización en los últimos años y encontrarte en situación legal de desempleo. Si no lo cumples, existen subsidios para colectivos concretos: personas mayores de 45 años con cargas familiares, quienes agotan la prestación contributiva, o quienes nunca llegaron al mínimo cotizado. El simulador del SEPE calcula tu situación concreta a partir de tu vida laboral.',
    organismo: 'Servicio Público de Empleo Estatal (SEPE)',
    enlace: { texto: 'sepe.es', url: 'https://www.sepe.es' },
    figuras: ['desempleo'],
    objetivos: ['prestacion-paro'],
    perfiles: ['mayor45', 'familia-numerosa'],
  },
  {
    id: 'bono-social-electrico',
    icono: '💡',
    nombre: 'Bono Social Eléctrico',
    tipo: 'Descuento en la factura de la luz',
    descripcion:
      'Descuento sobre el precio de la energía para hogares vulnerables o en riesgo de exclusión, aplicado directamente en la factura eléctrica con contrato PVPC.',
    comoFunciona:
      'El porcentaje de descuento y la categoría (vulnerable, vulnerable severo) dependen del nivel de renta del hogar —medido en múltiplos del IPREM— y de la composición familiar, con condiciones reforzadas para familias numerosas, monoparentales o con personas con discapacidad o dependencia. Se solicita ante la comercializadora de referencia aportando la documentación que acredite tu situación.',
    organismo: 'Comercializadoras de referencia / Ministerio para la Transición Ecológica',
    enlace: { texto: 'bonosocial.gob.es', url: 'https://www.bonosocial.gob.es' },
    figuras: ['bajos-ingresos', 'jubilado', 'familia-hijos', 'desempleo'],
    objetivos: ['ayuda-energia'],
    perfiles: ['familia-numerosa', 'monoparental', 'mayor45', 'discapacidad', 'violencia-genero'],
  },
  {
    id: 'deducciones-familiares-irpf',
    icono: '🧾',
    nombre: 'Deducciones familiares del IRPF (anticipables)',
    tipo: 'Deducción fiscal / anticipo mensual',
    descripcion:
      'Deducciones por familia numerosa, por ascendiente o descendiente con discapacidad a cargo, o por cada hijo menor de 3 años, que pueden cobrarse de forma anticipada mes a mes o aplicarse al presentar la declaración.',
    comoFunciona:
      'Se solicitan a la Agencia Tributaria mediante el modelo 143 para el cobro anticipado mensual, o se aplican directamente en la declaración de la Renta. Son compatibles entre sí cuando se cumplen varios requisitos a la vez (por ejemplo, familia numerosa y un hijo con discapacidad reconocida).',
    organismo: 'Agencia Tributaria (AEAT)',
    enlace: { texto: 'agenciatributaria.es', url: 'https://www.agenciatributaria.es' },
    figuras: ['familia-hijos'],
    objetivos: ['deducciones-familia'],
    perfiles: ['familia-numerosa', 'discapacidad', 'monoparental'],
  },
  {
    id: 'pensiones-no-contributivas',
    icono: '🧓',
    nombre: 'Pensiones no contributivas (jubilación e invalidez)',
    tipo: 'Prestación no contributiva',
    descripcion:
      'Prestación periódica para personas mayores o con discapacidad que no han cotizado lo suficiente para tener derecho a una pensión contributiva y carecen de recursos suficientes.',
    comoFunciona:
      'Se concede en función de la edad o el grado de discapacidad reconocido (igual o superior al 65% en el caso de invalidez) y de los ingresos del solicitante y, en su caso, de la unidad familiar. La gestiona el IMSERSO o el organismo equivalente de cada Comunidad Autónoma.',
    organismo: 'IMSERSO / Comunidad Autónoma',
    enlace: { texto: 'imserso.es', url: 'https://www.imserso.es' },
    figuras: ['jubilado', 'dependencia-discapacidad', 'bajos-ingresos'],
    objetivos: ['ingresos-minimos'],
    perfiles: ['discapacidad', 'mayor45'],
  },
  {
    id: 'reconocimiento-discapacidad',
    icono: '♿',
    nombre: 'Reconocimiento del grado de discapacidad',
    tipo: 'Trámite de reconocimiento administrativo',
    descripcion:
      'El certificado de discapacidad (a partir del 33%) da acceso a beneficios fiscales, laborales y sociales: deducciones IRPF, bonificaciones en cotizaciones, plazas reservadas y otras ayudas específicas.',
    comoFunciona:
      'Usa nuestro orientador para valorar si te compensa iniciar el trámite de valoración y qué beneficios suelen desbloquearse a partir del 33% y del 65% de discapacidad reconocida.',
    organismo: 'Servicios de valoración de discapacidad de tu Comunidad Autónoma',
    enlace: { texto: 'Orientador de Discapacidad (meskeIA)', url: '/orientador-discapacidad/' },
    figuras: ['dependencia-discapacidad'],
    objetivos: ['reconocimiento-discapacidad'],
    perfiles: ['discapacidad'],
  },
  {
    id: 'prestaciones-dependencia',
    icono: '🤲',
    nombre: 'Prestaciones por dependencia (SAAD)',
    tipo: 'Prestación / servicio del SAAD',
    descripcion:
      'Si tú o un familiar tenéis reconocido un grado de dependencia (I, II o III), podéis acceder a servicios (ayuda a domicilio, centro de día, residencia) o a prestaciones económicas para cuidados en el entorno familiar.',
    comoFunciona:
      'Usa nuestro orientador para estimar el grado de dependencia probable según el Baremo BVD y conocer qué prestaciones y servicios del Sistema para la Autonomía y Atención a la Dependencia (SAAD) suelen corresponder a cada grado.',
    organismo: 'IMSERSO / Servicios Sociales de tu Comunidad Autónoma',
    enlace: { texto: 'Orientador Grado de Dependencia (meskeIA)', url: '/orientador-grado-dependencia/' },
    figuras: ['dependencia-discapacidad'],
    objetivos: ['cuidado-dependiente'],
    perfiles: ['discapacidad', 'mayor45'],
  },
  {
    id: 'bono-joven-alquiler',
    icono: '🏠',
    nombre: 'Bono Joven de Alquiler',
    tipo: 'Ayuda mensual al alquiler',
    descripcion:
      'Ayuda directa al alquiler para jóvenes que se emancipan, dirigida a reducir el esfuerzo económico de acceder a una primera vivienda en alquiler.',
    comoFunciona:
      'Usa nuestro simulador para comprobar si cumples los requisitos de edad, ingresos y tipo de contrato, y calcular el ahorro mensual y anual estimado.',
    organismo: 'Ministerio de Vivienda / Comunidad Autónoma',
    enlace: { texto: 'Simulador Bono Joven Alquiler (meskeIA)', url: '/simulador-bono-joven-alquiler/' },
    figuras: ['joven-emancipacion'],
    objetivos: ['ayuda-vivienda'],
    perfiles: ['joven'],
  },
  {
    id: 'ayuda-vivienda-rural',
    icono: '🏡',
    nombre: 'Ayuda a la primera vivienda en zona rural',
    tipo: 'Subvención para compra de vivienda',
    descripcion:
      'Ayuda directa para la compra de primera vivienda en municipios pequeños, dentro de los planes estatales de vivienda orientados a fijar población en el medio rural.',
    comoFunciona:
      'Usa nuestro orientador para comprobar si tu municipio y tu situación cumplen los requisitos del plan vigente y obtener una estimación orientativa de la ayuda.',
    organismo: 'Ministerio de Vivienda / Comunidad Autónoma',
    enlace: { texto: 'Orientador Vivienda Rural (meskeIA)', url: '/orientador-ayuda-vivienda-rural/' },
    figuras: ['joven-emancipacion', 'familia-hijos'],
    objetivos: ['ayuda-vivienda'],
    perfiles: ['rural', 'joven'],
  },
  {
    id: 'aval-ico-vivienda',
    icono: '🏦',
    nombre: 'Aval ICO para primera vivienda',
    tipo: 'Aval público sobre la hipoteca',
    descripcion:
      'Aval del Estado que cubre parte de la entrada de la hipoteca para facilitar el acceso a la primera vivienda a jóvenes y familias con hijos menores, sin necesidad de ahorrar el 20% inicial.',
    comoFunciona:
      'Usa nuestro orientador para comprobar si cumples los requisitos de edad, ingresos y tipo de vivienda, y entender el proceso para solicitarlo en una entidad bancaria adherida.',
    organismo: 'Instituto de Crédito Oficial (ICO)',
    enlace: { texto: 'Orientador Aval ICO (meskeIA)', url: '/orientador-aval-ico/' },
    figuras: ['joven-emancipacion', 'familia-hijos'],
    objetivos: ['ayuda-vivienda'],
    perfiles: ['joven', 'familia-numerosa'],
  },
  {
    id: 'formacion-empleo',
    icono: '🎓',
    nombre: 'Formación gratuita para el empleo',
    tipo: 'Formación + posible beca',
    descripcion:
      'Cursos gratuitos de formación profesional para el empleo, dirigidos tanto a personas desempleadas como a trabajadores en activo, que en algunos casos incluyen beca o ayuda al transporte y manutención durante la formación.',
    comoFunciona:
      'Se gestionan a través del SEPE y de los servicios públicos de empleo de cada Comunidad Autónoma. La oferta formativa y las ayudas asociadas varían según la región y la modalidad del curso.',
    organismo: 'SEPE / Servicio de empleo de tu Comunidad Autónoma',
    enlace: { texto: 'sepe.es', url: 'https://www.sepe.es' },
    figuras: ['desempleo', 'joven-emancipacion'],
    objetivos: ['formacion-empleo'],
    perfiles: ['joven', 'mayor45'],
  },
  {
    id: 'servicios-sociales',
    icono: '🏛️',
    nombre: 'Servicios Sociales de tu Ayuntamiento',
    tipo: 'Punto de información y ayudas locales',
    descripcion:
      'Cada ayuntamiento y Comunidad Autónoma gestiona ayudas de emergencia social, ayudas de alquiler, suministros básicos, comedor escolar y otros recursos, con requisitos y plazos propios.',
    comoFunciona:
      'Es el punto de partida recomendado si tu situación es urgente o no encaja claramente en ninguna de las demás categorías: pueden orientarte sobre el conjunto de ayudas municipales y autonómicas disponibles para tu caso.',
    organismo: 'Servicios Sociales de tu Ayuntamiento / Comunidad Autónoma',
    figuras: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
  {
    id: 'bdns-buscador-personas',
    icono: '🔍',
    nombre: 'BDNS — Base de Datos Nacional de Subvenciones',
    tipo: 'Buscador oficial',
    descripcion:
      'El registro oficial donde se publican todas las convocatorias de ayudas y subvenciones públicas activas en España: estatales, autonómicas y locales, incluidas muchas dirigidas a personas y familias.',
    comoFunciona:
      'Es un buscador, no una ayuda en sí misma. Permite filtrar por administración convocante, sector, tipo de beneficiario y fecha para ver qué convocatorias están abiertas ahora mismo.',
    organismo: 'Ministerio de Hacienda',
    enlace: { texto: 'infosubvenciones.es', url: 'https://www.infosubvenciones.es' },
    figuras: [],
    objetivos: [],
    perfiles: [],
    siempre: true,
  },
];
