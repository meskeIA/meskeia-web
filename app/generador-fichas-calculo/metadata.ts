import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Fichas de Cálculo para Imprimir | meskeIA',
  description:
    'Crea fichas de sumas, restas, multiplicaciones y divisiones para imprimir. Cinco niveles, con o sin llevadas, en columna u horizontal y hoja de soluciones incluida.',
  keywords:
    'generador fichas de calculo, ejercicios de matematicas para imprimir, fichas de sumas y restas, operaciones para imprimir, multiplicaciones para imprimir, divisiones para imprimir, cuentas para niños, hojas de calculo mental',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Fichas de Cálculo para Imprimir',
    description:
      'Sumas, restas, multiplicaciones y divisiones a medida: cinco niveles, control de llevadas y resto, y hoja de soluciones.',
    url: 'https://meskeia.com/generador-fichas-calculo',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Fichas de Cálculo para Imprimir',
    description: 'Operaciones a medida, con soluciones y listas para el papel.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Generador de Fichas de Cálculo meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Fichas de Cálculo',
  description:
    'Generador de fichas imprimibles de sumas, restas, multiplicaciones y divisiones con cinco niveles de dificultad, control de llevadas, división exacta o con resto, y presentación horizontal o en columna. Incluye hoja de soluciones.',
  url: 'https://meskeia.com/generador-fichas-calculo/',
  category: 'EducationalApplication',
  features: [
    'Cuatro operaciones combinables en la misma ficha',
    'Cinco niveles, desde números hasta 10 hasta cuatro cifras',
    'Control de llevadas en sumas y restas',
    'División exacta o con resto',
    'Presentación horizontal o en columna',
    'De 10 a 60 operaciones por ficha',
    'Hoja de soluciones que se activa y desactiva',
    'Número de ficha reproducible: la misma ficha para todo un grupo',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una llevada y por qué conviene poder desactivarla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hay llevada cuando la suma de dos cifras de una misma columna pasa de nueve y obliga a arrastrar una unidad a la columna siguiente; en la resta ocurre lo simétrico, cuando hay que pedir prestado. Son dos destrezas distintas, así que al empezar conviene practicar sin llevadas para automatizar la colocación y después activarlas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas operaciones debe tener una ficha?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para práctica diaria funcionan mejor entre veinte y treinta operaciones, que se resuelven en diez o quince minutos y permiten mantener la atención. Las fichas de cincuenta o sesenta tienen sentido como prueba de velocidad de cálculo cronometrada, no como tarea de aprendizaje: al final de una hoja larga los fallos son de cansancio, no de concepto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la presentación horizontal y en columna?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La presentación horizontal entrena el cálculo mental, porque obliga a operar sin apoyo visual. La disposición en columna entrena el algoritmo escrito: alinear unidades con unidades, decenas con decenas y gestionar las llevadas. Son objetivos distintos y conviene alternarlos en lugar de elegir uno solo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo imprimir la misma ficha varias veces?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Cada ficha lleva un número que actúa como semilla del generador: introduciéndolo de nuevo con los mismos ajustes se obtienen exactamente las mismas operaciones. Es lo que permite repartir una hoja idéntica a todo un grupo y corregir después con una única plantilla de soluciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las divisiones salen siempre exactas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se puede elegir. En modo exacto el dividendo se construye multiplicando divisor por cociente, de forma que el resto siempre es cero, que es lo adecuado cuando se está introduciendo el concepto. Al activar el resto se añade un valor menor que el divisor y la solución muestra cociente y resto por separado.',
      },
    },
  ],
};
