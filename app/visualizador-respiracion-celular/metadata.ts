import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Respiración Celular - La Central Energética de tus Células | meskeIA',
  description: 'Descubre cómo las células obtienen energía de la glucosa: glucólisis, ciclo de Krebs, cadena de transporte de electrones y la mitocondria. Explicador visual interactivo.',
  keywords: 'respiración celular, mitocondria, ATP, glucólisis, ciclo de Krebs, cadena de electrones, NADH, biología, energía celular, metabolismo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Respiración Celular - La Central Energética de tus Células',
    description: 'Cómo las células convierten glucosa en energía: el proceso inverso a la fotosíntesis, explicado visualmente.',
    url: 'https://meskeia.com/visualizador-respiracion-celular/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Respiración Celular - Explicador Visual',
    description: 'De una molécula de glucosa a 38 ATP: la respiración celular como nunca la habías visto.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Respiración Celular Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Respiración Celular - La Central Energética de tus Células',
  description: 'Explicador visual interactivo sobre la respiración celular: glucólisis, ciclo de Krebs, cadena de transporte de electrones, estructura de la mitocondria y datos fascinantes sobre el metabolismo energético.',
  url: 'https://meskeia.com/visualizador-respiracion-celular/',
  category: 'EducationalApplication',
  features: [
    'Proceso completo de respiración celular paso a paso',
    'Las 3 fases: glucólisis, Krebs y cadena de electrones',
    'Diagrama interactivo de la mitocondria con partes clickables',
    'Comparativa visual con la fotosíntesis',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
