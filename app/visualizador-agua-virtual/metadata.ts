import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuanta Agua Gastas sin Saberlo - Agua Virtual | meskeIA',
  description: 'El agua oculta en tu cafe, tu camiseta y tu filete. Descubre la huella hidrica invisible de los productos cotidianos con datos reales.',
  keywords: 'agua virtual, huella hidrica, agua oculta, consumo agua, agua alimentos, agua ropa, sostenibilidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cuanta Agua Gastas sin Saberlo',
    description: 'La huella hidrica invisible de tu vida cotidiana.',
    url: 'https://meskeia.com/visualizador-agua-virtual',
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
    title: 'Cuanta Agua Gastas sin Saberlo',
    description: 'Agua virtual: lo que no ves en cada producto.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Agua Virtual meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuanta Agua Gastas sin Saberlo',
  description: 'Explicador visual del agua virtual: cuantos litros ocultos hay en tu cafe, tu ropa y tu comida. Huella hidrica por producto y pais.',
  url: 'https://meskeia.com/visualizador-agua-virtual/',
  features: [
    'Litros ocultos en cada producto cotidiano',
    'Comparacion huella hidrica de alimentos',
    'Agua virtual en la industria textil',
    'Estres hidrico global y comercio de agua virtual',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});
