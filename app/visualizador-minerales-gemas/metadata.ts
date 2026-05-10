import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Minerales y Gemas - Escala de Mohs y Piedras Preciosas | meskeIA',
  description: 'Explora la escala de Mohs con los 10 minerales de referencia, las gemas preciosas (diamante, rubí, zafiro, esmeralda), cómo se forman y sus usos industriales vs joyería.',
  keywords: 'minerales, gemas, escala Mohs, diamante, rubí, zafiro, esmeralda, dureza, cristalografía, piedras preciosas, corindón, cuarzo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Minerales y Gemas - Escala de Mohs y Piedras Preciosas',
    description: 'Los 10 minerales de Mohs, gemas cardinales, formación de diamantes y rubíes, y usos industriales vs joyería. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-minerales-gemas/',
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
    title: 'Minerales y Gemas - Explicador Visual',
    description: 'Del talco al diamante: la escala de Mohs, gemas preciosas y cómo se forman a miles de metros bajo tierra.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Minerales y Gemas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Minerales y Gemas - Escala de Mohs y Piedras Preciosas',
  description: 'Explicador visual interactivo sobre la escala de Mohs, gemas preciosas, formación de diamantes y rubíes, y usos industriales vs joyería.',
  url: 'https://meskeia.com/visualizador-minerales-gemas/',
  category: 'EducationalApplication',
  features: [
    'Escala de Mohs completa con 10 minerales y comparaciones prácticas',
    'Gemas preciosas: diamante, rubí, zafiro, esmeralda y más',
    'Formación: ígnea, sedimentaria y metamórfica con timeline',
    'Usos industriales vs joyería con datos curiosos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
