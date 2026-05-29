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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ratio de Sharpe y para qué sirve en inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ratio de Sharpe mide la rentabilidad extra que obtiene un fondo o cartera por cada unidad de riesgo asumido, comparando su retorno con el activo libre de riesgo. Se calcula como (Rentabilidad − Tasa libre de riesgo) / Volatilidad. Un ratio superior a 1 se considera bueno; por encima de 2, excelente. Permite comparar fondos con distintos niveles de riesgo en igualdad de condiciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la beta de una acción o fondo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La beta mide la sensibilidad de un activo respecto al mercado de referencia. Una beta de 1 significa que se mueve igual que el mercado; beta > 1 indica mayor volatilidad (mayor riesgo y potencial retorno); beta < 1 implica menor oscilación. Una beta negativa significa que el activo suele moverse en sentido contrario al mercado, lo que puede ser útil para diversificar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre gestión activa y gestión pasiva en fondos de inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La gestión activa implica que un equipo de analistas selecciona valores intentando batir a un índice de referencia, con comisiones (TER) habitualmente superiores al 1%. La gestión pasiva replica un índice mediante fondos indexados o ETF, con TER frecuentemente inferior al 0,2%. Estudios a largo plazo muestran que la mayoría de fondos activos no superan a su índice de referencia después de comisiones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel de inversor está pensado este quiz de inversión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El quiz está diseñado para inversores con experiencia básica-intermedia: personas que ya han invertido en fondos o ETF y quieren profundizar en conceptos como duration, TER, rebalanceo o valoración por múltiplos. No es apto para principiantes absolutos, pero tampoco requiere ser analista financiero. Las 25 preguntas incluyen explicaciones detalladas tras cada respuesta para aprender durante el propio test.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la duration de un bono y por qué importa cuando suben los tipos de interés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La duration mide la sensibilidad del precio de un bono ante cambios en los tipos de interés, expresada en años. Si la duration es 7, un alza de 1 punto porcentual en los tipos reduce el precio del bono aproximadamente un 7%. Bonos con duration alta son más volátiles ante cambios en tipos; los de duration corta son más estables. Por eso, cuando suben los tipos, los fondos de renta fija a largo plazo sufren más pérdidas.',
      },
    },
  ],
};
