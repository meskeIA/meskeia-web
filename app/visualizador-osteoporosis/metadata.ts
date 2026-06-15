import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Osteoporosis — El Ciclo de Remodelado Óseo | meskeIA',
  description: 'Visualizador educativo del remodelado óseo: osteoblastos vs osteoclastos, las 4 fases del ciclo, evolución de la densidad ósea con la edad, factores de riesgo modificables y no modificables.',
  keywords: 'osteoporosis, remodelado óseo, osteoblastos, osteoclastos, densidad ósea, calcio, vitamina D, menopausia huesos, masa ósea, fractura osteoporótica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Osteoporosis — El Ciclo de Remodelado Óseo',
    description: 'El hueso que se renueva constantemente: osteoblastos, osteoclastos, densidad ósea y factores de riesgo. Visualizador educativo interactivo.',
    url: 'https://meskeia.com/visualizador-osteoporosis/',
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
    title: 'Osteoporosis — El Ciclo de Remodelado Óseo',
    description: 'El hueso pierde densidad en silencio. Entiende cómo y por qué con este explicador visual interactivo.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-osteoporosis/' },
  other: { 'application-name': 'Osteoporosis Visualizador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Osteoporosis — El Hueso que se Renueva',
  description: 'Visualizador educativo del ciclo de remodelado óseo: las 4 fases (activación, resorción, transición, formación), balance osteoblastos vs osteoclastos, evolución de la densidad ósea por edad y sexo, y factores de riesgo modificables y no modificables.',
  url: 'https://meskeia.com/visualizador-osteoporosis/',
  category: 'EducationalApplication',
  features: [
    'Las 4 fases del ciclo de remodelado óseo con stepper interactivo',
    'Balance osteoblastos vs osteoclastos en 3 etapas de la vida',
    'Factores de riesgo modificables y no modificables',
    'Curva de densidad ósea femenina vs masculina',
    'Umbrales de osteopenia y osteoporosis explicados',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la osteoporosis y por qué se produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La osteoporosis es una enfermedad en la que los huesos pierden densidad y resistencia, volviéndose más frágiles y propensos a fracturas. Se produce cuando el ciclo de remodelado óseo se desequilibra: los osteoclastos (células que destruyen hueso) trabajan más rápido de lo que los osteoblastos (células que forman hueso) pueden regenerar. Este desequilibrio se acentúa con la edad, especialmente en mujeres tras la menopausia, cuando la caída de estrógenos acelera la pérdida ósea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las 4 fases del ciclo de remodelado óseo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El remodelado óseo ocurre de forma continua en todo el esqueleto y consta de cuatro fases: activación (señales hormonales y mecánicas reclutan osteoclastos), resorción (los osteoclastos disuelven la matriz ósea vieja creando una laguna), transición o inversión (las células de revestimiento preparan la superficie para la nueva formación) y formación (los osteoblastos depositan colágeno y minerales para crear hueso nuevo). En adultos jóvenes sanos, este ciclo dura entre 3 y 6 meses y está perfectamente equilibrado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se alcanza el pico de masa ósea y cómo evoluciona con la edad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La masa ósea máxima —también llamada pico de masa ósea— se alcanza entre los 25 y los 30 años. A partir de los 35-40 años comienza una pérdida gradual de aproximadamente el 0,5-1% anual. En mujeres, la menopausia acelera esta pérdida hasta un 2-3% anual durante los primeros 5-7 años. Por eso el diagnóstico de osteoporosis es más frecuente en mujeres mayores de 65 años, aunque los hombres también la desarrollan, generalmente a partir de los 70.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores de riesgo de osteoporosis son modificables?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre los factores modificables destacan: la ingesta insuficiente de calcio (los adultos necesitan 1.000-1.200 mg/día) y vitamina D (que facilita su absorción), el sedentarismo (el ejercicio de carga estimula la formación ósea), el tabaquismo, el consumo elevado de alcohol y la desnutrición o bajo peso corporal. Actuar sobre ellos desde joven protege la masa ósea; hacerlo en la madurez ralentiza su pérdida. Los factores no modificables incluyen sexo femenino, edad avanzada, menopausia precoz y antecedentes familiares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre osteopenia y osteoporosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas se miden con la densitometría ósea, que calcula la puntuación T (T-score), la desviación respecto a la densidad ósea media de un adulto joven sano. Una T-score entre −1 y −2,5 indica osteopenia (densidad por debajo de lo normal pero sin llegar al umbral de enfermedad). Una T-score igual o inferior a −2,5 confirma osteoporosis. La osteopenia no es una enfermedad en sí misma, sino una señal de alerta que invita a reforzar hábitos y, en algunos casos, iniciar tratamiento preventivo.',
      },
    },
  ],
};
