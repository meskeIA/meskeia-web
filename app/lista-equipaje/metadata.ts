import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lista de Equipaje Inteligente - Checklist de Viaje Personalizado | meskeIA',
  description: 'Genera una lista de equipaje personalizada según destino, clima, duración y tipo de viaje. Checklist interactivo para no olvidar nada.',
  keywords: 'lista equipaje, checklist viaje, que llevar viaje, maleta, packing list, equipaje playa, equipaje montana, equipaje negocios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lista de Equipaje Inteligente - Checklist Personalizado',
    description: 'Genera tu lista de equipaje según destino, clima y duración. No olvides nada importante.',
    url: 'https://meskeia.com/lista-equipaje',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lista de Equipaje Inteligente - meskeIA',
    description: 'Genera tu checklist de viaje personalizado según destino y tipo de viaje.',
  },
  other: {
    'application-name': 'Lista de Equipaje - meskeIA',
  },
};
