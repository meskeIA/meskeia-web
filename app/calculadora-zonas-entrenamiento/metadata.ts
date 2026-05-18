import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Zonas de Entrenamiento — FC por Zona y Fórmula de Karvonen | meskeIA',
  description:
    'Calcula tus 5 zonas de frecuencia cardíaca según tu edad y FC en reposo. Fórmula simple (220−edad) y fórmula de Karvonen. Sabe qué trabaja cada zona: resistencia base, umbral aeróbico, umbral anaeróbico y potencia máxima.',
  keywords:
    'zonas entrenamiento frecuencia cardiaca, FCmax, formula Karvonen, zona aerobica, umbral anaerobico, VO2max, zona 1 2 3 4 5 entrenamiento, calcular pulsaciones entrenamiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Zonas de Entrenamiento — FCmáx y Karvonen',
    description:
      'Introduce tu edad y FC en reposo. Obtén tus 5 zonas de entrenamiento con rango de pulsaciones, % de FCmáx y descripción de qué trabaja cada zona.',
    url: 'https://meskeia.com/calculadora-zonas-entrenamiento',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Zonas de Entrenamiento | meskeIA',
    description: '5 zonas de FC personalizadas por edad. Fórmula simple y Karvonen. Gratis.',
  },
  other: {
    'application-name': 'Zonas Entrenamiento meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora Zonas de Entrenamiento',
  description:
    'Calcula tus 5 zonas de frecuencia cardíaca para entrenar con precisión: desde la zona de recuperación activa hasta la zona de potencia máxima. Usa la fórmula simple (220−edad) o la fórmula de Karvonen (con FC en reposo) para resultados más precisos.',
  url: 'https://meskeia.com/calculadora-zonas-entrenamiento/',
  features: [
    '5 zonas de frecuencia cardíaca personalizadas por edad',
    'Fórmula simple (220−edad) y fórmula de Karvonen con FC en reposo',
    'Rango de pulsaciones y % de FCmáx para cada zona',
    'Descripción detallada de qué trabaja cada zona y cuándo usarla',
    'Tabla de aplicación por objetivo: pérdida de peso, resistencia, rendimiento',
    'Gratuito, sin registro, en español',
  ],
});
