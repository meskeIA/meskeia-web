import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Fechas Online | Diferencia entre Fechas, Edad y Días - meskeIA',
  description: '¿Cuántos días faltan para una fecha o cuál es tu edad exacta? Calculadora de fechas: diferencias, suma/resta días y día de la semana. Ideal para plazos y cumpleaños.',
  keywords: [
    'calculadora fechas',
    'diferencia entre fechas',
    'calcular edad',
    'sumar días',
    'restar fechas',
    'día de la semana',
    'calculadora temporal',
    'edad exacta',
    'calculadora días'
  ],
  authors: [{ name: 'meskeIA', url: 'https://meskeia.com' }],
  openGraph: {
    type: 'website',
    title: 'Calculadora de Fechas Online | Herramienta Gratuita',
    description: 'Calcula diferencias entre fechas, suma o resta días, determina edades exactas y días de la semana. Herramienta profesional gratuita.',
    url: 'https://meskeia.com/beta/calculadora-fechas',
    siteName: 'meskeIA',
    locale: 'es_ES'
  },
  twitter: {
    card: 'summary',
    title: 'Calculadora de Fechas Online Gratis',
    description: 'Herramienta completa para cálculos con fechas y tiempo'
  },
  alternates: {
    canonical: 'https://meskeia.com/beta/calculadora-fechas'
  },
  robots: {
    index: true,
    follow: true
  }
};
