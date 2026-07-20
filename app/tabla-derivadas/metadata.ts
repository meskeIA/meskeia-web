import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tabla de Derivadas Completa — Todas las Fórmulas con Ejemplos | meskeIA',
  description:
    'Tabla de derivadas con buscador instantáneo: potencias, raíces, exponenciales, logaritmos, trigonométricas, inversas, hiperbólicas y reglas de derivación, con regla de la cadena y ejemplos.',
  keywords:
    'tabla de derivadas, derivadas, formulario de derivadas, tabla derivadas completa, regla de la cadena, derivada del seno, derivada del logaritmo, derivada arctan, reglas de derivación, cálculo diferencial, matemáticas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-derivadas/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla de Derivadas Completa con Buscador | meskeIA',
    description:
      'Consulta cualquier derivada en segundos: escribe «ln», «raíz» o «arctan» y la fórmula aparece, con su versión con regla de la cadena y un ejemplo resuelto.',
    url: 'https://meskeia.com/tabla-derivadas/',
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
    title: 'Tabla de Derivadas Completa con Buscador | meskeIA',
    description:
      'Formulario de derivadas con búsqueda instantánea, dominios de validez y ejemplos resueltos paso a paso.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tabla de Derivadas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tabla de Derivadas',
  description:
    'Formulario de consulta rápida con 38 derivadas: constantes y potencias, raíces, exponenciales y logarítmicas, trigonométricas, trigonométricas inversas, hiperbólicas y reglas de derivación. Cada fórmula incluye su versión con la regla de la cadena, las condiciones de validez y un ejemplo resuelto paso a paso.',
  url: 'https://meskeia.com/tabla-derivadas/',
  category: 'EducationalApplication',
  features: [
    'Buscador instantáneo por nombre, expresión y sinónimos, tolerante a acentos',
    '38 fórmulas organizadas en 7 categorías filtrables',
    'Versión con regla de la cadena (u′) en cada fórmula elemental',
    'Dominios y condiciones de validez indicados fórmula a fórmula',
    'Demostración breve y ejemplo resuelto en cada fila desplegable',
    'Reglas de derivación: suma, producto, cociente, cadena, inversa, implícita y logarítmica',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
  keywords: ['tabla de derivadas', 'derivadas', 'regla de la cadena', 'cálculo diferencial'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la derivada de sen x, cos x y tg x?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La derivada de sen x es cos x; la de cos x es −sen x (con signo negativo); y la de tg x es 1/cos²x, que también se escribe como 1 + tg²x. Con la regla de la cadena, si u = u(x), quedan cos u·u′, −sen u·u′ y u′/cos²u respectivamente. Estas fórmulas solo son válidas si el ángulo se mide en radianes: en grados aparecería un factor π/180.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la derivada de un producto no es el producto de las derivadas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque al variar x cambian los dos factores a la vez y el resultado recoge ambas contribuciones: (f·g)′ = f′·g + f·g′. La comprobación es inmediata con f = g = x: el atajo incorrecto daría 1·1 = 1, cuando la derivada de x² es 2x. La regla correcta devuelve 1·x + x·1 = 2x.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la derivada de arctan x y de arcsen x?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La derivada de arctg x es 1/(1 + x²) y es válida para cualquier número real, porque 1 + x² nunca se anula. La de arcsen x es 1/√(1 − x²) y solo tiene sentido si |x| < 1: en x = ±1 la tangente es vertical y la derivada no existe. La de arccos x es la misma con signo negativo, −1/√(1 − x²).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo una función no es derivable en un punto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En tres casos típicos: cuando hay un pico o esquina y las pendientes laterales no coinciden (por ejemplo |x| en x = 0), cuando la tangente es vertical (√x en x = 0) y cuando la función no es continua en ese punto. Toda función derivable es continua, pero lo contrario no se cumple: la continuidad es necesaria y no suficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué derivadas hay que memorizar y cuáles se pueden consultar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conviene tener automatizadas las de potencia, exponencial, logaritmo, seno y coseno, junto con las cuatro reglas básicas (suma, producto, cociente y cadena): con ellas se deducen casi todas las demás. Las trigonométricas inversas y las hiperbólicas suelen consultarse en un formulario, que es exactamente el uso de una tabla de derivadas como esta.',
      },
    },
  ],
};
