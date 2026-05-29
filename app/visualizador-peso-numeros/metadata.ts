import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Peso de los Números - Escalas Numéricas Visuales | meskeIA',
  description: 'Visualiza qué significa realmente un millón, un billón o la deuda pública. Comparaciones visuales que hacen tangibles cifras abstractas.',
  keywords: 'escalas numéricas, un millón, un billón, deuda pública, comparaciones, perspectiva numérica, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Peso de los Números',
    description: '¿Qué significa realmente un billón? Comparaciones que hacen tangibles las grandes cifras.',
    url: 'https://meskeia.com/visualizador-peso-numeros/',
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
    title: 'El Peso de los Números',
    description: 'Escalas numéricas que desafían la intuición: de un euro a un billón.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Peso Números meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Peso de los Números',
  description: 'Explicador visual de escalas numéricas: qué significa un millón, mil millones, un billón. Comparaciones con objetos cotidianos, PIB, deuda pública y salarios que hacen tangibles cifras abstractas.',
  url: 'https://meskeia.com/visualizador-peso-numeros/',
  features: [
    'Escalas de 1 € a 1 billón € visualizadas',
    'Comparaciones con objetos y conceptos cotidianos',
    'Visualización de la deuda pública española',
    'Cuánto tardarías en contar cada cifra',
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
      name: '¿Cuánto es realmente un billón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un billón es un millón de millones, es decir, 1.000.000.000.000. Para entenderlo: si ganaras 1.000 € al día, tardarías más de 2.700 años en acumular un billón de euros. Es la escala que suelen manejar los presupuestos nacionales de grandes economías y la deuda pública de países como España.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un millón y mil millones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mil millones es 1.000 veces más grande que un millón. Si un millón de segundos equivale a unos 11,5 días, mil millones de segundos son casi 32 años. Esta diferencia es habitualmente subestimada porque el cerebro humano no procesa bien las diferencias entre cifras muy grandes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve visualizar escalas numéricas grandes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las comparaciones visuales ayudan a dar contexto a cifras que aparecen en noticias económicas: deuda pública, recortes presupuestarios, beneficios empresariales o patrimonio de las personas más ricas. Convertir cifras abstractas en tiempo, distancia u objetos cotidianos activa la intuición y facilita el pensamiento crítico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tardarías en contar hasta un millón en voz alta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Contando un número por segundo sin pausas, llegar a un millón tomaría aproximadamente 11 días y medio. Contar hasta mil millones llevaría unos 32 años, y hasta un billón unos 31.700 años. Estas estimaciones asumen conteo continuo ininterrumpido, sin dormir ni descansar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la deuda pública de España en perspectiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La deuda pública española supera el billón de euros, lo que equivale a más de 20.000 € por cada habitante del país. Representada en billetes de 100 € apilados, alcanzaría una altura de varios miles de kilómetros. El visualizador ofrece comparaciones de este tipo para que la magnitud sea comprensible.',
      },
    },
  ],
};
