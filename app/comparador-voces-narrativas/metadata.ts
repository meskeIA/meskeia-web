import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Comparador de Voces Narrativas — Estilos de Grandes Novelistas | meskeIA',
  description: 'Compara el estilo narrativo de los grandes novelistas: Flaubert, Proust, Kafka, Woolf, Hemingway, García Márquez, Borges y más. Dimensiones del estilo, técnicas y fragmentos representativos.',
  keywords: 'voz narrativa, estilo literario, comparar autores, flaubert proust, stream of consciousness, realismo magico, estilo indirecto libre, técnicas narrativas, modernismo, realismo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Voces Narrativas | meskeIA',
    description: 'Compara el estilo, técnicas y fragmentos de los grandes novelistas de la historia.',
    url: 'https://meskeia.com/comparador-voces-narrativas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparador de Voces Narrativas | meskeIA',
    description: 'Flaubert vs Proust, Woolf vs Hemingway, Borges vs García Márquez: compara estilos en profundidad.',
  },
  other: {
    'application-name': 'Comparador de Voces Narrativas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Comparador de Voces Narrativas',
  description: 'Herramienta educativa interactiva para comparar el estilo narrativo de 10 grandes novelistas: dimensiones del estilo, técnicas literarias y fragmentos representativos atribuidos.',
  url: 'https://meskeia.com/comparador-voces-narrativas/',
  category: 'EducationalApplication',
  features: [
    '10 novelistas de distintas épocas, países y movimientos literarios',
    'Comparación de 5 dimensiones del estilo con visualización de barras',
    'Fragmentos representativos con análisis de cada técnica',
    'Lista de técnicas narrativas clave por autor',
    'Análisis automático de similitudes y contrastes',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
