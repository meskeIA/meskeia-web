/**
 * Metadata para Calculadora de Fechas - meskeIA
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Fechas y Días Hábiles | Diferencia y Edad - meskeIA',
  description:
    'Calcula la diferencia entre dos fechas en días naturales y en días laborables, con tus propios festivos. Suma y resta días, edad exacta y día de la semana, en español.',
  keywords: [
    'calculadora fechas',
    'diferencia entre fechas',
    'días hábiles',
    'calcular días hábiles',
    'días laborables entre fechas',
    'contador de días hábiles',
    'calcular edad',
    'sumar días',
    'restar fechas',
    'día de la semana',
    'edad exacta',
    'calculadora temporal',
  ],
  openGraph: {
    title: 'Calculadora de Fechas y Días Hábiles | meskeIA',
    description:
      'Diferencia entre fechas en días naturales y laborables con tus festivos, suma y resta de días, edad exacta y día de la semana',
    type: 'website',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

// Schema.org JSON-LD para SEO
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Fechas',
  description:
    'Herramienta online gratuita para calcular diferencias entre fechas, edades, sumar o restar días y determinar días de la semana',
  url: 'https://meskeia.com/calculadora-fechas/',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Any',
  featureList: [
    'Diferencia exacta entre dos fechas en días, semanas, meses y años',
    'Días laborables entre dos fechas, descontando sábados, domingos y tus festivos',
    'Lista de festivos propios guardada en el navegador y reutilizable en cada cálculo',
    'Suma y resta de días, semanas, meses o años a una fecha',
    'Día de la semana de cualquier fecha desde 1900',
    'Cálculo de edad exacta en años, meses y días',
    'Próximo cumpleaños con días restantes',
    'Compatible con años bisiestos y meses irregulares',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  creator: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};

// Schema.org FAQ
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo calculo la diferencia entre dos fechas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Selecciona la fecha inicial y la fecha final en la primera calculadora. La herramienta te mostrará la diferencia en días, semanas, meses y años con precisión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo los días hábiles o laborables entre dos fechas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al calcular la diferencia aparecen dos cifras: los días naturales y los días laborables. Los laborables descuentan siempre sábados y domingos, y además los festivos que añadas en el bloque "Tus festivos", que quedan guardados en tu navegador para los siguientes cálculos. El criterio de conteo es el mismo que el de los días naturales: no se cuenta el día inicial y sí el final. Ten en cuenta que "día hábil" no significa lo mismo en el ámbito administrativo, en el laboral y en el judicial, así que conviene confirmar el criterio aplicable a cada trámite.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué tengo que añadir los festivos a mano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque los festivos dependen del país, de la región y del municipio: en España, por ejemplo, cada ayuntamiento fija dos días locales propios, de modo que no existe un único calendario válido para todo el mundo. Añadiéndolos una vez al empezar el año, el recuento de días laborables ya los descuenta en todos tus cálculos posteriores sin volver a tocarlos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La calculadora considera los años bisiestos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, nuestra calculadora tiene en cuenta los años bisiestos, los diferentes días de cada mes y proporciona cálculos precisos considerando el calendario gregoriano actual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo calcular fechas futuras?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por supuesto. Puedes sumar días, semanas, meses o años a cualquier fecha base para obtener una fecha futura. También puedes restar tiempo para obtener fechas pasadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé qué día de la semana fue una fecha histórica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Usa la calculadora "Día de la semana" e introduce cualquier fecha desde 1900. Te dirá exactamente qué día de la semana fue y cuánto tiempo ha pasado desde entonces.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La calculadora de edad es precisa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Totalmente. La calculadora de edad proporciona la edad exacta en años, meses y días, además de información adicional como días totales vividos y días hasta el próximo cumpleaños.',
      },
    },
  ],
};

export const faqJsonLd = faqSchema;
