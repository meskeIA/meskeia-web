import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuánto Pesa una Decisión - Impacto Acumulado a 10 Años | meskeIA',
  description: 'Visualiza el impacto acumulado de decisiones cotidianas a 10 años: dejar de fumar, caminar 30 min/día, ahorrar 5 €/día, dormir 1h más. Efecto multiplicador.',
  keywords: 'impacto decisiones, efecto acumulado, hábitos largo plazo, dejar fumar ahorro, caminar salud, decisiones cotidianas, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cuánto Pesa una Decisión',
    description: 'El impacto acumulado de decisiones cotidianas. Pequeños cambios, grandes resultados.',
    url: 'https://meskeia.com/visualizador-peso-decisiones',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuánto Pesa una Decisión',
    description: 'Pequeñas decisiones diarias con impacto enorme a 10 años.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Peso Decisiones meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuánto Pesa una Decisión',
  description: 'Explicador visual del impacto acumulado de decisiones cotidianas proyectadas a 1, 5 y 10 años: salud, dinero, tiempo y bienestar. Cada decisión con su efecto multiplicador.',
  url: 'https://meskeia.com/visualizador-peso-decisiones/',
  features: [
    '10 decisiones cotidianas con impacto a largo plazo',
    'Proyección a 1, 5 y 10 años',
    'Categorías: salud, dinero, tiempo, bienestar',
    'Efecto acumulado visualizado con barras',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
