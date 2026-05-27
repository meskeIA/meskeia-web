import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador Interés Compuesto - Simula tu Inversión | meskeIA',
  description: 'Calcula el interés compuesto de tus inversiones. Simula el crecimiento de tu capital con aportaciones periódicas y visualiza la evolución año a año.',
  keywords: 'interés compuesto, calculadora inversión, simulador ahorro, rentabilidad, capital final, aportaciones periódicas, fórmula interés compuesto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Interés Compuesto | meskeIA',
    description: 'Simula el crecimiento de tu inversión con interés compuesto.',
    url: 'https://meskeia.com/estimador-interes-compuesto/',
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
    title: 'Estimador Interés Compuesto | meskeIA',
    description: 'Calcula cuánto crecerá tu dinero con el poder del interés compuesto.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el interés compuesto y en qué se diferencia del interés simple?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con el interés simple, los intereses generados no se reinvierten: siempre se calculan sobre el capital inicial. Con el interés compuesto, los intereses de cada período se suman al capital y generan a su vez nuevos intereses. Esto crea un efecto exponencial: con una inversión de 10.000 € al 6% anual durante 20 años, el interés simple produce 12.000 € de intereses, mientras que el compuesto genera cerca de 22.000 €.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la regla del 72 y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla del 72 es una aproximación rápida para calcular el tiempo que tarda una inversión en duplicarse. Basta con dividir 72 entre la tasa de rentabilidad anual: a un 6% anual, el capital se duplica en aproximadamente 72 / 6 = 12 años. A un 9%, en 8 años. Es una estimación válida para tasas entre el 2% y el 15%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afectan las aportaciones periódicas al interés compuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las aportaciones periódicas aceleran enormemente el crecimiento. Añadir 200 € al mes durante 20 años a una inversión inicial de 10.000 € con un 6% anual produce un capital final de aprox. 115.000 € frente a los 32.000 € sin aportaciones. Cuanto más temprano se empiezan las aportaciones, mayor es el efecto del tiempo sobre el resultado final.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre capitalización mensual y anual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La capitalización indica con qué frecuencia se acumulan los intereses. Con capitalización mensual, cada mes se acumulan los intereses al capital y el siguiente mes generan nuevos intereses. Esto produce un rendimiento algo superior a la capitalización anual con el mismo tipo nominal. A un 6% nominal, la capitalización mensual equivale a un 6,17% efectivo anual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo se necesita para acumular un millón de euros ahorrando mensualmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del capital inicial, la aportación mensual y la rentabilidad. Con 0 € inicial, 500 €/mes y un 7% anual, se tarda aproximadamente 35 años. Con 1.000 €/mes al mismo rendimiento, el plazo se reduce a unos 25 años. Comenzar antes y mantener la constancia tiene más impacto que buscar rendimientos más altos asumiendo mayor riesgo.',
      },
    },
  ],
};
