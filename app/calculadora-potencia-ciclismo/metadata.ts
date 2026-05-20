import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Potencia en Ciclismo — FTP, W/kg y VAM | meskeIA',
  description: 'Calcula tu ratio W/kg, zonas de entrenamiento por potencia (FTP) y VAM para subidas cronometradas. Conoce tu nivel como ciclista.',
  keywords: 'calculadora potencia ciclismo, FTP vatios, W/kg ciclismo, zonas entrenamiento potencia, VAM ciclismo, nivel ciclista',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Potencia en Ciclismo — FTP, W/kg y VAM',
    description: 'Analiza tu FTP, W/kg y VAM para conocer tu nivel como ciclista. Zonas de entrenamiento por potencia incluidas.',
    url: 'https://meskeia.com/calculadora-potencia-ciclismo',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Potencia en Ciclismo | meskeIA',
    description: 'FTP, W/kg, VAM y zonas de entrenamiento para ciclistas.',
  },
  other: {
    'application-name': 'Calculadora Potencia Ciclismo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Potencia en Ciclismo',
  description: 'Calculadora de potencia para ciclistas. Calcula tu ratio W/kg, zonas de entrenamiento por potencia (FTP) y VAM para subidas cronometradas. Conoce tu nivel ciclista.',
  url: 'https://meskeia.com/calculadora-potencia-ciclismo/',
  category: 'UtilityApplication',
  features: [
    'Ratio W/kg con clasificación de nivel de rendimiento ciclista',
    'Zonas de potencia Z1-Z6 basadas en tu FTP',
    'Cálculo de VAM (Velocidad Ascensional Media) para subidas cronometradas',
    'Tabla de zonas con rangos de vatios y porcentajes del FTP',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
