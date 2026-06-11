import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Jet Lag - Calcula el Impacto de tu Viaje | meskeIA',
  description: 'Calcula el jet lag de tu próximo viaje internacional. Conoce los días de adaptación necesarios y recibe recomendaciones personalizadas según el cambio horario y la dirección del vuelo.',
  keywords: 'jet lag, calculadora jet lag, cambio horario, adaptación viaje, desfase horario, viaje largo, recuperar jet lag, síntomas jet lag',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Jet Lag | meskeIA',
    description: 'Calcula el impacto del jet lag en tu viaje y recibe consejos para adaptarte más rápido.',
    url: 'https://meskeia.com/orientador-jet-lag/',
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
    title: 'Orientador de Jet Lag | meskeIA',
    description: 'Calcula el impacto del jet lag y recibe recomendaciones de adaptación personalizadas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador de Jet Lag meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador de Jet Lag",
  description: "Calcula el jet lag de tu próximo viaje internacional. Conoce los días de adaptación necesarios y recibe recomendaciones personalizadas según el cambio horario y la dirección del vuelo.",
  url: "https://meskeia.com/orientador-jet-lag/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos días tarda en recuperarse el jet lag?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Como regla general, el organismo necesita aproximadamente un día de adaptación por cada hora de diferencia horaria cruzada. Un vuelo con 8 horas de desfase puede requerir entre 7 y 10 días para una adaptación completa, según la dirección del vuelo (más rápido hacia el oeste, más lento hacia el este) y cada persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es peor el jet lag viajando hacia el este o hacia el oeste?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Viajar hacia el este suele producir un jet lag más intenso porque obliga al cuerpo a adelantar su reloj biológico, lo que resulta más difícil fisiológicamente. Viajar hacia el oeste, en cambio, alarga el día natural del organismo y la adaptación tiende a ser más llevadera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el impacto del jet lag?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cálculo combina el número de zonas horarias cruzadas, la dirección del vuelo (este u oeste) y factores personales como el cronotipo (mañanero o nocturno) y la duración del vuelo. El resultado estima el nivel de afectación y los días estimados de adaptación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué estrategias ayudan a reducir el jet lag antes de volar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Adelantar o retrasar la hora de dormir en 1-2 horas durante los 2-3 días previos al viaje, en la dirección del destino, facilita la adaptación. También ayuda hidratarse bien, evitar el alcohol en el vuelo y exponerse a la luz natural al llegar al destino.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué viajes merece la pena planificar el jet lag?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La planificación es especialmente útil cuando el viaje supera 5 zonas horarias o cuando los primeros días en el destino son laborales o de alta exigencia (reuniones, competiciones, eventos). En viajes cortos de turismo con menos de 4 horas de diferencia el impacto suele ser tolerable sin intervención específica.',
      },
    },
  ],
};
