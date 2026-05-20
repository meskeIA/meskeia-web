import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Pace de Running | meskeIA',
  description: 'Calcula tu ritmo por kilómetro, velocidad media y proyecciones para 5K, 10K, media maratón y maratón. Tabla de splits por km incluida.',
  keywords: 'calculadora pace running, ritmo por kilómetro, pace min/km, velocidad media corredor, splits carrera, proyección maratón, calculadora running, ritmo carrera',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Pace de Running',
    description: 'Obtén tu pace (min/km), velocidad media, splits y proyecciones para 5K, 10K, media maratón y maratón.',
    url: 'https://meskeia.com/calculadora-pace-running/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Pace de Running',
    description: 'Ritmo, velocidad, splits y proyecciones de carrera en una sola herramienta.',
  },
  other: {
    'application-name': 'Calculadora de Pace de Running meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Pace de Running',
  description: 'Calculadora de pace de running. Introduce distancia y tiempo para obtener tu ritmo por kilómetro, velocidad media, tabla de splits por km y proyecciones de tiempo estimado para 5K, 10K, media maratón y maratón.',
  url: 'https://meskeia.com/calculadora-pace-running/',
  category: 'UtilityApplication',
  features: [
    'Cálculo de pace (ritmo) por kilómetro en formato min:seg',
    'Velocidad media en km/h',
    'Tabla de splits con tiempo acumulado por kilómetro',
    'Proyecciones para 5K, 10K, media maratón y maratón',
    'Entrada de tiempo en horas, minutos y segundos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});
