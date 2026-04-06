import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fibonacci en la Naturaleza - La Secuencia que Lo Conecta Todo | meskeIA',
  description: 'Descubre la secuencia de Fibonacci y la proporción áurea en la naturaleza: espirales, girasoles, piñas, pétalos, arte y diseño. Explicador visual interactivo.',
  keywords: 'Fibonacci, proporción áurea, número áureo, espiral dorada, naturaleza, girasol, filotaxis, 1.618, phi, matemáticas naturaleza, golden ratio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Fibonacci en la Naturaleza - La Secuencia que Lo Conecta Todo',
    description: 'La secuencia de Fibonacci y la proporción áurea explicadas visualmente: de los pétalos a las galaxias.',
    url: 'https://meskeia.com/visualizador-fibonacci-naturaleza',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fibonacci en la Naturaleza - Explicador Visual',
    description: '1, 1, 2, 3, 5, 8, 13... La secuencia que gobierna pétalos, conchas, galaxias y obras de arte.',
  },
  other: { 'application-name': 'Fibonacci Naturaleza meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Fibonacci en la Naturaleza - La Secuencia que Lo Conecta Todo',
  description: 'Explicador visual interactivo sobre la secuencia de Fibonacci y la proporción áurea (φ = 1,618...) en la naturaleza, el arte y el diseño. Espirales, girasoles, pétalos, conchas y más.',
  url: 'https://meskeia.com/visualizador-fibonacci-naturaleza/',
  category: 'EducationalApplication',
  features: [
    'Secuencia de Fibonacci interactiva: genera números paso a paso',
    'Espiral dorada dibujada con CSS a partir de cuadrados de Fibonacci',
    'Fibonacci en plantas: girasoles, piñas, piñones, pétalos',
    'Proporción áurea en arte, arquitectura y diseño',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
