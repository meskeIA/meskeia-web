import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Tarjetas de Comunicación - Pictogramas Personalizados | meskeIA',
  description: 'Crea e imprime tarjetas de comunicación personalizadas con pictogramas emoji y texto. Para autismo, AAC, logopedia y comunicación aumentativa. Sin instalación, funciona sin conexión.',
  keywords: 'tarjetas comunicacion, pictogramas imprimir, tarjetas AAC, comunicacion aumentativa, tarjetas autismo, pictogramas personalizados, PECS tarjetas, logopedia materiales, tarjetas pictogramas imprimir',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Tarjetas de Comunicación | meskeIA',
    description: 'Crea e imprime tarjetas de comunicación con pictogramas emoji personalizados. Para autismo, AAC y logopedia.',
    url: 'https://meskeia.com/generador-tarjetas-comunicacion/',
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
    title: 'Generador de Tarjetas de Comunicación | meskeIA',
    description: 'Crea e imprime tarjetas pictográficas para comunicación aumentativa. Gratis, sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Tarjetas de Comunicación - Pictogramas Personalizados',
  description: 'Crea e imprime tarjetas de comunicación personalizadas con pictogramas emoji y texto. Para autismo, AAC, logopedia y comunicación aumentativa.',
  url: 'https://meskeia.com/generador-tarjetas-comunicacion/',
  category: 'UtilityApplication',
  features: [
    'Tarjetas personalizables con emoji como pictograma y texto propio',
    'Tamaños de tarjeta configurables',
    'Vista previa antes de imprimir',
    'Impresión directa desde el navegador',
    'Datos almacenados solo en el dispositivo: ninguna tarjeta sale del navegador',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las tarjetas de comunicación y para qué se usan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las tarjetas de comunicación son tarjetas físicas o digitales que combinan una imagen (pictograma o foto) con texto escrito para representar palabras, acciones, emociones o necesidades. Se usan en comunicación aumentativa y alternativa (AAC) para personas no verbales o con habla limitada, en logopedia para apoyar el aprendizaje del vocabulario, en el aula con personas con TEA o discapacidad intelectual, y en entornos sanitarios para comunicarse con pacientes sin habla. También sirven como soporte visual en intervenciones conductuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo hacer tarjetas de comunicación en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con el generador de tarjetas de meskeIA: 1) Elige un emoji que represente la palabra o concepto. 2) Escribe el texto que quieres que aparezca en la tarjeta. 3) Selecciona el tamaño (pequeño para atril, grande para pared). 4) Añade tantas tarjetas como necesites. 5) Haz clic en imprimir y corta con tijeras o guillotina. Para mayor durabilidad, lamina las tarjetas con plastificadora o cúbrelas con celo ancho. Puedes añadirles velcro en la parte trasera para usarlas en tableros de comunicación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tamaño deben tener las tarjetas de comunicación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tamaño depende del uso: tarjetas pequeñas (5×5 cm o 6×6 cm) para atriles portátiles PECS, bolsillos o cuadernos de comunicación; tarjetas medianas (8×8 cm o 10×10 cm) para tableros de mesa; tarjetas grandes (15×15 cm o A5) para paredes, neveras o tableros murales en el aula. Para personas con dificultades motoras o visuales se recomiendan tarjetas más grandes y con letras grandes. Lo más importante es la consistencia: usa siempre el mismo tamaño para el mismo contexto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué es importante el texto bajo el pictograma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El texto bajo el pictograma es fundamental por varias razones: facilita la generalización (la persona asocia el símbolo con la palabra escrita, apoyando la lectura funcional); permite que cualquier adulto entienda la tarjeta sin necesidad de conocer el sistema de pictogramas; ayuda a personas con dislexia que pueden reconocer la palabra global aunque tengan dificultad con la decodificación letra a letra; y facilita que la persona señale la tarjeta y el interlocutor pueda leer en voz alta la palabra, modelando el lenguaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas tarjetas de comunicación necesita una persona con autismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del nivel de comunicación y la fase del programa. Se empieza con pocas tarjetas muy motivadoras (objetos preferidos, personas del entorno cercano): unas 10-20. Progresivamente se amplía el vocabulario funcional: acciones cotidianas, emociones básicas, alimentos, lugares frecuentes, hasta llegar a un vocabulario funcional de 50-200 tarjetas. El vocabulario básico de la AAC suele incluir 200-300 palabras de alta frecuencia que cubren la mayoría de las necesidades comunicativas del día a día.',
      },
    },
  ],
};
