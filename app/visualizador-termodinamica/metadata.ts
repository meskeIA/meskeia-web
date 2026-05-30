import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Transferencia de Calor - Conducción, Convección y Radiación | meskeIA',
  description: 'Explora las 3 formas de transferencia de calor con animaciones interactivas: conducción, convección y radiación. Conductividad térmica y convección en la naturaleza.',
  keywords: 'transferencia de calor, conducción, convección, radiación, termodinámica, conductividad térmica, aislamiento, brisa marina, efecto invernadero',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Transferencia de Calor - Conducción, Convección y Radiación',
    description: 'Las 3 formas de transferir calor explicadas visualmente con animaciones de partículas, corrientes y ondas.',
    url: 'https://meskeia.com/visualizador-termodinamica/',
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
    title: 'Transferencia de Calor - Explicador Visual',
    description: 'Conducción, convección y radiación: cómo se mueve el calor, con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Termodinámica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Transferencia de Calor - Conducción, Convección y Radiación',
  description: 'Explicador visual interactivo sobre las 3 formas de transferencia de calor: conducción, convección y radiación. Incluye conductividad térmica de materiales, convección en la naturaleza y datos fascinantes.',
  url: 'https://meskeia.com/visualizador-termodinamica/',
  category: 'EducationalApplication',
  features: [
    '3 formas de transferencia de calor con animaciones interactivas',
    'Tabla de conductividad térmica con barras proporcionales',
    'Convección en la naturaleza: brisa marina, corrientes oceánicas, meteorología',
    'Datos fascinantes sobre termodinámica cotidiana',
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
      name: '¿Cuál es la diferencia entre conducción, convección y radiación térmica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La conducción transfiere calor por contacto directo entre partículas: un metal caliente calienta tu mano. La convección mueve calor a través de un fluido en movimiento, como las corrientes de aire que forman la brisa marina. La radiación emite energía en forma de ondas electromagnéticas sin necesitar materia, como el calor que llega del Sol a través del vacío del espacio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué material es mejor conductor térmico, el cobre o el hierro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cobre es mucho mejor conductor térmico que el hierro: su conductividad es de unos 390 W/(m·K), frente a los 80 W/(m·K) del hierro. Por eso se usa cobre en radiadores y disipadores de calor. El diamante supera a ambos con ~2000 W/(m·K), mientras que materiales aislantes como la lana de roca apenas alcanzan 0,04 W/(m·K).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el efecto invernadero en términos de transferencia de calor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sol emite radiación de onda corta que atraviesa la atmósfera y calienta la superficie terrestre. La Tierra reemite esa energía como radiación infrarroja de onda larga. Los gases de efecto invernadero (CO₂, vapor de agua) absorben parte de esa radiación y la reemiten en todas direcciones, incluida la superficie, lo que aumenta la temperatura media del planeta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el mar está más frío que la arena en verano si reciben el mismo sol?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El agua tiene una capacidad calorífica específica mucho mayor que la arena: necesita absorber unas cuatro veces más energía para subir un grado de temperatura. Además, la convección mezcla el agua caliente de la superficie con agua más fría del fondo. La arena se calienta y enfría rápido; el mar actúa como un gran almacén térmico que estabiliza la temperatura.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer la termodinámica en la vida cotidiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entender la transferencia de calor ayuda a elegir materiales de aislamiento en viviendas, diseñar ropa adecuada para cada clima, cocinar de forma eficiente y comprender fenómenos meteorológicos. En ingeniería, es la base del diseño de motores, refrigeradores, paneles solares y sistemas de calefacción.',
      },
    },
  ],
};
