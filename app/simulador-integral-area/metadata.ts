import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Integrales: Área bajo la Curva | meskeIA',
  description: 'Visualiza la integral definida como sumas de Riemann interactivas. Ajusta el número de rectángulos n, los límites a y b, y compara izquierda, derecha, punto medio y trapecio con el valor exacto.',
  keywords: 'integral definida, suma de Riemann, área bajo la curva, integración numérica, regla del trapecio, punto medio, primitiva, teorema fundamental del cálculo, EBAU, Bachillerato, preparatoria, secundaria, cálculo integral',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-integral-area/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Integrales: Área bajo la Curva | meskeIA',
    description: 'Aproxima la integral definida con sumas de Riemann interactivas. Ajusta n, a y b, compara 4 métodos con el valor exacto.',
    url: 'https://meskeia.com/simulador-integral-area/',
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
    title: 'Simulador de Integrales: Área bajo la Curva | meskeIA',
    description: 'Visualiza la integral como suma de áreas de rectángulos cada vez más finos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Integrales: Área bajo la Curva',
  description: 'Simulador interactivo de la integral definida usando sumas de Riemann. Permite seleccionar entre 8 funciones (cuadrática, cúbica, parábola desplazada, seno, coseno, exponencial, hipérbola y gaussiana), ajustar los límites de integración a y b, el número de rectángulos n y comparar 4 métodos numéricos: izquierda, derecha, punto medio y trapecio. Muestra el valor exacto cuando hay primitiva analítica y calcula error absoluto y relativo. Ideal para entender el concepto de integral como límite de sumas y el teorema fundamental del cálculo.',
  url: 'https://meskeia.com/simulador-integral-area/',
  category: 'EducationalApplication',
  features: [
    '8 funciones predefinidas con primitiva analítica conocida',
    '4 métodos de aproximación: izquierda, derecha, punto medio, trapecio',
    'Ajuste interactivo de los límites a y b mediante sliders',
    'Hasta 500 rectángulos con visualización en tiempo real',
    'Comparación con el valor exacto (cuando hay primitiva elemental)',
    'Cálculo de error absoluto y relativo de la aproximación',
    'Distinción visual entre áreas positivas y negativas',
  ],
  keywords: ['integral definida', 'suma de Riemann', 'área', 'cálculo integral', 'trapecio', 'punto medio', 'EBAU', 'Bachillerato', 'preparatoria', 'secundaria'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la integral definida y qué representa geométricamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La integral definida ∫[a,b] f(x) dx representa el área neta entre la curva f(x) y el eje horizontal en el intervalo [a, b]. Las zonas donde f(x) > 0 contribuyen con área positiva y las zonas donde f(x) < 0 con área negativa, por lo que el resultado puede ser menor que el área geométrica total. Es uno de los conceptos fundamentales del cálculo, con aplicaciones en física (trabajo, desplazamiento), economía (excedentes) y probabilidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una suma de Riemann y cómo se relaciona con la integral?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una suma de Riemann aproxima el área bajo la curva dividiendo el intervalo [a, b] en n subintervalos y sumando las áreas de n rectángulos, cada uno con base igual al ancho del subintervalo y altura determinada por el valor de f en un punto de ese subintervalo. La integral definida se define formalmente como el límite de esta suma cuando n tiende a infinito y el ancho de los rectángulos tiende a cero.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre los métodos del punto medio, trapecio e izquierda/derecha?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los métodos de izquierda y derecha usan el valor de f en el extremo izquierdo o derecho de cada subintervalo como altura del rectángulo. El método del punto medio usa el valor central, lo que suele dar mejor aproximación. La regla del trapecio usa la media de los dos extremos, formando trapecios en lugar de rectángulos. Con el mismo número de subintervalos n, la regla del trapecio y el punto medio son generalmente más precisos que izquierda/derecha.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Teorema Fundamental del Cálculo y cómo conecta derivadas e integrales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Teorema Fundamental del Cálculo establece que la derivación y la integración son operaciones inversas. En su forma práctica dice que ∫[a,b] f(x) dx = F(b) - F(a), donde F es cualquier primitiva de f. Esto permite calcular integrales definidas de forma exacta sin recurrir a sumas de Riemann, simplemente hallando una primitiva y evaluándola en los límites. Es la razón por la que este simulador puede mostrar el "valor exacto" para las funciones con primitiva elemental conocida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el área bajo la curva puede ser negativa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La integral definida suma las contribuciones de cada pequeño rectángulo con signo: si f(x) es positiva el rectángulo aporta área positiva; si f(x) es negativa, negativa. Por eso una función que esté por debajo del eje en parte del intervalo produce una integral cuyo valor absoluto es menor que el área geométrica total. Si se quiere el área geométrica sin signo, hay que integrar |f(x)| o partir el intervalo en los ceros de la función.',
      },
    },
  ],
};
