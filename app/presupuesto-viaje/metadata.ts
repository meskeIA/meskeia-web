import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Presupuesto de Viaje | meskeIA',
  description: 'Planifica el presupuesto de tu viaje por categorías y divide los gastos entre el grupo. Transporte, alojamiento, comida, actividades y más.',
  keywords: ['presupuesto viaje', 'gastos viaje', 'dividir gastos grupo', 'planificar viaje', 'calculadora viaje', 'vacaciones presupuesto'],
  openGraph: {
    title: 'Calculadora de Presupuesto de Viaje - meskeIA',
    description: 'Planifica tu viaje por categorías y divide los gastos entre el grupo de viajeros.',
    url: 'https://meskeia.com/presupuesto-viaje/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Presupuesto de Viaje meskeIA',
  description: 'Planifica el presupuesto de tu viaje por categorías y divide gastos entre el grupo',
  url: 'https://meskeia.com/presupuesto-viaje/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  isAccessibleForFree: true,
  featureList: [
    'Gastos por categorías editables: transporte, alojamiento, comida, actividades y otros',
    'Añadir y quitar gastos y categorías propias',
    'Total del viaje, coste por persona y por persona y día',
    'Desglose por categoría con su porcentaje del total',
    'Presupuesto máximo con barra de consumo y lo que sobra o se excede',
    'Reparto automático del presupuesto máximo entre categorías (30/35/20/10/5 %)',
    'Símbolo de nueve divisas (EUR, USD, GBP, MXN, ARS, COP, PEN, CLP, BRL), sin conversión',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto dinero necesito para un viaje de una semana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del destino y el estilo de viaje. En Europa occidental, un presupuesto medio ronda los 100-150 € al día por persona incluyendo alojamiento, transporte local, comidas y actividades. Para destinos de bajo coste en Asia o Latinoamérica puede reducirse a 30-60 € al día. Planificar por categorías (transporte, alojamiento, comida, actividades, imprevistos) ayuda a tener una estimación realista.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo dividir los gastos de un viaje en grupo de forma justa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La forma más habitual es sumar todos los gastos compartidos y dividirlos a partes iguales entre los integrantes del grupo. Si algunos participantes pagan más en determinadas categorías (por ejemplo, habitación individual vs. doble), se calcula la diferencia y se ajusta el balance. Lo ideal es registrar cada gasto en el momento para evitar olvidos al final del viaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué categorías de gastos debo incluir al planificar un viaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las categorías principales son: transporte (vuelos, trenes, autobús), alojamiento, comida y bebida, actividades y entradas, compras y souvenirs, seguro de viaje y una partida para imprevistos (como regla práctica, un 10-15 % del total). Para viajes internacionales también conviene incluir los costes de visado o tasas de entrada si aplica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es útil una calculadora de presupuesto de viaje frente a una hoja de cálculo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una calculadora específica organiza automáticamente los gastos por categorías, calcula el coste total y distribuye los importes entre los viajeros sin necesidad de crear fórmulas. Es especialmente útil para grupos, ya que hace los cálculos de reparto de manera inmediata. Una hoja de cálculo ofrece más flexibilidad, pero requiere configuración manual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debería reservar para imprevistos en un viaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No hay una cifra oficial: como regla práctica, un 10-15 % sobre el presupuesto planificado para cubrir imprevistos como retrasos, cambios de planes, gastos médicos menores o actividades no previstas. En viajes largos o a destinos con menos infraestructura conviene ir hacia la parte alta. Contar con un seguro de viaje reduce la necesidad de esta reserva para emergencias mayores.',
      },
    },
  ],
};
