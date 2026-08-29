import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Horas y Minutos - Sumar y Restar Tiempos | meskeIA',
  description:
    'Suma y resta horas y minutos, convierte 7:45 en 7,75 horas decimales y calcula el total de una semana de trabajo con sus pausas. Sin registro y en tu navegador.',
  keywords:
    'calculadora de horas, sumar horas, restar horas, calculadora de horas y minutos, horas a decimal, convertir horas decimales, contador de horas, calcular horas trabajadas, suma de horas, parte de horas semanal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Horas y Minutos',
    description:
      'Suma y resta tiempos en formato horas:minutos, pásalos a decimal para facturar y calcula el total semanal con pausas.',
    url: 'https://meskeia.com/calculadora-horas',
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
    title: 'Calculadora de Horas y Minutos',
    description: 'Sumar y restar horas sin equivocarte con el sistema sexagesimal.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Horas meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Horas y Minutos',
  description:
    'Calculadora de tiempo que suma y resta cantidades en horas y minutos, convierte entre formato sexagesimal (7:45) y decimal (7,75) y calcula el total de horas de una semana descontando las pausas. Pensada para partes de horas, facturación por horas y control de tiempo personal.',
  url: 'https://meskeia.com/calculadora-horas/',
  category: 'UtilityApplication',
  features: [
    'Suma y resta de tiempos con signo, mezclando formato 7:45 y 7,75',
    'Conversión instantánea entre horas:minutos y horas decimales',
    'Duración entre dos horas con cruce de medianoche y descuento de pausa',
    'Parte de horas semanal con entrada, salida y pausa por día',
    'Comparación del total semanal con la jornada pactada',
    'Resultados en formato español, con coma decimal',
    'El parte semanal se guarda solo en tu navegador',
    'Funciona sin registro, sin instalación y sin conexión una vez cargada',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se suman horas y minutos correctamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo se cuenta en base sesenta, no en base diez: 45 minutos más 30 minutos son 75 minutos, es decir 1 hora y 15 minutos, no 1,75. La forma segura de sumar es convertir cada cantidad a minutos, sumarlos todos y volver a repartir el total en horas y minutos dividiendo entre sesenta. Ese es exactamente el cálculo que hace esta herramienta, y por eso el resultado nunca arrastra el error típico de sumar los minutos como si fueran decimales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto es 7:45 en horas decimales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son 7,75 horas. Los minutos se dividen entre sesenta: 45 ÷ 60 = 0,75. Las equivalencias que más se repiten son 15 minutos = 0,25 h, 20 minutos = 0,33 h, 30 minutos = 0,5 h, 40 minutos = 0,67 h y 45 minutos = 0,75 h. Esta conversión es la que hace falta al facturar, porque una tarifa por hora se multiplica por el valor decimal, nunca por el 7,45 que aparece escrito.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo las horas trabajadas si el turno pasa de medianoche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando la hora de salida es menor que la de entrada, el turno cruza a la madrugada del día siguiente y hay que sumar veinticuatro horas a la salida antes de restar. Un turno de 22:00 a 06:00 dura 8 horas, no menos ocho. La calculadora detecta ese caso sola y lo avisa, así que basta con introducir las dos horas tal cual figuran en el cuadrante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un parte de horas semanal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sirve para saber cuántas horas efectivas se han trabajado en la semana una vez descontadas las pausas, y para compararlas con la jornada pactada. Es útil tanto para quien factura por horas a varios clientes como para quien quiere contrastar su cuadrante con lo que marca su contrato. El resultado es un cálculo aritmético: no sustituye al registro horario oficial de la empresa ni interpreta el convenio aplicable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia de un cronómetro o de una hoja de cálculo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un cronómetro mide tiempo que transcurre ahora; aquí se opera con cantidades ya conocidas, apuntadas en un cuadrante o en una hoja. Frente a una hoja de cálculo, la diferencia está en que no hay que acordarse de formatear las celdas como hora ni de multiplicar por veinticuatro para pasar a decimal: se pueden mezclar entradas escritas como 7:45 y como 7,75 en la misma lista y el total sale bien en los dos formatos a la vez.',
      },
    },
  ],
};
