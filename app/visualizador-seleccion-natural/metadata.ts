import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selección Natural - El Motor de la Evolución | meskeIA',
  description: 'Explora la selección natural de forma visual: variación, herencia, sobreproducción y selección. Ejemplos clásicos, Darwin vs Lamarck y datos fascinantes sobre evolución.',
  keywords: 'selección natural, evolución, Darwin, Lamarck, polilla del abedul, pinzones, resistencia antibióticos, herencia, adaptación, biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Selección Natural - El Motor de la Evolución',
    description: 'Los 4 pilares de Darwin, ejemplos clásicos, comparativa Darwin vs Lamarck y datos fascinantes. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-seleccion-natural',
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
    title: 'Selección Natural - Explicador Visual Interactivo',
    description: 'Comprende la evolución por selección natural con simulaciones, ejemplos clásicos y comparativas visuales.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Selección Natural meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Selección Natural - El Motor de la Evolución',
  description: 'Explicador visual interactivo sobre la selección natural: los 4 pilares de Darwin, simulación de poblaciones, ejemplos clásicos (polilla del abedul, pinzones, antibióticos), comparativa Darwin vs Lamarck y datos fascinantes sobre evolución.',
  url: 'https://meskeia.com/visualizador-seleccion-natural/',
  category: 'EducationalApplication',
  features: [
    'Simulación visual de selección natural con poblaciones de individuos coloreados',
    'Los 4 pilares de Darwin: variación, herencia, sobreproducción y selección',
    'Ejemplos clásicos: polilla del abedul, pinzones de Galápagos, resistencia a antibióticos',
    'Comparativa visual Darwin vs Lamarck con el ejemplo de la jirafa',
    'Datos fascinantes sobre evolución y selección natural',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
