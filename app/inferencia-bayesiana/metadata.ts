import { Metadata } from 'next';

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
    url: 'https://meskeia.com/inferencia-bayesiana',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Inferencia Bayesiana',
    description: 'Teorema de Bayes explicado paso a paso con ejemplos prácticos.',
  },
};
