import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador del Impuesto de Donaciones 2025 | meskeIA',
  description: 'Estima el Impuesto de Donaciones en las 17 comunidades autónomas de España. Régimen común, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.',
  keywords: 'impuesto donaciones, ISD donaciones 2025, calculadora donaciones, donaciones CCAA España, estimador donaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador del Impuesto de Donaciones 2025 — meskeIA',
    description: 'Estima el impuesto que pagas al recibir una donación en cualquier CCAA de España.',
    url: 'https://meskeia.com/estimador-impuesto-donaciones/',
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
    title: 'Estimador del Impuesto de Donaciones 2025',
    description: 'Estima el ISD donaciones en las 17 comunidades autónomas. Orientación fiscal antes de acudir al asesor.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Impuesto de Donaciones",
  description: "Estima el Impuesto de Donaciones en las 17 comunidades autónomas de España. Régimen común, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.",
  url: "https://meskeia.com/estimador-impuesto-donaciones/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Impuesto de Donaciones y cuándo se paga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impuesto de Donaciones (ISD, modalidad inter vivos) es un tributo que paga quien recibe una donación de dinero, inmuebles u otros bienes. Se devenga en el momento de la donación y el plazo general de autoliquidación es de 30 días hábiles desde el día siguiente (art. 67.1.b del Reglamento del impuesto), salvo que la comunidad fije otro. Si se dona un inmueble, tributa en la comunidad donde está situado; si se dona dinero u otros bienes, en la de residencia habitual de quien recibe.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga por recibir una donación de dinero de los padres?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la comunidad autónoma, porque cada una bonifica un porcentaje distinto de la cuota. Con 100.000 € de un padre a un hijo, la tarifa estatal da 12.415,36 € de cuota; con una bonificación del 99 % quedan 124,15 €, y sin bonificación se paga entera. En las donaciones no se aplican las reducciones estatales por parentesco, que son solo de las herencias. El parentesco, el patrimonio previo y el valor de la donación también determinan la cuota final.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es lo mismo el Impuesto de Donaciones que el Impuesto de Sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, aunque forman parte del mismo tributo (ISD). El Impuesto de Sucesiones grava las transmisiones por causa de muerte (herencias y legados), mientras que el Impuesto de Donaciones grava las transmisiones en vida (inter vivos). Comparten la tarifa estatal, pero las reducciones estatales por parentesco y discapacidad solo se aplican a las herencias (art. 20 de la Ley 29/1987), y cada comunidad puede fijar bonificaciones distintas para cada modalidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calcula el estimador el impuesto por comunidad autónoma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El estimador aplica la tarifa estatal según el valor neto recibido, el grupo de parentesco y el patrimonio preexistente del donatario, y luego incorpora los coeficientes multiplicadores y las bonificaciones autonómicas vigentes para 2025. Cubre las 15 comunidades de régimen común, incluida Cataluña con su tarifa propia, y da una aproximación para los regímenes forales del País Vasco y Navarra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo no hay que pagar el Impuesto de Donaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La obligación de declarar existe siempre, pero la cuota puede ser cero o mínima cuando la comunidad aplica una bonificación del 99 % o del 100 % a los grupos I y II de parentesco (hijos, cónyuge, padres), o una exención por importe. A diferencia de las herencias, en las donaciones no hay reducciones estatales por parentesco que dejen exentas las cantidades pequeñas. Las donaciones de una empresa familiar tienen reducciones especiales, estatales y autonómicas, que esta estimación no calcula: exigen valorar la empresa y comprobar requisitos con su documentación. Consultar siempre con un asesor fiscal antes de formalizar la donación.',
      },
    },
  ],
};
