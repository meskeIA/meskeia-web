import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Ciclo del Agua - El Viaje Infinito de cada Gota | meskeIA',
  description: 'Explicador visual interactivo del ciclo hidrologico completo: evaporacion, condensacion, precipitacion, escorrentia e infiltracion. Datos de escala y tiempos de residencia.',
  keywords: 'ciclo del agua, ciclo hidrologico, evaporacion, condensacion, precipitacion, escorrentia, infiltracion, agua planeta, acuiferos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Ciclo del Agua - El Viaje Infinito de cada Gota',
    description: 'Descubre como viaja el agua por la Tierra: evaporacion, nubes, lluvia, rios y acuiferos en un ciclo que dura miles de millones de anos.',
    url: 'https://meskeia.com/visualizador-ciclo-agua',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Ciclo del Agua - El Viaje Infinito de cada Gota',
    description: 'El agua que bebes hoy puede haber sido bebida por un dinosaurio. Explicador visual interactivo.',
  },
  other: { 'application-name': 'Ciclo del Agua meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Ciclo del Agua - El Viaje Infinito de cada Gota',
  description: 'Explicador visual interactivo del ciclo hidrologico: evaporacion, condensacion, precipitacion, escorrentia, infiltracion. Distribucion del agua en la Tierra y tiempos de residencia.',
  url: 'https://meskeia.com/visualizador-ciclo-agua/',
  features: [
    'Diagrama animado del ciclo hidrologico completo',
    'Distribucion del agua en la Tierra con escalas proporcionales',
    'Tiempos de residencia del agua en cada reservorio',
    'Datos fascinantes sobre el agua y cambio climatico',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});
