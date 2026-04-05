import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tu ADN en Números — Biología del Genoma Humano | meskeIA',
  description: 'Cifras fascinantes sobre el ADN humano: 3.200 millones de pares de bases, 99,9% idéntico entre humanos, 60% compartido con el plátano. Explicador visual interactivo para Bachillerato.',
  keywords: 'ADN números, genoma humano, pares de bases, genes, similitud genética, biología bachillerato, explicador visual, cromosomas, secuencia genética',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu ADN en Números — Biología del Genoma Humano',
    description: '3.200 millones de pares de bases, 74.000 millones de km de ADN en tu cuerpo, 96% compartido con el chimpancé. Datos asombrosos sobre la biología humana.',
    url: 'https://meskeia.com/visualizador-adn-numeros',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tu ADN en Números',
    description: 'Cifras fascinantes sobre el genoma humano explicadas de forma visual e interactiva.',
  },
  other: { 'application-name': 'ADN en Números meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu ADN en Números',
  description: 'Explicador visual interactivo sobre las cifras más fascinantes del ADN humano. Bloques clickables con datos sobre el genoma, similitud genética con otros organismos y la escala real del ADN en el cuerpo humano.',
  url: 'https://meskeia.com/visualizador-adn-numeros/',
  features: [
    'Bloques visuales interactivos con 7 cifras clave del ADN humano',
    'Barra de similitud genética comparada con 6 organismos',
    'Escala visual del ADN: desde la célula hasta el Sistema Solar',
    'Contenido educativo orientado a Bachillerato y Selectividad',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
  category: 'EducationalApplication',
});
