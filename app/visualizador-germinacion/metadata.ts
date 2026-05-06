import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Germinación - De la Semilla a la Planta | meskeIA',
  description: 'Descubre cómo germina una semilla: anatomía, fases del proceso, factores necesarios y datos fascinantes. Explicador visual interactivo de biología vegetal.',
  keywords: 'germinación, semilla, plántula, radícula, plúmula, cotiledones, testa, imbibición, biología vegetal, botánica, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Germinación - De la Semilla a la Planta',
    description: 'El viaje de una semilla hasta convertirse en planta, explicado visualmente paso a paso.',
    url: 'https://meskeia.com/visualizador-germinacion',
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
    title: 'Germinación - Explicador Visual',
    description: 'De semilla a planta: anatomía, fases, factores y datos curiosos sobre la germinación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Germinación Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Germinación - De la Semilla a la Planta',
  description: 'Explicador visual interactivo sobre la germinación: anatomía de la semilla, fases del proceso paso a paso, factores necesarios y datos fascinantes del mundo vegetal.',
  url: 'https://meskeia.com/visualizador-germinacion/',
  category: 'EducationalApplication',
  features: [
    'Anatomía de semilla con partes clickables',
    'Proceso de germinación animado paso a paso',
    'Factores de germinación con controles interactivos',
    'Datos fascinantes sobre semillas y plantas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
