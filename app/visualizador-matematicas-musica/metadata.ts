import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Los Números de la Música - Matemáticas del Sonido y la Armonía | meskeIA',
  description: 'Descubre las matemáticas detrás de la música: frecuencias, intervalos pitagóricos, acordes mayores y menores, ritmo, compases y la proporción áurea en composiciones famosas.',
  keywords: 'matemáticas música, frecuencia sonido, intervalos pitagóricos, acordes mayor menor, escala temperada, ritmo BPM, proporción áurea música, 440 Hz, consonancia disonancia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Los Números de la Música - Matemáticas del Sonido y la Armonía',
    description: 'Frecuencias, ratios pitagóricos, acordes y ritmo: toda la música es matemáticas. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-matematicas-musica',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Los Números de la Música - Explicador Visual',
    description: 'La música es matemáticas: frecuencias, intervalos, acordes y ritmo explicados visualmente.',
  },
  other: { 'application-name': 'Matemáticas Música meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Los Números de la Música - Matemáticas del Sonido y la Armonía',
  description: 'Explicador visual interactivo sobre las matemáticas detrás de la música: ondas sonoras y frecuencias, la escala de 12 notas y los ratios pitagóricos, acordes y armonía, ritmo y la proporción áurea en composiciones clásicas.',
  url: 'https://meskeia.com/visualizador-matematicas-musica/',
  category: 'EducationalApplication',
  features: [
    'Visualización de ondas sonoras: frecuencia, amplitud y forma de onda',
    'Ratios pitagóricos e intervalos musicales explicados visualmente',
    'Acordes mayores y menores: por qué suenan alegre o triste',
    'Ritmo, compases y BPM por género musical',
    'Proporción áurea y Fibonacci en composiciones de Debussy y Tool',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
