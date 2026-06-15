import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Envejece tu Cuerpo - Explicador Visual por Décadas | meskeIA',
  description: 'Visualiza qué cambia en tu cuerpo década a década: metabolismo, masa muscular, densidad ósea, capacidad cardíaca y más. Explicador interactivo con datos científicos.',
  keywords: 'envejecimiento cuerpo, metabolismo edad, masa muscular edad, densidad ósea, capacidad cardíaca, salud por décadas, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Envejece tu Cuerpo - Por Décadas',
    description: 'Qué cambia en tu metabolismo, músculos, huesos y corazón con cada década. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-envejecimiento-cuerpo/',
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
    title: 'Cómo Envejece tu Cuerpo',
    description: 'Visualiza el envejecimiento década a década con datos científicos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Envejecimiento Cuerpo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Envejece tu Cuerpo',
  description: 'Explicador visual interactivo del envejecimiento humano. Década a década: metabolismo, masa muscular, densidad ósea, capacidad cardiovascular, vista, oído y recuperación.',
  url: 'https://meskeia.com/visualizador-envejecimiento-cuerpo/',
  features: [
    'Visualización por décadas del envejecimiento corporal',
    '7 indicadores fisiológicos con barras animadas',
    'Explicación de cada cambio y consejos preventivos',
    'Gráfico de evolución de capacidades a lo largo de la vida',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué cambios físicos ocurren en el cuerpo con la edad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con cada década el cuerpo experimenta cambios acumulativos: el metabolismo basal desciende aproximadamente un 2-3 % por década a partir de los 30 años, la masa muscular puede reducirse un 3-8 % por década (sarcopenia), la densidad ósea disminuye —especialmente en mujeres tras la menopausia— y la capacidad cardíaca máxima baja alrededor de 1 % al año. La visión y el oído también pierden agudeza de forma gradual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué edad empieza a declinar el metabolismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El gasto metabólico basal comienza a reducirse de forma perceptible alrededor de los 30 años. Entre los 30 y los 60 años el descenso es gradual (2-3 % por década); a partir de los 60 puede acelerarse si no se mantiene actividad física y masa muscular. La pérdida de músculo es el factor principal, ya que el tejido muscular consume más energía en reposo que el tejido graso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede frenar el envejecimiento corporal con ejercicio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ejercicio de fuerza y el ejercicio aeróbico son las intervenciones con mayor evidencia científica para ralentizar el declive fisiológico. El entrenamiento de resistencia puede preservar o incluso aumentar la masa muscular en adultos mayores, mejorar la densidad ósea y mantener la capacidad cardiovascular. No detiene el envejecimiento, pero reduce significativamente su impacto funcional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo pierde el cuerpo más densidad ósea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La densidad ósea alcanza su pico máximo alrededor de los 25-30 años y luego desciende lentamente. En mujeres, la caída se acelera durante la menopausia debido al descenso de estrógenos, pudiendo perderse hasta un 20 % de masa ósea en los primeros 5-7 años. En hombres el proceso es más gradual. La vitamina D, el calcio y el ejercicio de impacto ayudan a preservar el hueso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un visualizador del envejecimiento corporal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para cualquier persona que quiera entender los cambios fisiológicos que ocurren con la edad: adultos que buscan planificar hábitos preventivos, estudiantes de ciencias de la salud, educadores que enseñan biología humana y profesionales sanitarios que necesitan explicar a sus pacientes qué esperar en cada etapa de la vida.',
      },
    },
  ],
};
