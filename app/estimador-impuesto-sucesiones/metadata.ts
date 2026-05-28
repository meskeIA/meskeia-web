import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador del Impuesto de Sucesiones 2025 | meskeIA',
  description: 'Estima el Impuesto de Sucesiones (ISD) en las 17 comunidades autónomas de España. Tarifa estatal, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.',
  keywords: 'impuesto sucesiones, herencias España, ISD 2025, calculadora sucesiones, CCAA sucesiones, estimador herencias',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador del Impuesto de Sucesiones 2025 — meskeIA',
    description: 'Estima el ISD en las 17 CCAA de España antes de hablar con tu asesor fiscal.',
    url: 'https://meskeia.com/estimador-impuesto-sucesiones/',
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
    title: 'Estimador del Impuesto de Sucesiones 2025',
    description: 'Estima el ISD en las 17 comunidades autónomas. Orientación fiscal antes de acudir al asesor.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Impuesto de Sucesiones",
  description: "Estima el Impuesto de Sucesiones (ISD) en las 17 comunidades autónomas de España. Tarifa estatal, Cataluña, País Vasco y Navarra. Orientación antes de hablar con tu asesor fiscal.",
  url: "https://meskeia.com/estimador-impuesto-sucesiones/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el Impuesto de Sucesiones y quién debe pagarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Impuesto sobre Sucesiones y Donaciones (ISD) es un tributo que grava la adquisición de bienes y derechos por herencia o legado. Lo paga el heredero o legatario, no el fallecido. En España, la gestión corresponde a las comunidades autónomas, que tienen amplias competencias para establecer bonificaciones y reducciones propias, por lo que la cuota puede variar enormemente según dónde resida el fallecido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto se paga por el Impuesto de Sucesiones en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuota depende de cuatro factores: el valor neto heredado, el grado de parentesco, el patrimonio previo del heredero y la comunidad autónoma. La tarifa estatal oscila entre el 7,65 % para los primeros tramos y el 34 % para importes superiores a 797.555 €. Sin embargo, comunidades como Madrid o Andalucía aplican una bonificación del 99 % para cónyuge e hijos directos, reduciendo la cuota a casi cero; Cataluña o Asturias son significativamente más gravosas para los mismos casos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué reducciones existen por parentesco en el Impuesto de Sucesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La normativa estatal establece cuatro grupos de parentesco. El Grupo I (descendientes menores de 21 años) tiene una reducción base de 15.956,87 € más 3.990,72 € por cada año por debajo de 21. El Grupo II (cónyuge, hijos y padres mayores de 21) tiene 15.956,87 €. El Grupo III (hermanos, tíos, sobrinos) tiene 7.993,46 €. El Grupo IV (extraños) no tiene reducción estatal. Muchas CCAA mejoran estas reducciones de forma notable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo hay que pagar el Impuesto de Sucesiones y en qué plazo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plazo general para presentar y liquidar el impuesto es de 6 meses desde el fallecimiento. Puede solicitarse una prórroga de otros 6 meses antes de que venza el primer plazo, aunque en ese caso se aplican intereses de demora por los meses adicionales. Pasado el plazo sin presentar la declaración, la Administración puede iniciar un expediente sancionador además de liquidar recargos e intereses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué comunidad autónoma se paga el Impuesto de Sucesiones, la del fallecido o la del heredero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El impuesto se liquida en la comunidad autónoma donde el causante (fallecido) tenía su residencia habitual durante los cinco años anteriores a su muerte, concretamente en la CCAA donde haya residido más tiempo en ese período. No es relevante dónde viva el heredero. Esto es importante porque la diferencia de cuota entre comunidades puede ser muy elevada para el mismo patrimonio heredado.',
      },
    },
  ],
};
