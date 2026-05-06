import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las Enzimas del Cuerpo Humano - Catalizadores de la Vida | meskeIA',
  description: 'Descubre las enzimas del cuerpo humano: modelo llave-cerradura, enzimas digestivas y metabólicas, factores que afectan su actividad y cofactores esenciales.',
  keywords: 'enzimas, catalizadores biológicos, llave-cerradura, pepsina, amilasa, lipasa, catalasa, ATP sintasa, cofactores, coenzimas, cinética enzimática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las Enzimas del Cuerpo Humano - Catalizadores de la Vida',
    description: 'Modelo llave-cerradura, enzimas digestivas y metabólicas, factores de actividad y cofactores esenciales.',
    url: 'https://meskeia.com/visualizador-enzimas-cuerpo-humano',
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
    title: 'Las Enzimas del Cuerpo Humano - Catalizadores de la Vida',
    description: 'Modelo llave-cerradura, enzimas digestivas, metabólicas y hepáticas explicadas visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Enzimas del Cuerpo Humano meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Las Enzimas del Cuerpo Humano - Catalizadores de la Vida',
  description: 'Explicador visual interactivo de las enzimas del cuerpo humano: modelo llave-cerradura y ajuste inducido, enzimas digestivas, metabólicas y hepáticas, factores que afectan su actividad (pH, temperatura, inhibidores) y cofactores esenciales.',
  url: 'https://meskeia.com/visualizador-enzimas-cuerpo-humano/',
  category: 'EducationalApplication',
  features: [
    'Modelo llave-cerradura y ajuste inducido con SVG interactivo',
    'Grid de enzimas digestivas, metabólicas y hepáticas con datos detallados',
    'Sliders interactivos de temperatura, pH y concentración de sustrato',
    'Cofactores, coenzimas y enfermedades enzimáticas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
