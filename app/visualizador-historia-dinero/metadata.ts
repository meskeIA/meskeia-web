import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Evolución del Dinero - Del Trueque al Bitcoin | meskeIA',
  description: 'Historia visual del dinero: del trueque a las criptomonedas. Conchas, monedas, billetes, tarjetas, euro digital. Timeline interactivo con datos por país.',
  keywords: 'evolución dinero, historia moneda, trueque, patrón oro, criptomonedas, euro digital, historia billetes, dinero digital, CBDC, cashless',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Evolución del Dinero - Del Trueque al Bitcoin',
    description: 'Timeline visual interactivo: cómo el dinero pasó de conchas y sal a criptomonedas y euros digitales.',
    url: 'https://meskeia.com/visualizador-historia-dinero/',
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
    title: 'La Evolución del Dinero - Del Trueque al Bitcoin',
    description: 'La historia del dinero explicada de forma visual: trueque, monedas, billetes, tarjetas y criptomonedas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Historia Dinero meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Evolución del Dinero - Del Trueque al Bitcoin',
  description: 'Explicador visual interactivo de la historia del dinero: desde el trueque y las primeras monedas hasta las criptomonedas y el euro digital. Timeline con eras clickables y comparativa de uso de efectivo por país.',
  url: 'https://meskeia.com/visualizador-historia-dinero/',
  features: [
    'Timeline visual interactivo de la historia del dinero',
    'Del trueque a las criptomonedas en 4 eras',
    'Comparativa de uso de efectivo por país (slider)',
    'Datos de ejemplo educativos, sin entrada del usuario',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuándo surgió el dinero como medio de pago y por qué sustituyó al trueque?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las primeras formas de dinero-mercancía (conchas, sal, ganado) surgieron hace unos 5.000 años en Mesopotamia. El trueque tenía un problema fundamental: requería una "doble coincidencia de necesidades", es decir, que cada parte tuviera exactamente lo que la otra quería. El dinero resolvió esto actuando como intermediario universal, depósito de valor y unidad de cuenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué fue el patrón oro y por qué se abandonó?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El patrón oro fue un sistema monetario vigente entre aprox. 1870 y 1971 en el que cada divisa estaba respaldada por una cantidad fija de oro. Su abandono fue gradual: la Gran Depresión de 1929 mostró su rigidez (impedía aumentar la oferta monetaria), y en 1971 Nixon suspendió la convertibilidad dólar-oro (el "Nixon Shock"), inaugurando el sistema de dinero fiat actual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre criptomonedas y dinero digital de banco central (CBDC)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las criptomonedas (Bitcoin, Ethereum) son descentralizadas: no las controla ningún Estado y funcionan sobre redes de bloques distribuidas. Las CBDC (Central Bank Digital Currencies), como el euro digital que estudia el BCE, son emitidas y respaldadas por el banco central, igual que los billetes físicos pero en formato digital. Las CBDC conservan la garantía estatal; las criptomonedas, no.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué algunos países están avanzando hacia una sociedad sin efectivo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Países como Suecia o Dinamarca tienen menos del 10% de pagos en efectivo. Los motivos incluyen la eficiencia de los pagos digitales, la reducción de economía sumergida y el menor coste de distribución de billetes. Sin embargo, este cambio plantea retos de exclusión financiera para personas mayores, no bancarizadas o sin acceso tecnológico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el euro digital y cuándo podría estar disponible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El euro digital es una versión electrónica del euro emitida directamente por el Banco Central Europeo, disponible para ciudadanos y empresas como complemento al efectivo físico. El BCE lanzó su fase de investigación en 2021 y en 2023 inició la fase de preparación. Según los plazos oficiales, podría estar disponible a partir de 2027-2028, aunque la decisión final de emisión no está tomada.',
      },
    },
  ],
};
