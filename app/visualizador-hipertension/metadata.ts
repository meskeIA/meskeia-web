import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Hipertensión — Qué le Ocurre al Cuerpo con la Presión Alta | meskeIA',
  description: 'Visualizador educativo de la hipertensión arterial: qué son sistólica y diastólica, etapas ESC/ESH 2018, cómo daña las arterias y órganos diana (corazón, cerebro, riñón, ojos).',
  keywords: 'hipertensión arterial, presión alta, sistólica diastólica, daño arterial, aterosclerosis, órganos diana, ictus hipertensión, retinopatía hipertensiva, nefropatía hipertensiva',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/visualizador-hipertension/' },
  openGraph: {
    type: 'website',
    title: 'Hipertensión — Qué le Ocurre al Cuerpo con la Presión Alta',
    description: 'Mecanismo arterial, etapas ESC/ESH 2018 y daño en órganos diana. Explicador visual educativo.',
    url: 'https://meskeia.com/visualizador-hipertension/',
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
    title: 'Hipertensión — Qué le Ocurre al Cuerpo',
    description: 'El 46% de los hipertensos en España no saben que lo son. Entiende por qué la presión alta daña sin avisar.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Hipertensión meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Hipertensión — Qué le Ocurre al Cuerpo con la Presión Alta',
  description: 'Visualizador educativo interactivo sobre la hipertensión arterial: etapas de presión (clasificación ESC/ESH 2018), mecanismos de daño arterial (tensión mecánica, remodelado, aterosclerosis) y órganos diana.',
  url: 'https://meskeia.com/visualizador-hipertension/',
  category: 'EducationalApplication',
  features: [
    'Clasificación ESC/ESH 2018 por etapas con colores: de óptima a HTA grado 3',
    'Selector de 3 fases de daño arterial: tensión mecánica, remodelado y aterosclerosis',
    'Órganos diana clickables: corazón, cerebro, riñón, ojos y arterias grandes',
    'Factores modificables y no modificables que elevan la presión',
    'Warningbox: el asesino silencioso y estadísticas de diagnóstico en España',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué cifras de tensión arterial se consideran hipertensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según la clasificación ESC/ESH 2018, se considera presión arterial óptima la inferior a 120/80 mmHg. Se habla de hipertensión de grado 1 cuando la presión sistólica está entre 140-159 mmHg o la diastólica entre 90-99 mmHg; grado 2 entre 160-179 / 100-109 mmHg; y grado 3 cuando la sistólica supera los 180 mmHg o la diastólica los 110 mmHg. El diagnóstico requiere mediciones repetidas en condiciones adecuadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la hipertensión se llama "el asesino silencioso"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hipertensión rara vez produce síntomas perceptibles hasta que ya ha causado daño en órganos. La mayoría de personas con presión alta no experimenta dolor de cabeza ni mareos hasta fases muy avanzadas. Esta ausencia de síntomas hace que muchos pacientes no busquen atención médica, lo que permite que el daño vascular progrese durante años. Por eso se la llama "asesino silencioso": actúa de forma invisible hasta que desencadena un infarto, un ictus o una insuficiencia renal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué órganos daña la presión arterial alta a largo plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hipertensión sostenida daña principalmente cuatro órganos diana. En el corazón provoca hipertrofia ventricular izquierda e insuficiencia cardíaca. En el cerebro aumenta el riesgo de ictus isquémico y hemorrágico. En los riñones deteriora los vasos glomerulares, derivando en nefropatía hipertensiva y enfermedad renal crónica. En los ojos daña la retina (retinopatía hipertensiva), pudiendo provocar pérdida de visión. Las arterias grandes también se afectan mediante aterosclerosis acelerada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores de estilo de vida elevan la presión arterial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre los factores modificables que elevan la presión arterial destacan: consumo elevado de sal (más de 5 g/día), exceso de peso corporal (el riesgo aumenta con el índice de masa corporal), sedentarismo, consumo de alcohol, tabaquismo (efecto agudo y crónico sobre la rigidez arterial), estrés crónico y dieta pobre en potasio y magnesio. Reducir la ingesta de sal a menos de 5 g/día puede bajar la presión sistólica entre 2 y 7 mmHg en personas sensibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre presión sistólica y diastólica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La presión sistólica (el número superior de la medición, p. ej. 120 mmHg) es la fuerza que ejerce la sangre sobre las paredes arteriales cuando el corazón se contrae y expulsa sangre. La presión diastólica (el número inferior, p. ej. 80 mmHg) es la presión que queda cuando el corazón está en fase de relajación entre latidos. Ambas cifras son relevantes clínicamente: la sistólica elevada es el predictor más fuerte de riesgo cardiovascular en mayores de 50 años, mientras que la diastólica alta es más indicativa de riesgo en personas jóvenes.',
      },
    },
  ],
};
