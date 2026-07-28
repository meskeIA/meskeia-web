import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Crucigramas Personalizados para Imprimir | meskeIA',
  description:
    'Crea un crucigrama con tus palabras y definiciones: el programa las entrelaza, numera las entradas y genera la hoja con horizontales, verticales y solución.',
  keywords:
    'generador de crucigramas, crucigrama personalizado, crucigrama para imprimir, crear crucigrama con mis palabras, crucigrama educativo, palabras cruzadas, crucigrama con definiciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Crucigramas Personalizados',
    description:
      'Escribe tus palabras con sus definiciones y obtén un crucigrama entrelazado, numerado y listo para imprimir con su solución.',
    url: 'https://meskeia.com/generador-crucigramas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Crucigramas Personalizados',
    description: 'Tus palabras, tus definiciones, tu crucigrama en papel.',
  },
  other: {
    'application-name': 'Generador de Crucigramas meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Generador de Crucigramas Personalizados',
  description:
    'Generador de crucigramas a partir de una lista propia de palabras con sus definiciones. Entrelaza las palabras buscando cruces válidos, numera automáticamente las entradas horizontales y verticales, y produce la rejilla imprimible junto con la hoja de definiciones y la solución.',
  url: 'https://meskeia.com/generador-crucigramas/',
  category: 'EducationalApplication',
  features: [
    'Palabras y definiciones propias, escritas por el usuario',
    'Entrelazado automático buscando el mejor cruce disponible',
    'Numeración estándar de entradas horizontales y verticales',
    'Aviso de las palabras que no han podido cruzarse',
    'Rejilla recortada al tamaño mínimo necesario',
    'Solución que se activa y desactiva antes de imprimir',
    'Número de crucigrama reproducible para repetir la misma disposición',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se escriben las palabras y las definiciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una por línea, con la palabra primero y la definición después separada por un signo igual o dos puntos: por ejemplo «MERCURIO = El planeta más cercano al Sol». La palabra se normaliza automáticamente a mayúsculas sin tildes ni espacios, y la definición se copia tal cual a la lista de horizontales o verticales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué algunas palabras no entran en el crucigrama?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque no comparten ninguna letra con las ya colocadas en una posición donde el cruce sea válido. En un crucigrama entrelazado, cada palabra nueva debe cruzarse con otra sin quedar pegada a una tercera. Las palabras con letras poco frecuentes o muy cortas son las que más veces se quedan fuera, y la app las lista en lugar de descartarlas en silencio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se numeran las casillas de un crucigrama?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se recorre la rejilla de arriba abajo y de izquierda a derecha, y se numera cada casilla donde empieza una palabra, ya sea horizontal o vertical. Si en una misma casilla arrancan una horizontal y una vertical, ambas comparten el número. Es la convención de todos los crucigramas publicados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas palabras conviene poner?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entre diez y quince funcionan bien: dan una rejilla compacta y entrelazada que cabe holgadamente en un folio. Por debajo de ocho el crucigrama queda desangelado y con pocos cruces; por encima de veinte crece mucho y aumenta la probabilidad de que varias palabras se queden sin colocar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve el número de crucigrama?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La disposición depende del orden en que se prueban los cruces, que se decide al azar a partir de ese número. Anotándolo y volviéndolo a introducir con la misma lista de palabras se obtiene exactamente la misma rejilla, lo que permite reimprimir la hoja o recuperar la solución de un crucigrama repartido semanas antes.',
      },
    },
  ],
};
