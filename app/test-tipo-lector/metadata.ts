import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Test: ¿Qué tipo de lector eres? — Descubre tu perfil | meskeIA',
  description: 'Descubre tu arquetipo lector: ¿eres El Detective, El Explorador, El Empático, El Esteta o El Pensador? 8 preguntas, resultado con géneros y lecturas adaptadas a tu perfil.',
  keywords: 'test lector, perfil lector, que tipo de lector soy, arquetipos lector, generos literarios, test literario, recomendaciones lectura, lector perfil',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Qué tipo de lector eres? | meskeIA',
    description: 'Descubre tu perfil lector: El Detective, El Explorador, El Empático, El Esteta o El Pensador.',
    url: 'https://meskeia.com/test-tipo-lector',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué tipo de lector eres? | meskeIA',
    description: '8 preguntas para descubrir tu arquetipo lector con géneros y lecturas recomendadas.',
  },
  other: {
    'application-name': 'Test Tipo de Lector meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Test: ¿Qué tipo de lector eres?',
  description: 'Test de perfil lector de 8 preguntas que determina tu arquetipo: Detective, Explorador, Empático, Esteta o Pensador. Incluye géneros favoritos, autores emblema y lecturas recomendadas.',
  url: 'https://meskeia.com/test-tipo-lector/',
  category: 'EducationalApplication',
  features: [
    '8 preguntas de perfil lector con 5 opciones cada una',
    '5 arquetipos lector con descripción detallada',
    'Géneros literarios asociados a cada perfil',
    'Autores emblema y lecturas recomendadas por arquetipo',
    'Resultado compartible con descripción personalizada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
