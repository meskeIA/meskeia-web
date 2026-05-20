import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de 1RM — Repetición Máxima | meskeIA',
  description: 'Calcula tu repetición máxima (1RM) en el gimnasio a partir del peso y las repeticiones realizadas. Obtén tu tabla de cargas de entrenamiento por porcentaje con las fórmulas Epley y Brzycki.',
  keywords: 'calculadora 1rm, repeticion maxima, 1 rep max, fuerza maxima, epley, brzycki, tabla cargas entrenamiento, porcentaje 1rm, gimnasio, powerlifting',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de 1RM — Repetición Máxima',
    description: 'Calcula tu fuerza máxima en cualquier ejercicio y obtén la tabla de cargas por porcentaje.',
    url: 'https://meskeia.com/calculadora-1rm-gimnasio',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de 1RM — Repetición Máxima | meskeIA',
    description: 'Calcula tu fuerza máxima en cualquier ejercicio con las fórmulas Epley y Brzycki.',
  },
  other: {
    'application-name': 'Calculadora 1RM meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de 1RM — Repetición Máxima',
  description: 'Calcula tu repetición máxima (1RM) en el gimnasio a partir del peso y las repeticiones realizadas. Obtén tu tabla de cargas de entrenamiento por porcentaje con las fórmulas Epley y Brzycki.',
  url: 'https://meskeia.com/calculadora-1rm-gimnasio/',
  category: 'UtilityApplication',
  features: [
    'Fórmulas Epley y Brzycki para el cálculo del 1RM',
    'Tabla completa de cargas por porcentaje (60%–100%)',
    'Cálculo para cualquier ejercicio de fuerza',
    'Comparativa de ambas fórmulas con media ponderada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
