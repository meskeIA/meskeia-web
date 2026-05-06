/**
 * Guías-journey de meskeIA: procesos curados que agrupan varias apps
 * con texto explicativo (a diferencia de las apps individuales).
 *
 * URL pattern: /guia/{id}/
 */

export interface GuideJourney {
  id: string;
  name: string;
  icon: string;
  description: string;
  url: string;
  toolsCount: number;
  available: boolean;
}

export const guidesJourney: GuideJourney[] = [
  {
    id: 'comprar-casa',
    name: 'Guía para Comprar Casa',
    icon: '🏠',
    description: 'Desde buscar hipoteca hasta calcular todos los gastos de compra',
    url: '/guia/comprar-casa/',
    toolsCount: 5,
    available: true,
  },
  {
    id: 'freelance',
    name: 'Guía Freelance',
    icon: '💼',
    description: 'Facturación, impuestos y gestión para trabajadores independientes',
    url: '/guia/freelance/',
    toolsCount: 7,
    available: true,
  },
  {
    id: 'invertir',
    name: 'Guía para Invertir',
    icon: '📈',
    description: 'Primeros pasos en inversión: ahorro, fondos y planificación',
    url: '/guia/invertir/',
    toolsCount: 5,
    available: true,
  },
  {
    id: 'ahorrar-dinero',
    name: 'Guía para Ahorrar Dinero',
    icon: '💰',
    description: 'Control de gastos, fondo de emergencia y estrategias para eliminar deudas',
    url: '/guia/ahorrar-dinero/',
    toolsCount: 6,
    available: true,
  },
  {
    id: 'vivir-sano',
    name: 'Guía para Vivir Más Sano',
    icon: '🌿',
    description: 'Nutrición, sueño, hidratación y hábitos saludables duraderos',
    url: '/guia/vivir-sano/',
    toolsCount: 7,
    available: true,
  },
  {
    id: 'comprar-coche',
    name: 'Guía para Comprar un Coche',
    icon: '🚗',
    description: 'Compara contado, financiación y renting. Calcula el coste real de uso',
    url: '/guia/comprar-coche/',
    toolsCount: 4,
    available: true,
  },
  {
    id: 'montar-negocio',
    name: 'Guía para Montar un Negocio',
    icon: '🚀',
    description: 'Valida tu idea, calcula el break-even y gestiona desde el primer día',
    url: '/guia/montar-negocio/',
    toolsCount: 7,
    available: true,
  },
  {
    id: 'accesibilidad',
    name: 'Guía de Accesibilidad Digital',
    icon: '♿',
    description: 'Kit de apoyos visuales para autismo, TDAH y dislexia. Sin registro ni instalación',
    url: '/guia/accesibilidad/',
    toolsCount: 9,
    available: true,
  },
  {
    id: 'herencias',
    name: 'Guía para Gestionar una Herencia',
    icon: '📜',
    description: 'Documentos, impuestos y plazos para tramitar una herencia en España',
    url: '/guia/herencias/',
    toolsCount: 4,
    available: true,
  },
  {
    id: 'jubilacion',
    name: 'Guía para Planificar la Jubilación',
    icon: '🏤',
    description: 'Pensión pública, brecha de ingresos, ahorro complementario, plan de pensiones e IRPF como pensionista',
    url: '/guia/jubilacion/',
    toolsCount: 6,
    available: true,
  },
  {
    id: 'pensar-mejor',
    name: 'Guía Pensar Mejor',
    icon: '🧠',
    description: 'Herramientas de reflexión profesional: conócete, decide mejor y emprende con criterio',
    url: '/guia/pensar-mejor/',
    toolsCount: 14,
    available: true,
  },
];
