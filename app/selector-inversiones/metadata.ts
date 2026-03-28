import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Inversiones — ¿Fondos indexados, acciones, renta fija o inmobiliario? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de inversión se adapta mejor a tu perfil: fondos indexados, acciones directas, renta fija, inversión inmobiliaria o plan de pensiones/PPI. Análisis según horizonte, riesgo y conocimiento.',
  keywords: ['qué inversión elegir', 'fondos indexados o acciones', 'renta fija o variable', 'invertir en inmobiliario', 'perfil inversor España', 'inversión para principiantes', 'dónde invertir ahorros', 'plan de pensiones vs fondos', 'inversión a largo plazo', 'cartera de inversión España'],
  openGraph: {
    title: '¿Fondos indexados, acciones o inmobiliario? Test de inversión | meskeIA',
    description: 'Descubre qué tipo de inversión se adapta mejor a tu perfil de riesgo, horizonte y conocimiento financiero.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-inversiones/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Dónde invertir? Test de perfil inversor | meskeIA',
    description: 'Test de 10 preguntas para elegir entre fondos indexados, acciones, renta fija, inmobiliario o pensiones.',
  },
  alternates: { canonical: 'https://meskeia.com/selector-inversiones/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Tipo de Inversión',
      description: 'Test orientativo para saber qué vehículo de inversión (fondos indexados, acciones, renta fija, inmobiliario o PPI) se adapta mejor al perfil de riesgo y objetivos.',
      url: 'https://meskeia.com/selector-inversiones/',
      features: [
        'Test de 10 preguntas sobre perfil inversor',
        '5 opciones: fondos indexados, acciones directas, renta fija, inmobiliario, pensiones/PPI',
        'Análisis de horizonte, riesgo y conocimiento',
        'Orientación sin mencionar productos concretos',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};
