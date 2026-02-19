import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Presupuesto de Viaje | meskeIA',
  description: 'Planifica el presupuesto de tu viaje por categorías y divide los gastos entre el grupo. Transporte, alojamiento, comida, actividades y más.',
  keywords: ['presupuesto viaje', 'gastos viaje', 'dividir gastos grupo', 'planificar viaje', 'calculadora viaje', 'vacaciones presupuesto'],
  openGraph: {
    title: 'Calculadora de Presupuesto de Viaje - meskeIA',
    description: 'Planifica tu viaje por categorías y divide los gastos entre el grupo de viajeros.',
    url: 'https://meskeia.com/presupuesto-viaje/',
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
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
};
