import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Piensa tu Cerebro - Neuronas, Memoria y Neuroplasticidad | meskeIA',
  description: 'Entiende cómo funciona tu cerebro: 86.000 millones de neuronas, formación de recuerdos, neuroplasticidad y las ilusiones que te engañan. Explicador visual interactivo.',
  keywords: 'cerebro, neuronas, sinapsis, memoria, neuroplasticidad, ilusiones ópticas, lóbulos cerebrales, recuerdos, Müller-Lyer, memoria de trabajo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Piensa tu Cerebro - Neuronas, Memoria y Neuroplasticidad',
    description: 'Tu cerebro explicado visualmente: neuronas, memoria, neuroplasticidad e ilusiones cognitivas.',
    url: 'https://meskeia.com/visualizador-cerebro/',
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
    title: 'Cómo Piensa tu Cerebro - Explicador Visual',
    description: '86.000 millones de neuronas, 150 billones de sinapsis. Así funciona la máquina más compleja del universo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Cerebro meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Piensa tu Cerebro - Neuronas, Memoria y Neuroplasticidad',
  description: 'Explicador visual interactivo sobre el cerebro humano: regiones cerebrales, formación de recuerdos, neuroplasticidad con casos reales, e ilusiones cognitivas con demos CSS interactivas.',
  url: 'https://meskeia.com/visualizador-cerebro/',
  category: 'EducationalApplication',
  features: [
    'Regiones cerebrales clickables con funciones de cada lóbulo',
    'Diagrama de formación de recuerdos: codificación, almacenamiento y recuperación',
    'Casos reales de neuroplasticidad: taxistas de Londres, músicos, recuperación tras ictus',
    'Ilusiones cognitivas interactivas con demos CSS',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas neuronas tiene el cerebro humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cerebro humano contiene aproximadamente 86.000 millones de neuronas, según estudios de recuento directo realizados por el neurocientífico Suzana Herculano-Houzel. Cada neurona puede conectarse con otras 10.000, lo que genera unos 150 billones de sinapsis en total. Esta red es responsable de todas las funciones cognitivas, emocionales y motoras del organismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hace cada lóbulo del cerebro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El lóbulo frontal controla el razonamiento, la planificación, el lenguaje y el movimiento voluntario. El lóbulo parietal procesa información sensorial táctil y espacial. El lóbulo temporal gestiona la audición, la memoria y el reconocimiento de objetos. El lóbulo occipital se encarga del procesamiento visual. Aunque cada región tiene funciones predominantes, casi todas las tareas cognitivas complejas implican la colaboración de múltiples lóbulos al mismo tiempo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la neuroplasticidad y puede cambiar el cerebro adulto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La neuroplasticidad es la capacidad del cerebro para reorganizar sus conexiones en respuesta a la experiencia, el aprendizaje o lesiones. Los estudios de London Knowledge (taxistas de Londres) mostraron que el hipocampo posterior era significativamente mayor en conductores experimentados, en comparación con la población general. El cerebro adulto mantiene esta capacidad de reorganización, aunque de forma más gradual que en la infancia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se forman y almacenan los recuerdos en el cerebro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La formación de un recuerdo pasa por tres fases: codificación (la información sensorial se convierte en señales eléctricas y químicas), consolidación (el hipocampo y la corteza trabajan juntos para estabilizar el recuerdo durante horas o días) y recuperación (la red neuronal asociada se activa para reconstruir el recuerdo). Los recuerdos no se almacenan en un único lugar, sino distribuidos en patrones de conexiones sinápticas que se reactivan al recordar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las ilusiones ópticas engañan al cerebro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las ilusiones ópticas revelan que el cerebro no procesa la realidad directamente, sino que construye interpretaciones basadas en reglas heurísticas que funcionan bien en la mayoría de situaciones. Ilusiones clásicas como Müller-Lyer (dos líneas iguales que parecen distintas) explotan los mecanismos de estimación de profundidad y tamaño. El cerebro aplica atajos evolutivamente útiles que, en contextos artificiales, producen percepciones erróneas incluso cuando ya conoces el truco.',
      },
    },
  ],
};
