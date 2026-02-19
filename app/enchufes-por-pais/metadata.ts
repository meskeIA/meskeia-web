import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enchufes por País - ¿Qué adaptador necesitas? | meskeIA',
  description: 'Consulta qué tipo de enchufe usan en cada país antes de viajar. Voltaje, frecuencia y qué adaptador llevar. Más de 100 países.',
  keywords: ['enchufe pais', 'adaptador viaje', 'voltaje pais', 'tipo enchufe', 'electricidad extranjero', 'plug adapter', 'adaptador corriente'],
  openGraph: {
    title: 'Enchufes por País - Adaptadores para viajeros - meskeIA',
    description: 'Descubre qué enchufe y adaptador necesitas para cada país. Voltaje y frecuencia incluidos.',
    url: 'https://meskeia.com/enchufes-por-pais/',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Enchufes por País meskeIA',
  description: 'Consulta el tipo de enchufe, voltaje y frecuencia eléctrica de cada país del mundo',
  url: 'https://meskeia.com/enchufes-por-pais/',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
};
