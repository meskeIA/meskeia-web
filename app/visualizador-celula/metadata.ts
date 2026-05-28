import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Célula por Dentro - Animal vs Vegetal | meskeIA',
  description: 'Explora la célula animal y vegetal por dentro: orgánulos clickables, comparativa visual y datos fascinantes. Explicador visual interactivo de biología.',
  keywords: 'célula animal, célula vegetal, orgánulos, mitocondria, núcleo, cloroplasto, biología visual, anatomía celular, membrana, ribosomas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Célula por Dentro - Animal vs Vegetal',
    description: 'Orgánulos clickables, comparativa visual y datos fascinantes sobre las células.',
    url: 'https://meskeia.com/visualizador-celula/',
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
    title: 'La Célula por Dentro - Explicador Visual',
    description: '37,2 billones de células en tu cuerpo. ¿Sabes qué hay dentro de cada una?',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Célula Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Célula por Dentro - Animal vs Vegetal',
  description: 'Explicador visual interactivo sobre la célula: anatomía de célula animal y vegetal con orgánulos clickables, comparativa lado a lado y datos fascinantes de biología celular.',
  url: 'https://meskeia.com/visualizador-celula/',
  category: 'EducationalApplication',
  features: [
    'Célula animal con orgánulos clickables',
    'Célula vegetal con diferencias resaltadas',
    'Comparativa visual animal vs vegetal',
    'Datos fascinantes: billones de células, ADN de 2 metros',
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
      name: '¿Cuál es la diferencia entre la célula animal y la célula vegetal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las células vegetales tienen tres estructuras exclusivas que las animales no poseen: pared celular rígida de celulosa, cloroplastos (donde ocurre la fotosíntesis) y vacuola central grande que ocupa hasta el 90% del volumen celular. Las células animales, en cambio, tienen centriolos (ausentes en la mayoría de vegetales) y carecen de pared celular, lo que les da mayor flexibilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué función tiene la mitocondria en la célula?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La mitocondria es el orgánulo encargado de producir energía celular en forma de ATP (adenosín trifosfato) mediante la respiración celular aeróbica. Utiliza glucosa y oxígeno para liberar energía que alimenta todas las funciones de la célula. Las células con alta demanda energética, como las musculares o las neuronas, pueden tener miles de mitocondrias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas células tiene el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cuerpo humano contiene aproximadamente 37,2 billones de células (3,72 × 10¹³), según la estimación publicada en Annals of Human Biology en 2013. No todas son iguales: existen más de 200 tipos celulares distintos, desde los glóbulos rojos (los más numerosos) hasta las neuronas. Además, en nuestro organismo coexisten bacterias que superan en número a las células humanas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el núcleo celular y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El núcleo es el centro de control de la célula: contiene el ADN con toda la información genética organizada en cromosomas. Coordina la síntesis de proteínas enviando instrucciones al ribosoma a través del ARN mensajero. El ADN de una sola célula humana mide aproximadamente 2 metros si se extiende completamente, aunque está compactado en un núcleo de apenas 6 micrómetros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre célula procariota y eucariota?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las células procariotas (bacterias y arqueas) carecen de núcleo definido: su material genético flota libre en el citoplasma y no tienen orgánulos con membrana. Las células eucariotas (animales, vegetales, hongos y protistas) sí poseen núcleo rodeado de membrana nuclear y orgánulos especializados como mitocondrias, retículo endoplasmático y aparato de Golgi. Las células animales y vegetales son eucariotas.',
      },
    },
  ],
};
