import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Setas - Identificación, comestibilidad y temporadas | meskeIA',
  description: '40 setas: comestibilidad, hábitat, temporada, identificación, especies confusas y avisos de seguridad. España y Europa. Advertencia: nunca consumir sin confirmación de experto.',
  keywords: 'guía setas, identificación setas, setas comestibles, setas tóxicas, boletus edulis, rebozuelo, níscalo, amanita phalloides, recolección setas, micología, hongos silvestres, setas España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Setas - Identificación, comestibilidad y temporadas',
    description: '40 setas con ficha completa: comestibilidad, hábitat, temporada, láminas, olor, especies confusas y aviso de seguridad. Gratis y sin registro.',
    url: 'https://meskeia.com/guia-setas/',
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
    title: 'Guía de Setas - Identificación y comestibilidad',
    description: '40 setas con ficha completa: comestibilidad, hábitat, temporada, especies confusas y avisos de seguridad. Micología para todos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Guía de Setas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Setas',
  description: 'Guía de identificación de 40 setas silvestres: comestibilidad, hábitat, temporada, descripción morfológica (sombrero, láminas, pie, olor), especies confusas, avisos de seguridad y curiosidades. Orientada al recolector responsable en España y Europa.',
  url: 'https://meskeia.com/guia-setas/',
  category: 'EducationalApplication',
  features: [
    '40 setas con ficha completa de identificación',
    'Filtro por comestibilidad: comestible, con precaución, tóxica, mortal',
    'Filtro por hábitat: bosque, prados, zonas húmedas, urbano',
    'Descripción morfológica: sombrero, láminas, pie, olor',
    'Especies confusas y avisos de seguridad por seta',
    'Temporadas de recolección y distribución geográfica',
    'Curiosidades y usos culinarios',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
