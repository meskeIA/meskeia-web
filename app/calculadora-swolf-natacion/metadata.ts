import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora SWOLF — Eficiencia en Natación | meskeIA',
  description:
    'Calcula tu índice SWOLF para medir la eficiencia en el agua. Combina tiempo y brazadas por largo para mejorar tu técnica de natación. Compatible con piscinas de 25m y 50m.',
  keywords: 'SWOLF natación, eficiencia natación, índice SWOLF, brazadas por largo, técnica natación, velocidad natación, calculadora natación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora SWOLF — Eficiencia en Natación',
    description:
      'Mide tu eficiencia en el agua combinando tiempo y brazadas por largo. Obtén tu nivel (élite, avanzado, intermedio, principiante) y consejos de mejora.',
    url: 'https://meskeia.com/calculadora-swolf-natacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora SWOLF — Eficiencia en Natación | meskeIA',
    description:
      'Calcula tu índice SWOLF y descubre tu nivel de eficiencia en natación. Compatible con piscinas de 25m y 50m.',
  },
  other: {
    'application-name': 'Calculadora SWOLF Natación meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Calculadora SWOLF — Eficiencia en Natación',
  description:
    'Calculadora del índice SWOLF para medir la eficiencia técnica en natación. Combina el tiempo por largo y las brazadas para obtener una puntuación de eficiencia con clasificación por nivel y consejos de mejora.',
  url: 'https://meskeia.com/calculadora-swolf-natacion/',
  category: 'UtilityApplication',
  features: [
    'Índice SWOLF de eficiencia en natación',
    'Clasificación por nivel: élite, avanzado, intermedio y principiante',
    'Velocidad media en min/100m',
    'Consejos de mejora técnica personalizados según el nivel',
    'Compatible con piscinas de 25m y 50m',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
