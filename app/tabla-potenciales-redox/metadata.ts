import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Potenciales Redox Estándar — E° con Calculadora de Pilas | meskeIA',
  description:
    'Tabla de potenciales estándar de reducción (E°) con buscador: 69 semirreacciones equilibradas a 25 °C y 1 M, serie de actividad de los metales y constructor de pilas que calcula E°pila, ΔG°, K, la reacción global y la notación de pila.',
  keywords:
    'tabla de potenciales redox, potenciales estándar de reducción, E0, serie electroquímica, serie de actividad de los metales, celda galvánica, pila Daniell, electroquímica, permanganato, dicromato, notación de pila, reacción espontánea, constante de equilibrio redox, química general',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-potenciales-redox/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Potenciales Redox Estándar con Calculadora de Pilas | meskeIA',
    description:
      'Consulta cualquier E° en segundos y combina dos semirreacciones: la app dice quién se oxida, quién se reduce, si la reacción es espontánea y escribe la ecuación global ajustada.',
    url: 'https://meskeia.com/tabla-potenciales-redox/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabla de Potenciales Redox Estándar con Calculadora de Pilas | meskeIA',
    description:
      'Potenciales estándar de reducción con buscador, serie de actividad de los metales y constructor de pilas con E°pila, ΔG° y constante de equilibrio.',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Potenciales Redox meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Potenciales Redox Estándar (E°)',
  description:
    'Tabla de 69 potenciales estándar de reducción medidos a 25 °C, 1 M y 1 atm frente al electrodo estándar de hidrógeno, con las semirreacciones equilibradas en masa y carga, la serie de actividad de los metales y un constructor de pilas que combina dos semirreacciones, calcula E°pila, indica qué especie se oxida y cuál se reduce, escribe la reacción global ajustada y la notación de pila, y obtiene la energía libre estándar y la constante de equilibrio.',
  url: 'https://meskeia.com/tabla-potenciales-redox/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo por especie, nombre del par y sinónimos, tolerante a acentos',
    '69 semirreacciones equilibradas en masa y carga, ordenadas de mayor a menor E°',
    'Constructor de pilas: E°pila = E°cátodo − E°ánodo con diagnóstico de espontaneidad',
    'Reacción global ajustada igualando electrones y notación de pila completa',
    'Cálculo de la energía libre estándar ΔG° = −n·F·E° y de la constante de equilibrio K',
    'Serie de actividad de los metales derivada de la propia tabla',
    'Aplicación real de cada par: corrosión, protección catódica, valoraciones, baterías',
    'Funciona 100 % en el navegador, sin registro ni instalación',
  ],
  keywords: [
    'potenciales redox',
    'potencial estándar de reducción',
    'celda galvánica',
    'serie electroquímica',
    'electroquímica',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el potencial de una pila a partir de la tabla de potenciales redox?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se restan los dos potenciales estándar de reducción: E°pila = E°cátodo − E°ánodo, donde el cátodo es la semirreacción con el E° más alto y el ánodo la del E° más bajo. Por ejemplo, con Cu²⁺/Cu (+0,34 V) y Zn²⁺/Zn (−0,76 V) resulta E°pila = 0,34 − (−0,76) = +1,10 V, el valor clásico de la pila Daniell. Si el resultado es positivo la reacción es espontánea tal como está planteada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay que multiplicar E° al ajustar los coeficientes de una semirreacción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. El potencial estándar es una propiedad intensiva: no depende de la cantidad de sustancia, así que al multiplicar la semirreacción por 2 o por 3 el valor de E° se mantiene igual. Lo que sí se multiplica es el número de electrones n, y eso afecta a ΔG° = −n·F·E°, que sí es extensivo. Es el error más repetido en los ejercicios de electroquímica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el potencial del hidrógeno vale exactamente 0,00 V?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque es un convenio, no una medida. Un potencial absoluto de un solo electrodo no se puede medir: solo se mide la diferencia entre dos. Por eso se elige el electrodo estándar de hidrógeno (2H⁺ 1 M + 2e⁻ → H₂ a 1 atm y 25 °C) como cero de la escala, y todos los demás valores de la tabla son diferencias respecto de él.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa que un par tenga un potencial estándar muy negativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Que su forma reducida es un reductor potente y cede electrones con facilidad. El litio, con E° = −3,04 V, es el reductor más fuerte de la tabla, y por eso las baterías de litio alcanzan voltajes altos. Los metales con E° negativo desplazan al hidrógeno de los ácidos y se corroen con facilidad; los de E° positivo, como la plata o el oro, resisten mucho mejor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el zinc protege al hierro de la corrosión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque el par Zn²⁺/Zn tiene E° = −0,76 V, más negativo que el del Fe²⁺/Fe (−0,44 V), así que el zinc se oxida antes y actúa como ánodo de sacrificio. En una pieza galvanizada el recubrimiento se corroe en lugar del acero, y la protección sigue funcionando aunque la capa se raye. Es el mismo principio de los ánodos de zinc o de magnesio en cascos de barcos y calentadores de agua.',
      },
    },
  ],
};
