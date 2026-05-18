import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Conceptos de Inversión — Sharpe, Beta, Duration y TER | meskeIA',
  description:
    'Pon a prueba tus conocimientos de inversión con 25 preguntas intermedias: ratio de Sharpe, beta, duration de bonos, TER de fondos, rebalanceo y valoración. Con explicaciones detalladas.',
  keywords:
    'quiz inversión, ratio sharpe, beta acción, duration bonos, TER fondos, rebalanceo cartera, gestión activa pasiva, PER valoración, conceptos inversión avanzados',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Conceptos de Inversión — Sharpe, Beta, Duration y TER',
    description:
      '25 preguntas de nivel intermedio sobre inversión: riesgo-rentabilidad, renta fija, fondos, estrategia de cartera y valoración. ¿Estás listo para el siguiente nivel?',
    url: 'https://meskeia.com/quiz-conceptos-inversion',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz Conceptos de Inversión | meskeIA',
    description:
      'Sharpe, beta, duration, TER, rebalanceo y más. 25 preguntas con explicaciones detalladas.',
  },
  other: {
    'application-name': 'Quiz Conceptos Inversión meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Quiz Conceptos de Inversión',
  description:
    'Quiz de nivel intermedio sobre inversión: 25 preguntas en 5 categorías (riesgo-rentabilidad, renta fija, fondos/ETF, estrategia de cartera y valoración). Con explicaciones detalladas tras cada respuesta. Para inversores que quieren entender mejor lo que hacen.',
  url: 'https://meskeia.com/quiz-conceptos-inversion/',
  features: [
    '25 preguntas en 5 categorías: riesgo, renta fija, fondos, cartera y valoración',
    'Ratio de Sharpe, beta, duration, TER, rebalanceo y múltiplos de valoración',
    'Modo examen completo y práctica por categoría',
    'Explicaciones técnicas detalladas con contexto práctico tras cada respuesta',
    'Nivel de partida: alguien que ya invierte en fondos y quiere entender más',
    'Gratuito, sin registro, en español',
  ],
});
