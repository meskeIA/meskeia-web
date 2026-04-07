import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía de una Flor - De la Polinización al Fruto | meskeIA',
  description: 'Explora la anatomía de una flor de forma visual: partes clickables, tipos de polinización, formación de frutos y semillas, y datos fascinantes. Explicador visual interactivo.',
  keywords: 'anatomía flor, partes de la flor, polinización, estambre, pistilo, pétalos, sépalos, fruto, semilla, botánica, angiospermas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía de una Flor - De la Polinización al Fruto',
    description: 'Partes de la flor, tipos de polinización, formación de frutos y datos fascinantes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-anatomia-flor',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anatomía de una Flor - Explicador Visual',
    description: 'Partes de la flor, polinización, frutos y semillas. Explicador visual interactivo en español.',
  },
  other: { 'application-name': 'Anatomía Flor meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía de una Flor - De la Polinización al Fruto',
  description: 'Explicador visual interactivo sobre la anatomía de una flor: partes clickables con funciones, tipos de polinización, transformación del ovario en fruto, dispersión de semillas y datos fascinantes del mundo vegetal.',
  url: 'https://meskeia.com/visualizador-anatomia-flor/',
  category: 'EducationalApplication',
  features: [
    'Diagrama interactivo de una flor con partes clickables y colores distintivos',
    'Proceso de polinización paso a paso: entomófila, anemófila, ornitófila e hidrófila',
    'Transformación del ovario en fruto: carnosos, secos y dispersión de semillas',
    'Datos fascinantes: 400.000 especies, Rafflesia, orquídeas y más',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
