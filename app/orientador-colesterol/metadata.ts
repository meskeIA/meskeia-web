import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Colesterol - Ratios y Riesgo Cardiovascular | meskeIA',
  description: 'Analiza tus niveles de colesterol: ratio CT/HDL, LDL/HDL, colesterol no-HDL y fórmula de Friedewald. Interpretación de resultados y recomendaciones. 100% gratis y privado.',
  keywords: 'colesterol, HDL, LDL, triglicéridos, ratio colesterol, riesgo cardiovascular, friedewald, colesterol bueno, colesterol malo, calculadora salud',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Colesterol | meskeIA',
    description: 'Analiza tus niveles de colesterol: ratios, riesgo cardiovascular y recomendaciones personalizadas.',
    url: 'https://meskeia.com/orientador-colesterol/',
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
    title: 'Orientador Colesterol | meskeIA',
    description: 'Analiza tus niveles de colesterol: ratios, riesgo cardiovascular y recomendaciones personalizadas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Colesterol meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Colesterol",
  description: "Analiza tus niveles de colesterol: ratio CT/HDL, LDL/HDL, colesterol no-HDL y fórmula de Friedewald. Interpretación de resultados y recomendaciones. 100% gratis y privado.",
  url: "https://meskeia.com/orientador-colesterol/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el ratio CT/HDL y por qué es importante para el riesgo cardiovascular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ratio CT/HDL divide el colesterol total entre el colesterol HDL (el "bueno"). Un valor por encima de 5 indica mayor riesgo cardiovascular, mientras que un valor por debajo de 3,5 se considera óptimo. Este ratio es uno de los indicadores más fiables para estimar el riesgo de infarto o ictus a medio plazo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál debe ser el nivel normal de colesterol LDL en sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las guías europeas de cardiología recomiendan un LDL por debajo de 100 mg/dL para la población general, y por debajo de 70 mg/dL en personas con riesgo cardiovascular alto o muy alto. Valores superiores a 160 mg/dL se consideran elevados y requieren atención médica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve la fórmula de Friedewald en el análisis de colesterol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula de Friedewald calcula el colesterol LDL de forma indirecta a partir del colesterol total, el HDL y los triglicéridos: LDL = CT − HDL − (TG / 5). Es la estimación más utilizada en laboratorios clínicos cuando los triglicéridos son inferiores a 400 mg/dL, ya que resulta menos costosa que la medición directa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el colesterol no-HDL y el LDL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El colesterol no-HDL incluye el LDL más otras partículas aterogénicas como el VLDL y el IDL; se calcula restando el HDL al colesterol total. Algunos cardiólogos lo consideran más predictivo que el LDL solo porque captura un espectro más amplio de partículas que dañan las arterias. Un nivel óptimo de no-HDL es inferior a 130 mg/dL en población general.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo mejorar mis niveles de colesterol solo con dieta y ejercicio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En muchos casos sí: reducir grasas saturadas y trans, aumentar fibra soluble (avena, legumbres) y hacer ejercicio aeróbico regular puede bajar el LDL entre un 10 y un 20 % y elevar el HDL. Sin embargo, factores genéticos como la hipercolesterolemia familiar pueden requerir medicación independientemente del estilo de vida. Consulta siempre con un médico antes de tomar decisiones terapéuticas.',
      },
    },
  ],
};
