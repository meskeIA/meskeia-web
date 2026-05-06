import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Vivienda — ¿Piso, casa, ático o estudio? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de vivienda se adapta mejor a tu situación: piso estándar, casa unifamiliar, ático/dúplex, estudio/apartamento o piso compartido. Análisis según familia, presupuesto y estilo de vida.',
  keywords: ['qué tipo de vivienda comprar', 'piso o casa unifamiliar', 'ático o piso estándar', 'estudio o piso', 'vivienda para familia España', 'piso compartido o propio', 'casa con jardín o piso', 'tipo de vivienda según presupuesto', 'dónde vivir con hijos España', 'comprar o alquilar qué tipo'],
  openGraph: {
    title: '¿Piso, casa o ático? Test de tipo de vivienda | meskeIA',
    description: 'Descubre qué tipo de vivienda se adapta mejor a tu familia, presupuesto y estilo de vida con este test de 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-tipo-vivienda/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Piso, casa o ático? Test de vivienda | meskeIA',
    description: 'Test de 10 preguntas para elegir entre piso, casa unifamiliar, ático, estudio o piso compartido.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-tipo-vivienda/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Tipo de Vivienda',
      description: 'Test orientativo para saber qué tipo de vivienda (piso, casa unifamiliar, ático/dúplex, estudio o compartido) se adapta mejor al perfil familiar, presupuesto y estilo de vida.',
      url: 'https://meskeia.com/selector-tipo-vivienda/',
      features: [
        'Test de 10 preguntas sobre familia y estilo de vida',
        '5 tipos: piso estándar, casa unifamiliar, ático/dúplex, estudio, compartido',
        'Análisis de presupuesto, tamaño familiar y preferencias',
        'Orientación sobre ventajas e inconvenientes',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};
