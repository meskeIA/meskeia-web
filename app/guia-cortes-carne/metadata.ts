import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Cortes de Carne - Vacuno, cerdo, cordero y pollo | meskeIA',
  description: '45 cortes de carne: animal, parte del animal, terneza, método de cocción ideal, temperatura interna y consejos de cocina. Vacuno, cerdo, cordero, pollo y ternera.',
  keywords: 'cortes carne, chuleton, solomillo, secreto iberico, costillas, pierna cordero, pechuga pollo, temperatura carne, metodos coccion carne, guia carniceria, carne vacuno cerdo cordero',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Cortes de Carne | meskeIA',
    description: '45 cortes de carne: animal, terneza, método de cocción ideal y temperatura interna. Vacuno, cerdo, cordero, pollo y ternera.',
    url: 'https://meskeia.com/guia-cortes-carne/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Cortes de Carne | meskeIA',
    description: '45 cortes de carne: terneza, métodos de cocción y temperatura interna ideal.',
  },
  other: {
    'application-name': 'Guía de Cortes de Carne meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Cortes de Carne',
  description: 'Directorio de 45 cortes de carne con información sobre el animal, parte del animal, nivel de terneza, grasa, métodos de cocción ideales, temperatura interna, precio aproximado y consejos de cocina. Incluye vacuno, cerdo ibérico, cordero, pollo y ternera.',
  url: 'https://meskeia.com/guia-cortes-carne/',
  features: [
    '45 cortes con perfil completo',
    'Filtros por animal y método de cocción',
    'Búsqueda por nombre, nombre alternativo o parte del animal',
    'Temperatura interna ideal y tiempo de cocción orientativo',
    'Consejos prácticos de cocina para cada corte',
    'Curiosidades históricas y culturales',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
  ],
});
