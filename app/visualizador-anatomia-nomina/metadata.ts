import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía de una Nómina - Explicador Visual Interactivo | meskeIA',
  description: 'Entiende cada línea de tu nómina española. Nómina ficticia interactiva: haz clic en cada concepto y descubre qué significa y por qué se descuenta.',
  keywords: 'nómina española, entender nómina, devengos, deducciones, base cotización, IRPF nómina, explicador visual, conceptos nómina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía de una Nómina - Explicador Visual',
    description: 'Nómina ficticia interactiva: cada línea explicada. Devengos, deducciones, bases de cotización.',
    url: 'https://meskeia.com/visualizador-anatomia-nomina',
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
    title: 'Anatomía de una Nómina - Explicador Visual',
    description: 'Haz clic en cada línea de la nómina y descubre qué significa.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Anatomía Nómina meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía de una Nómina',
  description: 'Explicador visual interactivo de una nómina española. Cada concepto (devengos, deducciones, bases de cotización, IRPF) es clickable y despliega una explicación clara de qué es, cómo se calcula y por qué importa.',
  url: 'https://meskeia.com/visualizador-anatomia-nomina/',
  features: [
    'Nómina ficticia interactiva con datos de ejemplo',
    'Explicación de cada concepto al hacer clic',
    'Secciones: devengos, deducciones, bases de cotización, líquido',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
