import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Inferencia Bayesiana | meskeIA',
  description: 'Aplica el teorema de Bayes paso a paso. Calcula probabilidades posteriores, actualiza creencias con evidencia y visualiza el proceso de inferencia bayesiana.',
  keywords: 'teorema de bayes, inferencia bayesiana, probabilidad posterior, prior, likelihood, verosimilitud, estadística bayesiana, probabilidad condicional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Inferencia Bayesiana | meskeIA',
    description: 'Aplica el teorema de Bayes paso a paso. Calcula probabilidades posteriores con prior, likelihood y evidencia.',
    url: 'https://meskeia.com/inferencia-bayesiana/',
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
    title: 'Calculadora de Inferencia Bayesiana',
    description: 'Teorema de Bayes explicado paso a paso con ejemplos prácticos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Inferencia Bayesiana",
  description: "Aplica el teorema de Bayes paso a paso. Calcula probabilidades posteriores, actualiza creencias con evidencia y visualiza el proceso de inferencia bayesiana.",
  url: 'https://meskeia.com/inferencia-bayesiana/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
