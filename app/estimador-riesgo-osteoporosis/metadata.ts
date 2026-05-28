import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Riesgo de Osteoporosis - Test de factores validados | meskeIA',
  description: 'Test de 12 preguntas basado en factores de riesgo validados (FRAX e IOF) para estimar el riesgo de osteoporosis y recibir recomendaciones preventivas personalizadas.',
  keywords: 'riesgo osteoporosis, test osteoporosis, frax osteoporosis, fractura osea riesgo, prevencion osteoporosis, osteoporosis factores riesgo, test iof osteoporosis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Riesgo de Osteoporosis | meskeIA',
    description: 'Test de factores de riesgo validados para osteoporosis con recomendaciones preventivas.',
    url: 'https://meskeia.com/estimador-riesgo-osteoporosis/',
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
    title: 'Estimador de Riesgo de Osteoporosis | meskeIA',
    description: 'Test validado de riesgo de osteoporosis y recomendaciones preventivas',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Riesgo Osteoporosis meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Riesgo de Osteoporosis",
  description: "Test de 12 preguntas basado en factores de riesgo validados (FRAX e IOF) para estimar el riesgo de osteoporosis y recibir recomendaciones preventivas personalizadas.",
  url: "https://meskeia.com/estimador-riesgo-osteoporosis/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la osteoporosis y cuáles son sus principales factores de riesgo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La osteoporosis es una enfermedad que reduce la densidad y resistencia ósea, aumentando el riesgo de fracturas. Los principales factores de riesgo incluyen el sexo femenino, la edad avanzada, antecedentes familiares de fracturas, bajo peso corporal, tabaquismo, consumo elevado de alcohol, uso prolongado de corticoides y déficit de calcio o vitamina D. Se estima que afecta a más del 30% de las mujeres mayores de 50 años en España.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la herramienta FRAX para calcular el riesgo de osteoporosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FRAX (Fracture Risk Assessment Tool) es un algoritmo desarrollado por la OMS que estima la probabilidad a 10 años de sufrir una fractura osteoporótica mayor (cadera, columna, muñeca u hombro). Combina factores clínicos como edad, índice de masa corporal, antecedentes personales y familiares, y hábitos de vida. No requiere densitometría ósea para obtener una estimación inicial del riesgo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un test de riesgo de osteoporosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para mujeres mayores de 45-50 años, personas con antecedentes familiares de fractura de cadera, individuos con bajo peso o que hayan sufrido fracturas por traumatismos menores, y quienes toman corticoides de manera prolongada. También ayuda a personas que desconocen su nivel de riesgo a decidir si deben consultar con su médico sobre una densitometría.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un test de riesgo de osteoporosis y una densitometría ósea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La densitometría ósea (DXA) mide directamente la densidad mineral del hueso y proporciona el valor T-score, que es el diagnóstico clínico definitivo de osteoporosis u osteopenia. Un test de factores de riesgo, como el basado en FRAX o los criterios IOF, estima la probabilidad de fractura a partir de variables clínicas sin necesidad de prueba de imagen. El test es una herramienta de cribado orientativa; la densitometría confirma el diagnóstico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede prevenir la osteoporosis y cómo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, existe evidencia sólida de que la osteoporosis se puede prevenir o retrasar con medidas de estilo de vida. Las más eficaces son mantener una ingesta adecuada de calcio (1.000-1.200 mg/día en adultos mayores) y vitamina D, realizar ejercicio de carga y resistencia regularmente, evitar el tabaco y el consumo excesivo de alcohol, y prevenir las caídas en personas mayores. En algunos casos, el médico puede indicar tratamiento farmacológico preventivo.',
      },
    },
  ],
};
