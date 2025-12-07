import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planificador de Mascota - Cachorro y Gatito | meskeIA',
  description: 'Organiza la llegada de tu cachorro o gatito: checklist por etapas, lista de compras esenciales, calendario de vacunas y consejos de cuidado. Herramienta gratuita.',
  keywords: 'planificador mascota, checklist cachorro, lista compras perro, vacunas cachorro, cuidados gatito, preparar llegada cachorro, qué comprar para perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Mascota - Cachorro y Gatito',
    description: 'Checklist completo, lista de compras y calendario de vacunas para preparar la llegada de tu nueva mascota',
    url: 'https://meskeia.com/planificador-mascota',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planificador de Mascota - Cachorro y Gatito',
    description: 'Organiza todo para la llegada de tu nueva mascota: checklist, compras y vacunas',
  },
};
