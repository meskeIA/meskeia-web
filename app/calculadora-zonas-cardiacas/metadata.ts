import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Zonas Cardíacas | meskeIA',
  description:
    'Calculadora de zonas cardíacas con la fórmula Karvonen. Introduce tu edad y frecuencia cardíaca en reposo para obtener tus 5 zonas de entrenamiento personalizadas.',
  keywords:
    'calculadora zonas cardiacas, formula karvonen, frecuencia cardiaca entreno, zonas entrenamiento, fc maxima, fc reserva, zonas cardiacas deportes, zona 1 2 3 4 5 entrenamiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Zonas Cardíacas',
    description:
      'Calcula tus 5 zonas de entrenamiento con la fórmula Karvonen. Personalizado con tu FC máxima y FC en reposo.',
    url: 'https://meskeia.com/calculadora-zonas-cardiacas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Zonas Cardíacas',
    description:
      'Zonas de entrenamiento personalizadas con la fórmula Karvonen. Gratuito y sin registro.',
  },
  other: {
    'application-name': 'Calculadora de Zonas Cardíacas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Zonas Cardíacas (Karvonen)',
  description:
    'Calcula las 5 zonas de entrenamiento cardíaco personalizadas usando la fórmula de Karvonen. Introduce edad y frecuencia cardíaca en reposo; opcionalmente usa tu FCmax medida en lugar de la estimada (220 − edad). Muestra rangos de FC por zona y el beneficio principal de cada una.',
  url: 'https://meskeia.com/calculadora-zonas-cardiacas/',
  category: 'UtilityApplication',
  features: [
    'Cálculo con fórmula Karvonen (FC reserva) para mayor precisión individual',
    '5 zonas personalizadas: recuperación, base aeróbica, aeróbica, umbral anaeróbico, máxima intensidad',
    'FCmax estimada (220 − edad) o medida manualmente',
    'Rangos de FC en pulsaciones por minuto para cada zona',
    'Porcentaje de FC reserva y beneficio principal por zona',
    'Tabla de zonas coloreada para identificación rápida',
    'Funciona 100 % en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});
