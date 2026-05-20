import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Resistencias para LED y Código de Colores | meskeIA',
  description: 'Decodifica el código de colores de resistencias (4 y 5 bandas) y calcula la resistencia exacta para tus circuitos con LED. Resistencias E12 recomendadas.',
  keywords: 'codigo colores resistencia, calculadora led, resistencia led, ohm, circuito led, decodificador resistencias, electronica, bandas resistencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Resistencias para LED y Código de Colores',
    description: 'Decodifica el código de colores de resistencias y calcula la resistencia necesaria para circuitos con LED. Incluye valores E12 recomendados.',
    url: 'https://meskeia.com/calculadora-resistencias-led',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Resistencias para LED y Código de Colores',
    description: 'Decodifica bandas de colores y calcula la resistencia ideal para tus LEDs. Herramienta de electrónica gratuita.',
  },
  other: {
    'application-name': 'Calculadora Resistencias LED meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Resistencias para LED y Código de Colores',
  description: 'Herramienta de electrónica que decodifica el código de colores de resistencias (4 y 5 bandas) y calcula la resistencia limitadora exacta para circuitos con LED. Ideal para makers, estudiantes de electrónica y aficionados al bricolaje electrónico.',
  url: 'https://meskeia.com/calculadora-resistencias-led/',
  category: 'UtilityApplication',
  features: [
    'Decodificador de código de colores: resistencias de 4 y 5 bandas',
    'Selección visual de bandas con colores reales',
    'Calculadora LED: resistencia limitadora por Ley de Ohm',
    'Valor de resistencia estándar E12 más cercano recomendado',
    'Potencia disipada en la resistencia (previene sobrecalentamiento)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
